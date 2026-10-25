// profiling-segments.ex.js — M05 · Profiling segments: widgets, practice and the knowledge check (answer keys live here).
// Lantern's 640 respondents with their segment names (case.js RESPONDENTS, DERIVED.segments) fill the worksheet, the
// PivotTable and the formula items; the typing items use the study's means and SDs and the segment centres on the four
// golden questions (DERIVED.typing.short). Text columns don't change on the marker's copies, so items that pick a segment
// `vary` the label cell. Glenhallow Hotels and Wyncombe Travel are fictional. Every num item's `check` recomputes it.
import { NEEDS, LEVELS, RESPONDENTS, tableCells, DERIVED as D } from './case.js?v=14';

const RS = RESPONDENTS, N = RS.length, L = N + 1;                   // data rows 2..641
const S = D.segments, NAMES = S.names, LAB = S.labels;
const G = (name) => NAMES.indexOf(name);
const VR = G('Value routine'), OG = G('On the go'), EX = G('Explorers'), CL = G('Craft and local'), MI = G('Mindful');
const ORDER = [VR, OG, EX, CL, MI];
const r0 = (x) => Math.round(x), r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100, r3 = (x) => Math.round(x * 1000) / 1000;
const sum = (a) => a.reduce((x, y) => x + y, 0), mean = (a) => sum(a) / a.length;
const KEYS = NEEDS.map((n) => n.key);
const COLS = ['respondent', 'segment', 'region', 'age', 'income', 'main_source', 'cups_week', 'spend_month', ...KEYS];
const ROWS = RS.map((r, i) => [r.id, NAMES[LAB[i]], LEVELS.area[r.area], LEVELS.age[r.age], LEVELS.income[r.income], LEVELS.source[r.source], r.cups, r.spend, ...r.needs]);
const cellsOf = (cols) => tableCells(COLS, ROWS, { cols }).cells;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const members = (g) => RS.filter((_, i) => LAB[i] === g);
const MU = D.needs.means, SD = D.needs.sds, SH = D.typing.short;

// ---------------------------------------------------------------- widgets
const sheetCells = { ...cellsOf(COLS), R1: 'segment', S1: 'respondents', T1: 'share', U1: 'mean: local', V1: 'index: local', W1: 'share of spend', X1: 'spend a head', ...col('R', 2, ORDER.map((g) => NAMES[g])) };
const records = RS.map((r, i) => ({
  Segment: NAMES[LAB[i]], Region: LEVELS.area[r.area], Age: LEVELS.age[r.age], Household: LEVELS.household[r.household], Income: LEVELS.income[r.income], 'Main source': LEVELS.source[r.source],
  Respondents: 1, 'Spend a month': r.spend, 'Cups a week': r.cups, 'Cold Brew top two': r.coldbrew <= 2 ? 1 : 0, 'Aware of Lantern': r.aware, 'Local-loyalty score': mean(r.loyal),
}));

export const widgets = {
  'ps-sheet': {
    type: 'sheet', title: `Lantern’s needs study: ${N} respondents with their segment`,
    sheet: { cells: sheetCells },
    view: `A1:X${L}`, editable: true, mark: ['S2:X6'], maxHeight: '26rem',
    formats: { T: '0.0%', U: '0.00', V: '0', W: '0.0%', X: '$#,##0.00' },
    widths: { B: 15, D: 7, E: 11, F: 17, R: 15, S: 11, U: 11, V: 10, W: 13, X: 11 },
    tools: ['formulas', 'fill', 'reset'],
    note: 'Columns: A respondent, B segment, C region, D age band, E income band, F main source, G cups a week, H monthly coffee spend ($), I to P the eight needs (1–7): taste, price, convenience, sustainability, energy, health, local, novelty. Try <x>=COUNTIF($B$2:$B$641,R2)</x> in S2, <x>=AVERAGEIFS($O$2:$O$641,$B$2:$B$641,R2)</x> in U2, <x>=U2/AVERAGE($O$2:$O$641)*100</x> in V2, <x>=SUMIFS($H$2:$H$641,$B$2:$B$641,R2)/SUM($H$2:$H$641)</x> in W2, and fill down to row 6.',
  },
  'ps-pivot': {
    type: 'pivot', title: `Lantern’s needs study: ${N} respondents`,
    records,
    fields: ['Segment', 'Region', 'Age', 'Household', 'Income', 'Main source'],
    values: ['Respondents', 'Spend a month', 'Cups a week', 'Cold Brew top two', 'Aware of Lantern', 'Local-loyalty score'],
    defaults: { rows: 'Segment', cols: 'Main source', value: 'Respondents', agg: 'sum', show: 'pct-row' },
    order: { Segment: ORDER.map((g) => NAMES[g]), Region: LEVELS.area, Age: LEVELS.age, Household: LEVELS.household, Income: LEVELS.income, 'Main source': LEVELS.source },
    formats: { 'Spend a month': '$#,##0.00', 'Cups a week': '0.0', 'Cold Brew top two': '0.0%', 'Aware of Lantern': '0.0%', 'Local-loyalty score': '0.00' },
    note: 'Respondents is 1 for each person, so its Sum counts them. Cold Brew top two and Aware of Lantern are 1 or 0, so their Average is a share. The local-loyalty score is each respondent’s mean on the three items (1–5).',
  },
};

