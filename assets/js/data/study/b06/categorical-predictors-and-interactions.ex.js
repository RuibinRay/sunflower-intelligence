// categorical-predictors-and-interactions.ex.js — B06 · Categorical predictors and interactions: widgets, practice and
// the knowledge check (answer keys live here). The cafés’ log comes from case.js (both cafés’ 612 days for the widgets,
// their 28 rows for 1–14 October 2027 for the worksheets). Drovers Lane Car Wash, Pennick Bakeries, Ashmere Hotel and the
// other businesses named are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num
// items recompute their answers in `check`.
import { column } from './case.js?v=22';
import * as R from '../../../core/regression.js?v=22';
import { mean } from '../../../core/stats.js?v=22';

const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------- both cafés, the year
const y = column('footfall'), mb = column('millbrook'), wk = column('weekend'), hi = column('high_f'), rain = column('rain_in'), fest = column('festival01');
const cafe = column('cafe'), dates = column('date'), I = R.interaction;
const labels = dates.map((d, i) => `${Number(d.slice(8, 10))} ${MON[Number(d.slice(5, 7)) - 1]}, ${cafe[i]}`);
const HM = R.fit(y, { High: hi, Rain: rain, Millbrook: mb, Weekend: wk, MxW: I(mb, wk), Festival: fest, HxM: I(hi, mb) });
const hc = hi.map((v) => v - 60);
const HMC = R.fit(y, { Hc: hc, Rain: rain, Millbrook: mb, Weekend: wk, MxW: I(mb, wk), Festival: fest, HxM: I(hc, mb) });
const CELL = R.fit(y, { Millbrook: mb, Weekend: wk, MxW: I(mb, wk) });
const cb = (f, n) => f.coefs.find((k) => k.name === n).estimate;
const KM = R.fit(y, { High: hi, Rain: rain, Millbrook: mb });
const km = fx(KM.beta[3], 1);

// ---------------------------------------------------------------- worksheet: 1–14 October 2027, both cafés (28 rows)
const OCT = dates.map((d, i) => (d >= '2027-10-01' && d <= '2027-10-14' ? i : -1)).filter((i) => i >= 0);
const g = (a) => OCT.map((i) => a[i]);
const oct = { y: g(y), mb: g(mb), wk: g(wk), cafe: g(cafe), wd: g(column('weekday')) };
const N = OCT.length, last = N + 1;
const baseCells = {
  A1: 'Date', B1: 'Café', C1: 'Weekday', D1: 'Footfall',
  ...col('A', 2, OCT.map((i) => `${Number(dates[i].slice(8, 10))} Oct`)), ...col('B', 2, oct.cafe), ...col('C', 2, oct.wd), ...col('D', 2, oct.y),
};
const withDummies = { ...baseCells, E1: 'Millbrook', F1: 'Weekend', G1: 'Millbrook × Weekend', ...col('E', 2, oct.mb), ...col('F', 2, oct.wk), ...col('G', 2, oct.mb.map((m, i) => m * oct.wk[i])) };
const OF = R.fit(oct.y, { Millbrook: oct.mb, Weekend: oct.wk, MxW: oct.mb.map((m, i) => m * oct.wk[i]) });
const octMean = (m, w) => mean(oct.y.filter((_, i) => oct.mb[i] === m && oct.wk[i] === w));
const view = `A1:I${last}`, widths = { A: 8, B: 12, C: 9, D: 9, E: 10, F: 9, G: 18, H: 3, I: 16 };
const R1 = `D2:D${last}`, X3 = `E2:G${last}`;

// ---------------------------------------------------------------- fictional figures
const DL = { b0: 140, temp: 2.0, site: -35, inter: 1.5 };     // Drovers Lane Car Wash: washes on temperature, by site
const SW = { b0: 22, priceM: 1.8, annual: -9, inter: -1.1 };   // a subscription box: cancellations per 100 on delivery delay, by plan

