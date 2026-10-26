// groups-and-simpsons-paradox.ex.js — B05 · Groups and Simpson’s paradox: widgets, practice and the knowledge check
// (answer keys live here). Café data from case.js (corrected log); Tidewater Books, Brookline Fitness, Halden Foods
// and the regional figures are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num
// items recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_COLUMNS } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean } from '../../../core/stats.js?v=20';

const at = (name) => CAFE_COLUMNS.indexOf(name);
const fx = (v, d = 3) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const ticket = (r) => Math.round(r[at('sales')] / r[at('transactions')] * 100) / 100;

// A worksheet of both cafés over the same days: Harbourside's rows first, then Millbrook's.
function slice(from, to) {
  const rows = ['Harbourside', 'Millbrook'].flatMap((c) => CLEAN_ROWS.filter((r) => r[at('cafe')] === c && r[at('date')] >= from && r[at('date')] <= to));
  const cafe = rows.map((r) => r[at('cafe')]), foot = rows.map((r) => r[at('footfall')]), tick = rows.map(ticket);
  const last = rows.length + 1, half = rows.length / 2;
  const within = (c) => C.pearson(foot.filter((_, i) => cafe[i] === c), tick.filter((_, i) => cafe[i] === c)).r;
  return {
    rows, cafe, foot, tick, last, half,
    pooled: C.pearson(foot, tick).r, h: within('Harbourside'), m: within('Millbrook'),
    cells: { A1: 'Day', B1: 'Café', C1: 'Footfall', D1: 'Avg ticket ($)', ...col('A', 2, rows.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, cafe), ...col('C', 2, foot), ...col('D', 2, tick) },
  };
}
const MAY = slice('2027-05-03', '2027-05-16');
const NOV = slice('2027-11-01', '2027-11-12');
const MAR = slice('2027-03-22', '2027-04-02');

// the demo sheet: Millbrook's tickets carry a shift in G8, so students can close the gap between the cafés
const shiftCells = Object.fromEntries(MAY.rows.map((r, i) => [`D${i + 2}`, MAY.cafe[i] === 'Millbrook' ? `=${MAY.tick[i]}+$G$8` : MAY.tick[i]]));
const shifted = (s) => C.pearson(MAY.foot, MAY.tick.map((t, i) => (MAY.cafe[i] === 'Millbrook' ? t + s : t))).r;
const L = MAY.last;
const maySheet = {
  cells: {
    ...MAY.cells, ...shiftCells,
    F1: 'r, pooled', G1: `=CORREL(C2:C${L},D2:D${L})`,
    F2: 'r, Harbourside', G2: `=CORREL(FILTER(C2:C${L},B2:B${L}="Harbourside"),FILTER(D2:D${L},B2:B${L}="Harbourside"))`,
    F3: 'r, Millbrook', G3: `=CORREL(FILTER(C2:C${L},B2:B${L}="Millbrook"),FILTER(D2:D${L},B2:B${L}="Millbrook"))`,
    G4: 'Footfall', H4: 'Ticket',
    F5: 'Harbourside means', G5: `=AVERAGEIF(B2:B${L},"Harbourside",C2:C${L})`, H5: `=AVERAGEIF(B2:B${L},"Harbourside",D2:D${L})`,
    F6: 'Millbrook means', G6: `=AVERAGEIF(B2:B${L},"Millbrook",C2:C${L})`, H6: `=AVERAGEIF(B2:B${L},"Millbrook",D2:D${L})`,
    F8: 'Add to Millbrook tickets ($)', G8: 0,
  },
};

// the whole log, for the widgets
const F = column('footfall'), A = column('avg_ticket'), CAFE = column('cafe'), DATE = column('date');
const MEANS = [];
for (const g of ['Harbourside', 'Millbrook']) for (let m = 3; m <= 12; m++) {
  const ix = F.map((_, i) => i).filter((i) => CAFE[i] === g && Number(DATE[i].slice(5, 7)) === m);
  MEANS.push({ cafe: g, label: `${MONTHS[m - 1]} (${g})`, f: mean(ix.map((i) => F[i])), a: mean(ix.map((i) => A[i])) });
}

