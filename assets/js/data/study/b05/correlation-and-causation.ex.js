// correlation-and-causation.ex.js — B05 · Correlation and causation: widgets, practice and the knowledge check
// (answer keys live here). The cafés’ log comes from case.js (Harbourside’s 31 October days and 30 April days for the
// worksheets); every other business named is fictional. Formula items are marked by their results
// (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { column } from './case.js?v=20';
import * as C from '../../../core/correlation.js?v=20';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));

// ---------------------------------------------------------------- Harbourside’s year
const H = { cafe: 'Harbourside' };
const hDate = column('date', H), hMem = column('loyalty_members', H), hHigh = column('high_f', H);
const half = hDate.map((d) => (d < '2027-08-01' ? 'March–July' : 'August–December'));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const lab = (d) => `${Number(d.slice(8, 10))} ${MON[Number(d.slice(5, 7)) - 1]}`;
const signups = hMem.slice(1).map((v, i) => v - hMem[i]);

// ---------------------------------------------------------------- worksheets: October and April at Harbourside
const month = (mo) => hDate.map((_, i) => i).filter((i) => hDate[i].slice(5, 7) === mo);
const sheetOf = (I) => ({ A1: 'Day', B1: 'Loyalty members (total)', C1: 'High (°F)', ...col('A', 2, I.map((i) => lab(hDate[i]))), ...col('B', 2, I.map((i) => hMem[i])), ...col('C', 2, I.map((i) => hHigh[i])) });
const OCT = month('10'), APR = month('04');
const oM = OCT.map((i) => hMem[i]), oH = OCT.map((i) => hHigh[i]);
const oLevels = C.pearson(oM, oH).r, oNew = oM.slice(1).map((v, k) => v - oM[k]), oSign = C.pearson(oNew, oH.slice(1)).r, oP = C.pearson(oNew, oH.slice(1)).p;
// Harbourside, March–July: members against sales
const SPR = hDate.map((_, i) => i).filter((i) => hDate[i] < '2027-08-01');
const hSales = column('sales', H);
const memSales = C.pearson(SPR.map((i) => hMem[i]), SPR.map((i) => hSales[i])).r;
const aM = APR.map((i) => hMem[i]), aH = APR.map((i) => hHigh[i]);
const aSign = C.pearson(aM.slice(1).map((v, k) => v - aM[k]), aH.slice(1)).r, aLevels = C.pearson(aM, aH).r;

export const widgets = {
  'cause-trend': {
    type: 'scatter',
    title: 'Harbourside: loyalty members (running total) against the day’s high, March–December 2027',
    x: { name: 'High temperature', values: hHigh, unit: '°F' },
    y: { name: 'Loyalty members (total)', values: hMem },
    group: { name: 'Half of the year', values: half }, labels: hDate.map(lab),
    show: ['pearson', 'spearman'], toggles: ['group', 'line'], defaults: { group: false },
    note: 'Over the ten months r is about −0.13. Coloured by half, the spring points rise to the right (+0.87) and the autumn points fall (−0.90): each half follows the calendar, not the weather.',
  },
  'cause-signups': {
    type: 'scatter',
    title: 'Harbourside: the day’s new members against the day’s high (2 March – 31 December)',
    x: { name: 'High temperature', values: hHigh.slice(1), unit: '°F' },
    y: { name: 'New members that day', values: signups },
    group: { name: 'Half of the year', values: half.slice(1) }, labels: hDate.slice(1).map(lab),
    show: ['pearson', 'spearman', 'ci', 'p'], toggles: ['group', 'line'], defaults: { group: false },
    note: 'New members are whole numbers, so points stack in rows. The correlation is modest and positive in both halves: warm days bring more customers to the waterfront, and a share of customers sign up.',
  },
  'cause-gradient': {
    type: 'scatter',
    title: 'Peak wait against peak load, both cafés (612 days)',
    x: { name: 'Peak load (transactions per barista hour)', values: column('peak_load') },
    y: { name: 'Peak wait', values: column('peak_wait_min'), unit: 'min' },
    group: { name: 'Café', values: column('cafe') },
    show: ['pearson', 'spearman', 'kendall'], toggles: ['ranks', 'group', 'line'], defaults: { group: false },
    note: 'A dose–response pattern: waits barely change below a load of about seven, then climb more steeply with each step. The straight line misses the bend; Spearman’s ρ is higher than Pearson’s r because the link is monotonic but curved.',
  },
};

