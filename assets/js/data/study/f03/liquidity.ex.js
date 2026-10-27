// liquidity.ex.js — F03 · Liquidity: widgets, practice and the knowledge check (answer keys live here).
// Lantern’s figures come from case.js and the ratios from core/ratios.js; Starbucks FY2024 is from its Form 10-K;
// Harbourline is F00’s fictional roaster; every other business is fictional and invented for the exercise.
import { PERIODS, COMPARATIVE } from './case.js?v=22';
import { HARBOURLINE as HB, HARBOURLINE_DETAIL as HBD } from '../f00/case.js?v=22';
import * as R from '../../../core/ratios.js?v=22';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const b27 = (label) => COMPARATIVE.balance.find((r) => r[0] === label)[2];
const leaseCur = b27('Current Portion of Operating Lease Liabilities');
const loc = b27('Line of Credit');
const x2 = (v) => v.toFixed(2);
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

export const widgets = {
  'liq-ratios': {
    type: 'ratios',
    title: 'Liquidity ratios: Lantern, Starbucks and Harbourline',
    periods: [{ label: '2026 (10 months)', data: P26 }, { label: '2027', data: P27 }],
    peers: [
      { label: 'Starbucks FY2024 ($m)', data: { months: 12, currentAssets: 6847.4, currentLiabilities: 9070.0, cash: 3286.2, shortTermInvestments: 257.0, receivables: 1213.8, inventory: 1777.3, cfo: 6095.6 } },
      { label: 'Harbourline ($m, fictional)', data: { months: 12, currentAssets: HB.currentAssets, currentLiabilities: HB.currentLiabilities, cash: HB.cash, receivables: HBD.receivables, inventory: HBD.inventory } },
    ],
    ratios: ['workingCapital', 'current', 'quick', 'cash', 'operatingCashFlow'],
    toggles: ['annualise'],
    adjust: [
      { id: 'draw', label: '2027: draw the last $6,000 of the line of credit on 31 December and hold the cash', period: 1, delta: { cash: 6000, currentAssets: 6000, currentLiabilities: 6000 } },
      { id: 'termout', label: '2027: replace the line of credit and the Coastline note with a five-year loan ($34,000 out of current liabilities)', period: 1, delta: { currentLiabilities: -(loc + 10000) } },
      { id: 'leases', label: '2027: leave the current lease liabilities out (a definition some loan agreements use)', period: 1, delta: { currentLiabilities: -leaseCur } },
    ],
    select: 'current',
    note: 'Harbourline has no cash-flow figure in F00, so its operating cash flow ratio shows a dash. Annualising changes only the 2026 operating cash flow ratio: the other ratios compare balances at one date.',
  },
  'liq-dress': {
    type: 'formula',
    title: 'Window dressing: paying or borrowing at the year end',
    intro: 'Starting values: Lantern at 31 December 2027. A positive amount pays current liabilities with cash; a negative amount borrows short-term and holds the cash. Set current assets above current liabilities to see the opposite effect.',
    inputs: [
      { id: 'ca', label: 'Current assets before', min: 0, max: 200000, step: 1, value: P27.currentAssets, fmt: 'money' },
      { id: 'cl', label: 'Current liabilities before', min: 1000, max: 200000, step: 1, value: P27.currentLiabilities, fmt: 'money' },
      { id: 'x', label: 'Liabilities paid with cash (negative: borrowed and held)', min: -30000, max: 30000, step: 500, value: 6000, fmt: 'money' },
    ],
    compute: (v) => {
      const ca = v.ca - v.x, cl = v.cl - v.x;
      if (ca < 0) return { error: 'The business can’t pay more than its current assets: lower the amount or raise current assets.' };
      if (cl <= 0) return { error: 'That would pay off every current liability and more: lower the amount.' };
      const before = v.ca / v.cl, after = ca / cl;
      const dir = after > before + 1e-9 ? 'rises' : after < before - 1e-9 ? 'falls' : 'is unchanged';
      return {
        headline: { label: 'Current ratio after', value: x2(after) },
        rows: [
          ['Current ratio before', x2(before)],
          ['Current assets after', money(ca)],
          ['Current liabilities after', money(cl)],
          ['Working capital (before and after)', money(v.ca - v.cl)],
        ],
        note: v.x === 0 ? 'Nothing changes. Enter an amount to pay or borrow.'
          : `The ratio ${dir}, from ${x2(before)} to ${x2(after)}, while working capital stays at ${money(v.ca - v.cl)}. ${before > 1 ? (v.x > 0 ? 'Above 1, paying liabilities with cash raises the ratio.' : 'Above 1, borrowing and holding the cash lowers the ratio.') : before < 1 ? (v.x > 0 ? 'Below 1, paying liabilities with cash lowers the ratio.' : 'Below 1, borrowing and holding the cash raises the ratio.') : 'At exactly 1, equal changes to both totals leave the ratio at 1.'} The business is no more able to pay its bills either way.`,
        chart: { kind: 'bar', x: { label: 'Total', values: ['Current assets', 'Current liabilities'] }, series: [{ name: 'Before', values: [v.ca, v.cl] }, { name: 'After', values: [ca, cl] }], y: { label: 'Dollars' } },
      };
    },
  },
};

