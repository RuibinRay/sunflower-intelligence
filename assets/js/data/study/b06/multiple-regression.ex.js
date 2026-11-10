// multiple-regression.ex.js — B06 · Multiple regression: widgets, practice and the knowledge check (answer keys live
// here). The cafés’ log comes from case.js (Harbourside’s 306 days for the widget, its 30 days of September 2027 for the
// worksheets, both cafés’ 612 days for the waits). Pennick Bakeries, Merrivale Garden Centres, Barrowgate Cinemas,
// Westerholt Bookshops and the other businesses named are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { column } from './case.js?v=30';
import * as R from '../../../core/regression.js?v=30';

const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;

// ---------------------------------------------------------------- Harbourside, the whole year
const H = { cafe: 'Harbourside' };
const y = column('footfall', H), hi = column('high_f', H), rain = column('rain_in', H), wk = column('weekend', H);
const fest = column('festival01', H), day = column('day', H), mo = column('month', H);
const build = column('build_up', H);
const M3 = R.fit(y, { High: hi, Rain: rain, Weekend: wk, Festival: fest });
const M4 = R.fit(y, { High: hi, Rain: rain, Weekend: wk, Festival: fest, Build: build });
const c3 = M3.beta, c4 = M4.beta;

// ---------------------------------------------------------------- Harbourside, September 2027 (30 days)
const SEP = mo.map((m, i) => (m === 9 ? i : -1)).filter((i) => i >= 0);
const g = (a) => SEP.map((i) => a[i]);
const sep = { y: g(y), hi: g(hi), rain: g(rain), wk: g(wk) };
const SF = R.fit(sep.y, { High: sep.hi, Rain: sep.rain, Weekend: sep.wk });
const sepCells = {
  A1: 'Day', B1: 'Footfall', C1: 'High (°F)', D1: 'Rain (in)', E1: 'Weekend',
  ...col('A', 2, SEP.map((i) => `${Number(column('date', H)[i].slice(8, 10))} Sep`)), ...col('B', 2, sep.y), ...col('C', 2, sep.hi), ...col('D', 2, sep.rain), ...col('E', 2, sep.wk),
};
const view = 'A1:I31', widths = { A: 8, B: 10, C: 10, D: 10, E: 10, F: 3, G: 22, H: 12, I: 12 };
const newDay = { hi: 75, rain: 0, wk: 1 };
const sepPred = SF.predict([newDay.hi, newDay.rain, newDay.wk]).yhat;
const tRain = SF.coefs[2].t;

// ---------------------------------------------------------------- waits, both cafés
const S = column('peak_staff_hours'), T = column('transactions'), W = column('peak_wait_min');

// ---------------------------------------------------------------- fictional figures
const PB = { b1: 4.0, b2: 2.2, d: 15 };                     // Pennick Bakeries: sales on staff, with customers
const MG = { r2: 0.62, n: 40, k: 5 };                       // Merrivale Garden Centres: weekly sales model
const adjMG = 1 - (1 - MG.r2) * (MG.n - 1) / (MG.n - MG.k - 1);
const FMG = (MG.r2 / MG.k) / ((1 - MG.r2) / (MG.n - MG.k - 1));
const LZ = { c: 0.82, d: -3.1, e: 12.4, b: 25.0 };          // a LINEST row {m_E, m_D, m_C, b}
const lzFit = LZ.b + LZ.c * 10 + LZ.d * 2 + LZ.e * 1;
const k2diff = c4[1] * 10 + c4[3] - c4[2] * 0.5;

