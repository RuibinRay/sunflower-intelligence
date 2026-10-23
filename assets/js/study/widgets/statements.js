// statements.js — F01 widget: from the adjusted trial balance to the financial statements.
// config: { type: 'statements', transactions: ['m1', …, 'a7'] | [inline], build: ['income', 'equity', 'balance'] }
// The student places each account on its statement, works out net income, ending retained earnings and total
// assets (for the statements in `build`), checks, reads the feedback, then sees the statements in full.
import { h } from '../../core/dom.js?v=9';
import { verdict } from '../../core/ui.js?v=9';
import * as U from '../labs/accounting-ui.js?v=9';

const { A } = U;
const PLACES = [['income', 'Income statement'], ['equity', 'Statement of changes in equity'], ['balance', 'Balance sheet']];
const PLACE_NAME = Object.fromEntries(PLACES);

/** Where an account is reported. Common stock and retained earnings appear on two statements; either is right. */
function homes(a) {
  if (a.type === 'revenue' || a.type === 'expense') return ['income'];
  if (a.type === 'dividends') return ['equity'];
  if (a.type === 'equity') return ['balance', 'equity'];
  return ['balance'];
}
function why(a) {
  switch (a.type) {
    case 'revenue': return `${a.name} is revenue earned this period, so it is reported on the income statement.`;
    case 'expense': return `${a.name} is a cost of this period, so it is reported on the income statement.`;
    case 'dividends': return `Dividends are a distribution of profit, not an expense: they don’t reduce net income, they reduce retained earnings on the statement of changes in equity.`;
    case 'equity': return `${a.name} is part of equity: its balance is on the balance sheet, and its change during the period is shown on the statement of changes in equity.`;
    case 'contra-asset': return `${a.name} is a contra-asset account: it is reported on the balance sheet, subtracted from ${a.contra || 'its asset'}.`;
    case 'liability': return `${a.name} is a liability, owed at the end of the period, so it belongs on the balance sheet.`;
    default: return `${a.name} is an asset held at the end of the period, so it belongs on the balance sheet.`;
  }
}

