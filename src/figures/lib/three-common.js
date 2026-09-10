// Shared plumbing for the Three.js figures (cell3d, dna3d): the renderer and stage DOM, the light rig,
// a damped orbit with clock-driven autorotation, HTML labels projected from 3D anchors with leader
// lines, a material patch (dimming, cut-face darkening, fresnel alpha), a render-on-demand loop, input
// binding (drag, wheel, pinch, keys), and a seeded RNG. Everything here is deterministic: no Date, no
// Math.random, and every autonomous motion reads the figure's own clock so `setTime` can pin it.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rgb } from '../../palette.js';

export { THREE, mergeGeometries, mergeVertices };

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const SVG = 'http://www.w3.org/2000/svg';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Welds duplicated vertices (uv seams, poles) and recomputes smooth normals.
export function weld(geometry) {
  geometry.deleteAttribute('uv');
  geometry.deleteAttribute('normal');
  const g = mergeVertices(geometry, 1e-4);
  g.computeVertexNormals();
  geometry.dispose();
  return g;
}

// ---------- stage DOM ----------
const stageCss = (s) => `
.${s}{position:absolute;inset:0;outline:none;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none}
.${s}.is-active{touch-action:none}.${s}.is-drag{cursor:grabbing}.${s}.is-pick{cursor:pointer}
.${s}:focus-visible{box-shadow:inset 0 0 0 2px var(--water)}
.${s} canvas{display:block;width:100%;height:100%}
.${s}-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.${s}-overlay line,.${s}-overlay path{stroke:var(--ink-faint);stroke-width:1;fill:none}
.${s}-overlay circle{fill:var(--paper);stroke:var(--ink-soft);stroke-width:1.2}
.${s}-labels{position:absolute;inset:0;pointer-events:none}
.${s}-labels .fig-label{transition:none}
.${s}-card{pointer-events:none}.${s}-card .fig-card__meta{margin-top:.3rem;color:var(--ink-faint)}
.${s}-chip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`;

export function createStage(root, kind, ariaLabel) {
  const scope = `tb3d-${kind}`;
  const style = document.createElement('style');
  style.textContent = stageCss(scope);
  const wrap = document.createElement('div');
  wrap.className = scope;
  wrap.tabIndex = 0;
  wrap.setAttribute('aria-label', ariaLabel);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  wrap.append(renderer.domElement);
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', `${scope}-overlay`);
  svg.setAttribute('aria-hidden', 'true');
  const labelsEl = document.createElement('div');
  labelsEl.className = `${scope}-labels`;
  const card = document.createElement('div');
  card.className = `fig-card ${scope}-card`;
  card.hidden = true;
  const toolbar = document.createElement('div');
  toolbar.className = 'fig-toolbar fig-ui';
  root.append(style, wrap, svg, labelsEl, card, toolbar);
  const showCard = (title, body, meta = '') => {
    card.replaceChildren();
    const h = document.createElement('h5');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = body;
    card.append(h, p);
    if (meta) {
      const m = document.createElement('p');
      m.className = 'fig-card__meta';
      m.textContent = meta;
      card.append(m);
    }
    card.hidden = false;
  };
  return { scope, wrap, renderer, svg, labelsEl, card, toolbar, showCard, hideCard: () => { card.hidden = true; } };
}

export function addButton(toolbar, text, onClick, pressed = null) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'fig-btn';
  b.textContent = text;
  if (pressed !== null) b.setAttribute('aria-pressed', String(pressed));
  b.addEventListener('click', onClick);
  toolbar.append(b);
  return b;
}

export function addChip(toolbar, text, scope) {
  const c = document.createElement('span');
  c.className = `fig-chip ${scope}-chip`;
  c.textContent = text;
  toolbar.append(c);
  return c;
}

// ---------- lights: hemisphere in world space, key and fill riding on the camera ----------
export function createRig(scene, camera, theme) {
  const hemi = new THREE.HemisphereLight(0xfff8ee, 0x8e96a3, 1.0);
  hemi.name = 'hemisphere';
  const key = new THREE.DirectionalLight(0xfff3e4, 2.4);
  key.name = 'key';
  key.position.set(-6, 7, 9);
  const fill = new THREE.DirectionalLight(0xdce8ff, 0.7);
  fill.name = 'fill';
  fill.position.set(8, -3, 6);
  camera.add(key, fill);
  scene.add(hemi, camera);
  const setTheme = (t) => hemi.groundColor.set(t === 'dark' ? 0x3a3f47 : 0x8e96a3);
  setTheme(theme);
  return { hemi, key, fill, setTheme };
}

