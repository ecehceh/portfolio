'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/media';

const WORD_INTERVAL_S = 2.6;

/** The hero word that rolls through `words`, one every few seconds. */
export function RotatingWord({ words }: { words: readonly string[] }) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    (_context, contextSafe) => {
      const node = wordRef.current;
      if (!node || !contextSafe || words.length < 2 || prefersReducedMotion()) return;
      let current = 0;
      // contextSafe keeps the tweens created later (in callbacks) inside the
      // useGSAP context, so they are killed on unmount too.
      const swap = contextSafe(() => {
        // Each swap schedules the next one when it finishes, so swaps never overlap.
        gsap
          .timeline({ onComplete: () => gsap.delayedCall(WORD_INTERVAL_S, swap) })
          .to(node, { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power2.in' })
          .add(() => {
            current = (current + 1) % words.length;
            setIndex(current);
          })
          .fromTo(node, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 0.9, duration: 0.6, ease: 'power3.out' });
      });
      gsap.delayedCall(WORD_INTERVAL_S, swap);
    },
    { dependencies: [words] },
  );

  return (
    <span className="hero-word gradient" ref={wordRef}>
      {words[index]}
    </span>
  );
}
