// covariance-and-pearson.ex.js — B05 · Covariance and Pearson’s r: widgets, practice and the knowledge check (answer
// keys live here). Café data come from case.js (the corrected log); Brightwater Ferries, Ashby Florist, Linden Library
// and Elmstead Hotel are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_COLUMNS, DERIVED as D } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, sd } from '../../../core/stats.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
const slice = (cafe, from, to) => CLEAN_ROWS.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const pick = (rows, name) => rows.map((r) => r[at(name)]);
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const sheetOf = (rows, a, b, la, lb, extra = {}) => ({ cells: { A1: 'Date', B1: la, C1: lb, ...col('A', 2, rows.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, pick(rows, a)), ...col('C', 2, pick(rows, b)), ...extra } });

// ---------------------------------------------------------------- widgets' data
const CAFE = column('cafe'), LABEL = CLEAN_ROWS.map((r) => `${dayLabel(r[at('date')])}, ${r[at('cafe')]}`);
const HF = column('high_f', { cafe: 'Millbrook' }), IS = column('iced_share', { cafe: 'Millbrook' });
const JUNE = slice('Millbrook', '2027-06-01', '2027-06-12');
const jx = pick(JUNE, 'footfall'), jy = pick(JUNE, 'transactions');
const jCov = C.covariance(jx, jy), jR = C.pearson(jx, jy).r;
const ZSUM = '=SUMPRODUCT(STANDARDIZE(B2:B13,AVERAGE(B2:B13),STDEV.S(B2:B13)),STANDARDIZE(C2:C13,AVERAGE(C2:C13),STDEV.S(C2:C13)))/(COUNT(B2:B13)-1)';
const demoSheet = sheetOf(JUNE, 'footfall', 'transactions', 'Footfall', 'Transactions', {
  E1: 'COVARIANCE.S', F1: '=COVARIANCE.S(B2:B13,C2:C13)',
  E2: 'COVARIANCE.P', F2: '=COVARIANCE.P(B2:B13,C2:C13)',
  E3: 'STDEV.S footfall', F3: '=STDEV.S(B2:B13)',
  E4: 'STDEV.S transactions', F4: '=STDEV.S(C2:C13)',
  E5: 'STDEV.P footfall', F5: '=STDEV.P(B2:B13)',
  E6: 'STDEV.P transactions', F6: '=STDEV.P(C2:C13)',
  E7: 'CORREL', F7: '=CORREL(B2:B13,C2:C13)',
  E8: 'PEARSON', F8: '=PEARSON(B2:B13,C2:C13)',
  E9: 'RSQ', F9: '=RSQ(C2:C13,B2:B13)',
  E10: 'COV.S ÷ (SD.S × SD.S)', F10: '=F1/(F3*F4)',
  E11: 'COV.P ÷ (SD.P × SD.P)', F11: '=F2/(F5*F6)',
  E12: 'COV.P ÷ (SD.S × SD.S): mixed', F12: '=F2/(F3*F4)',
  E13: 'Average product of z-scores', F13: ZSUM,
});

// ---------------------------------------------------------------- exercise data
// Harbourside, 1–20 August: transactions and sales
const AUG = slice('Harbourside', '2027-08-01', '2027-08-20');
const augR2 = C.pearson(pick(AUG, 'transactions'), pick(AUG, 'sales')).r2;
// Harbourside, 1–15 October: transactions and sales
const OCT = slice('Harbourside', '2027-10-01', '2027-10-15');
const octCov = C.covariance(pick(OCT, 'transactions'), pick(OCT, 'sales'));
// Millbrook, 1–25 July: high and iced drinks, for the z-score formula
const JUL = slice('Millbrook', '2027-07-01', '2027-07-25');
const julR = C.pearson(pick(JUL, 'high_f'), pick(JUL, 'iced_drinks')).r;
const JZ = '=SUMPRODUCT(STANDARDIZE(B2:B26,AVERAGE(B2:B26),STDEV.S(B2:B26)),STANDARDIZE(C2:C26,AVERAGE(C2:C26),STDEV.S(C2:C26)))/(COUNT(B2:B26)-1)';
// Harbourside: high and hot drinks over the year, for the change-of-units item
const hCovHot = round(C.covariance(column('high_f', { cafe: 'Harbourside' }), column('hot_drinks', { cafe: 'Harbourside' })), 2);
// Brightwater Ferries (fictional): summary figures
const BF = { cov: 1840, sx: 46, sy: 52 };
// Ashby Florist (fictional): five days
const AX = [3, 5, 6, 8, 8], AY = [1, 2, 4, 4, 6];
// Linden Library (fictional): five days
const LX = [120, 150, 90, 180, 160], LY = [300, 340, 250, 420, 330];
const zs = (a) => a.map((v) => (v - mean(a)) / sd(a));
const LZX = zs(LX), LZY = zs(LY);
// a 12-day mix-up of COVARIANCE.P with STDEV.S
const MIX = { r: 0.971, n: 12 };
// Harbourside: footfall and sales over the year
const HFS = C.pearson(column('footfall', { cafe: 'Harbourside' }), column('sales', { cafe: 'Harbourside' }));
// Elmstead Hotel (fictional)
const EH = { cov: 1512, sx: 24, sy: 70 };

