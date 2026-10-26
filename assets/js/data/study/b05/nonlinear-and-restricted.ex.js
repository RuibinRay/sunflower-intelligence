// nonlinear-and-restricted.ex.js — B05 · Curves, thresholds and restricted ranges: widgets, practice and the
// knowledge check (answer keys live here). Café data from case.js (corrected log); the hotel, the towns, Copperline
// Gym, Fenwick Logistics and the reliability figures are fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';

const at = (name) => CAFE_COLUMNS.indexOf(name);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
const loadOf = (r) => r[at('transactions')] * 0.55 / r[at('peak_staff_hours')];
const icedOf = (r) => r[at('iced_drinks')] / (r[at('iced_drinks')] + r[at('hot_drinks')]);

// ---------------------------------------------------------------- Millbrook, June: peak load and wait
const JUN = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && r[at('date')] >= '2027-06-01' && r[at('date')] <= '2027-06-30');
const junL = JUN.map((r) => round(loadOf(r), 2)), junW = JUN.map((r) => r[at('peak_wait_min')]);
const junR = C.pearson(junL, junW).r, junHinge = C.pearson(junL.map((l) => Math.max(0, l - 7) ** 2), junW).r;
const junBelow = junL.filter((l) => l <= 7).length;
const junCells = { A1: 'Day', B1: 'Peak load', C1: 'Peak wait (min)', ...col('A', 2, JUN.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, junL), ...col('C', 2, junW) };
const junHingeF = Object.fromEntries(JUN.map((_, i) => [`D${i + 2}`, `=MAX(0,B${i + 2}-7)^2`]));

// ---------------------------------------------------------------- Harbourside, every eighth day: temperature and iced share
const HB = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Harbourside').filter((_, i) => i % 8 === 3);
const hbT = HB.map((r) => r[at('high_f')]), hbI = HB.map((r) => round(icedOf(r), 3)), hbS = HB.map((r) => (['06', '07', '08'].includes(r[at('date')].slice(5, 7)) ? 'summer' : 'other'));
const hbAll = C.pearson(hbT, hbI).r, hbSum = C.pearson(hbT.filter((_, i) => hbS[i] === 'summer'), hbI.filter((_, i) => hbS[i] === 'summer')).r;
const hbN = HB.length, hbNs = hbS.filter((s) => s === 'summer').length;
const hbLast = hbN + 1;
const hbCells = { A1: 'Day', B1: 'High (°F)', C1: 'Iced share', D1: 'Season', ...col('A', 2, HB.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, hbT), ...col('C', 2, hbI), ...col('D', 2, hbS), F1: 'r, all days', G1: `=CORREL(B2:B${hbLast},C2:C${hbLast})`, F2: 'r, summer days' };

// ---------------------------------------------------------------- Millbrook, 1 October – 9 November: roster and sales
const OCT = CLEAN_ROWS.filter((r) => r[at('cafe')] === 'Millbrook' && r[at('date')] >= '2027-10-01' && r[at('date')] <= '2027-11-09');
const octK = OCT.map((r) => (['Sat', 'Sun'].includes(r[at('weekday')]) ? 'weekend' : 'weekday'));
const octS = OCT.map((r) => r[at('peak_staff_hours')]), octV = OCT.map((r) => r[at('sales')]);
const octAll = C.pearson(octS, octV).r, octWk = C.pearson(octS.filter((_, i) => octK[i] === 'weekday'), octV.filter((_, i) => octK[i] === 'weekday')).r;
const octCells = { A1: 'Day', B1: 'Day type', C1: 'Peak barista hours', D1: 'Sales ($)', ...col('A', 2, OCT.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, octK), ...col('C', 2, octS), ...col('D', 2, octV), F1: 'r, all days', G1: '=CORREL(C2:C41,D2:D41)', F2: 'r, weekdays only' };

