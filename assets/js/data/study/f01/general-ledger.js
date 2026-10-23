// general-ledger.js — F01 · Posting to the general ledger. Content only; exercises are in general-ledger.ex.js.
// New case detail introduced here (kept consistent across lessons 6–7): Lantern’s March journal fills two pages,
// J1 (entries of 1–12 March, m1–m8) and J2 (15–31 March, m9–m15).

const FIG_POSTING = `<svg viewBox="0 0 540 326" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="gl-post-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" style="fill:var(--ink-3)"/></marker></defs>
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="6" y="6" width="528" height="172" rx="6"/>
<line x1="20" y1="66" x2="520" y2="66"/>
<line x1="18" y1="258" x2="172" y2="258"/><line x1="95" y1="258" x2="95" y2="320"/>
<line x1="193" y1="258" x2="347" y2="258"/><line x1="270" y1="258" x2="270" y2="320"/>
<line x1="368" y1="258" x2="522" y2="258"/><line x1="445" y1="258" x2="445" y2="320"/>
</g>
<g fill="none" stroke-width="1.5" style="stroke:var(--ink-3)" marker-end="url(#gl-post-arrow)">
<line x1="95" y1="182" x2="95" y2="212"/><line x1="270" y1="182" x2="270" y2="212"/><line x1="445" y1="182" x2="445" y2="212"/>
</g>
<g fill="currentColor" font-size="15">
<text x="20" y="32" font-weight="700">General journal, page J1</text>
<text x="20" y="58" font-size="12">Date</text><text x="84" y="58" font-size="12">Account</text><text x="330" y="58" font-size="12" text-anchor="middle">Post. ref.</text><text x="430" y="58" font-size="12" text-anchor="end">Debit</text><text x="520" y="58" font-size="12" text-anchor="end">Credit</text>
<text x="20" y="92">3 Mar</text><text x="84" y="92">Equipment</text><text x="330" y="92" text-anchor="middle" font-weight="700" style="fill:var(--series-1)">150</text><text x="430" y="92" text-anchor="end">12,000</text>
<text x="104" y="118">Cash</text><text x="330" y="118" text-anchor="middle" font-weight="700" style="fill:var(--series-1)">101</text><text x="520" y="118" text-anchor="end">4,000</text>
<text x="104" y="144">Accounts Payable</text><text x="330" y="144" text-anchor="middle" font-weight="700" style="fill:var(--series-1)">201</text><text x="520" y="144" text-anchor="end">8,000</text>
<text x="104" y="166" font-size="12" font-style="italic">Espresso machine and grinder; $8,000 due in 30 days</text>
<text x="103" y="202" font-size="12">Dr 12,000</text><text x="278" y="202" font-size="12">Cr 4,000</text><text x="453" y="202" font-size="12">Cr 8,000</text>
<text x="95" y="232" font-size="14" font-weight="700" text-anchor="middle">Equipment</text><text x="270" y="232" font-size="14" font-weight="700" text-anchor="middle">Cash</text><text x="445" y="232" font-size="14" font-weight="700" text-anchor="middle">Accounts Payable</text>
<text x="95" y="250" font-size="12" text-anchor="middle" font-weight="700" style="fill:var(--series-1)">No. 150</text><text x="270" y="250" font-size="12" text-anchor="middle" font-weight="700" style="fill:var(--series-1)">No. 101</text><text x="445" y="250" font-size="12" text-anchor="middle" font-weight="700" style="fill:var(--series-1)">No. 201</text>
<text x="22" y="274" font-size="11">Dr</text><text x="168" y="274" font-size="11" text-anchor="end">Cr</text>
<text x="197" y="274" font-size="11">Dr</text><text x="343" y="274" font-size="11" text-anchor="end">Cr</text>
<text x="372" y="274" font-size="11">Dr</text><text x="518" y="274" font-size="11" text-anchor="end">Cr</text>
<text x="22" y="294" font-size="13">3 Mar <tspan font-weight="700" style="fill:var(--series-1)">J1</tspan></text><text x="90" y="312" font-size="13" text-anchor="end">12,000</text>
<text x="276" y="294" font-size="13">3 Mar <tspan font-weight="700" style="fill:var(--series-1)">J1</tspan></text><text x="343" y="312" font-size="13" text-anchor="end">4,000</text>
<text x="451" y="294" font-size="13">3 Mar <tspan font-weight="700" style="fill:var(--series-1)">J1</tspan></text><text x="518" y="312" font-size="13" text-anchor="end">8,000</text>
</g>
</svg>`;

