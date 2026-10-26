// ratios.js — the `ratios` lesson widget (F03): financial ratios for one company over two or more periods, with
// optional peers, worked out by core/ratios.js. Pick a ratio to see its formula with that period's numbers; switch
// the conventions an analyst must choose (average or closing balances, leases as debt, part-year flows annualised,
// receivables days on credit sales) and apply the adjustments the lesson sets, and every figure updates.
//   { type: 'ratios', title,
//     periods: [{ label: '2026 (10 months)', data: PERIODS[2026] }, { label: '2027', data: PERIODS[2027] }],
//     peers: [{ label, data, note? }],                        optional; a peer's prior period may be given as `prev`
//     ratios: ['current', 'quick', 'roe', …] or groups: ['liquidity', 'dupont', …],
//     toggles: ['average', 'leases', 'annualise', 'creditSales'], defaults: { average: true, … },
//     adjust: [{ id, label, period: 1, delta: { revenue: -30840, … }, note }],
//     select: 'roe', note }
// A period's `data` uses core/ratios.js's fields; each period after the first uses the one before it for averages.
import { h } from '../../core/dom.js?v=18';
import { xl } from '../xl.js?v=18';
import * as R from '../../core/ratios.js?v=18';

const minus = (t) => t.replace(/^-/, '−');
const n0 = (v) => minus(Math.round(v).toLocaleString('en-US'));
const FMT = {
  x: (v) => minus(v.toFixed(2)),
  pct: (v) => `${minus((v * 100).toFixed(1))}%`,
  days: (v) => minus(v.toFixed(1)),
  usd: (v) => (v < 0 ? `−$${n0(-v)}` : `$${n0(v)}`),
  z: (v) => minus(v.toFixed(2)),
};

