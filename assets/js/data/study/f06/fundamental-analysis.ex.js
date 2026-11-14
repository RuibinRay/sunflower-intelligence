// fundamental-analysis.ex.js — F06 · Fundamental analysis: widgets, practice and the knowledge check (answer keys live
// here). Harbour Street Foods and Morrow & Pike Roasters come from case.js; the market returns are SIMULATED
// (tools/study/f06-data.py). Cardale Outdoor, Brookmere Brewing and every other business named here is fictional.
// Brightcup Coffee is the course project’s and is not analysed here.
import { COMPANIES, BONDS, MARKET, MONTHS, SERIES } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const M = COMPANIES.morrow, H = COMPANIES.harbour;
const { rf, mrp } = MARKET;
const T = 0.25;
const KH = IV.capm({ rf, beta: 1.25, mrp });
const HB = BONDS.find((b) => b.name.startsWith('Harbour'));
const WDH = (H.debt / H.marketCap) / (1 + H.debt / H.marketCap);
const WH = (1 - WDH) * KH + WDH * HB.ytm * (1 - T);
const NOP = H.ebit * (1 - T);
const perShare = (ev) => (ev - H.debt + H.cash) / H.shares;
const money = (v) => `$${v.toFixed(2)}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${(Math.abs(v * 100) + 1e-9).toFixed(d)}%`;
const roicH = NOP / (H.bookEquity + H.debt - H.cash);
// slider defaults; at them the widget uses the unrounded figures, so it matches the lesson’s $10.56
const RONIC_SHOWN = Math.round(roicH * 1000) / 10, WACC_SHOWN = Math.round(WH * 10000) / 100;
const gH = (1 - H.dps / H.eps) * (H.netIncome / H.bookEquity);
const field = {
  'Flat': perShare(NOP / WH),
  'Gordon': H.dps / H.eps * (1 + gH) / (KH - gH) * H.eps,
  'DCF': perShare(IV.dcf({ fcf: [1, 2, 3, 4, 5].map((t) => H.fcff * 1.05 ** t), rate: WH, g: 0.03 }).value),
  'Peer': perShare(M.m.evEbitda * H.ebitda),
  'Price': H.price,
};
const L24 = SERIES.market.slice(-24), M24 = MONTHS.slice(-24);
const lagCells = { A1: 'Month', B1: 'Market return', D1: 'Lag-1 correlation' };
M24.forEach((m, i) => { lagCells[`A${i + 2}`] = m; lagCells[`B${i + 2}`] = Math.round(L24[i] * 10000) / 10000; });

