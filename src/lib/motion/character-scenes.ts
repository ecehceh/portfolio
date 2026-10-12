/*
 * GSAP animations of the avatar's shared state (see character-scene.ts): the
 * load-in rise and the scroll-scrubbed slide, turn and fade.
 */
import { gsap } from '@/lib/gsap';
import type { CharacterState } from '@/lib/three/character-scene';

/** On phones the avatar sits behind the about text, so it is dimmed there. */
const STACKED_ABOUT_FADE = 0.25;

export function playCharacterIntro(state: CharacterState): void {
  gsap.to(state, { intro: 1, duration: 1.6, ease: 'power3.out' });
}

export function scrollCharacter(state: CharacterState, isDesktop: boolean): void {
  if (isDesktop) {
    gsap.to(state, {
      xFrac: -0.24,
      turn: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: 1 },
    });
  }
  const aboutFade = isDesktop ? 1 : STACKED_ABOUT_FADE;
  if (!isDesktop) {
    gsap.fromTo(state, { fade: 1 }, {
      fade: aboutFade,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top 30%', scrub: true },
    });
  }
  gsap.fromTo(state, { fade: aboutFade }, {
    fade: 0,
    ease: 'none',
    immediateRender: false,
    scrollTrigger: { trigger: '.whatido', start: 'top 85%', end: 'top 35%', scrub: true },
  });
}
