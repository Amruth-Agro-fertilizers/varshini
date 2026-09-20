'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades `[data-reveal]` descendants up as they enter.
 *
 * Deliberately a one-shot entrance rather than a scrubbed tween: the camera
 * already moves continuously with the scroll, and copy that also tracked the
 * scroll would leave nothing on screen holding still enough to read.
 *
 * Written as set + to + `once`, never `gsap.from`. A `from` tween re-applies
 * its start state on every ScrollTrigger.refresh(), and this page refreshes
 * whenever its height changes — which left whole sections stuck at opacity 0
 * after their entrance had already played.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.set(el, { opacity: 0, y: 34 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
    }, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, ...deps]);
}
