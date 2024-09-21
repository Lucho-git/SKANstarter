// src/routes/api/files/delete/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName } = await request.json();
    if (!fileName) {
        return json({ error: 'No file name provided' }, { status: 400 });
    }

    const filePath = `user_${session.user.id}/${fileName}`;

    try {
        // Check if the file exists in the storage bucket
        const { data: fileData, error: fileError } = await locals.supabase.storage
            .from('user_files_bucket')
            .list(`user_${session.user.id}`, {
                limit: 1,
                offset: 0,
                search: fileName,
            });

        if (fileError) throw fileError;
        if (!fileData || fileData.length === 0) {
            return json({ error: 'File not found in storage' }, { status: 404 });
        }

        // Delete from storage bucket
        const { error: deleteError } = await locals.supabase.storage
            .from('user_files_bucket')
            .remove([filePath]);

        if (deleteError) throw deleteError;

        // Delete the file metadata from the user_files table
        const { error: dbError } = await locals.supabase
            .from('user_files')
            .delete()
            .match({ file_name: fileName, user_id: session.user.id });

        if (dbError) throw dbError;

        return json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return json({ error: 'Error deleting file. If this persists please contact us.' }, { status: 500 });
    }
};