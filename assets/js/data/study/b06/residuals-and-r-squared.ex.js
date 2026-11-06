// residuals-and-r-squared.ex.js — B06 · Residuals and R²: widgets, practice and the knowledge check (answer keys live
// here). Café data come from case.js (the corrected log); Otterburn Laundry, Peregrine Fitness, Lindenwood Garden Centre
// and the other businesses named are fictional. Formula items are marked by their results (core/sheet.js
// gradeFormula); num items recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_COLUMNS, DERIVED as D } from './case.js?v=26';
import * as R from '../../../core/regression.js?v=26';
import { mean } from '../../../core/stats.js?v=26';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const H = { cafe: 'Harbourside' };
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const win = (cafe, from, to) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const sum = (a) => a.reduce((s, v) => s + v, 0);

// ---------------------------------------------------------------- widgets' data
const SEP = win('Harbourside', '2027-09-01', '2027-09-30');
const pT = SEP.map((r) => r[at('transactions')]), pS = SEP.map((r) => r[at('sales')]);
const PF = R.fit(pS, { x: pT });
const tH = column('transactions', H), sH = column('sales', H);
const L = D.salesOnTransH;
const IC = column('iced_share'), HI = column('high_f');
const IL = R.fit(IC, { x: HI });

// ---------------------------------------------------------------- guided 1 and independent 1: Harbourside, 1–20 November
const NOV = win('Harbourside', '2027-11-01', '2027-11-20');
const nT = NOV.map((r) => r[at('transactions')]), nS = NOV.map((r) => r[at('sales')]);
const NF = R.fit(nS, { x: nT });
const novBase = {
  A1: 'Date', B1: 'Transactions', C1: 'Sales ($)', D1: 'Day', E1: 'Fitted sales', F1: 'Residual',
  ...col('A', 2, NOV.map((r) => short(r[at('date')]))), ...col('B', 2, nT), ...col('C', 2, nS), ...col('D', 2, NOV.map((r) => r[at('weekday')])),
  H1: '=INTERCEPT(C2:C21,B2:B21)', G1: 'Intercept', G2: 'Slope', H2: '=SLOPE(C2:C21,B2:B21)', G4: 'Residual SE', G5: 'R² from the sums',
};
const fitted = (i) => `=$H$1+$H$2*B${i}`;
const novFitted = col('E', 2, nT.map((_, k) => fitted(k + 2)));
const novResid = col('F', 2, nT.map((_, k) => `=C${k + 2}-E${k + 2}`));
const nE = nS.map((y, i) => y - (NF.beta[0] + NF.beta[1] * nT[i]));
const nSSE = sum(nE.map((e) => e * e)), nSST = sum(nS.map((y) => (y - mean(nS)) ** 2));
// ---------------------------------------------------------------- check 3: Millbrook, 1–24 November, footfall → transactions
const MN = win('Millbrook', '2027-11-01', '2027-11-24');
const mF = MN.map((r) => r[at('footfall')]), mT = MN.map((r) => r[at('transactions')]);
const MF = R.fit(mT, { x: mF }), MX = R.fit(mF, { x: mT });
const mnSheet = { cells: { A1: 'Date', B1: 'Footfall', C1: 'Transactions', ...col('A', 2, MN.map((r) => short(r[at('date')]))), ...col('B', 2, mF), ...col('C', 2, mT), E1: 'Typical miss (transactions)' } };
// ---------------------------------------------------------------- iced residual pattern, for the guided plot item
const band = (a, b) => { const k = HI.map((v, i) => (v >= a && v < b ? i : -1)).filter((i) => i >= 0); return mean(k.map((i) => IL.resid[i])); };
const FT = R.fit(column('footfall', H), { x: column('high_f', H) });

