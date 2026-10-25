// perpetuities-and-growth.ex.js — F04 · Perpetuities and growth: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;
const ga = (c, r, g, n) => c / (r - g) * (1 - ((1 + g) / (1 + r)) ** n);   // first n payments of a growing perpetuity
const gs = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7];

export const widgets = {
  perpetuity: {
    type: 'formula',
    title: 'How a perpetuity adds up',
    intro: 'A payment every year for ever, starting a year from now, growing at a constant rate. The starting values are Lantern’s scholarship: $2,000 a year at 5%, no growth.',
    inputs: [
      { id: 'c', label: 'First payment (one year from now)', min: 100, max: 10000, step: 100, value: 2000, fmt: 'money' },
      { id: 'r', label: 'Discount rate', min: 1, max: 15, step: 0.1, value: 5, fmt: 'pct' },
      { id: 'g', label: 'Growth rate of the payment', min: 0, max: 10, step: 0.1, value: 0, fmt: 'pct' },
      { id: 'n', label: 'Years shown', min: 5, max: 200, step: 5, value: 50, fmt: 'int', unit: 'years' },
    ],
    compute: (v) => {
      const r = v.r / 100, g = v.g / 100;
      if (g >= r - 1e-12) return { error: `With growth (${pct(v.g, 1)}) at or above the discount rate (${pct(v.r, 1)}), later payments are worth at least as much today as earlier ones, so the sum never settles: there is no finite value. Lower the growth rate below the discount rate.` };
      const pv = v.c / (r - g);
      const step = v.n > 100 ? 5 : 1;
      const xs = Array.from({ length: v.n / step + 1 }, (_, i) => i * step);
      const part = ga(v.c, r, g, v.n);
      const share = part / pv * 100;
      return {
        headline: { label: 'Value of the perpetuity today', value: money(pv) },
        rows: [
          ['r − g', pct((r - g) * 100)],
          [`Value of the first ${v.n} payments`, money(part)],
          [`Value of the payments after year ${v.n}`, money(pv - part)],
          [`Payment in year ${v.n}`, money(v.c * (1 + g) ** (v.n - 1))],
        ],
        note: `The first ${v.n} payments supply ${pct(share, 1)} of the value; everything after year ${v.n} supplies ${pct(100 - share, 1)}.${g > 0 ? ` Growth pushes value into the distant future: with no growth, the first ${v.n} years would supply ${pct((1 - (1 + r) ** -v.n) * 100, 1)}.` : ''}${r - g < 0.015 ? ' With r − g this small, a tiny change in either rate moves the value a long way.' : ''}`,
        chart: { kind: 'line', x: { label: 'Years of payments counted', values: xs },
          series: [
            { name: 'Value of the payments so far', values: xs.map((t) => r2(ga(v.c, r, g, t))) },
            { name: 'Value of the perpetuity', values: xs.map(() => r2(pv)) },
          ],
          y: { label: 'Present value', format: 'money' } },
      };
    },
  },
  'rg-sensitivity': {
    type: 'chart', kind: 'line',
    title: 'Value of a growing perpetuity with a first payment of $100',
    x: { label: 'Growth rate g (%)', values: gs },
    series: [
      { name: 'r = 8%', values: gs.map((g) => r2(100 / (0.08 - g / 100))) },
      { name: 'r = 9%', values: gs.map((g) => r2(100 / (0.09 - g / 100))) },
      { name: 'r = 10%', values: gs.map((g) => r2(100 / (0.10 - g / 100))) },
    ],
    y: { label: 'Present value', format: 'money' },
    note: 'At 0% growth the three values are $1,250, $1,111.11 and $1,000. At 7% growth they are $10,000, $5,000 and $3,333.33: as g approaches r the value climbs steeply, because it depends on 100 ÷ (r − g).',
  },
};

