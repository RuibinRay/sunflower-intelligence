// debits-and-credits.ex.js — F01 · Debits, credits and normal balances: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

export const widgets = {
  'dc-watch': {
    type: 'ledger',
    mode: 'watch',
    show: ['taccounts'],
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
  },
  'dc-sides': {
    type: 'journal',
    ask: ['accounts', 'direction', 'side'],
    transactions: ['m7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'],
  },
  'dc-balance': {
    type: 'ledger',
    mode: 'balance',
    show: ['taccounts'],
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'],
  },
};

const DRCR = ['Debit', 'Credit'];

export const guided = [
  {
    id: 'f01-dc-g1', type: 'classify', kind: 'conceptual',
    prompt: 'For each of Lantern’s accounts, choose the side that records an <b>increase</b>.',
    items: ['Cash', 'Accounts Payable', 'Common Stock', 'Catering Revenue', 'Rent Expense', 'Dividends', 'Unearned Revenue', 'Prepaid Insurance'],
    categories: DRCR,
    answer: [0, 1, 1, 1, 0, 0, 1, 0],
    hints: [
      'Start from the equation. Accounts on the left of Assets = Liabilities + Equity increase on the left (debit); accounts on the right increase on the right (credit).',
      'Revenue makes equity bigger, so it increases the way equity does. Expenses and dividends make equity smaller, so they increase on the side where equity decreases.',
    ],
    feedback: {
      0: 'Cash is an asset. Assets sit on the left of the equation and increase with a debit.',
      3: 'Revenue increases equity, and equity increases with a credit.',
      4: 'Rent Expense lowers equity, and equity decreases on the debit side, so the expense account grows with a debit.',
      5: 'Dividends reduce equity, so the Dividends account grows with a debit, even though dividends are not an expense.',
      6: 'Despite its name, Unearned Revenue is a liability: Lantern owes the service or a refund. Liabilities increase with a credit.',
      7: 'Prepaid Insurance is an asset, the right to insurance cover for the months ahead. Assets increase with a debit.',
    },
    solution: 'Debit to increase: Cash and Prepaid Insurance (assets), Rent Expense (an expense) and Dividends. Credit to increase: Accounts Payable and Unearned Revenue (liabilities), Common Stock (equity) and Catering Revenue (revenue).',
  },
  {
    id: 'f01-dc-g2', type: 'steps', kind: 'numerical',
    prompt: 'These are all of Lantern’s cash movements from 1 to 15 March. Work out the balance of the Cash account on 15 March.',
    data: { table: {
      head: ['Date', 'What happened', 'Amount ($)'],
      rows: [
        ['1 Mar', 'Ana invests in exchange for common stock', '20,000'],
        ['1 Mar', 'Loan received from Coastline Bank', '10,000'],
        ['3 Mar', 'Cash part of the equipment purchase', '4,000'],
        ['4 Mar', 'Insurance policy paid', '1,800'],
        ['8 Mar', 'Harbor Tech’s deposit received', '2,400'],
        ['10 Mar', 'Advertising paid', '350'],
        ['15 Mar', 'Workshop fees collected', '1,500'],
      ],
    } },
    solution: 'Cash is an asset: money in is a debit, money out a credit. Debits: 20,000 + 10,000 + 2,400 + 1,500 = 33,900. Credits: 4,000 + 1,800 + 350 = 6,150. Balance: 33,900 − 6,150 = $27,750, a debit balance, which is normal for an asset.',
    steps: [
      { id: 'f01-dc-g2-s1', type: 'num', prompt: 'What is the total of the debits to Cash?',
        answer: 33900, check: () => 20000 + 10000 + 2400 + 1500, unit: '$', places: 0, tol: 0.5,
        hints: ['Cash is an asset, so every amount of cash coming in is a debit, whoever it comes from.', 'Four amounts came in: the investment, the loan, the deposit and the workshop fees.'],
        wrong: [
          { value: 23900, say: 'You left out the bank loan. The loan is a liability, but the cash it brought in is an asset increase: a debit to Cash. (The credit goes to Notes Payable.)' },
          { value: 31500, say: 'You left out the deposit. It isn’t revenue yet, but the cash arrived, so Cash is debited. (The credit goes to Unearned Revenue.)' },
        ] },
      { id: 'f01-dc-g2-s2', type: 'num', prompt: 'What is the total of the credits to Cash?',
        answer: 6150, check: () => 4000 + 1800 + 350, unit: '$', places: 0, tol: 0.5,
        hints: ['Credits to an asset are decreases: money going out.', 'Three amounts went out: the equipment, the insurance and the advertising.'],
        wrong: [{ value: 14150, say: 'You included the whole $12,000 cost of the equipment. Only the $4,000 paid in cash left the Cash account; the other $8,000 is owed to the supplier.' }] },
      { id: 'f01-dc-g2-s3', type: 'num', prompt: 'What is the balance of Cash on 15 March?',
        answer: 27750, check: () => (20000 + 10000 + 2400 + 1500) - (4000 + 1800 + 350), unit: '$', places: 0, tol: 0.5,
        hints: ['Subtract the smaller total from the larger.', '33,900 − 6,150.'],
        wrong: [{ value: 40050, say: 'You added the two sides. A balance is the difference between them.' }] },
      { id: 'f01-dc-g2-s4', type: 'mc', prompt: 'On which side is the balance, and is that normal?',
        options: ['Debit, which is the normal side for an asset', 'Credit, because more cash has been spent than received', 'Debit, which is abnormal for an asset', 'Whichever side has more entries'],
        answer: 0,
        hints: ['The balance sits on the side with the larger total.', 'Assets increase with debits, so their normal balance is a debit.'],
        feedback: {
          1: 'The debits ($33,900) are far larger than the credits ($6,150), so more came in than went out and the balance is a debit.',
          2: 'Assets increase on the debit side, so a debit balance is exactly what Cash should have.',
          3: 'The balance follows the larger total, not the number of entries. Here the debit side has four entries and the credit side three, but that is not why the balance is a debit.',
        } },
    ],
  },
  {
    id: 'f01-dc-g3', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the reasoning behind the debit and credit rules.',
    text: 'Assets sit on the [[0]] side of the accounting equation, so an increase in an asset is recorded as a [[1]]. Liabilities and equity sit on the [[2]] side, so they increase with a [[3]]. Revenue increases equity, so a revenue account increases with a [[4]]. An expense reduces equity, so an increase in an expense account is recorded as a [[5]].',
    blanks: [
      { options: ['left', 'right'], answer: 0 },
      { options: ['debit', 'credit'], answer: 0 },
      { options: ['left', 'right'], answer: 1 },
      { options: ['debit', 'credit'], answer: 1 },
      { options: ['debit', 'credit'], answer: 1 },
      { options: ['debit', 'credit'], answer: 0 },
    ],
    hints: [
      'Write the equation down: Assets = Liabilities + Equity. Debit is the left side of an account and credit the right.',
      'For revenue and expenses, ask one question only: does this make equity bigger or smaller? Equity gets bigger with a credit and smaller with a debit.',
    ],
    solution: 'Assets are on the left, so they increase with a debit. Liabilities and equity are on the right, so they increase with a credit. Revenue increases equity, so it is credited; an expense decreases equity, so the expense account is debited.',
  },
  {
    id: 'f01-dc-g4', type: 'steps', kind: 'applied',
    prompt: 'Suppose Lantern starts April with $600 of supplies on hand (the amount counted on 31 March). During April it buys $2,100 more on account, and on 30 April a count finds $750 still on hand. Use the Supplies T-account to find how much was used in April.',
    solution: 'Supplies is an asset: the $600 opening balance and the $2,100 of purchases are debits, and supplies used are credits. Opening + debits − used = closing, so 600 + 2,100 − used = 750, and used = 600 + 2,100 − 750 = $1,950.',
    steps: [
      { id: 'f01-dc-g4-s1', type: 'mc', prompt: 'On which side of the Supplies account do the opening balance and the April purchases go?',
        options: ['Both on the debit side', 'Both on the credit side', 'The opening balance on the debit side and the purchases on the credit side, because they were bought on account'],
        answer: 0,
        hints: ['Supplies is an asset. What side does an asset normally have its balance on, and what side records increases?'],
        feedback: {
          1: 'Credits decrease an asset. Both the balance Lantern starts with and the supplies it buys add to what it has.',
          2: 'Buying on account affects the other half of the entry: the credit goes to Accounts Payable. Supplies itself still increases, so it is debited.',
        } },
      { id: 'f01-dc-g4-s2', type: 'num', prompt: 'How much of the supplies was used in April?',
        answer: 1950, check: () => 600 + 2100 - 750, unit: '$', places: 0, tol: 0.5,
        hints: ['Supplies used leave the account, so they are credits. Opening balance + debits − credits = closing balance.', '600 + 2,100 − used = 750.'],
        wrong: [
          { value: 1350, say: 'You left out the $600 on hand at the start of April. It was available to use too: start from what was there.' },
          { value: 3450, say: 'You added the closing balance. The $750 is what is left, so it comes out of what was available.' },
        ] },
    ],
  },
];

