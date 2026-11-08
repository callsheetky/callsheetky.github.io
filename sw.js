/* CallSheet service worker: network first, never serves a stale app.js when a new one is published.
   Only the shell files are cached, as a fallback when the phone is offline. */
const CACHE = "callsheet-shell-v1";
const SHELL = ["/", "/index.html", "/app.css", "/manifest.json", "/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok && SHELL.includes(u.pathname)) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
    .catch(() => caches.match(e.request).then(m => m || (u.pathname === "/" || u.pathname.endsWith(".html") ? caches.match("/index.html") : undefined))));
});
