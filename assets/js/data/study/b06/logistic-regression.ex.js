// logistic-regression.ex.js — B06 · Logistic regression: widgets, practice and the knowledge check (answer keys live
// here). The October 2027 loyalty joiners come from case.js (`member`; the first 24 members for the worksheets, scored
// with the model fitted to all 225). Kestrel Gym, Northgate Water and the other businesses named are fictional. Formula
// items are marked by their results (core/sheet.js gradeFormula); num items recompute their answers in `check`.
import { member, DERIVED as D, MEMBERS, MEMBER_COLUMNS } from './case.js?v=26';
import { confusion } from '../../../core/classify.js?v=26';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const neg = (v, d = 2) => `${v < 0 ? '−' : ''}${fx(Math.abs(v), d)}`;
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const sig = (e) => 1 / (1 + Math.exp(-e));

const M = D.returnModel;
const B = M.coefs.map((c) => c.estimate), SE = M.coefs.map((c) => c.se);
const c = (name) => M.coefs.find((k) => k.name === name);
const y = member('returned');
const XS = { Near: member('near'), Notifications: member('notifications'), 'First ticket ($)': member('first_ticket'), Millbrook: member('millbrook'), Weekend: member('weekend') };

// ---------------------------------------------------------------- worksheet: the first 24 October joiners
const N = 24, last = N + 1;
const mAt = (n) => MEMBER_COLUMNS.indexOf(n);
const rowsW = MEMBERS.slice(0, N);
const wk = member('weekend').slice(0, N), mb = member('millbrook').slice(0, N);
const W = { near: rowsW.map((r) => r[mAt('near')]), notif: rowsW.map((r) => r[mAt('notifications')]), ticket: rowsW.map((r) => r[mAt('first_ticket')]), mill: mb, wkend: wk, ret: rowsW.map((r) => r[mAt('returned')]) };
const r4 = (v) => Math.round(v * 10000) / 10000;
const coefCells = { J1: 'Term', K1: 'Coefficient', J2: 'Intercept', J3: 'Near', J4: 'Notifications', J5: 'First ticket ($)', J6: 'Millbrook', J7: 'Weekend', ...col('K', 2, B.map(r4)) };
const memberCells = { A1: 'Member', B1: 'Near', C1: 'Notifications', D1: 'First ticket ($)', E1: 'Millbrook', F1: 'Weekend', G1: 'Returned',
  ...col('A', 2, rowsW.map((r) => r[mAt('member')])), ...col('B', 2, W.near), ...col('C', 2, W.notif), ...col('D', 2, W.ticket), ...col('E', 2, W.mill), ...col('F', 2, W.wkend), ...col('G', 2, W.ret), ...coefCells };
const probFormula = (i) => `=1/(1+EXP(-($K$2+$K$3*B${i}+$K$4*C${i}+$K$5*D${i}+$K$6*E${i}+$K$7*F${i})))`;
const probCells = col('H', 2, rowsW.map((_, i) => probFormula(i + 2)));
const Bq = B.map(r4);
const wProb = rowsW.map((_, i) => sig(Bq[0] + Bq[1] * W.near[i] + Bq[2] * W.notif[i] + Bq[3] * W.ticket[i] + Bq[4] * W.mill[i] + Bq[5] * W.wkend[i]));
const wT = confusion(W.ret, wProb, 0.5);
const wRet = W.ret.reduce((s, v) => s + v, 0);
const wMax = wProb.indexOf(Math.max(...wProb));

// ---------------------------------------------------------------- odds-ratio sheet
const orCells = { A1: 'Term', B1: 'Coefficient', C1: 'SE', D1: 'Odds ratio', E1: '95% lower', F1: '95% upper', ...col('A', 2, M.coefs.slice(1).map((k) => k.name)), ...col('B', 2, B.slice(1).map(r4)), ...col('C', 2, SE.slice(1).map(r4)), ...col('D', 2, M.coefs.slice(1).map((_, i) => `=EXP(B${i + 2})`)) };

