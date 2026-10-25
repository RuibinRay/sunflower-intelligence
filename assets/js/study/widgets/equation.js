// equation.js — F01 widget: the accounting equation explorer.
// config: { type: 'equation', transactions: ['m1', …] | [inline], mode: 'watch' | 'predict', opening?: { acct: balance } }
// Watch mode steps through the transactions; predict mode asks for the change in assets, liabilities and equity
// before each one is revealed. The balances, the totals and the bars always come from the engine and always balance.
import { h } from '../../core/dom.js?v=13';
import { verdict } from '../../core/ui.js?v=13';
import * as U from '../labs/accounting-ui.js?v=13';

const { A } = U;
const ELEMENTS = [['assets', 'Assets'], ['liabilities', 'Liabilities'], ['equity', 'Equity']];
const fmt = (v) => (Math.round(v * 100) < 0 ? `−${U.amt(v)}` : U.amt(v));

export async function mount(el, config = {}, ctx = {}) {
  U.ensureStyles();
  let ch, txs;
  try {
    ch = A.makeChart(config.chart || U.CHART);
    txs = U.resolveTransactions(config.transactions);
    if (!txs.length) throw new Error('The widget needs at least one transaction.');
  } catch (e) { U.errorBox(el, e.message); return; }
  const predict = config.mode === 'predict';
  const opening = config.opening || {};
  const report = (ev, d) => { try { ctx.report?.(ev, d); } catch { /* the page may not listen */ } };

  // balances after each step: ledgers[0] is before any transaction
  const ledgers = [A.post([], ch, opening)];
  txs.forEach((_, k) => ledgers.push(A.post(txs.slice(0, k + 1), ch, opening)));
  const bal = (L, n) => L[n]?.balance || 0;
  const used = new Set([...txs.flatMap((t) => t.lines.map((l) => l.acct)), ...Object.keys(opening)]);
  const sum = (L, names) => names.reduce((s, n) => s + bal(L, n), 0);
  const names = (pred) => ch.list.filter((a) => pred(a) && used.has(a.name)).map((a) => a.name);
  // the rows of each column: assets and liabilities by account; equity by its four kinds of change
  const rows = {
    assets: ch.list.filter((a) => a.element === 'assets' && used.has(a.name)).map((a) => ({ label: a.name, accts: [a.name], value: (L) => a.sign * bal(L, a.name) })),
    liabilities: ch.list.filter((a) => a.element === 'liabilities' && used.has(a.name)).map((a) => ({ label: a.name, accts: [a.name], value: (L) => bal(L, a.name) })),
    equity: [
      ...ch.list.filter((a) => a.type === 'equity' && used.has(a.name)).map((a) => ({ label: a.name, accts: [a.name], value: (L) => bal(L, a.name) })),
      ...[['Revenue', 'revenue', 1], ['Returns and discounts', 'contra-revenue', -1], ['Expenses', 'expense', -1], ['Dividends', 'dividends', -1]]
        .map(([label, type, sign]) => ({ label, accts: names((a) => a.type === type), value: (L) => sign * sum(L, names((a) => a.type === type)) }))
        .filter((r) => r.accts.length),
    ],
  };
  const totals = (L) => A.equationTotals(L, ch);
  const scale = Math.max(...ledgers.map((L) => totals(L).assets), 1) * 1.04;

  let step = 0;                  // balances shown are ledgers[step]
  let revealed = !predict;       // predict: has the current transaction been revealed?
  let score = 0;
  let lastForm = null;           // predict: the form for the current transaction, kept with its feedback
  const live = U.liveRegion();
  const root = h('div', { class: 'acc acc-eqw' });
  el.replaceChildren(root, live);
  const eqbar = U.equationBar();

  function board(k, changed) {
    const L = ledgers[k];
    const tot = totals(L);
    const col = (key, label) => {
      const headId = U.uid('eqc');
      const list = rows[key];
      return h('section', { class: `acc-eqw-col is-${key[0]}`, 'aria-labelledby': headId },
        h('h4', { class: 'acc-eqw-head', id: headId }, h('span', {}, label), ' ', h('strong', { class: 'num' }, A.usd(tot[key]))),
        list.length ? h('table', { class: 'acc-eqw-table' },
          h('caption', { class: 'visually-hidden' }, `${label} ${k ? `after transaction ${k}` : 'before the first transaction'}`),
          h('thead', { class: 'visually-hidden' }, h('tr', {}, h('th', { scope: 'col' }, 'Item'), h('th', { scope: 'col' }, 'Balance ($)'))),
          h('tbody', {}, list.map((r) => {
            const now = r.value(L), before = k ? r.value(ledgers[k - 1]) : now;
            const d = changed ? now - before : 0;
            const hit = Math.round(d * 100) !== 0;
            return h('tr', { class: hit ? 'is-changed' : null },
              h('th', { scope: 'row' }, r.label),
              h('td', { class: 'is-num' }, h('span', { class: 'acc-eqw-val' }, fmt(now)),
                hit ? h('span', { class: `acc-delta ${d > 0 ? 'is-up' : 'is-down'}` }, h('span', { 'aria-hidden': 'true' }, d > 0 ? '▲ ' : '▼ '), h('span', { class: 'visually-hidden' }, d > 0 ? 'up ' : 'down '), U.signed(d).replace('$', '')) : null));
          }))) : h('p', { class: 'acc-empty' }, 'None yet'));
    };
    return h('div', { class: 'acc-eqw-board' },
      col('assets', 'Assets'), h('div', { class: 'acc-eqw-op', 'aria-hidden': 'true' }, '='),
      col('liabilities', 'Liabilities'), h('div', { class: 'acc-eqw-op', 'aria-hidden': 'true' }, '+'),
      col('equity', 'Equity'));
  }

  function changeLine(t) {
    const fx = A.entryEffects(t, ch);
    return h('div', { class: 'acc-eqw-change' },
      h('p', { class: 'acc-eqline num' }, U.equationLine(A.equationEffect(t, ch))),
      h('ul', { class: 'acc-eqw-fx' }, fx.map((e) => h('li', {}, h('span', { 'aria-hidden': 'true' }, e.direction === 'increase' ? '▲ ' : '▼ '), `${e.acct} ${e.direction === 'increase' ? 'up' : 'down'} ${A.usd(e.amount)}`, h('span', { class: 'acc-eqw-fx-type' }, ` (${A.typeNoun(e.type).replace(/^(an?|the) /, '')})`)))));
  }

  function announce(k) {
    const t = txs[k - 1], q = totals(ledgers[k]);
    const fx = A.entryEffects(t, ch).map((e) => `${e.acct} ${e.direction === 'increase' ? 'up' : 'down'} ${A.usd(e.amount)}`).join(', ');
    U.say(live, `Transaction ${k}: ${fx}. Assets ${A.usd(q.assets)} equal liabilities ${A.usd(q.liabilities)} plus equity ${A.usd(q.equity)}.`);
  }

  function predictForm(t) {
    const ids = Object.fromEntries(ELEMENTS.map(([k]) => [k, U.uid('pe')]));
    const err = h('p', { class: 'error-text', role: 'alert' });
    const form = h('form', { class: 'acc-eqw-predict', novalidate: true },
      h('fieldset', { class: 'acc-q acc-q-eq' },
        h('legend', { class: 'acc-q-title' }, 'Predict the change in each total'),
        h('p', { class: 'acc-hint' }, 'In dollars. Use a minus sign for a decrease and 0 for no change.'),
        h('div', { class: 'acc-eq-inputs' }, ELEMENTS.flatMap(([k, label], j) => [
          j ? h('span', { class: 'acc-eq-op', 'aria-hidden': 'true' }, j === 1 ? '=' : '+') : null,
          h('div', { class: 'acc-eq-in' }, h('label', { class: 'acc-mini', for: ids[k] }, label),
            h('input', { class: 'input', id: ids[k], type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Change in ${k}, in dollars` }))]).filter(Boolean)),
        h('div', { class: 'acc-q-fb' })),
      h('div', { class: 'acc-actions' }, h('button', { class: 'btn btn-primary', type: 'submit' }, 'Check and reveal')), err);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const got = {};
      for (const [k] of ELEMENTS) {
        const v = U.parseAmount(form.querySelector(`#${ids[k]}`).value);
        if (v == null || Number.isNaN(v)) { err.textContent = `Enter a number for the change in ${k} (0 if it doesn’t change).`; form.querySelector(`#${ids[k]}`).focus(); return; }
        got[k] = v;
      }
      const q = A.equationEffect(t, ch);
      const notes = [];
      let right = 0;
      for (const [k, label] of ELEMENTS) {
        const ok = Math.round(got[k] * 100) === Math.round(q[k] * 100);
        if (ok) right++;
        const box = form.querySelector(`#${ids[k]}`).closest('.acc-eq-in');
        box.classList.add(ok ? 'is-right' : 'is-wrong');
        box.append(h('span', { class: `acc-mark ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { 'aria-hidden': 'true' }, ok ? '✓' : '✗'), h('span', { class: 'visually-hidden' }, ok ? 'Right.' : 'Not right.')));
        if (!ok) {
          const parts = A.entryEffects(t, ch).filter((e) => e.element === k).map((e) => `${e.acct} ${U.signed(e.change)}`);
          const one = k === 'equity';
          notes.push(h('p', {}, parts.length
            ? `${label} ${one ? 'changes' : 'change'} by ${U.signed(q[k])}: ${parts.join(', ')}.`
            : `${label} ${one ? 'doesn’t' : 'don’t'} change: no ${k === 'equity' ? 'revenue, expense, dividend or stock' : k === 'assets' ? 'asset' : 'liability'} is involved.`));
        }
      }
      if (Math.round(got.assets * 100) !== Math.round((got.liabilities + got.equity) * 100)) notes.push(h('p', {}, `Your prediction doesn’t balance: assets ${U.signed(got.assets)}, but liabilities plus equity come to ${U.signed(got.liabilities + got.equity)}. The change in assets always equals the change in liabilities plus the change in equity.`));
      const perfect = right === 3;
      if (perfect) score++;
      form.querySelectorAll('input, button').forEach((x) => { x.disabled = true; });
      form.querySelector('.acc-actions').remove();
      form.querySelector('.acc-q-fb').replaceChildren(verdict(perfect ? 'good' : 'bad', perfect ? 'Right.' : 'Not quite.', perfect ? 'All three changes match.' : 'Here is what happens:'), ...notes);
      revealed = true;
      step += 1;
      draw({ focus: 'next' });
      announce(step);
    });
    return form;
  }

  function summary() {
    report('done', { correct: score, total: txs.length });
    const again = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Start again');
    again.addEventListener('click', () => { step = 0; score = 0; revealed = false; draw({ focus: 'slip' }); });
    return h('div', { class: 'acc-eqw-summary', tabindex: '-1' },
      verdict(score === txs.length ? 'good' : score >= txs.length / 2 ? 'warn' : 'bad', `${score} of ${txs.length} predicted exactly.`, score === txs.length ? 'You traced every transaction through the equation.' : 'Look back at the transactions you missed: name each account, say whether it is an asset, a liability or part of equity, then add up.'),
      h('div', { class: 'acc-actions' }, again));
  }

  function draw({ focus = null } = {}) {
    const k = step;
    const atEnd = k >= txs.length;
    // which transaction the slip shows: the one just applied (watch), or the one to predict
    const tIndex = predict ? (revealed ? k - 1 : k) : k - 1;
    const t = tIndex >= 0 && tIndex < txs.length ? txs[tIndex] : null;
    const slip = h('div', { class: 'acc-slip', tabindex: '-1' },
      h('p', { class: 'acc-kicker' }, t ? `Transaction ${tIndex + 1} of ${txs.length}${t.date ? ` · ${U.dateLong(t.date)}` : ''}${t.adjusting ? ' · Month-end adjustment' : ''}` : 'Before the first transaction'),
      h('p', { class: 'acc-tx-text' }, t ? t.text : (Object.keys(opening).length ? 'These are the balances the period starts with.' : 'Nothing has happened yet, so every balance is zero.')));
    const showChanges = !!t && (revealed || !predict);
    eqbar.update(totals(ledgers[k]), { scale });
    // controls
    const controls = h('div', { class: 'acc-actions acc-eqw-controls' });
    if (!predict) {
      const prev = h('button', { class: 'btn btn-secondary', type: 'button', disabled: k === 0 }, '‹ Previous');
      const next = h('button', { class: 'btn btn-primary', type: 'button', disabled: atEnd }, k === 0 ? 'Start: transaction 1 ›' : 'Next ›');
      const reset = h('button', { class: 'btn btn-ghost', type: 'button', disabled: k === 0 }, 'Reset');
      prev.addEventListener('click', () => { step = Math.max(0, step - 1); draw({ focus: step === 0 ? 'next' : 'prev' }); if (step) announce(step); else U.say(live, 'Before the first transaction. Every balance is zero.'); });
      next.addEventListener('click', () => { step = Math.min(txs.length, step + 1); draw({ focus: step >= txs.length ? 'prev' : 'next' }); announce(step); });
      reset.addEventListener('click', () => { step = 0; draw({ focus: 'next' }); U.say(live, 'Back to the start.'); });
      controls.append(prev, next, reset, h('span', { class: 'acc-eqw-count', 'aria-hidden': 'true' }, `${k} of ${txs.length}`));
      if (atEnd) report('done', { viewed: txs.length });
    } else if (revealed) {
      const next = h('button', { class: 'btn btn-primary', type: 'button' }, atEnd ? 'See how you did' : 'Next transaction ›');
      next.addEventListener('click', () => { revealed = false; lastForm = null; if (atEnd) { root.replaceChildren(summary()); root.firstChild.focus(); U.say(live, `${score} of ${txs.length} predicted exactly.`); } else draw({ focus: 'slip' }); });
      controls.append(next, h('span', { class: 'acc-eqw-count', 'aria-hidden': 'true' }, `${k} of ${txs.length} done · ${score} exact`));
    }
    const parts = [slip];
    if (predict) {
      if (!revealed && t) { lastForm = predictForm(t); parts.push(lastForm); }
      else if (revealed && lastForm) parts.push(lastForm);
    }
    if (!predict) parts.push(controls);
    if (showChanges) parts.push(changeLine(t));
    parts.push(board(k, showChanges), eqbar.el);
    if (predict && revealed) parts.push(controls);
    root.replaceChildren(...parts);
    if (focus === 'slip') slip.focus();
    else if (focus === 'next') (root.querySelector('.acc-eqw-controls .btn-primary:not([disabled])') || slip).focus();
    else if (focus === 'prev') root.querySelector('.acc-eqw-controls .btn-secondary:not([disabled])')?.focus();
  }
  draw();
}