export const widgets = {
  'fun-growth': {
    type: 'formula',
    title: 'Harbour Street Foods: when does growth add value?',
    intro: 'The value-driver formula with Harbour Street’s 2027 after-tax operating profit of $217.5 million, $1,188 million of debt, $60 million of cash and 120 million shares (all fictional). Its current return on invested capital is 7.8% and its WACC 8.77%.',
    inputs: [
      { id: 'ronic', label: 'Return on new investment', min: 4, max: 25, step: 0.1, value: RONIC_SHOWN, fmt: 'pct' },
      { id: 'g', label: 'Growth of operating profit, for ever', min: 0, max: 5, step: 0.25, value: 3, fmt: 'pct', digits: 2 },
      { id: 'wacc', label: 'WACC', min: 6, max: 12, step: 0.01, value: WACC_SHOWN, fmt: 'pct', digits: 2 },
    ],
    compute: (v) => {
      const ro = Math.abs(v.ronic - RONIC_SHOWN) < 1e-9 ? roicH : v.ronic / 100, g = v.g / 100, w = Math.abs(v.wacc - WACC_SHOWN) < 1e-9 ? WH : v.wacc / 100;
      if (w <= g + 0.0025) return { error: 'The WACC has to be clearly above growth for the formula to have a finite answer.' };
      const reinv = g / ro;
      if (reinv > 1) return { error: `Growth of ${pct(g, 2)} at a ${pct(ro)} return would need more than all of the profit reinvested. Lower growth or raise the return.` };
      const ev = NOP * (1 + g) * (1 - reinv) / (w - g), ps = perShare(ev), ng = perShare(NOP / w);
      const gs = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].filter((x) => x / 100 < w - 0.0025 && x / 100 <= ro);
      let note;
      if (Math.abs(ro - w) < 0.0005) note = 'The return on new investment equals the WACC: growth neither adds nor destroys value, and the value equals the no-growth value.';
      else if (ro < w) note = `New investment earns less than the ${pct(w, 2)} it costs, so growth lowers the value: ${money(ps)} against ${money(ng)} with no growth.`;
      else note = `New investment earns more than it costs, so growth adds ${money(ps - ng)} a share to the no-growth value.`;
      note += ps >= H.price ? ' The value is at or above the $18.00 price.' : ' The value is below the $18.00 price.';
      return {
        headline: { label: 'Value per share', value: money(ps) },
        rows: [['Share of profit reinvested (g ÷ return)', pct(reinv)], ['Enterprise value', `$${ev.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}m`], ['No-growth value per share', money(ng)], ['Price, 31 December 2027', '$18.00']],
        note,
        chart: { kind: 'line', x: { label: 'Growth (%)', values: gs }, series: [{ name: 'Value per share', values: gs.map((x) => { const gg = x / 100; return Math.round(perShare(NOP * (1 + gg) * (1 - gg / ro) / (w - gg)) * 100) / 100; }) }, { name: 'Price', values: gs.map(() => H.price) }], y: { label: 'Value per share ($)' } },
      };
    },
  },
  'fun-field': {
    type: 'chart', kind: 'bar',
    title: 'Harbour Street: value per share by method',
    x: { label: 'Method', values: Object.keys(field) },
    series: [{ name: 'Value per share', values: Object.values(field).map((x) => Math.round(x * 100) / 100) }],
    y: { label: 'Value per share ($)', format: 'money' },
    note: 'Fictional figures. Flat: no growth, after-tax operating profit ÷ WACC. Gordon: the P/E the Gordon model justifies (8.7) × EPS. DCF: free cash flow growing 5% for five years, then 3%. Peer: Morrow &amp; Pike’s EV/EBITDA of 10.66. Price: 31 December 2027.',
  },
};

