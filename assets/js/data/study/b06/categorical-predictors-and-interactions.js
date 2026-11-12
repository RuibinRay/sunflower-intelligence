// categorical-predictors-and-interactions.js — B06 · Categorical predictors and interactions. Content only; exercises
// are in categorical-predictors-and-interactions.ex.js. Uses the cafés' daily log (case.js: column, DERIVED.footfallModel)
// for café and weekend dummies, the café × weekend and café × temperature interactions, Millbrook's weekday dummies, and
// B05's Simpson's paradox (footfall and the average ticket) with a café dummy. Ashmere Hotel is fictional. Comparing
// groups of dummies with a nested F test is multicollinearity-and-model-choice's. Every figure printed is recomputed in
// `checks`.
import { column, DERIVED as D } from './case.js?v=31';
import { DERIVED as B05 } from '../b05/case.js?v=31';
import * as R from '../../../core/regression.js?v=31';
import { mean } from '../../../core/stats.js?v=31';

// ---------------------------------------------------------------- both cafés, 612 café-days
const y = column('footfall'), mb = column('millbrook'), wk = column('weekend'), hi = column('high_f'), rain = column('rain_in');
const fest = column('festival01'), day = column('day');
const build = column('build_up');
const I = R.interaction;
const P0 = R.fit(y, { Millbrook: mb });
const CELL = R.fit(y, { Millbrook: mb, Weekend: wk, 'Millbrook × Weekend': I(mb, wk) });
const cellMean = (m, w) => mean(y.filter((_, i) => mb[i] === m && wk[i] === w));
const REFM = R.fit(y, { Harbourside: mb.map((v) => 1 - v), Weekend: wk, 'Harbourside × Weekend': I(mb.map((v) => 1 - v), wk) });
const FM = D.footfallModel;                                   // weather, café, weekend, café × weekend, festival
const NOINT = R.fit(y, { High: hi, Rain: rain, Millbrook: mb, Weekend: wk, Festival: fest });
const HM = R.fit(y, { High: hi, Rain: rain, Millbrook: mb, Weekend: wk, 'Millbrook × Weekend': I(mb, wk), Festival: fest, 'High × Millbrook': I(hi, mb) });
const hc = hi.map((v) => v - 60);
const HMC = R.fit(y, { 'High − 60': hc, Rain: rain, Millbrook: mb, Weekend: wk, 'Millbrook × Weekend': I(mb, wk), Festival: fest, 'High × Millbrook': I(hc, mb) });
const HMB = R.fit(y, { High: hi, Rain: rain, Millbrook: mb, Weekend: wk, 'Millbrook × Weekend': I(mb, wk), Festival: fest, 'High × Millbrook': I(hi, mb), 'Build-up': build, 'Build-up × Millbrook': I(build, mb) });
const cf = (f, name) => f.coefs.find((k) => k.name === name);
const est = (f, name) => cf(f, name).estimate;
// the planted per-°F effect, averaged over each café's days (see the generator's header)
const plantedSlope = (cafe, b0, b1, a, wet) => {
  const o = { cafe }, w = column('weekend', o), r = column('rain_in', o), f = column('festival01', o), d = column('day', o);
  return mean(w.map((v, i) => (v ? b1 : b0) * a * Math.min(1, 0.72 + 0.28 * (d[i] - 1) / 120) * (1 - wet * Math.min(r[i], 1)) * (f[i] ? 2.3 : 1) * Math.exp(0.09 ** 2 / 2)));
};
const PLH = plantedSlope('Harbourside', 122, 196, 0.011, 0.62), PLM = plantedSlope('Millbrook', 292, 118, 0.002, 0.30);
// the estimand: the build-up model's least-squares slopes fitted to the generator's planted mean footfall of each café-day
const PMEAN = y.map((_, i) => { const m = mb[i], base = m ? (wk[i] ? 118 : 292) : (wk[i] ? 196 : 122), a = m ? 0.002 : 0.011, wet = m ? 0.30 : 0.62;
  return base * (1 + a * (hi[i] - 60)) * Math.min(1, 0.72 + 0.28 * (day[i] - 1) / 120) * (1 - wet * Math.min(rain[i], 1)) * (fest[i] && !m ? 2.3 : 1) * Math.exp(0.09 ** 2 / 2); });
const PFIT = R.fit(PMEAN, { High: hi, Rain: rain, Millbrook: mb, Weekend: wk, 'Millbrook × Weekend': I(mb, wk), Festival: fest, 'High × Millbrook': I(hi, mb), 'Build-up': build, 'Build-up × Millbrook': I(build, mb) });
const EH = est(PFIT, 'High'), EM = est(PFIT, 'High') + est(PFIT, 'High × Millbrook');
// sales were scaled to F03's $236,000 total: the generator's ticket slopes in today's dollars
const scaleH = mean(column('avg_ticket', { cafe: 'Harbourside' })) / 6.45, scaleM = mean(column('avg_ticket', { cafe: 'Millbrook' })) / 3.95;

// ---------------------------------------------------------------- Millbrook's seven weekdays
const M = { cafe: 'Millbrook' };
const LV = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DD = R.dummies(column('weekday', M), { reference: 'Mon', name: 'Day', levels: LV });
const MD = R.fit(column('footfall', M), { ...DD, High: column('high_f', M), Rain: column('rain_in', M) });
const MW = R.fit(column('footfall', M), { Weekend: column('weekend', M), High: column('high_f', M), Rain: column('rain_in', M) });
const TRAP = R.fit(column('footfall', M), { ...DD, Weekend: column('weekend', M) });
const ALL7 = R.fit(column('footfall', M), R.dummies(column('weekday', M), { reference: 'none', name: 'Day', levels: LV }));
const dayB = (d) => est(MD, `Day: ${d}`);

