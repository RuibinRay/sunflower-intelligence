// project.js — F06 applied project: should Ana buy Brightcup? Every fact comes from case.js (COMPANIES, BRIGHTCUP_FORECAST,
// BRIGHTCUP_BOND, MARKET, SERIES, ANA_PORTFOLIO, BRIGHTCUP_IDEA); every number is computed below and checked by `verify`.
import { COMPANIES, BRIGHTCUP_FORECAST as BF, BRIGHTCUP_BOND as BB, BRIGHTCUP_IDEA as IDEA, MARKET, SERIES, MONTHS, LAST60, ANA, ANA_PORTFOLIO as AP, DERIVED as D } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { moments } from '../../../core/portfolio.js?v=31';

const B = COMPANIES.brightcup, M = COMPANIES.morrow, H = COMPANIES.harbour, T = B.tax;
// ---------------------------------------------------------------- the business and its multiples
const EV = IV.enterpriseValue({ marketCap: B.marketCap, debt: B.debt, cash: B.cash });
// ---------------------------------------------------------------- the required return
const ex = (k) => SERIES[k].slice(LAST60.from).map((v, i) => v - SERIES.bills[LAST60.from + i]);
const REG = IV.regressBeta(SERIES.brightcup.slice(LAST60.from), SERIES.market.slice(LAST60.from), SERIES.bills.slice(LAST60.from));
const BETA = REG.beta, BETA_LO = BETA - 2.0017 * REG.seBeta, BETA_HI = BETA + 2.0017 * REG.seBeta;   // t(58) 97.5% ≈ 2.0017
const RE = IV.capm({ rf: MARKET.rf, beta: BETA, mrp: MARKET.mrp });
const RD = IV.bondYield({ face: BB.face, couponRate: BB.couponRate, years: BB.years, freq: BB.freq }, BB.price);
const WE = B.marketCap / (B.marketCap + B.debt), WD = 1 - WE;
const WACC = WE * RE + WD * RD * (1 - T);
// ---------------------------------------------------------------- the DCF
function forecast(over = {}) {
  const F = { ...BF, ...over };
  let rev = B.revenue, nwc0 = F.nwcShare * B.revenue; const rows = [];
  for (let i = 0; i < 5; i++) {
    const r1 = rev * (1 + F.growth[i]), m = Array.isArray(F.ebitMargin) ? F.ebitMargin[i] : F.ebitMargin;
    const ebit = r1 * m, da = r1 * F.daShare, capex = r1 * F.capexShare, nwc = r1 * F.nwcShare;
    rows.push({ year: 2028 + i, revenue: r1, ebit, nopat: ebit * (1 - T), da, capex, dNwc: nwc - nwc0, fcff: ebit * (1 - T) + da - capex - (nwc - nwc0) });
    rev = r1; nwc0 = nwc;
  }
  return rows;
}
const ROWS = forecast();
const value = (rate, g = BF.terminalGrowth, rows = ROWS) => { const d = IV.dcf({ fcf: rows.map((r) => r.fcff), rate, g }); return { ...d, ...IV.evToEquity({ ev: d.value, debt: B.debt, cash: B.cash, shares: B.shares }) }; };
const V = value(WACC);
const V_LO = value(WACC + 0.01), V_HI = value(WACC - 0.01);
const V_G2 = value(WACC, 0.02);
let lo = 0.05, hi = 0.2; for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2; (value(mid).perShare > B.price ? (lo = mid) : (hi = mid)); }
const IMPLIED = (lo + hi) / 2;
const SLOW = 0.65, V_SLOW = value(WACC, BF.terminalGrowth, forecast({ growth: BF.growth.map((g) => g * SLOW) }));
// ---------------------------------------------------------------- peers
const peerPrice = (k, basis, metric) => [M, H].map((c) => IV.impliedValue({ multiple: c.m[k], metric, basis, debt: B.debt, cash: B.cash, shares: B.shares }).perShare);
const PE_IMPL = peerPrice('pe', 'equity', B.netIncome), EV_IMPL = peerPrice('evEbitda', 'ev', B.ebitda);
// ---------------------------------------------------------------- the portfolio
const NAMES = ['market', 'intl', 'bonds', 'brightcup'];
const MO = moments(NAMES.map((n) => SERIES[n].slice(LAST60.from)), 12);         // 2023–2027, the same window as the betas
const W0 = [AP.market, AP.intl, AP.bonds, 0], W1 = W0.map((w, i) => (i === 3 ? IDEA.share : w * (1 - IDEA.share)));
const SD0 = Math.sqrt(IV.portVar(W0, MO.cov)), SD1 = Math.sqrt(IV.portVar(W1, MO.cov));
const betas = { market: 1, intl: D.betas60.intl.beta, bonds: D.betas60.bonds.beta, brightcup: BETA };
const ER = NAMES.map((n) => IV.capm({ rf: MARKET.rf, beta: betas[n], mrp: MARKET.mrp }));
const ER0 = IV.portRet(W0, ER), ER1 = IV.portRet(W1, ER);
const SPECIFIC = 1 - REG.r2;                                                  // share of Brightcup's variance not explained by the market
const SH0 = IV.sharpe(ER0, MARKET.rf, SD0), SH1 = IV.sharpe(ER1, MARKET.rf, SD1);
// the same extra expected return without Brightcup: move x from the bond fund to the market fund
const SHIFT = (ER1 - ER0) / (ER[0] - ER[2]), W2 = [AP.market + SHIFT, AP.intl, AP.bonds - SHIFT, 0], SD2 = Math.sqrt(IV.portVar(W2, MO.cov));
const STAKE = ANA.retirement.lump * IDEA.share;
// how the added variance splits: account beta × market variance (systematic) and the rest (specific)
const VARM = MO.cov[0][0], PB0 = IV.portRet(W0, NAMES.map((n) => betas[n])), PB1 = IV.portRet(W1, NAMES.map((n) => betas[n]));
const ADD_VAR = SD1 ** 2 - SD0 ** 2, ADD_SYS = (PB1 ** 2 - PB0 ** 2) * VARM, SYS_SHARE = ADD_SYS / ADD_VAR;
// the beta interval carried through to the cost of equity and the DCF
const RE_LO = IV.capm({ rf: MARKET.rf, beta: BETA_LO, mrp: MARKET.mrp }), RE_HI = IV.capm({ rf: MARKET.rf, beta: BETA_HI, mrp: MARKET.mrp });
const V_BLO = value(WE * RE_LO + WD * RD * (1 - T)), V_BHI = value(WE * RE_HI + WD * RD * (1 - T));
// Ana's 70% of Lantern at Hollis's post-money valuation (F05)
const LANTERN_STAKE = 0.70 * 250_000;

