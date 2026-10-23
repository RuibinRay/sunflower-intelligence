// receivables-and-payables.ex.js — F02 · Receivables and payables: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
import { CHART, YEAR, ADJUSTMENTS, AGING, FACTS } from './case.js';

/** $1,234 or $1,234.56 (cents only when needed); a real minus sign for negatives. */
const money = (n) => {
  const v = Math.round(n * 100) / 100;
  const dp = Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2;
  const s = Math.abs(v).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '−$' : '$') + s;
};
const tx = (id) => [...YEAR, ...ADJUSTMENTS].find((t) => t.id === id);
const lanternAllowance = AGING.reduce((s, b) => s + b.amount * b.rate, 0);   // 584

export const widgets = {
  'rp-aging': {
    type: 'formula',
    title: 'Aging of receivables and the year-end adjustment',
    intro: 'Amounts owed in three age bands, a loss rate for each, and the allowance’s balance before adjustment (a debit balance is entered as a negative number).',
    inputs: [
      { id: 'b1', label: 'Owed, not yet due (0–30 days)', min: 0, max: 20000, step: 100, value: AGING[0].amount, fmt: 'money' },
      { id: 'b2', label: 'Owed, 31–60 days', min: 0, max: 10000, step: 20, value: AGING[1].amount, fmt: 'money' },
      { id: 'b3', label: 'Owed, over 60 days', min: 0, max: 5000, step: 20, value: AGING[2].amount, fmt: 'money' },
      { id: 'r1', label: 'Loss rate, not yet due', min: 0, max: 10, step: 0.5, value: AGING[0].rate * 100, fmt: 'pct' },
      { id: 'r2', label: 'Loss rate, 31–60 days', min: 0, max: 40, step: 1, value: AGING[1].rate * 100, fmt: 'pct' },
      { id: 'r3', label: 'Loss rate, over 60 days', min: 0, max: 100, step: 5, value: AGING[2].rate * 100, fmt: 'pct' },
      { id: 'unadj', label: 'Allowance before adjustment (credit +, debit −)', min: -3000, max: 3000, step: 20, value: -FACTS.catering.writtenOff, fmt: 'money' },
    ],
    compute: (v) => {
      const need = [v.b1 * v.r1 / 100, v.b2 * v.r2 / 100, v.b3 * v.r3 / 100];
      const req = need[0] + need[1] + need[2];
      const ar = v.b1 + v.b2 + v.b3;
      const expense = req - v.unadj;
      const before = v.unadj < 0 ? `${money(-v.unadj)} debit` : v.unadj > 0 ? `${money(v.unadj)} credit` : 'zero';
      const entry = expense >= 0
        ? `Debit Bad Debt Expense ${money(expense)}; credit Allowance for Doubtful Accounts ${money(expense)}`
        : `Debit Allowance for Doubtful Accounts ${money(-expense)}; credit Bad Debt Expense ${money(-expense)}`;
      let note;
      if (expense < 0) note = `The allowance already holds ${money(v.unadj)}, more than the ${money(req)} the aging requires, so the adjustment reduces it by ${money(-expense)} and the year’s bad debt expense is negative. That usually means earlier estimates were too cautious; the rates deserve a second look.`;
      else if (v.unadj < 0) note = `The allowance starts with a debit balance of ${money(-v.unadj)}: write-offs have already used more than it held. The entry must fill that hole and then build the ${money(req)} required, so the expense is ${money(req)} + ${money(-v.unadj)} = ${money(expense)}.`;
      else if (v.unadj === 0) note = `The allowance is empty before the adjustment, so the whole ${money(req)} the aging requires is this year’s expense.`;
      else note = `The allowance starts with a credit balance of ${money(v.unadj)}, so only the difference, ${money(req)} − ${money(v.unadj)} = ${money(expense)}, is new expense.`;
      return {
        headline: { label: 'Bad debt expense for the year', value: money(expense) },
        rows: [
          ['Allowance required by the aging', money(req)],
          ['Allowance before adjustment', before],
          ['Net receivables after adjustment', money(ar - req)],
          ['Allowance as a share of receivables', ar > 0 ? `${(req / ar * 100).toFixed(1)}%` : '—'],
          ['Adjusting entry', entry],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Age of balance', values: ['Not yet due', '31–60 days', 'Over 60 days'] },
          series: [
            { name: 'Amount owed', values: [v.b1, v.b2, v.b3] },
            { name: 'Allowance needed', values: need.map((x) => Math.round(x * 100) / 100) },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'rp-drill': {
    type: 'journal',
    chart: CHART,
    transactions: ['y8', 'y9', 'y10', 'e6'].map((id) => ({ ...tx(id) })),
    ask: ['accounts', 'direction', 'side', 'amount', 'equation', 'statements'],
  },
};

export const guided = [
  {
    id: 'f02-rp-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional wholesale bakery ages its receivables at 31 December: not yet due $36,000 (expected loss rate 1%); 1–30 days past due $9,000 (5%); 31–60 days past due $4,000 (20%); over 60 days past due $1,000 (60%). Before adjustment the allowance for doubtful accounts has a credit balance of $650.',
    solution: 'Required allowance = 360 + 450 + 800 + 600 = $2,210. Bad debt expense = 2,210 − 650 = $1,560: debit Bad Debt Expense 1,560, credit Allowance for Doubtful Accounts 1,560. Receivables total 50,000, so net receivables are 50,000 − 2,210 = $47,790.',
    steps: [
      { id: 'f02-rp-g1-s1', type: 'num',
        prompt: 'What balance must the allowance have after the adjustment? Round to the nearest dollar.',
        answer: 2210, check: () => 36000 * 0.01 + 9000 * 0.05 + 4000 * 0.2 + 1000 * 0.6, unit: '$', places: 0, tol: 0.5,
        hints: ['Multiply each age band by its own loss rate.', '360 + 450 + 800 + 600.'],
        wrong: [
          { value: 1560, say: 'That is the expense, the required balance minus the 650 already there. The question asks for the balance the allowance must end with.' },
          { value: 650, say: 'That is the balance before adjustment. The aging tells you the balance the allowance needs.' },
          { value: 500, say: 'That applies 1% to all $50,000. Each band has its own rate: older balances are riskier.' },
        ] },
      { id: 'f02-rp-g1-s2', type: 'num',
        prompt: 'What is the bad debt expense for the year? Round to the nearest dollar.',
        answer: 1560, check: () => (36000 * 0.01 + 9000 * 0.05 + 4000 * 0.2 + 1000 * 0.6) - 650, unit: '$', places: 0, tol: 0.5,
        hints: ['The expense tops the allowance up from what it holds to what it needs.', 'A credit balance is already part of the allowance: subtract it.'],
        wrong: [
          { value: 2210, say: 'That is the balance required. The allowance already holds $650 of it, so only the difference is new expense.' },
          { value: 2860, say: 'You added the 650. A credit balance is already in the allowance; add only a debit balance.' },
        ] },
      { id: 'f02-rp-g1-s3', type: 'journal', chart: 'f02', date: '2026-12-31',
        prompt: 'Record the adjusting entry on 31 December.',
        accounts: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash', 'Sales Returns and Allowances', 'Miscellaneous Expense', 'Retained Earnings'],
        lines: [{ acct: 'Bad Debt Expense', dr: 1560 }, { acct: 'Allowance for Doubtful Accounts', cr: 1560 }],
        hints: ['An expense increases (debit); the contra-asset increases (credit).', 'Accounts Receivable is not touched: no particular customer has been written off.'] },
      { id: 'f02-rp-g1-s4', type: 'num',
        prompt: 'What are net receivables after the adjustment? Round to the nearest dollar.',
        answer: 47790, check: () => (36000 + 9000 + 4000 + 1000) - (36000 * 0.01 + 9000 * 0.05 + 4000 * 0.2 + 1000 * 0.6), unit: '$', places: 0, tol: 0.5,
        hints: ['Add the four bands for gross receivables.', 'Subtract the allowance after adjustment, not the expense.'],
        wrong: [{ value: 48440, say: 'You subtracted the expense (1,560). Net receivables use the allowance’s balance after adjustment, $2,210.' }] },
    ],
  },
  {
    id: 'f02-rp-g2', type: 'steps', kind: 'applied',
    prompt: 'A fictional university bookshop sells to student societies on account and keeps an allowance for doubtful accounts. On 14 March it writes off a society’s balance of $2,400. On 2 August the society, now under new officers, pays $900 of that amount.',
    solution: '14 March: debit Allowance for Doubtful Accounts 2,400, credit Accounts Receivable 2,400; net receivables don’t change. 2 August: reinstate 900 (debit Accounts Receivable, credit Allowance for Doubtful Accounts), then record the cash (debit Cash, credit Accounts Receivable).',
    steps: [
      { id: 'f02-rp-g2-s1', type: 'journal', chart: 'f02', date: '2026-03-14',
        prompt: 'Record the write-off on 14 March.',
        accounts: ['Allowance for Doubtful Accounts', 'Accounts Receivable', 'Bad Debt Expense', 'Cash', 'Sales Returns and Allowances', 'Notes Receivable'],
        lines: [{ acct: 'Allowance for Doubtful Accounts', dr: 2400 }, { acct: 'Accounts Receivable', cr: 2400 }],
        hints: ['The loss was expected when the allowance was set up; no new expense now.', 'Remove the receivable (credit) and use up part of the allowance (debit).'] },
      { id: 'f02-rp-g2-s2', type: 'mc',
        prompt: 'The allowance had a credit balance of $5,000 before the write-off. What does the write-off do to net receivables?',
        options: [
          'Nothing: receivables and the allowance both fall by $2,400',
          'It reduces them by $2,400',
          'It increases them by $2,400, because the allowance is smaller',
          'It reduces them by the bad debt expense recorded last year',
        ],
        answer: 0,
        feedback: {
          1: 'Receivables fall by $2,400, but so does the allowance deducted from them. The net figure is unchanged.',
          2: 'The allowance is smaller, but so are the receivables it is deducted from. The two changes cancel.',
          3: 'Last year’s expense was recorded last year. The write-off moves amounts between two balance sheet accounts.',
        },
        hints: ['Net receivables = Accounts Receivable − Allowance. Both change.'] },
      { id: 'f02-rp-g2-s3', type: 'journal', chart: 'f02', date: '2026-08-02',
        prompt: 'Record the first entry on 2 August: reinstate the part of the balance that is being paid.',
        accounts: ['Allowance for Doubtful Accounts', 'Accounts Receivable', 'Bad Debt Expense', 'Cash', 'Interest Revenue', 'Notes Receivable'],
        lines: [{ acct: 'Accounts Receivable', dr: 900 }, { acct: 'Allowance for Doubtful Accounts', cr: 900 }],
        hints: ['Reverse the write-off, but only for the $900 recovered.', 'Debit the receivable, credit the allowance.'] },
      { id: 'f02-rp-g2-s4', type: 'journal', chart: 'f02', date: '2026-08-02',
        prompt: 'Record the second entry on 2 August: the cash received.',
        accounts: ['Allowance for Doubtful Accounts', 'Accounts Receivable', 'Bad Debt Expense', 'Cash', 'Interest Revenue', 'Notes Receivable'],
        lines: [{ acct: 'Cash', dr: 900 }, { acct: 'Accounts Receivable', cr: 900 }],
        hints: ['This is an ordinary collection from a customer.'] },
    ],
  },
  {
    id: 'f02-rp-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional battery-storage installer accepts a $15,000, nine-month note at 7% a year from a customer on 1 August 2026, in place of an overdue invoice. Principal and interest are due on 1 May 2027. The installer’s financial year ends on 31 December.',
    solution: '1 August: debit Notes Receivable 15,000, credit Accounts Receivable 15,000. 31 December: interest for August–December = 15,000 × 0.07 × 5/12 = $437.50 (debit Interest Receivable, credit Interest Revenue). At maturity the customer pays 15,000 + 15,000 × 0.07 × 9/12 = $15,787.50, of which 787.50 − 437.50 = $350 is 2027’s interest revenue.',
    steps: [
      { id: 'f02-rp-g3-s1', type: 'journal', chart: 'f02', date: '2026-08-01',
        prompt: 'Record the note on 1 August.',
        accounts: ['Notes Receivable', 'Accounts Receivable', 'Cash', 'Interest Receivable', 'Interest Revenue', 'Catering Revenue'],
        lines: [{ acct: 'Notes Receivable', dr: 15000 }, { acct: 'Accounts Receivable', cr: 15000 }],
        hints: ['No cash changes hands: one receivable replaces another.', 'The revenue was recorded when the original invoice was raised.'] },
      { id: 'f02-rp-g3-s2', type: 'num',
        prompt: 'How much interest revenue is accrued on 31 December 2026? Give dollars and cents.',
        answer: 437.5, check: () => 15000 * 0.07 * 5 / 12, unit: '$', places: 2, tol: 0.005,
        hints: ['I = P × r × t, with t in years.', 'August to December is five months: t = 5/12.'],
        wrong: [
          { value: 1050, say: 'That is a full year of interest. The note has been outstanding for five months.' },
          { value: 787.5, say: 'That is the interest for the whole nine-month term. Only August to December belongs to 2026.' },
          { value: 350, say: 'That is four months. Count August, September, October, November and December.' },
        ] },
      { id: 'f02-rp-g3-s3', type: 'num',
        prompt: 'How much cash does the installer receive on 1 May 2027? Give dollars and cents.',
        answer: 15787.5, check: () => 15000 + 15000 * 0.07 * 9 / 12, unit: '$', places: 2, tol: 0.005,
        hints: ['The maker pays the principal plus interest for the whole nine months.'],
        wrong: [
          { value: 16050, say: 'That adds a full year of interest. The note runs for nine months.' },
          { value: 15437.5, say: 'That adds only the interest accrued in 2026. At maturity the customer pays interest for all nine months.' },
        ] },
      { id: 'f02-rp-g3-s4', type: 'num',
        prompt: 'How much interest revenue belongs to 2027? Give dollars and cents.',
        answer: 350, check: () => 15000 * 0.07 * 9 / 12 - 15000 * 0.07 * 5 / 12, unit: '$', places: 2, tol: 0.005,
        hints: ['January to April 2027 is four months.', 'Or: total interest 787.50 less the 437.50 already recognised in 2026.'],
        wrong: [{ value: 787.5, say: '437.50 of the interest was recognised in 2026 and is collected as Interest Receivable. Only the rest is 2027’s revenue.' }] },
    ],
  },
  {
    id: 'f02-rp-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional hotel lists these items at 31 December: $4,200 owed to its laundry supplier on an invoice received in December; $9,600 of staff wages earned in the last week of December, paid on 3 January; $15,500 of deposits from guests for January stays; $2,300 of December electricity, to be billed in January; $3,100 of interest accrued on its mortgage; income tax for the year of $46,000, of which $38,000 was paid in instalments during the year.',
    solution: 'Accounts payable: laundry 4,200. Accrued liabilities: wages 9,600, electricity 2,300, interest 3,100. Unearned revenue: deposits 15,500. Income taxes payable: 46,000 − 38,000 = 8,000. Total current liabilities = 4,200 + 9,600 + 15,500 + 2,300 + 3,100 + 8,000 = $42,700.',
    steps: [
      { id: 'f02-rp-g4-s1', type: 'classify',
        prompt: 'Classify each item.',
        items: ['Laundry supplier’s invoice', 'Wages earned in the last week', 'Guests’ deposits for January stays', 'December electricity, not yet billed', 'Interest accrued on the mortgage'],
        categories: ['Accounts payable', 'Accrued liability', 'Unearned revenue', 'Income taxes payable'],
        answer: [0, 1, 2, 1, 1],
        feedback: {
          2: 'The hotel owes the guests their stays, not money: a liability settled by providing the rooms.',
          3: 'With no invoice yet, the cost is recorded by an adjusting entry as an accrued liability; it becomes a payable when the bill arrives.',
        },
        hints: ['An invoice received makes a payable; a cost incurred with no invoice yet is accrued.', 'Cash received for a service not yet given is unearned revenue.'] },
      { id: 'f02-rp-g4-s2', type: 'num',
        prompt: 'What is income taxes payable at 31 December? Round to the nearest dollar.',
        answer: 8000, check: () => 46000 - 38000, unit: '$', places: 0, tol: 0.5,
        hints: ['Only the part not yet paid is a liability.'],
        wrong: [{ value: 46000, say: 'That is the tax for the year. $38,000 of it was paid in instalments; only the rest is still owed.' }] },
      { id: 'f02-rp-g4-s3', type: 'num',
        prompt: 'What are the hotel’s total current liabilities from these items? Round to the nearest dollar.',
        answer: 42700, check: () => 4200 + 9600 + 15500 + 2300 + 3100 + (46000 - 38000), unit: '$', places: 0, tol: 0.5,
        hints: ['Add all five items and the tax still owed.'],
        wrong: [
          { value: 27200, say: 'The guests’ deposits are a liability too: the hotel owes them their stays.' },
          { value: 80700, say: 'You included the whole year’s tax. Only the $8,000 still owed is a liability.' },
        ] },
    ],
  },
];

export const independent = [
  {
    id: 'f02-rp-i1', type: 'journal', kind: 'applied', chart: 'f02', date: '2026-12-31',
    prompt: 'A fictional airline-catering company’s aging at 31 December says its allowance for doubtful accounts should be $12,500. Write-offs during the year exceeded the allowance, which now has a debit balance of $3,200. Record the adjusting entry.',
    accounts: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash', 'Sales Returns and Allowances', 'Retained Earnings'],
    lines: [{ acct: 'Bad Debt Expense', dr: 15700 }, { acct: 'Allowance for Doubtful Accounts', cr: 15700 }],
    solution: 'The entry must remove the debit balance and build the required credit balance: 12,500 + 3,200 = $15,700. Debit Bad Debt Expense 15,700; credit Allowance for Doubtful Accounts 15,700. The allowance then shows a credit of $12,500.',
  },
  {
    id: 'f02-rp-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional office-cleaning company estimates bad debts at 1.25% of credit sales. Credit sales for the year were $840,000, and the allowance had a credit balance of $2,300 before adjustment. What is the balance of the allowance after the adjustment? Round to the nearest dollar.',
    answer: 12800, check: () => 0.0125 * 840000 + 2300, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 10500, say: 'That is the expense. Under the income statement approach the allowance ends at the old balance plus the expense.' },
      { value: 8200, say: 'You subtracted the credit balance. Under the income statement approach the expense is added to whatever is already in the allowance.' },
    ],
    solution: 'Expense = 1.25% × 840,000 = $10,500. The allowance ends at 2,300 + 10,500 = $12,800 credit.',
  },
  {
    id: 'f02-rp-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional office-supplies wholesaler started the year with accounts receivable of $31,500. During the year it made credit sales of $412,000 and wrote off $3,800 of customer balances. Receivables at the year end are $36,700. How much did it collect from customers on account during the year? Round to the nearest dollar.',
    answer: 403000, check: () => 31500 + 412000 - 3800 - 36700, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 406800, say: 'Write-offs also reduce receivables. Collections = beginning + credit sales − write-offs − ending.' },
      { value: 399200, say: 'You subtracted the write-offs twice. Collections = 31,500 + 412,000 − 3,800 − 36,700.' },
      { value: 371500, say: 'You left out the opening balance. The $31,500 owed on 1 January could also be collected: collections = 31,500 + 412,000 − 3,800 − 36,700.' },
    ],
    solution: 'Roll-forward: ending = beginning + credit sales − collections − write-offs, so collections = 31,500 + 412,000 − 3,800 − 36,700 = $403,000.',
  },
  {
    id: 'f02-rp-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Why does US GAAP not accept the direct write-off method for a business with material credit losses?',
    options: [
      'It puts each loss in the period the customer fails, not the period of the sale, and overstates receivables meanwhile.',
      'The IRS does not allow a deduction for a bad debt until an allowance has been set up.',
      'It records bad debt expense twice: once when the loss is estimated at the year end and again when the account is written off.',
      'It needs an aging schedule, which the Codification reserves for public companies that file with the SEC.',
    ],
    answer: 0,
    feedback: {
      1: 'The tax rule runs the other way: a business deducts a bad debt when it becomes worthless, whatever its books show.',
      2: 'The direct method records the expense once, at the write-off. Double counting would come from debiting Bad Debt Expense at a write-off under the allowance method.',
      3: 'The direct method uses no estimate at all. Aging schedules are one accepted way of measuring the allowance, for any company.',
    },
    solution: 'The direct method waits for a specific customer to fail, often in a later period than the sale, and until then reports receivables at the full amount owed. ASC 326 requires receivables to be presented at the net amount expected to be collected, which needs an allowance. Only immaterial losses may be expensed as they occur.',
  },
  {
    id: 'f02-rp-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional clothing brand is offered terms of 1/10, n/40 by a fabric supplier. Its bank charges 9% a year on its overdraft. What is the annualised cost (simple rate) of not taking the discount? Give a percentage to one decimal place.',
    answer: 12.3, check: () => 0.01 / 0.99 * 365 / 30 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 12.2, say: 'Close, but the 1% discount is earned on the 99% you pay, so the rate per period is 1 ÷ 99, not 1 ÷ 100.' },
      { value: 9.2, say: 'The borrowing lasts 40 − 10 = 30 days, not 40: you could pay on day 10 anyway.' },
      { value: 1, say: 'That is the cost for 30 days. Annualise it: × 365 ÷ 30.' },
    ],
    solution: 'Cost = 1/99 × 365/(40 − 10) = 0.0101 × 12.17 ≈ 12.3% a year. That is more than the 9% overdraft, so the brand should borrow on its overdraft, if it has to, and take the discount.',
  },
  {
    id: 'f02-rp-i6', type: 'classify', kind: 'conceptual',
    prompt: 'A business uses the allowance method. What does each event do to its net receivables (accounts receivable minus the allowance)?',
    items: [
      'A sale on credit',
      'Cash collected from a customer’s account',
      'A customer’s account is written off',
      'The year-end bad debt adjustment',
      'A written-off account is reinstated because the customer will pay',
    ],
    categories: ['Increase', 'Decrease', 'No effect'],
    answer: [0, 1, 2, 1, 2],
    feedback: {
      2: 'Receivables and the allowance fall by the same amount, so the net figure doesn’t move.',
      3: 'The adjustment increases the allowance, which is deducted from receivables.',
      4: 'Reinstating raises receivables and the allowance by the same amount; the cash that follows is a normal collection.',
    },
    solution: 'Credit sale: increase. Collection: decrease (the asset becomes cash). Write-off: no effect. Bad debt adjustment: decrease. Reinstatement: no effect (and the cash then collected decreases receivables like any collection).',
  },
];