export const widgets = {
  'cat-foot': {
    type: 'regression',
    title: 'Footfall at both cafés, 1 March – 31 December 2027 (612 café-days)',
    y: { name: 'Footfall', values: y },
    xs: [{ name: 'High (°F)', values: hi }, { name: 'Rain (in)', values: rain }, { name: 'Millbrook', values: mb }, { name: 'Weekend', values: wk }, { name: 'Festival', values: fest },
      { name: 'Millbrook × Weekend', values: I(mb, wk) }, { name: 'High × Millbrook', values: I(hi, mb) }],
    picked: [0, 1, 2, 3, 4],
    note: 'Harbourside and weekdays are the reference levels (Millbrook = 0, Weekend = 0). With an interaction ticked, the main effect of each of its parts is the effect at the other’s reference: Weekend becomes Harbourside’s weekend effect, High (°F) Harbourside’s slope. Each day appears twice, once per café, with the same weather, so the standard errors of the weather slopes are too small.',
  },
  'cat-ticket': {
    type: 'scatter',
    title: 'Average ticket against footfall, both cafés (612 café-days)',
    x: { name: 'Footfall', values: y, unit: 'people' },
    y: { name: 'Average ticket', values: column('avg_ticket'), unit: '$' },
    group: { name: 'Café', values: cafe }, labels,
    show: ['pearson', 'r2'], toggles: ['group', 'line'], defaults: { group: false, line: false },
    note: 'Pooled, the line slopes down (about −$0.40 per 100 people). By café, both lines slope up: a regression with a café dummy gives +$0.25 per 100 people, holding the café fixed.',
  },
};

