// assess-final.js — B05 final assessment: 24 questions across all four modules and all six of the course’s outcomes, two
// or three per lesson (five for module 1, five for module 2, seven for module 3 and seven for module 4). 70% passes.
// Mixed conceptual, numerical and applied items. Four are formula items on worksheets sliced from the café log (two of
// them steps): r from its definition (b05-fn-3), Spearman’s ρ beside r on a slice with the footfall slip (b05-fn-6), a
// Fisher-z confidence limit with the confidence level varied on the marking copies (b05-fn-8) and a first-order partial
// correlation built from CORREL (b05-fn-20); the café values are scaled on the copies, so typed results fail.
// Many items combine lessons: the rain–footfall scatter read for form, then why a rank correlation helps (b05-fn-1:
// scatterplots, rank-correlation); covariance turned into new units through r (b05-fn-4: covariance-and-pearson,
// scatterplots’ units); r and ρ on a slice with a slip, then what to report (b05-fn-6: rank-correlation,
// outliers-and-influence); two cafés’ correlations compared on the same days (b05-fn-9: testing-correlation,
// groups-and-simpsons-paradox); the power left after a Bonferroni adjustment over 28 pairs (b05-fn-10:
// testing-correlation, correlation-matrices); leave-one-out influence against the most unusual-looking point (b05-fn-11:
// outliers-and-influence, scatterplots); handling the slip and the festival days honestly (b05-fn-12:
// outliers-and-influence, rank-correlation); restricted range against a change in the relationship (b05-fn-13:
// nonlinear-and-restricted, covariance-and-pearson); a threshold turned into a staffing rule (b05-fn-15:
// nonlinear-and-restricted, correlation-and-causation); the pooled r rebuilt from the cafés’ means (b05-fn-16); monthly
// averages as an ecological correlation that reverses the cafés’ own (b05-fn-17: groups-and-simpsons-paradox,
// correlation-matrices’ pooling); a month’s matrix read, adjusted with Holm, then what partial correlation adds
// (b05-fn-18: correlation-matrices, testing-correlation, partial-correlation); the bound on a third correlation and
// redundancy (b05-fn-19); rain and sales holding footfall (a mediator) fixed, then what it answers (b05-fn-20:
// partial-correlation, correlation-and-causation); the test of a partial correlation with two controls (b05-fn-21:
// partial-correlation, testing-correlation); a finding written without overclaiming across groups (b05-fn-22:
// correlation-and-causation, groups-and-simpsons-paradox); a lone significant pair among 28 as chance (b05-fn-24:
// correlation-and-causation, correlation-matrices).
// Outcomes: 1 (fn-1, 2, 11), 2 (fn-3–7), 3 (fn-8–10, 18, 21), 4 (fn-11–17), 5 (fn-18–21), 6 (fn-15, 20, 22–24).
// New questions, not copies of lesson exercises, module tests, the diagnostic or the project, and nothing from the
// project’s data or question. Café figures come from case.js (the corrected log, or the raw log where the slip is the
// point); Skelling Kayaks, Kelderby Plant Nursery and the survey in b05-fn-14 are fictional. Daily café series follow
// the season, so their p-values are approximate (too small), and the two cafés share their days: items that test say so.
// No hints; solutions are shown on review. Every num item’s `check` recomputes its answer, and every formula item is
// marked by its results on the sheet and on changed copies.
import { CLEAN_ROWS, CAFE_ROWS, CAFE_COLUMNS, SLIP, column, DERIVED, MATRIX } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean, sd } from '../../../core/stats.js?v=20';
import { normCdf, tCdf } from '../../../core/inference.js?v=20';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const pc = (v, d = 0) => `${fx(v * 100, d)}%`;
const int = (v) => Math.round(v).toLocaleString('en-US');
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => `${Number(iso.slice(8))} ${MON[Number(iso.slice(5, 7)) - 1]}`;
const slice = (cafe, from, to, rows = CLEAN_ROWS) => rows.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to);
const get = (rows, name) => rows.map((r) => (name === 'avg_ticket' ? r[at('sales')] / r[at('transactions')] : name === 'iced_share' ? r[at('iced_drinks')] / (r[at('iced_drinks')] + r[at('hot_drinks')]) : r[at(name)]));
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const p3 = (p) => (p < 0.001 ? 'below 0.001' : fx(p, 3));
const sig3 = (p) => (p < 0.0001 ? 'below 0.0001' : p.toPrecision(3));

// ---------------------------------------------------------------- module 1
// Harbourside’s rain and footfall
const hRain = column('rain_in', H), hFoot = column('footfall', H);
const dryDays = hRain.filter((v) => v === 0).length, wetDays = hRain.length - dryDays;
const rainR = DERIVED.rainFootfallH.r, rainRho = C.spearman(hRain, hFoot).rho;
// Millbrook, 3–22 May: peak barista hours and transactions
const MAY = slice('Millbrook', '2027-05-03', '2027-05-22');
const mayH = get(MAY, 'peak_staff_hours'), mayT = get(MAY, 'transactions'), mayN = MAY.length + 1;
const mayR = C.pearson(mayH, mayT).r;
// Harbourside: the high and the iced share
const hHigh = column('high_f', H), hShare = column('iced_share', H);
const F4 = { r: rnd(C.pearson(hHigh, hShare).r, 3), sdF: rnd(sd(hHigh), 1), sdS: rnd(sd(hShare), 3) };
const covCpp = (r, sdF, sdS) => r * (sdF / 1.8) * (sdS * 100);
// Skelling Kayaks (fictional): wind speed (mph) and kayaks hired, eight days
const WIND = [8, 12, 5, 15, 10, 18, 7, 13], KAYAK = [44, 41, 50, 30, 38, 27, 52, 33];
const SUMS = { n: WIND.length, x: WIND.reduce((s, v) => s + v, 0), y: KAYAK.reduce((s, v) => s + v, 0), xx: WIND.reduce((s, v) => s + v * v, 0), yy: KAYAK.reduce((s, v) => s + v * v, 0), xy: WIND.reduce((s, v, i) => s + v * KAYAK[i], 0) };
const fromSums = (s) => (s.xy - (s.x * s.y) / s.n) / Math.sqrt((s.xx - s.x ** 2 / s.n) * (s.yy - s.y ** 2 / s.n));

