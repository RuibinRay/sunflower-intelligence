// probability.ex.js — B04 · Probability: widgets, practice and the knowledge check (answer keys live here). Lantern's
// tables come from case.js; Tillwise's screen, the café early-warning flag, the spam filter and Gorse Lane Cycle Hire
// are fictional. Formula items are marked by their results (core/sheet.js gradeFormula); num items recompute their
// answers in `check`.
import { CHANNEL_SUBSCRIPTION as CS, REGION_SUBSCRIPTION as RS, EVENTS, EVENT_COLUMNS } from './case.js?v=20';
import { combin, permut } from '../../../core/inference.js?v=20';

const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const f = (v, d = 3) => v.toFixed(d);
const [[ws, wo], [as, ao]] = CS.counts;
const N = ws + wo + as + ao, app = as + ao, sub = ws + as, one = wo + ao;
const REG = RS.rows, RC = RS.counts, regTot = RC.map(([s, o]) => s + o);
const iN = REG.indexOf('North'), iW = REG.indexOf('West');
const ev = (name) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(name)]);
const TYPES = [...new Set(ev('event_type'))];
const pastryShare = (t) => EVENTS.filter((r) => r[3] === t && r[6] === 'yes').length / EVENTS.filter((r) => r[3] === t).length;
// Gorse Lane Cycle Hire (fictional): hires in September by bike and day
const HIRE = { rows: ['Electric', 'Standard'], cols: ['Weekday', 'Weekend'], counts: [[64, 86], [120, 70]] };
const hRow = HIRE.counts.map((r) => r[0] + r[1]), hCol = [0, 1].map((j) => HIRE.counts[0][j] + HIRE.counts[1][j]), hN = hRow[0] + hRow[1];

// ---------------------------------------------------------------- widgets
const bayes = (b, s, fp) => b * s / (b * s + (1 - b) * fp);
export const widgets = {
  'pr-table': {
    type: 'sheet',
    title: 'Channel × subscription: Lantern’s 231 spring orders, with every probability as a formula',
    sheet: {
      cells: {
        B1: 'Subscription', C1: 'One-off', D1: 'Total',
        A2: 'Web', B2: ws, C2: wo, D2: '=B2+C2',
        A3: 'App', B3: as, C3: ao, D3: '=B3+C3',
        A4: 'Total', B4: '=B2+B3', C4: '=C2+C3', D4: '=D2+D3',
        A6: 'P(subscription)', B6: '=B4/D4',
        A7: 'P(app)', B7: '=D3/D4',
        A8: 'P(app and subscription)', B8: '=B3/D4',
        A9: 'P(subscription | app)', B9: '=B3/D3',
        A10: 'P(subscription | web)', B10: '=B2/D2',
        A11: 'P(app | subscription)', B11: '=B3/B4',
        A12: 'Expected app subscriptions if independent', B12: '=D3*B4/D4',
        A13: 'P(app or subscription)', B13: '=B7+B6-B8',
      },
    },
    view: 'A1:D13',
    editable: 'B2:C3',
    formats: { B6: '0.000', B7: '0.000', B8: '0.000', B9: '0.000', B10: '0.000', B11: '0.000', B12: '0.0', B13: '0.000' },
    widths: { A: 36, B: 13 },
    tools: ['formulas', 'reset'],
    note: 'Try web 60 and 72, app 45 and 54: both channels then subscribe 45.5% of the time, P(subscription | app) equals P(subscription), and the expected count in B12 equals the observed 45 in B3. That is what independence looks like in a table.',
  },
  'pr-bayes': {
    type: 'formula', title: 'Tillwise’s fraud screen (fictional rates)',
    intro: 'Set how common fraud is and how the screen behaves; see what a flag means.',
    inputs: [
      { id: 'base', label: 'Base rate: orders that are fraudulent', min: 0.1, max: 10, step: 0.1, value: 0.4, fmt: 'pct' },
      { id: 'sens', label: 'Fraudulent orders flagged', min: 50, max: 100, step: 1, value: 95, fmt: 'pct' },
      { id: 'fpr', label: 'Genuine orders flagged (false positives)', min: 0.1, max: 10, step: 0.1, value: 2, fmt: 'pct' },
    ],
    compute: (v) => {
      const b = v.base / 100, s = v.sens / 100, fp = v.fpr / 100;
      const tp = 10000 * b * s, fpos = 10000 * (1 - b) * fp, post = bayes(b, s, fp);
      const negPost = b * (1 - s) / (b * (1 - s) + (1 - b) * (1 - fp));
      return {
        headline: { label: 'P(fraud | flagged)', value: `${(post * 100).toFixed(1)}%` },
        rows: [
          ['Fraudulent orders per 10,000', (10000 * b).toFixed(0)],
          ['… of which flagged', tp.toFixed(1)],
          ['Genuine orders flagged per 10,000', fpos.toFixed(1)],
          ['All flagged orders per 10,000', (tp + fpos).toFixed(1)],
          ['P(fraud | not flagged)', `${(negPost * 100).toFixed(3)}%`],
        ],
        note: `Of every ${(tp + fpos).toFixed(0)} flagged orders, about ${tp.toFixed(0)} are fraudulent and ${fpos.toFixed(0)} genuine. ${post < 0.5 ? 'Most flags are false alarms: a flag is a reason to check, not a verdict.' : 'Most flags are real at this base rate.'}`,
        chart: { kind: 'bar', x: { label: 'Flagged orders per 10,000', values: ['Fraudulent', 'Genuine'] }, series: [{ name: 'Flagged per 10,000 orders', values: [Number(tp.toFixed(1)), Number(fpos.toFixed(1))] }], y: { label: 'Orders' } },
      };
    },
  },
};

