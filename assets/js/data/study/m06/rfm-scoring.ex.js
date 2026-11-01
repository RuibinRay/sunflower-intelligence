// rfm-scoring.ex.js — M06 · RFM scoring: widgets, practice and the knowledge check (answer keys live here).
// The worksheet is 30 of Lantern's members on 31 December 2027 (every 86th, from the 64th: several sit exactly on a
// frequency cut point, so the boundary convention shows). The percentiles in G2:G5 are fixed on the marker's copies;
// cut points and scores the items don't ask for are given as formulas so the copies stay consistent. Quaymouth Books
// and Tidewell Outfitters are fictional. Every num item's `check` recomputes its answer.
import { members, CALIBRATION_END } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';

const ALL = members(), N = ALL.length;
const money = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const r1 = (x) => Math.round(x * 10) / 10;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const rng = (letter, n = 30) => Array.from({ length: n }, (_, i) => `${letter}${i + 2}`);
const CR = CU.cutPoints(ALL.map((m) => m.recency)), CF = CU.cutPoints(ALL.map((m) => m.frequency)), CM = CU.cutPoints(ALL.map((m) => m.monetary));

// ---------------------------------------------------------------- the worksheet: 30 members
const T = ALL.filter((_, i) => i % 86 === 63).slice(0, 30), NT = T.length, L = NT + 1;     // rows 2..31
const base = {
  A1: 'member', B1: 'recency', C1: 'visits', D1: 'spend',
  ...col('A', 2, T.map((m) => m.id)), ...col('B', 2, T.map((m) => m.recency)), ...col('C', 2, T.map((m) => m.frequency)), ...col('D', 2, T.map((m) => m.monetary)),
  F1: 'percentile', ...col('F', 2, [0.2, 0.4, 0.6, 0.8]), H1: 'recency cut', I1: 'visits cut', J1: 'spend cut', L1: 'R', M1: 'F', N1: 'M', O1: 'FM',
};
// G is left empty so the percentiles in F sit beside the cut points; the formulas below refer to F
const data = Object.fromEntries(Object.entries(base).filter(([k]) => /^[A-D]\d+$/.test(k)));
const cutF = (c, r) => `=PERCENTILE.INC($${c}$2:$${c}$${L},F${r})`;
const cuts = { ...col('H', 2, [2, 3, 4, 5].map((r) => cutF('B', r))), ...col('I', 2, [2, 3, 4, 5].map((r) => cutF('C', r))), ...col('J', 2, [2, 3, 4, 5].map((r) => cutF('D', r))) };
const fScore = (r) => `=1+COUNTIF($I$2:$I$5,"<"&C${r})`, mScore = (r) => `=1+COUNTIF($J$2:$J$5,"<"&D${r})`, rScore = (r) => `=5-COUNTIF($H$2:$H$5,"<"&B${r})`;
const scores = { ...col('L', 2, rng('L').map((_, i) => rScore(i + 2))), ...col('M', 2, rng('M').map((_, i) => fScore(i + 2))), ...col('N', 2, rng('N').map((_, i) => mScore(i + 2))) };
const FIX = ['F2:F5'];
const fmts = { D: '$#,##0.00', J: '$#,##0.00', H: '0.0', I: '0.0' };
const wid = { F: 10, H: 11, I: 10, J: 10 };
const tR = CU.cutPoints(T.map((m) => m.recency)), tF = CU.cutPoints(T.map((m) => m.frequency)), tM = CU.cutPoints(T.map((m) => m.monetary));
const tFS = CU.score(T.map((m) => m.frequency));
const onCut = T.filter((m) => tF.includes(m.frequency)).length;

