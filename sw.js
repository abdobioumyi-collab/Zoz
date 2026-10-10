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
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; }
  catch (_) { d = { title: 'إشعار جديد', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(d.title || 'إشعار جديد', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || undefined,
    dir: 'rtl',
    lang: 'ar',
    data: { url: d.url || './' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