// ---------- orbit: a damped camera on a sphere around `center` ----------
export class Orbit {
  constructor(view, min, max, center = new THREE.Vector3()) {
    this.home = { ...view };
    this.cur = { ...view };
    this.goal = { ...view };
    this.min = min;
    this.max = max;
    this.center = center;
  }

  drag(dx, dy, k = 0.006) {
    this.goal.theta -= dx * k;
    this.goal.phi = clamp(this.goal.phi - dy * k, 0.08, Math.PI - 0.08);
  }

  zoom(f) {
    this.goal.distance = clamp(this.goal.distance * f, this.min, this.max);
  }

  set(view) {
    const v = { theta: view.theta, phi: clamp(view.phi, 0.08, Math.PI - 0.08), distance: clamp(view.distance, this.min, this.max) };
    Object.assign(this.goal, v);
    Object.assign(this.cur, v);
  }

  // Damped approach to the goal; returns true while still moving.
  step(dt, snap) {
    const k = snap ? 1 : 1 - Math.exp(-dt * 10);
    let moving = false;
    for (const key of ['theta', 'phi', 'distance']) {
      const d = this.goal[key] - this.cur[key];
      if (Math.abs(d) > (key === 'distance' ? 1e-3 : 2e-4)) {
        this.cur[key] += d * k;
        moving = true;
      } else this.cur[key] = this.goal[key];
    }
    return moving;
  }

  apply(camera, spin = 0) {
    const { phi, distance } = this.cur;
    const theta = this.cur.theta + spin;
    const c = this.center;
    camera.position.set(c.x + distance * Math.sin(phi) * Math.sin(theta), c.y + distance * Math.cos(phi), c.z + distance * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(c);
    camera.updateMatrixWorld();
  }

  view(spin = 0) {
    return { theta: +(this.cur.theta + spin).toFixed(4), phi: +this.cur.phi.toFixed(4), distance: +this.cur.distance.toFixed(3) };
  }
}

// Autorotation as a pure function of the clock: angle(t) = rate * eased time idle since `origin`.
export class Spin {
  constructor(rate) {
    this.rate = rate;
    this.origin = 0;
    this.delay = 0;
    this.held = false;
  }

  angle(t) {
    if (this.held || !this.rate) return 0;
    const s = Math.max(0, t - this.origin - this.delay);
    const E = 1.5;
    return this.rate * (s < E ? (s * s) / (2 * E) : s - E / 2);
  }

  // Fold the spun angle into the orbit so the view does not jump, then restart the idle timer.
  fold(orbit, t) {
    const a = this.angle(t);
    orbit.cur.theta += a;
    orbit.goal.theta += a;
    this.origin = t;
    this.delay = 3;
  }

  hold(orbit, t) {
    this.fold(orbit, t);
    this.held = true;
  }

