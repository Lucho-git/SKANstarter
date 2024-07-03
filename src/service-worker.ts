import { build, files, prerendered, version } from '$service-worker';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

const precache_list = [...build, ...files, ...prerendered].map((s) => ({
  url: s,
  revision: version,
}));

precacheAndRoute(precache_list);
//Tawk bullshit



const TAWK_API_URL = 'https://api.tawk.to/v3/chats'; // Replace with the correct Tawk.to API endpoint
const TAWK_API_KEY = 'YOUR_TAWK_API_KEY'; // Replace with your actual API key
const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

async function checkForNewMessages() {
  try {
    const response = await fetch(TAWK_API_URL, {
      headers: {
        'Authorization': `Bearer ${TAWK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    // Process the data and check for new messages
    // This will depend on how you're tracking what's "new"
    const newMessages = processNewMessages(data);

    if (newMessages.length > 0) {
      // Send a push notification for new messages
      self.registration.showNotification('New Messages', {
        body: `You have ${newMessages.length} new messages`,
        icon: '/favicon.png',
        badge: '/badge.png'
      });
    }
  } catch (error) {
    console.error('Error checking for new messages:', error);
  }
}

function processNewMessages(data) {
  // Implement your logic to determine new messages
  // This might involve storing the last checked message ID in IndexedDB
  // and comparing it with the fetched messages
  // Return an array of new messages
}

// Set up periodic sync if supported
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-new-messages') {
      event.waitUntil(checkForNewMessages());
    }
  });

  // Register the periodic sync
  async function registerPeriodicSync() {
    try {
      await self.registration.periodicSync.register('check-new-messages', {
        minInterval: POLL_INTERVAL
      });
    } catch (error) {
      console.error('Periodic Sync could not be registered:', error);
    }
  }

  registerPeriodicSync();
} else {
  // Fallback for browsers that don't support periodicSync
  setInterval(checkForNewMessages, POLL_INTERVAL);
}

// Existing push and notificationclick event listeners
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.png',
    badge: '/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});








self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.png',
    badge: '/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://www.skanfarming.com.au/account')
  );
});
