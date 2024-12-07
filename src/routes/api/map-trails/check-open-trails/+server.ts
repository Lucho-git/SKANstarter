import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { handleOpenTrails } from '$lib/services/closeTrailsService';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicle_id, timeoutMinutes } = await request.json();

    if (!vehicle_id) {
        return json({ error: 'Missing vehicle_id' }, { status: 400 });
    }

    try {
        console.log(`Checking open trails for vehicle ${vehicle_id}`);

        const result = await handleOpenTrails(
            locals.supabase,
            vehicle_id,
            undefined,
            {
                timeoutMinutes: timeoutMinutes || 30,
                closeStaleTrails: true,
                notifyOnClose: true
            }
        );

        const { mostRecentTrail, processedTrails, staleTrailClosed, lastActivity } = result;

        // If any trail was closed due to being stale, consider all trails closed
        if (staleTrailClosed) {
            console.log('Trail was closed due to being stale, considering all trails inactive');
            return json({
                openTrail: null,
                trailData: null,
                processedTrails,
                staleTrailClosed,
                lastActivity
            });
        }

        // Only proceed with fetching trail data if we have an active trail AND no stale closure occurred
        if (mostRecentTrail && !staleTrailClosed) {
            console.log(`Fetching data for active trail ${mostRecentTrail.id}`);
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
                processedTrails,
                staleTrailClosed,
                lastActivity
            });
        }

        // No active trails found
        console.log('No active trails found');
        return json({
            openTrail: null,
            trailData: null,
            processedTrails,
            staleTrailClosed,
            lastActivity
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({
            error: 'An unexpected error occurred',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};