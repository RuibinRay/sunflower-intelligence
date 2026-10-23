// closing-entries.ex.js — F01 · Closing entries: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

/** Lantern’s four closing entries at 31 March 2026 (from the adjusted balances in case.js). */
const CLOSING = [
  { id: 'c1', date: '2026-03-31', text: 'Close the revenue accounts: Catering Revenue has a credit balance of $5,600 and Training Revenue $1,500.',
    lines: [{ acct: 'Catering Revenue', dr: 5600 }, { acct: 'Training Revenue', dr: 1500 }, { acct: 'Income Summary', cr: 7100 }] },
  { id: 'c2', date: '2026-03-31', text: 'Close the eight expense accounts: Wages $3,000, Rent $1,200, Supplies $900, Utilities $260, Advertising $350, Insurance $150, Depreciation $200 and Interest $50.',
    lines: [{ acct: 'Income Summary', dr: 6110 }, { acct: 'Wages Expense', cr: 3000 }, { acct: 'Rent Expense', cr: 1200 }, { acct: 'Supplies Expense', cr: 900 }, { acct: 'Utilities Expense', cr: 260 }, { acct: 'Advertising Expense', cr: 350 }, { acct: 'Insurance Expense', cr: 150 }, { acct: 'Depreciation Expense', cr: 200 }, { acct: 'Interest Expense', cr: 50 }] },
  { id: 'c3', date: '2026-03-31', text: 'Income Summary now has a credit balance of $990, the net income for March. Close it.',
    lines: [{ acct: 'Income Summary', dr: 990 }, { acct: 'Retained Earnings', cr: 990 }] },
  { id: 'c4', date: '2026-03-31', text: 'Close the Dividends account, which has a debit balance of $300.',
    lines: [{ acct: 'Retained Earnings', dr: 300 }, { acct: 'Dividends', cr: 300 }] },
];

const MARCH_IDS = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'];
const ADJ_IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];
const LANTERN_EXPENSES = ['Wages Expense', 'Rent Expense', 'Supplies Expense', 'Utilities Expense', 'Advertising Expense', 'Insurance Expense', 'Depreciation Expense', 'Interest Expense'];

export const widgets = {
  'close-ledger': {
    type: 'ledger',
    mode: 'watch',
    transactions: [...MARCH_IDS, ...ADJ_IDS, ...CLOSING],
    show: ['taccounts', 'trial'],
  },
  'close-drill': {
    type: 'journal',
    transactions: CLOSING,
    ask: ['accounts', 'side', 'amount'],
  },
};