// ---------------------------------------------------------------- widgets
export const widgets = {
  'rfms-rfm': {
    type: 'rfm', title: `RFM scores for Lantern’s ${N.toLocaleString('en-US')} members, 31 December 2027`,
    customers: ALL.map((m) => ({ id: m.id, recency: m.recency, frequency: m.frequency, monetary: m.monetary })),
    k: 5, method: 'quantile', choose: true, show: ['cuts', 'grid'], unit: 'visits',
    note: 'Recency is reversed: R5 is the most recent fifth. FM is the rounded mean of F and M. M is total spend since joining.',
  },
  'rfms-oct': {
    type: 'rfm', title: 'The same scoring on 31 October 2027',
    customers: members({ asOf: CALIBRATION_END }).map((m) => ({ id: m.id, recency: m.recency, frequency: m.frequency, monetary: m.monetary })),
    k: 5, method: 'quantile', show: ['cuts'], unit: 'visits',
    note: 'Members who had joined by 31 October, with their visits up to that day.',
  },
  'rfms-sheet': {
    type: 'sheet', title: `Thirty members on 31 December 2027`,
    sheet: { cells: base, fixed: FIX },
    view: `A1:O${L}`, editable: true, mark: ['H2:J5', `L2:O${L}`], maxHeight: '26rem',
    formats: fmts, widths: wid, tools: ['formulas', 'fill', 'reset'],
    note: 'Try <x>=PERCENTILE.INC($B$2:$B$31,F2)</x> in H2, filled down to H5 and across to J; <x>=5-COUNTIF($H$2:$H$5,"<"&B2)</x> in L2; <x>=1+COUNTIF($I$2:$I$5,"<"&C2)</x> in M2; <x>=1+COUNTIF($J$2:$J$5,"<"&D2)</x> in N2; and <x>=ROUND((M2+N2)/2,0)</x> in O2. Fill L2:O2 down to row 31.',
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'm06-rfm-g1', type: 'steps', kind: 'numerical',
    prompt: `Thirty members’ recency (B), visits (C) and spend (D) are in rows 2–${L}; F2:F5 hold 0.2, 0.4, 0.6 and 0.8. Score the members on frequency with quintile cut points.`,
    solution: `Cut points <x>=PERCENTILE.INC($C$2:$C$31,F2)</x> filled to I5: ${tF.map(num).join(', ')}. Scores <x>=IF(C2<=$I$2,1,IF(C2<=$I$3,2,IF(C2<=$I$4,3,IF(C2<=$I$5,4,5))))</x> filled down. ${onCut} members sit exactly on a cut point and stay in the lower group.`,
    steps: [
      {
        id: 'm06-rfm-g1-s1', type: 'formula',
        prompt: 'In I2, calculate the frequency cut point for the percentile in F2, so that filling I2 down to I5 gives all four.',
        sheet: { cells: base, fixed: FIX }, cell: 'I2', fill: 'I2:I5', view: `A1:O${L}`, formats: fmts, widths: wid,
        answer: `=PERCENTILE.INC($C$2:$C$${L},F2)`,
        alt: [`=PERCENTILE.INC(C$2:C$${L},F2)`, `=PERCENTILE.INC($C$2:$C$${L},$F2)`, `=PERCENTILE(C$2:C$${L},F2)`],
        wrong: [
          { formula: `=PERCENTILE.INC(C2:C${L},F2)`, say: 'The data range slides down as the formula fills, so I3 to I5 leave out the first members. Anchor it: $C$2:$C$31.' },
          { formula: `=PERCENTILE.INC($C$2:$C$${L},0.2)`, say: 'With 0.2 typed in, every row gives the 20th percentile. Refer to F2 so each row uses its own percentile.' },
          { formula: `=PERCENTILE.EXC($C$2:$C$${L},F2)`, say: 'PERCENTILE.EXC uses a different rule, (n + 1)p, and gives different cut points. The course uses PERCENTILE.INC.' },
        ],
        hints: ['PERCENTILE.INC(array, k), with k between 0 and 1.', `<x>=PERCENTILE.INC($C$2:$C$${L},F2)</x>, filled down.`],
      },
      {
        id: 'm06-rfm-g1-s2', type: 'formula',
        prompt: 'I2:I5 now hold the cut points. In M2, score the member’s visits from 1 to 5 (a value equal to a cut point stays in the lower group), and fill down to M31.',
        sheet: { cells: { ...base, ...cuts }, fixed: FIX }, cell: 'M2', fill: `M2:M${L}`, view: `A1:O${L}`, formats: fmts, widths: wid,
        answer: '=IF(C2<=$I$2,1,IF(C2<=$I$3,2,IF(C2<=$I$4,3,IF(C2<=$I$5,4,5))))',
        alt: ['=1+COUNTIF($I$2:$I$5,"<"&C2)', '=IFS(C2<=$I$2,1,C2<=$I$3,2,C2<=$I$4,3,C2<=$I$5,4,TRUE,5)', '=1+(C2>$I$2)+(C2>$I$3)+(C2>$I$4)+(C2>$I$5)'],
        wrong: [
          { formula: '=IF(C2<$I$2,1,IF(C2<$I$3,2,IF(C2<$I$4,3,IF(C2<$I$5,4,5))))', say: 'With < a member exactly on a cut point moves up a group. The rule here keeps them in the lower group: use <=.' },
          { formula: '=IF(C2<=I2,1,IF(C2<=I3,2,IF(C2<=I4,3,IF(C2<=I5,4,5))))', say: 'Without $ the cut-point references slide as you fill down, and lower rows compare against empty cells. Anchor them: $I$2 and so on.' },
          { formula: '=MATCH(C2,$I$2:$I$5,1)', say: 'MATCH returns the position of the largest cut point at or below the value: a member below the first cut point gets #N/A, and one on a cut point moves up. Use nested IFs, or 1 + COUNTIF of the cut points below the value.' },
        ],
        hints: ['Test the cut points in order: at or below the first is 1, at or below the second is 2, …', '<x>=IF(C2<=$I$2,1,IF(C2<=$I$3,2,IF(C2<=$I$4,3,IF(C2<=$I$5,4,5))))</x>.'],
      },
      {
        id: 'm06-rfm-g1-s3', type: 'mc',
        prompt: `The thirty members’ F scores come out as ${[1, 2, 3, 4, 5].map((s) => tFS.filter((v) => v === s).length).join(', ')} members with scores 1 to 5. Why aren’t there six in each?`,
        options: [
          'Many members share the same number of visits, and members on or below a cut point share the lower score',
          'PERCENTILE.INC interpolates between values, so its cut points can never split thirty members into equal groups',
          'The thirty members joined in different months of the year, so the newer joiners are scored on a different scale',
          'A score of 5 is kept for the top 10% of the base, so the highest group is always the smallest of the five',
        ],
        answer: 0,
        feedback: {
          1: 'Interpolation is not the cause: with thirty distinct values the groups would be six each. The ties are.',
          2: 'Everyone is scored against the same cut points; tenure affects the values, not the scale.',
          3: 'Each cut point is a quintile: there is no special rule for the top score.',
        },
        hints: ['Look at how many members have 1 visit, and where the first cut point is.', 'Ties at or below a cut point all get the same score.'],
      },
    ],
  },
  {
    id: 'm06-rfm-g2', type: 'num', kind: 'numerical',
    prompt: `Lantern’s recency cut points on 31 December 2027 are ${CR.map(num).join(', ')} days. A member last visited 100 days before 31 December. What is the member’s R score (5 = most recent)?`,
    answer: 6 - (1 + CR.filter((c) => 100 > c).length), check: () => 6 - (1 + [9, 36, 94.8, 171].filter((c) => 100 > c).length), unit: '', places: 0, tol: 0,
    wrong: [{ value: 1 + CR.filter((c) => 100 > c).length, say: 'That is the score before reversing: 100 days is above three cut points, so it is in the fourth group from the most recent end. Recency reverses: R = 6 − 4.' }],
    hints: ['Count the cut points 100 is above, add 1, then reverse.', '100 is above 9, 36 and 94.8: unreversed 4, so R = 6 − 4.'],
    solution: `100 is above three cut points (9, 36, 94.8) but not 171, so the unreversed score is 4 and R = 6 − 4 = ${6 - (1 + CR.filter((c) => 100 > c).length)}.`,
  },
  {
    id: 'm06-rfm-g3', type: 'num', kind: 'numerical',
    prompt: 'A member scores F4 and M3. What is the member’s FM score, the rounded mean of F and M with halves rounded up?',
    answer: Math.floor((4 + 3) / 2 + 0.5), check: () => Math.floor((4 + 3) / 2 + 0.5), unit: '', places: 0, tol: 0,
    wrong: [{ value: 3, say: '(4 + 3) ÷ 2 = 3.5, and halves round up, to 4 (Excel’s ROUND does the same).' }, { value: 3.5, say: 'FM is a whole-number score: round 3.5 to 4.' }],
    hints: ['(F + M) ÷ 2, then round.', '3.5 rounds up.'],
    solution: '(4 + 3) ÷ 2 = 3.5, which rounds up to FM = 4. In Excel, <x>=ROUND((4+3)/2,0)</x>.',
  },
  {
    id: 'm06-rfm-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Which scoring method does each statement describe: quantile cut points, equal-sized groups (NTILE), or both?',
    items: [
      'Two customers with the same value always get the same score.',
      'Every score holds a fifth of the customers, give or take one.',
      'Where tied customers land depends on the order of the rows.',
      'A customer’s score depends on the other customers in the base.',
      'With many tied values, some scores can hold far more customers than others.',
      'Recency has to be reversed so that the most recent customers score 5.',
    ],
    categories: ['Quantile cut points', 'Equal-sized groups', 'Both'],
    answer: [0, 1, 1, 2, 0, 2],
    feedback: {
      3: 'Both methods rank customers against the base: neither gives an absolute score.',
      5: 'Reversal is about the direction of recency, not the method.',
    },
    hints: ['Cut points protect ties; equal groups protect group sizes.', 'Being relative to the base, and reversing recency, are true of both.'],
    solution: 'Cut points: ties share a score, so groups can be uneven. Equal-sized groups: sizes are fixed, and ties are split by row order. Both: scores are relative to the base, and recency must be reversed.',
  },
];