export const guided = [
  {
    id: 'f06-fun-g1', type: 'steps', kind: 'numerical',
    prompt: 'Morrow & Pike Roasters (fictional) earned EBIT of $92 million in 2027 and pays tax at 25%. At the year end it had book equity of $520 million, debt of $168 million and cash of $30 million. Its WACC is 8.49%.',
    solution: 'NOPAT = 92 × 0.75 = $69 million. Invested capital = 520 + 168 − 30 = $658 million. ROIC = 69 ÷ 658 = 10.49%, about 2 points above the 8.49% WACC, so Morrow & Pike creates value when it reinvests at its current returns.',
    steps: [
      { id: 'f06-fun-g1-s1', type: 'num', prompt: 'What is its invested capital, in $ millions?',
        answer: 658, check: () => M.bookEquity + M.debt - M.cash, unit: '$m', places: 0,
        hints: ['The money lenders and shareholders have put into the operations.', 'Book equity + debt − cash.'],
        wrong: [{ value: 718, say: 'Cash is not invested in the operations: subtract it.' }, { value: 520, say: 'That is the shareholders’ part only. ROIC uses all the capital, so add the debt.' }] },
      { id: 'f06-fun-g1-s2', type: 'num', prompt: 'What is its return on invested capital? Give a percentage to two decimal places.',
        answer: 10.49, check: () => M.ebit * (1 - T) / (M.bookEquity + M.debt - M.cash) * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['EBIT × (1 − T) ÷ invested capital.'],
        wrong: [{ value: 13.98, say: 'That uses EBIT before tax. ROIC uses after-tax operating profit.' }, { value: 11.97, say: 'That is return on equity: net income ÷ book equity.' }] },
      { id: 'f06-fun-g1-s3', type: 'mc', prompt: 'With a WACC of 8.49%, what happens to Morrow & Pike’s value if it reinvests to grow at its current return?',
        options: ['It rises, because each dollar reinvested earns more than it costs', 'It falls, because reinvestment reduces dividends', 'It is unchanged, because the market has always already priced any growth', 'It depends only on how fast revenue grows'],
        answer: 0,
        hints: ['Compare the return on capital with its cost.'],
        feedback: { 1: 'Lower dividends now are more than made up for when the money earns more than shareholders require.', 2: 'Whatever the market has priced, the value created depends on returns against costs.', 3: 'Growth at a return below the WACC would lower value, however fast.' } },
    ],
  },
  {
    id: 'f06-fun-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Each statement describes what an investor could not profit from if markets were efficient in a given form. Classify each by the weakest form of the efficient markets hypothesis that rules the profit out.',
    items: ['Buying shares that have risen for three months, expecting the trend to continue', 'Buying after reading a company’s published annual report closely', 'Trading on a board’s decision before it is announced', 'Selling when a chart pattern of past prices signals a fall', 'Buying a share the day after a profit warning, on the published figures'],
    categories: ['Weak form', 'Semi-strong form', 'Strong form'],
    answer: [0, 1, 2, 0, 1],
    hints: ['Weak: past prices and trading data. Semi-strong: everything published. Strong: everything, published or not.'],
    feedback: { 0: 'The trend uses only past prices: weak-form efficiency is enough to rule it out (though momentum is one of the reported anomalies).', 2: 'Only the strong form says even private information is in the price. In most markets trading on it is also illegal.' },
    solution: 'Past prices and chart patterns: weak form. Annual reports and published announcements: semi-strong. Unpublished board decisions: strong form only, which researchers treat mainly as a limiting case.',
  },
  {
    id: 'f06-fun-g3', type: 'formula', kind: 'applied',
    prompt: 'The sheet lists the Harbourline Total Market fund’s monthly returns for January 2026 to December 2027 (simulated for this course). A weak-form test asks whether one month’s return predicts the next. In D2, write a formula for the correlation between each month’s return and the following month’s.',
    sheet: { cells: lagCells },
    cell: 'D2', view: 'A1:D25', widths: { A: 10, B: 14, C: 3, D: 18 }, formats: { B: '0.00%', D2: '0.000' },
    answer: '=CORREL(B2:B24,B3:B25)',
    alt: ['=CORREL(B3:B25,B2:B24)'],
    require: ['CORREL'],
    wrong: [
      { formula: '=CORREL(B2:B25,B2:B25)', say: 'That correlates the series with itself, which is always 1. Shift one range down by a row.' },
    ],
    hints: ['Pair each month with the next one: the first range stops a row early, the second starts a row late.', '=CORREL(B2:B24,B3:B25).'],
    solution: '<x>=CORREL(B2:B24,B3:B25)</x> pairs January with February, February with March and so on: 23 pairs. It gives about −0.06, close to zero: these two years give no sign that last month predicts this month. The data were simulated with no month-to-month memory, so this illustrates the test; real-market tests use far longer histories.',
  },
  {
    id: 'f06-fun-g4', type: 'steps', kind: 'numerical',
    prompt: 'An investor estimates that Cardale Outdoor (fictional, listed) is worth $40.00 a share. It trades at $31.00.',
    solution: 'Margin of safety = 1 − 31 ÷ 40 = 22.5%. With a required margin of 30% she would buy only at or below 40 × 0.70 = $28.00, so she waits.',
    steps: [
      { id: 'f06-fun-g4-s1', type: 'num', prompt: 'What margin of safety does the price offer? Give a percentage to one decimal place.',
        answer: 22.5, check: () => (1 - 31 / 40) * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['1 − price ÷ value.'],
        wrong: [{ value: 29, say: 'That is the gap as a share of the price (9 ÷ 31). The margin is measured against the estimated value.' }] },
      { id: 'f06-fun-g4-s2', type: 'num', prompt: 'She requires a 30% margin of safety. What is the highest price she should pay? Give dollars and cents.',
        answer: 28, check: () => 40 * (1 - 0.3), unit: '$', places: 2, tol: 0.01,
        hints: ['Value × (1 − margin).'],
        wrong: [{ value: 30.77, say: 'That divides by 1.3. The margin is taken off the value: 40 × 0.70.' }] },
    ],
  },
];

