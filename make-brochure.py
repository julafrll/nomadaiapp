# -*- coding: utf-8 -*-
"""Capture the app inside its own phone frame, at print resolution.

The app already draws an iPhone — bezel, Dynamic Island, status bar — on any
screen wide enough, so this photographs that element rather than pasting the
screen into a frame drawn here. What ends up in the brochure is the design as
it actually renders.

Run with the app served on 8791. Writes into brochure/.
"""
import os
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:8791/'
OUT = r'D:\nomad-ai-app\brochure'
SCALE = 3                      # 417pt bezel -> 1251px, enough for print
PAD = 90                       # room for the frame's own drop shadow

OVERLAY = """() => [...document.querySelectorAll('div')].find(
  e => /z-index:40/.test((e.getAttribute('style') || '').replace(/\\s/g, '')))"""

READ_OVERLAY = "() => { const o = (%s)(); return o ? o.innerText.trim().replace(/\\n+/g, ' | ').slice(0, 70) : null; }" % OVERLAY

CLICK_PRIMARY = """() => {
  const o = (%s)();
  if (!o) return false;
  const b = [...o.querySelectorAll('[role="button"]')];
  if (!b.length) return false;
  b[b.length - 1].click();          // the primary action is always last
  return true;
}""" % OVERLAY

FILL_NAME = """() => {
  const o = (%s)();
  if (!o) return false;
  const ins = [...o.querySelectorAll('input')];
  if (!ins.length) return false;
  if (!ins[0].value) { ins[0].value = 'Alex'; ins[0].dispatchEvent(new Event('input', {bubbles:true})); }
  return true;
}""" % OVERLAY

TYPE_COUNTRY = """(q) => {
  const o = (%s)();
  const i = o && o.querySelector('input');
  if (!i) return false;
  i.value = q; i.dispatchEvent(new Event('input', {bubbles:true}));
  return true;
}""" % OVERLAY

PICK_COUNTRY = """(q) => {
  const o = (%s)();
  if (!o) return false;
  const row = [...o.querySelectorAll('[role="button"]')]
    .find(e => e.textContent.trim() === q);
  if (!row) return false;
  row.click();
  return true;
}""" % OVERLAY

# Only the phone should be in frame: no logo row, no Light/Dark, no iOS/Android.
HIDE_CHROME = """() => {
  document.querySelectorAll('.nomDemoChrome, .nomChips').forEach(e => e.style.display = 'none');
  const card = document.querySelector('.nomInstall');
  if (card) card.remove();
  const page = document.querySelector('.nomPage');
  if (page) { page.style.padding = '0'; page.style.minHeight = 'auto'; }
}"""

TAP_TAB = """(label) => {
  const el = document.querySelector('[data-ref="tabBar"] [aria-label="' + label + '"]');
  if (el) { el.click(); return true; }
  return false;
}"""

TAP_SEARCH = """() => {
  const el = [...document.querySelectorAll('[data-h]')]
    .find(e => /Where do you want to go/.test(e.textContent));
  if (el) { el.click(); return true; }
  return false;
}"""

# Centre on Bishkek. Zoom 14 rather than 13: at 13 the downtown pins pile on
# top of each other - the crowding that comes with printing a rating on every
# pin instead of a 7px dot - and a brochure cannot afford it.
ZOOM_CITY = """() => {
  if (window.NomadEngine && window.NomadEngine.panTo) {
    window.NomadEngine.panTo(42.8760, 74.6010, 14);
    return true;
  }
  return false;
}"""

# Tap the best-rated pin. It swaps the "Tap a pin to see the place" hint -
# which the "Ask about what you see" button sits across - for the place card,
# which is the better thing to show anyway.
TAP_BEST_PIN = """() => {
  const p = document.querySelector('.nm-pin--top') || document.querySelector('.nm-pin');
  if (!p) return false;
  p.dispatchEvent(new MouseEvent('mousedown', {bubbles:true, cancelable:true}));
  p.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
  return true;
}"""

SCREEN = """() => { const s = document.querySelector('[data-screen-label]');
                    return s ? s.getAttribute('data-screen-label') : '(none)'; }"""

COUNTRY = 'Poland'


def walk_intro(page):
    """Step through the intro deliberately, waiting for each re-render.

    The first version fired every click in one synchronous loop, so the app
    only ever processed the first one and every screenshot came out showing
    step 2 of the intro. Each step now waits, and the country step is
    answered rather than skipped — its Continue is inert until one is chosen,
    which is what the loop was silently stuck on.
    """
    for _ in range(12):
        text = page.evaluate(READ_OVERLAY)
        if text is None:
            return True                       # overlay gone: we are in the app
        if 'FIRST NAME' in text or 'call you' in text:
            page.evaluate(FILL_NAME)
        elif 'Where are you travelling from' in text or 'Select a country' in text:
            page.evaluate(TYPE_COUNTRY, COUNTRY)
            page.wait_for_timeout(400)
            page.evaluate(PICK_COUNTRY, COUNTRY)
            page.wait_for_timeout(400)
        page.evaluate(CLICK_PRIMARY)
        page.wait_for_timeout(800)
    return page.evaluate(READ_OVERLAY) is None


def shoot(page, name):
    page.evaluate(HIDE_CHROME)
    bezel = page.query_selector('.nomBezel')
    if not bezel:
        print('  no phone frame for', name)
        return
    box = bezel.bounding_box()
    clip = {
        'x': max(box['x'] - PAD, 0),
        'y': max(box['y'] - PAD, 0),
        'width': box['width'] + PAD * 2,
        'height': box['height'] + PAD * 2,
    }
    path = os.path.join(OUT, 'nomadai-iphone-%s.png' % name)
    page.screenshot(path=path, clip=clip)
    print('  wrote %-12s (screen: %s)' % (name, page.evaluate(SCREEN)))


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Geolocation granted and pinned to Bishkek: it removes the "Use my
        # location" card that otherwise sits over the map, and the distances
        # on every card become real measurements instead of the written-in
        # placeholders.
        ctx = browser.new_context(
            viewport={'width': 1100, 'height': 1150},
            device_scale_factor=SCALE,
            geolocation={'latitude': 42.8746, 'longitude': 74.6122},
            permissions=['geolocation'],
            locale='en-GB',
        )
        page = ctx.new_page()
        page.goto(BASE, wait_until='networkidle')
        page.wait_for_timeout(1500)

        # The intro splash is worth a frame of its own — it carries the logo.
        page.evaluate(HIDE_CHROME)
        page.wait_for_timeout(600)
        shoot(page, 'intro')

        if not walk_intro(page):
            print('  intro did not finish; aborting rather than shooting it')
            browser.close()
            return
        page.wait_for_timeout(1400)          # the overlay dissolves, not cuts

        for name, tab in [('home', 'Home'), ('map', 'Map'), ('assistant', 'AI Assistant')]:
            page.evaluate(TAP_TAB, tab)
            page.wait_for_timeout(2800)      # tiles, photos and animations settle
            if name == 'map':
                page.evaluate(ZOOM_CITY)
                page.wait_for_timeout(3200)  # new tiles at the new zoom
                page.evaluate(TAP_BEST_PIN)
                page.wait_for_timeout(1400)  # the card rises from the bottom
            shoot(page, name)

        page.evaluate(TAP_TAB, 'Home')
        page.wait_for_timeout(700)
        page.evaluate(TAP_SEARCH)
        page.wait_for_timeout(2600)
        shoot(page, 'search')

        browser.close()


main()
