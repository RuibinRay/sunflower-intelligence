// learn.js — the Learn room: adaptive placement (IRT), practice by mastery (BKT) and spaced review (HLR).
import { initSite, syncRanges } from '../core/site.js?v=6';
import { $, $$, h, s, download, toCSV, onResize, debounce } from '../core/dom.js?v=6';
import * as F from '../core/format.js?v=6';
import { lineChart, tableTwin } from '../core/charts.js?v=6';
import * as L from '../core/learn.js?v=6';
import { SKILLS, ITEMS } from '../data/learn-items.js?v=6';
import { LESSON_META } from '../data/lessons/meta.js?v=6';
import { DAY, ITEM, SKILL, loadState, saveState, clearState, updateTheta as thetaOf, questionCard as card, meter, button, listWords, durationWords, lessonHref, toolHref, nextLesson } from './learn-common.js?v=6';

initSite();
const LESSON = Object.fromEntries(LESSON_META.map((m) => [m.id, m]));

// ---------------------------------------------------------------- state (kept in this browser only; shared with the lessons)
let state = loadState();
const save = () => saveState(state);
const updateTheta = () => thetaOf(state);
/** After an answer: the lesson (if there is one) and the tool that uses the idea. */
const linksFor = (sk) => [...(LESSON[sk.id] ? [{ href: lessonHref(sk.id, '../'), text: `Read the lesson: ${LESSON[sk.id].title}` }] : []), { href: toolHref(sk, '../'), text: `Use it: ${sk.name} in ${sk.room}` }];
const questionCard = (box, item, opts) => card(box, item, state, { links: linksFor(SKILL[item.skill]), ...opts });

