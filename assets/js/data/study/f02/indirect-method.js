// indirect-method.js — F02 · The indirect method. Content only; exercises are in indirect-method.ex.js.
// Lantern’s reconciliation is STATEMENTS.cashIndirect from case.js (RESULTS.indirect); its first year starts from zero
// balances. The later-year example is Blackthorn Print Works (fictional, 2027, with 2026 opening balances, a press sold at
// a gain, a seller-financed press and a current portion of debt); Harrowgate Bakery and Tallowmere Candle Co. are
// fictional too. Why profit and cash differ in general, and the four statements together, are linking-the-statements’.
import { FACTS as F, DERIVED as D, STATEMENTS as S, RESULTS as R, LEDGER } from './case.js?v=15';

const bal = (n) => LEDGER[n]?.balance || 0;
const IND = R.indirect;
const wc = (label) => (IND.workingCapital.find((r) => r[0] === label) || [])[1] || 0;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US')}`;

// Lantern figures used in the prose and tables
const LT = {
  arNet: bal('Accounts Receivable') - bal('Allowance for Doubtful Accounts'),     // 6,796
  arGross: bal('Accounts Receivable'), allowance: bal('Allowance for Doubtful Accounts'),
  writeOff: F.catering.writtenOff,
  customers: D.cashFromCustomers, suppliers: D.cashToSuppliers, employees: D.cashToEmployees,
  interestPaid: D.interestPaid, taxPaid: D.incomeTaxesPaid,
  wages: F.wages.events + F.wages.shopAndOffice,
};
LT.supplierExpenses = D.costOfSales - F.wages.events + D.operatingExpenses - F.wages.shopAndOffice - D.depreciation - D.badDebt;   // 105,800
LT.adjCustomers = LT.customers - D.revenue;                                         // −2,100
LT.adjSuppliers = LT.supplierExpenses - LT.suppliers;                               // 2,470
LT.totalAdj = D.cfoIndirect - D.netIncome;                                          // 12,553
const cell = (v) => (v < 0 ? `(${Math.abs(v).toLocaleString('en-US')})` : v.toLocaleString('en-US'));
const reconciliation = {   // each income statement line: accrual amount, adjustment, cash (expenses and payments negative)
  caption: 'Lantern: net income to operating cash flow, line by line',
  head: ['Income statement line', 'Accrual amount ($)', 'Adjustments ($)', 'Cash ($)'],
  align: ['l', 'r', 'r', 'r'],
  rows: [
    ['Net revenue', D.revenue, LT.customers],
    ['Supplier-type expenses', -LT.supplierExpenses, -LT.suppliers],
    ['Wages', -LT.wages, -LT.employees],
    ['Interest', -D.interestExpense, -LT.interestPaid],
    ['Income tax', -D.incomeTax, -LT.taxPaid],
    ['Depreciation', -D.depreciation, 0],
    ['Bad debt expense', -D.badDebt, 0],
  ].map(([name, accrual, cash]) => [name, cell(accrual), cell(cash - accrual), cell(cash)]),
  foot: [['Net income; total adjustments; net cash from operating activities', cell(D.netIncome), cell(LT.totalAdj), cell(D.cfoIndirect)]],
  note: 'The first column adds up to net income and the last to the direct method’s operating total. Fictional figures.',
};

// The bridge from net income to operating cash, one bar per line of Lantern’s reconciliation.
const bridgeSVG = (() => {
  const rows = [['Net income', IND.netIncome, 't'], ...IND.adjustments.map(([l, v]) => [l.replace(/ Expense$/, ''), v, 'f']), ...IND.workingCapital.map(([l, v]) => [l.replace('accounts receivable (net)', 'receivables, net'), v, 'f']), ['Net cash from operating activities', IND.operating, 't']];
  const x0 = 240, scale = 350 / 42000, rowH = 24, top = 12;
  let run = 0, out = '';
  rows.forEach(([label, v, kind], i) => {
    const y = top + i * rowH;
    const from = kind === 't' ? 0 : run, to = kind === 't' ? v : run + v;
    const lo = Math.min(from, to), hi = Math.max(from, to);
    const fill = kind === 't' ? 'var(--series-3)' : v >= 0 ? 'var(--series-1)' : 'var(--series-2)';
    out += `<text x="232" y="${y + 15}" text-anchor="end" fill="currentColor">${label}</text>`;
    out += `<rect x="${(x0 + lo * scale).toFixed(1)}" y="${y + 4}" width="${Math.max(1, (hi - lo) * scale).toFixed(1)}" height="16" fill="${fill}"/>`;
    const amt = kind === 't' ? money(v) : `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString('en-US')}`;
    out += `<text x="${(x0 + hi * scale + 6).toFixed(1)}" y="${y + 16}" fill="currentColor">${amt}</text>`;
    run = to;
  });
  const h = top + rows.length * rowH + 10;
  return `<svg viewBox="0 0 640 ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12"><line x1="${x0}" y1="${top}" x2="${x0}" y2="${h - 8}" stroke="var(--rule-strong)"/>${out}</svg>`;
})();
const bridgeAlt = `Horizontal bridge chart from net income to net cash from operating activities for Lantern’s first year. Net income is $27,387. Depreciation adds $4,800. The increase in net accounts receivable subtracts $6,796, the increase in inventory $5,800, the increase in supplies $640 and the increase in prepaid insurance $300. The increases in accounts payable ($9,210), wages payable ($2,100), interest payable ($750), unearned revenue ($6,100) and income taxes payable ($3,129) each add. Net cash from operating activities is $39,940.`;

// Harrowgate Bakery (simple example), 2027
const HB = { ni: 42000, dep: 9000, ar: 3000, inv: -1500, prepaid: 400, ap: 2200, wages: -800 };
HB.cfo = HB.ni + HB.dep - HB.ar - HB.inv - HB.prepaid + HB.ap + HB.wages;

