// src/routes/admin/fieldview/+page.server.ts

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const session = await locals.getSession();

    if (!session) {
        throw redirect(303, "/login");
    }

    try {
        console.log('Fetching files...');
        const response = await fetch('/api/files', {
            headers: {
                'Content-Type': 'application/json',
                // Include any necessary authentication headers
            },
        });

        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
        }

        const files = await response.json();
        console.log('Files fetched:', files);
        return { files };
    } catch (error) {
        console.error('Error fetching files:', error);
        return { files: [], error: 'Failed to fetch files.' };
    }
};