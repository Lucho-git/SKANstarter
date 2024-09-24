// src/routes/admin/fieldview/+page.ts
import type { PageLoad } from './$types';
import { mapFieldsStore } from '$lib/stores/mapFieldsStore';

export const load: PageLoad = async ({ data }) => {
    // data comes from +page.server.ts
    if (data.fields) {
        // Update the store with the fields from the server
        mapFieldsStore.set(data.fields);
    }

    // Return the data to be used in the page
    return {
        fields: data.fields
    };
};