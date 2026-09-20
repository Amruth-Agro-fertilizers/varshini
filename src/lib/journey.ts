import { SECTIONS, clamp01, remap, smoothstep, type SectionKey } from './scroll-progress';

/**
 * Layout of the camera's flight through the page.
 *
 * Every section owns a slab of world space and the camera travels exactly one
 * slab per section. That equality is the whole trick: the flight is continuous
 * across section boundaries because the camera's position where one section
 * ends is precisely where the next begins — there is no seam to hide.
 */

/** World-space distance between consecutive section origins. */
export const SPACING = 20;

/** Camera passes symmetrically through each section's origin. */
export const CAM_LEAD = SPACING / 2;

/** Depth of a section's backdrop plate, relative to its own origin. */
export const BACKDROP_Z = -50;

/**
 * Distance the backdrop is cover-fitted for: the distance at the moment its
 * section begins. Held against the camera's travel this yields a 1.5x push-in
 * across the section — enough to feel like a move, short of a lurch.
 */
export const BACKDROP_FIT = -BACKDROP_Z + CAM_LEAD;

export const sectionIndex = (key: SectionKey) => SECTIONS.indexOf(key);

/** World Z of a section's origin. */
export const sectionOrigin = (key: SectionKey) => -sectionIndex(key) * SPACING;

/** Camera Z for a given point along the flight, measured in sections. */
export const cameraZAt = (t: number) => CAM_LEAD - t * SPACING;

/**
 * The camera's smoothed position along the flight.
 *
 * CameraRig damps the raw scroll value, so anything that has to agree with
 * where the camera actually is — backdrop fades above all — must read this
 * rather than recomputing from raw progress, or it will fade a plate out
 * before the camera has arrived.
 */
let cameraTime = 0;

export function setCameraTime(value: number) {
  cameraTime = value;
}

export function getCameraTime(): number {
  return cameraTime;
}

/**
 * Opacity for a section's backdrop.
 *
 * A section's plate reaches full opacity long before its own section arrives —
 * while it is still completely hidden behind the previous plate, so the fade-in
 * costs nothing visually. The handover is then a short dissolve of the outgoing
 * plate alone, revealing a backdrop that is already solid behind it.
 *
 * That ordering is what avoids both earlier failures at once. Two plates fading
 * independently left them each half-transparent over the page, which washed out
 * to a blank white screen; fading them in step across a wide window showed two
 * factory interiors through each other. Here the frame is always backed by one
 * fully opaque image, and the dissolve is over in a fraction of a section.
 */
export function backdropOpacity(key: SectionKey): number {
  const t = getCameraTime();
  const i = sectionIndex(key);

  // The first frame is already on screen when the page opens.
  const fadeIn = i === 0 ? 1 : remap(t, i - 0.5, i - 0.3, 0, 1);
  // Held opaque right through the wipe; it stops drawing only once it is clear
  // of the frame, so nothing is ever seen through it.
  const retire = remap(t, i + 1.16, i + 1.2, 1, 0);

  return clamp01(fadeIn * retire);
}

/**
 * The hand-off out of the opening section: the camera flies into a bank of
 * cloud, and comes out of it inside the building.
 *
 * This is the one transition on the page that is a path rather than a cut, and
 * the cloud is what makes it honest. Every other approach to it failed on the
 * same rule: two photographs cannot be dissolved across each other. Magnifying
 * into the gate does not help — zooming fills the frame with the gate rather
 * than abstracting it, so it is at its most recognisable exactly where the fade
 * was meant to hide it. Real geometry in front of both plates has no such
 * problem. The cloud occludes, so there is nothing to blend.
 *
 * The whiteout is fog rather than a painted screen, which is why it reads as
 * weather instead of a dissolve: exponential fog takes the distant plates —
 * forty and sixty units out — to white while leaving the cloud a few units off
 * the lens almost untouched. So the frame keeps a moving, lit, parallaxing
 * subject right through the hand-off, and the plate swap happens somewhere
 * behind it that the eye has no access to.
 */

