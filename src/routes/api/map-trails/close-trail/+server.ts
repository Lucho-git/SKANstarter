// src/routes/api/map-trails/close-trail/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trail_id, trail_path } = await request.json();

    if (!trail_id) {
        return json({ error: 'Missing required field: trail_id' }, { status: 400 });
    }

    try {
        const serverEndTime = new Date().toISOString();

        const updateData: any = {
            end_time: serverEndTime,
        };

        // If trail_path is provided, include it in the update
        if (trail_path) {
            updateData.trail_path = trail_path;
        }

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
            return json({ error: 'Trail not found' }, { status: 404 });
        }

        return json({ trail: data[0] }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};