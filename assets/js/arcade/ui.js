// ui.js — the parts every arcade game shares: the cabinet's top bar, the code editor, the level strip and
// the end-of-level card.
import { pixelHeadings, setMuted, sfx, spriteUrl } from './pixel.js?v=37';
import * as store from './store.js?v=37';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** h('div.a.b', { id: 'x', onclick }, child, 'text') */
export function h(spec, attrs = {}, ...kids) {
  const [tag, ...cls] = spec.split('.');
  const el = document.createElement(tag || 'div');
  if (cls.length) el.className = cls.join(' ');
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
}

/** The bar across the top of a game: its name, the player's rank, XP and streak, sound, and the way back. */
export function topBar(mount, { title, root }) {
  setMuted(store.state().mute);
  const xp = h('span.hud-chip', { title: 'Experience points' });
  const fire = h('span.hud-chip.hud-streak', { title: 'Days played in a row' });
  const mute = h('button.px-btn.px-btn--ghost.px-btn--sm', { type: 'button', 'aria-pressed': String(!store.state().mute), onclick: () => { const m = !store.state().mute; store.setMute(m); setMuted(m); mute.setAttribute('aria-pressed', String(!m)); mute.textContent = m ? 'Sound off' : 'Sound on'; if (!m) sfx('pick'); } }, store.state().mute ? 'Sound off' : 'Sound on');
  const bar = h('div.arc-top', {},
    h('a.arc-back', { href: `${root}learn/arcade/` }, '◀ Arcade'),
    h('h2.arc-title', { 'data-px': '3' }, title),
    h('div.arc-hud', {}, xp, fire, mute));
  mount.append(bar);
  pixelHeadings(bar);
  const refresh = () => {
    const r = store.rank();
    xp.textContent = `Lv ${r.level} ${r.name} · ${store.state().xp} XP`;
    const s = store.streak();
    fire.textContent = s ? `${s}-day streak` : 'No streak yet';
    fire.classList.toggle('is-lit', s > 0);
  };
  refresh();
  return { refresh };
}

/** A plain-text code editor with line numbers. Tab inserts four spaces; Ctrl/Cmd + Enter runs. */
export function editor({ label, value = '', rows = 9, onRun, onInput }) {
  const id = `ed-${Math.random().toString(36).slice(2, 8)}`;
  const gutter = h('div.ed-gutter', { 'aria-hidden': 'true' });
  const ta = h('textarea.ed-text', { id, rows, spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off' });
  ta.value = value;
  let marked = 0, bad = 0;
  const paint = () => {
    const n = Math.max(ta.value.split('\n').length, 1);
    gutter.innerHTML = Array.from({ length: n }, (_, i) => `<span class="${i + 1 === bad ? 'is-bad' : i + 1 === marked ? 'is-on' : ''}">${i + 1}</span>`).join('');
    gutter.scrollTop = ta.scrollTop;
  };
  ta.addEventListener('input', () => { bad = 0; marked = 0; paint(); if (onInput) onInput(ta.value); });
  ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (onRun) onRun(); return; }
    if (e.key === 'Tab' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); return; }
    if (e.key === 'Enter') {   // keep the indentation of the line above, and add a level after a colon
      const before = ta.value.slice(0, ta.selectionStart);
      const line = before.slice(before.lastIndexOf('\n') + 1);
      const indent = line.match(/^ */)[0] + (/:\s*$/.test(line) ? '    ' : '');
      if (indent) { e.preventDefault(); ta.setRangeText(`\n${indent}`, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
    }
    if (e.key === 'Escape') ta.blur();   // a way out for keyboard users, since Tab indents
  });
  const el = h('div.ed', {}, h('label.ed-label', { for: id }, label, h('span.ed-keys', {}, 'Tab indents · Esc leaves the box · Ctrl/⌘ + Enter runs')), h('div.ed-box', {}, gutter, ta));
  paint();
  return {
    el, textarea: ta,
    get: () => ta.value,
    set: (v) => { ta.value = v; bad = 0; marked = 0; paint(); },
    mark: (line) => { marked = line; paint(); },
    error: (line) => { bad = line; paint(); },
    focus: () => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); },
  };
}

/** The row of level buttons. stars: { id: n }. */
export function levelStrip({ levels, stars, current, onPick }) {
  const nav = h('nav.lv-strip', { 'aria-label': 'Levels' });
  const paint = (cur, st) => {
    nav.replaceChildren(h('ol', { role: 'list' }, levels.map((lv, i) => {
      const s = st[lv.id] || 0;
      return h('li', {}, h(`button.lv-btn${i === cur ? '.is-current' : ''}${s ? '.is-done' : ''}`, { type: 'button', 'aria-current': i === cur ? 'step' : null, 'aria-label': `Level ${i + 1}: ${lv.title}${s ? `, ${s} of 3 stars` : ''}`, title: `${lv.title} · ${lv.concept}`, onclick: () => onPick(i) },
        h('span.lv-n', {}, String(i + 1)), h('span.lv-stars', { 'aria-hidden': 'true' }, '★'.repeat(s) + '☆'.repeat(3 - s))));
    })));
  };
  paint(current, stars);
  return { el: nav, paint };
}

/** The brief beside the screen: the idea being taught, the goal, and the words the level allows. */
export function brief(level, n, total, extra = null) {
  return h('div.brief', {},
    h('p.brief-kicker', {}, `Level ${n} of ${total} · ${level.concept}`),
    h('h3.brief-title', {}, level.title),
    ...level.teach.map((t) => h('p.brief-teach', { html: t.replace(/<(?!\/?b>)/g, '&lt;') })),
    h('p.brief-goal', {}, h('b', {}, 'Goal '), level.goal),
    level.api ? h('ul.api', { role: 'list', 'aria-label': 'Commands for this level' }, level.api.map((a) => h('li', {}, h('code', {}, a)))) : null,
    extra);
}

/** The card shown when a level or a run ends. */
export function resultCard({ title, lines = [], stars = null, reward, actions }) {
  const card = h('div.result', { role: 'status' },
    h('h3.result-title', { 'data-px': '3' }, title),
    stars != null ? h('p.result-stars', { 'aria-label': `${stars} of 3 stars` }, [0, 1, 2].map((i) => h('img', { src: spriteUrl(i < stars ? 'star' : 'starOff', 5), alt: '', width: 35, height: 30 }))) : null,
    ...lines.map((l) => (typeof l === 'string' ? h('p.result-line', {}, l) : l)),
    reward ? h('p.result-xp', {}, `+${reward.xp} XP`, reward.rankUp ? h('span.result-rank', {}, ` · New rank: ${reward.rankUp}`) : null) : null,
    reward && reward.badges.length ? h('ul.result-badges', { role: 'list' }, reward.badges.map((b) => h('li', {}, h('b', {}, `Badge: ${b[1]}`), ` ${b[2]}`))) : null,
    h('div.result-actions', {}, actions));
  pixelHeadings(card);
  return card;
}
export const btn = (label, onclick, kind = '') => h(`button.px-btn${kind ? `.px-btn--${kind}` : ''}`, { type: 'button', onclick }, label);
/** Stars for a puzzle solved by trying: three with no hint in three runs or fewer, otherwise two. */
export const tryStars = (runs, hinted) => (!hinted && runs <= 3 ? 3 : 2);
/** replaceChildren that skips null and false, so `cond ? node : null` can be passed straight in. */
export const fill = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
