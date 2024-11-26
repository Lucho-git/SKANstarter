// src/routes/api/map-trails/check-other-active-trails/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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
        const { data, error } = await locals.supabase
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

        if (error) throw error;

        const uniqueVehicleTrails = data.reduce((acc, trail) => {
            if (!acc[trail.vehicle_id]) {
                acc[trail.vehicle_id] = trail;
            }
            return acc;
        }, {});

        const activeTrails = Object.values(uniqueVehicleTrails);
        const errors: string[] = [];

        const trailsWithPoints = await Promise.all(activeTrails.map(async (trail) => {
            const { data: trailData, error: trailDataError } = await locals.supabase
                .from('trail_stream')
                .select('coordinate, timestamp')
                .eq('trail_id', trail.id)
                .order('timestamp', { ascending: true });

            if (trailDataError) {
                // Check for timeout error
                if (trailDataError.code === '57014') {
                    errors.push(`Timeout error while loading trail data. Some trails may be incomplete.`);
                } else {
                    errors.push(`Error loading trail data: ${trailDataError.message}`);
                }

                return {
                    ...trail,
                    trailData: []
                };
            }

            const transformedTrailData = trailData.map(point => ({
                coordinates: {
                    latitude: point.coordinate.coordinates[1],
                    longitude: point.coordinate.coordinates[0]
                },
                timestamp: new Date(point.timestamp).getTime()
            }));

            return {
                ...trail,
                trailData: transformedTrailData
            };
        }));

        return json({
            activeTrails: trailsWithPoints,
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