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
    'background:var(--imgbg,#EFE8E0);isolation:isolate}',
    'image-slot .is-img{position:absolute;inset:0;width:100%;height:100%;display:block}',
    'image-slot .is-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:6px;padding:10px;text-align:center;pointer-events:none;',
    "font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:10.5px;font-weight:600;line-height:1.35;",
    'color:var(--ink3,#9C8C7C);opacity:.9}',
    'image-slot .is-ph svg{opacity:.55}',
    'image-slot.is-over{outline:2px dashed var(--brand,#A03D4E);outline-offset:-4px}'
  ].join('');
  document.head.appendChild(style);

  var ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">' +
    '<rect x="3" y="5" width="18" height="14" rx="3" stroke-width="1.6"/>' +
    '<circle cx="8.5" cy="10" r="1.8" stroke-width="1.6"/>' +
    '<path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  function paint(el) {
    var key = el.getAttribute('id') || '';
    // Priority: a photo the user dropped, then an explicit src, then the
    // photo bundled for this slot in photos.js.
    var src = filled[key] || el.getAttribute('src') ||
      (window.NOMAD_PHOTOS && window.NOMAD_PHOTOS[key]) || '';
    el.style.borderRadius = radiusFor(el);

    if (src) {
      el.innerHTML = '<img class="is-img" alt="" src="' + escapeHtml(src) + '" style="object-fit:' +
        (el.getAttribute('fit') || 'cover') + '">';
    } else {
      el.innerHTML = '<div class="is-ph">' + ICON + '<span>' +
        escapeHtml(el.getAttribute('placeholder') || '') + '</span></div>';
    }
  }

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
    static get observedAttributes() { return ['src', 'placeholder', 'shape', 'radius', 'id', 'fit']; }

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
})();
