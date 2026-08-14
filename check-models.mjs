/* Nomad AI — are the two model lists still the same list?
   ------------------------------------------------------------------
   nomad-config.js names the models the browser will ask for; ai.mjs
   allowlists the ones the proxy will forward. They are edited in different
   files for good reasons — one ships to the browser, one holds the key —
   but nothing keeps them in step.

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
const proxy = listFrom(read('./netlify/functions/ai.mjs'), 'const ALLOWED');

if (!config || !proxy) {
  console.error('could not read one of the lists — has either file been restructured?');
  process.exit(2);
}

const missing = config.filter((m) => !proxy.includes(m));   // asked for, refused
const extra = proxy.filter((m) => !config.includes(m));     // allowed, never used

for (const m of missing) console.error('config asks for %s but the proxy rejects it', m);
for (const m of extra) console.warn('proxy allows %s but the config never asks for it', m);

// An alias shares its quota with the version it points at, so listing both
// looks like extra capacity and is not.
const aliases = config.filter((m) => m.endsWith('-latest'));
for (const a of aliases) console.warn('%s is an alias: it shares a daily quota with whichever version it resolves to', a);

if (missing.length) process.exit(1);
console.log('%d models, both lists agree', config.length);
