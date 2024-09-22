import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
    let processedData;

    if (typeof window !== 'undefined') {
        const storedData = sessionStorage.getItem('processedData');
        if (storedData) {
            processedData = JSON.parse(storedData);
            sessionStorage.removeItem('processedData'); // Clear the data after retrieving
        }
    }

    if (!processedData) {
        // If no data in sessionStorage, redirect back to upload page
        return {
            status: 302,
            redirect: '/account/fieldview/upload'
        };
    }

    return {
        processedData
    };
};