export const widgets = {
  'pear-chain': {
    type: 'scatter',
    title: 'Transactions against footfall, both cafés, 1 March – 31 December 2027',
    x: { name: 'Footfall', values: column('footfall'), unit: 'people' },
    y: { name: 'Transactions', values: column('transactions') },
    group: { name: 'Café', values: CAFE }, labels: LABEL,
    show: ['pearson', 'r2'], toggles: ['group', 'line'],
    note: `Pooled, r = ${fx(D.footTrans.r, 3)} and r² = ${fx(D.footTrans.r2, 3)}. Coloured by café, each café’s r is ${fx(C.pearson(column('footfall', { cafe: 'Harbourside' }), column('transactions', { cafe: 'Harbourside' })).r, 3)} (Harbourside) and ${fx(C.pearson(column('footfall', { cafe: 'Millbrook' }), column('transactions', { cafe: 'Millbrook' })).r, 3)} (Millbrook): equally tight, though Millbrook’s covariance is larger because its days vary more.`,
  },
  'pear-scale': {
    type: 'formula',
    title: 'Change the units of temperature: covariance moves, r doesn’t',
    intro: 'Millbrook’s 306 days: the day’s high against the iced share. The temperature used is (high × multiplier + shift) × sign. A multiplier of 0.556 with a shift of −17.8 is roughly °F to °C.',
    inputs: [
      { id: 'mult', label: 'Multiplier', min: 0.1, max: 5, step: 0.001, value: 1, fmt: 'num' },
      { id: 'shift', label: 'Shift added', min: -50, max: 50, step: 0.1, value: 0, fmt: 'num', unit: 'degrees' },
      { id: 'sign', label: 'Sign (−1 flips the scale)', min: -1, max: 1, step: 2, value: 1, fmt: 'int' },
    ],
    compute: (v) => {
      const x = HF.map((f) => (f * v.mult + v.shift) * v.sign);
      const cov = C.covariance(x, IS), sx = sd(x), r = C.pearson(x, IS).r;
      return {
        headline: { label: 'Pearson’s r', value: sg(r, 4) },
        rows: [
          ['Covariance (new units × share)', sg(cov, 4)],
          ['Standard deviation of temperature', fx(sx, 3)],
          ['Standard deviation of iced share', fx(sd(IS), 4)],
          ['Covariance ÷ (s_x × s_y)', sg(cov / (sx * sd(IS)), 4)],
          ['r²', fx(r * r, 4)],
        ],
        note: `The covariance is ${fx(Math.abs(v.mult), 3)} times the original ${fx(C.covariance(HF, IS), 4)}${v.sign < 0 ? ', with its sign flipped' : ''}, and the standard deviation of temperature is ${fx(Math.abs(v.mult), 3)} times the original ${fx(sd(HF), 3)}, so the factor cancels in r. The shift changes neither. ${v.sign < 0 ? 'Flipping the sign of the scale flips the sign of r and leaves its size alone.' : 'Try the sign slider at −1.'}`,
      };
    },
  },
  'pear-sheet': {
    type: 'sheet',
    title: 'Millbrook, 1–12 June 2027: covariance and correlation in Excel',
    sheet: demoSheet, view: 'A1:F13',
    editable: 'B2:C13',
    formats: { F1: '#,##0.00', F2: '#,##0.00', F3: '0.000', F4: '0.000', F5: '0.000', F6: '0.000', F7: '0.0000', F8: '0.0000', F9: '0.0000', F10: '0.0000', F11: '0.0000', F12: '0.0000', F13: '0.0000' },
    widths: { A: 9, E: 30 },
    tools: ['formulas', 'reset'],
    note: `With these 12 days the covariance is ${fx(jCov, 2)} people × transactions and r = ${fx(jR, 4)}. F10, F11 and F13 all equal CORREL; F12, which divides the population covariance by sample standard deviations, is r × 11 ÷ 12 = ${fx(jR * 11 / 12, 4)}. Type 2780 in place of a footfall (an extra digit) and watch r fall.`,
  },
};

