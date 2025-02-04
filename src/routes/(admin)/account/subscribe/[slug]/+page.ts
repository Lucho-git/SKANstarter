// In +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
    console.log("CLIENT LOAD PAGE WOOO")

    // Check if we have a Stripe URL to redirect to
    if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
        return new Promise(() => { });
    }

    // Check if the subscription was updated
    if (data.subscriptionUpdated) {
        window.location.href = '/account';
        return new Promise(() => { });
    }

    // Return the data from the server load function
    return data;
}