// benchmarking-and-annual-reports.ex.js — F03 · Benchmarking and annual reports: widgets, practice and the knowledge
// check (answer keys live here). Lantern’s figures come from case.js; the peer file is fictional and repeated from the lesson file
// (which this browser-loaded file must not import); Starbucks’ FY2024 figures are from its 10-K.
import { PERIODS, LEASE, BREWER } from './case.js?v=22';
import { HARBOURLINE as H, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=22';

const P27 = PERIODS[2027];
const PEERS = {
  names: ['Alder & Oak', 'Bramblecup', 'Copperline', 'Driftwood', 'Emberly', 'Fogwell', 'Greyfriars', 'Heronsgate', 'Ironbark'],
  current: [0.94, 0.62, 1.30, 1.05, 0.78, 1.75, 0.85, 1.48, 1.12],
  opMargin: [6.0, 3.1, 8.1, 6.8, 4.5, 12.0, 5.2, 9.6, 7.4],
  z: [1.9, -0.4, 3.8, 2.4, 0.6, 5.5, 1.2, 4.6, 3.1],
};
const qInc = (xs, q) => { const s = [...xs].sort((a, b) => a - b), pos = (s.length - 1) * q / 4, lo = Math.floor(pos); return s[lo] + (pos - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]); };

const peerCells = (() => {
  const c = { A1: 'Business', B1: 'Current ratio', C1: 'Operating margin (%)', D1: 'Altman Z″' };
  PEERS.names.forEach((n, i) => { c[`A${i + 2}`] = n; c[`B${i + 2}`] = PEERS.current[i]; c[`C${i + 2}`] = PEERS.opMargin[i]; c[`D${i + 2}`] = PEERS.z[i]; });
  c.A12 = 'Q1'; c.A13 = 'Median'; c.A14 = 'Q3'; c.A16 = 'Lantern 2027'; c.B16 = 0.52; c.C16 = 5.7; c.D16 = 0.24;
  return c;
})();

const HB = { revenue: H.revenue, operatingIncome: H.ebit, ebit: H.ebit, interestExpense: HD.interest, pretax: HD.profitBeforeTax, tax: HD.tax,
  netIncome: H.netIncome, da: H.da, cash: H.cash, receivables: HD.receivables, inventory: HD.inventory, currentAssets: H.currentAssets,
  totalAssets: HD.totalAssets, currentLiabilities: H.currentLiabilities, totalLiabilities: HD.totalAssets - HD.bookEquity, debt: H.debt,
  leaseLiabilities: 0, equity: HD.bookEquity, capex: HD.capex };
const SB = { revenue: 36176.2, operatingIncome: 5408.8, ebit: 5408.8, interestExpense: 562.0, pretax: 4969.6, netIncome: 3760.9, da: 1592.4,
  cash: 3286.2, shortTermInvestments: 257.0, receivables: 1213.8, inventory: 1777.3, currentAssets: 6847.4, totalAssets: 31339.3,
  payables: 1595.5, currentLiabilities: 9070.0, totalLiabilities: 38780.9, debt: 1248.9 + 14319.5, leaseLiabilities: 1463.1 + 8771.6,
  equity: -7441.6, retainedEarnings: -7343.8, cfo: 6095.6, capex: 2777.5 };
const SB23 = { totalAssets: 29445.5, equity: -7987.8, currentAssets: 7303.4, currentLiabilities: 9345.3, receivables: 1184.1, inventory: 1806.4, payables: 1544.3 };

