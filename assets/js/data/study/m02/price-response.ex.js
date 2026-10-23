// price-response.ex.js — M02 · Price, demand and pricing tactics: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Every business and dataset here is fictional; Lantern's elasticity is never stated as fact.

const money = (v, d = 2) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const int = (v) => `${v < 0 ? '−' : ''}${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v).toFixed(d)}%`;
const num = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}`;

export const widgets = {
  'pr-midpoint': {
    type: 'formula',
    title: 'Midpoint elasticity, revenue and contribution',
    intro: 'Two observed price–quantity pairs, plus the variable cost of a unit.',
    inputs: [
      { id: 'p1', label: 'Price 1', min: 1, max: 50, step: 0.5, value: 11, fmt: 'money' },
      { id: 'q1', label: 'Quantity at price 1', min: 100, max: 5000, step: 50, value: 2400, fmt: 'int' },
      { id: 'p2', label: 'Price 2', min: 1, max: 50, step: 0.5, value: 13, fmt: 'money' },
      { id: 'q2', label: 'Quantity at price 2', min: 100, max: 5000, step: 50, value: 2000, fmt: 'int' },
      { id: 'vc', label: 'Variable cost per unit', min: 0, max: 20, step: 0.5, value: 4, fmt: 'money' },
    ],
    compute: (v) => {
      if (Math.abs(v.p2 - v.p1) < 1e-9) return { error: 'The two prices are the same, so there is no price change to measure a response to. Change one of the prices.' };
      const dq = (v.q2 - v.q1) / ((v.q1 + v.q2) / 2);
      const dp = (v.p2 - v.p1) / ((v.p1 + v.p2) / 2);
      const e = dq / dp;
      const r1 = v.p1 * v.q1, r2 = v.p2 * v.q2;
      const c1 = (v.p1 - v.vc) * v.q1, c2 = (v.p2 - v.vc) * v.q2;
      const mag = Math.abs(e);
      let verdict;
      if (e > 0) verdict = 'Quantity moved in the same direction as price, so something other than price probably changed between the two observations (season, promotion, a competitor). Treat this elasticity with suspicion.';
      else if (mag > 1.02) verdict = 'Demand is elastic over this range: price and revenue move in opposite directions.';
      else if (mag < 0.98) verdict = 'Demand is inelastic over this range: price and revenue move in the same direction.';
      else verdict = 'Demand is close to unit-elastic: revenue hardly changes.';
      const cNote = c2 > c1 ? 'Contribution is higher at price 2.' : c2 < c1 ? 'Contribution is lower at price 2.' : 'Contribution is the same at both prices.';
      return {
        headline: { label: 'Midpoint elasticity', value: num(e) },
        rows: [
          ['% change in quantity (midpoint)', pct(dq * 100)],
          ['% change in price (midpoint)', pct(dp * 100)],
          ['Revenue at price 1', money(r1, 0)],
          ['Revenue at price 2', money(r2, 0)],
          ['Contribution at price 1', money(c1, 0)],
          ['Contribution at price 2', money(c2, 0)],
        ],
        note: `${verdict} ${cNote} Revenue and contribution can move in different directions, because contribution also depends on the variable cost of every unit sold.`,
        chart: {
          kind: 'bar',
          x: { label: 'Observation', values: ['At price 1', 'At price 2'] },
          series: [
            { name: 'Revenue', values: [Math.round(r1), Math.round(r2)] },
            { name: 'Contribution', values: [Math.round(c1), Math.round(c2)] },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'pr-required': {
    type: 'formula',
    title: 'Volume needed after a price change',
    intro: 'How much must volume change to keep total contribution where it is?',
    inputs: [
      { id: 'cm', label: 'Contribution margin ratio at today’s price', min: 10, max: 90, step: 1, value: 30, fmt: 'pct' },
      { id: 'dp', label: 'Price change', min: -30, max: 30, step: 1, value: -10, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.cm + v.dp <= 0) return { error: `A ${Math.abs(v.dp)}% cut removes the whole ${v.cm}% contribution margin: every unit would sell at or below its variable cost, so no volume can restore contribution.` };
      const need = -v.dp / (v.cm + v.dp) * 100;
      const xs = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25].filter((x) => v.cm + x >= 10);
      const verb = v.dp < 0 ? `must rise by at least ${need.toFixed(1)}%` : v.dp > 0 ? `can fall by up to ${Math.abs(need).toFixed(1)}%` : 'does not need to change';
      return {
        headline: { label: 'Volume change that keeps contribution unchanged', value: pct(need) },
        rows: [
          ['Contribution per unit before (share of today’s price)', `${v.cm}%`],
          ['Contribution per unit after (share of today’s price)', `${v.cm + v.dp}%`],
          ['Volume index needed (today = 100)', (100 * v.cm / (v.cm + v.dp)).toFixed(1)],
        ],
        note: `With a ${v.cm}% contribution margin ratio and a ${v.dp > 0 ? '+' : v.dp < 0 ? '−' : ''}${Math.abs(v.dp)}% price change, volume ${verb} for contribution to stay where it is. The chart shows the requirement across price changes: cuts get expensive fast, especially when the margin is thin.`,
        chart: {
          kind: 'line',
          x: { label: 'Price change (%)', values: xs },
          series: [{ name: 'Volume change needed (%)', values: xs.map((x) => Math.round(-x / (v.cm + x) * 1000) / 10) }],
          y: { label: 'Volume change (%)' },
        },
      };
    },
  },
  'pr-mix': {
    type: 'mixsim',
    lock: { tier: true, range: true, channels: true, promotion: true },
    show: ['units', 'revenue', 'contribution', 'elasticity'],
    note: 'Only the price is open; product, channels and promotion are the default plan. The elasticity is computed by the simulator’s teaching model, not measured from real shoppers.',
  },
};

export const guided = [
  {
    id: 'm02-pr-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional university raises the fee for its evening data-analysis course from $400 to $460, and enrolment falls from 250 to 220. Nothing else about the course changed.',
    solution: 'Midpoint quantity change = (220 − 250) ÷ 235 ≈ −12.77%. Midpoint price change = 60 ÷ 430 ≈ 13.95%. E ≈ −12.77 ÷ 13.95 ≈ −0.92 (−0.915 before rounding): inelastic. Revenue rises from 400 × 250 = $100,000 to 460 × 220 = $101,200.',
    steps: [
      { id: 'm02-pr-g1-s1', type: 'num', prompt: 'What is the percentage change in enrolment, measured against the midpoint? (Use a minus sign for a fall.)',
        answer: -12.77, check: () => (220 - 250) / ((220 + 250) / 2) * 100, unit: '%', places: 2, tol: 0.05,
        hints: ['The midpoint of 250 and 220 is their average.', 'Change ÷ average = −30 ÷ 235.'],
        wrong: [{ value: -12, say: 'You divided by the starting value, 250. The midpoint formula divides by the average of the two values, 235.' }, { value: 12.77, say: 'Enrolment fell, so the change is negative.' }] },
      { id: 'm02-pr-g1-s2', type: 'num', prompt: 'What is the percentage change in the fee, measured against the midpoint?',
        answer: 13.95, check: () => (460 - 400) / ((460 + 400) / 2) * 100, unit: '%', places: 2, tol: 0.05,
        hints: ['Average fee = (400 + 460) ÷ 2.', '60 ÷ 430.'],
        wrong: [{ value: 15, say: 'That divides by the starting fee. Use the average fee, $430.' }] },
      { id: 'm02-pr-g1-s3', type: 'num', prompt: 'What is the midpoint price elasticity of demand? Give two decimal places.',
        answer: -0.92, check: () => ((220 - 250) / 235) / (60 / 430), unit: '', places: 2, tol: 0.01,
        hints: ['Elasticity = % change in quantity ÷ % change in price.', '−12.77 ÷ 13.95.'],
        wrong: [{ value: -1.09, say: 'You divided the price change by the quantity change. Quantity goes on top.' }, { value: 0.92, say: 'Enrolment fell as the fee rose, so the elasticity is negative.' }] },
      { id: 'm02-pr-g1-s4', type: 'mc', prompt: 'What happened to fee revenue, and why?',
        options: [
          'It rose, because demand is inelastic over this range: enrolment fell by a smaller percentage than the fee rose.',
          'It fell, because enrolment fell.',
          'It rose, because demand is elastic.',
          'It stayed the same, because the elasticity is close to −1.',
        ],
        answer: 0,
        hints: ['Compare the size of the elasticity with 1.', 'Revenue before: 400 × 250; after: 460 × 220.'],
        feedback: { 1: 'Fewer students does not mean less revenue: each pays $60 more. Revenue = 460 × 220 = $101,200, more than $100,000.', 2: 'The magnitude, 0.92, is below 1, so demand is inelastic, not elastic.', 3: 'Close to −1 means revenue changes little, but it does change: it rises by $1,200.' } },
    ],
  },
  {
    id: 'm02-pr-g2', type: 'classify', kind: 'conceptual',
    prompt: 'For each product, would you expect demand to be more elastic or less elastic? Think about substitutes, necessity, budget share and how easily buyers compare prices.',
    items: [
      'One brand of canned tomatoes on a supermarket shelf next to five others',
      'Insulin for a person with diabetes',
      'Salt for home cooking',
      'A city-break hotel room booked a month ahead, with many hotels nearby',
      'Fuel at the only petrol station on a remote highway, 150 km from the next',
      'A music-streaming subscription when two rivals offer similar catalogues',
    ],
    categories: ['More elastic', 'Less elastic'],
    answer: [0, 1, 1, 0, 1, 0],
    hints: ['Ask first: how easily could the buyer switch to something else, or go without?', 'Brand-level demand with close substitutes is elastic; necessities with no substitutes, and tiny budget items, are inelastic.'],
    feedback: {
      0: 'Five close substitutes sit on the same shelf, so a price rise sends shoppers to another brand.',
      2: 'Salt is a necessity and a tiny share of the budget: few people notice or react to its price.',
      3: 'There is time to compare, and many substitutes nearby: demand is elastic.',
      4: 'No substitute within reach and a tank that must be filled: demand is inelastic, at least in the short run.',
    },
    solution: 'More elastic: one tomato brand among many, a hotel room with many rivals booked in advance, a streaming service with close rivals. Less elastic: insulin (a necessity with no substitute), salt (a necessity and a tiny budget share), fuel with no other station nearby.',
  },
  {
    id: 'm02-pr-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional online retailer sells a phone case at $25. Its variable cost is $10 a case (the product, packaging, payment fee and pick-and-pack), and it sells 4,000 cases a month. It is considering a 20% price cut to $20.',
    solution: 'Contribution per case falls from $15 to $10, so volume must rise by 5 ÷ 10 = 50%, to 6,000 cases. If volume rises 40%, to 5,600, contribution is 10 × 5,600 = $56,000 against 15 × 4,000 = $60,000: $4,000 less, even though revenue rises from $100,000 to $112,000. Don’t cut.',
    steps: [
      { id: 'm02-pr-g3-s1', type: 'num', prompt: 'By what percentage must monthly volume rise to keep total contribution unchanged?',
        answer: 50, check: () => -(20 - 25) / ((25 - 10) + (20 - 25)) * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Contribution per case before = 25 − 10; after = 20 − 10.', 'Required change = −ΔP ÷ (CM + ΔP) = 5 ÷ (15 − 5).'],
        wrong: [{ value: 25, say: 'That keeps revenue unchanged (25 ÷ 20 = 1.25). Contribution matters, and each case’s contribution falls by a third, from $15 to $10.' }, { value: 33.33, say: 'You divided the price change by the old contribution (5 ÷ 15). The new contribution per case, $10, is what the extra cases earn: 5 ÷ 10.' }] },
      { id: 'm02-pr-g3-s2', type: 'num', prompt: 'How many cases a month is that?',
        answer: 6000, check: () => 4000 * 15 / 10, unit: 'cases', places: 0, tol: 0.5,
        hints: ['4,000 × (1 + 0.50).'] },
      { id: 'm02-pr-g3-s3', type: 'num', prompt: 'A small test suggests the cut would raise volume by 40%. By how much would monthly contribution change? (Use a minus sign for a fall.)',
        answer: -4000, check: () => (20 - 10) * 4000 * 1.4 - (25 - 10) * 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['New volume = 4,000 × 1.4 = 5,600 cases.', 'New contribution = 5,600 × $10; old = 4,000 × $15.'],
        wrong: [{ value: 12000, say: 'That is the change in revenue (20 × 5,600 − 25 × 4,000). Contribution subtracts the $10 variable cost of every case.' }] },
      { id: 'm02-pr-g3-s4', type: 'mc', prompt: 'What should the retailer conclude?',
        options: [
          'Don’t cut: revenue would rise by $12,000 but contribution would fall by $4,000, because volume would rise by less than the 50% needed.',
          'Cut: revenue would rise, so the cut pays for itself.',
          'Cut: demand is elastic, so lower prices raise profit.',
          'It can’t be judged without knowing the fixed costs.',
        ],
        answer: 0,
        hints: ['Compare the expected volume gain with the gain needed.'],
        feedback: { 1: 'Higher revenue is not higher profit. Each extra case brings $10, but the 4,000 existing cases each lose $5.', 2: 'Elastic demand raises revenue. To raise contribution, volume must rise by more than 50%, which needs an elasticity stronger than about −2.5 for this cut.', 3: 'Fixed costs are the same either way, so they don’t affect which option earns more. Comparing contribution is enough.' } },
    ],
  },
  {
    id: 'm02-pr-g4', type: 'num', kind: 'applied',
    prompt: 'Lantern’s contribution margin ratio on supermarket cans is about 68.8% of its net price. If it cut its net price by 5%, by what percentage would supermarket volume need to rise to keep contribution unchanged?',
    answer: 7.84, check: () => 5 / (68.8 - 5) * 100, unit: '%', places: 2, tol: 0.05,
    hints: ['Use the percentage form: −ΔP ÷ (CM ratio + ΔP), with ΔP = −5%.', '5 ÷ (68.8 − 5).'],
    wrong: [{ value: 7.27, say: 'You divided by the old contribution margin (5 ÷ 68.8). After the cut each can contributes only 63.8% of the old price, so divide by 63.8.' }, { value: 5, say: 'A 5% rise in volume would keep revenue roughly unchanged, but each can now contributes less, so volume must rise by more.' }],
    solution: 'Required change = 5 ÷ (68.8 − 5) = 5 ÷ 63.8 ≈ 7.84%. A high contribution margin makes a small cut relatively cheap to recover; at a 30% margin the same cut would need 20% more volume.',
  },
];

export const independent = [
  {
    id: 'm02-pr-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional gym raises its monthly membership fee from $50 to $55, and memberships fall from 1,200 to 1,140. Using the point formula from the starting values, what is the price elasticity of demand?',
    answer: -0.5, check: () => ((1140 - 1200) / 1200) / ((55 - 50) / 50), unit: '', places: 2, tol: 0.01,
    wrong: [{ value: 0.5, say: 'Memberships fell as the fee rose, so the elasticity is negative.' }, { value: -2, say: 'You divided the price change by the quantity change. Quantity goes on top: −5% ÷ 10%.' }],
    solution: 'Quantity change = −60 ÷ 1,200 = −5%. Price change = 5 ÷ 50 = 10%. E = −5 ÷ 10 = −0.5: inelastic, so the fee rise increases revenue (from $60,000 to $62,700 a month).',
  },
  {
    id: 'm02-pr-i2', type: 'num', kind: 'applied',
    prompt: 'A fictional battery-storage installer earns a 40% contribution margin ratio on its annual maintenance contracts. It plans to raise the contract price by 8%. What percentage change in the number of contracts would leave total contribution unchanged? (Use a minus sign for a fall.)',
    answer: -16.67, check: () => -8 / (40 + 8) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [{ value: -20, say: 'You divided by the old contribution margin (8 ÷ 40). After the rise each contract contributes 48% of the old price, so divide by 48.' }, { value: -8, say: 'Losing 8% of contracts would keep revenue roughly unchanged, but each remaining contract now contributes more, so more volume can be lost.' }],
    solution: 'Required change = −ΔP ÷ (CM + ΔP) = −8 ÷ (40 + 8) ≈ −16.67%. The installer can lose up to about one contract in six before the price rise reduces contribution.',
  },
  {
    id: 'm02-pr-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For each new product, which launch strategy fits better?',
    items: [
      'A patented medical imaging device bought by hospitals that value its accuracy highly',
      'A food-delivery app entering a city where two rivals already operate and users switch freely',
      'A boutique hotel opening with a waiting list and only 30 rooms',
      'A store-brand breakfast cereal entering a crowded supermarket aisle',
      'A messaging app that becomes more useful the more of a user’s friends join',
    ],
    categories: ['Skimming fits better', 'Penetration fits better'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      1: 'Rivals are already there and users switch freely, so demand is elastic and a large user base is the best defence: penetration.',
      2: 'Capacity is small and demand exceeds it, so a low price would only lengthen the waiting list: skimming.',
      4: 'Network effects reward a large user base, so winning users fast matters more than margin per user: penetration.',
    },
    solution: 'Skimming: the patented device (protected, price-insensitive buyers) and the small hotel with a waiting list (limited capacity). Penetration: the delivery app (elastic demand, easy entry), the store-brand cereal (crowded, price-led category) and the messaging app (network effects).',
  },
  {
    id: 'm02-pr-i4', type: 'mc', kind: 'conceptual',
    prompt: 'After a 10% price cut, a café’s revenue rose by 4%. The owner says the cut was profitable. What else do you need to know to judge that claim?',
    options: [
      'Whether volume rose by more than the increase needed to keep contribution unchanged, given the café’s contribution margin.',
      'Nothing: if revenue rose, profit rose.',
      'Only whether demand is elastic.',
      'Only whether the price elasticity is negative.',
    ],
    answer: 0,
    feedback: {
      1: 'Revenue ignores the variable cost of the extra items sold and the lower margin on every item. Profit can fall while revenue rises.',
      2: 'A 4% rise in revenue already tells you demand was elastic. Elastic demand guarantees higher revenue, not higher contribution.',
      3: 'Almost all elasticities are negative; the sign says nothing about whether this cut paid.',
    },
    solution: 'Revenue rose by 4%, so volume rose by about 1.04 ÷ 0.90 − 1 ≈ 15.6%. Whether that is enough depends on the contribution margin: with a 60% margin, a 10% cut needs 10 ÷ 50 = 20% more volume, so contribution fell; with an 80% margin it needs 10 ÷ 70 ≈ 14.3%, so contribution rose.',
  },
  {
    id: 'm02-pr-i5', type: 'num', kind: 'numerical',
    prompt: 'Demand for a fictional regional airline’s route has an elasticity of about −0.6. The airline raises fares by 10%. Assume passenger numbers fall by exactly 0.6 × 10% = 6%. By what percentage does fare revenue change?',
    answer: 3.4, check: () => (1.10 * 0.94 - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 4, say: 'Adding the percentages (10 − 6) is only an approximation. Multiply the factors: 1.10 × 0.94.' }, { value: -6, say: 'That is the change in passengers. Revenue also reflects the 10% higher fare.' }],
    solution: 'Revenue factor = 1.10 × 0.94 = 1.034, so revenue rises by 3.4%. Demand is inelastic, so price and revenue move together.',
  },
  {
    id: 'm02-pr-i6', type: 'mc', kind: 'applied',
    prompt: 'A canned-coffee brand cuts its price by 30% every other week for a year. According to reference-price research, what is the most likely long-run effect?',
    options: [
      'Shoppers’ reference price drifts down towards the deal price, so the regular price feels like a loss and full-price sales suffer.',
      'Shoppers’ reference price rises, because they see the regular price half of the time.',
      'Nothing: shoppers judge each price on its own, without comparing it with past prices.',
      'Shoppers become less sensitive to price because the brand seems generous.',
    ],
    answer: 0,
    feedback: {
      1: 'Reference prices are formed from the prices shoppers have seen, and half of what they see is the deal price, so the reference falls, it does not rise.',
      2: 'Reference-price research finds that buyers compare prices with what they have seen in the past.',
      3: 'Frequent deals tend to do the opposite: they teach shoppers to wait for the next one.',
    },
    solution: 'Buyers form reference prices largely from past prices and react more strongly to prices above their reference (losses) than below it. Frequent deals pull the reference down, so the regular price looks like a loss, and shoppers learn to buy on deal or wait.',
  },
];

export const check = [
  {
    id: 'm02-pr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'The price elasticity of demand for a product is −0.4. What does that mean?',
    options: [
      'A 1% price rise reduces the quantity bought by about 0.4%, so demand is inelastic and a small price rise increases revenue.',
      'A 1% price rise reduces the quantity bought by about 40%.',
      'A $1 price rise reduces the quantity bought by 0.4 units.',
      'Demand is elastic, so a price rise reduces revenue.',
    ],
    answer: 0,
    feedback: {
      1: 'Elasticity compares percentage changes: −0.4 means a 0.4% fall in quantity for each 1% rise in price, not 40%.',
      2: 'That describes a slope (units per dollar). Elasticity is a ratio of percentage changes, so it doesn’t depend on units.',
      3: 'The magnitude, 0.4, is below 1, so demand is inelastic and revenue moves with price.',
    },
    solution: 'E = % change in quantity ÷ % change in price = −0.4, so a 1% rise in price cuts quantity by about 0.4%. Because the magnitude is below 1, demand is inelastic: a small price rise raises revenue.',
  },
  {
    id: 'm02-pr-k2', type: 'num', kind: 'numerical',
    prompt: 'A product’s price rises from $8 to $10, and the quantity sold falls from 1,100 to 900 units a week. What is the midpoint price elasticity of demand?',
    answer: -0.9, check: () => ((900 - 1100) / ((900 + 1100) / 2)) / ((10 - 8) / ((10 + 8) / 2)), unit: '', places: 2, tol: 0.01,
    wrong: [{ value: -0.73, say: 'You used the starting values (−18.2% ÷ 25%). The midpoint formula divides each change by the average: −200 ÷ 1,000 and 2 ÷ 9.' }, { value: 0.9, say: 'Quantity fell as price rose, so the elasticity is negative.' }],
    solution: 'Quantity change = −200 ÷ 1,000 = −20%. Price change = 2 ÷ 9 ≈ 22.2%. E = −20 ÷ 22.2 ≈ −0.90: inelastic.',
  },
  {
    id: 'm02-pr-k3', type: 'num', kind: 'applied',
    prompt: 'A fictional airline sells 9,000 seats a month on a route at an average fare of $160. The variable cost per passenger (extra fuel for the weight, catering, airport and booking fees) is $40. It is considering a $20 fare cut. How many passengers a month would it need to keep total contribution unchanged?',
    answer: 10800, check: () => 9000 * (160 - 40) / (140 - 40), unit: 'passengers', places: 0, tol: 0.5,
    wrong: [{ value: 10286, say: 'That keeps revenue unchanged (9,000 × 160 ÷ 140). Contribution matters: each passenger’s contribution falls from $120 to $100.' }, { value: 10500, say: 'You divided the fare cut by the old contribution (20 ÷ 120). Divide by the new contribution per passenger, $100.' }],
    solution: 'Contribution per passenger falls from 160 − 40 = $120 to 140 − 40 = $100. Contribution today = 9,000 × 120 = $1,080,000. Passengers needed = 1,080,000 ÷ 100 = 10,800, a 20% increase.',
  },
  {
    id: 'm02-pr-k4', type: 'mc', kind: 'applied',
    prompt: 'A start-up launches a plant-based protein bar into a supermarket category with dozens of brands, little brand loyalty and shoppers who compare prices on the shelf. Its factory has plenty of spare capacity and its unit cost falls as volume grows. Which launch strategy fits best?',
    options: [
      'Penetration pricing: demand is elastic, capacity is available and costs fall with scale.',
      'Skimming: start high to recover development costs quickly.',
      'Skimming: a high price signals quality in a crowded category.',
      'Neither: launch prices don’t affect later demand.',
    ],
    answer: 0,
    feedback: {
      1: 'Skimming needs buyers who value the product highly and few close substitutes. With dozens of brands and price-comparing shoppers, a high price would lose most buyers to rivals.',
      2: 'A high price can signal quality, but here substitutes are many and loyalty is low, so the signal would be outweighed by shoppers switching to cheaper bars.',
      3: 'The launch price becomes buyers’ reference price, which shapes how later prices are judged.',
    },
    solution: 'Every condition favours penetration: many substitutes and price-comparing shoppers (elastic demand), spare capacity, and unit costs that fall with volume. Skimming fits protected products with price-insensitive early buyers.',
  },
  {
    id: 'm02-pr-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Which claim about charm prices such as $2.99 is best supported by the research covered in this lesson?',
    options: [
      'They can feel noticeably cheaper than a price one cent higher mainly when the leftmost digit changes, and the size of the effect varies across studies.',
      'Ending a price in 9 raises the sales of every product by a predictable amount.',
      'They work as well for $3.49 against $3.50 as for $2.99 against $3.00.',
      'They always signal high quality.',
    ],
    answer: 0,
    feedback: {
      1: 'The effect depends on context, for example whether prices are compared side by side, and its size varies substantially between studies.',
      2: 'Thomas and Morwitz found the left-digit effect occurs only when the leftmost digits differ; $3.49 and $3.50 share a left digit.',
      3: 'Charm prices tend to signal a bargain; round prices are more often used to suggest quality.',
    },
    solution: 'The left-digit effect occurs when the leftmost digits differ and is stronger when prices are compared side by side; published estimates of its size vary. It is a context-dependent effect to test, not a guaranteed lift.',
  },
  {
    id: 'm02-pr-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional museum cuts its admission price from $20 to $16, and monthly visits rise from 5,000 to 6,000. By how much does monthly admission revenue change? (Use a minus sign for a fall.)',
    answer: -4000, check: () => 16 * 6000 - 20 * 5000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 20000, say: 'That counts the extra 1,000 visitors at the old price. Every visitor now pays $16: 16 × 6,000 = $96,000.' }, { value: 16000, say: 'That is only the extra visitors’ spending (1,000 × $16). The 5,000 existing visitors each pay $4 less, which costs $20,000.' }],
    solution: 'Revenue before = 20 × 5,000 = $100,000; after = 16 × 6,000 = $96,000, a change of −$4,000. The midpoint elasticity is (1,000 ÷ 5,500) ÷ (−4 ÷ 18) ≈ −0.82: inelastic, so the price cut lowers revenue.',
  },
];
