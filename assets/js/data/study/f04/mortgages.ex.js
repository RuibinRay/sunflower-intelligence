// mortgages.ex.js — F04 · Mortgages: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). All borrowers, loans and rates here are fictional;
// none uses ANA_PLAN (Ana's own home, loan, rates or points), which belong to the F04 project.

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const pmt = (pv, r, n) => (r === 0 ? pv / n : pv * r / (1 - (1 + r) ** -n));
const bal = (pv, r, n, k) => (k >= n ? 0 : pmt(pv, r, n) * (r === 0 ? n - k : (1 - (1 + r) ** -(n - k)) / r));
const ym = (m) => `${Math.floor(m / 12)} years${m % 12 ? ` ${m % 12} month${m % 12 === 1 ? '' : 's'}` : ''}`;

/** Run a schedule with a fixed payment; returns months, total interest and the balance at the end of each year. */
function schedule(pv, r, pay, maxMonths = 600) {
  let b = pv, m = 0, I = 0; const yearEnd = [pv];
  while (b > 1e-9 && m < maxMonths) {
    const it = b * r; I += it; b = b + it - Math.min(pay, b + it); m++;
    if (m % 12 === 0) yearEnd.push(Math.max(b, 0));
  }
  if (m % 12 !== 0) yearEnd.push(0);
  return { m, I, yearEnd };
}

