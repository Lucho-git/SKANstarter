import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { simplifyPath } from '$lib/utils/pathSimplification';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trail_id, vehicle_id, operation_id, path } = await request.json();

    console.log('Received request:', { trail_id, vehicle_id, operation_id, path });

    if (!trail_id || !vehicle_id || !operation_id) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const serverEndTime = new Date().toISOString();
        let pathString = null;
        let detailedPathString = null;

        if (path && path.length > 0) {
            // Create LineStringM with timestamps
            const detailedLineString = path.map((point: any) =>
                `${point.longitude} ${point.latitude} ${point.timestamp}`
            ).join(',');
            detailedPathString = `SRID=4326;LINESTRING M(${detailedLineString})`;

            // Create simplified LineString for rendering
            const pathForSimplification = path.map((point: any) => ({
                coordinates: `(${point.longitude},${point.latitude})`
            }));

            // Apply simplification
            const simplifiedPath = simplifyPath(pathForSimplification, 0.000005);

            // Convert simplified path to LineString
            const simplifiedLineString = simplifiedPath.map((point: any) => {
                const coords = point.coordinates.match(/\((.*?),(.*?)\)/);
                return `${coords[1]} ${coords[2]}`;
            }).join(',');

            pathString = `SRID=4326;LINESTRING(${simplifiedLineString})`;

            console.log('Generated LineStrings:', {
                detailed: detailedPathString,
                simplified: pathString
            });
        } else {
            console.log('No path data received or path is empty');
        }

        // Call the close_trail RPC function for the main trail
        const { data: result, error: rpcError } = await locals.supabase
            .rpc('close_trail', {
                trail_id_param: trail_id,
                end_time_param: serverEndTime,
                path_param: pathString,
                detailed_path_param: detailedPathString
            });

        if (rpcError) {
            console.error("Error closing main trail:", rpcError);
            return json({ error: 'Failed to close trail' }, { status: 500 });
        }

        if (!result.success) {
            console.error("Failed to close main trail:", result);
            return json({ error: result.errors || result.error }, { status: 400 });
        }

        console.log('Main trail closed successfully:', result);

        // Find other open trails for this vehicle and operation
        const { data: otherOpenTrails, error: openTrailsError } = await locals.supabase
            .from('trails')
            .select('id')
            .eq('vehicle_id', vehicle_id)
            .eq('operation_id', operation_id)
            .is('end_time', null)
            .neq('id', trail_id);

        if (openTrailsError) {
            console.error("Error checking for other open trails:", openTrailsError);
        } else if (otherOpenTrails && otherOpenTrails.length > 0) {
            console.log(`Found ${otherOpenTrails.length} additional open trails to process`);

            for (const trail of otherOpenTrails) {
                console.log(`Processing additional trail: ${trail.id}`);

                // Fetch points for this trail
                const { data: trailPoints, error: pointsError } = await locals.supabase
                    .from('trail_stream')
                    .select('*')
                    .eq('trail_id', trail.id)
                    .order('timestamp', { ascending: true });

                if (pointsError) {
                    console.error(`Error fetching points for trail ${trail.id}:`, pointsError);
                    continue;
                }

                // If no points or less than 3 points, delete trail and points
                if (!trailPoints || trailPoints.length < 3) {
                    console.log(`Trail ${trail.id} has insufficient points (${trailPoints?.length || 0}), deleting...`);

                    const { error: deletePointsError } = await locals.supabase
                        .from('trail_stream')
                        .delete()
                        .eq('trail_id', trail.id);

                    if (deletePointsError) {
                        console.error(`Error deleting points for trail ${trail.id}:`, deletePointsError);
                    }

                    const { error: deleteTrailError } = await locals.supabase
                        .from('trails')
                        .delete()
                        .eq('id', trail.id);

                    if (deleteTrailError) {
                        console.error(`Error deleting trail ${trail.id}:`, deleteTrailError);
                    }

                    continue;
                }

                // Process points for closing the trail
                const pathPoints = trailPoints.map(point => ({
                    longitude: point.coordinate.coordinates[0],
                    latitude: point.coordinate.coordinates[1],
                    timestamp: new Date(point.timestamp).getTime()
                }));

                // Create detailed path
                const detailedLineString = pathPoints.map(point =>
                    `${point.longitude} ${point.latitude} ${point.timestamp}`
                ).join(',');
                const detailedPath = `SRID=4326;LINESTRING M(${detailedLineString})`;

                // Create simplified path
                const pathForSimplification = pathPoints.map(point => ({
                    coordinates: `(${point.longitude},${point.latitude})`
                }));
                const simplifiedPath = simplifyPath(pathForSimplification, 0.000005);

                // Convert simplified path to LineString
                const simplifiedLineString = simplifiedPath.map((point: any) => {
                    const coords = point.coordinates.match(/\((.*?),(.*?)\)/);
                    return `${coords[1]} ${coords[2]}`;
                }).join(',');
                const finalPath = `SRID=4326;LINESTRING(${simplifiedLineString})`;

                // Get end time from last point
                const trailEndTime = trailPoints[trailPoints.length - 1].timestamp;

                console.log(`Closing trail ${trail.id} with ${trailPoints.length} points, end time: ${trailEndTime}`);

                // Close the trail using RPC
                const { data: closeResult, error: closeError } = await locals.supabase
                    .rpc('close_trail', {
                        trail_id_param: trail.id,
                        end_time_param: trailEndTime,
                        path_param: finalPath,
                        detailed_path_param: detailedPath
                    });

                if (closeError) {
                    console.error(`Error closing additional trail ${trail.id}:`, closeError);
                } else {
                    console.log(`Successfully closed additional trail ${trail.id}:`, closeResult);
                }
            }
        } else {
            console.log('No additional open trails found');
        }

        return json({
            result,
            message: 'All trails processed successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};