export const widgets = {
  'resid-fit': {
    type: 'fitline',
    title: 'SST against SSE: Harbourside, September 2027',
    x: { name: 'Transactions', values: pT },
    y: { name: 'Sales', values: pS, unit: '$' },
    labels: SEP.map((r) => short(r[at('date')])),
    start: { intercept: Math.round(mean(pS)), slope: 0 },
    ranges: { intercept: [-150, 500, 1], slope: [0, 9, 0.01] },
    show: ['residuals', 'sse', 'mean'],
    note: `You start at the flat line at the mean, $${mean(pS).toFixed(2)}, whose sum of squared residuals is SST = ${Math.round(PF.sst).toLocaleString('en-US')}. The least-squares line, sales = ${fx(PF.beta[0])} + ${PF.beta[1].toFixed(2)} × transactions, brings it down to SSE = ${Math.round(PF.sse).toLocaleString('en-US')}, so R² = 1 − SSE ÷ SST = ${PF.r2.toFixed(3)} for these 30 days.`,
  },
  'resid-toolpak': {
    type: 'regression',
    title: 'Regression of daily sales: Harbourside, 306 days',
    y: { name: 'sales', values: sH },
    xs: [{ name: 'transactions', values: tH }, { name: 'footfall', values: column('footfall', H) }],
    picked: [0],
    format: { y: 'money' },
    note: `With transactions as X: Regression SS ÷ Total SS = ${(L.sst - L.sse).toFixed(0)} ÷ ${L.sst.toFixed(0)} = ${L.r2.toFixed(4)}, the R Square, and the Standard Error is √(Residual MS) = $${L.sigma.toFixed(2)}, what STEYX returns. Footfall alone accounts for less of the variation, since not everyone who comes in buys. Pick one X at a time: with both, this is a multiple regression (module 3).`,
  },
  'resid-iced': {
    type: 'diagnostics',
    title: 'Residuals of the iced-share line: both cafés, 612 café-days',
    y: { name: 'Iced share', values: IC },
    xs: { 'High (°F)': HI },
    plots: ['fitted', 'order'],
    labels: column('date').map((d, i) => `${short(d)}, ${column('cafe')[i]}`),
    note: `R² = ${IL.r2.toFixed(3)} and s = ${IL.sigma.toFixed(3)}, yet the residuals against the fitted values form a wave: positive at the left (cold days, where the line goes below zero), negative through the middle, positive again near the top. In row order (time), the same wave appears as the season warms and cools. Both say the shape is wrong, not that the data are bad.`,
  },
  'resid-range': {
    type: 'formula',
    title: 'R² and the range of x: Harbourside’s sales on transactions',
    intro: 'Keep only the days whose transactions lie between the two limits, and refit.',
    inputs: [
      { id: 'lo', label: 'Fewest transactions kept', min: 13, max: 100, step: 1, value: 13, fmt: 'int' },
      { id: 'hi', label: 'Most transactions kept', min: 40, max: 293, step: 1, value: 293, fmt: 'int' },
    ],
    compute: (v) => {
      const k = tH.map((t, i) => (t >= v.lo && t <= v.hi ? i : -1)).filter((i) => i >= 0);
      if (v.hi - v.lo < 10 || k.length < 10) {
        return { headline: { label: 'R²', value: '—' }, rows: [['Days kept', String(k.length)]], note: 'Keep a range of at least 10 transactions and at least 10 days.', error: 'The range is too narrow to fit a line.' };
      }
      const f = R.fit(k.map((i) => sH[i]), { x: k.map((i) => tH[i]) });
      return {
        headline: { label: 'R²', value: f.r2.toFixed(3) },
        rows: [
          ['Days kept', String(k.length)],
          ['Residual standard error', `$${f.sigma.toFixed(2)}`],
          ['Slope', `$${f.beta[1].toFixed(2)} per transaction`],
          ['Standard deviation of sales on these days', `$${Math.sqrt(f.sst / (k.length - 1)).toFixed(2)}`],
        ],
        note: f.r2 < L.r2 - 0.01
          ? `On these ${k.length} days R² is ${f.r2.toFixed(3)}, below the full year’s ${L.r2.toFixed(3)}, while the typical miss is $${f.sigma.toFixed(2)} against $${L.sigma.toFixed(2)}. Less spread in transactions leaves less variation in sales for the line to account for.`
          : `With ${k.length} days the range is close to the full year’s, and so is R² (${f.r2.toFixed(3)}).`,
      };
    },
  },
};

