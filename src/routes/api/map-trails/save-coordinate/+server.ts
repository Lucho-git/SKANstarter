import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trail_id, coordinates, timestamp } = await request.json();

    console.log('Received coordinate data:', { trail_id, coordinates, timestamp });

    if (!trail_id || !coordinates || !timestamp) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const point = `POINT(${coordinates.longitude} ${coordinates.latitude})`;
        const { data, error } = await locals.supabase
            .from('trail_stream')
            .insert({
                trail_id,
                coordinate: point,
                timestamp: new Date(timestamp).toISOString()
            })
            .select();

        if (error) {
            console.error("Error saving coordinate:", error);
            return json({ error: 'Failed to save coordinate' }, { status: 500 });
        }

        console.log('Saved coordinate:', data[0]);

        return json({ coordinate: data[0] }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};