// Blackthorn Print Works (challenging example): balances at 31 December 2026 and 2027, and 2027’s results
const BT = {
  cash: [18400, null], ar: [19800, 24600], inv: [17000, 15200], prepaid: [2100, 2400], equip: [160000, 186000], accDep: [64000, 71000],
  ap: [14900, 12300], wages: [2600, 3100], intPay: [1100, 900], taxPay: [1900, 2800], divPay: [2000, 3000], current: [10000, 12000], ltd: [40000, 48000], stock: [50000, 50000], re: [30800, null],
  sales: 412000, cogs: 236000, wagesExp: 88000, depreciation: 22000, rent: 18000, other: 14500, gain: 2500, interest: 5000, taxRate: 0.25,
  sold: { cost: 24000, accDep: 15000, proceeds: 11500 }, bought: { cost: 50000, cash: 30000, note: 20000 }, repaid: 10000, declared: 12000,
};
const ch = (a) => a[1] - a[0];
BT.opIncome = BT.sales - BT.cogs - BT.wagesExp - BT.depreciation - BT.rent - BT.other + BT.gain;   // 36,000: the gain is operating (ASC 360-10-45-5)
BT.pretax = BT.opIncome - BT.interest;                                                  // 31,000
BT.tax = BT.pretax * BT.taxRate;                                                        // 7,750
BT.ni = BT.pretax - BT.tax;                                                             // 23,250
BT.re[1] = BT.re[0] + BT.ni - BT.declared;                                              // 42,050
BT.adjWC = -ch(BT.ar) - ch(BT.inv) - ch(BT.prepaid) + ch(BT.ap) + ch(BT.wages) + ch(BT.intPay) + ch(BT.taxPay);
BT.cfo = BT.ni + BT.depreciation - BT.gain + BT.adjWC;                                  // 38,050
BT.cfi = BT.sold.proceeds - BT.bought.cash;                                             // −18,500
BT.divPaid = BT.declared - ch(BT.divPay);                                               // 11,000
BT.cff = -BT.repaid - BT.divPaid;                                                       // −21,000
BT.net = BT.cfo + BT.cfi + BT.cff;                                                      // −1,450
BT.cash[1] = BT.cash[0] + BT.net;                                                       // 16,950
const tot = (i) => ({
  assets: BT.cash[i] + BT.ar[i] + BT.inv[i] + BT.prepaid[i] + BT.equip[i] - BT.accDep[i],
  liab: BT.ap[i] + BT.wages[i] + BT.intPay[i] + BT.taxPay[i] + BT.divPay[i] + BT.current[i] + BT.ltd[i],
  equity: BT.stock[i] + BT.re[i],
});
const T0 = tot(0), T1 = tot(1);
const fmt = (v) => (v < 0 ? `(${Math.abs(v).toLocaleString('en-US')})` : v.toLocaleString('en-US'));
const btRow = (name, a, neg = false) => [name, fmt(neg ? -a[0] : a[0]), fmt(neg ? -a[1] : a[1])];

// Tallowmere Candle Co. (applied example), 2027
const TC = { ni: 48000, dep: 6000, ar: [4000, 45000], inv: [22000, 60000], ap: [11000, 20000], cashStart: 35000, capex: 8000, dividend: 20000 };
TC.cfo = TC.ni + TC.dep - ch(TC.ar) - ch(TC.inv) + ch(TC.ap);                          // −16,000
TC.absorbed = ch(TC.ar) + ch(TC.inv) - ch(TC.ap);                                       // 70,000
TC.cashEnd = TC.cashStart + TC.cfo - TC.capex;                                          // 11,000

// Blackthorn’s 2028 forecast (application)
const FC = { ni: 26000, dep: 24000, ar: 5000, debt: BT.current[1], capex: 15000, div: 12000, divHigh: 20000 };
FC.cfo = FC.ni + FC.dep - FC.ar;                                                        // 45,000
FC.left = FC.cfo - FC.debt - FC.capex - FC.div;                                         // 6,000

