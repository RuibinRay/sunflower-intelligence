// accrual-vs-cash.ex.js — F01 · Accrual versus cash accounting: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (n) => {
  const r = Math.round(n);
  const s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (r < 0 ? '−$' : '$') + s;
};
const signed = (n) => (Math.round(n) > 0 ? '+' : '') + money(n);

export const widgets = {
  'acb-compare': {
    type: 'formula',
    title: 'Cash-basis profit and accrual-basis net income',
    intro: 'One month of a hypothetical small service business. The first slider is work done and paid for in the same month; the other timing sliders create deferrals and accruals.',
    inputs: [
      { id: 'paidWork', label: 'Work done this month and paid for this month', min: 0, max: 20000, step: 500, value: 6000, fmt: 'money' },
      { id: 'advance', label: 'Cash received in advance for next month’s work', min: 0, max: 10000, step: 250, value: 2000, fmt: 'money' },
      { id: 'invoiced', label: 'Work done this month, invoiced but unpaid', min: 0, max: 10000, step: 250, value: 3000, fmt: 'money' },
      { id: 'paidCosts', label: 'This month’s costs, paid this month', min: 0, max: 20000, step: 500, value: 5000, fmt: 'money' },
      { id: 'unpaidCosts', label: 'This month’s costs, still unpaid', min: 0, max: 10000, step: 250, value: 1500, fmt: 'money' },
      { id: 'prepaid', label: 'Paid this month for later months’ costs', min: 0, max: 10000, step: 250, value: 2400, fmt: 'money' },
    ],
    compute: (v) => {
      const receipts = v.paidWork + v.advance;
      const payments = v.paidCosts + v.prepaid;
      const revenue = v.paidWork + v.invoiced;
      const expenses = v.paidCosts + v.unpaidCosts;
      const cash = receipts - payments;
      const accrual = revenue - expenses;
      const diff = accrual - cash;
      const parts = [];
      if (v.invoiced) parts.push(`${signed(v.invoiced)} for work invoiced but not yet paid (an accrual of revenue)`);
      if (v.advance) parts.push(`${signed(-v.advance)} for cash received before the work is done (a deferral of revenue)`);
      if (v.unpaidCosts) parts.push(`${signed(-v.unpaidCosts)} for costs incurred but not yet paid (an accrual of expense)`);
      if (v.prepaid) parts.push(`${signed(v.prepaid)} for costs paid in advance (a deferral of expense)`);
      const note = parts.length
        ? `Accrual net income differs from cash-basis profit by ${signed(diff)}: ${parts.join('; ')}.${Math.round(diff) === 0 ? ' The gaps happen to cancel out, but each one is still there.' : ''}`
        : 'With no deferrals or accruals, revenue equals receipts and expenses equal payments, so the two bases give the same profit.';
      return {
        headline: { label: 'Accrual-basis net income', value: money(accrual) },
        rows: [
          ['Cash-basis profit', money(cash)],
          ['Accrual minus cash', signed(diff)],
          ['Revenue earned (accrual)', money(revenue)],
          ['Cash received from customers', money(receipts)],
          ['Expenses incurred (accrual)', money(expenses)],
          ['Cash paid for costs', money(payments)],
        ],
        note,
        chart: {
          kind: 'bar',
          x: { label: 'Measure', values: ['Revenue or receipts', 'Expenses or payments', 'Profit'] },
          series: [
            { name: 'Cash basis', values: [receipts, payments, cash] },
            { name: 'Accrual basis', values: [revenue, expenses, accrual] },
          ],
          y: { label: 'Dollars' },
        },
      };
    },
  },
  'acb-gaps': {
    type: 'chart',
    kind: 'bar',
    title: 'Lantern’s March: how each item moves accrual net income away from cash-basis profit',
    x: { label: 'Item', values: ['Meridian invoice', 'Pier Nine breakfast', 'Harbor Tech deposit', 'Insurance', 'Supplies', 'Wages', 'Utilities', 'Interest', 'Depreciation'] },
    series: [{ name: 'Accrual minus cash ($)', values: [1200, 600, -1600, 1650, 100, -1400, -260, -50, -200] }],
    y: { label: 'Effect on profit ($)' },
    note: 'The bars add up to +$40: cash-basis profit $950, accrual net income $990. Fictional figures from the Lantern case.',
  },
};