// ---------------------------------------------------------------- Simpson's paradox: footfall and the average ticket
const tk = column('avg_ticket');
const T0 = R.fit(tk, { Footfall: y });
const T1 = R.fit(tk, { Footfall: y, Millbrook: mb });
const T2 = R.fit(tk, { Footfall: y, Millbrook: mb, 'Footfall × Millbrook': I(y, mb) });

// ---------------------------------------------------------------- Ashmere Hotel (fictional)
const AH = { b0: 88, sup: 24, suite: 71, wk: 19 };

// ---------------------------------------------------------------- figure: the four cell means
function cellFigure() {
  const py = (v) => 340 - v, xL = 170, xR = 330;
  const hw = cellMean(0, 0), hz = cellMean(0, 1), mw = cellMean(1, 0), mz = cellMean(1, 1);
  const t = (x, yy, s, a = 'middle', extra = '') => `<text x="${x}" y="${yy}" text-anchor="${a}" font-size="15"${extra}>${s}</text>`;
  let svg = '<svg viewBox="0 0 440 310" xmlns="http://www.w3.org/2000/svg" fill="currentColor">';
  svg += `<line x1="120" y1="270" x2="400" y2="270" stroke="var(--rule-strong)" stroke-width="1"/>`;
  svg += t(xL, 292, 'Weekday') + t(xR, 292, 'Weekend');
  svg += `<line x1="${xL}" y1="${py(hw)}" x2="${xR}" y2="${py(hz)}" stroke="var(--series-1)" stroke-width="3"/>`;
  svg += `<line x1="${xL}" y1="${py(mw)}" x2="${xR}" y2="${py(mz)}" stroke="var(--series-2)" stroke-width="3" stroke-dasharray="8 5"/>`;
  [[xL, hw, 'var(--series-1)'], [xR, hz, 'var(--series-1)'], [xL, mw, 'var(--series-2)'], [xR, mz, 'var(--series-2)']].forEach(([x, v, c]) => { svg += `<circle cx="${x}" cy="${py(v)}" r="6" fill="${c}"/>`; });
  svg += t(xL - 14, py(mw) + 5, `Millbrook ${mw.toFixed(0)}`, 'end') + t(xL - 14, py(hw) + 5, `Harbourside ${hw.toFixed(0)}`, 'end');
  svg += t(xR + 14, py(hz) + 5, `${hz.toFixed(0)}`, 'start') + t(xR + 14, py(mz) + 5, `${mz.toFixed(0)}`, 'start');
  svg += t(220, 24, 'Mean daily footfall', 'middle', ' font-weight="bold"');
  return `${svg}</svg>`;
}

const fx = (v, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);