const f = (x, d = 2) => (x < 0 ? `−${Math.abs(x).toFixed(d)}` : x.toFixed(d));
const money = (x, d = 0) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const mil = (x, d = 0) => `$${x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}m`;
const pc = (x, d = 1) => `${(x * 100 + Math.sign(x) * 1e-9).toFixed(d)}%`;
const r = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const num = (id, prompt, answer, check, solution, wrong, { unit = '$', places = 0, tol, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol: tol ?? 0.6 * 10 ** -places, solution, ...(wrong ? { wrong } : {}) });
const htmlTable = (caption, head, rows) => `<div class="table-scroll"><table class="data-table study-table"><caption>${caption}</caption><thead><tr>${head.map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(([a, ...cells]) => `<tr><th scope="row">${a}</th>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

const companiesTable = htmlTable('Three listed coffee and food companies, financial year 2027 ($ millions except per share; all fictional)', ['', 'Brightcup Coffee', 'Morrow & Pike', 'Harbour Street'], [
  ['Share price, 31 Dec 2027', ...[B, M, H].map((c) => `$${c.price.toFixed(2)}`)], ['Shares (millions)', ...[B, M, H].map((c) => String(c.shares))],
  ['Revenue', ...[B, M, H].map((c) => c.revenue.toLocaleString('en-US'))], ['EBITDA', ...[B, M, H].map((c) => String(c.ebitda))], ['EBIT', ...[B, M, H].map((c) => String(c.ebit))],
  ['Interest', ...[B, M, H].map((c) => String(c.interest))], ['Net income (tax 25%)', ...[B, M, H].map((c) => c.netIncome.toFixed(2))],
  ['Debt', ...[B, M, H].map((c) => c.debt.toLocaleString('en-US'))], ['Cash', ...[B, M, H].map((c) => String(c.cash))], ['Book equity', ...[B, M, H].map((c) => c.bookEquity.toLocaleString('en-US'))],
  ['Dividend per share', ...[B, M, H].map((c) => `$${c.dps.toFixed(2)}`)], ['Analysts’ earnings growth forecast', ...[B, M, H].map((c) => pc(c.growthForecast, 0))],
]);
const forecastTable = htmlTable('Brightcup: Ana’s forecast for 2028–2032 (fictional)', ['', '2028', '2029', '2030', '2031', '2032'], [
  ['Revenue growth', ...BF.growth.map((g) => pc(g, 0))], ['EBIT margin', ...BF.ebitMargin.map((m) => pc(m, 1))],
  ['Depreciation', ...BF.growth.map(() => `${pc(BF.daShare, 0)} of revenue`)], ['Capital spending', ...BF.growth.map(() => `${pc(BF.capexShare, 0)} of revenue`)],
  ['Working capital', ...BF.growth.map(() => `${pc(BF.nwcShare, 1)} of revenue`)],
]);

// ---------------------------------------------------------------- tools
const betaTool = { kind: 'widget', widget: { type: 'regression', title: 'Brightcup against the market: monthly excess returns, 2023–2027 (simulated)',
  y: { name: 'Brightcup excess return', values: ex('brightcup') }, xs: [{ name: 'Market excess return', values: ex('market') }],
  note: 'Excess return = the month’s total return minus the one-month bill return. The data are simulated for teaching, not real market history.' } };
