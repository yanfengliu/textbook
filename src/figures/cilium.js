// The 9+2 axoneme, turned over and set beating. A cilium in 3D: nine outer doublet microtubules in a
// ring around two central singlets, radial spokes to the central sheath, nexin links between
// neighbouring doublets, and rows of dynein arms reaching from each doublet toward the next. A section
// window in the corner shows the cross-section at whatever height the reader has slid the plane to, from
// the tip down to the basal body, where the pattern becomes nine triplets and the central pair is gone.
//
// 1 scene unit = 100 nm, and the cilium is 2.4 µm of shaft on a 0.4 µm basal body — the low end of the
// "a few micrometres" the chapter gives, chosen so the whole thing and its cross-section can both be
// read without the reader having to zoom between them. Real dimensions throughout: doublets on a 90 nm
// radius, tubules 25 nm across, the ciliary membrane 250 nm across, dynein arms every 24 nm, radial
// spokes and nexin links on the 96 nm repeat. The basal body is drawn at the same radius as the shaft
// rather than the slightly wider real one, and without the longitudinal twist of a real centriole.
//
// The bend. `setTime` has to pin every frame, so the beat is a pure function of the clock: the tangent
// angle along the shaft is θ(s) = Θ·g(s)·sin(2π(s/λ − φ)) with φ the phase, g a ramp that holds the base
// still because the basal body anchors it, and λ about one wave over the free length. The centreline is
// the integral of that, computed on the CPU into a 96-sample table and handed to every material as a
// uniform, so one vertex patch bends the whole axoneme — tubules, arms, spokes and membrane together —
// in one pass and with the normals rotated to match. Nothing is rebuilt per frame.
//
// Sliding, and why it matters. Dynein makes doublets slide; the nexin links and the basal-body anchor
// refuse the sliding, and the force goes into a bend. "Show sliding" releases the links, which turns the
// bend off and lets each active doublet telescope out of the bundle instead — the demembranated-axoneme
// experiment that established the mechanism, which is why the membrane goes with the links.
//
// Removing the dynein arms leaves the whole thing limp: bendAmplitudeUm falls to zero, which is primary
// ciliary dyskinesia in one control.
import { ORGANELLE_BY_ID, mix } from '../palette.js';
import {
  THREE, mergeGeometries, clamp, createStage, addButton, addChip, createRig, Orbit, Spin, makeClock,
  createLoop, Labels, Materials, bindInput, observeSize, disposeScene,
} from './lib/three-common.js';
import { colourOf } from './lib/cell3-colours.js';
import { renderInset, insetRect } from './lib/cell3-inset.js';

export const meta = { kind: 'cilium', title: 'The 9+2 axoneme', needsWebGL: true, aspect: 16 / 10 };
export const DEFAULT_VIEW = Object.freeze({ theta: 0.75, phi: 1.22, distance: 47 });

// ---------- dimensions, in units of 100 nm ----------
const LENGTH = 24; // 2.4 µm from the base of the basal body to the tip
const BASAL = 4; // the basal body: 0.4 µm of nine triplets
const TRANS = 6; // the transition zone ends here and the central pair begins
const N_DOUBLET = 9;
const R_RING = 0.90; // the A-tubules sit on a 90 nm radius
const R_A = 0.125; // a microtubule is 25 nm across
const R_B = 0.105; // the B-tubule is incomplete, so a little smaller
const DOUBLET_GAP = 0.215; // centre to centre within a doublet
const DOUBLET_TILT = -0.38; // radians the doublet's long axis leans from the tangent
const CENTRAL_OFF = 0.16; // the two singlets, 32 nm apart
const R_CENTRAL = 0.115;
const SHEATH_R = 0.30;
const R_MEM = 1.25; // the ciliary membrane, 250 nm across
const ARM_REPEAT = 0.24; // a dynein arm every 24 nm
const REPEAT_96 = 0.96; // radial spokes and nexin links on the 96 nm repeat
const SLIDE_MAX = 3.0; // 0.3 µm of telescoping when the links are released

// ---------- the beat ----------
const THETA_MAX = 1.15; // radians of tangent angle at the tip
const LAMBDA = (LENGTH - BASAL) * 1.35; // about one bend wave on the free length
const RAMP = 3.0; // the base is held still over this distance
const BEAT_SLOW = 6; // the beat is shown at a sixth of real speed; the readout gives the real frequency
const BEND_N = 96;
const ZOOM_MIN = 9;
const ZOOM_MAX = 96;
const SPIN_RATE = 0.1;
const NARROW_W = 560;

const Y = new THREE.Vector3(0, 1, 0);
const noUV = (g) => { g.deleteAttribute('uv'); return g; };

// A tube along +y between y0 and y1, offset to (x, z). The height segments are not decoration: the
// bend lives in the vertex shader, so a cylinder with vertices only at its two ends comes out as a
// straight rod between two bent endpoints — which is exactly how the first beating axoneme looked, a
// bundle of bent dynein arms wrapped round nine straight tubules. One ring every 40 nm follows the
// curve smoothly at the amplitudes this figure reaches.
const RINGS_PER_UNIT = 2.5;
function tube(x, z, y0, y1, r, seg = 10) {
  const len = y1 - y0;
  const g = new THREE.CylinderGeometry(r, r, len, seg, Math.max(1, Math.round(len * RINGS_PER_UNIT)), false);
  g.translate(x, (y0 + y1) / 2, z);
  return noUV(g);
}