export const guided = [
  {
    id: 'b06-resid-g1', type: 'steps', kind: 'numerical',
    prompt: 'Harbourside, 1–20 November 2027: transactions in B2:B21 and sales in C2:C21. H1 and H2 hold the least-squares intercept and slope. Work out the fitted values, the residuals and the residual standard error.',
    solution: `E2: <x>=$H$1+$H$2*B2</x>, filled to E21; F2: <x>=C2-E2</x>, filled to F21 (the residuals add to 0); H4: <x>=SQRT(SUMSQ(F2:F21)/(COUNT(F2:F21)-2))</x> = $${NF.sigma.toFixed(2)}, the same as <x>=STEYX(C2:C21,B2:B21)</x>. November’s line is typically about $${Math.round(NF.sigma)} off a day’s sales, about half the full year’s $28.10: these twenty days hold no festival and no very busy day.`,
    steps: [
      {
        id: 'b06-resid-g1-s1', type: 'formula',
        prompt: 'In E2, calculate the fitted sales for 1 November from the intercept in H1 and the slope in H2, so that the formula can be filled down to E21.',
        sheet: { cells: novBase },
        cell: 'E2', fill: 'E2:E21', answer: '=$H$1+$H$2*B2',
        alt: ['=$H$2*B2+$H$1', '=TREND($C$2:$C$21,$B$2:$B$21,B2)', '=FORECAST.LINEAR(B2,$C$2:$C$21,$B$2:$B$21)', '=H$1+H$2*B2'],
        view: 'A1:H21', maxHeight: '20rem', widths: { A: 8, D: 6, G: 12 }, formats: { C: '0.00', E: '0.00', F: '0.00', H1: '0.00', H2: '0.0000' },
        wrong: [
          { formula: '=H1+H2*B2', say: 'Filled down, H1 and H2 move to H2 and H3. Anchor them with $: <x>=$H$1+$H$2*B2</x>.' },
          { formula: '=$H$2+$H$1*B2', say: 'Intercept and slope are swapped: ŷ = b₀ + b₁x, with b₀ in H1 and b₁ in H2.' },
          { formula: '=$H$1+$H$2*C2', say: 'The fitted value comes from x, the transactions in column B, not from the sales.' },
        ],
        hints: ['ŷ = b₀ + b₁x; the coefficients must stay put when the formula is filled down.', '<x>=$H$1+$H$2*B2</x>'],
      },
      {
        id: 'b06-resid-g1-s2', type: 'formula',
        prompt: 'In F2, calculate the residual for 1 November, to be filled down to F21.',
        sheet: { cells: { ...novBase, ...novFitted } },
        cell: 'F2', fill: 'F2:F21', answer: '=C2-E2',
        alt: ['=-(E2-C2)', '=C2-($H$1+$H$2*B2)'],
        view: 'A1:H21', maxHeight: '20rem', widths: { A: 8, D: 6, G: 12 }, formats: { C: '0.00', E: '0.00', F: '0.00', H1: '0.00', H2: '0.0000' },
        wrong: [
          { formula: '=E2-C2', say: 'A residual is observed minus fitted, y − ŷ, so a day above the line has a positive residual.' },
          { formula: '=C2-AVERAGE($C$2:$C$21)', say: 'That is the deviation from the mean, y − ȳ. The residual is measured from the line: y − ŷ.' },
        ],
        hints: ['e = y − ŷ.', '<x>=C2-E2</x>'],
      },
      {
        id: 'b06-resid-g1-s3', type: 'formula',
        prompt: 'In H4, calculate the residual standard error from the residuals in F2:F21, without STEYX.',
        sheet: { cells: { ...novBase, ...novFitted, ...novResid } },
        cell: 'H4', answer: '=SQRT(SUMSQ(F2:F21)/(COUNT(F2:F21)-2))',
        alt: ['=SQRT(SUMSQ(F2:F21)/18)', '=SQRT(SUMPRODUCT(F2:F21,F2:F21)/(COUNT(F2:F21)-2))', '=SQRT(SUMSQ(F2:F21)/(ROWS(F2:F21)-2))', '=SQRT(SUMPRODUCT(F2:F21^2)/(COUNT(F2:F21)-2))'],
        view: 'A1:H21', maxHeight: '20rem', widths: { A: 8, D: 6, G: 12 }, formats: { C: '0.00', E: '0.00', F: '0.00', H1: '0.00', H2: '0.0000', H4: '0.00' },
        wrong: [
          { formula: '=SQRT(SUMSQ(F2:F21)/COUNT(F2:F21))', say: 'Divide by n − 2, not n: two coefficients were estimated from these 20 days.' },
          { formula: '=STDEV.S(F2:F21)', say: 'STDEV.S divides by n − 1. The residual standard error divides SSE by n − 2.' },
          { formula: '=SUMSQ(F2:F21)/(COUNT(F2:F21)-2)', say: 'That is s², the residual mean square. Take its square root.' },
        ],
        hints: ['s = √(SSE ÷ (n − 2)), and SSE is SUMSQ of the residuals.', '<x>=SQRT(SUMSQ(F2:F21)/(COUNT(F2:F21)-2))</x>'],
      },
    ],
  },
  {
    id: 'b06-resid-g2', type: 'num', kind: 'numerical',
    prompt: 'Peregrine Fitness (fictional) regresses monthly membership cancellations on the number of months since a studio opened, across 24 studio-months. The total sum of squares of cancellations is 4,820 and the residual sum of squares is 1,205. What is R²? Give three decimal places.',
    answer: rnd(1 - 1205 / 4820, 3), check: () => (4820 - 1205) / 4820, unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: rnd(1205 / 4820, 3), say: 'That is SSE ÷ SST, the share left unexplained. R² = 1 − SSE ÷ SST.' },
      { value: rnd(Math.sqrt(1 - 1205 / 4820), 3), say: 'That is √R², the size of r. R² itself is 1 − SSE ÷ SST.' },
    ],
    hints: ['R² = 1 − SSE ÷ SST.', '1 − 1,205 ÷ 4,820.'],
    solution: 'R² = 1 − 1,205 ÷ 4,820 = 0.750: the line accounts for 75% of the variation in cancellations around their mean. SSR = 4,820 − 1,205 = 3,615. The residual standard error is √(1,205 ÷ 22) ≈ 7.4 cancellations a month, the figure to judge against what the studios need to plan for.',
  },
  {
    id: 'b06-resid-g3', type: 'mc', kind: 'conceptual',
    prompt: `The iced-share line for both cafés has R² = ${IL.r2.toFixed(3)}. Its average residual is ${fx(band(0, 45), 3)} on days below 45 °F, ${fx(band(55, 65), 3)} on days of 55–64 °F and ${fx(band(75, 85), 3)} on days of 75–84 °F. What should Ana conclude?`,
    options: [
      'The relationship is curved: the line misses in a pattern, so it is the wrong shape however high R² is.',
      'The line is fine, because with an R² this high the residuals are too small to matter for ordering.',
      'The residuals average zero overall, so the positive and negative bands cancel out and there is no problem.',
      'The pattern shows the iced share was measured badly on the cold days, so those days should be removed.',
    ],
    answer: 0,
    hints: ['If a line is the right shape, residuals scatter around zero in every band of x.', 'A run of positive, then negative, then positive residuals is a curve.'],
    feedback: {
      1: 'R² measures how much variation the line follows, not whether it has the right shape. Averages of ±0.1 are 10 percentage points of drinks.',
      2: 'Residuals always average zero overall with least squares. The question is whether they average zero within each part of the range; here they don’t.',
      3: 'Nothing suggests bad measurement. The cold-day shares are near 0.06, as expected; it is the line that goes negative.',
    },
    solution: 'A systematic sign pattern across x means the relationship isn’t straight. The iced share follows an S-shaped curve in temperature (the case’s data were generated that way), so a straight line misses in a wave and even gives negative shares on the coldest days. Fit a curve or use banded averages.',
  },
];

