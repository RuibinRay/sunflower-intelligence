// trial-balance.ex.js — F01 · The trial balance: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const fmtNum = (n) => {
  const a = Math.abs(n);
  const [i, f] = (Number.isInteger(a) ? String(a) : a.toFixed(2)).split('.');
  return (n < 0 ? '−' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? `.${f}` : '');
};
const usd = (n) => `$${fmtNum(n)}`;
const PLACES = ['units', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];

export const widgets = {
  'tb-march': {
    type: 'ledger',
    mode: 'watch',
    show: ['trial'],
    transactions: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'],
  },
  'tb-difference': {
    type: 'formula',
    title: 'What does the difference suggest?',
    intro: 'Set the difference between the debit and credit totals. The tests assume whole-dollar amounts and a single error.',
    inputs: [
      { id: 'diff', label: 'Difference between the totals', min: 1, max: 2000, step: 1, value: 540, fmt: 'money' },
    ],
    compute: (v) => {
      const d = Math.round(v.diff);
      const even = d % 2 === 0;
      const by9 = d % 9 === 0;
      const q = d / 9;
      let trans = 'ruled out';
      if (by9) {
        let r = q, k = 0;
        while (r % 10 === 0) { r /= 10; k += 1; }
        if (r <= 9) {
          // an example pair of digits r apart; for r = 9 the only pair is 9 and 0, so lead with a 1 (190 → 109)
          const a = r <= 8 ? r + 1 : 9, b = r <= 8 ? 1 : 0, lead = r <= 8 ? 0 : 100;
          const big = (lead + 10 * a + b) * 10 ** k, small = (lead + 10 * b + a) * 10 ** k;
          trans = `digits ${r} apart in the ${PLACES[k + 1]} and ${PLACES[k]} places, e.g. ${fmtNum(big)} written as ${fmtNum(small)}`;
        } else {
          trans = 'not two neighbouring digits; look for a slide, or digits further apart';
        }
      }
      const leads = [`an amount of ${usd(d)} missing from one side (a line not posted, posted twice, or a balance left off)`];
      if (even) leads.push(`${usd(d / 2)} on the wrong side`);
      if (by9) leads.push('a transposition or a slide');
      const ruledOut = !even && !by9
        ? ' An odd difference that isn’t a multiple of 9 rules out a single wrong-side error, transposition or slide: re-add the columns, then look for one-sided postings and missing balances.'
        : '';
      return {
        headline: { label: 'Divisible by 9?', value: by9 ? `Yes: 9 × ${fmtNum(q)}` : 'No' },
        rows: [
          ['An amount missing from one side', usd(d)],
          ['An amount on the wrong side', even ? usd(d / 2) : 'ruled out (odd difference)'],
          ['Difference ÷ 9', by9 ? `${fmtNum(q)} exactly` : `${(d / 9).toFixed(2)}, not a whole number`],
          ['If a slide', by9 ? `${usd(q)} and ${usd(10 * q)} confused` : 'ruled out'],
          ['If a transposition', trans],
        ],
        note: `Look first for ${leads.join('; then ')}.${ruledOut} These are leads, not proof: confirm by finding the figure that disagrees with the ledger.`,
      };
    },
  },
};

