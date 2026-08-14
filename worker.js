/* Nomad AI — Worker entry point.
   ------------------------------------------------------------------
   The project is deployed as a Worker with static assets rather than as a
   Cloudflare Pages project, because that is what the dashboard creates now
   and Pages is no longer the default path for new work.

   The difference that matters: Pages discovers functions/ by itself and
   routes each file by its path. A Worker does not — it has one entry point,
   and anything the entry point does not handle falls through to the assets
   binding. So this file is the router that Pages was providing for free.

   The handlers themselves are untouched and still live in functions/api/,
   still written against (request, env). They work unchanged under both
   hosts, so the Netlify fallback and a future Pages project both stay
   possible.

   Everything that is not /api/* is a file in this folder — index.html,
   app.js, the images — and is served by env.ASSETS, which also applies the
   rules in _headers. */

import { onRequest as ai } from './functions/api/ai.js';
import { onRequest as transit } from './functions/api/transit.js';

/* Is each key actually bound to this deployment?
   ------------------------------------------------------------------
   A missing key is otherwise invisible from outside: the assistant reports
   that it could not reach Gemini, the transport section simply does not
   appear, and both look exactly like a bug in the app. Worse, plain
   dashboard *variables* are wiped by every deploy while *secrets* survive,
   so a key can work once and be gone after the next commit.

   This answers whether each name is present — never its value, never a
   prefix of it, which would be a slow way of publishing the key. Open
   /api/health on the deployed site before blaming the code. */
const health = ({ env }) =>
  new Response(
    JSON.stringify(
      {
        GEMINI_API_KEY: Boolean(env.GEMINI_API_KEY),
        TWOGIS_API_KEY: Boolean(env.TWOGIS_API_KEY),
        hint:
          'false means the key is not bound to this deployment. Add it under ' +
          'Settings → Variables and Secrets and choose Encrypt (a plain ' +
          'variable is deleted by the next deploy), then redeploy.'
      },
      null,
      2
    ),
    { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }
  );

/* Same paths nomad-config.js already calls, so the browser cannot tell a
   Worker from Pages from Netlify. */
const ROUTES = {
  '/api/ai': ai,
  '/api/transit': transit,
  '/api/health': health
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    const handler = ROUTES[pathname];
    if (handler) return handler({ request, env, ctx });

    /* A request under /api/ that matched no handler must not fall through to
       the assets binding: that would answer with index.html and a 200, and
       the app would try to read a web page as JSON. */
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: { message: 'No such endpoint: ' + pathname, code: 404 } }), {
        status: 404,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
