// assess-m3.js — M02 module 3 test: Place (distribution channels and decisions). No hints; solutions shown on review.
// Lantern figures come from ./market.js (fictional). Every num item's check recomputes its answer.
const L = 'distribution-channels';

export const items = [
  {
    id: 'm02-m3-1', lesson: L, type: 'num', kind: 'numerical',
    prompt: 'Natural and specialty grocers keep 38% of the shelf price. If Lantern’s can sold there for $3.29, what would Lantern’s net price per can be? Give it to the cent.',
    answer: 2.04, check: () => 3.29 * (1 - 0.38), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 1.25, say: 'That is the trade’s share (3.29 × 0.38). Lantern receives the other 62%.' }, { value: 4.54, say: 'The margin comes out of the shelf price; it isn’t added to it.' }],
    solution: 'Net price = 3.29 × (1 − 0.38) = 3.29 × 0.62 = $2.0398 ≈ $2.04.',
  },
  {
    id: 'm02-m3-2', lesson: L, type: 'num', kind: 'numerical',
    prompt: 'Lantern sells the classic-blend can (cost of goods $0.58) through its own online shop at $3.49. Fulfilment costs $0.45 a can. What is Lantern’s gross margin per can?',
    answer: 2.46, check: () => 3.49 - 0.45 - 0.58, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 2.91, say: 'You left out fulfilment: selling direct still costs $0.45 a can to pack and deliver.' }, { value: 3.04, say: 'That is the net price after fulfilment; subtract the cost of goods too.' }],
    solution: 'Net price = 3.49 − 0.45 = $3.04; gross margin = 3.04 − 0.58 = $2.46 a can.',
  },
  {
    id: 'm02-m3-3', lesson: L, type: 'num', kind: 'numerical',
    prompt: 'Lantern plans two flavours in supermarkets ($9,000 per SKU per year) and convenience stores ($4,000 per SKU per year). What are its yearly listing fees?',
    answer: 26000, check: () => (9000 + 4000) * 2, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 13000, say: 'That is one flavour. Fees are charged per SKU, and each flavour is a SKU.' }, { value: 39000, say: 'That is three flavours. The plan has two.' }],
    solution: 'Per flavour: 9,000 + 4,000 = $13,000. Two flavours: 2 × 13,000 = $26,000 a year.',
  },
  {
    id: 'm02-m3-4', lesson: L, type: 'num', kind: 'numerical',
    prompt: 'Lantern wants to receive $2.20 per can from convenience stores, which keep 40% of the shelf price. What shelf price is needed? Give it to the cent.',
    answer: 3.67, check: () => 2.20 / (1 - 0.40), unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 3.08, say: 'You added 40% to $2.20, treating the margin as a markup. Divide by (1 − 0.40) instead.' }, { value: 5.50, say: 'You divided by 0.40, the trade’s share. Lantern’s share is 0.60.' }],
    solution: 'Shelf price = 2.20 ÷ (1 − 0.40) = 2.20 ÷ 0.60 = $3.666… ≈ $3.67. Check: 3.67 × 0.60 ≈ $2.20.',
  },
  {
    id: 'm02-m3-5', lesson: L, type: 'num', kind: 'applied',
    prompt: 'If Lantern priced the single-origin can (cost of goods $0.74) at $3.79 in supermarkets, which keep 32% of the shelf price, how many cans a year would supermarkets need to sell to cover the $9,000 listing fee for one flavour? Round up to a whole can.',
    answer: 4899, check: () => Math.ceil(9000 / (3.79 * (1 - 0.32) - 0.74)), unit: 'cans', places: 0, tol: 1,
    wrong: [{ value: 3493, say: 'You divided by the net price ($2.58). Each can also costs $0.74 to make, so divide by the gross margin.' }, { value: 2375, say: 'You divided by the shelf price. Lantern keeps only the gross margin after the trade margin and cost of goods.' }],
    solution: 'Net price = 3.79 × 0.68 = $2.5772; gross margin = 2.5772 − 0.74 = $1.8372. Cans = 9,000 ÷ 1.8372 = 4,898.8, so 4,899 cans. A higher price lowers the volume needed to cover the fee, but may also lower the volume sold.',
  },
  {
    id: 'm02-m3-6', lesson: L, type: 'classify', kind: 'conceptual',
    prompt: 'How many levels does each channel have?',
    items: [
      'A hotel sells rooms through an online travel agency.',
      'A hotel sells rooms on its own website.',
      'A winery sells to an importer, which sells to a wholesaler, which supplies wine shops that sell to drinkers.',
      'A clothing brand sells to boutiques, which sell to shoppers.',
    ],
    categories: ['Zero-level (direct)', 'One-level', 'Two-level', 'Three-level'],
    answer: [1, 0, 3, 1],
    feedback: {
      0: 'The online travel agency is one intermediary between the hotel and the guest.',
      2: 'Importer, wholesaler and wine shop: three intermediaries between the winery and the drinker.',
    },
    solution: 'Online travel agency: one-level. Own website: zero-level. Importer, wholesaler, wine shop: three-level. Boutiques: one-level.',
  },
  {
    id: 'm02-m3-7', lesson: L, type: 'mc', kind: 'conceptual',
    prompt: 'A clothing brand starts selling its full range online at 30% below the prices its partner boutiques charge. Several boutiques stop reordering. What kind of problem is this?',
    options: [
      'Vertical channel conflict: the producer and its retailers, at different levels, are competing for the same customers.',
      'Horizontal channel conflict between boutiques.',
      'A logistics failure in the brand’s warehouse.',
      'Exclusive distribution working as intended.',
    ],
    answer: 0,
    feedback: {
      1: 'Horizontal conflict is between members at the same level, such as boutique against boutique. Here the brand is undercutting its own retailers.',
      2: 'Nothing has gone wrong with storage or delivery; the dispute is about prices and customers.',
      3: 'Exclusive distribution gives a few outlets the right to sell in an area. Undercutting them online does the opposite.',
    },
    solution: 'A producer competing with its own retailers on price is the classic vertical conflict. Consistent pricing across channels, or selling different products online, reduces it.',
  },
  {
    id: 'm02-m3-8', lesson: L, type: 'mc', kind: 'applied',
    prompt: 'Which distribution intensity best fits a new, premium skincare brand that wants expert advice at the point of sale and a prestige image?',
    options: [
      'Selective or exclusive: a limited number of department stores and specialist shops whose staff can advise customers.',
      'Intensive: every supermarket, pharmacy and convenience store that will stock it.',
      'Intensive at first, then selective once the brand is known.',
      'It doesn’t matter, because promotion decides how the brand is seen.',
    ],
    answer: 0,
    feedback: {
      1: 'Intensive distribution suits products bought on impulse or habit, where availability wins. It would put a prestige brand next to bargain products with no one to advise on it.',
      2: 'Going wide first and narrowing later is hard: once a brand has been seen in discount outlets, its prestige is difficult to rebuild, and retailers who are dropped resent it.',
      3: 'Where a product is sold is part of its message. Promotion can’t make a brand feel exclusive if it is on every shelf.',
    },
    solution: 'A premium positioning and the need for advice point to selective or exclusive distribution, through outlets that present and explain the product well. Intensity must fit the positioning as well as the product class.',
  },
  {
    id: 'm02-m3-9', lesson: L, type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about trade margins are true? Select all that apply.',
    options: [
      'A 32% margin on the shelf price is equivalent to a markup of about 47% on the price the trade pays.',
      'If a distributor keeps 15% of its selling price and a retailer keeps 20% of the shelf price, together they keep 32% of the shelf price.',
      'To find the shelf price for a target net price, multiply the target by (1 + margin).',
      'Higher-margin channels need higher shelf prices for the producer to earn the same per unit.',
      'Selling direct removes all of the costs the intermediaries were covering.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'That treats the margin as a markup. Divide the target by (1 − margin).',
      4: 'Direct selling removes the trade margin but not the work: storage, packing, delivery and service still cost money (Lantern: $0.45 a can and $6,000 a year).',
    },
    solution: '0.32 ÷ 0.68 ≈ 47.1% markup. Margins compound: 1 − 0.80 × 0.85 = 0.32. Shelf price = target ÷ (1 − margin), so a higher margin needs a higher shelf price. Direct selling moves the intermediaries’ functions to the producer.',
  },
  {
    id: 'm02-m3-10', lesson: L, type: 'mc', kind: 'applied',
    prompt: 'At $3.49 with the single-origin liquid, Lantern earns per can: supermarkets $1.63, convenience stores $1.35, natural grocers $1.42 and its own shop $2.30. The categories sell 2,160,000, 1,440,000, 720,000 and 480,000 cans a year through these channels. Which conclusion is best supported?',
    options: [
      'The channels with the most shoppers leave Lantern less per can than its own shop, so reach costs margin; the right mix depends on how many cans each channel can realistically deliver after fees.',
      'Lantern should sell only through its own shop, because it earns the most per can there.',
      'Convenience stores are the best channel because they are the second largest.',
      'Margin per can doesn’t matter if a channel is large enough.',
    ],
    answer: 0,
    feedback: {
      1: 'The own shop has the best margin but reaches only people who already know Lantern: 480,000 category cans a year is the smallest pool.',
      2: 'Size isn’t everything: convenience stores also leave the least per can ($1.35) and stock two well-known rivals.',
      3: 'Margin per can multiplies volume: a large channel at a thin margin can contribute less than a smaller one, after fees and promotion.',
    },
    solution: 'The comparison shows the central trade-off of place: reach versus margin per unit. The decision needs both numbers, plus fees, rivals on the shelf and fit with the positioning.',
  },
];
