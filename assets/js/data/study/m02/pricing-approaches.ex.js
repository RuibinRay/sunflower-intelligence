// pricing-approaches.ex.js — M02 · Pricing approaches: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern figures come from ./market.js; every other business here is fictional.

const money = (v, d = 2) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const int = (v) => `${v < 0 ? '−' : ''}${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`;

export const widgets = {
  'pa-breakeven': {
    type: 'formula',
    title: 'Break-even calculator',
    intro: 'Set the shelf price, the share of it that retailers and distributors keep, the cost per unit and the fixed costs for the year.',
    inputs: [
      { id: 'shelf', label: 'Shelf price per can', min: 1.99, max: 4.99, step: 0.05, value: 3.49, fmt: 'money' },
      { id: 'trade', label: 'Trade margin (share of shelf price kept by the trade)', min: 0, max: 50, step: 1, value: 32, fmt: 'pct' },
      { id: 'vc', label: 'Variable cost per can', min: 0.30, max: 2.00, step: 0.02, value: 0.74, fmt: 'money' },
      { id: 'fc', label: 'Fixed costs for the year', min: 50000, max: 400000, step: 1000, value: 197000, fmt: 'money' },
    ],
    compute: (v) => {
      const net = v.shelf * (1 - v.trade / 100);
      const cm = net - v.vc;
      if (cm <= 0.0001) {
        return { error: `At these inputs Lantern receives ${money(net)} a can, which does not cover the ${money(v.vc)} variable cost. Each extra can loses money, so no volume breaks even. Raise the price, lower the trade margin or lower the cost.` };
      }
      const be = Math.ceil(v.fc / cm);
      const ratio = cm / net;
      const xs = Array.from({ length: 13 }, (_, i) => i * 25000);
      return {
        headline: { label: 'Break-even volume', value: `${int(be)} cans` },
        rows: [
          ['Price Lantern receives (net of trade margin)', money(net)],
          ['Contribution margin per can', money(cm)],
          ['Contribution margin ratio', pct(ratio * 100)],
          ['Break-even revenue (at Lantern’s net price)', money(be * net, 0)],
          ['Share of Harbour City’s 4.8 million cans a year', pct(be / 4800000 * 100, 2)],
        ],
        note: `Each can sold at ${money(v.shelf)} leaves Lantern ${money(cm)} after its own cost, so it takes ${int(be)} cans to cover ${money(v.fc, 0)} of fixed costs. Profit begins with the next can. ${v.trade > 0 ? `Of every dollar the shopper pays, the trade keeps ${Math.round(v.trade)} cents.` : 'With no trade margin, Lantern keeps the whole shelf price.'}`,
        chart: {
          kind: 'line',
          x: { label: 'Cans sold in the year', values: xs },
          series: [
            { name: 'Lantern’s revenue', values: xs.map((q) => Math.round(q * net)) },
            { name: 'Total cost', values: xs.map((q) => Math.round(v.fc + q * v.vc)) },
            { name: 'Profit', values: xs.map((q) => Math.round(q * cm - v.fc)) },
          ],
          y: { label: 'Dollars a year' },
        },
      };
    },
  },
  'pa-markup': {
    type: 'formula',
    title: 'Markup and margin converter',
    intro: 'A margin is measured on the price, a markup on the cost. Pick a cost and a target margin.',
    inputs: [
      { id: 'cost', label: 'Unit cost', min: 1, max: 500, step: 1, value: 10, fmt: 'money' },
      { id: 'm', label: 'Target margin on price', min: 5, max: 90, step: 1, value: 40, fmt: 'pct' },
    ],
    compute: (v) => {
      const m = v.m / 100;
      const price = v.cost / (1 - m);
      const markup = m / (1 - m);
      const wrongPrice = v.cost * (1 + m);
      const wrongMargin = m / (1 + m);
      const xs = [10, 20, 30, 40, 50, 60, 70, 80];
      return {
        headline: { label: `Price that gives a ${Math.round(v.m)}% margin`, value: money(price) },
        rows: [
          ['Profit per unit at that price', money(price - v.cost)],
          ['Matching markup on cost', pct(markup * 100)],
          [`Price if ${Math.round(v.m)}% is added to cost as a markup (the classic error)`, money(wrongPrice)],
          ['Margin that mistaken price actually earns', pct(wrongMargin * 100)],
          ['Profit lost per unit by the mistake', money(price - wrongPrice)],
        ],
        note: `Dividing the cost by (1 − ${m.toFixed(2)}) gives the right price. Multiplying it by (1 + ${m.toFixed(2)}) gives a markup of ${Math.round(v.m)}%, which is only a ${pct(wrongMargin * 100)} margin. The gap grows quickly as the target margin rises.`,
        chart: {
          kind: 'line',
          x: { label: 'Margin on price (%)', values: xs },
          series: [
            { name: 'Markup on cost needed (%)', values: xs.map((x) => Math.round(x / (100 - x) * 1000) / 10) },
            { name: 'Margin (%)', values: xs },
          ],
          y: { label: 'Percent' },
        },
      };
    },
  },
  'pa-mix': {
    type: 'mixsim',
    lock: { tier: true, range: true, channels: true, promotion: true },
    show: ['units', 'revenue', 'margin', 'contribution'],
    note: 'Only the price is open. Everything else is the default plan: single-origin, one flavour, supermarkets, natural grocers and Lantern’s own channel, with $120,000 of promotion. Results are from a teaching model, not a forecast.',
  },
};