// ---------------------------------------------------------------- placement check
function asked() { return state.placement.map((r) => ({ item: ITEM[r.id], correct: r.correct })); }
function renderPlacement() {
  const box = $('#pl-quiz');
  const as = asked();
  const est = L.eap(as);
  drawPlacementChart();
  if (state.placed && as.length) return placementSummary(box, est);
  if (state.placed && !as.length) {
    box.replaceChildren(h('div', { class: 'q-card' }, h('p', {}, 'You skipped the check, so every skill starts from the same prior.'),
      button('Take the check now', () => { state.placed = false; save(); renderPlacement(); })));
    return;
  }
  if (!as.length && !box.dataset.started) {
    box.replaceChildren(h('div', { class: 'q-card q-intro' },
      h('p', { class: 'q-kicker' }, 'About five minutes'),
      h('p', { class: 'q-stem' }, 'Answer honestly; a guess is fine. The check stops as soon as it is fairly sure of your level.'),
      h('div', { class: 'q-actions' },
        button('Start the check', () => { box.dataset.started = '1'; renderPlacement(); }, 'btn-primary'),
        button('Skip it and practise', () => { finishPlacement(); $('#practice').scrollIntoView({ block: 'start' }); }))));
    return;
  }
  const item = L.nextPlacementItem(ITEMS, as, est.theta);
  if (!item) { finishPlacement(); return; }
  questionCard(box, item, {
    kicker: `Question ${as.length + 1} of up to 12 · ${SKILL[item.skill].name}`,
    onAnswer: (correct) => {
      state.placement.push({ id: item.id, skill: item.skill, correct, t: Date.now() });
      const e = L.eap(asked());
      showEstimate(e, asked().length);
      drawPlacementChart();
      save();
    },
    onNext: () => {
      const e = L.eap(asked());
      if (L.placementDone(asked(), e.se)) finishPlacement(); else renderPlacement();
    },
  });
  showEstimate(est, as.length);
}
function showEstimate(e, n) {
  if (!n) { $('#pl-theta').textContent = '—'; $('#pl-line').textContent = 'Answer a question to start the estimate.'; return; }
  $('#pl-theta').textContent = `${e.theta >= 0 ? '+' : '−'}${F.num(Math.abs(e.theta), 2)}`;
  const pMid = L.p3pl(e.theta, { a: 1.2, b: 0, c: 0.2 }), pHard = L.p3pl(e.theta, { a: 1.2, b: 1.5, c: 0.2 });
  $('#pl-line').textContent = `± ${F.num(e.se, 2)} after ${n} answer${n > 1 ? 's' : ''}. At this level you’d answer a question of average difficulty right about ${F.pct(pMid, 0)} of the time, and one of the hardest here about ${F.pct(pHard, 0)}.`;
}
function finishPlacement() {
  state.placed = true;
  const as = asked();
  const e = L.eap(as);
  // individualised starting mastery for every skill not yet practised, then the evidence from the check itself
  SKILLS.forEach((sk) => {
    const st = state.skills[sk.id];
    if (state.responses.some((r) => r.skill === sk.id)) return;
    st.L = L.startMastery(e.theta);
    st.nCorrect = 0; st.nWrong = 0; st.last = 0;
    state.placement.filter((r) => r.skill === sk.id).forEach((r) => {
      st.L = L.bktUpdate(st.L, r.correct); if (r.correct) st.nCorrect++; else st.nWrong++; st.last = r.t;
    });
  });
  updateTheta();
  save();
  renderAll();
}
function placementSummary(box, e) {
  showEstimate(e, state.placement.length);
  const right = state.placement.filter((r) => r.correct).length;
  const strong = SKILLS.filter((sk) => state.skills[sk.id].L >= 0.6).map((sk) => sk.name);
  box.replaceChildren(h('div', { class: 'q-card' },
    h('p', { class: 'q-kicker' }, `Check complete · ${right} of ${state.placement.length} right`),
    h('p', { class: 'q-stem' }, `Your estimate is ${e.theta >= 0 ? '+' : '−'}${F.num(Math.abs(e.theta), 2)} ± ${F.num(e.se, 2)}.`),
    h('p', {}, strong.length ? `You start strongest in ${listWords(strong.slice(0, 3))}. Practice begins with the skills you’re least sure of.` : 'Practice begins with the skills you’re least sure of; every right answer moves a petal.'),
    h('div', { class: 'q-actions' },
      button('Start practising', () => { $('#practice').scrollIntoView({ block: 'start' }); $('#pr-quiz button, #pr-quiz input')?.focus({ preventScroll: true }); }, 'btn-primary'),
      button('Take the check again', () => { state.placement = []; state.placed = false; $('#pl-quiz').dataset.started = '1'; save(); renderAll(); }))));
}
function drawPlacementChart() {
  const as = asked();
  const box = $('#pl-chart');
  if (!as.length) { box.replaceChildren(h('p', { class: 'figure-sub' }, 'The line appears after your first answer.')); return; }
  const pts = as.map((_, i) => L.eap(as.slice(0, i + 1)));
  const xs = pts.map((_, i) => i + 1);
  lineChart(box, {
    xs, series: [{ name: 'Estimate', values: pts.map((p) => p.theta), cls: 'm-s2' }],
    band: { lo: pts.map((p) => p.theta - p.se), hi: pts.map((p) => p.theta + p.se), cls: 'm-s2', label: '± 1 standard error' },
    height: 220, xLabel: 'Answer', yDomain: [-3, 3], xTicks: xs, endLabels: false, xFormat: (v) => `${v}${as[v - 1] ? (as[v - 1].correct ? ' ✓' : ' ✗') : ''}`,
    yFormat: (v) => F.num(v, 1), label: 'Ability estimate after each answer of the placement check',
  });
}

