import gsap from 'gsap';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGES = {
  name: 'Enter your name.',
  email: 'Enter an email address, like name@example.com.',
  city: 'Enter the city where you would like the viewing.',
};

export function initViewing({ reduced }) {
  const form = document.querySelector('[data-form]');
  const success = document.querySelector('[data-success]');
  const button = form.querySelector('[data-magnetic]');

  const check = (input) => {
    const value = input.value.trim();
    const ok = input.name === 'email' ? EMAIL.test(value) : value.length > 0;
    input.setAttribute('aria-invalid', String(!ok));
    form.querySelector(`[data-error="${input.name}"]`).textContent = ok ? '' : MESSAGES[input.name];
    return ok;
  };

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') check(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input')];
    const invalid = inputs.filter((input) => !check(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    success.textContent = `We'll write to you about a viewing in ${form.elements.city.value.trim()}.`;
    success.tabIndex = -1;
    form.hidden = true;
    success.focus();
  });

  if (reduced) return;

  initLamp();

  // Magnetic pull: the button leans a few pixels towards the pointer.
  const label = button.firstElementChild;
  const moveX = gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
  const moveY = gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
  const labelX = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3.out' });
  const labelY = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3.out' });

  button.addEventListener('pointermove', (e) => {
    const r = button.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    moveX(dx * 0.18);
    moveY(dy * 0.3);
    labelX(dx * 0.08);
    labelY(dy * 0.12);
  });

  button.addEventListener('pointerleave', () => {
    moveX(0);
    moveY(0);
    labelX(0);
    labelY(0);
  });
}

// In atelier-piece.jpg fractions: the ring of baguette stones on the bezel.
const BEZEL = { cx: 0.6904, cy: 0.4993, rx: 0.0916, ry: 0.1654, stones: 28 };
const LAMP_REACH = 320;

// A jeweller's lamp: the light follows the pointer, and stones near it catch a glint at angles that change as it moves.
function initLamp() {
  const root = document.querySelector('.viewing');
  const shade = root.querySelector('[data-shade]');
  const gemLayer = root.querySelector('[data-gems]');
  const gems = Array.from({ length: BEZEL.stones }, (_, i) => {
    const a = (i / BEZEL.stones) * Math.PI * 2;
    const el = document.createElement('i');
    el.style.left = `${(BEZEL.cx + BEZEL.rx * Math.cos(a)) * 100}%`;
    el.style.top = `${(BEZEL.cy + BEZEL.ry * Math.sin(a)) * 100}%`;
    gemLayer.append(el);
    return { el, a, phase: i * 2.399 };
  });

  const lamp = { x: 0, y: 0 };
  const rest = () => {
    const r = root.getBoundingClientRect();
    return { x: BEZEL.cx * r.width, y: BEZEL.cy * r.height };
  };
  Object.assign(lamp, rest());
  const apply = () => {
    shade.style.setProperty('--lx', `${lamp.x}px`);
    shade.style.setProperty('--ly', `${lamp.y}px`);
  };
  apply();

  const moveTo = (x, y) => gsap.to(lamp, { x, y, duration: 0.9, ease: 'power3.out', overwrite: true, onUpdate: apply });

  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    moveTo(x, y);
    gems.forEach((g) => {
      const gx = (BEZEL.cx + BEZEL.rx * Math.cos(g.a)) * r.width;
      const gy = (BEZEL.cy + BEZEL.ry * Math.sin(g.a)) * r.height;
      const reach = Math.max(0, 1 - Math.hypot(gx - x, gy - y) / LAMP_REACH);
      const flash = Math.max(0, Math.sin(g.phase + x * 0.045 + y * 0.03)) ** 6;
      gsap.to(g.el, { opacity: Math.min(1, reach * flash * 1.6), scale: 0.5 + flash * 0.7, duration: 0.25, overwrite: true });
    });
  });

  root.addEventListener('pointerleave', () => {
    const r = rest();
    moveTo(r.x, r.y);
    gems.forEach((g) => gsap.to(g.el, { opacity: 0, duration: 0.5, overwrite: true }));
  });
}

export function initFooter({ reduced }) {
  const since = document.querySelector('[data-since]');
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  // performance.now() counts from navigation start, i.e. from the moment the visitor arrived.
  const update = () => {
    since.textContent = Math.floor(performance.now() / 125).toLocaleString('en-US');
  };
  update();
  setInterval(update, reduced ? 1000 : 125);
}