export const widgets = {
  mortgage: {
    type: 'formula',
    title: 'Fixed-rate mortgage explorer',
    intro: 'Principal and interest only; taxes, insurance and escrow are extra. Defaults: Jonah’s 30-year loan.',
    inputs: [
      { id: 'pv', label: 'Amount borrowed', min: 50000, max: 1000000, step: 5000, value: 288000, fmt: 'money' },
      { id: 'rate', label: 'Interest rate (annual, paid monthly)', min: 1, max: 12, step: 0.125, value: 6.5, fmt: 'pct' },
      { id: 'years', label: 'Term', min: 5, max: 30, step: 5, value: 30, fmt: 'int', unit: 'years' },
      { id: 'extra', label: 'Extra payment each month', min: 0, max: 2000, step: 50, value: 0, fmt: 'money' },
      { id: 'inf', label: 'Inflation (for the real value of the payment)', min: 0, max: 8, step: 0.1, value: 3, fmt: 'pct' },
    ],
    compute: (v) => {
      const r = v.rate / 1200, n = v.years * 12;
      const C = pmt(v.pv, r, n);
      const base = schedule(v.pv, r, C);
      const fast = schedule(v.pv, r, C + v.extra);
      const yrs = Array.from({ length: v.years + 1 }, (_, k) => k);
      const at = (s, y) => (y < s.yearEnd.length ? s.yearEnd[y] : 0);
      const bal5 = at(fast, Math.min(5, v.years));
      const realLast = C / (1 + v.inf / 100) ** v.years;
      const saved = base.I - fast.I;
      const rows = [
        ['Total interest over the full term', money(base.I)],
        ['Months to repay with the extra payment', v.extra > 0 ? `${fast.m} (${ym(fast.m)})` : `${n} (no extra payment)`],
        ['Interest saved by the extra payment', money(saved)],
        [`Balance after ${Math.min(5, v.years)} years${v.extra > 0 ? ' (with the extra payment)' : ''}`, money(bal5)],
        [`Final scheduled payment in today’s dollars at ${pct(v.inf, 1)} inflation`, money(realLast)],
      ];
      const note = v.extra > 0
        ? `Paying ${money(v.extra)} more each month clears the loan in ${ym(fast.m)} instead of ${v.years} years and saves ${money(saved)} of interest: ${pct(saved / base.I * 100, 1)} of the total.`
        : `Over ${v.years} years you would pay ${money(base.I)} of interest, ${pct(base.I / v.pv * 100, 0)} of the amount borrowed. Try an extra payment, or a shorter term, and compare the interest.`;
      return {
        headline: { label: 'Monthly payment (principal and interest)', value: money(C) },
        rows,
        note: `${note} The fixed payment of ${money(C)} would be worth about ${money(realLast)} of today’s purchasing power by the last year.`,
        chart: { kind: 'line', x: { label: 'Year', values: yrs },
          series: [{ name: 'Balance on schedule', values: yrs.map((y) => r2(at(base, y))) }, { name: 'Balance with the extra payment', values: yrs.map((y) => r2(at(fast, y))) }],
          y: { label: 'Balance owed ($)', format: 'money' } },
      };
    },
  },
  points: {
    type: 'formula',
    title: 'Are the points worth it?',
    intro: 'A 30-year fixed loan with and without discount points. The present-value test values every cash flow of the points loan at the no-points rate, including repaying the balance when you sell or refinance. Defaults: Jonah’s offer.',
    inputs: [
      { id: 'pv', label: 'Amount borrowed', min: 50000, max: 1000000, step: 5000, value: 288000, fmt: 'money' },
      { id: 'rate', label: 'Rate with no points', min: 2, max: 12, step: 0.125, value: 6.5, fmt: 'pct' },
      { id: 'pts', label: 'Points bought', min: 0, max: 4, step: 0.125, value: 1.5, fmt: 'num', unit: 'points' },
      { id: 'cut', label: 'Rate cut per point', min: 0, max: 0.5, step: 0.025, value: 0.25, fmt: 'num', unit: 'percentage points' },
      { id: 'hold', label: 'Years you keep the loan', min: 1, max: 30, step: 1, value: 7, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const r0 = v.rate / 1200, newRate = v.rate - v.pts * v.cut, r1 = newRate / 1200;
      const cost = v.pts / 100 * v.pv;
      const C0 = pmt(v.pv, r0, 360), C1 = pmt(v.pv, r1, 360);
      const save = C0 - C1;
      const netPV = (k) => v.pv - (cost + C1 * (1 - (1 + r0) ** -k) / r0 + bal(v.pv, r1, 360, k) * (1 + r0) ** -k);
      const yrs = Array.from({ length: 30 }, (_, k) => k + 1);
      if (v.pts === 0 || v.cut === 0) {
        return {
          headline: { label: 'Present-value gain from points', value: money(v.pts === 0 ? 0 : -cost) },
          rows: [['Cost of points', money(cost)], ['Monthly payment', money(C0)]],
          note: v.pts === 0 ? 'No points bought: nothing to recover. Add points to see the trade-off.' : 'Points that do not lower the rate are pure cost. Set a rate cut per point.',
          chart: { kind: 'bar', x: { label: 'Years kept', values: yrs }, series: [{ name: 'Present-value gain from points', values: yrs.map(() => r2(v.pts === 0 ? 0 : -cost)) }], y: { label: '$', format: 'money' } },
        };
      }
      let be = 0; for (let k = 1; k <= 360; k++) if (netPV(k) >= 0) { be = k; break; }
      const gain = netPV(v.hold * 12);
      return {
        headline: { label: `Present-value gain from points if kept ${v.hold} year${v.hold === 1 ? '' : 's'}`, value: money(gain) },
        rows: [
          ['Cost of points', money(cost)],
          ['Rate with points', pct(newRate, 3)],
          ['Monthly payment without / with points', `${money(C0)} / ${money(C1)}`],
          ['Monthly saving', money(save)],
          ['Simple break-even (cost ÷ saving)', `${(cost / save).toFixed(1)} months`],
          ['Present-value break-even', be ? `${be} months (${ym(be)})` : 'never within 30 years'],
        ],
        note: gain >= 0
          ? `Kept ${v.hold} years, the points save ${money(gain)} in today’s money (valued at ${pct(v.rate, 3)}). They pay off for any holding period beyond about ${ym(be)}.`
          : `Kept only ${v.hold} year${v.hold === 1 ? '' : 's'}, the points cost ${money(-gain)} more than they save in today’s money. ${be ? `You would need to keep the loan about ${ym(be)}.` : 'At these numbers they never pay off.'}`,
        chart: { kind: 'bar', x: { label: 'Years kept', values: yrs },
          series: [{ name: 'Present-value gain from points', values: yrs.map((y) => r2(netPV(y * 12))) }],
          y: { label: '$', format: 'money' } },
      };
    },
  },
  'payment-split': (() => {
    const L = 288000, r = 0.065 / 12, C = pmt(L, r, 360);
    let b = L; const interest = [], principal = [];
    for (let y = 1; y <= 30; y++) { let I = 0, P = 0; for (let m = 0; m < 12; m++) { const it = b * r; I += it; P += C - it; b -= C - it; } interest.push(Math.round(I)); principal.push(Math.round(P)); }
    return {
      type: 'chart', kind: 'bar',
      title: 'Where Jonah’s payments go each year ($288,000 at 6.5% over 30 years)',
      x: { label: 'Year', values: Array.from({ length: 30 }, (_, k) => k + 1) },
      series: [{ name: 'Interest', values: interest }, { name: 'Principal', values: principal }],
      y: { label: 'Paid during the year ($)', format: 'money' },
      note: 'Each year’s twelve payments total about $21,844. In year 1 about $18,625 is interest and $3,219 principal; principal first exceeds interest in year 20; in year 30 only about $750 is interest.',
    };
  })(),
};

export const guided = [
  {
    id: 'f04-mort-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional nurse borrows $210,000 for 30 years at a fixed 6.25% a year, repaid monthly.',
    solution: 'r = 0.0625 ÷ 12 ≈ 0.00520833; n = 360. C = 210,000 × 0.00520833 ÷ (1 − 1.00520833⁻³⁶⁰) ≈ $1,293.01. First-month interest = 210,000 × 0.00520833 = $1,093.75. Total interest = 360 × 1,293.0061 − 210,000 ≈ $255,482.20.',
    steps: [
      { id: 'f04-mort-g1-s1', type: 'num', prompt: 'Monthly payment of principal and interest, to the nearest cent.',
        answer: 1293.01, check: () => 210000 * (0.0625 / 12) / (1 - (1 + 0.0625 / 12) ** -360), unit: '$', places: 2, tol: 0.5,
        hints: ['Use the monthly rate (6.25% ÷ 12) and the number of months (360).', 'C = 210,000 × 0.00520833 ÷ (1 − 1.00520833⁻³⁶⁰); 1.00520833⁻³⁶⁰ ≈ 0.154103.'],
        wrong: [
          { value: 1305.55, say: 'That is the annual payment at 6.25% over 30 years divided by 12. Payments are monthly, so interest is charged monthly: use the monthly rate and 360 months.' },
          { value: 13125, say: 'You used the annual rate with 360 periods. Divide the rate by 12.' },
        ] },
      { id: 'f04-mort-g1-s2', type: 'num', prompt: 'How much of the first payment is interest?',
        answer: 1093.75, check: () => 210000 * 0.0625 / 12, unit: '$', places: 2, tol: 0.01,
        hints: ['Interest = balance × monthly rate.', '210,000 × 0.0625 ÷ 12.'] },
      { id: 'f04-mort-g1-s3', type: 'num', prompt: 'Total interest over the 30 years, to the nearest dollar.',
        answer: 255482.2, check: () => { const C = 210000 * (0.0625 / 12) / (1 - (1 + 0.0625 / 12) ** -360); return C * 360 - 210000; }, unit: '$', places: 0, tol: 20,
        hints: ['Total paid is 360 payments; subtract what was borrowed.', '360 × 1,293.01 − 210,000.'],
        wrong: [{ value: 465482.2, say: 'That is the total paid. Interest is the total paid minus the $210,000 borrowed.' }] },
    ],
  },
  {
    id: 'f04-mort-g2', type: 'num', kind: 'numerical',
    prompt: 'On the nurse’s loan in the previous question ($210,000, 30 years, 6.25%, payment about $1,293.01), how much does she still owe after ten years (120 payments)? Give the answer to the nearest dollar.',
    answer: 176899.2, check: () => { const r = 0.0625 / 12, C = 210000 * r / (1 - (1 + r) ** -360); return C * (1 - (1 + r) ** -240) / r; }, unit: '$', places: 0, tol: 25,
    hints: ['The balance is the present value of the payments still to come.', 'B = 1,293.01 × (1 − 1.00520833⁻²⁴⁰) ÷ 0.00520833.'],
    wrong: [{ value: 54839.27, say: 'Subtracting 120 payments from the loan ignores the interest those payments covered. Most of each early payment is interest: value the 240 remaining payments instead.' }],
    solution: 'Prospective method: B₁₂₀ = 1,293.01 × (1 − 1.00520833⁻²⁴⁰) ÷ 0.00520833 ≈ $176,899. After a third of the term she has repaid only about $33,100, less than a sixth of the loan.',
  },
  {
    id: 'f04-mort-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional buyer borrowing $200,000 over 30 years is offered 6.75% with no points, or 6.25% for 2 points.',
    solution: 'Points cost 2 × 1% × 200,000 = $4,000. Payments: $1,297.20 at 6.75% and $1,231.43 at 6.25%, a saving of about $65.76 a month. Simple break-even = 4,000 ÷ 65.76 ≈ 60.8 months, about five years.',
    steps: [
      { id: 'f04-mort-g3-s1', type: 'num', prompt: 'What do the points cost?',
        answer: 4000, check: () => 2 * 0.01 * 200000, unit: '$', places: 0, tol: 0.5,
        hints: ['One point costs 1% of the loan amount.'],
        wrong: [{ value: 1000, say: 'Points are a percentage of the loan, not of the rate cut. Two points cost 2% of $200,000.' }] },
      { id: 'f04-mort-g3-s2', type: 'num', prompt: 'By how much do the points lower the monthly payment?',
        answer: 65.76, check: () => { const p = (r) => 200000 * r / (1 - (1 + r) ** -360); return p(0.0675 / 12) - p(0.0625 / 12); }, unit: '$', places: 2, tol: 0.1,
        hints: ['Find both payments with the payment formula, 360 months each.', '$1,297.20 at 6.75% and $1,231.43 at 6.25%.'] },
      { id: 'f04-mort-g3-s3', type: 'num', prompt: 'Simple break-even time, in months (one decimal place).',
        answer: 60.8, check: () => { const p = (r) => 200000 * r / (1 - (1 + r) ** -360); return 4000 / (p(0.0675 / 12) - p(0.0625 / 12)); }, unit: 'months', places: 1, tol: 0.2,
        hints: ['Cost ÷ monthly saving.'],
        wrong: [{ value: 5.07, say: 'That is the break-even in years. The question asks for months.' }] },
    ],
  },
  {
    id: 'f04-mort-g4', type: 'num', kind: 'numerical',
    prompt: 'A fictional borrower owes $150,000 on a new 30-year loan at 7% a year (payment about $997.95 a month) and decides to pay $100 more every month. Using the logarithm formula, how many months will it take to repay the loan? Give n to one decimal place.',
    answer: 274.1, check: () => { const r = 0.07 / 12, C = 150000 * r / (1 - (1 + r) ** -360) + 100; return -Math.log(1 - r * 150000 / C) / Math.log(1 + r); }, unit: 'months', places: 1, tol: 0.15,
    hints: ['n = −ln(1 − r × PV ÷ C) ÷ ln(1 + r), with C including the extra $100.', 'r × PV = 875; C = 1,097.95; 1 − 875 ÷ 1,097.95 ≈ 0.203063.'],
    wrong: [
      { value: 360, say: 'That is the original term. The extra $100 goes straight to principal and shortens the loan.' },
      { value: 22.8, say: 'That is the answer in years. Give the number of months.' },
    ],
    solution: 'C = 997.95 + 100 = $1,097.95; r × PV = 0.0058333 × 150,000 = $875. n = −ln(1 − 875 ÷ 1,097.95) ÷ ln(1.0058333) = −ln(0.203063) ÷ 0.0058164 ≈ 274.1 months. She makes 274 full payments and a smaller 275th, finishing in about 22 years 11 months and saving about $58,320 of interest.',
  },
];

export const independent = [
  {
    id: 'f04-mort-i1', type: 'classify', kind: 'conceptual',
    prompt: 'A homebuyer’s first-year housing costs include the items below. Where does each belong?',
    items: [
      'Interest on the loan balance',
      'Repayment of the amount borrowed',
      'Property taxes',
      'Homeowners insurance premiums',
      'Discount points',
    ],
    categories: ['The principal-and-interest payment', 'Often collected each month through escrow', 'Paid once, at closing'],
    answer: [0, 0, 1, 1, 2],
    feedback: {
      2: 'Taxes are not part of the loan. Many lenders collect them monthly through an escrow account and pay them when due.',
      3: 'Insurance premiums are often paid from escrow too, and can change from year to year.',
      4: 'Points are an upfront fee at closing, in exchange for a lower rate.',
    },
    solution: 'The payment formula gives principal and interest only. Taxes and insurance are often collected through escrow and change over time. Points are paid once, at closing.',
  },
  {
    id: 'f04-mort-i2', type: 'num', kind: 'numerical',
    prompt: 'What is the monthly principal-and-interest payment on a fictional $180,000 loan over 15 years at 5.5% a year? Give dollars and cents.',
    answer: 1470.75, check: () => { const r = 0.055 / 12; return 180000 * r / (1 - (1 + r) ** -180); }, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 1000, say: 'That is the principal alone (180,000 ÷ 180). Interest is charged on the balance each month as well.' },
      { value: 1825, say: 'That adds simple interest for 15 years to the principal and divides by 180. Interest is charged on the falling balance, not the original loan.' },
    ],
    solution: 'r = 0.055 ÷ 12 ≈ 0.00458333; n = 180. C = 180,000 × 0.00458333 ÷ (1 − 1.00458333⁻¹⁸⁰) ≈ $1,470.75.',
  },
  {
    id: 'f04-mort-i3', type: 'num', kind: 'numerical',
    prompt: 'For a fictional $180,000 loan, compare 30 years at 6.25% with 15 years at 5.5%. How much more total interest does the 30-year loan cost? Give the answer to the nearest dollar.',
    answer: 134249.71, check: () => { const p = (r, n) => 180000 * r / (1 - (1 + r) ** -n); return (p(0.0625 / 12, 360) * 360 - 180000) - (p(0.055 / 12, 180) * 180 - 180000); }, unit: '$', places: 0, tol: 20,
    wrong: [{ value: 218984.75, say: 'That is the 30-year loan’s total interest. Subtract the 15-year loan’s interest.' }],
    solution: 'Payments: $1,108.29 (30 years) and $1,470.75 (15 years). Interest: 360 × 1,108.29 − 180,000 ≈ $218,984.75; 180 × 1,470.75 − 180,000 ≈ $84,735.04. Difference ≈ $134,249.71, for a payment $362.46 a month lower.',
  },
  {
    id: 'f04-mort-i4', type: 'num', kind: 'applied',
    prompt: 'A fictional ARM started at 4.5% and has reached its first reset with $230,000 owed and 300 months left. The index is 3.9% and the margin 2.75 percentage points; the first-reset cap is 2 percentage points. What is the new monthly payment? Give dollars and cents.',
    answer: 1552.98, check: () => { const r = 0.065 / 12; return 230000 * r / (1 - (1 + r) ** -300); }, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 1574.6, say: 'That uses the fully indexed rate of 6.65%. The cap limits the first reset to 4.5% + 2 = 6.5%.' },
      { value: 1453.76, say: 'That spreads the balance over 360 months. Only 300 months remain.' },
      { value: 1278.41, say: 'That is the payment at the old 4.5% rate. The rate resets upward.' },
    ],
    solution: 'Fully indexed rate = 3.9% + 2.75% = 6.65%, but the cap allows at most 4.5% + 2% = 6.5%. New payment = 230,000 × (0.065 ÷ 12) ÷ (1 − (1 + 0.065 ÷ 12)⁻³⁰⁰) ≈ $1,552.98.',
  },
  {
    id: 'f04-mort-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Why is the APR on a US mortgage Loan Estimate usually higher than the loan’s interest rate?',
    options: [
      'Because it also reflects points, mortgage broker fees and other charges paid to get the loan',
      'Because it includes the property taxes and homeowners insurance paid each month along with the mortgage',
      'Because it is the effective annual rate of the interest rate, including the effect of monthly compounding',
      'Because it shows the highest rate the loan could ever reach if it is an adjustable-rate mortgage',
    ],
    answer: 0,
    feedback: {
      1: 'Taxes and insurance are costs of owning the home, not charges for the loan; they are not part of the APR.',
      2: 'A tempting idea from F00, but the disclosed mortgage APR is a nominal annual rate; the difference comes from finance charges such as points and fees.',
      3: 'The CFPB warns that for an adjustable-rate loan the APR does not reflect the maximum rate.',
    },
    solution: 'The CFPB explains that the mortgage APR reflects the interest rate plus points, mortgage broker fees and other charges paid to get the loan, so it is usually higher than the interest rate. It spreads those charges over the full term.',
  },
  {
    id: 'f04-mort-i6', type: 'num', kind: 'numerical',
    prompt: 'A fixed mortgage payment of $1,600 a month will still be due in 15 years. At 2.5% inflation a year, what will that payment be worth in today’s dollars? Give dollars and cents.',
    answer: 1104.74, check: () => 1600 / 1.025 ** 15, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 2317.28, say: 'That is what a payment rising with inflation would be in 15 years. A fixed payment loses value: divide by 1.025¹⁵.' },
      { value: 1000, say: 'That subtracts 2.5% fifteen times from $1,600 (simple). Inflation compounds: divide by 1.025¹⁵ ≈ 1.448298.' },
    ],
    solution: 'Real value = 1,600 ÷ 1.025¹⁵ = 1,600 ÷ 1.448298 ≈ $1,104.74. The payment does not change, but by then it takes about 31% less of the household’s purchasing power.',
  },
];

