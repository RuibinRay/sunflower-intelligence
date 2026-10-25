// proportions-and-chi-square.ex.js — B04 · Proportions and chi-square tests: widgets, practice and the knowledge check
// (answer keys live here). Lantern's figures come from case.js (B01's monthly shop figures, the spring weekdays and the
// channel and region tables); every other business is fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { WEEKDAYS, CHANNEL_SUBSCRIPTION, REGION_SUBSCRIPTION, RATING_BY_CHANNEL, SHOP, DERIVED as D } from './case.js?v=15';
import * as I from '../../../core/inference.js?v=15';

const WK = D.weekdays, CS = D.channelSubscription, RG = D.regionSubscription;
const cs = CHANNEL_SUBSCRIPTION.counts, rg = REGION_SUBSCRIPTION.counts;
const OCT = I.propTest2(SHOP.webOrders[3], SHOP.webVisits[3], SHOP.webOrders[2], SHOP.webVisits[2]);   // October minus September
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------------------------------------------------------------- sheets
const channelSheet = {
  cells: {
    A1: 'Observed', B1: 'Subscription', C1: 'One-off', D1: 'Total',
    A2: 'web', B2: cs[0][0], C2: cs[0][1], D2: '=B2+C2',
    A3: 'app', B3: cs[1][0], C3: cs[1][1], D3: '=B3+C3',
    A4: 'Total', B4: '=B2+B3', C4: '=C2+C3', D4: '=D2+D3',
    A6: 'Expected', B6: 'Subscription', C6: 'One-off',
    A7: 'web', B7: '=$D2*B$4/$D$4', C7: '=$D2*C$4/$D$4',
    A8: 'app', B8: '=$D3*B$4/$D$4', C8: '=$D3*C$4/$D$4',
    A10: 'χ²', B10: '=SUMPRODUCT((B2:C3-B7:C8)^2/B7:C8)',
    A11: 'Degrees of freedom', B11: '=(ROWS(B2:C3)-1)*(COLUMNS(B2:C3)-1)',
    A12: 'p-value (CHISQ.TEST)', B12: '=CHISQ.TEST(B2:C3,B7:C8)',
    A13: 'p-value (CHISQ.DIST.RT)', B13: '=CHISQ.DIST.RT(B10,B11)',
    A14: 'Smallest expected count', B14: '=MIN(B7:C8)',
    A15: 'Cramér’s V', B15: '=SQRT(B10/(D4*MIN(ROWS(B2:C3)-1,COLUMNS(B2:C3)-1)))',
    A17: 'Subscription share, web', B17: '=B2/D2',
    A18: 'Subscription share, app', B18: '=B3/D3',
    A19: 'Two-proportion z (app − web)', B19: '=(B18-B17)/SQRT(B4/D4*(1-B4/D4)*(1/D2+1/D3))',
    A20: 'z squared', B20: '=B19^2',
  },
};
const octBase = {
  B1: 'September', C1: 'October',
  A2: 'Web orders', B2: SHOP.webOrders[2], C2: SHOP.webOrders[3],
  A3: 'Web visits', B3: SHOP.webVisits[2], C3: SHOP.webVisits[3],
  A4: 'Conversion', B4: '=B2/B3', C4: '=C2/C3',
  A6: 'Pooled proportion', A7: 'Standard error', A8: 'z (October − September)', A9: 'p-value (two-sided)',
};
const octFormats = { B4: '0.00%', C4: '0.00%', B6: '0.0000', B7: '0.000000', B8: '0.00', B9: '0.000000', B3: '#,##0', C3: '#,##0' };
const weekdaySheet = {
  cells: {
    A1: 'Weekday', B1: 'Days', C1: 'Orders', D1: 'Expected',
    ...Object.fromEntries(WEEKDAYS.names.flatMap((n, i) => [[`A${i + 2}`, n], [`B${i + 2}`, WEEKDAYS.days[i]], [`C${i + 2}`, WEEKDAYS.orders[i]]])),
    A9: 'Total', B9: '=SUM(B2:B8)', C9: '=SUM(C2:C8)',
  },
};
const REGIONS = REGION_SUBSCRIPTION.rows;
const regionSheet = {
  cells: {
    A1: 'Region', B1: 'Subscription', C1: 'One-off', D1: 'Total', F1: 'Expected: subscription', G1: 'Expected: one-off',
    ...Object.fromEntries(REGIONS.flatMap((g, i) => [[`A${i + 2}`, g], [`B${i + 2}`, rg[i][0]], [`C${i + 2}`, rg[i][1]], [`D${i + 2}`, `=B${i + 2}+C${i + 2}`],
      [`F${i + 2}`, `=$D${i + 2}*B$7/$D$7`], [`G${i + 2}`, `=$D${i + 2}*C$7/$D$7`]])),
    A7: 'Total', B7: '=SUM(B2:B6)', C7: '=SUM(C2:C6)', D7: '=SUM(D2:D6)',
    A9: 'p-value',
  },
};
// fictional: Hollybank Hotel's maintenance requests per day over 100 days, λ from the full log
const MAINT = [28, 37, 23, 12], MAINT_LAMBDA = 1.25;
const maintSheet = {
  cells: {
    A1: 'Requests in a day', B1: 'Days (O)', C1: 'Expected (E)', E1: 'λ (from the log)', F1: MAINT_LAMBDA,
    A2: '0', A3: '1', A4: '2', A5: '3 or more',
    B2: MAINT[0], B3: MAINT[1], B4: MAINT[2], B5: MAINT[3], A6: 'Total', B6: '=SUM(B2:B5)',
    C2: '=$B$6*POISSON.DIST(0,$F$1,FALSE)', C3: '=$B$6*POISSON.DIST(1,$F$1,FALSE)', C4: '=$B$6*POISSON.DIST(2,$F$1,FALSE)', C5: '=$B$6*(1-POISSON.DIST(2,$F$1,TRUE))',
    C6: '=SUM(C2:C5)', E3: 'χ²', F3: '=SUMPRODUCT((B2:B5-C2:C5)^2/C2:C5)', E4: 'p-value',
  },
};
const MP = [0, 1, 2].map((k) => I.poissonPmf(k, MAINT_LAMBDA));
const MEXP = [...MP.map((p) => 100 * p), 100 * (1 - MP.reduce((a, b) => a + b, 0))];
const MFIT = I.chisqGof(MAINT, MEXP, { ddof: 1 });
// fictional: a city bike-hire scheme's hires by first-time users, weekday against weekend
const bikeSheet = {
  cells: {
    B1: 'Weekday', C1: 'Weekend', A2: 'First-time users', B2: 36, C2: 54, A3: 'Hires', B3: 400, C3: 300,
    A4: 'Proportion first-time', B4: '=B2/B3', C4: '=C2/C3', A6: 'Confidence level', B6: 0.95, A7: 'Lower limit (weekend − weekday)',
  },
  vary: { B6: [0.9, 0.99] },
};
const BIKE = I.propTest2(54, 300, 36, 400);
const critSheet = { cells: { A1: 'Significance level', B1: 0.05, A2: 'Rows in the table', B2: 3, A3: 'Columns in the table', B3: 4, A4: 'Critical value' }, vary: { B1: [0.01, 0.1], B2: [2, 5], B3: [2, 3] } };
// fictional: a bike-hire firm's rentals by bike type against its planned shares
const BT_O = [66, 54, 30], BT_P = [0.5, 0.3, 0.2];
const BT = I.chisqGof(BT_O, BT_P);

