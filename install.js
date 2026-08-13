/* Nomad AI — "add to home screen".
   ------------------------------------------------------------------
   A travel app is worth having on the home screen before the trip, not
   found again through a browser tab during it. This offers that, once,
   and then stays out of the way.

   Two paths, because the platforms differ:

     Chrome/Edge/Android  fire `beforeinstallprompt`, which can be saved
                          and replayed from a button. One tap installs.
     iOS Safari           has no such event and never will. All that can
                          be done is to say where the control is, so this
                          shows the Share → Add to Home Screen wording
                          instead of a button that cannot exist.

   It never appears when the app is already installed, and a dismissal is
   remembered — an install prompt that returns every visit reads as an ad. */
(function () {
  'use strict';

  var KEY = 'nomad.install.dismissed';
  var DELAY = 2600;          // let the intro finish before asking

  // Already installed: nothing to offer.
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  if (standalone) return;

  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* private mode */ }

  var deferred = null, shown = false;

  var ua = navigator.userAgent;
  var isIos = /iPhone|iPad|iPod/.test(ua) ||
    // iPadOS 13+ reports itself as a Mac; the touch points give it away.
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  // Only Safari can add to the home screen on iOS; Chrome and Firefox there cannot.
  var isIosSafari = isIos && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

  /* ── the card ──────────────────────────────────────────────────────── */

  var MARK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">' +
    '<path d="M12 3.5v11.2M7.6 10.4 12 14.8l4.4-4.4" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" stroke-width="2" ' +
    'stroke-linecap="round"/></svg>';

  var SHARE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">' +
    '<path d="M12 15.2V3.8M8.1 7.7 12 3.8l3.9 3.9" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M6 11.4h-.5a1.5 1.5 0 0 0-1.5 1.5v6.3a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-6.3a1.5 1.5 0 0 0-1.5-1.5H18" ' +
    'stroke-width="2" stroke-linecap="round"/></svg>';

  /* The card hangs off <body>, outside the app's own root, so it does not
     inherit the theme tokens the way everything inside the app does. The
     theme class is mirrored onto it — and kept mirrored, because the Dark
     switch is one of the controls sitting right next to it. */
  var themeWatch = null;

  function syncTheme(card) {
    card.classList.toggle('nomDark', !!document.querySelector('.nomDark'));
  }

  function watchTheme(card) {
    var root = document.getElementById('root');
    if (!root || !window.MutationObserver) return null;
    var obs = new MutationObserver(function () { syncTheme(card); });
    obs.observe(root, { attributes: true, attributeFilter: ['class'], subtree: true });
    return obs;
  }

  function dismiss(card) {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    if (themeWatch) { themeWatch.disconnect(); themeWatch = null; }
    card.classList.remove('is-in');
    setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 260);
  }

  function show(mode) {
    if (shown) return;
    shown = true;

    var card = document.createElement('div');
    card.className = 'nomInstall';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Add Nomad AI to your home screen');

    card.innerHTML =
      '<div class="nomInstall__mark">' + (mode === 'ios' ? SHARE : MARK) + '</div>' +
      '<div class="nomInstall__text">' +
        '<div class="nomInstall__title">Add Nomad AI to your home screen</div>' +
        '<div class="nomInstall__sub">' +
          (mode === 'ios'
            ? 'Tap Share, then “Add to Home Screen”.'
            : 'Opens full screen, and works without a connection.') +
        '</div>' +
      '</div>' +
      (mode === 'prompt' ? '<button class="nomInstall__go" type="button">Install</button>' : '') +
      '<button class="nomInstall__x" type="button" aria-label="Not now">✕</button>';

    document.body.appendChild(card);
    syncTheme(card);
    themeWatch = watchTheme(card);
    // Next frame, so the transition has a start state to move from.
    requestAnimationFrame(function () { card.classList.add('is-in'); });

    card.querySelector('.nomInstall__x').addEventListener('click', function () { dismiss(card); });

    var go = card.querySelector('.nomInstall__go');
    if (go) go.addEventListener('click', function () {
      if (!deferred) return dismiss(card);
      deferred.prompt();
      deferred.userChoice.then(function () {
        /* Dismissed either way: accepted means installed, declined means
           asked and answered. The browser will not replay the event. */
        deferred = null;
        dismiss(card);
      });
    });
  }

  /* ── triggers ──────────────────────────────────────────────────────── */

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();            // keep it, rather than let Chrome show its own
    deferred = e;
    setTimeout(function () { show('prompt'); }, DELAY);
  });

  if (isIosSafari) setTimeout(function () { show('ios'); }, DELAY);

  // Installed from the card or from the browser menu — take it away.
  window.addEventListener('appinstalled', function () {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    var card = document.querySelector('.nomInstall');
    if (card) dismiss(card);
  });
})();
