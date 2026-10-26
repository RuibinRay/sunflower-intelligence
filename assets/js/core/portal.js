// portal.js — the petal portal between the painting and a room, plus its continuation on arrival.
import { h, s, reducedMotion } from './dom.js?v=17';

const KEY = 'si:portal';
let leaving = false;

function petalRing(count = 34) {
  // one ring of painted petals; a Fibonacci count, because seed heads spiral in Fibonacci numbers
  const g = s('g', { class: 'portal-petals' });
  const defs = s('defs', {},
    s('linearGradient', { id: 'petal-grad', x1: '0', y1: '0', x2: '0', y2: '1' },
      s('stop', { offset: '0', 'stop-color': '#F3CF4E' }), s('stop', { offset: '0.6', 'stop-color': '#E8B923' }), s('stop', { offset: '1', 'stop-color': '#B07A10' })));
  for (let i = 0; i < count; i++) {
    const a = (360 / count) * i + (i % 2 ? 4 : -3);
    const len = 46 + (i % 3) * 7, w = 11 + (i % 2) * 3;
    g.append(s('path', {
      d: `M0,-30 C${w},${-30 - len * 0.35} ${w * 0.7},${-30 - len * 0.85} 0,${-30 - len} C${-w * 0.7},${-30 - len * 0.85} ${-w},${-30 - len * 0.35} 0,-30Z`,
      fill: 'url(#petal-grad)', stroke: '#8A5A0A', 'stroke-width': '1.2', 'stroke-opacity': '0.55', transform: `rotate(${a.toFixed(1)})`,
    }));
  }
  return { g, defs };
}

/**
 * Leave the current page for `url` through a portal opened at (x, y).
 * color: the room's colour, which fills the screen as you pass through.
 */
export function leave(url, { x = innerWidth / 2, y = innerHeight / 2, color = '#192B49', onProgress, beforeGo } = {}) {
  if (leaving) return;
  leaving = true;
  try { sessionStorage.setItem(KEY, JSON.stringify({ url: new URL(url, location.href).pathname, color, t: Date.now() })); } catch { /* private mode */ }
  const veil = h('div', { class: 'portal', 'aria-hidden': 'true' });
  const disc = h('div', { class: 'portal-disc', style: { background: color } });
  veil.append(disc);
  document.body.append(veil);
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;

  if (reducedMotion()) {
    disc.style.clipPath = 'none';
    let gone = false;
    const go = () => { if (gone) return; gone = true; try { beforeGo?.(); } catch { /* best effort */ } location.href = url; };
    disc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: 'forwards' }).finished.then(go);
    setTimeout(go, 400);
    return;
  }
  const size = Math.min(innerWidth, innerHeight) * 0.42;
  const svg = s('svg', { class: 'portal-ring', viewBox: '-110 -110 220 220', width: size, height: size, style: `left:${x - size / 2}px;top:${y - size / 2}px` });
  const { g, defs } = petalRing();
  svg.append(defs, g);
  veil.append(svg);
  svg.animate([
    { transform: 'scale(0.35) rotate(-20deg)', opacity: 0 },
    { transform: 'scale(1) rotate(10deg)', opacity: 1, offset: 0.35 },
    { transform: `scale(${(R / size) * 2.6}) rotate(48deg)`, opacity: 1 },
  ], { duration: 900, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' });
  disc.style.clipPath = `circle(0px at ${x}px ${y}px)`;
  const anim = disc.animate([
    { clipPath: `circle(0px at ${x}px ${y}px)` },
    { clipPath: `circle(0px at ${x}px ${y}px)`, offset: 0.3 },
    { clipPath: `circle(${R}px at ${x}px ${y}px)` },
  ], { duration: 900, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
  if (onProgress) {
    const t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / 900); onProgress(p); if (p < 1 && leaving) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  // navigate when the animation ends, or after a second at most, so slow devices never wait on it
  let gone = false;
  const go = () => { if (gone) return; gone = true; try { beforeGo?.(); } catch { /* best effort */ } location.href = url; };
  anim.finished.then(go);
  setTimeout(go, 1000);
}

/** Undo a half-finished departure (e.g. the page came back from the back/forward cache). */
export function reset() {
  leaving = false;
  document.querySelectorAll('.portal').forEach((el) => el.remove());
}

/** On a room page: continue the portal — the room's colour opens outward from the centre. */
export function arrive() {
  let data = null;
  try { data = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch { data = null; }
  const root = document.documentElement;
  if (!data || Date.now() - data.t > 6000 || data.url !== location.pathname) { root.classList.remove('is-arriving'); return false; }
  const veil = h('div', { class: 'portal is-arriving', 'aria-hidden': 'true' });
  const disc = h('div', { class: 'portal-disc', style: { background: data.color } });
  veil.append(disc);
  document.body.append(veil);
  root.classList.remove('is-arriving');   // the animated veil takes over from the static cover
  const done = () => veil.remove();
  if (reducedMotion()) { disc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.then(done); return true; }
  // the colour contracts into the room's flower: you arrive standing in front of the flower you entered
  const target = document.querySelector('.canvas-flower img');
  const r = target ? target.getBoundingClientRect() : null;
  const cx = r && r.width ? r.left + r.width / 2 : innerWidth / 2;
  const cy = r && r.width ? r.top + r.height / 2 : innerHeight / 2;
  const end = r && r.width ? r.width * 0.42 : 0;
  const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40;
  disc.animate([
    { clipPath: `circle(${R}px at ${cx}px ${cy}px)`, opacity: 1 },
    { clipPath: `circle(${R}px at ${cx}px ${cy}px)`, opacity: 1, offset: 0.12 },
    { clipPath: `circle(${end}px at ${cx}px ${cy}px)`, opacity: 1, offset: 0.78 },
    { clipPath: `circle(${end}px at ${cx}px ${cy}px)`, opacity: 0 },
  ], { duration: 900, easing: 'cubic-bezier(.6,0,.25,1)', fill: 'forwards' }).finished.then(done);
  return true;
}
