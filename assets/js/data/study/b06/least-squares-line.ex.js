// least-squares-line.ex.js — B06 · The least-squares line: widgets, practice and the knowledge check (answer keys live
// here). Café data come from case.js (the corrected log); Harrier Cycle Hire, Peregrine Fitness, Lindenwood Garden
// Centre, Greywell Books and the other businesses named are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=26';
import * as R from '../../../core/regression.js?v=26';
import { mean, sd } from '../../../core/stats.js?v=26';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const win = (cafe, from, to) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let sab = 0, saa = 0, sbb = 0; a.forEach((v, i) => { sab += (v - ma) * (b[i] - mb); saa += (v - ma) ** 2; sbb += (b[i] - mb) ** 2; }); return sab / Math.sqrt(saa * sbb); };
const line = (y, x) => { const f = R.fit(y, { x }); return { b0: f.beta[0], b1: f.beta[1], r: corr(x, y) }; };

// ---------------------------------------------------------------- widgets' data: Harbourside, June
const JUN = win('Harbourside', '2027-06-01', '2027-06-30');
const jT = JUN.map((r) => r[at('transactions')]), jS = JUN.map((r) => r[at('sales')]);
const JL = line(jS, jT);
const junSheet = {
  cells: {
    A1: 'Date', B1: 'Transactions', C1: 'Sales ($)', ...col('A', 2, JUN.map((r) => short(r[at('date')]))), ...col('B', 2, jT), ...col('C', 2, jS),
    E1: 'Slope (SLOPE)', F1: '=SLOPE(C2:C31,B2:B31)',
    E2: 'Intercept (INTERCEPT)', F2: '=INTERCEPT(C2:C31,B2:B31)',
    E3: 'Slope from r × s_y ÷ s_x', F3: '=CORREL(B2:B31,C2:C31)*STDEV.S(C2:C31)/STDEV.S(B2:B31)',
    E4: 'Intercept from the means', F4: '=AVERAGE(C2:C31)-F3*AVERAGE(B2:B31)',
    E5: 'r', F5: '=CORREL(B2:B31,C2:C31)',
    E6: 'Slope of transactions on sales', F6: '=SLOPE(B2:B31,C2:C31)',
    E7: 'Product of the two slopes', F7: '=F1*F6',
    E8: 'r²', F8: '=F5^2',
  },
};
const hiH = column('high_f', H), ftH = column('footfall', H);
const TL = line(ftH, hiH), TX = line(hiH, ftH);

// ---------------------------------------------------------------- guided 1: Millbrook, footfall → transactions (summary statistics)
const mF = column('footfall', M), mT = column('transactions', M);
const G1 = { xm: rnd(mean(mF), 2), sx: rnd(sd(mF), 2), ym: rnd(mean(mT), 2), sy: rnd(sd(mT), 2), r: rnd(corr(mF, mT), 4) };
const g1b1 = G1.r * G1.sy / G1.sx, g1b0 = G1.ym - rnd(g1b1, 4) * G1.xm;
// ---------------------------------------------------------------- guided 2: Millbrook, 1–20 October
const OCT = win('Millbrook', '2027-10-01', '2027-10-20');
const oT = OCT.map((r) => r[at('transactions')]), oS = OCT.map((r) => r[at('sales')]);
const OL = line(oS, oT);
const octCells = { A1: 'Date', B1: 'Transactions', C1: 'Sales ($)', ...col('A', 2, OCT.map((r) => short(r[at('date')]))), ...col('B', 2, oT), ...col('C', 2, oS), E1: 'Slope', E2: 'Intercept' };
// ---------------------------------------------------------------- guided 4: Peregrine Fitness (fictional)
const PF = { r: 0.62, sx: 18, sy: 45 };   // classes a month (x), new members a month (y)
// ---------------------------------------------------------------- independent 3: Harbourside's first 24 Wednesdays
const WED = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside' && r[at('weekday')] === 'Wed').slice(0, 24);
const wH = WED.map((r) => r[at('high_f')]), wF = WED.map((r) => r[at('footfall')]);
const WL = line(wF, wH), WX = line(wH, wF);
const wedSheet = { cells: { A1: 'Date', B1: 'High (°F)', C1: 'Footfall', ...col('A', 2, WED.map((r) => short(r[at('date')]))), ...col('B', 2, wH), ...col('C', 2, wF), E1: 'Slope' } };
// ---------------------------------------------------------------- check 3: Harbourside, June, rain → footfall
const jR = JUN.map((r) => r[at('rain_in')]), jF = JUN.map((r) => r[at('footfall')]);
const RL = line(jF, jR);
const rainSheet = { cells: { A1: 'Date', B1: 'Rain (in)', C1: 'Footfall', ...col('A', 2, JUN.map((r) => short(r[at('date')]))), ...col('B', 2, jR), ...col('C', 2, jF), E1: 'Fitted footfall, dry day' } };
const juneDry = jR.filter((v) => v === 0).length;
const wet = jR.indexOf(Math.max(...jR)), RL2 = line(jF.filter((_, i) => i !== wet), jR.filter((_, i) => i !== wet));

