'use client';

import { useCallback, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CoverPlane from './CoverPlane';
import {
  BACKDROP_FIT,
  BACKDROP_Z,
  arrivalExposure,
  backdropOpacity,
  expandOpacity,
  expandScale,
  handoverProgress,
  heroPlateOpacity,
  shrinkOpacity,
  shrinkScale,
} from '@/lib/journey';
import type { SectionKey } from '@/lib/scroll-progress';
import { opt } from '@/lib/assets';

/**
 * A section's full-frame backdrop plate.
 *
 * Two ways out, because the page has two kinds of hand-off.
 *
 * `wipe` (the default) is for cuts between rooms the camera has no path
 * between. The outgoing plate stays fully opaque and travels up out of frame,
 * uncovering the next plate, which has already reached full opacity while
 * hidden behind it. Fading between two photographs cannot avoid both failure
 * modes — hold them each half-transparent and the page washes out to blank
 * white, fade them in step and two factory interiors show through one another.
 * Moving an opaque plate has neither problem, and it carries the forward motion
 * of the flight.
 *
 * `through` is for the one hand-off that is a path rather than a cut. The plate
 * does not move at all: the camera flies into cloud, the fog that comes with it
 * takes the plate to white at forty units out, and the plate is simply switched
 * off behind that. See Clouds, and cloudFogDensity in lib/journey.
 *
 * `slide` is the same opaque uncovering as `wipe`, turned on its side.
 *
 * `shrink` closes the plate in on itself onto black and lets the next one open
 * out of the middle — the one hand-off with a gap in it. See shrinkScale and
 * expandScale in lib/journey; the pairing matters, because a shrinking plate
 * and an arriving plate have to be scheduled in the opposite order to a wipe's.
 */
export default function Backdrop({
  section,
  src,
  tint = '#ffffff',
  z = BACKDROP_Z,
  bleed,
  exit = 'wipe',
  entry = 'cut',
}: {
  section: SectionKey;
  src: string;
  tint?: string;
  z?: number;
  /** Oversize, for plates the camera pans across. */
  bleed?: number;
  /** How the plate leaves. See above. */
  exit?: 'wipe' | 'through' | 'slide' | 'shrink';
  /** `adjust` lifts the plate's exposure and settles it, for a room entered
   *  from sunlight. `expand` opens it out of the middle, and is the other half
   *  of a `shrink` on the section before. */
  entry?: 'cut' | 'adjust' | 'expand';
}) {
  const [height, setHeight] = useState(40);
  const [width, setWidth] = useState(60);
  const edge = useRef<THREE.Mesh>(null);

  const handleSize = useCallback((size: { width: number; height: number }) => {
    setHeight(size.height);
    setWidth(size.width);
  }, []);

  const pushes = exit === 'through';
  const slides = exit === 'slide';
  const shrinks = exit === 'shrink';
  const expands = entry === 'expand';

  /** How far the plate has travelled up out of frame. */
  const lift = () =>
    pushes || slides || shrinks ? 0 : handoverProgress(section) * height * 1.12;

  /** How far it has travelled left out of frame, for a sideways hand-off. */
  const shift = () => (slides ? -handoverProgress(section) * width * 1.04 : 0);

  useFrame(() => {
    if (!edge.current) return;
    // A pushed-through plate has no leading edge: there is no seam to explain,
    // because nothing is uncovered — the frame goes through the picture.
    // Neither a shrink nor a push-through uncovers along an edge, so neither
    // has a seam to explain.
    const travel = pushes || shrinks ? 0 : handoverProgress(section);
    // One unit quad, scaled to whichever edge is doing the uncovering: a rule
    // across the bottom of a rising plate, or up the trailing side of one
    // travelling left.
    if (slides) {
      edge.current.position.set(shift() + width / 2, 0, 0);
      edge.current.scale.set(0.12, height, 1);
    } else {
      edge.current.position.set(0, lift() - height / 2, 0);
      edge.current.scale.set(width, 0.09, 1);
    }
    const material = edge.current.material as THREE.MeshBasicMaterial;
    // Only while the edge is actually crossing the frame.
    material.opacity = travel > 0.02 && travel < 0.96 ? 0.85 : 0;
  });

  return (
    <group>
      <CoverPlane
        url={opt(src)}
        z={z}
        fitDistance={BACKDROP_FIT + (BACKDROP_Z - z)}
        tint={tint}
        bleed={bleed}
        offsetX={shift}
        offsetY={lift}
        scale={
          shrinks
            ? () => shrinkScale(section)
            : expands
              ? () => expandScale(section)
              : undefined
        }
        opacity={
          pushes
            ? heroPlateOpacity
            : shrinks
              ? () => shrinkOpacity(section)
              : expands
                ? () => expandOpacity(section)
                : () => backdropOpacity(section)
        }
        exposure={entry === 'adjust' ? () => arrivalExposure(section) : undefined}
        onSize={handleSize}
      />

      {/* The wipe's leading edge, so the move reads as deliberate rather than
          as the picture slipping. */}
      <mesh ref={edge} position={[0, 0, z + 0.3]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