export const check = [
  {
    id: 'f04-mort-k1', type: 'mc', kind: 'conceptual',
    prompt: 'On a new 30-year fixed-rate mortgage, why does most of each early payment go to interest?',
    options: [
      'Interest is charged on the balance, which is largest at the start',
      'Lenders collect most of the interest first, as a fee for arranging the loan',
      'The interest rate on a fixed-rate mortgage is higher in the early years',
      'The principal part of the payment is fixed, so the interest part takes up the rest',
    ],
    answer: 0,
    feedback: {
      1: 'No extra fee is hidden in the schedule: each month’s interest is the balance times the monthly rate.',
      2: 'On a fixed-rate mortgage the rate never changes. It is the balance that is large at the start.',
      3: 'It is the other way round: the payment is fixed, the interest part falls and the principal part grows.',
    },
    solution: 'Each month’s interest = opening balance × r. The balance is largest at the start, so interest takes most of the fixed payment; as principal is repaid, the interest part shrinks and the principal part grows.',
  },
  {
    id: 'f04-mort-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional couple borrow $325,000 over 30 years at a fixed 6.75% a year. What is their monthly principal-and-interest payment? Give dollars and cents.',
    answer: 2107.94, check: () => { const r = 0.0675 / 12; return 325000 * r / (1 - (1 + r) ** -360); }, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 2128, say: 'That is the annual payment at 6.75% over 30 years divided by 12. With monthly payments, use the monthly rate and 360 months.' },
      { value: 902.78, say: 'That is the principal alone (325,000 ÷ 360). Add the interest on the balance.' },
    ],
    solution: 'r = 0.0675 ÷ 12 = 0.005625; n = 360. C = 325,000 × 0.005625 ÷ (1 − 1.005625⁻³⁶⁰) ≈ $2,107.94.',
  },
  {
    id: 'f04-mort-k3', type: 'num', kind: 'numerical',
    prompt: 'On the couple’s loan ($325,000, 30 years, 6.75%, payment about $2,107.94), how much will they owe after seven years (84 payments)? Give the answer to the nearest dollar.',
    answer: 295059.29, check: () => { const r = 0.0675 / 12, C = 325000 * r / (1 - (1 + r) ** -360); return C * (1 - (1 + r) ** -276) / r; }, unit: '$', places: 0, tol: 25,
    wrong: [{ value: 147932.72, say: 'Subtracting 84 payments from the loan ignores the interest they covered. Value the 276 payments still to come.' }],
    solution: 'B₈₄ = 2,107.94 × (1 − 1.005625⁻²⁷⁶) ÷ 0.005625 ≈ $295,059. After seven years of payments totalling about $177,067, they have repaid only about $29,941 of principal.',
  },
  {
    id: 'f04-mort-k4', type: 'num', kind: 'applied',
    prompt: 'A fictional buyer borrowing $400,000 over 30 years can pay 1 point to cut the rate from 7.0% to 6.75%. What is the simple break-even time, in months? Give one decimal place.',
    answer: 59.9, check: () => { const p = (r) => 400000 * r / (1 - (1 + r) ** -360); return 4000 / (p(0.07 / 12) - p(0.0675 / 12)); }, unit: 'months', places: 1, tol: 0.2,
    wrong: [
      { value: 14.97, say: 'That uses 0.25% of the loan ($1,000) as the cost, confusing the rate cut with the price. One point costs 1% of the loan: $4,000.' },
      { value: 4.99, say: 'That is the break-even in years. The question asks for months.' },
    ],
    solution: 'Cost = 1% × 400,000 = $4,000. Payments: $2,661.21 at 7.0% and $2,594.39 at 6.75%, a saving of $66.82 a month. Break-even ≈ 4,000 ÷ 66.82 ≈ 59.9 months, just under five years.',
  },
  {
    id: 'f04-mort-k5', type: 'mc', kind: 'applied',
    prompt: 'A fictional buyer borrowing $250,000 over 30 years expects to move after three years. She can pay 2 points ($5,000) to cut her rate from 7.0% to 6.5%, which lowers her payment by about $83.09 a month. What should she do?',
    options: [
      'Decline the points: the simple break-even is about 60 months, and valued at 7% the points loan costs about $1,681 more over a three-year stay',
      'Buy the points, because the APR of the points loan is lower',
      'Buy the points, because $83.09 a month for 30 years is about $29,900, far more than $5,000',
      'It makes no difference, because points only change when the interest is paid',
    ],
    answer: 0,
    feedback: {
      1: 'The APR spreads the points over 30 years. She will keep the loan for three.',
      2: 'She will not make 30 years of payments on this loan. Count only the months she will keep it, and allow for time value.',
      3: 'Points are a real cost paid upfront; they are recovered only through savings over the time the loan is kept.',
    },
    solution: 'Break-even = 5,000 ÷ 83.09 ≈ 60.2 months, well beyond her 36-month stay. Valued at 7%, the points loan’s cash flows over 36 months (points, payments and the balance repaid at sale) are worth about $251,681, against $250,000 for the no-points loan: about $1,681 worse. A no-points loan, or even a lender credit, suits a short stay.',
  },
  {
    id: 'f04-mort-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about adjustable-rate mortgages are correct? Select all that apply.',
    options: [
      'The margin is set in the loan agreement and does not change after closing',
      'At each reset the payment is recalculated from the current balance, the new rate and the months remaining',
      'The new rate is the index plus the margin, subject to the loan’s rate caps',
      'The APR disclosed for an ARM shows the highest rate the loan can reach',
      'The starting rate is guaranteed for the whole term as long as payments are made on time',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The CFPB warns that an ARM’s APR does not reflect its maximum rate. Use the lifetime cap to find the worst case.',
      4: 'The starting rate lasts only for the initial fixed period; then the rate resets.',
    },
    solution: 'Correct: the margin is fixed at closing; each reset recalculates the payment with the payment formula; the new rate is index + margin within the caps. An ARM’s APR does not show its maximum rate, and its starting rate lasts only for the initial period.',
  },
];