export const widgets = {
  'bench-ratios': {
    type: 'ratios',
    title: 'Lantern, Harbourline and Starbucks side by side',
    periods: [{ label: 'Lantern 2026 (10 months)', data: PERIODS[2026] }, { label: 'Lantern 2027', data: P27 }],
    peers: [
      { label: 'Harbourline (fictional, $m)', data: HB, note: 'One year only, so its ratios use closing balances.' },
      { label: 'Starbucks FY2024 ($m)', data: SB, prev: SB23 },
    ],
    ratios: ['current', 'quick', 'operatingMargin', 'netMargin', 'roa', 'roe', 'debtToEquity', 'interestCoverage', 'assetTurnover'],
    toggles: ['average', 'leases'],
    select: 'current',
    note: 'Lantern: fictional. Harbourline: F00’s fictional roaster, in $ millions, with no leases reported. Starbucks: Form 10-K for fiscal 2024, $ millions; its equity is negative, so the widget shows return on equity and debt to equity as n/m (not meaningful). Ratios are scale-free, so dollars and millions of dollars compare.',
  },
  'bench-sheet': {
    type: 'sheet',
    title: 'Coastline’s peer file (fictional)',
    sheet: { cells: peerCells },
    view: 'A1:D16',
    formats: { B: '0.00', C: '0.0', D: '0.0' },
    widths: { A: 16, B: 13, C: 20, D: 11 },
    editable: 'B2:D14',
    tools: ['formulas', 'reset'],
    note: 'Rows 12–14 are empty for your formulas: <x>=QUARTILE.INC(B2:B10,1)</x>, <x>=MEDIAN(B2:B10)</x>, <x>=QUARTILE.INC(B2:B10,3)</x>, and the same for columns C and D. Then change Fogwell’s current ratio (B7) from 1.75 to 9.75: the median doesn’t move, though the average would rise by almost 0.9.',
  },
};

export const guided = [
  {
    id: 'f03-bench-g1', type: 'steps', kind: 'numerical',
    prompt: 'The operating margins (%) of the nine peers are 6.0, 3.1, 8.1, 6.8, 4.5, 12.0, 5.2, 9.6 and 7.4. Lantern’s 2027 operating margin is 5.7%.',
    steps: [
      { id: 'f03-bench-g1a', type: 'num', kind: 'numerical', prompt: 'What is the peers’ median operating margin (%)?',
        answer: 6.8, check: () => qInc(PEERS.opMargin, 2), tol: 0.005, unit: '%', places: 1,
        hints: ['Sort the nine values first.', 'The median is the fifth of nine: 3.1, 4.5, 5.2, 6.0, 6.8, …'],
        wrong: [{ value: 6.97, say: 'That is the average. The median is the middle value of the sorted list.' }],
        solution: 'Sorted: 3.1, 4.5, 5.2, 6.0, 6.8, 7.4, 8.1, 9.6, 12.0. The fifth value is 6.8%.' },
      { id: 'f03-bench-g1b', type: 'num', kind: 'numerical', prompt: 'What is the first quartile (%) by the inclusive method (QUARTILE.INC)?',
        answer: 5.2, check: () => qInc(PEERS.opMargin, 1), tol: 0.005, unit: '%', places: 1,
        hints: ['Position (n − 1) × 0.25, counting the smallest as position 0.', '(9 − 1) × 0.25 = 2: the third value.'],
        wrong: [{ value: 4.85, say: 'That is the exclusive method, position (n + 1) × 0.25 = 2.5 counting from 1. The question asks for the inclusive method.' }],
        solution: 'Position 8 × 0.25 = 2, the third sorted value: 5.2%.' },
      { id: 'f03-bench-g1c', type: 'mc', kind: 'conceptual', prompt: 'How would you describe Lantern’s 5.7% against the peers?',
        options: ['Between Q1 and the median', 'In the bottom quarter of the peers', 'Above the median', 'Impossible to say without the peers’ average'],
        answer: 0,
        hints: ['Compare 5.7 with 5.2 and 6.8.'],
        feedback: { 1: 'The bottom quarter is below Q1, 5.2%; Lantern is above it.', 2: 'The median is 6.8%; Lantern is below it.', 3: 'The median and quartiles are the summary to use; the average adds little.' },
        solution: '5.2 < 5.7 < 6.8: between Q1 and the median. Three of the nine peers are below Lantern.' },
    ],
    solution: 'Median 6.8%, Q1 5.2%; Lantern (5.7%) is below the median but above the bottom quarter.',
  },
  {
    id: 'f03-bench-g2', type: 'mc', kind: 'conceptual',
    prompt: 'Coastline wants a peer group for Lantern (a private business with two cafés, an online shop, workshops and catering). Which is the best choice?',
    options: [
      'Independent coffee businesses that run a few cafés of their own, with similar revenue, reporting under US GAAP',
      'The largest listed coffee chains, because their statements are audited and published',
      'All of Coastline’s small-business borrowers, whatever their industry, for a large sample',
      'Coffee roasters that sell beans wholesale to supermarkets, because they sell the same product to the same final customers',
    ],
    answer: 0,
    hints: ['Apply the four tests: business model, size and stage, ownership and financing, accounting basis.'],
    feedback: {
      1: 'Listed chains differ in scale and often in model (licensing); use them for context.',
      2: 'A large sample of different industries mixes business models with very different normal ratios.',
      3: 'Same product, different model: wholesale roasters don’t run cafés or carry café leases.',
    },
    solution: 'Peers should share the business model (cafés run by the owner), size and stage, ownership (private) and accounting basis (US GAAP).',
  },
  {
    id: 'f03-bench-g3', type: 'formula', kind: 'applied',
    prompt: 'In D14 of Coastline’s peer file, calculate the third quartile of the peers’ Altman Z″ scores by the inclusive method, in one formula.',
    sheet: { cells: peerCells },
    cell: 'D14', answer: '=QUARTILE.INC(D2:D10,3)',
    alt: ['=QUARTILE(D2:D10,3)', '=PERCENTILE.INC(D2:D10,0.75)', '=PERCENTILE(D2:D10,0.75)'],
    view: 'A1:D16',
    formats: { B: '0.00', C: '0.0', D: '0.0' },
    hints: ['QUARTILE.INC takes the range and the quartile number.', '<x>=QUARTILE.INC(D2:D10,3)</x>'],
    wrong: [
      { formula: '=QUARTILE.EXC(D2:D10,3)', say: 'That is the exclusive method. The course uses the inclusive one, QUARTILE.INC.' },
      { formula: '=QUARTILE.INC(D2:D10,1)', say: 'The 1 gives the first quartile. The third quartile needs 3.' },
    ],
    solution: '<x>=QUARTILE.INC(D2:D10,3)</x> = 3.8: position (9 − 1) × 0.75 = 6, the seventh sorted value.',
  },
];