export const guided = [
  {
    id: 'f01-cl-g1', type: 'steps', kind: 'applied',
    prompt: 'On 31 March Lantern begins closing its books. Its adjusted trial balance shows Catering Revenue $5,600 and Training Revenue $1,500, and eight expense accounts: Wages Expense $3,000, Rent Expense $1,200, Supplies Expense $900, Utilities Expense $260, Advertising Expense $350, Insurance Expense $150, Depreciation Expense $200 and Interest Expense $50.',
    solution: 'Entry 1 debits Catering Revenue 5,600 and Training Revenue 1,500 and credits Income Summary 7,100. Entry 2 debits Income Summary 6,110 and credits each of the eight expense accounts for its balance. Income Summary is then a credit of 7,100 − 6,110 = $990, which equals March’s net income.',
    steps: [
      { id: 'f01-cl-g1-s1', type: 'journal', chart: 'f01', date: '2026-03-31',
        prompt: 'Record the entry that closes the revenue accounts.',
        accounts: ['Catering Revenue', 'Training Revenue', 'Unearned Revenue', 'Income Summary', 'Retained Earnings', 'Cash'],
        lines: [{ acct: 'Catering Revenue', dr: 5600 }, { acct: 'Training Revenue', dr: 1500 }, { acct: 'Income Summary', cr: 7100 }],
        hints: ['Revenue accounts have credit balances. To bring a balance to zero, record it on the opposite side.', 'Debit Catering Revenue 5,600 and Training Revenue 1,500; credit Income Summary for the total.'] },
      { id: 'f01-cl-g1-s2', type: 'journal', chart: 'f01', date: '2026-03-31',
        prompt: 'Record the entry that closes the expense accounts.',
        accounts: [...LANTERN_EXPENSES, 'Income Summary', 'Retained Earnings', 'Supplies', 'Prepaid Insurance', 'Accumulated Depreciation—Equipment'],
        lines: [{ acct: 'Income Summary', dr: 6110 }, { acct: 'Wages Expense', cr: 3000 }, { acct: 'Rent Expense', cr: 1200 }, { acct: 'Supplies Expense', cr: 900 }, { acct: 'Utilities Expense', cr: 260 }, { acct: 'Advertising Expense', cr: 350 }, { acct: 'Insurance Expense', cr: 150 }, { acct: 'Depreciation Expense', cr: 200 }, { acct: 'Interest Expense', cr: 50 }],
        hints: ['Expense accounts have debit balances, so each one is credited for its balance.', 'Debit Income Summary once, for the total of the eight expenses. Supplies, Prepaid Insurance and Accumulated Depreciation are balance-sheet accounts: leave them alone.'] },
      { id: 'f01-cl-g1-s3', type: 'num',
        prompt: 'After these two entries, what is the balance of Income Summary?',
        answer: 990, check: () => (5600 + 1500) - (3000 + 1200 + 900 + 260 + 350 + 150 + 200 + 50), unit: '$', places: 0, tol: 0.5,
        hints: ['Income Summary has revenue on its credit side and expenses on its debit side.', 'Credit 7,100 minus debit 6,110.'],
        wrong: [
          { value: 7100, say: 'That is total revenue only. Entry 2 put the expenses on the debit side of Income Summary: subtract them.' },
          { value: 13210, say: 'Revenue and expenses are on opposite sides of Income Summary, so they offset each other. Subtract rather than add.' },
          { value: 690, say: 'You have taken off the dividends too. Dividends are not closed to Income Summary, so its balance is net income before dividends.' },
        ] },
    ],
  },
  {
    id: 'f01-cl-g2', type: 'steps', kind: 'applied',
    prompt: 'Finish Lantern’s close. Income Summary has a credit balance of $990 and Dividends a debit balance of $300. Retained Earnings has had no entries since the business began on 1 March.',
    solution: 'Entry 3: debit Income Summary 990, credit Retained Earnings 990. Entry 4: debit Retained Earnings 300, credit Dividends 300. Retained Earnings = 0 + 990 − 300 = $690, which matches the statement of changes in equity and the balance sheet.',
    steps: [
      { id: 'f01-cl-g2-s1', type: 'journal', chart: 'f01', date: '2026-03-31',
        prompt: 'Record the entry that closes Income Summary.',
        accounts: ['Income Summary', 'Retained Earnings', 'Dividends', 'Common Stock', 'Cash'],
        lines: [{ acct: 'Income Summary', dr: 990 }, { acct: 'Retained Earnings', cr: 990 }],
        hints: ['Income Summary has a credit balance, so it is debited to bring it to zero.', 'Net income belongs to the owners’ earned capital: credit Retained Earnings.'] },
      { id: 'f01-cl-g2-s2', type: 'journal', chart: 'f01', date: '2026-03-31',
        prompt: 'Record the entry that closes Dividends.',
        accounts: ['Income Summary', 'Retained Earnings', 'Dividends', 'Common Stock', 'Cash'],
        lines: [{ acct: 'Retained Earnings', dr: 300 }, { acct: 'Dividends', cr: 300 }],
        hints: ['Dividends are not an expense, so they skip Income Summary.', 'Dividends has a debit balance: credit it, and debit the account that dividends reduce.'] },
      { id: 'f01-cl-g2-s3', type: 'num',
        prompt: 'What is the balance of Retained Earnings after both entries?',
        answer: 690, check: () => 0 + 990 - 300, unit: '$', places: 0, tol: 0.5,
        hints: ['Start from zero: Lantern has never closed its books before.', 'Add net income and subtract dividends.'],
        wrong: [
          { value: 990, say: 'That is Retained Earnings after entry 3 only. Entry 4 moves the $300 of dividends in on the debit side.' },
          { value: 1290, say: 'Dividends reduce retained earnings: they are debited to it, not credited.' },
        ] },
      { id: 'f01-cl-g2-s4', type: 'mc',
        prompt: 'Which figure in Lantern’s March statements should equal this balance?',
        options: [
          'Retained earnings on the balance sheet, which is also the closing balance on the statement of changes in equity',
          'Net income on the income statement',
          'Cash on the balance sheet',
          'Total equity on the balance sheet',
        ],
        answer: 0,
        hints: ['Closing exists to make the ledger agree with one particular statement line.'],
        feedback: {
          1: 'Net income ($990) is what entry 3 moved in; the balance also reflects the dividends.',
          2: 'Retained earnings are a claim on all the assets, not an amount of cash. Lantern’s cash is $26,650.',
          3: 'Total equity ($20,690) also includes $20,000 of common stock, which closing doesn’t touch.',
        } },
    ],
  },
  {
    id: 'f01-cl-g3', type: 'classify', kind: 'conceptual',
    prompt: 'Sort each account: is it permanent (its balance carries into the next period) or temporary (closed at the end of the period)?',
    items: ['Unearned Revenue', 'Training Revenue', 'Accumulated Depreciation—Equipment', 'Depreciation Expense', 'Prepaid Insurance', 'Dividends', 'Retained Earnings', 'Income Summary', 'Interest Payable', 'Common Stock'],
    categories: ['Permanent: carried forward', 'Temporary: closed'],
    answer: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    hints: ['Ask where each account is reported. Balance-sheet accounts are permanent.', 'Revenue, expense and dividend accounts, and Income Summary, are temporary. Watch for names that contain “revenue” or “depreciation” but belong on the balance sheet.'],
    feedback: {
      0: 'Unearned Revenue is a liability: Lantern still owes the service. It appears on the balance sheet and carries forward.',
      2: 'Accumulated depreciation is a contra-asset that keeps growing over the equipment’s life. It is never closed.',
      4: 'Prepaid Insurance is an asset: the cover still to come. It carries forward.',
      5: 'Dividends are not an expense, but they measure a period’s distributions, so the account is temporary and is closed to Retained Earnings.',
      7: 'Income Summary is temporary by design: it is used only during closing and is zero before and after.',
    },
    solution: 'Permanent: Unearned Revenue, Accumulated Depreciation—Equipment, Prepaid Insurance, Retained Earnings, Interest Payable and Common Stock, all of which appear on the balance sheet. Temporary: Training Revenue, Depreciation Expense, Dividends and Income Summary.',
  },
  {
    id: 'f01-cl-g4', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-10-31',
    prompt: 'A fictional surf school closes its year on 31 October 2026. After its revenue and expense accounts have been closed, Income Summary shows debits of $58,400 and credits of $55,150. Record the entry that closes Income Summary.',
    accounts: ['Income Summary', 'Retained Earnings', 'Dividends', 'Training Revenue', 'Cash'],
    lines: [{ acct: 'Retained Earnings', dr: 3250 }, { acct: 'Income Summary', cr: 3250 }],
    hints: ['Work out Income Summary’s balance first: which side is larger, and by how much?', 'Debits exceed credits by 3,250, a net loss. Close it by crediting Income Summary and debiting Retained Earnings.'],
    solution: 'Income Summary has a debit balance of 58,400 − 55,150 = $3,250, so the school made a net loss. To bring Income Summary to zero, credit it 3,250; the loss reduces retained earnings, so debit Retained Earnings 3,250.',
  },
];

