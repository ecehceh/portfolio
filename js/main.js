/* Wires everything together: content, cursor, 3D scenes and scroll animations. */
(function () {
  'use strict';

  const data = window.PORTFOLIO;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const hasThree = Boolean(window.THREE);
  const WORD_INTERVAL_MS = 2600;
  const NAV_SOLID_AFTER_PX = 24;

  // Shared with character.js. `intro` is driven by the load animation and
  // everything else by scroll, so the two never fight over the same value.
  const characterState = { xFrac: 0, y: -0.35, turn: 0, fade: 1, intro: reduceMotion || !hasGsap ? 1 : 0 };

  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cursor = document.querySelector('.cursor');
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };

    window.addEventListener('pointermove', (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      cursor.classList.add('is-visible');
    });
    document.addEventListener('pointerover', (e) => {
      cursor.classList.toggle('is-hover', Boolean(e.target.closest('a, button')));
    });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

    (function follow() {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
  }

  function initCharacter() {
    const scene = hasThree
      ? window.Portfolio.createCharacterScene(document.getElementById('character-canvas'), characterState)
      : null;
    if (!scene) {
      document.documentElement.classList.add('no-webgl');
      return;
    }
    window.addEventListener('pointermove', (e) => {
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    });
  }

  function initRotatingWord(words) {
    const node = document.getElementById('rotating-word');
    if (words.length < 2 || reduceMotion) return;
    let index = 0;
    const nextWord = () => {
      index = (index + 1) % words.length;
      return words[index];
    };
    if (!hasGsap) {
      setInterval(() => { node.textContent = nextWord(); }, WORD_INTERVAL_MS);
      return;
    }
    // Each swap schedules the next one when it finishes, so swaps never overlap.
    const swap = () => {
      gsap.timeline({ onComplete: () => gsap.delayedCall(WORD_INTERVAL_MS / 1000, swap) })
        .to(node, { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power2.in' })
        .add(() => { node.textContent = nextWord(); })
        .fromTo(node, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 0.9, duration: 0.6, ease: 'power3.out' });
    };
    gsap.delayedCall(WORD_INTERVAL_MS / 1000, swap);
  }

  function initIntro() {
    gsap.from('.hero-hello, .hero-name span, .hero-kicker, .hero-words, .hero-word.solid', {
      y: 50,
      opacity: 0,
      duration: 1.1,
      stagger: 0.08,
      ease: 'power3.out',
      delay: 0.2,
    });
    // clearProps hands opacity back to CSS afterwards (needed for the contact-section fade).
    gsap.from('.nav, .socials a, .resume', {
      opacity: 0, y: -12, duration: 0.8, stagger: 0.05, delay: 0.6, clearProps: 'opacity,transform',
    });
    gsap.to(characterState, { intro: 1, duration: 1.6, ease: 'power3.out' });
  }

  function initCharacterScroll(isDesktop) {
    if (isDesktop) {
      gsap.to(characterState, {
        xFrac: -0.24,
        turn: 0.35,
        ease: 'none',
        scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: 1 },
      });
    }
    // On phones the avatar sits behind the about text, so dim it there.
    const aboutFade = isDesktop ? 1 : 0.25;
    if (!isDesktop) {
      gsap.fromTo(characterState, { fade: 1 }, {
        fade: aboutFade,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top 30%', scrub: true },
      });
    }
    gsap.fromTo(characterState, { fade: aboutFade }, {
      fade: 0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '.whatido', start: 'top 85%', end: 'top 35%', scrub: true },
    });
  }

  function initWorkScroll() {
    const track = document.getElementById('work-track');
    const distance = () => {
      const style = getComputedStyle(track.parentElement);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return Math.max(0, track.scrollWidth - document.documentElement.clientWidth + padding);
    };
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.work',
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  function initScrollScenes() {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduceMotion) initIntro();

    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      initCharacterScroll(true);
      initWorkScroll();
    });
    mm.add('(max-width: 899px)', () => initCharacterScroll(false));

    gsap.fromTo('.about-text .w', { opacity: 0.12 }, {
      opacity: 1,
      stagger: 0.05,
      ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top 65%', end: 'center 45%', scrub: true },
    });

    gsap.fromTo('.timeline-fill', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 55%', scrub: true },
    });

    gsap.utils.toArray('[data-reveal], .timeline-item > *').forEach((node) => {
      gsap.from(node, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 88%' },
      });
    });
  }

  function initTechstack(techs) {
    if (!hasThree) return;
    const canvas = document.getElementById('techstack-canvas');
    // Wait for the web font so the ball labels use it.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => window.Portfolio.createTechstack(canvas, techs));
  }

  /** Smooth-scroll in-page links (done in JS because CSS smooth scrolling breaks ScrollTrigger). */
  function initAnchorLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      const target = link && document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /** Hide the floating socials/resume while the contact section is on screen. */
  function initContactWatch() {
    const contact = document.getElementById('contact');
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('at-contact', entry.isIntersecting);
    }, { rootMargin: '0px 0px -25% 0px' }).observe(contact);
  }

  function initNavBackdrop() {
    const nav = document.querySelector('.nav');
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > NAV_SOLID_AFTER_PX);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  window.Portfolio.render(data);
  initNavBackdrop();
  initAnchorLinks();
  initContactWatch();
  initCursor();
  initCharacter();
  initRotatingWord(data.heroWords);
  if (hasGsap) initScrollScenes();
  initTechstack(data.techstack);
})();
