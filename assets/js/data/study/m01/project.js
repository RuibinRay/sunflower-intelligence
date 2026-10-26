// project.js — M01 applied project: Lantern's marketing foundations for 2027 (its catering business).
// Every fact comes from case.js; every number is computed here and checked by `verify`.
import { BUSINESS, CLIENT_INTERVIEWS as I, COMPETITOR as R, HARBOR_TECH as H, OUTLOOK_2027 as O, GOALS as G, DERIVED as D } from './case.js?v=20';

const c = BUSINESS.catering;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dollars = (x) => `$${Math.round(x).toLocaleString('en-US')}`;
const perClient = D.annualRevenuePerClient;                           // 4,920
const d = 0.10;                                                        // Lantern's discount rate for this project
const m = D.annualMarginPerClient;                                     // 2,214
const clv = m / (1 + d - c.retention);                                 // 4,518.37
const clvToCost = clv / G.costToWinClient;                             // 7.5
const retained = c.clients * c.retention;                              // 10.98
const clientsNeeded = D.cateringTarget / D.annualRevenuePerClient;     // 22.5
const newNeeded = clientsNeeded - retained;                            // 11.52 → 12
const premium = D.revenuePerHeadGap;                                   // 20 %

const FACTS = {
  table: {
    caption: 'Lantern’s catering business in 2026 (fictional)',
    head: ['Item', 'Figure'],
    rows: [
      ['Corporate catering clients', `${c.clients}`],
      ['Events a client books a year', `about ${c.eventsPerClientYear}`],
      ['Revenue per event', `$${c.revenuePerEvent}`],
      ['Contribution margin ratio on catering', `${c.contributionMargin * 100}% of revenue`],
      ['Clients expected to stay from one year to the next (Ana’s estimate)', `${c.retention * 100}%`],
      ['Lantern’s price per head', `$${c.pricePerHead.toFixed(2)}`],
      ['Brewline Catering’s price per head', `$${R.pricePerHead.toFixed(2)}`],
      ['Cost to win a new client (tastings and Ana’s time)', `$${G.costToWinClient}`],
    ],
    align: ['l', 'r'],
  },
};
const num = (id, prompt, answer, check, tol, solution, wrong, unit = '$', places = 2, kind = 'numerical') =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });

