(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);

  let lang = 'en';

  /* Language lives in the address: /services is English, /ar/services is Arabic.
     Page links are relative, so they stay in whichever language the address is in. */
  $$('[data-i18n]').forEach((el) => { el.dataset.en = el.innerHTML; });

  const AR_PATH = /^\/ar(\/|$)/;
  const cleanPath = (p) => p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  const pathFor = (target) => {
    const p = cleanPath(location.pathname).replace(AR_PATH, '/');
    return target === 'ar' ? '/ar' + p : p;
  };
  const go = (target) => {
    const url = new URL(location.href);
    url.pathname = pathFor(target);
    url.searchParams.delete('lang');
    history.replaceState(null, '', url);
  };

  function setLang(next) {
    lang = next;
    const ar = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    if (!document.body.dataset.titleEn) document.body.dataset.titleEn = document.title;
    document.title = ar ? `${AR['title.' + document.body.dataset.page] || UI.ar.title}` : document.body.dataset.titleEn;

    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = ar && AR[key] ? AR[key] : el.dataset.en;
    });
    $$('[data-i18n-ph]').forEach((el) => {
      const key = el.dataset.i18nPh;
      el.placeholder = ar ? AR[key] : EN_PH[key];
    });

    const btn = $('#langToggle');
    btn.textContent = ar ? 'English' : 'عربي';
    btn.lang = ar ? 'en' : 'ar';
    btn.setAttribute('aria-label', ar ? 'View the site in English' : 'عرض الموقع بالعربية');

    renderSelect();
    labelTable();
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  $('#langToggle').addEventListener('click', () => {
    const next = lang === 'en' ? 'ar' : 'en';
    go(next);
    setLang(next);
  });

  /* Plans comparison: each cell carries its column name, so phones can show rows as stacked lists */
  function labelTable() {
    $$('.cmp table').forEach((t) => {
      const heads = $$('thead th', t).map((th) => th.textContent.trim());
      $$('tbody tr', t).forEach((tr) => $$('td', tr).forEach((td, i) => { td.dataset.label = heads[i + 1] || ''; }));
    });
  }

  /* Quote form (contact page), sent through WhatsApp */
  const form = $('#quoteForm');
  const sel = $('#serviceSelect');

  function renderSelect() {
    if (!sel) return;
    const current = sel.value || params.get('service') || '';
    const ui = UI[lang];
    sel.innerHTML = `<option value="" disabled>${ui.choose}</option>` +
      SERVICES.map((s) => `<option value="${s.id}">${s[lang]}</option>`).join('') +
      `<option value="other">${ui.other}</option>`;
    sel.value = current;
    if (!sel.value) sel.selectedIndex = 0;
  }

  if (form) {
    const plan = $('#planSelect');
    if (plan && params.get('plan')) plan.value = params.get('plan');
    const formError = $('#formError');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let first = null;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim();
        f.classList.toggle('is-invalid', bad);
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !first) first = f;
      });
      formError.hidden = !first;
      if (first) { first.focus(); return; }
      const d = Object.fromEntries(new FormData(form));
      const ui = UI[lang];
      const svc = SERVICES.find((s) => s.id === d.service);
      const planText = plan && plan.value ? plan.options[plan.selectedIndex].textContent : '';
      const msg = [
        ui.waIntro,
        `${ui.waName}: ${d.name}`,
        `${ui.waPhone}: ${d.phone}`,
        `${ui.waService}: ${svc ? svc[lang] : ui.other}`,
        planText ? `${ui.waPlan}: ${planText}` : '',
        d.details ? `${ui.waDetails}: ${d.details}` : '',
      ].filter(Boolean).join('\n');
      window.open(`https://wa.me/971509015012?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
    $$('[required]', form).forEach((f) => f.addEventListener('input', () => {
      f.classList.remove('is-invalid');
      f.removeAttribute('aria-invalid');
    }));
  }

  /* Services page: highlight the sheet in view in the register */
  const reg = $$('.register a');
  if (reg.length) {
    const map = new Map(reg.map((a) => [a.getAttribute('href').split('#')[1], a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        reg.forEach((a) => a.classList.remove('is-current'));
        map.get(e.target.id)?.classList.add('is-current');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.sheet[id]').forEach((s) => spy.observe(s));
  }

  /* Nav */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  const setMenu = (open) => { links.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Share (about page) */
  const shareBtn = $('#shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const toast = $('#shareToast');
      const data = { title: UI[lang].title, url: location.origin + (lang === 'ar' ? '/ar/' : '/') };
      try {
        if (navigator.share) { await navigator.share(data); return; }
        await navigator.clipboard.writeText(data.url);
        toast.textContent = UI[lang].copied;
        setTimeout(() => (toast.textContent = ''), 3000);
      } catch { /* share sheet dismissed */ }
    });
  }

  /* Init */
  $('#year').textContent = new Date().getFullYear();
  // Old links (?lang=ar, index.html, *.html) are tidied into the clean address on arrival.
  const start = AR_PATH.test(location.pathname) || params.get('lang') === 'ar' ? 'ar' : 'en';
  if (start !== (AR_PATH.test(location.pathname) ? 'ar' : 'en') || params.has('lang') || /\.html$/.test(location.pathname)) go(start);
  setLang(start);
})();
