// A second view rendered into a corner of the same canvas: the cross-section window in `cilium` and the
// plasmodesma detail in `plantcell3d`. One renderer, one canvas, two cameras — so there is no second
// WebGL context to create, size and dispose, and the inset follows the figure's own clock exactly.
//
// The rectangle is in CSS pixels measured from the top-left of the stage, the way the rest of the figure
// measures things; WebGL counts from the bottom-left and in device pixels, so this converts both.
import { THREE } from './three-common.js';

const size = new THREE.Vector2();

// Renders `scene` through `camera` into `rect` = { x, y, w, h }. The main view must already have been
// rendered: this turns autoClear off, clears only the rectangle, and puts the renderer back as it was.
export function renderInset(renderer, scene, camera, rect) {
  renderer.getSize(size);
  const x = Math.round(rect.x);
  const y = Math.round(size.y - rect.y - rect.h); // flip: the GL viewport counts up from the bottom
  const w = Math.round(rect.w);
  const h = Math.round(rect.h);
  if (w <= 0 || h <= 0) return;
  const wasAutoClear = renderer.autoClear;
  renderer.autoClear = false;
  renderer.setScissorTest(true);
  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);
  renderer.clear(true, true, false);
  renderer.render(scene, camera);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, size.x, size.y);
  renderer.setScissor(0, 0, size.x, size.y);
  renderer.autoClear = wasAutoClear;
}

// Where the inset sits on a stage W x H: a square in the chosen corner, big enough to read and never
// more than a third of the shorter side.
export function insetRect(W, H, { corner = 'top-right', margin = 12, min = 104, max = 240, fraction = 0.42 } = {}) {
  const side = Math.max(min, Math.min(max, Math.min(W, H) * fraction));
  const w = Math.min(side, W - margin * 2);
  const h = Math.min(side, H - margin * 2);
  const x = corner.endsWith('right') ? W - w - margin : margin;
  const y = corner.startsWith('top') ? margin : H - h - margin;
  return { x, y, w, h };
}

// Project a world point into CSS pixels inside the inset rectangle, or null when it falls outside.
export function projectInto(point, camera, rect, out = new THREE.Vector3()) {
  out.copy(point).project(camera);
  if (out.x < -1 || out.x > 1 || out.y < -1 || out.y > 1) return null;
  return { x: rect.x + ((out.x + 1) / 2) * rect.w, y: rect.y + ((1 - out.y) / 2) * rect.h };
}
