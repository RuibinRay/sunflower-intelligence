// inventory-and-cost-of-goods-sold.js — F02 · Inventory and cost of goods sold. Content only; exercises are in
// inventory-and-cost-of-goods-sold.ex.js. Lantern’s figures come from case.js (FACTS.inventory, YEAR y15–y17,
// ADJUSTMENTS e7, HOUSE_BLEND_Q4, COSTING, DERIVED); the other businesses are fictional and live only here.
import { FACTS, YEAR, ADJUSTMENTS, HOUSE_BLEND_Q4 as HB, COSTING as C, DERIVED as D } from './case.js?v=22';

const inv = FACTS.inventory, rate = FACTS.tax.rate;
const find = (id) => [...YEAR, ...ADJUSTMENTS].find((t) => t.id === id);
const entry = (id, memo) => { const t = find(id); return { date: t.date, lines: t.lines, memo: memo ?? t.text }; };
const holiday = { ...inv.holidayBlend, nrv2027: 800 };           // e7’s Holiday Blend from case.js; the 2027 recovery is hypothetical
// Clovehill Spice Traders (challenging example): tins of saffron in March
const cl = { open: [100, 5], buy1: [100, 6], sell1: 120, buy2: [100, 7], sell2: 80 };
const clAvail = cl.open[0] * cl.open[1] + cl.buy1[0] * cl.buy1[1] + cl.buy2[0] * cl.buy2[1];   // 1,800
const mavg1 = (cl.open[0] * cl.open[1] + cl.buy1[0] * cl.buy1[1]) / 200;                      // 5.50
const mLeft1 = 80 * mavg1;                                                                       // 440
const mavg2 = (mLeft1 + cl.buy2[0] * cl.buy2[1]) / 180;                                          // 6.333…
const mCogs = cl.sell1 * mavg1 + cl.sell2 * mavg2;                                               // 1,166.67
// Ironvale Hardware Supply (applied example), in dollars
const as = { fifoCogs: 6_200_000, lifoCogs: 6_600_000, fifoPretax: 1_500_000, covenant: 1_200_000, federal: 0.21 };
// inventory error illustration
const err = 2000;

