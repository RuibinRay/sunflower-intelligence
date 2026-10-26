// horizontal-analysis.ex.js — F03 · Horizontal analysis: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern’s figures come from case.js; Starbucks’ from its FY2024 Form 10-K; every other business is fictional.
import { PERIODS, COMPARATIVE } from './case.js?v=19';
import * as R from '../../../core/ratios.js?v=19';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const IS = Object.fromEntries(COMPARATIVE.income.map(([n, a, b]) => [n, [a, b]]));
const BS = Object.fromEntries(COMPARATIVE.balance.map(([n, a, b]) => [n, [a, b]]));
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pct = (x) => `${x < 0 ? '−' : ''}${Math.abs(x * 100).toFixed(1)}%`;
const opex = (p) => p.grossProfit - p.operatingIncome;

// Lantern’s condensed comparative income statement, for the worksheet and the formula item
const LINES = [
  ['Net revenue', P26.revenue, P27.revenue],
  ['Cost of sales', P26.cogs, P27.cogs],
  ['Gross profit', P26.grossProfit, P27.grossProfit],
  ['Operating expenses', opex(P26), opex(P27)],
  ['Operating income', P26.operatingIncome, P27.operatingIncome],
  ['Interest expense', P26.interestExpense, P27.interestExpense],
  ['Net income', P26.netIncome, P27.netIncome],
];
const lineCells = (withChange) => {
  const c = { A1: 'Line', B1: '2026, ten months ($)', C1: '2027 ($)', D1: 'Change ($)', E1: 'Change (%)' };
  LINES.forEach(([n, a, b], i) => { const r = i + 2; c[`A${r}`] = n; c[`B${r}`] = a; c[`C${r}`] = b; if (withChange) c[`D${r}`] = `=C${r}-B${r}`; });
  return c;
};

// Starbucks (FY2024 Form 10-K, $ millions)
const SB = { rev: [32250.3, 35975.6, 36176.2], oi: [4617.8, 5870.8, 5408.8], ni: [3281.6, 4124.5, 3760.9] };
const idx = (a) => a.map((v) => Math.round(v / a[0] * 1000) / 10);

