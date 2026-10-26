// learn-lesson.js — one lesson page: makes the calculator live, asks the skill's questions (which update the same
// mastery as Practise), and remembers that the lesson was read.
import { initSite, syncRanges } from '../core/site.js?v=19';
import { $, $$, h } from '../core/dom.js?v=19';
import * as F from '../core/format.js?v=19';
import * as L from '../core/learn.js?v=19';
import { ITEMS } from '../data/learn-items.js?v=19';
import { SKILL, loadState, saveState, updateTheta, questionCard, meter, durationWords, toolHref } from './learn-common.js?v=19';
import { whenNear } from '../core/ui.js?v=19';

initSite();
const article = $('.lesson');
const id = article.dataset.lesson, sk = SKILL[id];
let state = loadState();

// ---------------------------------------------------------------- status line
function renderStatus() {
  const st = state.skills[id], read = state.read[id];
  const bits = [];
  if (read) bits.push(`You read this on ${new Date(read).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.`);
  if (st.nCorrect + st.nWrong) bits.push(`Mastery of ${sk.name}: ${F.pct(st.L, 0)}${st.L >= L.BKT.mastered ? ' (mastered)' : ''}.`);
  $('#lesson-status').textContent = bits.join(' ');
}

// ---------------------------------------------------------------- the calculator
function fmtInput(inp, v) {
  const d = inp.digits ?? (inp.step < 1 ? Math.min(3, Math.ceil(-Math.log10(inp.step))) : 0);
  if (inp.fmt === 'pct') return `${F.num(v, d)}%`;
  if (inp.fmt === 'money') return `${F.money(v, { digits: d })}${inp.unit || ''}`;
  if (inp.fmt === 'int') return `${F.int(v)}${inp.unit ? ` ${inp.unit}` : ''}`;
  return `${F.num(v, d)}${inp.unit ? ` ${inp.unit}` : ''}`;
}
async function liveCalc() {
  const lesson = (await import(`../data/lessons/${id}.js?v=19`)).default;
  const { inputs, compute } = lesson.calc;
  const run = () => {
    const v = Object.fromEntries(inputs.map((i) => { const val = +$(`#c-${i.id}`).value; $(`#c-${i.id}-out`).textContent = fmtInput(i, val); return [i.id, val]; }));
    let r;
    try { r = compute(v); } catch (e) { r = { error: 'These inputs can’t be calculated.' }; }
    if (r.error) {
      $('#calc-hero').textContent = '—'; $('#calc-hero-label').textContent = '';
      $('#calc-rows').replaceChildren(); $('#calc-note').textContent = r.error; $('#calc-note').classList.add('is-error');
      return;
    }
    $('#calc-note').classList.remove('is-error');
    $('#calc-hero').innerHTML = r.headline.value; $('#calc-hero-label').innerHTML = r.headline.label;
    $('#calc-rows').replaceChildren(...r.rows.map(([k, val]) => { const d = h('div', { class: 'stat' }, h('dt'), h('dd', { class: 'num' })); d.firstChild.innerHTML = k; d.lastChild.innerHTML = val; return d; }));
    $('#calc-note').innerHTML = r.note || '';
  };
  $('#calc-form').addEventListener('input', run);
  run();
}

// ---------------------------------------------------------------- check yourself
/** Up to three of this skill's questions: ones never answered first (easiest first), then ones last answered wrong, then the oldest. */
function pickQuestions() {
  const bank = ITEMS.filter((it) => it.skill === id);
  const last = (it) => [...state.placement, ...state.responses].filter((r) => r.id === it.id).pop();
  const score = (it) => { const r = last(it); return !r ? [0, it.b] : !r.correct ? [1, r.t] : [2, r.t]; };
  return bank.slice().sort((a, b) => { const x = score(a), y = score(b); return x[0] - y[0] || x[1] - y[1]; }).slice(0, 3);
}
function renderCheck() {
  const qs = pickQuestions(), box = $('#lesson-quiz'), side = $('#lesson-mastery');
  let k = 0, right = 0;
  const startL = state.skills[id].L;
  const ask = () => {
    if (k >= qs.length) {
      const st = state.skills[id];
      const hl = L.halfLife({ nCorrect: st.nCorrect, nWrong: st.nWrong, difficulty: sk.difficulty });
      box.replaceChildren(h('div', { class: 'q-card' },
        h('p', { class: 'q-kicker' }, `${right} of ${qs.length} right`),
        h('p', { class: 'q-stem' }, right === qs.length ? 'All right. The skill comes back in Practise before you’re likely to forget it.' : 'Worth another look at the worked example, then try again in Practise.'),
        h('p', {}, `Next review in about ${durationWords(hl)}.`),
        h('div', { class: 'q-actions' }, h('a', { class: 'btn btn-primary', href: '../../practise/#practice' }, 'Go to Practise'), h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => { k = 0; right = 0; renderCheck(); } }, 'Ask me again'))));
      return;
    }
    const item = qs[k];
    questionCard(box, item, state, {
      kicker: `Question ${k + 1} of ${qs.length} · ${sk.name}`,
      onAnswer: (correct) => {
        const before = state.skills[id].L;
        L.record(state, item, correct);
        if (correct) right++;
        state.read[id] ||= Date.now();
        updateTheta(state); saveState(state);
        const st = state.skills[id];
        side.replaceChildren(h('div', { class: 'mastery-change' },
          h('p', { class: 'figure-title' }, sk.name),
          meter(before, st.L),
          h('p', { class: 'hero-label' }, `Chance of mastery ${F.pct(before, 0)} → ${F.pct(st.L, 0)}${st.L >= L.BKT.mastered && before < L.BKT.mastered ? ': mastered.' : '.'}`)));
        renderStatus();
      },
      nextLabel: k + 1 < qs.length ? 'Next question' : 'See how you did',
      onNext: () => { k++; ask(); },
      links: [{ href: toolHref(sk, '../../../'), text: `Use it: ${sk.name} in ${sk.room}` }],
    });
  };
  side.replaceChildren(h('div', { class: 'mastery-change' }, h('p', { class: 'figure-title' }, sk.name), meter(startL, startL), h('p', { class: 'hero-label' }, `Chance of mastery now: ${F.pct(startL, 0)}. Mastered at 95%.`)));
  ask();
}

// ---------------------------------------------------------------- read tracking: reaching the end of the lesson counts
whenNear($('#remember'), () => { if (!state.read[id]) { state.read[id] = Date.now(); saveState(state); } }, '0px');

renderStatus();
liveCalc();
renderCheck();
syncRanges();
// another tab may have changed progress
addEventListener('storage', (e) => { if (e.key === 'si:learn') { state = loadState(); renderStatus(); } });