const QUICK_CATS = ['In the quick ratio', 'Current, but not in the quick ratio', 'Not a current asset'];

export const guided = [
  {
    id: 'f03-liq-g1', type: 'steps', kind: 'numerical',
    prompt: 'Saltmarsh Inn, a fictional 40-room hotel, reports at 31 December 2027: cash $38,000; Treasury bills maturing in 60 days $20,000; receivables from tour operators, net, $26,000; food and drink inventory $9,000; prepaid insurance $7,000; total current assets $100,000. Current liabilities: accounts payable $22,000; deposits for 2028 bookings $31,000; wages payable $8,000; current portion of the mortgage $19,000; total $80,000. Give each ratio to two decimal places.',
    solution: 'Current ratio = 100,000 ÷ 80,000 = 1.25. Quick ratio = (38,000 + 20,000 + 26,000) ÷ 80,000 = 84,000 ÷ 80,000 = 1.05. Cash ratio = (38,000 + 20,000) ÷ 80,000 = 0.73.',
    steps: [
      { id: 'f03-liq-g1-s1', type: 'num', prompt: 'What is the current ratio?',
        answer: 1.25, check: () => 100000 / 80000, unit: '', places: 2, tol: 0.005,
        hints: ['Total current assets ÷ total current liabilities.', '100,000 ÷ 80,000.'],
        wrong: [{ value: 0.8, say: 'That is current liabilities ÷ current assets: the ratio upside down.' }] },
      { id: 'f03-liq-g1-s2', type: 'num', prompt: 'What is the quick ratio?',
        answer: 1.05, check: () => (38000 + 20000 + 26000) / 80000, unit: '', places: 2, tol: 0.005,
        hints: ['Count cash, short-term investments and net receivables only.', 'The Treasury bills are short-term investments; inventory and prepaid insurance are out: 84,000 ÷ 80,000.'],
        wrong: [
          { value: 0.8, say: 'The Treasury bills are short-term investments and belong in the quick ratio: add the $20,000.' },
          { value: 1.16, say: 'Inventory must be sold before it becomes cash; leave the $9,000 out.' },
        ] },
      { id: 'f03-liq-g1-s3', type: 'num', prompt: 'What is the cash ratio?',
        answer: 0.73, check: () => (38000 + 20000) / 80000, unit: '', places: 2, tol: 0.005,
        hints: ['Cash plus short-term investments, over current liabilities.'],
        wrong: [{ value: 0.48, say: 'The 60-day Treasury bills count with cash in the cash ratio: (38,000 + 20,000) ÷ 80,000.' }] },
    ],
  },
  {
    id: 'f03-liq-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Place each of these balance-sheet items, taken from Lantern’s and other businesses’ statements, in the right group for the quick ratio.',
    items: ['Cash in the bank', 'Accounts receivable, net of the allowance', 'A contract asset for work done but not yet billable', 'Inventory of coffee beans', 'Prepaid insurance', 'Treasury bills maturing in three months', 'An operating lease right-of-use asset', 'Espresso machines'],
    categories: QUICK_CATS,
    answer: [0, 0, 1, 1, 1, 0, 2, 2],
    hints: ['Quick assets are money already, or an unconditional right to be paid on a set date.', 'A right-of-use asset and equipment are used for years: they are noncurrent.'],
    feedback: {
      2: 'A contract asset is current, but it is not yet an unconditional right to payment: the business must reach a billing date or perform further. It stays out of the quick ratio.',
      3: 'Inventory is current but must be sold before it becomes cash.',
      4: 'Prepaid insurance will be used up, never turned back into cash.',
      5: 'Short-term investments that can be sold quickly at close to their value count as quick assets.',
      6: 'The right-of-use asset is noncurrent, even though part of the lease liability is current.',
    },
    solution: 'Quick: cash, net receivables and the Treasury bills. Current but not quick: the contract asset, inventory and prepaid insurance. Not current: the right-of-use asset and the espresso machines.',
  },
  {
    id: 'f03-liq-g3', type: 'num', kind: 'applied',
    prompt: 'By how much did the cafés’ leases reduce Lantern’s working capital at 31 December 2027? Lantern’s right-of-use asset is $173,379; its operating lease liabilities are $37,010 current and $136,369 noncurrent. Enter a reduction as a positive number of dollars.',
    answer: 37010, check: () => leaseCur, unit: '$', places: 0, tol: 0.5,
    hints: ['Which of the three balances are current?', 'Only the current part of the liability enters working capital; the right-of-use asset is noncurrent.'],
    wrong: [
      { value: 173379, say: 'The right-of-use asset is noncurrent, so it does not enter working capital at all. Only the current lease liability does.' },
      { value: 136369, say: 'The noncurrent liability is outside working capital. Look for the part due within a year.' },
      { value: 40000, say: 'That is what Lantern paid for the leases in 2027. Working capital at the year end is reduced by the part of the liability the 2028 payments will settle.' },
    ],
    solution: 'Working capital counts current items only. The right-of-use asset ($173,379) and the noncurrent liability ($136,369) are both outside it; the current lease liability, $37,010, is inside it. The leases therefore reduce working capital by $37,010, which is also 173,379 − 136,369.',
  },
  {
    id: 'f03-liq-g4', type: 'mc', kind: 'conceptual',
    prompt: 'At 31 December 2027 Lantern’s current ratio is 0.52. Suppose that on that day it had used $5,000 of cash to pay suppliers early. What would have happened to its current ratio?',
    options: ['It would have fallen slightly', 'It would have risen slightly towards 1', 'It would not have changed at all', 'It would have risen above 1'],
    answer: 0,
    hints: ['The payment takes $5,000 off both totals.', 'Try it: (59,104 − 5,000) ÷ (114,537 − 5,000).'],
    feedback: {
      1: 'That is what happens to a ratio above 1. Below 1, taking the same amount off both totals moves the ratio further from 1: 54,104 ÷ 109,537 = 0.49.',
      2: 'Working capital is unchanged, but the ratio is not: equal changes to both totals move a ratio unless it is exactly 1.',
      3: 'A $5,000 payment can’t close a gap of more than $55,000.',
    },
    solution: 'Paying a liability with cash reduces current assets and current liabilities by the same amount. For a ratio below 1 that lowers it: (59,104 − 5,000) ÷ (114,537 − 5,000) = 54,104 ÷ 109,537 = 0.49. Working capital stays at −$55,433.',
  },
];

