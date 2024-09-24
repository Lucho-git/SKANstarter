// src/routes/admin/fieldview/+page.server.ts

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const session = await locals.getSession();

    if (!session) {
        throw redirect(303, "/login");
    }

    try {
        // Fetch files
        console.log('Fetching files...');
        const filesResponse = await fetch('/api/files', {
            headers: {
                'Content-Type': 'application/json',
                // Include any necessary authentication headers
            },
        });

        if (!filesResponse.ok) {
            console.error('Files API response not ok:', filesResponse.status, filesResponse.statusText);
            const errorText = await filesResponse.text();
            console.error('Files error response body:', errorText);
            throw new Error(`Failed to fetch files: ${filesResponse.status} ${filesResponse.statusText}`);
        }

        const files = await filesResponse.json();
        // console.log('Files fetched:', files);

        // Attempt to fetch fields
        console.log('Attempting to fetch fields...');
        let fields = [];
        try {
            const fieldsResponse = await fetch('/api/files/load_fields', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any necessary authentication headers
                },
            });

            if (fieldsResponse.ok) {
                const fieldsData = await fieldsResponse.json();
                fields = fieldsData.fields;
                // console.log('Fields fetched:', fields);
            } else {
                console.log('No fields available or not connected to a master map');
            }
        } catch (fieldError) {
            console.log('Error fetching fields:', fieldError);
            // We don't throw an error here, just log it and continue with empty fields
        }

        return { files, fields };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { files: [], fields: [], error: 'Failed to fetch data.' };
    }
};