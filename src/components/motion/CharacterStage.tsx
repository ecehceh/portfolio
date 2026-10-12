'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { DESKTOP_QUERY, prefersReducedMotion, STACKED_QUERY } from '@/lib/media';
import { playCharacterIntro, scrollCharacter } from '@/lib/motion/character-scenes';
import { createCharacterScene, createCharacterState } from '@/lib/three/character-scene';

/** The fixed, full-screen 3D avatar behind the hero and about sections. */
export function CharacterStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduceMotion = prefersReducedMotion();
    const state = createCharacterState(reduceMotion ? 1 : 0);
    const scene = createCharacterScene(canvas, state);
    if (!scene) {
      document.documentElement.classList.add('no-webgl');
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      scene.setPointer((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener('pointermove', onPointerMove);

    if (!reduceMotion) playCharacterIntro(state);
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_QUERY, () => scrollCharacter(state, true));
    mm.add(STACKED_QUERY, () => scrollCharacter(state, false));

    // useGSAP reverts the tweens itself; this tears down the rest.
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      scene.dispose();
    };
  });

  return <canvas id="character-canvas" ref={canvasRef} aria-hidden="true" />;
}
