// One water molecule and the four it can hold, in three dimensions at its real geometry: 104.5° between
// the bonds, 0.0958 nm from oxygen to hydrogen, the oxygen marked δ− and each hydrogen δ+, the two lone
// pairs shown as lobes. Four neighbours sit towards the corners of a tetrahedron, two of them accepting
// a hydrogen from the middle molecule and two donating one to its lone pairs.
//
// 1 scene unit = 1 ångström = 0.1 nm. The molecular plane is z = 0 and the default view looks down on it
// at a slight angle, so the bend reads at once.
//
// Why ice floats, shown rather than asserted. The four tetrahedral neighbours are always there; what
// changes with temperature is whether each one is bonded (held at 2.84 Å, on its tetrahedral line) or
// loose (drifted out to 3.25 Å and off the line), and whether the two *interstitial* molecules are
// present. Those two are the mechanism: in the liquid the tetrahedral cage is broken often enough for
// other molecules to squeeze into the gaps at 3.45 Å, and that is what makes the liquid denser than the
// solid. Freezing straightens the cage, holds all four partners, and pushes the interstitials out. The
// density readout is computed from what is on screen — molecules per unit volume, taken as n / spacing³
// and normalised so the liquid at 25 °C reads 1.000 — so ice comes out at 0.92 because of the geometry
// and not because the number was typed in.
//
// (The brief expected ice to hold its neighbours at a *greater* spacing than the liquid's. Measured, it
// is the other way round: the first O···O peak is 2.76 Å in ice and about 2.8 Å in liquid water. The
// open arrangement, not a longer bond, is what makes ice less dense, so that is what the figure shows.)
//
// Every position is a function of the clock and the reader's actions: each neighbour's bond is a square
// wave with its own phase and period, whose on-time is the hydrogen-bond lifetime at that temperature,
// so setTime(t) gives the same frame every run. A neighbour being dragged overrides its own schedule.
import { mix } from '../palette.js';
import {
  THREE, clamp, createStage, addButton, createRig, Orbit, Spin, makeClock, createLoop,
  Labels, Materials, bindInput, pickAt, observeSize, disposeScene,
} from './lib/three-common.js';
import { hash2, clamp01, lerp, ramp, bondDuty, bondLifePs, phaseOf, formatTempC } from './lib/chem-atoms.js';

export const meta = { kind: 'water3d', title: 'One molecule and the four it holds', needsWebGL: true, aspect: 16 / 10 };
// The angle of the opening view. Its distance is not fixed here: fitView() below sets it from the stage,
// so that the cluster sits in the band above the toolbar rather than under it. 13.8 was the distance
// that fitted a 16:10 stage with nothing at its foot; with the reading set as a line of type above the
// controls, the band the cluster may use is measured and the distance follows from it.
export const DEFAULT_VIEW = Object.freeze({ theta: 0.45, phi: 1.22, distance: 13.8 });
// How tall the cluster is on screen, in ångström, with a little air: four partners at up to 3.25 Å on
// the tetrahedral lines, two interstitials at 3.45, each with its own hydrogens, seen from 20° above
// the molecular plane, measured across a spin at 8.0 and given half an ångström over.
const CLUSTER_A = 8.5;

const ANGLE_DEG = 104.5;
const OH_A = 0.958; // ångström
const ICE_D = 2.76; // O...O in ice Ih
const BOND_D = 2.84; // O...O for a bonded pair in the liquid
const LOOSE_D = 3.25; // where a partner sits once its bond has let go
const INT_D = 3.45; // where an interstitial squeezes in
const SNAP_A = 3.65; // drag a neighbour past this and its hydrogen bond gives way
const PS_PER_SECOND = 2; // simulated picoseconds per second of clock
const R_O = 0.50;
const R_H = 0.28;
const R_STICK = 0.07;
// A hydrogen bond is the weak one and has to look it. Five beads at 0.115 read as a chain of iron
// balls, heavier than the covalent sticks they hang off; nine at 0.068, in a colour pulled back towards
// the paper, read as the dotted line the rest of the chapter draws them with.
const HB_BEADS = 9;
const R_BEAD = 0.068;
// Below this stage width the secondary labels go and the chips shorten: at 390 px the six labels of the
// wide arrangement overlap each other and the toolbar takes three rows.
const NARROW_W = 560;

// The reference the density is measured against: the model's own liquid at 25 °C, six molecules in the
// first shell at a mean 3.073 Å. Written out rather than sampled so the normalisation cannot drift.
const REF_N = 6;
const REF_SPACING = 3.073;
const REF_DENSITY = REF_N / REF_SPACING ** 3;
const STEAM_DENSITY_REL = 0.0006; // saturated steam at 100 °C against liquid water

const half = ((ANGLE_DEG / 2) * Math.PI) / 180;
const H1 = new THREE.Vector3(Math.sin(half), Math.cos(half), 0);
const H2 = new THREE.Vector3(-Math.sin(half), Math.cos(half), 0);
const LP1 = new THREE.Vector3(0, -Math.cos(half), Math.sin(half));
const LP2 = new THREE.Vector3(0, -Math.cos(half), -Math.sin(half));
// The four tetrahedral partners: two accept the middle molecule's hydrogens, two donate one to its
// lone pairs.
const SITES = [
  { dir: H1.clone(), role: 'acceptor' },
  { dir: H2.clone(), role: 'acceptor' },
  { dir: LP1.clone(), role: 'donor' },
  { dir: LP2.clone(), role: 'donor' },
];
// Two places a molecule can squeeze into: the open faces of the tetrahedron, which lie opposite its
// corners. Nothing is bonded there, and in ice these are the channels that make the lattice open.
const INTERSTITIAL = [
  H1.clone().negate(),
  LP2.clone().negate(),
];
const Y = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);
const ZERO = new THREE.Vector3(0, 0, 0);

