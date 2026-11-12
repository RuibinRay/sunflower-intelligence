// discounted-cash-flow-valuation.js — F06 · Discounted cash flow valuation. Content only; exercises are in
// discounted-cash-flow-valuation.ex.js. Morrow & Pike Roasters’ 2027 figures, price, forecast and bond come from
// case.js (COMPANIES, MORROW_FORECAST, BONDS, MARKET); DCF, the equity bridge, PVGO and the dividend discount models
// from core/investments.js. Every company here is fictional. Brightcup Coffee is the course project’s and is not valued.
import { COMPANIES, MORROW_FORECAST as MF, BONDS, MARKET } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const M = COMPANIES.morrow;
const { rf, mrp } = MARKET;
const T = M.tax;
const BETA = 0.90;
// Morrow & Pike’s cost of capital
const KE = IV.capm({ rf, beta: BETA, mrp });
const MB = BONDS.find((b) => b.name.startsWith('Morrow'));
const mbSpec = { face: 100, couponRate: MB.couponRate, years: MB.years, freq: MB.freq };
const mbPrice = IV.bondAtYield(mbSpec, MB.ytm).price;
const KD = IV.bondYield(mbSpec, Math.round(mbPrice * 100) / 100);
const DE = M.debt / M.marketCap, WD = DE / (1 + DE), WE = 1 - WD;
const WACC = WE * KE + WD * KD * (1 - T);
// the five-year forecast: working capital held at nwcShare of revenue
function forecast(o = {}) {
  const f = { ...MF, ...o }; let rev = M.revenue; const rows = [];
  f.growth.forEach((g0) => {
    const r0 = rev; rev *= 1 + g0 + (o.shift || 0);
    const ebit = f.ebitMargin * rev, nopat = ebit * (1 - T), da = f.daShare * rev, capex = f.capexShare * rev, dNwc = f.nwcShare * (rev - r0);
    rows.push({ rev, ebit, nopat, da, capex, dNwc, fcff: nopat + da - capex - dNwc });
  });
  return rows;
}
const ROWS = forecast();
const FCF = ROWS.map((r) => r.fcff);
const value = (rate, g = MF.terminalGrowth, rows = ROWS) => { const d = IV.dcf({ fcf: rows.map((r) => r.fcff), rate, g }); return { ...d, ...IV.evToEquity({ ev: d.value, debt: M.debt, cash: M.cash, shares: M.shares }) }; };
const V = value(WACC);
const grid = [0.075, 0.085, 0.095].map((w) => [0.02, 0.03, 0.04].map((g) => value(w, g).perShare));
const solve = (f, lo, hi) => { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) > 0) hi = m; else lo = m; } return (lo + hi) / 2; };
const impliedG = solve((g) => value(WACC, g).perShare - M.price, 0, 0.07);
const impliedW = solve((w) => M.price - value(w).perShare, 0.05, 0.15);
const ebitda5 = (MF.ebitMargin + MF.daShare) * ROWS[4].rev;
const VX = IV.dcf({ fcf: FCF, rate: WACC, exitMultiple: M.m.evEbitda, exitMetric: ebitda5 });
const VXps = IV.evToEquity({ ev: VX.value, debt: M.debt, cash: M.cash, shares: M.shares }).perShare;
const mLo = value(WACC, 0.03, forecast({ ebitMargin: MF.ebitMargin - 0.01 })).perShare, mHi = value(WACC, 0.03, forecast({ ebitMargin: MF.ebitMargin + 0.01 })).perShare;
// consistency: ROIC and the reinvestment growth needs
const ROIC = M.ebit * (1 - T) / (M.bookEquity + M.debt - M.cash);
const reinv5 = (ROWS[4].capex - ROWS[4].da + ROWS[4].dNwc) / ROWS[4].nopat;
const needed = MF.terminalGrowth / ROIC;
const tvVD = ROWS[4].nopat * (1 + MF.terminalGrowth) * (1 - needed) / (WACC - MF.terminalGrowth);
const evVD = V.sumPv + tvVD / (1 + WACC) ** 5;
const psVD = (evVD - M.debt + M.cash) / M.shares;
// dividends
const ROE = M.netIncome / M.bookEquity, PAYOUT = M.dps / M.eps, B = 1 - PAYOUT, GS = B * ROE;
const gord = (g) => IV.gordon({ d0: M.dps, g, ke: KE }).value;
const ms = IV.multiStageDdm({ d0: M.dps, stages: [{ years: 5, growth: 0.08 }], gT: 0.03, ke: KE });
const eps5 = M.eps * 1.08 ** 5, payT = 1 - 0.03 / ROE, d6 = eps5 * 1.03 * payT, tvD = d6 / (KE - 0.03), pvTvD = tvD / (1 + KE) ** 5;
const msC = ms.sumPv + pvTvD;
const PVGO = IV.pvgo(M.price, M.eps, KE);
// a fictional water utility (simple example)
const WW = { d0: 2.0, g: 0.03, ke: 0.075 };
const wwV = IV.gordon({ d0: WW.d0, g: WW.g, ke: WW.ke }).value;
const r1 = (x) => Math.round(x * 10) / 10;

