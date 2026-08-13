/* <image-slot> — user-fillable image placeholder.
   Standalone re-implementation of the design's component for a plain web app.

   Drop an image file on a slot to fill it, or double-click to browse. Single
   clicks pass through, because most slots sit inside a card that navigates.
   Fills persist in localStorage keyed by the slot id, so they survive a reload
   the way the design-canvas sidecar did.

   Attributes: id (persistence key), shape (rect|rounded|circle|pill),
   radius (px, for `rounded`), placeholder (caption shown while empty),
   src (prefill), fit (cover|contain). */
(function () {
  var STORE = 'nomad.imageSlots.v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; }
  }
  function save(map) {
    try { localStorage.setItem(STORE, JSON.stringify(map)); } catch (e) { /* over quota — fills stay for this session only */ }
  }

  var filled = load();

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function radiusFor(el) {
    switch (el.getAttribute('shape') || 'rounded') {
      case 'rect': return '0';
      case 'circle': return '50%';
      case 'pill': return '999px';
      default: return (el.getAttribute('radius') || 12) + 'px';
    }
  }

  var style = document.createElement('style');
  style.textContent = [
    'image-slot{position:relative;display:block;width:100%;height:100%;overflow:hidden;',
    'background:var(--imgbg,#EFE8E0);isolation:isolate;container-type:inline-size}',
    'image-slot .is-img{position:absolute;inset:0;width:100%;height:100%;display:block}',
    'image-slot .is-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:6px;padding:10px;text-align:center;pointer-events:none;',
    "font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:10.5px;font-weight:600;line-height:1.35;",
    'color:var(--ink3,#9C8C7C);opacity:.9}',
    'image-slot .is-ph svg{opacity:.55}',
    'image-slot.is-over{outline:2px dashed var(--brand,#A03D4E);outline-offset:-4px}',

    /* Marks a photograph that is not of this place. Sized by the slot it
       sits in rather than by script, so it is right the moment it paints:
       narrow thumbnails keep the symbol alone, anything wider spells it
       out. */
    'image-slot .is-rep{position:absolute;left:6px;bottom:6px;z-index:2;display:flex;',
    'align-items:center;gap:4px;max-width:calc(100% - 12px);padding:3px 7px;border-radius:99px;',
    'background:rgba(20,14,11,.74);pointer-events:none;',
    "font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:9px;font-weight:700;",
    'line-height:1;letter-spacing:.02em;color:#FFF;white-space:nowrap}',
    'image-slot .is-rep svg{flex:0 0 9px;opacity:.9}',
    '@container (max-width:132px){image-slot .is-rep b{display:none}',
    'image-slot .is-rep{padding:3px;gap:0}}'
  ].join('');
  document.head.appendChild(style);

  var ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">' +
    '<rect x="3" y="5" width="18" height="14" rx="3" stroke-width="1.6"/>' +
    '<circle cx="8.5" cy="10" r="1.8" stroke-width="1.6"/>' +
    '<path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  // Shown over any bundled photo that is not of the place it is attached to.
  var REP_BADGE = '<div class="is-rep" title="Representative photo — not this venue">' +
    '<svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z' +
    'M10.8 11.4h2.4v6.4h-2.4v-6.4Z"/></svg><b>Representative</b></div>';

  function paint(el) {
    var key = el.getAttribute('id') || '';
    // Priority: a photo the user dropped, then an explicit src, then the
    // photo bundled for this slot in photos.js.
    var own = filled[key];
    var src = own || el.getAttribute('src') ||
      (window.NOMAD_PHOTOS && window.NOMAD_PHOTOS[key]) || '';
    el.style.borderRadius = radiusFor(el);

    if (src) {
      /* Only a bundled file can be a stand-in. A photo the visitor dropped
         on the slot themselves is theirs and is never second-guessed. */
      var rep = !own && window.NOMAD_PHOTO_REP && window.NOMAD_PHOTO_REP[src];
      /* The place screen's hero has its content sheet lapping over the
         bottom of the image, which would bury the badge. Slots in that
         position declare how far to lift it. */
      var lift = parseInt(el.getAttribute('rep-offset'), 10);
      var badge = rep
        ? (lift > 0 ? REP_BADGE.replace('class="is-rep"', 'class="is-rep" style="bottom:' + lift + 'px"') : REP_BADGE)
        : '';
      el.innerHTML = '<img class="is-img" alt="" src="' + escapeHtml(src) + '" style="object-fit:' +
        (el.getAttribute('fit') || 'cover') + '">' + badge;
    } else {
      el.innerHTML = '<div class="is-ph">' + ICON + '<span>' +
        escapeHtml(el.getAttribute('placeholder') || '') + '</span></div>';
    }
  }

  /** True when the slot is showing a bundled photo of somewhere else. */
  window.isRepresentativePhoto = function (slotId) {
    if (filled[slotId]) return false;
    var src = (window.NOMAD_PHOTOS || {})[slotId];
    return !!(src && window.NOMAD_PHOTO_REP && window.NOMAD_PHOTO_REP[src]);
  };

  function repaintAll() {
    document.querySelectorAll('image-slot').forEach(paint);
  }

  function fill(el, file) {
    if (!file || !/^image\//.test(file.type)) return;
    var fr = new FileReader();
    fr.onload = function () {
      var key = el.getAttribute('id');
      if (key) { filled[key] = fr.result; save(filled); }
      else { el.setAttribute('src', fr.result); }
      repaintAll(); // slots sharing an id (list + detail) stay in step
    };
    fr.readAsDataURL(file);
  }

  var picker = null;
  function browse(el) {
    if (!picker) {
      picker = document.createElement('input');
      picker.type = 'file';
      picker.accept = 'image/*';
      picker.style.display = 'none';
      document.body.appendChild(picker);
    }
    picker.onchange = function () { fill(el, picker.files && picker.files[0]); picker.value = ''; };
    picker.click();
  }

  class ImageSlot extends HTMLElement {
    static get observedAttributes() { return ['src', 'placeholder', 'shape', 'radius', 'id', 'fit', 'rep-offset']; }

    connectedCallback() {
      paint(this);
      if (this._wired) return;
      this._wired = true;

      var el = this;
      el.addEventListener('dblclick', function (e) { e.stopPropagation(); browse(el); });
      el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('is-over'); });
      el.addEventListener('dragleave', function () { el.classList.remove('is-over'); });
      el.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove('is-over');
        fill(el, e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
      });
    }

    attributeChangedCallback() { if (this.isConnected) paint(this); }
  }

  customElements.define('image-slot', ImageSlot);

  window.clearImageSlots = function () { filled = {}; save(filled); repaintAll(); };

  /**
   * Open the file picker for the first of `ids` that has nothing in it yet,
   * falling back to the last one so a full set can still be replaced.
   *
   * Double-clicking a slot has always worked, but that is not discoverable —
   * the "Add" tile on the review screen calls this instead.
   */
  window.imageSlotBrowse = function (ids) {
    var list = [].concat(ids || []);
    var empty = null, last = null;
    for (var i = 0; i < list.length; i++) {
      var el = document.getElementById(list[i]);
      if (!el) continue;
      last = el;
      if (!empty && !filled[list[i]]) empty = el;
    }
    var target = empty || last;
    if (target) browse(target);
    return !!target;
  };
})();
