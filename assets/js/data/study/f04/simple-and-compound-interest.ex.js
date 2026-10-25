// simple-and-compound-interest.ex.js — F04 · Simple and compound interest: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Uses COASTLINE_NOTE from case.js for Lantern's note; every other business and figure is fictional.
import { COASTLINE_NOTE as N } from './case.js?v=15';

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const yrs = (t) => `${Number.isInteger(t) ? t : t.toFixed(2)} year${t === 1 ? '' : 's'}`;
const days = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);
const P = N.principal, R = N.rate / 100;

export const widgets = {
  'sci-grow': {
    type: 'formula',
    title: 'Simple and compound growth over any period',
    intro: 'One amount, one annual rate, any length of time, including fractions of a year.',
    inputs: [
      { id: 'pv', label: 'Amount today (PV)', min: 100, max: 100000, step: 100, value: 8000, fmt: 'money' },
      { id: 'r', label: 'Annual interest rate', min: 0.5, max: 20, step: 0.1, value: 7, fmt: 'pct' },
      { id: 't', label: 'Time', min: 0.25, max: 40, step: 0.25, value: 6, fmt: 'num', unit: 'years' },
    ],
    compute: (v) => {
      const r = v.r / 100;
      const comp = (t) => v.pv * (1 + r) ** t;
      const simple = (t) => v.pv * (1 + r * t);
      const diff = comp(v.t) - simple(v.t);
      const exact = Math.log(2) / Math.log(1 + r);
      let note;
      if (v.t < 1) note = `For less than one year simple interest pays more: ${money(-diff)} more here. Within one period the compound curve sits just below the straight line of simple interest; the two meet at exactly one year.`;
      else if (v.t === 1) note = 'At exactly one period the two methods agree: interest on interest needs a second period to appear.';
      else note = `Compounding adds ${money(diff)} over ${yrs(v.t)}, ${pct((diff / (simple(v.t) - v.pv)) * 100, 1)} more interest than simple interest pays. The gap grows faster the longer the money is left.`;
      const xs = Array.from({ length: 25 }, (_, k) => r2((v.t * k) / 24));
      return {
        headline: { label: `Compound balance after ${yrs(v.t)}`, value: money(comp(v.t)) },
        rows: [
          ['Simple-interest balance', money(simple(v.t))],
          ['Compound − simple', money(diff)],
          ['Growth factor (1 + r)^t', (1 + r) ** v.t > 1000 ? ((1 + r) ** v.t).toFixed(2) : ((1 + r) ** v.t).toFixed(6)],
          ['Doubling time: exact', `${exact.toFixed(2)} years`],
          ['Doubling time: rule of 72', `${(72 / v.r).toFixed(2)} years`],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Years', values: xs },
          series: [{ name: 'Compound', values: xs.map((t) => r2(comp(t))) }, { name: 'Simple', values: xs.map((t) => r2(simple(t))) }],
          y: { label: 'Balance ($)', format: 'money' } },
      };
    },
  },
  'sci-solve': {
    type: 'formula',
    title: 'Solve for the time or the rate',
    intro: 'A starting amount, a target, a rate and the time you are willing to wait.',
    inputs: [
      { id: 'pv', label: 'Starting amount (PV)', min: 1000, max: 100000, step: 500, value: 18000, fmt: 'money' },
      { id: 'fv', label: 'Target amount (FV)', min: 1000, max: 200000, step: 500, value: 25000, fmt: 'money' },
      { id: 'r', label: 'Annual interest rate', min: 0.5, max: 20, step: 0.1, value: 4.5, fmt: 'pct' },
      { id: 'n', label: 'Years you can wait', min: 1, max: 40, step: 1, value: 5, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      if (v.fv <= v.pv) return { headline: { label: 'Time needed', value: '—' }, rows: [], note: '', error: 'The target is not above the starting amount, so no time is needed. Raise the target or lower the starting amount.' };
      const r = v.r / 100;
      const n = Math.log(v.fv / v.pv) / Math.log(1 + r);
      const whole = Math.ceil(n - 1e-9);
      const need = ((v.fv / v.pv) ** (1 / v.n) - 1) * 100;
      const balN = v.pv * (1 + r) ** v.n;
      const note = balN >= v.fv - 0.005
        ? `At ${pct(v.r, 1)} the target is reached within your ${yrs(v.n)}: the formula says after ${n.toFixed(2)} years. Any rate of at least ${pct(need)} would do.`
        : `At ${pct(v.r, 1)}, ${yrs(v.n)} leaves you ${money(v.fv - balN)} short. To reach ${money(v.fv)} in ${yrs(v.n)} you need ${pct(need)} a year; at ${pct(v.r, 1)} it takes ${n.toFixed(2)} years.`;
      const H = Math.min(Math.max(v.n, whole), 60);
      const xs = Array.from({ length: H + 1 }, (_, k) => k);
      return {
        headline: { label: `Time to grow ${money(v.pv)} to ${money(v.fv)} at ${pct(v.r, 1)}`, value: `${n.toFixed(2)} years` },
        rows: [
          ['Whole years, if interest is credited once a year', `${whole}`],
          [`Balance after ${yrs(v.n)} at this rate`, money(balN)],
          [`Rate needed to reach the target in ${yrs(v.n)}`, pct(need)],
          ['Target ÷ starting amount', (v.fv / v.pv).toFixed(6)],
        ],
        note: H < whole ? `${note} The chart shows the first 60 years.` : note,
        chart: { kind: 'line', x: { label: 'Years', values: xs },
          series: [{ name: 'Balance', values: xs.map((t) => r2(v.pv * (1 + r) ** t)) }, { name: 'Target', values: xs.map(() => v.fv) }],
          y: { label: '$', format: 'money' } },
      };
    },
  },
  'sci-rule72': (() => {
    const rates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24];
    return {
      type: 'chart', kind: 'line', title: 'Years to double: exact and the rule of 72',
      x: { label: 'Annual rate (%)', values: rates },
      series: [
        { name: 'Exact: ln 2 ÷ ln(1 + r)', values: rates.map((p) => r2(Math.log(2) / Math.log(1 + p / 100))) },
        { name: 'Rule of 72', values: rates.map((p) => r2(72 / p)) },
      ],
      y: { label: 'Years to double', format: 'num' },
      note: 'The curves meet at about 7.85%. Below that the rule overstates the doubling time (by 2.34 years at 1%); above it the rule understates it (by 0.22 years at 24%).',
    };
  })(),
};

