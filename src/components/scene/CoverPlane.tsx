'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const FOV = 45;

type Props = {
  /** WebP texture URL (see lib/assets opt()). */
  url: string;
  /** Depth relative to the parent set's origin. */
  z: number;
  /** Camera distance the cover fit is solved for. The plane keeps a fixed
   *  world size afterwards, so an approaching camera produces genuine
   *  parallax and push-in rather than a rescale. */
  fitDistance: number;
  /** Oversize factor, so a plane still covers when the camera drifts sideways. */
  bleed?: number;
  /** A number, or a getter sampled every frame — a getter lets scroll drive
   *  the fade without re-rendering the React tree. */
  opacity?: number | (() => number);
  /** Multiplied into the texture — used to tint plates toward the forest green. */
  tint?: string;
  /** Extra offsets, sampled every frame when given getters. */
  offsetY?: number | (() => number);
  offsetX?: number | (() => number);
  /** Multiplier on the tint, sampled every frame. Above 1 blows the plate out
   *  toward white — an exposure change, not a fade. */
  exposure?: number | (() => number);
  /** Reports the solved plane size, for anything that has to line up with its edges. */
  onSize?: (size: { width: number; height: number }) => void;
};

const read = (v: number | (() => number)) => (typeof v === 'function' ? v() : v);

/**
 * Full-quality sampling. Without anisotropy these plates smear badly once the
 * camera views them at an angle or from a distance; drei's load callback is
 * the supported place to set it, since the texture itself is cache-shared.
 */
function configureTexture(texture: THREE.Texture, maxAnisotropy: number) {
  texture.anisotropy = maxAnisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

/**
 * A textured plane scaled to cover the viewport at a chosen camera distance.
 *
 * Cover-fitting in 3D is what makes the depth illusion hold: each plate fills
 * the frame at its intended distance, so the only thing the eye reads as the
 * camera flies is parallax and scale, never a letterbox or a resize.
 */
export default function CoverPlane({
  url,
  z,
  fitDistance,
  bleed = 1.12,
  opacity = 1,
  tint = '#ffffff',
  offsetY = 0,
  offsetX = 0,
  exposure,
  onSize,
}: Props) {
  const { size, gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  const texture = useTexture(url, (loaded) => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    for (const item of list) configureTexture(item, maxAnisotropy);
  });
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const baseColor = useMemo(() => new THREE.Color(tint), [tint]);

  const [width, height] = useMemo(() => {
    const visibleH = 2 * Math.tan((FOV * Math.PI) / 360) * fitDistance;
    const visibleW = visibleH * (size.width / size.height);

    const image = texture.image as { width: number; height: number } | undefined;
    const textureAspect = image ? image.width / image.height : 16 / 9;
    const viewAspect = visibleW / visibleH;

    // Cover fit: grow along whichever axis would otherwise letterbox.
    const w = textureAspect > viewAspect ? visibleH * textureAspect : visibleW;
    const h = textureAspect > viewAspect ? visibleH : visibleW / textureAspect;

    return [w * bleed, h * bleed];
  }, [texture, size.width, size.height, fitDistance, bleed]);

  useEffect(() => {
    onSize?.({ width, height });
  }, [width, height, onSize]);

  useFrame(() => {
    if (material.current) {
      material.current.opacity = read(opacity);
      if (exposure !== undefined) {
        material.current.color.copy(baseColor).multiplyScalar(read(exposure));
      }
    }
    if (mesh.current) {
      mesh.current.position.x = read(offsetX);
      mesh.current.position.y = read(offsetY);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        color={tint}
        transparent
        opacity={typeof opacity === 'function' ? 0 : opacity}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
