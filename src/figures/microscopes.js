// Four instruments, one specimen. One authored patch of cultured cells — four cells with nuclei,
// nucleoli, mitochondrial tubules, microtubules radiating from a centrosome, rough ER and ribosomes —
// drawn once in specimen coordinates (nanometres) and then re-rendered through whichever instrument the
// reader chooses. Nothing about the picture is drawn "blurry": the image is rendered sharp into an
// offscreen canvas and then convolved with the instrument's own point spread function.
//
// THE PHYSICS, because the picture and the arithmetic must not be able to disagree:
//
//   Abbe's limit      d = λ / (2 NA). Both terms are on sliders for the two light modes.
//   The blur          a Gaussian PSF of standard deviation σ = d/2, applied as a canvas blur filter
//                     with that σ in device pixels (σ_px = σ_nm ÷ nm-per-pixel, so the same physical
//                     blur is a different number of pixels in the wide view and in the inset).
//                     σ = d/2 is chosen so the Sparrow two-point limit, 2σ, is exactly d: two point
//                     objects stop showing a dip between them at precisely the separation the readout
//                     calls the limit. A real Airy disc is a shade narrower (σ ≈ 0.42 d, Sparrow
//                     ≈ 0.85 d); taking that would put the visible merge 15% away from the number in
//                     the panel, and a reader finding the crossover by hand would be told the wrong
//                     thing. The two test mitochondria are drawn 100 nm across — the thinnest a
//                     mitochondrial tubule gets — which adds σ_obj = 25 nm in quadrature and moves the
//                     visible crossover by at most 6% across the whole slider range.
//   The other limits  eye 100 µm (0.1 mm at the near point), TEM 2 nm (the practical limit on a
//                     stained biological section, not the instrument's 0.05 nm), SEM 10 nm.
//   Field of view     each instrument sees what it actually sees: the naked eye takes in 3 mm of
//                     slide, a light microscope 46 µm, a TEM a 3 µm section, an SEM the same 46 µm of
//                     surface. The 1.6 µm detail inset is the same region in every instrument, so the
//                     five pictures can be compared on one object.
//   Contrast          in fluorescence the limit is unchanged, but a labelled object below it still
//                     shows as a spot, so `smallestVisibleNm` falls to 25 nm with the microtubule
//                     channel on while `limitNm` stays at 200. That difference is the figure's second
//                     lesson and it is computed from one catalogue of structures, not asserted.
//
// Every frame is a function of the clock and the reader's settings. The specimen drifts only in the
// three modes where the specimen is alive; switching to TEM or SEM stops it dead, because it has been
// fixed. A seeded generator builds the patch once at mount; nothing here calls Math.random.
import { mix, ORGANELLE_BY_ID } from '../palette.js';
import { h } from './lib/svg.js';
import {
  mulberry32, TAU, clamp, clamp01, lerp, FONT,
  fitCanvas, smoothClosed, smoothOpen, blobPoints, panelCss, human,
} from './lib/cell-common.js';

export const meta = { kind: 'microscopes', title: 'Four instruments, one specimen', needsWebGL: false, aspect: 16 / 9 };

const SEED = 30311;

const INSTRUMENTS = ['eye', 'light', 'fluorescence', 'tem', 'sem'];
const NAMES = {
  eye: 'The naked eye',
  light: 'Light microscope',
  fluorescence: 'Fluorescence',
  tem: 'Transmission EM',
  sem: 'Scanning EM',
};
const SHORT = { eye: 'Eye', light: 'Light', fluorescence: 'Fluor.', tem: 'TEM', sem: 'SEM' };
// What the instrument takes in, in nanometres across the wide view.
const FIELD = { eye: 3_000_000, light: 46_000, fluorescence: 46_000, tem: 3_000, sem: 46_000 };
// Fixed limits, nm. The two light modes compute theirs from the sliders.
const FIXED_LIMIT = { eye: 100_000, tem: 2, sem: 10 };
const LIVING = { eye: true, light: true, fluorescence: true, tem: false, sem: false };
const NOTE = {
  eye: 'A stained slide at arm\'s length. 0.1 mm is the finest gap the eye separates, and a cell is four times smaller than that, so the whole culture arrives as one pink smear.',
  light: 'Transmitted light through a stained section. Outlines, nuclei and mitochondria as specks; everything finer is haze.',
  fluorescence: 'The same lens, the same limit. Only the labelled molecules emit, so a spot far below 200 nm is still visible — you cannot measure it, but you can see where it goes.',
  tem: 'Electrons through a 70 nm section, stained with heavy metals. A membrane resolves into two dark lines. The specimen is in a vacuum and is dead.',
  sem: 'A beam swept across a metal-coated surface. Relief, not interior, and at ten times the TEM\'s limit.',
};
const CHANNELS = ['mitochondria', 'microtubules', 'nucleus'];
const CHANNEL_LABEL = { mitochondria: 'Mitochondria', microtubules: 'Microtubules', nucleus: 'Nucleus' };

// The detail region: the same 1.6 µm of clear cytoplasm in every instrument, and where the two test
// mitochondria sit. Its position is derived in buildSpecimen from the second cell's own geometry so it
// cannot drift into the nucleus when the patch is retuned. The TEM's wide view looks at the same place.
const DETAIL_FIELD = 1600;
const TEST_D = 100; // nm across: a mitochondrial tubule seen end-on, at its thinnest

// Every structure the patch contains, with its real size. `smallestVisibleNm` is the smallest of these
// the current instrument shows, and the ruler along the bottom is drawn from the same table.
// `surface` marks what a scanning instrument can reach: it sees relief, not interior, so the smallest
// thing it shows is a microvillus and not a ribosome, however fine its beam is.
const STRUCTURES = [
  { id: 'cell', nm: 25_000, label: 'a whole cell', channels: [], surface: true },
  { id: 'nucleus', nm: 10_000, label: 'the nucleus', channels: ['nucleus'] },
  { id: 'nucleolus', nm: 2000, label: 'a nucleolus', channels: ['nucleus'] },
  { id: 'mitochondrion', nm: 700, label: 'a mitochondrion', channels: ['mitochondria'] },
  { id: 'microvillus', nm: 100, label: 'a microvillus', channels: [], surface: true },
  { id: 'pore', nm: 100, label: 'a nuclear pore', channels: [] },
  { id: 'cisterna', nm: 60, label: 'an ER cisterna', channels: [] },
  { id: 'crista', nm: 30, label: 'a crista', channels: [] },
  { id: 'ribosome', nm: 25, label: 'a ribosome', channels: [] },
  { id: 'microtubule', nm: 25, label: 'a microtubule', channels: ['microtubules'] },
  { id: 'bilayer', nm: 7, label: 'a membrane', channels: [] },
];

// Where the wide layout stops fitting: the panel column cannot fall below 196px and the micrograph
// needs 300px beside it, and under 430px of stage height the ruler, the panel and the toolbar leave
// the image less than half the stage. Measured at 1000x562 and at 390x487.
const NARROW_W = 660;
const NARROW_H = 430;
const SHORT_W = 520;

// ---------- the specimen ----------