export const check = [
  {
    id: 'f02-rp-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional software reseller’s receivables at 31 December are: 0–30 days $120,000 (expected loss rate 1.5%); 31–60 days $24,000 (6%); 61–90 days $8,000 (25%); over 90 days $4,000 (70%). Before adjustment the allowance has a debit balance of $1,260. What is the bad debt expense for the year? Round to the nearest dollar.',
    answer: 9300, check: () => (120000 * 0.015 + 24000 * 0.06 + 8000 * 0.25 + 4000 * 0.7) + 1260, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 8040, say: 'That is the allowance required. The account starts with a debit balance, which the adjustment must also cover.' },
      { value: 6780, say: 'A debit balance is added, not subtracted: losses have already outrun the allowance.' },
    ],
    solution: 'Required allowance = 1,800 + 1,440 + 2,000 + 2,800 = 8,040. Expense = 8,040 + 1,260 (debit balance) = $9,300.',
  },
  {
    id: 'f02-rp-k2', type: 'journal', kind: 'applied', chart: 'f02', date: '2027-03-09',
    prompt: 'A fictional print supplier, which uses the allowance method, wrote off a hotel’s $1,250 balance in 2026. On 9 March 2027 the hotel pays $500 of it. Record the first of the two entries that day: the one that reinstates the receivable.',
    accounts: ['Accounts Receivable', 'Allowance for Doubtful Accounts', 'Bad Debt Expense', 'Cash', 'Sales Returns and Allowances', 'Retained Earnings'],
    lines: [{ acct: 'Accounts Receivable', dr: 500 }, { acct: 'Allowance for Doubtful Accounts', cr: 500 }],
    solution: 'Reverse the write-off for the amount recovered, not the whole $1,250: debit Accounts Receivable 500, credit Allowance for Doubtful Accounts 500. The second entry records the cash: debit Cash 500, credit Accounts Receivable 500. No revenue or reduction of bad debt expense is recorded; the sale was recognised in an earlier period.',
  },
  {
    id: 'f02-rp-k3', type: 'mc', kind: 'conceptual',
    prompt: 'A company keeps an adequate allowance for doubtful accounts. What is the effect of writing off a specific customer’s account?',
    options: [
      'Total assets and net receivables are unchanged',
      'Bad debt expense increases by the amount written off',
      'Net income falls in the period of the write-off',
      'Net receivables and total assets fall by the amount written off',
    ],
    answer: 0,
    feedback: {
      1: 'The expense was recorded when the allowance was estimated. Debiting Bad Debt Expense again would count the loss twice.',
      2: 'No income statement account is touched: the entry debits the allowance and credits receivables.',
      3: 'Receivables fall, but so does the allowance deducted from them; the net amount is unchanged.',
    },
    solution: 'Debit Allowance for Doubtful Accounts, credit Accounts Receivable. Both balance sheet figures fall by the same amount, so net receivables, total assets and net income are unaffected.',
  },
  {
    id: 'f02-rp-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these appear among a company’s current liabilities at 31 December 2026? Select all that apply.',
    options: [
      'Wages earned by staff on 29–31 December, paid on 5 January',
      'Customers’ deposits for events in January 2027',
      'Income tax for 2026 not yet paid',
      'A bank loan repayable in one sum on 1 March 2028',
      'The allowance for doubtful accounts',
      'Amounts customers owe on 30-day terms',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'A loan due in 14 months is noncurrent at 31 December 2026; it becomes current a year later.',
      4: 'The allowance is a contra-asset, deducted from receivables, even though it has a credit balance.',
      5: 'Amounts customers owe are receivables, an asset.',
    },
    solution: 'Current liabilities: accrued wages, customer deposits (unearned revenue) and income taxes payable. The loan due in March 2028 is noncurrent; the allowance and the receivables belong to current assets.',
  },
  {
    id: 'f02-rp-k5', type: 'num', kind: 'applied',
    prompt: 'Lantern’s allowance had a debit balance of $820 before its year-end adjustment, and its catering credit sales for 2026 were $59,920. Suppose its accountant had estimated bad debts at 2.5% of credit sales instead of using the aging. What would the allowance’s balance have been after the adjustment? Round to the nearest dollar.',
    answer: 678, check: () => 0.025 * 59920 - 820, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1498, say: 'That is the expense. The allowance ends at the unadjusted balance plus the expense, and the unadjusted balance is a debit of 820.' },
      { value: 2318, say: 'A debit balance reduces what is left in the allowance after the expense is added.' },
      { value: 584, say: 'That is the balance from Lantern’s aging. The question asks what the percentage-of-sales method would leave.' },
    ],
    solution: 'Expense = 2.5% × 59,920 = $1,498. The allowance ends at −820 + 1,498 = $678 credit, more than the $584 the aging requires.',
  },
  {
    id: 'f02-rp-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the description of the allowance method.',
    text: 'At the period end the estimate of uncollectible accounts is recorded by debiting [[0]] and crediting [[1]]. When a particular customer’s balance is written off, the business debits [[2]] and credits [[3]]. The balance sheet shows receivables at the amount the business [[4]].',
    blanks: [
      { options: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash'], answer: 0 },
      { options: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash'], answer: 1 },
      { options: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash'], answer: 1 },
      { options: ['Bad Debt Expense', 'Allowance for Doubtful Accounts', 'Accounts Receivable', 'Cash'], answer: 2 },
      { options: ['expects to collect', 'invoiced', 'collected during the year', 'wrote off'], answer: 0 },
    ],
    solution: 'Estimate: debit Bad Debt Expense, credit Allowance for Doubtful Accounts. Write-off: debit Allowance for Doubtful Accounts, credit Accounts Receivable. Receivables are reported net of the allowance, at the amount the business expects to collect.',
  },
];
