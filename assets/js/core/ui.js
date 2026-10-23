// ui.js — small pieces of interface shared by the tool pages: verdict boxes and column pickers.
import { $$, h, s } from './dom.js?v=11';
import { mulberry32 } from './rng.js?v=11';

/** A verdict box: kind is good | warn | bad; the icon repeats the meaning so colour is never alone. */
export function verdict(kind, title, text) {
  const icons = { good: 'M5 10.5l3.2 3.2L15 7', warn: 'M10 5.5v5.2M10 14.2v.3', bad: 'M6.5 6.5l7 7M13.5 6.5l-7 7' };
  return h('div', { class: `verdict is-${kind}` },
    s('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' }, s('circle', { cx: 10, cy: 10, r: 8.6, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }), s('path', { d: icons[kind], fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
    h('p', {}, h('strong', {}, title), ' ', text));
}

export function fillSelect(sel, names, keep) {
  sel.replaceChildren(...names.map((n) => h('option', { value: n }, n)));
  if (keep && names.includes(keep)) sel.value = keep;
}

/** A row of checkbox chips; `name` prefixes the ids so several rows can share a page. */
export function chips(box, names, checked, name, onChange, disabled = []) {
  box.replaceChildren(...names.map((n, i) => {
    const id = `${name}-${i}`;
    const cb = h('input', { type: 'checkbox', id, value: n });
    cb.checked = checked.includes(n);
    cb.disabled = disabled.includes(n);
    cb.addEventListener('change', onChange);
    return h('label', { class: 'chip', for: id }, cb, h('span', {}, n));
  }));
}
export const checkedIn = (box) => $$('input:checked', box).map((i) => i.value);

/** Seeded 70/30 split of row indices. */
export function splitRows(n, seed = 7, share = 0.7) {
  const r = mulberry32(seed);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const cut = Math.round(n * share);
  return { train: idx.slice(0, cut), test: idx.slice(cut) };
}

/** Run fn once, when el comes within `margin` of the viewport: heavy sections further down wait until they are needed. */
export function whenNear(el, fn, margin = '700px') {
  if (!el || !('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: `${margin} 0px ${margin} 0px` });
  io.observe(el);
}
/** Resolves after the browser has had a chance to paint, so the page shows before the first heavy calculation. */
export const afterPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
