/* Nomad AI — are the model lists still the same list?
   ------------------------------------------------------------------
   nomad-config.js names the models the browser will ask for; each proxy
   allowlists the ones it will forward. They are edited in different files
   for good reasons — one ships to the browser, the others hold the key —
   but nothing keeps them in step.

   There are two proxies while both hosts are live: the Netlify function and
   the Cloudflare Pages function. Checking only one was how the second would
   have drifted unnoticed.

   Drift is quiet and expensive. A model the config asks for and the proxy
   does not allow comes back 400; the app reads that as "could not reach
   Gemini", moves to the next model, and says nothing. The symptom is the
   assistant running out of answers early, and the cause looks like the key.

   Run: node check-models.mjs
*/
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');

function listFrom(src, marker) {
  const at = src.indexOf(marker);
  if (at === -1) return null;
  const open = src.indexOf('[', at);
  const close = src.indexOf(']', open);
  if (open === -1 || close === -1) return null;
  return src.slice(open + 1, close)
    .split(',')
    .map((s) => (s.match(/'([^']+)'/) || [])[1])
    .filter(Boolean);
}

const config = listFrom(read('./nomad-config.js'), 'geminiModels');

const PROXIES = [
  ['netlify', './netlify/functions/ai.mjs'],
  ['cloudflare', './functions/api/ai.js']
];

const proxies = PROXIES.map(([name, file]) => [name, listFrom(read(file), 'const ALLOWED')]);

if (!config || proxies.some(([, list]) => !list)) {
  console.error('could not read one of the lists — has any of those files been restructured?');
  process.exit(2);
}

let missingTotal = 0;

for (const [name, proxy] of proxies) {
  const missing = config.filter((m) => !proxy.includes(m));   // asked for, refused
  const extra = proxy.filter((m) => !config.includes(m));     // allowed, never used

  for (const m of missing) console.error('config asks for %s but the %s proxy rejects it', m, name);
  for (const m of extra) console.warn('the %s proxy allows %s but the config never asks for it', name, m);

  missingTotal += missing.length;
}

// The two proxies answer the same routes on different hosts, so a model
// allowed by one and not the other means the assistant's fallback chain is a
// different length depending on where a visitor landed.
const [[, netlify], [, cloudflare]] = proxies;
for (const m of netlify.filter((x) => !cloudflare.includes(x))) {
  console.error('%s is allowed on netlify but not on cloudflare', m);
  missingTotal++;
}
for (const m of cloudflare.filter((x) => !netlify.includes(x))) {
  console.error('%s is allowed on cloudflare but not on netlify', m);
  missingTotal++;
}

// An alias shares its quota with the version it points at, so listing both
// looks like extra capacity and is not.
const aliases = config.filter((m) => m.endsWith('-latest'));
for (const a of aliases) console.warn('%s is an alias: it shares a daily quota with whichever version it resolves to', a);

if (missingTotal) process.exit(1);
console.log('%d models, all %d lists agree', config.length, proxies.length + 1);