// ---------------------------------------------------------------- fictional numbers
const KG = { full: -412.6, reduced: -419.9, drop: 2 };              // Kestrel Gym churn models
const SUB = { tp: 150, fn: 50, tn: 210, fp: 90 };                   // Northgate Water's renewal model (fictional)
const CH = { b: -0.62, se: 0.24 };                                  // a fictional churn coefficient
const pA = sig(B[0] + B[1] * 1 + B[2] * 1 + B[3] * 7 + B[4] * 0 + B[5] * 1);
const pK0 = sig(B[0] + B[2] * 0 + B[3] * 4 + B[4] * 1), pK2 = sig(B[0] + B[2] * 0 + B[3] * 6 + B[4] * 1);

export const widgets = {
  'logit-curve': {
    type: 'formula',
    title: 'The logistic curve',
    intro: 'The model is log-odds = b₀ + b₁x. Set the intercept, the slope and the x at which to read off the probability. The starting values are close to Ana’s first-ticket model with the other predictors at 0.',
    inputs: [
      { id: 'b0', label: 'Intercept b₀', min: -6, max: 6, step: 0.1, value: -2.8, fmt: 'num' },
      { id: 'b1', label: 'Slope b₁', min: -2, max: 2, step: 0.05, value: 0.4, fmt: 'num' },
      { id: 'x', label: 'x', min: 0, max: 15, step: 0.5, value: 5, fmt: 'num' },
    ],
    compute: (v) => {
      const eta = v.b0 + v.b1 * v.x, pr = sig(eta), xs = Array.from({ length: 31 }, (_, k) => k * 0.5);
      return {
        headline: { label: `Probability at x = ${fx(v.x, 1)}`, value: fx(pr, 3) },
        rows: [['Log-odds b₀ + b₁x', neg(eta, 2)], ['Odds e^(log-odds)', pr > 0.9999 ? 'over 9,999' : fx(Math.exp(eta), 3)], ['Odds ratio for one more unit of x, e^b₁', fx(Math.exp(v.b1), 3)], ['Probability one unit higher', fx(sig(eta + v.b1), 3)]],
        note: Math.abs(v.b1) < 0.025 ? 'With a slope near 0 the curve is flat: x makes no difference to the probability.' : `Each unit of x multiplies the odds by ${fx(Math.exp(v.b1), 2)}; the probability changes fastest where it is near 0.5${v.b1 !== 0 ? `, at x = ${fx(-v.b0 / v.b1, 1)}` : ''}.`,
        chart: { kind: 'line', x: { label: 'x', values: xs }, series: [{ name: 'Probability', values: xs.map((t) => sig(v.b0 + v.b1 * t)) }], y: { label: 'Probability of yes' } },
      };
    },
  },
  'logit-members': {
    type: 'logistic',
    title: 'Returning within 30 days: October’s 225 new members',
    y: { name: 'Returned within 30 days', values: y, yes: 'returned', no: 'didn’t return' },
    xs: XS, axis: 'First ticket ($)', binary: ['Near', 'Notifications', 'Millbrook', 'Weekend'], threshold: 0.5,
    show: ['coefs', 'odds', 'lr', 'table'],
    note: 'Observational data: members chose notifications themselves, so its odds ratio describes members who chose them, not the effect of switching them on.',
  },
};

