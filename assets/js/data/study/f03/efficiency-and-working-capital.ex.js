// efficiency-and-working-capital.ex.js — F03 · Efficiency and working capital: widgets, practice and the knowledge check.
// Lantern’s figures come from case.js PERIODS, whose creditSales (invoiced catering), cogsGoods and purchases are the
// matched flows; the ratios from core/ratios.js. Amazon 2013–2014 is from its 10-Ks; every other business is fictional.
import { PERIODS } from './case.js?v=22';
import * as R from '../../../core/ratios.js?v=22';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const D26 = P26, D27 = P27;   // PERIODS carries creditSales (invoiced catering), cogsGoods and purchases
const E27 = R.efficiency({ ...D27, revenue: D27.creditSales }, D26);
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const d1 = (v) => v.toFixed(1);

export const widgets = {
  'eff-turnover': {
    type: 'formula',
    title: 'Asset and fixed-asset turnover',
    intro: 'Starting values: Lantern’s 2027. Set the months to 10 and the opening balances to zero to reproduce 2026 (revenue $193,320; closing total assets $93,676; closing property and equipment $37,200).',
    inputs: [
      { id: 'rev', label: 'Revenue for the period', min: 10000, max: 1000000, step: 1, value: P27.revenue, fmt: 'money' },
      { id: 'months', label: 'Months in the period', min: 1, max: 12, step: 1, value: 12, fmt: 'int', unit: 'months' },
      { id: 'ta0', label: 'Total assets, opening (0 if none)', min: 0, max: 600000, step: 1, value: P26.totalAssets, fmt: 'money' },
      { id: 'ta1', label: 'Total assets, closing', min: 10000, max: 600000, step: 1, value: P27.totalAssets, fmt: 'money' },
      { id: 'pp0', label: 'Property and equipment (net), opening (0 if none)', min: 0, max: 300000, step: 1, value: P26.ppeNet, fmt: 'money' },
      { id: 'pp1', label: 'Property and equipment (net), closing', min: 1000, max: 300000, step: 1, value: P27.ppeNet, fmt: 'money' },
    ],
    compute: (v) => {
      const ann = v.rev * 12 / v.months;
      const ta = v.ta0 > 0 ? (v.ta0 + v.ta1) / 2 : v.ta1, pp = v.pp0 > 0 ? (v.pp0 + v.pp1) / 2 : v.pp1;
      const basis = v.ta0 > 0 ? 'average' : 'closing (no opening balance)';
      return {
        headline: { label: 'Asset turnover (annualised revenue)', value: (ann / ta).toFixed(2) },
        rows: [
          ['Annualised revenue', money(ann)],
          [`Total assets, ${basis}`, money(ta)],
          ['Asset turnover on the period’s revenue', (v.rev / ta).toFixed(2)],
          ['Fixed-asset turnover (annualised)', (ann / pp).toFixed(2)],
          ['Asset turnover on closing assets (annualised)', (ann / v.ta1).toFixed(2)],
        ],
        note: `${v.months < 12 ? `The period is ${v.months} months, so revenue is scaled by 12 ÷ ${v.months} before comparing with a full year; that assumes the missing months are typical. ` : ''}${v.ta0 > 0 && v.ta1 > v.ta0 * 1.5 ? 'Assets grew sharply during the year, so closing assets understate turnover: the average is the fairer divisor.' : 'Each dollar of assets supports this much revenue a year.'}`,
      };
    },
  },
  'eff-days': {
    type: 'ratios',
    title: 'Working-capital days: Lantern and Amazon',
    periods: [{ label: '2026 (10 months)', data: D26 }, { label: '2027', data: D27 }],
    peers: [{ label: 'Amazon 2014 ($m)', data: { months: 12, revenue: 88988, cogs: 62752, receivables: 5612, inventory: 8299, payables: 16459 },
      prev: { receivables: 4767, inventory: 7411, payables: 15133 } }],
    ratios: ['receivablesTurnover', 'dso', 'inventoryTurnover', 'dio', 'dpo', 'cashConversionCycle'],
    toggles: ['average', 'annualise', 'creditSales'],
    defaults: { creditSales: true },
    adjust: [{ id: 'ca', label: '2027: count the law firm’s unbilled $30,840 as if it were a receivable (and its revenue as a credit sale)', period: 1, delta: { receivables: P27.contractAsset, creditSales: P27.contractAsset } }],
    select: 'cashConversionCycle',
    note: 'Lantern: credit sales are the catering invoiced on 30-day terms; inventory days use cost of goods sold; payables days use purchases on account. Amazon discloses neither credit sales nor purchases, so its days use total net sales and cost of sales.',
  },
  'eff-growth': {
    type: 'formula',
    title: 'Working capital tied up, and the cash growth needs',
    intro: 'Starting values: Lantern’s 2027 invoiced catering, cost of goods sold, purchases on account and days.',
    inputs: [
      { id: 'sales', label: 'Credit sales a year', min: 0, max: 500000, step: 1, value: D27.creditSales, fmt: 'money' },
      { id: 'cogs', label: 'Cost of goods sold a year', min: 0, max: 500000, step: 1, value: D27.cogsGoods, fmt: 'money' },
      { id: 'pur', label: 'Purchases on account a year', min: 0, max: 500000, step: 1, value: D27.purchases, fmt: 'money' },
      { id: 'dso', label: 'Receivables days (DSO)', min: 0, max: 120, step: 0.1, value: Math.round(E27.dso * 10) / 10, fmt: 'num', unit: 'days' },
      { id: 'dio', label: 'Inventory days (DIO)', min: 0, max: 120, step: 0.1, value: Math.round(E27.dio * 10) / 10, fmt: 'num', unit: 'days' },
      { id: 'dpo', label: 'Payables days (DPO)', min: 0, max: 120, step: 0.1, value: Math.round(E27.dpo * 10) / 10, fmt: 'num', unit: 'days' },
      { id: 'g', label: 'Growth in sales and costs next year', min: 0, max: 100, step: 5, value: 20, fmt: 'pct' },
    ],
    compute: (v) => {
      const ar = v.sales * v.dso / 365, inv = v.cogs * v.dio / 365, ap = v.pur * v.dpo / 365;
      const owc = ar + inv - ap, extra = owc * v.g / 100;
      return {
        headline: { label: 'Operating working capital tied up', value: money(owc) },
        rows: [
          ['Receivables', money(ar)],
          ['Inventory', money(inv)],
          ['Less payables', money(-ap)],
          [`Extra cash needed for ${v.g}% growth`, money(extra)],
        ],
        note: owc >= 0
          ? `Each year’s growth of ${v.g}% ties up about ${money(extra)} more before any profit can be spent. Shorten DSO or DIO, or lengthen DPO, and watch it fall.`
          : `Payables exceed receivables and inventory: suppliers finance the cycle, and ${v.g}% growth releases about ${money(-extra)} of cash, as Amazon’s negative cycle did.`,
        chart: { kind: 'bar', x: { label: 'Component', values: ['Receivables', 'Inventory', 'Payables', 'Net'] }, series: [{ name: 'Now', values: [ar, inv, -ap, owc] }, { name: 'After growth', values: [ar, inv, -ap, owc].map((x) => x * (1 + v.g / 100)) }], y: { label: 'Dollars' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f03-eff-g1', type: 'steps', kind: 'numerical',
    prompt: 'Thornbury Garden Supplies, a fictional wholesaler, sells only on credit to garden centres. In 2027 its credit sales were $1,460,000. Its net receivables were $180,000 at the start of the year and $220,000 at the end. Use 365 days.',
    solution: 'Average receivables = (180,000 + 220,000) ÷ 2 = 200,000. Receivables turnover = 1,460,000 ÷ 200,000 = 7.30. DSO = 365 ÷ 7.30 = 50.0 days.',
    steps: [
      { id: 'f03-eff-g1-s1', type: 'num', prompt: 'What is its receivables turnover?',
        answer: 7.3, check: () => 1460000 / ((180000 + 220000) / 2), unit: '', places: 2, tol: 0.005,
        hints: ['Credit sales ÷ average net receivables.', 'Average receivables = (180,000 + 220,000) ÷ 2.'],
        wrong: [{ value: 6.64, say: 'That uses the closing balance. Sales were earned over the year: use the average of opening and closing.' }] },
      { id: 'f03-eff-g1-s2', type: 'num', prompt: 'What is its DSO, to one decimal place?',
        answer: 50, check: () => 365 / (1460000 / 200000), unit: 'days', places: 1, tol: 0.05,
        hints: ['Days in the year ÷ receivables turnover.', 'Or average receivables ÷ credit sales × 365.'],
        wrong: [{ value: 55, say: 'That uses closing receivables. Use the average, $200,000.' }] },
    ],
  },
  {
    id: 'f03-eff-g2', type: 'steps', kind: 'numerical',
    prompt: 'Spokewise Cycles, a fictional bike shop, reports cost of sales of $540,000, made up of cost of bikes and parts sold $420,000 and mechanics’ wages for repairs $120,000. Its inventory was $95,000 at the start of the year and $115,000 at the end. Use 365 days.',
    solution: 'Average inventory = (95,000 + 115,000) ÷ 2 = 105,000. Inventory turnover = 420,000 ÷ 105,000 = 4.00 (cost of goods sold only: the wages never passed through inventory). DIO = 365 ÷ 4.00 = 91.3 days.',
    steps: [
      { id: 'f03-eff-g2-s1', type: 'num', prompt: 'What is its inventory turnover?',
        answer: 4, check: () => 420000 / ((95000 + 115000) / 2), unit: '', places: 2, tol: 0.005,
        hints: ['Which cost left inventory?', 'Use the cost of bikes and parts sold, $420,000, over average inventory.'],
        wrong: [{ value: 5.14, say: 'The mechanics’ wages are a cost of services: they never sat in inventory. Use the $420,000 of goods sold.' }] },
      { id: 'f03-eff-g2-s2', type: 'num', prompt: 'What is its DIO, to one decimal place?',
        answer: 91.3, check: () => 105000 / 420000 * 365, unit: 'days', places: 1, tol: 0.05,
        hints: ['365 ÷ inventory turnover.'],
        wrong: [{ value: 71, say: 'That uses the whole cost of sales, including the mechanics’ wages.' }] },
    ],
  },
  {
    id: 'f03-eff-g3', type: 'num', kind: 'numerical',
    prompt: 'A fictional furniture maker has inventory days of 75, receivables days of 48 and payables days of 40. What is its cash conversion cycle?',
    answer: 83, check: () => 75 + 48 - 40, unit: 'days', places: 0, tol: 0.5,
    hints: ['The operating cycle is inventory days plus receivables days.', 'Then subtract the days suppliers finance.'],
    wrong: [
      { value: 123, say: 'That is the operating cycle. Subtract the 40 days of supplier credit.' },
      { value: 163, say: 'Payables days are subtracted, not added: suppliers finance part of the cycle.' },
      { value: 67, say: 'Inventory and receivables days add; only payables days subtract.' },
    ],
    solution: 'CCC = DIO + DSO − DPO = 75 + 48 − 40 = 83 days.',
  },
  {
    id: 'f03-eff-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s 2027 net receivables average $8,747. Why does DSO use the $85,880 of catering invoiced on credit rather than Lantern’s total revenue of $577,860?',
    options: [
      'Only sales made on credit ever become receivables',
      'Total revenue includes sales returns, which would make the ratio negative',
      'Credit sales give a lower DSO, which lenders prefer to see',
      'US GAAP requires credit sales to be disclosed separately on the income statement',
    ],
    answer: 0,
    hints: ['Which sales ever became a receivable?'],
    feedback: {
      1: 'Returns are small and are already netted out of revenue; they don’t make anything negative.',
      2: 'Credit sales give a higher DSO here (37.2 days against 5.5). The aim is the right measure, not a flattering one.',
      3: 'US GAAP does not require that disclosure, which is why analysts of public companies often have to use total revenue.',
    },
    solution: 'Receivables come only from sales made on credit. Lantern’s café, shop and workshop sales are paid at once, so they never become receivables; including them in the denominator gives 8,747 ÷ 577,860 × 365 = 5.5 days, against 37.2 days on the matched figure.',
  },
];

export const independent = [
  {
    id: 'f03-eff-i1', type: 'num', kind: 'numerical',
    prompt: 'Harbour View Hotel, a fictional business, had revenue of $3.6 million in 2027. Its total assets were $5.6 million at the start of the year and $6.4 million at the end. What is its asset turnover?',
    answer: 0.6, check: () => 3.6 / ((5.6 + 6.4) / 2), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.56, say: 'That uses closing total assets. Use the average, (5.6 + 6.4) ÷ 2 = 6.0.' },
      { value: 1.67, say: 'That is assets ÷ revenue. Asset turnover is revenue ÷ average total assets.' },
    ],
    solution: 'Average total assets = (5.6 + 6.4) ÷ 2 = 6.0. Asset turnover = 3.6 ÷ 6.0 = 0.60. Hotels own expensive buildings, so turnover well below 1 is normal for them.',
  },
  {
    id: 'f03-eff-i2', type: 'num', kind: 'numerical',
    prompt: 'Mossgate Books, a fictional bookseller, buys all its stock on credit and has no other credit purchases. In 2027 its cost of goods sold was $730,000; its inventory rose from $150,000 to $170,000; its accounts payable averaged $77,000. What is its DPO on purchases, to one decimal place? Use 365 days.',
    answer: 37.5, check: () => 77000 / (730000 + 170000 - 150000) * 365, unit: 'days', places: 1, tol: 0.05,
    wrong: [
      { value: 38.5, say: 'That uses cost of goods sold. Purchases were $20,000 higher, because inventory rose: 730,000 + 20,000 = 750,000.' },
      { value: 39.6, say: 'Inventory rose, so purchases exceeded cost of goods sold: add the increase, don’t subtract it.' },
    ],
    solution: 'Purchases = COGS + closing inventory − opening inventory = 730,000 + 170,000 − 150,000 = 750,000. DPO = 77,000 ÷ 750,000 × 365 = 37.5 days.',
  },
  {
    id: 'f03-eff-i3', type: 'num', kind: 'applied',
    prompt: 'Calder Engineering, a fictional supplier of machine parts, sells $7,300,000 a year on credit and its DSO is 58 days. Its new credit controller believes she can bring DSO down to 48 days without losing customers. How much cash would that release, in dollars?',
    answer: 200000, check: () => 7300000 / 365 * (58 - 48), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 960000, say: 'That is the receivables balance at 48 days. The cash released is the difference between the balances at 58 and at 48 days.' },
      { value: 1160000, say: 'That is the current receivables balance. Ask how much smaller it would be.' },
    ],
    solution: 'Credit sales per day = 7,300,000 ÷ 365 = 20,000. Ten fewer days of receivables = 10 × 20,000 = $200,000 released, once.',
  },
  {
    id: 'f03-eff-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Amazon’s cash conversion cycle was about −25 days in 2014. What does a negative cycle mean?',
    options: [
      'It is paid by customers before it pays its suppliers',
      'It sells its goods at a loss, so each sale reduces its cash',
      'Its customers pay in advance for goods that are delivered a month later',
      'Its inventory turns over less than once a year',
    ],
    answer: 0,
    feedback: {
      1: 'The cycle measures timing, not margin. Amazon made an operating profit of $178 million in 2014.',
      2: 'Advance payments would show as unearned revenue, not as a negative cycle; Amazon’s receivables days were positive, about 21.',
      3: 'Its inventory days were about 46, roughly eight turns a year.',
    },
    solution: 'CCC = DIO + DSO − DPO = 45.7 + 21.3 − 91.9 ≈ −24.9 days. Suppliers waited about 92 days to be paid while stock and customers together took about 67, so suppliers financed Amazon’s working capital, and more sales meant more of that financing.',
  },
  {
    id: 'f03-eff-i5', type: 'short', kind: 'applied',
    prompt: 'A classmate argues that Lantern’s $30,840 contract asset should be added to receivables when calculating DSO, “because the law firm owes it just like any other client”. Write four to six sentences responding.',
    rubric: [
      'Explains the difference between a receivable (an unconditional right, only time to wait) and a contract asset (not yet billable; depends on the billing date and the CPI estimate).',
      'Explains that DSO measures how fast invoiced clients pay; mixing in unbilled revenue gives about 75.6 days and no longer measures collection.',
      'Argues that the contract asset should still be analysed: about 19.5 days of total revenue, nine months of one client’s fee.',
      'Mentions concentration or estimation risk, or a practical step (quarterly billing).',
    ],
    model: 'The law firm doesn’t owe it like other clients yet: Lantern can’t invoice the fee until 31 March 2028, and the amount rests on a CPI estimate, so it is a contract asset, not a receivable. DSO measures how quickly invoiced clients pay; adding the contract asset gives about 75.6 days, a number that mixes collection with a billing date and describes neither. Leaving it out of DSO doesn’t mean ignoring it: it is $30,840, 19.5 days of Lantern’s whole revenue and nine months of one client’s fee. I would report it separately, as days of revenue, and flag that a single client and an estimate stand behind it. Asking the law firm to pay quarterly would shrink it.',
  },
];

