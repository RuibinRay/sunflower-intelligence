// scatterplots.ex.js — B05 · Scatterplots: widgets, practice and the knowledge check (answer keys live here). Café
// data come from case.js (the corrected log, and the raw log for the footfall slip); Kestrel Bikes, Fairhaven Hotel and
// Pemberton Cinema are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items
// recompute their answers in `check`.
import { column, CLEAN_ROWS, CAFE_ROWS, CAFE_COLUMNS, SLIP, DERIVED as D } from './case.js?v=22';
import * as C from '../../../core/correlation.js?v=22';
import { mean } from '../../../core/stats.js?v=22';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const sgn = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
const slice = (rows, cafe, from, to) => rows.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const pick = (rows, name) => rows.map((r) => r[at(name)]);
const r3 = (x) => Math.round(x * 1000) / 1000;

// ---------------------------------------------------------------- widgets' data
const CAFE = column('cafe'), LABEL = CLEAN_ROWS.map((r) => `${dayLabel(r[at('date')])}, ${r[at('cafe')]}`);
const mRaw = CAFE_ROWS.filter((r) => r[at('cafe')] === 'Millbrook');
const STAFF = column('peak_staff_hours'), TRANS = column('transactions');
const staffR = C.pearson(STAFF, TRANS).r;
const POS = {}; STAFF.forEach((s, i) => { const k = `${s}|${TRANS[i]}`; POS[k] = (POS[k] || 0) + 1; });
const STACKED = Object.values(POS).filter((c) => c > 1).reduce((s, c) => s + c, 0);

// ---------------------------------------------------------------- exercise data
// Harbourside, 20 May – 4 June: two festival days inside
const FEST = slice(CLEAN_ROWS, 'Harbourside', '2027-05-20', '2027-06-04');
const festIdx = FEST.map((r, i) => (r[at('festival')] === 1 ? i : -1)).filter((i) => i >= 0);
const festR = C.pearson(pick(FEST, 'footfall'), pick(FEST, 'transactions')).r;
const festR0 = C.pearson(pick(FEST.filter((r) => !r[at('festival')]), 'footfall'), pick(FEST.filter((r) => !r[at('festival')]), 'transactions')).r;
const festSheet = { cells: { A1: 'Date', B1: 'Footfall', C1: 'Transactions', ...col('A', 2, FEST.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, pick(FEST, 'footfall')), ...col('C', 2, pick(FEST, 'transactions')), E1: 'r' } };
// Millbrook, 6–19 September as typed (the slip on the 14th)
const SEPT = slice(CAFE_ROWS, 'Millbrook', '2027-09-06', '2027-09-19');
const slipIdx = SEPT.findIndex((r) => r[at('date')] === SLIP.date);
const septR = C.pearson(pick(SEPT, 'footfall'), pick(SEPT, 'transactions')).r;
const septClean = slice(CLEAN_ROWS, 'Millbrook', '2027-09-06', '2027-09-19');
const septCleanR = C.pearson(pick(septClean, 'footfall'), pick(septClean, 'transactions')).r;
// Harbourside, October: rain and footfall
const OCT = slice(CLEAN_ROWS, 'Harbourside', '2027-10-01', '2027-10-31');
const octR = C.pearson(pick(OCT, 'rain_in'), pick(OCT, 'footfall')).r;
const octDry = pick(OCT, 'rain_in').filter((v) => v === 0).length;
const octSheet = { cells: { A1: 'Date', B1: 'Rain (in)', C1: 'Footfall', ...col('A', 2, OCT.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, pick(OCT, 'rain_in')), ...col('C', 2, pick(OCT, 'footfall')), E1: 'r' } };
// Millbrook, 1–24 May: the high and hot drinks
const MAY = slice(CLEAN_ROWS, 'Millbrook', '2027-05-01', '2027-05-24');
const mayR = C.pearson(pick(MAY, 'high_f'), pick(MAY, 'hot_drinks')).r;
const maySheet = { cells: { A1: 'Date', B1: 'High (°F)', C1: 'Hot drinks', ...col('A', 2, MAY.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, pick(MAY, 'high_f')), ...col('C', 2, pick(MAY, 'hot_drinks')), E1: 'r' } };
// iced-share bands (as the lesson's applied example)
const HIGH = column('high_f'), ICED = column('iced_share');
const band = (lo, hi) => mean(ICED.filter((_, i) => HIGH[i] >= lo && HIGH[i] < hi)) * 100;
const B60 = band(60, 70), B70 = band(70, 80);
const bandTable = { head: ['High (°F)', 'Average iced share'], rows: [[25, 40], [40, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 100]].map(([lo, hi]) => [`${lo}–${hi - 1}`, `${band(lo, hi).toFixed(0)}%`]), align: ['l', 'r'] };
// Kestrel Bikes (fictional): ten days' high and bike rentals
const KT = [52, 61, 58, 70, 66, 75, 49, 63, 72, 68], KR = [21, 30, 26, 41, 30, 45, 24, 28, 38, 43];
const kQuad = () => { const mt = mean(KT), mr = mean(KR); return KT.filter((v, i) => (v - mt) * (KR[i] - mr) > 0).length; };
// Harbourside members against the high
const memR = C.pearson(column('high_f', { cafe: 'Harbourside' }), column('loyalty_members', { cafe: 'Harbourside' })).r;

