# Nomad AI

An interactive prototype of the Nomad AI travel app for Kyrgyzstan — food, places,
phrases, itineraries, and rewards, shown inside a phone frame you can click through.

**No coding, no installing anything.** Follow the steps below.

---

## How to open it (about 2 minutes)

### Step 1 — Download the files

1. Go to the repository page: <https://github.com/julafrll/nomadaiapp>
2. Click the green **`< > Code`** button near the top right.
3. In the little menu that drops down, click **Download ZIP**.
4. The file `nomadaiapp-main.zip` lands in your **Downloads** folder.

### Step 2 — Unzip it

**Windows:** right-click the ZIP file → **Extract All…** → **Extract**.

**Mac:** double-click the ZIP file.

You now have a normal folder named `nomadaiapp-main`.

> Don't skip this. Opening the app from *inside* the ZIP without extracting it
> first will show a blank page.

### Step 3 — Open the app

Open the `nomadaiapp-main` folder and **double-click `index.html`**.

The app opens in your web browser. That's it — it's running.

If double-clicking opens a text editor full of code instead, right-click
`index.html` → **Open with** → pick **Chrome**, **Edge**, or **Safari**.

---

## Using it

A phone appears in the middle of the screen. Click things on the phone screen
the way you'd tap them in real life.

Around the phone are the controls:

| Control | What it does |
| --- | --- |
| **Light / Dark** | Switches between the bright and the night colour scheme. |
| **iOS / Android** | Redraws the phone as an iPhone or an Android device. |
| **▶ Intro** | Plays the first-time welcome screens. |
| **✦ New profile** | Wipes your progress and starts over as a brand-new user. |
| **The list of screen names** | Jumps straight to any screen — Home, Map, AI Assistant, Phrasebook, Rewards, and so on. |

Everything is saved on your own computer only. Nothing is uploaded, and there
is no account to create.

---

## Turning on the assistant

The AI assistant answers for real, through Google's Gemini. It needs a key:

1. Go to <https://aistudio.google.com/apikey> and create a free key.
2. Open the app, go to **AI Assistant**, and ask anything.
3. The first time, it asks you to paste the key. Paste it and press OK.

The key is stored **in your browser on this machine only**. It is deliberately
not written into any file in this folder, because every file here is readable by
anyone who opens the app.

Without a key — on a plane, or once the free daily quota runs out — the
assistant falls back to the written answers this prototype has always had, and
says so in small print under the reply instead of passing them off as live.

> Google's free tier allows roughly 20 questions a day per model, so the app is
> configured with three and moves to the next automatically when one runs out.

---

## Your support desk

The Emergency screen leads with your own contact details, above the national
numbers and visibly separate from them — 112 is for an emergency, this is for
a traveller who is stuck.

Fill in `support` in `nomad-config.js`: a phone number, a WhatsApp number, a
Telegram handle, an email, and the hours a human answers. Each channel appears
only once it has a value, so a desk with just Telegram still looks deliberate.
With none of them filled in, travellers are offered the assistant, which needs
nothing configured.

Nothing there is invented — put your real details in. An unanswered number on
an emergency screen is worse than no number.

## Good to know

- **Most of it works without internet.** Offline you lose the map tiles, the
  directions and the live assistant (which falls back to written answers).
  Places, search, phrasebook, itineraries and rewards keep working.
- **The map is a real map.** OpenStreetMap tiles with 62 places at their true
  coordinates. Drag and zoom it. Tap one of the red pins and a card for that
  place comes up from the bottom, with its rating, price and how far away it
  is; from there you can open the place or ask for directions to it. Tap the
  map itself, or the card's ✕, to put it away again. Pins are coloured by
  category — blue for places to stay, green for nature, brown for coffee and
  so on — with a key under the filter chips.
- **Real bus routes, on the map.** Bishkek retired its marshrutkas, so the app
  no longer describes them. Tap a pin and its card names the nearest stop and
  the route numbers that actually call there, read from 2GIS; tap that line to
  centre the map on the stop. Without a 2GIS key in `nomad-config.js` it
  simply does not appear.
- **Chains show all their branches.** Navat has seventeen locations, Bublik
  nine, Adriano seven — the app used to show one address each. Every branch is
  looked up in 2GIS when you open a place: the place screen lists them all
  with distances, and selecting the place on the map draws the rest as hollow
  rings in the same colour. Tap any branch to centre the map on it.
- **Trips and the itinerary draw their own routes.** Each card in My trips,
  and the header on the Itinerary screen, shows the real shape of that
  journey, drawn from the coordinates of the places it visits. Tap one — or
  **Show on map** on any single day — and the route is plotted along real
  roads, with its driving distance and time.
- **The assistant can see the map.** Tap the floating ✦ button on Home or the
  map and ask "what's around here?" — it answers from the places actually
  inside the visible area, knows which place you have open, and knows what
  route is drawn. Pan or zoom and the answer follows.
- **Distances are measured.** Allow location when the browser asks and every
  distance becomes the real one from where you are standing. Said no, or never
  got asked? The map carries a **Use my location** panel that asks again, and
  the centre button asks too. Decline, and they
  stay measured from the middle of Bishkek as before.
