'use client';

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BACKDROP_FIT, BACKDROP_Z, sectionOrigin } from '@/lib/journey';
import { setPlantAnchor } from '@/lib/plant-anchor';

const FOV = 45;

/**
 * Publishes the plant's screen position so the DOM can point at it.
 *
 * `PLANT` is where the works sit in the opening photograph, measured as a
 * fraction of the image — the same convention the scene uses elsewhere for
 * points read off a plate. Everything after that is geometry: the plate is
 * cover-fitted at a known distance and oversized by a known bleed, so a point
 * on the image has an exact world position, and the camera projects it.
 */
const PLANT = { x: 0.637, y: 0.452 };

/** Must match the bleed the hero's Backdrop is given. */
const HERO_BLEED = 1.1;

export default function PlantAnchor() {
  const { camera } = useThree();
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const halfH = Math.tan((FOV * Math.PI) / 360) * BACKDROP_FIT * HERO_BLEED;
    const halfW = halfH * perspective.aspect;

    point.set(
      (PLANT.x - 0.5) * 2 * halfW,
      (0.5 - PLANT.y) * 2 * halfH,
      sectionOrigin('hero') + BACKDROP_Z,
    );
    point.project(camera);

    setPlantAnchor(
      point.x * 0.5 + 0.5,
      -point.y * 0.5 + 0.5,
      point.z < 1 && Math.abs(point.x) < 1.6 && Math.abs(point.y) < 1.6,
    );
  });

  return null;
}
