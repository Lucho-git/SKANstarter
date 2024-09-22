import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private";
import JSZip from 'jszip';
import shapefile from 'shapefile'; // Import the shapefile library

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

        // Return the extracted paddock data
        return new Response(JSON.stringify({ message: result.message, paddocks: result.paddocks || [] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error processing file:', err);
        throw error(500, 'An error occurred while processing the file');
    }
}

async function processFile(fileData: ArrayBuffer, fileName: string): Promise<{ status: string, message: string, paddocks?: any[] }> {
    if (!fileName.toLowerCase().endsWith('.zip')) {
        return { status: 'error', message: 'Invalid file type. Please upload a zip file.' };
    }

    const zip = new JSZip();

    try {
        const contents = await zip.loadAsync(fileData);
        const files = Object.keys(contents.files);

        // Check for required shapefile components
        const requiredExtensions = ['.shp', '.shx', '.dbf'];
        const hasAllComponents = requiredExtensions.every(ext =>
            files.some(file => file.toLowerCase().endsWith(ext))
        );

        if (hasAllComponents) {
            // Extract filenames of the shapefile components
            const shpFileName = files.find(file => file.toLowerCase().endsWith('.shp'));
            const shxFileName = files.find(file => file.toLowerCase().endsWith('.shx'));
            const dbfFileName = files.find(file => file.toLowerCase().endsWith('.dbf'));

            // Extract the files as buffers
            const shpFile = await contents.file(shpFileName).async('nodebuffer');
            const shxFile = await contents.file(shxFileName).async('nodebuffer');
            const dbfFile = await contents.file(dbfFileName).async('nodebuffer');

            // Read the shapefile
            const paddockList = [];
            const source = await shapefile.open(shpFile, dbfFile, { 'shx': shxFile });

            let result;
            while (!(result = await source.read()).done) {
                const feature = result.value;
                const properties = feature.properties; // Attributes from .dbf file
                const geometry = feature.geometry;     // Geometry from .shp file

                // Attempt to determine the paddock name field
                const paddockNameField = Object.keys(properties).find(key =>
                    ['name', 'NAME', 'Name', 'PaddockName', 'PADDOCK_NAME', 'paddock_name', 'PADDOCKNAME', 'FIELD_NAME'].includes(key)
                );
                const paddockName = paddockNameField ? properties[paddockNameField] : null;

                paddockList.push({
                    name: paddockName,
                    properties: properties,
                    boundary: geometry
                });
            }

            return {
                status: 'success',
                message: `Shapefile processed successfully. Found ${paddockList.length} paddock${paddockList.length !== 1 ? 's' : ''}.`,
                paddocks: paddockList
            };
        }

        // Check for KML file
        if (files.some(file => file.toLowerCase().endsWith('.kml'))) {
            return { status: 'success', message: 'Valid KML file detected. Support for KML files will be added in the future.' };
        }

        // Check for XML file (assuming it's ISOXML)
        if (files.some(file => file.toLowerCase().endsWith('.xml'))) {
            return { status: 'success', message: 'Valid XML file detected. Support for ISOXML files will be added in the future.' };
        }
        return { status: 'error', message: 'No valid shapefile components found in the zip archive.' };
    } catch (error) {
        console.error('Error processing zip file:', error);
        return { status: 'error', message: 'Error processing the zip file.' };
    }
}