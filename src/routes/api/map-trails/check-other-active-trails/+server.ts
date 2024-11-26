// src/routes/api/map-trails/check-other-active-trails/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { closeTrailWithPath } from '$lib/services/closeTrailsService';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation_id, current_vehicle_id } = await request.json();

    if (!operation_id || !current_vehicle_id) {
        return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const { data: openTrails, error: trailsError } = await locals.supabase
            .from('trails')
            .select(`
                id,
                vehicle_id,
                operation_id,
                start_time,
                end_time,
                trail_color,
                trail_width
            `)
            .eq('operation_id', operation_id)
            .neq('vehicle_id', current_vehicle_id)
            .is('end_time', null)
            .order('start_time', { ascending: false });

        if (trailsError) throw trailsError;

        const trailsByVehicle = openTrails.reduce((acc, trail) => {
            if (!acc[trail.vehicle_id]) {
                acc[trail.vehicle_id] = [];
            }
            acc[trail.vehicle_id].push(trail);
            return acc;
        }, {});

        const errors: string[] = [];
        const activeTrails = [];

        for (const [vehicleId, trails] of Object.entries(trailsByVehicle)) {
            if (trails.length === 0) continue;

            const [mostRecentTrail, ...olderTrails] = trails;

            if (olderTrails.length > 0) {
                console.log(`Found ${olderTrails.length} additional open trails for vehicle ${vehicleId}`);

                for (const trail of olderTrails) {
                    console.log(`Closing old trail ${trail.id} for vehicle ${vehicleId} (started at ${trail.start_time})`);

                    const { error: closeError } = await closeTrailWithPath(
                        locals.supabase,
                        trail.id,
                        new Date().toISOString()
                    );

                    if (closeError) {
                        const errorMsg = `Error closing old trail ${trail.id} for vehicle ${vehicleId}: ${closeError.message}`;
                        console.error(errorMsg);
                        errors.push(errorMsg);
                    } else {
                        console.log(`Successfully closed trail ${trail.id} for vehicle ${vehicleId}`);
                    }
                }
            }

            try {
                const { data: trailData, error: trailDataError } = await locals.supabase
                    .from('trail_stream')
                    .select('coordinate, timestamp')
                    .eq('trail_id', mostRecentTrail.id)
                    .order('timestamp', { ascending: true });

                if (trailDataError) {
                    if (trailDataError.code === '57014') {
                        errors.push(`Timeout error while loading trail data for vehicle ${vehicleId}`);
                    } else {
                        errors.push(`Error loading trail data for vehicle ${vehicleId}: ${trailDataError.message}`);
                    }
                    continue;
                }

                const transformedTrailData = trailData.map(point => ({
                    coordinates: {
                        latitude: point.coordinate.coordinates[1],
                        longitude: point.coordinate.coordinates[0]
                    },
                    timestamp: new Date(point.timestamp).getTime()
                }));

                activeTrails.push({
                    ...mostRecentTrail,
                    trailData: transformedTrailData
                });
            } catch (error) {
                errors.push(`Error processing trail data for vehicle ${vehicleId}: ${error.message}`);
            }
        }

        return json({
            activeTrails,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error fetching active trails:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active trails';
        return json({
            error: errorMessage,
            code: error?.code
        }, { status: 500 });
    }
};