export const guided = [
  {
    id: 'f01-tb-g1', type: 'steps', kind: 'numerical',
    prompt: 'Cedar Yoga Studio, a fictional business, has these ledger balances on 31 May: Cash 5,420; Accounts Receivable 380; Prepaid Rent 2,400; Equipment 9,600; Accounts Payable 1,150; Unearned Revenue (class passes sold in advance) 3,200; Notes Payable 6,000; Common Stock 5,000; Retained Earnings 1,780; Dividends 700; Class Revenue 8,940; Instructor Wages Expense 5,100; Utilities Expense 470; Cleaning Expense 1,400; Advertising Expense 600. Prepare its trial balance totals.',
    solution: 'Debit column (assets, dividends, expenses): 5,420 + 380 + 2,400 + 9,600 + 700 + 5,100 + 470 + 1,400 + 600 = $26,070. Credit column (liabilities, equity, revenue): 1,150 + 3,200 + 6,000 + 5,000 + 1,780 + 8,940 = $26,070. The trial balance balances.',
    steps: [
      { id: 'f01-tb-g1-s1', type: 'classify',
        prompt: 'Which column does each of these balances belong in?',
        items: ['Prepaid Rent', 'Unearned Revenue', 'Dividends', 'Retained Earnings', 'Accounts Receivable', 'Notes Payable', 'Class Revenue', 'Cleaning Expense'],
        categories: ['Debit column', 'Credit column'],
        answer: [0, 1, 0, 1, 0, 1, 1, 0],
        hints: ['Each balance goes on its normal side: assets, dividends and expenses are debits; liabilities, equity and revenue are credits.', 'Prepaid Rent is rent paid in advance (an asset); Unearned Revenue is service owed to customers (a liability).'],
        feedback: {
          0: 'Prepaid Rent is an asset, the right to use the studio in future months, so it has a debit balance.',
          1: 'Unearned Revenue is a liability: the studio owes classes to people who have paid. Liabilities have credit balances.',
          2: 'Dividends reduce equity, so their normal balance is the opposite of equity’s: a debit.',
          3: 'Retained Earnings is equity, so it has a credit balance.',
        } },
      { id: 'f01-tb-g1-s2', type: 'num', prompt: 'What does the debit column total?',
        answer: 26070, check: () => 5420 + 380 + 2400 + 9600 + 700 + 5100 + 470 + 1400 + 600, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the four assets, Dividends and the four expenses.'],
        wrong: [
          { value: 25370, say: 'You left out Dividends. They aren’t an expense, but their balance is still a debit.' },
          { value: 29270, say: 'You included Unearned Revenue, which is a liability with a credit balance.' },
        ] },
      { id: 'f01-tb-g1-s3', type: 'num', prompt: 'What does the credit column total?',
        answer: 26070, check: () => 1150 + 3200 + 6000 + 5000 + 1780 + 8940, unit: '$', places: 0, tol: 0.5,
        hints: ['Add the three liabilities, Common Stock, Retained Earnings and Class Revenue.'] },
    ],
  },
  {
    id: 'f01-tb-g2', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern’s bookkeeper lists Unearned Revenue ($2,400) in the debit column of the 31 March trial balance and everything else correctly. By how much will the two totals differ?',
    answer: 4800, check: () => (46860 + 2400) - (46860 - 2400), unit: '$', places: 0, tol: 0.5,
    hints: ['Moving a balance to the wrong column changes both columns at once.', 'The debit column gains $2,400 and the credit column loses $2,400.'],
    wrong: [
      { value: 2400, say: 'The credit column loses $2,400 and the debit column gains $2,400, so the gap between them is twice the amount.' },
      { value: 0, say: 'The amount hasn’t disappeared, but it is on the wrong side: one column is too high and the other too low.' },
    ],
    solution: 'Debits become 46,860 + 2,400 = $49,260 and credits 46,860 − 2,400 = $44,460. The difference is 49,260 − 44,460 = $4,800, twice the misplaced balance. Halving the difference leads straight back to the $2,400.',
  },
  {
    id: 'f01-tb-g3', type: 'rows', kind: 'conceptual',
    prompt: 'This is part of a first draft of Lantern’s 31 March trial balance. Select the lines in the wrong column.',
    data: { table: {
      head: ['Account', 'Debit ($)', 'Credit ($)'],
      rows: [
        ['Cash', '26,650', ''],
        ['Accounts Receivable', '', '1,200'],
        ['Prepaid Insurance', '1,800', ''],
        ['Accounts Payable', '', '8,760'],
        ['Unearned Revenue', '2,400', ''],
        ['Common Stock', '', '20,000'],
        ['Dividends', '', '300'],
        ['Training Revenue', '', '1,500'],
        ['Rent Expense', '1,200', ''],
      ],
    } },
    answer: [1, 4, 6],
    hints: ['Compare each line with the account’s normal balance.', 'Three are wrong: an asset, a liability and the account that reduces equity without being an expense.'],
    solution: 'Accounts Receivable is an asset (debit), Unearned Revenue a liability (credit), and Dividends a debit because it reduces equity. Moving them to their proper columns changes the debit column by +1,200 − 2,400 + 300 = −900 and the credit column by −1,200 + 2,400 − 300 = +900. So, if the rest of the draft is right, its debits exceeded its credits by $1,800, and correcting the three lines closes that gap.',
  },
  {
    id: 'f01-tb-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional hotel’s trial balance shows debits of $184,920 and credits of $187,350. Both columns have been re-added, every balance is on its normal side, and no single balance or posting is $2,430.',
    solution: 'Difference 187,350 − 184,920 = $2,430, with the debit column short. Half is $1,215, and with every balance on its normal side no amount is in the wrong column. 2,430 ÷ 9 = 270, so look for a slide between $270 and $2,700. Laundry Expense copied as $270 instead of $2,700 understates the debit column by exactly 2,430.',
    steps: [
      { id: 'f01-tb-g4-s1', type: 'num', prompt: 'Halve the difference. What amount would you look for on the wrong side?',
        answer: 1215, check: () => (187350 - 184920) / 2, unit: '$', places: 0, tol: 0.5,
        hints: ['First find the difference between the two totals.', '187,350 − 184,920 = 2,430.'] },
      { id: 'f01-tb-g4-s2', type: 'num', prompt: 'Now divide the difference by 9.',
        answer: 270, check: () => (187350 - 184920) / 9, unit: '', places: 0, tol: 0.5,
        hints: ['2,430 ÷ 9. If the answer is a whole number, a transposition or slide is possible.'] },
      { id: 'f01-tb-g4-s3', type: 'mc', prompt: 'Which single error fits all the facts?',
        options: [
          'Laundry Expense: the ledger shows $2,700, but it was copied onto the trial balance as $270.',
          'Accounts Payable: the ledger shows $2,700, but it was copied onto the trial balance as $270.',
          'Utilities Expense: the ledger shows $5,130, but it was copied onto the trial balance as $3,510.',
          'Wages Expense: the ledger shows $24,300, but it was copied onto the trial balance as $2,430.',
        ],
        answer: 0,
        hints: ['The debit column is the short one. Which kind of balance must have been understated?', 'A slide between $270 and $2,700 differs by 9 × 270 = 2,430.'],
        feedback: {
          1: 'Right size, wrong side: Accounts Payable is a credit balance, so understating it would make the credit column short, not the debit column.',
          2: 'Swapping digits here gives 5,130 − 3,510 = 1,620, not 2,430.',
          3: 'That slide would leave a difference of 24,300 − 2,430 = 21,870. The $2,430 is the difference, not the figure that was copied.',
        } },
    ],
  },
];