export const guided = [
  {
    id: 'f04-perp-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional ferry company’s preferred shares have a par value of $50 and a dividend rate of 6%, paid once a year, with no maturity date.',
    solution: 'Dividend = 50 × 6% = $3.00 a year for ever. At 7.5%: 3.00 ÷ 0.075 = $40.00. At 8%: 3.00 ÷ 0.08 = $37.50, a fall of $2.50 (6.25%).',
    steps: [
      { id: 'f04-perp-g1-s1', type: 'num', prompt: 'What is the annual dividend per share? Give dollars and cents.',
        answer: 3, check: () => 50 * 0.06, unit: '$', places: 2, tol: 0.005,
        hints: ['Dividend = par value × dividend rate.'],
        wrong: [{ value: 6, say: 'That is 6% of $100. Use the $50 par value.' }] },
      { id: 'f04-perp-g1-s2', type: 'num', prompt: 'Investors require 7.5% a year on similar shares. What is one share worth? Give dollars and cents.',
        answer: 40, check: () => 50 * 0.06 / 0.075, unit: '$', places: 2, tol: 0.01,
        hints: ['A fixed dividend for ever is a level perpetuity: value = D ÷ r.', '3.00 ÷ 0.075.'],
        wrong: [{ value: 50, say: 'That is the par value. The share is worth par only if the required return equals the 6% dividend rate.' }] },
      { id: 'f04-perp-g1-s3', type: 'num', prompt: 'If the required return rises to 8%, what is the share worth? Give dollars and cents.',
        answer: 37.5, check: () => 50 * 0.06 / 0.08, unit: '$', places: 2, tol: 0.01,
        hints: ['Same dividend, new rate.'],
        wrong: [{ value: 42.5, say: 'A higher required return lowers the value of a fixed payment: divide by 0.08.' }] },
    ],
  },
  {
    id: 'f04-perp-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional supermarket chain has just paid a dividend of $2.00 a share. Dividends are expected to grow at 3% a year for ever, and investors require 9%. What is a share worth? Give dollars and cents.',
    answer: 34.33, check: () => 2 * 1.03 / (0.09 - 0.03), unit: '$', places: 2, tol: 0.01,
    hints: ['The formula needs next year’s dividend, D₁ = D₀ × (1 + g).', 'D₁ = 2.00 × 1.03 = 2.06; value = 2.06 ÷ (0.09 − 0.03).'],
    wrong: [
      { value: 33.33, say: 'You used the dividend just paid. The formula needs the next one: 2.00 × 1.03 = 2.06.' },
      { value: 22.89, say: 'You divided by r alone. With growth, divide by r − g.' },
      { value: 17.17, say: 'You added g to r. The denominator is r − g.' },
    ],
    solution: 'D₁ = 2.00 × 1.03 = $2.06. P₀ = 2.06 ÷ (0.09 − 0.03) = 2.06 ÷ 0.06 ≈ $34.33.',
  },
  {
    id: 'f04-perp-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional land trust will receive $8,000 a year for ever, with the first payment five years from today. It values the payments at 6% a year.',
    solution: 'The formula values the payments at year 4, one year before the first: 8,000 ÷ 0.06 ≈ $133,333.33. Today: 133,333.33 ÷ 1.06⁴ = 133,333.33 ÷ 1.262477 ≈ $105,612.49.',
    steps: [
      { id: 'f04-perp-g3-s1', type: 'num', prompt: 'At what year does C ÷ r value this stream? Give the year.',
        answer: 4, check: () => 5 - 1, unit: 'year', places: 0, tol: 0,
        hints: ['C ÷ r values a perpetuity one period before its first payment.'],
        wrong: [{ value: 5, say: 'Year 5 is the first payment. The formula values the stream one year earlier.' }, { value: 0, say: 'That would be true only if the first payment were in year 1.' }] },
      { id: 'f04-perp-g3-s2', type: 'num', prompt: 'What is the stream worth at that date? Give dollars and cents.',
        answer: 133333.33, check: () => 8000 / 0.06, unit: '$', places: 2, tol: 0.5,
        hints: ['C ÷ r = 8,000 ÷ 0.06.'] },
      { id: 'f04-perp-g3-s3', type: 'num', prompt: 'What is it worth today? Give dollars and cents.',
        answer: 105612.49, check: () => 8000 / 0.06 / 1.06 ** 4, unit: '$', places: 2, tol: 2.5,
        hints: ['Discount the year-4 value four years: ÷ 1.06⁴.', '1.06⁴ ≈ 1.262477.'],
        wrong: [{ value: 99634.42, say: 'You discounted five years. The value from the formula is already at year 4.' }] },
    ],
  },
  {
    id: 'f04-perp-g4', type: 'num', kind: 'applied',
    prompt: 'A fictional charity has an endowment of $500,000 that it expects to earn 7% a year. It wants its annual grant to grow by 3% a year for ever, so that the grant keeps its purchasing power. How large can next year’s grant be? Give dollars and cents.',
    answer: 20000, check: () => 500000 * (0.07 - 0.03), unit: '$', places: 2, tol: 0.5,
    hints: ['A growing perpetuity: PV = C₁ ÷ (r − g). Solve for C₁.', 'C₁ = PV × (r − g) = 500,000 × 0.04.'],
    wrong: [
      { value: 35000, say: 'That spends all of the 7% return, so nothing is reinvested and the grant cannot grow.' },
      { value: 15000, say: 'That is the amount reinvested (3%). The grant is what is left of the return: r − g.' },
    ],
    solution: 'C₁ = 500,000 × (0.07 − 0.03) = $20,000. The fund earns $35,000, pays $20,000 and reinvests $15,000 (3% of the fund), so both the fund and the grant grow by 3% a year.',
  },
];