- **Directions follow real roads.** "Get directions" asks a routing service for
  an actual driving route and draws it on the map.
- **Location needs a local server.** Browsers block location on a page opened
  straight from a file, so double-clicking `index.html` keeps the Bishkek-centre
  distances. See "For developers" below to serve it over `http://localhost`.
- **The phrasebook talks.** Tap a phrase to hear a native Kyrgyz speaker say it.
  Turn your volume up.
- **Every place has a photograph, and the app tells you which are real.**
  The landmarks, parks, museums and lakes show a photograph of that actual
  place. Most of the restaurants, cafes, hostels and malls are private
  businesses with no free-licensed photograph in existence, so they show a
  representative image instead — the dish they are known for, or the kind of
  room you would book. Those carry a **Representative** badge on the picture
  and a line of explanation on the place screen. Drop your own photo on any
  image to replace it; yours is never marked. Credits and licences for every
  bundled photograph are in `img/CREDITS.md`.
- **Prices and reviews are still demo content** — this is not a booking system.
- **To get updates later**, just download the ZIP again and replace your folder.

---

## If something looks wrong

**Blank white page** — you're most likely opening it from inside the ZIP.
Go back to Step 2 and extract the folder first.

**Page looks broken or half-styled** — you may have opened `index.html` on its
own, away from the other files. It needs to stay in the same folder as
`app.js`, `styles.css`, and the `img` folder. Re-extract the whole ZIP.

**Old version keeps showing after an update** — hold `Ctrl` and press `F5`
(Mac: hold `Cmd` + `Shift` and press `R`) to force the browser to reload.

**No sound in the phrasebook** — check your volume, and click somewhere on the
page once first. Browsers block audio until you've interacted with the page.

---

## For developers

Static site — plain HTML, CSS, and JavaScript. No build step, no dependencies,
no package manager.

```
index.html         page shell, loads everything below
app.js             all screens and interaction logic
data.js            places, phrases, itineraries, badge definitions
nomad-config.js    models, tile and routing endpoints — the only file to edit
nomad-places.js    real coordinates + the places from the bot's database
                   (generated — re-run "npm run export:app" in the nomad-ai
                   project rather than editing it)
nomad-engine.js    the working parts: merges the real place data into data.js,
                   measures distances, mounts the map, asks OSRM for routes,
                   and runs the Gemini assistant
phrase-audio.js    base64 pronunciation clips (MP4/AAC)
badges.js          rewards and challenge rules
photos.js          photo credits and mapping
image-slot.js      image placeholder helper
styles.css         theme variables and phone frame
img/               flags and photography
screenshots/       marketing captures
make-screenshots.py  regenerates screenshots/
```

To serve it over HTTP instead of `file://`:

```bash
python -m http.server 8765 --directory .
```

Then open <http://localhost:8765>.

The `?v=` query strings on the script tags in `index.html` bust the browser
cache — bump the number after editing any of those files, or a reload can
quietly keep running the previous version.

### Deploying to Cloudflare Pages

The site is the folder, so there is no build command. The two API keys live in
functions that run on Cloudflare, never in the browser:

```
functions/api/ai.js        →  /api/ai        Gemini, holds GEMINI_API_KEY
functions/api/transit.js   →  /api/transit   2GIS, holds TWOGIS_API_KEY
_headers                   →  the cache rules netlify.toml used to carry
wrangler.toml              →  project name and publish directory
```

The route comes from each file's path, which is why `nomad-config.js` needs no
change: it already calls `/api/ai` and `/api/transit`.

In the Pages project — Build command: *(leave empty)*, Build output directory:
`/`. Then put both keys on the project from the `.env` you already keep, in
one command, instead of clicking through the dashboard twice:

```bash
npx wrangler login    # once, ever — Cloudflare has to know it is you
node push-secrets.mjs
```

They are stored as encrypted Secrets, read by the functions as `env.*`, and
never written to the repo.

**The keys are deliberately not committed.** This repository is public, GitHub
scans public pushes for credentials and reports Google API keys to Google, and
Google revokes them automatically. A committed `GEMINI_API_KEY` would not save
a step — it would kill the assistant a few hours after the first push, with
nothing in the app to explain why. The 2GIS key would survive and be spendable
by anyone who read the repo.

**Deploy by pushing to GitHub, not with `wrangler pages deploy`.** The direct
upload sends the working directory and ignores `.gitignore`, exactly as
`netlify deploy` did. It skips dotfiles, so `.env` and `.dev.vars` survive it,
but a plainly-named secrets file in this folder would be published.

To run it locally the way Cloudflare will:

```bash
wrangler pages dev
```

That reads `.dev.vars` (copy `.dev.vars.example`) and serves both functions.
Note it does *not* skip dotfiles the way a deploy does — `/.env` is readable
from `localhost` during a local run. Harmless, but don't screen-share it.

The Netlify setup is untouched in `netlify/` and `netlify.toml`, so the old
site still deploys if you need to fall back. The two function directories hold
the same logic and must be changed together while both are live.
