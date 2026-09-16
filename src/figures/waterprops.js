// Four properties, one cause. A bench of four demonstrations that share one control: the strength of
// the hydrogen bond, from zero to the real value. Turn it down and all four fail together, which is the
// claim §2.3 makes and cannot otherwise show.
//
// Each panel is a model with its numbers written out, so the readouts are measurements of the model and
// not captions:
//
//   tension      surface tension γ(s) = 18 + 54s mN/m — 72 at full strength (water, measured), 18 with
//                no hydrogen bonding at all, which is about hexane's. A steel needle 1.0 mm across lies
//                on the surface while 2γ ≥ ρ g πd²/4 = 60.1 mN/m, so it floats above γ = 30.1 and sinks
//                below it: at s ≈ 0.22.
//   heat         specific heat c(s) = 2.0 + 2.18s J/g/K — 4.18 at full strength (water, measured), 2.0
//                with no bonds to break, which is what an ordinary liquid of this size costs. 100 g under
//                a 100 W heater beside 100 g of iron (0.449) or ethanol (2.44).
//   evaporation  latent heat L(s) = 0.35 + 2.05s MJ/kg — 2.4 at full strength, which is the chapter's
//                2.4 kJ per gram. Molecules leave at a rate that rises as L falls, and each one takes
//                L/(900 c) kelvin out of the dish with it. Weak bonds mean a fast, cold-blooded
//                evaporation that cools nothing.
//   ice          liquid density 1.000 − 7.0e-6 (T − Tmax)² g/cm³ with Tmax = 4s, so the turn at 4 °C
//                belongs to the hydrogen bond and goes when it does; solid density 1.08 − 0.163s, which
//                is 0.917 at full strength (ice, measured) and 1.08 with no bonds, when the solid sinks.
//
// Every panel is a pure function of (elapsed, s): elapsed is the clock less the moment the panel was
// last started, so setTime(t) reproduces a frame, and changing the slider restarts every panel so the
// run the reader watches is the run the numbers describe. The panels begin five seconds in, so a pinned
// screenshot at t = 0 shows a demonstration under way rather than four vessels sitting still.
import { alpha, mix } from '../palette.js';
import { mulberry32, clamp, clamp01, lerp, liquidDensity } from './lib/chem-atoms.js';

export const meta = { kind: 'waterprops', title: 'Four properties, one cause', needsWebGL: false, aspect: 16 / 9 };

const TAU = Math.PI * 2;
const SEED = 20260212;
const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const DISPLAY = 'Fraunces, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const PANELS = ['tension', 'heat', 'evaporation', 'ice'];
const TITLES = {
  tension: 'Surface tension',
  heat: 'Warming up',
  evaporation: 'Evaporating',
  ice: 'Freezing',
};
// What each demonstration claims, set under its name. A panel that opens with nothing but a 12 px
// label in the corner leaves the reader to work out what they are being shown.
const CLAIMS = {
  tension: 'water pulls on itself hard enough to hold up a steel needle',
  heat: 'the same heat into the same mass, and water barely warms',
  evaporation: 'the fastest molecules leave, and what stays behind is colder',
  ice: 'the solid is less dense than the liquid, so ice floats',
};
// What the reading is a reading of.
const QUANTITY = {
  tension: 'Surface tension',
  heat: 'Temperature',
  evaporation: 'In the dish',
  ice: 'Density',
};
// Below this stage width the panels stack instead of sitting side by side, and the labels shorten.
const NARROW_W = 620;
const PRESET = 5; // seconds each panel is already into its run when the clock is at zero

// tension
const NEEDLE_MM = 1.0;
const NEEDLE_LOAD = 7800 * 9.81 * (Math.PI * (NEEDLE_MM / 1000) ** 2) / 4 * 1000 / 2; // mN/m of γ needed
// heat
const HEAT_MASS = 100; // grams in each vessel
const HEAT_WATTS = 100;
const HEAT_SECONDS = 60; // simulated seconds of heating in a full run
const HEAT_PER_SEC = 5; // simulated seconds per second of clock
const COMPARISONS = { iron: 0.449, ethanol: 2.44 };
// evaporation
const EVAP_START_C = 30;
const EVAP_POOL = 900; // molecules the dish holds, of which about fifty are drawn
const EVAP_C = 4.18;
// ice
const ICE_START_C = 20;
const ICE_END_C = -10;
const ICE_SECONDS = 14;

const gamma = (s) => 18 + 54 * s;
const waterHeat = (s) => 2.0 + 2.18 * s;
const latent = (s) => 0.35 + 2.05 * s; // MJ/kg, which is kJ/g
const solidDensity = (s) => 1.08 - 0.163 * s;
const densestAt = (s) => 4 * s;

// How fast molecules leave the dish: an Arrhenius form in the latent heat, with the spread written out
// so the whole slider does something instead of saturating at one end.
function evapRate(s, tempC) {
  const dE = (latent(s) - latent(1)) * 18; // kJ/mol against water's own
  return clamp(1.6 * Math.exp(-dE / 12) * Math.exp((tempC - EVAP_START_C) / 30), 0, 25);
}

