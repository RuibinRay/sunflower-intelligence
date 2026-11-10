// assess-final.js — B06 final assessment: 24 questions across all four modules and all six of the course’s outcomes,
// two or three per lesson (five for module 1, five for module 2, seven for module 3 and seven for module 4). 70% passes.
// Mixed conceptual, numerical and applied items. Four are formula items on worksheets sliced from the café log, one of
// them a steps item with two formula steps: footfall estimated from transactions with the line of footfall on
// transactions (b06-fn-1, Harbourside’s weekdays 12 July – 15 August, the transactions varied on the copies); the fitted
// value and the half-width of the 95% confidence interval for the mean at a forecast high (b06-fn-6, Harbourside’s
// weekdays 1 June – 9 July, the high varied); the lower 95% limit of the weekend coefficient from LINEST with three x
// columns (b06-fn-12, Harbourside’s October); the median footfall for a given rain from the line of ln(footfall) on
// rain, back-transformed with EXP(TREND(LN(…))) (b06-fn-20, Harbourside’s weekdays 12 July – 20 August, the rain varied). Café values are scaled on the marking copies,
// so typed results fail.
// Items that combine lessons: x on y against y on x for an estimate (fn-1: least-squares-line, residuals-and-r-squared);
// rescaling, centring and swapping the axes against R² (fn-2: least-squares-line, residuals-and-r-squared); R² from the
// residual standard error and s_y (fn-3: least-squares-line, residuals-and-r-squared); a lower R² but a smaller typical
// miss on days with a narrow range of transactions (fn-4: residuals-and-r-squared, least-squares-line); a straight line for the wait judged from its
// residuals by load band (fn-5: residuals-and-r-squared, transformations-and-influence); a fitted value, the mean’s
// confidence interval, and why a forecast below the data’s highs is extrapolation (fn-6: prediction-and-intervals,
// inference-for-coefficients); a pooled slope over both cafés against each café’s slope from a café × high term, with a sentence on why
// the printed SE is no guide either way (fn-8:
// inference-for-coefficients, categorical-predictors-and-interactions, assumptions-and-diagnostics); a prediction
// interval from a log model, back-transformed (fn-9: prediction-and-intervals, transformations-and-influence); a
// constant-spread prediction interval against the weekend and weekday residual spreads (fn-10: prediction-and-intervals,
// assumptions-and-diagnostics); why the high’s slope halves when the build-up is added (fn-11: multiple-regression,
// multicollinearity-and-model-choice); a weekend coefficient’s interval from LINEST (fn-12: multiple-regression,
// inference-for-coefficients); a café × weekend prediction, then whether its prediction interval fits that kind of day
// (fn-13: categorical-predictors-and-interactions, prediction-and-intervals, assumptions-and-diagnostics); a pooled
// conversion slope that vanishes with a café dummy, as the generator plants (fn-14: categorical-predictors-and-interactions, multiple-regression); day
// dummies against a weekend dummy by a nested F test (fn-15: multicollinearity-and-model-choice,
// categorical-predictors-and-interactions); the correlation implied by the SE inflation of transactions beside footfall
// (fn-16:
// multicollinearity-and-model-choice, multiple-regression); heteroskedasticity, HC3 and the log model (fn-18:
// assumptions-and-diagnostics, transformations-and-influence); residuals in time order and the missing build-up (fn-19:
// assumptions-and-diagnostics, multiple-regression); the slip’s leverage and Cook’s distance (fn-21:
// transformations-and-influence, least-squares-line); an odds ratio read, the first ticket at which the probability reaches 0.5,
// and the classification judged against the base rate (fn-22: logistic-regression); Wald against likelihood-ratio for two terms
// (fn-23: logistic-regression, multicollinearity-and-model-choice); a hinge model’s prediction against a line’s (fn-24:
// transformations-and-influence, multiple-regression). Single-lesson items: fn-7, 17, 20.
// Outcomes: 1 (fn-1–5, 21), 2 (fn-4, 6–10, 12, 13), 3 (fn-11–14, 16, 19, 24), 4 (fn-11, 15–17, 23),
// 5 (fn-5, 8–10, 13, 18–21, 24), 6 (fn-22, 23).
// New questions, not copies of lesson exercises, module tests, the diagnostic or the project, and nothing from the
// project’s data or question. Café figures come from case.js (the corrected log; the raw log in fn-21, where the slip is
// the point); Keswin Cinema in fn-7 is fictional. Every figure shown is computed here with core/regression.js; claims
// about the data’s shape throw below if the data stop supporting them. Where a p-value or interval is printed on rows
// that aren’t independent (days in sequence; both cafés on the same days) the item says so, and where it says which way
// the error goes that direction is checked here. No hints; solutions are shown on review. Every num item’s `check`
// recomputes its answer, and every formula item is marked by its results on the sheet and on changed copies.
import { CLEAN_ROWS, CAFE_ROWS, CAFE_COLUMNS, SLIP, column, member, DERIVED } from './case.js?v=30';
import * as R from '../../../core/regression.js?v=30';
import { confusion } from '../../../core/classify.js?v=30';
import { pearson } from '../../../core/correlation.js?v=30';

const at = (n) => CAFE_COLUMNS.indexOf(n);
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const label = (r) => `${r[at('weekday')]} ${Number(r[at('date')].slice(8))} ${MON[Number(r[at('date')].slice(5, 7))]}`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const p3 = (p) => (p < 0.001 ? 'below 0.001' : fx(p, 3));
const tq = (df, conf = 0.95) => R.tQuantile(1 - (1 - conf) / 2, df);
const sum = (a) => a.reduce((s, v) => s + v, 0);
const avg = (a) => sum(a) / a.length;
const rms = (a) => Math.sqrt(avg(a.map((v) => v * v)));
const isWkd = (r) => !['Sat', 'Sun'].includes(r[at('weekday')]);
const slice = (cafe, from, to, keep = () => true, rows = CLEAN_ROWS) => rows.filter((r) => r[at('cafe')] === cafe && r[at('date')] >= from && r[at('date')] <= to && keep(r));
const get = (rows, n) => rows.map((r) => r[at(n)]);
const H = { cafe: 'Harbourside' }, M = { cafe: 'Millbrook' };
const fail = (what) => { throw new Error(`b06 final ${what}: the data no longer match the item’s wording`); };

/** Cluster-robust (sandwich) SE of every coefficient of a fit, with rows grouped by `groups` (used only to check the
 *  direction an item states for a dependence error; no item prints it). */
function clusterSE(f, Xcols, groups) {
  const p = f.p, rows = Array.from({ length: f.n }, (_, i) => [1, ...Xcols.map((c) => c[i])]);
  const S = new Map();
  rows.forEach((x, i) => { if (!S.has(groups[i])) S.set(groups[i], new Array(p).fill(0)); const s = S.get(groups[i]); x.forEach((v, a) => { s[a] += v * f.resid[i]; }); });
  const meat = Array.from({ length: p }, () => new Array(p).fill(0));
  for (const s of S.values()) for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) meat[a][b] += s[a] * s[b];
  const B = f.XtXinv, mul = (A, C) => A.map((r) => Array.from({ length: p }, (_, j) => r.reduce((t, v, k) => t + v * C[k][j], 0)));
  const V = mul(mul(B, meat), B);
  return V.map((r, i) => Math.sqrt(r[i]));
}

// ---------------------------------------------------------------- module 1
// fn-1 Harbourside, weekdays 12 July – 15 August: footfall and transactions
const S1 = slice('Harbourside', '2027-07-12', '2027-08-15', isWkd);
const s1F = get(S1, 'footfall'), s1T = get(S1, 'transactions'), s1L = S1.length + 1;
const F1onT = R.fit(s1F, { Transactions: s1T }), T1onF = R.fit(s1T, { Footfall: s1F });
const s1X = 50;
const s1Est = F1onT.predict([s1X]).yhat, s1Inv = (s1X - T1onF.beta[0]) / T1onF.beta[1];
const s1R = pearson(s1F, s1T).r;
// fn-2 Harbourside: footfall on the high, the year and July–August without festival days
const hHigh = column('high_f', H), hFoot = column('footfall', H);
const FH = R.fit(hFoot, { High: hHigh });
const SUMMER = slice('Harbourside', '2027-07-01', '2027-08-31', (r) => !r[at('festival')]);
const FS = R.fit(get(SUMMER, 'footfall'), { High: get(SUMMER, 'high_f') });
if (!(FS.r2 < 0.02 && FH.r2 > 0.15)) fail('fn-2/fn-4');
// fn-3 from r and s_y
const F3 = { r: rnd(pearson(hHigh, hFoot).r, 3), sy: rnd(Math.sqrt(FH.sst / 305), 2), n: hFoot.length };
const seFrom = (k) => k.sy * Math.sqrt((1 - k.r ** 2) * (k.n - 1) / (k.n - 2));
// fn-5 both cafés: the wait on the load, a straight line, residuals by band
const LOAD = column('peak_load'), WAIT = column('peak_wait_min');
const FW = R.fit(WAIT, { Load: LOAD });
const BANDS = [[0, 4], [4, 6], [6, 8], [8, 10], [10, 99]];
const bandOf = ([lo, hi]) => { const ix = LOAD.map((_, i) => i).filter((i) => LOAD[i] > lo && LOAD[i] <= hi); return { n: ix.length, e: avg(ix.map((i) => FW.resid[i])) }; };
const BAND = BANDS.map(bandOf);
if (!(BAND[0].e > 0 && BAND[1].e > 0 && BAND[2].e < 0 && BAND[3].e < 0 && BAND[4].e > 0)) fail('fn-5');
const bandName = ([lo, hi], i) => (i === 0 ? `Up to ${hi}` : hi === 99 ? `Above ${lo}` : `${lo} to ${hi}`);