export default {
  title: 'Lantern’s marketing foundations for 2027',
  brief: [
    { case: `It is December 2026. Lantern Coffee’s catering for offices and events has grown to ${c.clients} corporate clients since March, and Ana Lim wants it to be bringing in a quarter more revenue a year by the end of 2027. A larger rival, ${R.name}, has been winning bids with self-serve urns and pod machines at a lower price. Ana has interviewed ${I.interviewed} of her clients and asked you to help her build the foundations of a marketing plan: who buys and how, what a client is worth, where Lantern stands, what to aim for and how to compete. Lantern, its clients, Brewline and every figure are fictional.` },
    FACTS,
    { p: `In the interviews, clients gave several reasons each for choosing Lantern: coffee quality (${I.reasons['Coffee quality']} of ${I.interviewed}), reliability on the day (${I.reasons['Reliability on the day']}), the baristas’ professionalism (${I.reasons['Baristas’ professionalism']}), flexible menus (${I.reasons['Flexible menus']}) and price (${I.reasons.Price}). Lantern lost ${I.lostBids} bids in 2026, all to Brewline on price.` },
    { p: `Ana is the only person at Lantern who sells to corporate clients. Looking ahead to 2027, two new office buildings with about ${O.newOfficeDesks.toLocaleString('en-US')} desks open in Lantern’s district, and Brewline is adding a second van to serve it. ${O.staffExperienceClients[0].toUpperCase() + O.staffExperienceClients.slice(1)} of Lantern’s clients besides Harbor Tech have told Ana they are acting on staff engagement surveys.` },
    { p: `Harbor Tech, a ${H.employees}-person software firm and one of Lantern’s first clients, shows how a corporate client buys. Hana Hallett, the office manager, finds suppliers, books events and signs orders up to $2,000. Tom Okoye, the finance director, approves any supplier contract over $2,000 and sets the budget. Lena Brooks, the head of people, raised the idea of better coffee at staff events after an engagement survey. About ${H.employees} staff drink the coffee and fill in the feedback form. Marco Diaz, the reception lead, decides which sales calls and samples reach Hana.` },
  ],
  deliverables: [
    'A map of Harbor Tech’s buying centre and the buying situation for each kind of sale.',
    'A client’s annual margin and lifetime value, compared with the cost of winning one.',
    'A SWOT for Lantern’s catering built from the facts.',
    'A 2027 objective with the number of new clients it needs.',
    'A recommended competitive strategy against Brewline, in about 200–300 words.',
  ],
  stages: [
    {
      id: 'buyers', title: 'Who buys, and how',
      html: '<p>Corporate catering is a business-to-business sale: several people at the client take part, each in a different role. Start by mapping them.</p>',
      items: [
        { id: 'm01-pj-1', type: 'classify', kind: 'conceptual',
          prompt: 'Which buying-centre role does each person at Harbor Tech mainly play?',
          items: ['Lena Brooks, who raised the idea after the staff survey', 'The staff who drink the coffee', 'Tom Okoye, who approves contracts over $2,000', 'Hana Hallett, who finds suppliers and places orders', 'Marco Diaz, who decides which sales calls reach Hana'],
          categories: ['Initiator', 'User', 'Decider', 'Buyer', 'Gatekeeper'],
          answer: [0, 1, 2, 3, 4],
          feedback: { 0: 'Lena started the process by asking for better coffee: she initiated it. She also influences the choice, but her distinctive role here is starting the purchase.', 3: 'Hana handles the purchase itself: finding suppliers and placing orders is the buyer’s role. She cannot approve a large contract.', 4: 'Controlling which information and salespeople reach the buyer is the gatekeeper’s role.' },
          solution: 'Lena initiated the purchase; the staff are the users; Tom decides on contracts over $2,000; Hana is the buyer; Marco is the gatekeeper. Lena and the staff (through the feedback form) also influence the choice: one person can hold more than one role.' },
        { id: 'm01-pj-2', type: 'mc', kind: 'applied',
          prompt: `Lantern wants Harbor Tech to sign an annual contract for six events at $${c.revenuePerEvent} each. Whose approval does the contract need, and why?`,
          options: [
            `Tom Okoye’s: six events come to $${(6 * c.revenuePerEvent).toLocaleString('en-US')}, above Hana’s $2,000 limit`,
            'Hana Hallett’s alone, because she has always booked Lantern’s events',
            'Lena Brooks’s, because the coffee is for the staff events she asked for',
          ],
          answer: 0,
          feedback: { 1: `Hana can sign orders up to $2,000. Six events at $${c.revenuePerEvent} come to $${(6 * c.revenuePerEvent).toLocaleString('en-US')}.`, 2: 'Lena started the idea and influences the choice, but she does not approve contracts.' },
          solution: `6 × $${c.revenuePerEvent} = $${(6 * c.revenuePerEvent).toLocaleString('en-US')}, more than Hana’s limit, so the finance director decides. Lantern’s proposal should therefore speak to Tom’s concerns (cost, reliability, terms) as well as to Hana and Lena.` },
        { id: 'm01-pj-3', type: 'classify', kind: 'conceptual',
          prompt: 'Which buying situation is each sale?',
          items: ['Harbor Tech books another event on the same terms as before', 'Harbor Tech moves from booking events one by one to an annual contract with a new menu', 'A firm that has never hired a coffee caterer asks Lantern for a proposal'],
          categories: ['Straight rebuy', 'Modified rebuy', 'New task'],
          answer: [0, 1, 2],
          solution: 'Repeating an order unchanged is a straight rebuy; changing the terms or the product is a modified rebuy; buying something for the first time is a new task, which involves the most people and the most information search.' },
      ],
    },
    {
      id: 'value', title: 'What a client is worth',
      html: '<p>Winning a client costs Lantern tastings and Ana’s time. Is it worth it? Work out what a client brings in, using the figures in the brief. For lifetime value, use the course’s assumptions: each year’s margin arrives at the end of the year; a new client is certain to be there for its first year and then stays from one year to the next with probability 0.61, the same every year; the margin doesn’t change; and Lantern discounts future money at 10% a year. Then the lifetime value is the annual margin ÷ (1 + discount rate − retention rate).</p>',
      items: [
        num('m01-pj-4', 'What contribution margin does a typical client bring in a year?',
          m, () => 6 * 820 * 0.45, 0.5, `6 events × $820 = $4,920 of revenue; 45% of it is ${money(m)}.`,
          [{ value: 4920, say: 'That is revenue. A client is worth the margin it leaves after the costs of serving it.' }, { value: 369, say: 'That is the margin on one event. A client books about six a year.' }], '$', 2),
        num('m01-pj-5', 'What is a typical client’s lifetime value? Give dollars and cents.',
          Math.round(clv * 100) / 100, () => 2214 / (1 + 0.10 - 0.61), 0.5,
          `${money(m)} ÷ (1 + 0.10 − 0.61) = ${money(m)} ÷ 0.49 ≈ ${money(clv)}. The formula adds up each year’s margin, weighted by the chance the client is still there and discounted for time.`,
          [{ value: 5676.92, say: 'That leaves out discounting: money in later years is worth less today.' }, { value: 10040.82, say: 'That uses revenue instead of margin.' }, { value: 3629.51, say: 'That divides by 0.61. The denominator is 1 + discount rate − retention rate.' }], '$', 2),
        num('m01-pj-6', `How many times the $${G.costToWinClient} cost of winning a client is that lifetime value? One decimal place.`,
          Math.round(clvToCost * 10) / 10, () => 2214 / 0.49 / 600, 0.1,
          `${money(clv)} ÷ $600 ≈ ${clvToCost.toFixed(1)}. Winning a client pays back several times over, so spending more to win the right clients could make sense.`, null, '', 1),
        num('m01-pj-7', 'By what percentage is Lantern’s price per head above Brewline’s? Whole percent.',
          Math.round(premium), () => (9 / 7.5 - 1) * 100, 0.5,
          `$9.00 ÷ $7.50 − 1 = 20%.`, [{ value: 17, say: 'That compares the $1.50 gap with Lantern’s price. The premium is measured against Brewline’s price.' }, { value: 1.5, say: 'That is the gap in dollars, not as a percentage.' }], '%', 0),
      ],
    },
    {
      id: 'situation', title: 'Where Lantern stands',
      html: '<p>Sort the facts into a SWOT. Strengths and weaknesses are inside Lantern and within its control; opportunities and threats are outside it.</p>',
      items: [
        { id: 'm01-pj-8', type: 'classify', kind: 'applied',
          prompt: 'Place each fact in Lantern’s SWOT.',
          items: [
            `${I.reasons['Coffee quality']} of ${I.interviewed} interviewed clients named coffee quality as a reason they chose Lantern`,
            'Ana is the only person at Lantern who sells to corporate clients',
            `Two new office buildings with about ${O.newOfficeDesks.toLocaleString('en-US')} desks open in Lantern’s district in 2027`,
            `${R.name} is adding a second van to serve Lantern’s district`,
            `${I.reasons['Reliability on the day']} of ${I.interviewed} clients named reliability on the day`,
            'Several of Lantern’s clients, like Harbor Tech, are acting on staff engagement surveys to improve staff experience',
          ],
          categories: ['Strength', 'Weakness', 'Opportunity', 'Threat'],
          answer: [0, 1, 2, 3, 0, 2],
          feedback: { 1: 'Depending on one salesperson is an internal limit on growth: a weakness Lantern can fix.', 3: 'A competitor expanding is outside Lantern’s control: a threat.', 5: 'A trend among buyers is external: an opportunity Lantern can position itself for.' },
          solution: 'Quality and reliability are strengths (internal, valued by clients). Relying on Ana alone to sell is a weakness. New offices and clients’ interest in staff experience are opportunities. Brewline’s expansion is a threat. A SWOT is only a starting point: the plan must say what to do about each item.' },
        { id: 'm01-pj-9', type: 'mc', kind: 'applied',
          prompt: 'The interviews reached only Lantern’s current clients, and Lantern lost ${I.lostBids} bids to Brewline on price. Which further evidence would best show how much price matters to the offices Lantern wants to win?',
          options: [
            'Short calls with the five firms that chose Brewline, asking what decided it and what would have changed their mind',
            'A second round of interviews with the same 12 clients, asking each in more detail how much price mattered to them when they chose',
            'A count of how often each current client has booked since March and how much each spends, to see which clients are most sensitive to price',
          ],
          answer: 0,
          feedback: { 1: 'The 12 clients already chose Lantern, so they are the people for whom price mattered least. Asking them more questions cannot reveal the view of those who went elsewhere.', 2: 'Booking frequency says how much current clients use Lantern, not why other firms chose a cheaper rival.' },
          solution: 'Current clients are a biased sample for this question: they chose Lantern despite its price. The firms that chose Brewline are the ones whose reasons Lantern does not yet know. Even five short conversations would show whether price was the whole story or whether something else (menus, booking, a missing service) tipped the decision.' },
      ],
    },
    {
      id: 'objectives', title: 'Set the 2027 objective',
      html: `<p>Ana’s business goal is for catering to be bringing in revenue at a yearly rate 25% higher than today’s pace of ${c.clients} clients × ${c.eventsPerClientYear} events × $${c.revenuePerEvent}, by 31 December 2027. Read the goal as that yearly rate at the end of 2027, not as revenue received within 2027: a client signed during the year brings in less than a full year’s revenue in 2027 itself, as the objectives lesson shows. Not every client stays: on Ana’s estimate, ${c.retention * 100}% of today’s clients will still be clients at the end of 2027. Work out what the goal means for winning new clients.</p>`,
      items: [
        num('m01-pj-10', 'What yearly rate of catering revenue must Lantern reach by the end of 2027?',
          D.cateringTarget, () => 18 * 6 * 820 * 1.25, 1, `${c.clients} × ${c.eventsPerClientYear} × $${c.revenuePerEvent} = ${dollars(D.cateringRevenue)}; × 1.25 = ${dollars(D.cateringTarget)}.`, null, '$', 0),
        num('m01-pj-11', `If each client brings in $${perClient.toLocaleString('en-US')} a year, how many new clients must Lantern win during 2027 (whole clients, rounding up)?`,
          Math.ceil(newNeeded), () => Math.ceil(18 * 6 * 820 * 1.25 / 4920 - 18 * 0.61), 0.5,
          `The goal needs ${clientsNeeded.toFixed(1)} clients’ worth of revenue (${money(D.cateringTarget)} ÷ $4,920). About ${retained.toFixed(2)} of the 18 stay (61%), so Lantern needs ${newNeeded.toFixed(2)} more: 12 new clients.`,
          [{ value: 5, say: 'That is 25% more clients (4.5), as if every current client stayed. 39% of them are expected to leave.' }, { value: 23, say: 'That is the total number of clients needed. Some of them are already clients who stay.' }, { value: 11, say: 'Rounding down leaves Lantern short of the goal: 11.52 means it needs 12.' }], 'clients', 0, 'applied'),
        { id: 'm01-pj-12', type: 'mc', kind: 'applied',
          prompt: 'Which is the best marketing objective for 2027?',
          options: [
            'Win 12 new corporate catering clients and keep at least 61% of current ones by 31 December 2027',
            'Become the best-known coffee caterer in Harbour City by building awareness through social media in 2027',
            'Grow catering by 25% in 2027 by marketing harder to every office in the area that buys coffee',
          ],
          answer: 0,
          feedback: { 1: 'Awareness may help, but “best-known” has no measure, and it is not tied to the revenue goal.', 2: '25% is the business goal; the marketing objective should say what marketing must achieve to deliver it. “Marketing harder to every office” is a tactic, and an unfocused one.' },
          solution: 'A marketing objective translates the business goal into what marketing must achieve, specifically and measurably, with a date: 12 new clients and a retention rate. It also shows that keeping clients is worth as much effort as winning them. Its date fits the goal: 12 is the number of new clients Lantern must have by 31 December to be at the target rate. If Ana wanted the extra revenue received within 2027, clients signed through the year would each bring in less than a full year, and she would need more of them; the objective must say which it means.' },
      ],
    },
    {
      id: 'strategy', title: 'Choose how to compete',
      html: '<p>Brewline is bigger and cheaper. Lantern is smaller, dearer and, by its clients’ account, better. Recommend how Lantern should compete in 2027.</p>',
      items: [
        { id: 'm01-pj-13', type: 'mc', kind: 'applied',
          prompt: 'Which generic strategy fits Lantern’s position best?',
          options: [
            'Focused differentiation: barista catering for firms that care about staff experience, at a premium',
            'Cost leadership: undercut Brewline’s $7.50 a head by switching from baristas to urns and pod machines',
            'A bit of both: cut the price to $8.25 a head and keep the baristas only for larger clients',
          ],
          answer: 0,
          feedback: { 1: 'Lantern has no evidence it can serve a head for less than Brewline, whose urns and pods need no baristas, and switching to them would remove what clients say they value.', 2: 'Splitting the difference risks being “stuck in the middle”: not cheap enough for price buyers and with thinner margins to pay for the service that wins the others.' },
          solution: 'Lantern’s strengths (quality, reliability, baristas) are what its clients value, and nothing suggests it could serve a head more cheaply than a larger rival without baristas. A focused differentiation strategy aims at the firms that value staff experience and are willing to pay for it.' },
        { id: 'm01-pj-14', type: 'short', kind: 'applied',
          prompt: 'Write Ana a recommendation (about 200–300 words): which clients to target, how Lantern should compete against Brewline, the 2027 objective, and what she should watch.',
          rubric: [
            'Names a target group of clients and says why they fit Lantern’s strengths.',
            'Recommends a competitive strategy and explains why the alternatives fit worse.',
            'Uses the client’s lifetime value against the cost of winning one to justify spending on acquisition.',
            'States the 2027 objective in numbers (new clients and retention) and that it is the yearly rate to reach by the end of 2027.',
            'Uses the buying-centre map: who to persuade and with what.',
            'Notes a risk or a measure to watch (for example lost bids, retention, or the SWOT’s weakness).',
            'Acknowledges the limits of the evidence (interviews only of current clients; lifetime value rests on an estimated retention rate and an assumed discount rate).',
          ],
          model: `Compete on quality, not price. Your clients chose Lantern for its coffee, reliability and baristas; only ${I.reasons.Price} of ${I.interviewed} mentioned price. They are the clients price didn’t put off, though: the ${I.lostBids} bids lost to Brewline show that price decides for some offices. Brewline is bigger and charges $${R.pricePerHead.toFixed(2)} a head to your $${c.pricePerHead.toFixed(2)}, so you are ${Math.round(premium)}% dearer, and a small caterer is unlikely to win a price war. Aim at firms that care about staff experience and will pay for it: technology and professional-services firms, the new offices opening in 2027 and clients like Harbor Tech that are acting on engagement surveys.<br><br>A client is worth winning. A typical client brings about ${dollars(m)} of margin a year and, allowing for the ${Math.round((1 - c.retention) * 100)}% who leave each year and discounting at 10%, about ${dollars(clv)} over its life: ${clvToCost.toFixed(1)} times the $${G.costToWinClient} it costs to win one. So it is worth spending more on tastings for well-chosen prospects. The figure rests on your retention estimate, so check it as the year goes on.<br><br>To be bringing in 25% more a year by the end of 2027, you need to win about ${Math.ceil(newNeeded)} new clients during the year and keep at least ${c.retention * 100}% of the current ones. Keeping clients matters as much as winning them: every point of retention you add reduces the number you must win.<br><br>Sell to the whole buying centre. People leaders start these purchases, office managers run them and finance directors approve anything over their limit, so propose annual contracts with a clear case for each: staff experience for the initiator, easy booking for the buyer, reliable cost for the decider.<br><br>Watch two risks: Brewline’s new van in your district, and your reliance on yourself as the only salesperson. Track lost bids, and why, each quarter.`,
          solution: 'Compare your answer with the model and the rubric. Other targets, tactics and measures can earn full marks if they follow from the evidence and say what to measure.' },
      ],
    },
  ],
  rubric: [
    'Every figure is correct and labelled (revenue vs margin; annual vs lifetime).',
    'Buying-centre roles and buying situations are named correctly and used in the recommendation.',
    'The SWOT placement keeps internal and external factors apart, and the recommendation uses at least one strength and one threat from it.',
    'Fictional facts are presented as the case, and the recommendation says what to measure.',
  ],
  verify() {
    return [
      ['annual margin', m, 2214, 1e-9], ['CLV', clv, 4518.3673, 0.0001], ['CLV / cost', clvToCost, 7.5306, 0.0001],
      ['retained', retained, 10.98, 1e-9], ['clients needed', clientsNeeded, 22.5, 1e-9], ['new needed', newNeeded, 11.52, 1e-9],
      ['premium', premium, 20, 1e-9], ['target', D.cateringTarget, 110700, 1e-9], ['CLV no discount', m / (1 - c.retention), 5676.92, 0.005],
      ['CLV on revenue', D.annualRevenuePerClient / 0.49, 10040.82, 0.005], ['CLV ÷ 0.61', m / 0.61, 3629.51, 0.005],
      ['revenue per client', perClient, 4920, 1e-9], ['current revenue', D.cateringRevenue, 88560, 1e-9], ['new desks', O.newOfficeDesks, 1200, 0],
      ['lost bids', I.lostBids, 5, 0], ['quality mentions', I.reasons['Coffee quality'], 9, 0], ['reliability mentions', I.reasons['Reliability on the day'], 7, 0],
      ['price mentions', I.reasons.Price, 2, 0], ['salespeople', c.salespeople, 1, 0], ['new clients (rounded up)', Math.ceil(newNeeded), 12, 0],
    ];
  },
};
