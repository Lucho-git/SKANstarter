// src/routes/api/close-trail/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { closeTrailWithPath, handleOpenTrails } from '$lib/services/closeTrailsService';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trail_id, vehicle_id, operation_id, path } = await request.json();

    if (!trail_id || !vehicle_id || !operation_id) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Close the main trail
        const { data: result, error: closeError } = await closeTrailWithPath(
            locals.supabase,
            trail_id,
            new Date().toISOString(),
            path
        );

        if (closeError) {
            console.error("Error closing main trail:", closeError);
            return json({ error: 'Failed to close trail' }, { status: 500 });
        }

        if (!result.success) {
            console.error("Failed to close main trail:", result);
            return json({ error: result.errors || result.error }, { status: 400 });
        }

        // Handle any other open trails for this vehicle/operation
        const { processedTrails } = await handleOpenTrails(
            locals.supabase,
            vehicle_id,
            operation_id
        );

        return json({
            result,
            processedTrails,
            message: 'All trails processed successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};