export default {
  slug: 'general-ledger',
  title: 'Posting to the general ledger',
  blurb: 'The journal tells the story in date order; the general ledger sorts the same amounts by account so that every balance can be read. Learn to post each journal line, cross-reference the two records so any amount can be traced, keep running balances, and check customer and supplier detail against its control account.',
  status: 'draft',
  objectives: [
    'Explain why a business keeps both a journal and a general ledger, and what each is for.',
    'Post journal entries to ledger accounts, writing posting references in both the journal and the ledger.',
    'Calculate an account’s balance in T-account form and in balance-column (running-balance) form.',
    'Reconcile a subsidiary ledger of customers or suppliers with its control account.',
    'Trace an amount between the ledger and the journal, and locate common posting errors.',
    'Distinguish what accounting software does automatically from the judgements it leaves to people.',
  ],
  prerequisites: [
    { lesson: 'f01/journal-entries', why: 'Posting starts from journal entries: you need to read the general journal and know how Lantern’s March transactions were journalised.' },
    { lesson: 'f01/debits-and-credits', why: 'You need T-accounts, debit = left and credit = right, and the normal balance of each type of account.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'It is the evening of 31 March. Before she plans April, Ana Lim wants three numbers: how much cash Lantern Coffee Co. has, how much it owes its suppliers, and how much Meridian Partners still owes it. Everything she needs is in Lantern’s general journal, fifteen entries in date order. But twelve of those fifteen entries change Cash, and the cash amounts are scattered across two journal pages among equipment, insurance, wages and rent. To find the cash balance from the journal she would have to read every entry, pick out each Cash line and add them up, then do the same again for Accounts Payable, and again tomorrow.' },
    { p: 'The journal is organised by time. It answers “what happened on 18 March?” and keeps each transaction whole, with its debits, its credits and an explanation side by side. What Ana needs now is the same information organised by account, so that every change to Cash sits in one place with a running total. That is the <g>general ledger</g>: the collection of all the business’s accounts, one for each account in the <g>chart of accounts</g>, each showing every amount recorded in it and its current balance.' },
    { h: 'The same amounts, sorted two ways' },
    { p: 'Moving amounts from the journal into the ledger is called <g>posting</g>. Posting adds no information and makes no decisions: every debit in the journal becomes a debit in the account it names, and every credit becomes a credit. Lantern’s fifteen March entries produce 31 postings (fourteen two-line entries and one three-line entry), and the debits posted add up to exactly the debits journalised, $61,110.' },
    { p: 'Why keep both records? Each answers a question the other can’t. The ledger shows that Cash fell by $4,000 on 3 March, but not why; for that you need the journal entry, which shows that the $4,000 was part of a $12,000 equipment purchase with $8,000 still owed. The journal tells you everything about each transaction but nothing about any balance until you add it up. Textbooks call the journal the book of original entry, because every transaction is recorded there first, in full; the ledger is where each amount comes to rest, sorted by account.' },
    { quote: { text: '“Transactions are first entered in a journal and then posted to ledger accounts.”', cite: 'Internal Revenue Service, <i>Publication 583: Starting a Business and Keeping Records</i> (revised December 2024)' } },
    { p: 'If you have read a bank statement, you have already read a ledger account. A statement lists the deposits and withdrawals on one account in date order, with the balance after each. A ledger account does the same for one of the business’s own accounts: Cash, Equipment, Wages Expense and every other account in the chart.' },
    { h: 'Posting, step by step' },
    { p: 'Lantern’s journal for March fills two pages, numbered J1 (entries of 1–12 March) and J2 (15–31 March). Each ledger account carries the number it has in the chart of accounts: Cash is 101, Equipment 150, Accounts Payable 201. Posting a journal entry means repeating five steps for each of its lines:' },
    { ol: [
      'Find, in the ledger, the account the line names.',
      'Enter the date of the journal entry. That is the date of the transaction, not the day you happen to post it.',
      'Enter the amount on the same side as in the journal: a debit line goes in the account’s debit column, a credit line in its credit column.',
      'Write the journal page (for example J1) in the account’s reference column, and work out the account’s new balance.',
      'Go back to the journal and write the account’s number in the journal’s <g>posting reference</g> column, next to the line you have just posted.',
    ] },
    { p: 'The last step comes last on purpose. A number in the journal’s posting reference column means “this line is in the ledger”, so a bookkeeper who is interrupted can see exactly where to resume, and a line with a blank reference hasn’t been posted. Together the two references form a cross-reference: from any amount in the ledger you can turn to the journal page that produced it, and from any journal line you can find the account it went to. Here is Lantern’s equipment purchase of 3 March after posting.' },
    { table: {
      caption: 'General journal, page J1: the 3 March entry after posting (fictional)',
      head: ['Date', 'Account and explanation', 'Post. ref.', 'Debit ($)', 'Credit ($)'],
      align: ['l', 'l', 'c', 'r', 'r'],
      rows: [
        ['3 Mar', 'Equipment', '150', '12,000', ''],
        ['', 'Cash', '101', '', '4,000'],
        ['', 'Accounts Payable', '201', '', '8,000'],
        ['', '<i>Espresso machine and grinder; $8,000 due to the supplier in 30 days.</i>', '', '', ''],
      ],
      note: 'The account numbers in the posting reference column were written after each line was posted.',
    } },
    { figure: {
      svg: FIG_POSTING,
      caption: 'Posting the 3 March entry. Each line goes to the account it names, on the same side. The highlighted figures are the cross-references: the account number written in the journal and the journal page written in the ledger.',
      alt: 'Diagram. At the top, page J1 of Lantern’s general journal shows the 3 March entry: Equipment debit 12,000 with posting reference 150; Cash credit 4,000 with posting reference 101; Accounts Payable credit 8,000 with posting reference 201. Three arrows lead down to three T-accounts. Equipment, account number 150, receives 12,000 on its debit side. Cash, account number 101, receives 4,000 on its credit side. Accounts Payable, account number 201, receives 8,000 on its credit side. Each T-account entry is labelled 3 Mar J1, the date and the journal page it came from.',
    } },
    { h: 'Two ways to draw an account' },
    { p: 'So far you have drawn accounts as <g>T-accounts</g>: debits on the left, credits on the right, the balance on the larger side. A T-account is a sketch, quick to draw and good for seeing which side an amount is on. Ledgers kept by hand, and the account reports in most accounting software, use a <g>balance-column account</g> instead, also called a running-balance or three-column account after its debit, credit and balance columns. It lists postings in date order and shows the balance after every one, so you can read the balance on any date without adding anything up. Here is Lantern’s Cash account for March both ways.' },
    { taccounts: {
      caption: 'Cash (101) as a T-account. Debits total $36,900 and credits $10,250, a debit balance of $26,650 (fictional case).',
      accounts: [
        { name: 'Cash', dr: [['1 Mar J1', 20000], ['1 Mar J1', 10000], ['8 Mar J1', 2400], ['15 Mar J2', 1500], ['25 Mar J2', 3000]],
          cr: [['3 Mar J1', 4000], ['4 Mar J1', 1800], ['10 Mar J1', 350], ['18 Mar J2', 1000], ['20 Mar J2', 1600], ['28 Mar J2', 1200], ['30 Mar J2', 300]] },
      ],
    } },
    { table: {
      caption: 'Cash (101) as a balance-column account, March 2026 (fictional case)',
      head: ['Date', 'Explanation', 'Ref.', 'Debit ($)', 'Credit ($)', 'Balance ($)'],
      align: ['l', 'l', 'c', 'r', 'r', 'r'],
      rows: [
        ['1 Mar', 'Shares issued to Ana Lim', 'J1', '20,000', '', '20,000'],
        ['1 Mar', 'Loan from Coastline Bank', 'J1', '10,000', '', '30,000'],
        ['3 Mar', 'Equipment, part paid', 'J1', '', '4,000', '26,000'],
        ['4 Mar', '12-month insurance policy', 'J1', '', '1,800', '24,200'],
        ['8 Mar', 'Harbor Tech deposit', 'J1', '2,400', '', '26,600'],
        ['10 Mar', 'March advertising', 'J1', '', '350', '26,250'],
        ['15 Mar', 'Barista workshop', 'J2', '1,500', '', '27,750'],
        ['18 Mar', 'Paid supplies vendor', 'J2', '', '1,000', '26,750'],
        ['20 Mar', 'Wages, 1–15 March', 'J2', '', '1,600', '25,150'],
        ['25 Mar', 'Meridian Partners, part payment', 'J2', '3,000', '', '28,150'],
        ['28 Mar', 'Kitchen rent, March', 'J2', '', '1,200', '26,950'],
        ['30 Mar', 'Dividend to Ana Lim', 'J2', '', '300', '26,650'],
      ],
      note: 'Every balance is a debit balance, Cash’s normal side. Each “Ref.” is the journal page the amount came from.',
    } },
    { p: 'Both formats give the same balance, $26,650. They differ in what they make easy. The T-account shows at a glance how much flowed in ($36,900) and out ($10,250) in total; the balance-column account shows the balance on any day. Only the second tells Ana that cash peaked at $30,000 on 1 March and, once the bank loan had arrived, never fell below $24,200, which it reached on 4 March after the insurance payment.' },
    { callout: 'key', title: 'The posting rule', html: 'Copy, don’t re-analyse: same account, same date, same amount, same side as the journal, then cross-reference both ways. If a journal entry looks wrong while you are posting it, don’t “fix” it in the ledger. Correct the journal with a new entry and post that, so the two records never disagree.' },
  ],

  theory: [
    { h: 'Calculating a balance' },
    { p: 'An <g>account balance</g> is the difference between the account’s debit total and its credit total, stated on the larger side. For accounts whose <g>normal balance</g> is a debit (assets, expenses and dividends) that is debits minus credits; for liabilities, equity and revenue it is credits minus debits. A balance-column account applies the same rule one posting at a time: for a debit-normal account, add each debit and subtract each credit; for a credit-normal account, add each credit and subtract each debit.' },
    { p: 'Accounts Payable shows the rule working for a credit-normal account. It received four postings in March:' },
    { table: {
      caption: 'Accounts Payable (201) as a balance-column account, March 2026 (fictional case)',
      head: ['Date', 'Explanation', 'Ref.', 'Debit ($)', 'Credit ($)', 'Balance ($)'],
      align: ['l', 'l', 'c', 'r', 'r', 'r'],
      rows: [
        ['3 Mar', 'Equipment supplier', 'J1', '', '8,000', '8,000'],
        ['5 Mar', 'Supplies vendor', 'J1', '', '1,500', '9,500'],
        ['18 Mar', 'Paid supplies vendor', 'J2', '1,000', '', '8,500'],
        ['31 Mar', 'Utility company, March bill', 'J2', '', '260', '8,760'],
      ],
      note: 'Every balance is a credit balance, the normal side for a liability.',
    } },
    { p: 'As a T-account: credits <m>8{,}000 + 1{,}500 + 260 = 9{,}760</m>, debits <m>1{,}000</m>, so the balance is <m>9{,}760 - 1{,}000 = 8{,}760</m>, a credit. Same answer by two routes, which is the habit to build: when a balance matters, work it out a second way.' },
    { p: 'A balance on the side opposite the account’s normal balance is called an abnormal balance, and it is a signal to look closer. Sometimes it is genuine: a business that pays out more than it has in its bank account has a credit balance in Cash, an overdraft, which is in substance a short-term loan from the bank. More often it is a mistake, such as a payment posted to the wrong supplier, which leaves that supplier’s account with a debit balance. Either way, someone should find out which.' },
    { h: 'Lantern’s general ledger at 31 March' },
    { p: 'Posting all fifteen March entries gives the ledger below: Cash, shown above, and fifteen more accounts, grouped by type in chart-of-accounts order. Each balance is worked out on the account’s normal side. These are the balances the next lesson lists in Lantern’s trial balance.' },
    { taccounts: {
      caption: 'Assets other than Cash, 31 March (fictional case)',
      accounts: [
        { name: 'Accounts Receivable', dr: [['12 Mar J1', 4200]], cr: [['25 Mar J2', 3000]] },
        { name: 'Supplies', dr: [['5 Mar J1', 1500]], cr: [] },
        { name: 'Prepaid Insurance', dr: [['4 Mar J1', 1800]], cr: [] },
        { name: 'Equipment', dr: [['3 Mar J1', 12000]], cr: [] },
      ],
    } },
    { taccounts: {
      caption: 'Liabilities, 31 March (fictional case)',
      accounts: [
        { name: 'Accounts Payable', dr: [['18 Mar J2', 1000]], cr: [['3 Mar J1', 8000], ['5 Mar J1', 1500], ['31 Mar J2', 260]] },
        { name: 'Unearned Revenue', dr: [], cr: [['8 Mar J1', 2400]] },
        { name: 'Notes Payable', dr: [], cr: [['1 Mar J1', 10000]] },
      ],
    } },
    { taccounts: {
      caption: 'Equity, dividends and revenue, 31 March (fictional case)',
      accounts: [
        { name: 'Common Stock', dr: [], cr: [['1 Mar J1', 20000]] },
        { name: 'Dividends', dr: [['30 Mar J2', 300]], cr: [] },
        { name: 'Catering Revenue', dr: [], cr: [['12 Mar J1', 4200]] },
        { name: 'Training Revenue', dr: [], cr: [['15 Mar J2', 1500]] },
      ],
    } },
    { taccounts: {
      caption: 'Expenses, 31 March (fictional case)',
      accounts: [
        { name: 'Wages Expense', dr: [['20 Mar J2', 1600]], cr: [] },
        { name: 'Rent Expense', dr: [['28 Mar J2', 1200]], cr: [] },
        { name: 'Utilities Expense', dr: [['31 Mar J2', 260]], cr: [] },
        { name: 'Advertising Expense', dr: [['10 Mar J1', 350]], cr: [] },
      ],
    } },
    { p: 'Notice what is missing. Retained Earnings (320) has no postings: Lantern began on 1 March, so it has no profit from earlier periods, and March’s revenue and expenses are still in their own accounts. They reach Retained Earnings only when the books are closed, in lesson 11. Most accounts received a single posting; the ledger earns its keep in the busy ones, Cash with twelve postings and Accounts Payable with four.' },
    { h: 'Cross-references and the audit trail' },
    { p: 'Posting references create what accountants call an audit trail: a chain of links from each balance back through the ledger and the journal to the <g>source documents</g> behind each entry (an invoice, a receipt, a contract, a bank record), and forward again. The trail can be followed in both directions, and each direction answers a different question.' },
    { list: [
      '<b>Backwards, from the ledger to the documents</b>, asks “did this really happen?”. Pick the $1,200 debit in Rent Expense: its reference, J2, leads to the 28 March entry, and the entry leads to the kitchen rental agreement and the bank payment.',
      '<b>Forwards, from the documents to the ledger</b>, asks “was everything that happened recorded?”. Start from the utility company’s March bill: it should lead to the 31 March entry on J2, whose posting references, 530 and 201, lead to Utilities Expense and Accounts Payable.',
    ] },
    { p: 'Auditors test in both directions for exactly these reasons, and so does a bookkeeper chasing a problem. Without references, finding where a ledger amount came from means searching the journal for a matching date and amount. That works in Lantern’s small March journal, but it fails as soon as two transactions share both, and a busy business records hundreds of identical amounts, such as standard fees or monthly subscriptions, on the same day.' },
    { h: 'Posting errors and how the references find them' },
    { p: 'Posting is copying, and copying goes wrong in a few predictable ways. Each leaves its own trace. The examples below are hypothetical mistakes in posting Lantern’s March journal; the journal itself is correct in each case.' },
    { table: {
      caption: 'Five posting errors and the trace each leaves (hypothetical)',
      head: ['Error', 'Example', 'What the ledger shows', 'How it is found'],
      align: ['l', 'l', 'l', 'l'],
      rows: [
        ['A line not posted', 'The $260 credit to Accounts Payable on 31 March is never copied', 'Accounts Payable $8,500; debits posted exceed credits posted by $260', 'The journal line has no posting reference'],
        ['A line posted twice', 'The $350 advertising debit is copied twice', 'Advertising Expense $700; debits exceed credits by $350', 'Two ledger lines with the same date, amount and reference, where the journal has one'],
        ['Wrong side', 'The $1,000 payment of 18 March is posted as a credit to Accounts Payable', 'Accounts Payable $10,760; credits exceed debits by $2,000, twice the amount', 'The referenced journal line shows a debit'],
        ['Wrong amount', 'Wages of $1,600 are posted as $1,060', 'Wages Expense $1,060; debits fall short of credits by $540', 'The referenced journal line shows $1,600'],
        ['Wrong account', 'March rent is posted to Utilities Expense', 'Rent Expense $0, Utilities Expense $1,460; debits still equal credits', 'Only by reading the journal: the reference leads to an entry that names Rent Expense'],
      ],
    } },
    { p: 'The first four leave the ledger’s total debits and total credits unequal, and the next lesson shows how a trial balance exposes them and how the size of the gap narrows the search. The fifth is the dangerous one. The ledger still balances, and only someone following the cross-reference and reading what the journal actually says will catch it.' },
    { h: 'Subsidiary ledgers and control accounts' },
    { p: 'Accounts Receivable tells Ana that customers owe Lantern $1,200 in total. To collect it, she needs to know who owes it. A business with hundreds of customers can’t open a general-ledger account for each one: the ledger, and every report built from it, would become unreadable. Instead it keeps the detail in a <g>subsidiary ledger</g>, a separate ledger with one account for each customer, and keeps a single Accounts Receivable account in the general ledger as the <g>control account</g>, whose balance must always equal the total of the subsidiary accounts. Payables work the same way, with one account for each supplier.' },
    { p: 'Every amount posted to a control account is also posted to the matching customer or supplier account. That second posting is not an extra debit or credit in the double-entry sense: the subsidiary ledger sits outside the general ledger and breaks one account down into its parts, so only the control account goes into the trial balance. In a manual system the bookkeeper marks the subsidiary posting in the journal’s reference column, often with a tick (✓) beside the account number.' },
    { p: 'Lantern’s subsidiary ledgers at 31 March are short, which makes them easy to check:' },
    { table: {
      caption: 'Accounts receivable subsidiary ledger, 31 March (fictional case)',
      head: ['Customer', 'Invoiced ($)', 'Paid ($)', 'Balance ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [['Meridian Partners', '4,200', '3,000', '1,200']],
      foot: [['Total of customer accounts', '4,200', '3,000', '1,200']],
      note: 'Agrees with the control account, Accounts Receivable (110): $1,200.',
    } },
    { table: {
      caption: 'Accounts payable subsidiary ledger, 31 March (fictional case)',
      head: ['Supplier', 'Billed ($)', 'Paid ($)', 'Balance ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Equipment supplier (espresso machine and grinder)', '8,000', '', '8,000'],
        ['Supplies vendor (beans, milk, cups and lids)', '1,500', '1,000', '500'],
        ['Utility company (March bill)', '260', '', '260'],
      ],
      foot: [['Total of supplier accounts', '9,760', '1,000', '8,760']],
      note: 'Agrees with the control account, Accounts Payable (201): $8,760.',
    } },
    { p: 'Harbor Tech appears in neither list. It doesn’t owe Lantern anything, and what Lantern owes it is catering (or a refund), not payment for something bought, so its $2,400 deposit sits in Unearned Revenue rather than Accounts Payable.' },
    { p: 'Checking that a subsidiary ledger agrees with its control account is called reconciling them: list every customer’s (or supplier’s) balance, add the list, and compare the total with the control account. If the two differ, something was posted to one and not the other, posted at a different amount, or added up wrongly, and the posting references show where to look. Agreement is reassuring but not proof. An invoice posted to the wrong customer leaves both totals unchanged while one customer is overcharged and another undercharged, which is one reason businesses send customers regular statements of their accounts: a customer who is overcharged will soon say so.' },
    { callout: 'note', title: 'Other subsidiary ledgers', html: 'Any account that summarises many similar items can have one. A fixed-asset register lists each machine and vehicle behind Equipment; an inventory ledger lists each product; payroll records list each employee. The principle never changes: the detail in the subsidiary ledger must add up to the control account in the general ledger.' },
    { h: 'What software does, and what it leaves to you' },
    { p: 'In accounting software you rarely post anything by hand. You record a transaction once, often by filling in a form such as a sales invoice or a supplier bill, and the system creates the journal entry, posts every line to the general ledger immediately, updates the customer or supplier account and the control account together, and recalculates the balances. The cross-reference becomes a link: from any line in an account you can open the transaction that created it. ACCA’s study material for its Financial Accounting exam notes that a computerised system will usually not allow an unbalanced journal entry to be posted at all. Copying errors, arithmetic errors and one-sided postings largely disappear.' },
    { p: 'What remains is everything that needs judgement. Software can’t tell that rent was entered as utilities, that a repair was added to the cost of equipment, that an invoice was assigned to the wrong customer, that an amount was mistyped on the original form, or that a transaction was never entered. And where a system lets someone post a journal entry straight to a control account without naming a customer or supplier, the control account and the subsidiary ledger can drift apart, which is why accountants still reconcile them at each month end. The mechanics of the ledger are automated; the accounting isn’t.' },
    { callout: 'standards', title: 'Keeping records is a legal duty; the layout is not prescribed', html: 'In the United States, the IRS’s guide for new businesses (Publication 583, revised December 2024) describes journals and ledgers as the usual way to summarise transactions and says that whether and how you keep them depends on the type of business. In the United Kingdom, section 386 of the Companies Act 2006 requires every company to keep adequate accounting records, sufficient to show and explain its transactions and to disclose its financial position with reasonable accuracy at any time. Neither sets a format: account numbers, reference codes and ledger layouts are conventions that vary between businesses and software packages. What matters is that every amount can be traced.' },
  ],

  formulas: [
    { id: 'balance-debit-normal', name: 'Balance of a debit-normal account',
      tex: String.raw`\text{Balance} = \sum \text{Debits} - \sum \text{Credits}`,
      where: [
        [String.raw`\sum \text{Debits}`, 'Total of all amounts posted to the debit side, including any opening debit balance', '$'],
        [String.raw`\sum \text{Credits}`, 'Total of all amounts posted to the credit side', '$'],
      ],
      assumptions: 'Use for assets, expenses and dividends. A negative result means the account has an abnormal (credit) balance: investigate it.' },
    { id: 'balance-credit-normal', name: 'Balance of a credit-normal account',
      tex: String.raw`\text{Balance} = \sum \text{Credits} - \sum \text{Debits}`,
      where: [
        [String.raw`\sum \text{Credits}`, 'Total of all amounts posted to the credit side, including any opening credit balance', '$'],
        [String.raw`\sum \text{Debits}`, 'Total of all amounts posted to the debit side', '$'],
      ],
      assumptions: 'Use for liabilities, equity, revenue and contra accounts.' },
    { id: 'running-balance', name: 'Running balance after a posting (debit-normal account)',
      tex: String.raw`B_n = B_{n-1} + \text{Dr}_n - \text{Cr}_n`,
      where: [
        [String.raw`B_n`, 'Balance after the n-th posting', '$'],
        [String.raw`B_{n-1}`, 'Balance before it (zero for a new account)', '$'],
        [String.raw`\text{Dr}_n,\ \text{Cr}_n`, 'The debit or credit posted (one of them is zero)', '$'],
      ],
      note: 'For a credit-normal account reverse the signs: add credits and subtract debits.' },
    { id: 'control-account', name: 'Control account check',
      tex: String.raw`\text{Control account balance} = \sum_{i} \text{Subsidiary balance}_i`,
      where: [
        [String.raw`\text{Subsidiary balance}_i`, 'Balance of customer (or supplier) account i in the subsidiary ledger', '$'],
      ],
      assumptions: 'Every amount was posted to both the control account and the subsidiary ledger.',
      note: 'Agreement shows the totals match; it can’t show that each amount is in the right customer’s or supplier’s account.' },
  ],

  examples: [
    { level: 'simple', title: 'Posting Meridian’s part payment', fictional: true,
      setup: 'On 25 March Meridian Partners pays $3,000 of its $4,200 invoice. The entry is on journal page J2: debit Cash $3,000, credit Accounts Receivable $3,000. Before this entry Cash had a balance of $25,150 and Accounts Receivable $4,200. Post the entry, including the subsidiary ledger, and give the new balances.',
      steps: [
        'Post the debit. In Cash (101), enter 25 Mar, reference J2, and $3,000 in the debit column. Cash is an asset, so its normal balance is a debit and a debit adds to it: <m>25{,}150 + 3{,}000 = 28{,}150</m>.',
        'Post the credit. In Accounts Receivable (110), enter 25 Mar, J2, and $3,000 in the credit column. Accounts Receivable is also an asset, so a credit is subtracted: <m>4{,}200 - 3{,}000 = 1{,}200</m>.',
        'Post the subsidiary ledger. In Meridian Partners’ customer account, credit $3,000. Its balance becomes <m>4{,}200 - 3{,}000 = 1{,}200</m>, the same as the control account.',
        'Cross-reference. In the journal, write 101 beside the Cash line and 110 (with a tick for the customer account) beside the Accounts Receivable line.',
      ],
      answer: 'Cash $28,150 (debit); Accounts Receivable $1,200 (debit); Meridian Partners owes $1,200, which agrees with the control account.',
      interpretation: 'Collecting a receivable turns one asset into another: Cash rises and Accounts Receivable falls by the same $3,000, and no revenue is posted, because the revenue was recorded on 12 March when the conference was catered.' },
    { level: 'challenging', title: 'A supplier ledger that doesn’t agree', fictional: true,
      setup: 'Suppose that when Lantern’s bookkeeper reconciles payables on 31 March, Accounts Payable (201) shows a credit balance of $10,760, but the three supplier accounts, posted from the same documents, total $8,760. The journal entries are correct. Find the error and the correct balance.',
      steps: [
        'Measure the gap: <m>10{,}760 - 8{,}760 = 2{,}000</m>. The control account is $2,000 higher than the detail.',
        'Rebuild the control account from its postings. The 3 March (J1), 5 March (J1) and 31 March (J2) postings are credits of 8,000, 1,500 and 260; the 18 March posting (J2) of 1,000 is also in the credit column. Credits total <m>8{,}000 + 1{,}500 + 1{,}000 + 260 = 10{,}760</m> and there are no debits.',
        'Follow the reference. Page J2, 18 March, records Accounts Payable 1,000 as a <i>debit</i>: paying a supplier reduces what Lantern owes. The amount was posted to the wrong side. The gap is twice the amount because the 1,000 was added where it should have been subtracted: moving it from one side to the other changes the balance by <m>2 \\times 1{,}000</m>.',
        'Correct the posting to match the journal (the journal was right, so only the ledger changes): <m>8{,}000 + 1{,}500 + 260 - 1{,}000 = 8{,}760</m>, which now agrees with the supplier accounts, <m>8{,}000 + 500 + 260 = 8{,}760</m>.',
      ],
      answer: 'The $1,000 payment of 18 March was posted as a credit instead of a debit. Corrected, Accounts Payable is $8,760, equal to the subsidiary ledger total.',
      interpretation: 'Without the reconciliation Lantern would have reported $2,000 more debt than it has. The pattern “the gap is twice an amount” is worth remembering: the next lesson uses it to search a trial balance, where this error would also show up as a $2,000 difference.' },
    { level: 'applied', title: 'Can the boutique have more stock on credit?', fictional: true,
      setup: 'Kitefield Apparel, a fictional clothing brand, sells to independent boutiques on 30-day credit. On 30 June its Accounts Receivable control account shows $47,400. Its customer ledger lists five boutiques: Fern Row $14,250, Marlow Street $9,800, The Linen Room $11,400, Coastal Edit $6,900 and Juniper Lane $5,500. Juniper Lane has just ordered $6,000 of autumn stock. Kitefield ships on credit only if a customer’s balance after the order stays within its credit limit, which for Juniper Lane is $12,000. Before deciding, the credit controller reconciles. She finds that a $450 credit note issued to Coastal Edit for faulty jackets was posted to the control account but not to Coastal Edit’s account. Separately, Marlow Street’s buyer has queried a $1,350 invoice on its June statement: it was Juniper Lane’s invoice, posted to the wrong customer. Should the order ship on credit?',
      steps: [
        'Add the customer ledger: <m>14{,}250 + 9{,}800 + 11{,}400 + 6{,}900 + 5{,}500 = 47{,}850</m>. That is <m>47{,}850 - 47{,}400 = 450</m> more than the control account.',
        'Post the missing credit note to Coastal Edit: <m>6{,}900 - 450 = 6{,}450</m>. The customer ledger now totals <m>47{,}400</m> and agrees with the control account.',
        'Agreement doesn’t prove each balance is right. Move the misposted invoice: Marlow Street <m>9{,}800 - 1{,}350 = 8{,}450</m>, Juniper Lane <m>5{,}500 + 1{,}350 = 6{,}850</m>. The total is unchanged at <m>14{,}250 + 8{,}450 + 11{,}400 + 6{,}450 + 6{,}850 = 47{,}400</m>, because this error moved an amount between customers without changing the control account.',
        'Apply the credit rule with the corrected balance: <m>6{,}850 + 6{,}000 = 12{,}850</m>, which is <m>850</m> over Juniper Lane’s $12,000 limit. On the uncorrected figure it would have looked safe: <m>5{,}500 + 6{,}000 = 11{,}500</m>.',
      ],
      answer: 'Not on the current terms. Juniper Lane really owes $6,850, so the order would take it to $12,850, $850 over its limit. Kitefield can ask Juniper Lane to pay at least $850 of its balance before shipping, or review its payment record and decide whether to raise the limit.',
      interpretation: 'The reconciliation changed the decision. Notice which error mattered for this customer: the misposted invoice never showed up as a difference between the totals and was caught only because a customer read its statement. Control-account agreement checks the totals; customer statements and cross-references check the detail.' },
  ],

  demo: [
    { widget: 'gl-march', intro: 'Post Lantern’s fifteen March entries one at a time. Before each click, predict which accounts the entry will reach and on which side; then watch where each line lands and how the balances change. By the end, Cash has twelve postings and its balance is $26,650.' },
    { widget: 'gl-balance', intro: 'Seven entries that run through Cash, Accounts Receivable and Accounts Payable. Work out each account’s balance yourself before the widget shows it. For Accounts Payable, a credit-normal account, add the credits and subtract the debit.' },
  ],

  mistakes: [
    { title: '“Posting is a second chance to decide the entry.”', html: 'Posting copies; it doesn’t analyse. If you change an account or an amount while posting, the ledger and the journal disagree and the cross-reference leads to the wrong place. When an entry looks wrong, leave the ledger alone: correct the journal with a new entry and post that.' },
    { title: '“A credit means subtract, so I’ll post it as a negative debit.”', html: 'Credits go in the credit column, whatever the account. Whether a credit raises or lowers the balance depends on the account’s normal balance: it lowers Cash and Accounts Receivable but raises Accounts Payable and Catering Revenue. Writing −3,000 in a debit column hides the side, so no one reading the account can tell a credit from a reversed debit.' },
    { title: '“The ledger date is the day I post.”', html: 'Use the date of the journal entry, which is the date of the transaction. If Lantern’s bookkeeper posts all of March on 2 April, the Cash account must still show 1, 3 and 4 March and so on; otherwise the balance on any given day is wrong and the account can’t be matched against the bank statement.' },
    { title: '“Customer accounts are extra entries, so they belong in the totals too.”', html: 'A subsidiary ledger breaks down one general-ledger account; it isn’t part of the double entry. Meridian Partners’ $1,200 and Accounts Receivable’s $1,200 are the same money described twice, so only the control account goes into the trial balance. Including both would count the receivable twice.' },
    { title: '“If the control account agrees with the customer ledger, every customer balance is right.”', html: 'Agreement checks totals. An invoice posted to the wrong customer leaves both totals unchanged, as Kitefield’s Marlow Street invoice did. Customer statements, queries and the cross-references are what catch it.' },
    { title: '“The software posted it, so the ledger is right.”', html: 'Software removes copying and arithmetic errors, not judgement errors. A bill coded to the wrong account, a transaction nobody entered, or an amount mistyped on the original invoice all post perfectly. Reconciliations and a sceptical review of balances are still needed.' },
  ],

  application: [
    { p: 'At each month end a bookkeeper works through the ledger before anyone sees a financial statement. A typical close includes reconciling Cash with the bank statement, reconciling Accounts Receivable and Accounts Payable with their subsidiary ledgers, and reviewing every account for balances on the wrong side or amounts that look out of line with last month. Statements prepared from an unreconciled ledger can be wrong in ways nobody notices until a customer disputes a bill or a supplier stops deliveries.' },
    { p: 'The subsidiary ledger is also a working tool. A credit controller at a clothing brand that sells to boutiques on 30-day terms uses the customer accounts every day to decide whom to chase for payment and whom to trust with more stock: a boutique whose balance keeps rising while its payments slow is a risk, however attractive its orders look. As the Kitefield example showed, that decision is only as good as the customer balances, which is why reconciliation comes first.' },
    { p: 'Payables work the same way from the other side. A battery-storage installer that buys cells, inverters, cabling and freight from a dozen suppliers receives invoices by email, through supplier portals and on paper, and paying the same invoice twice is an easy mistake. The supplier ledger is where it shows: the supplier’s account turns to a debit balance, an abnormal balance that a month-end review picks up, and the cross-references lead to the two payments.' },
    { p: 'Managers use the trail to answer “why?”. Suppose Lantern’s utilities cost jumps in May. Ana opens Utilities Expense, sees which postings make up the balance, and follows the reference on the largest one to the bill behind it: a meter-reading error, a tariff change, or a genuinely busier month each call for a different response. Auditors use the same trail in both directions, selecting balances to trace back to evidence and documents to follow forward into the ledger.' },
  ],

  summary: [
    'The journal records transactions in date order and keeps each one whole; the general ledger sorts the same amounts by account so every balance can be read. A business needs both.',
    'Posting copies each journal line to the account it names, with the same date, amount and side. It adds no information and makes no decisions.',
    'Posting references make the trail run both ways: the journal page goes in the ledger, the account number in the journal. A blank reference marks a line not yet posted.',
    'Balance = debits − credits for assets, expenses and dividends; credits − debits for liabilities, equity and revenue. A balance-column account applies the rule after every posting.',
    'At 31 March Lantern’s ledger shows Cash $26,650, Accounts Receivable $1,200 and Accounts Payable $8,760 among sixteen accounts with balances.',
    'A subsidiary ledger holds the detail (one account per customer or supplier) and must total to its control account. Reconcile them, but remember that agreement checks totals, not who owes what.',
    'Software posts automatically and usually refuses unbalanced entries, but it can’t choose the right account or record a transaction nobody entered.',
  ],

  glossary: [
    { term: 'General ledger', def: 'The collection of all a business’s accounts, one for each account in the chart of accounts, showing every amount posted to each account and its balance.' },
    { term: 'Posting', def: 'Copying each line of a journal entry to the ledger account it names, on the same side, with the same date and amount.' },
    { term: 'Posting reference', def: 'A cross-reference written during posting: the journal page in the ledger account, and the account number in the journal, so any amount can be traced in both directions.' },
    { term: 'Balance-column account', def: 'A ledger account laid out with date, explanation, reference, debit, credit and balance columns, showing the balance after every posting. Also called a running-balance or three-column account.' },
    { term: 'Subsidiary ledger', def: 'A separate ledger giving the detail behind one general-ledger account, such as one account for each customer or each supplier.' },
    { term: 'Control account', def: 'A general-ledger account whose balance must equal the total of a subsidiary ledger, such as Accounts Receivable for the customer accounts.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 3.5, “Use Journal Entries to Record Transactions and Post to T-Accounts”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/3-5-use-journal-entries-to-record-transactions-and-post-to-t-accounts', checked: '2026-10-22' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 7.2, “Describe and Explain the Purpose of Special Journals and Their Importance to Stakeholders”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/7-2-describe-and-explain-the-purpose-of-special-journals-and-their-importance-to-stakeholders', checked: '2026-10-22' },
    { text: 'Cooke, J. “Post to the Ledger”, in <i>Financial Accounting</i>. Lumen Learning (CC BY 4.0).', url: 'https://courses.lumenlearning.com/suny-clinton-financialaccounting/chapter/post-to-the-ledger/', checked: '2026-10-22' },
    { text: 'Internal Revenue Service (2024). <i>Publication 583: Starting a Business and Keeping Records</i>, revised December 2024.', url: 'https://www.irs.gov/publications/p583', checked: '2026-10-22' },
    { text: '<i>Companies Act 2006</i> (UK), c. 46, section 386, “Duty to keep accounting records”. legislation.gov.uk.', url: 'https://www.legislation.gov.uk/ukpga/2006/46/section/386', checked: '2026-10-22' },
    { text: 'ACCA. “Suspense accounts and error correction”, technical article for Financial Accounting (FA/FFA), written by a member of the FA/FFA examining team.', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/foundation-level-study-resources/ffa/ffa-technical-articles/suspense-accounts-error-correction.html', checked: '2026-10-22' },
  ],

  checks: [
    // the journal and the ledger
    { what: 'Entries that change Cash', value: [1, 2, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14].length, shown: 12 },
    { what: 'Postings from fifteen entries (14 two-line, 1 three-line)', value: 14 * 2 + 1 * 3, shown: 31 },
    { what: 'Debits journalised in March', value: 20000 + 10000 + 12000 + 1800 + 1500 + 2400 + 350 + 4200 + 1500 + 1000 + 1600 + 3000 + 1200 + 300 + 260, shown: 61110 },
    { what: 'Equipment purchase: cash part', value: 12000 - 8000, shown: 4000 },
    // Cash
    { what: 'Cash debits', value: 20000 + 10000 + 2400 + 1500 + 3000, shown: 36900 },
    { what: 'Cash credits', value: 4000 + 1800 + 350 + 1000 + 1600 + 1200 + 300, shown: 10250 },
    { what: 'Cash balance (T-account route)', value: 36900 - 10250, shown: 26650 },
    { what: 'Cash after 1 Mar loan', value: 20000 + 10000, shown: 30000 },
    { what: 'Cash after 3 Mar', value: 30000 - 4000, shown: 26000 },
    { what: 'Cash after 4 Mar (lowest after the loan)', value: 26000 - 1800, shown: 24200 },
    { what: 'Cash after 8 Mar', value: 24200 + 2400, shown: 26600 },
    { what: 'Cash after 10 Mar', value: 26600 - 350, shown: 26250 },
    { what: 'Cash after 15 Mar', value: 26250 + 1500, shown: 27750 },
    { what: 'Cash after 18 Mar', value: 27750 - 1000, shown: 26750 },
    { what: 'Cash after 20 Mar', value: 26750 - 1600, shown: 25150 },
    { what: 'Cash after 25 Mar', value: 25150 + 3000, shown: 28150 },
    { what: 'Cash after 28 Mar', value: 28150 - 1200, shown: 26950 },
    { what: 'Cash after 30 Mar (running route)', value: 26950 - 300, shown: 26650 },
    // Accounts Payable
    { what: 'AP after 5 Mar', value: 8000 + 1500, shown: 9500 },
    { what: 'AP after 18 Mar', value: 9500 - 1000, shown: 8500 },
    { what: 'AP after 31 Mar', value: 8500 + 260, shown: 8760 },
    { what: 'AP credits', value: 8000 + 1500 + 260, shown: 9760 },
    { what: 'AP balance (T-account route)', value: 9760 - 1000, shown: 8760 },
    // other ledger balances (agree with case.js)
    { what: 'Accounts Receivable at 31 March', value: 4200 - 3000, shown: 1200 },
    { what: 'Supplier ledger total', value: 8000 + (1500 - 1000) + 260, shown: 8760 },
    { what: 'Supplies vendor balance', value: 1500 - 1000, shown: 500 },
    // posting-error table
    { what: 'AP if the 31 March credit is not posted', value: 8000 + 1500 - 1000, shown: 8500 },
    { what: 'Advertising if posted twice', value: 350 * 2, shown: 700 },
    { what: 'AP if the 18 March payment goes to the credit side', value: 8000 + 1500 + 1000 + 260, shown: 10760 },
    { what: 'Wrong-side gap', value: 2 * 1000, shown: 2000 },
    { what: 'Wages posted as 1,060: shortfall', value: 1600 - 1060, shown: 540 },
    { what: 'Utilities with March rent misposted', value: 260 + 1200, shown: 1460 },
    // challenging example
    { what: 'Challenging: gap', value: 10760 - 8760, shown: 2000 },
    { what: 'Challenging: corrected AP', value: 8000 + 1500 + 260 - 1000, shown: 8760 },
    // Kitefield
    { what: 'Kitefield customer ledger before corrections', value: 14250 + 9800 + 11400 + 6900 + 5500, shown: 47850 },
    { what: 'Kitefield difference', value: 47850 - 47400, shown: 450 },
    { what: 'Coastal Edit corrected', value: 6900 - 450, shown: 6450 },
    { what: 'Marlow Street corrected', value: 9800 - 1350, shown: 8450 },
    { what: 'Juniper Lane corrected', value: 5500 + 1350, shown: 6850 },
    { what: 'Kitefield corrected total', value: 14250 + 8450 + 11400 + 6450 + 6850, shown: 47400 },
    { what: 'Juniper Lane after the order', value: 6850 + 6000, shown: 12850 },
    { what: 'Juniper Lane over limit by', value: 12850 - 12000, shown: 850 },
    { what: 'Juniper Lane uncorrected after the order', value: 5500 + 6000, shown: 11500 },
  ],
};
