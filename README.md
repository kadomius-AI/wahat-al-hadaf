# Wahat Al Hadaf — Website

Modern redesign of the Wahat Al Hadaf Technical Services LLC website (Dubai, est. 2014).

Static site — no build step. Open `index.html` or serve the folder:

```bash
python3 -m http.server 4321
```

Bilingual: English by default, Arabic (RTL) via the nav toggle or `?lang=ar`.

## Pages
- `index.html` — hero, the pinned **From Blueprint to Reality** sequence, trades overview, recent site work, plans teaser
- `services.html` — drawing register + a full scope sheet for each of the six trades
- `plans.html` — one-time job / Annual Maintenance Contract / turnkey, comparison table, AMC scope, FAQ
- `about.html` — story, vision/mission/team, process, brand (logo story, values, social)
- `contact.html` — WhatsApp quote form (pre-filled from `?service=` / `?plan=`), office details, map

## Editing
The root `*.html` files are **generated**. Edit the sources, then rebuild:

```bash
python3 tools/build.py
```

- `src/pages/*.html` — page bodies
- `src/partials/header.html`, `footer.html` — shared nav, closing call-to-action, footer
- `data/services.json` — the six services (English + Arabic); also generates `services-data.js`
- `i18n.js` — Arabic translations (`AR`) and UI strings
- `styles.css`, `script.js` — shared styles and behaviour; `build-section.*` — the home page sequence
- `assets/site/` — real site photos from the Wahat Al Hadaf team

Arabic: `?lang=ar` on any page; the toggle keeps the language across pages.