// ---------------------------------------------------------------- module 2
// fn-6 Harbourside, weekdays 1 June – 9 July: the high and footfall
const S6 = slice('Harbourside', '2027-06-01', '2027-07-09', isWkd);
const s6X = get(S6, 'high_f'), s6Y = get(S6, 'footfall'), s6L = S6.length + 1;
const F6 = R.fit(s6Y, { High: s6X });
const s6At = 80, P6 = F6.predict([s6At]);
const s6Lag = R.lag1(Array.from(F6.resid));
const s6Cells = { A1: 'Day', B1: 'High (°F)', C1: 'Footfall', E1: 'Forecast high (°F)', F1: s6At, ...col('A', 2, S6.map(label)), ...col('B', 2, s6X), ...col('C', 2, s6Y) };
// fn-7 Keswin Cinema (fictional)
const CIN = { b: 3.2, F: 18.5, n: 40 };
// fn-8 both cafés pooled: footfall on the high
const F8 = R.fit(column('footfall'), { High: column('high_f') }), F8M = R.fit(column('footfall', M), { High: column('high_f', M) });
const se8day = clusterSE(F8, [column('high_f')], column('day'))[1];
if (!(se8day < F8.coefs[1].se)) fail('fn-8 (the day-clustered SE is no longer the smaller)');
// fn-9 / fn-10 Harbourside, log and level models on the high, rain, weekend, festival and build-up
const xsOf = (o) => ({ 'High (°F)': column('high_f', o), 'Rain (in)': column('rain_in', o), Weekend: column('weekend', o), Festival: column('festival01', o), 'Build-up': column('build_up', o) });
const LOGM = R.fit(column('log_footfall', H), xsOf(H)), LEVM = R.fit(column('footfall', H), xsOf(H));
const DAY9 = [75, 0, 1, 0, 1];
const P9 = LOGM.predict(DAY9), P10 = LEVM.predict(DAY9);
const hWe = column('weekend', H);
const sdWe = rms(Array.from(LEVM.resid).filter((_, i) => hWe[i])), sdWd = rms(Array.from(LEVM.resid).filter((_, i) => !hWe[i]));
if (!(sdWe > LEVM.sigma && LEVM.sigma > sdWd)) fail('fn-10');

// ---------------------------------------------------------------- module 3
// fn-11 Millbrook: footfall on the high, alone, with rain and weekend, and with the build-up
const mx = (n) => column(n, M);
const M11a = R.fit(mx('footfall'), { High: mx('high_f') });
const M11b = R.fit(mx('footfall'), { High: mx('high_f'), Rain: mx('rain_in'), Weekend: mx('weekend') });
const M11c = R.fit(mx('footfall'), { High: mx('high_f'), Rain: mx('rain_in'), Weekend: mx('weekend'), 'Build-up': mx('build_up') });
const r11 = { rain: pearson(mx('high_f'), mx('rain_in')).r, weekend: pearson(mx('high_f'), mx('weekend')).r, build: pearson(mx('high_f'), mx('build_up')).r };
const vif11 = R.vif([mx('high_f'), mx('rain_in'), mx('weekend'), mx('build_up')])[0];
if (!(Math.abs(M11b.beta[1] - M11a.beta[1]) < 0.1 && M11c.beta[1] < 0.6 * M11b.beta[1] && Math.abs(r11.rain) < 0.1 && Math.abs(r11.weekend) < 0.1 && r11.build > 0.25)) fail('fn-11');
// fn-12 Harbourside, October: footfall on the high, rain and weekend
const S12 = slice('Harbourside', '2027-10-01', '2027-10-31');
if (S12.some((r) => r[at('festival')])) fail('fn-12');
const s12W = S12.map((r) => (isWkd(r) ? 0 : 1)), s12L = S12.length + 1;
const F12 = R.fit(get(S12, 'footfall'), { High: get(S12, 'high_f'), Rain: get(S12, 'rain_in'), Weekend: s12W });
const s12Lag = R.lag1(Array.from(F12.resid));
// fn-13 the case’s footfall model (both cafés, café × weekend): a 70°F dry Saturday at Millbrook
const FM = DERIVED.footfallModel;
const DAY13 = [70, 0, 1, 1, 1, 0];
const P13 = FM.predict(DAY13);
const mbWe = column('millbrook').map((m, i) => m === 1 && column('weekend')[i] === 1);
const sdMbWe = rms(Array.from(FM.resid).filter((_, i) => mbWe[i]));
if (!(sdMbWe < FM.sigma)) fail('fn-13');
// fn-14 the average ticket on footfall, pooled and with a café dummy
const T14a = R.fit(column('avg_ticket'), { Footfall: column('footfall') });
const T14b = R.fit(column('avg_ticket'), { Footfall: column('footfall'), Millbrook: column('millbrook') });
if (!(T14a.beta[1] < 0 && T14b.beta[1] > 0 && T14a.coefs[1].p < 0.001 && T14b.coefs[1].p < 0.001)) fail('fn-14');
const meanFootH = avg(column('footfall', H)), meanFootM = avg(column('footfall', M));
// fn-15 Harbourside: six day dummies against a weekend dummy
const hx = (n) => column(n, H);
const BASE15 = { 'High (°F)': hx('high_f'), 'Rain (in)': hx('rain_in'), Festival: hx('festival01'), 'Build-up': hx('build_up') };
const DAYS15 = R.dummies(hx('weekday'), { reference: 'Mon', name: 'Day', levels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
const FULL15 = R.fit(hx('footfall'), { ...BASE15, ...DAYS15 }), RED15 = R.fit(hx('footfall'), { ...BASE15, Weekend: hx('weekend') });
const NF15 = R.nestedF(FULL15, RED15);
const c15 = (name) => FULL15.coefs.find((c) => c.name === name);
// fn-16 Millbrook: sales on footfall and transactions
const r16 = rnd(pearson(mx('footfall'), mx('transactions')).r, 3);
const S16a = R.fit(mx('sales'), { Transactions: mx('transactions') }), S16b = R.fit(mx('sales'), { Footfall: mx('footfall'), Transactions: mx('transactions') });

// ---------------------------------------------------------------- module 4
// fn-18 Harbourside level model: Breusch–Pagan, HC3; the log model’s Breusch–Pagan
const BP18 = R.breuschPagan(Object.values(xsOf(H)), LEVM.resid), BP18log = R.breuschPagan(Object.values(xsOf(H)), LOGM.resid);
const ROB18 = LEVM.robust();
const fest18 = LEVM.coefs[4], festR18 = ROB18.coefs[4];
if (!(BP18.p < 0.001 && BP18log.p > 0.1 && festR18.se > 2.5 * fest18.se && festR18.low > 0)) fail('fn-18');
// fn-19 Millbrook log model without the build-up: residuals by month and Durbin–Watson
const M19 = R.fit(mx('log_footfall'), { 'High (°F)': mx('high_f'), 'Rain (in)': mx('rain_in'), Weekend: mx('weekend') });
const M19b = R.fit(mx('log_footfall'), { 'High (°F)': mx('high_f'), 'Rain (in)': mx('rain_in'), Weekend: mx('weekend'), 'Build-up': mx('build_up') });
const mMonth = mx('month');
const BYMONTH = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({ m, e: avg(Array.from(M19.resid).filter((_, i) => mMonth[i] === m)) }));
const DW19 = R.durbinWatson(Array.from(M19.resid)), DW19b = R.durbinWatson(Array.from(M19b.resid));
if (!(BYMONTH[0].e < BYMONTH[1].e && BYMONTH[1].e < BYMONTH[2].e && BYMONTH[0].e < -0.1 && BYMONTH[9].e > 0.05 && DW19 < 1.2 && Math.abs(DW19b - 2) < 0.2)) fail('fn-19');
// fn-20 Harbourside, weekdays 12 July – 20 August: rain and ln(footfall)
const S20 = slice('Harbourside', '2027-07-12', '2027-08-20', isWkd);
const s20R = get(S20, 'rain_in'), s20F = get(S20, 'footfall'), s20L = S20.length + 1;
const F20 = R.fit(s20F.map(Math.log), { 'Rain (in)': s20R });
const s20At = 0.5, s20Pct = Math.exp(F20.beta[1] * s20At) - 1;
const s20Wet = s20R.filter((v) => v > 0).length, s20Hi = get(S20, 'high_f');
// fn-21 Millbrook’s September in the raw log: transactions on footfall
const S21raw = slice('Millbrook', '2027-09-01', '2027-09-30', () => true, CAFE_ROWS), S21 = slice('Millbrook', '2027-09-01', '2027-09-30');
const k21 = S21raw.findIndex((r) => r[at('date')] === SLIP.date);
const INF21 = R.influence([get(S21raw, 'footfall')], get(S21raw, 'transactions'));
const F21raw = R.fit(get(S21raw, 'transactions'), { Footfall: get(S21raw, 'footfall') }), F21 = R.fit(get(S21, 'transactions'), { Footfall: get(S21, 'footfall') });
// fn-22 / fn-23 the October joiners
const RM = DERIVED.returnModel;
const cR = (name) => RM.coefs.find((c) => c.name === name);
const PROFILE = [0, 1, 7, 0, 0];               // lives further away, notifications on, $7.00 first ticket, Harbourside, weekday
const P22 = RM.predictCI(PROFILE);
const CONF = confusion(member('returned'), RM.prob, 0.5);
const baseRate = DERIVED.returned / DERIVED.members;
const RED23 = R.logistic(member('returned'), { Near: member('near'), Notifications: member('notifications'), 'First ticket ($)': member('first_ticket') });
const LR23 = R.lrTest(RM, RED23);
// fn-24 both cafés: the wait on the load with a squared hinge at 7
const HINGE = LOAD.map((v) => Math.max(0, v - 7) ** 2);
const FH24 = R.fit(WAIT, { Load: LOAD, 'Hinge²': HINGE });
const w24 = (l) => FH24.predict([l, Math.max(0, l - 7) ** 2]).yhat;
const PLANT = { a: 0.22, b: 0.02 };            // the generator’s wait: 1.5 + 0.22·max(0, load − 7)² + 0.02·load + noise
const planted24 = (l1, l2) => PLANT.a * (Math.max(0, l2 - 7) ** 2 - Math.max(0, l1 - 7) ** 2) + PLANT.b * (l2 - l1);

// ---------------------------------------------------------------- figures added after review
// fn-3 R² from the residual standard error and s_y
const F3b = { se: rnd(FH.sigma, 2), sy: rnd(Math.sqrt(FH.sst / 305), 2), n: hFoot.length };
const r2From = (k) => 1 - (k.se ** 2 * (k.n - 2)) / (k.sy ** 2 * (k.n - 1));
// fn-4 Harbourside’s sales on transactions: every day, and days with 40–70 transactions
const hT = column('transactions', H), hS = column('sales', H);
const ST4 = R.fit(hS, { Transactions: hT });
const MID4 = hT.map((_, i) => i).filter((i) => hT[i] >= 40 && hT[i] <= 70);
const ST4m = R.fit(MID4.map((i) => hS[i]), { Transactions: MID4.map((i) => hT[i]) });
if (!(ST4m.r2 < ST4.r2 - 0.03 && ST4m.sigma < 0.6 * ST4.sigma)) fail('fn-4');
// fn-6 a forecast below the data’s highs
const s6Lo = Math.min(...s6X), s6Hi = Math.max(...s6X), s6Far = 55, P6far = F6.predict([s6Far]);
if (!(s6Far < s6Lo - 5)) fail('fn-6');
// fn-8 the café × high model; the pooled SE by day clusters and by Driscoll–Kraay (Newey–West on day-summed scores)
const F8I = R.fit(column('footfall'), { 'High (°F)': column('high_f'), Millbrook: column('millbrook'), 'High × Millbrook': R.interaction(column('high_f'), column('millbrook')) });
function dkSE(f, Xcols, time, L) {
  const p = f.p, T = new Map();
  for (let i = 0; i < f.n; i++) { if (!T.has(time[i])) T.set(time[i], new Array(p).fill(0)); const u = T.get(time[i]); [1, ...Xcols.map((c) => c[i])].forEach((v, a) => { u[a] += v * f.resid[i]; }); }
  const U = [...T.keys()].sort((a, b) => a - b).map((k) => T.get(k));
  const S = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let l = 0; l <= L; l++) { const w = 1 - l / (L + 1); for (let t = l; t < U.length; t++) for (let a = 0; a < p; a++) for (let b = 0; b < p; b++) S[a][b] += l ? w * (U[t][a] * U[t - l][b] + U[t - l][a] * U[t][b]) : U[t][a] * U[t][b]; }
  const B = f.XtXinv, mul = (A, C) => A.map((r) => Array.from({ length: p }, (_, j) => r.reduce((s2, v, k) => s2 + v * C[k][j], 0)));
  const V = mul(mul(B, S), B);
  return V.map((r, i) => Math.sqrt(r[i]));
}
const se8dk14 = dkSE(F8, [column('high_f')], column('day'), 14)[1], se8dk28 = dkSE(F8, [column('high_f')], column('day'), 28)[1];
if (!(se8day < 0.8 * F8.coefs[1].se && se8dk14 > 0.9 * F8.coefs[1].se && se8dk28 > F8.coefs[1].se)) fail('fn-8 (the direction of the pooled SE’s error)');
if (!(Math.abs(F8I.beta[1] - FH.beta[1]) < 1e-6 && Math.abs(F8I.beta[1] + F8I.beta[3] - F8M.beta[1]) < 1e-6)) fail('fn-8 (the interaction model)');
// fn-14 conversion (transactions per visitor) on footfall, pooled and with a café dummy
const allFoot = column('footfall'), CONV = column('transactions').map((t, i) => t / allFoot[i]);
const C14a = R.fit(CONV, { Footfall: allFoot }), C14b = R.fit(CONV, { Footfall: allFoot, Millbrook: column('millbrook') });
const PLANT_CONV = { H: 0.47, M: 0.55 };     // the generator: transactions ~ Binomial(footfall, 0.47 Harbourside / 0.55 Millbrook)
if (!(C14a.beta[1] > 0 && C14a.coefs[1].p < 0.001 && C14b.coefs[1].p > 0.05 && Math.abs(C14b.beta[2] - (PLANT_CONV.M - PLANT_CONV.H)) < 0.02)) fail('fn-14');
// fn-16 the SE of the transactions slope, alone and beside footfall
const SE16 = { alone: rnd(S16a.coefs[1].se, 4), both: rnd(S16b.coefs[2].se, 4) };
const rFromSE = (k) => Math.sqrt(1 - (k.alone / k.both) ** 2);
// fn-20 the median footfall on a rainy day from the log line
const s20Med = Math.exp(F20.predict([s20At]).yhat), L20 = R.fit(s20F, { 'Rain (in)': s20R }), s20Lev = L20.predict([s20At]).yhat;
// fn-22 the first ticket at which the probability reaches 0.5 (further away, notifications on, Harbourside, weekday)
const tHalf = -(RM.beta[0] + RM.beta[2]) / RM.beta[3];
const ft22 = member('first_ticket');
if (!(tHalf > Math.min(...ft22) && tHalf < Math.max(...ft22))) fail('fn-22');

