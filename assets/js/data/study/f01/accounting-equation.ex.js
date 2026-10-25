// accounting-equation.ex.js — F01 · The accounting equation: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

export const widgets = {
  'eq-march': {
    type: 'equation',
    mode: 'watch',
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'],
  },
  'eq-predict': {
    type: 'equation',
    mode: 'predict',
    transactions: ['m5', 'm6', 'm8', 'm9', 'm10', 'm12', 'm14', 'm15'],
  },
};

const PATTERNS = ['Assets up, liabilities up', 'Assets up, equity up', 'One asset up, another down', 'Assets down, liabilities down', 'Assets down, equity down', 'Liabilities up, equity down'];

export const guided = [
  {
    id: 'f01-eq-g1', type: 'steps', kind: 'applied',
    prompt: 'On 2 April Lantern buys a $3,000 coffee grinder on credit: the supplier will be paid in 30 days. Work through the transaction.',
    solution: 'Equipment (an asset) rises by $3,000 and Accounts Payable (a liability) rises by $3,000. Assets +3,000 = liabilities +3,000 + equity 0. Equity doesn’t change: Lantern has swapped a promise to pay for a grinder, and is neither richer nor poorer.',
    steps: [
      { id: 'f01-eq-g1-s1', type: 'multi',
        prompt: 'Which accounts change? Select all that apply.',
        options: ['Equipment', 'Cash', 'Accounts Payable', 'Common Stock', 'Supplies'],
        answer: [0, 2],
        hints: ['Two things happen: Lantern gets something, and Lantern owes something.', 'A grinder is a long-lived item used in the business. “On credit” means no cash moves yet.'],
        feedback: { 1: 'No cash changes hands on 2 April; that happens when Lantern pays the supplier.', 3: 'Common Stock changes only when owners invest. A supplier is a creditor, not an owner.', 4: 'Supplies are used up within weeks (beans, cups). A grinder lasts for years, so it is equipment.' } },
      { id: 'f01-eq-g1-s2', type: 'equation',
        prompt: 'Enter the change in each side of the equation (use a minus sign for a decrease, 0 for no change).',
        answer: { assets: 3000, liabilities: 3000, equity: 0 },
        hints: ['Equipment is an asset; Accounts Payable is a liability.', 'Both rise by the price of the grinder.'] },
      { id: 'f01-eq-g1-s3', type: 'mc',
        prompt: 'Why doesn’t Lantern’s equity change?',
        options: ['The grinder adds an asset and an equal liability, so the owners’ residual claim is unchanged.', 'Equity only changes at the end of the year, when the books are closed.', 'Equity falls because Lantern now has a debt.', 'Equity rises because Lantern now owns more equipment, which makes the business worth more to its owners.'],
        answer: 0,
        hints: ['Equity = assets − liabilities. Work out what happens to each.'],
        feedback: { 1: 'Equity changes whenever owners invest, revenue is earned, expenses are incurred or dividends are paid, at any time of year.', 2: 'The debt is matched by a new asset of the same amount, so assets minus liabilities is unchanged.', 3: 'Assets rise, but so do liabilities by the same amount. Owning more doesn’t mean being worth more if you also owe more.' } },
    ],
  },
  {
    id: 'f01-eq-g2', type: 'steps', kind: 'applied',
    prompt: 'Lantern caters a lunch for a law firm for $900, and the firm pays in cash on the day.',
    solution: 'Cash (an asset) rises by $900 and Catering Revenue rises by $900. Revenue increases equity, so assets +900 = liabilities 0 + equity +900.',
    steps: [
      { id: 'f01-eq-g2-s1', type: 'classify',
        prompt: 'For each account, say how it changes.',
        items: ['Cash', 'Catering Revenue'],
        categories: ['Asset increases', 'Asset decreases', 'Liability increases', 'Liability decreases', 'Equity increases (revenue)', 'Equity decreases (expense)'],
        answer: [0, 4],
        hints: ['One account is a resource Lantern now has more of.', 'Revenue is earned by delivering the service, and revenue belongs inside equity.'],
        feedback: { 1: 'Catering Revenue is not a liability: the lunch has been delivered, so Lantern owes the firm nothing.' } },
      { id: 'f01-eq-g2-s2', type: 'equation',
        prompt: 'Enter the change in each side of the equation.',
        answer: { assets: 900, liabilities: 0, equity: 900 },
        hints: ['Revenue increases equity by the amount earned.'] },
    ],
  },
  {
    id: 'f01-eq-g3', type: 'num', kind: 'numerical',
    prompt: 'A small hotel has assets of $75,000 and equity of $46,000. What are its liabilities?',
    answer: 29000, check: () => 75000 - 46000, unit: '$', places: 0, tol: 0.5,
    hints: ['Start from Assets = Liabilities + Equity.', 'Rearrange: Liabilities = Assets − Equity.'],
    wrong: [{ value: 121000, say: 'You added assets and equity. Liabilities are what remains of the assets after the owners’ claim: subtract.' }],
    solution: 'Liabilities = assets − equity = 75,000 − 46,000 = $29,000.',
  },
  {
    id: 'f01-eq-g4', type: 'steps', kind: 'numerical',
    prompt: 'Suppose that at the start of a month Lantern has common stock of $20,000 and retained earnings of $690. During the month it earns $9,400 of revenue, incurs $7,900 of expenses and pays $500 of dividends.',
    solution: 'Net income = 9,400 − 7,900 = $1,500. Ending retained earnings = 690 + 1,500 − 500 = $1,690. Total equity = 20,000 + 1,690 = $21,690.',
    steps: [
      { id: 'f01-eq-g4-s1', type: 'num', prompt: 'What is net income for the month?',
        answer: 1500, check: () => 9400 - 7900, unit: '$', places: 0, tol: 0.5,
        hints: ['Net income = revenue − expenses.', 'Dividends are not an expense: leave them out.'],
        wrong: [{ value: 1000, say: 'You subtracted the dividends. They are a distribution of profit, not a cost of earning it, so they don’t reduce net income.' }] },
      { id: 'f01-eq-g4-s2', type: 'num', prompt: 'What are retained earnings at the end of the month?',
        answer: 1690, check: () => 690 + 1500 - 500, unit: '$', places: 0, tol: 0.5,
        hints: ['Ending retained earnings = beginning + net income − dividends.'],
        wrong: [{ value: 2190, say: 'Dividends paid out of profit reduce retained earnings. Subtract them.' }, { value: 1500, say: 'Retained earnings accumulate: start from the $690 already there.' }] },
      { id: 'f01-eq-g4-s3', type: 'num', prompt: 'What is total equity at the end of the month?',
        answer: 21690, check: () => 20000 + 1690, unit: '$', places: 0, tol: 0.5,
        hints: ['Equity = common stock + retained earnings.'] },
    ],
  },
];

