#!/usr/bin/env python3
"""Build the static pages.

src/pages/<page>.html  + src/partials/{header,footer}.html  + data/services.json
  -> <page>.html at the repo root (served by GitHub Pages) and services-data.js.

Run:  python3 tools/build.py
"""
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
SERVICES = json.loads((ROOT / "data/services.json").read_text())

PAGES = {
    "index": dict(
        title="Wahat Al Hadaf — Technical Services, Dubai",
        description="Dubai technical services contractor since 2014: general maintenance, swimming pools, landscaping and irrigation, paving and interlock, gypsum works, ceramics and kitchens.",
        canonical="",
        head_extra='  <link rel="preload" as="image" href="assets/build/stage-1-blueprint-2000.webp" imagesrcset="assets/build/stage-1-blueprint-1100.webp 1100w, assets/build/stage-1-blueprint-2000.webp 2000w" imagesizes="100vw">\n  <link rel="stylesheet" href="build-section.css">\n',
        scripts=["gsap", "build"],
    ),
    "services": dict(
        title="Services — Wahat Al Hadaf, Dubai",
        description="Six trades, one team: maintenance, swimming pools, landscaping and irrigation, paving and interlock, gypsum works, ceramics and kitchens in Dubai.",
        canonical="services.html",
    ),
    "plans": dict(
        title="Plans — Wahat Al Hadaf, Dubai",
        description="Hire Wahat Al Hadaf for a one-time job, an Annual Maintenance Contract (AMC) or a turnkey project in Dubai.",
        canonical="plans.html",
    ),
    "about": dict(
        title="About — Wahat Al Hadaf, Dubai",
        description="Wahat Al Hadaf Technical Services LLC: a Dubai facilities management and MEP contractor since 2014.",
        canonical="about.html",
    ),
    "contact": dict(
        title="Contact — Wahat Al Hadaf, Dubai",
        description="Call, WhatsApp or email Wahat Al Hadaf Technical Services, City Gate Building, Port Saeed, Deira, Dubai.",
        canonical="contact.html",
        no_cta=True,
    ),
}

SCRIPT_TAGS = {
    "gsap": '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>',
    "build": '<script src="build-section.js"></script>',
}

e = html.escape


def icon(d):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="{d}"/></svg>'


def home_trades():
    rows = []
    for i, s in enumerate(SERVICES):
        sid, en = s["id"], s["en"]
        rows.append(
            f'      <li><a href="services.html#{sid}" class="trade">'
            f'<span class="trade__icon">{icon(s["icon"])}</span>'
            f'<span class="trade__name" data-i18n="svc.{sid}.name">{e(en["name"])}</span>'
            f'<span class="trade__short" data-i18n="svc.{sid}.short">{e(en["short"])}</span>'
            f'<span class="trade__go" data-i18n="home.scope">See the scope</span></a></li>'
        )
    return "\n".join(rows)


def services_index():
    return "\n".join(
        f'        <li><a href="#{s["id"]}"><span class="reg__no">S-{i+1:02d}</span>'
        f'<span data-i18n="svc.{s["id"]}.name">{e(s["en"]["name"])}</span></a></li>'
        for i, s in enumerate(SERVICES)
    )


def services_sheets():
    out = []
    for i, s in enumerate(SERVICES):
        sid, en = s["id"], s["en"]
        items = "\n".join(
            f'            <li data-i18n="svc.{sid}.i{k}">{e(x)}</li>' for k, x in enumerate(en["items"])
        )
        ideal = ", ".join(en["ideal"])
        out.append(f'''      <article class="sheet" id="{sid}" aria-labelledby="{sid}-t">
        <header class="sheet__head">
          <span class="sheet__no">S-{i+1:02d}</span>
          <span class="sheet__icon">{icon(s["icon"])}</span>
        </header>
        <h2 class="sheet__title" id="{sid}-t" data-i18n="svc.{sid}.name">{e(en["name"])}</h2>
        <p class="sheet__desc" data-i18n="svc.{sid}.desc">{e(en["desc"])}</p>
        <div class="sheet__body">
          <div>
            <h3 class="sheet__label" data-i18n="ui.included">What’s included</h3>
            <ul class="sheet__list">
{items}
            </ul>
          </div>
          <div class="sheet__side">
            <h3 class="sheet__label" data-i18n="ui.ideal">Ideal for</h3>
            <p class="sheet__ideal" data-i18n="svc.{sid}.ideal">{e(ideal)}</p>
            <a class="btn" href="contact.html?service={sid}" data-i18n="ui.quote">Get a quote for this</a>
          </div>
        </div>
      </article>''')
    return "\n\n".join(out)


def services_data_js():
    ar = {}
    for s in SERVICES:
        sid, a = s["id"], s["ar"]
        ar[f"svc.{sid}.name"] = a["name"]
        ar[f"svc.{sid}.short"] = a["short"]
        ar[f"svc.{sid}.desc"] = a["desc"]
        ar[f"svc.{sid}.ideal"] = "، ".join(a["ideal"])
        for k, x in enumerate(a["items"]):
            ar[f"svc.{sid}.i{k}"] = x
    slim = [{"id": s["id"], "en": s["en"]["name"], "ar": s["ar"]["name"]} for s in SERVICES]
    return (
        "/* Generated by tools/build.py from data/services.json. Do not edit by hand. */\n"
        f"window.SERVICES = {json.dumps(slim, ensure_ascii=False, indent=1)};\n"
        f"window.AR = Object.assign(window.AR || {{}}, {json.dumps(ar, ensure_ascii=False, indent=1)});\n"
    )


