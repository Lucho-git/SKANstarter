import { build, files, prerendered, version } from '$service-worker';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

const precache_list = [...build, ...files, ...prerendered].map((s) => ({
  url: s,
  revision: version,
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
