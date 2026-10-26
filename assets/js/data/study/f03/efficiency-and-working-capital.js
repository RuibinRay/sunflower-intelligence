// efficiency-and-working-capital.js — F03 · Efficiency and working capital. Content only; exercises are in
// efficiency-and-working-capital.ex.js.
// Lantern’s figures come from case.js (PERIODS, COMPARATIVE, FACTS), F02’s facts for 2026’s purchases and invoiced
// catering, and the ratios from core/ratios.js. Conventions in this lesson (stated in the text):
//  - receivables days use credit sales BILLED to receivables: invoiced catering (2026 $59,920; 2027 $85,880). PERIODS’
//    creditSales is all catering revenue, which also contains revenue that never passed through receivables (the law
//    firm’s $30,840 in the contract asset; events paid by deposit). The lesson shows both and explains the mismatch.
//  - inventory turnover uses cost of goods sold (goods only); Lantern’s cost of sales also holds cost of services.
//  - payables days use purchases on account (stock, supplies and unpaid utility bills), as core/ratios.js does when
//    `purchases` is given.
// 2026 uses closing balances and 304.17 days; 2027 average balances and 365 days. Amazon 2013–2014 figures are from
// its 10-Ks (EDGAR XBRL R pages).
import { PERIODS, COMPARATIVE, FACTS } from './case.js?v=18';
import { FACTS as F02 } from '../f02/case.js?v=18';
import * as R from '../../../core/ratios.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const inc = (label) => COMPARATIVE.income.find((r) => r[0] === label);
const COGS26 = inc('Cost of Goods Sold')[1], COGS27 = inc('Cost of Goods Sold')[2];
const PUR26 = F02.inventory.purchases + F02.supplies.bought + F02.utilities.unpaid;           // 70,430
const PUR27 = FACTS.inventory.purchases + FACTS.supplies.bought + FACTS.utilities.unpaid;     // 187,780
const INV26 = F02.catering.invoiced, INV27 = FACTS.catering.invoiced;                          // 59,920; 85,880
const E26d = { ...P26, cogs: COGS26, purchases: PUR26, revenue: INV26 };
const E27d = { ...P27, cogs: COGS27, purchases: PUR27, revenue: INV27 };
const E26 = R.efficiency(E26d), E27 = R.efficiency(E27d, E26d);
const T26 = R.efficiency(P26), T27 = R.efficiency(P27, P26);                                   // turnovers on revenue
const conv27 = R.efficiency({ ...P27, revenue: P27.creditSales }, P26);                        // all catering revenue
const conv26 = R.efficiency({ ...P26, revenue: P26.creditSales });
const total27 = R.efficiency(P27, P26);                                                        // total revenue (the slip)
const cos27 = R.efficiency({ ...P27 }, P26);                                                   // cost of sales incl. services
const avgAR = (P26.receivables + P27.receivables) / 2;
const withCA = { ar: (P26.receivables + P27.receivables + P27.contractAsset) / 2, sales: INV27 + P27.contractAsset };
const dsoCA = withCA.ar / withCA.sales * 365;
const fee = FACTS.lawFirm.baseFee * (1 + FACTS.lawFirm.expectedInflation);                      // 41,120
const caDaysRev = P27.contractAsset / P27.revenue * 365;
const caDaysFee = P27.contractAsset / (fee / 365);
const ccc26 = E26.dso + E26.dio - E26.dpo, ccc27 = E27.dso + E27.dio - E27.dpo;
const cafeCycle = E27.dio - E27.dpo;
const atAnn26 = R.annualise(P26.revenue, 10) / P26.totalAssets;
const fatAnn26 = R.annualise(P26.revenue, 10) / P26.ppeNet;
const atExROU = P27.revenue / ((P26.totalAssets + P27.totalAssets - P27.rightOfUse) / 2);
// working capital absorbed in 2027 (indirect method lines)
const wc = Object.fromEntries(COMPARATIVE.indirect2027.map(([l, v]) => [l, v]));
const wcTotal = COMPARATIVE.indirect2027.slice(2, -1).reduce((s, r) => s + r[1], 0);          // −33,890
// the applied example
const quarterly = fee * 3 / 12;                                                                 // 10,280
const released = P27.contractAsset - quarterly;                                                 // 20,560
const stockPerDay = FACTS.inventory.purchases / 365;
const kiln = 15 * stockPerDay;                                                                  // 6,855
const kilnSave = kiln * FACTS.lineOfCredit.rate;                                                // 617
const dioCut = 3 * COGS27 / 365;                                                                // 1,341
// Amazon (10-K 2014 and 2013), $ millions
const AMZ = {
  2012: { receivables: 3817, inventory: 6031, payables: 13318 },
  2013: { revenue: 74452, cogs: 54181, receivables: 4767, inventory: 7411, payables: 15133 },
  2014: { revenue: 88988, cogs: 62752, receivables: 5612, inventory: 8299, payables: 16459 },
};
const A14 = R.efficiency(AMZ[2014], AMZ[2013]), A13 = R.efficiency(AMZ[2013], AMZ[2012]);
const amzOWC14 = AMZ[2014].receivables + AMZ[2014].inventory - AMZ[2014].payables;
const d1 = (v) => v.toFixed(1), x2 = (v) => v.toFixed(2);

