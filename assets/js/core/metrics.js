// metrics.js — the catalogue of financial metrics the Company Intelligence dashboard shows: for each one its group,
// how it is computed (reading the values the ratio and valuation engines already produced, never recomputing them),
// its formula in words, the variables with the numbers used, the convention chosen where more than one exists, a
// source, and the Learn lesson that teaches it. Pure data and functions, no DOM.
import * as R from './ratios.js?v=30';
import { fin } from './valuation.js?v=30';

const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
const avgOf = (H, i, k) => (i > 0 && fin(H[i].p[k]) && fin(H[i - 1].p[k]) ? (H[i].p[k] + H[i - 1].p[k]) / 2 : H[i].p[k]);
const basis = (H, i, k) => (i > 0 && fin(H[i - 1].p[k]) ? 'average of opening and closing' : 'closing balance (no prior year)');
const F03 = 'learn/finance/f03/';
const SRC_RATIO = 'CFA Institute, Financial Statement Analysis (ratio definitions); Stobierski, HBS Online, 2020';

export const GROUPS = [
  { id: 'profitability', name: 'Profitability' }, { id: 'liquidity', name: 'Liquidity' }, { id: 'leverage', name: 'Leverage' },
  { id: 'efficiency', name: 'Efficiency' }, { id: 'growth', name: 'Growth' }, { id: 'cash', name: 'Cash flow' }, { id: 'distress', name: 'Financial distress' },
];

