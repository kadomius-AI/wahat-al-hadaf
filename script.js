(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  let lang = 'en';
  let activeSvc = 0;

  /* Language. English is the default; Arabic via the toggle or ?lang=ar */
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

    const btn = $('#langToggle');
    btn.textContent = ar ? 'English' : 'عربي';
    btn.lang = ar ? 'en' : 'ar';
    btn.setAttribute('aria-label', ar ? 'View the site in English' : 'عرض الموقع بالعربية');

    renderTabs();
    renderPanel();
    renderSelect();
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  $('#langToggle').addEventListener('click', () => {
    setLang(lang === 'en' ? 'ar' : 'en');
    const url = new URL(location.href);
    lang === 'ar' ? url.searchParams.set('lang', 'ar') : url.searchParams.delete('lang');
    history.replaceState(null, '', url);
  });

  /* Services explorer */
  const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  function renderTabs() {
    $('#svcTabs').innerHTML = SERVICES.map((s, i) => `
      <button class="tab" role="tab" id="tab-${s.id}" aria-selected="${i === activeSvc}" aria-controls="svcPanel" tabindex="${i === activeSvc ? 0 : -1}" data-i="${i}">
        <span class="tab__icon">${icon(s.icon)}</span>
        <span class="tab__text"><strong>${s[lang].name}</strong><small>${s[lang].short}</small></span>
      </button>`).join('');
  }

  function renderPanel() {
    const s = SERVICES[activeSvc];
    const t = s[lang];
    const ui = UI[lang];
    const panel = $('#svcPanel');
    panel.setAttribute('aria-labelledby', `tab-${s.id}`);
    panel.innerHTML = `
      <h3 class="panel__title">${t.name}</h3>
      <p class="panel__desc">${t.desc}</p>
      <h4 class="panel__label">${ui.included}</h4>
      <ul class="panel__list">${t.items.map((x) => `<li>${x}</li>`).join('')}</ul>
      <div class="panel__foot">
        <p class="panel__ideal"><span>${ui.ideal}</span> ${t.ideal.join(', ')}</p>
        <a href="#contact" class="btn" data-svc="${s.id}">${ui.quote}</a>
      </div>`;
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
    const vertical = matchMedia('(min-width: 1025px)').matches;
    const rtl = lang === 'ar';
    const next = vertical ? 'ArrowDown' : (rtl ? 'ArrowLeft' : 'ArrowRight');
    const prev = vertical ? 'ArrowUp' : (rtl ? 'ArrowRight' : 'ArrowLeft');
    if (e.key === next) { e.preventDefault(); selectSvc(activeSvc + 1, true); }
    if (e.key === prev) { e.preventDefault(); selectSvc(activeSvc - 1, true); }
  });
  $('#svcPanel').addEventListener('click', (e) => {
    const a = e.target.closest('[data-svc]');
    if (a) $('#serviceSelect').value = a.dataset.svc;
  });

  /* Quote form, sent through WhatsApp */
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
    const msg = [
      ui.waIntro,
      `${ui.waName}: ${d.name}`,
      `${ui.waPhone}: ${d.phone}`,
      `${ui.waService}: ${svc ? svc[lang].name : ui.other}`,
      d.details ? `${ui.waDetails}: ${d.details}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/971509015012?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  $$('[required]', form).forEach((f) => f.addEventListener('input', () => {
    f.classList.remove('is-invalid');
    f.removeAttribute('aria-invalid');
  }));

  /* Nav */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
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
      navMap.forEach((a) => a.removeAttribute('aria-current'));
      navMap.get(e.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  /* Share */
  $('#shareBtn').addEventListener('click', async () => {
    const toast = $('#shareToast');
    const data = { title: UI[lang].title, url: location.origin + location.pathname };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      toast.textContent = UI[lang].copied;
      setTimeout(() => (toast.textContent = ''), 3000);
    } catch { /* share sheet dismissed */ }
  });

  /* Init */
  $('#year').textContent = new Date().getFullYear();
  setLang(new URLSearchParams(location.search).get('lang') === 'ar' ? 'ar' : 'en');
})();
