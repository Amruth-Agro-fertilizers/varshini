'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Backdrop from '../Backdrop';
import PanelPlane from '../PanelPlane';
import SectionSet from '../SectionSet';
import { ABSTRACT, FRAMES } from '@/lib/assets';
import { clamp01, getProgress, remap, smoothstep } from '@/lib/scroll-progress';

/**
 * Section 03 — White-Label.
 *
 * The isometric supply-chain illustration is the argument this section makes —
 * raw material to plant to truck to retailer — so it is staged as a physical
 * panel the camera closes on, rather than flattened into a page image.
 */
export default function WhiteLabelSet() {
  const panel = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!panel.current) return;
    const p = getProgress('whiteLabel');
    const t = state.clock.elapsedTime;

    // Swings from a raked three-quarter view to square-on as the camera closes,
    // so the panel resolves into a readable diagram exactly when it is legible.
    panel.current.rotation.y = THREE.MathUtils.lerp(0.5, 0.02, smoothstep(remap(p, 0.36, 0.72, 0, 1)));
    panel.current.rotation.x = 0.06 + Math.sin(t * 0.3) * 0.012;
    panel.current.position.y = -1.2 + Math.sin(t * 0.24) * 0.12;
    panel.current.position.x = THREE.MathUtils.lerp(3.4, 0.4, smoothstep(remap(p, 0.36, 0.72, 0, 1)));
  });

  return (
    <SectionSet section="whiteLabel">
      {/* Opens out of the middle once the plant floor has closed away. */}
      <Backdrop section="whiteLabel" src={FRAMES.processing} entry="expand" />

      <group ref={panel} position={[3.4, -1.2, -26]}>
        <PanelPlane
          url={ABSTRACT.one}
          width={26}
          /* Waits for the plate to finish opening. Staged at full size, it
             used to appear over a plate that was still a third of the frame —
             a diagram floating outside the picture it belongs to. */
          opacity={() =>
            clamp01(remap(getProgress('whiteLabel'), 0.34, 0.46, 0, 1)) *
            clamp01(remap(getProgress('whiteLabel'), 0.88, 0.99, 1, 0))
          }
        />
      </group>
    </SectionSet>
  );
}
