/**
 * Where the plant sits on screen, as a fraction of the viewport.
 *
 * Another scene-to-DOM bridge, and a mutable module singleton for the same
 * reason scroll-progress is one: it is written every frame by the render loop
 * and read every frame by a DOM element, and routing that through React would
 * re-render on each tick.
 *
 * It exists because the plant does not hold still. The camera dollies through
 * the opening section and the plate magnifies about the frame's centre, so
 * anything off-centre — the plant is well right of it — slides outward as the
 * shot closes in. A leader line drawn to a fixed point would be pointing at
 * open field within a few hundred pixels of scroll.
 */

const anchor = { x: 0.62, y: 0.42, onScreen: false };

export function setPlantAnchor(x: number, y: number, onScreen: boolean) {
  anchor.x = x;
  anchor.y = y;
  anchor.onScreen = onScreen;
}

export function getPlantAnchor() {
  return anchor;
}