export default {
  slug: 'inventory-and-cost-of-goods-sold',
  title: 'Inventory and cost of goods sold',
  blurb: 'Follow the cost of the bags Lantern sells from the roaster’s invoice to the income statement: what goes into inventory, perpetual and periodic records, the FIFO, LIFO and weighted average formulas, the lower of cost and net realisable value, and what each choice does to gross profit, tax and the balance sheet.',
  status: 'reviewed',
  objectives: [
    'Explain how the cost of goods moves from inventory, an asset, to cost of goods sold, an expense, under perpetual and periodic systems.',
    'Calculate cost of goods sold and ending inventory by FIFO, LIFO and weighted average, and with beginning inventory + purchases − ending inventory.',
    'Compare the effects of the cost formulas on gross profit, income tax and the balance sheet when purchase costs rise, including the LIFO conformity rule and IFRS’s prohibition of LIFO.',
    'Apply the lower of cost and net realisable value under US GAAP and IFRS, including whether a write-down may be reversed.',
    'Analyse the effect of an error in ending inventory on two years’ income statements and balance sheets.',
  ],
  prerequisites: [
    { lesson: 'f02/revenue-recognition', why: 'Cost of goods sold is matched with the revenue recognised when the bags ship, and the shop’s net sales of $110,000 come from that lesson.' },
    { lesson: 'f01/adjusting-entries', why: 'The year-end count and the write-down are adjusting entries.' },
    { lesson: 'f01/accrual-vs-cash', why: 'The expense recognition principle, introduced there, decides when a cost leaves the balance sheet.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'During 2026 Lantern bought $58,600 of roasted coffee, mostly in 250 g bags, from Kilnworth Roasting on 30-day terms, and shipped thousands of bags to online customers. On 31 December Ana and the accountant count what is left on the shelves of the kitchen’s store room. Most of it is House Blend from the December delivery, but there are also 125 bags of Holiday Blend that didn’t sell before Christmas. Two questions follow: how much of the $58,600 is an expense of 2026, and how much is still an asset?' },
    { p: 'Lantern runs two kinds of business under one roof. Its catering and workshops are a service business: their main costs are staff time and consumables, which the accountant collects in Cost of Services. Its online shop is a <g>merchandising business</g>: it buys finished goods and resells them without changing them. (A manufacturer, by contrast, makes the goods it sells.) The goods a business holds for sale are its <g>inventory</g>, an asset until they are sold.' },
    { p: 'When a bag is sold, its cost leaves the balance sheet and becomes an expense, <g>cost of goods sold</g> (COGS), in the same period as the revenue from the sale. IAS 2 puts it directly: the carrying amount of inventories sold is recognised as an expense in the period in which the related revenue is recognised (paragraph 34). This is the <g>expense recognition principle</g> at work, and it is why a business can’t expense every purchase when it pays for it: bags still on the shelf will earn revenue later.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="15"><g fill="none" stroke="var(--rule-strong)" stroke-width="1.5"><rect x="10" y="20" width="170" height="90" rx="6"/><rect x="10" y="190" width="170" height="90" rx="6"/><rect x="235" y="105" width="170" height="90" rx="6"/></g><rect x="460" y="20" width="170" height="90" rx="6" fill="none" stroke="var(--series-1)" stroke-width="2.5"/><rect x="460" y="190" width="170" height="90" rx="6" fill="none" stroke="var(--series-2)" stroke-width="2.5"/><g fill="currentColor" text-anchor="middle"><text x="95" y="52" font-weight="600">Beginning inventory</text><text x="95" y="78">$0</text><text x="95" y="98" font-size="13">(Lantern’s first year)</text><text x="95" y="222" font-weight="600">Purchases</text><text x="95" y="248">$58,600</text><text x="95" y="268" font-size="13">from Kilnworth Roasting</text><text x="320" y="137" font-weight="600">Goods available</text><text x="320" y="163">$58,600</text><text x="320" y="183" font-size="13">must go one of two ways</text><text x="545" y="52" font-weight="600">Cost of goods sold</text><text x="545" y="78">$52,800</text><text x="545" y="98" font-size="13">income statement</text><text x="545" y="222" font-weight="600">Ending inventory</text><text x="545" y="248">$5,800</text><text x="545" y="268" font-size="13">balance sheet</text></g><g stroke="var(--rule-strong)" stroke-width="2" fill="none"><path d="M180 65 H205 V140 H229"/><path d="M180 235 H205 V160 H229"/><path d="M405 140 H430 V65 H454"/><path d="M405 160 H430 V235 H454"/></g><g fill="var(--rule-strong)"><path d="M229 134 L237 140 L229 146 Z"/><path d="M229 154 L237 160 L229 166 Z"/><path d="M454 59 L462 65 L454 71 Z"/><path d="M454 229 L462 235 L454 241 Z"/></g></svg>',
      caption: 'Where the cost of Lantern’s coffee went in 2026 (fictional figures in dollars). Every dollar of goods available ends as an expense or stays as an asset.',
      alt: 'Flow diagram. Two boxes on the left, beginning inventory of $0 (Lantern’s first year) and purchases of $58,600 from Kilnworth Roasting, both lead by arrows to a central box, goods available of $58,600, which must go one of two ways. Arrows lead from it to two boxes on the right: cost of goods sold of $52,800, reported on the income statement, and ending inventory of $5,800, reported on the balance sheet.',
    } },
    { p: 'The figure shows the idea that organises the whole lesson. Everything the business could have sold, its <g>goods available for sale</g>, is either sold (cost of goods sold) or still on hand (ending inventory). Rearranged, that gives the most used formula in inventory accounting:' },
    { math: String.raw`\text{COGS} = \text{Beginning inventory} + \text{Purchases} - \text{Ending inventory}` },
    { p: 'For Lantern: <m>0 + 58{,}600 - 5{,}800 = 52{,}800</m> dollars. Against the shop’s net sales of $110,000, that leaves $57,200 of <g>gross profit</g>, a <g>gross margin</g> of 52%: of every dollar of net sales, 48 cents paid for the coffee and 52 cents remain to cover shipping, fees, wages and the rest. Every choice in this lesson, from what counts as cost to which cost is assigned to the bags sold, changes the split between the two boxes on the right, and so moves profit between this year and the next.' },
    { callout: 'key', title: 'One pool, two destinations', html: 'Goods available for sale = cost of goods sold + ending inventory. Overstate ending inventory and cost of goods sold is understated by exactly the same amount, so gross profit is overstated. Choose a cost formula that puts more cost into the bags sold and less is left on the shelf. The total never changes; only its division between the two statements does.' },
  ],

  theory: [
    { h: 'What goes into the cost of inventory' },
    { p: 'Inventory is recorded at cost, applying the <g>historical cost principle</g>. Cost includes everything spent to bring the goods to their present location and condition: the purchase price, import duties and taxes the business can’t recover, and transport, handling and other costs directly attributable to buying them; trade discounts, rebates and similar items are deducted (IAS 2 paragraphs 10 and 11). So <g>freight-in</g>, the cost of shipping goods to the buyer, is part of inventory. A discount for paying a supplier early reduces the cost too: a buyer that pays within the discount period credits Inventory for the discount taken.' },
    { p: 'Costs of selling are not inventory (IAS 2 paragraph 16). Shipping goods out to customers (freight-out) is never added to inventory; it is an expense of the period in which the goods are shipped. Where it appears is a presentation policy: introductory texts treat it as a selling (delivery) expense and Lantern does the same, so its $12,630 of couriers and postage sits among operating expenses, while some companies include outbound shipping in cost of sales. Kilnworth’s prices include delivery to Lantern’s kitchen, so freight-in is already inside the $58,600.' },
    { h: 'Perpetual and periodic systems' },
    { p: 'A <g>perpetual inventory system</g> updates Inventory with every purchase and every sale. When a bag ships, two entries are made at once: revenue and a receivable or cash, as in the last lesson, and the cost of the bag moved from Inventory to Cost of Goods Sold. Lantern’s shop software does this, so the year’s summary entries record purchases of $58,600 and cost of goods sold of $52,400 from the perpetual records.' },
    { journal: { caption: 'Lantern’s inventory entries for 2026, in summary (fictional)', entries: [entry('y15'), entry('y17')] } },
    { p: 'A return reverses both entries. When a customer sends back goods that can be sold again, the refund goes through Sales Returns and Allowances, as in the last lesson, and the goods go back into Inventory at their cost, with a credit to Cost of Goods Sold. If the goods are damaged and thrown away, as Lantern’s were, only the refund is recorded: there is nothing to put back on the shelf.' },
    { journal: { caption: 'A resaleable return under a perpetual system (a fictional shop: a $40 item that cost $18)', entries: [
      { date: '2027-01-10', lines: [{ acct: 'Sales Returns and Allowances', dr: 40 }, { acct: 'Cash', cr: 40 }], memo: 'Refund the customer.' },
      { date: '2027-01-10', lines: [{ acct: 'Inventory', dr: 18 }, { acct: 'Cost of Goods Sold', cr: 18 }], memo: 'Put the item back into stock at its cost.' },
    ] } },
    { p: 'A <g>periodic inventory system</g> records purchases in a Purchases account during the period and leaves Inventory untouched until the period end. A physical count then gives ending inventory, and cost of goods sold is calculated with the formula above. Periodic records are cheaper to keep but say nothing about cost of goods sold until the count, and they can’t separate goods sold from goods stolen, spoiled or lost.' },
    { p: 'Even a perpetual system needs a count. Records drift from reality through <g>shrinkage</g> (goods lost to theft, damage or error), and only a count finds goods that are on hand but worth less than they cost. When the count is lower than the records, the difference is moved from Inventory to Cost of Goods Sold. Lantern’s count agreed with its records in quantity, but found the unsold Holiday Blend; that adjustment comes later in the lesson.' },
    { h: 'Cost formulas: FIFO, LIFO and weighted average' },
    { p: 'When identical items are bought at different costs, the business needs a rule for which cost goes with the items sold. Items that are not ordinarily interchangeable, such as cars or works of art, are costed by specific identification: each item carries its own cost. For interchangeable items, such as bags of the same coffee, accounting uses a cost formula. The formula is an assumption about the flow of costs, not a description of which bags physically leave the shelf.' },
    { list: [
      '<b><g>FIFO</g></b> (first in, first out): the oldest costs go to cost of goods sold first; ending inventory carries the most recent costs.',
      '<b><g>LIFO</g></b> (last in, first out): the newest costs go to cost of goods sold first; ending inventory carries the oldest costs.',
      '<b><g>Weighted average cost</g></b>: every unit carries the average cost of the goods available, total cost divided by total units.',
    ] },
    { p: 'Lantern’s House Blend in the fourth quarter shows how far the three can diverge. Kilnworth raised its price with each delivery, from $8.00 a bag in the opening stock to $9.00 in December. Lantern shipped 2,600 of the 3,000 bags available, leaving 400 on 31 December.' },
    { table: {
      caption: 'House Blend 250 g bags, October–December 2026: goods available (fictional)',
      head: ['Layer', 'Bags', 'Cost a bag ($)', 'Total ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Opening stock, 1 October', '300', '8.00', '2,400'],
        ['Purchase, 12 October', '600', '8.40', '5,040'],
        ['Purchase, 9 November', '900', '8.80', '7,920'],
        ['Purchase, 3 December', '1,200', '9.00', '10,800'],
      ],
      foot: [['Goods available for sale', '3,000', '', '26,160']],
    } },
    { list: [
      String.raw`<b>FIFO.</b> The 2,600 bags sold take the oldest layers first: <m>2{,}400 + 5{,}040 + 7{,}920 + 800 \times 9.00 = 22{,}560</m>. The 400 bags left carry December’s cost: <m>400 \times 9.00 = 3{,}600</m>.`,
      String.raw`<b>LIFO (periodic).</b> The bags sold take the newest layers first: <m>10{,}800 + 7{,}920 + 500 \times 8.40 = 22{,}920</m>. The 400 bags left carry the oldest costs: <m>2{,}400 + 100 \times 8.40 = 3{,}240</m>.`,
      String.raw`<b>Weighted average (periodic).</b> Average cost <m>26{,}160 \div 3{,}000 = 8.72</m> a bag; cost of goods sold <m>2{,}600 \times 8.72 = 22{,}672</m>; ending inventory <m>400 \times 8.72 = 3{,}488</m>.`,
    ] },
    { p: 'Each pair adds back to $26,160: the formula only divides the pool. Under a perpetual system FIFO gives the same answer whenever the costs are assigned, because the oldest bags on hand are always the oldest. LIFO and the average do not: applied sale by sale, perpetual LIFO takes the newest cost <i>at the date of each sale</i>, and the moving average recalculates the average after every purchase. The challenging example works one case every way. Lantern’s own records are perpetual FIFO, which is why its year-end House Blend is the December layer, $3,600.' },
    { h: 'What the choice does when costs rise' },
    { table: {
      caption: 'House Blend, fourth quarter 2026: the three formulas compared (fictional)',
      head: ['Formula', 'Cost of goods sold ($)', 'Ending inventory ($)', 'Gross profit vs FIFO ($)', 'Income tax vs FIFO at 25% ($)'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['FIFO', '22,560', '3,600', '0', '0'],
        ['Weighted average', '22,672', '3,488', '−112', '−28'],
        ['LIFO', '22,920', '3,240', '−360', '−90'],
      ],
    } },
    { p: 'When purchase costs rise, FIFO gives the lowest cost of goods sold, the highest gross profit and the highest ending inventory; LIFO gives the opposite; the average sits between. Each has a claim to be more accurate. LIFO matches recent costs with current revenue, so its gross profit is closer to what the business earns on replacing what it sells. FIFO leaves recent costs on the balance sheet, so its inventory is closer to what the goods would cost today. When costs fall the rankings reverse, and when costs are flat the formulas agree.' },
    { p: 'The only cash difference is tax. Selling the same bags at the same prices, Lantern pays the same suppliers and receives the same cash under every formula, but LIFO’s lower taxable profit would cut the quarter’s tax by <m>0.25 \\times 360 = 90</m> dollars at the course’s assumed 25% rate. Over many years of rising prices the saving builds up, which is LIFO’s main attraction for US companies whose costs keep rising.' },
    { callout: 'standards', title: 'LIFO: allowed under US GAAP, prohibited under IFRS, tied to tax in the US', html: 'IAS 2 allows only FIFO or the weighted average cost formula for interchangeable items, and requires the same formula for all inventories of a similar nature and use (paragraph 25). The IASB removed LIFO when it revised IAS 2 in December 2003, effective from 2005, because LIFO lacks representational faithfulness of inventory flows. US GAAP still permits LIFO. In the United States the tax rules add the <g>LIFO conformity rule</g>: a taxpayer may use LIFO for tax only if it uses no other method to work out its income in reports to shareholders, partners or other owners, or for credit purposes (26 U.S.C. §472(c) and (e)(2)). If Lantern elected LIFO for its tax return, the statements it gives Ana and Coastline Bank would have to use LIFO too.' },
    { h: 'The lower of cost and net realisable value' },
    { p: 'Inventory is never carried at more than the business expects to recover from it. <g>Net realisable value</g> is the estimated selling price in the ordinary course of business, less the estimated costs of completion and the costs of making the sale. Cost may not be recoverable when goods are damaged or obsolete, when selling prices have fallen, or when the costs to complete or sell them have risen (IAS 2 paragraphs 9 and 28). Inventory is then written down to net realisable value, and the <g>inventory write-down</g> is an expense of the period in which it happens (paragraph 34).' },
    { p: 'US GAAP reached the same test in 2015. ASU 2015-11, issued in July 2015 and effective for fiscal years beginning after 15 December 2016, requires inventory measured by any method other than LIFO or the retail inventory method (which estimates the cost of inventory from its selling prices, using the ratio of cost to retail price) to be measured at the <g>lower of cost and net realisable value</g> (ASC 330-10-35-1B). Inventory measured by LIFO or the retail inventory method keeps the older lower of cost or market test (ASC 330-10-35-1C), in which “market” is based on current replacement cost. Older textbooks describe lower of cost or market for all inventory; for a FIFO business like Lantern that is no longer the rule.' },
    { p: 'Lantern’s count found 125 bags of Holiday Blend, a seasonal coffee in festive packaging, that cost $1,000. After Christmas they can be sold only at a clearance price, which after card fees and shipping leaves $600. The write-down of $400 is charged to Cost of Goods Sold, a common presentation, so the year’s cost of goods sold becomes <m>52{,}400 + 400 = 52{,}800</m>.' },
    { journal: { caption: 'Lantern’s year-end write-down (fictional)', entries: [entry('e7')] } },
    { p: 'What if net realisable value recovers while the goods are still held? Suppose that in February 2027 a café chain offers to take the Holiday Blend for a price that leaves $800 after costs. Under IFRS the business reassesses net realisable value each period and reverses the write-down when it recovers, but only up to the original write-down, so that the carrying amount is the lower of cost and the revised net realisable value; the reversal reduces the inventory expense of the period (IAS 2 paragraphs 33 and 34). Under US GAAP a write-down at the close of a fiscal year makes the reduced amount the cost for later accounting (ASC 330-10-35-14), so it isn’t written back up; the recovery shows as a higher profit when the goods are sold. (Within one fiscal year, a write-down made in an interim period may be recovered in a later interim period of the same year.)' },
    { table: {
      caption: 'The Holiday Blend under the two frameworks (fictional; the February 2027 offer is hypothetical)',
      head: ['', 'IFRS ($)', 'US GAAP ($)'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Cost', '1,000', '1,000'],
        ['Carrying amount at 31 December 2026', '600', '600'],
        ['Net realisable value, February 2027', '800', '800'],
        ['Reversal of write-down in 2027', '200', '0'],
        ['Carrying amount after the offer', '800', '600'],
      ],
    } },
    { h: 'Inventory errors' },
    { p: 'Because cost of goods sold is calculated from ending inventory, a mistake in the count flows straight into profit. If ending inventory is overstated by $2,000, cost of goods sold is understated and gross profit overstated by $2,000. The error doesn’t stop there: this year’s ending inventory is next year’s beginning inventory, so next year’s cost of goods sold is overstated and its gross profit understated by the same $2,000.' },
    { table: {
      caption: 'Ending inventory for year 1 overstated by $2,000: effects before tax (fictional)',
      head: ['Item', 'Year 1', 'Year 2'],
      align: ['l', 'l', 'l'],
      rows: [
        ['Ending inventory (balance sheet)', 'Overstated 2,000', 'Correct, if counted correctly'],
        ['Cost of goods sold', 'Understated 2,000', 'Overstated 2,000'],
        ['Gross profit and income before tax', 'Overstated 2,000', 'Understated 2,000'],
        ['Retained earnings at year end', 'Overstated 2,000', 'Correct'],
      ],
    } },
    { p: 'After income tax at Lantern’s assumed 25%, each year’s net income is misstated by <m>2{,}000 \\times (1 - 0.25) = 1{,}500</m>, with the rest of the error in income tax. The error is called self-correcting because retained earnings are right again at the end of year 2. That is cold comfort: both years’ profits were wrong, any bonus or tax based on them was wrong, and a reader comparing the two years saw a swing of $4,000 in gross profit that never happened.' },
  ],

  formulas: [
    { id: 'inv-cogs', name: 'Cost of goods sold (periodic formula)',
      tex: String.raw`\text{COGS} = \text{BI} + \text{P} - \text{EI}`,
      where: [
        [String.raw`\text{COGS}`, 'Cost of goods sold for the period', '$'],
        [String.raw`\text{BI}`, 'Beginning inventory: the cost of goods on hand at the start of the period', '$'],
        [String.raw`\text{P}`, 'Net purchases: purchases plus freight-in, less purchase returns and discounts', '$'],
        [String.raw`\text{EI}`, 'Ending inventory: the cost of goods on hand at the end, from a count, after any write-down', '$'],
      ],
      assumptions: 'Every unit available was either sold or is still on hand; losses found by the count end up in cost of goods sold.',
      note: 'Lantern, 2026: <m>0 + 58{,}600 - 5{,}800 = 52{,}800</m>.' },
    { id: 'inv-layers', name: 'Cost of goods sold by FIFO or LIFO',
      tex: String.raw`\text{COGS} = \sum_k q_k \times c_k`,
      where: [
        [String.raw`q_k`, 'Units taken from cost layer k: oldest layers first under FIFO, newest first under LIFO, until the units sold are covered', 'units'],
        [String.raw`c_k`, 'Unit cost of layer k', '$ per unit'],
      ],
      assumptions: 'Periodic: layers are taken from the whole period’s purchases. Perpetual LIFO takes only the layers on hand at the date of each sale.',
      note: 'House Blend, FIFO: <m>300 \\times 8.00 + 600 \\times 8.40 + 900 \\times 8.80 + 800 \\times 9.00 = 22{,}560</m>.' },
    { id: 'inv-average', name: 'Weighted average cost',
      tex: String.raw`\bar{c} = \dfrac{\text{Cost of goods available}}{\text{Units available}}, \quad \text{COGS} = \bar{c} \times \text{Units sold}`,
      where: [
        [String.raw`\bar{c}`, 'Average cost a unit', '$ per unit'],
        [String.raw`\text{Cost of goods available}`, 'Beginning inventory plus purchases, at cost', '$'],
        [String.raw`\text{Units available}`, 'Units on hand at the start plus units bought', 'units'],
      ],
      assumptions: 'Periodic: one average for the period. The moving average recalculates it after each purchase.',
      note: 'House Blend: <m>26{,}160 \\div 3{,}000 = 8.72</m>.' },
    { id: 'inv-gross-margin', name: 'Gross profit and gross margin',
      tex: String.raw`\text{Gross profit} = \text{Net sales} - \text{COGS}, \quad \text{Gross margin} = \dfrac{\text{Gross profit}}{\text{Net sales}}`,
      where: [
        [String.raw`\text{Net sales}`, 'Revenue from goods sold, after returns, allowances and discounts', '$'],
        [String.raw`\text{COGS}`, 'Cost of goods sold for the same period', '$'],
      ],
      note: 'Lantern’s shop, 2026: <m>(110{,}000 - 52{,}800) \\div 110{,}000 = 0.52</m>.' },
    { id: 'inv-lcnrv', name: 'Lower of cost and net realisable value',
      tex: String.raw`\text{NRV} = \text{Estimated selling price} - \text{Costs to complete} - \text{Costs to sell}, \quad \text{Carrying amount} = \min(\text{Cost}, \text{NRV})`,
      where: [
        [String.raw`\text{NRV}`, 'Net realisable value of the item', '$'],
        [String.raw`\text{Estimated selling price}`, 'The price expected in the ordinary course of business', '$'],
        [String.raw`\text{Costs to complete}`, 'Costs still needed to finish the goods (none for goods bought ready to sell)', '$'],
        [String.raw`\text{Costs to sell}`, 'Costs of making the sale, such as fees, commissions and shipping', '$'],
      ],
      assumptions: 'Usually applied item by item, or to groups of similar items. US GAAP applies it to inventory measured other than by LIFO or the retail inventory method.',
      note: 'Holiday Blend: <m>\\min(1{,}000, 600) = 600</m>, a write-down of 400.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s cost of goods sold and gross margin for 2026', fictional: true,
      setup: 'Lantern opened in March 2026 with no inventory. During the year it bought $58,600 of bags; its perpetual records show $52,400 of cost of goods sold. The year-end count values the bags on hand at $5,800 after writing the Holiday Blend down to net realisable value. The shop’s net sales were $110,000. Find cost of goods sold by the periodic formula, check it against the records, and calculate the shop’s gross margin.',
      steps: [
        'Goods available for sale = beginning inventory + purchases = <m>0 + 58{,}600 = 58{,}600</m>.',
        'Cost of goods sold = goods available − ending inventory = <m>58{,}600 - 5{,}800 = 52{,}800</m>.',
        'Check against the perpetual records: <m>52{,}400 + 400 = 52{,}800</m>. The periodic formula picks up the write-down automatically, because the count valued the Holiday Blend at $600 rather than its $1,000 cost.',
        'Gross profit = <m>110{,}000 - 52{,}800 = 57{,}200</m>; gross margin = <m>57{,}200 \\div 110{,}000 = 0.52</m>, or 52%.',
      ],
      answer: 'Cost of goods sold $52,800; shop gross profit $57,200; gross margin 52%.',
      interpretation: 'Of each dollar of net shop sales, 48 cents paid for the coffee. The 52 cents left must also cover shipping ($12,630), card and platform fees ($4,010) and part of the wages and rent, which the income statement lesson brings in below gross profit.' },
    { level: 'challenging', title: 'Periodic or perpetual? Five answers for one month', fictional: true,
      setup: 'Clovehill Spice Traders, a fictional importer, sells tins of saffron. On 1 March it holds 100 tins at $5. It buys 100 tins at $6 on 5 March, sells 120 on 10 March, buys 100 at $7 on 20 March and sells 80 on 28 March. Find March’s cost of goods sold and ending inventory under FIFO, LIFO and the average method, each on a periodic and a perpetual basis. Round to the cent.',
      table: {
        caption: 'Clovehill’s March under each method (fictional)',
        head: ['Method', 'Cost of goods sold ($)', 'Ending inventory ($)'],
        align: ['l', 'r', 'r'],
        rows: [
          ['FIFO (periodic or perpetual)', '1,100.00', '700.00'],
          ['LIFO, periodic', '1,300.00', '500.00'],
          ['LIFO, perpetual', '1,260.00', '540.00'],
          ['Weighted average, periodic', '1,200.00', '600.00'],
          ['Moving average, perpetual', '1,166.67', '633.33'],
        ],
      },
      steps: [
        String.raw`Pool: 300 tins costing <m>500 + 600 + 700 = 1{,}800</m>; 200 sold, 100 left. FIFO, either way: the 200 sold are the 100 at $5 and 100 at $6, <m>1{,}100</m>; the 100 left cost $7 each, <m>700</m>.`,
        String.raw`Periodic LIFO looks only at the month as a whole: the 100 left are the oldest, at $5, so ending inventory is 500 and cost of goods sold <m>1{,}800 - 500 = 1{,}300</m>.`,
        String.raw`Perpetual LIFO costs each sale from what is on hand that day. 10 March: 100 at $6 and 20 at $5, <m>700</m>, leaving 80 at $5. 28 March: 80 of the 20 March tins at $7, <m>560</m>. Cost of goods sold <m>1{,}260</m>; left 80 at $5 and 20 at $7, <m>540</m>.`,
        String.raw`Periodic average: <m>1{,}800 \div 300 = 6.00</m> a tin; cost of goods sold <m>200 \times 6 = 1{,}200</m>; ending 600.`,
        String.raw`Moving average: after 5 March, 200 tins cost 1,100, <m>5.50</m> each; the 10 March sale costs <m>120 \times 5.50 = 660</m>, leaving 80 tins at 440. After 20 March, 180 tins cost <m>440 + 700 = 1{,}140</m>, <m>6.33\overline{3}</m> each; the 28 March sale costs <m>80 \times 1{,}140 \div 180 \approx 506.67</m>. Cost of goods sold <m>660 + 506.67 = 1{,}166.67</m>; ending <m>1{,}800 - 1{,}166.67 = 633.33</m>.`,
      ],
      answer: 'See the table: five different costs of goods sold, from $1,100.00 (FIFO) to $1,300.00 (periodic LIFO), from the same tins and the same purchases.',
      interpretation: 'FIFO is the only formula that doesn’t care when the sales happened. Perpetual LIFO and the moving average assign some older costs to sales made before the dearer 20 March delivery arrived, so they land between FIFO and their periodic versions. A business must choose one method and apply it consistently, and its notes should say which.' },
    { level: 'applied', title: 'Should a US distributor switch to LIFO?', fictional: true,
      setup: 'Ironvale Hardware Supply Inc., a fictional US distributor, uses FIFO. Its suppliers’ prices have risen all year; for this year its controller estimates cost of goods sold of $6.2 million under FIFO and $6.6 million under LIFO, and income before tax of $1.5 million under FIFO. Ironvale’s bank loan requires income before tax of at least $1.2 million in the statements Ironvale sends the bank, and its finance director wants LIFO to save tax. Ignore state taxes and use a 21% rate, the US federal corporate income tax rate (26 U.S.C. §11(b), covered in the next lesson). What would LIFO save, and what is the catch?',
      steps: [
        'Extra cost of goods sold under LIFO: <m>6.6 - 6.2 = 0.4</m> million dollars, so income before tax falls to <m>1.5 - 0.4 = 1.1</m> million.',
        'Federal tax saved this year: <m>0.21 \\times 400{,}000 = 84{,}000</m> dollars. The saving is real cash, and repeats each year that costs keep rising.',
        'The LIFO conformity rule (26 U.S.C. §472(c)) means Ironvale can’t use LIFO for tax and FIFO in the statements it gives its bank, which are reports for credit purposes. The bank would see LIFO income of $1.1 million.',
        'That is below the loan’s $1.2 million test, so switching would put Ironvale in breach unless the bank agrees to amend the covenant or to measure it on a FIFO basis.',
      ],
      answer: 'LIFO would save about $84,000 of federal tax this year, but it would also cut reported income before tax to $1.1 million, below the bank’s $1.2 million requirement.',
      interpretation: 'An inventory method is a tax decision, a reporting decision and a financing decision at once. Ironvale should talk to its bank before switching; and if Ironvale were ever bought by a group reporting under IFRS, the group accounts would have to restate its inventory on FIFO or the weighted average, because IAS 2 doesn’t allow LIFO.' },
  ],

  demo: [
    { widget: 'inv-costing', intro: 'Lantern’s House Blend quarter: 300 bags in stock and three deliveries of 600, 900 and 1,200 bags. Change the cost of each layer and the number of bags sold. Make costs rise, then fall, then stay flat, and watch the order of the three formulas change; sell all 3,000 bags and they agree.' },
    { widget: 'inv-nrv', intro: 'A batch of goods costing $1,000 is written down at the year end and its net realisable value changes the following year. Compare the carrying amount under IFRS, which reverses write-downs up to cost, with US GAAP, which doesn’t.' },
  ],

  mistakes: [
    { title: '“LIFO means the newest bags are shipped first.”', html: 'The cost formula is an assumption about costs, not goods. A coffee shop ships its oldest bags first whatever its accounting says, because coffee goes stale. FIFO, LIFO and the average only decide which purchase costs are assigned to the bags sold.' },
    { title: '“Shipping is shipping: it all goes into inventory.”', html: 'Freight-in, the cost of getting goods to the business, is part of their cost. Freight-out, the cost of sending goods to customers, is never inventory: it is an expense of the year (Lantern shows it among operating expenses). Putting Lantern’s $12,630 of couriers and postage into inventory would overstate both inventory and gross profit.' },
    { title: '“Perpetual and periodic records give the same answer.”', html: 'They do for FIFO. For LIFO and the average they generally don’t, because a perpetual system costs each sale from the layers on hand at that date. Clovehill’s LIFO cost of goods sold is $1,300 periodic but $1,260 perpetual.' },
    { title: '“When prices recover, the write-down comes back.”', html: 'Only under IFRS, and only up to the original write-down. Under US GAAP a year-end write-down sets a new cost that isn’t written back up while the goods are held; the recovery appears as a higher margin when they are sold.' },
    { title: '“An inventory error corrects itself, so it doesn’t matter.”', html: 'It distorts two years’ profits in opposite directions and the first year’s balance sheet. Decisions, bonuses and taxes based on those figures are not corrected by the reversal, and the apparent swing in performance between the years is fictitious.' },
    { title: '“FIFO gives the higher profit, so it brings in more cash.”', html: 'The formula changes no purchase and no sale. In rising prices FIFO reports more profit and so pays more tax: its only cash effect is a larger tax bill. LIFO’s advantage is that tax saving, not any extra cash from customers.' },
  ],

  application: [
    { p: '<b>Ordering for next Christmas.</b> The Holiday Blend write-down is $400 of lost profit, but it is also information. Ana bought seasonal coffee that customers could only want for six weeks, and 125 bags were left. When she plans 2027’s order, she can treat the $400 as the price of over-ordering and weigh it against the margin she would have lost by running out. A merchandiser can set a markdown budget for seasonal lines at the start of the season for exactly this reason; the accounting makes the cost of the guess visible in the year it is made.' },
    { p: '<b>Choosing and keeping a method.</b> A US company choosing LIFO makes a decision it will live with for years: the tax saving builds up as long as costs rise, but the conformity rule ties its reports to owners and lenders to the same method. A company that reports under IFRS, or belongs to a group that does, has no LIFO choice at all. Whatever the method, the notes to the statements must say which formula is used, so that readers can tell a difference in method from a difference in performance.' },
    { p: '<b>Comparing gross margins.</b> An analyst comparing two hardware distributors, one on FIFO and one on LIFO, in a year of rising costs, will find the LIFO company’s gross margin lower and its inventory smaller even if the two businesses are identical. Before comparing margins or inventory levels, the analyst restates one company onto the other’s method where the disclosures allow. F03 builds the ratios, such as inventory turnover and days’ inventory, that depend on these figures.' },
  ],

  summary: [
    'Inventory is an asset until the goods are sold; its cost then becomes cost of goods sold, an expense of the period in which the revenue is recognised.',
    'Cost of goods sold = beginning inventory + purchases − ending inventory. Lantern, 2026: 0 + 58,600 − 5,800 = $52,800; shop gross profit $57,200 on net sales of $110,000, a gross margin of 52%.',
    'Inventory cost includes the purchase price, freight-in and other costs of getting the goods ready for sale, less discounts; shipping to customers is an expense of the period, a selling expense in Lantern’s statements.',
    'Perpetual records update inventory with every sale; periodic records rely on a count. Even perpetual systems need a count to find shrinkage and impaired goods.',
    'FIFO, LIFO and the weighted average divide the same pool differently. With rising costs, LIFO gives the highest cost of goods sold, the lowest profit and tax and the smallest inventory: House Blend’s LIFO cost of goods sold is $22,920 against FIFO’s $22,560.',
    'IAS 2 prohibits LIFO; US GAAP allows it, and US tax law’s LIFO conformity rule requires a company that uses LIFO for tax to use it in reports to owners and lenders.',
    'Inventory is carried at the lower of cost and net realisable value (LIFO and retail-method inventory: lower of cost or market under US GAAP). Lantern wrote its Holiday Blend down by $400. IFRS reverses write-downs when value recovers; US GAAP doesn’t.',
    'An error in ending inventory misstates gross profit by the same amount in two years, in opposite directions.',
  ],

  glossary: [
    { term: 'Merchandising business', def: 'A business that buys finished goods and resells them without changing them, such as a retailer or wholesaler.' },
    { term: 'Inventory', def: 'Goods held for sale in the ordinary course of business (and, for a manufacturer, materials and goods in production). An asset, measured at cost or, if lower, net realisable value.' },
    { term: 'Cost of goods sold', def: 'The cost of the inventory sold in a period, recognised as an expense in the period the related revenue is recognised. Often shortened to COGS.' },
    { term: 'Goods available for sale', def: 'Beginning inventory plus purchases for the period: everything the business could have sold. It ends either in cost of goods sold or in ending inventory.' },
    { term: 'Perpetual inventory system', def: 'A system that updates the Inventory account with every purchase and records cost of goods sold with every sale.' },
    { term: 'Periodic inventory system', def: 'A system that records purchases in a Purchases account and calculates cost of goods sold only at the end of the period, from a physical count of ending inventory.' },
    { term: 'Shrinkage', def: 'Inventory lost to theft, damage, spoilage or recording error, found when a physical count is lower than the records.' },
    { term: 'Freight-in', def: 'The cost of transporting purchased goods to the buyer. It is part of the cost of inventory; freight-out, to customers, is a selling expense.' },
    { term: 'FIFO', def: 'First in, first out: a cost formula that assigns the oldest costs to the units sold, leaving the most recent costs in ending inventory.' },
    { term: 'LIFO', def: 'Last in, first out: a cost formula that assigns the newest costs to the units sold, leaving the oldest costs in ending inventory. Allowed under US GAAP, prohibited by IAS 2.' },
    { term: 'Weighted average cost', def: 'A cost formula that assigns every unit the average cost of the goods available: total cost divided by total units. Under a perpetual system the moving average recalculates it after each purchase.' },
    { term: 'LIFO conformity rule', def: 'The US tax rule (26 U.S.C. §472) that a taxpayer using LIFO for tax must not use another method to measure income in its reports to owners or for credit purposes.' },
    { term: 'Net realisable value', def: 'For inventory, the estimated selling price in the ordinary course of business less the estimated costs of completion and of making the sale.' },
    { term: 'Lower of cost and net realisable value', def: 'The rule that inventory is carried at the lower of its cost and its net realisable value; the reduction is an expense of the period.' },
    { term: 'Inventory write-down', def: 'A reduction of inventory’s carrying amount to net realisable value, recognised as an expense. IFRS requires it to be reversed if value recovers, up to the original amount; US GAAP doesn’t allow a reversal.' },
    { term: 'Gross profit', def: 'Net sales (or net revenue) minus cost of goods sold (or cost of sales). Called gross margin in some textbooks.' },
    { term: 'Gross margin', def: 'Gross profit as a percentage of net sales or net revenue; also called the gross profit margin.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 10.2, “Calculate the Cost of Goods Sold and Ending Inventory Using the Periodic Method”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/10-2-calculate-the-cost-of-goods-sold-and-ending-inventory-using-the-periodic-method', checked: '2026-10-23' },
    { text: 'Australian Accounting Standards Board. <i>Compiled AASB 102 Inventories</i> (compiled 31 December 2021), which incorporates IAS 2 with its paragraph numbering; paragraphs 9, 10, 11, 16, 25, 28, 33 and 34. Federal Register of Legislation.', url: 'https://www.legislation.gov.au/F2015L01624/2021-12-31/2021-12-31/text/original/epub/OEBPS/document_1/document_1.html', checked: '2026-10-23' },
    { text: 'International Accounting Standards Board. <i>Basis for Conclusions on IAS 2 Inventories</i> (revised December 2003): the elimination of LIFO. Published by the External Reporting Board (New Zealand).', url: 'https://www.xrb.govt.nz/dmsdocument/6029/', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2015). <i>Accounting Standards Update No. 2015-11, Inventory (Topic 330): Simplifying the Measurement of Inventory</i> (ASC 330-10-35-1B and 35-1C; effective dates). Full text on PwC Viewpoint.', url: 'https://viewpoint.pwc.com/dt/us/en/fasb_financial_accou/asus_fulltext/2015/asu_201511inventory_/asu_201511inventory__US/asu_201511inventory__US.html', checked: '2026-10-23' },
    { text: 'PwC. <i>Inventory</i> guide, section 3.8.3, “LIFO: reversal of valuation reserves” (quotes ASC 330-10-35-14). Viewpoint.', url: 'https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/inventory/Inventory-Guide/3_chapter_LIFO_inv/38_Low_of_cost1.html', checked: '2026-10-23' },
    { text: '<i>United States Code</i>, title 26, §472, “Last-in, first-out inventories” (subsections (c) and (e)). GovInfo, US Government Publishing Office.', url: 'https://www.govinfo.gov/content/pkg/USCODE-2021-title26/html/USCODE-2021-title26-subtitleA-chap1-subchapE-partII-subpartD-sec472.htm', checked: '2026-10-23' },
  ],

  checks: [
    // the case
    { what: 'Purchases', value: inv.purchases, shown: 58600 },
    { what: 'COGS from perpetual records', value: inv.cogsPerpetual, shown: 52400 },
    { what: 'Write-down', value: inv.writeDown, shown: 400 },
    { what: 'Write-down = cost − NRV (e7)', value: holiday.cost - holiday.nrv, shown: inv.writeDown },
    { what: 'Holiday Blend cost', value: holiday.cost, shown: 1000 },
    { what: 'Holiday Blend NRV', value: holiday.nrv, shown: 600 },
    { what: 'Ending inventory', value: D.inventoryEnd, shown: 5800 },
    { what: 'Ending inventory = purchases − COGS − write-down', value: inv.purchases - inv.cogsPerpetual - inv.writeDown, shown: 5800 },
    { what: 'COGS', value: D.cogs, shown: 52800 },
    { what: 'COGS by the periodic formula', value: 0 + inv.purchases - D.inventoryEnd, shown: 52800 },
    { what: 'COGS = perpetual + write-down', value: inv.cogsPerpetual + inv.writeDown, shown: 52800 },
    { what: 'Net online sales', value: D.netOnlineSales, shown: 110000 },
    { what: 'Shop gross profit', value: D.netOnlineSales - D.cogs, shown: 57200 },
    { what: 'Shop gross margin', value: D.shopGrossMargin, shown: 0.52, tol: 0.00005 },
    { what: 'Cost share of net sales (48 cents)', value: D.cogs / D.netOnlineSales * 100, shown: 48, tol: 0.005 },
    { what: 'Shipping expense', value: FACTS.shipping, shown: 12630 },
    { what: 'Card and platform fees', value: FACTS.shop.cardFees, shown: 4010 },
    // House Blend
    { what: 'Opening layer cost', value: HB.opening.units * HB.opening.cost, shown: 2400 },
    { what: 'October layer', value: HB.purchases[0].units * HB.purchases[0].cost, shown: 5040 },
    { what: 'November layer', value: HB.purchases[1].units * HB.purchases[1].cost, shown: 7920 },
    { what: 'December layer', value: HB.purchases[2].units * HB.purchases[2].cost, shown: 10800 },
    { what: 'Units available', value: C.units, shown: 3000 },
    { what: 'Goods available', value: C.goodsAvailable, shown: 26160 },
    { what: 'Bags sold', value: HB.sold, shown: 2600 },
    { what: 'Bags left', value: C.endUnits, shown: 400 },
    { what: 'FIFO COGS', value: C.fifo.cogs, shown: 22560 },
    { what: 'FIFO COGS (prose)', value: 2400 + 5040 + 7920 + 800 * 9, shown: 22560 },
    { what: 'FIFO ending', value: C.fifo.ending, shown: 3600 },
    { what: 'LIFO COGS', value: C.lifo.cogs, shown: 22920 },
    { what: 'LIFO COGS (prose)', value: 10800 + 7920 + 500 * 8.4, shown: 22920 },
    { what: 'LIFO ending', value: C.lifo.ending, shown: 3240 },
    { what: 'LIFO ending (prose)', value: 2400 + 100 * 8.4, shown: 3240 },
    { what: 'Average unit cost', value: C.average.unitCost, shown: 8.72 },
    { what: 'Average COGS', value: C.average.cogs, shown: 22672 },
    { what: 'Average ending', value: C.average.ending, shown: 3488 },
    { what: 'Average vs FIFO gross profit', value: C.fifo.cogs - C.average.cogs, shown: -112 },
    { what: 'LIFO vs FIFO gross profit', value: C.fifo.cogs - C.lifo.cogs, shown: -360 },
    { what: 'Average tax difference', value: rate * (C.fifo.cogs - C.average.cogs), shown: -28 },
    { what: 'LIFO tax difference', value: rate * (C.fifo.cogs - C.lifo.cogs), shown: -90 },
    { what: 'Tax rate', value: rate * 100, shown: 25 },
    // Holiday Blend recovery
    { what: 'Hypothetical NRV 2027', value: holiday.nrv2027, shown: 800 },
    { what: 'IFRS reversal', value: Math.min(holiday.cost, holiday.nrv2027) - holiday.nrv, shown: 200 },
    // inventory error
    { what: 'Error', value: err, shown: 2000 },
    { what: 'Error after tax', value: err * (1 - rate), shown: 1500 },
    { what: 'Apparent swing', value: 2 * err, shown: 4000 },
    // Holiday bags count
    { what: 'Holiday Blend cost per bag ($8) × 125 bags', value: 125 * 8, shown: holiday.cost },
    // Clovehill
    { what: 'Clovehill goods available', value: clAvail, shown: 1800 },
    { what: 'Clovehill FIFO COGS', value: 100 * 5 + 100 * 6, shown: 1100 },
    { what: 'Clovehill FIFO ending', value: 100 * 7, shown: 700 },
    { what: 'Clovehill periodic LIFO ending', value: 100 * 5, shown: 500 },
    { what: 'Clovehill periodic LIFO COGS', value: clAvail - 500, shown: 1300 },
    { what: 'Clovehill perpetual LIFO 10 March', value: 100 * 6 + 20 * 5, shown: 700 },
    { what: 'Clovehill perpetual LIFO 28 March', value: 80 * 7, shown: 560 },
    { what: 'Clovehill perpetual LIFO COGS', value: 700 + 560, shown: 1260 },
    { what: 'Clovehill perpetual LIFO ending', value: 80 * 5 + 20 * 7, shown: 540 },
    { what: 'Clovehill periodic average', value: clAvail / 300, shown: 6 },
    { what: 'Clovehill periodic average COGS', value: 200 * 6, shown: 1200 },
    { what: 'Clovehill periodic average ending', value: 100 * 6, shown: 600 },
    { what: 'Clovehill moving average 1', value: mavg1, shown: 5.5 },
    { what: 'Clovehill sale 1 cost', value: cl.sell1 * mavg1, shown: 660 },
    { what: 'Clovehill left after sale 1', value: mLeft1, shown: 440 },
    { what: 'Clovehill cost after 20 March', value: mLeft1 + 700, shown: 1140 },
    { what: 'Clovehill moving average 2', value: mavg2, shown: 6.333, tol: 0.0005 },
    { what: 'Clovehill sale 2 cost', value: cl.sell2 * mavg2, shown: 506.67 },
    { what: 'Clovehill moving average COGS', value: mCogs, shown: 1166.67 },
    { what: 'Clovehill moving average ending', value: clAvail - mCogs, shown: 633.33 },
    // Ironvale
    { what: 'Ironvale extra COGS (millions)', value: (as.lifoCogs - as.fifoCogs) / 1e6, shown: 0.4 },
    { what: 'Ironvale LIFO pretax (millions)', value: (as.fifoPretax - (as.lifoCogs - as.fifoCogs)) / 1e6, shown: 1.1 },
    { what: 'Ironvale tax saved', value: as.federal * (as.lifoCogs - as.fifoCogs), shown: 84000 },
    { what: 'Ironvale covenant (millions)', value: as.covenant / 1e6, shown: 1.2 },
    { what: 'Federal rate', value: as.federal * 100, shown: 21 },
  ],
};