export const widgets = {
  'sct-iced': {
    type: 'scatter',
    title: 'Iced share of drinks against the day’s high, both cafés, 1 March – 31 December 2027',
    x: { name: 'Day’s high', values: HIGH, unit: '°F' },
    y: { name: 'Iced share of drinks', values: ICED },
    group: { name: 'Café', values: CAFE }, labels: LABEL,
    show: ['pearson', 'spearman', 'r2'], toggles: ['group', 'line'],
    note: `r = ${fx(D.tempIced.r, 3)} and Spearman’s ρ = ${fx(D.tempIcedRho.rho, 3)} for the 612 café-days. The least-squares line is a drawing aid here: it runs below the points on the coldest days (where it predicts a negative share), above them in the 50s and 60s, below them in the 70s and 80s and above them again in the 90s, because the band is an S-curve. Spearman’s ρ, which the rank-correlation lesson explains, only asks whether the points always rise, so the curve doesn’t lower it.`,
  },
  'sct-sales': {
    type: 'scatter',
    title: 'Sales against transactions, both cafés',
    x: { name: 'Transactions', values: TRANS },
    y: { name: 'Sales', values: column('sales'), unit: '$' },
    group: { name: 'Café', values: CAFE }, labels: LABEL,
    show: ['pearson', 'spearman'], toggles: ['group', 'line'],
    note: `Pooled, r = ${fx(D.transSales.r, 3)}. Coloured by café the plot splits into two bands, each close to a straight line (r = ${fx(C.pearson(column('transactions', { cafe: 'Harbourside' }), column('sales', { cafe: 'Harbourside' })).r, 3)} at Harbourside and ${fx(C.pearson(column('transactions', { cafe: 'Millbrook' }), column('sales', { cafe: 'Millbrook' })).r, 3)} at Millbrook): Harbourside’s average ticket is about $${fx(D.meanTicketH)}, Millbrook’s about $${fx(D.meanTicketM)}. The five far-right points are Harbourside’s festival days, on its band.`,
  },
  'sct-slip': {
    type: 'scatter',
    title: 'Millbrook: footfall against transactions as recorded (with the 14 September slip)',
    x: { name: 'Footfall (as recorded)', values: pick(mRaw, 'footfall') },
    y: { name: 'Transactions', values: pick(mRaw, 'transactions') },
    labels: mRaw.map((r) => dayLabel(r[at('date')])),
    show: ['pearson', 'spearman'], toggles: ['line'], exclude: 3,
    note: `As typed, r = ${fx(C.pearson(pick(mRaw, 'footfall'), pick(mRaw, 'transactions')).r, 3)}. Leave out the point on the far right (14 September, footfall ${SLIP.recorded.toLocaleString('en-US')}, true value ${SLIP.actual}) and r becomes ${fx(C.pearson(column('footfall', { cafe: 'Millbrook' }), column('transactions', { cafe: 'Millbrook' })).r, 3)}. Spearman’s ρ is ${fx(C.spearman(pick(mRaw, 'footfall'), pick(mRaw, 'transactions')).rho, 3)} with the slip: a rank can only be “largest”, however wrong the number. The outliers-and-influence lesson takes this further.`,
  },
  'sct-jitter': {
    type: 'scatter',
    title: 'Transactions against peak barista hours, both cafés (drawn with jitter)',
    x: { name: 'Peak barista hours', values: STAFF, unit: 'hours' }, jitter: { x: 0.2 },
    y: { name: 'Transactions', values: TRANS },
    group: { name: 'Café', values: CAFE }, labels: CLEAN_ROWS.map((r, i) => `${LABEL[i]}: ${STAFF[i]} hours rostered`),
    show: ['pearson'], toggles: ['group'],
    note: `Hours are rostered in half-hour steps, so without jitter the points would stand in ${new Set(STAFF).size} columns. Each point is drawn up to 0.2 hours either side of its rostered hours; the markers are opaque, so the jitter, not transparency, is what separates stacked days. r = ${fx(staffR, 3)} is computed from the recorded hours. More hours go with more transactions because the manager rosters more baristas on days she expects to be busy.`,
  },
};