// ---------------------------------------------------------------- guided practice
const g1Cells = { ...cellsOf(['respondent', 'segment', 'local']), E2: 'segment', F2: 'Explorers', E3: 'mean: local', E4: 'index: local' };
const localOf = (g) => mean(members(g).map((r) => r.needs[6]));
const LOCAL_ALL = mean(RS.map((r) => r.needs[6]));
const g2Cells = { ...cellsOf(['respondent', 'segment', 'spend_month']), E2: 'segment', F2: 'Craft and local', E3: 'share of spend', E4: 'spend a head' };
const SPEND_ALL = sum(RS.map((r) => r.spend));
// typing by hand: a customer answers 6, 2, 2, 3 to price, sustainability, local and novelty
const TY = [6, 2, 2, 3];
const tyZ = TY.map((x, q) => (x - MU[SH[q]]) / SD[SH[q]]);
const CEN4 = S.centres.map((c) => SH.map((j) => r2(c[j])));
const tyZr = tyZ.map(r2);
const tyD = CEN4.map((c) => c.reduce((a, v, q) => a + (tyZr[q] - v) ** 2, 0));
const tyBest = tyD.indexOf(Math.min(...tyD));
const shortLabels = SH.map((j) => NEEDS[j].label);

export const guided = [
  {
    id: 'm05-ps-g1', type: 'steps', kind: 'numerical',
    prompt: 'Column B holds each respondent’s segment and column C their rating of “from a local, independent business” (1–7). F2 names a segment. Profile that segment on the local need.',
    solution: `<x>=AVERAGEIFS(C2:C641,B2:B641,F2)</x> gives Explorers’ mean, ${localOf(EX).toFixed(2)}; <x>=F3/AVERAGE(C2:C641)*100</x> gives the index, ${r0(localOf(EX) / LOCAL_ALL * 100)}: Explorers rate local businesses about as the average respondent does (${LOCAL_ALL.toFixed(2)}). For Craft and local the same formulas give ${localOf(CL).toFixed(2)} and ${r0(localOf(CL) / LOCAL_ALL * 100)}.`,
    steps: [
      {
        id: 'm05-ps-g1-s1', type: 'formula',
        prompt: 'In F3, calculate the mean local rating of the segment named in F2, so that the formula works for whichever segment F2 names.',
        sheet: { cells: g1Cells, vary: { F2: ['Mindful', 'Value routine', 'Craft and local'] } }, cell: 'F3',
        answer: `=AVERAGEIFS(C2:C${L},B2:B${L},F2)`,
        alt: [`=AVERAGEIF(B2:B${L},F2,C2:C${L})`, `=SUMIFS(C2:C${L},B2:B${L},F2)/COUNTIF(B2:B${L},F2)`, '=AVERAGEIFS(C:C,B:B,F2)'],
        view: `A1:F${L}`, formats: { F3: '0.00' }, widths: { B: 15, E: 13, F: 15 }, maxHeight: '22rem',
        wrong: [
          { formula: `=AVERAGE(C2:C${L})`, say: 'That is the mean of all 640 respondents, the same whatever F2 says. Average only the segment’s members: AVERAGEIFS with the segment as the criterion.' },
          { formula: `=AVERAGEIFS(C2:C${L},B2:B${L},"Explorers")`, say: 'With the name typed in, the formula ignores F2. Refer to F2 so it profiles any segment.' },
          { formula: `=AVERAGEIFS(B2:B${L},C2:C${L},F2)`, say: 'The ranges are swapped: AVERAGEIFS takes the values to average first (column C), then the criteria range (column B) and the criterion (F2).' },
        ],
        hints: ['AVERAGEIFS(average_range, criteria_range, criterion).', `<x>=AVERAGEIFS(C2:C641,B2:B641,F2)</x>.`],
      },
      {
        id: 'm05-ps-g1-s2', type: 'formula',
        prompt: 'F3 now holds the segment’s mean. In F4, calculate the segment’s index against the average respondent on the local need.',
        sheet: { cells: { ...g1Cells, F3: `=AVERAGEIFS(C2:C${L},B2:B${L},F2)` }, vary: { F2: ['Mindful', 'Value routine', 'Craft and local'] } }, cell: 'F4',
        answer: `=F3/AVERAGE(C2:C${L})*100`,
        alt: [`=100*F3/AVERAGE(C2:C${L})`, `=AVERAGEIFS(C2:C${L},B2:B${L},F2)/AVERAGE(C2:C${L})*100`],
        view: `A1:F${L}`, formats: { F3: '0.00', F4: '0' }, widths: { B: 15, E: 13, F: 15 }, maxHeight: '22rem',
        wrong: [
          { formula: `=F3/AVERAGE(C2:C${L})`, say: 'That is the ratio (about 1.04 for Explorers). An index multiplies it by 100, so that 100 means average.' },
          { formula: `=(F3-AVERAGE(C2:C${L}))*100`, say: 'An index divides the segment’s mean by the overall mean; it doesn’t subtract.' },
          { formula: `=AVERAGE(C2:C${L})/F3*100`, say: 'That is upside down: the segment’s mean goes on top, so a segment that rates the need highly scores above 100.' },
        ],
        hints: ['Index = segment mean ÷ overall mean × 100.', `<x>=F3/AVERAGE(C2:C641)*100</x>.`],
      },
      {
        id: 'm05-ps-g1-s3', type: 'mc',
        prompt: 'Explorers’ index on the local need comes out at 104. What does it say?',
        options: [
          'Explorers rate local businesses about as the average respondent does: the need doesn’t set them apart',
          'Explorers rate local businesses 4% of the way to essential on the questionnaire’s 1–7 scale',
          '104 Explorers said local businesses matter, out of the 129 people in the segment',
          'Explorers are 4% more likely than other people to buy their coffee from a local, independent business nearby',
        ],
        answer: 0,
        feedback: {
          1: 'An index compares the segment’s mean with the overall mean; it isn’t a position on the scale.',
          2: 'An index isn’t a count of people; it is a ratio of two means, times 100.',
          3: 'The index is about how much a need matters in the ratings, not about buying behaviour, which the needs didn’t measure.',
        },
        hints: ['100 means average.', '104 is within a few points of average.'],
      },
    ],
  },
  {
    id: 'm05-ps-g2', type: 'steps', kind: 'numerical',
    prompt: 'Column B holds each respondent’s segment and column C their monthly coffee spend in dollars. F2 names a segment. Size it in spend.',
    solution: `Share of spend: <x>=SUMIFS(C2:C641,B2:B641,F2)/SUM(C2:C641)</x>, ${(S.sizes[CL].spendShare * 100).toFixed(1)}% for Craft and local. Spend a head: <x>=AVERAGEIFS(C2:C641,B2:B641,F2)</x>, $${S.sizes[CL].perHead.toFixed(2)}. Craft and local are ${(S.sizes[CL].share * 100).toFixed(1)}% of respondents but ${(S.sizes[CL].spendShare * 100).toFixed(1)}% of spend, because each spends ${(S.sizes[CL].perHead / (SPEND_ALL / N)).toFixed(2)} times the average.`,
    steps: [
      {
        id: 'm05-ps-g2-s1', type: 'formula',
        prompt: 'In F3, calculate the segment’s share of all the respondents’ monthly spend.',
        sheet: { cells: g2Cells, vary: { F2: ['Value routine', 'On the go', 'Mindful'] } }, cell: 'F3',
        answer: `=SUMIFS(C2:C${L},B2:B${L},F2)/SUM(C2:C${L})`,
        alt: [`=SUMIF(B2:B${L},F2,C2:C${L})/SUM(C2:C${L})`, '=SUMIFS(C:C,B:B,F2)/SUM(C:C)'],
        view: `A1:F${L}`, formats: { F3: '0.0%' }, widths: { B: 15, E: 14, F: 15 }, maxHeight: '22rem',
        wrong: [
          { formula: `=COUNTIF(B2:B${L},F2)/COUNTA(B2:B${L})`, say: 'That is the segment’s share of respondents. The share of spend adds up their dollars: SUMIFS over column C.' },
          { formula: `=SUMIFS(C2:C${L},B2:B${L},F2)/COUNTIF(B2:B${L},F2)`, say: 'That divides by the segment’s respondents, giving spend a head. A share divides by everyone’s spend, SUM(C2:C641).' },
          { formula: `=SUMIFS(C2:C${L},B2:B${L},F2)`, say: 'That is the segment’s total spend in dollars. Divide by the total for everyone to make it a share.' },
        ],
        hints: ['Share of spend = the segment’s total spend ÷ everyone’s total spend.', `<x>=SUMIFS(C2:C641,B2:B641,F2)/SUM(C2:C641)</x>.`],
      },
      {
        id: 'm05-ps-g2-s2', type: 'formula',
        prompt: 'In F4, calculate the segment’s spend a head: the mean monthly spend of its respondents.',
        sheet: { cells: g2Cells, vary: { F2: ['Value routine', 'On the go', 'Mindful'] } }, cell: 'F4',
        answer: `=AVERAGEIFS(C2:C${L},B2:B${L},F2)`,
        alt: [`=SUMIFS(C2:C${L},B2:B${L},F2)/COUNTIF(B2:B${L},F2)`, `=AVERAGEIF(B2:B${L},F2,C2:C${L})`],
        view: `A1:F${L}`, formats: { F4: '$#,##0.00' }, widths: { B: 15, E: 14, F: 15 }, maxHeight: '22rem',
        wrong: [
          { formula: `=AVERAGE(C2:C${L})`, say: 'That is everyone’s spend a head, $50.29 whatever F2 says. Average the segment’s members only.' },
          { formula: `=SUMIFS(C2:C${L},B2:B${L},F2)/${N}`, say: 'Dividing by all 640 respondents gives the segment’s spend spread over everyone. Spend a head divides by the segment’s own respondents.' },
        ],
        hints: ['Spend a head is the mean spend within the segment.', `<x>=AVERAGEIFS(C2:C641,B2:B641,F2)</x>.`],
      },
      {
        id: 'm05-ps-g2-s3', type: 'mc',
        prompt: `Craft and local are ${(S.sizes[CL].share * 100).toFixed(1)}% of respondents and ${(S.sizes[CL].spendShare * 100).toFixed(1)}% of spend. What follows?`,
        options: [
          'Each Craft and local respondent spends about one and a half times the average a head',
          'Craft and local are the largest segment in Harbour City, measured in people rather than dollars',
          'Craft and local respondents drink more cups a week than any other segment',
          'The two shares contradict each other, so one of them must be a mistake in the data or the formula',
        ],
        answer: 0,
        feedback: {
          1: 'They are the fourth-largest segment by respondents, and the study can’t give shares of Harbour City.',
          2: 'Spend isn’t cups: Craft and local drink fewer cups than average (8.4 a week) but buy them in cafés, at higher prices.',
          3: 'They measure different things: one counts people, one counts dollars. Together they show spend a head above average.',
        },
        hints: ['Divide the share of spend by the share of respondents.', '25.9 ÷ 17.0 ≈ 1.5.'],
      },
    ],
  },
  {
    id: 'm05-ps-g3', type: 'steps', kind: 'applied',
    prompt: `A new customer answers Lantern’s four golden questions (1–7): ${TY.map((x, q) => `${shortLabels[q].toLowerCase()} ${x}`).join(', ')}. The study’s means are ${SH.map((j) => MU[j].toFixed(2)).join(', ')} and its standard deviations ${SH.map((j) => SD[j].toFixed(2)).join(', ')}, in the same order. Place her with the typing tool.`,
    data: { table: { head: ['Segment centre (z)', ...shortLabels], align: ['l', 'r', 'r', 'r', 'r'], rows: ORDER.map((g) => [NAMES[g], ...CEN4[g].map((v) => v.toFixed(2).replace('-', '−'))]) } },
    solution: `z-scores: ${tyZr.map((v) => v.toFixed(2).replace('-', '−')).join(', ')}. Squared distances: ${ORDER.map((g) => `${NAMES[g]} ${tyD[g].toFixed(2)}`).join(', ')}. The nearest is ${NAMES[tyBest]}.`,
    steps: [
      {
        id: 'm05-ps-g3-s1', type: 'num',
        prompt: 'Standardise her price answer with the study’s mean and standard deviation. Give two decimal places.',
        answer: r2(tyZ[0]), check: () => (6 - MU[1]) / SD[1], unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: r2(6 - MU[1]), say: 'That is the difference from the mean in rating points. Divide by the standard deviation to put it in standard deviations.' },
          { value: r2((6 - 4) / SD[1]), say: 'Subtract the study’s mean (4.44), not the middle of the scale (4).' },
          { value: r2((6 - mean(TY)) / SD[1]), say: 'Centre on the study’s mean, not on her own average answer: her own average hides whether her ratings are high or low compared with everyone else.' },
        ],
        hints: ['z = (answer − study mean) ÷ study standard deviation.', `(6 − ${MU[1].toFixed(2)}) ÷ ${SD[1].toFixed(2)}.`],
      },
      {
        id: 'm05-ps-g3-s2', type: 'num',
        prompt: `Her four z-scores are ${tyZr.map((v) => v.toFixed(2).replace('-', '−')).join(', ')}. Calculate her squared distance to the Value routine centre. Give two decimal places.`,
        answer: r2(tyD[VR]), check: () => tyZr.reduce((a, v, q) => a + (v - CEN4[VR][q]) ** 2, 0), unit: '', places: 2, tol: 0.02,
        wrong: [
          { value: r2(Math.sqrt(tyD[VR])), say: 'That is the distance, the square root. The typing tool compares squared distances (either ranks the centres the same way, but the question asks for the squared one).' },
          { value: r2(tyZr.reduce((a, v, q) => a + (v - CEN4[VR][q]), 0)), say: 'Square each difference before adding, or positive and negative differences cancel.' },
        ],
        hints: ['Subtract the centre from her z-score on each question, square, add.', `(${tyZr[0].toFixed(2)} − ${CEN4[VR][0].toFixed(2)})² + … for all four.`],
      },
      {
        id: 'm05-ps-g3-s3', type: 'mc',
        prompt: `Her squared distances to the other four centres are ${ORDER.filter((g) => g !== VR).map((g) => `${NAMES[g]} ${tyD[g].toFixed(2)}`).join(', ')}. With your answer to the previous step for Value routine, which segment does the typing tool assign her to?`,
        options: ORDER.map((g) => NAMES[g]),
        answer: ORDER.indexOf(tyBest),
        feedback: Object.fromEntries(ORDER.map((g, k) => [k, `${NAMES[g]} is ${tyD[g].toFixed(2)} away; the tool picks the smallest squared distance, ${tyD[tyBest].toFixed(2)}.`]).filter(([k]) => +k !== ORDER.indexOf(tyBest))),
        hints: ['The nearest centre wins.', 'Pick the smallest squared distance.'],
      },
    ],
  },
  {
    id: 'm05-ps-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Glenhallow Hotels (fictional) segmented guests on what they want from a stay and proposed a name for each segment. Does each name fit the profile, or claim more than it shows?',
    items: [
      '“Spa seekers”, for a segment whose highest index is the importance of a spa (182).',
      '“Business travellers”, for a segment whose highest index is fast Wi-Fi and a desk in the room (161).',
      '“Budget-first”, for a segment whose highest index is a low room rate (155).',
      '“Wealthy guests”, for a segment whose highest index is luxurious rooms (148).',
      '“Loyal regulars”, for a segment whose highest index is earning loyalty points (171).',
      '“Family-friendly”, for a segment whose highest indexes are family rooms (176) and a pool (150).',
    ],
    categories: ['Fits the profile', 'Claims more than the profile shows'],
    answer: [0, 1, 0, 1, 1, 0],
    feedback: {
      1: 'Why guests travel wasn’t a segmentation variable. Wanting a desk fits many guests on holiday too; check the trip purpose in the descriptors before naming them by it.',
      3: 'Wanting luxury says nothing about income, which wasn’t among the needs. “Luxury seekers” would say what the profile shows.',
      4: 'Valuing points isn’t the same as staying often or staying only with Glenhallow: that is behaviour, which the needs didn’t measure.',
    },
    hints: ['A name should say what the highest indexes show, in plain words.', 'Does the name add an income, a purpose or a behaviour that no need measured?'],
    solution: 'Spa seekers, Budget-first and Family-friendly restate the highest indexes. Business travellers, Wealthy guests and Loyal regulars add a trip purpose, an income and a behaviour that the needs didn’t measure; the descriptors might support them, but the name shouldn’t assume it.',
  },
];

