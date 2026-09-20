import * as THREE from 'three';

/**
 * Shared palette for the plant machinery.
 *
 * Taken from the photography the sections are built on: the plant's frames are
 * painted green, its guarding yellow, its hoppers bare steel. Matching those
 * exactly is what lets a built scene sit inside a photograph of the real thing
 * instead of reading as a model dropped on top of it.
 */
export const MACHINE = {
  frame: new THREE.MeshStandardMaterial({ color: '#35513c', roughness: 0.62, metalness: 0.15 }),
  frameDark: new THREE.MeshStandardMaterial({ color: '#25392b', roughness: 0.7, metalness: 0.1 }),
  steel: new THREE.MeshStandardMaterial({ color: '#a8aeb0', roughness: 0.34, metalness: 0.72 }),
  steelDark: new THREE.MeshStandardMaterial({ color: '#6f7578', roughness: 0.45, metalness: 0.6 }),
  belt: new THREE.MeshStandardMaterial({ color: '#2b2c29', roughness: 0.92, metalness: 0.05 }),
  caution: new THREE.MeshStandardMaterial({ color: '#dcae33', roughness: 0.55, metalness: 0.2 }),
  sack: new THREE.MeshStandardMaterial({ color: '#e6dac0', roughness: 0.93, metalness: 0 }),
  sackSealed: new THREE.MeshStandardMaterial({ color: '#ded0b2', roughness: 0.93, metalness: 0 }),
} as const;

/**
 * Sets opacity across the whole kit, for fading a scene in and out.
 *
 * Transparency is switched off entirely once a scene is fully present.
 * Machinery left flagged transparent is sorted and blended rather than
 * depth-tested, which makes solid steel read as ghostly and lets the plate
 * behind show through its own frame.
 */
export function setMachineOpacity(value: number) {
  const solid = value > 0.995;
  for (const material of Object.values(MACHINE)) {
    material.transparent = !solid;
    material.opacity = value;
    material.depthWrite = solid;
  }
}
