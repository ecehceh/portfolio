import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { intersect, setMediaMatches } from '@/test/browser-stubs';
import { useAnchorScroll } from './useAnchorScroll';
import { useBodyClassWhileVisible } from './useBodyClassWhileVisible';
import { useScrolledPast } from './useScrolledPast';

function AnchorPage() {
  useAnchorScroll();
  return (
    <>
      <a href="#about">About</a>
      <a href="#missing">Missing</a>
      <a href="#">Top</a>
      <section id="about">About section</section>
    </>
  );
}

describe('useAnchorScroll', () => {
  it('smooth-scrolls to the linked section instead of jumping', () => {
    render(<AnchorPage />);
    const section = screen.getByText('About section');
    section.scrollIntoView = vi.fn();

    const click = fireEvent.click(screen.getByRole('link', { name: 'About' }));

    expect(click).toBe(false); // default prevented
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('jumps without animation when the visitor prefers reduced motion', () => {
    setMediaMatches(['(prefers-reduced-motion: reduce)']);
    render(<AnchorPage />);
    const section = screen.getByText('About section');
    section.scrollIntoView = vi.fn();

    fireEvent.click(screen.getByRole('link', { name: 'About' }));

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('leaves links alone when their target does not exist', () => {
    render(<AnchorPage />);
    expect(fireEvent.click(screen.getByRole('link', { name: 'Missing' }))).toBe(true);
    expect(fireEvent.click(screen.getByRole('link', { name: 'Top' }))).toBe(true);
  });
});

describe('useBodyClassWhileVisible', () => {
  afterEach(() => document.body.replaceChildren());

  it('toggles the body class as the target enters and leaves the viewport', () => {
    const target = document.createElement('section');
    target.id = 'contact';
    document.body.append(target);
    const { unmount } = renderHook(() => useBodyClassWhileVisible('contact', 'at-contact'));

    act(() => intersect(target, true));
    expect(document.body).toHaveClass('at-contact');
    act(() => intersect(target, false));
    expect(document.body).not.toHaveClass('at-contact');

    act(() => intersect(target, true));
    unmount();
    expect(document.body).not.toHaveClass('at-contact');
  });

  it('does nothing when the target is missing', () => {
    expect(() => renderHook(() => useBodyClassWhileVisible('nope', 'x'))).not.toThrow();
  });
});

describe('useScrolledPast', () => {
  afterEach(() => {
    window.scrollY = 0;
  });

  it('flips to true once the page scrolls past the offset', () => {
    const { result } = renderHook(() => useScrolledPast(24));
    expect(result.current).toBe(false);

    act(() => {
      window.scrollY = 100;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(true);
  });
});
