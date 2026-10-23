// annuities.ex.js — F04 · Annuities: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Ana’s home-deposit saving (the F04 project) is deliberately not computed here.

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const a = (n, r) => (r === 0 ? n : (1 - (1 + r) ** -n) / r);
const s = (n, r) => (r === 0 ? n : ((1 + r) ** n - 1) / r);
const ga = (c, r, g, n) => c / (r - g) * (1 - ((1 + g) / (1 + r)) ** n);
const solveRate = (pv, c, n) => {          // monthly rate at which n payments of c are worth pv (needs c × n ≥ pv)
  if (c * n <= pv) return 0;
  let lo = 0, hi = 1;
  while (c * a(n, hi) > pv && hi < 1e6) hi *= 2;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (c * a(n, m) > pv) lo = m; else hi = m; }
  return (lo + hi) / 2;
};

export const widgets = {
  annuity: {
    type: 'formula',
    title: 'Present and future value of an annuity',
    intro: 'Equal payments at equal intervals, valued at one rate. The starting values are the supplier’s plan valued at Coastline Bank’s 7.2%.',
    inputs: [
      { id: 'c', label: 'Payment per period', min: 50, max: 5000, step: 10, value: 1050, fmt: 'money' },
      { id: 'apr', label: 'APR (compounded once per payment period)', min: 0, max: 20, step: 0.1, value: 7.2, fmt: 'pct' },
      { id: 'n', label: 'Number of payments', min: 1, max: 360, step: 1, value: 24, fmt: 'int', unit: 'payments' },
      { id: 'm', label: 'Payments a year (1 = annual, 4 = quarterly, 12 = monthly)', min: 1, max: 12, step: 1, value: 12, fmt: 'int' },
      { id: 'due', label: 'Timing (0 = end of each period, ordinary; 1 = start, annuity due)', min: 0, max: 1, step: 1, value: 0, fmt: 'int' },
    ],
    compute: (v) => {
      const r = v.apr / 100 / v.m;
      const ord = v.c * a(v.n, r);
      const pv = v.due ? ord * (1 + r) : ord;
      const other = v.due ? ord : ord * (1 + r);
      const fv = pv * (1 + r) ** v.n;
      const total = v.c * v.n;
      const ks = Array.from({ length: v.n }, (_, i) => i + 1);
      const years = (v.n - v.due) / v.m;
      let note;
      if (r === 0) note = 'At a 0% rate nothing is lost by waiting: the present value equals the sum of the payments. Raise the rate to see later payments lose value.';
      else {
        const last = v.n - v.due === 0 ? 'The only payment is made today, so it loses nothing to waiting.' : `The last payment, ${years.toFixed(Math.abs(years - Math.round(years)) < 1e-9 ? 0 : 1)} year${years === 1 ? '' : 's'} away, is worth only ${money(v.c * (1 + r) ** -(v.n - v.due))} today.`;
        note = `In total the payments come to ${money(total)}; at ${pct(v.apr, 1)} a year they are worth ${money(pv)} today, so waiting costs ${money(Math.max(0, total - pv))}. ${v.due ? 'Paying at the start of each period adds one period’s interest' : 'Paying at the start of each period instead would add one period’s interest'} (${money(Math.abs(pv - other))}). ${last}`;
      }
      return {
        headline: { label: `Present value (${v.due ? 'annuity due' : 'ordinary annuity'})`, value: money(pv) },
        rows: [
          ['Payments add up to', money(total)],
          ['Cost of waiting (total − present value)', money(Math.max(0, total - pv))],
          ['Future value at the end of the last period', money(fv)],
          ['Rate per period', pct(r * 100, 4)],
          [v.due ? 'Present value if paid at the end of each period' : 'Present value if paid at the start of each period', money(other)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Payment number', values: ks },
          series: [
            { name: 'Payment', values: ks.map(() => r2(v.c)) },
            { name: 'Its value today', values: ks.map((k) => r2(v.c * (1 + r) ** -(k - v.due))) },
          ],
          y: { label: 'Dollars', format: 'money' } },
      };
    },
  },
  'implied-rate': {
    type: 'formula',
    title: 'The rate hidden in an instalment plan',
    intro: 'A cash price, or equal monthly instalments starting a month later. The starting values are the supplier’s plan for Lantern’s brewer.',
    inputs: [
      { id: 'price', label: 'Cash price', min: 1000, max: 50000, step: 500, value: 24000, fmt: 'money' },
      { id: 'c', label: 'Monthly instalment', min: 50, max: 5000, step: 10, value: 1050, fmt: 'money' },
      { id: 'n', label: 'Number of instalments', min: 2, max: 72, step: 1, value: 24, fmt: 'int', unit: 'months' },
      { id: 'cmp', label: 'Rate you could borrow at instead (APR)', min: 0, max: 20, step: 0.1, value: 7.2, fmt: 'pct' },
    ],
    compute: (v) => {
      const total = v.c * v.n;
      if (total < v.price - 1e-9) return { error: `The instalments add up to ${money(total)}, less than the ${money(v.price)} cash price, so the plan is cheaper than cash even before allowing for time. There is no positive interest rate to find: raise the instalment or the number of payments.` };
      const r = solveRate(v.price, v.c, v.n);
      const apr = r * 1200, ear = ((1 + r) ** 12 - 1) * 100;
      const rc = v.cmp / 1200;
      const pvCmp = v.c * a(v.n, rc);
      const xs = Array.from({ length: 21 }, (_, i) => i);
      let note;
      if (r === 0) note = `The instalments add up to exactly the cash price: the plan really is interest-free. At ${pct(v.cmp, 1)} it is worth ${money(pvCmp)} today, ${money(v.price - pvCmp)} less than paying cash.`;
      else if (apr < v.cmp) note = `The plan charges about ${pct(apr)} a year, less than the ${pct(v.cmp, 1)} you could borrow at. At ${pct(v.cmp, 1)} the instalments are worth ${money(pvCmp)} today, ${money(v.price - pvCmp)} less than the cash price: on cost, take the plan.`;
      else if (apr > v.cmp + 1e-9) note = `The plan charges about ${pct(apr)} a year, more than the ${pct(v.cmp, 1)} you could borrow at. At ${pct(v.cmp, 1)} the instalments are worth ${money(pvCmp)} today, ${money(pvCmp - v.price)} more than the cash price: borrowing and paying cash is cheaper.${apr > 20 ? ' The implied rate is beyond the chart: the curve never falls to the cash price within 0–20%.' : ''}`;
      else note = 'The plan charges the same rate as the alternative: it makes no difference which you choose.';
      return {
        headline: { label: 'Implied interest rate (APR)', value: pct(apr) },
        rows: [
          ['Implied rate per month', pct(r * 100, 3)],
          ['Effective annual rate', pct(ear)],
          ['Instalments add up to', money(total)],
          [`Value of the instalments at ${pct(v.cmp, 1)}`, money(pvCmp)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Interest rate (APR, %)', values: xs },
          series: [
            { name: 'Value of the instalments', values: xs.map((x) => r2(v.c * a(v.n, x / 1200))) },
            { name: 'Cash price', values: xs.map(() => v.price) },
          ],
          y: { label: 'Dollars', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f04-ann-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional dental practice leases a scanner for $650 a month for four years. It could borrow at 6.6% a year compounded monthly. Value the lease payments.',
    solution: 'Monthly rate = 6.6% ÷ 12 = 0.55%; n = 48. Ordinary annuity: 650 × (1 − 1.0055^−48) ÷ 0.0055 ≈ $27,355.63. Paid at the start of each month (annuity due): × 1.0055 ≈ $27,506.09. Both are well below the $31,200 the payments add up to.',
    steps: [
      { id: 'f04-ann-g1-s1', type: 'num', prompt: 'What is the monthly interest rate, in percent?',
        answer: 0.55, check: () => 6.6 / 12, unit: '%', places: 2, tol: 0.005,
        hints: ['The APR is compounded monthly, so divide by the number of months in a year.'],
        wrong: [{ value: 6.6, say: 'That is the annual rate. The payments are monthly, so the rate must be monthly too.' }] },
      { id: 'f04-ann-g1-s2', type: 'num', prompt: 'What are the 48 payments worth today if each is paid at the end of the month? Give dollars and cents.',
        answer: 27355.63, check: () => 650 * a(48, 0.0055), unit: '$', places: 2, tol: 4.5,
        hints: ['PV = C × (1 − (1 + r)^−n) ÷ r with C = 650, r = 0.0055, n = 48.', '1.0055^−48 ≈ 0.768529, so the annuity factor is (1 − 0.768529) ÷ 0.0055 ≈ 42.0856.'],
        wrong: [
          { value: 31200, say: 'That is the sum of the payments. Each payment must be discounted to today.' },
          { value: 9390.32, say: 'You used the annual rate (6.6%) with 48 periods. Use the monthly rate, 0.55%.' },
        ] },
      { id: 'f04-ann-g1-s3', type: 'num', prompt: 'The lease actually asks for each payment at the start of the month. What are the payments worth today? Give dollars and cents.',
        answer: 27506.09, check: () => 650 * a(48, 0.0055) * 1.0055, unit: '$', places: 2, tol: 4.5,
        hints: ['Payments at the start of each period form an annuity due.', 'Multiply the ordinary annuity’s value by (1 + r) = 1.0055.'],
        wrong: [{ value: 27206.00, say: 'You divided by 1.0055. Paying earlier makes the stream worth more, so multiply.' }] },
    ],
  },
  {
    id: 'f04-ann-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery puts $1,200 into a savings account at the end of every quarter for five years. The account pays 4% a year compounded quarterly. How much will it hold just after the last deposit? Give dollars and cents.',
    answer: 26422.80, check: () => 1200 * s(20, 0.01), unit: '$', places: 2, tol: 1.5,
    hints: ['Quarterly rate = 4% ÷ 4 = 1%; number of deposits = 5 × 4 = 20.', 'FV = C × ((1 + r)^n − 1) ÷ r = 1,200 × (1.01²⁰ − 1) ÷ 0.01; 1.01²⁰ ≈ 1.220190.'],
    wrong: [
      { value: 24000, say: 'That is just the deposits. The account also pays interest on them.' },
      { value: 35733.69, say: 'You used 4% per quarter. The 4% is a year’s rate: the quarterly rate is 1%.' },
      { value: 6121.21, say: 'You used five periods. There are 20 quarterly deposits in five years.' },
      { value: 26687.03, say: 'That is the annuity-due value. The deposits are made at the end of each quarter, so no extra (1 + r).' },
    ],
    solution: 'r = 1% a quarter, n = 20. FV = 1,200 × (1.01²⁰ − 1) ÷ 0.01 = 1,200 × 22.019004 ≈ $26,422.80. The bakery deposits $24,000 and earns $2,422.80 of interest.',
  },
  {
    id: 'f04-ann-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional student borrows $8,000 at 12% a year compounded monthly and repays $300 at the end of each month. How long will it take?',
    solution: 'r = 1% a month. Interest on $8,000 is $80, below the $300 payment, so the loan can be repaid. n = −ln(1 − 8,000 × 0.01 ÷ 300) ÷ ln 1.01 = −ln(0.733333) ÷ ln 1.01 ≈ 0.310155 ÷ 0.009950 ≈ 31.17 months: 31 full payments and a smaller 32nd payment.',
    steps: [
      { id: 'f04-ann-g3-s1', type: 'num', prompt: 'First check the condition: what is one month’s interest on the $8,000? Give dollars and cents.',
        answer: 80, check: () => 8000 * 0.01, unit: '$', places: 2, tol: 0.01,
        hints: ['Monthly rate = 12% ÷ 12 = 1%.'],
        wrong: [{ value: 960, say: 'That is a year’s interest. Use the monthly rate.' }] },
      { id: 'f04-ann-g3-s2', type: 'num', prompt: 'Use the formula for the number of payments. What is n, to two decimal places?',
        answer: 31.17, check: () => -Math.log(1 - 8000 * 0.01 / 300) / Math.log(1.01), unit: 'months', places: 2, tol: 0.2,
        hints: ['n = −ln(1 − PV × r ÷ C) ÷ ln(1 + r).', '1 − 8,000 × 0.01 ÷ 300 = 1 − 0.266667 = 0.733333; ln(0.733333) ≈ −0.310155; ln(1.01) ≈ 0.009950.'],
        wrong: [{ value: 26.67, say: 'That is 8,000 ÷ 300, which ignores interest. With interest the loan takes longer.' }] },
      { id: 'f04-ann-g3-s3', type: 'num', prompt: 'How many payments does the student make in all (counting a smaller final payment as one)?',
        answer: 32, check: () => Math.ceil(-Math.log(1 - 8000 * 0.01 / 300) / Math.log(1.01)), unit: 'payments', places: 0, tol: 0,
        hints: ['31 full payments leave a little still owing.'],
        wrong: [{ value: 31, say: 'After 31 payments of $300 a small balance is still owed: it takes a 32nd, smaller payment.' }] },
    ],
  },
  {
    id: 'f04-ann-g4', type: 'num', kind: 'applied',
    prompt: 'A fictional grandmother wants to give her grandson $5,000 a year for three years to help with an apprenticeship, the first payment exactly six years from today. Her savings earn 4% a year. How much must she set aside today? Give dollars and cents.',
    answer: 11404.61, check: () => 5000 * a(3, 0.04) / 1.04 ** 5, unit: '$', places: 2, tol: 1.2,
    hints: ['The payments are at years 6, 7 and 8. The annuity formula values them at year 5, one year before the first payment.', 'Value at year 5: 5,000 × (1 − 1.04^−3) ÷ 0.04 ≈ 13,875.46. Discount five years: ÷ 1.04⁵.'],
    wrong: [
      { value: 10965.97, say: 'You discounted six years. The annuity formula already puts the value one year before the first payment, at year 5.' },
      { value: 13875.46, say: 'That is the value at year 5. Discount it to today.' },
      { value: 11854.72, say: 'You discounted the $15,000 total as a single sum at year 6. Value the three payments as an annuity first.' },
    ],
    solution: 'Value at year 5 = 5,000 × 2.775091 ≈ $13,875.46. Today: 13,875.46 ÷ 1.04⁵ = 13,875.46 ÷ 1.216653 ≈ $11,404.61. Check: an 8-payment annuity minus a 5-payment annuity, 5,000 × (6.732745 − 4.451822) ≈ $11,404.61.',
  },
];

export const independent = [
  {
    id: 'f04-ann-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is best valued as an annuity due?',
    options: [
      'Monthly rent paid on the first day of each month for a year',
      'Car-loan repayments, the first due one month after the loan is made',
      'Bond interest paid every six months, the first in six months’ time',
      'A single payment of $10,000 in five years',
    ],
    answer: 0,
    feedback: {
      1: 'Loan repayments usually start one period after the loan: an ordinary annuity.',
      2: 'The first coupon comes at the end of the first six months: an ordinary annuity.',
      3: 'A single payment is not an annuity at all; discount it as a single sum.',
    },
    solution: 'Rent paid in advance falls at the start of each period, so it is an annuity due. Its value is the ordinary-annuity value × (1 + r).',
  },
  {
    id: 'f04-ann-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional franchise agreement pays the brand owner $10,000 at the end of the first year, rising by 4% a year, for eight years. What is the stream worth today at 9% a year? Give dollars and cents.',
    answer: 62632.27, check: () => ga(10000, 0.09, 0.04, 8), unit: '$', places: 2, tol: 10,
    wrong: [
      { value: 55348.19, say: 'That treats the payments as level. They grow by 4% a year: use the growing-annuity formula.' },
      { value: 65137.56, say: 'You grew the first payment before using it. $10,000 is already the first payment (C₁).' },
    ],
    solution: 'PV = C₁ ÷ (r − g) × [1 − ((1 + g) ÷ (1 + r))ⁿ] = 10,000 ÷ 0.05 × [1 − (1.04 ÷ 1.09)⁸] = 200,000 × (1 − 0.686839) ≈ $62,632.27.',
  },
  {
    id: 'f04-ann-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel needs $50,000 in three years to refurbish its lobby. It will deposit an equal amount at the end of each month into an account paying 4.2% a year compounded monthly. How much must each deposit be? Give dollars and cents.',
    answer: 1305.65, check: () => 50000 * 0.0035 / (1.0035 ** 36 - 1), unit: '$', places: 2, tol: 0.4,
    wrong: [
      { value: 1388.89, say: 'That is 50,000 ÷ 36, which ignores the interest the deposits earn.' },
      { value: 15985.86, say: 'That is an annual deposit at 4.2%. The deposits are monthly: use 0.35% and 36 months.' },
    ],
    solution: 'r = 4.2% ÷ 12 = 0.35%; n = 36. C = FV × r ÷ ((1 + r)ⁿ − 1) = 50,000 × 0.0035 ÷ (1.0035³⁶ − 1) = 175 ÷ 0.134031 ≈ $1,305.65. Interest supplies about $2,996.60 of the $50,000.',
  },
  {
    id: 'f04-ann-i4', type: 'num', kind: 'applied',
    prompt: 'A fictional lottery winner can take $480,000 now or $40,000 a year for 20 years, the first payment today. At 6% a year, what are the 20 payments worth today? Give dollars and cents.',
    answer: 486324.66, check: () => 40000 * a(20, 0.06) * 1.06, unit: '$', places: 2, tol: 4.5,
    wrong: [
      { value: 458796.85, say: 'That treats the first payment as a year away. It is paid today: this is an annuity due, so multiply by 1.06.' },
      { value: 800000, say: 'That is the sum of the payments, ignoring the time value of money.' },
    ],
    solution: 'Annuity due: 40,000 × (1 − 1.06^−20) ÷ 0.06 × 1.06 = 40,000 × 11.469921 × 1.06 ≈ $486,324.66. At 6% the payments are worth slightly more than the $480,000 lump sum; at a higher rate the lump sum would win, so the choice depends on what the winner could earn.',
  },
  {
    id: 'f04-ann-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional furniture shop sells a sofa for $1,800 cash, or for 12 monthly payments of $160 starting a month after purchase “with no interest added”. What annual rate (APR, monthly compounding) does the plan really charge? Give a percentage to one decimal place.',
    answer: 12.1, check: () => { let lo = 1e-9, hi = 0.1; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (160 * a(12, m) > 1800) lo = m; else hi = m; } return lo * 1200; }, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 6.7, say: 'That is the extra $120 as a share of $1,800. It ignores that the balance is repaid gradually, so you are charged interest on a shrinking amount: find the rate at which the payments are worth $1,800.' },
      { value: 12.8, say: 'That is the effective annual rate. The question asks for the APR: the monthly rate × 12.' },
      { value: 1, say: 'That is roughly the monthly rate. Multiply by 12 for the APR.' },
    ],
    solution: 'Find r with 160 × (1 − (1 + r)^−12) ÷ r = 1,800, i.e. an annuity factor of 11.25. Trials: at 1% a month the factor is 11.2551 (value $1,800.81, just too high); at 1.01% it is 11.2480 ($1,799.68, just too low). The rate is about 1.007% a month, an APR of about 12.1% (=RATE(12, -160, 1800) × 12). The effective rate is about 12.8%.',
  },
  {
    id: 'f04-ann-i6', type: 'order', kind: 'conceptual',
    prompt: 'Put the steps for valuing a deferred annuity in order.',
    items: [
      'Draw the timeline and mark the date of the first payment',
      'Apply the annuity formula at the rate per payment period, which gives the value one period before the first payment',
      'Discount that single amount back to today',
      'Check by subtracting the annuity of the missing early payments from a longer annuity',
    ],
    solution: 'Timeline first (it shows the deferral and the number of payments), then the annuity formula at the periodic rate, then discount from one period before the first payment to today, then check with the difference of two annuities.',
  },
];

export const check = [
  {
    id: 'f04-ann-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is an annuity due worth more than an ordinary annuity with the same payment, rate and number of payments?',
    options: [
      'Every payment arrives one period sooner, so each is discounted one period less',
      'An annuity due has one more payment',
      'An annuity due uses a higher interest rate',
      'It is not: the two are always worth the same',
    ],
    answer: 0,
    feedback: {
      1: 'Both have n payments; in an annuity due they run from time 0 to n − 1 instead of 1 to n.',
      2: 'The rate is the same; only the timing differs.',
      3: 'They differ by the factor (1 + r) whenever the rate is above zero.',
    },
    solution: 'Moving every payment one period earlier multiplies its present value by (1 + r), so PV(due) = PV(ordinary) × (1 + r).',
  },
  {
    id: 'f04-ann-k2', type: 'num', kind: 'numerical',
    prompt: 'What is the present value of $750 at the end of every quarter for six years, at 8% a year compounded quarterly? Give dollars and cents.',
    answer: 14185.44, check: () => 750 * a(24, 0.02), unit: '$', places: 2, tol: 1.1,
    wrong: [
      { value: 3467.16, say: 'You used the annual rate with six periods. There are 24 quarters, at 2% each.' },
      { value: 18000, say: 'That is the sum of the payments, undiscounted.' },
      { value: 14469.15, say: 'That is the annuity-due value. The payments are at the end of each quarter.' },
    ],
    solution: 'r = 8% ÷ 4 = 2%; n = 6 × 4 = 24. PV = 750 × (1 − 1.02^−24) ÷ 0.02 = 750 × 18.913926 ≈ $14,185.44.',
  },
  {
    id: 'f04-ann-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional $5,000 loan at 15% a year compounded monthly is repaid at $250 at the end of each month. How many months does it take? Give n to two decimal places.',
    answer: 23.16, check: () => -Math.log(1 - 5000 * 0.0125 / 250) / Math.log(1.0125), unit: 'months', places: 2, tol: 0.1,
    wrong: [
      { value: 20, say: 'That is 5,000 ÷ 250, which ignores interest.' },
      { value: 17.96, say: 'You used the savings-target formula, ln(1 + PV × r ÷ C). For a loan it is −ln(1 − PV × r ÷ C).' },
    ],
    solution: 'r = 1.25%. n = −ln(1 − 5,000 × 0.0125 ÷ 250) ÷ ln(1.0125) = −ln(0.75) ÷ ln(1.0125) ≈ 0.287682 ÷ 0.012423 ≈ 23.16: 23 full payments and a small 24th.',
  },
  {
    id: 'f04-ann-k4', type: 'num', kind: 'applied',
    prompt: 'Suppose the supplier asked Lantern for the first of its 24 monthly payments of $1,050 on delivery, not a month later. At Coastline Bank’s 7.2% a year compounded monthly, what would the plan be worth today? Give dollars and cents.',
    answer: 23544.86, check: () => 1050 * a(24, 0.006) * 1.006, unit: '$', places: 2, tol: 9,
    wrong: [
      { value: 23404.43, say: 'That is the plan as offered, with payments at the end of each month. Payments starting on delivery form an annuity due: multiply by 1.006.' },
      { value: 25200, say: 'That is the sum of the payments, undiscounted.' },
      { value: 23264.84, say: 'You divided by 1.006. Paying sooner makes the plan cost more in today’s money, so multiply.' },
    ],
    solution: 'Annuity due: 1,050 × (1 − 1.006^−24) ÷ 0.006 × 1.006 = 23,404.43 × 1.006 ≈ $23,544.86. Still below the $24,000 cash price, so on cost the plan would still beat borrowing at 7.2%, by about $455.14.',
  },
  {
    id: 'f04-ann-k5', type: 'mc', kind: 'applied',
    prompt: 'Two fictional shops sell the same laptop. Shop A: $1,200 cash, or 12 monthly payments of $100 at “0% interest”. Shop B: $1,140 cash, or 12 monthly payments of $100 at “0% interest”. Which statement is correct?',
    options: [
      'Shop A’s plan is genuinely interest-free; Shop B’s plan charges interest, because its payments are worth more than its cash price at 0%',
      'Both plans are interest-free, because both say “0% interest”',
      'Both plans charge the same interest, because the payments are the same',
      'Shop B’s plan is cheaper than Shop A’s cash price, so it is interest-free',
    ],
    answer: 0,
    feedback: {
      1: 'The label does not decide it. Compare the payments with the cash price: at Shop B, a cash buyer pays $60 less.',
      2: 'The implied rate depends on the cash price as well as the payments. At Shop A it is 0%; at Shop B about 9.6% a year.',
      3: 'Comparing with the other shop’s price mixes two questions. Shop B’s plan charges interest relative to Shop B’s own cash price.',
    },
    solution: 'At Shop A, 12 × $100 = $1,200 equals the cash price: 0%. At Shop B, the same payments buy something that costs $1,140 in cash, so the plan charges interest: the rate that makes 12 payments of $100 worth $1,140 is about 0.8% a month, roughly 9.6% a year.',
  },
  {
    id: 'f04-ann-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A student types =RATE(36, 400, 12000) to find the rate on a $12,000 loan repaid at $400 a month for 36 months, and the spreadsheet returns an error. What is wrong?',
    options: [
      'The payment and the loan have the same sign; one must be negative, e.g. =RATE(36, -400, 12000)',
      'RATE needs the annual rate as an input',
      'The number of periods must be entered in years, 3',
      'RATE can only find rates for annuities due, so the type argument must be 1',
    ],
    answer: 0,
    feedback: {
      1: 'The rate is what RATE finds; you do not give it one (an optional guess aside).',
      2: 'The periods must match the payments: 36 monthly payments, giving a monthly rate.',
      3: 'Type is optional and defaults to 0, payments at the end of each period.',
    },
    solution: 'Spreadsheets use a sign convention: money received positive, money paid negative. With both positive no rate can balance the two, so RATE fails. =RATE(36, -400, 12000) returns the monthly rate, about 1.02%; × 12 gives an APR of about 12.2%.',
  },
];
