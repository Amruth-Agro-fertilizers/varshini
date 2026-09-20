/**
 * Scroll progress shared between the DOM (GSAP/ScrollTrigger) and the WebGL
 * scene (R3F useFrame).
 *
 * Deliberately a mutable module singleton rather than React state: the scene
 * samples it every frame, and routing 60fps updates through React would
 * re-render the tree continuously. ScrollTrigger writes, useFrame reads.
 */

/**
 * Page sections, in document order.
 *
 * The order is load-bearing: the camera's position along its flight is the sum
 * of these sections' progress values, so each section must publish progress
 * that runs 0 -> 1 exactly while it passes the top of the viewport.
 */
export const SECTIONS = [
  'hero',
  'group',
  'whiteLabel',
  'technology',
  'catalogue',
  'process',
  'faq',
  'contact',
] as const;

export type SectionKey = (typeof SECTIONS)[number];

/**
 * Anything scroll can drive. Wider than SectionKey: some values track a single
 * element rather than a whole section, which keeps them independent of how the
 * surrounding layout reflows between breakpoints.
 */
export type ProgressKey = SectionKey | 'groupOutro' | 'techStep' | 'catalogueReveal';

const progress = new Map<ProgressKey, number>();

export function setProgress(key: ProgressKey, value: number) {
  progress.set(key, value);
}

export function getProgress(key: ProgressKey): number {
  return progress.get(key) ?? 0;
}

/** Overall document scroll, 0 at top -> 1 at bottom. */
let pageProgress = 0;

export function setPageProgress(value: number) {
  pageProgress = value;
}

export function getPageProgress(): number {
  return pageProgress;
}

/**
 * Position along the camera's flight, in sections.
 *
 * 0 is the top of the hero, 1 the top of section 02, and so on. Summing the
 * section progresses gives a value that only ever moves forward with the
 * scroll, with no dependence on event ordering or on which section believes
 * it is active.
 */
export function journeyTime(): number {
  let t = 0;
  for (const key of SECTIONS) t += getProgress(key);
  return t;
}

/** Frame-rate independent lerp factor for a given smoothing time constant. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** A gap this long means the frame loop stalled rather than ran slowly. */
const STALL_SECONDS = 0.25;

/**
 * Damped approach that snaps after a stall.
 *
 * Frames stop in a backgrounded tab, under low-power mode, and whenever the
 * browser throttles rAF. Clamping delta keeps a single long frame from
 * jumping, but it also means the scene crawls back toward the truth for
 * seconds afterwards while the DOM is already correct. Past the stall
 * threshold the honest answer is to arrive immediately.
 */
export function approach(current: number, target: number, lambda: number, delta: number) {
  if (delta > STALL_SECONDS) return target;
  return damp(current, target, lambda, Math.min(delta, 1 / 30));
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Maps `v` from [inMin,inMax] to [outMin,outMax], clamped at both ends. */
export function remap(v: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp01((v - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
}

/** Smoothstep easing, for motion that should arrive and leave gently. */
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
