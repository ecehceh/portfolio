'use client';

import { useAnchorScroll } from '@/hooks/useAnchorScroll';
import { useBodyClassWhileVisible } from '@/hooks/useBodyClassWhileVisible';
import { gsap, useGSAP } from '@/lib/gsap';
import { DESKTOP_QUERY, prefersReducedMotion } from '@/lib/media';
import {
  fillTimeline,
  playIntro,
  resetIntro,
  revealAboutWords,
  revealOnScroll,
  scrollWorkSideways,
} from '@/lib/motion/page-scenes';

/**
 * Runs the page-wide animations over the server-rendered sections. Render it
 * after <main> so its ScrollTriggers are created in page order, after the
 * avatar's ones.
 */
export function PageMotion() {
  useAnchorScroll();
  // The floating socials + resume link step aside in the contact section, which lists them anyway.
  useBodyClassWhileVisible('contact', 'at-contact', '0px 0px -25% 0px');

  useGSAP(() => {
    if (!prefersReducedMotion()) playIntro();
    gsap.matchMedia().add(DESKTOP_QUERY, scrollWorkSideways);
    revealAboutWords();
    fillTimeline();
    revealOnScroll();
    return resetIntro;
  });

  return null;
}
