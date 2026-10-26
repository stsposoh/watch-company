import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initLoupe } from './loupe.js';
import { initDepth } from './depth.js';
import handsDepth from '../../assets/photos/web/watchmaker-hands-depth.webp?url';
import benchDepth from '../../assets/photos/web/bench-depth.webp?url';
import signatureAvif from '../../assets/photos/web/signature-2400.avif?url';
import signatureWebp from '../../assets/photos/web/signature-2400.webp?url';

gsap.registerPlugin(ScrollTrigger);

const SVG_NS = 'http://www.w3.org/2000/svg';
const DAYS = 21;
// In bench.jpg px: the 21-day track runs round the watch on the bench like a minute track.
const TRACK = { cx: 1952, cy: 726, r: 830, from: 125, step: 5.5, tick: 30, major: 56 };
// In signature.jpg px: the engraved dot between A and F.
const INITIALS = { x: 1371, y: 818, w: 2752, h: 1536 };
const RING = 6;

export function initWatchmaker({ reduced }) {
  initShutter(reduced);
  initTrack(reduced);
  initSignature(reduced);
  if (!reduced) {
    initDepth(document.querySelector('.hands__photo img'), { depth: handsDepth, scrollPx: 28, zoom: 1.06, position: [0, 1] });
    initDepth(document.querySelector('.weeks__photo img'), { depth: benchDepth });
  }
}

function initShutter(reduced) {
  if (reduced) return;
  gsap.fromTo(
    '[data-shutter]',
    { clipPath: 'inset(0 100% 0 0)' },
    {
      clipPath: 'inset(0 0% 0 0)',
      ease: 'none',
      scrollTrigger: { trigger: '[data-hands]', start: 'top 85%', end: 'top 5%', scrub: true },
    },
  );
}

function initTrack(reduced) {
  const svg = document.querySelector('[data-track]');
  const weeks = [...document.querySelectorAll('.week')];
  const { cx, cy, r, from, step, tick, major } = TRACK;

  const ticks = Array.from({ length: DAYS }, (_, i) => {
    const a = ((from + i * step) * Math.PI) / 180;
    const len = i % 7 === 0 ? major : tick;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', cx + r * Math.cos(a));
    line.setAttribute('y1', cy - r * Math.sin(a));
    line.setAttribute('x2', cx + (r + len) * Math.cos(a));
    line.setAttribute('y2', cy - (r + len) * Math.sin(a));
    if (i % 7 === 0) line.classList.add('is-major');
    svg.append(line);
    return line;
  });

  const fill = (days) => {
    ticks.forEach((t, i) => {
      t.classList.toggle('is-filled', i < days);
      t.classList.toggle('is-current', i === days - 1 && days < DAYS);
    });
    weeks.forEach((w, i) => w.classList.toggle('is-on', days > i * 7));
  };

  if (reduced) {
    fill(DAYS);
    return;
  }

  fill(0);
  ScrollTrigger.create({
    trigger: '[data-weeks]',
    start: 'top 65%',
    end: 'bottom 75%',
    onUpdate: (self) => fill(Math.round(self.progress * DAYS)),
  });
}

function initSignature(reduced) {
  const root = document.querySelector('[data-signature]');
  const photo = root.querySelector('[data-signature-photo]');
  const caption = root.querySelector('[data-signature-caption]');
  const path = root.querySelector('[data-signature-callout] path');
  const ring = root.querySelector('[data-signature-callout] circle');

  const draw = () => {
    const box = root.getBoundingClientRect();
    const img = photo.getBoundingClientRect();
    // The line leaves from the end of the caption's last line, "check."
    const range = document.createRange();
    range.selectNodeContents(caption);
    const rects = range.getClientRects();
    const text = rects[rects.length - 1];
    const px = img.left - box.left + (INITIALS.x / INITIALS.w) * img.width;
    const py = img.top - box.top + (INITIALS.y / INITIALS.h) * img.height;
    const x0 = text.right - box.left + 20;
    const y0 = text.top - box.top + text.height * 0.62;
    const x1 = x0 + 48;
    const len = Math.hypot(px - x1, py - y0) || 1;
    path.setAttribute('d', `M${x0} ${y0}H${x1}L${px - ((px - x1) / len) * RING} ${py - ((py - y0) / len) * RING}`);
    ring.setAttribute('cx', px);
    ring.setAttribute('cy', py);
  };

  initLoupe(photo, { avif: signatureAvif, webp: signatureWebp, zoom: 1.8, size: 280 });

  document.fonts.ready.then(draw);
  ScrollTrigger.addEventListener('refresh', draw);
  if (reduced) return;

  gsap.set(ring, { scale: 0, transformOrigin: '50% 50%' });
  gsap
    .timeline({ scrollTrigger: { trigger: root, start: 'top 65%', end: 'center 45%', scrub: true } })
    .to(path, { strokeDashoffset: 0, ease: 'power1.inOut', duration: 1 })
    .to(ring, { scale: 1, ease: 'back.out(2)', duration: 0.2 });
}
