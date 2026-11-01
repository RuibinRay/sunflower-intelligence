// assess-m1.js — B06 module 1 test: Fitting a line (least-squares-line, residuals-and-r-squared). New questions on new
// scenarios, not copies of lesson exercises. No hints; solutions are shown when the student reviews the test. Café data
// come from case.js (the corrected log); every other business, person and number is fictional. Formula items are
// marked by their results (core/sheet.js gradeFormula); every num item's `check` recomputes its answer.
import { CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=22';
import * as R from '../../../core/regression.js?v=22';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const win = (cafe, from, to) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;

// Millbrook, 3–26 May 2027: footfall → transactions (rescaling the slope)
const MAY = win('Millbrook', '2027-05-03', '2027-05-26');
const yF = MAY.map((r) => r[at('footfall')]), yT = MAY.map((r) => r[at('transactions')]);
const MF = R.fit(yT, { x: yF });
const maySheet = { cells: { A1: 'Date', B1: 'Footfall', C1: 'Transactions', ...col('A', 2, MAY.map((r) => short(r[at('date')]))), ...col('B', 2, yF), ...col('C', 2, yT), E1: 'Transactions per 100 visitors' } };
// Harbourside, 1–24 April 2027: footfall → transactions (residuals by TREND)
const APR = win('Harbourside', '2027-04-01', '2027-04-24');
const aF = APR.map((r) => r[at('footfall')]), aT = APR.map((r) => r[at('transactions')]);
const AF = R.fit(aT, { x: aF });
const aprSheet = { cells: { A1: 'Date', B1: 'Footfall', C1: 'Transactions', D1: 'Residual', ...col('A', 2, APR.map((r) => short(r[at('date')]))), ...col('B', 2, aF), ...col('C', 2, aT) } };
const aBig = AF.resid.reduce((k, e, i) => (Math.abs(e) > Math.abs(AF.resid[k]) ? i : k), 0);

export const items = [
  // ---------------------------------------------------------------- least-squares-line
  {
    id: 'b06-m1-1', lesson: 'least-squares-line', type: 'mc', kind: 'conceptual',
    prompt: 'A least-squares line is fitted to 40 days of a food truck’s (fictional) data: the day’s high (mean 22 °C) and lunches sold (mean 180). The slope is 6.5 lunches per °C. Which point must lie on the line?',
    options: ['(0, 6.5)', '(22, 180)', '(22, 143)', '(180, 22)'],
    answer: 1,
    feedback: {
      0: 'The intercept isn’t the slope. The line’s value at 0 °C is ȳ − b₁x̄ = 180 − 6.5 × 22 = 37.',
      2: 'At the mean high the line gives the mean lunches, 180, because b₀ = ȳ − b₁x̄.',
      3: 'The coordinates are the wrong way round: (x̄, ȳ) is (22, 180).',
    },
    solution: 'b₀ = ȳ − b₁x̄ means ŷ at x̄ is ȳ: every least-squares line with an intercept passes through (x̄, ȳ) = (22, 180).',
  },
  {
    id: 'b06-m1-2', lesson: 'least-squares-line', type: 'num', kind: 'numerical',
    prompt: 'A car wash (fictional) finds, over 30 days, a sample covariance of 84 between the day’s high (°C) and cars washed, and a sample variance of the high of 12 (°C²). What is the slope of the least-squares line of cars washed on the high, in cars per °C?',
    answer: 84 / 12, check: () => 84 / 12, unit: 'cars per °C', places: 1, tol: 0.05,
    wrong: [
      { value: 84 / Math.sqrt(12), say: 'Divide the covariance by the variance of x, not by its standard deviation: b₁ = s_xy ÷ s_x².' },
      { value: 12 / 84, say: 'The slope is covariance ÷ variance of x, not the other way up.' },
    ],
    solution: 'b₁ = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)², and dividing top and bottom by n − 1 gives b₁ = s_xy ÷ s_x² = 84 ÷ 12 = 7 cars per °C. (The same as r × s_y ÷ s_x, since r = s_xy ÷ (s_x s_y).)',
  },
  {
    id: 'b06-m1-3', lesson: 'least-squares-line', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook, 3–26 May 2027: footfall in B2:B25 and transactions in C2:C25. Ana’s area report quotes conversion as “transactions per 100 visitors”. In F1, calculate the slope of the least-squares line of transactions on footfall in those units.',
    sheet: maySheet,
    cell: 'F1', answer: '=100*SLOPE(C2:C25,B2:B25)',
    alt: ['=SLOPE(C2:C25,B2:B25)*100', '=SLOPE(C2:C25,B2:B25/100)', '=100*CORREL(B2:B25,C2:C25)*STDEV.S(C2:C25)/STDEV.S(B2:B25)'],
    view: 'A1:F25', maxHeight: '20rem', widths: { A: 8, E: 26 }, formats: { F1: '0.00' },
    wrong: [
      { formula: '=SLOPE(C2:C25,B2:B25)', say: 'That is transactions per visitor. Per 100 visitors, multiply by 100.' },
      { formula: '=100*SLOPE(B2:B25,C2:C25)', say: 'The ranges are swapped: that is visitors per transaction (×100). SLOPE takes the variable being predicted, transactions, first.' },
      { formula: '=100*SUM(C2:C25)/SUM(B2:B25)', say: 'That is the overall conversion rate, total transactions ÷ total footfall. The question asks for the slope of the line.' },
    ],
    solution: `<x>=100*SLOPE(C2:C25,B2:B25)</x> = ${(100 * MF.beta[1]).toFixed(2)} transactions per 100 visitors. A slope rescales with the units of x (per visitor × 100 = per 100 visitors); r and R² (${MF.r2.toFixed(3)}) do not.`,
  },
  {
    id: 'b06-m1-4', lesson: 'least-squares-line', type: 'num', kind: 'numerical',
    prompt: 'For a set of paired data, the least-squares slope of y on x is 1.8 and the least-squares slope of x on y is 0.32. Both are positive. What is the correlation r? Give three decimal places.',
    answer: rnd(Math.sqrt(1.8 * 0.32), 3), check: () => Math.sqrt(1.8 * 0.32), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: rnd(1.8 * 0.32, 3), say: 'The product of the two slopes is r², not r. Take the square root.' },
      { value: rnd(0.32 / 1.8, 3), say: 'Dividing the slopes gives s_x² ÷ s_y², not r. Multiply them: b_yx × b_xy = r².' },
    ],
    solution: 'b_yx × b_xy = (r s_y/s_x)(r s_x/s_y) = r² = 1.8 × 0.32 = 0.576, so r = +√0.576 = 0.759 (positive, like the slopes). If the two lines were one line, the slopes would multiply to 1.',
  },
  {
    id: 'b06-m1-5', lesson: 'least-squares-line', type: 'mc', kind: 'applied',
    prompt: 'A coffee roaster (fictional) ranks the 200 cafés it supplies by first-quarter orders. Its ten biggest customers ordered 18% less in the second quarter, while orders across all 200 were flat. The sales director wants to call the ten to find out what went wrong. What should the analyst say first?',
    options: [
      'The drop shows those cafés are losing their own customers to competitors, so the calls should go out today.',
      'Cafés picked for record orders tend to order nearer average next quarter anyway; check past top tens first.',
      'Orders can’t regress toward the mean, because they are whole counts of bags rather than measurements with error.',
      'The drop is too large to be chance, so the roaster’s prices must have risen for its biggest customers.',
    ],
    answer: 1,
    feedback: {
      0: 'Possibly, but the cafés were chosen for being extreme in one quarter, and that alone predicts a fall.',
      2: 'Any imperfectly correlated pair of measures shows regression toward the mean, counts included.',
      3: 'Nothing here points to prices. Selecting on an extreme quarter produces a fall with no cause at all.',
    },
    solution: 'Quarter-to-quarter orders are imperfectly correlated, so the cafés selected as the biggest in one quarter will, on average, be less extreme in the next: regression toward the mean. A fair baseline is how previous top tens moved, or how other high-ordering cafés did; only a fall beyond that needs explaining.',
  },
  {
    id: 'b06-m1-6', lesson: 'least-squares-line', type: 'mc', kind: 'conceptual',
    prompt: 'A cinema (fictional) fits weekly snack revenue on weekly admissions (2,000 to 6,000) and gets an intercept of −$1,150. Its analyst refits with x = admissions − 4,000. What happens?',
    options: [
      'The slope halves and the intercept becomes 0, since the data are now centred on the middle of the range.',
      'The slope and the intercept both stay exactly the same, because only the labels on the axis have changed.',
      'The slope stays the same; the intercept becomes the fitted revenue in a 4,000-admission week.',
      'The fit gets better, because the new x is closer to zero, so R² rises.',
    ],
    answer: 2,
    feedback: {
      0: 'Shifting x moves the line’s reference point, not its steepness.',
      1: 'The slope stays, but the intercept is now the fitted value at x − 4,000 = 0, that is at 4,000 admissions.',
      3: 'Centring doesn’t change the fitted values, so SSE, SST and R² are all unchanged.',
    },
    solution: 'Centring x at 4,000 slides the axis, not the line: the slope and the fitted values are unchanged (so is R²), and the intercept becomes ŷ at 4,000 admissions, a meaningful week inside the data, instead of an extrapolation to zero admissions.',
  },
  // ---------------------------------------------------------------- residuals-and-r-squared
  {
    id: 'b06-m1-7', lesson: 'residuals-and-r-squared', type: 'num', kind: 'numerical',
    prompt: 'A regression of 27 delivery times (minutes) on distance (km) for a courier (fictional) has total sum of squares 9,000 and R² = 0.80. What is the residual standard error, in minutes? Give two decimal places.',
    answer: rnd(Math.sqrt((1 - 0.8) * 9000 / 25), 2), check: () => Math.sqrt(9000 * (1 - 0.80) / (27 - 2)), unit: 'minutes', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(Math.sqrt(0.8 * 9000 / 25), 2), say: 'R² × SST is SSR, the part the line accounts for. The residual standard error uses SSE = (1 − R²) × SST.' },
      { value: rnd(Math.sqrt(0.2 * 9000 / 27), 2), say: 'Divide SSE by n − 2 = 25, not n.' },
      { value: rnd(0.2 * 9000 / 25, 2), say: 'That is s², in minutes squared. Take the square root.' },
    ],
    solution: 'SSE = (1 − 0.80) × 9,000 = 1,800; s = √(1,800 ÷ 25) = √72 = 8.49 minutes. The line’s delivery times are typically about 8½ minutes off.',
  },
  {
    id: 'b06-m1-8', lesson: 'residuals-and-r-squared', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, 1–24 April 2027: footfall in B2:B25 and transactions in C2:C25. In D2, calculate the residual of transactions from the least-squares line of transactions on footfall, in a formula that can be filled down to D25 without any helper cells.',
    sheet: aprSheet,
    cell: 'D2', fill: 'D2:D25', answer: '=C2-TREND($C$2:$C$25,$B$2:$B$25,B2)',
    alt: ['=C2-FORECAST.LINEAR(B2,$C$2:$C$25,$B$2:$B$25)', '=C2-(INTERCEPT($C$2:$C$25,$B$2:$B$25)+SLOPE($C$2:$C$25,$B$2:$B$25)*B2)', '=C2-INTERCEPT($C$2:$C$25,$B$2:$B$25)-SLOPE($C$2:$C$25,$B$2:$B$25)*B2'],
    view: 'A1:D25', maxHeight: '20rem', widths: { A: 8 }, formats: { D: '0.00' },
    wrong: [
      { formula: '=TREND($C$2:$C$25,$B$2:$B$25,B2)-C2', say: 'That is fitted minus observed. A residual is y − ŷ.' },
      { formula: '=C2-TREND(C2:C25,B2:B25,B2)', say: 'Without $ the ranges slide down as the formula fills, so each row fits a different line. Anchor them: $C$2:$C$25 and $B$2:$B$25.' },
      { formula: '=C2-AVERAGE($C$2:$C$25)', say: 'That is the deviation from the mean, not from the line.' },
    ],
    solution: `<x>=C2-TREND($C$2:$C$25,$B$2:$B$25,B2)</x>, filled to D25. The residuals add to 0; the largest in size is ${AF.resid[aBig] < 0 ? '−' : '+'}${Math.abs(AF.resid[aBig]).toFixed(1)} transactions on ${short(APR[aBig][at('date')])}. The line’s residual standard error is ${AF.sigma.toFixed(2)} transactions.`,
  },
  {
    id: 'b06-m1-9', lesson: 'residuals-and-r-squared', type: 'mc', kind: 'conceptual',
    prompt: 'A residual plot against x shows residuals that are mostly negative for small x, mostly positive in the middle, and mostly negative again for large x, with about the same spread throughout. What does it indicate?',
    options: [
      'The relationship bends like an upside-down U, so a straight line is the wrong shape.',
      'The spread of y grows with x, so the line’s typical miss is too large for the small values of x.',
      'A few outliers at the two ends of the range have pulled the line too far up in the middle.',
      'Nothing at all: the residuals average zero, exactly as least squares guarantees.',
    ],
    answer: 0,
    feedback: {
      1: 'A growing spread shows as a funnel; this plot has an even spread with a sign pattern.',
      2: 'Outliers show as a few isolated large residuals, not as runs of one sign across the range.',
      3: 'They average zero overall by construction; a run of signs within parts of the range is the warning.',
    },
    solution: 'Runs of same-signed residuals across the range of x mean the straight line misses systematically: here the data rise more steeply than the line at first and flatten later, a curve with a maximum. The fix is a curved model (module 4), not a different straight line.',
  },
  {
    id: 'b06-m1-10', lesson: 'residuals-and-r-squared', type: 'classify', kind: 'applied',
    prompt: 'Ana tells her bank: “Across 2027, Millbrook’s daily sales on transactions give R² = 0.965 and a residual standard error of $31.52.” Classify each conclusion the loan officer might draw.',
    items: [
      'On a typical day, the line’s sales figure is about $32 away from the actual sales.',
      'The line will forecast 2028’s daily sales with 96.5% accuracy.',
      'About 96.5% of the day-to-day variation in Millbrook’s 2027 sales lies along the line.',
      'Raising the number of transactions will raise sales by the slope, with certainty.',
      'The correlation between transactions and sales at Millbrook is about 0.98.',
    ],
    categories: ['Justified', 'Not justified'],
    answer: [0, 1, 0, 1, 0],
    feedback: {
      1: 'R² is a share of variation in the fitting data, not a forecast accuracy, and next year can differ.',
      3: 'R² describes association across days; it says nothing about the effect of a change, or about certainty.',
      4: 'Justified: √0.965 ≈ 0.982, with the sign of the (positive) slope.',
    },
    solution: 'The residual standard error is the typical miss in dollars; R² is the share of 2027’s variation around the mean that the line follows, and √R² gives |r|. Neither is out-of-sample accuracy, and neither is a causal effect.',
  },
  {
    id: 'b06-m1-11', lesson: 'residuals-and-r-squared', type: 'mc', kind: 'applied',
    prompt: 'Two models of a florist’s (fictional) daily revenue are on the table. Model A: revenue on the day’s orders, R² = 0.45, residual standard error $120. Model B: revenue on website visits, fitted to a different year with a wider range of trading, R² = 0.80, residual standard error $300. The florist needs the daily figure to within about $150. Which is more useful, and why?',
    options: [
      'Model B: its R² is much higher, so it accounts for more of the variation and is the better model.',
      'Neither: an R² below 0.9 is never good enough to use for day-to-day planning in a business.',
      'Model B, because a wider range of trading always makes a model’s daily figures more accurate.',
      'Model A: its typical miss, $120, is within the tolerance; the R²s come from different ranges.',
    ],
    answer: 3,
    feedback: {
      0: 'R² depends on the range of the data; the residual standard error measures the miss in dollars, which is what the florist cares about.',
      1: 'There is no universal R² threshold; what matters is whether the typical miss suits the decision.',
      2: 'A wider range raises R² without making the fitted values any closer to the data.',
    },
    solution: 'For a tolerance in dollars, compare residual standard errors: $120 against $300. Model B’s higher R² mostly reflects the wider spread of its data, which gives the line more variation to follow. Model A meets the need; it would still be worth checking its residual plot.',
  },
];