export const guided = [
  {
    id: 'f01-acb-g1', type: 'steps', kind: 'applied',
    prompt: 'Linden Language School (fictional) has these May events: lessons taught and paid for in May, $9,000; fees received in May for a course that starts in June, $2,500; an in-house course taught for a company in May and invoiced at $4,000, due in June; $1,200 collected from a client for lessons taught in April; teachers’ pay for May of $6,000, of which $4,800 was paid in May and $1,200 on 2 June; and $2,400 paid on 1 May for an advertising campaign that runs from May to August.',
    solution: 'Accrual basis: revenue 9,000 + 4,000 = $13,000; expenses 6,000 + 2,400 ÷ 4 = $6,600; net income $6,400. Cash basis: receipts 9,000 + 2,500 + 1,200 = 12,700; payments 4,800 + 2,400 = 7,200; profit $5,500. The $900 gap = +4,000 invoiced − 2,500 received in advance − 1,200 collected for April − 1,200 pay owed + 1,800 of advertising paid for June to August.',
    steps: [
      { id: 'f01-acb-g1-s1', type: 'num',
        prompt: 'What is May’s revenue on the accrual basis?',
        answer: 13000, check: () => 9000 + 4000, unit: '$', places: 0, tol: 0.5,
        hints: ['Revenue belongs to the month in which the teaching happens.', 'Count the May lessons, paid or invoiced. Leave out fees for June’s course and the cash for April’s lessons.'],
        wrong: [
          { value: 12700, say: 'That is the cash received from customers in May. On the accrual basis the June course fees are unearned, and the $1,200 for April’s lessons was April’s revenue.' },
          { value: 15500, say: 'You included the $2,500 of fees for June’s course. Until it is taught the school owes it: unearned revenue, a liability.' },
          { value: 14200, say: 'The $1,200 collected in May was for lessons taught in April, so it was April’s revenue. Collecting it only turns a receivable into cash.' },
        ] },
      { id: 'f01-acb-g1-s2', type: 'num',
        prompt: 'What are May’s expenses on the accrual basis?',
        answer: 6600, check: () => 6000 + 2400 / 4, unit: '$', places: 0, tol: 0.5,
        hints: ['The teachers earned all of May’s pay in May, paid or not.', 'The campaign runs for four months, so a quarter of its cost belongs to May.'],
        wrong: [
          { value: 7200, say: 'That is cash paid in May (4,800 + 2,400). The unpaid $1,200 of pay is still May’s expense, and three-quarters of the advertising belongs to June to August.' },
          { value: 8400, say: 'You counted all $2,400 of advertising in May. Only one of its four months is May; the rest is a prepaid expense, an asset.' },
          { value: 5400, say: 'You left out the $1,200 of May pay that is paid on 2 June. The teachers earned it in May, so it is May’s expense.' },
        ] },
      { id: 'f01-acb-g1-s3', type: 'num',
        prompt: 'What is May’s profit on the cash basis?',
        answer: 5500, check: () => (9000 + 2500 + 1200) - (4800 + 2400), unit: '$', places: 0, tol: 0.5,
        hints: ['Count every operating receipt and payment in May, whatever period it relates to.', 'Receipts 9,000 + 2,500 + 1,200; payments 4,800 + 2,400.'],
        wrong: [
          { value: 6400, say: 'That is accrual net income (13,000 − 6,600). The cash basis counts only cash received and paid in May.' },
          { value: 9500, say: 'You included the $4,000 invoice, which hasn’t been paid. The cash basis ignores it until the client pays.' },
        ] },
    ],
  },
  {
    id: 'f01-acb-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Place each situation on the timing map, from the point of view of the business named.',
    items: [
      'An airline sells a ticket in March for a flight in May.',
      'A hotel guest stays on the night of 31 March and pays on checking out on 1 April.',
      'A clothing brand pays a photographer in March for a shoot in April.',
      'A battery-storage installer uses electricity in March; the bill arrives in April.',
      'A university receives autumn-term tuition in August.',
      'An online retailer pays for a year of website hosting in advance.',
      'A consultant finishes a project on 30 June and invoices it in July.',
      'Interest on a bank loan builds up during the month and is paid at the end of the quarter.',
    ],
    categories: ['Unearned revenue (cash first)', 'Accrued revenue (revenue first)', 'Prepaid expense (cash first)', 'Accrued expense (expense first)'],
    answer: [0, 1, 2, 3, 0, 2, 1, 3],
    hints: ['First decide whether the item is revenue or an expense for that business. Then ask which came first: the cash, or the earning or using.', 'The airline and the university are paid before they deliver; the hotel and the consultant deliver before they are paid.'],
    feedback: {
      0: 'The airline has the cash but owes the flight: a deferral of revenue, held as a liability until May.',
      1: 'The hotel earned the night’s revenue on 31 March; the cash arrives in April. Revenue first: an accrual.',
      2: 'The brand has paid for a service it hasn’t received yet: an asset (prepaid expense) until the shoot happens.',
      3: 'The electricity was used in March, so it is March’s expense; the payment comes later. Expense first: an accrual.',
      4: 'The university is paid before it teaches: unearned revenue, recognised as the term is taught.',
      5: 'Paying for a year in advance buys an asset that becomes an expense month by month: a prepaid expense.',
      6: 'The work was done in June, so it is June revenue, though invoiced and paid later: accrued revenue.',
      7: 'Interest is an expense of each month as it builds up, paid only at the quarter end: an accrued expense.',
    },
    solution: 'Cash first: airline ticket and university tuition (unearned revenue); photographer and hosting paid in advance (prepaid expenses). Recognition first: the hotel night and the consultant’s project (accrued revenue); electricity and loan interest (accrued expenses).',
  },
  {
    id: 'f01-acb-g3', type: 'order', kind: 'conceptual',
    prompt: 'Put the five steps of the revenue recognition model in ASC 606 and IFRS 15 in order.',
    items: [
      'Identify the contract with the customer',
      'Identify the performance obligations in the contract',
      'Determine the transaction price',
      'Allocate the transaction price to the performance obligations',
      'Recognise revenue when (or as) each performance obligation is satisfied',
    ],
    hints: ['You can’t list the promises until you know there is an agreement, and you can’t share out a price until you know it.', 'Contract, then promises, then price, then share the price, then recognise.'],
    solution: '1 Contract; 2 performance obligations; 3 transaction price; 4 allocation in proportion to stand-alone selling prices; 5 recognition when each obligation is satisfied. Recognition comes last: steps 1–4 decide what has been promised and for how much; step 5 decides when.',
  },
  {
    id: 'f01-acb-g4', type: 'steps', kind: 'applied',
    prompt: 'A fictional university receives $4,800,000 of tuition on 25 August from 500 students ($9,600 each) for an autumn term that runs from 1 September to 31 December. Teaching is spread evenly over the four months. The university’s financial year ends on 31 August.',
    solution: 'At 31 August nothing has been taught, so the $4,800,000 is unearned revenue, a liability. Teaching is spread evenly, so revenue is 4,800,000 ÷ 4 = $1,200,000 a month. After September and October, 4,800,000 − 2 × 1,200,000 = $2,400,000 is still unearned at 31 October.',
    steps: [
      { id: 'f01-acb-g4-s1', type: 'mc',
        prompt: 'How should the university report the $4,800,000 on 31 August?',
        options: [
          'As a liability, unearned revenue, because the teaching hasn’t started',
          'As revenue of the year ending 31 August, because the cash has been received',
          'As revenue of the year ending 31 August, because the students have enrolled',
          'It shouldn’t be recorded at all until the term begins',
        ],
        answer: 0,
        hints: ['Has the university done what the students paid for?', 'The cash is real, so something must be recorded; the question is what.'],
        feedback: {
          1: 'Receiving cash doesn’t satisfy a performance obligation. The students paid for teaching that hasn’t happened.',
          2: 'Enrolment creates the contract (step 1); revenue waits for step 5, when the teaching is delivered.',
          3: 'Cash has arrived, so the university records it now, together with its obligation to teach: unearned revenue.',
        } },
      { id: 'f01-acb-g4-s2', type: 'num',
        prompt: 'How much tuition revenue does the university recognise in September?',
        answer: 1200000, check: () => 500 * 9600 / 4, unit: '$', places: 0, tol: 0.5,
        hints: ['The term’s teaching is spread evenly over four months.', 'Divide the total tuition by the number of months in the term.'],
        wrong: [
          { value: 4800000, say: 'That recognises the whole term in September. The obligation is satisfied over time, as the teaching is delivered.' },
          { value: 2400, say: 'That is one student’s share for a month (9,600 ÷ 4). The question asks for all 500 students.' },
        ] },
      { id: 'f01-acb-g4-s3', type: 'num',
        prompt: 'What is the unearned revenue balance on 31 October?',
        answer: 2400000, check: () => 4800000 - 2 * (4800000 / 4), unit: '$', places: 0, tol: 0.5,
        hints: ['By 31 October, September and October have been taught.', 'Unearned revenue = tuition received − revenue recognised so far.'],
        wrong: [
          { value: 3600000, say: 'That is the balance at 30 September. By 31 October two months of teaching have been delivered.' },
          { value: 1200000, say: 'That is one month’s revenue. Two of the four months remain to be taught, so half the tuition is still unearned.' },
        ] },
    ],
  },
];