export default {
  slug: 'efficiency-and-working-capital',
  title: 'Efficiency and working capital',
  blurb: 'Measure how hard a business makes its assets work and how long its cash is tied up: asset turnover, receivables, inventory and payables days, the operating and cash conversion cycles, the contract asset as revenue waiting to be billed, and why growth eats cash.',
  status: 'draft',
  objectives: [
    'Calculate asset turnover and fixed-asset turnover, on average balances, and adjust a part-year for comparison.',
    'Calculate receivables, inventory and payables turnover and their days, choosing the flow that matches each balance (credit sales billed, cost of goods sold, purchases).',
    'Calculate the operating cycle and the cash conversion cycle, and interpret a negative cycle such as Amazon’s.',
    'Measure a contract asset as days of revenue tied up, and explain why it belongs neither in receivables days nor out of the analysis.',
    'Estimate the cash that growth absorbs, and the cash released by changing credit, stock or supplier terms.',
  ],
  prerequisites: [
    { lesson: 'f03/liquidity', why: 'Liquidity measures the stock of working capital at one date; this lesson measures how fast it turns over.' },
    { lesson: 'f02/receivables-and-payables', why: 'Net receivables, the allowance, credit terms and payables come from there.' },
    { lesson: 'f02/inventory-and-cost-of-goods-sold', why: 'Inventory turnover uses cost of goods sold, which that lesson builds.' },
    { lesson: 'f02/indirect-method', why: 'Working-capital changes in the indirect method are the cash side of the same story.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s revenue tripled in 2027, yet its operations brought in only $8,341 of cash against $39,940 in its first ten months. Ana wants to know where the cash went. Part of the answer is in the liquidity lesson: the cafés were paid for in cash. The rest is in how long Lantern’s money now waits at each stage between buying beans and being paid by customers, and that is what efficiency ratios measure.' },
    { p: 'Efficiency ratios (also called activity or turnover ratios) compare a flow from the income statement with a balance from the balance sheet. A <g>turnover</g> divides the flow by the balance: how many times a year the balance is used up and replaced. Days divides the balance by the flow per day: how long the balance would last, or how long an item waits on average. The two say the same thing, upside down: days = days in the period ÷ turnover.' },
    { p: 'Two families matter. <b>Asset turnover</b> asks how much revenue each dollar of assets generates; it is one of the three drivers of return on equity in module 3. The <b>working-capital days</b> follow cash around the <g>operating cycle</g>: the business buys stock on credit (payables days), holds it (inventory days), sells it on credit (receivables days) and finally collects the cash. The <g>cash conversion cycle</g> is the number of days the business itself must finance between paying its suppliers and being paid by its customers.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 170" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><line x1="40" y1="60" x2="600" y2="60" stroke="var(--rule-strong)"/><rect x="40" y="45" width="140" height="30" fill="var(--series-1)"/><rect x="180" y="45" width="300" height="30" fill="var(--series-2)"/><text x="110" y="35" text-anchor="middle" fill="currentColor">Inventory days (DIO)</text><text x="330" y="35" text-anchor="middle" fill="currentColor">Receivables days (DSO)</text><rect x="40" y="95" width="150" height="24" fill="var(--series-3)"/><text x="115" y="140" text-anchor="middle" fill="currentColor">Payables days (DPO)</text><line x1="190" y1="125" x2="480" y2="125" stroke="currentColor" stroke-width="2"/><text x="335" y="155" text-anchor="middle" fill="currentColor">Cash conversion cycle = DIO + DSO − DPO</text><text x="40" y="20" fill="currentColor">Stock bought</text><text x="600" y="20" text-anchor="end" fill="currentColor">Cash collected</text></svg>',
      caption: 'The operating cycle (inventory days plus receivables days) and the part of it the business finances itself, the cash conversion cycle.',
      alt: 'A timeline from stock bought (left) to cash collected (right). Above the line, a bar for inventory days is followed by a longer bar for receivables days; together they are the operating cycle. Below the line, a bar for payables days starts at the left: the supplier’s credit covers the first part of the cycle. A line from the end of the payables bar to the end of the receivables bar is labelled cash conversion cycle = DIO + DSO − DPO.',
    } },
    { table: {
      caption: 'Lantern’s efficiency ratios (fictional)',
      head: ['Measure', '2026 (ten months, closing balances)', '2027 (average balances)'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Asset turnover', `${x2(T26.assetTurnover)} (${x2(atAnn26)} annualised)`, x2(T27.assetTurnover)],
        ['Fixed-asset turnover', `${x2(T26.fixedAssetTurnover)} (${x2(fatAnn26)} annualised)`, x2(T27.fixedAssetTurnover)],
        ['Receivables days (DSO), on invoiced catering', d1(E26.dso), d1(E27.dso)],
        ['Inventory days (DIO), on cost of goods sold', d1(E26.dio), d1(E27.dio)],
        ['Payables days (DPO), on purchases on account', d1(E26.dpo), d1(E27.dpo)],
        ['Cash conversion cycle (days)', d1(ccc26), d1(ccc27)],
      ],
      note: 'Days use 304.17 days for 2026’s ten months and 365 for 2027. 2026 has no opening balance sheet, so it uses closing balances.',
    } },
    { p: 'Lantern made its assets work harder: each dollar of average assets produced $2.74 of revenue in 2027, against $2.48 (annualised) in 2026, and its equipment and fit-out turned over 8.72 times. Stock moved faster too, 17.1 days against 33.4. But catering clients took longer to pay (37.2 days against 34.5), Lantern paid its own suppliers much faster (18.0 days against 39.8), and the cycle it must finance lengthened from 28.1 to 36.3 days. Above all, $30,840 of revenue sits in the contract asset, which none of these ratios counts. The rest of the lesson builds each measure and then puts the pieces together.' },
    { callout: 'key', title: 'Match the flow to the balance', html: 'Every efficiency ratio divides a balance by the flow that creates it. Receivables come from sales on credit, so use credit sales; inventory leaves at cost, so use cost of goods sold; payables come from purchases on credit, so use purchases. A mismatched pair gives a precise-looking number that measures nothing. Most of the classic slips in this lesson are mismatches.' },
  ],

  theory: [
    { h: 'Asset turnover' },
    { p: '<b>Asset turnover</b> is revenue divided by average total assets; <b>fixed-asset turnover</b> uses average property and equipment, net, instead. Because revenue is earned over the whole year and assets change during it, the average of the opening and closing balances is the better divisor. Lantern 2027: average total assets <m>(93{,}676 + 327{,}883) \\div 2 = 210{,}779.5</m>, so asset turnover is <m>577{,}860 \\div 210{,}779.5 = 2.74</m>. For 2026 there is no opening balance sheet (Lantern started on 1 March with nothing), so the closing balance stands in, and the ten months of revenue must be annualised before comparing: <m>193{,}320 \\times 12 \\div 10 \\div 93{,}676 = 2.48</m>.' },
    { p: 'Asset turnover depends on the business model as much as on management. A café chain with leased premises has a different asset base from a roaster that owns its plant. And since ASC 842 the right-of-use asset for leased premises is in total assets: Lantern’s $173,379 of right-of-use assets is more than half its year-end total. Leaving it out, average assets would be $124,090 and asset turnover 4.66. Neither figure is wrong; compare like with like.' },

    { h: 'Receivables: turnover and days' },
    { p: '<b>Receivables turnover</b> divides credit sales by average net receivables; <g>days sales outstanding</g> (DSO) turns it into days: the average number of days customers take to pay. Only sales on credit create receivables, so only they belong in the numerator. Lantern’s café, shop and workshop sales are paid at the till or online at once; only catering is invoiced on 30-day terms.' },
    { p: 'Even catering revenue needs care. Lantern’s 2027 catering revenue of $118,360 includes $30,840 for the law firm, which is in the contract asset and has never been billed, and $1,640 for January events paid for by deposits in 2026. Neither passed through accounts receivable. The sales that did were the $85,880 invoiced in the year. Matching flow and balance:' },
    { math: String.raw`\text{DSO}_{2027} = \dfrac{\overline{\text{Receivables}}}{\text{Credit sales}} \times 365 = \dfrac{8{,}747}{85{,}880} \times 365 = 37.2 \text{ days}` },
    { p: 'Using all catering revenue gives 27.0 days, and using total revenue 5.5 days: both divide receivables by sales that never became receivables, so both understate how long clients take to pay. The aging schedule agrees with 37.2: of the $11,460 owed at the year end, $3,060 was more than 30 days old, past Lantern’s terms. For 2026, with closing receivables of $6,796 and $59,920 invoiced in ten months, DSO is <m>6{,}796 \\div 59{,}920 \\times 304.17 = 34.5</m> days. The days in a ten-month period are <m>365 \\times 10 \\div 12 = 304.17</m>; using 365 with ten months of sales would overstate the days by a fifth.' },

    { h: 'The contract asset: revenue waiting to be billed' },
    { p: 'The contract asset is not a receivable, so it stays out of DSO. It is still working capital: cash Lantern has earned and is waiting for. Measure it in days of revenue. At 31 December 2027 it held <m>30{,}840 \\div 577{,}860 \\times 365 = 19.5</m> days of Lantern’s total revenue, and 274 days, nine months, of the law firm’s fee: every event since April. Counting it as if it were a receivable, DSO would be 75.6 days. That figure mixes two kinds of asset and is not a collection measure, but it shows a lender how much of Lantern’s revenue is still outside its bank account. Whether 2027’s profit is as good as it looks, given that $30,840 of it rests on a CPI estimate and one client, is the cash-flow-quality lesson’s question.' },

    { h: 'Inventory: turnover and days' },
    { p: '<b>Inventory turnover</b> divides cost of goods sold by average inventory; <g>days inventory outstanding</g> (DIO) is the average number of days stock waits before it is sold. Cost of goods sold, not revenue, because inventory is carried at cost. Lantern’s cost of sales, $224,205, also includes $61,080 of cost of services (event baristas and catering supplies), which never passed through inventory, so use cost of goods sold, $163,125:' },
    { math: String.raw`\text{DIO}_{2027} = \dfrac{\overline{\text{Inventory}}}{\text{COGS}} \times 365 = \dfrac{7{,}637.5}{163{,}125} \times 365 = 17.1 \text{ days}` },
    { p: 'With the whole cost of sales the answer is 12.4 days, which flatters the stock. For 2026, <m>5{,}800 \\div 52{,}800 \\times 304.17 = 33.4</m> days. Lantern’s stock moves faster now because café stock (milk, pastries, cups) is used within days, while bagged beans for the shop can wait for weeks. A blended ratio hides that, and a business with very different product lines is better analysed line by line where the data allow.' },

    { h: 'Payables: turnover and days' },
    { p: '<g>Days payables outstanding</g> (DPO) is the average number of days the business takes to pay its suppliers: average payables divided by purchases on credit, times the days. Purchases, not cost of goods sold, because payables arise when goods are bought, and Lantern’s payables include supplies and unpaid utility bills as well as beans. In 2027 Lantern bought $187,780 on account ($166,800 of stock, $19,800 of supplies and $1,180 of December utility bills): <m>9{,}245 \\div 187{,}780 \\times 365 = 18.0</m> days. In 2026, <m>9{,}210 \\div 70{,}430 \\times 304.17 = 39.8</m> days. When purchases are not disclosed, as for most public companies, analysts use cost of goods sold (or cost of sales) and say so.' },
    { p: 'The 2026 figure is inflated by the year end. Lantern bought heavily for the December gift peak, so its payables at 31 December were high compared with an average month, and with no opening balance there is nothing to average against. Kilnworth’s terms are 30 days in both years. A year-end balance in a seasonal business can mislead any days ratio; quarterly balances, where available, give a better average.' },

    { h: 'The operating cycle and the cash conversion cycle' },
    { p: 'The operating cycle is inventory days plus receivables days: how long from buying stock to collecting cash for it. Suppliers finance part of it; the cash conversion cycle is the rest:' },
    { math: String.raw`\text{CCC} = \text{DIO} + \text{DSO} - \text{DPO}` },
    { p: 'Lantern 2027: <m>17.1 + 37.2 - 18.0 = 36.3</m> days, against 28.1 in 2026. Read it with care for a mixed business. The 37.2 days of DSO apply only to catering, about 15% of revenue. For the cafés and the shop, paid at once, the cycle is inventory days less payables days, <m>17.1 - 18.0 = -0.9</m> days: they are paid for their stock a little before they pay for it. The catering-and-stock cycle has lengthened, and Lantern now pays its suppliers within 18 days though their terms allow 30: as cash grew scarce, it was not taking the credit it was offered.' },
    { h: 'A negative cycle: Amazon' },
    { p: 'A business that sells its stock quickly, is paid at once and pays its suppliers late can have a negative cash conversion cycle: its suppliers finance its operations and growth adds cash rather than using it. Amazon’s 10-K figures for 2013 and 2014 show it.' },
    { table: {
      caption: 'Amazon.com, Inc.: working-capital days (average balances, 365 days)',
      head: ['Measure', '2013', '2014'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Receivables days (on total net sales)', d1(A13.dso), d1(A14.dso)],
        ['Inventory days (on cost of sales)', d1(A13.dio), d1(A14.dio)],
        ['Payables days (on cost of sales)', d1(A13.dpo), d1(A14.dpo)],
        ['Cash conversion cycle', d1(A13.cashConversionCycle), d1(A14.cashConversionCycle)],
      ],
      note: 'Computed from Amazon’s consolidated balance sheets (31 December 2012, 2013 and 2014) and statements of operations. Receivables are Amazon’s “accounts receivable, net and other”; credit sales and purchases are not disclosed, so total net sales and cost of sales are used. At 31 December 2014 accounts payable ($16,459 million) exceeded inventories and receivables together ($13,911 million).',
    } },
    { p: 'For Amazon, each extra dollar of sales brought cash in before the stock had to be paid for. For Lantern’s catering the opposite holds: each extra event ties up cash for about 36 days, and the law firm’s contract for up to a year.' },

    { h: 'How growth consumes working capital' },
    { p: 'When the cycle is positive, working capital grows with sales: more receivables, more stock, partly offset by more payables. A rough rule:' },
    { math: String.raw`\text{Operating working capital} \approx \text{Credit sales} \times \dfrac{\text{DSO}}{365} + \text{COGS} \times \dfrac{\text{DIO}}{365} - \text{Purchases} \times \dfrac{\text{DPO}}{365}` },
    { p: 'If the days stay the same, operating working capital grows in proportion to sales, and that increase is cash the business must find before it can spend its profit. The indirect method shows Lantern’s 2027 bill: working capital absorbed $33,890, of which $30,840 was the contract asset, $3,902 the increase in receivables and $3,675 the increase in stock, partly offset by $2,960 more unearned revenue and $2,200 more wages payable. That is why $22,431 of net income and $19,800 of depreciation became only $8,341 of cash from operations.' },
  ],

  formulas: [
    { id: 'eff-asset-turnover', name: 'Asset turnover',
      tex: String.raw`\text{Asset turnover} = \dfrac{\text{Revenue}}{\overline{\text{Total assets}}}`,
      where: [[String.raw`\text{Revenue}`, 'Net revenue for a twelve-month period (annualise a part-year)', '$'], [String.raw`\overline{\text{Total assets}}`, 'Average of opening and closing total assets (closing if there is no opening balance sheet)', '$']],
      note: 'Times a year. Lantern 2027: 2.74. Fixed-asset turnover uses average property and equipment, net (Lantern 2027: 8.72).' },
    { id: 'eff-fixed-asset-turnover', name: 'Fixed-asset turnover',
      tex: String.raw`\text{Fixed-asset turnover} = \dfrac{\text{Revenue}}{\overline{\text{PP\&E, net}}}`,
      where: [[String.raw`\text{Revenue}`, 'Net revenue for the period', '$'], [String.raw`\overline{\text{PP\&E, net}}`, 'Average property, plant and equipment, net of accumulated depreciation; right-of-use assets excluded unless stated', '$']],
      note: 'Lantern: 5.20 (2026, ten months), 8.72 (2027).' },
    { id: 'eff-dso', name: 'Receivables turnover and days sales outstanding',
      tex: String.raw`\text{DSO} = \dfrac{\text{Days}}{\text{Receivables turnover}} = \dfrac{\overline{\text{Receivables}}}{\text{Credit sales}} \times \text{Days}`,
      where: [[String.raw`\overline{\text{Receivables}}`, 'Average of opening and closing net receivables (not contract assets)', '$'], [String.raw`\text{Credit sales}`, 'Sales billed on credit during the period: the sales that passed through receivables', '$'], [String.raw`\text{Days}`, 'Days in the period: 365 for a year, 304.17 for ten months', 'days']],
      assumptions: 'Receivables turnover = credit sales ÷ average receivables. When credit sales are not disclosed, total revenue is used and the result understates the days.',
      note: 'Lantern 2027: <m>8{,}747 \\div 85{,}880 \\times 365 = 37.2</m> days.' },
    { id: 'eff-dio', name: 'Inventory turnover and days inventory outstanding',
      tex: String.raw`\text{DIO} = \dfrac{\overline{\text{Inventory}}}{\text{COGS}} \times \text{Days}`,
      where: [[String.raw`\overline{\text{Inventory}}`, 'Average of opening and closing inventory', '$'], [String.raw`\text{COGS}`, 'Cost of goods sold for the period (not cost of services)', '$'], [String.raw`\text{Days}`, 'Days in the period', 'days']],
      assumptions: 'Inventory turnover = COGS ÷ average inventory.',
      note: 'Lantern 2027: 17.1 days (turnover 21.36).' },
    { id: 'eff-dpo', name: 'Payables turnover and days payables outstanding',
      tex: String.raw`\text{DPO} = \dfrac{\overline{\text{Payables}}}{\text{Purchases}} \times \text{Days}`,
      where: [[String.raw`\overline{\text{Payables}}`, 'Average of opening and closing accounts payable', '$'], [String.raw`\text{Purchases}`, 'Purchases on credit for the period; cost of goods sold when purchases are not known (say so)', '$'], [String.raw`\text{Days}`, 'Days in the period', 'days']],
      note: 'Purchases = COGS + closing inventory − opening inventory, when all stock is bought on credit. Lantern 2027: 18.0 days.' },
    { id: 'eff-ccc', name: 'Operating cycle and cash conversion cycle',
      tex: String.raw`\text{CCC} = \text{DIO} + \text{DSO} - \text{DPO}`,
      where: [[String.raw`\text{DIO}`, 'Days inventory outstanding', 'days'], [String.raw`\text{DSO}`, 'Days sales outstanding', 'days'], [String.raw`\text{DPO}`, 'Days payables outstanding', 'days']],
      note: 'The operating cycle is DIO + DSO. Lantern 2027: CCC 36.3 days; operating cycle 54.3 days. Amazon 2014: −24.9 days.' },
    { id: 'eff-contract-days', name: 'Contract asset in days of revenue',
      tex: String.raw`\text{Contract asset days} = \dfrac{\text{Contract asset}}{\text{Revenue}} \times \text{Days}`,
      where: [[String.raw`\text{Contract asset}`, 'Revenue earned but not yet billable, at the year end', '$'], [String.raw`\text{Revenue}`, 'Total revenue for the period, or the revenue of the contract concerned', '$'], [String.raw`\text{Days}`, 'Days in the period', 'days']],
      note: 'Lantern 2027: 19.5 days of total revenue; 274 days of the law firm’s fee.' },
  ],

  examples: [
    { level: 'simple', title: 'Lantern’s receivables and inventory days, 2027',
      fictional: true,
      setup: 'Lantern’s net receivables were $6,796 at 31 December 2026 and $10,698 at 31 December 2027; it invoiced $85,880 of catering in 2027. Its inventory was $5,800 and $9,475, and cost of goods sold $163,125. Calculate receivables and inventory turnover and days for 2027.',
      steps: [
        String.raw`Average receivables: <m>(6{,}796 + 10{,}698) \div 2 = 8{,}747</m>. Receivables turnover: <m>85{,}880 \div 8{,}747 = 9.82</m>. DSO: <m>365 \div 9.82 = 37.2</m> days.`,
        String.raw`Average inventory: <m>(5{,}800 + 9{,}475) \div 2 = 7{,}637.5</m>. Inventory turnover: <m>163{,}125 \div 7{,}637.5 = 21.36</m>. DIO: <m>365 \div 21.36 = 17.1</m> days.`,
        'Check the flows: the invoiced catering is the only revenue that went into receivables, and cost of goods sold (not the cost of services) is what left inventory.',
      ],
      answer: 'Receivables turnover 9.82, DSO 37.2 days; inventory turnover 21.36, DIO 17.1 days.',
      interpretation: 'Catering clients take about a week longer than Lantern’s 30-day terms, consistent with the aging schedule; stock sells in a little over two weeks on average.' },
    { level: 'challenging', title: 'The cash conversion cycle, both years, and what changed',
      fictional: true,
      setup: 'Calculate Lantern’s cash conversion cycle for 2026 and 2027 and explain the change. For 2026 use closing balances and 304.17 days: receivables $6,796, invoiced catering $59,920; inventory $5,800, COGS $52,800; payables $9,210, purchases on account $70,430. For 2027 use averages and 365 days, with payables of $9,280 at the year end and purchases on account of $187,780.',
      steps: [
        String.raw`2026: DSO <m>6{,}796 \div 59{,}920 \times 304.17 = 34.5</m>; DIO <m>5{,}800 \div 52{,}800 \times 304.17 = 33.4</m>; DPO <m>9{,}210 \div 70{,}430 \times 304.17 = 39.8</m>. CCC <m>34.5 + 33.4 - 39.8 = 28.1</m> days.`,
        String.raw`2027: DSO 37.2 and DIO 17.1 (simple example). Average payables <m>(9{,}210 + 9{,}280) \div 2 = 9{,}245</m>; DPO <m>9{,}245 \div 187{,}780 \times 365 = 18.0</m>. CCC <m>37.2 + 17.1 - 18.0 = 36.3</m> days.`,
        'Change: +8.2 days. Inventory days fell by 16.3 (good), receivables days rose by 2.7, and payables days fell by 21.8. The payables change dominates.',
        'Judgement: part of the payables change is the 2026 year end (December’s heavy buying, no opening balance to average); part is real: Lantern paid within 18 days though Kilnworth allows 30.',
      ],
      answer: 'CCC 28.1 days (2026) and 36.3 days (2027), mainly because payables days fell from 39.8 to 18.0.',
      interpretation: 'Lantern is financing more of its own cycle at the very time cash is short. Taking the full 30 days its supplier allows is the cheapest finance it has.' },
    { level: 'applied', title: 'Releasing cash from working capital',
      fictional: true,
      setup: 'Ana considers three changes for 2028 (all hypothetical): (a) ask the law firm to pay each quarter’s fee at the quarter end instead of the whole year in arrears; (b) take Kilnworth’s full terms and negotiate 45 days rather than 30; (c) cut stock by three days of cost of goods sold. Estimate the cash each would have released at the end of 2027, and compare it with the cost of the line of credit (9% a year).',
      steps: [
        String.raw`(a) Quarterly billing: at 31 December only the fourth quarter’s fee would be outstanding, <m>41{,}120 \times 3 \div 12 = 10{,}280</m>, as a receivable on 30-day terms. Cash released: <m>30{,}840 - 10{,}280 = 20{,}560</m>.`,
        String.raw`(b) Fifteen more days of credit on stock purchases of $166,800: <m>166{,}800 \div 365 \times 15 = 6{,}855</m>. At 9% that saves about <m>6{,}855 \times 0.09 = 617</m> a year of interest on the line of credit; if Kilnworth wanted even 1% more on its prices ($1,668), the deal would cost more than it saves.`,
        String.raw`(c) Three days of stock: <m>163{,}125 \div 365 \times 3 = 1{,}341</m>, with some risk of running out at the cafés.`,
        'Ranking: (a) is worth three times (b) and fifteen times (c), and costs only a conversation with one client, who may want something in return.',
      ],
      answer: 'About $20,560 from quarterly billing, $6,855 from 45-day supplier terms and $1,341 from three fewer days of stock.',
      interpretation: 'Working capital is cash. Lantern’s biggest lever is not its beans or its suppliers but one contract’s billing terms; a lender would rather see that changed than see the credit line drawn further.' },
  ],

  demo: [
    { widget: 'eff-turnover', intro: 'Asset and fixed-asset turnover from opening and closing balances. Start from Lantern’s 2027, then reproduce 2026 (ten months, no opening balance sheet) and see what annualising and the choice of average or closing balances do.' },
    { widget: 'eff-days', intro: 'Working-capital days for Lantern and for Amazon in 2014. Untick “Receivables days on credit sales only” to see the classic slip; tick the contract-asset box to see what DSO would be if the law firm’s unbilled fee were counted as a receivable.' },
    { widget: 'eff-growth', intro: 'How much cash does growth absorb? Start from Lantern’s 2027 catering-and-stock figures, then change the days and the growth rate.' },
  ],

  mistakes: [
    { title: 'Using total revenue for receivables days', html: 'Most of Lantern’s sales are paid at once, so dividing catering receivables by total revenue gives 5.5 days and hides a collection period of 37.2. Use sales on credit; if they are not disclosed, say that the result understates the days.' },
    { title: '“Catering revenue is credit sales.”', html: 'Only revenue that was invoiced on credit created receivables. Lantern’s catering revenue includes the law firm’s unbilled $30,840 and $1,640 of events paid by deposit; using it all gives 27.0 days instead of 37.2.' },
    { title: 'Inventory turnover on revenue or on all cost of sales', html: 'Inventory is carried at cost, so divide cost of goods sold by it. Revenue includes the margin and overstates turnover; cost of sales that includes services (Lantern’s event baristas) does too: 12.4 days instead of 17.1.' },
    { title: 'Closing balances when averages are available', html: 'A flow earned over the year belongs with the year’s average balance. Lantern’s 2027 DSO on closing receivables would be 45.5 days, overstated because receivables grew during the year. Use closing balances only when there is no opening balance sheet, as for 2026, and say so.' },
    { title: 'Ten months of flow, 365 days', html: 'A ten-month period has 304.17 days. Lantern’s 2026 inventory days computed with 365 would be 40.1 rather than 33.4. Either use the period’s days or annualise the flow; both give the same answer.' },
    { title: '“A shorter cash conversion cycle is always better.”', html: 'Paying suppliers late lengthens DPO but can cost discounts and goodwill; cutting stock can mean empty shelves; tight credit terms can lose clients. The cycle measures cash tied up, not the best way to run the business.' },
  ],

  application: [
    { p: '<b>A cash forecast built on days.</b> Lantern’s accountant forecasts 2028 working capital from days rather than guessing balances. If catering invoices grow to about $120,000 and clients still take 37.2 days, receivables will average about $12,230; if purchases on account reach $200,000 and Lantern takes Kilnworth’s full 30 days, payables will average about $16,438, $7,193 more than in 2027. Each assumption is a lever someone can be held to: the credit controller for DSO, the café managers for stock, Ana for supplier terms.' },
    { p: '<b>A lender’s view of the contract asset.</b> Coastline’s credit officer adds a line to her review: 19.5 days of Lantern’s revenue is waiting for a single billing date. Concentration matters as much as the days. If the law firm disputes the CPI adjustment or delays payment, Lantern’s March 2028 cash plan fails. She asks for the contract and its payment terms, which is what an analyst should do whenever a contract asset is large.' },
    { p: '<b>Comparing models.</b> An analyst comparing Lantern with an online retailer or a café chain should expect very different cycles: Amazon’s was −24.9 days in 2014, because its suppliers waited longer to be paid than its stock and its customers took together. The point of comparison is not the level but the direction and the reason: a cycle lengthening because clients pay late is a warning; one lengthening because the business stocks up for a launch may be a plan.' },
  ],

  summary: [
    'Efficiency ratios divide a flow by a balance (turnover) or a balance by the flow per day (days); days = days in the period ÷ turnover.',
    'Match the flow to the balance: credit sales billed for receivables, cost of goods sold for inventory, purchases for payables. Use average balances where an opening balance sheet exists, and the period’s days (304.17 for ten months) or annualised flows for part-years.',
    'Lantern 2027: asset turnover 2.74 (2.48 annualised in 2026); DSO 37.2 days on invoiced catering; DIO 17.1 days on cost of goods sold; DPO 18.0 days on purchases; cash conversion cycle 36.3 days (28.1 in 2026).',
    'A contract asset is not a receivable and stays out of DSO, but it is working capital: Lantern’s $30,840 is 19.5 days of total revenue and nine months of the law firm’s fee.',
    'The cash conversion cycle (DIO + DSO − DPO) is the part of the operating cycle the business finances itself; it can be negative, as Amazon’s was (−24.9 days in 2014).',
    'When the cycle is positive, growth absorbs cash in proportion to sales; Lantern’s working capital absorbed $33,890 in 2027, $30,840 of it in the contract asset.',
  ],

  glossary: [
    { term: 'Turnover', def: 'In ratio analysis, a flow for a period divided by the balance that produces it, such as revenue ÷ average total assets: how many times a year the balance is used and replaced.' },
    { term: 'Days sales outstanding', def: 'Average net receivables divided by credit sales, times the days in the period: the average number of days customers take to pay. Abbreviated DSO.' },
    { term: 'Days inventory outstanding', def: 'Average inventory divided by cost of goods sold, times the days in the period: the average number of days stock is held before it is sold. Abbreviated DIO.' },
    { term: 'Days payables outstanding', def: 'Average accounts payable divided by purchases on credit (or cost of goods sold when purchases are not known), times the days in the period: the average number of days the business takes to pay its suppliers. Abbreviated DPO.' },
    { term: 'Cash conversion cycle', def: 'Inventory days plus receivables days minus payables days: the number of days between paying suppliers and collecting from customers that the business must finance itself.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 6.2, “Operating Efficiency Ratios”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/6-2-operating-efficiency-ratios', checked: '2026-10-26' },
    { text: 'U.S. Securities and Exchange Commission (2007). <i>Beginners’ Guide to Financial Statements</i> (inventory turnover).', url: 'https://www.sec.gov/reportspubs/investor-publications/investorpubsbegfinstmtguide', checked: '2026-10-26' },
    { text: 'Amazon.com, Inc. (2015). Form 10-K for 2014: consolidated balance sheets (SEC EDGAR financial report R7).', url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872415000006/R7.htm', checked: '2026-10-26' },
    { text: 'Amazon.com, Inc. (2015). Form 10-K for 2014: consolidated statements of operations (SEC EDGAR financial report R3).', url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872415000006/R3.htm', checked: '2026-10-26' },
    { text: 'Amazon.com, Inc. (2014). Form 10-K for 2013: consolidated balance sheets, with 31 December 2012 (SEC EDGAR financial report R7).', url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872414000006/R7.htm', checked: '2026-10-26' },
  ],

  checks: [
    { what: 'CFO 2027', value: P27.cfo, shown: 8341 },
    { what: 'CFO 2026', value: P26.cfo, shown: 39940 },
    { what: 'Revenue tripled', value: P27.revenue / P26.revenue, shown: 3, tol: 0.05 },
    // asset turnover
    { what: 'Average total assets 2027', value: (P26.totalAssets + P27.totalAssets) / 2, shown: 210779.5 },
    { what: 'Revenue 2027', value: P27.revenue, shown: 577860 },
    { what: 'Revenue 2026', value: P26.revenue, shown: 193320 },
    { what: 'Total assets 2026', value: P26.totalAssets, shown: 93676 },
    { what: 'Total assets 2027', value: P27.totalAssets, shown: 327883 },
    { what: 'Asset turnover 2026', value: T26.assetTurnover, shown: 2.06 },
    { what: 'Asset turnover 2026 annualised', value: atAnn26, shown: 2.48 },
    { what: 'Asset turnover 2027', value: T27.assetTurnover, shown: 2.74 },
    { what: 'Fixed-asset turnover 2026', value: T26.fixedAssetTurnover, shown: 5.20 },
    { what: 'Fixed-asset turnover 2026 annualised', value: fatAnn26, shown: 6.24 },
    { what: 'Fixed-asset turnover 2027', value: T27.fixedAssetTurnover, shown: 8.72 },
    { what: 'ROU asset', value: P27.rightOfUse, shown: 173379 },
    { what: 'ROU more than half of total assets', value: P27.rightOfUse / P27.totalAssets > 0.5 ? 1 : 0, shown: 1 },
    { what: 'Average assets without ROU', value: (P26.totalAssets + P27.totalAssets - P27.rightOfUse) / 2, shown: 124090 },
    { what: 'Asset turnover without ROU', value: atExROU, shown: 4.66 },
    // receivables
    { what: 'Catering revenue 2027', value: P27.creditSales, shown: 118360 },
    { what: 'Law firm revenue', value: P27.contractAsset, shown: 30840 },
    { what: 'Deposits earned', value: FACTS.catering.depositsEarned, shown: 1640 },
    { what: 'Invoiced 2027', value: INV27, shown: 85880 },
    { what: 'Catering = parts', value: INV27 + P27.contractAsset + FACTS.catering.depositsEarned, shown: 118360 },
    { what: 'Invoiced 2026', value: INV26, shown: 59920 },
    { what: 'Receivables 2026', value: P26.receivables, shown: 6796 },
    { what: 'Receivables 2027', value: P27.receivables, shown: 10698 },
    { what: 'Average receivables', value: avgAR, shown: 8747 },
    { what: 'Receivables turnover 2027', value: E27.receivablesTurnover, shown: 9.82 },
    { what: 'DSO 2027', value: E27.dso, shown: 37.2, tol: 0.05 },
    { what: 'DSO 2026', value: E26.dso, shown: 34.5, tol: 0.05 },
    { what: 'DSO on all catering revenue 2027', value: conv27.dso, shown: 27.0, tol: 0.05 },
    { what: 'DSO on total revenue 2027', value: total27.dso, shown: 5.5, tol: 0.05 },
    { what: 'Gross receivables 2027', value: COMPARATIVE.balance.find((r) => r[0] === 'Accounts Receivable')[2], shown: 11460 },
    { what: 'Receivables over 30 days', value: 2100 + 960, shown: 3060 },
    { what: 'Days in ten months', value: R.days(P26), shown: 304.17, tol: 0.005 },
    { what: 'DSO 2026 on all catering (course creditSales)', value: conv26.dso, shown: 33.2, tol: 0.05 },
    // contract asset
    { what: 'Contract asset days of revenue', value: caDaysRev, shown: 19.5, tol: 0.05 },
    { what: 'Contract asset days of the fee', value: caDaysFee, shown: 274, tol: 0.5 },
    { what: 'DSO with contract asset', value: dsoCA, shown: 75.6, tol: 0.05 },
    { what: 'Law firm fee', value: fee, shown: 41120 },
    // inventory
    { what: 'Cost of sales 2027', value: P27.cogs, shown: 224205 },
    { what: 'Cost of services 2027', value: inc('Cost of Services')[2], shown: 61080 },
    { what: 'COGS 2027', value: COGS27, shown: 163125 },
    { what: 'COGS 2026', value: COGS26, shown: 52800 },
    { what: 'Inventory 2026', value: P26.inventory, shown: 5800 },
    { what: 'Inventory 2027', value: P27.inventory, shown: 9475 },
    { what: 'Average inventory', value: (P26.inventory + P27.inventory) / 2, shown: 7637.5 },
    { what: 'Inventory turnover 2027', value: E27.inventoryTurnover, shown: 21.36 },
    { what: 'DIO 2027', value: E27.dio, shown: 17.1, tol: 0.05 },
    { what: 'DIO 2026', value: E26.dio, shown: 33.4, tol: 0.05 },
    { what: 'DIO on cost of sales 2027', value: cos27.dio, shown: 12.4, tol: 0.05 },
    { what: 'DIO 2026 with 365 days', value: P26.inventory / COGS26 * 365, shown: 40.1, tol: 0.05 },
    // payables
    { what: 'Purchases 2027', value: PUR27, shown: 187780 },
    { what: 'Stock purchases 2027', value: FACTS.inventory.purchases, shown: 166800 },
    { what: 'Supplies 2027', value: FACTS.supplies.bought, shown: 19800 },
    { what: 'Utilities unpaid 2027', value: FACTS.utilities.unpaid, shown: 1180 },
    { what: 'Purchases 2026', value: PUR26, shown: 70430 },
    { what: 'Payables 2026', value: P26.payables, shown: 9210 },
    { what: 'Payables 2027', value: P27.payables, shown: 9280 },
    { what: 'Average payables', value: (P26.payables + P27.payables) / 2, shown: 9245 },
    { what: 'DPO 2027', value: E27.dpo, shown: 18.0, tol: 0.05 },
    { what: 'DPO 2026', value: E26.dpo, shown: 39.8, tol: 0.05 },
    // cycles
    { what: 'CCC 2027', value: ccc27, shown: 36.3, tol: 0.05 },
    { what: 'CCC 2027 (engine)', value: E27.cashConversionCycle, shown: 36.3, tol: 0.05 },
    { what: 'CCC 2026', value: ccc26, shown: 28.1, tol: 0.05 },
    { what: 'Operating cycle 2027', value: E27.operatingCycle, shown: 54.3, tol: 0.05 },
    { what: 'Café cycle', value: cafeCycle, shown: -0.9, tol: 0.05 },
    { what: 'Credit sales share', value: INV27 / P27.revenue * 100, shown: 15, tol: 0.5 },
    { what: 'CCC change', value: ccc27 - ccc26, shown: 8.2, tol: 0.05 },
    { what: 'DIO change', value: E26.dio - E27.dio, shown: 16.3, tol: 0.05 },
    { what: 'DSO change', value: E27.dso - E26.dso, shown: 2.7, tol: 0.05 },
    { what: 'DPO change', value: E26.dpo - E27.dpo, shown: 21.8, tol: 0.05 },
    // Amazon
    { what: 'Amazon DSO 2013', value: A13.dso, shown: 21.0, tol: 0.05 },
    { what: 'Amazon DSO 2014', value: A14.dso, shown: 21.3, tol: 0.05 },
    { what: 'Amazon DIO 2013', value: A13.dio, shown: 45.3, tol: 0.05 },
    { what: 'Amazon DIO 2014', value: A14.dio, shown: 45.7, tol: 0.05 },
    { what: 'Amazon DPO 2013', value: A13.dpo, shown: 95.8, tol: 0.05 },
    { what: 'Amazon DPO 2014', value: A14.dpo, shown: 91.9, tol: 0.05 },
    { what: 'Amazon CCC 2013', value: A13.cashConversionCycle, shown: -29.5, tol: 0.05 },
    { what: 'Amazon CCC 2014', value: A14.cashConversionCycle, shown: -24.9, tol: 0.05 },
    { what: 'Amazon inventory + receivables 2014', value: AMZ[2014].inventory + AMZ[2014].receivables, shown: 13911 },
    { what: 'Amazon OWC negative', value: amzOWC14 < 0 ? 1 : 0, shown: 1 },
    // growth
    { what: 'Working capital absorbed', value: -wcTotal, shown: 33890 },
    { what: 'Receivables increase', value: -wc['Increase in accounts receivable (net)'], shown: 3902 },
    { what: 'Inventory increase', value: -wc['Increase in inventory'], shown: 3675 },
    { what: 'Unearned revenue increase', value: wc['Increase in unearned revenue'], shown: 2960 },
    { what: 'Wages payable increase', value: wc['Increase in wages payable'], shown: 2200 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Depreciation 2027', value: P27.da, shown: 19800 },
    { what: 'CFO identity', value: P27.netIncome + P27.da + wcTotal, shown: 8341 },
    // applied
    { what: 'Quarter fee', value: quarterly, shown: 10280 },
    { what: 'Released by quarterly billing', value: released, shown: 20560 },
    { what: 'Kilnworth 15 days', value: kiln, shown: 6855, tol: 0.5 },
    { what: 'Interest saved', value: kilnSave, shown: 617, tol: 0.5 },
    { what: '1% of stock purchases', value: FACTS.inventory.purchases * 0.01, shown: 1668 },
    { what: 'Three days of stock', value: dioCut, shown: 1341, tol: 0.5 },
    { what: '(a) about three times (b)', value: released / kiln, shown: 3, tol: 0.05 },
    { what: '(a) about fifteen times (c)', value: released / dioCut, shown: 15, tol: 0.4 },
    { what: 'Line of credit rate', value: FACTS.lineOfCredit.rate * 100, shown: 9 },
    // mistakes and application
    { what: 'DSO on closing receivables 2027', value: P27.receivables / INV27 * 365, shown: 45.5, tol: 0.05 },
    { what: 'Forecast receivables 2028', value: 120000 * 37.2 / 365, shown: 12230, tol: 0.5 },
    { what: 'Forecast payables 2028', value: 200000 * 30 / 365, shown: 16438, tol: 0.5 },
    { what: 'Payables increase vs 2027 average', value: 200000 * 30 / 365 - (P26.payables + P27.payables) / 2, shown: 7193, tol: 0.5 },
  ],
};