// fictional two-group summaries for the num items
const G3 = { n1: 50, x1: 300, y1: 12, n2: 50, x2: 100, y2: 25 };
const between = (g) => { const N = g.n1 + g.n2, xb = (g.n1 * g.x1 + g.n2 * g.x2) / N, yb = (g.n1 * g.y1 + g.n2 * g.y2) / N; return g.n1 * (g.x1 - xb) * (g.y1 - yb) + g.n2 * (g.x2 - xb) * (g.y2 - yb); };
const K2 = { n1: 120, x1: 80, y1: 30, n2: 80, x2: 30, y2: 45 };

export const widgets = {
  'simp-scatter': {
    type: 'scatter',
    title: 'Footfall and average ticket, 612 café-days',
    x: { name: 'Footfall', values: F, unit: 'people' },
    y: { name: 'Average ticket', values: A, unit: '$' },
    group: { name: 'Café', values: CAFE },
    labels: DATE.map((d, i) => `${dayLabel(d)} (${CAFE[i]})`),
    show: ['pearson', 'spearman', 'ci'],
    toggles: ['group', 'line', 'ranks'],
    note: 'Pooled: r = −0.324 and ρ = −0.199. By café: r = 0.735 at Harbourside and 0.517 at Millbrook. Every Millbrook day has a smaller average ticket than every Harbourside day, and Millbrook is busier: the pooled line runs from one cloud to the other.',
  },
  'simp-monthly': {
    type: 'scatter',
    title: 'Each café’s monthly averages: footfall and average ticket (20 café-months)',
    x: { name: 'Mean daily footfall', values: MEANS.map((p) => p.f) },
    y: { name: 'Mean average ticket', values: MEANS.map((p) => p.a), unit: '$' },
    group: { name: 'Café', values: MEANS.map((p) => p.cafe) },
    labels: MEANS.map((p) => p.label),
    show: ['pearson', 'spearman'],
    toggles: ['group', 'line'],
    note: 'An ecological correlation: r = −0.797 across the 20 averages, against −0.324 across the 612 days behind them. Within each café the months rise together (0.950 and 0.744). Averaging removes the day-to-day noise, so every relationship looks tighter than it is for days.',
  },
  'simp-sheet': {
    type: 'sheet',
    title: 'Both cafés, 3–16 May 2027 (Harbourside in rows 2–15, Millbrook in rows 16–29)',
    sheet: maySheet,
    view: `A1:H${L}`,
    editable: 'G8',
    formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000', G3: '0.000', G5: '0.0', G6: '0.0', H5: '$#,##0.00', H6: '$#,##0.00' },
    widths: { F: 26, D: 13 },
    tools: ['formulas', 'reset'],
    note: `As recorded, the pooled r is ${fx(MAY.pooled)} while each café’s is positive (${fx(MAY.h)} and ${fx(MAY.m)}). Type 2 in G8: Millbrook’s mean ticket moves up to Harbourside’s, the between-café part of the covariance nearly vanishes, and the pooled r becomes ${fx(shifted(2))}. The cafés’ own correlations don’t move at all, because adding a constant to one café’s tickets changes none of its deviations from its own mean.`,
  },
};

