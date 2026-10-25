// assess-m2.js — M02 module 2 test (Price): pricing-approaches and price-response.
// No hints; solutions are shown when the student reviews the test. Every number is recomputed by `check`.
// Lantern figures come from ./market.js; every other business is fictional.
export const items = [
  {
    id: 'm02-m2-1', lesson: 'pricing-approaches', type: 'num', kind: 'numerical',
    prompt: 'A furniture retailer (fictional) prices its sofas with a 150% markup on cost. What margin on price does that give?',
    answer: 60, check: () => 1.5 / (1 + 1.5) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 150, say: 'That is the markup. The margin divides the same profit by the price: markup ÷ (1 + markup).' }, { value: 40, say: '40% is the cost’s share of the price (1 ÷ 2.5). The margin is the profit’s share, 1.5 ÷ 2.5.' }],
    solution: 'Margin = markup ÷ (1 + markup) = 1.5 ÷ 2.5 = 60%. Check with a $100 cost: price $250, profit $150, margin 150 ÷ 250 = 60%.',
  },
  {
    id: 'm02-m2-2', lesson: 'pricing-approaches', type: 'num', kind: 'applied',
    prompt: 'Suppose Lantern launched its single-origin can ($0.74 a can) in supermarkets only, at a $3.49 shelf price, in one flavour. Supermarkets and the distributor keep 32% of the shelf price. Fixed costs would be the supermarket listing fee of $9,000, the $120,000 promotion budget and the $60,000 launch overhead. How many cans must Lantern sell in the year to break even? Round up to a whole can.',
    answer: 115724, check: () => Math.ceil((9000 + 120000 + 60000) / (3.49 * (1 - 0.32) - 0.74)), unit: 'cans', places: 0, tol: 0.5,
    wrong: [
      { value: 68728, say: 'You used the shelf price. Lantern receives only 68% of $3.49, so its contribution is 2.3732 − 0.74 = $1.6332 a can, not $2.75.' },
      { value: 79640, say: 'You divided by Lantern’s net price without subtracting the $0.74 cost per can. Break-even divides fixed costs by contribution per can.' },
    ],
    solution: 'Fixed costs = 9,000 + 120,000 + 60,000 = $189,000. Lantern’s net price = 3.49 × 0.68 = $2.3732; contribution per can = 2.3732 − 0.74 = $1.6332. Break-even = 189,000 ÷ 1.6332 ≈ 115,723.7, so 115,724 cans.',
  },
  {
    id: 'm02-m2-3', lesson: 'pricing-approaches', type: 'mc', kind: 'conceptual',
    prompt: 'A manager sets every price as average cost per unit plus 30%, where average cost includes fixed costs spread over last year’s volume. Sales fall this year. What is the main danger in this method?',
    options: [
      'With lower volume the average cost rises, so the method calls for a higher price, which can cut volume further.',
      'A 30% markup always gives a 30% margin, so the business earns less than it thinks.',
      'Cost-plus pricing is illegal in most markets.',
      'Fixed costs fall when volume falls, so the price will be too high.',
    ],
    answer: 0,
    feedback: {
      1: 'A 30% markup gives a margin of 0.30 ÷ 1.30 ≈ 23.1%, so that statement is false; and it is not the danger the question asks about.',
      2: 'Cost-plus pricing is legal and common; its weakness is that it ignores demand, not that it breaks the law.',
      3: 'Fixed costs stay the same in total when volume falls; spread over fewer units, they rise per unit.',
    },
    solution: 'Average cost depends on volume, and volume depends on price. When sales fall, fixed costs are spread over fewer units, average cost rises, and a cost-plus rule raises the price, which can reduce sales further. Treat fixed costs as a total to be covered, and set price with demand in view.',
  },
  {
    id: 'm02-m2-4', lesson: 'pricing-approaches', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer’s home system costs it $6,300 to supply and fit. It wants a 30% margin on price. What price should it quote?',
    answer: 9000, check: () => 6300 / (1 - 0.3), unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 8190, say: 'That adds 30% to the cost: a 30% markup, which is only a 23.1% margin. For a margin target, divide the cost by (1 − margin).' }],
    solution: 'Price = cost ÷ (1 − margin) = 6,300 ÷ 0.70 = $9,000. Check: profit $2,700, and 2,700 ÷ 9,000 = 30%.',
  },
  {
    id: 'm02-m2-5', lesson: 'pricing-approaches', type: 'mc', kind: 'applied',
    prompt: 'A fictional print supplier is bidding to replace a customer’s current printer, which charges $12,000 a year. The new supplier delivers two days faster, which the customer values at $3,000 a year, but switching needs $1,000 of set-up work by the customer in the first year. Serving the account costs the supplier $7,000 a year. Which first-year quote captures part of the value while leaving the customer a reason to switch?',
    options: ['$13,000', '$8,400', '$14,500', '$11,000'],
    answer: 0,
    feedback: {
      1: '$8,400 is cost plus 20%. It gives the whole $2,000 of net extra value, and $3,600 more, away to the customer.',
      2: 'Economic value is 12,000 + 3,000 − 1,000 = $14,000. At $14,500 the customer would be worse off than staying with its current printer.',
      3: '$11,000 undercuts the current printer even though the supplier offers more value. It is profitable but gives away more than it needs to.',
    },
    solution: 'Economic value = reference value + differentiation value = 12,000 + (3,000 − 1,000) = $14,000. The cost floor is $7,000. A quote of $13,000 sits above the alternative’s price and below economic value: the supplier captures $1,000 of the differentiation value and the customer keeps $1,000 as its reason to switch.',
  },
  {
    id: 'm02-m2-6', lesson: 'price-response', type: 'num', kind: 'numerical',
    prompt: 'A product’s price rises from $4 to $5, and weekly sales fall from 1,200 to 900 units. What is the midpoint price elasticity of demand? Give two decimal places.',
    answer: -1.29, check: () => ((900 - 1200) / ((900 + 1200) / 2)) / ((5 - 4) / ((5 + 4) / 2)), unit: '', places: 2, tol: 0.01,
    wrong: [{ value: -1, say: 'You used the starting values (−25% ÷ 25%). The midpoint formula divides each change by the average: −300 ÷ 1,050 and 1 ÷ 4.5.' }, { value: 1.29, say: 'Sales fell as the price rose, so the elasticity is negative.' }],
    solution: 'Quantity change = −300 ÷ 1,050 ≈ −28.57%. Price change = 1 ÷ 4.5 ≈ 22.22%. E ≈ −28.57 ÷ 22.22 ≈ −1.29: elastic, and revenue falls from $4,800 to $4,500.',
  },
  {
    id: 'm02-m2-7', lesson: 'price-response', type: 'num', kind: 'applied',
    prompt: 'A fictional clothing brand earns a 55% contribution margin ratio on its jackets. It plans a 15%-off sale. By what percentage must jacket sales rise during the sale to keep total contribution unchanged?',
    answer: 37.5, check: () => 15 / (55 - 15) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [{ value: 27.27, say: 'You divided by the old contribution margin (15 ÷ 55). During the sale each jacket contributes 40% of the old price, so divide by 40.' }, { value: 15, say: 'Selling 15% more would roughly keep revenue unchanged, but each jacket now contributes much less.' }],
    solution: 'Required change = −ΔP ÷ (CM + ΔP) = 15 ÷ (55 − 15) = 15 ÷ 40 = 37.5%.',
  },
  {
    id: 'm02-m2-8', lesson: 'price-response', type: 'mc', kind: 'conceptual',
    prompt: 'A firm faces inelastic demand for its product and raises the price by 5%. Its variable cost per unit and its fixed costs don’t change. What happens to revenue, and what does that tell you about profit?',
    options: [
      'Revenue rises, and because fewer units are sold, variable costs fall too, so contribution rises as well.',
      'Revenue falls, because fewer units are sold.',
      'Revenue rises, but profit could still fall, because profit depends on costs and the firm now sells fewer units.',
      'Revenue is unchanged, because the price and quantity changes cancel out.',
    ],
    answer: 0,
    feedback: {
      1: 'With inelastic demand, quantity falls by a smaller percentage than the price rises, so revenue rises.',
      2: 'Profit could fall only if costs rose, and the question holds them constant. With a higher price, fewer units and the same variable cost per unit, contribution rises: each remaining unit earns more and total variable costs fall.',
      3: 'Revenue is unchanged only at unit elasticity.',
    },
    solution: 'Inelastic demand: quantity falls by less than 5%, so revenue rises. Total variable costs fall with the lower volume, so contribution (revenue minus variable costs) rises too, provided fixed costs and the variable cost per unit are unchanged.',
  },
  {
    id: 'm02-m2-9', lesson: 'price-response', type: 'classify', kind: 'conceptual',
    prompt: 'Name the pricing tactic in each case.',
    items: [
      'A cinema charges students less on weekday afternoons.',
      'A software firm sells its three apps together for less than the sum of their prices.',
      'A bakery prices a loaf at $3.99 rather than $4.00.',
      'A new streaming service launches at a low monthly price to build its subscriber base quickly.',
      'An airline charges more for a refundable ticket than for a non-refundable one on the same flight.',
    ],
    categories: ['Psychological pricing', 'Bundling', 'Price discrimination', 'Penetration pricing'],
    answer: [2, 1, 0, 3, 2],
    feedback: {
      0: 'The same film costs the cinema the same to show to anyone: charging a price-sensitive segment less is price discrimination (segmented pricing).',
      4: 'The seat costs the same to fly either way. The refund condition is a fence that separates travellers who need flexibility from those who will pay less to give it up: price discrimination.',
    },
    solution: 'Student afternoons and refundable versus non-refundable fares: price discrimination, with a student card and a refund condition as fences. Three apps together: bundling. $3.99: psychological (charm) pricing. A low launch price to build a base: penetration pricing.',
  },
  {
    id: 'm02-m2-10', lesson: 'price-response', type: 'num', kind: 'applied',
    prompt: 'Lantern sells its single-origin can at $3.49 in supermarkets, where the trade keeps 32% of the shelf price and each can costs Lantern $0.74. Suppose it raised the shelf price to $3.79, Summit Brew’s price. What percentage change in supermarket volume would leave Lantern’s supermarket contribution unchanged? Use a minus sign for a fall and give two decimal places.',
    answer: -11.10, check: () => { const cm = 3.49 * 0.68 - 0.74; const dP = (3.79 - 3.49) * 0.68; return -dP / (cm + dP) * 100; }, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: -15.52, say: 'You used the shelf-price change of $0.30. Lantern receives only 68% of it: its net price rises by 0.30 × 0.68 = $0.204.' },
      { value: -12.49, say: 'You divided by the old contribution per can. After the rise each can contributes 1.6332 + 0.204 = $1.8372, so divide by that.' },
    ],
    solution: 'Lantern’s net price rises by 0.30 × 0.68 = $0.204, and its contribution per can from $1.6332 to $1.8372. Volume change that keeps contribution unchanged = −0.204 ÷ 1.8372 ≈ −11.10%. If fewer than about 11% of supermarket cans are lost, the rise adds contribution.',
  },
];
