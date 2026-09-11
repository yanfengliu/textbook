// An animal cell in 3D: a eukaryotic cell about 20 µm across (1 scene unit = 1 µm) the reader can orbit,
// zoom, click, and cut open with an animated clipping plane. Sizes and shapes follow a first-year
// textbook drawing; colours are the ORGANELLES table in palette.js, shared with the chapter's 2D figures.
// Everything is procedural (no models, no textures); the only dependency is Three.js.
//
// Layout: the cell is centred on the origin. The nucleus sits off-centre, screen-left at the default view;
// the rough ER wraps the nucleus as five stacked curved sacs on its screen-right side, seen at a glancing
// angle so the stack reads as sheets; the Golgi sits beyond the ER on the way to the membrane, cis face
// toward the ER; the smooth ER continues from the outer sac's near rim; the centrosome sits above the
// stack; mitochondria, lysosomes, peroxisomes, vesicles and free ribosomes fill the rest. One
// mitochondrion lies in the plane the default cut makes, lengthwise, so the cut shows its cristae.
import { ORGANELLES, ORGANELLE_BY_ID, mix } from '../palette.js';
import {
  THREE, mergeGeometries, weld, mulberry32, clamp, createStage, addButton, addChip, createRig, Orbit, Spin,
  makeClock, createLoop, Labels, Materials, bindInput, pickAt, observeSize, disposeScene,
} from './lib/three-common.js';

export const meta = { kind: 'cell3d', title: 'An animal cell', needsWebGL: true, aspect: 16 / 10 };
export const DEFAULT_VIEW = Object.freeze({ theta: 0.6, phi: 1.15, distance: 38 });

const ZOOM_MIN = 14;
const ZOOM_MAX = 70;
const SPIN_RATE = 0.1; // rad/s of idle autorotation
const CUT_SECONDS = 0.6;
const OPEN = 100; // plane constant that clips nothing

const R = 10; // membrane radius before noise, µm
const SCALE = new THREE.Vector3(1.04, 0.93, 1.0);
const N = new THREE.Vector3(-2.4, 0.4, 0.6); // nucleus centre
const NR = 4; // nucleus radius
// The ER stack grows from the nucleus along ER_DIR, which is the default camera's screen-right tilted a
// little toward the camera (about 76° from face-on), so the sacs are seen edge-on with a sliver of face.
const ER_DIR = new THREE.Vector3(0.95, 0.12, -0.29).normalize();
// Shell radius from the nucleus centre and the sac's half-arcs across (around y) and up, in µm.
const ER_SACS = [[4.6, 2.6, 2.0], [5.15, 2.7, 2.05], [5.7, 2.75, 2.05], [6.25, 2.7, 2.0], [6.8, 2.5, 1.9]];
const ER_T = 0.13; // sac half-thickness
// Golgi centre: 8.6 µm from the nucleus centre, beyond the ER stack, a little lower and a little behind
// the plane the default cut makes, so the cut sections the stack rather than removing it.
const G = N.clone().addScaledVector(new THREE.Vector3(0.906, 0.061, -0.418), 8.6).add(new THREE.Vector3(0, -1.2, 0));
const CS = new THREE.Vector3(2.2, 3.8, -2.6); // centrosome, above the ER stack
const SER_C = new THREE.Vector3(5.6, -0.6, 3.6); // smooth ER region centre and half-extents
const SER_R = new THREE.Vector3(1.7, 1.4, 1.5);
// x, y, z, axis x, y, z, length, radius. The fifth lies in the default cut plane, lengthwise; the eighth
// crosses it.
const MITO = [
  [6.2, 4.4, -1.0, 0.3, 0.9, -0.2, 2.2, 0.48], [-5.2, -4.2, 3.4, 0.8, 0.2, 0.5, 2.0, 0.45],
  [2.2, 5.4, 3.8, 0.9, -0.3, 0.3, 1.9, 0.42], [-6.4, 3.4, -3.4, 0.2, 0.7, 0.7, 2.1, 0.46],
  [3.0, -4.1, 0.16, 0.46, 0.46, -0.57, 2.3, 0.5], [-1.6, -5.8, -4.6, 0.9, 0.2, -0.3, 1.8, 0.42],
  [0.8, 2.0, 7.2, 0.7, 0.6, -0.2, 2.0, 0.45], [-5.9, 2.3, 2.8, 0.5, 0.4, 0.75, 2.1, 0.47],
];
const LYSOSOMES = [[-7.2, 0.6, 2.4, 0.45], [3.4, -5.2, -3.0, 0.4], [-2.0, 6.2, -1.2, 0.5], [6.8, 1.4, 3.6, 0.38], [-3.6, -6.6, 1.2, 0.42]];
const PEROXISOMES = [[3.8, 6.4, 3.8, 0.32], [-6.2, -2.8, -2.6, 0.3], [2.6, -6.4, 2.2, 0.34], [-0.6, 4.4, -6.4, 0.3]];
const VESICLES = [[-1.0, -3.8, -2.0, 0.18], [3.6, -4.6, -5.2, 0.2], [-4.2, 4.8, 3.0, 0.16], [6.4, 0.4, -5.2, 0.22], [-6.6, -3.6, -1.4, 0.18]];

