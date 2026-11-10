// rfm-segments.ex.js — M06 · RFM segments: widgets, practice and the knowledge check (answer keys live here).
// The worksheet items use 33 of Lantern's members scored as of 31 December 2027 against all 2,584 (case.js members(),
// core/customer.js rfm, quantile cut points): the first three by id from each of the eleven segments. Scores are
// `fixed` on the marking copies (they are categories, not amounts), and items that pick a segment or a threshold `vary`
// that cell. The October check uses churnTable(). Corriebeck Garden Centre and Askerby Cinemas are fictional. Every num
// item's `check` recomputes its answer.
import { members, churnTable } from './case.js?v=30';
import * as CU from '../../../core/customer.js?v=30';

const sum = (a) => a.reduce((x, y) => x + y, 0);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100, r3 = (x) => Math.round(x * 1000) / 1000;
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- the members, scored
const MS = members();
const SC = CU.rfm(MS, { k: 5, method: 'quantile' });
const N = SC.length, SPEND = sum(SC.map((c) => c.monetary));
const SEG = Object.fromEntries(CU.groupBy(SC, 'segment').map((g) => [g.key, g]));
// worksheet sample: three members from each segment, in id order
const ROWS = CU.SEGMENTS.flatMap((s) => SC.filter((c) => c.segment === s.name).slice(0, 3)).sort((a, b) => (a.id < b.id ? -1 : 1));
const n = ROWS.length, L = n + 1;                                   // data in rows 2..34
const HEAD = { A1: 'member', B1: 'café', C1: 'recency (days)', D1: 'visits', E1: 'spend ($)', F1: 'R', G1: 'F', H1: 'M' };
const base = { ...HEAD, ...col('A', 2, ROWS.map((c) => c.id)), ...col('B', 2, ROWS.map((c) => c.cafe)), ...col('C', 2, ROWS.map((c) => c.recency)),
  ...col('D', 2, ROWS.map((c) => c.frequency)), ...col('E', 2, ROWS.map((c) => c.monetary)), ...col('F', 2, ROWS.map((c) => c.R)),
  ...col('G', 2, ROWS.map((c) => c.F)), ...col('H', 2, ROWS.map((c) => c.M)) };
const withFM = { ...base, I1: 'FM', ...col('I', 2, ROWS.map((_, i) => `=ROUND((G${i + 2}+H${i + 2})/2,0)`)) };
const withSeg = { ...withFM, J1: 'segment', ...col('J', 2, ROWS.map((c) => c.segment)) };
const FIX = [`F2:H${L}`];
const W = { A: 8, B: 12, C: 13, D: 7, E: 9, F: 4, G: 4, H: 4, I: 5, J: 18, L: 14, M: 16 };
const fm = (c) => Math.floor((c.F + c.M) / 2 + 0.5);
const sampleChamps = ROWS.filter((c) => c.R >= 4 && fm(c) >= 4);
const sampleSpend = sum(ROWS.map((c) => c.monetary));

// ---------------------------------------------------------------- the October check
const OC = CU.rfm(churnTable(), { k: 5, method: 'quantile' });
const NO = OC.length, BACK = sum(OC.map((c) => c.back)), BASE = BACK / NO;
const oseg = (name) => { const g = OC.filter((c) => c.segment === name); return { n: g.length, back: sum(g.map((c) => c.back)) }; };
const NA = oseg('Need attention'), AR = oseg('At risk'), PR = oseg('Promising'), AS = oseg('About to sleep');
// two members, 80 days quiet on 31 October
const quiet = (lo, hi, fLo, fHi) => { const g = OC.filter((c) => c.recency >= lo && c.recency <= hi && c.frequency >= fLo && c.frequency <= fHi); return { n: g.length, rate: sum(g.map((c) => c.back)) / g.length }; };
const Q_LIGHT = quiet(61, 90, 1, 2), Q_HEAVY = quiet(61, 90, 7, 999);

// ---------------------------------------------------------------- fictional
const CG = { n: 400, p: 0.3, c: 2, v: 9 };                          // Corriebeck Garden Centre
const cgU = CG.p * CG.c / (CG.v - CG.c);

