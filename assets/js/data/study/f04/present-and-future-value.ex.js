// present-and-future-value.ex.js — F04 · Present and future value: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Tolerances on dollar answers allow for discount factors rounded to four decimal places.

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  return `${v < 0 && c !== 0 ? '−' : ''}$${c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const range = (n) => Array.from({ length: n + 1 }, (_, k) => k);
const num = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export const widgets = {
  'pv-explorer': {
    type: 'formula',
    title: 'Present value of a single amount',
    intro: 'Choose an amount, when it arrives, a quoted annual rate and how often it is compounded. The explorer discounts the amount to today and shows how sensitive the result is to the rate.',
    inputs: [
      { id: 'fv', label: 'Amount received later', min: 100, max: 100000, step: 100, value: 10000, fmt: 'money' },
      { id: 'apr', label: 'Quoted annual rate (APR)', min: 0, max: 20, step: 0.1, value: 8, fmt: 'pct' },
      { id: 'm', label: 'Compounding periods a year (1 annual, 2 semi-annual, 4 quarterly, 12 monthly)', min: 1, max: 12, step: 1, value: 4, fmt: 'int' },
      { id: 't', label: 'Years until it arrives', min: 0.25, max: 40, step: 0.25, value: 1, fmt: 'num', unit: 'years' },
    ],
    compute: (v) => {
      const r = v.apr / 100 / v.m;
      const n = v.m * v.t;
      const df = (1 + r) ** -n;
      const pv = v.fv * df;
      const ear = ((1 + r) ** v.m - 1) * 100;
      const rUp = (v.apr + 1) / 100 / v.m;
      const pvUp = v.fv * (1 + rUp) ** -n;
      const drop = (1 - pvUp / pv) * 100;
      const N = Math.max(1, Math.ceil(v.t));
      const xs = range(N);
      const rUp2 = (v.apr + 2) / 100 / v.m;
      const note = v.apr === 0
        ? 'At a 0% rate waiting costs nothing, so the amount is worth the same today as when it arrives. Any positive rate makes it worth less today.'
        : `${money(v.fv)} due in ${num(v.t)} years is worth ${money(pv)} today: invested now at ${pct(v.apr, 1)} compounded ${v.m} time${v.m === 1 ? '' : 's'} a year, that sum would grow to exactly ${money(v.fv)}. A rate one point higher would cut the present value by ${pct(drop)}${v.t >= 10 ? ', a large fall, because the amount is so far away' : ''}.`;
      return {
        headline: { label: 'Present value today', value: money(pv) },
        rows: [
          ['Rate per period, r = APR ÷ m', pct(r * 100, 4)],
          ['Number of periods, n = m × t', num(n, 2)],
          ['Discount factor, 1 ÷ (1 + r)ⁿ', df.toFixed(6)],
          ['Effective annual rate', pct(ear, 4)],
          ['Present value if the APR were 1 point higher', `${money(pvUp)} (${pct(drop)} less)`],
          ['Interest the present value would earn before the amount arrives', money(v.fv - pv)],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Years until the amount arrives', values: xs },
          series: [
            { name: `At ${pct(v.apr, 1)}`, values: xs.map((t) => r2(v.fv * (1 + r) ** (-v.m * t))) },
            { name: `At ${pct(v.apr + 2, 1)}`, values: xs.map((t) => r2(v.fv * (1 + rUp2) ** (-v.m * t))) },
          ],
          y: { label: 'Present value ($)' },
        },
      };
    },
  },
  'rate-time': {
    type: 'formula',
    title: 'Solve for the rate or the time',
    intro: 'An amount today, a target amount and two ways to reach it: the rate needed in the time you have, or the time needed at the rate you can earn. Rates here are effective annual rates.',
    inputs: [
      { id: 'pv', label: 'Amount today', min: 100, max: 100000, step: 100, value: 8500, fmt: 'money' },
      { id: 'fv', label: 'Target amount', min: 100, max: 200000, step: 100, value: 10000, fmt: 'money' },
      { id: 't', label: 'Time available', min: 0.5, max: 40, step: 0.5, value: 2.5, fmt: 'num', unit: 'years' },
      { id: 'rate', label: 'Rate you can earn (effective, a year)', min: 0.1, max: 20, step: 0.1, value: 4, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.fv <= v.pv) return { error: 'Set a target above the amount today: at a positive rate money only grows, so there is no rate or time to solve for.' };
      const g = v.fv / v.pv;
      const need = (g ** (1 / v.t) - 1) * 100;
      const r = v.rate / 100;
      const years = Math.log(g) / Math.log(1 + r);
      const today = v.fv / (1 + r) ** v.t;
      const reached = v.pv * (1 + r) ** v.t;
      const N = Math.max(1, Math.ceil(v.t));
      const xs = range(N);
      const note = need <= v.rate
        ? `At ${pct(v.rate, 1)} you reach ${money(v.fv)} in ${num(years)} years, inside the ${num(v.t, 1)} available: you need only ${pct(need)} a year. Check: ${money(v.pv)} × (1 + ${num(need / 100, 6)})^${num(v.t, 1)} = ${money(v.fv)}.`
        : `You would need ${pct(need)} a year to reach ${money(v.fv)} in ${num(v.t, 1)} years. At ${pct(v.rate, 1)} it takes ${num(years)} years, or you would need ${money(today)} today instead of ${money(v.pv)}.`;
      return {
        headline: { label: `Rate needed to reach the target in ${num(v.t, 1)} years`, value: pct(need, 4) },
        rows: [
          ['Growth needed, FV ÷ PV', g.toFixed(6)],
          [`Years needed at ${pct(v.rate, 1)}: ln(FV ÷ PV) ÷ ln(1 + r)`, num(years)],
          [`Amount needed today to reach the target at ${pct(v.rate, 1)}`, money(today)],
          [`What ${money(v.pv)} grows to at ${pct(v.rate, 1)} in the time available`, money(reached)],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Year', values: xs },
          series: [
            { name: `Growing at ${pct(v.rate, 1)}`, values: xs.map((t) => r2(v.pv * (1 + r) ** t)) },
            { name: `Growing at the rate needed (${pct(need, 2)})`, values: xs.map((t) => r2(v.pv * (1 + need / 100) ** t)) },
            { name: 'Target', values: xs.map(() => v.fv) },
          ],
          y: { label: 'Balance ($)' },
        },
      };
    },
  },
  'df-curves': {
    type: 'chart', kind: 'line',
    title: 'Present value of $100 received after t years',
    x: { label: 'Years until the $100 arrives', values: [0, 5, 10, 15, 20, 25, 30, 35, 40] },
    series: [3, 6, 9].map((p) => ({ name: `${p}% a year`, values: [0, 5, 10, 15, 20, 25, 30, 35, 40].map((t) => r2(100 / (1 + p / 100) ** t)) })),
    y: { label: 'Present value ($)' },
    note: 'Every curve starts at $100 and falls more slowly as time passes, but a higher rate makes it fall much faster: $100 due in 40 years is worth $30.66 at 3% and $3.18 at 9%.',
  },
};

export const guided = [
  {
    id: 'f04-pfv-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional landlord will receive a $15,000 lease-termination payment in three years. Money is worth 9% a year to her, compounded annually. What is the payment worth today?',
    solution: 'Discount factor = 1 ÷ 1.09³ = 1 ÷ 1.295029 = 0.772183. PV = 15,000 × 0.772183 = $11,582.75 (from the unrounded factor). At 10%, 15,000 ÷ 1.331 = $11,269.72: a higher rate gives a lower present value.',
    steps: [
      { id: 'f04-pfv-g1-s1', type: 'num', prompt: 'What is the three-year discount factor at 9%? Give it to six decimal places.',
        answer: 0.772183, check: () => 1 / 1.09 ** 3, unit: '', places: 6, tol: 0.0001,
        hints: ['A discount factor is 1 ÷ (1 + r)ⁿ.', '1.09³ = 1.295029; divide 1 by it.'],
        wrong: [
          { value: 0.73, say: 'That is 1 − 3 × 0.09: subtracting simple interest. Discounting divides by 1.09 three times.' },
          { value: 0.787402, say: 'That is 1 ÷ 1.27, simple interest for three years. Compound: 1 ÷ 1.09³.' },
          { value: 1.295029, say: 'That is the growth factor 1.09³. The discount factor is its reciprocal.' },
        ] },
      { id: 'f04-pfv-g1-s2', type: 'num', prompt: 'What is the payment worth today, to the nearest cent?',
        answer: 11582.75, check: () => 15000 / 1.09 ** 3, unit: '$', places: 2, tol: 0.76,
        hints: ['PV = FV × discount factor.', '15,000 × 0.772183; keep all the decimal places until the end.'],
        wrong: [
          { value: 10950, say: 'You took 27% off. Discounting divides by 1.09 for each year.' },
          { value: 11811.02, say: 'That divides by 1.27 (simple interest). Divide by 1.09³ instead.' },
          { value: 19425.44, say: 'That is the future value of $15,000 in three years. The question asks what a later amount is worth today.' },
        ] },
      { id: 'f04-pfv-g1-s3', type: 'num', prompt: 'If money were worth 10% a year to her instead, what would the payment be worth today?',
        answer: 11269.72, check: () => 15000 / 1.1 ** 3, unit: '$', places: 2, tol: 0.76,
        hints: ['Same method with r = 0.10.', '1.1³ = 1.331.'],
        wrong: [{ value: 11582.75, say: 'That is the value at 9%. Recalculate with 1.10.' }] },
    ],
  },
  {
    id: 'f04-pfv-g2', type: 'steps', kind: 'applied',
    prompt: 'A fictional furniture maker is owed money by a customer who offers three ways to settle: (A) $20,000 now, (B) $22,500 in two years, or (C) $25,000 in three and a half years. The maker can earn 6% a year, compounded annually, on spare cash. Compare the offers at today’s date.',
    solution: 'B: 22,500 ÷ 1.06² = $20,024.92. C: 25,000 ÷ 1.06³·⁵ = 25,000 ÷ 1.226226 = $20,387.76. A is $20,000. C is worth the most today, then B, then A. Moving all three to year 3.5 instead would multiply each by 1.226226 and leave the order unchanged.',
    steps: [
      { id: 'f04-pfv-g2-s1', type: 'num', prompt: 'What is offer B worth today, to the nearest cent?',
        answer: 20024.92, check: () => 22500 / 1.06 ** 2, unit: '$', places: 2, tol: 1.13,
        hints: ['Two years at 6%: divide by 1.06².', '1.06² = 1.1236.'],
        wrong: [{ value: 22500, say: 'An amount due in two years must be discounted before it can be compared with cash today.' }, { value: 25281, say: 'You compounded forward. To value it today, divide by 1.06².' }] },
      { id: 'f04-pfv-g2-s2', type: 'num', prompt: 'What is offer C worth today, to the nearest cent? (Three and a half years is a fractional number of periods: use n = 3.5.)',
        answer: 20387.76, check: () => 25000 / 1.06 ** 3.5, unit: '$', places: 2, tol: 1.25,
        hints: ['n need not be a whole number: 1.06 raised to the power 3.5.', '1.06³·⁵ = 1.226226.'],
        wrong: [
          { value: 20990.48, say: 'That discounts for three years only. The payment is three and a half years away.' },
          { value: 19802.34, say: 'That discounts for four years. Use n = 3.5.' },
        ] },
      { id: 'f04-pfv-g2-s3', type: 'mc', prompt: 'Which offer should the maker accept, if the customer is certain to pay?',
        options: ['C: $25,000 in three and a half years', 'B: $22,500 in two years', 'A: $20,000 now', 'They are worth the same once discounted'],
        answer: 0,
        hints: ['Compare the three present values: $20,000, $20,024.92 and $20,387.76.'],
        feedback: {
          1: 'B is worth $20,024.92 today, more than A but less than C’s $20,387.76.',
          2: 'Cash now is attractive, but at 6% both later offers are worth more today.',
          3: 'They differ by up to $387.76 in today’s money.',
        } },
    ],
  },
  {
    id: 'f04-pfv-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional fund returns 12% in year 1, −8% in year 2 and 10% in year 3. Work with the growth factors.',
    solution: 'Growth factor = 1.12 × 0.92 × 1.10 = 1.13344, so $8,000 becomes $9,067.52. Equivalent constant rate = 1.13344^(1/3) − 1 = 4.26% a year, below the arithmetic average of 4.67%. To have $10,000 after three years you would need 10,000 ÷ 1.13344 = $8,822.70 at the start.',
    steps: [
      { id: 'f04-pfv-g3-s1', type: 'num', prompt: 'What does $8,000 invested at the start grow to after three years?',
        answer: 9067.52, check: () => 8000 * 1.12 * 0.92 * 1.1, unit: '$', places: 2, tol: 0.01,
        hints: ['Multiply by the growth factor of each year: 1.12, then 0.92 (a 8% fall), then 1.10.', '1.12 × 0.92 × 1.10 = 1.13344.'],
        wrong: [
          { value: 9120, say: 'That adds the rates (12 − 8 + 10 = 14%) as simple interest. Each year’s return applies to the balance at the start of that year: multiply the factors.' },
          { value: 9173.08, say: 'That compounds the arithmetic average, 4.67%, for three years. The average of the rates is not the rate the money actually earned.' },
        ] },
      { id: 'f04-pfv-g3-s2', type: 'num', prompt: 'What constant annual rate would have given the same result? Give a percentage to two decimal places.',
        answer: 4.26, check: () => ((1.12 * 0.92 * 1.1) ** (1 / 3) - 1) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Take the cube root of the three-year growth factor and subtract 1.', '1.13344^(1/3) − 1.'],
        wrong: [{ value: 4.67, say: 'That is the arithmetic average of 12, −8 and 10. Growth factors multiply, so the equivalent rate is a geometric mean, which is lower.' }, { value: 13.34, say: 'That is the total growth over three years. Convert it to a rate per year with the cube root.' }] },
      { id: 'f04-pfv-g3-s3', type: 'num', prompt: 'How much would you have needed at the start to end with $10,000?',
        answer: 8822.70, check: () => 10000 / (1.12 * 0.92 * 1.1), unit: '$', places: 2, tol: 0.45,
        hints: ['A present value divides by the same product of growth factors.', '10,000 ÷ 1.13344.'],
        wrong: [{ value: 11334.4, say: 'That multiplies by the growth factor. To go back in time, divide.' }] },
    ],
  },
  {
    id: 'f04-pfv-g4', type: 'num', kind: 'applied',
    prompt: 'A fictional investor can buy, for $8,500 today, a note that pays $10,000 in 30 months and nothing before. What effective annual rate does it earn? Give a percentage to two decimal places.',
    answer: 6.72, check: () => ((10000 / 8500) ** (1 / 2.5) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['Measure n in years to get an annual rate: 30 months = 2.5 years.', 'r = (10,000 ÷ 8,500)^(1/2.5) − 1.'],
    wrong: [
      { value: 7.06, say: 'That spreads the $1,500 gain evenly over 2.5 years (simple interest). Compounding means each year’s growth builds on the last: use the root.' },
      { value: 0.54, say: 'That is the rate per month (n = 30). The question asks for an annual rate: use n = 2.5 years, or compound the monthly rate for 12 months.' },
      { value: 17.65, say: 'That is the total gain over 30 months. Convert it to a rate per year.' },
    ],
    solution: 'Growth needed = 10,000 ÷ 8,500 = 1.176471. With n = 2.5 years, r = 1.176471^(1/2.5) − 1 = 1.176471^0.4 − 1 ≈ 0.0672, or 6.72% a year. Check: 8,500 × 1.0672^2.5 ≈ $10,000. In a spreadsheet, =RATE(2.5, 0, −8500, 10000) gives the same.',
  },
];

export const independent = [
  {
    id: 'f04-pfv-i1', type: 'num', kind: 'numerical',
    prompt: 'What is the present value of $25,000 due in four years, at 4.8% a year compounded monthly? Give dollars and cents.',
    answer: 20640.58, check: () => 25000 * (1 + 0.048 / 12) ** -48, unit: '$', places: 2, tol: 1.25,
    wrong: [
      { value: 20725.02, say: 'That uses annual compounding (1.048⁴). With monthly compounding use 0.4% a month for 48 months.' },
      { value: 24603.97, say: 'That uses the monthly rate for only four periods. Four years contain 48 months.' },
      { value: 30280.16, say: 'That is the future value of $25,000. Discount: divide by 1.004⁴⁸.' },
    ],
    solution: 'r = 4.8% ÷ 12 = 0.4% a month; n = 12 × 4 = 48. Discount factor = 1.004⁻⁴⁸ = 0.825623. PV = 25,000 × 0.825623 ≈ $20,640.58.',
  },
  {
    id: 'f04-pfv-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Which change, on its own, increases the present value of a fixed amount to be received in the future?',
    options: [
      'A lower discount rate',
      'A higher discount rate',
      'A longer wait before the amount arrives',
      'More frequent compounding at the same quoted annual rate',
    ],
    answer: 0,
    feedback: {
      1: 'A higher rate means money grows faster, so less is needed today to reach the same amount: the present value falls.',
      2: 'A longer wait gives the money more periods to grow, so less is needed today: the present value falls.',
      3: 'More frequent compounding raises the effective rate, which lowers the present value slightly.',
    },
    solution: 'PV = FV ÷ (1 + r)ⁿ. Lowering r shrinks the denominator and raises PV. Raising r, lengthening n or compounding more often (a higher effective rate) all lower it.',
  },
  {
    id: 'f04-pfv-i3', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery owes an equipment supplier $4,000 due in 6 months and $6,000 due in 18 months. They agree to replace both with a single payment in 12 months, at 6% a year compounded monthly. How much is the single payment? Give dollars and cents.',
    answer: 9944.62, check: () => 4000 * 1.005 ** 6 + 6000 * 1.005 ** -6, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 10000, say: 'You added the two debts as they stand. Move each to month 12 first: the first is 6 months overdue, the second 6 months early.' },
      { value: 9366.89, say: 'That is the value of both debts today (month 0). The new payment is at month 12, so compound that value forward 12 months.' },
    ],
    solution: 'Comparison date: month 12; r = 0.5% a month. First debt, 6 months overdue: 4,000 × 1.005⁶ = $4,121.51. Second debt, 6 months early: 6,000 × 1.005⁻⁶ = $5,823.11. Payment = 4,121.51 + 5,823.11 = $9,944.62.',
  },
  {
    id: 'f04-pfv-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional town puts $2.5 million into a fund earning 5% a year, compounded annually, to pay for a $4 million bridge repair. How many years until the fund reaches $4 million? Give two decimal places.',
    answer: 9.63, check: () => Math.log(4 / 2.5) / Math.log(1.05), unit: 'years', places: 2, tol: 0.01,
    wrong: [
      { value: 12, say: 'That assumes simple interest of $125,000 a year. The fund compounds: n = ln(1.6) ÷ ln(1.05).' },
    ],
    solution: 'n = ln(4 ÷ 2.5) ÷ ln(1.05) = ln 1.6 ÷ ln 1.05 = 0.470004 ÷ 0.048790 ≈ 9.63 years. Check: 2.5 × 1.05^9.63 ≈ 4.0 million.',
  },
  {
    id: 'f04-pfv-i5', type: 'num', kind: 'numerical',
    prompt: 'What is the present value of $7,500 due in 20 months, at 6% a year compounded quarterly? Treat the part-quarter with a fractional exponent. Give dollars and cents.',
    answer: 6791.32, check: () => 7500 * 1.015 ** (-20 / 3), unit: '$', places: 2, tol: 0.4,
    wrong: [
      { value: 6859.07, say: 'That discounts for 6 quarters. Twenty months is 20 ÷ 3 = 6.667 quarters.' },
      { value: 6757.7, say: 'That discounts for 7 quarters. Twenty months is 20 ÷ 3 = 6.667 quarters.' },
      { value: 6805.89, say: 'That discounts at 6% compounded annually. The rate is compounded quarterly: 1.5% a quarter.' },
    ],
    solution: 'r = 6% ÷ 4 = 1.5% a quarter; n = 20 ÷ 3 = 6.6667 quarters. PV = 7,500 × 1.015^(−6.6667) = 7,500 × 0.905510 ≈ $6,791.32.',
  },
  {
    id: 'f04-pfv-i6', type: 'mc', kind: 'applied',
    prompt: 'A pension fund has promised three fictional payments of $1,000: one due in 1 year, one in 10 years and one in 30 years. Interest rates rise from 5% to 6%. Which payment’s present value falls by the largest percentage?',
    options: [
      'The payment due in 30 years',
      'The payment due in 1 year',
      'The payment due in 10 years',
      'All three fall by the same percentage, because the rate rose by the same amount',
    ],
    answer: 0,
    feedback: {
      1: 'Its value falls by under 1%: one period of discounting changes little.',
      2: 'It falls by about 9%, but the 30-year payment falls by about 25%.',
      3: 'The percentage fall is (1.05 ÷ 1.06)ⁿ − 1, which grows with n.',
    },
    solution: 'Each present value is multiplied by (1.05 ÷ 1.06)ⁿ: −0.94% for 1 year, −9.04% for 10 years and −24.75% for 30 years. Distant payments are the most sensitive to rates.',
  },
];

export const check = [
  {
    id: 'f04-pfv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'The ten-year discount factor at some rate is 0.62. What does that tell you?',
    options: [
      'A dollar received in ten years is worth 62 cents today at that rate',
      'A dollar invested today grows by 62% in ten years',
      'The rate is 6.2% a year',
      'An amount loses 62% of its value over ten years',
    ],
    answer: 0,
    feedback: {
      1: 'That confuses the discount factor with growth. A dollar today grows to 1 ÷ 0.62 ≈ $1.61, a 61% gain.',
      2: 'The factor is 1 ÷ (1 + r)¹⁰; 0.62 corresponds to about 4.9% a year, not 6.2%.',
      3: 'The present value is 62% of the amount, so it is 38% lower, not 62%.',
    },
    solution: 'A discount factor is the present value of $1: here $1 in ten years is worth $0.62 today. Solving 1 ÷ (1 + r)¹⁰ = 0.62 gives r = 0.62^(−1/10) − 1 ≈ 4.9% a year.',
  },
  {
    id: 'f04-pfv-k2', type: 'num', kind: 'numerical',
    prompt: 'What is the present value of $40,000 due in five years, at 7% a year compounded semi-annually? Give dollars and cents.',
    answer: 28356.75, check: () => 40000 * 1.035 ** -10, unit: '$', places: 2, tol: 2,
    wrong: [
      { value: 28519.45, say: 'That uses annual compounding (1.07⁵). Use 3.5% per half-year for 10 half-years.' },
      { value: 29629.63, say: 'That is simple discounting, 40,000 ÷ 1.35. Compound: divide by 1.035¹⁰.' },
    ],
    solution: 'r = 7% ÷ 2 = 3.5%; n = 10. PV = 40,000 × 1.035⁻¹⁰ = 40,000 × 0.708919 ≈ $28,356.75.',
  },
  {
    id: 'f04-pfv-k3', type: 'num', kind: 'applied',
    prompt: 'A fictional design studio is owed $12,000 by a client, due in nine months. The client offers to pay $11,500 today instead. Accepting is like borrowing $11,500 now and repaying $12,000 in nine months. What effective annual rate does that amount to? Give a percentage to two decimal places.',
    answer: 5.84, check: () => ((12000 / 11500) ** (1 / 0.75) - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 4.35, say: 'That is the rate for the nine months (500 ÷ 11,500). Convert it to a year: raise 1.043478 to the power 1 ÷ 0.75.' },
      { value: 5.8, say: 'That scales the nine-month rate up in proportion (simple interest). Compound it: 1.043478^(4/3) − 1.' },
    ],
    solution: 'Nine months is 0.75 of a year. r = (12,000 ÷ 11,500)^(1/0.75) − 1 = 1.043478^1.3333 − 1 ≈ 5.84% a year. If the studio would otherwise borrow at more than that, say 7%, taking $11,500 now is the cheaper source of cash. Equivalently, at 7% the $12,000 is worth only 12,000 ÷ 1.07^0.75 ≈ $11,406.26 today, less than the $11,500 offered.',
  },
  {
    id: 'f04-pfv-k4', type: 'num', kind: 'numerical',
    prompt: 'A payment of $50,000 is due in three years. One-year rates are expected to be 3% in year 1, 5% in year 2 and 8% in year 3. What is the payment worth today? Give dollars and cents.',
    answer: 42807.49, check: () => 50000 / (1.03 * 1.05 * 1.08), unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 39691.61, say: 'That discounts at 8% for all three years. Each year has its own rate: divide by 1.03 × 1.05 × 1.08.' },
      { value: 45757.08, say: 'That discounts at 3% for all three years. Use each year’s rate.' },
      { value: 43191.88, say: 'That uses 5% for every year. Multiply the three growth factors instead.' },
    ],
    solution: 'Product of growth factors = 1.03 × 1.05 × 1.08 = 1.16802. PV = 50,000 ÷ 1.16802 ≈ $42,807.49.',
  },
  {
    id: 'f04-pfv-k5', type: 'mc', kind: 'applied',
    prompt: 'A fictional prize winner can take $50,000 now or $60,000 in three years. She can earn 7% a year, compounded annually, on safe investments. Which should she choose, and why?',
    options: [
      '$50,000 now: the $60,000 is worth about $48,977.87 today at 7%',
      '$60,000 later: it is $10,000 more',
      '$60,000 later: at 7% it is worth about $73,503 in three years',
      'They are equal, because 7% for three years is 21% and $60,000 is 20% more than $50,000',
    ],
    answer: 0,
    feedback: {
      1: 'Dollars at different dates cannot be compared directly. Discount the $60,000 first.',
      2: 'That is what $60,000 would grow to after another three years. Compare the two offers at the same date.',
      3: 'Compounding gives 1.07³ − 1 = 22.5%, not 21%, and the comparison must be made at one date: $60,000 ÷ 1.225043 = $48,977.87.',
    },
    solution: '60,000 ÷ 1.07³ = 60,000 ÷ 1.225043 ≈ $48,977.87, less than $50,000. Compared at year 3 instead, $50,000 grows to $61,252.15, more than $60,000: the same conclusion. The offers are equal only at about 6.27% a year.',
  },
  {
    id: 'f04-pfv-k6', type: 'num', kind: 'numerical',
    prompt: 'An investment of $12,000 grows to $15,000 in four years with annual compounding. What annual rate did it earn? Give a percentage to two decimal places.',
    answer: 5.74, check: () => ((15000 / 12000) ** (1 / 4) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 6.25, say: 'That is the simple rate: 25% ÷ 4. With compounding, take the fourth root of 1.25.' },
      { value: 25, say: 'That is the total growth over four years, not the rate per year.' },
    ],
    solution: 'r = (15,000 ÷ 12,000)^(1/4) − 1 = 1.25^0.25 − 1 ≈ 0.0574, or 5.74% a year. Check: 12,000 × 1.0574⁴ ≈ $15,000.',
  },
];
