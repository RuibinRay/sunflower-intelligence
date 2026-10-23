// assess-final.js — M02 The 4Ps Marketing Mix: cumulative final assessment. 24 items, three on each lesson, eight
// conceptual, eight numerical and eight applied. No hints; solutions are shown when the student reviews it. 70% passes.
// Lantern figures come from ./market.js (fictional). Every other business and figure is fictional or hypothetical.
// Every num item's check recomputes its answer independently.
export const items = [
  // ---------------------------------------------------------------- the marketing mix and customer value
  {
    id: 'm02-fn-1', lesson: 'marketing-mix', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the sentence about Lauterborn’s 4Cs.',
    text: 'The 4Cs look at each P from the buyer’s side: product becomes [[0]], price becomes [[1]], place becomes [[2]] and promotion becomes [[3]].',
    blanks: [
      { options: ['consumer wants and needs', 'cost to satisfy', 'convenience to buy', 'communication', 'customer service'], answer: 0 },
      { options: ['consumer wants and needs', 'cost to satisfy', 'convenience to buy', 'communication', 'customer service'], answer: 1 },
      { options: ['consumer wants and needs', 'cost to satisfy', 'convenience to buy', 'communication', 'customer service'], answer: 2 },
      { options: ['consumer wants and needs', 'cost to satisfy', 'convenience to buy', 'communication', 'customer service'], answer: 3 },
    ],
    solution: 'Lauterborn (1990) turned each P round: product → consumer wants and needs; price → cost to satisfy (money, time and risk, not just the price); place → convenience to buy; promotion → communication, a two-way conversation rather than a message sent out. Customer service is not one of the four. The 4Cs change the viewpoint; the business still has to make the four P decisions.',
  },
  {
    id: 'm02-fn-2', lesson: 'marketing-mix', type: 'mc', kind: 'applied',
    prompt: 'A colleague proposes launching Lantern’s Classic blend (taste score 6, the same as Arcadia’s) at $3.79, Summit Brew’s price, in natural and specialty grocers and Lantern’s own cafés and online shop, with in-store sampling to show off the taste. Where is the misfit in this mix, and how should it be fixed?',
    options: [
      'Make the product and the price agree: use a better liquid to justify a price near Summit’s, or price the Classic blend near Arcadia’s $2.89.',
      'Add convenience stores, so that more shoppers can find the can.',
      'Spend more on social and search ads, so that more shoppers hear about the can.',
      'Launch three flavours, so that the range looks more premium.',
    ],
    answer: 0,
    feedback: {
      1: 'More outlets widen reach but leave the main contradiction in place, and convenience stores keep 40% of the shelf price, the most of any channel.',
      2: 'More advertising brings more shoppers to a can that tastes like Arcadia (6) at the price of Summit (8). The sampling would show them the gap.',
      3: 'Extra flavours add $12,000 a year of production cost plus a listing fee per flavour, and they don’t change the quality of the liquid.',
    },
    solution: 'Check each pair of decisions. Place (quality-minded natural grocers, Lantern’s own customers) and promotion (sampling) suit a premium can, and so does a $3.79 price. The product doesn’t: a taste score of 6 matches Arcadia, which sells for $2.89, and sampling lets shoppers discover that. Either upgrade the liquid (Single-origin 7.5 or Organic 8.5) to support a premium price, or keep the Classic blend and move the whole mix to a value position.',
  },
  {
    id: 'm02-fn-3', lesson: 'marketing-mix', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about the marketing mix are accurate? Select all that apply.',
    options: [
      'McCarthy grouped marketing decisions under four headings, product, price, place and promotion, in 1960.',
      'Booms and Bitner proposed adding people, process and physical evidence for services.',
      'Borden presented the marketing mix as a scientific theory of how markets work.',
      'The 4Cs replace the 4P decisions: a business that uses them no longer has to set a price or choose channels.',
      'In business markets, the services around the product and the relationship with the customer often matter as much as the item itself.',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'Borden offered the mix as a checklist to guide judgement and expected building a mix to remain largely an art.',
      3: 'The 4Cs change the viewpoint from seller to buyer; the decisions still have to be made.',
    },
    solution: 'True: McCarthy’s 4Ps (1960); Booms and Bitner’s three extra Ps for services (1981), giving the 7Ps; the weight of services and relationships in business markets, part of Grönroos’s critique. False: Borden called the mix a checklist, not a theory; and the 4Cs are a check on a 4P plan, not a replacement for its decisions.',
  },

  // ---------------------------------------------------------------- product decisions
  {
    id: 'm02-fn-4', lesson: 'product-decisions', type: 'num', kind: 'numerical',
    prompt: 'Lantern sells its Single-origin can ($0.74 a can) at $3.49 in natural and specialty grocers, which keep 38% of the shelf price. It is considering the Organic single-origin liquid ($0.88 a can) at the same shelf price, because natural-grocer shoppers pay for provenance. By what percentage would its natural-grocer volume have to rise for the Organic can to earn the same total gross margin there? Give two decimal places.',
    answer: 10.91, check: () => { const old = 3.49 * (1 - 0.38) - 0.74; const neu = 3.49 * (1 - 0.38) - 0.88; return (old / neu - 1) * 100; }, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 9.83, say: 'You divided the $0.14 extra cost by the old gross margin. The cans that must make up the difference each earn the new, lower margin of $1.2838.' },
      { value: 18.92, say: 'That is how much more the Organic liquid costs (0.14 ÷ 0.74). Volume has to make up the fall in gross margin per can, not the rise in cost.' },
      { value: 4.01, say: 'You compared the extra cost with the shelf price. Lantern’s gross margin per can is the base: 3.49 × 0.62 − cost.' },
    ],
    solution: 'Gross margin per can: Single-origin 3.49 × 0.62 − 0.74 = $1.4238; Organic 3.49 × 0.62 − 0.88 = $1.2838. To earn the same total, volume must rise by 1.4238 ÷ 1.2838 − 1 = 0.14 ÷ 1.2838 ≈ 10.91%. A better liquid pays at the same price only if it sells about 11% more cans, or if it supports a higher price.',
  },
  {
    id: 'm02-fn-5', lesson: 'product-decisions', type: 'classify', kind: 'conceptual',
    prompt: 'Name each product-line decision.',
    items: [
      'Lantern Cold Brew adds a Vanilla flavour after launch.',
      'Lantern, selling only the Single-origin can, adds a cheaper Classic-blend can.',
      'A fictional sportswear brand starts selling headphones under its own name.',
      'A fictional jeans brand with styles at $40 and $80 adds one at $60.',
      'Lantern, selling only the Single-origin can, adds a dearer Organic can.',
    ],
    categories: ['Downward stretch', 'Upward stretch', 'Line filling', 'Line extension', 'Brand extension'],
    answer: [3, 0, 4, 2, 1],
    feedback: {
      0: 'A new flavour under the same brand in a category where the brand already sells is a line extension.',
      2: 'Headphones are a new category for the brand: a brand extension, not a line decision.',
      3: 'The new style sits inside the existing $40 to $80 range, so it fills a gap rather than stretching the line.',
    },
    solution: 'Vanilla: line extension. A cheaper Classic can: downward stretch. Headphones under a sportswear name: brand extension. A $60 style between $40 and $80: line filling. A dearer Organic can: upward stretch.',
  },
  {
    id: 'm02-fn-6', lesson: 'product-decisions', type: 'mc', kind: 'conceptual',
    prompt: 'Runners buying a pair of fictional performance running shoes visit two or three shops, try several models on and compare fit, features and price before they buy. Which consumer product class are the shoes for these buyers, and what does that usually imply for place?',
    options: [
      'A shopping product: selective distribution through outlets that can advise customers and let them compare.',
      'A convenience product: intensive distribution in as many outlets as possible.',
      'A specialty product: exclusive distribution through one outlet in each city.',
      'An unsought product: personal selling to make people aware of a need they don’t think about.',
    ],
    answer: 0,
    feedback: {
      1: 'Convenience products are bought often and quickly with little comparison. These buyers compare carefully across shops.',
      2: 'Specialty buyers have a strong preference for one brand and make an effort to get it, with little comparison. These buyers are comparing.',
      3: 'Runners know they need shoes and go looking for them; unsought products are ones people don’t think about until they need them.',
    },
    solution: 'Product classes describe buying behaviour. Comparing quality, fit, features and price across shops is shopping behaviour, which suits selective distribution through outlets that present the product well and can advise.',
  },

  // ---------------------------------------------------------------- the product life cycle
  {
    id: 'm02-fn-7', lesson: 'product-life-cycle', type: 'num', kind: 'numerical',
    prompt: 'A hypothetical cold-brew brand in Harbour City sold 138,000 cans in the third quarter and 96,900 in the fourth. Harbour City’s seasonal indexes are 1.25 for the third quarter and 0.85 for the fourth. By what percentage did seasonally adjusted sales change from the third quarter to the fourth? Use a minus sign for a fall and give two decimal places.',
    answer: 3.26, check: () => ((96900 / 0.85) / (138000 / 1.25) - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: -29.78, say: 'That is the raw change. The fourth quarter is always weaker than the third; divide each quarter by its seasonal index first.' },
      { value: -52.25, say: 'You multiplied by the indexes. Seasonally adjusted sales divide each quarter’s sales by its index.' },
      { value: 3.16, say: 'Measure the change against the earlier quarter’s adjusted sales (110,400), not the later one.' },
    ],
    solution: 'Adjusted third quarter = 138,000 ÷ 1.25 = 110,400. Adjusted fourth quarter = 96,900 ÷ 0.85 = 114,000. Change = (114,000 − 110,400) ÷ 110,400 × 100 ≈ +3.26%. The raw fall of about 30% is the season; underneath it, sales grew.',
  },
  {
    id: 'm02-fn-8', lesson: 'product-life-cycle', type: 'mc', kind: 'applied',
    prompt: 'The table shows a hypothetical regional market for canned nitro coffee, a product form within ready-to-drink coffee. Average shelf prices have held steady, and most buyers are still buying it for the first time. Which stage is the form most likely in, and which decisions fit a brand that sells it?',
    data: { table: { head: ['Year', 'Cans sold (thousands)', 'Growth on the year before', 'Brands selling it'], rows: [['1', '300', '—', '2'], ['2', '900', '200%', '3'], ['3', '2,000', '122%', '5'], ['4', '3,400', '70%', '8']] } },
    options: [
      'Growth: widen distribution, add versions and features, and shift promotion from awareness towards preference for the brand.',
      'Introduction: keep one basic version, sell selectively and focus on building awareness and trial.',
      'Maturity: defend share with frequent price promotions and remind buyers of the brand.',
      'Decline: cut support to the minimum and harvest the remaining profit.',
    ],
    answer: 0,
    feedback: {
      1: 'Sales have risen more than tenfold and competitors are arriving fast. That is past introduction, when sales grow slowly and rivals are few.',
      2: 'Growth is slowing (200%, 122%, 70%), but 70% a year is far from flat, prices are holding and most buyers are new: not yet maturity.',
      3: 'Sales are rising strongly; nothing points to decline.',
    },
    solution: 'Growth rates: 900 ÷ 300 − 1 = 200%; 2,000 ÷ 900 − 1 ≈ 122%; 3,400 ÷ 2,000 − 1 = 70%. High but falling growth, many new brands, steady prices and mostly first-time buyers all point to the growth stage, probably its later part. Typical decisions: grow share while the market grows, add versions, widen distribution, and build preference for the brand before the shake-out that slowing growth warns of.',
  },
  {
    id: 'm02-fn-9', lesson: 'product-life-cycle', type: 'mc', kind: 'conceptual',
    prompt: 'Sales of a fictional brand of instant film have fallen by about 15% a year for five years. Its owner stops advertising, keeps the film only in outlets where it still makes money, holds the price for its loyal buyers and plans to collect the remaining profit for as long as it lasts. What is this strategy called?',
    options: ['Harvesting', 'Divesting', 'Line filling', 'Modifying the market'],
    answer: 0,
    feedback: {
      1: 'Divesting means selling the product or brand, or withdrawing it. This owner keeps selling it with minimal support.',
      2: 'Line filling adds items within a line’s present price range; nothing is being added here.',
      3: 'Modifying the market looks for new users, uses or regions to extend the cycle. This owner is doing the opposite: cutting support.',
    },
    solution: 'Cutting support to the minimum and collecting the remaining profit is harvesting. One caution from the criticisms of the life cycle: cutting support can make the decline self-fulfilling, so the decision should rest on evidence, not only on a chart that says the product “should” be declining.',
  },

  // ---------------------------------------------------------------- pricing approaches
  {
    id: 'm02-fn-10', lesson: 'pricing-approaches', type: 'num', kind: 'numerical',
    prompt: 'At a $3.49 shelf price, Lantern receives $2.3732 for each single-origin can sold in supermarkets, and the can costs it $0.74. Express Lantern’s gross profit per can as a markup on its cost of goods. Give a percentage to one decimal place.',
    answer: 220.7, check: () => (2.3732 - 0.74) / 0.74 * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 68.8, say: 'That is the margin on Lantern’s net price (1.6332 ÷ 2.3732). A markup divides the same profit by the cost.' },
      { value: 371.6, say: 'You used the shelf price. Lantern receives $2.3732, not $3.49.' },
      { value: 31.2, say: 'That is the cost as a share of the net price (0.74 ÷ 2.3732). The markup is profit ÷ cost.' },
    ],
    solution: 'Gross profit per can = 2.3732 − 0.74 = $1.6332. Markup = 1.6332 ÷ 0.74 ≈ 220.7%. Check with the conversion formula: margin m = 1.6332 ÷ 2.3732 ≈ 0.688, and m ÷ (1 − m) ≈ 2.207.',
  },
  {
    id: 'm02-fn-11', lesson: 'pricing-approaches', type: 'num', kind: 'numerical',
    prompt: 'A colleague proposes a value mix: the Classic blend ($0.58 a can) at $2.79, one flavour, in supermarkets (the trade keeps 32%; listing fee $9,000 a year) and convenience stores (the trade keeps 40%; listing fee $4,000 a year), with a $100,000 promotion budget and Lantern’s $60,000 launch overhead, all treated as fixed. Assume Lantern’s cans sell across the two channels in proportion to the channels’ shares of category volume (45% and 30%). How many cans a year would the plan need to break even? Round up to a whole can.',
    answer: 140889, check: () => { const s = 2.79 * 0.68 - 0.58, c = 2.79 * 0.60 - 0.58; return Math.ceil((9000 + 4000 + 100000 + 60000) / ((0.45 * s + 0.30 * c) / 0.75)); }, unit: 'cans', places: 0, tol: 0.5,
    wrong: [
      { value: 143498, say: 'You took a simple average of the two channels’ contributions. Weight them by volume: supermarkets carry 45 of every 75 cans, convenience stores 30.' },
      { value: 78281, say: 'You divided by the shelf price minus the cost. Lantern keeps only 68% or 60% of the shelf price.' },
      { value: 92026, say: 'You left out the $60,000 launch overhead. Every fixed cost the plan must cover goes into break-even.' },
    ],
    solution: 'Fixed costs = 9,000 + 4,000 + 100,000 + 60,000 = $173,000. Contribution per can: supermarkets 2.79 × 0.68 − 0.58 = $1.3172; convenience stores 2.79 × 0.60 − 0.58 = $1.094. Weighted average = (0.45 × 1.3172 + 0.30 × 1.094) ÷ 0.75 = 0.92094 ÷ 0.75 ≈ $1.2279. Break-even = 173,000 ÷ 1.2279 ≈ 140,888.7, so 140,889 cans.',
  },
  {
    id: 'm02-fn-12', lesson: 'pricing-approaches', type: 'mc', kind: 'applied',
    prompt: 'A fictional battery-storage installer is bidding in a sealed-bid tender for a hospital’s system. It estimates the job will cost it $480,000. It judges that a bid of $560,000 has a 35% chance of winning, $530,000 a 60% chance and $505,000 an 85% chance. On these estimates, which bid gives the highest expected contribution?',
    options: [
      '$530,000, with an expected contribution of 0.60 × $50,000 = $30,000.',
      '$560,000, because it earns the most if it wins.',
      '$505,000, because it is the most likely to win.',
      '$480,000, because a bid at cost can’t lose money.',
    ],
    answer: 0,
    feedback: {
      1: '$560,000 earns $80,000 if it wins, but only 35% of the time: 0.35 × 80,000 = $28,000 expected.',
      2: 'Winning more often at a thin margin: 0.85 × 25,000 = $21,250 expected.',
      3: 'A bid at cost contributes nothing even when it wins.',
    },
    solution: 'Expected contribution = probability of winning × (bid − cost). $560,000: 0.35 × 80,000 = $28,000. $530,000: 0.60 × 50,000 = $30,000. $505,000: 0.85 × 25,000 = $21,250. The $530,000 bid is best on these estimates, if the installer can accept a 40% chance of winning nothing. The probabilities are judgements, so test how sensitive the choice is to them.',
  },

  // ---------------------------------------------------------------- price, demand and pricing tactics
  {
    id: 'm02-fn-13', lesson: 'price-response', type: 'num', kind: 'numerical',
    prompt: 'A fictional seaside hotel raises its weekend room rate from $150 to $180, and weekend bookings fall from 420 to 380 a month. Nothing else changed. What is the midpoint price elasticity of demand? Give two decimal places.',
    answer: -0.55, check: () => ((380 - 420) / ((380 + 420) / 2)) / ((180 - 150) / ((180 + 150) / 2)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: -0.48, say: 'You used the starting values (the point formula). The midpoint formula divides each change by the average: −40 ÷ 400 and 30 ÷ 165.' },
      { value: 0.55, say: 'Bookings fell as the rate rose, so the elasticity is negative.' },
      { value: -1.82, say: 'You divided the price change by the quantity change. Elasticity is %ΔQ ÷ %ΔP.' },
    ],
    solution: '%ΔQ = −40 ÷ 400 = −10%. %ΔP = 30 ÷ 165 ≈ 18.18%. E = −10 ÷ 18.18 ≈ −0.55: inelastic, so revenue rises, from $63,000 to $68,400 a month.',
  },
  {
    id: 'm02-fn-14', lesson: 'price-response', type: 'num', kind: 'applied',
    prompt: 'Lantern sells its single-origin can (cost of goods $0.74) at $3.49 in natural and specialty grocers, which keep 38% of the shelf price. If it cut the shelf price to $3.19, by what percentage would its natural-grocer volume need to rise to keep contribution unchanged? Give two decimal places.',
    answer: 15.03, check: () => { const cm = 3.49 * 0.62 - 0.74; const dP = (3.19 - 3.49) * 0.62; return -dP / (cm + dP) * 100; }, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 26.70, say: 'You used the shelf-price cut of $0.30. Lantern bears only 62% of it: its net price falls by 0.30 × 0.62 = $0.186.' },
      { value: 13.06, say: 'You divided by the old contribution per can. After the cut each can contributes 1.4238 − 0.186 = $1.2378, so divide by that.' },
      { value: 8.60, say: 'That is the percentage price cut. Volume must rise by much more, because the cut comes out of a contribution of $1.42, not out of the whole price.' },
    ],
    solution: 'Old contribution per can = 3.49 × 0.62 − 0.74 = $1.4238. Lantern’s net price falls by 0.30 × 0.62 = $0.186, so the new contribution is $1.2378. Required volume change = 0.186 ÷ 1.2378 ≈ 15.03%. Unless the cut raises natural-grocer volume by more than about 15%, it lowers contribution.',
  },
  {
    id: 'm02-fn-15', lesson: 'price-response', type: 'mc', kind: 'applied',
    prompt: 'A fictional online homeware shop earns a 40% contribution margin ratio on a range of lamps. In a randomised test, a 10% price cut raised the number of lamps sold by 22%. Should it make the cut permanent?',
    options: [
      'No: revenue rises by about 9.8%, but volume needed to rise by about 33.3% to keep contribution unchanged, so contribution falls by about 8.5%.',
      'Yes: demand is elastic (about −2.2), so the cut raises revenue.',
      'Yes: volume rose by more than twice the price cut.',
      'No: a price cut always lowers revenue.',
    ],
    answer: 0,
    feedback: {
      1: 'Elastic demand guarantees more revenue, not more contribution. Each lamp now contributes 30% of the old price instead of 40%.',
      2: 'The test that matters compares the volume gain with the required gain, 10 ÷ (40 − 10) = 33.3%, not with the size of the price cut.',
      3: 'With elastic demand a cut raises revenue, as it does here (0.90 × 1.22 = 1.098).',
    },
    solution: 'Revenue: 0.90 × 1.22 = 1.098, up 9.8%. Required volume change = 10 ÷ (40 − 10) ≈ 33.3%. Per $100 of the old price, each lamp contributed $40 and now contributes $30, so total contribution becomes 1.22 × 30 ÷ 40 = 0.915 of what it was: down 8.5%. Keep the old price, or look for a cut that is fenced to price-sensitive buyers.',
  },

  // ---------------------------------------------------------------- distribution channels
  {
    id: 'm02-fn-16', lesson: 'distribution-channels', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s single-origin can (cost of goods $0.74) sold for $3.69 in convenience stores. The store keeps 25% of the shelf price, and the distributor keeps 20% of the price it sells to the store at. What is Lantern’s gross margin per can? Give it to the cent.',
    answer: 1.47, check: () => 3.69 * (1 - 0.25) * (1 - 0.20) - 0.74, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 1.29, say: 'You added the margins (25% + 20% = 45%). Each level takes its share of its own selling price, so the margins compound: 1 − 0.75 × 0.80 = 40%.' },
      { value: 2.21, say: 'That is Lantern’s net price. Subtract the $0.74 cost of goods.' },
      { value: 2.95, say: 'That subtracts only the cost from the shelf price. The store and the distributor are paid out of the shelf price first.' },
    ],
    solution: 'The store pays 3.69 × 0.75 = $2.7675. The distributor pays Lantern 2.7675 × 0.80 = $2.214. Gross margin = 2.214 − 0.74 = $1.474 ≈ $1.47 a can. Together the trade keeps 1 − 0.75 × 0.80 = 40% of the shelf price, the market file’s figure for convenience stores.',
  },
  {
    id: 'm02-fn-17', lesson: 'distribution-channels', type: 'mc', kind: 'applied',
    prompt: 'Lantern sells the single-origin can (cost of goods $0.74) at $3.49, one flavour, in supermarkets and its own cafés and online shop. It can support one more retail channel this year. Its sales team’s hypothetical estimates of extra cans in the first year are in the table. Which channel should it add, judged by gross margin after the listing fee and by fit with its café-quality positioning?',
    data: { table: { head: ['Channel', 'Trade margin', 'Listing fee per flavour', 'Estimated extra cans (hypothetical)'], rows: [['Natural and specialty grocers', '38%', '$2,000', '32,000'], ['Convenience stores', '40%', '$4,000', '33,000']] } },
    options: [
      'Natural and specialty grocers: about $43,562 after the fee against about $40,682, and their shoppers pay for quality and provenance.',
      'Convenience stores: they sell twice as many category cans as natural grocers, so they must add more.',
      'Convenience stores: 33,000 extra cans is more than 32,000.',
      'Neither: the listing fees make any new retail channel unprofitable.',
    ],
    answer: 0,
    feedback: {
      1: 'The category’s size in a channel isn’t Lantern’s sales there. On the team’s estimates, convenience stores bring only 1,000 more cans, at a thinner margin and a higher fee.',
      2: 'Cans aren’t contribution. Each convenience can earns 3.49 × 0.60 − 0.74 = $1.354, against $1.4238 in natural grocers, and the fee is twice as high.',
      3: 'Both fees are small next to the gross margin the estimated cans would earn: natural grocers cover their $2,000 fee with about 1,405 cans.',
    },
    solution: 'Natural grocers: 32,000 × (3.49 × 0.62 − 0.74) − 2,000 = 32,000 × 1.4238 − 2,000 ≈ $43,562. Convenience stores: 33,000 × (3.49 × 0.60 − 0.74) − 4,000 = 33,000 × 1.354 − 4,000 = $40,682. Natural grocers win on the numbers and fit the single-origin positioning; convenience stores, where impulse buyers grab brands they know, can follow once the can has proved it sells.',
  },
  {
    id: 'm02-fn-18', lesson: 'distribution-channels', type: 'classify', kind: 'conceptual',
    prompt: 'Which family of channel functions does each activity belong to?',
    items: [
      'A distributor buys a pallet of cans and bears the loss if they don’t sell.',
      'A retailer breaks cases into single cans on a chilled shelf.',
      'A supermarket pays for deliveries 30 days after receiving them.',
      'A distributor tells Lantern which stores sell the most cans each week.',
      'A wholesaler’s trucks carry cans to stores along with other brands.',
      'A store’s buyer negotiates the terms on which it will sell the can.',
    ],
    categories: ['Transactional', 'Logistical', 'Facilitating'],
    answer: [0, 1, 2, 2, 1, 0],
    feedback: {
      0: 'Buying the goods and bearing the risk of not selling them are transactional functions.',
      2: 'Paying later means the supplier is lending the retailer money: financing, a facilitating function.',
      3: 'Passing on sales information is a facilitating function.',
    },
    solution: 'Transactional: buying, selling and bearing risk (the distributor that owns the pallet, the buyer negotiating terms). Logistical: handling, storing, transporting and breaking bulk (cases into cans, the trucks). Facilitating: financing and information (payment after 30 days, sales data). Removing an intermediary moves these functions to someone else; it doesn’t remove them.',
  },

  // ---------------------------------------------------------------- the promotion mix
  {
    id: 'm02-fn-19', lesson: 'promotion-mix', type: 'mc', kind: 'applied',
    prompt: 'Halfway through Lantern’s launch year (hypothetical figures), a survey shows that awareness among category buyers has risen from 12% to about 24%, but few of the shoppers who know the brand have tried a can. Stores report that shoppers pick the can up, look at the $3.49 price and put it back. Which promotion vehicle should get more of the remaining budget?',
    options: [
      'In-store sampling and displays: they turn awareness into trial at the shelf, where the hesitation happens.',
      'Social and search ads: more awareness is always the first priority.',
      'Trade promotions: deep, frequent price cuts until shoppers buy.',
      'PR and events: earned coverage builds awareness slowly and cheaply.',
    ],
    answer: 0,
    feedback: {
      1: 'Awareness has doubled; the bottleneck has moved to trial. More ads would add awareness where the problem is conversion.',
      2: 'A few planned price windows can help trial, but frequent deep cuts lower shoppers’ reference price and contradict a café-quality positioning.',
      3: 'PR builds awareness and credibility over time, but the problem is at the shelf, now.',
    },
    solution: 'Find the bottleneck stage: attention has improved, action (trial) hasn’t. For a low-involvement product, tasting forms the preference, so sampling and displays at the shelf, where shoppers hesitate over the price, are the tool that fits. Measure the result with a store holdout rather than by counting tastings.',
  },
  {
    id: 'm02-fn-20', lesson: 'promotion-mix', type: 'order', kind: 'conceptual',
    prompt: 'Put the six steps of Lavidge and Steiner’s (1961) hierarchy-of-effects model in the order the model proposes.',
    items: ['Awareness', 'Knowledge', 'Liking', 'Preference', 'Conviction', 'Purchase'],
    solution: 'Awareness → knowledge (thinking), liking → preference (feeling), conviction → purchase (doing). Remember the evidence: reviews find little support for a fixed sequence, and for cheap, low-risk products trial often comes before liking.',
  },
  {
    id: 'm02-fn-21', lesson: 'promotion-mix', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand forecasts revenue of $2,400,000 next year. Its costs other than promotion are expected to be $2,150,000, and its owners want a profit of $160,000. How much larger is a promotion budget of 5% of forecast sales than the budget the affordable method gives?',
    answer: 30000, check: () => 0.05 * 2400000 - (2400000 - 2150000 - 160000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 120000, say: 'That is the percentage-of-sales budget itself. Subtract the affordable budget.' },
      { value: 90000, say: 'That is the affordable budget: what is left after other costs and the profit target. The question asks for the difference.' },
      { value: 250000, say: 'That is revenue minus other costs. The affordable method also sets aside the $160,000 profit target.' },
    ],
    solution: 'Percentage of sales: 0.05 × 2,400,000 = $120,000. Affordable: 2,400,000 − 2,150,000 − 160,000 = $90,000. Difference: $30,000. Neither method asks what the promotion must achieve; the objective-and-task method does.',
  },

  // ---------------------------------------------------------------- measuring the mix
  {
    id: 'm02-fn-22', lesson: 'measuring-the-mix', type: 'num', kind: 'numerical',
    prompt: 'A fictional online kitchenware shop emails an offer to 50,000 past customers, but holds out a random 5,000 of them. Of the 45,000 who get the email, 2.4% place an order; of the 5,000 held out, 1.6% order anyway. Orders average $46, and the email costs $4,500 to run. If every order from an emailed customer is credited to the email, as the shop’s analytics do, what is the campaign’s ROAS?',
    answer: 11.04, check: () => 45000 * 0.024 * 46 / 4500, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 3.68, say: 'That uses only the incremental orders. The question asks for ROAS as the analytics report it, on all credited orders.' },
      { value: 10.04, say: 'ROAS is revenue ÷ spend, not (revenue − spend) ÷ spend.' },
    ],
    solution: 'Credited orders = 45,000 × 0.024 = 1,080. Credited revenue = 1,080 × 46 = $49,680. ROAS = 49,680 ÷ 4,500 = 11.04.',
  },
  {
    id: 'm02-fn-23', lesson: 'measuring-the-mix', type: 'num', kind: 'applied',
    prompt: 'The same email campaign: 45,000 customers emailed (2.4% ordered), 5,000 randomly held out (1.6% ordered), orders averaging $46, a cost of $4,500. The shop keeps 30% of each order as contribution. Using the holdout group to measure incrementality, what is the campaign’s marketing ROI? Give a percentage to one decimal place.',
    answer: 10.4, check: () => (45000 * (0.024 - 0.016) * 46 * 0.30 - 4500) / 4500 * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: 231.2, say: 'That treats every credited order as incremental. The holdout shows that 1.6% of customers order without the email.' },
      { value: 268, say: 'That uses incremental revenue. ROI needs incremental contribution: 30% of the revenue.' },
      { value: 110.4, say: 'That is contribution ÷ cost. ROI subtracts the cost first: (4,968 − 4,500) ÷ 4,500.' },
    ],
    solution: 'Incremental orders = 45,000 × (0.024 − 0.016) = 360. Incremental contribution = 360 × 46 × 0.30 = $4,968. ROI = (4,968 − 4,500) ÷ 4,500 ≈ 10.4%. A ROAS of 11.04 and an ROI of about 10% describe the same campaign: most credited orders would have happened anyway.',
  },
  {
    id: 'm02-fn-24', lesson: 'measuring-the-mix', type: 'multi', kind: 'conceptual',
    prompt: 'Which pieces of evidence can show that a marketing activity caused a difference in sales? Select all that apply.',
    options: [
      'Thirty randomly chosen stores got sampling days and thirty others didn’t; the sampled stores sold more.',
      'Half the email list, chosen at random, got one subject line and the other half another; one half ordered more.',
      'The ad platform credits $40,000 of sales to clicks on the ads under last-click attribution.',
      'Sales were 25% higher in the quarter the campaign ran than in the quarter before.',
      'Customers who opened the emails bought more than customers who didn’t.',
    ],
    answer: [0, 1],
    feedback: {
      2: 'Attribution divides credit for sales that happened; it can’t say which of them would have happened without the ads.',
      3: 'A before-and-after comparison mixes the campaign with the season and everything else that changed between quarters.',
      4: 'People who open emails are already more engaged: a selection problem, not evidence of an effect.',
    },
    solution: 'Only random assignment makes the groups alike on average, so that the remaining difference can be credited to the activity: the store holdout and the A/B test. Attribution reports, before-and-after comparisons and comparisons of self-selected groups show correlation, not causation.',
  },
];
