/* Nomad AI — put the API keys on the Cloudflare Pages project, from .env.
   ------------------------------------------------------------------
   Replaces clicking through Settings → Variables and Secrets twice. Run it
   once per project (and again whenever a key is rotated):

     node push-secrets.mjs

   It reads .env — the file you already keep — and uploads each key to the
   Pages project named in wrangler.toml as an encrypted Secret. Cloudflare
   stores them; the functions in functions/api/ read them as env.*; the
   browser never sees them; nothing is written to the repo.

   ── Why the keys are not simply committed ────────────────────────────────
   julafrll/nomadaiapp is a public repository. GitHub scans public pushes for
   credentials and reports Google API keys to Google, which revokes them
   automatically. A committed GEMINI_API_KEY would therefore not save a step;
   it would kill the assistant a few hours after the first push, with nothing
   in the app to explain why. The 2GIS key would stay alive and be spendable
   by anyone who read the repo.

   ── The one thing that cannot be automated ───────────────────────────────
   Cloudflare has to know it is you. Run this once, ever:

     wrangler login

   That opens a browser and stores a token on this machine. It is the same
   consent the dashboard asks for, given once instead of per key. There is no
   fourth option: the keys reach Cloudflare through the dashboard, through an
   authenticated CLI, or through the repo — and the repo is public.
*/
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const KEYS = ['GEMINI_API_KEY', 'TWOGIS_API_KEY'];

const read = (file) => {
  try {
    return readFileSync(new URL(file, import.meta.url), 'utf8');
  } catch {
    return null;
  }
};

/** KEY=value, ignoring comments, blank lines and surrounding quotes. */
function parseEnv(src) {
  const out = {};
  for (const line of src.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const envFile = read('./.env') ?? read('./.dev.vars');
if (!envFile) {
  console.error('No .env (or .dev.vars) here. Copy .env.example, fill in both keys, and run again.');
  process.exit(2);
}

const env = parseEnv(envFile);

const missing = KEYS.filter((k) => !env[k]);
if (missing.length) {
  console.error('Missing from .env: %s', missing.join(', '));
  process.exit(2);
}

const toml = read('./wrangler.toml') ?? '';
const project = (toml.match(/^\s*name\s*=\s*"([^"]+)"/m) || [])[1];
if (!project) {
  console.error('Could not read the project name from wrangler.toml.');
  process.exit(2);
}

/* wrangler is not a dependency of this app — there is no package.json — so it
   runs through npx. The first call may pause to fetch it. */
const wrangler = (args, input) =>
  spawnSync('npx', ['--yes', 'wrangler@3', ...args], {
    input,
    encoding: 'utf8',
    shell: process.platform === 'win32'   // npx is npx.cmd on Windows
  });

const who = wrangler(['whoami']);
if (/not authenticated/i.test((who.stdout || '') + (who.stderr || ''))) {
  console.error('Not logged in to Cloudflare. Run `npx wrangler login` first, then run this again.');
  process.exit(1);
}

console.log('Project: %s\n', project);

let failed = 0;
for (const key of KEYS) {
  /* The value goes in on stdin so it never appears in the command line, where
     it would be visible to `ps` and saved in the shell history. */
  const res = wrangler(['pages', 'secret', 'put', key, '--project-name', project], env[key] + '\n');
  const ok = res.status === 0;
  if (!ok) failed++;
  console.log('  %s  %s%s', ok ? '✓' : '✗', key, ok ? '' : ' — ' + (res.stderr || '').trim().split('\n').pop());
}

if (failed) {
  console.error('\n%d of %d failed. If the project does not exist yet, create it first by ' +
    'connecting the repo in the Cloudflare dashboard, then run this again.', failed, KEYS.length);
  process.exit(1);
}

console.log('\nBoth keys are on the Pages project. Redeploy for them to take effect:\n' +
  '  git commit --allow-empty -m "redeploy" && git push\n');