export const independent = [
  {
    id: 'f03-bench-i1', type: 'num', kind: 'numerical',
    prompt: 'Eight fictional catering firms have receivables days of 22, 35, 28, 41, 30, 26, 38 and 33. What is the first quartile by the inclusive method (QUARTILE.INC)? Enter one decimal place.',
    answer: 27.5, check: () => qInc([22, 35, 28, 41, 30, 26, 38, 33], 1), tol: 0.05, unit: 'days', places: 1,
    wrong: [
      { value: 26.5, say: 'That is the exclusive method (position (n + 1) × 0.25 = 2.25 counting from 1).' },
      { value: 31.5, say: 'That is the median. Q1 is at position (8 − 1) × 0.25 = 1.75, counting from 0.' },
    ],
    solution: 'Sorted: 22, 26, 28, 30, 33, 35, 38, 41. Position 7 × 0.25 = 1.75: three-quarters of the way from 26 (position 1) to 28 (position 2): 26 + 0.75 × 2 = 27.5 days.',
  },
  {
    id: 'f03-bench-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Where in a Form 10-K would you look first for each of these?',
    items: [
      'Management’s explanation of why the gross margin fell',
      'The company’s dependence on a single coffee supplier, described as a risk',
      'How many stores the company operates and how many it licenses',
      'A paragraph on substantial doubt about the company’s ability to continue as a going concern',
      'The effect of a one-point rise in interest rates on its floating-rate debt',
      'Management’s conclusion that internal control over financial reporting was not effective',
    ],
    categories: ['Item 1 (Business)', 'Item 1A (Risk Factors)', 'Item 7 (MD&A)', 'Item 7A (Market Risk)', 'Item 8 (Financial Statements and the auditor’s report)', 'Item 9A (Controls and Procedures)'],
    answer: [2, 1, 0, 4, 3, 5],
    feedback: {
      0: 'Explaining results and trends is the job of the MD&A.',
      3: 'The auditor’s report, in Item 8, carries any going-concern paragraph.',
      4: 'Interest-rate sensitivity is market risk.',
    },
    solution: 'Results explained: Item 7. Risks: Item 1A. Store counts: Item 1. Going-concern doubt: the auditor’s report in Item 8. Rate sensitivity: Item 7A. Internal control: Item 9A.',
  },
  {
    id: 'f03-bench-i3', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s lease note shows undiscounted remaining payments of $200,000 at 31 December 2027 and lease liabilities of $173,379. How much of the remaining payments is interest?',
    answer: 26621, check: () => 50 * LEASE.payment - LEASE.end2027, tol: 0.5, unit: '$', places: 0,
    wrong: [{ value: 40000, say: 'That is 2027’s lease cost. The interest still to come is the undiscounted payments minus their present value.' }],
    solution: '200,000 − 173,379 = $26,621: the interest that will be charged on the liability over the remaining 50 months.',
  },
  {
    id: 'f03-bench-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Why is Starbucks’ return on equity not a useful benchmark for anyone in fiscal 2024?',
    options: [
      'Its equity is negative (a $7,441.6 million deficit), so profit ÷ equity is meaningless',
      'Its net income is negative, so every return ratio is negative',
      'Its fiscal year ends in September, so its ROE can’t be compared with any calendar-year company',
      'ROE is a non-GAAP measure that Starbucks is not allowed to report',
    ],
    answer: 0,
    feedback: {
      1: 'Starbucks earned $3,760.9 million in fiscal 2024.',
      2: 'Different year ends are a comparability issue, not a reason a ratio is meaningless.',
      3: 'ROE is a ratio analysts compute; the issue is the negative denominator.',
    },
    solution: 'A positive profit over negative equity gives a negative ROE that says nothing about returns; analysts use return on assets or on invested capital instead.',
  },
  {
    id: 'f03-bench-i5', type: 'order', kind: 'applied',
    prompt: 'Put the parts of a credit memo in the order the reader should meet them.',
    items: [
      'Conclusion and recommendation',
      'Evidence: the key ratios and trends, each with its benchmark',
      'What the numbers don’t show: timing, estimates and commitments from the notes',
      'Risks that could make the conclusion wrong',
      'Conditions and follow-up',
    ],
    solution: 'The conclusion first, then the evidence for it, then what the notes add, then the risks, and finally the conditions and when to review.',
  },
];

