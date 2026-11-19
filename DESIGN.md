# Wahat Al Hadaf — Design

## Direction
A Dubai technical-services contractor that reads like a serious construction firm, not a template.
Concrete-light surfaces, the brand's forest green, a wide architectural typeface, and **one** cinematic
moment: the pinned "From Blueprint to Reality" section. Everything else is quiet, left-aligned and ruled.

Built with the `frontend-design` (anthropics/skills) and `impeccable` (pbakaus) skills, and GSAP's
official `gsap-scrolltrigger` / `gsap-performance` skills.

## Refused defaults (and what replaced them)
| Default | Replaced with |
|---|---|
| Cream background + italic serif accent word | Cool concrete `#eef0ec`, single family, no accent words |
| All-caps eyebrow above every heading | Headings stand alone |
| `A · B · C` meta strings, `→` on buttons | Plain sentences, plain button labels |
| 01/02/03 on non-sequences | Numbers only on real sequences (build stages, job process) |
| Big-number stat row in the hero | Facts in the lead sentence |
| Fade-up on every section, marquee | No scattered motion; one scroll-driven sequence |
| Identical rounded cards | Ruled columns and lists; one surface per section at most |

## Tokens
| Token | Value | Use |
|---|---|---|
| `--forest` | `#0f2a1d` | primary buttons, dark sections, display text |
| `--green` | `#1e7a3c` | links, focus, ticks |
| `--lime` | `#8cc63f` | small markers, active states, selection (from logo) |
| `--gold` / `--gold-soft` | `#a8842f` / `#dcc68f` | logo gold, sub-heads on dark |
| `--stone` | `#eef0ec` | page background |
| `--line` | `#d6dad3` | rules |
| build ink | `#0b1a24` | blueprint section ground |

Type: **Archivo** (variable width): headings at 112–122% width, body at 100%.
**IBM Plex Sans Arabic** for all Arabic. Radii: 8px controls, 14px surfaces.

## Blueprint to Reality (`build-section.css` / `build-section.js`)
Standalone, reusable. Four layered stills of one villa, same camera:
1. Drawing (blueprint) → 2. Structure (concrete frame) → 3. Envelope (cladding, glass, pool shell) → 4. Handover (finished, lit).
- GSAP ScrollTrigger, `pin` + `scrub: 0.6`, fully reversible.
- Each stage wipes up with a scan line; outgoing layer drops back slightly (parallax), whole camera dollies out (depth).
- Headline "From Vision to Reality" + "Explore Our Projects" at the end.
- Frames: WebP at 1100w / 2000w via `srcset`; first frame preloaded; all frames decoded before the pin.
- `gsap.matchMedia`: reduced motion shows the finished building and headline, no pin. Portrait screens frame the building in an upper band with text below.
- Without JS: the finished frame and headline are visible.
- Images generated with Nano Banana 2.1 from one master shot (sources not committed).

## Bilingual rules
- English by default. Arabic via the toggle or `?lang=ar` (the toggle updates the URL so links can be shared).
- Logical properties (`margin-inline`, `inset-inline-*`) so RTL mirrors automatically; phone numbers stay LTR-isolated.
- English copy in `index.html`; Arabic in `i18n.js` (`AR`); services in `SERVICES` (both languages).
