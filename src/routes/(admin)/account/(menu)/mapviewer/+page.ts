// src/routes/admin/mapviewer/[type=field|vehicle|marker]/[id]/+page.ts
import type { PageLoad } from './$types';
import { mapFieldsStore } from '$lib/stores/mapFieldsStore';

export const load: PageLoad = async ({ data, url, fetch }) => {
    if (data.fields) {
        mapFieldsStore.set(data.fields);
    }

    console.log('Full URL:', url.toString());
    console.log('Query parameters:', Object.fromEntries(url.searchParams));

    let objectType: string | null = null;
    let objectId: string | null = null;
    let objectLocation = null;

    // Check for any of the possible object types in the query parameters
    ['field', 'vehicle', 'marker'].forEach(type => {
        const id = url.searchParams.get(type);
        if (id) {
            objectType = type;
            objectId = id;
        }
    });

    if (objectType && objectId) {
        try {
            const response = await fetch(`/api/location?type=${objectType}&id=${objectId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const locationData = await response.json();
            console.log('Response', locationData);
            objectLocation = locationData.location;
            console.log(`Fetched ${objectType} location:`, objectLocation);
        } catch (error) {
            console.error(`Error fetching ${objectType} location:`, error);
        }
    }

    return {
        fields: data.fields,
        type: objectType,
        id: objectId,
        location: objectLocation
    };
};