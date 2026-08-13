/* Nomad AI — Gemini, called from the server so the key never ships.
   ------------------------------------------------------------------
   The browser used to hold the key and call Google directly, which meant
   the key was readable by every visitor and the whole free tier — about
   twenty requests a day per model — could be drained by one script.

   Now the page posts the same body here and this adds the key. Set
   GEMINI_API_KEY in the Netlify site's environment variables; it is never
   sent to the browser and never appears in the repo.

   The page still chooses the model, so the existing fallback chain keeps
   working: when one model reports no quota left, it moves to the next. */

const UPSTREAM = 'https://generativelanguage.googleapis.com/v1beta/models';

/* Only the models the app actually lists. Without this the path is an open
   proxy to anything Google hosts, spent against your key. */
const ALLOWED = new Set([
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite'
]);

const MAX_BODY = 200 * 1024;   // the PLACES block is large; a question is not

/* Best-effort throttle. Netlify may run several instances and recycles them,
   so this is a speed bump against one client hammering the endpoint, not a
   real quota. For a hard limit use Netlify's own rate limiting or a store. */
const seen = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

function throttled(ip) {
  const now = Date.now();
  const hits = (seen.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 500) {           // keep the map from growing without bound
    for (const [k, v] of seen) if (!v.length || now - v[v.length - 1] > WINDOW_MS) seen.delete(k);
  }
  return hits.length > MAX_PER_WINDOW;
}

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

// Shaped like Google's own error, so the page's existing handling reads it.
const fail = (message, status) => json({ error: { message, code: status } }, status);

export default async (req) => {
  if (req.method !== 'POST') return fail('Use POST.', 405);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail('GEMINI_API_KEY is not set on this site.', 500);

  const model = new URL(req.url).searchParams.get('model') || '';
  if (!ALLOWED.has(model)) return fail('Unknown model: ' + model, 400);

  const ip = req.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (throttled(ip)) return fail('Too many questions in a row. Wait a minute.', 429);

  const body = await req.text();
  if (body.length > MAX_BODY) return fail('Question too large.', 413);

  let upstream;
  try {
    upstream = await fetch(`${UPSTREAM}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body
    });
  } catch (e) {
    return fail('Could not reach Gemini: ' + e.message, 502);
  }

  /* Passed through untouched, status included: the page already knows what
     to do with a 429 (try the next model) and with an error message. */
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
};

export const config = { path: '/api/ai' };