// ---------------------------------------------------------------- module 2
// Millbrook, 8–21 September, as typed (the slip on 14 September) and corrected
const SEP_RAW = slice('Millbrook', '2027-09-08', '2027-09-21', CAFE_ROWS), SEP_OK = slice('Millbrook', '2027-09-08', '2027-09-21');
const sepF = get(SEP_RAW, 'footfall'), sepS = get(SEP_RAW, 'sales'), sepN = SEP_RAW.length + 1;
const sepR = C.pearson(sepF, sepS).r, sepRho = C.spearman(sepF, sepS).rho;
const okR = C.pearson(get(SEP_OK, 'footfall'), get(SEP_OK, 'sales')).r, okRho = C.spearman(get(SEP_OK, 'footfall'), get(SEP_OK, 'sales')).rho;
const slipRow = SEP_RAW.findIndex((r) => r[at('date')] === SLIP.date) + 2;
// Harbourside, September: the high and the iced share, ρ against τ
const SEPH = slice('Harbourside', '2027-09-01', '2027-09-30');
const shRho = C.spearman(get(SEPH, 'high_f'), get(SEPH, 'iced_share')).rho, shTau = C.kendall(get(SEPH, 'high_f'), get(SEPH, 'iced_share'));
const shPairs = (SEPH.length * (SEPH.length - 1)) / 2;
// Harbourside, November: footfall and the average ticket (to the cent, as the sheet shows it)
const NOV = slice('Harbourside', '2027-11-01', '2027-11-30');
const novF = get(NOV, 'footfall'), novT = get(NOV, 'avg_ticket').map((v) => rnd(v, 2)), novN = NOV.length + 1;
const novR = C.pearson(novF, novT).r, novCI = C.fisherCI(novR, NOV.length, 0.95), novCI90 = C.fisherCI(novR, NOV.length, 0.9);
// the two cafés’ footfall–ticket correlations on the same 306 days
const cmpFT = C.compareIndependent(DERIVED.footTicketH.r, 306, DERIVED.footTicketM.r, 306);
const footCafes = C.pearson(column('footfall', H), column('footfall', M)).r;
// power after Bonferroni over 28 pairs
const PW = { rho: 0.2, n: 306, m: 28 };
const pwAdj = C.power(PW.rho, PW.n, 0.05 / PW.m), pwRaw = C.power(PW.rho, PW.n);
const powerBy = (rho, n, alpha) => { const zc = qNorm(1 - alpha / 2), d = Math.atanh(rho) * Math.sqrt(n - 3); return normCdf(d - zc) + normCdf(-d - zc); };
function qNorm(p) { let lo = -10, hi = 10; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (normCdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }

// ---------------------------------------------------------------- module 3
// Kelderby Plant Nursery (fictional): the day’s high (°C) and plants sold (dozens), ten days
const KX = [12, 14, 15, 16, 17, 18, 19, 20, 21, 34], KY = [30, 35, 33, 40, 41, 60, 44, 47, 49, 45];
const KDAYS = ['2 May', '9 May', '16 May', '23 May', '30 May', '6 Jun', '13 Jun', '20 Jun', '27 Jun', '4 Jul'];
const KINF = C.influence(KX, KY);
const kFair = KY.indexOf(60), kHot = KX.indexOf(34);
// Millbrook: footfall and transactions, all days against weekends
const mFoot = column('footfall', M), mTrans = column('transactions', M), mWk = column('weekday', M).map((d) => d === 'Sat' || d === 'Sun');
const wkF = mFoot.filter((_, i) => mWk[i]), wkT = mTrans.filter((_, i) => mWk[i]);
const mAllR = C.pearson(mFoot, mTrans).r, mWkR = C.pearson(wkF, wkT).r;
const convAll = mean(mTrans.map((t, i) => t / mFoot[i])), convWk = mean(wkT.map((t, i) => t / wkF[i]));
// the most an observed r can be with two unreliable measures
const REL = { x: 0.64, y: 0.81 };
// peak load and the wait (both cafés)
const LOAD = column('peak_load'), WAIT = column('peak_wait_min');
const lowI = LOAD.map((_, i) => i).filter((i) => LOAD[i] <= 7), highI = LOAD.map((_, i) => i).filter((i) => LOAD[i] > 7);
const loadR = DERIVED.loadWait.r, loadLowR = C.pearson(lowI.map((i) => LOAD[i]), lowI.map((i) => WAIT[i])).r, loadHighR = C.pearson(highI.map((i) => LOAD[i]), highI.map((i) => WAIT[i])).r;
const waitBand = (a, b) => mean(LOAD.map((_, i) => i).filter((i) => LOAD[i] > a && LOAD[i] <= b).map((i) => WAIT[i]));
// pooled r of footfall and average ticket rebuilt from the cafés’ means (the figures as the item shows them)
const allF = column('footfall'), allT = column('avg_ticket'), allC = column('cafe');
const gMean = (v, c) => mean(v.filter((_, i) => allC[i] === c));
const devW = (v) => v.map((x, i) => x - gMean(v, allC[i]));
const SIMP = {
  mFH: rnd(DERIVED.meanFootfallH, 2), mFM: rnd(DERIVED.meanFootfallM, 2), mTH: rnd(DERIVED.meanTicketH, 3), mTM: rnd(DERIVED.meanTicketM, 3),
  spW: Math.round(devW(allF).reduce((s, v, i) => s + v * devW(allT)[i], 0)),
  ssF: Math.round(allF.reduce((s, v) => s + (v - mean(allF)) ** 2, 0)), ssT: rnd(allT.reduce((s, v) => s + (v - mean(allT)) ** 2, 0), 1),
};
const simpBetween = (s) => { const mf = (s.mFH + s.mFM) / 2, mt = (s.mTH + s.mTM) / 2; return 306 * ((s.mFH - mf) * (s.mTH - mt) + (s.mFM - mf) * (s.mTM - mt)); };
const simpR = (s) => (s.spW + simpBetween(s)) / Math.sqrt(s.ssF * s.ssT);
// monthly averages: 20 café-months
const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => String(m).padStart(2, '0'));
const CM = ['Harbourside', 'Millbrook'].flatMap((cafe) => MONTHS.map((m) => { const R = slice(cafe, `2027-${m}-01`, `2027-${m}-31`); return { cafe, f: mean(get(R, 'footfall')), t: mean(get(R, 'avg_ticket')) }; }));
const ecoR = C.pearson(CM.map((p) => p.f), CM.map((p) => p.t)).r;
const ecoH = C.pearson(CM.filter((p) => p.cafe === 'Harbourside').map((p) => p.f), CM.filter((p) => p.cafe === 'Harbourside').map((p) => p.t)).r;
const ecoM = C.pearson(CM.filter((p) => p.cafe === 'Millbrook').map((p) => p.f), CM.filter((p) => p.cafe === 'Millbrook').map((p) => p.t)).r;

// ---------------------------------------------------------------- module 4
// Harbourside, September: the eight-measure matrix
const NAMES = { high_f: 'High', rain_in: 'Rain', footfall: 'Footfall', transactions: 'Transactions', sales: 'Sales', iced_share: 'Iced share', peak_staff_hours: 'Peak barista hours', peak_wait_min: 'Peak wait' };
const SEPM = C.matrix(Object.fromEntries(Object.keys(NAMES).map((n) => [n, get(SEPH, n)])), { adjustMethod: 'holm' });
const sepPairs = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) sepPairs.push({ a: NAMES[SEPM.names[i]], b: NAMES[SEPM.names[j]], r: SEPM.r[i][j], p: SEPM.p[i][j], adj: SEPM.pAdj[i][j] });
sepPairs.sort((x, y) => x.p - y.p);
const sepSig = sepPairs.filter((x) => x.p < 0.05), sepHolm = sepPairs.filter((x) => x.adj < 0.05).length;
const sepBH = C.adjust(sepPairs.map((x) => x.p), 'fdr_bh').filter((p) => p < 0.05).length;
const sepHW = C.pearson(get(SEPH, 'peak_staff_hours'), get(SEPH, 'peak_wait_min'));
const sepHWp = C.partial(get(SEPH, 'peak_staff_hours'), get(SEPH, 'peak_wait_min'), [get(SEPH, 'transactions')]);
// the bound on a third correlation (612 days)
const BND = { ft: rnd(DERIVED.footTrans.r, 3), th: rnd(MATRIX.r[3][6], 3) };
const lowBound = (a, b) => a * b - Math.sqrt((1 - a * a) * (1 - b * b));
// Harbourside, March: rain, footfall and sales (no festival days); June: hours and waits with two controls
const MAR = slice('Harbourside', '2027-03-01', '2027-03-31');
const marR = get(MAR, 'rain_in'), marF = get(MAR, 'footfall'), marS = get(MAR, 'sales'), marN = MAR.length + 1;
const marRS = C.pearson(marR, marS).r, marP = C.partial(marR, marS, [marF]);
const JUN = slice('Harbourside', '2027-06-01', '2027-06-30');
const junHi = get(JUN, 'high_f');
const junP2 = C.partial(get(JUN, 'peak_staff_hours'), get(JUN, 'peak_wait_min'), [get(JUN, 'transactions'), junHi]);
const P2 = { r: rnd(junP2.r, 3), n: JUN.length, k: 2 };
const partialP = (r, n, k) => { const df = n - 2 - k, t = r * Math.sqrt(df / (1 - r * r)); return 2 * (1 - tCdf(Math.abs(t), df)); };
// September’s rain and iced share at Harbourside (from the matrix above)
const rainIced = sepPairs.find((x) => x.a === 'Rain' && x.b === 'Iced share');

