// A plant cell against the animal cell. A parenchyma cell about 60 µm long (1 scene unit = 1 µm), box-
// shaped, inside a cellulose wall that shares a middle lamella with the cell next door; a central
// vacuole filling most of the interior and pressing the cytoplasm into a layer a micrometre or two thick;
// lens-shaped chloroplasts with grana inside, mitochondria, a nucleus in a pocket of cytoplasm against
// the wall, rough and smooth ER, a Golgi stack, peroxisomes, cortical microtubules under the membrane,
// and five plasmodesmata through the shared wall. The reader orbits, zooms, cuts it open, clicks a
// structure, drains it with the turgor slider, and puts the chapter-1 animal cell beside it.
//
// Layout. The cell is centred on the origin with its long axis along x; the neighbour is beyond the
// -x wall, drawn shorter and dimmed. The cut is one fixed section: the plane through the cell's centre
// that contains the x axis and leans toward the default camera (normal CUT_N). Everything the section is
// meant to show lies in that plane on purpose — the nucleus and its nucleolus, the Golgi, one
// mitochondrion lengthwise, two chloroplasts, and all five plasmodesmata, so "Follow a plasmodesma"
// can zoom to one and find it already opened lengthwise, membrane lining and desmotubule inside.
//
// Turgor. The slider is a fraction u of full turgor. The protoplast (membrane and everything inside it)
// keeps its size down to u = 0.3, the point of incipient plasmolysis, and below that shrinks toward the
// centre while the wall keeps its shape; the vacuole loses water all the way down, so the cytoplasm
// layer thickens from 1.3 µm at full turgor to 3.2 µm when the cell is plasmolysed. The two readouts are
// computed from those same box dimensions: the vacuole's share of the cell's volume, and the layer's
// thickness, which is the distance the working cytoplasm sits from the surface — Section 3.2's payoff.
//
// What is not to scale, stated once: the wall is drawn 1.2 µm thick (a primary wall is 0.1–0.5 µm) and
// the plasmodesmata about ten times their real 30–50 nm width, so that both are things a reader can
// see and click. The animal cell in "Compare" is a simplified one built here at true relative size
// (20 µm against 60 µm) from the same ORGANELLES colours as Figure 1.5, not the chapter-1 module's own
// geometry: that module builds into its own stage and exports nothing to borrow.
//
// Everything is procedural, coloured from the palette, and a pure function of the clock and the
// reader's input: the only randomness is a seeded generator.
import { ORGANELLE_BY_ID, mix } from '../palette.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  THREE, mergeGeometries, weld, mulberry32, clamp, createStage, addButton, addChip, createRig, Orbit, Spin,
  makeClock, createLoop, Labels, Materials, bindInput, pickAt, observeSize, disposeScene,
} from './lib/three-common.js';
import { organelle, colourOf } from './lib/cell3-colours.js';

export const meta = { kind: 'plantcell3d', title: 'A plant cell', needsWebGL: true, aspect: 16 / 10 };
export const DEFAULT_VIEW = Object.freeze({ theta: 0.6, phi: 1.15, distance: 96 });

const ZOOM_MIN = 5;
const ZOOM_MAX = 210;
const SPIN_RATE = 0.08; // rad/s of idle autorotation
const CUT_SECONDS = 0.6;
const OPEN = 400; // plane constant that clips nothing
const NARROW_W = 600;

// ---------- dimensions, µm ----------
const OUTER = new THREE.Vector3(30, 18, 17); // half-sizes of the wall's outer surface
const WALL_T = 1.2;
const LAMELLA_T = 0.6;
const CORNER = 4.5;
const INNER = OUTER.clone().subScalar(WALL_T); // half-sizes inside the wall (the plasma membrane)
const G0 = 1.3; // cytoplasm layer at full turgor
const G1 = 3.2; // and when plasmolysed
const P_MIN = 0.72; // the protoplast's scale when fully plasmolysed
const U_PLASMOLYSIS = 0.3; // turgor below which the protoplast leaves the wall
const NEIGHBOUR_HALF = 12; // half-length of the cell next door: a stub, so it reads as context
const NR = 4.2; // nucleus radius
const N_PD = 5; // plasmodesmata through the shared wall
const PD_R = 0.45;
const PD_LEN = 2 * WALL_T + LAMELLA_T + 3.2;
const PD_X = -OUTER.x - LAMELLA_T / 2; // the middle of the shared wall
const ANIMAL_R = 10;
const ANIMAL_AT = new THREE.Vector3(50, 0, 0);
const COMPARE_CENTRE = new THREE.Vector3(16, 0, 0);
const COMPARE_ZOOM = 1.32;
// Compare turns to a view from the side, where the two cells sit beside each other rather than one in
// front of the other, and holds the idle spin so they stay that way until the reader turns them.
const COMPARE_VIEW = Object.freeze({ theta: 0.35, phi: 1.2 });
const FOLLOW_DISTANCE = 9;

// The section plane: contains the x axis, leans toward the default camera. z = -0.463 y lies in it.
const CUT_N = new THREE.Vector3(0, 0.42, 0.907).normalize();
const inPlaneZ = (y) => -(CUT_N.y / CUT_N.z) * y;
const N = new THREE.Vector3(14, -12.4, inPlaneZ(-12.4)); // nucleus: against the -y wall, in the section
const G = new THREE.Vector3(21, -8.5, inPlaneZ(-8.5)); // Golgi, beyond the nucleus toward the +x wall
const ER_DIR = new THREE.Vector3(-0.55, 0.7, -0.45).normalize(); // the ER sheets face into the cell

const FOLLOW_VIEW = Object.freeze({ theta: 0, phi: Math.acos(CUT_N.y), distance: FOLLOW_DISTANCE });

// Which structures each cell type has, for the comparison panel and the cards.
const PLANT_ONLY = ['wall', 'middleLamella', 'chloroplast', 'vacuole', 'plasmodesma'];
const ANIMAL_ONLY = ['lysosome', 'centrosome'];
const IN_BOTH = ['membrane', 'nucleus', 'mitochondrion', 'roughER', 'smoothER', 'golgi', 'vesicle', 'peroxisome', 'ribosome', 'cytoskeleton'];

const Y = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);
const ZERO = new THREE.Vector3();
const noUV = (g) => { g.deleteAttribute('uv'); return g; };
const rand3 = (rng) => new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);

// ---------- geometry helpers ----------
function placed(geometry, position, axis = null, scale = null) {
  const q = new THREE.Quaternion();
  if (axis) q.setFromUnitVectors(Y, axis.clone().normalize());
  geometry.applyMatrix4(new THREE.Matrix4().compose(position, q, scale || ONE));
  return noUV(geometry);
}

function bend(g, k) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1) p.setX(i, p.getX(i) + k * p.getY(i) * p.getY(i));
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function box(half, corner, seg = 4) {
  return noUV(new RoundedBoxGeometry(half.x * 2, half.y * 2, half.z * 2, seg, corner));
}

// A mitochondrion: a bent capsule with shelf-like cristae inside, seen only where the cut passes.
function mitochondrion(pos, axis, len, r) {
  const h = len - 2 * r;
  const outer = placed(bend(weld(new THREE.CapsuleGeometry(r, h, 6, 20)), 0.16), pos, axis);
  const cristae = [];
  for (let i = 0; i < 6; i += 1) {
    const disc = new THREE.CylinderGeometry(0.66 * r, 0.66 * r, 0.07, 16);
    disc.translate((i % 2 ? 1 : -1) * 0.16 * r, -h / 2 + (i + 0.5) * (h / 6), 0);
    cristae.push(placed(bend(disc, 0.16), pos, axis));
  }
  return { outer, cristae };
}

// A chloroplast: an oblate lens 5 µm across and 2.5 thick, flat axis along `axis`, with grana inside.
function chloroplast(pos, axis, rng) {
  const lens = placed(new THREE.SphereGeometry(2.5, 26, 16), pos, axis, new THREE.Vector3(1, 0.5, 1));
  const q = new THREE.Quaternion().setFromUnitVectors(Y, axis.clone().normalize());
  const grana = [];
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2 + rng() * 0.5;
    const rr = 0.7 + rng() * 0.9;
    const local = new THREE.Vector3(Math.cos(a) * rr, (rng() - 0.5) * 0.5, Math.sin(a) * rr);
    const g = new THREE.CylinderGeometry(0.42, 0.42, 0.55, 14);
    g.translate(local.x, local.y, local.z);
    g.applyQuaternion(q);
    g.translate(pos.x, pos.y, pos.z);
    grana.push(noUV(g));
  }
  return { lens, grana };
}

