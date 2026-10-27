// assess-m1.js — F03 module 1 test: Comparing statements (horizontal-analysis, common-size-statements).
// New questions, not copies of lesson exercises: Amazon’s 2012–2014 statements (Form 10-K for 2014; 2012 balance from
// the 2013 10-K), a garden centre’s part-year, Lantern without its cafés, a bakery chain whose margin rose as sales fell,
// and other fictional businesses. No hints; solutions show in review.
import { PERIODS, COMPARATIVE } from './case.js?v=22';
import * as R from '../../../core/ratios.js?v=22';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const cafe = COMPARATIVE.income.find(([n]) => n === 'Café Sales Revenue')[2];
const money = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
// Amazon.com, Inc., $ millions (Form 10-K for 2014, Consolidated Statements of Operations)
const AMZN = { sales: [61093, 74452, 88988], cos: [45971, 54181, 62752], oi: [676, 745, 178], ni: [-39, 274, -241] };

export const items = [
  // ---------------------------------------------------------------- horizontal-analysis
  {
    id: 'f03-m1-1', lesson: 'horizontal-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional ski resort had almost no snow in 2023, and its revenue that year was less than half of a normal season’s. An analyst prepares trend percentages for 2023 to 2027 with 2023 as the base year. What is wrong with the choice?',
    options: [
      'Every later year will look like strong growth, because the base is abnormally low',
      'Trend percentages must always use the most recent year as the base, not the earliest',
      'A base year must have the highest revenue, so that every index stays below 100',
      'Nothing: any year can serve as the base, and the indices will tell the same story',
    ],
    answer: 0,
    feedback: {
      1: 'The base is usually the first year shown; what matters is that it is a normal year.',
      2: 'No rule requires indices below 100. The problem is an unrepresentative base.',
      3: 'The ratios between years stay the same, but the levels read very differently: an index of 210 invites a “doubled” story that is really a recovery.',
    },
    solution: 'Choose an ordinary year as the base. Indexing on a year of unusually low revenue makes every normal year read as growth (a recovery to normal would show as an index above 200). Either pick another base or explain the 2023 shortfall beside the indices.',
  },
  {
    id: 'f03-m1-2', lesson: 'horizontal-analysis', type: 'num', kind: 'numerical',
    prompt: 'Amazon’s total net sales were $61,093 million in 2012 and $88,988 million in 2014 (Form 10-K for 2014). What was the compound annual growth rate of net sales over the period? Enter a percentage to one decimal place.',
    answer: 20.7, check: () => R.cagr(AMZN.sales[2], AMZN.sales[0], 2) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 45.7, say: 'That is the total growth over two years. The CAGR is the yearly rate: the square root of 88,988 ÷ 61,093, minus 1.' },
      { value: 13.4, say: 'From 2012 to 2014 is two years (the gaps), not three.' },
      { value: 22.8, say: 'That halves the total growth. Compound growth takes the square root instead.' },
    ],
    solution: 'CAGR = (88,988 ÷ 61,093)^(1/2) − 1 = 1.4566^0.5 − 1 = 20.7% a year.',
  },
  {
    id: 'f03-m1-3', lesson: 'horizontal-analysis', type: 'num', kind: 'applied',
    prompt: 'A fictional garden centre opened on 1 April 2026. Its revenue was $540,000 for the nine months to 31 December 2026 and $640,000 for 2027. What is the 2027 growth on annualised figures? Enter a percentage to one decimal place, negative for a fall.',
    answer: -11.1, check: () => R.growth(640000, 540000, { annualised: true, prevMonths: 9 }) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 18.5, say: 'That compares nine months with twelve. Annualise 2026 first: 540,000 × 12 ÷ 9.' },
      { value: -12.5, say: 'Divide the change by the annualised 2026 figure (720,000), not by 640,000.' },
    ],
    solution: 'Annualised 2026: 540,000 × 12 ÷ 9 = 720,000. Growth: 640,000 ÷ 720,000 − 1 = −11.1%. Spring is a garden centre’s busiest season, and the nine months began with it while January to March are quiet, so annualising overstates the base: the true change lies between −11.1% and the unadjusted +18.5%.',
  },
  {
    id: 'f03-m1-4', lesson: 'horizontal-analysis', type: 'multi', kind: 'conceptual',
    prompt: 'For which of these changes should an analyst write n/m (not meaningful) in the percentage column and describe the change in dollars instead? Select all that apply.',
    options: [
      'Net income went from a loss of $12,000 to a profit of $30,000',
      'A new revenue line, previously zero, brought in $85,000',
      'A cost of $8,000 fell to zero after a contract ended',
      'A liability doubled from $40,000 to $80,000',
      'Operating cash flow went from −$20,000 to +$5,000',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'A fall from $8,000 to zero is a well-defined −100%: the base is positive.',
      3: 'A positive base gives a clear +100%.',
    },
    solution: 'n/m when the base is zero (the new revenue line) or when the sign changes from negative to positive (the loss turning into a profit, the cash outflow turning into an inflow), because the percentage either doesn’t exist or has no natural meaning. Changes on positive bases, including a fall to zero (−100%), are reported normally.',
  },
  {
    id: 'f03-m1-5', lesson: 'horizontal-analysis', type: 'num', kind: 'numerical',
    prompt: 'Amazon reported income from operations of $676 million in 2012, $745 million in 2013 and $178 million in 2014. With 2012 as the base year (= 100), what is the trend percentage for 2014? Enter it to one decimal place.',
    answer: 26.3, check: () => AMZN.oi[2] / AMZN.oi[0] * 100, unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: 379.8, say: 'Upside down: the base year goes in the denominator, 178 ÷ 676 × 100.' },
      { value: -73.7, say: 'That is the percentage change. The trend percentage is the ratio to the base, × 100.' },
      { value: 23.9, say: 'That uses 2013 as the base. The question sets 2012 = 100.' },
    ],
    solution: 'Index = 178 ÷ 676 × 100 = 26.3: operating income in 2014 was about a quarter of 2012’s, after rising to 110.2 in 2013.',
  },
  {
    id: 'f03-m1-6', lesson: 'horizontal-analysis', type: 'num', kind: 'applied',
    prompt: `Ana wants to know how fast Lantern’s business grew apart from the cafés. Net revenue was ${money(P26.revenue)} for the ten months of 2026 (no cafés) and ${money(P27.revenue)} for 2027, of which ${money(cafe)} was café sales. What is the growth of non-café revenue on annualised figures? Enter a percentage to one decimal place.`,
    answer: 47.4, check: () => R.growth(P27.revenue - cafe, P26.revenue, { annualised: true, prevMonths: 10 }) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 76.8, say: 'Right to take out the café sales, but 2026 covers ten months: annualise it (× 12 ÷ 10) first.' },
      { value: 149.1, say: 'That is the growth of all revenue. The cafés did not exist in 2026: take their sales out of 2027.' },
      { value: 32.1, say: 'You divided the change by 2027’s non-café revenue; the base is annualised 2026.' },
    ],
    solution: `Non-café revenue in 2027: 577,860 − 236,000 = 341,860. Annualised 2026: 193,320 × 12 ÷ 10 = 231,984. Growth: 341,860 ÷ 231,984 − 1 = 47.4%, against 149.1% for all revenue. (The law firm’s new contract is still inside the 47.4%.)`,
  },
  {
    id: 'f03-m1-7', lesson: 'horizontal-analysis', type: 'mc', kind: 'applied',
    prompt: 'Amazon’s net sales grew 19.5% from 2013 to 2014, while its income from operations fell from $745 million to $178 million (Form 10-K for 2014). What should an analyst conclude from the horizontal analysis alone?',
    options: [
      'That the business is failing, and the shares should be sold before profits fall further',
      'That costs grew faster than sales, so the next step is to find which costs and why',
      'That the fall must be an accounting error, since sales and profit always move together',
      'That growth is all that matters, so the fall in operating income can be ignored',
    ],
    answer: 1,
    feedback: {
      0: 'Horizontal analysis shows what changed, not why: a fall caused by deliberate investment and one caused by losing customers call for opposite conclusions.',
      2: 'Sales and profit often move apart when costs change; nothing suggests an error.',
      3: 'A 76.1% fall in operating income is material by any test; it needs explaining.',
    },
    solution: 'Operating income fell 76.1% while sales rose 19.5%, so operating costs grew faster than sales. Horizontal analysis identifies the question; the analyst then uses common-size statements, the notes and management’s discussion to find which costs grew and whether the cause is temporary.',
  },
  // ---------------------------------------------------------------- common-size-statements
  {
    id: 'f03-m1-8', lesson: 'common-size-statements', type: 'num', kind: 'numerical',
    prompt: 'Amazon’s 2014 Form 10-K reports total net sales of $88,988 million and cost of sales of $62,752 million. On a common-size income statement, what is cost of sales? Enter a percentage to one decimal place.',
    answer: 70.5, check: () => AMZN.cos[2] / AMZN.sales[2] * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 29.5, say: 'That is the share left after cost of sales (the gross margin). The question asks for cost of sales itself.' },
      { value: 141.8, say: 'Upside down: divide cost of sales by net sales.' },
    ],
    solution: '62,752 ÷ 88,988 = 70.5% of net sales; the other 29.5% is gross profit.',
  },
  {
    id: 'f03-m1-9', lesson: 'common-size-statements', type: 'num', kind: 'numerical',
    prompt: 'Amazon’s income from operations was $178 million on total net sales of $88,988 million in 2014. What was its operating margin? Enter a percentage to two decimal places.',
    answer: 0.2, check: () => AMZN.oi[2] / AMZN.sales[2] * 100, unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 1, say: 'That is 2013’s operating margin (745 ÷ 74,452). Use the 2014 figures.' },
      { value: -0.27, say: 'That is the net margin (a net loss of $241 million). The operating margin uses income from operations.' },
    ],
    solution: '178 ÷ 88,988 = 0.20%: about one-fifth of a cent of operating income for each dollar of sales, down from 1.00% in 2013.',
  },
  {
    id: 'f03-m1-10', lesson: 'common-size-statements', type: 'mc', kind: 'conceptual',
    prompt: 'On a common-size balance sheet, which figure is set to 100%?',
    options: [
      'Total assets',
      'Net revenue for the year',
      'Total current assets, with noncurrent assets shown separately',
      'Shareholders’ equity, so that each liability reads as a multiple of the owners’ stake',
    ],
    answer: 0,
    feedback: {
      1: 'Revenue is the base of the common-size income statement. A balance sheet divides by a balance at the same date.',
      2: 'Current assets can be a useful narrower base for some questions, but the standard base is total assets.',
      3: 'Dividing by equity gives leverage ratios, not a common-size statement, and fails when equity is negative.',
    },
    solution: 'Total assets, which equals total liabilities and equity, so both sides of the balance sheet add to 100%.',
  },
  {
    id: 'f03-m1-11', lesson: 'common-size-statements', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery chain’s revenue fell 20% this year, but its net margin rose from 4.0% to 6.0%. By what percentage did its net income change? Enter a percentage to one decimal place, negative for a fall.',
    answer: 20, check: () => ((1 - 0.2) * 0.06 / 0.04 - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 50, say: 'That is the rise in the margin. Revenue also fell, so net income = 0.8 × 6.0% against 1 × 4.0% of last year’s revenue.' },
      { value: -20, say: 'That is the change in revenue. The margin rose by half, which more than offsets the fall.' },
      { value: 2, say: 'That is the change in the margin in percentage points, not the change in net income.' },
    ],
    solution: 'Take last year’s revenue as 100: net income was 4.0. This year revenue is 80 and net income 80 × 6.0% = 4.8. Change: 4.8 ÷ 4.0 − 1 = +20.0%. Vertical and horizontal analysis together: the margin rose 2 points, the revenue fell, and the dollars rose.',
  },
  {
    id: 'f03-m1-12', lesson: 'common-size-statements', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about common-size analysis.',
    text: 'A company that moves warehouse wages from operating expenses into cost of sales will report a lower [[0]] and an unchanged [[1]]. Margins for a ten-month period [[2]] before comparing them with a full year’s.',
    blanks: [
      { options: ['operating margin', 'net margin', 'gross margin'], answer: 2 },
      { options: ['gross margin', 'operating margin', 'cost of sales share'], answer: 1 },
      { options: ['need no annualising', 'must be multiplied by 12 ÷ 10', 'must be divided by 12 ÷ 10'], answer: 0 },
    ],
    fixed: true,
    solution: 'Moving a cost into cost of sales lowers gross profit and the gross margin; operating income is unchanged because the cost was already above it. Margins divide two flows for the same months, so they need no annualising.',
  },
];
