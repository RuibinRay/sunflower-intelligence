// intel-export.js — exports of the Company Intelligence analysis: an Excel workbook whose ratio cells are live formulas
// over the statement rows on the same sheet (so every figure can be traced and recalculated), plus CSV tables.
// Pure functions, no DOM. The grid it builds is the single source for the .xlsx file and for the test that
// recalculates every formula with the site's spreadsheet engine and compares it with the dashboard's numbers.
import * as V from './valuation.js?v=30';
import { METRICS, metricTable } from './metrics.js?v=30';
import { buildXlsx, cellRef, toCSV } from './valuation-io.js?v=30';

const fin = V.fin;
const DERIVED_ROWS = [['debt', 'Total debt'], ['netDebt', 'Net debt'], ['nwc', 'Operating net working capital'], ['investedCapital', 'Invested capital'], ['taxUsed', 'Tax rate used for NOPAT']];

/** Formula for each metric, given row lookups. c = this year's column letter, p = the prior year's (null for the first), c0 = the first year's. */
const FORMULAS = {
  grossMargin: (r, c) => `${c}${r.grossProfit}/${c}${r.revenue}`, ebitdaMargin: (r, c) => `${c}${r.ebitda}/${c}${r.revenue}`, ebitMargin: (r, c) => `${c}${r.ebit}/${c}${r.revenue}`, netMargin: (r, c) => `${c}${r.netIncome}/${c}${r.revenue}`,
  roa: (r, c, p) => `${c}${r.netIncome}/${avg(r.totalAssets, c, p)}`, roe: (r, c, p) => `${c}${r.netIncome}/${avg(r.equity, c, p)}`,
  roic: (r, c, p) => `${c}${r.ebit}*(1-${c}${r.taxUsed})/${avg(r.investedCapital, c, p)}`,
  current: (r, c) => `${c}${r.currentAssets}/${c}${r.currentLiabilities}`,
  quick: (r, c) => `(${c}${r.cash}${r.shortTermInvestments ? `+${c}${r.shortTermInvestments}` : ''}+${c}${r.receivables})/${c}${r.currentLiabilities}`,
  cashRatio: (r, c) => `(${c}${r.cash}${r.shortTermInvestments ? `+${c}${r.shortTermInvestments}` : ''})/${c}${r.currentLiabilities}`,
  debtToEquity: (r, c) => `${c}${r.debt}/${c}${r.equity}`, netDebtToEbitda: (r, c) => `${c}${r.netDebt}/${c}${r.ebitda}`, interestCoverage: (r, c) => `${c}${r.ebit}/${c}${r.interestExpense}`, debtRatio: (r, c) => `${c}${r.totalLiabilities}/${c}${r.totalAssets}`,
  assetTurnover: (r, c, p) => `${c}${r.revenue}/${avg(r.totalAssets, c, p)}`, inventoryTurnover: (r, c, p) => `${c}${r.cogs}/${avg(r.inventory, c, p)}`,
  dso: (r, c, p) => `365/(${c}${r.revenue}/${avg(r.receivables, c, p)})`, dio: (r, c, p) => `365/(${c}${r.cogs}/${avg(r.inventory, c, p)})`, dpo: (r, c, p) => `365/(${c}${r.cogs}/${avg(r.payables, c, p)})`,
  ccc: (r, c) => `${c}${r.m_dso}+${c}${r.m_dio}-${c}${r.m_dpo}`,
  revenueGrowth: (r, c, p) => grow(r.revenue, c, p), ebitdaGrowth: (r, c, p) => grow(r.ebitda, c, p), netIncomeGrowth: (r, c, p) => grow(r.netIncome, c, p), fcfGrowth: (r, c, p) => grow(r.fcf, c, p),
  revenueCagr: (r, c, p, c0) => (p ? `(${c}${r.revenue}/${c0}${r.revenue})^(1/(${c}${r.year}-${c0}${r.year}))-1` : null),
  fcf: (r, c) => `${c}${r.fcf}`, fcfMargin: (r, c) => `${c}${r.fcf}/${c}${r.revenue}`, cashConversion: (r, c) => `${c}${r.cfo}/${c}${r.netIncome}`, capexToDa: (r, c) => `${c}${r.capex}/${c}${r.da}`,
  altmanZ2: (r, c) => `6.56*(${c}${r.currentAssets}-${c}${r.currentLiabilities})/${c}${r.totalAssets}+3.26*${c}${r.retainedEarnings}/${c}${r.totalAssets}+6.72*${c}${r.ebit}/${c}${r.totalAssets}+1.05*${c}${r.equity}/${c}${r.totalLiabilities}`,
  altmanZ1: (r, c) => `0.717*(${c}${r.currentAssets}-${c}${r.currentLiabilities})/${c}${r.totalAssets}+0.847*${c}${r.retainedEarnings}/${c}${r.totalAssets}+3.107*${c}${r.ebit}/${c}${r.totalAssets}+0.42*${c}${r.equity}/${c}${r.totalLiabilities}+0.998*${c}${r.revenue}/${c}${r.totalAssets}`,
};
const avg = (row, c, p) => (p ? `AVERAGE(${p}${row},${c}${row})` : `${c}${row}`);
const grow = (row, c, p) => (p ? `(${c}${row}-${p}${row})/ABS(${p}${row})` : null);
const col = (i) => cellRef(0, i).replace(/\d+$/, '');

