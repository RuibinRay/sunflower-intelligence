// predicting-churn.js — M06 · Predicting churn. Content only; exercises are in predicting-churn.ex.js. The churn table
// (case.js churnTable): the 1,664 loyalty-app members who joined by 31 August 2027, described with what was known on 31
// October, and whether they visited in November–December. Logistic regression (core/regression.js), lift and gains
// (core/customer.js liftTable) and AUC (core/classify.js roc). The offer, its costs and its uplift by recency band are
// fictional assumptions, labelled as such. The project's subscriptions are not used. Every figure printed is recomputed
// in `checks`.
import { churnTable, members } from './case.js?v=28';
import * as CU from '../../../core/customer.js?v=28';
import * as R from '../../../core/regression.js?v=28';
import { roc, confusion } from '../../../core/classify.js?v=28';

const pc = (x) => x * 100;
const CT = churnTable();
const y = CT.map((c) => c.lapsed), n = y.length, nL = y.reduce((s, v) => s + v, 0), base = nL / n;
const colOf = (cs) => ({ Recency: cs.map((c) => c.recency), Frequency: cs.map((c) => c.frequency), Tenure: cs.map((c) => c.tenure), 'Spend ($)': cs.map((c) => c.monetary), Near: cs.map((c) => c.near), Notifications: cs.map((c) => c.notifications), Millbrook: cs.map((c) => c.millbrook) });
const rec = CT.map((c) => c.recency), freq = CT.map((c) => c.frequency);
const FULL = R.logistic(y, colOf(CT));
const k = (name) => FULL.coefs.find((c) => c.name === name);
const REC = R.logistic(y, { Recency: rec });
const RF = R.logistic(y, { Recency: rec, Frequency: freq });
const INT = R.logistic(y, { Recency: rec, Frequency: freq, 'Recency × frequency': rec.map((r, i) => r * freq[i]) });
const lrRest = R.lrTest(FULL, REC), lrInt = R.lrTest(INT, RF);
const pInt = (r, f) => INT.predict([r, f, r * f]);
const aucRec = roc(y, rec).auc, aucFull = roc(y, FULL.prob).auc, aucInt = roc(y, INT.prob).auc;
const { Recency: _drop, ...rest } = colOf(CT);
const aucNoRec = roc(y, R.logistic(y, rest).prob).auc;
// leakage: recency measured on 31 December instead of 31 October
const decRec = new Map(members().map((c) => [c.id, c.recency]));
const aucLeak = roc(y, CT.map((c) => decRec.get(c.id))).auc;
// recency bands
const BANDS = [[0, 7], [8, 14], [15, 30], [31, 60], [61, 90], [91, 150], [151, 300]];
const band = BANDS.map(([a, b]) => { const g = CT.filter((c) => c.recency >= a && c.recency <= b); return { a, b, n: g.length, rate: g.reduce((s, c) => s + c.lapsed, 0) / g.length }; });
// silence of 45–75 days: frequent against infrequent members
const quiet = CT.filter((c) => c.recency >= 61 && c.recency <= 90), qHi = quiet.filter((c) => c.frequency >= 7), qLo = quiet.filter((c) => c.frequency <= 2);
const rateOf = (g) => g.reduce((s, c) => s + c.lapsed, 0) / g.length;
// lift tables
const L10 = CU.liftTable(y, rec, 10), L5 = CU.liftTable(y, rec, 5);
const C5 = confusion(y, FULL.prob, 0.5);
// calibration: model quintiles
const order = [...y.keys()].sort((a, b) => FULL.prob[b] - FULL.prob[a] || a - b);
const LF5 = CU.liftTable(y, FULL.prob, 5);
let at = 0; const CAL = LF5.rows.map((r) => { const g = order.slice(at, at + r.n); at += r.n; return { n: r.n, pred: g.reduce((s, i) => s + FULL.prob[i], 0) / r.n, obs: r.rate }; });
// a fair test: fit on alternate members, score the others
const TR = CT.filter((_, i) => i % 2 === 0), TE = CT.filter((_, i) => i % 2 === 1);
const MT = R.logistic(TR.map((c) => c.lapsed), colOf(TR));
const pTE = TE.map((c) => MT.predict([c.recency, c.frequency, c.tenure, c.monetary, c.near, c.notifications, c.millbrook]));
const aucTrain = roc(TR.map((c) => c.lapsed), MT.prob).auc, aucTest = roc(TE.map((c) => c.lapsed), pTE).auc;
const LTE = CU.liftTable(TE.map((c) => c.lapsed), pTE, 10);
// the offer (fictional assumptions): uplift among would-be lapsers by recency band, cost and value
const OFFER = { cost: 1, value: 12, uplift: [0.05, 0.15, 0.06, 0.01] };   // bands: ≤30, 31–90, 91–150, 151+ days
const ob = (r) => (r <= 30 ? 0 : r <= 90 ? 1 : r <= 150 ? 2 : 3);
const listB = CT.map((_, i) => i).filter((i) => CT[i].recency >= 31 && CT[i].recency <= 90);
const listA = [...CT.keys()].sort((a, b) => CT[b].recency - CT[a].recency || a - b).slice(0, listB.length);
const lapsersIn = (G) => G.reduce((s, i) => s + y[i], 0);
const extra = (G) => G.reduce((s, i) => s + y[i] * OFFER.uplift[ob(CT[i].recency)], 0);
const profit = (G) => extra(G) * OFFER.value - G.length * OFFER.cost;
const minRecA = Math.min(...listA.map((i) => CT[i].recency));