export const independent = [
  {
    id: 'f01-acb-i1', type: 'num', kind: 'applied',
    prompt: 'During March a fictional airline sells tickets for $2,400,000: $900,000 of them for flights in March and the rest for flights in April to June. In March it also flies passengers who bought $1,100,000 of tickets in February. What is the airline’s passenger revenue for March on the accrual basis?',
    answer: 2000000, check: () => 900000 + 1100000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2400000, say: 'That is the cash from tickets sold in March. Tickets for April to June are unearned revenue until those flights operate.' },
      { value: 3500000, say: 'You added all March sales to the February tickets flown. Only flights that operated in March count, whenever the ticket was sold.' },
      { value: 900000, say: 'You counted only tickets sold and flown in March. Flights in March sold in February are also March revenue: the airline delivered them in March.' },
    ],
    solution: 'Revenue is recognised when the flight operates (the performance obligation is satisfied). March flights: 900,000 sold in March + 1,100,000 sold in February = $2,000,000. The other 1,500,000 of March sales stays in unearned revenue until April to June.',
  },
  {
    id: 'f01-acb-i2', type: 'num', kind: 'numerical',
    prompt: 'On 1 November a customer pays a fictional software company $1,800 for a 12-month subscription that starts that day. The company’s financial year ends on 31 December. How much of the $1,800 is revenue of the year ending 31 December?',
    answer: 300, check: () => 1800 / 12 * 2, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1800, say: 'The cash arrived this year, but the service runs for 12 months. Only November and December have been delivered.' },
      { value: 150, say: 'That is one month. The subscription has run through November and December: two months by 31 December.' },
      { value: 1500, say: 'That is what is still unearned at 31 December (ten months). The question asks for the revenue already earned.' },
    ],
    solution: 'The service is delivered evenly over 12 months: 1,800 ÷ 12 = $150 a month. November and December give 2 × 150 = $300 of revenue; the remaining $1,500 is unearned revenue at 31 December.',
  },
  {
    id: 'f01-acb-i3', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about “matching” is correct under today’s conceptual frameworks?',
    options: [
      'Matching is a result of recognising changes in assets and liabilities; it can’t justify putting a cost on the balance sheet that isn’t an asset.',
      'A business may defer any cost to the period in which it expects the related revenue.',
      'Matching means each period’s expenses must equal its revenue.',
      'Matching applies only to businesses that use the cash basis.',
    ],
    answer: 0,
    feedback: {
      1: 'That is the stretch the frameworks rule out. A cost is carried forward only if it is an asset, such as insurance cover still to come; advertising that has already run is not.',
      2: 'Matching sets each period’s expenses against its revenue; it doesn’t make them equal. If they were always equal there would never be a profit or a loss.',
      3: 'The cash basis records costs when paid, whatever revenue they relate to. Matching is an accrual idea.',
    },
    solution: 'Expenses are recognised when assets are used up or obligations incurred, and that usually places them in the same period as the revenue they help earn. That outcome is called matching. The IASB’s Conceptual Framework says matching is not an objective and does not allow items that are not assets or liabilities onto the balance sheet.',
  },
  {
    id: 'f01-acb-i4', type: 'multi', kind: 'applied',
    prompt: 'Suppose these events happen at Lantern in April 2026. Which of them give Lantern revenue in April on the accrual basis? Select all that apply.',
    options: [
      'Lantern caters Harbor Tech’s event on 9 April (paid for in March).',
      'Meridian Partners pays the remaining $1,200 of its March invoice.',
      'Lantern caters a $1,100 office party on 28 April and invoices it, due in 30 days.',
      'A company pays a $900 deposit for a barista workshop in May.',
      'Lantern caters Harbor Tech’s event on 23 April.',
      'Pier Nine Studio pays the $600 invoice for its 31 March breakfast.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'That revenue was recognised in March, when the conference was catered. Collecting it only changes receivable into cash.',
      3: 'The workshop is in May. The deposit is unearned revenue in April.',
      5: 'The breakfast was March revenue (adjustment a7). The payment settles a receivable.',
    },
    solution: 'Revenue in April comes from what Lantern delivers in April: the two Harbor Tech events ($800 each, out of unearned revenue) and the $1,100 office party (an account receivable). Collections of March invoices and a deposit for May are cash movements, not April revenue.',
  },
  {
    id: 'f01-acb-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer’s cash-basis profit for June is $18,000. You also know that: customers paid $12,000 of deposits in June for installations in July; $7,000 of installations were completed in June but not paid for by 30 June; June’s payments include $4,800 for a 12-month van insurance policy starting on 1 June; and technicians’ wages of $2,500 for the last week of June are unpaid. All other cash flows relate to June revenue and expenses. What is accrual-basis net income for June?',
    answer: 14900, check: () => 18000 - 12000 + 7000 + (4800 - 4800 / 12) - 2500, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 38900, say: 'You added the deposits. They were counted as cash-basis income but are not yet earned, so they must be subtracted.' },
      { value: 15300, say: 'You added back the whole $4,800 of insurance. One month (400) is June’s expense; add back only the 4,400 that covers July to May.' },
      { value: 10500, say: 'You left the insurance as a June expense. Only $400 of the $4,800 belongs to June; add back the rest.' },
      { value: 19900, say: 'Unpaid wages are a June expense not yet paid: subtract them from cash profit, don’t add them.' },
    ],
    solution: 'Start from cash profit 18,000. Subtract deposits not yet earned (−12,000). Add installations earned but not collected (+7,000). Add back the part of the insurance that covers later months: 4,800 − 4,800 ÷ 12 = +4,400. Subtract wages incurred but unpaid (−2,500). Net income = 18,000 − 12,000 + 7,000 + 4,400 − 2,500 = $14,900.',
  },
  {
    id: 'f01-acb-i6', type: 'classify', kind: 'applied',
    prompt: 'A fictional gym sells a member a 12-month membership with one free personal-training session. Match each event to the step of the revenue recognition model it belongs to.',
    items: [
      'The member signs the membership agreement, which both sides can enforce.',
      'The gym decides that access to the gym and the training session are two separate promises.',
      'The price for the whole package is $600.',
      'The gym splits the $600 between the membership and the session in proportion to what each sells for on its own.',
      'Each month, the gym recognises one-twelfth of the membership’s share as revenue.',
    ],
    categories: ['Step 1: identify the contract', 'Step 2: identify the performance obligations', 'Step 3: determine the transaction price', 'Step 4: allocate the price', 'Step 5: recognise revenue'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      1: 'Deciding how many distinct promises a contract contains is step 2: identifying the performance obligations.',
      3: 'Sharing the price in proportion to stand-alone selling prices is the allocation step, step 4.',
      4: 'Recognising revenue month by month, as the access is provided, is step 5. The membership is satisfied over time.',
    },
    solution: 'Signing creates the contract (step 1). Two distinct promises, access and a training session, are two performance obligations (step 2). $600 is the transaction price (step 3). Sharing it by stand-alone selling prices is allocation (step 4). Recognising the membership’s share evenly over 12 months, and the session’s share when it is given, is step 5.',
  },
];

