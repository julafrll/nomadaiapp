/* Nomad AI — 2GIS lookups: transport stops and chain branches.
   =====================================================================
   Two things the app cannot know on its own and that go stale if written
   down: which buses stop near a place, and where else a business has
   branches.

   ── Buses ──────────────────────────────────────────────────────────
   Bishkek retired its marshrutkas. The app shipped telling travellers to
   ride them, which is now wrong advice. Stops and route numbers are read
   live instead. What the data contains, sampled across the city:

     bus             city routes — plain and electric buses
                     ("5 (Электробус)", "3 (Ночной)" for the night service)
     shuttle_bus     regional coaches out of town — 300 to Tokmok,
                     305 Bishkek–Kant, 303 to Kegeti village
     suburban_train  the elektrichka — 608 to Balykchy, 6050 to Tokmok

   No trolleybus routes remain, and nothing is classed or named as a
   marshrutka.

   ── Branches ───────────────────────────────────────────────────────
   Most of the cafes and chaikhanas in this app are chains, and the app
   only ever showed one address each. 2GIS knows the rest: Navat has
   seventeen locations, Adriano seven, Bublik nine. A place is matched to
   its 2GIS organisation by name and proximity, then every branch of that
   organisation is fetched.

   Matching has to cross alphabets — the app says "Bublik" and "Faiza"
   where 2GIS says "Бублик" and "Фаиза" — so both sides are transliterated
   to latin before comparison, and a match is only accepted when the
   nearest branch is close to where the app already places it.

   ⚠ THE KEY IN nomad-config.js IS PUBLIC, exactly like the Gemini one —
   this runs entirely in the browser, so anyone can read it out of the
   file or the network tab. Keep it restricted to the Catalog API.
*/
window.Nomad2GIS = (function () {
  var CFG = window.NOMAD_CONFIG || {};
  var DIRECT = 'https://catalog.api.2gis.com/3.0/items';
  var PAGE_MAX = 10;                       // 2GIS caps page_size at 10

  /* Through the server function where one is deployed, so the key stays out
     of the browser; straight to 2GIS otherwise, with whatever key the config
     carries. See netlify/functions/transit.mjs. */
  var PROXY = (CFG.proxyBase === undefined ? '/api' : CFG.proxyBase).replace(/\/+$/, '');
  var proxyGone = false;                   // set once /api/transit has 404ed

  function viaProxy() { return !!PROXY && !proxyGone; }
  function base() { return viaProxy() ? PROXY + '/transit' : DIRECT; }

  // Empty when proxying: the function attaches the real one server-side.
  function key() { return viaProxy() ? '' : (CFG.twoGisKey || ''); }
  function enabled() { return viaProxy() || !!(CFG.twoGisKey || ''); }

  /* ── Shared helpers ────────────────────────────────────────────────── */

  function metres(a, b) {
    var R = 6371000, toRad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toRad, dLng = (b.lng - a.lng) * toRad;
    var la1 = a.lat * toRad, la2 = b.lat * toRad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }

  function get(url, cb) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    var wasProxied = viaProxy();
    fetch(url, { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        /* No function deployed here — a plain file server, or GitHub Pages.
           Remember it and reissue the same query straight to 2GIS with the
           key from the config, exactly as before the proxy existed. */
        if (wasProxied && (r.status === 404 || r.status === 405 || r.status === 501)) {
          clearTimeout(timer);
          proxyGone = true;   // must precede key(), which reads it
          /* The query already carries an empty `key=`, because that is what
             key() returns while proxying. Replace it rather than append —
             2GIS takes the first of a repeated parameter, so appending
             leaves the empty one winning and reads as a bad key. */
          get(url.replace(PROXY + '/transit', DIRECT)
                 .replace(/([?&])key=[^&]*/, '$1key=' + encodeURIComponent(key())), cb);
          return null;
        }
        return r.json();
      })
      .then(function (j) {
        if (j === null) return;         // already retried directly
        clearTimeout(timer);
        cb(null, j);
      })
      .catch(function (e) {
        clearTimeout(timer);
        cb(e.name === 'AbortError' ? 'timed out' : e.message);
      });
  }

  /* A cache and a request-collapser, shared by both lookups: two cards
     asking the same question at once should make one request, and asking
     twice in a session should make none. */
  var cache = {}, inflight = {};
  function once(ck, work, cb) {
    if (cache[ck]) { cb(cache[ck]); return; }
    if (inflight[ck]) { inflight[ck].push(cb); return; }
    inflight[ck] = [cb];
    work(function (result) {
      cache[ck] = result;
      (inflight[ck] || []).forEach(function (fn) { fn(result); });
      delete inflight[ck];
    });
  }

  /* ── Name matching across alphabets ────────────────────────────────── */

  var CYR = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i',
    'й':'i','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
    'у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sh','ъ':'','ы':'y','ь':'',
    'э':'e','ю':'yu','я':'ya','ң':'n','ө':'o','ү':'u','ұ':'u','і':'i','ә':'a','ғ':'g','қ':'k','һ':'h'
  };

  /** Lower-case, transliterate, and drop everything that is not a letter. */
  function slug(s) {
    var out = '', str = String(s || '').toLowerCase();
    for (var i = 0; i < str.length; i++) {
      var c = str[i];
      out += Object.prototype.hasOwnProperty.call(CYR, c) ? CYR[c] : c;
    }
    return out.replace(/[^a-z0-9]+/g, '');
  }

  /** 2GIS names carry their category: "Бублик, кофейня" → "Бублик". */
  function headName(s) { return String(s || '').split(',')[0]; }

  /* ── Addresses in the reader's language ────────────────────────────────
     2GIS will localise addresses itself, but only into languages it has for
     the country: Kyrgyzstan has ky_KG and ru_KG and no English at all. So
     Kyrgyz and Russian are asked for directly, and English is transliterated
     here from the Russian — "улица Токтогула, 75/1" → "Toktogula Street,
     75/1" — which is what a visitor needs anyway, since that is how the
     street sign will look to them once they are standing in front of it. */

  var LOCALES = { ky: 'ky_KG', ru: 'ru_KG' };
  function localeFor(lang) { return LOCALES[lang] || ''; }

  // Two-letter sequences first, or "ш" would come out as "sh" only by luck.
  var TRANSLIT = {
    'жч':'jch','ье':'ye','ьи':'yi',
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch',
    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    'ң':'ng','ө':'o','ү':'u','і':'i','ә':'a','ғ':'g','қ':'k','һ':'h'
  };

  /** Cyrillic → latin, keeping capitalisation and everything non-Cyrillic. */
  function toLatin(s) {
    var str = String(s || ''), out = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i], lower = ch.toLowerCase();
      var rep = TRANSLIT[lower];
      if (rep === undefined) { out += ch; continue; }
      // Capitalise the replacement if the source letter was capitalised.
      out += (ch !== lower && rep) ? rep[0].toUpperCase() + rep.slice(1) : rep;
    }
    return out;
  }

  // The generic half of an address, which should be translated rather than
  // transliterated — "Toktogula Ulitsa" helps nobody.
  var STREET_TYPES = [
    [/^улица\s+/i,      'Street'],
    [/^проспект\s+/i,   'Avenue'],
    [/^бульвар\s+/i,    'Boulevard'],
    [/^переулок\s+/i,   'Lane'],
    [/^площадь\s+/i,    'Square'],
    [/^шоссе\s+/i,      'Highway'],
    [/^проезд\s+/i,     'Passage'],
    [/^набережная\s+/i, 'Embankment']
  ];
  var TRAILING_TYPES = [
    [/\s+улица\b/i, ' Street'], [/\s+проспект\b/i, ' Avenue'],
    [/\s+бульвар\b/i, ' Boulevard'], [/\s+переулок\b/i, ' Lane'],
    [/\s+площадь\b/i, ' Square'], [/\s+шоссе\b/i, ' Highway']
  ];

  /** A Russian address rendered for an English reader. */
  function englishAddress(ru) {
    var s = String(ru || '').trim();
    if (!s) return s;

    s = s.replace(/\bмикрорайон\b/gi, 'microdistrict').replace(/\bмкр\b/gi, 'microdistrict');

    // "улица Токтогула, 75/1" reads better reordered than translated in place.
    for (var i = 0; i < STREET_TYPES.length; i++) {
      var m = STREET_TYPES[i][0].exec(s);
      if (!m) continue;
      var rest = s.slice(m[0].length);
      var comma = rest.indexOf(',');
      var name = comma >= 0 ? rest.slice(0, comma) : rest;
      var tail = comma >= 0 ? rest.slice(comma) : '';
      return toLatin(name).trim() + ' ' + STREET_TYPES[i][1] + toLatin(tail);
    }
    // "Киевская улица, 148" is already in English order — swap the word
    // where it stands rather than reordering around it.
    for (var j = 0; j < TRAILING_TYPES.length; j++) {
      var t = TRAILING_TYPES[j][0].exec(s);
      if (!t) continue;
      return toLatin(s.slice(0, t.index)) + TRAILING_TYPES[j][1] +
        toLatin(s.slice(t.index + t[0].length));
    }
    return toLatin(s);
  }

  function namesMatch(a, b) {
    var x = slug(a), y = slug(b);
    if (!x || !y) return false;
    if (x === y) return true;
    // One being a prefix of the other covers "Supara" vs "Supara Ethno
    // Complex" and "Ant`s" vs "Ant's Coffee".
    var shorter = x.length < y.length ? x : y;
    var longer = x.length < y.length ? y : x;
    return shorter.length >= 4 && longer.indexOf(shorter) === 0;
  }

  /* ── Transport stops ───────────────────────────────────────────────── */

  function stopsNear(lat, lng, cb, opts) {
    opts = opts || {};
    var radius = Math.min(opts.radius || 800, 2000);   // 2GIS caps this at 2000
    var ck = 'stops:' + lat.toFixed(4) + ',' + lng.toFixed(4) + '@' + radius;
    if (!enabled()) { cb({ ok: false, error: 'no2gisKey', stops: [] }); return; }

    once(ck, function (done) {
      var url = base() + '?q=' + encodeURIComponent('остановка') + '&type=station' +
        '&point=' + lng + ',' + lat + '&radius=' + radius + '&page_size=10' +
        '&fields=' + encodeURIComponent('items.point,items.routes,items.route_type') +
        '&key=' + encodeURIComponent(key());

      get(url, function (err, j) {
        if (err) { done({ ok: false, stops: [], error: err }); return; }
        var code = j.meta && j.meta.code;
        if (code === 404) { done({ ok: true, stops: [] }); return;
        }
        if (code !== 200) {
          done({ ok: false, stops: [], error: (j.meta && j.meta.error && j.meta.error.message) || ('2GIS ' + code) });
          return;
        }
        var here = { lat: lat, lng: lng };
        var stops = (j.result && j.result.items || []).map(function (s) {
          var pt = s.point ? { lat: s.point.lat, lng: s.point.lon } : null;
          return {
            id: s.id, name: s.name, point: pt,
            metres: pt ? metres(here, pt) : null,
            routes: groupRoutes(s.routes || [])
          };
        }).filter(function (s) { return s.point; });
        stops.sort(function (a, b) { return a.metres - b.metres; });
        done({ ok: true, stops: stops });
      });
    }, cb);
  }

  /** Split a stop's routes into city buses, out-of-town coaches, and rail. */
  function groupRoutes(routes) {
    var city = [], regional = [], train = [];
    routes.forEach(function (r) {
      var entry = {
        number: String(r.name || '').replace(/\s*\(.*\)\s*$/, '').trim(),
        label: r.name,
        electric: /электробус/i.test(r.name || ''),
        night: /ночной/i.test(r.name || ''),
        to: r.to_name || '', from: r.from_name || '',
        circular: r.direction_type === 'circular'
      };
      if (r.subtype === 'suburban_train') train.push(entry);
      else if (r.subtype === 'shuttle_bus') regional.push(entry);
      else city.push(entry);
    });
    var byNumber = function (a, b) {
      var na = parseInt(a.number, 10), nb = parseInt(b.number, 10);
      if (isNaN(na) || isNaN(nb)) return String(a.number).localeCompare(String(b.number));
      return na - nb;
    };
    return { city: city.sort(byNumber), regional: regional.sort(byNumber), train: train.sort(byNumber) };
  }

  /* ── Chain branches ────────────────────────────────────────────────── */

  /* How far the app's own coordinate may sit from 2GIS's nearest branch
     before a same-named business is treated as a different one. The app's
     coordinates come from the bot and from Nominatim, so a few hundred
     metres of disagreement is normal; a kilometre is not. */
  var MATCH_LIMIT_M = 900;

  /* Only businesses have branches. Restricting the lookup by category is
     not just a saving on requests — it removes a whole class of wrong
     answers, because a landmark shares its name with whatever sits on it.
     "Ala-Too Square" matches "Ала-Тоо, кинотеатр" a few hundred metres
     away on name and distance alike, and if that cinema were a chain the
     square would have sprouted its branches. */
  var CHAIN_CATEGORIES = {
    'Kyrgyz cuisine': 1, 'Coffee': 1, 'Street food': 1, 'Market': 1, 'Stay': 1
  };
  function canHaveBranches(place) {
    return !!(place && CHAIN_CATEGORIES[place.cat]);
  }

  /**
   * Every branch of the business at `place`.
   *
   * cb receives { ok, branches, total, matchedName, error }. `branches`
   * excludes nothing — the place's own address is in there too, flagged
   * `isThisOne`, because "which one am I looking at" is worth answering.
   */
  function branchesOf(place, lang, cb) {
    if (typeof lang === 'function') { cb = lang; lang = 'en'; }
    if (!enabled() || !place || typeof place.lat !== 'number' || !canHaveBranches(place)) {
      cb({ ok: false, branches: [], error: 'unavailable' });
      return;
    }
    // Cached per language: the same chain in Kyrgyz is a different answer.
    once('org:' + place.id + ':' + lang, function (done) {
      // Trailing branch numbers and "& Bar" style suffixes hurt the search.
      var q = String(place.name).replace(/\s*(№\s*\d+|&.*|\(.*\))\s*$/g, '').trim() || place.name;
      var here = { lat: place.lat, lng: place.lng };

      var url = base() + '?q=' + encodeURIComponent(q) +
        '&location=' + place.lng + ',' + place.lat + '&page_size=' + PAGE_MAX +
        '&fields=' + encodeURIComponent('items.org,items.point,items.address_name') +
        '&key=' + encodeURIComponent(key());

      get(url, function (err, j) {
        if (err) { done({ ok: false, branches: [], error: err }); return; }
        if (!j.meta || j.meta.code !== 200) { done({ ok: true, branches: [], total: 0 }); return; }

        // Among the results that carry the same name, take the nearest.
        var best = null, bestM = Infinity;
        (j.result && j.result.items || []).forEach(function (it) {
          if (!it.point || !it.org) return;
          if (!namesMatch(headName(it.name), q)) return;
          var d = metres(here, { lat: it.point.lat, lng: it.point.lon });
          if (d < bestM) { bestM = d; best = it; }
        });

        if (!best || bestM > MATCH_LIMIT_M) { done({ ok: true, branches: [], total: 0 }); return; }

        var total = (best.org && best.org.branch_count) || 1;
        if (total < 2) {
          done({ ok: true, branches: [], total: 1, matchedName: best.org && best.org.name });
          return;
        }
        fetchOrg(best.org.id, place, total, best.org.name, lang, done);
      });
    }, cb);
  }

  /** Page through an organisation's branches — 2GIS returns ten at a time. */
  function fetchOrg(orgId, place, total, matchedName, lang, done) {
    var acc = [], page = 1;
    var maxPages = Math.min(Math.ceil(total / PAGE_MAX), 6);
    var here = { lat: place.lat, lng: place.lng };
    var locale = localeFor(lang);

    function step() {
      var url = base() + '?org_id=' + encodeURIComponent(orgId) +
        '&location=' + place.lng + ',' + place.lat +
        '&page=' + page + '&page_size=' + PAGE_MAX +
        '&fields=' + encodeURIComponent('items.point,items.address_name,items.schedule') +
        (locale ? '&locale=' + locale : '') +
        '&key=' + encodeURIComponent(key());

      get(url, function (err, j) {
        if (err || !j.meta || j.meta.code !== 200) { finish(); return; }
        (j.result && j.result.items || []).forEach(function (it) {
          if (!it.point) return;
          var raw = it.address_name || it.name;
          acc.push({
            id: it.id,
            // 2GIS has no English for Kyrgyzstan, so it is made here.
            addr: locale ? raw : englishAddress(raw),
            lat: it.point.lat,
            lng: it.point.lon,
            metres: metres(here, { lat: it.point.lat, lng: it.point.lon })
          });
        });
        page++;
        if (page <= maxPages && acc.length < total) step();
        else finish();
      });
    }

    function finish() {
      acc.sort(function (a, b) { return a.metres - b.metres; });
      // The nearest one is the branch this screen is about.
      if (acc.length && acc[0].metres <= MATCH_LIMIT_M) acc[0].isThisOne = true;
      done({ ok: true, branches: acc, total: total, matchedName: matchedName });
    }

    step();
  }

  return {
    enabled: enabled,
    stopsNear: stopsNear,
    branchesOf: branchesOf
  };
})();
