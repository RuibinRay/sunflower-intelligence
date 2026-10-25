// home.js — the homepage: frames the painting, places the five doorways, runs the living painting,
// and opens a room through the chosen flower. Works without WebGL (still image + CSS) and without JS (plain links).
import meta from '../../painting/meta.js?v=14';
import { ROOMS, byId } from '../data/rooms.js?v=14';
import { LivingPainting } from './painting.js?v=14';
import { initSite } from '../core/site.js?v=14';
import { leave, reset as resetPortal } from '../core/portal.js?v=14';
import { $, $$, h, reducedMotion } from '../core/dom.js?v=14';

initSite();

const body = document.body;
const stage = $('.stage');
const canvas = $('.stage-canvas');
const still = $('.stage-still img');
const caption = $('.plaque-caption');
const captionDefault = caption?.textContent ?? '';
const diag = new URLSearchParams(location.search).has('why');
const coarse = matchMedia('(pointer: coarse)').matches;
const calm = reducedMotion();
const flowers = Object.fromEntries(meta.flowers.map((f) => [f.id, f]));
const doors = meta.doorways.map((id) => ({ id, f: flowers[id], room: byId[id] }));

// ---------------------------------------------------------------- framing
let frameState = { view: [0, 0, meta.width, meta.height], s: 1, w: 1, h: 1 };
function layoutMode() {
  const vw = innerWidth, vh = innerHeight;
  return vw / vh < 1.15 ? 'band' : 'cover';
}
function computeFrame() {
  const mode = layoutMode();
  body.classList.toggle('home--band', mode === 'band');
  body.classList.toggle('home--cover', mode === 'cover');
  body.classList.toggle('label-below', mode === 'band' || innerHeight < 600);
  const S = meta.safe, W = meta.width, H = meta.height;
  if (mode === 'band') stage.style.height = `${Math.round(Math.min(innerWidth * (H / S.w), innerHeight * 0.88))}px`;
  else stage.style.height = '';
  const vw = stage.clientWidth, vh = stage.clientHeight;
  const sCover = Math.max(vw / W, vh / H);
  const sSafe = Math.min(vw / S.w, vh / S.h);
  const s = Math.min(sCover, sSafe);
  const iw = vw / s, ih = vh / s;
  let x0 = S.x + S.w / 2 - iw / 2, y0 = S.y + S.h / 2 + 90 - ih / 2;     // nudge down so the vase stays in frame
  x0 = iw <= W ? Math.min(Math.max(x0, 0), W - iw) : (W - iw) / 2;
  y0 = ih <= H ? Math.min(Math.max(y0, 0), H - ih) : (H - ih) / 2;
  frameState = { view: [x0, y0, iw, ih], s, w: vw, h: vh };
  // the still image mirrors the same framing
  still.style.width = `${W * s}px`; still.style.height = `${H * s}px`;
  still.style.transform = `translate(${-x0 * s}px, ${-y0 * s}px)`;
  placeDoors();
  if (painting) { painting.setView(x0, y0, iw, ih); dirty = true; }
}
const toScreen = (x, y) => [(x - frameState.view[0]) * frameState.s, (y - frameState.view[1]) * frameState.s];

// ---------------------------------------------------------------- doorways
const doorEls = doors.map((d) => $(`.door[data-room="${d.id}"]`));
function placeDoors() {
  doors.forEach((d, k) => {
    const [cx, cy] = toScreen(d.f.x, d.f.y);
    const size = Math.max(44, d.f.r * 2 * frameState.s * 0.86);
    const el = doorEls[k];
    Object.assign(el.style, { left: `${cx - size / 2}px`, top: `${cy - size / 2}px`, width: `${size}px`, height: `${size}px` });
    // the room's name appears just under the flower's head while it is pointed at or focused
    el.style.setProperty('--below', `${(size / 2 + d.f.r * frameState.s * 0.78).toFixed(1)}px`);
    el.dataset.ready = '1';
  });
}