export const independent = [
  {
    id: 'f04-perp-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does the growing-perpetuity formula C₁ ÷ (r − g) require the growth rate to be below the discount rate?',
    options: [
      'Otherwise each payment is worth at least as much today as the one before, so the sum of present values never settles',
      'Because a negative denominator is not allowed in finance',
      'Because growth rates are always smaller than interest rates in practice',
      'It does not: the formula works for any growth rate',
    ],
    answer: 0,
    feedback: {
      1: 'A negative result is a symptom, not the reason. The reason is that the infinite sum does not converge.',
      2: 'Growth can exceed a discount rate for a while; the formula assumes it does so for ever, which is the problem.',
      3: 'At g ≥ r the formula gives infinity or a negative number, neither of which is a value.',
    },
    solution: 'Each payment’s present value is the previous one’s × (1 + g) ÷ (1 + r). If g < r, the present values shrink geometrically and add up to C₁ ÷ (r − g). If g ≥ r they never shrink, and the infinite sum has no finite value.',
  },
  {
    id: 'f04-perp-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional preferred share pays a fixed $4.00 a year for ever and trades at $62.50. What annual return does a buyer at that price expect? Give a percentage to one decimal place.',
    answer: 6.4, check: () => 4 / 62.5 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 15.6, say: 'You divided the price by the dividend. The return is dividend ÷ price.' }],
    solution: 'For a level perpetuity P = D ÷ r, so r = D ÷ P = 4.00 ÷ 62.50 = 0.064, or 6.4% a year.',
  },
  {
    id: 'f04-perp-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional company’s shares trade at $40.00. Its next dividend, due in a year, is expected to be $1.60, and investors require 8% a year. If the price reflects the Gordon growth model, what growth rate does the market expect? Give a percentage.',
    answer: 4, check: () => (0.08 - 1.6 / 40) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 12, say: 'You added the dividend yield to the required return. The required return equals the yield plus growth, so growth = r − yield.' },
      { value: 8, say: 'That is the required return. Subtract the 4% dividend yield.' },
    ],
    solution: 'r = D₁ ÷ P₀ + g, so g = r − D₁ ÷ P₀ = 8% − 1.60 ÷ 40 = 8% − 4% = 4%.',
  },
  {
    id: 'f04-perp-i4', type: 'num', kind: 'applied',
    prompt: 'A fictional manufacturer expects to generate $650 million of cash for its investors next year, growing at 3% a year for ever. Investors in such businesses require 9% a year. What value does a single-stage growing-perpetuity model give, in $ millions? Round to two decimal places.',
    answer: 10833.33, check: () => 650 / (0.09 - 0.03), unit: '$m', places: 2, tol: 0.5,
    wrong: [
      { value: 7222.22, say: 'You divided by r alone. With growth, divide by r − g = 6%.' },
      { value: 11158.33, say: 'You grew the $650 million first. It is already next year’s figure (C₁).' },
      { value: 5416.67, say: 'You added g to r. The denominator is r − g = 0.09 − 0.03 = 0.06.' },
    ],
    solution: 'Value = 650 ÷ (0.09 − 0.03) = 650 ÷ 0.06 ≈ $10,833.33 million. At 10% the value would be 650 ÷ 0.07 ≈ $9,285.71 million: one percentage point on the rate moves the value by about $1,548 million, which is why such a model should be shown with a range.',
  },
  {
    id: 'f04-perp-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each stream of payments.',
    items: [
      'A fixed $3 annual dividend on a preferred share with no maturity date, next paid in a year',
      'A scholarship that rises with inflation every year, for ever',
      'Twenty-four monthly instalments on a coffee brewer',
      'Ground rent fixed at $12,000 a year for ever, paid at the start of each year, the first payment today',
      'A mature company’s dividend, expected to grow at 3% a year indefinitely',
    ],
    categories: ['Level perpetuity', 'Growing perpetuity', 'Annuity (a fixed number of payments)', 'Perpetuity due'],
    answer: [0, 1, 2, 3, 1],
    feedback: {
      2: 'It ends after 24 payments, so it is an annuity, not a perpetuity.',
      3: 'Level payments for ever, with the first one today: a perpetuity due.',
      4: 'Payments for ever that grow at a constant rate: a growing perpetuity (the Gordon model).',
    },
    solution: 'Preferred dividend: level perpetuity. Inflation-linked scholarship and the growing dividend: growing perpetuities. Brewer instalments: annuity. Ground rent paid in advance from today: perpetuity due.',
  },
  {
    id: 'f04-perp-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional ground rent is fixed at $12,000 a year for ever, paid at the start of each year with the first payment today. At 6% a year, what is it worth today? Give dollars and cents.',
    answer: 212000, check: () => 12000 + 12000 / 0.06, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 200000, say: 'That is the ordinary perpetuity, with the first payment in a year. Add today’s payment.' },
      { value: 224720, say: 'You multiplied 212,000 by 1.06 again. A perpetuity due is C + C ÷ r = C(1 + r) ÷ r.' },
    ],
    solution: 'Perpetuity due = C + C ÷ r = 12,000 + 12,000 ÷ 0.06 = 12,000 + 200,000 = $212,000.',
  },
];