export const independent = [
  {
    id: 'f06-fun-i1', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) earned EBIT of $290 million in 2027 and paid interest of $64 million. What was its interest cover? Give one decimal place.',
    answer: 4.5, check: () => H.ebit / H.interest, unit: '×', places: 1, tol: 0.05,
    wrong: [{ value: 6.4, say: 'That divides EBITDA by interest. Interest cover uses EBIT.' }],
    solution: '290 ÷ 64 = 4.5 times, against Morrow & Pike’s 10.2. Harbour Street’s heavier debt is part of why its equity beta is higher.',
  },
  {
    id: 'f06-fun-i2', type: 'mc', kind: 'applied',
    prompt: 'Brookmere Brewing (fictional) reports net income up 25% this year, while cash from operations fell 10%, receivables rose 40% on sales up 8%, and the depreciation life of its brewing equipment was extended from 10 to 15 years. What should an analyst conclude?',
    options: ['Earnings quality is weak: profit is running ahead of cash, helped by estimates', 'Earnings quality is strong, because net income growth is the key measure', 'Nothing yet: changes in receivables and depreciation lives are routine and can be ignored', 'The brewer is undervalued, since its profit is rising faster than its sales'],
    answer: 0,
    feedback: { 1: 'Net income is the figure most open to estimates; it needs cash to back it.', 2: 'Each change alone might be routine; together, and all flattering profit, they are the classic warning signs.', 3: 'Profit rising faster than sales is a warning here, because it came from estimates and receivables, not efficiency.' },
    solution: 'Receivables growing five times faster than sales and a longer depreciation life both raise reported profit without cash. Falling operating cash flow confirms it. Treat this year’s earnings as lower quality and value the business on cash-backed figures.',
  },
  {
    id: 'f06-fun-i3', type: 'num', kind: 'numerical',
    prompt: 'Morrow & Pike (fictional) earned EBIT after tax of $69 million in 2027. Its WACC is 8.49%, its debt $168 million, its cash $30 million and it has 40 million shares. What is a share worth with no growth (enterprise value = EBIT after tax ÷ WACC)? Give dollars and cents.',
    answer: 16.87, check: () => (69 / 0.0849 - M.debt + M.cash) / M.shares, unit: '$', places: 2, tol: 0.03,
    wrong: [{ value: 20.32, say: 'That is enterprise value per share. Subtract the debt and add the cash first.' }],
    solution: 'EV = 69 ÷ 0.0849 = $812.7 million. Equity = 812.7 − 168 + 30 = $674.7 million, $16.87 a share. The $28.00 price is 66% above it: buyers are paying for growth that, at Morrow & Pike’s 10.5% return on capital, does add value.',
  },
  {
    id: 'f06-fun-i4', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps of a top-down analysis in order.',
    items: ['Judge the outlook for the economy: growth, interest rates and inflation', 'Choose the industries likely to do well in that outlook', 'Pick the strongest companies within those industries', 'Value each candidate and compare the value with its price'],
    solution: 'Top-down runs from the economy to industries to companies, and ends, like any fundamental analysis, with a value compared against the price.',
  },
  {
    id: 'f06-fun-i5', type: 'mc', kind: 'applied',
    prompt: 'A nurse who has worked at a fictional listed hospital group for ten years holds half her savings in its shares, because she “sees how well it is run every day”. Which concern is strongest?',
    options: ['Her job and half her savings ride on one company', 'She may know inside information, so holding the shares at all is illegal', 'Hospital groups are always overvalued, so the shares will fall', 'She should switch to a single other hospital group that she knows less well'],
    answer: 0,
    feedback: { 1: 'Seeing how a business is run day to day is not inside information about its results; the concern is risk, not law.', 2: 'There is no such rule; the concern is that her income and savings would suffer together.', 3: 'Swapping one company for another keeps the concentration; the fix is to diversify.' },
    solution: 'If the company does badly she could lose her income and much of her savings at the same time. Familiarity bias makes the shares feel safe because they are known; the market already knows what she sees. A diversified fund removes the company-specific risk.',
  },
];

