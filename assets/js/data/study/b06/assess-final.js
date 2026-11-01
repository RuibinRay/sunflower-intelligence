// assess-final.js — B06 final assessment: 24 questions across all four modules and all six of the course’s outcomes,
// two or three per lesson (five for module 1, five for module 2, seven for module 3 and seven for module 4). 70% passes.
// Mixed conceptual, numerical and applied items. Four are formula items on worksheets sliced from the café log, one of
// them a steps item with two formula steps: footfall estimated from transactions with the line of footfall on
// transactions (b06-fn-1, Harbourside’s weekdays 12 July – 15 August, the transactions varied on the copies); the fitted
// value and the half-width of the 95% confidence interval for the mean at a forecast high (b06-fn-6, Harbourside’s
// weekdays 1 June – 9 July, the high varied); the lower 95% limit of the weekend coefficient from LINEST with three x
// columns (b06-fn-12, Harbourside’s October); the exact % change in footfall for a given rain from ln(footfall) on rain
// (b06-fn-20, Harbourside’s weekdays 12 July – 20 August, the rain varied). Café values are scaled on the marking copies,
// so typed results fail.
// Items that combine lessons: x on y against y on x for an estimate (fn-1: least-squares-line, residuals-and-r-squared);
// rescaling, centring and swapping the axes against R² (fn-2: least-squares-line, residuals-and-r-squared); the residual
// standard error from r and s_y (fn-3: least-squares-line, residuals-and-r-squared); a low summer R² read against the
// range of x (fn-4: residuals-and-r-squared, inference-for-coefficients); a straight line for the wait judged from its
// residuals by load band (fn-5: residuals-and-r-squared, transformations-and-influence); a fitted value, the mean’s
// confidence interval and which interval a one-day roster needs (fn-6: prediction-and-intervals,
// inference-for-coefficients); a pooled slope over both cafés, what it describes and which way its SE errs (fn-8:
// inference-for-coefficients, categorical-predictors-and-interactions, assumptions-and-diagnostics); a prediction
// interval from a log model, back-transformed (fn-9: prediction-and-intervals, transformations-and-influence); a
// constant-spread prediction interval against the weekend and weekday residual spreads (fn-10: prediction-and-intervals,
// assumptions-and-diagnostics); why the high’s slope halves when the build-up is added (fn-11: multiple-regression,
// multicollinearity-and-model-choice); a weekend coefficient’s interval from LINEST (fn-12: multiple-regression,
// inference-for-coefficients); a café × weekend prediction, then whether its prediction interval fits that kind of day
// (fn-13: categorical-predictors-and-interactions, prediction-and-intervals, assumptions-and-diagnostics); the ticket
// slope that turns round with a café dummy (fn-14: categorical-predictors-and-interactions, multiple-regression); day
// dummies against a weekend dummy by a nested F test (fn-15: multicollinearity-and-model-choice,
// categorical-predictors-and-interactions); the SE inflation of transactions beside footfall (fn-16:
// multicollinearity-and-model-choice, multiple-regression); heteroskedasticity, HC3 and the log model (fn-18:
// assumptions-and-diagnostics, transformations-and-influence); residuals in time order and the missing build-up (fn-19:
// assumptions-and-diagnostics, multiple-regression); the slip’s leverage and Cook’s distance (fn-21:
// transformations-and-influence, least-squares-line); an odds ratio read, a probability predicted and the
// classification judged against the base rate (fn-22: logistic-regression); Wald against likelihood-ratio for two terms
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
import { CLEAN_ROWS, CAFE_ROWS, CAFE_COLUMNS, SLIP, column, member, DERIVED } from './case.js?v=22';
import * as R from '../../../core/regression.js?v=22';
import { confusion } from '../../../core/classify.js?v=22';
import { pearson } from '../../../core/correlation.js?v=22';

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
    prompt: `Over Harbourside’s ${F3.n} days, the high and footfall correlate at r = ${fx(F3.r, 3)}, and footfall has a standard deviation of ${fx(F3.sy, 2)} people. What is the residual standard error of the least-squares line of footfall on the high, in people? Give one decimal place.`,
    answer: rnd(seFrom(F3), 1),
    check: () => FH.sigma,
    unit: 'people', places: 1, tol: 0.15,
    wrong: [
      { value: rnd(F3.sy * (1 - F3.r ** 2), 1), say: '1 − r² is the share of the variance left unexplained. The residual standard error is a standard deviation, so it scales with √(1 − r²).' },
      { value: rnd(F3.sy * (1 - F3.r), 1), say: 'The spread left over depends on r², not r: s_e ≈ s_y√(1 − r²).' },
      { value: rnd(F3.sy * F3.r, 1), say: 'r × s_y is the slope times s_x, the spread of the fitted values. The residuals’ spread is s_y√(1 − r²) (times √((n − 1)/(n − 2))).' },
    ],
    solution: `SST = (n − 1)s_y² and SSE = (1 − r²)SST, so s_e = √(SSE ÷ (n − 2)) = s_y √((1 − r²)(n − 1)/(n − 2)) = ${fx(F3.sy, 2)} × √(${fx(1 - F3.r ** 2, 4)} × 305/304) = ${fx(seFrom(F3), 1)} people. Knowing the high trims the typical miss only from ${fx(F3.sy, 1)} to ${fx(seFrom(F3), 1)}: R² = ${fx(F3.r ** 2, 3)}. The rest is the weekend, rain, festivals and the build-up, which this line leaves out.`,
  },
  {
    id: 'b06-fn-4', lesson: 'residuals-and-r-squared', type: 'mc', kind: 'applied',
    prompt: `Over all of 2027, Harbourside’s footfall on the high has R² = ${fx(FH.r2, 3)}. Fitted to July and August alone (festival days left out, highs ${Math.min(...get(SUMMER, 'high_f'))}–${Math.max(...get(SUMMER, 'high_f'))}°F), R² is ${fx(FS.r2, 3)}. The manager concludes: “In summer the high makes no difference, so we can stop checking the forecast.” What is the best reply?`,
    options: [
      'Summer highs span only 20 degrees while weekends and rain vary as much as ever, so R² is bound to be small; that doesn’t make the high irrelevant.',
      'He is right: an R² close to zero means the high and footfall are unrelated in summer, so a forecast of the high carries no information about footfall.',
      'The summer R² is the trustworthy one, since it uses the most recent and most similar days; the year’s R² is inflated by mixing in the winter months.',
      'R² can’t be compared across the two fits, because one of them has fewer than 100 days, too few for R² to mean anything at all.',
    ],
    answer: 0,
    feedback: {
      1: `R² measures the share of footfall’s variance the line accounts for, and it shrinks when x varies little. Over the year the line climbs about ${fx(FH.beta[1], 1)} people per °F; a summer slope from ${SUMMER.length} days is very loosely pinned down (95% interval ${fx(FS.coefs[1].low, 1)} to ${fx(FS.coefs[1].high, 1)}).`,
      2: 'Both fits use real days. The summer fit is weaker because its range of x is restricted and the weekend and rain swamp it, not because it is more trustworthy.',
      3: `R² can be computed for any number of rows; with ${SUMMER.length} days it is just noisier. The difference here comes from the range of x.`,
    },
    solution: `R² depends on the range of x as well as on the relationship: over July and August the high covers only ${Math.min(...get(SUMMER, 'high_f'))}–${Math.max(...get(SUMMER, 'high_f'))}°F, while weekends and rain still move footfall a lot, so the high can account for little of the variance (R² = ${fx(FS.r2, 3)} against ${fx(FH.r2, 3)} for the year). A low R² is not evidence of no effect: the summer slope’s 95% interval, ${fx(FS.coefs[1].low, 1)} to ${fx(FS.coefs[1].high, 1)} people per °F, is wide enough to include the year’s ${fx(FH.beta[1], 2)} (and treats consecutive summer days as independent, which they aren’t). Put the weekend and rain in the model before judging the high.`,
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
      1: 'R² can’t tell a straight relationship from a curved one. Hundreds of days per band averaging the same sign, positive at both ends and negative in the middle, is a systematic pattern, not noise.',
      2: 'Least-squares residuals always average zero overall; the question is whether they average zero at every x. Here they don’t.',
      3: 'The table shows the residuals’ averages, not their spread: it is about the line’s shape, not equal variance.',
    },
    solution: `Positive residuals at low and high loads and negative ones between them mean the true relationship is convex: the line overstates the wait between loads of 6 and 10 and understates it beyond. That is a wrong functional form, which a high R² (${fx(FW.r2, 2)}) does not rule out. The case plants a hinge at a load of about 7, and a model with a squared hinge term fits the curve (transformations-and-influence).`,
  },

  // ================================================================ Module 2: inference and prediction
  {
    id: 'b06-fn-6', lesson: 'prediction-and-intervals', type: 'steps', kind: 'applied',
    prompt: `Harbourside’s weekdays, 1 June – 9 July 2027 (${S6.length} days): the high in B2:B${s6L} and footfall in C2:C${s6L}. F1 holds the forecast high for next Tuesday.`,
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
        prompt: 'The manager will roster baristas for that one Tuesday. Which interval should she plan with?',
        options: [
          'The prediction interval: one day scatters around the mean by s as well, so it is several times as wide',
          'The confidence interval for the mean, since the roster is set from the expected trade on that day',
          'The confidence interval for the mean, widened by 1.96 instead of t because the forecast is for a new day',
          'Either: at a high this close to the mean of the data the two intervals are almost the same width',
        ],
        answer: 0,
        feedback: {
          1: 'The confidence interval says where the average of all such Tuesdays lies. A single Tuesday adds its own scatter, s, which the mean’s interval leaves out.',
          2: 'The multiplier isn’t the issue: the confidence interval omits the day’s own scatter, the 1 under the root.',
          3: 'Near x̄ the confidence interval is at its narrowest while the prediction interval is still at least ±t·s: they differ most there in relative terms.',
        },
        solution: `For one day she needs the 95% prediction interval, ŷ ± t*·s√(1 + 1/n + (x₀ − x̄)²/Sxx): ${fx(P6.piLow, 0)} to ${fx(P6.piHigh, 0)} people at ${s6At}°F, against ${fx(P6.ciLow, 0)} to ${fx(P6.ciHigh, 0)} for the mean. Both treat the ${S6.length} weekdays as independent; consecutive days could break that, though here the residuals’ lag-1 correlation is only ${fx(s6Lag, 2)}. The prediction interval also assumes the same, roughly normal, scatter on every day.`,
      },
    ],
    solution: `ŷ = ${fx(P6.yhat, 1)} people at ${s6At}°F; the mean’s 95% interval is ± ${fx(P6.ciHigh - P6.yhat, 1)} and one day’s ± ${fx(P6.piHigh - P6.yhat, 1)}. The roster for one day needs the prediction interval.`,
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
    prompt: `A colleague regresses footfall on the high over all 612 rows (both cafés, 306 days) and reports: “Each extra °F brings ${fx(F8.coefs[1].estimate, 2)} more people to a café (95% CI ${fx(F8.coefs[1].low, 2)} to ${fx(F8.coefs[1].high, 2)}, p ${p3(F8.coefs[1].p)}).” Fitted café by café, the slopes are ${fx(FH.beta[1], 2)} at Harbourside and ${fx(F8M.beta[1], 2)} at Millbrook. What is the main problem with the report?`,
    options: [
      'The pooled slope fits neither café: let it differ by café with a café × high term, and check its SE, since each day gives the model two rows.',
      'The interval is too narrow: the two cafés share their days, so the 612 rows carry only 306 days’ worth of information and the true SE is larger than reported.',
      'Nothing serious: with 612 rows and p below 0.001 the pooled slope is precise, and its interval already covers the two cafés’ different slopes.',
      'The pooled slope should be replaced by the average of the two cafés’ slopes, which weights them equally and so is free of any dependence problem.',
    ],
    answer: 0,
    feedback: {
      1: 'The direction of a dependence error has to be checked, not assumed. The two cafés’ residuals on the same day tend to go opposite ways (their weekend and weekday patterns are reversed), and on these data an SE that treats each day as one unit comes out smaller than the formula’s, not larger.',
      2: `The interval runs from ${fx(F8.coefs[1].low, 2)} to ${fx(F8.coefs[1].high, 2)}, and neither café’s own slope is in it. Precision about a blend is no help when the blend describes no café.`,
      3: 'Averaging two slopes still gives a number that fits neither café, and it does nothing about the rows of a day being related.',
    },
    solution: `The cafés respond very differently to the high (${fx(FH.beta[1], 2)} and ${fx(F8M.beta[1], 2)} people per °F), so a pooled slope of ${fx(F8.coefs[1].estimate, 2)} is a blend: let the slope differ by café with a café dummy and a café × high interaction, or fit them separately. The printed SE also assumes 612 independent rows, which they aren’t: each day appears twice with the same weather. Here a standard error that groups the rows by day is smaller than the formula’s, because the cafés’ same-day residuals tend to offset each other; the formula’s interval is, if anything, too wide. Days in sequence are a separate dependence that should be checked as well.`,
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
      'It is fine: a prediction interval already allows for days being more or less variable than average',
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
          'About right: a prediction interval is built from all 612 rows, so it fits every kind of day',
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
    prompt: `Over all 612 rows, the average ticket regressed on footfall has a slope of ${fx(T14a.beta[1] * 100, 2)} dollars per 100 extra visitors (p ${p3(T14a.coefs[1].p)}). Adding a Millbrook dummy turns it into ${fx(T14b.beta[1] * 100, 2)} dollars per 100 visitors (p ${p3(T14b.coefs[1].p)}). Millbrook averages ${fx(meanFootM, 0)} visitors a day and Harbourside ${fx(meanFootH, 0)}. Which reading is right?`,
    options: [
      'Within each café busier days go with slightly larger tickets; the pooled slope mostly compares the busier, lower-ticket café with the other.',
      'Busier days lower the average ticket; the dummy model reverses the sign only because two predictors are correlated and the slopes become unstable.',
      'The pooled slope is the one to report, because it uses every row without splitting the cafés; the dummy throws away the comparison between them.',
      'The two slopes contradict each other, so neither can be trusted; the relationship between footfall and the ticket can’t be estimated from this log.',
    ],
    answer: 0,
    feedback: {
      1: `The slope with the dummy is the comparison of days within the same café, and it is clearly positive (p ${p3(T14b.coefs[1].p)}). It is not instability: the sign is pinned down.`,
      2: 'The dummy doesn’t throw the cafés’ difference away: its coefficient measures it. What it stops is that difference masquerading as an effect of footfall.',
      3: 'Both are well estimated; they answer different questions. That is Simpson’s paradox, which the dummy resolves.',
    },
    solution: `Pooled, footfall and the café are tangled: Millbrook has more visitors and smaller tickets, so across all rows more footfall goes with smaller tickets. Holding the café fixed with a dummy, busier days go with tickets about ${fx(T14b.beta[1] * 100, 2)} dollars higher per 100 extra visitors. B05 found the same reversal with correlations; the dummy puts it in one model, with the café gap as its own coefficient (${fx(T14b.beta[2], 2)} dollars). Both p-values treat the 612 rows as independent, which they aren’t (each day appears twice, and days run in sequence), so they are approximate; at this size the signs are not in doubt.`,
  },
  {
    id: 'b06-fn-15', lesson: 'multicollinearity-and-model-choice', type: 'mc', kind: 'applied',
    prompt: `For Harbourside’s 306 days, Ana compares two models of footfall that both include the high, rain, festival and build-up: one with six day-of-week dummies (Monday the reference), one with a single weekend dummy. The nested F test gives F = ${fx(NF15.F, 2)} on (${NF15.df1}, ${NF15.df2}) df, p = ${fx(NF15.p, 2)}. In the six-dummy model, Saturday’s coefficient is ${fx(c15('Day: Sat').estimate, 1)} and Sunday’s ${fx(c15('Day: Sun').estimate, 1)}. What should she conclude?`,
    options: [
      'The weekend dummy is enough: the models are nested and the five extra terms add nothing beyond chance',
      'Keep the six dummies: Saturday and Sunday are both significant, so the day of the week matters',
      'The F test can’t be used here, because the weekend model isn’t one of the six-dummy model’s special cases',
      'Keep the six dummies: the larger model has the higher R², so it must be the better description',
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
    prompt: `Over Millbrook’s 306 days, footfall and transactions correlate at r = ${fx(r16, 3)}. Ana regresses sales on both. By roughly what factor is the standard error of the transactions slope larger than it would be if the two predictors were unrelated (same residual spread)? Give two decimal places.`,
    answer: rnd(Math.sqrt(1 / (1 - r16 ** 2)), 2),
    check: () => Math.sqrt(1 / (1 - 0.985 ** 2)),
    unit: '', places: 2, tol: 0.02,
    wrong: [
      { value: rnd(1 / (1 - r16 ** 2), 2), say: 'That is the VIF, the factor on the variance. The standard error grows by its square root.' },
      { value: rnd(1 / (1 - r16), 2), say: 'With two predictors the VIF is 1 ÷ (1 − r²), using r squared.' },
    ],
    solution: `VIF = 1 ÷ (1 − ${fx(r16, 3)}²) = ${fx(1 / (1 - r16 ** 2), 1)}, so the SE is √${fx(1 / (1 - r16 ** 2), 1)} ≈ ${fx(Math.sqrt(1 / (1 - r16 ** 2)), 2)} times larger. The fits agree: the transactions slope’s SE is ${fx(S16a.coefs[1].se, 3)} alone and ${fx(S16b.coefs[2].se, 3)} beside footfall, whose own slope (${fx(S16b.coefs[1].estimate, 3)}, p = ${fx(S16b.coefs[1].p, 2)}) can’t be told from zero. Footfall adds nothing once transactions are known; for predicting sales either model serves, but no one should read footfall’s slope as “a visitor is worth nothing”. (The p-value treats Millbrook’s days as independent; days in sequence make it approximate.)`,
  },
  {
    id: 'b06-fn-17', lesson: 'multicollinearity-and-model-choice', type: 'multi', kind: 'conceptual',
    prompt: 'Ana is choosing predictors for Harbourside’s footfall models. Select all the statements that are true.',
    options: [
      'Keeping only the predictors that stepwise selection finds with p below 0.05 gives p-values that look stronger than they are.',
      'Testing a model on months that came after the months it was fitted to checks forecasting accuracy more honestly than in-sample R², though later months may differ in other ways.',
      'With more than seven rows, BIC charges more for each extra coefficient than AIC does.',
      'For a report on what a weekend is worth, barista hours rostered from the expected trade should be left out, since they follow from the weekend’s trade.',
      'The model with the highest R² on the fitting data will also forecast best.',
      'Adjusted R² can never fall when a predictor is added.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'R² never falls as terms are added, including useless ones; the extra terms fit noise that won’t recur. Judge forecasts on data the model hasn’t seen.',
      5: 'Adjusted R² falls when a new predictor reduces SSE by less than its share of a degree of freedom is worth.',
    },
    solution: 'True: stepwise p-values ignore the search that picked them; a hold-out on later months mimics forecasting but inherits any change between periods (the build-up, the season); BIC’s penalty per coefficient is ln n against AIC’s 2, larger once n ≥ 8; and a predictor set from the outcome’s expected value (the roster) absorbs part of the effect being reported. False: in-sample R² rewards overfitting; adjusted R² can fall.',
  },

  // ================================================================ Module 4: checking and extending a model
  {
    id: 'b06-fn-18', lesson: 'assumptions-and-diagnostics', type: 'mc', kind: 'applied',
    prompt: `Harbourside’s model of footfall in people on the high, rain, weekend, festival and build-up has a Breusch–Pagan statistic of ${fx(BP18.lm, 1)} on ${BP18.df} df (p ${p3(BP18.p)}). The festival coefficient is ${fx(fest18.estimate, 1)} people with an ordinary SE of ${fx(fest18.se, 2)} and an HC3 SE of ${fx(festR18.se, 2)}. With ln(footfall) as the outcome, the Breusch–Pagan p-value is ${fx(BP18log.p, 2)}. Which statement is right?`,
    options: [
      `The festival estimate stays ${fx(fest18.estimate, 0)} under HC3; only its interval widens, and logging footfall removes the unequal spread.`,
      `HC3 shows that the festival effect is smaller than ${fx(fest18.estimate, 0)} people, since the five festival days are the noisiest rows.`,
      'The significant Breusch–Pagan test means every coefficient is biased, so the festival days should be dropped and the model refitted.',
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
      'Nothing: Durbin–Watson is about the two cafés sharing days, which can’t apply to one café’s rows',
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
    prompt: `Harbourside’s weekdays, 12 July – 20 August 2027: rain in B2:B${s20L} and footfall in C2:C${s20L}. F1 holds a day’s rain in inches. In F2, calculate in one formula the proportional change in footfall that the least-squares line of ln(footfall) on rain gives for a day with that rain, compared with a dry day (−0.10 is 10% fewer people), exactly rather than by the approximation.`,
    sheet: { cells: { A1: 'Day', B1: 'Rain (in)', C1: 'Footfall', E1: 'Rain (in)', F1: s20At, E2: 'Change against a dry day', ...col('A', 2, S20.map(label)), ...col('B', 2, s20R), ...col('C', 2, s20F) }, vary: { F1: [0.25, 0.75] } },
    cell: 'F2', view: `A1:F${s20L}`, maxHeight: '20rem', widths: { A: 11, E: 23 }, formats: { B: '0.00', F1: '0.00', F2: '0.0%' },
    answer: `=EXP(SLOPE(LN(C2:C${s20L}),B2:B${s20L})*F1)-1`,
    alt: [`=EXP(F1*SLOPE(LN(C2:C${s20L}),B2:B${s20L}))-1`, `=EXP(INDEX(LINEST(LN(C2:C${s20L}),B2:B${s20L}),1)*F1)-1`, `=EXP(SLOPE(LN(C2:C${s20L}),B2:B${s20L}))^F1-1`],
    wrong: [
      { formula: `=SLOPE(LN(C2:C${s20L}),B2:B${s20L})*F1`, say: 'b × Δx is the change in ln(footfall), which approximates the proportional change only when it is small. The exact change is e^(b·Δx) − 1.' },
      { formula: `=EXP(SLOPE(LN(C2:C${s20L}),B2:B${s20L}))-1`, say: 'That is the change for a whole inch of rain. Multiply the slope by the rain in F1 before exponentiating.' },
      { formula: `=SLOPE(C2:C${s20L},B2:B${s20L})*F1/AVERAGE(C2:C${s20L})`, say: 'That uses the line in people and divides by the average day. The question asks for the log model, whose slope is already proportional.' },
    ],
    solution: `The slope of ln(footfall) on rain is ${fx(F20.beta[1], 3)} per inch, so ${s20At} in multiplies footfall by e^(${fx(F20.beta[1], 3)} × ${s20At}) = ${fx(Math.exp(F20.beta[1] * s20At), 3)}: <x>=EXP(SLOPE(LN(C2:C${s20L}),B2:B${s20L})*F1)-1</x> = ${fx(s20Pct * 100, 1)}% (the approximation says ${fx(F20.beta[1] * s20At * 100, 1)}%). Rain fell on ${s20Wet} of the ${S20.length} days and the highs stayed between ${Math.min(...s20Hi)} and ${Math.max(...s20Hi)}°F, so the high varies little here; it is still an association over consecutive summer days, not a controlled comparison.`,
  },
  {
    id: 'b06-fn-21', lesson: 'transformations-and-influence', type: 'mc', kind: 'applied',
    prompt: `In the raw log, Millbrook’s September transactions regressed on footfall (${S21raw.length} days) have a slope of ${fx(F21raw.beta[1], 3)} transactions per visitor and R² = ${fx(F21raw.r2, 3)}. One day, 14 September, has leverage ${fx(INF21.hat[k21], 3)}, an internally studentized residual of ${fx(INF21.internal[k21], 2)} and a Cook’s distance of ${fx(INF21.cooks[k21], 0)}; its footfall reads ${SLIP.recorded.toLocaleString('en-US')}. What should Ana do?`,
    options: [
      'Check the door counter’s own record for that day, correct the value if it is a slip, and note the change',
      'Delete 14 September, since a Cook’s distance above 1 means that the row has to be removed from the fit',
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
          `Members who spend an extra dollar are ${fx(Math.exp(cR('First ticket ($)').estimate), 2)} times as likely to return, whatever their other characteristics`,
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
        prompt: 'What probability of returning does the model give a Harbourside member who lives further away (near = 0), joined on a weekday, turned notifications on and spent $7.00 on the first ticket? Give three decimal places.',
        answer: rnd(P22.p, 3),
        check: () => { const b = RM.beta, eta = b[0] + b[2] + 7 * b[3]; return 1 / (1 + Math.exp(-eta)); },
        unit: '', places: 3, tol: 0.0015,
        wrong: [
          { value: rnd(P22.eta, 3), say: 'That is the log-odds. The probability is 1 ÷ (1 + e^(−log-odds)).' },
          { value: rnd(Math.exp(P22.eta), 3), say: 'e^(log-odds) is the odds. Convert to a probability: odds ÷ (1 + odds).' },
          { value: rnd(1 / (1 + Math.exp(-(RM.beta[0] + RM.beta[2] + RM.beta[3]))), 3), say: 'The first ticket enters as dollars: multiply its coefficient by 7, not 1.' },
        ],
        solution: `Log-odds = ${fx(RM.beta[0], 3)} + ${fx(RM.beta[2], 3)} + 7 × ${fx(RM.beta[3], 3)} = ${fx(P22.eta, 3)}; probability = 1 ÷ (1 + e^${fx(-P22.eta, 3)}) = ${fx(P22.p, 3)} (95% interval ${fx(P22.low, 2)} to ${fx(P22.high, 2)}).`,
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
    solution: `The odds ratio multiplies odds holding the others fixed; the member’s probability is ${fx(P22.p, 3)}; at 0.5 the model beats the base rate by ${fx((CONF.accuracy - baseRate) * 100, 1)} points in-sample.`,
  },
  {
    id: 'b06-fn-23', lesson: 'logistic-regression', type: 'mc', kind: 'conceptual',
    prompt: `In Ana’s model the weekend term has a Wald p-value of ${fx(cR('Weekend').p, 3)} and the Millbrook term ${fx(cR('Millbrook').p, 3)}. Dropping both, the log-likelihood falls from ${fx(RM.ll, 2)} to ${fx(RED23.ll, 2)}. A colleague says: “Weekend isn’t significant, so drop it; and while we’re at it, drop the café too.” What is the best reply?`,
    options: [
      `Together the two terms improve the fit (likelihood-ratio statistic ${fx(LR23.stat, 2)} on 2 df, p = ${fx(LR23.p, 3)}): dropping both isn’t supported`,
      `Both should go: the weekend term’s Wald p is above 0.05, and a model must lose any term that fails its test, however the other terms fare`,
      `Only Wald tests can judge single terms in logistic regression; the likelihood-ratio test applies to normal errors and doesn’t apply here`,
      `The log-likelihoods can’t be compared because the smaller model has fewer coefficients and so always fits worse, whatever the data are`,
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