export default {
  slug: 'categorical-predictors-and-interactions',
  title: 'Categorical predictors and interactions',
  blurb: 'Put categories such as the café or the day of the week into a regression with dummy variables, read each coefficient against a reference level, and let one predictor’s effect depend on another with an interaction. Then see a café dummy resolve B05’s Simpson’s paradox.',
  status: 'reviewed',
  objectives: [
    'Construct dummy variables for a categorical predictor with k levels, choosing a reference level, and explain why k − 1 dummies are needed (the dummy-variable trap).',
    'Interpret dummy coefficients as differences from the reference level, holding the other predictors fixed.',
    'Build an interaction term and interpret its coefficient as the difference between two groups’ slopes or effects.',
    'Calculate a group’s own effect or slope from main-effect and interaction coefficients, and explain why centring a predictor changes the main effects but not the fit.',
    'Use a group dummy to resolve a Simpson’s paradox, and say what the pooled slope was mixing.',
  ],
  prerequisites: [
    { lesson: 'b06/multiple-regression', why: 'Partial slopes, holding the other predictors fixed, and reading the ToolPak and LINEST output.' },
    { lesson: 'b05/groups-and-simpsons-paradox', why: 'The reversal between footfall and the average ticket that a café dummy resolves here.' },
    { lesson: 'b02/encoding-categories', why: 'Dummy (one-hot) coding and the reference category, met there as a data-preparation step.' },
    { lesson: 'b04/comparing-means', why: 'The difference between two group means, which a single dummy’s coefficient reproduces.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana wants one model of footfall for both cafés, so that the weather’s effect is estimated from all 612 café-days. But the cafés are very different places: Harbourside on the waterfront fills up at weekends, while Millbrook, among offices, empties. Café and day of the week are categories, not numbers. A regression can only multiply numbers by slopes, so the categories have to be turned into numbers first.' },

    { h: 'A dummy variable' },
    { p: String.raw`A <g>dummy variable</g> is a 0/1 column marking membership of one category. For the café, Ana creates <m>\text{Millbrook} = 1</m> on Millbrook’s rows and 0 on Harbourside’s. Harbourside, the category without a dummy, is the <g>reference category</g>. Regressed on this one column, footfall gives` },
    { math: String.raw`\widehat{\text{footfall}} = 139.7 + 86.7\,\text{Millbrook}` },
    { p: String.raw`Put in Millbrook = 0 and the fitted value is 139.7, Harbourside’s mean daily footfall. Put in 1 and it is <m>139.7 + 86.7 = 226.3</m>, Millbrook’s mean. The dummy’s coefficient is the difference between the two cafés’ means, and its t test is the pooled-variance two-sample t test of B04. With other predictors in the model the coefficient keeps the same meaning, adjusted: the difference between the cafés on days alike on the other predictors. Adding the high and rain leaves it at 86.7 here, because both cafés share the same days and weather: the café dummy is uncorrelated with the weather columns, so there is nothing for the adjustment to remove.` },
    { callout: 'key', title: 'A dummy’s coefficient is a difference from the reference', html: 'The intercept describes the reference category; each dummy’s coefficient is how much that category differs from it, holding the other predictors fixed. A dummy for a category with no reference in mind has no meaning on its own.' },

    { h: 'When the weekend works differently at each café' },
    { p: 'Add a weekend dummy (1 on Saturdays and Sundays) and the model assumes the weekend changes footfall by the same amount at both cafés. Look at the four means first:' },
    { table: {
      caption: 'Mean daily footfall by café and type of day (1 March – 31 December 2027)',
      head: ['', 'Weekdays (220 days)', 'Weekends (86 days)', 'Weekend − weekday'],
      align: ['l', 'r', 'r', 'r'],
      rows: [['Harbourside', cellMean(0, 0).toFixed(1), cellMean(0, 1).toFixed(1), fx(cellMean(0, 1) - cellMean(0, 0), 1)], ['Millbrook', cellMean(1, 0).toFixed(1), cellMean(1, 1).toFixed(1), fx(cellMean(1, 1) - cellMean(1, 0), 1)]],
    } },
    { figure: {
      svg: cellFigure(),
      caption: 'The four means as an interaction plot. The lines cross: the weekend raises Harbourside’s footfall and lowers Millbrook’s. Parallel lines would mean no interaction.',
      alt: 'A chart with two points on the horizontal axis, Weekday and Weekend, and mean daily footfall vertically. A solid line for Harbourside rises from 114 on weekdays to 205 at weekends. A dashed line for Millbrook falls from 272 on weekdays to 110 at weekends. The lines cross.',
    } },
    { p: String.raw`The weekend adds about 90 people at Harbourside and takes away about 162 at Millbrook. No single weekend coefficient can describe both. An <g>interaction</g> term lets it differ: multiply the two dummies, <m>\text{Millbrook} \times \text{Weekend}</m>, which is 1 only on Millbrook’s weekend days, and add the product as a third predictor:` },
    { math: String.raw`\widehat{\text{footfall}} = 114.3 + 157.4\,\text{Millbrook} + 90.2\,\text{Weekend} - 251.8\,(\text{Millbrook} \times \text{Weekend})` },
    { p: String.raw`With four coefficients for four groups, the model reproduces the four means exactly. The intercept is Harbourside’s weekday mean. The Millbrook coefficient, 157.4, is the cafés’ difference on weekdays (both other terms are 0). The Weekend coefficient, 90.2, is the weekend effect at Harbourside, the reference café. The interaction, −251.8, is how much Millbrook’s weekend effect differs from Harbourside’s, so Millbrook’s own weekend effect is <m>90.2 - 251.8 = -161.6</m>. Once an interaction is in a model, neither of its two parts has a meaning alone: each is the effect at the other’s reference level.` },

    { h: 'What leaving the interaction out does' },
    { p: String.raw`The case’s footfall model, with the weather, festivals and both dummies, puts the weekend’s effect at +68.8 people at Harbourside and <m>68.8 - 232.2 = -163.4</m> at Millbrook, holding the weather fixed, with R² = 0.904. Drop the interaction and the single weekend coefficient becomes −49.8: an average of a gain and a larger loss that describes neither café, and R² falls to 0.553. A manager reading −49.8 would cut Harbourside’s weekend roster, the opposite of what it needs.` },
  ],

  theory: [
    { h: 'Categories with more than two levels' },
    { p: String.raw`A categorical predictor with k levels needs <m>k - 1</m> dummies, one for each level except the reference. Millbrook’s day of the week has seven levels; with Monday as the reference, Ana creates six dummies (Tue, …, Sun). Fitted with the high and rain over Millbrook’s 306 days, Tuesday to Friday’s coefficients are between −6.8 and +0.8 people, none significant at 5%, while Saturday’s is −168.0 and Sunday’s −162.6: each compares that day with a Monday of the same weather. The five weekdays behave alike, and so do the two weekend days, which is why one weekend dummy does almost as well. Its adjusted R² is 0.8456, against 0.8442 for the six weekday dummies, and it is one coefficient instead of six. Whether a group of dummies is needed is a question for a single test of the group, the nested F test of the multicollinearity-and-model-choice lesson, not for six separate t tests.` },
    { p: String.raw`The choice of reference changes the coefficients but not the model. Make Millbrook the reference, with a Harbourside dummy, and the cell-means model becomes <m>271.8 - 157.4\,\text{Harbourside} - 161.6\,\text{Weekend} + 251.8\,(\text{Harbourside} \times \text{Weekend})</m>: the same four fitted means, the same R², the same residuals. Choose the reference that makes the comparisons you want to report direct, usually the largest or most familiar group.` },

    { h: 'The dummy-variable trap' },
    { p: String.raw`Why not a dummy for every level? With an intercept in the model, the k dummies of one variable always add up to 1, the intercept’s own column, so one of them is an exact combination of the others and least squares has no unique answer. This is the <g>dummy-variable trap</g>, a case of perfect collinearity. Software reports it rather than fitting: the B06 engine, given all seven weekday dummies with an intercept, says the terms “are perfectly collinear with the others, so their effects can’t be separated”. The same happens with less obvious duplicates: Millbrook’s Saturday and Sunday dummies add up to its weekend column, so a model with all three can’t be fitted either. Excel’s LINEST, given collinear columns, sets one coefficient to 0 and carries on, which is easy to miss.` },

    { h: 'An interaction with a numeric predictor' },
    { p: String.raw`An interaction can also let a slope differ between groups. Add <m>\text{High} \times \text{Millbrook}</m> to the case’s footfall model: the product equals the high on Millbrook’s rows and 0 on Harbourside’s. The slope on the high, 1.65 people per °F, is now Harbourside’s; the interaction, −0.76 (t = −5.27), is the difference, so Millbrook’s slope is <m>1.65 - 0.76 = 0.89</m> people per °F. In the generator, footfall rises 1.1% per °F of Harbourside’s expected trade and 0.2% at Millbrook, so in people the waterfront café is far more sensitive to the weather.` },
    { p: String.raw`Read the main effect of the café with care. In this model the Millbrook coefficient, 206.1, is the cafés’ difference on a weekday when the high is 0°F, which never happened in 2027. <g>Centring</g> the temperature, using <m>\text{High} - 60</m> in both terms, changes only that: the Millbrook coefficient becomes 160.6, the difference on a 60°F weekday, while the slopes, the fitted values and R² stay exactly the same. Centre a numeric predictor at a typical value whenever it enters an interaction, so the main effects describe something that exists.` },
    { p: String.raw`The build-up of the multiple-regression lesson matters here too, and differs by café. Add the build-up and its interaction with the café, and the slopes become 1.43 people per °F at Harbourside and 0.45 at Millbrook; fitted to the generator’s planted mean footfall, the same model gives 1.46 and 0.44. Without the build-up, Millbrook’s slope of 0.89 is twice the planted one, because its spring was both cold and still building up.` },
    { callout: 'note', title: 'Why the case needs interactions', html: 'The generator multiplies: footfall is a café’s base trade times a weather factor times a weekend factor. On a multiplicative scale the same percentage change becomes a different number of people at a busy café and a quiet one, so in people every effect interacts with the café. On the log scale the factors add, and many of these interactions shrink; the transformations-and-influence lesson takes logs.' },

    { h: 'Simpson’s paradox, with a café dummy' },
    { p: String.raw`B05 found that across all 612 café-days footfall and the average ticket correlate at −0.324, while within each café they correlate positively (0.73 at Harbourside, 0.52 at Millbrook). In regression terms, the pooled slope of the average ticket on footfall is −$0.40 per 100 people. Add the Millbrook dummy and the slope on footfall becomes +$0.25 per 100 people, with Millbrook’s tickets $2.30 smaller at the same footfall. The dummy holds the café fixed: the slope now compares days within the same café, and the negative pooled slope came from the café difference alone (Millbrook has more people and smaller tickets).` },
    { p: String.raw`Add the interaction <m>\text{Footfall} \times \text{Millbrook}</m> and each café gets its own slope: $0.36 per 100 people at Harbourside and <m>0.36 - 0.18 = 0.18</m> at Millbrook. The generator planted $0.40 and $0.22 before sales were scaled to the year’s $236,000 total, which is about $0.33 and $0.18 in the log’s dollars, so the fitted slopes are close to the truth. The model with one shared slope, $0.25, is between the two, an average weighted towards the café whose footfall varies more.` },
    { callout: 'warn', title: 'Two cafés, one day', html: 'Pooling both cafés doubles the rows but not the independent information about the weather: each day’s high and rain appear twice, once per café. The standard errors of a pooled model treat the 612 rows as independent, which they aren’t, so they can be off in either direction (inference-for-coefficients shows a case where the pooled one is too large). All the slopes here also assume days are independent of each other, which neighbouring days only roughly are.' },

    { h: 'Testing an interaction' },
    { p: 'An interaction’s t test asks whether the two groups’ slopes (or effects) differ, holding the rest of the model fixed. The café × temperature interaction’s t of −5.27 says the cafés’ temperature slopes clearly differ. When a categorical predictor has more than two levels, its interaction with a numeric predictor is several product columns, and the question “do the slopes differ at all?” needs one test of all of them together: the nested F test in the next lesson.' },
  ],

  formulas: [
    { id: 'cat-dummy-model', name: 'Model with a dummy and an interaction',
      tex: String.raw`\hat y = b_0 + b_1x + b_2D + b_3(x \times D)`,
      where: [[String.raw`\hat y`, 'Fitted value', 'units of y'], [String.raw`D`, 'Dummy: 1 for the group, 0 for the reference group', ''], [String.raw`x`, 'A numeric predictor (or another dummy)', 'its units'], [String.raw`b_0, b_1`, 'Intercept and slope on x for the reference group', 'units of y; per unit of x'], [String.raw`b_2`, 'Difference between the groups when x = 0', 'units of y'], [String.raw`b_3`, 'Difference between the groups’ slopes on x', 'units of y per unit of x']],
      assumptions: 'The model is additive apart from the interaction included.',
      note: 'The group’s own slope is b₁ + b₃; its intercept b₀ + b₂. Centre x so that b₂ describes a value of x that occurs.' },
    { id: 'cat-dummies-needed', name: 'Number of dummies for a categorical predictor',
      tex: String.raw`\text{dummies} = k - 1`,
      where: [[String.raw`k`, 'Number of levels (categories) of the predictor', ''], [String.raw`\text{dummies}`, 'Number of 0/1 columns entered with an intercept', '']],
      note: 'k dummies with an intercept is the dummy-variable trap: they sum to the intercept’s column.' },
    { id: 'cat-cell-means', name: 'Two dummies and their interaction: the four group means',
      tex: String.raw`\bar y_{00} = b_0,\quad \bar y_{10} = b_0 + b_1,\quad \bar y_{01} = b_0 + b_2,\quad \bar y_{11} = b_0 + b_1 + b_2 + b_3`,
      where: [[String.raw`\bar y_{ab}`, 'Mean of y in the group with D₁ = a and D₂ = b', 'units of y'], [String.raw`b_0`, 'Intercept: the mean of the reference group (both dummies 0)', 'units of y'], [String.raw`b_1, b_2`, 'Coefficients of the two dummies D₁ and D₂', 'units of y'], [String.raw`b_3`, 'Coefficient of the product D₁ × D₂', 'units of y']],
      assumptions: 'No other predictors in the model; then the fit reproduces the four means exactly.',
      note: 'The effect of D₂ when D₁ = 1 is b₂ + b₃.' },
  ],

  examples: [
    { level: 'simple', title: 'Room rates by type and day', fictional: true,
      setup: 'Ashmere Hotel (fictional) has three room types (standard, superior, suite) and regresses each night’s rate ($) on dummies for superior and suite (standard is the reference) and a weekend dummy: rate = 88 + 24 superior + 71 suite + 19 weekend. Interpret the coefficients, find the fitted rate for a suite on a Saturday, and find how much more a suite costs than a superior room.',
      steps: [
        'Name the reference: a standard room on a weekday, whose fitted rate is the intercept, $88.',
        'Read each dummy as a difference from the reference, holding the other dummy fixed: a superior room costs $24 more than a standard room on the same kind of night, a suite $71 more, and a weekend night $19 more than a weekday for the same room type.',
        String.raw`Suite on a Saturday: <m>88 + 71 + 19 = \$178</m> (superior = 0, suite = 1, weekend = 1).`,
        String.raw`Suite against superior is not a coefficient: it is the difference of their two coefficients, <m>71 - 24 = \$47</m>, the same on weekdays and weekends because the model has no interaction.`,
      ],
      answer: 'A suite on a Saturday is fitted at $178; suites cost $47 more than superior rooms on the same night.',
      interpretation: 'Three room types need two dummies. If the hotel wanted superior rooms as the baseline, it would refit with standard and suite dummies and get −24 and +47, with exactly the same fitted rates.' },

    { level: 'challenging', title: 'Two cafés, two weekends', fictional: true,
      setup: 'The case’s footfall model for both cafés has coefficients of 68.8 on Weekend, 157.4 on Millbrook, −232.2 on Millbrook × Weekend, 1.27 on the high, −71.8 on rain and 336.8 on Festival (intercept 39.5). Find each café’s weekend effect and the cafés’ difference on a weekend, holding the weather fixed; then explain what the model without the interaction says.',
      steps: [
        'Harbourside is the reference café, so its weekend effect is the Weekend coefficient: +68.8 people, holding the weather and festivals fixed.',
        String.raw`Millbrook’s weekend effect adds the interaction: <m>68.8 + (-232.2) = -163.4</m> people.`,
        String.raw`The cafés’ difference: on a weekday it is the Millbrook coefficient, 157.4; on a weekend it adds the interaction, <m>157.4 - 232.2 = -74.8</m>. At weekends Harbourside is busier than Millbrook by about 75 people.`,
        'Without the interaction the single Weekend coefficient is −49.8 and R² falls from 0.904 to 0.553: the model forces one weekend effect on two cafés whose weekends go in opposite directions.',
      ],
      answer: 'Weekend effect +68.8 people at Harbourside and −163.4 at Millbrook; on a weekend Millbrook has about 75 fewer people than Harbourside, against 157 more on a weekday.',
      interpretation: 'The interaction is the finding: the cafés serve different customers (weekend visitors at the waterfront, office workers in town). A pooled model without it would mislead both managers, and its weather slope would also be estimated from badly fitted rows.' },

    { level: 'applied', title: 'Do busy days shrink the ticket?', fictional: true,
      setup: 'A regional manager proposes pushing add-ons on busy days, because “busier days have smaller tickets”: the pooled slope of the average ticket on footfall over the 612 café-days is −$0.40 per 100 people. Ana adds a Millbrook dummy, then the footfall × Millbrook interaction. Should the proposal stand on the pooled slope?',
      steps: [
        'Fit the pooled slope: −$0.40 per 100 people. It compares all days, including Harbourside’s days with Millbrook’s.',
        'Add the café dummy: the slope on footfall becomes +$0.25 per 100 people, and Millbrook’s tickets are $2.30 smaller at the same footfall. Holding the café fixed, busier days go with slightly larger tickets.',
        'Add the interaction: +$0.36 per 100 people at Harbourside and +$0.18 at Millbrook. Both cafés agree in sign.',
        'Explain the pooled slope: Millbrook has more people and much smaller tickets than Harbourside, so mixing the cafés produces a downward slope that neither café shows (B05’s Simpson’s paradox).',
      ],
      answer: 'No. Within each café, busier days go with slightly larger tickets ($0.36 per 100 people at Harbourside, $0.18 at Millbrook); the negative pooled slope comes from comparing the cafés with each other.',
      interpretation: 'The add-on idea may still be worth trying, but not because busy days shrink tickets; they don’t. If the manager wants to know whether add-ons raise tickets, a trial on some days and not others would answer it. Ana’s note should give the within-café slopes and say why the pooled one is misleading.' },
  ],

  demo: [
    { widget: 'cat-foot', intro: 'Both cafés’ 612 days. The model starts without interactions: note the Weekend coefficient. Tick Millbrook × Weekend and watch Weekend become Harbourside’s own effect, with R² jumping. Then tick High × Millbrook and work out Millbrook’s temperature slope from the two coefficients.' },
    { widget: 'cat-ticket', intro: 'The average ticket against footfall, the Simpson’s paradox of B05. Turn on the least-squares line for all days, then colour by café and look at each café’s line: the pooled slope points the other way.' },
  ],

  mistakes: [
    { title: '“The Weekend coefficient is the effect of the weekend.”', html: 'With an interaction in the model it is the weekend effect in the reference café only. Millbrook’s is the Weekend coefficient plus the interaction. Always add the interaction before quoting a group’s effect.' },
    { title: '“I included a dummy for every category to be complete.”', html: 'With an intercept, k dummies sum to the intercept’s column, so the model can’t be fitted (the dummy-variable trap). Leave one level out as the reference, or drop the intercept, but not both.' },
    { title: '“The Millbrook coefficient of 206 says Millbrook has 206 more people.”', html: 'In a model with a High × Millbrook interaction, it is the difference at a high of 0°F, a temperature the cafés never saw. Centre the temperature (High − 60) and it becomes 160.6, the difference on a 60°F weekday. The fit is identical either way.' },
    { title: '“Tuesday’s dummy isn’t significant, so I’ll drop it and keep the others.”', html: 'Dropping one weekday dummy merges Tuesday into the reference (Monday), changing what every other dummy compares with. Decide on the whole categorical variable at once: keep all its dummies, recode it (weekend versus weekday), or test the group with a nested F test.' },
    { title: '“Day of the week is coded 1 to 7, so I’ll enter it as one number.”', html: 'A single column 1–7 forces equal steps from Monday to Sunday, a straight line through the week. Millbrook’s weekdays are flat and its weekend drops by about 165 people; no line through 1–7 can describe that. Code categories with dummies.' },
  ],

  application: [
    { p: 'Dummy variables and interactions are how regression handles the categories that run through business data: region, store format, product line, channel, customer segment, month. A retailer comparing stores models sales on store size with a dummy for each format, then asks whether the payoff from extra floor space differs by format (a size × format interaction). A software company estimates whether slow replies from its support desk lost more customers on its monthly plan than on its annual one (a response-time × plan interaction). The question “does this work the same everywhere?” is an interaction question, and averaging over groups that differ, as the pooled weekend coefficient did, is one of the commonest ways regression misleads.' },
    { case: 'Ana’s note to her two managers: “Holding the weather and festivals fixed, a weekend day brings Harbourside about 69 more people than a weekday and costs Millbrook about 163, from a model with a café × weekend interaction. Without that interaction the model says the weekend costs both cafés about 50 people, which is wrong for both. Warm days matter more at Harbourside: about 1.4 more people per °F against 0.45 at Millbrook, after allowing for the cafés’ build-up in their first four months. And busy days don’t shrink the ticket: within each café, busier days have slightly larger tickets; the opposite pattern appears only if the cafés are pooled.”' },
    { p: 'The note reports each café’s own figure rather than the coefficients, which a manager would have to add up. It states the reference implicitly by naming both cafés, says what was held fixed, and explains in one sentence why the simpler model misleads. It doesn’t quote the Millbrook main effect at 0°F, which describes no real day.' },
    { p: 'Two habits carry over to any analysis. First, plot the group means or group slopes before fitting: crossing or diverging lines in an interaction plot are the sign that a single coefficient won’t do. Second, when interactions are in, report effects for each group with their own uncertainty rather than the raw coefficients; the ToolPak’s output gives the pieces, and the next lesson’s nested F test decides whether a whole set of interactions earns its place.' },
  ],

  summary: [
    'A dummy variable is 1 for one category and 0 otherwise; its coefficient is the difference from the reference category, holding the other predictors fixed.',
    'A categorical predictor with k levels needs k − 1 dummies; k dummies with an intercept is the dummy-variable trap (perfect collinearity).',
    'Changing the reference level changes the coefficients, not the fitted values or R².',
    'An interaction term is the product of two predictors. It lets one predictor’s effect differ by group: a group’s own effect or slope is the main effect plus the interaction.',
    'At Harbourside the weekend adds about 69 people; at Millbrook it costs 68.8 − 232.2 = −163.4. Without the interaction the single Weekend coefficient, −49.8, describes neither café.',
    'With an interaction in the model, each main effect is the effect at the other predictor’s reference or zero; centre numeric predictors so it describes a real value.',
    'A café dummy resolves B05’s Simpson’s paradox: the ticket’s slope on footfall is −$0.40 per 100 people pooled, +$0.25 holding the café fixed, and +$0.36 and +$0.18 for each café.',
  ],

  glossary: [
    { term: 'Interaction', def: 'In a regression, a term that lets the effect of one predictor depend on the value of another, usually the product of the two columns. Its coefficient is the change in one predictor’s slope per unit of the other (for a dummy, the difference between the two groups’ slopes).' },
    { term: 'Main effect', def: 'The coefficient of a predictor that also appears in an interaction: its effect when the other predictor in the interaction is zero or at its reference level.' },
    { term: 'Interaction plot', def: 'A chart of the mean of y for each combination of two factors, one line per level of one factor. Parallel lines suggest no interaction; diverging or crossing lines suggest one.' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. <i>Introductory Business Statistics 2e</i>, section 13.4, “The Regression Equation” (dummy variables and interaction terms). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-4-the-regression-equation', checked: '2026-11-01' },
    { text: 'Penn State Eberly College of Science. <i>STAT 462: Applied Regression Analysis</i>, Lesson 8, “Categorical Predictors”.', url: 'https://online.stat.psu.edu/stat462/node/86', checked: '2026-11-01' },
    { text: 'Microsoft Support. “LINEST function”.', url: 'https://support.microsoft.com/en-US/excel/functions/linest-function', checked: '2026-11-01' },
  ],

  checks: [
    // single dummy
    { what: 'Café-days', value: y.length, shown: 612 },
    { what: 'Intercept = Harbourside mean', value: P0.beta[0], shown: 139.7, tol: 0.05 },
    { what: 'Millbrook coefficient', value: P0.beta[1], shown: 86.7, tol: 0.05 },
    { what: 'Millbrook mean', value: mean(column('footfall', M)), shown: 226.3, tol: 0.05 },
    { what: 'Café coefficient unchanged by the weather', value: R.fit(y, { High: hi, Rain: rain, Millbrook: mb }).beta[3], shown: 86.7, tol: 0.05 },
    { what: 'Café dummy uncorrelated with the high', value: Math.abs(mean(hi.filter((_, i) => mb[i])) - mean(hi.filter((_, i) => !mb[i]))), shown: 0, tol: 1e-9 },
    { what: 'Dummy = difference of means', value: P0.beta[1], shown: mean(column('footfall', M)) - mean(column('footfall', { cafe: 'Harbourside' })), tol: 1e-9 },
    // the four cells
    { what: 'Weekdays per café', value: wk.filter((v, i) => !v && !mb[i]).length, shown: 220 },
    { what: 'Weekend days per café', value: wk.filter((v, i) => v && !mb[i]).length, shown: 86 },
    { what: 'Cell intercept', value: CELL.beta[0], shown: 114.3, tol: 0.05 },
    { what: 'Cell Millbrook', value: CELL.beta[1], shown: 157.4, tol: 0.05 },
    { what: 'Cell Weekend', value: CELL.beta[2], shown: 90.2, tol: 0.05 },
    { what: 'Cell Weekend about 90', value: CELL.beta[2], shown: 90, tol: 0.5 },
    { what: 'Cell interaction', value: CELL.beta[3], shown: -251.8, tol: 0.05 },
    { what: 'Millbrook weekend effect', value: CELL.beta[2] + CELL.beta[3], shown: -161.6, tol: 0.05 },
    { what: 'Millbrook weekend effect about 162', value: -(CELL.beta[2] + CELL.beta[3]), shown: 162, tol: 0.5 },
    { what: 'Rounded arithmetic', value: 90.2 - 251.8, shown: -161.6, tol: 0.001 },
    { what: 'Cells reproduced exactly', value: Math.max(Math.abs(CELL.beta[0] - cellMean(0, 0)), Math.abs(CELL.beta[0] + CELL.beta[1] - cellMean(1, 0)), Math.abs(CELL.beta[0] + CELL.beta[2] - cellMean(0, 1)), Math.abs(CELL.beta.reduce((s, v) => s + v, 0) - cellMean(1, 1))), shown: 0, tol: 1e-9 },
    { what: 'Figure: H weekday', value: cellMean(0, 0), shown: 114, tol: 0.5 },
    { what: 'Figure: H weekend', value: cellMean(0, 1), shown: 205, tol: 0.5 },
    { what: 'Figure: M weekday', value: cellMean(1, 0), shown: 272, tol: 0.5 },
    { what: 'Figure: M weekend', value: cellMean(1, 1), shown: 110, tol: 0.5 },
    { what: 'Lines cross (claim)', value: Number(cellMean(1, 0) > cellMean(0, 0) && cellMean(1, 1) < cellMean(0, 1)), shown: 1 },
    // the case's model and the model without the interaction
    { what: 'FM Weekend', value: est(FM, 'Weekend'), shown: 68.8, tol: 0.05 },
    { what: 'FM Weekend about 69', value: est(FM, 'Weekend'), shown: 69, tol: 0.5 },
    { what: 'FM interaction', value: est(FM, 'Millbrook × Weekend'), shown: -232.2, tol: 0.05 },
    { what: 'FM Millbrook weekend', value: est(FM, 'Weekend') + est(FM, 'Millbrook × Weekend'), shown: -163.4, tol: 0.05 },
    { what: 'FM Millbrook weekend about 163', value: -(est(FM, 'Weekend') + est(FM, 'Millbrook × Weekend')), shown: 163, tol: 0.5 },
    { what: 'FM Millbrook', value: est(FM, 'Millbrook'), shown: 157.4, tol: 0.05 },
    { what: 'FM weekend gap', value: est(FM, 'Millbrook') + est(FM, 'Millbrook × Weekend'), shown: -74.8, tol: 0.05 },
    { what: 'FM weekend gap about 75', value: -(est(FM, 'Millbrook') + est(FM, 'Millbrook × Weekend')), shown: 75, tol: 0.5 },
    { what: 'FM weekday gap about 157', value: est(FM, 'Millbrook'), shown: 157, tol: 0.5 },
    { what: 'FM high', value: est(FM, 'High (°F)'), shown: 1.27 },
    { what: 'FM rain', value: est(FM, 'Rain (in)'), shown: -71.8, tol: 0.05 },
    { what: 'FM festival', value: est(FM, 'Festival'), shown: 336.8, tol: 0.05 },
    { what: 'FM intercept', value: FM.beta[0], shown: 39.5, tol: 0.05 },
    { what: 'FM R²', value: FM.r2, shown: 0.904, tol: 0.0005 },
    { what: 'No-interaction Weekend', value: est(NOINT, 'Weekend'), shown: -49.8, tol: 0.05 },
    { what: 'No-interaction Weekend about 50', value: -est(NOINT, 'Weekend'), shown: 50, tol: 0.5 },
    { what: 'No-interaction R²', value: NOINT.r2, shown: 0.553, tol: 0.0005 },
    // weekday dummies at Millbrook
    { what: 'Millbrook days', value: column('footfall', M).length, shown: 306 },
    { what: 'Tue', value: dayB('Tue'), shown: 0.8, tol: 0.05 },
    { what: 'Thu (lowest weekday)', value: dayB('Thu'), shown: -6.8, tol: 0.05 },
    { what: 'Tue–Fri between −6.8 and +0.8', value: Number(['Tue', 'Wed', 'Thu', 'Fri'].every((d) => dayB(d) >= -6.85 && dayB(d) <= 0.85)), shown: 1 },
    { what: 'Tue–Fri none significant', value: Number(['Tue', 'Wed', 'Thu', 'Fri'].every((d) => cf(MD, `Day: ${d}`).p > 0.05)), shown: 1 },
    { what: 'Sat', value: dayB('Sat'), shown: -168.0, tol: 0.05 },
    { what: 'Sun', value: dayB('Sun'), shown: -162.6, tol: 0.05 },
    { what: 'Weekend-only adjusted R²', value: MW.adjR2, shown: 0.8456, tol: 0.00005 },
    { what: 'Six-dummy adjusted R²', value: MD.adjR2, shown: 0.8442, tol: 0.00005 },
    { what: 'Weekend drop about 165 (between Sat and Sun)', value: -est(MW, 'Weekend'), shown: 165, tol: 2.5 },
    { what: 'Six dummies for seven levels', value: Object.keys(DD).length, shown: 6 },
    // reference change
    { what: 'Ref M intercept', value: REFM.beta[0], shown: 271.8, tol: 0.05 },
    { what: 'Ref M Harbourside', value: REFM.beta[1], shown: -157.4, tol: 0.05 },
    { what: 'Ref M Weekend', value: REFM.beta[2], shown: -161.6, tol: 0.05 },
    { what: 'Ref M interaction', value: REFM.beta[3], shown: 251.8, tol: 0.05 },
    { what: 'Same R² whichever reference', value: REFM.r2, shown: CELL.r2, tol: 1e-12 },
    // trap
    { what: 'Seven dummies + intercept refused', value: Number(Boolean(ALL7.error) && /perfectly collinear/.test(ALL7.error)), shown: 1 },
    { what: 'Sat + Sun + weekend refused', value: Number(Boolean(TRAP.error)), shown: 1 },
    // temperature slopes by café
    { what: 'HM high (Harbourside)', value: est(HM, 'High'), shown: 1.65 },
    { what: 'HM interaction', value: est(HM, 'High × Millbrook'), shown: -0.76 },
    { what: 'HM interaction t', value: cf(HM, 'High × Millbrook').t, shown: -5.27 },
    { what: 'HM Millbrook slope', value: est(HM, 'High') + est(HM, 'High × Millbrook'), shown: 0.89 },
    { what: 'HM rounded arithmetic', value: 1.65 - 0.76, shown: 0.89, tol: 0.001 },
    { what: 'HM Millbrook main effect', value: est(HM, 'Millbrook'), shown: 206.1, tol: 0.05 },
    { what: 'HM Millbrook main effect about 206', value: est(HM, 'Millbrook'), shown: 206, tol: 0.5 },
    { what: 'Centred Millbrook main effect', value: est(HMC, 'Millbrook'), shown: 160.6, tol: 0.05 },
    { what: 'Centring leaves R² unchanged', value: HMC.r2, shown: HM.r2, tol: 1e-10 },
    { what: 'Centring leaves the slopes unchanged', value: est(HMC, 'High × Millbrook'), shown: est(HM, 'High × Millbrook'), tol: 1e-9 },
    { what: 'Highs never near 0°F', value: Math.min(...hi), shown: 28 },
    { what: 'Build-up model: Harbourside slope', value: est(HMB, 'High'), shown: 1.43 },
    { what: 'Build-up model: Millbrook slope', value: est(HMB, 'High') + est(HMB, 'High × Millbrook'), shown: 0.45 },
    { what: 'Planted Harbourside slope (average)', value: PLH, shown: 1.46 },
    { what: 'Estimand Harbourside slope', value: EH, shown: 1.46 },
    { what: 'Estimand Millbrook slope', value: EM, shown: 0.44 },
    { what: 'Planted Millbrook slope', value: PLM, shown: 0.45 },
    { what: 'Millbrook 0.89 about twice the planted', value: (est(HM, 'High') + est(HM, 'High × Millbrook')) / PLM, shown: 2, tol: 0.05 },
    // Simpson
    { what: 'B05 pooled r', value: B05.footTicket.r, shown: -0.324, tol: 0.0005 },
    { what: 'B05 Harbourside r', value: B05.footTicketH.r, shown: 0.73 },
    { what: 'B05 Millbrook r', value: B05.footTicketM.r, shown: 0.52 },
    { what: 'Pooled ticket slope per 100', value: T0.beta[1] * 100, shown: -0.40, tol: 0.005 },
    { what: 'Café-dummy slope per 100', value: T1.beta[1] * 100, shown: 0.25, tol: 0.005 },
    { what: 'Café-dummy Millbrook', value: T1.beta[2], shown: -2.30, tol: 0.005 },
    { what: 'Interaction: Harbourside per 100', value: T2.beta[1] * 100, shown: 0.36, tol: 0.005 },
    { what: 'Interaction: difference per 100', value: T2.beta[3] * 100, shown: -0.18, tol: 0.005 },
    { what: 'Interaction: Millbrook per 100', value: (T2.beta[1] + T2.beta[3]) * 100, shown: 0.18, tol: 0.005 },
    { what: 'Planted Harbourside $0.40 per 100 (0.0040 per person) before scaling', value: 0.0040 * 100, shown: 0.40 },
    { what: 'Planted Millbrook $0.22 per 100 before scaling', value: 0.0022 * 100, shown: 0.22 },
    { what: 'Sales scale factor about 0.829', value: scaleH, shown: 0.829, tol: 0.002 },
    { what: 'Planted Harbourside per 100, scaled', value: 0.40 * scaleH, shown: 0.33 },
    { what: 'Planted Millbrook per 100, scaled', value: 0.22 * scaleM, shown: 0.18 },
    { what: 'Fitted slopes close to the scaled truth (within $0.03 per 100)', value: Number(Math.abs(T2.beta[1] * 100 - 0.40 * scaleH) < 0.03 && Math.abs((T2.beta[1] + T2.beta[3]) * 100 - 0.22 * scaleM) < 0.03), shown: 1 },
    { what: 'Shared slope lies between the two', value: Number(T1.beta[1] > T2.beta[1] + T2.beta[3] && T1.beta[1] < T2.beta[1]), shown: 1 },
    { what: 'Millbrook more people, smaller tickets', value: Number(B05.meanFootfallM > B05.meanFootfallH && B05.meanTicketM < B05.meanTicketH), shown: 1 },
    { what: 'Shared slope weighted towards the café whose footfall varies more (Millbrook’s SD larger)', value: Number(Math.abs(T1.beta[1] - (T2.beta[1] + T2.beta[3])) < Math.abs(T1.beta[1] - T2.beta[1]) === (Math.sqrt(column('footfall', M).reduce((s, v) => s + (v - mean(column('footfall', M))) ** 2, 0)) > Math.sqrt(column('footfall', { cafe: 'Harbourside' }).reduce((s, v) => s + (v - mean(column('footfall', { cafe: 'Harbourside' }))) ** 2, 0)))), shown: 1 },
    // Ashmere Hotel
    { what: 'Suite on Saturday', value: AH.b0 + AH.suite + AH.wk, shown: 178 },
    { what: 'Suite − superior', value: AH.suite - AH.sup, shown: 47 },
    // application
    { what: 'Application: Harbourside slope about 1.4', value: est(HMB, 'High'), shown: 1.4, tol: 0.05 },
  ],
};
