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

        // Step 1: Update the trail
        const { data: updatedTrail, error: updateError } = await locals.supabase
            .from('trails')
            .update(updateData)
            .eq('id', trail_id)
            .select('*')
            .single();

        if (updateError) {
            console.error("Error closing trail:", updateError);
            return json({ error: 'Failed to close trail' }, { status: 500 });
        }

        if (!updatedTrail) {
            console.log('No trail found with id:', trail_id);
            return json({ error: 'Trail not found' }, { status: 404 });
        }

        console.log('Updated trail data:', updatedTrail);

        // Step 2: Delete associated data from trail_stream
        const { error: deleteError } = await locals.supabase
            .from('trail_stream')
            .delete()
            .eq('trail_id', trail_id);

        if (deleteError) {
            console.error("Error deleting trail stream data:", deleteError);
            // Note: We don't return here because the trail was successfully closed
            // You might want to log this error or handle it in some way
        }

        return json({ trail: updatedTrail }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};