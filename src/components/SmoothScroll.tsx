'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setPageProgress } from '@/lib/scroll-progress';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth-scroll foundation.
 *
 * Lenis owns the scroll position; GSAP's ticker drives its RAF loop so the two
 * never run on separate clocks (which shows up as jitter on pinned sections).
 * ScrollTrigger is updated from Lenis rather than from native scroll events.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      // Native scrolling only; ScrollTrigger still drives the scene, just without easing.
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPageProgress(max > 0 ? window.scrollY / max : 0);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on('scroll', (e: { progress: number }) => {
      setPageProgress(e.progress);
      ScrollTrigger.update();
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links must go through Lenis. A native jump moves the page without
    // Lenis emitting, so ScrollTrigger never updates and the WebGL scene stays
    // frozen at whatever state it was in — the page and the scene disagree.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      const href = anchor?.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      // Resolve the destination ourselves and hand Lenis a plain offset —
      // passing the element leaves the resolution up to Lenis, which measures
      // against its own animated position and lands in the wrong place.
      const top = target.getBoundingClientRect().top + window.scrollY;
      lenis.scrollTo(top, { duration: 1.4 });
      history.replaceState(null, '', href);
    };
    document.addEventListener('click', onClick);

    // Safety net for scrolls Lenis does not originate at all — browser scroll
    // restoration, find-in-page, Home/End. Cheap, and it keeps the scene honest.
    const onNativeScroll = () => ScrollTrigger.update();
    window.addEventListener('scroll', onNativeScroll, { passive: true });

    // Lenis caches the document height and clamps scrolling to it, and
    // ScrollTrigger caches every trigger's start and end in pixels. This page
    // changes height constantly — images decoding, the catalogue filtering, an
    // accordion opening — and without this both caches go stale: the lower part
    // of the page becomes unreachable and every trigger fires at the wrong
    // place. One observer keeps them honest.
    let resizeFrame = 0;
    const remeasure = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener('load', remeasure);

    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      window.removeEventListener('load', remeasure);
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onNativeScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