/**
 * The analysis as a grid: rows of cells (number | string | { f } | { v, s }), with the statement block first and the
 * ratio block below it. Also returns `ratioCells`: { metricId: [A1 address per year | null] } for checking.
 */
export function analysisGrid(project, H) {
  const cur = project.meta?.currency || 'USD', unit = project.meta?.unitLabel || 'millions';
  const B = (v) => ({ v, s: 1 });
  const years = H.map((x) => x.year), C = years.map((_, i) => col(i + 3));     // years start in column D
  const rows = [[B(`${project.meta?.name || 'Company'}: financial analysis`)], [`Figures in ${cur} ${unit} (shares in ${unit}). Statement rows are the imported or derived values; every ratio below them is a formula over those rows.`], [], [B('Line'), B('Field'), B('Basis'), ...years.map((y) => B(`FY${y}`))]];
  const rowOf = {};
  rows.push([B('Fiscal year'), 'year', '', ...years]); rowOf.year = rows.length;
  rows.push([B('Statements')]);
  for (const f of V.FIELDS) {
    if (!H.some((x) => fin(x.p[f.id]))) continue;
    const derivedAny = H.some((x) => x.how[f.id]);
    rows.push([f.label, f.id, derivedAny ? `derived where blank: ${[...new Set(H.map((x) => x.how[f.id]).filter(Boolean))].join('; ')}` : 'as imported', ...H.map((x) => (fin(x.p[f.id]) ? x.p[f.id] : ''))]);
    rowOf[f.id] = rows.length;
  }
  rows.push([B('Derived balances')]);
  for (const [k, label] of DERIVED_ROWS) {
    const vals = H.map((x) => (k === 'taxUsed' ? (fin(x.p.ebit) ? Math.min(0.5, Math.max(0, fin(x.p.effectiveTax) ? x.p.effectiveTax : 0)) : NaN) : x.p[k]));
    if (!vals.some(fin)) continue;
    rows.push([label, k, k === 'taxUsed' ? 'income tax ÷ pre-tax income, held between 0% and 50%' : `derived: ${[...new Set(H.map((x) => x.how[k]).filter(Boolean))].join('; ')}`, ...vals.map((v) => (fin(v) ? (k === 'taxUsed' ? { v, s: 2 } : v) : ''))]);
    rowOf[k] = rows.length;
  }
  rows.push([]); rows.push([B('Ratios (formulas)'), B('Metric'), B('Formula in words')]);
  const table = metricTable(H), ratioCells = {};
  // first pass: fix each metric's row so that ccc can point at the DSO, DIO and DPO rows
  let r0 = rows.length;
  METRICS.forEach((m, k) => { rowOf[`m_${m.id}`] = r0 + k + 1; });
  for (const m of METRICS) {
    const make = FORMULAS[m.id];
    const cells = H.map((_, i) => {
      const v = table[m.id][i];
      if (!fin(v) || !make) return '';
      let f = null;
      try { f = make(rowOf, C[i], i > 0 && inputsPrev(m.id, H, i) ? C[i - 1] : null, C[0]); } catch { f = null; }
      if (!f || /undefined/.test(f)) return m.fmt === 'pct' ? { v, s: 2 } : v;      // an input row is not on the sheet: write the value
      return { f, v, s: m.fmt === 'pct' ? 2 : 0 };
    });
    rows.push([m.name, m.id, m.formula, ...cells]);
    ratioCells[m.id] = cells.map((cell, i) => (cell === '' ? null : `${C[i]}${rows.length}`));
  }
  return { rows, ratioCells, years };
}
/** Whether the prior year has the balance a ratio averages (the engine falls back to the closing balance when it does not). */
function inputsPrev(id, H, i) {
  const key = { roa: 'totalAssets', roe: 'equity', roic: 'investedCapital', assetTurnover: 'totalAssets', inventoryTurnover: 'inventory', dio: 'inventory', dso: 'receivables', dpo: 'payables' }[id];
  return key ? fin(H[i - 1].p[key]) : true;
}

