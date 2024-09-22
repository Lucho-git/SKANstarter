import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private";
import JSZip from 'jszip';

const supabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE);

export async function POST({ request, locals }) {
    const session = await locals.getSession();
    if (!session || !session.user) {
        throw error(401, 'Unauthorized');
    }

    const userId = session.user.id;
    const { fileName } = await request.json();

    if (!fileName) {
        throw error(400, 'File name is required');
    }

    try {
        const filePath = `user_${userId}/${fileName}`;

        // Download the file
        const { data, error: downloadError } = await supabase
            .storage
            .from('user_files_bucket')
            .download(filePath);

        if (downloadError) {
            throw error(500, downloadError.message);
        }

        if (!data) {
            throw error(404, 'File not found');
        }

        // Process the file
        const result = await processFile(await data.arrayBuffer(), fileName);

        if (result.status === 'error') {
            throw error(400, result.message);
        }

        return new Response(JSON.stringify({ message: result.message }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error processing file:', err);
        throw error(500, 'An error occurred while processing the file');
    }
}


async function processFile(fileData: ArrayBuffer, fileName: string): Promise<{ status: string, message: string }> {
    if (!fileName.toLowerCase().endsWith('.zip')) {
        return { status: 'error', message: 'Invalid file type. Please upload a zip file.' };
    }

    const zip = new JSZip();

    try {
        const contents = await zip.loadAsync(fileData);
        const files = Object.keys(contents.files);

        // Check for shapefile components
        const hasShp = files.some(file => file.toLowerCase().endsWith('.shp'));
        const hasShx = files.some(file => file.toLowerCase().endsWith('.shx'));
        const hasDbf = files.some(file => file.toLowerCase().endsWith('.dbf'));

        if (hasShp && hasShx && hasDbf) {
            return { status: 'success', message: 'Valid shapefile detected.' };
        }

        // Check for KML file
        if (files.some(file => file.toLowerCase().endsWith('.kml'))) {
            return { status: 'success', message: 'Valid KML file detected. Support for KML files will be added in the future.' };
        }

        // Check for XML file (assuming it's ISOXML)
        if (files.some(file => file.toLowerCase().endsWith('.xml'))) {
            return { status: 'success', message: 'Valid XML file detected. Support for ISOXML files will be added in the future.' };
        }

        return { status: 'error', message: 'No valid files found in the zip archive.' };
    } catch (error) {
        console.error('Error processing zip file:', error);
        return { status: 'error', message: 'Error processing the zip file.' };
    }
}
