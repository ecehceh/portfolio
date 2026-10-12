import { useEffect } from 'react';

/** Adds `className` to <body> while the element with id `targetId` is on screen. */
export function useBodyClassWhileVisible(targetId: string, className: string, rootMargin = '0px'): void {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle(className, Boolean(entry?.isIntersecting)),
      { rootMargin },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      document.body.classList.remove(className);
    };
  }, [targetId, className, rootMargin]);
}