/** The .xlsx bytes: Analysis (formulas), Lineage, Checks, Notes. */
export function buildAnalysisWorkbook(project, H, { lineage = {}, issues = [], valuation = null } = {}) {
  const B = (v) => ({ v, s: 1 });
  const grid = analysisGrid(project, H);
  const lin = [[B('Year'), B('Field'), B('Value'), B('Source sheet'), B('Source line'), B('Cells'), B('How')]];
  for (const x of H) {
    const L = lineage[x.year] || {};
    for (const f of V.FIELDS) {
      if (!fin(x.p[f.id])) continue;
      const s = L[f.id];
      lin.push([x.year, f.label, x.p[f.id], s ? s.sheet : '', s ? s.label : '', s ? (s.cells || []).slice(0, 8).join(', ') : '', s ? [s.how, s.scaled ? `scaled ×${s.scaled}` : null, s.signFlipped ? 'sign flipped (reported as a negative)' : null, s.confirmedBy ? `agrees with ${s.confirmedBy.join(', ')}` : null].filter(Boolean).join('; ') || 'as reported' : `derived: ${x.how[f.id] || ''}`]);
    }
  }
  const chk = [[B('Level'), B('Finding')], ...issues.map((i) => [i.level, i.text])];
  const notes = [[B('Notes')], ['Built by Sunflower Intelligence, Finance › Company Intelligence.'], [`Saved ${new Date().toISOString().slice(0, 10)}. Source: ${project.source?.note || ''}`], ['Ratios that divide a flow by a balance use the average of the opening and closing balance when the prior year is on the sheet, and the closing balance for the first year.'], ['Nothing in this workbook was estimated: a blank cell means the source did not provide the figure.']];
  if (valuation?.ok) notes.push([`Valuation (DCF, base case): enterprise value ${valuation.ev.toFixed(1)}, equity value ${valuation.equity.toFixed(1)}, WACC ${(valuation.r * 100).toFixed(2)}%. The full model with formulas is exported from the Company Valuation Studio.`]);
  return buildXlsx([{ name: 'Analysis', rows: grid.rows, widths: [44, 22, 46, ...grid.years.map(() => 14)] }, { name: 'Lineage', rows: lin, widths: [8, 40, 14, 22, 40, 26, 60] }, { name: 'Checks', rows: chk, widths: [10, 140] }, { name: 'Notes', rows: notes, widths: [140] }]);
}

/** Statements as CSV (lines down, years across, with a basis column). */
export function statementsCSV(H) {
  const rows = V.FIELDS.filter((f) => H.some((x) => fin(x.p[f.id]))).map((f) => [f.label, f.id, H.some((x) => x.how[f.id]) ? 'derived where blank' : 'as imported', ...H.map((x) => (fin(x.p[f.id]) ? Math.round(x.p[f.id] * 1e6) / 1e6 : ''))]);
  return toCSV(['line', 'field', 'basis', ...H.map((x) => `FY${x.year}`)], rows);
}
/** Ratios as CSV. */
export function ratiosCSV(H) {
  const t = metricTable(H);
  return toCSV(['metric', 'id', 'group', 'formula', ...H.map((x) => `FY${x.year}`)], METRICS.map((m) => [m.name, m.id, m.group, m.formula, ...t[m.id].map((v) => (fin(v) ? Math.round(v * 1e8) / 1e8 : ''))]));
}
