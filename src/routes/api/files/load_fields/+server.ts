// src/routes/api/files/load_fields/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    try {
        const session = await locals.getSession();
        if (!session) {
            console.error('No session found');
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        console.log('Fetching fields for user:', userId);

        const { data: profileData, error: profileError } = await locals.supabase
            .from('profiles')
            .select('master_map_id')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Supabase error fetching profile:', profileError);
            throw profileError;
        }

        const masterMapId = profileData.master_map_id;
        if (!masterMapId) {
            console.error('No master_map_id found for user');
            return json({ error: 'No master map associated with user' }, { status: 400 });
        }

        const { data: fieldsData, error: fieldsError } = await locals.supabase
            .from('fields')
            .select(`*`)
            .eq('map_id', masterMapId)
            .order('name', { ascending: true });

        if (fieldsError) {
            console.error('Supabase error fetching fields:', fieldsError);
            throw fieldsError;
        }

        // console.log('Fields fetched:', fieldsData);

        return json({ fields: fieldsData });
    } catch (error) {
        console.error('Error fetching fields:', error);
        return json({ error: 'An error occurred while fetching fields' }, { status: 500 });
    }
};