// ---------------------------------------------------------------- the twelve fictional towns
const TP = [4.2, 6.8, 9.5, 12, 15, 21, 28, 37, 52, 80, 140, 310], TN = [5, 6, 8, 7, 9, 11, 12, 14, 15, 19, 24, 33];
const TOWNS = 'ABCDEFGHIJKL'.split('').map((c) => `Town ${c}`);
const tR = C.pearson(TP, TN).r, tLog = C.pearson(TP.map(Math.log), TN.map(Math.log)).r;
const townCells = { A1: 'Town', B1: 'Population (thousands)', C1: 'Cafés', ...col('A', 2, TOWNS), ...col('B', 2, TP), ...col('C', 2, TN), E1: 'r of the values', F1: '=CORREL(B2:B13,C2:C13)', E2: 'r of the logs' };

// ---------------------------------------------------------------- the hotel (fictional)
const HX = [17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22], HY = [9.6, 7.1, 5.0, 3.6, 2.4, 2.0, 2.5, 3.4, 4.9, 7.0, 9.8];

// ---------------------------------------------------------------- whole log, for the widgets
const T = column('high_f'), I = column('iced_share'), L = column('peak_load'), W = column('peak_wait_min'), CAFE = column('cafe'), DATE = column('date');
const SEASON = DATE.map((d) => (['06', '07', '08'].includes(d.slice(5, 7)) ? 'June–August' : 'Other months'));

