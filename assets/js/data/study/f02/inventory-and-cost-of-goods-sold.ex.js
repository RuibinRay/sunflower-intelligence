// inventory-and-cost-of-goods-sold.ex.js — F02 · Inventory and cost of goods sold: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern's figures come from case.js; its 2027 events are hypothetical (“Suppose…”); other businesses are fictional.
import { FACTS, HOUSE_BLEND_Q4 as HB, COSTING as C } from './case.js';

const money = (x, d = 2) => `${x < -0.004 ? '−' : ''}$${Math.abs(Math.round(x * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
/** Cost of n units taken from layers [{units, cost}] in the order given. */
const take = (order, n) => { let left = n, cost = 0; for (const l of order) { const q = Math.min(left, l.units); cost += q * l.cost; left -= q; if (left <= 0) break; } return cost; };
const INV_ACCOUNTS = ['Inventory', 'Cost of Goods Sold', 'Accounts Payable', 'Cash', 'Online Sales Revenue', 'Sales Returns and Allowances', 'Shipping Expense', 'Supplies'];

export const widgets = {
  'inv-costing': {
    type: 'formula',
    title: 'FIFO, LIFO and weighted average as purchase costs change',
    intro: 'Lantern’s House Blend quarter: 300 bags in stock, then deliveries of 600, 900 and 1,200 bags (periodic formulas).',
    inputs: [
      { id: 'c0', label: 'Cost a bag: opening stock (300 bags)', min: 5, max: 13, step: 0.05, value: HB.opening.cost, fmt: 'money' },
      { id: 'c1', label: 'Cost a bag: 12 October (600 bags)', min: 5, max: 13, step: 0.05, value: HB.purchases[0].cost, fmt: 'money' },
      { id: 'c2', label: 'Cost a bag: 9 November (900 bags)', min: 5, max: 13, step: 0.05, value: HB.purchases[1].cost, fmt: 'money' },
      { id: 'c3', label: 'Cost a bag: 3 December (1,200 bags)', min: 5, max: 13, step: 0.05, value: HB.purchases[2].cost, fmt: 'money' },
      { id: 'sold', label: 'Bags sold in the quarter', min: 0, max: 3000, step: 50, value: HB.sold, fmt: 'int', unit: 'bags' },
    ],
    compute: (v) => {
      const L = [HB.opening, ...HB.purchases].map((l, i) => ({ units: l.units, cost: v[`c${i}`] }));
      const units = L.reduce((s, l) => s + l.units, 0);
      const pool = L.reduce((s, l) => s + l.units * l.cost, 0);
      const end = units - v.sold;
      const fifo = take(L, v.sold), lifo = take([...L].reverse(), v.sold), avg = pool / units * v.sold;
      const diff = lifo - fifo;
      const t = FACTS.tax.rate;
      const order = diff > 0.005 ? 'Costs are rising overall: LIFO puts the newest, dearest costs into cost of goods sold, so it reports the lowest gross profit and pays the least tax, and leaves the oldest costs in inventory.'
        : diff < -0.005 ? 'Costs are falling overall: the order reverses, and FIFO now gives the highest cost of goods sold and the lowest profit.'
        : (v.sold === 0 || end === 0 ? 'With nothing sold, or everything sold, the formulas can’t differ: the whole pool lands in one place.' : 'The layers cost the same where it matters, so the three formulas agree.');
      return {
        headline: { label: 'LIFO minus FIFO cost of goods sold', value: money(diff) },
        rows: [
          ['Goods available (3,000 bags)', money(pool)],
          ['Cost of goods sold: FIFO', money(fifo)],
          ['Cost of goods sold: weighted average', money(avg)],
          ['Cost of goods sold: LIFO', money(lifo)],
          [`Ending inventory (${end.toLocaleString('en-US')} bags): FIFO / average / LIFO`, `${money(pool - fifo)} / ${money(pool - avg)} / ${money(pool - lifo)}`],
          [`Income tax under LIFO vs FIFO at ${Math.round(t * 100)}%`, money(-t * diff)],
        ],
        note: order,
        chart: { kind: 'bar', x: { label: 'Cost formula', values: ['FIFO', 'Weighted average', 'LIFO'] },
          series: [
            { name: 'Cost of goods sold', values: [fifo, avg, lifo].map((x) => Math.round(x * 100) / 100) },
            { name: 'Ending inventory', values: [pool - fifo, pool - avg, pool - lifo].map((x) => Math.round(x * 100) / 100) },
          ], y: { label: 'Dollars' } },
      };
    },
  },
  'inv-nrv': {
    type: 'formula',
    title: 'A write-down and a recovery: IFRS and US GAAP',
    intro: 'Goods are written down to net realisable value at the end of year 1 and are still held when their value changes in year 2.',
    inputs: [
      { id: 'cost', label: 'Cost', min: 100, max: 5000, step: 50, value: 1000, fmt: 'money' },
      { id: 'nrv1', label: 'Net realisable value at the end of year 1', min: 0, max: 5000, step: 50, value: 600, fmt: 'money' },
      { id: 'nrv2', label: 'Net realisable value in year 2', min: 0, max: 5000, step: 50, value: 800, fmt: 'money' },
    ],
    compute: (v) => {
      const c1 = Math.min(v.cost, v.nrv1), wd = v.cost - c1;
      const ifrs2 = Math.min(v.cost, v.nrv2), us2 = Math.min(c1, v.nrv2);
      const rev = Math.max(0, ifrs2 - c1);
      const note = wd === 0
        ? 'Net realisable value is at or above cost at the end of year 1, so there is no write-down: the goods stay at cost.'
        : v.nrv2 > c1
          ? `Value recovers in year 2. IFRS reverses ${money(rev, 0)} of the ${money(wd, 0)} write-down${v.nrv2 >= v.cost ? ', the whole of it, but never above cost' : ''}; US GAAP keeps ${money(c1, 0)} as the new cost and shows the recovery only as profit when the goods are sold.`
          : v.nrv2 < c1 ? 'Value falls further in year 2, so both frameworks write the goods down again.' : 'Value is unchanged in year 2, so neither framework adjusts.';
      return {
        headline: { label: 'Carrying amount in year 2: IFRS / US GAAP', value: `${money(ifrs2, 0)} / ${money(us2, 0)}` },
        rows: [
          ['Write-down at the end of year 1', money(wd, 0)],
          ['Carrying amount at the end of year 1', money(c1, 0)],
          ['IFRS: reversal in year 2', money(rev, 0)],
          ['Further write-down in year 2 (both)', money(Math.max(0, c1 - v.nrv2), 0)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Point in time', values: ['Cost', 'End of year 1', 'Year 2: IFRS', 'Year 2: US GAAP'] },
          series: [{ name: 'Carrying amount', values: [v.cost, c1, ifrs2, us2] }], y: { label: 'Dollars' } },
      };
    },
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'f02-inv-g1', type: 'steps', kind: 'numerical',
    prompt: 'Lindenmoor Books, a fictional bookshop, uses a periodic system. For the year: beginning inventory $14,000; purchases $86,000; freight-in on purchases $2,000; purchase returns $1,500; ending inventory from the count $18,500; net sales $150,000.',
    solution: 'Goods available = 14,000 + 86,000 + 2,000 − 1,500 = 100,500. COGS = 100,500 − 18,500 = 82,000. Gross profit = 150,000 − 82,000 = 68,000; gross margin = 68,000 ÷ 150,000 ≈ 45.3%.',
    steps: [
      { id: 'f02-inv-g1-s1', type: 'num', prompt: 'What is the cost of goods available for sale?',
        answer: 100500, check: () => 14000 + 86000 + 2000 - 1500, unit: '$', places: 0, tol: 0.5,
        hints: ['Start from beginning inventory and add net purchases.', 'Freight-in is part of the cost of purchases; returns reduce it.'],
        wrong: [
          { value: 100000, say: 'Freight-in is a cost of getting the books to the shop: add it to purchases.' },
          { value: 103500, say: 'Purchase returns reduce purchases: subtract the $1,500.' },
        ],
        solution: '14,000 + 86,000 + 2,000 − 1,500 = $100,500.' },
      { id: 'f02-inv-g1-s2', type: 'num', prompt: 'What is cost of goods sold?',
        answer: 82000, check: () => 100500 - 18500, unit: '$', places: 0, tol: 0.5,
        hints: ['Goods available either were sold or are still on the shelves.'],
        wrong: [{ value: 119000, say: 'Ending inventory is subtracted from goods available, not added.' }],
        solution: '100,500 − 18,500 = $82,000.' },
      { id: 'f02-inv-g1-s3', type: 'num', prompt: 'What is the gross margin, as a percentage of net sales? Give one decimal place.',
        answer: 45.3, check: () => (150000 - 82000) / 150000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Gross profit = net sales − cost of goods sold.', 'Divide gross profit by net sales.'],
        wrong: [{ value: 54.7, say: 'That is cost of goods sold as a share of sales. The gross margin is what is left: gross profit ÷ net sales.' }],
        solution: 'Gross profit 150,000 − 82,000 = 68,000; 68,000 ÷ 150,000 = 0.4533, about 45.3%.' },
    ],
  },
  {
    id: 'f02-inv-g2', type: 'steps', kind: 'numerical',
    prompt: 'Emberline Stoves, a fictional dealer, starts the year with 10 wood stoves costing $400 each. It buys 20 stoves at $420 and later 30 at $450, and sells 45 stoves during the year. It uses periodic records.',
    solution: 'Pool: 60 stoves costing 4,000 + 8,400 + 13,500 = 25,900; 15 left. FIFO COGS = 4,000 + 8,400 + 15 × 450 = 19,150. LIFO ending = 5 × 420 + 10 × 400 = 6,100 (COGS 19,800). Average = 25,900 ÷ 60 = 431.67; COGS = 45 × 431.67 ≈ 19,425.',
    steps: [
      { id: 'f02-inv-g2-s1', type: 'num', prompt: 'What is cost of goods sold under FIFO?',
        answer: 19150, check: () => 10 * 400 + 20 * 420 + 15 * 450, unit: '$', places: 0, tol: 0.5,
        hints: ['FIFO sells the oldest stoves first: all 10 at $400, then the 20 at $420.', 'That covers 30 of the 45; the other 15 come from the $450 layer.'],
        wrong: [{ value: 19800, say: 'That is LIFO: the newest layer first. FIFO starts with the opening stock.' }],
        solution: '10 × 400 + 20 × 420 + 15 × 450 = 4,000 + 8,400 + 6,750 = $19,150.' },
      { id: 'f02-inv-g2-s2', type: 'num', prompt: 'What is ending inventory under LIFO?',
        answer: 6100, check: () => 5 * 420 + 10 * 400, unit: '$', places: 0, tol: 0.5,
        hints: ['Under LIFO the 15 stoves left carry the oldest costs.', 'The oldest 15: the 10 at $400 and 5 of the 20 at $420.'],
        wrong: [{ value: 6750, say: 'That is FIFO’s ending inventory (15 × $450). LIFO leaves the oldest costs on the balance sheet.' }],
        solution: '10 × 400 + 5 × 420 = 4,000 + 2,100 = $6,100. LIFO COGS = 25,900 − 6,100 = 19,800.' },
      { id: 'f02-inv-g2-s3', type: 'num', prompt: 'What is cost of goods sold under the weighted average method? Round to the nearest dollar.',
        answer: 19425, check: () => 45 * (10 * 400 + 20 * 420 + 30 * 450) / 60, unit: '$', places: 0, tol: 0.5,
        hints: ['Average cost = total cost of the 60 stoves ÷ 60.', 'Multiply the average by the 45 sold; round only at the end.'],
        wrong: [
          { value: 19050, say: 'You averaged the three prices without weighting them by the number of stoves in each layer.' },
          { value: 6475, say: 'That is ending inventory (15 stoves at the average). The question asks for the 45 sold.' },
        ],
        solution: 'Average = 25,900 ÷ 60 = 431.6667; COGS = 45 × 431.6667 = $19,425.' },
    ],
  },
  {
    id: 'f02-inv-g3', type: 'steps', kind: 'applied',
    prompt: `Lantern ended 2026 with ${C.endUnits} bags of House Blend at $${HB.purchases[2].cost.toFixed(2)} a bag (perpetual FIFO). Suppose that on 6 January 2027 Tidewater delivers 500 more bags at $8.80, on 30-day terms, and that Lantern ships 500 bags of House Blend later in January.`,
    solution: 'Purchase: debit Inventory 4,400 (500 × 8.80); credit Accounts Payable 4,400. FIFO cost of the 500 bags shipped: the 400 oldest at $9.00 and 100 at $8.80 = 3,600 + 880 = 4,480. Debit Cost of Goods Sold 4,480; credit Inventory 4,480.',
    steps: [
      { id: 'f02-inv-g3-s1', type: 'journal', chart: 'f02', date: '2027-01-06',
        prompt: 'Record the delivery on 6 January.',
        accounts: INV_ACCOUNTS,
        lines: [{ acct: 'Inventory', dr: 4400 }, { acct: 'Accounts Payable', cr: 4400 }],
        hints: ['Under a perpetual system purchases go straight into Inventory.', 'Lantern hasn’t paid yet: 30-day terms.'],
        solution: '500 × 8.80 = 4,400. Debit Inventory 4,400; credit Accounts Payable 4,400.' },
      { id: 'f02-inv-g3-s2', type: 'num', prompt: 'Under FIFO, what is the cost of the 500 bags shipped in January?',
        answer: 4480, check: () => C.endUnits * HB.purchases[2].cost + (500 - C.endUnits) * 8.8, unit: '$', places: 0, tol: 0.5,
        hints: ['The oldest bags on hand are the 400 left from December.', '400 × 9.00 + 100 × 8.80.'],
        wrong: [
          { value: 4400, say: 'That costs all 500 at the new price, as LIFO would. FIFO uses the December bags first.' },
          { value: 4500, say: 'Only 400 bags cost $9.00; the other 100 come from the January delivery at $8.80.' },
        ],
        solution: '400 × 9.00 + 100 × 8.80 = 3,600 + 880 = $4,480.' },
      { id: 'f02-inv-g3-s3', type: 'journal', chart: 'f02', date: '2027-01-31',
        prompt: 'Record the cost of the bags shipped in January (one summary entry).',
        accounts: INV_ACCOUNTS,
        lines: [{ acct: 'Cost of Goods Sold', dr: 4480 }, { acct: 'Inventory', cr: 4480 }],
        hints: ['The expense increases and the asset decreases.'],
        solution: 'Debit Cost of Goods Sold 4,480; credit Inventory 4,480. (The revenue side is a separate entry, as in the last lesson.)' },
    ],
  },
  {
    id: 'f02-inv-g4', type: 'classify', kind: 'conceptual',
    prompt: 'A coffee retailer buys roasted beans from abroad. Is each cost part of the cost of its inventory, or an expense of the period?',
    items: [
      'Freight to bring the beans to the retailer’s warehouse',
      'Import duty that can’t be reclaimed',
      'Courier charges for sending orders to customers',
      'Insurance on the beans while in transit to the warehouse',
      'Advertising for the online shop',
      'Card-processing fees on customers’ payments',
      'The supplier’s invoice price, less a 5% trade discount',
    ],
    categories: ['Part of inventory cost', 'Expense of the period'],
    answer: [0, 0, 1, 0, 1, 1, 0],
    hints: ['Inventory cost covers what it takes to bring the goods to their present location and condition.', 'Costs of selling the goods, including getting them to customers, are expenses when incurred.'],
    feedback: {
      2: 'Shipping to customers is freight-out, a selling expense. Freight-in is inventory cost.',
      3: 'Insurance while the beans travel to the warehouse is directly attributable to bringing them there: part of their cost.',
      6: 'The price paid, net of the trade discount, is the core of inventory cost.',
    },
    solution: 'Inventory cost: freight-in, the non-reclaimable duty, insurance in transit and the net purchase price. Expenses: courier charges to customers (freight-out), advertising and card fees, all costs of selling.',
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'f02-inv-i1', type: 'num', kind: 'numerical',
    prompt: 'Cinderpath Running Co., a fictional shoe shop, starts the year with 50 pairs of a trainer at $40. It buys 100 pairs at $44 and then 150 pairs at $46, and sells 220 pairs. Using periodic LIFO, what is cost of goods sold?',
    answer: 9980, check: () => 150 * 46 + 70 * 44, unit: '$', places: 0,
    wrong: [
      { value: 9620, say: 'That is FIFO. LIFO takes the newest layer first: all 150 at $46, then 70 at $44.' },
      { value: 3320, say: 'That is LIFO’s ending inventory (30 at $44 and 50 at $40). The question asks for the 220 pairs sold.' },
    ],
    solution: 'Newest first: 150 × 46 = 6,900, then 70 × 44 = 3,080. COGS = $9,980. (Ending inventory: 30 × 44 + 50 × 40 = 3,320.)',
  },
  {
    id: 'f02-inv-i2', type: 'num', kind: 'numerical',
    prompt: 'Moorland Ceramics, a fictional pottery supplier, starts the year with 200 bags of clay at $12. It buys 300 bags at $13 and 500 bags at $14.20, and sells 750 bags. Using the periodic weighted average method, what is ending inventory?',
    answer: 3350, check: () => (200 * 12 + 300 * 13 + 500 * 14.2) / 1000 * 250, unit: '$', places: 0,
    wrong: [
      { value: 3550, say: 'That is FIFO: 250 bags at the latest cost. The average method gives every bag the same cost, $13.40.' },
      { value: 3050, say: 'That is LIFO: the oldest costs. Use the average cost, total cost ÷ total bags.' },
      { value: 10050, say: 'That is cost of goods sold for the 750 bags sold. Ending inventory is the 250 bags left.' },
    ],
    solution: 'Pool: 1,000 bags costing 2,400 + 3,900 + 7,100 = 13,400; average 13.40. Ending inventory = 250 × 13.40 = $3,350 (COGS 750 × 13.40 = 10,050).',
  },
  {
    id: 'f02-inv-i3', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-12-31',
    prompt: 'Suppose that at 31 December 2027 Lantern holds 150 bags of Decaf Colombia that cost $8.50 each. A new competitor has pushed the selling price down to $9.00 a bag, and card fees and shipping cost Lantern $2.10 a bag to sell. Record any adjustment needed.',
    accounts: INV_ACCOUNTS,
    lines: [{ acct: 'Cost of Goods Sold', dr: 240 }, { acct: 'Inventory', cr: 240 }],
    solution: 'Net realisable value = 9.00 − 2.10 = $6.90 a bag, below the $8.50 cost. Write-down = 150 × (8.50 − 6.90) = $240: debit Cost of Goods Sold 240, credit Inventory 240. The bags are then carried at 150 × 6.90 = $1,035.',
  },
  {
    id: 'f02-inv-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A company reporting under IFRS wrote a batch of goods costing $50,000 down to its net realisable value of $42,000 at the end of year 1. In year 2, with the goods still unsold, demand recovers and their net realisable value rises to $53,000. At what amount are the goods carried after the reassessment?',
    options: ['$50,000', '$42,000', '$53,000', '$45,000'],
    answer: 0,
    feedback: {
      1: 'That would be the US GAAP answer: the written-down amount becomes the new cost. IFRS requires the write-down to be reversed.',
      2: 'Inventory is carried at the lower of cost and net realisable value: the reversal is limited to the original $8,000 write-down, so it can’t exceed cost.',
      3: 'There is no basis for $45,000: the reversal restores the write-down up to cost.',
    },
    solution: 'IAS 2 reverses a write-down when net realisable value recovers, limited to the original write-down, so the new carrying amount is the lower of cost ($50,000) and revised net realisable value ($53,000): $50,000. The $8,000 reversal reduces year 2’s inventory expense.',
  },
  {
    id: 'f02-inv-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional garden centre counted its stock on 31 December 2026 and counted one aisle twice, overstating ending inventory by $3,000. The error wasn’t found, and the 31 December 2027 count was correct. Its income tax rate is 25%. By how much is its 2027 net income understated?',
    answer: 2250, check: () => 3000 * (1 - 0.25), unit: '$', places: 0,
    wrong: [
      { value: 3000, say: 'That is the effect on 2027 gross profit and income before tax. Income tax absorbs a quarter of it.' },
      { value: 0, say: 'The 2027 count was correct, but 2027’s beginning inventory (2026’s ending) was overstated, so 2027 cost of goods sold is too high.' },
      { value: 750, say: 'That is the effect on income tax. Net income is understated by the after-tax amount.' },
    ],
    solution: '2026’s overstated ending inventory is 2027’s beginning inventory, so 2027 COGS is overstated by $3,000 and income before tax understated by $3,000. After tax at 25%: 3,000 × 0.75 = $2,250. (2026 net income was overstated by the same amount, and retained earnings are correct again at the end of 2027.)',
  },
  {
    id: 'f02-inv-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about LIFO are true? Select all that apply.',
    options: [
      'IAS 2 does not allow LIFO.',
      'When purchase costs are rising, LIFO reports lower gross profit than FIFO.',
      'A US company using LIFO for tax must also use it in reports to shareholders and lenders.',
      'LIFO requires the newest goods to be sold first.',
      'When costs are rising, LIFO’s ending inventory is closer to current cost than FIFO’s.',
      'LIFO increases the cash a business receives from its customers.',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'LIFO is a cost-flow assumption; the physical flow of goods can be anything.',
      4: 'The reverse: LIFO leaves the oldest costs in inventory, so with rising costs FIFO’s inventory is closer to current cost.',
      5: 'Customers pay the same whatever the cost formula. LIFO’s only cash effect is lower tax when costs rise.',
    },
    solution: 'True: IAS 2 allows only FIFO and weighted average for interchangeable items; with rising costs LIFO gives a higher cost of goods sold and lower gross profit; the LIFO conformity rule (26 U.S.C. §472) ties reports to owners and lenders to LIFO if it is used for tax. LIFO says nothing about physical flow, leaves old costs in inventory and doesn’t change cash from customers.',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'f02-inv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A retailer’s purchase costs fell steadily during the year. Which cost formula reports the highest gross profit?',
    options: ['LIFO', 'FIFO', 'Weighted average', 'All three give the same gross profit'],
    answer: 0,
    feedback: {
      1: 'With falling costs FIFO puts the oldest, dearest costs into cost of goods sold, so it reports the lowest gross profit.',
      2: 'The average sits between FIFO and LIFO whichever way costs move.',
      3: 'They agree only when costs are flat (or everything is sold).',
    },
    solution: 'When costs fall, the newest purchases are the cheapest. LIFO assigns them to cost of goods sold, giving the lowest cost of goods sold and the highest gross profit; FIFO the opposite.',
  },
  {
    id: 'f02-inv-k2', type: 'num', kind: 'numerical',
    prompt: 'Kelpie Kayaks, a fictional shop, starts the season with 8 kayaks at $600. It buys 12 at $650 and then 20 at $700, and sells 30. Using the periodic weighted average method, what is cost of goods sold?',
    answer: 19950, check: () => 30 * (8 * 600 + 12 * 650 + 20 * 700) / 40, unit: '$', places: 0,
    wrong: [
      { value: 19500, say: 'You averaged the three prices ($650) without weighting each by the number of kayaks bought at it.' },
      { value: 6650, say: 'That is ending inventory, the 10 kayaks left. The question asks for the 30 sold.' },
      { value: 20500, say: 'That is LIFO. The average method uses $665 for every kayak.' },
    ],
    solution: 'Pool: 40 kayaks costing 4,800 + 7,800 + 14,000 = 26,600; average 665. COGS = 30 × 665 = $19,950.',
  },
  {
    id: 'f02-inv-k3', type: 'num', kind: 'applied',
    prompt: 'A fictional electronics retailer applies the lower of cost and net realisable value item by item. At the year end it holds: headphones, cost $4,000, net realisable value $4,600; speakers, cost $2,500, net realisable value $1,900; e-readers, cost $3,200, net realisable value $2,700. What is the total write-down?',
    answer: 1100, check: () => [[4000, 4600], [2500, 1900], [3200, 2700]].reduce((s, [c, n]) => s + Math.max(0, c - n), 0), unit: '$', places: 0,
    wrong: [
      { value: 500, say: 'That compares the totals ($9,700 against $9,200), letting the headphones’ gain hide the other losses. Compare item by item.' },
    ],
    solution: 'Headphones: value above cost, no write-down. Speakers: 2,500 − 1,900 = 600. E-readers: 3,200 − 2,700 = 500. Total write-down $1,100; inventory is carried at 4,000 + 1,900 + 2,700 = $8,600.',
  },
  {
    id: 'f02-inv-k4', type: 'classify', kind: 'conceptual',
    prompt: 'Is each practice allowed under US GAAP only, IFRS only, or both?',
    items: [
      'Using LIFO for interchangeable goods',
      'Using FIFO',
      'Using the weighted average cost formula',
      'Reversing an earlier inventory write-down when net realisable value recovers',
      'Measuring LIFO inventory at the lower of cost or market',
      'Measuring FIFO inventory at the lower of cost and net realisable value',
      'Specific identification for unique, high-value items',
    ],
    categories: ['US GAAP only', 'IFRS only', 'Both'],
    answer: [0, 2, 2, 1, 0, 2, 2],
    feedback: {
      0: 'IAS 2 allows only FIFO and weighted average for interchangeable items.',
      3: 'IAS 2 requires the reversal (up to the original write-down); US GAAP treats the written-down amount as the new cost.',
      4: 'Under US GAAP, LIFO and retail-method inventory keep the lower of cost or market test; IFRS has no LIFO.',
    },
    solution: 'US GAAP only: LIFO, and lower of cost or market for LIFO inventory. IFRS only: reversing write-downs. Both: FIFO, weighted average, lower of cost and net realisable value for FIFO inventory, and specific identification for items that aren’t interchangeable.',
  },
  {
    id: 'f02-inv-k5', type: 'num', kind: 'applied',
    prompt: 'A fictional US hardware retailer estimates this year’s cost of goods sold at $3,450,000 under FIFO and $3,720,000 under LIFO. Ignoring state taxes and using the 21% federal corporate rate, how much federal income tax would LIFO save this year?',
    answer: 56700, check: () => 0.21 * (3720000 - 3450000), unit: '$', places: 0,
    wrong: [
      { value: 270000, say: 'That is the difference in cost of goods sold, and so in taxable income. The tax saved is 21% of it.' },
      { value: 67500, say: 'That uses 25%, the combined rate in the Lantern case. The question asks for the federal rate alone, 21%.' },
    ],
    solution: 'LIFO raises cost of goods sold by 3,720,000 − 3,450,000 = 270,000, cutting taxable income by the same amount. Tax saved = 0.21 × 270,000 = $56,700. Under the LIFO conformity rule, its reports to shareholders and lenders would also show the lower LIFO profit.',
  },
  {
    id: 'f02-inv-k6', type: 'mc', kind: 'applied',
    prompt: 'At its 31 December 2026 count a fictional hardware store missed a storeroom, understating ending inventory by $5,000. Its 31 December 2027 count was correct. Ignoring tax, which statement is true?',
    options: [
      '2027 profit is overstated by $5,000',
      '2026 profit is overstated by $5,000',
      'Both years’ profits are correct, as the error reverses',
      'Retained earnings at 31 December 2027 are understated by $5,000',
    ],
    answer: 0,
    feedback: {
      1: 'Understating ending inventory overstates 2026 cost of goods sold, so 2026 profit is understated.',
      2: 'Each year’s profit is wrong, in opposite directions; only the two-year total is right.',
      3: 'By the end of 2027 the two errors have offset, so retained earnings are correct.',
    },
    solution: '2026: ending inventory understated, so cost of goods sold overstated and profit understated by $5,000. 2027: beginning inventory understated, so cost of goods sold understated and profit overstated by $5,000. Retained earnings are correct again at the end of 2027.',
  },
];
