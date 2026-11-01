// acquisition-cost-and-payback.js — M06 · Acquisition cost and payback. Content only; exercises are in
// acquisition-cost-and-payback.ex.js. Glenmarra Climbing Centre (fictional) for channel CACs and contractual payback;
// Lantern's 2028 sign-up campaign is a fictional proposal whose costs and expected joiners are stated assumptions, set
// against the 2027 cohorts' real margin per joiner (case.js; margin 67% from F03, discounting 0.8% a month, as in
// customer-lifetime-value). The project's subscriptions are not used. Every printed figure is recomputed in `checks`.
import { MEMBER_LIST, VISIT_LIST, joinMap, members } from './case.js?v=25';
import * as CU from '../../../core/customer.js?v=25';

const MR = 0.67, D_M = 0.008;
const f2 = (v) => v.toFixed(2);
const money = (v, d = 2) => `$${v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

// ---------------------------------------------------------------- Glenmarra Climbing Centre (fictional): new members by channel, Jan–Mar
const CH = [
  { name: 'Search ads', spend: 4200, n: 60 },
  { name: 'Social ads', spend: 3000, n: 25 },
  { name: 'Member referrals (a free month for the referrer)', spend: 900, n: 30 },
  { name: 'No identified channel (walk-ins, word of mouth)', spend: 0, n: 85 },
];
const totSpend = CH.reduce((s, c) => s + c.spend, 0), totN = CH.reduce((s, c) => s + c.n, 0), paidN = CH.filter((c) => c.spend > 0).reduce((s, c) => s + c.n, 0);
const blended = totSpend / totN, paid = totSpend / paidN;
const GM = { m: 28, r: 0.90, d: D_M };
const gClv = CU.clvConstant(GM).value;
const pb = (cac) => CU.payback({ cac, ...GM });
const cum = CU.clvConstant(GM).curve(12);
const ratio = (cac) => gClv / cac;
const pbR = (cac, r) => CU.payback({ cac, m: 28, r, d: D_M });

// ---------------------------------------------------------------- Lantern's proposed 2028 campaign (fictional assumptions)
const CT = CU.cohortTable(joinMap(), VISIT_LIST);
const spring27 = CT.cohorts.slice(0, 3).reduce((s, c) => s + c.size, 0);   // March–May 2027 joiners
const CAMP = { ads: 1800, drink: 1.1, expected: 1000, baseline: spring27 };
const campCost = CAMP.ads + CAMP.drink * CAMP.expected, extra = CAMP.expected - CAMP.baseline;
const cacBlend = campCost / CAMP.expected, cacInc = campCost / extra;
const curves = CT.cohorts.map((c, i) => { let a = 0; return { label: c.label, size: c.size, cum: CT.revenue[i].map((v, k) => (a += v / c.size * MR / (1 + D_M) ** k)) }; });
const crossAt = (cv, cac) => cv.cum.findIndex((x) => x >= cac);
const mar = curves[0];
// value of a new member (as in customer-lifetime-value)
const MAR = CT.revenue[0].map((v) => v / CT.cohorts[0].size);
const qDecay = (MAR[9] / MAR[4]) ** (1 / 5);
let tail = 0; for (let k = 10; k < 2000; k++) tail += MAR[9] * qDecay ** (k - 9) * MR / (1 + D_M) ** k;
const memberValue = mar.cum[9] + tail;
const ratioInc = memberValue / cacInc, ratioHalf = memberValue / 2 / cacInc;
const breakEvenShare = cacInc / memberValue;
// joiners who individually covered the incremental CAC by 31 December (March 2027 joiners)
const marMembers = members().filter((c) => c.joinedIso < '2027-04-01');
const covered = marMembers.filter((c) => c.monetary * MR >= cacInc).length / marMembers.length;
const crossJoinMonth = curves.slice(0, 8).map((cv) => crossAt(cv, cacInc));
const ad = (cv) => cv.cum[0] >= cacBlend;

// ---------------------------------------------------------------- figure: cohort payback curves
function paybackFigure() {
  const x0 = 62, x1 = 420, y0 = 250, y1 = 26, K = 9, Ymax = 30;
  const X = (k) => x0 + k / K * (x1 - x0), Y = (v) => y0 - v / Ymax * (y0 - y1);
  let s = '<svg viewBox="0 0 440 340" xmlns="http://www.w3.org/2000/svg" font-size="15" fill="currentColor">';
  [0, 10, 20, 30].forEach((v) => { s += `<line x1="${x0}" x2="${x1}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--rule-strong)" stroke-width="0.6"/><text x="${x0 - 8}" y="${(Y(v) + 5).toFixed(1)}" text-anchor="end" font-size="15" fill="var(--ink-3)">$${v}</text>`; });
  for (let k = 0; k <= K; k += 3) s += `<text x="${X(k).toFixed(1)}" y="${y0 + 22}" text-anchor="middle" font-size="15" fill="var(--ink-3)">${k}</text>`;
  s += `<text x="${(x0 + x1) / 2}" y="${y0 + 44}" text-anchor="middle" font-size="15">Months since joining</text>`;
  const draw = (cv, cls, dash) => { const d = cv.cum.map((v, k) => `${k ? 'L' : 'M'}${X(k).toFixed(1)},${Y(v).toFixed(1)}`).join(''); return `<path d="${d}" fill="none" stroke="var(${cls})" stroke-width="2.6"${dash ? ' stroke-dasharray="7 4"' : ''}/>`; };
  s += draw(curves[0], '--series-1', false) + draw(curves[5], '--series-2', true);
  s += `<line x1="${x0}" x2="${x1}" y1="${Y(cacInc).toFixed(1)}" y2="${Y(cacInc).toFixed(1)}" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="2 4"/>`;
  s += `<line x1="${x0}" x2="${x1}" y1="${Y(cacBlend).toFixed(1)}" y2="${Y(cacBlend).toFixed(1)}" stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="2 4"/>`;
  s += `<line x1="20" x2="48" y1="306" y2="306" stroke="var(--series-1)" stroke-width="2.6"/><text x="54" y="311" font-size="15">March joiners</text>`;
  s += `<line x1="200" x2="228" y1="306" y2="306" stroke="var(--series-2)" stroke-width="2.6" stroke-dasharray="7 4"/><text x="234" y="311" font-size="15">August joiners</text>`;
  s += `<line x1="20" x2="48" y1="330" y2="330" stroke="var(--series-3)" stroke-width="2" stroke-dasharray="2 4"/><text x="54" y="335" font-size="15">incremental CAC</text>`;
  s += `<line x1="200" x2="228" y1="330" y2="330" stroke="var(--ink-3)" stroke-width="1.6" stroke-dasharray="2 4"/><text x="234" y="335" font-size="15">blended CAC</text>`;
  return `${s}</svg>`;
}

export default {
  slug: 'acquisition-cost-and-payback',
  title: 'Acquisition cost and payback',
  blurb: 'What does it cost to win a customer, and how long until they pay it back? Measure acquisition cost with the right costs, customers and period, blended, paid and by channel; work out payback with and without retention and discounting; read cohort payback curves; and judge the value-to-cost ratio without treating a rule of thumb as a law.',
  status: 'reviewed',
  objectives: [
    'Calculate customer acquisition cost blended, for paid channels and by channel, stating which costs, which customers and which period it covers.',
    'Distinguish the average cost of the customers a campaign wins from the incremental cost of those it wins who would not have come anyway.',
    'Calculate the payback period simply and with retention and discounting, and explain why the simple figure flatters.',
    'Read cohort payback curves to find when a cohort’s margin per joiner first covers its acquisition cost.',
    'Evaluate an acquisition plan with the value-to-cost ratio, its assumptions and their sensitivity, treating the 3:1 guideline as a convention.',
  ],
  prerequisites: [
    { lesson: 'm06/customer-lifetime-value', why: 'The value of a new customer (timing A) and a café member’s value from the cohort table.' },
    { lesson: 'm01/customer-value', why: 'Acquisition cost as spend ÷ customers won, and comparing it with lifetime value.' },
    { lesson: 'm02/measuring-the-mix', why: 'Attribution rules and incrementality: which sales a campaign actually caused.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana is planning a spring 2028 campaign (a fictional proposal, with costs she has estimated): flyers and local social ads costing $1,800 for March to May, and a free drink for everyone who joins the app in those months, which costs the cafés $1.10 in ingredients a time. She expects 1,000 new members over the three months. Without any campaign she would expect about as many as signed up in spring 2027, ${spring27}. Is the campaign worth it?` },

    { h: 'What it costs to win a customer' },
    { p: '<g>Customer acquisition cost</g> (CAC) is the spending on winning new customers in a period divided by the number of new customers won. It is the other side of lifetime value: CLV says what a new customer is worth, CAC what one costs, and a business that pays more to win customers than they are worth loses money on every one, however fast it grows.' },
    { p: 'The formula is a division, and each half needs a definition. <b>Which costs:</b> everything the acquisition causes, not only advertising: media, design and printing, sales commissions, sign-up offers and the cost of free products, and staff time spent on it. Costs of serving the customer afterwards belong in the margin, not in CAC. <b>Which customers:</b> new ones, not returning or reactivated customers. <b>Which period:</b> spending and customers should match, allowing for a lag when people sign up weeks after seeing an advertisement.' },

    { h: 'Blended, paid and by channel' },
    { p: `Glenmarra Climbing Centre (fictional) sells monthly memberships. From January to March it spent $8,100 on acquisition and gained 200 new members, but not all through the same route.` },
    { table: {
      caption: 'Glenmarra Climbing Centre (fictional): new members, January–March',
      head: ['Channel', 'Spend', 'New members', 'CAC'],
      rows: CH.map((c) => [c.name, money(c.spend, 0), String(c.n), c.spend ? money(c.spend / c.n) : '—']),
      foot: [['All channels', money(totSpend, 0), String(totN), money(blended)]],
      align: ['l', 'r', 'r', 'r'],
      note: 'Channels as recorded at sign-up (the member names where they heard of the centre, or the referral code they used).',
    } },
    { p: `The <b>blended</b> CAC divides all acquisition spend by all new members: ${money(totSpend, 0)} ÷ ${totN} = ${money(blended)}. It flatters, because ${CH[3].n} of the 200 came with no spending at all. The <b>paid</b> CAC divides the spend by the members the paid channels brought: ${money(totSpend, 0)} ÷ ${paidN} = ${money(paid)}. And <b>by channel</b> the costs range from ${money(CH[2].spend / CH[2].n)} for a referral to ${money(CH[1].spend / CH[1].n)} for a member won through social ads. A decision about the social budget needs the social figure; the blended one hides it.` },
    { p: 'Even the channel figures rest on a rule for giving credit. Here each member is assigned to the channel they named at sign-up; someone who saw a social ad and then searched for the centre counts as a search member. <g>Attribution</g> rules (last click, first click, shares across touchpoints) move members between channels and so move the channel CACs, which is why M02 treats them with caution.' },

    { h: 'The customers a campaign actually wins' },
    { p: `Back to Lantern. Ana’s campaign would cost $1,800 + 1,000 × $1.10 = ${money(campCost)}, and every joiner gets the free drink, including those who would have joined anyway. Divided by all 1,000 joiners, that is ${money(cacBlend)} a member. But only about ${extra} of the 1,000 (1,000 − ${spring27}) are members the campaign would have won; the rest would have signed up at the till regardless. The cost per member won is ${money(campCost)} ÷ ${extra} = ${money(cacInc)}, the <g>incremental acquisition cost</g>. It is the one to compare with what a member is worth, because it is the cost of the extra members the decision buys.` },
    { callout: 'key', title: 'Average or incremental?', html: `Blended CAC answers “what did all our new customers cost on average?” Incremental CAC answers “what does each extra customer this spending wins cost?” For Lantern’s campaign the first is ${money(cacBlend)} and the second ${money(cacInc)}, more than four times as much. Decisions about spending more (or less) need the second, and it depends on an estimate of how many customers would have come anyway: here last spring’s ${spring27}, an assumption, and the most uncertain figure in the plan.` },

    { h: 'How long until a customer pays back?' },
    { p: String.raw`The <g>payback period</g> is the time until the margin a newly won customer brings in covers what it cost to win them. The quick version divides CAC by the margin per period: a Glenmarra member won through social ads costs $120 and brings $28 of margin a month, <m>120 / 28 = 4.3</m>, and counting the joining month as month 1 the cost is covered in month 5. That assumes every member stays. With 90% of members renewing each month and discounting at 0.8% a month, the expected discounted margin builds up more slowly: $${f2(cum[0])} after month 1, $${f2(cum[3])} after month 4, $${f2(cum[4])} after month 5 and $${f2(cum[5])} after month 6, so payback comes in month ${pb(120)}.` },
    { p: `For café members, payback can be read straight from the cohort table. The figure shows the cumulative margin per joiner (discounted at 0.8% a month) of two 2027 cohorts against the campaign’s two CACs. The blended ${money(cacBlend)} is covered on the join visit itself. The incremental ${money(cacInc)} is covered in month 2 (the third month, counting the join month as month 0) for the March joiners and in month 1 (the second) for the August joiners.` },
    { figure: {
      svg: paybackFigure(),
      caption: 'Cumulative margin per joiner by months since joining, March and August 2027 joiners, against the proposed campaign’s blended and incremental acquisition costs (the costs are fictional assumptions).',
      alt: `A line chart of cumulative margin per joiner in dollars, from $0 to $30, against months since joining, 0 to 9. The March joiners’ line rises from $${f2(curves[0].cum[0])} in month 0 to $${f2(curves[0].cum[9])} in month 9, steeply at first and then flattening. The August joiners’ dashed line starts higher, at $${f2(curves[5].cum[0])}, and reaches $${f2(curves[5].cum[4])} by month 4, the last month observed. A dotted horizontal line at $${f2(cacInc)} (incremental CAC) is crossed by the March line in month 2 and by the August line in month 1; a lower dotted line at $${f2(cacBlend)} (blended CAC) lies below both lines from month 0.`,
    } },
  ],

  theory: [
    { h: 'Payback with retention and discounting' },
    { p: String.raw`With margins at the start of each period (the first on joining), retention <m>r</m> and discount rate <m>d</m>, the expected discounted margin after <m>T</m> periods is <m>\sum_{t=0}^{T-1} m\,r^t/(1+d)^t</m>, the finite-horizon value of the previous lesson. The payback period is the smallest <m>T</m> for which it reaches CAC. Because that sum can never exceed the lifetime value <m>m(1+d)/(1+d-r)</m>, a customer whose CAC is above their lifetime value never pays back. At Glenmarra, ${money(gClv)} is the most a member can bring, so a channel costing more than that per member loses money however long it waits.` },
    { table: {
      caption: 'Glenmarra (fictional): payback and value-to-cost by channel, $28 margin a month, 90% monthly retention, 0.8% monthly discounting',
      head: ['Channel', 'CAC', 'Simple payback (month)', 'Payback with retention (month)', 'Value ÷ CAC'],
      rows: [
        ['Member referrals', money(30), String(Math.ceil(30 / 28)), String(pb(30)), ratio(30).toFixed(1)],
        ['Search ads', money(70), String(Math.ceil(70 / 28)), String(pb(70)), ratio(70).toFixed(1)],
        ['Social ads', money(120), String(Math.ceil(120 / 28)), String(pb(120)), ratio(120).toFixed(1)],
        ['Paid channels together', money(paid), String(Math.ceil(paid / 28)), String(pb(paid)), ratio(paid).toFixed(1)],
      ],
      align: ['l', 'r', 'r', 'r', 'r'],
      note: `Lifetime value of a new member with the first month’s margin now: 28 × 1.008 ÷ (1.008 − 0.90) = ${money(gClv)}. Both payback columns count whole months, month 1 being the month of joining; simple payback is CAC ÷ $28 rounded up.`,
    } },
    { p: `Retention matters more for payback than the simple figure admits. At 80% monthly retention instead of 90%, a social-ads member takes ${pbR(120, 0.8)} months to pay back; at 78%, ${pbR(120, 0.78)}; and at 75% they never do, because their lifetime value falls to 28 × 1.008 ÷ 0.258 = ${money(28 * 1.008 / (1.008 - 0.75))}, below the $120 they cost.` },

    { h: 'The value-to-cost ratio' },
    { p: `Dividing the lifetime value of a new customer by CAC gives a <g>value-to-cost ratio</g>, often written LTV:CAC. Above 1 the customers are worth more than they cost; the margin above 1 has to cover the risk that the assumptions are wrong and the fixed costs the margin doesn’t. A widely quoted guideline, from the venture investor David Skok’s writing on software-as-a-service (SaaS) businesses, is a ratio above 3 and CAC recovered within 12 months. Skok states its conditions: it is for SaaS firms with gross margins of 80% or more, and the lifetime value in it is revenue-based, before the gross-margin adjustment, so on a margin basis like this lesson’s it corresponds to roughly 3 × 0.8 = 2.4. It is a guideline for one industry, not a law of marketing. Glenmarra’s social channel sits at ${ratio(120).toFixed(2)} on a margin basis, below even that equivalent; search sits at ${ratio(70).toFixed(2)}.` },
    { p: 'The ratio and the payback period answer different questions. The ratio says whether customers are worth winning at all; payback says how long the cash is tied up, which matters to a small business that must fund acquisition before the margins arrive. A channel can have a good ratio and a slow payback (long-lived customers who pay little each month) or a quick payback and a poor ratio (customers who spend early and leave).' },

    { h: 'Which lifetime value?' },
    { p: 'The ceiling on acquisition spending is the full value of a new customer (timing A, or B), because winning the customer wins their first margin too. Fader and Hardie (2012) point out that some textbooks set the ceiling with the residual formula, which leaves out the first margin; that understates what winning a customer is worth. Equally, the value must be that of the customers the spending will win. Customers drawn in by a free offer, or from a channel that reaches people less interested in the product, may be worth less than the existing base.' },

    { h: 'Average and marginal' },
    { p: 'CAC usually rises as spending grows: the first advertisements reach the people most likely to respond, and each extra dollar reaches fewer. The average CAC of a campaign therefore hides the cost of its last customers. To decide whether to spend more, estimate the extra customers the extra spending would win (from a test, or from past changes in spending) and divide; M01 called this the marginal CAC. It is the same logic as the incremental CAC of Lantern’s campaign, applied to a change in the size of a budget rather than to a campaign as a whole.' },

    { h: 'Cohort payback curves' },
    { p: `A cohort payback curve plots a cohort’s cumulative margin per joiner by months since joining, as in the figure, and the month it crosses the cohort’s CAC is its payback period. Drawing every cohort shows whether newer cohorts pay back faster or slower, which a single average would hide. For Lantern’s 2027 cohorts the incremental ${money(cacInc)} is crossed in month ${Math.min(...crossJoinMonth)} or month ${Math.max(...crossJoinMonth)} by every cohort from March to October; November’s joiners, with only two months observed, stood at $${f2(curves[8].cum[1])}, just short. Two cautions apply: the curves are averages, so many individual joiners never pay back (of the March joiners, ${(covered * 100).toFixed(1)}% had brought ${money(cacInc)} of undiscounted margin by 31 December; the rest had not); and a cohort that joined in a busy month may look better for seasonal reasons, not because it was better acquired.` },

    { h: 'Limits of the numbers' },
    { list: [
      '<b>Incrementality is an estimate.</b> “How many would have come anyway” is the hardest input. A randomised holdout (some areas or weeks without the campaign) measures it; the last lesson of this module shows how.',
      '<b>Attribution moves costs between channels.</b> A channel’s CAC is only as good as the rule that credited customers to it.',
      '<b>Payback ignores everything after it.</b> Two channels with the same payback can differ greatly in value; read payback with the ratio.',
      '<b>Every figure inherits the lifetime value’s assumptions</b>: margin, retention or decay, discount rate, timing and horizon.',
    ] },
  ],

  formulas: [
    { id: 'm06-cac', name: 'Customer acquisition cost: blended, paid and incremental',
      tex: String.raw`\text{CAC}_{\text{blended}} = \frac{S}{N}, \qquad \text{CAC}_{\text{paid}} = \frac{S}{N_{\text{paid}}}, \qquad \text{CAC}_{\text{incremental}} = \frac{S}{N - N_0}`,
      where: [[String.raw`S`, 'All acquisition spending in the period, including offers and free products given to new customers', '$'], [String.raw`N`, 'New customers won in the period', 'customers'], [String.raw`N_{\text{paid}}`, 'New customers credited to channels with spending', 'customers'], [String.raw`N_0`, 'New customers expected without the spending', 'customers'], [String.raw`\text{CAC}`, 'Acquisition cost per customer', '$ per customer']],
      assumptions: 'Spending and customers refer to the same period; N₀ is an estimate unless measured with a holdout.',
      note: 'By channel: that channel’s spending ÷ the customers credited to it, which depends on the attribution rule.' },
    { id: 'm06-payback-simple', name: 'Simple payback period',
      tex: String.raw`T_{\text{simple}} = \frac{\text{CAC}}{m}`,
      where: [[String.raw`T_{\text{simple}}`, 'Periods until the margin covers the acquisition cost, if the customer never leaves', 'periods'], [String.raw`\text{CAC}`, 'Acquisition cost per customer', '$'], [String.raw`m`, 'Margin per period', '$ per period']],
      assumptions: 'Every customer stays; no discounting. It understates the true payback period.' },
    { id: 'm06-payback', name: 'Payback period with retention and discounting',
      tex: String.raw`T = \min\left\{ T : \sum_{t=0}^{T-1} \frac{m\,r^t}{(1+d)^t} \geq \text{CAC} \right\}`,
      where: [[String.raw`T`, 'Payback period: periods until the expected discounted margin first covers CAC', 'periods'], [String.raw`m`, 'Margin per period, the first on joining', '$ per period'], [String.raw`r`, 'Retention rate per period', ''], [String.raw`d`, 'Discount rate per period', 'per period'], [String.raw`t`, 'Periods since joining', 'periods'], [String.raw`\text{CAC}`, 'Acquisition cost per customer', '$']],
      assumptions: 'Constant retention; margins at the start of each period.',
      note: 'If CAC is above the lifetime value m(1 + d) ÷ (1 + d − r) there is no payback. For noncontractual customers, read T from the cohort’s cumulative margin per joiner.' },
    { id: 'm06-value-cost', name: 'Value-to-cost ratio',
      tex: String.raw`\text{Ratio} = \frac{\text{CLV}}{\text{CAC}}`,
      where: [[String.raw`\text{CLV}`, 'Lifetime value of a new customer of the kind the spending wins (full value, first margin included)', '$'], [String.raw`\text{CAC}`, 'Acquisition cost of those customers (incremental for a decision)', '$'], [String.raw`\text{Ratio}`, 'Value per dollar of acquisition cost', '']],
      note: 'Skok’s guideline of above 3 is for SaaS firms with gross margins of 80% or more and uses revenue-based lifetime value; on a margin basis it is roughly 2.4. An industry convention, not a rule.' },
  ],

  examples: [
    { level: 'simple', title: 'Glenmarra’s CAC three ways', fictional: true,
      setup: 'Use the Glenmarra table in “The idea”: $8,100 of acquisition spending from January to March, 200 new members, 85 of them with no identified channel. Calculate the blended CAC, the paid CAC and the CAC for social ads.',
      steps: [
        `Blended: all spending ÷ all new members = ${money(totSpend, 0)} ÷ ${totN} = ${money(blended)}.`,
        `Paid: all spending ÷ members credited to the three paid channels (60 + 25 + 30 = ${paidN}) = ${money(totSpend, 0)} ÷ ${paidN} = ${money(paid)}.`,
        `Social ads: $3,000 ÷ 25 = ${money(120)}.`,
      ],
      answer: `${money(blended)} blended, ${money(paid)} for the paid channels, ${money(120)} for social ads.`,
      interpretation: 'The three figures differ almost threefold, and each answers a different question. The blended figure describes the quarter; the paid figure is a fairer cost of the members marketing brought; only the channel figure can say whether the social budget earns its keep. None of them says how many of the 85 unattributed members the advertising also nudged.' },

    { level: 'challenging', title: 'Payback with members who leave', fictional: true,
      setup: `A Glenmarra member brings a margin of $28 a month, received at the start of each month from joining; 90% stay each month; Glenmarra discounts at 0.8% a month. A member won through social ads costs $120. Find the simple payback period, the payback period with retention and discounting, and the value-to-cost ratio, and judge the channel.`,
      steps: [
        String.raw`Simple payback: <m>120 / 28 = 4.3</m>, so with month 1 the month of joining the cost is covered in month 5 if no one leaves.`,
        String.raw`Expected discounted margin, month by month: <m>28</m>, then <m>28 \times 0.90/1.008 = ${f2(28 * 0.90 / 1.008)}</m>, then <m>28 \times (0.90/1.008)^2 = ${f2(28 * (0.90 / 1.008) ** 2)}</m>, and so on. Cumulative: $${f2(cum[0])}, $${f2(cum[1])}, $${f2(cum[2])}, $${f2(cum[3])}, $${f2(cum[4])}, $${f2(cum[5])}.`,
        `The cumulative total first reaches $120 in month ${pb(120)} ($${f2(cum[pb(120) - 1])}): the payback period with retention and discounting is ${pb(120)} months.`,
        String.raw`Lifetime value: <m>28 \times 1.008/(1.008 - 0.90) = ${f2(gClv)}</m> dollars, so the ratio is <m>${f2(gClv)}/120 = ${ratio(120).toFixed(2)}</m>.`,
        `Sensitivity: at 80% monthly retention the payback stretches to ${pbR(120, 0.8)} months and the ratio falls to ${(CU.clvConstant({ m: 28, r: 0.8, d: D_M }).value / 120).toFixed(2)}.`,
      ],
      answer: `Simple payback in month 5; with retention and discounting in month ${pb(120)}; value-to-cost ${ratio(120).toFixed(2)}.`,
      interpretation: `Social ads pay, but they are the weakest of Glenmarra’s channels, below the roughly 2.4 that Skok’s software guideline would mean on a margin basis (a guideline for another industry, so not a verdict in itself), and each member ties up $120 for six months. If members won through social ads stay less well than the average (a common pattern for people reached by broad advertising), the true ratio is lower. Glenmarra should check social members’ retention separately before raising that budget, and compare it with the referral channel at ${money(30)} a member.` },

    { level: 'applied', title: 'Should Lantern run the spring campaign?', fictional: true,
      setup: `Ana’s proposal (fictional figures): $1,800 of flyers and ads plus a $1.10 free drink for every joiner from March to May 2028, with 1,000 joiners expected against ${spring27} in spring 2027. From the previous lesson, a new member is worth about ${money(memberValue)} of margin (discounted), and the 2027 cohorts’ curves show the margin per joiner month by month.`,
      steps: [
        `Cost: $1,800 + 1,000 × $1.10 = ${money(campCost)}. Blended CAC: ${money(campCost)} ÷ 1,000 = ${money(cacBlend)}.`,
        `Extra members: 1,000 − ${spring27} = ${extra}. Incremental CAC: ${money(campCost)} ÷ ${extra} = ${money(cacInc)}.`,
        `Value-to-cost on the extra members: ${money(memberValue)} ÷ ${money(cacInc)} = ${ratioInc.toFixed(2)}.`,
        `Payback: the 2027 cohorts’ cumulative margin per joiner passes ${money(cacInc)} in month 1 or 2 after joining (for the March joiners, $${f2(mar.cum[1])} after month 1 and $${f2(mar.cum[2])} after month 2).`,
        `Sensitivity: if the extra members were worth only half as much as 2027’s (people drawn by a free drink may be less keen), the ratio would be ${ratioHalf.toFixed(2)}; the campaign breaks even if they are worth ${(breakEvenShare * 100).toFixed(0)}% of a 2027 member. If only 150 extra members joined instead of ${extra}, the incremental CAC would be ${money(campCost / 150)}.`,
      ],
      answer: `Blended CAC ${money(cacBlend)}, incremental CAC ${money(cacInc)}, value-to-cost about ${ratioInc.toFixed(1)}, payback within about three months, on the plan’s assumptions.`,
      interpretation: `On these assumptions the campaign pays, with a margin of safety: the extra members could be worth well under half of 2027’s and it would still break even. The weak point is the ${extra} extra members, which rest on last spring as the baseline, a spring when the cafés were brand new. Ana could measure it instead: run the campaign at one café, or in alternate weeks, and compare sign-ups with the other café or weeks. Note also that the free drink goes to the ${spring27} who would have joined anyway, which is most of what the drinks cost (${spring27} × $1.10 = ${money(spring27 * CAMP.drink)} of ${money(CAMP.drink * CAMP.expected)}); offering it only to joiners who come in with a flyer would cut the cost without losing the extra members.` },
  ],

  demo: [
    { widget: 'cac-climbing', intro: 'Glenmarra’s social-ads member: $28 a month, 90% monthly retention, $120 to win. Watch the cumulative discounted margin cross the acquisition cost. Lower retention a few points at a time and see payback stretch and then disappear once the lifetime value falls below $120; then set the acquisition cost to the referral channel’s $30.' },
    { widget: 'cac-campaign', intro: 'Lantern’s spring campaign, with every assumption on a slider. The most important is the baseline, how many members would have joined anyway: move it towards the expected total and see the incremental cost per member explode, while the blended cost doesn’t move.' },
  ],

  mistakes: [
    { title: 'Dividing by every new customer', html: 'Blended CAC counts customers who came with no spending, so it understates what marketing pays per customer it brings. Glenmarra’s blended $40.50 hides a $120 social-ads cost. Use the paid or channel figure, and for a decision the incremental one.' },
    { title: 'Counting only the advertising', html: 'Offers, free products, design, printing, commissions and staff time are acquisition costs. Lantern’s free drinks are more than a third of the campaign’s cost; leaving them out would cut the incremental CAC from $12.34 to $7.66.' },
    { title: 'Using simple payback as if customers stayed', html: 'CAC ÷ margin assumes no one leaves. With 90% monthly retention Glenmarra’s simple payback in month 5 becomes month 6; with 75% retention the member never pays back. Use the retention-weighted, discounted sum, or a cohort’s actual curve.' },
    { title: 'Treating 3:1 as a law', html: 'The 3:1 guideline is one David Skok gives for software-as-a-service firms with gross margins of 80% or more, with lifetime value measured on revenue; on a margin basis it is about 2.4. The right threshold depends on how reliable the value estimate is, the fixed costs to cover and how long the cash is tied up. A 2:1 ratio with solid evidence can beat a 5:1 ratio built on hopeful retention.' },
    { title: 'Setting the acquisition ceiling with residual value', html: 'Winning a customer wins their first margin too. The ceiling is the full value of a new customer; the residual formula, which leaves the first margin out, understates it (Fader and Hardie, 2012).' },
    { title: 'Using the average when deciding on more', html: 'The average CAC of past spending says little about the cost of the next customers, who are usually harder to win. Estimate the extra customers the extra spending brings.' },
  ],

  application: [
    { case: `Ana’s recommendation to Lantern’s owners (fictional proposal): “The spring campaign would cost ${money(campCost)}. Spread over everyone who joins it looks like ${money(cacBlend)} a member, but that counts the ${spring27} or so who would have joined anyway. Counting only the extra members it should win, about ${extra}, it costs ${money(cacInc)} each. A new member has been worth about ${money(memberValue, 0)} of margin, and our 2027 members covered ${money(cacInc)} within three months of joining, so the campaign should pay even if the extra members are worth much less than last year’s. The figure I trust least is how many would have joined anyway, so I propose running it at Millbrook only for March and comparing sign-ups with Harbourside before deciding on April and May. I’d also give the free drink only to people who bring a flyer.”` },
    { p: 'In practice acquisition cost is where marketing meets finance. Subscription businesses report CAC and payback to investors; retailers and banks set channel budgets from them; start-ups live or die by whether customers pay back before the cash runs out. The analysis that holds up is the one that says which costs and customers it counts, separates the customers spending won from those it merely touched, and states the lifetime value it compares with.' },
    { p: 'The most common error is optimism through definitions: blended CAC instead of paid, advertising without the offer costs, simple payback instead of retention-weighted, a lifetime value from the best customers applied to new ones. Each makes acquisition look cheaper or customers more valuable than they are, and each can be fixed by writing down the definition before calculating.' },
    { p: 'The most valuable habit is to measure incrementality instead of assuming it. A campaign run in some places or weeks and not others, chosen at random, shows how many customers it really adds, and the incremental CAC that follows is a fact rather than a guess. The next lesson applies the same idea to retention offers.' },
  ],

  summary: [
    'CAC = acquisition spending ÷ new customers won, with every cost the acquisition causes (offers and free products included), new customers only, and spending and customers in the same period.',
    'Blended CAC divides by all new customers, paid CAC by those the paid channels brought, channel CAC by each channel’s customers (Glenmarra: $40.50, $70.43, and $30 to $120); channel figures depend on the attribution rule.',
    'For a decision, use the incremental CAC: spending ÷ the customers who would not have come anyway (Lantern’s campaign: $2.90 blended, $12.34 incremental).',
    'Simple payback, CAC ÷ margin, assumes no one leaves; with retention and discounting it is the first period in which the expected discounted margin covers CAC (Glenmarra social: month 5 against month 6), and if CAC exceeds lifetime value there is none.',
    'Cohort payback curves show when each cohort’s cumulative margin per joiner covers its CAC; they are averages, and many individual customers never pay back.',
    'The value-to-cost ratio CLV ÷ CAC says whether customers are worth winning; Skok’s 3:1 guideline is for SaaS firms with gross margins of 80% or more and revenue-based lifetime value (about 2.4 on a margin basis), a convention. Read it with payback and with the uncertainty in both figures.',
  ],

  glossary: [
    { term: 'Incremental acquisition cost', def: 'Acquisition spending divided by the new customers it won who would not otherwise have come; the cost per extra customer, as opposed to the average over all new customers.' },
    { term: 'Payback period', def: 'The time until the margin a newly won customer brings in covers what it cost to win them; with retention and discounting, the first period in which the expected discounted margin reaches the acquisition cost.' },
    { term: 'Value-to-cost ratio', def: 'A new customer’s lifetime value divided by the cost of acquiring them, often written LTV:CAC; above 1 the customers are worth more than they cost.' },
  ],

  references: [
    { text: 'Skok, D. “SaaS Metrics 2.0 – Detailed Definitions.” <i>For Entrepreneurs</i>.', url: 'https://forentrepreneurs.com/saas-metrics-2-definitions-2/', checked: '2026-11-01' },
    { text: 'Fader, P. S. and Hardie, B. G. S. (2012). “Reconciling and Clarifying CLV Formulas.” Note, brucehardie.com.', url: 'https://www.brucehardie.com/notes/024/reconciling_clv_formulas.pdf', checked: '2026-11-01' },
    { text: 'Microsoft Support. “Use the COUNTIF function in Microsoft Excel”.', url: 'https://support.microsoft.com/en-us/office/countif-function-e0de10c6-f885-4e71-abb4-1f464816df34', checked: '2026-11-01' },
  ],

  checks: [
    // Glenmarra
    { what: 'Total spend', value: totSpend, shown: 8100 },
    { what: 'Total new', value: totN, shown: 200 },
    { what: 'No channel', value: CH[3].n, shown: 85 },
    { what: 'Blended', value: blended, shown: 40.5 },
    { what: 'Paid n', value: paidN, shown: 115 },
    { what: 'Paid n = 60 + 25 + 30', value: 60 + 25 + 30, shown: 115 },
    { what: 'Paid CAC', value: paid, shown: 70.43 },
    { what: 'Search CAC', value: CH[0].spend / CH[0].n, shown: 70 },
    { what: 'Social CAC', value: CH[1].spend / CH[1].n, shown: 120 },
    { what: 'Referral CAC', value: CH[2].spend / CH[2].n, shown: 30 },
    { what: 'Almost threefold (120 ÷ 40.50)', value: 120 / blended, shown: 3, tol: 0.05 },
    { what: 'Simple payback social', value: 120 / 28, shown: 4.3, tol: 0.05 },
    { what: 'Simple payback social: month 5', value: Math.ceil(120 / 28), shown: 5 },
    { what: 'Payback not knife-edge: month 5 short by more than $5, month 6 over by more than $5', value: Number(cum[4] < 115 && cum[5] > 125), shown: 1 },
    { what: 'Skok 80%', value: 80, shown: 80 },
    { what: 'Margin-basis 2.4', value: 3 * 0.8, shown: 2.4, tol: 1e-9 },
    { what: 'Cum 1', value: cum[0], shown: Number(f2(cum[0])) },
    { what: 'Cum 2', value: cum[1], shown: Number(f2(cum[1])) },
    { what: 'Cum 3', value: cum[2], shown: Number(f2(cum[2])) },
    { what: 'Cum 4', value: cum[3], shown: Number(f2(cum[3])) },
    { what: 'Cum 5', value: cum[4], shown: Number(f2(cum[4])) },
    { what: 'Cum 6', value: cum[5], shown: Number(f2(cum[5])) },
    { what: 'Month 2 term', value: 28 * 0.90 / 1.008, shown: Number(f2(28 * 0.90 / 1.008)) },
    { what: 'Month 3 term', value: 28 * (0.90 / 1.008) ** 2, shown: Number(f2(28 * (0.90 / 1.008) ** 2)) },
    { what: 'Payback social', value: pb(120), shown: 6 },
    { what: 'Payback month reached', value: cum[pb(120) - 1], shown: Number(f2(cum[pb(120) - 1])) },
    { what: 'Glenmarra CLV', value: gClv, shown: Number(f2(gClv)) },
    { what: 'Ratio social', value: ratio(120), shown: Number(ratio(120).toFixed(2)) },
    { what: 'Ratio search', value: ratio(70), shown: Number(ratio(70).toFixed(2)) },
    { what: 'Social below 2.4', value: Number(ratio(120) < 2.4), shown: 1 },
    { what: 'Social weakest channel', value: Number(ratio(120) < ratio(70) && ratio(120) < ratio(30) && ratio(120) < ratio(paid)), shown: 1 },
    { what: 'Table referral simple', value: Math.ceil(30 / 28), shown: 2 },
    { what: 'Table search simple', value: Math.ceil(70 / 28), shown: 3 },
    { what: 'Table social simple', value: Math.ceil(120 / 28), shown: 5 },
    { what: 'Table paid simple', value: Math.ceil(paid / 28), shown: 3 },
    { what: 'Table referral payback', value: pb(30), shown: 2 },
    { what: 'Table search payback', value: pb(70), shown: 3 },
    { what: 'Table paid payback', value: pb(paid), shown: 3 },
    { what: 'Table referral ratio', value: ratio(30), shown: Number(ratio(30).toFixed(1)), tol: 0.05 },
    { what: 'Table search ratio', value: ratio(70), shown: Number(ratio(70).toFixed(1)), tol: 0.05 },
    { what: 'Table social ratio', value: ratio(120), shown: Number(ratio(120).toFixed(1)), tol: 0.05 },
    { what: 'Table paid ratio', value: ratio(paid), shown: Number(ratio(paid).toFixed(1)), tol: 0.05 },
    { what: 'Payback at 80%', value: pbR(120, 0.8), shown: 10 },
    { what: 'Payback at 78%', value: pbR(120, 0.78), shown: 14 },
    { what: 'Never at 75%', value: Number(pbR(120, 0.75) === Infinity), shown: 1 },
    { what: 'CLV at 75%', value: 28 * 1.008 / (1.008 - 0.75), shown: Number(f2(28 * 1.008 / 0.258)) },
    { what: '0.258', value: 1.008 - 0.75, shown: 0.258, tol: 1e-9 },
    { what: 'Ratio at 80%', value: CU.clvConstant({ m: 28, r: 0.8, d: D_M }).value / 120, shown: 1.13 },
    { what: 'Skok 3', value: 3, shown: 3 },
    { what: 'Skok 12 months', value: 12, shown: 12 },
    // Lantern campaign
    { what: 'Spring 2027 joiners', value: spring27, shown: 765 },
    { what: 'Campaign cost', value: campCost, shown: 2900 },
    { what: 'Blended campaign CAC', value: cacBlend, shown: 2.9 },
    { what: 'Extra members', value: extra, shown: 235 },
    { what: 'Incremental CAC', value: cacInc, shown: 12.34 },
    { what: 'More than four times', value: cacInc / cacBlend, shown: 4.26, tol: 0.01 },
    { what: 'Over four', value: Number(cacInc / cacBlend > 4), shown: 1 },
    { what: 'Without drinks', value: CAMP.ads / extra, shown: 7.66 },
    { what: 'Free drinks more than a third of cost', value: Number(CAMP.drink * CAMP.expected / campCost > 1 / 3), shown: 1 },
    { what: 'Member value', value: memberValue, shown: Number(f2(memberValue)) },
    { what: 'Member value (whole dollars)', value: memberValue, shown: Number(memberValue.toFixed(0)), tol: 0.5 },
    { what: 'Ratio incremental', value: ratioInc, shown: Number(ratioInc.toFixed(2)) },
    { what: 'Ratio incremental (1 dp)', value: ratioInc, shown: Number(ratioInc.toFixed(1)), tol: 0.05 },
    { what: 'Ratio half', value: ratioHalf, shown: Number(ratioHalf.toFixed(2)) },
    { what: 'Break-even share', value: breakEvenShare * 100, shown: Number((breakEvenShare * 100).toFixed(0)), tol: 0.5 },
    { what: 'Well under half', value: Number(breakEvenShare < 0.45), shown: 1 },
    { what: 'CAC with 150 extra', value: campCost / 150, shown: Number(f2(campCost / 150)) },
    { what: 'Blended covered on join visit (March and August)', value: Number(ad(curves[0]) && ad(curves[5])), shown: 1 },
    { what: 'Blended covered in month 0 by every cohort', value: Number(curves.every(ad)), shown: 1 },
    { what: 'March crosses incremental in month 2', value: crossAt(curves[0], cacInc), shown: 2 },
    { what: 'August crosses in month 1', value: crossAt(curves[5], cacInc), shown: 1 },
    { what: 'March cum month 1', value: mar.cum[1], shown: Number(f2(mar.cum[1])) },
    { what: 'March cum month 2', value: mar.cum[2], shown: Number(f2(mar.cum[2])) },
    { what: 'Every cohort Mar–Oct crosses in month 1 or 2', value: Number(crossJoinMonth.length === 8 && crossJoinMonth.every((k) => k === 1 || k === 2)), shown: 1 },
    { what: 'November at month 1', value: curves[8].cum[1], shown: Number(f2(curves[8].cum[1])) },
    { what: 'November just short', value: Number(curves[8].cum[1] < cacInc && curves[8].cum[1] > cacInc - 0.2 && curves[8].label === '2027-11'), shown: 1 },
    { what: 'Min cross month', value: Math.min(...crossJoinMonth), shown: 1 },
    { what: 'Max cross month', value: Math.max(...crossJoinMonth), shown: 2 },
    { what: 'Covered share', value: covered * 100, shown: Number((covered * 100).toFixed(1)), tol: 0.05 },
    { what: 'Within three months (March cohort crosses by month 2)', value: Number(crossAt(curves[0], cacInc) <= 2), shown: 1 },
    { what: 'Figure: March month 0', value: curves[0].cum[0], shown: Number(f2(curves[0].cum[0])) },
    { what: 'Figure: March month 9', value: curves[0].cum[9], shown: Number(f2(curves[0].cum[9])) },
    { what: 'Figure: August month 0', value: curves[5].cum[0], shown: Number(f2(curves[5].cum[0])) },
    { what: 'Figure: August month 4', value: curves[5].cum[4], shown: Number(f2(curves[5].cum[4])) },
    { what: 'August starts higher than March', value: Number(curves[5].cum[0] > curves[0].cum[0]), shown: 1 },
    { what: 'August is the sixth cohort', value: Number(curves[5].label === '2027-08'), shown: 1 },
    { what: 'Figure fits under $30', value: Number(Math.max(...curves[0].cum, ...curves[5].cum) < 30), shown: 1 },
    { what: 'Members', value: MEMBER_LIST.length, shown: 2584 },
    { what: 'Drinks to baseline', value: spring27 * CAMP.drink, shown: 841.5 },
    { what: 'All drinks', value: CAMP.drink * CAMP.expected, shown: 1100 },
  ],
};
