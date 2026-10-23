// case.js — Lantern Coffee Co., the fictional business that runs through F01 Introduction to Financial Accounting.
// One source of truth for its chart of accounts, its first month of transactions and its month-end adjustments,
// so every lesson, exercise, widget and the Accounting Lab tell the same story with the same numbers.
// Every name and figure here is invented for teaching.
//
// The story: Ana Lim starts Lantern Coffee Co., a corporation that caters coffee for offices and events and runs
// barista-training workshops, on 1 March 2026. It sells a service, so it holds no inventory: beans, milk and cups
// are supplies, expensed as they are used. The books are kept on the accrual basis under US GAAP.
// Lessons close March so the whole cycle can be seen in one month; most businesses close once a year.

/** Account types:
 *  asset, contra-asset (normal credit, reduces an asset), liability, equity (common stock, retained earnings),
 *  dividends (normal debit, reduces equity, temporary), revenue, expense, summary (Income Summary, used only when closing). */
export const CHART = [
  { no: 101, name: 'Cash', type: 'asset', group: 'current' },
  { no: 110, name: 'Accounts Receivable', type: 'asset', group: 'current' },
  { no: 112, name: 'Interest Receivable', type: 'asset', group: 'current' },
  { no: 115, name: 'Notes Receivable', type: 'asset', group: 'current' },
  { no: 120, name: 'Supplies', type: 'asset', group: 'current' },
  { no: 130, name: 'Prepaid Insurance', type: 'asset', group: 'current' },
  { no: 131, name: 'Prepaid Rent', type: 'asset', group: 'current' },
  { no: 132, name: 'Prepaid Advertising', type: 'asset', group: 'current' },
  { no: 150, name: 'Equipment', type: 'asset', group: 'noncurrent' },
  { no: 151, name: 'Accumulated Depreciation—Equipment', type: 'contra-asset', group: 'noncurrent', contra: 'Equipment' },
  { no: 160, name: 'Van', type: 'asset', group: 'noncurrent' },
  { no: 161, name: 'Accumulated Depreciation—Van', type: 'contra-asset', group: 'noncurrent', contra: 'Van' },
  { no: 170, name: 'Land', type: 'asset', group: 'noncurrent' },
  { no: 175, name: 'Building', type: 'asset', group: 'noncurrent' },
  { no: 176, name: 'Accumulated Depreciation—Building', type: 'contra-asset', group: 'noncurrent', contra: 'Building' },
  { no: 201, name: 'Accounts Payable', type: 'liability', group: 'current' },
  { no: 210, name: 'Wages Payable', type: 'liability', group: 'current' },
  { no: 215, name: 'Interest Payable', type: 'liability', group: 'current' },
  { no: 220, name: 'Unearned Revenue', type: 'liability', group: 'current' },
  { no: 250, name: 'Notes Payable', type: 'liability', group: 'noncurrent' },
  { no: 301, name: 'Common Stock', type: 'equity' },
  { no: 320, name: 'Retained Earnings', type: 'equity' },
  { no: 330, name: 'Dividends', type: 'dividends' },
  { no: 350, name: 'Income Summary', type: 'summary' },
  { no: 401, name: 'Catering Revenue', type: 'revenue' },
  { no: 402, name: 'Training Revenue', type: 'revenue' },
  { no: 410, name: 'Interest Revenue', type: 'revenue' },
  { no: 501, name: 'Wages Expense', type: 'expense' },
  { no: 510, name: 'Rent Expense', type: 'expense' },
  { no: 520, name: 'Supplies Expense', type: 'expense' },
  { no: 530, name: 'Utilities Expense', type: 'expense' },
  { no: 540, name: 'Advertising Expense', type: 'expense' },
  { no: 550, name: 'Insurance Expense', type: 'expense' },
  { no: 560, name: 'Depreciation Expense', type: 'expense' },
  { no: 570, name: 'Fuel Expense', type: 'expense' },
  { no: 580, name: 'Interest Expense', type: 'expense' },
  { no: 590, name: 'Repairs Expense', type: 'expense' },
  { no: 599, name: 'Miscellaneous Expense', type: 'expense' },
];