// ---------------------------------------------------------------- guided practice
const regionSheet = {
  cells: {
    A1: 'Region', B1: 'Subscription', C1: 'One-off', D1: 'P(sub | region)',
    ...col('A', 2, REG), ...col('B', 2, RC.map((r) => r[0])), ...col('C', 2, RC.map((r) => r[1])),
    A7: 'Total', B7: '=SUM(B2:B6)', C7: '=SUM(C2:C6)',
  },
};

export const guided = [
  {
    id: 'b04-pr-g1', type: 'steps', kind: 'numerical',
    prompt: 'The spring orders by region and subscription are in A1:C7. Work out whether region and subscription look independent.',
    solution: `P(sub | North) = ${RC[iN][0]} ÷ ${regTot[iN]} ≈ ${f(RC[iN][0] / regTot[iN])}. Filled down, <x>=B2/(B2+C2)</x> gives ${REG.map((g, i) => `${g} ${f(RC[i][0] / regTot[i])}`).join(', ')}, against ${f(sub / N)} overall. The conditional probabilities differ widely, so region and subscription are not independent in these orders.`,
    steps: [
      {
        id: 'b04-pr-g1-s1', type: 'num',
        prompt: `${RC[iN][0]} of the ${regTot[iN]} North orders were subscriptions, out of ${sub} subscriptions and ${N} orders in all. What is P(subscription | North)? Give three decimal places.`,
        answer: Number(f(RC[iN][0] / regTot[iN])), check: () => RC[iN][0] / regTot[iN], unit: '', places: 3, tol: 0.0005,
        wrong: [
          { value: Number(f(RC[iN][0] / sub)), say: `That is P(North | subscription): ${RC[iN][0]} ÷ ${sub}. The condition is “North”, so divide by the North orders.` },
          { value: Number(f(RC[iN][0] / N)), say: 'That is the joint probability P(North and subscription). A conditional probability divides by the count of the condition, not by all orders.' },
        ],
        hints: ['Given North: keep only the North orders.', `${RC[iN][0]} ÷ ${regTot[iN]}.`],
      },
      {
        id: 'b04-pr-g1-s2', type: 'formula',
        prompt: 'In D2, calculate P(subscription | region) for the North so that the formula can be filled down to D6.',
        sheet: regionSheet,
        cell: 'D2', fill: 'D2:D6', answer: '=B2/(B2+C2)',
        alt: ['=B2/SUM(B2:C2)'],
        view: 'A1:D7', formats: { D: '0.000' }, widths: { D: 16 },
        wrong: [
          { formula: '=B2/$B$7', say: 'That divides by all subscriptions: it is P(region | subscription). The condition is the region, so divide by the region’s own total, B2 + C2.' },
          { formula: '=B2/($B$7+$C$7)', say: 'That divides by all 231 orders: the joint probability P(region and subscription). Divide by the region’s total.' },
          { formula: '=C2/(B2+C2)', say: 'Column C holds the one-off orders, so that is P(one-off | region). Subscriptions are in B.' },
        ],
        hints: ['The denominator is the number of orders from that region.', '<x>=B2/(B2+C2)</x>, filled down.'],
      },
      {
        id: 'b04-pr-g1-s3', type: 'mc',
        prompt: `Across the five regions, P(subscription | region) runs from ${f(Math.min(...RC.map((r, i) => r[0] / regTot[i])), 2)} to ${f(Math.max(...RC.map((r, i) => r[0] / regTot[i])), 2)}; overall P(subscription) is ${f(sub / N, 2)}. Are region and subscription independent in these orders?`,
        options: [
          'No: the chance of a subscription changes a great deal across the regions.',
          'Yes: every region has both subscription orders and one-off orders in it.',
          'Yes: the five regions’ orders add up to 231, as independent events must.',
          'It can’t be judged until we know which of the regions causes the subscriptions.',
        ],
        answer: 0,
        feedback: {
          1: 'Having both kinds of order in each region says they can happen together; independence asks whether the region changes the chance.',
          2: 'The totals add to 231 because every order has exactly one region. That is true whether or not region is related to subscription.',
          3: 'Independence is about probabilities, not causes. It can be judged from the table; explaining it is a separate question.',
        },
        hints: ['Independence means P(sub | region) = P(sub) for every region.'],
      },
    ],
  },
  {
    id: 'b04-pr-g2', type: 'num', kind: 'numerical',
    prompt: `Of the ${N} spring orders, ${app} came through the app, ${one} were one-off purchases and ${ao} were both. What is the probability that an order drawn at random came through the app or was a one-off purchase? Give three decimal places.`,
    answer: Number(f((app + one - ao) / N)), check: () => app / N + one / N - ao / N, unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: Number(f((app + one) / N)), say: `You added the two probabilities without taking away the overlap: the ${ao} app one-off orders were counted twice.` },
      { value: Number(f(ao / N)), say: 'That is P(app and one-off), the overlap. “Or” includes every order that is app, one-off or both.' },
    ],
    hints: ['Addition rule: P(A or B) = P(A) + P(B) − P(A and B).', `(${app} + ${one} − ${ao}) ÷ ${N}.`],
    solution: `P(app or one-off) = ${app}/${N} + ${one}/${N} − ${ao}/${N} = ${app + one - ao}/${N} ≈ ${f((app + one - ao) / N)}. The only orders that are neither are the ${ws} web subscriptions: 1 − ${ws}/${N} gives the same answer.`,
  },
  {
    id: 'b04-pr-g3', type: 'classify', kind: 'conceptual',
    prompt: 'For each pair of events, decide whether they are mutually exclusive, independent, or neither.',
    items: [
      'One order: “it came through the web shop” and “it came through the app”',
      'Two orders drawn with replacement: “the first is a subscription” and “the second is a subscription”',
      'One order: “it is a subscription” and “it came through the app”',
      'One order: “it was sent to the North” and “it was sent to the East”',
      'Two orders drawn without replacement: “the first is from the East” and “the second is from the East”',
      'A fair coin tossed twice: “heads on the first toss” and “heads on the second toss”',
    ],
    categories: ['Mutually exclusive', 'Independent', 'Neither: they can happen together, and one changes the other’s chance'],
    answer: [0, 1, 2, 0, 2, 1],
    feedback: {
      2: `They can happen together (${as} orders are both), and P(sub | app) = ${f(as / app)} differs from P(sub) = ${f(sub / N)}.`,
      4: 'Without replacement the first draw changes the pool: P(second East | first East) = 51/230, not 52/231.',
    },
    hints: ['Mutually exclusive: can’t both happen. Independent: one doesn’t change the other’s probability.', 'Putting the first order back makes the second draw start from the same 231 orders.'],
    solution: 'One order has one channel and one region, so web/app and North/East are mutually exclusive. Draws with replacement and coin tosses are independent. Subscription and app can occur together but are associated in the data, and draws without replacement depend on each other: neither.',
  },
  {
    id: 'b04-pr-g4', type: 'num', kind: 'numerical',
    prompt: 'Ana tries an early-warning flag for café clients likely to leave (fictional figures). 30% of her café clients are at risk; the flag catches 80% of at-risk clients and also flags 10% of the others. What is the probability that a flagged client is at risk? Give three decimal places.',
    answer: Number(f(0.3 * 0.8 / (0.3 * 0.8 + 0.7 * 0.1))), check: () => bayes(0.3, 0.8, 0.1), unit: '', places: 3, tol: 0.002,
    wrong: [
      { value: 0.8, say: 'That is P(flag | at risk), the share of at-risk clients caught. The question asks for P(at risk | flag): use Bayes’ rule.' },
      { value: 0.24, say: 'That is P(at risk and flagged), the numerator. Divide it by P(flagged) = 0.24 + 0.07.' },
      { value: 0.31, say: 'That is P(flagged), the denominator. The answer is 0.24 ÷ 0.31.' },
    ],
    hints: ['P(at risk | flag) = P(at risk and flag) ÷ P(flag).', 'Numerator 0.3 × 0.8; denominator 0.3 × 0.8 + 0.7 × 0.1.'],
    solution: `P(at risk | flag) = 0.3 × 0.8 ÷ (0.3 × 0.8 + 0.7 × 0.1) = 0.24 ÷ 0.31 ≈ ${f(bayes(0.3, 0.8, 0.1))}. Here a flag is fairly reliable, because the condition is common (30%). The same screen used where only 1% were at risk would give ${f(bayes(0.01, 0.8, 0.1))}.`,
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'b04-pr-i1', type: 'formula', kind: 'applied',
    prompt: 'B1 holds the base rate of fraud, B2 the share of fraudulent orders a screen flags and B3 the share of genuine orders it flags. In B5, calculate the probability that a flagged order is fraudulent.',
    sheet: { cells: { A1: 'Base rate (fraud)', B1: 0.004, A2: 'Share of fraud flagged', B2: 0.95, A3: 'Share of genuine flagged', B3: 0.02, A5: 'P(fraud | flagged)' }, vary: { B1: [0.01, 0.002, 0.05], B2: [0.9, 0.99, 0.8], B3: [0.05, 0.01, 0.03] } },
    cell: 'B5', answer: '=B1*B2/(B1*B2+(1-B1)*B3)',
    alt: ['=B1*B2/(B1*B2+B3*(1-B1))', '=1/(1+(1-B1)*B3/(B1*B2))'],
    view: 'A1:B5', formats: { B1: '0.0%', B2: '0.0%', B3: '0.0%', B5: '0.0%' }, widths: { A: 24 },
    wrong: [
      { formula: '=B2', say: 'B2 is P(flag | fraud). The question reverses the condition, P(fraud | flag), which depends on the base rate too: use Bayes’ rule.' },
      { formula: '=B1*B2', say: 'That is P(fraud and flag), the numerator. Divide by P(flag) = B1*B2 + (1 − B1)*B3.' },
      { formula: '=B1*B2/(B1*B2+B3)', say: 'The false-positive rate applies only to genuine orders, a share 1 − B1 of all orders: (1-B1)*B3.' },
    ],
    solution: '<x>=B1*B2/(B1*B2+(1-B1)*B3)</x>. With 0.4%, 95% and 2% it gives about 16.0%. The numerator is the probability of a fraudulent, flagged order; the denominator the probability of any flagged order (the law of total probability).',
  },
  {
    id: 'b04-pr-i2', type: 'formula', kind: 'numerical',
    prompt: 'Ana’s 76 catering events are in A2:C77 (event, type, pastries yes or no). In H2, calculate the probability that an event of the type in G2 had pastries, P(pastries | type), and fill it down to H6.',
    sheet: { cells: { A1: 'Event', B1: 'Type', C1: 'Pastries', G1: 'Type', H1: 'P(pastries | type)', ...col('A', 2, ev('event_id')), ...col('B', 2, ev('event_type')), ...col('C', 2, ev('pastries')), ...col('G', 2, TYPES) }, vary: { G2: ['Meeting', 'Launch', 'Team day'], G3: ['Conference', 'Breakfast', 'Team day'], G4: ['Launch', 'Meeting', 'Conference'], G5: ['Breakfast', 'Team day', 'Meeting'], G6: ['Conference', 'Launch', 'Breakfast'] } },
    cell: 'H2', fill: 'H2:H6', answer: '=COUNTIFS($B$2:$B$77,G2,$C$2:$C$77,"yes")/COUNTIF($B$2:$B$77,G2)',
    alt: ['=COUNTIFS(B$2:B$77,G2,C$2:C$77,"yes")/COUNTIFS(B$2:B$77,G2)'],
    view: 'A1:H77', maxHeight: '20rem', widths: { B: 12, G: 12, H: 18 }, formats: { H: '0.000' },
    wrong: [
      { formula: '=COUNTIFS($B$2:$B$77,G2,$C$2:$C$77,"yes")/COUNTIF($C$2:$C$77,"yes")', say: 'That divides by all events with pastries: P(type | pastries). The condition is the type, so divide by the number of events of that type.' },
      { formula: '=COUNTIFS($B$2:$B$77,G2,$C$2:$C$77,"yes")/COUNTA($B$2:$B$77)', say: 'Dividing by all 76 events gives the joint probability P(type and pastries). Divide by the events of the type in G2.' },
    ],
    solution: `<x>=COUNTIFS($B$2:$B$77,G2,$C$2:$C$77,"yes")/COUNTIF($B$2:$B$77,G2)</x>, filled down: ${TYPES.map((t) => `${t} ${f(pastryShare(t))}`).join(', ')}. Overall, 30 of 76 events (${f(30 / 76)}) had pastries, but every breakfast did: pastries are far from independent of event type.`,
  },
  {
    id: 'b04-pr-i3', type: 'num', kind: 'numerical',
    prompt: `Ana draws three of the ${N} spring orders at random, without replacement, to phone the customers. ${sub} of the orders were subscriptions. What is the probability that all three are subscription orders? Give four decimal places.`,
    answer: Number(f(sub / N * (sub - 1) / (N - 1) * (sub - 2) / (N - 2), 4)), check: () => (sub / N) * ((sub - 1) / (N - 1)) * ((sub - 2) / (N - 2)), unit: '', places: 4, tol: 0.0003,
    wrong: [
      { value: Number(f((sub / N) ** 3, 4)), say: 'That treats the draws as independent, as if each order were put back. Without replacement, each draw leaves one fewer subscription and one fewer order: 104/231 × 103/230 × 102/229.' },
      { value: Number(f(sub * (sub - 1) * (sub - 2) / N ** 3, 4)), say: 'You reduced the subscriptions after each draw but not the orders. Both counts fall by one: the denominators are 231, 230 and 229.' },
    ],
    solution: `Multiplication rule with conditional probabilities: ${sub}/${N} × ${sub - 1}/${N - 1} × ${sub - 2}/${N - 2} ≈ ${f(sub / N * (sub - 1) / (N - 1) * (sub - 2) / (N - 2), 4)}. With replacement it would be (${sub}/${N})³ ≈ ${f((sub / N) ** 3, 4)}: close, because three orders are a small part of 231.`,
  },
  {
    id: 'b04-pr-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A subscription service (fictional) finds that 80% of customers who cancelled had a late delivery in their last month. What does that tell it about the probability that a customer with a late delivery cancels?',
    options: [
      'Nothing on its own: that also depends on how common cancelling and late deliveries are.',
      'It is 80% as well, since the same customers and the same late deliveries are involved.',
      'It is 20%, since the remaining 20% of the cancelled customers had no late delivery.',
      'It is at least 80%, since a late delivery must come before the decision to cancel.',
    ],
    answer: 0,
    feedback: {
      1: 'P(late | cancel) and P(cancel | late) have the same numerator but different denominators: the cancellers and the customers with late deliveries.',
      2: 'The 20% is P(no late delivery | cancel), another probability conditional on cancelling.',
      3: 'Timing doesn’t turn one conditional probability into the other. If late deliveries are common, most late customers may not cancel.',
    },
    solution: 'The 80% is P(late | cancel). By Bayes’ rule, P(cancel | late) = P(cancel) × P(late | cancel) ÷ P(late). If 5% of customers cancel and 40% have a late delivery, it is 0.05 × 0.8 ÷ 0.4 = 10%. Without the base rates it can’t be found.',
  },
  {
    id: 'b04-pr-i5', type: 'multi', kind: 'applied',
    prompt: 'Tillwise’s screen (fictional): 0.4% of orders are fraudulent, 95% of them are flagged, and 2% of genuine orders are flagged. Select all the statements that are true.',
    options: [
      'Most flagged orders are genuine customers’ orders that the screen has wrongly flagged.',
      'An order that is not flagged is very unlikely to be fraudulent: about two in ten thousand.',
      'Cutting the false-positive rate from 2% to 0.5% would raise P(fraud | flagged) above 40%.',
      'Raising the share of fraud flagged from 95% to 99% would roughly double P(fraud | flagged).',
      'If fraud became twice as common, P(fraud | flagged) would rise, but by less than double.',
      '95% of the orders that the screen flags really are fraudulent, since it catches 95% of fraud.',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: `It rises only from ${f(bayes(0.004, 0.95, 0.02))} to ${f(bayes(0.004, 0.99, 0.02))}: the false positives, not the missed fraud, dominate the flags.`,
      5: '95% is P(flag | fraud). P(fraud | flag) is about 16%.',
    },
    solution: `P(fraud | flag) ≈ ${f(bayes(0.004, 0.95, 0.02))}, so most flags are genuine; P(fraud | no flag) ≈ 0.0002. With a 0.5% false-positive rate, P(fraud | flag) = 0.0038 ÷ (0.0038 + 0.996 × 0.005) ≈ ${f(bayes(0.004, 0.95, 0.005))}. Catching 99% of fraud gives only ${f(bayes(0.004, 0.95 + 0.04, 0.02))}, and doubling the base rate raises it to ${f(bayes(0.008, 0.95, 0.02))}, less than double (${f(2 * bayes(0.004, 0.95, 0.02))}), because the denominator grows too.`,
  },
  {
    id: 'b04-pr-i6', type: 'num', kind: 'numerical',
    prompt: 'Ana wants to check 5 of her 76 catering invoices, chosen as a simple random sample. How many different samples of 5 invoices are possible? Give a whole number.',
    answer: combin(76, 5), check: () => (76 * 75 * 74 * 73 * 72) / (5 * 4 * 3 * 2 * 1), unit: 'samples', places: 0, tol: 0.5,
    wrong: [
      { value: permut(76, 5), say: 'That counts ordered selections (PERMUT). A sample is a set of invoices, whatever order they are drawn in: divide by 5! = 120, or use COMBIN.' },
      { value: 76 ** 5, say: 'That allows the same invoice to be chosen more than once and counts order. Use COMBIN(76,5).' },
    ],
    solution: `<x>=COMBIN(76,5)</x> = 76 × 75 × 74 × 73 × 72 ÷ 5! = ${combin(76, 5).toLocaleString('en-US')}. A simple random sample makes each of these equally likely, so any particular set of 5 has probability 1 in ${combin(76, 5).toLocaleString('en-US')}.`,
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'b04-pr-k1', type: 'classify', kind: 'conceptual',
    prompt: 'Which way of assigning probability does each statement use?',
    items: [
      'The chance that an order drawn at random from the 231 spring orders is from the East: 52 ÷ 231',
      'The share of Lantern’s last 2,000 card payments that were declined, used as the chance that the next one is declined',
      'Ana’s judgement that a new café has a 30% chance of becoming a regular client',
      'The chance of drawing one particular trainee’s name from a hat holding 12 names',
      'An insurer’s chance that a delivery van is stolen this year, taken from last year’s claims across its policies',
      'A buyer’s belief that green-coffee prices will rise next quarter',
    ],
    categories: ['Classical', 'Relative frequency', 'Subjective'],
    answer: [0, 1, 2, 0, 1, 2],
    feedback: {
      1: 'It comes from a long run of past payments, not from equally likely outcomes.',
      4: 'Claims data are a record of how often thefts happened: a relative frequency.',
      5: 'There is no long run of identical quarters to count: a judgement.',
    },
    solution: 'Equally likely outcomes counted (a random draw, a name from a hat): classical. A share observed over many past cases (declined payments, claims): relative frequency. A judgement without a long run to count (a new client, next quarter’s prices): subjective.',
  },
  {
    id: 'b04-pr-k2', type: 'formula', kind: 'numerical',
    prompt: `Gorse Lane Cycle Hire (fictional) counted September’s ${hN} hires by bike and by day (B2:C3, with totals in column D and row 4). In F2, calculate the number of electric weekday hires that independence of bike and day would predict, so that the formula can be filled to F2:G3.`,
    sheet: { cells: { B1: 'Weekday', C1: 'Weekend', D1: 'Total', A2: 'Electric', B2: HIRE.counts[0][0], C2: HIRE.counts[0][1], D2: '=B2+C2', A3: 'Standard', B3: HIRE.counts[1][0], C3: HIRE.counts[1][1], D3: '=B3+C3', A4: 'Total', B4: '=B2+B3', C4: '=C2+C3', D4: '=D2+D3', F1: 'Weekday', G1: 'Weekend', E2: 'Electric', E3: 'Standard' } },
    cell: 'F2', fill: 'F2:G3', answer: '=$D2*B$4/$D$4',
    alt: ['=B$4*$D2/$D$4', '=$D2/$D$4*B$4/$D$4*$D$4'],
    view: 'A1:G4', formats: { F: '0.0', G: '0.0' }, widths: { E: 10 },
    wrong: [
      { formula: '=D2*B4/D4', say: 'Without <code>$</code> the totals move as you fill. Lock the row-total column ($D2), the column-total row (B$4) and the grand total ($D$4).' },
      { formula: '=$D2*B$4', say: 'Row total × column total must be divided by the grand total: $D2*B$4/$D$4.' },
      { formula: '=B2/$D$4', say: 'That is the observed joint probability. Independence predicts the count P(row) × P(column) × total = row total × column total ÷ grand total.' },
    ],
    solution: `Under independence, P(electric and weekday) = P(electric) × P(weekday), so the expected count is ${hN} × (${hRow[0]}/${hN}) × (${hCol[0]}/${hN}) = ${hRow[0]} × ${hCol[0]} ÷ ${hN} ≈ ${f(hRow[0] * hCol[0] / hN, 1)}, against ${HIRE.counts[0][0]} observed: <x>=$D2*B$4/$D$4</x>, filled to F2:G3. Electric bikes were hired on weekends more often than independence predicts.`,
  },
  {
    id: 'b04-pr-k3', type: 'num', kind: 'numerical',
    prompt: `${RC[iW][1]} of the ${regTot[iW]} West orders were one-off purchases; there were ${one} one-off orders and ${N} orders in all. What is P(one-off | West)? Give three decimal places.`,
    answer: Number(f(RC[iW][1] / regTot[iW])), check: () => RC[iW][1] / regTot[iW], unit: '', places: 3, tol: 0.0005,
    wrong: [
      { value: Number(f(RC[iW][1] / one)), say: `That is P(West | one-off), dividing by the ${one} one-off orders. Given West, divide by the ${regTot[iW]} West orders.` },
      { value: Number(f(RC[iW][1] / N)), say: 'That is the joint probability P(West and one-off). Condition on West by dividing by the West total.' },
    ],
    solution: `P(one-off | West) = ${RC[iW][1]} ÷ ${regTot[iW]} ≈ ${f(RC[iW][1] / regTot[iW])}, against P(one-off) = ${one} ÷ ${N} ≈ ${f(one / N)} overall.`,
  },
  {
    id: 'b04-pr-k4', type: 'num', kind: 'applied',
    prompt: 'Lantern’s email filter (fictional figures): 30% of incoming messages are spam; the filter marks 92% of spam as spam and wrongly marks 4% of genuine messages. Ana wonders whether to skip the spam folder. What percentage of the messages in the spam folder are genuine? Give one decimal place.',
    answer: Number((0.7 * 0.04 / (0.7 * 0.04 + 0.3 * 0.92) * 100).toFixed(1)), check: () => (1 - bayes(0.3, 0.92, 0.04)) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 4, say: '4% is P(marked | genuine). The question asks P(genuine | marked): Bayes’ rule, with genuine messages making up 70% of the mail.' },
      { value: 90.8, say: 'That is the share of the spam folder that really is spam. The question asks for the genuine share: 100 − 90.8.' },
      { value: 2.8, say: '0.7 × 0.04 = 2.8% of all messages are genuine and marked. Divide by the share of all messages that are marked, 0.028 + 0.276.' },
    ],
    solution: `P(genuine | marked) = 0.7 × 0.04 ÷ (0.7 × 0.04 + 0.3 × 0.92) = 0.028 ÷ 0.304 ≈ ${(0.028 / 0.304 * 100).toFixed(1)}%. About one message in eleven in the spam folder is genuine, so a quick scan of the folder is worth Ana’s time.`,
  },
  {
    id: 'b04-pr-k5', type: 'multi', kind: 'conceptual',
    prompt: 'A tree diagram shows channel first and subscription second. Select all the true statements.',
    options: [
      'Multiplying the probabilities along a path gives the joint probability of the events on that path.',
      'The probabilities on the second-level branches are conditional on the first-level branch they grow from.',
      'The probabilities of the paths that end in “subscription” add to 1, as every set of paths must.',
      'Adding the probabilities along a path, rather than multiplying them, gives the probability of that path.',
      'The second-level probabilities are the same on every first-level branch, whatever the events.',
      'The two branches leaving the web node add up to P(web), the probability of reaching that node.',
    ],
    answer: [0, 1],
    feedback: {
      2: `They add to P(subscription), ${f(sub / N)}, by the law of total probability. All the paths together add to 1.`,
      3: 'Probabilities along a path are multiplied (the multiplication rule), not added.',
      4: 'Only if the events are independent. For Lantern, P(sub | web) and P(sub | app) differ.',
      5: 'Branches leaving a node are conditional probabilities given that node, so they add to 1.',
    },
    solution: 'Each path’s probability is the product of its branches (P(web) × P(sub | web)), and the second-level branches are conditional. All the paths together add to 1; the paths ending in “subscription” add to P(subscription). The branches leaving any node also add to 1, and they are the same on every branch only when the events are independent.',
  },
  {
    id: 'b04-pr-k6', type: 'mc', kind: 'applied',
    prompt: `In the spring orders, P(subscription | East) = ${f(RC[REG.indexOf('East')][0] / regTot[REG.indexOf('East')], 2)} and P(subscription) = ${f(sub / N, 2)}. Which sentence belongs in Ana’s review?`,
    options: [
      'East orders were more often subscriptions in spring; whether that is more than chance needs a test, and it proves no cause.',
      'East customers subscribe because of where they live, so Lantern should use the East’s marketing in every other region next year.',
      'Region and subscription are independent in the spring orders, because every region has both subscription and one-off orders.',
      'Being from the East and placing a one-off order are mutually exclusive events, so East customers never buy one-off orders.',
    ],
    answer: 0,
    feedback: {
      1: 'A difference in conditional probabilities shows association, not causation; something else about East customers may explain it.',
      2: 'Independence would need P(sub | East) to equal P(sub). Having both kinds of order in a region says nothing about that.',
      3: `${RC[REG.indexOf('East')][1]} East orders were one-off, so the events can happen together.`,
    },
    solution: 'The conditional probabilities differ, so region and subscription are associated in these orders. Two cautions belong in the review: chance could produce some difference in 231 orders (module 4 tests it), and an association doesn’t identify a cause.',
  },
];
