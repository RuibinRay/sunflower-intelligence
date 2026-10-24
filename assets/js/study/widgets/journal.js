// journal.js — F01 widget: the transaction-analysis drill (the core of the Accounting Lab, cut to a lesson's size).
// config: { type: 'journal', transactions: ['m1', …] | [inline], ask: ['accounts', 'direction', 'side', 'amount', 'equation', 'statements'] }
// `ask` chooses the questions (default: all). When 'accounts' is left out, the accounts are given in chart order.
import * as U from '../labs/accounting-ui.js?v=12';

export async function mount(el, config = {}, ctx = {}) {
  U.ensureStyles();
  let txs;
  try {
    txs = U.resolveTransactions(config.transactions);
    if (!txs.length) throw new Error('The drill needs at least one transaction.');
    U.A.makeChart(config.chart || U.CHART);
  } catch (e) { U.errorBox(el, e.message); return; }
  const unknown = (config.ask || []).filter((k) => !U.ASK_ALL.includes(k));
  if (unknown.length) console.warn(`journal widget: unknown ask ${unknown.join(', ')}`);
  U.mountDrill(el, {
    transactions: txs,
    chart: config.chart || U.CHART,
    ask: config.ask,
    onDone: (r) => { try { ctx.report?.('done', r); } catch { /* the page may not listen */ } },
  });
}
