'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Conveyor from './Conveyor';
import { MACHINE, setMachineOpacity } from './materials';
import { getCameraTime, sectionIndex, sectionOrigin } from '@/lib/journey';
import { clamp01, getProgress, remap, smoothstep } from '@/lib/scroll-progress';

/**
 * Section 03 — the bagging and packing line.
 *
 * A working run of line rather than an effect over the top of one: bags arrive
 * empty on the belt, stop under the hopper and fill, move on to the sealing
 * gantry where the head comes down on them, and carry on down the line packed.
 * The camera flies along its length as the section scrolls, so the reader
 * follows the product through the process the copy is describing.
 *
 * The line is driven by scroll, not by a clock. Scrolling advances the belt, so
 * the machine is doing the reading's work; a slow idle creep underneath keeps
 * it alive when the page is still.
 */

/**
 * Line geometry, all relative to the section origin.
 *
 * Set off the camera's path and below eye line: the camera flies straight down
 * the slab, so a line any closer is passed through rather than looked at, and
 * all the reader gets is beams sweeping over the lens. Any further out and it
 * leaves frame entirely on a tall viewport, where the horizontal field is
 * narrowest.
 */
const LINE_X = 6.2;
const BELT_Y = -3.2;
const LINE_START = 26;
const LINE_END = -46;
const FILL_Z = -4;
const SEAL_Z = -17;

const BAG_COUNT = 9;
/** Spacing between bags along the belt. */
const PITCH = (LINE_START - LINE_END) / BAG_COUNT;

type BagRef = { group: THREE.Group | null; body: THREE.Mesh | null };

