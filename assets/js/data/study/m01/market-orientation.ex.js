// market-orientation.ex.js — M01 · Market orientation: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Lantern figures come from ./case.js (fictional); every number is
// recomputed by `check` (see ../AUTHORING.md). Every other business and figure is fictional.
import { CLIENT_INTERVIEWS } from './case.js?v=18';

const clv = (m, r, d) => m / (1 + d - r);
const money = (v, dp = 0) => {
  const a = Math.abs(v);
  const s = a.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return `${v < 0 && Number(a.toFixed(dp)) !== 0 ? '−' : ''}$${s}`;
};
const ORIENT = ['Production', 'Product', 'Selling', 'Marketing', 'Societal marketing'];

export const widgets = {
  'mo-reasons': {
    type: 'chart',
    kind: 'bar',
    title: 'Why Lantern’s catering clients chose it: 12 clients interviewed, November 2026 (fictional)',
    x: { label: 'Reason given', values: Object.keys(CLIENT_INTERVIEWS.reasons) },
    series: [{ name: 'Clients naming the reason', values: Object.values(CLIENT_INTERVIEWS.reasons) }],
    y: { label: 'Clients (of 12 interviewed)' },
    note: 'Clients could give several reasons, so the bars add up to 28 mentions from 12 clients. Read each bar against 12: quality 9 of 12 (75%), price 2 of 12 (17%). Only clients who chose Lantern were asked; the 5 organisations that chose Brewline Catering in 2026 are not in this chart.',
  },
  'mo-respond': {
    type: 'formula',
    title: 'Does responding to client feedback pay? (Stonebridge Energy Services)',
    intro: 'A response to what leaving clients said (a faster repair guarantee) costs money every year and, if it works, raises retention. Lifetime value uses the previous lesson’s formula, m ÷ (1 + d − r).',
    inputs: [
      { id: 'clients', label: 'Clients', min: 20, max: 400, step: 10, value: 120, fmt: 'int', unit: 'clients' },
      { id: 'margin', label: 'Margin per client per year', min: 1000, max: 15000, step: 250, value: 6000, fmt: 'money' },
      { id: 'rBefore', label: 'Retention today', min: 50, max: 95, step: 0.5, value: 80, fmt: 'pct' },
      { id: 'rAfter', label: 'Retention with the response', min: 50, max: 98, step: 0.5, value: 85.5, fmt: 'pct' },
      { id: 'cost', label: 'Cost of the response per year', min: 0, max: 300000, step: 5000, value: 90000, fmt: 'money' },
      { id: 'discount', label: 'Discount rate', min: 0, max: 20, step: 1, value: 10, fmt: 'pct' },
    ],
    compute: (v) => {
      const r0 = v.rBefore / 100;
      const r1 = v.rAfter / 100;
      const d = v.discount / 100;
      const per = v.cost / v.clients;
      const m1 = v.margin - per;
      if (m1 <= 0) return { error: `The response costs ${money(per)} per client a year, as much as the ${money(v.margin)} margin or more, so it can’t pay on these figures.` };
      const before = clv(v.margin, r0, d);
      const after = clv(m1, r1, d);
      const change = after - before;
      const need = 1 + d - m1 / before;
      const grid = Array.from({ length: 13 }, (_, k) => 50 + 4 * k);
      return {
        headline: { label: 'Change in lifetime value per client', value: money(change, 2) },
        rows: [
          ['Lifetime value per client today', money(before, 2)],
          ['Lifetime value per client with the response', money(after, 2)],
          ['Change across all clients', money(change * v.clients)],
          ['Cost of the response per client per year', money(per, 2)],
          ['Retention needed for the response to break even', need >= 0.995 ? 'above 99.5%: practically out of reach' : `${(need * 100).toFixed(2)}%`],
        ],
        note: change >= 0
          ? `On these assumptions the response pays: it needs retention of at least ${(need * 100).toFixed(2)}%, and you have assumed ${v.rAfter}%. The result rests on that assumption, so test it with a pilot before rolling the response out.`
          : `On these assumptions the response doesn’t pay: retention would need to reach ${need >= 0.995 ? 'more than 99.5%' : `${(need * 100).toFixed(2)}%`} for the response to break even. Look for a cheaper response, or one that keeps more clients.`,
        chart: {
          kind: 'line',
          x: { label: 'Retention with the response (%)', values: grid },
          series: [
            { name: 'Lifetime value with the response ($)', values: grid.map((r) => Math.round(clv(m1, r / 100, d))) },
            { name: 'Lifetime value today ($)', values: grid.map(() => Math.round(before)) },
          ],
          y: { label: 'Dollars per client' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-mo-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which orientation does each fictional business’s behaviour reflect?',
    items: [
      'A bakery automates its ovens to cut the cost of each loaf and sells to every supermarket that will stock it',
      'A bike maker builds an ever-lighter frame without asking riders whether weight is what they care about',
      'A gym with empty off-peak slots pays staff a bonus for every membership they sign, whatever the member needs',
      'A bank finds that small-business owners can’t visit branches in office hours and opens evening video appointments',
      'A snack maker cuts the sugar in its children’s range and stops advertising it during children’s television',
      'A furniture retailer asks customers why they abandon online orders and simplifies booking a delivery',
    ],
    categories: ORIENT,
    answer: [0, 1, 2, 3, 4, 3],
    hints: [
      'Ask what each plan starts from: the operation’s cost, the product’s features, stock or capacity to sell, customers’ needs, or customers’ needs and society’s interests.',
      'The snack maker still serves its customers, but it also weighs children’s health: that is more than the marketing concept alone.',
    ],
    feedback: {
      1: 'Improving the product without asking what riders value is the product concept, and a route to myopia.',
      2: 'Paying for signatures “whatever the member needs” is selling what the gym has (capacity), not meeting needs: the selling concept.',
      4: 'Less sugar and no advertising to children protect a vulnerable group’s long-term interests: the societal marketing concept.',
    },
    solution: 'Bakery: production (cost and availability). Bike maker: product (features first). Gym: selling (push capacity regardless of need). Bank and furniture retailer: marketing (start from what customers said). Snack maker: societal marketing (customers’ wants weighed against children’s health).',
  },
  {
    id: 'm01-mo-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional city hotel asked 40 departing guests what they liked most; guests could name several things. Location was named 26 times, breakfast 18, price 12 and staff 22.',
    solution: 'Staff: 22 ÷ 40 × 100 = 55% of guests. All mentions: 26 + 18 + 12 + 22 = 78, so 78 ÷ 40 = 1.95 reasons per guest. Because guests could name several things, the shares add to 195%, not 100%: each is a share of guests, not a slice of one whole.',
    steps: [
      { id: 'm01-mo-g2-s1', type: 'num',
        prompt: 'What percentage of the guests named the staff?',
        answer: 55, check: () => 22 / 40 * 100, unit: '%', places: 0, tol: 0.5,
        hints: ['Divide the number of guests who named the staff by the number of guests asked.', '22 ÷ 40 × 100.'],
        wrong: [{ value: 28.2, say: 'That is the staff’s share of all 78 mentions. The question asks about guests: divide by the 40 guests.' }] },
      { id: 'm01-mo-g2-s2', type: 'num',
        prompt: 'How many things did each guest name, on average? Give two decimal places.',
        answer: 1.95, check: () => (26 + 18 + 12 + 22) / 40, unit: 'reasons per guest', places: 2, tol: 0.005,
        hints: ['Add all the mentions, then divide by the number of guests.', '(26 + 18 + 12 + 22) ÷ 40.'],
        wrong: [
          { value: 19.5, say: 'That divides the 78 mentions by the 4 reasons. Divide by the 40 guests instead.' },
          { value: 0.51, say: 'That is guests ÷ mentions. Divide the mentions by the guests.' },
        ] },
      { id: 'm01-mo-g2-s3', type: 'mc',
        prompt: 'The four shares add up to 195%. What does that tell you?',
        options: [
          'Guests could name several things, so each share is of guests, not a slice of one whole.',
          'The survey contains an arithmetic error, because a set of percentages must always add up to 100%.',
          'More guests answered than the 40 the hotel says it asked.',
          'Guests exaggerated how much they liked the hotel.',
        ],
        answer: 0,
        hints: ['How many things did each guest name on average?', 'Shares add to 100% only when each respondent gives exactly one answer.'],
        feedback: {
          1: 'There is no error: with several answers allowed, shares of respondents can add to more than 100%.',
          2: 'The total is above 100% because each guest gave about two answers, not because more guests answered.',
          3: 'The total says nothing about exaggeration; it reflects how many answers each guest gave.',
        } },
    ],
  },
  {
    id: 'm01-mo-g3', type: 'mc', kind: 'applied',
    prompt: 'At a fictional solar-panel installer, service engineers keep hearing customers say the monitoring app is confusing. They sort out each customer’s problem on site but never pass the complaints on, and the product team plans its next app update around new features. In Kohli and Jaworski’s terms, which activity is failing first?',
    options: [
      'Dissemination: the intelligence exists but doesn’t reach the people who could act on it',
      'Intelligence generation: nobody in the firm is gathering any information from its customers',
      'Responsiveness: the product team heard the complaints and chose to ignore them',
      'Competitor orientation: the firm isn’t watching what rival apps offer',
    ],
    answer: 0,
    hints: ['Is anyone hearing what customers think? Does it reach the product team?', 'Generation, dissemination, responsiveness: find the first link that breaks.'],
    feedback: {
      1: 'The engineers are hearing from customers every week, so intelligence is being generated. It stops with them.',
      2: 'The product team never heard the complaints, so it can’t have ignored them. Its response fails because the intelligence never arrived.',
      3: 'Watching rivals may help, but the firm’s own customers are already telling it what is wrong.',
    },
    why: 'The engineers generate intelligence but it isn’t shared across departments, so the product team responds to the wrong problem.',
    solution: 'Market orientation needs all three activities. Here intelligence is generated (engineers hear complaints) but not disseminated (they don’t pass it on), so the product team can’t respond to it. The fix is a routine for sharing what service staff hear, which is also the inter-functional coordination Narver and Slater describe.',
  },
  {
    id: 'm01-mo-g4', type: 'short', kind: 'applied',
    prompt: 'A fictional café chain’s new takeaway cups are made from 50% recycled paperboard by weight. Their plastic lining means most local recycling collections won’t accept them. The marketing team’s draft says: “Our planet-friendly cups.” Rewrite the claim so that it is consistent with the FTC’s Green Guides, and explain your changes in two or three sentences.',
    hints: ['The Green Guides advise against unqualified general claims and ask for specific, substantiated ones.', 'Say exactly what is true (the recycled content) and don’t imply what isn’t (that the cup can be recycled).'],
    rubric: [
      'Removes the general environmental claim (“planet-friendly”), which can’t be substantiated in every reasonable reading.',
      'States the specific benefit precisely: 50% recycled paperboard by weight.',
      'Doesn’t imply the cup is recyclable, and ideally tells customers how to dispose of it.',
      'Notes that the claim needs evidence (for example, the supplier’s certificate) before it is printed.',
    ],
    model: '“Made with 50% recycled paperboard (by weight). Not accepted by most household recycling collections: please use the cup bins in our cafés.” The general claim “planet-friendly” is removed because customers could read it as recyclable, compostable or low-carbon, and the chain can’t prove all of those. The new claim states one specific, checkable benefit, backed by the supplier’s certificate, and is honest about disposal, which also stops customers contaminating recycling with cups it can’t take.',
  },
];

export const independent = [
  {
    id: 'm01-mo-i1', type: 'multi', kind: 'conceptual',
    prompt: 'Which are Narver and Slater’s three behavioural components of market orientation? Select all that apply.',
    options: [
      'Customer orientation',
      'Competitor orientation',
      'Inter-functional coordination',
      'Long-term focus',
      'Production efficiency',
      'Advertising intensity',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A long-term focus is part of Narver and Slater’s account, but as one of the two decision criteria (with profitability), not one of the three behavioural components.',
      4: 'Efficiency matters to any business, but it belongs to the production concept, not to market orientation.',
      5: 'Advertising is one tool of the marketing mix; it is not a component of market orientation.',
    },
    solution: 'Narver and Slater (1990) named three behavioural components (customer orientation, competitor orientation and inter-functional coordination) and two decision criteria (a long-term focus and profitability).',
  },
  {
    id: 'm01-mo-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional dental practice earns a margin of $400 a year per patient. 75% of patients come back each year, and it discounts at 10% a year. A reminder-and-booking service would cost $20 per patient per year. With the service, what retention rate would the practice need for a patient’s lifetime value to be at least what it is today? Use CLV = m ÷ (1 + d − r) and give a percentage to two decimal places.',
    answer: 76.75, check: () => (1 + 0.10 - (400 - 20) / (400 / (1 + 0.10 - 0.75))) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 75, say: 'That is today’s retention. The service costs $20 a patient, so retention must rise to make up for the lower margin.' },
      { value: 73.25, say: 'You added the $20 to the margin. The service is a cost, so the margin falls to $380.' },
    ],
    solution: 'Today: CLV = 400 ÷ (1 + 0.10 − 0.75) = 400 ÷ 0.35 ≈ $1,142.86. With the service the margin is $380, so we need 380 ÷ (1.10 − r) ≥ 1,142.86, that is 1.10 − r ≤ 0.3325, or r ≥ 0.7675: retention of at least 76.75%. The service pays if it keeps about 1.75 more patients in every 100.',
  },
  {
    id: 'm01-mo-i3', type: 'mc', kind: 'conceptual',
    prompt: 'What did Ronald Fullerton (1988) argue about the usual story of a production era, then a sales era, then a marketing era?',
    options: [
      'That it is a myth: serious marketing existed long before the twentieth century.',
      'That it is accurate for the United States but not for Britain or Germany, which he also studied.',
      'That the eras happened in the reverse order, with marketing first.',
      'That the production era is still going on in most industries.',
    ],
    answer: 0,
    feedback: {
      1: 'Fullerton studied Britain, Germany and the United States and challenged the sequence for all three.',
      2: 'He didn’t reverse the sequence; he argued that the periods it describes hide how developed earlier marketing already was.',
      3: 'His argument was historical: that a production era without serious marketing never existed as described.',
    },
    solution: 'Fullerton argued that the belief in a “Production Era” implies that serious marketing is recent, and that this, like the sales and marketing eras, obscures how extensive earlier marketing was. The five concepts are best read as attitudes that coexist, not as stages.',
  },
  {
    id: 'm01-mo-i4', type: 'classify', kind: 'conceptual',
    prompt: 'Is each practice more typical of a product-centric or a customer-centric organisation?',
    items: [
      'Sales staff earn a bonus on the units they sell this quarter',
      'The business tracks how many customers stay each year, and why the others leave',
      'Managers are responsible for product lines rather than for groups of customers',
      'An adviser recommends a cheaper plan because it fits the customer better',
      'Success is judged by each product’s market share',
      'Teams are organised around kinds of customer, such as small firms and households',
    ],
    categories: ['Product-centric', 'Customer-centric'],
    answer: [0, 1, 0, 1, 0, 1],
    feedback: {
      0: 'A bonus on units sold rewards pushing products, whatever the customer needs: a product-centric measure.',
      3: 'Giving up revenue now to fit the customer better builds the relationship and its lifetime value: customer-centric.',
    },
    solution: 'Product-centric: unit bonuses, product-line managers, product market share. Customer-centric: retention and reasons for leaving, advice that fits the customer even at lower revenue, teams organised by customer group. The measures an organisation rewards usually reveal which it really is.',
  },
  {
    id: 'm01-mo-i5', type: 'mc', kind: 'applied',
    prompt: 'A fictional software company emails a satisfaction survey to its current users every quarter. 90% say they are satisfied, yet its number of customers has fallen for three quarters in a row. What is the most likely flaw in its listening?',
    options: [
      'The survey reaches only people who stayed, not those who left or never signed up.',
      'A 90% satisfaction score is too low for a software company to be healthy in a competitive market.',
      'The survey asks too few questions to measure satisfaction accurately.',
      'Satisfaction can’t be measured with a survey at all.',
    ],
    answer: 0,
    feedback: {
      1: 'A high score among current users is consistent with falling numbers: the dissatisfied may already have gone.',
      2: 'More questions to the same people would still miss the customers who left.',
      3: 'Surveys are a reasonable tool; the problem here is whom it reaches.',
    },
    why: 'The reasons for the fall lie with former and potential customers, whom the survey never asks.',
    solution: 'Current users are, by definition, those the product still suits. The intelligence the company needs (why customers leave, why prospects choose rivals) sits with people the survey doesn’t reach. Exit surveys, lost-deal reviews and research among non-customers fill the gap.',
  },
  {
    id: 'm01-mo-i6', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional retailer wants to print an environmental claim on its shopping bags, and has a supplier’s certificate for the bags’ recycled content. Which claim is most consistent with the FTC’s Green Guides?',
    options: [
      'Made with 80% recycled plastic, by weight',
      'An eco-friendly bag for a greener planet',
      'Planet-positive packaging from a caring brand',
      'Our greenest bag ever: kinder to nature',
    ],
    answer: 0,
    feedback: {
      1: '“Eco-friendly” is the kind of unqualified general claim the Green Guides advise against: it conveys many meanings that can’t all be substantiated.',
      2: '“Planet-positive” is a broad environmental benefit claim with no specific, checkable meaning.',
      3: '“Greenest ever” and “kinder to nature” are vague comparisons that can’t be substantiated as stated.',
    },
    solution: 'The Green Guides advise marketers to avoid unqualified general environmental benefit claims and to limit claims clearly and prominently to a specific benefit, backed by competent and reliable evidence. “80% recycled plastic, by weight”, supported by the supplier’s certificate, does that; the others are general claims.',
  },
];

export const check = [
  {
    id: 'm01-mo-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What is the main difference between the selling concept and the marketing concept?',
    options: [
      'Selling starts from what the business has made; marketing starts from what target customers need.',
      'The selling concept uses advertising; the marketing concept uses no advertising at all.',
      'The selling concept applies to consumer goods; the marketing concept applies only to services.',
      'The selling concept aims at profit; the marketing concept aims at customer satisfaction instead of profit.',
    ],
    answer: 0,
    feedback: {
      1: 'Both may advertise. The difference is the starting point: the product already made, or customers’ needs.',
      2: 'Both concepts apply to goods and services alike.',
      3: 'The marketing concept is a route to the business’s goals, including profit, through satisfying customers; it doesn’t give up profit.',
    },
    solution: 'The selling concept assumes customers won’t buy enough unless persuaded, so it pushes what has been made. The marketing concept holds that a business reaches its goals by finding out what target customers need and satisfying them better than competitors.',
  },
  {
    id: 'm01-mo-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional online grocer asked 35 customers why they shop with it; each could give several reasons, and 50 reasons were given in all. 14 customers named delivery speed. What percentage of the customers asked named delivery speed?',
    answer: 40, check: () => 14 / 35 * 100, unit: '%', places: 0, tol: 0.5,
    wrong: [
      { value: 28, say: 'That is delivery speed’s share of all 50 reasons. The question asks about customers: divide by the 35 customers.' },
      { value: 14, say: 'That is the number of customers. Divide by the 35 asked and multiply by 100.' },
    ],
    solution: 'Share of customers = 14 ÷ 35 × 100 = 40%. As a share of the 50 reasons given it would be 28%, a different and less useful figure, because it depends on how many reasons each customer happened to give.',
  },
  {
    id: 'm01-mo-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Which orientation does each fictional plan reflect?',
    items: [
      'A car-parts maker invests in the biggest, cheapest production line in the region and supplies anyone who orders',
      'A camera maker adds features its engineers admire, assuming buyers will see the improvement',
      'A timeshare company with unsold weeks offers free gifts to anyone who sits through a sales presentation',
      'A university learns that working adults can’t attend daytime classes and moves its programme to evenings and weekends',
      'A clothing brand meets demand for low prices while auditing factory working conditions and publishing the results',
    ],
    categories: ORIENT,
    answer: [0, 1, 2, 3, 4],
    feedback: {
      1: 'Features chosen because engineers admire them, without asking buyers, show the product concept.',
      4: 'Serving customers while protecting the workers who make the clothes adds society’s interests: societal marketing.',
    },
    solution: 'Production (scale and low cost), product (features first), selling (pushing unsold stock), marketing (starting from what learners need) and societal marketing (customers’ wants weighed against workers’ welfare).',
  },
  {
    id: 'm01-mo-k4', type: 'mc', kind: 'applied',
    prompt: 'Online reviews of a fictional city hotel keep mentioning street noise in rooms on the main-road side. Which response is the most market-oriented?',
    options: [
      'Share the reviews with operations, insulate the windows, give light sleepers quiet rooms, then recheck.',
      'Reply to every review with an apology and a discount code for the guest’s next stay, and change nothing else.',
      'Run an advertising campaign that presents the hotel’s main-road location as lively and central.',
      'Remove reviews from the hotel’s own website so that future guests see fewer complaints about noise.',
    ],
    answer: 0,
    feedback: {
      1: 'Apologies and discounts treat each complaint as a one-off. The intelligence (a pattern of complaints) never reaches anyone who could fix the cause.',
      2: 'This is the selling concept: persuading guests to like what the hotel already offers, while the problem continues.',
      3: 'Hiding intelligence is the opposite of market orientation, and it may mislead future guests.',
    },
    why: 'It generates and disseminates intelligence, responds across functions (operations, maintenance, room allocation) and checks whether the response worked.',
    solution: 'The reviews are market intelligence. A market-oriented hotel shares them with the people who can act (operations and maintenance), responds to the cause (insulation, room allocation) and measures the result (fewer noise mentions). The other options ignore, spin or hide the intelligence.',
  },
  {
    id: 'm01-mo-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional IT-support firm earns a margin of $1,200 a year per client; 70% of clients renew each year, and it discounts at 10%. A quarterly review meeting with each client would cost $100 per client per year and is expected to raise retention to 75%. Using CLV = m ÷ (1 + d − r), by how much would the meetings change a client’s lifetime value? Give dollars and cents, with a minus sign if it falls.',
    answer: 142.86, check: () => (1200 - 100) / (1 + 0.10 - 0.75) - 1200 / (1 + 0.10 - 0.70), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 428.57, say: 'That leaves out the cost of the meetings. The margin with the meetings is $1,100, not $1,200.' },
      { value: 3142.86, say: 'That is the lifetime value with the meetings. Subtract today’s, $1,200 ÷ 0.40 = $3,000.' },
      { value: -250, say: 'That includes the cost but not the higher retention. With the meetings, use r = 0.75.' },
    ],
    solution: 'Today: 1,200 ÷ (1 + 0.10 − 0.70) = 1,200 ÷ 0.40 = $3,000. With the meetings: (1,200 − 100) ÷ (1 + 0.10 − 0.75) = 1,100 ÷ 0.35 ≈ $3,142.86. Change: about +$142.86 per client, so the meetings pay on these assumptions, if they really raise retention to 75%.',
  },
  {
    id: 'm01-mo-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which description best matches Kohli and Jaworski’s (1990) idea of market orientation?',
    options: [
      'Generating intelligence on current and future needs, sharing it across departments and acting on it',
      'A marketing department that designs its advertising campaigns around the results of customer surveys',
      'Giving customers whatever they ask for, as quickly as possible, so that satisfaction scores keep rising',
      'Matching competitors’ prices and features as quickly as possible whenever they change',
    ],
    answer: 0,
    feedback: {
      1: 'Kohli and Jaworski describe organisation-wide activities, not the work of one department, and responsiveness goes beyond advertising.',
      2: 'Responding to intelligence is not the same as doing whatever customers ask; the business still decides, with a long-term view.',
      3: 'Watching competitors is part of the intelligence, but copying them isn’t market orientation.',
    },
    solution: 'Kohli and Jaworski defined market orientation as organisation-wide generation of market intelligence about current and future customer needs, its dissemination across departments and organisation-wide responsiveness to it: the marketing concept put into practice.',
  },
];
