import { error, json } from '@sveltejs/kit';
import { PRIVATE_STRIPE_API_KEY, PRIVATE_STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import Stripe from 'stripe';
import type { RequestEvent } from './$types';
import { supabaseServiceRole } from '$lib/supabaseAdmin.server';

const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" });

export async function POST({ request }: RequestEvent) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('Missing stripe-signature header');
        throw error(400, 'Missing stripe-signature header');
    }

    try {
        console.log('Verifying Stripe signature...');
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            PRIVATE_STRIPE_WEBHOOK_SECRET
        );

        console.log('Received Stripe webhook eventer:', {
            type: event.type,
            id: event.id,
            created: new Date(event.created * 1000).toISOString(),
            data: JSON.stringify(event.data.object, null, 2)
        });

        switch (event.type) {
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                console.log('Processing subscription update:', {
                    customer_id: subscription.customer,
                    subscription_id: subscription.id,
                    status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
                });

                console.log('Looking up user from stripe_customer_id:', subscription.customer);
                const { data: customerData, error: customerError } = await supabaseServiceRole
                    .from('stripe_customers')
                    .select('user_id')
                    .eq('stripe_customer_id', subscription.customer)
                    .single();

                if (customerError) {
                    console.error('Error fetching customer data:', customerError);
                    throw new Error(`No customer found for stripe_customer_id: ${subscription.customer}`);
                }

                console.log('Found user:', customerData);

                const interval = subscription.items.data[0]?.price.recurring?.interval || 'month';

                const updateData = {
                    subscription: subscription.items.data[0]?.price.nickname || null,
                    current_seats: subscription.items.data[0]?.quantity || 1,
                    updated_at: new Date().toISOString(),
                    next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
                    payment_interval: interval
                };

                console.log('Updating subscription with data:', {
                    user_id: customerData.user_id,
                    ...updateData
                });

                const { error: updateError } = await supabaseServiceRole
                    .from('user_subscriptions')
                    .update(updateData)
                    .eq('user_id', customerData.user_id);

                if (updateError) {
                    console.error('Error updating subscription:', updateError);
                    throw new Error(`Failed to update subscription: ${updateError.message}`);
                }

                console.log('Successfully updated subscription:', {
                    user_id: customerData.user_id,
                    subscription_id: subscription.id,
                    update_time: new Date().toISOString()
                });
                break;
            }
        }

        return json({ received: true });

    } catch (err) {
        console.error('Error processing webhook:', {
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
            body: body.slice(0, 500)
        });

        throw error(400, (err instanceof Error ? err.message : 'Unknown error'));
    }
}