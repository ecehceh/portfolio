import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { gsap } from '@/lib/gsap';
import { setMediaMatches } from '@/test/browser-stubs';
import { Nav } from '@/components/layout/Nav';
import { Cursor } from './Cursor';
import { PageMotion } from './PageMotion';
import { RotatingWord } from './RotatingWord';

describe('Cursor', () => {
  it('stays inert on touch screens', () => {
    const { container } = render(<Cursor />);
    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    expect(container.querySelector('.cursor')).not.toHaveClass('is-visible');
  });

  it('shows on mouse movement and grows over links', () => {
    setMediaMatches(['(hover: hover) and (pointer: fine)']);
    const { container } = render(
      <>
        <Cursor />
        <a href="#x">Link</a>
        <p>Text</p>
      </>,
    );
    const cursor = container.querySelector('.cursor');

    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    expect(cursor).toHaveClass('is-visible');

    fireEvent.pointerOver(screen.getByRole('link'));
    expect(cursor).toHaveClass('is-hover');
    fireEvent.pointerOver(screen.getByText('Text'));
    expect(cursor).not.toHaveClass('is-hover');

    fireEvent.pointerLeave(document);
    expect(cursor).not.toHaveClass('is-visible');
  });
});

/** Drives GSAP's clock by hand so timed animations run deterministically. */
function advanceGsap(seconds: number) {
  const start = gsap.globalTimeline.time();
  act(() => {
    for (let t = 0.25; t <= seconds; t += 0.25) gsap.updateRoot(start + t);
  });
}

describe('RotatingWord', () => {
  beforeEach(() => gsap.ticker.remove(gsap.updateRoot));
  afterEach(() => gsap.ticker.add(gsap.updateRoot));

  it('starts on the first word', () => {
    render(<RotatingWord words={['ONE', 'TWO']} />);
    expect(screen.getByText('ONE')).toHaveClass('hero-word', 'gradient');
  });

  it('keeps a single word still', () => {
    render(<RotatingWord words={['ONLY']} />);
    expect(screen.getByText('ONLY')).toBeInTheDocument();
  });

  it('does not animate when the visitor prefers reduced motion', () => {
    setMediaMatches(['(prefers-reduced-motion: reduce)']);
    render(<RotatingWord words={['ONE', 'TWO']} />);
    advanceGsap(10);
    expect(screen.getByText('ONE')).toBeInTheDocument();
  });

  it('rolls to the next word after the interval', () => {
    render(<RotatingWord words={['ONE', 'TWO']} />);
    advanceGsap(4);
    expect(screen.getByText('TWO')).toBeInTheDocument();
    advanceGsap(4);
    expect(screen.getByText('ONE')).toBeInTheDocument();
  });
});

describe('Nav', () => {
  afterEach(() => {
    window.scrollY = 0;
  });

  it('gets a solid backdrop once the page scrolls', () => {
    render(<Nav logo="Logo" email="me@example.com" />);
    const header = screen.getByRole('banner');
    expect(header).not.toHaveClass('is-scrolled');

    act(() => {
      window.scrollY = 200;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(header).toHaveClass('is-scrolled');
  });
});

describe('PageMotion', () => {
  it('takes over the hidden intro state from CSS, and hands it back on unmount', () => {
    const { unmount } = render(<PageMotion />);
    expect(document.documentElement).toHaveClass('motion-ready');
    unmount();
    expect(document.documentElement).not.toHaveClass('motion-ready');
  });

  it('skips the intro for visitors who prefer reduced motion', () => {
    setMediaMatches(['(prefers-reduced-motion: reduce)']);
    render(<PageMotion />);
    expect(document.documentElement).not.toHaveClass('motion-ready');
  });

  it('sets up the page animations without rendering anything', () => {
    setMediaMatches(['(min-width: 900px)']);
    const { container, unmount } = render(<PageMotion />);
    expect(container).toBeEmptyDOMElement();
    expect(() => unmount()).not.toThrow();
  });
});