export const check = [
  {
    id: 'f04-perp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'The formula C ÷ r gives the value of a level perpetuity at which date?',
    options: [
      'One period before the first payment',
      'On the date of the first payment',
      'On the date of the last payment',
      'It depends on the size of the payment',
    ],
    answer: 0,
    feedback: {
      1: 'On the date of the first payment the value would include that payment: C + C ÷ r.',
      2: 'A perpetuity has no last payment.',
      3: 'The size of the payment scales the value but does not change its date.',
    },
    solution: 'C ÷ r values the stream one period before its first payment. If the first payment is today, add it (perpetuity due); if it is later, discount C ÷ r from one period before it to today.',
  },
  {
    id: 'f04-perp-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional preferred share pays a fixed dividend of $0.90 every quarter, for ever, the next one in three months. Investors require 7.2% a year compounded quarterly. What is the share worth? Give dollars and cents.',
    answer: 50, check: () => 0.9 / (0.072 / 4), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 12.5, say: 'You divided the quarterly dividend by the annual rate. Use the quarterly rate, 1.8%.' },
      { value: 200, say: 'You divided the annual dividend ($3.60) by the quarterly rate. Use matching periods.' },
    ],
    solution: 'Quarterly rate = 7.2% ÷ 4 = 1.8%. Value = 0.90 ÷ 0.018 = $50.00. (Annual dividend $3.60 ÷ 7.2% gives the same answer here because the rate is a nominal rate compounded quarterly.)',
  },
  {
    id: 'f04-perp-k3', type: 'num', kind: 'numerical',
    prompt: 'A growing perpetuity’s first payment is $100 and the discount rate is 8%. By what percentage does its value rise if the expected growth rate rises from 3% to 4%? Give a percentage.',
    answer: 25, check: () => (100 / 0.04 / (100 / 0.05) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 1, say: 'The growth rate rises by one percentage point, but the value depends on 1 ÷ (r − g), which changes far more.' },
      { value: 500, say: 'That is the rise in dollars, from $2,000 to $2,500. Express it as a percentage of $2,000.' },
      { value: 20, say: 'That is the fall from $2,500 to $2,000 as a share of $2,500. Measure the rise from the starting value, $2,000.' },
    ],
    solution: 'At g = 3%: 100 ÷ 0.05 = $2,000. At g = 4%: 100 ÷ 0.04 = $2,500. Rise = 500 ÷ 2,000 = 25%. A one-point change in g cuts r − g from 5% to 4%, a fifth of the gap, and so raises the value by a quarter.',
  },
  {
    id: 'f04-perp-k4', type: 'num', kind: 'applied',
    prompt: 'An investor forecasts a fictional laundrette chain in detail for four years. From year 5 she expects cash flow of $200,000, growing at 2% a year for ever, and she discounts at 9%. What is the present value today of all the cash flows from year 5 on? Give your answer to the nearest dollar.',
    answer: 2024072, check: () => 200000 / (0.09 - 0.02) / 1.09 ** 4, unit: '$', places: 0, tol: 150,
    wrong: [
      { value: 2857142.86, say: 'That is the terminal value at year 4. Discount it four years to today.' },
      { value: 1856946.82, say: 'You discounted five years. The terminal value sits at year 4, one year before the first cash flow it values.' },
      { value: 2064553.47, say: 'You grew the $200,000 first. It is already the year-5 cash flow (CF at N + 1).' },
    ],
    solution: 'TV₄ = CF₅ ÷ (r − g) = 200,000 ÷ 0.07 ≈ $2,857,142.86. PV = 2,857,142.86 ÷ 1.09⁴ = 2,857,142.86 ÷ 1.411582 ≈ $2,024,072 to the nearest dollar.',
  },
  {
    id: 'f04-perp-k5', type: 'mc', kind: 'applied',
    prompt: 'An analyst values a fictional software company with a terminal value that assumes 6.5% growth for ever and a 7% discount rate. Which criticism is the most important?',
    options: [
      'With r − g at only 0.5%, the value is hugely sensitive to the inputs, and 6.5% growth for ever is implausibly high',
      'There is no problem: the growth rate is below the discount rate, which is all the formula needs to give a finite value',
      'The terminal value should be discounted at the growth rate, not the discount rate',
      'A higher growth assumption always makes a valuation more conservative, so assuming 6.5% growth is the cautious choice here',
    ],
    answer: 0,
    feedback: {
      1: 'g < r makes the formula usable, not the assumption sensible. A 0.5-point gap means that narrowing it by 0.25 points doubles the value, and narrowing it by 0.5 points makes it infinite.',
      2: 'Cash flows are discounted at the required return; the growth rate only enters through r − g.',
      3: 'A higher growth rate raises the value: it is an aggressive assumption, not a conservative one.',
    },
    solution: 'The terminal value is C₁ ÷ 0.005 = 200 × C₁. A 0.5-point rise in g would make it infinite; a 0.5-point fall would halve it. And no business can grow faster than the economy for ever. The analyst should use a lower long-run growth rate and show a range of values.',
  },
  {
    id: 'f04-perp-k6', type: 'num', kind: 'numerical',
    prompt: 'What is the present value, at 5% a year, of $1,000 a year for ever with the first payment ten years from today? Give dollars and cents.',
    answer: 12892.18, check: () => 1000 / 0.05 / 1.05 ** 9, unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 12278.27, say: 'You discounted ten years. C ÷ r already values the stream at year 9, one year before the first payment.' },
      { value: 20000, say: 'That is the value at year 9. Discount it to today.' },
    ],
    solution: 'Value at year 9 = 1,000 ÷ 0.05 = $20,000. Today: 20,000 ÷ 1.05⁹ = 20,000 ÷ 1.551328 ≈ $12,892.18.',
  },
];
