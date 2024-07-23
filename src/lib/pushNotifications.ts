import { supabase } from './supabaseClient';
import { PUBLIC_VAPID_KEY } from "$env/static/public";

function getDeviceType() {
    const ua = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
  
    if (/Android/i.test(ua)) {
      return screenWidth < 600 ? 'Android Phone' : 'Android Tablet';
    }
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      return /iPad/.test(ua) || Math.max(screenWidth, screenHeight) > 1000 ? 'iOS Tablet' : 'iPhone';
    }
    if (/Windows|Macintosh|Linux/.test(ua)) {
      return 'Desktop';
    }
    return 'Unknown';
  }

export async function getOrCreateDeviceId() {
    return new Promise((resolve, reject) => {
      console.log("Starting getOrCreateDeviceId...");
      const dbName = 'SKANStarterDB';
      const storeName = 'deviceInfo';
      const request = indexedDB.open(dbName, 1);
  
      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        reject('IndexedDB error');
      };
  
      request.onsuccess = (event) => {
        console.log("IndexedDB opened successfully");
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
  
        const getRequest = store.get('deviceId');
  
        getRequest.onsuccess = () => {
            let deviceInfo;
            if (getRequest.result) {
              console.log("Existing deviceId found:", getRequest.result);
              if (typeof getRequest.result === 'object' && getRequest.result.id && getRequest.result.type) {
                deviceInfo = getRequest.result;
              } else {
                // Existing ID found, but in old format. Update it.
                const existingId = typeof getRequest.result === 'object' ? getRequest.result.id : getRequest.result;
                deviceInfo = { id: existingId, type: getDeviceType() };
                store.put(deviceInfo, 'deviceId');
              }
            } else {
              console.log("No existing deviceId, creating new one");
              deviceInfo = { id: crypto.randomUUID(), type: getDeviceType() };
              store.put(deviceInfo, 'deviceId');
            }
            console.log("DeviceInfo:", deviceInfo);
            resolve(deviceInfo);
          };
          
  
        getRequest.onerror = (event) => {
          console.error("Error getting deviceId:", event);
          reject('Error getting deviceId');
        };
      };
  
      request.onupgradeneeded = (event) => {
        console.log("Upgrading or creating IndexedDB");
        const db = event.target.result;
        db.createObjectStore(storeName);
      };
    });
  }
  

  export async function subscribeToPushNotifications(userId) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const deviceInfo = await getOrCreateDeviceId();
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: PUBLIC_VAPID_KEY
        });
        console.log("Upserting subscription data:", {

            user_id: userId,
            device_id: deviceInfo.id,
            device_type: deviceInfo.type,
            subscription: JSON.stringify(subscription)
          });
          
        const { data, error } = await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          device_id: deviceInfo.id,
          device_type: deviceInfo.type,
          subscription: JSON.stringify(subscription)
        }, {
          onConflict: 'user_id, device_id'
        });
  
        if (error) {
          throw new Error(`Failed to save subscription: ${error.message}`);
        }
  
        return { success: true, subscription, deviceId: deviceInfo.id, deviceType: deviceInfo.type };
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
