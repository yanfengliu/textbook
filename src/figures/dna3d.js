// The double helix in 3D: B-DNA, right-handed, 2.0 nm across, 3.4 nm per turn and 10.5 base pairs per
// turn (so a rise of 0.324 nm per base pair), 32 base pairs, about three turns. These are the numbers the
// chapter's caption states; the classic 0.34 nm rise with 10 per turn gives the same pitch.
// 1 scene unit = 1 nm; the helix axis is +y and the model is centred on the origin. Two antiparallel
// sugar-phosphate backbones are smooth tubes; each base pair is two half-rungs coloured by base (BASES in
// palette.js) that meet at the axis around a gap holding the hydrogen bonds (two for A-T, three for G-C).
// The two backbones sit 129° apart across the minor groove, so the major and minor grooves come out of
// the geometry rather than being drawn.
import { BASES, mix } from '../palette.js';
import {
  THREE, mergeGeometries, clamp, createStage, addButton, addChip, createRig, Orbit, Spin, makeClock, createLoop,
  Labels, Materials, bindInput, pickAt, observeSize, disposeScene,
} from './lib/three-common.js';

export const meta = { kind: 'dna3d', title: 'The double helix', needsWebGL: true, aspect: 16 / 9 };
export const DEFAULT_VIEW = Object.freeze({ theta: 0.5, phi: 1.25, distance: 26 });
// The front strand, read 5' to 3' (bottom to top). Fixed, so every run shows the same molecule.
export const SEQUENCE = 'ATGGCTAGCCTTAGCGAATCGGCATTACCGTA';

const BP = SEQUENCE.length;
const PITCH = 3.4; // nm per turn
const BP_PER_TURN = 10.5;
const RISE = PITCH / BP_PER_TURN; // nm per base pair
const RADIUS = 1.0; // nm: the backbone helix radius (2 nm diameter)
const K = (2 * Math.PI) / PITCH; // rad of twist per nm of rise
const GROOVE = 2.25; // rad between the two backbones across the minor groove (~129°)
const TUBE_R = 0.2;
const HEIGHT = (BP - 1) * RISE;
const Y0 = -HEIGHT / 2;
const ZOOM_MIN = 8;
const ZOOM_MAX = 60;
const SPIN_RATE = 0.18;
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);

const COMPLEMENT = [...SEQUENCE].map((b) => BASES[b].pairsWith).join('');
const bondsOf = (b) => (b === 'A' || b === 'T' ? 2 : 3);

// A point on backbone `strand` (0 = front strand, 1 = its partner) at height y; the angle grows with y,
// so the helix is right-handed.
function strandPoint(strand, y, radius, out = new THREE.Vector3()) {
  const a = K * (y - Y0) + (strand === 1 ? GROOVE : 0);
  return out.set(radius * Math.sin(a), y, radius * Math.cos(a));
}

class Helix extends THREE.Curve {
  constructor(strand, y0, y1) {
    super();
    this.strand = strand;
    this.y0 = y0;
    this.y1 = y1;
  }

  getPoint(t, out = new THREE.Vector3()) {
    return strandPoint(this.strand, this.y0 + (this.y1 - this.y0) * t, RADIUS, out);
  }
}