const Y = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);
const ZERO = new THREE.Vector3();

// ---------- geometry helpers ----------
// The membrane surface: a sphere with low-amplitude noise, squashed a little in y.
function membranePoint(dir, out = new THREE.Vector3()) {
  const { x, y, z } = dir;
  const n = Math.sin(2.1 * x + 1.3 * y) * Math.cos(1.7 * z - 0.6 * x) + 0.6 * Math.sin(3.3 * y + 2.2 * z + 0.4) + 0.5 * Math.cos(2.8 * x - 1.9 * z + 1.1);
  return out.copy(dir).multiplyScalar(R * (1 + 0.035 * n)).multiply(SCALE);
}

const noUV = (g) => { g.deleteAttribute('uv'); return g; };

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

// A point on the mid-surface of a sac: a patch of the sphere of radius Rs (centred at the origin, facing
// +z) that is elliptical in angle with half-widths aU (around y) and aV (elevation). rho in [0, 1] runs
// from the patch centre to its rim, psi around it.
function sacMid(Rs, aU, aV, rho, psi, out) {
  const u = aU * rho * Math.cos(psi);
  const v = aV * rho * Math.sin(psi);
  return out.set(Rs * Math.sin(u) * Math.cos(v), Rs * Math.sin(v), Rs * Math.cos(u) * Math.cos(v));
}

