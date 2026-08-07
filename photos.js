/* Nomad AI — bundled photography.
   Maps image-slot ids to the files in img/. These are defaults only: a photo
   dropped onto a slot is stored in localStorage and still wins, so the app
   stays user-fillable exactly as the design intended.

   Sourced from the reference photos collected for this app and resized to
   900px / JPEG 80. Slots with no entry keep their placeholder caption. */
window.NOMAD_PHOTOS = (function () {
  var P = 'img/';

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
    'v2-yurts':       'yurts.jpg',
    'v2-ashlyanfu':   'ashlyanfu.jpg',
    'v2-koloko':      'koloko.jpg',
    'v2-boutique':    'boutique.jpg',
    'v2-orion':       'orion.jpg',
    'v2-jetioguz':    'jetioguz.jpg',
    'v2-frunze':      'frunze.jpg',
    'v2-interhouse':  'interhouse.jpg',
    'v2-apple':       'apple.jpg',
    'v2-ynytymak':    'ynytymak.jpg'
  };

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

  var out = {}, k;
  for (k in byPlace) if (byPlace.hasOwnProperty(k)) out[k] = P + byPlace[k];
  for (k in byStop) if (byStop.hasOwnProperty(k)) out[k] = P + byStop[k];
  return out;
})();
