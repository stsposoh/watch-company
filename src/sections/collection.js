import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MODELS = {
  ash: { name: 'V1 Ash', line: 'Grey as the bench it was built on.' },
  ink: { name: 'V1 Ink', line: 'The quietest of the three.' },
  bone: { name: 'V1 Bone', line: 'Warm, like an old enamel dial.' },
};
// The crown on the dial photos, where the caseback opens from.
const CROWN = '71.8% 49.3%';

export function initCollection({ reduced }) {
  if (!reduced) {
    gsap.fromTo(
      '[data-lineup-img]',
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: '[data-lineup]', start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  }

  const root = document.querySelector('[data-model]');
  initGlint(root.querySelector('.model__view'));
  if (!reduced) initAssembly(root.querySelector('.model__view'));
  const dials = Object.fromEntries([...root.querySelectorAll('[data-dial]')].map((el) => [el.dataset.dial, el]));
  const caseback = root.querySelector('[data-caseback]');
  const name = root.querySelector('[data-model-name]');
  const line = root.querySelector('[data-model-line]');
  const turn = root.querySelector('[data-turn]');
  const d = reduced ? 0 : 1;
  let current = 'ash';
  let textTl = null;

  const setTurned = (on) => {
    turn.setAttribute('aria-pressed', String(on));
    gsap.to(caseback, {
      clipPath: `circle(${on ? 150 : 0}% at ${CROWN})`,
      duration: 1.1 * d,
      ease: 'power3.inOut',
      overwrite: true,
    });
  };

  turn.addEventListener('click', () => setTurned(turn.getAttribute('aria-pressed') !== 'true'));

  root.addEventListener('change', (e) => {
    const next = e.target.value;
    if (!MODELS[next] || next === current) return;
    const prev = dials[current];
    current = next;

    if (turn.getAttribute('aria-pressed') === 'true') setTurned(false);

    // Crossfade in place: the new dial fades in over the old one, then the old one drops out.
    gsap.set(dials[next], { zIndex: 1 });
    gsap.set(prev, { zIndex: 0 });
    gsap.to(dials[next], {
      opacity: 1,
      duration: 0.8 * d,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: () => Object.values(dials).forEach((el) => el !== dials[current] && gsap.set(el, { opacity: 0 })),
    });

    textTl?.progress(1);
    const { name: n, line: l } = MODELS[next];
    textTl = gsap
      .timeline()
      .to([name, line], { yPercent: -110, duration: 0.35 * d, ease: 'power2.in', stagger: 0.05 * d })
      .add(() => {
        name.textContent = n;
        line.textContent = l;
      })
      .fromTo([name, line], { yPercent: 110 }, { yPercent: 0, duration: 0.7 * d, ease: 'expo.out', stagger: 0.06 * d });
  });
}

// The light band slides across the crystal against the pointer, like turning the watch under a lamp.
function initGlint(view) {
  const band = view.querySelector('[data-glint] i');
  const rest = { xPercent: -45, yPercent: -20 };
  gsap.set(band, rest);
  const toX = gsap.quickTo(band, 'xPercent', { duration: 0.8, ease: 'power3.out' });
  const toY = gsap.quickTo(band, 'yPercent', { duration: 0.8, ease: 'power3.out' });

  view.addEventListener('pointermove', (e) => {
    const r = view.getBoundingClientRect();
    toX(((e.clientX - r.left) / r.width - 0.5) * -70);
    toY(((e.clientY - r.top) / r.height - 0.5) * -50);
  });
  view.addEventListener('pointerleave', () => {
    toX(rest.xPercent);
    toY(rest.yPercent);
  });
}

// Scrubbed by scroll: the movement settles, the dial lands on it, the case closes over both,
// then the parts hand over to the finished watch photo underneath. Not pinned: only Anatomy is.
function initAssembly(view) {
  const layer = view.querySelector('[data-assembly]');
  const part = (name) => layer.querySelector(`[data-part="${name}"]`);
  const at = { xPercent: -50, yPercent: -50 };

  gsap
    .timeline({
      scrollTrigger: { trigger: view, start: 'top 95%', end: 'center 52%', scrub: true },
      defaults: { ease: 'power2.inOut' },
    })
    .fromTo(part('movement'), { ...at, x: '-18vw', y: '6vw', rotation: -38, scale: 0.82, autoAlpha: 0 }, { ...at, x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1 }, 0)
    .fromTo(part('dial'), { ...at, x: '16vw', y: '-9vw', rotation: 24, scale: 1.12, autoAlpha: 0 }, { ...at, x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1 }, 0.35)
    .fromTo(part('case'), { ...at, y: '-4vw', scale: 1.45, autoAlpha: 0 }, { ...at, y: 0, scale: 1, autoAlpha: 1, duration: 1, ease: 'power3.inOut' }, 0.75)
    .to(layer, { autoAlpha: 0, duration: 0.45, ease: 'power1.inOut' }, 1.85);
}
