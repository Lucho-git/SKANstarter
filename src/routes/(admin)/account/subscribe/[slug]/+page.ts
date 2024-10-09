// In page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
    console.log("CLIENT LOAD PAGE WOOO")
    // Check if the subscription was updated
    if (data.subscriptionUpdated) {
        // Perform a full page refresh to the account page
        window.location.href = '/account';
        // This will stop further execution of this function
        return new Promise(() => { });
    }

    // Return the data from the server load function
    return data;
}