export function mount(root, ctx) {
  let palette = ctx.palette;
  let theme = ctx.theme;
  const reduced = Boolean(ctx.reducedMotion);
  const rand = mulberry32(SEED);

  let t = ctx.pinnedTime ?? 0;
  let playing = !reduced && ctx.pinnedTime === null;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let ready = false;
  let narrow = null;
  let lastFrameMs = 0;

  let panel = 'tension';
  let strength = 1;
  let comparison = 'iron';
  const startedAt = { tension: -PRESET, heat: -PRESET, evaporation: -PRESET, ice: -PRESET };
  const elapsed = () => Math.max(0, t - startedAt[panel]);

  // Seeded furniture: where the molecules sit in each panel, and how they jiggle.
  const jitter = (n) => Array.from({ length: n }, () => ({
    u: rand(), v: rand(), f: 0.6 + rand() * 1.5, p: rand() * TAU,
    g: 0.5 + rand() * 1.4, q: rand() * TAU, rank: rand(),
  }));
  const pools = {
    tension: jitter(58),
    evaporation: jitter(52),
    ice: jitter(76),
  };

  // ----- DOM -----
  const style = document.createElement('style');
  style.textContent = `
    .tb-wp { position: absolute; inset: 0; font-family: var(--font-ui); }
    .tb-wp canvas { display: block; width: 100%; height: 100%; outline: none; }
    .tb-wp canvas:focus-visible { box-shadow: inset 0 0 0 2px var(--water); }
    /* The reading, set as a marginal note: a hairline spine with the type hung off it, flush left so
       the rag falls at the outside edge of the picture. It was a rounded box with a blurred backdrop,
       set ragged-left — interface furniture, and the same panel the soup figure has now dropped. */
    .tb-wp .wp-read { position: absolute; top: var(--space-4); right: var(--space-4);
      width: min(16.5rem, 44%); padding-left: 0.6rem; border-left: 1px solid var(--rule-strong); }
    .tb-wp .wp-read i { display: block; font-style: normal; font-size: 0.625rem; font-weight: 600;
      letter-spacing: 0.13em; text-transform: uppercase; color: var(--ink-faint); line-height: 1.2; }
    .tb-wp .wp-read b { display: block; font-family: var(--font-display); font-size: var(--text-lg);
      font-weight: 500; color: var(--ink); line-height: 1.06; margin-top: 0.1rem;
      font-variant-numeric: lining-nums tabular-nums; }
    .tb-wp .wp-read span { display: block; font-size: var(--text-xs); color: var(--ink-soft);
      line-height: 1.4; margin-top: 0.25rem; white-space: pre-line;
      font-variant-numeric: lining-nums tabular-nums; }
    .tb-wp .wp-hb { display: inline-flex; align-items: center; gap: 0.45rem;
      background: color-mix(in srgb, var(--paper) 88%, transparent); border: 1px solid var(--rule);
      border-radius: 999px; padding: 0.2rem 0.7rem 0.2rem 0.6rem; }
    .tb-wp .wp-hb input { width: 7.5rem; accent-color: var(--water); }
    .tb-wp .wp-val { min-width: 7.4rem; font-size: var(--text-xs); color: var(--ink); font-weight: 600;
      font-variant-numeric: lining-nums tabular-nums; }
    .tb-wp .fig-toolbar { align-items: center; }
    /* Narrower controls on a phone, so the seven of them make two rows and not three with Play alone on
       the third: the strength slider is short and its value is the percentage alone. */
    .tb-wp.is-narrow .wp-hb input { width: 3.2rem; }
    .tb-wp.is-narrow .wp-val { min-width: 2.3rem; }
    /* The reading stands beside the title in the band above the picture, at 58% so the title clears its
       spine. The eyebrow goes: on a phone it sat next to the title and, for the tension panel, said the
       same two words again. */
    .tb-wp.is-narrow .wp-read { width: 58%; top: var(--space-3); right: var(--space-3); }
    .tb-wp.is-narrow .wp-read i { display: none; }
    .tb-wp.is-narrow .wp-read b { font-size: var(--text-base); }
    .tb-wp.is-narrow .fig-btn { padding: 0.26rem 0.44rem; }
    .tb-wp.is-narrow .fig-toolbar { gap: 0.28rem; }
    .tb-wp .wp-long { display: inline; }
    .tb-wp .wp-short { display: none; }
    .tb-wp.is-narrow .wp-long { display: none; }
    .tb-wp.is-narrow .wp-short { display: inline; }
  `;
  const wrap = document.createElement('div');
  wrap.className = 'tb-wp';
  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label',
    'A bench of four demonstrations sharing one control for the strength of the hydrogen bond: a needle on a water surface, two vessels warming under identical heaters, a dish losing its fastest molecules, and a tank freezing. Space pauses or plays, the arrow keys step time.');
  const readout = document.createElement('div');
  readout.className = 'wp-read fig-ui';
  const readEyebrow = document.createElement('i');
  const readBig = document.createElement('b');
  const readSmall = document.createElement('span');
  readout.append(readEyebrow, readBig, readSmall);
  const toolbar = document.createElement('div');
  toolbar.className = 'fig-toolbar fig-ui';

  const button = (long, short, onClick, pressed = null) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fig-btn';
    const a = document.createElement('span');
    a.className = 'wp-long';
    a.textContent = long;
    const c = document.createElement('span');
    c.className = 'wp-short';
    c.textContent = short ?? long;
    b.append(a, c);
    b.setAttribute('aria-label', long);
    if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', onClick);
    toolbar.append(b);
    return b;
  };
  const setLabel = (node, text, short) => {
    node.querySelector('.wp-long').textContent = text;
    node.querySelector('.wp-short').textContent = short ?? text;
    node.setAttribute('aria-label', text);
  };

  // The short labels a phone shows; the accessible name is always the title.
  const SHORT = { tension: 'Tension', heat: 'Warming', evaporation: 'Evaporating', ice: 'Freezing' };
  const panelButtons = {};
  for (const p of PANELS) {
    panelButtons[p] = button(TITLES[p], SHORT[p], () => {
      panel = p;
      for (const q of PANELS) panelButtons[q].setAttribute('aria-pressed', String(q === panel));
      btnComparison.hidden = panel !== 'heat';
      draw();
    }, p === panel);
  }

  const hbBox = document.createElement('label');
  hbBox.className = 'wp-hb';
  const range = document.createElement('input');
  range.type = 'range';
  range.className = 'fig-range';
  range.min = '0';
  range.max = '100';
  range.step = '1';
  range.value = '100';
  range.setAttribute('aria-label', 'Hydrogen-bond strength, from none to the real value');
  const hbVal = document.createElement('span');
  hbVal.className = 'wp-val';
  hbBox.append(range, hbVal);
  toolbar.append(hbBox);

  const btnComparison = button('Compare with ethanol', 'Ethanol', () => {
    comparison = comparison === 'iron' ? 'ethanol' : 'iron';
    setLabel(btnComparison,
      comparison === 'iron' ? 'Compare with ethanol' : 'Compare with iron',
      comparison === 'iron' ? 'Ethanol' : 'Iron');
    restart();
  });
  btnComparison.hidden = panel !== 'heat';
  const btnRestart = button('Restart', 'Restart', () => restart());
  const btnPlay = button('Pause', 'Pause', () => setPlaying(!playing));

  wrap.append(canvas, readout, toolbar);
  root.append(style, wrap);

  const g = canvas.getContext('2d');
  if (!g) {
    ctx.onError(new Error('this bench needs a 2D canvas context and this browser gave none'));
    return { destroy() { root.replaceChildren(); }, setTime() {}, describe() { return {}; }, setVisible() {}, setTheme() {} };
  }

  // ----- sizing -----
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let toolbarH = 46;
  // How far down the reading reaches, measured rather than guessed. A chart whose top was a constant
  // 88 px ran its own curves through the reading on a stage where the reading was taller than that.
  let readH = 96;

  function resize() {
    const r = root.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (!w || !h) return false;
    const nextDpr = Math.min(2, window.devicePixelRatio || 1);
    const wantNarrow = w < NARROW_W;
    if (wantNarrow !== narrow) {
      narrow = wantNarrow;
      wrap.classList.toggle('is-narrow', narrow);
    }
    if (w === cw && h === ch && nextDpr === dpr) return true;
    cw = w;
    ch = h;
    dpr = nextDpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    return true;
  }

  // ----- colours -----
  let col = null;
  function buildColours() {
    const p = palette;
    const dark = theme === 'dark';
    col = {
      dark,
      ink: p.ink,
      soft: p.inkSoft,
      faint: p.inkFaint,
      rule: p.rule,
      ruleStrong: p.ruleStrong,
      paper: p.paper,
      paper2: p.paper2,
      water: p.water,
      waterFill: alpha(p.water, dark ? 0.15 : 0.16),
      // Every atom in chapter 2 is a lit sphere: a highlight, a body, a shaded side.
      oLit: dark ? mix(p.coral, p.paper3, 0.16) : mix(p.coral, '#ffffff', 0.68),
      o: dark ? mix(p.coral, p.paper, 0.34) : mix(p.coral, '#ffffff', 0.32),
      oDeep: dark ? mix(p.coral, '#000000', 0.32) : mix(p.coral, p.ink, 0.20),
      oEdge: p.coral,
      // Hydrogen is the paper-coloured atom; on dark paper the token is the background, so it is lifted
      // towards the ink instead and still reads as the pale small one.
      hLit: dark ? mix(p.paper3, p.ink, 0.20) : '#ffffff',
      h: dark ? mix(p.paper3, p.ink, 0.45) : mix(p.paper3, '#ffffff', 0.2),
      hDeep: dark ? mix(p.paper3, p.ink, 0.66) : mix(p.paper3, p.ink, 0.14),
      hEdge: dark ? mix(p.ruleStrong, p.ink, 0.3) : mix(p.ruleStrong, p.ink, 0.22),
      // The hydrogen bond is the weak one and is drawn like one: short dashes at a weight well under
      // the molecules', rather than the long mid-grey rules that made a spider's web of the liquid.
      bond: dark ? mix(p.inkSoft, p.paper, 0.26) : mix(p.inkSoft, p.paper3, 0.20),
      gold: p.gold,
      coral: p.coral,
      leaf: p.leaf,
      violet: p.violet,
      metal: p.inkSoft,
    };
  }
  buildColours();

  // ----- small drawing helpers -----
  const text = (str, x, y, { size = 11, weight = 400, colour = col.soft, align = 'left', base = 'alphabetic', halo = false } = {}) => {
    g.font = `${weight} ${size}px ${FONT}`;
    g.textAlign = align;
    g.textBaseline = base;
    // A paper halo behind the glyphs where the words sit on the drawing, so a caption never has a
    // molecule through the middle of it.
    if (halo) {
      g.lineJoin = 'round';
      g.lineWidth = 3.4;
      g.strokeStyle = alpha(col.paper, 0.88);
      g.strokeText(str, x, y);
    }
    g.fillStyle = colour;
    g.fillText(str, x, y);
  };

  // One water molecule: an oxygen with two hydrogens at 104.5°, the same creature as in Figure 2.1.
  //
  // Drawn as a schematic, not to van der Waals scale. At the real radii — oxygen 152 pm, hydrogen 120,
  // the bond between them 96 — the two hydrogens sit almost entirely inside the oxygen, and at the ten
  // pixels a molecule gets in this bench what came out was an orange disc with a grey crescent on its
  // shoulder, stamped four hundred times in the same orientation. Nothing here measures a molecule, so
  // the hydrogens are held out at the bond length they would have if the atoms were half their size,
  // and the bend can be seen. Figure 2.1, which *is* to scale, says so and draws them the true way.
  const LIT = [-0.36, -0.40]; // the highlight, in radii: the same light as every other atom in chapter 2
  function litDisc(x, y, r, lit, body, deep, edge, lw) {
    const grad = g.createRadialGradient(
      x + LIT[0] * r, y + LIT[1] * r, r * 0.05,
      x + LIT[0] * r * 0.5, y + LIT[1] * r * 0.5, r * 1.4,
    );
    grad.addColorStop(0, lit);
    grad.addColorStop(0.48, body);
    grad.addColorStop(1, deep);
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fillStyle = grad;
    g.fill();
    if (lw > 0) {
      g.lineWidth = lw;
      g.strokeStyle = edge;
      g.stroke();
    }
  }

  function molecule(x, y, r, rot) {
    const half = (104.5 / 2) * (Math.PI / 180);
    const lw = r > 7 ? Math.max(0.7, r * 0.12) : 0;
    for (const k of [-1, 1]) {
      const a = rot + k * half;
      litDisc(x + Math.sin(a) * r * 0.92, y - Math.cos(a) * r * 0.92, r * 0.46,
        col.hLit, col.h, col.hDeep, col.hEdge, lw * 0.85);
    }
    litDisc(x, y, r * 0.66, col.oLit, col.o, col.oDeep, col.oEdge, lw);
  }

  // A hydrogen bond: two short ticks in the gap between two molecules, drawn at a weight the slider
  // sets. The ticks are a fixed length measured from each molecule's rim, not a fraction of however far
  // apart the pair happens to be: as fractions they stretched with the span, and a field of them read
  // as a web of long grey rules rather than as the flicker of something weak.
  function links(pairs, s, r) {
    if (s <= 0.02) return;
    g.lineWidth = Math.max(0.9, 0.8 + s * 0.8);
    g.strokeStyle = col.bond;
    g.globalAlpha = 0.3 + 0.6 * s;
    g.lineCap = 'round';
    g.beginPath();
    for (const [x1, y1, x2, y2] of pairs) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const d = Math.hypot(dx, dy) || 1;
      const a = (r * 0.8) / d; // just outside one molecule
      const b = 1 - a; // just outside the other
      if (b - a < 0.1) continue;
      const m = (a + b) / 2;
      const tick = Math.min((b - a) * 0.3, 4.5 / d);
      g.moveTo(x1 + dx * (m - tick * 2), y1 + dy * (m - tick * 2));
      g.lineTo(x1 + dx * (m - tick), y1 + dy * (m - tick));
      g.moveTo(x1 + dx * (m + tick), y1 + dy * (m + tick));
      g.lineTo(x1 + dx * (m + tick * 2), y1 + dy * (m + tick * 2));
    }
    g.stroke();
    g.globalAlpha = 1;
    g.lineCap = 'butt';
  }

  function axes(x0, y0, x1, y1, xLabel, yLabel) {
    g.strokeStyle = col.ruleStrong;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x0 + 0.5, y0);
    g.lineTo(x0 + 0.5, y1 + 0.5);
    g.lineTo(x1, y1 + 0.5);
    g.stroke();
    text(xLabel, x1, y1 + 15, { size: 10, colour: col.faint, align: 'right', base: 'top' });
    text(yLabel, x0 - 2, y0 - 8, { size: 10, colour: col.faint, base: 'alphabetic' });
  }

  // ----- panel: surface tension -----
  // An arrow of length L from (x, y) in direction a.
  function arrow(x, y, a, L, colour, weight = 1.8) {
    const ex = x + Math.cos(a) * L;
    const ey = y + Math.sin(a) * L;
    g.strokeStyle = colour;
    g.fillStyle = colour;
    g.lineWidth = weight;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(ex, ey);
    g.stroke();
    const k = 4 + weight;
    g.beginPath();
    g.moveTo(ex, ey);
    g.lineTo(ex - Math.cos(a - 0.42) * k, ey - Math.sin(a - 0.42) * k);
    g.lineTo(ex - Math.cos(a + 0.42) * k, ey - Math.sin(a + 0.42) * k);
    g.closePath();
    g.fill();
  }

  // A short label for text that has to sit over the drawing, with a soft paper halo behind the glyphs
  // rather than a filled slip under them: a rounded rectangle in the middle of a liquid reads as a
  // sticker stuck on the picture.
  function pill(str, cx, cy) {
    g.font = `600 10.5px ${FONT}`;
    const tw = g.measureText(str).width;
    const x = clamp(cx - tw / 2, 8, Math.max(8, cw - tw - 10));
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineWidth = 3.4;
    g.strokeStyle = alpha(col.paper, 0.88);
    g.strokeText(str, x, cy);
    g.fillStyle = col.water;
    g.fillText(str, x, cy);
  }

  // A caption in the air above the surface, with a hairline down to the molecule it names.
  function caption(lines, x, y, tx, ty, align) {
    g.strokeStyle = col.rule;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y + 4);
    g.lineTo(tx, ty);
    g.stroke();
    lines.forEach((line, i) => text(line, x, y - (lines.length - 1 - i) * 13, {
      size: 10.5, weight: i === 0 ? 600 : 400, colour: i === 0 ? col.water : col.soft, align, base: 'alphabetic',
    }));
  }

  function drawTension(w, h, s, e) {
    const gm = gamma(s);
    const floats = gm >= NEEDLE_LOAD;
    // A little lower on a phone, where the band of air above the surface holds the title and the
    // reading and has to hold the needle's caption under them.
    const surfaceY = Math.round(h * (narrow ? 0.40 : 0.36));
    const bottomY = h - 14;
    // The body of the water, deepening downwards. A flat rectangle of one tint edge to edge is a
    // swatch; a body that darkens with depth is water seen from the side.
    const body = g.createLinearGradient(0, surfaceY, 0, bottomY);
    body.addColorStop(0, alpha(col.water, col.dark ? 0.10 : 0.11));
    body.addColorStop(1, alpha(col.water, col.dark ? 0.22 : 0.23));
    g.fillStyle = body;
    g.fillRect(0, surfaceY, w, bottomY - surfaceY);
    g.strokeStyle = col.ruleStrong;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(0, bottomY + 0.5);
    g.lineTo(w, bottomY + 0.5);
    g.stroke();

    // A loose raft rather than wallpaper: three rows of large molecules, jittered by nearly half the
    // spacing and linked only to what is genuinely next to them, so it reads as a liquid.
    // Close enough together to be a liquid. At eight columns the molecules stood a hundred and twenty
    // pixels apart with two small ticks in the middle of the gap, which is a gas with a rumour of a
    // bond in it; at seventeen they are two diameters apart and the links are short.
    const cols = clamp(Math.round(w / 56), 8, 20);
    const rows = clamp(Math.round((bottomY - surfaceY) / 50), 3, 8);
    const step = w / cols;
    const r = clamp(step * 0.21, 8, 14);
    const pts = [];
    let k = 0;
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const q = pools.tension[k % pools.tension.length];
        k += 1;
        const x = (i + 0.5 + (j % 2 ? 0.5 : 0)) * step + (q.u - 0.5) * step * 0.44
          + (reduced ? 0 : Math.sin(e * q.f + q.p) * 3);
        // The first row sits against the surface rather than a gap below it: the molecules at the top
        // of a liquid are what the whole panel is about.
        const y = surfaceY + r * 1.35 + (j * (bottomY - surfaceY - r * 3)) / Math.max(1, rows - 1)
          + (q.v - 0.5) * 20 + (reduced ? 0 : Math.cos(e * q.g + q.q) * 3);
        pts.push([x, Math.min(y, bottomY - r - 2), q.p]);
      }
    }
    // Only what is genuinely next to it: at 1.3 the reach caught the row beyond and every molecule
    // ended up linked to six, which is a mesh rather than a liquid.
    const span = Math.min(step, (bottomY - surfaceY - r * 3) / Math.max(1, rows - 1) || step) * 1.06;
    const pairs = [];
    for (let a = 0; a < pts.length; a += 1) {
      for (let b = a + 1; b < pts.length; b += 1) {
        if (Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]) < span) {
          pairs.push([pts[a][0], pts[a][1], pts[b][0], pts[b][1]]);
        }
      }
    }
    links(pairs, s, r);
    // Each molecule turned its own way. Stamped at one angle, four hundred of them are a wallpaper
    // pattern with a visible grid, which is the one thing a liquid is not.
    for (const [x, y, rot] of pts) molecule(x, y, r, rot);

    // The mechanism, on two molecules rather than on all of them: one at the surface with nothing above
    // it, and one in the middle of the liquid with neighbours all round. Both captions sit in the air,
    // where there is room for them.
    const sx = Math.round(w * 0.14);
    const dx = Math.round(w * 0.86);
    const sy = surfaceY + 24;
    const dy2 = Math.round(surfaceY + (bottomY - surfaceY) * 0.68);
    const L = 16 + 20 * s;
    g.globalAlpha = 0.4 + 0.6 * s;
    for (const a of [Math.PI, 0, Math.PI / 2, 2.25, 0.89]) arrow(sx, sy, a, L, col.water);
    for (let i = 0; i < 8; i += 1) arrow(dx, dy2, (i / 8) * Math.PI * 2, L * 0.8, col.water, 1.5);
    g.globalAlpha = 1;
    // The molecule is drawn after its arrows, so it covers the ends they radiate from. A disc behind it
    // only read as a shadow on dark paper.
    for (const [x, y] of [[sx, sy], [dx, dy2]]) molecule(x, y, r, 0.6);

    if (!narrow && surfaceY > 62) {
      caption(['At the surface', 'pulled sideways and down, never up'], 14, surfaceY - 34, sx - L - 4, sy - 4, 'left');
      // The right of the air band belongs to the readout panel, so this one sits on the water under its
      // own molecule, on a slip of paper.
      pill('Inside: the same pull in every direction', dx, Math.min(bottomY - 8, dy2 + L * 0.8 + 18));
    }

    // The surface itself, dimpling under the needle, and the needle.
    const nx = w * 0.5;
    const sink = floats ? 0 : clamp01((e - 0.6) / 1.6);
    const dip = floats ? 5 + 13 * clamp01(gm / 72) : 16 * (1 - sink);
    const nh = Math.max(6, Math.min(11, h * 0.032));
    const ny = floats ? surfaceY + dip - nh * 0.35 : lerp(surfaceY + dip, bottomY - nh, sink * sink);
    const nw = Math.min(w * 0.26, 156);
    g.strokeStyle = col.water;
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(0, surfaceY);
    g.lineTo(nx - nw * 0.78, surfaceY);
    if (sink < 1) {
      g.quadraticCurveTo(nx - nw * 0.38, surfaceY + dip * 1.35, nx, surfaceY + dip);
      g.quadraticCurveTo(nx + nw * 0.38, surfaceY + dip * 1.35, nx + nw * 0.78, surfaceY);
    } else {
      g.lineTo(nx + nw * 0.78, surfaceY);
    }
    g.lineTo(w, surfaceY);
    g.stroke();
    // The needle, as steel: a bright edge along the top, the body below it, a dark underside. A flat
    // black bar reads as a line of ink, not as a thing lying on a surface.
    const steel = g.createLinearGradient(0, ny - nh / 2, 0, ny + nh / 2);
    steel.addColorStop(0, mix(col.ink, col.paper, col.dark ? 0.72 : 0.62));
    steel.addColorStop(0.34, mix(col.ink, col.paper, col.dark ? 0.30 : 0.16));
    steel.addColorStop(1, col.dark ? mix(col.ink, '#000000', 0.5) : col.ink);
    g.beginPath();
    g.roundRect(nx - nw / 2, ny - nh / 2, nw, nh, nh / 2);
    g.fillStyle = steel;
    g.fill();
    g.beginPath();
    g.roundRect(nx - nw / 2 + nh * 0.5, ny - nh * 0.34, nw - nh, nh * 0.2, nh * 0.1);
    g.fillStyle = alpha(col.paper, 0.5);
    g.fill();
    // The two contact lines that hold it up, pulling up and out along the surface.
    if (sink < 0.6) {
      g.globalAlpha = 0.45 + 0.55 * s;
      arrow(nx - nw * 0.52, ny, -2.5, 12 + 18 * s, col.leaf, 2.2);
      arrow(nx + nw * 0.52, ny, -0.64, 12 + 18 * s, col.leaf, 2.2);
      g.globalAlpha = 1;
    }
    // On a phone the reading stands in the same air; a caption that would run into it is left out
    // rather than set through its last line, which is what it was.
    const captionY = ny - nh - 26;
    if (!narrow || captionY - 10 > readH + 2) {
      // Haloed once the needle has gone under, where the caption follows it in among the molecules.
      text(narrow ? 'steel needle' : `steel needle, ${NEEDLE_MM.toFixed(1)} mm across`, nx, captionY,
        { size: 10.5, colour: col.soft, align: 'center', base: 'alphabetic', halo: captionY > surfaceY });
    }

    return {
      surfaceTensionMNm: Number(gm.toFixed(1)),
      needleFloats: floats,
    };
  }

  // ----- panel: specific heat -----
  function drawHeat(w, h, s, e) {
    const cW = waterHeat(s);
    const cC = COMPARISONS[comparison];
    const secs = Math.min(HEAT_SECONDS, e * HEAT_PER_SEC);
    const joules = HEAT_WATTS * secs;
    const tempOf = (c, J) => Math.min(100, 20 + J / (HEAT_MASS * c));
    const wT = tempOf(cW, joules);
    const cT = tempOf(cC, joules);

    const stack = narrow;
    // On a phone everything stacks under the reading, which stands beside the title in the band at the
    // top: the vessels first, at a size their two lines of label allow, then the chart in what is left.
    // They were laid out from the top of the stage, and the reading sat on the right-hand vessel.
    const y0 = stack ? readH + 10 : 0;
    const vesselH = stack ? 118 : h - 26;
    const chartX = stack ? 34 : Math.round(w * 0.42);
    // Clear of the reading in the top right corner: a chart drawn up there loses its first quarter,
    // which for both of these is the part that matters. Twenty-two, not fourteen, because the axis
    // label and the series name at the top of the chart stand ten pixels above its first gridline.
    const chartY = stack ? y0 + vesselH + 24 : Math.max(readH + 22, Math.round(h * 0.22));
    const chartW = (stack ? w - 46 : w - chartX - 18);
    const chartH = h - chartY - 36;
    const vesselW = stack ? w - 24 : chartX - 26;

    // Two vessels under identical heaters, centred in the room they have. On a phone they are a fixed
    // 64 by 56: at the width the room allows they came out twice as wide as tall, which is a dish.
    const vw = stack ? 64 : clamp(vesselW / 2.9, 42, 96);
    const gap = vw * 0.62;
    const x0 = 12 + Math.max(0, (vesselW - (2 * vw + gap)) / 2);
    const bh = stack ? 56 : clamp(vesselH - 74, 40, 210);
    const top = stack ? y0 + 6 : Math.max(16, (vesselH - bh - 54) / 2 + 10);
    const pair = [
      { name: 'Water', temp: wT, c: cW, colour: col.water, x: x0 + vw / 2 },
      {
        name: comparison === 'iron' ? 'Iron' : 'Ethanol',
        temp: cT,
        c: cC,
        colour: comparison === 'iron' ? col.metal : col.violet,
        x: x0 + vw * 1.5 + gap,
      },
    ];
    // Two beakers, drawn as beakers: a glass wall open at the top with a lip on it, the contents to a
    // level with a meniscus at the top of them, and a flame underneath. The pair were two outlined
    // rectangles with a flat wash in them and four gold chevrons below, which reads as a wireframe.
    for (const v of pair) {
      const x0 = v.x - vw / 2;
      const lip = Math.min(5, vw * 0.07);
      const level = top + bh * 0.22;
      // the contents, filling in colour as they warm
      const fill = clamp01((v.temp - 20) / 80);
      const liquid = g.createLinearGradient(0, level, 0, top + bh);
      liquid.addColorStop(0, alpha(v.colour, 0.16 + 0.34 * fill));
      liquid.addColorStop(1, alpha(v.colour, 0.28 + 0.42 * fill));
      g.fillStyle = liquid;
      g.beginPath();
      g.moveTo(x0 + 1.5, level);
      g.lineTo(x0 + vw - 1.5, level);
      g.lineTo(x0 + vw - 1.5, top + bh - 3);
      g.quadraticCurveTo(x0 + vw - 1.5, top + bh - 1, x0 + vw - 4, top + bh - 1);
      g.lineTo(x0 + 4, top + bh - 1);
      g.quadraticCurveTo(x0 + 1.5, top + bh - 1, x0 + 1.5, top + bh - 3);
      g.closePath();
      g.fill();
      // the meniscus, and the glass
      g.strokeStyle = alpha(v.colour, 0.7);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(x0 + 1.5, level + 1);
      g.quadraticCurveTo(v.x, level - 2.5, x0 + vw - 1.5, level + 1);
      g.stroke();
      g.strokeStyle = col.ruleStrong;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x0 - lip, top - 2);
      g.lineTo(x0, top + 3);
      g.lineTo(x0, top + bh - 4);
      g.quadraticCurveTo(x0, top + bh, x0 + 4, top + bh);
      g.lineTo(x0 + vw - 4, top + bh);
      g.quadraticCurveTo(x0 + vw, top + bh, x0 + vw, top + bh - 4);
      g.lineTo(x0 + vw, top + 3);
      g.lineTo(x0 + vw + lip, top - 2);
      g.stroke();
      // A highlight down the near wall: the one mark that says glass rather than outline.
      g.strokeStyle = alpha(col.paper, col.dark ? 0.5 : 0.9);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0 + 5, top + bh * 0.34);
      g.lineTo(x0 + 5, top + bh - 8);
      g.stroke();
      // the flame
      for (let i = 0; i < 5; i += 1) {
        const fx = x0 + 6 + (i * (vw - 12)) / 4;
        const fh = 10 + (reduced ? 3 : 3 * Math.abs(Math.sin(e * 6 + i)));
        const flame = g.createLinearGradient(0, top + bh + 2, 0, top + bh + 2 + fh);
        flame.addColorStop(0, alpha(col.gold, 0.95));
        flame.addColorStop(1, alpha(col.coral, 0.55));
        g.fillStyle = flame;
        g.beginPath();
        g.moveTo(fx - 3.5, top + bh + 2 + fh);
        g.quadraticCurveTo(fx, top + bh + 2, fx + 3.5, top + bh + 2 + fh);
        g.closePath();
        g.fill();
      }
      g.font = `500 15px ${DISPLAY}`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillStyle = v.colour;
      g.fillText(`${v.temp.toFixed(1)} °C`, v.x, top + bh + 26);
      text(`${v.name} · ${v.c.toFixed(2)} J/g/K`, v.x, top + bh + 45, { size: 10, colour: col.soft, align: 'center', base: 'top' });
    }

    // The trace.
    const x1 = chartX + chartW;
    const y1 = chartY + chartH;
    const X = (J) => chartX + (J / (HEAT_WATTS * HEAT_SECONDS)) * chartW;
    const Y = (T) => y1 - ((T - 20) / 80) * chartH;
    g.strokeStyle = col.rule;
    g.lineWidth = 1;
    for (let T = 20; T <= 100; T += 20) {
      const y = Math.round(Y(T)) + 0.5;
      g.beginPath();
      g.moveTo(chartX, y);
      g.lineTo(x1, y);
      g.stroke();
      text(String(T), chartX - 5, y, { size: 9.5, colour: col.faint, align: 'right', base: 'middle' });
    }
    axes(chartX, chartY, x1, y1, `${Math.round(joules)} J added`, '°C');
    // Both curves for the whole run, drawn faintly, with the part that has happened drawn over them.
    // The axis spans the full 6000 J, so five seconds in the traces were two pixels long in a large
    // empty grid and the panel read as a wireframe waiting for data.
    for (const v of pair) {
      const line = (from, to, colour, width) => {
        g.strokeStyle = colour;
        g.lineWidth = width;
        g.beginPath();
        let started = false;
        for (let J = from; J <= to + 1; J += 60) {
          const T = tempOf(v.c, Math.min(J, to));
          const px = X(Math.min(J, to));
          const py = Y(T);
          if (!started) { g.moveTo(px, py); started = true; } else g.lineTo(px, py);
        }
        g.stroke();
      };
      g.setLineDash([3, 3]);
      line(joules, HEAT_WATTS * HEAT_SECONDS, alpha(v.colour, 0.4), 1.4);
      g.setLineDash([]);
      line(0, joules, v.colour, 2.2);
      g.beginPath();
      g.arc(X(joules), Y(v.temp), 3.2, 0, TAU);
      g.fillStyle = v.colour;
      g.fill();
    }
    // The name of each series at the right-hand end of its full-run curve, where the two are furthest
    // apart, and not beside the moving point: both start at 20 °C, so beside the point the two names
    // stood on top of each other for the first few hundred joules and ran off the chart at the last.
    // When even the ends are within a line of each other — water against ethanol with the hydrogen
    // bond turned down, or on a phone's short chart — the warmer goes above its line and the cooler
    // below. Below means below the line along the whole word, not only under its last letter: the
    // curve rises to the right, so a word hung eleven pixels under the end point had the line five
    // pixels lower at its first letter, cutting through the top of the word.
    g.font = `600 10px ${FONT}`;
    const ends = pair.map((v) => ({ v, y: Y(tempOf(v.c, HEAT_WATTS * HEAT_SECONDS)), w: g.measureText(v.name).width }));
    const close = Math.abs(ends[0].y - ends[1].y) < 13;
    const order = ends[0].y <= ends[1].y ? ends : [ends[1], ends[0]];
    order.forEach((e, i) => {
      let y = e.y - 5;
      if (close && i === 1) {
        const atLeft = Y(tempOf(e.v.c, HEAT_WATTS * HEAT_SECONDS * (1 - (e.w + 3) / chartW)));
        y = Math.max(e.y, atLeft) + 12;
      }
      text(e.v.name, x1 - 3, y, { size: 10, weight: 600, colour: e.v.colour, align: 'right', base: 'alphabetic' });
    });

    return {
      joulesAdded: Math.round(joules),
      waterC: Number(wT.toFixed(1)),
      comparisonC: Number(cT.toFixed(1)),
      comparison,
      heatCapacity: Number(cW.toFixed(2)),
    };
  }

  // ----- panel: evaporative cooling -----
  function drawEvaporation(w, h, s, e) {
    const L = latent(s);
    // Escapes accumulate at a rate that depends on the dish's own falling temperature, so the count is
    // integrated forward in fixed steps from zero — which keeps it a function of the elapsed time alone.
    const STEP = 0.25;
    let temp = EVAP_START_C;
    let escaped = 0;
    for (let x = 0; x < e; x += STEP) {
      escaped += evapRate(s, temp) * Math.min(STEP, e - x);
      temp = EVAP_START_C - (escaped * L * 1000) / (EVAP_POOL * EVAP_C);
      if (temp < -20) { temp = -20; break; }
    }
    const meanSpeedRel = Math.sqrt((temp + 273.15) / (EVAP_START_C + 273.15));

    // The dish sits low and wide, so the air above it — where the escaping molecules go, and what the
    // panel is about — is most of the frame rather than a band across the middle of it.
    const dishY = h * 0.80;
    const dishH = Math.min(62, h * 0.19);
    const dishW = Math.min(w * 0.54, 400);
    const dishX = Math.max(w * 0.28, (w - dishW) / 2 + w * 0.06);
    const flare = dishH * 0.20;
    const liquid = g.createLinearGradient(0, dishY - dishH, 0, dishY);
    liquid.addColorStop(0, alpha(col.water, col.dark ? 0.10 : 0.11));
    liquid.addColorStop(1, alpha(col.water, col.dark ? 0.24 : 0.25));
    g.fillStyle = liquid;
    g.beginPath();
    g.moveTo(dishX + 1, dishY - 1);
    g.lineTo(dishX + dishW - 1, dishY - 1);
    g.lineTo(dishX + dishW + flare * 0.8, dishY - dishH + 7);
    g.lineTo(dishX - flare * 0.8, dishY - dishH + 7);
    g.closePath();
    g.fill();
    g.strokeStyle = alpha(col.water, 0.55);
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(dishX - flare * 0.8, dishY - dishH + 7.5);
    g.lineTo(dishX + dishW + flare * 0.8, dishY - dishH + 7.5);
    g.stroke();
    // The dish itself, over the water it holds.
    g.strokeStyle = col.ruleStrong;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(dishX - flare, dishY - dishH);
    g.lineTo(dishX, dishY - 3);
    g.quadraticCurveTo(dishX, dishY, dishX + 4, dishY);
    g.lineTo(dishX + dishW - 4, dishY);
    g.quadraticCurveTo(dishX + dishW, dishY, dishX + dishW, dishY - 3);
    g.lineTo(dishX + dishW + flare, dishY - dishH);
    g.stroke();

    // Molecules: the ones left jiggle at a speed set by the dish's temperature; the escapees rise.
    const r = Math.min(11, Math.max(6, w / 70));
    const speed = meanSpeedRel;
    let gone = 0;
    pools.evaporation.forEach((q) => {
      // The fifty drawn molecules stand for the nine hundred the dish holds, so the fraction that has
      // left is amplified sixfold to be watchable and capped so the dish never empties completely.
      const leaves = q.rank < clamp((escaped / EVAP_POOL) * 6, 0, 0.85);
      if (leaves) {
        gone += 1;
        const age = ((e * 0.8 + q.p) % 3.4);
        const x = dishX + 12 + q.u * (dishW - 24) + Math.sin(age * 2 + q.p) * 14;
        const y = dishY - 52 - age * (h * 0.16);
        if (y < 6) return;
        // Gone by the time they reach the reading, which stands in the air they rise into.
        g.globalAlpha = clamp01(1 - age / 3.2) * 0.85 * clamp01((y - readH - 6) / 30);
        molecule(x, y, r * 0.85, q.p + age);
        g.globalAlpha = 1;
        return;
      }
      const jx = reduced ? 0 : Math.sin(e * q.f * speed * 2.4 + q.p) * 4 * speed;
      const jy = reduced ? 0 : Math.cos(e * q.g * speed * 2.4 + q.q) * 3 * speed;
      const x = dishX + 14 + q.u * (dishW - 28) + jx;
      const y = dishY - 12 - q.v * 32 + jy;
      molecule(x, y, r, q.p);
    });

    // The thermometer, on the left where the readout panel is not.
    const tx = Math.max(14, dishX - 44);
    {
      const th = h * 0.5;
      const ty = dishY - th - 10;
      g.strokeStyle = col.ruleStrong;
      g.lineWidth = 1.4;
      g.beginPath();
      g.roundRect(tx, ty, 13, th, 6.5);
      g.stroke();
      const f = clamp01((temp + 20) / 60);
      g.fillStyle = col.coral;
      g.beginPath();
      g.roundRect(tx + 2.5, ty + th - 4 - f * (th - 8), 8, f * (th - 8) + 2, 4);
      g.fill();
      g.beginPath();
      g.arc(tx + 6.5, ty + th + 6, 8, 0, TAU);
      g.fill();
      text(`${temp.toFixed(1)} °C`, tx + 22, ty + th - 4 - f * (th - 8), { size: 11, weight: 600, colour: col.coral, base: 'middle' });
    }

    // How much energy one gram takes with it: the reason the dish cools at all.
    const barW = Math.min(150, w * 0.26);
    const barX = Math.max(16, dishX);
    text(narrow ? 'each gram carries off' : 'each gram that leaves carries off', barX, h - 44, { size: 10, colour: col.faint, base: 'top' });
    g.fillStyle = col.paper2;
    g.beginPath();
    g.roundRect(barX, h - 30, barW, 10, 5);
    g.fill();
    g.fillStyle = col.coral;
    g.beginPath();
    g.roundRect(barX, h - 30, Math.max(3, (L / 2.4) * barW), 10, 5);
    g.fill();
    text(`${L.toFixed(2)} kJ`, barX + barW + 8, h - 25, { size: 11, weight: 600, colour: col.ink, base: 'middle' });

    void gone;
    return {
      escaped: Math.round(escaped),
      meanSpeedRel: Number(meanSpeedRel.toFixed(3)),
      dishC: Number(temp.toFixed(1)),
    };
  }

  // ----- panel: density and ice -----
  function drawIce(w, h, s, e) {
    const tMax = densestAt(s);
    const temp = Math.max(ICE_END_C, ICE_START_C - ((ICE_START_C - ICE_END_C) * e) / ICE_SECONDS);
    const frozen = temp <= 0;
    const rhoSolid = solidDensity(s);
    const rhoLiquid = liquidDensity(Math.max(temp, 0), tMax);
    const rho = frozen ? rhoSolid : rhoLiquid;
    const floats = rhoSolid < liquidDensity(0, tMax);

    const stack = narrow;
    const tankW = stack ? w - 28 : Math.round(w * 0.48);
    const tankX = 14;
    // Below the standfirst, which it was covering; on a phone below the reading too, which stood on
    // the lattice.
    const tankY = stack ? readH + 10 : 44;
    // The chart wants about a hundred pixels for its three gridlines and their labels; on a phone the
    // tank takes what is left above it.
    const tankH = stack ? Math.max(70, h - tankY - 96 - 30 - 36) : h - tankY - 30;
    const chartX = stack ? 38 : tankX + tankW + 44;
    // Clear of the reading in the top right corner, as in the heat panel. Thirty under the tank on a
    // phone: the temperature is set under the tank and the chart's unit above the chart, and at
    // twenty-six the two overprinted.
    const chartY = stack ? tankY + tankH + 30 : Math.max(readH + 22, Math.round(h * 0.22));
    const chartW = (stack ? w - 52 : w - chartX - 18);
    const chartH = h - chartY - 36;

    // The tank: glass on three sides, open at the top, with the water to a level a little below the rim
    // and deepening downwards. A closed rectangle with one flat tint in it is a swatch, not a vessel.
    const waterTop = tankY + 10;
    const tankBody = g.createLinearGradient(0, waterTop, 0, tankY + tankH);
    tankBody.addColorStop(0, alpha(col.water, col.dark ? 0.10 : 0.11));
    tankBody.addColorStop(1, alpha(col.water, col.dark ? 0.22 : 0.23));
    g.fillStyle = tankBody;
    g.fillRect(tankX + 1, waterTop, tankW - 1, tankY + tankH - waterTop);
    g.strokeStyle = alpha(col.water, 0.55);
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(tankX + 1, waterTop + 0.5);
    g.lineTo(tankX + tankW, waterTop + 0.5);
    g.stroke();
    g.strokeStyle = col.ruleStrong;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(tankX + 0.5, tankY + 0.5);
    g.lineTo(tankX + 0.5, tankY + tankH + 0.5);
    g.lineTo(tankX + tankW + 0.5, tankY + tankH + 0.5);
    g.lineTo(tankX + tankW + 0.5, tankY + 0.5);
    g.stroke();

    // Molecules. Above freezing they crowd closer as the liquid cools towards its densest point and,
    // if the hydrogen bond is strong, start to space out again below it. Below zero they lock into the
    // open hexagonal net, which takes more room than the jumble did.
    // Freezing does two things to the same triangular grid: it throws away a third of the sites, which
    // is exactly what turns a triangular lattice into a honeycomb with hexagonal holes in it, and it
    // pulls the survivors closer together (2.76 Å in ice against about 2.8 in the liquid). Two thirds
    // of the molecules at 0.85 of the spacing is 0.92 of the density, which is why ice floats.
    const crowd = frozen ? 0 : clamp01((ICE_START_C - Math.max(temp, tMax)) / Math.max(4, ICE_START_C - tMax));
    const spread = frozen ? 0 : (temp < tMax ? clamp01((tMax - temp) / 6) * s : 0);
    const r = Math.min(9, Math.max(5, tankW / 34));
    const pts = [];
    const cols = Math.max(5, Math.round(tankW / (r * 3.1)));
    const rows = Math.max(4, Math.round(tankH / (r * 3.1)));
    const cx = tankX + tankW / 2;
    const cy = tankY + tankH / 2;
    // At zero strength there is no lattice to form: the solid just packs tighter, as any other would.
    const lat = frozen ? s : 0;
    const pack = (1 - 0.14 * crowd + 0.13 * spread) * (frozen ? 1 - 0.15 * s : 1);
    let k = 0;
    for (let j = 0; j < rows; j += 1) {
      for (let i = 0; i < cols; i += 1) {
        const q = pools.ice[k % pools.ice.length];
        k += 1;
        if (frozen && s > 0.5 && (((i - j) % 3) + 3) % 3 === 0) continue; // the hexagonal holes
        const hx = tankX + ((i + 0.5 + (j % 2 ? 0.5 : 0)) * tankW) / cols;
        const hy = tankY + ((j + 0.5) * tankH) / rows;
        const jx = (q.u - 0.5) * (tankW / cols) * 0.55;
        const jy = (q.v - 0.5) * (tankH / rows) * 0.55;
        let x = cx + (hx + jx * (1 - lat) - cx) * pack;
        let y = cy + (hy + jy * (1 - lat) - cy) * pack;
        if (!reduced) {
          const amp = frozen ? 0.8 : 2.4;
          x += Math.sin(e * q.f * 1.6 + q.p) * amp;
          y += Math.cos(e * q.g * 1.6 + q.q) * amp;
        }
        if (x < tankX + r || x > tankX + tankW - r || y < tankY + r || y > tankY + tankH - r) continue;
        pts.push([x, y, q.p]);
      }
    }
    if (frozen) {
      const pairs = [];
      for (let a = 0; a < pts.length; a += 1) {
        for (let b = a + 1; b < pts.length; b += 1) {
          const d = Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]);
          if (d < r * 3.2) pairs.push([pts[a][0], pts[a][1], pts[b][0], pts[b][1]]);
        }
      }
      links(pairs, s, r);
    }
    for (const [x, y, rot] of pts) molecule(x, y, r, rot);

    // A block of the solid, floating or on the floor.
    if (frozen) {
      const bw = tankW * 0.3;
      const bh = tankH * 0.22;
      const bx = tankX + tankW * 0.35;
      const by = floats ? tankY + 6 : tankY + tankH - bh - 6;
      g.fillStyle = col.paper;
      g.strokeStyle = floats ? col.leaf : col.coral;
      g.lineWidth = 2;
      g.beginPath();
      g.roundRect(bx, by, bw, bh, 4);
      g.fill();
      g.stroke();
      text(floats ? 'it floats' : 'it sinks', bx + bw / 2, by + bh / 2, {
        size: 11, weight: 600, colour: floats ? col.leaf : col.coral, align: 'center', base: 'middle',
      });
    }
    // The temperature under the tank: at its left corner, or on a phone at its right, so it and the
    // chart's unit label under it are at opposite ends of the line.
    g.font = `500 15px ${DISPLAY}`;
    g.textAlign = stack ? 'right' : 'left';
    g.textBaseline = 'top';
    g.fillStyle = col.ink;
    g.fillText(`${temp.toFixed(1)} °C`, stack ? tankX + tankW : tankX, tankY + tankH + 7);

    // Density against temperature, with the turn.
    const x1 = chartX + chartW;
    const y1 = chartY + chartH;
    const X = (T) => chartX + ((ICE_START_C - T) / (ICE_START_C - ICE_END_C)) * chartW;
    // The range has to hold the solid at either end of the slider: 0.917 with the hydrogen bond at full
    // strength, 1.08 with none of it, and the liquid's own 1.000 in between.
    const lo = Math.min(0.91, solidDensity(s) - 0.008);
    const hi = Math.max(1.006, solidDensity(s) + 0.008);
    const Y = (d) => y1 - ((d - lo) / (hi - lo)) * chartH;
    g.strokeStyle = col.rule;
    g.lineWidth = 1;
    for (const d of [0.92, 0.96, 1.0, 1.04, 1.08]) {
      const y = Math.round(Y(d)) + 0.5;
      if (y < chartY || y > y1) continue;
      g.beginPath();
      g.moveTo(chartX, y);
      g.lineTo(x1, y);
      g.stroke();
      text(d.toFixed(2), chartX - 5, y, { size: 9.5, colour: col.faint, align: 'right', base: 'middle' });
    }
    axes(chartX, chartY, x1, y1, narrow ? '°C, falling' : 'temperature, °C, falling', 'g/cm³');
    // The whole liquid branch drawn faintly, and the part the run has reached drawn over it: at 18.8 °C
    // the solid trace is three pixels in a chart the width of the panel, and the turn at 4 °C — the
    // thing the chart exists for — is not yet on it.
    const branch = (from, to, colour, width, dash) => {
      g.setLineDash(dash);
      g.strokeStyle = colour;
      g.lineWidth = width;
      g.beginPath();
      let started = false;
      for (let T = from; T >= to - 0.001; T -= 0.5) {
        const px = X(T);
        const py = Y(liquidDensity(T, tMax));
        if (!started) { g.moveTo(px, py); started = true; } else g.lineTo(px, py);
      }
      g.stroke();
      g.setLineDash([]);
    };
    branch(Math.max(temp, 0), 0, alpha(col.water, 0.42), 1.4, [3, 3]);
    branch(ICE_START_C, Math.max(temp, 0), col.water, 2.2, []);
    // The step at zero and the solid branch: dashed ahead of the run, solid once it is reached. The
    // step is the whole point of the chart, and until the tank had frozen the chart did not show it —
    // a large empty grid with three pixels of trace along the top of it. The dashed preview runs to
    // −10 °C all through the freeze: it used to stop at the temperature reached, so the chart was
    // whole before the tank froze and again at −10, and in between the solid branch ended in mid-air.
    const stepY0 = Y(liquidDensity(0, tMax));
    const solidColour = floats ? col.leaf : col.coral;
    const stepAndBranch = (toC) => {
      g.beginPath();
      g.moveTo(X(0), stepY0);
      g.lineTo(X(0), Y(rhoSolid));
      g.lineTo(X(toC), Y(rhoSolid));
      g.stroke();
    };
    g.setLineDash([3, 3]);
    g.strokeStyle = alpha(solidColour, 0.55);
    g.lineWidth = 1.6;
    stepAndBranch(ICE_END_C);
    g.setLineDash([]);
    if (frozen) {
      g.strokeStyle = solidColour;
      g.lineWidth = 2.2;
      stepAndBranch(temp);
    }
    if (s > 0.05 && tMax > 0.2) {
      const mx = X(tMax);
      const my = Y(liquidDensity(tMax, tMax));
      g.beginPath();
      g.arc(mx, my, 3.4, 0, TAU);
      g.fillStyle = col.gold;
      g.fill();
      // Below the point, so the words do not sit on the curve they are pointing at.
      const ly = my + 16;
      if (mx + 70 < x1) text(`densest at ${tMax.toFixed(1)} °C`, mx + 7, ly, { size: 10, weight: 600, colour: col.gold });
      else text(`densest at ${tMax.toFixed(1)} °C`, mx - 7, ly, { size: 10, weight: 600, colour: col.gold, align: 'right' });
    }

    return {
      tempC: Number(temp.toFixed(1)),
      densityGcm3: Number(rho.toFixed(3)),
      latticeFormed: frozen,
      solidFloats: floats,
      densestAtC: Number(tMax.toFixed(1)),
    };
  }

  // ----- the frame -----
  let state = { tension: null, heat: null, evaporation: null, ice: null };

  function draw() {
    if (!cw) return;
    const start = performance.now();
    const s = strength;
    const e = elapsed();
    const h = ch - toolbarH;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cw, ch);
    g.save();
    g.beginPath();
    g.rect(0, 0, cw, h);
    g.clip();
    // Every panel's numbers are computed each frame, so a task can read any of the four; only the
    // chosen one is drawn.
    const w = cw;
    if (panel === 'tension') state.tension = drawTension(w, h, s, e);
    else state.tension = tensionNumbers(s);
    if (panel === 'heat') state.heat = drawHeat(w, h, s, e);
    else state.heat = heatNumbers(s, panel === 'heat' ? e : Math.max(0, t - startedAt.heat));
    if (panel === 'evaporation') state.evaporation = drawEvaporation(w, h, s, e);
    else state.evaporation = evaporationNumbers(s, Math.max(0, t - startedAt.evaporation));
    if (panel === 'ice') state.ice = drawIce(w, h, s, e);
    else state.ice = iceNumbers(s, Math.max(0, t - startedAt.ice));
    g.restore();
    // The standfirst: the demonstration's name in the book's display face, and under it the one thing
    // it is here to show.
    g.font = `500 ${narrow ? 14 : 17}px ${DISPLAY}`;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.fillStyle = col.ink;
    g.fillText(TITLES[panel], 14, narrow ? 17 : 19);
    if (!narrow) text(CLAIMS[panel], 14, 33, { size: 11, colour: col.soft, base: 'alphabetic' });
    updateReadout();
    lastFrameMs = performance.now() - start;
  }

  // The same models, without the drawing, so the three panels the reader is not looking at still report.
  function tensionNumbers(s) {
    const gm = gamma(s);
    return { surfaceTensionMNm: Number(gm.toFixed(1)), needleFloats: gm >= NEEDLE_LOAD };
  }
  function heatNumbers(s, e) {
    const cW = waterHeat(s);
    const cC = COMPARISONS[comparison];
    const joules = HEAT_WATTS * Math.min(HEAT_SECONDS, e * HEAT_PER_SEC);
    return {
      joulesAdded: Math.round(joules),
      waterC: Number(Math.min(100, 20 + joules / (HEAT_MASS * cW)).toFixed(1)),
      comparisonC: Number(Math.min(100, 20 + joules / (HEAT_MASS * cC)).toFixed(1)),
      comparison,
      heatCapacity: Number(cW.toFixed(2)),
    };
  }
  function evaporationNumbers(s, e) {
    const L = latent(s);
    const STEP = 0.25;
    let temp = EVAP_START_C;
    let escaped = 0;
    for (let x = 0; x < e; x += STEP) {
      escaped += evapRate(s, temp) * Math.min(STEP, e - x);
      temp = EVAP_START_C - (escaped * L * 1000) / (EVAP_POOL * EVAP_C);
      if (temp < -20) { temp = -20; break; }
    }
    return {
      escaped: Math.round(escaped),
      meanSpeedRel: Number(Math.sqrt((temp + 273.15) / (EVAP_START_C + 273.15)).toFixed(3)),
      dishC: Number(temp.toFixed(1)),
    };
  }
  function iceNumbers(s, e) {
    const tMax = densestAt(s);
    const temp = Math.max(ICE_END_C, ICE_START_C - ((ICE_START_C - ICE_END_C) * e) / ICE_SECONDS);
    const frozen = temp <= 0;
    return {
      tempC: Number(temp.toFixed(1)),
      densityGcm3: Number((frozen ? solidDensity(s) : liquidDensity(temp, tMax)).toFixed(3)),
      latticeFormed: frozen,
      solidFloats: solidDensity(s) < liquidDensity(0, tMax),
      densestAtC: Number(tMax.toFixed(1)),
    };
  }

  let shown = '';
  function updateReadout() {
    const s = strength;
    hbVal.textContent = narrow ? `${Math.round(s * 100)} %` : `hydrogen bond ${Math.round(s * 100)} %`;
    let big = '';
    let small = '';
    if (panel === 'tension') {
      const d = state.tension;
      big = `${d.surfaceTensionMNm} mN/m`;
      small = `${d.needleFloats ? 'the needle floats' : 'the needle sinks'}\nit needs ${NEEDLE_LOAD.toFixed(0)} mN/m to hold`;
    } else if (panel === 'heat') {
      const d = state.heat;
      big = `${d.waterC.toFixed(1)} °C vs ${d.comparisonC.toFixed(1)} °C`;
      small = `after ${d.joulesAdded} J into 100 g of each\nwater ${d.heatCapacity} J/g/K · ${d.comparison} ${COMPARISONS[d.comparison]}`;
    } else if (panel === 'evaporation') {
      const d = state.evaporation;
      big = `${d.dishC} °C`;
      // Each line is written to the measure it is set in — the phone's is about thirty-four characters
      // — so none of them wraps mid-phrase.
      small = narrow
        ? `${d.escaped} molecules gone\nthe rest at ${d.meanSpeedRel.toFixed(3)} of their speed\n${latent(s).toFixed(2)} kJ leaves with each gram`
        : `${d.escaped} molecules gone, and those left\nmove at ${d.meanSpeedRel.toFixed(3)} of their first speed\n${latent(s).toFixed(2)} kJ leaves with every gram`;
    } else {
      const d = state.ice;
      big = `${d.densityGcm3.toFixed(3)} g/cm³`;
      small = `at ${d.tempC} °C · densest at ${d.densestAtC} °C\n${d.latticeFormed ? (d.solidFloats ? 'the lattice is open, so it floats' : 'the solid is denser, so it sinks') : 'still liquid'}`;
    }
    const key = `${panel}|${big}|${small}`;
    if (key === shown) return;
    shown = key;
    readEyebrow.textContent = QUANTITY[panel];
    readBig.textContent = big;
    readSmall.textContent = small;
  }

  // ----- controls -----
  function restart() {
    startedAt[panel] = t;
    draw();
  }

  range.addEventListener('input', () => {
    strength = Number(range.value) / 100;
    // Every panel is a function of (elapsed, strength), so moving the slider starts the runs again and
    // what the reader watches is what the numbers describe.
    for (const p of PANELS) startedAt[p] = t;
    draw();
  });

  function setPlaying(next) {
    playing = next;
    setLabel(btnPlay, playing ? 'Pause' : 'Play');
    if (playing) schedule();
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function seek(next) {
    t = Number(next) || 0;
    draw();
  }

  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); seek(t + (e.shiftKey ? 5 : 1)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(t - (e.shiftKey ? 5 : 1)); }
    else if (e.key === 'Home') { e.preventDefault(); restart(); }
  };
  canvas.addEventListener('keydown', onKey);

  // ----- clock -----
  function frame(now) {
    raf = 0;
    if (destroyed || !playing || !visible) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    t += dt;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (raf || destroyed || !playing || !visible) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  const measure = () => {
    toolbarH = Math.max(34, Math.round(toolbar.getBoundingClientRect().height) + 22);
    const r = readout.getBoundingClientRect();
    const b = root.getBoundingClientRect();
    if (r.height && b.height) readH = Math.round(r.bottom - b.top);
  };
  const observer = new ResizeObserver(() => {
    if (destroyed) return;
    measure();
    if (!resize()) return;
    shown = '';
    draw();
    if (!ready) { ready = true; ctx.onReady(); }
  });
  observer.observe(root);
  observer.observe(toolbar);
  // The reading's own height sets where the charts may start, and it changes with the panel and with
  // the face it is set in.
  observer.observe(readout);
  setPlaying(playing);
  measure();
  if (resize()) {
    draw();
    ready = true;
    ctx.onReady();
  }
  document.fonts?.ready.then(() => { if (!destroyed && cw) { measure(); draw(); } });

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      canvas.removeEventListener('keydown', onKey);
      root.replaceChildren();
    },
    setTime(seconds) {
      setPlaying(false);
      seek(seconds);
    },
    setVisible(v) {
      visible = Boolean(v);
      if (visible) schedule();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setTheme(nextTheme, nextPalette) {
      theme = nextTheme;
      palette = nextPalette;
      buildColours();
      shown = '';
      draw();
    },
    describe() {
      return {
        panel,
        hbondStrength: Number(strength.toFixed(2)),
        t: Number(t.toFixed(3)),
        playing,
        tension: state.tension,
        heat: state.heat,
        evaporation: state.evaporation,
        ice: state.ice,
        layout: narrow ? 'narrow' : 'wide',
        frameMs: Number(lastFrameMs.toFixed(2)),
      };
    },
  };
}