export const guided = [
  {
    id: 'b05-simp-g1', type: 'steps', kind: 'numerical',
    prompt: `Both cafés, 1–12 November 2027: B holds the café, C the footfall and D the average ticket (rows 2–13 Harbourside, 14–25 Millbrook). Compare the pooled correlation with each café’s own.`,
    solution: `Pooled, r = ${fx(NOV.pooled)}; within Harbourside r = ${fx(NOV.h)} and within Millbrook r = ${fx(NOV.m)}. Millbrook’s mean footfall (${mean(NOV.foot.slice(NOV.half)).toFixed(1)}) is far above Harbourside’s (${mean(NOV.foot.slice(0, NOV.half)).toFixed(1)}) and its mean ticket ($${mean(NOV.tick.slice(NOV.half)).toFixed(2)}) far below ($${mean(NOV.tick.slice(0, NOV.half)).toFixed(2)}), so the difference between the cafés reverses the relationship found inside each.`,
    steps: [
      {
        id: 'b05-simp-g1-s1', type: 'formula',
        prompt: 'In G1, calculate Pearson’s r between footfall and average ticket for all 24 rows.',
        sheet: { cells: { ...NOV.cells, F1: 'r, pooled', F2: 'r, Harbourside', F3: 'Mean footfall, Harbourside', F4: 'Mean footfall, Millbrook' } },
        cell: 'G1', answer: '=CORREL(C2:C25,D2:D25)',
        alt: ['=CORREL(D2:D25,C2:C25)', '=PEARSON(C2:C25,D2:D25)'],
        view: 'A1:G25',
        formats: { D: '$#,##0.00', G1: '0.000' }, widths: { D: 13, F: 25 },
        wrong: [{ formula: '=RSQ(C2:C25,D2:D25)', say: 'RSQ is r², which hides the sign, and the sign is the point here. Use CORREL.' }],
        hints: ['<x>=CORREL(C2:C25,D2:D25)</x>'],
      },
      {
        id: 'b05-simp-g1-s2', type: 'formula',
        prompt: 'In G2, calculate r for Harbourside’s rows only, using FILTER on column B.',
        sheet: { cells: { ...NOV.cells, F1: 'r, pooled', G1: '=CORREL(C2:C25,D2:D25)', F2: 'r, Harbourside', F3: 'Mean footfall, Harbourside', F4: 'Mean footfall, Millbrook' } },
        cell: 'G2', answer: '=CORREL(FILTER(C2:C25,B2:B25="Harbourside"),FILTER(D2:D25,B2:B25="Harbourside"))',
        alt: ['=CORREL(C2:C13,D2:D13)', '=PEARSON(FILTER(C2:C25,B2:B25="Harbourside"),FILTER(D2:D25,B2:B25="Harbourside"))', '=CORREL(FILTER(C2:C25,B2:B25<>"Millbrook"),FILTER(D2:D25,B2:B25<>"Millbrook"))'],
        view: 'A1:G25',
        formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000' }, widths: { D: 13, F: 25 },
        wrong: [
          { formula: '=CORREL(FILTER(C2:C25,B2:B25="Millbrook"),FILTER(D2:D25,B2:B25="Millbrook"))', say: 'That is Millbrook’s r. Filter on “Harbourside”.' },
          { formula: '=CORREL(C2:C25,D2:D25)', say: 'That is the pooled r again. Keep only Harbourside’s rows.' },
        ],
        hints: ['<x>FILTER(C2:C25,B2:B25="Harbourside")</x> keeps Harbourside’s footfall.', 'Filter both columns the same way inside CORREL.'],
      },
      {
        id: 'b05-simp-g1-s3', type: 'formula',
        prompt: 'In G3, calculate Harbourside’s mean footfall with AVERAGEIF; then fill G4 with Millbrook’s (the page fills G4 for you if your formula works for any café name typed in F3:F4’s labels; just enter G3).',
        sheet: { cells: { ...NOV.cells, F1: 'r, pooled', G1: '=CORREL(C2:C25,D2:D25)', F2: 'r, Harbourside', G2: '=CORREL(FILTER(C2:C25,B2:B25="Harbourside"),FILTER(D2:D25,B2:B25="Harbourside"))', F3: 'Mean footfall, Harbourside', F4: 'Mean footfall, Millbrook', G4: '=AVERAGEIF(B2:B25,"Millbrook",C2:C25)' } },
        cell: 'G3', answer: '=AVERAGEIF(B2:B25,"Harbourside",C2:C25)',
        alt: ['=AVERAGE(C2:C13)', '=AVERAGEIFS(C2:C25,B2:B25,"Harbourside")', '=AVERAGE(FILTER(C2:C25,B2:B25="Harbourside"))'],
        view: 'A1:G25',
        formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000', G3: '0.0', G4: '0.0' }, widths: { D: 13, F: 25 },
        wrong: [
          { formula: '=AVERAGEIF(B2:B25,"Harbourside",D2:D25)', say: 'That averages the tickets. The question asks for footfall, column C.' },
          { formula: '=AVERAGE(C2:C25)', say: 'That is the mean of both cafés. Average only Harbourside’s rows.' },
        ],
        hints: ['AVERAGEIF(range, criterion, average_range).', '<x>=AVERAGEIF(B2:B25,"Harbourside",C2:C25)</x>'],
      },
      {
        id: 'b05-simp-g1-s4', type: 'mc',
        prompt: 'Pooled r is negative, Harbourside’s r is positive (and Millbrook’s is too), and Millbrook’s mean footfall is far higher. What explains the negative pooled r?',
        options: [
          'Millbrook is busier and has smaller tickets, so the gap between the cafés outweighs the positive link inside each.',
          'Twelve days per café are too few for a correlation, so the pooled figure, from 24 days, is the more reliable one.',
          'The two cafés’ tickets are measured differently, so pooling them mixes two incompatible measures.',
          'Busy days at Millbrook lower the ticket at Harbourside, because customers move between the cafés.',
        ],
        answer: 0,
        hints: ['Compare where each café’s cloud of points sits, not only how each cloud slopes.'],
        feedback: {
          1: 'More days don’t help when the extra days come from a group with different means; the pooled r answers a different question.',
          2: 'Both are sales ÷ transactions; the measure is the same.',
          3: 'Nothing in the data links one café’s days to the other’s; the cafés simply differ in both variables.',
        },
      },
    ],
  },
  {
    id: 'b05-simp-g2', type: 'num', kind: 'numerical',
    prompt: 'Two fictional shops each have 50 days of data. Shop 1 averages 300 visitors a day and a $12 basket; shop 2 averages 100 visitors and a $25 basket. Calculate the between-group part of the sum of products, Σ n_g (x̄_g − x̄)(ȳ_g − ȳ), for visitors and basket.',
    answer: between(G3), check: () => { const xb = 200, yb = 18.5; return 50 * (300 - xb) * (12 - yb) + 50 * (100 - xb) * (25 - yb); }, unit: '', places: 0, tol: 1,
    wrong: [
      { value: -650, say: 'You left out n_g: each shop’s product of deviations counts once for each of its 50 days.' },
      { value: -32500, say: 'That is one shop’s term. Add both shops’ terms: they have the same sign.' },
    ],
    hints: ['Overall means: (300 + 100) ÷ 2 = 200 visitors and (12 + 25) ÷ 2 = $18.50, since the shops have equal numbers of days.', 'Shop 1: 50 × (300 − 200) × (12 − 18.5); shop 2: 50 × (100 − 200) × (25 − 18.5).'],
    solution: 'x̄ = 200, ȳ = 18.5. Shop 1: 50 × 100 × (−6.5) = −32,500; shop 2: 50 × (−100) × 6.5 = −32,500. Between-group part = −65,000. Both shops sit on the “busier, smaller basket” diagonal, so their terms add, and unless the within-shop products outweigh −65,000 the pooled correlation will be negative.',
  },
  {
    id: 'b05-simp-g3', type: 'classify', kind: 'conceptual',
    prompt: 'For each question, choose the correlation that answers it, using Lantern’s café log.',
    items: [
      'At Millbrook, do busier mornings go with larger average tickets?',
      'Across Lantern’s cafés, do cafés with more visitors have smaller tickets?',
      'Inside a café, in general, do busier days go with larger tickets (one figure for both cafés)?',
      'Across every café-day in the log, ignoring which café, what goes with what?',
    ],
    categories: ['Millbrook’s own r', 'The cafés’ means (with only two cafés, a comparison, not a correlation)', 'The pooled within-café r', 'The pooled r, reported beside the others'],
    answer: [0, 1, 2, 3],
    fixed: true,
    hints: ['Is the question about days inside a café, about cafés, or about the log as a whole?'],
    feedback: {
      1: 'A question about cafés is answered with cafés’ figures; with two cafés that is a comparison of two means.',
      2: 'The within-café r removes each café’s own means, so the difference between the cafés plays no part.',
      3: 'The pooled r mixes the within and between parts, so report it only beside them.',
    },
    solution: 'Questions about days inside one café use that café’s r; a single answer for days inside any café uses the pooled within-café r (0.618); questions about cafés use the cafés’ means; and the pooled r (−0.324) describes the mixed log and needs the others beside it.',
  },
];