export const guided = [
  {
    id: 'b05-sct-g1', type: 'classify', kind: 'conceptual',
    prompt: 'For each pair of measures from the café log, say which one belongs on the x-axis of a scatterplot, or whether it doesn’t matter.',
    items: [
      'The day’s high temperature; iced drinks made that day',
      'Transactions at the till; footfall through the door',
      'Hot drinks made; iced drinks made, at the same café on the same day',
      'The day’s sales; the rain that fell that day',
      'Harbourside’s footfall; Millbrook’s footfall on the same day',
      'Peak wait in minutes; peak barista hours rostered the week before',
    ],
    categories: ['The first one on x', 'The second one on x', 'Either way round'],
    answer: [0, 1, 2, 1, 2, 1],
    hints: ['Put on x the variable that is known first or that you think helps explain the other.', 'Weather and rosters are set before the day’s customers arrive; drinks, transactions and sales follow.'],
    feedback: {
      2: 'Both are made during the same day and neither comes first: either layout is fine.',
      4: 'Neither café’s footfall explains the other’s; both respond to the same day. Either way round.',
      5: 'The roster is set before the day, and the wait is what you want to understand: hours on x.',
    },
    solution: 'The explanatory variable (known first, or the candidate guide) goes on x and the response on y: temperature before iced drinks, footfall before transactions, rain before sales, the roster before the wait. When neither comes first, as with two kinds of drink or two cafés on one day, either layout works. Whatever the layout, Pearson’s r is the same.',
  },
  {
    id: 'b05-sct-g2', type: 'steps', kind: 'applied',
    prompt: 'Harbourside’s footfall and transactions for 16 days around the end of May. Look for unusual points, decide what they are, and calculate the correlation.',
    solution: `The two festival days (29 and 30 May) have far more people and far more transactions than any other day, but they sit on the same straight band: unusual in both variables, not errors. With them r = ${fx(festR, 3)}; without them r = ${fx(festR0, 3)}. They lengthen the range, which pushes r up a little, but the relationship is strong either way. Report them as real days and say they are there.`,
    steps: [
      {
        id: 'b05-sct-g2-s1', type: 'rows', kind: 'conceptual',
        prompt: 'Select the days that lie far from the rest.',
        data: { table: { head: ['Date', 'Footfall', 'Transactions'], rows: FEST.map((r) => [dayLabel(r[at('date')]), String(r[at('footfall')]), String(r[at('transactions')])]), align: ['l', 'r', 'r'], index: { col: 0 } } },
        answer: festIdx,
        hints: ['Most days have footfall between about 50 and 250.', 'Two consecutive days are more than twice as busy as any other.'],
        solution: '29 and 30 May (footfall 620 and 502) are far beyond the other 14 days, the largest of which has 232.',
      },
      {
        id: 'b05-sct-g2-s2', type: 'mc', kind: 'conceptual',
        prompt: 'Their transactions (293 and 243) are as high as their footfall would lead you to expect. What are these two points most likely to be?',
        options: [
          'Real busy days, extreme in both variables but on the pattern; check the calendar and keep them.',
          'Data-entry errors, because no ordinary day comes close; delete them before calculating r.',
          'Points that break the pattern, since anything that far out must distort the correlation.',
          'Proof that footfall causes transactions, because both of them rose together so sharply on the same two days.',
        ],
        answer: 0,
        hints: ['Ask whether each point lies on the band the other days form, not only whether it is far away.'],
        feedback: {
          1: 'Being extreme is a reason to check, not proof of an error. Both measures rose together, which is what a real busy day looks like (they were the harbour festival).',
          2: 'A point far out along the same band follows the pattern. The slip at Millbrook breaks it: huge footfall, ordinary transactions.',
          3: 'Two days moving together is association, not proof of cause; and the question is what the points are.',
        },
        solution: 'They are the harbour-festival days: real, extreme in both footfall and transactions, and on the band. Keep them, and mention them.',
      },
      {
        id: 'b05-sct-g2-s3', type: 'formula', kind: 'numerical',
        prompt: 'In E2, calculate Pearson’s correlation between footfall (B2:B17) and transactions (C2:C17).',
        sheet: festSheet, cell: 'E2', answer: '=CORREL(B2:B17,C2:C17)',
        alt: ['=CORREL(C2:C17,B2:B17)', '=PEARSON(B2:B17,C2:C17)', '=PEARSON(C2:C17,B2:B17)'],
        view: 'A1:E17', formats: { E2: '0.000' }, widths: { A: 10 },
        wrong: [
          { formula: '=RSQ(C2:C17,B2:B17)', say: 'RSQ returns r², the square of the correlation. Use CORREL (or PEARSON) for r.' },
          { formula: '=COVARIANCE.S(B2:B17,C2:C17)', say: 'That is the covariance, in people × transactions; the next lesson shows how r rescales it. CORREL gives r directly.' },
        ],
        hints: ['CORREL(array1, array2) takes the two columns in either order.'],
        solution: `<x>=CORREL(B2:B17,C2:C17)</x> = ${fx(festR, 3)}. The order of the ranges doesn’t matter: correlation is symmetric.`,
      },
    ],
  },
  {
    id: 'b05-sct-g3', type: 'mc', kind: 'applied',
    prompt: `Ana plots transactions against peak barista hours for all 612 café-days. Hours are rostered in half-hours, so the points stand in ${new Set(STAFF).size} columns and ${STACKED} of them sit exactly on top of another point. What is the best way to make the plot honest?`,
    options: [
      'Jitter by under a quarter-hour for drawing, use see-through markers, and compute r on recorded hours.',
      'Nudge each point sideways by up to an hour so the columns merge into one cloud, then calculate r from the nudged positions.',
      'Keep only one point for each position so that each mark on the chart stands for exactly one café-day.',
      'Round transactions to the nearest ten so that the columns line up neatly into a grid of tidy squares.',
    ],
    answer: 0,
    hints: ['The aim is to see how many points are in each place without changing any statistic.', 'A nudge must be less than half the gap between recorded values, either way.'],
    feedback: {
      1: 'A nudge as big as the step blurs real differences between rostered hours, and statistics must use the recorded values, never the jittered ones.',
      2: 'Dropping duplicates hides exactly what overplotting already hides: how many days share a position.',
      3: 'Rounding makes more points overlap, not fewer, and throws information away.',
    },
    solution: 'Jitter by less than half the step (here at most a quarter of an hour, so a nudge of up to 0.2 hours) and make markers partly transparent so stacks show as darker clumps. Plot each café on its own panel if they differ. Jitter is for the picture only: r and every other statistic come from the recorded values.',
  },
  {
    id: 'b05-sct-g4', type: 'mc', kind: 'conceptual',
    prompt: `Plotted against the day’s high, Harbourside’s loyalty-app members form a hairpin: the points rise to the right from March to July and fall to the left from August to December. Over the whole year r = ${sgn(memR)}. What explains the shape?`,
    options: [
      'Members grow all year while temperature rises then falls, so the scatter traces two trends; it has lost the days’ order.',
      'Warm weather brings new members in the spring and drives them away in the autumn, so the true effect of temperature changes with the season.',
      `The overall r of ${sgn(memR)} shows that temperature has almost no relationship with members, so the hairpin is random noise in the data.`,
      'The members count must contain errors, because a cumulative count cannot form two branches when it is plotted against temperature.',
    ],
    answer: 0,
    hints: ['Members is a running total since opening. What happens to a running total as the year goes on?', 'Try colouring each point by its month.'],
    feedback: {
      1: 'Nothing in the data shows the weather changing anyone’s mind. Both series follow the calendar, and the scatter mixes the two halves of the year.',
      2: 'The hairpin is far from random: each branch is a strong trend. The single r over the year describes neither branch.',
      3: 'A cumulative count only rises; plotted against a temperature that rises and then falls, it naturally makes two branches.',
    },
    solution: `A scatterplot throws away time order. Members only rise; temperature rises to July and then falls. So as the days go by, points move up and right, then up and left: a hairpin. The year’s r, ${sgn(memR)}, describes neither branch (each is strong: ${fx(D.membersTempSpring)} and ${sgn(D.membersTempAutumn)}). Colour by month or connect the points in date order to see this. The correlation-and-causation lesson treats such common trends.`,
  },
];