export default {
  slug: 'indirect-method',
  title: 'The indirect method',
  blurb: 'Start from net income and reach cash from operating activities: add back noncash expenses, take out gains and losses, adjust for every change in operating working capital, then prepare a full statement from two balance sheets and reconcile it with the direct method.',
  status: 'reviewed',
  objectives: [
    'Explain why each adjustment in the indirect method is added or subtracted, using the accounting equation.',
    'Calculate net cash from operating activities by the indirect method, including noncash expenses, gains and losses, and changes in operating current assets and liabilities.',
    'Prepare a complete statement of cash flows from comparative balance sheets, an income statement and notes, including a disposal at a gain and a current portion of long-term debt.',
    'Reconcile the indirect method with the direct method, line by line.',
    'Identify and correct common errors, such as treating depreciation as a source of cash or reversing the sign of a working-capital change.',
  ],
  prerequisites: [
    { lesson: 'f02/cash-flow-statement', why: 'The three activities, the classification rules and the direct method come from there.' },
    { lesson: 'f02/long-lived-assets', why: 'Depreciation and the gain or loss on a disposal are the main noncash adjustments.' },
    { lesson: 'f02/balance-sheet-and-equity', why: 'The method reads the changes between two classified balance sheets, including the current portion of long-term debt.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s accountant has prepared the direct-method statement, but US GAAP also asks for a reconciliation of net income to net cash from operating activities, in a separate schedule when the direct method is used (ASC 230-10-45-30). Ana has a question of her own. The income statement says Lantern earned $27,387; the statement of cash flows says operations brought in $39,940. Which items explain the $12,553 between them?' },
    { p: 'The <g>indirect method</g> answers Ana’s question directly. It starts from net income and adjusts it, item by item, until it reaches net cash from operating activities, so each adjustment names one reason why profit and operating cash differ. Only the operating section changes: the investing and financing sections are the same whichever method is used. Most companies present their operating cash flows this way.' },
    { p: 'The adjustments come in three kinds.' },
    { ol: [
      '<b>Noncash expenses.</b> Depreciation, amortisation and similar charges reduce net income but use no cash in the period. Each is an <g>add-back</g>: it is added to net income.',
      '<b>Gains and losses on investing and financing transactions.</b> When equipment is sold, the whole cash proceeds are an investing inflow. The gain is also in net income, so it is subtracted; a loss is added back.',
      '<b>Changes in <g>operating working capital</g>.</b> Each operating current asset other than cash, and each operating current liability, changes during the year. Each change means that cash and net income moved by different amounts, and the adjustment corrects for it.',
    ] },
    { h: 'Why the signs are what they are' },
    { p: 'Students often try to memorise the signs. It is quicker to derive them from the accounting equation you met in F01. Split assets into cash and everything else, and move everything else to the other side:' },
    { math: String.raw`\text{Cash} = \text{Liabilities} + \text{Equity} - \text{Noncash assets}` },
    { math: String.raw`\Delta\text{Cash} = \Delta\text{Liabilities} + \Delta\text{Equity} - \Delta\text{Noncash assets}` },
    { p: 'Read the second line as a rule. An increase in a noncash asset must have been paid for with cash unless a liability or equity grew to fund it, so it subtracts from cash. An increase in a liability means the business kept cash it would otherwise have paid out, or received cash it hasn’t yet earned, so it adds. Equity grows by net income, the starting point. The indirect method applies this identity to the operating accounts; the noncurrent assets go to investing, and debt, stock and dividends to financing.' },
    { table: {
      caption: 'The four sign rules',
      head: ['Change during the year', 'Adjustment', 'Why', 'Lantern'],
      align: ['l', 'l', 'l', 'l'],
      rows: [
        ['Operating current asset up (receivables, inventory, prepayments)', 'Subtract', 'Revenue recorded but not yet collected, or cash spent on items not yet expensed', 'Inventory up $5,800: beans bought, not yet sold'],
        ['Operating current asset down', 'Add', 'Earlier sales collected, or items paid for earlier now expensed', 'None: every balance started at zero'],
        ['Operating current liability up (payables, accruals, unearned revenue, taxes payable)', 'Add', 'Expenses recorded but not yet paid, or cash received before it is earned', 'Accounts payable up $9,210: bills not yet paid'],
        ['Operating current liability down', 'Subtract', 'Earlier expenses paid now, or revenue earned from cash received earlier', 'None in the first year'],
      ],
    } },
    { figure: {
      svg: bridgeSVG,
      caption: 'Lantern’s first year: from net income to net cash from operating activities (fictional figures in dollars).',
      alt: bridgeAlt,
    } },
    { callout: 'key', title: 'Depreciation is not a source of cash', html: 'Adding back depreciation doesn’t create cash; it removes an expense that used no cash this period. The cash for Lantern’s equipment and van left as investing outflows when they were bought. Had Lantern’s depreciation been $4,800 higher, net income would have been $4,800 lower and the add-back $4,800 higher, leaving operating cash flow unchanged (before any effect on income tax).' },
  ],

  theory: [
    { h: 'The method, step by step' },
    { ol: [
      'Start with net income from the income statement.',
      'Add back noncash expenses: depreciation, amortisation and impairment losses.',
      'Subtract gains and add back losses on selling long-term assets or settling debt; the cash from those transactions belongs to investing or financing.',
      'Adjust for the change in each operating current asset other than cash and each operating current liability: subtract increases in assets and decreases in liabilities; add decreases in assets and increases in liabilities.',
      'Leave out current items that belong to other activities: the current portion of long-term debt, short-term bank loans and dividends payable (financing), and short-term investments and loans made to others (investing).',
      'The total is net cash from operating activities. Prepare the investing and financing sections from the changes in the noncurrent accounts and the financing items, using the notes to find what the balances hide.',
    ] },
    { h: 'Lantern’s first year by the indirect method' },
    { p: 'Lantern’s reconciliation is below. Lantern began trading on 1 March 2026, so every opening balance is zero and each change equals the balance at 31 December. That is a feature of a first year only: in every later year you subtract the opening balance from the closing one.' },
    { statement: S.cashIndirect },
    { p: 'Three lines need comment. Receivables are taken net of the allowance (<m>7{,}380 - 584 = 6{,}796</m>), so bad debt expense of $1,404 is already inside that line and is not added back separately. The increase in inventory of $5,800 is measured after the $400 write-down to net realisable value (adjustment e7), so the write-down, though a noncash expense, needs no separate add-back either. Accounts payable rose $9,210: $8,400 for beans, $520 for supplies and the $290 December utility bill.' },
    { p: 'Two kinds of current liability are left out on purpose. The $5,000 current portion of the van note arose by reclassifying long-term debt (adjustment e8): no cash moved, and repaying it will be a financing outflow. Lantern has no dividends payable, but a dividend declared and not yet paid would be a financing item too. Putting either in the reconciliation would mix financing into operating cash flow.' },
    { h: 'Reconciling the two methods' },
    { p: 'The direct and indirect methods are two arrangements of the same arithmetic. Adjust each income statement line to cash and you have the direct method; add up the same adjustments by balance sheet account instead and you have the indirect method. The table shows Lantern’s year both ways.' },
    { table: reconciliation },
    { p: 'Read down the middle column and you have the indirect method’s adjustments, grouped by income statement line. Regroup them by balance sheet account and you get the lines of Lantern’s reconciliation. The revenue adjustment (−7,380 for receivables, −820 for the write-off, +6,100 for unearned revenue) and the bad debt add-back become the net receivables line, <m>-7{,}380 - 820 + 1{,}404 = -6{,}796</m>, and the unearned revenue line, +6,100. The supplier adjustment becomes the inventory, supplies, prepaid insurance and payables lines: <m>-5{,}800 - 640 - 300 + 9{,}210 = 2{,}470</m>. Both routes total $39,940.' },
    { callout: 'standards', title: 'Presenting the reconciliation', html: 'US GAAP requires the reconciliation of net income to net cash from operating activities whichever method is used (ASC 230-10-45-29). With the direct method it goes in a separate schedule (45-30); with the indirect method it may be shown within the statement or in a separate schedule, with the reconciling items clearly identified (45-31 and 45-32). A company that uses the indirect method must also disclose the interest and income taxes it paid (ASC 230-10-50-2). Under IAS 7 the indirect method starts from profit or loss today; the IFRS 18 amendments, effective for annual periods beginning on or after 1 January 2027, make the starting point operating profit or loss instead.' },
    { h: 'A later year: opening balances, a disposal and the current portion of debt' },
    { p: 'From the second year on, every adjustment is a change between two balance sheets. The investing and financing sections also need some reconstruction, because a balance sheet shows only the net effect of purchases, disposals, borrowing and repayments. The tool is a roll-forward of each account: opening balance plus additions minus reductions equals closing balance. Know three of the four, and you can find the fourth.' },
    { list: [
      '<b>Equipment:</b> opening cost + purchases − cost of assets sold = closing cost.',
      '<b>Accumulated depreciation:</b> opening + depreciation expense − accumulated depreciation on assets sold = closing.',
      '<b>Debt:</b> opening total (current portion + noncurrent) + new borrowing − repayments = closing total. Moving next year’s instalment from noncurrent to current changes neither total and involves no cash.',
      '<b>Retained earnings and dividends:</b> opening + net income − dividends declared = closing; dividends paid = dividends declared − the increase in dividends payable.',
    ] },
    { p: 'Gains and losses complete the picture. When a business sells equipment, the cash proceeds equal its book value plus any gain, or minus any loss, and the whole amount is an investing inflow. The gain is also inside net income, so the indirect method subtracts it; otherwise it would be counted twice, once in operating and once in investing. A loss is added back for the same reason. The challenging example below works through a full year for a business with all of these features.' },
    { p: 'One more source of information matters: the notes. They tell you about transactions the balances blur, such as equipment bought partly with a note to the seller. Under ASC 230-10-45-13(c) that note is a financing transaction with no cash, disclosed as a noncash activity, and the principal paid on it later is a financing outflow. Without the note you would see only the net increase in equipment and in debt, and might report both as cash flows.' },
    { h: 'Checking a reconciliation' },
    { p: 'A statement of cash flows prepared from two balance sheets has a built-in test: every change in every balance sheet account must be used exactly once. Each change goes to one of four places: the operating section (through net income or a working-capital line), the investing section, the financing section, or the noncash disclosure. An account left out, or used twice, shows up as a closing cash figure that disagrees with the balance sheet.' },
    { p: 'Preparers often lay this out as a worksheet: list the balance sheet accounts with their opening and closing balances, explain each change, and tick it off. For Blackthorn, the $26,000 increase in equipment is explained by the $50,000 press less the $24,000 press sold; the $50,000 splits into $30,000 of investing cash and a $20,000 noncash note. The $7,000 increase in accumulated depreciation is $22,000 of depreciation (operating, added back) less the $15,000 removed on the sale. Debt rose $2,000 on the current line and $8,000 on the noncurrent line, and neither change is a cash flow by itself: total debt rose $10,000, made up of the $20,000 note (noncash) less the $10,000 repaid (financing).' },
    { p: 'A second test compares the two methods. If a business presents the direct method, its operating total must equal the reconciliation’s; if it presents the indirect method, deriving the main direct-method lines (cash from customers, cash paid to suppliers) is a quick check on the working-capital lines. Lantern’s accountant does both: $39,940 by each route.' },
  ],

  formulas: [
    { id: 'indirect-cfo', name: 'Net cash from operating activities (indirect method)',
      tex: String.raw`\text{CFO} = \text{NI} + \text{Noncash expenses} + \text{Losses} - \text{Gains} - \Delta\text{CA}_{\text{op}} + \Delta\text{CL}_{\text{op}}`,
      where: [
        [String.raw`\text{CFO}`, 'Net cash from operating activities', '$'],
        [String.raw`\text{NI}`, 'Net income for the period', '$'],
        [String.raw`\text{Noncash expenses}`, 'Depreciation, amortisation, impairment and similar charges', '$'],
        [String.raw`\text{Losses},\ \text{Gains}`, 'Losses and gains on selling long-term assets or settling debt', '$'],
        [String.raw`\Delta\text{CA}_{\text{op}}`, 'Closing minus opening operating current assets other than cash (receivables net of the allowance, inventory, prepayments)', '$'],
        [String.raw`\Delta\text{CL}_{\text{op}}`, 'Closing minus opening operating current liabilities (payables, accruals, unearned revenue, income taxes payable)', '$'],
      ],
      assumptions: 'Current items that belong to investing or financing (current portion of long-term debt, dividends payable, short-term loans and investments) are excluded.',
      note: 'Lantern: <m>27{,}387 + 4{,}800 - 13{,}536 + 21{,}289 = 39{,}940</m>.' },
    { id: 'cash-identity', name: 'The change in cash from the balance sheet',
      tex: String.raw`\Delta\text{Cash} = \Delta\text{Liabilities} + \Delta\text{Equity} - \Delta\text{Noncash assets}`,
      where: [
        [String.raw`\Delta`, 'Closing balance minus opening balance', ''],
        [String.raw`\text{Noncash assets}`, 'Every asset except cash and cash equivalents, net of contra accounts', '$'],
      ],
      note: 'The source of every sign rule: assets other than cash subtract, liabilities and equity add.' },
    { id: 'sale-proceeds', name: 'Cash proceeds from selling a long-term asset',
      tex: String.raw`\text{Proceeds} = (\text{Cost} - \text{Accumulated depreciation}) + \text{Gain} - \text{Loss}`,
      where: [
        [String.raw`\text{Cost} - \text{Accumulated depreciation}`, 'The asset’s book value at the date of sale', '$'],
        [String.raw`\text{Gain},\ \text{Loss}`, 'The gain or loss recorded on the sale (only one is non-zero)', '$'],
        [String.raw`\text{Proceeds}`, 'Cash received: an investing inflow', '$'],
      ],
      note: 'Blackthorn’s press: <m>(24{,}000 - 15{,}000) + 2{,}500 = 11{,}500</m>.' },
    { id: 'roll-forward', name: 'Account roll-forward',
      tex: String.raw`\text{Closing} = \text{Opening} + \text{Additions} - \text{Reductions}`,
      where: [
        [String.raw`\text{Opening},\ \text{Closing}`, 'The account’s balances on the two balance sheets', '$'],
        [String.raw`\text{Additions},\ \text{Reductions}`, 'What increased and decreased the account during the year (purchases and disposals, borrowing and repayments, net income and dividends)', '$'],
      ],
      note: 'Used to find the missing figure, such as purchases of equipment or dividends paid.' },
  ],

  examples: [
    { level: 'simple', title: 'A bakery’s reconciliation', fictional: true,
      setup: 'Harrowgate Bakery, a fictional business, reports net income of $42,000 for 2027 after depreciation of $9,000. During the year its accounts receivable from cafés rose by $3,000, inventory fell by $1,500, prepaid rent rose by $400, accounts payable to flour and dairy suppliers rose by $2,200 and wages payable fell by $800. Find net cash from operating activities by the indirect method.',
      steps: [
        'Start with net income, $42,000, and add back depreciation, a noncash expense: <m>42{,}000 + 9{,}000 = 51{,}000</m>.',
        'Current assets: receivables up 3,000, subtract (sales not yet collected); inventory down 1,500, add (flour used that was paid for earlier); prepaid rent up 400, subtract (cash paid ahead of the expense).',
        'Current liabilities: payables up 2,200, add (supplies used, not yet paid); wages payable down 800, subtract (last year’s wages paid this year).',
        'Total: <m>51{,}000 - 3{,}000 + 1{,}500 - 400 + 2{,}200 - 800 = 50{,}500</m>.',
      ],
      statement: {
        title: 'Harrowgate Bakery',
        subtitle: 'Cash flows from operating activities for the year ended 31 December 2027 (indirect method)',
        sections: [
          { rows: [['Net income', 42000], ['Depreciation', 9000], ['Increase in accounts receivable', -3000], ['Decrease in inventory', 1500], ['Increase in prepaid rent', -400], ['Increase in accounts payable', 2200], ['Decrease in wages payable', -800]], total: ['Net cash from operating activities', 50500] },
        ],
        note: 'Fictional figures.',
      },
      answer: 'Net cash from operating activities is $50,500.',
      interpretation: 'Operating cash exceeds net income by $8,500, mostly because depreciation used no cash; the working-capital changes nearly cancel out (−$500 in total).' },
    { level: 'challenging', title: 'A full statement for a later year', fictional: true,
      setup: 'Blackthorn Print Works, a fictional company, reports under US GAAP. Its 2027 income statement shows sales $412,000; cost of goods sold $236,000; wages $88,000; depreciation $22,000; rent $18,000; other operating expenses $14,500; a gain on sale of equipment of $2,500; interest expense $5,000; income tax at 25%. The notes say: an old press that cost $24,000, with accumulated depreciation of $15,000, was sold for $11,500 in cash; a new digital press costing $50,000 was bought for $30,000 in cash and a $20,000 note to the manufacturer; the bank loan’s $10,000 instalment due in 2027 was paid; dividends of $12,000 were declared. Prepare the 2027 statement of cash flows by the indirect method.',
      table: {
        caption: 'Blackthorn Print Works: balance sheets at 31 December (fictional)',
        head: ['', '2026 ($)', '2027 ($)'],
        align: ['l', 'r', 'r'],
        rows: [
          btRow('Cash', BT.cash), btRow('Accounts receivable, net', BT.ar), btRow('Inventory', BT.inv), btRow('Prepaid insurance', BT.prepaid),
          btRow('Equipment', BT.equip), btRow('Accumulated depreciation', BT.accDep, true),
          ['Total assets', fmt(T0.assets), fmt(T1.assets)],
          btRow('Accounts payable', BT.ap), btRow('Wages payable', BT.wages), btRow('Interest payable', BT.intPay), btRow('Income taxes payable', BT.taxPay),
          btRow('Dividends payable', BT.divPay), btRow('Current portion of long-term debt', BT.current), btRow('Long-term debt', BT.ltd),
          btRow('Common stock', BT.stock), btRow('Retained earnings', BT.re),
          ['Total liabilities and equity', fmt(T0.liab + T0.equity), fmt(T1.liab + T1.equity)],
        ],
      },
      steps: [
        'Net income: operating income, which includes the gain on the press, is <m>412{,}000 - 236{,}000 - 88{,}000 - 22{,}000 - 18{,}000 - 14{,}500 + 2{,}500 = 36{,}000</m>; income before tax <m>36{,}000 - 5{,}000 = 31{,}000</m>; tax <m>31{,}000 \\times 0.25 = 7{,}750</m>; net income 23,250.',
        'Noncash items and the gain: add depreciation 22,000; subtract the gain 2,500, because its cash is in the $11,500 of proceeds. Check the gain: <m>11{,}500 - (24{,}000 - 15{,}000) = 2{,}500</m>.',
        'Working capital, each as closing minus opening: receivables +4,800 (subtract), inventory −1,800 (add), prepaid insurance +300 (subtract), payables −2,600 (subtract), wages payable +500 (add), interest payable −200 (subtract), income taxes payable +900 (add): net <m>-4{,}700</m>. Dividends payable and the current portion of debt are financing items and are left out.',
        'Operating: <m>23{,}250 + 22{,}000 - 2{,}500 - 4{,}700 = 38{,}050</m>.',
        'Investing: proceeds 11,500 less the cash part of the new press, 30,000: <m>-18{,}500</m>. Roll-forwards confirm the notes: equipment <m>160{,}000 + 50{,}000 - 24{,}000 = 186{,}000</m>; accumulated depreciation <m>64{,}000 + 22{,}000 - 15{,}000 = 71{,}000</m>.',
        'Financing: debt <m>50{,}000 + 20{,}000 - 10{,}000 = 60{,}000 = 12{,}000 + 48{,}000</m>, so the only cash was the 10,000 repaid; dividends paid <m>12{,}000 - (3{,}000 - 2{,}000) = 11{,}000</m>. Financing: <m>-10{,}000 - 11{,}000 = -21{,}000</m>.',
        'Net change <m>38{,}050 - 18{,}500 - 21{,}000 = -1{,}450</m>; closing cash <m>18{,}400 - 1{,}450 = 16{,}950</m>, which agrees with the balance sheet.',
      ],
      statement: {
        title: 'Blackthorn Print Works',
        subtitle: 'Statement of cash flows for the year ended 31 December 2027 (indirect method)',
        sections: [
          { head: 'Operating activities', rows: [['Net income', 23250], ['Depreciation', 22000], ['Gain on sale of equipment', -2500], ['Increase in accounts receivable', -4800], ['Decrease in inventory', 1800], ['Increase in prepaid insurance', -300], ['Decrease in accounts payable', -2600], ['Increase in wages payable', 500], ['Decrease in interest payable', -200], ['Increase in income taxes payable', 900]], total: ['Net cash from operating activities', 38050] },
          { head: 'Investing activities', rows: [['Proceeds from sale of equipment', 11500], ['Purchase of equipment', -30000]], total: ['Net cash used in investing activities', -18500] },
          { head: 'Financing activities', rows: [['Repayment of long-term debt', -10000], ['Dividends paid', -11000]], total: ['Net cash used in financing activities', -21000] },
          { rows: [['Net decrease in cash', -1450], ['Cash, 1 January 2027', 18400]], total: ['Cash, 31 December 2027', 16950] },
        ],
        note: 'Noncash investing and financing: a press costing $50,000 was acquired for $30,000 in cash (shown in investing) and a $20,000 note payable to the manufacturer. Supplemental: interest paid $5,200; income taxes paid $6,850. Fictional figures.',
      },
      answer: 'Operating $38,050; investing ($18,500); financing ($21,000); net decrease $1,450; cash falls from $18,400 to $16,950. The $20,000 note is disclosed, and interest paid ($5,200) and taxes paid ($6,850) are given as supplemental information.',
      interpretation: 'A profitable year ended with less cash because Blackthorn invested $30,000 in a new press, repaid $10,000 of debt and paid $11,000 of dividends, together more than operations and the old press’s sale produced. The current portion rose from $10,000 to $12,000 without any cash moving: next year’s instalments now include the new note.' },
    { level: 'applied', title: 'Profitable, growing and short of cash', fictional: true,
      setup: 'Tallowmere Candle Co., a fictional online candle maker, began selling to gift shops on 60-day terms in 2027. Its net income rose to $48,000, after depreciation of $6,000. During the year its receivables rose from $4,000 to $45,000, its inventory from $22,000 to $60,000 for the holiday season, and its accounts payable from $11,000 to $20,000. It started the year with $35,000 of cash, spent $8,000 on a new pouring machine and has no borrowing. The owner wants to pay herself a $20,000 dividend in January “because we made $48,000”. Should she?',
      steps: [
        'Operating cash flow: <m>48{,}000 + 6{,}000 - 41{,}000 - 38{,}000 + 9{,}000 = -16{,}000</m>. Operations used cash in a profitable year.',
        'Working capital absorbed <m>41{,}000 + 38{,}000 - 9{,}000 = 70{,}000</m>, more than net income plus depreciation (54,000): growth in receivables and stock is consuming the profit.',
        'Cash at the year end: <m>35{,}000 - 16{,}000 - 8{,}000 = 11{,}000</m>. A $20,000 dividend would need $9,000 that the business doesn’t have.',
        'What would change it: the receivables will be collected in the new year, but the shops’ next orders will need stock first. Shorter terms, a smaller holiday stock or a bank line of credit would release or provide cash.',
      ],
      answer: 'Not now. The business earned $48,000 but its operations used $16,000 of cash and it ends the year with $11,000, less than the dividend. Pay a dividend after the holiday receivables are collected, or arrange financing first.',
      interpretation: 'Net income is the wrong figure for a dividend decision: it says the business is profitable, not that it has cash. The indirect method shows exactly where the profit went, into $41,000 of customers’ debts and $38,000 of candles.' },
  ],

  demo: [
    { widget: 'ind-bridge', intro: 'Start from Lantern’s first year, with the small current items grouped. Change one line at a time and watch which direction it moves operating cash flow; set a working-capital change negative to see a decrease reverse the sign.' },
    { widget: 'ind-sale', intro: 'Sell a piece of equipment for more or less than its book value. However the sale is split between the gain or loss and the book value, operating cash flow is unchanged and the investing inflow is the cash received.' },
  ],

  mistakes: [
    { title: '“Depreciation is a source of cash.”', html: 'Depreciation is added back because it reduced net income without using cash this period; the add-back undoes the expense and creates no cash. The cash left when the asset was bought, as an investing outflow. Recording more depreciation can’t raise operating cash flow, apart from any effect on the tax bill.' },
    { title: '“Receivables went up, so add the increase.”', html: 'An increase in a current asset is subtracted: revenue was recorded but the cash hasn’t arrived. When a sign is in doubt, use the identity <m>\\Delta\\text{Cash} = \\Delta\\text{Liabilities} + \\Delta\\text{Equity} - \\Delta\\text{Noncash assets}</m>: assets other than cash enter with a minus sign, liabilities with a plus.' },
    { title: '“The current portion of long-term debt is a current liability, so it belongs in the working-capital adjustments.”', html: 'It is debt, and borrowing and repaying are financing; moving an instalment from noncurrent to current involves no cash at all. Dividends payable and short-term bank loans are financing items too. Lantern’s $5,000 current portion is left out of its reconciliation.' },
    { title: '“Keep the gain in net income and show the proceeds in investing as well.”', html: 'That counts the gain twice. Subtract the gain (or add back a loss) in the operating section and show the full proceeds in investing. Blackthorn subtracts its $2,500 gain and reports $11,500 of proceeds.' },
    { title: '“Add back bad debt expense and the inventory write-down too.”', html: 'Not when, as in Lantern’s reconciliation, receivables are taken net of the allowance and inventory after the write-down: both charges are already inside those changes, and adding them back counts them twice. If you start from gross receivables instead, the matching adjustment is the increase in the allowance (bad debt expense less write-offs, <m>1{,}404 - 820 = 584</m>), not the whole expense; if inventory is measured before a write-down, add the write-down back.' },
    { title: '“The changes are the closing balances.”', html: 'Only when every opening balance is zero, as in Lantern’s first year. Blackthorn’s receivables rose from $19,800 to $24,600, so the adjustment is −$4,800, not −$24,600.' },
  ],

  application: [
    { p: '<b>Explaining a fall in cash.</b> Blackthorn’s owner asks why cash fell by $1,450 in 2027 when the business earned $23,250. The controller answers from the statement in the challenging example. Operations generated $38,050, more than net income because depreciation is a large noncash expense for a printer. The new press used $30,000 of cash, offset by $11,500 from selling the old one, the bank took $10,000 and dividends $11,000. The business is not losing money; it is investing and repaying debt slightly faster than operations replace the cash.' },
    { p: '<b>Forecasting next year.</b> The same structure turns a profit forecast into a cash forecast. For 2028 the controller expects net income of about $26,000 and depreciation of $24,000, and expects receivables to grow by $5,000 with sales, so forecast operating cash flow is about <m>26{,}000 + 24{,}000 - 5{,}000 = 45{,}000</m>. Against it stand the $12,000 of debt due in 2028 (the current portion), $15,000 of planned equipment and the dividends. Holding dividends at $12,000 leaves <m>45{,}000 - 12{,}000 - 15{,}000 - 12{,}000 = 6{,}000</m> to rebuild cash; raising them to $20,000 would mean another fall. The controller recommends keeping the dividend at $12,000 for another year.' },
    { p: '<b>Reading someone else’s reconciliation.</b> Lenders and analysts read the indirect method for what it reveals about earnings. Working-capital adjustments that keep going the same way, such as receivables rising faster than sales year after year, suggest that profit is not turning into cash. A large operating cash flow that comes from stretching payables will reverse when suppliers insist on being paid, while one that comes from depreciation on a stable asset base is more likely to recur. The ratios that measure these patterns belong to F03; the reconciliation is where the evidence sits.' },
  ],

  summary: [
    'The indirect method starts from net income and adds or subtracts the items that make it differ from operating cash: noncash expenses, gains and losses on investing and financing transactions, and changes in operating working capital.',
    'The signs follow from ΔCash = ΔLiabilities + ΔEquity − ΔNoncash assets: subtract increases in operating current assets, add increases in operating current liabilities, and the reverse for decreases.',
    'Lantern’s first year: $27,387 of net income, $4,800 of depreciation and $7,753 of net working-capital changes give $39,940; opening balances were zero, so each change is the closing balance.',
    'The direct and indirect methods are the same arithmetic grouped differently; both give Lantern $39,940, and US GAAP requires the reconciliation whichever is presented.',
    'Leave financing and investing items out of the working-capital adjustments: the current portion of long-term debt, dividends payable, short-term loans and investments.',
    'In a later year, roll each noncurrent account forward to find purchases, disposals, borrowing, repayments and dividends; subtract a gain, add back a loss, and report the full proceeds in investing.',
    'Depreciation is not a source of cash, and profit is not cash: a growing business can be profitable and still run short of cash.',
  ],

  glossary: [
    { term: 'Noncash expense', def: 'An expense that reduces net income without any cash payment in the period, such as depreciation, amortisation or an impairment loss. The indirect method adds it back.' },
    { term: 'Add-back', def: 'An amount added to net income in the indirect method because it reduced net income without reducing cash in the period, such as depreciation or a loss on the sale of equipment.' },
    { term: 'Operating working capital', def: 'The current assets other than cash and the current liabilities that arise from day-to-day operations: receivables, inventory, prepayments, accounts payable, accrued expenses, unearned revenue and income taxes payable. Current items that belong to investing or financing, such as short-term investments, the current portion of long-term debt and dividends payable, are excluded.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 16.1, “Explain the Purpose of the Statement of Cash Flows”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/16-1-explain-the-purpose-of-the-statement-of-cash-flows', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 16.3, “Prepare the Statement of Cash Flows Using the Indirect Method”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/16-3-prepare-the-statement-of-cash-flows-using-the-indirect-method', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 16.6, “Appendix: Prepare a Completed Statement of Cash Flows Using the Direct Method”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/16-6-appendix-prepare-a-completed-statement-of-cash-flows-using-the-direct-method', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Statement of Cash Flows</i>, section 3.1, “Form and Content of the Statement of Cash Flows” (ASC 230-10-45-28 to 45-32 and 50-2). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/presentation/asc230-10/roadmap-statement-cash-flow/chapter-3-format-presentation/3-1-form-content-statement-cash', checked: '2026-10-23' },
    { text: 'KPMG LLP (2026). <i>Statement of cash flows: Handbook, US GAAP</i> (March 2026), including ASC 230-10-45-13(c) on debt incurred to the seller and 45-15(b) on repayments.', url: 'https://kpmg.com/kpmg-us/content/dam/kpmg/frv/pdf/2026/statement-cash-flows.pdf', checked: '2026-10-23' },
    { text: 'Boissou, V. &amp; Ahuja, K. (2026). “IFRS 18 changes the statement of cash flows”. KPMG IFRS Institute, 1 June 2026.', url: 'https://kpmg.com/us/en/articles/2026/ifrs-18-changes-statement-cash-flows.html', checked: '2026-10-23' },
  ],

  checks: [
    // Lantern headline figures
    { what: 'Net income', value: D.netIncome, shown: 27387 },
    { what: 'Operating cash (direct, case)', value: D.cfo, shown: 39940 },
    { what: 'Operating cash (indirect, case)', value: D.cfoIndirect, shown: 39940 },
    { what: 'Indirect total (engine)', value: IND.operating, shown: 39940 },
    { what: 'Gap between them', value: LT.totalAdj, shown: 12553 },
    { what: 'Depreciation', value: D.depreciation, shown: 4800 },
    { what: 'Depreciation add-back (engine)', value: IND.adjustments.find((r) => /Depreciation/.test(r[0]))[1], shown: 4800 },
    { what: 'Receivables (net) line', value: wc('Increase in accounts receivable (net)'), shown: -6796 },
    { what: 'Inventory line', value: wc('Increase in inventory'), shown: -5800 },
    { what: 'Supplies line', value: wc('Increase in supplies'), shown: -640 },
    { what: 'Prepaid insurance line', value: wc('Increase in prepaid insurance'), shown: -300 },
    { what: 'Accounts payable line', value: wc('Increase in accounts payable'), shown: 9210 },
    { what: 'Wages payable line', value: wc('Increase in wages payable'), shown: 2100 },
    { what: 'Interest payable line', value: wc('Increase in interest payable'), shown: 750 },
    { what: 'Unearned revenue line', value: wc('Increase in unearned revenue'), shown: 6100 },
    { what: 'Income taxes payable line', value: wc('Increase in income taxes payable'), shown: 3129 },
    { what: 'Receivables gross', value: LT.arGross, shown: 7380 },
    { what: 'Allowance', value: LT.allowance, shown: 584 },
    { what: 'Receivables net', value: LT.arGross - LT.allowance, shown: 6796 },
    { what: 'Bad debt expense', value: D.badDebt, shown: 1404 },
    { what: 'Inventory write-down', value: F.inventory.writeDown, shown: 400 },
    { what: 'Payables: beans', value: F.inventory.purchases - F.inventory.paid, shown: 8400 },
    { what: 'Payables: supplies', value: F.supplies.bought - F.supplies.paid, shown: 520 },
    { what: 'Payables: utilities', value: F.utilities.unpaid, shown: 290 },
    { what: 'Current portion of the van note', value: bal('Current Portion of Long-Term Debt'), shown: 5000 },
    { what: 'Working-capital lines total', value: IND.workingCapital.reduce((s, r) => s + r[1], 0), shown: 7753 },
    { what: 'Formula note: current assets', value: -(LT.arNet + bal('Inventory') + bal('Supplies') + bal('Prepaid Insurance')), shown: -13536 },
    { what: 'Formula note: current liabilities', value: bal('Accounts Payable') + bal('Wages Payable') + bal('Interest Payable') + bal('Unearned Revenue') + bal('Income Taxes Payable'), shown: 21289 },
    { what: 'Formula note: total', value: D.netIncome + D.depreciation - 13536 + 21289, shown: 39940 },
    // reconciliation table
    { what: 'Net revenue', value: D.revenue, shown: 193320 },
    { what: 'Revenue adjustment', value: LT.adjCustomers, shown: -2100 },
    { what: 'Cash from customers', value: LT.customers, shown: 191220 },
    { what: 'Supplier-type expenses', value: LT.supplierExpenses, shown: 105800 },
    { what: 'Supplier adjustment', value: LT.adjSuppliers, shown: 2470 },
    { what: 'Cash to suppliers', value: LT.suppliers, shown: 103330 },
    { what: 'Wages', value: LT.wages, shown: 43600 },
    { what: 'Wages adjustment', value: LT.wages - LT.employees, shown: 2100 },
    { what: 'Cash to employees', value: LT.employees, shown: 41500 },
    { what: 'Interest expense', value: D.interestExpense, shown: 1200 },
    { what: 'Interest adjustment', value: D.interestExpense - LT.interestPaid, shown: 750 },
    { what: 'Interest paid', value: LT.interestPaid, shown: 450 },
    { what: 'Income tax', value: D.incomeTax, shown: 9129 },
    { what: 'Tax adjustment', value: D.incomeTax - LT.taxPaid, shown: 3129 },
    { what: 'Tax paid', value: LT.taxPaid, shown: 6000 },
    { what: 'Accrual column = net income', value: D.revenue - LT.supplierExpenses - LT.wages - D.interestExpense - D.incomeTax - D.depreciation - D.badDebt, shown: 27387 },
    { what: 'Adjustment column', value: LT.adjCustomers + LT.adjSuppliers + 2100 + 750 + 3129 + D.depreciation + D.badDebt, shown: 12553 },
    { what: 'Cash column', value: LT.customers - LT.suppliers - LT.employees - LT.interestPaid - LT.taxPaid, shown: 39940 },
    { what: 'Regroup: receivables', value: -LT.arGross - LT.writeOff + D.badDebt, shown: -6796 },
    { what: 'Regroup: revenue adjustment parts', value: -7380 - 820 + 6100, shown: LT.adjCustomers },
    { what: 'Regroup: supplier lines', value: -bal('Inventory') - bal('Supplies') - bal('Prepaid Insurance') + bal('Accounts Payable'), shown: 2470 },
    { what: 'Unearned revenue', value: bal('Unearned Revenue'), shown: 6100 },
    { what: 'Write-off', value: LT.writeOff, shown: 820 },
    { what: 'Allowance increase', value: D.badDebt - F.catering.writtenOff, shown: 584 },
    { what: 'Allowance increase = closing allowance (opening zero)', value: LT.allowance - 0, shown: 584 },
    { what: 'Blackthorn press cost = cash + note', value: BT.bought.cash + BT.bought.note, shown: 50000 },
    // Harrowgate
    { what: 'Harrowgate after depreciation', value: HB.ni + HB.dep, shown: 51000 },
    { what: 'Harrowgate CFO', value: HB.cfo, shown: 50500 },
    { what: 'Harrowgate CFO above NI', value: HB.cfo - HB.ni, shown: 8500 },
    { what: 'Harrowgate working capital net', value: -HB.ar - HB.inv - HB.prepaid + HB.ap + HB.wages, shown: -500 },
    // Blackthorn
    { what: 'Blackthorn operating income (gain included)', value: BT.opIncome, shown: 36000 },
    { what: 'Blackthorn income before tax', value: BT.pretax, shown: 31000 },
    { what: 'Blackthorn tax', value: BT.tax, shown: 7750 },
    { what: 'Blackthorn net income', value: BT.ni, shown: 23250 },
    { what: 'Blackthorn gain', value: BT.sold.proceeds - (BT.sold.cost - BT.sold.accDep), shown: BT.gain },
    { what: 'Blackthorn book value of press', value: BT.sold.cost - BT.sold.accDep, shown: 9000 },
    { what: 'Blackthorn receivables change', value: ch(BT.ar), shown: 4800 },
    { what: 'Blackthorn inventory change', value: ch(BT.inv), shown: -1800 },
    { what: 'Blackthorn prepaid change', value: ch(BT.prepaid), shown: 300 },
    { what: 'Blackthorn payables change', value: ch(BT.ap), shown: -2600 },
    { what: 'Blackthorn wages payable change', value: ch(BT.wages), shown: 500 },
    { what: 'Blackthorn interest payable change', value: ch(BT.intPay), shown: -200 },
    { what: 'Blackthorn taxes payable change', value: ch(BT.taxPay), shown: 900 },
    { what: 'Blackthorn working capital', value: BT.adjWC, shown: -4700 },
    { what: 'Blackthorn CFO', value: BT.cfo, shown: 38050 },
    { what: 'Blackthorn CFI', value: BT.cfi, shown: -18500 },
    { what: 'Blackthorn equipment roll-forward', value: BT.equip[0] + BT.bought.cost - BT.sold.cost, shown: BT.equip[1] },
    { what: 'Blackthorn accumulated depreciation roll-forward', value: BT.accDep[0] + BT.depreciation - BT.sold.accDep, shown: BT.accDep[1] },
    { what: 'Blackthorn new press', value: BT.bought.cash + BT.bought.note, shown: 50000 },
    { what: 'Blackthorn opening debt', value: BT.current[0] + BT.ltd[0], shown: 50000 },
    { what: 'Blackthorn debt roll-forward', value: BT.current[0] + BT.ltd[0] + BT.bought.note - BT.repaid, shown: 60000 },
    { what: 'Blackthorn closing debt', value: BT.current[1] + BT.ltd[1], shown: 60000 },
    { what: 'Blackthorn dividends paid', value: BT.divPaid, shown: 11000 },
    { what: 'Blackthorn CFF', value: BT.cff, shown: -21000 },
    { what: 'Blackthorn net change', value: BT.net, shown: -1450 },
    { what: 'Blackthorn closing cash', value: BT.cash[1], shown: 16950 },
    { what: 'Blackthorn retained earnings 2027', value: BT.re[1], shown: 42050 },
    { what: 'Blackthorn 2026 balances', value: T0.assets - (T0.liab + T0.equity), shown: 0 },
    { what: 'Blackthorn 2027 balances', value: T1.assets - (T1.liab + T1.equity), shown: 0 },
    { what: 'Blackthorn total assets 2026', value: T0.assets, shown: 153300 },
    { what: 'Blackthorn total assets 2027', value: T1.assets, shown: 174150 },
    { what: 'Blackthorn interest paid', value: BT.interest - ch(BT.intPay), shown: 5200 },
    { what: 'Blackthorn taxes paid', value: BT.tax - ch(BT.taxPay), shown: 6850 },
    { what: 'Blackthorn CFO direct check', value: (BT.sales - ch(BT.ar)) - (BT.cogs + ch(BT.inv) - ch(BT.ap)) - (BT.wagesExp - ch(BT.wages)) - (BT.rent + BT.other + ch(BT.prepaid)) - (BT.interest - ch(BT.intPay)) - (BT.tax - ch(BT.taxPay)), shown: 38050 },
    { what: 'Blackthorn tax rate 25%', value: BT.taxRate * 100, shown: 25 },
    { what: 'Worksheet: equipment increase', value: ch(BT.equip), shown: 26000 },
    { what: 'Worksheet: equipment explained', value: BT.bought.cost - BT.sold.cost, shown: 26000 },
    { what: 'Worksheet: accumulated depreciation increase', value: ch(BT.accDep), shown: 7000 },
    { what: 'Worksheet: accumulated depreciation explained', value: BT.depreciation - BT.sold.accDep, shown: 7000 },
    { what: 'Worksheet: current portion change', value: ch(BT.current), shown: 2000 },
    { what: 'Worksheet: noncurrent debt change', value: ch(BT.ltd), shown: 8000 },
    { what: 'Worksheet: total debt change', value: ch(BT.current) + ch(BT.ltd), shown: 10000 },
    { what: 'Worksheet: debt explained', value: BT.bought.note - BT.repaid, shown: 10000 },
    // Tallowmere
    { what: 'Tallowmere receivables increase', value: ch(TC.ar), shown: 41000 },
    { what: 'Tallowmere inventory increase', value: ch(TC.inv), shown: 38000 },
    { what: 'Tallowmere payables increase', value: ch(TC.ap), shown: 9000 },
    { what: 'Tallowmere CFO', value: TC.cfo, shown: -16000 },
    { what: 'Tallowmere working capital absorbed', value: TC.absorbed, shown: 70000 },
    { what: 'Tallowmere NI + depreciation', value: TC.ni + TC.dep, shown: 54000 },
    { what: 'Tallowmere closing cash', value: TC.cashEnd, shown: 11000 },
    { what: 'Tallowmere shortfall for dividend', value: TC.dividend - TC.cashEnd, shown: 9000 },
    // application
    { what: 'Blackthorn cash fall', value: -BT.net, shown: 1450 },
    { what: 'Forecast CFO 2028', value: FC.cfo, shown: 45000 },
    { what: 'Forecast left after uses', value: FC.left, shown: 6000 },
    { what: 'Forecast debt due 2028', value: FC.debt, shown: 12000 },
  ],
};