export const guided = [
  {
    id: 'b05-pear-g1', type: 'steps', kind: 'numerical',
    prompt: 'Millbrook’s footfall (B2:B13) and transactions (C2:C13) for 1–12 June 2027. Calculate the covariance, then turn it into Pearson’s r.',
    solution: `COVARIANCE.S gives ${fx(jCov, 2)} people × transactions: positive, so busier days had more transactions. Dividing by STDEV.S of each column (${fx(sd(jx), 3)} people and ${fx(sd(jy), 3)} transactions) gives r = ${fx(jR, 4)}, the same as CORREL.`,
    steps: [
      {
        id: 'b05-pear-g1-s1', type: 'formula', kind: 'numerical',
        prompt: 'In F1, calculate the sample covariance of footfall and transactions.',
        sheet: sheetOf(JUNE, 'footfall', 'transactions', 'Footfall', 'Transactions', { E1: 'Covariance', E2: 'r' }),
        cell: 'F1', answer: '=COVARIANCE.S(B2:B13,C2:C13)', alt: ['=COVARIANCE.S(C2:C13,B2:B13)'],
        view: 'A1:F13', formats: { F1: '#,##0.00' }, widths: { A: 9, E: 12 },
        wrong: [
          { formula: '=COVARIANCE.P(B2:B13,C2:C13)', say: 'COVARIANCE.P divides by n, treating these 12 days as the whole population. They are a sample of Millbrook’s trading: use COVARIANCE.S, which divides by n − 1.' },
          { formula: '=CORREL(B2:B13,C2:C13)', say: 'CORREL is r, the covariance already divided by both standard deviations. The covariance itself is COVARIANCE.S.' },
        ],
        hints: ['The sample version divides by n − 1.', '<x>=COVARIANCE.S(B2:B13,C2:C13)</x>'],
        solution: `<x>=COVARIANCE.S(B2:B13,C2:C13)</x> = ${fx(jCov, 2)} people × transactions.`,
      },
      {
        id: 'b05-pear-g1-s2', type: 'formula', kind: 'numerical',
        prompt: 'In F2, calculate r from the covariance in F1 and the two sample standard deviations (not with CORREL).',
        sheet: sheetOf(JUNE, 'footfall', 'transactions', 'Footfall', 'Transactions', { E1: 'Covariance', F1: '=COVARIANCE.S(B2:B13,C2:C13)', E2: 'r' }),
        cell: 'F2', answer: '=F1/(STDEV.S(B2:B13)*STDEV.S(C2:C13))',
        alt: ['=F1/STDEV.S(B2:B13)/STDEV.S(C2:C13)', '=F1/(STDEV.S(C2:C13)*STDEV.S(B2:B13))'],
        require: ['STDEV.S'],
        view: 'A1:F13', formats: { F1: '#,##0.00', F2: '0.0000' }, widths: { A: 9, E: 12 },
        wrong: [
          { formula: '=F1/(STDEV.P(B2:B13)*STDEV.P(C2:C13))', say: 'F1 is a sample covariance (n − 1). Pair it with sample standard deviations, STDEV.S; mixing them gives r × 12 ÷ 11, here above 1, which no r can be.' },
          { formula: '=F1/STDEV.S(B2:B13)*STDEV.S(C2:C13)', say: 'Without brackets Excel divides by the first SD and then multiplies by the second. Put both SDs in brackets: F1/(… * …).' },
          { formula: '=F1/(VAR.S(B2:B13)*VAR.S(C2:C13))', say: 'Divide by the standard deviations, not the variances: the units must cancel.' },
        ],
        hints: ['r = s_xy ÷ (s_x × s_y).', '<x>=F1/(STDEV.S(B2:B13)*STDEV.S(C2:C13))</x>'],
        solution: `<x>=F1/(STDEV.S(B2:B13)*STDEV.S(C2:C13))</x> = ${fx(jR, 4)}, the same as <x>=CORREL(B2:B13,C2:C13)</x>.`,
      },
      {
        id: 'b05-pear-g1-s3', type: 'mc', kind: 'conceptual',
        prompt: 'Ana counts footfall in hundreds of people instead (2.78 instead of 278). What happens to the two results?',
        options: [
          'The covariance is divided by 100; r is unchanged.',
          'Both the covariance and r are divided by 100.',
          'The covariance is unchanged; r is divided by 100.',
          'Neither changes, because the days are the same.',
        ],
        answer: 0,
        hints: ['Dividing footfall by 100 divides every deviation, and its standard deviation, by 100.'],
        feedback: {
          1: 'The 100 also divides the standard deviation of footfall, in r’s denominator, so it cancels in r.',
          2: 'The covariance carries footfall’s units, so it shrinks with them.',
          3: 'The relationship is the same, but the covariance is in people × transactions and changes when people are counted in hundreds.',
        },
        solution: `Every footfall deviation is divided by 100, so the covariance becomes ${fx(jCov / 100, 4)}; the standard deviation of footfall is divided by 100 too, so r = covariance ÷ (s_x s_y) is unchanged at ${fx(jR, 4)}.`,
      },
    ],
  },
  {
    id: 'b05-pear-g2', type: 'num', kind: 'numerical',
    prompt: `Brightwater Ferries (fictional) records each sailing’s passengers and litres of fuel used. Over 20 sailings the covariance is ${BF.cov.toLocaleString('en-US')} passenger-litres, and the standard deviations are ${BF.sx} passengers and ${BF.sy} litres. Calculate Pearson’s r, to three decimal places.`,
    answer: round(BF.cov / (BF.sx * BF.sy), 3), check: () => BF.cov / (BF.sx * BF.sy), unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: round(BF.cov / BF.sx, 3), say: 'Divide by both standard deviations: r = covariance ÷ (s_x × s_y).' },
      { value: round((BF.cov / (BF.sx * BF.sy)) ** 2, 3), say: 'That is r², the square of r. The question asks for r.' },
      { value: round(BF.cov / (BF.sx ** 2 * BF.sy ** 2), 3), say: 'You divided by the variances. r divides by the standard deviations.' },
    ],
    hints: ['r = s_xy ÷ (s_x s_y).', `${BF.cov} ÷ (${BF.sx} × ${BF.sy}) = ${BF.cov} ÷ ${BF.sx * BF.sy}.`],
    solution: `r = ${BF.cov.toLocaleString('en-US')} ÷ (${BF.sx} × ${BF.sy}) = ${BF.cov.toLocaleString('en-US')} ÷ ${(BF.sx * BF.sy).toLocaleString('en-US')} = ${fx(BF.cov / (BF.sx * BF.sy), 3)}. Fuller sailings use more fuel, fairly consistently; r² = ${fx((BF.cov / (BF.sx * BF.sy)) ** 2, 2)}, so a line in passengers accounts for about ${Math.round((BF.cov / (BF.sx * BF.sy)) ** 2 * 100)}% of the variance in fuel.`,
  },
  {
    id: 'b05-pear-g3', type: 'mc', kind: 'conceptual',
    prompt: `For the 612 café-days, footfall and transactions have r = ${fx(D.footTrans.r, 3)} and r² = ${fx(D.footTrans.r2, 3)}. Which sentence is accurate?`,
    options: [
      `A straight line in footfall accounts for about ${Math.round(D.footTrans.r2 * 100)}% of the variance in daily transactions.`,
      `Footfall causes about ${Math.round(D.footTrans.r2 * 100)}% of the transactions recorded at the two cafés.`,
      `A prediction of transactions from footfall will be ${Math.round(D.footTrans.r2 * 100)}% accurate on any given day.`,
      `About ${Math.round(D.footTrans.r2 * 100)}% of the people who come through the door go on to make a transaction at the till.`,
    ],
    answer: 0,
    hints: ['r² is a share of variance, not a share of transactions or of people.'],
    feedback: {
      1: 'r² says nothing about causes, and it is a share of variance, not of the transactions themselves.',
      2: 'r² is not prediction accuracy; the size of typical prediction errors is a regression question (B06).',
      3: 'That would be a conversion rate, transactions ÷ footfall, a different quantity altogether.',
    },
    solution: `r² = ${fx(D.footTrans.r2, 3)} is the share of the variance of transactions (around their mean) that the least-squares line on footfall accounts for. It is symmetric, not causal, and not a measure of prediction accuracy or of conversion.`,
  },
  {
    id: 'b05-pear-g4', type: 'fill', kind: 'conceptual',
    prompt: 'Millbrook’s high temperature and iced share have covariance 3.93 (°F × share) and r = 0.94. Complete the sentences.',
    text: 'Converting the high to °C multiplies the covariance by [[0]] and leaves r [[1]]. Giving the iced share as a percentage multiplies the covariance by [[2]]. Replacing the high with “degrees below 100°F” makes r [[3]].',
    blanks: [
      { options: ['5/9', '9/5', '1, leaving it unchanged'], answer: 0 },
      { options: ['multiplied by 5/9', 'unchanged', 'squared'], answer: 1 },
      { options: ['1', '0.01', '100'], answer: 2 },
      { options: ['−0.94', '0.94', '0.06'], answer: 0 },
    ],
    hints: ['°C = (°F − 32) × 5/9: the shift doesn’t matter, the factor does.', 'Multiplying one variable by a negative number reverses its order.'],
    solution: 'The covariance is multiplied by each factor applied to a variable: 5/9 for °F to °C, 100 for a share to a percentage. r divides by the standard deviations, which carry the same factors, so it is unchanged. “Degrees below 100°F” is 100 − high, a multiplier of −1: r keeps its size and flips its sign to −0.94.',
  },
];