export const widgets = {
  'pc-weekdays': {
    type: 'chart', kind: 'bar',
    title: 'Lantern’s spring orders by weekday: observed and expected if every day had the same order rate',
    x: { label: 'Weekday', values: WEEKDAYS.names },
    series: [{ name: 'Observed orders', values: WEEKDAYS.orders }, { name: 'Expected orders', values: WK.expected.map((e) => Math.round(e * 100) / 100) }],
    y: { label: 'Orders', format: 'num' },
    note: `Expected = 231 × days ÷ 122: about 34.08 for the three weekdays that occurred 18 times and 32.19 for the four that occurred 17 times. The largest gap is Sunday’s (26 against 34.08). Together the gaps give χ² = ${WK.stat.toFixed(2)} with 6 degrees of freedom, p = ${WK.p.toFixed(2)}.`,
  },
  'pc-curve': {
    type: 'curve', title: 'The weekday test on the chi-square distribution',
    dist: 'chisq', params: { df: 6 }, vary: ['df'], asks: ['above', 'inverse'],
    a: Math.round(WK.stat * 100) / 100, prob: 0.95, places: 2, xLabel: 'χ²',
    critical: { alpha: 0.05, tails: 'upper' }, stat: { value: WK.stat, label: 'χ²' },
    note: 'P(χ² &gt; a) is the p-value of a chi-square test: <x>=CHISQ.DIST.RT(a,df)</x>. With 6 degrees of freedom the 5% critical value is 12.59, and the weekday statistic of 5.82 sits well inside the bulk of the distribution. “Value for a probability” finds the value with that probability below it, so a probability of 0.95 gives the 5% critical value, the same as <x>=CHISQ.INV.RT(0.05,df)</x>.',
  },
  'pc-sheet': {
    type: 'sheet', title: 'Channel × subscription: Lantern’s spring orders as a worksheet',
    sheet: channelSheet, view: 'A1:D20', editable: 'B2:C3',
    formats: { B7: '0.00', C7: '0.00', B8: '0.00', C8: '0.00', B10: '0.000', B12: '0.000000', B13: '0.000000', B14: '0.00', B15: '0.000', B17: '0.0%', B18: '0.0%', B19: '0.000', B20: '0.000' },
    widths: { A: 26, B: 13, C: 11 },
    tools: ['formulas', 'reset'],
    note: 'B7 holds <x>=$D2*B$4/$D$4</x>, filled to C8: row total × column total ÷ grand total. B12 and B13 give the same p-value two ways. B19 is the two-proportion z test on the same counts, and B20 shows that its square equals χ² in B10 for any 2 × 2 table. Change a count in B2:C3 to see every line update.',
  },
};