const dcfTool = { kind: 'widget', widget: { type: 'formula', title: 'Brightcup: discounted cash flow',
  intro: 'Work out the free cash flows and the value yourself first; then use this to test how the value moves. It starts at a 9% rate, not at your WACC. The forecast’s margins and investment shares stay as in the table.',
  inputs: [
    { id: 'rate', label: 'Discount rate (WACC)', min: 6, max: 12, step: 0.01, value: 9, fmt: 'pct', digits: 2 },
    { id: 'g', label: 'Terminal growth', min: 0, max: 4, step: 0.1, value: BF.terminalGrowth * 100, fmt: 'pct' },
    { id: 'scale', label: 'Revenue growth (% of the forecast’s rates)', min: 0, max: 150, step: 5, value: 100, fmt: 'pct' },
  ],
  compute: (v) => {
    if (v.rate <= v.g) return { error: 'The discount rate has to be above terminal growth.' };
    const rows = forecast({ growth: BF.growth.map((g) => g * v.scale / 100) }), x = value(v.rate / 100, v.g / 100, rows);
    return { headline: { label: 'Value per share', value: `$${x.perShare.toFixed(2)}` },
      rows: [['Enterprise value', mil(x.value, 0)], ['Share price, 31 Dec 2027', `$${B.price.toFixed(2)}`]],
      note: x.perShare > B.price ? `On these inputs the shares are worth ${pc(x.perShare / B.price - 1, 0)} more than they trade for.` : `On these inputs the shares are worth ${pc(1 - x.perShare / B.price, 0)} less than they trade for.` };
  } } };
const mixTool = { kind: 'widget', widget: { type: 'formula', title: 'Ana’s account with some Brightcup',
  intro: 'Brightcup replaces part of every fund in proportion. Standard deviation from the simulated 2023–2027 monthly returns, the same five years as the betas; expected returns from the CAPM.',
  inputs: [{ id: 'b', label: 'Share of the account in Brightcup', min: 0, max: 30, step: 1, value: 0, fmt: 'pct' }],
  compute: (v) => {
    const w = W0.map((x, i) => (i === 3 ? v.b / 100 : x * (1 - v.b / 100))), s = Math.sqrt(IV.portVar(w, MO.cov)), e = IV.portRet(w, ER);
    return { headline: { label: 'Standard deviation a year', value: pc(s, 2) },
      rows: [['Expected return a year (CAPM)', pc(e, 2)], ['Sharpe ratio', f(IV.sharpe(e, MARKET.rf, s), 3)], ['Without Brightcup', `${pc(SD0, 2)}; expected return ${pc(ER0, 2)}; Sharpe ${f(SH0, 3)}`]],
      note: 'Part of the extra standard deviation is more market exposure, which the CAPM pays for; the rest is Brightcup’s own risk, which it doesn’t.' };
  } } };