// ---------------------------------------------------------------- on your own
const i4Cells = { ...cellsOf(['respondent', 'segment', 'main_source']), E2: 'segment', F2: 'Craft and local', E3: 'main source', F3: 'Café', E4: 'share of the segment' };
const rowPct = (g, s) => members(g).filter((r) => LEVELS.source[r.source] === s).length / members(g).length;
const AREA = S.chi.area;
const vArea = Math.sqrt(AREA.stat / (N * Math.min(5 - 1, 5 - 1)));
const exShare = S.sizes[EX].share, exMoe = 1.96 * Math.sqrt(exShare * (1 - exShare) / N);

export const independent = [
  {
    id: 'm05-ps-i1', type: 'num', kind: 'numerical',
    prompt: 'Glenhallow Hotels’ (fictional) spa segment rates the importance of a spa 5.9 on average (1–7); all guests surveyed average 3.4. What is the segment’s index on the spa need? Give a whole number.',
    answer: r0(5.9 / 3.4 * 100), check: () => (5.9 / 3.4) * 100, unit: '', places: 0, tol: 0.6,
    wrong: [
      { value: 250, say: 'That is the difference in points times 100. An index divides the means: 5.9 ÷ 3.4 × 100.' },
      { value: r0(3.4 / 5.9 * 100), say: 'Upside down: the segment’s mean goes on top.' },
      { value: r0(5.9 / 3.4 * 100) - 100, say: 'That is how far above 100 the index is. The index itself is 5.9 ÷ 3.4 × 100.' },
    ],
    solution: '5.9 ÷ 3.4 × 100 ≈ 173.5, so 174 to a whole number: the spa matters far more to this segment than to the average guest. On a 1–7 scale, read it beside the means: 5.9 against 3.4.',
  },
  {
    id: 'm05-ps-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern’s five segments were formed by k-means on the eight needs. Is each analysis a meaningful test, or circular?',
    items: [
      'A one-way ANOVA showing that the segments’ mean importance of a low price differs (F = 287).',
      'A chi-square test of segment by age band, with Cramér’s V = 0.30.',
      'A chi-square test of segment by where people mostly buy their coffee.',
      'A t test showing that Explorers rate new flavours higher than everyone else.',
      'A one-way ANOVA of monthly coffee spend across the five segments.',
      'A chi-square test of segment by whether people would buy Lantern Cold Brew (top two boxes or not).',
    ],
    categories: ['A meaningful test', 'Circular: the segments were formed on it'],
    answer: [1, 0, 0, 1, 0, 0],
    feedback: {
      0: 'Price is a segmentation variable: k-means made the segments differ on it, so any test will be “significant”, even on random data.',
      3: 'Novelty is a segmentation variable too, and Explorers were formed partly because they rate it highly.',
      4: 'Spend wasn’t used to form the segments, so testing it is legitimate (with the usual cautions: an opt-in sample, and many tests).',
      5: 'Cold Brew intent wasn’t a segmentation variable either: a fair descriptor to test.',
    },
    solution: 'Tests on the segmentation variables (price, novelty) are circular. Tests on descriptors (age, source, spend, Cold Brew intent) are meaningful, with the cautions that the sample is an opt-in panel and that many tests invite false positives.',
  },
  {
    id: 'm05-ps-i3', type: 'num', kind: 'numerical',
    prompt: `The cross-tab of Lantern’s five segments by the five regions gives χ² = ${AREA.stat.toFixed(1)} for ${N} respondents. Calculate Cramér’s V. Give two decimal places.`,
    answer: r2(vArea), check: () => Math.sqrt(AREA.stat / (640 * 4)), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: r2(Math.sqrt(AREA.stat / (N * 3))), say: 'Use min(r − 1, c − 1): a 5 × 5 table gives 4, not 3.' },
      { value: r2(Math.sqrt(AREA.stat / (N * 16))), say: 'That divides by the degrees of freedom, (r − 1)(c − 1) = 16. Cramér’s V uses min(r − 1, c − 1) = 4.' },
      { value: r3(AREA.stat / (N * 4)), say: 'Take the square root: V = √(χ² ÷ (n × min(r − 1, c − 1))).' },
    ],
    solution: `V = √(${AREA.stat.toFixed(1)} ÷ (640 × 4)) = ${vArea.toFixed(3)}, about ${vArea.toFixed(2)}: the weakest of the five descriptors. Region tells Lantern little about which segment someone is in.`,
  },
  {
    id: 'm05-ps-i4', type: 'formula', kind: 'numerical',
    prompt: 'Column B holds each respondent’s segment and column C where they mostly buy coffee. F2 names a segment and F3 a source. In F4, calculate the share of that segment’s respondents who mostly buy from that source, so that the formula works for any segment and source.',
    sheet: { cells: i4Cells, vary: { F2: ['Value routine', 'On the go', 'Mindful'], F3: ['Home-brewed', 'Office or vending', 'Supermarket or RTD'] } }, cell: 'F4',
    answer: `=COUNTIFS(B2:B${L},F2,C2:C${L},F3)/COUNTIF(B2:B${L},F2)`,
    alt: [`=COUNTIFS(C2:C${L},F3,B2:B${L},F2)/COUNTIF(B2:B${L},F2)`, '=COUNTIFS(B:B,F2,C:C,F3)/COUNTIF(B:B,F2)'],
    view: `A1:F${L}`, formats: { F4: '0.0%' }, widths: { B: 15, C: 18, E: 20, F: 18 }, maxHeight: '22rem',
    wrong: [
      { formula: `=COUNTIFS(B2:B${L},F2,C2:C${L},F3)/COUNTIF(C2:C${L},F3)`, say: 'That divides by everyone who uses the source: a column percentage (what share of café buyers are in this segment). To describe the segment, divide by its own respondents.' },
      { formula: `=COUNTIFS(B2:B${L},F2,C2:C${L},F3)/${N}`, say: 'That is a share of all 640 respondents. Percentage within the segment: divide by COUNTIF of the segment.' },
      { formula: `=COUNTIFS(B2:B${L},F2,C2:C${L},F3)`, say: 'That is the count. Divide by the segment’s respondents to make it a share.' },
    ],
    solution: `<x>=COUNTIFS(B2:B641,F2,C2:C641,F3)/COUNTIF(B2:B641,F2)</x>: ${(rowPct(CL, 'Café') * 100).toFixed(1)}% of Craft and local mostly buy from a café. Percentaging within the segment, as <i>Analysing survey data</i> taught, describes the segment; dividing by the source’s total would answer a different question.`,
  },
  {
    id: 'm05-ps-i5', type: 'mc', kind: 'applied',
    prompt: `Explorers are ${S.sizes[EX].n} of the ${N} respondents in Lantern’s study, which came from an opt-in panel with quotas on age band. What can Ana say about their size?`,
    options: [
      `About a fifth of Harbour City’s weekly coffee drinkers are Explorers, with a 95% margin of error of ±${(exMoe * 100).toFixed(1)} points`,
      'Nothing at all: segment sizes from any survey are meaningless for planning',
      `About a fifth of the study’s respondents were Explorers; the city’s share could differ, since the panel controls only age`,
      'A fifth of the city’s coffee drinkers are Explorers, because the age quotas made the sample match the city',
    ],
    answer: 2,
    feedback: {
      0: 'A margin of error assumes a probability sample. An opt-in panel’s error comes mostly from who joins and answers, which the margin doesn’t measure.',
      1: 'Sizes from the study are useful as rough guides and for comparing segments; they just aren’t population shares without further evidence.',
      3: 'Quotas fix the age mix only. Within each age band, panel members chose to join and answer, and may differ from other coffee drinkers.',
    },
    solution: 'The share is 20.2% of the study’s respondents. Quotas on age don’t make it a share of Harbour City, and a margin of error would suggest a precision the sample can’t support. Ana should state the base, cross-check with other evidence, and treat any market size built on it as a range.',
  },
  {
    id: 'm05-ps-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which belong in a segment report that a café manager could use without having seen the analysis? Select all that apply.',
    options: [
      'A name and one sentence on what the segment wants',
      'The segment’s size in respondents and in spend, with the base',
      'The full index profile, including the needs the segment rates below average',
      'The descriptors that differ most, as percentages beside the overall figure',
      'The golden questions and the typing tool’s hold-out accuracy',
      'ANOVA p-values for each need, as proof that the segments are real',
      'An invented first name and life story for a typical member, to bring the segment to life',
    ],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      5: 'Tests on the segmentation variables are circular, so their p-values prove nothing about the segments.',
      6: 'Invented detail can mislead, because readers can’t tell it from data. Personas built from segment data come in the targeting lessons, with their limits.',
    },
    solution: 'A usable report gives the name, what the segment wants, its size with the base, the full profile, the descriptors that set it apart, how to recognise and reach it, and what isn’t known. Circular p-values and invented stories don’t belong.',
  },
];

