import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/media';

/**
 * Smooth-scrolls in-page `#links`. Done in JS because CSS `scroll-behavior: smooth`
 * breaks GSAP ScrollTrigger's measurements.
 */
export function useAnchorScroll(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      const hash = link?.getAttribute('href');
      const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
