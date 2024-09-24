import type { PageLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { userFilesStore } from '../../../../../../stores/userFilesStore';
import { connectedMapStore } from '../../../../../../stores/connectedMapStore';
import { get } from 'svelte/store';

import { browser } from '$app/environment';

const showPromiseToast = async (promise: Promise<any>, fileName: string) => {
    if (browser) {
        const { toast } = await import('svelte-sonner');
        return new Promise((resolve, reject) => {
            toast.promise(promise, {
                loading: `Processing ${fileName}...`,
                success: (result) => {
                    setTimeout(() => resolve(result), 500);
                    return `${fileName} processed: ${result.message}`;
                },
                error: (err) => {
                    setTimeout(() => reject(err), 500);
                    return `Error processing ${fileName}: ${err.message}`;
                }
            });
        });
    }
    return promise;
};

const showErrorToast = async (message: string) => {
    if (browser) {
        const { toast } = await import('svelte-sonner');
        toast.error(message, {
            duration: 5000,
            position: 'top-center',
        });
    }
};

export const load: PageLoad = async ({ url, fetch }) => {
    // Check if user is connected to a map using the store
    const connectedMap = get(connectedMapStore);
    console.log('Connected Map:', connectedMap);
    if (!connectedMap.is_connected || !connectedMap.id) {
        await showErrorToast('Please connect to a map before processing files.');
        throw redirect(303, '/account/fieldview/');
    }

    const fileName = url.searchParams.get('fileName');
    const fileId = url.searchParams.get('fileId');

    if (!fileName || !fileId) {
        throw error(400, 'Missing file information');
    }

    const processFile = async () => {
        const response = await fetch("/api/files/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileName }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to process file");
        }

        return result;
    };

    try {
        const result = await showPromiseToast(processFile(), fileName);

        // Update userFilesStore
        userFilesStore.update((files) =>
            files.map((f) =>
                f.id === fileId
                    ? { ...f, message: result.message, status: "Processed" }
                    : f,
            ),
        );
        console.log("Result:", result);
        return {
            processedData: result,
            fileName,
            fileId
        };

    } catch (err) {
        console.error("Error processing file:", err);

        // Update userFilesStore to reflect the error
        userFilesStore.update((files) =>
            files.map((f) =>
                f.id === fileId
                    ? { ...f, message: err.message, status: "Failed" }
                    : f,
            ),
        );

        // Redirect back to the original page
        throw redirect(303, '/account/fieldview/');
    }
};