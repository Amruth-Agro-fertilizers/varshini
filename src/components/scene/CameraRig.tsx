'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { approach, clamp01, journeyTime, remap, smoothstep } from '@/lib/scroll-progress';
import { cameraZAt, setCameraTime } from '@/lib/journey';

const mix = THREE.MathUtils.lerp;

/**
 * The single camera for the whole page.
 *
 * Position is a pure function of how far the reader has scrolled — no section
 * reaches out and sets it, and nothing depends on event ordering. The camera
 * simply flies forward at a constant rate through the sets, which is what
 * makes the page read as one continuous shot rather than eight separate ones.
 *
 * The sway is deliberately slow and small. Camera movement that is obviously
 * animated reads as a gimmick; movement just past the threshold of notice
 * reads as a real camera on a real rig.
 */
export default function CameraRig() {
  const t = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const { camera, clock } = state;

    t.current = approach(t.current, journeyTime(), 6, delta);
    const time = t.current;
    // Publish the smoothed value so the sets fade in step with the camera.
    setCameraTime(time);

    // The opening section's approach to the gate is the plate's own (see
    // heroApproach), so the camera holds still for it — two things moving
    // toward the same point at once only fight each other, and the one that
    // can frame the gate without cropping the photograph should win. The
    // standing offset that frames every later section therefore eases in
    // afterwards, once the camera is inside the building.
    const framing = smoothstep(clamp01(remap(time, 1.0, 1.7, 0, 1)));
    const entranceX = framing * 3.2;
    const entranceY = framing * -1.1;

    // Hand-held float, on two incommensurate periods so it never visibly loops.
    // Pulled out for the gate run — a real operator stops breathing on the
    // sticks for the one shot that has to be straight, and at eighteen times
    // magnification a quarter-unit of bob is a lurch — then restored inside.
    const steady = 1 - clamp01(remap(time, 0.62, 0.95, 0, 1)) * clamp01(remap(time, 1.1, 1.6, 1, 0));
    const bob = Math.sin(clock.elapsedTime * 0.31) * 0.28 * steady;
    const drift = Math.cos(clock.elapsedTime * 0.21) * 0.42 * steady;

    // The idle swing belongs to the sections after the gate; starting it any
    // earlier would pull the camera back off the entrance it is aiming at.
    const swingAmount = clamp01(remap(time, 1.25, 1.9, 0, 1)) * 1.9;
    const swing = Math.sin(time * Math.PI) * swingAmount;

    pointer.current.x = approach(pointer.current.x, state.pointer.x, 2.5, delta);
    pointer.current.y = approach(pointer.current.y, state.pointer.y, 2.5, delta);
    const px = pointer.current.x * steady;
    const py = pointer.current.y * steady;

    camera.position.set(
      swing + drift + entranceX + px * 1.1,
      bob + entranceY + py * 0.7,
      cameraZAt(time),
    );

    // Held straight down the flight path through the approach, so the gate the
    // plate is centring stays centred. Past the hand-off the look leads the
    // turn again, which is what gives the later sections their hand-held feel.
    const lock = clamp01(remap(time, 1.05, 1.5, 1, 0));
    camera.lookAt(
      mix(swing * 0.35 + entranceX * 1.15 + px * 0.5, entranceX, lock),
      mix(bob * 0.3 + entranceY * 1.1, entranceY, lock),
      cameraZAt(time) - 45,
    );
  });

  return null;
}
