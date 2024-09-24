import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { FileUpload } from '$lib/types';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        const session = await locals.getSession();
        if (!session) {
            console.error('No session found');
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        console.log('Fetching files for user:', userId);

        const { data, error } = await locals.supabase
            .from('user_files')
            .select(`file_id, user_id, file_name, file_path, created_at`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // console.log('Files fetched:', data);

        const files: FileUpload[] = data.map((file: any) => ({
            id: file.file_id,
            name: file.file_name,
            path: file.file_path,
            uploadedDate: file.created_at,
            status: "Processed",
            message: "File uploaded successfully",
        }));

        return json(files);
    } catch (error) {
        console.error('Error in GET /api/files:', error);
        return json({ error: 'Failed to fetch user files' }, { status: 500 });
    }
};

