/* Nomad AI — settings.
   ------------------------------------------------------------------
   This is the only file with anything to edit. Everything else is code.

   ⚠ ANY KEY PUT BELOW IS PUBLIC.
   This app runs entirely in the browser, so a key here ships to every
   visitor and anyone can read it out of this file or the network tab.

   Both are empty on the published site, deliberately. What that costs and
   what it buys:
     · Empty — the assistant asks each person for their own free key and
       keeps it in their browser. Everything else in the app is untouched:
       places, map, routes, phrases, itinerary, rewards.
     · Filled — nobody types anything, but everyone shares ONE free quota:
       roughly 20 questions a day per model, and three models are listed
       below, so about 60 a day across every visitor combined. Anyone who
       reads the key can spend that quota.

   Fill them in for a local run, or if the shared quota is a fair trade for
   your audience. Restrict each key to the one API it needs and rotate it
   before it goes anywhere public. Never reuse a key that can touch billing.

   Get a key at https://aistudio.google.com/apikey
*/
window.NOMAD_CONFIG = {
  // Empty by default — see above. The assistant asks for a key when needed.
  geminiKey: '',

  /* Models are tried in order. Google's free tier counts requests per day
     PER MODEL — the current Flash release allows only 20 — so listing
     several means one exhausted model does not end the demo. */
  geminiModels: [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite'
  ],

  // Seconds to wait for an answer before falling back to the offline reply.
  aiTimeoutSeconds: 25,

  /* 2GIS Catalog API — public transport stops and route numbers.
     ⚠ PUBLIC on exactly the same terms as the key above, and empty for the
     same reason. Keep it restricted to the Catalog API and rotate it before
     it goes anywhere public.

     Bishkek retired its marshrutkas, so the app no longer carries a
     hand-written paragraph about them — it reads the stops and the routes
     calling at them from 2GIS instead. Left empty, the transport section
     simply does not appear. */
  twoGisKey: '',

  /* Your own support desk, shown on the Emergency screen above the
     national numbers.

     Every channel is optional: fill in the ones you actually staff and
     leave the rest empty, and only those appear. With all of them empty
     the traveller is still offered the assistant, which always works.

     Nothing here is invented — put your real details in. A wrong number on
     an emergency screen is worse than no number.

       phone     international format, e.g. '+996 555 123 456'
       whatsapp  digits only, no + or spaces, e.g. '996555123456'
       telegram  the @name or the bot, without the @
       email     plain address
       hours     when a human actually answers, e.g. '09:00–21:00 Bishkek time' */
  support: {
    name: 'Nomad AI support',
    hours: '09:00–21:00 Bishkek time',
    email: 'nomadai0903@gmail.com',

    /* The desk's own numbers, in the order they should be tried. Both take
       WhatsApp, so each row offers WhatsApp and a plain call.

       `label` is what the traveller reads and can dial by hand, `dial` is
       what tel: uses, `whatsapp` is digits only for wa.me — no +, spaces or
       dashes, or the link silently fails. */
    numbers: [
      { label: '+996 755 009 777', dial: '+996755009777', whatsapp: '996755009777' },
      { label: '+996 701 710 070', dial: '+996701710070', whatsapp: '996701710070' }
    ],

    telegram: ''          // 'nomadai_support' — the @name or bot, without the @
  },

  // Map tiles. OpenStreetMap's public tiles: no key, no billing.
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '© OpenStreetMap',

  // Road routing. The public OSRM demo server: no key, no billing.
  osrmUrl: 'https://router.project-osrm.org',

  // Where the map opens before it knows anything: Bishkek.
  home: { lat: 42.8746, lng: 74.6122 }
};
