import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initAnatomy } from './anatomy/scene.js';
import { initManifesto } from './sections/manifesto.js';
import { initWatchmaker } from './sections/watchmaker.js';
import { initCollection } from './sections/collection.js';
import { initViewing, initFooter } from './sections/viewing.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
let lenis = null;

if (!reduced) {
  lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

initAnatomy({
  reduced,
  onLeave: () => header.classList.add('is-visible'),
  onEnterBack: () => header.classList.remove('is-visible'),
});
initManifesto({ reduced });
initWatchmaker({ reduced });
initCollection({ reduced });
initViewing({ reduced });
initFooter({ reduced });

document.querySelectorAll('[data-scroll-to]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.hash);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView();
  });
});
