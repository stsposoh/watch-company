import { SCROLL, STATIONS } from './config.js';

// Segments in vh: hold, transition, hold, …, hold — scaled so they sum to totalVh.
export function buildTimeline(stations = STATIONS, scroll = SCROLL) {
  const raw = [];
  stations.forEach((s, i) => {
    raw.push(s.holdVh ?? scroll.holdVh);
    if (i < stations.length - 1) raw.push(stations[i + 1].transitionVh ?? scroll.transitionVh);
  });
  const k = scroll.totalVh / raw.reduce((a, b) => a + b, 0);

  let vh = 0;
  const knots = [];
  const windows = stations.map((s, i) => {
    const holdVh = raw[i * 2] * k;
    const w = { ...s, index: i, start: vh, end: vh + holdVh };
    knots.push([w.start, s.hold[0]], [w.end, s.hold[1]]);
    vh = w.end + (raw[i * 2 + 1] ?? 0) * k;
    return w;
  });

  return { totalVh: scroll.totalVh, windows, timeAt: monotoneCubic(knots) };
}

// Fritsch–Carlson: C1-smooth and never overshoots, so video time only moves forward with scroll.
function monotoneCubic(points) {
  const n = points.length;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));

  const m = [d[0]];
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }

  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}