const f3 = (x) => x.toFixed(3), f2 = (x) => x.toFixed(2), sgn = (x, d) => `${x < 0 ? '−' : ''}${Math.abs(x).toFixed(d)}`;
const pv = (p) => (p < 0.001 ? 'below 0.001' : p.toFixed(3));
const coefRow = (name, label, per = 1) => { const c = k(name); return [label, sgn(c.estimate, 4), f2(c.z), pv(c.p), per === 1 ? `${f3(c.or)} (${f3(c.orLow)} to ${f3(c.orHigh)})` : `${f3(c.or)}`]; };

export default {
  slug: 'predicting-churn',
  title: 'Predicting churn',
  blurb: 'Predict which customers will lapse from what you knew before they did. Set up calibration and holdout periods without leakage, fit a logistic regression and a simpler recency rule, judge the score with the base rate, lift, gains and AUC, and use it to choose whom to contact, knowing that the likeliest to leave are not necessarily the ones an offer would change.',
  status: 'reviewed',
  objectives: [
    'Set up a churn prediction with a calibration period for the predictors and a later holdout period for the outcome, and identify features that leak.',
    'Build and interpret a logistic regression of lapsing on recency, frequency, spend, tenure and member characteristics, and compare it with a recency-only rule.',
    'Evaluate a churn score with the base rate, a lift table, a gains curve and the AUC, on customers not used to fit it, and describe its calibration.',
    'Calculate the expected value of contacting a customer from the chance they lapse, the chance an offer changes that, the value kept and the cost.',
    'Explain why the customers most likely to churn are not necessarily those a retention offer would change, and why measuring that needs a randomised control group.',
  ],
  prerequisites: [
    { lesson: 'b06/logistic-regression', why: 'Log-odds, odds ratios, the likelihood-ratio test and classification tables against the base rate.' },
    { lesson: 'm06/retention-and-churn-rates', why: 'Lapse rules, and why a period without a purchase is not the same as a lost customer.' },
    { lesson: 'm06/survival-analysis', why: 'How long members stay, and why recent silence matters more than old activity.' },
    { lesson: 'b02/scaling', why: 'Data leakage: information a model would not have when it makes real predictions.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'On 1 November 2027 Ana wants a list. The cafés can send an app message with a small offer to members who seem to be drifting away, and she would like to send it to the members who would otherwise not come back before the new year. She has every member’s visits up to 31 October. She doesn’t yet know who will visit in November and December, but by January she will, and so she can test any rule she makes against what happened.' },

    { h: 'Before and after: calibration and holdout' },
    { p: 'A churn model learns from the past how members who later lapsed looked beforehand. That needs two periods. The <b>calibration period</b> supplies the predictors: here, each member’s recency, frequency, spend and tenure as of 31 October, with their café, whether they live or work nearby and whether notifications are on. The <b>holdout period</b> supplies the outcome: whether the member visited at all in November–December. A member with no visit in those two months has <b>lapsed</b>: the retention lesson’s 60-day rule (more than 60 days without a visit), applied on 31 December.' },
    { p: 'The table covers the 1,664 members who joined by 31 August, so that everyone has at least two months of history. Of them, 566 came back in November–December and 1,098 did not: a <g>base rate</g> of lapsing of 66.0%. Any score has to beat what that number alone says: if Ana contacted members at random, two in three would be lapsers.' },
    { callout: 'warn', title: 'Leakage', html: 'Every predictor must be something Ana could have known on 31 October. Recency measured on 31 December instead looks harmless, but it already contains the answer: a member who visited in November or December has a recency of 60 days or less on 31 December, and one who didn’t has more. It separates lapsers from returners perfectly (AUC 1.000), and it is useless on 1 November. That is <g>data leakage</g>, the same error B02 warned about in data preparation.' },

    { h: 'Recency does most of the work' },
    { p: 'The simplest rule ranks members by <g>recency</g>, how long ago they last visited. The holdout shows how strong it is: the longer a member has been silent, the likelier they are to stay away.' },
    { table: {
      caption: 'Share of members who lapsed in November–December, by days since their last visit on 31 October',
      head: ['Days since last visit', 'Members', 'Lapsed'],
      rows: band.map((g) => [g.b === 300 ? `${g.a} or more` : `${g.a}–${g.b}`, String(g.n), `${(g.rate * 100).toFixed(1)}%`]),
      align: ['l', 'r', 'r'],
      note: 'The longest silence among these members was 244 days.',
    } },
    { p: 'Of the 245 members who had visited within a week of 31 October (0–7 days), 10.2% lapsed; of the 286 silent for five months or more, 96.9%. This is what the members’ data were built to show, and what customer-base models predict generally: in a noncontractual business, a customer who has gone quiet may have stopped for good, and the longer the silence the more likely that is.' },

    { h: 'A logistic regression' },
    { p: 'Logistic regression, from B06, models the log-odds of lapsing as a linear function of the predictors. With all seven:' },
    { table: {
      caption: 'Logistic regression of lapsing in November–December (1,664 members, predictors as of 31 October)',
      head: ['Predictor', 'Coefficient', 'z', 'p-value', 'Odds ratio (95% CI)'],
      rows: [
        coefRow('Recency', 'Days since last visit'),
        coefRow('Frequency', 'Visits to date'),
        coefRow('Tenure', 'Days since joining'),
        coefRow('Spend ($)', 'Spend to date ($)'),
        coefRow('Near', 'Lives or works within a mile'),
        coefRow('Notifications', 'Notifications on'),
        coefRow('Millbrook', 'Joined at Millbrook'),
      ],
      align: ['l', 'r', 'r', 'r', 'r'],
      note: 'Intercept −1.2810. McFadden’s pseudo-R² 0.396. Against recency alone, the six other predictors together: G = 8.35 on 6 df, p = 0.214.',
    } },
    { p: 'Each extra day of silence multiplies the odds of lapsing by 1.039, holding the others fixed; 30 days multiply them by e raised to 30 times the coefficient, 3.19. None of the other six is clearly different from no association once recency is in the model, and together they add little (p = 0.214). That doesn’t mean they don’t matter: without recency, the other six still rank members with an AUC of 0.750, because frequent visitors tend to have visited recently. Recency carries most of what they know.' },
    { p: 'One refinement is worth having. Allowing recency’s effect to depend on frequency (a product term, recency × frequency) improves the fit sharply (G = 104.4 on 1 df, p below 0.001). For a member silent for 60 days, the model gives a 65.5% chance of lapsing if they had made 2 visits and 89.0% if they had made 10; for one seen 10 days ago, 31.4% and 22.5%. A regular who goes quiet has probably stopped; a regular seen recently is probably still coming. Raw data say the same, in the bands the rfm-segments lesson used: among members silent for 61–90 days, 22.3% of those with one or two visits came back in November–December, against 1.6% of those with seven or more. This is the <g>increasing frequency paradox</g> (the rfm-segments lesson found the same in return rates).' },
  ],

  theory: [
    { h: 'Judging a score: base rate, lift and gains' },
    { p: 'A churn model is used to rank customers, so judge it by how well it ranks. At a threshold of 0.5 the seven-predictor model classifies 85.1% of members correctly, against 66.0% for predicting that everyone lapses. But Ana won’t contact everyone above 0.5; she will contact as many as she can afford, from the top of the list. The <b>lift table</b> answers the question that matters: if she contacts the top fifth, the top two-fifths and so on, what share of each group lapses, and how does that compare with the base rate?' },
    { table: {
      caption: 'Lift table for recency alone: members in five groups of 333 (332 in the last), longest silence first',
      head: ['Group', 'Lapsed', 'Rate', 'Lift', 'Share of all lapsers found so far'],
      rows: L5.rows.map((r) => [String(r.group), String(r.positives), `${(r.rate * 100).toFixed(1)}%`, f2(r.lift), `${(r.captured * 100).toFixed(1)}%`]),
      align: ['l', 'r', 'r', 'r', 'r'],
    } },
    { p: 'The top fifth lapses at 96.7%, a <g>lift</g> of 1.47 over the base rate. That looks modest, and it is close to the most possible: when two-thirds of members lapse anyway, no group can be more than 1 ÷ 0.660 = 1.52 times as rich in lapsers. Lift is easy to read but depends on the base rate, so compare lifts only between scores on the same customers. The last column is the <b>gains curve</b>: contacting the top 40% finds 57.7% of all lapsers, and the top 60% finds 82.6%. A random list of the same size would find 40% and 60%. Recency has ties, and some fall on group boundaries: 9 members silent for 178 days straddle the edge of the top tenth, so the group rates depend slightly on the order of the rows; the AUC avoids this by counting ties as half.' },
    { p: 'The <b>area under the ROC curve</b> (AUC) summarises the ranking in one number: the probability that a randomly chosen lapser scores higher than a randomly chosen returner, counting ties as half. A score that ranks at random has 0.5; a perfect one 1. Recency alone has an AUC of 0.901, the seven-predictor model 0.899, and the model with the recency × frequency term 0.910. The extra predictors buy almost nothing; the product term buys a little. The seven-predictor model even ranks a shade worse than recency alone: maximum likelihood chooses coefficients to fit the probabilities, not to maximise the ranking, and predictors that add nothing can cost a little.' },

    { h: 'Testing on customers the model hasn’t seen' },
    { p: 'Scores judged on the members used to fit them flatter the model, because the coefficients were chosen to fit those members. A fair estimate fits on some members and scores others. Fitting the seven-predictor model on alternate members (832) and scoring the other 832 gives an AUC of 0.906 on the scored half, against 0.893 on the fitting half: no sign of overfitting, as expected with seven predictors and hundreds of each outcome. On the scored half the top tenth lapsed at 98.8%, a lift of 1.48. A model with dozens of predictors, or one tuned repeatedly on the same data, would need this check far more. Even better is a later holdout: fit on, say, members described in August and their September–October outcome, then score 1 November’s members.' },
    { p: '<b>Calibration</b> asks whether the predicted probabilities mean what they say: of members given about 40%, do about 40% lapse? Sorting by the model’s probability into five groups, the mean predicted and actual rates are 99.3% against 97.0%, 94.4% against 93.4%, 76.0% against 82.9%, 39.3% against 42.0% and 20.8% against 14.5%. It is within about 3 points in the top, second and fourth fifths; it understates lapsing in the middle fifth (76.0% against 82.9%) and overstates it in the bottom fifth by six points (20.8% against 14.5%). Most of the bottom fifth are recent visitors. A straight line in recency on the log-odds scale can’t bend as the data do. For ranking that matters little; for budgeting how many members will come back, check calibration and fix it, for example with recency bands as predictors.' },

    { h: 'Whom to contact, and at what cost' },
    { p: String.raw`The obvious rule, contact those most likely to lapse, quietly assumes that the offer works equally well on everyone. It doesn’t. What a contact is worth depends on the chance the customer lapses <m>p</m>, the chance the offer changes that (the <g>uplift</g>, <m>u</m>), the value of a customer kept <m>V</m> and the cost of contact <m>c</m>: the expected gain is <m>p \times u \times V - c</m>. A member who has been silent for six months has <m>p</m> near 1, but if they have moved away, <m>u</m> is near 0. A member seen last week has a small <m>p</m>: most would come anyway, and the offer mostly rewards visits that were going to happen. The members worth contacting are those whose behaviour the offer can change, often in the middle of the risk ranking.` },
    { p: 'Research supports the caution. As the American Marketing Association summarises it, Ascarza (2018), in the <i>Journal of Marketing Research</i>, used field data from a wireless provider and a membership organisation to show that targeting retention efforts by how customers respond to them (lift, in her terms) reduces churn more effectively than targeting by their risk of leaving. And in a field experiment at a wireless carrier described by Knowledge at Wharton (2015), customers randomly assigned to a campaign recommending a different pricing plan were more likely to leave two months later than those assigned to no campaign, about 10% against 6%; the researchers argue that being contacted itself changed some customers’ behaviour. Contact can backfire.' },
    { callout: 'key', title: 'Uplift needs a control group', html: 'A churn score predicts who will lapse if nothing is done. It can’t say who an offer will change, because in the data nobody received the offer. To measure uplift, send the offer to a random part of each group and hold out the rest (a <g>holdout group</g>, the <g>control group</g> of the experiment). The difference in lapse rates between the two, within each band of the score, is the uplift.' },
  ],

  formulas: [
    { id: 'm06-lift', name: 'Lift and cumulative gains',
      tex: String.raw`\text{Lift}_g = \frac{p_g}{\bar p}, \qquad \text{Gains}_G = \frac{\sum_{g \le G} y_g}{\sum_{\text{all}} y}`,
      where: [[String.raw`p_g`, 'Share of customers in group g (ranked by score, highest first) who churned', ''], [String.raw`\bar p`, 'Share of all customers who churned (the base rate)', ''], [String.raw`y_g`, 'Number of churners in group g', 'customers'], [String.raw`G`, 'Number of top groups contacted', 'groups']],
      assumptions: 'Groups are equal-sized slices of the ranked list; the outcome is observed after the predictors.',
      note: 'The largest possible lift is 1 ÷ base rate: with 66% lapsing, 1.52.' },
    { id: 'm06-auc', name: 'Area under the ROC curve',
      tex: String.raw`\text{AUC} = P(s_{+} > s_{-}) + \tfrac{1}{2}\,P(s_{+} = s_{-})`,
      where: [[String.raw`P`, 'Probability, over random pairs of one churner and one non-churner', ''], [String.raw`s_{+}`, 'Score of a randomly chosen customer who churned', ''], [String.raw`s_{-}`, 'Score of a randomly chosen customer who did not', '']],
      assumptions: 'Only the ranking matters; any score that orders customers the same way has the same AUC.',
      note: '0.5 is a random ranking, 1 a perfect one. Recency alone: 0.901.' },
    { id: 'm06-contact-value', name: 'Expected gain from contacting a customer',
      tex: String.raw`\text{Expected gain} = p \times u \times V - c`,
      where: [[String.raw`p`, 'Probability the customer lapses if not contacted', ''], [String.raw`u`, 'Uplift: probability the contact keeps a customer who would otherwise lapse', ''], [String.raw`V`, 'Value of keeping the customer (margin, not revenue, over the horizon)', '$'], [String.raw`c`, 'Cost of the contact, including the offer’s cost', '$']],
      assumptions: 'The contact doesn’t harm customers who would have stayed, and its cost is the same for everyone; u must be measured with a randomised control group.',
      note: 'Ranking by p alone assumes u is the same for everyone.' },
  ],

  examples: [
    { level: 'simple', title: 'Reading a lift table', fictional: true,
      setup: 'Ranked by recency alone, the top tenth of the 1,664 members (167 members) contains 161 who lapsed. The base rate is 66.0%. What is the top tenth’s lapse rate and lift, and what share of all 1,098 lapsers does it contain?',
      steps: [
        'Rate: 161 ÷ 167 = 96.4%.',
        'Lift: 96.4% ÷ 66.0% = 1.46. The largest possible lift is 1 ÷ 0.660 = 1.52, so the top tenth is almost as rich in lapsers as a group can be.',
        'Share found: 161 ÷ 1,098 = 14.7%, against 10% for a random tenth.',
      ],
      answer: 'Rate 96.4%, lift 1.46, and 14.7% of all lapsers.',
      interpretation: 'Recency finds lapsers efficiently, but because two-thirds of members lapse, every list is mostly lapsers. The question that decides the campaign is not how many lapsers a list contains but how many of them an offer would bring back.' },

    { level: 'challenging', title: 'A fair test, and a leak', fictional: true,
      setup: 'Ana’s analyst reports an AUC of 1.000 for a model of lapsing whose predictors are recency, frequency and spend “as of the latest data”, 31 December. Another analyst fits the seven-predictor model on alternate members and scores the rest. Explain the first result, and say what the second shows.',
      steps: [
        'The first model leaks: on 31 December, members who visited in November–December have recency of at most 60 days and the others more. Recency then is the outcome restated; the AUC of 1.000 is worthless for a list made on 1 November.',
        'Rebuild every predictor as of 31 October, the end of the calibration period, and keep November–December for the outcome only.',
        'Fit the model on 832 members (alternate rows) and score the other 832: AUC 0.906 on the scored half, 0.893 on the fitting half.',
        'On the scored half, the top tenth by predicted probability lapsed at 98.8% against a base rate of 66.7% in that half, a lift of 1.48.',
      ],
      answer: 'The AUC of 1.000 comes from leakage. Measured fairly, the model ranks members with an AUC of about 0.9 on members it hasn’t seen, as well as on those it was fitted to.',
      interpretation: 'A suspiciously perfect score is a symptom to investigate, not a success. Here the honest score is still strong, and almost all of it comes from recency, which Ana can compute without a model.' },

    { level: 'applied', title: 'Two lists of 452 members', fictional: true,
      setup: 'Ana can afford 452 messages at $1.00 each, including the offer (fictional). She assumes (fictional, to be tested) that a member kept for November–December is worth $12.00 of margin and that the offer brings back this share of members who would otherwise lapse: 5% of those last seen 0–30 days ago, 15% at 31–90 days, 6% at 91–150 days and 1% at 151 days or more. List A is the 452 longest-silent members; list B is the 452 members silent for 31–90 days. Using what actually happened in November–December as what would have happened without the offer, compare the lists.',
      steps: [
        'List A runs from the longest silences down to 123 days. It contains 436 members who lapsed (96.5%), mostly in the 151-day band where the offer is assumed to work on 1%.',
        'Expected members brought back by A: the sum over its lapsers of each band’s uplift, 12.3. Value 12.31 × $12.00 = $147.72 against a cost of $452.00: a loss of $304.28.',
        'List B contains 348 lapsers (77.0%), all in the band where the offer is assumed to work best: 348 × 15% = 52.2 members brought back, worth $626.40, a gain of $174.40.',
        'Counting every lapser on the list as kept, as the lift widget’s profit column does, would make A look better (436 against 348); under these assumptions it is worse.',
      ],
      answer: 'List B: about 52 members brought back and a gain of about $174; list A: about 12 and a loss of about $304, though A contains more lapsers.',
      interpretation: 'The ranking of the lists comes entirely from the assumed uplifts, which are guesses. The figures show why Ana must measure them: send the offer to a random half of each band and compare November–December visits with the other half. Until then, the list with the most lapsers is not the list with the most to gain.' },
  ],

  demo: [
    { widget: 'pred-logit', intro: 'The seven-predictor model of lapsing. The curve shows the probability against days since the last visit, with the other predictors held where you set them; move the frequency up and down and watch how little the curve moves. Then move the threshold and compare the classification table with predicting that everyone lapses.' },
    { widget: 'pred-lift', intro: 'Gains curves for the model and for recency alone against a random list, and the lift table. Switch between the scores: the curves almost coincide. The profit column counts every lapser contacted as kept, the optimistic assumption the applied example questions.' },
  ],

  mistakes: [
    { title: 'Using information from after the prediction date', html: 'Recency or visits measured after 31 October leak the outcome (AUC 1.000). Build every predictor from the calibration period only.' },
    { title: 'Judging the model by accuracy alone', html: '85.1% accuracy sounds high, but predicting “everyone lapses” scores 66.0%. Compare with the base rate, and for targeting look at lift and gains.' },
    { title: 'Comparing lifts across different customer bases', html: 'Lift is capped at 1 ÷ base rate: 1.52 here, but 10 when 10% churn. A lift of 1.47 can be excellent and one of 3 poor; compare scores on the same customers, or use the AUC.' },
    { title: 'Contacting the customers most likely to churn', html: 'Risk is not responsiveness. The longest-silent members are mostly gone, and recent ones would mostly come anyway; the offer pays where it changes behaviour, which only a randomised test can show.' },
    { title: 'Reading a churn model’s coefficients as levers', html: 'Notifications have an odds ratio of 0.963 here, and members chose them; neither the coefficient nor its absence of significance says what switching notifications on would do.' },
  ],

  application: [
    { p: 'Churn models are standard in telecoms, banking, insurance, software and retail. The workflow is the one followed here: fix the prediction date and the outcome window; build features from before the date; fit a model, often a logistic regression or a tree-based method; and judge it on later customers with lift, gains and the AUC. The score then feeds a decision: who receives a retention call, an offer, a service visit or nothing.' },
    { p: 'The modelling is the easier half. The harder half is knowing what the contact does. A retention team that sends offers to its highest-risk customers and sees many of them leave anyway may conclude the offer failed when it simply reached people it couldn’t keep; one that sends offers to its safest customers will see them stay, and may credit the offer for loyalty it didn’t cause. Without a randomised holdout, neither team knows. Uplift modelling, which predicts the difference an action makes rather than the outcome, is built on such tests.' },
    { case: 'Ana’s plan for the next campaign: on 1 January, score every member by recency and frequency as of 31 December. Within each of four recency bands, send the offer to a random half and hold out the other half. In March, compare the share who visited in January–February in each half of each band (a difference of two proportions with its confidence interval, from B04), and use the measured uplifts and the cost of the offer to choose next quarter’s list. The churn score decides where to look; the test decides where to spend.' },
    { p: 'Two practical cautions. A model fitted to one period can drift: members who joined during a festival, or a change to the app, can change who lapses. Refit and re-check calibration regularly against fresh holdout periods. And a list of customers “likely to leave” is sensitive information about them; use it to serve them better, not to treat them worse, and follow the data-protection rules that apply to profiling.' },
  ],

  summary: [
    'Predict churn from a calibration period (predictors as of a date) and a later holdout period (the outcome); anything measured after the date leaks (recency on 31 December: AUC 1.000).',
    'Of 1,664 members described on 31 October, 66.0% lapsed in November–December: the base rate any score must beat.',
    'Recency dominates: 10.2% of members seen in the last week lapsed, 96.9% of those silent five months or more. In a logistic regression, 30 more days of silence multiply the odds of lapsing by 3.19; six other predictors add little (p = 0.214). A regular who goes quiet is likelier to have stopped than an occasional visitor with the same silence: the increasing frequency paradox, which the rfm-segments lesson found in return rates too.',
    'Judge a score by how well it ranks: lift (capped at 1 ÷ base rate, 1.52 here), gains (the top 40% by recency holds 57.7% of lapsers) and the AUC (recency 0.901; seven predictors 0.899), on customers not used to fit it. Check calibration if the probabilities will be used as numbers.',
    'The expected gain from a contact is p × u × V − c. Risk (p) is not responsiveness (u): the likeliest to lapse may be beyond reach, and contact can backfire.',
    'Uplift can be measured only with a randomised holdout group within each band of the score.',
  ],

  glossary: [
    { term: 'Calibration period', def: 'In churn prediction, the period whose data supply the predictors, ending on the date the prediction is made; the outcome is taken from a later holdout period.' },
    { term: 'Gains curve', def: 'A chart of the cumulative share of all positive outcomes (such as churners) found against the share of customers contacted, taking customers in order of their score; a random order gives the diagonal.' },
    { term: 'Area under the ROC curve', def: 'A summary of how well a score ranks two classes: the probability that a randomly chosen positive case scores higher than a randomly chosen negative one, counting ties as half. Abbreviated AUC; 0.5 is random and 1 perfect.' },
    { term: 'Uplift', def: 'The change in a customer’s probability of an outcome caused by an action, such as a retention offer; estimated by comparing randomly chosen treated and untreated customers.' },
  ],

  references: [
    { text: 'American Marketing Association (2019). “Ascarza’s ‘Retention Futility: Targeting High-Risk Customers Might Be Ineffective’ wins 2018 Paul E. Green Award” (on Ascarza, E., 2018, <i>Journal of Marketing Research</i>, February issue).', url: 'https://www.ama.org/2019/04/24/escarzas-retention-futility-targeting-high-risk-customers-might-be-ineffective-wins-2018-award/', checked: '2026-11-01' },
    { text: 'Knowledge at Wharton (2015). “Why retention plans don’t work” (on Ascarza, Iyengar and Schleicher’s field experiment at a wireless carrier).', url: 'https://knowledge.wharton.upenn.edu/article/why-retention-plans-dont-work', checked: '2026-11-01' },
    { text: 'scikit-learn developers. “Probability calibration curves” (example in the scikit-learn documentation).', url: 'https://scikit-learn.org/stable/auto_examples/calibration/plot_calibration_curve.html', checked: '2026-11-01' },
    { text: 'scikit-learn developers. “sklearn.metrics.roc_auc_score” (API reference).', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score', checked: '2026-11-01' },
  ],

  checks: [
    { what: 'Members in the table', value: n, shown: 1664 },
    { what: 'Came back', value: n - nL, shown: 566 },
    { what: 'Lapsed', value: nL, shown: 1098 },
    { what: 'Base rate %', value: pc(base), shown: 66.0, tol: 0.05 },
    { what: 'Two in three', value: base, shown: 2 / 3, tol: 0.01 },
    { what: 'No visit Nov–Dec ⇔ more than 60 days silent on 31 Dec (claim)', value: Number(CT.every((c) => (c.lapsed ? decRec.get(c.id) > 60 : decRec.get(c.id) <= 60))), shown: 1 },
    { what: 'Leaked AUC', value: aucLeak, shown: 1.000, tol: 0.0005 },
    { what: 'Leaked recency: returners ≤ 60 days on 31 Dec (claim)', value: Number(CT.every((c) => (c.back ? decRec.get(c.id) <= 60 : decRec.get(c.id) > 60))), shown: 1 },
    // bands
    { what: 'Last week members', value: band[0].n, shown: 245 },
    { what: 'Last week lapsed %', value: pc(band[0].rate), shown: 10.2, tol: 0.05 },
    { what: '151+ members', value: band[6].n, shown: 286 },
    { what: '151+ lapsed %', value: pc(band[6].rate), shown: 96.9, tol: 0.05 },
    { what: 'Bands cover everyone', value: band.reduce((s, g) => s + g.n, 0), shown: 1664 },
    { what: 'Longest silence', value: Math.max(...rec), shown: 244 },
    { what: 'Lapse rate rises with every band (claim)', value: Number(band.every((g, i) => i === 0 || g.rate > band[i - 1].rate)), shown: 1 },
    // full model
    { what: 'Intercept', value: k('Intercept').estimate, shown: -1.2810, tol: 0.00005 },
    { what: 'McFadden', value: FULL.mcfadden, shown: 0.396, tol: 0.0005 },
    { what: 'G rest vs recency', value: lrRest.stat, shown: 8.35, tol: 0.005 },
    { what: 'df', value: lrRest.df, shown: 6 },
    { what: 'p rest', value: lrRest.p, shown: 0.214, tol: 0.0005 },
    { what: 'Recency OR per day', value: k('Recency').or, shown: 1.039, tol: 0.0005 },
    { what: 'Recency OR per 30 days', value: Math.exp(30 * k('Recency').estimate), shown: 3.19, tol: 0.005 },
    { what: 'Recency p < 0.001 and others ≥ 0.05 (claim)', value: Number(k('Recency').p < 0.001 && ['Frequency', 'Tenure', 'Spend ($)', 'Near', 'Notifications', 'Millbrook'].every((nm) => k(nm).p >= 0.05)), shown: 1 },
    { what: 'AUC without recency', value: aucNoRec, shown: 0.750, tol: 0.0005 },
    { what: 'Notifications OR', value: k('Notifications').or, shown: 0.963, tol: 0.0005 },
    { what: 'Frequent members visited more recently (claim): corr(frequency, recency) < 0', value: Number((() => { const mf = freq.reduce((a, b) => a + b, 0) / n, mr = rec.reduce((a, b) => a + b, 0) / n; return freq.reduce((s, f, i) => s + (f - mf) * (rec[i] - mr), 0) < 0; })()), shown: 1 },
    // interaction
    { what: 'G interaction', value: lrInt.stat, shown: 104.4, tol: 0.05 },
    { what: 'Interaction p < 0.001', value: Number(lrInt.p < 0.001), shown: 1 },
    { what: '60 days, 2 visits %', value: pc(pInt(60, 2)), shown: 65.5, tol: 0.05 },
    { what: '60 days, 10 visits %', value: pc(pInt(60, 10)), shown: 89.0, tol: 0.05 },
    { what: '10 days, 2 visits %', value: pc(pInt(10, 2)), shown: 31.4, tol: 0.05 },
    { what: '10 days, 10 visits %', value: pc(pInt(10, 10)), shown: 22.5, tol: 0.05 },
    { what: 'Quiet 61–90, 1–2 visits came back %', value: 100 - pc(rateOf(qLo)), shown: 22.3, tol: 0.05 },
    { what: 'Quiet 61–90, 7+ visits came back %', value: 100 - pc(rateOf(qHi)), shown: 1.6, tol: 0.05 },
    { what: 'Ties at 178 days', value: CT.filter((c) => c.recency === 178).length, shown: 9 },
    { what: '178 straddles the top-tenth edge (claim)', value: Number((() => { const s = [...rec].sort((a, b) => b - a); return s[166] === 178 && s[167] === 178; })()), shown: 1 },
    { what: 'Top fifth within 3 points', value: Number(Math.abs(CAL[0].pred - CAL[0].obs) < 0.03 && Math.abs(CAL[1].pred - CAL[1].obs) < 0.03 && Math.abs(CAL[3].pred - CAL[3].obs) < 0.03), shown: 1 },
    // judging
    { what: 'Accuracy at 0.5 %', value: pc(C5.accuracy), shown: 85.1, tol: 0.05 },
    { what: 'Quintile size', value: L5.rows[0].n, shown: 333 },
    { what: 'Last quintile size', value: L5.rows[4].n, shown: 332 },
    { what: 'Top fifth rate %', value: pc(L5.rows[0].rate), shown: 96.7, tol: 0.05 },
    { what: 'Top fifth lift', value: L5.rows[0].lift, shown: 1.47, tol: 0.005 },
    { what: 'Max lift', value: 1 / base, shown: 1.52, tol: 0.005 },
    { what: '1 ÷ 0.660', value: 1 / 0.66, shown: 1.52, tol: 0.005 },
    { what: 'Top 40% finds %', value: pc(L5.rows[1].captured), shown: 57.7, tol: 0.05 },
    { what: 'Top 60% finds %', value: pc(L5.rows[2].captured), shown: 82.6, tol: 0.05 },
    { what: 'AUC recency', value: aucRec, shown: 0.901, tol: 0.0005 },
    { what: 'AUC full', value: aucFull, shown: 0.899, tol: 0.0005 },
    { what: 'AUC interaction', value: aucInt, shown: 0.910, tol: 0.0005 },
    // fair test
    { what: 'Fitting half', value: TR.length, shown: 832 },
    { what: 'Scored half', value: TE.length, shown: 832 },
    { what: 'AUC scored half', value: aucTest, shown: 0.906, tol: 0.0005 },
    { what: 'AUC fitting half', value: aucTrain, shown: 0.893, tol: 0.0005 },
    { what: 'Top tenth scored half %', value: pc(LTE.rows[0].rate), shown: 98.8, tol: 0.05 },
    { what: 'Top tenth lift scored half', value: LTE.rows[0].lift, shown: 1.48, tol: 0.005 },
    { what: 'Base rate scored half %', value: pc(LTE.base), shown: 66.7, tol: 0.05 },
    // calibration
    ...CAL.flatMap((c, i) => [{ what: `Cal ${i + 1} predicted %`, value: pc(c.pred), shown: [99.3, 94.4, 76.0, 39.3, 20.8][i], tol: 0.05 }, { what: `Cal ${i + 1} actual %`, value: pc(c.obs), shown: [97.0, 93.4, 82.9, 42.0, 14.5][i], tol: 0.05 }]),
    { what: 'Overstates in the lowest-risk fifth (claim)', value: Number(CAL[4].pred > CAL[4].obs + 0.03), shown: 1 },
    { what: 'Six points', value: pc(CAL[4].pred - CAL[4].obs), shown: 6, tol: 0.5 },
    { what: 'Bottom fifth mostly recent visitors (≤ 30 days) (claim)', value: Number(order.slice(n - CAL[4].n).filter((i) => CT[i].recency <= 30).length > CAL[4].n / 2), shown: 1 },
    { what: 'Understates in the middle fifth (claim)', value: Number(CAL[2].pred < CAL[2].obs), shown: 1 },
    // simple example
    { what: 'Top tenth size', value: L10.rows[0].n, shown: 167 },
    { what: 'Top tenth lapsed', value: L10.rows[0].positives, shown: 161 },
    { what: 'Top tenth rate %', value: pc(L10.rows[0].rate), shown: 96.4, tol: 0.05 },
    { what: 'Top tenth lift', value: L10.rows[0].lift, shown: 1.46, tol: 0.005 },
    { what: 'Share found %', value: pc(L10.rows[0].captured), shown: 14.7, tol: 0.05 },
    // applied example
    { what: 'List size', value: listB.length, shown: 452 },
    { what: 'List A down to', value: minRecA, shown: 123 },
    { what: 'List A lapsers', value: lapsersIn(listA), shown: 436 },
    { what: 'List A lapsers %', value: pc(lapsersIn(listA) / listA.length), shown: 96.5, tol: 0.05 },
    { what: 'List A mostly 151+ (claim)', value: Number(listA.filter((i) => CT[i].recency >= 151).length > listA.length / 2), shown: 1 },
    { what: 'A brought back', value: extra(listA), shown: 12.3, tol: 0.05 },
    { what: 'A brought back (2 dp)', value: extra(listA), shown: 12.31, tol: 0.005 },
    { what: 'A value', value: extra(listA) * OFFER.value, shown: 147.72, tol: 0.005 },
    { what: 'A cost', value: listA.length * OFFER.cost, shown: 452 },
    { what: 'A loss', value: profit(listA), shown: -304.28, tol: 0.005 },
    { what: 'List B lapsers', value: lapsersIn(listB), shown: 348 },
    { what: 'List B lapsers %', value: pc(lapsersIn(listB) / listB.length), shown: 77.0, tol: 0.05 },
    { what: 'B brought back', value: extra(listB), shown: 52.2, tol: 0.05 },
    { what: 'B value', value: extra(listB) * OFFER.value, shown: 626.40, tol: 0.005 },
    { what: 'B gain', value: profit(listB), shown: 174.40, tol: 0.005 },
    { what: 'About 52', value: extra(listB), shown: 52, tol: 0.5 },
    { what: 'About 12', value: extra(listA), shown: 12, tol: 0.5 },
    { what: 'About $174', value: profit(listB), shown: 174, tol: 0.5 },
    { what: 'About $304', value: -profit(listA), shown: 304, tol: 0.5 },
  ],
};
