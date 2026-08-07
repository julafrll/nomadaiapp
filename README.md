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

## Good to know

- **It works without internet.** Only the fonts come from the web, so offline the
  text just looks slightly different. Everything else keeps working.
- **The phrasebook talks.** Tap a phrase to hear a native Kyrgyz speaker say it.
  Turn your volume up.
- **It's a prototype.** The places, prices, and reviews are demo content for
  showing how the app works — not a live booking system.
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
