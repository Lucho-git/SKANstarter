import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        console.log('No session found');
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId, operationId } = await request.json();
    console.log('Received update request:', { profileId, operationId });

    if (!profileId || !operationId) {
        console.log('Missing required fields:', { profileId, operationId });
        return json({ error: 'Invalid data format' }, { status: 400 });
    }

    try {
        const { data, error } = await locals.supabase
            .from('profiles')
            .update({ selected_operation_id: operationId })
            .eq('id', profileId)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            console.log('No profile found for ID:', profileId);
            return json({ error: 'Profile not found' }, { status: 404 });
        }

        return json({ profile: data }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};