export const guided = [
  {
    id: 'b06-cat-g1', type: 'formula', kind: 'applied',
    prompt: 'The worksheet holds both cafés’ footfall for 1–14 October 2027. In E2, create the Millbrook dummy: 1 if the café in B2 is Millbrook and 0 otherwise. It should fill down to E29.',
    sheet: { cells: { ...baseCells, E1: 'Millbrook' } },
    cell: 'E2', fill: `E2:E${last}`, answer: '=IF(B2="Millbrook",1,0)',
    alt: ['=--(B2="Millbrook")', '=IF(B2="Harbourside",0,1)', '=(B2="Millbrook")*1'],
    view: `A1:E${last}`, maxHeight: '20rem', widths,
    wrong: [
      { formula: '=IF(B2="Harbourside",1,0)', say: 'That marks Harbourside. The column is meant to be 1 for Millbrook, so that Harbourside is the reference.' },
      { formula: '=IF(B2="Millbrook","Yes","No")', say: 'A dummy must be numbers, 0 and 1, so that LINEST and the ToolPak can multiply it by a coefficient.' },
    ],
    hints: ['IF(test, value if true, value if false).', '<x>=IF(B2="Millbrook",1,0)</x>'],
    solution: '<x>=IF(B2="Millbrook",1,0)</x>, filled down. Harbourside, with 0, becomes the reference café: the intercept describes it and the dummy’s coefficient is Millbrook’s difference from it.',
  },
  {
    id: 'b06-cat-g2', type: 'formula', kind: 'numerical',
    prompt: 'E holds the Millbrook dummy and F the weekend dummy. In G2, create the interaction column, filled down to G29.',
    sheet: { cells: { ...baseCells, E1: 'Millbrook', F1: 'Weekend', ...col('E', 2, oct.mb), ...col('F', 2, oct.wk), G1: 'Millbrook × Weekend' } },
    cell: 'G2', fill: `G2:G${last}`, answer: '=E2*F2',
    alt: ['=F2*E2', '=IF(AND(E2=1,F2=1),1,0)', '=PRODUCT(E2,F2)'],
    view: `A1:G${last}`, maxHeight: '20rem', widths,
    wrong: [
      { formula: '=E2+F2', say: 'An interaction is the product, not the sum. The sum is 1 on Harbourside’s weekends and Millbrook’s weekdays, which mixes two different groups.' },
      { formula: '=$E$2*$F$2', say: 'With both references fixed every row uses row 2. Leave them relative so each row multiplies its own dummies.' },
    ],
    hints: ['The interaction is 1 only when both dummies are 1.', 'Multiply them: <x>=E2*F2</x>.'],
    solution: '<x>=E2*F2</x> is 1 on Millbrook’s weekend rows and 0 elsewhere. Its coefficient in a regression with both dummies is how much Millbrook’s weekend effect differs from Harbourside’s.',
  },
  {
    id: 'b06-cat-g3', type: 'num', kind: 'numerical',
    prompt: `Adding High × Millbrook to the case’s footfall model gives a slope of ${fx(cb(HM, 'High'), 3)} people per °F on the high and ${fx(cb(HM, 'HxM'), 3)} on High × Millbrook. What is Millbrook’s own slope on the high, in people per °F? Give three decimal places.`,
    answer: rnd(rnd(cb(HM, 'High'), 3) + rnd(cb(HM, 'HxM'), 3), 3), check: () => cb(HM, 'High') + cb(HM, 'HxM'), unit: 'people per °F', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(cb(HM, 'HxM'), 3), say: 'The interaction coefficient is the difference between the slopes, not Millbrook’s slope. Add it to the reference café’s slope.' },
      { value: rnd(cb(HM, 'High') - cb(HM, 'HxM'), 3), say: 'Add the interaction to the main slope: Millbrook’s slope is b(High) + b(High × Millbrook), and b(High × Millbrook) is negative.' },
    ],
    hints: ['On Millbrook’s rows the product equals the high, so the high’s total coefficient there is the sum of the two.', `${fx(cb(HM, 'High'), 3)} + (${fx(cb(HM, 'HxM'), 3)}).`],
    solution: `${fx(cb(HM, 'High'), 3)} + (${fx(cb(HM, 'HxM'), 3)}) = ${fx(cb(HM, 'High') + cb(HM, 'HxM'), 3)} people per °F at Millbrook, against ${fx(cb(HM, 'High'), 3)} at Harbourside. (Allowing for the build-up lowers both, to about 1.43 and 0.45.)`,
  },
  {
    id: 'b06-cat-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Each set of columns would be entered into a regression with an intercept, over Millbrook’s 306 days. Can it be fitted, or is it caught in the dummy-variable trap?',
    items: [
      'Six weekday dummies (Tuesday to Sunday), with Monday as the reference',
      'Seven weekday dummies, one for every day from Monday to Sunday',
      'A weekend dummy together with Saturday and Sunday dummies',
      'A weekend dummy and a dummy for Fridays',
    ],
    categories: ['Can be fitted', 'Dummy-variable trap'],
    answer: [0, 1, 1, 0],
    hints: ['Look for columns that add up exactly to another column, or to the intercept’s column of 1s.', 'Saturday + Sunday = weekend on every row.'],
    feedback: {
      1: 'The seven dummies add up to 1 on every row, which is the intercept’s column. One must be left out.',
      2: 'Saturday and Sunday add up to the weekend dummy on every row, so the three columns can’t be separated.',
      3: 'Friday isn’t part of the weekend, so no column is an exact sum of the others: the reference is Monday to Thursday.',
    },
    solution: 'k − 1 dummies with an intercept can be fitted (six weekday dummies; or weekend and Friday, with Monday–Thursday as the reference). Seven weekday dummies sum to the intercept, and Saturday + Sunday sum to the weekend dummy: both are perfect collinearity.',
  },
];

