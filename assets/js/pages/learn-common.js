// learn-common.js — what the Learn page and the lesson pages share: the learner's state (kept in this browser
// only), the question card, and small helpers. One store, so an answer in a lesson counts in Practise too.
import { $$, h } from '../core/dom.js?v=13';
import * as F from '../core/format.js?v=13';
import { mulberry32 } from '../core/rng.js?v=13';
import * as L from '../core/learn.js?v=13';
import { SKILLS, ITEMS } from '../data/learn-items.js?v=13';

export const KEY = 'si:learn';
export const DAY = 86400000;
export const ITEM = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
export const SKILL = Object.fromEntries(SKILLS.map((sk) => [sk.id, sk]));

export function loadState() {
  try {
    const st = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (st && st.version === 1 && st.skills && Array.isArray(st.responses)) {
      SKILLS.forEach((sk) => { if (!st.skills[sk.id]) st.skills[sk.id] = { L: L.BKT.prior, nCorrect: 0, nWrong: 0, last: 0 }; });
      st.responses = st.responses.filter((r) => ITEM[r.id]);
      st.placement = (st.placement || []).filter((r) => ITEM[r.id]);
      st.read = st.read && typeof st.read === 'object' ? st.read : {};
      return st;
    }
  } catch { /* storage blocked or corrupt: start fresh */ }
  return { ...L.newState(SKILLS), placed: false, read: {} };
}
export function saveState(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: progress lasts for this visit */ } }
export function clearState() { try { localStorage.removeItem(KEY); } catch { /* nothing stored */ } }

/** Ability from every first answer to each question (repeat answers to the same question are not new evidence). */
export function updateTheta(state) {
  const seen = new Set(), rs = [];
  for (const r of [...state.placement, ...state.responses]) { if (seen.has(r.id)) continue; seen.add(r.id); rs.push({ item: ITEM[r.id], correct: r.correct }); }
  const e = L.eap(rs); state.theta = e.theta; state.se = e.se;
}

/** Links from any page: `root` reaches the site root ('../' from learn/, '../../../' from a lesson). */
export const lessonHref = (id, root) => `${root}learn/lessons/${id}/`;
export const toolHref = (sk, root) => `${root}${sk.href.replace(/^\.\.\//, '')}`;

function shuffled(state, item) {
  const attempts = state.responses.filter((r) => r.id === item.id).length + state.placement.filter((r) => r.id === item.id).length;
  let hsh = 0; for (const ch of `${item.id}:${attempts}`) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const r = mulberry32(hsh), order = item.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}

let qCount = 0;
/** A multiple-choice card. links: [{ href, text }] shown after the answer. */
export function questionCard(box, item, state, { kicker, onAnswer, nextLabel, onNext, links = [] }) {
  const name = `q${++qCount}`, order = shuffled(state, item);
  const check = h('button', { class: 'btn btn-primary', type: 'submit', disabled: true }, 'Check my answer');
  const opts = order.map((oi, k) => h('label', { class: 'option' },
    h('input', { type: 'radio', name, value: String(oi) }), h('span', { class: 'option-key', 'aria-hidden': 'true' }, 'ABCD'[k]), h('span', { class: 'option-text' }, item.options[oi])));
  const feedback = h('div', { class: 'q-feedback' });
  const form = h('form', { class: 'q-card', novalidate: true },
    h('p', { class: 'q-kicker' }, kicker),
    h('fieldset', {}, h('legend', { class: 'q-stem' }, item.stem), h('div', { class: 'options' }, opts)),
    h('div', { class: 'q-actions' }, check), feedback);
  form.addEventListener('change', () => { check.disabled = false; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const picked = form.querySelector('input:checked'); if (!picked) return;
    const correct = +picked.value === item.answer;
    $$('input', form).forEach((inp) => { inp.disabled = true; const lab = inp.closest('.option'); if (+inp.value === item.answer) lab.classList.add('is-right'); else if (inp === picked) lab.classList.add('is-wrong'); });
    check.remove();
    const nextBtn = onNext ? h('button', { class: 'btn btn-primary', type: 'button' }, nextLabel || 'Next question') : null;
    if (nextBtn) nextBtn.addEventListener('click', onNext);
    feedback.append(
      h('div', { class: `verdict ${correct ? 'is-good' : 'is-bad'}` }, h('p', {}, h('strong', {}, correct ? 'Right. ' : `Not quite: the answer is “${item.options[item.answer]}”. `), item.why)),
      links.length ? h('p', { class: 'q-more' }, links.flatMap((l, i) => [i ? ' · ' : '', h('a', { href: l.href }, l.text)])) : '',
      nextBtn || '');
    onAnswer(correct);
    (nextBtn || feedback.querySelector('a') || feedback).focus?.({ preventScroll: true });
  });
  box.replaceChildren(form);
  return form;
}

export function meter(a, b) {
  return h('div', { class: 'meter', role: 'img', 'aria-label': `Mastery ${F.pct(a, 0)} before, ${F.pct(b, 0)} now` },
    h('span', { class: 'meter-before', style: { width: `${Math.min(a, b) * 100}%` } }),
    h('span', { class: b >= a ? 'meter-gain' : 'meter-loss', style: { left: `${Math.min(a, b) * 100}%`, width: `${Math.abs(b - a) * 100}%` } }),
    h('span', { class: 'meter-goal', style: { left: `${L.BKT.mastered * 100}%` } }));
}

export function button(label, onClick, cls = 'btn-secondary') { const b = h('button', { class: `btn ${cls}`, type: 'button' }, label); b.addEventListener('click', onClick); return b; }
export function listWords(a) { return a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`; }
export function durationWords(days) {
  if (!Number.isFinite(days)) return '—';
  if (days < 1 / 24) return 'a few minutes';
  if (days < 23.5 / 24) { const hrs = Math.max(1, Math.round(days * 24)); return `${hrs} hour${hrs === 1 ? '' : 's'}`; }
  const d = Math.round(days); return `${d} day${d === 1 ? '' : 's'}`;
}

/**
 * The lesson to read next: the least-mastered skill whose lesson hasn't been read (in plate order when tied),
 * else the least-mastered skill overall. `meta` is LESSON_META.
 */
export function nextLesson(state, meta) {
  const unread = meta.filter((m) => !state.read?.[m.id]);
  const pool = unread.length ? unread : meta;
  return pool.slice().sort((a, b) => (state.skills[a.id]?.L ?? 0) - (state.skills[b.id]?.L ?? 0) || a.plate - b.plate)[0];
}