export const widgets = {
  'ls-fit': {
    type: 'fitline',
    title: 'Fit a line by eye, then by least squares: Harbourside, June 2027',
    x: { name: 'Transactions', values: jT },
    y: { name: 'Sales', values: jS, unit: '$' },
    labels: JUN.map((r) => short(r[at('date')])),
    start: { intercept: 0, slope: 5 },
    ranges: { intercept: [-150, 150, 1], slope: [3, 9, 0.01] },
    show: ['residuals', 'squares', 'sse'],
    note: `The least-squares line for these 30 days is sales = ${fx(JL.b0)} + ${JL.b1.toFixed(2)} × transactions. Any other intercept and slope give a larger sum of squared residuals. A line through the origin with slope 5 (where you start) looks reasonable but misses the busy days by more and more.`,
  },
  'ls-standard': {
    type: 'formula',
    title: 'Two regression lines and regression toward the mean',
    intro: 'Set the correlation, the two standard deviations, and how many standard deviations from its mean a case’s x is.',
    inputs: [
      { id: 'r', label: 'Correlation r', min: -0.99, max: 0.99, step: 0.01, value: 0.44, fmt: 'num' },
      { id: 'sx', label: 'Standard deviation of x', min: 1, max: 100, step: 1, value: 15, fmt: 'num' },
      { id: 'sy', label: 'Standard deviation of y', min: 1, max: 200, step: 1, value: 69, fmt: 'num' },
      { id: 'zx', label: 'x, in standard deviations from its mean', min: -3, max: 3, step: 0.1, value: 1, fmt: 'num' },
    ],
    compute: (v) => {
      const by = v.r * v.sy / v.sx, bx = v.r * v.sx / v.sy, zy = v.r * v.zx;
      const zs = [-3, -2, -1, 0, 1, 2, 3];
      const series = [{ name: 'Regression of y on x (ẑ_y = r·z_x)', values: zs.map((z) => Number((v.r * z).toFixed(3))) }];
      if (Math.abs(v.r) >= 0.34) series.push({ name: 'Regression of x on y, drawn on the same axes (z_y = z_x ÷ r)', values: zs.map((z) => Number((z / v.r).toFixed(3))) });
      series.push({ name: 'Perfect correlation (z_y = z_x)', values: zs });
      return {
        headline: { label: 'Fitted y, in standard deviations from its mean', value: zy.toFixed(2) },
        rows: [
          ['Slope of y on x, r × s_y ÷ s_x', by.toFixed(4)],
          ['Slope of x on y, r × s_x ÷ s_y', bx.toFixed(4)],
          ['Product of the two slopes (= r²)', (by * bx).toFixed(4)],
          ['1 ÷ slope of x on y (not the y-on-x slope)', Math.abs(bx) > 1e-9 ? (1 / bx).toFixed(4) : '—'],
          ['Shrinkage toward the mean', v.zx === 0 ? '—' : `${(100 * (1 - Math.abs(v.r))).toFixed(0)}% of the way back`],
        ],
        note: Math.abs(v.r) > 0.98
          ? `With r = ${v.r.toFixed(2)} the two lines almost coincide and a case ${v.zx.toFixed(1)} SD out in x is fitted ${zy.toFixed(2)} SD out in y: very little regression toward the mean.`
          : `A case ${v.zx.toFixed(1)} SD from the mean in x is fitted only ${zy.toFixed(2)} SD from the mean in y. The two slopes multiply to r² = ${(v.r * v.r).toFixed(3)}, not 1, so the line of x on y is not the line of y on x turned round.`,
        chart: { kind: 'line', x: { label: 'x in standard deviations', values: zs }, series, y: { label: 'y in standard deviations' } },
      };
    },
  },
  'ls-temp': {
    type: 'scatter',
    title: 'Footfall and the day’s high: Harbourside, 1 March – 31 December 2027',
    x: { name: 'High', values: hiH, unit: '°F' },
    y: { name: 'Footfall', values: ftH },
    labels: column('date', H).map((d) => short(d)),
    show: ['pearson', 'r2'],
    toggles: ['line'],
    note: `The least-squares line of footfall on the high is footfall = ${TL.b0.toFixed(2)} + ${TL.b1.toFixed(3)} × high. The line for predicting the high from footfall is high = ${TX.b0.toFixed(2)} + ${TX.b1.toFixed(4)} × footfall; turned round, it would be about ${(1 / TX.b1).toFixed(1)} people per degree, much steeper. The busiest points, far above the line, are weekend and festival days.`,
  },
  'ls-sheet': {
    type: 'sheet',
    title: 'The least-squares line in Excel: Harbourside, June 2027',
    sheet: junSheet,
    view: 'A1:F31',
    maxHeight: '22rem',
    editable: ['B2:C31'],
    formats: { F1: '0.0000', F2: '0.00', F3: '0.0000', F4: '0.00', F5: '0.0000', F6: '0.0000', F7: '0.0000', F8: '0.0000' },
    widths: { A: 9, E: 28 },
    tools: ['formulas', 'reset'],
    note: `F1 and F3 agree (${JL.b1.toFixed(4)}), as do F2 and F4: SLOPE is r × s_y ÷ s_x and INTERCEPT is ȳ − b₁x̄. F6 swaps the ranges and gives the other line; F7 shows that the two slopes multiply to r², in F8. Change the sales on 26 June (C27), the busiest day, and watch the slope move.`,
  },
};

