// assess-m4.js — B06 module 4 test: Checking and extending a model (assumptions-and-diagnostics,
// transformations-and-influence, logistic-regression). New questions on new scenarios, not copies of lesson exercises.
// No hints; solutions are shown when the student reviews the test. Café data and the October joiners come from case.js;
// every other business, person and number is fictional. Formula items are marked by their results (core/sheet.js
// gradeFormula); every num item's `check` recomputes its answer.
import { CLEAN_ROWS, CAFE_COLUMNS, column, member, DERIVED as D } from './case.js?v=25';
import * as R from '../../../core/regression.js?v=25';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}`;

// Millbrook's first 20 weekdays of November 2027: residuals of footfall on the high, for a Q–Q plot
const NOV = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && !['Sat', 'Sun'].includes(r[at('weekday')]) && r[at('date')] >= '2027-11-01').slice(0, 20);
const nN = NOV.length, lastN = nN + 1;
const novCells = { A1: 'Date', B1: 'High (°F)', C1: 'Footfall', D1: 'Residual', E1: 'Normal score',
  ...col('A', 2, NOV.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, NOV.map((r) => r[at('high_f')])), ...col('C', 2, NOV.map((r) => r[at('footfall')])),
  ...col('D', 2, NOV.map((_, i) => `=C${i + 2}-TREND(C$2:C$${lastN},B$2:B$${lastN},B${i + 2})`)) };
const novFit = R.fit(NOV.map((r) => r[at('footfall')]), { High: NOV.map((r) => r[at('high_f')]) });
const novMin = Math.min(...novFit.resid), novMinScore = R.normQuantile((1 - 0.375) / (nN + 0.25));

// Harbourside's log model (high, rain, weekend, festival, build-up), for the rain item
const H = { cafe: 'Harbourside' };
const LOG = R.fit(column('log_footfall', H), { 'High (°F)': column('high_f', H), 'Rain (in)': column('rain_in', H), Weekend: column('weekend', H), Festival: column('festival01', H), 'Build-up': column('build_up', H) });
const r4 = (v) => Math.round(v * 10000) / 10000;
const logCells = { A1: 'Term', B1: 'Coefficient', ...col('A', 2, LOG.names), ...col('B', 2, LOG.beta.map(r4)), D1: 'Rain (in)', E1: 0.25, D2: 'Change in footfall' };
const rainB = r4(LOG.beta[2]);

// the October joiners: notifications against returning
const y = member('returned'), nt = member('notifications');
const tab = { a: 0, b: 0, c: 0, d: 0 };   // a: on & returned, b: on & not, c: off & returned, d: off & not
y.forEach((v, i) => { if (nt[i]) { if (v) tab.a++; else tab.b++; } else if (v) tab.c++; else tab.d++; });
const orTab = (tab.a / tab.b) / (tab.c / tab.d);
const ONE = R.logistic(y, { Notifications: nt });

// fictional numbers
const CK = { e: 12, s: 5, h: 0.2, p: 2 };
const ckR = CK.e / (CK.s * Math.sqrt(1 - CK.h)), ckD = (ckR ** 2 / CK.p) * (CK.h / (1 - CK.h));
const AD = { b: 0.12, rise: 10 };

export const items = [
  {
    id: 'b06-m4-1', lesson: 'assumptions-and-diagnostics', type: 'formula', kind: 'numerical',
    prompt: `To draw a normal Q–Q plot of the residuals from Millbrook’s first ${nN} November weekdays (footfall on the high, in D), Ana needs each residual’s normal score. In E2, calculate the first residual’s Blom normal score, Φ⁻¹((rank − 3/8) ÷ (n + 1/4)), with rank 1 for the smallest residual, so that it fills down to E${lastN}.`,
    sheet: { cells: { ...novCells } },
    cell: 'E2', fill: `E2:E${lastN}`, answer: `=NORM.S.INV((RANK.AVG(D2,D$2:D$${lastN},1)-0.375)/(COUNT(D$2:D$${lastN})+0.25))`,
    alt: [`=NORM.S.INV((RANK.AVG(D2,D$2:D$${lastN},1)-3/8)/(${nN}+1/4))`, `=NORM.S.INV((RANK.EQ(D2,D$2:D$${lastN},1)-0.375)/(${nN}+0.25))`],
    view: `A1:E${lastN}`, maxHeight: '20rem', formats: { D: '0.0', E: '0.00' }, widths: { A: 8, B: 10, C: 10, D: 10, E: 13 },
    wrong: [
      { formula: `=NORM.S.INV((RANK.AVG(D2,D$2:D$${lastN})-0.375)/(${nN}+0.25))`, say: 'Without the third argument RANK.AVG ranks from the largest down, so the largest residual gets rank 1 and every score has the wrong sign. Use 1 for ascending order.' },
      { formula: `=NORM.S.INV(RANK.AVG(D2,D$2:D$${lastN},1)/${nN})`, say: 'rank ÷ n reaches 1 for the largest residual, and NORM.S.INV(1) has no value. Blom’s positions are (rank − 3/8) ÷ (n + 1/4).' },
    ],
    solution: `<x>=NORM.S.INV((RANK.AVG(D2,D$2:D$${lastN},1)-0.375)/(COUNT(D$2:D$${lastN})+0.25))</x>. The smallest residual (${neg(novMin, 1)} people) gets ${neg(novMinScore, 2)}. Plotting column D against column E gives the Q–Q plot: points near a straight line mean normal-looking residuals.`,
  },
  {
    id: 'b06-m4-2', lesson: 'assumptions-and-diagnostics', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional bookshop models daily sales on the weather and the day of the week over two years. Plotted in date order, the residuals sit around zero for 14 months and then drop to about −$300 and stay there, the month a rival opened across the street. Which response is best?',
    options: [
      'Add a dummy for the days after the rival opened, refit, and check the residuals again.',
      'Keep the model but report HC3 standard errors, since the residuals no longer have the same spread throughout the period.',
      'Take the log of sales, because a log removes patterns from the residuals over time.',
      'Delete the months after the rival opened, since they are outliers compared with the first 14 months.',
    ],
    answer: 0,
    feedback: {
      1: 'The problem is a shift in the level, a missing predictor. It biases the weather and weekday coefficients if they differ between the two periods; HC3 only repairs standard errors for unequal spread.',
      2: 'A log changes the form and the spread; it can’t add a variable the model doesn’t have.',
      3: 'Those months are the shop’s present situation: deleting them throws away the most relevant data.',
    },
    solution: 'A step in time-ordered residuals means something changed that the model doesn’t contain. A dummy for “after the rival opened” lets the level shift; then recheck the residuals, Durbin–Watson and whether the other coefficients changed.',
  },
  {
    id: 'b06-m4-3', lesson: 'assumptions-and-diagnostics', type: 'num', kind: 'numerical',
    prompt: 'A fictional parcel depot’s daily residuals have a lag-1 autocorrelation of −0.35: a busy-for-the-model day tends to be followed by a quiet one. Estimate the Durbin–Watson statistic. Give two decimal places.',
    answer: 2.7, check: () => 2 * (1 - -0.35), places: 2, tol: 0.006, unit: '',
    wrong: [{ value: 1.3, say: 'With a negative autocorrelation, DW ≈ 2(1 − r₁) = 2(1 + 0.35) is above 2, not below.' }, { value: 0.65, say: 'Multiply by 2: DW ≈ 2(1 − r₁).' }],
    solution: 'DW ≈ 2(1 − (−0.35)) = 2.70. Values above 2 mean negative autocorrelation: neighbouring days alternate. That can happen when parcels missed one day are handled the next.',
  },
  {
    id: 'b06-m4-4', lesson: 'transformations-and-influence', type: 'formula', kind: 'applied',
    prompt: 'The worksheet holds the coefficients of Harbourside’s model for ln(footfall). Ana wants the footfall change to expect on a day with the rain in E1, compared with a dry day like it. In E2, calculate it as a proportion (−0.10 is 10% fewer people).',
    sheet: { cells: { ...logCells }, vary: { E1: [0.1, 0.5, 0.8] } },
    cell: 'E2', answer: '=EXP(E1*B4)-1', alt: ['=EXP(B4*E1)-1', '=EXP(B4)^E1-1'],
    view: 'A1:E7', formats: { B: '0.0000', E1: '0.00', E2: '0.0%' }, widths: { A: 13, B: 12, D: 18, E: 9 },
    wrong: [
      { formula: '=E1*B4', say: 'That is the shortcut, the change in ln(footfall). With a coefficient this large it overstates the fall; use EXP(E1*B4) − 1.' },
      { formula: '=EXP(B4)-1', say: 'That is the change for a whole inch of rain. Multiply the coefficient by the rain in E1 before exponentiating.' },
      { formula: '=E1*(EXP(B4)-1)', say: 'Percentage changes don’t scale in proportion: a quarter of an inch multiplies footfall by e^(0.25b), not by a quarter of the one-inch change.' },
    ],
    solution: `<x>=EXP(E1*B4)-1</x>. For 0.25 inch: e^(0.25 × ${neg(rainB, 4)}) − 1 = ${neg(Math.exp(0.25 * rainB) - 1, 3)}, about ${fx((1 - Math.exp(0.25 * rainB)) * 100, 0)}% fewer people, holding the temperature, weekend, festival and build-up fixed.`,
  },
  {
    id: 'b06-m4-5', lesson: 'transformations-and-influence', type: 'num', kind: 'numerical',
    prompt: 'In a simple regression (2 coefficients) for a fictional chain of launderettes, one shop has a residual of 12 machines, a leverage of 0.20, and the residual standard error is 5. Calculate its Cook’s distance. Give two decimal places.',
    answer: Math.round(ckD * 100) / 100, check: () => { const r = 12 / (5 * Math.sqrt(0.8)); return (r * r / 2) * (0.2 / 0.8); }, places: 2, tol: 0.006, unit: '',
    wrong: [{ value: Math.round(((12 / 5) ** 2 / 2) * (0.2 / 0.8) * 100) / 100, say: 'Studentize the residual first: divide by s√(1 − h), not by s alone.' }],
    solution: `Studentized residual: 12 ÷ (5 × √0.80) = ${fx(ckR, 3)}. D = (${fx(ckR, 3)}² ÷ 2) × (0.20 ÷ 0.80) = ${fx(ckD, 2)}. Close to 1: this shop is influential. Check its figures, and fit with and without it.`,
  },
  {
    id: 'b06-m4-6', lesson: 'transformations-and-influence', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional franchise regresses store revenue on floor area. One store is three times larger than any other, and its revenue sits almost exactly on the line the other stores follow. Which statement is right?',
    options: [
      'It has high leverage but little influence on the slope.',
      'It is an outlier, because its floor area is far from the other stores’ floor areas.',
      'Its Cook’s distance must be above 1, because its leverage is so much higher than the rest.',
      'It should be removed, because high-leverage points always distort the slope.',
    ],
    answer: 0,
    feedback: {
      1: 'An outlier is far from the fitted line in y. This store is unusual in x but on the line.',
      2: 'Cook’s distance needs a large residual as well as high leverage; with a residual near 0 it is small.',
      3: 'A point that agrees with the rest confirms the slope; removing it only throws away information.',
    },
    solution: 'Leverage measures how unusual x is; influence needs a large residual too. On the line, the store hardly moves the slope, and because it stretches the range of x it makes the slope more precise.',
  },
  {
    id: 'b06-m4-7', lesson: 'transformations-and-influence', type: 'num', kind: 'applied',
    prompt: 'A fictional garden centre fits ln(monthly sales) on ln(monthly advertising spend), with a slope of 0.12. The owner plans to raise advertising by 10%. By what percentage would sales be expected to change, holding the other predictors fixed (exactly, not by the shortcut)? Give two decimal places.',
    answer: Math.round((1.1 ** AD.b - 1) * 10000) / 100, check: () => (Math.exp(0.12 * Math.log(1.1)) - 1) * 100, unit: '%', places: 2, tol: 0.006,
    wrong: [{ value: 1.2, say: 'That is the elasticity shortcut, 0.12 × 10%. The exact change is 1.10^0.12 − 1.' }, { value: 12, say: 'The slope is an elasticity: a 1% rise in spend goes with about 0.12% more sales, so 10% goes with about 1.2%, not 12%.' }],
    solution: `With logs on both sides the slope is an elasticity. Exactly: 1.10^0.12 − 1 = e^(0.12 × ln 1.10) − 1 = ${fx((1.1 ** 0.12 - 1) * 100, 2)}%. The shortcut 0.12 × 10 = 1.2% is close. This is an association; the owner would need a test to know what extra advertising does.`,
  },
  {
    id: 'b06-m4-8', lesson: 'logistic-regression', type: 'num', kind: 'numerical',
    prompt: `Of October’s joiners with notifications on, ${tab.a} returned within 30 days and ${tab.b} did not; with notifications off, ${tab.c} returned and ${tab.d} did not. Calculate the odds ratio for returning, notifications on against off. Give two decimal places.`,
    data: { table: { head: ['Notifications', 'Returned', 'Did not return'], rows: [['On', String(tab.a), String(tab.b)], ['Off', String(tab.c), String(tab.d)]], align: ['l', 'r', 'r'] } },
    answer: Math.round(orTab * 100) / 100, check: () => ONE.coefs[1].or, places: 2, tol: 0.006, unit: '',
    wrong: [{ value: Math.round((tab.a / (tab.a + tab.b)) / (tab.c / (tab.c + tab.d)) * 100) / 100, say: 'That is the ratio of the two probabilities (the risk ratio). The odds ratio divides the odds: (returned ÷ didn’t) for each group.' }],
    solution: `Odds with notifications on: ${tab.a} ÷ ${tab.b} = ${fx(tab.a / tab.b, 3)}; off: ${tab.c} ÷ ${tab.d} = ${fx(tab.c / tab.d, 3)}. Odds ratio ${fx(orTab, 2)}. A logistic regression with notifications as its only predictor gives exactly this, e^b = ${fx(ONE.coefs[1].or, 2)}; with the other four predictors held fixed the lesson’s model gives 2.52.`,
  },
  {
    id: 'b06-m4-9', lesson: 'logistic-regression', type: 'mc', kind: 'conceptual',
    prompt: `In Ana’s model the intercept is ${neg(D.returnModel.beta[0], 3)}, which converts to a probability of ${fx(1 / (1 + Math.exp(-D.returnModel.beta[0])), 3)}. What does that number describe?`,
    options: [
      'Little: it is the prediction for a member with every predictor at 0, including a $0 first ticket.',
      'The chance that a typical October member returns within 30 days.',
      'The chance of returning for a Harbourside weekday member with the average first ticket and notifications off.',
      'The share of members who returned for reasons the model can’t explain.',
    ],
    answer: 0,
    feedback: {
      1: 'The typical member’s chance is near the base rate, 53.8%. The intercept is for all predictors at 0.',
      2: 'That member has a first ticket of about $4.85, not $0; the intercept leaves the ticket at zero.',
      3: 'A logistic model has no share of unexplained cases; the intercept is just the log-odds at x = 0.',
    },
    solution: 'The intercept is the log-odds when every predictor is 0: a Harbourside member far away, joining on a weekday, notifications off, spending nothing. The smallest first ticket was $2.50, so this is an extrapolation and means nothing on its own; it sets the curve’s position, like a regression intercept far from the data.',
  },
  {
    id: 'b06-m4-10', lesson: 'logistic-regression', type: 'mc', kind: 'applied',
    prompt: 'Suppose (the figures are hypothetical) Ana scores November’s new members, who were not used to fit the model, and finds that at a threshold of 0.5 it classifies 58% correctly while 51% of November’s members returned. What should she conclude?',
    options: [
      'It beats always guessing “returns” by 7 points on new members: modest but real.',
      'The model has failed, because 58% is far below October’s 63.6%, so the coefficients must be wrong and need refitting.',
      'The model is 58% accurate, which is barely better than the 50% a coin would score.',
      'November’s figure is meaningless, because a model can only be judged on the data it was fitted to.',
    ],
    answer: 0,
    feedback: {
      1: 'Some fall on new data is expected, because in-sample figures flatter a model. The test is against November’s own base rate.',
      2: 'The benchmark is the base rate, 51%, not a coin; with an outcome near half the two are close, but say which you mean.',
      3: 'The reverse: data not used in fitting are the fair test.',
    },
    solution: 'On new members the benchmark is always guessing the commoner outcome: 51%. The model scores 58%, 7 points better: it ranks members usefully but weakly, and the fall from October’s 63.6% is the usual cost of judging a model on fresh data.',
  },
];
