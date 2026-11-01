// loyalty-and-retention-strategy.js — M06 · Loyalty and retention strategy. Content only; exercises are in
// loyalty-and-retention-strategy.ex.js. What published studies found about loyalty programmes (each opened and described
// only as far as it was read), the cafés' members (case.js: lapses with a 60-day definition, notifications on and off,
// which members chose themselves), and a fictional randomised win-back test on the real count of members who had
// lapsed by 31 December 2027 (the outcomes are invented). The project's subscriptions are not used. Every printed figure
// is recomputed in `checks`.
import { members, lapseData } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';
import { propTest2, normCdf, normInv } from '../../../core/inference.js?v=25';

const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const f2 = (v) => v.toFixed(2);

// ---------------------------------------------------------------- the cafés' members as of 31 December 2027
const M = members();
const lapsedWindow = M.filter((c) => c.recency > 60 && c.recency <= 180);
const lapsed60 = M.filter((c) => c.recency > 60).length;
const byId = new Map(M.map((c) => [c.id, c]));
const LD = lapseData(), LT = CU.lapseTimes(LD, 60);
const grp = LT.ids.map((id) => (byId.get(id).notifications ? 'on' : 'off'));
const idx = (g) => LT.ids.map((_, i) => i).filter((i) => grp[i] === g);
const km = (g) => CU.kaplanMeier(idx(g).map((i) => LT.times[i]), idx(g).map((i) => LT.events[i]));
const KON = km('on'), KOFF = km('off'), LR = CU.logRank(LT.times, LT.events, grp);
const nearShare = (n) => M.filter((c) => c.notifications === n && c.near).length / M.filter((c) => c.notifications === n).length;
const visits = (n) => M.filter((c) => c.notifications === n).reduce((s, c) => s + c.frequency, 0) / M.filter((c) => c.notifications === n).length;
const nOn = M.filter((c) => c.notifications === 1).length, nOff = M.length - nOn;
const neverBack = (k) => 1 - k.at(0);

// ---------------------------------------------------------------- fictional win-back test, January 2028 (outcomes invented)
const TEST = { nT: 431, xT: 41, nC: 430, xC: 22, cost: 0.9, value: 7.5 };   // holdout ≈ 5%, in line with the case (3–5% of members silent 61–180 days return within 30 days)
const T = propTest2(TEST.xT, TEST.nT, TEST.xC, TEST.nC);
const incr = T.diff * TEST.nT, offerCost = TEST.xT * TEST.cost, net = incr * TEST.value - offerCost;
const breakEven = TEST.xT / TEST.nT * TEST.cost / TEST.value;
const netAt = (u) => u * TEST.nT * TEST.value - offerCost;
const seAlt = Math.sqrt(T.p1 * (1 - T.p1) / TEST.nT + T.p2 * (1 - T.p2) / TEST.nC);
const power = normCdf(Math.abs(T.diff) / seAlt - normInv(0.975));
const zz = normInv(0.975) + normInv(0.8);
const nNeed = Math.ceil(zz ** 2 * (0.05 * 0.95 + 0.1 * 0.9) / 0.05 ** 2);
const nNeed3 = Math.ceil(zz ** 2 * (0.05 * 0.95 + 0.075 * 0.925) / 0.025 ** 2);
const wouldAnyway = TEST.nT * T.p2;

// ---------------------------------------------------------------- Reichheld & Sasser's 5%: what five points of retention do to value
const clvA = (r) => 1.1 / (1.1 - r);                       // per $1 of margin, first margin now, 10% discount rate
const lift5 = (r) => clvA(r + 0.05) / clvA(r) - 1;

