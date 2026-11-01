// loyalty-and-retention-strategy.ex.js — M06 · Loyalty and retention strategy: widgets, practice and the knowledge check
// (answer keys live here). Member data from case.js (lapse curves for every member; the first 30 members who joined in
// July 2027 for the worksheet, as of 31 December 2027). Every test result and every business other than Lantern is
// fictional. Formula items are marked by their results; num items recompute in `check`.
import { members, lapseData } from './case.js?v=25';
import { propTest2, normCdf, normInv } from '../../../core/inference.js?v=25';

const fx = (v, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const col = (letter, from, values) => Object.fromEntries(values.map((v, i) => [`${letter}${from + i}`, v]));
const Z = normInv(0.975);

// ---------------------------------------------------------------- lapse curves by notifications
const ALL = members();
const LD = lapseData();
const GROUP = Object.fromEntries(ALL.map((c) => [c.id, c.notifications ? 'Notifications on' : 'Notifications off']));

// ---------------------------------------------------------------- worksheet: the first 30 July 2027 joiners
const JUL = ALL.filter((c) => c.joinedIso.startsWith('2027-07')).slice(0, 30);
const N = JUL.length, last = N + 1;
const julCells = { A1: 'Member', B1: 'Notifications', C1: 'Visits', D1: 'Days since last visit', F1: 'Lapse after (days)', G1: 60,
  ...col('A', 2, JUL.map((c) => c.id)), ...col('B', 2, JUL.map((c) => c.notifications)), ...col('C', 2, JUL.map((c) => c.frequency)), ...col('D', 2, JUL.map((c) => c.recency)) };
const lapsedShare = (n) => JUL.filter((c) => c.notifications === n && c.recency > 60).length / JUL.filter((c) => c.notifications === n).length;
const nJulOn = JUL.filter((c) => c.notifications === 1).length;

// ---------------------------------------------------------------- fictional tests
const OB = { nT: 900, xT: 180, nC: 700, xC: 105 };                    // Ouseley Books' reactivation email (fictional)
const ob = propTest2(OB.xT, OB.nT, OB.xC, OB.nC);
const testCells = { A1: 'Group', B1: 'Returned', C1: 'Customers', A2: 'Offered', B2: OB.xT, C2: OB.nT, A3: 'Holdout', B3: OB.xC, C3: OB.nC, A5: 'Difference', A6: '95% lower limit' };
const hs = propTest2(84, 500, 60, 500);                               // a fictional hair salon's win-back text
const netCells = { A1: 'Customers offered', B1: 1200, A2: 'Return rate, offered', B2: 0.21, A3: 'Return rate, holdout', B3: 0.16, A4: 'Cost per redemption ($)', B4: 2.5, A5: 'Value of a customer won back ($)', B5: 18, A7: 'Net value of the offer ($)' };
const netAns = 1200 * (0.21 - 0.16) * 18 - 1200 * 0.21 * 2.5;
const nPer = (pc, pt) => (Z + normInv(0.8)) ** 2 * (pc * (1 - pc) + pt * (1 - pt)) / (pt - pc) ** 2;
const lift = (r, d) => (1 + d) / (1 + d - r - 0.05) / ((1 + d) / (1 + d - r)) - 1;

export const widgets = {
  'loy-notifications': {
    type: 'survival',
    title: 'Time to lapse: members with notifications on and off',
    lapse: { ...LD, group: GROUP, days: [30, 60, 90], value: 60 },
    unit: 'days', show: ['ci', 'median', 'logrank'], at: [30, 90, 180],
    note: 'Members chose whether to turn notifications on, so the gap between the curves is an association, not the effect of notifications. A member lapses at a visit followed by more than the chosen number of days without one; members still within that many days of their last visit on 31 December are censored.',
  },
  'loy-test': {
    type: 'formula',
    title: 'Planning a holdout test of a retention offer',
    intro: 'Equal groups offered and held out. The power is the chance of a significant result (5% level, two-sided) if the uplift is as set.',
    inputs: [
      { id: 'pc', label: 'Return rate without the offer', min: 5, max: 40, step: 1, value: 17, fmt: 'pct' },
      { id: 'u', label: 'Uplift from the offer (points)', min: 1, max: 15, step: 0.5, value: 6, fmt: 'num' },
      { id: 'n', label: 'Customers in each group', min: 100, max: 3000, step: 50, value: 450, fmt: 'int' },
      { id: 'k', label: 'Cost per redemption', min: 0, max: 3, step: 0.05, value: 0.9, fmt: 'money' },
      { id: 'v', label: 'Value of a customer won back', min: 1, max: 30, step: 0.5, value: 7.5, fmt: 'money' },
    ],
    compute: (v) => {
      const pc = v.pc / 100, pt = pc + v.u / 100, se = Math.sqrt(pc * (1 - pc) / v.n + pt * (1 - pt) / v.n);
      const power = normCdf(v.u / 100 / se - Z), half = Z * se, be = pt * v.k / v.v, net = v.n * (v.u / 100) * v.v - v.n * pt * v.k;
      const need = Math.ceil(nPer(pc, pt));
      return {
        headline: { label: 'Power to detect this uplift', value: `${fx(power * 100, 0)}%` },
        rows: [['Expected 95% interval', `${fx(v.u, 1)} ± ${fx(half * 100, 1)} points`], ['Customers a group for 80% power', fx(need, 0)], ['Break-even uplift', `${fx(be * 100, 2)} points`], ['Expected net value of offering it to one group', `$${fx(net)}`]],
        note: v.u / 100 - half > be ? 'If the uplift is as set, the interval should clear the break-even uplift: the test could show the offer pays.' : 'Even if the uplift is as set, the interval would likely reach below the break-even uplift: the test couldn’t settle whether the offer pays.',
      };
    },
  },
};

export const guided = [
  {
    id: 'm06-loy-g1', type: 'steps', kind: 'numerical',
    prompt: `Ouseley Books (fictional) emailed a reactivation offer to a random ${OB.nT} of ${OB.nT + OB.nC} customers who hadn’t bought for a year; the other ${OB.nC} were held out. The worksheet shows how many in each group bought within a month.`,
    solution: `B5: <x>=B2/C2-B3/C3</x> = ${fx(ob.diff * 100, 1)} points. B6: <x>=B5-1.96*SQRT(B2/C2*(1-B2/C2)/C2+B3/C3*(1-B3/C3)/C3)</x> = ${fx(ob.low * 100, 1)} points; the upper limit is ${fx(ob.high * 100, 1)}. The interval is above zero: the email added buyers, somewhere between about ${fx(ob.low * 100, 0)} and ${fx(ob.high * 100, 0)} points.`,
    steps: [
      {
        id: 'm06-loy-g1-s1', type: 'formula',
        prompt: 'In B5, calculate the difference between the offered group’s return rate and the holdout’s, as a proportion.',
        sheet: { cells: { ...testCells } },
        cell: 'B5', answer: '=B2/C2-B3/C3',
        view: 'A1:C6', formats: { B5: '0.0%', B6: '0.0%' }, widths: { A: 16, B: 10, C: 11 },
        wrong: [{ formula: '=B2-B3', say: 'That is a difference in counts. With groups of different sizes it would mislead; compare the rates, B2 ÷ C2 and B3 ÷ C3.' }, { formula: '=(B2/C2)/(B3/C3)', say: 'That is a ratio of rates (the relative lift). The question asks for the difference in rates.' }],
        hints: ['Rate offered − rate held out.', '<x>=B2/C2-B3/C3</x>'],
      },
      {
        id: 'm06-loy-g1-s2', type: 'formula',
        prompt: 'In B6, calculate the lower limit of the 95% confidence interval for the difference, using the unpooled standard error.',
        sheet: { cells: { ...testCells, B5: '=B2/C2-B3/C3' } },
        cell: 'B6', answer: '=B5-1.96*SQRT(B2/C2*(1-B2/C2)/C2+B3/C3*(1-B3/C3)/C3)',
        alt: ['=B2/C2-B3/C3-1.96*SQRT((B2/C2)*(1-B2/C2)/C2+(B3/C3)*(1-B3/C3)/C3)'],
        view: 'A1:C6', formats: { B5: '0.0%', B6: '0.0%' }, widths: { A: 16, B: 10, C: 11 },
        wrong: [
          { formula: '=B5-1.96*SQRT(B2/C2*(1-B2/C2)+B3/C3*(1-B3/C3))', say: 'Divide each variance by its group size: p(1 − p) ÷ n.' },
          { formula: '=B5-1.96*(SQRT(B2/C2*(1-B2/C2)/C2)+SQRT(B3/C3*(1-B3/C3)/C3))', say: 'Add the variances under one square root; standard errors don’t add.' },
        ],
        hints: ['SE = √(p₁(1 − p₁) ÷ n₁ + p₂(1 − p₂) ÷ n₂).', 'Lower limit = difference − 1.96 × SE.'],
      },
      {
        id: 'm06-loy-g1-s3', type: 'mc',
        prompt: `${OB.xT} customers used the offer. Ouseley’s marketing manager reports “${OB.xT} customers reactivated by the email”. What should the report say instead?`,
        options: [
          `About ${fx(ob.diff * OB.nT, 0)} customers reactivated who wouldn’t otherwise have bought, with the interval from the test.`,
          `${OB.xT} customers reactivated, since every one of them used the offer and bought something within the month.`,
          `${OB.xT - OB.xC} customers reactivated: the buyers in the offered group minus the buyers in the holdout group.`,
          'Nothing can be said without a significance test, which the marketing manager didn’t run on these numbers.',
        ],
        answer: 0,
        hints: ['How many of the offered group would have bought anyway, at the holdout’s rate?'],
        feedback: {
          1: `At the holdout’s rate, about ${fx(ob.p2 * OB.nT, 0)} of the offered customers would have bought anyway.`,
          2: 'The groups are different sizes, so subtracting counts mixes the offer’s effect with the group sizes. Use the difference in rates times the number offered.',
          3: 'The confidence interval already says how precise the estimate is; it excludes zero.',
        },
      },
    ],
  },
  {
    id: 'm06-loy-g2', type: 'num', kind: 'numerical',
    prompt: 'A fictional hair salon texts lapsed clients a $5-off offer; each redemption costs the salon $5, the texts cost nothing, and a client won back is worth $40 of margin. In its test, 16.8% of the clients texted came back. What is the break-even uplift, in percentage points?',
    answer: 2.1, check: () => 0.168 * 5 / 40 * 100, unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [{ value: 12.5, say: 'That is 5 ÷ 40, the cost per client won back if every redeemer were won back. Only the uplift is won back; every redeemer costs $5, so multiply by the response rate.' }],
    hints: ['Break-even uplift = (response rate × cost per redemption + contact cost) ÷ value.', '(0.168 × 5 + 0) ÷ 40.'],
    solution: '(0.168 × $5) ÷ $40 = 0.021, 2.1 points. If the text lifts returns by more than 2.1 points over the holdout, the clients it wins cover the discounts given to everyone who redeems.',
  },
  {
    id: 'm06-loy-g3', type: 'steps', kind: 'applied',
    prompt: `The worksheet lists the first ${N} members who joined the cafés in July 2027, whether they turned on notifications, and how many days had passed since their last visit on 31 December 2027. G1 holds the lapse definition.`,
    solution: `<x>=COUNTIFS(B2:B${last},1,D2:D${last},">"&G1)/COUNTIF(B2:B${last},1)</x>: with 60 days, ${fx(lapsedShare(1) * 100, 1)}% of the ${nJulOn} members with notifications on had lapsed, against ${fx(lapsedShare(0) * 100, 1)}% of those with them off. Whatever the gap in a sample, it compares people who chose differently.`,
    steps: [
      {
        id: 'm06-loy-g3-s1', type: 'formula',
        prompt: 'In G3, calculate the share of members with notifications on (B = 1) who had lapsed: more days since their last visit than G1.',
        sheet: { cells: { ...julCells, F3: 'Lapsed, notifications on' }, vary: { G1: [30, 45, 90] } },
        cell: 'G3', answer: `=COUNTIFS(B2:B${last},1,D2:D${last},">"&G1)/COUNTIF(B2:B${last},1)`,
        alt: [`=COUNTIFS(D2:D${last},">"&G1,B2:B${last},1)/COUNTIF(B2:B${last},1)`, `=COUNTIFS(B2:B${last},1,D2:D${last},">"&G1)/SUM(B2:B${last})`],
        view: `A1:G${last}`, maxHeight: '20rem', formats: { G3: '0.0%' }, widths: { A: 9, B: 13, C: 8, D: 19, F: 22 },
        require: ['COUNTIFS'],
        wrong: [
          { formula: `=COUNTIFS(B2:B${last},1,D2:D${last},">"&G1)/${N}`, say: 'Divide by the members with notifications on, not by everyone.' },
          { formula: `=COUNTIFS(B2:B${last},1,D2:D${last},">60")/COUNTIF(B2:B${last},1)`, say: 'Refer to G1 (">"&G1), so the share follows the lapse definition.' },
        ],
        hints: ['Two conditions: B equals 1 and D greater than G1; divide by the members with B equal to 1.', `<x>=COUNTIFS(B2:B${last},1,D2:D${last},">"&G1)/COUNTIF(B2:B${last},1)`],
      },
      {
        id: 'm06-loy-g3-s2', type: 'mc',
        prompt: 'Across all 2,584 members, those with notifications on lapsed later (median 57 against 48 days with a 60-day definition, log-rank p = 0.003). What does that allow Ana to say?',
        options: [
          'Members who chose notifications lapsed later; whether notifications caused it needs a randomised test.',
          'Notifications delay lapsing by about nine days, so turning them on for everyone would add about nine days.',
          'The difference is significant, so it must be caused by the notifications rather than by anything else.',
          'Nothing, because the lapse definition is arbitrary.',
        ],
        answer: 0,
        hints: ['Who decided which members had notifications on?'],
        feedback: {
          1: 'Members chose the setting; keener members may both choose it and come back.',
          2: 'Significance rules out chance, not self-selection.',
          3: 'The definition matters, and the widget shows the gap persists at 30 and 90 days; the problem is who chose, not the definition.',
        },
      },
    ],
  },
  {
    id: 'm06-loy-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Reichheld and Sasser (1990) are the source of the claim that retaining 5% more customers can nearly double profits. Using lifetime value with a 10% discount rate, five more points of retention raise a customer’s value by about 11% at 60% retention and about 33% at 90%. What follows?',
    options: [
      'Retention’s effect on value depends on where it starts, and neither figure counts what extra retention costs.',
      'The claim is false, because the lifetime-value gains are much smaller than 100%.',
      'The claim is true for every business, because retention always raises profit.',
      'Retention matters most for businesses with low retention, which gain most from five extra points because they have most room to improve.',
    ],
    answer: 0,
    hints: ['Compare the two gains. Which business gains more from five points?'],
    feedback: {
      1: 'Profit and lifetime value differ, and the article is about particular service companies; the gains here neither prove nor disprove it.',
      2: 'The size of the gain varies widely, and the cost of buying retention can cancel it.',
      3: 'The opposite: five points matter most where retention is already high.',
    },
    solution: 'Value per dollar of margin is (1 + d) ÷ (1 + d − r); five points shrink the denominator by a larger share when it is already small. How much retention is worth depends on the business, and the cost of achieving it must come off.',
  },
];

export const independent = [
  {
    id: 'm06-loy-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional hair salon texts a win-back offer to a random 500 lapsed clients and holds out another 500. 84 of those texted and 60 of the holdout book within a month. Calculate the upper limit of the 95% confidence interval for the difference in booking rates, in percentage points, using the unpooled standard error. Give one decimal place.',
    answer: Math.round(hs.high * 1000) / 10, check: () => { const a = 84 / 500, b = 60 / 500; return (a - b + 1.96 * Math.sqrt(a * (1 - a) / 500 + b * (1 - b) / 500)) * 100; }, unit: 'percentage points', places: 1, tol: 0.06,
    wrong: [{ value: Math.round(hs.low * 1000) / 10, say: 'That is the lower limit. Add 1.96 standard errors for the upper one.' }, { value: 4.8, say: 'That is the difference itself. Add 1.96 standard errors.' }],
    solution: `Rates 16.8% and 12.0%, difference 4.8 points; SE = √(0.168 × 0.832 ÷ 500 + 0.12 × 0.88 ÷ 500) = ${fx(hs.se * 100, 2)} points; upper limit 4.8 + 1.96 × ${fx(hs.se * 100, 2)} = ${fx(hs.high * 100, 1)} points (lower ${fx(hs.low * 100, 1)}).`,
  },
  {
    id: 'm06-loy-i2', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement describes what Kivetz, Urminsky and Zheng (2006) found with a café’s ten-coffee reward card?',
    options: [
      'Members bought more often as they got closer to the free coffee, and a 12-stamp card with two stamps already filled was completed faster than a plain 10-stamp card.',
      'The reward card raised the café’s total annual coffee sales by about 20% compared with a café without a card.',
      'Members slowed down after the first few stamps, so cards with fewer stamps worked better.',
      'Giving two free stamps made customers value the card less, so they completed it more slowly.',
    ],
    answer: 0,
    feedback: {
      1: 'The 20% is the shortening of the time between purchases from the first to the last before the reward, among card members; the study doesn’t compare annual sales with a café without a card.',
      2: 'The opposite: purchases sped up as the reward approached (the goal-gradient effect).',
      3: 'The cards with two stamps already filled were completed faster (12.7 days against 15.6).',
    },
    solution: 'Purchase acceleration towards the reward (about 20% shorter intervals) and the illusionary goal progress experiment (12.7 against 15.6 days for the same ten purchases). It shows how members behave, not how much a card adds to total sales.',
  },
  {
    id: 'm06-loy-i3', type: 'mc', kind: 'applied',
    prompt: 'A fictional regional juice brand with a 4% market share launches a points scheme hoping its buyers will become as loyal as those of the 30%-share market leader. What does double jeopardy suggest?',
    options: [
      'Its buyers will probably stay less loyal than the leader’s; growth will come mainly from winning more buyers.',
      'The scheme will make its buyers more loyal than the leader’s, because small brands have more room to grow loyalty and more to gain from it.',
      'Small brands have fewer but more loyal buyers, so it is already ahead of the leader on loyalty and needs no scheme.',
      'Double jeopardy applies only to brands without loyalty schemes, so launching the scheme removes the pattern for it.',
    ],
    answer: 0,
    feedback: {
      1: 'Programme studies (Sharp and Sharp, 1997) found little excess loyalty, and double jeopardy works against small brands.',
      2: 'Double jeopardy says small brands’ buyers also tend to buy them less often, not more.',
      3: 'Sharp and Sharp tested a large programme and found only weak excess loyalty; no scheme is known to remove the pattern.',
    },
    solution: 'Small brands have fewer buyers who also buy them less often. Loyalty largely follows size, so a programme rarely creates much excess loyalty; penetration is the main route to growth.',
  },
  {
    id: 'm06-loy-i4', type: 'num', kind: 'numerical',
    prompt: 'Lantern wants a win-back test able to detect a rise in 30-day returns from 15% to 20% with 80% power at the 5% significance level (two-sided). About how many members does each group need? Use z = 1.96 and 0.84 and round up.',
    answer: Math.ceil((1.96 + 0.84) ** 2 * (0.15 * 0.85 + 0.2 * 0.8) / 0.05 ** 2), check: () => Math.ceil((1.96 + 0.84) ** 2 * (0.15 * 0.85 + 0.2 * 0.8) / 0.0025), unit: 'members', places: 0, tol: 1,
    wrong: [{ value: Math.ceil((1.96 + 0.84) * (0.15 * 0.85 + 0.2 * 0.8) / 0.0025), say: 'Square the sum of the z values: (1.96 + 0.84)².' }],
    solution: `(1.96 + 0.84)² × (0.15 × 0.85 + 0.20 × 0.80) ÷ 0.05² = 7.84 × 0.2875 ÷ 0.0025 = ${Math.ceil(7.84 * 0.2875 / 0.0025)} a group. Lantern’s ${861} members who lapsed in the window would not be enough in one month.`,
  },
  {
    id: 'm06-loy-i5', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional supermarket reports that its loyalty-card holders spend twice as much a year as other shoppers. Select all the statements that are fair conclusions.',
    options: [
      'Card holders spend more than other shoppers.',
      'The difference partly reflects who chooses to get a card: frequent shoppers have more reason to.',
      'The card doubles the spending of the shoppers who get it.',
      'Giving cards to every shopper would double total spending.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'Card holders chose to join; heavy shoppers have most to gain from a card. The comparison can’t separate the card’s effect from who joins.',
      3: 'That treats a self-selected comparison as the effect of the card, for shoppers quite unlike the current holders.',
    },
    solution: 'The comparison describes two groups that chose differently. Only randomising who is offered the card (or a staggered launch) measures what it adds.',
  },
  {
    id: 'm06-loy-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym offers a free personal-training session to 1,000 members whose attendance has fallen; 1,000 similar members are held out. 31% of those offered renew next month, against 26% of the holdout. Each session used costs the gym $12, the offer emails cost nothing, and a renewal is worth $45 of margin. What is the net value of the offer, in dollars? Assume everyone offered who renews used the session.',
    answer: 1000 * 0.05 * 45 - 1000 * 0.31 * 12, check: () => 1000 * (0.31 - 0.26) * 45 - 1000 * 0.31 * 12, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 1000 * 0.05 * 45 - 1000 * 0.05 * 12, say: 'Every offered member who renews uses a session, including those who would have renewed anyway: the cost is on 31%, not on the 5-point uplift.' }, { value: 1000 * 0.31 * 45 - 1000 * 0.31 * 12, say: 'Only the uplift over the holdout is caused by the offer; the 26% would have renewed anyway.' }],
    solution: `Value: 1,000 × 0.05 × $45 = $2,250. Cost: 1,000 × 0.31 × $12 = $3,720. Net: −$1,470. The offer works (5 more renewals in every hundred) but loses money: the break-even uplift is 0.31 × 12 ÷ 45 = ${fx(0.31 * 12 / 45 * 100, 1)} points.`,
  },
];