export const guided = [
  {
    id: 'b06-logit-g1', type: 'steps', kind: 'numerical',
    prompt: `The worksheet holds the first ${N} October joiners and, in K2:K7, the coefficients of Ana’s model fitted to all 225.`,
    solution: `H2: <x>${probFormula(2)}</x>, filled down. At a threshold of 0.5 the model predicts ${wT.tp + wT.fp} of these ${N} to return; ${wT.tp} of them did (<x>=COUNTIFS(H2:H${last},">="&K9,G2:G${last},1)</x>). Its accuracy here is ${wT.tp + wT.tn} of ${N}, against ${Math.max(wRet, N - wRet)} for always guessing the commoner outcome.`,
    steps: [
      {
        id: 'b06-logit-g1-s1', type: 'formula',
        prompt: 'In H2, calculate the first member’s predicted probability of returning, so that the formula fills down to every member.',
        sheet: { cells: { ...memberCells, H1: 'Probability' } },
        cell: 'H2', fill: `H2:H${last}`, answer: probFormula(2),
        alt: ['=EXP($K$2+$K$3*B2+$K$4*C2+$K$5*D2+$K$6*E2+$K$7*F2)/(1+EXP($K$2+$K$3*B2+$K$4*C2+$K$5*D2+$K$6*E2+$K$7*F2))'],
        view: `A1:K${last}`, maxHeight: '20rem', formats: { H: '0.000', K: '0.0000' }, widths: { A: 9, B: 6, C: 13, D: 14, E: 10, F: 9, G: 9, H: 11, J: 15 },
        wrong: [
          { formula: '=$K$2+$K$3*B2+$K$4*C2+$K$5*D2+$K$6*E2+$K$7*F2', say: 'That is the log-odds. Turn it into a probability with 1 ÷ (1 + e^−(log-odds)).' },
          { formula: '=1/(1+EXP($K$2+$K$3*B2+$K$4*C2+$K$5*D2+$K$6*E2+$K$7*F2))', say: 'The exponent needs a minus sign: p = 1 ÷ (1 + e^−(log-odds)). Without it you get the probability of not returning.' },
          { formula: '=1/(1+EXP(-(K2+K3*B2+K4*C2+K5*D2+K6*E2+K7*F2)))', say: 'The coefficients must stay put as the formula fills down: lock them with dollar signs ($K$2 …).' },
        ],
        hints: ['First the log-odds: intercept + each coefficient × the member’s value. Then p = 1 ÷ (1 + e^−(log-odds)).', `<x>${probFormula(2)}</x>`],
      },
      {
        id: 'b06-logit-g1-s2', type: 'formula',
        prompt: 'Column H now holds the probabilities, and K9 the threshold. In K10, count the members predicted to return (probability at or above the threshold) who did return.',
        sheet: { cells: { ...memberCells, H1: 'Probability', ...probCells, J9: 'Threshold', K9: 0.5, J10: 'True positives' }, vary: { K9: [0.45, 0.55, 0.6] } },
        cell: 'K10', answer: `=COUNTIFS(H2:H${last},">="&K9,G2:G${last},1)`, alt: [`=COUNTIFS(G2:G${last},1,H2:H${last},">="&K9)`], require: ['COUNTIFS'],
        view: `A1:K${last}`, maxHeight: '20rem', formats: { H: '0.000', K: '0.0000', K9: '0.00', K10: '0' }, widths: { A: 9, B: 6, C: 13, D: 14, E: 10, F: 9, G: 9, H: 11, J: 15 },
        wrong: [
          { formula: `=COUNTIF(H2:H${last},">="&K9)`, say: 'That counts everyone predicted to return, true and false positives together. Add the condition that G is 1.' },
          { formula: `=COUNTIFS(H2:H${last},">=0.5",G2:G${last},1)`, say: 'Refer to the threshold cell, ">="&K9, so the count updates when Ana changes the threshold.' },
        ],
        hints: ['Two conditions: H at least the threshold, and G equal to 1.', `<x>=COUNTIFS(H2:H${last},">="&K9,G2:G${last},1)</x>`],
      },
      {
        id: 'b06-logit-g1-s3', type: 'mc',
        prompt: `At 0.5 the model classifies ${wT.tp + wT.tn} of these ${N} members correctly. ${wRet} of the ${N} returned. How should Ana judge that?`,
        options: [
          `Against always guessing the commoner outcome (${Math.max(wRet, N - wRet)} right), bearing in mind these members were in the fitting data.`,
          `As ${fx((wT.tp + wT.tn) / N * 100, 0)}% accuracy, which is good because it is above 50%.`,
          'As proof the model works, since it was fitted by maximum likelihood.',
          'By the number of members predicted to return, which for a well-fitted model should equal the number who actually returned.',
        ],
        answer: 0,
        hints: ['What would a rule with no model score on these members?'],
        feedback: {
          1: '50% is not the benchmark. Always guessing the commoner outcome needs no model and is the score to beat.',
          2: 'Maximum likelihood finds the best coefficients for the data; it says nothing about how well they classify new members.',
          3: 'A model can predict the right number of returns and still pick the wrong members.',
        },
      },
    ],
  },
  {
    id: 'b06-logit-g2', type: 'num', kind: 'numerical',
    prompt: 'A member’s predicted log-odds of returning are −0.40. What is the predicted probability? Give three decimal places.',
    answer: Math.round(sig(-0.4) * 1000) / 1000, check: () => 1 / (1 + Math.exp(0.4)), places: 3, tol: 0.0015, unit: '',
    wrong: [{ value: Math.round(Math.exp(-0.4) * 1000) / 1000, say: 'e^−0.40 = 0.670 is the odds. The probability is odds ÷ (1 + odds).' }, { value: Math.round(sig(0.4) * 1000) / 1000, say: 'That is the probability for log-odds of +0.40. With negative log-odds the probability is below 0.5.' }],
    hints: ['Odds = e^(log-odds).', 'p = odds ÷ (1 + odds) = 0.670 ÷ 1.670.'],
    solution: `Odds e^−0.40 = ${fx(Math.exp(-0.4), 3)}; p = ${fx(Math.exp(-0.4), 3)} ÷ ${fx(1 + Math.exp(-0.4), 3)} = ${fx(sig(-0.4), 3)}. Negative log-odds always mean a probability below one half.`,
  },
  {
    id: 'b06-logit-g3', type: 'mc', kind: 'numerical',
    prompt: `In Ana’s model the odds ratio for each extra dollar on the first ticket is ${fx(c('First ticket ($)').or)}. What is the odds ratio for a first ticket $2 larger, holding the other predictors fixed?`,
    options: [
      `About ${fx(c('First ticket ($)').or ** 2)}: e^(2b), the square of the one-dollar odds ratio.`,
      `About ${fx(2 * c('First ticket ($)').or)}: twice the one-dollar odds ratio, since the change in ticket is twice as big.`,
      `About ${fx(1 + 2 * (c('First ticket ($)').or - 1))}: two steps of ${fx((c('First ticket ($)').or - 1) * 100, 0)}% each, added together to give the whole change.`,
      'It can’t be worked out without knowing the member’s values on the other four predictors.',
    ],
    answer: 0,
    hints: ['Each dollar adds b to the log-odds, so two dollars add 2b.', 'Adding on the log scale is multiplying on the odds scale.'],
    feedback: {
      1: 'Odds ratios multiply, they don’t add up by doubling: e^(2b) = (e^b)².',
      2: 'Percentage changes compound: two steps of 49% give 1.49 × 1.49, not 1 + 0.98.',
      3: 'On the odds scale the model has the same ratio whatever the other values; it is the change in probability that depends on them.',
    },
    solution: `Two dollars add 2 × ${fx(c('First ticket ($)').estimate, 3)} = ${fx(2 * c('First ticket ($)').estimate, 3)} to the log-odds, so the odds ratio is e^${fx(2 * c('First ticket ($)').estimate, 3)} = ${fx(c('First ticket ($)').or ** 2)} = ${fx(c('First ticket ($)').or)}².`,
  },
  {
    id: 'b06-logit-g4', type: 'num', kind: 'numerical',
    prompt: 'Kestrel Gym (fictional) models whether members cancel. Its full model has log-likelihood −412.6; without two predictors (class bookings and the membership plan) it has −419.9. Calculate the likelihood-ratio statistic for dropping the two. Give one decimal place.',
    answer: Math.round(2 * (KG.full - KG.reduced) * 10) / 10, check: () => 2 * (-412.6 + 419.9), places: 1, tol: 0.05, unit: '',
    wrong: [{ value: Math.round((KG.full - KG.reduced) * 10) / 10, say: 'Double the difference in log-likelihoods: G = 2(ℓ_full − ℓ_reduced).' }, { value: -14.6, say: 'Full minus reduced, not the other way round: the fuller model always has the higher (less negative) log-likelihood, so G is positive.' }],
    hints: ['G = 2(ℓ_full − ℓ_reduced).', '2 × (−412.6 − (−419.9)).'],
    solution: `G = 2 × (−412.6 + 419.9) = ${fx(2 * (KG.full - KG.reduced), 1)} on 2 degrees of freedom. <x>=CHISQ.DIST.RT(14.6,2)</x> = ${fx(Math.exp(-14.6 / 2), 4)}: dropping the two predictors loses clearly more fit than chance would.`,
  },
];

