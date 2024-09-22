import { json, error, fail } from "@sveltejs/kit";
import type { RequestHandler } from './$types';

import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
    console.log('Received POST request');
    console.log('Content-Type:', request.headers.get('content-type'));

    const session = await getSession();
    if (!session) {
        throw error(401, { message: 'Unauthorized' });
    }

    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        const { action, ...rest } = await request.json();


        if (action === 'updateUserSubscription') {
            console.log('Updating user subscription in server.ts');

            const subscriptionData = {
                user_id: session.user.id,
                subscription: rest.subscription || 'FREE',
                current_seats: rest.current_seats || 1,
                lingering_seats: rest.lingering_seats || null,
                marker_limit: rest.marker_limit || 100,
                trail_limit: rest.trail_limit || 100000,
                founder: rest.founder || false,
                updated_at: new Date(),
            };

            console.log("Subscription data:", subscriptionData);

            const { error: subscriptionError } = await supabase.from("user_subscriptions").upsert(subscriptionData);

            if (subscriptionError) {
                console.error("Supabase subscription error:", subscriptionError);
                return json({
                    success: false,
                    message: "Unknown error. If this persists please contact us."
                }, { status: 500 });
            }

            return json({
                success: true,
                ...subscriptionData
            });
        }
    }



};