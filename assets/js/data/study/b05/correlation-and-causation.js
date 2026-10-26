// correlation-and-causation.js — B05 · Correlation and causation. Content only; exercises are in
// correlation-and-causation.ex.js. Uses the cafés' daily log (case.js: DERIVED, column) for the loyalty-members trend,
// the staffing confounder, the waiting-time gradient and rain. Seaside Cinemas and the other businesses named are
// fictional. Every figure printed is recomputed in `checks`.
import { DERIVED as D, column } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';
import { mean } from '../../../core/stats.js?v=20';

// ---------------------------------------------------------------- two trends at Harbourside
const H = { cafe: 'Harbourside' };
const hDate = column('date', H), hMem = column('loyalty_members', H), hHigh = column('high_f', H), hDay = column('day', H);
const win = (a, b) => hDate.map((_, i) => i).filter((i) => hDate[i] >= a && hDate[i] <= b);
const SPR = win('2027-03-01', '2027-07-31'), AUT = win('2027-08-01', '2027-12-31'), ALL = hDate.map((_, i) => i);
const pick = (arr, I) => I.map((i) => arr[i]);
const trend = (I) => {
  const m = pick(hMem, I), t = pick(hHigh, I), d = pick(hDay, I);
  const su = m.slice(1).map((v, k) => v - m[k]);
  return { r: C.pearson(m, t).r, mDay: C.pearson(m, d).r, tDay: C.pearson(t, d).r, part: C.partial(m, t, [d]), signups: C.pearson(su, t.slice(1)) };
};
const TS = trend(SPR), TA = trend(AUT), TY = trend(ALL);

// ---------------------------------------------------------------- staffing and sales; waiting-time gradient
const S = column('peak_staff_hours'), SA = column('sales'), T = column('transactions'), LOAD = column('peak_load'), W = column('peak_wait_min');
const staffSalesGivenT = C.partial(S, SA, [T]);
const GRAD = [[0, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 100]].map(([a, b]) => { const i = LOAD.map((_, k) => k).filter((k) => LOAD[k] >= a && LOAD[k] < b); return { a, b, n: i.length, wait: mean(i.map((k) => W[k])) }; });

// ---------------------------------------------------------------- rain at Harbourside, wet and dry days
const hRain = column('rain_in', H), hSales = column('sales', H), hWk = column('weekday', H).map((d) => d === 'Sat' || d === 'Sun');
const salesWhere = (we, wet) => mean(hSales.filter((_, i) => hWk[i] === we && (wet ? hRain[i] >= 0.25 : hRain[i] === 0)));
const nWhere = (we, wet) => hSales.filter((_, i) => hWk[i] === we && (wet ? hRain[i] >= 0.25 : hRain[i] === 0)).length;
const RAIN = { wdDry: salesWhere(false, false), wdWet: salesWhere(false, true), nWdDry: nWhere(false, false), nWdWet: nWhere(false, true) };

// ---------------------------------------------------------------- June at Harbourside: 28 tests (from the correlation-matrices lesson)
const JI = column('date').map((d, i) => i).filter((i) => column('date')[i].slice(5, 7) === '06' && column('cafe')[i] === 'Harbourside');
const JCOLS = ['high_f', 'rain_in', 'footfall', 'transactions', 'sales', 'iced_share', 'peak_staff_hours', 'peak_wait_min'];
const jsig = (m) => { const X = C.matrix(Object.fromEntries(JCOLS.map((n) => [n, JI.map((i) => column(n)[i])])), { adjustMethod: m }); const Q = X.pAdj || X.p; let k = 0; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if (Q[i][j] < 0.05) k++; return k; };
const JUNE = { none: jsig(null), bonferroni: jsig('bonferroni'), bh: jsig('fdr_bh') };
const monthMean = (mo) => mean(hHigh.filter((_, i) => hDate[i].slice(5, 7) === mo));

// ---------------------------------------------------------------- chance: 40 metrics
const m40 = 40 * 0.05, p40 = 1 - 0.95 ** 40;