/** The ratio catalogue: label, group, format, how it is computed and what to show as its working. */
export const RATIOS = {
  workingCapital: { group: 'liquidity', label: 'Working capital', fmt: 'usd', f: (c) => c.L.workingCapital, how: (c) => `current assets − current liabilities = ${FMT.usd(c.p.currentAssets)} − ${FMT.usd(c.p.currentLiabilities)}` },
  current: { group: 'liquidity', label: 'Current ratio', fmt: 'x', f: (c) => c.L.current, how: (c) => `current assets ÷ current liabilities = ${n0(c.p.currentAssets)} ÷ ${n0(c.p.currentLiabilities)}` },
  quick: { group: 'liquidity', label: 'Quick ratio', fmt: 'x', f: (c) => c.L.quick, how: (c) => `(cash + short-term investments + receivables) ÷ current liabilities = (${n0(c.p.cash)} + ${n0(c.p.shortTermInvestments || 0)} + ${n0(c.p.receivables)}) ÷ ${n0(c.p.currentLiabilities)}` },
  cash: { group: 'liquidity', label: 'Cash ratio', fmt: 'x', f: (c) => c.L.cash, how: (c) => `(cash + short-term investments) ÷ current liabilities = (${n0(c.p.cash)} + ${n0(c.p.shortTermInvestments || 0)}) ÷ ${n0(c.p.currentLiabilities)}` },
  operatingCashFlow: { group: 'liquidity', label: 'Operating cash flow ratio', fmt: 'x', f: (c) => c.L.operatingCashFlow, how: (c) => `cash from operations ÷ current liabilities = ${n0(c.p.cfo)} ÷ ${n0(c.p.currentLiabilities)}` },
  debtRatio: { group: 'solvency', label: 'Debt ratio (liabilities ÷ assets)', fmt: 'pct', f: (c) => c.S.debtRatio, how: (c) => `total liabilities ÷ total assets = ${n0(c.p.totalLiabilities)} ÷ ${n0(c.p.totalAssets)}` },
  liabilitiesToEquity: { group: 'solvency', label: 'Liabilities to equity', fmt: 'x', f: (c) => c.S.liabilitiesToEquity, how: (c) => `total liabilities ÷ equity = ${n0(c.p.totalLiabilities)} ÷ ${n0(c.p.equity)}` },
  debtToEquity: { group: 'solvency', label: 'Debt to equity', fmt: 'x', f: (c) => c.S.debtToEquity, how: (c) => `${c.o.leases ? '(interest-bearing debt + lease liabilities)' : 'interest-bearing debt'} ÷ equity = ${n0(c.S.debt)} ÷ ${n0(c.p.equity)}` },
  debtToCapital: { group: 'solvency', label: 'Debt to capital', fmt: 'pct', f: (c) => c.S.debtToCapital, how: (c) => `debt ÷ (debt + equity) = ${n0(c.S.debt)} ÷ (${n0(c.S.debt)} + ${n0(c.p.equity)})` },
  equityMultiplier: { group: 'solvency', label: 'Equity multiplier (closing)', fmt: 'x', f: (c) => c.S.equityMultiplier, how: (c) => `total assets ÷ equity = ${n0(c.p.totalAssets)} ÷ ${n0(c.p.equity)}` },
  interestCoverage: { group: 'solvency', label: 'Interest coverage (times interest earned)', fmt: 'x', f: (c) => c.S.interestCoverage, how: (c) => `${c.o.leases ? '(EBIT + lease interest) ÷ (interest expense + lease interest)' : 'EBIT ÷ interest expense'} = ${n0(c.S.ebit)} ÷ ${n0(c.S.interest)}` },
  netDebtToEbitda: { group: 'solvency', label: 'Net debt ÷ EBITDA', fmt: 'x', f: (c) => c.S.netDebtToEbitda, how: (c) => `(debt − cash) ÷ ${c.o.leases ? '(EBIT + D&A + lease cost)' : '(EBIT + D&A)'} = (${n0(c.S.debt)} − ${n0(c.p.cash)}) ÷ ${n0(c.S.ebitda)}` },
  assetTurnover: { group: 'efficiency', label: 'Asset turnover', fmt: 'x', f: (c) => c.E.assetTurnover, how: (c) => `revenue ÷ ${c.bTA} total assets = ${n0(c.p.revenue)} ÷ ${n0(c.avg('totalAssets'))}` },
  receivablesTurnover: { group: 'efficiency', label: 'Receivables turnover', fmt: 'x', f: (c) => c.E.receivablesTurnover, how: (c) => `${c.o.creditSales ? 'credit sales' : 'revenue'} ÷ ${c.b('receivables')} receivables = ${n0(c.rev)} ÷ ${n0(c.avg('receivables'))}` },
  dso: { group: 'efficiency', label: 'Days sales outstanding (days)', fmt: 'days', f: (c) => c.E.dso, how: (c) => `days in the period ÷ receivables turnover = ${c.E.days.toFixed(1)} ÷ ${c.E.receivablesTurnover?.toFixed(2)}` },
  fixedAssetTurnover: { group: 'efficiency', label: 'Fixed-asset turnover', fmt: 'x', f: (c) => c.E.fixedAssetTurnover, how: (c) => `revenue ÷ ${c.b('ppeNet')} property and equipment (net) = ${n0(c.p.revenue)} ÷ ${n0(c.avg('ppeNet'))}` },
  inventoryTurnover: { group: 'efficiency', label: 'Inventory turnover', fmt: 'x', f: (c) => c.E.inventoryTurnover, how: (c) => `${c.p.cogsGoods != null ? 'cost of goods sold' : 'cost of sales'} ÷ ${c.b('inventory')} inventory = ${n0(c.p.cogsGoods ?? c.p.cogs)} ÷ ${n0(c.avg('inventory'))}` },
  dio: { group: 'efficiency', label: 'Days inventory outstanding (days)', fmt: 'days', f: (c) => c.E.dio, how: (c) => `days in the period ÷ inventory turnover = ${c.E.days.toFixed(1)} ÷ ${c.E.inventoryTurnover?.toFixed(2)}` },
  dpo: { group: 'efficiency', label: 'Days payables outstanding (days)', fmt: 'days', f: (c) => c.E.dpo, how: (c) => `days in the period ÷ (${c.p.purchases != null ? 'purchases' : 'cost of sales'} ÷ ${c.b('payables')} payables) = ${c.E.days.toFixed(1)} ÷ ${c.E.payablesTurnover?.toFixed(2)}` },
  cashConversionCycle: { group: 'efficiency', label: 'Cash conversion cycle (days)', fmt: 'days', f: (c) => c.E.cashConversionCycle, how: (c) => `DSO + DIO − DPO = ${c.E.dso?.toFixed(1)} + ${c.E.dio?.toFixed(1)} − ${c.E.dpo?.toFixed(1)}` },
  grossMargin: { group: 'profitability', label: 'Gross margin', fmt: 'pct', f: (c) => c.P.grossMargin, how: (c) => `gross profit ÷ revenue = ${n0(c.p.grossProfit ?? c.p.revenue - c.p.cogs)} ÷ ${n0(c.p.revenue)}` },
  operatingMargin: { group: 'profitability', label: 'Operating margin', fmt: 'pct', f: (c) => c.P.operatingMargin, how: (c) => `operating income ÷ revenue = ${n0(c.p.operatingIncome)} ÷ ${n0(c.p.revenue)}` },
  ebitdaMargin: { group: 'profitability', label: 'EBITDA margin', fmt: 'pct', f: (c) => c.P.ebitdaMargin, how: (c) => `(EBIT + D&A) ÷ revenue = (${n0(c.p.ebit)} + ${n0(c.p.da)}) ÷ ${n0(c.p.revenue)}` },
  netMargin: { group: 'profitability', label: 'Net margin', fmt: 'pct', f: (c) => c.P.netMargin, how: (c) => `net income ÷ revenue = ${n0(c.p.netIncome)} ÷ ${n0(c.p.revenue)}` },
  roa: { group: 'profitability', label: 'Return on assets', fmt: 'pct', f: (c) => c.P.roa, how: (c) => `net income ÷ ${c.bTA} total assets = ${n0(c.p.netIncome)} ÷ ${n0(c.avg('totalAssets'))}` },
  roe: { group: 'profitability', label: 'Return on equity', fmt: 'pct', f: (c) => c.P.roe, how: (c) => `net income ÷ ${c.b('equity')} equity = ${n0(c.p.netIncome)} ÷ ${n0(c.avg('equity'))}` },
  dupontMargin: { group: 'dupont', label: 'DuPont: net margin', fmt: 'pct', f: (c) => c.D.netMargin, how: (c) => `net income ÷ revenue = ${n0(c.p.netIncome)} ÷ ${n0(c.p.revenue)}` },
  dupontTurnover: { group: 'dupont', label: 'DuPont: asset turnover', fmt: 'x', f: (c) => c.D.assetTurnover, how: (c) => `revenue ÷ ${c.bTA} total assets = ${n0(c.p.revenue)} ÷ ${n0(c.avg('totalAssets'))}` },
  dupontMultiplier: { group: 'dupont', label: 'DuPont: equity multiplier', fmt: 'x', f: (c) => c.D.equityMultiplier, how: (c) => `${c.bTA} total assets ÷ ${c.b('equity')} equity = ${n0(c.avg('totalAssets'))} ÷ ${n0(c.avg('equity'))}` },
  dupontRoe: { group: 'dupont', label: 'DuPont: ROE (the product)', fmt: 'pct', f: (c) => c.D.roe, how: (c) => `net margin × asset turnover × equity multiplier = ${FMT.pct(c.D.netMargin)} × ${c.D.assetTurnover?.toFixed(3)} × ${c.D.equityMultiplier?.toFixed(3)}` },
  taxBurden: { group: 'dupont5', label: 'Tax burden', fmt: 'x', f: (c) => c.D.taxBurden, how: (c) => `net income ÷ income before tax = ${n0(c.p.netIncome)} ÷ ${n0(c.p.pretax)}` },
  interestBurden: { group: 'dupont5', label: 'Interest burden', fmt: 'x', f: (c) => c.D.interestBurden, how: (c) => `income before tax ÷ EBIT = ${n0(c.p.pretax)} ÷ ${n0(c.p.ebit)}` },
  ebitMargin: { group: 'dupont5', label: 'EBIT margin', fmt: 'pct', f: (c) => c.D.ebitMargin, how: (c) => `EBIT ÷ revenue = ${n0(c.p.ebit)} ÷ ${n0(c.p.revenue)}` },
  cfoToNetIncome: { group: 'cash', label: 'Cash from operations ÷ net income', fmt: 'x', f: (c) => c.Q.cfoToNetIncome, how: (c) => `CFO ÷ net income = ${n0(c.p.cfo)} ÷ ${n0(c.p.netIncome)}` },
  accrualsRatio: { group: 'cash', label: 'Accruals ratio', fmt: 'pct', f: (c) => c.Q.accrualsRatio, how: (c) => `(net income − CFO) ÷ ${c.bTA} total assets = (${n0(c.p.netIncome)} − ${n0(c.p.cfo)}) ÷ ${n0(c.avg('totalAssets'))}` },
  freeCashFlow: { group: 'cash', label: 'Free cash flow', fmt: 'usd', f: (c) => c.Q.freeCashFlow, how: (c) => `CFO − capital expenditure = ${n0(c.p.cfo)} − ${n0(c.p.capex)}` },
  zdouble: { group: 'altman', label: 'Altman Z″', fmt: 'z', f: (c) => R.altman(c.p, 'zdouble').score, how: (c) => { const a = R.altman(c.p, 'zdouble'); return a.x[0] == null ? '' : `6.56 × ${a.x[0].toFixed(3)} + 3.26 × ${a.x[1].toFixed(3)} + 6.72 × ${a.x[2].toFixed(3)} + 1.05 × ${a.x[3].toFixed(3)} (zone: ${a.zone})`; } },
  z: { group: 'altman', optIn: true, label: 'Altman Z (market value of equity)', fmt: 'z', f: (c) => R.altman(c.p, 'z').score, how: (c) => { const a = R.altman(c.p, 'z'); return a.x[0] == null ? '' : `1.2 × ${a.x[0].toFixed(3)} + 1.4 × ${a.x[1].toFixed(3)} + 3.3 × ${a.x[2].toFixed(3)} + 0.6 × ${a.x[3].toFixed(3)} + 1.0 × ${a.x[4].toFixed(3)} (zone: ${a.zone})`; } },
  zprime: { group: 'altman', label: 'Altman Z′', fmt: 'z', f: (c) => R.altman(c.p, 'zprime').score, how: (c) => { const a = R.altman(c.p, 'zprime'); return a.x[0] == null ? '' : `0.717 × ${a.x[0].toFixed(3)} + 0.847 × ${a.x[1].toFixed(3)} + 3.107 × ${a.x[2].toFixed(3)} + 0.420 × ${a.x[3].toFixed(3)} + 0.998 × ${a.x[4].toFixed(3)} (zone: ${a.zone})`; } },
};
export const GROUPS = {
  liquidity: 'Liquidity', solvency: 'Solvency and leverage', efficiency: 'Efficiency', profitability: 'Profitability',
  dupont: 'DuPont (three steps)', dupont5: 'DuPont (five steps: the margin split)', cash: 'Cash-flow quality', altman: 'Distress scores',
};
const TOGGLES = {
  average: 'Use average balances (opening and closing) where a prior period is shown',
  leases: 'Count operating lease liabilities as debt',
  annualise: 'Annualise part-year flows (revenue, costs, cash flows)',
  creditSales: 'Receivables days on credit sales only',
};
const FLOWS = ['revenue', 'cogs', 'cogsGoods', 'leaseInterest', 'leaseCost', 'grossProfit', 'operatingIncome', 'ebit', 'interestExpense', 'pretax', 'tax', 'netIncome', 'da', 'cfo', 'capex', 'dividends', 'purchases', 'creditSales'];

