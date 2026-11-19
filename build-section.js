/* "From Blueprint to Reality": a pinned, scrubbed, reversible sequence.
   Drawing → Structure → Envelope → Handover, then headline + CTA.
   Requires gsap + ScrollTrigger (loaded from cdnjs in index.html). */
(() => {
  const root = document.querySelector('#build');
  if (!root || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const stage = root.querySelector('.build__stage');
  const camera = root.querySelector('.build__camera');
  const frames = gsap.utils.toArray('.build__frame', root);
  const scan = root.querySelector('.build__scan');
  const shade = root.querySelector('.build__shade');
  const steps = gsap.utils.toArray('.build__steps li', root);
  const bar = root.querySelector('.build__bar i');
  const endEls = gsap.utils.toArray('.build__end > *', root);

  // Preload every frame before the pin starts so no wipe reveals a blank.
  frames.forEach((img) => { img.loading = 'eager'; if (img.decode) img.decode().catch(() => {}); });

  const setStep = (i, p) => {
    steps.forEach((li, j) => li.classList.toggle('is-active', j === i));
    bar.style.setProperty('--p', p.toFixed(3));
  };

  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
      portrait: '(max-aspect-ratio: 1/1)',
    },
    (ctx) => {
      const { reduce, portrait } = ctx.conditions;

      if (reduce) {
        // Static: the finished building with its headline, no pin, no scrub.
        setStep(steps.length - 1, 1);
        return;
      }

      const hidden = 'inset(100% 0% 0% 0%)';
      const shown = 'inset(0% 0% 0% 0%)';
      gsap.set(frames.slice(1), { clipPath: hidden });
      gsap.set(shade, { autoAlpha: 0 });
      gsap.set(endEls, { autoAlpha: 0, y: 28 });
      setStep(0, 0);

      // 1 timeline unit per stage; 0.85 of each spent on the wipe.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * (portrait ? 2.8 : 3.6)),
          pin: stage,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const t = self.progress * tl.duration();
            const i = t < 0.6 ? 0 : t < 1.6 ? 1 : t < 2.6 ? 2 : 3;
            setStep(i, self.progress);
          },
        },
      });

      // Camera: a slow dolly out across the whole sequence for depth.
      tl.fromTo(camera, { scale: 1.16, yPercent: 2.5 }, { scale: 1, yPercent: 0, duration: 4 }, 0);

      // Blueprint lines settle in first.
      // (opacity over the ink background, not CSS filter: cheaper on a full-screen image)
      tl.fromTo(frames[0], { opacity: 0.4 }, { opacity: 1, duration: 0.5 }, 0);

      frames.slice(1).forEach((frame, k) => {
        const at = 0.2 + k; // 0.2, 1.2, 2.2
        tl.to(frame, { clipPath: shown, duration: 0.85, ease: 'power1.inOut' }, at)
          .fromTo(frame, { scale: 1.05 }, { scale: 1, duration: 1.2, ease: 'power1.out' }, at)
          // the outgoing frame drops back slightly: parallax between layers
          .to(frames[k], { scale: 0.985, duration: 0.85 }, at)
          .fromTo(scan, { top: '100%', autoAlpha: 1 }, { top: '0%', duration: 0.85, ease: 'power1.inOut', immediateRender: false }, at)
          .set(scan, { autoAlpha: 0 }, at + 0.85);
      });

      // Handover: headline and CTA.
      tl.to(shade, { autoAlpha: 1, duration: 0.5 }, 3.1)
        .to(endEls, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: 'power2.out' }, 3.3)
        .to({}, { duration: 0.35 }); // short hold before the pin releases

      return () => setStep(0, 0);
    }
  );

  // Text direction changes the layout; recompute pin positions.
  document.addEventListener('langchange', () => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
