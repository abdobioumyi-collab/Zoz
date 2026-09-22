// Service Worker بسيط — الغرض الأساسي منه إن المتصفح يعتبر الموقع "قابل للتثبيت"
// وتظهر خاصية "إضافة للشاشة الرئيسية" / "تثبيت كبرنامج".
const CACHE_NAME = 'mz-platform-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// أبسط استراتيجية ممكنة: نمرر كل طلب زي ما هو من الإنترنت (من غير أي تخزين مؤقت)
// عشان منعملش مشاكل مع بيانات Supabase الحيّة. الهدف بس تحقيق شرط التثبيت.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