export const check = [
  {
    id: 'f03-eff-k1', type: 'num', kind: 'numerical',
    prompt: 'From Amazon’s 10-K: cost of sales in 2014 was $62,752 million; accounts payable were $15,133 million at the end of 2013 and $16,459 million at the end of 2014. What was Amazon’s payables turnover on cost of sales in 2014? Give two decimal places.',
    answer: 3.97, check: () => 62752 / ((15133 + 16459) / 2), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 3.81, say: 'That uses the closing balance. Use the average of the two year ends.' },
      { value: 5.63, say: 'That divides net sales by payables. Payables arise from purchases, so use cost of sales (purchases are not disclosed).' },
    ],
    solution: 'Average payables = (15,133 + 16,459) ÷ 2 = 15,796. Payables turnover = 62,752 ÷ 15,796 = 3.97, so DPO = 365 ÷ 3.97 ≈ 91.9 days.',
  },
  {
    id: 'f03-eff-k2', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s 2026 statements cover ten months. Which calculation of its 2026 inventory days is correct?',
    options: [
      'Closing inventory ÷ ten months’ cost of goods sold × 304.17',
      'Closing inventory ÷ ten months’ cost of goods sold × 365',
      'Average of opening and closing inventory ÷ ten months’ cost of goods sold × 304.17',
      'Closing inventory ÷ annualised cost of goods sold × 304.17',
    ],
    answer: 0,
    feedback: {
      1: 'Ten months of flow over 365 days overstates the days by a fifth (40.1 instead of 33.4).',
      2: 'Lantern started on 1 March 2026 with nothing, so there is no opening balance to average.',
      3: 'Annualise the flow or shorten the days, not both: this understates the days.',
    },
    solution: 'With no opening balance sheet, use closing inventory, and match the flow’s period with its days: 5,800 ÷ 52,800 × 304.17 = 33.4 days. Annualising the flow and using 365 gives the same answer.',
  },
  {
    id: 'f03-eff-k3', type: 'num', kind: 'applied',
    prompt: 'Lantern’s accountant expects to invoice $120,000 of catering in 2028 and assumes clients will keep paying in 37.2 days on average. What average net receivables does that imply, to the nearest dollar?',
    answer: 12230, check: () => 120000 * 37.2 / 365, unit: '$', places: 0, tol: 2,
    wrong: [
      { value: 8747, say: 'That is 2027’s average. Scale with the new credit sales: 120,000 × 37.2 ÷ 365.' },
      { value: 4464000, say: 'Multiply by days and divide by 365: 120,000 × 37.2 ÷ 365.' },
    ],
    solution: 'Average receivables = credit sales × DSO ÷ 365 = 120,000 × 37.2 ÷ 365 ≈ $12,230, about $3,480 more than 2027’s average, cash the growth will absorb.',
  },
  {
    id: 'f03-eff-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these would lengthen a business’s cash conversion cycle? Select all that apply.',
    options: [
      'Customers taking longer to pay',
      'Building up stock ahead of a product launch',
      'Paying suppliers sooner to take an early-payment discount',
      'Negotiating 60-day terms with the main supplier instead of 30',
      'Selling slow-moving stock at a discount',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Longer supplier terms raise DPO, which shortens the cycle.',
      4: 'Clearing slow stock lowers inventory days, which shortens the cycle.',
    },
    solution: 'Higher DSO (slower customers), higher DIO (more stock) and lower DPO (paying sooner) all lengthen DIO + DSO − DPO. Longer supplier terms and clearing slow stock shorten it. Paying early for a discount can still be worth it: a shorter cycle is not the only goal.',
  },
  {
    id: 'f03-eff-k5', type: 'num', kind: 'numerical',
    prompt: 'Coldwater Logistics, a fictional company, had revenue of $9.0 million in 2027. Its property and equipment, net, was $3.4 million at the start of the year and $4.1 million at the end. What is its fixed-asset turnover?',
    answer: 2.4, check: () => 9.0 / ((3.4 + 4.1) / 2), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 2.2, say: 'That uses closing property and equipment. Use the average, 3.75.' },
      { value: 2.65, say: 'That uses the opening balance. Use the average of opening and closing.' },
    ],
    solution: 'Average PP&E = (3.4 + 4.1) ÷ 2 = 3.75. Fixed-asset turnover = 9.0 ÷ 3.75 = 2.40.',
  },
  {
    id: 'f03-eff-k6', type: 'classify', kind: 'conceptual',
    prompt: 'Which flow belongs with each balance in an efficiency ratio?',
    items: ['Accounts receivable', 'Inventory', 'Accounts payable', 'Total assets'],
    categories: ['Credit sales', 'Cost of goods sold', 'Purchases on credit', 'Total revenue'],
    answer: [0, 1, 2, 3],
    feedback: {
      0: 'Receivables come from sales on credit.',
      1: 'Inventory is carried at cost and leaves through cost of goods sold.',
      2: 'Payables arise when goods and services are bought on credit.',
      3: 'All the assets together support all the revenue.',
    },
    solution: 'Receivables with credit sales, inventory with cost of goods sold, payables with purchases on credit, total assets with total revenue.',
  },
];
