// lab-accounting.js — the Accounting Lab page: the transaction-analysis drill, record and post, then the statements
// and closing, all on Lantern Coffee Co. (fictional). The choices made and the entries recorded are kept in this
// browser under 'si:lab-accounting' so a refresh doesn't lose a half-recorded month.
import { initSite } from '../core/site.js?v=22';
import { $, h, store } from '../core/dom.js?v=22';
import * as U from '../study/labs/accounting-ui.js?v=22';
import { scrollersFocusable } from '../study/common.js?v=22';

initSite();
const { A, CHART, MARCH, MARCH_ADJUSTMENTS } = U;
const KEY = 'si:lab-accounting';
const LEVELS = [[1, 'Level 1: cash and stock'], [2, 'Level 2: on account'], [3, 'Level 3: prepayments, accruals, notes'], [4, 'Level 4: compound and adjusting']];
const ADJ = MARCH_ADJUSTMENTS.map((a) => ({ ...a, date: a.date || '2026-03-31', adjusting: true }));
const newSeed = () => 1 + Math.floor(Math.random() * 999983);

// ---------------------------------------------------------------- remembered choices and progress
function loadState() {
  const s = store.get(KEY, null);
  const ok = s && s.v === 1 && typeof s === 'object';
  const lvl = (v) => (Number.isInteger(v) && v >= 1 && v <= 4 ? v : 1);
  const seed = (v) => (Number.isInteger(v) && v > 0 ? v : newSeed());
  return {
    v: 1,
    drill: { set: ['march', 'adjust', 'practice'].includes(s?.drill?.set) ? s.drill.set : 'march', level: lvl(s?.drill?.level), seed: seed(s?.drill?.seed) },
    rec: { set: ['march', 'practice'].includes(s?.rec?.set) ? s.rec.set : 'march', level: lvl(ok ? s.rec?.level : 2) || 2, seed: seed(s?.rec?.seed), progress: ok && s.rec?.progress && typeof s.rec.progress === 'object' ? s.rec.progress : {} },
    statements: { source: s?.statements?.source === 'key' ? 'key' : 'mine', method: s?.statements?.method === 'direct' ? 'direct' : 'summary' },
  };
}
const state = loadState();
const persist = () => store.set(KEY, state);

/** A segmented radio group. */
function segmented(label, options, value, onChange) {
  const name = U.uid('seg');
  return h('div', { class: 'field' }, h('span', { class: 'field-label', id: `${name}-l` }, label),
    h('div', { class: 'segmented', role: 'radiogroup', 'aria-labelledby': `${name}-l` }, options.flatMap(([v, t]) => {
      const id = U.uid('o');
      const inp = h('input', { type: 'radio', name, id, value: v });
      inp.checked = v === value;
      inp.addEventListener('change', () => { if (inp.checked) onChange(v); });
      return [inp, h('label', { for: id }, t)];
    })));
}
function levelSelect(value, onChange) {
  const id = U.uid('lvl');
  const sel = h('select', { class: 'select', id }, LEVELS.map(([v, t]) => h('option', { value: String(v) }, t)));
  sel.value = String(value);
  sel.addEventListener('change', () => onChange(+sel.value));
  return h('div', { class: 'field' }, h('label', { for: id }, 'Practice level'), sel);
}
function button(text, onClick, cls = 'btn-secondary') { const b = h('button', { class: `btn ${cls}`, type: 'button' }, text); b.addEventListener('click', onClick); return b; }

// ---------------------------------------------------------------- 1. analyse a transaction
const drillMount = $('#drill-mount');
function drillSet() {
  const d = state.drill;
  if (d.set === 'adjust') return ADJ;
  if (d.set === 'practice') return A.generateTransactions(d.seed, { level: d.level, count: 8, opening: U.marchClosingBalances(), start: '2026-04-01' });
  return MARCH;
}
function renderDrill(focusBody = false) {
  const d = state.drill;
  const body = h('div', { class: 'acc-mount' });
  const fresh = () => { d.seed = newSeed(); persist(); renderDrill(true); };
  const bar = h('div', { class: 'acc-lab-bar' },
    segmented('Transactions', [['march', 'Lantern’s March'], ['adjust', 'Month-end adjustments'], ['practice', 'Practice set']], d.set, (v) => { d.set = v; persist(); renderDrill(); drillMount.querySelector(`input[value="${v}"]`)?.focus(); }),
    d.set === 'practice' ? levelSelect(d.level, (v) => { d.level = v; d.seed = newSeed(); persist(); renderDrill(); drillMount.querySelector('select')?.focus(); }) : null,
    d.set === 'practice' ? button('New set', fresh) : null);
  drillMount.replaceChildren(bar, body);
  U.mountDrill(body, { transactions: drillSet(), actions: d.set === 'practice' ? [button('Try a new set', fresh, 'btn-primary')] : [] });
  if (focusBody) { const slip = body.querySelector('.acc-slip'); slip?.setAttribute('tabindex', '-1'); slip?.focus(); }
}
renderDrill();

