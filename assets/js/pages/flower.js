// flower.js — the room's flower turns toward the pointer, the way young sunflowers follow the sun.
import { reducedMotion } from '../core/dom.js?v=1';

export function initFlower() {
  const img = document.querySelector('.canvas-flower img');
  if (!img || reducedMotion() || matchMedia('(pointer: coarse)').matches) return;
  let raf = 0, ex = 0, ey = 0;
  window.addEventListener('pointermove', (e) => {
    ex = e.clientX; ey = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = img.getBoundingClientRect();
      const dx = (ex - (r.left + r.width / 2)) / innerWidth, dy = (ey - (r.top + r.height / 2)) / innerHeight;
      img.style.setProperty('--tilt-y', `${Math.max(-16, Math.min(16, dx * 26)).toFixed(2)}deg`);
      img.style.setProperty('--tilt-x', `${Math.max(-12, Math.min(12, -dy * 20)).toFixed(2)}deg`);
    });
  }, { passive: true });
}
