// general-ledger.ex.js — F01 · Posting to the general ledger: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

export const widgets = {
  'gl-march': {
    type: 'ledger',
    mode: 'watch',
    show: ['taccounts'],
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'],
  },
  'gl-balance': {
    type: 'ledger',
    mode: 'balance',
    show: ['taccounts'],
    // Cash ends at 18,000; Accounts Receivable 1,200; Accounts Payable 8,760 (credit).
    transactions: ['m1', 'm3', 'm5', 'm8', 'm10', 'm12', 'm15'],
  },
};

export const guided = [
  {
    id: 'f01-gl-g1', type: 'steps', kind: 'applied',
    prompt: 'Post Lantern’s 15 March entry from journal page J2: debit Cash $1,500, credit Training Revenue $1,500, for a barista workshop paid in cash.',
    solution: 'The debit goes to the debit column of Cash (101) and the credit to the credit column of Training Revenue (402). Cash is debit-normal, so its balance rises from $26,250 to 26,250 + 1,500 = $27,750. In Cash’s reference column write J2, the journal page; in the journal’s posting reference column beside the Cash line write 101, the account number.',
    steps: [
      { id: 'f01-gl-g1-s1', type: 'classify',
        prompt: 'Where does each journal line land in the ledger?',
        items: ['Cash $1,500 (debit in the journal)', 'Training Revenue $1,500 (credit in the journal)'],
        categories: ['Debit column of Cash (101)', 'Credit column of Cash (101)', 'Debit column of Training Revenue (402)', 'Credit column of Training Revenue (402)'],
        answer: [0, 3],
        hints: ['Posting copies: same account, same side as the journal.', 'A debit in the journal is a debit in the ledger; a credit is a credit.'],
        feedback: {
          0: 'The journal debits Cash, so the amount goes in Cash’s debit column. Whether that raises or lowers the balance is a separate question.',
          1: 'Training Revenue was credited in the journal, so it is credited in the ledger. Revenue increases on the credit side.',
        } },
      { id: 'f01-gl-g1-s2', type: 'num',
        prompt: 'Before this posting Cash had a balance of $26,250. What is its balance after it?',
        answer: 27750, check: () => 26250 + 1500, unit: '$', places: 0, tol: 0.5,
        hints: ['Cash is an asset: its normal balance is a debit.', 'For a debit-normal account a debit adds to the balance.'],
        wrong: [{ value: 24750, say: 'You subtracted. For an asset, a debit increases the balance: the workshop brought cash in.' }] },
      { id: 'f01-gl-g1-s3', type: 'fill',
        prompt: 'Complete the cross-references.',
        text: 'In the reference column of the Cash account you write [[0]]. In the journal’s posting reference column, beside the Cash line, you write [[1]].',
        blanks: [
          { options: ['J2', '101', '402', '15 Mar'], answer: 0 },
          { options: ['J2', '101', '402', '15 Mar'], answer: 1 },
        ],
        hints: ['The ledger points back to where the amount came from; the journal points forward to where it went.', 'The journal page is J2; Cash’s account number is 101.'] },
    ],
  },
  {
    id: 'f01-gl-g2', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s Accounts Payable account starts April with a credit balance of $8,760 and receives these postings: 2 Apr debit $8,000 (paid the equipment supplier); 6 Apr credit $1,900 (supplies bought on account); 9 Apr debit $500 (paid the supplies vendor); 14 Apr debit $260 (paid the March utilities bill); 20 Apr credit $640 (repair bill, to be paid in May). What is the balance on 30 April?',
    answer: 2540, check: () => 8760 - 8000 + 1900 - 500 - 260 + 640, unit: '$', places: 0, tol: 0.5,
    hints: ['Accounts Payable is a liability, so its normal balance is a credit: credits add to it and debits subtract.', 'Start from 8,760, subtract the three payments and add the two new bills.'],
    wrong: [
      { value: 20060, say: 'You added every posting. Debits to a liability are payments: they reduce what Lantern owes, so subtract them.' },
      { value: 14980, say: 'You used the rule for an asset (debits add, credits subtract). For a liability it is the other way round.' },
      { value: -6220, say: 'You left out the opening balance of $8,760. A running balance always starts from the balance brought forward.' },
    ],
    solution: 'Credit-normal account: add credits, subtract debits. 8,760 − 8,000 = 760; + 1,900 = 2,660; − 500 = 2,160; − 260 = 1,900; + 640 = $2,540 (credit). Check by totals: credits 8,760 + 1,900 + 640 = 11,300; debits 8,000 + 500 + 260 = 8,760; 11,300 − 8,760 = $2,540.',
  },
  {
    id: 'f01-gl-g3', type: 'rows', kind: 'conceptual',
    prompt: 'This is part of Lantern’s journal page J2 after an interrupted posting session. Select the lines that have not been posted.',
    data: { table: {
      head: ['Date', 'Account', 'Post. ref.', 'Debit', 'Credit'],
      rows: [
        ['18 Mar', 'Accounts Payable', '201', '1,000', ''],
        ['', 'Cash', '101', '', '1,000'],
        ['20 Mar', 'Wages Expense', '501', '1,600', ''],
        ['', 'Cash', '', '', '1,600'],
        ['25 Mar', 'Cash', '101', '3,000', ''],
        ['', 'Accounts Receivable', '', '', '3,000'],
        ['28 Mar', 'Rent Expense', '', '1,200', ''],
        ['', 'Cash', '', '', '1,200'],
      ],
    } },
    answer: [3, 5, 6, 7],
    hints: ['The account number goes into the journal only after the line has been posted.', 'Look for blank posting references, including one in the middle of the posted lines.'],
    solution: 'Lines with a blank posting reference haven’t been posted: the Cash credit of 20 March, the Accounts Receivable credit of 25 March and both lines of 28 March. The 20 March Cash line is the worrying one: it sits among posted lines, so it was skipped rather than not yet reached. Until it is posted, Cash is overstated by $1,600 and the ledger’s debits exceed its credits by $1,600.',
  },
  {
    id: 'f01-gl-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional battery-storage installer reconciles its payables on 31 May. Its Accounts Payable control account shows a credit balance of $23,480. Its supplier accounts show: cell supplier $12,600; inverter supplier $7,350; cabling supplier $2,660; freight company $1,350.',
    solution: 'The supplier accounts total 12,600 + 7,350 + 2,660 + 1,350 = $23,960, which is $480 more than the control account. A payment reduces both records; if it was posted to the control account but not to the supplier’s account, the supplier account is left $480 too high. Posting the $480 payment to the cabling supplier (2,660 − 480 = 2,180) brings the total to $23,480.',
    steps: [
      { id: 'f01-gl-g4-s1', type: 'num', prompt: 'What do the supplier accounts total?',
        answer: 23960, check: () => 12600 + 7350 + 2660 + 1350, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the four supplier balances.'] },
      { id: 'f01-gl-g4-s2', type: 'num', prompt: 'By how much does the subsidiary ledger differ from the control account?',
        answer: 480, check: () => (12600 + 7350 + 2660 + 1350) - 23480, unit: '$', places: 0, tol: 0.5,
        hints: ['Subtract the control account balance from the subsidiary total.'] },
      { id: 'f01-gl-g4-s3', type: 'mc',
        prompt: 'Which single error explains the difference?',
        options: [
          'A $480 payment to the cabling supplier was posted to the control account but not the supplier’s account.',
          'A $480 bill from the cabling supplier was posted to the control account but not to the supplier’s account.',
          'A $480 bill from the cabling supplier was posted to the inverter supplier’s account instead of the cabling supplier’s.',
          'A $240 payment to the cabling supplier was posted to the wrong side of the control account, as a credit instead of a debit.',
        ],
        answer: 0,
        hints: ['The supplier accounts are higher than the control account. Which kind of posting lowers a payable?', 'A payment is a debit that reduces a payable. If it reached only the control account, which record is left too high?'],
        feedback: {
          1: 'A bill increases payables. Posted only to the control account, it would make the control account higher than the supplier accounts, the opposite of what you see.',
          2: 'Posting to the wrong supplier moves an amount between supplier accounts but leaves their total unchanged, so it can’t create a difference.',
          3: 'A payment posted as a credit would make the control account $480 too high, but here the control account is the lower figure.',
        } },
    ],
  },
];

export const independent = [
  {
    id: 'f01-gl-i1', type: 'steps', kind: 'applied',
    prompt: 'Suppose that on 2 April Lantern pays the equipment supplier the $8,000 it owes.',
    solution: 'Entry: debit Accounts Payable $8,000, credit Cash $8,000. It is posted to Cash (101), to Accounts Payable (201) and to the equipment supplier’s account in the payables subsidiary ledger. Equipment isn’t touched: the machine was recorded when it was bought on 3 March. Accounts Payable falls from $8,760 to 8,760 − 8,000 = $760, which is the supplies vendor’s $500 plus the utility’s $260.',
    steps: [
      { id: 'f01-gl-i1-s1', type: 'journal', prompt: 'Record the journal entry.', chart: 'f01', date: '2026-04-02',
        accounts: ['Cash', 'Accounts Payable', 'Equipment', 'Notes Payable', 'Repairs Expense'],
        lines: [{ acct: 'Accounts Payable', dr: 8000 }, { acct: 'Cash', cr: 8000 }] },
      { id: 'f01-gl-i1-s2', type: 'multi',
        prompt: 'Which accounts receive a posting from this entry? Select all that apply.',
        options: ['Cash (101)', 'Accounts Payable (201)', 'Equipment (150)', 'The equipment supplier’s account in the payables subsidiary ledger', 'Accounts Receivable (110)'],
        answer: [0, 1, 3],
        feedback: {
          2: 'Equipment was debited on 3 March when the machine arrived. Paying for it later settles the debt; it doesn’t buy the machine again.',
          4: 'Accounts Receivable records what customers owe Lantern. The supplier is someone Lantern owes, so this is a payable.',
        } },
      { id: 'f01-gl-i1-s3', type: 'num', prompt: 'What is the balance of Accounts Payable after the posting? (It was $8,760 on 31 March.)',
        answer: 760, check: () => 8760 - 8000, unit: '$', places: 0, tol: 0.5,
        wrong: [{ value: 16760, say: 'A debit reduces a liability. Paying the supplier means Lantern owes less, not more.' }] },
    ],
  },
  {
    id: 'f01-gl-i2', type: 'classify', kind: 'conceptual',
    prompt: 'What does each mark or pattern tell you?',
    items: [
      'J1 in the reference column of the Equipment account',
      '150 in the journal’s posting reference column beside the Equipment line',
      'A tick beside 110 in the journal’s posting reference column',
      'A blank posting reference beside a journal line',
      'Two lines in Advertising Expense with the same date, amount and reference, where the journal shows one',
    ],
    categories: [
      'Points back to the journal page the amount came from',
      'Shows the line has been posted to that general-ledger account',
      'Shows the amount was also posted to a customer or supplier account',
      'Shows a line that hasn’t been posted',
      'Suggests a line posted twice',
    ],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      0: 'The ledger records where each amount came from: J1 is the journal page, not an account.',
      1: 'An account number in the journal means the line has reached that account. It is written after posting, as the last step.',
      2: 'The tick marks the subsidiary posting, here to a customer’s account, alongside the control account 110.',
    },
    solution: 'Ledger references point back to journal pages; journal references point forward to account numbers; a tick marks a subsidiary-ledger posting; a blank journal reference means not yet posted; a duplicated ledger line with one journal line means a double posting.',
  },
  {
    id: 'f01-gl-i3', type: 'steps', kind: 'numerical',
    prompt: 'A small hotel keeps its Cash account in balance-column form. On 1 June, before any June postings, the balance is $18,400. The week’s postings are: 1 Jun payroll paid, credit $9,600; 2 Jun guest receipts, debit $6,250; 3 Jun linen supplier paid, credit $2,450; 5 Jun event deposit received, debit $3,180; 6 Jun utilities paid, credit $1,175.',
    solution: 'Running balance: 18,400 − 9,600 = 8,800; + 6,250 = 15,050; − 2,450 = 12,600; + 3,180 = 15,780; − 1,175 = $14,605. The lowest balance was $8,800, straight after payroll on 1 June. A T-account gives the ending balance (debits 18,400 + 6,250 + 3,180 = 27,830, credits 9,600 + 2,450 + 1,175 = 13,225, balance 14,605) but not the balance on each day.',
    steps: [
      { id: 'f01-gl-i3-s1', type: 'num', prompt: 'What is the balance after the 6 June posting?',
        answer: 14605, check: () => 18400 - 9600 + 6250 - 2450 + 3180 - 1175, unit: '$', places: 0, tol: 0.5,
        wrong: [
          { value: -3795, say: 'You left out the opening balance of $18,400.' },
          { value: 22195, say: 'Cash is an asset: receipts (debits) add and payments (credits) subtract. You reversed them.' },
        ] },
      { id: 'f01-gl-i3-s2', type: 'num', prompt: 'What was the lowest balance during the week?',
        answer: 8800, check: () => Math.min(18400 - 9600, 18400 - 9600 + 6250, 18400 - 9600 + 6250 - 2450, 18400 - 9600 + 6250 - 2450 + 3180, 18400 - 9600 + 6250 - 2450 + 3180 - 1175), unit: '$', places: 0, tol: 0.5,
        wrong: [{ value: 14605, say: 'That is the closing balance. Work out the balance after each posting in date order and take the smallest.' }] },
    ],
  },
  {
    id: 'f01-gl-i4', type: 'mc', kind: 'applied',
    prompt: 'Reviewing the ledger in April, Ana finds a $640 debit in Supplies (120) dated 9 April with reference J3. Journal page J3 shows the 9 April entry as: debit Repairs Expense $640, credit Cash $640. What happened, and will the ledger’s total debits still equal its total credits?',
    options: [
      'The debit was posted to the wrong account; total debits still equal total credits, so only the cross-reference reveals it.',
      'The journal entry is wrong and should be changed to debit Supplies.',
      'The debit was posted to the wrong account, so total debits now exceed total credits by $640.',
      'The amount was posted twice, so total debits exceed total credits by $1,280.',
    ],
    answer: 0,
    feedback: {
      1: 'The journal records the analysis; posting must copy it. Here the journal correctly shows a repair, an expense, so the ledger is what needs fixing.',
      2: 'The $640 debit was still posted as a debit, just to the wrong account, so the totals of debits and credits are unaffected.',
      3: 'There is one $640 debit in the ledger and one in the journal. The problem is where it went, not how many times.',
    },
    solution: 'The posting copied the right amount to the right side of the wrong account: Supplies is overstated by $640 and Repairs Expense understated by $640. Debits still equal credits, so no total-checking test will find it. Following reference J3 to the journal, which names Repairs Expense, does.',
  },
  {
    id: 'f01-gl-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional online coffee retailer sells subscriptions to offices on credit. Its Accounts Receivable control account shows $9,420. The customer accounts show: Office A $2,750, Office B $1,980, Office C $3,140, and a fourth customer, Office D, whose page has been misfiled. If the ledgers agree, what does Office D owe?',
    answer: 1550, check: () => 9420 - (2750 + 1980 + 3140), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 7870, say: 'That is the total of the three accounts you have. The control account equals all four; subtract the three from it.' },
      { value: 17290, say: 'You added the control account to the customer accounts. The control account is the total, not another customer.' },
    ],
    solution: 'Control account = sum of the customer accounts, so Office D = 9,420 − (2,750 + 1,980 + 3,140) = 9,420 − 7,870 = $1,550.',
  },
];