export const independent = [
  {
    id: 'b05-sct-i1', type: 'rows', kind: 'applied',
    prompt: 'Millbrook’s footfall and transactions as the manager typed them for two weeks in September. Select the day whose point would break the pattern of a scatterplot.',
    data: { table: { head: ['Date', 'Weekday', 'Footfall', 'Transactions'], rows: SEPT.map((r) => [dayLabel(r[at('date')]), r[at('weekday')], String(r[at('footfall')]), String(r[at('transactions')])]), align: ['l', 'l', 'r', 'r'], index: { col: 0 } } },
    answer: [slipIdx],
    solution: `14 September: footfall ${SLIP.recorded.toLocaleString('en-US')} with ${SEPT[slipIdx][at('transactions')]} transactions, an ordinary Tuesday’s takings with far more visitors than Millbrook ever had on any day. It breaks the pattern, and the extra digit gives it away (the counter’s record says ${SLIP.actual}). Weekends (11–12 and 18–19 September) have low footfall and low transactions together: they are on the pattern. Over these 14 days r is ${fx(septR, 3)} as typed and ${fx(septCleanR, 3)} corrected.`,
  },
  {
    id: 'b05-sct-i2', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside’s daily rain (B2:B32) and footfall (C2:C32) for October. In E2, calculate the correlation between them.',
    sheet: octSheet, cell: 'E2', answer: '=CORREL(B2:B32,C2:C32)',
    alt: ['=CORREL(C2:C32,B2:B32)', '=PEARSON(B2:B32,C2:C32)', '=PEARSON(C2:C32,B2:B32)'],
    view: 'A1:E32', maxHeight: '20rem', formats: { E2: '0.000' }, widths: { A: 10 },
    wrong: [
      { formula: '=RSQ(C2:C32,B2:B32)', say: 'RSQ is r², always positive. CORREL keeps the sign, which here is the point.' },
    ],
    solution: `<x>=CORREL(B2:B32,C2:C32)</x> = ${sgn(octR, 3)}. Plotted, ${octDry} of the 31 points stand in a column at zero rain, with the wet days spread to the right of it: most of the plot says nothing about rain at all. The rank-correlation lesson deals with a variable that is zero on most days.`,
  },
  {
    id: 'b05-sct-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Fairhaven Hotel (fictional) records each room’s thermostat setting and the guest’s comfort complaints over a month. The correlation is 0.02. The scatterplot shows many complaints at the coolest settings, few in the middle and many again at the warmest. What should the manager conclude?',
    options: [
      'There is a strong relationship, U-shaped; r near 0 only says there is no straight-line trend.',
      'There is no relationship between thermostat setting and complaints, because r is almost exactly 0.',
      'There is a weak positive relationship, because r is above 0 and complaints rise at the warm end.',
      'The data must be wrong, because a strong pattern always gives a correlation far from 0.',
    ],
    answer: 0,
    feedback: {
      1: 'r measures straight-line association only. A U-shape rises on one side and falls on the other, and the two cancel.',
      2: 'The rise at the warm end is matched by a fall at the cool end; r near 0 reflects that cancellation, not a weak link.',
      3: 'A U-shape is a strong relationship with near-zero r. Nothing is wrong with the data.',
    },
    solution: 'Pearson’s r measures how well a straight line fits. A U-shape has a strong link (complaints depend a lot on the setting) but no overall straight-line trend, so r ≈ 0. The plot, not r, shows the right summary: complaints are lowest at middling settings.',
  },
  {
    id: 'b05-sct-i4', type: 'multi', kind: 'applied',
    prompt: 'Ana is preparing one scatterplot of iced share against the day’s high for all 612 café-days, for a meeting with both managers. Select all the choices that make the plot more honest and readable.',
    options: [
      'Draw the markers partly transparent, so that temperatures with many days look darker.',
      'Plot the two cafés on side-by-side panels with the same axes, or colour the points by café.',
      'Put the day’s high on the x-axis and the iced share on the y-axis.',
      'Fit a straight line and show only the line, since 612 points are too many to read.',
      'Leave out the five festival days because they are unusual.',
      'Calculate the correlation from temperatures jittered for the plot, so the number matches the picture.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A straight line hides the S-shape that the managers need to see.',
      4: 'The festival days are real and on the pattern; there is no reason to drop them.',
      5: 'Statistics come from the recorded values; jitter is made-up noise for drawing.',
    },
    solution: 'Transparency shows where days pile up; panels or colours by café separate the groups; temperature (known first) goes on x. A line alone would hide the curve, dropping real days distorts the picture, and statistics must use recorded values.',
  },
  {
    id: 'b05-sct-i5', type: 'fill', kind: 'conceptual',
    prompt: 'The table gives the average iced share in each band of the day’s high, for all 612 café-days. Complete the description of the scatterplot.',
    data: { table: bandTable },
    text: 'The association is [[0]]. The form is [[1]]: nearly flat in the cold, steep between about 50°F and 80°F, and [[2]] above 80°F. With r = 0.94 the relationship is [[3]].',
    blanks: [
      { options: ['positive', 'negative', 'absent'], answer: 0 },
      { options: ['a straight line', 'an S-shaped curve', 'a U-shape'], answer: 1 },
      { options: ['rising faster', 'levelling off', 'falling again'], answer: 1 },
      { options: ['weak', 'moderate', 'strong'], answer: 2 },
    ],
    solution: 'Higher temperatures go with a larger iced share (positive). The band averages rise slowly, then fast, then slowly: an S-curve that levels off near 80% above 80°F. r = 0.94 says the points stay close to a steadily rising pattern, so the link is strong, but not that it is straight.',
  },
  {
    id: 'b05-sct-i6', type: 'num', kind: 'numerical',
    prompt: `Kestrel Bikes (fictional) recorded the day’s high (°F) and bike rentals on ten days: highs ${KT.join(', ')}; rentals ${KR.join(', ')} (in the same order). Draw vertical and horizontal lines through the two means. How many of the ten points lie in the upper-right or lower-left quarter of the plot?`,
    answer: kQuad(), check: kQuad, unit: 'points', places: 0, tol: 0,
    wrong: [
      { value: 10 - kQuad(), say: 'Those are the points in the upper-left and lower-right quarters, where one value is above its mean and the other below.' },
    ],
    solution: `The means are ${fx(mean(KT), 1)}°F and ${fx(mean(KR), 1)} rentals. A point is upper-right when both values are above their means and lower-left when both are below. ${kQuad()} of the 10 points are, so most points agree in direction: a positive association (r = ${fx(C.pearson(KT, KR).r, 2)}). The covariance-and-pearson lesson turns this count into a number by multiplying each point’s two deviations.`,
  },
];