export const widgets = {
  'rfmseg-grid': {
    type: 'rfm', title: `Lantern’s ${N.toLocaleString('en-US')} loyalty-app members, scored as of 31 December 2027`,
    customers: MS, k: 5, method: 'quantile', choose: true, show: ['cuts', 'grid', 'segments'], unit: 'visits',
    note: 'R scores recency (5 = visited most recently), F the number of visits since joining and M total spend, each against all members. FM is the rounded mean of F and M. The segment names are one practitioner convention, not a standard; the grid’s cells follow the naming table in the lesson.',
  },
  'rfmseg-offer': {
    type: 'formula', title: 'Does an offer to a segment pay for itself?',
    intro: 'Everyone who comes back redeems the offer, including those who would have come anyway.',
    inputs: [
      { id: 'n', label: 'Members in the segment', min: 10, max: 1000, step: 10, value: 460, fmt: 'int' },
      { id: 'p', label: 'Return rate without the offer', min: 0, max: 95, step: 0.5, value: 77.5, fmt: 'pct' },
      { id: 'u', label: 'Extra return rate the offer causes (uplift)', min: 0, max: 40, step: 0.5, value: 5, fmt: 'pct' },
      { id: 'v', label: 'Margin from a member who comes back', min: 2, max: 40, step: 0.5, value: 12, fmt: 'money' },
      { id: 'c', label: 'Cost of the offer per redemption', min: 0.1, max: 5, step: 0.1, value: 1.1, fmt: 'money' },
    ],
    compute: (x) => {
      if (x.v <= x.c) return { error: 'The offer costs at least as much as a returning member is worth, so it can never pay.' };
      if (x.p + x.u > 100) return { error: 'The return rate without the offer plus the uplift can’t exceed 100%.' };
      const p = x.p / 100, u = x.u / 100;
      const gain = x.n * u * (x.v - x.c), subsidy = x.n * p * x.c, net = gain - subsidy;
      const be = (p * x.c) / (x.v - x.c);
      const m = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toFixed(2)}`;
      return {
        headline: { label: 'Net value of sending the offer', value: m(net) },
        rows: [
          ['Extra members brought back', (x.n * u).toFixed(1)],
          ['Margin from them, after their redemptions', m(gain)],
          ['Subsidy: redemptions by members who would have come anyway', m(subsidy)],
          ['Break-even uplift', `${(be * 100).toFixed(1)} points`],
          ['Break-even extra returners', (x.n * be).toFixed(1)],
        ],
        note: net >= 0
          ? `At an uplift of ${x.u}% the offer pays. The uplift is an assumption until a randomised holdout measures it.`
          : `At an uplift of ${x.u}% the offer loses money: it needs ${(be * 100).toFixed(1)} points just to cover the redemptions by the ${(x.n * p).toFixed(0)} members who would have come anyway.`,
        chart: { kind: 'line', x: { label: 'Uplift (points)', values: [0, 5, 10, 15, 20, 25, 30, 35, 40] },
          series: [{ name: 'Net value', values: [0, 5, 10, 15, 20, 25, 30, 35, 40].map((t) => x.n * (t / 100) * (x.v - x.c) - subsidy) }], y: { label: 'Net value ($)' } },
      };
    },
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'm06-seg-g1', type: 'steps', kind: 'numerical',
    prompt: `Columns F, G and H hold the R, F and M scores of ${n} of Lantern’s members, scored against all ${N.toLocaleString('en-US')} as of 31 December 2027 (three members from each segment). Combine F and M.`,
    solution: `<x>=ROUND((G2+H2)/2,0)</x>, filled down to I${L}. A0035 has F = 4 and M = 5, a mean of 4.5, so FM = 5: halves round up. Its R is 2, so it sits at (2, 5): Can’t lose them.`,
    steps: [
      {
        id: 'm06-seg-g1-s1', type: 'formula',
        prompt: `In I2, calculate FM, the mean of the F and M scores rounded to a whole number (halves up), so that it fills down to I${L}.`,
        sheet: { cells: base, fixed: FIX }, cell: 'I2', fill: `I2:I${L}`,
        answer: '=ROUND((G2+H2)/2,0)',
        alt: ['=ROUND(AVERAGE(G2:H2),0)', '=INT((G2+H2)/2+0.5)', '=ROUNDUP((G2+H2)/2,0)'],
        view: `A1:I${L}`, widths: W,
        wrong: [
          { formula: '=(G2+H2)/2', say: 'That is the mean, but FM is a whole-number score: round it, with halves going up.' },
          { formula: '=ROUNDDOWN((G2+H2)/2,0)', say: 'Rounding down sends 4.5 to 4. The convention rounds halves up, so F = 4 and M = 5 give FM = 5.' },
          { formula: '=ROUND((F2+G2)/2,0)', say: 'F2 is the recency score. FM combines frequency (column G) and monetary value (column H); R stays on its own.' },
        ],
        hints: ['FM = (F + M) ÷ 2, rounded to a whole number.', '<x>=ROUND((G2+H2)/2,0)</x>, filled down.'],
      },
      {
        id: 'm06-seg-g1-s2', type: 'mc',
        prompt: 'A0051 has F = 2 and M = 4, so FM = 3; A0047 has F = 3 and M = 3, also FM = 3. What does the shared FM hide?',
        options: [
          'A0051 came less often but spent more per visit',
          'A0051 visited more recently than A0047, which FM records',
          'Nothing: two members with equal FM scores are interchangeable for targeting',
          'A0051 joined at Harbourside, which FM adjusts for by café',
        ],
        answer: 0,
        feedback: {
          1: 'Recency is the R score, kept separately; FM combines only frequency and spend.',
          2: 'Averaging two scores loses which one was high: a 2 and a 4 average to the same 3 as a 3 and a 3.',
          3: 'FM knows nothing about the café; scores are against all members, so Harbourside’s bigger tickets raise M.',
        },
        hints: ['FM is an average of two scores.', 'A low F with a high M means few visits but high spend.'],
      },
    ],
  },
  {
    id: 'm06-seg-g2', type: 'steps', kind: 'numerical',
    prompt: 'Column I now holds FM. Champions are members with R of at least 4 and FM of at least 4. Put the thresholds in cells so the formulas work for any block of the grid: M1 holds the lowest R and M2 the lowest FM.',
    solution: `<x>=COUNTIFS(F2:F${L},">="&M1,I2:I${L},">="&M2)</x> counts ${sampleChamps.length} Champions in this sample; <x>=SUMIFS(E2:E${L},F2:F${L},">="&M1,I2:I${L},">="&M2)/SUM(E2:E${L})</x> gives their share of the sample’s spend, ${pc(sum(sampleChamps.map((c) => c.monetary)) / sampleSpend)}. The sample has three members per segment, so its shares are not the base’s: all ${N.toLocaleString('en-US')} members give ${pc(SEG.Champions.spendShare)}.`,
    steps: [
      {
        id: 'm06-seg-g2-s1', type: 'formula',
        prompt: 'In M3, count the members with R at least M1 and FM at least M2.',
        sheet: { cells: { ...withFM, L1: 'R at least', M1: 4, L2: 'FM at least', M2: 4, L3: 'members' }, fixed: FIX, vary: { M1: [3, 5], M2: [3, 5] } }, cell: 'M3',
        answer: `=COUNTIFS(F2:F${L},">="&M1,I2:I${L},">="&M2)`,
        alt: [`=SUMPRODUCT((F2:F${L}>=M1)*(I2:I${L}>=M2))`],
        view: `A1:M${L}`, widths: W,
        wrong: [
          { formula: `=COUNTIFS(F2:F${L},">=4",I2:I${L},">=4")`, say: 'With 4 typed into the criteria the formula ignores M1 and M2. Join the operator to the cell: ">="&M1.' },
          { formula: `=COUNTIFS(F2:F${L},">"&M1,I2:I${L},">"&M2)`, say: '“At least 4” includes 4: use >=, not >.' },
          { formula: `=COUNTIF(F2:F${L},">="&M1)`, say: 'That counts members recent enough, whatever their FM. COUNTIFS takes both conditions.' },
        ],
        hints: ['COUNTIFS(range1, criterion1, range2, criterion2). A criterion can join an operator to a cell: ">="&M1.', `<x>=COUNTIFS(F2:F${L},">="&M1,I2:I${L},">="&M2)</x>.`],
      },
      {
        id: 'm06-seg-g2-s2', type: 'formula',
        prompt: 'In M4, calculate those members’ share of the sample’s total spend (column E).',
        sheet: { cells: { ...withFM, L1: 'R at least', M1: 4, L2: 'FM at least', M2: 4, L3: 'members', M3: `=COUNTIFS(F2:F${L},">="&M1,I2:I${L},">="&M2)`, L4: 'share of spend' }, fixed: FIX, vary: { M1: [3, 5], M2: [3, 5] } }, cell: 'M4',
        answer: `=SUMIFS(E2:E${L},F2:F${L},">="&M1,I2:I${L},">="&M2)/SUM(E2:E${L})`,
        alt: [`=SUMPRODUCT((F2:F${L}>=M1)*(I2:I${L}>=M2)*E2:E${L})/SUM(E2:E${L})`],
        view: `A1:M${L}`, formats: { M4: '0.0%' }, widths: W,
        wrong: [
          { formula: `=M3/COUNT(E2:E${L})`, say: 'That is their share of members. Share of spend adds their dollars with SUMIFS and divides by everyone’s spend.' },
          { formula: `=SUMIFS(E2:E${L},F2:F${L},">="&M1,I2:I${L},">="&M2)`, say: 'That is their total spend in dollars; divide by SUM(E2:E34) to make it a share.' },
          { formula: `=SUMIFS(E2:E${L},F2:F${L},">="&M1,I2:I${L},">="&M2)/M3`, say: 'Dividing by the number of members gives their mean spend, not a share of the total.' },
        ],
        hints: ['Share of spend = the segment’s spend ÷ everyone’s spend.', `<x>=SUMIFS(E2:E${L},F2:F${L},">="&M1,I2:I${L},">="&M2)/SUM(E2:E${L})</x>.`],
      },
      {
        id: 'm06-seg-g2-s3', type: 'mc',
        prompt: `Across all ${N.toLocaleString('en-US')} members, Champions are ${pc(SEG.Champions.share)} of members and ${pc(SEG.Champions.spendShare)} of spend. Why does this sample give different shares?`,
        options: [
          'It has three members per segment, so small segments count for too much',
          'Scores were recomputed within the 33 members, so their R, F and M differ from the base’s',
          'The sample covers a shorter window than the base, so its members’ spend is lower',
          'Shares of spend can only ever be computed on the whole base, never on any sample of it',
        ],
        answer: 0,
        feedback: {
          1: 'The scores in F to H are each member’s scores against all members; nothing was recomputed.',
          2: 'Every member’s spend runs from joining to 31 December, as in the base.',
          3: 'A random sample would estimate the base’s shares; this one was chosen to show every segment, not to represent the base.',
        },
        hints: ['How were the 33 members chosen?', 'Equal numbers per segment, whatever the segment’s size.'],
      },
    ],
  },
  {
    id: 'm06-seg-g3', type: 'steps', kind: 'numerical',
    prompt: `Ana scored the ${NO.toLocaleString('en-US')} members who had joined by 31 August as of 31 October 2027 and checked who visited in November–December: ${BACK} did. Of the ${NA.n} members in “Need attention”, ${NA.back} came back.`,
    solution: `Base rate ${BACK} ÷ ${NO} = ${pc(BASE)}. Need attention: ${NA.back} ÷ ${NA.n} = ${pc(NA.back / NA.n)}, lift ${pc(NA.back / NA.n)} ÷ ${pc(BASE)} = ${r2(NA.back / NA.n / BASE)}: below average, as the middle of the R scale would suggest.`,
    steps: [
      {
        id: 'm06-seg-g3-s1', type: 'num',
        prompt: 'What was the base rate, the share of all scored members who came back? Give a percentage to one decimal place.',
        answer: r1(BASE * 100), check: () => BACK / NO * 100, unit: '%', places: 1, tol: 0.05,
        wrong: [{ value: r1(NA.back / NA.n * 100), say: 'That is Need attention’s rate. The base rate is over all scored members.' }],
        hints: ['Base rate = returners ÷ members scored.', `${BACK} ÷ ${NO}.`],
      },
      {
        id: 'm06-seg-g3-s2', type: 'num',
        prompt: 'What was Need attention’s lift? Give two decimal places.',
        answer: r2(NA.back / NA.n / BASE), check: () => (NA.back / NA.n) / (BACK / NO), unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: r2(BASE / (NA.back / NA.n)), say: 'Upside down: lift is the segment’s rate divided by the base rate.' },
          { value: r1((NA.back / NA.n - BASE) * 100), say: 'That is the difference in points. Lift is a ratio: rate ÷ base rate.' },
        ],
        hints: ['Lift = segment rate ÷ base rate.', `(${NA.back} ÷ ${NA.n}) ÷ (${BACK} ÷ ${NO}).`],
      },
    ],
  },
  {
    id: 'm06-seg-g4', type: 'classify', kind: 'applied',
    prompt: 'Ana is planning the first quarter’s app messages. Which approach suits each segment, given what the 31 October check showed?',
    items: [
      `Champions: recent, frequent, high spend; ${pc(oseg('Champions').back / oseg('Champions').n, 0)} came back in November–December with no offer.`,
      'New customers: joined in the last few weeks, one or two visits.',
      `At risk: valuable once, last visit months ago; ${pc(AR.back / AR.n)} came back with no offer.`,
      'Lost: one or two visits, last visit about five months or more ago.',
      `Potential loyalists: recent, middling frequency and spend; ${pc(oseg('Potential loyalists').back / oseg('Potential loyalists').n, 0)} came back.`,
      `Can’t lose them: frequent and high-spending until they went quiet; ${oseg('Can’t lose them').back === 0 ? 'none' : oseg('Can’t lose them').back} of ${oseg('Can’t lose them').n} came back.`,
    ],
    categories: ['Thank and recognise, no discount', 'Nudge towards the next visit', 'One win-back test with a random holdout', 'Leave alone'],
    answer: [0, 1, 2, 3, 1, 2],
    feedback: {
      0: 'They come anyway: a discount would mostly subsidise visits Lantern already gets.',
      2: 'Past value makes a test worth its small cost, but their return rate without an offer is tiny, so measure the effect against a holdout rather than assume it.',
      3: 'Repeated messages to members who have gone cost attention and can lead to notifications being switched off.',
      5: 'None of 58 came back on its own, which suggests most are gone; their past value still justifies one small test, and a holdout is still needed to show whether any return is the message’s doing.',
    },
    hints: ['Who would come anyway? Who has little history yet? Who is valuable but quiet? Who is neither?', 'Discounts belong where they change behaviour; tests belong where the effect is unknown.'],
    solution: 'Champions: thanks and recognition. New customers and Potential loyalists: a reason for the next visit. At risk and Can’t lose them: one win-back message, with a random holdout to measure it. Lost: leave alone.',
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'm06-seg-i1', type: 'formula', kind: 'numerical',
    prompt: `Column J holds each member’s segment and column C their recency in days on 31 December 2027. In M2, calculate the mean recency of the segment named in M1.`,
    sheet: { cells: { ...withSeg, L1: 'segment', M1: 'At risk', L2: 'mean recency (days)' }, fixed: FIX, vary: { M1: ['Loyal', 'Hibernating', 'Champions'] } }, cell: 'M2',
    answer: `=AVERAGEIFS(C2:C${L},J2:J${L},M1)`,
    alt: [`=AVERAGEIF(J2:J${L},M1,C2:C${L})`, `=SUMIFS(C2:C${L},J2:J${L},M1)/COUNTIFS(J2:J${L},M1)`],
    view: `A1:M${L}`, formats: { M2: '0.0' }, widths: W,
    wrong: [
      { formula: `=AVERAGE(C2:C${L})`, say: 'That averages every member in the sheet, whatever M1 says. Average only the segment’s members.' },
      { formula: `=AVERAGEIFS(C2:C${L},J2:J${L},"At risk")`, say: 'With the name typed in, the formula ignores M1. Refer to M1.' },
      { formula: `=AVERAGEIFS(F2:F${L},J2:J${L},M1)`, say: 'Column F is the R score, not recency in days.' },
    ],
    solution: `<x>=AVERAGEIFS(C2:C${L},J2:J${L},M1)</x>. For the three At risk members, (${ROWS.filter((c) => c.segment === 'At risk').map((c) => c.recency).join(' + ')}) ÷ 3 = ${r1(sum(ROWS.filter((c) => c.segment === 'At risk').map((c) => c.recency)) / 3)} days. Across all members the At risk mean is ${r1(SEG['At risk'].meanRecency)} days.`,
  },
  {
    id: 'm06-seg-i2', type: 'num', kind: 'applied',
    prompt: `Corriebeck Garden Centre (fictional) plans a $${CG.c.toFixed(2)} voucher for ${CG.n} customers in its Potential loyalists segment, valid for one visit next month. In past months ${CG.p * 100}% of this segment came back without any voucher. A customer who comes back brings $${CG.v.toFixed(2)} of margin, and everyone who comes back will use the voucher. What uplift (extra return rate, in percentage points) does the voucher need to break even? Give one decimal place.`,
    answer: r1(cgU * 100), check: () => (CG.p * CG.c) / (CG.v - CG.c) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: r1(CG.c / CG.v * 100), say: 'That divides the voucher by the margin, as if only new returners redeemed it. The 30% who would come anyway redeem it too: break-even u = p × c ÷ (v − c).' },
      { value: r1(CG.p * CG.c / CG.v * 100), say: 'Extra returners also redeem the voucher, so each brings v − c, not v.' },
    ],
    solution: `The subsidy: ${CG.n} × ${CG.p} × $${CG.c.toFixed(2)} = $${(CG.n * CG.p * CG.c).toFixed(2)} on customers who would have come anyway. Each extra returner nets $${CG.v.toFixed(2)} − $${CG.c.toFixed(2)} = $${(CG.v - CG.c).toFixed(2)}. Break-even: u = ${CG.p} × ${CG.c.toFixed(2)} ÷ ${(CG.v - CG.c).toFixed(2)} = ${r3(cgU)}, about ${r1(cgU * 100)} points (${(CG.n * cgU).toFixed(1)} extra customers). Only a random holdout will show whether the voucher achieves it.`,
  },
  {
    id: 'm06-seg-i3', type: 'mc', kind: 'conceptual',
    prompt: 'On 31 October two Lantern members had each been away for 80 days. One had visited twice since joining; the other 15 times. Which was more likely to come back in November–December, and why?',
    options: [
      'The twice-visitor, because 80 silent days says more about a frequent visitor',
      'The 15-times visitor: frequent customers are the most loyal, so a gap of 80 days is temporary',
      'Neither: at the same recency the chance is the same, since recency is the strongest sign of activity',
      'The 15-times visitor, because a higher FM puts them in the Loyal segment',
    ],
    answer: 0,
    feedback: {
      1: `Past frequency describes behaviour while they were coming; once they stop, it makes silence more telling. Among members 61–90 days quiet, ${pc(Q_HEAVY.rate, 0)} of those with seven or more visits came back.`,
      2: 'Recency is the strongest single sign, but at the same recency frequency still matters, in the opposite direction to intuition.',
      3: `On 31 October Loyal (R = 3, FM 4–5) came back at ${pc(oseg('Loyal').back / oseg('Loyal').n)}, against a base rate of ${pc(BASE)}. The name was the problem.`,
    },
    solution: `The twice-visitor. Among members whose last visit was 61–90 days before 31 October, ${pc(Q_LIGHT.rate, 0)} of those with one or two visits came back, against ${pc(Q_HEAVY.rate, 0)} with seven or more: the increasing frequency paradox.`,
  },
  {
    id: 'm06-seg-i4', type: 'num', kind: 'numerical',
    prompt: `On 31 December 2027, ${SEG['Can’t lose them'].n} of Lantern’s ${N.toLocaleString('en-US')} members were in Can’t lose them, with $${SEG['Can’t lose them'].spend.toFixed(2)} of the $${SPEND.toFixed(2)} all members had spent. How many times their share of members is their share of spend? Give two decimal places.`,
    answer: r2(SEG['Can’t lose them'].spendShare / SEG['Can’t lose them'].share),
    check: () => (SEG['Can’t lose them'].spend / SPEND) / (SEG['Can’t lose them'].n / N), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(SEG['Can’t lose them'].share / SEG['Can’t lose them'].spendShare), say: 'Upside down: share of spend ÷ share of members.' },
      { value: r1(SEG['Can’t lose them'].spendShare * 100), say: 'That is the share of spend. Divide it by the share of members.' },
    ],
    solution: `Share of spend ${pc(SEG['Can’t lose them'].spendShare)}; share of members ${SEG['Can’t lose them'].n} ÷ ${N} = ${pc(SEG['Can’t lose them'].share)}; ratio ${r2(SEG['Can’t lose them'].spendShare / SEG['Can’t lose them'].share)}. Equivalently, their mean spend ($${SEG['Can’t lose them'].meanSpend.toFixed(2)}) ÷ the mean for all members ($${(SPEND / N).toFixed(2)}).`,
  },
  {
    id: 'm06-seg-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are genuine limits of RFM segments? Select all that apply.',
    options: [
      'They summarise past behaviour and say nothing about why customers behave as they do',
      'A customer’s segment can change even if they do nothing, because cut points move as other customers buy',
      'They can’t be computed without a customer survey',
      'Differences between segments are associations: they don’t show what an offer would change',
      'Members chosen for low scores can improve on their own, so a win-back campaign needs a holdout',
      'They only work for contractual businesses with subscriptions',
    ],
    answer: [0, 1, 3, 4],
    feedback: {
      2: 'RFM needs only transaction records; that is its strength over needs-based segmentation, which needs a survey.',
      5: 'RFM is used mostly in noncontractual settings (shops, cafés, catalogues), where recency is the main sign a customer is still active.',
    },
    solution: 'Backward-looking and silent on why; relative and dated; associations, not causes; open to regression to the mean. RFM needs only transactions, and it suits noncontractual settings especially.',
  },
];

// ---------------------------------------------------------------- knowledge check
const cells = [[5, 5], [3, 4], [1, 5], [2, 3], [5, 1], [1, 1], [4, 3], [3, 2]];
const CATS = ['Champions', 'Loyal', 'Potential loyalists', 'New customers', 'About to sleep', 'At risk', 'Can’t lose them', 'Lost'];

export const check = [
  {
    id: 'm06-seg-k1', type: 'classify', kind: 'conceptual',
    prompt: 'Using this lesson’s naming of the R × FM grid, which segment is each (R, FM) cell in?',
    items: cells.map(([r, f]) => `R = ${r}, FM = ${f}`),
    categories: CATS,
    answer: cells.map(([r, f]) => CATS.indexOf(CU.segmentOf(r, f))),
    feedback: { 1: 'R = 3 with FM 4–5 is Loyal: valuable but drifting.', 3: 'R 1–2 with FM 3–4 is At risk; FM = 5 would be Can’t lose them.', 4: 'R = 5 with FM 1–2: recent but little history, New customers.', 6: 'R 4–5 with FM = 3 is Potential loyalists.', 7: 'R = 3 with FM 1–2 is About to sleep.' },
    solution: cells.map(([r, f]) => `(${r}, ${f}) ${CU.segmentOf(r, f)}`).join('; ') + '.',
  },
  {
    id: 'm06-seg-k2', type: 'num', kind: 'numerical',
    prompt: `In the 31 October check, ${AR.back} of the ${AR.n} At risk members came back in November–December; ${BACK} of all ${NO.toLocaleString('en-US')} scored members did. What was At risk’s lift? Give two decimal places.`,
    answer: r2(AR.back / AR.n / BASE), check: () => (AR.back / AR.n) / (BACK / NO), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: r2(BASE / (AR.back / AR.n)), say: 'Upside down: the segment’s rate goes on top.' },
      { value: r1(AR.back / AR.n * 100), say: 'That is At risk’s return rate in percent. Lift divides it by the base rate.' },
    ],
    solution: `At risk ${AR.back} ÷ ${AR.n} = ${pc(AR.back / AR.n)}; base rate ${BACK} ÷ ${NO} = ${pc(BASE)}; lift ${r2(AR.back / AR.n / BASE)}. At risk members came back at about a fourteenth of the average rate.`,
  },
  {
    id: 'm06-seg-k3', type: 'mc', kind: 'applied',
    prompt: 'Askerby Cinemas (fictional) emailed a half-price ticket to all 3,000 members of its “Lost” RFM segment. Six weeks later 4% had bought a ticket, and the marketing team reports that the campaign “reactivated 120 lost customers”. What is the best response?',
    options: [
      'Ask how many would have bought anyway: without a random holdout the 120 can’t be credited',
      'Accept the figure: Lost members had stopped buying, so every one of the purchases must be the email’s doing',
      'Accept it but halve it, because half-price tickets bring in half the revenue of a full-price ticket',
      'Reject it: RFM segments can’t be used for email campaigns because scores are relative',
    ],
    answer: 0,
    feedback: {
      1: `Some low scorers come back on their own (regression to the mean): ${pc(oseg('Lost').back / oseg('Lost').n)} of Lantern’s Lost members returned with no campaign at all.`,
      2: 'Revenue per ticket is a separate question; the count of returners itself isn’t the campaign’s effect until a comparison group shows the baseline.',
      3: 'Relative scores are fine for choosing whom to email; the problem is measuring what the email did.',
    },
    solution: 'The campaign’s effect is the difference between the emailed group’s purchase rate and that of a comparable group that got nothing, ideally a random holdout. Selected for low scores, some members would have returned anyway.',
  },
  {
    id: 'm06-seg-k4', type: 'formula', kind: 'numerical',
    prompt: 'Column J holds each member’s segment and column E their total spend since joining. In M2, calculate the segment named in M1’s share of the total spend in the sheet.',
    sheet: { cells: { ...withSeg, L1: 'segment', M1: 'Loyal', L2: 'share of spend' }, fixed: FIX, vary: { M1: ['At risk', 'Lost', 'Champions'] } }, cell: 'M2',
    answer: `=SUMIFS(E2:E${L},J2:J${L},M1)/SUM(E2:E${L})`,
    alt: [`=SUMIF(J2:J${L},M1,E2:E${L})/SUM(E2:E${L})`],
    view: `A1:M${L}`, formats: { M2: '0.0%' }, widths: W,
    wrong: [
      { formula: `=COUNTIFS(J2:J${L},M1)/COUNTA(J2:J${L})`, say: 'That is the segment’s share of members. Share of spend adds its spend with SUMIFS.' },
      { formula: `=SUMIFS(E2:E${L},J2:J${L},M1)/COUNTIFS(J2:J${L},M1)`, say: 'That is the segment’s mean spend per member. A share divides by the total spend.' },
    ],
    solution: `<x>=SUMIFS(E2:E${L},J2:J${L},M1)/SUM(E2:E${L})</x>. For Loyal in this sample: (${ROWS.filter((c) => c.segment === 'Loyal').map((c) => c.monetary).join(' + ')}) ÷ ${sampleSpend.toFixed(2)} = ${pc(sum(ROWS.filter((c) => c.segment === 'Loyal').map((c) => c.monetary)) / sampleSpend)}.`,
  },
  {
    id: 'm06-seg-k5', type: 'mc', kind: 'conceptual',
    prompt: 'How do Lantern’s RFM segments differ from the needs-based segments of M05?',
    options: [
      'RFM groups customers by what they have done; needs segments group people by what they want',
      'RFM groups people by what they want from coffee; needs segments group them by how recently they bought',
      'They are the same segments measured two ways, so a member’s RFM segment tells you their needs segment',
      'Needs segments are based on transactions, RFM segments on a survey of importance ratings',
    ],
    answer: 0,
    feedback: {
      1: 'The other way round: RFM is behaviour, needs segmentation is about wants.',
      2: 'They answer different questions; a Champion could be in any needs segment. Cross-tabulating the two, where members answered the survey, shows how they relate.',
      3: 'Reversed: RFM uses transactions; needs segments came from a survey.',
    },
    solution: 'RFM is behavioural segmentation from transaction records: cheap, complete for customers, updated daily, silent on why and blind to non-customers. Needs-based segmentation explains why and reaches the wider market, but needs a survey and a typing tool. Use RFM to decide whom to contact, needs to decide what to say.',
  },
  {
    id: 'm06-seg-k6', type: 'mc', kind: 'applied',
    prompt: `In the 31 October check, Promising (R = 4, FM 1–2) came back at ${pc(PR.back / PR.n)} and About to sleep (R = 3, FM 1–2) at ${pc(AS.back / AS.n)}. Ana can afford to test one free-pastry offer (fictional cost $1.10 a pastry), redeemed by every member of the segment who visits in the next two months. Assuming the offer would lift both segments’ return rates by the same few points, which segment should she test it on first, and what must the test include?`,
    options: [
      'About to sleep, with a random holdout: Promising members are already likely to come back, so pastries to them pay mostly for visits that would happen anyway',
      'Promising, with no holdout needed: their higher return rate proves offers work on them',
      'About to sleep, with no holdout needed: any member who comes back after the offer was won back by it',
      'Promising, because a higher return rate means a higher lift, which is what a campaign maximises',
    ],
    answer: 0,
    feedback: {
      1: 'Their return rate was measured with no offer at all; it says nothing about offers. And pastries redeemed by likely returners are a subsidy.',
      2: `${pc(AS.back / AS.n)} came back with nothing sent; without a holdout those returns would be credited to the offer.`,
      3: 'Lift describes who comes back without a campaign. A campaign should maximise the extra returns it causes, net of costs.',
    },
    solution: 'With the same uplift and a cost paid on every redemption, the segment with the lower natural return rate wastes less on members who would come anyway. Either way, a random holdout is the only way to measure the uplift.',
  },
];