export const independent = [
  {
    id: 'f01-eq-i1', type: 'classify', kind: 'conceptual',
    prompt: 'Match each transaction to its pattern.',
    items: ['Pays a supplier $500 it owes', 'Issues stock for $10,000 cash', 'Buys a van for cash', 'Receives the electricity bill, to pay next month', 'Pays a $200 dividend', 'Borrows $5,000 from a bank'],
    categories: PATTERNS,
    answer: [3, 1, 2, 5, 4, 0],
    feedback: {
      2: 'Cash goes down and the van goes up by the same amount: one asset becomes another.',
      3: 'Nothing is paid yet, so assets don’t change. The business owes more (a liability) and has used the electricity (an expense, which lowers equity).',
      4: 'A dividend sends cash to the owners and lowers equity. It is not an expense, but it still reduces equity.',
    },
    solution: 'Paying a supplier: assets down, liabilities down. Issuing stock: assets up, equity up. Van for cash: one asset up, another down. Electricity bill: liabilities up, equity down (an expense). Dividend: assets down, equity down. Bank loan: assets up, liabilities up.',
  },
  {
    id: 'f01-eq-i2', type: 'equation', kind: 'applied',
    prompt: 'Meridian Partners pays Lantern the $1,200 still owed on its conference invoice. Enter the change in each side of the equation.',
    answer: { assets: 0, liabilities: 0, equity: 0 },
    solution: 'Cash rises by $1,200 and Accounts Receivable falls by $1,200: one asset turns into another, so total assets, liabilities and equity are unchanged. The revenue was recorded when the conference was catered, not when the cash arrived.',
  },
  {
    id: 'f01-eq-i3', type: 'num', kind: 'numerical',
    prompt: 'A design studio began the year with assets of $250,000 and liabilities of $140,000. It issued no new stock and paid $15,000 of dividends. At year end its assets were $300,000 and its liabilities $160,000. What was its net income for the year?',
    answer: 45000, check: () => (300000 - 160000) - (250000 - 140000) + 15000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 30000, say: 'That is the change in equity. Dividends took $15,000 out of equity, so profit must have been $15,000 more than the change.' },
      { value: 50000, say: 'That is the change in assets. Part of the asset growth was financed by $20,000 of new liabilities, which is not profit.' },
    ],
    solution: 'Equity at the start = 250,000 − 140,000 = 110,000; at the end = 300,000 − 160,000 = 140,000. Change = 30,000 = net income − dividends of 15,000, so net income = 30,000 + 15,000 = $45,000.',
  },
  {
    id: 'f01-eq-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Which transaction increases both assets and equity?',
    options: ['Catering an event and invoicing the client', 'Receiving a deposit for an event next month', 'Borrowing money from a bank', 'Collecting cash a client owes'],
    answer: 0,
    feedback: {
      1: 'A deposit raises cash, but Lantern hasn’t done the work yet, so it owes the service: liabilities rise, not equity.',
      2: 'Borrowing raises assets and liabilities. Lenders have a claim to be repaid, so equity doesn’t change.',
      3: 'Collecting a receivable swaps one asset (the amount owed) for another (cash). Totals don’t change.',
    },
    solution: 'Catering the event earns revenue, which increases equity, and the invoice creates an account receivable, which is an asset. No cash is needed for revenue to be earned.',
  },
  {
    id: 'f01-eq-i5', type: 'equation', kind: 'applied',
    prompt: 'Lantern receives a $400 bill for advertising that ran this month. It will pay next month. Enter the change in each side of the equation.',
    answer: { assets: 0, liabilities: 400, equity: -400 },
    solution: 'The advertising has been used, so it is an expense now: equity falls by $400. Lantern owes the money, so Accounts Payable rises by $400. Assets are unchanged until the bill is paid.',
  },
  {
    id: 'f01-eq-i6', type: 'num', kind: 'numerical',
    prompt: 'After all its transactions, a company has assets of $96,500, liabilities of $58,200 and common stock of $25,000. What are its retained earnings?',
    answer: 13300, check: () => 96500 - 58200 - 25000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 38300, say: 'That is total equity. Retained earnings are the part of equity that isn’t contributed capital: subtract the common stock.' }],
    solution: 'Equity = 96,500 − 58,200 = 38,300. Retained earnings = equity − common stock = 38,300 − 25,000 = $13,300.',
  },
];