export const independent = [
  {
    id: 'f01-dc-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Give the normal balance of each account.',
    items: ['Accumulated Depreciation—Equipment', 'Dividends', 'Unearned Revenue', 'Interest Receivable', 'Retained Earnings', 'Utilities Expense', 'Notes Receivable', 'Interest Revenue'],
    categories: ['Normal debit balance', 'Normal credit balance'],
    answer: [1, 0, 1, 0, 1, 0, 0, 1],
    feedback: {
      0: 'Accumulated Depreciation is a contra-asset: it reduces Equipment, so it takes the opposite normal balance, a credit.',
      1: 'Dividends reduce equity, so the account grows with debits and has a normal debit balance.',
      2: 'Unearned Revenue is a liability, money received for work not yet done, so its normal balance is a credit.',
      3: 'Interest Receivable is interest owed to the business: an asset, with a normal debit balance.',
      6: 'A note receivable is a written promise that someone will pay the business: an asset, so a debit balance.',
      7: 'Interest Revenue is revenue, which increases equity, so its normal balance is a credit.',
    },
    solution: 'Debit: Dividends, Interest Receivable, Utilities Expense and Notes Receivable (assets, expenses and dividends). Credit: Accumulated Depreciation—Equipment (a contra-asset), Unearned Revenue (a liability), Retained Earnings (equity) and Interest Revenue (revenue).',
  },
  {
    id: 'f01-dc-i2', type: 'num', kind: 'numerical',
    prompt: 'Harborview Hotel, a fictional 80-room hotel, records guests’ deposits in an Unearned Revenue account. In June the account began with a credit balance of $14,200. During June the hotel received $9,800 of new deposits; guests stayed nights worth $11,650 that they had paid for in advance; and the hotel refunded $400 of deposits for cancelled bookings. What is the balance at 30 June?',
    answer: 11950, check: () => (14200 + 9800) - (11650 + 400), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 12750, say: 'You added the refund. Refunding a deposit means the hotel owes that guest nothing more, so the liability falls: a debit.' },
      { value: 12350, say: 'You left out the refund. It reduces what the hotel owes, so subtract it too.' },
      { value: 36050, say: 'You added every amount. Unearned Revenue is a liability: new deposits are credits (increases), but stays delivered and refunds are debits (decreases).' },
    ],
    solution: 'Unearned Revenue is a liability: increases are credits and decreases are debits. Credits: opening 14,200 + new deposits 9,800 = 24,000. Debits: stays delivered 11,650 + refunds 400 = 12,050. Balance: 24,000 − 12,050 = $11,950, a credit balance.',
  },
  {
    id: 'f01-dc-i3', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s bank statement for March shows “Credit 3,000: Meridian Partners” on 25 March. How should Lantern record this in its own books?',
    options: [
      'Debit Cash $3,000 and credit Accounts Receivable $3,000',
      'Credit Cash $3,000, because the bank credited the account',
      'Debit Cash $3,000 and credit Catering Revenue $3,000',
      'Debit Accounts Receivable $3,000 and credit Cash $3,000',
    ],
    answer: 0,
    feedback: {
      1: 'The bank writes from its side: Lantern’s deposit is the bank’s liability, so the bank credits it. In Lantern’s books, cash coming in is a debit to Cash.',
      2: 'The revenue was recorded on 12 March, when Lantern catered the conference and sent the invoice. Collecting the cash reduces what Meridian owes; recording revenue again would count it twice.',
      3: 'Those are the right accounts on the wrong sides. Cash is going up (debit) and the amount Meridian owes is going down (credit).',
    },
    solution: 'Cash, an asset, increases by $3,000: debit Cash. Meridian now owes $3,000 less, so Accounts Receivable, another asset, decreases: credit Accounts Receivable. The bank’s “credit” describes its own books, where Lantern’s deposit is a liability that has grown.',
  },
  {
    id: 'f01-dc-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A classmate says: “Debits are bad news: they’re expenses and losses.” Which of Lantern’s March entries shows most clearly that this is wrong?',
    options: [
      'The $20,000 debit to Cash when Ana invested in the company',
      'The $1,200 debit to Rent Expense for the March kitchen rent',
      'The $300 debit to Dividends when the board paid a dividend',
      'The $260 credit to Accounts Payable for the utilities bill',
    ],
    answer: 0,
    feedback: {
      1: 'This one fits the classmate’s idea: an expense is debited. It can’t show the idea is wrong.',
      2: 'A dividend does reduce equity, so this debit seems to support the classmate. Look for a debit that is clearly good news.',
      3: 'That is a credit, and it records a new debt. It says nothing about whether debits are bad.',
    },
    solution: 'The $20,000 debit to Cash records money arriving in the business, which is plainly good news. Debit only means the left side of an account; it increases assets as well as expenses and dividends.',
  },
  {
    id: 'f01-dc-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional online retailer’s Accounts Payable began the quarter with a credit balance of $6,400 and ended it with a credit balance of $7,150. During the quarter it paid its suppliers $18,150. How much did it buy on credit during the quarter?',
    answer: 18900, check: () => 7150 + 18150 - 6400, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 17400, say: 'You subtracted the increase in the balance. If the balance went up while $18,150 was paid, purchases must have been larger than the payments, not smaller.' },
      { value: 31700, say: 'You added all three amounts. Set up the account: beginning 6,400 + purchases − payments 18,150 = ending 7,150.' },
    ],
    solution: 'Accounts Payable is a liability: purchases on credit are credits and payments are debits. Beginning + credits − debits = ending, so 6,400 + purchases − 18,150 = 7,150, and purchases = 7,150 + 18,150 − 6,400 = $18,900.',
  },
  {
    id: 'f01-dc-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these accounts have a normal credit balance? Select all that apply.',
    options: ['Accounts Payable', 'Accumulated Depreciation—Van', 'Dividends', 'Training Revenue', 'Prepaid Rent', 'Common Stock'],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'Dividends reduce equity, so they increase with a debit and have a normal debit balance.',
      4: 'Prepaid Rent is an asset, rent paid in advance for future months, so its normal balance is a debit.',
    },
    solution: 'Credit: Accounts Payable (a liability), Accumulated Depreciation—Van (a contra-asset), Training Revenue (revenue) and Common Stock (equity). Debit: Dividends and Prepaid Rent.',
  },
];

