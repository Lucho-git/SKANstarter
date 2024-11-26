// src/routes/api/check-open-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { handleOpenTrails } from '$lib/services/closeTrailsService';

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
        const { mostRecentTrail, processedTrails } = await handleOpenTrails(locals.supabase, vehicle_id);

        if (mostRecentTrail) {
            const { data: trailData, error: trailDataError } = await locals.supabase
                .from('trail_stream')
                .select('coordinate, timestamp')
                .eq('trail_id', mostRecentTrail.id)
                .order('timestamp', { ascending: true });

            if (trailDataError) {
                throw new Error(`Failed to fetch trail data: ${trailDataError.message}`);
            }

            const transformedTrailData = trailData.map(point => ({
                coordinates: {
                    latitude: point.coordinate.coordinates[1],
                    longitude: point.coordinate.coordinates[0]
                },
                timestamp: new Date(point.timestamp).getTime()
            }));

            return json({
                openTrail: mostRecentTrail,
                trailData: transformedTrailData,
                processedTrails
            });
        }

        return json({ openTrail: null, trailData: null, processedTrails });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};