export const guided = [
  {
    id: 'b06-ls-g1', type: 'steps', kind: 'numerical',
    prompt: `Millbrook, 1 March – 31 December 2027: footfall has mean ${G1.xm.toFixed(2)} and standard deviation ${G1.sx.toFixed(2)} people a day; transactions have mean ${G1.ym.toFixed(2)} and standard deviation ${G1.sy.toFixed(2)}; r = ${G1.r.toFixed(4)}. Find the least-squares line of transactions on footfall.`,
    solution: `b₁ = ${G1.r.toFixed(4)} × ${G1.sy.toFixed(2)} ÷ ${G1.sx.toFixed(2)} = ${g1b1.toFixed(4)} transactions per person; b₀ = ${G1.ym.toFixed(2)} − ${g1b1.toFixed(4)} × ${G1.xm.toFixed(2)} = ${fx(g1b0)}. About 55 of every 100 extra people through Millbrook’s door go with a transaction, the café’s conversion rate. The intercept is close to 0, and a day with no visitors would indeed have no transactions, but no day had fewer than ${Math.min(...mF)} visitors, so even this sensible-looking intercept is extrapolation.`,
    steps: [
      {
        id: 'b06-ls-g1-s1', type: 'num',
        prompt: 'Calculate the slope b₁, to four decimal places.',
        answer: rnd(g1b1, 4), check: () => G1.r * G1.sy / G1.sx, unit: 'transactions per person', places: 4, tol: 0.0005,
        wrong: [
          { value: rnd(G1.r * G1.sx / G1.sy, 4), say: 'That is r × s_x ÷ s_y, the slope for predicting footfall from transactions. For transactions on footfall the response’s standard deviation goes on top: r × s_y ÷ s_x.' },
          { value: rnd(G1.sy / G1.sx, 4), say: 'You left out r. The slope is r × s_y ÷ s_x; s_y ÷ s_x alone would be the slope only if the correlation were perfect.' },
        ],
        hints: ['b₁ = r × s_y ÷ s_x, with y the variable being predicted (transactions).', `${G1.r.toFixed(4)} × ${G1.sy.toFixed(2)} ÷ ${G1.sx.toFixed(2)}.`],
      },
      {
        id: 'b06-ls-g1-s2', type: 'num',
        prompt: 'Calculate the intercept b₀, to two decimal places, using your slope to four decimal places.',
        answer: rnd(g1b0, 2), check: () => G1.ym - rnd(G1.r * G1.sy / G1.sx, 4) * G1.xm, unit: 'transactions', places: 2, tol: 0.06,
        wrong: [
          { value: rnd(G1.xm - rnd(g1b1, 4) * G1.ym, 2), say: 'The means are the wrong way round. b₀ = ȳ − b₁x̄, with ȳ the mean transactions and x̄ the mean footfall.' },
          { value: rnd(G1.ym + rnd(g1b1, 4) * G1.xm, 2), say: 'Subtract b₁x̄ from ȳ; don’t add it. The line has to pass through the point of means.' },
        ],
        hints: ['The line passes through (x̄, ȳ): b₀ = ȳ − b₁x̄.', `${G1.ym.toFixed(2)} − ${g1b1.toFixed(4)} × ${G1.xm.toFixed(2)}.`],
      },
      {
        id: 'b06-ls-g1-s3', type: 'mc',
        prompt: 'Which sentence reads the slope correctly?',
        options: [
          'Each extra visitor went with about 0.55 more transactions, on average, across Millbrook’s days.',
          'Each extra transaction at Millbrook brought about 0.55 more people through the door on the same day.',
          '55% of the variation in Millbrook’s daily transactions is explained by the number of people who came in.',
          'Millbrook would gain 0.55 transactions for every extra visitor it attracted with a paid advertising campaign.',
        ],
        answer: 0,
        hints: ['The slope is in y’s units (transactions) per unit of x (people).'],
        feedback: {
          1: 'That reverses the roles. The slope gives transactions per person, the change in y for a unit change in x.',
          2: 'A slope is not a share of variation; that is R², the next lesson’s measure.',
          3: 'The slope compares the days in the log. Visitors drawn by advertising might convert differently; the line can’t say what an intervention would do.',
        },
      },
    ],
  },
  {
    id: 'b06-ls-g2', type: 'steps', kind: 'numerical',
    prompt: 'Millbrook, 1–20 October 2027: transactions in B2:B21 and sales in C2:C21. Build the least-squares line from its parts, without SLOPE or INTERCEPT.',
    solution: `F1: <x>=CORREL(B2:B21,C2:C21)*STDEV.S(C2:C21)/STDEV.S(B2:B21)</x> = ${OL.b1.toFixed(4)}; F2: <x>=AVERAGE(C2:C21)-F1*AVERAGE(B2:B21)</x> = ${fx(OL.b0)}. These equal SLOPE and INTERCEPT exactly. The twenty days give $${OL.b1.toFixed(2)} of sales per transaction, close to the year’s $3.60; the slope rests on the gap between the busy weekdays (120 or more transactions) and the quiet weekends (under 85).`,
    steps: [
      {
        id: 'b06-ls-g2-s1', type: 'formula',
        prompt: 'In F1, calculate the slope of sales on transactions from the correlation and the two standard deviations.',
        sheet: { cells: octCells },
        cell: 'F1', answer: '=CORREL(B2:B21,C2:C21)*STDEV.S(C2:C21)/STDEV.S(B2:B21)',
        alt: ['=CORREL(C2:C21,B2:B21)*STDEV.S(C2:C21)/STDEV.S(B2:B21)', '=STDEV.S(C2:C21)/STDEV.S(B2:B21)*CORREL(B2:B21,C2:C21)'],
        require: ['CORREL', 'STDEV.S'],
        view: 'A1:F21', widths: { A: 8, E: 10 }, formats: { F1: '0.0000', C: '0.00' },
        wrong: [
          { formula: '=CORREL(B2:B21,C2:C21)*STDEV.S(B2:B21)/STDEV.S(C2:C21)', say: 'The standard deviations are upside down: that is the slope of transactions on sales. For sales on transactions, s_y (sales) goes on top.' },
          { formula: '=STDEV.S(C2:C21)/STDEV.S(B2:B21)', say: 'You left out r. Multiply the ratio of standard deviations by CORREL.' },
          { formula: '=CORREL(B2:B21,C2:C21)', say: 'That is r, the slope in standard units. Scale it by s_y ÷ s_x to get dollars per transaction.' },
        ],
        hints: ['b₁ = r × s_y ÷ s_x.', '<x>=CORREL(B2:B21,C2:C21)*STDEV.S(C2:C21)/STDEV.S(B2:B21)</x>'],
      },
      {
        id: 'b06-ls-g2-s2', type: 'formula',
        prompt: 'In F2, calculate the intercept from the means and the slope in F1.',
        sheet: { cells: { ...octCells, F1: '=CORREL(B2:B21,C2:C21)*STDEV.S(C2:C21)/STDEV.S(B2:B21)' } },
        cell: 'F2', answer: '=AVERAGE(C2:C21)-F1*AVERAGE(B2:B21)',
        alt: ['=AVERAGE(C2:C21)-AVERAGE(B2:B21)*F1', '=-F1*AVERAGE(B2:B21)+AVERAGE(C2:C21)'],
        require: ['AVERAGE'],
        view: 'A1:F21', widths: { A: 8, E: 10 }, formats: { F1: '0.0000', F2: '0.00', C: '0.00' },
        wrong: [
          { formula: '=AVERAGE(B2:B21)-F1*AVERAGE(C2:C21)', say: 'The means are swapped. b₀ = ȳ − b₁x̄: the mean of sales minus the slope times the mean of transactions.' },
          { formula: '=AVERAGE(C2:C21)+F1*AVERAGE(B2:B21)', say: 'Subtract b₁x̄; the line passes through (x̄, ȳ).' },
          { formula: '=AVERAGE(C2:C21)/AVERAGE(B2:B21)', say: 'That is sales per transaction, not the intercept.' },
        ],
        hints: ['The line passes through the point of means: b₀ = ȳ − b₁x̄.', '<x>=AVERAGE(C2:C21)-F1*AVERAGE(B2:B21)</x>'],
      },
    ],
  },
  {
    id: 'b06-ls-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Millbrook’s line for the year is sales = −34.36 + 3.60 × transactions. What should Ana make of the −34.36?',
    options: [
      'Nothing as a forecast: no day had fewer than 38 transactions, and the line is steeper than an average sale.',
      'Millbrook loses $34.36 on any day it opens before the first sale is rung up, so it should open later in the morning.',
      'The line is wrong, because sales can’t be negative; she should refit it with the intercept forced through the origin.',
      'About $34.36 of Millbrook’s daily sales are not explained by transactions and come from something else.',
    ],
    answer: 0,
    hints: ['Where is x = 0 compared with the days the line was fitted to?', 'b₀ = x̄(ȳ ÷ x̄ − b₁): what does a slope above the average sale do?'],
    feedback: {
      1: 'The intercept is not a cost: the line only describes how sales and transactions vary together across days.',
      2: 'Forcing the line through (0, 0) changes the slope and the fit for the days that matter; read the ordinary line inside its range instead.',
      3: 'The intercept is the fitted value at x = 0, not an unexplained amount; unexplained variation is measured by the residuals.',
    },
    solution: 'The intercept is the fitted value at 0 transactions, a situation 38 transactions below Millbrook’s quietest day. It is negative because the slope ($3.60) is above Millbrook’s sales per transaction ($3.32): bigger tickets on busier days make the line steeper than an average sale, so it crosses x = 0 below zero. Use the slope, inside the range of the data; ignore the intercept.',
  },
  {
    id: 'b06-ls-g4', type: 'num', kind: 'numerical',
    prompt: 'Peregrine Fitness (fictional) compares its studios month by month: classes held (standard deviation 18 a month) and new members joining (standard deviation 45 a month) correlate at r = 0.62. Its finance team wants a line to estimate how many classes went with a given number of new members. What is that line’s slope, in classes per new member? Give three decimal places.',
    answer: rnd(PF.r * PF.sx / PF.sy, 3), check: () => 0.62 * 18 / 45, unit: 'classes per new member', places: 3, tol: 0.0005,
    wrong: [
      { value: rnd(PF.r * PF.sy / PF.sx, 3), say: 'That is the slope of new members on classes. Here classes is the variable being estimated, so it is y: r × s_classes ÷ s_members.' },
      { value: rnd(1 / (PF.r * PF.sy / PF.sx), 3), say: 'Turning the other line round doesn’t give this one: the two slopes multiply to r², not 1.' },
    ],
    hints: ['The variable being estimated is classes, so classes plays y.', 'Slope = r × s_classes ÷ s_members = 0.62 × 18 ÷ 45.'],
    solution: `Classes on members: 0.62 × 18 ÷ 45 = ${(0.62 * 18 / 45).toFixed(3)} classes per new member. Members on classes: 0.62 × 45 ÷ 18 = ${(0.62 * 45 / 18).toFixed(3)}. Their product is ${(0.248 * 1.55).toFixed(4)} = 0.62², and 1 ÷ 1.550 = 0.645 is not 0.248: two different lines, each for its own question.`,
  },
];