export const check = [
  {
    id: 'f01-dc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does an expense account increase with a debit?',
    options: [
      'Expenses reduce equity, and equity decreases on the debit side, so an increase in an expense is recorded as a debit.',
      'Debits record money leaving the business, and expenses are paid out of cash.',
      'Expenses are assets until they are paid, and assets increase with debits.',
      'Expenses are bad news for the business, and debits record bad news.',
    ],
    answer: 0,
    feedback: {
      1: 'Money leaving the business is a credit to Cash. And expenses are debited whether or not cash is paid: the utilities bill was debited to Utilities Expense while still unpaid.',
      2: 'An expense is a cost already used up, not a resource still held. Paying for it later doesn’t make it an asset in the meantime: the unpaid amount is a liability.',
      3: 'Debit only means left. Assets also increase with debits, and a $20,000 debit to Cash is good news.',
    },
    solution: 'Expenses sit inside equity and reduce it. Equity decreases with a debit, so the expense account, which measures that reduction, grows with debits.',
  },
  {
    id: 'f01-dc-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s Accounts Receivable starts April with a debit balance of $1,800. In April Lantern invoices clients $6,300 for catering and collects $5,450 from them. What is the balance on 30 April?',
    answer: 2650, check: () => 1800 + 6300 - 5450, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 950, say: 'You treated the invoices as decreases and the collections as increases. Invoicing a client increases what it owes (a debit); collecting reduces it (a credit).' },
      { value: 13550, say: 'You added every amount. Collections reduce what clients owe, so subtract them.' },
      { value: 850, say: 'You left out the opening balance of $1,800. Start from what was owed at the beginning of April.' },
    ],
    solution: 'Accounts Receivable is an asset: the opening balance and new invoices are debits, collections are credits. Balance = 1,800 + 6,300 − 5,450 = $2,650, a debit balance.',
  },
  {
    id: 'f01-dc-k3', type: 'classify', kind: 'applied',
    prompt: 'For each event, is the account named debited or credited?',
    items: [
      'Cash, when a client pays a deposit for a future event',
      'Unearned Revenue, when the prepaid event is catered',
      'Accounts Payable, when Lantern pays a supplier',
      'Accumulated Depreciation—Equipment, when a month’s depreciation is recorded',
      'Common Stock, when shares are issued for cash',
      'Supplies, when supplies are used up',
    ],
    categories: DRCR,
    answer: [0, 0, 0, 1, 1, 1],
    feedback: {
      1: 'Once the event is catered, Lantern no longer owes it, so the liability decreases: a debit.',
      2: 'Paying a supplier reduces a liability, and liabilities decrease with a debit.',
      3: 'Accumulated Depreciation is a contra-asset: it grows with credits.',
      5: 'Using supplies reduces an asset, so Supplies is credited.',
    },
    solution: 'Debit: Cash (asset up), Unearned Revenue (liability down) and Accounts Payable (liability down). Credit: Accumulated Depreciation (contra-asset up), Common Stock (equity up) and Supplies (asset down).',
  },
  {
    id: 'f01-dc-k4', type: 'mc', kind: 'applied',
    prompt: 'Your bank statement shows a debit of $45 for a card payment at a café. From the bank’s point of view, what has happened?',
    options: [
      'It owes you $45 less, so it has debited the liability it keeps for you.',
      'It has earned $45 of revenue from you.',
      'Your deposit, an asset of the bank, has fallen, so the bank has recorded a credit.',
      'It has recorded a $45 expense.',
    ],
    answer: 0,
    feedback: {
      1: 'The $45 went to the café, not to the bank. The bank now owes you less.',
      2: 'Your deposit is the bank’s liability, not its asset: it is money the bank owes you. Liabilities decrease with debits.',
      3: 'The café payment is your spending, not the bank’s. In your own books it is an expense and a credit to Cash.',
    },
    solution: 'To the bank, money in your account is a liability: it owes it to you. Paying the café reduces that liability, and liabilities decrease with a debit, so the bank debits your account. In your books the same payment is a credit to Cash.',
  },
  {
    id: 'f01-dc-k5', type: 'mc', kind: 'applied',
    prompt: 'At the end of a month a company’s Cash account shows a credit balance of $1,250. What does this most likely mean?',
    options: [
      'The bank account is overdrawn: the company owes its bank $1,250.',
      'The company received $1,250 more than it paid out.',
      'The company has $1,250 of spare cash to invest.',
      'Nothing: Cash can have a balance on either side.',
    ],
    answer: 0,
    feedback: {
      1: 'Receipts are debits to Cash. If receipts had been larger, the balance would be a debit.',
      2: 'A credit balance in an asset account means less than nothing is left, not a surplus.',
      3: 'Cash has a normal debit balance. A credit balance is abnormal: an error to find, or a real overdraft, which is a liability.',
    },
    solution: 'More has been credited (paid out) than debited (received), so the account is below zero. If the records are right, the business is overdrawn and owes its bank $1,250, a liability; if not, an entry has gone to the wrong side.',
  },
  {
    id: 'f01-dc-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these statements are true? Select all that apply.',
    options: [
      'Every entry’s total debits equal its total credits.',
      'Every entry has as many debit lines as credit lines.',
      'A debit can increase or decrease an account, depending on the kind of account.',
      'A credit to Cash means cash came in.',
      'A contra account has the opposite normal balance to the account it reduces.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Only the totals must match. The 3 March equipment purchase had one debit and two credits.',
      3: 'Cash is an asset, so cash coming in is a debit. A credit to Cash is money going out.',
    },
    solution: 'True: debits equal credits in every entry; a debit increases assets, expenses and dividends but decreases liabilities, equity and revenue; contra accounts take the opposite normal balance. False: entries need equal totals, not equal numbers of lines, and a credit to Cash is money going out.',
  },
];