// ---------------------------------------------------------------- 2. record and post
const recMount = $('#record-mount');
let recorder = null;
const recKey = () => (state.rec.set === 'march' ? 'march' : `practice:${state.rec.level}:${state.rec.seed}`);
function recScenario() {
  const r = state.rec;
  if (r.set === 'march') return { name: 'Lantern Coffee Co.', chart: CHART, transactions: MARCH, adjustments: MARCH_ADJUSTMENTS.map((a) => ({ ...a, date: '2026-03-31' })) };
  const opening = U.marchClosingBalances();
  return { name: 'Lantern Coffee Co.', chart: CHART, transactions: A.generateTransactions(r.seed, { level: r.level, count: 10, opening, start: '2026-04-01' }), opening };
}
function renderRecorder() {
  const r = state.rec;
  const body = h('div', { class: 'acc-mount' });
  const bar = h('div', { class: 'acc-lab-bar' },
    segmented('Month to record', [['march', 'Lantern’s March, then its adjustments'], ['practice', 'A practice April']], r.set, (v) => { r.set = v; persist(); renderRecorder(); recMount.querySelector(`input[value="${v}"]`)?.focus(); renderStatements(); }),
    r.set === 'practice' ? levelSelect(r.level, (v) => { r.level = v; r.seed = newSeed(); persist(); renderRecorder(); renderStatements(); recMount.querySelector('select')?.focus(); }) : null,
    r.set === 'practice' ? button('New month', () => { delete r.progress[recKey()]; r.seed = newSeed(); persist(); renderRecorder(); renderStatements(); recMount.querySelector('.acc-work-title')?.focus(); }) : null,
    r.set === 'practice' ? h('p', { class: 'acc-note' }, 'April starts from Lantern’s balances after March is closed: the opening balances are already in the ledger.') : null);
  recMount.replaceChildren(bar, body);
  const key = recKey();
  recorder = null;
  recorder = U.mountRecorder(body, recScenario(), {
    store: {
      load: () => r.progress[key] || null,
      save: (p) => {
        // keep March and the current practice month only
        for (const k of Object.keys(r.progress)) if (k !== 'march' && k !== key) delete r.progress[k];
        r.progress[key] = p; persist();
      },
    },
    onChange: () => renderStatements(),
  });
}

// ---------------------------------------------------------------- 3. statements and closing
const stMount = $('#statements-mount');
function keyEntries() {
  const sc = recScenario();
  return [...sc.transactions, ...(sc.adjustments || [])];
}
function renderStatements() {
  if (!stMount || !recorder) return;
  const s = state.statements;
  const sc = recScenario();
  const all = keyEntries();
  const mine = recorder.entries();
  const useKey = s.source === 'key';
  const entries = useKey ? all : mine;
  const opening = sc.opening || {};
  const period = U.monthOf(all[0]?.date);
  const complete = useKey || mine.length === all.length;
  const monthName = period.name;
  const head = h('div', { class: 'acc-statements-head' },
    segmented('Build the statements from', [['mine', 'Your recorded entries'], ['key', 'The answer key']], s.source, (v) => { s.source = v; persist(); renderStatements(); stMount.querySelector(`input[value="${v}"]`)?.focus(); }));
  let note;
  if (useKey) note = `Built from the answer key: all ${all.length} entries for ${monthName}.`;
  else if (!mine.length) note = null;
  else if (complete) note = `Built from your ${mine.length} recorded entries: the whole of ${monthName}.`;
  else {
    const adjusting = all.some((t) => t.adjusting);
    const adjDone = mine.some((t) => t.adjusting);
    note = `Built from the ${mine.length} of ${all.length} entries you have recorded so far, so these statements are incomplete${adjusting && !adjDone ? ' and unadjusted' : ''}. Record the rest above, or switch to the answer key.`;
  }
  const parts = [head];
  if (!entries.length) {
    parts.push(h('p', { class: 'acc-empty' }, 'Nothing recorded yet. Record some transactions above, or switch to the answer key to see the finished statements.'));
    stMount.replaceChildren(h('div', { class: 'acc' }, ...parts));
    return;
  }
  parts.push(h('p', { class: 'acc-note acc-stage-note', role: 'status' }, note || ''));
  parts.push(U.statementsBlock(entries, { chart: CHART, opening, business: sc.name, period }));
  const closing = h('div', { class: 'acc-section-sub' }, h('h3', {}, 'Closing the books'),
    h('p', {}, 'Choose how to close. Both methods leave the same balances; Income Summary shows net income on its way to retained earnings.'));
  const closeBody = h('div');
  closing.append(closeBody);
  if (complete) U.mountClosing(closeBody, { entries, chart: CHART, opening, date: period.end, method: s.method, onMethod: (m) => { s.method = m; persist(); } });
  else closeBody.append(h('p', { class: 'acc-empty' }, `Close the books once every transaction and adjustment for ${monthName} is recorded, or switch to the answer key.`));
  parts.push(closing);
  stMount.replaceChildren(h('div', { class: 'acc' }, ...parts.filter(Boolean)));
}

renderRecorder();
renderStatements();

scrollersFocusable();   // tables and charts that scroll sideways get a tab stop (WCAG 2.1.1)
