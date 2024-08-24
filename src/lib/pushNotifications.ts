import { PUBLIC_VAPID_APPLICATION_SERVER_KEY, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { supabase } from './supabaseClient';

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

async function generateVapidKeys() {
    const response = await fetch('https://hmxxqacnzxqpcheoeidn.supabase.co/functions/v1/generate-vapid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteHhxYWNuenhxcGNoZW9laWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1MDg1OTcsImV4cCI6MjA0MDA4NDU5N30.qvxhdJBSRY14wOBbOM9blJgmmfNYvRXY1nJFvmZCZIs'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to generate VAPID keys');
    }

    return await response.json();
}




export async function subscribeToPushNotifications(userId) {
    console.log('Starting subscribeToPushNotifications for user:', userId);

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const deviceInfo = await getOrCreateDeviceId();
            console.log('Device info:', deviceInfo);

            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker is ready');

            const applicationServerKey = new Uint8Array(JSON.parse(PUBLIC_VAPID_APPLICATION_SERVER_KEY));
            console.log('Application Server Key:', applicationServerKey);

            const existingSubscription = await registration.pushManager.getSubscription();
            let subscription;

            if (existingSubscription) {
                console.log('Existing subscription found:', existingSubscription);
                const existingKey = new Uint8Array(existingSubscription.options.applicationServerKey);
                if (!arrayBufferEqual(existingKey, applicationServerKey)) {
                    console.log("Existing subscription uses different key, unsubscribing...");
                    await existingSubscription.unsubscribe();
                    console.log("Unsubscribed from existing subscription");
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerKey
                    });
                    console.log('New subscription created:', subscription);
                } else {
                    console.log("Existing subscription is valid, reusing");
                    subscription = existingSubscription;
                }
            } else {
                console.log('No existing subscription found');
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
                console.log('New subscription created:', subscription);
            }

            console.log('Saving subscription to database...');
            const { data, error } = await supabase.from('push_subscriptions').upsert({
                user_id: userId,
                device_id: deviceInfo.id,
                device_type: deviceInfo.type,
                subscription: JSON.stringify(subscription)
            }, {
                onConflict: 'user_id, device_id'
            });

            if (error) {
                console.error('Error saving subscription to database:', error);
                throw new Error(`Failed to save subscription: ${error.message}`);
            }

            console.log('Subscription saved successfully:', data);
            return { success: true };
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            return { success: false, error: error.message };
        }
    } else {
        console.log('Push notifications not supported');
        return { success: false, error: 'Push notifications not supported' };
    }
}



// Helper function to compare ArrayBuffers
function arrayBufferEqual(buf1, buf2) {
    if (buf1.byteLength !== buf2.byteLength) return false;
    const dv1 = new Int8Array(buf1);
    const dv2 = new Int8Array(buf2);
    for (let i = 0; i !== buf1.byteLength; i++) {
        if (dv1[i] !== dv2[i]) return false;
    }
    return true;
}


export async function sendPushNotification(subscription, title, body) {
    console.log('Sending push notification...', subscription, title, body);

    try {
        const response = await fetch('https://hmxxqacnzxqpcheoeidn.supabase.co/functions/v1/send-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                subscription,
                title,
                body
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send push notification');
        }

        const result = await response.json();
        console.log('Push notification sent successfully:', result);

        return { success: true, ...result };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error: error.message };
    }
}
