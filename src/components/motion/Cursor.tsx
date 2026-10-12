'use client';

import { useEffect, useRef } from 'react';
import { hasFinePointer } from '@/lib/media';

/** How far the dot closes the gap to the pointer each frame (0–1). */
const FOLLOW_EASE = 0.18;

/** A blended dot that trails the mouse and grows over links and buttons. */
export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !hasFinePointer()) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let frameId = 0;

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      cursor.classList.add('is-visible');
    };
    const onOver = (event: PointerEvent) => {
      const isInteractive = event.target instanceof Element && Boolean(event.target.closest('a, button'));
      cursor.classList.toggle('is-hover', isInteractive);
    };
    const onLeave = () => cursor.classList.remove('is-visible');
    const follow = () => {
      current.x += (target.x - current.x) * FOLLOW_EASE;
      current.y += (target.y - current.y) * FOLLOW_EASE;
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      frameId = requestAnimationFrame(follow);
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerleave', onLeave);
    frameId = requestAnimationFrame(follow);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div className="cursor" ref={cursorRef} aria-hidden="true" />;
}