export const guided = [
  {
    id: 'b05-cause-g1', type: 'steps', kind: 'applied',
    prompt: 'The worksheet holds Harbourside’s 31 days in October 2027: the running total of loyalty-app members (B) and the day’s high (C). Over the month the two correlate negatively. Find out whether that is a trend or a daily link.',
    solution: `The levels correlate at ${neg(oLevels, 3)}: members rise through October as the weather cools. The day’s new members against the day’s high correlate at ${neg(oSign, 3)}. The negative link was the trend; day by day, warmer October days went with slightly more sign-ups (r = ${fx(oSign)}, p = ${fx(oP, 2)}, not significant on 30 days alone), in line with the year’s +0.37.`,
    steps: [
      {
        id: 'b05-cause-g1-s1', type: 'formula',
        prompt: 'In D3, calculate the number of new members on 2 October (that day’s total minus the day before’s), so that it fills down to D32.',
        sheet: { cells: { ...sheetOf(OCT), D1: 'New members' } },
        cell: 'D3', fill: 'D3:D32', answer: '=B3-B2',
        alt: ['=-B2+B3'],
        view: 'A1:D32', maxHeight: '20rem',
        widths: { A: 8, B: 22, C: 10, D: 13 },
        wrong: [
          { formula: '=B2-B3', say: 'That is yesterday minus today, so every new member shows as negative. The change is today’s total minus yesterday’s: <x>=B3-B2</x>.' },
          { formula: '=B3-$B$2', say: 'With B2 fixed, each cell gives the members gained since 1 October, which still trends upwards. The day’s change uses the day before: <x>=B3-B2</x>.' },
        ],
        hints: ['A day’s new members are its total minus the previous day’s total.', '<x>=B3-B2</x>, filled down.'],
      },
      {
        id: 'b05-cause-g1-s2', type: 'formula',
        prompt: 'Column D now holds each day’s new members from 2 October. In F2, calculate the correlation of the day’s new members with that day’s high.',
        sheet: { cells: { ...sheetOf(OCT), D1: 'New members', ...Object.fromEntries(OCT.slice(1).map((_, k) => [`D${k + 3}`, `=B${k + 3}-B${k + 2}`])), E1: 'r(levels)', F1: '=CORREL(B2:B32,C2:C32)', E2: 'r(new members, high)' } },
        cell: 'F2', answer: '=CORREL(D3:D32,C3:C32)',
        alt: ['=CORREL(C3:C32,D3:D32)', '=PEARSON(D3:D32,C3:C32)', '=CORREL(D2:D32,C2:C32)', '=CORREL(B3:B32-B2:B31,C3:C32)'],
        require: [],
        view: 'A1:F32', maxHeight: '20rem',
        formats: { F1: '0.000', F2: '0.000' }, widths: { A: 8, B: 22, C: 10, D: 13, E: 21 },
        wrong: [
          { formula: '=CORREL(D3:D32,C2:C31)', say: 'That pairs each day’s new members with the previous day’s high. Use the same rows: D3:D32 with C3:C32.' },
          { formula: '=CORREL(B2:B32,C2:C32)', say: 'That is the correlation of the levels, already in F1. The question is about the day’s new members in column D.' },
        ],
        hints: ['Column D starts in row 3, so the highs to pair with it start in row 3 too.', '<x>=CORREL(D3:D32,C3:C32)</x>'],
      },
      {
        id: 'b05-cause-g1-s3', type: 'mc',
        prompt: `The levels correlate at ${neg(oLevels, 2)} and the daily changes at ${neg(oSign, 2)}. What should Ana conclude?`,
        options: [
          'The negative link is the calendar: members rise as October cools. Day to day, warmth goes with more sign-ups.',
          'Cold weather makes people join the app, so promotions should be timed for the coldest days of the autumn months ahead.',
          'The two correlations disagree, so one of them must have been calculated from the wrong rows of data.',
          'Warm weather causes sign-ups, because the correlation of the daily changes is positive and significant.',
        ],
        answer: 0,
        hints: ['Members are a running total. What does a running total do over any month, whatever the weather?'],
        feedback: {
          1: 'That reads the trend as a cause. The negative link comes from members rising while the temperature falls.',
          2: 'They answer different questions: levels mix in the trend, changes remove it.',
          3: `With 30 days, r = ${fx(oSign, 2)} is not significant on its own, and a positive correlation is still a correlation; the mechanism is that warm days bring customers.`,
        },
      },
    ],
  },
  {
    id: 'b05-cause-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Each statement describes a correlation. Choose the explanation, other than cause, that fits it best.',
    items: [
      'Towns with more fire engines have more fire damage each year; bigger towns have more of both.',
      'Shops that hired a security guard this year had more thefts last year than shops that didn’t.',
      'A company’s headcount and the price of coffee both rose steadily over ten years and correlate at 0.95.',
      'Among startups featured in a magazine’s “success stories”, founders’ age and growth rate are unrelated, so age doesn’t matter.',
      'Of 60 menu items tested against weekly profit, 3 were significant at 5%.',
    ],
    categories: ['Confounding', 'Reverse causation', 'Common trend', 'Selection', 'Chance'],
    answer: [0, 1, 2, 3, 4],
    hints: ['Ask: is there a common cause; did the outcome come first; do both just drift over time; how were the rows chosen; how many tests were run?'],
    feedback: {
      1: 'The thefts came first and prompted the hiring: the outcome drives the supposed cause.',
      3: 'Only survivors are featured; the failed startups, which could show a link, are missing.',
      4: 'With 60 tests at 5%, about 3 would pass by chance alone.',
    },
    solution: 'Town size confounds fire engines and damage. Thefts led to hiring (reverse causation). Headcount and coffee prices share an upward trend. Featuring only successes selects the rows (survivorship). Three of 60 tests is what chance produces (60 × 0.05 = 3).',
  },
  {
    id: 'b05-cause-g3', type: 'mc', kind: 'applied',
    prompt: 'On hot days Harbourside sells a far higher share of iced drinks (r = 0.94 between the high and the iced share). Ana wants to order ice and cold cups using the weather forecast. Does she need to establish that heat causes iced-drink sales first?',
    options: [
      'No: forecasting needs only a stable association, and she isn’t trying to change the weather.',
      'Yes: acting on any correlation without a randomised experiment risks being fooled by a confounder.',
      'Yes: the correlation could be reverse causation, with iced-drink sales raising the temperature outside.',
      'No: a correlation as high as 0.94 is strong enough to prove that heat causes iced-drink sales.',
    ],
    answer: 0,
    hints: ['Is she changing x to change y, or using x to anticipate y?'],
    feedback: {
      1: 'For prediction, a confounded but stable correlation still predicts. Experiments matter when you change x to change y.',
      2: 'Sales can’t change the weather, so reverse causation is ruled out by timing and sense; but she doesn’t need cause anyway.',
      3: 'Strength alone never proves cause. She simply doesn’t need cause for this decision.',
    },
    solution: 'Ordering by forecast is prediction: as long as hot days keep going with iced drinks, the forecast tells her what to stock, whatever the mechanism. Causal evidence is needed when she plans to change x in order to change y.',
  },
  {
    id: 'b05-cause-g4', type: 'num', kind: 'numerical',
    prompt: 'A retailer slices its loyalty data into 25 customer segments and tests in each whether a new app feature goes with a higher basket value, at α = 0.05. If the feature had no link with basket value in any segment, how many segments would show a significant result on average?',
    answer: 1.25, check: () => 25 * 0.05, unit: 'segments', places: 2, tol: 0.005,
    wrong: [
      { value: 0.72, say: 'That is the chance of at least one false alarm, 1 − 0.95²⁵. The question asks for the average number.' },
      { value: 0.05, say: 'That is the chance for one segment. Across 25 segments, multiply: 25 × 0.05.' },
    ],
    hints: ['Each test is a false alarm with probability α when there is nothing to find.', '25 × 0.05.'],
    solution: '25 × 0.05 = 1.25 segments on average, and the chance of at least one is 1 − 0.95²⁵ ≈ 0.72 (if the tests were independent). One or two “segments where the feature works” is what noise produces.',
  },
];

