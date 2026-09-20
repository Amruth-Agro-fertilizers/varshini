'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODELS } from '@/lib/assets';
import { clamp01, remap, smoothstep } from '@/lib/scroll-progress';

const FOV = 45;

/**
 * The headline, as a modelled object rather than type.
 *
 * It arrives square on and legible, then the scroll takes it: growing, turning,
 * and running past the lens on its way into the cloud. The turn is the reason
 * it is a model at all — a flat line of type rotated in space just foreshortens
 * into nothing, while a built object turns to show its own thickness and the
 * light moving over it.
 */

/**
 * Depth it starts at, and where the scroll carries it.
 *
 * Barely anywhere, and that is deliberate. The camera is already flying down
 * this slab from z = 10 to z = -10, so it closes seventeen units on the
 * headline by itself and passes it near the end of the section — the growth is
 * mostly that approach, not the object moving. Driving the object forward as
 * well double-counts: the first attempt sent it to z = +11 against a camera
 * that only reaches -10, so it shot past the lens around a third of the way in
 * and the rest of the section played out with nothing in frame. It drifts back
 * a little instead, which keeps it ahead of the camera long enough to be read.
 */
const FROM_Z = -7;
const TO_Z = -14;

/** Extra magnification on top of what the camera's approach already gives. */
const GROWTH = 2.6;

type Props = {
  /** Fraction of the visible frame width it spans at rest. */
  fill?: number;
  /** Section progress, 0 to 1, sampled every frame. */
  progress: () => number;
};

export default function HeadlineModel({ fill = 0.52, progress }: Props) {
  const { size } = useThree();
  const { scene } = useGLTF(MODELS.headline, false, true);
  const root = useRef<THREE.Group>(null);
  const fadeable = useRef<THREE.Material[] | null>(null);

  /**
   * Centred and normalised to a single unit wide, so everything downstream can
   * talk in frame fractions rather than in whatever units the export happened
   * to use — here, quantised integers running to ±32767.
   */
  const model = useMemo(() => {
    const object = scene.clone(true);
    const box = new THREE.Box3().setFromObject(object);
    const extent = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    return { object, centre, normalise: 1 / (extent.x || 1) };
  }, [scene]);

  /** World width of the frame where the headline sits at rest. */
  const restWidth = useMemo(() => {
    const visibleH = 2 * Math.tan((FOV * Math.PI) / 360) * (10 - FROM_Z);
    return visibleH * (size.width / size.height) * fill;
  }, [size.width, size.height, fill]);

  useFrame((state) => {
    const group = root.current;
    if (!group) return;

    if (!fadeable.current) {
      const found: THREE.Material[] = [];
      group.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          found.push(material);
        }
      });
      fadeable.current = found;
    }

    const p = progress();
    const eased = smoothstep(p);

    group.position.z = THREE.MathUtils.lerp(FROM_Z, TO_Z, eased);

    // Growth held back rather than eased evenly. On a smoothstep the object is
    // already overflowing the frame by the time the reader is a third of the
    // way in, so the lettering is only whole for the opening moments and the
    // rest of the section is abstract tube. A slow-start power curve keeps it
    // readable through the first third and puts the drama at the end, where it
    // is handing over anyway.
    group.scale.setScalar(restWidth * (1 + (GROWTH - 1) * Math.pow(clamp01(p), 1.8)));

    /*
     * A full revolution as it comes.
     *
     * Back-loaded hard, and that is the whole difficulty. Half of any turn
     * about the vertical shows the model's back, and the back of a word is the
     * word mirrored — on an even ease that landed at a third of the way in,
     * with the lettering still frame-sized and perfectly legible backwards,
     * which reads as a fault rather than a flourish.
     *
     * The power curve holds it near square through the stretch where the line
     * is still being read, then spends the rotation in a rush at the end, so
     * the back-facing moment falls where the model is already wider than the
     * frame and most of the way faded. It arrives flat, leaves flat, and the
     * mirrored half passes as motion.
     *
     * Worth a turn at all because the model has real depth: spinning flat type
     * only foreshortens it to a line, while this shows its thickness and runs
     * the light down every stroke on the way round.
     */
    // Lands the last degree exactly where the plate finishes fading, so the
    // revolution is completed on screen rather than trailing off unseen.
    const turn = Math.pow(clamp01(remap(p, 0.1, 0.5, 0, 1)), 3.2);
    group.rotation.y = turn * -Math.PI * 2;
    group.rotation.x = Math.sin(turn * Math.PI) * 0.2 + Math.sin(state.clock.elapsedTime * 0.28) * 0.012;
    group.rotation.z = Math.sin(turn * Math.PI) * 0.06;

    // Drifts up and left as it passes, so it clears the plant rather than
    // sitting on top of it all the way out.
    group.position.x = eased * -1.1;
    // Sits above centre rather than on it. Dead centre puts the lettering over
    // the plant itself and leaves no corner free for the chrome that has to
    // share the frame with it.
    group.position.y = 0.95 + eased * 0.8 + Math.sin(state.clock.elapsedTime * 0.22) * 0.05;

    /*
     * Clears well before the cloud does.
     *
     * It used to run until the hand-off, which left no part of this section
     * where the aerial is simply itself — the lettering was on it until the fog
     * took the frame. The address wants that gap: the headline flies off, the
     * land is briefly just land, and the card names the place standing on it.
     */
    const gap = group.position.z - state.camera.position.z;
    const visibility =
      clamp01(remap(gap, 1.2, -2.5, 0, 1)) * clamp01(remap(p, 0.34, 0.5, 1, 0));

    /*
     * Transparency only while it is actually fading.
     *
     * A material flagged transparent is blended rather than depth-tested, so
     * every pixel it covers is shaded whether or not something nearer already
     * covered it. This is four hundred thousand triangles that grow to three
     * times the width of the frame, and left permanently transparent it took
     * the page to a standstill part-way down the section — screenshots timed
     * out at thirty seconds. Opaque for the stretch that matters, blended only
     * across the short hand-off. Same reasoning as setMachineOpacity.
     */
    const solid = visibility > 0.995;
    for (const material of fadeable.current) {
      material.opacity = visibility;
      material.transparent = !solid;
      material.depthWrite = solid;
    }
    group.visible = visibility > 0.01;
  });

  return (
    <group ref={root} position={[0, 0, FROM_Z]}>
      <group scale={model.normalise}>
        <group position={[-model.centre.x, -model.centre.y, -model.centre.z]}>
          <primitive object={model.object} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODELS.headline, false, true);