// The closed surface of a flattened sac 2t thick with a rounded rim: top, rim, bottom in one grid.
// `wave` ripples the mid-surface along its normal so a stack of sacs reads as membrane, not machined discs.
function sacGeometry(Rs, aU, aV, t, segQ = 22, segP = 40, wave = 0) {
  const pos = [];
  const idx = [];
  const q1 = 0.42;
  const q2 = 0.58;
  const P = new THREE.Vector3();
  const Nn = new THREE.Vector3();
  const Rd = new THREE.Vector3();
  const out = new THREE.Vector3();
  for (let i = 0; i <= segQ; i += 1) {
    const q = i / segQ;
    let rho;
    let h;
    let a = null;
    if (q < q1) { rho = q / q1; h = t; } else if (q > q2) { rho = (1 - q) / (1 - q2); h = -t; } else { rho = 1; a = Math.PI / 2 - (Math.PI * (q - q1)) / (q2 - q1); h = t * Math.sin(a); }
    for (let j = 0; j <= segP; j += 1) {
      const psi = (j / segP) * Math.PI * 2;
      sacMid(Rs, aU, aV, rho, psi, P);
      Nn.copy(P).normalize();
      if (wave) P.addScaledVector(Nn, wave * Math.sin(7 * aU * rho * Math.cos(psi) + 1.3) * Math.cos(3 * aV * rho * Math.sin(psi)));
      out.copy(P).addScaledVector(Nn, h);
      if (a !== null) {
        sacMid(Rs, aU, aV, rho + 0.01, psi, Rd).sub(P).normalize();
        out.addScaledVector(Rd, t * Math.cos(a));
      }
      pos.push(out.x, out.y, out.z);
    }
  }
  for (let i = 0; i < segQ; i += 1) {
    for (let j = 0; j < segP; j += 1) {
      const a0 = i * (segP + 1) + j;
      const b0 = a0 + segP + 1;
      idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return weld(g);
}

function sacMatrix(center, dir) {
  const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : Y;
  const m = new THREE.Matrix4().lookAt(dir, ZERO, up);
  m.setPosition(center);
  return m;
}

const rand3 = (rng) => new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);

// ---------- the figure ----------
export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the 3D cell could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { error: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const clock = makeClock(ctx.pinnedTime);
  const stage = createStage(root, 'cell3d', 'An animal cell in 3D. Drag or use the arrow keys to orbit, + and - to zoom; click an organelle to read its role.');
  const { renderer, wrap, toolbar, scope } = stage;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.5, 200);
  camera.name = 'camera';
  const rig = createRig(scene, camera, ctx.theme);
  const mats = new Materials(ctx.palette.paper);
  // The cut is always the same section: the plane through the cell's centre that faces the default
  // camera, so it passes through the nucleus, the ER stack, the Golgi and two mitochondria whatever the
  // reader has turned the cell to. Cutting turns the cell toward that camera only when the reader would
  // otherwise see the section edge-on or from behind.
  const D0 = new THREE.Vector3(Math.sin(DEFAULT_VIEW.phi) * Math.sin(DEFAULT_VIEW.theta), Math.cos(DEFAULT_VIEW.phi), Math.sin(DEFAULT_VIEW.phi) * Math.cos(DEFAULT_VIEW.theta));
  const plane = new THREE.Plane(D0.clone().negate(), OPEN);
  const clipping = [plane];
  const rng = mulberry32(20260908);
  const pickables = [];
  const types = new Map();
  const typeOf = (id) => {
    if (!types.has(id)) types.set(id, { id, def: ORGANELLE_BY_ID[id], materials: [], meshes: [], anchors: [], current: -1, dim: 0, dimGoal: 0 });
    return types.get(id);
  };
  const material = (id, opts = {}) => {
    const m = mats.make({ color: ORGANELLE_BY_ID[id].color, roughness: 0.6, metalness: 0, side: THREE.DoubleSide, cap: 0.55, ...opts });
    m.clippingPlanes = clipping;
    m.name = `${id}-material`;
    typeOf(id).materials.push(m);
    return m;
  };
  const part = (id, geometry, mat, name, anchors = []) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.name = name;
    mesh.userData.type = id;
    scene.add(mesh);
    pickables.push(mesh);
    const ty = typeOf(id);
    ty.meshes.push(mesh);
    ty.anchors.push(...anchors);
    return mesh;
  };

  // Plasma membrane: an irregular translucent shell, drawn as back faces then front faces.
  const memGeom = new THREE.IcosahedronGeometry(1, 24);
  {
    const p = memGeom.attributes.position;
    const d = new THREE.Vector3();
    const o = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 1) {
      d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
      membranePoint(d, o);
      p.setXYZ(i, o.x, o.y, o.z);
    }
  }
  const membrane = weld(memGeom);
  const memOpts = { transparent: true, opacity: 0.3, depthWrite: false, roughness: 0.35, cap: 1, fresnel: [0.13, 0.78, 2.4] };
  part('membrane', membrane, material('membrane', { ...memOpts, side: THREE.BackSide }), 'membrane-inner').renderOrder = 1;
  part('membrane', membrane, material('membrane', { ...memOpts, side: THREE.FrontSide }), 'membrane-outer').renderOrder = 4;

  // Nucleus: translucent envelope, nucleolus, chromatin.
  const nucGeom = placed(new THREE.SphereGeometry(NR, 56, 36), N, null, new THREE.Vector3(1, 0.95, 1));
  const nucOpts = { transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.5, cap: 1, fresnel: [0.3, 0.92, 2.0] };
  part('nucleus', nucGeom, material('nucleus', { ...nucOpts, side: THREE.BackSide }), 'nuclear-envelope-inner').renderOrder = 2;
  part('nucleus', nucGeom, material('nucleus', { ...nucOpts, side: THREE.FrontSide }), 'nuclear-envelope-outer').renderOrder = 3;
  const nucleolusAt = N.clone().add(new THREE.Vector3(0.9, -0.4, 0.8));
  part('nucleolus', placed(new THREE.SphereGeometry(1.15, 32, 22), nucleolusAt), material('nucleolus'), 'nucleolus', [nucleolusAt]);
  {
    const blobs = [];
    const anchors = [];
    while (blobs.length < 7) {
      const p = rand3(rng).multiplyScalar(2.7).add(N);
      const r = 0.55 + rng() * 0.3;
      if (p.distanceTo(N) > NR - r - 0.35 || p.distanceTo(nucleolusAt) < 1.15 + r + 0.15) continue;
      blobs.push(placed(new THREE.SphereGeometry(r, 18, 12), p, rand3(rng), new THREE.Vector3(1, 0.7, 0.85)));
      anchors.push(p);
    }
    part('chromatin', mergeGeometries(blobs), material('chromatin'), 'chromatin', anchors);
  }

  // Mitochondria: bent capsules with shelf-like cristae inside (seen when the cell is cut).
  {
    const outers = [];
    const cristae = [];
    const anchors = [];
    for (const [x, y, z, ax, ay, az, len, r] of MITO) {
      const h = len - 2 * r;
      const pos = new THREE.Vector3(x, y, z);
      const axis = new THREE.Vector3(ax, ay, az).normalize();
      outers.push(placed(bend(weld(new THREE.CapsuleGeometry(r, h, 6, 22)), 0.16), pos, axis));
      // Shelf-like cristae, staggered left and right, kept well inside the outer membrane (0.82 r) so
      // they never show through it; seen only when the cut passes through the mitochondrion.
      for (let i = 0; i < 6; i += 1) {
        const disc = new THREE.CylinderGeometry(0.66 * r, 0.66 * r, 0.07, 18);
        disc.translate((i % 2 ? 1 : -1) * 0.16 * r, -h / 2 + (i + 0.5) * (h / 6), 0);
        cristae.push(placed(bend(disc, 0.16), pos, axis));
      }
      anchors.push(pos);
    }
    part('mitochondrion', mergeGeometries(outers), material('mitochondrion', { cap: 0.42 }), 'mitochondria', anchors);
    part('mitochondrion', mergeGeometries(cristae), material('mitochondrion', { color: mix(ORGANELLE_BY_ID.mitochondrion.color, '#ffffff', 0.6), cap: 0.85 }), 'cristae');
  }

  // Rough ER: five stacked curved sacs on one side of the nucleus, studded with ribosomes on both faces;
  // the smooth ER continues from the outer sac's rim nearest the membrane as a tubule network.
  const erM = sacMatrix(N, ER_DIR);
  const erRibosomes = [];
  {
    const sacs = [];
    const anchors = [];
    for (const [Rs, arcU, arcV] of ER_SACS) {
      const aU = arcU / Rs;
      const aV = arcV / Rs;
      const g = sacGeometry(Rs, aU, aV, ER_T, 22, 40, 0.12);
      g.applyMatrix4(erM);
      sacs.push(g);
      for (const psi of [0.4, 1.6, 2.9, 4.4]) anchors.push(sacMid(Rs, aU, aV, 0.55, psi, new THREE.Vector3()).applyMatrix4(erM));
      for (let i = 0; i < 90; i += 1) {
        const p = sacMid(Rs, aU, aV, Math.sqrt(rng()) * 0.9, rng() * Math.PI * 2, new THREE.Vector3());
        const n = p.clone().normalize();
        erRibosomes.push(p.addScaledVector(n, (rng() < 0.5 ? 1 : -1) * (ER_T + 0.06)).applyMatrix4(erM));
      }
    }
    part('roughER', mergeGeometries(sacs), material('roughER', { roughness: 0.5 }), 'rough-ER', anchors);
  }
  {
    const [Rs, arcU, arcV] = ER_SACS[ER_SACS.length - 1];
    const rim = [];
    for (let j = 0; j < 24; j += 1) rim.push(sacMid(Rs, arcU / Rs, arcV / Rs, 1.0, (j / 24) * Math.PI * 2, new THREE.Vector3()).applyMatrix4(erM));
    rim.sort((a, b) => a.distanceTo(SER_C) - b.distanceTo(SER_C));
    const inside = (p) => p.clone().sub(SER_C).divide(SER_R).length() <= 1;
    const tubes = [];
    const anchors = [];
    const walks = [];
    // Three tubules leave the rim for the region; five more branch off earlier tubules inside it. Each
    // is a random walk with momentum, so the tubes bend rather than kink.
    for (let k = 0; k < 8; k += 1) {
      const pts = [];
      let p;
      let dir;
      if (k < 3) { p = rim[k * 2].clone(); dir = SER_C.clone().sub(p).normalize(); } else {
        const from = walks[Math.floor(rng() * walks.length)];
        p = from[1 + Math.floor(rng() * (from.length - 2))].clone();
        dir = rand3(rng).normalize();
      }
      for (let s = 0; s < 6; s += 1) {
        pts.push(p.clone());
        dir.addScaledVector(rand3(rng), 0.7).normalize();
        let next = p.clone().addScaledVector(dir, 0.85);
        if (!inside(next) && s > 0) { dir.copy(SER_C).sub(p).normalize().addScaledVector(rand3(rng), 0.3).normalize(); next = p.clone().addScaledVector(dir, 0.85); }
        p = next;
      }
      walks.push(pts);
      tubes.push(noUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 40, 0.11, 7, false)));
      if (k % 2 === 1) anchors.push(pts[3].clone());
    }
    part('smoothER', mergeGeometries(tubes), material('smoothER', { roughness: 0.5 }), 'smooth-ER', anchors);
  }

  // Golgi: a stack of six curved cisternae between the ER and the membrane. The cis face (nearest the ER)
  // is convex, the trans face concave; vesicles bud from the trans face, and two transport vesicles sit
  // between the ER and the cis face.
  const gAxis = N.clone().sub(G).normalize();
  const gM = sacMatrix(G.clone().addScaledVector(gAxis, -3.2), gAxis);
  const golgiSacs = [[2.45, 0.72], [2.75, 0.9], [3.05, 1], [3.35, 1], [3.65, 0.9], [3.95, 0.72]]; // shell radius, size
  {
    const sacs = [];
    for (const [Rs, s] of golgiSacs) {
      const g = sacGeometry(Rs, (1.7 * s) / Rs, (1.05 * s) / Rs, 0.1, 18, 36, 0.04);
      g.applyMatrix4(gM);
      sacs.push(g);
    }
    part('golgi', mergeGeometries(sacs), material('golgi', { roughness: 0.5 }), 'golgi-stack', [G.clone().addScaledVector(gAxis, 0.3), G.clone().addScaledVector(gAxis, -0.5)]);
    const ves = [];
    const anchors = [];
    const [Rt, st] = golgiSacs[0];
    for (const psi of [0.3, 1.9, 4.2]) {
      const p = sacMid(Rt, (1.7 * st) / Rt, (1.05 * st) / Rt, 1.16, psi, new THREE.Vector3()).applyMatrix4(gM);
      ves.push(placed(new THREE.SphereGeometry(0.2, 16, 12), p));
      anchors.push(p);
    }
    for (const [along, dy, dz] of [[1.15, 0.5, 0.35], [1.3, -0.55, -0.3]]) {
      const p = G.clone().addScaledVector(gAxis, along).add(new THREE.Vector3(0, dy, dz));
      ves.push(placed(new THREE.SphereGeometry(0.16, 16, 12), p));
      anchors.push(p);
    }
    for (const [x, y, z, r] of VESICLES) {
      const p = new THREE.Vector3(x, y, z);
      ves.push(placed(new THREE.SphereGeometry(r, 16, 12), p));
      anchors.push(p);
    }
    part('vesicle', mergeGeometries(ves), material('vesicle', { roughness: 0.45 }), 'vesicles', anchors);
  }

  // Lysosomes and peroxisomes: small spheres.
  for (const [id, list] of [['lysosome', LYSOSOMES], ['peroxisome', PEROXISOMES]]) {
    const geoms = [];
    const anchors = [];
    for (const [x, y, z, r] of list) {
      const p = new THREE.Vector3(x, y, z);
      geoms.push(placed(new THREE.SphereGeometry(r, 24, 16), p));
      anchors.push(p);
    }
    part(id, mergeGeometries(geoms), material(id, { roughness: 0.5 }), `${id}s`, anchors);
  }

  // Ribosomes: free ones scattered in the cytoplasm plus the ER-bound ones, one instanced mesh.
  {
    const free = [];
    while (free.length < 320) {
      const p = rand3(rng);
      if (p.length() > 1) continue;
      p.multiplyScalar(8.4).multiply(SCALE);
      if (p.distanceTo(N) < NR + 0.4 || p.distanceTo(G) < 2.3) continue;
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
    scene.add(ribo);
    pickables.push(ribo);
    const ty = typeOf('ribosome');
    ty.meshes.push(ribo);
    ty.anchors.push(...free.slice(0, 14));
    ty.count = pts.length;
  }

  // Cytoskeleton: microtubules radiating from the centrosome, actin arcs under the membrane.
  {
    const geoms = [];
    const anchors = [];
    let made = 0;
    for (let tries = 0; made < 18 && tries < 300; tries += 1) {
      const dir = rand3(rng).normalize();
      const toN = N.clone().sub(CS);
      const along = toN.dot(dir);
      if (along > 0 && toN.clone().addScaledVector(dir, -along).length() < NR + 0.4) continue;
      const end = new THREE.Vector3();
      for (let s = 1; s < 14; s += 0.25) {
        end.copy(CS).addScaledVector(dir, s);
        if (end.length() > membranePoint(end.clone().normalize()).length() * 0.9) break;
      }
      const start = CS.clone().addScaledVector(dir, 0.5);
      const perp = rand3(rng).cross(dir).normalize();
      const mid = start.clone().lerp(end, 0.5).addScaledVector(perp, 0.35 + rng() * 0.4);
      geoms.push(noUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, mid, end]), 16, 0.035, 5, false)));
      if (made % 3 === 0) anchors.push(mid.clone());
      made += 1;
    }
    for (let k = 0; k < 8; k += 1) {
      const d0 = rand3(rng).normalize();
      const tan = rand3(rng).cross(d0).normalize();
      const pts = [];
      for (let i = 0; i <= 6; i += 1) {
        const a = (i / 6 - 0.5) * 0.7;
        pts.push(membranePoint(d0.clone().multiplyScalar(Math.cos(a)).addScaledVector(tan, Math.sin(a)).normalize()).multiplyScalar(0.955));
      }
      geoms.push(noUV(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.045, 5, false)));
    }
    part('cytoskeleton', mergeGeometries(geoms), material('cytoskeleton', { roughness: 0.7 }), 'cytoskeleton', anchors);
    const c1 = placed(new THREE.CylinderGeometry(0.11, 0.11, 0.5, 12), CS, Y);
    const c2 = placed(new THREE.CylinderGeometry(0.11, 0.11, 0.5, 12), CS.clone().add(new THREE.Vector3(0.36, 0.3, 0.05)), new THREE.Vector3(1, 0, 0));
    part('centrosome', mergeGeometries([c1, c2]), material('centrosome'), 'centrosome', [CS.clone()]);
  }
  typeOf('cytoplasm'); // label only: the space between the organelles

  // ---------- labels ----------
  const labels = new Labels(stage.labelsEl, stage.svg);
  for (const def of ORGANELLES) if (types.has(def.id)) labels.add(def.id, def.name, { color: def.color });
  // Which labels a small cell keeps. Fifteen labels need a silhouette to hang on: zoomed out to the far
  // end of the range the cell is a disc a few centimetres across and the leaders grow into a tangle
  // around it. So the number shown is capped by the room the cell actually takes on the stage, and this
  // order says which ones go first — the structures the chapter argues from stay longest.
  const LABEL_PRIORITY = ['nucleus', 'mitochondrion', 'membrane', 'roughER', 'golgi', 'cytoplasm', 'smoothER', 'lysosome', 'ribosome', 'nucleolus', 'chromatin', 'centrosome', 'peroxisome', 'vesicle', 'cytoskeleton'];
  const labelOrder = [...LABEL_PRIORITY.filter((id) => types.has(id)), ...[...types.keys()].filter((id) => !LABEL_PRIORITY.includes(id))];
  const LABEL_PITCH = 38; // px of cell diameter per label kept
  const dyn = { membrane: new THREE.Vector3(), cytoplasm: new THREE.Vector3(), nucleus: new THREE.Vector3() };
  const camDir = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmpN = new THREE.Vector3();
  const tmpS = new THREE.Vector3();
  // The cell's radius on the stage in pixels: the centre and a point on the membrane straight out to
  // the screen's right, both projected. `right` is set for this frame by updateLabels before this runs.
  function silhouettePx() {
    tmpS.set(0, 0, 0).project(camera);
    const cx = ((tmpS.x + 1) / 2) * W;
    const cy = ((1 - tmpS.y) / 2) * H;
    tmpS.copy(right).multiplyScalar(R * SCALE.x).project(camera);
    return Math.hypot(((tmpS.x + 1) / 2) * W - cx, ((1 - tmpS.y) / 2) * H - cy);
  }
  function updateLabels() {
    camDir.copy(camera.position).normalize();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    membranePoint(tmp.copy(right).multiplyScalar(0.8).addScaledVector(up, 0.5).addScaledVector(camDir, -0.25).normalize(), dyn.membrane);
    dyn.cytoplasm.copy(right).multiplyScalar(-0.8).addScaledVector(up, -0.45).addScaledVector(camDir, -0.3).normalize().multiplyScalar(6.2);
    if (cut) dyn.nucleus.copy(N).addScaledVector(plane.normal, 0.6 - plane.distanceToPoint(N)); // on the section, just inside the kept half
    else dyn.nucleus.copy(up).multiplyScalar(0.7).addScaledVector(right, -0.3).addScaledVector(camDir, -0.15).normalize().multiplyScalar(NR * 0.97).add(N);
    // An anchor is labelled when it is on the kept side of the cut, or, uncut, when it is not far behind
    // the cell's centre and the nucleus does not sit between it and the camera (the envelope is the one
    // body opaque enough to hide what is behind it; the nucleus's own contents are exempt).
    const inNucleus = new Set(['nucleus', 'nucleolus', 'chromatin']);
    const visible = (a, id) => {
      if (cut) return plane.distanceToPoint(a) > 0.25;
      if (a.dot(camDir) < -5) return false;
      if (inNucleus.has(id)) return true;
      tmp.copy(a).sub(camera.position);
      const len = tmp.length();
      tmp.divideScalar(len);
      tmpN.copy(N).sub(camera.position);
      const along = tmpN.dot(tmp);
      return along < 0 || along > len || tmpN.addScaledVector(tmp, -along).length() > NR * 0.9;
    };
    const anchorOf = new Map();
    for (const [id, ty] of types) {
      const cands = dyn[id] ? [dyn[id]] : ty.anchors;
      let a = ty.current >= 0 && ty.current < cands.length && visible(cands[ty.current], id) ? cands[ty.current] : null;
      if (!a) {
        let best = -Infinity;
        ty.current = -1;
        cands.forEach((c, i) => {
          if (!visible(c, id)) return;
          const d = c.dot(camDir);
          if (d > best) { best = d; ty.current = i; a = c; }
        });
      }
      anchorOf.set(id, a);
    }
    // How wide the cell is on the stage right now, and how many labels that pays for.
    const radius = silhouettePx();
    const diameter = radius * 2;
    const room = clamp(Math.floor(diameter / LABEL_PITCH), 5, labelOrder.length);
    const keep = new Set(labelOrder.filter((id) => anchorOf.get(id)).slice(0, room));
    labelsShown = labelsOn ? keep.size : 0;
    // Where each label sits relative to its anchor. Close in, a short leader beside the anchor reads
    // best. Zoomed out there is paper all round the cell, and a label sitting on the organelle it names
    // hides it, so the labels move out to a ring just outside the silhouette, the way a plate in a book
    // is lettered. `ring` is how much of that room the stage's short side actually has, so the crossing
    // between the two placements follows the zoom smoothly and never pushes a label onto the frame edge.
    const ring = clamp((H * 0.5 - 26 - radius) / 70, 0, 1);
    const perUnit = radius / (R * SCALE.x); // stage pixels per micrometre, across the screen
    const near = clamp(diameter * 0.135, 24, 58);
    for (const [id, a] of anchorOf) {
      if (!a || !keep.has(id)) { labels.set(id, null); continue; }
      const sx = a.dot(right);
      const sy = -a.dot(up);
      const len = Math.hypot(sx, sy);
      const out = Math.max(near, radius + 30 - len * perUnit);
      const off = near + (out - near) * ring;
      if (len > 1.5) labels.set(id, a, (sx / len) * off, (sy / len) * off);
      else labels.set(id, a, 0, -off * 0.76);
    }
  }

  // ---------- state ----------
  const orbit = new Orbit(DEFAULT_VIEW, ZOOM_MIN, ZOOM_MAX);
  const spin = new Spin(reduced ? 0 : SPIN_RATE);
  const raycaster = new THREE.Raycaster();
  let W = 1;
  let H = 1;
  let cut = false;
  let cutAnim = null;
  // Labels start on, except on a narrow stage (a phone), where fifteen labels would cover the cell.
  let labelsOn = root.clientWidth >= 600;
  let labelsShown = 0; // how many the last frame actually placed, so the thinning is visible to a check
  let selected = null;
  let hoverAt = 0;

  function render() {
    orbit.apply(camera, spin.angle(clock.now()));
    updateLabels();
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

  function step(dt) {
    const t = clock.now();
    const snap = reduced;
    let moving = orbit.step(dt, snap);
    moving = stepCut(t) || moving;
    moving = stepDim(dt, snap) || moving;
    return moving || (spin.rate > 0 && !spin.held && !clock.pinned);
  }

  const loop = createLoop(step, render);

  // The theta equivalent to `target` nearest `current`, so the camera turns the short way round.
  const nearestTheta = (target, current) => current + Math.atan2(Math.sin(target - current), Math.cos(target - current));

  function setCut(on) {
    cut = on;
    btnCut.setAttribute('aria-pressed', String(on));
    const t = clock.now();
    if (on) {
      spin.hold(orbit, t);
      if (tmp.copy(camera.position).normalize().dot(D0) < 0.34) {
        const target = { theta: nearestTheta(DEFAULT_VIEW.theta, orbit.cur.theta), phi: DEFAULT_VIEW.phi, distance: orbit.goal.distance };
        if (clock.pinned || reduced) orbit.set(target);
        else Object.assign(orbit.goal, target);
      }
    } else spin.release(t);
    if (clock.pinned || reduced) { plane.constant = on ? 0 : OPEN; cutAnim = null; } else cutAnim = { from: plane.constant === OPEN ? R + 2 : plane.constant, to: on ? 0 : R + 2, start: t };
    for (const ty of types.values()) ty.current = -1;
    loop.invalidate();
  }

  // In the dark theme two layers of translucent peach over near-black read as mud, so the membrane
  // thins out and glows a little instead.
  function applyMembraneTheme(theme) {
    const dark = theme === 'dark';
    const ty = typeOf('membrane');
    ty.glow = dark ? 0.22 : 0;
    for (const m of ty.materials) {
      m.userData.u.uFres.value.set(...(dark ? [0.08, 0.58, 2.6] : memOpts.fresnel));
      m.opacity = dark ? 0.26 : memOpts.opacity;
    }
  }
  applyMembraneTheme(ctx.theme);

  function select(id) {
    selected = id;
    for (const ty of types.values()) {
      ty.dimGoal = id && ty.id !== id ? 0.6 : 0;
      for (const m of ty.materials) m.emissive.copy(m.color).multiplyScalar(ty.id === id ? 0.35 : ty.glow || 0);
    }
    if (id) {
      const ty = types.get(id);
      const n = ty.count || ty.anchors.length;
      // A count is only meaningful for organelles drawn as separate bodies; the ER, Golgi, chromatin
      // and cytoskeleton carry several label anchors for one structure.
      const discrete = id === 'mitochondrion' || id === 'lysosome' || id === 'peroxisome' || id === 'vesicle';
      const meta = id === 'ribosome' ? `About ${n} shown here; a real cell has millions.` : discrete && n > 1 ? `${n} in this model.` : '';
      stage.showCard(ty.def.name, ty.def.role, meta);
    } else stage.hideCard();
    loop.invalidate();
  }

  function pick(pt) {
    const hits = pickAt(raycaster, camera, pt, pickables, cut ? clipping : null);
    return hits.find((h) => h.object.userData.type !== 'membrane') || hits[0] || null;
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

  const btnCut = addButton(toolbar, 'Cut open', () => setCut(!cut), false);
  const btnLabels = addButton(toolbar, 'Labels', () => {
    labelsOn = !labelsOn;
    btnLabels.setAttribute('aria-pressed', String(labelsOn));
    labels.setGroup('main', labelsOn);
    loop.invalidate();
  }, labelsOn);
  labels.setGroup('main', labelsOn);
  addButton(toolbar, 'Reset view', () => {
    spin.fold(orbit, clock.now());
    if (reduced || clock.pinned) orbit.set(DEFAULT_VIEW);
    else Object.assign(orbit.goal, DEFAULT_VIEW);
    loop.invalidate();
  });
  addChip(toolbar, '1 unit = 1 µm · cell ≈ 20 µm', scope);

  // How much of the bottom of the stage the controls take. On a phone the toolbar wraps onto three
  // rows, and a label placed against the old fixed 52 px sat on top of a button.
  let bottomPad = 52;
  const measurePad = () => { bottomPad = Math.max(52, toolbar.offsetHeight + 14); };
  const unobserve = observeSize(root, (w, h) => {
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    measurePad();
    labels.measure();
    loop.invalidate();
  });
  let alive = true;
  document.fonts?.ready.then(() => { if (alive) { measurePad(); labels.measure(); loop.invalidate(); } });

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
      render();
    },
    setVisible(v) { loop.setVisible(v); },
    setTheme(theme, palette) {
      mats.setPaper(palette.paper);
      rig.setTheme(theme);
      applyMembraneTheme(theme);
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
      return { drawCalls: r.calls, triangles: r.triangles, view: orbit.view(spin.angle(clock.now())), cut, labels: labelsOn, labelsShown, selected, organelles: types.size };
    },
  };
}
