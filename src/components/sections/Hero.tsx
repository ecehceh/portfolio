import type { ReactNode } from 'react';
import type { Portfolio } from '@/content/types';

type Props = Pick<Portfolio, 'firstName' | 'lastName' | 'heroKicker' | 'heroTitle'> & {
  /** The rotating word slot (a client component). */
  rotatingWord: ReactNode;
};

export function Hero({ firstName, lastName, heroKicker, heroTitle, rotatingWord }: Props) {
  return (
    <section className="hero" id="top">
      <div className="hero-left">
        <p className="hero-hello">Hello! I&apos;m</p>
        <h1 className="hero-name">
          <span>{firstName}</span>
          <span>{lastName}</span>
        </h1>
      </div>
      <div className="hero-right">
        <p className="hero-kicker">{heroKicker}</p>
        <div className="hero-words">{rotatingWord}</div>
        <p className="hero-word solid">{heroTitle}</p>
      </div>
    </section>
  );
}
