const CACHE = 'pigcanfly-v2';
const ASSETS = [
  '/pig-can-fly/',
  '/pig-can-fly/index.html',
  '/pig-can-fly/game.js',
  '/pig-can-fly/manifest.json',
  '/pig-can-fly/assets/pig_run_sheet.png',
  '/pig-can-fly/assets/pigfly_anim.png',
  '/pig-can-fly/assets/pigjump0wing.jpg',
  '/pig-can-fly/assets/pigflymo0bg.jpg',
  '/pig-can-fly/assets/icon-192.png',
  '/pig-can-fly/assets/icon-512.png',
  '/pig-can-fly/pigmouthopen.PNG',
  '/pig-can-fly/pigflymouthclose.PNG',
  '/pig-can-fly/pigrun.PNG'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
