/* Nomad AI — service worker.
   ------------------------------------------------------------------
   Makes the app installable and lets it open without a connection.

   ⚠ BUMP `VERSION` whenever you change any file listed in SHELL — and
   bump the `?v=` in index.html with it. An installed app keeps serving
   the old cache until this string changes; that is the whole point of a
   service worker, and it is also how a stale build survives a reload.

   What is cached, and why it is split:
     shell   the app itself. Precached on install, so the first offline
             open works rather than only the second.
     photo   place photographs. 7.8 MB of them — far too much to precache,
             so they are kept as they are actually looked at.
     tile    map tiles. Cached as they are panned over, capped, because the
             whole country at every zoom is unbounded.
     vendor  Leaflet and the web font, which come from a CDN.

   Never cached: the Gemini and 2GIS APIs, and OSRM routing. Answers,
   transport departures and routes are not reusable, and a stale one is
   worse than an honest failure. */

var VERSION = 'v17';

var SHELL_CACHE  = 'nomad-shell-'  + VERSION;
var PHOTO_CACHE  = 'nomad-photo-'  + VERSION;
var TILE_CACHE   = 'nomad-tile-'   + VERSION;
var VENDOR_CACHE = 'nomad-vendor-' + VERSION;

var KEEP = [SHELL_CACHE, PHOTO_CACHE, TILE_CACHE, VENDOR_CACHE];

/* Every local file index.html loads, plus the icons an installed app
   needs. Listed without `?v=`; lookups ignore the query string. */
var SHELL = [
  './',
  'index.html',
  'styles.css',
  'data.js',
  'phrase-audio.js',
  'badges.js',
  'photos.js',
  'image-slot.js',
  'nomad-config.js',
  'nomad-places.js',
  'nomad-branches.js',
  'nomad-2gis.js',
  'nomad-engine.js',
  'app.js',
  'install.js',
  'manifest.webmanifest',
  'favicon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
  'logo-mark.png',
  'logo-mark-cream.png',
  'logo-mark-ink.png',
  'logo-word.png',
  'logo-word-cream.png',
  'logo-word-ink.png'
];

/* Hosts whose answers are specific to one moment and one question. */
var NEVER_CACHE = [
  'generativelanguage.googleapis.com',
  'catalog.api.2gis.com',
  'router.project-osrm.org'
];

var TILE_HOST   = 'tile.openstreetmap.org';
var VENDOR_HOSTS = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

var TILE_LIMIT = 400;   // roughly a city at a few zoom levels

/* Where this worker is served from. On a project site the app lives under
   a path — /nomadaiapp/ — not at the root, so anything matching on
   pathname has to start from here rather than from '/'. */
var BASE = new URL('./', self.location).pathname;

/* ── install / activate ─────────────────────────────────────────────── */

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      /* One addAll would abandon the whole precache if a single file 404s.
         Each file is added on its own so a typo in this list costs that
         file, not the entire offline mode. */
      return Promise.all(SHELL.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' }))['catch'](function (err) {
          console.warn('[sw] could not precache', url, err);
        });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (n) {
        // Drop this app's caches from older versions, leave anything else alone.
        if (n.indexOf('nomad-') === 0 && KEEP.indexOf(n) === -1) return caches['delete'](n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Lets the page trigger an update without the user hunting for a reload.
self.addEventListener('message', function (e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

/* ── strategies ─────────────────────────────────────────────────────── */

/** Cached copy wins; otherwise fetch and keep it. Used for immutable things. */
function cacheFirst(request, cacheName, limit) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (res) {
        /* Opaque responses (no-cors, e.g. tiles and fonts) have status 0.
           They cannot be inspected, but they can be stored and replayed,
           which is exactly what an offline map needs. */
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(request, res.clone());
          if (limit) trim(cache, limit);
        }
        return res;
      });
    });
  });
}

/** Network wins so edits show up; the cache is the fallback when it fails. */
function networkFirst(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(request).then(function (res) {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })['catch'](function () {
      return cache.match(request, { ignoreSearch: true }).then(function (hit) {
        // A navigation that misses still has somewhere to land.
        return hit || cache.match('index.html', { ignoreSearch: true });
      });
    });
  });
}

/** Oldest-first eviction. Cache keys come back in insertion order. */
function trim(cache, limit) {
  cache.keys().then(function (keys) {
    if (keys.length <= limit) return;
    for (var i = 0; i < keys.length - limit; i++) cache['delete'](keys[i]);
  });
}

/* ── routing ────────────────────────────────────────────────────────── */

self.addEventListener('fetch', function (e) {
  var req = e.request;

  // Anything that changes server state is none of our business.
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (NEVER_CACHE.indexOf(url.hostname) !== -1) return;   // straight to network

  /* The server functions. Same origin, so without this they would fall into
     the app-shell branch at the bottom and the assistant would start
     replaying one cached answer to every question. /api/transit sets its own
     Cache-Control instead, which the HTTP cache honours on its own. */
  if (url.origin === self.location.origin &&
      url.pathname.indexOf(BASE + 'api/') === 0) return;

  // The app shell, opened offline.
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, SHELL_CACHE));
    return;
  }

  if (url.hostname === TILE_HOST) {
    e.respondWith(cacheFirst(req, TILE_CACHE, TILE_LIMIT));
    return;
  }

  if (VENDOR_HOSTS.indexOf(url.hostname) !== -1) {
    e.respondWith(cacheFirst(req, VENDOR_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return;   // anything else remote

  // Place photographs: kept as they are looked at, not up front.
  if (url.pathname.indexOf(BASE + 'img/') === 0 || /\.(jpg|jpeg|webp|avif)$/i.test(url.pathname)) {
    e.respondWith(cacheFirst(req, PHOTO_CACHE, 120));
    return;
  }

  /* The app's own files. `ignoreSearch` is what lets the precache list
     stay free of `?v=` while index.html keeps using it. */
  e.respondWith(
    caches.open(SHELL_CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        var live = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })['catch'](function () { return hit; });
        // Cached copy immediately, fresh copy for the next load.
        return hit || live;
      });
    })
  );
});