export async function mount(el, config = {}, ctx = {}) {
  U.ensureStyles();
  let ch, txs;
  try {
    ch = A.makeChart(config.chart || U.CHART);
    txs = U.resolveTransactions(config.transactions);
    if (!txs.length) throw new Error('The statements need at least one transaction.');
  } catch (e) { U.errorBox(el, e.message); return; }
  const build = (Array.isArray(config.build) && config.build.length ? config.build : ['income', 'equity', 'balance']).filter((b) => ['income', 'equity', 'balance', 'cash'].includes(b));
  const opening = config.opening || {};
  const report = (ev, d) => { try { ctx.report?.(ev, d); } catch { /* the page may not listen */ } };
  const L = A.post(txs, ch, opening);
  const tb = A.trialBalance(L, ch);
  const is = A.incomeStatement(L, ch);
  const es = A.equityStatement(L, ch, opening);
  const bs = A.balanceSheet(L, ch);
  const period = U.monthOf(txs.find((t) => t.date)?.date);
  const adjusted = txs.some((t) => t.adjusting);
  const live = U.liveRegion();
  const root = h('div', { class: 'acc acc-stw' });
  el.replaceChildren(root, live);

  const totals = [
    build.includes('income') && { key: 'ni', label: 'Net income', want: is.netIncome },
    build.includes('equity') && { key: 're', label: 'Ending retained earnings', want: es.retainedEarnings.end },
    build.includes('balance') && { key: 'ta', label: 'Total assets', want: bs.assets.total },
  ].filter(Boolean);
  const totalHint = (key, v) => {
    const d = es.retainedEarnings, near = (x) => Math.round(x * 100) === Math.round(v * 100);
    const assetsGross = bs.assets.current.concat(bs.assets.noncurrent).filter((r) => r[1] > 0).reduce((s, r) => s + r[1], 0);
    if (key === 'ni') {
      if (near(is.netIncome - d.dividends)) return 'You subtracted the dividends. Dividends are not an expense: net income is revenue minus expenses only.';
      if (near(is.totalRevenue)) return 'That is total revenue. Subtract the expenses.';
      return `Net income = total revenue ${A.usd(is.totalRevenue)} − total expenses ${A.usd(is.totalExpenses)} = ${A.usd(is.netIncome)}.`;
    }
    if (key === 're') {
      if (near(d.begin + d.netIncome + d.dividends)) return 'Dividends reduce retained earnings: subtract them.';
      if (near(d.netIncome) && d.begin === 0 && d.dividends) return 'Start from net income, then subtract the dividends paid out of it.';
      return `Ending retained earnings = beginning ${A.usd(d.begin)} + net income ${A.usd(d.netIncome)} − dividends ${A.usd(d.dividends)} = ${A.usd(d.end)}.`;
    }
    if (near(assetsGross) && assetsGross !== bs.assets.total) return 'Accumulated depreciation is subtracted from the asset it belongs to: it is a contra-asset account with a credit balance.';
    if (near(tb.dr)) return 'That is the total of the debit column, which also includes expenses and dividends. Add only the asset accounts, less any contra-asset accounts.';
    return `Total assets = the asset balances less contra-asset accounts = ${A.usd(bs.assets.total)}.`;
  };

  function draw() {
    const rows = tb.rows.map((r) => ({ ...r, a: ch.byName[r.acct], id: U.uid('pl') }));
    const placeTable = h('table', { class: 'data-table acc-tb acc-place' },
      h('caption', {}, `${adjusted ? 'Adjusted trial balance' : 'Trial balance'}, ${U.dateLong(period.end)}`),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Account'), h('th', { scope: 'col', class: 'is-num' }, 'Debit'), h('th', { scope: 'col', class: 'is-num' }, 'Credit'), h('th', { scope: 'col' }, 'Reported on'))),
      h('tbody', {}, rows.map((r) => {
        const sel = h('select', { class: 'select acc-place-select', id: r.id, 'aria-label': `Statement for ${r.acct}` }, h('option', { value: '' }, 'Choose'), PLACES.map(([v, t]) => h('option', { value: v }, t)));
        return h('tr', { dataset: { acct: r.acct } }, h('th', { scope: 'row' }, r.acct), h('td', { class: 'is-num' }, r.dr ? U.amt(r.dr) : ''), h('td', { class: 'is-num' }, r.cr ? U.amt(r.cr) : ''), h('td', { class: 'acc-place-cell' }, sel));
      })),
      h('tfoot', {}, h('tr', { class: 'acc-tb-total' }, h('th', { scope: 'row' }, 'Total'), h('td', { class: 'is-num' }, A.usd(tb.dr)), h('td', { class: 'is-num' }, A.usd(tb.cr)), h('td'))));
    const totIds = Object.fromEntries(totals.map((t) => [t.key, U.uid('tot')]));
    const err = h('p', { class: 'error-text', role: 'alert' });
    const form = h('form', { class: 'acc-stw-form', novalidate: true },
      h('div', { class: 'acc-q' }, h('p', { class: 'acc-q-title' }, '1. Place each account on its statement'),
        h('p', { class: 'acc-hint' }, 'Some accounts appear on more than one statement; choose the one where their balance is reported.'),
        h('div', { class: 'table-scroll' }, placeTable)),
      totals.length ? h('fieldset', { class: 'acc-q' }, h('legend', { class: 'acc-q-title' }, '2. Work out the totals'),
        h('div', { class: 'acc-stw-totals' }, totals.map((t) => h('div', { class: 'acc-field acc-field-amt', dataset: { key: t.key } },
          h('label', { class: 'acc-mini', for: totIds[t.key] }, t.label),
          h('div', { class: 'affix' }, h('span', { class: 'affix-pre', 'aria-hidden': 'true' }, '$'), h('input', { class: 'input', id: totIds[t.key], type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false' })))))) : null,
      h('div', { class: 'acc-actions' }, h('button', { class: 'btn btn-primary', type: 'submit' }, 'Check')), err);
    const result = h('div', { class: 'acc-stw-result', tabindex: '-1' });
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const empty = rows.filter((r) => !form.querySelector(`#${r.id}`).value);
      const blankTot = totals.filter((t) => { const v = U.parseAmount(form.querySelector(`#${totIds[t.key]}`).value); return v == null || Number.isNaN(v); });
      if (empty.length || blankTot.length) {
        err.textContent = `Answer every part first: ${[empty.length ? `${empty.length} account${empty.length > 1 ? 's' : ''} still to place` : '', blankTot.length ? `${blankTot.map((t) => t.label.toLowerCase()).join(' and ')} to work out` : ''].filter(Boolean).join('; ')}.`;
        (empty.length ? form.querySelector(`#${empty[0].id}`) : form.querySelector(`#${totIds[blankTot[0].key]}`)).focus();
        return;
      }
      err.textContent = '';
      let right = 0;
      const wrongNotes = [];
      for (const r of rows) {
        const sel = form.querySelector(`#${r.id}`);
        const ok = homes(r.a).includes(sel.value);
        if (ok) right++; else wrongNotes.push(h('li', {}, h('strong', {}, `${r.acct}: `), `${PLACE_NAME[homes(r.a)[0]]}. ${why(r.a)}`));
        const cell = sel.closest('td');
        cell.classList.add(ok ? 'is-right' : 'is-wrong');
        cell.append(h('span', { class: `acc-mark ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { 'aria-hidden': 'true' }, ok ? '✓' : '✗'), h('span', { class: 'visually-hidden' }, ok ? 'Right.' : 'Not right.')));
      }
      const totNotes = [];
      let totRight = 0;
      for (const t of totals) {
        const inp = form.querySelector(`#${totIds[t.key]}`);
        const v = U.parseAmount(inp.value);
        const ok = Math.round(v * 100) === Math.round(t.want * 100);
        if (ok) totRight++; else totNotes.push(h('li', {}, h('strong', {}, `${t.label}: `), totalHint(t.key, v)));
        const f = inp.closest('.acc-field');
        f.classList.add(ok ? 'is-right' : 'is-wrong');
        f.append(h('span', { class: `acc-mark ${ok ? 'is-right' : 'is-wrong'}` }, h('span', { 'aria-hidden': 'true' }, ok ? '✓' : '✗'), h('span', { class: 'visually-hidden' }, ok ? 'Right.' : 'Not right.')));
      }
      form.querySelectorAll('select, input, button[type="submit"]').forEach((x) => { x.disabled = true; });
      form.querySelector('.acc-actions').remove();
      const all = right === rows.length && totRight === totals.length;
      const again = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Start again');
      again.addEventListener('click', () => { draw(); root.querySelector('select')?.focus(); });
      U.fill(result,
        verdict(all ? 'good' : 'warn', all ? 'All right.' : `${right} of ${rows.length} accounts placed, ${totRight} of ${totals.length} totals right.`, all ? 'Every account is on its statement and every total matches.' : 'Here is what to change:'),
        wrongNotes.length || totNotes.length ? h('ul', { class: 'acc-issues' }, ...wrongNotes, ...totNotes) : null,
        h('p', { class: 'acc-answer-title' }, 'The statements'),
        U.statementsBlock(txs, { chart: ch, opening, period, build }),
        h('div', { class: 'acc-actions' }, again));
      result.focus();
      U.say(live, all ? 'All right.' : `${right} of ${rows.length} accounts placed correctly; ${totRight} of ${totals.length} totals right.`);
      report('done', { correct: right + totRight, total: rows.length + totals.length });
    });
    root.replaceChildren(form, result);
  }
  draw();
}
