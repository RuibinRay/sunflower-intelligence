// valuation-report.js — the automated company valuation report: a rule-based narrative engine that turns the
// engine's results into twelve sections of explained figures. Every sentence is produced by a rule tied to a computed
// number; nothing is written that the model did not calculate. Blocks carry a `tag` saying what kind of evidence they
// are: 'verified' (entered or sourced financial data), 'assumption' (set by the user), 'estimate' (derived by the
// engine) or 'interpretation' (the analyst's reading). Pure functions; the page renders the blocks and charts.
import * as V from './valuation.js?v=31';
import * as F from './format.js?v=31';

const fin = V.fin;
export const TAGS = { verified: 'Verified financial data', assumption: 'Assumption', estimate: 'Estimate (derived by the model)', interpretation: 'Analyst interpretation' };

/** Formatting bound to the project's currency and unit. */
export function formatter(project) {
  const cur = project.meta?.currency || 'USD', unit = project.meta?.unit || 1e6;
  const suf = unit === 1e9 ? 'bn' : unit === 1e6 ? 'm' : unit === 1e3 ? 'k' : '';
  const unitLabel = project.meta?.unitLabel || (unit === 1e9 ? 'billions' : unit === 1e6 ? 'millions' : unit === 1e3 ? 'thousands' : 'whole units');
  return {
    cur, unit, suf, unitLabel,
    money: (v, d = 1) => (fin(v) ? `${cur} ${F.num(v, d)}${suf}` : '—'),
    perShare: (v) => (fin(v) ? `${cur} ${F.num(v, 2)}` : '—'),
    pct: (v, d = 1) => F.pct(v, d),
    pts: (v, d = 1) => (fin(v) ? `${F.signed(v * 100, d)} pts` : '—'),
    num: (v, d = 1) => F.num(v, d),
    x: (v, d = 1) => (fin(v) ? `${F.num(v, d)}×` : '—'),
    int: (v) => F.int(v),
  };
}

const p = (text, tag = null) => ({ type: 'p', text, tag });
const h3 = (text) => ({ type: 'h3', text });
const table = (caption, columns, rows, tag = null) => ({ type: 'table', caption, columns, rows, tag });
const kv = (rows, tag = null) => ({ type: 'kv', rows, tag });
const list = (items, tag = null) => ({ type: 'list', items, tag });
const figure = (chart, caption) => ({ type: 'figure', chart, caption });
const formula = (text, note = '') => ({ type: 'formula', text, note });
const warn = (w) => ({ type: 'warn', kind: w.kind, title: w.title, text: w.text });
const sec = (id, title, blocks) => ({ id, title, blocks: blocks.filter(Boolean) });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const dir = (v, up = 'rose', down = 'fell', flat = 'was flat') => (!fin(v) ? '' : v > 0.005 ? up : v < -0.005 ? down : flat);
const span = (xs) => ({ lo: Math.min(...xs), hi: Math.max(...xs) });
const nz = (v, d = 0) => (fin(v) ? v : d);