// ---------------------------------------------------------------- practice
let current = null;
function renderPractice() {
  const box = $('#pr-quiz');
  renderPracticeStats();
  if (!state.placed) {
    box.replaceChildren(h('div', { class: 'q-card' }, h('p', {}, 'Take the short check above first so practice starts at your level, or begin from scratch.'),
      button('Start from scratch', () => { finishPlacement(); }, 'btn-primary')));
    $('#pr-why').replaceChildren();
    return;
  }
  const pick = L.nextPractice(state, ITEMS, SKILLS);
  if (pick.done) {
    const nx = pick.next;
    const when = nx ? Math.max(0, nx.h - nx.lag) : NaN;
    box.replaceChildren(h('div', { class: 'q-card' },
      h('p', { class: 'q-kicker' }, `All ${SKILLS.length} skills mastered`),
      h('p', { class: 'q-stem' }, 'Every petal is gold.'),
      h('p', {}, nx ? `Nothing is due yet. ${nx.skill.name} comes back first, in about ${durationWords(when)}.` : 'Come back later for reviews.')));
    return;
  }
  current = pick;
  const sk = pick.skill;
  const kicker = pick.reason === 'review'
    ? `Review · ${sk.name} · predicted recall now ${F.pct(pick.recall, 0)}`
    : `Building · ${sk.name} · ${F.pct(pick.mastery, 0)} mastered`;
  const before = state.skills[sk.id].L;
  questionCard(box, pick.item, {
    kicker,
    onAnswer: (correct) => {
      L.record(state, pick.item, correct);
      updateTheta(); save();
      const st = state.skills[sk.id];
      const hl = L.halfLife({ nCorrect: st.nCorrect, nWrong: st.nWrong, difficulty: sk.difficulty });
      $('#pr-why').replaceChildren(h('div', { class: 'mastery-change' },
        h('p', { class: 'figure-title' }, sk.name),
        meter(before, st.L),
        h('p', { class: 'hero-label' }, `Chance of mastery ${F.pct(before, 0)} → ${F.pct(st.L, 0)}${st.L >= L.BKT.mastered && before < L.BKT.mastered ? ': mastered.' : '.'} Next review in about ${durationWords(hl)}, when recall is predicted to fall to 50%.`)));
      renderPracticeStats(); renderGarden();
    },
    onNext: () => renderPractice(),
  });
  $('#pr-why').replaceChildren(h('p', { class: 'figure-sub' }, pick.reason === 'review'
    ? `Chosen because ${sk.name} is due for review: it has been about ${durationWords((Date.now() - state.skills[sk.id].last) / DAY)} since you last practised it.`
    : `Chosen because ${sk.name} is your least-mastered skill. The question is the one closest to your level that you’ve seen least recently.`));
}
function renderPracticeStats() {
  const now = Date.now();
  const mastered = SKILLS.filter((sk) => state.skills[sk.id].L >= L.BKT.mastered).length;
  const due = SKILLS.filter((sk) => { const st = state.skills[sk.id]; if (!st.last) return false; return L.recall((now - st.last) / DAY, L.halfLife({ nCorrect: st.nCorrect, nWrong: st.nWrong, difficulty: sk.difficulty })) <= 0.5; }).length;
  const all = [...state.placement, ...state.responses];
  $('#pr-mastered').textContent = `${mastered} of ${SKILLS.length}`;
  $('#pr-due').textContent = String(due);
  $('#pr-answered').textContent = F.int(all.length);
  $('#pr-right').textContent = all.length ? F.pct(all.filter((r) => r.correct).length / all.length, 0) : '—';
}
// ---------------------------------------------------------------- progress: one petal per skill
function skillRows() {
  const now = Date.now();
  return SKILLS.map((sk) => {
    const st = state.skills[sk.id];
    const hl = L.halfLife({ nCorrect: st.nCorrect, nWrong: st.nWrong, difficulty: sk.difficulty });
    const lag = st.last ? (now - st.last) / DAY : NaN;
    const rec = st.last ? L.recall(lag, hl) : NaN;
    return { sk, st, hl, rec, due: st.last ? rec <= 0.5 : false, nextIn: st.last ? Math.max(0, hl - lag) : NaN };
  });
}
function renderGarden() {
  const rows = skillRows();
  const W = 360, C = W / 2, inner = 46;
  const svg = s('svg', { viewBox: `0 0 ${W} ${W}`, class: 'garden', role: 'img', 'aria-label': `Progress flower: ${rows.filter((r) => r.st.L >= L.BKT.mastered).length} of ${rows.length} skills mastered` });
  rows.forEach((r, i) => {
    const ang = (i / rows.length) * 360 - 90, len = 34 + 92 * r.st.L, wid = (15 + 6 * r.st.L) * Math.min(1, Math.sqrt(12 / rows.length));
    const gold = r.st.L >= L.BKT.mastered;
    const g = s('g', { transform: `translate(${C} ${C}) rotate(${ang})` });
    g.append(s('title', {}, `${r.sk.name}: ${F.pct(r.st.L, 0)} mastered${r.due ? ', due for review' : ''}`));
    g.append(s('path', { d: `M${inner - 6},0 C${inner + len * 0.3},${-wid} ${inner + len * 0.85},${-wid * 0.7} ${inner + len},0 C${inner + len * 0.85},${wid * 0.7} ${inner + len * 0.3},${wid} ${inner - 6},0Z`, class: `petal${gold ? ' is-gold' : ''}`, style: `--m:${r.st.L.toFixed(3)}` }));
    if (r.due) g.append(s('circle', { cx: inner + len - 10, cy: 0, r: 5, class: 'petal-due' }));
    svg.append(g);
  });
  svg.append(s('circle', { cx: C, cy: C, r: inner, class: 'garden-disc' }));
  // seeds: one per answer so far, packed at the golden angle
  const n = Math.min(160, state.placement.length + state.responses.length);
  for (let k = 0; k < n; k++) { const rr = 4.6 * Math.sqrt(k + 0.5), th = k * 2.39996; if (rr > inner - 5) break; svg.append(s('circle', { cx: C + rr * Math.cos(th), cy: C + rr * Math.sin(th), r: 1.9, class: 'garden-seed' })); }
  $('#gd-flower').replaceChildren(svg, h('ul', { class: 'legend', role: 'list' },
    h('li', {}, h('i', { class: 'legend-key key-petal' }), 'Growing'), h('li', {}, h('i', { class: 'legend-key key-gold' }), 'Mastered (95%+)'), h('li', {}, h('i', { class: 'legend-key key-due' }), 'Due for review')));
  $('#gd-table').replaceChildren(h('table', { class: 'data-table' },
    h('caption', { class: 'visually-hidden' }, 'Mastery and review schedule by skill'),
    h('thead', {}, h('tr', {}, ['Skill', 'Lesson', 'Mastery', 'Recall now', 'Next review'].map((c, i) => h('th', { scope: 'col', class: i > 1 ? 'is-num' : '' }, c)))),
    h('tbody', {}, rows.map((r) => h('tr', { class: r.st.L >= L.BKT.mastered ? 'is-strong' : '' },
      h('th', { scope: 'row' }, h('a', { href: toolHref(r.sk, '../') }, r.sk.name)),
      h('td', {}, LESSON[r.sk.id] ? h('a', { href: lessonHref(r.sk.id, '../') }, state.read[r.sk.id] ? 'Read ✓' : `Read (${LESSON[r.sk.id].minutes} min)`) : '—'),
      h('td', { class: 'is-num' }, F.pct(r.st.L, 0)),
      h('td', { class: 'is-num' }, Number.isFinite(r.rec) ? F.pct(r.rec, 0) : 'not yet practised'),
      h('td', { class: 'is-num' }, !r.st.last ? '—' : r.due ? 'due now' : `in ${durationWords(r.nextIn)}`))))));
}

