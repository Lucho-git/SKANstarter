// src/routes/api/map-trails/close-trail/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trail_id, path } = await request.json();

    console.log('Received request:', { trail_id, path });

    if (!trail_id) {
        return json({ error: 'Missing required field: trail_id' }, { status: 400 });
    }

    try {
        const serverEndTime = new Date().toISOString();

        const updateData: any = {
            end_time: serverEndTime,
        };

        // Convert path to a PostGIS LineString
        if (path && path.length > 0) {
            console.log('Path received:', path);
            const lineStringCoordinates = path.map((point: any) =>
                `${point.longitude} ${point.latitude}`
            ).join(',');

            updateData.path = `SRID=4326;LINESTRING(${lineStringCoordinates})`;
            console.log('Generated LineString:', updateData.path);
        } else {
            console.log('No path data received or path is empty');
        }

        console.log('Update data:', updateData);

        const { data, error } = await locals.supabase
            .from('trails')
            .update(updateData)
            .eq('id', trail_id)
            .select('*');

        if (error) {
            console.error("Error closing trail:", error);
            return json({ error: 'Failed to close trail' }, { status: 500 });
        }

        if (data && data.length === 0) {
            console.log('No trail found with id:', trail_id);
            return json({ error: 'Trail not found' }, { status: 404 });
        }

        console.log('Updated trail data:', data[0]);

        return json({ trail: data[0] }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};