export const independent = [
  {
    id: 'b05-simp-i1', type: 'formula', kind: 'numerical',
    prompt: 'Both cafés, 1–12 November: in G2, calculate Millbrook’s own correlation between footfall and average ticket (rows 14–25), using FILTER on column B.',
    sheet: { cells: { ...NOV.cells, F1: 'r, pooled', G1: '=CORREL(C2:C25,D2:D25)', F2: 'r, Millbrook' } },
    cell: 'G2', answer: '=CORREL(FILTER(C2:C25,B2:B25="Millbrook"),FILTER(D2:D25,B2:B25="Millbrook"))',
    alt: ['=CORREL(C14:C25,D14:D25)', '=PEARSON(FILTER(C2:C25,B2:B25="Millbrook"),FILTER(D2:D25,B2:B25="Millbrook"))', '=CORREL(FILTER(D2:D25,B2:B25="Millbrook"),FILTER(C2:C25,B2:B25="Millbrook"))'],
    view: 'A1:G25',
    formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000' }, widths: { D: 13, F: 16 },
    wrong: [
      { formula: '=CORREL(FILTER(C2:C25,B2:B25="Harbourside"),FILTER(D2:D25,B2:B25="Harbourside"))', say: 'That is Harbourside’s r. Filter on “Millbrook”.' },
      { formula: '=CORREL(C2:C25,D2:D25)', say: 'That is the pooled r in G1. Keep only Millbrook’s rows.' },
    ],
    solution: `<x>=CORREL(FILTER(C2:C25,B2:B25="Millbrook"),FILTER(D2:D25,B2:B25="Millbrook"))</x> = ${fx(NOV.m)}, positive, while the pooled r in G1 is ${fx(NOV.pooled)}. Filtering by the café name keeps working if rows are added or sorted, which a fixed range such as C14:C25 would not.`,
  },
  {
    id: 'b05-simp-i2', type: 'mc', kind: 'applied',
    prompt: 'A fictional retailer’s data show that, across its 30 regions, regions where a larger share of customers use the app have a higher average spend per customer (r = 0.71). The marketing team proposes moving every customer to the app “because app users spend more”. What is the main flaw?',
    options: [
      'The correlation is between regional averages; it doesn’t show that app users themselves spend more than other customers in the same region.',
      'Thirty regions are too few for a correlation of 0.71 to be statistically significant at the 5% level.',
      'The correlation should have been calculated with Spearman’s ρ, because spend per customer is skewed.',
      'A correlation of 0.71 means that only half of the variation in spend can be explained by app use.',
    ],
    answer: 0,
    feedback: {
      1: 'With 30 regions, r = 0.71 is well beyond the 5% critical value; significance isn’t the problem.',
      2: 'Averages of spend are much less skewed than individual spend, and ρ would still be ecological.',
      3: 'r² ≈ 0.5 is true, but the deeper flaw is the move from regions to individuals.',
    },
    solution: 'This is an ecological correlation. Wealthier or more urban regions might have both more app users and higher spend, while inside each region app users spend no more, or even less. Checking needs customer-level data within regions; changing customer behaviour on regional averages commits the ecological fallacy.',
  },
  {
    id: 'b05-simp-i3', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about grouped data that are true.',
    options: [
      'Pooling groups can reverse the sign of a correlation found inside every group.',
      'Pooling groups can create a correlation where there is none inside any group.',
      'If the groups have the same mean of x, the pooled sum of products has no between-group part.',
      'The pooled correlation always lies between the smallest and the largest within-group correlation.',
      'A correlation of group averages is usually weaker than the correlation of the individuals.',
      'Simpson’s paradox applies to proportions but not to correlations between numeric variables.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Lantern’s pooled r (−0.324) lies outside the cafés’ range (0.517 to 0.735); so does Millbrook’s weekday-plus-weekend r (0.517 from 0.247 and 0.128).',
      4: 'Usually stronger, because averaging removes the variation inside groups (−0.797 for café-months against −0.324 for days).',
      5: 'It applies to any measure of association, including correlations.',
    },
    solution: 'True: pooling can reverse or create a correlation, and if the group means of x (or of y) are equal, every between-group term n_g(x̄_g − x̄)(ȳ_g − ȳ) is zero. False: the pooled r can fall outside the within-group range; ecological correlations are usually stronger, not weaker; and the paradox applies to correlations too.',
  },
  {
    id: 'b05-simp-i4', type: 'mc', kind: 'conceptual',
    prompt: 'At Millbrook, footfall and the average ticket have r = 0.247 on weekdays and 0.128 at weekends, but 0.517 across all of Millbrook’s days. Weekdays average 272 visitors and a $3.35 ticket; weekends 110 visitors and $3.05. Why is the combined r larger than either?',
    options: [
      'Weekdays are both busier and have larger tickets, so the gap between them adds a positive between-group part.',
      'Combining doubles the number of days, and a larger sample always produces a larger correlation coefficient.',
      'The weekend correlation is too small to count, so the combined figure reflects the weekday correlation only.',
      'Weekend days are outliers in footfall, and outliers in both variables always raise a correlation coefficient.',
    ],
    answer: 0,
    feedback: {
      1: 'Sample size changes how precisely r is estimated, not its size.',
      2: 'The combined r (0.517) is larger than the weekday r (0.247), so it can’t simply reflect weekdays.',
      3: 'Weekends are a group of 86 ordinary days, not a few outliers; the effect comes from where the two groups’ means sit.',
    },
    solution: 'The between-group part n_g(x̄_g − x̄)(ȳ_g − ȳ) is positive for both groups: weekdays sit above the mean on both variables, weekends below on both. It adds to the within-group parts, so the combined correlation is stronger than either. (Each group also covers a narrower range of footfall, which shrinks its own r.)',
  },
  {
    id: 'b05-simp-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym chain has two clubs. Inside the clubs, the within-group sums of products of class size and member rating add up to +1,200, the within-group sums of squares are 9,000 for class size and 640 for rating. Calculate the pooled within-group correlation. Give three decimal places.',
    answer: 0.5, check: () => 1200 / Math.sqrt(9000 * 640), unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: 0.208, say: 'You divided by √9,000 × 640 without square-rooting both. r_W = 1,200 ÷ √(9,000 × 640).' },
      { value: 0.25, say: 'Divide by the square root of the product of the two sums of squares: √(9,000 × 640) = 2,400.' },
    ],
    solution: 'r_W = 1,200 ÷ √(9,000 × 640) = 1,200 ÷ √5,760,000 = 1,200 ÷ 2,400 = 0.500. It measures how class size and rating move together inside a club, whatever the difference between the clubs.',
  },
];