export const independent = [
  {
    id: 'b05-cause-i1', type: 'mc', kind: 'applied',
    prompt: 'A hospital group finds that patients who spend more days in intensive care are more likely to die (r = 0.40). A board member proposes cutting intensive-care stays to save lives. What is the most likely flaw in the reasoning?',
    options: [
      'The sickest patients are kept in intensive care longest, so severity drives both stay and death.',
      'An r of 0.40 is too weak to support any decision about patient care at all, however it arose.',
      'Deaths come before discharge from intensive care, so the timing makes any causal link between the two impossible.',
      'The board member should have used Spearman’s ρ instead, since days in intensive care are counted in whole numbers.',
    ],
    answer: 0,
    feedback: {
      1: 'Strength isn’t the problem; even a strong correlation could arise the same way.',
      2: 'Timing doesn’t rule out an effect of intensive care on death; the issue is that severity determines the stay.',
      3: 'The choice of coefficient doesn’t address why the two go together.',
    },
    solution: 'Doctors decide the length of stay from how ill the patient is, and illness also drives death: confounding by severity, with an element of reverse causation (worsening patients stay longer). Cutting stays would not remove the severity that produces the deaths.',
  },
  {
    id: 'b05-cause-i2', type: 'multi', kind: 'conceptual',
    prompt: 'Ana believes extra peak baristas shorten waits. Select all the pieces of evidence that would strengthen a causal reading.',
    options: [
      'Waits shorten on days when, by a random draw, an extra barista hour was added.',
      'Waits rise step by step as transactions per barista hour increase.',
      'The negative link at a given level of trade appears in both cafés and in separate months.',
      'Over all days, barista hours and waits correlate at +0.53 with a p-value below 0.001.',
      'The managers rostered extra baristas on the days they expected the longest queues.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The simple correlation points the other way and is driven by busy days; its small p-value addresses only chance.',
      4: 'That is why the log is confounded; it weakens, not strengthens, a causal reading of the raw data.',
    },
    solution: 'A randomised trial (experiment), a gradient (dose–response) and consistency across cafés and months all support cause. The raw +0.53 is confounded, and rostering by expected queues is the source of the confounding.',
  },
  {
    id: 'b05-cause-i3', type: 'short', kind: 'applied',
    prompt: `Rewrite this sentence from a draft report so that it says only what the evidence supports: “Our data prove that loyalty-app members drive sales: the two correlate at ${fx(memSales)} from March to July.” (Members, a running total, and daily sales both rise through the spring at Harbourside.)`,
    rubric: [
      'Describes an association, not a cause (no “prove”, “drive”).',
      'Names the shared trend over the spring as an explanation that hasn’t been ruled out.',
      'Gives the size of the correlation and the period it covers.',
      'Says what analysis or study would test a causal link (changes rather than levels, or a trial).',
    ],
    model: `From March to July, Harbourside’s loyalty-app members and its daily sales rose together (r = ${fx(memSales)}), but both were growing over the period, so the correlation mostly reflects the shared trend. Comparing weekly changes, or offering the app to randomly chosen customers, would show whether members add to sales.`,
    solution: 'A good rewrite replaces “prove” and “drive” with the language of association, gives r and the period, names the shared spring trend, and says what would test the causal claim.',
  },
  {
    id: 'b05-cause-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is a natural experiment for the question “does rain lower Harbourside’s weekday sales?”',
    options: [
      'Comparing dry and heavily rainy weekdays, since nobody at the café decides when it rains.',
      'Comparing days the manager rostered fewer baristas with days she rostered more of them.',
      'Comparing Harbourside’s festival days with the ordinary days just before them.',
      'Comparing the café’s first month of sales with its last month of the year.',
    ],
    answer: 0,
    feedback: {
      1: 'The roster is chosen by the manager from expected trade, so it is confounded with the outcome.',
      2: 'Festivals don’t vary the rain, and there are only five of them, on weekends and holidays, so they say nothing about rainy weekdays.',
      3: 'That mixes in the café’s growth and the season: a before–after comparison with a trend.',
    },
    solution: 'Nobody at the café chooses when it rains, so comparing weekdays with heavy rain and dry weekdays is a natural experiment, provided the wet days are otherwise like the dry ones (check that they fall across the seasons). Harbourside’s weekdays with a quarter-inch of rain or more averaged about $90 less in sales.',
  },
  {
    id: 'b05-cause-i5', type: 'order', kind: 'applied',
    prompt: 'Put the steps of Ana’s barista trial in order.',
    items: [
      'State the question and the measure: does an extra peak barista hour shorten the peak wait, in minutes?',
      'Check the number of days needed to detect the smallest saving worth the wage cost.',
      'Draw at random, for each weekday at each café, whether it gets the extra hour.',
      'Run the roster as assigned and record the waits in the log.',
      'Compare mean waits on extra-hour and normal days with Welch’s t test and a 95% interval.',
      'Report the effect in minutes per extra hour, with its interval and the period it covers.',
    ],
    solution: 'Question and measure first, then the size of the trial, then random assignment before anyone sees the days, then running it as assigned, then the planned analysis, then a report that states the effect and its limits.',
  },
];