export const guided = [
  {
    id: 'b04-pc-g1', type: 'steps', kind: 'numerical',
    prompt: `The fix for the payment-page bug on mobile browsers went live on 5 October. In October the website took ${SHOP.webOrders[3]} orders from ${SHOP.webVisits[3].toLocaleString('en-US')} visits, against ${SHOP.webOrders[2]} from ${SHOP.webVisits[2].toLocaleString('en-US')} in September. Test whether web conversion differed between the two months (two-sided, α = 0.05), building the two-proportion z test in the worksheet.`,
    solution: `Pooled proportion (158 + 222) ÷ (8,800 + 8,300) = 380 ÷ 17,100 ≈ ${OCT.pool.toFixed(4)}. Standard error √(${OCT.pool.toFixed(4)} × ${(1 - OCT.pool).toFixed(4)} × (1/8,800 + 1/8,300)) ≈ ${OCT.sePool.toFixed(6)}. z = (${pct(OCT.p1, 2)} − ${pct(OCT.p2, 2)}) ÷ ${OCT.sePool.toFixed(6)} ≈ ${OCT.z.toFixed(2)}, and the two-sided p-value is about ${OCT.pValue.toFixed(4)}. Reject H₀: October’s web conversion was higher than September’s. The timing fits the fix, but a before-and-after comparison is evidence for a cause, not proof of one.`,
    steps: [
      {
        id: 'b04-pc-g1-s1', type: 'formula',
        prompt: 'In B6, calculate the pooled proportion: the conversion rate the two months share if the null hypothesis is true.',
        sheet: { cells: { ...octBase } }, cell: 'B6', answer: '=(B2+C2)/(B3+C3)',
        alt: ['=SUM(B2:C2)/SUM(B3:C3)'],
        view: 'A1:C9', formats: octFormats, widths: { A: 24 },
        wrong: [
          { formula: '=(B4+C4)/2', say: 'That averages the two rates as if the months had the same number of visits. Pool the counts instead: all the orders over all the visits.' },
          { formula: '=B2/B3', say: 'That is September’s rate alone. Under H₀ both months estimate one rate, so combine them: (B2 + C2) ÷ (B3 + C3).' },
        ],
        hints: ['Under the null hypothesis both months share one rate, so estimate it from both months together.', 'All the orders divided by all the visits: (B2 + C2) ÷ (B3 + C3).'],
      },
      {
        id: 'b04-pc-g1-s2', type: 'formula',
        prompt: 'In B7, calculate the standard error of the difference in proportions for the test, using the pooled proportion in B6.',
        sheet: { cells: { ...octBase, B6: '=(B2+C2)/(B3+C3)' } }, cell: 'B7', answer: '=SQRT(B6*(1-B6)*(1/B3+1/C3))',
        alt: ['=SQRT(B6*(1-B6)/B3+B6*(1-B6)/C3)', '=(B6*(1-B6)*(1/B3+1/C3))^0.5'],
        view: 'A1:C9', formats: octFormats, widths: { A: 24 },
        wrong: [
          { formula: '=SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)', say: 'That is the unpooled standard error, the one for the confidence interval. The test assumes the rates are equal, so it uses the pooled proportion in B6.' },
          { formula: '=SQRT(B6*(1-B6)/(B3+C3))', say: 'That is the standard error of a single proportion from all 17,100 visits. A difference between two samples needs 1/n₁ + 1/n₂.' },
          { formula: '=B6*(1-B6)*(1/B3+1/C3)', say: 'That is the variance of the difference. The standard error is its square root.' },
        ],
        hints: ['The formula is √(p̄(1 − p̄)(1/n₁ + 1/n₂)), with p̄ in B6.', '<x>=SQRT(B6*(1-B6)*(1/B3+1/C3))</x>'],
      },
      {
        id: 'b04-pc-g1-s3', type: 'formula',
        prompt: 'In B8, calculate z for October’s conversion minus September’s.',
        sheet: { cells: { ...octBase, B6: '=(B2+C2)/(B3+C3)', B7: '=SQRT(B6*(1-B6)*(1/B3+1/C3))' } }, cell: 'B8', answer: '=(C4-B4)/B7',
        alt: ['=(C2/C3-B2/B3)/B7'],
        view: 'A1:C9', formats: octFormats, widths: { A: 24 },
        wrong: [
          { formula: '=(C2-B2)/B7', say: 'That divides a difference in counts of orders by a standard error of proportions. Use the conversion rates in B4 and C4.' },
          { formula: '=(B4-C4)/B7', say: 'That is September minus October. The two-sided p-value comes out the same, but the question asks for October minus September, and the sign tells the reader which month was higher.' },
        ],
        hints: ['z = (difference in sample proportions) ÷ standard error.', 'October’s rate is in C4, September’s in B4.'],
      },
      {
        id: 'b04-pc-g1-s4', type: 'formula',
        prompt: 'In B9, calculate the two-sided p-value for z in B8.',
        sheet: { cells: { ...octBase, B6: '=(B2+C2)/(B3+C3)', B7: '=SQRT(B6*(1-B6)*(1/B3+1/C3))', B8: '=(C4-B4)/B7' } }, cell: 'B9', answer: '=2*(1-NORM.S.DIST(ABS(B8),TRUE))',
        alt: ['=2*NORM.S.DIST(-ABS(B8),TRUE)', '=2*(1-NORM.DIST(ABS(B8),0,1,TRUE))'],
        view: 'A1:C9', formats: octFormats, widths: { A: 24 },
        wrong: [
          { formula: '=1-NORM.S.DIST(ABS(B8),TRUE)', say: 'That is one tail only. A two-sided test counts results as extreme in either direction: double it.' },
          { formula: '=2*(1-NORM.S.DIST(ABS(B8),FALSE))', say: 'With FALSE, NORM.S.DIST returns the height of the curve, not a probability. Use TRUE for the cumulative probability.' },
          { formula: '=NORM.S.DIST(B8,TRUE)', say: 'That is the probability below z, which for a positive z is close to 1. The p-value is the area beyond |z| in both tails.' },
        ],
        hints: ['The two-sided p-value is 2 × P(Z > |z|).', '<x>=2*(1-NORM.S.DIST(ABS(B8),TRUE))</x>'],
      },
    ],
  },
  {
    id: 'b04-pc-g2', type: 'formula', kind: 'numerical',
    prompt: 'For the weekday test, calculate in D2 the expected number of Monday orders if every day had the same order rate, and fill it down to D8 for the other weekdays. The totals are in B9 and C9.',
    sheet: weekdaySheet, cell: 'D2', fill: 'D2:D8', answer: '=$C$9*B2/$B$9',
    alt: ['=B2/$B$9*$C$9', '=$C$9*(B2/$B$9)', '=B2*$C$9/$B$9'],
    view: 'A1:D9', formats: { D: '0.00' }, widths: { A: 12 },
    wrong: [
      { formula: '=C9*B2/B9', say: 'Without $ the totals slide down as you fill, to the empty cells below row 9. Lock them: $C$9 and $B$9.' },
      { formula: '=$C$9/7', say: 'That gives every weekday the same expected count. The spring had 18 of some weekdays and 17 of others, so equal daily rates predict more orders on the weekdays that occurred more often.' },
      { formula: '=B2/$B$9', say: 'That is the share of days that were Mondays, a probability. Multiply it by the number of orders, $C$9, to get an expected count.' },
      { formula: '=$C$9*B2/122', say: 'Point at the total of days, $B$9, rather than typing 122, so the formula still works when the data change.' },
    ],
    hints: ['Expected count = total orders × (share of the spring’s days that were this weekday).', 'Orders total in C9, days total in B9, this weekday’s days in B2: lock the totals with $ before filling.'],
    solution: '<x>=$C$9*B2/$B$9</x> filled down gives 34.08 for Monday, Tuesday and Sunday (18 days each) and 32.19 for Wednesday to Saturday (17 days each). They add up to 231, the observed total, as expected counts must.',
  },
  {
    id: 'b04-pc-g3', type: 'num', kind: 'numerical',
    prompt: 'The table shows Lantern’s spring orders by region and subscription status. If region and subscription were independent, how many subscriptions would the East be expected to have? Give two decimal places.',
    data: { table: { head: ['Region', 'Subscription', 'One-off', 'Total'], rows: [...REGIONS.map((g, i) => [g, String(rg[i][0]), String(rg[i][1]), String(rg[i][0] + rg[i][1])]), ['Total', String(RG.colTotals[0]), String(RG.colTotals[1]), String(RG.n)]] } },
    answer: Math.round(RG.expected[2][0] * 100) / 100, check: () => (RG.rowTotals[2] * RG.colTotals[0]) / RG.n, unit: 'orders', places: 2, tol: 0.01,
    wrong: [
      { value: RG.rowTotals[2] / 2, say: 'That splits the East’s 52 orders evenly. Independence says the East should have the same subscription share as everyone: 104 of 231.' },
      { value: RG.colTotals[0] / 5, say: 'That shares the 104 subscriptions equally among the regions, but the regions have different numbers of orders. Use row total × column total ÷ grand total.' },
      { value: rg[2][0], say: 'That is the observed count. The expected count is what independence predicts: 52 × 104 ÷ 231.' },
    ],
    hints: ['Under independence the East’s subscription share equals the overall share, 104 ÷ 231.', 'Expected = row total × column total ÷ grand total = 52 × 104 ÷ 231.'],
    solution: `Expected = 52 × 104 ÷ 231 ≈ ${fx(RG.expected[2][0])}. The East actually had ${rg[2][0]} subscriptions, ${fx(rg[2][0] - RG.expected[2][0])} more than independence predicts, which makes its two cells the largest contributors to the region table’s χ² of ${fx(RG.stat)}.`,
  },
  {
    id: 'b04-pc-g4', type: 'mc', kind: 'conceptual',
    prompt: 'A chain of cafés (fictional) cross-tabulates customers’ age group (3 groups) against their usual drink (4 kinds) and runs a chi-square test of independence. How many degrees of freedom does the test have?',
    options: ['6', '11', '12', '5'],
    answer: 0,
    hints: ['A test of independence has (r − 1)(c − 1) degrees of freedom.', 'With the row and column totals fixed, how many cells can you fill in freely?'],
    feedback: {
      1: 'That is the number of cells minus 1, the rule for a goodness-of-fit test on 12 categories. In a table both sets of totals are fixed: (3 − 1)(4 − 1).',
      2: 'That is the number of cells. Each fixed row total and column total removes freedom: (3 − 1)(4 − 1) = 6.',
      3: 'That adds (3 − 1) and (4 − 1). The degrees of freedom are their product.',
    },
    solution: 'df = (r − 1)(c − 1) = (3 − 1)(4 − 1) = 2 × 3 = 6. With the row and column totals fixed, filling in 2 rows × 3 columns of cells determines the rest.',
  },
];

