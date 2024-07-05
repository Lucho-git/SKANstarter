import { build, files, prerendered, version } from '$service-worker';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

const APP_VERSION = '1.0.1'; // Add this line

const precache_list = [...build, ...files, ...prerendered].map((s) => ({
  url: s,
  revision: `${version}-${APP_VERSION}`, // Update this line
}));

precacheAndRoute(precache_list);

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