/** Each metric: value(H, i) reads the figure for year index i from V.historical output; vars(H, i) lists what went in. */
export const METRICS = [
  // ---------------------------------------------------------------- profitability
  { id: 'grossMargin', group: 'profitability', name: 'Gross margin', fmt: 'pct', better: 'high', formula: 'Gross profit ÷ Revenue', learn: `${F03}common-size-statements/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].margins.gross), vars: (H, i) => [['Gross profit', H[i].p.grossProfit], ['Revenue', H[i].p.revenue]] },
  { id: 'ebitdaMargin', group: 'profitability', name: 'EBITDA margin', fmt: 'pct', better: 'high', formula: 'EBITDA ÷ Revenue', note: 'EBITDA is operating income before depreciation and amortisation; it is not a GAAP or IFRS line and is derived when the statements do not show it.', learn: `${F03}common-size-statements/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].margins.ebitda), vars: (H, i) => [['EBITDA', H[i].p.ebitda], ['Revenue', H[i].p.revenue]] },
  { id: 'ebitMargin', group: 'profitability', name: 'Operating (EBIT) margin', fmt: 'pct', better: 'high', formula: 'EBIT ÷ Revenue', learn: `${F03}common-size-statements/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].margins.ebit), vars: (H, i) => [['EBIT', H[i].p.ebit], ['Revenue', H[i].p.revenue]] },
  { id: 'netMargin', group: 'profitability', name: 'Net margin', fmt: 'pct', better: 'high', formula: 'Net income ÷ Revenue', learn: `${F03}common-size-statements/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].margins.net), vars: (H, i) => [['Net income', H[i].p.netIncome], ['Revenue', H[i].p.revenue]] },
  { id: 'roa', group: 'profitability', name: 'Return on assets (ROA)', fmt: 'pct', better: 'high', formula: 'Net income ÷ Average total assets', note: 'Average of opening and closing assets when the prior year is available; the closing balance otherwise.', learn: `${F03}return-on-assets-and-equity/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.profitability.roa), vars: (H, i) => [['Net income', H[i].p.netIncome], [`Total assets (${basis(H, i, 'totalAssets')})`, avgOf(H, i, 'totalAssets')]] },
  { id: 'roe', group: 'profitability', name: 'Return on equity (ROE)', fmt: 'pct', better: 'high', formula: 'Net income ÷ Average shareholders’ equity', note: 'Average equity when the prior year is available. DuPont splits it into margin × asset turnover × leverage.', learn: `${F03}dupont-analysis/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.profitability.roe), vars: (H, i) => [['Net income', H[i].p.netIncome], [`Equity (${basis(H, i, 'equity')})`, avgOf(H, i, 'equity')]] },
  { id: 'roic', group: 'profitability', name: 'Return on invested capital (ROIC)', fmt: 'pct', better: 'high', formula: 'EBIT × (1 − effective tax rate) ÷ Average invested capital', note: 'Invested capital = debt + equity (+ minority and preferred) − cash and short-term investments. The effective tax rate is income tax ÷ pre-tax income, held between 0% and 50%.', learn: 'learn/finance/f05/weighted-average-cost-of-capital/', source: 'Koller, Goedhart and Wessels, Valuation, 7th ed., ch. 11',
    value: (H, i) => n(H[i].drivers.roic), vars: (H, i) => [['EBIT', H[i].p.ebit], ['Effective tax rate', H[i].p.effectiveTax, 'pct'], ['NOPAT', H[i].drivers.nopat], [`Invested capital (${basis(H, i, 'investedCapital')})`, avgOf(H, i, 'investedCapital')]] },
  // ---------------------------------------------------------------- liquidity
  { id: 'current', group: 'liquidity', name: 'Current ratio', fmt: 'x', better: 'high', formula: 'Current assets ÷ Current liabilities', learn: `${F03}liquidity/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.liquidity.current), vars: (H, i) => [['Current assets', H[i].p.currentAssets], ['Current liabilities', H[i].p.currentLiabilities]] },
  { id: 'quick', group: 'liquidity', name: 'Quick ratio', fmt: 'x', better: 'high', formula: '(Cash + Short-term investments + Receivables) ÷ Current liabilities', learn: `${F03}liquidity/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.liquidity.quick), vars: (H, i) => [['Cash', H[i].p.cash], ['Short-term investments', H[i].p.shortTermInvestments ?? 0], ['Receivables', H[i].p.receivables], ['Current liabilities', H[i].p.currentLiabilities]] },
  { id: 'cashRatio', group: 'liquidity', name: 'Cash ratio', fmt: 'x', better: 'high', formula: '(Cash + Short-term investments) ÷ Current liabilities', learn: `${F03}liquidity/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.liquidity.cash), vars: (H, i) => [['Cash', H[i].p.cash], ['Short-term investments', H[i].p.shortTermInvestments ?? 0], ['Current liabilities', H[i].p.currentLiabilities]] },
  // ---------------------------------------------------------------- leverage
  { id: 'debtToEquity', group: 'leverage', name: 'Debt to equity', fmt: 'x', better: 'low', formula: 'Interest-bearing debt ÷ Shareholders’ equity', note: 'Debt is short-term plus long-term borrowings; lease liabilities are not counted unless you choose to in the Valuation Studio.', learn: `${F03}solvency-and-leverage/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.solvency.debtToEquity), vars: (H, i) => [['Debt', H[i].p.debt], ['Equity', H[i].p.equity]] },
  { id: 'netDebtToEbitda', group: 'leverage', name: 'Net debt ÷ EBITDA', fmt: 'x', better: 'low', formula: '(Debt − Cash − Short-term investments) ÷ EBITDA', learn: `${F03}solvency-and-leverage/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.solvency.netDebtToEbitda), vars: (H, i) => [['Debt', H[i].p.debt], ['Cash and short-term investments', (H[i].p.cash ?? NaN) + (H[i].p.shortTermInvestments ?? 0)], ['EBITDA', H[i].p.ebitda]] },
  { id: 'interestCoverage', group: 'leverage', name: 'Interest coverage', fmt: 'x', better: 'high', formula: 'EBIT ÷ Interest expense', learn: `${F03}solvency-and-leverage/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.solvency.interestCoverage), vars: (H, i) => [['EBIT', H[i].p.ebit], ['Interest expense', H[i].p.interestExpense]] },
  { id: 'debtRatio', group: 'leverage', name: 'Liabilities ÷ assets', fmt: 'pct', better: 'low', formula: 'Total liabilities ÷ Total assets', learn: `${F03}solvency-and-leverage/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.solvency.debtRatio), vars: (H, i) => [['Total liabilities', H[i].p.totalLiabilities], ['Total assets', H[i].p.totalAssets]] },
  // ---------------------------------------------------------------- efficiency
  { id: 'assetTurnover', group: 'efficiency', name: 'Asset turnover', fmt: 'x', better: 'high', formula: 'Revenue ÷ Average total assets', learn: `${F03}efficiency-and-working-capital/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.efficiency.assetTurnover), vars: (H, i) => [['Revenue', H[i].p.revenue], [`Total assets (${basis(H, i, 'totalAssets')})`, avgOf(H, i, 'totalAssets')]] },
  { id: 'inventoryTurnover', group: 'efficiency', name: 'Inventory turnover', fmt: 'x', better: 'high', formula: 'Cost of goods sold ÷ Average inventory', learn: `${F03}efficiency-and-working-capital/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.efficiency.inventoryTurnover), vars: (H, i) => [['Cost of goods sold', H[i].p.cogs], [`Inventory (${basis(H, i, 'inventory')})`, avgOf(H, i, 'inventory')]] },
  { id: 'dso', group: 'efficiency', name: 'Days sales outstanding (DSO)', fmt: 'days', better: 'low', formula: '365 ÷ (Revenue ÷ Average receivables)', note: 'Uses all revenue; if only part of sales is on credit, the true collection period is longer.', learn: `${F03}efficiency-and-working-capital/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.efficiency.dso), vars: (H, i) => [['Revenue', H[i].p.revenue], [`Receivables (${basis(H, i, 'receivables')})`, avgOf(H, i, 'receivables')]] },
  { id: 'dio', group: 'efficiency', name: 'Days inventory outstanding (DIO)', fmt: 'days', better: 'low', formula: '365 ÷ (Cost of goods sold ÷ Average inventory)', learn: `${F03}efficiency-and-working-capital/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.efficiency.dio), vars: (H, i) => [['Cost of goods sold', H[i].p.cogs], [`Inventory (${basis(H, i, 'inventory')})`, avgOf(H, i, 'inventory')]] },
  { id: 'dpo', group: 'efficiency', name: 'Days payables outstanding (DPO)', fmt: 'days', better: 'high', formula: '365 ÷ (Cost of goods sold ÷ Average payables)', note: 'Cost of goods sold stands in for purchases, which statements rarely show.', learn: `${F03}efficiency-and-working-capital/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.efficiency.dpo), vars: (H, i) => [['Cost of goods sold', H[i].p.cogs], [`Payables (${basis(H, i, 'payables')})`, avgOf(H, i, 'payables')]] },
  { id: 'ccc', group: 'efficiency', name: 'Cash conversion cycle', fmt: 'days', better: 'low', formula: 'DSO + DIO − DPO', learn: `${F03}efficiency-and-working-capital/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.efficiency.cashConversionCycle), vars: (H, i) => [['DSO', H[i].ratios.efficiency.dso, 'days'], ['DIO', H[i].ratios.efficiency.dio, 'days'], ['DPO', H[i].ratios.efficiency.dpo, 'days']] },
  // ---------------------------------------------------------------- growth
  { id: 'revenueGrowth', group: 'growth', name: 'Revenue growth', fmt: 'pct', better: 'high', formula: '(Revenue − Prior-year revenue) ÷ |Prior-year revenue|', learn: `${F03}horizontal-analysis/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].growth.revenue), vars: (H, i) => [['Revenue', H[i].p.revenue], ['Prior-year revenue', i ? H[i - 1].p.revenue : NaN]] },
  { id: 'ebitdaGrowth', group: 'growth', name: 'EBITDA growth', fmt: 'pct', better: 'high', formula: '(EBITDA − Prior-year EBITDA) ÷ |Prior-year EBITDA|', learn: `${F03}horizontal-analysis/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].growth.ebitda), vars: (H, i) => [['EBITDA', H[i].p.ebitda], ['Prior-year EBITDA', i ? H[i - 1].p.ebitda : NaN]] },
  { id: 'netIncomeGrowth', group: 'growth', name: 'Earnings growth', fmt: 'pct', better: 'high', formula: '(Net income − Prior-year net income) ÷ |Prior-year net income|', note: 'Measured against the size of the prior figure, so growth from a loss is still signed sensibly.', learn: `${F03}horizontal-analysis/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].growth.netIncome), vars: (H, i) => [['Net income', H[i].p.netIncome], ['Prior-year net income', i ? H[i - 1].p.netIncome : NaN]] },
  { id: 'fcfGrowth', group: 'growth', name: 'Free cash flow growth', fmt: 'pct', better: 'high', formula: '(FCF − Prior-year FCF) ÷ |Prior-year FCF|', learn: `${F03}cash-flow-and-earnings-quality/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].growth.fcf), vars: (H, i) => [['Free cash flow', H[i].p.fcf], ['Prior-year free cash flow', i ? H[i - 1].p.fcf : NaN]] },
  { id: 'revenueCagr', group: 'growth', name: 'Revenue CAGR since the first year', fmt: 'pct', better: 'high', formula: '(Revenue ÷ First-year revenue)^(1 ÷ years) − 1', learn: 'learn/finance/f04/present-and-future-value/', source: SRC_RATIO,
    value: (H, i) => (i > 0 ? n(R.cagr(H[i].p.revenue, H[0].p.revenue, H[i].year - H[0].year)) : NaN), vars: (H, i) => [['Revenue', H[i].p.revenue], [`Revenue in ${H[0].year}`, H[0].p.revenue], ['Years', H[i].year - H[0].year, 'num']] },
  // ---------------------------------------------------------------- cash flow
  { id: 'fcf', group: 'cash', name: 'Free cash flow', fmt: 'money', better: 'high', formula: 'Operating cash flow − Capital expenditure', learn: `${F03}cash-flow-and-earnings-quality/`, source: 'Investopedia, Pitfalls of DCF analysis (Segal, 2026): FCF as operating cash flow less capital expenditure',
    value: (H, i) => n(H[i].p.fcf), vars: (H, i) => [['Operating cash flow', H[i].p.cfo], ['Capital expenditure', H[i].p.capex]] },
  { id: 'fcfMargin', group: 'cash', name: 'Free cash flow margin', fmt: 'pct', better: 'high', formula: 'Free cash flow ÷ Revenue', learn: `${F03}cash-flow-and-earnings-quality/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].margins.fcf), vars: (H, i) => [['Free cash flow', H[i].p.fcf], ['Revenue', H[i].p.revenue]] },
  { id: 'cashConversion', group: 'cash', name: 'Cash conversion (CFO ÷ net income)', fmt: 'x', better: 'high', formula: 'Operating cash flow ÷ Net income', note: 'Persistently below 1× means profit is not arriving as cash: look at working capital and accruals.', learn: `${F03}cash-flow-and-earnings-quality/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].drivers.cashConversion), vars: (H, i) => [['Operating cash flow', H[i].p.cfo], ['Net income', H[i].p.netIncome]] },
  { id: 'capexToDa', group: 'cash', name: 'Capex ÷ depreciation', fmt: 'x', better: null, formula: 'Capital expenditure ÷ Depreciation and amortisation', note: 'Above 1× the asset base is growing; below 1× it is shrinking.', learn: `${F03}cash-flow-and-earnings-quality/`, source: SRC_RATIO,
    value: (H, i) => n(H[i].ratios.cash.capexToDa), vars: (H, i) => [['Capital expenditure', H[i].p.capex], ['D&A', H[i].p.da]] },
  // ---------------------------------------------------------------- distress
  { id: 'altmanZ2', group: 'distress', name: 'Altman Z″ (private and non-manufacturing firms)', fmt: 'num', better: 'high', formula: '6.56·X1 + 3.26·X2 + 6.72·X3 + 1.05·X4', note: 'X1 working capital ÷ total assets; X2 retained earnings ÷ total assets; X3 EBIT ÷ total assets; X4 book equity ÷ total liabilities. Below 1.1 distress, above 2.6 safe, grey between. A screening score, not a prediction.', learn: `${F03}distress-scores/`, source: 'Altman (2000), Predicting financial distress of companies: revisiting the Z-score and ZETA models',
    value: (H, i) => n(R.altman(H[i].p, 'zdouble').score), vars: (H, i) => { const a = R.altman(H[i].p, 'zdouble'); return [['X1', a.x[0], 'num4'], ['X2', a.x[1], 'num4'], ['X3', a.x[2], 'num4'], ['X4', a.x[3], 'num4']]; } },
  { id: 'altmanZ1', group: 'distress', name: 'Altman Z′ (private manufacturers)', fmt: 'num', better: 'high', formula: '0.717·X1 + 0.847·X2 + 3.107·X3 + 0.420·X4 + 0.998·X5', note: 'X5 is revenue ÷ total assets; X4 uses book equity. Below 1.23 distress, above 2.90 safe.', learn: `${F03}distress-scores/`, source: 'Altman (2000)',
    value: (H, i) => n(R.altman(H[i].p, 'zprime').score), vars: (H, i) => { const a = R.altman(H[i].p, 'zprime'); return [['X1', a.x[0], 'num4'], ['X2', a.x[1], 'num4'], ['X3', a.x[2], 'num4'], ['X4', a.x[3], 'num4'], ['X5', a.x[4], 'num4']]; } },
];
export const METRIC = Object.fromEntries(METRICS.map((m) => [m.id, m]));

/** Zone of an Altman score for a period: 'distress' | 'grey' | 'safe' | null. */
export const altmanZone = (p, variant = 'zdouble') => R.altman(p, variant).zone;

/** Every metric for every year: { id: [values by year] }, with 'unavailable' reasons where an input is missing. */
export function metricTable(H) {
  const out = {};
  for (const m of METRICS) {
    out[m.id] = H.map((_, i) => { let v; try { v = m.value(H, i); } catch { v = NaN; } return v; });
  }
  return out;
}
/** Why a metric is unavailable for a year: the inputs that are missing. */
export function missingInputs(m, H, i) {
  let vars = []; try { vars = m.vars(H, i); } catch { return ['its inputs']; }
  return vars.filter(([, v]) => !fin(v)).map(([label]) => label.replace(/\s*\(.*\)$/, ''));
}

/** A plain-language reading of financial health from the latest year: [{ kind: good|warn|bad, title, text }]. */
export function healthSummary(H) {
  const out = [], L = H[H.length - 1], P = H.length > 1 ? H[H.length - 2] : null;
  const push = (kind, title, text) => out.push({ kind, title, text });
  const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`, x = (v, d = 1) => `${v.toFixed(d)}×`;
  const s = L.ratios.solvency, l = L.ratios.liquidity;
  if (fin(L.margins.net)) push(L.margins.net > 0.05 ? 'good' : L.margins.net > 0 ? 'warn' : 'bad', L.margins.net > 0 ? 'Profitable.' : 'Loss-making.', `Net margin ${pc(L.margins.net)} in ${L.year}${P && fin(P.margins.net) ? `, ${L.margins.net >= P.margins.net ? 'up' : 'down'} from ${pc(P.margins.net)}` : ''}.`);
  if (fin(l.current)) push(l.current >= 1.5 ? 'good' : l.current >= 1 ? 'warn' : 'bad', l.current >= 1 ? 'Short-term obligations are covered.' : 'Current liabilities exceed current assets.', `Current ratio ${x(l.current, 2)}${fin(l.quick) ? `, quick ratio ${x(l.quick, 2)}` : ''}.`);
  if (fin(s.netDebtToEbitda)) push(s.netDebtToEbitda < 2 ? 'good' : s.netDebtToEbitda < 3.5 ? 'warn' : 'bad', s.netDebtToEbitda < 0 ? 'Net cash.' : s.netDebtToEbitda < 2 ? 'Moderate leverage.' : s.netDebtToEbitda < 3.5 ? 'Leverage is elevated.' : 'Heavily indebted.', `Net debt is ${x(s.netDebtToEbitda)} EBITDA${fin(s.interestCoverage) ? ` and EBIT covers interest ${x(s.interestCoverage)}` : ''}.`);
  else if (fin(s.interestCoverage)) push(s.interestCoverage > 4 ? 'good' : s.interestCoverage > 1.5 ? 'warn' : 'bad', 'Interest cover.', `EBIT covers interest ${x(s.interestCoverage)}.`);
  if (fin(L.drivers.cashConversion) && fin(L.p.netIncome) && L.p.netIncome > 0) push(L.drivers.cashConversion >= 0.9 ? 'good' : L.drivers.cashConversion >= 0.6 ? 'warn' : 'bad', L.drivers.cashConversion >= 0.9 ? 'Profit arrives as cash.' : 'Profit is ahead of cash.', `Operating cash flow was ${x(L.drivers.cashConversion, 2)} net income${fin(L.p.fcf) ? `; free cash flow ${L.p.fcf >= 0 ? 'positive' : 'negative'}` : ''}.`);
  const z = R.altman(L.p, 'zdouble');
  if (z.score !== null) push(z.zone === 'safe' ? 'good' : z.zone === 'grey' ? 'warn' : 'bad', `Altman Z″ in the ${z.zone} zone.`, `Score ${z.score.toFixed(2)} (below 1.1 distress, above 2.6 safe). A screen, not a forecast of failure.`);
  return out;
}
