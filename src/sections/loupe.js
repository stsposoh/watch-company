import gsap from 'gsap';

// A watchmaker's loupe that replaces the cursor over `area` and magnifies the same image at higher resolution.
// `area` must have exactly the image's aspect ratio, so pointer fractions map straight onto the image.
export function initLoupe(area, { avif, webp, zoom = 2.2, size = 220, onMove, onLeave }) {
  if (!matchMedia('(pointer: fine)').matches) return;

  const lens = document.createElement('div');
  lens.className = 'loupe';
  lens.setAttribute('aria-hidden', 'true');
  lens.style.width = lens.style.height = `${size}px`;
  lens.style.backgroundImage = `image-set(url("${avif}") type("image/avif"), url("${webp}") type("image/webp"))`;
  area.append(lens);
  area.classList.add('has-loupe');

  gsap.set(lens, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
  const toX = gsap.quickTo(lens, 'x', { duration: 0.3, ease: 'power3.out' });
  const toY = gsap.quickTo(lens, 'y', { duration: 0.3, ease: 'power3.out' });
  let rect = null;

  // The magnified view follows the lens' eased position, not the raw pointer, so the two never disagree.
  const render = () => {
    const x = gsap.getProperty(lens, 'x');
    const y = gsap.getProperty(lens, 'y');
    lens.style.backgroundPosition = `${size / 2 - x * zoom}px ${size / 2 - y * zoom}px`;
    onMove?.(x / rect.width, y / rect.height);
  };

  area.addEventListener('pointerenter', (e) => {
    rect = area.getBoundingClientRect();
    lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    gsap.set(lens, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    gsap.to(lens, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.6)', overwrite: 'auto' });
    gsap.ticker.add(render);
  });

  area.addEventListener('pointermove', (e) => {
    rect = area.getBoundingClientRect();
    toX(e.clientX - rect.left);
    toY(e.clientY - rect.top);
  });

  area.addEventListener('pointerleave', () => {
    gsap.to(lens, { scale: 0, autoAlpha: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto' });
    gsap.ticker.remove(render);
    onLeave?.();
  });
}
