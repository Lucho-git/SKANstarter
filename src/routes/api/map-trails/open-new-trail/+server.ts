// src/routes/api/open-new-trail/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicle_id, operation_id, vehicle_info } = await request.json();

    if (!vehicle_id || !operation_id || !vehicle_info) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Create new trail entry
        // Wherever you're creating the start_time
        const serverStartTime = new Date().toISOString();


        // Then use serverStartTime in your trail creation


        const newTrail = {
            id: uuidv4(),
            vehicle_id,
            operation_id,
            start_time: serverStartTime,
            trail_color: vehicle_info.vehicle_marker.bodyColor || '#000000', // Default to black if no color
            trail_width: vehicle_info.vehicle_marker.swath || 11 // Default to 3 if no swath
        };

        const { data, error } = await locals.supabase
            .from('trails')
            .insert([newTrail])
            .select('*');

        if (error) {
            console.error("Error creating new trail:", error);
            return json({ error: 'Failed to create new trail' }, { status: 500 });
        }

        return json({ trail: data[0] }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};