// ---------------------------------------------------------------- knowledge check
// the typing tool in Excel: B2:E2 a new customer's answers; means and SDs; z-scores; centres; distances
const k3Cells = {
  A1: 'question', ...Object.fromEntries(shortLabels.map((t, q) => [`${'BCDE'[q]}1`, t])),
  A2: 'answer (1–7)', B2: 4, C2: 3, D2: 3, E2: 7,
  A4: 'study mean', ...Object.fromEntries(SH.map((j, q) => [`${'BCDE'[q]}4`, r3(MU[j])])),
  A5: 'study SD', ...Object.fromEntries(SH.map((j, q) => [`${'BCDE'[q]}5`, r3(SD[j])])),
  A6: 'z', B6: '=STANDARDIZE(B2,B4,B5)', C6: '=STANDARDIZE(C2,C4,C5)', D6: '=STANDARDIZE(D2,D4,D5)', E6: '=STANDARDIZE(E2,E4,E5)',
  A8: 'segment', F8: 'squared distance',
  A15: 'nearest segment',
};
ORDER.forEach((g, k) => { const r = 9 + k; k3Cells[`A${r}`] = NAMES[g]; CEN4[g].forEach((v, q) => { k3Cells[`${'BCDE'[q]}${r}`] = v; }); k3Cells[`F${r}`] = `=SUMPRODUCT(($B$6:$E$6-B${r}:E${r})^2)`; });
const typeK3 = (a) => { const z = a.map((x, q) => (x - r3(MU[SH[q]])) / r3(SD[SH[q]])); const d = ORDER.map((g) => CEN4[g].reduce((s, v, q) => s + (z[q] - v) ** 2, 0)); return NAMES[ORDER[d.indexOf(Math.min(...d))]]; };
const OG_HEAD = S.sizes[OG].perHead, ALL_HEAD = SPEND_ALL / N;
// Wyncombe Travel (fictional): one segment's spend
const WY = { n: 210, total: 900, spend: 567000, all: 1800000 };