export const independent = [
  {
    id: 'f01-cl-i1', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-06-30',
    prompt: 'A fictional company that trains electricians to install home battery-storage systems closes its year on 30 June 2026. Its revenue accounts show Training Revenue of $248,600 and Interest Revenue of $1,150 (interest on a note receivable from a customer). Record the entry that closes the revenue accounts.',
    accounts: ['Training Revenue', 'Interest Revenue', 'Interest Receivable', 'Notes Receivable', 'Unearned Revenue', 'Income Summary', 'Retained Earnings'],
    lines: [{ acct: 'Training Revenue', dr: 248600 }, { acct: 'Interest Revenue', dr: 1150 }, { acct: 'Income Summary', cr: 249750 }],
    solution: 'Debit each revenue account for its credit balance, Training Revenue 248,600 and Interest Revenue 1,150, and credit Income Summary for the total, 248,600 + 1,150 = $249,750. Interest Receivable and Notes Receivable are assets and are not closed.',
  },
  {
    id: 'f01-cl-i2', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-12-31',
    prompt: 'A fictional food-truck company that caters street festivals closes its year on 31 December 2026. Its expense accounts show Supplies Expense $46,300, Wages Expense $58,800, Fuel Expense $7,450, Repairs Expense $3,920 and Depreciation Expense $9,000. Record the entry that closes the expense accounts.',
    accounts: ['Supplies Expense', 'Wages Expense', 'Fuel Expense', 'Repairs Expense', 'Depreciation Expense', 'Supplies', 'Accumulated Depreciation—Van', 'Income Summary', 'Retained Earnings'],
    lines: [{ acct: 'Income Summary', dr: 125470 }, { acct: 'Supplies Expense', cr: 46300 }, { acct: 'Wages Expense', cr: 58800 }, { acct: 'Fuel Expense', cr: 7450 }, { acct: 'Repairs Expense', cr: 3920 }, { acct: 'Depreciation Expense', cr: 9000 }],
    solution: 'Credit each expense for its debit balance and debit Income Summary for the total: 46,300 + 58,800 + 7,450 + 3,920 + 9,000 = $125,470. Supplies and Accumulated Depreciation—Van are balance-sheet accounts and stay open.',
  },
  {
    id: 'f01-cl-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand’s Retained Earnings account had a credit balance of $15,200 at the start of the year. For the year, revenue totalled $148,000 and expenses $151,600, and the board declared dividends of $2,000. What is the balance of Retained Earnings after the closing entries are posted?',
    answer: 9600, check: () => 15200 + (148000 - 151600) - 2000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 16800, say: 'You added the $3,600 as if it were a profit. Expenses exceeded revenue, so Income Summary had a debit balance and closing it reduced Retained Earnings.' },
      { value: 11600, say: 'You have closed the loss but not the dividends. Dividends also reduce Retained Earnings.' },
      { value: 13200, say: 'You subtracted the dividends but left out the year’s result. The $3,600 net loss is closed to Retained Earnings too.' },
    ],
    solution: 'Net income = 148,000 − 151,600 = −3,600, a net loss. Retained Earnings after closing = 15,200 − 3,600 − 2,000 = $9,600.',
  },
  {
    id: 'f01-cl-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these accounts appear on Lantern’s post-closing trial balance at 31 March 2026? Select all that apply.',
    options: ['Unearned Revenue', 'Income Summary', 'Accumulated Depreciation—Equipment', 'Supplies Expense', 'Retained Earnings', 'Dividends', 'Interest Payable', 'Catering Revenue'],
    answer: [0, 2, 4, 6],
    feedback: {
      1: 'Income Summary is zero once entry 3 is posted, so it doesn’t appear.',
      3: 'Supplies Expense is temporary and was closed in entry 2. The asset Supplies ($600) does appear.',
      5: 'Dividends was closed to Retained Earnings in entry 4.',
      7: 'Catering Revenue was closed in entry 1, despite the cash it brought in.',
    },
    solution: 'Only permanent accounts with balances appear: Unearned Revenue ($1,600, a liability), Accumulated Depreciation—Equipment ($200, a contra-asset), Retained Earnings ($690) and Interest Payable ($50). Income Summary, Supplies Expense, Dividends and Catering Revenue are temporary and are zero after closing.',
  },
  {
    id: 'f01-cl-i5', type: 'mc', kind: 'applied',
    prompt: 'A company’s post-closing trial balance balances at $84,350 but still lists Advertising Expense with a debit of $1,800. What does this tell you?',
    options: [
      'Advertising Expense was left out of the closing entries, so Retained Earnings is $1,800 too high.',
      'Nothing is wrong, because the trial balance balances.',
      'Retained Earnings is $1,800 too low.',
      'The advertising must be prepaid, so it is right to carry it forward.',
    ],
    answer: 0,
    feedback: {
      1: 'Balancing proves only that debits equal credits. A temporary account on a post-closing trial balance always means closing is incomplete.',
      2: 'Leaving an expense out of entry 2 makes Income Summary’s credit balance $1,800 too large, and that larger figure is closed to Retained Earnings. It is overstated, not understated.',
      3: 'Prepaid advertising would be recorded in an asset account such as Prepaid Advertising, not in Advertising Expense. An expense account is always closed.',
    },
    solution: 'An expense account should be zero after closing. Because the $1,800 was never debited to Income Summary, net income closed to Retained Earnings was $1,800 too high. The totals still agree because the error sits on both sides: the unclosed expense on the debit side and the excess Retained Earnings on the credit side. Fix it with a closing entry: debit Retained Earnings 1,800, credit Advertising Expense 1,800.',
  },
  {
    id: 'f01-cl-i6', type: 'num', kind: 'numerical',
    prompt: 'Suppose a company’s adjusted trial balance totals $96,400 on each side. It includes revenue of $31,000, expenses of $27,500 and dividends of $1,200. What will its post-closing trial balance total?',
    answer: 67700, check: () => 96400 - 27500 - 1200, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 65400, say: 'You removed revenue from the credit side but forgot that Retained Earnings gains the net income less dividends, 31,000 − 27,500 − 1,200 = 2,300, on the same side. Working from the debit side is quicker: only the expenses and dividends leave it.' },
      { value: 68900, say: 'You removed the expenses but not the dividends. Dividends is a temporary account too.' },
      { value: 64200, say: 'You subtracted revenue and dividends. Revenue is a credit balance, so it doesn’t come off the debit total; the debit side loses expenses and dividends.' },
    ],
    solution: 'The debit side loses every temporary debit balance: 96,400 − 27,500 − 1,200 = $67,700. Check the credit side: 96,400 − 31,000 of revenue + 2,300 added to Retained Earnings (31,000 − 27,500 − 1,200) = $67,700.',
  },
];

