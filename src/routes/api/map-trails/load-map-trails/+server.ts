// src/routes/api/map-trails/load-map-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const TRAIL_DATA_RETENTION_DAYS = 30; // Adjust as needed

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

        const { data: otherTrailData, error: otherError } = await locals.supabase
            .from("trail_data")
            .select("*")
            .eq("master_map_id", masterMapId)
            .neq("vehicle_id", userId)
            .gte("timestamp", retentionTimestamp)
            .order("timestamp", { ascending: true });

        if (otherError) {
            console.error('Supabase error fetching other trail data:', otherError);
            throw otherError;
        }

        const groupedUserTrailData = groupBy(userTrailData, "vehicle_id");
        const groupedOtherTrailData = groupBy(otherTrailData, "vehicle_id");

        return json({ user: groupedUserTrailData, other: groupedOtherTrailData });
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