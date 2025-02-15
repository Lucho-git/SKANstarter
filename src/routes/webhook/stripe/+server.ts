// src/routes/webhook/stripe/+server.ts
import { error, json } from '@sveltejs/kit';
import { PRIVATE_STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import Stripe from 'stripe';
import type { RequestEvent } from './$types';

const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" });

export async function POST({ request }: RequestEvent) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('Missing stripe-signature header');
        throw error(400, 'Missing stripe-signature header');
    }

    try {
        // Verify the webhook signature
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET
        );

        // Log the event details
        console.log('Received Stripe webhook event:', {
            type: event.type,
            id: event.id,
            created: new Date(event.created * 1000).toISOString(),
            data: event.data.object
        });
        console.error('Received Stripe webhook event:', {
            type: event.type,
            id: event.id,
            created: new Date(event.created * 1000).toISOString(),
            data: event.data.object
        });

        // Return a 200 success response to Stripe
        return json({ received: true });

    } catch (err) {
        // Log any errors
        console.error('Error processing webhook:', {
            error: err instanceof Error ? err.message : 'Unknown error',
            body: body.slice(0, 500) // Log first 500 chars of body for debugging
        });

        throw error(400, (err instanceof Error ? err.message : 'Unknown error'));
    }
}