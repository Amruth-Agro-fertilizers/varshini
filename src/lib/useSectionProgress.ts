'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setProgress, type SectionKey } from './scroll-progress';

gsap.registerPlugin(ScrollTrigger);

/**
 * Publishes a section's scroll progress for the camera to fly against.
 *
 * Every section must use this same start/end pair. The camera's position is
 * the sum of these values, so if one section measured its progress over a
 * different span the sum would jump at that boundary and the flight would
 * visibly stutter there.
 */
export function useSectionProgress(ref: RefObject<HTMLElement | null>, key: SectionKey) {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => setProgress(key, self.progress),
    });
    // Seed it, so a reload part-way down the page starts from the truth.
    setProgress(key, trigger.progress);
    return () => trigger.kill();
  }, [ref, key]);
}