export const check = [
  {
    id: 'm06-loy-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why must a win-back test have a randomly chosen holdout group, rather than comparing customers who used the offer with those who didn’t?',
    options: [
      'Users and non-users of an offer differ in ways that also affect returning; only random assignment isolates the offer.',
      'A holdout group makes the test larger, which reduces the p-value and so makes any effect of the offer easier to declare significant.',
      'Customers who don’t use an offer can’t be tracked afterwards.',
      'Random assignment guarantees that the offer will show a positive effect, because chance spreads the keen customers evenly.',
    ],
    answer: 0,
    feedback: {
      1: 'The size isn’t the point; without randomisation a large comparison is still biased.',
      2: 'They can be tracked like anyone else; the problem is that they chose differently.',
      3: 'Randomisation makes the comparison fair; it can just as well show no effect, or a harmful one.',
    },
    solution: 'Users and non-users of an offer select themselves. Chance assignment makes the groups alike apart from the offer, so the difference in outcomes estimates what the offer did.',
  },
  {
    id: 'm06-loy-k2', type: 'formula', kind: 'numerical',
    prompt: 'In B7, calculate the net value of the offer: the value of the customers it won back (the uplift over the holdout, times the customers offered, times the value of each) minus the cost of every redemption (everyone offered who returned redeemed).',
    sheet: { cells: { ...netCells }, vary: { B2: [0.18, 0.24, 0.27], B3: [0.12, 0.15, 0.17] } },
    cell: 'B7', answer: '=B1*(B2-B3)*B5-B1*B2*B4', alt: ['=B1*((B2-B3)*B5-B2*B4)'],
    view: 'A1:B7', formats: { B1: '#,##0', B2: '0.0%', B3: '0.0%', B4: '$#,##0.00', B5: '$#,##0.00', B7: '$#,##0.00' }, widths: { A: 30, B: 12 },
    wrong: [
      { formula: '=B1*(B2-B3)*B5-B1*(B2-B3)*B4', say: 'The cost falls on every redeemer, including those who would have returned anyway: B1 × B2 × B4.' },
      { formula: '=B1*B2*B5-B1*B2*B4', say: 'Only the uplift over the holdout is caused by the offer; value it at B2 − B3.' },
    ],
    solution: `<x>=B1*(B2-B3)*B5-B1*B2*B4</x> = 1,200 × 0.05 × $18 − 1,200 × 0.21 × $2.50 = $${fx(netAns)}.`,
  },
  {
    id: 'm06-loy-k3', type: 'num', kind: 'numerical',
    prompt: 'With a 10% discount rate and margins at the start of each year (the first now), by what percentage does a customer’s lifetime value rise when retention goes from 70% to 75%? Give one decimal place.',
    answer: Math.round(lift(0.7, 0.1) * 1000) / 10, check: () => ((1.1 / 0.35) / (1.1 / 0.4) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 5, say: 'Retention rises five points, but value is m(1 + d) ÷ (1 + d − r): the denominator falls from 0.40 to 0.35, a much larger change.' }, { value: Math.round((0.35 / 0.4 - 1) * 1000) / 10, say: 'Value is proportional to 1 ÷ (1 + d − r), so the ratio is 0.40 ÷ 0.35, not 0.35 ÷ 0.40.' }],
    solution: `Value ∝ 1 ÷ (1.1 − r): 1 ÷ 0.35 against 1 ÷ 0.40, a ratio of 0.40 ÷ 0.35 = ${fx(0.4 / 0.35, 4)}, so ${fx(lift(0.7, 0.1) * 100, 1)}% higher, before the cost of buying the extra retention.`,
  },
  {
    id: 'm06-loy-k4', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s fictional pastry test gave an uplift of 6.0 points (95% CI 0.7 to 11.3) against a break-even uplift of 2.76 points. What is the best summary for the owners?',
    options: [
      'The offer probably pays, since the estimate is well above break-even, but the interval reaches below break-even, so keep a holdout and keep measuring.',
      'The offer pays for certain, because the result is statistically significant.',
      'The offer doesn’t pay, because the interval includes values below break-even.',
      'The test is inconclusive and should be ignored, because the interval is wide.',
    ],
    answer: 0,
    feedback: {
      1: 'Significant means the uplift is probably above zero, not that it is above break-even.',
      2: 'The interval reaches below break-even but most of it lies above; “probably pays” is the fair reading.',
      3: 'A wide interval is still evidence; it says the effect is positive and probably profitable, with uncertainty about how much.',
    },
    solution: 'Compare the interval with the break-even uplift. Most of it is above, so the offer probably pays; the low end is below, so a continuing holdout is the cheap way to firm up the answer.',
  },
  {
    id: 'm06-loy-k5', type: 'num', kind: 'numerical',
    prompt: 'A retention offer costs $3 per redemption and nothing to send; a customer it keeps is worth $25. In a test, 24% of the customers offered stayed active. What is the break-even uplift over the holdout, in percentage points? Give two decimal places.',
    answer: 2.88, check: () => 0.24 * 3 / 25 * 100, unit: 'percentage points', places: 2, tol: 0.005,
    wrong: [{ value: 12, say: 'That is 3 ÷ 25. The cost falls on the 24% who redeem, so multiply by 0.24.' }],
    solution: '0.24 × $3 ÷ $25 = 0.0288: the offer pays if it lifts the share staying active by more than 2.88 points over the holdout.',
  },
  {
    id: 'm06-loy-k6', type: 'classify', kind: 'conceptual',
    prompt: 'For each statement about loyalty and retention evidence, say whether it is true or false.',
    items: [
      'Sharp and Sharp (1997) found only weak excess loyalty for the brands in a large loyalty programme.',
      'Halving the difference a test must detect roughly halves the customers needed in each group.',
      'A win-back offer’s redemptions overstate the customers it won back, because some redeemers would have returned anyway.',
      'Members of the cafés with notifications on lapsed later, which shows notifications keep members coming.',
    ],
    categories: ['True', 'False'],
    answer: [0, 1, 0, 1],
    feedback: {
      0: 'Weak and inconsistent across brands; two of six deviated substantially, also among non-members.',
      1: 'n depends on 1 ÷ (difference)², so halving the difference roughly quadruples n.',
      2: 'The holdout’s rate shows how many would have come back with no offer.',
      3: 'Members chose notifications; the later lapses are an association, not a demonstrated effect.',
    },
    solution: 'True, false, true, false.',
  },
];
