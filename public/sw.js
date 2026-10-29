self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'DriveDoc', options: { body: event.data ? event.data.text() : '' } };
  }

  const title = data.title || 'DriveDoc';
  const options = { ...(data.options || {}) };

  if (!options.body && data.body) options.body = data.body;
  if (!options.icon) options.icon = '/icons/icon-192x192.png';
  if (!options.badge) options.badge = '/icons/badge-72x72.png';

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Focus any window already on this origin rather than requiring an exact
      // URL match — the app is a single page, so the path rarely lines up.
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(targetUrl).catch(() => {});
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
