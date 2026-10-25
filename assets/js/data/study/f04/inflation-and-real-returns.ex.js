// inflation-and-real-returns.ex.js — F04 · Inflation and real returns: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// All people, businesses, indexes and yields in the exercises are fictional. ANA_PLAN figures are not used.

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const af = (r, n) => (1 - (1 + r) ** -n) / r;

export const widgets = {
  'consistent-pv': {
    type: 'formula',
    title: 'Discounting real and nominal cash flows',
    intro: 'A payment fixed in today’s dollars, received at the end of each year, so its nominal amount grows with inflation. The defaults are Lantern’s indexed catering offer.',
    inputs: [
      { id: 'pay', label: 'Payment each year in today’s dollars', min: 1000, max: 100000, step: 1000, value: 40000, fmt: 'money' },
      { id: 'n', label: 'Years', min: 1, max: 30, step: 1, value: 3, fmt: 'int', unit: 'years' },
      { id: 'inf', label: 'Expected inflation', min: 0, max: 15, step: 0.1, value: 2.8, fmt: 'pct' },
      { id: 'rn', label: 'Nominal discount rate', min: 1, max: 25, step: 0.1, value: 10, fmt: 'pct' },
    ],
    compute: (v) => {
      const i = v.inf / 100, R = v.rn / 100, rr = (1 + R) / (1 + i) - 1;
      const years = Array.from({ length: v.n }, (_, k) => k + 1);
      const nom = (t) => v.pay * (1 + i) ** t;
      const pvNom = years.reduce((a, t) => a + nom(t) / (1 + R) ** t, 0);
      const pvReal = years.reduce((a, t) => a + v.pay / (1 + rr) ** t, 0);
      const mixLow = years.reduce((a, t) => a + v.pay / (1 + R) ** t, 0);
      const mixHigh = years.reduce((a, t) => a + nom(t) / (1 + rr) ** t, 0);
      const gap = (x) => `${x >= pvNom ? '+' : '−'}${money(Math.abs(x - pvNom))} against the correct value`;
      let note;
      if (v.inf === 0) note = 'With no inflation, real and nominal are the same thing: all four calculations agree. Raise inflation to see the mixed-up routes separate.';
      else note = `Both consistent routes give ${money(pvNom)}. Discounting the real payments at the nominal rate charges for inflation the payments never receive and undervalues by ${money(pvNom - mixLow)}; discounting the inflated payments at the real rate overvalues by ${money(mixHigh - pvNom)}.${rr < 0 ? ' The real rate is negative here because inflation exceeds the nominal rate: a future dollar of purchasing power is worth more than one today.' : ''}`;
      return {
        headline: { label: 'Present value (either consistent route)', value: money(pvNom) },
        rows: [
          ['Real discount rate (exact)', pct(rr * 100, 4)],
          ['Nominal route: nominal payments at the nominal rate', money(pvNom)],
          ['Real route: real payments at the real rate', money(pvReal)],
          ['Mixed up: real payments at the nominal rate', `${money(mixLow)} (${gap(mixLow)})`],
          ['Mixed up: nominal payments at the real rate', `${money(mixHigh)} (${gap(mixHigh)})`],
          [`Nominal payment in year ${v.n}`, money(nom(v.n))],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Year', values: years },
          series: [{ name: 'Nominal payment', values: years.map((t) => r2(nom(t))) }, { name: 'Real payment (today’s dollars)', values: years.map(() => v.pay) }],
          y: { label: 'Payment ($)', format: 'money' } },
      };
    },
  },
  'real-salary': {
    type: 'formula',
    title: 'A salary in nominal and real terms',
    intro: 'A salary that rises by the same percentage every year while prices rise at a steady rate.',
    inputs: [
      { id: 's', label: 'Salary today', min: 20000, max: 200000, step: 1000, value: 42000, fmt: 'money' },
      { id: 'g', label: 'Pay rise each year', min: 0, max: 15, step: 0.1, value: 3.5, fmt: 'pct' },
      { id: 'inf', label: 'Inflation each year', min: 0, max: 15, step: 0.1, value: 2.8, fmt: 'pct' },
      { id: 'n', label: 'Years', min: 1, max: 40, step: 1, value: 4, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const g = v.g / 100, i = v.inf / 100;
      const yrs = Array.from({ length: v.n + 1 }, (_, k) => k);
      const nominal = (t) => v.s * (1 + g) ** t;
      const real = (t) => nominal(t) / (1 + i) ** t;
      const gr = ((1 + g) / (1 + i) - 1) * 100;
      let note;
      if (Math.abs(gr) < 0.0005) note = 'The pay rise exactly matches inflation: the salary grows in dollars but buys the same each year.';
      else if (gr < 0) note = `The salary rises to ${money(nominal(v.n))} in dollars, but because prices rise faster it buys only what ${money(real(v.n))} buys today: a real pay cut of ${pct((real(v.n) / v.s - 1) * -100, 1)} over ${v.n} year${v.n === 1 ? '' : 's'}.`;
      else note = `The salary rises to ${money(nominal(v.n))} in dollars and buys what ${money(real(v.n))} buys today: a real rise of ${pct((real(v.n) / v.s - 1) * 100, 1)} over ${v.n} year${v.n === 1 ? '' : 's'}.`;
      note += ` The shortcut (raise − inflation) says ${pct(v.g - v.inf)} a year; the exact real growth is ${pct(gr)}.`;
      return {
        headline: { label: 'Real growth per year (exact)', value: pct(gr) },
        rows: [
          [`Salary in year ${v.n} (dollars of that year)`, money(nominal(v.n))],
          ['The same salary in today’s dollars', money(real(v.n))],
          ['Approximation: raise − inflation', pct(v.g - v.inf)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Year', values: yrs },
          series: [{ name: 'Salary in dollars', values: yrs.map((t) => r2(nominal(t))) }, { name: 'Salary in today’s dollars', values: yrs.map((t) => r2(real(t))) }],
          y: { label: 'Salary ($)', format: 'money' } },
      };
    },
  },
  'purchasing-power': {
    type: 'chart',
    kind: 'line',
    title: 'What $1,000 received in a future year is worth today',
    x: { label: 'Years from now', values: Array.from({ length: 31 }, (_, k) => k) },
    series: [0.02, 0.028, 0.05].map((i) => ({ name: `${(i * 100).toFixed(1)}% inflation`, values: Array.from({ length: 31 }, (_, k) => r2(1000 / (1 + i) ** k)) })),
    y: { label: 'Value in today’s dollars ($)', format: 'money' },
    note: 'Each point is 1,000 ÷ (1 + inflation)^years. After 30 years, $1,000 buys what about $552 buys today at 2% inflation, about $437 at 2.8% and about $231 at 5%.',
  },
};

export const guided = [
  {
    id: 'f04-real-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional price index stood at 240.0 at the start of Year 1 and at 270.9 three years later.',
    solution: 'Cumulative inflation = 270.9 ÷ 240.0 − 1 = 12.875%. Average annual = 1.12875^(1/3) − 1 ≈ 4.12%. $1,000 received at the end of the three years is worth 1,000 × 240.0 ÷ 270.9 ≈ $885.94 at start-of-period prices.',
    steps: [
      { id: 'f04-real-g1-s1', type: 'num', prompt: 'Cumulative inflation over the three years, in percent (two decimal places).',
        answer: 12.88, check: () => (270.9 / 240 - 1) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Divide the end level by the start level and subtract 1.', '270.9 ÷ 240.0 = 1.12875.'],
        wrong: [{ value: 30.9, say: 'That is the rise in index points. Inflation is a percentage change: divide by the starting level.' }] },
      { id: 'f04-real-g1-s2', type: 'num', prompt: 'Average annual inflation rate, in percent (two decimal places).',
        answer: 4.12, check: () => ((270.9 / 240) ** (1 / 3) - 1) * 100, unit: '%', places: 2, tol: 0.01,
        hints: ['Inflation compounds, so take the cube root of the growth factor rather than dividing by 3.', '1.12875 raised to the power 1/3, minus 1.'],
        wrong: [{ value: 4.29, say: 'That divides the cumulative 12.875% by three. Each year’s inflation applies to prices that have already risen, so take the cube root of 1.12875.' }] },
      { id: 'f04-real-g1-s3', type: 'num', prompt: 'What is $1,000 received at the end of the three years worth in start-of-period dollars?',
        answer: 885.94, check: () => 1000 * 240 / 270.9, unit: '$', places: 2, tol: 0.05,
        hints: ['Multiply by the base index over the index at the date of payment.', '1,000 × 240.0 ÷ 270.9.'],
        wrong: [{ value: 1128.75, say: 'That moves the amount forward to end-of-period prices. To restate in start-of-period dollars, multiply by 240.0 ÷ 270.9.' }, { value: 871.25, say: 'Subtracting 12.875% is close but not exact. Divide by 1.12875.' }] },
    ],
  },
  {
    id: 'f04-real-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional pension fund wants a real return of 4% a year. It expects inflation of 3.2% a year. What nominal annual return must it earn, exactly? Give a percentage to three decimal places.',
    answer: 7.328, check: () => (1.04 * 1.032 - 1) * 100, unit: '%', places: 3, tol: 0.001,
    hints: ['Fisher relation: 1 + nominal = (1 + real)(1 + inflation).', '1.04 × 1.032 − 1.'],
    wrong: [
      { value: 7.2, say: 'That adds the two rates, which drops the product 0.04 × 0.032. Multiply the growth factors instead.' },
      { value: 0.775, say: 'That is 1.04 ÷ 1.032 − 1, a real rate. Here the real rate is known and the nominal rate is the unknown: multiply.' },
    ],
    solution: '1 + nominal = 1.04 × 1.032 = 1.07328, so the fund needs 7.328% a year. The extra 0.128 percentage points over 4% + 3.2% is the real return earned on the inflation compensation.',
  },
  {
    id: 'f04-real-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional supplier will pay you $10,000 in today’s dollars in two years’ time, with the amount raised in line with prices. Inflation is expected to be 3% a year and your nominal discount rate is 9% a year.',
    solution: 'Nominal amount = 10,000 × 1.03² = $10,609. PV at 9% = 10,609 ÷ 1.09² ≈ $8,929.38. Real rate = 1.09 ÷ 1.03 − 1 ≈ 5.8252%. PV of the real $10,000 at the real rate = 10,000 ÷ 1.058252² ≈ $8,929.38: the same, because inflation cancels from the top and the bottom.',
    steps: [
      { id: 'f04-real-g3-s1', type: 'num', prompt: 'What nominal amount do you expect to receive in two years?',
        answer: 10609, check: () => 10000 * 1.03 ** 2, unit: '$', places: 2, tol: 0.01,
        hints: ['Grow the real amount by two years of inflation.', '10,000 × 1.03².'],
        wrong: [{ value: 10600, say: 'That is simple growth (3% twice on $10,000). Prices compound: 1.03² = 1.0609.' }] },
      { id: 'f04-real-g3-s2', type: 'num', prompt: 'Present value by the nominal route (nominal amount, nominal rate).',
        answer: 8929.38, check: () => 10000 * 1.03 ** 2 / 1.09 ** 2, unit: '$', places: 2, tol: 0.05,
        hints: ['Discount for two years at 9%.', '10,609 ÷ 1.1881.'],
        wrong: [{ value: 8416.8, say: 'That discounts the real $10,000 at the nominal rate: a mixed-up route. Use the nominal $10,609 with the nominal rate.' }] },
      { id: 'f04-real-g3-s3', type: 'num', prompt: 'The real discount rate, in percent (four decimal places).',
        answer: 5.8252, check: () => (1.09 / 1.03 - 1) * 100, unit: '%', places: 4, tol: 0.0005,
        hints: ['Real rate = (1 + nominal) ÷ (1 + inflation) − 1.', '1.09 ÷ 1.03 − 1.'],
        wrong: [{ value: 6, say: 'That is the shortcut 9 − 3. Use the exact Fisher relation.' }] },
      { id: 'f04-real-g3-s4', type: 'num', prompt: 'Present value by the real route (real amount, real rate).',
        answer: 8929.38, check: () => 10000 / (1.09 / 1.03) ** 2, unit: '$', places: 2, tol: 1,
        hints: ['Discount $10,000 for two years at the real rate.', '10,000 ÷ 1.058252².'],
        wrong: [{ value: 9473.18, say: 'That discounts the nominal $10,609 at the real rate, counting inflation in the cash flow but not in the rate. Use the real $10,000.' }] },
    ],
  },
  {
    id: 'f04-real-g4', type: 'num', kind: 'applied',
    prompt: 'A fictional nurse’s salary rose from $50,000 to $58,000 over four years, while a price index rose from 280.0 to 310.0. By how much did her salary change in real terms over the four years? Give a percentage to two decimal places (use a minus sign if it fell).',
    answer: 4.77, check: () => (58000 * 280 / 310 / 50000 - 1) * 100, unit: '%', places: 2, tol: 0.02,
    hints: ['Restate $58,000 in the dollars of the start: multiply by 280.0 ÷ 310.0.', 'Then compare with $50,000: 52,387.10 ÷ 50,000 − 1.'],
    wrong: [
      { value: 16, say: 'That is the nominal rise. Remove the 10.71% rise in prices first.' },
      { value: 5.29, say: 'That subtracts inflation (10.71%) from the nominal rise (16%). Over four years the shortcut drifts; divide the growth factors: 1.16 ÷ 1.107143 − 1.' },
    ],
    solution: 'In start-of-period dollars her new salary is 58,000 × 280.0 ÷ 310.0 ≈ $52,387.10. Real change = 52,387.10 ÷ 50,000 − 1 ≈ 4.77%. Equivalently, 1.16 ÷ 1.107143 − 1 ≈ 4.77%. Her pay grew faster than prices, but by much less than the 16% the payslips suggest.',
  },
];

export const independent = [
  {
    id: 'f04-real-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Prices in a fictional economy rose 50% in total over ten years. Which statement about the average annual inflation rate is correct?',
    options: [
      'It is about 4.14%, the tenth root of 1.5 minus 1, because inflation compounds',
      'It is exactly 5% a year, because a 50% rise spread evenly over ten years is 50% ÷ 10',
      'It cannot be found without each year’s inflation rate, because prices may have risen faster in some years',
      'It is 50%, because that is the inflation over the period',
    ],
    answer: 0,
    feedback: {
      1: 'Dividing ignores compounding: 1.05¹⁰ ≈ 1.629, a 62.9% rise, not 50%.',
      2: 'The average annual rate needs only the start and end levels: (end ÷ start)^(1/n) − 1.',
      3: 'That is cumulative inflation. The question asks for the yearly average.',
    },
    solution: 'Average annual inflation = 1.5^(1/10) − 1 ≈ 0.0414, about 4.14% a year. Check: 1.0414¹⁰ ≈ 1.50. The yearly rates may have varied, but this is the constant rate that produces the same total rise.',
  },
  {
    id: 'f04-real-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional price index rose 0.25% last month. If it kept rising at that monthly rate for a year, what would annual inflation be? Give a percentage to two decimal places.',
    answer: 3.04, check: () => (1.0025 ** 12 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 3, say: 'That multiplies 0.25% by 12. Monthly rises compound: 1.0025¹² − 1.' }],
    solution: 'Annualised inflation = 1.0025¹² − 1 ≈ 0.0304, or 3.04%. One month is a noisy guide, though; analysts usually prefer the change over the last twelve months.',
  },
  {
    id: 'f04-real-i3', type: 'num', kind: 'numerical',
    prompt: 'You hold $5,000 of TIPS (original principal) with a fixed annual interest rate of 2.0%. On a payment date the index ratio is 1.06. Using the simplified method of the lesson, how much interest is paid on that date?',
    answer: 53, check: () => 5000 * 1.06 * 0.02 / 2, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 50, say: 'That applies the rate to the original principal. TIPS pay interest on the adjusted principal: 5,000 × 1.06.' },
      { value: 106, say: 'That is a full year’s interest. TIPS pay every six months, so each payment uses half the annual rate.' },
    ],
    solution: 'Adjusted principal = 5,000 × 1.06 = $5,300. Interest = 5,300 × 2.0% ÷ 2 = $53.00.',
  },
  {
    id: 'f04-real-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Is each cash flow naturally nominal (discount it at a nominal rate) or real (discount it at a real rate)?',
    items: [
      'A shop lease fixed in the contract at $3,000 a month for five years',
      'A forecast of next year’s coffee-bean costs prepared “in today’s prices”',
      'The interest payments on an ordinary Treasury note',
      'A catering fee of $40,000 a year in March 2027 dollars, adjusted each year by the CPI',
      'The monthly payments on a fixed-rate mortgage',
    ],
    categories: ['Nominal: discount at a nominal rate', 'Real: discount at a real rate'],
    answer: [0, 1, 0, 1, 0],
    feedback: {
      0: 'A fixed dollar amount written into a contract is nominal: it does not rise with prices.',
      1: 'A forecast in today’s prices leaves inflation out, so it is real.',
      2: 'Ordinary Treasury interest is a fixed dollar amount: nominal.',
      3: 'Stated in March 2027 dollars and indexed to the CPI: real.',
      4: 'Fixed-rate mortgage payments are fixed in dollars: nominal.',
    },
    solution: 'Nominal: the fixed lease, the Treasury note’s interest and the mortgage payments. Real: the forecast in today’s prices and the CPI-indexed fee. Either kind can be valued at either rate once it is converted, but each must be matched with its own kind of rate.',
  },
  {
    id: 'f04-real-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional ten-year Treasury note yields 4.6% a year and a ten-year TIPS yields a real 2.1% a year (treat both as effective annual rates). What break-even inflation rate do these yields imply? Give a percentage to two decimal places.',
    answer: 2.45, check: () => (1.046 / 1.021 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 2.5, say: 'That is the subtraction shortcut. Use (1 + nominal yield) ÷ (1 + real yield) − 1.' },
      { value: 6.8, say: 'You added the yields. Break-even inflation is the gap between them, found by division.' },
    ],
    solution: 'Break-even inflation = 1.046 ÷ 1.021 − 1 ≈ 0.0245, or 2.45% a year. An investor who expects inflation above that should prefer the TIPS; below it, the ordinary note.',
  },
  {
    id: 'f04-real-i6', type: 'num', kind: 'applied',
    prompt: 'A fictional couple bought a house for $150,000 when a price index stood at 180.0. They sell it for $255,000 when the index stands at 252.0. What was their real gain on the house, in percent? Give two decimal places. (Ignore costs of buying and selling.)',
    answer: 21.43, check: () => (255000 * 180 / 252 / 150000 - 1) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 70, say: 'That is the nominal gain. Prices in general rose 40% over the same period.' },
      { value: 30, say: 'That subtracts 40 percentage points of inflation from 70. Divide the growth factors: 1.70 ÷ 1.40 − 1.' },
    ],
    solution: 'In purchase-date dollars the sale price is 255,000 × 180.0 ÷ 252.0 ≈ $182,142.86. Real gain = 182,142.86 ÷ 150,000 − 1 ≈ 21.43%. Equivalently 1.70 ÷ 1.40 − 1. The house gained 70% in dollars but only about 21% in purchasing power.',
  },
];

