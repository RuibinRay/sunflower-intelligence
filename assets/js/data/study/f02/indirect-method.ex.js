// indirect-method.ex.js — F02 · The indirect method: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern’s figures come from case.js; every other business is fictional and invented for the exercise.
import { DERIVED as D, RESULTS as R, LEDGER } from './case.js';

const bal = (n) => LEDGER[n]?.balance || 0;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const signed = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const lantern = {
  ni: D.netIncome, dep: D.depreciation,
  ar: bal('Accounts Receivable') - bal('Allowance for Doubtful Accounts'), inv: bal('Inventory'),
  otherCA: bal('Supplies') + bal('Prepaid Insurance'), ap: bal('Accounts Payable'),
  otherCL: bal('Wages Payable') + bal('Interest Payable') + bal('Unearned Revenue') + bal('Income Taxes Payable'),
};

export const widgets = {
  'ind-bridge': {
    type: 'formula',
    title: 'From net income to operating cash flow',
    intro: 'Starting values: Lantern’s first year. “Other current assets” are supplies and prepaid insurance; “other current liabilities” are wages, interest and income taxes payable and unearned revenue. Enter a decrease as a negative change.',
    inputs: [
      { id: 'ni', label: 'Net income', min: -20000, max: 80000, step: 1, value: lantern.ni, fmt: 'money' },
      { id: 'dep', label: 'Depreciation and amortisation', min: 0, max: 20000, step: 10, value: lantern.dep, fmt: 'money' },
      { id: 'gain', label: 'Gain on sale of equipment (a loss is negative)', min: -5000, max: 5000, step: 10, value: 0, fmt: 'money' },
      { id: 'ar', label: 'Change in receivables, net', min: -20000, max: 20000, step: 1, value: lantern.ar, fmt: 'money' },
      { id: 'inv', label: 'Change in inventory', min: -20000, max: 20000, step: 10, value: lantern.inv, fmt: 'money' },
      { id: 'oca', label: 'Change in other current assets', min: -5000, max: 5000, step: 10, value: lantern.otherCA, fmt: 'money' },
      { id: 'ap', label: 'Change in accounts payable', min: -20000, max: 20000, step: 10, value: lantern.ap, fmt: 'money' },
      { id: 'ocl', label: 'Change in other current liabilities', min: -20000, max: 20000, step: 1, value: lantern.otherCL, fmt: 'money' },
    ],
    compute: (v) => {
      const effects = [v.dep, -v.gain, -v.ar, -v.inv, -v.oca, v.ap, v.ocl];
      const cfo = v.ni + effects.reduce((s, x) => s + x, 0);
      const wc = -v.ar - v.inv - v.oca + v.ap + v.ocl;
      const biggest = [['receivables', -v.ar], ['inventory', -v.inv], ['other current assets', -v.oca], ['accounts payable', v.ap], ['other current liabilities', v.ocl]].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
      const note = `Operating cash flow is ${money(cfo)}, ${cfo >= v.ni ? `${money(cfo - v.ni)} more` : `${money(v.ni - cfo)} less`} than net income. Working capital ${wc >= 0 ? `supplied ${money(wc)}` : `absorbed ${money(-wc)}`}; the largest single effect is ${biggest[0]} (${signed(biggest[1])}).${v.gain ? ` The ${v.gain > 0 ? 'gain' : 'loss'} is ${v.gain > 0 ? 'subtracted' : 'added back'}: the sale’s cash belongs to investing.` : ''}${cfo < 0 ? ' Operations used cash this period.' : ''}`;
      return {
        headline: { label: 'Net cash from operating activities', value: money(cfo) },
        rows: [
          ['Net income', money(v.ni)],
          ['Noncash expenses and gains or losses', signed(v.dep - v.gain)],
          ['Working-capital changes, net', signed(wc)],
          ['Total adjustments', signed(cfo - v.ni)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Line', values: ['Net income', 'Depreciation', 'Gain or loss', 'Receivables', 'Inventory', 'Other current assets', 'Accounts payable', 'Other current liabilities', 'Operating cash flow'] },
          series: [{ name: 'Effect on operating cash ($)', values: [v.ni, ...effects, cfo] }], y: { label: 'Dollars' } },
      };
    },
  },
  'ind-sale': {
    type: 'formula',
    title: 'Selling equipment: the gain, the loss and the cash',
    intro: 'Starting values: Blackthorn Print Works’ old press, which cost $24,000, had $15,000 of accumulated depreciation and was sold for $11,500.',
    inputs: [
      { id: 'cost', label: 'Original cost', min: 1000, max: 100000, step: 500, value: 24000, fmt: 'money' },
      { id: 'acc', label: 'Accumulated depreciation at the date of sale', min: 0, max: 100000, step: 500, value: 15000, fmt: 'money' },
      { id: 'proceeds', label: 'Cash received', min: 0, max: 100000, step: 500, value: 11500, fmt: 'money' },
    ],
    compute: (v) => {
      if (v.acc > v.cost) return { error: 'Accumulated depreciation can’t exceed the asset’s cost: lower it, or raise the cost.' };
      const bv = v.cost - v.acc;
      const gl = v.proceeds - bv;
      const word = gl > 0 ? 'gain' : gl < 0 ? 'loss' : 'no gain or loss';
      return {
        headline: { label: gl === 0 ? 'Gain or loss' : gl > 0 ? 'Gain on sale' : 'Loss on sale', value: money(Math.abs(gl)) },
        rows: [
          ['Book value at the date of sale', money(bv)],
          ['Investing inflow: proceeds from sale', money(v.proceeds)],
          ['Indirect-method adjustment', gl === 0 ? '$0' : `${gl > 0 ? '−' : '+'}${money(Math.abs(gl))} (${gl > 0 ? 'subtract the gain' : 'add back the loss'})`],
          ['Net effect on operating cash flow', '$0'],
        ],
        note: `The sale brings in ${money(v.proceeds)}, all of it an investing inflow. ${gl === 0 ? 'Selling at book value gives no gain or loss, so net income needs no adjustment.' : `Net income includes a ${word} of ${money(Math.abs(gl))}; the indirect method ${gl > 0 ? 'subtracts it so the gain isn’t counted in operating and investing' : 'adds it back because it used no operating cash'}.`}`,
        chart: { kind: 'bar', x: { label: 'Amount', values: ['Book value', 'Proceeds', 'Gain or loss'] }, series: [{ name: 'Dollars', values: [bv, v.proceeds, gl] }], y: { label: 'Dollars' } },
      };
    },
  },
};

const DIRECTION = ['Add to net income', 'Subtract from net income', 'Not in the operating section'];
const SALE_ACCOUNTS = ['Cash', 'Equipment', 'Accumulated Depreciation—Equipment', 'Gain on Sale of Equipment', 'Loss on Sale of Equipment', 'Depreciation Expense', 'Notes Receivable', 'Accounts Receivable'];

export const guided = [
  {
    id: 'f02-ind-g1', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional courier company prepares its operating section by the indirect method under US GAAP. What does it do with each item?',
    items: [
      'Depreciation expense of $12,000',
      'Accounts receivable increased by $5,000',
      'Inventory of packaging decreased by $3,000',
      'Accounts payable decreased by $2,500',
      'A gain of $1,800 on selling a delivery truck',
      'Unearned revenue increased by $4,000',
      'The current portion of long-term debt increased by $10,000',
      'Dividends payable increased by $1,500',
      'Prepaid insurance increased by $600',
      'A loss of $900 on selling old computers',
    ],
    categories: DIRECTION,
    answer: [0, 1, 0, 1, 1, 0, 2, 2, 1, 0],
    hints: ['Use ΔCash = ΔLiabilities + ΔEquity − ΔNoncash assets: an asset rising takes cash, a liability rising supplies it.', 'Gains and losses: the sale’s cash is investing, so take the gain out of net income and put a loss back. Debt and dividends belong to financing.'],
    feedback: {
      2: 'A fall in inventory means packaging used this year was paid for earlier: add the decrease.',
      3: 'Payables fell, so the company paid more than this year’s purchases: subtract.',
      4: 'The truck’s whole sale price is an investing inflow. The gain is inside net income, so subtract it to avoid counting it twice.',
      6: 'The current portion is debt reclassified from noncurrent: a financing item with no cash. Leave it out.',
      7: 'Dividends payable belong to financing (dividends paid). Leave the change out of operating activities.',
      9: 'A loss reduced net income but used no operating cash: add it back.',
    },
    solution: 'Add: depreciation, the decrease in inventory, the increase in unearned revenue, the loss. Subtract: the increase in receivables, the decrease in payables, the gain, the increase in prepaid insurance. Not in the operating section: the current portion of long-term debt and dividends payable (financing).',
  },
  {
    id: 'f02-ind-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional pet-supplies wholesaler reports net income of $64,000 for 2027, after depreciation of $15,000 and a $2,000 loss on selling an old van. During the year: accounts receivable rose $9,000; inventory fell $4,000; prepaid rent rose $1,000; accounts payable rose $3,500; accrued wages fell $1,500; income taxes payable rose $2,000. Enter whole dollars, with a minus sign for a net subtraction.',
    solution: 'Noncash items and losses: 15,000 + 2,000 = 17,000. Working capital: −9,000 + 4,000 − 1,000 + 3,500 − 1,500 + 2,000 = −2,000. Net cash from operating activities = 64,000 + 17,000 − 2,000 = $79,000.',
    steps: [
      { id: 'f02-ind-g2-s1', type: 'num', prompt: 'What is the total of the adjustments for depreciation and the loss?',
        answer: 17000, check: () => 15000 + 2000, unit: '$', places: 0, tol: 0.5,
        hints: ['Both reduced net income without using operating cash.', 'Add back the depreciation and add back the loss.'],
        wrong: [
          { value: 13000, say: 'A loss is added back, like depreciation; it is a gain that is subtracted.' },
          { value: 15000, say: 'The loss on the van also reduced net income without using operating cash: add it back as well.' },
        ] },
      { id: 'f02-ind-g2-s2', type: 'num', prompt: 'What is the net total of the working-capital adjustments?',
        answer: -2000, check: () => -9000 + 4000 - 1000 + 3500 - 1500 + 2000, unit: '$', places: 0, tol: 0.5,
        hints: ['Assets up: subtract; assets down: add. Liabilities up: add; liabilities down: subtract.', '−9,000 + 4,000 − 1,000 + 3,500 − 1,500 + 2,000.'],
        wrong: [
          { value: 2000, say: 'Every sign is reversed. An increase in receivables means sales not yet collected: subtract it.' },
          { value: 1000, say: 'Accrued wages fell, so the wholesaler paid more wages than it expensed: subtract the decrease.' },
          { value: 0, say: 'Prepaid rent rose, so cash went out ahead of the expense: subtract the increase.' },
        ] },
      { id: 'f02-ind-g2-s3', type: 'num', prompt: 'What is net cash from operating activities?',
        answer: 79000, check: () => 64000 + 17000 - 2000, unit: '$', places: 0, tol: 0.5,
        hints: ['Net income + the two totals you found.'],
        wrong: [
          { value: 75000, say: 'The loss is added back: use 17,000, not 13,000.' },
          { value: 83000, say: 'The working-capital adjustments total −2,000, not +2,000.' },
          { value: 81000, say: 'Include the working-capital adjustments as well.' },
        ] },
    ],
  },
  {
    id: 'f02-ind-g3', type: 'steps', kind: 'applied',
    prompt: 'On 30 September 2027 a fictional sign-making business sells a vinyl cutter that cost $18,000 and has accumulated depreciation of $13,500, for $3,000 in cash. Depreciation is already up to date. Enter amounts in whole dollars.',
    solution: 'Book value = 18,000 − 13,500 = 4,500; proceeds 3,000, so a loss of 1,500. Entry: debit Cash 3,000, Accumulated Depreciation—Equipment 13,500 and Loss on Sale of Equipment 1,500; credit Equipment 18,000. In the statement of cash flows the loss is added back in operating activities and the $3,000 is an investing inflow.',
    steps: [
      { id: 'f02-ind-g3-s1', type: 'journal', chart: 'f02', date: '2027-09-30',
        prompt: 'Record the sale.',
        accounts: SALE_ACCOUNTS,
        lines: [{ acct: 'Cash', dr: 3000 }, { acct: 'Accumulated Depreciation—Equipment', dr: 13500 }, { acct: 'Loss on Sale of Equipment', dr: 1500 }, { acct: 'Equipment', cr: 18000 }],
        hints: ['Remove the asset at cost and its accumulated depreciation; record the cash received.', 'Book value 4,500 against 3,000 received: the difference is a loss, a debit.'] },
      { id: 'f02-ind-g3-s2', type: 'num', prompt: 'What adjustment does the sale need in the operating section? Enter a subtraction as a negative number.',
        answer: 1500, check: () => (18000 - 13500) - 3000, unit: '$', places: 0, tol: 0.5,
        hints: ['The loss reduced net income. Did it use operating cash?'],
        wrong: [
          { value: -1500, say: 'A loss is added back, not subtracted: it reduced net income but used no operating cash.' },
          { value: 3000, say: 'The $3,000 received is an investing inflow. The operating section only reverses the loss.' },
        ] },
      { id: 'f02-ind-g3-s3', type: 'num', prompt: 'What investing inflow does the sale produce?',
        answer: 3000, check: () => 3000, unit: '$', places: 0, tol: 0.5,
        hints: ['Investing shows the cash actually received.'],
        wrong: [
          { value: 4500, say: 'That is the book value. The business received $3,000.' },
          { value: 1500, say: 'That is the loss. The investing inflow is the whole $3,000 received.' },
        ] },
    ],
  },
  {
    id: 'f02-ind-g4', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the reasoning for a business whose inventory and accounts payable both rose during the year.',
    text: 'Inventory rose, so the business [[0]] more than it sold, and the indirect method [[1]] the increase. Accounts payable also rose, so the business [[2]] for everything it bought, and the indirect method [[3]] that increase.',
    blanks: [
      { options: ['bought', 'sold', 'collected'], answer: 0 },
      { options: ['subtracts', 'adds', 'ignores'], answer: 0 },
      { options: ['has not yet paid', 'has already paid', 'will never pay'], answer: 0 },
      { options: ['adds', 'subtracts', 'ignores'], answer: 0 },
    ],
    fixed: true,
    hints: ['Cost of goods sold covers only what was sold; the extra stock was bought with cash or on credit.', 'Unpaid bills are expenses or purchases without cash going out yet.'],
    solution: 'Rising inventory means purchases exceeded cost of goods sold, so more cash was committed than the expense shows: subtract. Rising payables mean part of those purchases is still unpaid: add. Together they give the net cash paid for inventory.',
  },
];

export const independent = [
  {
    id: 'f02-ind-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional language school reports net income of $31,000. Depreciation was $7,500, amortisation of its course software $1,200, and it lost $800 on selling old laptops. Accounts receivable fell $2,000, prepaid expenses rose $700, accounts payable fell $1,800, unearned tuition rose $5,400 and wages payable rose $600. What is net cash from operating activities? Enter whole dollars.',
    answer: 46000, check: () => 31000 + 7500 + 1200 + 800 + 2000 - 700 - 1800 + 5400 + 600, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 44400, say: 'A loss is added back, not subtracted.' },
      { value: 35200, say: 'Unearned tuition rose: students paid before the classes, so add the increase.' },
      { value: 42000, say: 'Receivables fell, so the school collected more than it billed: add the decrease.' },
    ],
    solution: '31,000 + 7,500 + 1,200 + 800 = 40,500. Working capital: +2,000 − 700 − 1,800 + 5,400 + 600 = +5,500. Net cash from operating activities = 40,500 + 5,500 = $46,000.',
  },
  {
    id: 'f02-ind-i2', type: 'num', kind: 'applied',
    prompt: 'A fictional brewery’s equipment, at cost, rose from $420,000 to $465,000 during the year. It sold equipment that had cost $38,000, and it bought new equipment, paying part in cash and signing a $25,000 note with the manufacturer for the rest. How much cash did it pay for equipment (an investing outflow)? Enter whole dollars.',
    answer: 58000, check: () => (465000 - 420000 + 38000) - 25000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 45000, say: 'That is the net change in the account. Purchases must also replace the $38,000 of equipment removed on the sale.' },
      { value: 83000, say: 'That is the total cost of the purchases. $25,000 of it was paid with a note: a noncash activity.' },
      { value: 20000, say: 'Start from purchases, not the net change: 465,000 − 420,000 + 38,000 = 83,000, then take out the note.' },
    ],
    solution: 'Roll-forward: 420,000 + purchases − 38,000 = 465,000, so purchases = 83,000. Of that, 25,000 was financed by a note to the seller (disclosed, not a cash flow), so cash paid = 83,000 − 25,000 = $58,000.',
  },
  {
    id: 'f02-ind-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional events company’s retained earnings rose from $186,000 to $203,000 in the year, on net income of $41,000. Its dividends payable rose from $5,000 to $6,000. How much cash did it pay in dividends? Enter whole dollars.',
    answer: 23000, check: () => (186000 + 41000 - 203000) - (6000 - 5000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 24000, say: 'That is the dividends declared. $1,000 more was owed at the end than at the start, so less was paid.' },
      { value: 25000, say: 'Dividends payable rose, so the company paid less than it declared: subtract the increase.' },
      { value: 17000, say: 'That is the change in retained earnings. Declared dividends are 186,000 + 41,000 − 203,000.' },
    ],
    solution: 'Dividends declared = 186,000 + 41,000 − 203,000 = 24,000. Dividends payable rose by 1,000, so cash paid = 24,000 − 1,000 = $23,000, a financing outflow.',
  },
  {
    id: 'f02-ind-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A student’s reconciliation for a fictional cinema reads: net income $90,000; plus depreciation $30,000; plus increase in accounts receivable $4,000; plus increase in accounts payable $6,000; plus proceeds from selling a projector at its book value $5,000; net cash from operating activities $135,000. What is the correct figure, and why?',
    options: [
      '$122,000: subtract the receivables increase and move the proceeds to investing',
      '$75,000: depreciation is an expense, so it must be subtracted again',
      '$123,000: subtract the payables increase and the receivables stay as shown',
      '$130,000: only the projector proceeds are wrong; they belong in investing',
    ],
    answer: 0,
    feedback: {
      1: 'Depreciation is already inside net income. The indirect method adds it back because it used no cash.',
      2: 'An increase in payables means expenses not yet paid: it is added, correctly. The receivables increase is the line with the wrong sign.',
      3: 'The proceeds do belong in investing, but the receivables increase must also be subtracted, not added.',
    },
    solution: 'Two errors: an increase in receivables is subtracted, and the projector’s proceeds are an investing inflow (sold at book value, so there is no gain to adjust). Correct: 90,000 + 30,000 − 4,000 + 6,000 = $122,000.',
  },
  {
    id: 'f02-ind-i5', type: 'num', kind: 'applied',
    prompt: 'A fictional consultancy reports net cash from operating activities of $58,000. Its depreciation was $11,000; receivables rose $9,000; accounts payable rose $3,000; unearned fees fell $2,000. What was its net income? Enter whole dollars.',
    answer: 55000, check: () => 58000 - 11000 + 9000 - 3000 + 2000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 66000, say: 'Depreciation was added to net income to reach operating cash; to go back, subtract it.' },
      { value: 51000, say: 'Unearned fees fell, which was subtracted on the way to cash; add it back to recover net income.' },
      { value: 39000, say: 'Work backwards: undo each adjustment with the opposite sign.' },
    ],
    solution: 'CFO = NI + 11,000 − 9,000 + 3,000 − 2,000 = NI + 3,000. So NI = 58,000 − 3,000 = $55,000.',
  },
  {
    id: 'f02-ind-i6', type: 'short', kind: 'applied',
    prompt: 'The owner of a fictional catering company sees net income of $55,000 but only $12,000 of net cash from operating activities, and asks whether something has gone wrong. The reconciliation shows: depreciation +$8,000; increase in receivables −$36,000; increase in food inventory −$4,000; decrease in accounts payable −$11,000. Write four to six sentences explaining the gap and what she could do about it.',
    rubric: [
      'States that nothing is necessarily wrong: profit is measured on the accrual basis and cash differs from it.',
      'Identifies the $36,000 rise in receivables as the main cause: sales made but not yet collected.',
      'Explains the $11,000 fall in payables (suppliers paid faster or old bills cleared) and the $4,000 of extra stock.',
      'Explains that depreciation is added back because it used no cash, not because it provides cash.',
      'Suggests at least one practical step, such as chasing overdue invoices, tightening credit terms or deposits, or agreeing supplier terms.',
    ],
    model: 'Nothing has necessarily gone wrong: net income counts sales when they are earned, while operating cash flow counts the money actually received and paid. The main reason for the gap is that customers owe $36,000 more than a year ago, so a large part of this year’s profit is still in their hands. The business also paid its suppliers $11,000 more than it bought on credit this year and put $4,000 more into food stock. Depreciation of $8,000 is added back only because it reduced profit without using cash. Chasing overdue invoices, asking for deposits on large events and agreeing normal payment terms with suppliers would bring cash flow closer to profit.',
  },
];