export default {
  slug: 'loyalty-and-retention-strategy',
  title: 'Loyalty and retention strategy',
  blurb: 'Loyalty programmes, win-back offers and other ways of keeping customers: what the published evidence shows, why self-selected members can’t tell you whether a programme works, how a randomised holdout measures what an offer adds, and how to weigh its cost against the value of the customers it keeps.',
  status: 'reviewed',
  objectives: [
    'Describe the main kinds of loyalty programme and state precisely what published studies have found about their effects.',
    'Explain double jeopardy and what it implies for how much loyalty a programme can create.',
    'Explain why comparing members who chose a feature with those who didn’t can’t show what the feature does, using the cafés’ notifications.',
    'Analyse a randomised holdout test with the difference in proportions, its confidence interval and the power to detect a given difference.',
    'Evaluate a retention offer by setting its cost, including what it gives to customers who would have stayed anyway, against the value of the customers it keeps.',
  ],
  prerequisites: [
    { lesson: 'm06/customer-lifetime-value', why: 'The value of a customer kept, which a retention offer must beat.' },
    { lesson: 'm06/predicting-churn', why: 'Scoring who is likely to lapse, and why a good churn score is not the same as knowing whom an offer changes.' },
    { lesson: 'b04/proportions-and-chi-square', why: 'Comparing two proportions with a z test and a confidence interval.' },
    { lesson: 'b04/hypothesis-testing', why: 'Significance, Type I and II errors and power.' },
  ],
  case: 'lantern',

  concept: [
    { case: `January 2028. ${lapsed60} of the cafés’ 2,584 app members had not visited for more than 60 days by 31 December, ${lapsedWindow.length} of them for 61 to 180 days. Ana has two ideas: a message offering lapsed members a free pastry with their next drink, and a stamp card in the app (a free drink after so many visits). A supplier is also pitching a points scheme, with a slide claiming that “keeping just 5% more of your customers can nearly double your profits”. Before spending money she wants to know what such schemes actually do, and how she would tell whether hers worked.` },

    { h: 'Loyalty programmes and what they are for' },
    { p: 'A <g>loyalty programme</g> rewards customers for buying repeatedly. The common forms are <b>stamp cards</b> (a free item after a set number of purchases), <b>points</b> (earned per dollar and exchanged for rewards), <b>tiers</b> (better treatment as spending passes thresholds, as airlines and hotels use) and <b>apps</b> that combine these with offers and messages. They promise to keep customers who would otherwise leave and to raise what each spends. They also cost money: every reward given to a customer who would have bought anyway is a discount with nothing in return.' },

    { h: 'What the evidence shows' },
    { p: 'Dowling and Uncles (1997) reviewed customer loyalty programmes and argued, in the article’s published summary, that such programmes mainly raise marketing spending without creating much extra brand loyalty. The summary cites research finding that only about 10% of buyers of many frequently bought consumer goods are completely loyal to one brand over a year, and that more than 80% of the European business travellers surveyed belonged to more than one frequent-flyer programme. They also called the idea that loyal customers are always more profitable a gross simplification, and argued that programmes do better when they support the product’s value to the customer and when rewards are valued and not long delayed.' },
    { p: 'Sharp and Sharp (1997) tested a large multi-brand loyalty programme against what a standard model of repeat buying (the Dirichlet) predicts for brands of each size. They found only weak “excess loyalty” overall, inconsistent across brands: two of the six participating brands deviated substantially, and those deviations also appeared among non-members, so they were probably due at least partly to the brands’ other loyalty initiatives.' },
    { p: 'The pattern behind both studies is <g>double jeopardy</g>, described by Ehrenberg, Goodhardt and Barwise (1990): a small brand typically has far fewer buyers than a large one in a given period, and its buyers also tend to buy it less often. Loyalty measures largely follow from a brand’s size, so a programme that hopes to make a small brand’s customers unusually loyal is pushing against one of the most regular findings in marketing.' },
    { p: 'Programme design can still change behaviour within the programme. Kivetz, Urminsky and Zheng (2006) studied a reward card at a café on a large university campus: ten coffee purchases earned a free coffee. As members got closer to the reward the time between purchases shrank, by about 20% from the first interval to the last. In a field experiment with 108 of the café’s customers, those given a 12-stamp card with two stamps already filled in completed the ten purchases they needed in 12.7 days on average, against 15.6 days for those with a plain 10-stamp card. And members who sped up more towards their first reward were more likely to earn a second and started on it sooner. This is the <g>goal-gradient effect</g>: effort rises as a goal comes near.' },
    { callout: 'note', title: 'What these studies don’t say', html: 'The café study shows how members of a programme behave as a reward approaches, and that a card that looks further along is completed faster. It doesn’t estimate how many more coffees the café sold over a year than it would have with no card. The programme reviews describe weak effects on loyalty for typical programmes; they don’t say no programme can pay. Neither tells Ana what her stamp card would add. Only a test at the cafés can.' },

    { h: 'The 5% claim' },
    { p: `Reichheld and Sasser’s 1990 Harvard Business Review article on “zero defections” is the source of a much repeated claim, summarised by Bain (where Reichheld worked) as companies being able to boost profits by almost 100% by retaining just 5% more of their customers. The article is about service companies, and how far the claim holds depends on the business. Lifetime value shows why. With a 10% discount rate and margins at the start of each period, five more points of retention raise a new customer’s value by ${pct(lift5(0.6), 0)} if retention is 60%, by ${pct(lift5(0.8), 0)} at 80% and by ${pct(lift5(0.9), 0)} at 90%. The gain is largest where retention is already high, and none of these figures subtracts what it costs to buy the extra retention.` },

    { h: 'Lantern’s app: a programme nobody assigned' },
    { p: `The cafés’ app already works like a light programme: members can turn on notifications. With a lapse defined as more than 60 days without a visit, the ${nOn} members with notifications on stayed active for a median of ${KON.median} days before lapsing, against ${KOFF.median} days for the ${nOff} with them off, and the log-rank test puts the difference at p = ${LR.p.toFixed(3)}. By 31 December members with notifications on had made ${visits(1).toFixed(2)} visits each, against ${visits(0).toFixed(2)}.` },
    { p: `It is tempting to read that as notifications working. But members chose the setting. Those who turned notifications on may be the keener members, and keenness alone would produce the same gap. One obvious difference doesn’t explain it (${pct(nearShare(1))} of members with notifications on live or work within a mile of a café, against ${pct(nearShare(0))} with them off), but keenness can’t be measured from the till. A self-selected feature can never show its own effect: the comparison is between different kinds of people.` },

    { h: 'Measuring what an offer adds' },
    { p: `The answer is to decide by chance who gets the offer. In Ana’s fictional January 2028 test, the ${lapsedWindow.length} members who had not visited for 61 to 180 days are split at random: ${TEST.nT} receive the pastry offer and ${TEST.nC} form a <g>holdout group</g> that hears nothing. Within 30 days ${TEST.xT} of the ${TEST.nT} offered (${pct(T.p1)}) visit, and so do ${TEST.xC} of the ${TEST.nC} in the holdout (${pct(T.p2)}). Because chance decided who was offered, the groups differ only by chance and by the offer, so the ${(T.diff * 100).toFixed(1)}-point difference estimates what the offer added: its <g>incrementality</g>.` },
    { p: `The holdout also shows something an offer’s redemption count hides. Of the ${TEST.xT} offered members who came back, about ${wouldAnyway.toFixed(0)} would have come back anyway, at the holdout’s rate; only about ${incr.toFixed(0)} were won back by the offer. A report that said “${TEST.xT} lapsed members won back” would overstate the offer’s effect more than twofold.` },
  ],

  theory: [
    { h: 'Win-back and save tactics' },
    { p: 'Retention actions fall into two families. <b>Win-back</b> tactics aim at customers who have already lapsed: a reminder, an offer, a new product, a personal call. <b>Save</b> tactics act before the customer leaves: putting a problem right after a complaint, contacting customers whose use is falling. Both are offers made to a chosen group, and both raise the same three questions: whom to contact, what the contact adds compared with doing nothing, and whether that is worth its cost. The first is the subject of the previous module’s churn scoring; this lesson deals with the second and third.' },

    { h: 'The difference in proportions and its interval' },
    { p: String.raw`With <m>x_T</m> of <m>n_T</m> treated customers and <m>x_C</m> of <m>n_C</m> controls returning, the estimated effect is <m>\hat p_T - \hat p_C</m>. Its standard error is <m>\sqrt{\hat p_T(1-\hat p_T)/n_T + \hat p_C(1-\hat p_C)/n_C}</m>, and a 95% <g>confidence interval</g> is the difference ± 1.96 standard errors. For Ana’s test: <m>${(T.diff * 100).toFixed(1)}</m> points with a standard error of <m>${(T.se * 100).toFixed(2)}</m> points, so the interval runs from <m>${(T.low * 100).toFixed(1)}</m> to <m>${(T.high * 100).toFixed(1)}</m> points. The <g>two-proportion z test</g> (B04) uses the pooled proportion, <m>${(T.pool * 100).toFixed(1)}\%</m>, for its standard error and gives <m>z = ${T.z.toFixed(2)}</m>, <m>p = ${T.pValue.toFixed(3)}</m>.` },
    { p: `The interval matters more than the test. Uplifts from about ${(T.low * 100).toFixed(0)} to ${(T.high * 100).toFixed(0)} points are consistent with the data; zero lies just outside the interval (p = ${T.pValue.toFixed(3)}). Whether the offer added a little or a lot is not settled by 861 members.` },

    { h: 'Is it worth it? Cost against value' },
    { p: String.raw`An offer’s cost falls on everyone who uses it, including those who would have come back anyway; its benefit comes only from those it changed. If each redemption costs <m>k</m>, each contact costs <m>c</m> and a member won back is worth <m>V</m>, the net value of offering it to <m>n_T</m> members is <m>n_T(\hat p_T - \hat p_C)V - n_T\hat p_T k - n_T c</m>, and the offer breaks even when the uplift reaches <m>(\hat p_T k + c)/V</m>.` },
    { p: `For the pastry offer (fictional costs): a pastry costs Lantern $0.90 in ingredients, the in-app message costs nothing, and Ana values a member won back at $7.50 of margin over the following six months (a fictional assumption). The cost is ${TEST.xT} × $0.90 = $${f2(offerCost)}; the value is ${incr.toFixed(1)} members won back × $7.50 = $${f2(incr * TEST.value)}; the net is $${f2(net)}. The break-even uplift is ${(T.p1).toFixed(3)} × 0.90 ÷ 7.50 = ${(breakEven * 100).toFixed(2)} points. The estimate, ${(T.diff * 100).toFixed(1)} points, is comfortably above it, but the interval’s lower end, ${(T.low * 100).toFixed(1)} points, is below it: at that uplift the offer would lose $${f2(-netAt(T.low))}.` },
    { callout: 'key', title: 'Use the interval for the decision', html: 'A test whose interval sits entirely above the break-even uplift says the offer pays. One whose interval straddles break-even, as Ana’s does, says it probably pays but might not. With a cheap offer and small sums at stake, “probably” may be enough; with an expensive one, run a larger test first.' },

    { h: 'How big a test? Power in outline' },
    { p: String.raw`<g>Power</g> is the chance a test detects a difference that is really there (B04). For two proportions with equal groups, the number per group needed for power 1 − β at a two-sided significance level α is approximately the sample-size formula in the Formulas section: it grows with the square of the z values and shrinks with the square of the difference to detect, <m>(p_T - p_C)^2</m>. To detect a rise from 5% to 10% with 80% power at the 5% level takes <m>${nNeed}</m> members in each group; to detect 5% to 7.5%, <m>${nNeed3}</m>. Ana’s ${TEST.nT} a group gave her only about a ${pct(power, 0)} chance of a significant result even if the true uplift were the ${(T.diff * 100).toFixed(0)} points she observed. Small effects need big tests, and a business with a few hundred lapsed customers will often have to decide with wide intervals, or pool several months.` },

    { h: 'Designing a test that can be trusted' },
    { list: [
      '<b>Randomise individuals (or whole units) by chance</b>, not by staff judgement or by who opens the app, and keep the holdout untouched.',
      '<b>Fix the outcome and the window in advance</b> (a visit within 30 days), so the result can’t be chosen after seeing the data.',
      '<b>Count the cost on everyone who redeems</b>, and the value only on the difference between the groups.',
      '<b>Watch the longer run.</b> An offer can pull forward visits that would have happened later, or teach customers to wait for offers; a later window (60 or 90 days) shows whether the gap lasts.',
      '<b>Target by response, not only by risk.</b> The members most likely to lapse are not necessarily those the offer changes; a test that records who was offered lets later analysis find where the uplift is largest.',
    ] },

    { h: 'Testing a programme, not only an offer' },
    { p: 'A stamp card is harder to test than a message, because customers talk and see each other’s cards. Options include giving the card in the app to a random half of new members (the other half see the app as now), or switching it on at one café for a few months and comparing with the other, with the weakness that the cafés differ anyway. Either is better than launching it everywhere and comparing members who use the card with those who don’t, which repeats the notifications problem: the members who collect stamps are the ones who were coming anyway.' },
  ],

  formulas: [
    { id: 'm06-diff-ci', name: 'Difference in two proportions with a 95% interval',
      tex: String.raw`\hat p_T - \hat p_C \pm 1.96\sqrt{\frac{\hat p_T(1-\hat p_T)}{n_T} + \frac{\hat p_C(1-\hat p_C)}{n_C}}`,
      where: [[String.raw`\hat p_T, \hat p_C`, 'Shares who did the outcome (returned) in the treated and the control (holdout) groups', ''], [String.raw`n_T, n_C`, 'Sizes of the two groups', 'customers']],
      assumptions: 'Customers assigned to the groups at random; independent outcomes; at least about 10 successes and 10 failures in each group.',
      note: 'The two-proportion z test uses the pooled proportion in its standard error instead (B04).' },
    { id: 'm06-offer-net', name: 'Net value of a retention offer and its break-even uplift',
      tex: String.raw`\text{Net} = n_T(\hat p_T - \hat p_C)\,V - n_T \hat p_T\,k - n_T c, \qquad u^{*} = \frac{\hat p_T k + c}{V}`,
      where: [[String.raw`n_T`, 'Customers offered', 'customers'], [String.raw`\hat p_T, \hat p_C`, 'Response rates of the offered and holdout groups', ''], [String.raw`V`, 'Value (margin) of a customer the offer wins back', '$'], [String.raw`k`, 'Cost of the offer to each customer who uses it', '$'], [String.raw`c`, 'Cost of contacting each customer', '$'], [String.raw`u^{*}`, 'Break-even uplift: the smallest difference in response rates at which the offer pays', ''], [String.raw`\text{Net}`, 'Value added by the offer less its cost', '$']],
      assumptions: 'Everyone in the treated group who responds uses the offer; the value of a customer won back is the same whether or not they would have returned anyway.' },
    { id: 'm06-test-n', name: 'Customers per group to detect a difference in proportions',
      tex: String.raw`n = \frac{(z_{1-\alpha/2} + z_{1-\beta})^2\,[p_C(1-p_C) + p_T(1-p_T)]}{(p_T - p_C)^2}`,
      where: [[String.raw`n`, 'Customers needed in each group', 'customers'], [String.raw`p_C, p_T`, 'Expected response rates without and with the offer', ''], [String.raw`z_{1-\alpha/2}`, 'Standard normal quantile for a two-sided significance level α (1.96 for 5%)', ''], [String.raw`z_{1-\beta}`, 'Standard normal quantile for power 1 − β (0.84 for 80%)', '']],
      assumptions: 'Equal groups; the normal approximation.',
      note: 'Halving the difference to be detected roughly quadruples n.' },
  ],

  examples: [
    { level: 'simple', title: 'Reading a holdout test', fictional: true,
      setup: 'A fictional bookshop emails a 10%-off voucher to a random 600 of 1,200 customers who haven’t bought for six months; the other 600 hear nothing. Within a month 66 of the 600 emailed and 48 of the 600 in the holdout buy something. Estimate the voucher’s effect with a 95% interval.',
      steps: [
        'Response rates: 66 ÷ 600 = 11.0% emailed, 48 ÷ 600 = 8.0% holdout.',
        'Difference: 11.0% − 8.0% = 3.0 points.',
        String.raw`Standard error: <m>0.11 \times 0.89/600 = 0.000163</m> and <m>0.08 \times 0.92/600 = 0.000123</m>; the square root of their sum is <m>${(Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600) * 100).toFixed(2)}</m> points.`,
        String.raw`Interval: <m>3.0 \pm 1.96 \times ${(Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600) * 100).toFixed(2)}</m> = ${((0.03 - 1.96 * Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600)) * 100).toFixed(1)} to ${((0.03 + 1.96 * Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600)) * 100).toFixed(1)} points.`,
      ],
      answer: `About 3 points (95% CI ${((0.03 - 1.96 * Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600)) * 100).toFixed(1)} to ${((0.03 + 1.96 * Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600)) * 100).toFixed(1)}): the interval includes zero.`,
      interpretation: 'The voucher may have added about 18 buyers among the 600 (3 points), but with these numbers the data can’t rule out that it added none. Of the 66 who used it, about 48 would have bought anyway and received 10% off for nothing. The bookshop shouldn’t conclude the voucher fails; it should conclude it hasn’t yet shown it works, and that a bigger test (or a cheaper offer) is needed.' },

    { level: 'challenging', title: 'Notifications: a comparison that can’t be a test', fictional: true,
      setup: 'Ana’s colleague points to the app data: members with notifications on lapse later and visit more, so “notifications keep members”. Using a 60-day lapse definition, compare the two groups and say what can and cannot be concluded.',
      steps: [
        `Kaplan–Meier, 60-day lapse: median time to lapse ${KON.median} days with notifications on (${nOn} members), ${KOFF.median} days with them off (${nOff}); still active 90 days after joining, ${pct(KON.at(90))} against ${pct(KOFF.at(90))}; log-rank χ² = ${LR.chi2.toFixed(2)} on 1 df, p = ${LR.p.toFixed(3)}.`,
        `Never came back within 60 days of joining: ${pct(neverBack(KON))} with notifications on, ${pct(neverBack(KOFF))} with them off.`,
        `Check an obvious confounder: ${pct(nearShare(1))} of members with notifications on live or work within a mile, against ${pct(nearShare(0))} with them off. Distance doesn’t explain the gap.`,
        'But members chose the setting. Anything that makes a member both likelier to turn notifications on and likelier to come back (liking the café, a routine that passes it, wanting the offers) produces the same pattern with no effect of notifications at all.',
      ],
      answer: `Members with notifications on lapsed later (median ${KON.median} against ${KOFF.median} days, p = ${LR.p.toFixed(3)}), and the gap is not explained by distance; the data cannot say how much of it, if any, notifications caused.`,
      interpretation: 'A clear, significant association, and the right next step is to measure it: turn notifications on by default for a random half of new members (with the usual choice to switch them off) and compare lapse curves. Until then, notifications are a reason to test, not a lever with a known effect. The same reasoning applies to any programme customers choose to join.' },

    { level: 'applied', title: 'Did the pastry offer pay?', fictional: true,
      setup: `Ana’s fictional January test: of ${lapsedWindow.length} members who had not visited for 61–180 days, ${TEST.nT} were offered a free pastry with a drink and ${TEST.nC} were held out; ${TEST.xT} and ${TEST.xC} visited within 30 days. A pastry costs $0.90 in ingredients, the message nothing, and a member won back is assumed to bring $7.50 of margin over six months. Should the offer become routine?`,
      steps: [
        `Effect: ${pct(T.p1)} − ${pct(T.p2)} = ${(T.diff * 100).toFixed(1)} points, 95% CI ${(T.low * 100).toFixed(1)} to ${(T.high * 100).toFixed(1)}; z = ${T.z.toFixed(2)}, p = ${T.pValue.toFixed(3)}.`,
        `Members won back: ${(T.diff * 100).toFixed(1)}% of ${TEST.nT} = ${incr.toFixed(1)}, worth ${incr.toFixed(1)} × $7.50 = $${f2(incr * TEST.value)}.`,
        `Cost: every one of the ${TEST.xT} returners used a pastry, ${TEST.xT} × $0.90 = $${f2(offerCost)}. Net: $${f2(net)}.`,
        `Break-even uplift: (${T.p1.toFixed(3)} × 0.90 + 0) ÷ 7.50 = ${(breakEven * 100).toFixed(2)} points. The estimate is above it; the interval’s lower end (${(T.low * 100).toFixed(1)} points) is below, where the net would be −$${f2(-netAt(T.low))}.`,
        `Power: with ${TEST.nT} a group, the chance of a significant result for a true ${(T.diff * 100).toFixed(0)}-point uplift was about ${pct(power, 0)}; ${nNeed} a group would give 80%.`,
      ],
      answer: `The offer most likely paid (about $${f2(net)} on ${TEST.nT} members), but the interval doesn’t rule out a small loss.`,
      interpretation: `The stakes are small either way (the worst case in the interval loses about $${(-netAt(T.low)).toFixed(0)}), so continuing the offer with a permanent 20% holdout each month is reasonable: the holdout keeps measuring the effect as the evidence builds, at little cost. What would be a mistake is reporting “${TEST.xT} members won back”, since about ${wouldAnyway.toFixed(0)} of them would have come back anyway.` },
  ],

  demo: [
    { widget: 'loy-notifications', intro: 'Lapse curves for members with notifications on and off. Change the lapse definition (30, 60 or 90 days without a visit) and see whether the gap between the groups survives. Remember while you look: members chose the setting, so the gap is an association.' },
    { widget: 'loy-test', intro: 'Plan and judge a holdout test. Set the holdout’s expected return rate, the uplift you hope for and the group size, and the offer’s cost and the value of a member won back. Watch how the power and the width of the interval change with the group size, and whether the interval would clear the break-even uplift.' },
  ],

  mistakes: [
    { title: 'Counting every redemption as a customer saved', html: `Most customers who use a win-back offer would have come back anyway. In the pastry test ${TEST.xT} returned, but only about ${incr.toFixed(0)} more than the holdout’s rate implies. Report the difference from a holdout, not the redemptions.` },
    { title: 'Comparing members with non-members of a programme', html: 'People who join a programme, turn on notifications or collect stamps are already the keener customers. Their higher spending is no evidence the programme works. Randomise who gets it.' },
    { title: 'Repeating the 5% claim as a law', html: `“5% more retention nearly doubles profit” comes from an article about service companies in 1990, and the effect depends on margins and retention: five points add ${pct(lift5(0.6), 0)} to a customer’s value at 60% retention and ${pct(lift5(0.9), 0)} at 90%, before the cost of achieving them.` },
    { title: 'Reading a significant test as a profitable one', html: 'A p-value below 0.05 says the effect is probably not zero. Profit needs the effect to exceed the break-even uplift. Compare the confidence interval with the break-even point.' },
    { title: 'Running a test too small to find the effect', html: `Detecting a rise from 5% to 7.5% with 80% power needs about ${nNeed3} customers a group; with a few hundred, a real effect will often look “not significant”. Work out the size before the test, or accept a wide interval and say so.` },
    { title: 'Expecting a programme to make customers unusually loyal', html: 'Double jeopardy and the programme studies show loyalty mostly follows a brand’s size. A programme can reward and speed up buying among members, but large gains in loyalty beyond what penetration brings are rare. Judge it on what it adds, measured.' },
  ],

  application: [
    { case: `Ana’s note on retention, February 2028 (the test is fictional): “The pastry offer to members who hadn’t visited for two to six months brought ${(T.diff * 100).toFixed(1)} more in every hundred back within a month than a random holdout who got nothing (95% CI ${(T.low * 100).toFixed(1)} to ${(T.high * 100).toFixed(1)} points). That is about ${incr.toFixed(0)} members, worth about $${(incr * TEST.value).toFixed(0)} against $${offerCost.toFixed(0)} of pastries, so it probably pays, though the test was too small to be sure. We’ll keep sending it each month with a fifth of eligible members held out, so we keep measuring. On the stamp card: the research shows cards speed up visits as the reward approaches, but programmes rarely create much extra loyalty, so I want to test it before launching. From April, half of new members (chosen at random) will see a card in the app. I’m not using the notifications data as evidence: members chose them.”` },
    { p: 'In practice retention strategy is where marketing spends most freely on unmeasured promises. Programmes are launched because competitors have them; win-back campaigns are judged by redemptions; the customers who use a programme are compared with those who don’t. Each of these reports something real (customers did redeem, members did spend more) but none measures what the spending added.' },
    { p: 'The businesses that learn are the ones that build a holdout into every retention action as a matter of routine: a random slice of each mailing that receives nothing, a test region, a staggered launch. The holdout costs a little in foregone response, if the action works, and buys the one number that matters: what the action changed. Over time the tests also show for whom it works best, which is where targeting money should go.' },
    { p: 'The value side comes from the earlier lessons. A retention offer is worth paying for when the customers it keeps are worth more than it costs, counting the cost given away to those who would have stayed anyway. Lifetime value supplies the first number, the holdout the second, and the comparison of the interval with the break-even uplift the decision.' },
  ],

  summary: [
    'Loyalty programmes (stamp cards, points, tiers, apps) reward repeat buying; every reward given to a customer who would have bought anyway is a cost with no return.',
    'Dowling and Uncles (1997) and Sharp and Sharp (1997) found typical programmes add little loyalty; double jeopardy (Ehrenberg, Goodhardt and Barwise, 1990) shows loyalty largely follows a brand’s size.',
    'Kivetz, Urminsky and Zheng (2006): at a university café, purchases sped up by about 20% as a ten-coffee reward approached, and a 12-stamp card with two stamps filled was completed in 12.7 days against 15.6 for a plain 10-stamp card.',
    'The 5% claim (Reichheld and Sasser, 1990) depends on the business: five points of retention add more value where retention is already high, before the cost of buying them.',
    'A self-selected feature cannot show its effect: members with notifications on lapsed later (median 57 against 48 days), but they chose the setting.',
    'A randomised holdout measures incrementality: the difference in response with a confidence interval; small effects need large groups (about 1,468 a group to detect 5% against 7.5% at 80% power).',
    'An offer pays when the uplift exceeds the break-even (p̂_T k + c) ÷ V; compare the interval, not only the estimate, with it.',
  ],

  glossary: [
    { term: 'Loyalty programme', def: 'A scheme that rewards customers for buying repeatedly, such as a stamp card, points, tiers or an app with offers.' },
    { term: 'Double jeopardy', def: 'The regular finding that a brand with a small market share has far fewer buyers than a large brand and that its buyers also tend to buy it less often.' },
    { term: 'Goal-gradient effect', def: 'The tendency for effort to increase as a goal gets closer; in reward programmes, customers buying more often as a reward approaches.' },
    { term: 'Break-even uplift', def: 'The smallest increase in response caused by an offer at which the value of the customers it changes covers the offer’s cost.' },
  ],

  references: [
    { text: 'Dowling, G. R. and Uncles, M. (1997). “Do Customer Loyalty Programs Really Work?” <i>MIT Sloan Management Review</i>, Summer 1997.', url: 'https://shop.sloanreview.mit.edu/store/do-customer-loyalty-programs-really-work', checked: '2026-11-01' },
    { text: 'Sharp, B. and Sharp, A. (1997). “Loyalty Programs and Their Impact on Repeat-Purchase Loyalty Patterns.” <i>International Journal of Research in Marketing</i>, 14(5), 473–486.', url: 'https://acnpsearch.tweb-dev.unibo.it/singlejournalindex/50767025', checked: '2026-11-01' },
    { text: 'Kivetz, R., Urminsky, O. and Zheng, Y. (2006). “The Goal-Gradient Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress, and Customer Retention.” <i>Journal of Marketing Research</i>, 43, 39–58.', url: 'https://business.columbia.edu/sites/default/files-efs/pubfiles/1200/goalgradient.pdf', checked: '2026-11-01' },
    { text: 'Reichheld, F. F. and Sasser, W. E. (1990). “Zero Defections: Quality Comes to Services.” <i>Harvard Business Review</i>, September 1990; summary page at Bain & Company.', url: 'https://www.bain.com/insights/zero-defections-quality-comes-to-services-harvard-business-review-hbr/', checked: '2026-11-01' },
    { text: 'Ehrenberg, A. S. C., Goodhardt, G. J. and Barwise, T. P. (1990). “Double Jeopardy Revisited.” <i>Journal of Marketing</i>, 54(3).', url: 'https://www.deepdyve.com/lp/sage/double-jeopardy-revisited-M5fQR2kwNT', checked: '2026-11-01' },
    { text: 'Holmes, A., Illowsky, B. and Dean, S. <i>Introductory Business Statistics 2e</i>, 10.4 “Comparing Two Independent Population Proportions”. OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/10-4-comparing-two-independent-population-proportions', checked: '2026-11-01' },
  ],

  checks: [
    // members
    { what: 'Members', value: M.length, shown: 2584 },
    { what: 'Lapsed > 60 days', value: lapsed60, shown: 1324 },
    { what: 'Lapsed 61–180', value: lapsedWindow.length, shown: 861 },
    { what: 'Test groups add to the eligible members', value: TEST.nT + TEST.nC, shown: lapsedWindow.length },
    { what: 'Notifications on n', value: nOn, shown: 1418 },
    { what: 'Notifications off n', value: nOff, shown: 1166 },
    { what: 'Median on', value: KON.median, shown: 57 },
    { what: 'Median off', value: KOFF.median, shown: 48 },
    { what: 'Log-rank p', value: LR.p, shown: Number(LR.p.toFixed(3)), tol: 0.0005 },
    { what: 'Log-rank chi2', value: LR.chi2, shown: Number(LR.chi2.toFixed(2)) },
    { what: 'S90 on', value: KON.at(90) * 100, shown: Number((KON.at(90) * 100).toFixed(1)), tol: 0.05 },
    { what: 'S90 off', value: KOFF.at(90) * 100, shown: Number((KOFF.at(90) * 100).toFixed(1)), tol: 0.05 },
    { what: 'On ahead at 90 days', value: Number(KON.at(90) > KOFF.at(90)), shown: 1 },
    { what: 'On ahead at 30, 90, 180 days', value: Number([30, 90, 180].every((t) => KON.at(t) > KOFF.at(t))), shown: 1 },
    { what: 'Never back on', value: neverBack(KON) * 100, shown: Number((neverBack(KON) * 100).toFixed(1)), tol: 0.05 },
    { what: 'Never back off', value: neverBack(KOFF) * 100, shown: Number((neverBack(KOFF) * 100).toFixed(1)), tol: 0.05 },
    { what: 'Visits on', value: visits(1), shown: Number(visits(1).toFixed(2)) },
    { what: 'Visits off', value: visits(0), shown: Number(visits(0).toFixed(2)) },
    { what: 'Near share on', value: nearShare(1) * 100, shown: Number((nearShare(1) * 100).toFixed(1)), tol: 0.05 },
    { what: 'Near share off', value: nearShare(0) * 100, shown: Number((nearShare(0) * 100).toFixed(1)), tol: 0.05 },
    { what: 'Distance doesn’t explain: shares within 1 point', value: Number(Math.abs(nearShare(1) - nearShare(0)) < 0.01), shown: 1 },
    // test
    { what: 'p treated', value: T.p1 * 100, shown: Number((T.p1 * 100).toFixed(1)), tol: 0.05 },
    { what: 'p holdout', value: T.p2 * 100, shown: Number((T.p2 * 100).toFixed(1)), tol: 0.05 },
    { what: 'Difference', value: T.diff * 100, shown: Number((T.diff * 100).toFixed(1)), tol: 0.05 },
    { what: 'Difference (whole points)', value: T.diff * 100, shown: 4, tol: 0.5 },
    { what: 'SE', value: T.se * 100, shown: Number((T.se * 100).toFixed(2)) },
    { what: 'Low', value: T.low * 100, shown: Number((T.low * 100).toFixed(1)), tol: 0.05 },
    { what: 'High', value: T.high * 100, shown: Number((T.high * 100).toFixed(1)), tol: 0.05 },
    { what: 'Pooled', value: T.pool * 100, shown: Number((T.pool * 100).toFixed(1)), tol: 0.05 },
    { what: 'z', value: T.z, shown: Number(T.z.toFixed(2)) },
    { what: 'p-value', value: T.pValue, shown: Number(T.pValue.toFixed(3)), tol: 0.0005 },
    { what: 'Would have come anyway', value: wouldAnyway, shown: Number(wouldAnyway.toFixed(0)), tol: 0.5 },
    { what: 'Won back', value: incr, shown: Number(incr.toFixed(0)), tol: 0.5 },
    { what: 'Won back (1 dp)', value: incr, shown: Number(incr.toFixed(1)), tol: 0.05 },
    { what: 'More than twofold', value: Number(TEST.xT / incr > 2 && TEST.xT / incr < 2.5), shown: 1 },
    { what: 'Low (whole points)', value: T.low * 100, shown: 1, tol: 0.5 },
    { what: 'High (whole points)', value: T.high * 100, shown: 8, tol: 0.5 },
    { what: 'Zero just outside', value: Number(T.low > 0 && T.low < 0.015), shown: 1 },
    { what: 'Holdout rate near the case’s 3–5%', value: Number(T.p2 > 0.04 && T.p2 < 0.06), shown: 1 },
    { what: 'Offer cost', value: offerCost, shown: 36.9 },
    { what: 'Offer cost (whole dollars)', value: offerCost, shown: 37, tol: 0.5 },
    { what: 'Value won back', value: incr * TEST.value, shown: Number(f2(incr * TEST.value)) },
    { what: 'Value won back (whole dollars)', value: incr * TEST.value, shown: Number((incr * TEST.value).toFixed(0)), tol: 0.5 },
    { what: 'Net', value: net, shown: Number(f2(net)) },
    { what: 'p_T (3 dp)', value: T.p1, shown: Number(T.p1.toFixed(3)), tol: 0.0005 },
    { what: 'Break-even', value: breakEven * 100, shown: Number((breakEven * 100).toFixed(2)) },
    { what: 'Estimate above break-even, low end below', value: Number(T.diff > breakEven && T.low < breakEven), shown: 1 },
    { what: 'Loss at the low end', value: -netAt(T.low), shown: Number(f2(-netAt(T.low))) },
    { what: 'Loss at the low end (whole dollars)', value: -netAt(T.low), shown: Number((-netAt(T.low)).toFixed(0)), tol: 0.5 },
    { what: 'Power', value: power * 100, shown: Number((power * 100).toFixed(0)), tol: 0.5 },
    { what: 'n for 5→10', value: nNeed, shown: 432 },
    { what: 'n for 5→7.5', value: nNeed3, shown: 1468 },
    { what: '1,468', value: nNeed3, shown: 1468 },
    { what: 'Group size gave well under 80% power', value: Number(power < 0.8), shown: 1 },
    { what: '20% holdout', value: 20, shown: 20 },
    { what: 'A fifth', value: 100 / 5, shown: 20 },
    // bookshop
    { what: 'Bookshop 11.0%', value: 66 / 600 * 100, shown: 11.0, tol: 1e-9 },
    { what: 'Bookshop 8.0%', value: 48 / 600 * 100, shown: 8.0, tol: 1e-9 },
    { what: 'Bookshop diff', value: (66 - 48) / 600 * 100, shown: 3.0, tol: 1e-9 },
    { what: 'Bookshop 18 buyers', value: 600 * 0.03, shown: 18, tol: 1e-9 },
    { what: 'Bookshop CI includes 0', value: Number(0.03 - 1.96 * Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600) < 0), shown: 1 },
    { what: 'Bookshop SE', value: propTest2(66, 600, 48, 600).se * 100, shown: Number((Math.sqrt(0.11 * 0.89 / 600 + 0.08 * 0.92 / 600) * 100).toFixed(2)) },
    // studies
    { what: 'Kivetz 20%', value: 20, shown: 20 },
    { what: 'Kivetz 108', value: 108, shown: 108 },
    { what: 'Kivetz 12.7 days', value: 12.7, shown: 12.7 },
    { what: 'Kivetz 15.6 days', value: 15.6, shown: 15.6 },
    { what: 'Dowling & Uncles 10%', value: 10, shown: 10 },
    { what: 'Sharp & Sharp two of six', value: 2 / 6, shown: 1 / 3, tol: 1e-9 },
    // the 5% claim
    { what: 'Five points at 60%', value: lift5(0.6) * 100, shown: Number((lift5(0.6) * 100).toFixed(0)), tol: 0.5 },
    { what: 'Five points at 80%', value: lift5(0.8) * 100, shown: Number((lift5(0.8) * 100).toFixed(0)), tol: 0.5 },
    { what: 'Five points at 90%', value: lift5(0.9) * 100, shown: Number((lift5(0.9) * 100).toFixed(0)), tol: 0.5 },
    { what: 'Largest where retention is high', value: Number(lift5(0.9) > lift5(0.8) && lift5(0.8) > lift5(0.6)), shown: 1 },
  ],
};