export const guided = [
  {
    id: 'f04-sci-g1', type: 'steps', kind: 'numerical',
    prompt: 'Lantern’s $10,000 note at 6% a year pays interest on 1 September and on 1 December 2027. Work out the interest for that quarter under actual/365 and actual/360, and compare with the $150 Coastline charges on a 30/360 basis.',
    solution: 'Calendar days: 29 (rest of September) + 31 + 30 + 1 = 91. Actual/365: 10,000 × 0.06 × 91 ÷ 365 ≈ $149.59. Actual/360: 10,000 × 0.06 × 91 ÷ 360 ≈ $151.67. Under 30/360 every quarter is 90 days, giving exactly $150.00, which is what Coastline charges.',
    steps: [
      { id: 'f04-sci-g1-s1', type: 'num', prompt: 'How many calendar days are there from 1 September to 1 December 2027 (counting 1 December but not 1 September)?',
        answer: 91, check: () => days('2027-09-01', '2027-12-01'), unit: 'days', places: 0, tol: 0,
        hints: ['Count the days left in September after the 1st, then all of October and November, then 1 December.', 'September has 30 days, October 31, November 30: 29 + 31 + 30 + 1.'],
        wrong: [{ value: 90, say: 'That is the 30/360 count, which treats every month as 30 days. Count the calendar days.' }, { value: 92, say: 'You counted both 1 September and 1 December. Count one end, not both.' }] },
      { id: 'f04-sci-g1-s2', type: 'num', prompt: 'Interest for the quarter under actual/365, to the nearest cent.',
        answer: 149.59, check: () => P * R * 91 / 365, unit: '$', places: 2, tol: 0.02,
        hints: ['I = P × r × days ÷ 365.', '10,000 × 0.06 × 91 ÷ 365.'],
        wrong: [{ value: 150, say: 'That is the 30/360 answer (90 ÷ 360 of a year). Use 91 days over 365.' }, { value: 151.67, say: 'That divides by 360. Actual/365 divides by 365.' }] },
      { id: 'f04-sci-g1-s3', type: 'num', prompt: 'Interest for the quarter under actual/360, to the nearest cent.',
        answer: 151.67, check: () => P * R * 91 / 360, unit: '$', places: 2, tol: 0.02,
        hints: ['Same days, a 360-day year.', '10,000 × 0.06 × 91 ÷ 360.'],
        wrong: [{ value: 149.59, say: 'That divides by 365. Actual/360 divides by 360, which gives a little more interest.' }, { value: 150, say: 'That counts 90 days. Actual/360 counts the 91 calendar days.' }] },
    ],
  },
  {
    id: 'f04-sci-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional saver put $12,000 into a fund that was worth $15,500 five years later. What constant annual compound rate links the two amounts? Give a percentage to two decimal places.',
    answer: 5.25, check: () => ((15500 / 12000) ** (1 / 5) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['r = (FV ÷ PV)^(1/n) − 1.', '15,500 ÷ 12,000 ≈ 1.291667; raise it to the power 1/5 = 0.2.'],
    wrong: [
      { value: 5.83, say: 'That is the total growth (29.17%) divided by five: simple-interest arithmetic. Take the fifth root of 1.291667 instead.' },
      { value: 29.17, say: 'That is the total growth over five years. The question asks for the rate per year.' },
    ],
    solution: 'FV ÷ PV = 15,500 ÷ 12,000 ≈ 1.291667. Fifth root: 1.291667^0.2 ≈ 1.052519, so r ≈ 5.25% a year. Check: 12,000 × 1.052519⁵ ≈ 15,500.',
  },
  {
    id: 'f04-sci-g3', type: 'steps', kind: 'numerical',
    prompt: 'How long will $7,500 take to grow to $12,000 at 5% a year compounded annually?',
    solution: 'Ratio 12,000 ÷ 7,500 = 1.6. n = ln 1.6 ÷ ln 1.05 = 0.470004 ÷ 0.048790 ≈ 9.63 years. Interest is credited once a year, so the balance is $11,634.96 after nine years and $12,216.71 after ten: the target is first reached at the end of year 10.',
    steps: [
      { id: 'f04-sci-g3-s1', type: 'num', prompt: 'What is the ratio FV ÷ PV?',
        answer: 1.6, check: () => 12000 / 7500, unit: '', places: 2, tol: 0.005,
        hints: ['Divide the target by the starting amount.'] },
      { id: 'f04-sci-g3-s2', type: 'num', prompt: 'Use logarithms: how many years does the formula give? Two decimal places.',
        answer: 9.63, check: () => Math.log(12000 / 7500) / Math.log(1.05), unit: 'years', places: 2, tol: 0.01,
        hints: ['n = ln(FV ÷ PV) ÷ ln(1 + r).', 'ln 1.6 ≈ 0.470004 and ln 1.05 ≈ 0.048790.'],
        wrong: [
          { value: 12, say: 'That is 60% growth ÷ 5% a year: simple interest. With compounding the target comes sooner.' },
          { value: 14.4, say: 'That is the rule-of-72 doubling time at 5%. The target here is 1.6 times the start, not double.' },
        ] },
      { id: 'f04-sci-g3-s3', type: 'num', prompt: 'If interest is credited only at the end of each year, after how many whole years is the balance first at least $12,000?',
        answer: 10, check: () => Math.ceil(Math.log(12000 / 7500) / Math.log(1.05)), unit: 'years', places: 0, tol: 0,
        hints: ['Round the formula answer up, not to the nearest year.', 'After 9 years the balance is 7,500 × 1.05⁹ ≈ $11,634.96.'],
        wrong: [{ value: 9, say: 'After nine years the balance is only $11,634.96. Round up: the target needs part of a tenth year, and the tenth year’s interest arrives at its end.' }] },
    ],
  },
  {
    id: 'f04-sci-g4', type: 'num', kind: 'numerical',
    prompt: 'At 5% a year compounded annually, exactly how many years does money take to double? Give two decimal places, then compare with the rule of 72.',
    answer: 14.21, check: () => Math.log(2) / Math.log(1.05), unit: 'years', places: 2, tol: 0.02,
    hints: ['Doubling time = ln 2 ÷ ln(1 + r).', '0.693147 ÷ ln 1.05, where ln 1.05 ≈ 0.048790.'],
    wrong: [
      { value: 14.4, say: 'That is the rule of 72 (72 ÷ 5). Close, but the question asks for the exact figure.' },
      { value: 20, say: 'That is how long simple interest takes to double money (100% ÷ 5%). Compounding is faster.' },
    ],
    solution: 'n = ln 2 ÷ ln 1.05 = 0.693147 ÷ 0.048790 ≈ 14.21 years. The rule of 72 gives 72 ÷ 5 = 14.4 years, about 0.19 years too long, as expected at a rate below 7.85%.',
  },
];

export const independent = [
  {
    id: 'f04-sci-i1', type: 'num', kind: 'numerical',
    prompt: 'You invest $12,500 at 5.5% a year compounded annually for eight years. What is the balance at the end, to the nearest cent?',
    answer: 19183.58, check: () => 12500 * 1.055 ** 8, unit: '$', places: 2, tol: 0.75,
    wrong: [
      { value: 18000, say: 'That is simple interest (12,500 + 8 × 687.50). The interest stays in and compounds.' },
      { value: 6683.58, say: 'That is the interest alone. The question asks for the balance.' },
    ],
    solution: 'Growth factor 1.055⁸ ≈ 1.534687. Balance = 12,500 × 1.534687 ≈ $19,183.58, of which $6,683.58 is interest.',
  },
  {
    id: 'f04-sci-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional company borrows $25,000 at 8% a year, simple interest, from 15 June to 20 October 2027 (127 calendar days). How much interest does it owe on an actual/365 basis, to the nearest cent?',
    answer: 695.89, check: () => 25000 * 0.08 * days('2027-06-15', '2027-10-20') / 365, unit: '$', places: 2, tol: 0.1,
    wrong: [
      { value: 694.44, say: 'That is the 30/360 answer (125 days over 360). Use the 127 calendar days over 365.' },
      { value: 705.56, say: 'That divides by 360. Actual/365 divides by 365.' },
      { value: 2000, say: 'That is a full year’s interest. Multiply by 127 ÷ 365.' },
    ],
    solution: 'I = 25,000 × 0.08 × 127 ÷ 365 ≈ $695.89. On 30/360 the count would be 30 × 4 + (20 − 15) = 125 days, giving $694.44; on actual/360, $705.56.',
  },
  {
    id: 'f04-sci-i3', type: 'mc', kind: 'conceptual',
    prompt: 'You deposit $5,000 for six months in an account quoted at 8% a year. Which pays more for the six months: 8% simple interest, or 8% compounded annually with the growth formula applied to half a year?',
    options: [
      'Simple interest, by about $3.85',
      'Compound interest, by about $3.85',
      'They pay exactly the same',
      'It depends on the size of the deposit',
    ],
    answer: 0,
    feedback: {
      1: 'Right gap, wrong direction. Compounding pays more only after the first full period. For half a period, 1.08^0.5 ≈ 1.039230 is less than 1 + 0.08 × 0.5 = 1.04.',
      2: 'They agree at exactly one period, not at half a period.',
      3: 'Both results are a fixed percentage of the deposit, so which pays more is the same for any amount.',
    },
    solution: 'Simple: 5,000 × 0.08 × 0.5 = $200.00. Compound formula: 5,000 × (1.08^0.5 − 1) ≈ $196.15. Simple interest pays about $3.85 more. Within one period the compound curve lies below the simple-interest line; the two cross at exactly one period.',
  },
  {
    id: 'f04-sci-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional painting bought for $40,000 in June 2015 was sold for $65,000 in June 2026. What compound annual growth rate did its owner earn, before costs? Give a percentage to two decimal places.',
    answer: 4.51, check: () => ((65000 / 40000) ** (1 / 11) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 5.68, say: 'That is the total growth (62.5%) divided by 11 years: simple arithmetic. Take the 11th root of 1.625.' },
      { value: 62.5, say: 'That is the total growth over the whole period, not the rate per year.' },
      { value: 4.97, say: 'That uses 10 years. From June 2015 to June 2026 is 11 years.' },
    ],
    solution: 'Ratio 65,000 ÷ 40,000 = 1.625. CAGR = 1.625^(1/11) − 1 ≈ 1.045126 − 1 ≈ 4.51% a year. Buying and selling costs, which the question leaves out, would lower it.',
  },
  {
    id: 'f04-sci-i5', type: 'num', kind: 'numerical',
    prompt: 'How many years does $2,000 take to grow to $3,500 at 3.8% a year compounded annually, by the formula? Give two decimal places.',
    answer: 15.00, check: () => Math.log(3500 / 2000) / Math.log(1.038), unit: 'years', places: 2, tol: 0.02,
    wrong: [
      { value: 19.74, say: 'That is 75% growth ÷ 3.8% a year: simple interest. Use n = ln(FV ÷ PV) ÷ ln(1 + r).' },
      { value: 18.95, say: 'That is the rule-of-72 doubling time at 3.8%. The target is 1.75 times the start, not double.' },
    ],
    solution: 'n = ln(3,500 ÷ 2,000) ÷ ln 1.038 = ln 1.75 ÷ ln 1.038 = 0.559616 ÷ 0.037296 ≈ 15.00 years.',
  },
  {
    id: 'f04-sci-i6', type: 'classify', kind: 'conceptual',
    prompt: 'Is each arrangement better described by simple interest or by compound interest?',
    items: [
      'Lantern’s Coastline note: $150 of interest paid to the bank every quarter, principal repaid at the end',
      'A savings account that adds interest to the balance every month',
      'Interest that builds up on a 60-day supplier invoice, charged on the invoice amount for the days it is late',
      'An unpaid credit-card balance, with each month’s interest added to what is owed',
      'A fund whose income is reinvested every year',
    ],
    categories: ['Simple interest', 'Compound interest'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      0: 'The interest is paid out as it falls due, so it never earns interest: simple.',
      1: 'Interest added to the balance earns interest next month: compound.',
      2: 'Interest charged on the invoice amount only, for part of a year: simple.',
      3: 'Unpaid interest joins the balance and is charged interest itself: compound.',
      4: 'Reinvested income earns its own return: compound.',
    },
    solution: 'Simple where interest is paid out or charged on the original amount only (the note, the late invoice); compound where interest stays in the balance (the savings account, the card balance, the reinvesting fund).',
  },
];

