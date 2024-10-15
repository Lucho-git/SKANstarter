import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, year, description } = await request.json();

    if (!id || (!name && !year && description === undefined)) {
        return json({ error: 'Invalid data format' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (year !== undefined) updateData.year = year;
    if (description !== undefined) updateData.description = description;

    try {
        const { data, error } = await locals.supabase
            .from('operations')
            .update(updateData)
            .eq('id', id)
            .select('*');

        if (error) {
            console.error('Error updating operation:', error);
            return json({ error: 'Failed to update operation' }, { status: 500 });
        }

        if (data && data.length > 0) {
            return json({ operation: data[0] }, { status: 200 });
        } else {
            return json({ error: 'Operation not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
};