/**
 * March 2026: Lantern's first month. Each transaction: { id, date, text, lines: [{ acct, dr } | { acct, cr }], cash? }.
 * `cash` classifies the cash line for the statement of cash flows when Cash is involved.
 */
export const MARCH = [
  { id: 'm1', date: '2026-03-01', text: 'Ana Lim invests $20,000 cash in Lantern Coffee Co. in exchange for common stock.',
    lines: [{ acct: 'Cash', dr: 20000 }, { acct: 'Common Stock', cr: 20000 }], cash: 'financing' },
  { id: 'm2', date: '2026-03-01', text: 'Lantern borrows $10,000 from Coastline Bank, signing a two-year note payable at 6% annual interest. Interest is paid every three months, starting on 1 June, and the $10,000 is repaid in full on 1 March 2028.',
    lines: [{ acct: 'Cash', dr: 10000 }, { acct: 'Notes Payable', cr: 10000 }], cash: 'financing' },
  { id: 'm3', date: '2026-03-03', text: 'Lantern buys an espresso machine and grinder for $12,000, paying $4,000 in cash and owing the supplier the remaining $8,000, due in 30 days.',
    lines: [{ acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 4000 }, { acct: 'Accounts Payable', cr: 8000 }], cash: 'investing' },
  { id: 'm4', date: '2026-03-04', text: 'Lantern pays $1,800 for a 12-month insurance policy that runs from 1 March 2026 to 28 February 2027.',
    lines: [{ acct: 'Prepaid Insurance', dr: 1800 }, { acct: 'Cash', cr: 1800 }], cash: 'operating' },
  { id: 'm5', date: '2026-03-05', text: 'Lantern buys coffee beans, milk, cups and lids for $1,500 on account.',
    lines: [{ acct: 'Supplies', dr: 1500 }, { acct: 'Accounts Payable', cr: 1500 }] },
  { id: 'm6', date: '2026-03-08', text: 'Harbor Tech pays a $2,400 deposit for three catered events at $800 each, on 26 March, 9 April and 23 April.',
    lines: [{ acct: 'Cash', dr: 2400 }, { acct: 'Unearned Revenue', cr: 2400 }], cash: 'operating' },
  { id: 'm7', date: '2026-03-10', text: 'Lantern pays $350 for social-media advertising that runs in March.',
    lines: [{ acct: 'Advertising Expense', dr: 350 }, { acct: 'Cash', cr: 350 }], cash: 'operating' },
  { id: 'm8', date: '2026-03-12', text: 'Lantern caters a two-day conference for Meridian Partners and sends an invoice for $4,200, due in 30 days.',
    lines: [{ acct: 'Accounts Receivable', dr: 4200 }, { acct: 'Catering Revenue', cr: 4200 }] },
  { id: 'm9', date: '2026-03-15', text: 'Lantern runs a barista-training workshop and collects $1,500 in cash from the participants.',
    lines: [{ acct: 'Cash', dr: 1500 }, { acct: 'Training Revenue', cr: 1500 }], cash: 'operating' },
  { id: 'm10', date: '2026-03-18', text: 'Lantern pays $1,000 of the $1,500 it owes for supplies.',
    lines: [{ acct: 'Accounts Payable', dr: 1000 }, { acct: 'Cash', cr: 1000 }], cash: 'operating' },
  { id: 'm11', date: '2026-03-20', text: 'Lantern pays its baristas $1,600 in wages for 1–15 March.',
    lines: [{ acct: 'Wages Expense', dr: 1600 }, { acct: 'Cash', cr: 1600 }], cash: 'operating' },
  { id: 'm12', date: '2026-03-25', text: 'Meridian Partners pays $3,000 of its $4,200 invoice.',
    lines: [{ acct: 'Cash', dr: 3000 }, { acct: 'Accounts Receivable', cr: 3000 }], cash: 'operating' },
  { id: 'm13', date: '2026-03-28', text: 'Lantern pays $1,200 rent for its shared commercial kitchen for March.',
    lines: [{ acct: 'Rent Expense', dr: 1200 }, { acct: 'Cash', cr: 1200 }], cash: 'operating' },
  { id: 'm14', date: '2026-03-30', text: 'Lantern’s board declares and pays a $300 cash dividend to its shareholder, Ana Lim.',
    lines: [{ acct: 'Dividends', dr: 300 }, { acct: 'Cash', cr: 300 }], cash: 'financing' },
  { id: 'm15', date: '2026-03-31', text: 'Lantern receives the $260 utilities bill for March, due on 15 April.',
    lines: [{ acct: 'Utilities Expense', dr: 260 }, { acct: 'Accounts Payable', cr: 260 }] },
];

