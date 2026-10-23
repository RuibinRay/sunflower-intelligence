// site.js — behaviour shared by every page: rooms menu, motion switch, arrival through the portal.
import { $, $$, store } from './dom.js?v=7';
import { arrive, reset, leave } from './portal.js?v=7';

const root = document.documentElement;

export function motionOn() { return !root.classList.contains('motion-paused'); }

function initMotion() {
  const saved = store.get('si:motion', 'on');
  root.classList.toggle('motion-paused', saved === 'off');
  const btns = $$('.motion-btn');
  const sync = () => {
    const paused = root.classList.contains('motion-paused');
    btns.forEach((b) => {
      b.setAttribute('aria-pressed', String(paused));
      b.setAttribute('aria-label', paused ? 'Play motion' : 'Pause motion');
      b.title = paused ? 'Play motion' : 'Pause motion';
      b.querySelector('.i-pause')?.toggleAttribute('hidden', paused);
      b.querySelector('.i-play')?.toggleAttribute('hidden', !paused);
    });
  };
  btns.forEach((b) => b.addEventListener('click', () => {
    const paused = !root.classList.contains('motion-paused');
    root.classList.toggle('motion-paused', paused);
    store.set('si:motion', paused ? 'off' : 'on');
    sync();
    window.dispatchEvent(new CustomEvent('si:motion', { detail: { paused } }));
  }));
  sync();
}

function initMenu() {
  const btn = $('.menu-btn'), nav = $('#site-nav');
  if (!btn || !nav) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (open) nav.querySelector('a')?.focus();
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) set(false); });
  matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}

/** Links marked data-portal open through the petal portal (plain clicks only; new-tab clicks stay native). */
export function initPortalLinks(scope = document) {
  $$('a[data-portal]', scope).forEach((a) => a.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const r = (a.querySelector('img') || a).getBoundingClientRect();
    leave(a.href, { x: r.left + r.width / 2, y: r.top + r.height / 2, color: a.dataset.portal });
  }));
}

/** The sticky canvas column only stays sticky while everything in it fits on screen. */
function fitCanvas() {
  const c = $('.canvas');
  if (!c) return;
  const check = () => {
    c.classList.remove('is-tall');
    if (matchMedia('(max-width: 960px)').matches) return;
    if (c.scrollHeight > c.clientHeight + 2) c.classList.add('is-tall');
  };
  check();
  document.fonts?.ready.then(check);
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(check, 120); });
}

/** Range sliders paint their filled track from --fill; keep it in step with the value. */
export function fillRange(el) {
  const min = el.min === '' ? 0 : +el.min, max = el.max === '' ? 100 : +el.max;
  el.style.setProperty('--fill', `${((+el.value - min) / (max - min || 1)) * 100}%`);
}
export function syncRanges(scope = document) { $$('input[type="range"]', scope).forEach(fillRange); }

export function initSite() {
  document.addEventListener('input', (e) => { if (e.target instanceof HTMLInputElement && e.target.type === 'range') fillRange(e.target); });
  syncRanges();
  initMotion();
  initMenu();
  initPortalLinks();
  fitCanvas();
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  if (document.body.classList.contains('room')) arrive();
  window.addEventListener('pageshow', (e) => { if (e.persisted) reset(); });
}
