// project.js — F01 applied project: one month at Brightwater Bike Repair (fictional), the whole accounting cycle.
// The business, its chart and every entry are in brightwater.js. Every figure a question uses is recomputed from
// those entries: by `check` functions (simple sums written out here) and by `verify` (the accounting engine).
import { CHART, JULY, JULY_FACTS, JULY_ADJUSTMENTS, JULY_RESULTS as R } from './brightwater.js?v=17';
import * as A from '../../../core/accounting.js?v=17';

const TYPE = Object.fromEntries(CHART.map((a) => [a.name, a.type]));
const DEBIT_NORMAL = new Set(['asset', 'expense', 'dividends']);
/** Normal-side balance of every account after `entries` (plus `opening`), without the engine. */
function balances(entries, opening = {}) {
  const b = { ...opening };
  for (const e of entries) for (const l of e.lines) {
    const dr = DEBIT_NORMAL.has(TYPE[l.acct]) || TYPE[l.acct] === 'summary';
    b[l.acct] = (b[l.acct] || 0) + (l.dr != null ? (dr ? l.dr : -l.dr) : (dr ? -l.cr : l.cr));
  }
  return b;
}
const debitSide = (b) => Object.entries(b).filter(([k, v]) => v && (DEBIT_NORMAL.has(TYPE[k]))).reduce((s, [, v]) => s + v, 0);
const unadjusted = balances(JULY);
const adjusted = balances([...JULY, ...JULY_ADJUSTMENTS]);
const of = (b, type) => Object.entries(b).filter(([k]) => TYPE[k] === type).reduce((s, [, v]) => s + v, 0);
const revenue = of(adjusted, 'revenue'), expenses = of(adjusted, 'expense');
const netIncome = revenue - expenses;
const assets = of(adjusted, 'asset') - of(adjusted, 'contra-asset');
const liabilities = of(adjusted, 'liability');
const STATEMENTS = ['Income statement', 'Statement of changes in equity', 'Balance sheet'];
/** Closing needs Income Summary, which journal drop-downs leave out unless an item lists its accounts. */
const CLOSE_ACCOUNTS = CHART.map((a) => a.name);