export const check = [
  {
    id: 'f01-eq-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why must the accounting equation balance after every transaction?',
    options: [
      'Equity is defined as what is left of the assets after liabilities, so the two sides describe the same resources.',
      'Accountants adjust the figures at the end of each period, moving amounts between accounts until the two sides agree.',
      'The law requires businesses to keep their assets equal to their cash plus their debts.',
      'It balances only after the books are closed at year end.',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing is forced. Each transaction is recorded with all its effects, and the equation holds because of how equity is defined.',
      2: 'No such law exists. Assets include far more than cash, and the equation is an identity, not a legal limit.',
      3: 'It holds at every moment, which is why it can be used to check each transaction as it is recorded.',
    },
    solution: 'Assets are the resources; liabilities and equity are the claims on them, with equity defined as the residual. Every dollar of resources is claimed by someone, so the totals agree by definition.',
  },
  {
    id: 'f01-eq-k2', type: 'equation', kind: 'numerical',
    prompt: 'Lantern repays $2,500 of its bank note early. Enter the change in each side of the equation.',
    answer: { assets: -2500, liabilities: -2500, equity: 0 },
    solution: 'Cash falls by $2,500 and Notes Payable falls by $2,500. Repaying the principal of a loan is not an expense (interest would be), so equity is unchanged.',
  },
  {
    id: 'f01-eq-k3', type: 'num', kind: 'numerical',
    prompt: 'A bike shop has assets of $64,000 and liabilities of $27,500. What is its equity?',
    answer: 36500, check: () => 64000 - 27500, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 91500, say: 'Equity is assets minus liabilities, not their sum.' }],
    solution: 'Equity = assets − liabilities = 64,000 − 27,500 = $36,500.',
  },
  {
    id: 'f01-eq-k4', type: 'mc', kind: 'applied',
    prompt: 'A company pays Lantern $1,000 now for a barista workshop next month. How does this affect Lantern today?',
    options: [
      'Assets rise by $1,000 and liabilities rise by $1,000.',
      'Assets rise by $1,000 and equity rises by $1,000.',
      'Nothing is recorded until the workshop takes place.',
      'Liabilities fall by $1,000 and equity rises by $1,000.',
    ],
    answer: 0,
    feedback: {
      1: 'Equity would rise only if Lantern had earned revenue, and it hasn’t delivered the workshop yet.',
      2: 'Cash has arrived, so something must be recorded now: Lantern has the cash and an obligation to provide the workshop.',
      3: 'That is what happens next month, when the workshop is delivered and the unearned revenue becomes revenue.',
    },
    solution: 'Cash rises by $1,000 and Unearned Revenue, a liability, rises by $1,000. When the workshop is delivered, the liability falls and revenue (equity) rises.',
  },
  {
    id: 'f01-eq-k5', type: 'num', kind: 'applied',
    prompt: 'A café has liabilities of $90,000 and equity of $50,000. Its bank allows total liabilities of at most 2 times equity. How much more can the café borrow, assuming the loan doesn’t change equity?',
    answer: 10000, check: () => 2 * 50000 - 90000, unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 100000, say: 'That is the bank’s limit on total liabilities. The café already owes $90,000 of it.' }, { value: 40000, say: 'Whether you got this from assets or from 90,000 − 50,000, the method is off: assets don’t enter the bank’s condition here. Compare liabilities with twice equity.' }],
    solution: 'The limit is 2 × 50,000 = $100,000 of liabilities. The café owes $90,000, so it can borrow at most 100,000 − 90,000 = $10,000. Borrowing raises assets and liabilities equally and leaves equity unchanged.',
  },
  {
    id: 'f01-eq-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these decrease equity? Select all that apply.',
    options: ['Paying wages for this month', 'Paying a dividend', 'Paying a supplier for supplies bought last month', 'Receiving a utilities bill to pay next month', 'Buying supplies for cash'],
    answer: [0, 1, 3],
    feedback: {
      2: 'Paying a supplier settles a liability: assets and liabilities fall together and equity doesn’t move.',
      4: 'Buying supplies swaps cash for another asset. They become an expense later, when they are used.',
    },
    solution: 'Wages and utilities used this month are expenses, and dividends distribute profit to owners: all three reduce equity. Paying a supplier and buying supplies only rearrange assets and liabilities.',
  },
];
