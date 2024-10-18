// src/routes/api/map-trails/get-user-trails/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import wkx from 'wkx';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicle_id, operation_id } = await request.json();

    if (!vehicle_id || !operation_id) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const { data, error } = await locals.supabase
            .from('trails')
            .select(`
                id,
                vehicle_id,
                operation_id,
                start_time,
                end_time,
                trail_color,
                trail_width,
                path
            `)
            .eq('vehicle_id', vehicle_id)
            .eq('operation_id', operation_id)
            .order('start_time', { ascending: true });

        if (error) throw error;

        console.log('Raw data from Supabase:', data);

        // Convert path to GeoJSON on the server
        const trailsWithGeoJSON = data?.map(trail => {
            let geojson;
            try {
                if (typeof trail.path === 'string') {
                    // Assuming the path is in Well-Known Binary (WKB) format
                    const geometry = wkx.Geometry.parse(Buffer.from(trail.path, 'hex'));
                    geojson = geometry.toGeoJSON();
                } else if (typeof trail.path === 'object') {
                    geojson = trail.path;
                } else {
                    console.error('Unexpected path format:', trail.path);
                    geojson = null;
                }
            } catch (e) {
                console.error('Error parsing path:', e);
                geojson = null;
            }
            return {
                ...trail,
                path: geojson
            };
        }) || [];

        return json({ trails: trailsWithGeoJSON });
    } catch (error) {
        console.error('Error fetching user trails:', error);
        return json({ error: 'Failed to fetch user trails' }, { status: 500 });
    }
};