// probability.js — B04 · Probability. Content only; exercises are in probability.ex.js. Uses the spring orders'
// channel × subscription table (CHANNEL_SUBSCRIPTION) and region × subscription table (REGION_SUBSCRIPTION), and B01's
// December order count. The chi-square test of these tables is module 4's: here independence is only compared
// informally. Tillwise, Lantern's payment provider, and its fraud screen's rates are fictional and labelled, as is Ana's
// subjective probability. Every printed figure is recomputed in `checks`.
import { CHANNEL_SUBSCRIPTION as CS, REGION_SUBSCRIPTION as RS, SHOP } from './case.js?v=15';
import { combin, permut } from '../../../core/inference.js?v=15';

const f = (v, d = 3) => v.toFixed(d);
const pc = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const sum = (a) => a.reduce((s, x) => s + x, 0);

// ---------------------------------------------------------------- channel × subscription
const [[ws, wo], [as, ao]] = CS.counts;
const N = ws + wo + as + ao, web = ws + wo, app = as + ao, sub = ws + as, one = wo + ao;
const pApp = app / N, pSub = sub / N, pWeb = web / N, pAppSub = as / N;
const pSubApp = as / app, pSubWeb = ws / web, pAppGivenSub = as / sub;
const pAppOrSub = pApp + pSub - pAppSub;
const expAppSub = app * sub / N;

// ---------------------------------------------------------------- region × subscription
const REG = RS.rows, RC = RS.counts;
const regTot = RC.map(([s, o]) => s + o);
const iE = REG.indexOf('East');
const [es, eo] = RC[iE], east = es + eo;
const pSubEast = es / east, pEastSub = es / sub, pEast = east / N;
const expEastSub = east * sub / N;
const twoEast = (es / sub) * ((es - 1) / (sub - 1));

// ---------------------------------------------------------------- drawing without replacement
const twoSubWithout = (sub / N) * ((sub - 1) / (N - 1)), twoSubWith = (sub / N) ** 2;

// ---------------------------------------------------------------- Tillwise fraud screen (fictional rates)
const BASE = 0.004, SENS = 0.95, FPR = 0.02;
const flagRate = BASE * SENS + (1 - BASE) * FPR;
const post = BASE * SENS / flagRate;
const postNeg = BASE * (1 - SENS) / (BASE * (1 - SENS) + (1 - BASE) * (1 - FPR));
const per = 10000, fraudN = per * BASE, fraudFlag = fraudN * SENS, genuineN = per - fraudN, genuineFlag = genuineN * FPR;
const DEC = SHOP.webOrders[5] + SHOP.appOrders[5];                    // December 2026 orders (B01)