export const check = [
  {
    id: 'f06-fun-k1', type: 'mc', kind: 'conceptual',
    prompt: 'If a market is semi-strong efficient, what follows for an investor who studies companies’ published accounts?',
    options: ['She cannot expect to beat the market from them after costs', 'Every share is always priced at exactly its intrinsic value', 'Only technical analysis can still earn a return above the market', 'Insider information is already reflected in prices'],
    answer: 0,
    feedback: { 1: 'Efficiency says prices reflect available information on average; they can still be wrong, just not predictably so.', 2: 'Semi-strong efficiency includes weak-form efficiency, so past-price patterns are ruled out too.', 3: 'That is the strong form, which the semi-strong form does not claim.' },
    solution: 'Semi-strong efficiency says published information is already in prices, so analysing it cannot be expected to earn returns above the market after costs. Analysis still has uses: understanding risk, avoiding mistakes and judging funds.',
  },
  {
    id: 'f06-fun-k2', type: 'num', kind: 'numerical',
    prompt: 'Harbour Street Foods (fictional) had debt of $1,188 million, cash of $60 million and EBITDA of $410 million in 2027. What was its net debt to EBITDA? Give two decimal places.',
    answer: 2.75, check: () => (H.debt - H.cash) / H.ebitda, unit: '×', places: 2, tol: 0.01,
    wrong: [{ value: 2.9, say: 'That uses gross debt. Net debt subtracts the cash.' }],
    solution: '(1,188 − 60) ÷ 410 = 2.75 years of EBITDA, against Morrow & Pike’s 1.17.',
  },
  {
    id: 'f06-fun-k3', type: 'mc', kind: 'applied',
    prompt: 'An analyst’s DCF values a company at $45 a share; its peers’ multiples imply $30; the price is $33. What should she do first?',
    options: ['Average the two, $37.50, and buy because it is above the price', 'Find the assumption that separates the DCF from the multiples', 'Trust the multiples, because the market is always right', 'Trust the DCF, because cash flow is all that matters'],
    answer: 1,
    feedback: { 0: 'An average of two inconsistent estimates answers no question; it hides the disagreement she needs to resolve.', 2: 'Multiples inherit whatever the market believes about the peers, right or wrong.', 3: 'The DCF is only as good as its growth and return assumptions, which are what the gap calls into question.' },
    solution: 'A large gap usually comes from one assumption: growth, the return on new investment, risk or how comparable the peers are. Find it, decide what she believes about it, and only then judge the price.',
  },
  {
    id: 'f06-fun-k4', type: 'num', kind: 'numerical',
    prompt: 'An investor values a fictional engineering company at $64.00 a share and requires a 25% margin of safety. What is the most she should pay? Give dollars and cents.',
    answer: 48, check: () => 64 * 0.75, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 51.2, say: 'That divides by 1.25. Take 25% off the value: 64 × 0.75.' }, { value: 80, say: 'A margin of safety buys below the value, not above it.' }],
    solution: '64.00 × (1 − 0.25) = $48.00.',
  },
  {
    id: 'f06-fun-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Select every statement that is true of growth and value.',
    options: ['Growth adds value only when new investment earns more than the cost of capital', 'A company earning less than its WACC can raise its value by growing more slowly', 'Faster growth always justifies a higher P/E', 'With return on new investment equal to the WACC, value is the same whatever the growth rate', 'PVGO is always positive for a listed company'],
    answer: [0, 1, 3],
    feedback: { 2: 'Faster growth at a return below the cost of capital lowers value, and so the justified multiple.', 4: 'PVGO can be negative when the price is below the no-growth value, as for a company expected to reinvest at poor returns.' },
    solution: 'In the value-driver formula, growth enters through (1 − g ÷ RONIC) ÷ (WACC − g); when RONIC = WACC this equals 1 ÷ WACC whatever g is. Above the WACC growth adds value; below it growth subtracts, so slowing down helps. PVGO is negative when the market expects value-destroying investment.',
  },
  {
    id: 'f06-fun-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Barber and Odean studied 66,465 US households’ brokerage accounts from 1991 to 1996. What did they find, and how did they explain it?',
    options: ['The heaviest traders earned 11.4% a year against the market’s 17.9%: overconfidence', 'Households that traded most beat the market, because they acted quickly on public news', 'Households that traded least underperformed, because they held losing shares too long', 'Trading made no difference to returns once costs were deducted'],
    answer: 0,
    feedback: { 1: 'The most active traders did worst, not best.', 2: 'The study’s finding was about the heaviest traders; holding losers too long (the disposition effect) is a different bias.', 3: 'Trading made a large difference: the heaviest traders trailed the market by 6.5 points a year.' },
    solution: 'They reported that “those that trade most earn an annual return of 11.4 percent, while the market returns 17.9 percent”, and concluded that overconfidence can explain both the heavy trading and the poor results.',
  },
];