// A point on face f of a box with half-sizes `half`, at fractions (u, v) of the flat part of the face,
// `depth` in from the surface.
const AXES = [[1, 2], [2, 0], [0, 1]]; // the two tangent axes for a face normal along axis a
function onFace(half, f, u, v, depth, corner, out = new THREE.Vector3()) {
  const a = f >> 1;
  const s = f % 2 ? -1 : 1;
  const [b, c] = AXES[a];
  const arr = [0, 0, 0];
  arr[a] = s * (half.getComponent(a) - depth);
  arr[b] = u * (half.getComponent(b) - corner);
  arr[c] = v * (half.getComponent(c) - corner);
  return out.set(arr[0], arr[1], arr[2]);
}
const faceNormal = (f) => { const v = new THREE.Vector3(); v.setComponent(f >> 1, f % 2 ? -1 : 1); return v; };

// A rounded-rectangle loop in the yz plane at height x, for the cortical microtubules.
function hoop(x, ry, rz, r, seg = 72) {
  const pts = [];
  for (let i = 0; i < 40; i += 1) {
    const a = (i / 40) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pts.push(new THREE.Vector3(x, Math.sign(c) * Math.abs(c) ** 0.5 * ry, Math.sign(s) * Math.abs(s) ** 0.5 * rz));
  }
  return noUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), seg, r, 5, true));
}

// A patch of sphere facing +z, for an ER sheet; `lookAt` turns +z toward `dir`.
function sheet(radius, phiLen, thetaLen, seg = 28) {
  return noUV(new THREE.SphereGeometry(radius, seg, Math.round(seg / 2), Math.PI / 2 - phiLen / 2, phiLen, Math.PI / 2 - thetaLen / 2, thetaLen));
}
function facing(center, dir) {
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : Y;
  const m = new THREE.Matrix4().lookAt(dir, ZERO, up);
  m.setPosition(center);
  return m;
}
function sheetPoint(radius, phiLen, thetaLen, u, v, out = new THREE.Vector3()) {
  const phi = Math.PI / 2 + (u - 0.5) * phiLen;
  const theta = Math.PI / 2 + (v - 0.5) * thetaLen;
  return out.set(-radius * Math.cos(phi) * Math.sin(theta), radius * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta));
}

// The animal cell's membrane: a sphere with low-amplitude noise, as in Figure 1.5.
function animalMembrane(dir, out = new THREE.Vector3()) {
  const { x, y, z } = dir;
  const n = Math.sin(2.1 * x + 1.3 * y) * Math.cos(1.7 * z - 0.6 * x) + 0.6 * Math.sin(3.3 * y + 2.2 * z + 0.4) + 0.5 * Math.cos(2.8 * x - 1.9 * z + 1.1);
  return out.copy(dir).multiplyScalar(ANIMAL_R * (1 + 0.035 * n)).multiply(new THREE.Vector3(1.04, 0.93, 1));
}

// ---------- the turgor model ----------
function turgorModel(u) {
  const P = u >= U_PLASMOLYSIS ? 1 : P_MIN + (1 - P_MIN) * (u / U_PLASMOLYSIS);
  const g = G0 + (G1 - G0) * (1 - u);
  const fraction = (P ** 3 * (INNER.x - g) * (INNER.y - g) * (INNER.z - g)) / (INNER.x * INNER.y * INNER.z);
  const turgorState = u > 0.6 ? 'turgid' : u >= U_PLASMOLYSIS ? 'flaccid' : 'plasmolysed';
  return { P, g, fraction, turgorState };
}