// ---------------------------------------------------------------- how it works
function renderEngine() {
  const v = (id) => +$(`#${id}`).value;
  const item = { a: v('en-a'), b: v('en-b'), c: v('en-c') };
  $('#en-a-out').textContent = F.num(item.a, 1); $('#en-b-out').textContent = F.num(item.b, 1); $('#en-c-out').textContent = F.num(item.c, 2);
  const xs = Array.from({ length: 81 }, (_, i) => -4 + i * 0.1);
  const box = $('#en-irt-chart'); box.replaceChildren();
  const top = h('div'), bottom = h('div'); box.append(top, bottom);
  lineChart(top, { xs, series: [{ name: 'Chance of a right answer', values: xs.map((t) => L.p3pl(t, item)), cls: 'm-s1' }], height: 180, yDomain: [0, 1], xLabel: 'Ability θ', highlightX: item.b, endLabels: false,
    xFormat: (t) => F.num(t, 1), yFormat: (p) => F.pct(p, 0), label: 'Item characteristic curve' });
  const info = xs.map((t) => L.info3pl(t, item)), peak = xs[info.indexOf(Math.max(...info))];
  lineChart(bottom, { xs, series: [{ name: 'Information', values: info, cls: 'm-s2' }], height: 160, xLabel: 'Ability θ', highlightX: peak, endLabels: false,
    xFormat: (t) => F.num(t, 1), yFormat: (p) => F.num(p, 2), label: `Item information, highest near θ = ${F.num(peak, 1)}` });
  // BKT trajectory
  const seq = engineSeq;
  const traj = [L.BKT.prior]; seq.forEach((c) => traj.push(L.bktUpdate(traj[traj.length - 1], c)));
  lineChart($('#en-bkt-chart'), { xs: traj.map((_, i) => i), series: [{ name: 'Chance of mastery', values: traj, cls: 'm-s1' }], height: 200, yDomain: [0, 1], endLabels: false,
    xLabel: 'Answers', xTicks: traj.map((_, i) => i), xFormat: (i) => (i === 0 ? 'start' : seq[i - 1] ? '✓' : '✗'), yFormat: (p) => F.pct(p, 0), label: 'Mastery after each answer' });
  // HLR forgetting curve
  const nc = v('en-nc'), nw = v('en-nw');
  $('#en-nc-out').textContent = String(nc); $('#en-nw-out').textContent = String(nw);
  const hl = L.halfLife({ nCorrect: nc, nWrong: nw });
  const span = Math.max(4, Math.ceil(hl * 3)), days = Array.from({ length: 61 }, (_, i) => (i * span) / 60);
  lineChart($('#en-hlr-chart'), { xs: days, series: [{ name: 'Chance of recall', values: days.map((d) => L.recall(d, hl)), cls: 'm-s2' }], height: 200, yDomain: [0, 1], highlightX: hl, endLabels: false,
    xLabel: 'Days since practice', xFormat: (d) => F.num(d, d < 10 ? 1 : 0), yFormat: (p) => F.pct(p, 0), label: `Forgetting curve with a half-life of ${F.num(hl, 1)} days` });
}
let engineSeq = [true, true, false, true];
$('#en-right').addEventListener('click', () => { engineSeq.push(true); if (engineSeq.length > 14) engineSeq.shift(); renderEngine(); });
$('#en-wrong').addEventListener('click', () => { engineSeq.push(false); if (engineSeq.length > 14) engineSeq.shift(); renderEngine(); });
$('#en-clear').addEventListener('click', () => { engineSeq = []; renderEngine(); });
$$('#engine input[type="range"]').forEach((el) => el.addEventListener('input', renderEngine));

