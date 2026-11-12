// assess-m2.js — F06 module 2 test: Risk and return (measuring-returns, measuring-risk).
// No hints. Each item has a full solution, shown when the student reviews the test. New questions, not copies of the
// lesson exercises. The fund returns are SIMULATED (case.js, tools/study/f06-data.py); every business and person named
// here is fictional.
import { MONTHS, SERIES, DERIVED } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { normCdf } from '../../../core/inference.js?v=31';

const r4 = (v) => Math.round(v * 1e4) / 1e4;
const B22 = MONTHS.map((m, i) => (m.startsWith('2022') ? i : -1)).filter((i) => i >= 0);
const bondCells = (() => { const c = { A1: 'Month', B1: 'Bond fund' }; B22.forEach((i, k) => { c[`A${k + 2}`] = MONTHS[i]; c[`B${k + 2}`] = r4(SERIES.bonds[i]); }); c.A15 = 'Return for 2022'; return c; })();
const VALS = [100, 104, 101, 108, 99, 93, 97, 110, 106, 112, 103, 115];
const ddCells = (() => { const c = { A1: 'Month-end', B1: 'Value ($)', C1: 'Drawdown' }; VALS.forEach((v, i) => { c[`A${i + 2}`] = `Month ${i + 1}`; c[`B${i + 2}`] = v; }); return c; })();
const M = SERIES.market, mM = IV.arithmetic(M), sM = Math.sqrt(M.reduce((s, v) => s + (v - mM) ** 2, 0) / (M.length - 1));
const SCEN = [{ p: 0.2, r: 0.32 }, { p: 0.45, r: 0.11 }, { p: 0.25, r: -0.04 }, { p: 0.1, r: -0.28 }];

