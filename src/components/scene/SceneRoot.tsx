'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import * as THREE from 'three';
import CameraRig from './CameraRig';
import Clouds from './Clouds';
import StudioEnvironment from './StudioEnvironment';
import BaggingLine from './industrial/BaggingLine';
import HeroSet from './sets/HeroSet';
import GroupSet from './sets/GroupSet';
import WhiteLabelSet from './sets/WhiteLabelSet';
import TechnologySet from './sets/TechnologySet';
import SimpleSet from './sets/SimpleSet';
import { FRAMES, HERO_PLATE } from '@/lib/assets';

/**
 * The single WebGL layer for the whole page.
 *
 * Fixed and full-viewport, sitting behind the DOM. One canvas for every
 * section — a canvas per section would mean a GL context per section, and
 * browsers cap those around 16.
 */
export default function SceneRoot() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 260 }}
        // Render at full retina density: the plates are photographic and the
        // type is SDF, so both stay crisp at 2x. AdaptiveDpr drops this only if
        // the device cannot hold frame rate.
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <CameraRig />
        <StudioEnvironment />

          <HeroSet />
          {/* Sits across the flight path between the hero and the plant floor,
              so the camera passes bodily through it. */}
          <Clouds />
          <GroupSet />
          <WhiteLabelSet />
          <TechnologySet />
          <BaggingLine />
          <SimpleSet section="catalogue" src={FRAMES.bottling} />
          <SimpleSet section="process" src={FRAMES.blankLabel} />
          <SimpleSet section="faq" src={FRAMES.warehouse} />
          {/* The opening aerial returns to close the walk where it began. */}
          <SimpleSet section="contact" src={HERO_PLATE} />

          {/* Plant lighting. The photographic plates are unlit by design, so
              this reaches only the built machinery on the bagging line. Warm
              and shallow, to match the light already in the photographs the
              line has to sit inside. */}
          <ambientLight intensity={0.8} color="#fff4e2" />
          <hemisphereLight args={['#ffffff', '#b9b2a0', 1.4]} />
          <directionalLight position={[-8, 9, 6]} intensity={2.2} color="#fff1d9" />

          <AdaptiveDpr pixelated={false} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
