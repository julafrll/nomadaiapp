# -*- coding: utf-8 -*-
"""Capture every screen of the app as a PNG, at phone size, via Playwright."""
import os, sys, time
from playwright.sync_api import sync_playwright

OUT = 'screenshots'
BASE = 'http://localhost:8731/index.html'
os.makedirs(OUT, exist_ok=True)

# label, chip to click (None = already there), scroll offset inside the phone
SCREENS = [
    ('01-home',        'Home',          0),
    ('02-search',      'Search',        0),
    ('03-place',       'Place',         0),
    ('04-place-detail','Place',         520),
    ('05-map',         'Map',           0),
    ('06-ai',          'AI Assistant',  0),
    ('07-itinerary',   'Itinerary',     0),
    ('08-itinerary-day','Itinerary',    620),
    ('09-rewards',     'Rewards',       0),
    ('10-challenge',   'Challenge',     0),
    ('11-verify',      'Verify',        0),
    ('12-review',      'Write review',  0),
    ('13-saved',       'Saved',         0),
    ('14-trips',       'My trips',      0),
    ('15-phrasebook',  'Phrasebook',    0),
    ('16-currency',    'Currency',      0),
    ('17-emergency',   'Emergency',     0),
    ('18-profile',     'Profile',       0),
]

CLICK_CHIP = """(name) => {
  const el = [...document.querySelectorAll('[data-h]')]
    .find(e => e.textContent.replace(/\\s+/g,' ').trim() === name);
  if (el) el.click();
  return !!el;
}"""

SCROLL_PHONE = """(y) => {
  const sc = document.querySelector('[data-ref="scrollRef"]');
  if (sc) sc.scrollTop = y;
}"""

SET_LANG = """(lang) => {
  const p = JSON.parse(localStorage.getItem('nomad.profile.v1') || 'null')
        || { first:'Alex', last:'K.', country:'Kyrgyzstan' };
  p.lang = lang;
  localStorage.setItem('nomad.profile.v1', JSON.stringify(p));
}"""

SET_THEME = """(mode) => {
  const el = [...document.querySelectorAll('[data-h]')]
    .find(e => e.textContent.trim() === (mode === 'dark' ? 'Dark' : 'Light'));
  if (el) el.click();
}"""


def shoot(page, name, note=''):
    phone = page.locator('div[style*="width:393px"]').first
    phone.screenshot(path=os.path.join(OUT, name + '.png'))
    sys.stdout.write('  %s.png %s\n' % (name, note))
    sys.stdout.flush()


with sync_playwright() as pw:
    b = pw.chromium.launch()
    page = b.new_page(viewport={'width': 900, 'height': 1200}, device_scale_factor=2)

    # ---------- intro, from a clean slate ----------
    page.goto(BASE + '?reset=1', wait_until='networkidle')
    page.wait_for_timeout(900)
    shoot(page, '00-intro-1-splash', '(logo)')

    def cta():
        return page.locator('[data-h][style*="height:56px"]').last

    cta().click(); page.wait_for_timeout(450)
    shoot(page, '00-intro-2-language')
    cta().click(); page.wait_for_timeout(450)
    page.fill('input[aria-label="First name"]', 'Aiperi')
    page.fill('input[aria-label="Last name"]', 'Toktogulova')
    page.wait_for_timeout(350)
    shoot(page, '00-intro-3-name')
    cta().click(); page.wait_for_timeout(450)
    page.fill('input[aria-label="Search countries"]', 'kyrgy')
    page.wait_for_timeout(350)
    shoot(page, '00-intro-4-country')
    page.locator('[data-h][style*="padding:14px 15px"]').first.click()
    page.wait_for_timeout(250)
    cta().click(); page.wait_for_timeout(1900)
    shoot(page, '00-intro-5-complete', '(route animation)')
    cta().click(); page.wait_for_timeout(900)

    # ---------- every screen, in English ----------
    page.evaluate(SET_LANG, 'en')
    page.goto(BASE, wait_until='networkidle')
    page.wait_for_timeout(800)
    for name, chip, scroll in SCREENS:
        page.evaluate(CLICK_CHIP, chip)
        page.wait_for_timeout(420)
        if scroll:
            page.evaluate(SCROLL_PHONE, scroll)
            page.wait_for_timeout(320)
        shoot(page, name)

    # ---------- a few in Russian and Kyrgyz ----------
    for lang, tag in (('ru', 'russian'), ('ky', 'kyrgyz')):
        page.evaluate(SET_LANG, lang)
        page.goto(BASE, wait_until='networkidle')
        page.wait_for_timeout(800)
        for label, chip, scroll in (('home', 'Home', 0), ('place', 'Place', 520), ('profile', 'Profile', 0)):
            page.evaluate(CLICK_CHIP, chip)
            page.wait_for_timeout(400)
            if scroll:
                page.evaluate(SCROLL_PHONE, scroll)
                page.wait_for_timeout(300)
            shoot(page, '19-%s-%s' % (tag, label))

    # ---------- dark mode ----------
    page.evaluate(SET_LANG, 'en')
    page.goto(BASE, wait_until='networkidle')
    page.wait_for_timeout(700)
    page.evaluate(SET_THEME, 'dark')
    page.wait_for_timeout(500)
    for label, chip in (('home', 'Home'), ('place', 'Place'), ('rewards', 'Rewards')):
        page.evaluate(CLICK_CHIP, chip)
        page.wait_for_timeout(420)
        shoot(page, '20-dark-%s' % label)

    b.close()

files = sorted(os.listdir(OUT))
total = sum(os.path.getsize(os.path.join(OUT, f)) for f in files)
sys.stdout.write('\n%d screenshots, %.1f MB\n' % (len(files), total / 1048576.0))