export const items = [
  {
    id: 'f06-m2-1', lesson: 'measuring-returns', type: 'num', kind: 'numerical',
    prompt: 'Halloway Water (fictional) has a bond that an investor bought at $98.50 per $100 of face value. Over the next year she received $4.50 of coupons, and at the end of the year the bond’s price was $101.00. What was her holding-period return? Give a percentage to two decimal places.',
    answer: 7.11, check: () => IV.hpr(98.5, 101, 4.5) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 4.57, say: 'That is the coupon income alone (4.50 ÷ 98.50). The price also rose by $2.50.' },
      { value: 2.54, say: 'That is the price return alone. Coupons are part of a bond’s total return.' },
      { value: 6.93, say: 'That divides by the ending price, $101.00. Returns are measured on what was paid.' },
    ],
    solution: '(101.00 − 98.50 + 4.50) ÷ 98.50 = 7.00 ÷ 98.50 = 7.11%: a price return of 2.54% and an income return of 4.57%.',
  },
  {
    id: 'f06-m2-2', lesson: 'measuring-returns', type: 'mc', kind: 'conceptual',
    prompt: 'An advertisement for a fictional fund says it returned “12% a year on average” over the last ten years. Over the same ten years, $1 in the fund grew to $2.59. Which statement is correct?',
    options: [
      'It is an arithmetic mean; money in the fund grew about 10% a year compounded',
      'The two figures contradict each other, so one of them must be wrong',
      'The fund grew 12% a year compounded, and $2.59 must exclude reinvested dividends',
      'Money in the fund grew at 15.9% a year, the $1.59 gain divided by ten years',
    ],
    answer: 0,
    feedback: {
      1: 'They are consistent: an arithmetic mean above the compound rate is exactly what varying returns produce.',
      2: 'Twelve per cent compounded for ten years would turn $1 into $3.11, not $2.59. The 12% is a simple average of yearly returns.',
      3: 'Dividing a cumulative gain by the number of years ignores compounding; and it is not the compound rate either.',
    },
    solution: 'The compound rate is 2.59^(1/10) − 1 = 10.0% a year. The arithmetic mean of volatile yearly returns is higher, so “12% on average” is true but overstates how money in the fund actually grew, by about 2 points a year.',
  },
  {
    id: 'f06-m2-3', lesson: 'measuring-returns', type: 'num', kind: 'applied',
    prompt: 'Ana’s colleague Tomas (fictional) has $50,000 in a pension fund. He assumes it will grow at 7% a year compounded for 20 years and that inflation will average 2.8% a year. What would the fund be worth in 20 years, in today’s dollars? Give dollars to the nearest dollar.',
    answer: 111374, check: () => 50000 * (1.07 / 1.028) ** 20, unit: '$', places: 0, tol: 5,
    wrong: [
      { value: 193484, say: 'That is the value in dollars of 20 years’ time. Deflate it by 1.028^20 to get today’s purchasing power.' },
      { value: 113848, say: 'That compounds at 7% − 2.8% = 4.2%. The exact real rate is 1.07 ÷ 1.028 − 1 = 4.09%.' },
    ],
    solution: 'Real rate 1.07 ÷ 1.028 − 1 = 4.086% a year. 50,000 × 1.04086^20 = $111,374 in today’s dollars. Equivalently, the nominal $193,484 divided by 1.028^20 = 1.737.',
  },
  {
    id: 'f06-m2-4', lesson: 'measuring-returns', type: 'formula', kind: 'applied',
    prompt: 'B2:B13 hold the simulated bond fund’s twelve monthly total returns for 2022. In B15, write one formula that returns its total return for the calendar year.',
    sheet: { cells: bondCells },
    cell: 'B15', view: 'A1:B15', widths: { A: 18, B: 12 }, formats: { B: '0.00%', B15: '0.0%' },
    answer: '=PRODUCT(1+B2:B13)-1',
    alt: ['=PRODUCT(B2:B13+1)-1', '=GEOMEAN(1+B2:B13)^12-1'],
    wrong: [
      { formula: '=SUM(B2:B13)', say: 'Adding monthly returns ignores compounding: each month’s return applies to a balance changed by the months before. Multiply the growth factors.' },
      { formula: '=AVERAGE(B2:B13)*12', say: 'Twelve times the mean is this course’s convention for an annual arithmetic mean, not the year’s actual return. Compound the months.' },
      { formula: '=PRODUCT(1+B2:B13)', say: 'That is the growth of $1 over the year. Subtract 1 to turn it into a return.' },
    ],
    solution: '<x>=PRODUCT(1+B2:B13)-1</x> links the twelve months: (1 + r₁)(1 + r₂)…(1 + r₁₂) − 1 = −13.0%, the fall the simulation planted for 2022, when rising interest rates lowered bond prices. Adding the months gives −13.7%.',
  },
  {
    id: 'f06-m2-5', lesson: 'measuring-returns', type: 'num', kind: 'numerical',
    prompt: 'A fictional strategist gives the international share fund four scenarios for next year: +32% (probability 0.20), +11% (0.45), −4% (0.25) and −28% (0.10). One-year bills yield 3.8%. What is the fund’s expected excess return over bills? Give a percentage to two decimal places.',
    answer: 3.75, check: () => (IV.scenarios(SCEN).er - 0.038) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 7.55, say: 'That is the expected return. Subtract the 3.8% bill yield for the excess return.' },
      { value: 2.75, say: 'That is the simple average of the four outcomes. Weight each scenario by its probability, then subtract the 3.8% bill yield.' },
    ],
    solution: 'E(r) = 0.20 × 32 + 0.45 × 11 + 0.25 × (−4) + 0.10 × (−28) = 6.4 + 4.95 − 1.0 − 2.8 = 7.55%. Expected excess return 7.55% − 3.8% = 3.75%.',
  },
  {
    id: 'f06-m2-6', lesson: 'measuring-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional property fund reports its returns quarterly. Their standard deviation is 5.5% a quarter. Assuming independent quarters, what is its volatility a year? Give a percentage to one decimal place.',
    answer: 11.0, check: () => IV.annualise.sd(0.055, 4) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 22, say: 'That multiplies by 4. Standard deviations scale with the square root of the number of periods: √4 = 2.' },
      { value: 19.1, say: 'That uses √12, for monthly data. There are four quarters in a year.' },
    ],
    solution: '5.5% × √4 = 11.0% a year. (Returns of funds that value their assets only occasionally often look smoother than the assets really are, so a figure like this can understate the true risk.)',
  },
  {
    id: 'f06-m2-7', lesson: 'measuring-risk', type: 'classify', kind: 'conceptual',
    prompt: 'Which measure answers each investor’s question best?',
    items: [
      '“How far below its best value could my investment have fallen?”',
      '“Typically, how far does a year’s return stray from the average?”',
      '“What return is the probability-weighted centre of next year’s outcomes?”',
      '“What was the single worst January-to-December result?”',
      '“How much could I have lost if I had bought at the top?”',
    ],
    categories: ['Volatility (standard deviation)', 'Maximum drawdown', 'Worst calendar year', 'Expected return'],
    answer: [1, 0, 3, 2, 1],
    feedback: {
      0: 'A fall from a previous peak is a drawdown; the largest is the maximum drawdown.',
      1: 'The typical distance from the mean is the standard deviation.',
      2: 'A probability-weighted average of outcomes is an expected return.',
      3: 'A fixed calendar period: the worst calendar year. It can miss falls that span two years.',
      4: 'Buying at the peak and holding to the trough is exactly the maximum drawdown.',
    },
    solution: 'Drawdown questions (peak to later low): items 1 and 5. Spread around the mean: volatility. Probability-weighted centre: expected return. A fixed January–December window: worst calendar year.',
  },
  {
    id: 'f06-m2-8', lesson: 'measuring-risk', type: 'num', kind: 'applied',
    prompt: 'The simulated market fund’s monthly returns have a mean of 0.869% and a standard deviation of 4.618%. If they were normally distributed, how many of its 180 months would you expect to be worse than −15%? Give two decimal places.',
    answer: 0.05, check: () => 180 * normCdf((-0.15 - mM) / sM), unit: 'months', places: 2, tol: 0.01,
    wrong: [
      { value: 179.95, say: 'That counts the months better than −15%. You want the area below −15%.' },
      { value: 0.0003, say: 'That is the probability for one month. Multiply by the 180 months.' },
    ],
    solution: 'z = (−15 − 0.869) ÷ 4.618 = −3.44; P(z < −3.44) ≈ 0.0003, so 180 × 0.0003 ≈ 0.05 months: about one such month in 3,500. The simulated history had one (March 2020, −17.0%), as fat tails make likely; at −10% the normal and the data agree better (1.7 expected, 2 actual). The normal curve fails most in the extremes.',
  },
  {
    id: 'f06-m2-9', lesson: 'measuring-risk', type: 'mc', kind: 'applied',
    prompt: 'Which of these fictional organisations has matched its money to its time horizon best?',
    options: [
      'A hotel holding next year’s renovation budget in bank deposits that mature before the work starts',
      'A couple keeping the deposit for a house they will buy next spring in a share index fund, for its higher average return',
      'A charity with a permanent endowment keeping all of it in one-month bills because shares can fall 40%',
      'A café owner putting her three-month emergency fund into a single listed share she knows well',
    ],
    answer: 0,
    feedback: {
      1: 'The house deposit is needed within a year: a share fund can lose a large part of its value in that time.',
      2: 'A permanent endowment has the longest horizon there is: it can ride out drawdowns, and in bills it may lose to inflation for decades.',
      3: 'An emergency fund must be available at full value at once, and a single share adds company risk on top of market risk.',
    },
    solution: 'Money needed on a known, near date belongs where its value on that date is safe; long-horizon money can take risk it has time to recover from. The hotel matches maturity to need; the others mismatch in one direction or the other.',
  },
  {
    id: 'f06-m2-10', lesson: 'measuring-risk', type: 'num', kind: 'numerical',
    prompt: 'The simulated market fund’s maximum drawdown was −39.1%. What percentage gain did it then need to get back to its previous peak? Give a percentage to one decimal place.',
    answer: 64.2, check: () => (1 / (1 + DERIVED.drawdown.market.drawdown) - 1) * 100, unit: '%', places: 1, tol: 0.2,
    wrong: [{ value: 39.1, say: 'A gain is measured on the lower value. From 60.9% of the peak, regaining it takes 1 ÷ 0.609 − 1.' }],
    solution: 'After a 39.1% fall, $1 of peak value is $0.609. Back to $1 needs 1 ÷ 0.609 − 1 = 64.2%. Losses need larger gains to recover, one reason volatility costs compound growth.',
  },
  {
    id: 'f06-m2-11', lesson: 'measuring-risk', type: 'formula', kind: 'applied',
    prompt: 'B2:B13 hold a fictional fund’s month-end values. In C2, write a formula for the drawdown at that month-end (its value relative to the highest value so far, minus 1) that can be filled down to C13.',
    sheet: { cells: ddCells },
    cell: 'C2', fill: 'C2:C13', view: 'A1:C13', widths: { A: 12, B: 10, C: 11 }, formats: { C: '0.0%' },
    answer: '=B2/MAX($B$2:B2)-1',
    alt: ['=B2/MAX(B$2:B2)-1', '=(B2-MAX($B$2:B2))/MAX($B$2:B2)'],
    wrong: [
      { formula: '=B2/MAX($B$2:$B$13)-1', say: 'That compares each value with the highest value of the whole period, including later ones. A drawdown uses only the peak so far: anchor the start of the range and let its end move.' },
      { formula: '=B2/MAX(B2:B13)-1', say: 'That looks forward from each month. The peak must come from the months up to and including this one: MAX($B$2:B2).' },
      { formula: '=B2/$B$2-1', say: 'That measures from the first value, not from the highest value so far.' },
    ],
    solution: '<x>=B2/MAX($B$2:B2)-1</x>, filled down: the range grows with each row, so MAX finds the highest value so far. The most negative result, −13.9% in month 6 (93 against the peak of 108), is the maximum drawdown.',
  },
  {
    id: 'f06-m2-12', lesson: 'measuring-risk', type: 'mc', kind: 'conceptual',
    prompt: 'Why does this course multiply a monthly standard deviation by √12 to annualise it, but a monthly arithmetic mean by 12?',
    options: [
      'With independent months variances add, so the SD grows with the square root of time',
      'Standard deviations are always smaller than means, so they need a smaller factor',
      'The square root corrects for dividing by n − 1 rather than n when the standard deviation is estimated from a sample',
      'Twelve would double-count the months, because the SD is already measured on a whole year',
    ],
    answer: 0,
    feedback: {
      1: 'The size of the SD has nothing to do with it; the rule comes from how variances combine.',
      2: 'The n − 1 correction is about estimating from a sample, not about changing the time period.',
      3: 'A monthly SD is measured on monthly returns. Annualising scales it up; the question is by how much.',
    },
    solution: 'The mean of a sum of twelve months is twelve times the monthly mean; the variance of a sum of twelve independent months is twelve times the monthly variance, so the SD is √12 times the monthly SD. If months are not independent (trends, or swings that reverse), the √12 rule is only an approximation.',
  },
];
