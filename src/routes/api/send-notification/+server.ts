import { json } from '@sveltejs/kit';
import webpush from 'web-push';
import { PRIVATE_VAPID_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

export async function POST({ request }) {
    const { subscription, title, body } = await request.json();

    console.log('Sending push notification serverside...');


    webpush.setVapidDetails(
        'mailto:lachie@skanfarming.com',
        PUBLIC_VAPID_KEY,
        PRIVATE_VAPID_KEY
    );

    try {
        await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
        return json({ success: true });
    } catch (error) {
        console.error('Error sending push notification:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
