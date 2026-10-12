import type { CSSProperties } from 'react';

/** Typed helper for CSS custom properties in `style`, e.g. cssVars({ '--row': 2 }). */
export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return Object.fromEntries(Object.entries(vars).map(([key, value]) => [key, String(value)])) as CSSProperties;
}