export const widgets = {
  'mult-foot': {
    type: 'regression',
    title: 'Harbourside’s daily footfall, 1 March – 31 December 2027 (306 days)',
    y: { name: 'Footfall', values: y },
    xs: [{ name: 'High (°F)', values: hi }, { name: 'Rain (in)', values: rain }, { name: 'Weekend', values: wk }, { name: 'Festival', values: fest }, { name: 'Build-up', values: build }],
    picked: [0],
    note: 'Weekend is 1 on Saturdays and Sundays, Festival 1 on the five harbour-festival days, and Build-up rises evenly from 0 on 1 March to 1 on 29 June, then stays at 1. Each coefficient is read with the other ticked predictors held fixed. The standard errors treat the days as independent; neighbouring days are alike, so they are somewhat too small.',
  },
  'mult-wait': {
    type: 'regression',
    title: 'Peak wait on peak barista hours and transactions (both cafés, 612 café-days)',
    y: { name: 'Peak wait (min)', values: W },
    xs: [{ name: 'Peak barista hours', values: S }, { name: 'Transactions', values: T }],
    picked: [0],
    note: 'With barista hours alone the slope is about +0.55 minutes per hour; holding transactions fixed it is about −1.26. The two cafés’ rows on the same day share its weather and season, so the rows aren’t independent and the t statistics are too large.',
  },
  'mult-ovb': {
    type: 'formula',
    title: 'The omitted-variable formula',
    intro: 'x₁ is the predictor you keep and x₂ the one you leave out. The defaults are the waits example: barista hours and transactions.',
    inputs: [
      { id: 'b1', label: 'Slope on x₁ with x₂ in the model (b₁)', min: -3, max: 3, step: 0.001, value: -1.264, fmt: 'num' },
      { id: 'b2', label: 'Slope on x₂ with x₁ in the model (b₂)', min: -0.2, max: 0.2, step: 0.0001, value: 0.0764, fmt: 'num' },
      { id: 'd', label: 'Slope of x₂ on x₁ (δ)', min: -40, max: 40, step: 0.01, value: 23.72, fmt: 'num' },
    ],
    compute: (v) => {
      const bias = v.b2 * v.d, short = v.b1 + bias;
      return {
        headline: { label: 'Slope on x₁ with x₂ left out (b̃₁)', value: fx(short, 3) },
        rows: [['Bias b₂ × δ', fx(bias, 3)], ['Slope with x₂ in (b₁)', fx(v.b1, 3)]],
        note: Math.abs(bias) < 1e-9 ? 'No bias: either x₂ doesn’t matter for y once x₁ is in, or it doesn’t go with x₁.'
          : Math.sign(short) !== Math.sign(v.b1) && Math.abs(v.b1) > 1e-9 ? 'The omitted predictor reverses the slope’s sign: leaving it out makes x₁ look as if it works the other way.'
            : bias > 0 ? 'Leaving x₂ out pushes the slope on x₁ up: x₁ is credited with part of x₂’s positive association with y.' : 'Leaving x₂ out pushes the slope on x₁ down.',
      };
    },
  },
};

