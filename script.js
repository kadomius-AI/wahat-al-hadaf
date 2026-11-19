(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Nav: shadow on scroll + mobile toggle
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('#navToggle');
  const links = $('#navLinks');
  const setMenu = (open) => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Active section highlight
  const sections = $$('main section[id]');
  const navMap = new Map($$('a', links).map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove('is-active'));
      navMap.get(e.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  // Reveal on scroll (staggered within a parent)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const siblings = $$('.reveal', e.target.parentElement);
      e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 5) * 70}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  // Share button (brand awareness)
  const shareBtn = $('#shareBtn');
  const toast = $('#shareToast');
  shareBtn?.addEventListener('click', async () => {
    const data = {
      title: 'Wahat Al Hadaf — Technical Services, Dubai',
      text: 'Maintenance, pools, landscaping, paving, gypsum and kitchens — one trusted team in Dubai.',
      url: location.href,
    };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      toast.textContent = 'Link copied — thanks for sharing!';
    } catch {
      toast.textContent = '';
    }
    setTimeout(() => (toast.textContent = ''), 3000);
  });

  // Quote form → WhatsApp
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
    const msg = [
      'Hello Wahat Al Hadaf, I would like a quote.',
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      `Service: ${d.service}`,
      d.details ? `Details: ${d.details}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/971509015012?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  $$('[required]', form).forEach((f) => f.addEventListener('input', () => f.classList.remove('is-invalid')));
})();
