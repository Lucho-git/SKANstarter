import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, request }) => {
    try {
        const session = await locals.getSession();
        if (!session) {
            console.error('No session found');
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { fieldId } = await request.json();

        if (!fieldId) {
            return json({ error: 'Field ID is required' }, { status: 400 });
        }

        // First, check if the field belongs to the user's master map
        console.log(('Fetching profile data to delete field'));
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
            return json({ error: 'No master map associated with user' }, { status: 400 });
        }

        // Delete the field
        const { error: deleteError } = await locals.supabase
            .from('fields')
            .delete()
            .eq('field_id', fieldId)  // Changed from 'id' to 'field_id'
            .eq('map_id', masterMapId);

        if (deleteError) {
            console.error('Supabase error deleting field:', deleteError);
            throw deleteError;
        }

        return json({ success: true, message: 'Field deleted successfully' });
    } catch (error) {
        console.error('Error deleting field:', error);
        return json({ error: 'An error occurred while deleting the field' }, { status: 500 });
    }
};