// A small box from `a` to `b` with the given width and thickness, used for dynein arms and nexin links.
function bar(a, b, w, t) {
  const d = b.clone().sub(a);
  const len = d.length();
  const g = new THREE.BoxGeometry(w, len, t);
  const q = new THREE.Quaternion().setFromUnitVectors(Y, d.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().lerp(b, 0.5), q, new THREE.Vector3(1, 1, 1)));
  return noUV(g);
}

const ringDir = (i) => {
  const a = (i / N_DOUBLET) * Math.PI * 2;
  return { u: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), v: new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), a };
};

// Where the A and B tubules of doublet i sit in the cross-section.
function doubletCentres(i) {
  const { u, v } = ringDir(i);
  const A = u.clone().multiplyScalar(R_RING);
  const lean = v.clone().multiplyScalar(Math.cos(DOUBLET_TILT)).addScaledVector(u, Math.sin(DOUBLET_TILT)).normalize();
  const B = A.clone().addScaledVector(lean, DOUBLET_GAP);
  const C = A.clone().addScaledVector(lean, DOUBLET_GAP * 2);
  return { A, B, C, u, v, lean };
}

export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the 3D cilium could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { error: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const clock = makeClock(ctx.pinnedTime);
  const stage = createStage(root, 'cilium', 'A cilium in 3D. Drag or use the arrow keys to turn it, + and - to zoom; the section slider runs from the tip down to the basal body.');
  const { renderer, wrap, toolbar, scope } = stage;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.4, 400);
  camera.name = 'camera';
  const rig = createRig(scene, camera, ctx.theme);
  const mats = new Materials(ctx.palette.paper);

  // ---------- the bend, as a uniform table every material reads ----------
  const bend = new Float32Array(BEND_N * 4);
  const uBend = { value: bend };
  const uBendLen = { value: 1 / LENGTH };
  const centre = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  let bendAmp = 0;
  const stats = { calls: 0, triangles: 0 }; // the whole frame: the main view plus the section window
  function computeBend(phase, amplitude) {
    const ds = LENGTH / (BEND_N - 1);
    let cx = 0;
    let cy = 0;
    let th = 0;
    let maxX = 0;
    for (let i = 0; i < BEND_N; i += 1) {
      const s = i * ds;
      if (i > 0) {
        cx += Math.sin(th) * ds;
        cy += Math.cos(th) * ds;
      }
      const g = clamp((s - BASAL) / RAMP, 0, 1);
      th = amplitude * g * Math.sin(2 * Math.PI * (s / LAMBDA - phase));
      bend[i * 4] = cx;
      bend[i * 4 + 1] = cy;
      bend[i * 4 + 2] = Math.sin(th);
      bend[i * 4 + 3] = Math.cos(th);
      maxX = Math.max(maxX, Math.abs(cx));
    }
    bendAmp = maxX;
  }
  // The centreline and tangent at height s, read back from the same table the shader uses.
  function frameAt(s) {
    const f = clamp(s / LENGTH, 0, 1) * (BEND_N - 1);
    const i0 = Math.min(BEND_N - 1, Math.floor(f));
    const i1 = Math.min(BEND_N - 1, i0 + 1);
    const t = f - i0;
    const lerp = (k) => bend[i0 * 4 + k] + (bend[i1 * 4 + k] - bend[i0 * 4 + k]) * t;
    centre.set(lerp(0), lerp(1), 0);
    tangent.set(lerp(2), lerp(3), 0).normalize();
    return { centre, tangent };
  }
  // Where a cross-section point (x, z) at height s ends up once the shaft is bent.
  function bentPoint(x, z, s, out = new THREE.Vector3()) {
    const { centre: c, tangent: tg } = frameAt(s);
    return out.set(c.x + x * tg.y, c.y - x * tg.x, z);
  }

  // One vertex patch, applied to every material in the figure: the same bend for the tubules, the arms,
  // the spokes and the membrane, with the normals turned to match. The frame at height s turns by -θ:
  // the local x axis goes to (cos θ, -sin θ) and the tangent to (sin θ, cos θ), and the normal has to
  // turn the same way. The first version turned the normals by +θ, so a strongly bent shaft was lit
  // from the wrong side and rendered near-black on the side facing the key light.
  const BEND_VERT = `
    float bf = clamp(POS.y * uBendLen, 0.0, 1.0) * ${(BEND_N - 1).toFixed(1)};
    int bi0 = int(bf);
    int bi1 = min(bi0 + 1, ${BEND_N - 1});
    vec4 bm = mix(uBend[bi0], uBend[bi1], bf - float(bi0));`;
  function patchBend(m) {
    const inner = m.onBeforeCompile;
    m.onBeforeCompile = (shader) => {
      inner?.(shader);
      shader.uniforms.uBend = uBend;
      shader.uniforms.uBendLen = uBendLen;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\nuniform vec4 uBend[${BEND_N}];\nuniform float uBendLen;`)
        .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n{ ${BEND_VERT.replace(/POS/g, 'position')}\n objectNormal = vec3(objectNormal.x * bm.w + objectNormal.y * bm.z, -objectNormal.x * bm.z + objectNormal.y * bm.w, objectNormal.z); }`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n{ ${BEND_VERT.replace(/POS/g, 'transformed')}\n transformed = vec3(bm.x + transformed.x * bm.w, bm.y - transformed.x * bm.z, transformed.z); }`);
    };
    m.customProgramCacheKey = () => 'tb3d-cilium';
    return m;
  }
  // Double-sided with a darkened back face: the section window cuts these bodies open, and a tube with
  // only front faces shows nothing at all where it is cut — the first section window was nine dynein
  // arms floating in an empty ring because the tubules had no cut face to draw.
  const material = (opts) => patchBend(mats.make({ roughness: 0.55, metalness: 0, side: THREE.DoubleSide, cap: 0.5, ...opts }));

  // ---------- colours ----------
  const COL = {
    tubule: colourOf('microtubule'),
    central: mix(colourOf('microtubule'), ORGANELLE_BY_ID.centrosome.color, 0.65),
    arm: colourOf('motor'),
    spoke: mix(colourOf('intermediateFilament'), '#ffffff', 0.2),
    nexin: ORGANELLE_BY_ID.cytoskeleton.color,
    membrane: ORGANELLE_BY_ID.membrane.color,
    basal: mix(colourOf('microtubule'), ORGANELLE_BY_ID.centrosome.color, 0.45),
  };

  // ---------- geometry ----------
  const matTubule = material({ color: COL.tubule });
  const matCentral = material({ color: COL.central });
  const matArm = material({ color: COL.arm, roughness: 0.45 });
  const matArmHot = material({ color: COL.arm, roughness: 0.4, emissive: new THREE.Color(COL.arm).multiplyScalar(0.55) });
  const matSpoke = material({ color: COL.spoke, roughness: 0.6 });
  const matNexin = material({ color: COL.nexin, roughness: 0.6 });
  const matBasal = material({ color: COL.basal });
  const memOpts = { color: COL.membrane, transparent: true, opacity: 0.24, depthWrite: false, roughness: 0.3, cap: 1, fresnel: [0.1, 0.72, 2.3] };
  const matMemIn = material({ ...memOpts, side: THREE.BackSide });
  const matMemOut = material({ ...memOpts, side: THREE.FrontSide });

  const add = (geom, mat, name, parent = scene) => {
    const m = new THREE.Mesh(geom, mat);
    m.name = name;
    parent.add(m);
    return m;
  };

  // Nine doublets, each its own set of meshes so a released axoneme can slide them past one another.
  const doublets = [];
  for (let i = 0; i < N_DOUBLET; i += 1) {
    const { A, B, u, lean } = doubletCentres(i);
    const next = doubletCentres((i + 1) % N_DOUBLET);
    const g = new THREE.Group();
    g.name = `doublet-${i + 1}`;
    scene.add(g);

    const tubes = [tube(A.x, A.z, 0, LENGTH, R_A, 12), tube(B.x, B.z, 0, LENGTH, R_B, 10)];
    const tubulesMesh = add(mergeGeometries(tubes), matTubule, `doublet-${i + 1}-tubules`, g);

    // Dynein arms: from the A-tubule of this doublet toward the B-tubule of the next, every 24 nm, in
    // two rows (the outer and the inner arm).
    const arms = [];
    for (let s = BASAL + 0.3; s < LENGTH - 0.4; s += ARM_REPEAT) {
      for (const [row, off] of [[0, 0], [1, ARM_REPEAT / 2]]) {
        const from = new THREE.Vector3(A.x, s + off, A.z).addScaledVector(lean, R_A * (row ? 0.2 : 0.9));
        const toward = new THREE.Vector3(next.B.x, s + off, next.B.z);
        const dir = toward.clone().sub(from).setY(0).normalize();
        const to = from.clone().addScaledVector(dir, row ? 0.20 : 0.26);
        arms.push(bar(from, to, 0.055, 0.075));
      }
    }
    const armsMesh = add(mergeGeometries(arms), matArm, `doublet-${i + 1}-dynein-arms`, g);

    // Radial spokes: from the A-tubule inward to the central sheath, on the 96 nm repeat, in the pairs
    // a real axoneme has.
    const spokes = [];
    for (let s = TRANS + 0.5; s < LENGTH - 0.6; s += REPEAT_96) {
      for (const off of [0, 0.32]) {
        const from = new THREE.Vector3(A.x, s + off, A.z).addScaledVector(u, -R_A * 0.8);
        const to = u.clone().multiplyScalar(SHEATH_R).setY(s + off);
        spokes.push(bar(from, to, 0.045, 0.045));
        const head = new THREE.SphereGeometry(0.055, 8, 6);
        head.translate(to.x, to.y, to.z);
        spokes.push(noUV(head));
      }
    }
    const spokesMesh = add(mergeGeometries(spokes), matSpoke, `doublet-${i + 1}-radial-spokes`, g);

    // Nexin links: the elastic tie between this doublet and the next.
    const links = [];
    for (let s = BASAL + 0.6; s < LENGTH - 0.5; s += REPEAT_96) {
      const from = new THREE.Vector3(B.x, s, B.z);
      const to = new THREE.Vector3(next.A.x, s + 0.12, next.A.z);
      links.push(bar(from, to, 0.05, 0.05));
    }
    const nexinMesh = add(mergeGeometries(links), matNexin, `doublet-${i + 1}-nexin-links`, g);

    doublets.push({ group: g, tubules: tubulesMesh, arms: armsMesh, spokes: spokesMesh, nexin: nexinMesh, A, B, u, lean });
  }

  // The basal body: the C-tubule completes each triplet over the bottom 0.4 µm, on a cartwheel.
  {
    const parts = [];
    for (let i = 0; i < N_DOUBLET; i += 1) {
      const { C, A } = doubletCentres(i);
      parts.push(tube(C.x, C.z, 0, BASAL, R_B, 10));
      // A cartwheel spoke from the hub to each triplet, at the very base.
      parts.push(bar(new THREE.Vector3(0, 0.55, 0), new THREE.Vector3(A.x, 0.55, A.z), 0.05, 0.05));
      parts.push(bar(new THREE.Vector3(0, 1.35, 0), new THREE.Vector3(A.x, 1.35, A.z), 0.05, 0.05));
    }
    parts.push(tube(0, 0, 0.25, 1.65, 0.11, 12)); // the hub
    add(mergeGeometries(parts), matBasal, 'basal-body');
  }

  // The central pair and its sheath, from the top of the transition zone to the tip.
  const centralGroup = new THREE.Group();
  centralGroup.name = 'central-pair';
  scene.add(centralGroup);
  {
    const pair = [tube(-CENTRAL_OFF, 0, TRANS, LENGTH - 0.4, R_CENTRAL, 12), tube(CENTRAL_OFF, 0, TRANS, LENGTH - 0.4, R_CENTRAL, 12)];
    add(mergeGeometries(pair), matCentral, 'central-singlets', centralGroup);
    const sheath = [];
    for (let s = TRANS + 0.3; s < LENGTH - 0.6; s += REPEAT_96 / 2) {
      const ring = new THREE.TorusGeometry(SHEATH_R * 0.82, 0.035, 6, 20);
      ring.rotateX(Math.PI / 2);
      ring.translate(0, s, 0);
      sheath.push(noUV(ring));
    }
    add(mergeGeometries(sheath), matSpoke, 'central-sheath', centralGroup);
  }

  // The ciliary membrane, and the patch of cell surface it grows out of.
  const memGroup = new THREE.Group();
  memGroup.name = 'membrane';
  scene.add(memGroup);
  {
    const shaft = new THREE.CylinderGeometry(R_MEM, R_MEM, LENGTH - BASAL + 0.6, 40, Math.round((LENGTH - BASAL) * RINGS_PER_UNIT), true);
    shaft.translate(0, BASAL - 0.3 + (LENGTH - BASAL + 0.6) / 2, 0);
    const tip = new THREE.SphereGeometry(R_MEM, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    tip.translate(0, LENGTH + 0.3, 0);
    const skin = mergeGeometries([noUV(shaft), noUV(tip)]);
    add(skin, matMemIn, 'ciliary-membrane-inner', memGroup).renderOrder = 1;
    add(skin, matMemOut, 'ciliary-membrane-outer', memGroup).renderOrder = 4;
    const surface = new THREE.CylinderGeometry(6.5, 6.5, 0.22, 56, 1, false);
    surface.translate(0, BASAL - 0.5, 0);
    add(noUV(surface), matMemOut, 'cell-surface', memGroup);
  }

  // The cut faces. A tubule is a hollow surface, so a thin section through it has no area and the
  // section window showed nine dynein arms floating in an empty ring. These are the faces the cut makes:
  // one annulus per tubule with a 5 nm wall and a lumen, which is what a microtubule looks like in an
  // electron micrograph. They are placed on the bent centreline by hand and drawn in the section window
  // only. The arms, spokes, links and sheath need none of this: they lie across the section rather than
  // along it, so the slab sees them whole.
  const cutGroup = new THREE.Group();
  cutGroup.name = 'cut-faces';
  scene.add(cutGroup);
  const annulus = (r) => {
    const g = new THREE.RingGeometry(Math.max(0.02, r - 0.05), r, 20);
    g.rotateX(-Math.PI / 2);
    return noUV(g);
  };
  const matCut = mats.make({ color: COL.tubule, roughness: 0.5, metalness: 0, side: THREE.DoubleSide });
  const matCutCentral = mats.make({ color: COL.central, roughness: 0.5, metalness: 0, side: THREE.DoubleSide });
  const matCutBasal = mats.make({ color: COL.basal, roughness: 0.5, metalness: 0, side: THREE.DoubleSide });
  let cutAB;
  let cutC;
  let cutCentral;
  {
    const ab = [];
    const cc = [];
    for (let i = 0; i < N_DOUBLET; i += 1) {
      const { A, B, C } = doubletCentres(i);
      const a = annulus(R_A);
      a.translate(A.x, 0, A.z);
      const b = annulus(R_B);
      b.translate(B.x, 0, B.z);
      ab.push(a, b);
      const c = annulus(R_B);
      c.translate(C.x, 0, C.z);
      cc.push(c);
    }
    cutAB = add(mergeGeometries(ab), matCut, 'cut-doublets', cutGroup);
    cutC = add(mergeGeometries(cc), matCutBasal, 'cut-c-tubules', cutGroup);
    const pair = [annulus(R_CENTRAL), annulus(R_CENTRAL)];
    pair[0].translate(-CENTRAL_OFF, 0, 0);
    pair[1].translate(CENTRAL_OFF, 0, 0);
    cutCentral = add(mergeGeometries(pair), matCutCentral, 'cut-central-pair', cutGroup);
  }

  // The marker showing where the section plane is, in the main view.
  const markerGeom = new THREE.TorusGeometry(R_MEM + 0.16, 0.055, 8, 48);
  markerGeom.rotateX(Math.PI / 2);
  const matMarker = mats.make({ color: ctx.palette.gold, emissive: new THREE.Color(ctx.palette.gold).multiplyScalar(0.35), roughness: 0.4, metalness: 0 });
  const marker = add(noUV(markerGeom), matMarker, 'section-marker');

  // ---------- state ----------
  const orbit = new Orbit(DEFAULT_VIEW, ZOOM_MIN, ZOOM_MAX, new THREE.Vector3(0, LENGTH * 0.48, 0));
  const view0 = () => ({ ...DEFAULT_VIEW, distance: DEFAULT_VIEW.distance * (narrow ? 1.3 : 1) });
  const spin = new Spin(reduced ? 0 : SPIN_RATE);
  let W = 1;
  let H = 1;
  let narrow = false;
  let mode = 'motile';
  let beating = false;
  let beatHz = 12;
  let armsOn = true;
  let sliding = false;
  let sectionUm = 1.2; // where the section plane sits, in micrometres from the base of the basal body
  // On a phone the labels cover the cilium, so they start off and the button brings them back — the
  // section window is what a narrow stage has room to read.
  let labelsOn = root.clientWidth >= NARROW_W;
  let labelsShown = 0;

  const sectionUnits = () => sectionUm * 10;
  const regionAt = (s) => (s < BASAL ? 'basal-body' : s < TRANS ? 'transition' : 'shaft');
  const arrangementAt = (s) => {
    if (s < BASAL) return '9 triplets';
    if (s < TRANS || mode === 'primary') return '9+0';
    return '9+2';
  };
  const hasCentral = () => mode === 'motile' && sectionUnits() >= TRANS;
  const canBeat = () => mode === 'motile' && armsOn;
  const phaseNow = () => {
    if (!beating || !canBeat()) return 0;
    if (reduced || clock.pinned) {
      if (reduced && !clock.pinned) return 0.22;
      return ((clock.now() * beatHz) / BEAT_SLOW) % 1;
    }
    return ((clock.now() * beatHz) / BEAT_SLOW) % 1;
  };
  const strokeNow = (phase) => {
    if (!beating || !canBeat() || sliding) return 'none';
    return Math.cos(2 * Math.PI * phase) >= 0 ? 'effective' : 'recovery';
  };
  const activeNow = (phase) => {
    if (!beating || !canBeat()) return [];
    return Math.cos(2 * Math.PI * phase) >= 0 ? [2, 3, 4] : [7, 8, 9];
  };

  // ---------- labels ----------
  const labels = new Labels(stage.labelsEl, stage.svg);
  const LABELS = [
    ['doublet', 'Outer doublet', COL.tubule],
    ['central', 'Central pair', COL.central],
    ['spoke', 'Radial spoke', COL.spoke],
    ['nexin', 'Nexin link', COL.nexin],
    ['arm', 'Dynein arm', COL.arm],
    ['basal', 'Basal body · nine triplets', COL.basal],
    ['membrane', 'Ciliary membrane', COL.membrane],
  ];
  for (const [id, txt, color] of LABELS) labels.add(id, txt, { color });
  const NARROW_KEEP = new Set(['doublet', 'central', 'arm', 'basal']);
  const tmp = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();

  function updateLabels() {
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    // The doublet nearest the camera, so a label never points through the bundle.
    let best = 0;
    let bestDot = -Infinity;
    tmp.copy(camera.position).setY(0).normalize();
    for (let i = 0; i < N_DOUBLET; i += 1) {
      const A = doubletCentres(i).A;
      const d = (A.x * tmp.x + A.z * tmp.z) * 0.8 + (A.x * right.x + A.z * right.z) * 0.5;
      if (d > bestDot) { bestDot = d; best = i; }
    }
    const { A, u, lean } = doubletCentres(best);
    const sMid = clamp(sectionUnits(), TRANS + 1.5, LENGTH - 4);
    const at = (f) => TRANS + (LENGTH - TRANS) * f;
    const put = (id, p, dx, dy) => labels.set(id, p, dx, dy);
    const shown = new Set();
    const keep = (id) => (!narrow || NARROW_KEEP.has(id)) && labelsOn;

    if (keep('doublet')) { put('doublet', bentPoint(A.x, A.z, at(0.52), new THREE.Vector3()), 78, 0); shown.add('doublet'); } else labels.set('doublet', null);
    if (keep('central') && hasCentral() && !sliding) { put('central', bentPoint(CENTRAL_OFF, 0, at(0.70), new THREE.Vector3()), -78, 0); shown.add('central'); } else labels.set('central', null);
    if (keep('spoke') && mode === 'motile' && !narrow) { put('spoke', bentPoint(A.x * 0.5, A.z * 0.5, at(0.30), new THREE.Vector3()), -80, 0); shown.add('spoke'); } else labels.set('spoke', null);
    if (keep('nexin') && !sliding) { put('nexin', bentPoint(A.x * 1.06, A.z * 1.06, at(0.86), new THREE.Vector3()), 76, 0); shown.add('nexin'); } else labels.set('nexin', null);
    if (keep('arm') && armsOn && mode === 'motile') { put('arm', bentPoint(A.x * 1.12, A.z * 1.12, at(0.16), new THREE.Vector3()), 80, 0); shown.add('arm'); } else labels.set('arm', null);
    if (keep('basal')) { put('basal', tmp.set(A.x * 1.15, BASAL * 0.45, A.z * 1.15).clone(), -84, 6); shown.add('basal'); } else labels.set('basal', null);
    if (keep('membrane') && !sliding && !narrow) { put('membrane', bentPoint(R_MEM * 0.92, R_MEM * 0.38, LENGTH - 1.6, new THREE.Vector3()), 84, -8); shown.add('membrane'); } else labels.set('membrane', null);
    void sMid;
    void u; void lean;
    labelsShown = shown.size;
  }

  // ---------- the section window ----------
  const sectionScene = scene; // the same bodies, seen from a second camera through a thin slab
  const sectionCam = new THREE.OrthographicCamera(-1.42, 1.42, 1.42, -1.42, 0.60, 0.84);
  sectionCam.name = 'section-camera';
  const sectionLight = new THREE.DirectionalLight(0xfff3e4, 2.2);
  sectionLight.position.set(-0.5, 0.5, 1);
  const sectionFill = new THREE.DirectionalLight(0xdce8ff, 0.8);
  sectionFill.position.set(0.8, -0.4, 0.6);
  sectionCam.add(sectionLight, sectionFill);
  scene.add(sectionCam);
  const frameBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  frameBox.setAttribute('rx', '10');
  frameBox.setAttribute('fill', 'none');
  stage.svg.append(frameBox);
  const caption = document.createElement('div');
  caption.className = 'fig-label cl-caption';
  stage.labelsEl.append(caption);
  const style = document.createElement('style');
  style.textContent = `
    .cl-caption { position: absolute; white-space: nowrap; transform: translate(-50%, 0); }
    .cl-slider { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.6rem 0.2rem 0.5rem; }
    .cl-slider input { width: 6rem; accent-color: var(--leaf); }
    .cl-slider span { min-width: 4.4rem; color: var(--ink); font-weight: 600;
      font-variant-numeric: lining-nums tabular-nums; }
    .tb-cilium-narrow .cl-slider input { width: 3.6rem; }
    .tb-cilium-narrow .cl-slider span { min-width: 3.4rem; font-size: 0.68rem; }
    .tb-cilium-narrow .fig-btn { padding: 0.26rem 0.5rem; font-size: 0.7rem; }
    .tb-cilium-narrow .fig-toolbar { gap: 0.3rem; }
  `;
  root.append(style);

  let rect = { x: 0, y: 0, w: 120, h: 120 };
  function placeSection() {
    rect = insetRect(W, H, { corner: 'top-right', margin: 10, min: 96, max: 230, fraction: narrow ? 0.4 : 0.4 });
    frameBox.setAttribute('x', rect.x);
    frameBox.setAttribute('y', rect.y);
    frameBox.setAttribute('width', rect.w);
    frameBox.setAttribute('height', rect.h);
    frameBox.setAttribute('stroke', 'var(--rule-strong)');
    frameBox.setAttribute('stroke-width', '1');
    caption.style.left = `${rect.x + rect.w / 2}px`;
    caption.style.top = `${rect.y + rect.h + 6}px`;
  }
  function aimSection() {
    const s = sectionUnits();
    const { centre: c, tangent: tg } = frameAt(s);
    sectionCam.position.set(c.x + tg.x * 0.72, c.y + tg.y * 0.72, 0);
    sectionCam.up.set(0, 0, 1);
    sectionCam.lookAt(c.x, c.y, 0);
    sectionCam.updateMatrixWorld();
    caption.textContent = `Section at ${sectionUm.toFixed(1)} µm · ${arrangementAt(s)}`;
  }

  // ---------- per-frame update ----------
  function apply() {
    const phase = phaseNow();
    const amp = beating && canBeat() && !sliding ? THETA_MAX : 0;
    computeBend(phase, amp);
    if (!amp) bendAmp = 0;
    const active = activeNow(phase);
    const slideOn = sliding && beating && canBeat();
    const S = slideOn ? SLIDE_MAX * (0.5 - 0.5 * Math.cos(2 * Math.PI * phase)) : 0;
    for (let i = 0; i < N_DOUBLET; i += 1) {
      const d = doublets[i];
      const hot = active.includes(i + 1);
      d.arms.visible = armsOn && mode === 'motile';
      d.arms.material = hot ? matArmHot : matArm;
      d.spokes.visible = mode === 'motile';
      d.nexin.visible = !sliding;
      // Released, the doublets the arms are pushing on telescope out of the bundle instead of bending.
      d.group.position.y = slideOn && hot ? S : 0;
    }
    centralGroup.visible = mode === 'motile';
    memGroup.visible = !sliding;
    const s = sectionUnits();
    const { centre: c, tangent: tg } = frameAt(s);
    marker.position.copy(c);
    marker.quaternion.setFromUnitVectors(Y, tg);
    cutGroup.position.copy(c);
    cutGroup.quaternion.copy(marker.quaternion);
    cutC.visible = s < BASAL;
    cutCentral.visible = hasCentral();
    void tg;
  }

  function render() {
    orbit.apply(camera, spin.angle(clock.now()));
    apply();
    aimSection();
    updateLabels();
    labels.update(camera, W, H, bottomPad);
    // The section camera carries its own two lights, so it is hidden — and with it its children — while
    // the main view renders, or the axoneme would be lit twice.
    sectionCam.visible = false;
    cutGroup.visible = false;
    renderer.render(scene, camera);
    // renderer.info resets itself at the start of every render, so the main view's cost has to be taken
    // before the section window is drawn or describe() would report the inset alone.
    const mainCalls = renderer.info.render.calls;
    const mainTris = renderer.info.render.triangles;
    sectionCam.visible = true;
    marker.visible = false;
    cutGroup.visible = true;
    renderInset(renderer, sectionScene, sectionCam, rect);
    marker.visible = true;
    cutGroup.visible = false;
    stats.calls = mainCalls + renderer.info.render.calls;
    stats.triangles = mainTris + renderer.info.render.triangles;
  }

  function step(dt) {
    const moving = orbit.step(dt, reduced);
    const running = beating && canBeat() && !reduced && !clock.pinned;
    return moving || running || (spin.rate > 0 && !spin.held && !clock.pinned);
  }
  const loop = createLoop(step, render);

  // ---------- controls ----------
  const btnMode = addButton(toolbar, 'Primary', () => {
    mode = mode === 'motile' ? 'primary' : 'motile';
    btnMode.setAttribute('aria-pressed', String(mode === 'primary'));
    if (mode === 'primary') { beating = false; btnBeat.setAttribute('aria-pressed', 'false'); }
    btnBeat.disabled = mode === 'primary';
    showNote();
    loop.invalidate();
    loop.kick();
  }, false);
  btnMode.setAttribute('aria-label', 'Primary cilium: nine doublets, no central pair and no dynein arms');
  const btnBeat = addButton(toolbar, 'Beat', () => {
    beating = !beating;
    btnBeat.setAttribute('aria-pressed', String(beating));
    showNote();
    loop.invalidate();
    loop.kick();
  }, false);
  const hzBox = document.createElement('label');
  hzBox.className = `fig-chip ${scope}-chip cl-slider`;
  const hzRange = document.createElement('input');
  hzRange.type = 'range';
  hzRange.className = 'fig-range';
  hzRange.min = '1';
  hzRange.max = '20';
  hzRange.step = '1';
  hzRange.value = String(beatHz);
  hzRange.setAttribute('aria-label', 'Beat frequency, 1 to 20 hertz');
  const hzVal = document.createElement('span');
  hzBox.append(hzRange, hzVal);
  toolbar.append(hzBox);
  hzRange.addEventListener('input', () => {
    beatHz = Number(hzRange.value);
    hzVal.textContent = `${beatHz} Hz`;
    loop.invalidate();
    loop.kick();
  });
  const btnArms = addButton(toolbar, 'Dynein arms', () => {
    armsOn = !armsOn;
    btnArms.setAttribute('aria-pressed', String(armsOn));
    showNote();
    loop.invalidate();
    loop.kick();
  }, true);
  const btnSlide = addButton(toolbar, 'Show sliding', () => {
    sliding = !sliding;
    btnSlide.setAttribute('aria-pressed', String(sliding));
    if (sliding && !beating) { beating = true; btnBeat.setAttribute('aria-pressed', 'true'); }
    showNote();
    loop.invalidate();
    loop.kick();
  }, false);
  const secBox = document.createElement('label');
  secBox.className = `fig-chip ${scope}-chip cl-slider`;
  const secRange = document.createElement('input');
  secRange.type = 'range';
  secRange.className = 'fig-range';
  secRange.min = '0';
  secRange.max = String(Math.round(LENGTH * 10) - 1);
  secRange.step = '1';
  secRange.value = String(Math.round(sectionUm * 100));
  secRange.setAttribute('aria-label', 'Section height, from the basal body at the bottom to the tip');
  const secVal = document.createElement('span');
  secBox.append(secRange, secVal);
  toolbar.append(secBox);
  secRange.addEventListener('input', () => {
    sectionUm = Number(secRange.value) / 100;
    updateSectionText();
    loop.invalidate();
  });
  const btnLabels = addButton(toolbar, 'Labels', () => {
    labelsOn = !labelsOn;
    btnLabels.setAttribute('aria-pressed', String(labelsOn));
    labels.setGroup('main', labelsOn);
    loop.invalidate();
  }, true);
  labels.setGroup('main', labelsOn);
  const btnReset = addButton(toolbar, 'Reset view', () => {
    spin.fold(orbit, clock.now());
    if (reduced || clock.pinned) orbit.set(view0());
    else Object.assign(orbit.goal, view0());
    loop.invalidate();
  });
  const chip = addChip(toolbar, '', scope);

  function updateSectionText() {
    const s = sectionUnits();
    secVal.textContent = `${sectionUm.toFixed(1)} µm`;
    hzVal.textContent = `${beatHz} Hz`;
    chip.textContent = narrow
      ? `${arrangementAt(s)} · 1/${BEAT_SLOW} speed`
      : `1 unit = 100 nm · shaft 2.4 µm · the beat is shown at 1/${BEAT_SLOW} of real speed`;
  }

  function showNote() {
    updateSectionText();
    if (sliding) {
      stage.showCard('Sliding, not bending', 'The nexin links are released and the membrane is off, as in the experiment. Dynein still walks, so the doublets it drives telescope out of the bundle instead of the axoneme bending.', 'Put the links back to turn sliding into a bend.');
      return;
    }
    if (mode === 'primary') {
      stage.showCard('A primary cilium', 'Nine doublets, no central pair, no radial spokes and no dynein arms. It cannot beat. Almost every cell in your body has one, and it works as an antenna: it carries receptors, and several signalling pathways are read there.');
      return;
    }
    if (!armsOn) {
      stage.showCard('No dynein arms', 'Nothing generates sliding, so nothing generates a bend and the cilium is limp. That is primary ciliary dyskinesia: mucus is not cleared, sperm cannot swim, and in about half of those affected the internal organs are reversed left to right.');
      return;
    }
    if (beating && narrow) { stage.hideCard(); return; }
    if (beating) {
      stage.showCard('Sliding becomes bending', 'Dynein arms on one side of the ring walk on the neighbouring doublet and try to slide it. The nexin links and the anchor at the basal body refuse the sliding, so the force has nowhere to go but into a bend, and the bend travels from base to tip.');
      return;
    }
    stage.hideCard();
  }

  bindInput(wrap, {
    onDrag(dx, dy) { spin.fold(orbit, clock.now()); orbit.drag(dx, dy); loop.invalidate(); },
    onZoom(f) { spin.fold(orbit, clock.now()); orbit.zoom(f); loop.invalidate(); },
    onClick() {},
    onEscape() { stage.hideCard(); },
  });

  // ---------- sizing ----------
  let bottomPad = 52;
  const measurePad = () => { bottomPad = Math.max(52, toolbar.offsetHeight + 14); };
  const unobserve = observeSize(root, (w, h) => {
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wantNarrow = w < NARROW_W;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      root.classList.toggle('tb-cilium-narrow', narrow);
      btnArms.textContent = narrow ? 'Arms' : 'Dynein arms';
      btnSlide.textContent = narrow ? 'Sliding' : 'Show sliding';
      btnReset.textContent = narrow ? 'Reset' : 'Reset view';
      labelsOn = !narrow;
      btnLabels.setAttribute('aria-pressed', String(labelsOn));
      labels.setGroup('main', labelsOn);
      orbit.set(view0());
    }
    // On a phone the toolbar wraps to three rows and the section window takes the top-right corner,
    // so the free room is the left two thirds above the toolbar. The projection is panned so the
    // shaft's middle lands there rather than at the stage centre, where the basal body sat under the
    // sliders. A view offset moves the picture, not the orbit, so turning the cilium keeps it in place.
    if (narrow) camera.setViewOffset(w, h, 0.19 * w, 0.165 * h, w, h);
    else camera.clearViewOffset();
    placeSection();
    measurePad();
    labels.measure();
    loop.invalidate();
  });
  let alive = true;
  document.fonts?.ready.then(() => { if (alive) { measurePad(); labels.measure(); loop.invalidate(); } });

  updateSectionText();
  computeBend(0, 0);
  placeSection();
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
      render();
    },
    setVisible(v) { loop.setVisible(v); },
    setTheme(theme, palette) {
      mats.setPaper(palette.paper);
      rig.setTheme(theme);
      matMarker.color.set(palette.gold);
      matMarker.emissive.set(palette.gold).multiplyScalar(0.35);
      render();
    },
    setView(view) {
      spin.fold(orbit, clock.now());
      orbit.set(view);
      render();
    },
    describe() {
      const s = sectionUnits();
      const phase = phaseNow();
      return {
        mode,
        arrangement: arrangementAt(s),
        sectionUm: Number(sectionUm.toFixed(2)),
        region: regionAt(s),
        centralPair: hasCentral(),
        doublets: N_DOUBLET,
        dyneinArms: armsOn && mode === 'motile',
        nexinLinks: !sliding,
        beating: beating && canBeat(),
        beatHz,
        phase: Number(phase.toFixed(3)),
        activeDoublets: activeNow(phase),
        stroke: strokeNow(phase),
        bendAmplitudeUm: Number((bendAmp * 0.1).toFixed(3)),
        labels: labelsOn,
        labelsShown,
        view: orbit.view(spin.angle(clock.now())),
        drawCalls: stats.calls,
        triangles: stats.triangles,
      };
    },
  };
}