export const widgets = {
  'nl-iced': {
    type: 'scatter',
    title: 'The day’s high and the share of drinks served iced, 612 café-days',
    x: { name: 'High', values: T, unit: '°F' },
    y: { name: 'Iced share', values: I },
    group: { name: 'Season', values: SEASON },
    labels: DATE.map((d, i) => `${dayLabel(d)} (${CAFE[i]})`),
    show: ['pearson', 'spearman', 'r2'],
    toggles: ['line', 'group', 'ranks'],
    note: 'r = 0.940 and ρ = 0.957 for the year. The line runs above the points on cold and on hot days and below them in the 60s and low 70s: the S. By season, June–August gives r = 0.841 over a much narrower range of temperatures, and the other months 0.883.',
  },
  'nl-wait': {
    type: 'scatter',
    title: 'Peak load (transactions per barista hour) and the average peak wait',
    x: { name: 'Peak load', values: L },
    y: { name: 'Peak wait', values: W, unit: 'minutes' },
    group: { name: 'Café', values: CAFE },
    labels: DATE.map((d, i) => `${dayLabel(d)} (${CAFE[i]})`),
    show: ['pearson', 'spearman', 'r2'],
    toggles: ['line', 'ranks', 'group'],
    note: 'r = 0.830, ρ = 0.867. Waits sit near 1.6 minutes up to a load of about 7 and climb steeply after it; the straight line can follow neither part. Within the ranges, r = −0.10 up to 7 and 0.93 above it.',
  },
  'nl-hotel': {
    type: 'scatter',
    title: 'Larkspur Hotel (fictional): thermostat setting and complaints about room temperature',
    x: { name: 'Thermostat setting', values: HX, unit: '°C' },
    y: { name: 'Complaints per 100 guests', values: HY },
    labels: HX.map((x, i) => `Week ${i + 1} (${x} °C)`),
    show: ['pearson', 'spearman'],
    toggles: ['line', 'ranks'],
    note: 'r = 0.00 and ρ = −0.03, yet complaints follow the distance from 19.5 °C almost exactly (r = 0.97 with the distance, 0.999 with its square).',
  },
  'nl-towns': {
    type: 'scatter',
    title: 'Twelve fictional towns: population and number of cafés',
    x: { name: 'Population', values: TP, unit: 'thousands' },
    y: { name: 'Cafés', values: TN },
    labels: TOWNS,
    show: ['pearson', 'spearman'],
    toggles: ['logX', 'logY', 'ranks'],
    note: 'On the raw values the largest town sits far out and the others bunch at the left; r = 0.950. With logs of both, the points fall close to a line: r = 0.994. Spearman’s ρ is 0.993 either way, because logs keep the order.',
  },
  'nl-atten': {
    type: 'formula',
    title: 'Attenuation: how measurement error weakens a correlation',
    intro: 'Set the true correlation and the reliability of each measure (1 = measured without error).',
    inputs: [
      { id: 'r', label: 'True correlation', min: 0, max: 1, step: 0.05, value: 0.8, fmt: 'num' },
      { id: 'rx', label: 'Reliability of x', min: 0.3, max: 1, step: 0.05, value: 0.9, fmt: 'num' },
      { id: 'ry', label: 'Reliability of y', min: 0.3, max: 1, step: 0.05, value: 0.6, fmt: 'num' },
    ],
    compute: (v) => {
      const k = Math.sqrt(v.rx * v.ry), obs = v.r * k;
      const rels = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
      return {
        headline: { label: 'Observed correlation', value: obs.toFixed(3) },
        rows: [['√(reliability of x × reliability of y)', k.toFixed(3)], ['Share of the true correlation that shows', `${(k * 100).toFixed(0)}%`], ['Corrected from the observed value', `${obs.toFixed(3)} ÷ ${k.toFixed(3)} = ${v.r.toFixed(3)}`]],
        note: v.r === 0 ? 'With no true correlation, measurement error can’t create one: the observed correlation is 0 too.' : `Random errors add scatter unrelated to the relationship, so a true correlation of ${v.r.toFixed(2)} shows up as ${obs.toFixed(2)}. The correction works only if the reliabilities are right; underestimate them and the corrected value can exceed 1.`,
        chart: { kind: 'line', x: { label: 'Reliability of y (x as set)', values: rels }, series: [{ name: 'Observed correlation', values: rels.map((ry) => Number((v.r * Math.sqrt(v.rx * ry)).toFixed(3))) }], y: { label: 'Observed r' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'b05-nonlin-g1', type: 'steps', kind: 'numerical',
    prompt: 'Millbrook, June 2027: B2:B31 hold each day’s peak load (peak transactions per barista hour) and C2:C31 the average peak wait. Compare r for the raw load with r for a hinge at a load of 7.',
    solution: `CORREL of load and wait is ${fx(junR)}. The squared hinge, =MAX(0,B2−7)^2, is zero on the ${junBelow} days with a load of 7 or less and grows ever faster above it; its correlation with the wait is ${fx(junHinge)}. The wait follows a threshold, so r on the raw load understates how closely load and wait are linked. The threshold of 7 was read from the full log, not from these 30 days, which keeps the June figure honest.`,
    steps: [
      {
        id: 'b05-nonlin-g1-s1', type: 'formula',
        prompt: 'In F1, calculate Pearson’s r between the peak load and the peak wait.',
        sheet: { cells: { ...junCells, D1: 'Hinge²', E1: 'r, load', E2: 'r, hinge²' } },
        cell: 'F1', answer: '=CORREL(B2:B31,C2:C31)',
        alt: ['=CORREL(C2:C31,B2:B31)', '=PEARSON(B2:B31,C2:C31)', '=PEARSON(C2:C31,B2:B31)'],
        view: 'A1:F31', maxHeight: '22rem',
        formats: { B: '0.00', F1: '0.000' }, widths: { C: 15, E: 11 },
        wrong: [
          { formula: '=RSQ(B2:B31,C2:C31)', say: 'RSQ is r². Use CORREL for r.' },
        ],
        hints: ['CORREL takes the two ranges.', '<x>=CORREL(B2:B31,C2:C31)</x>'],
      },
      {
        id: 'b05-nonlin-g1-s2', type: 'formula',
        prompt: 'In D2, calculate the squared hinge at 7: zero when the load is 7 or less, otherwise the square of the load minus 7. Fill it down to D31.',
        sheet: { cells: { ...junCells, D1: 'Hinge²', E1: 'r, load', F1: '=CORREL(B2:B31,C2:C31)', E2: 'r, hinge²' } },
        cell: 'D2', fill: 'D2:D31', answer: '=MAX(0,B2-7)^2',
        alt: ['=IF(B2>7,(B2-7)^2,0)', '=MAX(0,B2-7)*MAX(0,B2-7)', '=MAX(B2-7,0)^2'],
        view: 'A1:F31', maxHeight: '22rem',
        formats: { B: '0.00', D: '0.00', F1: '0.000' }, widths: { C: 15, E: 11 },
        wrong: [
          { formula: '=(B2-7)^2', say: 'Without MAX, loads below 7 also give a positive value, so the hinge is a U, not a threshold. Use <x>=MAX(0,B2-7)^2</x>.' },
          { formula: '=MAX(0,B2-7)', say: 'That is the hinge itself; the question asks for its square, which lets the wait rise ever faster above 7.' },
          { formula: '=MAX(0,B$2-7)^2', say: 'With the row locked, every day gets 1 June’s value. Leave the reference relative.' },
        ],
        hints: ['MAX(0, load − 7) is zero below the threshold and the distance above it.', '<x>=MAX(0,B2-7)^2</x>, filled down.'],
      },
      {
        id: 'b05-nonlin-g1-s3', type: 'formula',
        prompt: 'In F2, calculate Pearson’s r between the squared hinge and the peak wait.',
        sheet: { cells: { ...junCells, ...junHingeF, D1: 'Hinge²', E1: 'r, load', F1: '=CORREL(B2:B31,C2:C31)', E2: 'r, hinge²' } },
        cell: 'F2', answer: '=CORREL(D2:D31,C2:C31)',
        alt: ['=CORREL(C2:C31,D2:D31)', '=PEARSON(D2:D31,C2:C31)'],
        view: 'A1:F31', maxHeight: '22rem',
        formats: { B: '0.00', D: '0.00', F1: '0.000', F2: '0.000' }, widths: { C: 15, E: 11 },
        wrong: [
          { formula: '=CORREL(B2:B31,C2:C31)', say: 'That is r for the raw load, as in F1. Correlate the hinge in column D with the wait.' },
        ],
        hints: ['Same function, with column D in place of column B.'],
      },
      {
        id: 'b05-nonlin-g1-s4', type: 'mc',
        prompt: `In these 30 days r is ${fx(junR)} for the load and ${fx(junHinge)} for the squared hinge. What is the best reading?`,
        options: [
          'Waits are flat up to a load of about 7 and rise ever faster above it; r on the raw load understates the link.',
          'The squared hinge is a better variable to roster by, so managers should be told to staff to it in future.',
          'Load and wait are only moderately related, since the raw r is under 0.9 and the hinge r is just a refinement.',
          'Squaring always raises a correlation, so the higher value from the hinge carries no extra information here.',
        ],
        answer: 0,
        hints: ['What shape does the hinge describe, and how close is it to the data?'],
        feedback: {
          1: 'The hinge describes the shape; the roster decision is still about keeping the load low, and the threshold should be confirmed on new data.',
          2: 'A raw r near 0.9 measured against a straight line understates a link that follows a threshold this closely.',
          3: 'Squaring doesn’t always raise r: the unsquared U, (load − 7)², would fit worse. The hinge helps because it matches the shape.',
        },
      },
    ],
  },
  {
    id: 'b05-nonlin-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional study expects a true correlation of 0.70 between two measures. The first is measured with reliability 0.90, the second with reliability 0.60. What correlation should the study expect to observe? Give two decimal places.',
    answer: 0.51, check: () => 0.7 * Math.sqrt(0.9 * 0.6), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.38, say: 'You multiplied by the product of the reliabilities, 0.54. Attenuation multiplies by its square root, √0.54 = 0.735.' },
      { value: 0.95, say: 'That divides by √0.54, which corrects an observed r. Here you start from the true r and multiply.' },
    ],
    hints: ['r_obs ≈ r_true × √(rel_x × rel_y).', '0.70 × √(0.90 × 0.60) = 0.70 × √0.54.'],
    solution: 'r_obs ≈ 0.70 × √(0.90 × 0.60) = 0.70 × 0.735 ≈ 0.51. Noisy measurement of the second variable alone hides about a quarter of the true correlation.',
  },
  {
    id: 'b05-nonlin-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Copperline Gym (fictional) varied the length of its spin classes from 20 to 70 minutes and asked members to rate each class. Ratings were low for very short and very long classes and highest at about 45 minutes. Pearson’s r between length and rating is 0.04. What should the gym conclude?',
    options: [
      'Length matters, but the link rises and then falls, so r is near 0; describe the peak and the drop on each side.',
      'Class length is unrelated to members’ ratings, since r is close to 0 and almost certainly not significant.',
      'Use Spearman’s ρ instead, which will reveal the strength of the relationship that Pearson’s r has missed.',
      'The relationship is weak but slightly positive, so classes a little longer than now would rate a little higher.',
    ],
    answer: 0,
    hints: ['What does r measure, and what shape do the ratings follow?'],
    feedback: {
      1: 'r = 0 means no straight-line relationship. A rise-then-fall can be strong and still give r near 0.',
      2: 'ρ needs a consistent direction too; a rise-then-fall defeats it as well.',
      3: 'r near 0 describes no line at all; it says nothing about which direction to move from the current length.',
    },
    solution: 'An inverted U puts positive products of z-scores on one side and negative ones on the other, so r ends near 0 and ρ fails too. Report the shape: ratings rise up to about 45 minutes and fall after, and confirm the peak with new classes because it was read from these data.',
  },
  {
    id: 'b05-nonlin-g4', type: 'formula', kind: 'applied',
    prompt: `Harbourside, every eighth day of 2027 (${hbN} days): B holds the day’s high (°F), C the share of drinks served iced and D the season. G1 gives r for all ${hbN} days. In G2, calculate r for the summer days only (June–August).`,
    sheet: { cells: hbCells },
    cell: 'G2', answer: `=CORREL(FILTER(B2:B${hbLast},D2:D${hbLast}="summer"),FILTER(C2:C${hbLast},D2:D${hbLast}="summer"))`,
    alt: [`=PEARSON(FILTER(B2:B${hbLast},D2:D${hbLast}="summer"),FILTER(C2:C${hbLast},D2:D${hbLast}="summer"))`, `=CORREL(FILTER(B2:B${hbLast},D2:D${hbLast}<>"other"),FILTER(C2:C${hbLast},D2:D${hbLast}<>"other"))`],
    require: ['FILTER'],
    view: `A1:G${hbLast}`, maxHeight: '22rem',
    formats: { C: '0.0%', G1: '0.000', G2: '0.000' }, widths: { F: 16 },
    wrong: [
      { formula: `=CORREL(B2:B${hbLast},C2:C${hbLast})`, say: 'That is every day, as in G1. Keep only the summer rows with FILTER.' },
      { formula: `=CORREL(FILTER(B2:B${hbLast},D2:D${hbLast}="other"),FILTER(C2:C${hbLast},D2:D${hbLast}="other"))`, say: 'That keeps the other months. Filter on “summer”.' },
    ],
    hints: [`<x>FILTER(B2:B${hbLast},D2:D${hbLast}="summer")</x> keeps the summer highs. Filter the iced shares the same way.`, 'Put both filtered ranges inside CORREL.'],
    solution: `<x>=CORREL(FILTER(B2:B${hbLast},D2:D${hbLast}="summer"),FILTER(C2:C${hbLast},D2:D${hbLast}="summer"))</x> = ${fx(hbSum)} for the ${hbNs} summer days, against ${fx(hbAll)} for all ${hbN}. Summer days span a much narrower range of temperatures, so the same scatter is a larger share of what is left: range restriction, not a weaker link.`,
  },
];

export const independent = [
  {
    id: 'b05-nonlin-i1', type: 'formula', kind: 'numerical',
    prompt: 'Twelve fictional towns: B2:B13 hold the population (thousands) and C2:C13 the number of cafés. F1 gives r for the values. In F2, calculate r for the natural logs of both columns.',
    sheet: { cells: townCells },
    cell: 'F2', answer: '=CORREL(LN(B2:B13),LN(C2:C13))',
    alt: ['=CORREL(LOG10(B2:B13),LOG10(C2:C13))', '=PEARSON(LN(B2:B13),LN(C2:C13))', '=CORREL(LN(C2:C13),LN(B2:B13))'],
    view: 'A1:F13',
    formats: { F1: '0.000', F2: '0.000' }, widths: { B: 20, E: 14 },
    wrong: [
      { formula: '=CORREL(LN(B2:B13),C2:C13)', say: 'That logs only the population. The question asks for the logs of both columns.' },
      { formula: '=LN(CORREL(B2:B13,C2:C13))', say: 'That is the log of r. Take the logs of the data first, then correlate them.' },
    ],
    solution: `<x>=CORREL(LN(B2:B13),LN(C2:C13))</x> = ${fx(tLog)}, against ${fx(tR)} on the raw values. The log scale spreads out the small towns and pulls in the largest, and the curve becomes nearly straight. Base-10 logs give the same r, because changing the base only rescales the logs.`,
  },
  {
    id: 'b05-nonlin-i2', type: 'num', kind: 'numerical',
    prompt: 'Fenwick Logistics (fictional) finds r = 0.50 between a driver aptitude score and on-time deliveries, among drivers it hired. The scores of hired drivers have half the standard deviation of all applicants’ scores. Assuming a straight-line relationship with even scatter, estimate r across all applicants with the range-restriction formula. Give two decimal places.',
    answer: 0.76, check: () => { const k = 2, r = 0.5; return k * r / Math.sqrt(1 - r * r + k * k * r * r); }, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1, say: 'Doubling r assumes it scales with the spread, which it doesn’t: r is bounded by 1. Use k r ÷ √(1 − r² + k² r²).' },
      { value: 0.25, say: 'k = S ÷ s is 2 (applicants spread twice as widely), not 0.5.' },
    ],
    solution: 'k = S ÷ s = 2. r_u = 2 × 0.50 ÷ √(1 − 0.25 + 4 × 0.25) = 1.00 ÷ √1.75 ≈ 0.76. The hired drivers’ r of 0.50 is accurate for them; across all applicants the score would track deliveries far more closely, if the assumptions hold.',
  },
  {
    id: 'b05-nonlin-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements that are true.',
    options: [
      'A relationship can be strong and have r close to 0.',
      'A high r shows that a straight line describes the relationship well.',
      'Taking logs of both variables can change Pearson’s r but not Spearman’s ρ.',
      'Restricting the data to part of the range of x always lowers r.',
      'Random measurement error in either variable tends to weaken an observed correlation.',
      'If r is low among summer days, temperature affects iced sales less in summer.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'A monotonic curve, like the iced-share S, can give r = 0.94 while a line misfits both ends.',
      3: 'Usually, but not always: selecting the steep part of a curve can raise r (loads above 7: 0.93 against 0.83).',
      5: 'A lower r in summer mainly reflects the narrower range of summer temperatures; compare band averages or slopes instead.',
    },
    solution: 'True: a U can give r ≈ 0 with a strong link; logs change r but keep the order, so ρ is unchanged; measurement error attenuates r. False: a high r can come from a curve; restriction usually but not always lowers r; and a lower r over a narrower range says little about the size of the effect.',
  },
  {
    id: 'b05-nonlin-i4', type: 'classify', kind: 'applied',
    prompt: 'Each finding below is misleading for one main reason. Classify each.',
    items: [
      'Among staff who passed probation, the interview score barely correlates with later performance.',
      'Errors at a packing station are flat until about 120 parcels an hour, then climb fast; r across all hours is 0.6.',
      'Sales of hot soup are high on cold days and on very wet warm days, low otherwise; r with temperature is about 0.',
      'Customer satisfaction, measured with a single noisy question, correlates only 0.3 with repeat visits.',
    ],
    categories: ['Restricted range', 'A threshold', 'A U-shape or turning point', 'Attenuation by measurement error'],
    answer: [0, 1, 2, 3],
    fixed: true,
    feedback: {
      0: 'Only those who passed are in the data, so the range of scores (and of performance) is narrow.',
      1: 'Flat, then steep: r averages the two stretches and understates the link above the threshold.',
      2: 'High at both ends of the plot, low in the middle: r cancels out.',
      3: 'A single question is an unreliable measure; random error weakens r.',
    },
    solution: 'Selected groups restrict the range; flat-then-steep is a threshold; high-at-both-ends is a U; single noisy questions are unreliable and attenuate r. Each calls for a different remedy: compare against the whole population, describe the threshold, measure against the shape, or measure more reliably.',
  },
  {
    id: 'b05-nonlin-i5', type: 'mc', kind: 'applied',
    prompt: 'Fenwick Logistics (fictional) hires only applicants who score above 70 on its aptitude test. Among hired drivers, the score and on-time deliveries correlate r = 0.15. HR proposes dropping the test because “it barely predicts performance”. What is the strongest objection?',
    options: [
      'Hired drivers cover only the top of the score range, which shrinks r; the test may separate good and poor drivers well across all applicants.',
      'An r of 0.15 is statistically significant once enough drivers are included, so the test must be kept for that reason alone, whatever HR thinks.',
      'The correlation should be computed with Spearman’s ρ, which would show that the test predicts much better.',
      'Performance is caused by many factors, so no single test could ever be expected to correlate with it.',
    ],
    answer: 0,
    feedback: {
      1: 'Significance says r is unlikely to be exactly 0, not that the test is useful; the real issue is the restricted range.',
      2: 'Ranks don’t restore the missing low scorers; ρ suffers from range restriction too.',
      3: 'That is true but doesn’t answer the question; the test might still separate applicants well.',
    },
    solution: 'The hired drivers are a selected group with a narrow range of scores, so r among them understates how well the test separates all applicants. To judge the test, Fenwick would need performance data from a wider range of scores, for example by hiring some applicants below the cut-off in a trial, or by applying the range-restriction formula as a rough guide.',
  },
];

