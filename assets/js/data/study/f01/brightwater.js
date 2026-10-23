// brightwater.js — Brightwater Bike Repair, the fictional business in the F01 project. One month (July 2026),
// its month-end facts and its chart of accounts. Every name and figure is invented for teaching.
//
// Mateo Ruiz forms Brightwater Bike Repair, a corporation, on 1 July 2026. It repairs and services bicycles for
// riders, a courier company and a bike-rental fleet. It sells a service, so parts are supplies, expensed as used.
// The books are kept on the accrual basis and closed at the end of July so the whole cycle fits in one month.

export const CHART = [
  { no: 101, name: 'Cash', type: 'asset', group: 'current' },
  { no: 110, name: 'Accounts Receivable', type: 'asset', group: 'current' },
  { no: 120, name: 'Supplies', type: 'asset', group: 'current' },
  { no: 130, name: 'Prepaid Insurance', type: 'asset', group: 'current' },
  { no: 131, name: 'Prepaid Rent', type: 'asset', group: 'current' },
  { no: 150, name: 'Equipment', type: 'asset', group: 'noncurrent' },
  { no: 151, name: 'Accumulated Depreciation—Equipment', type: 'contra-asset', group: 'noncurrent', contra: 'Equipment' },
  { no: 201, name: 'Accounts Payable', type: 'liability', group: 'current' },
  { no: 210, name: 'Wages Payable', type: 'liability', group: 'current' },
  { no: 215, name: 'Interest Payable', type: 'liability', group: 'current' },
  { no: 220, name: 'Unearned Revenue', type: 'liability', group: 'current' },
  { no: 250, name: 'Notes Payable', type: 'liability', group: 'noncurrent' },
  { no: 301, name: 'Common Stock', type: 'equity' },
  { no: 320, name: 'Retained Earnings', type: 'equity' },
  { no: 330, name: 'Dividends', type: 'dividends' },
  { no: 350, name: 'Income Summary', type: 'summary' },
  { no: 401, name: 'Repair Revenue', type: 'revenue' },
  { no: 501, name: 'Wages Expense', type: 'expense' },
  { no: 510, name: 'Rent Expense', type: 'expense' },
  { no: 520, name: 'Supplies Expense', type: 'expense' },
  { no: 530, name: 'Utilities Expense', type: 'expense' },
  { no: 550, name: 'Insurance Expense', type: 'expense' },
  { no: 560, name: 'Depreciation Expense', type: 'expense' },
  { no: 580, name: 'Interest Expense', type: 'expense' },
];

/** July 2026. `cash` classifies the cash line for the statement of cash flows. */
export const JULY = [
  { id: 'b1', date: '2026-07-01', text: 'Mateo Ruiz invests $12,000 cash in Brightwater in exchange for common stock.', lines: [{ acct: 'Cash', dr: 12000 }, { acct: 'Common Stock', cr: 12000 }], cash: 'financing' },
  { id: 'b2', date: '2026-07-01', text: 'Brightwater borrows $5,000 from Harbour Credit Union on a one-year note at 6% a year; interest is paid when the note is repaid.', lines: [{ acct: 'Cash', dr: 5000 }, { acct: 'Notes Payable', cr: 5000 }], cash: 'financing' },
  { id: 'b3', date: '2026-07-01', text: 'Pays $3,600 rent in advance for the workshop for July, August and September.', lines: [{ acct: 'Prepaid Rent', dr: 3600 }, { acct: 'Cash', cr: 3600 }], cash: 'operating' },
  { id: 'b4', date: '2026-07-02', text: 'Buys a repair stand, wheel-truing stand and tools for $4,800: $1,800 in cash and the rest on account.', lines: [{ acct: 'Equipment', dr: 4800 }, { acct: 'Cash', cr: 1800 }, { acct: 'Accounts Payable', cr: 3000 }], cash: 'investing' },
  { id: 'b5', date: '2026-07-03', text: 'Buys parts and workshop supplies (tubes, cables, chains, lubricant) on account for $1,250.', lines: [{ acct: 'Supplies', dr: 1250 }, { acct: 'Accounts Payable', cr: 1250 }] },
  { id: 'b6', date: '2026-07-05', text: 'Pays $720 for a 12-month liability insurance policy that started on 1 July.', lines: [{ acct: 'Prepaid Insurance', dr: 720 }, { acct: 'Cash', cr: 720 }], cash: 'operating' },
  { id: 'b7', date: '2026-07-08', text: 'Repairs bikes for walk-in customers, who pay $2,140 in cash.', lines: [{ acct: 'Cash', dr: 2140 }, { acct: 'Repair Revenue', cr: 2140 }], cash: 'operating' },
  { id: 'b8', date: '2026-07-12', text: 'A cycling club pays $1,800 in advance for tune-ups of its 30 bikes ($60 each), to be done in July and August.', lines: [{ acct: 'Cash', dr: 1800 }, { acct: 'Unearned Revenue', cr: 1800 }], cash: 'operating' },
  { id: 'b9', date: '2026-07-15', text: 'Invoices Swift Courier Co. $1,350 for repairs to its delivery bikes, due in 30 days.', lines: [{ acct: 'Accounts Receivable', dr: 1350 }, { acct: 'Repair Revenue', cr: 1350 }] },
  { id: 'b10', date: '2026-07-15', text: 'Pays the part-time mechanic $960 in wages for 1–15 July.', lines: [{ acct: 'Wages Expense', dr: 960 }, { acct: 'Cash', cr: 960 }], cash: 'operating' },
  { id: 'b11', date: '2026-07-18', text: 'Pays $1,500 of the $3,000 owed for the equipment.', lines: [{ acct: 'Accounts Payable', dr: 1500 }, { acct: 'Cash', cr: 1500 }], cash: 'operating' },
  { id: 'b12', date: '2026-07-24', text: 'Receives $800 from Swift Courier Co. toward its invoice.', lines: [{ acct: 'Cash', dr: 800 }, { acct: 'Accounts Receivable', cr: 800 }], cash: 'operating' },
  { id: 'b13', date: '2026-07-28', text: 'Pays the July electricity and water bill, $185.', lines: [{ acct: 'Utilities Expense', dr: 185 }, { acct: 'Cash', cr: 185 }], cash: 'operating' },
  { id: 'b14', date: '2026-07-29', text: 'Repairs bikes for regular customers on account, $640.', lines: [{ acct: 'Accounts Receivable', dr: 640 }, { acct: 'Repair Revenue', cr: 640 }] },
  { id: 'b15', date: '2026-07-31', text: 'Repairs bikes for walk-in customers, who pay $1,060 in cash.', lines: [{ acct: 'Cash', dr: 1060 }, { acct: 'Repair Revenue', cr: 1060 }], cash: 'operating' },
  { id: 'b16', date: '2026-07-31', text: 'Pays a $400 cash dividend to Mateo, the only shareholder.', lines: [{ acct: 'Dividends', dr: 400 }, { acct: 'Cash', cr: 400 }], cash: 'financing' },
];