const hoverTarget = new Float32Array(doors.length);
let activeDoor = -1, engaged = false;
function setActive(k, on) {
  if (on && !engaged) { engaged = true; body.classList.add('is-engaged'); }
  hoverTarget.fill(0);
  if (on) hoverTarget[k] = 1;
  activeDoor = on ? k : -1;
  $$('.room-entry').forEach((el) => el.classList.toggle('is-lit', on && el.dataset.room === doors[k].id));
  doorEls.forEach((el, i) => el.classList.toggle('is-lit', on && i === k));
  if (caption) {
    caption.textContent = on ? doors[k].room.blurb : captionDefault;
    caption.classList.toggle('is-room', on);
  }
  dirty = true;
}

function enter(k, origin) {
  const d = doors[k];
  const [cx, cy] = toScreen(d.f.x, d.f.y);
  const rect = stage.getBoundingClientRect();
  const x = origin?.x ?? rect.left + cx, y = origin?.y ?? rect.top + cy;
  setActive(k, true);
  if (painting && !calm && checkedQuality) { portalStart = performance.now(); portalDoor = k; }
  leave(new URL(d.room.path, document.baseURI).href, { x, y, color: d.room.color, beforeGo: () => painting?.release() });
}

doorEls.forEach((el, k) => {
  el.addEventListener('pointerenter', () => setActive(k, true));
  el.addEventListener('pointerleave', () => { if (portalDoor < 0) setActive(k, false); });
  el.addEventListener('focus', () => setActive(k, true));
  el.addEventListener('blur', () => { if (portalDoor < 0) setActive(k, false); });
  el.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    enter(k);
  });
});
// the label card's list lights its flower, and opens the room through that flower
$$('.room-entry').forEach((el) => {
  const k = doors.findIndex((d) => d.id === el.dataset.room);
  el.addEventListener('pointerenter', () => setActive(k, true));
  el.addEventListener('pointerleave', () => setActive(k, false));
  el.addEventListener('focus', () => setActive(k, true));
  el.addEventListener('blur', () => setActive(k, false));
  el.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const visible = body.classList.contains('home--cover') || stage.getBoundingClientRect().bottom > 0;
    enter(k, visible ? undefined : { x: innerWidth / 2, y: innerHeight / 2 });
  });
});

// ---------------------------------------------------------------- the sun crosses the wall slowly, on its own
const light = { x: meta.width * 0.32, y: meta.height * 0.18, amt: 0 };

// ---------------------------------------------------------------- the render loop
let painting = null, dirty = true, last = performance.now(), wakeStart = 0;
let portalStart = 0, portalDoor = -1;
const frameTimes = [];
const forceGL = new URLSearchParams(location.search).get('gl') === 'force';   // ?gl=force: keep WebGL on any renderer, skip the speed check (testing)
let checkedQuality = forceGL, qualityStart = 0;

function tick(now) {
  requestAnimationFrame(tick);
  if (!painting || document.visibilityState !== 'visible') { last = now; return; }
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const running = !document.documentElement.classList.contains('motion-paused');
  if (running) painting.time += dt * (calm ? 0.35 : 1);

  // the light walks a slow arc across the painting (one crossing every 46 s); the pointer never moves it
  if (running) {
    const t = (painting.time) / 46;
    light.x = meta.width * (0.5 + 0.38 * Math.sin(t * Math.PI * 2));
    light.y = meta.height * (0.16 + 0.1 * Math.cos(t * Math.PI * 2));
  }
  light.amt += (0.8 - light.amt) * (1 - Math.exp(-dt * 2));
  painting.light = [light.x, light.y, light.amt];

  let changing = false;
  const hk = 1 - Math.exp(-dt * 11);
  for (let i = 0; i < doors.length; i++) {
    const before = painting.hover[i];
    painting.hover[i] += (hoverTarget[i] - painting.hover[i]) * hk;
    if (Math.abs(painting.hover[i] - before) > 1e-4) changing = true;
  }
  painting.anyHover = Math.max(...painting.hover);
  if (wakeStart) {
    const p = (now - wakeStart) / 1700;
    painting.wake = p >= 1 ? 0 : Math.sin(Math.min(1, p) * Math.PI) * 0.9;
    if (p >= 1) wakeStart = 0; else changing = true;
  } else if (!engaged && running && !calm) {
    // until the visitor finds a doorway, the five halos breathe softly every eight seconds
    painting.wake = 0.5 * Math.max(0, Math.sin((now / 8000) * Math.PI * 2)) ** 6;
  } else painting.wake = 0;
  if (portalDoor >= 0) {
    const p = Math.min(1, (now - portalStart) / 900);
    const d = doors[portalDoor].f;
    painting.portal = [d.x, d.y, p * p, 0];
    changing = true;
  }
  if (running || changing || dirty) { painting.render(); dirty = false; }

  // performance ladder, judged on wall-clock time: full shader -> lighter shader -> still image
  if (!checkedQuality && running) {
    if (!qualityStart) qualityStart = now;
    frameTimes.push(dt);
    if (now - qualityStart > 900 && frameTimes.length > 6) {
      const sorted = frameTimes.slice(2).sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      if (med > 0.028 && painting.tier === 'full') { painting.tier = 'lite'; frameTimes.length = 0; qualityStart = 0; }
      else if (med > 0.04 && painting.tier === 'lite') fallBack(`slow device (${Math.round(1 / med)} fps)`);
      else checkedQuality = true;
    }
  }
  if (diag) diagnose(now, dt);
}