export default {
  title: 'Should Ana buy Brightcup?',
  brief: [
    { case: `June 2028. Ana is opening her retirement account on 1 July with ${money(ANA.retirement.lump)} and will add ${money(ANA.retirement.monthly)} a month. After working through diversification she has chosen a mix of ${pc(AP.market, 0)} total-market index fund, ${pc(AP.intl, 0)} international index fund and ${pc(AP.bonds, 0)} bond index fund. Now she is tempted to put ${pc(IDEA.share, 0)} of the account into Brightcup Coffee, the listed chain whose shops she competes with: ${IDEA.why}. Brightcup, its competitors, every figure and all the market data are fictional; the monthly returns are simulated for teaching. Value Brightcup at 31 December 2027, the date of its latest accounts; its shares still trade at about $42.` },
    { p: 'Ana asks you to answer three questions: what Brightcup’s shares are worth, what return their risk requires, and what owning them would do to her account. The company figures are below.' },
    { html: companiesTable },
  ],
  deliverables: [
    'Brightcup’s market capitalisation, enterprise value and multiples, against Morrow & Pike and Harbour Street.',
    'Its beta from 2023–2027 monthly returns, with its uncertainty, the CAPM cost of equity and the WACC.',
    'A five-year discounted-cash-flow value per share, the terminal value’s share of it, and how it moves with the rate, growth and the forecast.',
    'What 10% in Brightcup does to the account’s risk, expected return and Sharpe ratio.',
    'A memo to Ana with a recommendation.',
  ],
  stages: [
    {
      id: 'price', title: 'What the market says Brightcup is worth',
      html: `<p>Start with what the share price implies. Enterprise value is market capitalisation plus debt minus cash.</p>`,
      items: [
        num('f06-pj-1', 'What is Brightcup’s enterprise value at the end of 2027? Give $ millions.', EV, () => B.price * B.shares + B.debt - B.cash,
          `Market capitalisation $${B.price.toFixed(2)} × ${B.shares} million = ${mil(B.marketCap)}; plus debt ${mil(B.debt)}, minus cash ${mil(B.cash)}: ${mil(EV)}.`,
          [{ value: B.marketCap + B.debt + B.cash, say: 'Cash is subtracted: a buyer of the whole firm gets the cash back.' }, { value: B.marketCap, say: 'That is market capitalisation, the value of the equity only. Enterprise value adds the debt and subtracts the cash.' }],
          { unit: '$m', tol: 0.6 }),
        num('f06-pj-2', 'What is Brightcup’s price–earnings ratio? Give two decimal places.', r(B.m.pe, 2), () => B.price / ((B.ebit - B.interest) * (1 - T) / B.shares),
          `Net income (${B.ebit} − ${B.interest}) × 0.75 = ${mil(B.netIncome, 2)}; earnings per share ${mil(B.netIncome, 2)} ÷ ${B.shares}m = $${B.eps.toFixed(3)}; P/E = $${B.price.toFixed(2)} ÷ $${B.eps.toFixed(3)} = ${f(B.m.pe)}.`,
          [{ value: r(B.price / (B.ebit * (1 - T) / B.shares), 2), say: 'Earnings are after interest: use net income, (EBIT − interest) × (1 − tax).' }], { unit: '', places: 2, tol: 0.011 }),
        num('f06-pj-3', 'What is Brightcup’s EV/EBITDA? Give two decimal places.', r(B.m.evEbitda, 2), () => EV / B.ebitda,
          `${mil(EV)} ÷ ${mil(B.ebitda)} = ${f(B.m.evEbitda)}. Morrow & Pike trades at ${f(M.m.evEbitda)} and Harbour Street at ${f(H.m.evEbitda)}.`,
          [{ value: r(B.marketCap / B.ebitda, 2), say: 'That divides the equity’s value by EBITDA, which belongs to all investors. Use enterprise value.' }], { unit: '', places: 2, tol: 0.011 }),
        { id: 'f06-pj-4', type: 'mc', kind: 'conceptual',
          prompt: `Brightcup’s P/E and EV/EBITDA are above both peers’, but its PEG ratio (P/E ÷ expected growth in %) is below both of theirs. What does that suggest?`,
          options: [
            'The market expects Brightcup’s earnings to grow faster than its peers’',
            'Brightcup is overvalued, because any company on a higher P/E than its peers costs more for the same earnings',
            'Brightcup is probably undervalued, since it costs less per point of expected growth than either peer',
            'The multiples cannot be compared, because Brightcup carries more debt than Morrow & Pike',
          ],
          answer: 0,
          feedback: {
            1: 'A higher P/E is what faster expected growth (or lower risk) should produce; on its own it doesn’t show overvaluation.',
            2: 'Cheaper per point of growth only if the growth forecast is right; PEG also ignores risk and how long the growth lasts. It is a screen, not a verdict.',
            3: 'EV/EBITDA already adjusts for debt; P/E is affected by leverage but comparing them with that in mind is still useful.',
          },
          solution: `Brightcup’s analysts expect ${pc(B.growthForecast, 0)} earnings growth against ${pc(M.growthForecast, 0)} and ${pc(H.growthForecast, 0)}. Per point of growth it is cheaper, per dollar of today’s earnings dearer. Whether the price is right depends on whether that growth arrives: the next stages value it directly.` },
      ],
    },
    {
      id: 'rate', title: 'The return Brightcup’s risk requires',
      html: `<p>Estimate Brightcup’s beta from its last five years of monthly returns against the total-market index (excess returns over bills), then its cost of equity with Ana’s assumptions (risk-free rate ${pc(MARKET.rf, 1)}, market risk premium ${pc(MARKET.mrp, 1)}; no small-firm premium: Brightcup is a large listed company). The bond you priced in F05’s cost-of-capital lesson (6 years, ${pc(BB.couponRate, 0)} annual coupon, $${BB.price.toFixed(2)} per $100) gives the cost of debt. Weight with the market value of the equity and, as in F05, the $630m book value of the debt.</p>`,
      tool: betaTool,
      items: [
        num('f06-pj-5', 'What is Brightcup’s beta? Give two decimal places.', r(BETA, 2), () => IV.regressBeta(SERIES.brightcup.slice(LAST60.from), SERIES.market.slice(LAST60.from), SERIES.bills.slice(LAST60.from)).beta,
          `The slope of Brightcup’s excess return on the market’s, 60 months: ${f(BETA)} (R² ${f(REG.r2, 2)}). It matches the beta F05 used for Brightcup.`,
          [{ value: r(REG.r2, 2), say: 'That is R², the share of Brightcup’s variance the market explains. Beta is the slope.' }], { unit: '', places: 2, tol: 0.011 }),
        num('f06-pj-6', 'Using the slope’s standard error and a t value of 2.00 (58 degrees of freedom), what is the cost of equity at the upper end of a 95% confidence interval for beta? Give a percentage to two decimal places.', r(RE_HI * 100, 2), () => (MARKET.rf + (BETA + 2.0017 * REG.seBeta) * MARKET.mrp) * 100,
          `Standard error ${f(REG.seBeta, 3)}; with 58 degrees of freedom the t value is 2.00: ${f(BETA)} ± 2.00 × ${f(REG.seBeta, 3)} = ${f(BETA_LO)} to ${f(BETA_HI)}. Five years of one company’s returns pin beta down only loosely: the cost of equity could be anywhere from about ${pc(RE_LO, 1)} to ${pc(RE_HI, 1)}, which on Ana’s forecast puts the value between about $${V_BHI.perShare.toFixed(0)} and $${V_BLO.perShare.toFixed(0)} a share.`,
          [{ value: r((MARKET.rf + (BETA + REG.seBeta) * MARKET.mrp) * 100, 2), say: 'A 95% interval is about two standard errors either side, not one.' }, { value: r(BETA_HI, 2), say: 'That is the beta at the top of the interval; put it into the CAPM.' }], { unit: '%', places: 2, tol: 0.03 }),
        num('f06-pj-7', 'What is Brightcup’s cost of equity by the CAPM? Give a percentage to two decimal places.', r(RE * 100, 2), () => (MARKET.rf + BETA * MARKET.mrp) * 100,
          `${pc(MARKET.rf, 1)} + ${f(BETA)} × ${pc(MARKET.mrp, 1)} = ${pc(RE, 2)}.`,
          [{ value: r((MARKET.rf + BETA * MARKET.mrp + 0.03) * 100, 2), say: 'The 3% premium was Ana’s judgement for a small private firm like Lantern. Brightcup is large and listed.' }], { unit: '%', places: 2, tol: 0.02 }),
        num('f06-pj-8', 'What is Brightcup’s WACC? Give a percentage to two decimal places.', r(WACC * 100, 2), () => (WE * RE + WD * RD * (1 - T)) * 100,
          `Cost of debt: the bond’s yield, ${pc(RD, 2)} (=RATE(6,5,-96.2,100)), ${pc(RD * (1 - T), 2)} after tax. Weights ${mil(B.marketCap)} equity and ${mil(B.debt)} debt: ${pc(WE, 1)} and ${pc(WD, 1)}. WACC = ${pc(WE, 1)} × ${pc(RE, 2)} + ${pc(WD, 1)} × ${pc(RD * (1 - T), 2)} = ${pc(WACC, 2)}.`,
          [{ value: r((WE * RE + WD * BB.couponRate * (1 - T)) * 100, 2), say: 'The coupon is not the cost of debt: the bond trades below $100, so lenders now require its yield, 5.77%.' }, { value: r((WE * RE + WD * RD) * 100, 2), say: 'Use the after-tax cost of debt.' }, { value: r((B.bookEquity / (B.bookEquity + B.debt) * RE + B.debt / (B.bookEquity + B.debt) * RD * (1 - T)) * 100, 2), say: 'That weights equity at book value. Use its market value, the share price × shares.' }],
          { unit: '%', places: 2, tol: 0.02 }),
      ],
    },
    {
      id: 'dcf', title: 'Brightcup by discounted cash flow',
      html: `<p>Ana’s forecast for Brightcup is below. Free cash flow to the firm = EBIT × (1 − tax) + depreciation − capital spending − the increase in working capital. Discount 2028–2032 at the WACC; after 2032 free cash flow grows at ${pc(BF.terminalGrowth, 0)} a year for ever. Working capital was ${pc(BF.nwcShare, 1)} of revenue in 2027 too.</p>${forecastTable}`,
      tool: dcfTool,
      items: [
        num('f06-pj-9', 'What is Brightcup’s free cash flow to the firm in 2028? Give $ millions to one decimal place.', r(ROWS[0].fcff, 1), () => ROWS[0].fcff,
          `Revenue ${mil(B.revenue)} × 1.10 = ${mil(ROWS[0].revenue, 1)}. EBIT ${pc(BF.ebitMargin[0], 0)} = ${mil(ROWS[0].ebit, 1)}, after tax ${mil(ROWS[0].nopat, 1)}; + depreciation ${mil(ROWS[0].da, 1)} − capital spending ${mil(ROWS[0].capex, 1)} − more working capital (${pc(BF.nwcShare, 1)} × (${ROWS[0].revenue.toFixed(1)} − ${B.revenue}) = ${ROWS[0].dNwc.toFixed(1)}) = ${mil(ROWS[0].fcff, 1)}.`,
          [{ value: r(ROWS[0].fcff + ROWS[0].dNwc, 1), say: 'Growing sales need more working capital: subtract the increase.' }, { value: r(ROWS[0].ebit * (1 - T) - ROWS[0].capex - ROWS[0].dNwc, 1), say: 'Depreciation is a non-cash expense already taken off EBIT: add it back.' }], { unit: '$m', places: 1, tol: 0.15 }),
        num('f06-pj-10', 'What is Brightcup worth per share by this DCF? Give dollars and cents.', r(V.perShare, 2), () => value(WACC).perShare,
          `Present value of 2028–2032 ${mil(V.sumPv, 1)}; terminal value at end-2032 ${ROWS[4].fcff.toFixed(1)} × 1.03 ÷ (${pc(WACC, 2)} − 3%) = ${mil(V.tv, 1)}, worth ${mil(V.pvTv, 1)} today. Enterprise value ${mil(V.value, 1)} − debt ${mil(B.debt)} + cash ${mil(B.cash)} = ${mil(V.equity, 1)}; ÷ ${B.shares} million = $${V.perShare.toFixed(2)}, against a price of $${B.price.toFixed(2)}.`,
          [{ value: r(V.value / B.shares, 2), say: 'That is enterprise value per share. Subtract debt and add cash to reach the equity.' }, { value: r(value(RE).perShare, 2), say: 'Free cash flow to the firm belongs to lenders and shareholders: discount it at the WACC, not the cost of equity.' }, { value: r(((V.sumPv + ROWS[4].fcff / (WACC - BF.terminalGrowth) / (1 + WACC) ** 5) - B.debt + B.cash) / B.shares, 2), say: 'The terminal value starts from 2033’s cash flow: grow 2032’s by 3% before dividing by (r − g).' }],
          { unit: '$', places: 2, tol: 0.35 }),
        num('f06-pj-11', 'What share of the enterprise value is the terminal value? Give a percentage to one decimal place.', r(V.tvShare * 100, 1), () => V.pvTv / V.value * 100,
          `${mil(V.pvTv, 1)} ÷ ${mil(V.value, 1)} = ${pc(V.tvShare, 1)}: most of the value lies beyond the five years Ana can forecast in any detail.`, null, { unit: '%', places: 1, tol: 0.3 }),
        num('f06-pj-12', 'At what discount rate would the DCF value equal the $42.00 share price? Give a percentage to two decimal places.', r(IMPLIED * 100, 2), () => IMPLIED * 100,
          `Lower values need higher rates: at ${pc(IMPLIED, 2)} the value is $42.00, ${f((IMPLIED - WACC) * 100, 2)} points above the WACC. On Ana’s forecast the market price implies roughly the return Brightcup’s risk requires: the shares look about fairly priced, not cheap. (At ${pc(WACC + 0.01, 2)} the value is $${V_LO.perShare.toFixed(2)}; at ${pc(WACC - 0.01, 2)}, $${V_HI.perShare.toFixed(2)}.)`,
          null, { unit: '%', places: 2, tol: 0.03 }),
        { id: 'f06-pj-13', type: 'mc', kind: 'applied',
          prompt: 'Which change to the assumptions would move the value per share most?',
          options: [
            'Revenue growing at 65% of the forecast rates in every year',
            'Terminal growth of 2% instead of 3%',
            'A discount rate one point higher',
            'Capital spending at 4.5% of revenue instead of 5%',
          ],
          answer: 2,
          feedback: {
            0: `Growth at 65% of the forecast gives $${V_SLOW.perShare.toFixed(2)}: a big fall, but less than a point on the rate.`,
            1: `Terminal growth of 2% gives $${V_G2.perShare.toFixed(2)}: a large change, but a point on the rate moves it more.`,
            3: 'Half a point of revenue on capital spending changes free cash flow by a few million a year: small next to the rate.',
          },
          solution: `A point on the rate takes the value from $${V.perShare.toFixed(2)} to $${V_LO.perShare.toFixed(2)}; 2% terminal growth gives $${V_G2.perShare.toFixed(2)}; slower growth $${V_SLOW.perShare.toFixed(2)}. With ${pc(V.tvShare, 0)} of the value in the terminal value, the rate and long-run growth dominate, and the beta’s confidence interval alone spans about four points on the cost of equity.` },
      ],
    },
    {
      id: 'peers', title: 'Brightcup against its peers',
      html: '<p>Apply each peer’s multiple to Brightcup’s own earnings and EBITDA. P/E gives equity value directly; EV/EBITDA gives enterprise value, which you bridge to equity.</p>',
      items: [
        num('f06-pj-14', 'What price per share does Morrow & Pike’s EV/EBITDA give Brightcup? Give dollars and cents.', r(EV_IMPL[0], 2), () => (M.m.evEbitda * B.ebitda - B.debt + B.cash) / B.shares,
          `${f(M.m.evEbitda)} × ${mil(B.ebitda)} = ${mil(M.m.evEbitda * B.ebitda, 1)} enterprise value; − debt ${mil(B.debt)} + cash ${mil(B.cash)}; ÷ ${B.shares}m = $${EV_IMPL[0].toFixed(2)}. Harbour Street’s gives $${EV_IMPL[1].toFixed(2)}; their P/Es give $${PE_IMPL[0].toFixed(2)} and $${PE_IMPL[1].toFixed(2)}.`,
          [{ value: r(M.m.evEbitda * B.ebitda / B.shares, 2), say: 'EV/EBITDA gives enterprise value: subtract debt and add cash before dividing by shares.' }], { unit: '$', places: 2, tol: 0.06 }),
        { id: 'f06-pj-15', type: 'mc', kind: 'applied',
          prompt: `The peers’ multiples value Brightcup at $${Math.min(...PE_IMPL, ...EV_IMPL).toFixed(0)}–$${Math.max(...PE_IMPL, ...EV_IMPL).toFixed(0)}, well below both its price and the DCF. How should Ana read that?`,
          options: [
            'With care: two peers that grow more slowly than Brightcup are a thin basis, so the multiples mainly show how much of Brightcup’s price rests on its growth',
            'As a sign the shares are probably overvalued, since both the P/E and the EV/EBITDA comparisons put Brightcup’s value well below its price',
            'As proof the DCF is wrong, because market multiples reflect what investors actually pay for similar shares today, while a DCF is only one person’s forecast of the future',
            'As irrelevant, because relative valuation is meant for companies in different industries, and these three all sell coffee or food',
          ],
          answer: 0,
          feedback: {
            1: 'Both comparisons share one weakness, so they don’t confirm each other: peers growing at 5–8% will always put a lower multiple on a firm expected to grow at 10%.',
            2: 'Multiples are prices of other firms, which can be wrong too; and these peers differ from Brightcup in growth.',
            3: 'Relative valuation needs similar companies; the problem here is that the peers aren’t similar enough in growth.',
          },
          solution: 'A multiple applies a peer’s growth, risk and payout to the target. Brightcup is expected to grow faster than either peer, so their multiples undervalue it unless that growth is doubtful. The useful conclusion is that Brightcup’s price assumes the growth happens; the DCF on Ana’s forecast says the price is about right if it does.' },
      ],
    },
    {
      id: 'portfolio', title: 'What Brightcup would do to Ana’s account',
      html: `<p>Ana would put ${pc(IDEA.share, 0)} of the account in Brightcup and scale the three funds down in proportion. Use the simulated 2023–2027 monthly returns for risk (the same five years as the betas), and the CAPM for expected returns (each asset’s beta against the market over 2023–2027: international ${f(betas.intl)}, bonds ${f(betas.bonds)}).</p>`,
      tool: mixTool,
      items: [
        num('f06-pj-16', `What is the account’s standard deviation a year with ${pc(IDEA.share, 0)} in Brightcup? Give a percentage to two decimal places.`, r(SD1 * 100, 2), () => Math.sqrt(IV.portVar(W1, MO.cov)) * 100,
          `Without Brightcup: ${pc(SD0, 2)}. With it: ${pc(SD1, 2)}, ${f((SD1 - SD0) * 100, 2)} points more, from one share at ${pc(IDEA.share, 0)}.`,
          [{ value: r(SD0 * 100, 2), say: 'That is the account without Brightcup.' }, { value: r(((1 - IDEA.share) * SD0 + IDEA.share * Math.sqrt(MO.cov[3][3])) * 100, 2), say: 'Standard deviations don’t add: use the covariances (the widget does).' }],
          { unit: '%', places: 2, tol: 0.02 }),
        num('f06-pj-17', 'By the CAPM, how much does the account’s expected return change? Give percentage points to two decimal places.', r((ER1 - ER0) * 100, 2), () => (IV.portRet(W1, ER) - IV.portRet(W0, ER)) * 100,
          `Expected return ${pc(ER0, 2)} without and ${pc(ER1, 2)} with Brightcup: ${f((ER1 - ER0) * 100, 2)} points. Brightcup’s beta (${f(BETA)}) is above the mix it replaces (about ${f(IV.portRet(W0, [1, betas.intl, betas.bonds, 0]))}, because of the bonds), so expected return rises a little; but the Sharpe ratio falls from ${f(SH0, 3)} to ${f(SH1, 3)}. Moving ${pc(SHIFT, 1)} from the bond fund to the market fund would add the same expected return with a standard deviation of ${pc(SD2, 2)}, not ${pc(SD1, 2)}.`,
          null, { unit: 'points', places: 2, tol: 0.006 }),
        num('f06-pj-18', 'What share of Brightcup’s variance is specific to the company (not explained by the market) over 2023–2027? Give a percentage to one decimal place.', r(SPECIFIC * 100, 1), () => (1 - REG.r2) * 100,
          `1 − R² = 1 − ${f(REG.r2, 3)} = ${pc(SPECIFIC, 1)}. That part of the risk can be diversified away, so the market doesn’t reward it: holding it is a bet on Brightcup in particular.`,
          [{ value: r(REG.r2 * 100, 1), say: 'R² is the share the market explains. The company-specific share is 1 − R².' }], { unit: '%', places: 1, tol: 0.15 }),
        { id: 'f06-pj-19', type: 'mc', kind: 'applied',
          prompt: 'Apart from the numbers above, what makes Brightcup a particularly poor fit for Ana’s account?',
          options: [
            'Her income and her own business depend on the same coffee market, so Brightcup’s bad years are likely to be hers too',
            'Brightcup pays a dividend, which would add to her taxable income each year and slow how fast the account compounds',
            'Brightcup’s beta is above 1, and a long-horizon retirement account should hold only assets whose betas are below the market’s',
            'As a competitor she would probably learn things about Brightcup that make trading its shares legally risky',
          ],
          answer: 0,
          feedback: {
            1: 'Dividends are part of the return, and in many retirement accounts they are not taxed as they arrive; the account’s rules, not the dividend, decide that.',
            2: 'The index fund she holds has a beta of 1 by definition; a beta near 1 isn’t the problem. Concentration and correlation with her income are.',
            3: 'Owning shares in a competitor isn’t illegal in itself; trading on material non-public information would be, and nothing suggests Ana has any.',
          },
          solution: `Her salary from Lantern, her ${pc(0.7, 0)} stake in it (worth about ${money(LANTERN_STAKE)} at Hollis’s price, F05) and Brightcup’s profits all depend on the same local coffee trade and the same economy. Diversification is about the whole of her wealth, not just the account: adding Brightcup concentrates it further. Familiarity is a known bias, not an edge, unless she knows something the market doesn’t.` },
      ],
    },
    {
      id: 'memo', title: 'Advise Ana',
      items: [
        { id: 'f06-pj-20', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo (about 250 words): what Brightcup is worth and how sure you are, what return its risk requires, what it would do to her account, and what you recommend.',
          rubric: [
            `Gives the DCF value (about $${V.perShare.toFixed(0)} against a $${B.price.toFixed(0)} price), its sensitivity (a point on the rate is worth about $${(V.perShare - V_LO.perShare).toFixed(0)} a share) and the terminal value’s large share.`,
            `States the cost of equity (${pc(RE, 1)}) and WACC (${pc(WACC, 1)}), and the uncertainty in beta (95% interval ${f(BETA_LO)}–${f(BETA_HI)}, a value of about $${V_BHI.perShare.toFixed(0)}–$${V_BLO.perShare.toFixed(0)}).`,
            `Reads the peer multiples correctly: lower peer growth explains most of the gap; the price rests on Brightcup’s growth.`,
            `Shows the portfolio effect: standard deviation up from ${pc(SD0, 1)} to ${pc(SD1, 1)} for ${f((ER1 - ER0) * 100, 2)} points more expected return and a lower Sharpe ratio; part of the extra risk is market exposure the index funds give more cheaply, the rest is Brightcup’s own and unrewarded.`,
            'Weighs her concentration in coffee (income, Lantern) and familiarity bias, and gives a clear recommendation with what would change it.',
          ],
          model: `<b>To:</b> Ana · <b>Re:</b> Brightcup shares<br><br>On your forecast Brightcup is worth about $${V.perShare.toFixed(0)} a share against a price of $${B.price.toFixed(0)}: roughly fairly priced, not a bargain. The value is fragile: ${pc(V.tvShare, 0)} of it lies beyond 2032, and a point on the discount rate moves it by $${(V.perShare - V_LO.perShare).toFixed(0)} to $${(V_HI.perShare - V.perShare).toFixed(0)}. Its beta of ${f(BETA)} (somewhere between ${f(BETA_LO)} and ${f(BETA_HI)}, which alone spans values of about $${V_BHI.perShare.toFixed(0)} to $${V_BLO.perShare.toFixed(0)}) gives a cost of equity of ${pc(RE, 1)} and a WACC of ${pc(WACC, 1)}; the price implies ${pc(IMPLIED, 1)}. Its peers trade on lower multiples because they grow more slowly, so the price rests on Brightcup’s growth arriving.<br><br>In your account, ${pc(IDEA.share, 0)} in Brightcup would raise the yearly standard deviation from ${pc(SD0, 1)} to ${pc(SD1, 1)} for only ${f((ER1 - ER0) * 100, 2)} points more expected return, and a slightly lower Sharpe ratio. Part of that is extra market exposure you could get more cheaply: moving ${pc(SHIFT, 0)} from the bond fund to the market fund buys the same expected return at ${pc(SD2, 1)}. The rest is Brightcup’s own risk (${pc(SPECIFIC, 0)} of its variance), which earns nothing. And it adds to a bet you already have: your salary and your 70% of Lantern (about ${money(LANTERN_STAKE)} at Hollis’s price) depend on the same coffee trade.<br><br>I recommend not buying it. If you want more expected return, move some of the bond fund into the share index funds, which own Brightcup already in proportion to its size. Revisit only if you find a view on Brightcup the market hasn’t priced, and keep any single share to a few per cent.`,
          solution: 'Compare your memo with the model and the rubric. A different recommendation earns full marks if it rests on the numbers, admits how uncertain the value is and deals with concentration.' },
      ],
    },
  ],
  rubric: [
    'Values are computed correctly and their uncertainty is shown (beta interval, rate and growth sensitivity, terminal value share).',
    'Equity and enterprise values and multiples are kept apart and bridged correctly.',
    'The portfolio analysis uses covariances, distinguishes systematic from company-specific risk, and considers Ana’s whole wealth.',
    'The recommendation follows from the analysis and says what would change it.',
  ],
  verify() {
    return [
      ['EV', EV, 2_690], ['P/E', B.m.pe, 19.718, 0.001], ['EV/EBITDA', B.m.evEbitda, 11.595, 0.001],
      ['beta = F05’s 1.05', BETA, 1.05, 1e-5], ['cost of equity', RE, 0.09975, 1e-4], ['bond yield', RD, 0.05767, 1e-5], ['WACC', WACC, 0.08671, 1e-5],
      ['FCFF 2028', ROWS[0].fcff, 119.63, 0.005], ['value per share', V.perShare, 43.79, 0.005], ['terminal value share', V.tvShare, 0.786, 0.0005], ['implied rate', IMPLIED, 0.08855, 1e-5],
      ['a point on the rate moves value more than 2% terminal growth or slower growth', (V.perShare - V_LO.perShare > V.perShare - V_G2.perShare && V.perShare - V_LO.perShare > V.perShare - V_SLOW.perShare) ? 1 : 0, 1],
      ['peers value Brightcup below its price', Math.max(...PE_IMPL, ...EV_IMPL) < B.price ? 1 : 0, 1],
      ['SD without (2023–27)', SD0, SD0, 0], ['SD with', SD1 > SD0 ? 1 : 0, 1], ['systematic share of the added variance is between a third and nine-tenths', SYS_SHARE > 0.33 && SYS_SHARE < 0.9 ? 1 : 0, 1], ['Sharpe falls', SH1 < SH0 ? 1 : 0, 1], ['company-specific share', SPECIFIC, 0.667, 0.001],
      ['expected return up 0.15 points', ER1 - ER0, 0.0015, 0.0001], ['the bond-to-market shift is less risky for the same return', SD2 < SD1 ? 1 : 0, 1], ['beta interval value range brackets the point value', V_BHI.perShare < V.perShare && V.perShare < V_BLO.perShare ? 1 : 0, 1], ['stake', STAKE, 500],
    ];
  },
};
