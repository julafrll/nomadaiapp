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

/* Same paths nomad-config.js already calls, so the browser cannot tell a
   Worker from Pages from Netlify. */
const ROUTES = {
  '/api/ai': ai,
  '/api/transit': transit
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
