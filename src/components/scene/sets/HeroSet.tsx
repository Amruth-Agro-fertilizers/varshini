'use client';

import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Backdrop from '../Backdrop';
import Birds from '../Birds';
import HeadlineModel from '../HeadlineModel';
import PlantAnchor from '../PlantAnchor';
import SectionSet from '../SectionSet';
import { HERO_PLATE } from '@/lib/assets';
import { approach, getProgress } from '@/lib/scroll-progress';

/**
 * Section 01 — the opening shot.
 *
 * A top-down aerial, weather drifting across it, birds between the lens and the
 * ground, and the headline standing in the air above the plant as a modelled
 * object. The scroll drives all of it: the headline grows and turns as it comes
 * at the viewer, and the cloud closes over the whole thing on the way into the
 * building.
 */
export default function HeroSet() {
  const smoothed = useRef(0);

  useFrame((_, delta) => {
    // Damped so the headline's turn reads as momentum rather than tracking the
    // wheel notch for notch.
    smoothed.current = approach(smoothed.current, getProgress('hero'), 7, delta);
  });

  return (
    <SectionSet section="hero">
      {/* Hands over inside the cloud bank rather than wiping away. Bleed is kept
          tight so the opening frame is very nearly the whole photograph. */}
      <Backdrop section="hero" src={HERO_PLATE} bleed={1.1} exit="through" />

      {/* Tells the DOM where the works are, so the address card can point. */}
      <PlantAnchor />

      {/* Between the lens and the ground, so the shot reads as airborne. Given
          a boundary of its own so the rigged flock's download never holds the
          aerial itself off screen. */}
      <Suspense fallback={null}>
        <Birds />
      </Suspense>

      {/* Likewise: two and a bit megabytes should not gate the photograph. */}
      <Suspense fallback={null}>
        <HeadlineModel progress={() => smoothed.current} />
      </Suspense>
    </SectionSet>
  );
}