function fallBack(reason) {
  body.classList.add('is-still');
  canvas.hidden = true;
  painting = null;
  if (diag) { if (!diagEl) { diagEl = h('div', { class: 'diag' }); document.body.append(diagEl); } diagEl.textContent = `still painting: ${reason}`; }
}

let diagEl = null, fpsAvg = 60;
function diagnose(now, dt) {
  if (!diagEl) { diagEl = h('div', { class: 'diag' }); document.body.append(diagEl); }
  fpsAvg = fpsAvg * 0.95 + (1 / Math.max(dt, 1e-3)) * 0.05;
  if (!painting) return;
  diagEl.textContent = `living · ${painting.tier}${painting.software ? ' (software GL)' : ''} · ${painting.isGL2 ? 'WebGL2' : 'WebGL1'} · ${canvas.width}×${canvas.height} · ${fpsAvg.toFixed(0)} fps · ${calm ? 'reduced motion: calm' : 'full motion'}${document.documentElement.classList.contains('motion-paused') ? ' · paused' : ''}`;
}

async function start() {
  computeFrame();
  addEventListener('resize', () => { computeFrame(); });
  requestAnimationFrame(tick);
  const big = innerWidth * Math.min(devicePixelRatio || 1, 1.5) / (frameState.view[2] / meta.width);
  const paint = big > 1950 ? 'painting-2576.webp' : big > 1300 ? 'painting-1920.webp' : 'painting-1280.webp';
  const base = new URL('../../painting/', import.meta.url);
  // let the still painting paint first; the living one takes over when the browser is idle
  try { await still.decode(); } catch { /* still image failed; WebGL may still work */ }
  await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1200 }) : setTimeout(r, 300)));
  try {
    const lp = new LivingPainting(canvas, meta);
    if (calm) { lp.flowRate = 0.09; lp.sway = 0; }
    // software GL keeps a CPU core busy and stalls page changes: those machines keep the still painting
    await lp.init({ paint: new URL(paint, base).href, flow: new URL('flow.png', base).href, height: new URL('height.webp', base).href, allowSoftware: forceGL });
    lp.setView(...frameState.view);
    painting = lp;
    painting.render();
    body.classList.add('is-living');
    if (!calm) setTimeout(() => { wakeStart = performance.now(); }, 700);
  } catch (err) {
    fallBack(err.message || 'WebGL failed');
  }
}

window.addEventListener('pagehide', () => painting?.release());
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  painting?.restore();
  resetPortal();
  portalDoor = -1;
  if (painting) painting.portal = [0, 0, 0, 0];
  setActive(0, false);
  dirty = true;
});

// ---------------------------------------------------------------- why sunflowers
const why = $('#why');
$$('[data-open-why]').forEach((b) => b.addEventListener('click', () => why.showModal()));
why?.addEventListener('click', (e) => { if (e.target === why) why.close(); });

if (coarse) body.classList.add('is-touch');
start();