/** What Mateo knows on 31 July, from which the adjustments are made. */
export const JULY_FACTS = [
  'One month of the three months’ rent paid on 1 July has been used.',
  'One month of the 12-month insurance policy has expired.',
  'A count on 31 July finds $430 of parts and supplies still on the shelves.',
  'The equipment is expected to last 5 years with no residual value. Brightwater takes a full month’s depreciation in the month an asset is bought.',
  '12 of the cycling club’s 30 bikes have been tuned up.',
  'The mechanic has earned $960 for 16–31 July, to be paid on 1 August.',
  'One month’s interest has built up on the 6% note.',
  'Brightwater finished $310 of repairs on a bike-rental company’s fleet on 30–31 July; it will invoice them in August.',
];

export const JULY_ADJUSTMENTS = [
  { id: 'ba1', date: '2026-07-31', text: 'Rent used in July: $3,600 ÷ 3 months.', lines: [{ acct: 'Rent Expense', dr: 1200 }, { acct: 'Prepaid Rent', cr: 1200 }] },
  { id: 'ba2', date: '2026-07-31', text: 'Insurance expired in July: $720 ÷ 12 months.', lines: [{ acct: 'Insurance Expense', dr: 60 }, { acct: 'Prepaid Insurance', cr: 60 }] },
  { id: 'ba3', date: '2026-07-31', text: 'Supplies used: $1,250 bought − $430 on hand.', lines: [{ acct: 'Supplies Expense', dr: 820 }, { acct: 'Supplies', cr: 820 }] },
  { id: 'ba4', date: '2026-07-31', text: 'Depreciation for July: $4,800 ÷ 60 months.', lines: [{ acct: 'Depreciation Expense', dr: 80 }, { acct: 'Accumulated Depreciation—Equipment', cr: 80 }] },
  { id: 'ba5', date: '2026-07-31', text: 'Tune-ups earned: 12 bikes × $60.', lines: [{ acct: 'Unearned Revenue', dr: 720 }, { acct: 'Repair Revenue', cr: 720 }] },
  { id: 'ba6', date: '2026-07-31', text: 'Wages earned but not yet paid, 16–31 July.', lines: [{ acct: 'Wages Expense', dr: 960 }, { acct: 'Wages Payable', cr: 960 }] },
  { id: 'ba7', date: '2026-07-31', text: 'Interest for July: $5,000 × 6% ÷ 12.', lines: [{ acct: 'Interest Expense', dr: 25 }, { acct: 'Interest Payable', cr: 25 }] },
  { id: 'ba8', date: '2026-07-31', text: 'Repairs done but not yet invoiced.', lines: [{ acct: 'Accounts Receivable', dr: 310 }, { acct: 'Repair Revenue', cr: 310 }] },
];

/** Figures the project's questions use; every one is recomputed by tools/study-check.mjs from the entries above. */
export const JULY_RESULTS = {
  unadjustedTotal: 26740, adjustedTotal: 28115,
  revenue: 6220, expenses: 4290, netIncome: 1930,
  endingRetainedEarnings: 1530,
  cash: 13635, totalAssets: 23345, totalLiabilities: 9815, totalEquity: 13530,
  postClosingTotal: 23425,
};
