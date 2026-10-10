// Service Worker بسيط — الغرض الأساسي منه إن المتصفح يعتبر الموقع "قابل للتثبيت"
// وتظهر خاصية "إضافة للشاشة الرئيسية" / "تثبيت كبرنامج".
// + استقبال إشعارات Web Push وعرضها حتى لو التطبيق مقفول.
const CACHE_NAME = 'mz-platform-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// أبسط استراتيجية ممكنة: نمرر كل طلب زي ما هو من الإنترنت (من غير أي تخزين مؤقت)
// عشان منعملش مشاكل مع بيانات Supabase الحيّة. الهدف بس تحقيق شرط التثبيت.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// ===== Web Push =====
// الرقم على أيقونة التطبيق = عدد الإشعارات الظاهرة حاليًا (ما اتفتحتش لسه)
async function mzUpdateBadge() {
  try {
    const list = await self.registration.getNotifications();
    if (list.length > 0) {
      if (self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(list.length);
    } else if (self.navigator && self.navigator.clearAppBadge) {
      await self.navigator.clearAppBadge();
    }
  } catch (_) {}
}

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; }
  catch (_) { d = { title: 'إشعار جديد', body: event.data ? event.data.text() : '' }; }
  event.waitUntil((async () => {
    await self.registration.showNotification(d.title || 'إشعار جديد', {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'badge.png',
      tag: d.tag || ('n-' + Date.now()),
      renotify: true,
      vibrate: [120, 60, 120],
      timestamp: Date.now(),
      dir: 'rtl',
      lang: 'ar',
      data: { url: d.url || './' }
    });
    await mzUpdateBadge();
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async () => {
    await mzUpdateBadge();
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  })());
});

self.addEventListener('notificationclose', (event) => {
  event.waitUntil(mzUpdateBadge());
});