export const check = [
  {
    id: 'b05-cause-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does assigning a change at random allow a causal conclusion that a correlation in observational data does not?',
    options: [
      'Chance decides who gets the change, so other influences, measured or not, balance out between the groups on average.',
      'Random assignment makes the sample larger, so that the test has enough power to detect even a small but real effect of the change.',
      'Random assignment guarantees that the two groups are identical in every way, so no statistical test is needed afterwards at all.',
      'Random assignment removes measurement error from the outcome, so the correlation becomes exactly the effect.',
    ],
    answer: 0,
    feedback: {
      1: 'Sample size is a separate matter; random assignment is about who gets the change, not how many units there are.',
      2: 'The groups differ by chance, which is exactly what the significance test allows for.',
      3: 'Measurement error is unaffected by how the change is assigned.',
    },
    solution: 'When chance alone decides which units get the change, nothing else can systematically line up with it, so confounders, including unmeasured ones, are balanced on average. A remaining difference in outcomes is then due to the change or to chance, and the test deals with chance.',
  },
  {
    id: 'b05-cause-k2', type: 'classify', kind: 'applied',
    prompt: 'For each of Ana’s plans, say whether a stable correlation is enough or whether she needs causal evidence first.',
    items: [
      'Ordering more milk for days when the forecast says it will be warm.',
      'Adding a barista hour at the peak to cut waits.',
      'Scheduling the app promotion for the warmest weeks to boost sign-ups.',
      'Warning the bank that cash takings will be lower on forecast wet days.',
    ],
    categories: ['A correlation is enough (prediction)', 'Causal evidence needed (intervention)'],
    answer: [0, 1, 1, 0],
    feedback: {
      1: 'She is changing the roster to change the wait: an intervention.',
      2: 'Timing the promotion assumes warm weather makes it work better: an intervention resting on a link that is mostly trend.',
    },
    solution: 'Milk orders and cash forecasts anticipate y from x: a stable correlation suffices. Adding baristas and timing a promotion change x (or exploit x) to change y: they need evidence that the link is causal.',
  },
  {
    id: 'b05-cause-k3', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet holds Harbourside’s 30 days in April 2027: members (running total) in B and the day’s high in C. In F1, calculate in a single formula the correlation between each day’s new members (from 2 April) and that day’s high.',
    sheet: { cells: { ...sheetOf(APR), E1: 'r(new members, high)' } },
    cell: 'F1', answer: '=CORREL(B3:B31-B2:B30,C3:C31)',
    alt: ['=CORREL(C3:C31,B3:B31-B2:B30)'],
    require: ['CORREL'],
    view: 'A1:F31', maxHeight: '20rem',
    formats: { F1: '0.000' }, widths: { A: 8, B: 22, C: 10, E: 21 },
    wrong: [
      { formula: '=CORREL(B2:B31,C2:C31)', say: 'That correlates the running totals, which mixes in the upward trend. Use the day’s change: B3:B31-B2:B30.' },
      { formula: '=CORREL(B3:B31-B2:B30,C2:C30)', say: 'That pairs each day’s new members with the previous day’s high. The highs must start in row 3, like the changes.' },
    ],
    solution: `<x>=CORREL(B3:B31-B2:B30,C3:C31)</x> subtracts each day’s total from the next day’s to get new members, and correlates them with the same days’ highs: ${neg(aSign, 3)}, against ${neg(aLevels, 3)} for the running totals. The trend inflates the levels’ correlation.`,
  },
  {
    id: 'b05-cause-k4', type: 'num', kind: 'numerical',
    prompt: 'An analyst correlates 20 independent website measures with conversion, at α = 0.05, when none is truly related to it. What is the probability that at least one comes out significant? Give two decimal places.',
    answer: Math.round((1 - 0.95 ** 20) * 100) / 100, check: () => 1 - 0.95 ** 20, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1, say: '20 × 0.05 = 1 is the expected number of false alarms, not a probability.' },
      { value: Math.round(0.95 ** 20 * 100) / 100, say: 'That is the probability that none is significant. Subtract it from 1.' },
    ],
    solution: `1 − 0.95²⁰ = 1 − ${fx(0.95 ** 20, 3)} ≈ ${fx(1 - 0.95 ** 20)}. Nearly two times in three, a set of 20 unrelated measures yields at least one “significant” correlation.`,
  },
  {
    id: 'b05-cause-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana’s evidence that extra peak baristas shorten waits includes a strong partial correlation, consistency across cafés and months, a gradient with load, a clear mechanism and the right timing. Which of Bradford Hill’s considerations would her planned randomised trial add?',
    options: ['Experiment', 'Specificity', 'Analogy', 'Strength'],
    answer: 0,
    feedback: {
      1: 'Specificity asks whether the cause is tied to one particular outcome; a trial doesn’t address it.',
      2: 'Analogy draws on similar known effects elsewhere, such as checkout queues; a trial on her cafés is direct evidence.',
      3: 'She already has strength (r = −0.72 at a given level of trade). The trial adds evidence from deliberately changing the roster.',
    },
    solution: 'Hill’s “experiment” asks whether changing the supposed cause changes the outcome. The randomised trial supplies exactly that; the other considerations she has already weighed. None is a required criterion, but a trial is the strongest single piece of evidence.',
  },
  {
    id: 'b05-cause-k6', type: 'mc', kind: 'conceptual',
    prompt: 'A partial correlation shows that, at a given level of trade, days with more barista hours had shorter waits (r = −0.72). No trial has been run. Which sentence matches the evidence?',
    options: [
      'At the same level of trade, days with more barista hours had shorter waits.',
      'Each extra barista hour cuts the peak wait at Lantern by a known number of minutes.',
      'Extra barista hours reduce waits, as this analysis of the café log has proved.',
      'Barista hours drive waiting times down at both cafés, whatever the level of trade.',
    ],
    answer: 0,
    feedback: {
      1: 'The log gives a correlation, not an effect size in minutes per hour; that needs a trial or a regression with careful controls (B06).',
      2: '“Proved” overclaims: the evidence is observational and unmeasured confounders remain possible.',
      3: '“Drive” is causal language, and “whatever the level of trade” goes beyond the data: the link is weak on quiet days.',
    },
    solution: 'Describe the association, at the level the analysis held fixed, without causal verbs. The evidence points towards a causal effect, which the report can say alongside a plan to test it.',
  },
];
