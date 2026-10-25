// analysing-survey-data.ex.js — M04 · Analysing survey data: widgets, practice and the knowledge check (answer keys live
// here). Lantern's 516 completes come from case.js (RESPONDENT_COLUMNS / RESPONDENT_ROWS through tableCells, all 516 rows
// in every worksheet). Text columns don't change on the marker's test copies, so items that count text labels `vary` a
// label cell; numeric columns (scores, cups, weights) are scaled on the copies. Otterbridge Leisure Centre, Kettlewick
// Bakery and the cinema chain are fictional. Every num item's `check` recomputes its answer.
import { RESPONDENTS, RESPONDENT_COLUMNS, RESPONDENT_ROWS, SEGMENT, SIZES, LEVELS, tableCells, DERIVED as D } from './case.js?v=13';
import * as S from '../../../core/survey.js?v=13';
import { normInv, normCdf } from '../../../core/inference.js?v=13';

const R = RESPONDENTS, N = R.length, L = N + 1;                 // data rows 2..517
const RC = (cols) => tableCells(RESPONDENT_COLUMNS, RESPONDENT_ROWS, { cols }).cells;
const W = D.weights.perStratum;
const byS = SEGMENT.map((_, h) => R.filter((r) => r.stratum === h));
const nS = byS.map((g) => g.length);
const top2 = (g) => g.filter((r) => r.coldbrew <= 2).length;
const CB = D.coldbrew.crosstab;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const row = (from, r, values) => Object.fromEntries(values.map((v, j) => [`${String.fromCharCode(from.charCodeAt(0) + j)}${r}`, v]));
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const sg = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`;
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const wts = R.map((r) => W[r.stratum]);

// ---------------------------------------------------------------- widgets
const demoCells = {
  ...RC(RESPONDENT_COLUMNS), I1: 'weight', ...col('I', 2, wts),
  K1: 'segment', L1: 'on the list', M1: 'completes', N1: 'weight', O1: 'NPS', P1: 'top-two share',
  ...col('K', 2, SEGMENT), ...col('L', 2, SIZES), K6: 'all completes', L6: '=SUM(L2:L5)',
  K8: 'weighted NPS', K9: 'weighted top-two share', K10: 'median cups', K11: 'mean cups',
};
const npsPoints = [-100, 0, 100];
const records = R.map((r) => ({
  Segment: SEGMENT[r.stratum], 'Cold Brew intent': LEVELS.coldbrew[r.coldbrew - 1], 'NPS group': LEVELS.group[r.group],
  Age: LEVELS.age[r.age], 'First heard': LEVELS.heard[r.heard], Improve: LEVELS.theme[r.theme],
  Respondents: 1, Weight: W[r.stratum], 'NPS points': npsPoints[r.group], 'Top two': r.coldbrew <= 2 ? 1 : 0, 'Cups last week': r.cups,
}));
function npsExplore(v) {
  const n = v.P + v.Pa + v.D;
  if (n < 1) return { error: 'Enter at least one answer.' };
  const z = normInv(1 - (1 - v.conf / 100) / 2);
  const c = S.nps({ promoters: v.P, passives: v.Pa, detractors: v.D }, v.conf / 100);
  const a = c.adjusted;                                          // Rocks's (2016) AW(3,T), from survey.js
  const pc = (x) => `${(x * 100).toFixed(1)}%`;
  const small = n < 30;
  return {
    headline: { label: `Net Promoter Score, ${v.conf}% margin`, value: `${sg(c.score)} ± ${c.margin.toFixed(1)}` },
    rows: [
      ['Base (n)', String(n)],
      ['Promoters / passives / detractors', `${pc(v.P / n)} / ${pc(v.Pa / n)} / ${pc(v.D / n)}`],
      ['Standard error', `${c.se.toFixed(2)} points (z = ${z.toFixed(3)})`],
      ['Interval (simple Wald)', `${sg(c.low)} to ${sg(c.high)}`],
      ['Interval (Rocks’s adjusted Wald)', `${sg(a.low)} to ${sg(a.high)}`],
    ],
    note: small
      ? `A base of ${n} is below 30: under a minimum-base rule such as NCHS’s, report the counts, not a score.`
      : `The interval is about ${(2 * c.margin).toFixed(0)} points wide. Scores that differ by less than about ${(Math.SQRT2 * c.margin).toFixed(0)} points, between two groups of this size, can’t be told apart.`,
    chart: { kind: 'bar', x: { label: 'Group', values: ['Detractors', 'Passives', 'Promoters'] }, series: [{ name: 'Share of base (%)', values: [v.D, v.Pa, v.P].map((k) => Math.round((k / n) * 1000) / 10) }], y: { label: '% of base', format: 'pct' } },
  };
}

export const widgets = {
  'as-sheet': {
    type: 'sheet', title: 'Lantern’s February 2027 survey: all 516 completes, with weights',
    sheet: { cells: demoCells },
    view: `A1:P${L}`, editable: true, mark: ['M2:P5', 'L8:L11'], maxHeight: '26rem',
    formats: { I: '0.00', N: '0.00', O: '0.0', P: '0.0%', L8: '0.0', L9: '0.0%', L10: '0.0', L11: '0.00' },
    widths: { B: 17, D: 20, E: 11, F: 20, G: 9, H: 22, K: 22, L: 11, M: 11 },
    tools: ['formulas', 'fill', 'reset'],
    note: 'Columns: A respondent, B segment, C the 0–10 recommendation score, D the Cold Brew answer, E age, F first heard, G cups last week, H improvement theme, I weight (list size ÷ completes for the segment). Try <x>=COUNTIF($B$2:$B$517,K2)</x> in M2, <x>=L2/M2</x> in N2, an NPS by segment in O2 and <x>=100*(SUMPRODUCT(I2:I517*(C2:C517>=9))-SUMPRODUCT(I2:I517*(C2:C517<=6)))/SUM(I2:I517)</x> in L8, which should show 20.4.',
  },
  'as-pivot': {
    type: 'pivot', title: 'Lantern’s February 2027 survey: 516 completes',
    records,
    fields: ['Segment', 'Cold Brew intent', 'NPS group', 'Age', 'First heard', 'Improve'],
    values: ['Respondents', 'Weight', 'NPS points', 'Top two', 'Cups last week'],
    defaults: { rows: 'Segment', cols: 'Cold Brew intent', value: 'Respondents', agg: 'sum', show: 'pct-row' },
    order: { Segment: SEGMENT, 'Cold Brew intent': LEVELS.coldbrew, 'NPS group': LEVELS.group, Age: LEVELS.age, 'First heard': LEVELS.heard, Improve: LEVELS.theme },
    formats: { Weight: '#,##0.0', 'NPS points': '0.0', 'Cups last week': '0.00' },
    note: 'Respondents is 1 for each complete, so its Sum counts them. Weight is each respondent’s list size ÷ completes, so its Sum counts people on the list (6,000 in all) and its percentages are weighted. NPS points is +100 for a promoter, 0 for a passive and −100 for a detractor, so its Average is the NPS (27.5 for all completes). Top two is 1 for the top two boxes, so its Average is the top-two-box share.',
  },
  'as-nps': {
    type: 'formula', title: 'The Net Promoter Score and its margin of error',
    intro: 'Set the counts of promoters (9–10), passives (7–8) and detractors (0–6).',
    inputs: [
      { id: 'P', label: 'Promoters', min: 0, max: 600, step: 1, value: 237, fmt: 'int' },
      { id: 'Pa', label: 'Passives', min: 0, max: 600, step: 1, value: 184, fmt: 'int' },
      { id: 'D', label: 'Detractors', min: 0, max: 600, step: 1, value: 95, fmt: 'int' },
      { id: 'conf', label: 'Confidence level', min: 80, max: 99, step: 1, value: 95, fmt: 'pct' },
    ],
    compute: npsExplore,
  },
};

// ---------------------------------------------------------------- guided practice
const freqBase = { ...RC(['respondent', 'segment', 'cold_brew']), E1: 'answer', F1: 'respondents', G1: '% of base', ...col('E', 2, LEVELS.coldbrew), E7: 'total (base)' };
const freqCounts = col('F', 2, CB.colTotals);
const xtBase = { ...RC(['respondent', 'segment', 'cold_brew']), E1: 'segment', ...row('F', 1, LEVELS.coldbrew), ...col('E', 2, SEGMENT) };
const xtCounts = Object.assign({}, ...CB.counts.map((rw, i) => row('F', i + 2, rw)));
const xtStep2 = {
  ...xtBase, ...xtCounts, K1: 'base', ...col('K', 2, [2, 3, 4, 5].map((r) => `=SUM(F${r}:J${r})`)),
  E6: 'total', ...row('F', 6, ['F', 'G', 'H', 'I', 'J'].map((c) => `=SUM(${c}2:${c}5)`)), K6: '=SUM(K2:K5)',
  E8: 'row %', ...row('F', 8, LEVELS.coldbrew), ...col('E', 9, SEGMENT),
};
const npsSheet = { ...RC(['respondent', 'segment', 'nps']), E1: 'segment', F1: 'NPS', ...col('E', 2, SEGMENT) };
const NPSS = D.nps.byStratum, WS = NPSS[2];

export const guided = [
  {
    id: 'm04-as-g1', type: 'steps', kind: 'numerical',
    prompt: 'Build the frequency table for Q2, “How likely would you be to buy Lantern Cold Brew in the next three months?”, from all 516 completes. Column C holds each respondent’s answer.',
    solution: `<x>=COUNTIF($C$2:$C$517,E2)</x> filled down gives ${CB.colTotals.join(', ')}, which add to 516. <x>=F2/$F$7</x> filled down gives ${CB.colTotals.map((c) => `${(c / N * 100).toFixed(1)}%`).join(', ')}. The table’s note: “Base: all completes (516), unweighted.”`,
    steps: [
      {
        id: 'm04-as-g1-s1', type: 'formula',
        prompt: 'In F2, count the respondents whose answer is the one in E2, in a formula that can be filled down to F6.',
        sheet: { cells: freqBase, vary: { E2: ['Might or might not', 'Probably would not'] } },
        cell: 'F2', fill: 'F2:F6', answer: `=COUNTIF($C$2:$C$${L},E2)`,
        alt: [`=COUNTIFS($C$2:$C$${L},E2)`, '=COUNTIF($C:$C,E2)', `=SUMPRODUCT(--($C$2:$C$${L}=E2))`],
        view: `A1:G${L}`, widths: { B: 17, C: 20, E: 20, F: 12 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIF(C2:C${L},E2)`, say: 'Without $ the range slides down as you fill, so F3 starts at row 3 and lower rows miss the first answers. Fix it: $C$2:$C$517.' },
          { formula: `=COUNTIF($C$2:$C$${L},"Definitely would buy")`, say: 'With the answer typed in, every row counts “Definitely would buy”. Refer to the label in column E so the filled formula picks up each answer.' },
          { formula: `=COUNTA($C$2:$C$${L})`, say: 'That counts every answer, 516 in each row: the base, not the frequency. Add the criterion: COUNTIF(range, E2).' },
        ],
        hints: ['COUNTIF(range, criterion) counts the cells in the range that match the criterion.', 'Test column C against E2, with the range made absolute so it doesn’t move: <x>=COUNTIF($C$2:$C$517,E2)</x>.'],
      },
      {
        id: 'm04-as-g1-s2', type: 'formula',
        prompt: 'The counts are now in F2:F6 and their total, the base, in F7. In G2, show the count in F2 as a share of the base in F7, in a formula that can be filled down to G6.',
        sheet: { cells: { ...freqBase, ...freqCounts, F7: '=SUM(F2:F6)' } },
        cell: 'G2', fill: 'G2:G6', answer: '=F2/$F$7',
        alt: ['=F2/SUM($F$2:$F$6)', '=F2/F$7'],
        view: `A1:G${L}`, formats: { G: '0.0%' }, widths: { B: 17, C: 20, E: 20, F: 12 }, maxHeight: '22rem',
        wrong: [
          { formula: '=F2/F7', say: 'Without $ the base slides down as you fill: G3 divides by F8, an empty cell, and shows #DIV/0!. Lock it: $F$7.' },
          { formula: '=F2/516', say: 'Point at the base in F7 rather than typing 516, so the percentages stay right when the counts change.' },
          { formula: `=F2/${L}`, say: '517 is the last row of the data, not the number of respondents: row 1 holds the headings. Divide by the base in F7.' },
          { formula: '=F2/$F$7*100', say: 'The cells are formatted as percentages, so Excel multiplies by 100 for you: leave out ×100.' },
          { formula: `=F2/COUNTA($C$2:$C$${L})`, say: 'That recounts the base from the raw data; use the base already in F7 ($F$7), so the percentages divide by the same total the table shows.' },
        ],
        hints: ['A percentage of the base is the count divided by the base.', 'Lock the base so it doesn’t move: <x>=F2/$F$7</x>, formatted as a percentage.'],
      },
      {
        id: 'm04-as-g1-s3', type: 'mc',
        prompt: 'Which note belongs under the finished table?',
        options: ['Base: all 516 completes (partials excluded), unweighted', 'Base: the 2,004 people invited to the survey in February', 'Base: the 572 completes and partials, all who answered', 'None: shares that add up to 100% need no base'],
        answer: 0,
        feedback: {
          1: 'Most of the 1,488 who didn’t complete never answered Q2, and Ana’s rule leaves out the partials who did, so they can’t be in the base of these percentages.',
          2: 'Ana’s rule analyses completes only, so the 56 partials aren’t in the base.',
          3: 'Shares always add to about 100% whatever the base; the reader still needs to know 100% of whom, and of how many.',
        },
        hints: ['The base is the number of people the percentages are calculated on.', 'Which people answered Q2 and are in Ana’s analysis?'],
      },
    ],
  },
  {
    id: 'm04-as-g2', type: 'steps', kind: 'applied',
    prompt: 'Cross Cold Brew intent (column C) with segment (column B) to see which segments are keenest.',
    solution: `Counts: <x>=COUNTIFS($B$2:$B$517,$E2,$C$2:$C$517,F$1)</x> filled to J5. Row percentages: <x>=F2/$K2</x> in F9, filled to J12, so each segment’s row adds to 100%. Subscribers said “definitely” ${(CB.rowPct[0][0] * 100).toFixed(1)}% of the time, newsletter-only respondents ${(CB.rowPct[3][0] * 100).toFixed(1)}%: the row view answers “which segment is keener?”.`,
    steps: [
      {
        id: 'm04-as-g2-s1', type: 'formula',
        prompt: 'In F2, count the respondents in the segment in E2 who gave the answer in F1, in one formula that can be filled across to J2 and down to J5.',
        sheet: { cells: xtBase, vary: { E2: ['Newsletter only', 'Shop customer'], F1: ['Might or might not', 'Probably would not'] } },
        cell: 'F2', fill: 'F2:J5', answer: `=COUNTIFS($B$2:$B$${L},$E2,$C$2:$C$${L},F$1)`,
        alt: [`=COUNTIFS($C$2:$C$${L},F$1,$B$2:$B$${L},$E2)`, '=COUNTIFS($B:$B,$E2,$C:$C,F$1)'],
        view: `A1:J${L}`, widths: { B: 17, C: 20, E: 20, F: 11, G: 11, H: 11, I: 11, J: 11 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIFS(B2:B${L},E2,C2:C${L},F1)`, say: 'Without dollar signs the data ranges slide and the labels drift away from column E and row 1 as you fill. Fix the data ranges, the segment’s column ($E2) and the answer’s row (F$1).' },
          { formula: `=COUNTIFS($B$2:$B$${L},$E$2,$C$2:$C$${L},F$1)`, say: '$E$2 fixes the row as well, so every row counts subscribers. Fix only the column: $E2.' },
          { formula: `=COUNTIF($C$2:$C$${L},F$1)`, say: 'That counts the answer in every segment at once, so all four rows are the same. Add the segment criterion with COUNTIFS.' },
          { formula: `=COUNTIFS($B$2:$B$${L},E$2,$C$2:$C$${L},$F1)`, say: 'The locks are the wrong way round: E$2 stays on row 2 as you fill down and $F1 stays in column F as you fill across. The segments run down column E ($E2), the answers along row 1 (F$1).' },
        ],
        hints: ['Two criteria: the segment from column E and the answer from row 1.', 'Mixed references: <x>$E2</x> keeps column E when filled across; <x>F$1</x> keeps row 1 when filled down.'],
      },
      {
        id: 'm04-as-g2-s2', type: 'formula',
        prompt: 'The counts are in F2:J5, each segment’s base in K2:K5 and each answer’s total in F6:J6. In F9, show the count in F2 as a percentage of its segment’s base, in a formula that can be filled across to J9 and down to J12, so that each row adds to 100%.',
        sheet: { cells: xtStep2 },
        cell: 'F9', fill: 'F9:J12', answer: '=F2/$K2',
        alt: ['=F2/SUM($F2:$J2)'],
        view: `A1:K${L}`, formats: { F9: '0.0%', G9: '0.0%', H9: '0.0%', I9: '0.0%', J9: '0.0%', F10: '0.0%', G10: '0.0%', H10: '0.0%', I10: '0.0%', J10: '0.0%', F11: '0.0%', G11: '0.0%', H11: '0.0%', I11: '0.0%', J11: '0.0%', F12: '0.0%', G12: '0.0%', H12: '0.0%', I12: '0.0%', J12: '0.0%' },
        widths: { B: 17, C: 20, E: 20, F: 11, G: 11, H: 11, I: 11, J: 11 }, maxHeight: '22rem',
        wrong: [
          { formula: '=F2/F$6', say: 'That divides by the answer’s total, a column percentage: the share of all “definitely” answers that came from this segment. To compare segments, divide by each segment’s base in column K.' },
          { formula: '=F2/$K$2', say: '$K$2 fixes the row too, so every segment is divided by the subscribers’ base. Fix only the column: $K2.' },
          { formula: '=F2/$K$6', say: 'That divides by all 516 completes, a share of the grand total. Each segment’s row should add to 100%: divide by its own base, $K2.' },
          { formula: '=F2/K2', say: 'Without $ the base slides across as you fill: G9 divides by L2, which is empty. Fix the column: $K2.' },
          { formula: '=F2/$K2*100', say: 'The cells are formatted as percentages, so Excel multiplies by 100 for you: leave out ×100.' },
          { formula: `=F2/COUNTIF($B$2:$B$${L},$E2)`, say: 'That recounts the base from the raw data; use the base already in K2 ($K2), so each percentage divides by its own row’s total.' },
        ],
        hints: ['A row percentage divides each cell by its row’s total, the segment’s base.', 'The bases are in column K: lock the column but not the row, <x>=F2/$K2</x>.'],
      },
      {
        id: 'm04-as-g2-s3', type: 'mc',
        prompt: 'Ana asks: “Are subscribers more likely than newsletter-only people to say they’d definitely buy?” Which figures answer her question?',
        options: ['F9 and F12: each segment’s “definitely” share of its own base', 'F2 and F5: the counts of “definitely” answers in the two segments', 'Each segment’s share of the 81 people who said “definitely”', 'Each “definitely” count as a share of all 516 completes'],
        answer: 0,
        feedback: {
          1: 'Counts depend on how big each segment is: there are three times as many newsletter-only respondents. Compare rates, not counts.',
          2: 'That is the column view: it says where the definite buyers are, partly because of segment size, not how likely each segment is to buy.',
          3: 'Shares of the grand total mix each segment’s size with its keenness.',
        },
        hints: ['“More likely” is a rate within each segment.', 'Which percentages have each segment’s base underneath them?'],
      },
    ],
  },
  {
    id: 'm04-as-g3', type: 'formula', kind: 'applied',
    prompt: 'Column B holds each respondent’s segment and column C the 0–10 recommendation score. In F2, calculate the NPS of the segment in E2, as a number from −100 to +100, in a formula that can be filled down to F5.',
    sheet: { cells: npsSheet, fixed: [`C2:C${L}`], vary: { E2: ['Newsletter only', 'Workshop participant'] } },
    cell: 'F2', fill: 'F2:F5',
    answer: `=100*(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">=9")-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<=6"))/COUNTIF($B$2:$B$${L},E2)`,
    alt: [
      `=100*(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">8")-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<7"))/COUNTIF($B$2:$B$${L},E2)`,
      `=(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">=9")/COUNTIF($B$2:$B$${L},E2)-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<=6")/COUNTIF($B$2:$B$${L},E2))*100`,
    ],
    view: `A1:F${L}`, formats: { F: '0.0' }, widths: { B: 17, E: 20 }, maxHeight: '22rem',
    wrong: [
      { formula: `=100*(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">9")-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<=6"))/COUNTIF($B$2:$B$${L},E2)`, say: '“>9” counts only the 10s. Promoters score 9 or 10: use ">=9".' },
      { formula: `=100*(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">=9")-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<6"))/COUNTIF($B$2:$B$${L},E2)`, say: '“<6” leaves out the 6s, but detractors score 0 to 6: use "<=6".' },
      { formula: `=(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">=9")-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<=6"))/COUNTIF($B$2:$B$${L},E2)`, say: 'That is the difference as a proportion (0.62 for subscribers). The NPS is written from −100 to +100: multiply by 100.' },
      { formula: `=100*(COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">=9")-COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},"<=6"))/COUNT($C$2:$C$${L})`, say: 'Dividing by all 516 scores gives each segment’s promoters minus detractors as a share of everyone. Each segment’s NPS uses its own base: COUNTIF of the segment.' },
      { formula: `=100*COUNTIFS($B$2:$B$${L},E2,$C$2:$C$${L},">=9")/COUNTIF($B$2:$B$${L},E2)`, say: 'That is the promoters’ share alone. Subtract the detractors’ share.' },
    ],
    hints: ['NPS = 100 × (promoters − detractors) ÷ the segment’s respondents, with promoters 9–10 and detractors 0–6.', 'Two COUNTIFS on segment and score (">=9" and "<=6"), divided by <x>COUNTIF($B$2:$B$517,E2)</x>, all times 100.'],
    solution: `<x>=100*(COUNTIFS($B$2:$B$517,E2,$C$2:$C$517,">=9")-COUNTIFS($B$2:$B$517,E2,$C$2:$C$517,"<=6"))/COUNTIF($B$2:$B$517,E2)</x> gives ${NPSS.map((x) => sg(x.score)).join(', ')} for subscribers, shop customers, workshop participants and newsletter-only respondents. On whole-number scores ">8" and "<7" give the same counts.`,
  },
  {
    id: 'm04-as-g4', type: 'steps', kind: 'numerical',
    prompt: `Ana’s ${WS.n} workshop participants gave ${WS.promoters} promoters, ${WS.passives} passives and ${WS.detractors} detractors, an NPS of ${sg(WS.score)}. How precise is that figure, and should it appear in her report?`,
    solution: `p_P = 16 ÷ 27 ≈ 0.593 and p_D = 5 ÷ 27 ≈ 0.185. SE = 100 × √((0.593 + 0.185 − 0.407²) ÷ 27) ≈ ${WS.se.toFixed(2)} points, and the 95% margin is 1.96 × ${WS.se.toFixed(2)} ≈ ${WS.margin.toFixed(1)} points, so the interval runs from about ${sg(WS.low)} to ${sg(WS.high)}. A base of 27 is below the minimum of 30, so the figure gets no place of its own in the report.`,
    steps: [
      {
        id: 'm04-as-g4-s1', type: 'num',
        prompt: 'Calculate the standard error of the workshop participants’ NPS, in points. Give two decimal places.',
        answer: r2(WS.se), check: () => 100 * Math.sqrt((16 / 27 + 5 / 27 - (16 / 27 - 5 / 27) ** 2) / 27), unit: 'points', places: 2, tol: 0.02,
        wrong: [
          { value: r2(100 * Math.sqrt((16 / 27) * (11 / 27) / 27)), say: 'That is the standard error of the promoters’ share alone. The NPS is a difference of two shares: use p_P + p_D − (p_P − p_D)².' },
          { value: r2(100 * Math.sqrt((21 / 27) / 27)), say: 'You left out the squared term: the variance is p_P + p_D − (p_P − p_D)², not p_P + p_D.' },
          { value: r2(100 * Math.sqrt((16 / 27 + 5 / 27 - (11 / 27) ** 2) / 516)), say: 'That divides by all 516 completes. The workshop score rests on its own 27 answers.' },
        ],
        hints: ['SE = 100 × √((p_P + p_D − (p_P − p_D)²) ÷ n).', 'p_P = 16 ÷ 27, p_D = 5 ÷ 27 and n = 27.'],
      },
      {
        id: 'm04-as-g4-s2', type: 'num',
        prompt: 'Calculate the 95% margin of error, in points. Give one decimal place.',
        answer: r1(WS.margin), check: () => normInv(0.975) * WS.se, unit: 'points', places: 1, tol: 0.15,
        wrong: [
          { value: r1(WS.se), say: 'That is the standard error. The margin is z* × SE, with z* = 1.96 for 95%.' },
          { value: r1(1.645 * WS.se), say: '1.645 is the critical value for 90%. For 95% use 1.96.' },
        ],
        hints: ['Margin = z* × SE.', 'z* = 1.96 for 95%.'],
      },
      {
        id: 'm04-as-g4-s3', type: 'mc',
        prompt: 'Ana’s minimum base is 30. What should her report do with the workshop participants’ NPS?',
        options: ['Give it no figure of its own, since 27 is below the minimum base', 'Report it and say workshop participants are less keen than subscribers', 'Report it rounded to +41, to avoid suggesting false precision', 'Weight the 27 answers up to 150 so the base is large enough'],
        answer: 0,
        feedback: {
          1: 'The interval runs from about +11 to +70 and overlaps the subscribers’ widely; the data can’t support the comparison.',
          2: 'Rounding doesn’t make 27 answers more informative: the margin is still about ±30 points.',
          3: 'Weights change how much each answer counts, not how many answers there are. The information still comes from 27 people.',
        },
        hints: ['Compare the base with the minimum.', 'The workshop participants still count in all-respondent figures.'],
      },
    ],
  },
];

// ---------------------------------------------------------------- on your own
const wTable = {
  A1: 'segment', B1: 'on the list (N)', C1: 'completes (n)', D1: 'top two boxes', E1: 'weight (N ÷ n)',
  ...col('A', 2, SEGMENT), ...col('B', 2, SIZES), ...col('C', 2, nS), ...col('D', 2, byS.map(top2)),
  ...col('E', 2, [2, 3, 4, 5].map((r) => `=B${r}/C${r}`)), A7: 'weighted top-two share',
};
const cupsSheet = { ...RC(['respondent', 'segment', 'cups_last_week']), E1: 'at least this many cups', F1: 1, E2: 'median cups', E3: 'mean cups', F3: `=AVERAGEIFS(C2:C${L},C2:C${L},">="&F1)` };
const cupsBy = byS.map((g) => g.map((r) => r.cups));
// Otterbridge Leisure Centre (fictional): spring and autumn waves of a members' survey
const OTA = S.nps({ promoters: 189, passives: 162, detractors: 99 }), OTB = S.nps({ promoters: 197, passives: 139, detractors: 84 });
const OTz = (OTB.score - OTA.score) / Math.hypot(OTA.se, OTB.se);

export const independent = [
  {
    id: 'm04-as-i1', type: 'formula', kind: 'applied',
    prompt: 'The table gives, for each segment, its size on the mailing list, its completes, how many chose the top two boxes for Cold Brew, and its weight. In B7, use SUMPRODUCT to calculate the top-two-box share for the whole list, weighted to the segment sizes.',
    sheet: { cells: wTable }, cell: 'B7',
    answer: '=SUMPRODUCT(E2:E5,D2:D5)/SUMPRODUCT(E2:E5,C2:C5)',
    alt: ['=SUMPRODUCT(B2:B5,D2:D5/C2:C5)/SUM(B2:B5)', '=SUMPRODUCT(E2:E5,D2:D5)/SUM(B2:B5)', '=SUMPRODUCT(B2:B5*D2:D5/C2:C5)/SUM(B2:B5)'],
    require: ['SUMPRODUCT'],
    view: 'A1:E7', formats: { B: '#,##0', E: '0.00', B7: '0.0%' }, widths: { A: 22, B: 15, C: 14, D: 14, E: 15 },
    wrong: [
      { formula: '=SUM(D2:D5)/SUM(C2:C5)', say: 'That is the unweighted share of completes, 42.2%. Subscribers replied out of proportion, so weight each segment’s answers by its weight.' },
      { formula: '=AVERAGE(D2:D5/C2:C5)', say: 'That averages the four segments’ shares as if each held a quarter of the list. The newsletter-only segment holds 72% of it: weight by size.' },
      { formula: '=SUMPRODUCT(E2:E5,D2:D5)/SUM(E2:E5)', say: 'The numerator is right (weighted top-two answers, in people on the list), but the sum of the four weights isn’t a number of people. Divide by the weighted number of completes, SUMPRODUCT(E2:E5,C2:C5), which equals the list size.' },
    ],
    solution: `<x>=SUMPRODUCT(E2:E5,D2:D5)/SUMPRODUCT(E2:E5,C2:C5)</x> ≈ ${(D.coldbrew.topTwoWeighted * 100).toFixed(1)}%. Each weight times the segment’s top-two count is the number of people on the list that count stands for; the denominator, the weights times the completes, is the list’s 6,000. Equivalently <x>=SUMPRODUCT(B2:B5,D2:D5/C2:C5)/SUM(B2:B5)</x>: each segment’s share weighted by its size.`,
  },
  {
    id: 'm04-as-i2', type: 'formula', kind: 'numerical',
    prompt: 'Ana wants the typical number of cups bought away from home among people who buy that way at all. Column C holds each respondent’s cups last week and F1 the smallest number that counts as buying (1). In F2, calculate the median number of cups among respondents who bought at least the number in F1.',
    sheet: { cells: cupsSheet, vary: { F1: [2, 3] } }, cell: 'F2',
    answer: `=MEDIAN(IF(C2:C${L}>=F1,C2:C${L}))`,
    alt: [`=MEDIAN(FILTER(C2:C${L},C2:C${L}>=F1))`],
    view: `A1:F${L}`, formats: { F2: '0.0', F3: '0.00' }, widths: { B: 17, C: 14, E: 22, F: 10 }, maxHeight: '22rem',
    wrong: [
      { formula: `=AVERAGEIFS(C2:C${L},C2:C${L},">="&F1)`, say: 'That is the mean of the same group, pulled up by a few heavy buyers. Excel has no MEDIANIFS: take the median of the group’s values with <x>MEDIAN(IF(…))</x> or <x>MEDIAN(FILTER(…))</x>.' },
      { formula: `=MEDIAN(C2:C${L})`, say: 'That is the median of everyone, non-buyers included; it happens to match here but not when F1 changes. Keep only the respondents who bought at least F1 cups.' },
      { formula: `=MEDIAN(IF(C2:C${L}>F1,C2:C${L}))`, say: '“>” leaves out the people who bought exactly F1 cups. “At least” is >=.' },
    ],
    solution: `<x>=MEDIAN(IF(C2:C517>=F1,C2:C517))</x> (or <x>=MEDIAN(FILTER(C2:C517,C2:C517>=F1))</x>) gives ${median(R.filter((r) => r.cups >= 1).map((r) => r.cups))} cups among the ${R.filter((r) => r.cups >= 1).length} who bought at least one, against a mean of ${mean(R.filter((r) => r.cups >= 1).map((r) => r.cups)).toFixed(1)}. The median stays at ${median(R.filter((r) => r.cups >= 1).map((r) => r.cups))} when the ${N - R.filter((r) => r.cups >= 1).length} non-buyers are left out, because so many respondents bought 2, 3 or 4 cups; the mean rises from ${mean(R.map((r) => r.cups)).toFixed(1)}, because every zero had pulled it down. The same holds by segment: every segment’s median is ${median(cupsBy[0])}, while the means run from ${Math.min(...cupsBy.map(mean)).toFixed(1)} to ${Math.max(...cupsBy.map(mean)).toFixed(1)}. In Excel 2019 and earlier, enter <x>=MEDIAN(IF(…))</x> with Ctrl+Shift+Enter; FILTER needs Excel 2021, Excel 2024 or Microsoft 365.`,
  },
  {
    id: 'm04-as-i3', type: 'mc', kind: 'conceptual',
    prompt: `A colleague’s draft says: “Newsletter-only contacts are Cold Brew’s best prospects: ${(CB.colPct[3][0] * 100).toFixed(1)}% of the people who would definitely buy are newsletter-only.” What is wrong with the conclusion?`,
    options: [
      'It reads a column share as a rate: only 10.4% of newsletter-only respondents said “definitely”',
      'It should have used the weighted percentage, which would make the newsletter-only share larger still',
      'Nothing: the segment supplying the largest share of definite buyers is by definition the keenest',
      'The figure is right only if the four segments had the same number of completes in the survey',
    ],
    answer: 0,
    feedback: {
      1: 'Weighting changes how far the totals lean towards each segment; it doesn’t turn a column share into a measure of keenness.',
      2: 'Supplying many buyers can come from being large. Keenness is the rate within the segment, where newsletter-only respondents are lowest.',
      3: 'The column share is an accurate figure as it stands; the error is in reading it as a rate.',
    },
    solution: `The ${(CB.colPct[3][0] * 100).toFixed(1)}% is a column percentage: of the ${CB.colTotals[0]} who would definitely buy, ${CB.counts[3][0]} were newsletter-only, because newsletter-only respondents are ${nS[3]} of the 516. Within the segment only ${(CB.rowPct[3][0] * 100).toFixed(1)}% said “definitely”, the lowest of the four. The column view is useful for planning where to send samples; it says nothing about which segment is keenest.`,
  },
  {
    id: 'm04-as-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Rules set before fieldwork: analyse completes only; remove anyone who finishes in under a third of the median time; code open answers to every theme they mention. What happens to each case?',
    items: [
      'A questionnaire abandoned after Q3.',
      'A respondent who took 50 seconds, when the median time was 6 minutes.',
      'A respondent who chose “prefer not to say” for the age question.',
      'The open answer “Cheaper, and quicker delivery please.”',
      'The second of two identical submissions from the same personal invitation link.',
      'A respondent who gave 0 for how likely they are to recommend the company.',
    ],
    categories: ['Exclude from the analysis', 'Keep, with a missing-value code for that question', 'Keep, coded to more than one theme', 'Keep the answer as given'],
    answer: [0, 0, 1, 2, 0, 3],
    feedback: {
      0: 'Under a completes-only rule a partial isn’t analysed, though it still counts in the response rates.',
      1: 'A third of 6 minutes is 2 minutes; 50 seconds is far below it.',
      2: 'The rest of the answers are good. Code age as missing (not 0 and not blank) and leave that person out of the base of any age figure.',
      3: 'Under multi-coding the answer counts for both price and delivery speed, so the theme percentages add to more than 100%.',
      5: '0 is a real answer on a 0–10 scale: a detractor. It must not be confused with a missing answer.',
    },
    solution: 'Partials are excluded under a completes-only rule; the 50-second speeder breaks the time rule; the duplicate submission is removed (keep one copy). “Prefer not to say” is a missing-value code for one question, not a reason to drop the person. The open answer gets two codes under multi-coding. A 0 is an answer, a detractor.',
  },
  {
    id: 'm04-as-i5', type: 'num', kind: 'numerical',
    prompt: `Otterbridge Leisure Centre (fictional) surveys a fresh random sample of members each spring and autumn. Spring: ${OTA.promoters} promoters, ${OTA.passives} passives and ${OTA.detractors} detractors (NPS ${sg(OTA.score)}). Autumn: ${OTB.promoters}, ${OTB.passives} and ${OTB.detractors} (NPS ${sg(OTB.score)}). Calculate the z statistic for the change from spring to autumn. Give two decimal places.`,
    answer: r2(OTz), check: () => (OTB.score - OTA.score) / Math.sqrt(OTA.se ** 2 + OTB.se ** 2), unit: '', places: 2, tol: 0.02,
    wrong: [
      { value: r2((OTB.score - OTA.score) / (OTA.se + OTB.se)), say: 'You added the standard errors. Variances add, so the standard error of the difference is √(SE₁² + SE₂²).' },
      { value: r2((OTB.score - OTA.score) / OTB.se), say: 'You used only the autumn standard error. Both scores are estimates, so both contribute: √(SE₁² + SE₂²).' },
    ],
    solution: `SEs: spring 100 × √((0.420 + 0.220 − 0.200²) ÷ 450) ≈ ${OTA.se.toFixed(2)}; autumn ≈ ${OTB.se.toFixed(2)}. The change is ${(OTB.score - OTA.score).toFixed(1)} points with a standard error of √(${OTA.se.toFixed(2)}² + ${OTB.se.toFixed(2)}²) ≈ ${Math.hypot(OTA.se, OTB.se).toFixed(2)}, so z ≈ ${OTz.toFixed(2)} and the two-sided p-value is about ${(2 * (1 - normCdf(Math.abs(OTz)))).toFixed(2)}. A rise of nearly 7 points is within what samples of 450 and 420 produce by chance: the centre can’t say members became more likely to recommend it.`,
  },
  {
    id: 'm04-as-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the statements about Ana’s weighted results that are true.',
    options: [
      'A weighted percentage should be reported with the unweighted base, 516.',
      'Weighting to segment sizes corrects for segments that replied at different rates.',
      'Weighting corrects for promoters replying more readily than detractors within a segment.',
      'Unequal weights make the effective sample size smaller than the number of completes.',
      'A comparison between subscribers and newsletter-only respondents must use the weights.',
      'Ana’s weighted NPS is a SUMPRODUCT of weights and scores of +100, 0 and −100, divided by the weights’ sum.',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'Every respondent in a segment gets the same weight, so weighting can’t tell keen repliers from reluctant ones within a segment.',
      4: 'Within a segment every respondent has the same weight, so a comparison between segments gives the same result weighted or not.',
    },
    solution: 'True: report the unweighted base; weights correct for segments replying out of proportion; unequal weights cut the effective sample size (Kish’s n is about 469); and the weighted NPS is the weighted mean of +100, 0 and −100. False: weights built from segments can’t see differences within a segment, and comparisons between segments don’t need them.',
  },
];

// ---------------------------------------------------------------- knowledge check
const kWeighted = { ...RC(['respondent', 'segment', 'nps']), D1: 'weight', ...col('D', 2, wts), F1: 'weighted NPS' };
const kTop2 = { ...RC(['respondent', 'segment', 'cold_brew']), E2: 'segment', F2: 'Shop customer', E3: 'top-two-box share' };
const KB = S.nps({ promoters: 124, passives: 118, detractors: 68 });
// a hotel group (fictional): business against leisure guests
const HB = S.nps({ promoters: 8, passives: 11, detractors: 5 }), HL = S.nps({ promoters: 200, passives: 154, detractors: 56 });
const hDse = Math.hypot(HB.se, HL.se);

export const check = [
  {
    id: 'm04-as-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A cinema chain (fictional) reports a Net Promoter Score of +12 from 800 customers. Which statement is correct?',
    options: [
      'Promoters exceed detractors by 12 percentage points of the 800 customers',
      '12% of the 800 customers said they would recommend the cinema chain',
      'The average answer to the 0–10 question was 1.2 points above the midpoint',
      'The score rose by 12% compared with the previous survey of its customers',
    ],
    answer: 0,
    feedback: {
      1: 'The NPS is not a percentage of customers. It is the promoters’ percentage minus the detractors’ percentage: 40% − 28% would give +12, for example.',
      2: 'The NPS doesn’t use the average score; it classifies each answer as promoter, passive or detractor and subtracts two shares.',
      3: 'A single score says nothing about change. A change would need two surveys and a test of the difference.',
    },
    solution: 'NPS = % promoters (9–10) − % detractors (0–6). +12 means promoters outnumber detractors by 12 points of the base; the shares themselves could be 40% and 28%, or 20% and 8%, which is why they should be shown beside the score.',
  },
  {
    id: 'm04-as-k2', type: 'num', kind: 'numerical',
    prompt: 'Kettlewick Bakery (fictional) asked 310 customers how likely they were to recommend it: 124 answered 9 or 10, 118 answered 7 or 8 and 68 answered 6 or below. What is its NPS? Give one decimal place.',
    answer: r1(KB.score), check: () => 100 * (124 - 68) / 310, unit: 'points', places: 1, tol: 0.06,
    wrong: [
      { value: r1(100 * 124 / 310), say: 'That is the promoters’ share alone. Subtract the detractors’ share, 68 ÷ 310.' },
      { value: r1(100 * (124 - 68) / (124 + 68)), say: 'That leaves the passives out of the base. They aren’t subtracted, but they are among the 310 who answered.' },
      { value: 56, say: '56 is the difference in counts. Divide it by the base, 310, and multiply by 100.' },
      { value: -r1(KB.score), say: 'The sign is reversed: NPS is promoters minus detractors.' },
    ],
    solution: `Promoters 124 ÷ 310 = 40.0%; detractors 68 ÷ 310 ≈ 21.9%. NPS = 40.0 − 21.9 ≈ ${sg(KB.score)}. Passives stay in the base of 310.`,
  },
  {
    id: 'm04-as-k3', type: 'formula', kind: 'applied',
    prompt: 'Column C holds each respondent’s 0–10 recommendation score and column D their weight (list size ÷ completes for their segment). In F2, calculate the weighted NPS for the whole mailing list, as a number from −100 to +100.',
    sheet: { cells: kWeighted, fixed: [`C2:C${L}`] }, cell: 'F2',
    answer: `=100*(SUMIFS(D2:D${L},C2:C${L},">=9")-SUMIFS(D2:D${L},C2:C${L},"<=6"))/SUM(D2:D${L})`,
    alt: [
      `=100*(SUMPRODUCT(D2:D${L}*(C2:C${L}>=9))-SUMPRODUCT(D2:D${L}*(C2:C${L}<=6)))/SUM(D2:D${L})`,
      `=100*SUMPRODUCT(D2:D${L},(C2:C${L}>=9)-(C2:C${L}<=6))/SUM(D2:D${L})`,
    ],
    view: `A1:F${L}`, formats: { D: '0.00', F2: '0.0' }, widths: { B: 17, F: 14 }, maxHeight: '22rem',
    wrong: [
      { formula: `=100*(COUNTIF(C2:C${L},">=9")-COUNTIF(C2:C${L},"<=6"))/COUNT(C2:C${L})`, say: 'That is the unweighted NPS, +27.5. Each respondent should count by their weight: sum the weights of promoters and of detractors, and divide by the sum of all weights.' },
      { formula: `=100*(SUMIFS(D2:D${L},C2:C${L},">=9")-SUMIFS(D2:D${L},C2:C${L},"<=6"))/COUNT(C2:C${L})`, say: 'The weighted counts stand for people on the list (6,000 in all), so divide by the sum of the weights, not by the 516 respondents.' },
      { formula: `=100*(SUMIFS(D2:D${L},C2:C${L},">9")-SUMIFS(D2:D${L},C2:C${L},"<=6"))/SUM(D2:D${L})`, say: '“>9” leaves out the 9s. Promoters score 9 or 10: ">=9".' },
    ],
    solution: `<x>=100*(SUMIFS(D2:D517,C2:C517,">=9")-SUMIFS(D2:D517,C2:C517,"<=6"))/SUM(D2:D517)</x> ≈ ${sg(D.nps.weighted.score)}: the weighted promoters (${(D.nps.weighted.pP * 100).toFixed(1)}%) minus the weighted detractors (${(D.nps.weighted.pD * 100).toFixed(1)}%). A SUMPRODUCT of the weights and the conditions gives the same.`,
  },
  {
    id: 'm04-as-k4', type: 'formula', kind: 'numerical',
    prompt: 'F2 holds a segment name. In F3, calculate the share of that segment’s respondents who said they would definitely or probably buy Cold Brew (column C), so that the result is right for whichever segment F2 names.',
    sheet: { cells: kTop2, vary: { F2: ['Subscriber', 'Newsletter only', 'Workshop participant'] } }, cell: 'F3',
    answer: `=(COUNTIFS(B2:B${L},F2,C2:C${L},"Definitely would buy")+COUNTIFS(B2:B${L},F2,C2:C${L},"Probably would buy"))/COUNTIF(B2:B${L},F2)`,
    alt: [
      `=SUM(COUNTIFS(B2:B${L},F2,C2:C${L},{"Definitely would buy","Probably would buy"}))/COUNTIF(B2:B${L},F2)`,
      `=SUMPRODUCT((B2:B${L}=F2)*((C2:C${L}="Definitely would buy")+(C2:C${L}="Probably would buy")))/COUNTIF(B2:B${L},F2)`,
    ],
    view: `A1:F${L}`, formats: { F3: '0.0%' }, widths: { B: 17, C: 20, E: 17, F: 16 }, maxHeight: '22rem',
    wrong: [
      { formula: `=COUNTIFS(B2:B${L},F2,C2:C${L},"Definitely would buy")/COUNTIF(B2:B${L},F2)`, say: 'That is the top-box score only. The top two boxes add “Probably would buy”.' },
      { formula: `=(COUNTIFS(B2:B${L},F2,C2:C${L},"Definitely would buy")+COUNTIFS(B2:B${L},F2,C2:C${L},"Probably would buy"))/COUNTA(C2:C${L})`, say: 'That divides by all 516 completes, a share of the grand total. The segment’s share uses its own base: COUNTIF(B2:B517,F2).' },
      { formula: `=(COUNTIFS(B2:B${L},"Shop customer",C2:C${L},"Definitely would buy")+COUNTIFS(B2:B${L},"Shop customer",C2:C${L},"Probably would buy"))/COUNTIF(B2:B${L},"Shop customer")`, say: 'With the segment typed in, the formula ignores F2. Refer to F2 so it works for any segment.' },
    ],
    solution: `<x>=(COUNTIFS(B2:B517,F2,C2:C517,"Definitely would buy")+COUNTIFS(B2:B517,F2,C2:C517,"Probably would buy"))/COUNTIF(B2:B517,F2)</x>: for shop customers ${top2(byS[1])} of ${nS[1]}, ${(top2(byS[1]) / nS[1] * 100).toFixed(1)}%. COUNTIFS with an array of the two answers inside SUM does the same in one function.`,
  },
  {
    id: 'm04-as-k5', type: 'mc', kind: 'applied',
    prompt: `A hotel group’s draft report (fictional) says: “Business guests (NPS ${sg(HB.score)}, base ${HB.n}) are less loyal than leisure guests (NPS ${sg(HL.score)}, base ${HL.n}).” The group’s minimum base for any figure is 30. What should the report do?`,
    options: [
      'Drop the comparison: 24 business guests is below the minimum base',
      'Keep it: with 410 leisure guests behind it, the comparison is reliable',
      `Keep it, as a gap of ${(HL.score - HB.score).toFixed(1)} points is too large to arise by chance alone`,
      'Weight the 24 business guests up so their base reaches 30 or more',
    ],
    answer: 0,
    feedback: {
      1: `A comparison is only as precise as its smaller group: the business guests’ score has a margin of about ±${HB.margin.toFixed(0)} points.`,
      2: `The gap’s standard error is about ${hDse.toFixed(0)} points (z ≈ ${((HL.score - HB.score) / hDse).toFixed(1)}): well within what chance produces, and the base is under the minimum anyway.`,
      3: 'Weights change how much answers count, not how many there are: the score would still rest on 24 guests.',
    },
    solution: `The business guests’ NPS rests on ${HB.n} answers (${HB.promoters} promoters, ${HB.passives} passives, ${HB.detractors} detractors), a margin of about ±${HB.margin.toFixed(1)} points; the leisure guests’ margin is about ±${HL.margin.toFixed(1)}. The gap of ${(HL.score - HB.score).toFixed(1)} points has a standard error of √(${HB.se.toFixed(1)}² + ${HL.se.toFixed(1)}²) ≈ ${hDse.toFixed(1)}, so z ≈ ${((HL.score - HB.score) / hDse).toFixed(2)}: not distinguishable from chance. With a base below the minimum, the report should drop the comparison and keep business guests in the all-guest figures only.`,
  },
  {
    id: 'm04-as-k6', type: 'mc', kind: 'conceptual',
    prompt: 'An energy supplier (fictional) asked 400 customers, “Will you switch supplier this year?”: 112 said yes, 228 no and 60 “don’t know”. Its report says “28% plan to switch.” Which base did it use, and what should the table show?',
    options: [
      'All 400, “don’t know” included; show it (15%) as its own row',
      'The 340 who answered yes or no; leave “don’t know” out',
      'The 228 who said no; switchers are compared with stayers',
      'The 112 who said yes, since the base is the group being described',
    ],
    answer: 0,
    feedback: {
      1: '112 ÷ 340 is 32.9%, not 28%. Leaving “don’t know” out is a defensible base, but it isn’t the one the report used, and it hides 15% of customers.',
      2: '112 ÷ 228 compares two counts; it isn’t a share of any group of customers.',
      3: 'A group can’t be its own base: 112 ÷ 112 is 100%.',
    },
    solution: '112 ÷ 400 = 28%, so the base is all 400 who were asked, including “don’t know”. On a question about intentions “don’t know” is a meaningful answer: show it as a row (60 ÷ 400 = 15%) so the reader sees that 28% plan to switch, 57% don’t and 15% haven’t decided.',
  },
];

