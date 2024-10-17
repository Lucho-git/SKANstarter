// src/routes/api/check-open-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicle_id } = await request.json();

    if (!vehicle_id) {
        return json({ error: 'Missing vehicle_id' }, { status: 400 });
    }

    try {
        const { data: existingTrails, error: fetchError } = await locals.supabase
            .from('trails')
            .select('*')
            .eq('vehicle_id', vehicle_id)
            .is('end_time', null)
            .limit(1);

        if (fetchError) {
            console.error("Error checking for existing trails:", fetchError);
            return json({ error: 'Failed to check for existing trails' }, { status: 500 });
        }

        const openTrail = existingTrails && existingTrails.length > 0 ? existingTrails[0] : null;

        return json({ openTrail }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};