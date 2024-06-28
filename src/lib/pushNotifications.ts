import { supabase } from './supabaseClient';
import {
    PUBLIC_VAPID_KEY  } from "$env/static/public"
const publicVapidKey = PUBLIC_VAPID_KEY

export async function subscribeToPushNotifications(userId) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
      });

      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }
}

export async function sendPushNotification(recipientId, title, body) {
  const { data, error } = await supabase.functions.invoke('send-push-notification', {
    body: { recipientId, title, body }
  });

  if (error) console.error('Error sending push notification:', error);
  return data;
}