/** Side-by-side layout; matches the 900px breakpoint in globals.css. */
export const DESKTOP_QUERY = '(min-width: 900px)';
/** Stacked phone/tablet layout. */
export const STACKED_QUERY = '(max-width: 899px)';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** True for a mouse or trackpad — the custom cursor is pointless on touch screens. */
export function hasFinePointer(): boolean {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}
