/* Nomad AI — 2GIS Catalog, called from the server so the key never ships.
   ------------------------------------------------------------------
   Cloudflare Pages Function. Ported from netlify/functions/transit.mjs,
   which stays in the tree so the Netlify site can still be rolled back to.

   Same reasoning as ai.js: the browser used to carry the key. It now
   sends the query it wants and this attaches TWOGIS_API_KEY, set as an
   encrypted secret on the Pages project.

   ⚠ The parameter allowlist alone was not a limit. It permitted exactly the
   fields 2GIS's own search endpoint takes, so the function was a general
   business-search API for the entire 2GIS coverage area, open to anyone who
   found the URL and billed to your key — `?q=pizza&location=37.62,55.75`
   returned Moscow restaurants. Three things bound it to this app now:

     · a geofence. Every search this app makes is in Kyrgyzstan, so a point
       or location outside the country's bounding box is refused.
     · a rate limit, per client, in the same shape as ai.js.
     · a page_size ceiling, because paging is how a scraper goes wide.

   The app's own three queries — stops near a point, a place by name, and the
   branches of one org — all pass.

   Differences from the Netlify original, and only these: the route comes
   from this file's path (functions/api/transit.js → /api/transit), the key
   arrives as `env.TWOGIS_API_KEY`, and the client IP header is
   Cloudflare's `CF-Connecting-IP`. */

const UPSTREAM = 'https://catalog.api.2gis.com/3.0/items';

/* The parameters nomad-2gis.js actually sends. Anything else is dropped
   rather than forwarded. */
const ALLOWED = new Set([
  'q',        // stopsNear, branchesOf — the search term
  'type',     // 'station'
  'point',    // lng,lat for a radius search
  'radius',
  'location', // lng,lat bias for a name search
  'org_id',   // every branch of one chain
  'page', 'page_size',
  'fields',
  'locale'
]);

/* Kyrgyzstan, generously. Every coordinate this app asks about is inside it;
   nothing legitimate falls outside. */
const BOUNDS = { west: 69.0, east: 80.5, south: 39.0, north: 43.4 };

const MAX_PAGE_SIZE = 10;   // 2GIS caps it here anyway
const MAX_PAGE = 20;        // 200 rows is far past anything the app shows

/* Best-effort throttle, as in ai.js: Cloudflare spreads requests across
   isolates and recycles them, so this is a speed bump rather than a hard
   quota. */
const seen = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;   // the app can issue a handful per place opened

function throttled(ip) {
  const now = Date.now();
  const hits = (seen.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 500) {
    for (const [k, v] of seen) if (!v.length || now - v[v.length - 1] > WINDOW_MS) seen.delete(k);
  }
  return hits.length > MAX_PER_WINDOW;
}

const fail = (message, status) =>
  new Response(JSON.stringify({ meta: { code: status, error: { message } } }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

/** "lng,lat" inside the fence? Returns false for anything unparseable. */
function insideKyrgyzstan(value) {
  const parts = String(value).split(',');
  if (parts.length !== 2) return false;
  const lng = Number(parts[0]), lat = Number(parts[1]);
  if (!isFinite(lng) || !isFinite(lat)) return false;
  return lng >= BOUNDS.west && lng <= BOUNDS.east &&
         lat >= BOUNDS.south && lat <= BOUNDS.north;
}

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return fail('Use GET.', 405);

  const key = env.TWOGIS_API_KEY;
  if (!key) return fail('TWOGIS_API_KEY is not set on this site.', 500);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (throttled(ip)) return fail('Too many lookups in a row. Wait a minute.', 429);

  const incoming = new URL(request.url).searchParams;

  /* Every query must say where it is about, and be about Kyrgyzstan. org_id
     is exempt: it asks for the branches of one business we already found
     inside the fence, and carries no coordinate of its own. */
  const where = incoming.get('point') || incoming.get('location');
  if (!where && !incoming.get('org_id')) {
    return fail('A location is required.', 400);
  }
  if (where && !insideKyrgyzstan(where)) {
    return fail('This endpoint only serves Kyrgyzstan.', 403);
  }

  const out = new URL(UPSTREAM);
  for (const [k, v] of incoming) {
    if (!ALLOWED.has(k)) continue;
    if (k === 'page_size') {
      out.searchParams.set(k, String(Math.min(Number(v) || 10, MAX_PAGE_SIZE)));
    } else if (k === 'page') {
      out.searchParams.set(k, String(Math.min(Math.max(Number(v) || 1, 1), MAX_PAGE)));
    } else {
      out.searchParams.set(k, v);
    }
  }
  // Set last, and never from the caller.
  out.searchParams.set('key', key);

  let upstream;
  try {
    upstream = await fetch(out);
  } catch (e) {
    return fail('Could not reach 2GIS: ' + e.message, 502);
  }

  const body = await upstream.text();

  /* Only a good answer is worth keeping. Caching a failure for a day meant
     one exhausted quota or one 5xx from 2GIS pinned an error into the CDN
     and every browser that touched it, long after the cause had passed.
     2GIS reports "nothing found" as meta.code 404 inside a 200 response, so
     the upstream HTTP status alone is not enough to judge by. */
  let ok = upstream.ok;
  if (ok) {
    try { ok = (JSON.parse(body).meta || {}).code === 200; } catch (e) { ok = false; }
  }

  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json',
      'cache-control': ok
        ? 'public, max-age=3600, s-maxage=86400'   // stops do not move
        : 'no-store'
    }
  });
}