export const independent = [
  {
    id: 'f01-tb-i1', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these errors would make the trial balance totals disagree? Select all that apply.',
    options: [
      'One line of a journal entry posted twice',
      'A transaction left out of the journal entirely',
      'A debit balance listed in the credit column',
      'A debit posted to the wrong expense account',
      'A balance of $1,540 copied onto the trial balance as $1,450',
      'A sale recorded twice in the journal and both entries posted',
      'A $600 credit posted to the ledger as $60',
    ],
    answer: [0, 2, 4, 6],
    feedback: {
      1: 'An omitted transaction removes a debit and its matching credit, so both totals fall equally.',
      3: 'The debit is still a debit, just in the wrong account, so the debit total is unchanged.',
      5: 'Each entry adds equal debits and credits, so recording it twice keeps the totals equal.',
    },
    solution: 'One-sided errors change one column only: a line posted twice, a balance in the wrong column, a transposition when copying one balance, and a slide in one posting. Errors that keep every debit matched by a credit (omission, wrong account, duplicated entry) leave the totals equal.',
  },
  {
    id: 'f01-tb-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand’s trial balance shows debits of $312,480 and credits of $311,670. If a single balance has been put in the wrong column, how large is that balance?',
    answer: 405, check: () => (312480 - 311670) / 2, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 810, say: 'That is the difference itself. A balance in the wrong column moves both totals, so the difference is twice the balance.' },
      { value: 90, say: 'That is the difference divided by 9, the test for a transposition or slide. For a wrong-column balance, halve the difference.' },
    ],
    solution: 'Difference = 312,480 − 311,670 = $810. A wrong-column error leaves twice the amount, so look for a $405 balance; because the debit column is larger, it is a credit balance listed as a debit. (810 is also divisible by 9, so a transposition or slide is a second lead.)',
  },
  {
    id: 'f01-tb-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For each error, would the trial balance totals disagree or still agree?',
    items: [
      'Rent paid recorded as a debit to Cash and a credit to Rent Expense',
      'A $90 credit posted as $900',
      'A utility bill never recorded',
      'An equipment repair debited to Equipment',
      'The Supplies balance left off the trial balance',
      'Wages Expense overstated by $200 and Training Revenue overstated by $200',
    ],
    categories: ['Totals disagree', 'Totals still agree'],
    answer: [1, 0, 1, 1, 0, 1],
    feedback: {
      0: 'This is a reversal: the debit and credit are swapped but still equal, so the totals agree.',
      3: 'An error of principle: the debit went to an asset instead of an expense, but it is still a debit.',
      5: 'Compensating errors: the debit column and the credit column are both $200 too high, so they still agree.',
    },
    solution: 'Only the $900 posting (a slide on one side) and the missing Supplies balance (one side short) make the totals disagree. The reversal, the omission, the error of principle and the compensating errors all keep debits equal to credits.',
  },
  {
    id: 'f01-tb-i4', type: 'mc', kind: 'applied',
    prompt: 'Suppose Lantern’s trial balance at 30 April shows debits of $51,480 and credits of $52,380, and both columns have been re-added. Which single error fits?',
    options: [
      'A $450 debit balance was listed in the credit column.',
      'A $450 credit balance was listed in the debit column.',
      'Advertising Expense of $100 was copied onto the trial balance as $1,000.',
      'A $900 supplier bill was never recorded.',
    ],
    answer: 0,
    feedback: {
      1: 'That would make the debit column the larger one. Here the credit column is $900 larger.',
      2: 'That slide would add $900 to the debit column, making debits larger. The error must make the debits smaller or the credits larger.',
      3: 'An unrecorded bill removes a debit and a credit together, so it can’t cause a difference.',
    },
    solution: 'The difference is 52,380 − 51,480 = $900, with credits larger. Half is $450: a $450 debit balance listed as a credit takes $450 from the debit column and adds $450 to the credit column, a $900 gap in the right direction.',
  },
  {
    id: 'f01-tb-i5', type: 'num', kind: 'numerical',
    prompt: 'A bookkeeper copies a Utilities Expense balance of $2,640 onto the trial balance as $264. By how much will the totals differ?',
    answer: 2376, check: () => 2640 - 264, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 4752, say: 'The amount is on the right side, just too small. Only one column is affected, so the difference isn’t doubled.' },
      { value: 264, say: 'That is the recorded amount. The difference is what is missing from the debit column: 2,640 − 264.' },
    ],
    solution: 'This is a slide: 2,640 − 264 = $2,376, which is 9 × 264. The debit column is $2,376 short, and dividing the difference by 9 gives 264, the smaller of the two amounts.',
  },
];

