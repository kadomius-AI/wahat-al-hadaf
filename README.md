# Wahat Al Hadaf — Website

Modern redesign of the Wahat Al Hadaf Technical Services LLC website (Dubai, est. 2014).

Static site — no build step. Open `index.html` or serve the folder:

```bash
python3 -m http.server 4321
```

Bilingual: English by default, Arabic (RTL) via the nav toggle or `?lang=ar`.

## Sections
- Hero
- **From Blueprint to Reality**: pinned GSAP ScrollTrigger sequence (drawing → structure → envelope → handover)
- Services explorer: General Maintenance, Swimming Pools, Landscaping & Irrigation, Paving & Interlock, Gypsum & Technical Works, Ceramic & Kitchen Design — each with its full scope
- Plans: One-time job / Annual Maintenance Contract / Turnkey project
- **Brand awareness**: name meaning, logo story, brand values, brand line, Instagram/Facebook follow cards, share button
- About, Process, Contact (quote form sends via WhatsApp), Footer

## Files
- `index.html` — markup
- `styles.css` — design tokens (forest green, lime, gold from the logo) and layout
- `build-section.css` / `build-section.js` — the standalone pinned sequence (GSAP from cdnjs)
- `i18n.js` — services data (EN + AR) and Arabic translations
- `script.js` — language toggle, services explorer, nav, reveals, share, WhatsApp quote form
- `DESIGN.md` — design direction, tokens and bilingual rules
- `assets/` — logo (clean, transparent), photography, `build/` stage frames (WebP)
