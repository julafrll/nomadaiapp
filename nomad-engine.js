/* Nomad AI — the working parts.
   =====================================================================
   Everything in this file replaces something the prototype only mimed:

     places     data.js describes places but has no coordinates. The real
                ones (and 32 more places) arrive in nomad-places.js and are
                merged into NOMAD_DATA here, before app.js reads it.
     distance   "0.8 km" was a written-in string. With the browser's
                location it becomes a measured great-circle distance.
     map        the map screen was a grid of CSS lines with pins placed at
                pixel offsets. This mounts a real OpenStreetMap.
     directions "Get directions" went to that drawing. It now asks OSRM for
                a route along real roads.
     assistant  the AI matched keywords against written answers. It now asks
                Gemini, grounded in the places above — and falls back to the
                written answers when there is no key, no network, or no
                quota left, so the prototype still demos on a plane.

   Loaded after data.js and nomad-places.js, before app.js. Written in the
   same ES5 style as the rest of the app so it runs anywhere the app does.
*/
(function () {
  'use strict';

  var CFG = window.NOMAD_CONFIG || {};
  var D = window.NOMAD_DATA;
  var REAL = window.NOMAD_PLACES || { coords: [], extras: [] };
  if (!D) return;

  var KEY_STORE = 'nomad.geminiKey';

  /* ── 1. Real place data ────────────────────────────────────────────
     data.js stays exactly as the designers wrote it; the real coordinates
     are applied on top by id, and places only the bot knew about are
     appended. Nothing here overwrites copy, photographs or translations. */

  var byId = {};
  D.places.forEach(function (p) { byId[p.id] = p; });

  REAL.coords.forEach(function (c) {
    var p = byId[c.id];
    if (!p) return;
    p.lat = c.lat;
    p.lng = c.lng;
    p.geo = c.geo;
  });

  /* Dropped on purpose. These rows have been deleted from nomad-places.js
     too, but that file is generated — re-running the export would hand them
     back, so the exclusion is stated here as well and survives it. */
  var DROPPED = { 1028: 1, 1029: 1, 1032: 1 };

  REAL.extras.forEach(function (extra) {
    if (byId[extra.id] || DROPPED[extra.id]) return;
    D.places.push(extra);
    byId[extra.id] = extra;
  });

  /* The added rows arrive with no image-slot id, so nothing could ever be
     shown for them. photos.js keys their photography by place id instead;
     give each one a slot derived from that id and register the file against
     it, which is all <image-slot> needs to paint. */
  (function attachPhotos() {
    var byPlaceId = window.NOMAD_PHOTOS_BY_PLACE;
    var slots = window.NOMAD_PHOTOS;
    if (!byPlaceId || !slots) return;
    D.places.forEach(function (p) {
      if (p.slot || !byPlaceId[p.id]) return;
      p.slot = 'v2-p' + p.id;
      slots[p.slot] = byPlaceId[p.id];
    });
  })();

  /* The design's own `dist` values are distances from the middle of Bishkek —
     Navat 0.8 km, Issyk-Kul 250 km — shown until the browser says where the
     traveller really is. The added places arrive without one, so they get the
     same measurement against the same reference rather than an empty gap. */
  D.places.forEach(function (p) {
    if (p.dist || typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
    p.dist = formatKm(distanceKm(CFG.home, { lat: p.lat, lng: p.lng }));
  });

  // The map screen reads D.mapPins, which only listed a handful of places at
  // hand-placed pixel offsets. Every place with a coordinate belongs on a real
  // map, so the list is rebuilt from the data itself.
  D.mapPins = D.places
    .filter(function (p) { return typeof p.lat === 'number' && typeof p.lng === 'number'; })
    .map(function (p) { return { id: p.id, label: p.name, lat: p.lat, lng: p.lng }; });

  function placeById(id) { return byId[id] || null; }
  function placesWithCoords() {
    return D.places.filter(function (p) {
      return typeof p.lat === 'number' && typeof p.lng === 'number';
    });
  }

  /* ── 2. Where the traveller is, and how far things are ─────────────── */

  var position = null;      // {lat, lng} once the browser tells us
  var geoState = 'idle';    // idle | asking | ok | denied | unavailable
  var listeners = [];

  function notify() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) { /* keep going */ } });
  }

  function onChange(fn) { listeners.push(fn); }

  function toRad(d) { return d * Math.PI / 180; }

  /** Great-circle distance in kilometres. */
  function distanceKm(a, b) {
    var dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }

  function formatKm(km) {
    if (!isFinite(km)) return '';
    if (km < 1) return Math.round(km * 1000) + ' m';
    if (km < 10) return km.toFixed(1) + ' km';
    return Math.round(km) + ' km';
  }

  /**
   * Rewrite every place's `dist` from the real position.
   *
   * The written-in strings are kept first, so a place we cannot measure —
   * no coordinate — keeps the description it shipped with instead of going
   * blank. Measured values replace them only where a measurement exists.
   */
  function refreshDistances() {
    if (!position) return;
    D.places.forEach(function (p) {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
      if (p.origDist === undefined) p.origDist = p.dist;
      p.km = distanceKm(position, { lat: p.lat, lng: p.lng });
      p.dist = formatKm(p.km);
    });
  }

  function locate(cb) {
    if (!navigator.geolocation) {
      geoState = 'unavailable';
      notify();
      if (cb) cb(null);
      return;
    }
    geoState = 'asking';
    notify();
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        geoState = 'ok';
        refreshDistances();
        notify();
        if (cb) cb(position);
      },
      function (err) {
        // 1 = permission denied. file:// counts as insecure in Chrome, which
        // reports the same code — worth saying so rather than blaming the user.
        geoState = err && err.code === 1 ? 'denied' : 'unavailable';
        notify();
        if (cb) cb(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function geoMessage() {
    if (geoState === 'denied') {
      if (location.protocol === 'file:') {
        return 'Location needs the app to be served over http://localhost — opening index.html directly blocks it.';
      }
      return blocked
        ? 'Location is blocked for this site. Allow it in your browser’s site settings, then try again.'
        : 'Location permission was declined, so distances stay as written.';
    }
    if (geoState === 'unavailable') return 'Your position could not be determined.';
    return '';
  }

  /* Whether the browser will still show a prompt.
     A refusal that was remembered means calling getCurrentPosition again
     fails instantly with no dialog, so offering "try again" would do nothing
     and the traveller has to change it in site settings instead. Kept up to
     date rather than read on demand, because the Permissions API is async
     and the answer is wanted while rendering. */
  var blocked = false;
  function watchPermission() {
    if (!navigator.permissions || !navigator.permissions.query) return;
    try {
      navigator.permissions.query({ name: 'geolocation' }).then(function (status) {
        function sync() {
          var was = blocked;
          blocked = status.state === 'denied';
          // A grant from site settings should take effect without a reload.
          if (was && !blocked && !position) locate();
          else if (was !== blocked) notify();
        }
        sync();
        status.onchange = sync;
      }, function () { /* not supported — assume we may still ask */ });
    } catch (e) { /* Firefox once threw on this name; asking anyway is safe */ }
  }
  watchPermission();

  /** True when asking again could still produce a prompt. */
  function canAsk() { return !blocked && location.protocol !== 'file:'; }

  /* ── 3. Directions along real roads ────────────────────────────────── */

  /**
   * Ask OSRM for a route through the given places.
   * Calls back with {distanceKm, minutes, coords:[[lat,lng]…], legs:[…]} or
   * an {error} — never with a straight line pretending to be a road.
   */
  function route(places, profile, cb) {
    var points = [];
    if (position) points.push({ name: 'You are here', lat: position.lat, lng: position.lng });
    places.forEach(function (p) {
      if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        points.push({ name: p.name, lat: p.lat, lng: p.lng });
      }
    });

    if (points.length < 2) {
      cb({ error: 'A route needs two points. Turn on your location, or add another stop.' });
      return;
    }

    var coords = points.map(function (p) { return p.lng + ',' + p.lat; }).join(';');
    var url = (CFG.osrmUrl || 'https://router.project-osrm.org') +
      '/route/v1/driving/' + coords + '?overview=full&geometries=geojson';

    fetch(url, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('routing service returned ' + r.status)); })
      .then(function (data) {
        var r = data.routes && data.routes[0];
        if (data.code !== 'Ok' || !r) {
          cb({ error: (data.message || 'No road route connects those points.') });
          return;
        }
        // The public OSRM server only carries the driving profile, so walking
        // is routed on the same roads and only the time is re-derived, at an
        // average 4.8 km/h.
        var km = r.distance / 1000;
        var minutes = profile === 'foot' ? (km / 4.8) * 60 : r.duration / 60;
        cb({
          distanceKm: km,
          minutes: minutes,
          profile: profile || 'driving',
          stops: points,
          coords: r.geometry.coordinates.map(function (c) { return [c[1], c[0]]; }),
          legs: (r.legs || []).map(function (leg, i) {
            return {
              from: (points[i] || {}).name || '',
              to: (points[i + 1] || {}).name || '',
              km: leg.distance / 1000,
              minutes: profile === 'foot' ? (leg.distance / 1000 / 4.8) * 60 : leg.duration / 60
            };
          })
        });
      })
      .catch(function (e) { cb({ error: 'Could not reach the routing service: ' + e.message }); });
  }

  /* ── 4. A real map ─────────────────────────────────────────────────── */

  var map = null, pinLayer = null, meMarker = null, routeLine = null, mapHost = null;

  function leafletReady() { return typeof window.L !== 'undefined'; }

  /**
   * Mount (or update) the map inside `el`.
   *
   * app.js morphs the DOM on every render, so the container carries data-keep
   * and is left alone once Leaflet owns it; this only has to notice when the
   * screen has been rebuilt around a brand-new element.
   */
  function mountMap(el, opts) {
    if (!el || !leafletReady()) return null;
    opts = opts || {};

    // The screen was rebuilt around a new element: the old map and every
    // marker on it are gone, so the reuse cache has to go with them.
    if (map && mapHost !== el) {
      map.remove();
      map = null;
      markers = {};
      activeMarkerId = null;
      meMarker = null;
      routeLine = null;
      branchLayer = null;
      branchesKey = null;
    }

    if (!map) {
      mapHost = el;
      map = window.L.map(el, {
        center: [CFG.home.lat, CFG.home.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: true
      });
      window.L.tileLayer(CFG.tileUrl, { maxZoom: 19, attribution: CFG.tileAttribution }).addTo(map);
      pinLayer = window.L.layerGroup().addTo(map);
      // Leaflet fires this only for taps that missed every marker, which is
      // exactly the gesture that means "put the card away".
      map.on('click', function () { if (bgHandler) bgHandler(); });
      // The phone frame animates in; Leaflet measures 0×0 if it mounts first.
      setTimeout(function () { if (map) map.invalidateSize(); }, 60);
    }

    selectHandler = opts.onSelect || null;
    bgHandler = opts.onBackground || null;
    branchList = opts.branches || null;
    activeBranchAddr = opts.activeBranch || null;

    drawPins(opts.places || placesWithCoords(), opts.activeId);
    drawMe();
    if (opts.fit !== false) fitTo(opts.places || placesWithCoords(), opts.activeId);
    return map;
  }

  /* Markers are kept between renders and reused.
     app.js re-renders on every state change while the map screen is open, and
     clearing the layer each time rebuilt all 65 circles — which also cancelled
     whatever tooltip was open and threw away the marker mid-tap. Only a change
     to the visible set rebuilds now; a change of selection just restyles the
     two markers that actually differ. */
  var markers = {};        // id -> rating pin currently on the layer
  var selectHandler = null, bgHandler = null, activeMarkerId = null;
  // Which pin currently wears the "Best rated" ribbon.
  var bestMarkerId = null;
  // Supplied by app.js each render: the selected chain's branches, and
  // which of them was just tapped.
  var branchList = null, activeBranchAddr = null;

  /* One colour per category, so a glance at the map says what is where.
     Every pin used to be the same brand red, which made the filter chips the
     only way to tell a hotel from a museum.

     Picked to stay distinguishable side by side and against both the light
     and dark map tiles; the darker `ring` is the stroke around each dot. */
  var CAT_COLOURS = {
    'Stay':           { fill: '#3E6FB0', ring: '#27497A' },  // blue
    'Kyrgyz cuisine': { fill: '#A03D4E', ring: '#6E2734' },  // the brand red
    'Street food':    { fill: '#C2673A', ring: '#8A4526' },  // burnt orange
    'Coffee':         { fill: '#8A5A2B', ring: '#5E3C1B' },  // coffee brown
    'Market':         { fill: '#C9A227', ring: '#8E7017' },  // amber
    'Nature':         { fill: '#3E7A5A', ring: '#27523B' },  // green
    'Trek':           { fill: '#2F6D6A', ring: '#1D4644' },  // teal
    'Park':           { fill: '#6E9440', ring: '#4A6529' },  // olive
    'Museum':         { fill: '#7B4EA8', ring: '#523171' },  // purple
    'Landmark':       { fill: '#B0447E', ring: '#7A2C56' },  // magenta
    'Culture':        { fill: '#4E63B6', ring: '#33427D' }   // indigo
  };
  var CAT_FALLBACK = { fill: '#8A7F74', ring: '#5C544C' };

  function catColour(cat) { return CAT_COLOURS[cat] || CAT_FALLBACK; }

  /* ── Rating on the pin ───────────────────────────────────────────────
     The dot said what a place was but never how good it was, so choosing
     between two neighbouring pins meant tapping both. The pin now carries
     its rating; the category colour it always had is untouched. */

  /* The kese kymyz is poured into — the mark ratings carry everywhere.
     Flat rim and a separate foot: at pin size a bowl drawn from curves
     alone just reads as a triangle. */
  var KYMYZ_CUP =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/>' +
    '<rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>';

  /** 4.7 and up reads as "worth crossing town for"; 4.3 as "good". */
  function ratingTier(r) {
    if (typeof r !== 'number') return 'none';
    if (r >= 4.7) return 'top';
    if (r >= 4.3) return 'high';
    return 'plain';
  }

  function pinIcon(p, active, best) {
    var c = catColour(p.cat);
    var value = typeof p.rating === 'number' ? p.rating.toFixed(1) : '–';
    return window.L.divIcon({
      className: 'nm-pin-wrap',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      html:
        '<div class="nm-pin nm-pin--' + ratingTier(p.rating) + (active ? ' is-active' : '') +
        '" style="--pinFill:' + c.fill + ';--pinRing:' + c.ring + '">' +
        KYMYZ_CUP + '<span>' + value + '</span></div>' +
        (best ? '<span class="nm-pin__best">Best rated</span>' : '')
    });
  }

  /** Better places sit above their neighbours where pins overlap. */
  function pinDepth(p, active) {
    return (active ? 10000 : 0) + (typeof p.rating === 'number' ? Math.round(p.rating * 100) : 0);
  }

  function drawPins(places, activeId) {
    if (!pinLayer) return;

    var wanted = {};
    places.forEach(function (p) { if (typeof p.lat === 'number') wanted[p.id] = p; });

    // The best-rated pin currently on the map gets called out by name, so
    // "which one is better" has an answer without comparing every number.
    var bestId = null, bestRating = -1;
    Object.keys(wanted).forEach(function (id) {
      var r = wanted[id].rating;
      if (typeof r === 'number' && r > bestRating) { bestRating = r; bestId = wanted[id].id; }
    });

    // drop the ones the filter no longer shows
    Object.keys(markers).forEach(function (id) {
      if (!wanted[id]) { pinLayer.removeLayer(markers[id]); delete markers[id]; }
    });

    // add the ones that are new
    Object.keys(wanted).forEach(function (id) {
      if (markers[id]) return;
      var p = wanted[id];
      var marker = window.L.marker([p.lat, p.lng], {
        icon: pinIcon(p, false, p.id === bestId),
        zIndexOffset: pinDepth(p, false),
        keyboard: false
      });
      marker.bindTooltip(p.name, { direction: 'top', offset: [0, -36], className: 'nm-tip' });
      // Reading the handler at click time keeps a reused marker pointed at the
      // current render's callback instead of one captured on first draw.
      marker.on('click', function (e) {
        /* Leaflet makes the map an event parent of every layer, so a marker
           click carries on to the map's own click handler — which would
           select this pin and then immediately dismiss it again. `_stopped`
           is the flag Leaflet's dispatcher checks before it moves on. */
        if (e && e.originalEvent) e.originalEvent._stopped = true;
        if (selectHandler) selectHandler(p.id);
      });
      marker.addTo(pinLayer);
      markers[id] = marker;
    });

    /* Redraw only the pins whose appearance actually changed: the two ends
       of a selection change, and the two ends of a change in which pin is
       the best rated. Rebuilding all 65 icons would cancel an open tooltip
       and throw the marker away mid-tap, same as clearing the layer did. */
    var stale = {};
    if (activeMarkerId !== activeId) {
      stale[activeMarkerId] = 1; stale[activeId] = 1;
      activeMarkerId = activeId;
    }
    if (bestMarkerId !== bestId) {
      stale[bestMarkerId] = 1; stale[bestId] = 1;
      bestMarkerId = bestId;
    }
    Object.keys(stale).forEach(function (id) {
      var marker = markers[id], p = wanted[id];
      if (!marker || !p) return;
      var on = String(p.id) === String(activeId);
      marker.setIcon(pinIcon(p, on, p.id === bestId));
      marker.setZIndexOffset(pinDepth(p, on));
    });

    drawBranches(wanted, activeId, branchList, activeBranchAddr);
  }

  /* ── Chain branches ──────────────────────────────────────────────────
     Bublik and Mubarak are chains; the bot listed their other locations as
     text inside one address field, so the map only ever showed the head
     office. These draw the rest — hollow rings in the chain's own category
     colour, so they read as "more of this place" rather than as separate
     entries competing with it. */

  var branchLayer = null, branchesKey = null;

  /** The hard-coded fallback list, used when nothing better is supplied. */
  function branchesOf(id) {
    var B = window.NOMAD_BRANCHES;
    return (B && B[id] && B[id].branches) || [];
  }

  /**
   * Draw the selected chain's other locations.
   *
   * The list comes from app.js rather than being looked up here. It used to
   * read nomad-branches.js directly, which knows only the two chains the
   * bot spelled out — so Navat's card listed fifteen branches while the map
   * drew none, and tapping one panned to an empty street.
   *
   * `activeBranch` is the one just tapped: it gets a filled marker so that
   * "show me this branch" actually lands on something visible.
   */
  function drawBranches(visible, activeId, branches, activeBranch) {
    if (!map) return;
    if (!branchLayer) branchLayer = window.L.layerGroup().addTo(map);

    // Only the selected chain's branches are shown; all of them at once
    // would bury the rest of the map under one brand.
    var list = (activeId != null && visible[activeId]) ? (branches || branchesOf(activeId)) : [];
    var key = activeId + '|' + list.length + '|' + (activeBranch || '') +
      '|' + (list[0] ? list[0].addr : '');
    if (branchesKey === key) return;
    branchesKey = key;
    branchLayer.clearLayers();
    if (!list.length) return;

    var parent = byId[activeId];
    var c = catColour(parent && parent.cat);
    list.forEach(function (b) {
      var approx = /approx/.test(b.geo || '');
      var on = activeBranch && b.addr === activeBranch;
      var marker = window.L.circleMarker([b.lat, b.lng], {
        radius: on ? 9 : 6,
        weight: on ? 3 : 2.5,
        color: c.ring,
        fillColor: on ? c.fill : '#FFFFFF',
        fillOpacity: 1,
        dashArray: approx ? '3 3' : null
      });
      marker.bindTooltip((parent ? parent.name + ' · ' : '') + b.addr + (approx ? ' (approximate)' : ''),
        { direction: 'top', offset: [0, -6], className: 'nm-tip' });
      marker.addTo(branchLayer);
      if (on) { marker.bringToFront(); marker.openTooltip(); }
    });
  }

  function drawMe() {
    if (!map) return;
    if (!position) {
      if (meMarker) { meMarker.remove(); meMarker = null; }
      return;
    }
    if (meMarker) { meMarker.setLatLng([position.lat, position.lng]); return; }
    meMarker = window.L.circleMarker([position.lat, position.lng], {
      radius: 8, weight: 3, color: '#FFFFFF', fillColor: '#3E7A5A', fillOpacity: 1
    }).bindTooltip('You are here', { direction: 'top', offset: [0, -6], className: 'nm-tip' }).addTo(map);
  }

  function fitTo(places, activeId) {
    if (!map) return;
    var active = places.filter(function (p) { return p.id === activeId; })[0];
    if (active) { map.setView([active.lat, active.lng], 15, { animate: true }); return; }
    var pts = places.filter(function (p) { return typeof p.lat === 'number'; })
      .map(function (p) { return [p.lat, p.lng]; });
    if (position) pts.push([position.lat, position.lng]);
    if (!pts.length) return;
    map.fitBounds(window.L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15 });
  }

  function focusPlace(id) {
    var p = placeById(id);
    if (map && p && typeof p.lat === 'number') map.setView([p.lat, p.lng], 16, { animate: true });
  }

  /** Centre on an arbitrary point — used to open the map on a chain branch. */
  function panTo(lat, lng, zoom) {
    if (map && typeof lat === 'number') map.setView([lat, lng], zoom || 16, { animate: true });
  }

  /**
   * What the map is actually showing: centre, zoom, and the places inside
   * the visible rectangle. Feeds the assistant so "what is near here" can
   * mean this view rather than the whole country.
   */
  function viewport() {
    if (!map) return null;
    var c = map.getCenter(), b = map.getBounds();
    var inside = D.places.filter(function (p) {
      return typeof p.lat === 'number' && b.contains([p.lat, p.lng]);
    });
    // Nearest to the middle first, and capped — the assistant does not need
    // sixty names to answer a question about what is on screen.
    var mid = { lat: c.lat, lng: c.lng };
    inside.sort(function (a, b2) {
      return distanceKm(mid, { lat: a.lat, lng: a.lng }) - distanceKm(mid, { lat: b2.lat, lng: b2.lng });
    });
    return {
      centre: { lat: c.lat, lng: c.lng },
      zoom: map.getZoom(),
      count: inside.length,
      places: inside.slice(0, 25).map(function (p) { return p.name + ' (' + p.cat + ')'; })
    };
  }

  function zoomBy(delta) { if (map) map.setZoom(map.getZoom() + delta); }

  /** Re-measure after the container changes size, or Leaflet keeps the old one. */
  function invalidateSize() {
    if (map) setTimeout(function () { if (map) map.invalidateSize(); }, 0);
  }

  function recenter() {
    if (!map) return;
    if (position) map.setView([position.lat, position.lng], 15, { animate: true });
    else fitTo(placesWithCoords(), null);
  }

  function drawRoute(coords) {
    if (!map) return;
    if (routeLine) { routeLine.remove(); routeLine = null; }
    if (!coords || !coords.length) return;
    routeLine = window.L.polyline(coords, { color: '#A03D4E', weight: 5, opacity: .85 }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  }

  /* ── 5. The assistant ──────────────────────────────────────────────── */

  /* Where the server functions live, when the site is hosted somewhere that
     runs them. They hold the API keys so the browser never sees one. Set
     proxyBase to '' in nomad-config.js to force the old direct calls. */
  var PROXY = (CFG.proxyBase === undefined ? '/api' : CFG.proxyBase)
    .replace(/\/+$/, '');
  var proxyGone = false;   // set once /api/ai has answered 404

  /* A key the visitor set for themselves wins, so anyone who brings their own
     is not drawing on the shared quota. Otherwise the app falls back to the
     one shipped in nomad-config.js — empty on the published site, because
     there the function supplies it instead. */
  function apiKey() {
    var own = '';
    try { own = (localStorage.getItem(KEY_STORE) || '').trim(); } catch (e) { own = ''; }
    return own || String(CFG.geminiKey || '').trim();
  }
  function setApiKey(k) {
    try { localStorage.setItem(KEY_STORE, (k || '').trim()); } catch (e) { /* private mode */ }
  }
  // With a function in front, nobody needs a key of their own.
  function hasKey() { return (!!PROXY && !proxyGone) || !!apiKey(); }

  var STOP_WORDS = (' what where when which who how the and for with near best good some any can you should ' +
    'would there here have does are is in at to of a me my i do it on get find show tell about want like ' +
    'need go see eat try day days today tonight tomorrow please recommend something place places ' +
    'что где когда какой как и для с рядом лучший хороший мне мой я это на в к из ' +
    'эмне кайда качан кандай жана үчүн менен мага менин ').split(' ');

  /* Traveller words mapped onto the categories the data actually uses, so
     "where can I eat" retrieves restaurants even though no row says "eat".

     Russian and Kyrgyz sit in the same table. The app ships in three
     languages and the assistant is told to answer in the language it was
     asked in, but retrieval used to be English-only — so a question in
     Kyrgyz reached the model with the wrong rows attached and it correctly
     reported that it had nothing, which read as the app not knowing its own
     data. */
  var INTENT = {
    eat: ['Kyrgyz cuisine', 'Street food'], food: ['Kyrgyz cuisine', 'Street food'],
    dinner: ['Kyrgyz cuisine'], lunch: ['Kyrgyz cuisine', 'Street food'],
    breakfast: ['Coffee', 'Street food'], restaurant: ['Kyrgyz cuisine'],
    cheap: ['Street food'], budget: ['Street food'], coffee: ['Coffee'], cafe: ['Coffee'],
    sleep: ['Stay'], stay: ['Stay'], hotel: ['Stay'], hostel: ['Stay'], yurt: ['Stay'],
    hike: ['Trek', 'Nature'], hiking: ['Trek', 'Nature'], trek: ['Trek', 'Nature'],
    trekking: ['Trek', 'Nature'], mountains: ['Trek', 'Nature'],
    nature: ['Nature', 'Park'], lake: ['Nature', 'Trek'], walk: ['Park', 'Landmark'],
    park: ['Park'], museum: ['Museum'], history: ['Museum', 'Landmark'],
    culture: ['Culture', 'Museum'], souvenir: ['Market'], souvenirs: ['Market'],
    shopping: ['Market'], market: ['Market'], bazaar: ['Market'],

    // Russian
    'еда': ['Kyrgyz cuisine', 'Street food'], 'поесть': ['Kyrgyz cuisine', 'Street food'],
    'кушать': ['Kyrgyz cuisine'], 'ресторан': ['Kyrgyz cuisine'], 'кафе': ['Coffee'],
    'кофе': ['Coffee'], 'завтрак': ['Coffee', 'Street food'], 'обед': ['Kyrgyz cuisine'],
    'ужин': ['Kyrgyz cuisine'], 'дешево': ['Street food'], 'недорого': ['Street food'],
    'отель': ['Stay'], 'гостиница': ['Stay'], 'хостел': ['Stay'], 'юрта': ['Stay'],
    'ночлег': ['Stay'], 'жилье': ['Stay'],
    'горы': ['Trek', 'Nature'], 'поход': ['Trek', 'Nature'], 'треккинг': ['Trek', 'Nature'],
    'озеро': ['Nature', 'Trek'], 'природа': ['Nature', 'Park'], 'парк': ['Park'],
    'музей': ['Museum'], 'история': ['Museum', 'Landmark'], 'культура': ['Culture', 'Museum'],
    'базар': ['Market'], 'рынок': ['Market'], 'сувениры': ['Market'], 'сувенир': ['Market'],

    // Kyrgyz
    'тамак': ['Kyrgyz cuisine', 'Street food'], 'тамактануу': ['Kyrgyz cuisine'],
    'ашкана': ['Kyrgyz cuisine'], 'кафеде': ['Coffee'], 'жеш': ['Kyrgyz cuisine'],
    'жесем': ['Kyrgyz cuisine'], 'жегим': ['Kyrgyz cuisine'],
    'конок': ['Stay'], 'мейманкана': ['Stay'], 'боз': ['Stay'], 'үй': ['Stay'],
    'тоо': ['Trek', 'Nature'], 'тоолор': ['Trek', 'Nature'], 'жүрүш': ['Trek', 'Nature'],
    'көл': ['Nature', 'Trek'], 'жаратылыш': ['Nature', 'Park'], 'парктар': ['Park'],
    'музейи': ['Museum'], 'тарых': ['Museum', 'Landmark'], 'маданият': ['Culture', 'Museum'],
    'базары': ['Market'], 'соода': ['Market']
  };

  /* Dishes are written in the data in Latin ("beshbarmak", "lagman"), but a
     traveller asking in Kyrgyz or Russian types them in Cyrillic. Without
     this the substring search over `dishes` never fires for those questions. */
  var ALIAS = {
    'бешбармак': 'beshbarmak', 'бешбармакты': 'beshbarmak', 'беш': 'beshbarmak',
    'лагман': 'lagman', 'лагманды': 'lagman', 'манты': 'manti', 'манти': 'manti',
    'самса': 'samsa', 'плов': 'plov', 'палоо': 'plov', 'шашлык': 'shashlik',
    'куурдак': 'kuurdak', 'оромо': 'oromo', 'боорсок': 'boorsok', 'чучук': 'chuchuk',
    'кымыз': 'kymyz', 'кумыс': 'kymyz', 'максым': 'maksym', 'айран': 'ayran',
    'шоро': 'shoro', 'ашлянфу': 'ashlyanfu', 'ашлян': 'ashlyanfu',
    'бишкек': 'bishkek', 'ысык': 'issyk', 'ыссык': 'issyk', 'иссык': 'issyk',
    'ала': 'ala', 'арча': 'archa', 'бурана': 'burana', 'ош': 'osh',
    'каракол': 'karakol', 'сон': 'son', 'көл': 'kul', 'куль': 'kul'
  };

  /** Pick the rows the question is about. Same idea as the web app's retrieval. */
  function retrieve(question) {
    var words = String(question).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/);
    var picked = [], seen = {};

    function add(p) { if (p && !seen[p.id]) { seen[p.id] = 1; picked.push(p); } }

    var cats = {};
    words.forEach(function (w) {
      (INTENT[w] || []).forEach(function (c) { cats[c] = 1; });
    });
    Object.keys(cats).forEach(function (c) {
      D.places.filter(function (p) { return p.cat === c; })
        .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); })
        .slice(0, 8).forEach(add);
    });

    // Each word searches under itself and under its Latin equivalent, so
    // "бешбармак" reaches the rows whose `dishes` say "beshbarmak".
    var terms = [];
    words.forEach(function (w) {
      if (w.length > 2 && STOP_WORDS.indexOf(w) < 0) terms.push(w);
      if (ALIAS[w]) terms.push(ALIAS[w]);
    });
    terms.forEach(function (t) {
      D.places.filter(function (p) {
        var hay = (p.name + ' ' + p.cat + ' ' + (p.desc || '') + ' ' + (p.addr || '') + ' ' +
          ((p.dishes || []).join(' '))).toLowerCase();
        return hay.indexOf(t) >= 0;
      }).slice(0, 8).forEach(add);
    });

    var matched = picked.length > 0;
    if (!matched) {
      D.places.slice().sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); })
        .slice(0, 12).forEach(add);
    }

    if (position) {
      picked.forEach(function (p) {
        p.km = (typeof p.lat === 'number') ? distanceKm(position, { lat: p.lat, lng: p.lng }) : null;
      });
      picked.sort(function (a, b) {
        return (a.km === null ? 1e9 : a.km) - (b.km === null ? 1e9 : b.km);
      });
    }

    return { places: picked.slice(0, 20), matched: matched };
  }

  function contextBlock(places) {
    return places.map(function (p) {
      var bits = ['id: ' + p.id, 'name: ' + p.name, 'category: ' + p.cat];
      if (p.desc) bits.push('description: ' + p.desc);
      if (p.addr) bits.push('address: ' + p.addr);
      if (p.price) bits.push('price: ' + p.price);
      if (p.rating) bits.push('rating: ' + p.rating + (p.reviews ? ' (' + p.reviews + ' reviews)' : ''));
      if (p.hours) bits.push('hours: ' + p.hours);
      if (p.dishes && p.dishes.length) bits.push('known for: ' + p.dishes.join(', '));
      if (typeof p.km === 'number') bits.push('distance from the traveller: ' + formatKm(p.km));
      return '- ' + bits.join(' | ');
    }).join('\n');
  }

  /* Everything in the app that is not a place.
     Before this the assistant was handed places and nothing else, so it
     truthfully answered "I do not have an itinerary" while the Itinerary
     screen sat one tab away with three full days on it. Built once — none
     of it changes while the app is open. */
  var appBlock = null;
  function appContext() {
    if (appBlock !== null) return appBlock;
    var out = [];

    out.push('THE APP ITSELF:');
    out.push('Nomad AI is a travel companion for Kyrgyzstan. Its screens are: Home, Search, ' +
      'Map (a real OpenStreetMap with every place pinned; tapping a pin opens that place), ' +
      'AI Assistant (you), Itinerary, Rewards, Challenge, Verify, Write review, Saved, My trips, ' +
      'Phrasebook, Currency, Emergency and Profile. Distances are measured from the traveller ' +
      'when they allow location, and directions follow real roads.');

    if (D.itinerary) {
      out.push('\nTHE BUILT-IN 3-DAY ITINERARY (on the Itinerary screen):');
      Object.keys(D.itinerary).forEach(function (k) {
        var day = D.itinerary[k];
        out.push('Day ' + k + ' — ' + day.theme + ' | cost ' + day.cost + ' | ' + day.walk);
        (day.stops || []).forEach(function (s) {
          out.push('   ' + s.t + ' ' + s.n + ' (' + s.cat + ') — ' + s.cost +
            (s.travel ? ' — ' + s.travel : ''));
        });
      });
    }

    if (D.badgeList && D.badgeList.length) {
      out.push('\nBADGES AND CHALLENGES (Rewards screen). XP converts to som at ' +
        (D.RATE ? D.RATE + ' XP = 1 som' : 'a fixed rate') + '.');
      D.badgeList.forEach(function (b) {
        out.push('- ' + b.name + ' (' + b.xp + ' XP) — ' + b.sub + '. Tasks: ' +
          (b.tasks || []).map(function (t) { return t.n + ' at ' + t.at; }).join('; '));
      });
    }

    if (D.phrases && D.phrases.length) {
      out.push('\nPHRASEBOOK (Kyrgyz, with recorded pronunciation):');
      D.phrases.forEach(function (g) {
        out.push('- ' + g.name + ': ' + (g.items || []).map(function (it) {
          return '"' + it.en + '" = ' + it.ky + ' (' + it.tr + ')';
        }).join('; '));
      });
    }

    if (D.currencies && D.currencies.length) {
      out.push('\nEXCHANGE RATES (Currency screen), som per unit:');
      out.push(D.currencies.map(function (c) { return c[0] + ' ' + c[3]; }).join(', '));
    }

    out.push('\nEMERGENCY NUMBERS (Emergency screen): 112 all services, 103 ambulance, ' +
      '102 police, 101 fire. Tourist police +996 705 00 91 02.');

    /* Stated because the model's own knowledge of Bishkek is likely to be
       out of date here, and confidently recommending a mode of transport
       that no longer exists is worse than saying nothing. */
    out.push('\nGETTING AROUND BISHKEK — IMPORTANT, THIS HAS CHANGED:');
    out.push('Bishkek has retired its marshrutkas. The minibuses no longer run in the city and ' +
      'you must never tell a traveller to take one. The city network is buses and electric ' +
      'buses, 17 som paid by card; some routes are marked "Электробус" (electric) and a few run ' +
      'at night ("Ночной"). No trolleybuses remain either. Routes numbered in the 300s are ' +
      'regional coaches out of town (Tokmok, Kant, the villages), and the 600s/6000s are the ' +
      'suburban elektrichka train, not city services. Ride apps — Yandex Go, Namba Taxi — are ' +
      'the other normal option at 150–250 som across the centre.');
    out.push('Each place screen in the app lists the stops nearest that place and the route ' +
      'numbers calling at them, read live from 2GIS. If an ON SCREEN block gives you stops and ' +
      'route numbers, quote those exact numbers; otherwise say the numbers are on the stop sign ' +
      'rather than guessing one.');

    if (D.savedTrips && D.savedTrips.length) {
      out.push('\nSAMPLE SAVED TRIPS (My trips screen): ' + D.savedTrips.map(function (t) {
        return t.name + ' (' + t.stops + ' stops, ' + t.cost + ')';
      }).join('; '));
    }

    appBlock = out.join('\n');
    return appBlock;
  }

  /* What the traveller is actually looking at.
     Set by app.js on every render. Without it the assistant answered every
     question in a vacuum: "what is this place?" or "what else is near here?"
     had no referent, because it could not see the map the question was
     obviously about. */
  var view = null;
  function setView(v) { view = v; }

  function viewContext() {
    if (!view) return '';
    var out = ['\n\nON SCREEN RIGHT NOW:'];
    out.push('The traveller is on the ' + (view.screenName || view.screen) + ' screen.');

    if (view.screen === 'map') {
      /* Read live rather than from the snapshot app.js last handed over:
         dragging and zooming the map do not re-render the app, so a stored
         viewport would describe wherever the map was several gestures ago. */
      var vp = viewport();
      out.push('The map is filtered to "' + view.filter + '"' +
        (vp ? ', showing ' + vp.count + ' places in view' : '') + '.');
      if (vp) {
        out.push('It is centred on ' + vp.centre.lat.toFixed(4) + ', ' + vp.centre.lng.toFixed(4) +
          ' at zoom ' + vp.zoom + '.');
        if (vp.places.length) {
          out.push('Places inside the visible map area right now: ' + vp.places.join(', ') + '.');
          out.push('"Here", "this area" and "on screen" mean those places — answer from them first.');
        } else {
          out.push('No places from the database fall inside the visible area.');
        }
      }
      if (view.route) out.push('A route is drawn on the map: ' + view.route + '.');
    }

    if (view.selected) {
      out.push('The place currently open is ' + view.selected + '. "It", "this place" and "here" ' +
        'most likely mean that one.');
    }
    if (view.branches && view.branches.length) {
      out.push(view.selected + ' is a chain; its branches are at: ' + view.branches.join('; ') + '.');
    }
    if (view.stops && view.stops.length) {
      out.push('Transport stops near ' + view.selected + ', from 2GIS just now:');
      view.stops.forEach(function (s) { out.push('   ' + s); });
      out.push('Those route numbers are current — use them rather than any you remember.');
    }
    if (view.day) out.push('The itinerary is showing day ' + view.day + '.');
    return out.join('\n');
  }

  var SYSTEM = 'You are the Nomad AI assistant, a travel companion for Kyrgyzstan, built into the ' +
    'Nomad AI app. Be genuinely useful: answer the question you were actually asked.\n\n' +
    'Each turn you are given a PLACES block (rows retrieved from the app\'s own database for this ' +
    'question) and an APP block (everything else the app holds — its itinerary, badges, phrasebook, ' +
    'exchange rates and emergency numbers).\n\n' +
    'Rules:\n' +
    '- Anything factual about a specific place — its price, rating, address, opening hours or ' +
    'distance — must come from the PLACES block. Never invent those, and never invent a place that ' +
    'is not listed. Name places exactly as the block writes them.\n' +
    '- Everything else you may answer from your own knowledge of Kyrgyzstan and of travel ' +
    'generally: visas, seasons, altitude, safety, transport, etiquette, history, language, weather, ' +
    'what a dish is, how much to tip. Do it plainly and helpfully. You do not need to disclaim ' +
    'ordinary knowledge, but do say so when something is a rough figure or changes often.\n' +
    '- If the retrieved rows do not fit the question, ignore them rather than forcing them in. Say ' +
    'what you do know, and only say the app has nothing when the question really was about a place ' +
    'and no row matches.\n' +
    '- Questions about the app itself — where a screen is, how badges work, what a phrase is in ' +
    'Kyrgyz, what the itinerary contains — are answered from the APP block.\n' +
    '- An ON SCREEN block tells you what the traveller is looking at. Treat it as the subject of ' +
    'anything vague: "here", "this place", "what is nearby", "what am I looking at". Prefer places ' +
    'that are actually on screen when the question is about the current view, and say plainly when ' +
    'what they want is outside it.\n' +
    '- If the question has nothing to do with Kyrgyzstan or travel, still answer it briefly and ' +
    'accurately, then offer to help with the trip. Do not refuse and do not lecture.\n' +
    '- Prices are in Kyrgyz som. Keep answers short: two or three sentences, or a tight list when ' +
    'recommending several places. Plain text — no markdown headings, no bold, no bullet symbols.\n' +
    '- Answer in the language the question is asked in (English, Russian or Kyrgyz).\n' +
    '- When you recommend specific places from the PLACES block, end with a line listing their ids ' +
    'exactly as: PLACES: 1, 7';

  /* The current Flash models think before they answer, and the thinking is
     billed against maxOutputTokens. A budget sized for the reply alone gets
     spent on thoughts, the reply comes back empty with finishReason
     MAX_TOKENS, and the app falls through to a canned answer for no visible
     reason. Asking for a low thinking level and leaving generous headroom
     fixes it — but the field is Gemini 3 only, and this API rejects an
     unknown generationConfig field outright, so a model that will not take it
     is remembered and retried without. */
  var noThinkingLevel = {};

  // Models that have reported no quota left today, so later questions skip
  // straight past them. Reset by a reload.
  var spent = {};

  function callGemini(model, question, ctx, cb) {
    var key = apiKey();
    /* Through the server function when there is one, so the key stays out
       of the browser. `proxyGone` is set the first time /api/ai answers 404
       — on a plain file server or GitHub Pages there is no function — and
       from then on the call goes straight to Google with whatever key the
       config or the visitor supplied, exactly as it used to. */
    var viaProxy = !proxyGone && !!PROXY;
    var url = viaProxy
      ? PROXY + '/ai?model=' + encodeURIComponent(model)
      : 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
    var headers = { 'content-type': 'application/json' };
    if (!viaProxy) headers['x-goog-api-key'] = key;
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); },
      (CFG.aiTimeoutSeconds || 25) * 1000);

    var gen = { temperature: 0.4, maxOutputTokens: 8192 };
    var sentThinking = !noThinkingLevel[model];
    if (sentThinking) gen.thinkingConfig = { thinkingLevel: 'low' };

    var contents = history.slice();
    contents.push({ role: 'user', parts: [{ text: ctx + '\n\nQuestion: ' + question }] });

    fetch(url, {
      method: 'POST',
      headers: headers,
      signal: controller ? controller.signal : undefined,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: contents,
        generationConfig: gen
      })
    })
      .then(function (r) {
        /* Read as text and parse leniently. A missing endpoint answers with
           an HTML error page, and r.json() would reject on it — which sent
           the whole thing to the catch below as a network failure, so the
           "no function here, call Google directly" branch was never reached
           and every model got written off as out of quota instead. */
        return r.text().then(function (raw) {
          var body = null;
          try { body = JSON.parse(raw); } catch (e) { /* not JSON */ }
          return { ok: r.ok, status: r.status, body: body };
        });
      })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) {
          /* No function deployed here. Remember it and retry the same
             question directly, so a local run off a plain file server
             behaves as it did before the proxy existed.

             Three statuses, because a missing endpoint answers differently
             depending on what is serving: 404 from a static host, 405 from
             one that routes the path but not the method, and 501 from
             python -m http.server, which implements no POST at all. */
          if (viaProxy && (res.status === 404 || res.status === 405 || res.status === 501)) {
            proxyGone = true;
            callGemini(model, question, ctx, cb);
            return;
          }
          var msg = (res.body && res.body.error && res.body.error.message) || ('HTTP ' + res.status);
          // An older model refusing thinkingConfig: drop it and try once more
          // before writing the model off.
          if (res.status === 400 && sentThinking) {
            noThinkingLevel[model] = true;
            callGemini(model, question, ctx, cb);
            return;
          }
          cb({ error: msg, status: res.status });
          return;
        }
        var cand = res.body && res.body.candidates && res.body.candidates[0];
        var parts = (cand && cand.content && cand.content.parts) || [];
        var text = parts.filter(function (p) { return !p.thought && typeof p.text === 'string'; })
          .map(function (p) { return p.text; }).join('').trim();
        if (!text) {
          // 502 so the caller moves on to the next model rather than giving up.
          cb({ error: 'empty reply (' + ((cand && cand.finishReason) || '?') + ')', status: 502 });
          return;
        }
        cb({ text: text, model: model });
      })
      .catch(function (e) {
        clearTimeout(timer);
        cb({ error: e.name === 'AbortError' ? 'timed out' : e.message, status: 504 });
      });
  }

  /* Conversation history, so "how far is it from the first one?" means
     something. Trimmed to the last few turns: the PLACES block is re-sent
     with every question and the whole thing would otherwise grow without
     limit. */
  var history = [];
  var HISTORY_TURNS = 6;

  function remember(question, answer) {
    history.push({ role: 'user', parts: [{ text: question }] });
    history.push({ role: 'model', parts: [{ text: answer }] });
    while (history.length > HISTORY_TURNS * 2) history.shift();
  }

  function resetHistory() { history = []; }

  /**
   * Ask the assistant.
   *
   * cb({ text, places, model })            a real answer
   * cb({ offline: true, reason })          no key / no network / no quota —
   *                                        the caller should use the app's own
   *                                        written answers instead
   */
  function ask(question, cb) {
    if (!hasKey()) { cb({ offline: true, reason: 'nokey' }); return; }

    var found = retrieve(question);
    var ctx = 'PLACES (' + found.places.length + ' rows from the database' +
      (found.matched ? ' matching the question' : ', nothing matched the question — these are the best-rated rows, ignore them if they are not relevant') +
      '):\n' + contextBlock(found.places) +
      '\n\nAPP:\n' + appContext() +
      viewContext() +
      (position ? '\n\nThe traveller has shared their location, so the distances above are measured from where they are standing.' : '');

    /* A model that has spent its daily quota will spend it again on the next
       question, so it is dropped for the rest of the session rather than
       costing every later answer a failed round-trip first. The list starts
       whole again on reload, which is when a new day would show up anyway. */
    var models = (CFG.geminiModels || ['gemini-flash-latest']).filter(function (m) {
      return !spent[m];
    });
    if (!models.length) models = (CFG.geminiModels || ['gemini-flash-latest']).slice();

    function attempt() {
      if (!models.length) { cb({ offline: true, reason: 'quota' }); return; }
      var model = models.shift();
      callGemini(model, question, ctx, function (res) {
        if (res.error) {
          // Out of quota, withdrawn model or a timeout: another model may work.
          if (res.status === 429 || res.status === 404) spent[model] = 1;
          if (res.status === 429 || res.status === 404 || res.status === 504 || res.status >= 500) {
            attempt();
            return;
          }
          var rejected = res.status === 400 || res.status === 401 || res.status === 403;
          cb({ offline: true, reason: rejected ? 'badkey' : 'error', detail: res.error });
          return;
        }

        var ids = {}, line = res.text.match(/^PLACES:\s*(.+)$/m);
        if (line) {
          line[1].split(',').forEach(function (part) {
            var n = parseInt(String(part).replace(/[^0-9]/g, ''), 10);
            if (!isNaN(n)) ids[n] = 1;
          });
        }
        var answer = res.text.replace(/^PLACES:.*$/m, '').trim();
        var lower = answer.toLowerCase();

        // The id line is unreliable; a name used in the prose is better
        // evidence that the answer is actually about that place.
        var cited = found.places.filter(function (p) {
          return ids[p.id] || lower.indexOf(String(p.name).toLowerCase()) >= 0;
        }).slice(0, 4);

        // The question and the reply go into history without the context
        // block — the rows are re-retrieved for whatever is asked next.
        remember(question, answer);

        cb({ text: answer, places: cited, model: res.model });
      });
    }

    attempt();
  }

  /* ── exports ───────────────────────────────────────────────────────── */

  window.NomadEngine = {
    // data
    places: function () { return D.places; },
    placeById: placeById,
    placesWithCoords: placesWithCoords,
    // location
    locate: locate,
    position: function () { return position; },
    geoState: function () { return geoState; },
    geoMessage: geoMessage,
    canAsk: canAsk,
    distanceKm: distanceKm,
    formatKm: formatKm,
    onChange: onChange,
    // directions
    route: route,
    // map
    catColour: catColour,
    branchesOf: branchesOf,
    mountMap: mountMap,
    focusPlace: focusPlace,
    panTo: panTo,
    viewport: viewport,
    setView: setView,
    zoomBy: zoomBy,
    invalidateSize: invalidateSize,
    recenter: recenter,
    drawRoute: drawRoute,
    leafletReady: leafletReady,
    // assistant
    ask: ask,
    hasKey: hasKey,
    setApiKey: setApiKey,
    resetHistory: resetHistory
  };
})();