export const independent = [
  {
    id: 'b06-ls-i1', type: 'num', kind: 'numerical',
    prompt: 'Lindenwood Garden Centre (fictional) records, for twelve spring weekends, the hours of radio advertising (x) and plant sales in hundreds of dollars (y). Σ(x − x̄)(y − ȳ) = 1,860, Σ(x − x̄)² = 620, x̄ = 14 hours and ȳ = 210. Calculate the intercept of the least-squares line, in hundreds of dollars.',
    answer: 210 - (1860 / 620) * 14, check: () => 210 - (1860 / 620) * 14, unit: 'hundred dollars', places: 0, tol: 0.5,
    wrong: [
      { value: 1860 / 620, say: 'That is the slope, b₁ = 3. The intercept is ȳ − b₁x̄.' },
      { value: 210 - (620 / 1860) * 14, say: 'The slope is Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)² = 1,860 ÷ 620 = 3, not the other way up.' },
      { value: 14 - 3 * 210, say: 'Swap the means: b₀ = ȳ − b₁x̄ = 210 − 3 × 14.' },
    ],
    solution: 'b₁ = 1,860 ÷ 620 = 3 (hundred dollars per hour of advertising); b₀ = 210 − 3 × 14 = 168. The line is sales = 168 + 3 × hours: on these weekends each extra hour of radio went with about $300 more in plant sales. That is an association: spring weekends with good weather may have had both more advertising booked and more shoppers. The intercept, $16,800 with no advertising, is meaningful only if some weekends had little or none.',
  },
  {
    id: 'b06-ls-i2', type: 'mc', kind: 'applied',
    prompt: 'A pharmacy chain (fictional) sends the managers of its 20 branches with the lowest customer-satisfaction scores last quarter on a service course. This quarter those 20 branches improved by 6 points on average, while the chain as a whole was unchanged. What is the best reading?',
    options: [
      'Some or all of the rise may be regression toward the mean; compare with low scorers who didn’t take the course.',
      'The course worked: the trained branches improved by 6 points while the rest of the chain stood still over the quarter.',
      'The rise can’t be regression toward the mean, because these branches were chosen for low scores rather than high ones.',
      'Satisfaction scores are unreliable, since a real change of 6 points in a single quarter is impossible.',
    ],
    answer: 0,
    feedback: {
      1: 'Branches chosen for being lowest would be expected to rise with no course at all, because part of a low score is bad luck that doesn’t repeat. The comparison with the rest of the chain doesn’t remove that.',
      2: 'Regression toward the mean works in both tails: unusually low scorers drift up, unusually high ones drift down.',
      3: 'Nothing says the change is impossible; the issue is what caused it.',
    },
    solution: 'Quarter-to-quarter scores are imperfectly correlated, so the branches selected as lowest will, on average, score closer to the mean next time even if nothing is done. The fair test is to pick the low scorers the same way and send only some (chosen at random) on the course, then compare the two groups’ changes.',
  },
  {
    id: 'b06-ls-i3', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside’s first 24 Wednesdays, 3 March – 11 August 2027: the day’s high in B2:B25 and footfall in C2:C25. Ana wants a line for estimating Wednesday footfall from the forecast high. In F1, calculate its slope.',
    sheet: wedSheet,
    cell: 'F1', answer: '=SLOPE(C2:C25,B2:B25)',
    alt: ['=CORREL(B2:B25,C2:C25)*STDEV.S(C2:C25)/STDEV.S(B2:B25)', '=INDEX(LINEST(C2:C25,B2:B25),1)'],
    view: 'A1:F25', maxHeight: '20rem', widths: { A: 8 }, formats: { F1: '0.000' },
    wrong: [
      { formula: '=SLOPE(B2:B25,C2:C25)', say: 'That is the slope for estimating the high from footfall. SLOPE takes the variable you want to predict first: footfall, in C.' },
      { formula: '=CORREL(B2:B25,C2:C25)', say: 'That is r, the slope in standard units. The slope in people per °F is r × s_footfall ÷ s_high.' },
      { formula: '=INTERCEPT(C2:C25,B2:B25)', say: 'That is the intercept. The slope is SLOPE(known_y’s, known_x’s).' },
    ],
    solution: `<x>=SLOPE(C2:C25,B2:B25)</x> = ${WL.b1.toFixed(3)} people per °F. The swapped version, <x>=SLOPE(B2:B25,C2:C25)</x>, gives ${WX.b1.toFixed(4)} °F per person, a different line (1 ÷ ${WX.b1.toFixed(4)} = ${(1 / WX.b1).toFixed(2)}, not ${WL.b1.toFixed(2)}). These Wednesdays run from cold March to hot August while the new café was still building up its trade, so the slope mixes the season’s warmth with that build-up: it describes how these days differed, not what a warmer Wednesday on its own would bring.`,
  },
  {
    id: 'b06-ls-i4', type: 'num', kind: 'applied',
    prompt: 'Harbourside’s line for the year is footfall = 10.33 + 2.016 × high (°F). The forecast for a Tuesday in June is 80 °F. What footfall does the line give? Round to the nearest person.',
    answer: Math.round(10.33 + 2.016 * 80), check: () => TL.b0 + TL.b1 * 80, unit: 'people', places: 0, tol: 1,
    wrong: [
      { value: Math.round(2.016 * 80), say: 'Add the intercept: ŷ = b₀ + b₁x = 10.33 + 2.016 × 80.' },
      { value: Math.round(TX.b0 + TX.b1 * 80), say: 'That uses the line for estimating the high from footfall. To estimate footfall from the high, use footfall = 10.33 + 2.016 × high.' },
    ],
    solution: `10.33 + 2.016 × 80 = ${(10.33 + 2.016 * 80).toFixed(1)}, about ${Math.round(10.33 + 2.016 * 80)} people. That is the line’s average for 80 °F days across the whole week; Harbourside’s weekends are far busier than its weekdays, so a Tuesday will usually come in below it. Module 3 adds the day of the week to the model, and module 2 shows how wide the range around a single day’s figure is.`,
  },
  {
    id: 'b06-ls-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Harbourside’s least-squares line is sales = −76.58 + 6.64 × transactions, fitted to 306 days with 13 to 293 transactions. Classify each statement.',
    items: [
      'On days with one more transaction, sales were $6.64 higher on average.',
      'Every extra transaction a barista rings up adds exactly $6.64 to the day’s sales.',
      'On a day with no transactions the café would take −$76.58.',
      'A day with the year’s average number of transactions is fitted with the year’s average sales.',
      'Per 10 transactions, the slope is $66.41.',
    ],
    categories: ['Correct', 'Not correct'],
    answer: [0, 1, 1, 0, 0],
    feedback: {
      1: 'The slope is an average comparison between days. Individual transactions vary, and busier days also have bigger tickets.',
      2: 'x = 0 is outside the data; the intercept is not a forecast.',
      3: 'Correct: the least-squares line always passes through (x̄, ȳ).',
    },
    solution: 'The slope compares days (“goes with”), and rescales with the units: 10 × 6.641 = $66.41 per 10 transactions. The line passes through the point of means. It does not say what one transaction adds, and its intercept is an extrapolation to a day that never happened.',
  },
  {
    id: 'b06-ls-i6', type: 'num', kind: 'numerical',
    prompt: 'At Harbourside the day’s high has mean 64.18 °F and standard deviation 15.00 °F; footfall has mean 139.69 and standard deviation 69.29; r = 0.436. On a day with footfall 2 standard deviations above its mean, what high does the regression of the high on footfall give? Give one decimal place.',
    answer: rnd(64.18 + 0.436 * 2 * 15, 1), check: () => 64.18 + 0.436 * 2 * 15.00, unit: '°F', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(64.18 + 2 * 15, 1), say: 'That assumes the high is as unusual as footfall, 2 SD. In standard units the fitted value is r × z = 0.436 × 2 = 0.872 SD.' },
      { value: rnd(64.18 + 0.436 * 2 * 69.29, 1), say: 'Convert back with the standard deviation of the high (15.00 °F), not of footfall.' },
    ],
    solution: `ẑ = r × z = 0.436 × 2 = 0.872 standard deviations; 64.18 + 0.872 × 15.00 = ${(64.18 + 0.872 * 15).toFixed(1)} °F. Very busy days were warmer than average, but by much less than they were busy: regression toward the mean, in the direction from footfall to temperature.`,
  },
];