export const check = [
  {
    id: 'f04-sci-k1', type: 'num', kind: 'numerical',
    prompt: 'What does $4,000 grow to in 3.5 years at 5% a year, using the compound growth formula with a fractional number of periods? Give the answer to the nearest cent.',
    answer: 4744.85, check: () => 4000 * 1.05 ** 3.5, unit: '$', places: 2, tol: 0.25,
    wrong: [
      { value: 4700, say: 'That is simple interest (4,000 × (1 + 0.05 × 3.5)). Use 4,000 × 1.05^3.5.' },
      { value: 4630.5, say: 'That is three years only. Use the exponent 3.5.' },
      { value: 4746.26, say: 'That is three years compounded plus half a year of simple interest, what an account paying simple interest for a part-year would give. The question asks for the formula with n = 3.5.' },
    ],
    solution: '1.05^3.5 ≈ 1.186213, so FV = 4,000 × 1.186213 ≈ $4,744.85. An account that compounds annually and pays simple interest for the last half-year would pay 4,000 × 1.05³ × 1.025 ≈ $4,746.26.',
  },
  {
    id: 'f04-sci-k2', type: 'num', kind: 'numerical',
    prompt: 'How many years does $3,000 take to grow to $5,000 at 4% a year compounded annually, by the formula? Give two decimal places.',
    answer: 13.02, check: () => Math.log(5000 / 3000) / Math.log(1.04), unit: 'years', places: 2, tol: 0.05,
    wrong: [
      { value: 16.67, say: 'That is 66.7% growth ÷ 4% a year: simple interest. Use logarithms.' },
      { value: 18, say: 'That is the rule-of-72 doubling time at 4%. The target is 5/3 of the start, not double.' },
    ],
    solution: 'n = ln(5,000 ÷ 3,000) ÷ ln 1.04 = 0.510826 ÷ 0.039221 ≈ 13.02 years.',
  },
  {
    id: 'f04-sci-k3', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about the rule of 72 is correct?',
    options: [
      'It overstates the doubling time at low rates and understates it at high rates; it is exact near 7.85%',
      'It is exact at every rate, because 72 divided by the percentage rate is the compound interest formula solved for the doubling time',
      'It understates the doubling time at low rates and overstates it at high rates',
      'It gives the doubling time under simple interest',
    ],
    answer: 0,
    feedback: {
      1: 'It is an approximation. At 1% it gives 72 years against an exact 69.66.',
      2: 'The other way round: at 1% it says 72 against an exact 69.66 (too long); at 24% it says 3 against 3.22 (too short).',
      3: 'Under simple interest money doubles in 100 ÷ rate periods, not 72 ÷ rate.',
    },
    solution: 'The exact doubling time is ln 2 ÷ ln(1 + r). The rule of 72 matches it at about 7.85%, gives too long a time below that rate and too short a time above it.',
  },
  {
    id: 'f04-sci-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional university treasurer can place $250,000 for 91 days at 5.00% on an actual/360 basis or at 5.05% on an actual/365 basis, both simple interest. Which earns more, and by about how much?',
    options: [
      'The 5.00% actual/360 deposit, by about $12.12',
      'The 5.05% actual/365 deposit, because its quoted rate is higher',
      'They earn exactly the same',
      'The 5.05% actual/365 deposit, by about $12.12',
    ],
    answer: 0,
    feedback: {
      1: 'Quoted rates on different day-count bases cannot be compared directly. 5.00% on actual/360 is equivalent to about 5.07% on actual/365.',
      2: 'Work out both: $3,159.72 against $3,147.60.',
      3: 'Right size of gap, wrong deposit: dividing by 360 gives the 5.00% deposit more interest.',
    },
    solution: 'Actual/360: 250,000 × 0.05 × 91 ÷ 360 ≈ $3,159.72. Actual/365: 250,000 × 0.0505 × 91 ÷ 365 ≈ $3,147.60. The lower quoted rate earns about $12.12 more, because 5.00% × 365 ÷ 360 ≈ 5.07% on an actual/365 basis.',
  },
  {
    id: 'f04-sci-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional vineyard can buy a plot of land for $400,000 that it expects to sell for $520,000 in four years. Its other uses for the money earn 6% a year. What annual compound return does the land offer? Give a percentage to two decimal places.',
    answer: 6.78, check: () => ((520000 / 400000) ** (1 / 4) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 7.5, say: 'That is the 30% total gain divided by four years: simple arithmetic. Take the fourth root of 1.3.' },
      { value: 30, say: 'That is the total gain over four years, not the rate per year.' },
    ],
    solution: 'r = (520,000 ÷ 400,000)^(1/4) − 1 = 1.3^0.25 − 1 ≈ 6.78% a year, above the 6% the money earns elsewhere. Equivalently, $400,000 at 6% grows to only about $504,990.78 in four years. The land wins on these figures, but its sale price is a forecast and carries risk that the 6% alternative may not.',
  },
  {
    id: 'f04-sci-k6', type: 'mc', kind: 'conceptual',
    prompt: 'You need to solve 1.06ⁿ = 1.5 for n. Which step is valid?',
    options: [
      'Take logarithms of both sides: n × ln 1.06 = ln 1.5, so n = ln 1.5 ÷ ln 1.06',
      'Divide both sides by 1.06: n = 1.5 ÷ 1.06',
      'Take the nth root of 1.5: n = 1.5^(1/1.06)',
      'Subtract 1 from both sides: n × 0.06 = 0.5, so n = 0.5 ÷ 0.06',
    ],
    answer: 0,
    feedback: {
      1: 'n is an exponent, not a multiplier, so dividing by 1.06 does not isolate it.',
      2: 'A root undoes a known power to find the base. Here the base is known and the power is unknown: use logarithms.',
      3: 'That treats the growth as simple interest (8.33 years). The true answer, 6.96 years, is shorter.',
    },
    solution: 'The logarithm of a power is the power times the logarithm: ln(1.06ⁿ) = n × ln 1.06. So n = ln 1.5 ÷ ln 1.06 ≈ 0.405465 ÷ 0.058269 ≈ 6.96.',
  },
];