export function mount(root, ctx) {
  try {
    return build(root, ctx);
  } catch (err) {
    ctx.onError(new Error(`the 3D water molecule could not be built: ${err.message}`));
    return { destroy() {}, setTime() {}, describe() { return { error: err.message }; }, setVisible() {}, setTheme() {}, setView() {} };
  }
}

function build(root, ctx) {
  const reduced = ctx.reducedMotion === true;
  const clock = makeClock(ctx.pinnedTime);
  const stage = createStage(root, 'water3d',
    'One water molecule with four neighbours held by hydrogen bonds, in three dimensions. Drag or use the arrow keys to orbit, + and − to zoom; drag a neighbour away to snap its hydrogen bond. A temperature control runs from ice to steam.');
  const { renderer, wrap, toolbar, scope } = stage;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, meta.aspect, 0.2, 200);
  camera.name = 'camera';
  const rig = createRig(scene, camera, ctx.theme);
  const mats = new Materials(ctx.palette.paper);

  let palette = ctx.palette;
  let theme = ctx.theme;
  let tempC = 25;
  let labelsOn = true;
  let narrow = false;
  let pulled = false; // the keyboard's way to break a bond
  let dragIndex = -1;
  const dragOffset = new THREE.Vector3();
  let W = 1;
  let H = 1;

  // The hydrogen bond's own colour, a step back from the ink so a dotted line of it never outweighs the
  // solid sticks of the covalent bonds beside it.
  function hbColour() {
    return theme === 'dark' ? mix(palette.inkFaint, palette.paper, 0.24) : mix(palette.inkFaint, palette.paper, 0.30);
  }

  // ---------- materials ----------
  // White materials tinted per instance: the middle molecule keeps its full colour, the four partners
  // are a step back, and the two interstitials are pale, so the tetrahedron the reader is meant to see
  // is the saturated thing in the frame.
  const matO = mats.make({ color: 0xffffff, roughness: 0.42, metalness: 0 });
  const matH = mats.make({ color: 0xffffff, roughness: 0.55, metalness: 0 });
  const matStick = mats.make({ color: 0xffffff, roughness: 0.6, metalness: 0 });
  const matHB = mats.make({ color: hbColour(), roughness: 0.7, metalness: 0 });
  const matLone = mats.make({ color: palette.water, roughness: 0.8, metalness: 0 });
  matLone.transparent = true;
  // A lone pair is a cloud, not a bead of jelly: at 0.2 the two lobes read as solid teal smudges with
  // the hydrogen-bond beads sitting on top of them.
  matLone.opacity = 0.13;
  matLone.depthWrite = false;

  // ---------- geometry ----------
  // Seven molecules: the middle one, four tetrahedral partners, two interstitials. Every oxygen is one
  // instance of one mesh, every hydrogen one of another, every O–H stick one of a third, so the whole
  // cluster costs five draw calls.
  const MOLS = 7;
  const geoO = new THREE.SphereGeometry(R_O, 32, 24);
  const geoH = new THREE.SphereGeometry(R_H, 20, 14);
  const geoStick = new THREE.CylinderGeometry(R_STICK, R_STICK, 1, 12, 1, true);
  geoStick.translate(0, 0.5, 0); // base at the origin, so a scale on y sets the length
  const geoBead = new THREE.SphereGeometry(R_BEAD, 10, 8);
  for (const g of [geoO, geoH, geoStick, geoBead]) g.deleteAttribute('uv');

  const oxygens = new THREE.InstancedMesh(geoO, matO, MOLS);
  oxygens.name = 'oxygens';
  const hydrogens = new THREE.InstancedMesh(geoH, matH, MOLS * 2);
  hydrogens.name = 'hydrogens';
  const sticks = new THREE.InstancedMesh(geoStick, matStick, MOLS * 2);
  sticks.name = 'bonds-covalent';
  const beads = new THREE.InstancedMesh(geoBead, matHB, SITES.length * HB_BEADS);
  beads.name = 'bonds-hydrogen';
  for (const m of [oxygens, hydrogens, sticks, beads]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(m);
  }

  // How far back each molecule's colour is pulled: 0 for the middle one, more for the partners, most
  // for the two that are only crowding in.
  const FADE = [0, 0.3, 0.3, 0.3, 0.3, 0.62, 0.62];
  const tint = new THREE.Color();
  function applyTints() {
    const dark = theme === 'dark';
    const back = dark ? palette.paper : '#ffffff';
    // Hydrogen is the paper-coloured atom. On dark paper the token is nearly the background, so it is
    // lifted towards the ink instead; either way it reads as the pale small one beside the oxygen.
    const hydrogen = dark ? mix(palette.paper3, palette.ink, 0.62) : mix(palette.paper3, palette.inkSoft, 0.22);
    for (let i = 0; i < MOLS; i += 1) {
      tint.set(mix(palette.coral, back, FADE[i]));
      oxygens.setColorAt(i, tint);
      tint.set(mix(hydrogen, back, FADE[i] * 0.6));
      hydrogens.setColorAt(i * 2, tint);
      hydrogens.setColorAt(i * 2 + 1, tint);
      tint.set(mix(palette.ink, back, FADE[i] * 0.7));
      sticks.setColorAt(i * 2, tint);
      sticks.setColorAt(i * 2 + 1, tint);
    }
    oxygens.instanceColor.needsUpdate = true;
    hydrogens.instanceColor.needsUpdate = true;
    sticks.instanceColor.needsUpdate = true;
  }

  // The two lone pairs: lobes on the far side of the oxygen from the hydrogens.
  const lobes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 18, 14), matLone, 2);
  lobes.name = 'lone-pairs';
  scene.add(lobes);
  {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    [LP1, LP2].forEach((d, i) => {
      q.setFromUnitVectors(Y, d);
      lobes.setMatrixAt(i, m4.compose(d.clone().multiplyScalar(0.92), q, new THREE.Vector3(0.34, 0.52, 0.34)));
    });
    lobes.instanceMatrix.needsUpdate = true;
  }

  // ---------- the model ----------
  const iceFrac = () => ramp(tempC, 2, -2);
  const steamFrac = () => ramp(tempC, 100, 116);

  // The on/off schedule of one hydrogen bond: a square wave whose on-time is the mean lifetime the
  // readout reports, with a phase and a period of its own so the four do not blink together. `u` is the
  // same signal eased, which is what moves the molecule, so a bond letting go is a drift and not a jump.
  function bondPhase(k, time) {
    if (iceFrac() > 0.5) return { on: true, u: 0 };
    const steam = steamFrac();
    if (steam > 0.85) return { on: false, u: 1 };
    const duty = clamp01(bondDuty(tempC) * (1 - steam));
    const tau = clamp(bondLifePs(tempC) / PS_PER_SECOND, 0.18, 5);
    const period = (tau / Math.max(duty, 0.03)) * (0.7 + 0.6 * hash2(k, 3));
    const x = (((time / period + hash2(k, 11)) % 1) + 1) % 1 * period;
    const onEnd = duty * period;
    const RAMP = Math.min(0.16, period * 0.16);
    const a = clamp01((x - onEnd + RAMP) / RAMP);
    const b = clamp01((period - x) / RAMP);
    const s = Math.min(a, b);
    return { on: x < onEnd, u: s * s * (3 - 2 * s) };
  }

  // Where neighbour k sits at this instant, and whether its bond is intact.
  const tmp = new THREE.Vector3();
  function neighbourState(k, time) {
    const site = SITES[k];
    const ice = iceFrac();
    const steam = steamFrac();
    let { on, u } = bondPhase(k, time);
    const dragging = dragIndex === k || (pulled && k === 0);
    const dir = tmp.copy(site.dir);
    let dist = lerp(lerp(BOND_D, LOOSE_D, u), ICE_D, ice);
    // A loose partner wanders off its tetrahedral line; a held one only breathes.
    const wob = reduced ? 0 : (1 - ice) * (0.22 + 0.5 * u);
    const p = dir.clone().multiplyScalar(dist);
    p.x += Math.sin(time * (0.9 + 0.31 * k) + k) * wob * 0.5;
    p.y += Math.sin(time * (1.17 + 0.23 * k) + k * 2.1) * wob * 0.5;
    p.z += Math.sin(time * (0.77 + 0.41 * k) + k * 3.3) * wob * 0.5;
    if (dragging) {
      if (pulled && k === 0 && dragIndex !== k) p.copy(site.dir).multiplyScalar(4.6);
      else p.add(dragOffset);
      dist = p.length();
      on = dist <= SNAP_A;
      // A pulled partner is dragged bodily, so it keeps whatever distance the reader gives it.
    }
    const gone = steam > 0.5 ? clamp01((steam - 0.5) / 0.4) : 0;
    if (gone > 0) p.multiplyScalar(1 + gone * 2.2);
    return { pos: p, on, dist: p.length(), present: 1 - gone, role: site.role, dragging };
  }

  function interstitialState(i, time) {
    const ice = iceFrac();
    const steam = steamFrac();
    // Present in the liquid, squeezed out by the lattice and gone from the vapour. This is the whole
    // density argument: these two are what make the liquid denser than the solid.
    const w = clamp01((1 - ice) * (1 - steam));
    const dir = INTERSTITIAL[i];
    const d = INT_D + (reduced ? 0 : Math.sin(time * 0.8 + i * 2.2) * 0.12) + (1 - w) * 4;
    return { pos: dir.clone().multiplyScalar(d), present: w, dist: d };
  }

  // ---------- writing the instances ----------
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const H1N = H1.clone().normalize();
  const molPos = Array.from({ length: MOLS }, () => new THREE.Vector3());
  const molQuat = Array.from({ length: MOLS }, () => new THREE.Quaternion());
  const molOn = new Array(MOLS).fill(1);
  let bondsHeld = 0;
  let neighboursPresent = 0;
  let spacingA = ICE_D;
  let draggingNow = false;
  let snappedNow = false;

  function orientNeighbour(k, pos, time) {
    const site = SITES[k];
    v.copy(pos).normalize().negate(); // from the neighbour towards the middle molecule
    if (site.role === 'acceptor') q.setFromUnitVectors(LP1, v); // its lone pair looks back at us
    else q.setFromUnitVectors(H1N, v); // its hydrogen points at us
    if (!reduced) {
      const wob = new THREE.Quaternion().setFromAxisAngle(
        v2.set(Math.sin(time * 0.6 + k), Math.cos(time * 0.5 + k * 2), Math.sin(time * 0.43 + k * 3)).normalize(),
        0.14 * Math.sin(time * 0.9 + k * 1.7),
      );
      q.multiply(wob);
    }
    return q;
  }

  function update(time) {
    molPos[0].set(0, 0, 0);
    molQuat[0].identity();
    molOn[0] = 1;
    bondsHeld = 0;
    neighboursPresent = 0;
    draggingNow = dragIndex >= 0 || pulled;
    snappedNow = false;
    let distSum = 0;
    let distN = 0;
    for (let k = 0; k < SITES.length; k += 1) {
      const s = neighbourState(k, time);
      molPos[k + 1].copy(s.pos);
      molQuat[k + 1].copy(orientNeighbour(k, s.pos, time));
      molOn[k + 1] = s.present;
      if (s.on && s.present > 0.5) bondsHeld += 1;
      // A neighbour the reader holds past SNAP_A has let go of its bond whatever the clock says. The
      // drive step reads this, because bondsHeld also counts the other three, which blink on their own.
      if (s.dragging && !s.on) snappedNow = true;
      if (s.present > 0.5) { neighboursPresent += 1; distSum += s.dist; distN += 1; }
    }
    for (let i = 0; i < INTERSTITIAL.length; i += 1) {
      const s = interstitialState(i, time);
      const idx = 5 + i;
      molPos[idx].copy(s.pos);
      molQuat[idx].setFromAxisAngle(
        v2.set(0.3 + i, 1, 0.6 - i).normalize(),
        time * (reduced ? 0 : 0.35) * (i ? -1 : 1) + i * 2,
      );
      molOn[idx] = s.present;
      if (s.present > 0.5) { neighboursPresent += 1; distSum += s.dist; distN += 1; }
    }
    spacingA = distN ? distSum / distN : 0;

    // oxygens, hydrogens and the covalent sticks
    for (let i = 0; i < MOLS; i += 1) {
      const on = molOn[i];
      oxygens.setMatrixAt(i, m4.compose(molPos[i], molQuat[i], on > 0.02 ? ONE : ZERO));
      for (const [j, hd] of [[0, H1], [1, H2]]) {
        v.copy(hd).applyQuaternion(molQuat[i]).multiplyScalar(OH_A).add(molPos[i]);
        hydrogens.setMatrixAt(i * 2 + j, m4.compose(v, molQuat[i], on > 0.02 ? ONE : ZERO));
        v2.copy(hd).applyQuaternion(molQuat[i]);
        q.setFromUnitVectors(Y, v2);
        sticks.setMatrixAt(i * 2 + j, m4.compose(molPos[i], q, on > 0.02 ? v.set(1, OH_A, 1) : ZERO));
      }
    }
    oxygens.instanceMatrix.needsUpdate = true;
    hydrogens.instanceMatrix.needsUpdate = true;
    sticks.instanceMatrix.needsUpdate = true;
    oxygens.computeBoundingSphere();

    // the hydrogen bonds, as a row of beads between the donated hydrogen and the accepting oxygen
    let n = 0;
    for (let k = 0; k < SITES.length; k += 1) {
      const s = neighbourState(k, time);
      const site = SITES[k];
      let from;
      let to;
      if (site.role === 'acceptor') {
        // From the middle molecule's own hydrogen to the partner's oxygen.
        from = (k === 0 ? H1 : H2).clone().multiplyScalar(OH_A);
        to = s.pos.clone();
      } else {
        from = s.pos.clone().add(H1.clone().applyQuaternion(molQuat[k + 1]).multiplyScalar(OH_A));
        to = new THREE.Vector3(0, 0, 0);
      }
      const live = s.on && s.present > 0.5;
      const dir = to.clone().sub(from);
      const len = dir.length();
      dir.normalize();
      for (let b = 0; b < HB_BEADS; b += 1) {
        const f = (b + 0.8) / (HB_BEADS + 0.6);
        const p = from.clone().addScaledVector(dir, f * len);
        beads.setMatrixAt(n, m4.compose(p, q.identity(), live ? ONE : ZERO));
        n += 1;
      }
    }
    beads.instanceMatrix.needsUpdate = true;
    beads.computeBoundingSphere();
  }

  // The mean bond count over the last second of simulated time, sampled from the same schedule the
  // scene is drawn from.
  function meanBondsOver(time) {
    const N = 24;
    let sum = 0;
    for (let i = 0; i < N; i += 1) {
      const s = time - 1 + (i + 0.5) / N;
      for (let k = 0; k < SITES.length; k += 1) if (neighbourState(k, s).on) sum += 1;
    }
    return sum / N;
  }

  // Molecules per unit volume, from what is on screen: n / spacing³, against the liquid at 25 °C.
  function densityRel(mean) {
    if (phaseOf(tempC) === 'steam') return STEAM_DENSITY_REL;
    const ice = iceFrac() > 0.5;
    const tetra = ice ? ICE_D : (mean * BOND_D + (4 - mean) * LOOSE_D) / 4;
    const w = ice ? 0 : clamp01(1 - steamFrac());
    const n = 4 + 2 * w;
    const spacing = (4 * tetra + 2 * w * INT_D) / n;
    return (n / spacing ** 3) / REF_DENSITY;
  }

  // ---------- labels and annotations ----------
  // Three things are named and three are measured, and the two want different marks. A name is a word
  // on a leader — the chip the rest of the book uses. A measurement is a dimension: an arc across the
  // angle it spans, a rule along the distance it covers, with the figure set in a break in the rule.
  // Six chips scattered over one molecule read as an application's tooltips; three chips and three
  // drawn dimensions read as a plate.
  const labels = new Labels(stage.labelsEl, stage.svg);
  labels.add('oxygen', 'Oxygen · δ−', { color: palette.coral });
  labels.add('hydro', 'Hydrogen · δ+');
  labels.add('lone', 'Lone pair', { group: 'detail', color: palette.water });
  labels.add('hbond', 'Hydrogen bond', { group: 'detail' });
  const anchor = new THREE.Vector3();

  // Pushed well clear of the cluster: anchored close in, the labels sat on the molecule they named.
  // On a phone the two names go out to the edges of the stage — an offset past the edge is clamped to
  // it, so each sits flush at its side with a leader back — because the cluster is drawn smaller there
  // and the wide offsets, which are in pixels, then landed on a partner: down-left of the oxygen sits
  // an interstitial, up-right of the hydrogen the acceptor it bonds to, and as the cluster turns the
  // hydrogen itself comes round to where a fixed offset had put its own name.
  // On a wide stage the same, with each name at the edge on its own side of the middle, the side an
  // anchor near the middle would keep flipping between chosen for it: the cluster turns through every
  // angle under the idle spin, and offsets that cleared it at one angle put "Hydrogen bond" on the
  // partner behind it and "Lone pair" on an interstitial at another. The measurements stay on the
  // drawing; the names stand in the margins with leaders back, as a plate's callouts do.
  const sideOf = (p, dflt) => {
    const x = project(p).x - W / 2;
    return Math.abs(x) < 40 ? dflt : x < 0 ? -400 : 400;
  };
  function updateLabels() {
    if (narrow) {
      labels.set('oxygen', anchor.set(0, -R_O * 0.8, 0), -400, -4);
      labels.set('hydro', anchor.copy(H1).multiplyScalar(OH_A + R_H * 0.8), 400, 10);
    } else {
      labels.set('oxygen', anchor.set(0, -R_O * 0.8, 0), -400, 34);
      anchor.copy(H1).multiplyScalar(OH_A + R_H * 0.8);
      labels.set('hydro', anchor, sideOf(anchor, 400), -54);
    }
    anchor.copy(LP1).multiplyScalar(1.3);
    labels.set('lone', anchor, narrow ? 96 : sideOf(anchor, -400), 46);
    // The name goes on whichever link is holding; the 0.28 nm beside it is drawn, not written.
    let shown = -1;
    for (let k = 0; k < SITES.length; k += 1) {
      const s = neighbourState(k, clock.now());
      if (s.on && s.present > 0.5) { shown = k; break; }
    }
    if (shown < 0) labels.set('hbond', null);
    else {
      anchor.copy(SITES[shown].dir).multiplyScalar((BOND_D + OH_A) / 2);
      labels.set('hbond', anchor, narrow ? 0 : sideOf(anchor, 400), -62);
    }
  }

  // ----- drawn dimensions, in the overlay -----
  const ann = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  ann.setAttribute('class', 'w3-ann');
  stage.svg.append(ann);
  const projV = new THREE.Vector3();
  const project = (p) => {
    projV.copy(p).project(camera);
    return { x: ((projV.x + 1) / 2) * W, y: ((1 - projV.y) / 2) * H, z: projV.z };
  };
  const svgEl = (tag, attrs) => {
    const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };

  // A measurement of the distance between two screen points: a hairline from the middle of what is
  // being measured, out past the cluster into open paper, with the figure set at the end of it.
  //
  // The first go at this drew a proper dimension — extension lines, a rule offset parallel to the
  // thing, slash ticks, the figure in a break in the rule. On a drawing that is right; over a rendered
  // scene it is not. One end of an O–H bond is the *centre* of an oxygen sixty pixels across, so the
  // rule has to stand further off the object than it is long, and what reached the eye was two loose
  // pencil marks near a sphere. A leader says the same thing in one line and never fights the render.
  function leader(p1, p2, away, label) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len < 24) return; // seen end on, and a measurement across three pixels says nothing
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    // Square off the line being measured, on the side away from whatever would be in the way. Straight
    // on outwards from the middle of the cluster the leader ran along the bond and through the atom at
    // the end of it.
    let ox = -dy / len;
    let oy = dx / len;
    let push = (mx - away.x) * ox + (my - away.y) * oy;
    // Both sides equally clear: take the one heading out of the frame rather than across it.
    if (Math.abs(push) < 6) push = (mx - W / 2) * ox + (my - H / 2) * oy;
    if (push < 0) { ox = -ox; oy = -oy; }
    const reach = 46;
    const ex = mx + ox * reach;
    const ey = my + oy * reach;
    ann.append(svgEl('path', {
      d: `M${mx.toFixed(1)} ${my.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`,
      stroke: 'var(--ink-faint)', 'stroke-width': '1', fill: 'none',
    }));
    ann.append(svgEl('circle', { cx: mx.toFixed(1), cy: my.toFixed(1), r: '2.2' }));
    const t = svgEl('text', {
      x: (ex + ox * 5).toFixed(1),
      y: (ey + oy * 6).toFixed(1),
      'text-anchor': ox > 0.3 ? 'start' : ox < -0.3 ? 'end' : 'middle',
      'dominant-baseline': oy > 0.55 ? 'hanging' : oy < -0.55 ? 'auto' : 'middle',
    });
    t.textContent = label;
    ann.append(t);
  }

  // The angle between the two bonds, marked with an arc at the oxygen. The arc is drawn in the plane of
  // the screen, so it shows *which* angle is meant; the figure beside it is the real one.
  function angleMark(o, h1, h2, label) {
    const a1 = Math.atan2(h1.y - o.y, h1.x - o.x);
    const a2 = Math.atan2(h2.y - o.y, h2.x - o.x);
    let d = a2 - a1;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    const r = Math.min(Math.hypot(h1.x - o.x, h1.y - o.y), Math.hypot(h2.x - o.x, h2.y - o.y)) * 0.62;
    // Not when the molecule is seen edge-on and the two hydrogens nearly coincide on screen: the arc
    // then spans nothing and its figure lands on an atom.
    if (r < 12 || Math.hypot(h1.x - h2.x, h1.y - h2.y) < 30) return;
    const N = 20;
    let path = '';
    for (let i = 0; i <= N; i += 1) {
      const a = a1 + d * (i / N);
      path += `${i ? 'L' : 'M'}${(o.x + Math.cos(a) * r).toFixed(1)} ${(o.y + Math.sin(a) * r).toFixed(1)}`;
    }
    ann.append(svgEl('path', { d: path, stroke: 'var(--ink-faint)', 'stroke-width': '1', fill: 'none' }));
    const am = a1 + d / 2;
    const t = svgEl('text', {
      x: (o.x + Math.cos(am) * (r + 15)).toFixed(1),
      y: (o.y + Math.sin(am) * (r + 15)).toFixed(1),
      'text-anchor': 'middle', 'dominant-baseline': 'middle',
    });
    t.textContent = label;
    ann.append(t);
  }

  const pH1 = new THREE.Vector3();
  const pH2 = new THREE.Vector3();
  function updateAnnotations() {
    ann.replaceChildren();
    if (!labelsOn || narrow) return;
    const o = project(ZERO);
    const h1 = project(pH1.copy(H1).multiplyScalar(OH_A));
    const h2 = project(pH2.copy(H2).multiplyScalar(OH_A));
    angleMark(o, h1, h2, `${ANGLE_DEG}°`);
    leader(o, h2, h1, '0.096 nm');
    // On the link of whichever partner is still holding, so the dimension never measures nothing.
    for (let k = 0; k < SITES.length; k += 1) {
      const s = neighbourState(k, clock.now());
      if (!s.on || s.present <= 0.5) continue;
      const from = SITES[k].role === 'acceptor' ? project(pH1.copy(k === 0 ? H1 : H2).multiplyScalar(OH_A)) : o;
      const to = project(s.pos);
      // Pushed below the link: above it is where the name of the bond goes, and the two ran together.
      leader(from, to, { x: o.x, y: o.y - 240 }, '0.28 nm');
      break;
    }
  }

  // ---------- controls ----------
  const tempBox = document.createElement('label');
  tempBox.className = `fig-chip ${scope}-chip w3-temp`;
  const range = document.createElement('input');
  range.type = 'range';
  range.className = 'fig-range';
  range.min = '-20';
  range.max = '120';
  range.step = '1';
  range.value = String(tempC);
  range.setAttribute('aria-label', 'Temperature, from minus 20 to 120 degrees Celsius');
  const tempVal = document.createElement('span');
  tempVal.className = 'w3-val';
  tempBox.append(range, tempVal);
  toolbar.append(tempBox);

  const btnLabels = addButton(toolbar, 'Labels', () => {
    labelsOn = !labelsOn;
    btnLabels.setAttribute('aria-pressed', String(labelsOn));
    applyLabelGroups();
    loop.invalidate();
  }, true);
  const btnPull = addButton(toolbar, 'Pull a neighbour', () => {
    pulled = !pulled;
    btnPull.textContent = pulled ? (narrow ? 'Let go' : 'Let it go') : (narrow ? 'Pull one' : 'Pull a neighbour');
    btnPull.setAttribute('aria-label', pulled ? 'Let it go' : 'Pull a neighbour');
    btnPull.setAttribute('aria-pressed', String(pulled));
    loop.invalidate();
  }, false);
  const btnReset = addButton(toolbar, 'Reset view', () => {
    spin.fold(orbit, clock.now());
    if (reduced || clock.pinned) orbit.set(fitView());
    else Object.assign(orbit.goal, fitView());
    loop.invalidate();
  });
  btnReset.setAttribute('aria-label', 'Reset view');
  // The reading, set as type: the density in the display face and the rest of the sentence beside it
  // in the small sans, the way the bond bench prints its energy. It was a rounded chip with a blurred
  // backdrop, the one such pill left in the chapter. On a wide stage it is a line of its own above the
  // controls; on a phone it sits at the end of the second row of them.
  const read = document.createElement('div');
  read.className = 'w3-read fig-ui';
  const readBig = document.createElement('b');
  const readRest = document.createElement('span');
  read.append(readBig, readRest);
  toolbar.append(read);

  const style = document.createElement('style');
  style.textContent = `
    .w3-temp { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.2rem 0.7rem 0.2rem 0.55rem; }
    .w3-temp input { width: 7.5rem; accent-color: var(--water); }
    .w3-val { min-width: 5rem; color: var(--ink); font-weight: 600;
      font-variant-numeric: lining-nums tabular-nums; }
    .w3-read { order: -1; flex: 1 0 100%; margin-bottom: 0.1rem; color: var(--ink-soft);
      line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      pointer-events: none !important; }
    .w3-read b { font-family: var(--font-display); font-size: var(--text-body); font-weight: 500;
      color: var(--ink); margin-right: 0.5rem; font-variant-numeric: lining-nums tabular-nums; }
    .tb-w3-narrow .w3-read { order: 0; flex: 0 1 auto; margin-bottom: 0; }
    .tb-w3-narrow .w3-read b { font-size: var(--text-base); margin-right: 0.4rem; }
    .tb-w3-narrow .w3-temp input { width: 4.6rem; }
    .tb-w3-narrow .w3-val { min-width: 4.3rem; }
    .tb-w3-narrow .fig-btn { padding: 0.28rem 0.55rem; }
    /* The scene is drawn on a transparent canvas, so the stage's own paper shows through it. A wash
       that settles towards the corners gives the cluster somewhere to be: without it seven pale
       spheres float on a flat rectangle with nothing behind them. */
    .tb3d-water3d { background:
      radial-gradient(120% 92% at 42% 34%, var(--paper) 0%,
        color-mix(in srgb, var(--paper) 88%, var(--ink)) 78%,
        color-mix(in srgb, var(--paper) 80%, var(--ink)) 100%); }
    /* Drawn measurements: set in the small sans with a paper halo, so a rule or a figure never has a
       molecule through the middle of it. */
    .w3-ann text { font-family: var(--font-ui); font-size: 10.5px; fill: var(--ink-soft);
      font-variant-numeric: lining-nums tabular-nums;
      paint-order: stroke; stroke: var(--paper); stroke-width: 3.2px; stroke-linejoin: round; }
  `;
  root.append(style);

  // ---------- state ----------
  const orbit = new Orbit(DEFAULT_VIEW, 6, 40);
  const spin = new Spin(reduced ? 0 : 0.12);
  const raycaster = new THREE.Raycaster();

  // The opening view, fitted to the stage: the toolbar and the reading cover the foot of the stage, so
  // the camera stands far enough back for the cluster to fit in the band above them and looks at a
  // point a little below the molecule, which puts the cluster in the middle of that band. Both follow
  // from the measured height of the toolbar rather than from a number chosen for one stage.
  function fitView() {
    const band = Math.max(80, H - bottomPad - 8);
    const visible = CLUSTER_A * (H / band);
    const distance = clamp(visible / (2 * Math.tan((camera.fov * Math.PI) / 360)), 6, 40);
    return { ...DEFAULT_VIEW, distance: Number(distance.toFixed(3)) };
  }
  function fitCentre() {
    const band = Math.max(80, H - bottomPad - 8);
    const pxPerA = band / CLUSTER_A;
    orbit.center.set(0, -((bottomPad - 8) / 2) / pxPerA, 0);
  }

  // The words on the two shortened buttons change with the stage; their accessible names do not, so a
  // recipe finds them by the same words at every width. Without the label, "Pull one" was the name a
  // phone gave the button, and nothing that looked for "Pull a neighbour" found it there.
  function applyNarrow() {
    btnPull.textContent = pulled ? (narrow ? 'Let go' : 'Let it go') : (narrow ? 'Pull one' : 'Pull a neighbour');
    btnPull.setAttribute('aria-label', pulled ? 'Let it go' : 'Pull a neighbour');
    btnReset.textContent = narrow ? 'Reset' : 'Reset view';
  }

  function applyLabelGroups() {
    labels.setGroup('main', labelsOn);
    labels.setGroup('detail', labelsOn && !narrow);
  }

  let lastRead = '';
  function updateRead() {
    const phase = phaseOf(tempC);
    tempVal.textContent = `${formatTempC(tempC)} · ${phase}`;
    const mean = meanBondsOver(clock.now());
    const d = densityRel(mean);
    let big;
    let rest;
    if (narrow) {
      // The phone's line shares a row with two buttons, so it is the number and three words.
      big = phase === 'steam' ? '0.0006 g/cm³' : `${d.toFixed(2)} g/cm³`;
      rest = phase === 'steam' ? 'steam' : `${bondsHeld} of 4 held`;
    } else if (phase === 'steam') {
      big = '0.0006 g/cm³';
      rest = 'steam · the neighbours have gone';
    } else {
      big = `${d.toFixed(3)} g/cm³`;
      rest = `${bondsHeld} of 4 bonds held, ${mean.toFixed(2)} on average · ${neighboursPresent} neighbours at ${(spacingA / 10).toFixed(3)} nm`;
    }
    const key = `${big}|${rest}`;
    if (key === lastRead) return;
    lastRead = key;
    readBig.textContent = big;
    readRest.textContent = rest;
  }

  function render() {
    const time = clock.now();
    update(time);
    orbit.apply(camera, spin.angle(time));
    updateLabels();
    labels.update(camera, W, H, bottomPad);
    updateAnnotations();
    renderer.render(scene, camera);
    updateRead();
  }

  function step(dt) {
    const moving = orbit.step(dt, reduced);
    return moving || !clock.pinned;
  }
  const loop = createLoop(step, render);

  // ---------- input ----------
  // A press that lands on a neighbour's oxygen grabs that molecule; anything else orbits. The listener
  // is added before bindInput's, so the decision is made before a drag starts.
  const local = (e) => {
    const r = wrap.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  };
  wrap.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const hit = pickAt(raycaster, camera, local(e), [oxygens])[0];
    const id = hit?.instanceId ?? -1;
    if (id >= 1 && id <= SITES.length) {
      dragIndex = id - 1;
      dragOffset.set(0, 0, 0);
      wrap.classList.add('is-drag');
      loop.invalidate();
    }
  }, true);
  const release = () => {
    if (dragIndex < 0) return;
    dragIndex = -1;
    dragOffset.set(0, 0, 0);
    wrap.classList.remove('is-drag');
    loop.invalidate();
  };
  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  bindInput(wrap, {
    onDrag(dx, dy) {
      if (dragIndex >= 0) {
        // Move the grabbed molecule in the plane of the screen, scaled so a pixel is the same distance
        // at every zoom.
        const perPx = (2 * orbit.cur.distance * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, H);
        right.setFromMatrixColumn(camera.matrixWorld, 0);
        up.setFromMatrixColumn(camera.matrixWorld, 1);
        dragOffset.addScaledVector(right, dx * perPx).addScaledVector(up, -dy * perPx);
        if (dragOffset.length() > 6) dragOffset.setLength(6);
        loop.invalidate();
        return;
      }
      spin.fold(orbit, clock.now());
      orbit.drag(dx, dy);
      loop.invalidate();
    },
    onZoom(f) { spin.fold(orbit, clock.now()); orbit.zoom(f); loop.invalidate(); },
    onClick() {},
    onEscape() { pulled = false; btnPull.textContent = 'Pull a neighbour'; btnPull.setAttribute('aria-pressed', 'false'); release(); },
  });

  range.addEventListener('input', () => {
    tempC = Number(range.value);
    loop.invalidate();
  });

  // ---------- sizing ----------
  let bottomPad = 52;
  const measurePad = () => { bottomPad = Math.max(52, toolbar.offsetHeight + 14); };
  // The view is fitted when the stage first has a size and again when it changes shape — a phone
  // turning, a window resized — and not on every tick of the observer, which also fires when a font
  // arrives and the toolbar grows a pixel: a reader mid-orbit must not have the camera taken back.
  let fittedW = 0;
  let fittedH = 0;
  const unobserve = observeSize(root, (w, h) => {
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wantNarrow = w < NARROW_W;
    let refit = Math.abs(w - fittedW) > 40 || Math.abs(h - fittedH) > 40;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      root.classList.toggle('tb-w3-narrow', narrow);
      applyLabelGroups();
      applyNarrow();
      lastRead = '';
      refit = true;
    }
    // The reading has to be set before the toolbar is measured: empty, its line is no height at all,
    // and the first fit would leave the cluster a line too low.
    if (!lastRead) { update(clock.now()); updateRead(); }
    measurePad();
    fitCentre();
    if (refit) {
      fittedW = w;
      fittedH = h;
      orbit.set(fitView());
    }
    labels.measure();
    loop.invalidate();
  });
  let alive = true;
  document.fonts?.ready.then(() => { if (alive) { measurePad(); fitCentre(); labels.measure(); loop.invalidate(); } });

  applyLabelGroups();
  applyTints();
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
    setTheme(nextTheme, next) {
      theme = nextTheme;
      palette = next;
      mats.setPaper(palette.paper);
      rig.setTheme(nextTheme);
      matHB.color.set(hbColour());
      matLone.color.set(palette.water);
      applyTints();
      render();
    },
    setView(view) {
      spin.fold(orbit, clock.now());
      orbit.set(view);
      render();
    },
    describe() {
      const time = clock.now();
      const mean = meanBondsOver(time);
      return {
        view: orbit.view(spin.angle(time)),
        angleDeg: ANGLE_DEG,
        bondLengthNm: Number((OH_A / 10).toFixed(4)),
        tempC,
        phase: phaseOf(tempC),
        neighbours: neighboursPresent,
        bondsHeld,
        meanBonds: Number(mean.toFixed(2)),
        latticeLocked: iceFrac() > 0.5,
        spacingNm: Number((spacingA / 10).toFixed(3)),
        densityRel: Number(densityRel(mean) < 0.01 ? densityRel(mean).toPrecision(2) : densityRel(mean).toFixed(3)),
        dragging: draggingNow,
        snapped: snappedNow,
        labels: labelsOn,
        t: Number(time.toFixed(3)),
        drawCalls: renderer.info.render.calls,
        layout: narrow ? 'narrow' : 'wide',
      };
    },
  };
}