export const guided = [
  {
    id: 'm02-pa-g1', type: 'steps', kind: 'numerical',
    prompt: 'Fernhill Outfitters, a fictional clothing brand, makes a waxed jacket for $48 (fabric, trims, sewing and freight) and sells it on its own website for $80.',
    solution: 'Profit per jacket = 80 − 48 = $32. Markup on cost = 32 ÷ 48 ≈ 66.7%. Margin on price = 32 ÷ 80 = 40%. For a 50% margin next season, price = 48 ÷ (1 − 0.50) = $96; adding 50% to cost would give $72, only a 33.3% margin.',
    steps: [
      { id: 'm02-pa-g1-s1', type: 'num', prompt: 'What is the markup on cost?',
        answer: 66.67, check: () => (80 - 48) / 48 * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Markup measures the profit per unit against the cost.', 'Markup = (price − cost) ÷ cost = 32 ÷ 48.'],
        wrong: [{ value: 40, say: 'That is the profit as a share of the price, which is the margin. A markup is measured on the cost: divide $32 by $48.' }] },
      { id: 'm02-pa-g1-s2', type: 'num', prompt: 'What is the margin on price?',
        answer: 40, check: () => (80 - 48) / 80 * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Margin uses the price as the base.', 'Margin = 32 ÷ 80.'],
        wrong: [{ value: 66.67, say: 'That is the markup. The margin divides the same $32 by the price, $80.' }, { value: 60, say: '60% is the cost as a share of the price (48 ÷ 80). The margin is the profit’s share: 100% − 60%.' }] },
      { id: 'm02-pa-g1-s3', type: 'num', prompt: 'Next season the cost is still $48 and Fernhill wants a 50% margin on price. What price should it charge?',
        answer: 96, check: () => 48 / (1 - 0.5), unit: '$', places: 2, tol: 0.01,
        hints: ['A margin target fixes the share of the price that is profit, so cost is the remaining share of the price.', 'Cost = price × (1 − margin), so price = 48 ÷ (1 − 0.50).'],
        wrong: [{ value: 72, say: 'That adds 50% to the cost, a 50% markup. At $72 the profit is $24, only 33.3% of the price. Divide the cost by (1 − 0.50) instead.' }] },
    ],
  },
  {
    id: 'm02-pa-g2', type: 'steps', kind: 'applied',
    prompt: 'A fictional 40-room boutique hotel has fixed costs of $84,000 a month (salaries, rent, insurance, systems). Each occupied room-night costs $45 in variable costs (cleaning, laundry, amenities, energy, card fees), and its average room rate is $150. Assume a 30-night month.',
    solution: 'Contribution per room-night = 150 − 45 = $105. Break-even = 84,000 ÷ 105 = 800 room-nights a month. The hotel can sell 40 × 30 = 1,200 room-nights a month, so it breaks even at 800 ÷ 1,200 ≈ 66.7% occupancy.',
    steps: [
      { id: 'm02-pa-g2-s1', type: 'num', prompt: 'How many room-nights must the hotel sell each month to break even?',
        answer: 800, check: () => 84000 / (150 - 45), unit: 'room-nights', places: 0, tol: 0.5,
        hints: ['Each room-night contributes the rate minus its variable cost.', 'Break-even = fixed costs ÷ contribution per room-night = 84,000 ÷ 105.'],
        wrong: [{ value: 560, say: 'You divided by the room rate. Part of each $150 pays for the room-night’s own $45 of variable costs; only the $105 contribution is left to cover fixed costs.' }, { value: 1866.67, say: 'You divided by the variable cost. Divide by the contribution per room-night, rate − variable cost.' }] },
      { id: 'm02-pa-g2-s2', type: 'num', prompt: 'What occupancy rate (room-nights sold ÷ room-nights available) is that?',
        answer: 66.67, check: () => 800 / (40 * 30) * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Room-nights available in a month = rooms × nights.', '800 ÷ (40 × 30).'] },
    ],
  },
  {
    id: 'm02-pa-g3', type: 'steps', kind: 'numerical',
    prompt: 'Northbeam Analytics, a fictional software company, sells a reporting tool to businesses at $1,200 per user per year. Hosting, customer support and payment fees cost $180 per user per year. Fixed costs (the development team, sales staff and offices) are $612,000 a year.',
    solution: 'Contribution per user = 1,200 − 180 = $1,020, a ratio of 1,020 ÷ 1,200 = 85%. Break-even = 612,000 ÷ 1,020 = 600 users. For a $204,000 profit: (612,000 + 204,000) ÷ 1,020 = 800 users.',
    steps: [
      { id: 'm02-pa-g3-s1', type: 'num', prompt: 'What is the contribution margin ratio?',
        answer: 85, check: () => (1200 - 180) / 1200 * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Contribution per user = price − variable cost per user.', 'Ratio = 1,020 ÷ 1,200.'],
        wrong: [{ value: 15, say: 'That is the variable cost as a share of the price. The contribution margin ratio is what is left: 100% − 15%.' }] },
      { id: 'm02-pa-g3-s2', type: 'num', prompt: 'How many paying users does Northbeam need to break even?',
        answer: 600, check: () => 612000 / (1200 - 180), unit: 'users', places: 0, tol: 0.5,
        hints: ['Break-even = fixed costs ÷ contribution per user.'],
        wrong: [{ value: 510, say: 'You divided by the price. Each user’s $180 of variable cost must be covered first, so divide by the $1,020 contribution.' }] },
      { id: 'm02-pa-g3-s3', type: 'num', prompt: 'How many users does it need for a profit of $204,000 a year?',
        answer: 800, check: () => (612000 + 204000) / (1200 - 180), unit: 'users', places: 0, tol: 0.5,
        hints: ['The target profit has to be covered by contribution, just like the fixed costs.', '(612,000 + 204,000) ÷ 1,020.'],
        wrong: [{ value: 200, say: 'That is only the users needed for the profit, on top of break-even. Add them to the 600 needed to cover the fixed costs.' }] },
    ],
  },
  {
    id: 'm02-pa-g4', type: 'num', kind: 'applied',
    prompt: 'Lantern’s single-origin can costs $0.74, and supermarkets and the distributor keep 32% of the shelf price. Below what shelf price does each supermarket can lose money for Lantern? Give the price to the nearest cent.',
    answer: 1.09, check: () => 0.74 / (1 - 0.32), unit: '$', places: 2, tol: 0.01,
    hints: ['Lantern receives 68% of the shelf price. Find the shelf price at which that share equals $0.74.', 'Shelf price × 0.68 = 0.74, so shelf price = 0.74 ÷ 0.68.'],
    wrong: [
      { value: 0.98, say: 'You added 32% to the cost. The trade’s 32% is a share of the shelf price, so divide the cost by Lantern’s 68% share instead.' },
      { value: 0.74, say: 'Lantern only receives 68% of the shelf price, so a $0.74 shelf price would leave it about $0.50 for a can that costs $0.74.' },
    ],
    solution: 'Lantern keeps 1 − 0.32 = 68% of the shelf price. It covers its $0.74 variable cost when 0.68 × shelf price = 0.74, so the floor is 0.74 ÷ 0.68 ≈ $1.09. Below that, every can sold reduces profit.',
  },
];

export const independent = [
  {
    id: 'm02-pa-i1', type: 'num', kind: 'numerical',
    prompt: 'A garden centre (fictional) applies a 60% markup on cost to its plant pots. What margin on price does that give?',
    answer: 37.5, check: () => 0.6 / (1 + 0.6) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 60, say: 'A markup and a margin of the same size are different things: the margin divides the profit by the larger base, the price. Use margin = markup ÷ (1 + markup).' }, { value: 40, say: '40% is 100% − 60%, which has no meaning here. Convert with margin = 0.60 ÷ 1.60.' }],
    solution: 'Margin = markup ÷ (1 + markup) = 0.60 ÷ 1.60 = 37.5%. Check with a $10 pot: price $16, profit $6, margin 6 ÷ 16 = 37.5%.',
  },
  {
    id: 'm02-pa-i2', type: 'num', kind: 'numerical',
    prompt: 'An online retailer of kitchen knives (fictional) has a contribution margin ratio of 45% and fixed costs of $270,000 a year. What sales revenue does it need to break even?',
    answer: 600000, check: () => 270000 / 0.45, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 121500, say: 'That is 45% of the fixed costs. Each dollar of sales contributes 45 cents, so you need more sales than fixed costs, not less: divide by 0.45.' }, { value: 391500, say: 'You added 45% to the fixed costs. Break-even revenue = fixed costs ÷ contribution margin ratio.' }],
    solution: 'Each dollar of sales contributes $0.45 towards fixed costs, so break-even revenue = 270,000 ÷ 0.45 = $600,000. Check: 45% of $600,000 is $270,000.',
  },
  {
    id: 'm02-pa-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Which pricing approach is each business using?',
    items: [
      'A builders’ merchant adds 25% to the purchase cost of every bag of cement.',
      'A software firm prices a staff-scheduling tool at a share of the overtime it saves each hospital compared with the tool the hospital uses now.',
      'A petrol station sets its price within a cent or two of the other stations on the same road.',
      'An engineering firm submits one confidential price in a council’s tender to install battery storage at three schools.',
      'A bicycle maker sets the price that would earn 12% a year on the $3 million it invested in a new factory, at its forecast sales.',
    ],
    categories: ['Cost-plus', 'Target-return', 'Value-based', 'Competition-based: going rate', 'Competition-based: sealed bid'],
    answer: [0, 2, 3, 4, 1],
    feedback: {
      1: 'The price is anchored to what the hospital saves compared with its current alternative: that is economic value, so this is value-based pricing.',
      3: 'A tender with confidential bids is sealed-bid pricing: the firm weighs a higher price against a lower chance of winning.',
      4: 'The price is built from cost plus a return on invested capital at a forecast volume: target-return pricing.',
    },
    solution: 'Cement: cost-plus (a markup on cost). Scheduling tool: value-based (priced from savings against the alternative). Petrol: going-rate pricing. Tender: sealed-bid pricing. Bicycles: target-return pricing.',
  },
  {
    id: 'm02-pa-i4', type: 'num', kind: 'numerical',
    prompt: 'A fictional maker of electric cargo bikes invests $1,500,000 in a new assembly line and wants a 16% return a year on it. It forecasts sales of 4,000 bikes a year. At that volume its unit cost (variable cost plus fixed costs spread over the bikes) is $2,350. What is its target-return price?',
    answer: 2410, check: () => 2350 + 0.16 * 1500000 / 4000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 2726, say: 'You added 16% to the unit cost. The 16% is a return on the $1,500,000 invested, not a markup: spread 16% of the investment over the 4,000 bikes.' }, { value: 2350, say: 'That is the unit cost, which earns no return. Add the target return per bike: 0.16 × 1,500,000 ÷ 4,000.' }],
    solution: 'Target return = 0.16 × 1,500,000 = $240,000 a year. Spread over 4,000 bikes it is $60 a bike. Price = 2,350 + 60 = $2,410. The return is earned only if 4,000 bikes sell at that price.',
  },
  {
    id: 'm02-pa-i5', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about the price floor and the price ceiling is correct?',
    options: [
      'Costs set the floor and customers’ value set the ceiling; competitors’ prices sit in between and affect how customers judge a price.',
      'The ceiling is the highest price any competitor charges, because no customer will pay more than that.',
      'In the short run, every sale must be priced above the full average cost per unit, including a share of fixed costs.',
      'The floor is set by competitors’ lowest price, because matching it is the least a firm can charge.',
    ],
    answer: 0,
    feedback: {
      1: 'Customers pay more than a competitor’s price when the differences are worth it to them: the ceiling is the alternative’s price plus the differentiation value, which can be above any competitor’s price.',
      2: 'In the short run fixed costs are paid anyway, so any price above the variable cost adds contribution. Covering full cost is a long-run requirement.',
      3: 'A firm can price above or below competitors. Its floor comes from its own costs, not from a rival’s price.',
    },
    solution: 'The floor comes from costs (variable cost in the short run, all costs at a realistic volume in the long run). The ceiling is the most customers would pay given their alternatives. Competitors’ prices are inputs to customers’ judgement, so they sit in between rather than defining either limit.',
  },
  {
    id: 'm02-pa-i6', type: 'num', kind: 'applied',
    prompt: 'Suppose Lantern used the classic-blend liquid, which costs $0.58 a can, and sold it through natural and specialty grocers at a shelf price of $3.49. Natural grocers and their distributor keep 38% of the shelf price. What is Lantern’s gross margin per can, to the nearest cent?',
    answer: 1.58, check: () => 3.49 * (1 - 0.38) - 0.58, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 2.91, say: 'You subtracted the cost from the shelf price. Lantern receives only 62% of the shelf price; start from 3.49 × 0.62.' }, { value: 1.79, say: 'That uses the supermarket trade margin of 32%. Natural grocers keep 38%.' }],
    solution: 'Lantern receives 3.49 × (1 − 0.38) = $2.1638. Gross margin per can = 2.1638 − 0.58 = $1.5838, about $1.58.',
  },
];