def bust(page_html):
    """Append ?v=<content hash> to local CSS/JS so browsers and GitHub's CDN pick up changes at once."""
    def ver(m):
        path = ROOT / m.group(2)
        if not path.exists():
            return m.group(0)
        h = hashlib.sha1(path.read_bytes()).hexdigest()[:8]
        return f'{m.group(1)}{m.group(2)}?v={h}"'
    return re.sub(r'((?:href|src)=")([a-z0-9-]+\.(?:css|js))"', ver, page_html)


SITE = "https://w-alhadaf.com"
SLUG = {"index": "", "services": "services", "plans": "plans", "about": "about", "contact": "contact"}


def clean_links(page_html):
    """Page links without .html: index.html -> ./ , services.html#x -> services#x (GitHub Pages serves both)."""
    def repl(m):
        name, rest = m.group(1), m.group(2) or ""
        return f'href="{"./" if name == "index" else name}{rest}"'
    return re.sub(r'href="(index|services|plans|about|contact)\.html([?#][^"]*)?"', repl, page_html)


def root_assets(page_html):
    """Root-relative asset paths so the same markup works at / and /ar/."""
    page_html = re.sub(r'(["\s,])assets/', r'\1/assets/', page_html)
    return re.sub(r'((?:href|src)=")([a-z0-9-]+\.(?:css|js))', r'\1/\2', page_html)


def bust(page_html):
    """Append ?v=<content hash> to local CSS/JS so browsers and GitHub's CDN pick up changes at once."""
    def ver(m):
        path = ROOT / m.group(2)
        if not path.exists():
            return m.group(0)
        h = hashlib.sha1(path.read_bytes()).hexdigest()[:8]
        return f'{m.group(1)}{m.group(2)}?v={h}"'
    return re.sub(r'((?:href|src)="/)([a-z0-9-]+\.(?:css|js))"', ver, page_html)


def alternates(page, lang):
    slug = SLUG[page]
    en, ar = f"{SITE}/{slug}", f"{SITE}/ar/{slug}"
    return (f'  <link rel="canonical" href="{ar if lang == "ar" else en}">\n'
            f'  <link rel="alternate" hreflang="en" href="{en}">\n'
            f'  <link rel="alternate" hreflang="ar" href="{ar}">\n'
            f'  <link rel="alternate" hreflang="x-default" href="{en}">')


def build():
    header = (SRC / "partials/header.html").read_text()
    footer = (SRC / "partials/footer.html").read_text()
    blocks = {
        "{{HOME_TRADES}}": home_trades(),
        "{{SERVICES_INDEX}}": services_index(),
        "{{SERVICES_SHEETS}}": services_sheets(),
    }
    (ROOT / "services-data.js").write_text(services_data_js())
    (ROOT / "ar").mkdir(exist_ok=True)
    for page, cfg in PAGES.items():
        body = (SRC / f"pages/{page}.html").read_text()
        for k, v in blocks.items():
            body = body.replace(k, v)
        h = header
        for p in PAGES:
            h = h.replace("{{CUR_%s}}" % p, ' aria-current="page"' if p == page else "")
        h = (h.replace("{{TITLE}}", e(cfg["title"]))
               .replace("{{DESCRIPTION}}", e(cfg["description"]))
               .replace("{{CANONICAL}}", cfg["canonical"])
               .replace("{{HEAD_EXTRA}}", cfg.get("head_extra", ""))
               .replace("{{PAGE}}", page))
        f = footer
        if cfg.get("no_cta"):
            f = re.sub(r'<section class="cta-band">.*?</section>\n\n', "", f, flags=re.S)
        tags = [SCRIPT_TAGS[s] for s in cfg.get("scripts", []) if s == "gsap"]
        tags += ['<script src="i18n.js"></script>', '<script src="services-data.js"></script>', '<script src="script.js"></script>']
        tags += [SCRIPT_TAGS[s] for s in cfg.get("scripts", []) if s != "gsap"]
        f = f.replace("{{SCRIPTS}}", "\n".join(tags))
        base = bust(root_assets(clean_links(h + body + f)))
        for lang in ("en", "ar"):
            out = base.replace("{{ALTERNATES}}", alternates(page, lang))
            if lang == "ar":
                # Arabic copies: same markup, rendered right-to-left from the first paint; script.js swaps the text.
                out = out.replace('<html lang="en" dir="ltr">', '<html lang="ar" dir="rtl">', 1)
            leftover = re.findall(r"\{\{[A-Z_a-z]+\}\}", out)
            assert not leftover, f"{page}: unreplaced {leftover}"
            dest = ROOT / ("ar" if lang == "ar" else "") / f"{page}.html"
            dest.write_text(out)
            print("built", dest.relative_to(ROOT))
    (ROOT / "services-data.js").write_text(services_data_js())
    print("built services-data.js")


if __name__ == "__main__":
    build()
