// /api/map-trails/save-coordinate
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation_id, trail_id, coordinates_batch } = await request.json();

    console.log('Received coordinate batch:', { operation_id, trail_id, count: coordinates_batch.length });

    if (!trail_id || !coordinates_batch || !coordinates_batch.length) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Prepare the batch of coordinates for insertion
        const coordinatesForInsert = coordinates_batch.map(({ coordinates, timestamp }) => ({
            operation_id,
            trail_id,
            coordinate: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
            timestamp: new Date(timestamp).toISOString()
        }));

        const { data, error } = await locals.supabase
            .from('trail_stream')
            .insert(coordinatesForInsert)
            .select();

        if (error) {
            console.error("Error saving coordinates:", error);
            return json({ error: 'Failed to save coordinates' }, { status: 500 });
        }

        console.log('Saved coordinates:', data.length);

        return json({ coordinates: data }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};