// ---------------------------------------------------------------- figure: members and the high temperature through the year
const f1 = (x) => Math.round(x * 10) / 10;
function trendFigure() {
  const Wd = 640, Ht = 260, L = 50, R = 60, Tp = 20, Bt = 40, n = hMem.length;
  const X = (i) => L + (i / (n - 1)) * (Wd - L - R);
  const Yt = (v) => Tp + (1 - (v - 20) / 80) * (Ht - Tp - Bt), Ym = (v) => Tp + (1 - v / 1000) * (Ht - Tp - Bt);
  const smooth = hHigh.map((_, i) => mean(hHigh.slice(Math.max(0, i - 3), Math.min(n, i + 4))));
  let svg = `<svg viewBox="0 0 ${Wd} ${Ht}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  [20, 40, 60, 80, 100].forEach((v) => { svg += `<line x1="${L}" x2="${Wd - R}" y1="${f1(Yt(v))}" y2="${f1(Yt(v))}" stroke="var(--rule-strong)" stroke-width="0.5" stroke-dasharray="3 3"/><text x="${L - 6}" y="${f1(Yt(v)) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v}°F</text><text x="${Wd - R + 6}" y="${f1(Yt(v)) + 4}" font-size="11" fill="var(--ink-3)">${Math.round(((v - 20) / 80) * 1000)}</text>`; });
  const path = (vals, Y) => vals.map((v, i) => `${i ? 'L' : 'M'}${f1(X(i))},${f1(Y(v))}`).join(' ');
  svg += `<path d="${path(smooth, Yt)}" fill="none" stroke="var(--series-2)" stroke-width="2"/>`;
  svg += `<path d="${path(hMem, Ym)}" fill="none" stroke="var(--series-1)" stroke-width="2.5" stroke-dasharray="7 3"/>`;
  const split = SPR.length - 0.5;
  svg += `<line x1="${f1(X(split))}" x2="${f1(X(split))}" y1="${Tp}" y2="${Ht - Bt}" stroke="var(--ink-3)" stroke-width="1"/>`;
  svg += `<text x="${f1(X(SPR.length / 2))}" y="${Ht - Bt + 18}" text-anchor="middle" font-size="11" fill="var(--ink-3)">March–July: both rise</text>`;
  svg += `<text x="${f1(X(SPR.length + AUT.length / 2))}" y="${Ht - Bt + 18}" text-anchor="middle" font-size="11" fill="var(--ink-3)">August–December: members rise, temperature falls</text>`;
  svg += `<text x="${f1(X(60))}" y="${f1(Yt(smooth[60])) - 10}" font-size="11">High temperature (7-day average, left axis)</text>`;
  svg += `<text x="${f1(X(205))}" y="${f1(Ym(hMem[205])) - 10}" font-size="11">Loyalty members (dashed, right axis)</text>`;
  return `${svg}</svg>`;
}