/**
 * Peak fog density — zero, and kept only as the one knob to turn if the cloud
 * bank ever stops covering the swap on its own.
 *
 * Scene fog was how the crossing used to white out, and it was the wrong tool.
 * Exponential fog acts on distance, so a flat plate perpendicular to the lens
 * fogs unevenly across its own face, and where two plates meet at slightly
 * different depths that difference lands as a hard horizontal step — a grey
 * wash above, flat paper below, with a line between them. That banding is what
 * the crossing looked like, and no amount of retiming fixed it because it was
 * never about timing.
 *
 * The cloud bank does the covering now. It is real geometry a few units from
 * the lens, so it occludes evenly and looks like weather rather than like a
 * renderer setting.
 */
const FOG_PEAK = 0;

/** White-out density for the cloud passage, by camera position. */
export function cloudFogDensity(): number {
  const t = getCameraTime();
  const rise = smoothstep(remap(t, 0.8, 0.98, 0, 1));
  // Held thick across the crossing rather than peaking and releasing at once.
  // The passage is meant to be flown through, not blinked through: the reader
  // should be inside weather long enough to lose the ground before the next
  // section's plate is uncovered underneath them.
  const fall = smoothstep(remap(t, 1.14, 1.42, 1, 0));
  return FOG_PEAK * rise * fall;
}

/**
 * Opacity of the flocks crossing the opening shot.
 *
 * Gone before the cloud closes in. Birds are the one thing in frame the eye
 * tracks individually, so carrying them into the white-out would make the
 * hand-off look like something was lost rather than passed through.
 */
export function birdOpacity(): number {
  return clamp01(smoothstep(remap(getCameraTime(), 0.74, 0.92, 1, 0)));
}

/**
 * Opacity of the cloud bank itself.
 *
 * Well ahead of the fog on purpose. For the whole section the cloud is simply
 * weather over a plainly visible aerial — drifting across the plant, breaking
 * over it — and only once the camera is among it does the fog close in. Raising
 * both together skips the part worth watching and goes straight to a white
 * screen.
 */
export function cloudOpacity(): number {
  const t = getCameraTime();
  // Present from the first frame. The opening shot is weather over a top-down
  // aerial, so the cloud is part of the composition rather than something that
  // arrives to end it — and it stays on well past the fog, so the plant front
  // view is uncovered with cloud still breaking over it rather than appearing
  // in clear air the instant the white lifts.
  return clamp01(smoothstep(remap(t, 1.55, 1.82, 1, 0)));
}

/**
 * How far the cloud's thin centre is closed up, 0 to 1.
 *
 * The bank is normally kept clear over the middle of frame so the plant and
 * the headline can be read through it. That is exactly wrong for the crossing,
 * where the point is to lose the ground entirely — so the clearing is filled
 * back in for the length of the passage and reopened on the other side.
 */
export function cloudMass(): number {
  const t = getCameraTime();
  return clamp01(smoothstep(remap(t, 0.72, 0.96, 0, 1)) * smoothstep(remap(t, 1.02, 1.2, 1, 0)));
}

/**
 * Opacity of the opening plate.
 *
 * A cut, not a fade, and placed inside the fog's opaque peak — at that moment
 * the plate is already solid white forty units out, so dropping it changes
 * nothing on screen. Everything the eye is actually tracking is the cloud in
 * front, which does not move.
 */
export function heroPlateOpacity(): number {
  return clamp01(remap(getCameraTime(), 1.0, 1.05, 1, 0));
}

/**
 * Exposure multiplier for a plate the camera arrives at from open sunlight.
 *
 * Timed to take over from the fog clearing: the shed is still over-bright as it
 * emerges and settles from there, so the passage reads as one continuous
 * exposure recovering rather than as weather that ends and a picture that
 * begins. What an eye, or an auto-exposing lens, actually does walking in from
 * a sunrise.
 */
export function arrivalExposure(key: SectionKey, peak = 1.45): number {
  const t = getCameraTime();
  const i = sectionIndex(key);
  return remap(t, i + 0.05, i + 0.34, peak, 1);
}

/**
 * The shrink hand-off: a screen closes in on itself, and the next one opens.
 *
 * Every other hand-off on this page works by keeping one plate opaque and
 * moving it, because two photographs cannot be blended. This one does not
 * blend either — it makes the space between them empty. The outgoing plate
 * pulls in off the frame edges onto black and goes; there is a beat of nothing;
 * the next plate opens out of the middle.
 *
 * The order is the whole trick, and it is the reverse of the wipe's. A wiped
 * plate needs the next one already at full opacity *behind* it, so that what is
 * uncovered is solid. A shrinking plate needs exactly the opposite: if the next
 * plate is sitting there at full size the shrink simply reveals it, and there
 * is no black, no beat, and no sense of one screen closing before another
 * opens. So `expandIn` holds the arriving plate at nothing until the outgoing
 * one has finished leaving.
 */