  release(t) {
    this.held = false;
    this.origin = t;
    this.delay = 3;
  }
}

export function makeClock(pinnedTime) {
  let pinned = typeof pinnedTime === 'number' ? pinnedTime : null;
  const t0 = performance.now() / 1000;
  return { now: () => (pinned !== null ? pinned : performance.now() / 1000 - t0), pin: (t) => { pinned = t; }, get pinned() { return pinned !== null; } };
}

// ---------- render on demand ----------
export function createLoop(step, render) {
  let raf = 0;
  let visible = true;
  let dirty = false;
  let last = 0;
  const frame = (ms) => {
    raf = 0;
    const dt = last ? Math.min(0.1, (ms - last) / 1000) : 1 / 60;
    last = ms;
    const animating = step(dt);
    if (dirty || animating) {
      render();
      dirty = false;
    }
    if (animating && visible) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  return {
    kick,
    invalidate() { dirty = true; kick(); },
    setVisible(v) { visible = v; if (v) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } },
    stop() { visible = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

// ---------- labels: HTML .fig-label nodes at projected anchors, with SVG leader lines ----------
export class Labels {
  constructor(el, svg) {
    this.el = el;
    this.svg = svg;
    this.items = new Map();
    this.groups = {};
    this._v = new THREE.Vector3();
  }

  add(id, text, { group = 'main', color = null, leader = true } = {}) {
    const node = document.createElement('div');
    node.className = 'fig-label';
    node.textContent = text;
    node.hidden = true;
    const line = document.createElementNS(SVG, 'line');
    const dot = document.createElementNS(SVG, 'circle');
    dot.setAttribute('r', '2.6');
    if (color) dot.style.fill = color;
    line.style.display = dot.style.display = 'none';
    this.el.append(node);
    this.svg.append(line, dot);
    const it = { node, line, dot, group, leader, w: 0, h: 0, anchor: new THREE.Vector3(), on: false, dx: 0, dy: 0 };
    this.items.set(id, it);
    return it;
  }

  // Called per frame by the figure: where the label points this frame (or null to hide it).
  set(id, anchor, dx = 0, dy = -40) {
    const it = this.items.get(id);
    it.on = anchor !== null;
    if (anchor) it.anchor.copy(anchor);
    it.dx = dx;
    it.dy = dy;
  }

  setGroup(group, on) { this.groups[group] = on; }

  measure() {
    for (const it of this.items.values()) {
      const was = it.node.hidden;
      it.node.hidden = false;
      it.w = it.node.offsetWidth;
      it.h = it.node.offsetHeight;
      it.node.hidden = was;
    }
  }

  update(camera, W, H, bottomPad = 48) {
    const placed = [];
    for (const it of this.items.values()) {
      // Hidden when off, when its group is off, when the anchor is behind the camera, or when the anchor
      // projects well outside the stage (a near view): a label for something off screen only misleads.
      const v = this._v.copy(it.anchor).project(camera);
      if (!it.on || (this.groups[it.group] ?? true) === false || v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) {
        it.node.hidden = true;
        it.line.style.display = it.dot.style.display = 'none';
        continue;
      }
      if (!it.w) this.measure();
      const ax = ((v.x + 1) / 2) * W;
      const ay = ((1 - v.y) / 2) * H;
      const cx = (v) => clamp(v, it.w / 2 + 6, W - it.w / 2 - 6);
      const cy = (v) => clamp(v, it.h / 2 + 6, H - it.h / 2 - bottomPad);
      const free = (x, y) => placed.every((p) => Math.abs(x - p.x) >= (it.w + p.w) / 2 + 4 || Math.abs(y - p.y) >= (it.h + p.h) / 2 + 3);
      let x = cx(ax + it.dx);
      let y = cy(ay + it.dy);
      // The preferred spot when it is free; otherwise the free spot nearest the anchor on the smallest
      // ring of candidates around it. Pushing labels apart in turn can trap one between two wider ones;
      // a search cannot.
      if (!free(x, y)) {
        let best = null;
        let bestCost = Infinity;
        for (const r of [26, 52, 80, 112, 150]) {
          for (let k = 0; k < 12; k += 1) {
            const a = (k / 12) * Math.PI * 2 + r * 0.011;
            const qx = cx(x + r * Math.cos(a));
            const qy = cy(y + r * Math.sin(a));
            if (!free(qx, qy)) continue;
            const cost = Math.hypot(qx - ax, qy - ay);
            if (cost < bestCost) { bestCost = cost; best = [qx, qy]; }
          }
          if (best) break;
        }
        if (best) [x, y] = best;
      }
      placed.push({ x, y, w: it.w, h: it.h });
      it.node.style.left = `${x}px`;
      it.node.style.top = `${y}px`;
      it.node.hidden = false;
      if (!it.leader) continue;
      const bx = clamp(ax, x - it.w / 2, x + it.w / 2);
      const by = clamp(ay, y - it.h / 2, y + it.h / 2);
      it.line.setAttribute('x1', ax); it.line.setAttribute('y1', ay);
      it.line.setAttribute('x2', bx); it.line.setAttribute('y2', by);
      it.dot.setAttribute('cx', ax); it.dot.setAttribute('cy', ay);
      it.line.style.display = it.dot.style.display = '';
    }
  }
}

// ---------- materials: standard PBR plus three small shader additions ----------
// uDim mixes the final colour toward the paper (for "everything else dims"), uCap darkens back faces
// so a clipped solid reads as a cut, uFres = (alphaMin, alphaMax, power) makes a fresnel-weighted
// alpha for the translucent membranes (z = 0 disables it).
function patchFragment(src) {
  return src
    .replace('#include <clipping_planes_pars_fragment>', '#include <clipping_planes_pars_fragment>\nuniform float uDim; uniform vec3 uPaper; uniform float uCap; uniform vec3 uFres;')
    .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nif (!gl_FrontFacing) diffuseColor.rgb *= uCap;\nif (uFres.z > 0.0) { float fr = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), uFres.z); diffuseColor.a = mix(uFres.x, uFres.y, fr); }')
    .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, uPaper, uDim);');
}

export class Materials {
  constructor(paperHex) {
    this.list = [];
    this.paper = new THREE.Vector3(...rgb(paperHex));
  }

