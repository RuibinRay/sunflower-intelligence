// discounted-cash-flow-valuation.ex.js — F06 · Discounted cash flow valuation: widgets, practice and the knowledge
// check (answer keys live here). Morrow & Pike Roasters and Harbour Street Foods come from case.js; every other business
// named here (Windrush Water, Ivelston Bakeries, Hesketh Freight, Sandling Storage, Tarrow Mills) is fictional.
// Brightcup Coffee is the course project’s and is not valued here.
import { COMPANIES, MORROW_FORECAST as MF, BONDS, MARKET } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const M = COMPANIES.morrow, H = COMPANIES.harbour;
const { rf, mrp } = MARKET;
const T = M.tax;
const KE = IV.capm({ rf, beta: 0.9, mrp });
const MB = BONDS.find((b) => b.name.startsWith('Morrow'));
const KD = MB.ytm;
const WD = (M.debt / M.marketCap) / (1 + M.debt / M.marketCap), WE = 1 - WD;
const WACC = WE * KE + WD * KD * (1 - T);
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;
const mil = (v, d = 1) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}m`;
const money = (v) => `$${v.toFixed(2)}`;
function forecast({ margin = MF.ebitMargin, shift = 0 } = {}) {
  let rev = M.revenue; const rows = [];
  MF.growth.forEach((g0) => { const r0 = rev; rev *= 1 + g0 + shift; rows.push(margin * rev * (1 - T) + MF.daShare * rev - MF.capexShare * rev - MF.nwcShare * (rev - r0)); });
  return rows;
}
const FCF = forecast();
const KEH = IV.capm({ rf, beta: 1.25, mrp });

export const widgets = {
  'dcf-morrow': {
    type: 'formula',
    title: 'Morrow & Pike Roasters: discounted cash flow',
    intro: 'A five-year forecast of free cash flow to the firm, a Gordon terminal value and the bridge to a value per share. The starting values are the lesson’s (all figures fictional): WACC 8.49%, terminal growth 3%, EBIT margin 12.1% and the consensus growth path (8%, 8%, 7%, 6%, 5%).',
    inputs: [
      { id: 'wacc', label: 'WACC', min: 6, max: 12, step: 0.01, value: Math.round(WACC * 10000) / 100, fmt: 'pct', digits: 2 },
      { id: 'g', label: 'Terminal growth (after 2032)', min: 0, max: 5, step: 0.25, value: 3, fmt: 'pct', digits: 2 },
      { id: 'margin', label: 'EBIT margin, every year', min: 9, max: 15, step: 0.1, value: 12.1, fmt: 'pct' },
      { id: 'shift', label: 'Change to every year’s revenue growth', min: -4, max: 4, step: 1, value: 0, fmt: 'pct', unit: ' points' },
    ],
    compute: (v) => {
      const w = v.wacc / 100, g = v.g / 100;
      if (w <= g + 0.0025) return { error: 'The WACC has to be clearly above terminal growth: as growth approaches the discount rate, the Gordon terminal value grows without limit.' };
      const fcf = forecast({ margin: v.margin / 100, shift: v.shift / 100 });
      const d = IV.dcf({ fcf, rate: w, g });
      const e = IV.evToEquity({ ev: d.value, debt: M.debt, cash: M.cash, shares: M.shares });
      const gap = e.perShare / M.price - 1;
      let note = `The terminal value is ${pct(d.tvShare, 1)} of the enterprise value. `;
      note += Math.abs(gap) < 0.1 ? `The value is within 10% of the $28.00 price: well inside what a change of half a point in the WACC or terminal growth would move it.` : gap > 0 ? `The value is ${pct(gap, 0)} above the $28.00 price: these inputs say the market is too pessimistic. Which input would you have to defend?` : `The value is ${pct(-gap, 0)} below the $28.00 price: on these inputs the shares look expensive.`;
      if (g >= 0.04) note += ' Terminal growth of 4% or more for ever is above most estimates of long-run growth in the economy.';
      return {
        headline: { label: 'Value per share', value: money(e.perShare) },
        rows: [
          ['Free cash flow 2028–2032', fcf.map((x) => x.toFixed(1)).join(', ') + ' ($m)'],
          ['Present value of 2028–2032', mil(d.sumPv)],
          ['Terminal value at end-2032 (present value)', `${mil(d.tv)} (${mil(d.pvTv)})`],
          ['Enterprise value', mil(d.value)],
          ['− debt $168m + cash $30m = equity', mil(e.equity)],
          ['Price at 31 December 2027', '$28.00'],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Source of value', values: ['2028', '2029', '2030', '2031', '2032', 'TV'] },
          series: [{ name: 'Present value', values: [...d.pv, d.pvTv].map((x) => Math.round(x * 10) / 10) }], y: { label: 'Present value ($m)' } },
      };
    },
  },
  'dcf-gordon': {
    type: 'formula',
    title: 'The Gordon model and the value of growth',
    intro: 'Value a share from its dividend, growth and the cost of equity, and split the value into the no-growth value of current earnings and the present value of growth opportunities. Starting values: Morrow & Pike (fictional), dividend $0.70, EPS $1.56, cost of equity 9.15%, growth 6.59% (retention × ROE).',
    inputs: [
      { id: 'd0', label: 'Dividend just paid', min: 0.1, max: 3, step: 0.01, value: 0.70, fmt: 'money' },
      { id: 'eps', label: 'Earnings per share', min: 0.2, max: 5, step: 0.01, value: 1.56, fmt: 'money' },
      { id: 'ke', label: 'Cost of equity', min: 5, max: 14, step: 0.05, value: 9.15, fmt: 'pct', digits: 2 },
      { id: 'g', label: 'Dividend growth, for ever', min: 0, max: 8, step: 0.01, value: 6.59, fmt: 'pct', digits: 2 },
    ],
    compute: (v) => {
      const ke = v.ke / 100, g = v.g / 100;
      if (ke <= g + 0.0025) return { error: 'The cost of equity has to be clearly above growth; otherwise the formula has no finite answer.' };
      const P = v.d0 * (1 + g) / (ke - g), ng = v.eps / ke, pvgo = P - ng;
      const gs = Array.from({ length: 9 }, (_, i) => i).filter((x) => x / 100 < ke - 0.005);
      return {
        headline: { label: 'Value per share', value: money(P) },
        rows: [
          ['Next year’s dividend', money(v.d0 * (1 + g))],
          ['Payout ratio (dividend ÷ EPS)', pct(v.d0 / v.eps, 1)],
          ['No-growth value (EPS ÷ cost of equity)', money(ng)],
          ['Present value of growth opportunities', money(pvgo)],
        ],
        note: pvgo < 0 ? 'The model’s value is below the no-growth value: on these inputs the firm pays out too little for the growth it gets, so retaining earnings destroys value. Growth only adds value when reinvestment earns more than the cost of equity.'
          : `The gap between the cost of equity and growth is ${pct(ke - g)}. Halve it and the value roughly doubles: the model is most fragile exactly when growth is high.`,
        chart: { kind: 'line', x: { label: 'Growth (%)', values: gs }, series: [{ name: 'Value', values: gs.map((x) => Math.round(v.d0 * (1 + x / 100) / (ke - x / 100) * 100) / 100) }], y: { label: 'Value per share ($)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f06-dcf-g1', type: 'steps', kind: 'numerical',
    prompt: 'Ivelston Bakeries (fictional, listed) has just paid a dividend of $1.50 a share. Analysts expect dividends to grow 2.5% a year indefinitely, and shareholders require 7%.',
    solution: 'D₁ = 1.50 × 1.025 = $1.5375. Value = 1.5375 ÷ (0.07 − 0.025) = $34.17. At 3.5% growth: 1.50 × 1.035 ÷ (0.07 − 0.035) = 1.5525 ÷ 0.035 = $44.36. One point more growth raises the value by 30%, because it narrows the denominator from 4.5 to 3.5 points.',
    steps: [
      { id: 'f06-dcf-g1-s1', type: 'num', prompt: 'What dividend does the model use? Give dollars to four decimal places.',
        answer: 1.5375, check: () => 1.5 * 1.025, unit: '$', places: 4, tol: 0.0005,
        hints: ['The Gordon model divides next year’s dividend, not the one just paid.', '1.50 × (1 + 0.025).'],
        wrong: [{ value: 1.5, say: 'That is the dividend just paid. Grow it one year first.' }] },
      { id: 'f06-dcf-g1-s2', type: 'num', prompt: 'What is a share worth? Give dollars and cents.',
        answer: 34.17, check: () => IV.gordon({ d0: 1.5, g: 0.025, ke: 0.07 }).value, unit: '$', places: 2, tol: 0.02,
        hints: ['P₀ = D₁ ÷ (r_E − g).', '1.5375 ÷ 0.045.'],
        wrong: [{ value: 33.33, say: 'That divides the dividend just paid (1.50 ÷ 0.045). Use next year’s, $1.5375.' }, { value: 16.4, say: 'That divides by r_E + g. The formula subtracts growth: the faster dividends grow, the more they are worth.' }] },
      { id: 'f06-dcf-g1-s3', type: 'num', prompt: 'If growth were 3.5% instead, what would a share be worth? Give dollars and cents.',
        answer: 44.36, check: () => IV.gordon({ d0: 1.5, g: 0.035, ke: 0.07 }).value, unit: '$', places: 2, tol: 0.02,
        hints: ['Recompute D₁ with the new growth rate too.', '1.5525 ÷ 0.035.'],
        wrong: [{ value: 43.93, say: 'You kept D₁ at $1.5375. Next year’s dividend also grows at 3.5%: $1.5525.' }] },
    ],
  },
  {
    id: 'f06-dcf-g2', type: 'steps', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) reported for 2027: EBIT $290 million, depreciation and amortisation $120 million, capital spending $125 million and an increase in net working capital of $10 million. Its tax rate is 25%, and it paid $64 million of interest.',
    solution: 'EBIT after tax: 290 × 0.75 = $217.5 million. FCFF = 217.5 + 120 − 125 − 10 = $202.5 million. Interest is left out because FCFF is the cash available to lenders and shareholders together; the tax saving on interest is counted in the WACC instead.',
    steps: [
      { id: 'f06-dcf-g2-s1', type: 'num', prompt: 'What is Harbour Street’s EBIT after tax, EBIT × (1 − T), in $ millions?',
        answer: 217.5, check: () => H.ebit * (1 - H.tax), unit: '$m', places: 1, tol: 0.05,
        hints: ['Tax the operating profit as if there were no debt.'],
        wrong: [{ value: 169.5, say: 'That is net income: it takes interest off first. FCFF starts from operating profit before interest.' }, { value: 72.5, say: 'That is the tax, not the profit after it.' }] },
      { id: 'f06-dcf-g2-s2', type: 'num', prompt: 'What is its free cash flow to the firm in 2027, in $ millions?',
        answer: 202.5, check: () => H.fcff, unit: '$m', places: 1, tol: 0.05,
        hints: ['Add back the non-cash charge; take off the two investments.', '217.5 + 120 − 125 − 10.'],
        wrong: [{ value: 222.5, say: 'You added the increase in working capital. Money tied up in stock and receivables is cash spent: subtract it.' }, { value: -37.5, say: 'Depreciation was deducted to reach EBIT but is not a cash payment: add it back.' }, { value: 154.5, say: 'That deducts interest after tax (64 × 0.75 = 48). FCFF is before any payment to lenders.' }] },
      { id: 'f06-dcf-g2-s3', type: 'mc', prompt: 'Why does free cash flow to the firm leave out the $64 million of interest?',
        options: ['FCFF is the cash for lenders and shareholders together, and the WACC carries the interest tax saving', 'Interest is a non-cash expense, like depreciation, so it never affects cash flow', 'Interest is paid out of equity, so it belongs in the dividend model instead', 'Harbour Street’s interest is small enough to ignore in a valuation of the whole firm'],
        answer: 0,
        hints: ['Who is FCFF available to?'],
        feedback: { 1: 'Interest is paid in cash. It is left out because lenders are among the people FCFF belongs to.', 2: 'Interest is paid to lenders before shareholders; it is not a dividend.', 3: '$64 million is a third of net income; it is left out by design, not for being small.' } },
    ],
  },
  {
    id: 'f06-dcf-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds Morrow & Pike’s WACC, its terminal growth rate and its forecast free cash flow for 2032 ($ millions). In B5, write a formula for the terminal value at the end of 2032: the value then of every cash flow from 2033 on, growing at the terminal rate for ever.',
    sheet: { cells: { A1: 'WACC', B1: 0.0849, A2: 'Terminal growth', B2: 0.03, A3: 'FCFF 2032 ($m)', B3: 84.34, A5: 'Terminal value, end-2032 ($m)' },
      vary: { B1: [0.0795, 0.093], B2: [0.025, 0.035] } },
    cell: 'B5', view: 'A1:B5', widths: { A: 30, B: 12 }, formats: { B1: '0.00%', B2: '0.00%', B3: '#,##0.00', B5: '#,##0.0' },
    answer: '=B3*(1+B2)/(B1-B2)',
    wrong: [
      { formula: '=B3/(B1-B2)', say: 'That treats 2032’s cash flow as the first one of the perpetuity. The first is 2033’s: grow it by (1 + B2).' },
      { formula: '=B3*(1+B2)/(B1+B2)', say: 'The denominator is the discount rate minus growth.' },
      { formula: '=B3*(1+B2)/(B1-B2)/(1+B1)^5', say: 'That is the terminal value’s present value today. The question asks for its value at the end of 2032.' },
    ],
    hints: ['Gordon: next year’s cash flow ÷ (rate − growth).', '=B3*(1+B2)/(B1−B2).'],
    solution: '<x>=B3*(1+B2)/(B1-B2)</x> gives 84.34 × 1.03 ÷ 0.0549 = $1,582.5 million. It is a value at the end of 2032 and still has to be discounted five years to today.',
  },
  {
    id: 'f06-dcf-g4', type: 'steps', kind: 'numerical',
    prompt: 'An analyst’s DCF of Hesketh Freight (fictional, listed) gives a present value of $410 million for the five forecast years and $1,050 million for the terminal value. Hesketh has $380 million of debt, $45 million of cash and 50 million shares.',
    solution: 'EV = 410 + 1,050 = $1,460 million. Equity = 1,460 − 380 + 45 = $1,125 million; per share 1,125 ÷ 50 = $22.50. The terminal value is 1,050 ÷ 1,460 = 71.9% of the enterprise value.',
    steps: [
      { id: 'f06-dcf-g4-s1', type: 'num', prompt: 'What is Hesketh’s enterprise value, in $ millions?',
        answer: 1460, check: () => 410 + 1050, unit: '$m', places: 0,
        hints: ['Add the present values of the two parts.'] },
      { id: 'f06-dcf-g4-s2', type: 'num', prompt: 'What is a Hesketh share worth? Give dollars and cents.',
        answer: 22.5, check: () => IV.evToEquity({ ev: 1460, debt: 380, cash: 45, shares: 50 }).perShare, unit: '$', places: 2, tol: 0.01,
        hints: ['Equity = EV − debt + cash.', '(1,460 − 380 + 45) ÷ 50.'],
        wrong: [{ value: 29.2, say: 'That divides enterprise value by the shares. Lenders own $380 million of it.' }, { value: 20.7, say: 'Cash belongs to the shareholders: add it, don’t subtract it.' }] },
      { id: 'f06-dcf-g4-s3', type: 'num', prompt: 'What share of the enterprise value is the terminal value? Give a percentage to one decimal place.',
        answer: 71.9, check: () => 1050 / 1460 * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Present value of the terminal value ÷ enterprise value.'],
        wrong: [{ value: 93.3, say: 'That divides by the equity value. The terminal value is part of the enterprise value.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'f06-dcf-i1', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) trades at $18.00. Its 2027 earnings per share were $1.4125 and its beta is 1.25. With a 4.2% risk-free rate and a 5.5% market risk premium, what is the present value of its growth opportunities per share? Give dollars and cents.',
    answer: 5.25, check: () => IV.pvgo(H.price, H.eps, KEH), unit: '$', places: 2, tol: 0.02,
    wrong: [{ value: 12.75, say: 'That is the no-growth value, EPS ÷ cost of equity. PVGO is the price minus it.' }, { value: 2.66, say: 'That uses Morrow & Pike’s 9.15% cost of equity. Harbour Street’s beta of 1.25 gives 11.075%.' }],
    solution: 'Cost of equity: 4.2% + 1.25 × 5.5% = 11.075%. No-growth value: 1.4125 ÷ 0.11075 = $12.75. PVGO = 18.00 − 12.75 = $5.25, 29% of the price. Harbour Street’s price leans less on growth than Morrow & Pike’s (39%).',
  },
  {
    id: 'f06-dcf-i2', type: 'num', kind: 'numerical',
    prompt: 'Suppose the yield on Morrow & Pike’s bond rose to 6.45% while everything else stayed as in the lesson (cost of equity 9.15%, debt 13.0% and equity 87.0% of value, tax 25%). What would its WACC be? Give a percentage to two decimal places.',
    answer: 8.59, check: () => (WE * KE + WD * 0.0645 * (1 - T)) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 8.71, say: 'That uses the yield before tax. Interest is deductible: use 6.45% × 0.75.' }, { value: 6.45, say: 'That is the cost of debt alone. The WACC weights it with the cost of equity.' }],
    solution: 'After-tax cost of debt 6.45% × 0.75 = 4.84%. WACC = 0.870 × 9.15% + 0.130 × 4.84% = 8.59%, about 0.1 point higher than 8.49%: with debt only 13% of value, the cost of equity dominates.',
  },
  {
    id: 'f06-dcf-i3', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds Morrow & Pike’s WACC (B1), terminal growth (B2), forecast free cash flow for 2028–2032 (B3:B7, $ millions) and the terminal value at the end of 2032 (B8). In B10, write one formula for the enterprise value today.',
    sheet: { cells: { A1: 'WACC', B1: 0.0849, A2: 'Terminal growth', B2: 0.03, A3: 'FCFF 2028', B3: 64.27, A4: 'FCFF 2029', B4: 69.42, A5: 'FCFF 2030', B5: 74.77, A6: 'FCFF 2031', B6: 79.78, A7: 'FCFF 2032', B7: 84.34, A8: 'Terminal value, end-2032', B8: '=B7*(1+B2)/(B1-B2)', A10: 'Enterprise value today ($m)' },
      vary: { B1: [0.079, 0.094], B2: [0.02, 0.035] } },
    cell: 'B10', view: 'A1:B10', widths: { A: 28, B: 12 }, formats: { B1: '0.00%', B2: '0.00%', B3: '#,##0.00', B4: '#,##0.00', B5: '#,##0.00', B6: '#,##0.00', B7: '#,##0.00', B8: '#,##0.0', B10: '#,##0.0' },
    answer: '=NPV(B1,B3:B7)+B8/(1+B1)^5',
    alt: ['=NPV(B1,B3:B7)+B8/(1+B1)^COUNT(B3:B7)'],
    require: ['NPV'],
    wrong: [
      { formula: '=NPV(B1,B3:B7)+B8', say: 'The terminal value is a value at the end of 2032: discount it five years, like the 2032 cash flow.' },
      { formula: '=NPV(B1,B3:B8)', say: 'That discounts the terminal value six years, as if it arrived a year after 2032’s cash flow. It is a value at the end of 2032: five years.' },
    ],
    solution: '<x>=NPV(B1,B3:B7)+B8/(1+B1)^5</x>. Excel’s NPV discounts its first value one full period, which is right here: the 2028 cash flow arrives a year from now. The terminal value is added separately, discounted five years. The result is $1,343.4 million.',
  },
  {
    id: 'f06-dcf-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Sandling Storage (fictional) installs battery-storage systems for factories. It is listed, profitable and growing about 20% a year, reinvests everything it earns and has never paid a dividend. Which approach suits it best?',
    options: ['A DCF of free cash flow to the firm, with several years of high growth before a terminal value', 'The Gordon model, using a dividend of zero growing at 20%', 'A two-stage dividend model with 20% growth for five years', 'The no-growth value, earnings per share ÷ the cost of equity'],
    answer: 0,
    feedback: { 1: 'With no dividend the Gordon model gives zero, and 20% for ever would exceed any cost of equity anyway.', 2: 'There are no dividends to grow. A dividend model would have to guess when payouts start and how large they will be, which is harder than forecasting the business.', 3: 'Growth is the point of this company; the no-growth value ignores it, and the rapid reinvestment makes current earnings a poor guide.' },
    solution: 'Value the business: forecast its free cash flow to the firm through the high-growth years (which may be small or negative while it invests), add a terminal value once growth settles, and bridge to equity. Dividend models need dividends.',
  },
  {
    id: 'f06-dcf-i5', type: 'num', kind: 'numerical',
    prompt: 'Tarrow Mills (fictional) has just paid a dividend of $1.00. Dividends will grow 10% a year for two years, then 4% a year for ever. Shareholders require 9%. What is a share worth today? Give dollars and cents.',
    answer: 23.21, check: () => IV.multiStageDdm({ d0: 1, stages: [{ years: 2, growth: 0.1 }], gT: 0.04, ke: 0.09 }).value, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: 20.8, say: 'That values the share as if dividends grew 4% from now (1.04 ÷ 0.05). The first two years grow faster.' },
      { value: 25.3, say: 'You left the terminal value undiscounted. It is a value at the end of year 2: discount it two years.' },
    ],
    solution: 'D₁ = $1.10, D₂ = $1.21, D₃ = 1.21 × 1.04 = $1.2584. Terminal value at the end of year 2: 1.2584 ÷ (0.09 − 0.04) = $25.17. Value = 1.10 ÷ 1.09 + (1.21 + 25.17) ÷ 1.09² = 1.01 + 22.20 = $23.21.',
  },
];

export const check = [
  {
    id: 'f06-dcf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst forecasts a company’s free cash flow to the firm. At which rate should she discount it?',
    options: ['The cost of equity, because the valuation is for shareholders', 'The weighted average cost of capital', 'The yield on the company’s bonds, because cash flows are promised', 'The risk-free rate, with the risk already reflected in the forecast'],
    answer: 1,
    feedback: { 0: 'The cost of equity goes with cash that belongs to shareholders alone (dividends, or free cash flow to equity). FCFF belongs to lenders too.', 2: 'Free cash flow is not promised, and the bond yield reflects only the lenders’ risk.', 3: 'The forecast is an expected value, not a certainty-equivalent, so it still needs a risk-adjusted rate.' },
    solution: 'FCFF is the cash available to lenders and shareholders together, so it is discounted at the WACC, the return they require on average. The result is enterprise value; debt is then subtracted and cash added to reach the equity.',
  },
  {
    id: 'f06-dcf-k2', type: 'num', kind: 'numerical',
    prompt: 'Suppose a revised forecast put Morrow & Pike’s enterprise value at $1,400 million. With debt of $168 million, cash of $30 million and 40 million shares, what would a share be worth? Give dollars and cents.',
    answer: 31.55, check: () => IV.evToEquity({ ev: 1400, debt: M.debt, cash: M.cash, shares: M.shares }).perShare, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 35, say: 'That divides enterprise value by the shares and forgets the lenders.' }, { value: 30.05, say: 'Cash adds to the shareholders’ value; subtract the debt, add the cash.' }],
    solution: '(1,400 − 168 + 30) ÷ 40 = 1,262 ÷ 40 = $31.55.',
  },
  {
    id: 'f06-dcf-k3', type: 'num', kind: 'applied',
    prompt: 'Morrow & Pike trades at $28.00, has just paid a $0.70 dividend and has a cost of equity of 9.15%. If the price fits the Gordon model, what constant dividend growth rate does it imply? Give a percentage to two decimal places.',
    answer: 6.49, check: () => (M.price * KE - M.dps) / (M.price + M.dps) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 6.65, say: 'That is r_E − D₀ ÷ P₀, using the dividend just paid. The model uses D₁ = D₀(1 + g), so solve 28 = 0.70(1 + g) ÷ (0.0915 − g).' }, { value: 2.5, say: 'That is the dividend yield. Growth is what the cost of equity requires on top of it.' }],
    solution: '28(0.0915 − g) = 0.70(1 + g), so 2.562 − 28g = 0.70 + 0.70g and g = 1.862 ÷ 28.70 = 6.49%. That is close to the 6.59% from retention × ROE, so the price and the company’s own reinvestment tell a similar story.',
  },
  {
    id: 'f06-dcf-k4', type: 'mc', kind: 'applied',
    prompt: 'In the lesson’s DCF, 78.4% of Morrow & Pike’s enterprise value is the terminal value. What should an investor take from that?',
    options: ['The forecast years hardly matter, so the five-year forecast can be dropped', 'The model is faulty: a sound DCF keeps the terminal value below half', 'The conclusion rests mostly on the long-run growth and discount rate, so test those first', 'Morrow & Pike must be a high-growth company that is about to slow down sharply'],
    answer: 2,
    feedback: { 0: 'The forecast years set the cash flow the terminal value grows from, and the reinvestment it must match.', 1: 'Three-quarters or more is normal for a healthy company with a five-year forecast; most of a going concern’s value lies beyond any explicit forecast.', 3: 'A large terminal share mainly reflects a short forecast and a long life, not a coming slowdown.' },
    solution: 'Most of a going concern’s value lies beyond any five-year forecast, so a high terminal share is normal. It means the valuation is mostly a bet on terminal growth and the WACC: test those with a sensitivity table and a reverse DCF before trusting the result.',
  },
  {
    id: 'f06-dcf-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Select every change that, on its own and with everything else held fixed, raises a DCF value per share.',
    options: ['A lower WACC', 'Higher terminal growth, still below the WACC', 'A lower share of revenue spent on capital equipment', 'A larger increase in working capital each year', 'More debt, with the enterprise value unchanged'],
    answer: [0, 1, 2],
    feedback: { 3: 'Money tied up in working capital is cash the owners cannot have: it lowers free cash flow.', 4: 'If the enterprise value is unchanged, more debt means a larger claim for lenders and less for shareholders.' },
    solution: 'A lower discount rate and higher terminal growth raise the terminal value most; lower capital spending raises free cash flow (as long as growth is unaffected, which in practice is the catch). More working capital lowers free cash flow; more debt with an unchanged EV lowers the equity.',
  },
  {
    id: 'f06-dcf-k6', type: 'num', kind: 'numerical',
    prompt: 'A listed electricity network company (fictional) has a beta of 0.60 and has just paid a dividend of $2.40, which is expected to grow 3% a year for ever. With a 4.2% risk-free rate and a 5.5% market risk premium, what is a share worth? Give dollars and cents.',
    answer: 54.93, check: () => IV.gordon({ d0: 2.4, g: 0.03, ke: IV.capm({ rf, beta: 0.6, mrp }) }).value, unit: '$', places: 2, tol: 0.03,
    wrong: [{ value: 53.33, say: 'That uses the dividend just paid. Use next year’s: 2.40 × 1.03 = 2.472.' }, { value: 37.08, say: 'That uses a cost of equity of 9.7% (4.2% + 5.5%): beta scales the premium.' }],
    solution: 'Cost of equity: 4.2% + 0.60 × 5.5% = 7.5%. D₁ = 2.40 × 1.03 = $2.472. Value = 2.472 ÷ (0.075 − 0.03) = $54.93.',
  },
];
