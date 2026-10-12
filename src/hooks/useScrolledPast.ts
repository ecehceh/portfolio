import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/** True once the page has scrolled more than `offset` pixels; false while prerendering. */
export function useScrolledPast(offset: number): boolean {
  return useSyncExternalStore(subscribe, () => window.scrollY > offset, () => false);
}
