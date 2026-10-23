// descriptive-statistics-and-regression.ex.js — B03 · Descriptive statistics and regression in Excel: widgets,
// practice and the knowledge check (answer keys live here). Lantern's orders and catering events come from case.js;
// any other business is fictional. Formula items are marked by their results (core/sheet.js gradeFormula), num items
// recompute their answers in `check`. The regression widgets offer guests as the only X: hours, pastries and baristas
// belong to the project's multiple regression.
import { ORDERS, ORDER_COLUMNS, EVENTS, EVENT_COLUMNS, DERIVED as D, tableCells } from './case.js';

const TOT = ORDERS.map((r) => r[ORDER_COLUMNS.indexOf('order_total')]);
const ev = (name, rows) => rows.map((r) => r[EVENT_COLUMNS.indexOf(name)]);
const ONE = EVENTS.filter((r) => r[EVENT_COLUMNS.indexOf('days')] === 1);
const ofType = (t) => EVENTS.filter((r) => r[EVENT_COLUMNS.indexOf('event_type')] === t);
const sheetOf = (rows, cols, extra = {}) => ({ cells: { ...tableCells(EVENT_COLUMNS, rows, { cols }).cells, ...extra } });
const RS = D.regression.simple;

// small helpers for the num items' checks
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;

// sheets
const statLabels = [['Count', '=COUNT(B2:B232)'], ['Mean', '=AVERAGE(B2:B232)'], ['Median', '=MEDIAN(B2:B232)'], ['Mode', '=MODE.SNGL(B2:B232)'],
  ['SD (sample)', '=STDEV.S(B2:B232)'], ['SD (population)', '=STDEV.P(B2:B232)'], ['First quartile', '=QUARTILE.INC(B2:B232,1)'],
  ['Third quartile', '=QUARTILE.INC(B2:B232,3)'], ['90th percentile', '=PERCENTILE.INC(B2:B232,0.9)'], ['Minimum', '=MIN(B2:B232)'],
  ['Maximum', '=MAX(B2:B232)'], ['Sum', '=SUM(B2:B232)']];
const statSheet = {
  cells: {
    ...tableCells(ORDER_COLUMNS, ORDERS, { cols: ['order_id', 'order_total'] }).cells,
    D1: 'Statistic', E1: 'Value', G1: 'Bin up to', H1: 'Orders',
    ...Object.fromEntries(statLabels.flatMap(([l, f], i) => [[`D${i + 2}`, l], [`E${i + 2}`, f]])),
    G2: 20, G3: 40, G4: 60, G5: 80, G6: 100, G7: 'above 100', H2: '=FREQUENCY(B2:B232,G2:G6)',
  },
};
const launch = sheetOf(ofType('Launch'), ['event_id', 'guests', 'invoice']);
const meetingsInv = sheetOf(ofType('Meeting'), ['event_id', 'invoice'], { D1: 'Over', E1: 'Up to', F1: 'Events', D2: 0, D3: 400, D4: 600, D5: 800, E2: 400, E3: 600, E4: 800, E5: 1000 });
const meetings = sheetOf(ofType('Meeting'), ['event_id', 'guests', 'invoice'], { E1: 'Result' });
const teamDay = sheetOf(ofType('Team day'), ['event_id', 'guests', 'invoice'], { E1: 'IQR' });
const teamBins = sheetOf(ofType('Team day'), ['event_id', 'guests', 'invoice'], { E1: 'Bin up to', F1: 'Events', E2: 700, E3: 900, E4: 1100, E5: 'above 1100' });
const oneDay = sheetOf(ONE, ['event_id', 'guests', 'invoice'], { E1: 'Guests', E2: 120, F1: 'Predicted invoice' });

export const widgets = {
  'ds-orders': {
    type: 'distribution',
    values: TOT,
    label: 'Order total, spring 2026 ($)',
    transforms: ['none', 'log'],
    rules: ['iqr', 'mad'],
  },
  'ds-sheet': {
    type: 'sheet',
    title: 'Lantern’s 231 spring order totals with live statistics and a FREQUENCY table',
    sheet: statSheet,
    view: 'A1:H232',
    maxHeight: '24rem',
    formats: { B: '$#,##0.00', E: '$#,##0.00', E2: 'general', G: '$#,##0' },
    widths: { D: 16, G: 11 },
    tools: ['formulas', 'reset'],
    note: 'Row 145 holds LC-10144, the $1,512.00 office order. Change it to 151.2 (as if it had been 12 bags) and compare: the mean, the standard deviations and the maximum move a long way; the median, the quartiles, the mode and most of the FREQUENCY counts hardly move. H2 holds one FREQUENCY formula that spills into H2:H7, one count per bin and one for orders above $100.',
  },
  'ds-reg': {
    type: 'regression',
    title: 'Regression of invoice on guests: Lantern’s 75 one-day catering events, 2026',
    y: { name: 'invoice', values: ev('invoice', ONE) },
    xs: [{ name: 'guests', values: ev('guests', ONE) }],
    picked: [0],
    format: { y: 'money' },
    note: 'Input Y Range: invoice; Input X Range: guests; Labels ticked. Compare R Square with the square of CORREL, the guests coefficient with SLOPE, the Intercept with INTERCEPT, and the Standard Error with the typical vertical distance of the points from the line. The two-day conference is not included.',
  },
  'ds-reg-all': {
    type: 'regression',
    title: 'The same regression with the two-day conference included: all 76 events',
    y: { name: 'invoice', values: ev('invoice', EVENTS) },
    xs: [{ name: 'guests', values: ev('guests', EVENTS) }],
    picked: [0],
    format: { y: 'money' },
    note: 'One event, Meridian Partners’ two-day conference (263 guests, $4,200), raises the slope from about $6.67 to about $10.15 a guest, turns the intercept negative, lowers R Square from 0.874 to 0.746 and almost triples the Standard Error. The conference is priced day by day and lies beyond the largest one-day event, so the one-day line describes the one-day business better.',
  },
};

export const guided = [
  {
    id: 'b03-cc-dummy', type: 'mc', kind: 'conceptual', prompt: 'placeholder', options: ['a', 'b', 'c'], answer: 0, hints: ['x'], solution: 'x',
  },
];