export default {
  slug: 'correlation-and-causation',
  title: 'Correlation and causation',
  blurb: 'Learn the six ways two variables can be correlated without one causing the other, what kinds of evidence do support a causal claim, and how to write a finding that says exactly as much as the data allow.',
  status: 'draft',
  objectives: [
    'Identify, for a given correlation, the explanations other than cause: chance, confounding, reverse causation, common trends, selection and pooled groups.',
    'Detect and remove a common trend by correlating changes or by working within shorter periods, and explain what the result shows.',
    'Evaluate the evidence a causal claim needs (experiments, natural experiments, dose–response, timing, consistency and mechanism), using Bradford Hill’s considerations as considerations rather than a checklist.',
    'Decide which correlations a manager can act on for prediction and which need causal evidence before an intervention.',
    'Write a finding from correlational data that states the association, its size and its limits without overclaiming.',
  ],
  prerequisites: [
    { lesson: 'b05/partial-correlation', why: 'Confounders, mediators and colliders, and the barista-hours example this lesson returns to.' },
    { lesson: 'b05/correlation-matrices', why: 'The many-tests problem, one of the ways chance produces correlations.' },
    { lesson: 'b05/groups-and-simpsons-paradox', why: 'Pooled groups that reverse a correlation.' },
    { lesson: 'b04/comparing-means', why: 'The two-sample t test that analyses a randomised trial, and why random assignment allows a causal reading.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana has three questions from her matrix and her partial correlations, and a new one from her marketing assistant: Harbourside’s loyalty-app members and the day’s high temperature correlate at +0.87 from March to July. “Warm weather gets people to sign up,” the assistant says, “so we should push the app hardest in summer.” In August–December the same two numbers correlate at −0.90. Ana wants to know which of her correlations she can act on.' },

    { h: 'Why correlation is not causation' },
    { p: 'To say that x causes y is to say that changing x would change y: if Ana rostered one more barista on a given morning, the wait that morning would be shorter than it would otherwise have been. That “otherwise” can never be observed on the same morning, so causal claims are always inferences. A correlation shows only that x and y moved together in the data. OpenStax’s business statistics text puts it plainly: “Strong correlation does not suggest that X1 causes X2 or X2 causes X1.” Six other explanations can produce a correlation, and a causal claim has to rule them out.' },

    { h: 'Six explanations other than cause' },
    { ol: [
      '<b>Chance.</b> With few rows, sizeable correlations arise from noise; with many tests, some cells are “significant” by luck. The correlation-matrices lesson showed 18 of 28 June cells at Harbourside passing an unadjusted test, and only 10 to 16 surviving adjustment.',
      '<b>Confounding.</b> A third variable drives both. Busy days bring both more baristas and longer waits (r = +0.53), so the simple correlation said the opposite of the truth until transactions were held fixed (−0.72).',
      '<b>Reverse causation.</b> y drives x, not x drives y. Peak barista hours correlate with sales at 0.75, but the managers roster for the trade they expect, so expected sales set the roster. Holding the day’s transactions fixed, barista hours and sales correlate at −0.13: baristas don’t bring customers in.',
      '<b>Common trends.</b> Two series that both drift over time correlate whatever their connection. Loyalty members only ever rise; temperature rises to July and falls after. Together they correlate at +0.87 in spring and −0.90 in autumn.',
      '<b>Selection.</b> The rows were chosen in a way connected to both variables. Studying only the cafés that survived, the customers who answered a survey, or the days someone complained creates links that the full population doesn’t have (the collider of the partial-correlation lesson).',
      '<b>Pooled groups.</b> Two groups with different levels, pooled, can show a correlation that neither has inside it, or the reverse: footfall and average ticket are −0.32 pooled but positive inside each café.',
    ] },
    { p: 'These are not exotic. In a daily log like Ana’s, every one of them is present somewhere, and a correlation that has not been checked against all six is a lead, not a finding. The word for a correlation produced by one of them rather than by cause is a <g>spurious correlation</g>.' },

    { h: 'Two trends: members and the weather' },
    { figure: {
      svg: trendFigure(),
      caption: 'Harbourside, March–December 2027: the day’s high temperature (7-day average) and the cumulative number of loyalty-app members. Members rise all year; the temperature peaks in July. Their correlation is +0.87 before August and −0.90 after.',
      alt: 'A line chart over the ten months from March to December. A solid line, the high temperature, rises from a March average of about 53°F to a July average of about 84°F and falls to about 43°F in December. A dashed line, loyalty members, climbs from near zero in March to 877 at the end of December, fastest in the summer months. A vertical line at the start of August splits the chart; the left part is labelled “March–July: both rise” and the right part “August–December: members rise, temperature falls”.',
    } },
    { p: 'The assistant’s +0.87 comes entirely from time. Members are a running total, so they rise every day whatever the weather; in spring the temperature also rises, so the two correlate positively; in autumn it falls, so they correlate negatively. Over the whole year the two trends partly cancel (−0.13). A number that flips sign when the calendar moves is telling you about the calendar.' },
    { p: 'The fix is to ask the question of the right quantity. Ana’s question is whether warm days bring sign-ups, so compare each day’s new members (today’s total minus yesterday’s) with the day’s high. That correlation is +0.35 in spring and +0.39 in autumn: modest, positive and the same in both halves. Warm days do go with more sign-ups at Harbourside, probably because they bring more customers, and about 4% of transactions sign up. The trend made the link look stronger than it is in spring and reversed it in autumn.' },

    { h: 'What would show causation' },
    { p: 'The strongest evidence comes from changing x on purpose. In a <g>randomised experiment</g> the analyst decides which units get the change by chance, a coin or a random number for each, so that nothing else (busy days, weather, the manager’s judgement) can line up with it. OpenStax’s introductory text describes how random assignment spreads lurking variables evenly across the groups. B04’s A/B tests are randomised experiments. Ana could flip a coin each weekday morning to decide whether to add a barista hour at the peak, and after eight weeks compare waits on extra-barista days with the rest.' },
    { p: 'When an experiment is impossible or too costly, other kinds of evidence each rule out some of the six explanations:' },
    { list: [
      '<b>A <g>natural experiment</g>:</b> something outside anyone’s choice changes x for some units and not others. Rain is not chosen by the cafés, and on Harbourside weekdays with at least a quarter-inch of rain, sales averaged $206 against $296 on dry weekdays. The managers didn’t plan the rain, so the gap isn’t their roster or their promotions.',
      '<b>A <g>dose–response relationship</g>:</b> more of x goes with more of y, step by step. Peak waits average about 1.6 minutes at loads under seven transactions per barista hour, 3.1 at nine to ten, and 9.4 at twelve or more. A gradient is harder for chance to produce than a single difference, though a confounder can produce one too.',
      '<b>Timing:</b> the cause comes first. A day’s weather is fixed before its sales, so sales can’t cause the weather; the roster is set before the day, from the expected trade, which is why the roster can follow expected sales rather than cause them.',
      '<b>Consistency:</b> the same link in different places, periods and data. The negative partial correlation of barista hours and waits holds in both cafés, in every band of trade and in single months.',
      '<b>Mechanism:</b> a plausible route from x to y. More baristas serve more customers per minute, so queues clear faster; that is how queues work. A correlation with no conceivable mechanism, such as members and temperature, deserves extra suspicion.',
    ] },

    { h: 'What Ana can act on' },
    { p: 'Not every decision needs causation. To <i>predict</i>, a stable correlation is enough: warm days go with a high iced share (r = 0.94), so stocking ice and cups by the forecast works whether or not anyone understands why. To <i>intervene</i>, changing x to change y, the correlation must reflect cause. Rostering more baristas to shorten waits is an intervention, supported by the partial correlation, the gradient and the mechanism, and best confirmed by a trial. Pushing the loyalty app in summer “because warm weather drives sign-ups” rests on a trend, though daily sign-ups do follow warm, busy days modestly.' },
  ],

  theory: [
    { h: 'Confounding and reverse causation in more detail' },
    { p: 'A <g>confounding variable</g> is a common cause; the partial-correlation lesson held one fixed. Holding a confounder fixed works only if it is measured, measured well and controlled in the right shape, and only for the confounders you thought of. That is why observational studies, however careful, leave room for doubt, and why random assignment, which balances unmeasured confounders too, is the stronger design.' },
    { p: '<g>Reverse causation</g> is common wherever decisions respond to expectations. Managers staff up for expected crowds, advertisers spend more in the season they expect to sell most, and doctors treat the sickest patients most intensively, so in each case the “treatment” correlates with the outcome it was chosen to meet. Timing helps (what was decided before what), and so does asking how x was set: if it was set from a forecast of y, the correlation of x with y is at least partly y’s doing.' },

    { h: 'Trends and other time patterns' },
    { p: String.raw`Any two series that trend over the same period correlate, as the members show: −0.13 over the year, +0.87 and −0.90 within the halves. Three remedies are common. Correlate changes (today minus yesterday, this week minus last) rather than levels, as with daily sign-ups. Hold time fixed with a partial correlation, as long as the trend is close to a straight line: within spring, members and temperature correlate at 0.20 holding the day number fixed, and within autumn at −0.03. Or compare like periods (each Monday with the previous Monday, this June with last June). Seasonal patterns that are not straight lines, like a year of temperature, defeat a straight-line control for time: over the whole year, holding the day fixed leaves 0.61, which is still mostly season. Time-series methods that model trend and season properly belong to a forecasting course.` },

    { h: 'Selection' },
    { p: '<g>Selection bias</g> arises when which rows are in the data depends on the variables being studied. Studying only successful cafés to find what makes cafés succeed is <g>survivorship bias</g>, one kind; studying only customers who answered a survey, who may be the most and least satisfied, is another. Selecting on a common effect of two variables is selecting on a collider, which creates a link between them. The remedy is to ask, before computing anything, how each row got into the data, and whether that process could depend on x, on y, or on both.' },

    { h: 'Experiments and their limits' },
    { p: 'A randomised experiment answers a causal question for the units, period and version of the change that were tried. Ana’s eight-week barista trial would tell her what an extra peak hour did to waits in those weeks, at those cafés; whether the effect holds in the December rush is a further question. Experiments also need enough units to detect the effect (the power ideas of B04 and of the testing-correlation lesson), a measure fixed in advance, and a plan to run the change as assigned. Where randomising is unfair or impractical, a comparison group and <g>difference-in-differences</g> (the change in the treated group minus the change in a comparison group) can stand in, at the cost of an assumption that the two would otherwise have moved in parallel.' },

    { h: 'Bradford Hill’s considerations' },
    { p: 'In a 1965 lecture on how to judge whether an environmental exposure causes a disease, the epidemiologist Austin Bradford Hill listed nine aspects of an association to weigh before deciding: strength, consistency, specificity, temporality, biological gradient, plausibility, coherence, experiment and analogy. They are widely quoted as “criteria”, but Hill was explicit that they were not a checklist:' },
    { quote: { text: '“None of my nine viewpoints can bring indisputable evidence for or against the cause-and-effect hypothesis and none can be required as a sine qua non.”', cite: 'Austin Bradford Hill (1965)' } },
    { table: {
      caption: 'Hill’s considerations applied to “more peak baristas shorten the peak wait”',
      head: ['Consideration', 'What it asks', 'Ana’s evidence'],
      rows: [
        ['Strength', 'Is the association large?', 'Partial r = −0.72 at a given level of trade.'],
        ['Consistency', 'Is it seen repeatedly, in different settings?', 'Both cafés, every band of trade, single months.'],
        ['Specificity', 'Is it tied to one outcome?', 'Weak here: busy days affect many measures at once.'],
        ['Temporality', 'Does the cause come first?', 'The roster is set before the queue forms.'],
        ['Gradient', 'Does more of the cause go with more effect?', 'Waits rise step by step with transactions per barista hour.'],
        ['Plausibility', 'Is there a mechanism?', 'More baristas serve more customers per minute.'],
        ['Coherence', 'Does it fit what else is known?', 'It fits basic queueing: service rate against arrival rate.'],
        ['Experiment', 'Does changing it change the outcome?', 'Not yet: the barista trial would supply this.'],
        ['Analogy', 'Are there similar known effects?', 'Extra checkout staff shorten supermarket queues.'],
      ],
    } },
    { p: 'Hill also warned against letting a significance test settle the question, observing that such tests say how much chance could produce but not whether a link is causal. Statistical significance answers the first of the six explanations and none of the other five.' },

    { h: 'Writing a finding without overclaiming' },
    { p: 'The words in a finding should match the evidence. Before a causal claim is earned, describe the association: “goes with”, “is associated with”, “was higher on days when”. Give its size, its interval or p-value, the rows it covers and what was held fixed. Name the explanations you could not rule out. Then, if the evidence supports it, say how strongly it points to cause and what would settle it.' },
    { table: {
      caption: 'Matching the wording to the evidence',
      head: ['Evidence', 'Wording that fits', 'Wording that overclaims'],
      rows: [
        ['A correlation in observational data', '“Days with more X tended to have more Y (r = 0.40).”', '“X drives Y.”'],
        ['A partial correlation holding a confounder fixed', '“At a given level of Z, more X went with less Y.”', '“X reduces Y.”'],
        ['A gradient, consistent across settings, with a mechanism', '“The evidence points to X reducing Y; a trial would confirm it.”', '“We have proved X reduces Y.”'],
        ['A randomised experiment', '“Adding X reduced Y by … in the trial (95% interval …).”', '“X will always reduce Y.”'],
      ],
    } },
  ],

  formulas: [
    { id: 'cause-change', name: 'Change (first difference) of a series',
      tex: String.raw`\Delta y_t = y_t - y_{t-1}`,
      where: [[String.raw`y_t`, 'The series’ value in period t (members at the end of day t)', 'units of y'], [String.raw`y_{t-1}`, 'Its value in the period before', 'units of y'], [String.raw`\Delta y_t`, 'The change in period t (the day’s new members)', 'units of y per period']],
      assumptions: 'Periods are equally spaced and in order.',
      note: 'Correlating changes instead of levels removes a shared trend; the first period has no change.' },
    { id: 'cause-chance', name: 'Expected chance findings among many tests',
      tex: String.raw`E[\text{false alarms}] = m\,\alpha, \qquad P(\text{at least one}) = 1 - (1 - \alpha)^m`,
      where: [[String.raw`m`, 'Number of tests run when no relationship is real', ''], [String.raw`P(\text{at least one})`, 'Probability that at least one test is significant by chance', ''], [String.raw`\alpha`, 'Significance level of each test', ''], [String.raw`E[\text{false alarms}]`, 'Average number of “significant” results by chance', '']],
      assumptions: 'Every null hypothesis true; the second formula also assumes independent tests.',
      note: 'The correlation-matrices lesson shows how to adjust for this.' },
  ],

  examples: [
    { level: 'simple', title: 'Forty metrics, two “findings”', fictional: true,
      setup: 'Seaside Cinemas (fictional) correlates weekly ticket sales with 40 other weekly measures from its systems, from the number of trailers shown to the car-park temperature, and reports the two that are significant at 5% as “drivers of attendance”. Could chance alone explain them?',
      steps: [
        String.raw`If none of the 40 measures were related to ticket sales, each test would still be significant with probability 0.05, so on average <m>40 \times 0.05 = 2</m> would pass.`,
        String.raw`The chance of at least one passing by luck, if the tests were independent, is <m>1 - 0.95^{40} \approx 0.87</m>.`,
        'Two significant results out of 40 is therefore exactly what pure noise would produce. Even if they are real correlations, “drivers” claims cause, which needs the other five explanations ruled out.',
      ],
      answer: 'Yes: chance alone would give about 2 significant results among 40 tests, and at least one with probability about 0.87.',
      interpretation: 'The cinema should treat the two measures as leads, adjust for the 40 tests (correlation-matrices lesson), check them on new weeks, and ask whether each could be a confounder, a reverse effect or a trend before calling it a driver.' },

    { level: 'challenging', title: 'Members and the weather: removing the trend', fictional: true,
      setup: 'Harbourside’s loyalty members and the day’s high correlate at +0.87 from March to July and −0.90 from August to December. Does warm weather go with sign-ups, and how strongly?',
      steps: [
        'Diagnose: members are a running total, correlated with the day number at 0.99 in both halves. The high temperature correlates with the day number at 0.87 in spring and −0.90 in autumn. The members–temperature correlation simply copies the temperature’s trend.',
        'Hold time fixed: within spring, the partial correlation of members and temperature holding the day number fixed is 0.20; within autumn, −0.03. Most of each half’s correlation disappears.',
        'Ask about changes: the day’s new members (today’s total minus yesterday’s) against the day’s high correlate at +0.35 in spring and +0.39 in autumn, and +0.37 over the year.',
        'Interpret: the change-based correlation is moderate, positive and stable across the halves, unlike the levels’ flip. A mechanism is easy to see: warm days bring more customers to the waterfront, and a share of customers sign up.',
      ],
      answer: 'The ±0.9 correlations are trends. Warm days do go with more sign-ups, but modestly: r ≈ 0.37 between the day’s new members and its high temperature.',
      interpretation: 'The assistant’s plan rests on the trend, not on the daily link. A better reading is that sign-ups follow customers, and customers follow warm weather at the waterfront. To grow the app, Ana should ask what share of customers sign up and whether a promotion raises that share, which is something she can test by running it on randomly chosen days.' },

    { level: 'applied', title: 'Designing the barista trial', fictional: true,
      setup: 'The log says that, at a given level of trade, more peak barista hours go with shorter waits (partial r = −0.72). Ana wants to know how many minutes an extra barista hour saves before she changes the roster at both cafés. Design a study that answers that causally, and say what she can claim before it runs.',
      steps: [
        'State why the log can’t settle it: the managers chose the roster from the trade they expected (reverse causation and confounding), and anything that made them add staff, such as a planned event, may also affect waits.',
        'Randomise: for eight weeks, on each weekday morning at each café, a random draw decides whether the roster gets one extra barista hour at the 7–11 a.m. peak. The managers can’t pick the days, so expected trade, weather and events are spread evenly across extra and normal days.',
        'Fix the measure and the analysis in advance: the peak wait as the log records it; compare mean waits on extra-hour and normal days with Welch’s t test (B04), within each café, and report the difference with its 95% interval.',
        'Plan the size: with about 40 weekdays per café, roughly 20 extra-hour days each, check with B04’s power tools that the trial can detect the smallest saving worth the wage cost.',
        'Write the interim finding in the language of association: “At the same level of trade, mornings with more barista hours had shorter waits (partial r = −0.72 over 612 café-days). Waits rise steeply above about seven transactions per barista hour. We are running a randomised trial to measure the effect of an extra hour.”',
      ],
      answer: 'A randomised trial assigning an extra peak barista hour by chance on weekdays at each café for eight weeks, analysed by comparing mean waits with Welch’s t test; until it reports, Ana can claim an association at a given level of trade, consistent with a causal effect, not the effect itself.',
      interpretation: 'The log has done its job: it identified a likely lever and gave reasons (strength, consistency, gradient, mechanism) to think it is causal. The trial turns that into a number Ana can put against the cost of the extra hour, which is the decision she actually has to make.' },
  ],

  demo: [
    { widget: 'cause-trend', intro: 'Harbourside’s loyalty members against the day’s high, all ten months: r ≈ −0.13. Colour by half of the year to see the two trends, +0.87 and −0.90.' },
    { widget: 'cause-signups', intro: 'The same café, but the day’s new members against the day’s high. The trend is gone and a modest positive link, r ≈ 0.37, remains. Colour by half of the year: the two halves now agree.' },
    { widget: 'cause-gradient', intro: 'The waiting-time gradient: each day’s peak wait against its load, transactions per barista hour at the peak. Turn on ranks to see Spearman’s ρ, and look for the point near seven where waits start to climb.' },
  ],

  mistakes: [
    { title: '“The correlation is significant, so the effect is real.”', html: 'A significance test addresses chance, the first of the six explanations. It says nothing about confounding, reverse causation, trends, selection or pooling. A tiny p-value on 612 days can belong to an entirely spurious correlation, such as members and temperature in spring.' },
    { title: '“We can’t prove cause without an experiment, so correlations are useless.”', html: 'Correlations are enough for prediction (stock ice for hot days) and are how good causal questions are found. Natural experiments, gradients, timing, consistency and mechanism can make a causal reading strong even without a trial. The skill is matching the claim to the evidence, not refusing to claim anything.' },
    { title: '“Both series went up this year, so one must be driving the other.”', html: 'Any two trending series correlate. Correlate the changes, compare like periods, or hold time fixed; if the link vanishes, it was the trend. Members and temperature flip from +0.87 to −0.90 when the calendar moves.' },
    { title: '“More barista hours go with higher sales, so baristas sell coffee.”', html: 'The roster is set from the trade managers expect: sales drive the roster, not the other way round. Holding the day’s transactions fixed, barista hours and sales correlate at −0.13. Always ask how x was set.' },
    { title: '“I’ll write that X drives Y, since everyone knows what I mean.”', html: 'Readers act on words. “Drives”, “leads to” and “causes” tell a manager that changing X will change Y. If the evidence is a correlation, write “goes with” or “is associated with”, give the size, and say what would settle the causal question.' },
  ],

  application: [
    { p: 'Every analyst who reports correlations to managers faces the same pressure: the manager wants to know what to change, and a correlation seems to say. Marketing teams see spend and sales rise together in December, operations teams see staffing and incidents rise together on busy shifts, product teams see that users of a feature are more loyal. In each case the professional habit is the same: name the alternative explanations, check the ones the data can check, say clearly which remain, and propose the test that would settle the question when the decision is large enough to justify one.' },
    { case: 'Ana’s year-end summary for her managers reads: “1. Warm days go with a higher share of iced drinks (r = 0.94); we will stock by the forecast. 2. At the same level of trade, mornings with more barista hours had shorter waits (r = −0.72); waits climb steeply above about seven transactions per barista hour. We are testing an extra peak hour on randomly chosen weekdays from February. 3. Members and temperature are two trends; daily sign-ups follow busy, warm days only modestly (r = 0.37), so we won’t time app promotions by the weather. 4. Rainy weekdays at Harbourside took about $90 less than dry ones; plan staffing for wet forecasts.”' },
    { p: 'Her summary uses the distinction this lesson rests on. The first and fourth items are predictions: she will act on them without needing to know the cause, and the fourth rests on a natural experiment, since nobody chose the rain. The second is a probable cause, stated as an association with the evidence that supports a causal reading, and she has planned the experiment that will measure it. The third is a correlation she has explained away. None of the items uses “drives” where the evidence is a correlation.' },
    { p: 'The same reasoning scales up. Large organisations run thousands of randomised experiments a year precisely because correlations in their data are so often confounded by who chooses what; regulators ask for trials before approving medicines for the same reason. When a trial is impossible, the considerations in this lesson are how analysts, economists and epidemiologists argue from observational data, and how readers should judge their arguments.' },
  ],

  summary: [
    'Causation means that changing x would change y; a correlation only shows that x and y moved together.',
    'Six explanations other than cause produce correlations: chance (including many tests), confounding, reverse causation, common trends, selection and pooled groups. Check each before reading a correlation causally.',
    'Trends: correlate changes, compare like periods or hold time fixed. Harbourside’s members and temperature flip from +0.87 to −0.90 with the season, while daily sign-ups and temperature correlate at about +0.37 in both halves.',
    'Randomised experiments are the strongest evidence; natural experiments, dose–response gradients, timing, consistency and mechanism each rule out some alternatives. Hill’s nine considerations help weigh the evidence but are not a checklist.',
    'Prediction needs only a stable correlation; intervention needs cause. Ana can stock by the weather forecast, should trial extra barista hours, and shouldn’t time promotions by temperature.',
    'Write findings in the language of association, with size, interval, rows and controls, name what wasn’t ruled out, and say what would settle the causal question.',
  ],

  glossary: [
    { term: 'Spurious correlation', def: 'A correlation between two variables that arises from something other than one affecting the other, such as a confounder, a shared trend, selection or chance.' },
    { term: 'Reverse causation', def: 'A correlation in which the supposed effect actually causes the supposed cause, such as expected sales determining how many staff are rostered.' },
    { term: 'Randomised experiment', def: 'A study in which the analyst assigns the change to units by chance, so that nothing else can systematically line up with it and a difference in outcomes can be attributed to the change.' },
    { term: 'Natural experiment', def: 'A situation in which something outside the control of the people being studied, such as the weather or a rule change, alters a possible cause for some units and not others, allowing a comparison close to an experiment.' },
    { term: 'Dose–response relationship', def: 'A pattern in which larger amounts of a possible cause go with steadily larger effects, considered evidence (though not proof) of a causal link.' },
    { term: 'Selection bias', def: 'Systematic error that arises when the rows in the data were chosen by a process related to the variables being studied, creating or distorting associations.' },
  ],

  references: [
    { text: 'Hill, A. B. (1965). “The environment and disease: association or causation?” <i>Proceedings of the Royal Society of Medicine</i>, 58(5), 295–300.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1898525/', checked: '2026-10-26' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 13.1, “The Correlation Coefficient r”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/13-1-the-correlation-coefficient-r', checked: '2026-10-26' },
    { text: 'Illowsky, B. &amp; Dean, S. <i>Introductory Statistics 2e</i>, section 1.4, “Experimental Design and Ethics”. OpenStax.', url: 'https://openstax.org/books/introductory-statistics/pages/1-4-experimental-design-and-ethics', checked: '2026-10-26' },
    { text: 'Cole, S. R., Platt, R. W., Schisterman, E. F., Chu, H., Westreich, D., Richardson, D. &amp; Poole, C. (2010). “Illustrating bias due to conditioning on a collider”. <i>International Journal of Epidemiology</i>, 39(2), 417–420.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2846442', checked: '2026-10-26' },
  ],

  checks: [
    // trends
    { what: 'Spring members–temperature', value: TS.r, shown: 0.87 },
    { what: 'Autumn members–temperature', value: TA.r, shown: -0.90 },
    { what: 'Case spring agrees', value: D.membersTempSpring, shown: TS.r, tol: 1e-12 },
    { what: 'Case autumn agrees', value: D.membersTempAutumn, shown: TA.r, tol: 1e-12 },
    { what: 'Year members–temperature', value: TY.r, shown: -0.13 },
    { what: 'Members–day spring', value: TS.mDay, shown: 0.99 },
    { what: 'Members–day autumn', value: TA.mDay, shown: 0.99 },
    { what: 'Temperature–day spring', value: TS.tDay, shown: 0.87 },
    { what: 'Temperature–day autumn', value: TA.tDay, shown: -0.90 },
    { what: 'Spring partial | day', value: TS.part.r, shown: 0.20 },
    { what: 'Autumn partial | day', value: TA.part.r, shown: -0.03 },
    { what: 'Year partial | day', value: TY.part.r, shown: 0.61 },
    { what: 'Sign-ups–high spring', value: TS.signups.r, shown: 0.35 },
    { what: 'Sign-ups–high autumn', value: TA.signups.r, shown: 0.39 },
    { what: 'Sign-ups–high year', value: TY.signups.r, shown: 0.37 },
    { what: 'Members at year end', value: hMem.at(-1), shown: 877 },
    { what: 'March mean high about 53', value: monthMean('03'), shown: 53, tol: 0.5 },
    // other figures from the case
    { what: 'June unadjusted', value: JUNE.none, shown: 18 },
    { what: 'June after Bonferroni', value: JUNE.bonferroni, shown: 10 },
    { what: 'June after BH', value: JUNE.bh, shown: 16 },
    { what: 'Pairs', value: 8 * 7 / 2, shown: 28 },
    { what: 'July mean high about 84', value: monthMean('07'), shown: 84, tol: 0.5 },
    { what: 'December mean high about 43', value: monthMean('12'), shown: 43, tol: 0.5 },
    { what: 'Members grew fastest in summer (July–August month)', value: Number(hMem[hDate.indexOf('2027-08-01')] - hMem[hDate.indexOf('2027-07-01')] === Math.max(...['04', '05', '06', '07', '08', '09', '10', '11', '12'].map((mo, k) => hMem[hDate.indexOf(`2027-${mo}-01`)] - hMem[hDate.indexOf(`2027-${['03', '04', '05', '06', '07', '08', '09', '10', '11'][k]}-01`)]))), shown: 1 },
    { what: 'Staff–wait simple', value: D.staffWait.r, shown: 0.53 },
    { what: 'Staff–wait partial', value: D.staffWaitGivenTrans.r, shown: -0.72 },
    { what: 'Staff–sales', value: D.staffSales.r, shown: 0.75 },
    { what: 'Staff–sales | transactions', value: staffSalesGivenT.r, shown: -0.13 },
    { what: 'Footfall–ticket pooled', value: D.footTicket.r, shown: -0.32 },
    { what: 'Footfall–ticket positive in each café', value: Number(D.footTicketH.r > 0 && D.footTicketM.r > 0), shown: 1 },
    { what: 'Iced share–temperature', value: D.tempIced.r, shown: 0.94 },
    // rain natural experiment
    { what: 'Wet weekday mean sales', value: RAIN.wdWet, shown: 206, tol: 0.5 },
    { what: 'Dry weekday mean sales', value: RAIN.wdDry, shown: 296, tol: 0.5 },
    { what: 'About $90 less', value: RAIN.wdDry - RAIN.wdWet, shown: 90, tol: 1 },
    { what: 'Wet weekdays (at least 0.25 in)', value: RAIN.nWdWet, shown: 30 },
    // gradient
    { what: 'Load under 7: mean wait', value: GRAD[0].wait, shown: 1.6, tol: 0.05 },
    { what: 'Load 9–10: mean wait', value: GRAD[3].wait, shown: 3.1, tol: 0.05 },
    { what: 'Load 12+: mean wait', value: GRAD[6].wait, shown: 9.4, tol: 0.05 },
    { what: 'Gradient rises at every step after 7', value: Number(GRAD.slice(1).every((g, i) => g.wait > GRAD[i].wait)), shown: 1 },
    // chance
    { what: '40 × 0.05', value: m40, shown: 2 },
    { what: '1 − 0.95^40', value: p40, shown: 0.87 },
    // trial
    { what: 'About 20 extra-hour days per café in 8 weeks of weekdays', value: (8 * 5) / 2, shown: 20 },
    { what: 'About 40 weekdays per café', value: 8 * 5, shown: 40 },
    { what: 'About 4% of transactions sign up: sign-ups per transaction at Harbourside', value: hMem.at(-1) / column('transactions', H).reduce((s, v) => s + v, 0), shown: 0.04, tol: 0.01 },
    { what: 'Café-days', value: D.rows, shown: 612 },
  ],
};
