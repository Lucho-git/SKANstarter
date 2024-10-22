// src/routes/api/check-open-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicle_id } = await request.json();

    if (!vehicle_id) {
        return json({ error: 'Missing vehicle_id' }, { status: 400 });
    }

    try {
        // First, check for open trails
        const { data: existingTrails, error: fetchError } = await locals.supabase
            .from('trails')
            .select('*')
            .eq('vehicle_id', vehicle_id)
            .is('end_time', null)
            .limit(1);

        if (fetchError) {
            console.error("Error checking for existing trails:", fetchError);
            return json({ error: 'Failed to check for existing trails' }, { status: 500 });
        }

        const openTrail = existingTrails && existingTrails.length > 0 ? existingTrails[0] : null;

        if (openTrail) {
            // If an open trail is found, fetch associated data from trail_stream
            const { data: trailData, error: trailDataError } = await locals.supabase
                .from('trail_stream')
                .select('coordinate, timestamp')
                .eq('trail_id', openTrail.id)
                .order('timestamp', { ascending: true });

            if (trailDataError) {
                console.error("Error fetching trail data:", trailDataError);
                return json({ error: 'Failed to fetch trail data' }, { status: 500 });
            }

            // Transform the data to match the format of the other coordinates
            const transformedTrailData = trailData.map(point => ({
                coordinates: {
                    latitude: point.coordinate.coordinates[1],
                    longitude: point.coordinate.coordinates[0]
                },
                timestamp: new Date(point.timestamp).getTime()
            }));

            // Return both the open trail and its associated data
            return json({ openTrail, trailData: transformedTrailData }, { status: 200 });
        } else {
            // If no open trail is found, just return null for both
            return json({ openTrail: null, trailData: null }, { status: 200 });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};