// src/routes/admin/fieldview/+page.server.ts

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const session = await locals.getSession();

    if (!session) {
        throw redirect(303, "/login");
    }

    try {
        console.log('Attempting to fetch fields...');
        const fieldsResponse = await fetch('/api/files/load_fields', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include any necessary authentication headers
            },
        });

        if (!fieldsResponse.ok) {
            console.error('Fields API response not ok:', fieldsResponse.status, fieldsResponse.statusText);
            const errorText = await fieldsResponse.text();
            console.error('Fields error response body:', errorText);
            throw new Error(`Failed to fetch fields: ${fieldsResponse.status} ${fieldsResponse.statusText}`);
        }

        const fieldsData = await fieldsResponse.json();
        const fields = fieldsData.fields;
        // console.log('Fields fetched:', fields);

        return { fields };
    } catch (error) {
        console.error('Error fetching fields:', error);
        return { fields: [], error: 'Failed to fetch fields.' };
    }
};