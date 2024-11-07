// src/routes/api/map-trails/close-trail/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { simplifyPath } from '$lib/utils/pathSimplification';

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

        if (path && path.length > 0) {
            // Create LineStringM with timestamps
            const detailedLineString = path.map((point: any) =>
                `${point.longitude} ${point.latitude} ${point.timestamp}`
            ).join(',');
            updateData.detailed_path = `SRID=4326;LINESTRING M(${detailedLineString})`;

            // Create simplified LineString for rendering
            const pathForSimplification = path.map((point: any) => ({
                coordinates: `(${point.longitude},${point.latitude})`
            }));

            // Apply simplification
            const simplifiedPath = simplifyPath(pathForSimplification, 0.00005);

            // Convert simplified path to LineString
            const simplifiedLineString = simplifiedPath.map((point: any) => {
                const coords = point.coordinates.match(/\((.*?),(.*?)\)/);
                return `${coords[1]} ${coords[2]}`;
            }).join(',');

            updateData.path = `SRID=4326;LINESTRING(${simplifiedLineString})`;

            console.log('Generated LineStrings:', {
                detailed: updateData.detailed_path,
                simplified: updateData.path
            });
        } else {
            console.log('No path data received or path is empty');
        }

        console.log('Update data:', updateData);

        // Update the trail with both paths
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

        // Delete associated data from trail_stream
        const { error: deleteError } = await locals.supabase
            .from('trail_stream')
            .delete()
            .eq('trail_id', trail_id);

        if (deleteError) {
            console.error("Error deleting trail stream data:", deleteError);
            // Note: We don't return here because the trail was successfully closed
        }

        //check for and delete any additional open trail_streams which may have been left behind

        return json({ trail: updatedTrail }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};