export default function BaggingLine() {
  const root = useRef<THREE.Group>(null);
  const bags = useRef<BagRef[]>(Array.from({ length: BAG_COUNT }, () => ({ group: null, body: null })));
  const sealHead = useRef<THREE.Mesh>(null);
  const spoutFlow = useRef<THREE.Mesh>(null);

  const origin = useMemo(() => sectionOrigin('technology'), []);

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;

    // Present across its own section and the approach to it, gone by the next.
    //
    // Gated on the camera's position along the flight, not on this section's
    // own progress. A section's progress is clamped at 0 until it reaches the
    // top of the viewport, so a window that opened before 0 never opened — it
    // just held a fraction of itself permanently, and the whole line drew as a
    // faint grid of rails and legs over every section above this one.
    const camera = getCameraTime();
    const i = sectionIndex('technology');
    const presence =
      clamp01(remap(camera, i - 0.45, i - 0.12, 0, 1)) * clamp01(remap(camera, i + 0.9, i + 1, 1, 0));
    const t = getProgress('technology');

    group.visible = presence > 0.01;
    if (!group.visible) return;
    setMachineOpacity(presence);

    // Belt travel: scroll drives it, with a slow creep so the line is never
    // frozen while the reader is still.
    const travel = t * (LINE_START - LINE_END) * 1.35 + state.clock.elapsedTime * 0.55;

    let sealDemand = 0;

    for (let i = 0; i < BAG_COUNT; i += 1) {
      const bag = bags.current[i];
      if (!bag.group || !bag.body) continue;

      // Each bag runs the same loop, offset by its place in the queue.
      const raw = (i * PITCH + travel) % (LINE_START - LINE_END);
      const z = LINE_START - raw;
      bag.group.position.z = z;

      // Fill: empty until the hopper, then swells to full just past it.
      const fill = smoothstep(clamp01(remap(z, FILL_Z + 2.4, FILL_Z - 2.4, 0, 1)));
      const fullness = 0.22 + fill * 0.78;
      bag.body.scale.set(0.82 + fill * 0.18, fullness, 0.82 + fill * 0.18);
      bag.body.position.y = (fullness * 1.15) / 2;

      // Settle: a packed bag rides slightly lower and squarer.
      const sealed = clamp01(remap(z, SEAL_Z + 1.2, SEAL_Z - 1.6, 0, 1));
      bag.body.material = sealed > 0.5 ? MACHINE.sackSealed : MACHINE.sack;

      // The head comes down for whichever bag is under it.
      const nearSeal = clamp01(1 - Math.abs(z - SEAL_Z) / 2.6);
      sealDemand = Math.max(sealDemand, nearSeal);
    }

    if (sealHead.current) {
      // Ride down onto the bag and lift away again.
      const target = BELT_Y + 1.95 - sealDemand * 0.85;
      sealHead.current.position.y += (target - sealHead.current.position.y) * Math.min(1, delta * 9);
    }

    if (spoutFlow.current) {
      // Product only runs while a bag is under the spout.
      let flow = 0;
      for (let i = 0; i < BAG_COUNT; i += 1) {
        const bag = bags.current[i];
        if (!bag.group) continue;
        flow = Math.max(flow, clamp01(1 - Math.abs(bag.group.position.z - FILL_Z) / 2.2));
      }
      spoutFlow.current.scale.y = 0.2 + flow * 0.8;
      spoutFlow.current.position.y = BELT_Y + 1.5 - (0.2 + flow * 0.8) * 0.6;
      (spoutFlow.current.material as THREE.MeshStandardMaterial).opacity = flow * presence * 0.9;
    }
  });

  return (
    <group ref={root} position={[LINE_X, 0, origin]}>
      <Conveyor from={LINE_START} to={LINE_END} height={BELT_Y} />

      {/* Filling station: hopper, outlet and the product falling from it */}
      <group position={[0, 0, FILL_Z]}>
        <mesh position={[0, BELT_Y + 4.2, 0]} material={MACHINE.steel}>
          <cylinderGeometry args={[1.85, 0.45, 2.5, 20, 1, true]} />
        </mesh>
        <mesh position={[0, BELT_Y + 5.6, 0]} material={MACHINE.steelDark}>
          <cylinderGeometry args={[1.9, 1.9, 0.3, 20]} />
        </mesh>
        <mesh position={[0, BELT_Y + 2.5, 0]} material={MACHINE.steelDark}>
          <cylinderGeometry args={[0.38, 0.38, 1.1, 14]} />
        </mesh>

        {/* The stream of product itself */}
        <mesh ref={spoutFlow} position={[0, BELT_Y + 1.2, 0]} material={MACHINE.caution}>
          <cylinderGeometry args={[0.3, 0.34, 1.2, 12]} />
        </mesh>

        {/* Support legs for the hopper */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 1.5, BELT_Y + 1.6, 0]}
            material={MACHINE.frameDark}
          >
            <boxGeometry args={[0.14, 5.4, 0.14]} />
          </mesh>
        ))}
      </group>

      {/* Sealing gantry */}
      <group position={[0, 0, SEAL_Z]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 1.5, BELT_Y + 1.7, 0]} material={MACHINE.frame}>
            <boxGeometry args={[0.16, 3.6, 0.16]} />
          </mesh>
        ))}
        <mesh position={[0, BELT_Y + 3.4, 0]} material={MACHINE.frame}>
          <boxGeometry args={[3.2, 0.22, 0.4]} />
        </mesh>
        <mesh ref={sealHead} position={[0, BELT_Y + 1.95, 0]} material={MACHINE.steel}>
          <boxGeometry args={[1.1, 0.5, 0.7]} />
        </mesh>
        <mesh position={[0, BELT_Y + 3.4, 0.42]} material={MACHINE.caution}>
          <boxGeometry args={[0.5, 0.3, 0.12]} />
        </mesh>
      </group>

      {/* Bags on the belt */}
      {Array.from({ length: BAG_COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            bags.current[i].group = el;
          }}
          position={[0, BELT_Y + 0.06, LINE_START]}
        >
          <mesh
            ref={(el) => {
              bags.current[i].body = el;
            }}
            material={MACHINE.sack}
          >
            <boxGeometry args={[1.25, 1.15, 0.92]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
