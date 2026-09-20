'use client';

import { useCallback, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Backdrop from '../Backdrop';
import CoverPlane from '../CoverPlane';
import SectionSet from '../SectionSet';
import { FRAMES, opt } from '@/lib/assets';
import { BACKDROP_FIT, BACKDROP_Z, arrivalExposure, backdropOpacity } from '@/lib/journey';
import { clamp01, getProgress, remap } from '@/lib/scroll-progress';

/** The aerial sits just in front of the plate it uncovers. */
const AERIAL_Z = BACKDROP_Z + 2;
const AERIAL_FIT = BACKDROP_FIT - 2;

/**
 * Where the aerial starts lifting, and where it is clear of the frame.
 *
 * Held back until the section's own card has arrived, been read and gone. The
 * wipe used to open at 0.3, before the copy had even landed — so the plant the
 * card describes was already sliding off the top, with the shed showing in a
 * strip underneath it, by the time the reader got to the words.
 */
const WIPE_FROM = 0.46;
const WIPE_TO = 0.62;

/**
 * Section 02 — The Group.
 *
 * Two plates, one section. The camera comes out of the cloud onto the aerial
 * again — the same ground the opening shot was flying over, now held still with
 * the section's argument written across it — and then the aerial lifts away to
 * put the reader inside the building, where the two companies are introduced as
 * cards on the plant floor.
 *
 * The interior is the base plate rather than the arrival, even though it is
 * seen second. It is the one that has to still be there at the end to hand over
 * to white-label, so it takes the section's own exit; the aerial is the overlay
 * that clears off it. Staging it the other way would leave the interior
 * stranded on screen with nothing to move it.
 */
export default function GroupSet() {
  const edge = useRef<THREE.Mesh>(null);
  const [aerial, setAerial] = useState({ width: 60, height: 34 });

  const handleSize = useCallback((size: { width: number; height: number }) => setAerial(size), []);

  /** How far the aerial has travelled up out of frame. */
  const lift = () =>
    clamp01(remap(getProgress('group'), WIPE_FROM, WIPE_TO, 0, 1)) * aerial.height * 1.08;

  useFrame(() => {
    if (!edge.current) return;
    const p = getProgress('group');
    edge.current.position.y = lift() - aerial.height / 2;
    const material = edge.current.material as THREE.MeshBasicMaterial;
    // Only while the edge is actually crossing the frame.
    material.opacity =
      clamp01(remap(p, WIPE_FROM - 0.02, WIPE_FROM + 0.04, 0, 1)) *
      clamp01(remap(p, WIPE_TO - 0.06, WIPE_TO, 1, 0)) *
      0.85;
  });

  return (
    <SectionSet section="group">
      {/* The plant floor, uncovered by the wipe and held to the end of the
          section. Its own hand-off to white-label is the standard one. */}
      {/* Closes in on itself onto black — see Backdrop's `shrink`. */}
      <Backdrop section="group" src={FRAMES.interior} exit="shrink" />

      {/* The aerial the section opens on. Flares and settles as the camera
          comes through the cloud, then lifts away. */}
      <CoverPlane
        url={opt(FRAMES.topView)}
        z={AERIAL_Z}
        fitDistance={AERIAL_FIT}
        offsetY={lift}
        opacity={() => backdropOpacity('group')}
        exposure={() => arrivalExposure('group')}
        onSize={handleSize}
      />

      {/* The wipe's leading edge, so the move reads as deliberate rather than
          as the picture slipping. */}
      <mesh ref={edge} position={[0, 0, AERIAL_Z + 0.4]}>
        <planeGeometry args={[aerial.width, 0.12]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </SectionSet>
  );
}