export const independent = [
  {
    id: 'f03-liq-i1', type: 'num', kind: 'numerical',
    prompt: 'Brightline Air, a fictional regional airline, reports current assets of $412 million: cash $140 million, short-term investments $85 million, receivables $47 million, spare parts and fuel $58 million, prepaid expenses and other $82 million. Its current liabilities are $530 million, of which $210 million is tickets sold for future flights. What is its quick ratio, to two decimal places?',
    answer: 0.51, check: () => (140 + 85 + 47) / 530, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.78, say: 'That is the current ratio. The quick ratio leaves out spare parts, fuel and prepaid expenses.' },
      { value: 0.85, say: 'Tickets sold in advance are still current liabilities in the standard ratio. You can discuss them separately, but keep the standard ratio standard.' },
      { value: 0.35, say: 'Short-term investments are quick assets: include the $85 million.' },
      { value: 0.42, say: 'That is the cash ratio: it leaves out receivables. The quick ratio includes the $47 million owed by customers.' },
    ],
    solution: 'Quick assets = 140 + 85 + 47 = $272 million. Quick ratio = 272 ÷ 530 = 0.51. The $210 million of advance ticket sales is settled by flying passengers, so the airline is less stretched than 0.51 suggests, but that is an interpretation, not a change to the ratio.',
  },
  {
    id: 'f03-liq-i2', type: 'num', kind: 'numerical',
    prompt: 'Fernhill Florists, a fictional business, started trading on 1 April 2027. For the nine months to 31 December 2027 its net cash from operating activities was $54,000; its current liabilities at 31 December were $60,000. To compare with a full-year business, what is its operating cash flow ratio with cash from operations annualised? Give two decimal places.',
    answer: 1.2, check: () => R.annualise(54000, 9) / 60000, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.9, say: 'That is the nine-month figure. Annualise the flow first: 54,000 × 12 ÷ 9 = 72,000.' },
      { value: 0.68, say: 'Annualising multiplies a nine-month flow by 12 ÷ 9, not by 9 ÷ 12.' },
    ],
    solution: 'Annualised cash from operations = 54,000 × 12 ÷ 9 = 72,000. Ratio = 72,000 ÷ 60,000 = 1.20. Say that you annualised, and remember that a florist’s nine months from April miss the busy February before Valentine’s Day, so the true full-year figure may differ.',
  },
  {
    id: 'f03-liq-i3', type: 'multi', kind: 'applied',
    prompt: 'Corbel Joinery, a fictional company, has current assets of $250,000 and current liabilities of $200,000 at 30 December 2027. Its loan agreement requires a current ratio of at least 1.2 at 31 December. Which of these transactions on 31 December would put it in breach? Select all that apply.',
    options: [
      'Buying a $40,000 panel saw for cash',
      'Paying a $40,000 cash dividend',
      'Paying $40,000 of supplier invoices early',
      'Drawing $40,000 on its overdraft and holding the cash',
      'Collecting $40,000 of receivables',
    ],
    answer: [0, 1],
    feedback: {
      2: 'Paying liabilities with cash takes $40,000 off both totals: 210,000 ÷ 160,000 = 1.31, higher than before because the ratio started above 1.',
      3: 'Borrowing short-term and holding the cash adds to both totals: 290,000 ÷ 240,000 = 1.21. The ratio falls but stays above 1.2.',
      4: 'Collecting receivables swaps one current asset for another: the ratio stays at 1.25.',
    },
    solution: 'Today the ratio is 250,000 ÷ 200,000 = 1.25. The saw and the dividend each take $40,000 out of current assets and nothing out of current liabilities: 210,000 ÷ 200,000 = 1.05, a breach. Paying suppliers gives 1.31; the overdraft gives 1.21; collecting receivables leaves 1.25.',
  },
  {
    id: 'f03-liq-i4', type: 'num', kind: 'numerical',
    prompt: 'During 2027 Ashgrove Dental, a fictional practice, earned net income of $64,000 and paid $34,000 in dividends; it took out a new five-year bank loan of $20,000 and repaid none of its long-term debt, and no long-term debt became current. It bought $95,000 of new equipment, and the year’s depreciation was $15,000. No other noncurrent items changed. By how much did its working capital change? Enter a decrease as a negative number of dollars.',
    answer: -30000, check: () => (64000 - 34000) + 20000 - (95000 - 15000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -45000, say: 'Noncurrent assets rose by the purchase less the year’s depreciation, $80,000, not by $95,000.' },
      { value: 4000, say: 'The dividend left the business: equity rose by net income less dividends, $30,000.' },
      { value: 50000, say: 'Buying the equipment used funds that would otherwise be working capital: subtract the rise in noncurrent assets.' },
    ],
    solution: 'ΔWorking capital = ΔEquity + ΔNoncurrent liabilities − ΔNoncurrent assets = (64,000 − 34,000) + 20,000 − (95,000 − 15,000) = 30,000 + 20,000 − 80,000 = −$30,000.',
  },
  {
    id: 'f03-liq-i5', type: 'short', kind: 'applied',
    prompt: 'Ana has read that Starbucks’ current ratio was 0.75 at its 2024 year end and concludes that Lantern’s 0.52 is “nothing to worry about, cafés always look like that”. Write four to six sentences replying to her.',
    rubric: [
      'Agrees that a ratio below 1 can be normal for a business paid at the till, with little stock and normal supplier credit.',
      'Points out what makes Starbucks’ ratio safe: about $6.1 billion of operating cash flow (an operating cash flow ratio of about 0.67), and current liabilities partly settled in coffee (stored-value cards).',
      'Contrasts Lantern’s operating cash flow ratio of 0.07 and quick ratio of 0.15, and notes that much of its current assets is the contract asset.',
      'Explains that Lantern’s current liabilities are mostly debt and leases with fixed dates, including the Coastline note on 1 March 2028.',
      'Ends with a practical recommendation (long-term funding, timing of the law firm’s fee, a cash calendar).',
    ],
    model: 'You are right that cafés can live with a current ratio below 1: they are paid at the till, hold little stock and get normal credit from suppliers. What makes Starbucks’ 0.75 safe is its cash flow, about $6.1 billion a year from operations, two-thirds of its current liabilities, and the fact that part of what it owes is card balances settled in coffee. Lantern’s operating cash flow covered only 7% of its current liabilities in 2027, and more than half of its current assets is the law firm’s fee, which it cannot bill until 31 March. Most of what Lantern owes within the year is debt and rent with fixed dates, including the $10,000 Coastline note on 1 March. So the 0.52 is worth worrying about: I would plan the first quarter’s cash week by week and look for long-term money for the cafés.',
  },
];