export const check = [
  {
    id: 'f01-acb-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Under ASC 606 and IFRS 15, when does a business recognise revenue?',
    options: [
      'When, or as, it satisfies a performance obligation by transferring control of a promised good or service to the customer',
      'When the customer pays for the promised good or service, whether that payment arrives before or after it has been delivered',
      'When the contract is signed, because that is when both sides become committed to it',
      'When the invoice is sent, because that is when the business formally asks the customer to pay for the promised good or service',
    ],
    answer: 0,
    feedback: {
      1: 'That is the cash basis. Under the accrual basis cash can arrive before (a deposit) or after (an invoice) revenue is earned.',
      2: 'Signing identifies the contract, step 1 of five. Nothing has been delivered yet.',
      3: 'An invoice is a request for payment. It may be sent before or after the work is done, so it doesn’t decide when revenue is earned.',
    },
    solution: 'Revenue is recognised at step 5 of the model: when (at a point in time) or as (over time) each performance obligation is satisfied, which happens when control of the promised good or service passes to the customer.',
  },
  {
    id: 'f01-acb-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional consultancy’s cash-basis profit for September is $6,000. During September it received $2,000 for work it will do in October, finished $3,500 of work that it will invoice in October, and paid $1,200 for a year of software licences starting on 1 September. All other cash flows relate to September revenue and expenses. What is accrual-basis net income for September?',
    answer: 8600, check: () => 6000 - 2000 + 3500 + (1200 - 1200 / 12), unit: '$', places: 0,
    wrong: [
      { value: 8700, say: 'You added back the whole $1,200. September used one month of the licences ($100), so add back only $1,100.' },
      { value: 12600, say: 'You added the $2,000 received for October’s work. It was counted in cash profit but isn’t earned yet, so subtract it.' },
      { value: 7500, say: 'You left the whole licence payment as September’s expense. Only $100 of it belongs to September.' },
    ],
    solution: 'Cash profit 6,000 − 2,000 (received, not earned) + 3,500 (earned, not received) + 1,100 (licences paid for October to August: 1,200 − 1,200 ÷ 12) = $8,600.',
  },
  {
    id: 'f01-acb-k3', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each item from the point of view of the business named.',
    items: [
      'A hotel’s guests pay deposits for next month’s stays.',
      'An online retailer’s staff earn wages in the last week of the year, paid in January.',
      'A clothing brand pays six months’ warehouse rent in advance.',
      'A design studio finishes a logo in December and invoices it in January.',
    ],
    categories: ['Unearned revenue (cash first)', 'Accrued revenue (revenue first)', 'Prepaid expense (cash first)', 'Accrued expense (expense first)'],
    answer: [0, 3, 2, 1],
    feedback: {
      0: 'Cash arrives before the rooms are provided: a liability until the guests stay.',
      1: 'The staff worked in December, so the wages are December’s expense, paid later.',
      2: 'Paying ahead buys an asset, used up month by month.',
      3: 'The work was done in December: revenue now, cash later.',
    },
    solution: 'Deposits for future stays: unearned revenue. Wages earned but unpaid: accrued expense. Rent paid ahead: prepaid expense. Work finished but not yet invoiced: accrued revenue.',
  },
  {
    id: 'f01-acb-k4', type: 'num', kind: 'applied',
    prompt: 'On 1 October a fictional gym sells 300 annual memberships at $480 each, paid in advance, each giving access for 12 months from 1 October. The gym’s financial year ends on 31 December. How much unearned revenue does the gym report for these memberships at 31 December?',
    answer: 108000, check: () => 300 * 480 * 9 / 12, unit: '$', places: 0,
    wrong: [
      { value: 144000, say: 'That is all the cash received. Three months of access (October to December) have been provided and are revenue.' },
      { value: 36000, say: 'That is the revenue earned in October to December. The question asks what is still owed: nine months.' },
      { value: 132000, say: 'That leaves out only one month. Access has been provided for October, November and December.' },
    ],
    solution: 'Total received 300 × 480 = 144,000, earned evenly at 144,000 ÷ 12 = 12,000 a month. October to December earns 36,000, so unearned revenue at 31 December is 144,000 − 36,000 = $108,000 (nine months).',
  },
  {
    id: 'f01-acb-k5', type: 'mc', kind: 'applied',
    prompt: 'Ana notices that Lantern’s March cash-basis profit ($950) and accrual net income ($990) are almost the same and suggests tracking only cash from now on. What is the best response?',
    options: [
      'The near-match is a coincidence: gaps of up to $1,650 on single items cancel out in March, and several reverse in April.',
      'She is right: the gaps between the two bases always cancel within a month, so tracking cash alone will give the same profit from now on.',
      'Lantern must use the accrual basis, because the cash basis is illegal for every corporation, whatever its size or industry.',
      'Cash-basis profit is always lower than accrual net income, so it is the safer figure to plan with.',
    ],
    answer: 0,
    feedback: {
      1: 'Nothing makes them cancel. Insurance paid in advance, a deposit, an unpaid invoice and unpaid wages all moved the figures by large amounts in different directions.',
      2: 'There is no such general law. Accrual statements are required by US GAAP and IFRS, and tax rules restrict the cash method for some corporations, but the reason to keep accrual records is that they show performance.',
      3: 'Here the cash figure is lower, but not always: in April Lantern earns $1,600 from Harbor Tech without receiving cash, while paying $1,400 of March’s wages.',
    },
    solution: 'The $40 difference hides large offsetting gaps (+1,650 insurance, −1,600 deposit, −1,400 wages, +1,200 receivable…). The two bases measure different things and will diverge in other months, so Lantern needs accrual figures to judge performance and cash figures to manage payments.',
  },
  {
    id: 'f01-acb-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are deferrals (cash moves before the revenue or expense is recognised)? Select all that apply.',
    options: [
      'Prepaid insurance',
      'Unearned revenue from a customer deposit',
      'Wages earned by staff but not yet paid',
      'Revenue for work done but not yet invoiced',
      'Rent paid in advance for the next three months',
    ],
    answer: [0, 1, 4],
    feedback: {
      2: 'The expense comes first and the cash later: that is an accrued expense.',
      3: 'The revenue comes first and the cash later: that is accrued revenue.',
    },
    solution: 'Deferrals are cash-first: prepaid insurance and prepaid rent (expenses paid in advance) and unearned revenue (cash received in advance). Unpaid wages and unbilled work are accruals: recognition comes first.',
  },
];