export const check = [
  {
    id: 'f01-gl-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does a business keep a general ledger as well as a journal?',
    options: [
      'The journal records each transaction whole, in date order; the ledger sorts the amounts by account so each balance can be read.',
      'The ledger is a backup copy of the journal, kept in the same date order in case the journal is lost or damaged.',
      'The journal records debits and the ledger records credits.',
      'Once accounting software is used the journal is no longer kept, so the ledger replaces it and records each transaction directly.',
    ],
    answer: 0,
    feedback: {
      1: 'The ledger isn’t a copy in the same order: it re-sorts the amounts by account, which is what makes balances readable.',
      2: 'Both records contain debits and credits. Every journal debit becomes a ledger debit and every credit a ledger credit.',
      3: 'Software still creates a journal entry for every transaction and posts it; it just does both at once.',
    },
    solution: 'They answer different questions. The journal shows what happened in each transaction, with both sides together; the ledger shows the balance of each account. Posting connects them, and posting references let you move between them.',
  },
  {
    id: 'f01-gl-k2', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s Supplies account (120) shows a debit balance of $600 on 1 April, debits of $1,350 (3 April) and $900 (17 April), and a credit of $1,700 (30 April, supplies used). What is its balance at 30 April?',
    answer: 1150, check: () => 600 + 1350 + 900 - 1700, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 4550, say: 'You added every amount. Supplies is an asset: credits reduce it.' },
      { value: 2850, say: 'You left out the $1,700 credit for supplies used.' },
      { value: 550, say: 'You left out the opening balance of $600.' },
    ],
    solution: 'Debit-normal account: 600 + 1,350 + 900 − 1,700 = $1,150 (debit). Check: debits 2,850 − credits 1,700 = 1,150.',
  },
  {
    id: 'f01-gl-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Suppose that on 8 April Lantern caters an event for $2,000. The client pays $500 on the day and is invoiced for the rest. The entry is: debit Cash $500, debit Accounts Receivable $1,500, credit Catering Revenue $2,000. Where does each amount go when the entry is posted?',
    items: ['Cash $500', 'Accounts Receivable $1,500', 'Catering Revenue $2,000', 'The client’s account in the receivables subsidiary ledger, $1,500'],
    categories: ['Debit column', 'Credit column', 'Not posted anywhere'],
    answer: [0, 0, 1, 0],
    feedback: {
      2: 'Catering Revenue is credited in the journal, so it is credited in the ledger.',
      3: 'Every amount in a control account is also posted to the customer’s own account, on the same side: the client now owes $1,500.',
    },
    solution: 'Posting keeps every side: Cash and Accounts Receivable are debited, Catering Revenue credited. The $1,500 is also debited to the client’s account in the subsidiary ledger, so the customer detail keeps agreeing with the control account.',
  },
  {
    id: 'f01-gl-k4', type: 'mc', kind: 'applied',
    prompt: 'At 30 April Lantern’s Accounts Payable control account shows $3,140, but its supplier accounts total $3,780. Which single error explains the difference?',
    options: [
      'A $640 bill was posted to the supplier’s account but not to the control account.',
      'A $640 payment was posted to the supplier’s account but not to the control account.',
      'A $320 payment was posted to the wrong side of the control account.',
      'A $640 bill was posted to the wrong supplier’s account.',
    ],
    answer: 0,
    feedback: {
      1: 'A payment lowers a payable. Posted only to the supplier’s account, it would leave the supplier accounts lower than the control account, not higher.',
      2: 'A payment posted as a credit would make the control account $640 too high, but here the control account is the lower figure.',
      3: 'Posting to the wrong supplier moves an amount between supplier accounts; their total, and so the comparison, is unchanged.',
    },
    solution: 'The supplier accounts are 3,780 − 3,140 = $640 higher. A bill raises payables, so a $640 bill that reached the supplier’s account but not the control account explains it exactly. Posting the bill to the control account brings it to $3,780.',
  },
  {
    id: 'f01-gl-k5', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these posting errors leave the ledger’s total debits equal to its total credits? Select all that apply.',
    options: [
      'A debit posted to the wrong expense account',
      'One line of an entry posted twice',
      'One line of an entry not posted',
      'Both lines of an entry posted twice',
      'A credit posted to the debit side',
      'One line posted as $1,060 instead of $1,600',
    ],
    answer: [0, 3],
    feedback: {
      1: 'Posting one line twice adds an amount to one side only, so the totals differ by that amount.',
      2: 'Leaving out one line removes an amount from one side only.',
      4: 'Moving a credit to the debit side changes the gap between the totals by twice the amount.',
      5: 'Only one side is wrong, so the totals differ by 1,600 − 1,060 = 540.',
    },
    solution: 'Errors that keep the totals equal are the ones where every debit still has a matching credit: a debit posted to the wrong account (still a debit) and a whole entry posted twice (equal amounts added to both sides). The others change one side only, and the next lesson shows how the trial balance catches them.',
  },
  {
    id: 'f01-gl-k6', type: 'num', kind: 'applied',
    prompt: 'A fictional university bookshop sells to academic departments on account. At month end its Accounts Receivable control account shows $15,860, while the department accounts total $16,310. The only error is that a payment from the History department was posted to the control account but not to History’s account, which shows $1,120. What should History’s balance be?',
    answer: 670, check: () => 1120 - (16310 - 15860), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1570, say: 'A payment reduces what a department owes. Subtract the missing $450, don’t add it.' },
      { value: 450, say: 'That is the payment that was missed. History’s balance is what it owed before, less that payment.' },
    ],
    solution: 'The missing payment equals the difference: 16,310 − 15,860 = $450. Posting it to History’s account: 1,120 − 450 = $670. The department accounts then total 15,860 and agree with the control account.',
  },
];
