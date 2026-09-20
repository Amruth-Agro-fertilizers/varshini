'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { opt } from '@/lib/assets';

/**
 * A textured plane at a literal world size, for artwork staged as an object in
 * the scene rather than as a full-frame backdrop.
 */
export default function PanelPlane({
  url,
  width,
  opacity = 1,
}: {
  url: string;
  width: number;
  opacity?: number | (() => number);
}) {
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const { gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  const texture = useTexture(opt(url), (loaded) => {
    const list = Array.isArray(loaded) ? loaded : [loaded];
    for (const item of list) {
      item.anisotropy = maxAnisotropy;
      item.colorSpace = THREE.SRGBColorSpace;
      item.needsUpdate = true;
    }
  });

  useFrame(() => {
    if (material.current) {
      material.current.opacity = typeof opacity === 'function' ? opacity() : opacity;
    }
  });

  const image = texture.image as { width: number; height: number } | undefined;
  const aspect = image ? image.width / image.height : 16 / 9;

  return (
    <mesh>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        opacity={typeof opacity === 'function' ? 0 : opacity}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