export const independent = [
  {
    id: 'b06-logit-i1', type: 'formula', kind: 'numerical',
    prompt: 'The worksheet lists the five coefficients of Ana’s model with their standard errors, and the odds ratios in D. In E2, calculate the lower limit of the 95% interval for the first odds ratio, so that the formula fills down to E6.',
    sheet: { cells: { ...orCells } },
    cell: 'E2', fill: 'E2:E6', answer: '=EXP(B2-1.96*C2)', alt: ['=D2/EXP(1.96*C2)', '=D2*EXP(-1.96*C2)'], require: ['EXP'],
    view: 'A1:F6', formats: { B: '0.0000', C: '0.0000', D: '0.00', E: '0.00', F: '0.00' }, widths: { A: 16, B: 12, C: 10, D: 11, E: 11, F: 11 },
    wrong: [
      { formula: '=D2-1.96*C2', say: 'The interval is built on the log-odds scale, b ± 1.96 SE, and then exponentiated. Subtracting the SE from the odds ratio mixes the two scales.' },
      { formula: '=EXP(B2)-1.96*C2', say: 'Exponentiate the whole limit: EXP(B2 − 1.96 × C2).' },
      { formula: '=EXP(B2-1.645*C2)', say: '1.645 gives a 90% interval. For 95% use 1.96.' },
    ],
    solution: `<x>=EXP(B2-1.96*C2)</x>, and in F2 <x>=EXP(B2+1.96*C2)</x>. For notifications: e^(${fx(c('Notifications').estimate, 3)} − 1.96 × ${fx(c('Notifications').se, 3)}) = ${fx(c('Notifications').orLow)} to ${fx(c('Notifications').orHigh)}. The interval isn’t symmetric about the odds ratio, ${fx(c('Notifications').or)}, because it was symmetric on the log scale.`,
  },
  {
    id: 'b06-logit-i2', type: 'num', kind: 'numerical',
    prompt: 'Using Ana’s model (coefficients in the lesson’s table), find the predicted probability of returning for a member who lives nearby, joined at Harbourside on a weekend, turned notifications on and spent $7.00 on the first visit. Give three decimal places.',
    answer: Math.round(pA * 1000) / 1000, check: () => M.predict([1, 1, 7, 0, 1]), places: 3, tol: 0.003, unit: '',
    wrong: [{ value: Math.round((B[0] + B[1] + B[2] + 7 * B[3] + B[5]) * 1000) / 1000, say: 'That is the log-odds. Convert it: p = 1 ÷ (1 + e^−(log-odds)).' }],
    solution: `Log-odds: −2.842 + 0.339 + 0.926 + 0.401 × 7 − 0.489 = ${fx(B[0] + B[1] + B[2] + 7 * B[3] + B[5], 3)} (Millbrook = 0). p = 1 ÷ (1 + e^−${fx(B[0] + B[1] + B[2] + 7 * B[3] + B[5], 3)}) = ${fx(pA, 3)}.`,
  },
  {
    id: 'b06-logit-i3', type: 'num', kind: 'numerical',
    prompt: 'Northgate Water (fictional) predicts which business customers will renew their service contract. At its chosen threshold: 150 renewers were predicted to renew, 50 renewers were predicted not to, 210 non-renewers were predicted not to renew and 90 were predicted to. What is the model’s sensitivity for renewal, as a percentage?',
    answer: 75, check: () => SUB.tp / (SUB.tp + SUB.fn) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: SUB.tn / (SUB.tn + SUB.fp) * 100, say: 'That is the specificity, the share of non-renewers correctly cleared. Sensitivity is TP ÷ (TP + FN) among the renewers.' }, { value: Math.round(SUB.tp / (SUB.tp + SUB.fp) * 1000) / 10, say: 'That is the precision: of those predicted to renew, the share who did. Sensitivity divides by everyone who actually renewed.' }],
    solution: 'Sensitivity = TP ÷ (TP + FN) = 150 ÷ 200 = 75%. Specificity = 210 ÷ 300 = 70%; accuracy = 360 ÷ 500 = 72%, against 60% for always guessing “won’t renew” (300 of 500).',
  },
  {
    id: 'b06-logit-i4', type: 'mc', kind: 'applied',
    prompt: 'A fictional card issuer’s fraud model is 97% accurate on last year’s transactions. 2% of transactions were fraudulent. What should a reviewer conclude first?',
    options: [
      'It is less accurate than never flagging fraud, which would be right 98% of the time.',
      'The model is excellent, since 97% is far above the 50% that random guessing would score.',
      'The model must catch 97% of frauds.',
      'The model is about 1 percentage point short of perfect, so it needs only small improvements.',
    ],
    answer: 0,
    feedback: {
      1: 'With a rare outcome, the base-rate rule scores very high without any model. Compare with 98%, not 50%.',
      2: 'Accuracy mixes the two kinds of case; the share of frauds caught is the sensitivity, which could be far lower.',
      3: 'Perfect is 100%, but the bar any useful model must clear is the base rate’s 98%.',
    },
    solution: 'Always predicting “not fraud” is right 98% of the time. A 97% accurate model is worse than that on accuracy; whether it is useful depends on how many frauds it catches (sensitivity) and how many good transactions it stops.',
  },
  {
    id: 'b06-logit-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Ana’s model gives notifications an odds ratio of 2.52 (95% CI 1.43 to 4.47), holding distance, first ticket, café and weekend fixed. Members chose the setting themselves. Select all the statements the evidence supports.',
    options: [
      'Members with notifications on had higher odds of returning than otherwise similar members with them off.',
      'The association is unlikely to be chance alone.',
      'Switching notifications on for a member would multiply their odds of returning by about 2.5.',
      'A member with notifications on is about 2.5 times as likely to return.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'Members chose the setting, so keener members may have chosen it. Only a randomised test would measure the effect of switching it on.',
      3: 'An odds ratio is not a probability ratio: from 0.30 the probability rises to 0.52, 1.7 times; from 0.83 to 0.92.',
    },
    solution: 'The odds ratio is an association, holding the other four predictors fixed, and its interval excludes 1. It is not a causal effect (self-selection) and not a ratio of probabilities.',
  },
  {
    id: 'b06-logit-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Why is an ordinary least-squares line a poor model for a 0/1 outcome such as returning?',
    options: [
      'It can predict probabilities below 0 or above 1, and it assumes each predictor shifts the probability by the same amount at every level.',
      'Least squares can’t be calculated when y takes only two values.',
      'Its slopes are always zero for a 0/1 outcome.',
      'It requires the predictors to be 0/1 as well.',
    ],
    answer: 0,
    feedback: {
      1: 'It can be calculated: Ana’s linear probability model has slopes and a fitted value for every member, one of them 1.025.',
      2: 'The slopes are the changes in the share of 1s; for the first ticket about 0.09 per dollar.',
      3: 'Any predictors can be used; the trouble is the outcome.',
    },
    solution: 'A line has no floor or ceiling, so it predicts impossible values (1.025 for one October member), and its constant slope ignores that probabilities must flatten near 0 and 1. The logistic model fixes both.',
  },
];

