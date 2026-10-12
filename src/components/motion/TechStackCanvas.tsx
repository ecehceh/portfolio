'use client';

import { useEffect, useRef } from 'react';
import type { Tech } from '@/content/types';
import { createTechstackScene, type TechstackScene } from '@/lib/three/techstack-scene';

export function TechStackCanvas({ techs }: { techs: readonly Tech[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let scene: TechstackScene | null = null;
    let cancelled = false;
    // Wait for the web font so the ball labels are drawn with it.
    const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      if (cancelled) return;
      scene = createTechstackScene(canvas, techs, getComputedStyle(canvas).fontFamily);
    });
    return () => {
      cancelled = true;
      scene?.dispose();
    };
  }, [techs]);

  return (
    <canvas id="techstack-canvas" ref={canvasRef} role="img" aria-label="Interactive balls showing the technologies I use" />
  );
}