// Four cultured cells in nanometres, centred on the origin. Everything is generated once from SEED, so
// the patch is the same patch on every machine and in every instrument.
function buildSpecimen() {
  const rng = mulberry32(SEED);
  // `nuc` is where the nucleus sits in the cell's own frame, as a fraction of its radii. Authored, not
  // drawn from the generator, because the detail region has to be somewhere the nucleus is not.
  const plan = [
    { cx: -10_500, cy: -1500, rx: 12_000, ry: 7000, rot: -0.20, nuc: [0.16, -0.10] },
    { cx: 9500, cy: 3500, rx: 10_500, ry: 7800, rot: 0.42, nuc: [-0.26, 0.10] },
    { cx: 2500, cy: -12_000, rx: 9500, ry: 6200, rot: -0.62, nuc: [-0.05, 0.22] },
    { cx: -14_000, cy: 11_500, rx: 9000, ry: 6000, rot: 0.85, nuc: [0.12, -0.18] },
  ];
  const cells = plan.map((s, i) => {
    const outline = blobPoints(30, s.rx, s.ry, [rng() * TAU, rng() * TAU, rng() * TAU], [0.17, 0.10, 0.055]);
    // Two lamellipodial processes: a cultured fibroblast is not an ellipse.
    for (const k of [4, 17]) {
      const j = (k + Math.floor(rng() * 3)) % outline.length;
      outline[j] = [outline[j][0] * 1.45, outline[j][1] * 1.45];
    }
    const c = Math.cos(s.rot);
    const sn = Math.sin(s.rot);
    const toWorld = ([x, y]) => [s.cx + x * c - y * sn, s.cy + x * sn + y * c];
    const nucOff = [s.nuc[0] * s.rx, s.nuc[1] * s.ry];
    const nucleus = { c: toWorld(nucOff), rx: s.rx * 0.40, ry: s.ry * 0.48, rot: s.rot + (rng() - 0.5) * 0.4 };
    const nucleoli = [];
    for (let k = 0; k < 2; k += 1) {
      nucleoli.push({
        c: toWorld([nucOff[0] + (rng() - 0.5) * s.rx * 0.32, nucOff[1] + (rng() - 0.5) * s.ry * 0.38]),
        r: 800 + rng() * 800,
      });
    }
    // Chromatin: clumps of DNA and protein filling the nucleus, which is what makes a stained nucleus
    // mottled rather than a flat ellipse.
    const chromatin = [];
    for (let k = 0; k < 46; k += 1) {
      const a = rng() * TAU;
      const rr = Math.sqrt(rng()) * 0.94;
      chromatin.push({
        c: toWorld([nucOff[0] + Math.cos(a) * nucleus.rx * rr, nucOff[1] + Math.sin(a) * nucleus.ry * rr]),
        r: 380 + rng() * 620,
        k: rng(),
      });
    }
    const centrosome = toWorld([nucOff[0] + s.rx * 0.30, nucOff[1] - s.ry * 0.12]);

    // Mitochondria: short tubules, 300-520 nm across and 1.4-3.6 µm long, laid down anywhere inside the
    // outline but outside the nucleus, by rejection sampling against both.
    const inside = (p, k = 1) => {
      const dx = p[0] - s.cx;
      const dy = p[1] - s.cy;
      const lx = (dx * c + dy * sn) / (s.rx * k);
      const ly = (-dx * sn + dy * c) / (s.ry * k);
      return lx * lx + ly * ly < 1;
    };
    const inNucleus = (p) => {
      const dx = p[0] - nucleus.c[0];
      const dy = p[1] - nucleus.c[1];
      const cc = Math.cos(-nucleus.rot);
      const ss = Math.sin(-nucleus.rot);
      const lx = (dx * cc - dy * ss) / (nucleus.rx * 1.08);
      const ly = (dx * ss + dy * cc) / (nucleus.ry * 1.08);
      return lx * lx + ly * ly < 1;
    };
    const mitos = [];
    let guard = 0;
    while (mitos.length < 26 && guard < 900) {
      guard += 1;
      const p = [s.cx + (rng() - 0.5) * 2 * s.rx, s.cy + (rng() - 0.5) * 2 * s.ry];
      if (!inside(p, 0.88) || inNucleus(p)) continue;
      const a = rng() * TAU;
      const len = 1400 + rng() * 2200;
      const bend = (rng() - 0.5) * 0.9;
      const pts = [];
      for (let k = 0; k < 4; k += 1) {
        const f = k / 3 - 0.5;
        const aa = a + bend * f;
        pts.push([p[0] + Math.cos(aa) * len * f, p[1] + Math.sin(aa) * len * f]);
      }
      mitos.push({ pts, w: 300 + rng() * 220, phase: rng() * TAU, rate: 0.05 + rng() * 0.07, drift: 60 + rng() * 130 });
    }

    // Microtubules: quadratic curves from the centrosome out to the edge.
    const tubes = [];
    for (let k = 0; k < 26; k += 1) {
      const a = (k / 26) * TAU + rng() * 0.2;
      const reach = 0.62 + rng() * 0.42;
      const end = toWorld([Math.cos(a) * s.rx * reach, Math.sin(a) * s.ry * reach]);
      const mid = [
        (centrosome[0] + end[0]) / 2 + (rng() - 0.5) * s.rx * 0.35,
        (centrosome[1] + end[1]) / 2 + (rng() - 0.5) * s.ry * 0.35,
      ];
      tubes.push([centrosome, mid, end]);
    }

    // Rough ER: short perinuclear cisternae, drawn as pairs of lines when the view is close enough.
    const er = [];
    for (let k = 0; k < 16; k += 1) {
      const a = rng() * TAU;
      const rr = 1.15 + rng() * 0.75;
      const p = toWorld([Math.cos(a) * nucleus.rx * rr, Math.sin(a) * nucleus.ry * rr]);
      const dir = a + Math.PI / 2 + (rng() - 0.5) * 0.7;
      const len = 900 + rng() * 1800;
      er.push([
        [p[0] - Math.cos(dir) * len / 2, p[1] - Math.sin(dir) * len / 2],
        [p[0] + (rng() - 0.5) * 400, p[1] + (rng() - 0.5) * 400],
        [p[0] + Math.cos(dir) * len / 2, p[1] + Math.sin(dir) * len / 2],
      ]);
    }

    const ribos = [];
    for (let k = 0; k < 520; k += 1) {
      const p = [s.cx + (rng() - 0.5) * 2 * s.rx, s.cy + (rng() - 0.5) * 2 * s.ry];
      if (!inside(p, 0.94) || inNucleus(p)) continue;
      ribos.push(p);
    }

    // Granules: the vesicles, lysosomes and lipid droplets that fill a cell, 90-320 nm across. Every one
    // of them is below a light microscope's limit, and drawing them is what turns the cytoplasm into the
    // granular haze three centuries of microscopists called protoplasm — the blur does that, not a
    // texture painted on by hand.
    const granules = [];
    for (let k = 0; k < 1700; k += 1) {
      const p = [s.cx + (rng() - 0.5) * 2 * s.rx, s.cy + (rng() - 0.5) * 2 * s.ry];
      if (!inside(p, 0.96) || inNucleus(p)) continue;
      granules.push([p[0], p[1], 45 + rng() * 115, rng()]);
    }

    // Surface relief for the SEM: ruffles along the leading edge and microvilli over the dorsal face.
    const ruffles = [];
    for (let k = 0; k < 9; k += 1) {
      const a = rng() * TAU;
      const rr = 0.72 + rng() * 0.24;
      const p = toWorld([Math.cos(a) * s.rx * rr, Math.sin(a) * s.ry * rr]);
      ruffles.push({ p, a: a + s.rot + Math.PI / 2, len: 1800 + rng() * 2600, w: 240 + rng() * 200 });
    }
    const villi = [];
    for (let k = 0; k < 2600; k += 1) {
      const p = [s.cx + (rng() - 0.5) * 2 * s.rx, s.cy + (rng() - 0.5) * 2 * s.ry];
      if (!inside(p, 0.86)) continue;
      villi.push([p[0], p[1], 45 + rng() * 45]);
    }

    return { i, plan: s, toWorld, outline: outline.map(toWorld), nucleus, nucleoli, chromatin, centrosome, mitos, tubes, er, ribos, granules, ruffles, villi };
  });

  // The detail region: a patch of the second cell's cytoplasm, well clear of its nucleus, found from
  // the cell's own frame so it stays clear if the patch is ever retuned.
  const host = cells[1];
  const detailAt = host.toWorld([host.plan.rx * 0.33, -host.plan.ry * 0.06]);
  const detail = { x: Math.round(detailAt[0]), y: Math.round(detailAt[1]), field: DETAIL_FIELD };
  const testY = detail.y;
  // Keep the host cell's own mitochondria out of the detail region: one lying across the two test
  // objects would be read as part of them, and the inset has to be a clean two-point test.
  host.mitos = host.mitos.filter((m) => Math.hypot(m.pts[1][0] - detail.x, m.pts[1][1] - testY) > 1900);
  host.granules = host.granules.filter(([x, y]) => Math.hypot(x - detail.x, y - testY) > 1500);

  // What the inset and the TEM view both look at: a stack of rough ER above, one large mitochondrion
  // with cristae below, free ribosomes between, and the two test mitochondria in the middle.
  const nb = { mito: null, er: [], ribos: [], tubes: [] };
  nb.mito = {
    pts: [[detail.x - 2500, testY + 340], [detail.x - 1800, testY + 180], [detail.x - 1120, testY + 300]],
    w: 400,
  };
  for (let k = 0; k < 3; k += 1) {
    const y = testY - 520 - k * 210;
    nb.er.push([[detail.x - 1000 + k * 60, y + 70], [detail.x, y], [detail.x + 960 - k * 40, y + 60]]);
  }
  const rng2 = mulberry32(SEED + 7);
  for (let k = 0; k < 130; k += 1) {
    const x = detail.x + (rng2() - 0.5) * 2600;
    const y = testY + (rng2() - 0.5) * 2600;
    // Leave the two test objects in clear ground: a ribosome landing on one would be read as part of it.
    if (Math.abs(y - testY) < 420 && Math.abs(x - detail.x) < 760) continue;
    nb.ribos.push([x, y]);
  }
  for (let k = 0; k < 2; k += 1) {
    const y = testY + 1180 + k * 250;
    nb.tubes.push([[detail.x - 1600, y + 90], [detail.x, y - 40], [detail.x + 1600, y + 120]]);
  }

  // The surrounding culture, only ever in view for the naked eye: a confluent sheet over 3 mm.
  const rng3 = mulberry32(SEED + 13);
  const culture = [];
  for (let k = 0; k < 9000; k += 1) {
    const x = (rng3() - 0.5) * 3_400_000;
    const y = (rng3() - 0.5) * 3_400_000;
    if (Math.abs(x) < 26_000 && Math.abs(y) < 20_000) continue; // the authored patch sits here
    // Confluent in patches and sparse between them: a culture is never even, and the unevenness is
    // the only thing about it the eye can still see.
    const dens = 0.5 + 0.5 * Math.sin(x / 260_000) * Math.cos(y / 310_000 + 1.2);
    if (rng3() > 0.25 + dens * 0.75) continue;
    culture.push([x, y, 8000 + rng3() * 13_000, rng3() * TAU, rng3()]);
  }

  return { cells, nb, culture, detail, testY };
}

// ---------- the film: one tone ramp, both themes ----------
//
// v = 0 is the darkest the image gets, v = 1 the brightest. On the light paper that runs from the ink to
// the paper. On the dark paper the top is pulled back to 80% of the way to the ink, because a brightfield
// micrograph is a lit object and a full-strength white rectangle is the brightest thing on the page.

function makeFilm(p, theme) {
  const lo = theme === 'dark' ? mix(p.paper, p.ink, 0.04) : mix(p.paper, p.ink, 0.94);
  const hi = theme === 'dark' ? mix(p.paper, p.ink, 0.66) : p.paper;
  return (v) => mix(lo, hi, clamp01(v));
}

// The illumination colour, from the wavelength, out of the palette's own five accents: 400 violet,
// 480 water, 530 leaf, 580 gold, 660 coral. No new hex, and the reader watches the light change colour
// as they move the slider that moves the limit.
function wavelengthColour(p, nm) {
  const stops = [[400, p.violet], [480, p.water], [530, p.leaf], [580, p.gold], [660, p.coral], [700, p.coral]];
  for (let i = 0; i < stops.length - 1; i += 1) {
    const [a, ca] = stops[i];
    const [b, cb] = stops[i + 1];
    if (nm <= b) return mix(ca, cb, clamp01((nm - a) / (b - a)));
  }
  return p.coral;
}

// ---------- painting the specimen ----------

