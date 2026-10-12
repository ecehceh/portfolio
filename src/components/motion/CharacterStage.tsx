'use client';

import { useEffect, useRef } from 'react';
import { createCharacterScene, createCharacterState } from '@/lib/three/character-scene';

/** The fixed, full-screen 3D avatar behind the hero and about sections. */
export function CharacterStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = createCharacterScene(canvas, createCharacterState(1));
    if (!scene) {
      document.documentElement.classList.add('no-webgl');
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      scene.setPointer((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      scene.dispose();
    };
  }, []);

  return <canvas id="character-canvas" ref={canvasRef} aria-hidden="true" />;
}
