// src/routes/api/map-trails/delete-trail/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    // Check authentication
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { trail_id } = await request.json();

        // Validate input
        if (!trail_id) {
            return json({ error: 'Missing trail_id' }, { status: 400 });
        }

        // Delete the trail from the database
        const { error } = await locals.supabase
            .from('trails')
            .delete()
            .eq('id', trail_id);

        if (error) {
            console.error('Error deleting trail:', error);
            return json({ error: 'Failed to delete trail' }, { status: 500 });
        }

        return json({ message: 'Trail deleted successfully' });

    } catch (error) {
        console.error('Error in delete-trail endpoint:', error);
        return json({ error: 'Failed to process delete trail request' }, { status: 500 });
    }
};