// ---------------------------------------------------------------- figure: tree diagram
function treeFigure() {
  const W = 640, H = 300, bw = 68;
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor">`;
  const root = [34, 150], mid = [[200, 82], [200, 218]], leaves = [[360, 40], [360, 124], [360, 176], [360, 260]];
  const line = (a, b) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--ink)" stroke-width="1.4"/>`;
  s += line(root, [mid[0][0] - bw / 2, mid[0][1]]) + line(root, [mid[1][0] - bw / 2, mid[1][1]]);
  [[0, 0], [0, 1], [1, 2], [1, 3]].forEach(([m, l]) => { s += line([mid[m][0] + bw / 2, mid[m][1]], leaves[l]); });
  s += `<circle cx="${root[0]}" cy="${root[1]}" r="5" fill="var(--ink)"/>`;
  s += `<text x="${root[0]}" y="${root[1] + 22}" text-anchor="middle" font-size="11" fill="var(--ink-3)">an order</text>`;
  const node = (p, label) => `<rect x="${p[0] - bw / 2}" y="${p[1] - 13}" width="${bw}" height="26" rx="5" fill="var(--series-1)" fill-opacity="0.15" stroke="var(--series-1)" stroke-width="1.2"/><text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle">${label}</text>`;
  s += node(mid[0], 'Web') + node(mid[1], 'App');
  s += `<text x="100" y="102" text-anchor="middle" font-size="11">${f(pWeb)}</text><text x="100" y="210" text-anchor="middle" font-size="11">${f(pApp)}</text>`;
  const leafRows = [['Subscription', pSubWeb, ws], ['One-off', 1 - pSubWeb, wo], ['Subscription', pSubApp, as], ['One-off', 1 - pSubApp, ao]];
  leaves.forEach((p, i) => {
    const m = mid[i < 2 ? 0 : 1], [lab, pr, c] = leafRows[i];
    s += `<text x="${(m[0] + bw / 2 + p[0]) / 2}" y="${(m[1] + p[1]) / 2 + (i % 2 ? 18 : -8)}" text-anchor="middle" font-size="11">${f(pr)}</text>`;
    s += `<text x="${p[0] + 8}" y="${p[1] + 4}">${lab}</text>`;
    s += `<text x="${p[0] + 104}" y="${p[1] + 4}" font-size="11" fill="var(--ink-3)">${f(i < 2 ? pWeb : pApp)} × ${f(pr)} = ${f(c / N)}</text>`;
  });
  s += `<text x="200" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink-3)">P(channel)</text><text x="300" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink-3)">P(subscription | channel)</text><text x="530" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--ink-3)">joint probability</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'probability',
  title: 'Probability',
  blurb: 'Probability is the language every test and interval in this course is written in. Learn to read joint, marginal and conditional probabilities from a contingency table, to use the addition and multiplication rules, to check whether two events are independent, to draw a tree diagram, and to turn a screen’s accuracy into the probability that a flagged case is real with Bayes’ rule.',
  status: 'reviewed',
  objectives: [
    'Define an experiment, its sample space and its events, and distinguish classical, relative-frequency and subjective probability.',
    'Calculate joint, marginal and conditional probabilities from a contingency table, and the probability of a complement, a union and an intersection.',
    'Decide whether two events are independent by comparing P(A | B) with P(A), and say what independence would predict for a table.',
    'Use a tree diagram and the multiplication rule for events in sequence, with and without replacement.',
    'Apply Bayes’ rule to a screening problem, explaining the role of the base rate and of false positives.',
    'Calculate the number of possible samples and arrangements with COMBIN and PERMUT.',
  ],
  prerequisites: [
    { lesson: 'b04/describing-distributions', why: 'Proportions, the notation for parameters and statistics, and the 231 spring orders.' },
    { lesson: 'b03/pivot-tables', why: 'A PivotTable of channel against subscription, and % of Row Total, are the contingency tables of this lesson.' },
    { lesson: 'b01/interpreting-results', why: 'Association is not causation, and confounding, which matter when two events turn out not to be independent.' },
    { lesson: 'b01/data-collection', why: 'Simple random samples, which make every order equally likely to be chosen.' },
  ],
  case: 'lantern',

  concept: [
    { case: `In B03, a PivotTable of the spring orders showed that app orders were more often subscriptions than web orders, and Ana wants to say it precisely. If she picks one of the ${N} orders at random, how likely is it to be a subscription, and does knowing that it came through the app change that? And when Tillwise (fictional), the company that processes Lantern’s card payments, flags an order as possible fraud, how likely is the order to be fraudulent? All three are questions of probability.` },

    { h: 'Experiments, sample spaces and events' },
    { p: `An <b>experiment</b> is any process with an uncertain outcome: drawing an order at random, the next customer’s rating, whether a quote is accepted. Its <g>sample space</g> is the set of all possible outcomes, and an <g>event</g> is any set of outcomes. Picking one spring order at random has a sample space of ${N} orders; “the order is a subscription” is an event containing ${sub} of them.` },
    { p: `A <g>probability</g> is a number from 0 to 1 that measures how likely an event is: 0 for impossible, 1 for certain. The probabilities of all the outcomes in a sample space add to 1. Writing <m>P(A)</m> for the probability of event <m>A</m>, the chance that a randomly drawn spring order is a subscription is <m>P(\\text{sub}) = ${sub} \\div ${N} \\approx ${f(pSub)}</m>.` },

    { h: 'Three ways to assign a probability' },
    { list: [
      `<b>Classical</b>: when every outcome is equally likely, <m>P(A)</m> is the number of outcomes in <m>A</m> divided by the number in the sample space. A draw at random from the ${N} orders is exactly such an experiment, which is why <m>${sub} \\div ${N}</m> is the probability.`,
      `<b>Relative frequency</b>: the share of times an event happens in a long run of repetitions. Treat ${pc(pSub)} as the chance that Ana’s <i>next</i> order is a subscription and you are using the spring’s <g>relative frequency</g> as an estimate. The <g>law of large numbers</g> says that the relative frequency settles closer and closer to the true probability as the repetitions grow, which is why estimates from many orders are steadier than estimates from few.`,
      `<b>Subjective</b>: a judgement of how likely an event is, used when there is no long run to count. Ana’s view that there is a 60% chance her largest café client renews its contract (fictional) is a subjective probability. It must still obey the rules below, and it should be revised when evidence arrives, which is what Bayes’ rule does.`,
    ] },

    { h: 'Reading probabilities from a contingency table' },
    { p: `A <g>contingency table</g> counts observations by two categorical variables at once: B03’s PivotTable of channel against subscription is one. Dividing every count by the grand total turns it into a table of probabilities for an order drawn at random.` },
    { table: {
      caption: `Lantern’s ${N} spring orders by channel and subscription: counts, with probabilities for an order drawn at random`,
      head: ['', 'Subscription', 'One-off', 'Total'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Web', `${ws} (${f(ws / N)})`, `${wo} (${f(wo / N)})`, `${web} (${f(pWeb)})`],
        ['App', `${as} (${f(as / N)})`, `${ao} (${f(ao / N)})`, `${app} (${f(pApp)})`],
      ],
      foot: [['Total', `${sub} (${f(pSub)})`, `${one} (${f(one / N)})`, `${N} (1.000)`]],
    } },
    { list: [
      `A <g>joint probability</g> is the probability that two events both happen, read from the body of the table: <m>P(\\text{app and sub}) = ${as} \\div ${N} \\approx ${f(pAppSub)}</m>.`,
      `A <g>marginal probability</g> is the probability of one event on its own, read from the margins: <m>P(\\text{app}) = ${app} \\div ${N} \\approx ${f(pApp)}</m> and <m>P(\\text{sub}) \\approx ${f(pSub)}</m>.`,
      `A <g>conditional probability</g> is the probability of one event given that another has happened. <m>P(\\text{sub} \\mid \\text{app})</m>, read “the probability of a subscription given an app order”, keeps only the ${app} app orders: <m>${as} \\div ${app} \\approx ${f(pSubApp)}</m>. For web orders it is <m>${ws} \\div ${web} \\approx ${f(pSubWeb)}</m>.`,
    ] },
    { p: `Conditioning shrinks the sample space to the orders that meet the condition. That is why the order of the bar matters: <m>P(\\text{app} \\mid \\text{sub}) = ${as} \\div ${sub} \\approx ${f(pAppGivenSub)}</m> is a different question (of the subscription orders, what share came through the app?) with a different answer. B03’s % of Row Total and % of Column Total are these two conditional probabilities, as percentages.` },

    { h: 'Complements and “or”' },
    { p: String.raw`The <g>complement</g> of an event <m>A</m>, written <m>A'</m> (“not A”), is every outcome not in <m>A</m>, so <m>P(A') = 1 - P(A)</m>: the chance an order is one-off is <m>1 - ${f(pSub)} = ${f(1 - pSub)}</m>. For “or”, add the two probabilities and take away the overlap, which would otherwise be counted twice: <m>P(\text{app or sub}) = ${f(pApp)} + ${f(pSub)} - ${f(pAppSub)} = ${f(pAppOrSub)}</m>. Check it with counts: the ${app} app orders plus the ${ws} web subscriptions make ${app + ws} orders, and <m>${app + ws} \div ${N} \approx ${f((app + ws) / N)}</m>.` },
    { p: `Two events are <g>mutually exclusive</g> when they can’t happen together, like “web order” and “app order” for the same order. Their overlap is empty, so the probability of one or the other is the plain sum: <m>${f(pWeb)} + ${f(pApp)} = 1</m>.` },

    { h: 'Independence' },
    { p: `Two events are <g>independent</g> when knowing that one happened doesn’t change the probability of the other: <m>P(A \\mid B) = P(A)</m>. Here it fails. An order’s chance of being a subscription is ${f(pSub)} overall but ${f(pSubApp)} among app orders and ${f(pSubWeb)} among web orders. In these orders, channel and subscription are associated.` },
    { p: `Independence also predicts what the table would look like. If channel told you nothing about subscription, the ${app} app orders would contain subscriptions in the overall proportion, <m>${app} \\times ${sub} \\div ${N} \\approx ${f(expAppSub, 1)}</m>, instead of the ${as} observed. Whether a gap of about ${Math.round(as - expAppSub)} orders is more than chance would produce in ${N} orders is a test question; module 4’s chi-square test answers it. And even a real association wouldn’t show that the app causes subscriptions: app users may be Lantern’s most loyal customers in the first place.` },
  ],

  theory: [
    { h: 'The rules of probability' },
    { p: String.raw`Every way of assigning probabilities must obey the same rules. For any event, <m>0 \leq P(A) \leq 1</m>, and the whole sample space has probability 1. The complement rule follows: <m>P(A') = 1 - P(A)</m>. The <b>addition rule</b> gives “or”, the union <m>A \cup B</m>: <m>P(A \text{ or } B) = P(A) + P(B) - P(A \text{ and } B)</m>. Here “and” is the intersection <m>A \cap B</m>, the outcomes in both events, and its probability is 0 for mutually exclusive events.` },
    { p: String.raw`Conditional probability is defined from the joint and marginal probabilities, <m>P(A \mid B) = P(A \text{ and } B) \div P(B)</m>, for any <m>B</m> with <m>P(B) > 0</m>. Rearranged, it is the <b>multiplication rule</b>: <m>P(A \text{ and } B) = P(B) \times P(A \mid B)</m>. With the table, <m>P(\text{app and sub}) = ${f(pApp)} \times ${f(pSubApp)} \approx ${f(pAppSub)}</m>, the same joint probability as before.` },
    { p: String.raw`For independent events the multiplication rule simplifies to <m>P(A \text{ and } B) = P(A) \times P(B)</m>. Three checks are equivalent, and any one of them shows independence: <m>P(A \mid B) = P(A)</m>, <m>P(B \mid A) = P(B)</m>, or <m>P(A \text{ and } B) = P(A)P(B)</m>. For channel and subscription, <m>P(\text{app})P(\text{sub}) = ${f(pApp)} \times ${f(pSub)} \approx ${f(pApp * pSub)}</m>, against the joint probability of ${f(pAppSub)}.` },
    { callout: 'warn', title: 'Mutually exclusive is not independent', html: 'The two ideas are often confused, but they are close to opposites. If two events with positive probabilities are mutually exclusive, knowing that one happened tells you the other didn’t: its probability drops to 0, so they can’t be independent. Independence is about whether one event carries information about the other; mutual exclusivity is about whether they can happen together.' },

    { h: 'Probabilities in Excel' },
    { p: `A PivotTable gives the counts, and B03’s % of Grand Total, % of Row Total and % of Column Total turn them into joint and conditional probabilities. The same numbers come from formulas on the order sheet, with channel in column K and subscription in column L: <x>=COUNTIFS(K2:K232,"app",L2:L232,"yes")/COUNT(J2:J232)</x> is the joint probability ${f(pAppSub)}, and <x>=COUNTIFS(K2:K232,"app",L2:L232,"yes")/COUNTIF(K2:K232,"app")</x> is the conditional probability ${f(pSubApp)}. The pattern is always the same: the count of orders that meet both conditions, divided by the count of orders that meet the condition after the bar (or by all orders, for a joint probability).` },
    { p: `Formulas have two advantages over a PivotTable for this work. They update when the data change, and they make the condition visible: anyone reading <x>COUNTIF(K2:K232,"app")</x> in the denominator can see that the probability is conditional on an app order. When a report quotes a percentage, the first check is the denominator, because a share of all orders, a share of app orders and a share of subscription orders are three different probabilities.` },

    { h: 'Tree diagrams' },
    { p: 'A <g>tree diagram</g> shows events in sequence. Each branch carries the probability of an event given everything to its left, so the first branches are marginal probabilities and later ones conditional. Multiplying along a path gives the joint probability of that path (the multiplication rule), and the paths’ probabilities add to 1.' },
    { figure: {
      svg: treeFigure(),
      caption: 'The channel × subscription table as a tree. The first branches split orders by channel; the second by subscription, given the channel. Multiplying along each path gives the joint probabilities in the table.',
      alt: `A tree diagram growing left to right. From a point labelled an order, two branches lead to Web (probability ${f(pWeb)}) and App (probability ${f(pApp)}). From Web, branches lead to Subscription (${f(pSubWeb)}) and One-off (${f(1 - pSubWeb)}); from App, to Subscription (${f(pSubApp)}) and One-off (${f(1 - pSubApp)}). At the end of each path the joint probability is written as a product: web and subscription ${f(ws / N)}, web and one-off ${f(wo / N)}, app and subscription ${f(as / N)}, app and one-off ${f(ao / N)}.`,
    } },
    { p: String.raw`Adding the paths that end in “subscription” recovers the marginal probability: <m>${f(ws / N)} + ${f(as / N)} = ${f(pSub)}</m>. This is the <b>law of total probability</b>: <m>P(A) = P(B)P(A \mid B) + P(B')P(A \mid B')</m>. It is the denominator of Bayes’ rule.` },

    { h: 'Sampling with and without replacement' },
    { p: String.raw`Draw two spring orders at random. If the first is put back before the second is drawn (<i>with replacement</i>), the draws are independent and <m>P(\text{both subscriptions}) = (${sub} \div ${N})^2 \approx ${f(twoSubWith, 4)}</m>. If it isn’t (<i>without replacement</i>), the second draw depends on the first: <m>${sub} \div ${N} \times ${sub - 1} \div ${N - 1} \approx ${f(twoSubWithout, 4)}</m>. Surveys and audits sample without replacement, but when the sample is a small part of the population the two answers are almost the same. That is why the next lesson can treat a few draws from a large population as independent; OpenStax’s rule of thumb is a sample of fewer than 10% of the population.` },

    { h: 'Bayes’ rule' },
    { p: String.raw`Tillwise screens every card payment and flags some as possible fraud. Suppose (all rates fictional) that 0.4% of orders are fraudulent, the <g>base rate</g>; that the screen flags 95% of fraudulent orders; and that it also flags 2% of genuine ones, its <g>false positive</g> rate. If an order is flagged, what is the probability it is fraudulent? The screen’s 95% is <m>P(\text{flag} \mid \text{fraud})</m>; the question asks for <m>P(\text{fraud} \mid \text{flag})</m>. <g>Bayes’ rule</g> turns one into the other:` },
    { math: String.raw`P(\text{fraud} \mid \text{flag}) = \frac{P(\text{fraud})\,P(\text{flag} \mid \text{fraud})}{P(\text{fraud})\,P(\text{flag} \mid \text{fraud}) + P(\text{genuine})\,P(\text{flag} \mid \text{genuine})} = \frac{0.004 \times 0.95}{0.004 \times 0.95 + 0.996 \times 0.02} \approx ${f(post)}` },
    { p: `Only about ${pc(post, 0)} of flagged orders are fraudulent. Natural frequencies make the reason visible. Of ${per.toLocaleString('en-US')} orders, ${fraudN} are fraudulent and ${fraudFlag} of them are flagged; of the ${genuineN.toLocaleString('en-US')} genuine orders, 2%, about ${Math.round(genuineFlag)}, are flagged too. So ${fraudFlag} of about ${Math.round(fraudFlag + genuineFlag)} flagged orders are fraud. When the base rate is low, even a small false-positive rate produces more false alarms than real cases.` },
    { p: `Confusing <m>P(\\text{flag} \\mid \\text{fraud})</m> with <m>P(\\text{fraud} \\mid \\text{flag})</m> is sometimes called the confusion of the inverse; it usually comes from ignoring the base rate (base-rate neglect), and it lies behind many bad decisions about screening tests, alarms and audits. The reverse question gives a reassuring answer: an order that is <i>not</i> flagged is fraudulent with probability about ${f(postNeg, 4)}, two in ten thousand. A screen like this is good at clearing orders and poor at convicting them.` },

    { h: 'Counting outcomes: COMBIN and PERMUT' },
    { p: String.raw`Classical probability needs the number of equally likely outcomes, and counting them is often the hard part. The number of ways to choose <m>k</m> items from <m>n</m> when order doesn’t matter is the number of combinations, <m>\binom{n}{k} = n! \div (k!\,(n - k)!)</m>, Excel’s <x>=COMBIN(n,k)</x>; when order matters it is the number of permutations, <m>n! \div (n - k)!</m>, <x>=PERMUT(n,k)</x>. Here <m>n!</m> (“n factorial”) is <m>n \times (n - 1) \times \dots \times 1</m>.` },
    { p: `Ana could draw ${combin(N, 5).toLocaleString('en-US')} different samples of 5 orders from the ${N}: <x>=COMBIN(231,5)</x>. A <g>simple random sample</g> makes each of them equally likely. Choosing 3 of 5 trainees for a photo can be done in <x>=COMBIN(5,3)</x> = ${combin(5, 3)} ways, but lining 3 of them up in order in <x>=PERMUT(5,3)</x> = ${permut(5, 3)} ways, because each group of 3 can be arranged in <m>3! = 6</m> orders. Combinations return in the next lesson, where they count the ways a binomial outcome can happen.` },
  ],

  formulas: [
    { id: 'pr-complement', name: 'Complement rule',
      tex: String.raw`P(A') = 1 - P(A)`,
      where: [[String.raw`A`, 'An event', ''], [String.raw`A'`, 'Its complement: every outcome not in A', ''], [String.raw`P(\cdot)`, 'Probability, from 0 to 1', '']] },
    { id: 'pr-addition', name: 'Addition rule',
      tex: String.raw`P(A \text{ or } B) = P(A) + P(B) - P(A \text{ and } B)`,
      where: [[String.raw`A, B`, 'Two events', ''], [String.raw`P(A \text{ and } B)`, 'Their joint probability (the overlap)', '']],
      note: 'For mutually exclusive events P(A and B) = 0, so P(A or B) = P(A) + P(B).' },
    { id: 'pr-conditional', name: 'Conditional probability and the multiplication rule',
      tex: String.raw`P(A \mid B) = \dfrac{P(A \text{ and } B)}{P(B)}, \qquad P(A \text{ and } B) = P(B)\,P(A \mid B)`,
      where: [[String.raw`P(A \mid B)`, 'Probability of A given that B has happened', ''], [String.raw`P(B)`, 'Probability of the condition (must be more than 0)', '']],
      note: 'From a table of counts: the count in the cell divided by the count of the condition’s row or column.' },
    { id: 'pr-independence', name: 'Independence',
      tex: String.raw`A, B \text{ independent} \iff P(A \mid B) = P(A) \iff P(A \text{ and } B) = P(A)\,P(B)`,
      where: [[String.raw`A, B`, 'Two events with positive probability', ''], [String.raw`P(\cdot)`, 'Probability of the event in brackets', '']],
      note: 'If independent, the expected count in a table cell is row total × column total ÷ grand total.' },
    { id: 'pr-bayes', name: 'Bayes’ rule',
      tex: String.raw`P(A \mid B) = \dfrac{P(A)\,P(B \mid A)}{P(A)\,P(B \mid A) + P(A')\,P(B \mid A')}`,
      where: [[String.raw`P(A)`, 'Prior probability (the base rate) of A', ''], [String.raw`P(B \mid A)`, 'Probability of the evidence B when A is true (a screen’s sensitivity)', ''], [String.raw`P(B \mid A')`, 'Probability of the evidence when A is false (the false-positive rate)', ''], [String.raw`P(A \mid B)`, 'Probability of A after seeing B', '']],
      assumptions: 'The denominator is P(B), by the law of total probability.' },
    { id: 'pr-counting', name: 'Combinations and permutations (COMBIN, PERMUT)',
      tex: String.raw`\binom{n}{k} = \dfrac{n!}{k!\,(n - k)!}, \qquad P(n, k) = \dfrac{n!}{(n - k)!}`,
      where: [[String.raw`n`, 'Number of items to choose from', ''], [String.raw`k`, 'Number chosen', ''], [String.raw`n!`, 'n factorial: n × (n − 1) × … × 1, with 0! = 1', ''], [String.raw`P(n, k)`, 'Number of ordered selections (permutations)', '']],
      note: 'In Excel: <x>=COMBIN(n,k)</x> and <x>=PERMUT(n,k)</x>; <x>=FACT(n)</x> gives n!.' },
  ],

  examples: [
    { level: 'simple', title: 'Four probabilities from the channel table', fictional: true,
      setup: `One of Lantern’s ${N} spring orders is drawn at random. Using the channel × subscription table, find P(web), P(web and one-off), P(one-off | web) and P(web or one-off).`,
      steps: [
        String.raw`Marginal: <m>P(\text{web}) = ${web} \div ${N} \approx ${f(pWeb)}</m>.`,
        String.raw`Joint: <m>P(\text{web and one-off}) = ${wo} \div ${N} \approx ${f(wo / N)}</m>.`,
        String.raw`Conditional: keep only the ${web} web orders, <m>P(\text{one-off} \mid \text{web}) = ${wo} \div ${web} \approx ${f(wo / web)}</m>. Check with the multiplication rule: <m>${f(pWeb)} \times ${f(wo / web)} \approx ${f(wo / N)}</m>.`,
        String.raw`Addition rule: <m>P(\text{web or one-off}) = ${f(pWeb)} + ${f(one / N)} - ${f(wo / N)} = ${f((web + one - wo) / N)}</m>, the ${web + one - wo} orders that are web, one-off or both. Its complement is the ${as} app subscriptions: <m>1 - ${f((web + one - wo) / N)} = ${f(as / N)}</m>.`,
      ],
      answer: `P(web) ≈ ${f(pWeb)}, P(web and one-off) ≈ ${f(wo / N)}, P(one-off | web) ≈ ${f(wo / web)}, P(web or one-off) ≈ ${f((web + one - wo) / N)}.`,
      interpretation: `Almost two web orders in three are one-off purchases. The “or” probability is easiest through its complement: the only orders that are neither web nor one-off are the app subscriptions.` },

    { level: 'challenging', title: 'Are East orders more often subscriptions?', fictional: true,
      setup: `By region, the spring orders split as follows (subscription, one-off): ${REG.map((g, i) => `${g} ${RC[i][0]} and ${RC[i][1]}`).join('; ')}. Is region independent of subscription for these orders? What would independence predict for the East? And if Ana picks two subscription orders at random, without replacement, for a follow-up call, what is the chance both are from the East?`,
      table: {
        caption: 'Spring orders by region and subscription',
        head: ['Region', 'Subscription', 'One-off', 'Total', 'P(sub | region)'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: REG.map((g, i) => [g, String(RC[i][0]), String(RC[i][1]), String(regTot[i]), f(RC[i][0] / regTot[i])]),
        foot: [['Total', String(sub), String(one), String(N), f(pSub)]],
      },
      steps: [
        String.raw`Compare each region’s conditional probability with the overall one. <m>P(\text{sub} \mid \text{East}) = ${es} \div ${east} = ${f(pSubEast, 2)}</m>, far above <m>P(\text{sub}) \approx ${f(pSub)}</m>; North (${f(RC[0][0] / regTot[0])}) and West (${f(RC[3][0] / regTot[3])}) are below it. The conditional probabilities differ, so region and subscription are not independent in these orders.`,
        String.raw`What independence predicts: the ${east} East orders would contain subscriptions in the overall proportion, <m>${east} \times ${sub} \div ${N} \approx ${f(expEastSub, 1)}</m>, against ${es} observed.`,
        String.raw`Turn the condition round: <m>P(\text{East} \mid \text{sub}) = ${es} \div ${sub} = ${f(pEastSub)}</m>, against <m>P(\text{East}) = ${east} \div ${N} \approx ${f(pEast)}</m>. The East supplies ${pc(pEastSub, 1)} of subscription orders but ${pc(pEast, 1)} of all orders.`,
        String.raw`Two subscription orders without replacement: <m>P(\text{both East}) = \tfrac{${es}}{${sub}} \times \tfrac{${es - 1}}{${sub - 1}} \approx ${f(twoEast, 4)}</m>. The second fraction is conditional on the first call being to an East customer, so one East order has left the pool.`,
      ],
      answer: `Not independent: P(sub | East) = ${f(pSubEast, 2)} against P(sub) ≈ ${f(pSub)}; independence would predict about ${f(expEastSub, 1)} East subscriptions, not ${es}. P(both calls go to the East) ≈ ${f(twoEast, 3)}.`,
      interpretation: 'In the spring data, East customers subscribe far more often than others. That is a description of these orders: whether the gap is bigger than chance is module 4’s chi-square test, and why it exists (a local café partner promoting subscriptions? the delivery schedule?) is a question the data can’t answer alone.' },

    { level: 'applied', title: 'Should flagged orders be cancelled automatically?', fictional: true,
      setup: `Tillwise offers Ana a setting that cancels every flagged order automatically. Using the fictional rates above (base rate 0.4%, 95% of fraud flagged, 2% of genuine orders flagged) and Lantern’s ${DEC} orders in December 2026, how many orders would be cancelled in a month like December, how many of them genuine, and what should Ana choose?`,
      steps: [
        String.raw`Probability that an order is flagged (law of total probability): <m>0.004 \times 0.95 + 0.996 \times 0.02 = ${f(flagRate, 5)}</m>. In December, <m>${DEC} \times ${f(flagRate, 5)} \approx ${f(DEC * flagRate, 1)}</m> orders would be flagged.`,
        String.raw`Of those, fraudulent: <m>${DEC} \times 0.004 \times 0.95 \approx ${f(DEC * BASE * SENS, 1)}</m>; genuine: <m>${DEC} \times 0.996 \times 0.02 \approx ${f(DEC * (1 - BASE) * FPR, 1)}</m>.`,
        String.raw`Bayes’ rule gives the same split as a probability: <m>P(\text{fraud} \mid \text{flag}) \approx ${f(post)}</m>, so about ${Math.round(post * 100)}% of cancelled orders would be fraud and ${Math.round((1 - post) * 100)}% genuine customers.`,
        `Weigh the outcomes. Automatic cancellation would turn away about ${Math.round(DEC * (1 - BASE) * FPR)} genuine December customers to stop about ${Math.round(DEC * BASE * SENS)} fraudulent orders. Holding flagged orders for a manual check instead costs about ${Math.round(DEC * flagRate)} short reviews a month.`,
      ],
      answer: `About ${Math.round(DEC * flagRate)} December orders would be flagged; about ${Math.round(DEC * (1 - BASE) * FPR)} of them genuine. Ana should hold flagged orders for review rather than cancel them.`,
      interpretation: 'A flag raises the probability of fraud from 0.4% to about 16%, a forty-fold increase, but leaves most flagged orders genuine. The flag is a reason to look, not a verdict. If Ana’s real base rate is lower than 0.4%, the share of false alarms is even higher.' },
  ],

  demo: [
    { widget: 'pr-table', intro: 'The channel × subscription table with every probability in this lesson as a formula. Change the counts in B2:C3 and watch the conditional probabilities: make P(subscription | app) equal P(subscription | web) and check that the expected app subscriptions in B12 then match the observed count.' },
    { widget: 'pr-bayes', intro: 'Tillwise’s fictional fraud screen. Move the base rate down to 0.1% and the share of flagged orders that are fraud falls sharply; raise it to 5% and most flags are real. Then cut the false-positive rate: it matters far more than the share of fraud caught.' },
  ],

  mistakes: [
    { title: '“P(A | B) and P(B | A) are the same thing.”', html: 'They answer different questions. 57.6% of app orders are subscriptions, but 54.8% of subscriptions are app orders. With a rare event the gap is enormous: the fraud screen flags 95% of fraud, yet only 16% of flagged orders are fraud.' },
    { title: '“Mutually exclusive events are independent.”', html: 'They are the opposite: if two events can’t happen together, knowing one happened makes the other impossible. Independent events can happen together, and one tells you nothing about the other.' },
    { title: '“P(A or B) = P(A) + P(B).”', html: 'Only when A and B can’t both happen. Otherwise the overlap is counted twice: P(app or subscription) is 0.429 + 0.450 − 0.247 = 0.632, not 0.879.' },
    { title: '“The conditional probabilities differ, so one causes the other.”', html: 'A difference between P(subscription | app) and P(subscription | web) shows association in these orders. It may be chance (module 4 tests that), and even a real association can come from a confounding variable, such as loyal customers preferring the app.' },
    { title: '“Ignore the base rate: the screen is 95% accurate.”', html: 'A screen’s sensitivity and false-positive rate describe how it treats cases whose truth is known. What a flagged case means depends on how common the condition is. Always put the base rate into Bayes’ rule, or count natural frequencies.' },
  ],

  application: [
    { p: 'Conditional probabilities are how businesses read their own data. A retailer compares the share of app customers who return with the share of web customers; an insurer prices a policy from claim rates conditional on age and region; a bank tunes a fraud model by trading its sensitivity against its false-positive rate. In each case the first question is “conditional on what?”, and the second is whether the comparison is between groups that differ in other ways too.' },
    { p: 'Bayes’ rule is the arithmetic of screening, and screening is everywhere: credit checks, quality inspections, spam filters, medical tests, audit samples. The managerial lesson is that the value of a flag depends on the base rate. A screen that is excellent in a population where the problem is common can be mostly false alarms where it is rare, so a business should decide what a flag triggers (a review, a call, a hold) from the expected numbers of true and false flags, not from the screen’s headline accuracy.' },
    { case: `Ana sets Tillwise to hold flagged orders for her to check rather than cancel them, and adds a line to her shop review: “App orders were subscriptions ${pc(pSubApp, 0)} of the time, web orders ${pc(pSubWeb, 0)}; East orders ${pc(pSubEast, 0)}. These are differences in the spring’s orders; whether they are more than chance, and why, is still open.” Module 4 runs the test.` },
  ],

  summary: [
    'A probability is a number from 0 to 1; it can be classical (equally likely outcomes), a relative frequency (a long-run share) or subjective (a judgement), and all obey the same rules.',
    'From a contingency table: joint probabilities come from the cells, marginal probabilities from the totals, conditional probabilities from a cell divided by its row or column total.',
    'P(A′) = 1 − P(A); P(A or B) = P(A) + P(B) − P(A and B); P(A and B) = P(B) × P(A | B).',
    'A and B are independent when P(A | B) = P(A); independence predicts each cell’s count as row total × column total ÷ grand total.',
    'Mutually exclusive events can’t happen together and are not independent; P(A | B) is not P(B | A).',
    'A tree diagram multiplies along branches for joint probabilities; without replacement, later branches change.',
    'Bayes’ rule turns P(evidence | condition) into P(condition | evidence); with a low base rate most flags can be false positives.',
    'COMBIN counts unordered selections and PERMUT ordered ones; a simple random sample makes every combination equally likely.',
  ],

  glossary: [
    { term: 'Sample space', def: 'The set of all possible outcomes of an experiment, such as the 231 orders that a random draw could pick.' },
    { term: 'Event', def: 'A set of outcomes of an experiment, such as “the order drawn is a subscription”.' },
    { term: 'Probability', def: 'A number from 0 (impossible) to 1 (certain) that measures how likely an event is; the probabilities of all the outcomes in a sample space add to 1.' },
    { term: 'Relative frequency', def: 'The number of times an event occurs divided by the number of trials or observations; used as an estimate of its probability.' },
    { term: 'Law of large numbers', def: 'As an experiment is repeated more and more times, the relative frequency of an event tends to get closer to its probability, and the average of the results to the expected value.' },
    { term: 'Contingency table', def: 'A table that counts observations by two categorical variables at once, one in the rows and one in the columns, with row and column totals.' },
    { term: 'Joint probability', def: 'The probability that two events both happen, P(A and B); in a contingency table, a cell count divided by the grand total.' },
    { term: 'Marginal probability', def: 'The probability of one event regardless of the others; in a contingency table, a row or column total divided by the grand total.' },
    { term: 'Conditional probability', def: 'The probability of an event given that another has happened, P(A | B) = P(A and B) ÷ P(B).' },
    { term: 'Complement', def: 'All the outcomes not in an event A, written A′; P(A′) = 1 − P(A).' },
    { term: 'Mutually exclusive', def: 'Describes events that can’t happen together, so P(A and B) = 0 and P(A or B) = P(A) + P(B).' },
    { term: 'Independent', def: 'Describes events where knowing one has happened doesn’t change the probability of the other: P(A | B) = P(A), equivalently P(A and B) = P(A) × P(B). Two categorical variables are independent when this holds for every pair of their categories.' },
    { term: 'Tree diagram', def: 'A diagram of events in sequence whose branches carry probabilities, conditional on the branches before them; multiplying along a path gives its joint probability.' },
    { term: 'Bayes’ rule', def: 'P(A | B) = P(A) P(B | A) ÷ [P(A) P(B | A) + P(A′) P(B | A′)]: how the probability of A changes once evidence B is seen.' },
    { term: 'Base rate', def: 'How common a condition is in the population before any evidence is seen, such as the share of orders that are fraudulent; the prior probability in Bayes’ rule.' },
    { term: 'False positive', def: 'A case flagged by a screen or test that does not have the condition, such as a genuine order flagged as fraud. The false-positive rate is the share of cases without the condition that the screen flags, P(flag | no condition).' },
  ],

  references: [
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 3.1, “Terminology” (sample space, events, relative frequency, conditional probability). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/3-1-terminology', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, chapter 3, “Formula Review” (independence, mutually exclusive events, the multiplication and addition rules). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/3-formula-review', checked: '2026-10-24' },
    { text: 'Holmes, A., Illowsky, B. &amp; Dean, S. (2023). <i>Introductory Business Statistics 2e</i>, section 4.2, “Binomial Distribution” (sampling without replacement and the 10% rule). OpenStax.', url: 'https://openstax.org/books/introductory-business-statistics-2e/pages/4-2-binomial-distribution', checked: '2026-10-24' },
    { text: 'Ault, S. V., Liao, S. N. &amp; Musolino, L. (2025). <i>Principles of Data Science</i>, section 3.4, “Probability Theory” (Bayes’ theorem and a screening example). OpenStax.', url: 'https://openstax.org/books/principles-data-science/pages/3-4-probability-theory', checked: '2026-10-24' },
    { text: 'Microsoft Support. “COMBIN function”, with the page for PERMUT.', url: 'https://support.microsoft.com/en-us/office/combin-function-12a3f276-0a21-423a-8de6-06990aaf638a', checked: '2026-10-24' },
  ],

  checks: [
    { what: 'Orders', value: N, shown: 231 },
    { what: 'Subscriptions', value: sub, shown: 104 },
    { what: 'Web subscriptions', value: ws, shown: 47 },
    { what: 'Web one-off', value: wo, shown: 85 },
    { what: 'App subscriptions', value: as, shown: 57 },
    { what: 'App one-off', value: ao, shown: 42 },
    { what: 'Web orders', value: web, shown: 132 },
    { what: 'App orders', value: app, shown: 99 },
    { what: 'One-off orders', value: one, shown: 127 },
    { what: 'P(sub)', value: pSub, shown: 0.450, tol: 0.0005 },
    { what: 'P(sub) %', value: pSub * 100, shown: 45.0, tol: 0.05 },
    { what: 'P(app)', value: pApp, shown: 0.429, tol: 0.0005 },
    { what: 'P(web)', value: pWeb, shown: 0.571, tol: 0.0005 },
    { what: 'P(app and sub)', value: pAppSub, shown: 0.247, tol: 0.0005 },
    { what: 'P(sub | app)', value: pSubApp, shown: 0.576, tol: 0.0005 },
    { what: 'P(sub | app) %', value: pSubApp * 100, shown: 57.6, tol: 0.05 },
    { what: 'P(sub | web)', value: pSubWeb, shown: 0.356, tol: 0.0005 },
    { what: 'P(app | sub)', value: pAppGivenSub, shown: 0.548, tol: 0.0005 },
    { what: 'P(app | sub) %', value: pAppGivenSub * 100, shown: 54.8, tol: 0.05 },
    { what: 'P(one-off)', value: 1 - pSub, shown: 0.550, tol: 0.0005 },
    { what: 'P(app or sub)', value: pAppOrSub, shown: 0.632, tol: 0.0005 },
    { what: 'P(app or sub) by counts', value: (app + ws) / N, shown: pAppOrSub, tol: 1e-12 },
    { what: 'App or sub count', value: app + ws, shown: 146 },
    { what: 'P(app) + P(sub) without overlap', value: Number(f(pApp)) + Number(f(pSub)), shown: 0.879, tol: 0.0005 },
    { what: 'P(app) × P(sub)', value: pApp * pSub, shown: 0.193, tol: 0.0005 },
    { what: 'P(app) × P(sub | app) = joint', value: Number(f(pApp)) * Number(f(pSubApp)), shown: 0.247, tol: 0.0006 },
    { what: 'Expected app subscriptions if independent', value: expAppSub, shown: 44.6, tol: 0.05 },
    { what: 'Gap of about 12', value: as - expAppSub, shown: 12, tol: 0.5 },
    { what: 'Web and sub joint', value: ws / N, shown: 0.203, tol: 0.0005 },
    { what: 'Web and one-off joint', value: wo / N, shown: 0.368, tol: 0.0005 },
    { what: 'App and one-off joint', value: ao / N, shown: 0.182, tol: 0.0005 },
    { what: 'P(one-off | web)', value: wo / web, shown: 0.644, tol: 0.0005 },
    { what: 'P(one-off | app)', value: ao / app, shown: 0.424, tol: 0.0005 },
    { what: 'P(one-off) as share', value: one / N, shown: 0.550, tol: 0.0005 },
    { what: 'Paths to subscription add to P(sub)', value: Number(f(ws / N)) + Number(f(as / N)), shown: 0.450, tol: 0.0005 },
    { what: 'Web or one-off', value: (web + one - wo) / N, shown: 0.753, tol: 0.0005 },
    { what: 'Web or one-off count', value: web + one - wo, shown: 174 },
    { what: 'Complement of web or one-off', value: 1 - (web + one - wo) / N, shown: as / N, tol: 1e-12 },
    { what: 'Almost two web orders in three one-off', value: wo / web, shown: 0.64, tol: 0.03 },
    // regions
    { what: 'East subscriptions', value: es, shown: 39 },
    { what: 'East orders', value: east, shown: 52 },
    { what: 'P(sub | East)', value: pSubEast, shown: 0.75, tol: 1e-9 },
    { what: 'P(sub | East) %', value: pSubEast * 100, shown: 75, tol: 0.5 },
    { what: 'P(sub | North)', value: RC[0][0] / regTot[0], shown: 0.328, tol: 0.0005 },
    { what: 'P(sub | West)', value: RC[3][0] / regTot[3], shown: 0.321, tol: 0.0005 },
    { what: 'Expected East subscriptions', value: expEastSub, shown: 23.4, tol: 0.05 },
    { what: 'P(East | sub)', value: pEastSub, shown: 0.375, tol: 0.0005 },
    { what: 'P(East)', value: pEast, shown: 0.225, tol: 0.0005 },
    { what: 'East share of subs %', value: pEastSub * 100, shown: 37.5, tol: 0.05 },
    { what: 'East share of orders %', value: pEast * 100, shown: 22.5, tol: 0.05 },
    { what: 'Both East (4 dp)', value: twoEast, shown: 0.1383, tol: 0.00005 },
    { what: 'Both East (3 dp)', value: twoEast, shown: 0.138, tol: 0.0005 },
    { what: 'Regions add to 231', value: sum(regTot), shown: 231 },
    // replacement
    { what: 'Two subs with replacement', value: twoSubWith, shown: 0.2027, tol: 0.00005 },
    { what: 'Two subs without replacement', value: twoSubWithout, shown: 0.2016, tol: 0.00005 },
    // Bayes
    { what: 'P(fraud | flag)', value: post, shown: 0.160, tol: 0.0005 },
    { what: 'P(fraud | flag) %', value: post * 100, shown: 16, tol: 0.5 },
    { what: 'Fraud per 10,000', value: fraudN, shown: 40 },
    { what: 'Fraud flagged per 10,000', value: fraudFlag, shown: 38 },
    { what: 'Genuine per 10,000', value: genuineN, shown: 9960 },
    { what: 'Genuine flagged per 10,000', value: genuineFlag, shown: 199, tol: 0.5 },
    { what: 'Total flagged per 10,000', value: fraudFlag + genuineFlag, shown: 237, tol: 0.5 },
    { what: 'P(fraud | not flagged)', value: postNeg, shown: 0.0002, tol: 0.00005 },
    { what: 'Flag rate', value: flagRate, shown: 0.02372, tol: 0.000005 },
    { what: 'December orders (B01)', value: DEC, shown: 583 },
    { what: 'December flags', value: DEC * flagRate, shown: 13.8, tol: 0.05 },
    { what: 'December flags rounded', value: DEC * flagRate, shown: 14, tol: 0.5 },
    { what: 'December fraud flagged', value: DEC * BASE * SENS, shown: 2.2, tol: 0.05 },
    { what: 'December fraud flagged rounded', value: DEC * BASE * SENS, shown: 2, tol: 0.5 },
    { what: 'December genuine flagged', value: DEC * (1 - BASE) * FPR, shown: 11.6, tol: 0.05 },
    { what: 'December genuine flagged rounded', value: DEC * (1 - BASE) * FPR, shown: 12, tol: 0.5 },
    { what: 'Fraud share of cancellations %', value: Math.round(post * 100), shown: 16 },
    { what: 'Genuine share of cancellations %', value: Math.round((1 - post) * 100), shown: 84 },
    { what: 'Forty-fold increase', value: post / BASE, shown: 40, tol: 0.5 },
    // counting
    { what: 'COMBIN(231,5)', value: combin(231, 5), shown: 5247527901 },
    { what: 'COMBIN(5,3)', value: combin(5, 3), shown: 10 },
    { what: 'PERMUT(5,3)', value: permut(5, 3), shown: 60 },
    { what: '3! orderings', value: permut(5, 3) / combin(5, 3), shown: 6 },
    { what: 'Subjective probability (fictional)', value: 0.6 * 100, shown: 60 },
  ],
};