export const check = [
  {
    id: 'b06-ls-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does the least-squares line make as small as possible?',
    options: [
      'The sum of the squared vertical distances from the points to the line.',
      'The sum of the vertical distances from the points to the line, signs included.',
      'The sum of the squared perpendicular distances from the points to the line.',
      'The number of points that lie above the line rather than below it.',
    ],
    answer: 0,
    feedback: {
      1: 'Signed distances always add to 0 for any line through the means, so that can’t choose between lines; squaring makes every miss count.',
      2: 'Least squares measures misses vertically, in y’s units, because the line predicts y from x. Perpendicular distances give a different line (orthogonal regression).',
      3: 'Counting points above and below doesn’t fix a line; least squares weighs how far each point is.',
    },
    solution: 'Least squares chooses b₀ and b₁ to minimise SSE = Σ(y − ŷ)², the sum of squared vertical residuals.',
  },
  {
    id: 'b06-ls-k2', type: 'num', kind: 'numerical',
    prompt: 'Harbourside’s footfall rises by 2.016 people per °F on the least-squares line. What is the slope per °C? (A change of 1 °C is a change of 1.8 °F.) Give two decimal places.',
    answer: rnd(2.016 * 1.8, 2), check: () => 2.016 * 9 / 5, unit: 'people per °C', places: 2, tol: 0.005,
    wrong: [
      { value: rnd(2.016 / 1.8, 2), say: 'A degree Celsius is larger than a degree Fahrenheit, so the slope per °C is larger: multiply by 1.8.' },
      { value: rnd(2.016 * 1.8 + 32, 2), say: 'The +32 converts a temperature, not a difference in temperature. Slopes are per unit change, so only the 1.8 matters.' },
    ],
    solution: '1 °C is 1.8 °F, so 2.016 × 1.8 = 3.63 people per °C. The correlation is unchanged by the units; the slope is not.',
  },
  {
    id: 'b06-ls-k3', type: 'formula', kind: 'applied',
    prompt: `Harbourside, June 2027: rain (inches) in B2:B31 and footfall in C2:C31. ${juneDry} of the 30 days were dry. In F1, calculate the footfall the least-squares line of footfall on rain gives for a dry day.`,
    sheet: rainSheet,
    cell: 'F1', answer: '=INTERCEPT(C2:C31,B2:B31)',
    alt: ['=FORECAST.LINEAR(0,C2:C31,B2:B31)', '=TREND(C2:C31,B2:B31,0)', '=AVERAGE(C2:C31)-SLOPE(C2:C31,B2:B31)*AVERAGE(B2:B31)'],
    view: 'A1:F31', maxHeight: '20rem', widths: { A: 8, E: 24 }, formats: { F1: '0.0' },
    wrong: [
      { formula: '=INTERCEPT(B2:B31,C2:C31)', say: 'The ranges are swapped: that is the line of rain on footfall. INTERCEPT takes the variable being predicted (footfall) first.' },
      { formula: '=SLOPE(C2:C31,B2:B31)', say: 'That is the change in footfall per inch of rain. A dry day has rain = 0, so its fitted value is the intercept.' },
      { formula: '=AVERAGE(C2:C31)', say: 'That is the average of all June days, wet and dry. The line’s value at rain = 0 is the intercept.' },
    ],
    solution: `<x>=INTERCEPT(C2:C31,B2:B31)</x> = ${RL.b0.toFixed(1)} people. Here x = 0 is a real, common situation (${juneDry} dry days), so the intercept has a meaning: the line’s footfall for a dry June day. The slope, ${RL.b1.toFixed(1)} people per inch, says wet days were quieter. One very wet day, 15 June (1.34 inches), sits far to the right of the others and has a strong pull: without it the slope would be ${RL2.b1.toFixed(1)} people per inch.`,
  },
  {
    id: 'b06-ls-k4', type: 'num', kind: 'numerical',
    prompt: 'Greywell Books (fictional) fits weekly sales (in dollars) on weekly shop visitors. Visitors average 640 a week and sales $5,120 a week, and the slope is $6.50 per visitor. What is the intercept, in dollars?',
    answer: 5120 - 6.5 * 640, check: () => 5120 - 6.50 * 640, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 5120 / 640, say: 'That is sales per visitor, $8.00. The intercept is ȳ − b₁x̄.' },
      { value: 5120 + 6.5 * 640, say: 'Subtract b₁x̄ from ȳ.' },
    ],
    solution: 'b₀ = ȳ − b₁x̄ = 5,120 − 6.50 × 640 = $960. Here the slope ($6.50) is below sales per visitor ($8.00), so the intercept is positive: on weeks with more visitors, each extra visitor went with less than the average spend.',
  },
  {
    id: 'b06-ls-k5', type: 'mc', kind: 'applied',
    prompt: 'A hotel (fictional) regresses daily room-service revenue on occupied rooms (60 to 180 a night) and gets revenue = −420 + 9.80 × rooms. The general manager asks whether the −$420 means room service loses money on quiet nights. What is the best answer?',
    options: [
      'No: −$420 is where the line meets zero occupied rooms, far below any night in the data.',
      'Yes: room service loses about $420 a night before the first order, which room revenue must cover.',
      'Yes, but only on nights with fewer than about 43 occupied rooms, where the line drops below zero.',
      'No: a negative intercept shows the line is wrong and the slope can’t be trusted either.',
    ],
    answer: 0,
    feedback: {
      1: 'The line is about revenue, not costs, and the intercept is an extrapolation, not an amount the service spends.',
      2: 'The hotel never had fewer than 60 occupied rooms in the data, so the line says nothing about 43.',
      3: 'A negative intercept is common and harmless when x = 0 is outside the data; the slope inside the range is still a fair summary.',
    },
    solution: 'The intercept is the fitted value at 0 occupied rooms, a situation outside the 60–180 rooms the line was fitted to. Read the slope, $9.80 of room-service revenue per occupied room, inside that range; the intercept is negative because revenue rises faster than in proportion to rooms (the slope exceeds revenue per room).',
  },
  {
    id: 'b06-ls-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about a least-squares line with an intercept.',
    text: 'The line always passes through [[0]]. Its residuals add up to [[1]]. In standard units its slope equals [[2]]. The slope of y on x times the slope of x on y equals [[3]].',
    blanks: [
      { options: ['the origin (0, 0)', 'the point of means (x̄, ȳ)', 'the highest point'], answer: 1 },
      { options: ['zero', 'the SSE', 'n − 2'], answer: 0 },
      { options: ['1', 'r²', 'r'], answer: 2 },
      { options: ['1', 'r²', 'r'], answer: 1 },
    ],
    solution: 'b₀ = ȳ − b₁x̄ puts (x̄, ȳ) on the line; the first normal equation makes Σe = 0; ẑ_y = r·z_x; and r·s_y/s_x × r·s_x/s_y = r².',
  },
];
