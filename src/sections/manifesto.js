import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const RING = 5;

export function initManifesto({ reduced }) {
  const root = document.querySelector('[data-manifesto]');
  const reveal = root.querySelector('[data-manifesto-reveal]');
  const path = root.querySelector('[data-underline] path');
  const ring = root.querySelector('[data-underline] circle');

  document.fonts.ready.then(() => {
    const split = SplitText.create(reveal, { type: 'lines', mask: 'lines' });
    const check = root.querySelector('[data-check]');

    // Measured against the line's mask, which never moves, so a half-revealed line doesn't skew it.
    const draw = () => {
      const box = root.getBoundingClientRect();
      const word = check.getBoundingClientRect();
      let mask = check;
      while (mask.parentElement !== reveal) mask = mask.parentElement;
      const y = mask.getBoundingClientRect().bottom - box.top - 2;
      const x0 = word.left - box.left;
      const x1 = word.right - box.left + 28;
      path.setAttribute('d', `M${x0} ${y}H${x1 - RING}`);
      ring.setAttribute('cx', x1);
      ring.setAttribute('cy', y);
    };

    draw();
    ScrollTrigger.addEventListener('refresh', draw);
    if (reduced) return;

    gsap.set(ring, { scale: 0, transformOrigin: '50% 50%' });
    gsap
      .timeline({
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'top 5%', scrub: true },
      })
      .from(split.lines, { yPercent: 105, ease: 'power2.out', stagger: 0.3, duration: 1 })
      .to(path, { strokeDashoffset: 0, ease: 'power1.inOut', duration: 0.7 })
      .to(ring, { scale: 1, ease: 'back.out(2)', duration: 0.2 });
  });
}