export const independent = [
  {
    id: 'b05-pear-i1', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside’s transactions (B2:B21) and sales (C2:C21), 1–20 August. In F1, calculate r² with one function.',
    sheet: sheetOf(AUG, 'transactions', 'sales', 'Transactions', 'Sales ($)', { E1: 'r²' }),
    cell: 'F1', answer: '=RSQ(C2:C21,B2:B21)', alt: ['=RSQ(B2:B21,C2:C21)', '=CORREL(B2:B21,C2:C21)^2', '=PEARSON(B2:B21,C2:C21)^2'],
    view: 'A1:F21', maxHeight: '20rem', formats: { C: '#,##0.00', F1: '0.0000' }, widths: { A: 9 },
    wrong: [
      { formula: '=CORREL(B2:B21,C2:C21)', say: 'That is r. RSQ, or CORREL squared, gives r².' },
      { formula: '=COVARIANCE.S(B2:B21,C2:C21)', say: 'That is the covariance, in transaction-dollars. r² is unit-free: RSQ.' },
    ],
    solution: `<x>=RSQ(C2:C21,B2:B21)</x> = ${fx(augR2, 4)}: a straight line in transactions accounts for ${fx(augR2 * 100, 1)}% of the variance in Harbourside’s daily sales over these 20 days. RSQ takes the known y’s first, but the result is the same either way round.`,
  },
  {
    id: 'b05-pear-i2', type: 'num', kind: 'numerical',
    prompt: `Ashby Florist (fictional) records the deliveries scheduled and the driver’s overtime hours on five days: (${AX.map((v, i) => `${v}, ${AY[i]}`).join('), (')}). Calculate the sample covariance by hand.`,
    answer: C.covariance(AX, AY), check: () => { const mx = mean(AX), my = mean(AY); return AX.reduce((s, v, i) => s + (v - mx) * (AY[i] - my), 0) / (AX.length - 1); }, unit: 'delivery-hours', places: 2, tol: 0.005,
    wrong: [
      { value: C.covariance(AX, AY, { population: true }), say: 'That divides by n = 5. A sample covariance divides the sum of products by n − 1 = 4.' },
      { value: AX.reduce((s, v, i) => s + (v - mean(AX)) * (AY[i] - mean(AY)), 0), say: 'That is the sum of products. Divide by n − 1 for the covariance.' },
    ],
    solution: `Means: ${mean(AX)} deliveries and ${fx(mean(AY), 1)} hours. Deviations: x ${AX.map((v) => sg(v - mean(AX), 0)).join(', ')}; y ${AY.map((v) => sg(v - mean(AY), 1)).join(', ')}. Products: ${AX.map((v, i) => fx((v - mean(AX)) * (AY[i] - mean(AY)), 1)).join(', ')}, summing to ${fx(AX.reduce((s, v, i) => s + (v - mean(AX)) * (AY[i] - mean(AY)), 0), 1)}. Covariance = ${fx(AX.reduce((s, v, i) => s + (v - mean(AX)) * (AY[i] - mean(AY)), 0), 1)} ÷ 4 = ${fx(C.covariance(AX, AY), 2)} delivery-hours (r = ${fx(C.pearson(AX, AY).r, 3)}).`,
  },
  {
    id: 'b05-pear-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For each change, say what happens to Pearson’s r between the two variables.',
    items: [
      'Sales recorded in thousands of dollars instead of dollars',
      'Temperature converted from °F to °C',
      'Wait recorded in seconds, plus a fixed 30 seconds for the greeting, instead of in minutes',
      'Footfall replaced by “people short of 500”, that is 500 − footfall',
      'Sales replaced by the logarithm of sales',
      'The two variables swapped between the x- and y-axes',
      'Iced share replaced by its square',
    ],
    categories: ['r unchanged', 'r changes sign only', 'r can change size'],
    answer: [0, 0, 0, 1, 2, 0, 2],
    feedback: {
      2: 'Seconds = 60 × minutes + 30: a positive multiplier and a shift, a linear change. r is unchanged.',
      3: 'A multiplier of −1 reverses the order of footfall: r keeps its size and flips its sign.',
      4: 'A logarithm is not linear: it squeezes large values together, so the straight-line fit, and r, can change.',
      6: 'Squaring is not linear, so r can change.',
    },
    solution: 'A linear change a + b × x leaves r unchanged if b is positive and flips its sign if b is negative. Changes of units, shifts and swapping axes are all of that kind. Logs and squares are nonlinear and can change r’s size.',
  },
  {
    id: 'b05-pear-i4', type: 'num', kind: 'numerical',
    prompt: 'Linden Library (fictional) turned its visitors and loans on five days into z-scores. Calculate r as the average product of z-scores (divide by n − 1), to three decimal places.',
    data: { table: { head: ['Day', 'Visitors z', 'Loans z'], rows: LZX.map((z, i) => [String(i + 1), sg(z, 3), sg(LZY[i], 3)]), align: ['l', 'r', 'r'] } },
    answer: round(C.pearson(LX, LY).r, 3), check: () => C.rFromZ(LX, LY), unit: '', places: 3, tol: 0.002,
    wrong: [
      { value: round(LZX.reduce((s, v, i) => s + v * LZY[i], 0) / 5, 3), say: 'Divide by n − 1 = 4, the same n − 1 the z-scores’ standard deviations used.' },
      { value: round(LZX.reduce((s, v, i) => s + v * LZY[i], 0), 3), say: 'That is the sum of products. Divide by n − 1 = 4.' },
    ],
    solution: `Products: ${LZX.map((z, i) => sg(z * LZY[i], 3)).join(', ')}; sum ${fx(LZX.reduce((s, v, i) => s + v * LZY[i], 0), 3)}; ÷ 4 = ${fx(C.rFromZ(LX, LY), 3)}. Busier days had more loans.`,
  },
  {
    id: 'b05-pear-i5', type: 'mc', kind: 'applied',
    prompt: `A colleague calculates r for 12 days as COVARIANCE.P(x, y) ÷ (STDEV.S(x) × STDEV.S(y)) and gets ${fx(MIX.r * (MIX.n - 1) / MIX.n, 3)}. CORREL gives ${fx(MIX.r, 3)}. What explains the gap?`,
    options: [
      `COVARIANCE.P divides by 12 but STDEV.S by 11, so the result is r × 11/12.`,
      'CORREL rounds its result, so the hand calculation is the more precise of the two.',
      'The colleague’s data must contain a blank or a text value that CORREL skips.',
      'Population and sample correlations really are different, and both figures are correct.',
    ],
    answer: 0,
    feedback: {
      1: 'CORREL doesn’t round. The two figures differ by exactly the factor 11/12.',
      2: 'A skipped value would change both calculations alike; the gap is exactly 11/12.',
      3: 'r is the same with n or with n − 1, provided the covariance and the standard deviations use the same one.',
    },
    solution: `${fx(MIX.r, 3)} × 11 ÷ 12 = ${fx(MIX.r * 11 / 12, 3)}. Use COVARIANCE.S with STDEV.S, or COVARIANCE.P with STDEV.P, or simply CORREL.`,
  },
  {
    id: 'b05-pear-i6', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook’s day’s high (B2:B26) and iced drinks made (C2:C26), 1–25 July. In F1, calculate r as the average product of z-scores, using STANDARDIZE and SUMPRODUCT.',
    sheet: sheetOf(JUL, 'high_f', 'iced_drinks', 'High (°F)', 'Iced drinks', { E1: 'r from z-scores' }),
    cell: 'F1', answer: JZ,
    alt: ['=SUMPRODUCT(STANDARDIZE(B2:B26,AVERAGE(B2:B26),STDEV.S(B2:B26))*STANDARDIZE(C2:C26,AVERAGE(C2:C26),STDEV.S(C2:C26)))/(COUNT(B2:B26)-1)', '=SUMPRODUCT(STANDARDIZE(B2:B26,AVERAGE(B2:B26),STDEV.S(B2:B26)),STANDARDIZE(C2:C26,AVERAGE(C2:C26),STDEV.S(C2:C26)))/24'],
    require: ['STANDARDIZE', 'SUMPRODUCT'],
    view: 'A1:F26', maxHeight: '20rem', formats: { F1: '0.0000' }, widths: { A: 9, E: 16 },
    wrong: [
      { formula: '=SUMPRODUCT(STANDARDIZE(B2:B26,AVERAGE(B2:B26),STDEV.S(B2:B26)),STANDARDIZE(C2:C26,AVERAGE(C2:C26),STDEV.S(C2:C26)))/COUNT(B2:B26)', say: 'Divide by n − 1, matching the n − 1 inside STDEV.S. Dividing by n gives r × 24/25.' },
      { formula: '=SUMPRODUCT(STANDARDIZE(B2:B26,AVERAGE(B2:B26),STDEV.P(B2:B26)),STANDARDIZE(C2:C26,AVERAGE(C2:C26),STDEV.P(C2:C26)))/(COUNT(B2:B26)-1)', say: 'With STDEV.P in the z-scores, divide by n, not n − 1; better, use STDEV.S and n − 1 throughout.' },
    ],
    solution: `<x>${JZ}</x> = ${fx(julR, 4)}, the same as <x>=CORREL(B2:B26,C2:C26)</x>. Warmer July days went with more iced drinks.`,
  },
];

