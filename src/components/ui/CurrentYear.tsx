'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const currentYear = () => new Date().getFullYear();

/**
 * The page is prerendered at build time, so the server passes in the build year
 * for hydration and the visitor's current year takes over right after.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(subscribe, currentYear, () => buildYear);
  return <span>{year}</span>;
}
