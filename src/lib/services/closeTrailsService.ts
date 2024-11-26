// src/lib/services/closeTrailsService.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import { simplifyPath } from '$lib/utils/pathSimplification';

interface Point {
    longitude: number;
    latitude: number;
    timestamp: number;
}

export async function closeTrailWithPath(
    supabase: SupabaseClient,
    trail_id: string,
    endTime: string,
    path?: Point[]
) {
    let pathString = null;
    let detailedPathString = null;

    if (path && path.length > 0) {
        const detailedLineString = path.map(point =>
            `${point.longitude} ${point.latitude} ${point.timestamp}`
        ).join(',');
        detailedPathString = `SRID=4326;LINESTRING M(${detailedLineString})`;

        const pathForSimplification = path.map(point => ({
            coordinates: `(${point.longitude},${point.latitude})`
        }));

        const simplifiedPath = simplifyPath(pathForSimplification, 0.000005);
        const simplifiedLineString = simplifiedPath.map(point => {
            const coords = point.coordinates.match(/\((.*?),(.*?)\)/);
            return `${coords[1]} ${coords[2]}`;
        }).join(',');

        pathString = `SRID=4326;LINESTRING(${simplifiedLineString})`;
    }

    return await supabase.rpc('close_trail', {
        trail_id_param: trail_id,
        end_time_param: endTime,
        path_param: pathString,
        detailed_path_param: detailedPathString
    });
}

export async function processAndCloseTrail(
    supabase: SupabaseClient,
    trail_id: string
) {
    // Fetch points for this trail
    const { data: trailPoints, error: pointsError } = await supabase
        .from('trail_stream')
        .select('*')
        .eq('trail_id', trail_id)
        .order('timestamp', { ascending: true });

    if (pointsError) {
        throw new Error(`Error fetching points for trail ${trail_id}: ${pointsError.message}`);
    }

    // If no points or less than 3 points, delete trail and points
    if (!trailPoints || trailPoints.length < 3) {
        await supabase.from('trail_stream').delete().eq('trail_id', trail_id);
        await supabase.from('trails').delete().eq('id', trail_id);
        return { deleted: true, reason: 'insufficient_points' };
    }

    // Process points for closing the trail
    const pathPoints = trailPoints.map(point => ({
        longitude: point.coordinate.coordinates[0],
        latitude: point.coordinate.coordinates[1],
        timestamp: new Date(point.timestamp).getTime()
    }));

    const trailEndTime = trailPoints[trailPoints.length - 1].timestamp;
    return await closeTrailWithPath(supabase, trail_id, trailEndTime, pathPoints);
}

export async function handleOpenTrails(
    supabase: SupabaseClient,
    vehicle_id: string,
    operation_id?: string
) {
    let query = supabase
        .from('trails')
        .select('*')
        .eq('vehicle_id', vehicle_id)
        .is('end_time', null)
        .order('start_time', { ascending: false });

    if (operation_id) {
        query = query.eq('operation_id', operation_id);
    }

    const { data: openTrails, error } = await query;

    if (error) {
        throw new Error(`Error fetching open trails: ${error.message}`);
    }

    if (!openTrails || openTrails.length === 0) {
        return { mostRecentTrail: null, processedTrails: [] };
    }

    const [mostRecentTrail, ...olderTrails] = openTrails;
    const processedTrails = [];

    // Process older trails
    for (const trail of olderTrails) {
        const result = await processAndCloseTrail(supabase, trail.id);
        processedTrails.push({ trail_id: trail.id, result });
    }

    return { mostRecentTrail, processedTrails };
}