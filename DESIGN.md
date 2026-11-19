# Wahat Al Hadaf — Design

## Direction
Minimal, modern, bilingual (English / Arabic). Calm off-white canvas, hairline borders, one dark
brand moment (the "Know the brand" section). Content first: specific service scopes over adjectives.

## Reference points (UAE technical-services market)
Competitors in Dubai (KABCO, Foxterra Gardens, Prime Green, Emrill/mplus, Farnek) consistently:
- list **concrete scopes** per service (interlock & kerbstone, gypsum partitions, drip irrigation, pool re-tiling)
- separate **one-off jobs** from **Annual Maintenance Contracts (AMC)**
- push **WhatsApp / call** as the primary contact path

We adopt all three, with a cleaner presentation than most of the market.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--forest` | `#0b2418` | primary text-on-light buttons, dark section |
| `--green` | `#1e7a3c` | accents, italic headline words |
| `--lime` | `#8cc63f` | dots, checks, highlights (from logo) |
| `--gold` | `#a8842f` | Arabic name, logo gold |
| `--bg` | `#f7f6f1` | page background |
| `--line` | `#e3e3dc` | hairline borders |

Type: **Manrope** (UI/body), **Instrument Serif** italic (one accent word per headline),
**IBM Plex Sans Arabic** (all Arabic text; no italics in Arabic).

Radius 20px cards / 12px controls / pill buttons. No gradients, no drop shadows except the nav on scroll.

## Layout
1. Hero — headline, 3 facts, photo with Arabic name caption, services ticker
2. Services explorer — tab list + detail panel (included scope, ideal for, quote CTA that preselects the form)
3. Plans — One-time job / AMC / Turnkey
4. Brand awareness — name meaning, logo story, values, brand line, social
5. About + 4-step process
6. Contact + WhatsApp quote form

## Bilingual rules
- `html[lang][dir]` switches with the EN/عربي toggle; choice persists (localStorage) and `?lang=ar` deep-links.
- Layout uses logical properties (`margin-inline`, `inset-inline-end`) so RTL mirrors automatically.
- Arrows flip in RTL; phone numbers stay LTR-isolated.
- English copy lives in `index.html`; Arabic in `i18n.js` (`AR`); services in `SERVICES` (both languages).