export const check = [
  {
    id: 'f01-cl-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why are revenue and expense accounts closed at the end of each period?',
    options: [
      'So that the next period’s income statement measures only that period, and Retained Earnings includes the result of the period just ended.',
      'Because the closing entries calculate the period’s net income.',
      'So that the cash earned can be paid out as dividends.',
      'Because revenue and expenses are liabilities that must be settled at the end of the year.',
    ],
    answer: 0,
    feedback: {
      1: 'Net income is measured on the income statement before closing. Closing records it in Retained Earnings; it doesn’t calculate it.',
      2: 'Closing moves no cash, and dividends are a separate decision by the board.',
      3: 'Revenue and expenses are changes in equity, not liabilities. Nothing is settled when they are closed.',
    },
    solution: 'Temporary accounts measure one period. Closing resets them to zero so each period is measured on its own, and moves the period’s net income and dividends into Retained Earnings so the ledger agrees with the balance sheet.',
  },
  {
    id: 'f01-cl-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s Retained Earnings account had a credit balance of $212,000 at the start of 2026. For 2026, revenue was $1,460,000, expenses $1,322,500 and dividends $60,000. What is the balance of Retained Earnings after closing?',
    answer: 289500, check: () => 212000 + (1460000 - 1322500) - 60000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 349500, say: 'You have closed net income but not the dividends, which also go to Retained Earnings.' },
      { value: 77500, say: 'That is net income less dividends, the change in Retained Earnings. Add it to the opening balance of $212,000.' },
      { value: 152000, say: 'You left out the year’s net income of $137,500, which entry 3 moves into Retained Earnings.' },
    ],
    solution: 'Net income = 1,460,000 − 1,322,500 = 137,500. Retained Earnings after closing = 212,000 + 137,500 − 60,000 = $289,500.',
  },
  {
    id: 'f01-cl-k3', type: 'journal', kind: 'applied', chart: 'f01', date: '2026-03-31',
    prompt: 'A fictional airline-catering company closes directly to Retained Earnings, without using Income Summary. At its year end, 31 March 2026, it has Catering Revenue of $640,000 and four expense accounts: Supplies Expense $251,000, Wages Expense $298,000, Fuel Expense $36,500 and Depreciation Expense $41,000. Record the single entry that closes the revenue and expense accounts.',
    accounts: ['Catering Revenue', 'Supplies Expense', 'Wages Expense', 'Fuel Expense', 'Depreciation Expense', 'Retained Earnings', 'Income Summary', 'Dividends', 'Cash'],
    lines: [{ acct: 'Catering Revenue', dr: 640000 }, { acct: 'Supplies Expense', cr: 251000 }, { acct: 'Wages Expense', cr: 298000 }, { acct: 'Fuel Expense', cr: 36500 }, { acct: 'Depreciation Expense', cr: 41000 }, { acct: 'Retained Earnings', cr: 13500 }],
    solution: 'Debit Catering Revenue for its credit balance, 640,000; credit each expense for its debit balance (total 251,000 + 298,000 + 36,500 + 41,000 = 626,500); and credit Retained Earnings for the difference, net income of 640,000 − 626,500 = $13,500. Income Summary isn’t used, and Dividends would be closed in a separate entry.',
  },
  {
    id: 'f01-cl-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about Income Summary are true? Select all that apply.',
    options: [
      'Its balance is zero before closing begins and after closing ends.',
      'After revenue and expenses are closed into it, its balance equals net income or net loss.',
      'It appears in the equity section of the balance sheet.',
      'Dividends are closed to it along with the expenses.',
      'A business can close directly to Retained Earnings without using it.',
      'A debit balance after revenue and expenses are closed means the period made a net income.',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'Income Summary never appears on a financial statement; it exists only during closing.',
      3: 'Dividends are not part of net income, so they are closed directly to Retained Earnings.',
      5: 'A debit balance means expenses exceeded revenue: a net loss.',
    },
    solution: 'Income Summary is a temporary clearing account: zero before and after closing, never on a statement. Once revenue (credit) and expenses (debit) are in it, its balance is net income (credit) or net loss (debit). It is optional: closing directly to Retained Earnings gives the same balances.',
  },
  {
    id: 'f01-cl-k5', type: 'mc', kind: 'applied',
    prompt: 'Suppose Lantern’s accountant leaves Interest Expense ($50) out of the second closing entry but posts the other closing entries correctly, using the balance of Income Summary for entry 3. Which statement describes the result?',
    options: [
      'Retained Earnings is $740 instead of $690, Interest Expense still shows $50, and the post-closing trial balance balances at $42,750.',
      'The post-closing trial balance doesn’t balance, which reveals the error.',
      'Retained Earnings is $640 instead of $690.',
      'Net income on March’s income statement becomes $1,040.',
    ],
    answer: 0,
    feedback: {
      1: 'The $50 sits on both sides: Interest Expense on the debit side and $50 too much Retained Earnings on the credit side. The totals agree at $42,750.',
      2: 'Leaving an expense out makes Income Summary larger, not smaller: 7,100 − 6,060 = 1,040, so Retained Earnings is too high.',
      3: 'The income statement was prepared from the adjusted trial balance before closing and still shows $990. Only the amount closed to Retained Earnings is wrong.',
    },
    solution: 'Entry 2 debits Income Summary only 6,060, so its balance is 7,100 − 6,060 = 1,040; after dividends Retained Earnings is 1,040 − 300 = $740. Both columns of the post-closing trial balance rise by $50, to $42,750. The error is visible only because a temporary account, Interest Expense, appears on the list. Fix it by debiting Retained Earnings 50 and crediting Interest Expense 50.',
  },
  {
    id: 'f01-cl-k6', type: 'classify', kind: 'conceptual',
    prompt: 'Which closing entry, if any, brings each account to zero? Assume the period made a net income.',
    items: ['Training Revenue', 'Dividends', 'Insurance Expense', 'Income Summary', 'Interest Revenue', 'Unearned Revenue'],
    categories: ['Entry 1: close revenue', 'Entry 2: close expenses', 'Entry 3: close Income Summary', 'Entry 4: close Dividends', 'Not closed'],
    answer: [0, 3, 1, 2, 0, 4],
    feedback: {
      1: 'Dividends have their own entry, straight to Retained Earnings.',
      3: 'Income Summary is closed in entry 3, after revenue and expenses have been moved into it.',
      5: 'Unearned Revenue is a liability. It is never closed.',
    },
    solution: 'Training Revenue and Interest Revenue: entry 1. Insurance Expense: entry 2. Income Summary: entry 3. Dividends: entry 4. Unearned Revenue is a liability and stays open.',
  },
];