// `view` carries nmPerPx so the paint can decide its own level of detail: a structure thinner than half
// a pixel is not drawn, which is why the wide light view has no ribosomes in it and the TEM view does.
function paintSpecimen(g, sp, view, st) {
  const { nmPerPx } = view;
  const fine = nmPerPx < 14; // a membrane, a crista or a ribosome is worth drawing
  const mid = nmPerPx < 90; // mitochondria, ER, microtubules

  g.lineCap = 'round';
  g.lineJoin = 'round';

  if (st.mode === 'eye' && nmPerPx > 200) {
    // The rest of the coverslip: a confluent culture, each cell a stained ellipse with a darker nucleus.
    for (const [x, y, r, rot, k] of sp.culture) {
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.fillStyle = st.cyto;
      g.globalAlpha = 0.55 + k * 0.45;
      g.beginPath();
      g.ellipse(0, 0, r, r * (0.5 + k * 0.35), 0, 0, TAU);
      g.fill();
      g.fillStyle = st.nucleusFill;
      g.beginPath();
      g.ellipse(0, 0, r * 0.34, r * 0.26, 0, 0, TAU);
      g.fill();
      g.restore();
    }
    g.globalAlpha = 1;
  }

  for (const cell of sp.cells) {
    // --- the cell body ---
    if (st.mode === 'sem') {
      paintSemCell(g, cell, view, st);
      continue;
    }
    if (st.body) {
      smoothClosed(g, cell.outline);
      const p = cell.plan;
      // A cell is thickest over the nucleus and thins to nothing at the edge, so a transmitted-light
      // image is darkest in the middle. One gradient, not a flat fill.
      const grad = g.createRadialGradient(
        cell.nucleus.c[0], cell.nucleus.c[1], p.rx * 0.06,
        cell.nucleus.c[0], cell.nucleus.c[1], p.rx * 1.35,
      );
      grad.addColorStop(0, st.cytoThick);
      grad.addColorStop(0.55, st.cyto);
      grad.addColorStop(1, st.cytoThin);
      g.fillStyle = grad;
      g.fill();
    }
    if (st.edge) {
      smoothClosed(g, cell.outline);
      g.strokeStyle = st.edge;
      g.lineWidth = st.edgeW * nmPerPx;
      g.stroke();
    }

    // --- granules: everything in the cytoplasm too small to resolve ---
    if (st.granule) {
      for (const [x, y, r0, k] of cell.granules) {
        const r = Math.max(r0, nmPerPx * 0.36);
        g.globalAlpha = 0.35 + k * 0.5;
        if (st.granuleEdge && fine) {
          // Close up, a granule is a vesicle: a 7 nm membrane round a lumen, and the lumen's density
          // is the difference between an empty transport vesicle and a full lysosome.
          g.beginPath();
          g.arc(x, y, r, 0, TAU);
          g.fillStyle = st.granuleEdge;
          g.fill();
          g.beginPath();
          g.arc(x, y, Math.max(1, r - 7), 0, TAU);
          g.fillStyle = st.granuleLumen ? st.granuleLumen(k) : st.granule;
          g.fill();
        } else {
          g.beginPath();
          g.arc(x, y, r, 0, TAU);
          g.fillStyle = st.granule;
          g.fill();
        }
      }
      g.globalAlpha = 1;
    }

    // --- microtubules ---
    if (st.tubes && mid) {
      g.strokeStyle = st.tubes;
      g.lineWidth = Math.max(25, nmPerPx * st.tubeW);
      g.globalAlpha = st.tubeAlpha;
      for (const [a, b, c] of cell.tubes) {
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.quadraticCurveTo(b[0], b[1], c[0], c[1]);
        g.stroke();
      }
      g.globalAlpha = 1;
    }

    // --- rough ER ---
    if (st.er && mid) {
      for (const strand of cell.er) {
        g.beginPath();
        smoothOpen(g, strand, 4);
        g.strokeStyle = st.er;
        g.lineWidth = fine ? 60 : Math.max(60, nmPerPx * 1.6);
        g.stroke();
      }
    }

    // --- free ribosomes ---
    if (st.ribo && fine) {
      g.fillStyle = st.ribo;
      for (const [x, y] of cell.ribos) {
        g.beginPath();
        g.arc(x, y, 12.5, 0, TAU);
        g.fill();
      }
    }

    // --- mitochondria ---
    if (st.mito) {
      g.globalAlpha = st.alpha?.mito ?? 1;
      for (const m of cell.mitos) {
        const d = st.living ? Math.sin(st.t * TAU * m.rate + m.phase) * m.drift : 0;
        const dy = st.living ? Math.cos(st.t * TAU * m.rate * 0.83 + m.phase) * m.drift * 0.6 : 0;
        g.beginPath();
        smoothOpen(g, m.pts.map(([x, y]) => [x + d, y + dy]), 5);
        g.lineWidth = m.w;
        g.strokeStyle = st.mito;
        g.stroke();
        if (st.mitoEdge && fine) {
          membraneTube(g, m.pts.map(([x, y]) => [x + d, y + dy]), m.w, [
            [m.w, st.mitoEdge], [m.w - 14, st.mito], [m.w - 38, st.mitoEdge], [m.w - 52, st.mito],
          ]);
        }
      }
      g.globalAlpha = 1;
    }

    // --- nucleus ---
    if (st.nucleusFill || st.nucleusEdge) {
      const n = cell.nucleus;
      g.save();
      g.translate(n.c[0], n.c[1]);
      g.rotate(n.rot);
      if (st.nucleusFill) {
        g.beginPath();
        g.ellipse(0, 0, n.rx, n.ry, 0, 0, TAU);
        g.fillStyle = st.nucleusFill;
        g.globalAlpha = st.alpha?.nucleus ?? 1;
        g.fill();
        g.globalAlpha = 1;
      }
      if (st.chromatin) {
        // Clumps of DNA and protein, clipped to the nucleus: a stained nucleus is mottled, not flat,
        // and every clump is well under the limit, so the light view turns them into texture.
        g.save();
        g.beginPath();
        g.ellipse(0, 0, n.rx, n.ry, 0, 0, TAU);
        g.clip();
        g.rotate(-n.rot);
        g.translate(-n.c[0], -n.c[1]);
        g.fillStyle = st.chromatin;
        const ca = st.alpha?.chromatin ?? 1;
        for (const c of cell.chromatin) {
          g.globalAlpha = (0.3 + c.k * 0.55) * ca;
          g.beginPath();
          g.arc(c.c[0], c.c[1], c.r, 0, TAU);
          g.fill();
        }
        g.globalAlpha = 1;
        g.restore();
      }
      if (st.nucleusEdge) {
        g.beginPath();
        g.ellipse(0, 0, n.rx, n.ry, 0, 0, TAU);
        g.strokeStyle = st.nucleusEdge;
        g.lineWidth = fine ? 30 : nmPerPx * 1.4;
        g.stroke();
        if (fine) {
          // The envelope is two membranes with a 30 nm gap, and pores where they meet.
          g.beginPath();
          g.ellipse(0, 0, n.rx - 34, n.ry - 34, 0, 0, TAU);
          g.stroke();
        }
      }
      g.restore();
      if (st.nucleolus) {
        g.globalAlpha = st.alpha?.nucleolus ?? 1;
        for (const nu of cell.nucleoli) {
          g.beginPath();
          g.arc(nu.c[0], nu.c[1], nu.r, 0, TAU);
          g.fillStyle = st.nucleolus;
          g.fill();
        }
        g.globalAlpha = 1;
      }
    }
  }

  // --- the detail neighbourhood, and the two test mitochondria ---
  paintNeighbourhood(g, sp, view, st);
}

