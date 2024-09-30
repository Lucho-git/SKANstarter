// src/routes/api/map-trails/load-map-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const TRAIL_DATA_RETENTION_DAYS = 30; // Adjust as needed

function summarizeExplain(explainResult: string) {
    const lines = explainResult.split('\n');
    const executionTime = lines.find(line => line.includes('Execution Time:'))?.match(/Execution Time: ([\d.]+) ms/);
    const planningTime = lines.find(line => line.includes('Planning Time:'))?.match(/Planning Time: ([\d.]+) ms/);
    const totalCost = lines[0].match(/cost=([\d.]+)\.\.([\d.]+)/);

    return {
        'Execution Time': executionTime ? parseFloat(executionTime[1]) : null,
        'Planning Time': planningTime ? parseFloat(planningTime[1]) : null,
        'Total Cost': totalCost ? parseFloat(totalCost[2]) : null
    };
}

export const POST: RequestHandler = async ({ locals, request }) => {
    try {
        const session = await locals.getSession();
        if (!session) {
            console.error('No session found');
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { masterMapId } = await request.json();
        if (!masterMapId) {
            console.error('No master_map_id provided');
            return json({ error: 'Master map ID is required' }, { status: 400 });
        }

        // Calculate retention timestamp in milliseconds
        const retentionTimestamp = Date.now() - TRAIL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000;

        // EXPLAIN for user trail data query
        // const { data: userExplain, error: userExplainError } = await locals.supabase
        //     .from("trail_data")
        //     .select("*")
        //     .eq("master_map_id", masterMapId)
        //     .eq("vehicle_id", userId)
        //     .gte("timestamp", retentionTimestamp)
        //     .order("timestamp", { ascending: true })
        //     .explain('analyze, buffers, format text');

        // let userExplainSummary = null;
        // if (userExplainError) {
        //     console.error('Error getting EXPLAIN for user query:', userExplainError);
        // } else {
        //     console.log('Full EXPLAIN for user query:', userExplain);
        //     userExplainSummary = summarizeExplain(userExplain);
        //     console.log('User query EXPLAIN summary:', userExplainSummary);
        // }

        // Actual user trail data query
        const { data: userTrailData, error: userError } = await locals.supabase
            .from("trail_data")
            .select("*")
            .eq("master_map_id", masterMapId)
            .eq("vehicle_id", userId)
            .gte("timestamp", retentionTimestamp)
            .order("timestamp", { ascending: true });

        if (userError) {
            console.error('Supabase error fetching user trail data:', userError);
            throw userError;
        }

        // EXPLAIN for other trail data query (RPC)
        // const { data: otherExplain, error: otherExplainError } = await locals.supabase
        //     .rpc('get_other_trail_data', {
        //         p_master_map_id: masterMapId,
        //         p_user_id: userId,
        //         p_retention_timestamp: retentionTimestamp
        //     })
        //     .explain('analyze, buffers, format text');

        // let otherExplainSummary = null;
        // if (otherExplainError) {
        //     console.error('Error getting EXPLAIN for other query:', otherExplainError);
        // } else {
        //     console.log('Full EXPLAIN for other query:', otherExplain);
        //     otherExplainSummary = summarizeExplain(otherExplain);
        //     console.log('Other query EXPLAIN summary:', otherExplainSummary);
        // }

        // Actual other trail data query
        const { data: otherTrailData, error: otherError } = await locals.supabase
            .rpc('get_other_trail_data', {
                p_master_map_id: masterMapId,
                p_user_id: userId,
                p_retention_timestamp: retentionTimestamp
            });

        if (otherError) {
            console.error('Supabase error fetching other trail data:', otherError);
            throw otherError;
        }

        const groupedUserTrailData = groupBy(userTrailData, "vehicle_id");
        const groupedOtherTrailData = groupBy(otherTrailData, "vehicle_id");

        return json({
            user: groupedUserTrailData,
            other: groupedOtherTrailData,
        });
    } catch (error) {
        console.error('Error fetching trail data:', error);
        return json({ error: 'An error occurred while fetching trail data' }, { status: 500 });
    }
};

function groupBy(array: any[], property: string) {
    return array.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}