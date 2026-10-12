/*
 * The page-level GSAP animations: the load-in, the scroll-scrubbed reveals and
 * the horizontally scrolling work section. They run inside a useGSAP context
 * (see PageMotion), which reverts every tween and ScrollTrigger on unmount.
 */
import { gsap } from '@/lib/gsap';

/** Added to <html> once the intro tweens own the hidden start state (see "Intro" in globals.css). */
export const MOTION_READY_CLASS = 'motion-ready';

/**
 * fromTo rather than from: until the intro starts, CSS keeps these hidden so the
 * prerendered page doesn't flash, so their current opacity is not the end value.
 */
export function playIntro(): void {
  gsap.fromTo('.hero-hello, .hero-name span, .hero-kicker, .hero-words, .hero-word.solid', { y: 50, opacity: 0 }, {
    y: 0,
    opacity: 1,
    duration: 1.1,
    stagger: 0.08,
    ease: 'power3.out',
    delay: 0.2,
  });
  // clearProps hands opacity back to CSS afterwards (needed for the contact-section fade).
  gsap.fromTo('.nav, .socials a, .resume', { opacity: 0, y: -12 }, {
    opacity: 1, y: 0, duration: 0.8, stagger: 0.05, delay: 0.6, clearProps: 'opacity,transform',
  });
  // The tweens above now hold the hidden start state inline, so CSS can let go.
  document.documentElement.classList.add(MOTION_READY_CLASS);
}

export function resetIntro(): void {
  document.documentElement.classList.remove(MOTION_READY_CLASS);
}

/** Desktop only: pins the work section and scrolls the project cards sideways. */
export function scrollWorkSideways(): void {
  const track = document.querySelector<HTMLElement>('.work-track');
  const section = track?.parentElement;
  if (!track || !section) return;
  const distance = () => {
    const style = getComputedStyle(section);
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

export function revealAboutWords(): void {
  gsap.fromTo('.about-text .w', { opacity: 0.12 }, {
    opacity: 1,
    stagger: 0.05,
    ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top 65%', end: 'center 45%', scrub: true },
  });
}

export function fillTimeline(): void {
  gsap.fromTo('.timeline-fill', { scaleY: 0 }, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 55%', scrub: true },
  });
}

export function revealOnScroll(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal], .timeline-item > *').forEach((node) => {
    gsap.from(node, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: node, start: 'top 88%' },
    });
  });
}
