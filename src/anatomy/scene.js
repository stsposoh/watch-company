import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import videoUrl from '../../assets/video/anatomy.mp4?url';
import { HOLD_SCALE, HOTSPOTS, VIDEO } from './config.js';
import { buildTimeline } from './mapping.js';
import { initLoupe } from '../sections/loupe.js';
import knollingAvif from '../../assets/video/stills/station-06.avif?url';
import knollingWebp from '../../assets/video/stills/station-06.webp?url';

gsap.registerPlugin(ScrollTrigger, SplitText);

const SVG_NS = 'http://www.w3.org/2000/svg';
const RING = 6;
// Extra cover scale so the drift never reveals the stage edge.
const OVERSCAN = 1.014;
const DRIFT = 6;
const clamp01 = gsap.utils.clamp(0, 1);
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export function initAnatomy({ reduced, onLeave, onEnterBack }) {
  const root = document.querySelector('[data-anatomy]');
  const stage = root.querySelector('[data-stage]');
  const plan = buildTimeline();
  const stations = plan.windows.map((w) => {
    const el = root.querySelector(`[data-station="${w.id}"]`);
    const label = el.querySelector('[data-anchor]');
    return {
      ...w,
      el,
      label,
      side: label?.dataset.anchor,
      callout: el.querySelector('[data-callout]'),
      active: false,
    };
  });

  const hotspotLayer = root.querySelector('[data-hotspots]');
  buildHotspots(hotspotLayer);
  initKnollingLoupe(hotspotLayer);
  if (!reduced) root.style.height = `${plan.totalVh + 100}vh`;

  ScrollTrigger.create({
    trigger: root,
    start: 'bottom bottom',
    onLeave,
    onEnterBack,
  });

  if (reduced) {
    initStills(stations);
    return;
  }

  const frame = root.querySelector('[data-frame]');
  const video = root.querySelector('[data-video]');
  const loader = root.querySelector('[data-loader]');
  const scaleMarks = [...root.querySelectorAll('.scale__marks li')];
  const scale = root.querySelector('[data-scale]');
  const scaleHand = root.querySelector('[data-scale-hand]');
  const hours = root.querySelector('[data-hours]');
  const beats = root.querySelector('[data-beats]');
  const trainParts = [...root.querySelectorAll('[data-train] > *')];
  const last = stations[stations.length - 1];

  const state = {
    plan,
    stations,
    progressVh: 0,
    targetTime: 0,
    time: 0,
    duration: last.hold[1],
    ready: false,
    view: { x: 0, y: 0, s: 1 },
    fit: 0,
    holdScale: 1,
    current: null,
  };

  let W = 0;
  let H = 0;
  let stageRect = null;
  let beatStart = 0;
  let lastHours = -1;
  let lastBeats = -1;

  const measure = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    stageRect = stage.getBoundingClientRect();
    root.style.setProperty('--stage-w', `${W}px`);
    stations.forEach((st) => {
      if (!st.label) return;
      const r = st.label.getBoundingClientRect();
      st.anchor = [(st.side === 'r' ? r.right : r.left) - stageRect.left, r.top + r.height / 2 - stageRect.top];
    });
  };

  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      state.progressVh = self.progress * plan.totalVh;
    },
    onRefresh: measure,
  });

  // Where the scroll is relative to the station windows.
  const locate = (p) => {
    for (let i = 0; i < stations.length; i++) {
      const st = stations[i];
      if (p <= st.end) {
        if (p >= st.start || i === 0) return { st, u: (p - st.start) / (st.end - st.start), between: null };
        const prev = stations[i - 1];
        return { st: prev, u: 1, between: { from: prev, to: st, v: (p - prev.end) / (st.start - prev.end) } };
      }
    }
    return { st: last, u: (p - last.start) / (last.end - last.start), between: null };
  };

  const isOn = (st, p) => {
    const len = st.end - st.start;
    const from = st.index === 0 ? -Infinity : st.start + len * 0.02;
    const to = st === last ? Infinity : st.end - len * 0.16;
    return p >= from && p <= to;
  };

  const layout = () => {
    const p = state.progressVh;
    const { st, u, between } = locate(p);
    state.current = { st, u, between };

    // Drift follows scroll, not time: a time-based sub-pixel drift snaps to device pixels on Retina and twitches at rest.
    let drift = 0;
    if (between) {
      state.holdScale = lerp(HOLD_SCALE, 1, smooth(clamp01(between.v)));
      state.fit = between.to === last ? smooth(clamp01((between.v - 0.35) / 0.65)) : 0;
    } else {
      state.holdScale = lerp(1, HOLD_SCALE, smooth(clamp01(u)));
      state.fit = st === last ? 1 : 0;
      drift = Math.sin(Math.PI * clamp01(u));
    }

    const f = state.fit;
    const cover = Math.max(W / VIDEO.width, H / VIDEO.height) * OVERSCAN;
    const contain = Math.min(W / VIDEO.width, H / VIDEO.height);
    const s = lerp(cover * state.holdScale, contain, f);
    const x = (W - VIDEO.width * s) / 2 - DRIFT * drift * (1 - f);
    const y = lerp((H - VIDEO.height * s) / 2, 0, f) - DRIFT * 0.6 * drift * (1 - f);
    state.view = { x, y, s };
    frame.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    frame.classList.add('is-live');
  };

  const updateCallouts = () => {
    const { x, y, s } = state.view;
    stations.forEach((st) => {
      if (!st.callout || !st.anchor || (!st.active && !st.tl?.isActive())) return;
      drawCallout(st, [x + st.part[0] * s, y + st.part[1] * s]);
    });
  };

  const updateScrubbed = () => {
    const p = state.progressVh;
    const local = (st) => (p - st.start) / (st.end - st.start);

    const h = Math.round(70 * smooth(clamp01(local(stations[2]) / 0.8)));
    if (h !== lastHours) hours.textContent = lastHours = h;

    const t = local(stations[3]);
    trainParts.forEach((el, i) => {
      el.style.strokeDashoffset = 1 - clamp01((t - i * 0.08) / 0.45);
    });

    const esc = stations[4];
    if (esc.active) {
      const b = Math.floor((performance.now() - beatStart) / 125);
      if (b !== lastBeats) beats.textContent = (lastBeats = b).toLocaleString('en-US');
    }
  };

  const updateScale = () => {
    const { st, between } = state.current;
    const pos = (s) => Math.max(0, s.index - 1) / 5;
    const at = between ? lerp(pos(between.from), pos(between.to), smooth(clamp01(between.v))) : pos(st);
    scaleHand.style.transform = `translateY(${at * scaleHand.parentElement.clientHeight}px)`;
    const active = between ? -1 : st.index - 1;
    scaleMarks.forEach((li, i) => li.classList.toggle('is-active', i === active));
    scale.style.opacity = 1 - state.fit;
  };

  const updateStations = () => {
    stations.forEach((st) => {
      const on = isOn(st, state.progressVh);
      if (on === st.active || !st.tl) return;
      st.active = on;
      if (on) {
        if (st.id === 'escapement') {
          beatStart = performance.now();
          lastBeats = -1;
        }
        st.tl.timeScale(1).play();
      } else {
        st.tl.timeScale(1.8).reverse();
      }
    });
  };

  const seek = () => {
    state.targetTime = Math.min(plan.timeAt(state.progressVh), state.duration);
    const k = 1 - Math.pow(0.8, gsap.ticker.deltaRatio(60));
    state.time += (state.targetTime - state.time) * k;
    if (Math.abs(state.targetTime - state.time) < 1e-3) state.time = state.targetTime;

    if (!state.ready || video.seeking) return;
    const t = Math.min(state.time, state.duration - 0.5 / VIDEO.fps);
    if (Math.abs(video.currentTime - t) > 0.5 / VIDEO.fps) video.currentTime = t;
  };

  let debug = null;
  const tick = () => {
    seek();
    layout();
    updateStations();
    updateCallouts();
    updateScrubbed();
    updateScale();
    debug?.update();
  };

  measure();
  gsap.ticker.add(tick);
  window.addEventListener('resize', measure);

  document.fonts.ready.then(() => {
    stations.forEach((st) => {
      st.tl = buildEntrance(st);
      if (st.index === 0) {
        st.active = true;
        st.tl.progress(1);
      }
    });
    measure();
  });

  loadVideo(video, loader).then(() => {
    state.duration = video.duration;
    state.ready = true;
  });

  if (new URLSearchParams(location.search).has('debug')) {
    import('./debug.js').then(({ initDebug }) => {
      debug = initDebug(state, frame);
    });
  }

  return state;
}