/** Information available on 31 March, and the adjusting entry each leads to. */
export const MARCH_ADJUSTMENTS = [
  { id: 'a1', kind: 'prepaid expense', text: 'One month of the 12-month, $1,800 insurance policy has expired.',
    lines: [{ acct: 'Insurance Expense', dr: 150 }, { acct: 'Prepaid Insurance', cr: 150 }] },
  { id: 'a2', kind: 'prepaid expense (supplies)', text: 'A count on 31 March finds $600 of supplies still on hand. The Supplies account shows $1,500.',
    lines: [{ acct: 'Supplies Expense', dr: 900 }, { acct: 'Supplies', cr: 900 }] },
  { id: 'a3', kind: 'depreciation', text: 'The $12,000 of equipment is expected to last five years with no residual value. Lantern uses straight-line depreciation and takes a full month in the month of purchase.',
    lines: [{ acct: 'Depreciation Expense', dr: 200 }, { acct: 'Accumulated Depreciation—Equipment', cr: 200 }] },
  { id: 'a4', kind: 'unearned revenue', text: 'Lantern catered the first of Harbor Tech’s three prepaid events on 26 March.',
    lines: [{ acct: 'Unearned Revenue', dr: 800 }, { acct: 'Catering Revenue', cr: 800 }] },
  { id: 'a5', kind: 'accrued expense', text: 'Baristas earned $1,400 of wages for 16–31 March. They will be paid on 5 April.',
    lines: [{ acct: 'Wages Expense', dr: 1400 }, { acct: 'Wages Payable', cr: 1400 }] },
  { id: 'a6', kind: 'accrued expense (interest)', text: 'One month of interest has built up on the $10,000, 6% note: $10,000 × 6% × 1/12.',
    lines: [{ acct: 'Interest Expense', dr: 50 }, { acct: 'Interest Payable', cr: 50 }] },
  { id: 'a7', kind: 'accrued revenue', text: 'On 31 March Lantern catered a $600 breakfast for Pier Nine Studio. It will send the invoice on 2 April.',
    lines: [{ acct: 'Accounts Receivable', dr: 600 }, { acct: 'Catering Revenue', cr: 600 }] },
];

/**
 * Totals the lessons quote, worked out by hand and re-checked in tests/study.test.mjs with the accounting engine.
 * Unadjusted trial balance total 46,860; adjusted 49,110; post-closing 42,700.
 */
export const MARCH_FACTS = {
  cashEnd: 26650,
  unadjustedTotal: 46860,
  adjustedTotal: 49110,
  revenue: 7100,            // Catering 5,600 + Training 1,500
  expenses: 6110,
  netIncome: 990,
  dividends: 300,
  retainedEarningsEnd: 690,
  totalAssets: 42500,       // current 30,700 + equipment 12,000 − accumulated depreciation 200
  totalLiabilities: 21810,  // current 11,810 + notes payable 10,000
  totalEquity: 20690,       // common stock 20,000 + retained earnings 690
  postClosingTotal: 42700,
  cashFlows: { operating: 950, investing: -4000, financing: 29700 },
  noncash: 'Equipment of $8,000 bought on credit (supplier owed at 31 March).',
};