export const items = [
  // ================================================================ Module 1: fitting a line
  {
    id: 'b06-fn-1', lesson: 'least-squares-line', type: 'formula', kind: 'applied',
    prompt: `Harbourside’s weekdays, 12 July – 15 August 2027: footfall in B2:B${s1L} and transactions in C2:C${s1L}. On one weekday the door counter failed but the till recorded the transactions in F1. In F2, estimate that day’s footfall with the least-squares line suited to the job.`,
    sheet: { cells: { A1: 'Day', B1: 'Footfall', C1: 'Transactions', E1: 'Transactions that day', F1: s1X, E2: 'Estimated footfall', ...col('A', 2, S1.map(label)), ...col('B', 2, s1F), ...col('C', 2, s1T) }, vary: { F1: [60, 90] } },
    cell: 'F2', view: `A1:F${s1L}`, maxHeight: '20rem', widths: { A: 11, E: 21 }, formats: { F2: '0.0' },
    answer: `=FORECAST.LINEAR(F1,B2:B${s1L},C2:C${s1L})`,
    alt: [`=INTERCEPT(B2:B${s1L},C2:C${s1L})+SLOPE(B2:B${s1L},C2:C${s1L})*F1`, `=TREND(B2:B${s1L},C2:C${s1L},F1)`, `=FORECAST(F1,B2:B${s1L},C2:C${s1L})`],
    wrong: [
      { formula: `=(F1-INTERCEPT(C2:C${s1L},B2:B${s1L}))/SLOPE(C2:C${s1L},B2:B${s1L})`, say: 'That solves the line of transactions on footfall for footfall. That line minimises misses in transactions; to estimate footfall from transactions, regress footfall on transactions. The two lines differ unless r = ±1.' },
      { formula: `=FORECAST.LINEAR(F1,C2:C${s1L},B2:B${s1L})`, say: 'That predicts transactions from a footfall of F1. The known y’s are what you want to estimate (footfall, B); the known x’s are what you have (transactions, C).' },
      { formula: `=F1*AVERAGE(B2:B${s1L})/AVERAGE(C2:C${s1L})`, say: 'Scaling by the ratio of the means assumes footfall is proportional to transactions, a line through the origin. The least-squares line has its own intercept.' },
    ],
    solution: `The question runs from transactions to footfall, so use the line of footfall on transactions: <x>=FORECAST.LINEAR(F1,B2:B${s1L},C2:C${s1L})</x> gives ${fx(F1onT.beta[0], 2)} + ${fx(F1onT.beta[1], 3)} × ${s1X} = ${fx(s1Est, 1)} people. Turning the line of transactions on footfall round gives ${fx(s1Inv, 1)}: on these days r = ${fx(s1R, 2)}, and the inverted line’s slope (${fx(1 / T1onF.beta[1], 2)}) is the least-squares slope divided by r². Each line is the best predictor only in its own direction.`,
  },
  {
    id: 'b06-fn-2', lesson: 'least-squares-line', type: 'classify', kind: 'conceptual',
    prompt: `Harbourside’s line of footfall on the high (°F) over 2027 has slope ${fx(FH.beta[1], 3)} people per °F, intercept ${fx(FH.beta[0], 2)} and R² = ${fx(FH.r2, 3)}. For each change, say what happens.`,
    items: [
      'Record the high in °C instead of °F.',
      'Use high − 60 instead of the high.',
      'Count footfall in hundreds of people.',
      'Regress the high on footfall instead.',
      `Fit only July and August, leaving out the festival days.`,
    ],
    categories: ['Only the intercept changes', 'Slope and intercept are rescaled; R² stays', 'A different line, not a rescaling; R² stays', 'The fit itself changes, R² included'],
    answer: [1, 0, 1, 2, 3],
    feedback: {
      0: `A degree Celsius is 1.8°F, so the slope becomes ${fx(FH.beta[1] * 1.8, 2)} people per °C; and 0°C is 32°F, so the intercept moves too. The points are the same, so R² is unchanged.`,
      1: 'Shifting x moves the intercept to the value at 60°F; the slope and R² stay. Centring makes the intercept meaningful.',
      2: 'Every footfall is divided by 100, so slope and intercept are divided by 100; R² has no units and stays.',
      3: `The line of x on y minimises misses in the high, not in footfall: its slope is not 1 ÷ ${fx(FH.beta[1], 3)}. With one predictor R² = r² either way.`,
      4: `That changes the data, not the units: over July and August without festival days R² is ${fx(FS.r2, 3)}.`,
    },
    solution: `Changing units or shifting x rescales the same least-squares line: a change of units changes the slope (and, unless 0 stays 0, the intercept); a shift changes only the intercept; R² is unit-free and stays at ${fx(FH.r2, 3)}. Regressing the high on footfall is a different line with the same R² (r² = ${fx(FH.r2, 3)}). Restricting the days changes the fit: R² is ${fx(FS.r2, 3)} over July and August.`,
  },
  {
    id: 'b06-fn-3', lesson: 'residuals-and-r-squared', type: 'num', kind: 'numerical',
    prompt: `Over Harbourside’s ${F3b.n} days, footfall has a standard deviation of ${fx(F3b.sy, 2)} people, and the least-squares line of footfall on the high has a residual standard error of ${fx(F3b.se, 2)} people. What is the line’s R²? Give three decimal places.`,
    answer: rnd(r2From(F3b), 3),
    check: () => FH.r2,
    unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: rnd(1 - F3b.se ** 2 / F3b.sy ** 2, 3), say: 'Close, but the two spreads have different degrees of freedom: SSE = (n − 2)s_e² and SST = (n − 1)s_y². R² = 1 − SSE/SST.' },
      { value: rnd(1 - F3b.se / F3b.sy, 3), say: 'R² compares sums of squares, so the standard deviations are squared before comparing.' },
      { value: rnd(F3b.se ** 2 / F3b.sy ** 2, 3), say: 'That is roughly the share left unexplained. R² is one minus it.' },
    ],
    solution: `SSE = (n − 2)s_e² = 304 × ${fx(F3b.se, 2)}² and SST = (n − 1)s_y² = 305 × ${fx(F3b.sy, 2)}², so R² = 1 − SSE/SST = ${fx(r2From(F3b), 3)}. The high cuts the typical miss only from ${fx(F3b.sy, 1)} to ${fx(F3b.se, 1)} people. The rest is the weekend, rain, festivals and the build-up, which this line leaves out.`,
  },
  {
    id: 'b06-fn-4', lesson: 'residuals-and-r-squared', type: 'mc', kind: 'applied',
    prompt: `Over all of Harbourside’s 306 days, the line of sales on transactions has R² = ${fx(ST4.r2, 3)} and a residual standard error of $${fx(ST4.sigma, 2)}. Fitted only to the ${MID4.length} days with 40 to 70 transactions, it has R² = ${fx(ST4m.r2, 3)} and $${fx(ST4m.sigma, 2)}. The manager says: “On ordinary days the till total is harder to predict from the transaction count.” What is the best reply?`,
    options: [
      `No: R² is lower only because transactions span just ${70 - 40} on those days, and the typical miss, $${fx(ST4m.sigma, 0)} against $${fx(ST4.sigma, 0)}, is smaller.`,
      'Yes: the lower R² shows that on ordinary days a larger share of the till total is left unexplained, so its predictions there are worse.',
      'No: the ordinary-day line uses fewer days, and a line fitted to fewer days tends to report an R² that is lower than it deserves.',
      'Yes: R² is the measure to go by, since the residual standard error is in dollars and so can’t be compared between two different fits.',
    ],
    answer: 0,
    feedback: {
      1: `R² is a share of the variance in sales, and ordinary days vary much less in sales because their transactions vary less. In dollars, the line misses an ordinary day by less (about $${fx(ST4m.sigma, 0)}), so it predicts those days better.`,
      2: 'R² isn’t biased downwards by a smaller sample. The drop comes from the narrower range of transactions.',
      3: 'Both fits predict the same thing in the same units, dollars of sales, so their residual standard errors compare directly, and that is what a prediction depends on.',
    },
    solution: `R² depends on the range of x. Restricting to days with ${40}–${70} transactions removes most of the variation in sales, so the share the line explains falls (${fx(ST4.r2, 3)} to ${fx(ST4m.r2, 3)}). The typical miss falls too, from $${fx(ST4.sigma, 2)} to $${fx(ST4m.sigma, 2)}, because the case’s noise grows with the level of trade. For predicting an ordinary day, the residual standard error is the figure to use.`,
  },
  {
    id: 'b06-fn-5', lesson: 'residuals-and-r-squared', type: 'mc', kind: 'conceptual',
    prompt: `Over both cafés’ 612 days, a straight line of the peak wait on the load (peak transactions per barista hour) has R² = ${fx(FW.r2, 3)}. The table shows its average residual by load. What should Ana conclude?`,
    data: { table: { head: ['Load', 'Days', 'Average residual (min)'], rows: BANDS.map((b, i) => [bandName(b, i), BAND[i].n, fx(BAND[i].e, 2)]), align: ['l', 'r', 'r'] } },
    options: [
      'The wait bends upwards with the load: a straight line is the wrong form despite its R²',
      'With R² near 0.7 the line fits well, and these residual averages are just random noise',
      'The residuals average zero overall, so any pattern within the load bands must be chance',
      'The residuals’ spread differs between bands, so the line is right but its SEs are not',
    ],
    answer: 0,
    feedback: {
      1: 'R² can’t tell a straight relationship from a curved one. Dozens to hundreds of days per band averaging the same sign, positive at both ends and negative in the middle, is a systematic pattern, not noise.',
      2: 'Least-squares residuals always average zero overall; the question is whether they average zero at every x. Here they don’t.',
      3: 'The table shows the residuals’ averages, not their spread: it is about the line’s shape, not equal variance.',
    },
    solution: `Positive residuals at low and high loads and negative ones between them mean the true relationship is convex: the line overstates the wait between loads of 6 and 10 and understates it at both ends: below 6 (average residuals ${fx(BAND[0].e, 2)} and ${fx(BAND[1].e, 2)} minutes) and above 10. That is a wrong functional form, which a high R² (${fx(FW.r2, 2)}) does not rule out. The case plants a hinge at a load of about 7, and a model with a squared hinge term fits the curve (transformations-and-influence).`,
  },

  // ================================================================ Module 2: inference and prediction
  {
    id: 'b06-fn-6', lesson: 'prediction-and-intervals', type: 'steps', kind: 'applied',
    prompt: `Harbourside’s weekdays, 1 June – 9 July 2027 (${S6.length} days): the high in B2:B${s6L} and footfall in C2:C${s6L}. F1 holds a forecast high.`,
    steps: [
      {
        id: 'b06-fn-6-s1', type: 'formula', kind: 'numerical',
        prompt: 'In F2, calculate the footfall that the least-squares line of footfall on the high gives at the forecast high.',
        sheet: { cells: { ...s6Cells, E2: 'Fitted footfall' }, vary: { F1: [72, 88] } },
        cell: 'F2', view: `A1:F${s6L}`, maxHeight: '20rem', widths: { A: 11, E: 18 }, formats: { F2: '0.0' },
        answer: `=FORECAST.LINEAR(F1,C2:C${s6L},B2:B${s6L})`,
        alt: [`=INTERCEPT(C2:C${s6L},B2:B${s6L})+SLOPE(C2:C${s6L},B2:B${s6L})*F1`, `=TREND(C2:C${s6L},B2:B${s6L},F1)`, `=FORECAST(F1,C2:C${s6L},B2:B${s6L})`],
        wrong: [
          { formula: `=FORECAST.LINEAR(F1,B2:B${s6L},C2:C${s6L})`, say: 'The known y’s come first: footfall (C) is the y, the high (B) the x.' },
        ],
        solution: `<x>=FORECAST.LINEAR(F1,C2:C${s6L},B2:B${s6L})</x> = ${fx(F6.beta[0], 2)} + ${fx(F6.beta[1], 3)} × ${s6At} = ${fx(P6.yhat, 1)} people.`,
      },
      {
        id: 'b06-fn-6-s2', type: 'formula', kind: 'numerical',
        prompt: 'In F3, calculate in one formula the half-width of the 95% confidence interval for the mean footfall of weekdays at the forecast high.',
        sheet: { cells: { ...s6Cells, E3: 'Half-width, 95% CI' }, vary: { F1: [72, 88] } },
        cell: 'F3', view: `A1:F${s6L}`, maxHeight: '20rem', widths: { A: 11, E: 18 }, formats: { F3: '0.00' },
        answer: `=T.INV.2T(0.05,COUNT(B2:B${s6L})-2)*STEYX(C2:C${s6L},B2:B${s6L})*SQRT(1/COUNT(B2:B${s6L})+(F1-AVERAGE(B2:B${s6L}))^2/DEVSQ(B2:B${s6L}))`,
        alt: [
          `=T.INV.2T(0.05,${S6.length - 2})*STEYX(C2:C${s6L},B2:B${s6L})*SQRT(1/${S6.length}+(F1-AVERAGE(B2:B${s6L}))^2/DEVSQ(B2:B${s6L}))`,
          `=T.INV.2T(0.05,COUNT(B2:B${s6L})-2)*STEYX(C2:C${s6L},B2:B${s6L})*SQRT(1/COUNT(B2:B${s6L})+(F1-AVERAGE(B2:B${s6L}))^2/(VAR.S(B2:B${s6L})*(COUNT(B2:B${s6L})-1)))`,
        ],
        wrong: [
          { formula: `=T.INV.2T(0.05,COUNT(B2:B${s6L})-2)*STEYX(C2:C${s6L},B2:B${s6L})*SQRT(1+1/COUNT(B2:B${s6L})+(F1-AVERAGE(B2:B${s6L}))^2/DEVSQ(B2:B${s6L}))`, say: 'The 1 under the root belongs to the prediction interval for one day. The mean of all such days has only 1/n + (x₀ − x̄)²/Sxx.' },
          { formula: `=T.INV.2T(0.05,COUNT(B2:B${s6L})-2)*STEYX(C2:C${s6L},B2:B${s6L})*SQRT(1/COUNT(B2:B${s6L}))`, say: 'That is the half-width at x̄ only. Away from the mean high the slope’s uncertainty adds (x₀ − x̄)² ÷ Sxx.' },
          { formula: `=T.INV.2T(0.05,COUNT(B2:B${s6L})-1)*STEYX(C2:C${s6L},B2:B${s6L})*SQRT(1/COUNT(B2:B${s6L})+(F1-AVERAGE(B2:B${s6L}))^2/DEVSQ(B2:B${s6L}))`, say: 'A line estimates two coefficients, so t has n − 2 degrees of freedom.' },
        ],
        solution: `t* = T.INV.2T(0.05, ${F6.df}) = ${fx(tq(F6.df), 3)}, s = STEYX = ${fx(F6.sigma, 2)}, and √(1/n + (x₀ − x̄)²/Sxx) at ${s6At}°F gives an SE of the mean of ${fx(P6.seMean, 2)}: half-width ${fx(P6.ciHigh - P6.yhat, 2)} people.`,
      },
      {
        id: 'b06-fn-6-s3', type: 'mc',
        prompt: `In October the manager wants the same formulas for a weekday forecast at ${s6Far}°F. Will they give a sound estimate and interval?`,
        options: [
          `No: the data’s highs run from ${s6Lo} to ${s6Hi}°F, so ${s6Far}°F is outside them, and nothing in these days shows the line holds there`,
          'Yes: the interval widens away from the mean high, which already allows for a forecast outside the data’s range',
          `Yes: ${s6Far}°F is only ${s6Lo - s6Far} degrees below the coolest day in the data, close enough for the line to hold`,
          'Only for the mean: the confidence interval stays valid outside the data, though the prediction interval does not',
        ],
        answer: 0,
        feedback: {
          1: 'The widening allows for uncertainty in the slope, assuming the straight line holds. It can’t allow for the relationship changing outside the data.',
          2: 'There is no safe distance: below the coolest day there is no evidence about the line at all, and October differs from June in more than the temperature.',
          3: 'Both intervals rest on the same line. If the line is wrong at 55°F, both are wrong.',
        },
        solution: `The line would give ${fx(P6far.yhat, 1)} people at ${s6Far}°F, with a 95% prediction interval of ${fx(P6far.piLow, 0)} to ${fx(P6far.piHigh, 0)}, but that is extrapolation: these ${S6.length} days had highs from ${s6Lo} to ${s6Hi}°F. The intervals’ widening allows for an uncertain slope on a line assumed to hold; it says nothing about whether it does. Fit the line on days that include cooler weather (and the season) before forecasting October.`,
      },
    ],
    solution: `ŷ = ${fx(P6.yhat, 1)} people at ${s6At}°F; the mean’s 95% interval is ± ${fx(P6.ciHigh - P6.yhat, 1)} and one day’s ± ${fx(P6.piHigh - P6.yhat, 1)}. A forecast outside the data’s highs is extrapolation, which the intervals can’t cover.`,
  },
  {
    id: 'b06-fn-7', lesson: 'inference-for-coefficients', type: 'num', kind: 'numerical',
    prompt: `Keswin Cinema (fictional) regresses weekly snack revenue (hundreds of dollars) on the number of screenings, over ${CIN.n} weeks. The printout’s coefficient row for the slope is smudged except the estimate, ${CIN.b}; the ANOVA table shows F = ${CIN.F}. What is the slope’s standard error? Give three decimal places.`,
    answer: rnd(CIN.b / Math.sqrt(CIN.F), 3),
    check: () => 3.2 / Math.sqrt(18.5),
    unit: '', places: 3, tol: 0.001,
    wrong: [
      { value: rnd(CIN.b / CIN.F, 3), say: 'With one predictor F = t², not t. So t = √18.5 and SE = b₁ ÷ t.' },
      { value: rnd(Math.sqrt(CIN.F), 3), say: 'That is |t|. The standard error is the estimate divided by t.' },
      { value: rnd(CIN.b * Math.sqrt(CIN.F), 3), say: 't = b₁ ÷ SE(b₁), so SE = b₁ ÷ t, not b₁ × t.' },
    ],
    solution: `With one predictor the overall F equals the slope’s t squared, so |t| = √${CIN.F} = ${fx(Math.sqrt(CIN.F), 3)} and SE(b₁) = ${CIN.b} ÷ ${fx(Math.sqrt(CIN.F), 3)} = ${fx(CIN.b / Math.sqrt(CIN.F), 3)} hundred dollars per screening. The 95% interval is ${CIN.b} ± ${fx(tq(CIN.n - 2), 3)} × ${fx(CIN.b / Math.sqrt(CIN.F), 3)} (t on ${CIN.n - 2} df), if the weeks are independent.`,
  },
  {
    id: 'b06-fn-8', lesson: 'inference-for-coefficients', type: 'mc', kind: 'applied',
    prompt: `A colleague regresses footfall on the high over all 612 rows (both cafés) and reports: “Each extra °F brings ${fx(F8.coefs[1].estimate, 2)} more people to a café (95% CI ${fx(F8.coefs[1].low, 2)} to ${fx(F8.coefs[1].high, 2)}).” Ana adds a Millbrook dummy and a High × Millbrook term: the high’s slope becomes ${fx(F8I.beta[1], 3)} and the interaction ${fx(F8I.beta[3], 3)} (p ${p3(F8I.coefs[3].p)}). What should she report about the high?`,
    options: [
      `A slope for each café: ${fx(F8I.beta[1], 2)} people per °F at Harbourside and ${fx(F8I.beta[1] + F8I.beta[3], 2)} at Millbrook`,
      `The pooled ${fx(F8.coefs[1].estimate, 2)}, because it uses all 612 rows and its confidence interval clearly excludes zero`,
      `${fx(F8I.beta[1], 2)} for both cafés, since the interaction is a correction term rather than a slope of interest`,
      `The interaction, ${fx(F8I.beta[3], 2)}, as the effect of the high once the café has been held fixed`,
    ],
    answer: 0,
    feedback: {
      1: `The pooled slope is a blend of two very different slopes and fits neither café; its interval contains neither of them.`,
      2: `With Harbourside as the reference, ${fx(F8I.beta[1], 2)} is Harbourside’s slope only. Millbrook’s is ${fx(F8I.beta[1], 2)} + (${fx(F8I.beta[3], 2)}).`,
      3: 'The interaction is the difference between the cafés’ slopes, not a slope of its own.',
    },
    solution: `In the interaction model the high’s coefficient is the reference café’s slope (Harbourside, ${fx(F8I.beta[1], 3)}), and the interaction is how much Millbrook’s differs: ${fx(F8I.beta[1], 3)} + (${fx(F8I.beta[3], 3)}) = ${fx(F8I.beta[1] + F8I.beta[3], 3)} people per °F, the same as fitting the cafés separately. The pooled ${fx(F8.coefs[1].estimate, 2)} describes neither café. Its printed SE also treats 612 rows as independent: grouping the rows by day alone shrinks it, because the cafés’ same-day residuals offset, but allowing for days in sequence as well brings it back to about the formula’s value or above, so the printed SE is no reliable guide either way.`,
  },
  {
    id: 'b06-fn-9', lesson: 'prediction-and-intervals', type: 'num', kind: 'applied',
    prompt: `Ana’s model of Harbourside’s ln(footfall) on the high, rain, weekend, festival and build-up (306 days) gives, for a dry 75°F Saturday after the build-up and with no festival, a predicted ln(footfall) of ${fx(P9.yhat, 3)} with a 95% prediction interval of ${fx(P9.piLow, 3)} to ${fx(P9.piHigh, 3)}. What is the upper end of the prediction interval for that day’s footfall, in people? Give a whole number.`,
    answer: Math.round(Math.exp(P9.piHigh)),
    check: () => Math.exp(LOGM.predict([75, 0, 1, 0, 1]).piHigh),
    unit: 'people', places: 0, tol: 1,
    wrong: [
      { value: Math.round(Math.exp(P9.ciHigh)), say: 'That is the end of the confidence interval for the mean, back-transformed. One day needs the prediction interval.' },
      { value: Math.round(Math.exp(P9.yhat) + (Math.exp(P9.piHigh) - Math.exp(P9.piLow)) / 2), say: 'The back-transformed interval isn’t symmetric around e^ŷ: exponentiate each end of the log interval.' },
    ],
    solution: `Back-transform each end: e^${fx(P9.piHigh, 3)} = ${Math.round(Math.exp(P9.piHigh))} people (lower end e^${fx(P9.piLow, 3)} = ${Math.round(Math.exp(P9.piLow))}). Exponentiating keeps the percentiles, so this is a valid 95% prediction interval for footfall, wider above the centre (e^${fx(P9.yhat, 3)} = ${Math.round(Math.exp(P9.yhat))}, the median, not the mean) than below: the residual SD of ${fx(LOGM.sigma, 3)} in logs is about ${fx(LOGM.sigma * 100, 0)}% either way. The interval assumes independent days and normal, equal-spread errors in logs, which suits the case’s multiplicative noise, and it is only as good as the forecast of the high and rain.`,
  },
  {
    id: 'b06-fn-10', lesson: 'prediction-and-intervals', type: 'mc', kind: 'conceptual',
    prompt: `The same predictors with footfall in people (not logs) give, for that dry 75°F Saturday, a 95% prediction interval of ${fx(P10.piLow, 0)} to ${fx(P10.piHigh, 0)} people, using the model’s residual standard error of ${fx(LEVM.sigma, 1)}. The residuals’ root mean square is ${fx(sdWe, 1)} on weekend days and ${fx(sdWd, 1)} on weekdays. What does this mean for the interval?`,
    options: [
      'It uses one spread for every day: too narrow for weekend days like this one, too wide on weekdays',
      'It is fine: a prediction interval largely allows for days being more or less variable than average',
      'It is too wide: the residual standard error mixes in the festival days and overstates every day’s spread',
      'It needs HC3 standard errors, which would widen it to the right width for a busy weekend day',
    ],
    answer: 0,
    feedback: {
      1: 'The prediction interval adds one constant s for every day. When the spread differs between kinds of day, the same s is wrong for each of them.',
      2: `The weekend residuals are larger than s (${fx(sdWe, 1)} against ${fx(LEVM.sigma, 1)}), so this weekend interval is too narrow, not too wide.`,
      3: 'Robust SEs correct the coefficients’ standard errors. The prediction interval is dominated by s, a single spread, which HC3 doesn’t touch.',
    },
    solution: `A prediction interval assumes constant spread. Here weekend residuals spread about ${fx(sdWe / sdWd, 1)} times as widely as weekday ones, because the case’s noise is multiplicative and weekends are busier at Harbourside, so the interval of ±${fx(P10.piHigh - P10.yhat, 0)} is too narrow for this Saturday and too wide for a quiet weekday. Modelling ln(footfall), whose spread is near constant, and back-transforming (as in the previous question) gives intervals that widen with the level.`,
  },

  // ================================================================ Module 3: multiple regression
  {
    id: 'b06-fn-11', lesson: 'multiple-regression', type: 'mc', kind: 'applied',
    prompt: `Millbrook’s footfall (306 days) on the high alone has a slope of ${fx(M11a.beta[1], 3)} people per °F. Adding rain and a weekend dummy moves it to ${fx(M11b.beta[1], 3)}; adding the build-up as well (the café’s growth over its first four months) moves it to ${fx(M11c.beta[1], 3)}. The high correlates ${fx(r11.rain, 2)} with rain, ${fx(r11.weekend, 2)} with the weekend dummy and ${fx(r11.build, 2)} with the build-up. Why does only the build-up change the slope much?`,
    options: [
      'Only the build-up goes with the high: the café grew from the cool spring into summer, so the simple slope had carried some of that growth.',
      'The build-up is collinear with the high, which makes the last slope unreliable; the slope of the model without it should be reported.',
      'Each predictor added takes a share of the high’s slope, and the build-up happened to be the strongest predictor of the three added.',
      'Rain and the weekend affect footfall less than the build-up does, so they could not move the high’s slope however they were related.',
    ],
    answer: 0,
    feedback: {
      1: `The high’s VIF in the full model is only ${fx(vif11, 2)}, far from a worrying level. Leaving the build-up out leaves its association in the high’s slope: that is the bias.`,
      2: `Adding rain and the weekend didn’t shrink the slope (it moved from ${fx(M11a.beta[1], 2)} to ${fx(M11b.beta[1], 2)}). Slopes change when the added predictor is correlated with the one already there.`,
      3: 'The weekend moves Millbrook’s footfall a great deal, yet it barely changed the slope, because it is uncorrelated with the high. Both conditions are needed: related to y and related to x.',
    },
    solution: `Omitted-variable bias needs an omitted predictor related to both the outcome and the included one. Rain (r = ${fx(r11.rain, 2)}) and the weekend (r = ${fx(r11.weekend, 2)}) are almost unrelated to the high, so adding them barely moves its slope. The build-up rose while the weather warmed (r = ${fx(r11.build, 2)}) and goes with more footfall, so without it the high’s slope absorbed part of the café’s growth. Holding the build-up, rain and the weekend fixed, warmer days go with about ${fx(M11c.beta[1], 2)} more people per °F (95% interval ${fx(M11c.coefs[1].low, 2)} to ${fx(M11c.coefs[1].high, 2)}, treating days as independent, which in sequence they are not quite).`,
  },
  {
    id: 'b06-fn-12', lesson: 'multiple-regression', type: 'formula', kind: 'numerical',
    prompt: `Harbourside’s October 2027: footfall in B2:B${s12L}, and the high, rain and the weekend dummy in C2:E${s12L}. In G2, calculate in one formula the lower end of the 95% confidence interval for the weekend coefficient in the regression of footfall on all three, using LINEST.`,
    sheet: { cells: { A1: 'Day', B1: 'Footfall', C1: 'High (°F)', D1: 'Rain (in)', E1: 'Weekend', G1: 'Weekend coefficient: lower 95% limit', ...col('A', 2, S12.map(label)), ...col('B', 2, get(S12, 'footfall')), ...col('C', 2, get(S12, 'high_f')), ...col('D', 2, get(S12, 'rain_in')), ...col('E', 2, s12W) } },
    cell: 'G2', view: `A1:G${s12L}`, maxHeight: '20rem', widths: { A: 11, G: 32 }, formats: { G2: '0.00' }, require: ['LINEST'],
    answer: `=INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),1,1)-T.INV.2T(0.05,INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),4,2))*INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),2,1)`,
    alt: [
      `=INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),1,1)-T.INV.2T(0.05,COUNT(B2:B${s12L})-4)*INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),2,1)`,
      `=INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),1,1)-T.INV.2T(0.05,${S12.length - 4})*INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),2,1)`,
    ],
    wrong: [
      { formula: `=INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),1,3)-T.INV.2T(0.05,INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),4,2))*INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),2,3)`, say: 'LINEST returns the coefficients in reverse order of the x columns: the last column (E, the weekend) comes first. Column 3 of the output is the high.' },
      { formula: `=INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),1,1)-T.INV.2T(0.05,COUNT(B2:B${s12L})-2)*INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),2,1)`, say: 'With an intercept and three slopes the residual degrees of freedom are n − 4, as LINEST reports in row 4, column 2.' },
      { formula: `=INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),1,1)-1.96*INDEX(LINEST(B2:B${s12L},C2:E${s12L},TRUE,TRUE),2,1)`, say: 'With 31 days and an estimated s, the multiplier is t on n − 4 df, not the normal 1.96.' },
    ],
    solution: `LINEST lists the coefficients from the last x column to the first, so the weekend is in column 1: estimate ${fx(F12.coefs[3].estimate, 2)} (row 1), SE ${fx(F12.coefs[3].se, 2)} (row 2), df ${F12.df} (row 4, column 2). Lower limit = ${fx(F12.coefs[3].estimate, 2)} − ${fx(tq(F12.df), 3)} × ${fx(F12.coefs[3].se, 2)} = ${fx(F12.coefs[3].low, 2)} people: October weekend days had between about ${fx(F12.coefs[3].low, 0)} and ${fx(F12.coefs[3].high, 0)} more visitors than weekdays of the same high and rain. The interval treats October’s days as independent; their residuals’ lag-1 correlation is ${fx(s12Lag, 2)}, so in-sequence dependence looks mild here.`,
  },
  {
    id: 'b06-fn-13', lesson: 'categorical-predictors-and-interactions', type: 'steps', kind: 'applied',
    prompt: `The case’s footfall model for both cafés (612 rows) has these coefficients (Harbourside and weekdays are the reference levels; s = ${fx(FM.sigma, 2)} people).`,
    data: { table: { head: ['Term', 'Coefficient'], rows: FM.coefs.map((c) => [c.name, fx(c.estimate, 3)]), align: ['l', 'r'] } },
    steps: [
      {
        id: 'b06-fn-13-s1', type: 'num', kind: 'numerical',
        prompt: 'What footfall does the model give for Millbrook on a dry 70°F Saturday with no festival? Give one decimal place.',
        answer: rnd(P13.yhat, 1),
        check: () => FM.beta[0] + FM.beta[1] * 70 + FM.beta[3] + FM.beta[4] + FM.beta[5],
        unit: 'people', places: 1, tol: 0.1,
        wrong: [
          { value: rnd(P13.yhat - FM.beta[5], 1), say: 'Millbrook on a weekend switches on the interaction too: add the Millbrook × Weekend coefficient.' },
          { value: rnd(FM.beta[0] + FM.beta[1] * 70 + FM.beta[3], 1), say: 'That is a Millbrook weekday. A Saturday adds the weekend coefficient and the Millbrook × Weekend coefficient.' },
          { value: rnd(FM.beta[0] + FM.beta[1] * 70 + FM.beta[4], 1), say: 'That is a Harbourside Saturday. Millbrook adds its dummy and the interaction.' },
        ],
        solution: `${fx(FM.beta[0], 3)} + ${fx(FM.beta[1], 3)} × 70 + ${fx(FM.beta[3], 3)} + ${fx(FM.beta[4], 3)} + (${fx(FM.beta[5], 3)}) = ${fx(P13.yhat, 1)} people. Millbrook’s weekend effect is ${fx(FM.beta[4], 1)} + (${fx(FM.beta[5], 1)}) = ${fx(FM.beta[4] + FM.beta[5], 1)}: its weekends are quieter than its weekdays.`,
      },
      {
        id: 'b06-fn-13-s2', type: 'mc',
        prompt: `The model’s 95% prediction interval for that day is ${fx(P13.piLow, 0)} to ${fx(P13.piHigh, 0)} people. The model’s residuals on Millbrook’s weekend days have a root mean square of ${fx(sdMbWe, 1)}. How good is the interval for this day?`,
        options: [
          'Too wide for this kind of day: it uses the pooled s, but Millbrook’s quiet weekends scatter less',
          'About right: a prediction interval built from all 612 rows should suit most kinds of day',
          'Too narrow: the 612 rows repeat each day twice, so s understates the scatter of one day',
          'Too narrow: the interaction term adds uncertainty that the interval leaves out of account',
        ],
        answer: 0,
        feedback: {
          1: `One s is used for every day. Millbrook’s weekend residuals (${fx(sdMbWe, 1)}) are smaller than s (${fx(FM.sigma, 1)}), so this interval is wider than such days need.`,
          2: 'Dependence between the cafés’ rows affects the coefficients’ standard errors, not the size of a day’s own scatter, which the residuals measure directly.',
          3: 'The interval’s SE already includes every coefficient’s uncertainty, the interaction’s with it; s, the day’s own scatter, is the main part of it.',
        },
        solution: `The case’s noise is multiplicative, so quiet days scatter less in people. Millbrook’s weekends are its quietest days and their residuals have a root mean square of ${fx(sdMbWe, 1)}, against the pooled s of ${fx(FM.sigma, 1)}: the interval (±${fx(P13.piHigh - P13.yhat, 0)}) is too wide for such a day, and too narrow for a busy one. A log model, or separate spreads, would size it properly. The model’s SEs also treat the 612 rows as independent, though each day appears twice.`,
      },
    ],
    solution: `Fitted footfall ${fx(P13.yhat, 1)} people; the constant-spread prediction interval is too wide for a quiet Millbrook weekend.`,
  },
  {
    id: 'b06-fn-14', lesson: 'categorical-predictors-and-interactions', type: 'mc', kind: 'applied',
    prompt: `Ana regresses conversion (transactions per visitor) on footfall over all 612 rows: the slope is ${fx(C14a.beta[1] * 10000, 2)} percentage points per 100 extra visitors (p ${p3(C14a.coefs[1].p)}). With a Millbrook dummy added, it is ${fx(C14b.beta[1] * 10000, 2)} points per 100 visitors (p = ${fx(C14b.coefs[1].p, 2)}), and the dummy’s coefficient is ${fx(C14b.beta[2] * 100, 1)} points. Millbrook averages ${fx(meanFootM, 0)} visitors a day and Harbourside ${fx(meanFootH, 0)}. Which reading is right?`,
    options: [
      'Busier days don’t convert better within a café; the pooled slope comes from Millbrook being both busier and higher-converting.',
      'Busier days convert better; the dummy hides it because the dummy and footfall are correlated, which tends to make slopes unreliable.',
      'The pooled slope is the one to report, since it uses every row and is strongly significant, while the dummy model’s slope is not.',
      'Neither model is usable: the two slopes disagree, so the link between footfall and conversion can’t be estimated from this log.',
    ],
    answer: 0,
    feedback: {
      1: `The dummy model estimates the slope well enough (its 95% interval, ${fx(C14b.coefs[1].low * 10000, 2)} to ${fx(C14b.coefs[1].high * 10000, 2)} points, is narrow and sits near zero); it is the comparison within a café, which the pooled slope never makes.`,
      2: 'Significance doesn’t make the pooled slope the right answer to the question. It mostly measures the gap between the cafés, which the dummy now carries as its own coefficient.',
      3: 'They answer different questions, and both are clear: across cafés, footfall and conversion rise together; within a café, they barely move together.',
    },
    solution: `Millbrook has more visitors and a higher conversion rate, so across all rows more footfall goes with higher conversion. Holding the café fixed, the slope is ${fx(C14b.beta[1] * 10000, 2)} points per 100 visitors, indistinguishable from zero, and the café gap is ${fx(C14b.beta[2] * 100, 1)} points. That matches the case’s planted fact: each café converts a fixed share of its visitors (0.47 and 0.55), whatever the footfall. The p-values treat the 612 rows as independent, which they aren’t (each day appears twice, and days run in sequence), so they are approximate; that doesn’t change the picture.`,
  },
  {
    id: 'b06-fn-15', lesson: 'multicollinearity-and-model-choice', type: 'mc', kind: 'applied',
    prompt: `For Harbourside’s 306 days, Ana compares two models of footfall that both include the high, rain, festival and build-up: one with six day-of-week dummies (Monday the reference), one with a single weekend dummy. The nested F test gives F = ${fx(NF15.F, 2)} on (${NF15.df1}, ${NF15.df2}) df, p = ${fx(NF15.p, 2)}. In the six-dummy model, Saturday’s coefficient is ${fx(c15('Day: Sat').estimate, 1)} and Sunday’s ${fx(c15('Day: Sun').estimate, 1)}. What should she conclude?`,
    options: [
      'The weekend dummy is enough: the models are nested and the five extra terms add nothing beyond chance',
      'Keep the six dummies: Saturday and Sunday are both significant, so the day of the week matters',
      'The F test is doubtful here, because the weekend model doesn’t look like a special case of the six-dummy one',
      'Keep the six dummies: the larger model has the higher R², so it is likely the better description',
    ],
    answer: 0,
    feedback: {
      1: 'Saturday and Sunday each differ from Monday by about the same amount, which is exactly what the weekend dummy captures. The question is whether the extra terms (Tue–Fri and Sat ≠ Sun) add anything.',
      2: 'Setting Tue–Fri to 0 and Saturday equal to Sunday turns the six-dummy model into the weekend model, so they are nested: 6 − 1 = 5 restrictions.',
      3: 'R² never falls when terms are added. The nested F test asks whether the rise is more than chance would give.',
    },
    solution: `The weekend model is the six-dummy model with four weekday dummies set to zero and Saturday’s and Sunday’s set equal: five restrictions. F = ${fx(NF15.F, 2)}, p = ${fx(NF15.p, 2)}: no evidence the extra terms help, so the simpler model wins (the case plants a weekend effect only). The test treats days as independent; days in sequence weaken that a little, but not enough to change an F this small.`,
  },
  {
    id: 'b06-fn-16', lesson: 'multicollinearity-and-model-choice', type: 'num', kind: 'numerical',
    prompt: `Over Millbrook’s 306 days, the slope of sales on transactions has a standard error of ${fx(SE16.alone, 4)} dollars per transaction alone and ${fx(SE16.both, 4)} with footfall in the model too. Assuming the residual standard error is the same in both models, what correlation between footfall and transactions does that inflation imply? Give three decimal places.`,
    answer: rnd(rFromSE(SE16), 3),
    check: () => Math.sqrt(1 - (SE16.alone / SE16.both) ** 2),
    unit: '', places: 3, tol: 0.002,
    wrong: [
      { value: rnd(1 - SE16.alone / SE16.both, 3), say: 'The SE grows by √VIF = 1/√(1 − r²). Square the ratio before solving for r.' },
      { value: rnd(1 - (SE16.alone / SE16.both) ** 2, 3), say: 'That is r², the R² of one predictor on the other. Take its square root for r.' },
    ],
    solution: `The SE ratio is ${fx(SE16.both, 4)} ÷ ${fx(SE16.alone, 4)} = ${fx(SE16.both / SE16.alone, 2)} = √VIF, so VIF = ${fx((SE16.both / SE16.alone) ** 2, 1)}, 1 − r² = 1/VIF and r = ${fx(rFromSE(SE16), 3)}. The actual correlation is ${fx(r16, 3)}: the assumption works because s barely changes between the models ($${fx(S16a.sigma, 2)} and $${fx(S16b.sigma, 2)}). Beside transactions, footfall’s own slope (${fx(S16b.coefs[1].estimate, 3)}, p = ${fx(S16b.coefs[1].p, 2)}, treating days as independent) can’t be told from zero: it adds nothing to predicting sales once transactions are known, which is not the same as a visitor being worth nothing.`,
  },
  {
    id: 'b06-fn-17', lesson: 'multicollinearity-and-model-choice', type: 'multi', kind: 'conceptual',
    prompt: 'Ana is choosing predictors for Harbourside’s footfall models. Select all the statements that are true.',
    options: [
      'Keeping only the predictors that stepwise selection finds with p below 0.05 gives p-values that look stronger than they are.',
      'Testing a model on months that came after the months it was fitted to checks forecasting accuracy more honestly than in-sample R², though later months may differ in other ways.',
      'AIC and BIC can compare two models only when both are fitted to the same rows of the same outcome.',
      'For a report on what a weekend is worth, barista hours rostered from the expected trade should be left out, since they follow from the weekend’s trade.',
      'The model with the highest R² on the fitting data will also forecast best.',
      'Adjusted R² can never fall when a predictor is added.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'R² never falls as terms are added, including useless ones; the extra terms fit noise that won’t recur. Judge forecasts on data the model hasn’t seen.',
      5: 'Adjusted R² falls when a new predictor reduces SSE by less than its share of a degree of freedom is worth.',
    },
    solution: 'True: stepwise p-values ignore the search that picked them; a hold-out on later months mimics forecasting but inherits any change between periods (the build-up, the season); AIC and BIC compare likelihoods, which mean nothing across different rows or a transformed outcome; and a predictor set from the outcome’s expected value (the roster) absorbs part of the effect being reported. False: in-sample R² rewards overfitting; adjusted R² can fall.',
  },

  // ================================================================ Module 4: checking and extending a model
  {
    id: 'b06-fn-18', lesson: 'assumptions-and-diagnostics', type: 'mc', kind: 'applied',
    prompt: `Harbourside’s model of footfall in people on the high, rain, weekend, festival and build-up has a Breusch–Pagan statistic of ${fx(BP18.lm, 1)} on ${BP18.df} df (p ${p3(BP18.p)}). The festival coefficient is ${fx(fest18.estimate, 1)} people with an ordinary SE of ${fx(fest18.se, 2)} and an HC3 SE of ${fx(festR18.se, 2)}. With ln(footfall) as the outcome, the Breusch–Pagan p-value is ${fx(BP18log.p, 2)}. Which statement is right?`,
    options: [
      `HC3 never changes an estimate: festival stays at ${fx(fest18.estimate, 0)} and only its interval widens; logging footfall removes the unequal spread.`,
      `HC3 shows that the festival effect is smaller than ${fx(fest18.estimate, 0)} people, since the five festival days are the noisiest rows.`,
      'The significant Breusch–Pagan test suggests the coefficients are biased, so the festival days should be dropped and the model refitted.',
      'HC3 standard errors also fix the model’s prediction intervals, so busy-day forecasts can now be trusted without logging footfall.',
    ],
    answer: 0,
    feedback: {
      1: 'HC3 changes standard errors, never coefficients. The estimate is the same least-squares number with a more honest SE.',
      2: 'Unequal variance doesn’t bias least-squares coefficients; it makes the usual SEs wrong. And the festival days are real: dropping them would hide a real effect.',
      3: 'A prediction interval rests on one value of s for every day; HC3 leaves s alone. Busy days need a model whose spread grows with the level, such as one for ln(footfall).',
    },
    solution: `The test says the residual spread varies with the predictors. Least-squares coefficients stay unbiased; the ordinary SEs are wrong, most for the festival term (HC3 ${fx(festR18.se, 1)} against ${fx(fest18.se, 1)}), whose 95% interval widens to ${fx(festR18.low, 0)}–${fx(festR18.high, 0)} people but stays far from zero. In logs the test finds nothing (p = ${fx(BP18log.p, 2)}): the case’s noise and effects are multiplicative, so the log model is the better form, and its coefficients read as percentages. HC3 allows for unequal spread only: it still treats the days as independent, which days in sequence are not quite.`,
  },
  {
    id: 'b06-fn-19', lesson: 'assumptions-and-diagnostics', type: 'mc', kind: 'applied',
    prompt: `Ana fits Millbrook’s ln(footfall) on the high, rain and the weekend over its 306 days. The residuals’ Durbin–Watson statistic is ${fx(DW19, 2)}, and their averages by month are in the table. What should she do?`,
    data: { table: { head: ['Month', 'Average residual'], rows: BYMONTH.map((b) => [MONTH[b.m], fx(b.e, 3)]), align: ['l', 'r'] } },
    options: [
      'Add a term for the café’s build-up over time: the residuals climb through the year, so a trend is missing',
      'Switch to HC3 standard errors: a Durbin–Watson value well below 2 is a sign of unequal residual spread',
      'Check a Q–Q plot: residuals that change sign in the middle of the year are a sign of non-normal errors',
      'Little: Durbin–Watson mainly concerns the two cafés sharing days, which one café’s rows don’t do',
    ],
    answer: 0,
    feedback: {
      1: 'Durbin–Watson measures autocorrelation in time order, not unequal spread. Robust (HC3) SEs don’t fix residuals that follow a trend.',
      2: 'A systematic drift in the averages by month is about the model’s form, not the shape of the error distribution.',
      3: 'Durbin–Watson is computed on residuals in time order; Millbrook’s 306 days are in date order, and neighbouring days’ residuals are alike.',
    },
    solution: `The residuals start well below zero in March (${fx(BYMONTH[0].e, 3)}) and end above it (${fx(BYMONTH[9].e, 3)} in December): footfall grew in a way the high, rain and weekend don’t explain. That is the case’s build-up, an omitted time trend, and it also makes neighbouring residuals alike (DW = ${fx(DW19, 2)}). With the build-up term added, DW is ${fx(DW19b, 2)} and the high’s slope stops absorbing the growth.`,
  },
  {
    id: 'b06-fn-20', lesson: 'transformations-and-influence', type: 'formula', kind: 'numerical',
    prompt: `Harbourside’s weekdays, 12 July – 20 August 2027: rain in B2:B${s20L} and footfall in C2:C${s20L}. F1 holds a day’s rain in inches. In F2, calculate in one formula the median footfall that the least-squares line of ln(footfall) on rain predicts for a day with that rain.`,
    sheet: { cells: { A1: 'Day', B1: 'Rain (in)', C1: 'Footfall', E1: 'Rain (in)', F1: s20At, E2: 'Median footfall', ...col('A', 2, S20.map(label)), ...col('B', 2, s20R), ...col('C', 2, s20F) }, vary: { F1: [0.25, 0.75] } },
    cell: 'F2', view: `A1:F${s20L}`, maxHeight: '20rem', widths: { A: 11, E: 17 }, formats: { B: '0.00', F1: '0.00', F2: '0.0' },
    answer: `=EXP(TREND(LN(C2:C${s20L}),B2:B${s20L},F1))`,
    alt: [`=EXP(FORECAST.LINEAR(F1,LN(C2:C${s20L}),B2:B${s20L}))`, `=EXP(INTERCEPT(LN(C2:C${s20L}),B2:B${s20L})+SLOPE(LN(C2:C${s20L}),B2:B${s20L})*F1)`],
    wrong: [
      { formula: `=TREND(LN(C2:C${s20L}),B2:B${s20L},F1)`, say: 'That is the predicted ln(footfall). Back-transform it with EXP to get people.' },
      { formula: `=TREND(C2:C${s20L},B2:B${s20L},F1)`, say: 'That is the straight line in people. The question asks for the line of ln(footfall), back-transformed.' },
      { formula: `=EXP(TREND(LN(C2:C${s20L}),B2:B${s20L},LN(F1)))`, say: 'Only footfall is logged; rain enters as inches, so the new x is F1 itself.' },
    ],
    solution: `<x>=EXP(TREND(LN(C2:C${s20L}),B2:B${s20L},F1))</x>: ln(footfall) = ${fx(F20.beta[0], 3)} + (${fx(F20.beta[1], 3)}) × ${s20At} = ${fx(F20.predict([s20At]).yhat, 3)}, and e to that is ${fx(s20Med, 1)} people. Exponentiating a predicted log gives the median, not the mean; the mean is a little higher (multiply by a smearing factor). The straight line in people gives ${fx(s20Lev, 1)}. Rain fell on ${s20Wet} of the ${S20.length} days and the highs stayed between ${Math.min(...s20Hi)} and ${Math.max(...s20Hi)}°F, so the high varies little here; the fit is still an association over consecutive summer days.`,
  },
  {
    id: 'b06-fn-21', lesson: 'transformations-and-influence', type: 'mc', kind: 'applied',
    prompt: `In the raw log, Millbrook’s September transactions regressed on footfall (${S21raw.length} days) have a slope of ${fx(F21raw.beta[1], 3)} transactions per visitor and R² = ${fx(F21raw.r2, 3)}. One day, 14 September, has leverage ${fx(INF21.hat[k21], 3)}, an internally studentized residual of ${fx(INF21.internal[k21], 2)} and a Cook’s distance of ${fx(INF21.cooks[k21], 0)}; its footfall reads ${SLIP.recorded.toLocaleString('en-US')}. What should Ana do?`,
    options: [
      'Check the door counter’s own record for that day, correct the value if it is a slip, and note the change',
      'Delete 14 September, since a Cook’s distance far above 1 marks a row that should be removed from the fit',
      'Keep the day as typed and report the slope as it stands, because changing a recorded value is manipulation',
      'Delete every September day whose studentized residual is beyond ±2, then refit and report that slope',
    ],
    answer: 0,
    feedback: {
      1: 'Cook’s distance flags a row to investigate, not one to delete. If the day is real it belongs in the data; if it is a typing slip with a known true value, correct it.',
      2: 'Correcting a documented error from its source is not manipulation; leaving it would let one typo set the slope.',
      3: 'Deleting by a residual cut-off throws away real days and biases the fit. Investigate the flagged row first.',
    },
    solution: `A leverage of ${fx(INF21.hat[k21], 2)} means the day’s footfall is far from every other September day’s, and a Cook’s distance of ${fx(INF21.cooks[k21], 0)} means it moves the line enormously: with it the slope is ${fx(F21raw.beta[1], 3)} (R² ${fx(F21raw.r2, 3)}); with the door counter’s ${SLIP.actual} in its place, ${fx(F21.beta[1], 3)} (R² ${fx(F21.r2, 3)}). A stray extra digit is an error with a known correction: fix it from the source, record the change, and report both fits if anyone relied on the raw log. Never delete a row because it spoils a result.`,
  },
  {
    id: 'b06-fn-22', lesson: 'logistic-regression', type: 'steps', kind: 'applied',
    prompt: `Ana’s logistic model of whether October’s ${DERIVED.members} joiners returned within 30 days (${DERIVED.returned} did) has these coefficients.`,
    data: { table: { head: ['Term', 'Coefficient', 'Odds ratio'], rows: RM.coefs.map((c) => [c.name, fx(c.estimate, 3), c.name === 'Intercept' ? '' : fx(Math.exp(c.estimate), 3)]), align: ['l', 'r', 'r'] } },
    steps: [
      {
        id: 'b06-fn-22-s1', type: 'mc',
        prompt: 'What does the odds ratio for the first ticket say?',
        options: [
          `Each extra dollar on the first ticket goes with odds of returning ${fx(Math.exp(cR('First ticket ($)').estimate), 2)} times as high, holding the other predictors fixed`,
          `Each extra dollar on the first ticket raises the probability of returning by ${fx((Math.exp(cR('First ticket ($)').estimate) - 1) * 100, 0)} percentage points, the others held fixed`,
          `Members who spend an extra dollar are ${fx(Math.exp(cR('First ticket ($)').estimate), 2)} times as likely to return, largely regardless of their other characteristics`,
          `Spending an extra dollar on the first visit causes a member’s odds of returning to rise by ${fx((Math.exp(cR('First ticket ($)').estimate) - 1) * 100, 0)}%`,
        ],
        answer: 0,
        feedback: {
          1: 'An odds ratio multiplies the odds, not the probability. How many points the probability moves depends on where the member starts.',
          2: '“Times as likely” is a ratio of probabilities, which an odds ratio isn’t (unless returning is rare). And it holds for members alike in the other predictors.',
          3: 'The joiners weren’t assigned their first spend: the odds ratio is an association, holding the other predictors fixed.',
        },
        solution: `e^${fx(cR('First ticket ($)').estimate, 3)} = ${fx(Math.exp(cR('First ticket ($)').estimate), 3)}: each extra dollar goes with the odds multiplied by about ${fx(Math.exp(cR('First ticket ($)').estimate), 2)}, for members alike in the other predictors.`,
      },
      {
        id: 'b06-fn-22-s2', type: 'num', kind: 'numerical',
        prompt: 'For a Harbourside member who lives further away (near = 0), joined on a weekday and turned notifications on, at what first ticket does the model’s predicted probability of returning reach 0.5? Give dollars to two decimal places.',
        answer: rnd(tHalf, 2),
        check: () => -(RM.beta[0] + RM.beta[2]) / RM.beta[3],
        unit: '$', places: 2, tol: 0.01,
        wrong: [
          { value: rnd(-RM.beta[0] / RM.beta[3], 2), say: 'That leaves out notifications. This member has them on, which adds their coefficient to the log-odds.' },
          { value: rnd((0.5 - RM.beta[0] - RM.beta[2]) / RM.beta[3], 2), say: 'A probability of 0.5 means odds of 1 and log-odds of 0, not log-odds of 0.5.' },
        ],
        solution: `p = 0.5 when the log-odds are 0: ${fx(RM.beta[0], 3)} + ${fx(RM.beta[2], 3)} + ${fx(RM.beta[3], 3)} × ticket = 0, so ticket = ${fx(-(RM.beta[0] + RM.beta[2]), 3)} ÷ ${fx(RM.beta[3], 3)} = $${fx(tHalf, 2)}. Below that the model leans to “won’t return” for such a member, above it to “will return”.`,
      },
      {
        id: 'b06-fn-22-s3', type: 'num', kind: 'numerical',
        prompt: `Classifying all ${DERIVED.members} joiners as “will return” when the predicted probability is at least 0.5, the model gets ${CONF.tp + CONF.tn} right. By how many percentage points does that accuracy beat always predicting the commoner outcome? Give one decimal place.`,
        answer: rnd((CONF.accuracy - Math.max(baseRate, 1 - baseRate)) * 100, 1),
        check: () => ((CONF.tp + CONF.tn) / 225 - 121 / 225) * 100,
        unit: 'points', places: 1, tol: 0.05,
        wrong: [
          { value: rnd((CONF.accuracy - 0.5) * 100, 1), say: 'The yardstick is always guessing the commoner outcome (returned, 121 of 225), not a coin toss.' },
          { value: rnd(CONF.accuracy * 100, 1), say: 'That is the accuracy itself. Subtract the accuracy of always predicting “returned”.' },
        ],
        solution: `Accuracy = ${CONF.tp + CONF.tn} ÷ ${DERIVED.members} = ${fx(CONF.accuracy * 100, 1)}%; always predicting “returned” is right ${DERIVED.returned} ÷ ${DERIVED.members} = ${fx(baseRate * 100, 1)}% of the time. The gain is ${fx((CONF.accuracy - baseRate) * 100, 1)} points, measured on the same members the model was fitted to, so it flatters the model; new members would be a fairer test.`,
      },
    ],
    solution: `The odds ratio multiplies odds holding the others fixed; such a member crosses 0.5 at a first ticket of $${fx(tHalf, 2)}; at 0.5 the model beats the base rate by ${fx((CONF.accuracy - baseRate) * 100, 1)} points in-sample.`,
  },
  {
    id: 'b06-fn-23', lesson: 'logistic-regression', type: 'mc', kind: 'conceptual',
    prompt: `In Ana’s model the weekend term has a Wald p-value of ${fx(cR('Weekend').p, 3)} and the Millbrook term ${fx(cR('Millbrook').p, 3)}. Dropping both, the log-likelihood falls from ${fx(RM.ll, 2)} to ${fx(RED23.ll, 2)}. A colleague says: “Weekend isn’t significant, so drop it; and while we’re at it, drop the café too.” What is the best reply?`,
    options: [
      `Together the two terms improve the fit (likelihood-ratio statistic ${fx(LR23.stat, 2)} on 2 df, p = ${fx(LR23.p, 3)}): dropping both isn’t supported`,
      `Both should go: the weekend term’s Wald p is above 0.05, and a lean model is better off without terms that fail their tests`,
      `Wald tests are the ones for single terms in logistic regression; the likelihood-ratio test is meant for normal errors rather than here`,
      `The log-likelihoods are hard to compare because the smaller model has fewer coefficients and so is bound to fit a little worse`,
    ],
    answer: 0,
    feedback: {
      1: 'A p-value above 0.05 is not evidence of no effect, and dropping a pair because one is weak can throw away the other: test the pair, or each term, directly.',
      2: 'The likelihood-ratio test is the standard test for nested logistic models: 2(ℓ_full − ℓ_reduced) against chi-square on the number of terms dropped.',
      3: 'The smaller model always fits a little worse; the LR test asks whether it fits worse by more than chance, comparing the drop with chi-square on 2 df.',
    },
    solution: `LR = 2 × (${fx(RM.ll, 2)} − (${fx(RED23.ll, 2)})) = ${fx(LR23.stat, 2)} on 2 df, p = ${fx(LR23.p, 3)}: the café and weekend terms together add real information, the café mainly (its Wald p is ${fx(cR('Millbrook').p, 3)}). The weekend’s p of ${fx(cR('Weekend').p, 3)} says only that its effect is not pinned down; whether to keep it depends on the purpose, not on crossing 0.05.`,
  },
  {
    id: 'b06-fn-24', lesson: 'transformations-and-influence', type: 'num', kind: 'applied',
    prompt: `Over both cafés’ 612 days, Ana fits the peak wait (minutes) on the load and a squared hinge, max(0, load − 7)²: wait = ${fx(FH24.beta[0], 3)} + (${fx(FH24.beta[1], 4)}) × load + ${fx(FH24.beta[2], 4)} × hinge². How many more minutes does the model expect the wait to be at a load of 11 than at a load of 8? Give two decimal places.`,
    answer: rnd(w24(11) - w24(8), 2),
    check: () => FH24.beta[1] * 3 + FH24.beta[2] * (16 - 1),
    unit: 'minutes', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(FW.beta[1] * 3, 2), say: 'That uses the straight line’s slope. With the hinge, each unit of load above 7 adds more than the last.' },
      { value: rnd(FH24.beta[2] * 9, 2), say: 'The hinge term at 11 is (11 − 7)² = 16 and at 8 it is (8 − 7)² = 1, so it adds 15 × the coefficient, not 9.' },
      { value: rnd(FH24.beta[1] * 3 + FH24.beta[2] * 3, 2), say: 'The hinge is squared: (11 − 7)² − (8 − 7)² = 15, not 3.' },
    ],
    solution: `At 11: hinge² = 16; at 8: hinge² = 1. Difference = ${fx(FH24.beta[1], 4)} × 3 + ${fx(FH24.beta[2], 4)} × 15 = ${fx(w24(11) - w24(8), 2)} minutes, against ${fx(FW.beta[1] * 3, 2)} from a straight line. The case plants a wait of 1.5 + 0.22·max(0, load − 7)² + 0.02·load, which gives ${fx(planted24(8, 11), 2)}: the hinge model recovers the planted curve. Both cafés’ rows share days, but that doesn’t bias the coefficients.`,
  },
];