export const independent = [
  {
    id: 'b06-cat-i1', type: 'formula', kind: 'numerical',
    prompt: 'For 1–14 October, E:G hold the Millbrook dummy, the weekend dummy and their product. In I2, calculate Millbrook’s own weekend effect (its weekend minus its weekday fitted footfall) from the regression of footfall on all three columns, in one formula using LINEST.',
    sheet: { cells: { ...withDummies, I1: 'Millbrook’s weekend effect' } },
    cell: 'I2', answer: `=INDEX(LINEST(${R1},${X3}),1,2)+INDEX(LINEST(${R1},${X3}),1,1)`,
    alt: [`=SUM(INDEX(LINEST(${R1},${X3}),1,1),INDEX(LINEST(${R1},${X3}),1,2))`, `=AVERAGEIFS(${R1},B2:B${last},"Millbrook",F2:F${last},1)-AVERAGEIFS(${R1},B2:B${last},"Millbrook",F2:F${last},0)`],
    view, maxHeight: '20rem', formats: { I2: '0.0' }, widths,
    wrong: [
      { formula: `=INDEX(LINEST(${R1},${X3}),1,2)`, say: 'That is the weekend coefficient alone: the weekend effect at Harbourside, the reference café. Millbrook’s adds the interaction.' },
      { formula: `=INDEX(LINEST(${R1},${X3}),1,1)`, say: 'That is the interaction: the difference between the cafés’ weekend effects, not Millbrook’s effect itself.' },
      { formula: `=INDEX(LINEST(${R1},${X3}),1,2)+INDEX(LINEST(${R1},${X3}),1,3)`, say: 'Column 3 is the Millbrook dummy (the first x column comes third). Millbrook’s weekend effect is Weekend (column 2) plus Millbrook × Weekend (column 1).' },
    ],
    solution: `LINEST returns the slopes on G, F and E, then the intercept. Weekend (${fx(OF.beta[2], 2)}) + Millbrook × Weekend (${fx(OF.beta[3], 2)}) = ${fx(OF.beta[2] + OF.beta[3], 1)} people. With only the two dummies and their product the model reproduces the four means, so this equals Millbrook’s weekend mean minus its weekday mean, ${fx(octMean(1, 1), 1)} − ${fx(octMean(1, 0), 1)}.`,
  },
  {
    id: 'b06-cat-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Ana refits the café × weekend model with Millbrook as the reference café (a Harbourside dummy instead of a Millbrook one). Which of these changes?',
    options: [
      'The dummy coefficients and the intercept, not the fitted values, residuals or R².',
      'The fitted values and R², because the reference café’s rows are now fitted less closely.',
      'Nothing at all: the coefficients are the same because the data are the same.',
      'Only the interaction’s coefficient, because the main effects don’t depend on the reference.',
    ],
    answer: 0,
    feedback: {
      1: 'Both codings describe the same four group means, so the fit is identical.',
      2: 'The intercept becomes Millbrook’s weekday mean and the café coefficient changes sign, so the coefficients do change.',
      3: 'The main effects are effects at the reference level, so they change most: Weekend becomes Millbrook’s weekend effect (−161.6) instead of Harbourside’s (+90.2).',
    },
    solution: 'A different reference is a different way of writing the same model. Intercept 271.8 (Millbrook’s weekday mean), Harbourside −157.4, Weekend −161.6 (Millbrook’s weekend effect), interaction +251.8; the fitted values, residuals and R² don’t change.',
  },
  {
    id: 'b06-cat-i3', type: 'num', kind: 'numerical',
    prompt: 'Drovers Lane Car Wash (fictional) has two sites and models daily washes on the day’s high (°F), a dummy for its Riverside site (the town-centre site is the reference) and their product: washes = 140 + 2.0 × high − 35 × Riverside + 1.5 × (high × Riverside). How many washes does the model predict at Riverside on a 70°F day?',
    answer: DL.b0 + DL.temp * 70 + DL.site + DL.inter * 70, check: () => 140 + 2.0 * 70 - 35 * 1 + 1.5 * 70 * 1, unit: 'washes', places: 0, tol: 0.5,
    wrong: [
      { value: DL.b0 + DL.temp * 70 + DL.site, say: 'At Riverside the product high × Riverside equals the high, 70, so the interaction adds 1.5 × 70.' },
      { value: DL.b0 + DL.temp * 70, say: 'That is the town-centre site. Riverside adds −35 and 1.5 × 70.' },
    ],
    solution: '140 + 2.0 × 70 − 35 + 1.5 × 70 = 140 + 140 − 35 + 105 = 350 washes. Riverside’s slope is 2.0 + 1.5 = 3.5 washes per °F, so it is more sensitive to the weather, although at low temperatures it washes fewer cars (the −35 applies at 0°F).',
  },
  {
    id: 'b06-cat-i4', type: 'mc', kind: 'applied',
    prompt: 'Pennick Bakeries (fictional) has a city shop and a station kiosk. Pooled over both, the slope of the average spend per customer on the day’s customers is negative. With a kiosk dummy in the model the slope is positive. The kiosk serves far more customers, each spending less. What should the bakery conclude about busy days?',
    options: [
      'Within each outlet, busier days go with slightly higher spend; the pooled slope reflects the kiosk’s customers.',
      'Busier days lower spend per customer, because the pooled slope uses all the data and so is the more reliable figure.',
      'The dummy has created a false positive slope, so the bakery should report the model without it.',
      'The two slopes cancel, so spend per customer has no link at all with how busy the day is.',
    ],
    answer: 0,
    feedback: {
      1: 'Using more rows doesn’t help when the rows mix two outlets with different customers; the pooled slope compares the outlets with each other.',
      2: 'The dummy holds the outlet fixed, so the slope compares days within the same outlet. It removes a confounder rather than creating a link.',
      3: 'They answer different questions and don’t cancel. Within each outlet there is a link, positive.',
    },
    solution: 'This is Simpson’s paradox, as with Lantern’s cafés: the outlet confounds customers and spend (the kiosk has more customers and smaller spend). Holding the outlet fixed with a dummy, busier days go with slightly larger spend.',
  },
  {
    id: 'b06-cat-i5', type: 'num', kind: 'numerical',
    prompt: `In the case’s footfall model with High × Millbrook, the high is centred (High − 60) in both terms. The Millbrook coefficient is then ${fx(cb(HMC, 'Millbrook'), 2)} and the interaction ${fx(cb(HMC, 'HxM'), 4)} people per °F. How many more people does the model put at Millbrook than at Harbourside on an 80°F, dry weekday with no festival? Give one decimal place.`,
    answer: rnd(rnd(cb(HMC, 'Millbrook'), 2) + rnd(cb(HMC, 'HxM'), 4) * 20, 1), check: () => HM.predict([80, 0, 1, 0, 0, 0, 80]).yhat - HM.predict([80, 0, 0, 0, 0, 0, 0]).yhat, unit: 'people', places: 1, tol: 0.15,
    wrong: [
      { value: rnd(cb(HMC, 'Millbrook'), 1), say: 'That is the difference at 60°F, where High − 60 = 0. At 80°F the interaction adds its coefficient × 20.' },
      { value: rnd(cb(HMC, 'Millbrook') + cb(HMC, 'HxM') * 80, 1), say: 'The high is centred: the interaction column is (High − 60) × Millbrook, which is 20 at 80°F, not 80.' },
    ],
    solution: `Difference = Millbrook + interaction × (80 − 60) = ${fx(cb(HMC, 'Millbrook'), 2)} + (${fx(cb(HMC, 'HxM'), 4)}) × 20 = ${fx(cb(HMC, 'Millbrook') + cb(HMC, 'HxM') * 20, 1)} people. The gap narrows on warm days because warm weather helps Harbourside more.`,
  },
  {
    id: 'b06-cat-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true.',
    options: [
      'A dummy’s coefficient in a model with no other predictors is the difference between the two groups’ means.',
      'With an interaction in the model, a main effect is the effect when the other predictor is zero or at its reference.',
      'Coding the day of the week as 1 to 7 in one column forces equal steps between consecutive days.',
      'If the interaction’s t test isn’t significant, both groups must have exactly the same slope.',
      'Changing the reference level of a dummy changes the model’s R².',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A non-significant test means the data don’t show a clear difference, not that the slopes are equal.',
      4: 'The fitted values are the same whichever level is the reference, so R² is too.',
    },
    solution: 'True: a lone dummy reproduces the difference of means (and its t test is the pooled two-sample t); a main effect is conditional on the other term being 0; one 1–7 column is a straight line through the week. False: “not significant” isn’t “equal”; the reference doesn’t change the fit.',
  },
];

