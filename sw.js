// Keeps Bridge Bid working with no signal. App files load fresh when online, from the phone when offline.
const CACHE = "bridge-bid-v2";
const SHELL = ["./", "./index.html", "./config.js", "./manifest.webmanifest",
  "./vendor/jspdf.umd.min.js", "./vendor/msal-browser.min.js", "./icons/apple-touch-icon.png", "./icons/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const keep = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(keep).catch(() =>
      caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("./index.html"))));
  } else if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(keep)));
  }
});
