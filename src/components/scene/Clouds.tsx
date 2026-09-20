'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cloudFogDensity, cloudMass, cloudOpacity } from '@/lib/journey';

/**
 * The cloud bank the camera flies through on its way into the plant.
 *
 * Soft alpha rather than geometry, which is the thing worth recording. The
 * supplied Houdini cloudscape was a hundred thousand triangles wrapped around
 * three and a half thousand puffs, and it never read as cloud: a mesh has a
 * silhouette, so it lit as faceted shells and cut a hard edge against the sky
 * no matter how it was scaled, welded or shaded. Cloud has no surface to model.
 * What it has is a density that fades out, and that is an alpha ramp.
 *
 * So this is a short stack of planes carrying fractal noise, staggered along
 * the flight path. The camera passes between them, which is where the parallax
 * comes from — layers near the lens sweep past while layers further out barely
 * move, and that difference is the whole sensation of travelling through
 * weather. A single plane, however well textured, only ever scales up.
 *
 * Generated in the shader rather than sampled from a texture: the noise is a
 * few lines of arithmetic, so the bank costs nothing to download and cannot
 * band or tile the way a small looping cloud sheet does.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vWorld;
  void main() {
    vUv = uv;
    // World position, not UV, is what the noise is sampled against downstream.
    vWorld = (modelMatrix * vec4(position, 1.0)).xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec2 vWorld;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uDrift;
  uniform float uMass;
  uniform vec3 uColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  /**
   * Size of a cloud feature, in world units.
   *
   * Sampling the noise in world space rather than across the plane's UVs is the
   * whole reason this reads as cloud. Tie detail to UVs and its on-screen size
   * depends on how big the plane happens to be and how close the camera is to
   * it: the near layers, which the camera passes within a couple of units of,
   * showed a few percent of one noise cell stretched over the entire frame —
   * a flat grey wash. In world units a puff is the same few metres across
   * whichever layer it belongs to and wherever it is seen from.
   */
  const float FEATURE = 4.0;

  void main() {
    vec2 q = vWorld / FEATURE + vec2(uSeed, uSeed * 1.7);
    // Drift, mostly sideways. Each layer runs at its own rate, which is what
    // separates them: identical speeds would read as one sheet however far
    // apart they sit, and it is the difference in rate that the eye reads as
    // distance.
    q += vec2(uTime * 0.11 * uDrift, uTime * 0.018 * uDrift);

    // Warping the noise by more noise is what gives billows and wisps instead
    // of the even blotches plain fbm produces.
    float warp = fbm(q * 1.6);
    float density = fbm(q + warp * 0.6);

    // A narrow band, not a wide one. Ramping gently across most of the noise
    // range gives every pixel some cloud in it, which is fog, not weather —
    // the earlier pass read as a uniform veil over the plant for exactly this
    // reason. Cutting hard leaves dense masses with clear sky between them,
    // and it is the gaps that make the masses read as objects.
    // The band widens with the crossing too, so the gaps between masses close
    // up rather than the masses simply getting whiter.
    float cloud = smoothstep(mix(0.46, 0.30, uMass), mix(0.66, 0.62, uMass), density);

    // Feather the plane's own border, so a layer never announces itself as a
    // rectangle when the camera is close enough to see past its edge.
    vec2 c = (vUv - 0.5) * 2.0;
    float edge = 1.0 - smoothstep(0.25, 1.0, length(c * vec2(0.62, 1.0)));

    // Deliberately far from opaque. Five layers that each covered the frame
    // would stack to a white card long before the camera reached them; at this
    // weight they accumulate into something with depth, and the aerial stays
    // readable through the gaps the way weather actually behaves.
    /*
     * Thin the bank over the middle of the frame.
     *
     * Cloud is worth having at the edges, where it frames the shot and hides
     * the plate's own borders. Over the centre it is only in the way: the
     * plant and the headline both live there, and an even deck across the
     * whole frame is what made the section read as washed out rather than
     * atmospheric. An ellipse, wider than tall, because the frame is.
     */
    float r = length(vec2(vWorld.x / 30.0, vWorld.y / 16.0));
    float clearing = mix(0.18, 1.0, smoothstep(0.40, 1.15, r));
    // Closed up for the crossing — see cloudMass.
    clearing = mix(clearing, 1.0, uMass);

    // Weight rises for the crossing. Outside it the bank is thin enough to
    // read the ground through; inside it there is meant to be no ground.
    float weight = mix(0.72, 1.0, uMass);
    float alpha = cloud * edge * uOpacity * weight * clearing;
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

/**
 * Layers, front to back along the flight path.
 *
 * Spread across the depth the camera covers between the aerial and the plant
 * floor, and nudged off-axis so the stack never lines up as a column of cards.
 */
const LAYERS = [
  { z: -4, x: -2.4, y: 1.6, size: 60, seed: 0.0, drift: 1.55 },
  { z: -9, x: 3.1, y: -0.8, size: 66, seed: 11.3, drift: 1.25 },
  { z: -14, x: -1.2, y: 2.4, size: 74, seed: 23.7, drift: 1.0 },
  { z: -19, x: 2.2, y: -1.6, size: 82, seed: 37.1, drift: 0.78 },
  { z: -25, x: -3.0, y: 0.9, size: 92, seed: 52.9, drift: 0.58 },
  { z: -32, x: 1.4, y: 2.0, size: 104, seed: 68.4, drift: 0.4 },
  { z: -39, x: -2.2, y: -1.2, size: 116, seed: 84.1, drift: 0.3 },
  { z: -47, x: 2.8, y: 1.5, size: 130, seed: 97.6, drift: 0.22 },
  // Past the hand-off, so the camera is still flying through weather once it
  // is over the plant. Without these the bank is entirely behind the lens by
  // the time the second section's plate is uncovered, and that section gets a
  // cloudless sky the opening shot never had.
  { z: -58, x: -3.4, y: 2.2, size: 146, seed: 113.2, drift: 0.17 },
  { z: -70, x: 2.0, y: -1.8, size: 164, seed: 129.5, drift: 0.13 },
  { z: -83, x: -1.6, y: 1.1, size: 184, seed: 146.8, drift: 0.1 },
] as const;

function CloudLayer({ z, x, y, size, seed, drift }: (typeof LAYERS)[number]) {
  const material = useRef<THREE.ShaderMaterial>(null);

  // Rebuilt only if the seed changes, which it never does — but the uniform
  // objects must be stable, or every render hands the material a fresh set and
  // the shader recompiles.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSeed: { value: seed },
      uDrift: { value: drift },
      uMass: { value: 0 },
      uColor: { value: new THREE.Color('#fdfbf7') },
    }),
    [seed, drift],
  );

  useFrame((state) => {
    const current = material.current;
    if (!current) return;
    current.uniforms.uTime.value = state.clock.elapsedTime;
    current.uniforms.uOpacity.value = cloudOpacity();
    current.uniforms.uMass.value = cloudMass();
  });

  return (
    <mesh position={[x, y, z]}>
      <planeGeometry args={[size, size * 0.62]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        // Soft volumes must not write depth, or each layer punches a hole in
        // the ones behind it along its own alpha edge.
        depthWrite={false}
        // Scene fog is deliberately not applied. It exists to take the
        // photographic plates forty units out to white; these layers sit within
        // twenty of the lens and are already the same warm white the fog is, so
        // fogging them would cost shader plumbing to change nothing.
        fog={false}
      />
    </mesh>
  );
}

export default function Clouds() {
  const fog = useRef<THREE.FogExp2>(null);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (fog.current) fog.current.density = cloudFogDensity();
    if (group.current) group.current.visible = cloudOpacity() > 0.004;
  });

  return (
    <>
      {/*
       * Fog belongs to the scene, not to the layers, because its whole job is to
       * act on what is *behind* them: the two photographic plates forty and
       * sixty units out. Exponential falloff is what lets one number take those
       * to white while leaving the cloud a few units off the lens alone.
       *
       * Attached from a fragment so it lands on the scene rather than on the
       * bank's own group.
       */}
      <fogExp2 attach="fog" ref={fog} args={['#fdfbf6', 0]} />

      <group ref={group} visible={false}>
        {LAYERS.map((layer) => (
          <CloudLayer key={layer.z} {...layer} />
        ))}
      </group>
    </>
  );
}