export const check = [
  {
    id: 'm02-pa-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A product costs $60 and sells for $100. Why is its margin (40%) smaller than its markup (66.7%)?',
    options: [
      'Both divide the same $40 profit, but the margin divides it by the price, which is larger than the cost.',
      'The margin also deducts fixed costs, while the markup does not.',
      'The margin is calculated after tax and the markup before tax.',
      'Retailers use margins and manufacturers use markups, so they measure different profits.',
    ],
    answer: 0,
    feedback: {
      1: 'Neither measure deducts fixed costs: both use the same price and the same unit cost. Only the base differs.',
      2: 'Tax plays no part in either. The $40 is the same profit in both.',
      3: 'Both measures can be used by anyone; they describe the same profit on different bases.',
    },
    solution: 'Profit per unit is $40 in both cases. Markup = 40 ÷ 60 ≈ 66.7%; margin = 40 ÷ 100 = 40%. Dividing by a larger base gives a smaller percentage, and the price is always larger than the cost when there is a profit.',
  },
  {
    id: 'm02-pa-k2', type: 'num', kind: 'numerical',
    prompt: 'A bakery wants a 40% margin on price for a cake that costs $30 to make. What price should it charge?',
    answer: 50, check: () => 30 / (1 - 0.4), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 42, say: 'That adds 40% to the cost: a 40% markup, which gives only a 28.6% margin ($12 ÷ $42). For a margin target, divide the cost by (1 − margin).' }],
    solution: 'Price = cost ÷ (1 − margin) = 30 ÷ 0.60 = $50. Check: profit $20, and 20 ÷ 50 = 40%.',
  },
  {
    id: 'm02-pa-k3', type: 'num', kind: 'numerical',
    prompt: 'A food truck (fictional) sells noodle bowls at $12. Ingredients, packaging and card fees cost $4.50 a bowl, and its fixed costs (truck lease, permits, insurance, its owner’s salary) are $4,500 a month. How many bowls must it sell a month to break even?',
    answer: 600, check: () => 4500 / (12 - 4.5), unit: 'bowls', places: 0, tol: 0.5,
    wrong: [{ value: 375, say: 'You divided by the price. Each bowl’s $4.50 of variable cost comes out first; only the $7.50 contribution covers fixed costs.' }, { value: 1000, say: 'You divided by the variable cost. Divide by the contribution per bowl, $12 − $4.50.' }],
    solution: 'Contribution per bowl = 12 − 4.50 = $7.50. Break-even = 4,500 ÷ 7.50 = 600 bowls a month.',
  },
  {
    id: 'm02-pa-k4', type: 'mc', kind: 'applied',
    prompt: 'At 6 p.m. a fictional 120-room hotel still has 30 empty rooms for tonight. Its full cost per occupied room-night, with fixed costs spread over a normal month, is $95; the variable cost of an occupied room-night is $28. A walk-in guest offers $70 for a room tonight. Looking only at tonight’s profit, should the hotel accept?',
    options: [
      'Yes: $70 is above the $28 variable cost, so the room adds $42 towards fixed costs that are paid whether or not it is let.',
      'No: $70 is below the $95 full cost, so the hotel loses $25 on the room.',
      'No: a hotel should never let a room for less than its published rate.',
      'Yes, because any revenue from an empty room is pure profit.',
    ],
    answer: 0,
    feedback: {
      1: 'The $95 includes fixed costs that the hotel pays tonight whether the room is let or not. Letting the room changes only the variable cost, so it adds 70 − 28 = $42.',
      2: 'That is a long-run concern about reference prices and regular guests, not tonight’s profit. Tonight, the short-run floor is the variable cost.',
      3: 'Letting the room costs $28 in cleaning, laundry, energy and fees, so only $42 of the $70 is added to profit.',
    },
    solution: 'Tonight the fixed costs are sunk, so the short-run floor is the $28 variable cost. Accepting $70 adds 70 − 28 = $42 of contribution. Over a season, rates must cover full costs, and the hotel should avoid teaching regular guests to wait for late discounts.',
  },
  {
    id: 'm02-pa-k5', type: 'num', kind: 'applied',
    prompt: 'Fernhill Outfitters, the fictional clothing brand, sells its waxed jacket at $96. Each jacket costs $48, and the jacket line’s fixed costs (design, samples, photography and marketing) are $180,000 a year. How many jackets must it sell in a year to earn a profit of $60,000 from the line?',
    answer: 5000, check: () => (180000 + 60000) / (96 - 48), unit: 'jackets', places: 0, tol: 0.5,
    wrong: [{ value: 3750, say: 'That is the break-even volume. The $60,000 profit must also be covered by contribution: add it to the fixed costs.' }, { value: 2500, say: 'You divided by the price. Each jacket contributes $96 − $48 = $48.' }],
    solution: 'Contribution per jacket = 96 − 48 = $48. Volume = (180,000 + 60,000) ÷ 48 = 5,000 jackets. Break-even alone would be 180,000 ÷ 48 = 3,750.',
  },
  {
    id: 'm02-pa-k6', type: 'mc', kind: 'applied',
    prompt: 'A logistics company’s best alternative to Northbeam’s route-planning licence is a rival product at $40,000 a year. Northbeam’s product saves the company an estimated $25,000 a year more in fuel and drivers’ hours than the rival’s, but switching requires $5,000 of staff training in the first year. Serving the customer costs Northbeam $6,000 a year. Which first-year price range fits value-based pricing?',
    options: [
      'Above $40,000 and below $60,000, so that the customer keeps part of the $20,000 of net extra value.',
      'About $7,200: the $6,000 cost plus a 20% markup.',
      'Exactly $40,000, to match the rival.',
      'Up to $65,000: the rival’s price plus the $25,000 of savings.',
    ],
    answer: 0,
    feedback: {
      1: 'That is cost-plus pricing. It gives away almost all of the value: the customer would happily pay more than the rival’s $40,000 for a product that saves it $25,000 more.',
      2: 'Matching the rival ignores the $20,000 of net differentiation value. It is competition-based, and it leaves the whole gain with the customer.',
      3: 'That ignores the $5,000 of training, a negative part of the differentiation value. Economic value is 40,000 + 25,000 − 5,000 = $60,000.',
    },
    solution: 'Economic value = reference value + differentiation value = 40,000 + (25,000 − 5,000) = $60,000. A value-based price sits above the alternative’s $40,000 and below $60,000, sharing the $20,000 so the customer still has a reason to switch. The $6,000 cost only sets the floor.',
  },
];