export const check = [
  {
    id: 'b06-cat-k1', type: 'mc', kind: 'conceptual',
    prompt: `A model of footfall on the high, rain and a Millbrook dummy (no interactions) gives the dummy a coefficient of ${km}. What does it mean?`,
    options: [
      `Holding the high and rain fixed, Millbrook has ${km} more people than Harbourside.`,
      `Millbrook’s mean daily footfall over the year was ${km} people once the weather is held fixed.`,
      `Millbrook’s footfall rises ${km} people more than Harbourside’s for each extra °F.`,
      `Of all the café-days, ${km}% are Millbrook’s once the weather is held fixed.`,
    ],
    answer: 0,
    feedback: {
      1: 'The intercept (with the other predictors) describes the reference café; the dummy is a difference from it.',
      2: 'A difference in slopes needs an interaction, High × Millbrook. A dummy alone shifts the line up or down.',
      3: 'A coefficient is in y’s units (people), not a share of the rows.',
    },
    solution: `A dummy’s coefficient is the difference from the reference category (Harbourside), holding the other predictors fixed. Here it equals the plain difference of the cafés’ means (${fx(KM.beta[3], 1)}), because both cafés share the same days and weather, so the dummy is uncorrelated with the weather columns. Without the café × weekend interaction it averages over weekdays and weekends, where the gap goes opposite ways.`,
  },
  {
    id: 'b06-cat-k2', type: 'num', kind: 'numerical',
    prompt: 'The cell-means model for both cafés is footfall = 114.3 + 157.4 × Millbrook + 90.2 × Weekend − 251.8 × (Millbrook × Weekend). What is the fitted mean footfall on Millbrook’s weekend days? Give one decimal place.',
    answer: rnd(114.3 + 157.4 + 90.2 - 251.8, 1), check: () => 114.3 + 157.4 * 1 + 90.2 * 1 - 251.8 * 1, unit: 'people', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(114.3 + 157.4 + 90.2, 1), say: 'On Millbrook’s weekend rows the product is 1, so the interaction’s −251.8 applies too.' },
      { value: rnd(114.3 + 90.2 - 251.8, 1), say: 'Millbrook = 1, so add its 157.4 as well.' },
    ],
    solution: `All three columns are 1: 114.3 + 157.4 + 90.2 − 251.8 = ${fx(114.3 + 157.4 + 90.2 - 251.8, 1)} people, Millbrook’s weekend mean (${fx(R.fit(y, { a: mb, b: wk, c: I(mb, wk) }).beta.reduce((s, v) => s + v, 0), 2)} unrounded).`,
  },
  {
    id: 'b06-cat-k3', type: 'formula', kind: 'numerical',
    prompt: 'For 1–14 October (both cafés), the regression of footfall on the Millbrook dummy alone has a slope equal to a difference of two means. In I2, calculate that slope without LINEST or SLOPE, using AVERAGEIFS on the café names in B.',
    sheet: { cells: { ...withDummies, I1: 'Millbrook coefficient' } },
    cell: 'I2', answer: `=AVERAGEIFS(${R1},B2:B${last},"Millbrook")-AVERAGEIFS(${R1},B2:B${last},"Harbourside")`,
    alt: [`=AVERAGEIF(B2:B${last},"Millbrook",${R1})-AVERAGEIF(B2:B${last},"Harbourside",${R1})`, `=AVERAGEIFS(${R1},E2:E${last},1)-AVERAGEIFS(${R1},E2:E${last},0)`],
    require: [],
    view, maxHeight: '20rem', formats: { I2: '0.00' }, widths,
    wrong: [
      { formula: `=AVERAGEIFS(${R1},B2:B${last},"Harbourside")-AVERAGEIFS(${R1},B2:B${last},"Millbrook")`, say: 'The dummy is 1 for Millbrook, so its coefficient is Millbrook’s mean minus Harbourside’s, the reference.' },
      { formula: `=AVERAGEIFS(${R1},B2:B${last},"Millbrook")`, say: 'That is Millbrook’s mean, which is the intercept plus the coefficient. Subtract Harbourside’s mean to get the coefficient.' },
    ],
    solution: `Millbrook’s mean minus Harbourside’s: ${fx(mean(oct.y.filter((_, i) => oct.mb[i])), 2)} − ${fx(mean(oct.y.filter((_, i) => !oct.mb[i])), 2)} = ${fx(R.fit(oct.y, { m: oct.mb }).beta[1], 2)}, exactly what <x>=SLOPE(${R1},E2:E${last})</x> returns. A dummy’s slope is a difference of group means.`,
  },
  {
    id: 'b06-cat-k4', type: 'mc', kind: 'applied',
    prompt: 'A subscription-box company (fictional) models monthly cancellations per 100 customers on the month’s average delivery delay (days) with a dummy for the annual plan and the delay × annual interaction: +1.8 on delay, −9 on annual, −1.1 on the interaction (the monthly plan is the reference). Which conclusion about the annual plan’s response to delays is right?',
    options: [
      'Its slope is 1.8 − 1.1 = 0.7 per day of delay, so annual customers respond less to delays.',
      'Its slope on delay is −1.1 per day, because the interaction is the annual plan’s own slope on delay.',
      'Its slope on delay is 1.8, because the delay coefficient applies to every customer whatever the plan.',
      'It can’t be worked out, because main effects have no meaning once an interaction is included.',
    ],
    answer: 0,
    feedback: {
      1: 'The interaction is the difference between the plans’ slopes. The annual plan’s own slope is the reference slope plus the difference.',
      2: 'With the interaction in, 1.8 is the reference (monthly) plan’s slope only.',
      3: 'Main effects are effects at the other predictor’s reference; combined with the interaction they give each group’s slope.',
    },
    solution: `Annual slope = ${fx(SW.priceM, 1)} + (${fx(SW.inter, 1)}) = ${fx(SW.priceM + SW.inter, 1)} more cancellations per 100 customers per day of delay, against ${fx(SW.priceM, 1)} on the monthly plan: annual customers, already committed, react less to late deliveries. In observational data this is an association; the plans’ customers could differ in other ways that go with delays.`,
  },
  {
    id: 'b06-cat-k5', type: 'classify', kind: 'conceptual',
    prompt: 'In the case’s footfall model with the café × weekend interaction (Harbourside and weekdays are the references), what does each quantity describe?',
    items: [
      'The Weekend coefficient on its own',
      'The Weekend coefficient plus the Millbrook × Weekend coefficient',
      'The Millbrook coefficient on its own',
      'The Millbrook coefficient plus the Millbrook × Weekend coefficient',
    ],
    categories: ['Harbourside’s weekend effect', 'Millbrook’s weekend effect', 'Cafés’ difference on weekdays', 'Cafés’ difference at weekends'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'Main effects are effects at the other predictor’s reference: Weekend is the weekend effect when Millbrook = 0.',
      1: 'On Millbrook’s rows the product equals the weekend dummy, so its weekend effect is the sum.',
      2: 'The Millbrook coefficient is the difference when Weekend = 0.',
      3: 'At weekends the product is 1 for Millbrook, so the gap adds the interaction.',
    },
    solution: 'Weekend: Harbourside’s weekend effect (+68.8). Weekend + interaction: Millbrook’s (−163.4). Millbrook: the gap on weekdays (+157.4). Millbrook + interaction: the gap at weekends (−74.8), all holding the weather fixed.',
  },
  {
    id: 'b06-cat-k6', type: 'num', kind: 'numerical',
    prompt: 'Ana wants to model one café’s footfall with a separate effect for each of its ten months of trading (March to December) and each day of the week, plus an intercept. How many dummy columns does she need?',
    answer: 15, check: () => (10 - 1) + (7 - 1), unit: 'columns', places: 0, tol: 0,
    wrong: [
      { value: 17, say: 'Each categorical predictor needs one dummy fewer than its levels when there is an intercept: 9 for the months and 6 for the days.' },
      { value: 16, say: 'Both variables need a reference level: (10 − 1) + (7 − 1).' },
    ],
    solution: '(10 − 1) + (7 − 1) = 9 + 6 = 15 dummies. With 306 days that is fine, but month dummies would also absorb most of the temperature’s seasonal variation, leaving the temperature slope to be estimated from day-to-day changes within months.',
  },
];