// ---------------------------------------------------------------- helpers and wiring
$('#gd-export').addEventListener('click', () => {
  const rows = skillRows();
  download('learning-progress.csv', toCSV(['skill', 'room', 'mastery', 'right', 'wrong', 'last_practised', 'half_life_days', 'recall_now', 'next_review'],
    rows.map((r) => [r.sk.name, r.sk.room, r.st.L, r.st.nCorrect, r.st.nWrong, r.st.last ? new Date(r.st.last).toISOString() : '', r.hl, Number.isFinite(r.rec) ? r.rec : '', r.st.last ? new Date(r.st.last + r.hl * DAY).toISOString() : ''])));
});
let resetArmed = 0;
$('#gd-reset').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  if (Date.now() - resetArmed > 5000) { resetArmed = Date.now(); btn.textContent = 'Click again to erase progress'; $('#gd-reset-note').textContent = 'This clears your answers and mastery in this browser.'; setTimeout(() => { if (Date.now() - resetArmed >= 5000) { btn.textContent = 'Start again'; $('#gd-reset-note').textContent = ''; } }, 5100); return; }
  resetArmed = 0; btn.textContent = 'Start again';
  clearState();
  state = loadState(); delete $('#pl-quiz').dataset.started;
  $('#gd-reset-note').textContent = 'Progress cleared.';
  renderAll();
});

// ---------------------------------------------------------------- the lesson to read next
function renderLessonNext() {
  if (!LESSON_META.length) return;
  const nx = nextLesson(state, LESSON_META);
  const started = state.placed || Object.keys(state.read).length > 0;
  $('#ls-kicker').textContent = started ? 'Next lesson for you' : 'Start here';
  $('#ls-link').textContent = `Plate ${nx.plate}: ${nx.title}`;
  $('#ls-link').href = lessonHref(nx.id, '../');
  $('#ls-why').textContent = !started ? 'The first plate. Or take the check below, and this will point you to your weakest skill.'
    : `Your least-mastered skill among the lessons you haven’t read: ${F.pct(state.skills[nx.id].L, 0)} mastered. About ${nx.minutes} minutes.`;
}

function renderAll() { renderLessonNext(); renderPlacement(); renderPractice(); renderGarden(); }
renderAll();
renderEngine();
syncRanges();
onResize($('#en-irt-chart'), debounce(() => { renderEngine(); drawPlacementChart(); }, 150));