export const check = [
  {
    id: 'f03-bench-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why do analysts summarise a peer group by its median and quartiles rather than its average?',
    options: [
      'A few unusual peers can pull an average a long way but barely move the median, and quartiles show how widely typical peers differ',
      'The average can only be calculated when every peer has the same year end',
      'The median is always higher than the average for financial ratios',
      'Spreadsheets can’t calculate averages of ratios correctly',
    ],
    answer: 0,
    feedback: {
      1: 'Year ends affect comparability, not whether an average can be computed.',
      2: 'The median can be above or below the average, depending on the shape of the data.',
      3: 'They can; the problem is what an average represents when some peers are extreme.',
    },
    solution: 'Medians resist outliers; quartiles describe the spread of typical peers.',
  },
  {
    id: 'f03-bench-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s debt note at 31 December 2027 lists: Coastline note $10,000 due 1 March 2028; van note instalments of $5,000 each June in 2028, 2029 and 2030; brewer plan principal of $12,091 in 2028 and $4,159 in 2029; line of credit $24,000 (current). How much debt falls due in 2028?',
    answer: 51091, check: () => 10000 + 5000 + BREWER.current2027 + 24000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 65250, say: 'That is all of Lantern’s debt. Only the amounts due in 2028 count.' },
      { value: 27091, say: 'That is the current portion of long-term debt; the line of credit, also current, is due too.' },
    ],
    solution: '10,000 + 5,000 + 12,091 + 24,000 = $51,091, against year-end cash of $6,531.',
  },
  {
    id: 'f03-bench-k3', type: 'mc', kind: 'conceptual',
    prompt: 'A company’s 10-K contains an unqualified audit opinion. What does that tell you?',
    options: [
      'Only that the statements present fairly, in all material respects, under US GAAP',
      'The company is financially sound and unlikely to fail within the next twelve months',
      'The auditor found no estimates or judgements in the statements',
      'Management’s non-GAAP measures have been audited and approved',
    ],
    answer: 0,
    feedback: {
      1: 'A fairly presented set of statements can show a weak business; a going-concern paragraph would flag doubt.',
      2: 'Every set of statements contains estimates; critical audit matters often describe the hardest ones.',
      3: 'The opinion covers the financial statements, not management’s own measures elsewhere in the report.',
    },
    solution: 'An unqualified opinion is about the presentation of the statements. The analysis of health is still yours to do.',
  },
  {
    id: 'f03-bench-k4', type: 'multi', kind: 'applied',
    prompt: 'Select all that apply: which differences between Starbucks and Lantern come from their business models rather than from scale or accounting?',
    options: [
      'About 12.5% of Starbucks’ revenue comes from licensed stores that other companies run',
      'Starbucks’ customers prepay on stored-value cards, which funds part of its working capital',
      'Starbucks’ revenue is about 62,600 times Lantern’s',
      'Starbucks’ fiscal year ends in late September; Lantern’s on 31 December',
      'Lantern earns revenue from workshops and an event-catering contract as well as cafés and an online shop',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'That is scale.',
      3: 'That is a reporting convention, not the business model.',
    },
    solution: 'Licensing, stored-value cards and Lantern’s mix of revenue lines are business-model differences; size is scale; year ends are a reporting matter.',
  },
  {
    id: 'f03-bench-k5', type: 'mc', kind: 'applied',
    prompt: 'Which is the best opening for Coastline’s memo on renewing Lantern’s line of credit?',
    options: [
      'Renew at the current $30,000 limit for a year, with monthly reporting and no dividends until the line is below $10,000.',
      'Lantern Coffee Co. is a private company founded by Ana Lim in 2026 that operates two cafés, an online shop, workshops and catering.',
      'Lantern has several strengths and some weaknesses, which the sections below discuss in turn, setting out every ratio computed for both years and for the peers.',
      'Lantern’s Z″ of 0.24 is in the distress zone, so the line should be withdrawn.',
    ],
    answer: 0,
    feedback: {
      1: 'Background belongs later, if at all: the reader needs the decision first.',
      2: 'A memo that doesn’t reach a conclusion hasn’t done its job, and listing every ratio buries the evidence.',
      3: 'A score is a screen, not a decision; the memo must weigh it with the notes and the peers.',
    },
    solution: 'Lead with the recommendation and its conditions; the evidence and risks follow.',
  },
  {
    id: 'f03-bench-k6', type: 'num', kind: 'numerical',
    prompt: 'At 29 September 2024 Starbucks reported total current assets of $6,847.4 million and total current liabilities of $9,070.0 million. What was its current ratio? Enter two decimal places.',
    answer: 0.75, check: () => SB.currentAssets / SB.currentLiabilities, tol: 0.005, unit: '', places: 2,
    wrong: [{ value: 1.32, say: 'That is current liabilities ÷ current assets, upside down.' }],
    solution: '6,847.4 ÷ 9,070.0 = 0.75: below 1, like many café businesses, because sales are paid at once and customers prepay on cards.',
  },
];