export const independent = [
  {
    id: 'b04-pc-i1', type: 'formula', kind: 'applied',
    prompt: 'Lantern’s spring orders by region and subscription status are in B2:C6, and the expected counts under independence are already in F2:G6. In B9, return the p-value of the chi-square test of independence in one formula, with CHISQ.TEST.',
    sheet: regionSheet, cell: 'B9', answer: '=CHISQ.TEST(B2:C6,F2:G6)',
    require: ['CHISQ.TEST'],
    view: 'A1:G9', formats: { F: '0.00', G: '0.00', B9: '0.000000' }, widths: { A: 10, F: 20, G: 17 },
    wrong: [
      { formula: '=CHISQ.TEST(B2:C6,B2:C6)', say: 'Comparing the observed counts with themselves gives χ² = 0 and a p-value of 1. The second argument is the expected range, F2:G6.' },
      { formula: '=CHISQ.TEST(F2:G6,B2:C6)', say: 'The arguments are the wrong way round: CHISQ.TEST(actual_range, expected_range). Swapped, Excel divides by the observed counts instead of the expected ones.' },
      { formula: '=CHISQ.TEST(B2:B6,F2:F6)', say: 'That uses only the subscription column, so Excel treats it as a goodness-of-fit test with 4 degrees of freedom on five counts. Give it the whole 5 × 2 table, B2:C6 against F2:G6.' },
    ],
    solution: `<x>=CHISQ.TEST(B2:C6,F2:G6)</x> ≈ ${RG.p.toFixed(6)}: χ² ≈ ${fx(RG.stat)} with (5 − 1)(2 − 1) = 4 degrees of freedom. Strong evidence that subscription share differs by region; the East (39 of 52, 75%) contributes ${fx(RG.contrib[2][0])} + ${fx(RG.contrib[2][1])} of the total. Every expected count is at least ${fx(RG.minExpected)}, so the condition holds.`,
  },
  {
    id: 'b04-pc-i2', type: 'num', kind: 'numerical',
    prompt: 'Wheelhouse Gym (fictional) cross-tabulates 400 members by plan (3 plans) and preferred class time (morning, lunchtime, evening). The test of independence gives χ² = 18.4. What is Cramér’s V? Give three decimal places.',
    answer: Math.round(Math.sqrt(18.4 / (400 * 2)) * 1000) / 1000, check: () => Math.sqrt(18.4 / (400 * Math.min(3 - 1, 3 - 1))), unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: Math.round(Math.sqrt(18.4 / 400) * 1000) / 1000, say: 'You left out min(r − 1, c − 1), which is 2 for a 3 × 3 table. V = √(18.4 ÷ (400 × 2)).' },
      { value: Math.round((18.4 / 800) * 1000) / 1000, say: 'That is χ² ÷ (n × 2) without the square root. V is its square root.' },
      { value: Math.round(Math.sqrt(18.4 / (400 * 3)) * 1000) / 1000, say: 'That uses min(r, c) = 3. The formula uses min(r − 1, c − 1) = 2.' },
    ],
    solution: 'V = √(χ² ÷ (n × min(r − 1, c − 1))) = √(18.4 ÷ (400 × 2)) = √0.023 ≈ 0.152. On a scale from 0 to 1 the association is real (χ² = 18.4 on 4 df gives p ≈ 0.001) but not strong; the row percentages would show where it lies.',
  },
  {
    id: 'b04-pc-i3', type: 'formula', kind: 'numerical',
    prompt: 'Hollybank Hotel (fictional) logged maintenance requests per day for 100 days and wants to know whether they follow a Poisson distribution. λ in F1 was estimated from the same log, the expected counts are in C2:C5 and χ² is in F3. In F4, return the p-value with the correct degrees of freedom.',
    sheet: maintSheet, cell: 'F4', answer: '=CHISQ.DIST.RT(F3,2)',
    alt: ['=CHISQ.DIST.RT(F3,COUNT(B2:B5)-2)', '=1-CHISQ.DIST(F3,2,TRUE)'],
    view: 'A1:F6', formats: { C: '0.00', F3: '0.000', F4: '0.0000' }, widths: { A: 18, E: 15 },
    wrong: [
      { formula: '=CHISQ.TEST(B2:B5,C2:C5)', say: 'CHISQ.TEST uses 4 − 1 = 3 degrees of freedom for four categories. λ was estimated from the same data, which costs one more: df = 4 − 1 − 1 = 2.' },
      { formula: '=CHISQ.DIST.RT(F3,3)', say: 'Three degrees of freedom forgets the estimated λ. df = k − 1 − m = 4 − 1 − 1 = 2.' },
      { formula: '=CHISQ.DIST(F3,2,TRUE)', say: 'That is the left-tail probability. The p-value of a chi-square test is the right tail: CHISQ.DIST.RT.' },
    ],
    solution: `<x>=CHISQ.DIST.RT(F3,2)</x> ≈ ${MFIT.p.toFixed(2)} (χ² ≈ ${MFIT.stat.toFixed(3)}): four categories, minus 1 for the total, minus 1 for λ, leave 2 degrees of freedom. No evidence against the Poisson model. CHISQ.TEST would have used 3 degrees of freedom and given ${I.chi2Sf(MFIT.stat, 3).toFixed(2)}.`,
  },
  {
    id: 'b04-pc-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Match each question to the test that answers it.',
    items: [
      'A hotel asks whether the share of guests who book breakfast is higher among business guests than leisure guests (a one-sided question).',
      'A call centre asks whether its calls are spread over its five shifts in the proportions its staffing plan assumes.',
      'A retailer asks whether customers’ preferred delivery slot (morning, afternoon, evening) is related to their region (four regions).',
      'A shop asks whether the average basket value differs between its web and app customers.',
      'A board-game café asks whether the die it uses for a promotion lands on each face equally often.',
      'A gym wants an interval for how much more often January joiners cancel within three months than June joiners.',
    ],
    categories: ['Two-proportion z test', 'Chi-square goodness-of-fit test', 'Chi-square test of independence', 'A t test for two means'],
    answer: [0, 1, 2, 3, 1, 0],
    feedback: {
      0: 'Two proportions with a one-sided alternative: the z test can be one-sided; a chi-square test can’t.',
      3: 'An average basket value is a mean of a numeric variable, not a count in categories: <i>Comparing means</i>.',
      5: 'Two proportions and an interval for their difference: the two-proportion z test and its interval. A chi-square test gives only a p-value.',
    },
    solution: 'Two proportions, especially with a one-sided alternative or an interval wanted: the two-proportion z test. One categorical variable against stated proportions (shifts, die faces): goodness of fit. Two categorical variables in a table (slot × region): independence. A numeric variable’s mean in two groups: a t test, taught in <i>Comparing means</i>.',
  },
  {
    id: 'b04-pc-i5', type: 'multi', kind: 'applied',
    prompt: `Lantern’s spring orders by channel and subscription gave χ² = ${fx(CS.stat)}, 1 degree of freedom, p = ${CS.p.toFixed(4)}, with a smallest expected count of ${fx(CS.minExpected)}. Select all the statements the result supports.`,
    options: [
      'App orders were subscriptions more often than web orders, by more than chance usually produces.',
      'If channel and subscription were independent, a χ² this large would occur in under 1 sample in 1,000.',
      'Persuading web customers to switch to the app would, on this evidence, raise their chance of subscribing.',
      'The probability that channel and subscription are independent of each other is only about 0.0009.',
      'The test can’t tell whether the app leads to subscribing or keen subscribers choose the app.',
      'Every expected count is well above 5, so the chi-square approximation is reasonable.',
    ],
    answer: [0, 1, 4, 5],
    feedback: {
      2: 'That is a causal claim. Customers chose their channel, so a confounder such as loyalty could produce the association.',
      3: 'A p-value is the probability of data this extreme if H₀ were true, not the probability that H₀ is true.',
    },
    solution: 'Supported: the association (app 57.6% against web 35.6%), the meaning of the p-value as a probability computed assuming independence, the limits on causal reading, and the expected-count condition (smallest 44.57). Not supported: the causal claim about switching customers, and reading the p-value as the probability that H₀ is true.',
  },
  {
    id: 'b04-pc-i6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about chi-square tests.',
    text: 'A chi-square statistic can never be [[0]]. If the null hypothesis is true, its distribution has a mean equal to its [[1]]. Large values are evidence against the null hypothesis, so the p-value is the area in the [[2]] tail. A test of independence on a table with r rows and c columns has [[3]] degrees of freedom.',
    blanks: [
      { options: ['zero', 'negative', 'more than 1', 'a whole number'], answer: 1 },
      { options: ['sample size', 'number of cells', 'degrees of freedom', 'expected count'], answer: 2 },
      { options: ['left', 'right', 'both'], answer: 1 },
      { options: ['r × c − 1', 'r + c − 2', 'r × c', '(r − 1)(c − 1)'], answer: 3 },
    ],
    fixed: true,
    solution: 'χ² sums squared gaps divided by positive expected counts, so it is never negative (it is 0 when every count matches). Its distribution under H₀ has mean equal to its degrees of freedom, and only large values count against H₀: the right tail. A table with fixed row and column totals has (r − 1)(c − 1) degrees of freedom.',
  },
];