export const independent = [
  {
    id: 'b06-resid-i1', type: 'formula', kind: 'numerical',
    prompt: 'The November worksheet now has the residuals in F2:F21 (sales in C2:C21). In H5, calculate R² from the sums of squares: one minus the residual sum of squares over the total sum of squares.',
    sheet: { cells: { ...novBase, ...novFitted, ...novResid } },
    cell: 'H5', answer: '=1-SUMSQ(F2:F21)/DEVSQ(C2:C21)',
    alt: ['=(DEVSQ(C2:C21)-SUMSQ(F2:F21))/DEVSQ(C2:C21)', '=1-SUMPRODUCT(F2:F21,F2:F21)/DEVSQ(C2:C21)', '=DEVSQ(E2:E21)/DEVSQ(C2:C21)'],
    require: ['DEVSQ'],
    view: 'A1:H21', maxHeight: '20rem', widths: { A: 8, D: 6, G: 14 }, formats: { C: '0.00', E: '0.00', F: '0.00', H1: '0.00', H2: '0.0000', H5: '0.0000' },
    wrong: [
      { formula: '=SUMSQ(F2:F21)/DEVSQ(C2:C21)', say: 'That is SSE ÷ SST, the share not accounted for. R² is 1 minus it.' },
      { formula: '=1-SUMSQ(F2:F21)/SUMSQ(C2:C21)', say: 'SST is measured around the mean: DEVSQ(C2:C21), not the sum of the squared sales themselves.' },
    ],
    solution: `<x>=1-SUMSQ(F2:F21)/DEVSQ(C2:C21)</x> = ${(1 - nSSE / nSST).toFixed(4)}, the same as <x>=RSQ(C2:C21,B2:B21)</x>. SSE = ${nSSE.toFixed(0)} and SST = ${nSST.toFixed(0)}.`,
  },
  {
    id: 'b06-resid-i2', type: 'num', kind: 'numerical',
    prompt: `A line fitted to 20 days has a residual sum of squares of ${Math.round(nSSE).toLocaleString('en-US')} (dollars squared). What is the residual standard error? Give two decimal places.`,
    answer: rnd(Math.sqrt(Math.round(nSSE) / 18), 2), check: () => Math.sqrt(Math.round(nSSE) / (20 - 2)), unit: '$', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(Math.sqrt(Math.round(nSSE) / 20), 2), say: 'Divide by n − 2 = 18, not n.' },
      { value: rnd(Math.sqrt(Math.round(nSSE) / 19), 2), say: 'n − 1 is for a standard deviation around one mean. A line estimates two coefficients: n − 2.' },
      { value: rnd(Math.round(nSSE) / 18, 2), say: 'That is s². Take the square root to get back to dollars.' },
    ],
    solution: `s = √(${Math.round(nSSE).toLocaleString('en-US')} ÷ 18) = $${Math.sqrt(Math.round(nSSE) / 18).toFixed(2)}: the fitted sales are typically about $${Math.round(Math.sqrt(nSSE / 18))} from the actual sales.`,
  },
  {
    id: 'b06-resid-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Harbourside’s line of sales on transactions has R² = 0.984. Classify each description of it.',
    items: [
      'The line accounts for 98.4% of the variation in daily sales around their mean.',
      'The line’s predictions are 98.4% accurate.',
      'Transactions cause 98.4% of the café’s sales.',
      'The squared correlation between transactions and sales is 0.984.',
      'The squared correlation between the actual and the fitted sales is 0.984.',
      'The regression of transactions on sales has the same R².',
    ],
    categories: ['Correct', 'Not correct'],
    answer: [0, 1, 1, 0, 0, 0],
    feedback: {
      1: 'R² is a share of variation, not an accuracy rate; the typical miss is s = $28.10.',
      2: 'R² describes association in squared deviations. It says nothing about causes.',
      5: 'Correct: with one explanatory variable R² = r², and r is the same whichever variable is x.',
    },
    solution: 'R² = SSR ÷ SST, the share of the variation around the mean that lies along the line. With one explanatory variable it equals r² (so it is the same for either regression), and it always equals the squared correlation between y and ŷ. It is neither an accuracy rate nor a causal share.',
  },
  {
    id: 'b06-resid-i4', type: 'num', kind: 'numerical',
    prompt: 'Harbourside’s line is sales = −76.58 + 6.641 × transactions. On Wednesday 6 October 2027 the café made 63 transactions and took $354.05. What is that day’s residual? Give two decimal places.',
    answer: rnd(354.05 - (-76.58 + 6.641 * 63), 2), check: () => 354.05 - (-76.58 + 6.641 * 63), unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: rnd(-76.58 + 6.641 * 63 - 354.05, 2), say: 'That is fitted minus observed. A residual is y − ŷ: the day took more than the line, so its residual is positive.' },
      { value: rnd(354.05 - 358.17, 2), say: 'That is the deviation from the year’s mean sales. The residual is measured from the line.' },
    ],
    solution: `ŷ = −76.58 + 6.641 × 63 = $${(-76.58 + 6.641 * 63).toFixed(2)}; e = 354.05 − ${(-76.58 + 6.641 * 63).toFixed(2)} = +$${(354.05 - (-76.58 + 6.641 * 63)).toFixed(2)}. The day sold a little more than the line expects for 63 transactions: well inside one residual standard error ($28.10).`,
  },
  {
    id: 'b06-resid-i5', type: 'mc', kind: 'applied',
    prompt: `Ana’s assistant manager says: “Footfall on the day’s high has R² = ${FT.r2.toFixed(2)} at Harbourside, so temperature hardly matters and we can ignore the forecast when hiring for the summer.” The slope is ${FT.beta[1].toFixed(1)} people per °F and the residual standard error ${Math.round(FT.sigma)} people. What is the best reply?`,
    options: [
      'For seasonal hiring the slope matters: July runs about 61 people a day above March.',
      'He is right: with R² below 0.2, temperature explains so little that the line is no use for anything.',
      'He is right for single days but wrong for hiring, because R² rises once only summer days are used.',
      'R² is low because the line is the wrong shape; a curve would make temperature explain almost everything.',
    ],
    answer: 0,
    feedback: {
      1: 'A low R² means most day-to-day variation comes from elsewhere (weekends, rain, festivals), not that the slope is small. Two people per degree over a 30 °F season is about 61 people a day.',
      2: 'Restricting the range of x lowers R², it doesn’t raise it.',
      3: 'Nothing here suggests a curve; weekends and rain, which the line leaves out, account for much of the variation.',
    },
    solution: 'R² = 0.19 with s = 62 people: the forecast high alone can’t predict a particular day’s footfall well. But the slope, 2.0 people per °F, applied to March’s 53 °F and July’s 84 °F averages, puts July about 61 people a day busier on the line, roughly an extra barista hour at the morning peak. That 61 is the line’s figure and partly the cafés’ opening build-up through the cold spring; module 3 holds the build-up fixed and finds a smaller slope. Use the slope for the seasonal plan and other information (the day of the week) for daily rosters.',
  },
];