export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the 3D double helix could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { error: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const clock = makeClock(ctx.pinnedTime);
  const stage = createStage(root, 'dna3d', 'A DNA double helix in 3D. Drag or use the arrow keys to orbit, + and - to zoom; point at a base pair to read how it pairs.');
  const { renderer, wrap, toolbar, scope } = stage;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.5, 200);
  camera.name = 'camera';
  const rig = createRig(scene, camera, ctx.theme);
  const mats = new Materials(ctx.palette.paper);
  const strandMats = [
    mats.make({ color: ctx.palette.inkSoft, roughness: 0.55, metalness: 0 }),
    mats.make({ color: mix(ctx.palette.inkSoft, ctx.palette.paper, 0.5), roughness: 0.55, metalness: 0 }),
  ];

  // Backbones with their end cones, one merged mesh per strand.
  const yLo = Y0 - 0.3;
  const yHi = Y0 + HEIGHT + 0.3;
  const ends = []; // { strand, prime, pos, dir }
  for (const strand of [0, 1]) {
    const curve = new Helix(strand, yLo, yHi);
    const tube = new THREE.TubeGeometry(curve, 360, TUBE_R, 12, false);
    tube.deleteAttribute('uv');
    const pieces = [tube];
    for (const t of [0, 1]) {
      const p = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const dir = strand === 0 ? tangent : tangent.negate(); // 5' -> 3' runs up the front strand, down the other
      const isFive = (t === 0) === (strand === 0);
      const cone = new THREE.ConeGeometry(0.34, 0.6, 20);
      cone.deleteAttribute('uv');
      const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
      const centre = p.clone().addScaledVector(dir, isFive ? -0.3 : 0.3);
      cone.applyMatrix4(new THREE.Matrix4().compose(centre, q, ONE));
      pieces.push(cone);
      ends.push({ strand, prime: isFive ? '5′' : '3′', pos: p.clone().addScaledVector(dir, isFive ? -0.6 : 0.6), top: p.y > 0 });
    }
    const mesh = new THREE.Mesh(mergeGeometries(pieces), strandMats[strand]);
    mesh.name = strand === 0 ? 'backbone-front' : 'backbone-partner';
    scene.add(mesh);
  }

  // Base pairs: 64 half-rung slabs in one instanced mesh, coloured per instance by base.
  const slabLen = 0.81;
  const slabGeom = new THREE.CapsuleGeometry(0.24, slabLen - 0.48, 4, 14);
  slabGeom.rotateZ(-Math.PI / 2);
  slabGeom.scale(1, 0.5, 1);
  slabGeom.deleteAttribute('uv');
  const slabMat = mats.make({ color: 0xffffff, roughness: 0.5, metalness: 0 });
  const slabs = new THREE.InstancedMesh(slabGeom, slabMat, BP * 2);
  slabs.name = 'base-pairs';
  const baseColours = [];
  const slabPose = []; // { pos, quat } per half-rung, so a selected pair can be re-posed thicker
  {
    const q = new THREE.Quaternion();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    for (let p = 0; p < BP; p += 1) {
      const y = Y0 + p * RISE;
      for (const strand of [0, 1]) {
        strandPoint(strand, y, 0.98, a);
        strandPoint(strand, y, 0.17, b);
        const dir = b.clone().sub(a).normalize();
        q.setFromUnitVectors(X, dir);
        const i = p * 2 + strand;
        slabPose[i] = { pos: a.clone().lerp(b, 0.5), quat: q.clone() };
        baseColours[i] = new THREE.Color(BASES[strand === 0 ? SEQUENCE[p] : COMPLEMENT[p]].color);
      }
    }
  }
  scene.add(slabs);

  // Hydrogen bonds: two or three small spheres stacked in the gap at the axis.
  const bondCount = [...SEQUENCE].reduce((n, b) => n + bondsOf(b), 0);
  const bondMat = mats.make({ color: ctx.palette.ink, roughness: 0.6, metalness: 0 });
  const bonds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), bondMat, bondCount);
  bonds.name = 'hydrogen-bonds';
  {
    const m4 = new THREE.Matrix4();
    let i = 0;
    for (let p = 0; p < BP; p += 1) {
      const n = bondsOf(SEQUENCE[p]);
      for (let k = 0; k < n; k += 1) bonds.setMatrixAt(i++, m4.makeTranslation(0, Y0 + p * RISE + (k - (n - 1) / 2) * 0.095, 0));
    }
  }
  bonds.instanceMatrix.needsUpdate = true;
  bonds.computeBoundingSphere();
  scene.add(bonds);

  // ---------- labels ----------
  const labels = new Labels(stage.labelsEl, stage.svg);
  labels.add('backbone', 'Sugar–phosphate backbone');
  labels.add('pair', 'Base pair');
  labels.add('major', 'Major groove');
  labels.add('minor', 'Minor groove');
  labels.add('pitch', `${PITCH} nm per turn`, { leader: false });
  labels.add('width', '2 nm across', { leader: false });
  ends.forEach((e, i) => labels.add(`end${i}`, e.prime, { group: 'ends' }));
  const bracket = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  stage.svg.append(bracket);
  const camDir = new THREE.Vector3();
  const right = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const project = (v, out) => { out.copy(v).project(camera); out.x = ((out.x + 1) / 2) * W; out.y = ((1 - out.y) / 2) * H; return out; };
  const s0 = new THREE.Vector3();
  const s1 = new THREE.Vector3();
  const sEnd = new THREE.Vector3();
  // The height at which the helical feature with angle offset `off` from the front strand faces the camera,
  // choosing the turn nearest `yTarget`.
  function facingY(off, yTarget) {
    const thetaCam = Math.atan2(camDir.x, camDir.z);
    const base = (thetaCam - off) / K + Y0;
    return clamp(base + Math.round((yTarget - base) / PITCH) * PITCH, Y0 + 0.3, Y0 + HEIGHT - 0.3);
  }
  function updateLabels() {
    camDir.copy(camera.position).normalize();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    const thetaCam = Math.atan2(camDir.x, camDir.z);
    let y = facingY(0, 2.6);
    labels.set('backbone', strandPoint(0, y, RADIUS + 0.12, anchor), 96, -34);
    y = facingY(Math.PI / 2, -1.2);
    const p = selectedPair() ?? clamp(Math.round((y - Y0) / RISE), 0, BP - 1);
    labels.set('pair', strandPoint(0, Y0 + p * RISE, 0.58, anchor), -96, 0);
    y = facingY(Math.PI + GROOVE / 2, 0.6);
    labels.set('major', anchor.set(0.72 * Math.sin(thetaCam), y, 0.72 * Math.cos(thetaCam)), 104, 0);
    y = facingY(GROOVE / 2, -2.8);
    labels.set('minor', anchor.set(0.72 * Math.sin(thetaCam), y, 0.72 * Math.cos(thetaCam)), -104, 0);
    // Brackets: one turn on the right side, the diameter above the top with its label beside it. A
    // bracket whose ends project outside the stage (near views) is dropped with its label rather than
    // clamped onto the edge.
    let d = '';
    const inFrame = () => s0.y > 8 && s1.y > 8 && s0.y < H - 8 && s1.y < H - 8;
    if (labelsOn) {
      p0.copy(right).multiplyScalar(RADIUS + TUBE_R + 0.45).setY(0.3);
      p1.copy(p0).setY(0.3 + PITCH);
      project(p0, s0);
      project(p1, s1);
      if (inFrame()) {
        d += `M${s0.x - 5},${s0.y}h10M${s0.x},${s0.y}L${s1.x},${s1.y}M${s1.x - 5},${s1.y}h10`;
        labels.set('pitch', anchor.copy(p0).lerp(p1, 0.5), 58, 0);
      } else labels.set('pitch', null);
      const yTop = Y0 + HEIGHT + 2.35; // above the end cones and their 5′/3′ labels
      p0.copy(right).multiplyScalar(-(RADIUS + TUBE_R)).setY(yTop);
      p1.copy(right).multiplyScalar(RADIUS + TUBE_R).setY(yTop);
      project(p0, s0);
      project(p1, s1);
      if (inFrame()) {
        d += `M${s0.x},${s0.y - 5}v10M${s0.x},${s0.y}L${s1.x},${s1.y}M${s1.x},${s1.y - 5}v10`;
        labels.set('width', anchor.copy(p1), 52, 0);
      } else labels.set('width', null);
    } else {
      labels.set('pitch', null);
      labels.set('width', null);
    }
    bracket.setAttribute('d', d);
    bracket.style.display = d ? '' : 'none';
    // 5′ and 3′ mark the two ends of each strand, and at a near view those ends are off the stage.
    // A label whose anchor is outside the frame gets clamped onto the edge by Labels.update, where it
    // points at nothing and collides with its partner, so each prime mark is dropped unless its own
    // end projects inside the stage with room for the box: better absent than misplaced.
    primesShown = 0;
    ends.forEach((e, i) => {
      project(e.pos, sEnd);
      const inside = sEnd.x > 34 && sEnd.x < W - 34 && sEnd.y > 26 && sEnd.y < H - 62;
      if (inside) primesShown += 1;
      labels.set(`end${i}`, inside ? e.pos : null, 0, e.top ? -18 : 18);
    });
  }

  // ---------- state ----------
  const orbit = new Orbit(DEFAULT_VIEW, ZOOM_MIN, ZOOM_MAX);
  const spin = new Spin(reduced ? 0 : SPIN_RATE);
  const raycaster = new THREE.Raycaster();
  let W = 1;
  let H = 1;
  let labelsOn = true;
  let primesShown = 0; // 5′/3′ marks whose own end is inside the stage this frame
  let hovered = null;
  let pinned = null;
  let shown = null;
  let hoverAt = 0;
  const white = new THREE.Color(0xffffff);
  const paper = new THREE.Color(ctx.palette.paper);
  const c = new THREE.Color();
  const m4 = new THREE.Matrix4();
  const LIFT = new THREE.Vector3(1, 1.45, 1.35); // a selected half-rung: thicker and a little wider
  const selectedPair = () => pinned ?? hovered;

  // The selected pair keeps its full colour, slightly lifted, and grows; every other rung fades most of
  // the way to the paper, so the chosen one is the only saturated thing on the axis.
  function applyColours() {
    const sel = selectedPair();
    for (let i = 0; i < BP * 2; i += 1) {
      const mine = Math.floor(i / 2) === sel;
      c.copy(baseColours[i]);
      if (sel !== null) c.lerp(mine ? white : paper, mine ? 0.12 : 0.7);
      slabs.setColorAt(i, c);
      slabs.setMatrixAt(i, m4.compose(slabPose[i].pos, slabPose[i].quat, mine ? LIFT : ONE));
    }
    slabs.instanceColor.needsUpdate = true;
    slabs.instanceMatrix.needsUpdate = true;
    slabs.computeBoundingSphere();
  }
  applyColours();

  function showPair(p) {
    if (p === shown) return;
    shown = p;
    if (p === null) { stage.hideCard(); return; }
    const b = SEQUENCE[p];
    const partner = COMPLEMENT[p];
    const n = bondsOf(b) === 2 ? 'two' : 'three';
    stage.showCard(`Base pair ${p + 1} of ${BP}: ${b}·${partner}`, `${BASES[b].name} pairs with ${BASES[partner].name.toLowerCase()} — ${n} hydrogen bonds.`);
  }

  function render() {
    orbit.apply(camera, spin.angle(clock.now()));
    updateLabels();
    labels.update(camera, W, H, bottomPad);
    renderer.render(scene, camera);
  }

  function step(dt) {
    const moving = orbit.step(dt, reduced);
    return moving || (spin.rate > 0 && !spin.held && !clock.pinned);
  }

  const loop = createLoop(step, render);

  function pairAt(pt) {
    const hit = pickAt(raycaster, camera, pt, [slabs])[0];
    return hit ? Math.floor(hit.instanceId / 2) : null;
  }

  bindInput(wrap, {
    onDrag(dx, dy) { spin.fold(orbit, clock.now()); orbit.drag(dx, dy); loop.invalidate(); },
    onZoom(f) { spin.fold(orbit, clock.now()); orbit.zoom(f); loop.invalidate(); },
    onClick(pt) {
      const p = pairAt(pt);
      pinned = p;
      hovered = p;
      showPair(p);
      applyColours();
      loop.invalidate();
    },
    onMove(pt) {
      const now = performance.now();
      if (pt && now - hoverAt < 60) return;
      hoverAt = now;
      const p = pt ? pairAt(pt) : null;
      wrap.classList.toggle('is-pick', p !== null);
      if (p === hovered) return;
      hovered = p;
      if (pinned === null) { showPair(p); applyColours(); loop.invalidate(); }
    },
    onEscape() { pinned = null; hovered = null; showPair(null); applyColours(); loop.invalidate(); },
  });

  const btnLabels = addButton(toolbar, 'Labels', () => {
    labelsOn = !labelsOn;
    btnLabels.setAttribute('aria-pressed', String(labelsOn));
    labels.setGroup('main', labelsOn);
    loop.invalidate();
  }, true);
  addButton(toolbar, 'Reset view', () => {
    spin.fold(orbit, clock.now());
    if (reduced || clock.pinned) orbit.set(DEFAULT_VIEW);
    else Object.assign(orbit.goal, DEFAULT_VIEW);
    loop.invalidate();
  });
  addChip(toolbar, `5′-${SEQUENCE}-3′`, scope);
  addChip(toolbar, `${BP} base pairs · ${BP_PER_TURN} per turn · 1 unit = 1 nm`, scope); // "10.5 per turn"

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
      render();
    },
    setVisible(v) { loop.setVisible(v); },
    setTheme(theme, palette) {
      mats.setPaper(palette.paper);
      rig.setTheme(theme);
      strandMats[0].color.set(palette.inkSoft);
      strandMats[1].color.set(mix(palette.inkSoft, palette.paper, 0.5));
      bondMat.color.set(palette.ink);
      paper.set(palette.paper);
      applyColours();
      render();
    },
    setView(view) {
      spin.fold(orbit, clock.now());
      orbit.set(view);
      render();
    },
    describe() {
      const r = renderer.info.render;
      return { drawCalls: r.calls, triangles: r.triangles, view: orbit.view(spin.angle(clock.now())), basePairs: BP, labels: labelsOn, primesShown, selected: pinned };
    },
  };
}