export const check = [
  {
    id: 'm05-ps-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Mindful’s index on health is 168. Which reading is right?',
    options: [
      '68% of Mindful respondents rated health as essential, 7 on the 1–7 scale',
      'Mindful’s mean importance of health is 1.68 times the average respondent’s',
      'Mindful respondents care 68% more about health than other people, on a scale with a true zero',
      'Health is 68% more important to Mindful respondents than any of their other needs',
    ],
    answer: 1,
    feedback: {
      0: 'An index is a ratio of means, not a share of people choosing one answer.',
      2: 'A 1–7 rating has no true zero, so “68% more” over-reads it; the index says the mean is 1.68 times as high.',
      3: 'An index compares a segment with the average respondent on the same need, not one need with another.',
    },
    solution: `Index = segment mean ÷ overall mean × 100: Mindful rate health ${S.means[MI][5].toFixed(2)} against ${MU[5].toFixed(2)} overall, 1.68 times as high. On a rating scale, read it beside the means.`,
  },
  {
    id: 'm05-ps-k2', type: 'num', kind: 'numerical',
    prompt: `Wyncombe Travel (fictional) surveyed ${WY.total} past customers. Its “culture seekers” segment has ${WY.n} of them, who spent $${WY.spend.toLocaleString('en-US')} with Wyncombe last year; all ${WY.total} spent $${WY.all.toLocaleString('en-US')}. What is the segment’s share of spend? Give a percentage to one decimal place.`,
    answer: r1(WY.spend / WY.all * 100), check: () => 567000 / 1800000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: r1(WY.n / WY.total * 100), say: 'That is the segment’s share of customers. Share of spend divides its dollars by everyone’s dollars.' },
      { value: r1((WY.spend / WY.all) / (WY.n / WY.total) * 100), say: 'That is the spend share ÷ customer share (times 100): it compares spend a head with the average. The question asks for the share of spend itself.' },
    ],
    solution: `$567,000 ÷ $1,800,000 = 31.5% of spend, from ${(WY.n / WY.total * 100).toFixed(1)}% of customers: each culture seeker spent $${(WY.spend / WY.n).toLocaleString('en-US')} against $${(WY.all / WY.total).toLocaleString('en-US')} on average.`,
  },
  {
    id: 'm05-ps-k3', type: 'formula', kind: 'applied',
    prompt: 'The worksheet is Lantern’s typing tool: a new customer’s answers to the four golden questions in B2:E2, their z-scores (with the study’s stored means and SDs) in row 6, and each segment’s squared distance from them in F9:F13. In B15, return the name of the segment the tool assigns the customer to.',
    sheet: { cells: k3Cells, fixed: ['B4:E5', 'B9:E13'], vary: { B2: [3, 6, 2], C2: [6, 2, 6], D2: [4, 2, 7], E2: [2, 3, 5] } }, cell: 'B15',
    answer: '=INDEX(A9:A13,MATCH(MIN(F9:F13),F9:F13,0))',
    alt: ['=XLOOKUP(MIN(F9:F13),F9:F13,A9:A13)', '=INDEX(A9:A13,XMATCH(MIN(F9:F13),F9:F13))', '=INDEX(A9:A13,MATCH(SMALL(F9:F13,1),F9:F13,0))', '=INDEX($A$9:$A$13,MATCH(MIN($F$9:$F$13),$F$9:$F$13,0))'],
    view: 'A1:F15', formats: { B4: '0.000', C4: '0.000', D4: '0.000', E4: '0.000', B5: '0.000', C5: '0.000', D5: '0.000', E5: '0.000', B6: '0.00', C6: '0.00', D6: '0.00', E6: '0.00', B9: '0.00', C9: '0.00', D9: '0.00', E9: '0.00', B10: '0.00', C10: '0.00', D10: '0.00', E10: '0.00', B11: '0.00', C11: '0.00', D11: '0.00', E11: '0.00', B12: '0.00', C12: '0.00', D12: '0.00', E12: '0.00', B13: '0.00', C13: '0.00', D13: '0.00', E13: '0.00', F: '0.00' },
    widths: { A: 16, B: 12, C: 14, D: 18, E: 11, F: 16 },
    wrong: [
      { formula: '=INDEX(A9:A13,MATCH(MAX(F9:F13),F9:F13,0))', say: 'MAX finds the farthest centre. The tool assigns the nearest: MIN.' },
      { formula: '=MIN(F9:F13)', say: 'That is the smallest squared distance, a number. Look up which segment it belongs to with INDEX and MATCH (or XLOOKUP).' },
      { formula: `="${typeK3([4, 3, 3, 7])}"`, say: 'Typing the name works only for this customer. The formula must find the nearest segment for whatever answers are in B2:E2.' },
    ],
    solution: `<x>=INDEX(A9:A13,MATCH(MIN(F9:F13),F9:F13,0))</x> (or <x>=XLOOKUP(MIN(F9:F13),F9:F13,A9:A13)</x>) returns ${typeK3([4, 3, 3, 7])} for answers 4, 3, 3 and 7. Change the answers and it follows: 3, 6, 4, 2 gives ${typeK3([3, 6, 4, 2])}, 6, 2, 2, 3 gives ${typeK3([6, 2, 2, 3])} and 2, 6, 7, 5 gives ${typeK3([2, 6, 7, 5])}.`,
  },
  {
    id: 'm05-ps-k4', type: 'mc', kind: 'applied',
    prompt: `On the go’s highest indexes are energy (${S.index[OG][4]}) and convenience (${S.index[OG][2]}). ${(S.crosstabs.source[OG][3] / S.sizes[OG].n * 100).toFixed(0)}% of its members mostly get coffee at the office or from vending machines, and ${(S.coldbrewTop2[OG] * 100).toFixed(0)}% would definitely or probably buy Cold Brew. Which name is best supported?`,
    options: [
      '“Office workers”, since the office is where many of them get their coffee',
      '“Caffeine addicts”, because energy is their highest need of all',
      '“Cold Brew fans”, since their intent is well above average',
      '“On the go”: caffeine and convenience, wherever they are',
    ],
    answer: 3,
    feedback: {
      0: `Only ${(S.crosstabs.source[OG][3] / S.sizes[OG].n * 100).toFixed(0)}% mostly buy at the office; the name would describe a minority and a behaviour, not the segment’s needs.`,
      1: 'It restates the energy need as a judgement about the people; names that judge colour every later decision about a group.',
      2: `Intent of ${(S.coldbrewTop2[OG] * 100).toFixed(0)}% leaves most of the segment not saying it would buy, and Cold Brew isn’t a need.`,
    },
    solution: '“On the go” says what the two highest indexes show, energy and convenience, in plain words, without adding a workplace, a judgement or a product the needs didn’t measure.',
  },
  {
    id: 'm05-ps-k5', type: 'num', kind: 'numerical',
    prompt: `On the go respondents spend $${OG_HEAD.toFixed(2)} a month on coffee each, against $${ALL_HEAD.toFixed(2)} for all ${N} respondents. What is the segment’s index of spend a head? Give a whole number.`,
    answer: r0(OG_HEAD / ALL_HEAD * 100), check: () => S.sizes[OG].perHead / (SPEND_ALL / N) * 100, unit: '', places: 0, tol: 0.6,
    wrong: [
      { value: r0(OG_HEAD - ALL_HEAD), say: 'That is the difference in dollars. An index divides: segment ÷ average × 100.' },
      { value: r0(ALL_HEAD / OG_HEAD * 100), say: 'Upside down: the segment’s figure goes on top.' },
      { value: r0(OG_HEAD / ALL_HEAD * 100) - 100, say: 'That is how far above average it is; the index itself is about 116.' },
    ],
    solution: `$${OG_HEAD.toFixed(2)} ÷ $${ALL_HEAD.toFixed(2)} × 100 ≈ ${(OG_HEAD / ALL_HEAD * 100).toFixed(1)}, so ${r0(OG_HEAD / ALL_HEAD * 100)}. Spend has a true zero, so this index means what it says: 16% more a head.`,
  },
  {
    id: 'm05-ps-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about a typing tool are true? Select all that apply.',
    options: [
      'A new customer’s answers are standardised with the original study’s means and standard deviations.',
      'Its accuracy should be measured on respondents the segmentation never saw.',
      'The best golden questions are the needs that separate the segments most.',
      'Customers whose two nearest centres are almost equally close are the most likely to be misassigned.',
      'Agreeing with the full segmentation on a hold-out shows it assigns customers to their true segment.',
      'Adding more golden questions lowers its accuracy, because each question adds noise.',
      'Each new customer is standardised against the other customers typed the same day.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'The hold-out measures agreement with the full segmentation, which is itself a model; there is no true segment to check against in real data.',
      5: 'The opposite: fewer questions usually means lower accuracy (Lantern: one question 54%, four 92.5%, eight 100% in-sample).',
      6: 'Standardise with the stored study values; a day’s customers are a different, arbitrary reference group.',
    },
    solution: 'True: stored means and SDs, hold-out accuracy, golden questions chosen by how well they separate the segments, close calls as the weak point. A hold-out can’t show truth, more questions help, and the reference values never change between customers.',
  },
];