export const check = [
  {
    id: 'f02-ind-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional ski-hire business reports net income of $120,000, after depreciation of $46,000 and a $7,000 gain on selling old snowmobiles. During the year accounts receivable rose $3,000, prepaid insurance fell $1,200, accounts payable rose $4,500, unearned rental deposits fell $9,000 and income taxes payable rose $2,300. What is net cash from operating activities? Enter whole dollars.',
    answer: 155000, check: () => 120000 + 46000 - 7000 - 3000 + 1200 + 4500 - 9000 + 2300, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 169000, say: 'The gain is subtracted: the snowmobiles’ sale price is an investing inflow.' },
      { value: 173000, say: 'Unearned deposits fell: revenue was earned from cash received last season, so subtract the decrease.' },
      { value: 152600, say: 'Prepaid insurance fell: insurance used this year was paid for earlier, so add the decrease.' },
    ],
    solution: '120,000 + 46,000 − 7,000 = 159,000. Working capital: −3,000 + 1,200 + 4,500 − 9,000 + 2,300 = −4,000. Net cash from operating activities = $155,000.',
  },
  {
    id: 'f02-ind-k2', type: 'mc', kind: 'conceptual',
    prompt: 'Why does the indirect method add depreciation to net income?',
    options: [
      'It reduced net income but used no cash in the period',
      'It is a source of cash the business can spend',
      'Its cash is an operating outflow when the asset wears out',
      'US GAAP classifies depreciation as a financing item',
    ],
    answer: 0,
    feedback: {
      1: 'Adding it back doesn’t create cash; it reverses an expense that never used cash this period.',
      2: 'The cash went out when the asset was bought, as an investing outflow; no cash moves as the asset wears out.',
      3: 'Depreciation is an operating expense, not a financing item. It is added back because it is noncash.',
    },
    solution: 'Depreciation allocates an asset’s cost to the periods that use it. It reduces net income, but the cash was paid (an investing outflow) when the asset was bought, so the indirect method adds it back to reach operating cash.',
  },
  {
    id: 'f02-ind-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Under US GAAP, which of these changes are left out of the working-capital adjustments in the operating section? Select all that apply.',
    options: [
      'An increase in the current portion of long-term debt',
      'An increase in dividends payable',
      'An increase in interest payable',
      'A new short-term bank loan',
      'An increase in income taxes payable',
      'A six-month certificate of deposit bought during the year',
      'An increase in unearned revenue',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'Interest paid is operating under US GAAP, so the change in interest payable is an operating adjustment.',
      4: 'Income taxes paid are operating, so the change in taxes payable belongs in the reconciliation.',
      6: 'Unearned revenue comes from customers: an operating liability.',
    },
    solution: 'Leave out financing items (the current portion of long-term debt, dividends payable, a short-term bank loan) and investing items (the certificate of deposit, a short-term investment). Interest payable, income taxes payable and unearned revenue are operating under US GAAP.',
  },
  {
    id: 'f02-ind-k4', type: 'num', kind: 'applied',
    prompt: 'Suppose Lantern had paid every supplier’s bill before 31 December 2026, so its accounts payable were zero and its cash $9,210 lower; nothing else changes. What would its net cash from operating activities have been? Enter whole dollars.',
    answer: 30730, check: () => R.indirect.operating - bal('Accounts Payable'), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 49150, say: 'Paying the bills uses cash: the $9,210 increase in payables would disappear from the reconciliation, lowering operating cash flow.' },
      { value: 39940, say: 'Net income is unchanged, but the payables add-back of $9,210 would be gone.' },
    ],
    solution: 'Net income is unchanged (the expenses were already recorded). The reconciliation loses its +$9,210 for the increase in accounts payable: 39,940 − 9,210 = $30,730, matching $9,210 more cash paid to suppliers in the direct method.',
  },
  {
    id: 'f02-ind-k5', type: 'mc', kind: 'applied',
    prompt: 'A fictional online retailer’s net income rose from $80,000 to $130,000 this year, but its net cash from operating activities fell from $95,000 to $20,000. Its reconciliation shows large increases in receivables and inventory. What is the best reading?',
    options: [
      'Growth is tying cash up in receivables and stock faster than sales bring it in.',
      'The retailer recorded too little depreciation, which cut its operating cash flow.',
      'Operating cash fell because the retailer repaid debt and paid larger dividends.',
      'The figures must contain an error: operating cash flow rises with net income.',
    ],
    answer: 0,
    feedback: {
      1: 'Depreciation is added back, so recording more or less of it doesn’t change operating cash flow (apart from tax).',
      2: 'Debt repayments and dividends are financing outflows; they don’t affect operating cash flow.',
      3: 'Operating cash flow and net income often move apart; the reconciliation shows why.',
    },
    solution: 'The reconciliation subtracts increases in receivables and inventory. A growing retailer that extends credit and builds stock records the profit before the cash arrives, so operating cash flow falls even as net income rises.',
  },
  {
    id: 'f02-ind-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional ferry operator sells an old ferry that cost $900,000, with accumulated depreciation of $700,000, at a loss of $40,000, and buys a new ferry for $1,500,000 in cash. What is its net cash from investing activities? Enter a negative number for cash used, in whole dollars.',
    answer: -1340000, check: () => ((900000 - 700000) - 40000) - 1500000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -1260000, say: 'A loss means the ferry sold for less than its book value: 200,000 − 40,000 = 160,000.' },
      { value: -1300000, say: 'The proceeds are the book value less the loss, not the book value.' },
      { value: -1500000, say: 'Include the cash received for the old ferry as an investing inflow.' },
    ],
    solution: 'Book value = 900,000 − 700,000 = 200,000; proceeds = 200,000 − 40,000 = 160,000. Net cash from investing = 160,000 − 1,500,000 = −$1,340,000. The $40,000 loss is added back in the operating section.',
  },
];