export const widgets = {
  'hor-growth': {
    type: 'formula',
    title: 'Growth between two periods of different lengths',
    intro: 'Starting values: Lantern’s net revenue, ten months of 2026 against twelve months of 2027, one year apart.',
    inputs: [
      { id: 'prev', label: 'Earlier period’s amount', min: 1000, max: 1000000, step: 1, value: P26.revenue, fmt: 'money' },
      { id: 'cur', label: 'Later period’s amount', min: 1000, max: 1000000, step: 1, value: P27.revenue, fmt: 'money' },
      { id: 'pm', label: 'Months in the earlier period', min: 1, max: 12, step: 1, value: 10, fmt: 'int', unit: 'months' },
      { id: 'cm', label: 'Months in the later period', min: 1, max: 12, step: 1, value: 12, fmt: 'int', unit: 'months' },
      { id: 'years', label: 'Years between the two periods', min: 1, max: 10, step: 1, value: 1, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const raw = (v.cur - v.prev) / v.prev;
      const pa = v.prev * 12 / v.pm, ca = v.cur * 12 / v.cm;
      const ann = (ca - pa) / pa;
      const cagr = (ca / pa) ** (1 / v.years) - 1;
      const same = v.pm === v.cm;
      const note = same
        ? `Both periods are ${v.pm} months long, so annualising changes nothing: growth is ${pct(raw)}.${v.years > 1 ? ` Over ${v.years} years that is ${pct(cagr)} a year compounded, not ${pct(raw / v.years)} (the total divided by the years).` : ''}`
        : `Comparing ${v.pm} months with ${v.cm} gives ${pct(raw)}, but on full-year figures growth is ${pct(ann)}. The gap, ${(Math.abs(raw - ann) * 100).toFixed(1)} points, is the calendar, not the business. Annualising assumes the missing months are typical; for a seasonal business they rarely are.${v.years > 1 ? ` Over ${v.years} years the compound annual rate on annualised figures is ${pct(cagr)}.` : ''}`;
      return {
        headline: { label: same ? 'Growth' : 'Growth on annualised figures', value: pct(same ? raw : ann) },
        rows: [
          ['Dollar change, as reported', money(v.cur - v.prev)],
          ['Percentage change, as reported', pct(raw)],
          ['Earlier period, annualised', money(pa)],
          ['Later period, annualised', money(ca)],
          ['Compound annual growth rate', pct(cagr)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Figure', values: ['Earlier, reported', 'Earlier, annualised', 'Later, reported', 'Later, annualised'] },
          series: [{ name: 'Amount ($)', values: [v.prev, Math.round(pa), v.cur, Math.round(ca)] }], y: { label: 'Dollars' } },
      };
    },
  },
  'hor-sheet': {
    type: 'sheet',
    title: 'Lantern’s comparative income statement',
    sheet: { cells: lineCells(false) },
    view: 'A1:E8',
    formats: { B: '#,##0', C: '#,##0', D: '#,##0', E: '0.0%' },
    widths: { A: 20, B: 13, C: 11, D: 11, E: 11 },
    editable: true,
    mark: ['D2:E8'],
    tools: ['formulas', 'fill', 'reset'],
    note: 'Fictional figures from the case. Column B covers ten months (1 March – 31 December 2026); column C covers 2027. To annualise a 2026 figure, replace it with a formula such as <x>=193320*12/10</x>.',
  },
  'hor-index': {
    type: 'chart', kind: 'line',
    title: 'Starbucks: trend percentages, fiscal 2022 = 100',
    x: { label: 'Fiscal year', values: [2022, 2023, 2024] },
    series: [
      { name: 'Total net revenues', values: idx(SB.rev) },
      { name: 'Operating income', values: idx(SB.oi) },
      { name: 'Net earnings attributable to Starbucks', values: idx(SB.ni) },
    ],
    y: { label: 'Index (FY2022 = 100)' },
    note: 'Computed from Starbucks Corporation’s Form 10-K for fiscal 2024, Consolidated Statements of Earnings. Revenue rose 11.6% and then 0.6%; operating income rose 27.1% and then fell 7.9%.',
  },
};

export const guided = [
  {
    id: 'f03-hor-g1', type: 'steps', kind: 'numerical',
    prompt: 'Saltmarsh Inn, a fictional coastal hotel, reports room revenue of $2,450,000 for 2026 and $2,744,000 for 2027, and operating income of $310,000 and $285,200. Both are full years.',
    solution: 'Dollar change in revenue: 2,744,000 − 2,450,000 = $294,000. Percentage change: 294,000 ÷ 2,450,000 = 12.0%. Operating income: (285,200 − 310,000) ÷ 310,000 = −24,800 ÷ 310,000 = −8.0%. Revenue grew but operating income fell, so costs grew faster than revenue.',
    steps: [
      { id: 'f03-hor-g1-s1', type: 'num', prompt: 'What is the dollar change in room revenue?',
        answer: 294000, check: () => 2744000 - 2450000, unit: '$', places: 0, tol: 0.5,
        hints: ['Later year minus earlier year.'],
        wrong: [{ value: -294000, say: 'Subtract the earlier year from the later one: revenue rose, so the change is positive.' }] },
      { id: 'f03-hor-g1-s2', type: 'num', prompt: 'What is the percentage change in room revenue? Enter a percentage to one decimal place.',
        answer: 12, check: () => (2744000 - 2450000) / 2450000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Divide the dollar change by the base.', 'The base is the earlier year: 294,000 ÷ 2,450,000.'],
        wrong: [{ value: 10.7, say: 'You divided by 2027’s revenue. The base of a percentage change is the earlier period.' }] },
      { id: 'f03-hor-g1-s3', type: 'num', prompt: 'What is the percentage change in operating income? Enter a fall as a negative number, to one decimal place.',
        answer: -8, check: () => (285200 - 310000) / 310000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['The change is 285,200 − 310,000.', '−24,800 ÷ 310,000.'],
        wrong: [
          { value: 8, say: 'Operating income fell, so the change is negative.' },
          { value: -8.7, say: 'You divided by 2027’s operating income; divide by the earlier year’s.' },
        ] },
    ],
  },
  {
    id: 'f03-hor-g2', type: 'num', kind: 'applied',
    prompt: `Lantern’s training revenue was ${money(IS['Training Revenue'][0])} for the ten months from 1 March to 31 December 2026 and ${money(IS['Training Revenue'][1])} for 2027. Ana wants a growth figure that isn’t flattered by the two extra months. What is the growth on annualised figures? Enter a percentage to one decimal place.`,
    answer: 42.9, check: () => R.growth(IS['Training Revenue'][1], IS['Training Revenue'][0], { annualised: true, prevMonths: 10 }) * 100, unit: '%', places: 1, tol: 0.1,
    hints: ['Annualise the 2026 figure: multiply by 12 and divide by 10.', `${IS['Training Revenue'][0].toLocaleString('en-US')} × 12 ÷ 10 = ${R.annualise(IS['Training Revenue'][0], 10).toLocaleString('en-US')}; now compare 2027 with that.`],
    wrong: [
      { value: 71.4, say: 'That compares ten months with twelve. Annualise 2026 first (× 12 ÷ 10).' },
      { value: 100, say: 'You annualised the wrong way round or scaled 2027 as well. Only the ten-month 2026 figure needs scaling up.' },
      { value: 30, say: 'That divides by the annualised 2027 figure. The base is the earlier period, annualised.' },
    ],
    solution: `Annualised 2026: ${IS['Training Revenue'][0].toLocaleString('en-US')} × 12 ÷ 10 = ${R.annualise(IS['Training Revenue'][0], 10).toLocaleString('en-US')}. Growth: ${IS['Training Revenue'][1].toLocaleString('en-US')} ÷ 25,200 − 1 = 42.9%. Unadjusted growth (71.4%) includes two months that 2026 didn’t have.`,
  },
  {
    id: 'f03-hor-g3', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional software start-up made a net loss of $40,000 in 2026 and a net income of $10,000 in 2027. How should an analyst report the change?',
    options: [
      'As an improvement of $50,000, with the percentage shown as n/m',
      'As a change of −125%, calculated as (10,000 + 40,000) ÷ (−40,000) on the loss',
      'As a change of 25%, from 10,000 ÷ 40,000',
      'As no change, because the business is still small',
    ],
    answer: 0,
    feedback: {
      1: 'Dividing by a negative base flips the sign: the result says the business got worse when it improved. Use the dollar change.',
      2: 'That compares the two amounts as a ratio, not a change, and ignores the sign of the loss.',
      3: 'Size doesn’t make a $50,000 swing from loss to profit unimportant.',
    },
    hints: ['Work out the dollar change first: 10,000 − (−40,000).', 'Ask what dividing by a negative base does to the sign.'],
    solution: 'The dollar change is 10,000 − (−40,000) = +$50,000. A percentage on a negative base is misleading (the plain formula gives −125%; dividing by the absolute value gives +125%, which means little), so report the dollars and write n/m.',
  },
  {
    id: 'f03-hor-g4', type: 'formula', kind: 'numerical',
    prompt: 'Lantern’s condensed comparative income statement is below, with the dollar change already in column D. In E2, write a formula for the percentage change in net revenue on the 2026 base. It will be filled down to E8.',
    sheet: { cells: lineCells(true) },
    cell: 'E2', fill: 'E2:E8',
    answer: '=D2/B2',
    alt: ['=(C2-B2)/B2', '=C2/B2-1', '=(C2-B2)/ABS(B2)', '=D2/ABS(B2)'],
    view: 'A1:E8',
    formats: { B: '#,##0', C: '#,##0', D: '#,##0', E: '0.0%' },
    widths: { A: 20 },
    wrong: [
      { formula: '=D2/C2', say: 'That divides by 2027. A percentage change is measured on the earlier (base) period, column B.' },
      { formula: '=C2/B2', say: 'That is the later amount as a multiple of the earlier one (1 + the change). Subtract 1, or divide the change in D2 by B2.' },
    ],
    hints: ['Change ÷ base. The change is in D2; the base is the 2026 figure.', 'Relative references (no $) let the formula move down the rows.'],
    solution: '=D2/B2 (or =(C2-B2)/B2), filled down. Net revenue 198.9%, cost of sales 152.2%, gross profit 238.7%, operating expenses 381.0%, operating income −13.1%, interest expense 139.9%, net income −18.1%.',
  },
];

export const independent = [
  {
    id: 'f03-hor-i1', type: 'num', kind: 'numerical',
    prompt: 'Starbucks reported operating income of $5,870.8 million for fiscal 2023 and $5,408.8 million for fiscal 2024. Using fiscal 2023 as the base year (= 100), what is the trend percentage for fiscal 2024? Enter it to one decimal place.',
    answer: 92.1, check: () => 5408.8 / 5870.8 * 100, unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: 108.5, say: 'That puts fiscal 2024 in the base. The base year is the denominator: 5,408.8 ÷ 5,870.8.' },
      { value: -7.9, say: 'That is the percentage change. A trend percentage is the ratio × 100, so the base reads 100.' },
    ],
    solution: 'Index = 5,408.8 ÷ 5,870.8 × 100 = 92.1: operating income in fiscal 2024 was 92.1% of fiscal 2023’s, a fall of 7.9%.',
  },
  {
    id: 'f03-hor-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional university’s tuition revenue was $84.0 million in 2023 and $97.5 million in 2027. What was its compound annual growth rate? Enter a percentage to one decimal place.',
    answer: 3.8, check: () => R.cagr(97.5, 84, 4) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 16.1, say: 'That is the total growth over the four years. The CAGR is the yearly rate that compounds to it.' },
      { value: 4, say: 'That divides the total growth by four. Compounding means taking the fourth root: (97.5 ÷ 84.0)^(1/4) − 1.' },
      { value: 5.1, say: 'From 2023 to 2027 is four years (the gaps between the years), not three.' },
    ],
    solution: 'n = 2027 − 2023 = 4. CAGR = (97.5 ÷ 84.0)^(1/4) − 1 = 1.1607^0.25 − 1 = 3.8% a year.',
  },
  {
    id: 'f03-hor-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these make a plain line-by-line comparison of Lantern’s 2026 and 2027 statements misleading? Select all that apply.',
    options: [
      'The cafés opened on 1 March 2027, with their own sales, staff and leases',
      'Ana was paid a salary in 2027 but only dividends in 2026',
      'The cafés’ leases put a right-of-use asset and a lease liability on the balance sheet',
      'The 2026 period covers ten months and 2027 covers twelve',
      'The online shop sold more bags in 2027 than in 2026',
      'Lantern ran more workshops in 2027 than in 2026',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'More sales by an activity that existed in both years is exactly what the comparison should show; it is not a break in comparability (though the part-year still applies to it).',
      5: 'More workshops is growth in an existing activity, which the comparison measures.',
    },
    solution: 'A new activity (the cafés), a new cost for the same work (Ana’s salary), new accounting (the leases on the balance sheet) and a different period length all break comparability. Growth in existing activities is what horizontal analysis is meant to measure.',
  },
  {
    id: 'f03-hor-i4', type: 'num', kind: 'applied',
    prompt: `Lantern’s net income was ${money(P26.netIncome)} for the ten months of 2026 and ${money(P27.netIncome)} for 2027. What is the change on annualised figures? Enter a percentage to one decimal place, negative for a fall.`,
    answer: -31.7, check: () => R.growth(P27.netIncome, P26.netIncome, { annualised: true, prevMonths: 10 }) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: -18.1, say: 'That compares ten months with twelve. Annualise 2026’s net income first (× 12 ÷ 10).' },
      { value: -1.7, say: 'Only the ten-month figure is annualised; 2027 is already a full year.' },
    ],
    solution: `Annualised 2026: 27,387 × 12 ÷ 10 = 32,864.4. Change: 22,431 ÷ 32,864.4 − 1 = −31.7%. On a full-year basis the fall is larger than the reported −18.1%.`,
  },
  {
    id: 'f03-hor-i5', type: 'multi', kind: 'applied',
    prompt: 'Coastline Bank screens Lantern’s operating expenses with two thresholds: a line is flagged only if it changed by more than 10% and by more than $5,000. Using the comparative income statement in the lesson, which lines are flagged? Select all that apply.',
    options: [
      `Wages expense (${money(IS['Wages Expense'][0])} to ${money(IS['Wages Expense'][1])})`,
      `Depreciation expense (${money(IS['Depreciation Expense'][0])} to ${money(IS['Depreciation Expense'][1])})`,
      `Utilities expense (${money(IS['Utilities Expense'][0])} to ${money(IS['Utilities Expense'][1])})`,
      `Shipping expense (${money(IS['Shipping Expense'][0])} to ${money(IS['Shipping Expense'][1])})`,
      `Insurance expense (${money(IS['Insurance Expense'][0])} to ${money(IS['Insurance Expense'][1])})`,
      `Rent expense (${money(IS['Rent Expense'][0])} to ${money(IS['Rent Expense'][1])})`,
      `Card and platform fees (${money(IS['Card and Platform Fees Expense'][0])} to ${money(IS['Card and Platform Fees Expense'][1])})`,
      `Fuel expense (${money(IS['Fuel Expense'][0])} to ${money(IS['Fuel Expense'][1])})`,
    ],
    answer: [0, 1, 2, 3, 6],
    feedback: {
      4: 'Insurance rose 120%, but only by $1,800: below the dollar threshold.',
      5: 'Rent rose 20%, but by $2,400: below the dollar threshold.',
      7: 'Fuel rose 48.0%, but by $940.',
    },
    solution: 'Wages +$143,000 (777.2%), depreciation +$15,000 (312.5%), utilities +$8,840 (309.1%), shipping +$7,670 (60.7%) and card fees +$7,530 (187.8%) pass both tests. Insurance (+$1,800), rent (+$2,400) and fuel (+$940) pass the percentage test only.',
  },
  {
    id: 'f03-hor-i6', type: 'short', kind: 'applied',
    prompt: 'Write four to six sentences for Coastline Bank’s loan file summarising what Lantern’s comparative statements show about 2027. Use the comparative income statement and balance sheet in the lesson.',
    rubric: [
      'States the revenue growth and says how the ten-month 2026 affects it (unadjusted 198.9%; about 149.1% annualised).',
      'Explains that the cafés, Ana’s salary and the research programme make the years hard to compare, and that profit fell for those reasons.',
      'Notes that the balance sheet grew mainly because of the cafés’ leases (right-of-use asset and lease liabilities).',
      'Points out the fall in cash and the rise in current liabilities, including the new line of credit, as the lender’s main concern.',
      'Ends with a question or a next step (monthly café results, cash forecast, liquidity ratios).',
    ],
    model: 'Lantern’s net revenue rose from $193,320 to $577,860; because 2026 covered only ten months, growth is about 149% on annualised figures rather than the 199% reported. Operating income fell from $37,716 to $32,787, but most of the fall comes from decisions that make the years hard to compare: the new cafés in their first ten months, Ana’s first salary of $48,000 and $21,000 of market research. Total assets grew 250%, mainly because the café leases put $173,379 of right-of-use assets and lease liabilities on the balance sheet. The concern for the bank is liquidity: cash fell from $42,940 to $6,531 while current liabilities rose 336%, including $24,000 drawn on the line of credit. We should ask for the cafés’ monthly results and a cash forecast for 2028, and work out the liquidity ratios before renewing the line.',
  },
];