export const check = [
  {
    id: 'f01-tb-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s trial balance at 31 March totals $46,860 on both sides. What does that agreement prove?',
    options: [
      'The ledger’s debits equal its credits, and the balances were listed and added consistently.',
      'Every transaction in March was recorded in the right account at the right amount.',
      'Lantern’s assets are worth $46,860.',
      'Lantern earned $46,860 of profit in March.',
    ],
    answer: 0,
    feedback: {
      1: 'Errors that keep debits equal to credits, such as an omitted transaction or a wrong account, would still leave the totals equal.',
      2: 'The debit column also contains dividends and expenses, and assets are recorded at historical cost, not value. Lantern’s assets before adjustments total $43,150.',
      3: 'The totals mix every type of account. Net income is revenue minus expenses, which a trial balance doesn’t calculate.',
    },
    solution: 'A trial balance tests the arithmetic of double entry: equal debits and credits, consistently listed and correctly added. It says nothing about whether the right transactions were recorded in the right accounts, and its total isn’t any meaningful business figure.',
  },
  {
    id: 'f01-tb-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional food truck’s trial balance has these debit balances: Cash 6,240; Supplies 830; Truck 42,000; Dividends 1,200; Fuel Expense 940; Wages Expense 3,600. Its credit balances are Accounts Payable 1,410; Notes Payable 25,000; Common Stock 15,000; Sales Revenue 11,260; and Retained Earnings. If the trial balance balances, what is Retained Earnings?',
    answer: 2140, check: () => (6240 + 830 + 42000 + 1200 + 940 + 3600) - (1410 + 25000 + 15000 + 11260), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 940, say: 'You left Dividends out of the debit column. They aren’t an expense, but their balance is a debit.' },
      { value: 54810, say: 'That is the debit total. Retained Earnings is the amount that makes the credit column reach it.' },
    ],
    solution: 'Debits: 6,240 + 830 + 42,000 + 1,200 + 940 + 3,600 = $54,810. Known credits: 1,410 + 25,000 + 15,000 + 11,260 = $52,670. Retained Earnings = 54,810 − 52,670 = $2,140.',
  },
  {
    id: 'f01-tb-k3', type: 'mc', kind: 'applied',
    prompt: 'Your trial balance shows debits of $38,915 and credits of $38,960. You have re-added both columns, and every balance is on its normal side. Which error is the most likely cause?',
    options: [
      'A debit balance with its last two digits swapped, such as $1,272 copied as $1,227',
      'A credit balance with its last two digits swapped, such as $1,272 copied as $1,227',
      'A $45 debit balance listed in the credit column',
      'A $45 transaction never recorded',
    ],
    answer: 0,
    feedback: {
      1: 'Understating a credit balance would make the credit column the short one. Here the debit column is short.',
      2: 'A wrong-column balance leaves twice its amount, so a $45 balance would leave $90. And every balance is on its normal side.',
      3: 'An unrecorded transaction removes a debit and a credit together, so the totals would still agree.',
    },
    solution: 'The difference is 38,960 − 38,915 = $45, odd (so not a wrong-column error) and 45 = 9 × 5: a transposition of neighbouring digits 5 apart in the units and tens places, such as 72 and 27. The debit column is short, so a debit balance was understated: 1,272 − 1,227 = 45.',
  },
  {
    id: 'f01-tb-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these errors would a trial balance NOT reveal? Select all that apply.',
    options: [
      'A transaction that was never recorded',
      'A debit posted to the wrong account, on the correct side',
      'A credit balance listed in the debit column',
      'A whole journal entry recorded and posted twice',
      'One line of an entry posted twice',
      'A wrong amount in the journal, posted to both accounts',
      'Two errors of the same size on opposite sides',
      'A balance copied onto the trial balance with two digits swapped',
    ],
    answer: [0, 1, 3, 5, 6],
    feedback: {
      2: 'A balance in the wrong column moves both totals, leaving a difference of twice the amount.',
      4: 'Posting one line twice adds to one side only, so the totals differ by that amount.',
      7: 'Copying one balance wrongly changes one column only; the difference is a multiple of 9.',
    },
    solution: 'The trial balance misses every error that keeps debits equal to credits: omission, commission or principle (wrong account, right side), a duplicated entry, an error of original entry and compensating errors. It reveals one-sided errors such as wrong-column balances, a line posted twice and transpositions in a single figure.',
  },
  {
    id: 'f01-tb-k5', type: 'rows', kind: 'applied',
    prompt: 'This is a draft trial balance for a fictional hotel. Select the lines in the wrong column.',
    data: { table: {
      head: ['Account', 'Debit ($)', 'Credit ($)'],
      rows: [
        ['Cash', '14,200', ''],
        ['Accounts Receivable', '3,150', ''],
        ['Accumulated Depreciation—Equipment', '4,800', ''],
        ['Accounts Payable', '', '5,640'],
        ['Unearned Revenue (guest deposits)', '3,600', ''],
        ['Common Stock', '', '30,000'],
        ['Dividends', '', '2,000'],
        ['Room Revenue', '', '41,900'],
        ['Wages Expense', '18,700', ''],
      ],
    } },
    answer: [2, 4, 6],
    solution: 'Accumulated Depreciation is a contra-asset with a credit balance, even though it is listed among the assets. Unearned Revenue (deposits for stays not yet provided) is a liability, a credit. Dividends reduce equity and have a debit balance.',
  },
  {
    id: 'f01-tb-k6', type: 'num', kind: 'numerical',
    prompt: 'In the hotel’s draft, Accumulated Depreciation ($4,800) and Unearned Revenue ($3,600) were listed in the debit column and Dividends ($2,000) in the credit column; everything else was right. By how much did the draft’s debit total exceed its credit total?',
    answer: 12800, check: () => 2 * 4800 + 2 * 3600 - 2 * 2000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 10400, say: 'Each misplaced balance moves both columns, so each changes the gap by twice its amount.' },
      { value: 20800, say: 'Dividends were misplaced the other way, into the credit column, so that error reduces the excess of debits over credits.' },
      { value: 6400, say: 'You have the directions right, but each misplaced balance changes the gap by twice its amount.' },
    ],
    solution: 'Each credit balance listed as a debit raises the debit total and lowers the credit total: 2 × 4,800 + 2 × 3,600 = 16,800. Dividends, a debit listed as a credit, work the other way: −2 × 2,000 = −4,000. Net excess of debits = 16,800 − 4,000 = $12,800.',
  },
];