export const check = [
  {
    id: 'b05-pear-k1', type: 'mc', kind: 'conceptual',
    prompt: `Over the year, the covariance of footfall and transactions is ${fx(C.covariance(column('footfall', { cafe: 'Millbrook' }), column('transactions', { cafe: 'Millbrook' })), 0)} at Millbrook and ${fx(C.covariance(column('footfall', { cafe: 'Harbourside' }), column('transactions', { cafe: 'Harbourside' })), 0)} at Harbourside. What can you conclude about the strength of the two relationships?`,
    options: [
      'Nothing yet: covariance grows with each variable’s spread; compare the correlations.',
      'Millbrook’s relationship is stronger, because its covariance is larger.',
      'Harbourside’s is stronger, because a smaller covariance means less scatter.',
      'They can’t be compared at all, because the two cafés’ covariances are in different units.',
    ],
    answer: 0,
    feedback: {
      1: 'A larger covariance can come from more spread rather than a tighter link. Both cafés’ r is 0.985.',
      2: 'Covariance doesn’t measure scatter around a line; r does.',
      3: 'Both are in people × transactions; the problem is that covariance mixes strength with spread.',
    },
    solution: 'Covariance mixes the tightness of the relationship with the spread of each variable. Dividing by the standard deviations removes the spread: both cafés have r = 0.985, equally tight. Millbrook’s covariance is larger because its days vary more.',
  },
  {
    id: 'b05-pear-k2', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside’s transactions (B2:B16) and sales (C2:C16), 1–15 October. In F1, calculate the sample covariance.',
    sheet: sheetOf(OCT, 'transactions', 'sales', 'Transactions', 'Sales ($)', { E1: 'Covariance' }),
    cell: 'F1', answer: '=COVARIANCE.S(B2:B16,C2:C16)', alt: ['=COVARIANCE.S(C2:C16,B2:B16)'],
    view: 'A1:F16', maxHeight: '20rem', formats: { C: '#,##0.00', F1: '#,##0.00' }, widths: { A: 9 },
    wrong: [
      { formula: '=COVARIANCE.P(B2:B16,C2:C16)', say: 'COVARIANCE.P divides by n; a sample covariance divides by n − 1: COVARIANCE.S.' },
      { formula: '=CORREL(B2:B16,C2:C16)', say: 'That is r, which has no units. The covariance is in transaction-dollars: COVARIANCE.S.' },
    ],
    solution: `<x>=COVARIANCE.S(B2:B16,C2:C16)</x> = ${fx(octCov, 2)} transaction-dollars. Positive: days with more transactions took more money. Its size means little until it is divided by the two standard deviations.`,
  },
  {
    id: 'b05-pear-k3', type: 'num', kind: 'numerical',
    prompt: `At Harbourside, the covariance of the day’s high (°F) and hot drinks made is ${sg(hCovHot)} (°F × drinks). What is it with the high in °C? Give two decimal places.`,
    answer: round(hCovHot * 5 / 9, 2), check: () => hCovHot * 5 / 9, unit: '°C × drinks', places: 2, tol: 0.01,
    wrong: [
      { value: round(hCovHot * 9 / 5, 2), say: 'Converting °F to °C multiplies temperatures, and their deviations, by 5/9, not 9/5.' },
      { value: round((hCovHot - 32) * 5 / 9, 2), say: 'Subtracting 32 shifts every temperature equally and leaves the deviations alone. Only the factor 5/9 affects the covariance.' },
      { value: hCovHot, say: 'r is unchanged by a change of units, but the covariance isn’t: it carries the units of temperature.' },
    ],
    solution: `°C = (°F − 32) × 5/9. The shift doesn’t change deviations; the factor multiplies them, so the covariance becomes ${sg(hCovHot)} × 5/9 = ${sg(hCovHot * 5 / 9)} (°C × drinks). r stays at ${sg(C.pearson(column('high_f', { cafe: 'Harbourside' }), column('hot_drinks', { cafe: 'Harbourside' })).r, 2)}.`,
  },
  {
    id: 'b05-pear-k4', type: 'mc', kind: 'applied',
    prompt: `At Harbourside, footfall and sales have r = ${fx(HFS.r, 3)}. The manager asks how much of the day-to-day variance in sales a straight line in footfall leaves unaccounted for. What should Ana answer?`,
    options: [
      `About ${Math.round((1 - HFS.r2) * 100)}%: that is 1 − r², what the line leaves over.`,
      `About ${Math.round((1 - HFS.r) * 100)}%: that is 1 − r, the distance of r from a perfect 1.`,
      `About ${Math.round(HFS.r2 * 100)}%: that is r², the share the line leaves over.`,
      'None of it: with r this close to 1, the line accounts for all the variance.',
    ],
    answer: 0,
    feedback: {
      1: 'r is not a share of variance; r² is. The share left over is 1 − r².',
      2: 'r² is the share a line accounts for, not the share it leaves over.',
      3: 'Only r = ±1 accounts for all the variance; r² here is a little below 1.',
    },
    solution: `r² = ${fx(HFS.r2, 3)} (r = ${fx(HFS.r, 3)}, squared), so a line in footfall accounts for about ${Math.round(HFS.r2 * 100)}% of the variance in daily sales and leaves 1 − r² = ${fx(1 - HFS.r2, 3)}, about ${Math.round((1 - HFS.r2) * 100)}%, unaccounted for: days with more or less sales than footfall alone would suggest.`,
  },
  {
    id: 'b05-pear-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about Pearson’s r that are true.',
    options: [
      'r = +1 only when every point lies exactly on a rising straight line.',
      'r has no units, so it can be compared across pairs measured in different units.',
      'r = 0 means the two variables are unrelated.',
      'r is the average product of the two variables’ z-scores, dividing by n − 1.',
      'Swapping the x and y variables changes r.',
      'r² = 0.49 means a line accounts for 70% of the variance.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'r = 0 means no straight-line association; a U-shape can be a perfect relationship with r = 0.',
      4: 'r is symmetric: r(x, y) = r(y, x).',
      5: 'r² = 0.49 is itself the share: 49%. 0.70 is r.',
    },
    solution: 'r is unit-free, between −1 and 1, ±1 only on a perfect line, symmetric, and equal to Σ z_x z_y ÷ (n − 1). It measures straight-line association only, and r², not r, is the share of variance.',
  },
  {
    id: 'b05-pear-k6', type: 'num', kind: 'applied',
    prompt: `Elmstead Hotel (fictional) compares the rooms occupied each night with the breakfasts served next morning. Over a season the covariance is ${EH.cov.toLocaleString('en-US')}, with standard deviations of ${EH.sx} rooms and ${EH.sy} breakfasts. The manager asks what share of the night-to-night variance in breakfasts a straight line in occupied rooms accounts for. Give a percentage.`,
    answer: round((EH.cov / (EH.sx * EH.sy)) ** 2 * 100, 1), check: () => (EH.cov / (EH.sx * EH.sy)) ** 2 * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: round(EH.cov / (EH.sx * EH.sy) * 100, 1), say: 'That is r as a percentage. The share of variance is r².' },
    ],
    solution: `r = ${EH.cov.toLocaleString('en-US')} ÷ (${EH.sx} × ${EH.sy}) = ${fx(EH.cov / (EH.sx * EH.sy), 2)}, so r² = ${fx((EH.cov / (EH.sx * EH.sy)) ** 2, 2)}: about ${Math.round((EH.cov / (EH.sx * EH.sy)) ** 2 * 100)}% of the variance. The other ${100 - Math.round((EH.cov / (EH.sx * EH.sy)) ** 2 * 100)}% is variation a straight line in occupancy leaves unaccounted for.`,
  },
];