export const check = [
  {
    id: 'b06-resid-k1', type: 'mc', kind: 'conceptual',
    prompt: 'For a least-squares line with an intercept, which statement about the sums of squares is true?',
    options: [
      'SST = SSR + SSE, so a line that makes SSE smaller necessarily accounts for more of SST.',
      'SSR + SST = SSE, because the residuals contain both the regression and the total variation.',
      'SST = SSR × SSE, so R² is the ratio of the two parts.',
      'SST changes with the slope chosen, so different lines give different totals to split.',
    ],
    answer: 0,
    feedback: {
      1: 'SSE is the smallest piece: SST, the total, is SSR plus SSE.',
      2: 'The parts add, they don’t multiply.',
      3: 'SST = Σ(y − ȳ)² uses only y and its mean; no line is involved, so it is the same for every line.',
    },
    solution: 'SST depends only on y. For least squares with an intercept it splits into SSR (the fitted values’ variation) plus SSE (the residuals’), so R² = SSR ÷ SST = 1 − SSE ÷ SST.',
  },
  {
    id: 'b06-resid-k2', type: 'num', kind: 'numerical',
    prompt: 'A regression of weekly sales on weekly visitors at Lindenwood Garden Centre (fictional) has total sum of squares 2,600,000 and R² = 0.62. What is the regression sum of squares?',
    answer: 0.62 * 2600000, check: () => 0.62 * 2.6e6, unit: '', places: 0, tol: 1,
    wrong: [
      { value: 0.38 * 2600000, say: 'That is SSE, the part not accounted for: (1 − R²) × SST.' },
      { value: 2600000 / 0.62, say: 'R² = SSR ÷ SST, so SSR = R² × SST.' },
    ],
    solution: 'SSR = R² × SST = 0.62 × 2,600,000 = 1,612,000; SSE = 988,000.',
  },
  {
    id: 'b06-resid-k3', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook, 1–24 November 2027: footfall in B2:B25 and transactions in C2:C25. In F1, calculate the typical miss, in transactions, of the least-squares line of transactions on footfall.',
    sheet: mnSheet,
    cell: 'F1', answer: '=STEYX(C2:C25,B2:B25)',
    alt: ['=SQRT((1-RSQ(C2:C25,B2:B25))*DEVSQ(C2:C25)/(COUNT(C2:C25)-2))', '=INDEX(LINEST(C2:C25,B2:B25,TRUE,TRUE),3,2)'],
    view: 'A1:F25', maxHeight: '20rem', widths: { A: 8, E: 24 }, formats: { F1: '0.00' },
    wrong: [
      { formula: '=STEYX(B2:B25,C2:C25)', say: 'That is the typical miss of the line of footfall on transactions, in people. STEYX takes known_y’s first: transactions, in C.' },
      { formula: '=STDEV.S(C2:C25)', say: 'That is the spread of transactions around their mean, the typical miss with no line at all.' },
      { formula: '=RSQ(C2:C25,B2:B25)', say: 'That is R², a proportion. The typical miss in transactions is the residual standard error: STEYX.' },
    ],
    solution: `<x>=STEYX(C2:C25,B2:B25)</x> = ${MF.sigma.toFixed(2)} transactions, with R² = ${MF.r2.toFixed(3)}. The swapped version gives ${MX.sigma.toFixed(2)} people, the typical miss of a different line.`,
  },
  {
    id: 'b06-resid-k4', type: 'num', kind: 'numerical',
    prompt: 'At Harbourside the least-squares line of footfall on rain has a negative slope and R² = 0.0518. What is the correlation between rain and footfall? Give three decimal places.',
    answer: -rnd(Math.sqrt(0.0518), 3), check: () => -Math.sqrt(0.0518), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: rnd(Math.sqrt(0.0518), 3), say: 'Squaring loses the sign. The slope is negative, so r is negative: −√R².' },
      { value: 0.0518, say: 'That is R², the square of r.' },
    ],
    solution: 'r = −√0.0518 = −0.228, the correlation the testing-correlation lesson (B05) reported for Harbourside.',
  },
  {
    id: 'b06-resid-k5', type: 'mc', kind: 'applied',
    prompt: 'Two regional managers of a convenience-store chain (fictional) each regress store sales on store floor area. The North’s stores range from 80 to 400 square metres and its R² is 0.71; the South’s range from 150 to 220 and its R² is 0.32. Both have about the same residual standard error. What is the most likely explanation?',
    options: [
      'The South’s narrower range of floor areas leaves less variation for the line to account for.',
      'Floor area matters much more to sales in the North, so the North should build bigger stores.',
      'The South’s regression must be wrong, because correct regressions on the same kind of data give the same R².',
      'The South’s stores are more profitable, which weakens the link between their size and their sales figures.',
    ],
    answer: 0,
    feedback: {
      1: 'R² differs with the spread of x even when the relationship is the same; compare slopes and residual standard errors, not R².',
      2: 'Nothing is wrong with the South’s fit: a restricted range lowers R² by itself.',
      3: 'Profitability isn’t in the regression; the explanation is the range of x.',
    },
    solution: 'With similar residual standard errors, the lines miss by similar amounts. The North’s wide range of floor areas creates a large spread in sales for the line to follow, so its R² is high; the South’s narrow range doesn’t. R² compares the spread along the line with the total spread, which depends on the range of x.',
  },
  {
    id: 'b06-resid-k6', type: 'multi', kind: 'conceptual',
    prompt: 'A line has R² = 0.93. Which of these does that number, on its own, tell you? Select all that apply.',
    options: [
      'The line accounts for 93% of the variation of y around its mean in these data.',
      'With one explanatory variable, |r| is about 0.96.',
      'A straight line is the right shape for the relationship.',
      'The line will predict new cases about as well as it fits these.',
      'Changes in x cause changes in y.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'A curved relationship can have a high R²: check a residual plot.',
      3: 'R² is computed on the fitting data and flatters performance on new data.',
      4: 'R² measures association, not causation.',
    },
    solution: 'R² is SSR ÷ SST for these data, and with one explanatory variable |r| = √0.93 ≈ 0.964. It says nothing about shape (plot the residuals), out-of-sample accuracy or causes.',
  },
];
