(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  let lang = 'en';
  let activeSvc = 0;

  /* ── Language ───────────────────────────── */
  // Remember the English markup once, so switching back is lossless.
  $$('[data-i18n]').forEach((el) => { el.dataset.en = el.innerHTML; });

  function setLang(next) {
    lang = next;
    const ar = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    document.title = UI[lang].title;

    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = ar && AR[key] ? AR[key] : el.dataset.en;
    });
    $$('[data-i18n-ph]').forEach((el) => {
      const key = el.dataset.i18nPh;
      el.placeholder = ar ? AR[key] : EN_PH[key];
    });
    $('#langToggle').setAttribute('aria-label', ar ? 'Switch to English' : 'التبديل إلى العربية');

    renderTicker();
    renderTabs();
    renderPanel();
    renderSelect();
    store.set('wah-lang', lang);
  }
  $('#langToggle').addEventListener('click', () => setLang(lang === 'en' ? 'ar' : 'en'));

  /* ── Ticker ─────────────────────────────── */
  function renderTicker() {
    const names = SERVICES.map((s) => s[lang].name);
    const row = names.map((n) => `<span>${n}</span><i>/</i>`).join('');
    $('#ticker').innerHTML = row + row;
  }

  /* ── Services explorer ──────────────────── */
  const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  function renderTabs() {
    $('#svcTabs').innerHTML = SERVICES.map((s, i) => `
      <button class="tab" role="tab" id="tab-${s.id}" aria-selected="${i === activeSvc}" aria-controls="svcPanel" tabindex="${i === activeSvc ? 0 : -1}" data-i="${i}">
        <span class="tab__num">0${i + 1}</span>
        <span class="tab__text"><strong>${s[lang].name}</strong><small>${s[lang].short}</small></span>
        <span class="tab__arrow" aria-hidden="true">→</span>
      </button>`).join('');
  }

  function renderPanel() {
    const s = SERVICES[activeSvc];
    const t = s[lang];
    const ui = UI[lang];
    const panel = $('#svcPanel');
    panel.setAttribute('aria-labelledby', `tab-${s.id}`);
    panel.innerHTML = `
      <div class="panel__head">
        <span class="panel__icon">${icon(s.icon)}</span>
        <span class="panel__num" dir="ltr">0${activeSvc + 1} / 06</span>
      </div>
      <h3 class="panel__title">${t.name}</h3>
      <p class="panel__desc">${t.desc}</p>
      <h4 class="panel__label">${ui.included}</h4>
      <ul class="panel__list">${t.items.map((x) => `<li>${x}</li>`).join('')}</ul>
      <div class="panel__foot">
        <div>
          <h4 class="panel__label">${ui.ideal}</h4>
          <ul class="chips">${t.ideal.map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
        <a href="#contact" class="btn" data-svc="${s.id}">${ui.quote} <i class="arr" aria-hidden="true">→</i></a>
      </div>`;
    panel.classList.remove('is-swap');
    void panel.offsetWidth; // restart the fade
    panel.classList.add('is-swap');
  }

  function selectSvc(i, focus) {
    activeSvc = (i + SERVICES.length) % SERVICES.length;
    $$('.tab').forEach((b, j) => {
      b.setAttribute('aria-selected', String(j === activeSvc));
      b.tabIndex = j === activeSvc ? 0 : -1;
    });
    renderPanel();
    if (focus) $$('.tab')[activeSvc].focus();
  }

  $('#svcTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (b) selectSvc(+b.dataset.i);
  });
  $('#svcTabs').addEventListener('keydown', (e) => {
    const vertical = matchMedia('(min-width: 900px)').matches;
    const rtl = lang === 'ar';
    const nextKeys = vertical ? ['ArrowDown'] : [rtl ? 'ArrowLeft' : 'ArrowRight'];
    const prevKeys = vertical ? ['ArrowUp'] : [rtl ? 'ArrowRight' : 'ArrowLeft'];
    if (nextKeys.includes(e.key)) { e.preventDefault(); selectSvc(activeSvc + 1, true); }
    if (prevKeys.includes(e.key)) { e.preventDefault(); selectSvc(activeSvc - 1, true); }
  });
  // "Get a quote for this" preselects the service in the form
  $('#svcPanel').addEventListener('click', (e) => {
    const a = e.target.closest('[data-svc]');
    if (a) $('#serviceSelect').value = a.dataset.svc;
  });

  /* ── Form ───────────────────────────────── */
  function renderSelect() {
    const sel = $('#serviceSelect');
    const current = sel.value;
    const ui = UI[lang];
    sel.innerHTML = `<option value="" disabled ${current ? '' : 'selected'}>${ui.choose}</option>` +
      SERVICES.map((s) => `<option value="${s.id}">${s[lang].name}</option>`).join('') +
      `<option value="other">${ui.other}</option>`;
    if (current) sel.value = current;
  }

  const form = $('#quoteForm');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let ok = true;
    $$('[required]', form).forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle('is-invalid', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) return;
    const d = Object.fromEntries(new FormData(form));
    const ui = UI[lang];
    const svc = SERVICES.find((s) => s.id === d.service);
    const msg = [
      ui.waIntro,
      `${ui.waName}: ${d.name}`,
      `${ui.waPhone}: ${d.phone}`,
      `${ui.waService}: ${svc ? svc[lang].name : ui.other}`,
      d.details ? `${ui.waDetails}: ${d.details}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/971509015012?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  $$('[required]', form).forEach((f) => f.addEventListener('input', () => f.classList.remove('is-invalid')));

  /* ── Nav ────────────────────────────────── */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('#navToggle');
  const links = $('#navLinks');
  const setMenu = (open) => { links.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  const navMap = new Map($$('a', links).map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove('is-active'));
      navMap.get(e.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  /* ── Reveal ─────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const sib = $$(':scope > .reveal', e.target.parentElement);
      e.target.style.transitionDelay = `${Math.min(Math.max(sib.indexOf(e.target), 0), 5) * 60}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ── Share ──────────────────────────────── */
  $('#shareBtn').addEventListener('click', async () => {
    const toast = $('#shareToast');
    const data = { title: UI[lang].title, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      toast.textContent = UI[lang].copied;
      setTimeout(() => (toast.textContent = ''), 3000);
    } catch { /* user cancelled */ }
  });

  /* ── Init ───────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();
  const params = new URLSearchParams(location.search);
  setLang(params.get('lang') === 'ar' || (!params.get('lang') && store.get('wah-lang') === 'ar') ? 'ar' : 'en');
})();
