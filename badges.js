/* Nomad AI — badge artwork.
   Each badge is a gradient frame (one of six silhouettes) plus an emblem.
   Ported from the design's React element tree to plain SVG markup. */
(function () {
  var badgeSkins = window.NOMAD_DATA.badgeSkins;

  var frames = {
    hex: 'M60 4 108 31v58L60 116 12 89V31Z',
    scallop: 'M60 5c8 0 12-1 19 2s10 7 17 11 9 3 13 10-1 12 0 20-1 13-4 20-9 9-13 16-8 9-15 11-12-1-20-1-13 2-20-1-10-7-17-11-9-3-13-10 1-12 0-20 1-13 4-20 9-9 13-16 8-9 15-11 12 1 20 1Z',
    arch: 'M60 4c26 0 44 17 44 42v50a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16V46C16 21 34 4 60 4Z',
    diamond: 'M60 4c6 0 46 34 50 44s2 12-3 20-38 48-47 48-42-40-47-48-8-10-3-20S54 4 60 4Z',
    oct: 'M42 6h36l36 36v36l-36 36H42L6 78V42Z',
    coin: 'M60 3l7 5 8-3 6 6 9 1 3 8 8 5-1 9 5 7-5 7 1 9-8 5-3 8-9 1-6 6-8-3-7 5-7-5-8 3-6-6-9-1-3-8-8-5 1-9-5-7 5-7-1-9 8-5 3-8 9-1 6-6 8 3Z'
  };

  function emblems(kind, ink, rim, c2) {
    switch (kind) {
      case 'coffee':
        return '<path d="M36 48h38v18c0 10-8 17-19 17s-19-7-19-17V48Z" fill="' + ink + '"/>' +
          '<path d="M76 53h6a8 8 0 0 1 0 16h-6" stroke="' + ink + '" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
          '<path d="M32 88h44" stroke="' + ink + '" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M49 38c-4-5 3-8 0-13M61 38c-4-5 3-8 0-13" stroke="' + rim + '" stroke-width="4" stroke-linecap="round" fill="none"/>';
      case 'history':
        return '<path d="M60 28c11 0 17 8 17 18v40H43V46c0-10 6-18 17-18Z" fill="' + ink + '"/>' +
          '<path d="M43 56h34M43 68h34" stroke="' + c2 + '" stroke-width="3.4"/>' +
          '<path d="M54 78h12v8H54Z" fill="' + c2 + '"/>' +
          '<path d="M36 90h48" stroke="' + rim + '" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="60" cy="22" r="4" fill="' + rim + '"/>';
      case 'nature':
        return '<circle cx="76" cy="40" r="8" fill="' + rim + '"/>' +
          '<path d="M26 82 48 44l14 24 8-12 22 26H26Z" fill="' + ink + '"/>' +
          '<path d="M40 62h16l-8-14Z" fill="' + c2 + '" opacity=".5"/>' +
          '<path d="M30 92c8-5 14 3 22-1s14 3 22-2" stroke="' + rim + '" stroke-width="4.4" stroke-linecap="round" fill="none"/>';
      case 'photo':
        return '<circle cx="60" cy="60" r="27" stroke="' + ink + '" stroke-width="6" fill="none"/>' +
          '<path d="M60 39 44 66h32L60 39Z" fill="' + ink + '" opacity=".92"/>' +
          '<path d="M60 81 76 54H44l16 27Z" fill="' + rim + '" opacity=".8"/>' +
          '<circle cx="60" cy="60" r="7" fill="' + c2 + '"/>';
      case 'smart':
        return '<circle cx="60" cy="60" r="28" fill="none" stroke="' + ink + '" stroke-width="4" opacity=".35"/>' +
          '<path d="M74 44a20 20 0 1 0 0 32" stroke="' + ink + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
          '<path d="M44 54h30M44 66h30" stroke="' + ink + '" stroke-width="7" stroke-linecap="round"/>';
      default: // gourmet
        return '<path d="M36 54h48c0 16-8 26-24 26S36 70 36 54Z" fill="' + ink + '"/>' +
          '<path d="M32 52h56" stroke="' + ink + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
          '<path d="M48 82h24" stroke="' + ink + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
          '<path d="M52 42c-4-5 2-8-1-13M60 40c-4-6 3-9 0-15M68 42c-4-5 2-8-1-13" stroke="' + rim + '" stroke-width="4" stroke-linecap="round" fill="none"/>';
    }
  }

  // Locked badges drop to a flat stone palette so the gold reads as a reward.
  window.badgeArt = function (kind, size, locked) {
    var sk = badgeSkins[kind] || badgeSkins.gourmet;
    var gid = 'v2b-' + kind + '-' + size + (locked ? '-l' : '');
    var c1 = locked ? '#DCD2C6' : sk.frame[0];
    var c2 = locked ? '#C2B5A6' : sk.frame[1];
    var rim = locked ? 'rgba(27,20,17,.14)' : sk.rim;
    var ink = locked ? '#FFFFFF' : sk.ink;
    var d = frames[sk.shape];

    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" style="display:block;overflow:visible">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/>' +
      '</linearGradient></defs>' +
      '<path d="' + d + '" fill="url(#' + gid + ')" stroke="' + rim + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + rim + '" stroke-width="1.6" opacity=".45" transform="translate(60 60) scale(.86) translate(-60 -60)"/>' +
      emblems(kind, ink, rim, c2) +
      '</svg>';
  };
})();
