// multicollinearity-and-model-choice.js — B06 · Multicollinearity and model choice. Content only; exercises are in
// multicollinearity-and-model-choice.ex.js. Uses the cafés' daily log (case.js: column): Harbourside's sales on footfall
// and transactions, month by month; the footfall models of the previous two lessons compared by adjusted R², nested F
// tests, AIC and BIC; a hold-out check (fit March–September, test October–December); peak barista hours as a predictor
// that forecasts without explaining; and 31 day-of-month dummies screened by p-value. Brackenfold Removals is fictional.
// Every figure printed is recomputed in `checks`.
import { column } from './case.js?v=22';
import * as R from '../../../core/regression.js?v=22';
import * as C from '../../../core/correlation.js?v=22';
import { mean } from '../../../core/stats.js?v=22';

const tn = (v) => Math.round(v).toLocaleString('en-US').replace(/,/g, '{,}');
const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const I = R.interaction;

// ---------------------------------------------------------------- Harbourside: sales on footfall and transactions
const H = { cafe: 'Harbourside' };
const sl = column('sales', H), ft = column('footfall', H), tr = column('transactions', H), moH = column('month', H);
const ST = R.fit(sl, { Transactions: tr }), SF = R.fit(sl, { Footfall: ft }), SB = R.fit(sl, { Footfall: ft, Transactions: tr });
const rFT = C.pearson(ft, tr).r, VIF = R.vif([ft, tr])[0];
const seRatio = SB.coefs[2].se / ST.coefs[1].se, seRatioFormula = Math.sqrt(VIF) * SB.sigma / ST.sigma;
const salesScale = mean(column('avg_ticket', H)) / 6.45;          // sales were scaled to F03's $236,000 total (about 0.829)
const plantedFoot = mean(tr) * 0.0040 * salesScale;            // the generator's ticket rise per visitor, at the mean transactions, in the log's dollars
const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
  const idx = moH.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0), g = (a) => idx.map((i) => a[i]);
  const both = R.fit(g(sl), { Footfall: g(ft), Transactions: g(tr) }), alone = R.fit(g(sl), { Transactions: g(tr) });
  return { m, n: idx.length, r: C.pearson(g(ft), g(tr)).r, vif: R.vif([g(ft), g(tr)])[0], bf: both.coefs[1], bt: both.coefs[2], at: alone.coefs[1], pF: both.pF };
});
const MN = ['', '', '', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const range = (k, f) => [Math.min(...MONTHS.map((x) => x[k][f])), Math.max(...MONTHS.map((x) => x[k][f]))];
const byM = (m) => MONTHS.find((x) => x.m === m);

// ---------------------------------------------------------------- both cafés: the footfall models of this module
const y = column('footfall'), mb = column('millbrook'), wk = column('weekend'), hi = column('high_f'), rain = column('rain_in'), fest = column('festival01');
const build = column('build_up');
const base = { High: hi, Rain: rain, Millbrook: mb, Weekend: wk, 'Millbrook × Weekend': I(mb, wk), Festival: fest };
const MA = R.fit(y, base);
const MB = R.fit(y, { ...base, 'High × Millbrook': I(hi, mb) });
const MC = R.fit(y, { ...base, 'High × Millbrook': I(hi, mb), 'Build-up': build });
const LV = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DD = R.dummies(column('weekday'), { reference: 'Mon', name: 'Day', levels: LV });
const DDM = Object.fromEntries(Object.entries(DD).map(([k, v]) => [`${k} × Millbrook`, I(v, mb)]));
const MW = R.fit(y, { High: hi, Rain: rain, Millbrook: mb, ...DD, ...DDM, Festival: fest, 'High × Millbrook': I(hi, mb), 'Build-up': build });
const FBA = R.nestedF(MB, MA), FCB = R.nestedF(MC, MB), FWC = R.nestedF(MW, MC);
const aicHand = (f) => f.n * Math.log(f.sse / f.n) + 2 * f.p;
// a predictor that forecasts without explaining: the roster
const MS = R.fit(y, { ...base, 'High × Millbrook': I(hi, mb), 'Build-up': build, 'Peak barista hours': column('peak_staff_hours') });
const est = (f, n) => f.coefs.find((k) => k.name === n).estimate;

// ---------------------------------------------------------------- Harbourside: the hold-out check
const yH = ft, hiH = column('high_f', H), rainH = column('rain_in', H), wkH = column('weekend', H), festH = column('festival01', H), dayH = column('day', H);
const buildH = column('build_up', H);
const DDH = R.dummies(column('weekday', H), { reference: 'Mon', name: 'Day', levels: LV });
const SETS = {
  A: { High: hiH, Rain: rainH, Weekend: wkH, Festival: festH },
  B: { High: hiH, Rain: rainH, Weekend: wkH, Festival: festH, 'Build-up': buildH },
  C: { High: hiH, Rain: rainH, Festival: festH, 'Build-up': buildH, ...DDH, 'High²': hiH.map((v) => v * v), 'Rain²': rainH.map((v) => v * v), Day: dayH, 'Day²': dayH.map((v) => v * v), 'Day³': dayH.map((v) => v ** 3), 'High × Rain': I(hiH, rainH), 'High × Weekend': I(hiH, wkH) },
};
const allIdx = yH.map((_, i) => i);
function holdout(train, test) {
  return Object.fromEntries(Object.entries(SETS).map(([k, xs]) => {
    const g = (a, idx) => idx.map((i) => a[i]);
    const f = R.fit(g(yH, train), Object.fromEntries(Object.entries(xs).map(([n, v]) => [n, g(v, train)])));
    const pred = test.map((i) => f.predict(Object.values(xs).map((v) => v[i])).yhat);
    const err = test.map((i, j) => yH[i] - pred[j]);
    return [k, { f, rmse: Math.sqrt(mean(err.map((e) => e * e))), bias: mean(err) }];
  }));
}
const TIME = holdout(allIdx.filter((i) => moH[i] <= 9), allIdx.filter((i) => moH[i] >= 10));
const ODD = holdout(allIdx.filter((i) => dayH[i] % 2 === 1), allIdx.filter((i) => dayH[i] % 2 === 0));

// ---------------------------------------------------------------- screening by p-value: 31 meaningless dummies
const M4 = SETS.B;
const dom = column('date', H).map((d) => Number(d.slice(8, 10)));
const SCREEN = Array.from({ length: 31 }, (_, k) => { const f = R.fit(yH, { ...M4, X: dom.map((v) => (v === k + 1 ? 1 : 0)) }); return { d: k + 1, p: f.coefs.at(-1).p }; });
const SIG = SCREEN.filter((s) => s.p < 0.05);
const LOY0 = R.fit(yH, { ...SETS.A, Loyalty: column('loyalty_members', H) }), LOY1 = R.fit(yH, { ...M4, Loyalty: column('loyalty_members', H) });

// ---------------------------------------------------------------- Brackenfold Removals (fictional)
const BR = { r2j: 0.84 };
const brVif = 1 / (1 - BR.r2j);

export default {
  slug: 'multicollinearity-and-model-choice',
  title: 'Multicollinearity and model choice',
  blurb: 'See what happens when two predictors carry nearly the same information, measure it with the variance inflation factor, and decide what to do about it. Then choose between models with adjusted R², the nested F test, AIC and BIC, and check a model on data it hasn’t seen.',
  status: 'draft',
  objectives: [
    'Explain how multicollinearity inflates standard errors and makes slopes unstable while leaving predictions and the overall fit almost unchanged.',
    'Calculate a variance inflation factor and the factor by which it widens a slope’s standard error.',
    'Compare nested models with the general F test, and compare any models fitted to the same rows with adjusted R², AIC and BIC.',
    'Distinguish choosing predictors to explain from choosing them to predict, and explain why selecting predictors by their p-values misleads.',
    'Evaluate a model on held-out data, and state what a time-based hold-out check can and can’t show.',
  ],
  prerequisites: [
    { lesson: 'b06/multiple-regression', why: 'Partial slopes, adjusted R² and the overall F test, which this lesson extends to comparing models.' },
    { lesson: 'b06/categorical-predictors-and-interactions', why: 'The café, weekend and weekday dummies and the interactions whose value the nested F test judges.' },
    { lesson: 'b05/correlation-matrices', why: 'The near-perfect correlation of footfall and transactions (0.98) seen in the matrix.' },
    { lesson: 'b02/scaling', why: 'Training and test sets, and keeping the test data out of every fitting step.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana wants to know what Harbourside’s sales depend on: the number of people who come in, or the number who buy. She regresses daily sales on footfall and transactions together over the café’s 306 days. The model fits very well, but the coefficients look odd: the slope on transactions is lower than when it is alone, its standard error is almost six times as large, and the slope on footfall is small. Refitted month by month, the slopes jump around and footfall’s even turns negative.' },

    { h: 'Two predictors that say the same thing' },
    { p: 'Footfall and transactions at Harbourside correlate at 0.985: almost every visitor’s day is mirrored in the till. The table compares three fits.' },
    { table: {
      caption: 'Harbourside’s daily sales ($) on footfall and transactions, 306 days',
      head: ['Predictors', 'Slope on footfall ($ per person)', 'Slope on transactions ($ per transaction)', 'R²', 's ($)'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['Transactions', '—', `${fx(ST.coefs[1].estimate)} (SE ${ST.coefs[1].se.toFixed(3)})`, ST.r2.toFixed(4), ST.sigma.toFixed(1)],
        ['Footfall', `${fx(SF.coefs[1].estimate)} (SE ${SF.coefs[1].se.toFixed(3)})`, '—', SF.r2.toFixed(4), SF.sigma.toFixed(1)],
        ['Both', `${fx(SB.coefs[1].estimate)} (SE ${SB.coefs[1].se.toFixed(3)})`, `${fx(SB.coefs[2].estimate)} (SE ${SB.coefs[2].se.toFixed(3)})`, SB.r2.toFixed(4), SB.sigma.toFixed(1)],
      ],
    } },
    { p: 'Adding footfall to transactions raises R² from 0.9844 to 0.9850 and lowers s by less than half a dollar: the fitted values hardly change. But the slope on transactions falls from $6.64 to $5.75 and its standard error grows from 0.048 to 0.275. Footfall’s slope, $3.18 per person alone, is $0.44 per person holding transactions fixed, with a 95% interval from $0.18 to $0.70.' },
    { p: String.raw`This is <g>multicollinearity</g>: predictors so closely related that the data contain little information about each one’s separate effect. Recall that a partial slope is estimated only from the part of its predictor that the others can’t predict. Footfall holding transactions fixed varies very little, so its slope rests on small differences and is poorly determined; the same goes for transactions holding footfall fixed. Many combinations of the two slopes fit almost equally well, and least squares picks one that small changes in the data can move.` },

    { h: 'Unstable from month to month' },
    { p: 'Refit the model with both predictors one month at a time and the instability shows.' },
    { table: {
      caption: 'Harbourside’s sales on footfall and transactions, fitted separately for each month of 2027',
      head: ['Month', 'r (footfall, transactions)', 'Slope on footfall (SE)', 'Slope on transactions (SE)', 'Transactions alone (SE)'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: MONTHS.map((x) => [MN[x.m], x.r.toFixed(3), `${fx(x.bf.estimate)} (${x.bf.se.toFixed(2)})`, `${fx(x.bt.estimate)} (${x.bt.se.toFixed(2)})`, `${fx(x.at.estimate)} (${x.at.se.toFixed(2)})`]),
      note: 'Each month has 30 or 31 days. May, July and August include festival days.',
    } },
    { p: 'Footfall’s slope runs from −$0.19 per person in April to $1.86 in May; the transactions slope from $3.38 to $6.25. With transactions alone the standard errors are between 0.10 and 0.18; with footfall alongside, between 0.39 and 1.18. Yet every monthly model is highly significant overall (each Significance F is below 0.001). The data can say with confidence that sales go with the two together; they can’t say how to share the credit.' },
    { callout: 'key', title: 'What multicollinearity does and doesn’t do', html: 'It inflates the standard errors of the slopes involved and makes them unstable, even changing sign between samples. It doesn’t bias them, and it doesn’t harm the fitted values or predictions for rows like the ones in the data. It is a problem for explaining (which predictor matters?) far more than for predicting.' },
  ],

  theory: [
    { h: 'The variance inflation factor' },
    { p: String.raw`Regress predictor <m>x_j</m> on all the other predictors and call that regression’s R² <m>R_j^2</m>. The <g>variance inflation factor</g> is <m>\text{VIF}_j = 1/(1 - R_j^2)</m>. It is the factor by which collinearity multiplies the variance of <m>b_j</m> compared with a predictor unrelated to the others, so the standard error is multiplied by <m>\sqrt{\text{VIF}_j}</m>. With two predictors <m>R_j^2 = r^2</m>: for Harbourside, <m>r^2 = 0.97064</m> and <m>1/(1 - 0.97064) = 34.1</m>, and <m>\sqrt{34.1} = 5.8</m>.` },
    { p: String.raw`The standard error of a slope is <m>\text{SE}(b_j) = \dfrac{s}{\sqrt{\sum (x_j - \bar x_j)^2}}\sqrt{\text{VIF}_j}</m>. Comparing transactions alone with transactions and footfall, the residual standard error s barely changes (28.1 to 27.6), so the standard error grows by about √VIF: 0.275 ÷ 0.048 is about 5.7, which is exactly <m>\sqrt{34.1} \times 27.6/28.1</m>. A VIF of 34 means that the 306 days give as much information about transactions’ separate slope as about 9 days would if the two predictors were unrelated.` },
    { p: 'Penn State’s STAT 462 notes treat VIFs above 4 as worth investigating and above 10 as signs of serious multicollinearity; these are conventions, and other sources use 5 and 10. A pairwise correlation can miss collinearity among three or more predictors (one can be close to a combination of two others), which the VIF catches. Collinearity is also built into models with interactions: a dummy and its product with a numeric predictor are highly correlated, which inflates the main effect’s standard error; centring the numeric predictor reduces it without changing the fit.' },

    { h: 'What to do about it' },
    { list: [
      '<b>Ask which question you are answering.</b> Footfall, transactions and sales are a chain: people come in, some buy, purchases make sales. For “what is a visitor worth?”, regress sales on footfall alone ($3.18 per person); for “what is a transaction worth?”, on transactions alone ($6.64). With both in, footfall’s slope asks something narrower: at a given number of transactions, does a busier café sell more? Its $0.44 per person is consistent with the generator’s planted rise in the average ticket on busy days (about $0.22 per visitor at Harbourside’s typical trade, once the generator’s ticket rise is put in the log’s scaled dollars), but the interval is wide.',
      '<b>Don’t drop a predictor only because its slope isn’t significant.</b> If it is a confounder, dropping it brings back omitted-variable bias. Collinearity makes slopes imprecise, not wrong; a wide interval is the honest answer.',
      '<b>Combine or get better data.</b> Two measures of the same thing can be combined into one (a ratio such as transactions per visitor, or an average). More rows, or rows where the predictors move apart, are the only real cure.',
      '<b>For prediction, it hardly matters.</b> The model with both predictors predicts Harbourside’s sales as well as either alone, as long as the two keep moving together as they did in the data.',
    ] },

    { h: 'Comparing nested models: the general F test' },
    { p: String.raw`Two models are nested when one (the reduced model) is the other (the full model) with some terms removed. The <g>nested F test</g> asks whether the removed terms together improve the fit by more than chance: <m>H_0</m>: all their coefficients are zero. With SSE from each fit, q terms removed and the full model’s residual degrees of freedom,` },
    { math: String.raw`F = \dfrac{(\text{SSE}_\text{reduced} - \text{SSE}_\text{full})/q}{\text{SSE}_\text{full}/(n - p_\text{full})}` },
    { p: String.raw`on q and <m>n - p_\text{full}</m> df (the general linear F test of Penn State’s notes). The overall F test is the special case in which the reduced model has no predictors; with one term removed, F is that term’s t squared. The test matters most for groups of terms, such as a set of dummies, which no single t test can judge. All the comparisons below use the same 612 café-days.` },
    { table: {
      caption: 'Footfall at both cafés: four nested models (612 café-days)',
      head: ['Model', 'Coefficients', 'R²', 'Adjusted R²', 'AIC', 'BIC'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['A: weather, café, weekend, café × weekend, festival', String(MA.p), MA.r2.toFixed(4), MA.adjR2.toFixed(4), MA.aic.toFixed(1), MA.bic.toFixed(1)],
        ['B: A + high × café', String(MB.p), MB.r2.toFixed(4), MB.adjR2.toFixed(4), MB.aic.toFixed(1), MB.bic.toFixed(1)],
        ['C: B + build-up', String(MC.p), MC.r2.toFixed(4), MC.adjR2.toFixed(4), MC.aic.toFixed(1), MC.bic.toFixed(1)],
        ['D: C with six weekday dummies and their café interactions instead of the weekend', String(MW.p), MW.r2.toFixed(4), MW.adjR2.toFixed(4), MW.aic.toFixed(1), MW.bic.toFixed(1)],
      ],
      note: 'AIC and BIC are from the Gaussian log-likelihood, as statsmodels and the B06 engine report them. Lower is better. Only differences between models fitted to the same rows mean anything.',
    } },
    { p: String.raw`B against A adds one term: <m>F = 27.8</m> on 1 and 604 df, which is the interaction’s t squared (<m>(-5.27)^2</m>); p below 0.001. C against B adds the build-up: <m>F = 330</m>, p below 0.001. D against C replaces the weekend dummy and its interaction with six weekday dummies and six interactions, ten extra coefficients: <m>F = 0.70</m> on 10 and 593 df, p = 0.73. The ten extra terms add nothing beyond what the weekend dummy already says, which the generator planted (weekdays alike, weekends alike). The rows share their days, as before, so all these p-values are somewhat too small.` },

    { h: 'AIC and BIC' },
    { p: String.raw`Information criteria compare models that need not be nested, as long as they are fitted to the same rows and the same y. For least squares, apart from a constant that is the same for every model on the same data,` },
    { math: String.raw`\text{AIC} = n\ln(\text{SSE}/n) + 2p, \qquad \text{BIC} = n\ln(\text{SSE}/n) + p\ln n` },
    { p: String.raw`The first term rewards fit and the second charges for each coefficient; the model with the lowest value is preferred. BIC’s charge, <m>\ln n</m> per coefficient (6.4 for 612 rows), is stronger than AIC’s 2 whenever n is 8 or more, so BIC favours smaller models (Taboga’s StatLect notes describe AIC as the mildest penalty and BIC as the strongest). In the table both pick model C. A difference of a few units is not decisive; a convention many analysts use treats differences under about 2 as negligible. Neither criterion says whether the best model is good, only which of the candidates is least bad by its rule.` },

    { h: 'Overfitting and the hold-out check' },
    { p: String.raw`A model with enough terms can follow the noise in its own data, fitting the rows it was estimated from very well and new rows badly. That is <g>overfitting</g>, and R² on the fitting data can’t detect it. The direct check is a hold-out: fit the model on one part of the data (the <g>training set</g>) and measure its errors on another part it never saw (the <g>test set</g>), for example by the root mean squared error, <m>\text{RMSE} = \sqrt{\tfrac{1}{m}\sum (y - \hat y)^2}</m> over the m test rows.` },
    { p: 'Ana fits three models of Harbourside’s footfall on March to September (214 days) and tests them on October to December (92 days). A is the multiple-regression lesson’s third model (high, rain, weekend, festival); B adds the build-up; C keeps the high, rain, festival and the build-up and throws in everything else that could be tried: weekday dummies, squares of the high and rain, their interactions, and a cubic trend in days since opening, 17 predictors.' },
    { table: {
      caption: 'Harbourside’s footfall: fitted on 1 March – 30 September, tested on 1 October – 31 December',
      head: ['Model', 'Coefficients', 'Training R²', 'Training s', 'AIC', 'BIC', 'Test RMSE'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: ['A', 'B', 'C'].map((k) => [k, String(TIME[k].f.p), TIME[k].f.r2.toFixed(4), TIME[k].f.sigma.toFixed(1), TIME[k].f.aic.toFixed(1), TIME[k].f.bic.toFixed(1), TIME[k].rmse.toFixed(1)]),
      note: 'Test RMSE in people. AIC and BIC from the training fit.',
    } },
    { p: 'Model C has the best training R² and the lowest AIC, yet its test RMSE is 78.6 people, nearly five times B’s 16.5. Its cubic trend in the day, fitted to the spring build-up and the summer, bends sharply down after September: on the test days it under-predicts by 66 people on average. Model A also under-predicts, by 24 people on average, for a different reason: without the build-up its temperature slope is too steep, so it puts the colder autumn days too low. B, which BIC prefers, has a test RMSE close to its training s (16.5 against 16.7), though the comparison flatters it a little (see the caution below).' },
    { callout: 'warn', title: 'What a hold-out check can and can’t show', html: 'One split is one test. Ana’s test months are colder than most of the training months, have no festivals and come after the build-up, so the check measures how well a model carries forward in time, which is what a forecast needs, but with 92 days from one season. The season works in two ways: quieter months have smaller day-to-day swings in people, so a test RMSE near the training s flatters the model a little; and some test days were colder than any training day (10 of 92 below the training minimum of 38°F). A random split behaves differently. An alternating split (fit on odd-numbered days counted from 1 March, test on the even ones), which behaves like a random split, gives test RMSEs of 19.8, 17.6 and 17.8 for A, B and C, because each test day has neighbours in the training data and the cubic trend never has to extrapolate. Neighbouring days are alike, so such a split flatters a model. Choose the split that matches how the model will be used, and keep the test data out of every choice, including the choice of which model to test.' },

    { h: 'Explaining or predicting' },
    { p: 'The two aims choose predictors differently. Peak barista hours are rostered in advance from the manager’s expectation of the day’s trade, so they are known before the day and help forecast footfall: adding them to model C raises adjusted R² from 0.9401 to 0.9420. But the roster carries the calendar and the weather with it, so the weekend’s coefficient falls from 68.8 to 58.1 and the festival’s from 330.7 to 290.6. Nobody would say the roster brings people in. For a forecast, the roster is a useful summary of what the manager knows; for explaining what the weekend or a festival is worth, holding the roster fixed takes away part of the answer.' },
    { p: 'For explanation, choose predictors from how the business works, before looking at p-values: confounders in, mediators and colliders out (B05’s rules), with a stated reason for each. For prediction, any predictor available at the time of the forecast is fair, but the model must be judged on data it hasn’t seen, and a coefficient in it shouldn’t be read as an effect.' },

    { h: 'Why choosing predictors by p-value misleads' },
    { p: String.raw`<g>Stepwise selection</g> adds or removes predictors one at a time by their p-values (or AIC) until no change passes the rule. It is automatic and popular, and its results mislead. Ana tries 31 meaningless candidates: a dummy for each day of the month, added one at a time to Harbourside’s model B. Two pass the 5% test (the 27th and the 29th of the month), about the 1.6 that chance alone predicts (31 × 0.05). A stepwise procedure would keep them and report their p-values as if they had been the only ones tried.` },
    { p: String.raw`Selection also picks proxies. Harbourside’s loyalty-app membership, a running total that grows through the year, is “highly significant” added to model A (t = 10.4), because it tracks the build-up. With the build-up in the model, its p-value is 0.55. Frank Harrell’s often-quoted list of stepwise’s problems (reproduced in a Stata FAQ) includes R² values biased high, p-values without their proper meaning, confidence intervals that are too narrow, slopes biased away from zero and severe problems with collinear predictors. The cure is the one above: decide the candidate predictors from the question, test a few planned comparisons, and check any model chosen from the data on data that played no part in choosing it.` },
  ],

  formulas: [
    { id: 'coll-vif', name: 'Variance inflation factor',
      tex: String.raw`\text{VIF}_j = \dfrac{1}{1 - R_j^2}`,
      where: [[String.raw`\text{VIF}_j`, 'Factor by which collinearity multiplies the variance of the slope on x_j', ''], [String.raw`R_j^2`, 'R² of the regression of x_j on all the other predictors', '']],
      note: 'The standard error is multiplied by √VIF. With two predictors R_j² = r². VIF above 4 (investigate) or 10 (serious) are conventions, not tests.' },
    { id: 'coll-se', name: 'Standard error of a slope in a multiple regression',
      tex: String.raw`\text{SE}(b_j) = \dfrac{s}{\sqrt{\sum (x_j - \bar x_j)^2}}\,\sqrt{\text{VIF}_j}`,
      where: [[String.raw`\text{SE}(b_j)`, 'Standard error of the slope on x_j', 'units of y per unit of x_j'], [String.raw`s`, 'Residual standard error of the model', 'units of y'], [String.raw`\sum (x_j - \bar x_j)^2`, 'Sum of squared deviations of x_j', 'units of x_j squared'], [String.raw`\text{VIF}_j`, 'Variance inflation factor of x_j', '']],
      note: 'With one predictor VIF = 1 and this is the simple-regression standard error.' },
    { id: 'coll-nested-f', name: 'Nested (general linear) F test',
      tex: String.raw`F = \dfrac{(\text{SSE}_R - \text{SSE}_F)/q}{\text{SSE}_F/(n - p_F)}, \qquad \text{df} = (q,\; n - p_F)`,
      where: [[String.raw`F`, 'Test statistic for H₀: every removed coefficient is 0', ''], [String.raw`\text{SSE}_R, \text{SSE}_F`, 'Residual sums of squares of the reduced and full models', 'units of y squared'], [String.raw`q`, 'Number of coefficients removed from the full model to get the reduced one', ''], [String.raw`n`, 'Number of rows (the same for both fits)', ''], [String.raw`p_F`, 'Number of coefficients in the full model, counting the intercept', '']],
      assumptions: 'The reduced model is the full model with some terms removed; both fitted to the same rows; the full model’s conditions hold.',
      note: 'Excel: F.DIST.RT(F, q, n − p_F). With q = 1, F is the removed term’s t².' },
    { id: 'coll-aic-bic', name: 'AIC and BIC for least squares',
      tex: String.raw`\text{AIC} = n\ln\!\left(\tfrac{\text{SSE}}{n}\right) + 2p, \qquad \text{BIC} = n\ln\!\left(\tfrac{\text{SSE}}{n}\right) + p\ln n`,
      where: [[String.raw`n`, 'Number of rows', ''], [String.raw`\text{SSE}`, 'Residual sum of squares', 'units of y squared'], [String.raw`p`, 'Number of coefficients, counting the intercept', '']],
      assumptions: 'Models fitted to the same rows and the same y; up to a constant n(ln 2π + 1), which software adds (statsmodels and the B06 engine do) and which cancels in differences.',
      note: 'Lower is better. Differences of about 2 or less are usually treated as negligible (a convention).' },
    { id: 'coll-rmse', name: 'Root mean squared error on a test set',
      tex: String.raw`\text{RMSE} = \sqrt{\tfrac{1}{m}\textstyle\sum_{\text{test}} (y - \hat y)^2}`,
      where: [[String.raw`m`, 'Number of test rows', ''], [String.raw`y, \hat y`, 'Actual value and the prediction of a model fitted without the test rows', 'units of y']],
      note: 'Excel: SQRT(AVERAGE((actual − predicted)^2)) over the test rows.' },
  ],

  examples: [
    { level: 'simple', title: 'Vans, crew and hours', fictional: true,
      setup: 'Brackenfold Removals (fictional) regresses the hours each house move takes on the number of crew and the cubic metres moved. Regressed on crew and the other predictors, cubic metres have R² = 0.84, because bigger moves get bigger crews. What is the VIF for cubic metres, and by what factor does collinearity widen its slope’s standard error? If the slope on cubic metres has a standard error of 0.05 hours per cubic metre, what would it be if cubic metres were unrelated to the other predictors (with the same s)?',
      steps: [
        String.raw`VIF: <m>1/(1 - 0.84) = 1/0.16 = 6.25</m>.`,
        String.raw`Standard-error factor: <m>\sqrt{6.25} = 2.5</m>.`,
        String.raw`Without collinearity, holding s and the spread of cubic metres fixed: <m>0.05 / 2.5 = 0.02</m> hours per cubic metre.`,
      ],
      answer: 'VIF = 6.25; the standard error is 2.5 times what it would be without collinearity (0.05 instead of 0.02 hours per cubic metre).',
      interpretation: 'Above Penn State’s threshold of 4 for a closer look, but not alarming. The firm can still estimate the volume effect; its interval is 2.5 times as wide as it would be if crew size didn’t follow the job.' },

    { level: 'challenging', title: 'Do the weekdays need their own dummies?', fictional: true,
      setup: String.raw`Model C of footfall at both cafés has 9 coefficients and SSE = ${Math.round(MC.sse).toLocaleString('en-US')}; model D replaces the weekend dummy and its café interaction with six weekday dummies and six interactions, 19 coefficients and SSE = ${Math.round(MW.sse).toLocaleString('en-US')}, over the same 612 café-days. Test whether D’s extra terms are needed, and compare the models by BIC.`,
      steps: [
        String.raw`Check the nesting: the weekend dummy is the Saturday dummy plus the Sunday dummy, and its interaction is the sum of their interactions, so every model C can fit, D can too. D has <m>q = 19 - 9 = 10</m> more coefficients.`,
        String.raw`F: <m>\dfrac{(${tn(MC.sse)} - ${tn(MW.sse)})/10}{${tn(MW.sse)}/593} = \dfrac{${(Math.round(MC.sse - MW.sse) / 10).toFixed(1)}}{${(MW.sse / 593).toFixed(1)}} = 0.70</m> on 10 and 593 df.`,
        String.raw`p-value: <x>=F.DIST.RT(0.70,10,593)</x> ≈ 0.73. There is no evidence that the weekdays, or the weekend days, differ among themselves once the weekend dummy is in.`,
        String.raw`BIC: <m>${MC.bic.toFixed(1)}</m> for C against <m>${MW.bic.toFixed(1)}</m> for D. The ten extra coefficients cost <m>10 \ln 612 = 64.2</m> in penalty and reduce the fit term by only ${(MC.bic - MW.bic + 10 * Math.log(612)).toFixed(1)}.`,
      ],
      answer: 'F = 0.70 on 10 and 593 df, p = 0.73: keep the weekend dummy and drop the weekday dummies. BIC agrees (C is lower by 57).',
      interpretation: 'The test judges the ten terms together, which ten separate t tests can’t do: with ten tests at 5%, one would often pass by chance. The generator planted a weekend effect and no weekday differences, and the test agrees.' },

    { level: 'applied', title: 'Which model should forecast Harbourside’s autumn?', fictional: true,
      setup: 'Ana wants a model to forecast Harbourside’s daily footfall for the roster. She fits models A, B and C on March to September and tests them on October to December (the table in In depth). Which should she use, and what should she tell the manager about its accuracy?',
      steps: [
        'Rank by the training data: C has the highest R² (0.963) and the lowest AIC; BIC prefers B. The criteria disagree, so the training data alone don’t settle it.',
        'Rank by the test data: B’s RMSE is 16.5 people, A’s 29.8 and C’s 78.6. C’s cubic trend in the day extrapolates badly; A is biased because it lacks the build-up.',
        'Check B for bias: its average test error is −1.7 people, small beside its RMSE. Its test RMSE is close to its training s (16.7), so there is no sign of overfitting, though quieter autumn days make that comparison a little kind.',
        'State the limits: one autumn, 92 days, no festivals, the build-up over; the next spring, with festivals and a new season, could behave differently.',
      ],
      answer: 'Use model B (high, rain, weekend, festival, build-up), refitted on all ten months. Expect typical errors of about 17 people a day in quiet months, and somewhat more in busy ones.',
      interpretation: 'The test was used to choose among three models, so its RMSE is now slightly optimistic for the chosen one. Ana should keep checking the forecasts against each month’s actual footfall and refit as the year’s data come in.' },
  ],

  demo: [
    { widget: 'coll-sales', intro: 'Harbourside’s 306 days. With transactions alone, note its slope and standard error. Tick Footfall: the R² barely moves, but the transactions slope falls and its standard error grows almost sixfold.' },
    { widget: 'coll-may', intro: 'The same model on May alone (31 days, two of them festival days), when footfall and transactions correlate at 0.996. Compare the standard errors with the year’s, and the slopes with the monthly table.' },
    { widget: 'coll-vif', intro: 'Set the correlation between two predictors and see the VIF, the factor by which the standard error grows, and the number of unrelated rows the data are worth. Try 0.985, Harbourside’s.' },
  ],

  mistakes: [
    { title: '“The slope on footfall isn’t significant, so footfall doesn’t matter.”', html: 'With transactions in the model, footfall’s slope asks whether a busier café sells more at the same number of transactions: a narrow question that collinearity makes hard to answer. Alone, footfall has a slope of $3.18 per person with a tiny standard error. Non-significance under collinearity means “can’t separate”, not “no link”.' },
    { title: '“High VIFs mean the model is useless.”', html: 'They mean the slopes involved are imprecise. The fitted values and predictions are fine for rows like the data’s, and the other slopes are unaffected. Whether that matters depends on whether you need the separate slopes.' },
    { title: '“The model with the highest R² is the best.”', html: 'R² never falls when terms are added. Harbourside’s 17-predictor model had the best training R² and lowest AIC and forecast the autumn worst. Judge models by adjusted R², a nested F test, AIC or BIC, and above all by data they haven’t seen.' },
    { title: '“Stepwise selection found the significant predictors for me.”', html: 'Tried enough times, meaningless predictors pass by chance (2 of 31 day-of-month dummies did), and proxies for something left out pass easily (loyalty members, standing in for the build-up). The p-values after selection don’t mean what they say. Choose candidates from the question and check the result on new data.' },
    { title: '“I chose the model on the test set, so its test RMSE is an honest measure of accuracy.”', html: 'Once the test set has picked the winner it is part of the fitting process, and its RMSE is optimistic for that model. Keep a final check set untouched, or say that the reported error was used for the choice.' },
    { title: '“A random split is the most rigorous hold-out.”', html: 'For data in time, a random split puts each test day next to training days that are almost the same, so it measures interpolation. A forecast extrapolates: test on later data than you fit on.' },
  ],

  application: [
    { p: 'Every analyst who builds a regression with more than a couple of predictors meets both problems in this lesson. Marketing-mix models put television, search and social spend in one regression, and the channels are often bought in the same weeks: their separate returns come with wide intervals and change sign from one year’s model to the next. Credit-scoring and demand-forecasting teams choose among hundreds of candidate predictors, and the ones that survive are judged on a later time period, never on the data that chose them. In both settings the professional habit is the same: say what the model is for, choose candidates for a reason, report uncertainty honestly, and test on data the model hasn’t seen.' },
    { case: 'Ana’s note to the operations manager: “For forecasting Harbourside’s daily footfall I recommend the five-predictor model (temperature, rain, weekend, festival days and the café’s build-up). Fitted on March to September, it predicted October to December with a typical error of about 17 people a day (busier months may see larger misses); a model with every term I could think of fitted the summer better and missed the autumn by nearly 80. For explaining sales, footfall and transactions move almost together (VIF 34), so a model with both can’t say which matters: a visitor is worth about $3.18 in sales and a transaction about $6.64, each on its own, and the model shouldn’t be asked to split them. Peak barista hours improve the footfall forecast a little, but they reflect the manager’s own expectations, so I have left them out of any model meant to say what the weather or the weekend is worth.”' },
    { p: 'The note separates the two aims and gives each its own model. It reports the forecasting model’s accuracy on held-out months in the units the manager plans with, and names the alternative that looked better on paper and failed. It explains collinearity in one sentence without the jargon, and gives the two simple slopes as answers to two simple questions. And it states which predictor was left out of the explanatory model and why: the judgement that no automatic procedure makes.' },
    { p: 'Module 4 checks whether the chosen models’ assumptions hold: residual plots and the Durbin–Watson statistic for the days’ dependence in assumptions-and-diagnostics, logs and curves in transformations-and-influence. A model chosen by any of this lesson’s methods still needs those checks before its standard errors or intervals are trusted.' },
  ],

  summary: [
    'Multicollinearity is predictors so closely related that the data carry little information about each one’s separate slope: Harbourside’s footfall and transactions correlate at 0.985.',
    'It inflates standard errors and makes slopes unstable (footfall’s monthly slope ran from −$0.19 to $1.86 per person) without biasing them or harming predictions.',
    'VIF_j = 1/(1 − R_j²) multiplies the slope’s variance; its square root multiplies the standard error. Harbourside’s VIF of 34 widens the transactions slope’s SE about 5.8 times.',
    'The nested F test, F = ((SSE_R − SSE_F)/q) ÷ (SSE_F/(n − p_F)), judges a group of terms at once: six weekday dummies and their interactions add nothing to the weekend dummy (F = 0.70, p = 0.73).',
    'AIC = n ln(SSE/n) + 2p and BIC = n ln(SSE/n) + p ln n compare models on the same rows; BIC charges more per coefficient. Lower is better; small differences are negligible.',
    'Overfitting shows only on new data: a 17-predictor model with the best training fit forecast Harbourside’s autumn with an RMSE of 78.6 people against 16.5 for a five-predictor model. Test forward in time for a forecast.',
    'Choose predictors from the question: for explanation, confounders in and mediators out; for prediction, anything known in advance, judged on held-out data. Selecting by p-value finds chance and proxies.',
  ],

  glossary: [
    { term: 'Multicollinearity', def: 'Strong linear relationships among the predictors of a regression, which inflate the standard errors of their slopes and make the slopes unstable; perfect multicollinearity makes them impossible to estimate.' },
    { term: 'Variance inflation factor', def: 'For a predictor x_j, 1/(1 − R_j²), where R_j² is from regressing x_j on the other predictors: the factor by which collinearity multiplies the variance of its slope. Abbreviated VIF.' },
    { term: 'Nested F test', def: 'The F test of whether the terms dropped from a full regression model to give a reduced one improve the fit: F = ((SSE_R − SSE_F)/q) ÷ (SSE_F/(n − p_F)). Also called the general linear F test or partial F test.' },
    { term: 'AIC', def: 'Akaike information criterion: a measure for comparing models fitted to the same data, −2 × log-likelihood + 2p; for least squares n ln(SSE/n) + 2p plus a constant. Lower is better.' },
    { term: 'BIC', def: 'Bayesian (Schwarz) information criterion: −2 × log-likelihood + p ln n, which charges more per coefficient than AIC once n is 8 or more and so favours smaller models. Lower is better.' },
    { term: 'Overfitting', def: 'Fitting a model so closely to its own data, noise included, that it predicts new data worse than a simpler model would.' },
    { term: 'Stepwise selection', def: 'Choosing a regression’s predictors automatically by adding or removing them one at a time according to p-values or an information criterion. Its p-values, intervals and R² are biased in the model’s favour.' },
  ],

  references: [
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, section 10.7, “Detecting Multicollinearity Using Variance Inflation Factors”.', url: 'https://online.stat.psu.edu/stat462/node/180', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, “The general linear F-test”.', url: 'https://online.stat.psu.edu/stat462/node/135', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. <i>Introductory Business Statistics 2e</i>, section 13.4, “The Regression Equation” (multicollinearity). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-4-the-regression-equation', checked: '2026-11-01' },
    { text: 'Taboga, M. “Linear regression — Model selection criteria”. <i>Lectures on probability theory and mathematical statistics</i>, StatLect.', url: 'https://statlect.com/fundamentals-of-statistics/linear-regression-model-selection-criteria', checked: '2026-11-01' },
    { text: 'Sribney, W. “Problems with stepwise regression” (quoting F. Harrell and R. Conroy). Stata FAQ, StataCorp.', url: 'https://www.stata.com/support/faqs/statistics/stepwise-regression-problems/', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, Lesson 11, “Model Building”.', url: 'https://online.stat.psu.edu/stat462/node/89', checked: '2026-11-01' },
  ],

  checks: [
    // the three sales fits
    { what: 'Harbourside days', value: sl.length, shown: 306 },
    { what: 'r footfall–transactions', value: rFT, shown: 0.985, tol: 0.0005 },
    { what: 'Transactions alone R²', value: ST.r2, shown: 0.9844, tol: 0.00005 },
    { what: 'Both R²', value: SB.r2, shown: 0.9850, tol: 0.00005 },
    { what: 's falls by less than half a dollar', value: Number(ST.sigma - SB.sigma < 0.5 && ST.sigma > SB.sigma), shown: 1 },
    { what: 'Transactions alone slope', value: ST.coefs[1].estimate, shown: 6.64 },
    { what: 'Both: transactions slope', value: SB.coefs[2].estimate, shown: 5.75 },
    { what: 'Transactions alone SE', value: ST.coefs[1].se, shown: 0.048, tol: 0.0005 },
    { what: 'Both: transactions SE', value: SB.coefs[2].se, shown: 0.275, tol: 0.0005 },
    { what: 'SE almost six times', value: seRatio, shown: 5.7, tol: 0.05 },
    { what: 'Footfall alone slope', value: SF.coefs[1].estimate, shown: 3.18 },
    { what: 'Both: footfall slope', value: SB.coefs[1].estimate, shown: 0.44 },
    { what: 'Footfall CI low', value: SB.coefs[1].low, shown: 0.18 },
    { what: 'Footfall CI high', value: SB.coefs[1].high, shown: 0.70 },
    { what: 'Planted ticket rise per visitor, scaled', value: plantedFoot, shown: 0.22 },
    { what: 'Scaled planted rise inside the CI', value: Number(plantedFoot > SB.coefs[1].low && plantedFoot < SB.coefs[1].high), shown: 1 },
    { what: 'Sales scale factor', value: salesScale, shown: 0.829, tol: 0.002 },
    { what: 'Test days below the training minimum', value: hiH.filter((v, i) => moH[i] >= 10 && v < Math.min(...hiH.filter((_, j) => moH[j] <= 9))).length, shown: 10 },
    { what: 'Training minimum high', value: Math.min(...hiH.filter((_, j) => moH[j] <= 9)), shown: 38 },
    { what: 'Quieter months, smaller swings: SD of footfall Oct–Dec below Jun–Aug', value: Number(Math.sqrt(mean(yH.filter((_, i) => moH[i] >= 10).map((v, _, a) => (v - mean(a)) ** 2))) < Math.sqrt(mean(yH.filter((_, i) => moH[i] >= 6 && moH[i] <= 8).map((v, _, a) => (v - mean(a)) ** 2)))), shown: 1 },
    // monthly
    { what: 'Footfall monthly min (April)', value: byM(4).bf.estimate, shown: -0.19 },
    { what: 'Footfall monthly max (May)', value: byM(5).bf.estimate, shown: 1.86 },
    { what: 'April is the min, May the max', value: Number(range('bf', 'estimate')[0] === byM(4).bf.estimate && range('bf', 'estimate')[1] === byM(5).bf.estimate), shown: 1 },
    { what: 'Transactions monthly min', value: range('bt', 'estimate')[0], shown: 3.38 },
    { what: 'Transactions monthly max', value: range('bt', 'estimate')[1], shown: 6.25 },
    { what: 'Alone SE min', value: range('at', 'se')[0], shown: 0.10 },
    { what: 'Alone SE max', value: range('at', 'se')[1], shown: 0.18 },
    { what: 'Both SE min', value: range('bt', 'se')[0], shown: 0.39 },
    { what: 'Both SE max', value: range('bt', 'se')[1], shown: 1.18 },
    { what: 'Every month significant overall', value: Number(MONTHS.every((x) => x.pF < 0.001)), shown: 1 },
    { what: 'Months have 30 or 31 days', value: Number(MONTHS.every((x) => x.n === 30 || x.n === 31)), shown: 1 },
    { what: 'May correlation (demo intro)', value: byM(5).r, shown: 0.996, tol: 0.0005 },
    { what: 'Festival days in May, July and August only', value: Number(column('festival01', H).every((f, i) => !f || [5, 7, 8].includes(moH[i])) && [5, 7, 8].every((m) => column('festival01', H).some((f, i) => f && moH[i] === m))), shown: 1 },
    { what: 'May has two festival days', value: column('festival01', H).filter((f, i) => f && moH[i] === 5).length, shown: 2 },
    // VIF
    { what: 'VIF', value: VIF, shown: 34.1, tol: 0.05 },
    { what: 'VIF about 34', value: VIF, shown: 34, tol: 0.5 },
    { what: 'VIF from rounded r²', value: 1 / (1 - 0.97064), shown: 34.1, tol: 0.05 },
    { what: 'r² to 5 dp', value: rFT ** 2, shown: 0.97064, tol: 0.000005 },
    { what: '√VIF', value: Math.sqrt(VIF), shown: 5.8, tol: 0.05 },
    { what: 'SE ratio identity', value: seRatioFormula, shown: seRatio, tol: 1e-9 },
    { what: 's alone', value: ST.sigma, shown: 28.1, tol: 0.05 },
    { what: 's both', value: SB.sigma, shown: 27.6, tol: 0.05 },
    { what: 'Equivalent unrelated days', value: 306 / VIF, shown: 9, tol: 0.5 },
    { what: 'Interaction collinearity: Millbrook dummy VIF with High × Millbrook above 10', value: Number(R.vif([hi, mb, I(hi, mb)])[1] > 10), shown: 1 },
    { what: 'Centring the high lowers that VIF below 4', value: Number(R.vif([hi.map((v) => v - 60), mb, I(hi.map((v) => v - 60), mb)])[1] < 4), shown: 1 },
    // nested models
    { what: 'Café-days', value: y.length, shown: 612 },
    { what: 'B vs A F', value: FBA.F, shown: 27.8, tol: 0.05 },
    { what: 'B vs A df2', value: FBA.df2, shown: 604 },
    { what: 'B vs A F = t²', value: FBA.F, shown: MB.coefs.find((k) => k.name === 'High × Millbrook').t ** 2, tol: 1e-6 },
    { what: 'Rounded t²', value: 5.27 ** 2, shown: 27.8, tol: 0.05 },
    { what: 'B vs A p', value: Number(FBA.p < 0.001), shown: 1 },
    { what: 'C vs B F', value: FCB.F, shown: 330, tol: 0.5 },
    { what: 'C vs B p', value: Number(FCB.p < 0.001), shown: 1 },
    { what: 'D vs C F', value: FWC.F, shown: 0.70 },
    { what: 'D vs C df1', value: FWC.df1, shown: 10 },
    { what: 'D vs C df2', value: FWC.df2, shown: 593 },
    { what: 'D vs C p', value: FWC.p, shown: 0.73 },
    { what: 'C has 9 coefficients, D 19', value: MC.p * 100 + MW.p, shown: 919 },
    { what: 'Both criteria pick C', value: Number([MA, MB, MW].every((f) => f.aic > MC.aic && f.bic > MC.bic)), shown: 1 },
    { what: 'AIC by hand differs from the engine by a constant', value: (aicHand(MA) - aicHand(MC)) - (MA.aic - MC.aic), shown: 0, tol: 1e-6 },
    { what: 'BIC charge per coefficient', value: Math.log(612), shown: 6.4, tol: 0.05 },
    { what: 'BIC charge exceeds AIC’s from n = 8', value: Number(Math.log(8) > 2 && Math.log(7) < 2), shown: 1 },
    { what: 'Ten coefficients’ BIC penalty', value: 10 * Math.log(612), shown: 64.2, tol: 0.05 },
    { what: 'BIC: C lower than D by 57', value: MW.bic - MC.bic, shown: 57, tol: 0.5 },
    { what: 'D vs C F from rounded SSEs', value: ((Math.round(MC.sse) - Math.round(MW.sse)) / 10) / (Math.round(MW.sse) / 593), shown: 0.70 },
    // hold-out
    { what: 'Training days', value: allIdx.filter((i) => moH[i] <= 9).length, shown: 214 },
    { what: 'Test days', value: allIdx.filter((i) => moH[i] >= 10).length, shown: 92 },
    { what: 'Model C has 17 predictors', value: TIME.C.f.p - 1, shown: 17 },
    { what: 'C training R²', value: TIME.C.f.r2, shown: 0.963, tol: 0.0005 },
    { what: 'C best training R² and AIC', value: Number(TIME.C.f.r2 > TIME.B.f.r2 && TIME.C.f.aic < TIME.B.f.aic && TIME.C.f.aic < TIME.A.f.aic), shown: 1 },
    { what: 'BIC prefers B', value: Number(TIME.B.f.bic < TIME.A.f.bic && TIME.B.f.bic < TIME.C.f.bic), shown: 1 },
    { what: 'C test RMSE', value: TIME.C.rmse, shown: 78.6, tol: 0.05 },
    { what: 'B test RMSE', value: TIME.B.rmse, shown: 16.5, tol: 0.05 },
    { what: 'A test RMSE', value: TIME.A.rmse, shown: 29.8, tol: 0.05 },
    { what: 'Nearly five times', value: TIME.C.rmse / TIME.B.rmse, shown: 4.8, tol: 0.05 },
    { what: 'C under-predicts by 66', value: TIME.C.bias, shown: 66, tol: 0.5 },
    { what: 'C’s cubic trend falls after September (fitted trend part lower on 31 Dec than 30 Sep)', value: Number(['Day', 'Day²', 'Day³'].reduce((s, n, k) => s + TIME.C.f.coefs.find((c) => c.name === n).estimate * (306 ** (k + 1) - 214 ** (k + 1)), 0) < 0), shown: 1 },
    { what: 'A under-predicts by 24', value: TIME.A.bias, shown: 24, tol: 0.5 },
    { what: 'B training s', value: TIME.B.f.sigma, shown: 16.7, tol: 0.05 },
    { what: 'B bias', value: TIME.B.bias, shown: -1.7, tol: 0.05 },
    { what: 'Odd/even A', value: ODD.A.rmse, shown: 19.8, tol: 0.05 },
    { what: 'Odd/even B', value: ODD.B.rmse, shown: 17.6, tol: 0.05 },
    { what: 'Odd/even C', value: ODD.C.rmse, shown: 17.8, tol: 0.05 },
    { what: 'Test months colder on average', value: Number(mean(hiH.filter((_, i) => moH[i] >= 10)) < mean(hiH.filter((_, i) => moH[i] <= 9))), shown: 1 },
    { what: 'No festivals in the test months', value: festH.filter((f, i) => f && moH[i] >= 10).length, shown: 0 },
    { what: 'Typical error about 17', value: TIME.B.rmse, shown: 17, tol: 0.5 },
    { what: 'Nearly 80', value: TIME.C.rmse, shown: 80, tol: 2 },
    // explaining or predicting
    { what: 'C adj R²', value: MC.adjR2, shown: 0.9401, tol: 0.00005 },
    { what: 'C + roster adj R²', value: MS.adjR2, shown: 0.9420, tol: 0.00005 },
    { what: 'C weekend', value: est(MC, 'Weekend'), shown: 68.8, tol: 0.05 },
    { what: 'C + roster weekend', value: est(MS, 'Weekend'), shown: 58.1, tol: 0.05 },
    { what: 'C festival', value: est(MC, 'Festival'), shown: 330.7, tol: 0.05 },
    { what: 'C + roster festival', value: est(MS, 'Festival'), shown: 290.6, tol: 0.05 },
    // screening
    { what: 'Candidates', value: SCREEN.length, shown: 31 },
    { what: 'Two pass at 5%', value: SIG.length, shown: 2 },
    { what: 'They are the 27th and 29th', value: SIG[0].d * 100 + SIG[1].d, shown: 2729 },
    { what: 'Chance expects 1.6', value: 31 * 0.05, shown: 1.6, tol: 0.05 },
    { what: 'Loyalty t without build-up', value: LOY0.coefs.at(-1).t, shown: 10.4, tol: 0.05 },
    { what: 'Loyalty p with build-up', value: LOY1.coefs.at(-1).p, shown: 0.55 },
    // Brackenfold
    { what: 'Brackenfold VIF', value: brVif, shown: 6.25 },
    { what: 'Brackenfold SE factor', value: Math.sqrt(brVif), shown: 2.5 },
    { what: 'Brackenfold SE without collinearity', value: 0.05 / Math.sqrt(brVif), shown: 0.02 },
    // application
    { what: 'Application slopes', value: SF.coefs[1].estimate + ST.coefs[1].estimate, shown: 3.18 + 6.64, tol: 0.01 },
  ],
};
