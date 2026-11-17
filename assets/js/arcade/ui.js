// ui.js — the parts every arcade game shares: the cabinet's top bar, the code editor, the level strip and
// the end-of-level card.
import { pixelHeadings, setMuted, sfx, spriteUrl } from './pixel.js?v=33';
import * as store from './store.js?v=33';
import { RECAPS, INTROS } from './recaps.js?v=33';

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

/** What every teaching game shares: the opening "What is …?" card, the card shown when a level is solved
 *  (what you learned, an example, a quick check), and the Notes list of everything learned so far.
 *  teacher({ game, levels, briefBox, paintBrief, load, bar }) -> { start, solved, tools, notes } */
export function teacher({ game, levels, briefBox, paintBrief, load, bar }) {
  const intro = INTROS[game], recaps = RECAPS[game];
  const notes = h('div.arc-notes', { hidden: true, tabindex: '-1' });
  function showIntro() {
    const go = btn(store.starsOf(game) && Object.keys(store.starsOf(game)).length ? 'Back to the level ▶' : 'Start level 1 ▶', () => { store.markIntro(game); paintBrief(); }, 'go');
    fill(briefBox, h('div.brief.brief-intro', {},
      h('p.brief-kicker', {}, 'Before you start'),
      h('h3.brief-title', {}, `What is ${intro.name}?`),
      h('p.brief-teach', {}, intro.what), h('p.brief-teach', {}, intro.used),
      h('p.brief-goal', {}, h('b', {}, 'In this game '), intro.play),
      h('div.result-actions', {}, go)));
    return go;
  }
  function paintNotes() {
    const done = store.starsOf(game);
    const got = levels.filter((lv) => done[lv.id]);
    fill(notes, h('h3.quiz-h', {}, `Your ${intro.name} notes`),
      h('p.quiz-lead', {}, got.length ? `${got.length} of ${levels.length} ideas learned. Each one is added here when you finish its level.` : 'Nothing here yet. Finish a level and what it taught is added to these notes.'),
      h('ol.notes-list', {}, got.map((lv) => h('li', {}, h('b', {}, lv.concept), h('p', {}, recaps[lv.id][0]), h('pre.quiz-code', {}, h('code', {}, recaps[lv.id][1]))))));
  }
  const tools = [
    btn(`What is ${intro.name}?`, () => { showIntro().focus(); briefBox.scrollIntoView({ block: 'nearest' }); }, 'ghost'),
    btn('Notes', () => { notes.hidden = !notes.hidden; if (!notes.hidden) { paintNotes(); notes.scrollIntoView({ block: 'nearest' }); notes.focus(); } }, 'ghost'),
  ];
  /** Show the solved card in place of the brief. */
  function solved({ n, level, stars, reward, lines = [], lastHref, lastLabel }) {
    const last = n === levels.length - 1;
    const [learned, example, question, right, w1, w2, why] = recaps[level.id];
    const next = btn(last ? lastLabel : 'Next level ▶', () => { if (last) location.href = lastHref; else load(n + 1); }, 'go');
    const feedback = h('p.check-why', { role: 'status' });
    const opts = [right, w1, w2].map((text) => ({ text, r: Math.random() })).sort((a, b) => a.r - b.r).map(({ text }) => h('button.px-btn.opt', { type: 'button', onclick: (e) => {
      const ok = text === right;
      opts.forEach((b) => { b.disabled = true; b.classList.add(b.textContent === right ? 'is-right' : b === e.currentTarget ? 'is-wrong' : 'is-dim'); });
      const res = store.checkDone(game, level.id, ok);
      fill(feedback, h('b', {}, ok ? `Right${res.xp ? ` (+${res.xp} XP)` : ''}. ` : 'Not quite. '), why);
      sfx(ok ? 'ok' : 'bad');
      if (bar) bar.refresh();
      next.focus();
    } }, text));
    const card = h('div.brief.brief-lesson', { role: 'status' },
      h('p.brief-kicker', {}, `Level ${n + 1} of ${levels.length} complete`),
      h('h3.result-title', { 'data-px': '3' }, last ? 'All done!' : 'Level clear!'),
      h('p.result-stars', { 'aria-label': `${stars} of 3 stars` }, [0, 1, 2].map((i) => h('img', { src: spriteUrl(i < stars ? 'star' : 'starOff', 5), alt: '', width: 35, height: 30 }))),
      ...lines.map((l) => h('p.result-line', {}, l)),
      h('p.result-xp', {}, `+${reward.xp} XP`, reward.rankUp ? h('span.result-rank', {}, ` · New rank: ${reward.rankUp}`) : null),
      reward.badges.length ? h('ul.result-badges', { role: 'list' }, reward.badges.map((b) => h('li', {}, h('b', {}, `Badge: ${b[1]}`), ` ${b[2]}`))) : null,
      h('div.arc-learned', {}, h('b', {}, `What you just learned: ${level.concept}`), h('p', {}, learned), h('pre.quiz-code', {}, h('code', {}, example))),
      h('div.qcheck', {}, h('b', {}, 'Quick check'), h('p', {}, question), h('div.check-opts', { role: 'group', 'aria-label': 'Answers' }, opts), feedback),
      h('div.result-actions', {}, next, btn('Stay on this level', () => paintBrief(), 'ghost')));
    pixelHeadings(card);
    fill(briefBox, card);
    if (!notes.hidden) paintNotes();
    briefBox.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    opts[0].focus({ preventScroll: true });
  }
  return { start: () => { if (!store.seenIntro(game)) showIntro(); }, solved, tools, notes };
}
