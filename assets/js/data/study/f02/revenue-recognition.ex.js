// revenue-recognition.ex.js — F02 · Revenue recognition: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern's figures come from case.js; the January 2027 entries are hypothetical (“Suppose…”); other businesses are fictional.
import { CHART, FACTS, YEAR, DERIVED as D } from './case.js?v=13';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: Math.abs(x - Math.round(x)) > 1e-9 ? 2 : 0, maximumFractionDigits: 2 })}`;
const pick = (...ids) => ids.map((id) => YEAR.find((t) => t.id === id));
const REV_ACCOUNTS = ['Cash', 'Accounts Receivable', 'Unearned Revenue', 'Catering Revenue', 'Training Revenue', 'Online Sales Revenue', 'Sales Returns and Allowances', 'Sales Discounts'];

export const widgets = {
  'rr-allocate': {
    type: 'formula',
    title: 'Allocating a bundle and recognising it over time',
    intro: 'The equipment and installation are delivered at the start; the support plan runs for 24 months.',
    inputs: [
      { id: 'price', label: 'Bundle price (transaction price)', min: 1000, max: 20000, step: 100, value: 7200, fmt: 'money' },
      { id: 'equip', label: 'Stand-alone price: equipment', min: 500, max: 15000, step: 100, value: 6000, fmt: 'money' },
      { id: 'install', label: 'Stand-alone price: installation', min: 0, max: 3000, step: 50, value: 600, fmt: 'money' },
      { id: 'support', label: 'Stand-alone price: 24 months of support', min: 0, max: 5000, step: 100, value: 1400, fmt: 'money' },
      { id: 'months', label: 'Months of support delivered so far', min: 0, max: 24, step: 1, value: 3, fmt: 'int', unit: 'months' },
    ],
    compute: (v) => {
      const total = v.equip + v.install + v.support;
      const r = v.price / total;
      const a = { equip: v.equip * r, install: v.install * r, support: v.support * r };
      const supportDone = a.support * v.months / 24;
      const recognised = a.equip + a.install + supportDone;
      const liability = a.support - supportDone;
      const disc = total - v.price;
      return {
        headline: { label: 'Revenue recognised so far', value: money(Math.round(recognised * 100) / 100) },
        rows: [
          ['Sum of stand-alone prices', money(total)],
          [disc >= 0 ? 'Bundle discount shared' : 'Bundle premium shared', money(Math.abs(disc))],
          ['Allocated to equipment', money(Math.round(a.equip * 100) / 100)],
          ['Allocated to installation', money(Math.round(a.install * 100) / 100)],
          ['Allocated to support', money(Math.round(a.support * 100) / 100)],
          ['Contract liability (support still owed)', money(Math.round(liability * 100) / 100)],
        ],
        note: `Each obligation receives ${(r * 100).toFixed(1)}% of its stand-alone price, so ${disc >= 0 ? 'the discount' : 'the premium'} is shared in proportion. ${v.months === 24 ? 'All the support has been delivered: no contract liability remains.' : `With ${24 - v.months} months of support still to provide, ${money(Math.round(liability * 100) / 100)} of the price is still owed to the customer in service.`}`,
        chart: { kind: 'bar', x: { label: 'Performance obligation', values: ['Equipment', 'Installation', 'Support'] },
          series: [
            { name: 'Allocated', values: [a.equip, a.install, a.support].map((x) => Math.round(x * 100) / 100) },
            { name: 'Recognised so far', values: [a.equip, a.install, supportDone].map((x) => Math.round(x * 100) / 100) },
          ], y: { label: 'Dollars' } },
      };
    },
  },
  'rr-drill': {
    type: 'journal',
    chart: CHART,
    transactions: pick('y6', 'y7', 'y8', 'y11', 'y12', 'y13'),
    ask: ['accounts', 'direction', 'side', 'amount', 'statements'],
  },
};

// ---------------------------------------------------------------- guided practice
export const guided = [
  {
    id: 'f02-rr-g1', type: 'steps', kind: 'applied',
    prompt: 'Suppose that on 10 January 2027 a law firm books Lantern to cater its office launch on 5 February 2027 and to run a barista workshop for 12 of its staff on 20 February, for $2,880 in total. It pays a $1,000 deposit on booking; the rest is due after the workshop. Sold separately, Lantern would charge $2,100 for the catering and $1,500 for the workshop (12 seats at $125).',
    solution: 'Two distinct obligations (catering and workshop). Stand-alone prices total 2,100 + 1,500 = 3,600, so each gets 2,880 ÷ 3,600 = 0.8 of its price: catering 1,680, workshop 1,200. On 10 January: debit Cash 1,000, credit Unearned Revenue 1,000. By 10 February only the catering has been delivered, so revenue to date is $1,680. The $1,000 deposit covers part of it; the other $680 isn’t due until after the workshop, so until then it is a contract asset rather than a receivable.',
    steps: [
      { id: 'f02-rr-g1-s1', type: 'mc', prompt: 'How many performance obligations does the contract contain?',
        options: ['One: the client is buying a single launch package', 'Two: the catering and the workshop', 'Three: the deposit, the catering and the workshop'],
        answer: 1,
        hints: ['Could the client buy each part on its own, and does one part change the other?', 'A deposit is a payment, not something Lantern promises to deliver.'],
        feedback: { 0: 'The parts happen on different days, each could be bought separately, and neither modifies the other: they are distinct.', 2: 'The deposit is part of the price (step 3), not a promise to transfer a good or service.' },
        solution: 'Catering and the workshop are each sold separately by Lantern, and the client could benefit from either alone, so there are two distinct performance obligations.' },
      { id: 'f02-rr-g1-s2', type: 'num', prompt: 'How much of the $2,880 is allocated to the workshop?',
        answer: 1200, check: () => 2880 * 1500 / (2100 + 1500), unit: '$', places: 0, tol: 0.5,
        hints: ['Add the two stand-alone prices first.', 'Workshop share = 2,880 × 1,500 ÷ 3,600.'],
        wrong: [
          { value: 1500, say: 'That is the stand-alone price. The client pays 2,880 for prices that total 3,600, so each obligation gets only 80% of its own price.' },
          { value: 780, say: 'That puts the whole $720 discount on the workshop. The discount is shared in proportion to the stand-alone prices.' },
        ],
        solution: '2,880 × 1,500 ÷ 3,600 = $1,200 (and 2,880 × 2,100 ÷ 3,600 = $1,680 for the catering).' },
      { id: 'f02-rr-g1-s3', type: 'journal', chart: 'f02', date: '2027-01-10',
        prompt: 'Record the deposit received on 10 January 2027.',
        accounts: REV_ACCOUNTS,
        lines: [{ acct: 'Cash', dr: 1000 }, { acct: 'Unearned Revenue', cr: 1000 }],
        hints: ['Lantern has the cash but hasn’t catered or taught anything yet.', 'Debit Cash; credit the liability for services owed.'],
        solution: 'Debit Cash 1,000; credit Unearned Revenue 1,000. No revenue: neither obligation has been satisfied.' },
      { id: 'f02-rr-g1-s4', type: 'num', prompt: 'How much revenue from this contract has Lantern recognised by 10 February 2027?',
        answer: 1680, check: () => 2880 * 2100 / 3600, unit: '$', places: 0, tol: 0.5,
        hints: ['Which obligations have been satisfied by 10 February?', 'Only the catering (5 February); the workshop is on 20 February.'],
        wrong: [
          { value: 1000, say: 'That is the deposit. Revenue follows delivery, not cash: the catering has been delivered.' },
          { value: 2100, say: 'That is the stand-alone price. The catering’s share of the transaction price is 1,680.' },
          { value: 2880, say: 'The workshop hasn’t happened yet, so its $1,200 is still unearned.' },
        ],
        solution: 'Only the catering is done: $1,680. The other $1,200 is recognised on 20 February.' },
    ],
  },
  {
    id: 'f02-rr-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Is each performance obligation satisfied over time or at a point in time?',
    items: [
      'A gym’s 12-month membership',
      'A bag of coffee shipped to an online customer',
      'A weekly office-cleaning contract for a year',
      'An extension built on the customer’s own land',
      'A wedding cake delivered on the morning of the wedding',
      'A machine built to one customer’s design, with a contractual right to payment for work done so far',
      'A used van sold from a dealer’s forecourt',
    ],
    categories: ['Over time', 'At a point in time'],
    answer: [0, 1, 0, 0, 1, 0, 1],
    hints: ['Over time needs one of three things: the customer consumes the benefit as you perform; the customer controls the asset as it is built; or the asset has no other use to you and you have a right to payment to date.', 'Goods handed over complete, such as a cake or a van, usually transfer at a point in time.'],
    feedback: {
      0: 'The member receives and consumes access to the gym every day of the year: over time.',
      3: 'The customer controls the land and so the extension as it is built: over time.',
      5: 'The machine has no alternative use to the builder and the builder has a right to payment for work done: over time.',
      4: 'The cake is a good handed over complete on one morning: control passes at that point.',
    },
    solution: 'Over time: the gym membership and the cleaning (consumed as performed), the extension (customer controls it as it is built), the custom machine (no alternative use plus a right to payment). At a point in time: the coffee bag, the wedding cake and the used van, each a good whose control passes when it is handed over or shipped.',
  },
  {
    id: 'f02-rr-g3', type: 'steps', kind: 'applied',
    prompt: 'Suppose that on 4 January 2027 Lantern sells 120 bags of assorted coffees to a local office on account for $1,800, on terms of 2/10, n/30. The office pays on 12 January. Record the revenue side only; the cost of the bags is the next lesson’s subject. Lantern records discounts when customers take them.',
    solution: 'Sale: debit Accounts Receivable 1,800, credit Online Sales Revenue 1,800. Payment within 10 days: the discount is 2% × 1,800 = 36, so debit Cash 1,764 and Sales Discounts 36, credit Accounts Receivable 1,800. Net revenue from the sale is 1,800 − 36 = $1,764.',
    steps: [
      { id: 'f02-rr-g3-s1', type: 'journal', chart: 'f02', date: '2027-01-04',
        prompt: 'Record the sale on 4 January.',
        accounts: REV_ACCOUNTS,
        lines: [{ acct: 'Accounts Receivable', dr: 1800 }, { acct: 'Online Sales Revenue', cr: 1800 }],
        hints: ['The bags are delivered, so the obligation is satisfied; the office hasn’t paid yet.', 'Debit the receivable at the full invoice amount.'],
        solution: 'Debit Accounts Receivable 1,800; credit Online Sales Revenue 1,800.' },
      { id: 'f02-rr-g3-s2', type: 'journal', chart: 'f02', date: '2027-01-12',
        prompt: 'Record the office’s payment on 12 January.',
        accounts: REV_ACCOUNTS,
        lines: [{ acct: 'Cash', dr: 1764 }, { acct: 'Sales Discounts', dr: 36 }, { acct: 'Accounts Receivable', cr: 1800 }],
        hints: ['12 January is within 10 days of 4 January, so the office takes 2% off.', 'Clear the whole receivable; the discount goes to a contra-revenue account with a debit.'],
        solution: 'Discount 2% × 1,800 = 36. Debit Cash 1,764 and Sales Discounts 36; credit Accounts Receivable 1,800.' },
      { id: 'f02-rr-g3-s3', type: 'num', prompt: 'What net revenue does this sale add to Lantern’s 2027 income statement?',
        answer: 1764, check: () => 1800 * (1 - 0.02), unit: '$', places: 0, tol: 0.5,
        hints: ['Net revenue = gross revenue − returns and allowances − sales discounts.'],
        wrong: [{ value: 1800, say: 'Sales Discounts is a contra-revenue account: it is deducted from gross revenue.' }],
        solution: '1,800 − 36 = $1,764.' },
    ],
  },
  {
    id: 'f02-rr-g4', type: 'num', kind: 'applied',
    prompt: 'Verity Tickets, a fictional online box office, sold $500,000 of concert tickets in 2026 for venues that set the prices, stage the concerts and carry the risk of empty seats; Verity keeps an 8% fee. It also sold $40,000 of its own branded merchandise, bought for $22,000 and held in its warehouse. What revenue should Verity report for 2026? Round to the nearest dollar.',
    answer: 80000, check: () => 0.08 * 500000 + 40000, unit: '$', places: 0,
    hints: ['For each activity ask: does Verity control the good or service before the customer gets it?', 'Tickets: the venues set the price and perform, so Verity is an agent and reports its fee. Merchandise: Verity holds the stock and sets the price.'],
    wrong: [
      { value: 540000, say: 'That reports the tickets gross. The venues control the concerts and set the prices, so Verity is an agent for the tickets: only its 8% fee is revenue.' },
      { value: 40000, say: 'The 8% fee is Verity’s revenue from tickets: as an agent it still earns revenue, just not the full ticket price.' },
      { value: 58000, say: 'Merchandise revenue is the selling price, $40,000; its $22,000 cost is cost of goods sold, not a deduction from revenue.' },
    ],
    solution: 'Tickets: agent, so revenue is the fee, 0.08 × 500,000 = 40,000. Merchandise: principal (inventory risk, own pricing), so revenue is 40,000 gross, with $22,000 of cost of goods sold. Total revenue = 40,000 + 40,000 = $80,000.',
  },
];

// ---------------------------------------------------------------- on your own
export const independent = [
  {
    id: 'f02-rr-i1', type: 'num', kind: 'numerical',
    prompt: 'Kinross Leisure Club, a fictional gym, sells a joining package for $1,000: a 12-month membership, six personal-training sessions and a welcome kit. Sold separately they cost $900, $300 and $50. A member joins on 1 October 2026, collects the kit that day and has used two of the six sessions by 31 December, the club’s year end. How much revenue from this package does the club recognise in 2026? Round to the nearest dollar.',
    answer: 300, check: () => { const r = 1000 / (900 + 300 + 50); return 900 * r * 3 / 12 + 300 * r * 2 / 6 + 50 * r; }, unit: '$', places: 0,
    wrong: [
      { value: 375, say: 'You used the stand-alone prices. The package costs $1,000 against $1,250 of separate prices, so each part gets 80% of its own price.' },
      { value: 1000, say: 'Only the kit has been fully delivered. The membership is satisfied over 12 months and the training session by session.' },
      { value: 840, say: 'The membership runs for 12 months; only three (October–December) have passed, so only 720 × 3 ÷ 12 of it is earned.' },
    ],
    solution: 'Stand-alone prices total 1,250, so each part gets 1,000 ÷ 1,250 = 0.8: membership 720, training 240, kit 40. Revenue in 2026: membership 720 × 3 ÷ 12 = 180; training 240 × 2 ÷ 6 = 80; kit 40. Total $300.',
  },
  {
    id: 'f02-rr-i2', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-01-09',
    prompt: 'On 9 January 2027 Lantern runs the barista workshop for which participants paid $1,500 in December 2026. Record the entry.',
    accounts: ['Cash', 'Unearned Revenue', 'Training Revenue', 'Catering Revenue', 'Accounts Receivable', 'Sales Returns and Allowances', 'Wages Payable'],
    lines: [{ acct: 'Unearned Revenue', dr: 1500 }, { acct: 'Training Revenue', cr: 1500 }],
    solution: 'The cash was recorded in December (y11), with a credit to Unearned Revenue. Holding the workshop satisfies the obligation, so debit Unearned Revenue 1,500 and credit Training Revenue 1,500. No cash moves on 9 January.',
  },
  {
    id: 'f02-rr-i3', type: 'multi', kind: 'conceptual',
    prompt: 'At its 31 December year end, which of these leave a contract liability (unearned revenue) on the seller’s balance sheet? Select all that apply.',
    options: [
      'An airline has sold tickets for flights in February',
      'A consultant finished a project on 20 December and invoiced it on 28 December',
      'A magazine has received annual subscriptions, with nine issues still to send',
      'A furniture maker delivered a table on 30 December; the customer pays in January',
      'A gift shop has sold gift cards that haven’t yet been redeemed',
      'A caterer has signed a contract for a March wedding but received nothing yet',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'The work is done, so the revenue is earned; the unpaid invoice is a receivable, an asset.',
      3: 'The table has been delivered: revenue and a receivable, not a liability.',
      5: 'Nothing has been paid or is yet due, and nothing has been delivered: neither side has performed, so nothing is recorded yet.',
    },
    solution: 'A contract liability arises when the customer has paid (or payment is due) before the seller performs: the airline tickets, the magazine subscriptions and the gift cards. The consultant and the furniture maker have performed first, so they hold receivables. The wedding contract is unperformed on both sides.',
  },
  {
    id: 'f02-rr-i4', type: 'num', kind: 'numerical',
    prompt: 'Glenrock Outfitters, a fictional clothing brand, sells $200,000 of jackets in December. Customers may return a jacket for a full refund within 30 days, and from experience Glenrock expects 5% of December’s sales to come back. How much revenue does Glenrock recognise for December’s jacket sales?',
    answer: 190000, check: () => 200000 * (1 - 0.05), unit: '$', places: 0,
    wrong: [
      { value: 200000, say: 'Revenue is recognised only for the jackets Glenrock expects customers to keep; the expected refunds are a refund liability.' },
      { value: 10000, say: 'That is the refund liability, the amount expected to be paid back.' },
    ],
    solution: 'Revenue = 200,000 × (1 − 0.05) = $190,000. Glenrock also records a refund liability of $10,000 and an asset (with a reduction in cost of sales) for its right to recover the returned jackets.',
  },
  {
    id: 'f02-rr-i5', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements.',
    text: 'Cash received before the seller performs creates a [[0]]. A right to payment that depends only on the passage of time is a [[1]]. A refund to a customer is debited to a [[2]] account. When a bundle is sold at a discount, the discount is shared in proportion to the [[3]].',
    blanks: [
      { options: ['contract liability', 'receivable', 'revenue', 'refund asset'], answer: 0 },
      { options: ['contract liability', 'receivable', 'revenue', 'refund asset'], answer: 1 },
      { options: ['contra-revenue', 'operating expense', 'liability', 'asset'], answer: 0 },
      { options: ['stand-alone selling prices', 'costs of each item', 'list prices only', 'delivery dates'], answer: 0 },
    ],
    solution: 'Contract liability; receivable; contra-revenue (Sales Returns and Allowances); stand-alone selling prices.',
  },
  {
    id: 'f02-rr-i6', type: 'num', kind: 'applied',
    prompt: 'Thistledown Tea, a fictional online tea shop, shows order values of $48,600 for its financial year in its analytics. Orders worth $1,200 placed on 29–31 December were shipped in January; customers were refunded $900 for damaged parcels during the year; and customers prepaid $2,400 for subscription boxes not yet sent, which aren’t in the order values. What net sales revenue should the books show for the year?',
    answer: 46500, check: () => 48600 - 1200 - 900, unit: '$', places: 0,
    wrong: [
      { value: 48900, say: 'Prepaid subscriptions are a contract liability until the boxes are sent: they aren’t revenue yet.' },
      { value: 47400, say: 'Refunds reduce revenue: subtract the $900 as well.' },
      { value: 47700, say: 'Orders shipped in January are next year’s revenue: control hadn’t passed by the year end.' },
    ],
    solution: 'Start from orders placed, 48,600; remove orders not shipped by the year end, 1,200; deduct refunds, 900: net sales revenue = $46,500. The $2,400 of prepaid subscriptions is unearned revenue.',
  },
];

// ---------------------------------------------------------------- knowledge check
export const check = [
  {
    id: 'f02-rr-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A reader pays $120 on 1 October for a monthly print magazine, twelve issues starting in October. The publisher’s year ends on 31 December. How much revenue does the publisher recognise in that year?',
    options: ['$30, for the three issues sent', '$120, because the cash is received', '$0, until all twelve issues are sent', '$10, for the October issue only'],
    answer: 0,
    feedback: {
      1: 'Cash received isn’t a recognition event. Nine issues are still owed, so $90 is a contract liability.',
      2: 'Each issue sent satisfies part of the promise; revenue isn’t held back until the end of the subscription.',
      3: 'Issues were also sent in November and December, the same year.',
    },
    solution: 'Each issue carries 120 ÷ 12 = $10. October, November and December issues have been sent: revenue $30; contract liability $90.',
  },
  {
    id: 'f02-rr-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional software company’s contract liabilities were $12,000 at the start of the year. During the year customers paid $40,000 in advance, and the company recognised $35,500 of revenue from advance payments. What are its contract liabilities at the end of the year?',
    answer: 16500, check: () => 12000 + 40000 - 35500, unit: '$', places: 0,
    wrong: [
      { value: 4500, say: 'Include the $12,000 owed at the start of the year: ending = beginning + received − recognised.' },
      { value: 87500, say: 'Recognising revenue reduces the liability: subtract the $35,500.' },
      { value: 7500, say: 'Advance payments increase the liability and revenue recognised reduces it: 12,000 + 40,000 − 35,500.' },
    ],
    solution: 'Ending contract liability = 12,000 + 40,000 − 35,500 = $16,500.',
  },
  {
    id: 'f02-rr-k3', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-01-15',
    prompt: 'Suppose that on 15 January 2027 Lantern refunds $54 to a shop customer whose three bags arrived damaged and were thrown away. Record the refund.',
    accounts: ['Cash', 'Online Sales Revenue', 'Sales Returns and Allowances', 'Sales Discounts', 'Unearned Revenue', 'Accounts Receivable', 'Shipping Expense', 'Inventory'],
    lines: [{ acct: 'Sales Returns and Allowances', dr: 54 }, { acct: 'Cash', cr: 54 }],
    solution: 'Debit Sales Returns and Allowances 54 (a contra-revenue account) and credit Cash 54. The original sale stays in Online Sales Revenue. The bags were thrown away, so nothing goes back into Inventory.',
  },
  {
    id: 'f02-rr-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional food-delivery app takes customers’ orders and payments for partner restaurants, which cook the food and set the menu prices. The app keeps 20% of each order. Last year customers paid $10 million through the app. Which revenue figure should the app report?',
    options: ['$2 million: it is an agent', '$10 million: it collected the payments', '$8 million: the amount passed to restaurants', '$10 million, less delivery costs'],
    answer: 0,
    feedback: {
      1: 'Collecting the money doesn’t make it the principal. The restaurants control the food and set the prices.',
      2: 'The $8 million belongs to the restaurants; the app’s revenue is what it keeps.',
      3: 'Delivery costs are the app’s expenses; the revenue question is whether it reports gross or net.',
    },
    solution: 'The restaurants are primarily responsible for the food, bear the inventory risk and set the prices, so the app is an agent and reports its 20% fee: $2 million.',
  },
  {
    id: 'f02-rr-k5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each item as it appears in a seller’s financial statements.',
    items: [
      'Online Sales Revenue',
      'Sales Returns and Allowances',
      'Sales Discounts',
      'Unearned Revenue',
      'Refund liability for expected returns',
      'Accounts Receivable',
      'Right to recover goods customers are expected to return',
    ],
    categories: ['Revenue', 'Contra revenue', 'Asset', 'Liability'],
    answer: [0, 1, 1, 3, 3, 2, 2],
    feedback: {
      2: 'Sales Discounts reduces revenue, like returns: a contra-revenue account with a debit balance.',
      3: 'Unearned Revenue is an obligation to deliver: a liability, despite its name.',
      6: 'The seller expects to get the goods back, so it holds an asset (with a reduction in cost of sales).',
    },
    solution: 'Revenue: Online Sales Revenue. Contra revenue: Sales Returns and Allowances, Sales Discounts. Liabilities: Unearned Revenue, the refund liability. Assets: Accounts Receivable and the right to recover returned goods.',
  },
  {
    id: 'f02-rr-k6', type: 'num', kind: 'applied',
    prompt: `Lantern’s 2026 net revenue is ${money(D.revenue)}. Suppose a junior bookkeeper had recorded the $2,960 of prepaid subscriptions as Online Sales Revenue and the $1,025 of refunds as Miscellaneous Expense. What net revenue would the draft income statement have shown?`,
    answer: 197305, check: () => D.revenue + FACTS.shop.prepaidSubscriptions + FACTS.shop.refunds, unit: '$', places: 0,
    wrong: [
      { value: 196280, say: 'That includes only one of the two errors, the subscriptions. Moving the refunds to an expense also takes them out of the revenue section, so net revenue rises by $1,025 as well.' },
      { value: 194345, say: 'That adds back the refunds but forgets the subscriptions wrongly counted as sales.' },
      { value: 193320, say: 'That is the correct figure. The question asks what the draft with both errors would show.' },
    ],
    solution: '193,320 + 2,960 (subscriptions wrongly counted as revenue) + 1,025 (refunds no longer deducted from revenue) = $197,305. Both errors overstate net revenue; the first also overstates net income by $2,960 and understates liabilities by the same amount.',
  },
];