export const check = [
  {
    id: 'b05-nonlin-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement best describes what Pearson’s r measures?',
    options: [
      'How closely the points hug a straight line.',
      'How strongly y depends on x, whatever the shape of the link.',
      'How steeply y rises or falls as x increases by one unit.',
      'Whether the points follow any consistent increasing pattern.',
    ],
    answer: 0,
    feedback: {
      1: 'A U-shape can be a strong link with r = 0; r only measures the straight-line part.',
      2: 'That is the slope of a fitted line (B06). r has no units and doesn’t depend on the slope’s size.',
      3: 'That describes a monotonic relationship, which Spearman’s ρ measures.',
    },
    solution: 'Pearson’s r measures how closely points cluster around a straight line. A curved, thresholded or U-shaped relationship can be strong while r is moderate or near zero.',
  },
  {
    id: 'b05-nonlin-k2', type: 'num', kind: 'numerical',
    prompt: 'Two measures have an observed correlation of 0.45. Their reliabilities are 0.80 and 0.70. Estimate the correlation between the true values with Spearman’s correction for attenuation. Give two decimal places.',
    answer: 0.6, check: () => 0.45 / Math.sqrt(0.8 * 0.7), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.34, say: 'You multiplied by √(0.80 × 0.70). To correct an observed r, divide by it.' },
      { value: 0.8, say: 'You divided by the product, 0.56, instead of its square root, √0.56 = 0.748.' },
    ],
    solution: 'r_true ≈ 0.45 ÷ √(0.80 × 0.70) = 0.45 ÷ 0.748 ≈ 0.60. The estimate is only as good as the reliabilities: if they were overstated, the true correlation is higher still; if understated, lower.',
  },
  {
    id: 'b05-nonlin-k3', type: 'formula', kind: 'applied',
    prompt: 'Millbrook, 1 October – 9 November 2027: B says whether the day is a weekday or a weekend day, C holds the barista hours rostered for the peak and D the day’s sales. G1 gives r for all 40 days. In G2, calculate r for weekdays only.',
    sheet: { cells: octCells },
    cell: 'G2', answer: '=CORREL(FILTER(C2:C41,B2:B41="weekday"),FILTER(D2:D41,B2:B41="weekday"))',
    alt: ['=CORREL(FILTER(C2:C41,B2:B41<>"weekend"),FILTER(D2:D41,B2:B41<>"weekend"))', '=PEARSON(FILTER(C2:C41,B2:B41="weekday"),FILTER(D2:D41,B2:B41="weekday"))', '=CORREL(FILTER(D2:D41,B2:B41="weekday"),FILTER(C2:C41,B2:B41="weekday"))'],
    view: 'A1:G41', maxHeight: '22rem',
    formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000' }, widths: { C: 18, F: 16 },
    wrong: [
      { formula: '=CORREL(C2:C41,D2:D41)', say: 'That is every day, as in G1. Keep the weekday rows with FILTER.' },
      { formula: '=CORREL(FILTER(C2:C41,B2:B41="weekend"),FILTER(D2:D41,B2:B41="weekend"))', say: 'That keeps the weekends. Filter on “weekday”.' },
    ],
    solution: `<x>=CORREL(FILTER(C2:C41,B2:B41="weekday"),FILTER(D2:D41,B2:B41="weekday"))</x> = ${fx(octWk)}, against ${fx(octAll)} for all 40 days. Over these six weeks the weekday rosters run only from ${Math.min(...octS.filter((_, i) => octK[i] === 'weekday'))} to ${Math.max(...octS.filter((_, i) => octK[i] === 'weekday'))} hours, so within weekdays there is almost no range of x left for r to work with. Most of the all-days correlation comes from the difference between quiet, lightly staffed weekends and busy weekdays.`,
  },
  {
    id: 'b05-nonlin-k4', type: 'mc', kind: 'applied',
    prompt: 'Across 2027 the day’s high and the iced share have r = 0.94; in July alone r = 0.66. The summer manager concludes that temperature hardly matters for July’s iced stock. What is the best response?',
    options: [
      'July’s narrow range of temperatures, on the flat top of the S, shrinks r; temperature still matters, but less per degree near the top.',
      'He is right: a correlation of 0.66 is weak, so July’s iced stock should ignore the weather forecast completely.',
      'He is wrong, because the yearly r of 0.94 is the true correlation and July’s lower value is just a sampling error.',
      'The July figure is unreliable because 62 café-days are too few for a correlation, so the yearly figure should be used.',
    ],
    answer: 0,
    feedback: {
      1: '0.66 among July days is not weak, and the narrow range, not a missing link, explains most of the drop.',
      2: 'Neither figure is the “true” one; each describes a different range of days.',
      3: '62 days is enough for a stable correlation; the drop has a clear reason.',
    },
    solution: 'July temperatures span only about 20°F and sit where the S flattens, so the same scatter is a larger share of what remains and r falls. Temperature still moves the iced share in July, by less per degree than in spring. For stock, July orders should follow footfall and the forecast, with smaller temperature adjustments than in May or June.',
  },
  {
    id: 'b05-nonlin-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Peak load and peak wait have r = 0.83 across 612 café-days, r = −0.10 for loads of 7 or less and r = 0.93 above 7. What does the overall r of 0.83 fail to show?',
    options: [
      'That waits are flat below a load of about 7 and steep above it.',
      'That waits and load are positively related across the year as a whole.',
      'That a straight line misses many of the points by a sizeable amount.',
      'That the busiest café-days tend to have the longest waits on average.',
    ],
    answer: 0,
    feedback: {
      1: 'The positive r does show that higher loads go with longer waits overall.',
      2: 'An r of 0.83 already implies sizeable scatter around a line.',
      3: 'The positive r shows this tendency; what it hides is where the change happens.',
    },
    solution: 'A single r averages a flat stretch and a steep one. The within-range correlations and the band averages show the threshold near a load of 7, which is what a roster rule needs.',
  },
  {
    id: 'b05-nonlin-k6', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst replaces both variables by their logs. Which of Pearson’s r and Spearman’s ρ can change?',
    options: [
      'Only Pearson’s r: logs change the distances between values but keep their order.',
      'Only Spearman’s ρ: logs change the ranks of the values but keep the straight-line pattern.',
      'Both, because any transformation of the data changes every correlation computed from it.',
      'Neither, because logs are a monotonic transformation of both variables.',
    ],
    answer: 0,
    feedback: {
      1: 'Logs keep every value in the same order (for positive values), so the ranks don’t change.',
      2: 'A monotonic transformation such as a log leaves the ranks, and therefore ρ, unchanged.',
      3: 'Monotonic keeps ρ, but Pearson’s r depends on the distances, which logs change.',
    },
    solution: 'Logs are monotonic, so every value keeps its rank and ρ is unchanged; but the distances between values change, so r can rise or fall (the towns: 0.950 to 0.994).',
  },
];