export const check = [
  {
    id: 'b05-sct-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Two datasets have exactly the same correlation, r = 0.82. What can you conclude about their scatterplots?',
    options: [
      'Very little: one may be a straight band, another a curve or a line spoiled by one point.',
      'They look alike, because the correlation fixes the shape and spread of the cloud of points.',
      'Both are straight-line relationships of the same strength, so either plot can stand in for the other.',
      'Both have no outliers, because an outlier would always push r well away from 0.82.',
    ],
    answer: 0,
    feedback: {
      1: 'Anscombe’s quartet shares r = 0.82 across a straight band, a curve, an outlier and a single influential point.',
      2: 'r doesn’t check that the relationship is straight; Anscombe’s set 2 is a curve with r = 0.82.',
      3: 'Outliers can raise or lower r, and can leave it at any value; set 3 of the quartet has one.',
    },
    solution: 'The same r can come from very different clouds, as Anscombe’s quartet shows: a linear band, a perfect curve, a perfect line with one stray point, and a column with one far-off point. Plot each one.',
  },
  {
    id: 'b05-sct-k2', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook’s day’s high (B2:B25) and hot drinks made (C2:C25), 1–24 May. In E2, calculate the correlation.',
    sheet: maySheet, cell: 'E2', answer: '=CORREL(B2:B25,C2:C25)',
    alt: ['=CORREL(C2:C25,B2:B25)', '=PEARSON(B2:B25,C2:C25)', '=PEARSON(C2:C25,B2:B25)'],
    view: 'A1:E25', maxHeight: '20rem', formats: { E2: '0.000' }, widths: { A: 10 },
    wrong: [
      { formula: '=RSQ(C2:C25,B2:B25)', say: 'RSQ is r², which loses the sign. Hot drinks fall as it gets warmer: CORREL keeps the minus.' },
      { formula: '=CORREL(B2:B24,C2:C24)', say: 'The data run to row 25: include every day.' },
    ],
    solution: `<x>=CORREL(B2:B25,C2:C25)</x> = ${sgn(mayR, 3)}: on warmer May days Millbrook made fewer hot drinks, a negative association. Over the whole year at Millbrook it is ${sgn(C.pearson(column('high_f', { cafe: 'Millbrook' }), column('hot_drinks', { cafe: 'Millbrook' })).r, 2)}.`,
  },
  {
    id: 'b05-sct-k3', type: 'mc', kind: 'applied',
    prompt: 'A regional manager emails Ana: “Sales and transactions correlate at only 0.83 across the two cafés. Shouldn’t every transaction add about the same to sales?” Ana’s scatterplot of the 612 café-days shows two separate bands. What should she reply?',
    options: [
      'Each café lies close to its own line; Harbourside’s higher average ticket puts its band higher, and pooling lowers r.',
      'Transactions are a poor guide to sales, since 0.83 is well below 1, so the cafés should track sales separately from transactions.',
      'The lower band must be a data error, since sales should rise by the same amount per transaction everywhere.',
      'The correlation is too low to mean anything, so the plot should be ignored and only totals reported.',
    ],
    answer: 0,
    feedback: {
      1: 'Within each café transactions track sales almost perfectly (r = 0.99 and 0.98). The 0.83 comes from mixing two groups.',
      2: 'The bands are the two cafés, each internally consistent. Nothing is an error.',
      3: 'The plot explains the number. Two clusters are a reason to split the data, not to ignore the plot.',
    },
    solution: `Two bands are two groups. At Harbourside (average ticket about $${fx(D.meanTicketH)}) a transaction is worth more than at Millbrook (about $${fx(D.meanTicketM)}), so at the same number of transactions the cafés take different sales. Within each café r is 0.99 and 0.98; pooled, the gap between the bands lowers r to ${fx(D.transSales.r)}. Report the cafés separately.`,
  },
  {
    id: 'b05-sct-k4', type: 'classify', kind: 'conceptual',
    prompt: 'For each unusual point in a scatterplot of footfall (x) against transactions (y), say whether it lies on the pattern or breaks it.',
    items: [
      'A festival day: footfall three times the usual, transactions three times the usual.',
      'A day with footfall 2,566 and an ordinary number of transactions.',
      'A quiet Sunday: the lowest footfall of the month and the fewest transactions.',
      'A day when the till was down for two hours: ordinary footfall, half the usual transactions.',
    ],
    categories: ['On the pattern', 'Breaks the pattern'],
    answer: [0, 1, 0, 1],
    feedback: {
      1: 'Huge footfall with ordinary transactions sits far to the right of the band: it breaks the pattern (Millbrook’s slip).',
      3: 'Ordinary footfall with half the transactions sits well below the band: real, but it breaks the pattern, and it needs a note in the report.',
    },
    solution: 'A point is on the pattern when its y is about what its x leads you to expect, however extreme both are (festival days, quiet Sundays). It breaks the pattern when y is far from what x predicts: a typing slip or a real event such as a till failure. Both kinds deserve a check; only the second weakens the straight-line pattern.',
  },
  {
    id: 'b05-sct-k5', type: 'mc', kind: 'applied',
    prompt: `A colleague reports “peak barista hours and transactions: r = ${fx(staffR, 2)}, so more baristas bring in more customers.” What is wrong with the conclusion?`,
    options: [
      'Plot and r show association; the manager rosters more baristas when she expects to be busy.',
      'A correlation below 1 leaves room for exceptions, so it cannot support any conclusion at all.',
      'Barista hours should go on the y-axis, and with the axes swapped the correlation would come out lower.',
      'Peak barista hours take only 20 different values, so r cannot be calculated from them.',
    ],
    answer: 0,
    feedback: {
      1: 'The problem isn’t the size of r; it is reading cause into it. In the case the roster follows expected demand.',
      2: 'Swapping axes never changes r: correlation is symmetric.',
      3: 'Recorded steps cause overplotting, not a problem for r.',
    },
    solution: `The plot shows that more hours go with more transactions (r = ${fx(staffR, 2)}). In the case, the manager rosters more baristas for days she expects to be busy, so expected demand comes first. Association in a scatterplot is not evidence of cause; the course’s last lesson explains what would be.`,
  },
  {
    id: 'b05-sct-k6', type: 'num', kind: 'numerical',
    prompt: 'Using the table of average iced share by band of the day’s high, by how many percentage points does the average rise from the 60–69°F band to the 70–79°F band? Use the rounded percentages in the table.',
    data: { table: bandTable },
    answer: Math.round(B70) - Math.round(B60), check: () => Math.round(B70) - Math.round(B60), unit: 'percentage points', places: 0, tol: 0.5,
    wrong: [
      { value: Math.round((Math.round(B70) / Math.round(B60) - 1) * 100), say: 'That is the percentage change. The question asks for the difference in percentage points: subtract the two shares.' },
    ],
    solution: `${Math.round(B70)}% − ${Math.round(B60)}% = ${Math.round(B70) - Math.round(B60)} percentage points, about ${fx((Math.round(B70) - Math.round(B60)) / 10, 1)} points per degree: the steepest part of the S-curve. From the 40s to the 50s the rise is only ${Math.round(band(50, 60)) - Math.round(band(40, 50))} points.`,
  },
];