export default {
  slug: 'discounted-cash-flow-valuation',
  title: 'Discounted cash flow valuation',
  blurb: 'Value a share as the present value of the cash it will pay: dividends discounted at the cost of equity, or free cash flow to the firm discounted at the WACC, with a terminal value and a bridge from enterprise value to a value per share. Then test how much the answer depends on the rate and on growth.',
  status: 'draft',
  objectives: [
    'Explain why a share’s intrinsic value is the present value of the cash it is expected to pay, and how that differs from its price.',
    'Calculate a share’s value with the constant-growth and multi-stage dividend discount models, and check that growth, payout and return on equity agree.',
    'Calculate free cash flow to the firm, build a five-year DCF with a Gordon terminal value, and bridge enterprise value to a value per share.',
    'Calculate the share of value that comes from the terminal value and the present value of growth opportunities.',
    'Evaluate how sensitive a DCF value is to the discount rate, terminal growth and margins, and use a reverse DCF to read what a price assumes.',
  ],
  prerequisites: [
    { lesson: 'f04/perpetuities-and-growth', why: 'The Gordon growth model and the terminal value are growing perpetuities.' },
    { lesson: 'f05/project-cash-flows', why: 'Free cash flow from EBIT after tax, depreciation, capital spending and working capital is built the same way for a project.' },
    { lesson: 'f05/weighted-average-cost-of-capital', why: 'The WACC is the rate for free cash flow to the firm; this lesson builds Morrow & Pike’s with that method.' },
    { lesson: 'f06/shares-and-markets', why: 'Market capitalisation and enterprise value, which the bridge from a DCF to a share price runs through.' },
    { lesson: 'f06/capm-and-beta', why: 'Morrow & Pike’s beta of 0.90 and the CAPM cost of equity.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In June 2028 Ana has opened her retirement account and is reading about the listed coffee companies she meets in her trade. Morrow &amp; Pike Roasters, a speciality roaster that sells to cafés and grocers, closed 2027 at $28.00 a share. Is that a fair price for what the business will earn? This module answers the question three ways: by discounting the cash the company will produce (this lesson), by comparing its price with similar companies’ (relative valuation) and by reading the business behind the numbers (fundamental analysis). Ana is not buying Morrow &amp; Pike; it is the company the course uses to learn the methods. All its figures are fictional.' },
    { p: 'A share entitles its owner to a slice of whatever the company pays out, for as long as it exists. Its <g>intrinsic value</g> is the present value of that cash, discounted at a rate that rewards the risk of receiving it. Its price is what buyers and sellers agree on today. The two can differ, and an investor who thinks they do is making a forecast: that the company will pay more (or less) than the price implies, or that the market is discounting at the wrong rate.' },
    { p: 'There are two ways to count the cash. The first follows the shareholder: a share is worth the <g>dividends</g> it will pay, discounted at the <g>cost of equity</g>. This is the <g>dividend discount model</g>, and its simplest form is F04’s <g>Gordon growth model</g>. The second follows the business: estimate the cash the operations produce before anyone is paid, the <g>free cash flow to the firm</g>, discount it at the <g>weighted average cost of capital</g> (WACC) to get the value of the whole business, its <g>enterprise value</g>, and then hand the lenders their share to leave the value of the equity. The second is what most analysts mean by a DCF, and it is the main method in this lesson.' },
    { p: 'Neither route can forecast cash for ever, so both split the future in two: a few years forecast one by one (the explicit forecast period, five years here), and everything after summarised by a <g>terminal value</g>, usually a growing perpetuity. For a healthy company the terminal value is most of the answer, which is the method’s main weakness and the reason this lesson spends as long on testing a DCF as on building one.' },
    { callout: 'key', title: 'A valuation is a set of assumptions with a number attached', html: 'Every DCF value depends on a growth path, margins, reinvestment, a discount rate and a terminal growth rate. Change any of them within a reasonable range and the value moves by more than most price differences you are trying to judge. The skill is not producing one number but knowing which assumptions drive it and what the market price assumes.' },
  ],

  theory: [
    { h: 'Dividends: the Gordon model and its limits' },
    { p: 'If dividends grow at a constant rate <m>g</m> for ever and the cost of equity is <m>r_E</m>, the share is worth <m>P_0 = D_1 \\div (r_E - g)</m>, where <m>D_1</m> is next year’s dividend. Morrow &amp; Pike paid $0.70 a share in 2027. Its cost of equity from the CAPM, with the beta of 0.90 from its 2023–2027 monthly returns (simulated for teaching and built so the regression gives F05’s beta; real return histories, such as Damodaran’s annually updated series, are where to check real-market claims), Ana’s 4.2% risk-free rate and her 5.5% market risk premium, is <m>4.2\\% + 0.90 \\times 5.5\\% = 9.15\\%</m>.' },
    { p: 'What growth? A firm that keeps a share <m>b</m> of its earnings (the <g>retention ratio</g>) and earns a <g>return on equity</g> ROE on what it keeps grows its earnings, and so its dividends, at about <m>g = b \\times \\text{ROE}</m> (F05’s sustainable growth, in its simplest form). Morrow &amp; Pike earned net income of $62.25 million on book equity of $520 million, an ROE of 12.0%, and paid out $0.70 of its $1.56 earnings per share, a <g>payout ratio</g> of 45.0%, so it retains 55.0%. Growth is <m>0.550 \\times 12.0\\% = 6.59\\%</m>, next year’s dividend $0.746, and the Gordon value <m>0.746 \\div (9.15\\% - 6.59\\%) = \\$29.11</m>, close to the $28.00 price.' },
    { p: 'Close, but fragile. The denominator is the gap between two estimates, 2.56 points here, so small changes swing the answer: at 5% growth the value is $17.71; at 6%, $23.56. And 6.59% a year for ever is a strong claim: a firm that grows faster than the economy for ever eventually becomes the economy. The model also cannot value a firm that pays no dividend, and it assumes the payout never changes, which is the next problem.' },
    { h: 'Multi-stage dividends, and keeping growth and payout consistent' },
    { p: 'A <b>multi-stage</b> model lets growth change: dividends grow fast for a few years, then settle at a long-run rate, valued by Gordon at the end of the fast stage. Suppose Morrow &amp; Pike’s dividends grow 8% a year for five years, then 3% for ever. Keeping the 45% payout throughout, the five dividends ($0.756 to $1.029) are worth $3.39 today, the terminal value at the end of year 5 is <m>1.029 \\times 1.03 \\div (9.15\\% - 3\\%) = \\$17.23</m>, worth $11.12 today, and the share $14.51: barely half the price.' },
    { p: 'That answer is inconsistent, not cautious. If growth falls to 3% while the firm still earns 12.0% on equity, it needs to retain only <m>3\\% \\div 12.0\\% = 25\\%</m> of its earnings, so its payout rises to about 75%. A mature company pays out more, not the same. The challenging worked example below redoes the valuation with the higher payout and gets $21.92. The lesson is general: in every growth model, growth must be paid for by reinvestment, and the reinvestment must match the return the company earns on it.' },

    { h: 'Free cash flow to the firm' },
    { p: 'The firm route values the business, not the dividend policy. <g>Free cash flow to the firm</g> (FCFF) is the cash the operations generate after tax and after the investment needed to keep them growing, available to all the firm’s lenders and shareholders together:' },
    { math: String.raw`\text{FCFF} = \text{EBIT}\,(1 - T) + \text{D\&A} - \text{Capital spending} - \Delta\text{NWC}` },
    { p: 'It is the same construction as a project’s cash flow in F05: operating profit taxed as if the firm had no debt (the WACC carries the tax saving on interest, so it must not be counted twice), depreciation and amortisation added back because they are not cash, capital spending and the increase in net working capital taken off because they are. Morrow &amp; Pike’s 2027: <m>92 \\times 0.75 + 26 - 34 - 4 = 57</m>, $57 million. This is not F03’s <g>free cash flow</g> (cash from operations minus capital spending), which comes after interest has been paid and so belongs to shareholders, not to the firm as a whole.' },
    { h: 'Morrow &amp; Pike’s discount rate' },
    { p: 'FCFF belongs to lenders and shareholders, so it is discounted at the WACC (F05’s method). The cost of equity is the 9.15% above. The cost of debt is the <g>yield to maturity</g> on Morrow &amp; Pike’s 2031 bond: a 4.75% coupon paid twice a year, three and a half years to run, trading at $97.80 per $100, which gives a yield of 5.45% (the bond lesson shows the calculation), or 4.09% after 25% tax. Its debt is $168 million against a <g>market capitalisation</g> of <m>\\$28.00 \\times 40\\text{ million} = \\$1{,}120</m> million, a debt-to-equity ratio of 0.15 (F05’s), so debt is 13.0% of value and equity 87.0%:' },
    { math: String.raw`\text{WACC} = 0.870 \times 9.15\% + 0.130 \times 4.09\% = 8.49\%` },
    { h: 'The five-year DCF' },
    { p: 'The forecast is a fictional analyst consensus (<code>MORROW_FORECAST</code> in the case): revenue grows 8%, 8%, 7%, 6% and 5%; the EBIT margin stays at 2027’s 12.1%; depreciation is 3.4% of revenue and capital spending 4.2%; working capital is held at 6% of revenue, so each year’s investment in it is 6% of the increase in revenue; tax is 25%. After 2032 free cash flow grows 3% a year for ever.' },
    { table: {
      caption: 'Morrow &amp; Pike Roasters: forecast free cash flow to the firm ($ millions, fictional)',
      head: ['', '2028', '2029', '2030', '2031', '2032'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Revenue', '820.8', '886.5', '948.5', '1,005.4', '1,055.7'],
        ['EBIT × (1 − 25%)', '74.5', '80.4', '86.1', '91.2', '95.8'],
        ['+ Depreciation', '27.9', '30.1', '32.2', '34.2', '35.9'],
        ['− Capital spending', '34.5', '37.2', '39.8', '42.2', '44.3'],
        ['− Increase in working capital', '3.6', '3.9', '3.7', '3.4', '3.0'],
        ['Free cash flow to the firm', '64.3', '69.4', '74.8', '79.8', '84.3'],
        ['Present value at 8.49%', '59.2', '59.0', '58.6', '57.6', '56.1'],
      ],
      note: 'Revenue in 2027 was $760 million. Each row is computed from unrounded figures, so totals may differ from the sum of the rounded entries by 0.1.',
    } },
    { p: 'The five years’ cash flows are worth $290.5 million today. The terminal value at the end of 2032 is the Gordon formula applied to 2033’s cash flow: <m>84.3 \\times 1.03 \\div (8.49\\% - 3\\%) = 1{,}582.5</m> million, worth <m>1{,}582.5 \\div 1.0849^5 = 1{,}052.9</m> million today. Enterprise value is <m>290.5 + 1{,}052.9 = 1{,}343.4</m> million. The terminal value is 78.4% of it.' },
    { p: 'Enterprise value belongs to everyone with a claim on the operations. To reach the shareholders’ part, subtract the debt and add the cash, which a buyer of the shares would also get: <m>1{,}343.4 - 168 + 30 = 1{,}205.4</m> million, or <m>\\$30.14</m> a share on 40 million shares, 7.6% above the $28.00 price. Taken at face value the DCF says the shares are slightly cheap; the next sections ask how much that conclusion is worth.' },
    { h: 'How much does the answer move?' },
    { p: 'A <g>sensitivity analysis</g> varies the inputs one or two at a time. The discount rate and terminal growth matter most, because they set the terminal value:' },
    { table: {
      caption: 'Morrow &amp; Pike value per share by WACC and terminal growth',
      head: ['WACC', 'g = 2%', 'g = 3%', 'g = 4%'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['7.5%', '$31.25', '$37.63', '$47.66'],
        ['8.5%', '$25.82', '$30.07', '$36.22'],
        ['9.5%', '$21.83', '$24.84', '$28.94'],
      ],
      note: 'The same five-year forecast in every cell. Values from $21.83 to $47.66 for inputs an analyst could defend.',
    } },
    { p: 'One point on the WACC moves the value by about $5 to $6 a share at 3% growth; one point of terminal growth by $3 to $10. One point on the EBIT margin (11.1% or 13.1% instead of 12.1%) moves it to $26.97 or $33.30. Against that range, the 7.6% gap between $30.14 and $28.00 is well inside the noise. A DCF that says “7.6% undervalued” is really saying “about right, unless you have a view on growth, margins or risk that the market does not”.' },
    { p: 'An alternative terminal value multiplies the final year’s EBITDA by an exit multiple. At Morrow &amp; Pike’s current EV/EBITDA of 10.66, 2032’s EBITDA of $163.6 million gives a terminal value of $1,744.5 million and $32.83 a share. The exit multiple hides a growth assumption: this one implies 3.49% growth for ever. Using today’s multiple at the end of the forecast also assumes the market will price the company in 2032 as it does now, so it is a check on the Gordon value rather than a replacement for it; the relative valuation lesson covers multiples.' },
    { h: 'Is the terminal value consistent?' },
    { p: 'The dividend model’s lesson applies here too. Morrow &amp; Pike’s <g>return on invested capital</g> in 2027 was <m>69 \\div (520 + 168 - 30) = 10.5\\%</m>. To grow 3% a year for ever at that return it must reinvest <m>3\\% \\div 10.5\\% = 28.6\\%</m> of its after-tax operating profit each year; in 2032 the forecast reinvests only 12.0% (capital spending above depreciation, plus working capital). A terminal value that assumes 3% growth with too little reinvestment counts growth the company has not paid for. With the reinvestment matched to the return, the terminal free cash flow is <m>95.8 \\times 1.03 \\times (1 - 0.286)</m> and the value falls to $25.16 a share. Which is right depends on whether new investment can earn more than the 10.5% the existing business does; the analyst has to say which she believes.' },
    { h: 'What the price is paying for: PVGO' },
    { p: 'If Morrow &amp; Pike stopped growing and paid out all its earnings, a share would be worth <m>\\text{EPS} \\div r_E = 1.556 \\div 9.15\\% = \\$17.01</m>. The rest of the price, <m>28.00 - 17.01 = \\$10.99</m> or 39% of it, is the <g>present value of growth opportunities</g> (PVGO): what buyers pay for the expectation that the company will invest at returns above its cost of capital. Growth adds value only when new investment earns more than the cost of capital; growth at a return equal to it adds nothing, and below it destroys value. The fundamental analysis lesson uses this to read a company.' },
    { h: 'Reading a price backwards: the reverse DCF' },
    { p: 'Because the inputs are uncertain, many analysts turn the question round and ask what the price assumes. Holding the forecast and the 8.49% WACC, a terminal growth rate of 2.54% makes the DCF equal to $28.00; holding 3% growth, a WACC of 8.86% does. The market price is consistent with long-run growth a little below the forecast’s 3%, or a discount rate about 0.4 points higher. The question becomes “do I believe Morrow &amp; Pike will grow faster than 2.5% for ever?”, which is easier to argue about than a single value.' },
  ],

  formulas: [
    { id: 'dcf-gordon-ddm', name: 'Constant-growth dividend discount model',
      tex: String.raw`P_0 = \dfrac{D_1}{r_E - g} = \dfrac{D_0\,(1 + g)}{r_E - g}`,
      where: [[String.raw`P_0`, 'Value of a share today', '$'], [String.raw`D_0, D_1`, 'Dividend per share just paid, and expected next year', '$'], [String.raw`r_E`, 'Cost of equity', '% per year'], [String.raw`g`, 'Constant growth rate of dividends, for ever', '% per year']],
      assumptions: 'Dividends grow at one rate for ever, and g is below r_E. F04 derives it as a growing perpetuity.' },
    { id: 'dcf-growth-roe', name: 'Growth from retention and return on equity',
      tex: String.raw`g = b \times \text{ROE}, \qquad b = 1 - \dfrac{\text{DPS}}{\text{EPS}}`,
      where: [[String.raw`g`, 'Growth rate of earnings and dividends', '% per year'], [String.raw`b`, 'Retention ratio: the share of earnings kept', ''], [String.raw`\text{ROE}`, 'Return on equity earned on what is kept', '% per year'], [String.raw`\text{DPS}, \text{EPS}`, 'Dividends and earnings per share', '$']],
      assumptions: 'New equity earns the same return as existing equity, and the firm issues no new shares.' },
    { id: 'dcf-multistage', name: 'Multi-stage dividend discount model',
      tex: String.raw`P_0 = \sum_{t=1}^{N} \dfrac{D_t}{(1 + r_E)^t} + \dfrac{1}{(1 + r_E)^N}\cdot\dfrac{D_{N+1}}{r_E - g_L}`,
      where: [[String.raw`P_0`, 'Value of a share today', '$'], [String.raw`D_t`, 'Dividend forecast for year t', '$'], [String.raw`N`, 'Years in the high-growth stage', 'years'], [String.raw`g_L`, 'Long-run growth rate after year N', '% per year'], [String.raw`r_E`, 'Cost of equity', '% per year']],
      assumptions: 'Growth after year N is constant and below r_E; the payout in the long-run stage should match g_L ÷ ROE.' },
    { id: 'dcf-fcff', name: 'Free cash flow to the firm',
      tex: String.raw`\text{FCFF} = \text{EBIT}\,(1 - T) + \text{D\&A} - \text{CapEx} - \Delta\text{NWC}`,
      where: [[String.raw`\text{EBIT}`, 'Earnings before interest and taxes', '$'], [String.raw`T`, 'Tax rate on profit', ''], [String.raw`\text{D\&A}`, 'Depreciation and amortisation (non-cash)', '$'], [String.raw`\text{CapEx}`, 'Capital spending on long-lived assets', '$'], [String.raw`\Delta\text{NWC}`, 'Increase in net working capital', '$']],
      assumptions: 'Interest is left out: the tax saving on it is in the WACC.' },
    { id: 'dcf-firm-value', name: 'Enterprise value by DCF with a Gordon terminal value',
      tex: String.raw`\text{EV} = \sum_{t=1}^{N} \dfrac{\text{FCFF}_t}{(1 + \text{WACC})^t} + \dfrac{1}{(1 + \text{WACC})^N}\cdot\dfrac{\text{FCFF}_N\,(1 + g)}{\text{WACC} - g}`,
      where: [[String.raw`\text{FCFF}_t`, 'Free cash flow to the firm in year t', '$'], [String.raw`N`, 'Years in the explicit forecast', 'years'], [String.raw`\text{WACC}`, 'Weighted average cost of capital', '% per year'], [String.raw`g`, 'Terminal growth rate of free cash flow, for ever', '% per year']],
      assumptions: 'Cash flows arrive at the end of each year; g is below the WACC and sustainable for ever (no faster than the economy in the long run).',
      note: 'Some analysts discount each year from its middle (the mid-year convention), which raises the value slightly.' },
    { id: 'dcf-equity-bridge', name: 'From enterprise value to value per share',
      tex: String.raw`\text{Value per share} = \dfrac{\text{EV} - \text{Debt} + \text{Cash}}{\text{Shares outstanding}}`,
      where: [[String.raw`\text{EV}`, 'Enterprise value: the value of the operations', '$'], [String.raw`\text{Debt}`, 'Interest-bearing debt (and any other claims ahead of shareholders)', '$'], [String.raw`\text{Cash}`, 'Cash not needed to run the business', '$'], [String.raw`\text{Shares outstanding}`, 'Number of shares', 'shares']],
      assumptions: 'Minority interests and preferred stock, where a company has them, are subtracted like debt.' },
    { id: 'dcf-pvgo', name: 'Present value of growth opportunities',
      tex: String.raw`\text{PVGO} = P_0 - \dfrac{\text{EPS}_1}{r_E}`,
      where: [[String.raw`P_0`, 'Share price', '$'], [String.raw`\text{EPS}_1`, 'Earnings per share the firm could pay out for ever with no growth (last year’s is often used)', '$'], [String.raw`r_E`, 'Cost of equity', '% per year']],
      assumptions: 'With no new investment, earnings stay flat and are all paid out.' },
  ],

  examples: [
    { level: 'simple', title: 'A water utility by the Gordon model', fictional: true,
      setup: 'Windrush Water (fictional, listed) has just paid a dividend of $2.00 a share. Its dividends have grown steadily and are expected to grow 3% a year indefinitely. Shareholders require 7.5%. What is a share worth?',
      steps: [
        'The Gordon model needs next year’s dividend: <m>D_1 = 2.00 \\times 1.03 = \\$2.06</m>.',
        'The gap between the required return and growth: <m>7.5\\% - 3\\% = 4.5\\%</m>.',
        'Value: <m>P_0 = 2.06 \\div 0.045 = \\$45.78</m>.',
      ],
      answer: 'About $45.78 a share.',
      interpretation: 'A regulated utility with steady dividends is the case the model was built for. Even here the value rests on a 4.5-point gap: at 3.5% growth it would be $51.75, at 2.5% $41.00.' },
    { level: 'challenging', title: 'Morrow &amp; Pike: two-stage dividends with a consistent payout', fictional: true,
      setup: 'Morrow &amp; Pike’s 2027 EPS was $1.556 and its dividend $0.70 (payout 45%); its ROE is 12.0% and its cost of equity 9.15%. Suppose dividends and earnings grow 8% a year for five years, then 3% for ever, and that once growth slows the company pays out what it no longer needs to reinvest. Value a share, and compare it with the $14.51 the model gives when the payout stays at 45%.',
      steps: [
        'Stage 1 dividends: $0.756, $0.816, $0.882, $0.952 and $1.029. Discounted at 9.15% they are worth $3.39 today (the same as with a fixed payout: only the terminal value changes).',
        'Retention needed for 3% growth at an ROE of 12.0%: <m>b = g \\div \\text{ROE} = 0.03 \\div 0.1197 = 25.1\\%</m>, so the long-run payout is 74.9%.',
        'EPS in year 5: <m>1.556 \\times 1.08^5 = 2.287</m>. Year-6 dividend: <m>2.287 \\times 1.03 \\times 0.749 = \\$1.765</m>.',
        'Terminal value at the end of year 5: <m>1.765 \\div (9.15\\% - 3\\%) = \\$28.70</m>, worth <m>28.70 \\div 1.0915^5 = \\$18.52</m> today.',
        'Value: <m>3.39 + 18.52 = \\$21.92</m>.',
      ],
      answer: 'About $21.92 a share, against $14.51 with the payout frozen at 45%.',
      interpretation: 'The $7.41 difference comes entirely from treating the mature company consistently. The dividend model still gives less than the $28.00 price and the $30.14 DCF, partly because 8% for five years then 3% is a modest growth path, and partly because dividends ignore value the firm keeps; a gap between methods is a prompt to find out which assumption differs, not to average them.' },
    { level: 'applied', title: 'A reverse DCF in a fund manager’s review', fictional: true,
      setup: 'A fund manager (fictional) holds Morrow &amp; Pike and is reviewing it at the $28.00 price. Her analyst’s DCF says $30.14 at an 8.49% WACC and 3% terminal growth. Rather than argue about $2.14, she asks: what terminal growth does the price imply, holding the analyst’s five-year forecast and WACC?',
      steps: [
        'Write the value per share as a function of g: <m>[290.5 + \\text{TV}(g) \\div 1.0849^5 - 168 + 30] \\div 40</m>, with <m>\\text{TV}(g) = 84.34\\,(1 + g) \\div (0.0849 - g)</m>.',
        'Set it equal to $28.00: the equity must be $1,120 million, so the enterprise value $1,258 million, so the terminal value is worth $967.5 million today.',
        'Solve for g (by trial or Goal Seek): <m>g = 2.54\\%</m>. Holding g at 3% instead, the WACC that gives $28.00 is 8.86%.',
        'Compare with what she knows: the forecast ends with 5% growth in 2032, and 2.5% for ever is below most estimates of long-run nominal growth in the economy.',
      ],
      answer: 'The price implies terminal growth of about 2.54% (or a WACC of about 8.86%).',
      interpretation: 'The price asks for modest long-run growth, so she keeps the holding without treating it as a bargain. If the company’s long-run growth were in doubt, the same calculation would show how little room there is.' },
  ],

  demo: [
    { widget: 'dcf-morrow', intro: 'Morrow &amp; Pike’s DCF. Move the WACC and terminal growth first: watch the terminal value’s share of the total and how far the value per share travels from the $28.00 price. Then change the EBIT margin and the growth path. Push terminal growth towards the WACC and the value explodes; that is the formula’s denominator, not the company.' },
    { widget: 'dcf-gordon', intro: 'The Gordon model with the PVGO split. Start at Morrow &amp; Pike’s figures and set growth to 0: the value is the no-growth value. Then see how quickly the value climbs as growth approaches the cost of equity.' },
  ],

  mistakes: [
    { title: 'Discounting free cash flow to the firm at the cost of equity', html: 'FCFF belongs to lenders and shareholders, so its rate is the WACC; dividends (and free cash flow to equity) belong to shareholders, so their rate is the cost of equity. Discounting Morrow &amp; Pike’s FCFF at 9.15% instead of 8.49% gives $26.48 a share: a different answer from a mismatched rate, not a more cautious one.' },
    { title: 'Stopping at enterprise value', html: 'The DCF of FCFF values the whole business. Dividing it by the number of shares ($1,343.4m ÷ 40m = $33.59) gives every dollar of the lenders’ claim to the shareholders. Subtract debt, add cash, then divide.' },
    { title: 'Terminal growth that is too high or unpaid for', html: 'A terminal growth rate close to the discount rate makes the value as large as you like. Keep it at or below long-run growth in the economy, and check that the forecast reinvests enough to earn it: growth ÷ return on capital.' },
    { title: 'Treating the DCF value as precise', html: 'A value of $30.14 against a price of $28.00 is not a 7.6% opportunity when one point on the WACC moves the value by $5. Report a range from defensible inputs, and say which input decides the conclusion.' },
    { title: 'Freezing the payout in a multi-stage dividend model', html: 'When growth slows, a firm needs to reinvest less and can pay out more. Keeping the high-growth payout in the long-run stage understates value (Morrow &amp; Pike: $14.51 instead of $21.92). Set the long-run payout to 1 − g ÷ ROE.' },
    { title: 'Counting interest twice', html: 'FCFF uses EBIT × (1 − T), with no interest deducted, because the WACC already uses the after-tax cost of debt. Subtracting interest from the cash flows as well undervalues the firm.' },
  ],

  application: [
    { p: '<b>An equity analyst’s model.</b> A sell-side analyst covering food and drink companies keeps a DCF for each. She updates the forecast after every set of results, rebuilds the WACC once a year, and publishes a target price with a sensitivity table, because clients want to know what has to be true for the shares to be worth more. Most of her time goes on the drivers (volume, prices, margins, capital spending) rather than on the discounting, which a spreadsheet does in one line.' },
    { p: '<b>A company buying another.</b> When a listed food group (fictional) considers buying a roaster, its corporate development team values the target by DCF at the target’s own WACC (its risk, not the buyer’s), on the buyer’s forecast including the savings it expects. The DCF gives the most it should pay; anything above that transfers value to the seller’s shareholders. The same team always checks the DCF against what comparable companies trade at.' },
    { p: '<b>Ana’s own use.</b> Ana will probably never buy shares in Morrow &amp; Pike. What she takes from this lesson is a habit for any share someone tells her is cheap: ask what the price assumes about growth and risk, and whether that is more or less believable than the story. The course project asks her to apply it to a coffee company she knows well, which is exactly when the habit is hardest to keep.' },
  ],

  summary: [
    'A share’s intrinsic value is the present value of the cash it will pay; price is what the market agrees today.',
    'Gordon: P₀ = D₁ ÷ (r_E − g), with g ≈ b × ROE. Morrow & Pike: 9.15% cost of equity, 6.59% growth, $29.11; very sensitive to the gap r_E − g.',
    'In multi-stage models, raise the long-run payout to 1 − g ÷ ROE: growth must be paid for by reinvestment.',
    'FCFF = EBIT(1 − T) + D&A − capital spending − ΔNWC, discounted at the WACC (Morrow & Pike 8.49%), plus a Gordon terminal value, gives enterprise value: $1,343.4 million.',
    'Equity = EV − debt + cash; Morrow & Pike $30.14 a share against a $28.00 price, with 78.4% of the value in the terminal value.',
    'Sensitivity: one point on the WACC or terminal growth moves the value by several dollars a share; report a range.',
    'PVGO = P₀ − EPS ÷ r_E: $10.99 of Morrow & Pike’s price pays for growth. A reverse DCF reads the growth (2.54%) a price implies.',
  ],
  glossary: [
    { term: 'Intrinsic value', def: 'What an asset is worth on an analyst’s estimate of the cash it will produce and the return its risk requires, as distinct from its market price.' },
    { term: 'Dividend discount model', def: 'A valuation of a share as the present value of the dividends it is expected to pay, discounted at the cost of equity. The Gordon growth model is its constant-growth form. Abbreviated DDM.' },
    { term: 'Free cash flow to the firm', def: 'The cash a company’s operations generate after tax and after the investment in long-lived assets and working capital needed to sustain them, before any payment to lenders or shareholders: EBIT × (1 − tax rate) + depreciation and amortisation − capital spending − the increase in net working capital. Abbreviated FCFF.' },
    { term: 'Present value of growth opportunities', def: 'The part of a share’s price above the value of its current earnings as a no-growth perpetuity (earnings per share ÷ cost of equity): what investors pay for expected profitable growth. Abbreviated PVGO.' },
    { term: 'Reverse discounted cash flow', def: 'Solving a DCF model for the growth rate, margin or discount rate that makes its value equal the market price, to see what the price assumes. Also called a reverse DCF.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 11.2, “Dividend Discount Models (DDMs)”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/11-2-dividend-discount-models-ddms', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 11.3, “Discounted Cash Flow (DCF) Model”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/11-3-discounted-cash-flow-dcf-model', checked: '2026-11-11' },
    { text: 'Microsoft. <i>NPV function</i>. Microsoft Support.', url: 'https://support.microsoft.com/en-us/office/npv-function-8672cb67-2576-4d07-b67b-ac28acf2a568', checked: '2026-11-11' },
    { text: 'Damodaran, A. <i>Historical Returns on Stocks, Bonds and Bills</i> (data page, updated 5 January 2026). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'Price', value: M.price, shown: 28.00 },
    { what: 'Dividend 2027', value: M.dps, shown: 0.70 },
    { what: 'Beta (simulated regression equals F05)', value: BETA, shown: 0.90 },
    { what: 'Risk-free rate', value: rf * 100, shown: 4.2 },
    { what: 'MRP', value: mrp * 100, shown: 5.5 },
    { what: 'Cost of equity', value: KE * 100, shown: 9.15 },
    { what: 'Net income', value: M.netIncome, shown: 62.25 },
    { what: 'Book equity', value: M.bookEquity, shown: 520 },
    { what: 'ROE', value: ROE * 100, shown: 12.0, tol: 0.05 },
    { what: 'EPS', value: M.eps, shown: 1.56 },
    { what: 'EPS 3 dp', value: M.eps, shown: 1.556, tol: 0.0005 },
    { what: 'Payout', value: PAYOUT * 100, shown: 45.0, tol: 0.05 },
    { what: 'Retention', value: B * 100, shown: 55.0, tol: 0.05 },
    { what: 'Retention 3 dp', value: B, shown: 0.550, tol: 0.0005 },
    { what: 'Sustainable growth', value: GS * 100, shown: 6.59 },
    { what: 'Next dividend', value: M.dps * (1 + GS), shown: 0.746, tol: 0.0005 },
    { what: 'Gordon value', value: gord(GS), shown: 29.11 },
    { what: 'Gap ke − g', value: (KE - GS) * 100, shown: 2.56 },
    { what: 'Gordon at 5%', value: gord(0.05), shown: 17.71 },
    { what: 'Gordon at 6%', value: gord(0.06), shown: 23.56 },
    { what: 'Stage-1 first dividend', value: ms.rows[0].dividend, shown: 0.756, tol: 0.0005 },
    { what: 'Stage-1 2nd dividend', value: ms.rows[1].dividend, shown: 0.816, tol: 0.0005 },
    { what: 'Stage-1 3rd dividend', value: ms.rows[2].dividend, shown: 0.882, tol: 0.0005 },
    { what: 'Stage-1 4th dividend', value: ms.rows[3].dividend, shown: 0.952, tol: 0.0005 },
    { what: 'Stage-1 last dividend', value: ms.rows[4].dividend, shown: 1.029, tol: 0.0005 },
    { what: 'PV stage 1', value: ms.sumPv, shown: 3.39 },
    { what: 'Fixed-payout TV', value: ms.tv, shown: 17.23 },
    { what: 'PV fixed-payout TV', value: ms.pvTV, shown: 11.12 },
    { what: 'Fixed-payout DDM', value: ms.value, shown: 14.51 },
    { what: 'Retention needed at 3% (rounded ROE)', value: 0.03 / 0.12 * 100, shown: 25 },
    { what: 'Long-run payout about 75%', value: payT * 100, shown: 75, tol: 0.2 },
    { what: 'Retention needed exact', value: (1 - payT) * 100, shown: 25.1, tol: 0.05 },
    { what: 'ROE 4 dp', value: ROE, shown: 0.1197, tol: 0.00005 },
    { what: 'Long-run payout', value: payT * 100, shown: 74.9, tol: 0.05 },
    { what: 'EPS year 5', value: eps5, shown: 2.287, tol: 0.0005 },
    { what: 'Payout 3 dp used', value: payT, shown: 0.749, tol: 0.0005 },
    { what: 'Year-6 dividend', value: d6, shown: 1.765, tol: 0.0005 },
    { what: 'Consistent TV', value: tvD, shown: 28.70 },
    { what: 'PV consistent TV', value: pvTvD, shown: 18.52 },
    { what: 'Consistent DDM', value: msC, shown: 21.92 },
    { what: 'Difference from fixed payout', value: msC - ms.value, shown: 7.41 },
    { what: '2027 EBIT', value: M.ebit, shown: 92 },
    { what: '2027 D&A', value: M.da, shown: 26 },
    { what: '2027 capex', value: M.capex, shown: 34 },
    { what: '2027 ΔNWC', value: M.dNwc, shown: 4 },
    { what: '2027 FCFF', value: M.fcff, shown: 57 },
    { what: 'Bond coupon', value: MB.couponRate * 100, shown: 4.75 },
    { what: 'Bond years', value: MB.years, shown: 3.5 },
    { what: 'Bond semi-annual', value: MB.freq, shown: 2 },
    { what: 'Bond price', value: mbPrice, shown: 97.80 },
    { what: 'Bond yield from the price', value: KD * 100, shown: 5.45 },
    { what: 'After-tax cost of debt', value: KD * (1 - T) * 100, shown: 4.09 },
    { what: 'Debt', value: M.debt, shown: 168 },
    { what: 'Shares', value: M.shares, shown: 40 },
    { what: 'Market cap', value: M.marketCap, shown: 1120 },
    { what: 'D/E', value: DE, shown: 0.15 },
    { what: 'D/V', value: WD * 100, shown: 13.0, tol: 0.05 },
    { what: 'E/V', value: WE * 100, shown: 87.0, tol: 0.05 },
    { what: 'E/V 3 dp', value: WE, shown: 0.870, tol: 0.0005 },
    { what: 'D/V 3 dp', value: WD, shown: 0.130, tol: 0.0005 },
    { what: 'WACC', value: WACC * 100, shown: 8.49 },
    ...[8, 8, 7, 6, 5].map((x, i) => ({ what: `Growth ${2028 + i}`, value: MF.growth[i] * 100, shown: x })),
    { what: 'EBIT margin', value: MF.ebitMargin * 100, shown: 12.1 },
    { what: '2027 margin equals forecast margin', value: M.ebit / M.revenue * 100, shown: 12.1, tol: 0.05 },
    { what: 'D&A share', value: MF.daShare * 100, shown: 3.4 },
    { what: 'Capex share', value: MF.capexShare * 100, shown: 4.2 },
    { what: 'NWC share', value: MF.nwcShare * 100, shown: 6 },
    { what: 'Tax', value: T * 100, shown: 25 },
    { what: 'Terminal growth', value: MF.terminalGrowth * 100, shown: 3 },
    { what: 'Revenue 2027', value: M.revenue, shown: 760 },
    ...[['Revenue', 'rev', [820.8, 886.5, 948.5, 1005.4, 1055.7]], ['NOPAT', 'nopat', [74.5, 80.4, 86.1, 91.2, 95.8]], ['D&A', 'da', [27.9, 30.1, 32.2, 34.2, 35.9]], ['Capex', 'capex', [34.5, 37.2, 39.8, 42.2, 44.3]], ['ΔNWC', 'dNwc', [3.6, 3.9, 3.7, 3.4, 3.0]], ['FCFF', 'fcff', [64.3, 69.4, 74.8, 79.8, 84.3]]]
      .flatMap(([n, k, s]) => s.map((x, i) => ({ what: `${n} ${2028 + i}`, value: ROWS[i][k], shown: x, tol: 0.051 }))),
    ...[59.2, 59.0, 58.6, 57.6, 56.1].map((x, i) => ({ what: `PV ${2028 + i}`, value: V.pv[i], shown: x, tol: 0.051 })),
    { what: 'PV of five years', value: V.sumPv, shown: 290.5, tol: 0.051 },
    { what: 'Last FCFF 2 dp', value: FCF[4], shown: 84.34 },
    { what: 'Terminal value', value: V.tv, shown: 1582.5, tol: 0.051 },
    { what: 'PV of TV', value: V.pvTv, shown: 1052.9, tol: 0.051 },
    { what: 'EV', value: V.value, shown: 1343.4, tol: 0.051 },
    { what: 'TV share', value: V.tvShare * 100, shown: 78.4, tol: 0.05 },
    { what: 'Cash', value: M.cash, shown: 30 },
    { what: 'Equity', value: V.equity, shown: 1205.4, tol: 0.051 },
    { what: 'Value per share', value: V.perShare, shown: 30.14 },
    { what: 'Above price', value: (V.perShare / M.price - 1) * 100, shown: 7.6, tol: 0.05 },
    { what: 'Gap to price', value: V.perShare - M.price, shown: 2.14 },
    ...[[31.25, 37.63, 47.66], [25.82, 30.07, 36.22], [21.83, 24.84, 28.94]].flatMap((row, i) => row.map((x, j) => ({ what: `Grid ${i},${j}`, value: grid[i][j], shown: x }))),
    { what: 'One WACC point moves value $5–6 at 3%', value: (grid[0][1] - grid[1][1] >= 5 && grid[0][1] - grid[1][1] <= 8 && grid[1][1] - grid[2][1] >= 5 && grid[1][1] - grid[2][1] <= 6) ? 1 : 0, shown: 1 },
    { what: 'One g point moves value $4–10', value: Math.min(...grid.flatMap((r) => [r[1] - r[0], r[2] - r[1]])) >= 3 && Math.max(...grid.flatMap((r) => [r[1] - r[0], r[2] - r[1]])) <= 10.1 ? 1 : 0, shown: 1 },
    { what: 'Margin −1', value: mLo, shown: 26.97 },
    { what: 'Margin +1', value: mHi, shown: 33.30 },
    { what: 'Margin −1 label', value: (MF.ebitMargin - 0.01) * 100, shown: 11.1 },
    { what: 'Margin +1 label', value: (MF.ebitMargin + 0.01) * 100, shown: 13.1 },
    { what: 'EV/EBITDA now', value: M.m.evEbitda, shown: 10.66 },
    { what: 'EBITDA 2032', value: ebitda5, shown: 163.6, tol: 0.051 },
    { what: 'Exit TV', value: VX.tv, shown: 1744.5, tol: 0.051 },
    { what: 'Exit per share', value: VXps, shown: 32.83 },
    { what: 'Exit implied growth', value: VX.impliedGrowth * 100, shown: 3.49 },
    { what: '2027 NOPAT', value: M.ebit * (1 - T), shown: 69 },
    { what: 'Invested capital', value: M.bookEquity + M.debt - M.cash, shown: 658 },
    { what: 'ROIC', value: ROIC * 100, shown: 10.5, tol: 0.05 },
    { what: 'Reinvestment needed', value: needed * 100, shown: 28.6, tol: 0.05 },
    { what: 'Reinvestment needed 3 dp', value: needed, shown: 0.286, tol: 0.0005 },
    { what: 'Reinvestment 2032', value: reinv5 * 100, shown: 12.0, tol: 0.05 },
    { what: 'NOPAT 2032', value: ROWS[4].nopat, shown: 95.8, tol: 0.051 },
    { what: 'Value-driver per share', value: psVD, shown: 25.16 },
    { what: 'No-growth value', value: M.eps / KE, shown: 17.01 },
    { what: 'PVGO', value: PVGO, shown: 10.99 },
    { what: 'PVGO share of price', value: PVGO / M.price * 100, shown: 39, tol: 0.5 },
    { what: 'Implied terminal growth', value: impliedG * 100, shown: 2.54 },
    { what: 'Implied terminal growth about 2.5', value: impliedG * 100, shown: 2.5, tol: 0.05 },
    { what: 'Implied WACC', value: impliedW * 100, shown: 8.86 },
    { what: 'Implied WACC gap', value: (impliedW - WACC) * 100, shown: 0.4, tol: 0.05 },
    { what: 'Equity at price', value: M.price * M.shares, shown: 1120 },
    { what: 'EV at price', value: M.price * M.shares + M.debt - M.cash, shown: 1258 },
    { what: 'PV of TV at price', value: M.price * M.shares + M.debt - M.cash - V.sumPv, shown: 967.5, tol: 0.051 },
    { what: 'Forecast ends at 5%', value: MF.growth[4] * 100, shown: 5 },
    { what: 'FCFF at cost of equity', value: value(KE).perShare, shown: 26.48 },
    { what: 'EV per share', value: V.value / M.shares, shown: 33.59 },
    { what: 'Windrush D1', value: WW.d0 * (1 + WW.g), shown: 2.06 },
    { what: 'Windrush gap', value: (WW.ke - WW.g) * 100, shown: 4.5 },
    { what: 'Windrush value', value: wwV, shown: 45.78 },
    { what: 'Windrush at 3.5%', value: IV.gordon({ d0: 2, g: 0.035, ke: 0.075 }).value, shown: 51.75 },
    { what: 'Windrush at 2.5%', value: IV.gordon({ d0: 2, g: 0.025, ke: 0.075 }).value, shown: 41.00 },
    { what: 'Rounded checks', value: r1(V.tvShare * 100), shown: 78.4 },
  ],
};
