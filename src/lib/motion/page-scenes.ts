/*
 * The page-level GSAP animations: the load-in, the scroll-scrubbed reveals and
 * the horizontally scrolling work section. They run inside a useGSAP context
 * (see PageMotion), which reverts every tween and ScrollTrigger on unmount.
 */
import { gsap } from '@/lib/gsap';

/** Added to <html> once the intro tweens own the hidden start state (see "Intro" in globals.css). */
export const MOTION_READY_CLASS = 'motion-ready';

/** Added to .work-track while it auto-scrolls (see "Work" in globals.css). */
const MARQUEE_CLASS = 'is-marquee';
/** How long one card takes to drift past; the loop's speed. */
const MARQUEE_SECONDS_PER_CARD = 7;
/** How quickly the drift eases to a stop, and back up to speed, on hover. */
const MARQUEE_PAUSE_SECONDS = 0.5;

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

/**
 * Desktop with reduced motion: instead of the auto-scrolling marquee, pins the
 * work section and scrolls the project cards sideways under the visitor's control.
 */
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

/** A copy of a card for the marquee loop: visible, but hidden from assistive tech and the tab order. */
function cloneCard(card: HTMLElement): HTMLElement {
  const clone = card.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  return clone;
}

/**
 * Desktop only: the project cards drift left on their own in an endless loop,
 * like a product showcase, and hold still while hovered or focused. Returns its
 * own cleanup, since the copies and listeners are not GSAP's to revert.
 */
export function autoScrollWork(): (() => void) | undefined {
  const track = document.querySelector<HTMLElement>('.work-track');
  const section = track?.parentElement;
  if (!track || !section) return undefined;
  const cards = gsap.utils.toArray<HTMLElement>('.work-card', track);
  // A second set of cards follows the first, so sliding by half the track lands on an identical frame.
  const clones = cards.map(cloneCard);
  track.append(...clones);
  track.classList.add(MARQUEE_CLASS);

  const loop = gsap.to(track, {
    xPercent: -50,
    duration: cards.length * MARQUEE_SECONDS_PER_CARD,
    ease: 'none',
    repeat: -1,
    // Only runs while the section is on screen.
    scrollTrigger: { trigger: section, toggleActions: 'play pause resume pause' },
  });
  gsap.from([...cards, ...clones], {
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    clearProps: 'transform',
    scrollTrigger: { trigger: section, start: 'top 70%' },
  });

  const easeSpeedTo = (timeScale: number) => () => {
    gsap.to(loop, { timeScale, duration: MARQUEE_PAUSE_SECONDS, overwrite: true });
  };
  const hold = easeSpeedTo(0);
  const release = easeSpeedTo(1);
  track.addEventListener('mouseenter', hold);
  track.addEventListener('mouseleave', release);
  track.addEventListener('focusin', hold);
  track.addEventListener('focusout', release);

  return () => {
    track.removeEventListener('mouseenter', hold);
    track.removeEventListener('mouseleave', release);
    track.removeEventListener('focusin', hold);
    track.removeEventListener('focusout', release);
    clones.forEach((clone) => clone.remove());
    track.classList.remove(MARQUEE_CLASS);
  };
}

/** Stacked layout: there is no carousel, so each card simply rises in as it is reached. */
export function revealWorkCardsStacked(): void {
  gsap.utils.toArray<HTMLElement>('.work-card').forEach(riseIn);
}

/** Ends just before the text draws level with the avatar, so it is fully lit by then. */
export function revealAboutWords(): void {
  gsap.fromTo('.about-text .w', { opacity: 0.12 }, {
    opacity: 1,
    stagger: 0.05,
    ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top 65%', end: 'center 60%', scrub: true },
  });
}

export function fillTimeline(): void {
  gsap.fromTo('.timeline-fill', { scaleY: 0 }, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 55%', scrub: true },
  });
}

function riseIn(node: HTMLElement): void {
  // clearProps hands the transform back to CSS afterwards (needed for the card hover lift).
  gsap.from(node, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    clearProps: 'transform',
    scrollTrigger: { trigger: node, start: 'top 88%' },
  });
}

export function revealOnScroll(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal], .timeline-item > *').forEach(riseIn);
}