export const guided = [
  {
    id: 'b06-mult-g1', type: 'steps', kind: 'applied',
    prompt: 'Harbourside’s footfall model over 306 days has the fitted equation footfall = 15.05 + 1.656 × high − 75.78 × rain + 69.14 × weekend + 329.9 × festival (high in °F, rain in inches; weekend and festival are 0/1).',
    solution: `The weekend slope compares a Saturday or Sunday with a weekday of the same weather and festival status. For a 75°F weekday with 0.2 inches of rain and no festival, ŷ = 15.05 + 1.656 × 75 − 75.78 × 0.2 = ${fx(15.05 + 1.656 * 75 - 75.78 * 0.2, 1)} people.`,
    steps: [
      {
        id: 'b06-mult-g1-s1', type: 'mc',
        prompt: 'What does the weekend slope, 69.14, say?',
        options: [
          'A weekend day had about 69 more people than a weekday of the same weather and festival status.',
          'Weekend days averaged 69 more people than weekdays over the year, whatever the weather was on those days.',
          'Moving a festival from a weekday to a weekend would add about 69 people to the festival’s crowd.',
          'About 69 of each weekend day’s visitors came because it was a weekend rather than for the weather.',
        ],
        answer: 0,
        hints: ['A slope in a multiple regression is a comparison between rows that are alike on the other predictors.'],
        feedback: {
          1: 'That would be the difference of the two group means, which is what a regression on the weekend column alone gives. With the weather in the model, the comparison is between days of the same weather.',
          2: 'The model is additive: it assumes the weekend adds the same amount on festival and non-festival days. It says nothing about moving events, which would also change their crowds in other ways.',
          3: 'The slope compares days; it doesn’t split one day’s visitors into reasons for coming.',
        },
      },
      {
        id: 'b06-mult-g1-s2', type: 'num',
        prompt: 'Predict footfall for a 75°F weekday with 0.2 inches of rain and no festival. Give one decimal place.',
        answer: rnd(15.05 + 1.656 * 75 - 75.78 * 0.2, 1), check: () => 15.05 + 1.656 * 75 + -75.78 * 0.2 + 69.14 * 0 + 329.9 * 0, unit: 'people', places: 1, tol: 0.15,
        wrong: [
          { value: rnd(15.05 + 1.656 * 75 - 75.78 * 0.2 + 69.14, 1), say: 'A weekday has weekend = 0, so the 69.14 doesn’t enter.' },
          { value: rnd(15.05 + 1.656 * 75 + 75.78 * 0.2, 1), say: 'The rain slope is negative: subtract 75.78 × 0.2.' },
        ],
        hints: ['Substitute high = 75, rain = 0.2, weekend = 0, festival = 0.', '15.05 + 1.656 × 75 − 75.78 × 0.2.'],
      },
    ],
  },
  {
    id: 'b06-mult-g2', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds Harbourside’s 30 days of September 2027: footfall in B, the high in C, rain in D and the weekend column in E. In G2, return the slope on the high temperature from the multiple regression of footfall on all three, in one formula using LINEST.',
    sheet: { cells: { ...sepCells, G1: 'Slope on high (people per °F)' } },
    cell: 'G2', answer: '=INDEX(LINEST(B2:B31,C2:E31),1,3)',
    alt: ['=INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),1,3)', '=INDEX(LINEST(B2:B31,C2:E31,TRUE,FALSE),1,3)'],
    require: ['LINEST'],
    view, maxHeight: '20rem', formats: { G2: '0.000' }, widths,
    wrong: [
      { formula: '=INDEX(LINEST(B2:B31,C2:E31),1,1)', say: 'LINEST returns the slopes in reverse order: the first entry belongs to the last x column, E (weekend). The high, in the first of three columns, is the third entry.' },
      { formula: '=SLOPE(B2:B31,C2:C31)', say: 'That is the simple slope on the high, with rain and the weekend left out. The question asks for the slope holding them fixed.' },
      { formula: '=INDEX(LINEST(B2:B31,C2:E31),1,4)', say: 'The fourth entry is the intercept. With three x columns the order is weekend, rain, high, intercept.' },
    ],
    hints: ['LINEST(B2:B31,C2:E31) returns one row: the slope on E, then on D, then on C, then the intercept.', '<x>=INDEX(LINEST(B2:B31,C2:E31),1,3)</x>'],
    solution: `<x>=INDEX(LINEST(B2:B31,C2:E31),1,3)</x> gives ${fx(SF.beta[1], 3)}: in September, among days with the same rain and the same weekend status, each extra °F went with about ${fx(SF.beta[1], 1)} more people. The simple slope, <x>=SLOPE(B2:B31,C2:C31)</x>, is ${fx(R.fit(sep.y, { h: sep.hi }).beta[1], 3)}.`,
  },
  {
    id: 'b06-mult-g3', type: 'num', kind: 'numerical',
    prompt: 'Pennick Bakeries (fictional) regresses daily sales ($) on the number of staff on shift and the number of customers. The slopes are $4.00 per staff member and $2.20 per customer. Days with one more staff member had, on average, 15 more customers (the slope of customers on staff). What slope on staff would a regression of sales on staff alone give?',
    answer: PB.b1 + PB.b2 * PB.d, check: () => 4.0 + 2.2 * 15, unit: '$ per staff member', places: 2, tol: 0.01,
    wrong: [
      { value: PB.b1, say: 'That is the slope with customers held fixed. Leaving customers out adds b₂ × δ = 2.20 × 15.' },
      { value: PB.b1 - PB.b2 * PB.d, say: 'The bias is added, not subtracted: b̃₁ = b₁ + b₂δ, and both b₂ and δ are positive here.' },
    ],
    hints: ['Use b̃₁ = b₁ + b₂δ with x₁ = staff, x₂ = customers.', '4.00 + 2.20 × 15.'],
    solution: 'b̃₁ = 4.00 + 2.20 × 15 = $37.00 per staff member. Staff alone look worth $37 a head because busy days have more staff and more customers; holding customers fixed, an extra staff member goes with only $4 more sales.',
  },
  {
    id: 'b06-mult-g4', type: 'num', kind: 'numerical',
    prompt: 'Merrivale Garden Centres (fictional) fits weekly sales at its 40 centres on five predictors and gets R² = 0.62. Calculate adjusted R². Give four decimal places.',
    answer: rnd(adjMG, 4), check: () => 1 - (1 - 0.62) * (40 - 1) / (40 - 6), unit: '', places: 4, tol: 0.0001,
    wrong: [
      { value: rnd(1 - (1 - 0.62) * 39 / 35, 4), say: 'n − p counts the intercept too: 40 − (5 + 1) = 34, not 35.' },
      { value: rnd(1 - (1 - 0.62) * 40 / 34, 4), say: 'The numerator is n − 1 = 39, not n.' },
    ],
    hints: ['p = k + 1 = 6 coefficients.', '1 − (1 − 0.62) × 39 ÷ 34.'],
    solution: `1 − 0.38 × 39 ÷ 34 = ${fx(adjMG, 4)}. Five predictors cost about six points of R² (0.62 against ${fx(adjMG, 4)}) with only 40 centres.`,
  },
];