export const check = [
  {
    id: 'b04-pc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why are the expected counts in Lantern’s weekday test not 231 ÷ 7 = 33 orders for every weekday?',
    options: [
      'The spring had 18 of some weekdays and only 17 of others, so equal daily rates predict different counts.',
      'Expected counts have to be whole numbers, and 33 is the nearest whole number to the average of the observed weekday counts.',
      'Weekends are usually busier for an online shop, so the expected counts have to allow for the extra Saturday and Sunday orders.',
      'The test uses the observed counts as its expected counts, which is why the observed Monday total of 39 orders goes into the formula.',
    ],
    answer: 0,
    feedback: {
      1: 'Expected counts needn’t be whole numbers: Monday’s is 34.08. And they come from the null hypothesis, not from the observed counts.',
      2: 'Busier weekends are what the test is looking for. Under the null hypothesis every day has the same order rate.',
      3: 'If the expected counts were the observed ones, χ² would always be 0. They come from the model: 231 × days ÷ 122.',
    },
    solution: 'Under H₀ every day has the same expected number of orders, 231 ÷ 122. Mondays, Tuesdays and Sundays occurred 18 times in the spring and the other weekdays 17 times, so the expected counts are 231 × 18 ÷ 122 ≈ 34.08 and 231 × 17 ÷ 122 ≈ 32.19.',
  },
  {
    id: 'b04-pc-k2', type: 'num', kind: 'numerical',
    prompt: 'A bike-hire firm (fictional) plans its fleet on the assumption that 50% of rentals are city bikes, 30% e-bikes and 20% cargo bikes. Of 150 rentals last week, 66 were city bikes, 54 e-bikes and 30 cargo bikes. Calculate the goodness-of-fit statistic χ². Give two decimal places.',
    answer: Math.round(BT.stat * 100) / 100, check: () => BT_O.reduce((s, o, i) => s + (o - 150 * BT_P[i]) ** 2 / (150 * BT_P[i]), 0), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: BT_O.reduce((s, o, i) => s + (o - 150 * BT_P[i]) ** 2, 0), say: 'You added the squared gaps without dividing each by its expected count. χ² = Σ(O − E)² ÷ E.' },
      { value: Math.round(BT_O.reduce((s, o, i) => s + (o - 150 * BT_P[i]) ** 2 / o, 0) * 100) / 100, say: 'You divided by the observed counts. Each squared gap is divided by its expected count: 75, 45 and 30.' },
      { value: Math.round(BT_O.reduce((s, o, i) => s + Math.abs(o - 150 * BT_P[i]) / (150 * BT_P[i]), 0) * 100) / 100, say: 'The gaps must be squared before dividing by the expected counts.' },
    ],
    solution: `Expected: 150 × 0.5 = 75, 150 × 0.3 = 45, 150 × 0.2 = 30. χ² = (66 − 75)² ÷ 75 + (54 − 45)² ÷ 45 + (30 − 30)² ÷ 30 = 1.08 + 1.80 + 0 = ${BT.stat.toFixed(2)}. With 2 degrees of freedom, <x>=CHISQ.DIST.RT(2.88,2)</x> ≈ ${BT.p.toFixed(2)}: no evidence that last week’s rentals departed from the planned shares.`,
  },
  {
    id: 'b04-pc-k3', type: 'formula', kind: 'applied',
    prompt: 'A city bike-hire scheme (fictional) wants to know how much more often weekend hires than weekday hires are made by first-time users. In B7, calculate the lower limit of the confidence interval for the difference in proportions (weekend − weekday), at the confidence level in B6.',
    sheet: bikeSheet, cell: 'B7',
    answer: '=(C4-B4)-NORM.S.INV(1-(1-B6)/2)*SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)',
    alt: ['=C4-B4-NORM.S.INV((1+B6)/2)*SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)', '=(C4-B4)+NORM.S.INV((1-B6)/2)*SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)'],
    view: 'A1:C7', formats: { B4: '0.0%', C4: '0.0%', B6: '0%', B7: '0.0000' }, widths: { A: 30 },
    wrong: [
      { formula: '=(C4-B4)-1.96*SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)', say: '1.96 is right only for 95%. Work the critical value out from the level in B6: <x>=NORM.S.INV(1-(1-B6)/2)</x>.' },
      { formula: '=(C4-B4)-NORM.S.INV(0.975)*SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)', say: 'NORM.S.INV(0.975) is the critical value for 95% only. Work it out from the level in B6, <x>=NORM.S.INV(1-(1-B6)/2)</x>, so the formula still works when the level changes.' },
      { formula: '=(C4-B4)-NORM.S.INV(B6)*SQRT(B4*(1-B4)/B3+C4*(1-C4)/C3)', say: 'NORM.S.INV(B6) is a one-sided critical value (1.645 for 95%). A two-sided interval puts half of 1 − B6 in each tail.' },
      { formula: '=(C4-B4)-NORM.S.INV(1-(1-B6)/2)*SQRT((B2+C2)/(B3+C3)*(1-(B2+C2)/(B3+C3))*(1/B3+1/C3))', say: 'That uses the pooled standard error, which belongs to the test. The interval doesn’t assume the two proportions are equal, so it uses each sample’s own proportion.' },
    ],
    solution: `Weekend 54 of 300 (18.0%) against weekday 36 of 400 (9.0%): a difference of 9.0 points. Unpooled standard error √(0.09 × 0.91 ÷ 400 + 0.18 × 0.82 ÷ 300) ≈ ${BIKE.se.toFixed(4)}, so at 95% the interval is 0.090 ± 1.96 × ${BIKE.se.toFixed(4)}: ${(BIKE.low * 100).toFixed(1)} to ${(BIKE.high * 100).toFixed(1)} points. The whole interval is above 0, so weekend hires come from first-time users more often, by somewhere between about 4 and 14 points: worth knowing when planning how-to-ride signs and staff at weekends.`,
  },
  {
    id: 'b04-pc-k4', type: 'num', kind: 'numerical',
    prompt: 'A two-proportion z test on the counts in a 2 × 2 table gives z = −2.40. What χ² does a chi-square test of independence on the same table give? Give two decimal places.',
    answer: 5.76, check: () => (-2.4) ** 2, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: -2.4, say: 'A chi-square statistic can’t be negative. For a 2 × 2 table χ² = z².' },
      { value: 2.4, say: 'For a 2 × 2 table χ² is the square of z, not its absolute value.' },
      { value: 4.8, say: 'That doubles |z|. χ² = z² = (−2.40)².' },
    ],
    solution: 'For a 2 × 2 table the chi-square test of independence and the two-sided two-proportion z test are the same test: χ² = z² = (−2.40)² = 5.76, with 1 degree of freedom and the same p-value (about 0.016).',
  },
  {
    id: 'b04-pc-k5', type: 'mc', kind: 'applied',
    prompt: `Lantern’s rated spring orders: ${RATING_BY_CHANNEL.counts.map(([five, rest]) => pct(five / (five + rest))).join(' of web ratings and ')} of app ratings were five stars (${D.ratingByChannel.n} ratings), and the chi-square test of independence gives p = ${D.ratingByChannel.p.toFixed(2)}. What should Ana conclude?`,
    options: [
      'No evidence of a difference in five-star share, though a gap of several points either way is possible.',
      'The test proves that web and app customers are equally satisfied, since the p-value is so close to 1.',
      'There is a 98% chance that channel and rating are independent, so Ana can treat them as unrelated.',
      'The test is invalid here because some of the expected counts are too small for the chi-square approximation.',
    ],
    answer: 0,
    feedback: {
      1: 'Failing to reject H₀ isn’t proof of it. The 95% interval for the difference runs from about −15 to +16 points.',
      2: 'A p-value is computed assuming H₀ is true; it isn’t the probability that H₀ is true.',
      3: 'The smallest expected count is about 31, far above 5. The condition holds.',
    },
    solution: 'p = 0.98 means gaps as small as this one are what independence would usually produce: no evidence of a difference. It doesn’t show the shares are equal; with 154 ratings the 95% interval for the difference in five-star shares runs from about −15.5 to +16.0 points. Every expected count is above 30, so the test is valid.',
  },
  {
    id: 'b04-pc-k6', type: 'formula', kind: 'numerical',
    prompt: 'In B4, return the critical value of a chi-square test of independence at the significance level in B1, for a table with the number of rows in B2 and columns in B3.',
    sheet: critSheet, cell: 'B4', answer: '=CHISQ.INV.RT(B1,(B2-1)*(B3-1))',
    alt: ['=CHISQ.INV(1-B1,(B2-1)*(B3-1))'],
    view: 'A1:B4', formats: { B4: '0.000' }, widths: { A: 22 },
    wrong: [
      { formula: '=CHISQ.INV(B1,(B2-1)*(B3-1))', say: 'CHISQ.INV gives the value with probability B1 below it, in the left tail. The critical value cuts off B1 in the right tail: CHISQ.INV.RT.' },
      { formula: '=CHISQ.INV.RT(1-B1,(B2-1)*(B3-1))', say: 'CHISQ.INV.RT takes the right-tail probability itself, B1, not 1 − B1.' },
      { formula: '=CHISQ.INV.RT(B1,B2*B3-1)', say: 'r × c − 1 is the df of a goodness-of-fit test on r × c categories. A table’s df is (r − 1)(c − 1).' },
    ],
    solution: '<x>=CHISQ.INV.RT(B1,(B2-1)*(B3-1))</x>: for α = 0.05 and a 3 × 4 table, df = 2 × 3 = 6 and the critical value is about 12.592. A χ² above it is significant at that level; equivalently, its CHISQ.DIST.RT p-value is below α.',
  },
];
