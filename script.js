(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);

  let lang = 'en';

  /* Language. English by default; Arabic via the toggle or ?lang=ar, carried across pages. */
  $$('[data-i18n]').forEach((el) => { el.dataset.en = el.innerHTML; });

  function syncLinks() {
    $$('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!/^[a-z-]+\.html/.test(href)) return; // internal pages only
      const url = new URL(href, location.href);
      lang === 'ar' ? url.searchParams.set('lang', 'ar') : url.searchParams.delete('lang');
      a.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
    });
  }

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
    syncLinks();
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  $('#langToggle').addEventListener('click', () => {
    setLang(lang === 'en' ? 'ar' : 'en');
    const url = new URL(location.href);
    lang === 'ar' ? url.searchParams.set('lang', 'ar') : url.searchParams.delete('lang');
    history.replaceState(null, '', url);
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
      const data = { title: UI[lang].title, url: location.origin + '/' };
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
  setLang(params.get('lang') === 'ar' ? 'ar' : 'en');
})();