// ---------------------------------------------------------------- on your own
const TW = [4, 6, 6, 9, 12, 15, 21, 30, 52];

export const independent = [
  {
    id: 'm06-rfm-i1', type: 'formula', kind: 'numerical',
    prompt: 'H2:H5 hold the recency cut points (days) for the thirty members. In L2, give the member’s R score, with 5 for the most recent and a value on a cut point in the lower group (here, the more recent score), and fill down to L31.',
    sheet: { cells: { ...base, ...cuts }, fixed: FIX }, cell: 'L2', fill: `L2:L${L}`, view: `A1:O${L}`, formats: fmts, widths: wid,
    answer: '=IF(B2<=$H$2,5,IF(B2<=$H$3,4,IF(B2<=$H$4,3,IF(B2<=$H$5,2,1))))',
    alt: ['=5-COUNTIF($H$2:$H$5,"<"&B2)', '=6-(1+COUNTIF($H$2:$H$5,"<"&B2))', '=6-IF(B2<=$H$2,1,IF(B2<=$H$3,2,IF(B2<=$H$4,3,IF(B2<=$H$5,4,5))))'],
    wrong: [
      { formula: '=IF(B2<=$H$2,1,IF(B2<=$H$3,2,IF(B2<=$H$4,3,IF(B2<=$H$5,4,5))))', say: 'That scores recency like frequency, so the members who left longest ago score 5. Reverse it: the smallest recency scores 5.' },
      { formula: '=1+COUNTIF($H$2:$H$5,"<"&B2)', say: 'Not reversed: the most recent members get 1. Subtract from 6, or count down from 5.' },
    ],
    solution: `<x>=IF(B2<=$H$2,5,IF(B2<=$H$3,4,IF(B2<=$H$4,3,IF(B2<=$H$5,2,1))))</x>, or <x>=5-COUNTIF($H$2:$H$5,"<"&B2)</x>. The cut points are ${tR.map(num).join(', ')} days.`,
  },
  {
    id: 'm06-rfm-i2', type: 'num', kind: 'numerical',
    prompt: `Tidewell Outfitters (fictional) has nine customers who spent $${TW.join(', $')} last year. Calculate the 60th percentile with Excel’s PERCENTILE.INC rule.`,
    answer: r1(CU.quantile(TW, 0.6)), check: () => { const h = 8 * 0.6; return TW[4] + (h - 4) * (TW[5] - TW[4]); }, unit: '$', places: 1, tol: 0.05,
    wrong: [{ value: 15, say: 'That is the value in position 6 (counting from 1). PERCENTILE.INC uses h = (n − 1)p = 4.8, counting from 0: 80% of the way from $12 to $15.' }, { value: 12, say: 'Position 4.8 lies between the values at positions 4 and 5 (counting from 0), $12 and $15: interpolate.' }],
    solution: `h = (9 − 1) × 0.6 = 4.8. Counting from 0, positions 4 and 5 hold $12 and $15, so the percentile is 12 + 0.8 × (15 − 12) = $${num(CU.quantile(TW, 0.6))}.`,
  },
  {
    id: 'm06-rfm-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Lantern scores its members every month with quintile cut points. True or false?',
    items: [
      'A member who doesn’t visit can lose an F score although her number of visits hasn’t changed.',
      'An R5 member in January was in the most recent fifth of members on the January scoring date.',
      'A member scored 444 in October and 433 in December must have spent less in November and December.',
      'Fixing the cut points from one month and reusing them makes scores comparable between months.',
      'The same member gets the same scores whichever members are included in the base.',
    ],
    categories: ['True', 'False'],
    answer: [0, 0, 1, 0, 1],
    feedback: {
      2: 'Total spend can’t fall; her M score fell because the cut points rose as other members spent more.',
      4: 'Scores rank members against the base: change the base and the cut points, and so the scores, change.',
    },
    solution: 'True: F can fall when cut points rise; R5 is relative to that date’s base; fixed cut points make months comparable. False: a lower M score doesn’t mean lower spend (monetary value is cumulative and can’t fall); scores depend on who is in the base.',
  },
  {
    id: 'm06-rfm-i4', type: 'num', kind: 'numerical',
    prompt: 'A business weights its scores as 3R + 2F + M. What is the weighted score of a customer in cell 352?',
    answer: 3 * 3 + 2 * 5 + 2, check: () => 3 * 3 + 2 * 5 + 2, unit: '', places: 0, tol: 0,
    wrong: [{ value: 10, say: 'That is the unweighted total, 3 + 5 + 2. Multiply each score by its weight first.' }, { value: 3 * 2 + 2 * 5 + 3, say: 'The cell is R, F, M in that order: R = 3, F = 5, M = 2.' }],
    solution: 'Cell 352 means R = 3, F = 5, M = 2: 3 × 3 + 2 × 5 + 2 = 21.',
  },
  {
    id: 'm06-rfm-i5', type: 'mc', kind: 'applied',
    prompt: 'Two Lantern members both have a combined score of 10: one in cell 514, the other in cell 145. A manager wants to invite members who are still visiting to a tasting evening. What should Ana tell her?',
    options: [
      'Invite the 514 member: R5 means a visit very recently, while the 145 member, though a big spender in the past, hasn’t been in for a long time',
      'Either: equal combined scores mean the two members are of equal value to Lantern, so the choice between them can be made at random',
      'Invite the 145 member: a monetary score of 5 makes her the more valuable of the two, and value matters more than how recent the last visit was',
      'Neither: a combined score of 10 sits in the middle of the 3–15 range, and only members scoring 13 or more should be considered for an event',
    ],
    answer: 0,
    feedback: {
      1: 'The combined score hides the profile: the same 10 is a recent light buyer in one case and a lapsed heavy one in the other.',
      2: 'She was valuable; with R1 she may no longer be a customer. For “still visiting”, recency is the score that matters.',
      3: 'There is no threshold of 13 in the method; and the question is about who is still visiting, which R answers.',
    },
    solution: 'The cells show what the total hides. 514 is recent but light and low-spending; 145 spent a lot but last came long ago. For an invitation to members who are still coming, the R score decides: the 514 member.',
  },
  {
    id: 'm06-rfm-i6', type: 'formula', kind: 'numerical',
    prompt: 'M2:M31 hold the members’ F scores and N2:N31 their M scores. In O2, calculate the FM score (the mean of F and M rounded to a whole number, halves up) and fill down to O31.',
    sheet: { cells: { ...base, ...cuts, ...scores }, fixed: FIX }, cell: 'O2', fill: `O2:O${L}`, view: `A1:O${L}`, formats: fmts, widths: wid,
    answer: '=ROUND((M2+N2)/2,0)',
    alt: ['=ROUND(AVERAGE(M2:N2),0)', '=ROUNDUP((M2+N2)/2-0.4,0)', '=INT((M2+N2)/2+0.5)'],
    wrong: [
      { formula: '=(M2+N2)/2', say: 'That leaves halves such as 3.5. FM is a whole-number score: round it.' },
      { formula: '=ROUNDDOWN((M2+N2)/2,0)', say: 'Halves round up in the FM rule (and in Excel’s ROUND): 3.5 is 4, not 3.' },
      { formula: '=M2+N2', say: 'That is the sum of the two scores, 2 to 10. FM is their mean, back on the 1–5 scale.' },
    ],
    solution: '<x>=ROUND((M2+N2)/2,0)</x>, filled down. ROUND rounds halves away from zero, so (4 + 3) ÷ 2 = 3.5 becomes 4.',
  },
];

