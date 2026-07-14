// Chat push/local notification worker for HK chat.
// Scope: shows notifications and focuses the app when clicked.
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'chat-notify') {
    const { title, body, url, tag } = data;
    event.waitUntil(
      self.registration.showNotification(title || 'رسالة جديدة', {
        body: body || '',
        tag: tag || 'hk-chat',
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        data: { url: url || '/' },
        renotify: true,
        vibrate: [200, 100, 200],
        silent: false,
        requireInteraction: false,
      })
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { title: 'رسالة جديدة', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'رسالة جديدة', {
      body: payload.body || '',
      tag: payload.tag || 'hk-chat',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      data: { url: payload.url || '/' },
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      silent: false,
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clientsArr) {
      try {
        const u = new URL(c.url);
        if (u.origin === self.location.origin) {
          await c.focus();
          if (c.navigate) { try { await c.navigate(target); } catch {} }
          return;
        }
      } catch {}
    }
    await self.clients.openWindow(target);
  })());
});
