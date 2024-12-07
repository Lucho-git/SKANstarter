import type { SupabaseClient } from '@supabase/supabase-js';
import { simplifyPath } from '$lib/utils/pathSimplification';

interface Point {
    longitude: number;
    latitude: number;
    timestamp: number;
}

interface TrailTimeoutConfig {
    timeoutMinutes: number;
    closeStaleTrails: boolean;
    notifyOnClose: boolean;
}

const DEFAULT_CONFIG: TrailTimeoutConfig = {
    timeoutMinutes: 24 * 60, // 24 hours in minutes
    closeStaleTrails: true,
    notifyOnClose: true
};

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

async function isTrailFresh(
    supabase: SupabaseClient,
    trail_id: string,
    timeoutMinutes: number
): Promise<{ isFresh: boolean; lastTimestamp?: string; lastPoint?: any }> {
    console.log(`\nChecking freshness for trail ${trail_id}`);
    console.log(`Timeout threshold: ${timeoutMinutes} minutes`);

    const { data: lastPoint, error } = await supabase
        .from('trail_stream')
        .select('*')
        .eq('trail_id', trail_id)
        .order('timestamp', { ascending: false })
        .limit(1);

    const currentTime = new Date();
    let lastActivityTime: Date;
    let lastTimestamp: string;

    if (error || !lastPoint?.[0]?.timestamp) {
        // If no points exist, get the trail's start time
        const { data: trail } = await supabase
            .from('trails')
            .select('start_time')
            .eq('id', trail_id)
            .single();

        lastTimestamp = trail?.start_time || currentTime.toISOString();
        lastActivityTime = new Date(lastTimestamp);
        console.log('No points found, using trail start time as last activity');
    } else {
        lastTimestamp = lastPoint[0].timestamp;
        lastActivityTime = new Date(lastTimestamp);
        console.log('Using last point timestamp as last activity');
    }

    const minutesSinceLastPoint = (currentTime.getTime() - lastActivityTime.getTime()) / (1000 * 60);

    console.log(`Current time: ${currentTime.toISOString()}`);
    console.log(`Last activity time: ${lastActivityTime.toISOString()}`);
    console.log(`Minutes since last activity: ${minutesSinceLastPoint.toFixed(2)}`);
    console.log(`Is fresh: ${minutesSinceLastPoint <= timeoutMinutes}\n`);

    return {
        isFresh: minutesSinceLastPoint <= timeoutMinutes,
        lastTimestamp,
        lastPoint: lastPoint?.[0]
    };
}

export async function processAndCloseTrail(
    supabase: SupabaseClient,
    trail_id: string
) {
    console.log(`Processing and closing trail ${trail_id}`);

    const { data: trailPoints, error: pointsError } = await supabase
        .from('trail_stream')
        .select('*')
        .eq('trail_id', trail_id)
        .order('timestamp', { ascending: true });

    if (pointsError) {
        throw new Error(`Error fetching points for trail ${trail_id}: ${pointsError.message}`);
    }

    if (!trailPoints || trailPoints.length < 3) {
        console.log(`Trail ${trail_id} has insufficient points (${trailPoints?.length || 0}), deleting`);
        await supabase.from('trail_stream').delete().eq('trail_id', trail_id);
        await supabase.from('trails').delete().eq('id', trail_id);
        return { deleted: true, reason: 'insufficient_points' };
    }

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
    operation_id?: string,
    config: Partial<TrailTimeoutConfig> = {}
) {
    console.log(`\nHandling open trails for vehicle ${vehicle_id}`);
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

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
        console.log('No open trails found');
        return { mostRecentTrail: null, processedTrails: [] };
    }

    console.log(`Found ${openTrails.length} open trails`);
    let [mostRecentTrail, ...olderTrails] = openTrails;
    const processedTrails = [];

    // Check freshness of most recent trail
    const { isFresh, lastTimestamp, lastPoint } = await isTrailFresh(
        supabase,
        mostRecentTrail.id,
        finalConfig.timeoutMinutes
    );

    // If trail is stale and we should close stale trails
    if (!isFresh && finalConfig.closeStaleTrails) {
        console.log(`Trail ${mostRecentTrail.id} is stale, processing for closure`);
        const result = await processAndCloseTrail(supabase, mostRecentTrail.id);
        processedTrails.push({
            trail_id: mostRecentTrail.id,
            result,
            reason: `Trail inactive for more than ${finalConfig.timeoutMinutes} minutes`,
            last_activity: lastTimestamp
        });
        mostRecentTrail = null;
    } else if (isFresh) {
        console.log(`Trail ${mostRecentTrail.id} is still active`);
    }

    // Process older trails
    for (const trail of olderTrails) {
        console.log(`\nProcessing older trail ${trail.id}`);
        const { lastTimestamp: oldTrailLastTimestamp } = await isTrailFresh(
            supabase,
            trail.id,
            finalConfig.timeoutMinutes
        );

        const result = await processAndCloseTrail(supabase, trail.id);
        processedTrails.push({
            trail_id: trail.id,
            result,
            reason: 'older_trail',
            last_activity: oldTrailLastTimestamp
        });
    }

    return {
        mostRecentTrail,
        processedTrails,
        config: finalConfig,
        staleTrailClosed: !isFresh && finalConfig.closeStaleTrails,
        lastActivity: lastTimestamp
    };
}