// measuring-returns.ex.js — F06 · Measuring returns: widgets, practice and the knowledge check (answer keys live here).
// The fund and share returns are SIMULATED (case.js, tools/study/f06-data.py); every business named here is fictional.
import { MONTHS, SERIES, ANA, DERIVED } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const st = DERIVED.stats;
const yr = (k) => IV.yearly(MONTHS, SERIES[k]);
const pct = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(d)}%`;
const money = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
const r4 = (v) => Math.round(v * 1e4) / 1e4;

// the market fund’s calendar years, for the sheet items (rounded to 0.01%)
const MKT_YEARS = yr('market');
const yearCells = (() => {
  const c = { A1: 'Year', B1: 'Total return' };
  MKT_YEARS.forEach((y, i) => { c[`A${i + 2}`] = `${y.year}`; c[`B${i + 2}`] = r4(y.ret); });
  return c;
})();
const geoOf = (arr) => IV.geometric(arr);
// 2027’s twelve months, market and bills
const M27 = MONTHS.slice(-12), MK27 = SERIES.market.slice(-12).map(r4), BL27 = SERIES.bills.slice(-12).map((v) => Math.round(v * 1e6) / 1e6);
const excessCells = (() => {
  const c = { A1: 'Month', B1: 'Market fund', C1: 'Bills' };
  M27.forEach((m, i) => { c[`A${i + 2}`] = m; c[`B${i + 2}`] = MK27[i]; c[`C${i + 2}`] = BL27[i]; });
  c.A15 = 'Mean excess return, a year';
  return c;
})();

export const widgets = {
  'ret-growth': {
    type: 'chart', kind: 'line',
    title: 'Growth of $1, January 2013 – December 2027 (simulated)',
    x: { label: 'Years from 1 January 2013', values: Array.from({ length: 16 }, (_, i) => i) },
    series: [
      { name: 'Market', values: IV.wealth(yr('market').map((y) => y.ret)).map((v) => Math.round(v * 100) / 100) },
      { name: 'Bonds', values: IV.wealth(yr('bonds').map((y) => y.ret)).map((v) => Math.round(v * 100) / 100) },
      { name: 'Bills', values: IV.wealth(yr('bills').map((y) => y.ret)).map((v) => Math.round(v * 100) / 100) },
    ],
    y: { label: 'Value of $1 ($)', format: 'money' },
    note: 'Market: the Harbourline Total Market Index Fund; Bonds: the Harbourline Aggregate Bond Index Fund; Bills: one-month bills. Total returns after fees, all income reinvested. Simulated for teaching: not real market history.',
  },
  'ret-years': {
    type: 'chart', kind: 'line',
    title: 'Calendar-year total returns (simulated)',
    x: { label: 'Calendar year', values: MKT_YEARS.map((y) => +y.year), format: 'year' },
    series: [
      { name: 'Market', values: MKT_YEARS.map((y) => Math.round(y.ret * 1000) / 10) },
      { name: 'Bonds', values: yr('bonds').map((y) => Math.round(y.ret * 1000) / 10) },
    ],
    y: { label: 'Total return (%)', format: 'pct' },
    note: 'Arithmetic mean of the market fund’s fifteen years: 11.19%; geometric mean: 9.57%. Bond fund: 4.46% and 4.31%. Simulated for teaching.',
  },
  'ret-drag': {
    type: 'formula',
    title: 'Volatility drag: arithmetic mean against compound growth',
    intro: 'Returns with a given arithmetic mean and standard deviation a year. The compound growth rate is approximately the mean minus half the variance; the chart follows a sum at each rate.',
    inputs: [
      { id: 'a', label: 'Arithmetic mean return a year', min: 0, max: 20, step: 0.5, value: 11, fmt: 'pct' },
      { id: 'sd', label: 'Standard deviation a year', min: 0, max: 40, step: 1, value: 19, fmt: 'pct' },
      { id: 'yrs', label: 'Years', min: 1, max: 40, step: 1, value: 30, fmt: 'int', unit: 'years' },
      { id: 'amt', label: 'Amount invested', min: 1000, max: 100000, step: 1000, value: 10000, fmt: 'money' },
    ],
    compute: (v) => {
      const a = v.a / 100, s = v.sd / 100, g = a - s * s / 2;
      const ys = Array.from({ length: v.yrs + 1 }, (_, i) => i);
      const endA = v.amt * (1 + a) ** v.yrs, endG = v.amt * (1 + g) ** v.yrs;
      let note = `Swings of ${v.sd}% a year cost about ${(s * s / 2 * 100).toFixed(2)} points a year of compound growth. `;
      if (s === 0) note = 'With no variation every year earns the same, so the arithmetic and geometric means are equal. ';
      note += g < 0 ? 'Here the compound rate is negative: on a typical path the money shrinks even though the average year gains.' : `On a typical path ${money(v.amt)} grows to about ${money(endG)}; compounding the arithmetic mean suggests ${money(endA)}, the average over all paths, which a few very good ones pull up.`;
      return {
        headline: { label: 'Approximate compound growth a year', value: pct(g) },
        rows: [
          ['Arithmetic mean', pct(a)],
          ['Half the variance (½σ²)', pct(s * s / 2)],
          [`Value after ${v.yrs} years at the arithmetic mean`, money(endA)],
          [`Value after ${v.yrs} years at the compound rate`, money(endG)],
        ],
        note,
        chart: { kind: 'line', x: { label: 'Years', values: ys },
          series: s === 0 ? [{ name: 'Both rates', values: ys.map((t) => Math.round(v.amt * (1 + a) ** t)) }] : [{ name: 'Arithmetic', values: ys.map((t) => Math.round(v.amt * (1 + a) ** t)) }, { name: 'Compound', values: ys.map((t) => Math.round(v.amt * (1 + g) ** t)) }],
          y: { label: 'Value ($)', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f06-ret-g1', type: 'steps', kind: 'numerical',
    prompt: 'Glasshouse Studios, a fictional listed games developer, traded at $25.00 when Ana’s cousin bought it. Over the following year it paid dividends of $0.60 a share, and at the end of the year it traded at $23.50.',
    solution: 'Price return (23.50 − 25.00) ÷ 25.00 = −6.0%; income return 0.60 ÷ 25.00 = 2.4%; holding-period return −6.0% + 2.4% = −3.6%. The dividend softened the fall but did not cover it.',
    steps: [
      { id: 'f06-ret-g1-s1', type: 'num', prompt: 'What was the price return? Give a percentage to one decimal place.',
        answer: -6.0, check: () => (23.5 - 25) / 25 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Price return = (end price − start price) ÷ start price.', '(23.50 − 25.00) ÷ 25.00.'],
        wrong: [{ value: 6.0, say: 'The price fell, so the price return is negative.' }, { value: -6.38, say: 'That divides by the ending price. Returns are measured on what was paid, $25.00.' }] },
      { id: 'f06-ret-g1-s2', type: 'num', prompt: 'What was the income return (the dividend yield on the purchase price)? Give a percentage to one decimal place.',
        answer: 2.4, check: () => 0.6 / 25 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Income ÷ start price.'],
        wrong: [{ value: 2.55, say: 'That divides by the ending price. Use the $25.00 paid.' }] },
      { id: 'f06-ret-g1-s3', type: 'num', prompt: 'What was the holding-period return? Give a percentage to one decimal place.',
        answer: -3.6, check: () => IV.hpr(25, 23.5, 0.6) * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Add the price return and the income return.', '(23.50 − 25.00 + 0.60) ÷ 25.00.'],
        wrong: [{ value: -6.0, say: 'That is the price return alone; add the dividend.' }, { value: -8.4, say: 'The dividend is income received, so it adds to the return rather than reducing it.' }] },
    ],
  },
  {
    id: 'f06-ret-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional fund returned +20%, −10%, +25% and −15% in four successive years.',
    solution: 'Arithmetic mean (20 − 10 + 25 − 15) ÷ 4 = 5.0%. Growth of $1,000: 1,000 × 1.20 × 0.90 × 1.25 × 0.85 = $1,147.50. Geometric mean 1.1475^(1/4) − 1 = 3.50%. Compounding 5% for four years would have given $1,215.51, which is not what happened.',
    steps: [
      { id: 'f06-ret-g2-s1', type: 'num', prompt: 'What is the arithmetic mean return? Give a percentage to one decimal place.',
        answer: 5.0, check: () => (20 - 10 + 25 - 15) / 4, unit: '%', places: 1, tol: 0.05,
        hints: ['Add the four returns, with their signs, and divide by 4.'],
        wrong: [{ value: 17.5, say: 'Losses count as negative numbers: −10 and −15.' }] },
      { id: 'f06-ret-g2-s2', type: 'num', prompt: 'What did $1,000 invested at the start become after the four years? Give dollars to the cent.',
        answer: 1147.5, check: () => IV.wealth([0.2, -0.1, 0.25, -0.15], 1000).at(-1), unit: '$', places: 2, tol: 0.01,
        hints: ['Multiply by each growth factor in turn: 1 + return.', '1,000 × 1.20 × 0.90 × 1.25 × 0.85.'],
        wrong: [{ value: 1200, say: 'That adds the returns (20%) instead of compounding the growth factors.' }, { value: 1215.51, say: 'That compounds the arithmetic mean, 5%, four times. The actual path gives less.' }] },
      { id: 'f06-ret-g2-s3', type: 'num', prompt: 'What is the geometric mean return a year? Give a percentage to two decimal places.',
        answer: 3.50, check: () => IV.geometric([0.2, -0.1, 0.25, -0.15]) * 100, unit: '%', places: 2, tol: 0.02,
        hints: ['Take the fourth root of the growth of $1 and subtract 1.', '1.1475^(1/4) − 1.'],
        wrong: [{ value: 3.69, say: 'That divides the 14.75% total by 4. Compound instead: the fourth root of 1.1475.' }, { value: 5.0, say: 'That is the arithmetic mean. The geometric mean is lower whenever returns vary.' }] },
    ],
  },
  {
    id: 'f06-ret-g3', type: 'formula', kind: 'applied',
    prompt: 'B2:B16 hold the simulated total market fund’s calendar-year returns for 2013–2027. In B18, write a formula that returns their geometric mean return a year.',
    sheet: { cells: { ...yearCells, A18: 'Geometric mean' } },
    cell: 'B18', view: 'A1:B18', widths: { A: 18, B: 14 }, formats: { B: '0.0%', B18: '0.00%' },
    answer: '=GEOMEAN(1+B2:B16)-1',
    alt: ['=PRODUCT(1+B2:B16)^(1/15)-1', '=PRODUCT(1+B2:B16)^(1/COUNT(B2:B16))-1'],
    wrong: [
      { formula: '=AVERAGE(B2:B16)', say: 'That is the arithmetic mean, 11.19%. The geometric mean compounds the growth factors 1 + r.' },
      { formula: '=PRODUCT(1+B2:B16)-1', say: 'That is the cumulative return over all fifteen years (293.8%). Take the 15th root of the product first.' },
      { formula: '=PRODUCT(1+B2:B16)^(1/15)', say: 'That is the average growth factor, 1.0957. Subtract 1 to turn it into a return.' },
    ],
    hints: ['GEOMEAN needs positive numbers, and returns can be negative. Work with the growth factors 1 + r.', '=GEOMEAN(1+B2:B16)−1, or =PRODUCT(1+B2:B16)^(1/15)−1.'],
    solution: '<x>=GEOMEAN(1+B2:B16)-1</x> returns 9.57%. Adding 1 turns each return into a growth factor (GEOMEAN returns #NUM! for zero or negative values, so it can’t take the returns themselves); the geometric mean of the factors, less 1, is the compound rate. <x>=PRODUCT(1+B2:B16)^(1/15)-1</x> gives the same answer.',
  },
  {
    id: 'f06-ret-g4', type: 'num', kind: 'applied',
    prompt: 'The simulated International Index Fund grew at 9.11% a year compounded over 2013–2027. Using Ana’s inflation assumption of 2.8% a year, what is that in real terms? Give a percentage to two decimal places.',
    answer: 6.13, check: () => IV.realReturn(st.intl.growth, ANA.inflation) * 100, unit: '%', places: 2, tol: 0.02,
    hints: ['Use the exact Fisher relation, not subtraction.', '1.0911 ÷ 1.028 − 1.'],
    wrong: [{ value: 6.31, say: 'That subtracts inflation (9.11 − 2.8). The exact real return divides the growth factors: 1.0911 ÷ 1.028 − 1.' }, { value: 12.16, say: 'That multiplies by inflation instead of dividing it out.' }],
    solution: '1.0911 ÷ 1.028 − 1 = 6.13% a year. Subtracting gives 6.31%, which slightly overstates the gain in purchasing power.',
  },
];

export const independent = [
  {
    id: 'f06-ret-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional fund’s geometric mean monthly return over ten years was 0.55%. What compound annual growth rate is that? Give a percentage to two decimal places.',
    answer: 6.80, check: () => IV.annualise.geometric(0.0055) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 6.6, say: 'That multiplies by 12. A growth rate compounds: 1.0055^12 − 1.' }],
    solution: '1.0055^12 − 1 = 6.80% a year. Multiplying by 12 is the course’s convention for an arithmetic mean only.',
  },
  {
    id: 'f06-ret-i2', type: 'num', kind: 'numerical',
    prompt: 'An investor bought shares in a fictional bakery chain for $50.00, collected $3.00 a share in dividends over two and a half years, and sold at $62.00. What was the annualised holding-period return? Give a percentage to two decimal places.',
    answer: 11.07, check: () => ((1 + IV.hpr(50, 62, 3)) ** (1 / 2.5) - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 12, say: 'That divides the 30% total by 2.5. Compound instead: 1.30^(1/2.5) − 1.' }, { value: 8.99, say: 'That leaves out the $3.00 of dividends: they are part of the return.' }, { value: 30, say: 'That is the holding-period return over the whole 2.5 years; annualise it.' }],
    solution: 'HPR = (62 − 50 + 3) ÷ 50 = 30%. Annualised: 1.30^(1/2.5) − 1 = 11.07% a year (ignoring when within the period the dividends were paid).',
  },
  {
    id: 'f06-ret-i3', type: 'num', kind: 'numerical',
    prompt: 'An analyst’s fictional scenarios for a bond fund next year: if interest rates fall (probability 0.3) it returns 9%; if they stay steady (0.5), 4%; if they rise (0.2), −6%. What is its expected return? Give a percentage to one decimal place.',
    answer: 3.5, check: () => IV.scenarios([{ p: 0.3, r: 0.09 }, { p: 0.5, r: 0.04 }, { p: 0.2, r: -0.06 }]).er * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 2.33, say: 'That is the simple average of the three outcomes; weight each by its probability.' }, { value: 5.9, say: 'The −6% outcome is a loss: subtract 0.2 × 6%.' }],
    solution: 'E(r) = 0.3 × 9% + 0.5 × 4% + 0.2 × (−6%) = 2.7% + 2.0% − 1.2% = 3.5%. None of the scenarios pays 3.5%; it is the probability-weighted centre.',
  },
  {
    id: 'f06-ret-i4', type: 'formula', kind: 'applied',
    prompt: 'B2:B13 hold the simulated market fund’s monthly returns for 2027 and C2:C13 the one-month bill returns for the same months. In B15, write one formula for the mean monthly excess return, annualised by this course’s convention for arithmetic means.',
    sheet: { cells: excessCells },
    cell: 'B15', view: 'A1:C15', widths: { A: 24, B: 13, C: 11 }, formats: { B: '0.00%', C: '0.000%', B15: '0.00%' },
    answer: '=AVERAGE(B2:B13-C2:C13)*12',
    alt: ['=(AVERAGE(B2:B13)-AVERAGE(C2:C13))*12', '=12*AVERAGE(B2:B13-C2:C13)'],
    wrong: [
      { formula: '=AVERAGE(B2:B13)*12', say: 'That is the market’s mean return, not its excess return. Subtract the bills first.' },
      { formula: '=AVERAGE(B2:B13-C2:C13)', say: 'That is the monthly figure. Multiply by 12 to annualise an arithmetic mean.' },
      { formula: '=((1+AVERAGE(B2:B13-C2:C13))^12-1)', say: 'Compounding is for growth rates. This course annualises an arithmetic mean by multiplying by 12.' },
    ],
    solution: '<x>=AVERAGE(B2:B13-C2:C13)*12</x> gives the mean monthly excess return over 2027 times 12. One year is a very short sample: the same calculation over all fifteen years gives 8.40%.',
  },
  {
    id: 'f06-ret-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Which average answers each question better?',
    items: [
      'What did $10,000 in the fund over the last ten years grow at, a year?',
      'If next year is drawn from the same distribution as the past, what return should Ana expect for that one year?',
      'At what rate should Ana project her account over 30 years?',
      'A fund report’s “annualised 5-year return”.',
      'The input to a one-year scenario analysis of next year’s return.',
    ],
    categories: ['Arithmetic mean', 'Geometric mean'],
    answer: [1, 0, 1, 1, 0],
    feedback: {
      0: 'Growth of money over many years compounds: the geometric mean.',
      1: 'For one period drawn from the same distribution, the arithmetic mean is the expected return.',
      2: 'A typical long-run path grows at about the geometric rate; the arithmetic mean overstates it.',
      3: 'Annualised multi-year returns are compound rates.',
      4: 'One period: the arithmetic (expected) return.',
    },
    solution: 'Geometric for anything about compound growth over many periods (items 1, 3, 4); arithmetic for the expected return of a single period (items 2, 5).',
  },
  {
    id: 'f06-ret-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional share funds both have an arithmetic mean return of 9% a year over the same twenty years. Fund A’s yearly returns had a standard deviation of 12%; Fund B’s, 28%. What can you say about their compound growth?',
    options: ['Fund A grew faster: about 8.3% a year against about 5.1%', 'They grew at the same rate, because their means are equal', 'Fund B grew faster, because higher risk earns a higher return', 'Nothing, without the order in which the returns came'],
    answer: 0,
    feedback: {
      1: 'Equal arithmetic means do not give equal compound growth: swings cost growth, by about half the variance.',
      2: 'Higher risk may come with a higher expected return, but here the means are given as equal. With the same mean, more volatility means less compound growth.',
      3: 'The order of returns does not change the product of the growth factors, so it does not change the geometric mean. The approximation needs only the mean and SD.',
    },
    solution: 'g ≈ r̄ − ½σ²: A ≈ 9% − ½(0.12)² = 8.28%; B ≈ 9% − ½(0.28)² = 5.08%. Over twenty years, $1 grows to about 4.9 in A and 2.7 in B.',
  },
];

export const check = [
  {
    id: 'f06-ret-k1', type: 'mc', kind: 'conceptual',
    prompt: 'When are an investment’s arithmetic and geometric mean returns over the same years equal?',
    options: ['Only when its return was the same in every year', 'Whenever its average return is positive', 'When its returns are total returns rather than price returns', 'When the returns are measured monthly rather than yearly'],
    answer: 0,
    feedback: {
      1: 'Positive or negative, any variation in the returns makes the geometric mean lower.',
      2: 'Total or price returns, the geometric mean falls below the arithmetic as soon as returns vary.',
      3: 'Monthly returns vary too; the gap is smaller per month but still there.',
    },
    solution: 'The geometric mean is below the arithmetic mean whenever the returns vary, by roughly half their variance; with no variation the two are equal.',
  },
  {
    id: 'f06-ret-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional fund returned +12%, −8% and +15% in three years. What is its geometric mean return? Give a percentage to two decimal places.',
    answer: 5.82, check: () => IV.geometric([0.12, -0.08, 0.15]) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 6.33, say: 'That is the arithmetic mean. Multiply the growth factors (1.12 × 0.92 × 1.15) and take the cube root.' }, { value: 18.5, say: 'That is the cumulative return over three years; take the cube root of 1.185 and subtract 1.' }, { value: 6.17, say: 'That divides the 18.5% cumulative return by 3. Take the cube root of 1.185 instead.' }],
    solution: '1.12 × 0.92 × 1.15 = 1.18496, and 1.18496^(1/3) = 1.0582, so the geometric mean is 5.82% a year (check: 1.0582³ = 1.185). The arithmetic mean, 6.33%, is higher.',
  },
  {
    id: 'f06-ret-k3', type: 'num', kind: 'numerical',
    prompt: 'A savings account pays 5% a year while inflation is 2.8%. What is the real return? Give a percentage to two decimal places.',
    answer: 2.14, check: () => IV.realReturn(0.05, 0.028) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [{ value: 2.2, say: 'That subtracts. The exact real return is 1.05 ÷ 1.028 − 1.' }],
    solution: '1.05 ÷ 1.028 − 1 = 2.14%.',
  },
  {
    id: 'f06-ret-k4', type: 'num', kind: 'applied',
    prompt: 'Over the same five years (simulated), a fund’s arithmetic mean return was 7.9% a year and one-month bills averaged 2.6% a year. What was its mean excess return, the historical estimate of its risk premium over bills? Give a percentage to one decimal place.',
    answer: 5.3, check: () => 7.9 - 2.6, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 10.5, say: 'An excess return subtracts the risk-free return; it does not add it.' }],
    solution: '7.9% − 2.6% = 5.3% a year over bills, for those five years. It is an estimate from one short period, and it is measured over bills, not long-term bonds.',
  },
  {
    id: 'f06-ret-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana wants to tell her accountant what her retirement account might be worth in 30 years in money she can compare with today’s prices. Which rate should she compound her deposits at?',
    options: ['An assumed geometric mean return, converted to a real rate with her inflation assumption', 'The arithmetic mean of past yearly returns, because it is the expected return', 'The geometric mean nominal return, then subtract 2.8% from the final value once', 'The best five-year annualised return in the history, since she will be invested for longer than five years'],
    answer: 0,
    feedback: {
      1: 'Compounding the arithmetic mean projects the average across all possible paths, pulled up by a few very good ones; a typical path grows at about the geometric rate.',
      2: 'Inflation compounds too: over 30 years it cuts purchasing power by far more than 2.8%. Deflate the rate, or deflate the final value by 1.028³⁰.',
      3: 'Picking the best period builds in luck; plan with a central estimate and test lower ones.',
    },
    solution: 'A geometric (compound) rate describes how money typically grows over many years, and a real rate puts the result in today’s dollars. With the simulated market history that is 6.58% a year.',
  },
  {
    id: 'f06-ret-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statement.',
    text: 'A holding-period return adds the [[0]] to the change in price and divides by the [[1]] price. Over several years it is annualised by [[2]].',
    blanks: [
      { options: ['income received', 'income tax paid', 'number of shares'], answer: 0 },
      { options: ['ending', 'starting', 'average'], answer: 1 },
      { options: ['dividing by the number of years', 'taking the root for the number of years', 'multiplying by 12'], answer: 1 },
    ],
    solution: 'HPR = (P₁ − P₀ + D) ÷ P₀; annualised, (1 + HPR)^(1/T) − 1.',
  },
];