export const independent = [
  {
    id: 'b06-mult-i1', type: 'formula', kind: 'numerical',
    prompt: 'G1 holds R² from the regression of September’s footfall on the high, rain and the weekend, G2 the number of days and G3 the number of predictors. In G4, calculate adjusted R² from these three cells.',
    sheet: { cells: { ...sepCells, G1: '=INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),3,1)', F1: '', H1: 'R²', G2: '=COUNT(B2:B31)', H2: 'n (days)', G3: 3, H3: 'k (predictors)', H4: 'Adjusted R²' }, fixed: ['G3'] },
    cell: 'G4', answer: '=1-(1-G1)*(G2-1)/(G2-G3-1)',
    alt: ['=1-(1-G1)*(G2-1)/(G2-(G3+1))', '=1-((1-G1)*(G2-1))/(G2-G3-1)'],
    view, maxHeight: '20rem', formats: { G1: '0.0000', G4: '0.0000' }, widths,
    wrong: [
      { formula: '=1-(1-G1)*(G2-1)/(G2-G3)', say: 'n − p counts the intercept: n − k − 1, not n − k.' },
      { formula: '=1-(1-G1)*G2/(G2-G3-1)', say: 'The numerator is n − 1.' },
      { formula: '=G1*(G2-1)/(G2-G3-1)', say: 'Adjusted R² scales the unexplained share, 1 − R², and subtracts it from 1.' },
    ],
    solution: `<x>=1-(1-G1)*(G2-1)/(G2-G3-1)</x> = 1 − (1 − ${SF.r2.toFixed(4)}) × 29 ÷ 26 = ${SF.adjR2.toFixed(4)}. With 30 days and three predictors, the adjustment costs about one point.`,
  },
  {
    id: 'b06-mult-i2', type: 'num', kind: 'numerical',
    prompt: 'For Merrivale Garden Centres’ model (40 centres, five predictors, R² = 0.62), calculate the overall F statistic. Give two decimal places.',
    answer: rnd(FMG, 2), check: () => (0.62 / 5) / (0.38 / 34), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd((0.62 / 5) / (0.38 / 35), 2), say: 'The residual degrees of freedom are n − p = 40 − 6 = 34.' },
      { value: rnd(0.62 / 0.38, 2), say: 'Divide each part by its degrees of freedom: R² by k = 5 and 1 − R² by n − p = 34.' },
    ],
    solution: `F = (0.62 ÷ 5) ÷ (0.38 ÷ 34) = 0.124 ÷ ${fx(0.38 / 34, 5)} = ${fx(FMG, 2)} on 5 and 34 df. <x>=F.DIST.RT(${fx(FMG, 2)},5,34)</x> is far below 0.001: the five predictors together account for more of the variation than chance would.`,
  },
  {
    id: 'b06-mult-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Barrowgate Cinemas (fictional) regresses weekly attendance on the number of new films released that week and finds a slope of 950 people per film. School holidays raise attendance and studios release more films in holiday weeks. If the analyst adds a 0/1 school-holiday column, what should happen to the slope on new films?',
    options: [
      'It should fall: part of the 950 was holiday crowds credited to the films.',
      'It should rise, because holidays and films both add attendance, so their effects combine.',
      'It should stay at 950, because a 0/1 column can’t change a slope on a count.',
      'It should turn negative, because adding a confounder always reverses the slope.',
    ],
    answer: 0,
    feedback: {
      1: 'Both effects are positive, but the bias b₂δ is positive (holidays add attendance and go with more releases), so removing it lowers the slope.',
      2: 'A 0/1 predictor is a predictor like any other; the omitted-variable formula applies.',
      3: 'Holding a confounder fixed can reverse a sign (as with the baristas), but only when the bias is larger than the slope itself. Nothing here says it is.',
    },
    solution: 'b̃₁ = b₁ + b₂δ: holidays add attendance (b₂ > 0) and come with more releases (δ > 0), so the short slope of 950 is too large. With the holiday column in, the slope compares weeks of the same holiday status and should fall.',
  },
  {
    id: 'b06-mult-i4', type: 'formula', kind: 'applied',
    prompt: 'Harbourside’s manager expects a 75°F, dry Saturday in late September. G2:I2 hold that day’s high, rain and weekend value. In G4, predict its footfall from the regression of September’s footfall on all three predictors, in one formula.',
    sheet: { cells: { ...sepCells, G1: 'High (°F)', H1: 'Rain (in)', I1: 'Weekend', G2: newDay.hi, H2: newDay.rain, I2: newDay.wk, G3: 'Predicted footfall' } },
    cell: 'G4', answer: '=TREND(B2:B31,C2:E31,G2:I2)',
    alt: ['=INDEX(LINEST(B2:B31,C2:E31),1,4)+INDEX(LINEST(B2:B31,C2:E31),1,3)*G2+INDEX(LINEST(B2:B31,C2:E31),1,2)*H2+INDEX(LINEST(B2:B31,C2:E31),1,1)*I2', '=SUMPRODUCT(LINEST(B2:B31,C2:E31),CHOOSE({1,2,3,4},I2,H2,G2,1))'],
    view, maxHeight: '20rem', formats: { G4: '0.0' }, widths,
    wrong: [
      { formula: '=FORECAST.LINEAR(G2,B2:B31,C2:C31)', say: 'FORECAST.LINEAR uses one x only (the high), so it ignores the rain and the weekend. TREND takes several x columns.' },
      { formula: '=TREND(B2:B31,C2:C31,G2)', say: 'That is the line on the high alone. Give TREND all three x columns, C2:E31, and the new day’s three values, G2:I2.' },
    ],
    solution: `<x>=TREND(B2:B31,C2:E31,G2:I2)</x> gives about ${fx(sepPred, 0)} people: the fitted equation ${fx(SF.beta[0], 1)} + ${fx(SF.beta[1], 2)} × 75 ${fx(SF.beta[2], 1).replace('−', '− ')} × 0 + ${fx(SF.beta[3], 1)} × 1. How far one day can fall from that is the prediction-and-intervals lesson’s question.`,
  },
  {
    id: 'b06-mult-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Westerholt Bookshops (fictional) reports standardised slopes from a model of daily sales on floor staff (0.20), footfall (0.55) and a 0/1 column for the annual book-fair week (0.08). The manager concludes that the book fair barely matters. What is the best response?',
    options: [
      'The fair’s column is 1 in one week a year, so its SD is tiny; judge its slope in dollars per fair day.',
      'She is right: standardised slopes rank the predictors by how much each of them causes sales to change.',
      'She should square the standardised slopes, because squared values give the share of R² each one explains.',
      'Standardised slopes are only valid when every predictor is a 0/1 column, so none of them can be read.',
    ],
    answer: 0,
    feedback: {
      1: 'Standardised slopes describe associations in one sample, scaled by its spreads; they don’t rank causes, and for a rare 0/1 column the SD is not a meaningful change.',
      2: 'With correlated predictors, squared standardised slopes don’t split R² into shares.',
      3: 'They can be computed for any predictor; the trouble is reading them for 0/1 and skewed ones.',
    },
    solution: 'A 0/1 column that is 1 in one week out of 52 has an SD of about 0.14 (√(1/52 × 51/52) = 0.137), so even a large effect per fair day gives a small standardised slope. Judge the fair from its slope in its own units (extra sales per fair day), set against how often fairs happen.',
  },
  {
    id: 'b06-mult-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about multiple regression that are true.',
    options: [
      'R² can’t fall when a predictor is added to the model.',
      'A slope can change sign when another predictor is added.',
      'The overall F test asks whether at least one slope differs from zero.',
      'Adjusted R² is the share of the variation in y the model accounts for, after allowing for chance.',
      'If every slope’s t test is non-significant, the overall F test must be non-significant too.',
      'Leaving out a predictor unrelated to the included ones biases their slopes.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Adjusted R² is R² with a charge for each coefficient. It isn’t a share of anything and can be negative.',
      4: 'When predictors carry the same information, the F test can be clearly significant while no single t is: the data show something matters but not which predictor.',
      5: 'Bias needs both b₂ ≠ 0 and δ ≠ 0. An unrelated omitted predictor (δ = 0) only widens the residual spread.',
    },
    solution: 'True: R² never falls; a slope can reverse (barista hours: +0.548 alone, −1.264 with transactions); F tests all the slopes at once. False: adjusted R² isn’t a share; F can be significant when no single t is; an unrelated omitted predictor causes no bias.',
  },
];