/** Camera-time window the outgoing plate closes across. */
const SHRINK_OUT: [number, number] = [0.9, 1.06];
/** And the window the next one opens across, after a beat of black. */
const SHRINK_IN: [number, number] = [1.13, 1.33];

/** Scale for a plate leaving by shrinking, 1 down to a fraction of the frame. */
export function shrinkScale(key: SectionKey): number {
  const t = getCameraTime();
  const i = sectionIndex(key);
  return 1 - 0.78 * smoothstep(remap(t, i + SHRINK_OUT[0], i + SHRINK_OUT[1], 0, 1));
}

/**
 * Opacity for a plate leaving by shrinking.
 *
 * Held solid almost the whole way in and cut at the end, while it is small and
 * still moving. Fading it across the shrink would put a half-transparent
 * photograph over black, which reads as a fault rather than as distance.
 */
export function shrinkOpacity(key: SectionKey): number {
  const t = getCameraTime();
  const i = sectionIndex(key);
  return clamp01(remap(t, i + SHRINK_OUT[1] - 0.03, i + SHRINK_OUT[1], 1, 0));
}

/** Scale for a plate arriving by opening out of the middle. */
export function expandScale(key: SectionKey): number {
  const t = getCameraTime();
  const i = sectionIndex(key);
  return 0.3 + 0.7 * smoothstep(remap(t, i - 1 + SHRINK_IN[0], i - 1 + SHRINK_IN[1], 0, 1));
}

/**
 * Opacity for a plate arriving by opening.
 *
 * Nothing until the beat of black has been held, then solid almost at once —
 * so the plate is a small opaque window that grows, not a picture fading up.
 */
export function expandOpacity(key: SectionKey): number {
  const t = getCameraTime();
  const i = sectionIndex(key);
  const open = clamp01(remap(t, i - 1 + SHRINK_IN[0], i - 1 + SHRINK_IN[0] + 0.04, 0, 1));
  const retire = remap(t, i + 1.16, i + 1.2, 1, 0);
  return clamp01(open * retire);
}

/**
 * How far through its exit wipe a section's plate is, 0 to 1.
 *
 * Runs slightly past the section boundary so the uncovering is still in motion
 * as the next section's copy arrives, rather than completing early and leaving
 * a static frame.
 */
export function handoverProgress(key: SectionKey): number {
  const t = getCameraTime();
  const i = sectionIndex(key);
  return smoothstep(remap(t, i + 0.9, i + 1.14, 0, 1));
}

/**
 * Same non-overlapping dissolve, for plates that switch within a section
 * (the technology carousel's four steps).
 */
export function stepOpacity(step: number, index: number, last: number): number {
  const fadeIn = index === 0 ? 1 : remap(step, index - 0.34, index - 0.1, 0, 1);
  const fadeOut = index === last ? 1 : remap(step, index + 0.1, index + 0.34, 1, 0);
  return clamp01(fadeIn * fadeOut);
}

/**
 * Where a transition effect sits: just ahead of the camera at the moment it
 * crosses from one section into the next.
 */
export const boundaryZ = (index: number) => cameraZAt(index + 1) - 16;

/**
 * Progress through a boundary's transition window, 0 to 1, and whether it is
 * worth drawing at all.
 *
 * Effects run only across their own hand-off. Outside that window they are
 * switched off entirely rather than merely faded, so a page with seven
 * transitions costs no more per frame than a page with one.
 */
export function transitionState(index: number): { progress: number; active: boolean } {
  const t = getCameraTime();
  const progress = clamp01(remap(t, index + 0.55, index + 1.35, 0, 1));
  return { progress, active: progress > 0.001 && progress < 0.999 };
}

/** Rises to 1 at the middle of a transition and falls away at either end. */
export const arch = (progress: number) => Math.sin(clamp01(progress) * Math.PI);

/** True once a set is far enough behind the camera to skip drawing entirely. */
export function setIsBehind(key: SectionKey): boolean {
  return getCameraTime() - sectionIndex(key) > 1.6;
}