/** One period's ratios under the chosen conventions (exported for the checker and tests). */
export function compute(data, prevData, o = {}) {
  let p = { ...data };
  if (o.annualise && (p.months ?? 12) !== 12) { for (const k of FLOWS) if (typeof p[k] === 'number') p[k] = p[k] * 12 / p.months; p.months = 12; }
  const prev = o.average === false ? null : prevData;
  // credit sales replace revenue only in receivables turnover and days (and so the cycles), not in asset turnover
  const credit = o.creditSales && typeof p.creditSales === 'number';
  const E = R.efficiency(p, prev);
  if (credit) {
    const EC = R.efficiency({ ...p, revenue: p.creditSales }, prev);
    Object.assign(E, { receivablesTurnover: EC.receivablesTurnover, dso: EC.dso, operatingCycle: EC.operatingCycle, cashConversionCycle: EC.cashConversionCycle });
  }
  const c = { p, o, prev, rev: credit ? p.creditSales : p.revenue,
    L: R.liquidity(p), S: R.solvency(p, { withLeases: !!o.leases }), E,
    P: R.profitability(p, prev), D: R.dupont(p, prev), Q: R.cashQuality(p, prev) };
  c.avg = (k) => R.avg(p, prev, k);
  c.b = (k) => (prev && typeof prev[k] === 'number' ? 'average' : 'closing');
  c.bTA = c.b('totalAssets');
  return c;
}