export const check = [
  {
    id: 'f03-hor-k1', type: 'num', kind: 'numerical',
    prompt: `Lantern’s retained earnings were ${money(BS['Retained Earnings'][0])} at 31 December 2026 and ${money(BS['Retained Earnings'][1])} at 31 December 2027. What is the percentage change? Enter it to one decimal place.`,
    answer: 91.3, check: () => R.growth(BS['Retained Earnings'][1], BS['Retained Earnings'][0]) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 47.7, say: 'You divided by the 2027 balance. The base is the earlier balance.' },
      { value: 59.4, say: 'Retained earnings are a balance at a date: they are never annualised.' },
    ],
    solution: '(42,818 − 22,387) ÷ 22,387 = 20,431 ÷ 22,387 = 91.3%. Balance sheet amounts are stocks, so the ten-month 2026 needs no adjustment.',
  },
  {
    id: 'f03-hor-k2', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst compares a ten-month period with a twelve-month one. Which of these figures should she annualise before comparing?',
    options: [
      'Cost of goods sold for the period',
      'Inventory at the end of the period',
      'Accounts payable at the end of the period',
      'Total equity at the end of the period',
    ],
    answer: 0,
    feedback: {
      1: 'Inventory is a stock: an amount at a date. It doesn’t accumulate with the months, so it is never annualised.',
      2: 'Accounts payable is a balance at a date, not a flow over the period.',
      3: 'Equity is measured at a date. Only flows (revenue, expenses, cash flows) depend on the length of the period.',
    },
    solution: 'Flows accumulate over the period, so a ten-month flow is scaled by 12 ÷ 10. Balance sheet amounts are stocks at a date and are compared as they are.',
  },
  {
    id: 'f03-hor-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional regional airline carried 4.2 million passengers in 2024 and 5.6 million in 2027. What was the compound annual growth rate of passenger numbers? Enter a percentage to one decimal place.',
    answer: 10.1, check: () => R.cagr(5.6, 4.2, 3) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 33.3, say: 'That is the total growth. Take the cube root of 5.6 ÷ 4.2 for three years.' },
      { value: 11.1, say: 'That divides the total growth by three; compound growth takes the root instead.' },
      { value: 7.5, say: 'From 2024 to 2027 is three years, not four.' },
    ],
    solution: 'CAGR = (5.6 ÷ 4.2)^(1/3) − 1 = 1.3333^(1/3) − 1 = 10.1% a year.',
  },
  {
    id: 'f03-hor-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s online shop sold most of its 2026 bags in the fourth-quarter gift season, and January and February, the months missing from 2026, are quiet. What does annualising the shop’s ten-month 2026 sales (× 12 ÷ 10) do to the measured growth into 2027?',
    options: [
      'It understates growth, because the scaled-up base treats the gift peak as an ordinary month',
      'It overstates growth, because 2027 still includes two more months of trading than the ten months of 2026',
      'It measures growth exactly, because the two missing months are put back',
      'It has no effect on growth, because only balance sheet amounts are annualised',
    ],
    answer: 0,
    feedback: {
      1: 'That is the problem with not annualising at all. Once 2026 is scaled up, the question is whether the scaling is too generous.',
      2: 'Scaling by 12 ÷ 10 puts back two average months, not two quiet ones: the base becomes too large.',
      3: 'Flows are what get annualised; balance sheet amounts never are.',
    },
    solution: 'Multiplying by 12 ÷ 10 adds two months at the ten-month average, which includes the gift peak. January and February are below that average, so the annualised base is too high and the growth measured on it too low. The true growth lies between the annualised and the unadjusted figures.',
  },
  {
    id: 'f03-hor-k5', type: 'fill', kind: 'conceptual',
    prompt: 'A fictional retailer’s operating margin rose from 8% to 10%. Complete the description.',
    text: 'The margin rose by [[0]], which is an increase of [[1]] in the margin itself.',
    blanks: [
      { options: ['2 percentage points', '2%', '25 percentage points'], answer: 0 },
      { options: ['2%', '20%', '25%'], answer: 2 },
    ],
    fixed: true,
    solution: '10% − 8% = 2 percentage points; relative to the 8% base that is 2 ÷ 8 = 25%.',
  },
  {
    id: 'f03-hor-k6', type: 'num', kind: 'applied',
    prompt: `Lantern’s total liabilities rose from ${money(P26.totalLiabilities)} to ${money(P27.totalLiabilities)}. At 31 December 2027, ${money(P27.leaseLiabilities)} of them were operating lease liabilities for the cafés, which did not exist a year earlier. By what percentage did the other liabilities grow? Enter it to one decimal place.`,
    answer: 78.8, check: () => R.growth(P27.totalLiabilities - P27.leaseLiabilities, P26.totalLiabilities - P26.leaseLiabilities) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 416.8, say: 'That is the growth of all liabilities, leases included. Take the lease liabilities out of 2027 first.' },
      { value: 44.1, say: 'You divided the change by the 2027 figure. The base is 2026: 91,686 ÷ 51,289 − 1.' },
    ],
    solution: 'Other liabilities in 2027: 265,065 − 173,379 = 91,686. Growth: 91,686 ÷ 51,289 − 1 = 78.8%. Leases explain most of the 416.8% headline, but the other liabilities still grew by more than three-quarters.',
  },
];
