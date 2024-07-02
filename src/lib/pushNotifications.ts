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

      const { data, error } = await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription)
      }, {
        onConflict: 'user_id'
      });

      if (error) {
        throw new Error(`Failed to save subscription: ${error.message}`);
      }

      return { success: true, subscription };
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'Push notifications not supported' };
  }
}

export async function sendPushNotification(subscription, title, body) {
  console.log('Sending push notification...');
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription, title, body }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send push notification');
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
}