// ---------------------------------------------------------------- knowledge check
const A0001o = CU.rfm(members({ asOf: CALIBRATION_END })).find((c) => c.id === 'A0001'), A0001d = CU.rfm(ALL).find((c) => c.id === 'A0001');
const COF = CU.cutPoints(members({ asOf: CALIBRATION_END }).map((m) => m.frequency));

export const check = [
  {
    id: 'm06-rfm-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is the recency score reversed, so that the smallest recency values score 5?',
    options: [
      'A small recency means a recent purchase, which is good, and every score is set up so that 5 is best',
      'Recency is measured in days, and days have to be converted before they can be ranked against counts and dollars',
      'Reversing recency stops its cut points from interpolating, which matters when many customers share a recency',
      'It isn’t needed: recency could score 5 for the longest gap, as long as frequency and monetary value are reversed too',
    ],
    answer: 0,
    feedback: {
      1: 'Units don’t matter: each variable is ranked separately. The reversal is about direction.',
      2: 'Reversal changes the direction of the score, not how the cut points are calculated.',
      3: 'Reversing all three would make 5 the worst on every scale; RFM’s convention is 5 = best on each.',
    },
    solution: 'Scores are built so that 5 is best on every scale. For frequency and monetary value, high is good; for recency, low is good, so its scale is reversed.',
  },
  {
    id: 'm06-rfm-k2', type: 'num', kind: 'numerical',
    prompt: `Lantern’s frequency cut points on 31 December 2027 are ${CF.map(num).join(', ')} visits. With a value on a cut point kept in the lower group, what F score does a member with exactly 6 visits get?`,
    answer: 1 + CF.filter((c) => 6 > c).length, check: () => 1 + [2, 3, 6, 11].filter((c) => 6 > c).length, unit: '', places: 0, tol: 0,
    wrong: [{ value: 4, say: 'That puts the value on a cut point in the higher group (MATCH’s convention). Here 6 is above only two cut points, 2 and 3: F = 1 + 2.' }],
    solution: '6 is above 2 and 3 but not above 6 (it is on that cut point) or 11: F = 1 + 2 = 3.',
  },
  {
    id: 'm06-rfm-k3', type: 'mc', kind: 'applied',
    prompt: `Member A0001 made two visits, both in March 2027, and none after. Scored as of 31 October 2027 the member was in cell ${A0001o.cell}; as of 31 December, ${A0001d.cell}. Why did the F score change?`,
    options: [
      `New members joined and others kept visiting, so the first frequency cut point rose from ${num(COF[0])} to ${num(CF[0])}: two visits now sits in the lowest group`,
      'The member’s visits were recounted at the end of the year, and one of the two March visits fell outside the scoring window that was used',
      'F scores fall automatically when the R score is 1, because a member who has lapsed is no longer counted as frequent',
      'Frequency is divided by tenure before it is scored, so the member’s visit rate fell as the year went on without a visit',
    ],
    answer: 0,
    feedback: {
      1: 'Both visits are still in the window, 1 March to 31 December.',
      2: 'The three scores are calculated separately; R doesn’t affect F.',
      3: 'The course scores the count of visits, not a rate. The count didn’t change; the cut points did.',
    },
    solution: `Scores are relative. Between October and December the base grew and the frequency distribution moved, so the first cut point rose from ${num(COF[0])} to ${num(CF[0])}. Two visits went from above the first cut point (F2) to on it (F1) without the member doing anything.`,
  },
  {
    id: 'm06-rfm-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about scoring with equal-sized groups (NTILE) instead of quantile cut points are true? Select all that apply.',
    options: [
      'Every score holds the same number of customers, give or take one',
      'Customers with identical values can get different scores',
      'The result can depend on the order the rows were in',
      'It removes the need to reverse recency',
      'It makes scores comparable between months',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Reversal is about direction and is needed with either method.',
      4: 'Equal groups are still relative to each month’s base: the boundaries move as the base changes.',
    },
    solution: 'Equal-sized groups fix the group sizes, so ties have to be split, and how they are split depends on the sort order (add a tie-breaker). Recency still has to be reversed, and the scores are still relative to each run’s base.',
  },
  {
    id: 'm06-rfm-k5', type: 'formula', kind: 'numerical',
    prompt: `Column D holds thirty members’ total spend (rows 2–${L}) and G1 a percentile as a fraction. In G2, calculate the spend cut point at that percentile.`,
    sheet: { cells: { ...data, F1: 'percentile', G1: 0.8, F2: 'spend cut' }, vary: { G1: [0.2, 0.6, 0.4] } }, cell: 'G2', view: `A1:G${L}`, formats: { D: '$#,##0.00', G2: '$#,##0.00' }, widths: { F: 15 },
    answer: `=PERCENTILE.INC(D2:D${L},G1)`,
    alt: [`=PERCENTILE(D2:D${L},G1)`, `=PERCENTILE.INC($D$2:$D$${L},$G$1)`],
    wrong: [
      { formula: `=PERCENTILE.INC(D2:D${L},0.8)`, say: 'With 0.8 typed in, the formula ignores G1. Refer to the cell.' },
      { formula: `=PERCENTILE.INC(D2:D${L},G1*100)`, say: 'PERCENTILE.INC takes the percentile as a fraction from 0 to 1, as G1 already holds it.' },
      { formula: `=PERCENTILE.EXC(D2:D${L},G1)`, say: 'PERCENTILE.EXC uses (n + 1)p and gives a different value. The course uses PERCENTILE.INC.' },
    ],
    solution: `<x>=PERCENTILE.INC(D2:D31,G1)</x>. For 0.8: ${money(tM[3])}.`,
  },
  {
    id: 'm06-rfm-k6', type: 'mc', kind: 'applied',
    prompt: `Lantern’s ${N.toLocaleString('en-US')} members fill ${new Set(CU.rfm(ALL).map((c) => c.cell)).size} of the 125 RFM cells, many with only a handful of members. The managers want something they can act on. What does Ana do?`,
    options: [
      'Use the R × FM grid: 25 cells that keep recency separate, which works because F and M scores agree for most members',
      'Keep all 125 cells, because merging any of them would throw away information that the managers have paid for',
      'Rank everyone by the combined score R + F + M, because a single number from 3 to 15 is all a manager needs',
      'Drop the M score altogether, because spend can’t be compared between Harbourside’s tickets and Millbrook’s',
    ],
    answer: 0,
    feedback: {
      1: 'Most cells are too thin to plan for; detail nobody can act on isn’t worth keeping in the report.',
      2: 'A single number hides whether a customer is recent or lapsed, which matters for what to do.',
      3: 'M is scored across all members; the café difference is a reason to look by café, not to drop M.',
    },
    solution: 'The R × FM grid compresses F and M, which mostly agree, while keeping recency, the strongest signal, on its own axis: 25 cells that the next lesson names.',
  },
];
