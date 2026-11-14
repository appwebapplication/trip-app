// Opens the app page from phone memory, then updates it quietly (new version shows on the next open)
var C = 'tripledger-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;   // server calls are never cached
  e.respondWith(caches.open(C).then(function (c) {
    return c.match(r, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(r).then(function (res) {
        if (res && res.ok) c.put(r, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