export const items = [
  // ================================================================ Module 1: seeing relationships
  {
    id: 'b05-fn-1', lesson: 'scatterplots', type: 'mc', kind: 'conceptual',
    prompt: `Harbourside’s rain and footfall correlate at r = ${fx(rainR)} over its 306 days. Rain was recorded on ${wetDays} of those days; on the other ${dryDays} it was zero. What does the scatterplot of footfall (y) against rain (x) look like, and what follows for summarising it?`,
    options: [
      'A dense column at zero rain holding most days, with the wet days strung thinly to its right and drifting down; one r summarises that poorly, so add a rank correlation.',
      `An evenly scattered band sloping gently down from left to right, which is what an r of ${fx(rainR)} always looks like, so r on its own is a fair summary of how rain and footfall relate.`,
      'Two clusters, dry days and wet days, so the correlation should be calculated for the wet days only and the dry days left out of the analysis.',
      'A U-shape, with drizzle drawing people in and heavy rain keeping them away, which is why r is so close to zero.',
    ],
    answer: 0,
    feedback: {
      1: `With ${dryDays} days stacked at x = 0, the points can’t form an even band. A modest r can come from very different pictures: plot first.`,
      2: 'Dry days are part of the question “does rain go with fewer visitors?”; dropping them restricts the range and answers a different question.',
      3: 'Nothing in the data suggests a turning point; the wet days drift down. And r here is −0.23, not near zero.',
    },
    solution: `Rain is zero on ${dryDays} of the 306 days, so the scatterplot has a dense column at x = 0 and a thin, right-skewed spread of wet days. A single r = ${fx(rainR, 3)} summarises that shape poorly. Report the number of dry days, show the plot, and give Spearman’s ρ (${fx(rainRho, 3)}), which uses only the order; it handles the skew, though the ${dryDays} tied zeros share one average rank.`,
  },
  {
    id: 'b05-fn-2', lesson: 'scatterplots', type: 'classify', kind: 'applied',
    prompt: 'Ana wants a plot for each of these questions about the café log. Choose the change to a plain scatterplot that each one needs most.',
    items: [
      'Do Harbourside’s loyalty-app members rise with the day’s high, or do the two merely share the same months?',
      'Where do most of the 612 café-days lie when peak barista hours, rostered in half-hours, are plotted against the wait rounded to a tenth of a minute?',
      'Do busier days go with bigger average tickets inside each café, or only when the two cafés are mixed?',
      'Did the link between footfall and sales change after the first four months, as the new cafés built up their trade?',
      'Do the two cafés turn their visitors into transactions at different rates?',
    ],
    categories: ['Colour the points by date, or plot each series against time', 'Jitter the points and make them partly transparent', 'Show each café in its own panel or colour'],
    answer: [0, 1, 2, 0, 2],
    feedback: {
      0: 'Members only ever rise while the high rises and then falls: a hairpin that only shows when time order is visible.',
      1: 'Half-hour hours and tenth-of-a-minute waits put many days on the same spot; nudging and transparency show how many.',
      2: 'One café at a time (or one colour each) shows whether the within-café pattern matches the pooled one.',
      3: 'A change over the year is a question about time: colour by month or split the year.',
      4: 'Different conversion rates show as two bands, one per café.',
    },
    solution: 'A scatterplot hides time order, overplots repeated values and mixes groups. Time questions (members against the high, a change after the first months) need dates on the plot; whole-number or rounded values need jitter and transparency (for drawing only); questions about the two cafés need one panel or colour per café.',
  },
  {
    id: 'b05-fn-3', lesson: 'covariance-and-pearson', type: 'formula', kind: 'numerical',
    prompt: 'Millbrook, 3–22 May 2027: peak barista hours in B2:B21 and transactions in C2:C21. In F1, calculate Pearson’s r from its definition, without CORREL, PEARSON or the covariance functions: the sum of the products of the two columns’ deviations from their means, divided by the square root of the product of their sums of squared deviations.',
    sheet: { cells: { A1: 'Day', B1: 'Peak barista hours', C1: 'Transactions', E1: 'Pearson’s r', ...col('A', 2, MAY.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, mayH), ...col('C', 2, mayT) } },
    cell: 'F1', view: `A1:F${mayN}`, formats: { B: '0.0', F1: '0.0000' }, widths: { B: 18, C: 13, E: 12 },
    answer: `=SUMPRODUCT(B2:B${mayN}-AVERAGE(B2:B${mayN}),C2:C${mayN}-AVERAGE(C2:C${mayN}))/SQRT(DEVSQ(B2:B${mayN})*DEVSQ(C2:C${mayN}))`,
    alt: [
      `=SUMPRODUCT((B2:B${mayN}-AVERAGE(B2:B${mayN}))*(C2:C${mayN}-AVERAGE(C2:C${mayN})))/SQRT(DEVSQ(B2:B${mayN})*DEVSQ(C2:C${mayN}))`,
      `=SUMPRODUCT(B2:B${mayN}-AVERAGE(B2:B${mayN}),C2:C${mayN}-AVERAGE(C2:C${mayN}))/SQRT(SUMPRODUCT((B2:B${mayN}-AVERAGE(B2:B${mayN}))^2)*SUMPRODUCT((C2:C${mayN}-AVERAGE(C2:C${mayN}))^2))`,
      `=SUMPRODUCT(B2:B${mayN}-AVERAGE(B2:B${mayN}),C2:C${mayN}-AVERAGE(C2:C${mayN}))/(COUNT(B2:B${mayN})-1)/(STDEV.S(B2:B${mayN})*STDEV.S(C2:C${mayN}))`,
    ],
    require: ['SUMPRODUCT'],
    wrong: [
      { formula: `=SUMPRODUCT(B2:B${mayN}-AVERAGE(B2:B${mayN}),C2:C${mayN}-AVERAGE(C2:C${mayN}))/(STDEV.S(B2:B${mayN})*STDEV.S(C2:C${mayN}))`, say: 'The sum of products is n − 1 times the covariance, so dividing it by s_x s_y gives r × 19. Divide by √(DEVSQ × DEVSQ), or by n − 1 as well.' },
      { formula: `=SUMPRODUCT(B2:B${mayN}-AVERAGE(B2:B${mayN}),C2:C${mayN}-AVERAGE(C2:C${mayN}))/(DEVSQ(B2:B${mayN})*DEVSQ(C2:C${mayN}))`, say: 'Take the square root of the product of the sums of squares; without it the units don’t cancel and the result is far too small.' },
      { formula: `=SUMPRODUCT(B2:B${mayN},C2:C${mayN})/SQRT(SUMSQ(B2:B${mayN})*SUMSQ(C2:C${mayN}))`, say: 'That uses the raw values, not their deviations from the means, so it measures how far both columns are from zero rather than how they move together.' },
    ],
    solution: `<x>=SUMPRODUCT(B2:B21-AVERAGE(B2:B21),C2:C21-AVERAGE(C2:C21))/SQRT(DEVSQ(B2:B21)*DEVSQ(C2:C21))</x> = ${fx(mayR, 4)}, the same as CORREL. The numerator is (n − 1) times the covariance and the denominator (n − 1) times s_x s_y, so the n − 1s cancel: r = cov ÷ (s_x s_y). Millbrook’s manager rosters more baristas on days she expects to be busy, which is why hours and transactions move so closely; it describes her rostering, not what baristas do to trade.`,
  },
  {
    id: 'b05-fn-4', lesson: 'covariance-and-pearson', type: 'num', kind: 'numerical',
    prompt: `Over Harbourside’s 306 days, the day’s high and the iced share (iced drinks as a share of all drinks) correlate at r = ${fx(F4.r, 3)}. The high has a standard deviation of ${fx(F4.sdF, 1)} °F and the iced share ${fx(F4.sdS, 3)}. A report for the Canadian owners of a supplier needs the covariance with the high in °C and the iced share in percentage points. What is it? Give one decimal place.`,
    answer: rnd(covCpp(F4.r, F4.sdF, F4.sdS), 1),
    check: () => F4.r * (F4.sdF * 5 / 9) * (F4.sdS * 100),
    unit: '°C × points', places: 1, tol: 0.06,
    wrong: [
      { value: rnd(F4.r * F4.sdF * F4.sdS * 100, 1), say: 'That keeps the high in °F. A spread in °C is the spread in °F divided by 1.8, and the covariance shrinks with it.' },
      { value: rnd(covCpp(F4.r, F4.sdF, F4.sdS) / 100, 2), say: 'That keeps the iced share as a fraction. In percentage points every deviation is 100 times larger, and so is the covariance.' },
      { value: F4.r, say: 'r has no units and is unchanged; the covariance carries both variables’ units: cov = r × s_x × s_y in the new units.' },
    ],
    solution: `cov = r × s_x × s_y, with each standard deviation in the units wanted. s_high = ${fx(F4.sdF, 1)} ÷ 1.8 = ${fx(F4.sdF / 1.8, 2)} °C (a change of scale; the 32 doesn’t affect a spread); s_share = ${fx(F4.sdS, 3)} × 100 = ${fx(F4.sdS * 100, 1)} points. cov = ${fx(F4.r, 3)} × ${fx(F4.sdF / 1.8, 2)} × ${fx(F4.sdS * 100, 1)} = ${fx(covCpp(F4.r, F4.sdF, F4.sdS), 1)} (°C × points). The same relationship has a different covariance in every pair of units, which is why its size can’t be read as strength; r = ${fx(F4.r, 3)} is the same in all of them.`,
  },
  {
    id: 'b05-fn-5', lesson: 'covariance-and-pearson', type: 'num', kind: 'numerical',
    prompt: `Skelling Kayaks (fictional) recorded wind speed (mph, x) and kayaks hired (y) on ${SUMS.n} days, but its till system exports only totals: n = ${SUMS.n}, Σx = ${SUMS.x}, Σy = ${SUMS.y}, Σx² = ${int(SUMS.xx)}, Σy² = ${int(SUMS.yy)}, Σxy = ${int(SUMS.xy)}. Calculate Pearson’s r. Give three decimal places.`,
    answer: rnd(fromSums(SUMS), 3),
    check: () => C.pearson(WIND, KAYAK).r,
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(SUMS.xy / Math.sqrt(SUMS.xx * SUMS.yy), 3), say: 'Σxy ÷ √(Σx² Σy²) uses the raw values, not deviations from the means. Centre first: Sxy = Σxy − ΣxΣy ÷ n, and likewise Sxx and Syy.' },
      { value: rnd((SUMS.xy - (SUMS.x * SUMS.y) / SUMS.n) / (SUMS.n - 1), 3), say: 'That is the sample covariance. Divide it by both standard deviations, or divide Sxy by √(Sxx Syy).' },
      { value: rnd(fromSums(SUMS) ** 2, 3), say: 'That is r², which loses the sign. Wind and hires move in opposite directions.' },
    ],
    solution: `Sxy = Σxy − ΣxΣy ÷ n = ${int(SUMS.xy)} − ${SUMS.x} × ${SUMS.y} ÷ ${SUMS.n} = ${fx(SUMS.xy - (SUMS.x * SUMS.y) / SUMS.n, 1)}; Sxx = ${int(SUMS.xx)} − ${SUMS.x}² ÷ ${SUMS.n} = ${fx(SUMS.xx - SUMS.x ** 2 / SUMS.n, 1)}; Syy = ${int(SUMS.yy)} − ${SUMS.y}² ÷ ${SUMS.n} = ${fx(SUMS.yy - SUMS.y ** 2 / SUMS.n, 3)}. r = Sxy ÷ √(Sxx Syy) = ${fx(fromSums(SUMS), 3)}: windier days went with far fewer hires (eight days only, so plot them before leaning on it).`,
  },

  // ================================================================ Module 2: measuring and testing
  {
    id: 'b05-fn-6', lesson: 'rank-correlation', type: 'steps', kind: 'applied',
    prompt: `Millbrook, 8–21 September 2027, exactly as the manager typed the log: B holds footfall and C sales. F1 shows Pearson’s r. Before the year-end review, Ana wants a correlation she can stand behind for these two weeks.`,
    steps: [
      {
        id: 'b05-fn-6-s1', type: 'formula',
        prompt: 'In F2, calculate Spearman’s ρ between footfall and sales in one formula.',
        sheet: { cells: { A1: 'Day', B1: 'Footfall', C1: 'Sales ($)', E1: 'Pearson’s r', F1: `=CORREL(B2:B${sepN},C2:C${sepN})`, E2: 'Spearman’s ρ', ...col('A', 2, SEP_RAW.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, sepF), ...col('C', 2, sepS) } },
        cell: 'F2', view: `A1:F${sepN}`, formats: { C: '#,##0.00', F1: '0.000', F2: '0.000' }, widths: { C: 11, E: 13 },
        answer: `=CORREL(RANK.AVG(B2:B${sepN},B2:B${sepN}),RANK.AVG(C2:C${sepN},C2:C${sepN}))`,
        alt: [
          `=CORREL(RANK.AVG(B2:B${sepN},B2:B${sepN},1),RANK.AVG(C2:C${sepN},C2:C${sepN},1))`,
          `=PEARSON(RANK.AVG(B2:B${sepN},B2:B${sepN}),RANK.AVG(C2:C${sepN},C2:C${sepN}))`,
        ],
        require: ['RANK.AVG'],
        wrong: [
          { formula: `=CORREL(B2:B${sepN},C2:C${sepN})`, say: 'That is Pearson’s r, already in F1. Spearman’s ρ is Pearson’s r of the ranks: wrap each range in RANK.AVG.' },
          { formula: `=CORREL(RANK.AVG(B2:B${sepN},B2:B${sepN}),RANK.AVG(C2:C${sepN},C2:C${sepN},1))`, say: 'Rank both columns in the same direction; mixing largest-first and smallest-first flips the sign.' },
        ],
        solution: `<x>=CORREL(RANK.AVG(B2:B15,B2:B15),RANK.AVG(C2:C15,C2:C15))</x> = ${fx(sepRho, 3)}, against r = ${fx(sepR, 3)} in F1. RANK.AVG gives tied values their average rank, as Spearman’s ρ requires.`,
      },
      {
        id: 'b05-fn-6-s2', type: 'mc',
        prompt: `14 September (row ${slipRow}) shows ${int(SLIP.recorded)} visitors; the door counter’s own export for that day says ${SLIP.actual}. What should Ana report?`,
        options: [
          'Correct it to the counter’s figure, note the change, and report r on the corrected log with ρ beside it.',
          'Report Spearman’s ρ on the log as typed: ranks resist the slip, so there is no need to correct the value or mention it.',
          'Delete 14 September, because its footfall is more than three standard deviations above the mean, and report r without it.',
          'Report the r in F1 as it stands: the log is the record, and changing a value would amount to manipulating the data.',
        ],
        answer: 0,
        feedback: {
          1: `Ranks limit the slip’s damage but don’t remove it: as typed, 14 September becomes the busiest day and ρ is pulled down too (${fx(sepRho, 2)} against ${fx(okRho, 2)} corrected). A known error should be fixed.`,
          2: 'The day is genuine and the true value is known; deleting it throws away a real day. Correct it from the source.',
          3: 'A documented correction from the source record is not manipulation; reporting a correlation distorted by a typo would mislead.',
        },
        solution: `The value is a data-entry slip with a known true value, so it should be corrected (and the correction recorded). With ${SLIP.actual} in place, r = ${fx(okR, 3)} and ρ = ${fx(okRho, 3)}. The gap between r (${fx(sepR, 2)}) and ρ (${fx(sepRho, 2)}) on the raw log was the warning sign; ρ is robust, not immune.`,
      },
    ],
    solution: `Spearman’s ρ on the log as typed is ${fx(sepRho, 3)} against r = ${fx(sepR, 3)}: one extra digit on 14 September (${int(SLIP.recorded)} for ${SLIP.actual}) destroys r and dents ρ. Check the value against the door counter, correct it and say so, then report r = ${fx(okR, 3)} (ρ = ${fx(okRho, 3)}) for the two weeks. Choosing ρ to avoid checking, deleting the day, or leaving the typo in are all worse.`,
  },
  {
    id: 'b05-fn-7', lesson: 'rank-correlation', type: 'mc', kind: 'conceptual',
    prompt: `For Harbourside’s ${SEPH.length} September days, the day’s high and the iced share have Spearman’s ρ = ${fx(shRho, 3)} and Kendall’s τ-b = ${fx(shTau.tau, 3)}. A colleague says that τ shows the relationship is weaker than ρ suggests. What is the right reading?`,
    options: [
      `Neither is weaker: τ-b sets concordant pairs (${shTau.concordant}) against discordant ones (${shTau.discordant}), a scale on which values run below ρ.`,
      'τ is the more accurate figure, because it corrects ρ for the many ties among the whole-degree temperatures recorded on these September days.',
      'ρ is the more accurate figure, because τ is meant only for ordinal data such as ratings, not for measurements.',
      'The gap between the two shows that the relationship is curved rather than straight over September.',
    ],
    answer: 0,
    feedback: {
      1: 'Both handle ties (ρ through average ranks, τ-b in its denominator). The difference in size comes from what each measures, not from ties.',
      2: 'Both work for any data that can be ordered, measurements included.',
      3: 'A curve separates Pearson’s r from the rank measures; ρ and τ react to it in the same way. Their gap is a matter of scale.',
    },
    solution: `τ-b compares every pair of days: (concordant − discordant) over the ${shPairs} pairs, with the denominator adjusted for tied pairs: (${shTau.concordant} − ${shTau.discordant}) → ${fx(shTau.tau, 3)}. In words: picking two September days at random, the warmer one had the higher iced share far more often than not. ρ is Pearson’s r on ranks. For the same data |τ| is typically around two-thirds of |ρ|, so compare τ with τ and ρ with ρ, and say which you report.`,
  },
  {
    id: 'b05-fn-8', lesson: 'testing-correlation', type: 'formula', kind: 'numerical',
    prompt: 'Harbourside, 1–30 November 2027: footfall in B2:B31 and the average ticket in C2:C31. F1 holds a confidence level. In F2, calculate the lower limit of the confidence interval for ρ at that level, by Fisher’s z, in one formula from the data.',
    sheet: { cells: { A1: 'Day', B1: 'Footfall', C1: 'Avg ticket ($)', E1: 'Confidence level', F1: 0.95, E2: 'Lower limit for ρ', ...col('A', 2, NOV.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, novF), ...col('C', 2, novT) }, vary: { F1: [0.9, 0.99, 0.8] } },
    cell: 'F2', view: `A1:F${novN}`, maxHeight: '22rem', formats: { C: '$0.00', F1: '0%', F2: '0.000' }, widths: { C: 13, E: 17 },
    answer: `=FISHERINV(FISHER(CORREL(B2:B${novN},C2:C${novN}))-NORM.S.INV(1-(1-F1)/2)/SQRT(COUNT(B2:B${novN})-3))`,
    alt: [
      `=TANH(ATANH(CORREL(B2:B${novN},C2:C${novN}))-NORM.S.INV(1-(1-F1)/2)/SQRT(COUNT(B2:B${novN})-3))`,
      `=FISHERINV(FISHER(CORREL(B2:B${novN},C2:C${novN}))-NORM.S.INV((1+F1)/2)/SQRT(COUNT(B2:B${novN})-3))`,
      `=FISHERINV(FISHER(CORREL(B2:B${novN},C2:C${novN}))+NORM.S.INV((1-F1)/2)/SQRT(COUNT(B2:B${novN})-3))`,
      `=FISHERINV(FISHER(PEARSON(B2:B${novN},C2:C${novN}))-NORM.S.INV(1-(1-F1)/2)/SQRT(ROWS(B2:B${novN})-3))`,
    ],
    wrong: [
      { formula: `=CORREL(B2:B${novN},C2:C${novN})-NORM.S.INV(1-(1-F1)/2)/SQRT(COUNT(B2:B${novN})-3)`, say: 'The standard error 1 ÷ √(n − 3) belongs to Fisher’s z, not to r. Transform r with FISHER, subtract the margin, then turn back with FISHERINV.' },
      { formula: `=FISHER(CORREL(B2:B${novN},C2:C${novN}))-NORM.S.INV(1-(1-F1)/2)/SQRT(COUNT(B2:B${novN})-3)`, say: 'That is the lower limit on the z scale. Turn it back into a correlation with FISHERINV.' },
      { formula: `=FISHERINV(FISHER(CORREL(B2:B${novN},C2:C${novN}))-NORM.S.INV(F1)/SQRT(COUNT(B2:B${novN})-3))`, say: 'NORM.S.INV(F1) leaves all of 1 − F1 in one tail. A two-sided interval puts half in each: NORM.S.INV(1 − (1 − F1) ÷ 2).' },
      { formula: `=FISHERINV(FISHER(CORREL(B2:B${novN},C2:C${novN}))-NORM.S.INV(1-(1-F1)/2)/SQRT(COUNT(B2:B${novN})-2))`, say: 'Fisher’s z has standard error 1 ÷ √(n − 3); n − 2 is the t test’s degrees of freedom.' },
    ],
    solution: `<x>=FISHERINV(FISHER(CORREL(B2:B31,C2:C31))-NORM.S.INV(1-(1-F1)/2)/SQRT(COUNT(B2:B31)-3))</x>. r = ${fx(novR, 3)} with n = ${NOV.length}; z = atanh r = ${fx(Math.atanh(novR), 4)}, SE = 1 ÷ √${NOV.length - 3} = ${fx(1 / Math.sqrt(NOV.length - 3), 4)}; at 95% the interval is ${fx(novCI[0], 3)} to ${fx(novCI[1], 3)} (at 90%, ${fx(novCI90[0], 3)} to ${fx(novCI90[1], 3)}). It is lopsided around r, as Fisher intervals are. Busier November days went with bigger tickets; but neighbouring days resemble each other, so the interval is somewhat too narrow.`,
  },
  {
    id: 'b05-fn-9', lesson: 'testing-correlation', type: 'mc', kind: 'conceptual',
    prompt: `Footfall and the average ticket correlate at r = ${fx(DERIVED.footTicketH.r, 3)} at Harbourside and ${fx(DERIVED.footTicketM.r, 3)} at Millbrook, each over the same 306 days. A colleague applies the test for two independent correlations, gets z = ${fx(cmpFT.z, 2)} and p ${cmpFT.p < 0.001 ? 'below 0.001' : `= ${fx(cmpFT.p, 3)}`}, and writes: “The link is significantly stronger at Harbourside.” What is the main problem?`,
    options: [
      `Both correlations use the same days (the cafés’ footfalls correlate at ${fx(footCafes, 2)}), so the samples aren’t independent; seasonal days also shrink p.`,
      'Nothing: the cafés are different places with different customers and different staff, so their two correlations are independent samples by design.',
      `The test should compare the r² values, ${fx(DERIVED.footTicketH.r2)} and ${fx(DERIVED.footTicketM.r2)}, since shared variance is what “stronger” means.`,
      'The colleague should have used a t test on the difference between the two r values, with 610 degrees of freedom, just as when comparing two means.',
    ],
    answer: 0,
    feedback: {
      1: 'Different customers, but the same days: the same weather, weekdays and season shape both cafés’ figures, and their footfalls are correlated. The independent-samples formula doesn’t hold.',
      2: 'Squaring changes nothing about the comparison, and r² has no simple sampling distribution to test with.',
      3: 'Correlations are compared through Fisher’s z, not with a t test on their difference; the main problem remains that the samples are linked.',
    },
    solution: `Fisher’s comparison assumes two independent samples. Here both correlations are measured on the same 306 days, the cafés’ daily footfalls correlate (${fx(footCafes, 2)}), and the days follow the season, so neighbouring days are alike: the p-value is only a rough guide and too small. A test for dependent correlations, with the days’ seasonality allowed for, is needed for a firm claim. The difference itself (${fx(DERIVED.footTicketH.r, 2)} against ${fx(DERIVED.footTicketM.r, 2)}) is worth reporting as a description.`,
  },
  {
    id: 'b05-fn-10', lesson: 'testing-correlation', type: 'num', kind: 'numerical',
    prompt: `Ana plans next year’s screen: all ${PW.m} pairs of eight daily measures at one café, ${PW.n} days, each pair tested two-sided at the Bonferroni level. If one pair’s true correlation is ${fx(PW.rho, 1)}, what is the power of its test, by Fisher’s z? Treat the days as independent. Give two decimal places.`,
    answer: rnd(pwAdj, 2),
    check: () => powerBy(0.2, 306, 0.05 / 28),
    unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(pwRaw, 2), say: 'That is the power at α = 0.05. With 28 tests at the Bonferroni level each test uses α = 0.05 ÷ 28, a much higher bar.' },
      { value: rnd(C.power(PW.rho, PW.n, 0.05 / 8), 2), say: 'Bonferroni divides α by the number of tests, the 8 × 7 ÷ 2 = 28 pairs, not by the 8 measures.' },
      { value: rnd(C.power(PW.rho, PW.n, 0.05 * 28), 2), say: 'Bonferroni makes each test stricter: divide α by 28, don’t multiply it.' },
    ],
    solution: `Each test uses α = 0.05 ÷ 28 = ${fx(0.05 / 28, 5)}, so z₁₋α/₂ = ${fx(qNorm(1 - 0.05 / 56), 3)}. atanh 0.2 × √${PW.n - 3} = ${fx(Math.atanh(0.2) * Math.sqrt(PW.n - 3), 3)}; power ≈ Φ(${fx(Math.atanh(0.2) * Math.sqrt(PW.n - 3), 3)} − ${fx(qNorm(1 - 0.05 / 56), 3)}) = ${fx(pwAdj, 2)}, against ${fx(pwRaw, 2)} for a single test at 0.05. Protecting against false alarms across 28 tests costs about a third of the chance of finding a real ρ of 0.2, and seasonal days carry less information than 306 independent ones, so the true power is lower still.`,
  },

  // ================================================================ Module 3: when correlations mislead
  {
    id: 'b05-fn-11', lesson: 'outliers-and-influence', type: 'num', kind: 'numerical',
    prompt: `Kelderby Plant Nursery (fictional) recorded the day’s high and plants sold on ten Sundays. 6 June was its plant fair; 4 July was a heatwave. Across all ten, r = ${fx(KINF.r, 3)}. Leave out each Sunday in turn. What is r without the Sunday whose removal changes r the most? Give three decimal places.`,
    data: { table: { head: ['Sunday', 'High (°C)', 'Plants sold (dozens)'], rows: KX.map((x, i) => [KDAYS[i], String(x), String(KY[i])]), align: ['l', 'r', 'r'] } },
    answer: rnd(KINF.without[KINF.most], 3),
    check: () => { const rs = KX.map((_, i) => C.pearson(KX.filter((__, j) => j !== i), KY.filter((__, j) => j !== i)).r); const full = C.pearson(KX, KY).r; return rs.reduce((b, r) => (Math.abs(r - full) > Math.abs(b - full) ? r : b), full); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(KINF.without[kFair], 3), say: 'The plant fair is the most unusual in sales, but it sits mid-range in temperature, so its pull on r is limited. The heatwave Sunday is far out in x and below the trend, which gives it far more leverage.' },
      { value: rnd(KINF.r, 3), say: 'That is r with every Sunday. Recalculate leaving each one out and keep the largest change.' },
    ],
    solution: `Leaving out each Sunday in turn: without the plant fair r = ${fx(KINF.without[kFair], 3)}; without the heatwave (${KDAYS[kHot]}) r = ${fx(KINF.without[kHot], 3)}; without any other Sunday r stays between ${fx(Math.min(...KINF.without.filter((_, i) => i !== kFair && i !== kHot)), 3)} and ${fx(Math.max(...KINF.without.filter((_, i) => i !== kFair && i !== kHot)), 3)}. The heatwave changes r most: at 34 °C it is far from the other highs (12–21 °C) and sells fewer plants than the trend implies, so it has leverage. Both days are real: report r with and without them, and say that the link is described for highs of 12–21 °C.`,
  },
  {
    id: 'b05-fn-12', lesson: 'outliers-and-influence', type: 'multi', kind: 'applied',
    prompt: 'Ana’s year-end report will give the correlation between footfall and transactions over all 612 café-days. The raw log holds Millbrook’s 14 September slip (an extra digit) and Harbourside’s five festival days, which the tills confirm. Select all the steps that handle these days honestly.',
    options: [
      'Correct the slip from the door counter’s export, and record the change.',
      'Keep the festival days, and report r both with and without them.',
      'Give Spearman’s ρ beside r, as a check on how much single days drive r.',
      'Delete every day more than three standard deviations from the mean on either variable.',
      'Replace the festival days’ footfall with Harbourside’s average footfall.',
      'Leave out whichever unusual days make the correlation look weaker.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A |z| rule deletes genuine days such as the festivals, and deletes the slip instead of correcting it. Check unusual values against their source.',
      4: 'That invents data: the festival days really were that busy.',
      5: 'Choosing which days to keep by their effect on r is choosing the answer.',
    },
    solution: `Fix known errors at source (the slip: ${int(SLIP.recorded)} for ${SLIP.actual}, which drops r from ${fx(DERIVED.footTrans.r, 3)} to ${fx(DERIVED.footTransRaw.r, 3)} when left in); keep genuine extreme days and show their effect; and use ρ (${fx(DERIVED.footTransRhoRaw.rho, 3)} even with the slip) as a robustness check, not as a reason to skip the checking.`,
  },
  {
    id: 'b05-fn-13', lesson: 'nonlinear-and-restricted', type: 'mc', kind: 'conceptual',
    prompt: `At Millbrook, footfall and transactions correlate at r = ${fx(mAllR, 3)} over all 306 days but only ${fx(mWkR, 3)} over its ${wkF.length} weekend days. Does footfall matter less for transactions at weekends?`,
    options: [
      `Not necessarily: weekend footfall spans a narrow range (SD ${fx(sd(wkF), 1)} against ${fx(sd(mFoot), 1)}), and a narrow range shrinks r even at the same buying rate.`,
      `Yes: at weekends a straight line in footfall accounts for only ${pc(mWkR ** 2)} of the variance in transactions, so it tells Ana less.`,
      `No, but for another reason: ${wkF.length} weekend days are fewer than 306, and a smaller sample always gives a smaller correlation.`,
      'Yes, and the drop shows the relationship is curved at weekends, so Spearman’s ρ should replace r for weekend days.',
    ],
    answer: 0,
    feedback: {
      1: `r² falls, but because the weekend days vary so little in footfall. The rate is the same: on average ${pc(convWk, 1)} of weekend visitors buy, against ${pc(convAll, 1)} over all days.`,
      2: 'Sample size changes how precise r is, not its expected size. The drop comes from the narrow range.',
      3: 'Nothing points to a curve; the weekend points lie on the same line as the rest, over a short stretch of it.',
    },
    solution: `Weekend footfall at Millbrook is low and steady (SD ${fx(sd(wkF), 1)} visitors against ${fx(sd(mFoot), 1)}), so the same scatter around the line is a larger share of a smaller spread, and r falls to ${fx(mWkR, 3)}. The relationship itself hasn’t changed: weekend visitors convert at ${pc(convWk, 1)}, all visitors at ${pc(convAll, 1)}. To compare how footfall relates to transactions across subsets with different ranges, compare the rates (or slopes, in B06), not r.`,
  },
  {
    id: 'b05-fn-14', lesson: 'nonlinear-and-restricted', type: 'num', kind: 'numerical',
    prompt: `A hotel group (fictional) measures guest satisfaction with a short scale whose reliability is ${fx(REL.x)} and intention to return with one whose reliability is ${fx(REL.y)}. Even if the true satisfaction and the true intention were perfectly correlated, what is the largest correlation it could expect to observe between the two scores? Give two decimal places.`,
    answer: rnd(Math.sqrt(REL.x * REL.y), 2),
    check: () => 1 * Math.sqrt(0.64 * 0.81),
    unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(REL.x * REL.y, 2), say: 'The attenuation factor is the square root of the product of the reliabilities: √(0.64 × 0.81).' },
      { value: 1, say: 'Measurement error adds random scatter to both scores, so even a perfect true correlation shows up weaker: r_obs ≈ r_true × √(rel_x rel_y).' },
    ],
    solution: `r_obs ≈ r_true × √(rel_x rel_y) = 1 × √(${fx(REL.x)} × ${fx(REL.y)}) = √${fx(REL.x * REL.y, 4)} = ${fx(Math.sqrt(REL.x * REL.y), 2)}. With these scales an observed correlation of 0.5 is far from weak: it is ${pc(0.5 / Math.sqrt(REL.x * REL.y))} of the most the scales allow. Better measures, not more guests, would raise it.`,
  },
  {
    id: 'b05-fn-15', lesson: 'nonlinear-and-restricted', type: 'mc', kind: 'applied',
    prompt: `Across the 612 café-days, peak load (peak transactions per barista hour) and the peak wait correlate at r = ${fx(loadR, 2)}. On days with a load of 7 or less, r = ${fx(loadLowR, 2)}; above 7, r = ${fx(loadHighR, 2)}. The average wait is ${fx(waitBand(0, 7), 1)} minutes at loads up to 7, ${fx(waitBand(8, 9), 1)} between 8 and 9 and ${fx(waitBand(10, 99), 1)} above 10. Ana wants a rostering rule. Which is the best use of these figures?`,
    options: [
      'Roster to keep the expected peak load at or below about 7, where waits stay flat, then check the rule with a trial.',
      `Cut the load evenly on every day: with r = ${fx(loadR, 2)}, each extra transaction per barista hour adds about the same wait wherever the load starts.`,
      `Ignore load on most days: r = ${fx(loadLowR, 2)} at loads of 7 or less shows that load and waits are unrelated, so staffing only matters above 7.`,
      `Use Spearman’s ρ instead: at ${fx(DERIVED.loadWaitRho.rho, 2)} it is higher than r, which shows that the relationship is a straight line after all.`,
    ],
    answer: 0,
    feedback: {
      1: 'A single r averages a flat stretch and a steep one. The same extra load costs almost nothing at 5 and a lot at 10.',
      2: 'Load still matters at 7 or less: it decides whether a day stays below the threshold. The flat part is the reason to aim there.',
      3: 'ρ above r says the relationship is monotonic but not straight: exactly the hockey stick.',
    },
    solution: `The waits follow a hockey stick: flat (r ≈ ${fx(loadLowR, 2)}) up to a load of about 7 and steep above it (r ≈ ${fx(loadHighR, 2)}). The overall r = ${fx(loadR, 2)} understates how strong the link is where it matters and implies a constant rate that isn’t there. A rule built on the threshold (enough baristas to keep the expected load near 7) uses the shape. The case says extra baristas do shorten waits, but in Ana’s log it is an association: a rostering trial would confirm the threshold before she relies on it.`,
  },
  {
    id: 'b05-fn-16', lesson: 'groups-and-simpsons-paradox', type: 'num', kind: 'numerical',
    prompt: `Each café has 306 days. Harbourside’s means are ${fx(SIMP.mFH, 2)} visitors and an average ticket of $${fx(SIMP.mTH, 3)}; Millbrook’s, ${fx(SIMP.mFM, 2)} visitors and $${fx(SIMP.mTM, 3)}. Within the cafés (each day measured from its own café’s means), the sums of products of footfall and average ticket add up to ${int(SIMP.spW)}. Around the overall means, the sums of squares are ${int(SIMP.ssF)} for footfall and ${fx(SIMP.ssT, 1)} for the average ticket. What is the pooled correlation of footfall and average ticket over all 612 days? Give two decimal places.`,
    answer: rnd(simpR(SIMP), 2),
    check: () => { const mf = (SIMP.mFH + SIMP.mFM) / 2, mt = (SIMP.mTH + SIMP.mTM) / 2; const between = 306 * (SIMP.mFH - mf) * (SIMP.mTH - mt) + 306 * (SIMP.mFM - mf) * (SIMP.mTM - mt); return (SIMP.spW + between) / Math.sqrt(SIMP.ssF * SIMP.ssT); },
    unit: '', places: 2, tol: 0.006,
    wrong: [
      { value: rnd(SIMP.spW / Math.sqrt(SIMP.ssF * SIMP.ssT), 2), say: 'That uses only the within-café part. The pooled sum of products adds the between-café part, Σ n_g (x̄_g − x̄)(ȳ_g − ȳ), which is large and negative.' },
      { value: rnd(simpBetween(SIMP) / Math.sqrt(SIMP.ssF * SIMP.ssT), 2), say: 'That uses only the between-café part. Add the within-café sum of products to it.' },
    ],
    solution: `Overall means: ${fx((SIMP.mFH + SIMP.mFM) / 2, 3)} visitors and $${fx((SIMP.mTH + SIMP.mTM) / 2, 4)}. Between-café part: 306 × [(${fx(SIMP.mFH - (SIMP.mFH + SIMP.mFM) / 2, 3)})(${fx(SIMP.mTH - (SIMP.mTH + SIMP.mTM) / 2, 4)}) + (${fx(SIMP.mFM - (SIMP.mFH + SIMP.mFM) / 2, 3)})(${fx(SIMP.mTM - (SIMP.mTH + SIMP.mTM) / 2, 4)})] = ${int(simpBetween(SIMP))}. Pooled sum of products = ${int(SIMP.spW)} + (${int(simpBetween(SIMP))}) = ${int(SIMP.spW + simpBetween(SIMP))}; r = ${int(SIMP.spW + simpBetween(SIMP))} ÷ √(${int(SIMP.ssF)} × ${fx(SIMP.ssT, 1)}) = ${fx(simpR(SIMP), 3)} (the log gives ${fx(DERIVED.footTicket.r, 3)}). Millbrook has more visitors and smaller tickets, and that gap outweighs the positive link inside each café.`,
  },
  {
    id: 'b05-fn-17', lesson: 'groups-and-simpsons-paradox', type: 'mc', kind: 'conceptual',
    prompt: `A consultant averages footfall and the average ticket for each of the 20 café-months (ten months at each café) and finds r = ${fx(ecoR, 2)} across them. She concludes: “In months when more people come in, each customer spends less.” What is wrong?`,
    options: [
      `The 20 points form two café clusters and r mostly measures the gap; within each café, busier months had bigger tickets (r = ${fx(ecoH, 2)} and ${fx(ecoM, 2)}).`,
      `Nothing: averaging removes day-to-day noise, so ${fx(ecoR, 2)} across café-months is a more reliable figure than any daily correlation.`,
      'Twenty points are too few for a correlation; with more months the figure would turn positive.',
      `Monthly averages always give weaker correlations than daily data, so the true daily link is even more negative than ${fx(ecoR, 2)}.`,
    ],
    answer: 0,
    feedback: {
      1: 'Averaging removes the variation inside groups, which can make an ecological correlation stronger, not more trustworthy, and here it keeps the gap between the cafés.',
      2: 'The sign comes from mixing the cafés, not from the number of points.',
      3: `Ecological correlations are usually stronger than individual ones, and here the daily links inside each café are positive (${fx(DERIVED.footTicketH.r, 2)} and ${fx(DERIVED.footTicketM.r, 2)}).`,
    },
    solution: `Café-month averages are an ecological correlation: they describe the 20 months, and mixing the cafés puts Millbrook’s ten busy, small-ticket months against Harbourside’s quieter, larger-ticket ones. Within each café the monthly averages rise together (${fx(ecoH, 2)} and ${fx(ecoM, 2)}), as the daily figures do (${fx(DERIVED.footTicketH.r, 2)}, ${fx(DERIVED.footTicketM.r, 2)}). Neither the monthly nor the daily figures say what an individual customer spends.`,
  },

  // ================================================================ Module 4: many variables and causation
  {
    id: 'b05-fn-18', lesson: 'correlation-matrices', type: 'steps', kind: 'applied',
    prompt: `Ana builds a correlation matrix of eight daily measures for Harbourside’s ${SEPH.length} September days: 28 pairs. The table lists the ${sepSig.length} pairs with p below 0.05 (two-sided t tests), sorted; the other ${28 - sepSig.length} pairs have p above 0.05. Days in a month resemble their neighbours, so the p-values are approximate.`,
    data: { table: { head: ['Pair', 'r', 'p'], rows: sepSig.map((x) => [`${x.a} – ${x.b}`, fx(x.r, 3), sig3(x.p)]), align: ['l', 'r', 'r'] } },
    steps: [
      {
        id: 'b05-fn-18-s1', type: 'num',
        prompt: 'How many of the 28 pairs remain significant after Holm’s method, with a family-wise error rate of 0.05?',
        answer: sepHolm,
        check: () => { const s = sepPairs.map((x) => x.p).sort((a, b) => a - b); let k = 0; while (k < s.length && s[k] <= 0.05 / (s.length - k)) k++; return k; },
        unit: 'pairs', places: 0, tol: 0.5,
        wrong: [
          { value: sepSig.length, say: 'That counts p below 0.05 with no adjustment; with 28 tests, about 1.4 false alarms are expected even if nothing is related.' },
          { value: sepBH, say: 'That is Benjamini–Hochberg, which controls the false discovery rate. Holm controls the chance of any false rejection: the k-th smallest p against 0.05 ÷ (28 − k + 1).' },
        ],
        solution: `Holm compares the k-th smallest p with 0.05 ÷ (29 − k): 0.05 ÷ 28 = 0.00179 for the first, rising to 0.05 ÷ 21 = 0.00238 for the eighth. The first ${sepHolm} are below their thresholds; the ${sepHolm + 1}th (${sepPairs[sepHolm].a} – ${sepPairs[sepHolm].b}, p = ${sig3(sepPairs[sepHolm].p)}) is above 0.05 ÷ ${29 - (sepHolm + 1)} = ${(0.05 / (29 - (sepHolm + 1))).toPrecision(3)}, so the procedure stops: ${sepHolm} pairs.`,
      },
      {
        id: 'b05-fn-18-s2', type: 'mc',
        prompt: `Peak barista hours and the peak wait are not in the table: r = ${fx(sepHW.r, 2)} (p = ${fx(sepHW.p, 2)}). The manager concludes that staffing makes no difference to waits. What would a partial correlation add?`,
        options: [
          'It compares days with the same trade: busy days bring more baristas and longer waits, which can hide shorter waits from more baristas.',
          'Holding transactions fixed would make the correlation significant by adding more days to the test, since a partial correlation uses all the variables at once.',
          'Nothing: a correlation this close to zero means the two variables are unrelated, so no third variable can change the picture.',
          'Holding peak barista hours fixed would show how much of the wait is caused by staffing, which the simple correlation cannot show.',
        ],
        answer: 0,
        feedback: {
          1: 'A partial correlation uses the same days; it changes what is compared, not the number of rows (and it costs a degree of freedom).',
          2: 'An r near zero can hide two opposing links: more baristas on busy days (raising waits) and more baristas cutting waits at a given trade.',
          3: 'You can’t hold one of the two variables of interest fixed; the third variable here is transactions. And a partial correlation is still a correlation, not a measure of cause.',
        },
        solution: `Holding transactions fixed, September’s partial correlation of hours and waits is ${fx(sepHWp.r, 2)} (t test on ${sepHWp.df} df, p ${p3(sepHWp.p)}): on days with the same trade, more baristas went with shorter waits. The near-zero simple r combined two opposing links. A matrix is a map for questions; this cell’s question needs the third variable.`,
      },
    ],
    solution: `Of the ${sepSig.length} pairs below 0.05, ${sepHolm} survive Holm (the footfall–transactions–sales chain, the high and the iced share, and staffing with trade); the rest, including rain’s links, could easily be among the false alarms expected from 28 tests. The near-zero r for staffing and waits (${fx(sepHW.r, 2)}) becomes ${fx(sepHWp.r, 2)} holding transactions fixed: the matrix pointed to the wrong conclusion until the third variable was brought in.`,
  },
  {
    id: 'b05-fn-19', lesson: 'correlation-matrices', type: 'num', kind: 'numerical',
    prompt: `Ana’s 612-day matrix gives r = ${fx(BND.ft, 3)} for footfall and transactions and r = ${fx(BND.th, 3)} for transactions and peak barista hours. Before looking, what is the smallest value the correlation of footfall with peak barista hours could take? Give three decimal places.`,
    answer: rnd(lowBound(BND.ft, BND.th), 3),
    check: () => 0.981 * BND.th - Math.sqrt((1 - 0.981 ** 2) * (1 - BND.th ** 2)) + (BND.ft - 0.981) * BND.th,
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(BND.ft * BND.th, 3), say: 'The product is the centre of the possible range, not its lower end. Subtract √((1 − r₁²)(1 − r₂²)).' },
      { value: rnd(BND.ft * BND.th + Math.sqrt((1 - BND.ft ** 2) * (1 - BND.th ** 2)), 3), say: 'That is the upper end of the range. The smallest value subtracts the square root.' },
      { value: rnd(Math.min(BND.ft, BND.th), 3), say: 'Correlations aren’t bounded by the smaller of the other two. The range is r₁ r₂ ± √((1 − r₁²)(1 − r₂²)).' },
    ],
    solution: `The third correlation must lie in r₁r₂ ± √((1 − r₁²)(1 − r₂²)) = ${fx(BND.ft * BND.th, 4)} ± ${fx(Math.sqrt((1 - BND.ft ** 2) * (1 - BND.th ** 2)), 4)}, so at least ${fx(lowBound(BND.ft, BND.th), 3)}. The matrix shows ${fx(MATRIX.r[2][6], 3)}. Footfall and transactions are nearly redundant (r = ${fx(BND.ft, 3)}): whatever goes with one must go with the other, so a dashboard needs only one of them.`,
  },
  {
    id: 'b05-fn-20', lesson: 'partial-correlation', type: 'steps', kind: 'applied',
    prompt: `Harbourside, March 2027 (no festival days): the day’s rain in B, footfall in C and sales in D. Rain keeps people away from the waterfront. Ana asks how rain relates to sales.`,
    steps: [
      {
        id: 'b05-fn-20-s1', type: 'formula',
        prompt: 'In G1, calculate the partial correlation of rain and sales holding footfall fixed, in one formula from the three columns.',
        sheet: { cells: { A1: 'Day', B1: 'Rain (in)', C1: 'Footfall', D1: 'Sales ($)', F1: 'Partial r', ...col('A', 2, MAR.map((r) => dayLabel(r[at('date')]))), ...col('B', 2, marR), ...col('C', 2, marF), ...col('D', 2, marS) } },
        cell: 'G1', view: `A1:G${marN}`, maxHeight: '22rem', formats: { B: '0.00', D: '#,##0.00', G1: '0.000' }, widths: { D: 11, F: 10 },
        answer: `=(CORREL(B2:B${marN},D2:D${marN})-CORREL(B2:B${marN},C2:C${marN})*CORREL(C2:C${marN},D2:D${marN}))/SQRT((1-CORREL(B2:B${marN},C2:C${marN})^2)*(1-CORREL(C2:C${marN},D2:D${marN})^2))`,
        alt: [
          `=(CORREL(D2:D${marN},B2:B${marN})-CORREL(C2:C${marN},B2:B${marN})*CORREL(D2:D${marN},C2:C${marN}))/SQRT((1-RSQ(B2:B${marN},C2:C${marN}))*(1-RSQ(C2:C${marN},D2:D${marN})))`,
          `=(CORREL(B2:B${marN},D2:D${marN})-CORREL(B2:B${marN},C2:C${marN})*CORREL(C2:C${marN},D2:D${marN}))/SQRT(1-CORREL(B2:B${marN},C2:C${marN})^2)/SQRT(1-CORREL(C2:C${marN},D2:D${marN})^2)`,
        ],
        require: ['CORREL'],
        wrong: [
          { formula: `=CORREL(B2:B${marN},D2:D${marN})-CORREL(B2:B${marN},C2:C${marN})*CORREL(C2:C${marN},D2:D${marN})`, say: 'That is the numerator. Divide by √((1 − r_RF²)(1 − r_FS²)).' },
          { formula: `=(CORREL(B2:B${marN},D2:D${marN})-CORREL(B2:B${marN},C2:C${marN})*CORREL(C2:C${marN},D2:D${marN}))/SQRT((1-CORREL(B2:B${marN},D2:D${marN})^2)*(1-CORREL(C2:C${marN},D2:D${marN})^2))`, say: 'The denominator uses the two correlations with the variable held fixed (footfall): r_RF and r_FS, not r_RS.' },
          { formula: `=CORREL(B2:B${marN},D2:D${marN})`, say: 'That is the simple correlation. Holding footfall fixed needs all three pairwise correlations.' },
        ],
        solution: `<x>=(CORREL(B2:B32,D2:D32)-CORREL(B2:B32,C2:C32)*CORREL(C2:C32,D2:D32))/SQRT((1-CORREL(B2:B32,C2:C32)^2)*(1-CORREL(C2:C32,D2:D32)^2))</x> = ${fx(marP.r, 3)}.`,
      },
      {
        id: 'b05-fn-20-s2', type: 'mc',
        prompt: `The simple correlation of rain with sales in March is ${fx(marRS, 2)}. Footfall lies on the path from rain to sales. Which question does the partial correlation answer?`,
        options: [
          'Whether, on March days with the same number of visitors, wetter days sold less: it sets aside the route by which rain cuts trade.',
          'Whether rain goes with lower sales at all in March, now cleaned of the confounding that footfall caused in the simple correlation.',
          'Whether rain causes lower sales in March, since holding footfall fixed removes every alternative explanation for the link.',
          'Whether footfall goes with sales once the day’s rain is held fixed, which tells Ana how much of trade depends on the visitors.',
        ],
        answer: 0,
        feedback: {
          1: 'Footfall isn’t a confounder here: rain keeps away the visitors who would buy. Holding a mediator fixed removes part of the link being asked about.',
          2: 'Holding one variable fixed removes at most that variable’s part; nothing about a partial correlation rules out every other explanation.',
          3: 'That is a different partial correlation (footfall with sales, holding rain fixed).',
        },
        solution: `With footfall held fixed, the partial correlation answers a narrower question: at a given number of visitors, did wetter days sell less? It is ${fx(marP.r, 2)}, far weaker than the simple ${fx(marRS, 2)} and, with ${MAR.length} days (most of them dry), not clearly different from zero (p = ${fx(marP.p, 2)}). Most of rain’s link with sales runs through the visitors it keeps away, which is part of the answer to Ana’s question, “do wet March days go with lower sales?”: the simple correlation answers that.`,
      },
    ],
    solution: `The partial correlation of rain and sales holding footfall fixed is ${fx(marP.r, 3)}, against a simple r of ${fx(marRS, 3)}. Footfall is a mediator (rain → fewer visitors → lower sales), so holding it fixed answers “at a given footfall, do wet days sell less?”, not “do wet days go with lower sales?”. Hold confounders fixed, not the path you are asking about; and rain’s many dry days make any of these figures rough.`,
  },
  {
    id: 'b05-fn-21', lesson: 'partial-correlation', type: 'num', kind: 'numerical',
    prompt: `Over Harbourside’s ${P2.n} June days, the partial correlation of peak barista hours and the peak wait, holding both transactions and the day’s high fixed, is ${fx(P2.r, 3)}. What is the two-sided p-value for the test that the population partial correlation is zero? Give three decimal places.`,
    answer: rnd(partialP(P2.r, P2.n, P2.k), 3),
    check: () => { const df = 30 - 2 - 2; const t = P2.r * Math.sqrt(df) / Math.sqrt(1 - P2.r ** 2); return 2 * tCdf(-Math.abs(t), df); },
    unit: '', places: 3, tol: 0.0015,
    wrong: [
      { value: rnd(partialP(P2.r, P2.n, 0), 3), say: 'That uses n − 2 degrees of freedom, as for a simple correlation. Each variable held fixed costs one more: n − 2 − k = 26.' },
      { value: rnd(partialP(P2.r, P2.n, 1), 3), say: 'Two variables are held fixed (transactions and the high), so df = 30 − 2 − 2 = 26, not 27.' },
      { value: rnd(partialP(P2.r, P2.n, P2.k) / 2, 3), say: 'That is one tail; the test asked for is two-sided.' },
    ],
    solution: `df = n − 2 − k = ${P2.n} − 2 − 2 = ${P2.n - 4}. t = r √df ÷ √(1 − r²) = ${fx(P2.r, 3)} × √${P2.n - 4} ÷ √(1 − ${fx(P2.r ** 2, 4)}) = ${fx(P2.r * Math.sqrt(P2.n - 4) / Math.sqrt(1 - P2.r ** 2), 3)}; <x>=T.DIST.2T(${fx(Math.abs(P2.r * Math.sqrt(P2.n - 4) / Math.sqrt(1 - P2.r ** 2)), 3)},26)</x> = ${fx(partialP(P2.r, P2.n, P2.k), 3)}. At a given trade and temperature, June days with more baristas had shorter waits. Neighbouring days are alike, so treat the p-value as approximate.`,
  },
  {
    id: 'b05-fn-22', lesson: 'correlation-and-causation', type: 'mc', kind: 'applied',
    prompt: 'Ana is drafting one sentence on footfall and the average ticket for her year-end report. Which sentence says what the log supports, and no more?',
    options: [
      `“At each café, busier days tended to have larger tickets (r = ${fx(DERIVED.footTicketH.r, 2)}, ${fx(DERIVED.footTicketM.r, 2)}); pooled, the link reverses because Millbrook has more visitors and smaller tickets. Cause isn’t shown.”`,
      `“More visitors lower what each customer spends: across both cafés footfall and the average ticket correlate at ${fx(DERIVED.footTicket.r, 2)}, so Lantern should not chase footfall at the expense of the ticket at either of its two cafés.”`,
      `“Busier days raise the average ticket at both cafés (r = ${fx(DERIVED.footTicketH.r, 2)} and ${fx(DERIVED.footTicketM.r, 2)}), so events that bring in more people will increase what each customer spends.”`,
      `“Footfall and the average ticket are unrelated: the cafés disagree with the pooled figure, so the correlations cancel out and the log shows no reliable link.”`,
    ],
    answer: 0,
    feedback: {
      1: 'The pooled figure mixes two cafés and reverses the within-café link; and even a correct correlation wouldn’t justify a causal recommendation.',
      2: '“Raise” and “will increase” claim a cause. Busy days may differ in other ways (weekends, festivals, the weather, who comes in).',
      3: 'The within-café correlations are clear and agree with each other; the pooled one differs for a known reason, not because nothing is there.',
    },
    solution: 'A good finding names the association, its size, where it holds and why the pooled figure differs, and stops short of cause. Footfall and the ticket rise together inside each café; the pooled −0.32 is Simpson’s paradox; a test of whether events raise the ticket would need a design that varies footfall by something other than demand.',
  },
  {
    id: 'b05-fn-23', lesson: 'correlation-and-causation', type: 'classify', kind: 'conceptual',
    prompt: 'Ana is weighing whether extra peak baristas shorten waits. Classify each piece of evidence by the consideration (from Bradford Hill’s list) it bears on.',
    items: [
      'At a given number of transactions, more baristas went with shorter waits at both cafés and in every month of the year.',
      'The further the load per barista hour climbed above seven, the longer the wait became.',
      'On Tuesdays chosen by lot, Millbrook rostered an extra barista; waits on those Tuesdays were shorter than on the others.',
      'A barista makes a drink in about a minute, so a queue clears faster when there are two of them working.',
      'The roster is fixed a week ahead, so the hours are set before the day’s waits happen.',
    ],
    categories: ['Consistency', 'Dose–response (gradient)', 'Experiment', 'Plausibility (mechanism)', 'Temporality (timing)'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'The same association in different places and times.',
      1: 'More of the exposure, more of the effect, step by step.',
      2: 'Assignment by lot, so nothing else differs systematically.',
      3: 'A believable mechanism.',
      4: 'The cause comes before the effect.',
    },
    solution: 'Hill’s considerations are things to weigh, not a checklist: consistency (both cafés, every month), a gradient (waits rise with load), an experiment (the Tuesday trial, the strongest), plausibility (how a queue clears) and timing (the roster is set first). Together they make a much stronger case than any correlation alone.',
  },
  {
    id: 'b05-fn-24', lesson: 'correlation-and-causation', type: 'mc', kind: 'conceptual',
    prompt: `In a correlation matrix of eight daily measures for Harbourside’s September, rain and the iced share correlate at r = ${fx(rainIced.r, 2)} (p = ${fx(rainIced.p, 3)}, ${SEPH.length} days). The manager proposes ordering more ice for rainy days. What most threatens reading this as a real link?`,
    options: [
      `Chance: it is one of 28 pairs tested, about 1.4 of which would pass by luck, and Holm’s adjusted p is ${fx(rainIced.adj, 2)}.`,
      'Reverse causation: cafés that serve more iced drinks attract the rain clouds to the waterfront on those days.',
      'A common trend: rain and the iced share both rise steadily through September, which inflates any correlation between them.',
      'Selection: only the days on which customers bought iced drinks were recorded in the log for September.',
    ],
    answer: 0,
    feedback: {
      1: 'Drinks can’t change the weather; reverse causation needs a plausible arrow the other way.',
      2: 'Nothing suggests steady trends within one month; and the iced share follows temperature, not rain.',
      3: 'Every day is in the log; no rows were chosen by their values.',
    },
    solution: `Screening 28 pairs at 0.05 is expected to turn up about 28 × 0.05 = 1.4 significant pairs by chance alone. This one has p = ${fx(rainIced.p, 3)}, an adjusted p of ${fx(rainIced.adj, 2)} under Holm, no plausible mechanism (the iced share follows the temperature), and over the whole year, both cafés, the two correlate at only ${fx(MATRIX.r[1][5], 2)}. Treat it as a lead to check on new data, not a reason to order ice.`,
  },
];
