'use client';

import Backdrop from '../Backdrop';
import CoverPlane from '../CoverPlane';
import SectionSet from '../SectionSet';
import { FRAMES, opt } from '@/lib/assets';
import { BACKDROP_FIT, BACKDROP_Z, backdropOpacity, stepOpacity } from '@/lib/journey';
import { getProgress } from '@/lib/scroll-progress';

/**
 * Section 04 — Technology.
 *
 * Four process steps, each with its own plate. The plates are stacked at
 * fractionally different depths and crossfaded against the pinned carousel's
 * step progress, so advancing a step changes the room the reader is standing
 * in rather than swapping a picture beside the text.
 */
const STEPS = [FRAMES.bagging, FRAMES.filling, FRAMES.palletising, FRAMES.labelling] as const;

export default function TechnologySet() {
  return (
    <SectionSet section="technology">
      <Backdrop section="technology" src={STEPS[0]} />

      {STEPS.slice(1).map((src, i) => {
        const index = i + 1;
        // techStep runs 0 -> 3 across the four steps.
        const z = BACKDROP_Z + 0.5 + i * 0.5;
        return (
          <CoverPlane
            key={src}
            url={opt(src)}
            z={z}
            fitDistance={BACKDROP_FIT + (BACKDROP_Z - z)}
            opacity={() =>
              stepOpacity(getProgress('techStep'), index, STEPS.length - 1) *
              backdropOpacity('technology')
            }
          />
        );
      })}
    </SectionSet>
  );
}