export const check = [
  {
    id: 'b05-simp-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Footfall and average ticket have r = 0.735 at Harbourside and 0.517 at Millbrook, but −0.324 for both cafés pooled. Which condition is needed for such a reversal?',
    options: [
      'The cafés differ in both mean footfall and mean ticket, in the direction opposite to the link inside them.',
      'One café has many more days of data than the other, so its relationship dominates the pooled figure.',
      'The relationship inside each café is weak, so that a few unusual days can change the pooled sign.',
      'Footfall and ticket are measured on different scales, so their pooled correlation has no meaning.',
    ],
    answer: 0,
    feedback: {
      1: 'Both cafés have 306 days; unequal sizes are not needed for a reversal.',
      2: 'Harbourside’s 0.735 is not weak; the reversal comes from the groups’ means, not from a few days.',
      3: 'Correlation doesn’t depend on units; pooling different scales isn’t the issue.',
    },
    solution: 'The between-group part n_g(x̄_g − x̄)(ȳ_g − ȳ) is negative for both cafés because the busier café has the smaller ticket, and it outweighs the positive within-café part (−27,529.9 against +8,845.3).',
  },
  {
    id: 'b05-simp-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional chain has two stores. Store 1: 120 days, mean 80 deliveries and mean delivery time 30 minutes. Store 2: 80 days, mean 30 deliveries and mean delivery time 45 minutes. Calculate the between-group part of the sum of products of deliveries and delivery time, Σ n_g (x̄_g − x̄)(ȳ_g − ȳ).',
    answer: between(K2), check: () => { const xb = (120 * 80 + 80 * 30) / 200, yb = (120 * 30 + 80 * 45) / 200; return 120 * (80 - xb) * (30 - yb) + 80 * (30 - xb) * (45 - yb); }, unit: '', places: 0, tol: 1,
    wrong: [
      { value: -18750, say: 'You used the simple average of the store means (55 and 37.5). With unequal days, the overall means weight each store by its days: 60 and 36.' },
      { value: -360, say: 'Multiply each store’s product of deviations by its number of days.' },
    ],
    solution: 'Overall means, weighted by days: x̄ = (120 × 80 + 80 × 30) ÷ 200 = 60; ȳ = (120 × 30 + 80 × 45) ÷ 200 = 36. Store 1: 120 × 20 × (−6) = −14,400; store 2: 80 × (−30) × 9 = −21,600. Between-group part = −36,000: the busier store is faster, so pooling pushes the correlation of deliveries and delivery time negative, whatever happens inside each store.',
  },
  {
    id: 'b05-simp-k3', type: 'formula', kind: 'applied',
    prompt: 'Both cafés, 22 March – 2 April 2027 (rows 2–13 Harbourside, 14–25 Millbrook): G1 gives the pooled r. In G2, calculate Harbourside’s own correlation between footfall and average ticket.',
    sheet: { cells: { ...MAR.cells, F1: 'r, pooled', G1: '=CORREL(C2:C25,D2:D25)', F2: 'r, Harbourside' } },
    cell: 'G2', answer: '=CORREL(FILTER(C2:C25,B2:B25="Harbourside"),FILTER(D2:D25,B2:B25="Harbourside"))',
    alt: ['=CORREL(C2:C13,D2:D13)', '=PEARSON(FILTER(C2:C25,B2:B25="Harbourside"),FILTER(D2:D25,B2:B25="Harbourside"))', '=CORREL(FILTER(D2:D25,B2:B25="Harbourside"),FILTER(C2:C25,B2:B25="Harbourside"))'],
    view: 'A1:G25',
    formats: { D: '$#,##0.00', G1: '0.000', G2: '0.000' }, widths: { D: 13, F: 16 },
    wrong: [
      { formula: '=CORREL(FILTER(C2:C25,B2:B25="Millbrook"),FILTER(D2:D25,B2:B25="Millbrook"))', say: 'That is Millbrook’s r. Filter on “Harbourside”.' },
      { formula: '=CORREL(C2:C25,D2:D25)', say: 'That is the pooled r in G1. Keep only Harbourside’s rows.' },
    ],
    solution: `Harbourside’s own r is ${fx(MAR.h)} (Millbrook’s is ${fx(MAR.m)}), while the pooled r is ${fx(MAR.pooled)}. In these twelve days, as in the whole year, busier days go with larger tickets inside each café, and the gap between the cafés turns the pooled figure negative.`,
  },
  {
    id: 'b05-simp-k4', type: 'mc', kind: 'applied',
    prompt: 'Halden Foods (fictional) runs 40 stores. Across stores, larger stores have lower profit margins (r = −0.6). Inside every store, weeks with more customers have higher margins. The finance director wants to cap customer numbers in busy weeks “to protect margins”. What should the analyst say?',
    options: [
      'The store-level figure compares stores; inside each store busy weeks have higher margins, so capping would cut margins.',
      'The director is right, because the store-level figure uses all 40 stores and is therefore the more reliable result.',
      'Both figures are valid, so the chain should cap customers at large stores and encourage them at small stores.',
      'Neither figure can be used, because Simpson’s paradox shows that correlations in grouped data are meaningless.',
    ],
    answer: 0,
    feedback: {
      1: 'More data at the wrong level answers the wrong question; the decision is about weeks inside a store.',
      2: 'The store-level figure says nothing about what busier weeks do inside a large store.',
      3: 'Each figure answers a different question; the paradox tells you which question each one answers.',
    },
    solution: 'The decision is about weeks inside stores, and there busier weeks go with higher margins. The −0.6 across stores reflects differences between stores (size, location, product mix), and reading it as a statement about weeks would be the ecological fallacy.',
  },
  {
    id: 'b05-simp-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each finding as a statement about individuals or about groups (an ecological correlation).',
    items: [
      'Across 20 café-months, months with higher average footfall have lower average tickets.',
      'Across Harbourside’s 306 days, busier days have larger tickets.',
      'Across 30 regions, regions with more app users have higher average spend.',
      'Across 2,000 customers, those who use the app spend more per order.',
    ],
    categories: ['Individuals (days or customers)', 'Groups (an ecological correlation)'],
    answer: [1, 0, 1, 0],
    feedback: {
      0: 'Each point is a café’s monthly average, a group of about 30 days.',
      2: 'Each point is a region’s average or share: a group.',
    },
    solution: 'Correlations between averages, shares or rates of groups (café-months, regions) are ecological and describe groups. Correlations across days or customers describe individuals. Only the latter answer questions about individual days or customers.',
  },
  {
    id: 'b05-simp-k6', type: 'mc', kind: 'applied',
    prompt: 'An analyst finds that, across all of a chain’s branches, staff overtime and customer complaints are negatively correlated. Before reporting it, what is the most useful next step?',
    options: [
      'Plot the data coloured by branch and compute the correlation within each branch as well as pooled.',
      'Test the pooled correlation for significance, and report it if the p-value is below 0.05.',
      'Switch to Spearman’s ρ, which removes the influence of differences between branches.',
      'Average overtime and complaints by branch and correlate the averages, which is less noisy.',
    ],
    answer: 0,
    feedback: {
      1: 'Significance doesn’t tell you whether the pooled figure reflects branches or the relationship inside them.',
      2: 'Ranks don’t remove group differences; a pooled ρ can reverse just as r does.',
      3: 'That gives an ecological correlation, which answers a question about branches and can be even more dominated by them.',
    },
    solution: 'Branches may differ in both overtime and complaints (busy city branches, quiet rural ones), so the pooled correlation may be about branches. Colour by branch and compute within-branch correlations; then report both with the branch means.',
  },
];