export const check = [
  {
    id: 'b06-logit-k1', type: 'mc', kind: 'conceptual',
    prompt: `The weekend coefficient in Ana’s model is ${neg(c('Weekend').estimate, 3)}, an odds ratio of ${fx(c('Weekend').or)}. What does that mean?`,
    options: [
      `Weekend joiners had about ${fx((1 - c('Weekend').or) * 100, 0)}% lower odds of returning than similar weekday joiners.`,
      `Members who joined at a weekend were ${fx(-c('Weekend').estimate * 100, 1)} percentage points less likely to return than weekday joiners.`,
      `Members who joined at a weekend had ${fx(c('Weekend').or * 100, 0)}% lower odds of returning than weekday joiners.`,
      'Joining at a weekend makes members less likely to return.',
    ],
    answer: 0,
    feedback: {
      1: 'The coefficient is on the log-odds scale, not in percentage points of probability.',
      2: `An odds ratio of ${fx(c('Weekend').or)} means the odds are ${fx(c('Weekend').or * 100, 0)}% as large, that is ${fx((1 - c('Weekend').or) * 100, 0)}% lower.`,
      3: 'That is causal language, and the coefficient isn’t even statistically clear (its interval includes an odds ratio of 1).',
    },
    solution: `e^${neg(c('Weekend').estimate, 3)} = ${fx(c('Weekend').or)}: weekend joiners’ odds were about ${fx((1 - c('Weekend').or) * 100, 0)}% lower, holding the other predictors fixed. With p = ${fx(c('Weekend').p, 3)} and an interval of ${fx(c('Weekend').orLow)} to ${fx(c('Weekend').orHigh)}, the data can’t rule out no difference.`,
  },
  {
    id: 'b06-logit-k2', type: 'num', kind: 'numerical',
    prompt: 'In a fictional subscription-box company’s churn model, the coefficient for “contacted support in the first month” is −0.62 with a standard error of 0.24. Calculate the Wald z statistic. Give two decimal places.',
    answer: Math.round(CH.b / CH.se * 100) / 100, check: () => -0.62 / 0.24, places: 2, tol: 0.006, unit: '',
    wrong: [{ value: Math.round(Math.exp(CH.b) / CH.se * 100) / 100, say: 'Use the coefficient itself, not its odds ratio: z = b ÷ SE.' }],
    solution: `z = −0.62 ÷ 0.24 = ${neg(CH.b / CH.se, 2)}; two-sided p = 2 × (1 − Φ(2.58)) ≈ 0.010. The odds ratio is e^−0.62 = ${fx(Math.exp(-0.62))}: customers who contacted support had about ${fx((1 - Math.exp(-0.62)) * 100, 0)}% lower odds of cancelling, an association that may reflect who contacts support.`,
  },
  {
    id: 'b06-logit-k3', type: 'formula', kind: 'applied',
    prompt: 'Column H holds each member’s predicted probability and K9 the threshold. In K11, calculate the specificity: the share of members who did not return (G = 0) whom the model predicts will not return (probability below the threshold).',
    sheet: { cells: { ...memberCells, H1: 'Probability', ...probCells, J9: 'Threshold', K9: 0.5, J11: 'Specificity' }, vary: { K9: [0.45, 0.55, 0.6] } },
    cell: 'K11', answer: `=COUNTIFS(H2:H${last},"<"&K9,G2:G${last},0)/COUNTIF(G2:G${last},0)`,
    alt: [`=COUNTIFS(G2:G${last},0,H2:H${last},"<"&K9)/COUNTIF(G2:G${last},0)`, `=SUMPRODUCT((H2:H${last}<K9)*(G2:G${last}=0))/COUNTIF(G2:G${last},0)`],
    view: `A1:K${last}`, maxHeight: '20rem', formats: { H: '0.000', K: '0.0000', K9: '0.00', K11: '0.0%' }, widths: { A: 9, B: 6, C: 13, D: 14, E: 10, F: 9, G: 9, H: 11, J: 15 },
    wrong: [
      { formula: `=COUNTIFS(H2:H${last},"<"&K9,G2:G${last},0)/COUNTIF(H2:H${last},"<"&K9)`, say: 'That divides by everyone predicted not to return. Specificity divides by everyone who actually didn’t return: COUNTIF(G…,0).' },
      { formula: `=COUNTIFS(H2:H${last},">="&K9,G2:G${last},1)/COUNTIF(G2:G${last},1)`, say: 'That is the sensitivity, for those who returned. Specificity is about those who didn’t.' },
      { formula: `=COUNTIFS(H2:H${last},"<"&K9,G2:G${last},0)/${N}`, say: 'Divide by the number of non-returners, not by all members.' },
    ],
    solution: `<x>=COUNTIFS(H2:H${last},"<"&K9,G2:G${last},0)/COUNTIF(G2:G${last},0)</x>. At 0.5: ${wT.tn} of the ${N - wRet} non-returners, ${fx(wT.tn / (N - wRet) * 100, 1)}%. Raise the threshold and specificity rises while sensitivity falls.`,
  },
  {
    id: 'b06-logit-k4', type: 'mc', kind: 'applied',
    prompt: 'Ana’s model says members with notifications on had 2.5 times the odds of returning. A manager proposes turning notifications on by default for all new members, citing the model. What should Ana advise?',
    options: [
      'Test it first, by switching the default on for a random half of new members: the model can’t separate notifications from keenness.',
      'Go ahead: an odds ratio of 2.5 with p = 0.001 shows notifications cause members to return.',
      'Don’t do it: the model’s McFadden R² is only 0.075, so none of its coefficients, notifications included, can be trusted for a decision.',
      'Go ahead, but expect returns to rise from 54% to 2.5 × 54% = 135% of members.',
    ],
    answer: 0,
    feedback: {
      1: 'A small p-value says the association is unlikely to be chance; it can’t say the association is causal.',
      2: 'A low pseudo-R² means individual returns are hard to predict, not that the coefficients are wrong. The problem is self-selection.',
      3: 'An odds ratio doesn’t multiply probabilities, and no probability exceeds 100%.',
    },
    solution: 'The association is clear, but it comes from members who chose the setting. A randomised default would measure the effect directly, and cheaply, before the cafés commit to it.',
  },
  {
    id: 'b06-logit-k5', type: 'num', kind: 'numerical',
    prompt: 'A Millbrook member who lives further away joined on a weekday with notifications off and spent $4.00 on the first visit. By how many percentage points does Ana’s model raise the predicted probability of returning for a first ticket of $6.00 instead? Give one decimal place.',
    answer: Math.round((pK2 - pK0) * 1000) / 10, check: () => (M.predict([0, 0, 6, 1, 0]) - M.predict([0, 0, 4, 1, 0])) * 100, unit: 'percentage points', places: 1, tol: 0.15,
    wrong: [{ value: Math.round(2 * c('First ticket ($)').estimate * 1000) / 10, say: 'That treats 2b as a change in probability. Compute both probabilities and subtract.' }],
    solution: `At $4.00: log-odds −2.842 + 0.401 × 4 + 0.847 = ${fx(B[0] + 4 * B[3] + B[4], 3)}, p = ${fx(pK0, 3)}. At $6.00: log-odds ${fx(B[0] + 6 * B[3] + B[4], 3)}, p = ${fx(pK2, 3)}. Difference: ${fx((pK2 - pK0) * 100, 1)} percentage points. The odds ratio for $2, ${fx(c('First ticket ($)').or ** 2)}, is the same for every member; the change in probability is not.`,
  },
  {
    id: 'b06-logit-k6', type: 'classify', kind: 'conceptual',
    prompt: 'For each statement about Ana’s classification of new members, say whether it is true or false.',
    items: [
      'Lowering the threshold from 0.5 to 0.4 flags more members as likely to return and raises the sensitivity.',
      'The threshold that maximises accuracy is always the right one to use.',
      'A classification table built on the same members the model was fitted to tends to overstate its performance.',
      'Always predicting “returns” would be right for 53.8% of October’s joiners.',
    ],
    categories: ['True', 'False'],
    answer: [0, 1, 0, 0],
    feedback: {
      0: 'More members clear a lower bar, so more of those who returned are flagged (86.0% against 72.7%), at the cost of specificity.',
      1: 'The right threshold depends on what each kind of error costs and on how many members staff can act on.',
      2: 'The coefficients were chosen to fit these members, so new members will usually be classified a little worse.',
      3: '121 of 225 returned: the base rate.',
    },
    solution: 'True, false, true, true. Thresholds trade sensitivity for specificity; choose one from the costs of errors; check on new data; compare with the base rate.',
  },
];
