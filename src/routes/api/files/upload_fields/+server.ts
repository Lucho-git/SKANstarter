import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { map_id, fields } = await request.json();

    if (!map_id || !Array.isArray(fields) || fields.length === 0) {
        return json({ error: 'Invalid data format' }, { status: 400 });
    }

    const insertedFields = [];
    const rejectedFields = [];

    for (const field of fields) {
        if (field.status !== 'accepted') {
            rejectedFields.push({ name: field.name, reason: 'Not accepted' });
            continue;
        }

        const fieldToInsert = {
            map_id: map_id,
            name: field.name,
            area: field.area,
            boundary: field.boundary,
            properties: field.properties
        };

        try {
            const { data, error } = await locals.supabase
                .from('fields')
                .insert([fieldToInsert])
                .select('*');

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    rejectedFields.push({ name: field.name, reason: 'Duplicate field name' });
                } else {
                    rejectedFields.push({ name: field.name, reason: error.message });
                    console.error('Actual postgres/supabase error:', error);
                }
            } else {
                insertedFields.push(data[0]);
            }
        } catch (error) {
            rejectedFields.push({ name: field.name, reason: 'Unexpected error' });
        }
    }

    if (insertedFields.length === 0) {
        let errorMessage = '';
        if (rejectedFields.length === 1) {
            errorMessage = `Paddock "${rejectedFields[0].name}" was rejected: ${rejectedFields[0].reason}`;
        } else {
            const reasons = [...new Set(rejectedFields.map(f => f.reason))];
            errorMessage = `All ${rejectedFields.length} paddocks were rejected. Reasons: ${reasons.join(', ')}`;
        }
        return json({ error: errorMessage }, { status: 400 });
    }

    return json({
        insertedFields: insertedFields,
        rejectedFields: rejectedFields
    }, { status: 200 });
};