export const check = [
  {
    id: 'b06-mult-k1', type: 'mc', kind: 'conceptual',
    prompt: 'In Harbourside’s model with the build-up, the slope on the day’s high is 1.44 people per °F. Which reading is correct?',
    options: [
      'Among days alike on rain, weekend, festival and build-up, each °F goes with about 1.44 more people.',
      'Raising the temperature by 1°F on any given day would bring exactly 1.44 more people through the café door.',
      'Of all the variation in footfall, 1.44% is due to temperature once the other predictors are allowed for.',
      'Warm days had 1.44 more people than cold days on average, before rain and the calendar are considered.',
    ],
    answer: 0,
    feedback: {
      1: 'A coefficient from observational data is an association with the others held fixed, not a guaranteed effect of intervening.',
      2: 'A slope is a change per unit of the predictor, in y’s units; shares of variation are R²’s business.',
      3: 'That would be a simple slope. A multiple-regression slope holds the other predictors fixed.',
    },
    solution: 'A partial slope compares rows that match on the other predictors in the model: here rain, the weekend column, festival days and the build-up. Change those and the slope can change (2.02 with temperature alone).',
  },
  {
    id: 'b06-mult-k2', type: 'num', kind: 'numerical',
    prompt: `Harbourside’s model with the build-up has slopes of ${fx(c4[1], 3)} per °F, ${fx(c4[2], 2)} per inch of rain and ${fx(c4[3], 2)} for a weekend day. After the build-up, how many more people does it predict on a dry 75°F Saturday than on a 65°F Wednesday with 0.5 inches of rain (no festival on either)? Give one decimal place.`,
    answer: rnd(k2diff, 1), check: () => M4.predict([75, 0, 1, 0, 1]).yhat - M4.predict([65, 0.5, 0, 0, 1]).yhat, unit: 'people', places: 1, tol: 0.15,
    wrong: [
      { value: rnd(c4[1] * 10 + c4[3] + c4[2] * 0.5, 1), say: 'The Wednesday’s rain lowers its footfall, which widens the gap: subtract −76.08 × 0.5, i.e. add about 38.' },
      { value: rnd(c4[1] * 10 - c4[2] * 0.5, 1), say: 'The Saturday also gets the weekend slope.' },
    ],
    solution: `Only the predictors that differ matter: 10°F × ${fx(c4[1], 3)} + ${fx(c4[3], 2)} (weekend) + 0.5 × ${fx(-c4[2], 2)} (the Wednesday’s rain) = ${fx(k2diff, 1)} people. The intercept, festival and build-up terms are the same for both days and cancel.`,
  },
  {
    id: 'b06-mult-k3', type: 'formula', kind: 'numerical',
    prompt: 'For Harbourside’s September (footfall in B; high, rain and weekend in C:E), calculate in G2 the t statistic of the slope on rain, in one formula: the rain slope divided by its standard error, both from LINEST with its statistics.',
    sheet: { cells: { ...sepCells, G1: 't for rain' } },
    cell: 'G2', answer: '=INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),1,2)/INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),2,2)',
    alt: ['=INDEX(LINEST(B2:B31,C2:E31,1,1),1,2)/INDEX(LINEST(B2:B31,C2:E31,1,1),2,2)'],
    require: ['LINEST'],
    view, maxHeight: '20rem', formats: { G2: '0.000' }, widths,
    wrong: [
      { formula: '=INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),1,1)/INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),2,1)', say: 'Column 1 of LINEST’s output belongs to the last x column, the weekend. Rain, the middle of three columns, is column 2.' },
      { formula: '=INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),1,2)/INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),3,2)', say: 'Row 3, column 2 is the standard error of y (s), not of the slope. The slopes’ standard errors are in row 2.' },
      { formula: '=INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),1,3)/INDEX(LINEST(B2:B31,C2:E31,TRUE,TRUE),2,3)', say: 'Column 3 is the high temperature (the first x column comes third).' },
    ],
    solution: `Rain’s slope is ${fx(SF.beta[2], 2)} people per inch with a standard error of ${fx(SF.coefs[2].se, 2)}, so t = ${fx(tRain, 2)} on 26 df: holding the temperature and the weekend fixed, rainy September days had clearly lower footfall. The ToolPak prints the same t Stat in its coefficient row for Rain.`,
  },
  {
    id: 'b06-mult-k4', type: 'mc', kind: 'applied',
    prompt: 'Halcombe Gyms (fictional) opened a new branch in January and regresses its daily visits over the first year on the day’s high temperature. Membership grew steadily from January to June, then levelled off. The slope on temperature is large and positive. What is the main reason to doubt it?',
    options: [
      'Spring brought both warmer days and more members, so the slope credits the membership build-up to the weather.',
      'Daily visits are counts, so a regression on temperature can only be fitted after taking logs of them.',
      'The temperature range in one year is too narrow for any slope on temperature to be estimated at all.',
      'A positive slope on temperature can’t be right, because people exercise indoors when it is cold.',
    ],
    answer: 0,
    feedback: {
      1: 'Counts can be modelled directly; logs are a choice about the shape of the relationship (transformations-and-influence), not a requirement.',
      2: 'A year spans a wide range of temperatures; the problem is what else changes with them.',
      3: 'The sign is an empirical question; the issue is what the slope has absorbed.',
    },
    solution: 'An omitted time trend: the branch’s build-up coincides with the warming season, so a model without it credits growth to temperature, as Harbourside’s model without the build-up did (1.66 people per °F against 1.44 with it). Add a term for the build-up, or look at residuals in time order.',
  },
  {
    id: 'b06-mult-k5', type: 'num', kind: 'numerical',
    prompt: 'An analyst’s LINEST with x columns C, D and E (in that order) returns the row {0.82, −3.1, 12.4, 25.0}. What fitted value does the model give for a row with C = 10, D = 2 and E = 1? Give one decimal place.',
    answer: rnd(LZ.b + 12.4 * 10 - 3.1 * 2 + 0.82 * 1, 1), check: () => 25.0 + 12.4 * 10 + -3.1 * 2 + 0.82 * 1, unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(lzFit, 1), say: 'That reads the row in the columns’ order. LINEST returns them reversed: 0.82 is E’s slope, −3.1 is D’s and 12.4 is C’s.' },
    ],
    solution: `Reversed order: m_E = 0.82, m_D = −3.1, m_C = 12.4, b = 25.0. ŷ = 25.0 + 12.4 × 10 − 3.1 × 2 + 0.82 × 1 = ${fx(LZ.b + 12.4 * 10 - 3.1 * 2 + 0.82, 1)}.`,
  },
  {
    id: 'b06-mult-k6', type: 'mc', kind: 'applied',
    prompt: 'Ana’s operations manager reads that, over both cafés’ 612 days, the peak wait has a slope of +0.55 minutes per barista hour alone and −1.26 with transactions in the model. He wants to cut barista hours, citing the first number. Which reply is right?',
    options: [
      'At the same trade, extra hours go with shorter waits; the +0.55 reflects busy days getting more hours.',
      'Both numbers are estimates of the same effect, so the fair figure is their average, about −0.36 minutes per barista hour.',
      'The +0.55 is right and the −1.26 is a fitting artefact, because adding a predictor always makes slopes negative.',
      'Neither number can be used, because a slope on barista hours can’t be estimated when the hours come in half-hour steps.',
    ],
    answer: 0,
    feedback: {
      1: 'They answer different questions (all days, or days with the same trade). Averaging them answers neither.',
      2: 'Adding a predictor changes a slope by −b₂δ; here b₂δ = +1.81, which is why it fell. It can move a slope either way.',
      3: 'Half-hour steps are fine for regression; the predictor just takes repeated values.',
    },
    solution: 'The omitted-variable formula explains the gap: +0.548 = −1.264 + 0.0764 × 23.72. A roster decision compares days with and without an extra barista at the same trade, which is the −1.26. It is observational and the rows aren’t independent, so a trial would be the next step.',
  },
];
