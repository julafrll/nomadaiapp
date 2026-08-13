/* Nomad AI — bundled photography.
   Maps image-slot ids to the files in img/. These are defaults only: a photo
   dropped onto a slot is stored in localStorage and still wins, so the app
   stays user-fillable exactly as the design intended.

   Sourced from the reference photos collected for this app and resized to
   900px / JPEG 80. Slots with no entry keep their placeholder caption.

   ── True photographs vs representative ones ────────────────────────────
   Some places here are public landmarks that free-licensed photography
   actually covers. Most of the rest are private cafes, restaurants and
   malls in Bishkek, and no free-licensed photograph of those actual
   premises exists. Rather than quietly showing a picture of somewhere else,
   every such image is listed in REPRESENTATIVE below and the app marks it
   on screen, so a photo is never mistaken for the venue itself.

   img/CREDITS.md carries author and licence for every Commons file. */
window.NOMAD_PHOTOS = (function () {
  var P = 'img/';

  /* Photographs carry the same ?v= as the scripts do.
     Without it a replaced photo never reaches anyone who has the old one
     cached — the file changes on disk and the browser keeps serving what it
     already had, because nothing about the URL changed. Read off this
     script's own src so bumping the number in index.html is still the one
     place it is done. */
  var V = (function () {
    var s = document.currentScript;
    var m = s && /[?&]v=([^&]+)/.exec(s.src || '');
    return m ? '?v=' + m[1] : '';
  })();

  var byPlace = {
    'v2-navat':       'navat.jpg',
    'v2-supara':      'supara.jpg',
    'v2-alaarcha':    'alaarcha.jpg',
    'v2-osh':         'osh.jpg',
    'v2-ants':        'ants.jpg',
    'v2-alatoo':      'alatoo.jpg',
    'v2-museum':      'museum.jpg',
    'v2-issykkul':    'issykkul.jpg',
    'v2-alakul':      'alakul.jpg',
    'v2-burana':      'burana.jpg',
    'v2-faiza':       'faiza.jpg',
    'v2-tsum':        'tsum.jpg',
    'v2-adriano':     'adriano.jpg',
    'v2-oshfood':     'oshfood.jpg',
    'v2-chunkurchak': 'chunkurchak.jpg',
    'v2-songkul':     'songkul.jpg',

    // From Wikimedia Commons — see img/CREDITS.md for author and licence.
    'v2-oak':         'oak.jpg',
    'v2-victory':     'victory.jpg',
    'v2-panfilov':    'panfilov.jpg',
    'v2-botanical':   'botanical.jpg',
    'v2-opera':       'opera.jpg',
    'v2-drama':       'drama.jpg',
    'v2-philharmonic':'philharmonic.jpg',
    'v2-dordoi':      'dordoi.jpg',
    'v2-skazka':      'skazka.jpg',
    'v2-altyn':       'altyn.jpg',
    'v2-jetioguz':    'jetioguz.jpg',
    'v2-frunze':      'frunze.jpg',
    'v2-ashlyanfu':   'ashlyanfu.jpg',

    // Stand-ins: the file is not a photograph of this venue. Listed in
    // REPRESENTATIVE below so the app says so rather than implying it is.
    'v2-yurts':       'yurts.jpg',
    'v2-koloko':      'koloko.jpg',
    'v2-boutique':    'boutique.jpg',
    'v2-orion':       'orion.jpg',
    'v2-interhouse':  'interhouse.jpg',
    'v2-apple':       'apple.jpg',
    'v2-ynytymak':    'ynytymak.jpg'
  };

  /* The 32 places that arrive from nomad-places.js ship without a slot id of
     their own, so they are keyed by place id instead; nomad-engine.js gives
     each one a slot and registers it here at start-up. */
  var byPlaceId = {
    // True photographs of the place itself.
    1003: 'fineartsmuseum.jpg',   // Museum of Fine Arts (Gapar Aitiev)
    1005: 'circus.jpg',           // Bishkek Circus
    1015: 'atabeyit.jpg',         // Ata-Beyit Memorial
    1016: 'manas.jpg',            // Manas Statue — the statue is in frame
    1021: 'flagsquare.jpg',       // Flag Square — Ala-Too Square

    // Representative: the dish or the kind of room, never the venue.
    1001: 'rep-mall.jpg',         // Asia Mall
    1002: 'rep-mall.jpg',         // Dordoi Plaza
    1006: 'rep-mall.jpg',         // Bishkek Park Mall
    1007: 'rep-mall.jpg',         // GUM Chynar

    1004: 'rep-beshbarmak.jpg',   // Bellagio Premium
    1008: 'rep-beshbarmak.jpg',   // Kuurdak №1
    1009: 'rep-beshbarmak.jpg',   // Bugu
    1010: 'rep-beshbarmak.jpg',   // Frunze — beshbarmak is the house dish
    1019: 'rep-beshbarmak.jpg',   // Barashek
    1022: 'rep-beshbarmak.jpg',   // Mubarak
    1026: 'rep-beshbarmak.jpg',   // Tubeteyka

    1023: 'rep-grill.jpg',        // Torro Grill & Bar
    1024: 'rep-grill.jpg',        // Zaandukki (Georgian)
    1011: 'rep-sushi.jpg',        // Furusato (Japanese)

    1012: 'rep-coffee.jpg',       // Michelle Kitchen & Coffee
    1014: 'rep-coffee.jpg',       // Skyberry
    1018: 'rep-coffee.jpg',       // Traveler's Coffee
    1025: 'rep-coffee.jpg',       // Espressolab
    1031: 'rep-coffee.jpg',       // Moqa

    1013: 'rep-bakery.jpg',       // Pavlova
    1017: 'rep-bakery.jpg',       // Rodem Coffee & Bakery
    1020: 'rep-bakery.jpg',       // Bublik

    1027: 'rep-lagman.jpg',       // Dordoi Bazaar Food Court
    1030: 'rep-lagman.jpg'        // Lagman House
  };

  /* Files that show something other than the place they are attached to.
     Everything not listed here is a photograph of the actual place. */
  var REPRESENTATIVE = [
    'rep-mall.jpg', 'rep-beshbarmak.jpg', 'rep-grill.jpg', 'rep-sushi.jpg',
    'rep-coffee.jpg', 'rep-bakery.jpg', 'rep-lagman.jpg',
    'yurts.jpg', 'koloko.jpg', 'boutique.jpg', 'orion.jpg', 'interhouse.jpg',
    'apple.jpg', 'ynytymak.jpg'
  ];

  // The itinerary reuses the same places under its own slot ids.
  var byStop = {
    'v2-it-1':  'alatoo.jpg',
    'v2-it-2':  'museum.jpg',
    'v2-it-3':  'faiza.jpg',
    'v2-it-4':  'navat.jpg',
    'v2-it-5':  'gorge.jpg',
    'v2-it-6':  'alaarcha.jpg',
    'v2-it-7':  'ants.jpg',
    'v2-it-8':  'osh.jpg',
    'v2-it-9':  'ashlyanfu.jpg',
    'v2-it-10': 'burana.jpg',
    'v2-it-11': 'supara.jpg'
  };

  function url(file) { return P + file + V; }

  var out = {}, k;
  for (k in byPlace) if (byPlace.hasOwnProperty(k)) out[k] = url(byPlace[k]);
  for (k in byStop) if (byStop.hasOwnProperty(k)) out[k] = url(byStop[k]);

  // Keyed by place id, for the rows that have no slot of their own.
  var byId = {};
  for (k in byPlaceId) if (byPlaceId.hasOwnProperty(k)) byId[k] = url(byPlaceId[k]);
  window.NOMAD_PHOTOS_BY_PLACE = byId;

  // Looked up by <image-slot> to decide whether to mark the image. Keyed by
  // the same strings the maps above hold, ?v= included.
  var rep = {};
  REPRESENTATIVE.forEach(function (f) { rep[url(f)] = 1; });
  window.NOMAD_PHOTO_REP = rep;

  return out;
})();