export const check = [
  {
    id: 'f03-liq-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which item is a current asset but is left out of the quick ratio because it is not yet an unconditional right to be paid?',
    options: ['A contract asset', 'Accounts receivable, net', 'Short-term investments', 'Cash equivalents'],
    answer: 0,
    feedback: {
      1: 'Net receivables are invoiced amounts the customer must pay on a set date: they are in the quick ratio.',
      2: 'Short-term investments can be sold quickly at close to their value: they are quick assets.',
      3: 'Cash equivalents are as good as cash.',
    },
    solution: 'A contract asset is revenue earned whose payment still depends on something other than time, such as a billing date or further performance. Lantern’s $30,840 for the law firm is current (it will be paid on 31 March 2028) but is not quick.',
  },
  {
    id: 'f03-liq-k2', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s $24,000 line of credit had instead been a five-year term loan, with nothing repayable in 2028. With every other balance as reported, what would its current ratio have been at 31 December 2027? Lantern’s current assets were $59,104 and its current liabilities $114,537. Give two decimal places.',
    answer: 0.65, check: () => P27.currentAssets / (P27.currentLiabilities - loc), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.52, say: 'That is the reported ratio. A five-year loan would sit in noncurrent liabilities, so take $24,000 out of current liabilities.' },
      { value: 0.31, say: 'The cash borrowed stays in current assets either way; only the classification of the loan changes. Don’t subtract $24,000 from current assets.' },
    ],
    solution: 'Current liabilities would be 114,537 − 24,000 = 90,537, with current assets unchanged. Current ratio = 59,104 ÷ 90,537 = 0.65. The same borrowing, classified as long-term, makes Lantern look more liquid.',
  },
  {
    id: 'f03-liq-k3', type: 'mc', kind: 'applied',
    prompt: 'An analyst sees that Starbucks’ current ratio was 0.75 at 29 September 2024. Which observation best explains why this need not signal a liquidity problem?',
    options: [
      'Its yearly operating cash flow covers about two-thirds of its current liabilities',
      'Its total assets exceed its current liabilities several times over, so it could sell stores to pay what falls due this year',
      'Accounting standards require a current ratio below 1 for any company that recognises operating lease liabilities',
      'Its shareholders’ equity is negative, which shows that the owners have already put in more cash than the business needs',
    ],
    answer: 0,
    feedback: {
      1: 'Selling long-lived assets to meet this year’s bills is a last resort, not liquidity. The point of the ratio is to compare short-term items.',
      2: 'No standard requires any value. Leases do add current liabilities, but the ratio is still a result, not a rule.',
      3: 'Negative equity means liabilities exceed assets on the books; it says nothing good about cash. It comes up in the next lesson.',
    },
    solution: 'A low current ratio is safe when cash keeps arriving: Starbucks’ $6,095.6 million of operating cash flow is about 0.67 of its $9,070.0 million of current liabilities, and its stored-value card liability is met by serving drinks already paid for.',
  },
  {
    id: 'f03-liq-k4', type: 'num', kind: 'numerical',
    prompt: 'Rookwood Print, a fictional printer, has current assets of $90,000 and current liabilities of $60,000 on 30 December. On 31 December it pays $15,000 of supplier invoices that are not due until late January. What is its current ratio after the payment? Give two decimal places.',
    answer: 1.67, check: () => (90000 - 15000) / (60000 - 15000), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.5, say: 'That is the ratio before the payment. Take $15,000 off both totals.' },
      { value: 1.25, say: 'Paying suppliers reduces current liabilities as well as cash: 75,000 ÷ 45,000.' },
    ],
    solution: 'After the payment: (90,000 − 15,000) ÷ (60,000 − 15,000) = 75,000 ÷ 45,000 = 1.67, up from 1.50. Working capital is still $30,000: the improvement is window dressing.',
  },
  {
    id: 'f03-liq-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these helped push Lantern’s current ratio down from 2.15 to 0.52 during 2027? Select all that apply.',
    options: [
      'Paying for the cafés’ fit-out and machines in cash',
      'The current portion of the cafés’ operating lease liabilities',
      'The Coastline note falling due on 1 March 2028',
      'Recording the law firm’s catering as a contract asset',
      'A net loss for the year',
      'Issuing new shares to Ana',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'The contract asset added $30,840 to current assets: it held the ratio up, not down (without it the ratio would be 0.25).',
      4: 'Lantern made a profit of $22,431 in 2027, which added to working capital.',
      5: 'Lantern issued no shares in 2027, and new shares for cash would have raised the ratio.',
    },
    solution: 'The fit-out and machines turned $54,000 of cash into noncurrent assets; the leases put $37,010 of lease liability falling due in 2028 into current liabilities; and the Coastline note became current. The contract asset raised current assets, profit added to working capital, and there were no new shares.',
  },
  {
    id: 'f03-liq-k6', type: 'classify', kind: 'conceptual',
    prompt: 'Lenders read current liabilities by how they will be settled. Place each item.',
    items: ['Unearned revenue for workshop places already paid for', 'A coffee chain’s stored-value card balances', 'Accounts payable to a bean supplier', 'The current portion of a bank loan', 'The current portion of an operating lease liability', 'Wages payable'],
    categories: ['Settled mainly by delivering goods or services', 'Settled in cash'],
    answer: [0, 0, 1, 1, 1, 1],
    feedback: {
      0: 'The customers have paid; Lantern settles this by running the workshops. It costs cash only through the cost of delivering or a refund.',
      1: 'Card balances are paid in advance and redeemed for drinks.',
      4: 'Lease payments are contractual cash payments, like a loan’s.',
    },
    solution: 'Unearned revenue and stored-value card balances are settled by delivering what customers have paid for. Payables, loan instalments, lease payments and wages are paid in cash.',
  },
];