export default {
  title: 'One month at Brightwater Bike Repair',
  brief: [
    { p: 'Mateo Ruiz has just opened Brightwater Bike Repair, a small corporation that repairs and services bicycles. He kept every receipt, invoice and bank record for July but has never kept books. You will run the whole accounting cycle for his first month: record and post every transaction, make the month-end adjustments, prepare the financial statements, close the books, and write him a short note on what July’s numbers say.' },
    { p: 'Brightwater is fictional, and so is every figure. It works like Lantern Coffee in the lessons: a service business on the accrual basis, with parts treated as supplies. Its chart of accounts is a little different, so read the account names carefully.' },
  ],
  deliverables: [
    'Sixteen July transactions journalised and posted, with an unadjusted trial balance that balances.',
    'Eight month-end adjusting entries and an adjusted trial balance.',
    'An income statement, a statement of changes in equity and a balance sheet for July.',
    'Four closing entries and a post-closing trial balance.',
    'A note to Mateo of about 200 words on what July shows and one thing he should do next.',
  ],
  stages: [
    {
      id: 'record', title: 'Record and post July',
      html: '<p>Work through the month in order. For each transaction, write the journal entry in the recorder; it checks the entry, posts it to the ledger and keeps the trial balance up to date. Your work is saved in this browser as you go.</p>',
      tool: { kind: 'recorder', scenario: { name: 'Brightwater Bike Repair, July 2026', chart: CHART, transactions: JULY } },
      items: [
        { id: 'f01-pj-r1', type: 'num', kind: 'numerical',
          prompt: 'When all sixteen transactions are posted, what does each column of Brightwater’s unadjusted trial balance total?',
          answer: R.unadjustedTotal, check: () => debitSide(unadjusted), unit: '$', places: 0, tol: 0.5,
          wrong: [{ value: 38205, say: 'That is the total of every debit in the journal. A trial balance lists each account’s balance: debits and credits to the same account offset first (Cash, for example, was debited $22,800 and credited $9,165), and only the balance goes in a column.' }],
          solution: 'Debit balances: Cash 13,635 + Accounts Receivable 1,190 + Supplies 1,250 + Prepaid Insurance 720 + Prepaid Rent 3,600 + Equipment 4,800 + Dividends 400 + Wages Expense 960 + Utilities Expense 185 = $26,740. Credit balances: Accounts Payable 2,750 + Unearned Revenue 1,800 + Notes Payable 5,000 + Common Stock 12,000 + Repair Revenue 5,190 = $26,740.' },
        { id: 'f01-pj-r2', type: 'mc', kind: 'conceptual',
          prompt: 'Brightwater’s trial balance balances. Which of these mistakes could still be in the books?',
          options: ['The $640 of repairs on account recorded as cash received', 'A $185 debit posted to Utilities Expense with no matching credit', 'Debits of $1,350 and credits of $1,530 for the courier invoice', 'A credit balance in the Cash account caused by a one-sided posting'],
          answer: 0,
          feedback: { 1: 'A one-sided posting leaves debits and credits unequal, so the trial balance would not balance.', 2: 'Unequal debits and credits in one entry make the totals differ: the trial balance catches it.', 3: 'A one-sided posting throws the totals out, so the trial balance would show it.' },
          solution: 'Debiting Cash instead of Accounts Receivable is an error of commission: the right side and the right amount, in the wrong account of the same type (both are assets), so the totals still agree. A trial balance proves only that debits equal credits.' },
      ],
    },
    {
      id: 'adjust', title: 'Make the month-end adjustments',
      html: `<p>On 31 July Mateo tells you what he knows:</p><ul>${JULY_FACTS.map((f) => `<li>${f}</li>`).join('')}</ul><p>Record one adjusting entry for each fact. The recorder starts from the balances you posted in stage 1.</p>`,
      tool: { kind: 'recorder', scenario: { name: 'Brightwater Bike Repair, adjustments at 31 July 2026', chart: CHART, transactions: [], adjustments: JULY_ADJUSTMENTS, opening: Object.fromEntries(Object.entries(unadjusted).filter(([, v]) => v)) } },
      items: [
        { id: 'f01-pj-a1', type: 'num', kind: 'numerical',
          prompt: 'After the eight adjustments, what does each column of the adjusted trial balance total?',
          answer: R.adjustedTotal, check: () => debitSide(adjusted), unit: '$', places: 0, tol: 0.5,
          wrong: [{ value: 28035, say: 'Accumulated Depreciation seems to have been netted against Equipment. In a trial balance it is a credit balance of its own ($80), and Equipment stays at its full $4,800 in the debit column.' }],
          solution: 'The adjustments add new accounts and change others. Debit balances now total $28,115: Cash 13,635, Accounts Receivable 1,500, Supplies 430, Prepaid Insurance 660, Prepaid Rent 2,400, Equipment 4,800, Dividends 400 and expenses of 4,290. The credits match: Accumulated Depreciation 80, liabilities 9,815, Common Stock 12,000 and Repair Revenue 6,220.' },
        { id: 'f01-pj-a2', type: 'mc', kind: 'applied',
          prompt: 'Brightwater won’t invoice the bike-rental company for the $310 of repairs until August. Why is the revenue recorded in July?',
          options: ['The work was done in July, so the revenue was earned in July', 'Revenue is always recorded in the month the invoice is sent to the customer', 'It will make July look more profitable to Harbour Credit Union, which lent Brightwater $5,000', 'Cash will be received in July'],
          answer: 0,
          feedback: { 1: 'Under accrual accounting the invoice is paperwork; the revenue is earned when the service is performed.', 2: 'Accounting doesn’t choose a month to flatter the results: revenue belongs to the period in which it is earned.', 3: 'No cash arrives until the invoice is paid in August or later.' },
          solution: 'Revenue is recognised when it is earned, by performing the service. The repairs were done on 30–31 July, so July’s income statement includes them, with an account receivable for the amount Brightwater is owed.' },
      ],
    },
    {
      id: 'statements', title: 'Prepare the financial statements',
      html: '<p>Use the adjusted trial balance to prepare July’s income statement, statement of changes in equity and balance sheet, in that order: each one feeds the next. Write them out on paper or in a spreadsheet, then answer the questions.</p>',
      items: [
        { id: 'f01-pj-s1', type: 'num', kind: 'numerical', prompt: 'What is Brightwater’s net income for July?',
          answer: R.netIncome, check: () => netIncome, unit: '$', places: 0, tol: 0.5,
          wrong: [{ value: 1530, say: 'That is after the dividend. Dividends are not an expense: they come out of retained earnings, not net income.' }, { value: 4045, say: 'That is the unadjusted figure. Use the adjusted trial balance: the adjustments add $1,030 of revenue and $3,145 of expenses.' }],
          solution: 'Revenue $6,220 (2,140 + 1,350 + 640 + 1,060 + 720 + 310) − expenses $4,290 (wages 1,920, rent 1,200, supplies 820, utilities 185, depreciation 80, insurance 60, interest 25) = $1,930.' },
        { id: 'f01-pj-s2', type: 'num', kind: 'numerical', prompt: 'Mateo wants to know how much of July’s profit stays in the business after the dividend he was paid. What closing Retained Earnings figure does your statement of changes in equity carry to the 31 July balance sheet?',
          answer: R.endingRetainedEarnings, check: () => 0 + netIncome - adjusted.Dividends, unit: '$', places: 0, tol: 0.5,
          wrong: [
            { value: netIncome, say: 'That is July’s net income before the dividend. A dividend is paid out of retained earnings, so subtract it.' },
            { value: netIncome + adjusted.Dividends, say: 'The dividend has been added. It takes profit out of the business, so subtract it instead.' },
            { value: R.totalEquity, say: 'That is total equity, which also includes Mateo’s $12,000 of common stock. Retained earnings are only the profit kept.' },
          ],
          solution: 'Brightwater is new, so retained earnings start July at $0. Closing balance = 0 + net income 1,930 − dividends 400 = $1,530: the profit kept in the business. The statement of changes in equity passes it to the balance sheet, where it sits beside the $12,000 of common stock for total equity of $13,530.' },
        { id: 'f01-pj-s3', type: 'num', kind: 'numerical', prompt: 'What are total assets on the 31 July balance sheet?',
          answer: R.totalAssets, check: () => assets, unit: '$', places: 0, tol: 0.5,
          wrong: [{ value: 23425, say: 'Accumulated depreciation is a contra-asset: subtract it from Equipment.' }],
          solution: 'Cash 13,635 + Accounts Receivable 1,500 + Supplies 430 + Prepaid Insurance 660 + Prepaid Rent 2,400 + Equipment 4,800 − Accumulated Depreciation 80 = $23,345.' },
        { id: 'f01-pj-s4', type: 'num', kind: 'numerical', prompt: 'What are total liabilities on the 31 July balance sheet?',
          answer: R.totalLiabilities, check: () => liabilities, unit: '$', places: 0, tol: 0.5,
          solution: 'Accounts Payable 2,750 + Wages Payable 960 + Interest Payable 25 + Unearned Revenue 1,080 + Notes Payable 5,000 = $9,815. Check: 9,815 + equity 13,530 = 23,345 = total assets.' },
        { id: 'f01-pj-s5', type: 'classify', kind: 'conceptual', prompt: 'Where does each account’s balance appear?',
          items: ['Unearned Revenue', 'Depreciation Expense', 'Dividends', 'Accumulated Depreciation—Equipment', 'Repair Revenue', 'Prepaid Rent'],
          categories: STATEMENTS, answer: [2, 0, 1, 2, 0, 2],
          feedback: { 0: 'Unearned revenue is a liability: Brightwater owes the club 18 tune-ups.', 2: 'Dividends reduce retained earnings; they are not an expense.', 3: 'Accumulated depreciation is shown on the balance sheet, subtracted from Equipment.' },
          solution: 'Revenue and expenses go on the income statement; dividends on the statement of changes in equity; assets, contra-assets, liabilities and equity balances on the balance sheet.' },
        { id: 'f01-pj-s6', type: 'mc', kind: 'applied',
          prompt: 'Brightwater’s cash went from $0 to $13,635 in July, but net income was only $1,930. What explains most of the difference?',
          options: ['Mateo’s $12,000 investment and the $5,000 loan brought in cash that isn’t income', 'Depreciation is a cash expense', 'Revenue was overstated by the end-of-month adjustments, which added cash that wasn’t earned', 'The trial balance doesn’t balance, so the $13,635 cash figure must be overstated by the difference'],
          answer: 0,
          feedback: { 1: 'Depreciation uses no cash at all: it spreads the equipment’s cost over its life.', 2: 'The adjustments record revenue that was earned; they don’t create cash either way.', 3: 'Both trial balances balance; the difference is about timing and financing, not errors.' },
          solution: 'Financing brought in $17,000 of cash that isn’t income, and Brightwater spent cash on things that aren’t July expenses yet (prepaid rent and insurance, equipment). Profit measures what was earned; cash shows what came in and went out.' },
      ],
    },
    {
      id: 'close', title: 'Close the books',
      html: '<p>Close July’s temporary accounts using Income Summary, in four entries: revenue, expenses, net income, then dividends. Then take a post-closing trial balance.</p>',
      items: [
        { id: 'f01-pj-c1', type: 'journal', kind: 'applied', chart: 'f01/brightwater', accounts: CLOSE_ACCOUNTS, date: '2026-07-31', prompt: 'Close the revenue account.',
          lines: [{ acct: 'Repair Revenue', dr: revenue }, { acct: 'Income Summary', cr: revenue }],
          solution: 'Debit Repair Revenue $6,220 to bring it to zero, and credit Income Summary $6,220.' },
        { id: 'f01-pj-c2', type: 'journal', kind: 'applied', chart: 'f01/brightwater', accounts: CLOSE_ACCOUNTS, date: '2026-07-31', prompt: 'Close the expense accounts in one compound entry.',
          lines: [{ acct: 'Income Summary', dr: expenses }, ...['Wages Expense', 'Rent Expense', 'Supplies Expense', 'Utilities Expense', 'Insurance Expense', 'Depreciation Expense', 'Interest Expense'].map((a) => ({ acct: a, cr: adjusted[a] }))],
          solution: 'Debit Income Summary $4,290 and credit each expense for its balance: Wages 1,920, Rent 1,200, Supplies 820, Utilities 185, Insurance 60, Depreciation 80, Interest 25.' },
        { id: 'f01-pj-c3', type: 'journal', kind: 'applied', chart: 'f01/brightwater', accounts: CLOSE_ACCOUNTS, date: '2026-07-31', prompt: 'Close Income Summary to Retained Earnings.',
          lines: [{ acct: 'Income Summary', dr: netIncome }, { acct: 'Retained Earnings', cr: netIncome }],
          solution: 'Income Summary has a credit balance of 6,220 − 4,290 = $1,930, the net income. Debit it $1,930 and credit Retained Earnings.' },
        { id: 'f01-pj-c4', type: 'journal', kind: 'applied', chart: 'f01/brightwater', accounts: CLOSE_ACCOUNTS, date: '2026-07-31', prompt: 'Close Dividends.',
          lines: [{ acct: 'Retained Earnings', dr: adjusted.Dividends }, { acct: 'Dividends', cr: adjusted.Dividends }],
          solution: 'Dividends go straight to Retained Earnings, not through Income Summary, because they are not an expense: debit Retained Earnings $400, credit Dividends $400.' },
        { id: 'f01-pj-c5', type: 'num', kind: 'numerical', prompt: 'What does each column of the post-closing trial balance total?',
          answer: R.postClosingTotal, check: () => assets + adjusted['Accumulated Depreciation—Equipment'], unit: '$', places: 0, tol: 0.5,
          wrong: [{ value: 23345, say: 'That is total assets net of accumulated depreciation. In a trial balance, Accumulated Depreciation is a credit balance of its own, so Equipment appears at its full $4,800.' }],
          solution: 'Only permanent accounts remain. Debits: Cash 13,635 + Accounts Receivable 1,500 + Supplies 430 + Prepaid Insurance 660 + Prepaid Rent 2,400 + Equipment 4,800 = $23,425. Credits: Accumulated Depreciation 80 + liabilities 9,815 + Common Stock 12,000 + Retained Earnings 1,530 = $23,425.' },
      ],
    },
    {
      id: 'advise', title: 'Tell Mateo what July shows',
      html: '<p>Mateo asks: “Did I make money in July, and why do I have so much cash if the profit was small?” Write him a note of about 200 words. Use your statements, keep the jargon out, and end with one practical recommendation.</p>',
      items: [
        { id: 'f01-pj-w1', type: 'short', kind: 'applied', prompt: 'Your note to Mateo.',
          rubric: ['States net income for July ($1,930) and says what it means in plain words.', 'Explains that most of the cash came from his investment and the loan, which are not income, and that the loan must be repaid with interest.', 'Mentions at least one timing difference: prepaid rent and insurance, the tune-ups still owed to the club, or the $1,500 customers still owe.', 'Ends with one specific, sensible recommendation (for example, chase the courier’s $550 balance, pay the $960 of wages due on 1 August, or keep cash aside for the note).', 'Is clear and correct, with no unexplained jargon.'],
          model: 'Mateo, yes: Brightwater made money in July. It earned $6,220 from repairs and used $4,290 of resources to do it, a profit of $1,930. After the $400 dividend paid to you, $1,530 of that profit stays in the business.<br><br>Brightwater’s $13,635 in the bank is mostly not profit. $12,000 is the money you invested for your shares and $5,000 is the credit union loan, which Brightwater must repay next July with $300 of interest. Some of the cash also belongs to work not done yet: the cycling club has paid for 18 more tune-ups ($1,080). And some profit hasn’t arrived as cash: customers owe Brightwater $1,500.<br><br>Next: Swift Courier still owes $550 from its July invoice, and Brightwater owes the mechanic $960 on 1 August. Ask Swift for the $550 when it falls due on 14 August, and keep the loan repayment in mind: setting aside about $482 a month from August to June (5,300 ÷ 11) means the $5,300 is there when it falls due on 1 July 2027.' },
      ],
    },
  ],
  rubric: [
    'Every July transaction is recorded in the right accounts, on the right side, for the right amount, and the unadjusted trial balance totals $26,740.',
    'Each adjustment matches a fact Mateo gave you, and the adjusted trial balance totals $28,115.',
    'The three statements agree with each other: net income $1,930 carries to retained earnings of $1,530, and the balance sheet balances at $23,345.',
    'Closing leaves every revenue, expense and dividends account at zero, and the post-closing trial balance totals $23,425.',
    'The note answers Mateo’s two questions correctly and in plain language, and the recommendation follows from the numbers.',
  ],
  /** Every figure above, recomputed with the accounting engine: [what, computed, shown]. */
  verify() {
    const ch = A.makeChart(CHART);
    const tb0 = A.trialBalance(A.post(JULY, ch), ch);
    const L = A.post([...JULY, ...JULY_ADJUSTMENTS], ch);
    const tb1 = A.trialBalance(L, ch);
    const is = A.incomeStatement(L, ch), bs = A.balanceSheet(L, ch);
    const closed = A.post([...JULY, ...JULY_ADJUSTMENTS, ...A.closingEntries(L, ch, { date: '2026-07-31' })], ch);
    const tb2 = A.trialBalance(closed, ch);
    const re = bs.equity.find(([k]) => k === 'Retained Earnings')?.[1];
    return [
      ['unadjusted trial balance', tb0.dr, R.unadjustedTotal], ['adjusted trial balance', tb1.dr, R.adjustedTotal],
      ['revenue', is.totalRevenue, R.revenue], ['expenses', is.totalExpenses, R.expenses], ['net income', is.netIncome, R.netIncome],
      ['retained earnings', re, R.endingRetainedEarnings], ['total assets', bs.assets.total, R.totalAssets],
      ['total liabilities', bs.liabilities.total, R.totalLiabilities], ['total equity', bs.equityTotal, R.totalEquity],
      ['cash', bs.assets.current.find(([k]) => k === 'Cash')[1], R.cash], ['post-closing trial balance', tb2.dr, R.postClosingTotal],
      ['receivables in the note', 1500, bs.assets.current.find(([k]) => k === 'Accounts Receivable')[1]],
      ['unearned revenue in the note', 1080, bs.liabilities.current.find(([k]) => k === 'Unearned Revenue')[1]],
      ['courier balance in the note', 1350 - 800, 550], ['interest on the note for a year', 5000 * 0.06, 300],
      ['monthly set-aside over 11 months', (5000 + 5000 * 0.06) / 11, 482, 0.5], ['loan plus interest', 5000 + 5000 * 0.06, 5300], ['adjustments add revenue', 720 + 310, 1030], ['adjustments add expenses', 1200 + 60 + 820 + 80 + 960 + 25, 3145],
      ['unadjusted net income', 2140 + 1350 + 640 + 1060 - 960 - 185, 4045],
      ['every journal debit', JULY.flatMap((e) => e.lines).reduce((s, l) => s + (l.dr || 0), 0), 38205],
      ['cash debits', JULY.flatMap((e) => e.lines).filter((l) => l.acct === 'Cash').reduce((s, l) => s + (l.dr || 0), 0), 22800],
      ['cash credits', JULY.flatMap((e) => e.lines).filter((l) => l.acct === 'Cash').reduce((s, l) => s + (l.cr || 0), 0), 9165],
      ['adjusted total with depreciation netted', R.adjustedTotal - 80, 28035], ['Swift invoice due 30 days after 15 July', 15 + 30 - 31, 14],
    ];
  },
};