/** Ratios that divide by equity (or by debt plus equity) mean nothing when equity is zero or negative. */
const BY_EQUITY = new Set(['liabilitiesToEquity', 'debtToEquity', 'debtToCapital', 'equityMultiplier', 'roe', 'dupontMultiplier', 'dupontRoe']);
const nm = (k, c) => (k === 'cfoToNetIncome' && typeof c.p.netIncome === 'number' && c.p.netIncome <= 0) || BY_EQUITY.has(k) && typeof c.p.equity === 'number' && (c.p.equity <= 0 || (k.startsWith('dupont') || k === 'roe' ? (c.avg('equity') ?? 1) <= 0 : false));
const applyDelta = (data, delta) => { const out = { ...data }; for (const [k, v] of Object.entries(delta || {})) out[k] = (out[k] || 0) + v; return out; };

export function mount(el, cfg, ctx) {
  const base = `ra-${ctx.id}`;
  const keys = cfg.ratios || Object.keys(RATIOS).filter((k) => !RATIOS[k].optIn && (cfg.groups || ['liquidity', 'solvency', 'efficiency', 'profitability']).includes(RATIOS[k].group));   // opt-in ratios (Z, which needs a market value) only when listed in `ratios`
  const st = { average: true, leases: false, annualise: false, creditSales: false, ...(cfg.defaults || {}), on: new Set(), sel: cfg.select && keys.includes(cfg.select) ? cfg.select : keys[0], col: 0 };
  const check = (id, label, on, set) => {
    const inp = h('input', { type: 'checkbox', id, ...(on ? { checked: '' } : {}) });
    inp.addEventListener('change', () => { set(inp.checked); render(); });
    return h('div', { class: 'field sp-check' }, inp, h('label', { for: id }, label));
  };
  const toggles = h('div', { class: 'sp-toggles' },
    ...(cfg.toggles || []).map((t) => check(`${base}-${t}`, TOGGLES[t] || t, st[t], (v) => { st[t] = v; })),
    ...(cfg.adjust || []).map((a, i) => check(`${base}-adj${i}`, a.label, false, (v) => { v ? st.on.add(i) : st.on.delete(i); })));
  const table = h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Ratios by period' });
  const adjNotes = h('div', { 'aria-live': 'polite' });
  const how = h('div', { class: 'cv-out', 'aria-live': 'polite' });
  el.classList.add('cv-widget');
  el.append(...[cfg.title ? h('p', { class: 'fx-title' }, cfg.title) : null, toggles.childNodes.length ? toggles : null, adjNotes, table, how,
    cfg.note ? (() => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(cfg.note); return p; })() : null].filter(Boolean));

  function columns() {
    const periods = cfg.periods.map((per, i) => {
      let data = per.data;
      for (const j of st.on) if ((cfg.adjust[j].period ?? cfg.periods.length - 1) === i) data = applyDelta(data, cfg.adjust[j].delta);
      return { label: per.label, data };
    });
    const cols = periods.map((per, i) => ({ label: st.annualise && (per.data.months ?? 12) !== 12 ? `${per.label}, annualised` : per.label, c: compute(per.data, i > 0 && st.average ? periods[i - 1].data : null, st) }));
    for (const peer of cfg.peers || []) cols.push({ label: peer.label, peer: true, c: compute(peer.data, st.average ? peer.prev || null : null, st) });
    return cols;
  }

  function render() {
    const cols = columns();
    const thead = h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Ratio'), ...cols.map((c) => h('th', { scope: 'col', class: 'num' }, c.label))));
    const rows = [];
    let lastGroup = null;
    for (const k of keys) {
      const r = RATIOS[k];
      if (!r) continue;
      if (!cfg.ratios && r.group !== lastGroup) { rows.push(h('tr', { class: 'ra-group' }, h('th', { scope: 'rowgroup', colspan: String(cols.length + 1) }, GROUPS[r.group]))); lastGroup = r.group; }
      const pick = h('button', { type: 'button', class: 'ra-pick', 'aria-pressed': String(st.sel === k) }, r.label);
      pick.addEventListener('click', () => { st.sel = k; render(); });
      rows.push(h('tr', { class: st.sel === k ? 'is-selected' : '' }, h('th', { scope: 'row' }, pick),
        ...cols.map((c) => { const v = r.f(c.c); return h('td', { class: 'num' }, nm(k, c.c) ? 'n/m' : v == null || !Number.isFinite(v) ? '—' : FMT[r.fmt](v)); })));
    }
    const notes = [...st.on].map((j) => cfg.adjust[j]).filter((a) => a.note);
    adjNotes.replaceChildren(...notes.map((a) => { const p = h('p', { class: 'fx-note' }); p.innerHTML = xl(`<b>${a.label}.</b> ${a.note}`); return p; }));
    table.replaceChildren(h('table', { class: 'data-table ra-table' }, h('caption', { class: 'fx-cap' }, 'Pick a ratio to see how it is worked out. On a narrow screen, scroll the table sideways for every column.'), thead, h('tbody', {}, ...rows)));
    const r = RATIOS[st.sel];
    how.replaceChildren(h('p', { class: 'fx-note' }, h('b', {}, r.label)), h('ul', {}, ...cols.map((c) => {
      const v = r.f(c.c);
      const text = nm(st.sel, c.c) ? (st.sel === 'cfoToNetIncome' ? 'not meaningful: net income is zero or negative, so compare the dollar amounts instead' : 'not meaningful: equity is negative (a deficit), so a ratio that divides by it, or by debt plus it, has no useful reading') : v == null || !Number.isFinite(v) ? 'not defined: an input is missing or a divisor is zero' : `${r.how(c.c)} = ${FMT[r.fmt](v)}${r.fmt === 'days' ? ' days' : ''}`.replace(/(^|[\s(×÷=+])-(?=\d)/g, '$1−');
      return h('li', {}, h('b', {}, `${c.label}: `), text);
    })));
  }
  render();
}