export const check = [
  {
    id: 'f04-real-k1', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst forecasts a project’s cash flows in today’s prices, with no allowance for inflation. Which discount rate should she use?',
    options: [
      'A real discount rate, found from the nominal rate with the Fisher relation',
      'The nominal discount rate, because that is what investors quote',
      'The nominal rate plus expected inflation, so that the rate keeps up with rising prices',
      'The inflation rate',
    ],
    answer: 0,
    feedback: {
      1: 'The nominal rate includes compensation for inflation that these cash flows do not contain. The project would be undervalued.',
      2: 'That double-counts inflation in the rate and makes the error worse.',
      3: 'Inflation alone ignores the real return investors require for waiting and for risk.',
    },
    solution: 'Real cash flows go with a real rate: r_real = (1 + r_nom) ÷ (1 + inflation) − 1. Alternatively, inflate each cash flow to nominal and use the nominal rate; both give the same present value.',
  },
  {
    id: 'f04-real-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional price index rose from 150.0 to 189.0 over eight years. What was the average annual inflation rate? Give a percentage to two decimal places.',
    answer: 2.93, check: () => ((189 / 150) ** (1 / 8) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 3.25, say: 'That divides the cumulative 26% by eight. Inflation compounds: take the eighth root of 1.26.' },
      { value: 26, say: 'That is cumulative inflation over the eight years, not the yearly average.' },
    ],
    solution: 'Growth factor = 189.0 ÷ 150.0 = 1.26. Average annual inflation = 1.26^(1/8) − 1 ≈ 0.0293, or 2.93% a year.',
  },
  {
    id: 'f04-real-k3', type: 'num', kind: 'numerical',
    prompt: 'An investment earns an effective 7.5% a year while inflation is 3.0% a year. What is its exact real return? Give a percentage to two decimal places.',
    answer: 4.37, check: () => (1.075 / 1.03 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [{ value: 4.5, say: 'That is the subtraction shortcut. Use 1.075 ÷ 1.030 − 1.' }],
    solution: 'Real return = 1.075 ÷ 1.030 − 1 ≈ 0.0437, or 4.37% a year.',
  },
  {
    id: 'f04-real-k4', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery will receive a CPI-indexed rent from a tenant: $20,000 a year in today’s dollars, at the end of each of the next three years. It expects inflation of 2.5% a year and uses a nominal discount rate of 8% a year. What is the present value of the rent? Give dollars and cents.',
    answer: 54093.72, check: () => { const rr = 1.08 / 1.025 - 1; return 20000 * (1 - (1 + rr) ** -3) / rr; }, unit: '$', places: 2, tol: 5,
    wrong: [
      { value: 51541.94, say: 'That discounts the real $20,000 at the nominal 8%: the rent rises with prices, so either inflate it or use the real rate.' },
      { value: 56794.89, say: 'That discounts the inflated (nominal) rents at the real rate, counting inflation in the cash flows but not in the rate.' },
    ],
    solution: 'Real rate = 1.08 ÷ 1.025 − 1 ≈ 5.3659%. PV = 20,000 × (1 − 1.053659⁻³) ÷ 0.053659 ≈ $54,093.72. Check by the nominal route: rents of $20,500, $21,012.50 and $21,537.81 discounted at 8% also give about $54,093.72.',
  },
  {
    id: 'f04-real-k5', type: 'mc', kind: 'applied',
    prompt: 'Five-year Treasury notes yield 4.0% and five-year TIPS yield a real 1.5% (fictional figures; break-even inflation is about 2.46%). Inflation then averages 4% a year over the five years. Which statement is correct?',
    options: [
      'The TIPS holder earned about 5.6% a year in nominal terms and kept a 1.5% real return; the note holder’s real return was about 0%',
      'Both earned the same, because the market priced inflation in',
      'The note holder did better, because 4.0% is more than 1.5%',
      'The TIPS holder lost money, because TIPS pay a fixed rate',
    ],
    answer: 0,
    feedback: {
      1: 'The yields reflected expected inflation of about 2.46%. Actual inflation came in higher, so the outcomes differ.',
      2: 'That compares a nominal yield with a real one. Put both on the same basis first.',
      3: 'The fixed rate is a real rate paid on a principal that rises with the CPI, so higher inflation raises the dollar return.',
    },
    solution: 'TIPS nominal return ≈ 1.015 × 1.04 − 1 ≈ 5.56%; its real return stays 1.5%. The note’s real return = 1.04 ÷ 1.04 − 1 = 0%. When inflation exceeds the break-even rate, the inflation-protected bond does better.',
  },
  {
    id: 'f04-real-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional job offer promises a salary of $64,000 in six years’ time. If inflation averages 2.5% a year, what is that salary worth in today’s dollars? Give dollars and cents.',
    answer: 55187, check: () => 64000 / 1.025 ** 6, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 74220.38, say: 'That inflates $64,000 forward. To express a future amount in today’s dollars, divide by 1.025⁶.' },
      { value: 54400, say: 'That subtracts 2.5% six times from $64,000 (simple). Prices compound: divide by 1.025⁶ ≈ 1.159693.' },
    ],
    solution: 'Real value = 64,000 ÷ 1.025⁶ = 64,000 ÷ 1.159693 ≈ $55,187.00.',
  },
];
