/* Nomad AI — Gemini, called from the server so the key never ships.
   ------------------------------------------------------------------
   Cloudflare Pages Function. Ported from netlify/functions/ai.mjs, which
   stays in the tree so the Netlify site can still be rolled back to.

   The browser used to hold the key and call Google directly, which meant
   the key was readable by every visitor and the whole free tier — about
   twenty requests a day per model — could be drained by one script.

   Now the page posts the same body here and this adds the key. Set
   GEMINI_API_KEY as an encrypted secret on the Pages project; it is never
   sent to the browser and never appears in the repo.

   The page still chooses the model, so the existing fallback chain keeps
   working: when one model reports no quota left, it moves to the next.

   Three things differ from the Netlify original, and only three:
     · the route comes from this file's path (functions/api/ai.js → /api/ai)
       rather than an exported `config.path`;
     · the key arrives as `env.GEMINI_API_KEY`, not `process.env`;
     · the client IP header is Cloudflare's `CF-Connecting-IP`. */

const UPSTREAM = 'https://generativelanguage.googleapis.com/v1beta/models';

/* Only the models the app actually lists. Without this the path is an open
   proxy to anything Google hosts, spent against your key.

   ⚠ Must match geminiModels in nomad-config.js — check-models.mjs verifies
   it. A model listed there and missing here is rejected with a 400, which
   the app reads as "could not reach Gemini" and moves past: quiet, and it
   costs you that model's whole daily quota.

   The `-latest` aliases are deliberately absent: each is a second name for
   a version already in this list and shares its quota, so allowing both
   only makes it harder to tell what is being spent. */
const ALLOWED = new Set([
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview'
]);

const MAX_BODY = 200 * 1024;   // the PLACES block is large; a question is not

/* Best-effort throttle. Cloudflare spreads requests across isolates and
   recycles them, so this is a speed bump against one client hammering the
   endpoint, not a real quota — the same caveat the Netlify version carried.
   For a hard limit use Cloudflare's Rate Limiting rules or a KV counter. */
const seen = new Map();
const WINDOW_MS = 60_000;
/* Six models at twenty requests a day is a hundred and twenty for everyone
   combined, so a per-minute ceiling of twelve let one client spend the lot in
   ten minutes. Four a minute still answers faster than anyone reads. */
const MAX_PER_WINDOW = 4;

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

/* Shaped like Google's own error, so the page's existing handling reads it.
   `status` matters: the page uses it to tell this proxy's own refusal from
   Google's. Both are 429, and retiring a model on ours would burn the whole
   fallback chain over a quota that was never touched. */
const fail = (message, status, code) =>
  json({ error: { message, code: status, status: code || 'PROXY_ERROR' } }, status);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return fail('Use POST.', 405);

  /* 403, not 500. The page retries the next model on any 5xx, so a missing
     key used to fail all six in turn, empty the chain, and surface as "out of
     free quota for today" — the one message guaranteed to send you looking at
     Google instead of at this deployment. 403 is what the page reads as a
     credentials problem, and it stops the chain on the first model. */
  const key = env.GEMINI_API_KEY;
  if (!key) return fail('GEMINI_API_KEY is not set on this site.', 403, 'PROXY_NO_KEY');

  const model = new URL(request.url).searchParams.get('model') || '';
  if (!ALLOWED.has(model)) return fail('Unknown model: ' + model, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (throttled(ip)) return fail('Too many questions in a row. Wait a minute.', 429, 'PROXY_THROTTLED');

  const body = await request.text();
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
}