/** The terminal growth (or WACC) at which the DCF reproduces the share price: what the market is pricing in. */
export function impliedTerminalGrowth(project, A, price) {
  if (!fin(price) || price <= 0) return NaN;
  const f = (g) => { const r = V.dcf(project, { ...A, terminal: { ...A.terminal, method: 'perpetuity', growth: g } }); return r.ok && fin(r.perShare) ? r.perShare - price : NaN; };
  let lo = -0.05, hi = Math.min(0.08, V.costOfCapitalFor(project, A).wacc - 0.005);
  const flo = f(lo), fhi = f(hi);
  if (!fin(flo) || !fin(fhi) || Math.sign(flo) === Math.sign(fhi)) return NaN;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, fm = f(m); if (!fin(fm)) return NaN; if (Math.sign(fm) === Math.sign(flo)) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
export function impliedWacc(project, A, price) {
  if (!fin(price) || price <= 0) return NaN;
  const f = (w) => { const r = V.dcf(project, { ...A, discount: { ...A.discount, mode: 'direct', direct: w } }); return r.ok && fin(r.perShare) ? r.perShare - price : NaN; };
  let lo = Math.max(0.01, A.terminal.growth + 0.005), hi = 0.35;
  const flo = f(lo), fhi = f(hi);
  if (!fin(flo) || !fin(fhi) || Math.sign(flo) === Math.sign(fhi)) return NaN;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, fm = f(m); if (!fin(fm)) return NaN; if (Math.sign(fm) === Math.sign(flo)) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** Rule-based reading of the historical statements: growth, margins, cash conversion, leverage, liquidity, returns.
 *  H is V.historical(project); d an optional DCF result (for the cost of capital). Shared by the valuation report and
 *  the Company Intelligence dashboard, so both say the same thing about the same numbers. */
export function historyNarrative(f, H, d = null) {
  const first = H[0], last = H[H.length - 1], n = H.length;
  const cagr = n >= 2 ? V.fin(last.p.revenue) && V.fin(first.p.revenue) && first.p.revenue > 0 ? (last.p.revenue / first.p.revenue) ** (1 / (last.year - first.year)) - 1 : NaN : NaN;
  const mFirst = first.margins.ebitda, mLast = last.margins.ebitda;
  const marginMove = fin(mFirst) && fin(mLast) ? mLast - mFirst : NaN;
  const lev = last.ratios.solvency.netDebtToEbitda, levFirst = first.ratios.solvency.netDebtToEbitda;
  const histParas = [];
  if (n >= 2) {
    histParas.push(`Revenue ${dir(cagr, 'grew', 'declined')} from ${f.money(first.p.revenue)} in ${first.year} to ${f.money(last.p.revenue)} in ${last.year}, a compound rate of ${f.pct(cagr)} a year.`);
    if (fin(marginMove)) {
      if (cagr > 0.005 && marginMove < -0.005) histParas.push(`Over the same years the EBITDA margin fell from ${f.pct(mFirst)} to ${f.pct(mLast)}: sales grew, but costs grew faster, so operating profit rose more slowly than revenue${fin(last.growth.ebitda) && last.growth.ebitda < 0 ? ' and fell in the latest year' : ''}. The question for the forecast is whether that squeeze is cyclical or structural.`);
      else if (cagr > 0.005 && marginMove > 0.005) histParas.push(`The EBITDA margin widened from ${f.pct(mFirst)} to ${f.pct(mLast)}, so operating profit grew faster than sales: the business gained operating leverage or pricing power as it grew.`);
      else if (cagr <= 0.005 && marginMove < -0.005) histParas.push(`With revenue ${dir(cagr, 'barely growing', 'shrinking', 'flat')} and the EBITDA margin down from ${f.pct(mFirst)} to ${f.pct(mLast)}, profit fell on both counts; the forecast should not assume a recovery without a reason.`);
      else histParas.push(`The EBITDA margin held between ${f.pct(Math.min(mFirst, mLast))} and ${f.pct(Math.max(mFirst, mLast))}, so profit tracked revenue.`);
    }
    const dips = H.slice(1).filter((h) => fin(h.margins.ebitda) && fin(h.margins.gross) && h.margins.ebitda < (H[H.indexOf(h) - 1]?.margins.ebitda ?? h.margins.ebitda) - 0.015);
    if (dips.length) histParas.push(`The margin dipped in ${dips.map((h) => h.year).join(' and ')}${dips.some((h) => h.margins.gross < H[H.indexOf(h) - 1].margins.gross - 0.01) ? ', mostly at the gross-margin line (input costs or pricing) rather than in overheads' : ', mostly in operating expenses rather than the cost of goods'}.`);
  } else histParas.push(`Only ${last.year} is available, so no trend can be read; growth and margin assumptions rest on judgement.`);
  if (fin(last.drivers.cashConversion)) histParas.push(`Cash conversion is ${last.drivers.cashConversion >= 0.9 ? 'strong' : last.drivers.cashConversion >= 0.6 ? 'moderate' : 'weak'}: operating cash flow was ${f.x(last.drivers.cashConversion, 2)} net income in ${last.year}${last.drivers.cashConversion < 0.6 ? ', which means profit is being absorbed by working capital or other accruals and should be investigated before it is forecast as cash' : ''}.`);
  if (fin(lev)) {
    const levText = lev < 1 ? 'low' : lev < 2.5 ? 'moderate' : lev < 4 ? 'high' : 'very high';
    histParas.push(`Net debt stood at ${f.x(lev)} EBITDA at the end of ${last.year} (${levText})${fin(levFirst) && n >= 2 ? `, ${lev > levFirst + 0.2 ? `up from ${f.x(levFirst)} in ${first.year}: leverage has risen, so a weak year now leaves less room before covenants and refinancing become a concern, and the cost of new debt is likely to be higher` : lev < levFirst - 0.2 ? `down from ${f.x(levFirst)} in ${first.year}: the balance sheet has been strengthening` : `little changed from ${first.year}`}` : ''}. Interest cover is ${f.x(last.ratios.solvency.interestCoverage)}.`);
  }
  if (fin(last.ratios.liquidity.current)) histParas.push(`Liquidity: the current ratio is ${f.num(last.ratios.liquidity.current, 2)} and the quick ratio ${f.num(last.ratios.liquidity.quick, 2)}.`);
  if (fin(last.drivers.roic)) histParas.push(`Return on invested capital was ${f.pct(last.drivers.roic)} in ${last.year}${d?.ok ? `, ${last.drivers.roic > d.r + 0.02 ? 'above' : last.drivers.roic < d.r - 0.02 ? 'below' : 'close to'} the ${f.pct(d.r, 2)} cost of capital${last.drivers.roic > d.r + 0.02 ? ', so growth adds value' : last.drivers.roic < d.r - 0.02 ? ', so growth destroys value until returns improve' : ''}` : ''}.`);

  return { paras: histParas, cagr, mFirst, mLast, marginMove, lev, levFirst };
}

/** Sources cited in the report and the tutorials (verified 5 November 2026). */
export const SOURCES = [
  { id: 'hbs-value', title: 'How to Value a Company: 6 Methods and Examples', author: 'Brian Misamore', publisher: 'Harvard Business School Online', date: 'Updated 23 August 2024 (first published 21 April 2017)', url: 'https://online.hbs.edu/blog/post/how-to-value-a-company' },
  { id: 'hbs-dcf', title: 'Discounted Cash Flow (DCF) Formula: What It Is & How to Use It', author: 'Brad Einstein', publisher: 'Harvard Business School Online', date: 'Updated 4 September 2026 (first published 4 March 2025)', url: 'https://online.hbs.edu/blog/post/discounted-cash-flow' },
  { id: 'hbs-health', title: '4 Steps to Determine the Financial Health of Your Company', author: 'Tim Stobierski', publisher: 'Harvard Business School Online', date: '18 June 2020', url: 'https://online.hbs.edu/blog/post/how-to-determine-the-financial-health-of-a-company' },
  { id: 'inv-valuation', title: 'Business Valuation: 6 Methods for Valuing a Company', author: 'Adam Hayes (reviewed by David Kindness)', publisher: 'Investopedia', date: 'Updated 9 June 2026', url: 'https://www.investopedia.com/terms/b/business-valuation.asp' },
  { id: 'inv-pitfalls', title: 'Avoid Common Pitfalls in Discounted Cash Flow (DCF) Analysis', author: 'Troy Segal (reviewed by Thomas Brock)', publisher: 'Investopedia', date: 'Updated 3 September 2026', url: 'https://www.investopedia.com/investing/pitfalls-of-discounted-cash-flow-analysis/' },
  { id: 'inv-qual', title: 'How to Use Qualitative Factors in Fundamental Analysis', author: 'Brian Beers (reviewed by Charlene Rhinehart)', publisher: 'Investopedia', date: 'Updated 19 October 2026', url: 'https://www.investopedia.com/ask/answers/qualitative-factors-when-using-fundamental-analysis/' },
  { id: 'damodaran-book', title: 'Investment Valuation: Tools and Techniques for Determining the Value of Any Asset, 3rd edition', author: 'Aswath Damodaran', publisher: 'Wiley', date: '2012', url: 'https://pages.stern.nyu.edu/~adamodar/' },
  { id: 'damodaran-erp', title: 'Country Default Spreads and Risk Premiums (equity risk premium and country risk data)', author: 'Aswath Damodaran', publisher: 'NYU Stern', date: 'Last updated 5 January 2026', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html' },
  { id: 'cfa', title: 'Equity Asset Valuation, 4th edition (CFA Institute Investment Series)', author: 'Jerald E. Pinto et al.', publisher: 'Wiley / CFA Institute', date: '2020', url: 'https://www.cfainstitute.org/' },
  { id: 'mckinsey', title: 'Valuation: Measuring and Managing the Value of Companies, 7th edition', author: 'Tim Koller, Marc Goedhart and David Wessels (McKinsey & Company)', publisher: 'Wiley', date: '2020', url: 'https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/valuation-measuring-and-managing-the-value-of-companies' },
  { id: 'gordon', title: 'Capital Equipment Analysis: The Required Rate of Profit', author: 'Myron J. Gordon and Eli Shapiro', publisher: 'Management Science, 3(1), 102–110', date: '1956', url: 'https://doi.org/10.1287/mnsc.3.1.102' },
  { id: 'sharpe', title: 'Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk', author: 'William F. Sharpe', publisher: 'The Journal of Finance, 19(3), 425–442', date: '1964', url: 'https://doi.org/10.1111/j.1540-6261.1964.tb02865.x' },
  { id: 'mm', title: 'Corporate Income Taxes and the Cost of Capital: A Correction', author: 'Franco Modigliani and Merton H. Miller', publisher: 'The American Economic Review, 53(3), 433–443', date: '1963', url: 'https://www.jstor.org/stable/1809167' },
  { id: 'sec-api', title: 'EDGAR Application Programming Interfaces (company facts, company concept, frames)', author: 'U.S. Securities and Exchange Commission', publisher: 'SEC.gov', date: 'Accessed 5 November 2026', url: 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces' },
  { id: 'sec-access', title: 'Accessing EDGAR Data (fair access policy)', author: 'U.S. Securities and Exchange Commission', publisher: 'SEC.gov', date: 'Accessed 5 November 2026', url: 'https://www.sec.gov/os/accessing-edgar-data' },
  { id: 'fasb-350', title: 'ASC 350, Intangibles — Goodwill and Other', author: 'Financial Accounting Standards Board', publisher: 'FASB Accounting Standards Codification', date: 'Current', url: 'https://asc.fasb.org/' },
  { id: 'ifrs-16', title: 'IFRS 16 Leases', author: 'IFRS Foundation', publisher: 'IFRS Accounting Standards', date: 'Effective 1 January 2019', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/' },
];

/**
 * Builds the report. `all` is valueAll()'s output; extra: { validation, historical, guide, mc, options: { title, analyst, comments } }.
 */
export function buildReport(project, A, all, extra = {}) {
  const f = formatter(project);
  const meta = project.meta || {}, options = extra.options || {};
  const R = all.results || {}, d = R.dcf, scen = all.scenarios, comps = R.comps, ddm = R.ddm, asset = R.asset, fe = R.fcfe, so = R.sotp, ea = R.earnings, vc = R.vc;
  const H = extra.historical || V.historical(project);
  const validation = extra.validation || V.validate(project);
  const guide = extra.guide || V.modelGuide(V.profileOf(project));
  const last = H[H.length - 1], first = H[0], n = H.length;
  const { m: mk } = V.market(project);
  const methods = Object.entries(project.models || {}).filter(([k, v]) => v && R[k]).map(([k]) => V.MODELS[k].name);
  const enabledOk = Object.keys(R).filter((k) => R[k]?.ok);
  const name = meta.name || 'The company';
  const unitNote = `${f.cur} ${f.unitLabel}`;
  const sourceKind = project.source?.kind || 'manual';
  const dataTag = sourceKind === 'example' ? 'verified' : 'verified';
  const dataLabel = sourceKind === 'edgar' ? `financial statements from SEC EDGAR (${project.source?.note || ''})` : sourceKind === 'upload' ? `financial statements uploaded by the analyst (${project.source?.document || 'file'})` : sourceKind === 'example' ? 'the built-in fictional example statements' : 'financial statements entered by the analyst';

  const { paras: histParas, cagr, mFirst, mLast, marginMove, lev, levFirst } = historyNarrative(f, H, d);
  const histTable = table(`Historical statements, ${unitNote}`, [{ label: 'Line' }, ...H.map((h) => ({ label: String(h.year), num: true }))],
    [['Revenue', ...H.map((h) => f.num(h.p.revenue))], ['Revenue growth', ...H.map((h) => f.pct(h.growth.revenue))], ['Gross margin', ...H.map((h) => f.pct(h.margins.gross))], ['EBITDA', ...H.map((h) => f.num(h.p.ebitda))], ['EBITDA margin', ...H.map((h) => f.pct(h.margins.ebitda))], ['EBIT', ...H.map((h) => f.num(h.p.ebit))], ['Net income', ...H.map((h) => f.num(h.p.netIncome))], ['Net margin', ...H.map((h) => f.pct(h.margins.net))], ['Operating cash flow', ...H.map((h) => f.num(h.p.cfo))], ['Capital expenditure', ...H.map((h) => f.num(h.p.capex))], ['Free cash flow', ...H.map((h) => f.num(h.p.fcf))], ['Net debt', ...H.map((h) => f.num(h.p.netDebt))], ['Net debt / EBITDA', ...H.map((h) => f.x(h.ratios.solvency.netDebtToEbitda))], ['Equity (book)', ...H.map((h) => f.num(h.p.equity))], ['Return on equity', ...H.map((h) => f.pct(h.ratios.profitability.roe))], ['Return on invested capital', ...H.map((h) => f.pct(h.drivers.roic))]], 'verified');

  // ---------------------------------------------------------------- forecast narrative
  const fcParas = [];
  if (d?.ok) {
    const gAvg = V.mean(d.rows.map((x) => x.growth)), mAvg = V.mean(d.rows.map((x) => x.margin));
    fcParas.push(`Revenue is forecast to ${dir(gAvg, 'grow', 'decline')} at an average ${f.pct(Math.abs(gAvg))} a year over ${d.N} years, ${fin(cagr) ? (gAvg > cagr + 0.01 ? `faster than the ${f.pct(cagr)} achieved historically, which needs a reason (new capacity, pricing, acquisitions)` : gAvg < cagr - 0.01 ? `slower than the ${f.pct(cagr)} achieved historically, a cautious path` : `in line with the ${f.pct(cagr)} achieved historically`) : 'with no multi-year history to compare against'}, ending at ${f.pct(d.rows[d.N - 1].growth)} in the final year${d.assumptions.terminal.method === 'perpetuity' ? ` before ${f.pct(d.assumptions.terminal.growth)} growth forever` : ''}.`);
    fcParas.push(`The EBITDA margin is assumed at ${f.pct(mAvg)} on average, ${fin(mLast) ? (mAvg > mLast + 0.01 ? `above the latest ${f.pct(mLast)}: the forecast assumes margin recovery or expansion` : mAvg < mLast - 0.01 ? `below the latest ${f.pct(mLast)}: the forecast assumes margin pressure` : `close to the latest ${f.pct(mLast)}`) : 'set by the analyst'}.`);
    const capexAvg = V.mean(d.rows.map((x) => x.capex)), daAvg = V.mean(d.rows.map((x) => x.da));
    fcParas.push(`Capital expenditure averages ${f.money(capexAvg)} a year against depreciation of ${f.money(daAvg)}: ${capexAvg > daAvg * 1.1 ? 'the company invests more than it depreciates, consistent with growth' : capexAvg < daAvg * 0.9 ? 'spending below depreciation means the asset base shrinks, which is hard to square with growth' : 'investment roughly maintains the asset base'}. Working capital is held at ${f.pct(d.rows[0].nwc / d.rows[0].revenue)} of revenue, so growth ${d.rows.some((x) => x.dNwc > 0) ? 'absorbs cash each year' : 'releases cash'}.`);
    fcParas.push(`Free cash flow to the firm goes from ${f.money(d.rows[0].fcff)} in ${d.rows[0].year} to ${f.money(d.rows[d.N - 1].fcff)} in ${d.rows[d.N - 1].year}.`);
  }
  const fcTable = d?.ok ? table(`Forecast, ${unitNote}`, [{ label: 'Line' }, ...d.rows.map((x) => ({ label: String(x.year), num: true }))],
    [['Revenue', ...d.rows.map((x) => f.num(x.revenue))], ['Growth', ...d.rows.map((x) => f.pct(x.growth))], ['EBITDA', ...d.rows.map((x) => f.num(x.ebitda))], ['EBITDA margin', ...d.rows.map((x) => f.pct(x.margin))], ['D&A', ...d.rows.map((x) => f.num(x.da))], ['EBIT', ...d.rows.map((x) => f.num(x.ebit))], ['Tax on EBIT', ...d.rows.map((x) => f.num(x.tax))], ['NOPAT', ...d.rows.map((x) => f.num(x.nopat))], ['Capital expenditure', ...d.rows.map((x) => f.num(x.capex))], ['Change in working capital', ...d.rows.map((x) => f.num(x.dNwc))], ['Free cash flow to the firm', ...d.rows.map((x) => f.num(x.fcff))], ['Discount factor', ...d.rows.map((x) => f.num(x.df, 4))], ['Present value', ...d.rows.map((x) => f.num(x.pv))]], 'estimate') : null;

  // ---------------------------------------------------------------- methodology
  const methodBlocks = [];
  if (d?.ok) {
    methodBlocks.push(h3('Discounted cash flow (free cash flow to the firm at WACC)'));
    methodBlocks.push(p(`Free cash flow to the firm is the cash left after taxes and reinvestment and before any payment to lenders or shareholders, so it is discounted at the blended cost of all capital, the WACC. Discounting it gives enterprise value; subtracting debt and other claims and adding cash gives equity value.`, 'interpretation'));
    methodBlocks.push(formula('FCFF = EBIT × (1 − tax rate) + D&A − capital expenditure − increase in net working capital', 'the operating profit after tax, with the non-cash charge added back and investment taken out'));
    methodBlocks.push(formula('Enterprise value = Σ FCFFₜ ÷ (1 + WACC)ᵗ + terminal value ÷ (1 + WACC)ᴺ', `terminal value ${d.assumptions.terminal.method === 'exit' ? `= year-N ${d.assumptions.terminal.multipleBasis.toUpperCase()} × exit multiple` : '= FCFFₙ × (1 + g) ÷ (WACC − g), the growing-perpetuity (Gordon) formula'}${d.assumptions.midYear ? '; cash flows are discounted at t − ½ (mid-year convention)' : ''}`));
    methodBlocks.push(formula('WACC = E/V × kₑ + D/V × k_d × (1 − t),  kₑ = r_f + β × ERP', `${d.cc.how}; cost of equity ${f.pct(d.cc.ke, 2)}, after-tax cost of debt ${f.pct(d.cc.kdAfter, 2)}, weights ${f.pct(d.cc.we, 0)} equity and ${f.pct(d.cc.wd, 0)} debt`));
    methodBlocks.push(kv([['Discount rate (WACC)', f.pct(d.r, 2)], ['Forecast horizon', `${d.N} years`], ['Terminal value', d.tvHow], ['Equity bridge', `less debt ${f.money(d.debt)}${d.leases ? ` and leases ${f.money(d.leases)}` : ''}, preferred ${f.money(d.preferred)}, minority interest ${f.money(d.minority)}; plus cash ${f.money(d.cash)}`]], 'assumption'));
    methodBlocks.push(p('Limitations: the result depends on forecasts whose uncertainty grows with every year, on a discount rate that is estimated rather than observed, and on a terminal value that usually dominates. Small changes in WACC or terminal growth move the answer a lot, which is why the sensitivity tables and scenarios are part of this report.', 'interpretation'));
  }
  if (fe?.ok) { methodBlocks.push(h3('Free cash flow to equity at the cost of equity')); methodBlocks.push(formula('FCFE = net income + D&A − capital expenditure − increase in NWC + net borrowing', `net borrowing funds ${f.pct(fe.debtFunding, 0)} of net investment, so the debt ratio stays roughly constant; discounted at the cost of equity ${f.pct(fe.ke, 2)}`)); methodBlocks.push(p('FCFE is the cash available to shareholders after lenders are paid and new debt raised, so it is discounted at the cost of equity alone and gives equity value directly. It should agree with the FCFF model when leverage is stable; a gap points to the borrowing assumption.', 'interpretation')); }
  if (comps?.ok) { methodBlocks.push(h3('Comparable companies')); methodBlocks.push(p(`Market multiples of ${comps.peers.length} listed peers, applied to ${name}'s own revenue, EBITDA, EBIT, earnings, book equity and free cash flow. Enterprise-value multiples give enterprise value, which the bridge turns into equity; equity multiples give equity directly. The ${comps.stat} is the central estimate and the 25th to 75th percentiles the range.`, 'interpretation')); methodBlocks.push(p('Limitations: multiples carry the market’s mood and the peers’ own growth, margins and risk. A lower multiple than peers does not by itself mean the company is cheap; it may simply grow more slowly, earn less or carry more risk.', 'interpretation')); }
  if (ddm?.ok) { methodBlocks.push(h3('Dividend discount models')); methodBlocks.push(formula('P₀ = D₁ ÷ (kₑ − g)', 'Gordon growth: next year’s dividend capitalised at the cost of equity less growth (Gordon and Shapiro, 1956)')); methodBlocks.push(p(`A multi-stage version grows the dividend at ${f.pct(project.ddm?.g1 ?? 0.05)} for ${project.ddm?.years ?? 5} years and then at ${f.pct(project.ddm?.gT ?? A.terminal.growth)} forever. Dividend models suit companies whose dividends track what they could pay; where payout is low or erratic they understate value.`, 'interpretation')); }
  if (asset?.ok) { methodBlocks.push(h3('Asset-based values')); methodBlocks.push(p(`Book value is shareholders’ equity as reported; tangible book value removes goodwill and intangibles; the adjusted net asset value restates assets at the analyst’s estimates of market value; the liquidation scenarios apply recovery rates to each asset class and deduct liabilities and selling costs of ${f.pct(asset.costs, 0)}. Accounting value records what was paid, not what the assets can earn, so these are floors rather than targets for a going concern.`, 'interpretation')); }
  if (so?.ok) { methodBlocks.push(h3('Sum of the parts')); methodBlocks.push(p(`Each segment is valued on its own multiple and the parts are summed with corporate costs, then the equity bridge is applied. The implied blended multiple is ${f.x(so.blended)} EBITDA.`, 'interpretation')); }
  if (ea?.ok) { methodBlocks.push(h3('Earnings-based values')); methodBlocks.push(formula('Capitalised earnings = normalised earnings ÷ (kₑ − g);  Earnings-power value = EBIT × (1 − t) ÷ WACC', 'the second assumes no growth and so is a floor for a growing company')); }
  if (vc?.ok) { methodBlocks.push(h3('Venture-capital method')); methodBlocks.push(formula('Post-money value = exit value ÷ (1 + target return)ⁿ;  ownership required = investment ÷ post-money', `exit value ${f.money(vc.exitValue)} in year ${project.vc?.exitYear}, target return ${f.pct(project.vc?.targetReturn, 0)}`)); }
  methodBlocks.push(h3('Why these models'));
  methodBlocks.push(list(guide.filter((g) => project.models?.[g.id]).map((g) => `${g.name}: ${g.fit}. ${g.why}`), 'interpretation'));
  const skipped = guide.filter((g) => !project.models?.[g.id] && (g.fit === 'unsuitable' || g.fit === 'recommended'));
  if (skipped.length) methodBlocks.push(p(`Not used: ${skipped.map((g) => `${g.name} (${g.fit}: ${g.why.split('.')[0]}.)`).join(' ')}`, 'interpretation'));

  // ---------------------------------------------------------------- results
  const resBlocks = [];
  const perShareRows = [];
  if (d?.ok) {
    resBlocks.push(kv([['Sum of discounted free cash flows', f.money(d.sumPv)], ['Terminal value (undiscounted)', f.money(d.tv)], ['Present value of terminal value', `${f.money(d.pvTV)} (${f.pct(d.tvShare, 0)} of enterprise value)`], ['Enterprise value', f.money(d.ev)], ['Less debt, leases, preferred, minority and other claims', f.money(-(d.debt + d.leases + d.preferred + d.minority + d.other))], ['Plus cash and non-operating assets', f.money(d.cash + d.nonOp)], ['Equity value', f.money(d.equity)], ['Shares', fin(d.shares) ? `${f.num(d.shares, 1)} (${f.unitLabel})` : '—'], ['Value per share (DCF)', f.perShare(d.perShare)], ['Share price', fin(d.price) ? `${f.perShare(d.price)} (${mk.priceDate || meta.valuationDate || 'date not given'})` : 'not given'], ['Difference to the price', fin(d.upside) ? F.signed(d.upside * 100, 1) + '%' : '—']], 'estimate'));
    resBlocks.push(figure('bridge', 'From enterprise value to equity value'));
    if (fin(d.tvShare) && d.tvShare > 0.6) resBlocks.push(p(`${f.pct(d.tvShare, 0)} of the enterprise value comes from the terminal value, that is, from the years after the ${d.N}-year forecast. The valuation therefore depends mostly on the long-run assumptions: ${d.assumptions.terminal.method === 'exit' ? `the ${f.x(d.assumptions.terminal.multiple)} exit multiple, which implies ${f.pct(d.impliedGrowth)} growth forever` : `${f.pct(d.assumptions.terminal.growth)} growth forever at a ${f.pct(d.r, 2)} discount rate, which implies an exit multiple of ${f.x(d.impliedMultiple)} EBITDA${comps?.ok && fin(comps.table.find((t) => t.id === 'evEbitda')?.stats.median) ? ` against a peer median of ${f.x(comps.table.find((t) => t.id === 'evEbitda').stats.median)}` : ''}`}.`, 'interpretation'));
    perShareRows.push(['Discounted cash flow (base case)', f.perShare(d.perShare)]);
    d.warnings.forEach((w) => resBlocks.push(warn(w)));
  }
  if (fe?.ok) perShareRows.push(['Free cash flow to equity', f.perShare(fe.perShare)]);
  if (comps?.ok) { comps.table.filter((t) => !t.nm).forEach((t) => perShareRows.push([`${t.name} at the peer ${comps.stat} (${f.x(t.stats[comps.stat])})`, f.perShare(t.implied[comps.stat].perShare)])); }
  if (ddm?.ok) { if (ddm.gordon.ok) perShareRows.push(['Dividend discount, Gordon growth', f.perShare(ddm.gordon.value)]); if (ddm.multi.ok) perShareRows.push(['Dividend discount, multi-stage', f.perShare(ddm.multi.value)]); }
  if (asset?.ok) { perShareRows.push(['Book value', f.perShare(asset.perShare.book)], ['Tangible book value', f.perShare(asset.perShare.tangible)], ['Adjusted net asset value', f.perShare(asset.perShare.adjustedNav)], ['Orderly liquidation', f.perShare(asset.orderly.perShare)], ['Forced liquidation', f.perShare(asset.forced.perShare)]); }
  if (so?.ok) perShareRows.push(['Sum of the parts', f.perShare(so.perShare)]);
  if (ea?.ok) perShareRows.push(['Capitalised earnings', f.perShare(ea.perShare.capitalised)], ['Earnings-power value (no growth)', f.perShare(ea.perShare.epv)]);
  if (fin(mk.sharePrice)) perShareRows.push(['Market price', f.perShare(mk.sharePrice)]);
  resBlocks.push(table('Value per share by method', [{ label: 'Method' }, { label: `Per share, ${f.cur}`, num: true }], perShareRows, 'estimate'));
  resBlocks.push(figure('football', 'Valuation ranges by method (football field)'));
  // disagreement between methods
  const vals = [];
  if (d?.ok && fin(d.perShare)) vals.push({ k: 'DCF', v: d.perShare });
  if (fe?.ok && fin(fe.perShare)) vals.push({ k: 'FCFE', v: fe.perShare });
  if (comps?.ok && comps.range) vals.push({ k: 'comparables', v: comps.range.mid });
  if (ddm?.ok && ddm.multi.ok) vals.push({ k: 'dividend model', v: ddm.multi.value });
  if (ea?.ok && fin(ea.perShare.epv)) vals.push({ k: 'earnings-power value', v: ea.perShare.epv });
  if (so?.ok && fin(so.perShare)) vals.push({ k: 'sum of the parts', v: so.perShare });
  if (vals.length >= 2) {
    const hi = vals.reduce((a, b) => (b.v > a.v ? b : a)), lo = vals.reduce((a, b) => (b.v < a.v ? b : a));
    const ratio = lo.v > 0 ? hi.v / lo.v : Infinity;
    if (ratio > 1.3) {
      const why = [];
      if (hi.k === 'DCF' && lo.k === 'comparables') why.push('the DCF credits the company with its own forecast growth and margins while the market multiples price peers’ prospects and today’s sentiment; either the forecast is more optimistic than the market, or the market has not recognised the plan');
      if (lo.k === 'DCF' && hi.k === 'comparables') why.push('peers trade on richer multiples than the cash-flow forecast justifies; either the peers are not comparable (faster growth, higher margins) or the forecast is conservative');
      if (lo.k === 'earnings-power value') why.push('the earnings-power value assumes no growth, so the gap to the DCF is the value of growth; it is only worth that if returns stay above the cost of capital');
      if (lo.k === 'dividend model' || hi.k === 'dividend model') why.push('dividend models value only what is paid out; a low payout understates value and a high one overstates it');
      if (hi.k === 'FCFE' || lo.k === 'FCFE') why.push('the FCFE model depends on how much net investment is borrowed; a different debt-funding share moves it');
      if (hi.k === 'sum of the parts') why.push('segment multiples add up to more than the consolidated figure: a conglomerate discount, or segment multiples that are too generous');
      resBlocks.push(p(`The methods disagree materially: ${hi.k} gives ${f.perShare(hi.v)} per share while ${lo.k} gives ${f.perShare(lo.v)}, a ratio of ${f.x(ratio)}. Possible explanations: ${why.length ? why.join('; ') : 'the methods rest on different assumptions about growth and risk'}. The conclusion weighs them rather than averaging them.`, 'interpretation'));
    } else resBlocks.push(p(`The methods broadly agree: the central estimates lie between ${f.perShare(lo.v)} (${lo.k}) and ${f.perShare(hi.v)} (${hi.k}).`, 'interpretation'));
  }
  if (comps?.ok) {
    const ev = comps.table.find((t) => t.id === 'evEbitda');
    if (ev && fin(ev.own) && fin(ev.stats.median)) {
      const peerMargin = V.median(comps.peers.map((x) => (fin(x.ebitda) && fin(x.revenue) && x.revenue > 0 ? x.ebitda / x.revenue : NaN)));
      resBlocks.push(p(`${name} trades at ${f.x(ev.own)} EV/EBITDA against a peer median of ${f.x(ev.stats.median)}, a ${ev.own < ev.stats.median ? 'discount' : 'premium'} of ${f.pct(Math.abs(ev.own / ev.stats.median - 1), 0)}. ${ev.own < ev.stats.median ? 'A discount is not by itself undervaluation' : 'A premium is not by itself overvaluation'}: its EBITDA margin is ${f.pct(mLast)} against the peers’ median ${f.pct(peerMargin)}${fin(peerMargin) ? (mLast < peerMargin - 0.02 ? ', so part of the gap reflects weaker profitability' : mLast > peerMargin + 0.02 ? ', so the market is not paying for its stronger profitability, or expects it to fade' : ', so profitability does not explain the gap; growth or risk may') : ''}.`, 'interpretation'));
    }
  }

  // ---------------------------------------------------------------- scenarios and sensitivity
  const scBlocks = [];
  if (scen && d?.ok) {
    const S = scen.scenarios;
    scBlocks.push(table('Scenarios', [{ label: 'Scenario' }, { label: 'Growth shift', num: true }, { label: 'Margin shift', num: true }, { label: 'WACC shift', num: true }, { label: 'Terminal growth shift', num: true }, { label: 'Weight', num: true }, { label: 'Enterprise value', num: true }, { label: 'Per share', num: true }],
      ['bear', 'base', 'bull'].filter((k) => S[k]).map((k) => { const s = S[k]; return [s.name, f.pts(s.deltas.growth), f.pts(s.deltas.margin), f.pts(s.deltas.wacc, 2), f.pts(s.deltas.gT, 2), f.pct(s.weight, 0), s.result.ok ? f.money(s.result.ev) : s.result.error, s.result.ok ? f.perShare(s.result.perShare) : '—']; }), 'assumption'));
    const okS = ['bear', 'base', 'bull'].map((k) => S[k]).filter((s) => s?.result.ok);
    if (okS.length) scBlocks.push(p(`The value per share runs from ${f.perShare(Math.min(...okS.map((s) => s.result.perShare)))} in the bear case to ${f.perShare(Math.max(...okS.map((s) => s.result.perShare)))} in the bull case; weighting the scenarios ${okS.map((s) => `${f.pct(s.weight, 0)} ${s.name.toLowerCase()}`).join(', ')} gives ${f.perShare(scen.weighted)}.${S.bear?.risk.contributors.length ? ` The bear case also carries the risk effects from the register (${S.bear.risk.contributors.map((c) => c.name).join(', ')}): ${Object.entries(S.bear.risk.deltas).map(([k, v]) => `${{ growth: 'growth', margin: 'margin', capexPct: 'capex', nwcPct: 'working capital', kd: 'cost of debt' }[k]} ${f.pts(v, 2)}`).join(', ')}.` : ''}`, 'interpretation'));
    scBlocks.push(figure('scenarios', 'Scenario comparison'));
    // sensitivity tables
    const dW = [-0.02, -0.01, 0, 0.01, 0.02], dG = [-0.01, -0.005, 0, 0.005, 0.01];
    const grid = dW.map((dw) => dG.map((dg) => { const r = V.dcf(project, V.applyDeltas(A, { wacc: dw, gT: dg })); return r.ok ? r.perShare : NaN; }));
    scBlocks.push(table(`Sensitivity of value per share to WACC (rows) and terminal growth (columns)${d.assumptions.terminal.method === 'exit' ? ' (the terminal value uses an exit multiple, so the growth columns change only the FCFE and implied figures)' : ''}`, [{ label: 'WACC \\ g' }, ...dG.map((dg) => ({ label: f.pct(A.terminal.growth + dg), num: true }))], dW.map((dw, i) => [f.pct(d.r + dw, 2), ...grid[i].map((v) => f.perShare(v))]), 'estimate'));
    scBlocks.push(figure('sensitivity', 'WACC against terminal growth'));
    const dM = [-0.04, -0.02, 0, 0.02, 0.04], dGr = [-0.04, -0.02, 0, 0.02, 0.04];
    const grid2 = dM.map((dm) => dGr.map((dg) => { const r = V.dcf(project, V.applyDeltas(A, { margin: dm, growth: dg })); return r.ok ? r.perShare : NaN; }));
    scBlocks.push(table('Sensitivity of value per share to EBITDA margin (rows) and revenue growth (columns), shifts in points', [{ label: 'Margin \\ growth' }, ...dGr.map((dg) => ({ label: f.pts(dg, 0), num: true }))], dM.map((dm, i) => [f.pts(dm, 0), ...grid2[i].map((v) => f.perShare(v))]), 'estimate'));
    const wMove = Math.abs(nz(grid[1][2]) - nz(grid[3][2])) / 2, gMove = Math.abs(nz(grid[2][1]) - nz(grid[2][3])) / 2, mMove = Math.abs(nz(grid2[1][2]) - nz(grid2[3][2])) / 2, grMove = Math.abs(nz(grid2[2][1]) - nz(grid2[2][3])) / 2;
    const drivers = [['one point of WACC', wMove], ['half a point of terminal growth', gMove], ['two points of EBITDA margin', mMove], ['two points of revenue growth', grMove]].filter((x) => fin(x[1])).sort((a, b) => b[1] - a[1]);
    if (drivers.length) scBlocks.push(p(`Most influential: ${drivers.map(([k, v]) => `${k} moves the value by about ${f.perShare(v)} a share`).join('; ')}.`, 'interpretation'));
    if (extra.mc?.ok) { const mc = extra.mc; scBlocks.push(p(`Monte Carlo (${F.int(mc.n)} runs, seed ${mc.spec.seed}): growth and margin shifts drawn from normal distributions with standard deviations of ${f.pct(mc.spec.growth.sd)} and ${f.pct(mc.spec.margin.sd)} (correlation ${f.num(mc.spec.rho, 2)}), WACC from a normal with ${f.pct(mc.spec.wacc.sd, 2)}, terminal growth from a triangular distribution between ${f.pts(mc.spec.gT.lo)} and ${f.pts(mc.spec.gT.hi)}. The median is ${f.perShare(mc.p50)}; 90% of runs lie between ${f.perShare(mc.p5)} and ${f.perShare(mc.p95)}${fin(mc.belowPrice) ? `, and ${f.pct(mc.belowPrice, 0)} of runs fall below the share price` : ''}. These distributions are assumptions, not measurements: the spread shows how the chosen uncertainty propagates, not the true probability of outcomes.`, 'estimate')); scBlocks.push(figure('mc', 'Distribution of simulated values per share')); }
  }

  // ---------------------------------------------------------------- risks
  const risks = (project.risks || []).slice().sort((a, b) => V.riskScore(b) - V.riskScore(a));
  const rkBlocks = [];
  if (risks.length) {
    rkBlocks.push(table('Risk register', [{ label: 'Risk' }, { label: 'Category' }, { label: 'Likelihood', num: true }, { label: 'Severity', num: true }, { label: 'Score', num: true }, { label: 'Horizon' }, { label: 'Exposure', num: true }, { label: 'Effect on assumptions' }, { label: 'Scenario' }],
      risks.map((r) => [r.name, V.RISK_CATALOG.find((c) => c.id === r.category)?.name || r.category, String(r.likelihood), String(r.severity), String(V.riskScore(r)), V.HORIZONS.find((h) => h.id === r.horizon)?.name || r.horizon, fin(r.exposure) ? f.money(r.exposure) : '—', Object.entries(r.effect || {}).filter(([, v]) => fin(v) && v !== 0).map(([k, v]) => `${{ growth: 'growth', margin: 'margin', capexPct: 'capex', nwcPct: 'NWC', kd: 'cost of debt' }[k] || k} ${f.pts(v, 2)}`).join(', ') || 'none', r.applyTo === 'none' ? 'not applied' : cap(r.applyTo)]), 'assumption'));
    rkBlocks.push(figure('risk-matrix', 'Probability–impact matrix'));
    risks.forEach((r) => { rkBlocks.push(h3(`${r.name} (score ${V.riskScore(r)}, ${V.riskBand(V.riskScore(r))})`)); rkBlocks.push(p(`${r.description || 'No description given.'}${r.mitigation ? ` Mitigation: ${r.mitigation}` : ''}${r.evidence ? ` Evidence: ${r.evidence}` : ''}`, 'interpretation')); if (r.applyTo && r.applyTo !== 'none' && Object.values(r.effect || {}).some((v) => fin(v) && v !== 0)) rkBlocks.push(p(`In the ${r.applyTo} case this risk changes the forecast: ${Object.entries(r.effect).filter(([, v]) => fin(v) && v !== 0).map(([k, v]) => `${{ growth: 'revenue growth', margin: 'EBITDA margin', capexPct: 'capital expenditure', nwcPct: 'working capital', kd: 'the cost of debt' }[k] || k} by ${f.pts(v, 2)} a year`).join(', ')}. It does not add a premium to the discount rate: that would count the same risk twice.`, 'assumption')); });
    const flags = ['bear', 'base', 'bull'].flatMap((k) => V.riskEffects(risks, k).flags);
    if (flags.length) rkBlocks.push(warn({ kind: 'warn', title: 'Possible double counting.', text: flags.join(' ') }));
  } else rkBlocks.push(p('No risks have been entered in the register. The scenarios therefore use only their own parallel shifts.', 'interpretation'));

  // ---------------------------------------------------------------- interpretation and conclusion
  const intBlocks = [];
  if (d?.ok) {
    const impG = impliedTerminalGrowth(project, A, mk.sharePrice), impW = impliedWacc(project, A, mk.sharePrice);
    if (fin(d.upside)) intBlocks.push(p(`On the base case the DCF value of ${f.perShare(d.perShare)} is ${f.pct(Math.abs(d.upside), 0)} ${d.upside >= 0 ? 'above' : 'below'} the share price of ${f.perShare(mk.sharePrice)}. ${fin(impG) ? `For the price to be right under the same forecast, terminal growth would have to be ${f.pct(impG)} instead of ${f.pct(A.terminal.growth)}` : ''}${fin(impW) ? `${fin(impG) ? ', or' : 'For the price to be right under the same forecast,'} the discount rate ${f.pct(impW, 2)} instead of ${f.pct(d.r, 2)}` : ''}${fin(impG) || fin(impW) ? '. Whether those are more or less believable than the assumptions used here is the judgement the reader has to make.' : ''}`, 'interpretation'));
    else intBlocks.push(p(`No share price was given, so the value is not compared with the market. The base-case equity value is ${f.money(d.equity)}.`, 'interpretation'));
    const ups = [], downs = [];
    if (scen?.scenarios.bull?.result.ok) ups.push(`the bull case (${f.perShare(scen.scenarios.bull.result.perShare)}) assumes growth ${f.pts(scen.scenarios.bull.deltas.growth)} and margins ${f.pts(scen.scenarios.bull.deltas.margin)} above the base`);
    if (fin(last.drivers.roic) && d?.ok && last.drivers.roic > d.r) ups.push('returns above the cost of capital mean reinvestment creates value');
    if (comps?.ok && comps.range && comps.range.mid > d.perShare) ups.push(`peer multiples point higher (${f.perShare(comps.range.mid)})`);
    if (scen?.scenarios.bear?.result.ok) downs.push(`the bear case (${f.perShare(scen.scenarios.bear.result.perShare)}) combines slower growth, thinner margins and the register’s risk effects`);
    if (fin(d.tvShare) && d.tvShare > 0.7) downs.push('most of the value sits beyond the forecast horizon');
    if (fin(lev) && lev > 2.5) downs.push(`net debt of ${f.x(lev)} EBITDA leaves little room for a weak year`);
    if (asset?.ok && fin(asset.orderly.perShare)) downs.push(`in an orderly liquidation shareholders would receive about ${f.perShare(asset.orderly.perShare)} a share, the floor`);
    intBlocks.push(p(`Supporting the result: ${[fin(cagr) ? `a ${f.pct(cagr)} historical growth rate` : null, fin(mLast) ? `a latest EBITDA margin of ${f.pct(mLast)}` : null, `a ${f.pct(d.r, 2)} WACC built from a ${f.pct(A.discount.rf)} risk-free rate, beta ${f.num(A.discount.beta, 2)} and a ${f.pct(A.discount.erp)} equity risk premium`].filter(Boolean).join(', ')}.`, 'assumption'));
    if (ups.length) intBlocks.push(p(`Potential upside: ${ups.join('; ')}.`, 'interpretation'));
    if (downs.length) intBlocks.push(p(`Potential downside: ${downs.join('; ')}.`, 'interpretation'));
    intBlocks.push(p(`What could change the analysis: a different view of the terminal assumptions (they carry ${f.pct(d.tvShare, 0)} of the value); evidence on whether the margin trend is structural; the cost of capital if rates or the equity premium move; and any of the register’s risks crystallising. This report values the company on the stated assumptions; it is not a recommendation to buy, hold or sell, and it does not consider any reader’s circumstances.`, 'interpretation'));
  }
  const concBlocks = [];
  {
    const ff = all.football || [];
    if (ff.length) concBlocks.push(p(`Valuation range: ${ff.map((b) => `${b.label}: ${f.perShare(b.low)} to ${f.perShare(b.high)}`).join('; ')}.`, 'estimate'));
    if (d?.ok) concBlocks.push(p(`Central estimate: ${f.perShare(d.perShare)} a share (equity ${f.money(d.equity)}, enterprise value ${f.money(d.ev)})${scen && fin(scen.weighted) ? `; probability-weighted across the scenarios, ${f.perShare(scen.weighted)}` : ''}.`, 'estimate'));
    const unc = [];
    if (d?.ok && fin(d.tvShare)) unc.push(`terminal value (${f.pct(d.tvShare, 0)} of EV)`);
    unc.push('the discount rate, which is estimated rather than observed');
    if (comps?.ok && comps.peers.length < 4) unc.push('a thin peer set');
    if (n < 3) unc.push('a short financial history');
    concBlocks.push(p(`Major uncertainties: ${unc.join('; ')}.`, 'interpretation'));
    const need = [];
    const miss = V.missingFor(project, 'dcf');
    if (miss.missing.length) need.push(`missing inputs for the DCF: ${miss.missing.map(V.label).join(', ')}`);
    if (miss.optional.length) need.push(`optional inputs not given: ${miss.optional.map((k) => ({ sharesOutstanding: 'shares outstanding', sharePrice: 'share price', beta: 'beta' }[k] || V.label(k))).join(', ')}`);
    if (!(project.peers || []).length) need.push('a set of listed peers for the market cross-check');
    if (!(project.risks || []).length) need.push('a risk register with evidence');
    if (!project.source || project.source.kind === 'manual') need.push('source documents for the entered statements (annual reports or filings)');
    if (sourceKind === 'example') need.push('real statements: the figures here are the fictional example');
    need.push('segment disclosures, management guidance and the company’s own capital-allocation plan');
    concBlocks.push(p(`Information still needed: ${need.join('; ')}.`, 'interpretation'));
  }

  // ---------------------------------------------------------------- appendix
  const appBlocks = [];
  appBlocks.push(h3('Inputs as entered'));
  appBlocks.push(table(`Historical statements, ${unitNote} (lines as entered; derived lines marked)`, [{ label: 'Line' }, ...H.map((h) => ({ label: String(h.year), num: true }))],
    V.FIELDS.filter((fd) => H.some((h) => fin(h.p[fd.id]))).map((fd) => [`${fd.label}${H.some((h) => h.how[fd.id]) ? ' (derived)' : ''}`, ...H.map((h) => f.num(h.p[fd.id]))]), 'verified'));
  const derivations = H.flatMap((h) => Object.entries(h.how).map(([k, why]) => `${h.year}: ${V.label(k)} = ${why}`));
  if (derivations.length) { appBlocks.push(h3('Derived figures')); appBlocks.push(list(derivations, 'estimate')); }
  appBlocks.push(h3('Market inputs'));
  appBlocks.push(kv([['Share price', fin(mk.sharePrice) ? `${f.perShare(mk.sharePrice)}${mk.priceDate ? ` on ${mk.priceDate}` : ''}` : '—'], ['Shares outstanding', fin(mk.sharesOutstanding) ? `${f.num(mk.sharesOutstanding, 2)} ${f.unitLabel}` : '—'], ['Market capitalisation', f.money(mk.marketCap)], ['Enterprise value at market', f.money(mk.ev)], ['Beta', f.num(A.discount.beta, 2)], ['Risk-free rate', f.pct(A.discount.rf, 2)], ['Equity risk premium', f.pct(A.discount.erp, 2)], ['Pre-tax cost of debt', f.pct(A.discount.kd, 2)]], 'assumption'));
  appBlocks.push(h3('Assumptions by year'));
  if (d?.ok) appBlocks.push(table('Forecast drivers', [{ label: 'Driver' }, ...d.rows.map((x) => ({ label: String(x.year), num: true }))], [['Revenue growth', ...d.rows.map((x) => f.pct(x.growth, 2))], [`${A.marginBasis === 'ebit' ? 'EBIT' : 'EBITDA'} margin`, ...d.rows.map((x) => f.pct(A.marginBasis === 'ebit' ? x.ebit / x.revenue : x.margin, 2))], ['D&A % revenue', ...d.rows.map((x) => f.pct(x.da / x.revenue, 2))], ['Capex % revenue', ...d.rows.map((x) => f.pct(x.capex / x.revenue, 2))], ['NWC % revenue', ...d.rows.map((x) => f.pct(x.nwc / x.revenue, 2))], ['Tax rate', ...d.rows.map((x) => f.pct(x.taxRate, 2))]], 'assumption'));
  appBlocks.push(kv([['Terminal method', A.terminal.method === 'exit' ? `exit multiple ${f.x(A.terminal.multiple)} ${A.terminal.multipleBasis.toUpperCase()}` : `perpetual growth ${f.pct(A.terminal.growth, 2)}`], ['Mid-year convention', A.midYear ? 'yes' : 'no'], ['Tax on losses', A.taxLosses === 'credit' ? 'credited' : 'none (losses carry no tax benefit)'], ['Cost of capital', A.discount.mode === 'direct' ? `entered directly: ${f.pct(A.discount.direct, 2)}` : `built: ${d?.ok ? d.cc.how : ''}`], ['Leases in the bridge', A.bridge?.includeLeases ? 'counted as debt' : 'not counted as debt']], 'assumption'));
  if (comps?.ok) { appBlocks.push(h3('Comparable companies')); appBlocks.push(table(`Peers, ${unitNote}`, [{ label: 'Company' }, { label: 'Market cap', num: true }, { label: 'EV', num: true }, { label: 'Revenue', num: true }, { label: 'EBITDA', num: true }, { label: 'Net income', num: true }, ...comps.table.map((t) => ({ label: t.name, num: true }))], comps.peers.map((pe, i) => [pe.name, f.num(pe.marketCap), f.num(pe.ev), f.num(pe.revenue), f.num(pe.ebitda), f.num(pe.netIncome), ...comps.table.map((t) => (t.values[i] === null ? 'n/m' : f.x(t.values[i])))]), 'verified')); appBlocks.push(table('Peer multiples and implied values per share', [{ label: 'Multiple' }, { label: 'n', num: true }, { label: '25th', num: true }, { label: 'Median', num: true }, { label: 'Mean', num: true }, { label: '75th', num: true }, { label: `${name} today`, num: true }, { label: 'Implied low', num: true }, { label: 'Implied mid', num: true }, { label: 'Implied high', num: true }], comps.table.map((t) => [t.name, String(t.stats.n), f.x(t.stats.q1), f.x(t.stats.median), f.x(t.stats.mean), f.x(t.stats.q3), f.x(t.own), f.perShare(t.implied.q1.perShare), f.perShare(t.implied[comps.stat].perShare), f.perShare(t.implied.q3.perShare)]), 'estimate')); }
  if (asset?.ok) { appBlocks.push(h3('Asset-based detail')); appBlocks.push(table(`Liquidation scenarios, ${unitNote}`, [{ label: 'Asset' }, { label: 'Book', num: true }, { label: 'Orderly rate', num: true }, { label: 'Orderly', num: true }, { label: 'Forced rate', num: true }, { label: 'Forced', num: true }], [...asset.orderly.rows.map((r, i) => [r.label, f.num(r.book), f.pct(r.rate, 0), f.num(r.proceeds), f.pct(asset.forced.rows[i].rate, 0), f.num(asset.forced.rows[i].proceeds)]), ['Gross proceeds', '', '', f.num(asset.orderly.gross), '', f.num(asset.forced.gross)], ['Selling costs', '', '', f.num(-asset.orderly.cost), '', f.num(-asset.forced.cost)], ['Liabilities and other claims', '', '', f.num(-(asset.liabilities + asset.claims)), '', f.num(-(asset.liabilities + asset.claims))], ['Net to shareholders', '', '', f.num(asset.orderly.net), '', f.num(asset.forced.net)]], 'estimate')); }
  if (ddm?.ok && ddm.multi.ok) { appBlocks.push(h3('Dividend schedule')); appBlocks.push(table(`Dividends per share, ${f.cur}`, [{ label: 'Year' }, { label: 'Growth', num: true }, { label: 'Dividend', num: true }, { label: 'Discount factor', num: true }, { label: 'Present value', num: true }], [...ddm.multi.rows.map((r) => [String(r.t), f.pct(r.growth), f.num(r.dividend, 3), f.num(r.df, 4), f.num(r.pv, 3)]), ['Terminal', f.pct(project.ddm?.gT ?? A.terminal.growth), f.num(ddm.multi.tv, 2), '', f.num(ddm.multi.pvTV, 3)]], 'estimate')); }
  appBlocks.push(h3('Formulas used'));
  appBlocks.push(list(['FCFF = EBIT × (1 − t) + D&A − capital expenditure − ΔNWC', 'FCFE = net income + D&A − capital expenditure − ΔNWC + net borrowing', 'kₑ = r_f + β × ERP (CAPM); WACC = E/V × kₑ + D/V × k_d × (1 − t)', 'PV = Σ CFₜ ÷ (1 + r)ᵗ; terminal value (Gordon) = CFₙ × (1 + g) ÷ (r − g); terminal value (exit) = metricₙ × multiple', 'Equity value = enterprise value − debt − leases (if counted) − preferred − minority − other claims + cash and short-term investments + non-operating assets', 'Implied value from a multiple = peer multiple × the company’s own metric (then the equity bridge for EV multiples)', 'Gordon growth: P₀ = D₁ ÷ (kₑ − g); multi-stage: Σ Dₜ ÷ (1 + kₑ)ᵗ + [Dₙ × (1 + g) ÷ (kₑ − g)] ÷ (1 + kₑ)ⁿ', 'Tangible book value = equity − goodwill − intangibles; liquidation value = Σ assets × recovery rate − selling costs − liabilities', 'Earnings-power value = EBIT × (1 − t) ÷ WACC; capitalised earnings = earnings ÷ (kₑ − g)', 'VC method: post-money = exit value ÷ (1 + target return)ⁿ; ownership = investment ÷ post-money'], 'interpretation'));
  appBlocks.push(h3('Data source and mapping'));
  appBlocks.push(kv([['Source', dataLabel], ['Document', project.source?.document || '—'], ['Retrieved', project.source?.retrieved || '—'], ['Units', unitNote], ['Fiscal year end', meta.fiscalYearEnd || '—'], ...(project.source?.periods ? [['Filings', project.source.periods.map((pp) => `FY${pp.year}: ${pp.form || ''} filed ${pp.filed || ''} (${pp.accn || ''})`).join('; ')]] : []), ...(project.source?.tags ? [['XBRL tags', Object.entries(project.source.tags).map(([k, t]) => `${V.label(k)} ← ${t}`).join('; ')]] : []), ...(project.source?.mapping ? [['Uploaded lines mapped', project.source.mapping.map((mm) => `“${mm.label}” → ${V.label(mm.field)}`).join('; ')]] : [])], 'verified'));
  const vw = validation.filter((x) => x.level !== 'info');
  appBlocks.push(h3('Validation'));
  appBlocks.push(vw.length ? list(vw.map((x) => `${x.level === 'error' ? 'Error' : 'Warning'}: ${x.text}`), 'estimate') : p('No errors or warnings in the entered statements.', 'estimate'));
  appBlocks.push(h3('Sources'));
  appBlocks.push(list(SOURCES.map((s) => `${s.author}. ${s.title}. ${s.publisher}, ${s.date}. ${s.url}`), 'verified'));

  // ---------------------------------------------------------------- assemble
  const generated = new Date().toISOString().slice(0, 10);
  const execParas = [
    p(`${name}${meta.industry ? ` (${V.INDUSTRIES.find((i) => i.id === meta.industry)?.name.toLowerCase() || meta.industry})` : ''}${meta.country ? `, ${meta.country}` : ''}, is valued as at ${meta.valuationDate || generated} using ${methods.length ? methods.join(', ') : 'the models selected'}, on ${dataLabel}.`, 'interpretation'),
    d?.ok ? p(`The base-case discounted cash flow gives an enterprise value of ${f.money(d.ev)} and an equity value of ${f.money(d.equity)}${fin(d.perShare) ? `, or ${f.perShare(d.perShare)} a share${fin(d.upside) ? ` (${F.signed(d.upside * 100, 0)}% against the ${f.perShare(mk.sharePrice)} share price)` : ''}` : ''}, with ${f.pct(d.tvShare, 0)} of the value coming after the forecast period. The scenarios span ${scen ? `${f.perShare(Math.min(...Object.values(scen.scenarios).filter((s) => s.result.ok).map((s) => s.result.perShare)))} to ${f.perShare(Math.max(...Object.values(scen.scenarios).filter((s) => s.result.ok).map((s) => s.result.perShare)))}` : 'the bear to bull cases'} a share.`, 'estimate') : p(`The discounted cash flow could not run: ${d?.error || 'not enabled'}.`, 'estimate'),
    p(histParas.slice(0, 2).join(' '), 'interpretation'),
    risks.length ? p(`Principal risks: ${risks.slice(0, 3).map((r) => `${r.name.toLowerCase()} (score ${V.riskScore(r)})`).join(', ')}.`, 'interpretation') : null,
    p(`The purpose of the valuation is ${options.purpose || 'to estimate what the company is worth on explicit, documented assumptions'}; it is not investment advice.`, 'interpretation'),
  ];
  const overview = [
    p(meta.description || `${name} operates in the ${V.INDUSTRIES.find((i) => i.id === meta.industry)?.name.toLowerCase() || 'general'} category${meta.country ? ` and is based in ${meta.country}` : ''}. ${project.source?.kind === 'edgar' ? `SEC lists it under SIC ${project.source.sic || ''} ${project.source.sicDescription || ''}.` : ''}${(project.segments || []).length ? ` Its segments are ${project.segments.map((s) => s.name).join(', ')}.` : ''}`, project.source?.kind === 'edgar' ? 'verified' : 'interpretation'),
    p(`Business model and products: ${meta.business || 'not supplied; add a description of what the company sells, to whom and where in the project settings.'}`, 'interpretation'),
    p(`Industry context: ${guide.find((g) => g.id === 'dcf')?.why || ''}`, 'interpretation'),
    fin(mk.marketCap) ? kv([['Market capitalisation', f.money(mk.marketCap)], ['Enterprise value at market', f.money(mk.ev)], ['Latest revenue', f.money(last.p.revenue)], ['Latest EBITDA', f.money(last.p.ebitda)], ['Latest net income', f.money(last.p.netIncome)]], 'verified') : null,
  ];
  return {
    title: options.title || meta.title || `${name}: company valuation`,
    company: name,
    meta: { industry: V.INDUSTRIES.find((i) => i.id === meta.industry)?.name || meta.industry || '—', valuationDate: meta.valuationDate || generated, currency: f.cur, unitLabel: f.unitLabel, methods, analyst: options.analyst || meta.analyst || '', comments: options.comments || meta.comments || '', generated, source: dataLabel },
    format: f, labels: TAGS, sources: SOURCES,
    sections: [
      sec('cover', 'Cover', [kv([['Company', name], ['Industry', V.INDUSTRIES.find((i) => i.id === meta.industry)?.name || '—'], ['Valuation date', meta.valuationDate || generated], ['Currency and unit', unitNote], ['Methods', methods.join('; ') || '—'], ['Prepared by', options.analyst || meta.analyst || 'Sunflower Intelligence, Company Valuation Studio'], ['Generated', generated]])]),
      sec('summary', 'Executive summary', execParas),
      sec('overview', 'Company overview', overview),
      sec('history', 'Historical financial performance', [...histParas.map((t) => p(t, 'interpretation')), histTable, figure('ratios', 'Historical and projected margins and returns')]),
      sec('forecast', 'Financial forecast', [...fcParas.map((t) => p(t, 'assumption')), fcTable, figure('forecast', 'Revenue and EBITDA, history and forecast'), figure('fcf', 'Free cash flow to the firm')]),
      sec('methodology', 'Valuation methodology', methodBlocks),
      sec('results', 'Valuation results', resBlocks),
      sec('scenarios', 'Scenario and sensitivity analysis', scBlocks),
      sec('risks', 'Risk assessment', rkBlocks),
      sec('interpretation', 'Investment interpretation', intBlocks),
      sec('conclusion', 'Conclusion', concBlocks),
      sec('appendix', 'Technical appendix', appBlocks),
    ],
  };
}

/** The report as Markdown (for copying or saving as text). */
export function reportToMarkdown(rep) {
  const out = [`# ${rep.title}`, '', `${rep.company} · ${rep.meta.industry} · valuation date ${rep.meta.valuationDate} · ${rep.meta.currency} ${rep.meta.unitLabel}`, `Methods: ${rep.meta.methods.join('; ')}`, `Generated ${rep.meta.generated} by Sunflower Intelligence, Company Valuation Studio${rep.meta.analyst ? `; analyst ${rep.meta.analyst}` : ''}`, ''];
  if (rep.meta.comments) out.push(`> ${rep.meta.comments}`, '');
  const tag = (b) => (b.tag ? ` _[${rep.labels[b.tag]}]_` : '');
  for (const s of rep.sections) {
    out.push(`## ${s.title}`, '');
    for (const b of s.blocks) {
      if (b.type === 'p') out.push(`${b.text}${tag(b)}`, '');
      else if (b.type === 'h3') out.push(`### ${b.text}`, '');
      else if (b.type === 'formula') out.push(`    ${b.text}`, b.note ? `    (${b.note})` : '', '');
      else if (b.type === 'list') out.push(...b.items.map((i) => `- ${i}`), tag(b), '');
      else if (b.type === 'kv') out.push(...b.rows.map(([k, v]) => `- **${k}:** ${v}`), tag(b), '');
      else if (b.type === 'warn') out.push(`> **${b.title}** ${b.text}`, '');
      else if (b.type === 'figure') out.push(`_Figure: ${b.caption}_`, '');
      else if (b.type === 'table') { out.push(`**${b.caption}**${tag(b)}`, '', `| ${b.columns.map((c) => c.label).join(' | ')} |`, `| ${b.columns.map((c) => (c.num ? '---:' : '---')).join(' | ')} |`, ...b.rows.map((r) => `| ${r.join(' | ')} |`), ''); }
    }
  }
  return out.join('\n');
}
/** Every table in the report as CSV files. */
export function reportTablesCSV(rep) {
  const esc = (v) => { const t = v == null ? '' : String(v); return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const files = [];
  rep.sections.forEach((s) => s.blocks.filter((b) => b.type === 'table').forEach((b, i) => files.push({ name: `${s.id}-${i + 1}.csv`, caption: b.caption, csv: [b.columns.map((c) => esc(c.label)).join(','), ...b.rows.map((r) => r.map(esc).join(','))].join('\n') })));
  return files;
}