function paintNeighbourhood(g, sp, view, st) {
  const nb = sp.nb;
  const DX = sp.detail.x;
  const TY = sp.testY;
  const { nmPerPx } = view;
  if (nmPerPx > 40) {
    // Far out, only the test pair matters, and it is one speck.
    if (st.mito) {
      g.fillStyle = st.test || st.mito;
      for (const x of [-st.sep / 2, st.sep / 2]) {
        g.beginPath();
        g.arc(DX + x, TY, TEST_D / 2, 0, TAU);
        g.fill();
      }
    }
    return;
  }
  if (st.mode === 'sem') return;
  const fine = nmPerPx < 14;

  if (st.er) {
    for (const strand of nb.er) {
      if (fine && st.erLumen) {
        // A cisterna: two 7 nm membranes with a 40 nm lumen between them.
        membraneTube(g, strand, 54, [[54, st.er], [40, st.erLumen]]);
      } else {
        g.beginPath();
        smoothOpen(g, strand, 5);
        g.strokeStyle = st.er;
        g.lineWidth = fine ? 55 : Math.max(55, nmPerPx * 1.6);
        g.stroke();
      }
      if (fine && st.ribo) {
        // Ribosomes on both faces: what makes it rough.
        g.fillStyle = st.ribo;
        for (let k = 0; k <= 14; k += 1) {
          const f = k / 14;
          const x = lerp(strand[0][0], strand[2][0], f);
          const y = lerp(strand[0][1], strand[2][1], f) + Math.sin(f * Math.PI) * -28;
          g.beginPath();
          g.arc(x, y - 44, 12.5, 0, TAU);
          g.fill();
          g.beginPath();
          g.arc(x + 30, y + 44, 12.5, 0, TAU);
          g.fill();
        }
      }
    }
  }
  if (st.tubes) {
    g.strokeStyle = st.tubes;
    g.lineWidth = 25;
    g.globalAlpha = st.tubeAlpha;
    for (const strand of nb.tubes) {
      g.beginPath();
      smoothOpen(g, strand, 5);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  if (st.ribo && fine) {
    g.fillStyle = st.ribo;
    for (const [x, y] of nb.ribos) {
      g.beginPath();
      g.arc(x, y, 12.5, 0, TAU);
      g.fill();
    }
  }
  if (st.mito) {
    // The big mitochondrion, with its two membranes and its cristae once the view can hold them.
    const m = nb.mito;
    if (fine && st.mitoEdge) {
      membraneTube(g, m.pts, m.w, [
        [m.w, st.mitoEdge],
        [m.w - 14, st.mito],
        [m.w - 38, st.mitoEdge],
        [m.w - 52, st.mito],
      ]);
    } else {
      g.beginPath();
      smoothOpen(g, m.pts, 5);
      g.lineWidth = m.w;
      g.strokeStyle = st.mito;
      g.stroke();
    }
    if (fine) {
      if (st.crista) {
        g.strokeStyle = st.crista;
        g.lineWidth = 30;
        for (let k = 0; k < 9; k += 1) {
          const f = 0.08 + (k / 8) * 0.84;
          const x = lerp(m.pts[0][0], m.pts[2][0], f);
          const y = lerp(m.pts[0][1], m.pts[2][1], f) + Math.sin(f * Math.PI) * -70;
          const side = k % 2 ? 1 : -1;
          g.beginPath();
          g.moveTo(x, y - side * (m.w / 2 - 24));
          g.quadraticCurveTo(x + 70, y, x + 40, y + side * (m.w / 2 - 90));
          g.stroke();
        }
      }
    }
    // The two test objects. They are the most strongly stained things in the field, because a 100 nm
    // object photographed through a 196 nm point spread function keeps only about a tenth of its
    // contrast, and a faintly stained pair would vanish before it merged.
    g.fillStyle = st.test || st.mito;
    for (const x of [-st.sep / 2, st.sep / 2]) {
      g.beginPath();
      g.arc(DX + x, TY, TEST_D / 2, 0, TAU);
      g.fill();
    }
    if (st.glow) {
      // Emission piles up in the middle of a labelled object, so a second smaller pass gives the pair
      // the bright core a real fluorescent bead has.
      for (const x of [-st.sep / 2, st.sep / 2]) {
        g.beginPath();
        g.arc(DX + x, TY, TEST_D / 3, 0, TAU);
        g.fill();
      }
    }
  }
}

// A tube drawn the way a transmission micrograph records one: concentric strokes of the same path, so
// the outer membrane, the space between the membranes, the inner membrane and the matrix each come out
// as a band of their true thickness. A membrane is 7 nm and the gap between the two is about 12 nm, so
// at the 3 µm field this is what "a membrane resolves into two dark lines" actually looks like.
function membraneTube(g, pts, w, bands) {
  for (const [width, colour] of bands) {
    if (width <= 0) continue;
    g.beginPath();
    smoothOpen(g, pts, 5);
    g.lineWidth = width;
    g.strokeStyle = colour;
    g.stroke();
  }
}

// The SEM: the same cells as lit surfaces. A cell is a mound, shaded from the top left, with ruffles
// along the edge and microvilli over the dorsal face, on the black field an SEM actually has.
function paintSemCell(g, cell, view, st) {
  const { nmPerPx } = view;
  const p = cell.plan;
  smoothClosed(g, cell.outline);
  const grad = g.createRadialGradient(
    p.cx - p.rx * 0.35, p.cy - p.ry * 0.4, p.rx * 0.1,
    p.cx, p.cy, p.rx * 1.15,
  );
  grad.addColorStop(0, st.semHi);
  grad.addColorStop(0.55, st.semMid);
  grad.addColorStop(1, st.semLow);
  g.fillStyle = grad;
  g.fill();
  // The nucleus is a bulge under the surface, not a hole.
  const n = cell.nucleus;
  g.save();
  g.translate(n.c[0], n.c[1]);
  g.rotate(n.rot);
  const ng = g.createRadialGradient(-n.rx * 0.3, -n.ry * 0.35, n.rx * 0.1, 0, 0, n.rx);
  ng.addColorStop(0, st.semHi);
  ng.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = 0.5;
  g.fillStyle = ng;
  g.beginPath();
  g.ellipse(0, 0, n.rx, n.ry, 0, 0, TAU);
  g.fill();
  g.globalAlpha = 1;
  g.restore();

  for (const r of cell.ruffles) {
    g.save();
    g.translate(r.p[0], r.p[1]);
    g.rotate(r.a);
    g.strokeStyle = st.semHi;
    g.lineWidth = r.w * 0.55;
    g.globalAlpha = 0.85;
    g.beginPath();
    g.moveTo(-r.len / 2, 0);
    g.quadraticCurveTo(0, -r.w * 1.6, r.len / 2, 0);
    g.stroke();
    g.strokeStyle = st.semLow;
    g.globalAlpha = 0.8;
    g.beginPath();
    g.moveTo(-r.len / 2, r.w * 0.55);
    g.quadraticCurveTo(0, -r.w * 1.0, r.len / 2, r.w * 0.55);
    g.stroke();
    g.globalAlpha = 1;
    g.restore();
  }
  if (nmPerPx < 200) {
    // A microvillus is 100 nm across. Below one pixel the whole brush border would disappear, and an
    // SEM at this magnification does show it as texture, so the drawn radius has a floor of two thirds
    // of a pixel: the count and the positions are the model's, only the dot size is the screen's.
    for (const [x, y, r0] of cell.villi) {
      const r = Math.max(r0, nmPerPx * 0.7);
      g.beginPath();
      g.arc(x - r * 0.25, y - r * 0.25, r, 0, TAU);
      g.fillStyle = st.semHi;
      g.globalAlpha = 0.5;
      g.fill();
      g.beginPath();
      g.arc(x + r * 0.3, y + r * 0.3, r * 0.8, 0, TAU);
      g.fillStyle = st.semLow;
      g.globalAlpha = 0.38;
      g.fill();
    }
    g.globalAlpha = 1;
  }
}

// The colours one instrument records with. Everything comes from the film ramp, the palette accents or
// ORGANELLES; nothing here is a hex.
function styleFor(mode, p, theme, film, opts) {
  const O = ORGANELLE_BY_ID;
  const base = { mode, t: opts.t, sep: opts.sep, living: opts.living, tubeAlpha: 0.75, tubeW: 1, edgeW: 1.4 };
  const tint = wavelengthColour(p, opts.wavelengthNm);
  if (mode === 'eye' || mode === 'light') {
    // A stained section in transmitted light: eosin on the cytoplasm, haematoxylin on the nucleus, and
    // the lamp's own colour over the whole field.
    const lit = mix(film(0.985), tint, mode === 'light' ? 0.075 : 0.04);
    const eosin = (k) => mix(lit, p.coral, k);
    const haem = (k) => mix(lit, p.violet, k);
    return {
      ...base,
      // The eye's stain is stronger because it is looking at a slide: the whole coverslip is pink, and
      // a wash that faint would leave the reader with an empty rectangle rather than a smear.
      bg: mode === 'eye' ? eosin(0.05) : lit,
      body: true,
      cyto: eosin(mode === 'eye' ? 0.5 : 0.21),
      cytoThick: eosin(mode === 'eye' ? 0.6 : 0.32),
      cytoThin: eosin(mode === 'eye' ? 0.34 : 0.09),
      edge: eosin(0.5),
      granule: mode === 'light' ? eosin(0.44) : null,
      chromatin: haem(mode === 'eye' ? 0.6 : 0.68),
      nucleusFill: haem(mode === 'eye' ? 0.55 : 0.46),
      nucleusEdge: mode === 'light' ? haem(0.72) : null,
      nucleolus: mode === 'light' ? haem(0.9) : null,
      mito: mode === 'light' ? eosin(0.55) : null,
      // The most heavily stained thing in the field, carried towards the dark end of the film rather
      // than towards the ink: `ink` is the light colour on a dark page, and mixing towards it there
      // would turn the test pair into two pale spots on a bright field.
      test: mode === 'light' ? mix(p.coral, film(0.04), 0.45) : eosin(0.62),
      mitoEdge: null,
      crista: null,
      er: mode === 'light' ? eosin(0.3) : null,
      erLumen: null,
      ribo: null,
      tubes: null,
    };
  }
  if (mode === 'fluorescence') {
    // An emission colour is the structure's own colour carried a quarter of the way to the brightest
    // the film gets, because a dye that is emitting is brighter than the same dye printed on paper, and
    // the darkest of the palette's accents would otherwise be a black line on a black field. The
    // composite is additive, so two labels in one place go towards white, as they do in a real image.
    const emit = (c, k = 0.24) => mix(c, film(1), k);
    const on = (id) => opts.channels.has(id);
    return {
      ...base,
      bg: film(0.015),
      glow: true,
      body: false,
      cyto: null,
      cytoThick: null,
      cytoThin: null,
      granule: null,
      chromatin: on('nucleus') ? emit(mix(O.nucleus.color, O.chromatin.color, 0.65), 0.3) : null,
      edge: null,
      nucleusFill: on('nucleus') ? emit(O.nucleus.color, 0.28) : null,
      nucleusEdge: null,
      nucleolus: on('nucleus') ? emit(O.nucleolus.color, 0.4) : null,
      mito: on('mitochondria') ? emit(O.mitochondrion.color, 0.18) : null,
      test: on('mitochondria') ? emit(O.mitochondrion.color, 0.06) : null,
      mitoEdge: null,
      crista: null,
      er: null,
      erLumen: null,
      ribo: null,
      tubes: on('microtubules') ? emit(p.leaf, 0.3) : null,
      tubeAlpha: 0.9,
      tubeW: 1,
      alpha: { nucleus: 0.52, chromatin: 0.2, nucleolus: 0.42, mito: 0.95 },
    };
  }
  if (mode === 'tem') {
    return {
      ...base,
      bg: film(0.88),
      body: true,
      cyto: film(0.74),
      cytoThick: film(0.70),
      cytoThin: film(0.80),
      granule: film(0.80),
      granuleEdge: film(0.24),
      granuleLumen: (k) => film(0.34 + k * 0.5),
      chromatin: film(0.44),
      edge: film(0.12),
      edgeW: 2.2,
      nucleusFill: film(0.56),
      nucleusEdge: film(0.10),
      nucleolus: film(0.28),
      mito: film(0.62),
      test: film(0.06),
      mitoEdge: film(0.10),
      crista: film(0.16),
      er: film(0.22),
      erLumen: film(0.80),
      ribo: film(0.16),
      tubes: film(0.50),
      tubeAlpha: 0.6,
    };
  }
  // sem
  return {
    ...base,
    bg: film(0.03),
    body: true,
    semHi: film(0.96),
    semMid: film(0.62),
    semLow: film(0.16),
    cyto: film(0.6),
    cytoThick: film(0.6),
    cytoThin: film(0.6),
    granule: null,
    chromatin: null,
    edge: null,
    nucleusFill: null,
    nucleusEdge: null,
    nucleolus: null,
    mito: null,
    test: null,
    mitoEdge: null,
    crista: null,
    er: null,
    erLumen: null,
    ribo: null,
    tubes: null,
  };
}

// ---------- the figure ----------

const CSS = (s) => `${panelCss(s)}
.${s} { display: grid; grid-template-columns: minmax(0, 1fr) clamp(196px, 30%, 306px); grid-template-rows: minmax(0, 1fr) auto; padding-bottom: var(--mi-pad, 3.1rem); box-sizing: border-box; }
.${s} .mi-view { grid-column: 1; grid-row: 1; position: relative; min-width: 0; min-height: 0; padding: var(--space-3) 0 var(--space-2) var(--space-3); box-sizing: border-box; }
.${s} .mi-view canvas { width: 100%; height: 100%; border-radius: var(--radius); }
.${s} .mi-panel { grid-column: 2; grid-row: 1; padding: var(--space-3) var(--space-3) var(--space-2) var(--space-4); gap: 0.42rem; box-sizing: border-box; overflow: hidden; }
.${s} .mi-ruler { grid-column: 1 / -1; grid-row: 2; position: relative; height: 58px; padding: 0 var(--space-3); box-sizing: border-box; }
.${s} .mi-ruler canvas { width: 100%; height: 100%; }
.${s} .mi-abbe { margin: 0; font-size: 12px; line-height: 1.5; color: var(--ink-soft); font-variant-numeric: lining-nums tabular-nums; }
.${s} .mi-abbe b { color: var(--ink); font-weight: 600; }
.${s} .mi-abbe .mi-d { color: var(--leaf-text); font-weight: 600; }
.${s} .mi-swatch { display: inline-block; width: 0.62em; height: 0.62em; border-radius: 50%; vertical-align: baseline; margin-right: 0.15em; border: 1px solid color-mix(in srgb, var(--ink) 18%, transparent); }
.${s} .mi-state { position: absolute; top: var(--space-4); right: var(--space-2); z-index: 1; display: inline-flex; align-items: center; gap: 0.45em; background: color-mix(in srgb, var(--paper) 88%, transparent); backdrop-filter: blur(6px); }
.${s} .mi-state::before { content: ""; width: 0.55em; height: 0.55em; border-radius: 50%; background: var(--leaf); }
/* The warning chip takes the FULL paper, not the 88% of it the live chip floats on: it is the one state
   whose words are written in an accent, and --coral-text over 88% paper on the specimen measured 4.27:1
   in the light theme (2026-09-16). On the paper it is 5.34:1. */
.${s} .mi-state[data-live="false"] { color: var(--coral-text); background: var(--paper); border-color: color-mix(in srgb, var(--coral) 45%, var(--rule)); }
.${s} .mi-state[data-live="false"]::before { background: var(--coral); }
.${s} .mi-chanwrap[hidden] { display: none; }
.${s} .mi-seen { font-size: 11px; line-height: 1.35; color: var(--ink-soft); margin: 0; }
.${s} .mi-seen b { color: var(--ink); font-weight: 600; }
.${s} .mi-lost { color: var(--ink-faint); }
.${s} .mi-lost[hidden] { display: none; }
.${s} .mi-short { display: none; }
.${s}.is-short .mi-long { display: none; }
.${s}.is-short .mi-short { display: inline; }
.${s}.is-short .fig-toolbar { gap: 0.3rem; }
.${s}.is-short .fig-btn { padding: 0.3rem 0.5rem; }
.${s}.is-narrow { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto auto; }
.${s}.is-narrow .mi-view { grid-column: 1; grid-row: 1; padding: var(--space-2) var(--space-3) 0; }
.${s}.is-narrow .mi-state { top: var(--space-3); }
.${s}.is-narrow .mi-panel { grid-column: 1; grid-row: 2; padding: var(--space-2) var(--space-3) 0; gap: 0.3rem; }
.${s}.is-narrow .mi-ruler { grid-row: 3; height: 40px; }
/* The narrow panel is three short rows under the image, not a column beside it: the micrograph is the
   figure, and a panel that reads at 390 px has to give it back the height. */
.${s}.is-narrow .mi-sliders { display: grid; grid-template-columns: 1fr 1fr; gap: 0 0.6rem; }
.${s}.is-narrow .mi-note { display: none; }
.${s}.is-narrow .cl-title { font-size: 13px; }
.${s}.is-narrow .mi-abbe { font-size: 11px; line-height: 1.3; }
.${s}.is-narrow .cl-slider label { font-size: 10.5px; }
.${s}.is-narrow .mi-seen { font-size: 10.5px; }
.${s}.is-narrow .cl-mini { font-size: 10.5px; padding: 0.36rem 0.5rem; }
/* What the instrument shows and what it loses sit at the foot of the column, level with the bottom of
   the micrograph; the sliders and the equation stay at its head. */
.${s} .mi-foot { margin-top: auto; display: flex; flex-direction: column; gap: 0.3rem; padding-top: 0.3rem; border-top: 1px solid var(--rule); }
.${s}.is-narrow .mi-foot { margin-top: 0.1rem; }
.${s} .mi-gapshort { display: none; }
.${s}.is-narrow .mi-gaplong { display: none; }
.${s}.is-narrow .mi-gapshort { display: inline; }
`;

export function mount(root, ctx) {
  const scope = 'tb-micro';
  const reduced = Boolean(ctx.reducedMotion);
  let palette = ctx.palette;
  let theme = ctx.theme;
  let film = makeFilm(palette, theme);
  let t = ctx.pinnedTime ?? 0;
  let playing = !reduced && ctx.pinnedTime === null;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;

  const sp = buildSpecimen();

  const state = {
    instrument: 'light',
    wavelengthNm: 550,
    na: 1.4,
    separationNm: 260,
    channels: new Set(['mitochondria', 'microtubules', 'nucleus']),
  };

  // ----- DOM -----
  const wrap = h('div', { class: scope });
  wrap.append(h('style', { text: CSS(scope) }));

  const canvas = h('canvas', {
    tabindex: 0,
    role: 'img',
    'aria-label': 'The micrograph, with a magnified detail of the two test mitochondria and an intensity trace across them. The left and right arrow keys move the two mitochondria closer together and further apart.',
  });
  const liveChip = h('span', { class: 'fig-chip fig-ui mi-state', 'data-live': 'true', 'aria-live': 'polite' });
  const view = h('div', { class: 'mi-view' }, [canvas, liveChip]);

  const title = h('p', { class: 'cl-title', text: NAMES.light });
  const note = h('p', { class: 'cl-note mi-note', text: NOTE.light });
  const abbe = h('p', { class: 'mi-abbe' });

  const slider = (label, min, max, step, value, unit, onInput) => {
    const val = h('span', { class: 'cl-val' });
    const input = h('input', {
      type: 'range', class: 'fig-range', min, max, step, value,
      'aria-label': label,
    });
    input.addEventListener('input', () => onInput(Number(input.value)));
    const row = h('div', { class: 'cl-slider' }, [h('label', { text: label }), val, input]);
    return { row, input, val, unit };
  };

  const sWave = slider('Wavelength', 400, 700, 5, state.wavelengthNm, 'nm', (v) => { state.wavelengthNm = v; changed(); });
  const sNa = slider('Numerical aperture', 0.1, 1.4, 0.01, state.na, '', (v) => { state.na = v; changed(); });
  const sGap = slider('Gap between the two mitochondria', 50, 800, 10, state.separationNm, 'nm', (v) => { state.separationNm = v; changed(); });
  sGap.row.querySelector('label').innerHTML = '<span class="mi-gaplong">Gap between the two mitochondria</span><span class="mi-gapshort">Gap</span>';
  const sliders = h('div', { class: 'mi-sliders', style: 'margin-top:.25rem' }, [sWave.row, sNa.row, sGap.row]);

  const chanButtons = CHANNELS.map((id) => {
    const b = h('button', { class: 'cl-mini', type: 'button', 'aria-pressed': 'true', text: CHANNEL_LABEL[id] });
    b.addEventListener('click', () => {
      if (state.channels.has(id)) state.channels.delete(id);
      else state.channels.add(id);
      changed();
    });
    return b;
  });
  const chanWrap = h('div', { class: 'mi-chanwrap' }, [
    h('p', { class: 'cl-head', text: 'Channels' }),
    h('div', { class: 'cl-group', style: 'margin-top:.2rem' }, chanButtons),
  ]);
  const seen = h('p', { class: 'mi-seen' });
  const lost = h('p', { class: 'mi-seen mi-lost' });

  const panel = h('div', { class: 'cl-panel mi-panel' }, [title, note, abbe, sliders, chanWrap, h('div', { class: 'mi-foot' }, [seen, lost])]);

  const rulerCanvas = h('canvas', { 'aria-hidden': 'true' });
  const ruler = h('div', { class: 'mi-ruler' }, [rulerCanvas]);

  const instButtons = INSTRUMENTS.map((id) => {
    const b = h('button', {
      class: 'fig-btn', type: 'button', 'aria-pressed': String(id === state.instrument), 'aria-label': NAMES[id],
    }, [
      h('span', { class: 'mi-long', text: NAMES[id] }),
      h('span', { class: 'mi-short', text: SHORT[id] }),
    ]);
    b.addEventListener('click', () => {
      state.instrument = id;
      for (const [k, node] of instButtons.entries()) node.setAttribute('aria-pressed', String(INSTRUMENTS[k] === id));
      changed();
    });
    return b;
  });
  const toolbar = h('div', { class: 'fig-toolbar fig-ui' }, instButtons);

  wrap.append(view, panel, ruler, toolbar);
  root.append(wrap);

  const g = canvas.getContext('2d', { willReadFrequently: true });
  const rg = rulerCanvas.getContext('2d');
  if (!g || !rg) {
    ctx.onError(new Error('this figure renders its micrograph on a 2D canvas and the browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // Two offscreen canvases per pane: one to draw the sharp image into with a margin, one to hold the
  // blurred copy. Cropping the centre out of the blurred copy is what keeps the blur from pulling
  // transparency in over the edges of the frame.
  const panes = new Map();
  function pane(key) {
    let p = panes.get(key);
    if (!p) {
      p = { sharp: document.createElement('canvas'), blur: document.createElement('canvas') };
      panes.set(key, p);
    }
    return p;
  }

  // ----- the numbers -----
  const limitNm = () => {
    if (state.instrument === 'light' || state.instrument === 'fluorescence') {
      return Math.round(state.wavelengthNm / (2 * state.na));
    }
    return FIXED_LIMIT[state.instrument];
  };
  const resolved = () => state.separationNm >= limitNm();
  const living = () => LIVING[state.instrument];
  const activeChannels = () => (state.instrument === 'fluorescence' ? CHANNELS.filter((c) => state.channels.has(c)) : []);

  function visibleStructures() {
    const lim = limitNm();
    const chan = new Set(activeChannels());
    const surfaceOnly = state.instrument === 'sem';
    return STRUCTURES.filter((s) => {
      if (surfaceOnly && !s.surface) return false;
      return s.nm >= lim || (state.instrument === 'fluorescence' && s.channels.some((c) => chan.has(c)));
    });
  }
  function smallestVisible() {
    const list = visibleStructures();
    if (!list.length) return limitNm();
    return list.reduce((a, b) => (b.nm < a.nm ? b : a)).nm;
  }

  // ----- rendering one pane -----
  // Draws the specimen sharp at `fieldNm` across, then convolves it with the instrument's Gaussian.
  function renderPane(rect, key, fieldNm, centre, st, dpr, stretch = false) {
    const dw = Math.max(2, Math.round(rect.w * dpr));
    const dh = Math.max(2, Math.round(rect.h * dpr));
    const nmPerPx = fieldNm / dw;
    const sigmaNm = st.limitNm / 2;
    const sigmaPx = sigmaNm / nmPerPx;
    const flat = sigmaPx > dw / 4; // past this the image is one tone, and a 4000 px blur is not worth doing
    const m = flat ? 0 : Math.min(400, Math.ceil(sigmaPx * 2.5) + 2);
    const W = dw + m * 2;
    const H = dh + m * 2;
    const p = pane(key);
    if (p.sharp.width !== W || p.sharp.height !== H) {
      p.sharp.width = W;
      p.sharp.height = H;
      p.blur.width = W;
      p.blur.height = H;
    }
    const sg = p.sharp.getContext('2d');
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.clearRect(0, 0, W, H);
    sg.fillStyle = st.bg;
    sg.fillRect(0, 0, W, H);
    sg.save();
    const s = 1 / nmPerPx;
    sg.translate(W / 2, H / 2);
    sg.scale(s, s);
    sg.translate(-centre[0], -centre[1]);
    if (st.glow) sg.globalCompositeOperation = 'lighter';
    paintSpecimen(sg, sp, { nmPerPx }, st);
    sg.restore();

    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    const rx = Math.round(rect.x * dpr);
    const ry = Math.round(rect.y * dpr);
    g.beginPath();
    g.rect(rx, ry, dw, dh);
    g.clip();
    if (flat) {
      // The honest limit of an enormous blur: the mean of the field, with the faintest large-scale
      // variation left, because that is all that survives a PSF wider than the frame.
      const tiny = pane(`${key}-mean`);
      if (tiny.sharp.width !== 4) { tiny.sharp.width = 4; tiny.sharp.height = 4; }
      const tg = tiny.sharp.getContext('2d');
      tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.clearRect(0, 0, 4, 4);
      tg.drawImage(p.sharp, 0, 0, 4, 4);
      g.imageSmoothingEnabled = true;
      g.drawImage(tiny.sharp, rx, ry, dw, dh);
    } else {
      const bg = p.blur.getContext('2d');
      bg.setTransform(1, 0, 0, 1, 0, 0);
      bg.clearRect(0, 0, W, H);
      bg.filter = sigmaPx > 0.08 ? `blur(${sigmaPx.toFixed(2)}px)` : 'none';
      bg.drawImage(p.sharp, 0, 0);
      bg.filter = 'none';
      g.drawImage(p.blur, m, m, dw, dh, rx, ry, dw, dh);
    }
    g.restore();
    // Auto-levels on the detail, which is what a microscopist's software does to a faint field and what
    // makes the two test objects visible at all: a 100 nm object seen through a 196 nm point spread
    // function keeps about a tenth of its contrast, and a tenth of a stain is nothing on screen. The
    // stretch is one gain across all three channels, so it changes contrast and not colour, and the
    // inset is labelled with it. It cannot change where the two objects merge, because it is monotonic.
    if (stretch && !flat) {
      const img = g.getImageData(rx, ry, dw, dh);
      const d = img.data;
      const lo = [255, 255, 255];
      const hi = [0, 0, 0];
      for (let i = 0; i < d.length; i += 4) {
        for (let c = 0; c < 3; c += 1) {
          if (d[i + c] < lo[c]) lo[c] = d[i + c];
          if (d[i + c] > hi[c]) hi[c] = d[i + c];
        }
      }
      const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
      if (span > 5) {
        // Pivot on the field — the median of each channel, which in a frame that is mostly empty
        // cytoplasm is the cytoplasm — so an object darker than the field gets darker and one brighter
        // gets brighter. A mean over the border would be pulled about by whatever happened to be
        // lying along an edge, and a dark red stain would come out grey.
        const mid = [0, 0, 0];
        for (let c = 0; c < 3; c += 1) {
          const hist = new Uint32Array(256);
          for (let i = 0; i < d.length; i += 4) hist[d[i + c]] += 1;
          const half = (d.length / 4) / 2;
          let acc = 0;
          for (let v = 0; v < 256; v += 1) {
            acc += hist[v];
            if (acc >= half) { mid[c] = v; break; }
          }
        }
        // Metered on the middle two fifths of the frame, where the two objects are, so a bright scrap
        // of a neighbouring organelle at the edge cannot set the exposure and leave the pair in the dark.
        let dev = 1;
        const x0 = Math.floor(dw * 0.3);
        const x1 = Math.ceil(dw * 0.7);
        const y0 = Math.floor(dh * 0.3);
        const y1 = Math.ceil(dh * 0.7);
        for (let yy = y0; yy < y1; yy += 1) {
          for (let xx = x0; xx < x1; xx += 1) {
            const i = (yy * dw + xx) * 4;
            for (let c = 0; c < 3; c += 1) dev = Math.max(dev, Math.abs(d[i + c] - mid[c]));
          }
        }
        const gain = clamp(175 / dev, 1, 5);
        // Linear, and anything outside the exposure clips, exactly as an over-exposed region of a real
        // frame does. A soft knee was tried and rejected: it flattens the dip between the two objects,
        // which is the one thing in the frame the reader is being asked to look at.
        for (let i = 0; i < d.length; i += 4) {
          for (let c = 0; c < 3; c += 1) d[i + c] = clamp(mid[c] + (d[i + c] - mid[c]) * gain, 0, 255);
        }
        g.putImageData(img, rx, ry);
      }
    }
    return { rx, ry, dw, dh, nmPerPx, flat };
  }

  // ----- layout -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let narrow = null;
  let short = null;
  let padPx = 0;

  function applyLayout() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const hh = Math.round(r.height);
    if (!w || !hh) return false;
    const wantNarrow = w < NARROW_W || hh < NARROW_H;
    const wantShort = w < SHORT_W;
    if (wantNarrow !== narrow || wantShort !== short) {
      narrow = wantNarrow;
      short = wantShort;
      wrap.classList.toggle('is-narrow', narrow);
      wrap.classList.toggle('is-short', short);
    }
    const pad = Math.round(toolbar.getBoundingClientRect().height) + 22;
    if (pad > 20 && pad !== padPx) {
      padPx = pad;
      wrap.style.setProperty('--mi-pad', `${pad}px`);
    }
    return true;
  }

  function sizeCanvases() {
    const a = view.getBoundingClientRect();
    const b = ruler.getBoundingClientRect();
    const w = Math.round(a.width - 0);
    const hh = Math.round(a.height);
    if (!w || !hh) return false;
    const f = fitCanvas(canvas, w, hh);
    fitCanvas(rulerCanvas, Math.max(1, Math.round(b.width - 12)), Math.max(1, Math.round(b.height)));
    cw = w;
    ch = hh;
    dpr = f.dpr;
    return true;
  }

  // ----- the drawing -----
  function draw() {
    if (!cw) return;
    const lim = limitNm();
    const chan = new Set(activeChannels());
    const st = styleFor(state.instrument, palette, theme, film, {
      t, sep: state.separationNm, living: living(), channels: chan, wavelengthNm: state.wavelengthNm,
    });
    st.limitNm = lim;

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);

    // The micrograph fills the pane; the inset and its trace sit in the bottom-right corner of it.
    const frame = { x: 0, y: 0, w: cw, h: ch };
    const centre = state.instrument === 'tem' ? [sp.detail.x - 620, sp.testY + 60] : [0, 0];
    const main = renderPane(frame, 'main', FIELD[state.instrument], centre, st, dpr);

    // Where the detail region falls in the wide view, so the inset can be tied to it by a leader.
    const nmPerPx = main.nmPerPx / dpr;
    const mx = cw / 2 + (sp.detail.x - centre[0]) / nmPerPx;
    const my = ch / 2 + (sp.testY - centre[1]) / nmPerPx;
    const boxHalf = Math.max(5, DETAIL_FIELD / 2 / nmPerPx);

    const insetSize = clamp(Math.min(cw * 0.3, ch * 0.42), 74, 150);
    const traceH = Math.round(insetSize * 0.46);
    const pad = 8;
    // On a narrow stage the micrograph is short, so the trace sits beside the inset instead of under it:
    // stacked, the inset's top and its caption left the frame at a 390 px stage.
    const left = Boolean(narrow);
    const ix = left ? pad : cw - insetSize - pad;
    const iy = left ? ch - insetSize - pad - 4 : ch - insetSize - traceH - 32;
    const traceRect = left
      ? { x: ix + insetSize + 6, y: iy, w: insetSize, h: traceH }
      : { x: ix, y: iy + insetSize + 6, w: insetSize, h: traceH };
    const inset = renderPane({ x: ix, y: iy, w: insetSize, h: insetSize }, 'inset', DETAIL_FIELD, [sp.detail.x, sp.testY], st, dpr, st.mode !== 'sem');

    // Everything from here is interface, in CSS pixels over the image.
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const p = palette;
    const onFilm = (v) => film(v);

    // the marked region and its leader
    if (state.instrument !== 'tem' && mx > -boxHalf && mx < cw + boxHalf) {
      g.strokeStyle = p.gold;
      g.lineWidth = 1.25;
      g.setLineDash([]);
      g.strokeRect(Math.round(mx - boxHalf) + 0.5, Math.round(my - boxHalf) + 0.5, Math.max(6, boxHalf * 2), Math.max(6, boxHalf * 2));
      g.beginPath();
      g.moveTo(left ? mx - boxHalf : mx + boxHalf, my + boxHalf);
      g.lineTo(left ? ix + insetSize : ix, iy);
      g.globalAlpha = 0.5;
      g.stroke();
      g.globalAlpha = 1;
    }

    // the inset frame and its caption
    g.strokeStyle = p.gold;
    g.lineWidth = 1.25;
    g.strokeRect(ix + 0.5, iy + 0.5, insetSize - 1, insetSize - 1);
    g.font = `600 9.5px ${FONT}`;
    g.textAlign = 'right';
    g.textBaseline = 'alphabetic';
    g.fillStyle = onFilm(st.mode === 'tem' || st.mode === 'light' || st.mode === 'eye' ? 0.15 : 0.95);
    // The longest caption that fits the inset's own width, so it never runs off the frame.
    const captions = ['DETAIL 1.6 µm · contrast stretched', 'DETAIL 1.6 µm · stretched', 'DETAIL 1.6 µm', '1.6 µm'];
    const cap = captions.find((c) => g.measureText(c).width <= insetSize - 2) ?? captions[captions.length - 1];
    g.textAlign = left ? 'left' : 'right';
    g.fillText(cap, left ? ix : ix + insetSize, iy - 4);
    if (st.mode === 'sem') {
      // An instrument that only sees the surface cannot see two objects inside the cell, whatever its
      // limit is. Saying so where the two objects would have been is the lesson.
      g.textAlign = 'center';
      g.font = `600 10px ${FONT}`;
      g.fillStyle = onFilm(0.95);
      g.fillText('surface only', ix + insetSize / 2, iy + insetSize / 2 + 3);
      g.font = `9px ${FONT}`;
      g.fillText('the pair is inside the cell', ix + insetSize / 2, iy + insetSize / 2 + 16);
    }

    // the trace across the two test mitochondria, sampled from the pixels of the inset itself
    drawTrace(g, traceRect, inset, st, lim);

    // The verdict, set as a line of type under the trace with a halo of the instrument's own field, not
    // as a chip: the field is what it sits on, and a bordered pill over a micrograph read as a control.
    const ok = resolved();
    const verdict = st.mode === 'sem' ? 'not reached' : ok ? 'resolved · two' : 'one blur';
    const vx = left ? traceRect.x : cw - pad;
    const vy = traceRect.y + traceRect.h + 15;
    const vc = st.mode === 'sem' ? p.inkFaint : ok ? p.leaf : p.coral;
    const brightField = st.mode === 'fluorescence' || st.mode === 'sem';
    g.font = `600 11px ${FONT}`;
    g.textAlign = left ? 'left' : 'right';
    g.textBaseline = 'alphabetic';
    g.lineJoin = 'round';
    g.lineWidth = 3;
    g.strokeStyle = st.bg;
    g.fillStyle = brightField ? mix(vc, onFilm(1), 0.45) : mix(vc, onFilm(0), 0.3);
    g.strokeText(verdict, vx, vy + 1);
    g.fillText(verdict, vx, vy + 1);

    // the scale bar
    st.barRight = left;
    drawScaleBar(g, st, nmPerPx, cw, ch, onFilm);

    // the frame of the micrograph
    g.strokeStyle = p.ruleStrong;
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, cw - 1, ch - 1);

    drawRuler(lim);
    updatePanel(lim);
  }

  // The intensity trace: read back the blurred pixels of the inset along the line through the two test
  // mitochondria and plot how far each one departs from the field. Whether the picture shows one peak
  // or two is therefore not a claim made beside the picture, it is a measurement of the picture.
  function drawTrace(gg, rect, inset, st, lim) {
    const p = palette;
    const row = Math.round(inset.ry + inset.dh / 2);
    let data;
    try {
      data = g.getImageData(inset.rx, row, inset.dw, 1).data;
    } catch {
      data = null;
    }
    gg.save();
    gg.fillStyle = mix(p.paper, p.ink, 0.05);
    gg.beginPath();
    gg.roundRect(rect.x, rect.y, rect.w, rect.h, 3);
    gg.fill();
    gg.strokeStyle = p.rule;
    gg.lineWidth = 1;
    gg.stroke();
    if (st.mode === 'sem') {
      gg.font = `9.5px ${FONT}`;
      gg.textAlign = 'center';
      gg.textBaseline = 'middle';
      gg.fillStyle = p.inkFaint;
      gg.fillText('a surface has no trace through it', rect.x + rect.w / 2, rect.y + rect.h / 2);
      gg.restore();
      return;
    }
    if (inset.flat) {
      gg.font = `9.5px ${FONT}`;
      gg.textAlign = 'center';
      gg.textBaseline = 'middle';
      gg.fillStyle = p.inkFaint;
      gg.fillText('nothing to resolve', rect.x + rect.w / 2, rect.y + rect.h / 2);
      data = null;
    }
    if (data) {
      const n = inset.dw;
      const lum = new Float64Array(n);
      for (let i = 0; i < n; i += 1) {
        lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
      }
      // The field is what the ends of the line read; contrast is the departure from it, so a dark
      // object on a bright field and a bright object on black both come out as peaks.
      const edge = Math.max(2, Math.round(n * 0.06));
      let fieldL = 0;
      for (let i = 0; i < edge; i += 1) fieldL += lum[i] + lum[n - 1 - i];
      fieldL /= edge * 2;
      let peak = 1e-6;
      for (let i = 0; i < n; i += 1) peak = Math.max(peak, Math.abs(lum[i] - fieldL));
      gg.beginPath();
      for (let i = 0; i < n; i += 1) {
        const x = rect.x + (i / (n - 1)) * rect.w;
        const v = Math.abs(lum[i] - fieldL) / peak;
        const y = rect.y + rect.h - 3 - v * (rect.h - 8);
        if (i === 0) gg.moveTo(x, y);
        else gg.lineTo(x, y);
      }
      gg.strokeStyle = peak < 0.02 ? p.inkFaint : p.ink;
      gg.lineWidth = 1.4;
      gg.lineJoin = 'round';
      gg.stroke();
      if (peak < 0.02) {
        gg.font = `9.5px ${FONT}`;
        gg.textAlign = 'center';
        gg.textBaseline = 'middle';
        gg.fillStyle = p.inkFaint;
        gg.fillText('no signal', rect.x + rect.w / 2, rect.y + rect.h / 2);
      }
    }
    // The limit drawn to the same scale as the trace: a bracket as wide as d is on this axis.
    const wPerNm = rect.w / DETAIL_FIELD;
    const lw = lim * wPerNm;
    if (lw > 4 && lw < rect.w - 6) {
      const y = rect.y + 4.5;
      const x0 = rect.x + rect.w / 2 - lw / 2;
      gg.strokeStyle = p.leaf;
      gg.lineWidth = 1;
      gg.beginPath();
      gg.moveTo(x0, y + 2.5);
      gg.lineTo(x0, y);
      gg.lineTo(x0 + lw, y);
      gg.lineTo(x0 + lw, y + 2.5);
      gg.stroke();
    }
    gg.restore();
  }

  // A scale bar whose length is a round number of nanometres or micrometres at this magnification.
  function drawScaleBar(gg, st, nmPerPx, w, hgt, onFilm) {
    const want = w * 0.2;
    const steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];
    let nm = steps[0];
    for (const s of steps) if (s / nmPerPx <= want) nm = s;
    const px = nm / nmPerPx;
    const x = st.barRight ? w - 12 - nm / nmPerPx : 12;
    const y = hgt - 14;
    const bright = st.mode === 'fluorescence' || st.mode === 'sem';
    gg.strokeStyle = onFilm(bright ? 0.95 : 0.12);
    gg.fillStyle = onFilm(bright ? 0.95 : 0.12);
    gg.lineWidth = 2.5;
    gg.beginPath();
    gg.moveTo(x, y + 0.5);
    gg.lineTo(x + px, y + 0.5);
    gg.stroke();
    gg.font = `600 10px ${FONT}`;
    gg.textAlign = 'left';
    gg.textBaseline = 'alphabetic';
    gg.fillText(nm >= 1000 ? `${nm / 1000} µm` : `${nm} nm`, x, y - 5);
  }

  // The ruler: one log axis from a nanometre to a millimetre carrying every structure in the specimen,
  // with the current limit as a gate across it. Everything to the left of the gate is lost, and the gate
  // is the same number the panel prints, so the reader can watch the chapter's whole cast of structures
  // fall in and out of reach as they move a slider.
  function drawRuler(lim) {
    const w = rulerCanvas.width / dpr;
    const hgt = rulerCanvas.height / dpr;
    if (!w || hgt < 12) return;
    const p = palette;
    rg.setTransform(dpr, 0, 0, dpr, 0, 0);
    rg.clearRect(0, 0, w, hgt);
    const pad = 3;
    const plotW = w - pad * 2;
    const twoRows = hgt >= 50;
    // 15 px under the axis for the decade labels whatever the ruler's height: at 12 the phone ruler
    // cut the bottom off "1 µm".
    const y = Math.round(hgt - 15) + 0.5;
    const X = (nm) => pad + (Math.log10(nm) / 6) * plotW; // 1 nm .. 1 mm
    const chan = new Set(activeChannels());
    const shown = (s) => s.nm >= lim || (state.instrument === 'fluorescence' && s.channels.some((c) => chan.has(c)));
    const gate = clamp(X(lim), pad, pad + plotW);

    // Everything finer than the limit, shaded out.
    rg.fillStyle = mix(p.paper, p.ink, 0.06);
    rg.fillRect(pad, 1, gate - pad, y - 2);

    rg.strokeStyle = p.ruleStrong;
    rg.lineWidth = 1;
    rg.beginPath();
    rg.moveTo(pad, y);
    rg.lineTo(pad + plotW, y);
    rg.stroke();

    // Decade ticks, labelled under the axis at the three round units only.
    rg.font = `9.5px ${FONT}`;
    rg.textBaseline = 'top';
    rg.textAlign = 'center';
    const decades = [];
    for (let e = 0; e <= 6; e += 1) {
      const x = Math.round(X(10 ** e)) + 0.5;
      rg.strokeStyle = e % 3 === 0 ? p.ruleStrong : p.rule;
      rg.beginPath();
      rg.moveTo(x, y);
      rg.lineTo(x, y + (e % 3 === 0 ? 5 : 3));
      rg.stroke();
      if (e % 3) continue;
      decades.push([e, x]);
    }
    // The limit's own label first, then any decade label whose box clears it.
    rg.font = `600 9.5px ${FONT}`;
    const lt = lim >= 1000 ? `${human(lim / 1000, 2)} µm` : `${lim} nm`;
    const ltw = rg.measureText(lt).width;
    const ltx = clamp(gate, pad + ltw / 2, pad + plotW - ltw / 2);
    rg.textAlign = 'center';
    rg.fillStyle = mix(p.coral, p.ink, 0.3);
    rg.fillText(lt, ltx, y + 5);
    rg.font = `9.5px ${FONT}`;
    rg.fillStyle = p.inkFaint;
    for (const [e, x] of decades) {
      const label = ['1 nm', '', '', '1 µm', '', '', '1 mm'][e];
      const lw = rg.measureText(label).width;
      const lx = clamp(x, pad + lw / 2, pad + plotW - lw / 2);
      if (Math.abs(lx - ltx) < (lw + ltw) / 2 + 7) continue;
      rg.fillText(label, lx, y + 5);
    }

    // The gate: a coral rule with the number under it, in the decade-label row. Drawn before the names,
    // which carry a halo of the paper, so where it falls across a word the word wins.
    rg.strokeStyle = p.coral;
    rg.lineWidth = 1.6;
    rg.beginPath();
    rg.moveTo(Math.round(gate) + 0.5, 1);
    rg.lineTo(Math.round(gate) + 0.5, y + 4);
    rg.stroke();

    // The structures, on the axis, with their names above in one or two staggered rows.
    rg.textBaseline = 'alphabetic';
    rg.lineJoin = 'round';
    rg.lineWidth = 3;
    rg.strokeStyle = p.paper;
    const rows = twoRows ? [y - 7, y - 19] : [y - 7];
    const taken = rows.map(() => []);
    // A scanning instrument's ruler carries the surface structures; every other instrument's carries
    // the interior ones, so a microvillus and a nuclear pore never fight for the same 100 nm mark.
    const onRuler = STRUCTURES.filter((x) => (state.instrument === 'sem' ? x.surface : !x.surface || x.id === 'cell'));
    for (const s of [...onRuler].sort((a, b) => a.nm - b.nm)) {
      const x = X(s.nm);
      const on = shown(s);
      rg.beginPath();
      rg.arc(x, y, on ? 3.2 : 2.2, 0, TAU);
      rg.fillStyle = on ? p.leaf : p.inkFaint;
      rg.globalAlpha = on ? 1 : 0.5;
      rg.fill();
      rg.globalAlpha = 1;
      rg.font = `${on ? '600 ' : ''}9.5px ${FONT}`;
      const label = s.label.replace(/^(a|an|the) /, '');
      const tw = rg.measureText(label).width;
      const lx = clamp(x, pad + tw / 2 + 1, pad + plotW - tw / 2 - 1);
      const row = taken.findIndex((used) => used.every(([a, b]) => lx + tw / 2 + 5 < a || lx - tw / 2 - 5 > b));
      if (row < 0) continue;
      taken[row].push([lx - tw / 2, lx + tw / 2]);
      rg.textAlign = 'center';
      rg.fillStyle = on ? p.ink : p.inkFaint;
      rg.strokeStyle = p.paper;
      rg.lineWidth = 3;
      rg.strokeText(label, lx, rows[row]);
      rg.fillText(label, lx, rows[row]);
      if (Math.abs(lx - x) > 1) {
        rg.strokeStyle = p.rule;
        rg.lineWidth = 1;
        rg.beginPath();
        rg.moveTo(x, y - 4);
        rg.lineTo(lx, rows[row] + 2.5);
        rg.stroke();
      }
    }
  }

  // ----- the panel -----
  let shownLive = null;
  function updatePanel(lim) {
    const p = palette;
    const inst = state.instrument;
    title.textContent = NAMES[inst];
    note.textContent = NOTE[inst];
    const lightMode = inst === 'light' || inst === 'fluorescence';
    sWave.input.disabled = !lightMode;
    sNa.input.disabled = !lightMode;
    sWave.row.style.opacity = lightMode ? '1' : '0.42';
    sNa.row.style.opacity = lightMode ? '1' : '0.42';
    sWave.val.textContent = `${state.wavelengthNm} nm`;
    sNa.val.textContent = state.na.toFixed(2);
    sGap.val.textContent = `${state.separationNm} nm`;

    sWave.val.innerHTML = `<span class="mi-swatch" style="background:${wavelengthColour(p, state.wavelengthNm)}"></span>${state.wavelengthNm} nm`;
    if (lightMode) {
      abbe.innerHTML = `<i>d</i> = λ ÷ 2·NA = <b>${state.wavelengthNm}</b> ÷ (2 × <b>${state.na.toFixed(2)}</b>) = <span class="mi-d">${lim} nm</span>`;
    } else if (inst === 'eye') {
      abbe.innerHTML = `The limit is the eye's own: <span class="mi-d">0.1 mm</span> at the near point.`;
    } else if (inst === 'tem') {
      abbe.innerHTML = `Electrons, not light. On a stained section the limit is <span class="mi-d">${lim} nm</span>.`;
    } else {
      abbe.innerHTML = `Electrons off a metal-coated surface. The limit is <span class="mi-d">${lim} nm</span>.`;
    }

    chanWrap.hidden = inst !== 'fluorescence';
    for (const [i, b] of chanButtons.entries()) b.setAttribute('aria-pressed', String(state.channels.has(CHANNELS[i])));

    const list = visibleStructures();
    const sm = smallestVisible();
    const smallest = list.length ? list.reduce((a, b) => (b.nm < a.nm ? b : a)) : null;
    seen.innerHTML = smallest
      ? `Finest thing visible: <b>${smallest.label}</b>, ${sm >= 1000 ? `${sm / 1000} µm` : `${sm} nm`}.${inst === 'fluorescence' && smallest.nm < lim ? ' Below the limit, and visible only because it is labelled.' : ''}`
      : `Nothing in this cell is as big as ${lim >= 1000 ? `${lim / 1000} µm` : `${lim} nm`}, so nothing in it can be separated.`;

    // What this instrument throws away: the structures the reader has met that fall under the gate.
    const under = STRUCTURES
      .filter((x) => (inst === 'sem' ? x.surface : !x.surface))
      .filter((x) => !list.includes(x))
      .sort((a, b) => b.nm - a.nm)
      .slice(0, 3)
      .map((x) => x.label.replace(/^(a|an|the) /, ''));
    lost.innerHTML = under.length
      ? `Lost to the limit: ${under.join(', ')}${under.length === 3 ? ', and everything under them' : ''}.`
      : '';
    lost.hidden = under.length === 0;

    const live = living();
    if (live !== shownLive) {
      shownLive = live;
      liveChip.dataset.live = String(live);
      liveChip.textContent = live ? 'Living · it moves' : 'Fixed, dehydrated, in vacuum';
    }
  }

  // ----- the loop -----
  function changed() {
    draw();
  }

  function frame(now) {
    raf = 0;
    if (destroyed || !playing || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    if (living()) draw();
    raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (raf || destroyed || !playing || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const onKey = (e) => {
    const step = e.shiftKey ? 100 : 10;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      state.separationNm = clamp(state.separationNm + step, 50, 800);
      sGap.input.value = String(state.separationNm);
      draw();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      state.separationNm = clamp(state.separationNm - step, 50, 800);
      sGap.input.value = String(state.separationNm);
      draw();
    }
  };
  canvas.addEventListener('keydown', onKey);

  function onResize() {
    if (destroyed) return;
    if (!applyLayout()) return;
    if (!sizeCanvases()) return;
    draw();
    if (!ready) {
      ready = true;
      ctx.onReady();
    }
  }

  const fontsReady = document.fonts?.ready;
  if (fontsReady) fontsReady.then(() => { if (!destroyed && cw) draw(); });

  const observer = new ResizeObserver(onResize);
  observer.observe(root);
  observer.observe(view);
  observer.observe(ruler);
  observer.observe(toolbar);
  onResize();
  schedule();

  return {
    destroy() {
      destroyed = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener('keydown', onKey);
      panes.clear();
      root.replaceChildren();
    },
    setTime(seconds) {
      playing = false;
      stop();
      t = Math.max(0, Number(seconds) || 0);
      draw();
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else stop();
    },
    setTheme(nextTheme, nextPalette) {
      theme = nextTheme;
      palette = nextPalette;
      film = makeFilm(palette, theme);
      draw();
    },
    describe() {
      const lim = limitNm();
      return {
        instrument: state.instrument,
        wavelengthNm: Math.round(state.wavelengthNm),
        na: Number(state.na.toFixed(2)),
        limitNm: lim,
        separationNm: Math.round(state.separationNm),
        resolved: state.separationNm >= lim,
        channels: activeChannels(),
        livingSpecimen: living(),
        smallestVisibleNm: smallestVisible(),
      };
    },
  };
}