function buildEntrance(st) {
  const { el } = st;
  const tl = gsap.timeline({ paused: true });
  const rings = el.querySelectorAll('.callout circle, .hotspots circle');
  if (rings.length) gsap.set(rings, { scale: 0, transformOrigin: '50% 50%' });
  tl.set(el, { autoAlpha: 1 });

  const title = el.querySelector('[data-split]');
  if (title) {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
    tl.from(split.lines, { yPercent: 108, duration: 1.15, ease: 'expo.out', stagger: 0.09 }, 0.05);
  }

  const reveals = el.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    tl.from(reveals, { y: 10, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 }, 0.2);
  }

  if (st.callout) {
    tl.to(st.callout.querySelector('path'), { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.35);
    tl.to(st.callout.querySelector('circle'), { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, 1.15);
  }

  const hotspots = el.querySelector('[data-hotspots]');
  if (hotspots) {
    tl.to(hotspots.querySelectorAll('circle'), { scale: 1, duration: 0.4, ease: 'back.out(2.2)', stagger: 0.08 }, 0.3);
    tl.to(hotspots.querySelectorAll('path'), { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.08 }, 0.5);
    tl.from(hotspots.querySelectorAll('.hotspot__label'), { autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.9);
  }

  return tl;
}

// Text leaves the label on a short shelf, then runs straight to the ring on the part.
function drawCallout(st, part) {
  const [ax, ay] = st.anchor;
  const [px, py] = part;
  const dir = st.side === 'r' ? 1 : -1;
  const x0 = ax + dir * 16;
  const x1 = x0 + dir * 44;
  const dx = px - x1;
  const dy = py - ay;
  const len = Math.hypot(dx, dy) || 1;
  const path = st.callout.querySelector('path');
  const ring = st.callout.querySelector('circle');
  path.setAttribute('d', `M${x0} ${ay}H${x1}L${px - (dx / len) * RING} ${py - (dy / len) * RING}`);
  ring.setAttribute('cx', px);
  ring.setAttribute('cy', py);
}

// The part under the loupe lights up its label.
function initKnollingLoupe(layer) {
  const labels = [...layer.querySelectorAll('.hotspot__label')];
  const near = (i) => labels.forEach((l, j) => l.classList.toggle('is-near', i === j));
  initLoupe(layer, {
    avif: knollingAvif,
    webp: knollingWebp,
    zoom: 2,
    onMove: (fx, fy) => {
      const x = fx * VIDEO.width;
      const y = fy * VIDEO.height;
      let best = -1;
      let bestD = 80;
      HOTSPOTS.forEach((h, i) => {
        const d = Math.hypot(h.at[0] - x, h.at[1] - y);
        if (d < bestD) [best, bestD] = [i, d];
      });
      near(best);
    },
    onLeave: () => near(-1),
  });
}

function buildHotspots(layer) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VIDEO.width} ${VIDEO.height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  HOTSPOTS.forEach((h) => {
    const [px, py] = h.at;
    const [lx, ly] = h.label;
    const dx = px - lx;
    const dy = py - ly;
    const len = Math.hypot(dx, dy) || 1;
    const r = 10;

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('pathLength', '1');
    path.setAttribute('d', `M${lx} ${ly}L${px - (dx / len) * r} ${py - (dy / len) * r}`);
    const ring = document.createElementNS(SVG_NS, 'circle');
    ring.setAttribute('cx', px);
    ring.setAttribute('cy', py);
    ring.setAttribute('r', r);
    svg.append(path, ring);

    const label = document.createElement('span');
    label.className = 'hotspot__label';
    label.setAttribute('role', 'listitem');
    label.dataset.side = h.side;
    label.style.left = `${(lx / VIDEO.width) * 100}%`;
    label.style.top = `${(ly / VIDEO.height) * 100}%`;
    label.textContent = h.name;
    layer.append(label);
  });

  layer.prepend(svg);
}

async function loadVideo(video, loader) {
  const res = await fetch(videoUrl);
  const total = Number(res.headers.get('content-length')) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    // Stepped in sixtieths, like a seconds hand.
    if (total) loader.style.transform = `scaleX(${Math.floor((loaded / total) * 60) / 60})`;
  }

  video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
  await once(video, 'loadeddata');
  video.classList.add('is-ready');
  gsap.to(loader, { autoAlpha: 0, duration: 0.6, delay: 0.2 });
}

function once(el, type) {
  return new Promise((resolve) => el.addEventListener(type, resolve, { once: true }));
}

function initStills(stations) {
  const draw = () => {
    stations[0].el.parentElement.style.setProperty('--stage-w', `${stations[0].el.clientWidth}px`);
    stations.forEach((st) => {
      if (!st.callout) return;
      const box = st.el.getBoundingClientRect();
      const s = Math.max(box.width / VIDEO.width, box.height / VIDEO.height);
      const x = (box.width - VIDEO.width * s) / 2;
      const y = (box.height - VIDEO.height * s) / 2;
      const r = st.label.getBoundingClientRect();
      st.anchor = [(st.side === 'r' ? r.right : r.left) - box.left, r.top + r.height / 2 - box.top];
      drawCallout(st, [x + st.part[0] * s, y + st.part[1] * s]);
    });
  };

  document.querySelector('[data-hours]').textContent = '70';
  document.querySelector('[data-beats]').textContent = '8';
  document.fonts.ready.then(draw);
  window.addEventListener('resize', draw);
}
