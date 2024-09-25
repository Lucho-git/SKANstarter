// src/routes/api/map-trails/load-map-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const TRAIL_DATA_RETENTION_DAYS = 30; // Adjust as needed

function summarizeExplain(explainResult) {
    if (Array.isArray(explainResult) && explainResult.length > 0) {
        const plan = explainResult[0]['Plan'];
        return {
            'Execution Time': plan['Actual Total Time'],
            'Planning Time': explainResult[0]['Planning Time'],
            'Total Cost': plan['Total Cost'],
            'Plan Rows': plan['Plan Rows'],
            'Actual Rows': plan['Actual Rows'],
        };
    }
    return null;
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

        // EXPLAIN for distinct vehicle IDs query
        const { data: vehicleIdsExplain } = await locals.supabase
            .rpc('get_distinct_vehicles', { p_master_map_id: masterMapId })
            .explain({ analyze: true, verbose: true, format: 'json' });

        const vehicleIdsExplainSummary = summarizeExplain(vehicleIdsExplain);
        console.log('EXPLAIN for distinct vehicle IDs:', vehicleIdsExplainSummary);

        // Get distinct vehicle IDs
        const { data: vehicleIds, error: vehicleIdsError } = await locals.supabase
            .rpc('get_distinct_vehicles', { p_master_map_id: masterMapId });

        if (vehicleIdsError) {
            console.error('Error fetching distinct vehicle IDs:', vehicleIdsError);
            throw vehicleIdsError;
        }

        // Fetch trail data for each vehicle in parallel
        const trailDataPromises = vehicleIds.map(async ({ vehicle_id }) => {
            // EXPLAIN for vehicle trail data query
            const { data: explainData } = await locals.supabase
                .rpc('get_vehicle_trail_data', {
                    p_master_map_id: masterMapId,
                    p_vehicle_id: vehicle_id,
                    p_retention_timestamp: retentionTimestamp
                })
                .explain({ analyze: true, verbose: true, format: 'json' });

            const explainSummary = summarizeExplain(explainData);
            console.log(`EXPLAIN for vehicle ${vehicle_id}:`, explainSummary);

            // Actual vehicle trail data query
            const { data, error } = await locals.supabase
                .rpc('get_vehicle_trail_data', {
                    p_master_map_id: masterMapId,
                    p_vehicle_id: vehicle_id,
                    p_retention_timestamp: retentionTimestamp
                });

            if (error) {
                console.error(`Error fetching trail data for vehicle ${vehicle_id}:`, error);
                throw error;
            }

            return { vehicle_id, data };
        });

        const trailDataResults = await Promise.all(trailDataPromises);

        // Group trail data by user and other vehicles
        const groupedUserTrailData = {};
        const groupedOtherTrailData = {};

        trailDataResults.forEach(({ vehicle_id, data }) => {
            if (vehicle_id === userId) {
                groupedUserTrailData[vehicle_id] = data;
            } else {
                groupedOtherTrailData[vehicle_id] = data;
            }
        });

        return json({ user: groupedUserTrailData, other: groupedOtherTrailData });
    } catch (error) {
        console.error('Error fetching trail data:', error);
        return json({ error: 'An error occurred while fetching trail data' }, { status: 500 });
    }
};