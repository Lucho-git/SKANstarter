import { supabase } from './supabaseClient';
import { PUBLIC_VAPID_KEY } from "$env/static/public";

export async function subscribeToPushNotifications(userId) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY
      });

      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription)
      }, {
        onConflict: 'user_id'
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }
}

export async function sendPushNotification(subscription, title, body) {
    console.log('Sending push notification...');
  const response = await fetch('/api/send-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscription, title, body }),
  });

  if (!response.ok) {
    throw new Error('Failed to send push notification');
  }

  return response.json();
}
