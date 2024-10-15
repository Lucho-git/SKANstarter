import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { master_map_id, name, year, description } = await request.json();

    if (!master_map_id || !name || !year) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newOperation = {
        master_map_id,
        name,
        year,
        description: description || '',
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await locals.supabase
            .from('operations')
            .insert([newOperation])
            .select('*');

        if (error) {
            console.error('Error inserting operation:', error);
            return json({ error: 'Failed to add operation' }, { status: 500 });
        }

        return json({ operation: data[0] }, { status: 201 });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};