// ---------- the figure ----------
export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the 3D plant cell could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { error: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const clock = makeClock(ctx.pinnedTime);
  const stage = createStage(root, 'plantcell3d', 'A plant cell in 3D. Drag or use the arrow keys to orbit, + and - to zoom; click a structure to read its role.');
  const { renderer, wrap, toolbar, scope } = stage;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.5, 600);
  camera.name = 'camera';
  const rig = createRig(scene, camera, ctx.theme);
  const mats = new Materials(ctx.palette.paper);
  const plane = new THREE.Plane(CUT_N.clone().negate(), OPEN);
  const clipping = [plane];
  const rng = mulberry32(20260915);
  const pickables = [];
  const animalPickables = [];
  const types = new Map();
  const typeOf = (id) => {
    if (!types.has(id)) types.set(id, { id, def: organelle(id), materials: [], meshes: [], anchors: [], count: 0, current: -1, dim: 0, dimGoal: 0 });
    return types.get(id);
  };
  const material = (id, opts = {}) => {
    const m = mats.make({ color: colourOf(id), roughness: 0.6, metalness: 0, side: THREE.DoubleSide, cap: 0.55, ...opts });
    m.clippingPlanes = clipping;
    m.name = `${id}-material`;
    typeOf(id).materials.push(m);
    return m;
  };
  // The neighbour's materials are dimmed for good and belong to no type, so it never lights up or dims
  // with a selection: it is context, not a structure of this cell.
  const contextMaterial = (id, opts = {}) => {
    const m = mats.make({ color: colourOf(id), roughness: 0.6, metalness: 0, side: THREE.DoubleSide, cap: 0.55, ...opts });
    m.clippingPlanes = clipping;
    m.name = `neighbour-${id}-material`;
    m.userData.u.uDim.value = 0.56;
    return m;
  };
  const protoplast = new THREE.Group();
  protoplast.name = 'protoplast';
  scene.add(protoplast);
  const animal = new THREE.Group();
  animal.name = 'animal-cell';
  animal.visible = false;
  scene.add(animal);
  const part = (id, geometry, mat, name, anchors = [], parent = protoplast, count = 0) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = name;
    mesh.userData.type = id;
    parent.add(mesh);
    (parent === animal ? animalPickables : pickables).push(mesh);
    const ty = typeOf(id);
    ty.meshes.push(mesh);
    if (parent !== animal) { ty.anchors.push(...anchors); ty.count += count; }
    return mesh;
  };

  // ---------- the wall, the middle lamella and the neighbour ----------
  const wallOpts = { transparent: true, opacity: 0.34, depthWrite: false, roughness: 0.55, cap: 1, fresnel: [0.2, 0.85, 2.2] };
  const wallGeom = box(OUTER, CORNER);
  part('wall', wallGeom, material('wall', { ...wallOpts, side: THREE.BackSide }), 'wall-inner', [], scene).renderOrder = 1;
  part('wall', wallGeom, material('wall', { ...wallOpts, side: THREE.FrontSide }), 'wall-outer', [], scene).renderOrder = 8;
  {
    const slab = new THREE.BoxGeometry(LAMELLA_T, (OUTER.y - 1.2) * 2, (OUTER.z - 1.2) * 2);
    slab.translate(PD_X, 0, 0);
    part('middleLamella', noUV(slab), material('middleLamella', { roughness: 0.7, transparent: true, opacity: 0.5, depthWrite: false, cap: 1 }), 'middle-lamella', [new THREE.Vector3(PD_X, OUTER.y - 1.2, 0), new THREE.Vector3(PD_X, 0, OUTER.z - 1.2), new THREE.Vector3(PD_X, -(OUTER.y - 1.2), 0)], scene);
  }
  {
    const nHalf = new THREE.Vector3(NEIGHBOUR_HALF, OUTER.y, OUTER.z);
    const at = new THREE.Vector3(-OUTER.x - LAMELLA_T - NEIGHBOUR_HALF, 0, 0);
    const nWall = box(nHalf, CORNER);
    nWall.translate(at.x, at.y, at.z);
    const nMem = box(nHalf.clone().subScalar(WALL_T), CORNER - WALL_T);
    nMem.translate(at.x, at.y, at.z);
    const nVac = box(nHalf.clone().subScalar(WALL_T + G0), CORNER - WALL_T - G0);
    nVac.translate(at.x, at.y, at.z);
    const nWallIn = new THREE.Mesh(nWall, contextMaterial('wall', { ...wallOpts, side: THREE.BackSide }));
    const nWallOut = new THREE.Mesh(nWall, contextMaterial('wall', { ...wallOpts, side: THREE.FrontSide }));
    const memOpts = { transparent: true, opacity: 0.2, depthWrite: false, roughness: 0.4, cap: 1, fresnel: [0.1, 0.6, 2.4] };
    const nMemIn = new THREE.Mesh(nMem, contextMaterial('membrane', { ...memOpts, side: THREE.BackSide }));
    const nMemOut = new THREE.Mesh(nMem, contextMaterial('membrane', { ...memOpts, side: THREE.FrontSide }));
    const vacOpts = { transparent: true, opacity: 0.42, depthWrite: false, roughness: 0.3, cap: 1, fresnel: [0.16, 0.62, 2.0] };
    const nVacIn = new THREE.Mesh(nVac, contextMaterial('vacuole', { ...vacOpts, side: THREE.BackSide }));
    const nVacOut = new THREE.Mesh(nVac, contextMaterial('vacuole', { ...vacOpts, side: THREE.FrontSide }));
    nWallIn.renderOrder = 1; nMemIn.renderOrder = 2; nVacIn.renderOrder = 3; nVacOut.renderOrder = 6; nMemOut.renderOrder = 7; nWallOut.renderOrder = 8;
    const nGroup = new THREE.Group();
    nGroup.name = 'neighbour-cell';
    nGroup.add(nWallIn, nWallOut, nMemIn, nMemOut, nVacIn, nVacOut);
    // Four chloroplasts on its long faces, so the cell next door reads as the same kind of cell.
    const lenses = [];
    const grana = [];
    const nInner = nHalf.clone().subScalar(WALL_T);
    for (const [f, u, v] of [[2, -0.3, 0.4], [3, 0.35, -0.3], [4, 0.2, 0.5], [5, -0.4, -0.45]]) {
      const p = onFace(nInner, f, u, v, 1.1, CORNER).add(at);
      const c = chloroplast(p, faceNormal(f), rng);
      lenses.push(c.lens);
      grana.push(...c.grana);
    }
    nGroup.add(new THREE.Mesh(mergeGeometries(lenses), contextMaterial('chloroplast', { cap: 0.42 })));
    nGroup.add(new THREE.Mesh(mergeGeometries(grana), contextMaterial('thylakoid', { cap: 0.8 })));
    for (const m of nGroup.children) m.name = m.name || 'neighbour-part';
    scene.add(nGroup);
  }

  // ---------- plasma membrane and vacuole ----------
  const memOpts = { transparent: true, opacity: 0.22, depthWrite: false, roughness: 0.4, cap: 1, fresnel: [0.1, 0.62, 2.4] };
  const memGeom = box(INNER.clone().subScalar(0.12), CORNER - WALL_T);
  part('membrane', memGeom, material('membrane', { ...memOpts, side: THREE.BackSide }), 'membrane-inner').renderOrder = 2;
  part('membrane', memGeom, material('membrane', { ...memOpts, side: THREE.FrontSide }), 'membrane-outer').renderOrder = 7;
  const vacOpts = { transparent: true, opacity: 0.44, depthWrite: false, roughness: 0.3, cap: 1, fresnel: [0.16, 0.64, 2.0] };
  const VAC0 = INNER.clone().subScalar(G0);
  const vacGeom = box(VAC0, CORNER - WALL_T - G0);
  const vacIn = part('vacuole', vacGeom, material('vacuole', { ...vacOpts, side: THREE.BackSide }), 'vacuole-inner');
  const vacOut = part('vacuole', vacGeom, material('vacuole', { ...vacOpts, side: THREE.FrontSide }), 'vacuole-outer');
  vacIn.renderOrder = 3;
  vacOut.renderOrder = 6;

  // ---------- nucleus ----------
  const nucGeom = placed(new THREE.SphereGeometry(NR, 48, 32), N, null, new THREE.Vector3(1, 0.94, 1));
  const nucOpts = { transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.5, cap: 1, fresnel: [0.3, 0.92, 2.0] };
  part('nucleus', nucGeom, material('nucleus', { ...nucOpts, side: THREE.BackSide }), 'nuclear-envelope-inner').renderOrder = 4;
  part('nucleus', nucGeom, material('nucleus', { ...nucOpts, side: THREE.FrontSide }), 'nuclear-envelope-outer').renderOrder = 5;
  const nucleolusAt = N.clone().add(new THREE.Vector3(0.7, 0.3, -0.6));
  part('nucleolus', placed(new THREE.SphereGeometry(1.15, 28, 18), nucleolusAt), material('nucleolus'), 'nucleolus', [nucleolusAt]);
  {
    const blobs = [];
    const anchors = [];
    while (blobs.length < 7) {
      const p = rand3(rng).multiplyScalar(2.8).add(N);
      const r = 0.55 + rng() * 0.3;
      if (p.distanceTo(N) > NR - r - 0.4 || p.distanceTo(nucleolusAt) < 1.15 + r + 0.15) continue;
      blobs.push(placed(new THREE.SphereGeometry(r, 16, 10), p, rand3(rng), new THREE.Vector3(1, 0.7, 0.85)));
      anchors.push(p);
    }
    part('chromatin', mergeGeometries(blobs), material('chromatin'), 'chromatin', anchors);
  }

  // ---------- the layer's organelles: chloroplasts, mitochondria, peroxisomes ----------
  const placedBodies = []; // { p, r } for rejection sampling
  const clear = (p, r) => placedBodies.every((b) => b.p.distanceTo(p) > b.r + r) && p.distanceTo(N) > NR + r + 0.6 && p.distanceTo(G) > 2.6 + r;
  const pdPoints = [];
  for (let i = 0; i < N_PD; i += 1) {
    const y = (i - (N_PD - 1) / 2) * 5.5;
    pdPoints.push(new THREE.Vector3(PD_X, y, inPlaneZ(y)));
  }
  const nearPlasmodesma = (p, r) => p.x < -INNER.x + 4 && pdPoints.some((q) => Math.hypot(q.y - p.y, q.z - p.z) < r + PD_R + 0.8);
  {
    const lenses = [];
    const grana = [];
    const anchors = [];
    // Two in the section plane first — one on the top wall, one on the +x wall — then the rest scattered.
    const fixed = [[new THREE.Vector3(3, INNER.y - 1.15, inPlaneZ(INNER.y - 1.15)), faceNormal(2)], [new THREE.Vector3(INNER.x - 1.15, -4, inPlaneZ(-4)), faceNormal(0)]];
    let made = 0;
    for (let tries = 0; made < 14 && tries < 600; tries += 1) {
      let p;
      let axis;
      if (made < fixed.length) [p, axis] = fixed[made];
      else {
        const f = Math.floor(rng() * 6);
        p = onFace(INNER, f, rng() * 1.7 - 0.85, rng() * 1.7 - 0.85, 1.15, CORNER);
        axis = faceNormal(f);
        if (!clear(p, 2.9) || nearPlasmodesma(p, 2.6)) continue;
      }
      const c = chloroplast(p, axis, rng);
      lenses.push(c.lens);
      grana.push(...c.grana);
      placedBodies.push({ p, r: 2.7 });
      anchors.push(p.clone());
      made += 1;
    }
    part('chloroplast', mergeGeometries(lenses), material('chloroplast', { cap: 0.42, roughness: 0.55 }), 'chloroplasts', anchors, protoplast, made);
    part('thylakoid', mergeGeometries(grana), material('thylakoid', { cap: 0.85, roughness: 0.6 }), 'grana');
  }
  {
    const outers = [];
    const cristae = [];
    const anchors = [];
    let made = 0;
    for (let tries = 0; made < 7 && tries < 600; tries += 1) {
      let p;
      let axis;
      if (made === 0) { p = new THREE.Vector3(-6, INNER.y - 0.75, inPlaneZ(INNER.y - 0.75)); axis = new THREE.Vector3(1, 0, 0); } else {
        const f = Math.floor(rng() * 6);
        p = onFace(INNER, f, rng() * 1.7 - 0.85, rng() * 1.7 - 0.85, 0.8, CORNER);
        axis = rand3(rng).cross(faceNormal(f)).normalize();
        if (!clear(p, 1.6) || nearPlasmodesma(p, 1.4)) continue;
      }
      const m = mitochondrion(p, axis, 2.2 + rng() * 0.5, 0.48);
      outers.push(m.outer);
      cristae.push(...m.cristae);
      placedBodies.push({ p, r: 1.5 });
      anchors.push(p.clone());
      made += 1;
    }
    part('mitochondrion', mergeGeometries(outers), material('mitochondrion', { cap: 0.42 }), 'mitochondria', anchors, protoplast, made);
    part('mitochondrion', mergeGeometries(cristae), material('mitochondrion', { color: mix(ORGANELLE_BY_ID.mitochondrion.color, '#ffffff', 0.6), cap: 0.85 }), 'cristae');
  }
  {
    const geoms = [];
    const anchors = [];
    let made = 0;
    for (let tries = 0; made < 4 && tries < 300; tries += 1) {
      const f = Math.floor(rng() * 6);
      const p = onFace(INNER, f, rng() * 1.7 - 0.85, rng() * 1.7 - 0.85, 0.7, CORNER);
      if (!clear(p, 1.2) || nearPlasmodesma(p, 1)) continue;
      geoms.push(placed(new THREE.SphereGeometry(0.42, 20, 14), p));
      placedBodies.push({ p, r: 0.9 });
      anchors.push(p.clone());
      made += 1;
    }
    part('peroxisome', mergeGeometries(geoms), material('peroxisome', { roughness: 0.5 }), 'peroxisomes', anchors, protoplast, made);
  }

  // ---------- rough ER, smooth ER, Golgi, vesicles ----------
  const erRibosomes = [];
  {
    const erM = facing(N, ER_DIR);
    const sheets = [];
    const anchors = [];
    const spec = [[NR + 1.1, 2.3, 1.5], [NR + 1.8, 2.5, 1.55], [NR + 2.5, 2.4, 1.45]];
    for (const [r, pl, tl] of spec) {
      const s = sheet(r, pl, tl);
      s.applyMatrix4(erM);
      sheets.push(s);
      for (const [u, v] of [[0.3, 0.5], [0.7, 0.4]]) anchors.push(sheetPoint(r, pl, tl, u, v).applyMatrix4(erM));
      for (let i = 0; i < 70; i += 1) {
        const p = sheetPoint(r + (rng() < 0.5 ? 0.2 : -0.2), pl, tl, rng(), rng());
        erRibosomes.push(p.applyMatrix4(erM));
      }
    }
    part('roughER', mergeGeometries(sheets), material('roughER', { roughness: 0.5, cap: 0.7 }), 'rough-ER', anchors);
    // Smooth ER: tubules leaving the outer sheet's rim and wandering along the wall toward the Golgi.
    const [r, pl, tl] = spec[spec.length - 1];
    const tubes = [];
    const tAnchors = [];
    for (let k = 0; k < 5; k += 1) {
      const start = sheetPoint(r, pl, tl, k / 4, k % 2 ? 0.05 : 0.95).applyMatrix4(erM);
      const pts = [start.clone()];
      let p = start.clone();
      const dir = rand3(rng).setY(Math.abs(rng()) * 0.4).normalize();
      for (let s = 0; s < 6; s += 1) {
        dir.addScaledVector(rand3(rng), 0.6).normalize();
        p = p.clone().addScaledVector(dir, 1.0);
        // Stay inside the cell's cytoplasm layer near the bottom wall.
        p.y = clamp(p.y, -INNER.y + 0.6, -INNER.y + 4.5);
        p.x = clamp(p.x, N.x - 9, INNER.x - 1.5);
        p.z = clamp(p.z, -INNER.z + 1, INNER.z - 1);
        pts.push(p);
      }
      tubes.push(noUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 36, 0.14, 7, false)));
      if (k % 2 === 0) tAnchors.push(pts[3].clone());
    }
    part('smoothER', mergeGeometries(tubes), material('smoothER', { roughness: 0.5 }), 'smooth-ER', tAnchors);
  }
  {
    const gAxis = N.clone().sub(G).normalize();
    const discs = [];
    for (let i = 0; i < 5; i += 1) {
      const size = 1.55 - Math.abs(i - 2) * 0.18;
      const at = G.clone().addScaledVector(gAxis, (i - 2) * 0.38);
      discs.push(placed(new THREE.SphereGeometry(size, 22, 12), at, gAxis, new THREE.Vector3(1, 0.11, 0.8)));
    }
    part('golgi', mergeGeometries(discs), material('golgi', { roughness: 0.5 }), 'golgi-stack', [G.clone()]);
    const ves = [];
    const anchors = [];
    for (const off of [[1.9, 0.5, 0.4], [1.4, -0.7, -1.2], [-0.8, 1.9, 0.2], [-1.6, -0.2, 1.7]]) {
      const p = G.clone().add(new THREE.Vector3(...off));
      ves.push(placed(new THREE.SphereGeometry(0.2, 14, 10), p));
      anchors.push(p);
    }
    part('vesicle', mergeGeometries(ves), material('vesicle', { roughness: 0.45 }), 'vesicles', anchors, protoplast, ves.length);
  }

  // ---------- ribosomes: free in the layer, plus the ER-bound ones ----------
  {
    const free = [];
    while (free.length < 420) {
      const f = Math.floor(rng() * 6);
      const p = onFace(INNER, f, rng() * 1.9 - 0.95, rng() * 1.9 - 0.95, 0.15 + rng() * (G0 - 0.3), CORNER * 0.6);
      if (p.distanceTo(N) < NR + 0.4 || p.distanceTo(G) < 2.2 || nearPlasmodesma(p, 0.2)) continue;
      free.push(p);
    }
    const pts = [...free, ...erRibosomes];
    const ribo = new THREE.InstancedMesh(noUV(new THREE.SphereGeometry(0.075, 7, 5)), material('ribosome', { roughness: 0.8 }), pts.length);
    ribo.name = 'ribosomes';
    ribo.userData.type = 'ribosome';
    const m4 = new THREE.Matrix4();
    pts.forEach((p, i) => ribo.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z)));
    ribo.instanceMatrix.needsUpdate = true;
    ribo.computeBoundingSphere();
    protoplast.add(ribo);
    pickables.push(ribo);
    const ty = typeOf('ribosome');
    ty.meshes.push(ribo);
    ty.anchors.push(...free.slice(0, 12));
    ty.count = pts.length;
  }

  // ---------- cortical microtubules: hoops just under the membrane ----------
  {
    const geoms = [];
    const anchors = [];
    for (const x of [-22, -14, -6, 2, 10, 18, 25]) {
      geoms.push(hoop(x, INNER.y - 0.55, INNER.z - 0.55, 0.1));
      if (x === -6 || x === 18) anchors.push(new THREE.Vector3(x, INNER.y - 0.55, 0), new THREE.Vector3(x, 0, INNER.z - 0.55));
    }
    part('cytoskeleton', mergeGeometries(geoms), material('cytoskeleton', { roughness: 0.7 }), 'cortical-microtubules', anchors);
  }

  // ---------- plasmodesmata ----------
  {
    const linings = [];
    const strands = [];
    const anchors = [];
    const X = new THREE.Vector3(1, 0, 0);
    for (const p of pdPoints) {
      const sleeve = new THREE.CylinderGeometry(PD_R, PD_R, PD_LEN, 14, 6, true);
      linings.push(placed(sleeve, p, X));
      const strand = new THREE.CylinderGeometry(PD_R * 0.34, PD_R * 0.34, PD_LEN + 0.8, 8, 4);
      strands.push(placed(strand, p, X));
      anchors.push(p.clone().addScaledVector(CUT_N, -0.5));
    }
    part('plasmodesma', mergeGeometries(linings), material('plasmodesma', { roughness: 0.5, cap: 0.5 }), 'plasmodesmata', anchors, scene, N_PD);
    part('plasmodesma', mergeGeometries(strands), material('plasmodesma', { color: ORGANELLE_BY_ID.smoothER.color, roughness: 0.5 }), 'desmotubules', [], scene);
  }
  typeOf('cytoplasm');

  // ---------- the animal cell, for comparison ----------
  {
    const A = ANIMAL_AT;
    const mem = new THREE.IcosahedronGeometry(1, 16);
    const p = mem.attributes.position;
    const d = new THREE.Vector3();
    const o = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 1) {
      d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
      animalMembrane(d, o).add(A);
      p.setXYZ(i, o.x, o.y, o.z);
    }
    const membrane = weld(mem);
    const aMem = { transparent: true, opacity: 0.3, depthWrite: false, roughness: 0.35, cap: 1, fresnel: [0.13, 0.78, 2.4] };
    part('membrane', membrane, material('membrane', { ...aMem, side: THREE.BackSide }), 'animal-membrane-inner', [], animal).renderOrder = 1;
    part('membrane', membrane, material('membrane', { ...aMem, side: THREE.FrontSide }), 'animal-membrane-outer', [], animal).renderOrder = 7;
    const AN = A.clone().add(new THREE.Vector3(-2.4, 0.4, 0.6));
    const aNuc = placed(new THREE.SphereGeometry(4, 40, 26), AN, null, new THREE.Vector3(1, 0.95, 1));
    part('nucleus', aNuc, material('nucleus', { ...nucOpts, side: THREE.BackSide }), 'animal-nucleus-inner', [], animal).renderOrder = 4;
    part('nucleus', aNuc, material('nucleus', { ...nucOpts, side: THREE.FrontSide }), 'animal-nucleus-outer', [], animal).renderOrder = 5;
    part('nucleolus', placed(new THREE.SphereGeometry(1.1, 24, 16), AN.clone().add(new THREE.Vector3(0.9, -0.4, 0.8))), material('nucleolus'), 'animal-nucleolus', [], animal);
    const outers = [];
    const cristae = [];
    for (const [x, y, z, ax, ay, az] of [[6.2, 3.8, -1.0, 0.3, 0.9, -0.2], [-5.2, -4.2, 3.4, 0.8, 0.2, 0.5], [2.2, 5.4, 3.8, 0.9, -0.3, 0.3], [-6.4, 3.4, -3.4, 0.2, 0.7, 0.7], [3.0, -4.6, 2.1, 1, 0, 0], [-1.6, -5.8, -4.6, 0.9, 0.2, -0.3]]) {
      const m = mitochondrion(A.clone().add(new THREE.Vector3(x, y, z)), new THREE.Vector3(ax, ay, az), 2.1, 0.46);
      outers.push(m.outer);
      cristae.push(...m.cristae);
    }
    part('mitochondrion', mergeGeometries(outers), material('mitochondrion', { cap: 0.42 }), 'animal-mitochondria', [], animal);
    part('mitochondrion', mergeGeometries(cristae), material('mitochondrion', { color: mix(ORGANELLE_BY_ID.mitochondrion.color, '#ffffff', 0.6), cap: 0.85 }), 'animal-cristae', [], animal);
    const erM = facing(AN, new THREE.Vector3(0.95, 0.12, -0.29).normalize());
    const sheets = [];
    for (const [r, pl, tl] of [[4.9, 1.2, 1.0], [5.5, 1.25, 1.05], [6.1, 1.2, 1.0]]) {
      const s = sheet(r, pl, tl, 22);
      s.applyMatrix4(erM);
      sheets.push(s);
    }
    part('roughER', mergeGeometries(sheets), material('roughER', { roughness: 0.5, cap: 0.7 }), 'animal-rough-ER', [], animal);
    const AG = A.clone().add(new THREE.Vector3(5.2, -1.4, -3.2));
    const gAxis = AN.clone().sub(AG).normalize();
    const discs = [];
    for (let i = 0; i < 5; i += 1) discs.push(placed(new THREE.SphereGeometry(1.5 - Math.abs(i - 2) * 0.16, 20, 10), AG.clone().addScaledVector(gAxis, (i - 2) * 0.36), gAxis, new THREE.Vector3(1, 0.11, 0.8)));
    part('golgi', mergeGeometries(discs), material('golgi', { roughness: 0.5 }), 'animal-golgi', [], animal);
    const small = (id, list, r) => {
      const geoms = [];
      const anchors = [];
      for (const [x, y, z] of list) {
        const q = A.clone().add(new THREE.Vector3(x, y, z));
        geoms.push(placed(new THREE.SphereGeometry(r, 18, 12), q));
        anchors.push(q);
      }
      part(id, mergeGeometries(geoms), material(id, { roughness: 0.5 }), `animal-${id}s`, [], animal);
      return anchors;
    };
    const lysAnchors = small('lysosome', [[-7.0, 0.6, 2.4], [3.4, -5.2, -3.0], [-2.0, 6.2, -1.2], [6.6, 1.4, 3.6]], 0.45);
    small('peroxisome', [[3.8, 6.2, 3.6], [-6.0, -2.8, -2.6], [2.6, -6.2, 2.2]], 0.32);
    small('vesicle', [[-1.0, -3.8, -2.0], [3.6, -4.6, -5.2], [-4.2, 4.8, 3.0], [6.2, 0.4, -5.0]], 0.18);
    const CS = A.clone().add(new THREE.Vector3(2.2, 3.6, -2.6));
    const c1 = placed(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 10), CS, Y);
    const c2 = placed(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 10), CS.clone().add(new THREE.Vector3(0.36, 0.3, 0.05)), new THREE.Vector3(1, 0, 0));
    part('centrosome', mergeGeometries([c1, c2]), material('centrosome'), 'animal-centrosome', [], animal);
    const tubes = [];
    for (let k = 0; k < 14; k += 1) {
      const dir = rand3(rng).normalize();
      const start = CS.clone().addScaledVector(dir, 0.5);
      const end = animalMembrane(dir).multiplyScalar(0.88).add(A);
      const mid = start.clone().lerp(end, 0.5).addScaledVector(rand3(rng).cross(dir).normalize(), 0.4);
      tubes.push(noUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, mid, end]), 12, 0.035, 5, false)));
    }
    part('cytoskeleton', mergeGeometries(tubes), material('cytoskeleton', { roughness: 0.7 }), 'animal-cytoskeleton', [], animal);
    const free = [];
    while (free.length < 200) {
      const q = rand3(rng);
      if (q.length() > 1) continue;
      q.multiplyScalar(8.4).add(A);
      if (q.distanceTo(AN) < 4.4 || q.distanceTo(AG) < 2.2) continue;
      free.push(q);
    }
    const ribo = new THREE.InstancedMesh(noUV(new THREE.SphereGeometry(0.075, 7, 5)), material('ribosome', { roughness: 0.8 }), free.length);
    ribo.name = 'animal-ribosomes';
    ribo.userData.type = 'ribosome';
    const m4 = new THREE.Matrix4();
    free.forEach((q, i) => ribo.setMatrixAt(i, m4.makeTranslation(q.x, q.y, q.z)));
    ribo.instanceMatrix.needsUpdate = true;
    ribo.computeBoundingSphere();
    animal.add(ribo);
    animalPickables.push(ribo);
    typeOf('ribosome').meshes.push(ribo);
    // The two animal-only structures are labelled; everything else in it shares the plant cell's labels.
    typeOf('lysosome').anchors.push(...lysAnchors);
    typeOf('centrosome').anchors.push(CS.clone());
  }
  const structuresDrawn = [...types.values()].filter((ty) => ty.meshes.some((m) => m.parent !== animal)).length;

  // ---------- labels ----------
  const labels = new Labels(stage.labelsEl, stage.svg);
  for (const ty of types.values()) labels.add(ty.id, ty.def.name, { color: ty.def.color });
  labels.add('plant-title', 'Plant cell · 60 µm', { group: 'titles', leader: false });
  labels.add('animal-title', 'Animal cell · 20 µm', { group: 'titles', leader: false });
  const LABEL_PRIORITY = ['vacuole', 'wall', 'chloroplast', 'nucleus', 'plasmodesma', 'mitochondrion', 'middleLamella', 'membrane', 'roughER', 'golgi', 'cytoplasm', 'smoothER', 'peroxisome', 'thylakoid', 'ribosome', 'cytoskeleton', 'nucleolus', 'chromatin', 'vesicle', 'lysosome', 'centrosome'];
  const labelOrder = [...LABEL_PRIORITY.filter((id) => types.has(id)), ...[...types.keys()].filter((id) => !LABEL_PRIORITY.includes(id))];
  const ANIMAL_TYPES = new Set(ANIMAL_ONLY);
  const LABEL_PITCH = 52;
  const dyn = { wall: new THREE.Vector3(), membrane: new THREE.Vector3(), cytoplasm: new THREE.Vector3(), vacuole: new THREE.Vector3(), nucleus: new THREE.Vector3() };
  const camDir = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmpS = new THREE.Vector3();
  const corners = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) corners.push(new THREE.Vector3(sx * OUTER.x, sy * OUTER.y, sz * OUTER.z));
  // Where a ray from the centre along `dir` leaves a box with half-sizes `half`.
  const boxPoint = (dir, half, k, out) => {
    const t = Math.min(half.x / Math.max(1e-6, Math.abs(dir.x)), half.y / Math.max(1e-6, Math.abs(dir.y)), half.z / Math.max(1e-6, Math.abs(dir.z)));
    return out.copy(dir).multiplyScalar(t * k);
  };
  function silhouettePx() {
    tmpS.set(0, 0, 0).project(camera);
    const cx = ((tmpS.x + 1) / 2) * W;
    const cy = ((1 - tmpS.y) / 2) * H;
    let r = 0;
    for (const c of corners) {
      tmpS.copy(c).project(camera);
      r = Math.max(r, Math.hypot(((tmpS.x + 1) / 2) * W - cx, ((1 - tmpS.y) / 2) * H - cy));
    }
    return r;
  }
  function updateLabels() {
    camDir.copy(camera.position).sub(orbit.center).normalize();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    const P = model.P;
    boxPoint(tmp.copy(right).multiplyScalar(0.75).addScaledVector(up, 0.45).addScaledVector(camDir, 0.3).normalize(), OUTER, 0.99, dyn.wall);
    boxPoint(tmp.copy(right).multiplyScalar(-0.7).addScaledVector(up, 0.5).addScaledVector(camDir, 0.3).normalize(), INNER, 0.985 * P, dyn.membrane);
    boxPoint(tmp.copy(right).multiplyScalar(-0.35).addScaledVector(up, -0.75).addScaledVector(camDir, 0.35).normalize(), INNER, 0.96 * P, dyn.cytoplasm);
    if (cut) dyn.vacuole.copy(CUT_N).multiplyScalar(-1.0); // on the section, just inside the kept half
    else boxPoint(tmp.copy(camDir).addScaledVector(up, 0.3).addScaledVector(right, -0.2).normalize(), VAC0, 0.98 * P, dyn.vacuole).multiply(vacIn.scale).divideScalar(P * P);
    if (cut) dyn.nucleus.copy(N).addScaledVector(plane.normal, 0.6 - plane.distanceToPoint(N));
    else dyn.nucleus.copy(up).multiplyScalar(0.6).addScaledVector(camDir, 0.6).normalize().multiplyScalar(NR * 0.97).add(N);
    const visible = (a) => {
      if (cut) return plane.distanceToPoint(a) > 0.25;
      return tmp.copy(a).sub(orbit.center).dot(camDir) > -21;
    };
    const anchorOf = new Map();
    for (const [id, ty] of types) {
      if (ANIMAL_TYPES.has(id) && !comparison) { anchorOf.set(id, null); continue; }
      const cands = dyn[id] ? [dyn[id]] : ty.anchors;
      let a = ty.current >= 0 && ty.current < cands.length && visible(cands[ty.current]) ? cands[ty.current] : null;
      if (!a) {
        let best = -Infinity;
        ty.current = -1;
        cands.forEach((c, i) => {
          if (!visible(c)) return;
          const d = tmp.copy(c).sub(orbit.center).dot(camDir);
          if (d > best) { best = d; ty.current = i; a = c; }
        });
      }
      anchorOf.set(id, a);
    }
    const radius = silhouettePx();
    const diameter = radius * 2;
    const room = following ? 3 : clamp(Math.floor(diameter / LABEL_PITCH), 5, labelOrder.length);
    const order = following ? ['plasmodesma', 'membrane', 'smoothER', 'wall', 'middleLamella'] : labelOrder;
    const keep = new Set(order.filter((id) => anchorOf.get(id)).slice(0, room));
    labelsShown = labelsOn ? keep.size : 0;
    const ring = clamp((H * 0.5 - 26 - radius) / 70, 0, 1);
    const perUnit = radius / Math.hypot(OUTER.x, OUTER.y, OUTER.z);
    const near = clamp(diameter * 0.1, 24, 58);
    for (const [id, a] of anchorOf) {
      if (!a || !keep.has(id)) { labels.set(id, null); continue; }
      tmp.copy(a).sub(ANIMAL_TYPES.has(id) ? ANIMAL_AT : ZERO);
      const sx = tmp.dot(right);
      const sy = -tmp.dot(up);
      const len = Math.hypot(sx, sy);
      const out = Math.max(near, radius + 30 - len * perUnit);
      const off = ANIMAL_TYPES.has(id) ? near : near + (out - near) * ring;
      if (len > 1.5) labels.set(id, a, (sx / len) * off, (sy / len) * off);
      else labels.set(id, a, 0, -off * 0.76);
    }
    // The titles hang under each cell on the screen, whatever the elevation: straight down from the
    // centre by the cell's own reach, not at the box's world-space bottom, which an elevated camera
    // projects into the middle of the silhouette.
    labels.set('plant-title', comparison && !following ? tmp.copy(up).multiplyScalar(-Math.hypot(OUTER.y, OUTER.z) * 0.92) : null, 0, 18);
    labels.set('animal-title', comparison && !following ? tmpS.copy(ANIMAL_AT).addScaledVector(up, -ANIMAL_R * 1.02) : null, 0, 18);
  }

  // ---------- readout panel ----------
  const style = document.createElement('style');
  style.textContent = `
    .pc-panel { position: absolute; top: var(--space-3); right: var(--space-3); max-width: 13.5rem; padding: 0.35rem 0.55rem 0.4rem;
      font-family: var(--font-ui); font-size: var(--text-xs); line-height: 1.3; color: var(--ink);
      background: color-mix(in srgb, var(--paper) 80%, transparent); border-radius: var(--radius); pointer-events: none; }
    .pc-panel dl { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.05rem 0.55rem; margin: 0;
      font-variant-numeric: lining-nums tabular-nums; }
    .pc-panel dt { color: var(--ink-faint); }
    .pc-panel dd { margin: 0; font-weight: 600; }
    .pc-panel .pc-head { margin: 0.4rem 0 0.15rem; padding-top: 0.3rem; border-top: 1px solid var(--rule-strong);
      font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint); }
    .pc-panel .pc-compare dd { font-weight: 400; color: var(--ink-soft); text-wrap: pretty; }
    .pc-panel .pc-compare dl { gap: 0.15rem 0.55rem; }
    .pc-slider { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.6rem 0.2rem 0.5rem; }
    .pc-slider input { width: 6.5rem; accent-color: var(--leaf); }
    .pc-slider span { min-width: 5.6rem; color: var(--ink); font-weight: 600; font-variant-numeric: lining-nums tabular-nums; }
    .pc-panel .pc-line { display: none; font-weight: 600; white-space: nowrap; }
    .pc-panel .pc-line span { font-weight: 400; color: var(--ink-faint); }
    .tb-plantcell3d-narrow .pc-panel { max-width: none; font-size: 0.68rem; padding: 0.22rem 0.45rem; }
    .tb-plantcell3d-narrow .pc-panel > dl { display: none; }
    .tb-plantcell3d-narrow .pc-panel .pc-line { display: block; }
    .tb-plantcell3d-narrow .pc-panel .pc-head { font-size: 0.56rem; }
    .tb-plantcell3d-narrow .pc-slider input { width: 3.8rem; }
    .tb-plantcell3d-narrow .pc-slider span { min-width: 4.6rem; font-size: 0.68rem; }
    .tb-plantcell3d-narrow .fig-btn { padding: 0.26rem 0.5rem; font-size: 0.7rem; }
    .tb-plantcell3d-narrow .fig-toolbar { gap: 0.3rem; }
  `;
  root.append(style);
  const panel = document.createElement('div');
  panel.className = 'pc-panel fig-ui';
  const read = document.createElement('dl');
  const readRow = (label) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    read.append(dt, dd);
    return dd;
  };
  const ddVac = readRow('Vacuole');
  const ddCyt = readRow('Cytoplasm');
  const ddState = readRow('State');
  const line = document.createElement('div'); // the same three numbers on one line, for a phone
  line.className = 'pc-line';
  const compare = document.createElement('div');
  compare.className = 'pc-compare';
  compare.hidden = true;
  const compHead = document.createElement('div');
  compHead.className = 'pc-head';
  compHead.textContent = 'Plant against animal';
  const compList = document.createElement('dl');
  const names = (ids) => ids.map((id) => organelle(id).name.toLowerCase().replace('rough endoplasmic reticulum', 'rough ER').replace('smooth endoplasmic reticulum', 'smooth ER')).join(', ');
  for (const [label, ids] of [['Plant only', PLANT_ONLY], ['Animal only', ANIMAL_ONLY], ['Both', IN_BOTH]]) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = names(ids);
    compList.append(dt, dd);
  }
  compare.append(compHead, compList);
  panel.append(read, line, compare);
  root.append(panel);

  // ---------- state ----------
  const orbit = new Orbit(DEFAULT_VIEW, ZOOM_MIN, ZOOM_MAX);
  const centreGoal = new THREE.Vector3();
  const spin = new Spin(reduced ? 0 : SPIN_RATE);
  const raycaster = new THREE.Raycaster();
  let W = 1;
  let H = 1;
  let narrow = false;
  let cut = false;
  let cutAnim = null;
  let comparison = false;
  let following = false;
  let turgor = 1;
  let model = turgorModel(turgor);
  let labelsOn = root.clientWidth >= NARROW_W;
  let labelsShown = 0;
  let selected = null;
  let hoverAt = 0;

  const sp = () => { const s = document.createElement('span'); s.textContent = ' · '; return s; };
  function applyTurgor() {
    model = turgorModel(turgor);
    const { P, g, fraction, turgorState } = model;
    protoplast.scale.setScalar(P);
    vacIn.scale.set((INNER.x - g) / VAC0.x, (INNER.y - g) / VAC0.y, (INNER.z - g) / VAC0.z);
    vacOut.scale.copy(vacIn.scale);
    ddVac.textContent = `${Math.round(fraction * 100)} % of the cell`;
    ddCyt.textContent = `${g.toFixed(1)} µm thick`;
    ddState.textContent = turgorState;
    line.replaceChildren();
    line.append(`${Math.round(fraction * 100)} % vacuole`, sp(), `${g.toFixed(1)} µm cytoplasm`, sp(), turgorState);
    turgorVal.textContent = `${turgorState} · ${Math.round(turgor * 100)} %`;
  }

  function render() {
    orbit.apply(camera, spin.angle(clock.now()));
    updateLabels();
    labels.obstacles = panelRect ? [panelRect] : [];
    labels.update(camera, W, H, bottomPad);
    renderer.render(scene, camera);
  }

  function stepCut(t) {
    if (!cutAnim) return false;
    const u = clamp((t - cutAnim.start) / CUT_SECONDS, 0, 1);
    plane.constant = cutAnim.from + (cutAnim.to - cutAnim.from) * (1 - (1 - u) ** 3);
    if (u < 1) return true;
    if (!cut) plane.constant = OPEN;
    cutAnim = null;
    return false;
  }

  function stepDim(dt, snap) {
    let moving = false;
    for (const ty of types.values()) {
      const d = ty.dimGoal - ty.dim;
      if (Math.abs(d) < 0.005) ty.dim = ty.dimGoal;
      else { ty.dim += snap ? d : d * (1 - Math.exp(-dt * 14)); moving = true; }
      for (const m of ty.materials) m.userData.u.uDim.value = ty.dim;
    }
    return moving;
  }

  function stepCentre(dt, snap) {
    const d = tmp.copy(centreGoal).sub(orbit.center);
    if (d.length() < 0.02) { orbit.center.copy(centreGoal); return false; }
    orbit.center.addScaledVector(d, snap ? 1 : 1 - Math.exp(-dt * 8));
    return true;
  }

  function step(dt) {
    const t = clock.now();
    const snap = reduced;
    let moving = orbit.step(dt, snap);
    moving = stepCut(t) || moving;
    moving = stepDim(dt, snap) || moving;
    moving = stepCentre(dt, snap) || moving;
    return moving || (spin.rate > 0 && !spin.held && !clock.pinned);
  }

  const loop = createLoop(step, render);
  const nearestTheta = (target, current) => current + Math.atan2(Math.sin(target - current), Math.cos(target - current));
  const instant = () => clock.pinned || reduced;
  const goTo = (view) => {
    spin.fold(orbit, clock.now());
    const target = { ...view, theta: nearestTheta(view.theta, orbit.cur.theta) };
    if (instant()) orbit.set(target);
    else Object.assign(orbit.goal, target);
  };
  const homeView = () => ({ ...DEFAULT_VIEW, distance: DEFAULT_VIEW.distance * (narrow ? 1.25 : 1) * (comparison ? COMPARE_ZOOM : 1) });

  function setCut(on) {
    cut = on;
    btnCut.setAttribute('aria-pressed', String(on));
    const t = clock.now();
    if (on) {
      spin.hold(orbit, t);
      // Turn toward the section only when the reader would otherwise see it edge-on or from behind.
      if (tmp.copy(camera.position).sub(orbit.center).normalize().dot(CUT_N) < 0.34) goTo({ theta: DEFAULT_VIEW.theta, phi: DEFAULT_VIEW.phi, distance: orbit.goal.distance });
    } else if (!following) spin.release(t);
    if (instant()) { plane.constant = on ? 0 : OPEN; cutAnim = null; } else cutAnim = { from: plane.constant === OPEN ? OUTER.x + 4 : plane.constant, to: on ? 0 : OUTER.x + 4, start: t };
    for (const ty of types.values()) ty.current = -1;
    loop.invalidate();
  }

  function setFollowing(on) {
    following = on;
    btnFollow.setAttribute('aria-pressed', String(on));
    if (on) {
      if (comparison) setComparison(false);
      if (!cut) setCut(true);
      spin.hold(orbit, clock.now());
      centreGoal.copy(pdPoints[Math.floor(N_PD / 2)]);
      goTo(FOLLOW_VIEW);
      stage.showCard('A plasmodesma', 'A channel through both walls and the middle lamella, lined by plasma membrane that runs unbroken from one cell into the next, with a strand of ER, the desmotubule, down the middle. Small molecules and signals pass; the cytoplasm of the two cells is one.', 'Drawn about ten times its real width, which is 30–50 nm.');
    } else {
      centreGoal.set(0, 0, 0);
      goTo(homeView());
      if (!cut) spin.release(clock.now());
      if (selected === null) stage.hideCard();
    }
    if (instant()) stepCentre(0, true);
    for (const ty of types.values()) ty.current = -1;
    loop.invalidate();
  }

  function setComparison(on) {
    comparison = on;
    btnCompare.setAttribute('aria-pressed', String(on));
    animal.visible = on;
    compare.hidden = !on;
    if (on && following) setFollowing(false);
    centreGoal.copy(on ? COMPARE_CENTRE : ZERO);
    const distance = clamp(orbit.goal.distance * (on ? COMPARE_ZOOM : 1 / COMPARE_ZOOM), ZOOM_MIN, ZOOM_MAX);
    if (on) { spin.hold(orbit, clock.now()); goTo({ ...COMPARE_VIEW, distance }); } else {
      if (!cut && !following) spin.release(clock.now());
      goTo({ theta: orbit.goal.theta, phi: orbit.goal.phi, distance });
    }
    if (instant()) stepCentre(0, true);
    for (const ty of types.values()) ty.current = -1;
    measurePanel();
    loop.invalidate();
  }

  function applyShellTheme(theme) {
    const dark = theme === 'dark';
    for (const [id, opts, darkF, darkO] of [['wall', wallOpts, [0.12, 0.66, 2.4], 0.28], ['membrane', memOpts, [0.06, 0.5, 2.6], 0.18], ['vacuole', vacOpts, [0.12, 0.5, 2.2], 0.36]]) {
      const ty = typeOf(id);
      ty.glow = dark ? 0.16 : 0;
      for (const m of ty.materials) {
        if (!m.transparent) continue;
        m.userData.u.uFres.value.set(...(dark ? darkF : opts.fresnel));
        m.opacity = dark ? darkO : opts.opacity;
      }
    }
  }
  applyShellTheme(ctx.theme);

  function select(id) {
    selected = id;
    for (const ty of types.values()) {
      ty.dimGoal = id && ty.id !== id ? 0.6 : 0;
      for (const m of ty.materials) m.emissive.copy(m.color).multiplyScalar(ty.id === id ? 0.35 : ty.glow || 0);
    }
    if (id) {
      const ty = types.get(id);
      let note = '';
      if (PLANT_ONLY.includes(id)) note = 'Plant cells only.';
      else if (ANIMAL_ONLY.includes(id)) note = 'Animal cells only.';
      else if (id === 'ribosome') note = `About ${ty.count} shown here; a real cell has millions.`;
      else if (ty.count > 1) note = `${ty.count} in this model.`;
      if (id === 'vacuole') note = `Its membrane is the tonoplast. ${note}`;
      stage.showCard(ty.def.name, ty.def.role, note);
    } else if (following) setFollowing(true);
    else stage.hideCard();
    loop.invalidate();
  }

  function pick(pt) {
    const hits = pickAt(raycaster, camera, pt, comparison ? [...pickables, ...animalPickables] : pickables, cut ? clipping : null);
    return hits.find((h) => h.object.userData.type !== 'wall' && h.object.userData.type !== 'membrane') || hits[0] || null;
  }

  bindInput(wrap, {
    onDrag(dx, dy) { spin.fold(orbit, clock.now()); orbit.drag(dx, dy); loop.invalidate(); },
    onZoom(f) { spin.fold(orbit, clock.now()); orbit.zoom(f); loop.invalidate(); },
    onClick(pt) { const hit = pick(pt); select(hit ? hit.object.userData.type : null); },
    onMove(pt) {
      const now = performance.now();
      if (!pt) { wrap.classList.remove('is-pick'); return; }
      if (now - hoverAt < 70) return;
      hoverAt = now;
      wrap.classList.toggle('is-pick', pick(pt) !== null);
    },
    onEscape() { select(null); },
  });

  // ---------- controls ----------
  const btnCut = addButton(toolbar, 'Cut open', () => setCut(!cut), false);
  const btnLabels = addButton(toolbar, 'Labels', () => {
    labelsOn = !labelsOn;
    btnLabels.setAttribute('aria-pressed', String(labelsOn));
    labels.setGroup('main', labelsOn);
    labels.setGroup('titles', labelsOn);
    loop.invalidate();
  }, labelsOn);
  labels.setGroup('main', labelsOn);
  labels.setGroup('titles', labelsOn);
  const btnCompare = addButton(toolbar, 'Compare', () => setComparison(!comparison), false);
  btnCompare.setAttribute('aria-label', 'Compare: put the animal cell of Chapter 1 beside it at the same scale');
  const btnFollow = addButton(toolbar, 'Plasmodesma', () => setFollowing(!following), false);
  btnFollow.setAttribute('aria-label', 'Follow a plasmodesma: zoom to one channel through the shared wall');
  const btnReset = addButton(toolbar, 'Reset view', () => {
    if (following) { setFollowing(false); return; }
    centreGoal.copy(comparison ? COMPARE_CENTRE : ZERO);
    goTo(homeView());
    loop.invalidate();
  });
  const turgorBox = document.createElement('label');
  turgorBox.className = `fig-chip ${scope}-chip pc-slider`;
  const turgorRange = document.createElement('input');
  turgorRange.type = 'range';
  turgorRange.className = 'fig-range';
  turgorRange.min = '0';
  turgorRange.max = '100';
  turgorRange.step = '1';
  turgorRange.value = '100';
  turgorRange.setAttribute('aria-label', 'Turgor: how much water the cell holds, from plasmolysed at 0 to fully turgid at 100');
  const turgorVal = document.createElement('span');
  turgorBox.append(turgorRange, turgorVal);
  toolbar.append(turgorBox);
  turgorRange.addEventListener('input', () => {
    turgor = Number(turgorRange.value) / 100;
    applyTurgor();
    for (const ty of types.values()) ty.current = -1;
    loop.invalidate();
  });
  const chip = addChip(toolbar, '1 unit = 1 µm · cell ≈ 60 µm', scope);

  // ---------- sizing ----------
  let bottomPad = 52;
  let panelRect = null;
  const measurePad = () => { bottomPad = Math.max(52, toolbar.offsetHeight + 14); };
  const measurePanel = () => {
    const r = panel.getBoundingClientRect();
    const s = root.getBoundingClientRect();
    panelRect = r.width ? { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, w: r.width, h: r.height } : null;
  };
  const unobserve = observeSize(root, (w, h) => {
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wantNarrow = w < NARROW_W;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      root.classList.toggle('tb-plantcell3d-narrow', narrow);
      btnCut.textContent = narrow ? 'Cut' : 'Cut open';
      btnReset.textContent = narrow ? 'Reset' : 'Reset view';
      btnFollow.textContent = narrow ? 'Channel' : 'Plasmodesma';
      chip.textContent = narrow ? 'cell ≈ 60 µm' : '1 unit = 1 µm · cell ≈ 60 µm';
      labelsOn = !narrow;
      btnLabels.setAttribute('aria-pressed', String(labelsOn));
      labels.setGroup('main', labelsOn);
      labels.setGroup('titles', labelsOn);
      if (!following) orbit.set(homeView());
    }
    // On a phone the toolbar wraps to two rows over the bottom of the cell, where the nucleus pocket
    // sits, so the projection is panned up a little; a view offset moves the picture, not the orbit.
    if (narrow) camera.setViewOffset(w, h, 0, 0.09 * h, w, h);
    else camera.clearViewOffset();
    measurePad();
    measurePanel();
    labels.measure();
    loop.invalidate();
  });
  let alive = true;
  document.fonts?.ready.then(() => { if (alive) { measurePad(); measurePanel(); labels.measure(); loop.invalidate(); } });

  applyTurgor();
  measurePanel();
  render();
  ctx.onReady();
  loop.kick();

  return {
    destroy() {
      alive = false;
      loop.stop();
      unobserve();
      disposeScene(scene);
      mats.dispose();
      renderer.dispose();
      root.replaceChildren();
    },
    setTime(t) {
      clock.pin(t);
      orbit.step(0, true);
      if (cutAnim) { plane.constant = cut ? 0 : OPEN; cutAnim = null; }
      stepDim(0, true);
      stepCentre(0, true);
      render();
    },
    setVisible(v) { loop.setVisible(v); },
    setTheme(theme, palette) {
      mats.setPaper(palette.paper);
      rig.setTheme(theme);
      applyShellTheme(theme);
      select(selected);
      render();
    },
    setView(view) {
      spin.fold(orbit, clock.now());
      orbit.set(view);
      for (const ty of types.values()) ty.current = -1;
      render();
    },
    describe() {
      const r = renderer.info.render;
      return {
        view: orbit.view(spin.angle(clock.now())),
        drawCalls: r.calls,
        triangles: r.triangles,
        cut,
        turgor: Number(turgor.toFixed(2)),
        turgorState: model.turgorState,
        vacuoleFraction: Number(model.fraction.toFixed(3)),
        cytoplasmThicknessUm: Number(model.g.toFixed(1)),
        selected,
        structures: structuresDrawn,
        comparison,
        plasmodesmata: N_PD,
        following,
        labels: labelsOn,
        labelsShown,
      };
    },
  };
}