  make({ fresnel = null, cap = 1, ...rest } = {}) {
    const m = new THREE.MeshStandardMaterial(rest);
    const u = { uDim: { value: 0 }, uPaper: { value: this.paper }, uCap: { value: cap }, uFres: { value: new THREE.Vector3(...(fresnel || [0, 0, 0])) } };
    m.userData.u = u;
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, u);
      shader.fragmentShader = patchFragment(shader.fragmentShader);
    };
    m.customProgramCacheKey = () => 'tb3d';
    this.list.push(m);
    return m;
  }

  setPaper(hex) { this.paper.set(...rgb(hex)); }

  dispose() { for (const m of this.list) m.dispose(); }
}

// ---------- input ----------
// h = { onDrag(dx, dy), onZoom(factor), onClick(pt), onMove(pt), onEscape() }; pt = { x, y, w, h } in css px.
export function bindInput(wrap, h) {
  const ptrs = new Map();
  let drag = null;
  let pinch = 0;
  const local = (e) => { const r = wrap.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  const dist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const on = (type, fn, opts) => wrap.addEventListener(type, fn, opts);
  on('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    wrap.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) drag = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false };
    else { drag = null; pinch = dist(); }
  });
  on('pointermove', (e) => {
    const p = ptrs.get(e.pointerId);
    if (!p) { if (e.pointerType === 'mouse') h.onMove?.(local(e)); return; }
    p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size >= 2) { const d = dist(); if (pinch > 0 && d > 0) h.onZoom(pinch / d); pinch = d; return; }
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 4) { drag.moved = true; wrap.classList.add('is-drag'); }
    if (drag.moved) h.onDrag(dx, dy);
  });
  const up = (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = 0;
    if (drag && !drag.moved && e.type === 'pointerup') { wrap.focus({ preventScroll: true }); h.onClick(local(e)); }
    if (ptrs.size === 0) { drag = null; wrap.classList.remove('is-drag'); }
  };
  on('pointerup', up);
  on('pointercancel', up);
  on('pointerleave', (e) => { if (e.pointerType === 'mouse' && !ptrs.size) h.onMove?.(null); });
  // The wheel zooms once the reader has taken the figure (click, tap, or Tab) or holds Ctrl; before
  // that the page keeps scrolling over it.
  on('wheel', (e) => {
    if (document.activeElement !== wrap && !e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    h.onZoom(Math.exp(clamp(e.deltaY, -60, 60) * 0.004));
  }, { passive: false });
  on('focus', () => wrap.classList.add('is-active'));
  on('blur', () => wrap.classList.remove('is-active'));
  const keys = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] };
  on('keydown', (e) => {
    if (keys[e.key]) h.onDrag(...keys[e.key]);
    else if (e.key === '+' || e.key === '=') h.onZoom(0.85);
    else if (e.key === '-' || e.key === '_') h.onZoom(1 / 0.85);
    else if (e.key === 'Escape') h.onEscape?.();
    else return;
    e.preventDefault();
  });
}

// Ray hits at a stage point, dropping hits on the clipped side of any active plane.
export function pickAt(raycaster, camera, pt, objects, planes = null) {
  raycaster.setFromCamera(new THREE.Vector2((pt.x / pt.w) * 2 - 1, -(pt.y / pt.h) * 2 + 1), camera);
  const hits = raycaster.intersectObjects(objects, false);
  return planes ? hits.filter((hit) => planes.every((p) => p.distanceToPoint(hit.point) >= 0)) : hits;
}

export function observeSize(root, cb) {
  const ro = new ResizeObserver((entries) => {
    const r = entries[0].contentRect;
    if (r.width > 0 && r.height > 0) cb(r.width, r.height);
  });
  ro.observe(root);
  const r = root.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) cb(r.width, r.height);
  return () => ro.disconnect();
}

export function disposeScene(scene) {
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  scene.clear();
}
