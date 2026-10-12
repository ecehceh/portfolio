import type { ReactNode } from 'react';

/** `canvas` is the interactive ball scene (a client component). */
export function TechStack({ canvas }: { canvas: ReactNode }) {
  return (
    <section className="techstack" id="techstack">
      <h2 className="techstack-title">My Techstack</h2>
      {canvas}
      <p className="techstack-hint">Move your cursor through the balls</p>
    </section>
  );
}
