/* Nomad AI — 2GIS Catalog, called from the server so the key never ships.
   ------------------------------------------------------------------
   Same reasoning as ai.mjs: the browser used to carry the key. It now
   sends the query it wants and this attaches TWOGIS_API_KEY, set in the
   Netlify site's environment variables.

   The query is forwarded as-is apart from the key, so nomad-2gis.js keeps
   building its own requests and nothing here needs to know what a stop is.

   Unlike the assistant, these answers are worth caching: a bus stop is in
   the same place an hour from now. */

const UPSTREAM = 'https://catalog.api.2gis.com/3.0/items';

/* The parameters nomad-2gis.js actually sends. Anything else is dropped
   rather than forwarded, so this cannot be used as a general 2GIS proxy
   billed to your key. */
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

const fail = (message, status) =>
  new Response(JSON.stringify({ meta: { code: status, error: { message } } }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

export default async (req) => {
  const key = process.env.TWOGIS_API_KEY;
  if (!key) return fail('TWOGIS_API_KEY is not set on this site.', 500);

  const incoming = new URL(req.url).searchParams;
  const out = new URL(UPSTREAM);
  for (const [k, v] of incoming) {
    if (ALLOWED.has(k)) out.searchParams.set(k, v);
  }
  // Set last, and never from the caller.
  out.searchParams.set('key', key);

  let upstream;
  try {
    upstream = await fetch(out);
  } catch (e) {
    return fail('Could not reach 2GIS: ' + e.message, 502);
  }

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      'content-type': 'application/json',
      // An hour in the browser, a day on the CDN. Stops do not move.
      'cache-control': 'public, max-age=3600, s-maxage=86400'
    }
  });
};

export const config = { path: '/api/transit' };
