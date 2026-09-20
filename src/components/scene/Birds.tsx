'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { MODELS } from '@/lib/assets';
import { birdOpacity } from '@/lib/journey';

/**
 * Flocks crossing the sky between the camera and the plant.
 *
 * The opening shot looks straight down, so these are seen from above — backs
 * and spread wings against the fields, not silhouettes against a horizon. That
 * is the whole reason they work here and did not over the old oblique aerial,
 * where the same model read as black chevrons stuck to the middle of the frame.
 *
 * They also sell the height of the shot. A top-down plate on its own gives the
 * eye nothing to judge altitude by; birds a long way below the lens and a long
 * way above the ground place the camera in the air.
 */

/** Distance a flock travels across the frame, entering and leaving off-screen. */
const SPAN = 86;

type FlockProps = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  /** Depth between the camera's path and the ground plate. */
  z: number;
  /** Heading in the ground plane, radians. 0 flies right. */
  heading: number;
  /** Offset across the direction of travel. */
  offset: number;
  scale: number;
  /** Seconds to cross. */
  period: number;
  phase: number;
};

function Flock({ scene, animations, z, heading, offset, scale, period, phase }: FlockProps) {
  const travel = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);

  // Skinned meshes must be cloned through SkeletonUtils — a plain clone leaves
  // the skeleton bound to the original's bones and every copy collapses onto
  // the first one's pose.
  const model = useMemo(() => cloneSkinned(scene) as THREE.Group, [scene]);
  const { actions } = useAnimations(animations, rig);
  const fadeable = useRef<THREE.Material[] | null>(null);

  useEffect(() => {
    const clip = Object.values(actions)[0];
    clip?.reset().play();
    // Offset each flock within the clip so they are not beating in lockstep.
    if (clip) clip.time = phase * (clip.getClip().duration || 1);
    return () => {
      clip?.stop();
    };
  }, [actions, phase]);

  useFrame((state) => {
    const root = travel.current;
    if (!root) return;

    if (!fadeable.current) {
      const found: THREE.Material[] = [];
      root.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        // Skinned meshes are culled against their bind pose, which the armature
        // has long since moved them out of.
        mesh.frustumCulled = false;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          material.transparent = true;
          found.push(material);
        }
      });
      fadeable.current = found;
    }

    const clock = state.clock.elapsedTime;
    const progress = (((clock / period + phase) % 1) + 1) % 1;
    const along = -SPAN / 2 + progress * SPAN;

    // Travel along the heading, offset across it, both in the ground plane.
    root.position.x = Math.cos(heading) * along - Math.sin(heading) * offset;
    root.position.y = Math.sin(heading) * along + Math.cos(heading) * offset;
    // A slow rise and fall toward the lens, so the crossing is not a ruled line.
    root.position.z = z + Math.sin(progress * Math.PI * 2 + phase * 6) * 1.6;

    const visibility = birdOpacity();
    for (const material of fadeable.current) material.opacity = visibility;
    root.visible = visibility > 0.01;
  });

  return (
    <group ref={travel} position={[0, 0, z]} rotation={[0, 0, heading]} scale={scale}>
      {/*
        The model is authored glTF-style: nose down -Z, up +Y, wings along X.
        The shot looks down the world's -Z, so the flock is tipped to lie in the
        frame's plane — up to +Z (backs to the camera), nose to +X (flying
        right), wings across the frame.

        The order matters and is not interchangeable. Three composes 'XYZ' as
        RX·RY·RZ, so tipping about X and then yawing about Z — the obvious
        reading — sends the wingspan into the screen and leaves the birds
        climbing the frame edge-on. The yaw has to happen about Y, before the
        tip.
      */}
      <group ref={rig} rotation={[Math.PI / 2, -Math.PI / 2, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

/**
 * Depths chosen to interleave with the cloud layers rather than sit behind all
 * of them — a flock passing in front of one bank and behind the next is what
 * ties the birds and the weather into the same air. All of them stay below the
 * nearest cloud, because birds under a cloud deck is the way round that reads.
 */
const FLOCKS = [
  { z: -6, heading: 0.14, offset: 2.5, scale: 0.75, period: 34, phase: 0 },
  { z: -11, heading: -0.2, offset: -4.5, scale: 1.05, period: 44, phase: 0.42 },
  { z: -17, heading: 0.05, offset: 5.5, scale: 1.4, period: 56, phase: 0.74 },
] as const;

export default function Birds() {
  const { scene, animations } = useGLTF(MODELS.birds);

  return (
    <group>
      {FLOCKS.map((flock) => (
        <Flock key={flock.z} scene={scene} animations={animations} {...flock} />
      ))}
    </group>
  );
}

useGLTF.preload(MODELS.birds);
