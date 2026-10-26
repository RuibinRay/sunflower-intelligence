// cash-flow-statement.js — F02 · The statement of cash flows. Content only; exercises are in cash-flow-statement.ex.js.
// Lantern’s figures come from case.js (STATEMENTS.cashDirect, DERIVED, RESULTS, LEDGER, FACTS); checks recompute them.
// Other businesses are fictional: Merrow Veterinary Clinic (simple example), Coldharbour Tile Supply (challenging),
// Pellow Roasters (application). The indirect method is the next lesson; ratios built on cash flows are F03’s.
import { FACTS as F, DERIVED as D, STATEMENTS as S, RESULTS as R, LEDGER } from './case.js?v=16';

const bal = (n) => LEDGER[n]?.balance || 0;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US')}`;
const cell = (v) => (v < 0 ? `(${Math.abs(v).toLocaleString('en-US')})` : v.toLocaleString('en-US'));   // a table cell, negatives in parentheses

// Lantern: the direct-method lines and the accrual figures they come from
const L = {
  customers: D.cashFromCustomers,                                  // 191,220
  suppliers: D.cashToSuppliers,                                    // 103,330
  employees: D.cashToEmployees,                                    // 41,500
  interest: D.interestPaid,                                        // 450
  taxes: D.incomeTaxesPaid,                                        // 6,000
  arGross: bal('Accounts Receivable'),                             // 7,380
  writeOff: F.catering.writtenOff,                                 // 820
  unearned: bal('Unearned Revenue'),                               // 6,100
  inventory: bal('Inventory'), supplies: bal('Supplies'), prepaid: bal('Prepaid Insurance'), ap: bal('Accounts Payable'),
  wages: F.wages.events + F.wages.shopAndOffice,                   // 43,600
  wagesPayable: bal('Wages Payable'), interestPayable: bal('Interest Payable'), taxPayable: bal('Income Taxes Payable'),
};
// expenses paid to suppliers: cost of sales and operating expenses, less wages, depreciation and bad debts
L.supplierExpenses = D.costOfSales - F.wages.events + D.operatingExpenses - F.wages.shopAndOffice - D.depreciation - D.badDebt;   // 105,800
L.arNet = bal('Accounts Receivable') - bal('Allowance for Doubtful Accounts');                                                   // 6,796
const [paidMarch, paidApril] = F.equipment.paid.map((p) => p.amount);                                                            // 4,000; 8,000
const conversion = {   // Lantern: from the income statement to the direct-method lines (accrual, adjustment, cash; payments negative)
  caption: 'Lantern: from the income statement to the direct-method lines',
  head: ['Line', 'Accrual amount ($)', 'Adjustments ($)', 'Cash ($)'],
  align: ['l', 'r', 'r', 'r'],
  rows: [
    ['Customers', D.revenue, L.customers],
    ['Suppliers', -L.supplierExpenses, -L.suppliers],
    ['Employees', -L.wages, -L.employees],
    ['Interest', -D.interestExpense, -L.interest],
    ['Income taxes', -D.incomeTax, -L.taxes],
  ].map(([name, accrual, cash]) => [name, cell(accrual), cell(cash - accrual), cell(cash)]),
  foot: [['Net cash from operating activities', '', '', cell(D.cfo)]],
  note: 'Fictional figures. Opening balances were zero, so each change is the 31 December balance.',
};

// The bridge from opening to closing cash, drawn from the case figures.
const bridgeSVG = (() => {
  const base = 236, top = 40, max = 45000, y = (v) => base - (v / max) * (base - top);
  const steps = [['Cash, 1 March', 0, 't'], ['Operating', D.cfo, 'f'], ['Investing', D.cfi, 'f'], ['Financing', D.cff, 'f'], ['Cash, 31 December', D.cashEnd, 't']];
  let run = 0, out = '';
  steps.forEach(([label, v, kind], i) => {
    const x = 30 + i * 122, w = 84;
    const from = kind === 't' ? 0 : run, to = kind === 't' ? v : run + v;
    const hi = Math.max(from, to), lo = Math.min(from, to);
    const fill = kind === 't' ? 'var(--series-3)' : v >= 0 ? 'var(--series-1)' : 'var(--series-2)';
    out += hi === lo
      ? `<line x1="${x}" y1="${base}" x2="${x + w}" y2="${base}" stroke="var(--series-3)" stroke-width="3"/>`
      : `<rect x="${x}" y="${y(hi).toFixed(1)}" width="${w}" height="${(y(lo) - y(hi)).toFixed(1)}" fill="${fill}"/>`;
    const amt = kind === 't' ? money(v) : `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString('en-US')}`;
    out += `<text x="${x + w / 2}" y="${(y(hi) - 8).toFixed(1)}" text-anchor="middle" fill="currentColor">${amt}</text>`;
    out += `<text x="${x + w / 2}" y="${base + 22}" text-anchor="middle" fill="currentColor">${label}</text>`;
    if (i < steps.length - 1) { const level = kind === 't' ? v : to; out += `<line x1="${x + w}" y1="${y(level).toFixed(1)}" x2="${x + 122}" y2="${y(level).toFixed(1)}" stroke="var(--rule-strong)" stroke-dasharray="4 3"/>`; }
    run = kind === 't' ? v : to;
  });
  return `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><line x1="20" y1="${base}" x2="630" y2="${base}" stroke="var(--rule-strong)"/>${out}</svg>`;
})();

// Merrow Veterinary Clinic (simple example), year ended 31 December 2026
const MV = { open: 124000, customers: 486000, interestIn: 1200, suppliers: 142000, staff: 238000, rent: 36000, interestOut: 4800, tax: 14500, xray: 58000, ultrasound: 3500, cd: 15000, tbill: 20000, loan: 24000, dividends: 30000, table: 12000 };
MV.op = MV.customers + MV.interestIn - MV.suppliers - MV.staff - MV.rent - MV.interestOut - MV.tax;
MV.inv = -MV.xray + MV.ultrasound - MV.cd;
MV.fin = -MV.loan - MV.dividends;
MV.net = MV.op + MV.inv + MV.fin;
MV.end = MV.open + MV.net;

// Coldharbour Tile Supply (challenging example), year ended 31 December 2027
const CT = { sales: 920000, cogs: 610000, wages: 142000, rent: 48000, insurance: 6000, depreciation: 21000, interest: 9000, tax: 21000,
  ar: [88000, 103000], deposits: [12000, 9000], inv: [140000, 152000], ap: [71000, 66000], wagesPay: [5000, 6500], prepaid: [3000, 3600], intPay: [2000, 1500], taxPay: [4000, 6000] };
const dl = (a) => a[1] - a[0];
CT.pretax = CT.sales - CT.cogs - CT.wages - CT.rent - CT.insurance - CT.depreciation - CT.interest;
CT.ni = CT.pretax - CT.tax;
CT.customers = CT.sales - dl(CT.ar) + dl(CT.deposits);
CT.suppliers = CT.cogs + dl(CT.inv) - dl(CT.ap);
CT.staff = CT.wages - dl(CT.wagesPay);
CT.other = CT.rent + CT.insurance + dl(CT.prepaid);
CT.intPaid = CT.interest - dl(CT.intPay);
CT.taxPaid = CT.tax - dl(CT.taxPay);
CT.cfo = CT.customers - CT.suppliers - CT.staff - CT.other - CT.intPaid - CT.taxPaid;
CT.indirect = CT.ni + CT.depreciation - dl(CT.ar) + dl(CT.deposits) - dl(CT.inv) + dl(CT.ap) + dl(CT.wagesPay) - dl(CT.prepaid) + dl(CT.intPay) + dl(CT.taxPay);
const ctRow = (name, a) => [name, a[0].toLocaleString('en-US'), a[1].toLocaleString('en-US'), `${dl(a) > 0 ? '+' : dl(a) < 0 ? '−' : ''}${Math.abs(dl(a)).toLocaleString('en-US')}`];

// Lantern, applied example
const vanInterestYear = F.vanNote.principal * F.vanNote.rate;            // 1,200
const coastlineInterestYear = F.coastline.principal * F.coastline.rate;  // 600
const debtService2027 = F.vanNote.instalment + vanInterestYear + coastlineInterestYear;   // 6,800

// Pellow Roasters (application), an IFRS reporter after IFRS 18
const PR = { cfo: 61000, interestPaid: 8000, interestReceived: 1500 };
PR.usBasis = PR.cfo - PR.interestPaid + PR.interestReceived;

export default {
  slug: 'cash-flow-statement',
  title: 'The statement of cash flows',
  blurb: 'Prepare a full year’s statement of cash flows: decide what counts as cash, classify every receipt and payment under US GAAP and IFRS, work out the direct-method lines from the accrual records, and disclose what changed without any cash moving.',
  status: 'reviewed',
  objectives: [
    'Explain what the statement of cash flows reports, and decide which items are cash and cash equivalents.',
    'Classify receipts and payments as operating, investing or financing under US GAAP (ASC 230), and state how IAS 7 differs before and after the IFRS 18 amendments.',
    'Calculate direct-method operating cash flows from income statement figures and the changes in the related balance sheet accounts.',
    'Prepare a statement of cash flows by the direct method, with a disclosure of noncash investing and financing activities.',
    'Explain why ASC 230 encourages the direct method although most companies use the indirect method.',
  ],
  prerequisites: [
    { lesson: 'f01/financial-statements', why: 'You prepared Lantern’s March statement of cash flows there; this lesson does the same for a whole year, with the exact rules.' },
    { lesson: 'f01/accrual-vs-cash', why: 'Turning revenue and expenses into cash reverses the deferrals and accruals you met there.' },
    { lesson: 'f02/balance-sheet-and-equity', why: 'The changes in Lantern’s balance sheet accounts drive the conversion from revenue and expenses to cash.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s first financial year ends on 31 December 2026. The business opened on 1 March with no cash at all and closes the year with $42,940 in the bank, after net income of $27,387. Coastline Bank asks for the year’s statements for its loan file, and the loan officer has two questions the income statement can’t answer: where did the $42,940 come from, and can Lantern carry the $20,000 note it signed for the van, whose first $5,000 instalment is due on 1 June 2027?' },
    { p: 'The income statement measures performance on the accrual basis, and the balance sheet shows positions at one date. Neither shows how cash moved. The <g>statement of cash flows</g> explains the change in cash and cash equivalents during the period by listing the cash received and paid, grouped as <g>operating activities</g>, <g>investing activities</g> and <g>financing activities</g>. Under US GAAP its rules are in the FASB’s Accounting Standards Codification, Topic 230 (ASC 230); under IFRS they are in IAS 7. Both are titled <i>Statement of Cash Flows</i>.' },
    { p: 'Readers use the statement to judge what the other statements hide: whether a business generates cash from its operations or depends on owners and lenders, how much it spends on long-term assets, whether it can pay its debts and dividends from its own cash, and why net income and cash differ. A lender cares most about the first and the third; an owner deciding on a dividend cares about all four.' },
    { p: 'In F01 you prepared a statement of cash flows for Lantern’s first month by listing each cash transaction. A year is different in three ways: there are thousands of transactions, so the accountant works from summaries and from the accrual records rather than from each bank entry; every kind of timing difference appears at once, from receivables, inventory and payables to customer deposits, prepaid insurance, accrued interest and income taxes; and the classification rules matter more, because the two frameworks disagree about interest and dividends. This lesson covers the statement as a whole and the <g>direct method</g>; the next lesson covers the <g>indirect method</g>, which reaches the same operating total by starting from net income.' },
    { figure: {
      svg: bridgeSVG,
      caption: 'From no cash to $42,940: Lantern’s first year by activity (fictional figures in dollars).',
      alt: 'Bridge chart with five bars. Cash at 1 March is zero. Operating activities add $39,940, taking cash to $39,940. Investing activities take away $22,000, bringing it down to $17,940. Financing activities add $25,000. Cash at 31 December is $42,940.',
    } },
    { callout: 'key', title: 'One line of the balance sheet', html: 'The statement explains a single balance sheet figure: cash and cash equivalents, $0 at 1 March and $42,940 at 31 December for Lantern. Every entry that changes that figure appears in the statement, and every entry that doesn’t stays out, even the $20,000 note Lantern signed for its van. Investing and financing transactions without cash are disclosed beside the statement instead.' },
    { h: 'Cash and cash equivalents' },
    { p: 'Cash means currency and deposits that can be withdrawn on demand. <g>Cash equivalents</g> are short-term, highly liquid investments that are readily convertible to known amounts of cash and so near their maturity that changes in interest rates can hardly affect their value. The ASC 230 glossary adds that generally only investments with original maturities of three months or less qualify, where “original” means from the date the business acquired the investment. So a three-year Treasury note bought three months before it matures qualifies, but a note the business has held for years does not become a cash equivalent as its maturity approaches. Treasury bills, commercial paper and money market funds are the usual examples (ASC 230-10-20).' },
    { p: 'IAS 7 uses almost the same definition and says an investment normally qualifies only when it has a short maturity of, say, three months or less from the date of acquisition; equity investments are excluded unless they are cash equivalents in substance, such as preferred shares bought shortly before a set redemption date (IAS 7, paragraphs 6–7). Because cash and cash equivalents are treated as one pool, moving money between them is not a cash flow: buying a 60-day Treasury bill with cash changes neither the total nor any activity, and ASC 230-10-45-5 treats such purchases and sales as cash management whose details need not be reported. A nine-month certificate of deposit is different: it is usually reported as a short-term investment, and buying it is an investing outflow.' },
    { p: 'Each business must disclose its policy for deciding which items are cash equivalents (ASC 230-10-50-1), and a US GAAP statement explains the change in the total of cash, cash equivalents and any restricted cash (ASC 230-10-45-4). Bank overdrafts are a difference between the frameworks: US GAAP never includes them in cash, whereas under IAS 7 an overdraft that is repayable on demand and forms an integral part of cash management is included (paragraph 8). Lantern holds no cash equivalents, so its cash is the balance of its business bank account.' },
  ],

  theory: [
    { h: 'Classifying cash flows under US GAAP' },
    { p: 'ASC 230 defines investing and financing activities and makes operating activities the remainder. <b>Investing</b> covers acquiring and disposing of long-term productive assets and investments, and making and collecting loans. <b>Financing</b> covers dealings with owners and creditors as providers of capital: issuing stock, borrowing, repaying amounts borrowed and paying owners a return. Every receipt and payment that is neither is <b>operating</b>; in practice these are the cash effects of the transactions that make up net income. The table gives the paragraphs that decide the common cases.' },
    { table: {
      caption: 'Common cash flows under US GAAP',
      head: ['Cash flow', 'Activity', 'ASC 230-10-45'],
      align: ['l', 'l', 'l'],
      rows: [
        ['Receipts from selling goods and services, including collections of receivables', 'Operating', '16(a)'],
        ['Interest and dividends received', 'Operating', '16(b)'],
        ['Payments for inventory, to other suppliers and to employees', 'Operating', '17(a), 17(b)'],
        ['Income taxes paid', 'Operating', '17(c)'],
        ['Interest paid', 'Operating', '17(d)'],
        ['Purchases of property, plant and equipment, paid at or soon before or after the purchase', 'Investing', '13(c)'],
        ['Loans made to others; purchases of other entities’ debt and equity instruments', 'Investing', '13(a), 13(b)'],
        ['Issuing stock; borrowing', 'Financing', '14(a), 14(b)'],
        ['Dividends paid; buying back the company’s own stock', 'Financing', '15(a)'],
        ['Repaying the principal of amounts borrowed', 'Financing', '15(b)'],
      ],
      note: 'Paragraph references are to ASC 230-10-45; for example, 16(b) is ASC 230-10-45-16(b).',
    } },
    { p: 'Proceeds from selling equipment or other long-term assets, and collections of loans made to others, are investing inflows. Two rows surprise most students. Interest paid is operating although the loan itself is financing: interest is an expense in net income, and ASC 230 keeps the cash effects of net income together, so only the repayment of principal is financing. Dividends paid are financing although dividends received are operating, for the same reason seen from the other side: a dividend paid distributes profit to owners and is not an expense, while a dividend received is income. Customer deposits are operating receipts even though the revenue isn’t earned yet, because they are cash from customers for goods or services.' },
    { p: 'Paying for an asset over time needs care. Only the down payment and amounts paid at the purchase, or soon before or after it, are investing outflows; if the buyer instead takes on debt directly to the seller, that is a financing transaction, and its later principal payments are financing outflows (ASC 230-10-45-13(c)). Lantern paid $4,000 for its espresso equipment on 3 March and the other $8,000 on 2 April, on the supplier’s ordinary 30-day terms: trade credit paid soon after the purchase, not financing, so all $12,000 is an investing outflow for the year. F01’s March statement disclosed the $8,000 as a noncash item only because it was still unpaid at 31 March.' },
    { p: 'The van was different. Lantern paid $10,000 in cash, an investing outflow, and signed a $20,000 note with the dealer’s finance company. The note brought in no cash, so it is not in the statement at all; the principal Lantern repays from 2027 will be a financing outflow and the interest an operating one.' },
    { h: 'Lantern’s year by the direct method' },
    { p: 'The statement below is Lantern’s first annual statement of cash flows, built from the cash lines of the year’s entries. Its operating section uses the direct method: it lists operating receipts and payments by type, as F01’s March statement did.' },
    { statement: S.cashDirect },
    { p: 'Cash received from customers of $191,220 combines catering deposits ($4,040) and collections ($51,720), workshop fees ($22,500) and the online shop’s card receipts ($113,985), less refunds paid back to customers’ cards ($1,025). Cash paid to suppliers of $103,330 covers the beans from Kilnworth Roasting, catering supplies, rent, utilities, advertising, insurance, shipping, fuel, card fees and small costs; employees were paid $41,500, interest $450 and estimated income tax $6,000. Investing shows the equipment and the van’s down payment, and financing shows Ana’s $20,000, Coastline’s $10,000 and the two dividends of $300 and $4,700. The closing figure, $42,940, is the cash on the balance sheet at 31 December.' },
    { h: 'From the accrual records to the direct-method lines' },
    { p: 'Few businesses code every bank payment by type as it happens, so preparers usually derive the direct-method lines from the income statement and the balance sheet. The logic is the same for every line: start from the accrual amount and adjust it by the change in the balance sheet account that sits between the accrual and the cash. Revenue becomes cash collected after removing the increase in receivables (sold, not yet collected) and the receivables written off (sold, never collected), and adding the increase in unearned revenue (collected, not yet earned). An expense becomes cash paid after adding the increase in a related asset such as inventory or a prepayment (paid for, not yet an expense) and removing the increase in a related liability such as payables (an expense, not yet paid).' },
    { table: conversion },
    { list: [
      '<b>Customers:</b> net revenue of $193,320, less the increase in receivables ($7,380) and the receivable written off ($820), plus the increase in unearned revenue ($6,100).',
      '<b>Suppliers:</b> cost of goods sold, supplies used and the other cash expenses ($105,800), plus the increases in inventory ($5,800), supplies ($640) and prepaid insurance ($300), less the increase in accounts payable ($9,210).',
      '<b>Employees:</b> event wages in cost of services and wages expense ($43,600), less the increase in wages payable ($2,100).',
      '<b>Interest and income taxes:</b> each expense less the increase in the related payable ($750 and $3,129).',
    ] },
    { p: 'Two expenses never reach the direct method: depreciation of $4,800 and bad debt expense of $1,404 used no cash. The $820 receivable written off appears instead, in the customers line, because it is a sale that will never be collected. Lantern’s opening balances were all zero, so each change equals the ending balance; in any later year you would use the difference between the opening and closing balances.' },
    { callout: 'note', title: 'One payables account, several suppliers', html: 'Lantern’s $9,210 of accounts payable is $8,400 owed to Kilnworth for beans, $520 to supply vendors and the $290 December utility bill. Because Lantern reports a single “cash paid to suppliers” line, the whole increase goes against that line. A business that reports cash paid for inventory separately must split its payables the same way, or one line will be overstated and another understated.' },
    { h: 'Noncash investing and financing activities' },
    { p: 'Some investing and financing transactions involve no cash, or only part of it. They are left out of the statement, but because they change the business’s assets and liabilities they must be disclosed, either on the same page or in a note the statement refers to (ASC 230-10-50-3 to 50-6; IAS 7, paragraph 43, has the same rule). When a transaction is part cash and part noncash, only the cash part goes in the statement (ASC 230-10-50-5). Converting debt into stock is the classic example (ASC 230-10-50-4); in small businesses the commonest is buying an asset by signing a note.' },
    { p: `Lantern’s van is a part-cash purchase: the $10,000 paid is an investing outflow, and the disclosure beneath the statement relates the cash and noncash parts, as ASC 230-10-50-3 requires: “${R.cashFlows.noncash[0]}” A reader who saw only the $10,000 would underestimate both what Lantern invested and what it owes; the disclosure closes that gap. Moving the $5,000 instalment due on 1 June 2027 into current liabilities (adjustment e8) is not a noncash investing or financing activity at all, because no transaction with anyone took place.` },
    { h: 'Interest, dividends and income taxes under IFRS' },
    { p: 'IAS 7 agrees with ASC 230 on the three activities but, until the IFRS 18 amendments, gives companies choices that US GAAP does not. A company may classify interest paid as operating or financing, interest and dividends received as operating or investing, and dividends paid as financing or operating, provided it applies its choice consistently from period to period (IAS 7, paragraphs 31, 33 and 34). Taxes on income are operating unless they can be specifically identified with investing or financing activities (paragraph 35).' },
    { p: 'IFRS 18 <i>Presentation and Disclosure in Financial Statements</i> amends IAS 7 to remove those choices, with effect from the same date as IFRS 18 itself: annual reporting periods beginning on or after 1 January 2027. A company whose main business is not investing in assets or providing finance to customers must classify interest paid as financing and interest and dividends received as investing (new paragraph 34A), and every company must classify dividends paid as financing (paragraph 33A). Banks, investment companies and others with those main business activities classify interest paid and interest and dividends received to match where the related expense and income appear in their income statement (paragraph 34B). The amendments also make operating profit, rather than profit, the starting point of the indirect method.' },
    { table: {
      caption: 'Interest and dividends in the statement of cash flows',
      head: ['Cash flow', 'US GAAP (ASC 230)', 'IAS 7 before IFRS 18', 'IAS 7 with IFRS 18, most companies'],
      align: ['l', 'l', 'l', 'l'],
      rows: [
        ['Interest paid', 'Operating', 'Operating or financing', 'Financing'],
        ['Interest received', 'Operating', 'Operating or investing', 'Investing'],
        ['Dividends received', 'Operating', 'Operating or investing', 'Investing'],
        ['Dividends paid', 'Financing', 'Financing or operating', 'Financing'],
      ],
      note: '“Most companies” means those whose main business is not investing in assets or providing finance to customers (IAS 7, paragraphs 33A and 34A as amended).',
    } },
    { callout: 'standards', title: 'Which rules apply to Lantern?', html: 'Lantern is a US private company reporting under US GAAP, so its $450 of interest paid stays in operating activities and its $5,000 of dividends in financing, whatever IFRS does. The difference matters when you compare it with a company reporting under IFRS: from 2027 that company’s operating cash flow excludes its interest paid and its interest and dividends received, so the two operating figures are not directly comparable until you move those items back.' },
    { h: 'Direct or indirect: what the standards say and what companies do' },
    { p: 'ASC 230-10-45-25 encourages the direct method and lists the minimum classes of operating receipts and payments that a company using it must show separately: cash collected from customers; interest and dividends received; other operating receipts; cash paid to employees and other suppliers of goods or services; interest paid; income taxes paid; and other operating payments. IAS 7 also encourages the direct method (paragraph 19). Lantern’s statement shows the classes it has, with suppliers and employees on separate lines.' },
    { p: 'The encouragement has had little effect: most companies use the indirect method. Three reasons explain the gap. First, US GAAP asks a company that uses the direct method to provide the reconciliation of net income to operating cash flow as well, in a separate schedule (ASC 230-10-45-30), so the direct method means preparing both; IAS 7 asks for the reconciliation only from companies that use the indirect method. Second, accounting systems record revenue and expenses rather than receipts and payments by type, so the direct-method lines must be derived, as you did above, which is laborious in a large organisation. Third, users are familiar with the indirect format, and its starting point ties the statement to the income statement and the balance sheet.' },
    { p: 'The case for the direct method is plain from Lantern’s statement: a reader sees how much cash came in from customers and went out to suppliers and staff, figures that are useful for forecasting and that the indirect method never shows. This course teaches both, because Lantern’s accountant presents the direct method and must still provide the reconciliation, which is the subject of the next lesson.' },
  ],

  formulas: [
    { id: 'cash-bridge', name: 'Opening cash to closing cash',
      tex: String.raw`\text{Cash}_{\text{end}} = \text{Cash}_{\text{beg}} + \text{CFO} + \text{CFI} + \text{CFF}`,
      where: [
        [String.raw`\text{Cash}_{\text{beg}},\ \text{Cash}_{\text{end}}`, 'Cash and cash equivalents at the start and the end of the period', '$'],
        [String.raw`\text{CFO}`, 'Net cash from operating activities', '$'],
        [String.raw`\text{CFI}`, 'Net cash from investing activities (negative when cash is used)', '$'],
        [String.raw`\text{CFF}`, 'Net cash from financing activities (negative when cash is used)', '$'],
      ],
      assumptions: 'Noncash investing and financing activities are left out; they are disclosed separately.',
      note: 'Lantern: <m>0 + 39{,}940 - 22{,}000 + 25{,}000 = 42{,}940</m>.' },
    { id: 'cash-from-customers', name: 'Cash received from customers',
      tex: String.raw`\text{Cash collected} = \text{Revenue} - \Delta\text{Receivables} - \text{Write-offs} + \Delta\text{Unearned revenue}`,
      where: [
        [String.raw`\text{Revenue}`, 'Net revenue on the income statement (after returns and discounts)', '$'],
        [String.raw`\Delta\text{Receivables}`, 'Closing minus opening accounts receivable, before the allowance', '$'],
        [String.raw`\text{Write-offs}`, 'Receivables written off during the period as uncollectible', '$'],
        [String.raw`\Delta\text{Unearned revenue}`, 'Closing minus opening unearned revenue (customer deposits and prepayments)', '$'],
      ],
      note: 'A decrease is a negative Δ, so a fall in receivables adds to the cash collected. Lantern: <m>193{,}320 - 7{,}380 - 820 + 6{,}100 = 191{,}220</m>.' },
    { id: 'cash-paid-inventory', name: 'Cash paid for inventory',
      tex: String.raw`\text{Cash paid} = \text{COGS} + \Delta\text{Inventory} - \Delta\text{Payables}`,
      where: [
        [String.raw`\text{COGS}`, 'Cost of goods sold for the period', '$'],
        [String.raw`\Delta\text{Inventory}`, 'Closing minus opening inventory', '$'],
        [String.raw`\Delta\text{Payables}`, 'Closing minus opening accounts payable to inventory suppliers', '$'],
      ],
      assumptions: 'All inventory is bought on account from the suppliers whose payables are used.',
      note: 'COGS + ΔInventory is the period’s purchases. Lantern’s beans: <m>52{,}800 + 5{,}800 - 8{,}400 = 50{,}200</m>.' },
    { id: 'cash-paid-expense', name: 'Cash paid for an operating expense',
      tex: String.raw`\text{Cash paid} = \text{Expense} + \Delta\text{Prepaid} - \Delta\text{Accrued liability}`,
      where: [
        [String.raw`\text{Expense}`, 'The expense on the income statement (wages, insurance, interest, income tax …)', '$'],
        [String.raw`\Delta\text{Prepaid}`, 'Closing minus opening prepayment for that expense, if any', '$'],
        [String.raw`\Delta\text{Accrued liability}`, 'Closing minus opening payable for that expense (wages payable, interest payable …)', '$'],
      ],
      note: 'Lantern’s interest: <m>1{,}200 + 0 - 750 = 450</m>. Depreciation and bad debt expense have no cash payment and are left out.' },
  ],

  examples: [
    { level: 'simple', title: 'A clinic’s year, classified', fictional: true,
      setup: 'Merrow Veterinary Clinic, a fictional business reporting under US GAAP, starts 2026 with $124,000 of cash and cash equivalents. Its cash records for the year show: received from pet owners and insurers $486,000; interest received on a savings account $1,200; paid suppliers of drugs and supplies $142,000; paid employees $238,000; paid rent $36,000; paid interest on its bank loan $4,800; paid income taxes $14,500; bought an X-ray machine for $58,000; sold an old ultrasound scanner for $3,500; bought a 60-day Treasury bill for $20,000 in December, still held at 31 December; put $15,000 into a nine-month certificate of deposit; repaid $24,000 of the loan’s principal; paid dividends of $30,000. It also acquired a $12,000 surgical table by signing a note with the manufacturer. Prepare the statement of cash flows.',
      steps: [
        'Operating (ASC 230-10-45-16 and 45-17, with interest received and paid both operating): <m>486{,}000 + 1{,}200 - 142{,}000 - 238{,}000 - 36{,}000 - 4{,}800 - 14{,}500 = 51{,}900</m>.',
        'Investing: the X-ray machine and the certificate of deposit are outflows, the scanner’s sale an inflow: <m>-58{,}000 + 3{,}500 - 15{,}000 = -69{,}500</m>. The Treasury bill is a cash equivalent (60 days when bought), so buying it moved money inside the cash pool: it is not a cash flow.',
        'Financing: <m>-24{,}000 - 30{,}000 = -54{,}000</m>. The surgical table moved no cash: it is a noncash investing and financing activity, disclosed in a note.',
        'Net change <m>51{,}900 - 69{,}500 - 54{,}000 = -71{,}600</m>; closing cash and cash equivalents <m>124{,}000 - 71{,}600 = 52{,}400</m>, of which $20,000 is the Treasury bill.',
      ],
      statement: {
        title: 'Merrow Veterinary Clinic',
        subtitle: 'Statement of cash flows for the year ended 31 December 2026 (direct method)',
        sections: [
          { head: 'Operating activities', rows: [['Cash received from customers', 486000], ['Interest received', 1200], ['Cash paid to suppliers', -142000], ['Cash paid to employees', -238000], ['Cash paid for rent', -36000], ['Interest paid', -4800], ['Income taxes paid', -14500]], total: ['Net cash from operating activities', 51900] },
          { head: 'Investing activities', rows: [['Purchase of X-ray machine', -58000], ['Sale of ultrasound scanner', 3500], ['Purchase of certificate of deposit', -15000]], total: ['Net cash used in investing activities', -69500] },
          { head: 'Financing activities', rows: [['Repayment of bank loan', -24000], ['Dividends paid', -30000]], total: ['Net cash used in financing activities', -54000] },
          { rows: [['Net decrease in cash and cash equivalents', -71600], ['Cash and cash equivalents, 1 January 2026', 124000]], total: ['Cash and cash equivalents, 31 December 2026', 52400] },
        ],
        note: 'Noncash investing and financing: surgical table of $12,000 acquired by signing a note payable to the manufacturer. Cash equivalents are investments with a maturity of three months or less when acquired. Fictional figures.',
      },
      answer: 'Operating $51,900; investing ($69,500); financing ($54,000); net decrease $71,600; closing cash and cash equivalents $52,400. The surgical table is disclosed, not included.',
      interpretation: 'Operations produced $51,900, but the clinic spent more than that on equipment and a deposit, and more again on its lender and owners, so cash fell by more than half. The Treasury bill is still part of the $52,400: the clinic didn’t spend that money, it parked it.' },
    { level: 'challenging', title: 'The direct method from two balance sheets', fictional: true,
      setup: 'Coldharbour Tile Supply, a fictional wholesaler, reports for 2027: sales $920,000; cost of goods sold $610,000; wages $142,000; rent $48,000; insurance $6,000; depreciation $21,000; interest $9,000; income tax $21,000; net income $63,000. All its accounts payable are owed to tile suppliers, and its customers pay deposits on special orders. Derive the operating section by the direct method from the balances in the table, and check it against net income.',
      table: {
        caption: 'Coldharbour Tile Supply: operating balances at 31 December (fictional)',
        head: ['Account', '2026 ($)', '2027 ($)', 'Change ($)'],
        align: ['l', 'r', 'r', 'r'],
        rows: [
          ctRow('Accounts receivable', CT.ar), ctRow('Customer deposits (unearned revenue)', CT.deposits), ctRow('Inventory', CT.inv), ctRow('Accounts payable', CT.ap),
          ctRow('Wages payable', CT.wagesPay), ctRow('Prepaid insurance', CT.prepaid), ctRow('Interest payable', CT.intPay), ctRow('Income taxes payable', CT.taxPay),
        ],
      },
      steps: [
        'Customers: receivables rose, so not all sales were collected; deposits fell, so some revenue was earned from cash received last year: <m>920{,}000 - 15{,}000 - 3{,}000 = 902{,}000</m>.',
        'Suppliers of tiles: purchases are <m>610{,}000 + 12{,}000 = 622{,}000</m>; payables fell by 5,000, so Coldharbour paid more than it bought: <m>622{,}000 + 5{,}000 = 627{,}000</m>.',
        'Employees <m>142{,}000 - 1{,}500 = 140{,}500</m>; rent and insurance <m>48{,}000 + 6{,}000 + 600 = 54{,}600</m> (the prepayment grew); interest <m>9{,}000 + 500 = 9{,}500</m> (the payable fell); income taxes <m>21{,}000 - 2{,}000 = 19{,}000</m>. Depreciation is left out: it used no cash.',
        'Net cash from operating activities: <m>902{,}000 - 627{,}000 - 140{,}500 - 54{,}600 - 9{,}500 - 19{,}000 = 51{,}400</m>.',
        'Check from net income: add back depreciation and apply every change with the opposite sign for assets and the same sign for liabilities: <m>63{,}000 + 21{,}000 - 15{,}000 - 3{,}000 - 12{,}000 - 5{,}000 + 1{,}500 - 600 - 500 + 2{,}000 = 51{,}400</m>.',
      ],
      statement: {
        title: 'Coldharbour Tile Supply',
        subtitle: 'Cash flows from operating activities for the year ended 31 December 2027 (direct method)',
        sections: [
          { rows: [['Cash received from customers', 902000], ['Cash paid to suppliers', -627000], ['Cash paid to employees', -140500], ['Cash paid for rent and insurance', -54600], ['Interest paid', -9500], ['Income taxes paid', -19000]], total: ['Net cash from operating activities', 51400] },
        ],
        note: 'Fictional figures.',
      },
      answer: 'Net cash from operating activities is $51,400, by both routes.',
      interpretation: 'Coldharbour’s operating cash flow is $11,600 below its net income, and $32,600 below net income plus depreciation ($84,000 − $51,400): working capital absorbed that cash as Coldharbour let customers owe more, stocked more tile and paid its suppliers down. The second route is the indirect method, which the next lesson develops.' },
    { level: 'applied', title: 'Did Lantern’s first year pay for itself?', fictional: true,
      setup: 'Ana wants to know whether Lantern’s operations funded the year’s investment, and whether the cash commitments that start in 2027 look manageable. Use Lantern’s statement of cash flows above and its noncash note. In 2027 Lantern must pay the first $5,000 instalment on the van note with a year’s interest at 6%, and Coastline’s interest of $150 a quarter.',
      steps: [
        'Operations against investment: <m>39{,}940 - 22{,}000 = 17{,}940</m>. Operating cash covered the equipment and the van’s down payment with $17,940 to spare.',
        'After the dividends: <m>17{,}940 - 5{,}000 = 12{,}940</m> was generated internally. The rest of the $42,940 is the $30,000 of stock and borrowing: <m>12{,}940 + 30{,}000 = 42{,}940</m>.',
        'The noncash note reveals a commitment the cash lines don’t show. In 2027: instalment 5,000, van interest <m>20{,}000 \\times 0.06 = 1{,}200</m>, Coastline interest <m>4 \\times 150 = 600</m>; together <m>6{,}800</m>.',
        'Part of the operating cash is timing. At 31 December Lantern owed $21,289 of operating liabilities that 2027 will settle (bills $9,210, wages $2,100, interest $750, income tax $3,129, and $6,100 of goods and services already paid for), while $13,536 sat in receivables, inventory, supplies and prepaid insurance still to turn into cash or expense. Net, about <m>21{,}289 - 13{,}536 = 7{,}753</m> of the operating cash flow is timing that reverses in 2027.',
      ],
      answer: 'Yes: operations funded the year’s $22,000 of investing outflows and the $5,000 of dividends, leaving $12,940 of internally generated cash. The 2027 debt payments of about $6,800 look small beside a ten-month operating cash flow of $39,940, but about $7,753 of it is net timing that reverses in 2027.',
      interpretation: 'The statement answers the loan officer’s first question (where the cash came from) directly, and the noncash note answers half of the second (what is owed). The rest needs judgement: a first year’s operating cash flow is flattered, on balance, by unpaid bills and receipts in advance, which the indirect method in the next lesson measures line by line.' },
  ],

  demo: [
    { widget: 'cfs-direct', intro: 'Start from Lantern’s revenue and cost of goods sold, then change the balance sheet movements. Watch which way each change moves the cash figure, and notice that cash collected can exceed revenue when receivables fall or deposits rise.' },
    { widget: 'cfs-classes', intro: 'The same cash flows under three sets of rules. Change the interest and dividends and see how far operating cash flow moves while the total change in cash stays the same.' },
  ],

  mistakes: [
    { title: '“Buying a three-month Treasury bill is an investing outflow.”', html: 'An investment with a maturity of three months or less when acquired is a cash equivalent, part of the pool the statement explains. Buying it with cash moves money within the pool, so it is not reported as a cash flow (ASC 230-10-45-5). A nine-month certificate of deposit is not a cash equivalent, and buying it is an investing outflow.' },
    { title: '“Interest paid is financing, because the loan is financing.”', html: 'Under US GAAP interest paid is operating (ASC 230-10-45-17(d)); only the principal repaid is financing. Under IAS 7 interest paid may currently be operating or financing, and from 2027 most IFRS reporters must show it as financing. Always check which rules a statement follows before comparing operating cash flows.' },
    { title: '“The van cost $30,000, so investing outflows include $30,000.”', html: 'Only the cash paid, $10,000, is an investing outflow. The $20,000 note brought in no cash and paid out none, so it is disclosed as a noncash investing and financing activity (ASC 230-10-50-5). When Lantern repays the principal, those payments will be financing outflows.' },
    { title: '“Cash received from customers equals revenue.”', html: 'Revenue is earned, not received. Subtract the increase in receivables and any write-offs, and add the increase in unearned revenue. Lantern earned $193,320 and received $191,220; a business whose receivables are falling can receive more than it earns.' },
    { title: '“Customer deposits are financing, because the customer is funding us.”', html: 'Deposits are receipts from customers for goods or services, so they are operating cash flows when received, even though the revenue is recognised later. Lantern’s $4,040 of catering deposits are inside its $191,220 of cash received from customers.' },
    { title: '“If we use the direct method, we don’t need a reconciliation.”', html: 'Under US GAAP a company that uses the direct method must also reconcile net income to net cash from operating activities, in a separate schedule (ASC 230-10-45-30). Under IAS 7 the reconciliation is required only with the indirect method.' },
  ],

  application: [
    { p: '<b>Preparing the statement.</b> Lantern’s accountant builds the statement two ways and makes them agree. The first route codes the year’s bank transactions by type: receipts from customers, payments to suppliers and staff, interest, tax, equipment, loans, stock and dividends. The second derives the same operating lines from the income statement and the changes in the balance sheet, as in the table above. If the routes disagree, something has been misclassified or missed, often a payment coded to the wrong supplier or a balance sheet account left out of the conversion. The accountant then adds the noncash note for the van and a sentence of policy: Lantern has no cash equivalents.' },
    { p: '<b>Comparing borrowers.</b> Coastline Bank’s credit analyst is also reviewing Pellow Roasters, a fictional roaster that reports under IFRS and applies IFRS 18 from 2027. Pellow’s 2027 statement shows net cash from operating activities of $61,000, with interest paid of $8,000 in financing and interest received of $1,500 in investing. To compare it with US GAAP borrowers like Lantern, the analyst moves both back into operating activities: <m>61{,}000 - 8{,}000 + 1{,}500 = 54{,}500</m>. On a like-for-like basis Pellow’s operating cash flow is $6,500 lower than reported, and that is the figure the analyst compares with its debt payments.' },
    { p: '<b>Reading any statement.</b> Whatever the framework, the analyst runs the same checks: the closing cash agrees with the balance sheet; the noncash note is read with the investing section, because an asset bought with a note is still an investment and the note is still a debt; the cash-equivalents policy shows what “cash” includes; and the classification of interest and dividends is noted before operating cash flows are compared. Measures built from the statement, such as free cash flow and cash-based coverage ratios, are the subject of F03.' },
  ],

  summary: [
    'The statement of cash flows explains the change in cash and cash equivalents over a period by activity: Lantern went from $0 to $42,940 with operating $39,940, investing ($22,000) and financing $25,000.',
    'Cash equivalents are short-term, highly liquid investments, generally with a maturity of three months or less when acquired; moving money between cash and cash equivalents is not a cash flow.',
    'Under US GAAP interest paid and received and dividends received are operating, and dividends paid are financing. IAS 7 allows choices until IFRS 18 (from 1 January 2027) makes dividends paid financing for every company and, for most companies, interest paid financing and interest and dividends received investing.',
    'Direct-method lines come from the accrual figures adjusted for the related balance sheet changes: cash collected = revenue − Δreceivables − write-offs + Δunearned revenue; cash paid = expense + Δprepaid or Δinventory − Δpayable.',
    'Noncash investing and financing transactions are left out of the statement and disclosed; only the cash part of a part-cash purchase is included, so Lantern’s van shows $10,000 in investing and a $20,000 note in the disclosure.',
    'ASC 230 and IAS 7 encourage the direct method, but most companies use the indirect method; under US GAAP a company using the direct method must also present the reconciliation of net income.',
  ],

  glossary: [
    { term: 'Cash equivalents', def: 'Short-term, highly liquid investments that are readily convertible to known amounts of cash and so near maturity that changes in interest rates barely affect their value: generally those with a maturity of three months or less when acquired, such as Treasury bills and money market funds.' },
    { term: 'Direct method', def: 'A way of presenting cash flows from operating activities that lists the major classes of operating receipts and payments, such as cash collected from customers and cash paid to suppliers and employees.' },
    { term: 'Indirect method', def: 'A way of presenting cash flows from operating activities that starts from net income (under IFRS from 2027, operating profit) and adjusts it for noncash items, gains and losses, and changes in operating current assets and liabilities.' },
    { term: 'Noncash investing and financing activities', def: 'Investing and financing transactions that change assets or liabilities without any cash moving, such as buying equipment by signing a note or converting debt into stock. They are left out of the statement of cash flows and disclosed separately.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 16.1, “Explain the Purpose of the Statement of Cash Flows” (including that the vast majority of statements use the indirect method). OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/16-1-explain-the-purpose-of-the-statement-of-cash-flows', checked: '2026-10-23' },
    { text: 'IFRS Foundation. <i>IAS 7 Statement of Cash Flows</i>: standard summary page (cash equivalents, the direct and indirect methods, noncash transactions, the IFRS 18 amendments).', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/', checked: '2026-10-23' },
    { text: 'KPMG LLP (2026). <i>Statement of cash flows: Handbook, US GAAP</i> (March 2026), reproducing ASC 230-10-45-13 to 45-17, 45-25 and 50-3 to 50-6.', url: 'https://kpmg.com/kpmg-us/content/dam/kpmg/frv/pdf/2026/statement-cash-flows.pdf', checked: '2026-10-23' },
    { text: 'Ernst &amp; Young LLP (2025). <i>Financial reporting developments: Statement of cash flows</i> (May 2025): ASC 230-10-20 (cash equivalents), 230-10-45-4, 45-5 and 45-25, and practice on the direct and indirect methods.', url: 'https://www.ey.com/content/dam/ey-unified-site/ey-com/en-us/technical/accountinglink/documents/ey-frd42856-05-21-2025_.pdf', checked: '2026-10-23' },
    { text: 'Australian Accounting Standards Board (2023). <i>Compiled AASB Standard AASB 107 Statement of Cash Flows</i>, compiled 31 December 2023. AASB 107 incorporates IAS 7 as issued by the IASB, with the same paragraph numbers; this is the text before IFRS 18 (paragraphs 6–8, 18–19, 31–35 and 43).', url: 'https://www.aasb.gov.au/admin/file/content105/c9/AASB107_08-15_COMPjun23_01-24.pdf', checked: '2026-10-23' },
    { text: 'Australian Accounting Standards Board. AASB 107 <i>Statement of Cash Flows</i>, “Interest and dividends”, paragraphs 31–34D (compilation of September 2024, including the amendments made with AASB 18, the Australian IFRS 18).', url: 'https://standards.aasb.gov.au/node/6600', checked: '2026-10-23' },
    { text: 'Deloitte. <i>A Roadmap Comparing IFRS Accounting Standards and US GAAP</i>, section 4.3, “Statement of Cash Flows” (interest and dividends, bank overdrafts, the reconciliation under each framework). DART.', url: 'https://dart.deloitte.com/USDART/home/publications/deloitte/additional-deloitte-guidance/roadmap-ifrs-us-gaap-comparison/chapter-4-presentation/4-3-statement-cash-flows', checked: '2026-10-23' },
    { text: 'Boissou, V. &amp; Ahuja, K. (2026). “IFRS 18 changes the statement of cash flows”. KPMG IFRS Institute, 1 June 2026 (effective date, the indirect method’s new starting point, interest and dividends).', url: 'https://kpmg.com/us/en/articles/2026/ifrs-18-changes-statement-cash-flows.html', checked: '2026-10-23' },
  ],

  checks: [
    // the case: totals and the bridge
    { what: 'Closing cash (case)', value: D.cashEnd, shown: 42940 },
    { what: 'Net income (case)', value: D.netIncome, shown: 27387 },
    { what: 'Van note principal', value: F.vanNote.principal, shown: 20000 },
    { what: 'First van instalment', value: F.vanNote.instalment, shown: 5000 },
    { what: 'Operating cash flow', value: D.cfo, shown: 39940 },
    { what: 'Investing cash flow', value: D.cfi, shown: -22000 },
    { what: 'Financing cash flow', value: D.cff, shown: 25000 },
    { what: 'Bridge: after investing', value: D.cfo + D.cfi, shown: 17940 },
    { what: 'Bridge: closing', value: 0 + D.cfo + D.cfi + D.cff, shown: 42940 },
    { what: 'Equipment: paid 3 March', value: paidMarch, shown: 4000 },
    { what: 'Equipment: total', value: F.equipment.cost, shown: 12000 },
    { what: 'Equipment: paid 2 April', value: paidApril, shown: 8000 },
    { what: 'Equipment: payments add up to cost', value: paidMarch + paidApril, shown: F.equipment.cost },
    { what: 'Equipment: days from 3 March to 2 April', value: (Date.parse(F.equipment.paid[1].date) - Date.parse(F.equipment.paid[0].date)) / 86400000, shown: 30 },
    { what: 'Noncash note: van cost', value: F.van.cost, shown: 30000 },
    { what: 'Van cash down', value: F.van.cashDown, shown: 10000 },
    { what: 'Van cost', value: F.van.cost, shown: 30000 },
    { what: 'Van cost = cash + note', value: F.van.cashDown + F.vanNote.principal, shown: 30000 },
    // direct-method lines (case engine)
    { what: 'Cash received from customers', value: L.customers, shown: 191220 },
    { what: 'Customers: deposits', value: F.catering.depositsReceived, shown: 4040 },
    { what: 'Customers: catering collections', value: F.catering.collected, shown: 51720 },
    { what: 'Customers: workshop fees', value: 21000 + F.training.paidForJanuary, shown: 22500 },
    { what: 'Customers: shop receipts', value: F.shop.sales + F.shop.prepaidSubscriptions, shown: 113985 },
    { what: 'Customers: refunds', value: F.shop.refunds, shown: 1025 },
    { what: 'Customers: parts add up', value: 4040 + 51720 + 22500 + 113985 - 1025, shown: 191220 },
    { what: 'Cash paid to suppliers', value: L.suppliers, shown: 103330 },
    { what: 'Cash paid to employees', value: L.employees, shown: 41500 },
    { what: 'Interest paid', value: L.interest, shown: 450 },
    { what: 'Income taxes paid', value: L.taxes, shown: 6000 },
    { what: 'Stock issued', value: F.stock, shown: 20000 },
    { what: 'Coastline loan', value: F.coastline.principal, shown: 10000 },
    { what: 'Dividend in March', value: F.dividends[0].amount, shown: 300 },
    { what: 'Dividend in December', value: F.dividends[1].amount, shown: 4700 },
    { what: 'Dividends total', value: D.dividends, shown: 5000 },
    // accrual to cash (Lantern)
    { what: 'Net revenue', value: D.revenue, shown: 193320 },
    { what: 'Receivables (gross)', value: L.arGross, shown: 7380 },
    { what: 'Write-off', value: L.writeOff, shown: 820 },
    { what: 'Unearned revenue', value: L.unearned, shown: 6100 },
    { what: 'Customers adjustment', value: -L.arGross - L.writeOff + L.unearned, shown: -2100 },
    { what: 'Customers from accruals', value: D.revenue - L.arGross - L.writeOff + L.unearned, shown: 191220 },
    { what: 'Supplier-type expenses', value: L.supplierExpenses, shown: 105800 },
    { what: 'Inventory', value: L.inventory, shown: 5800 },
    { what: 'Supplies', value: L.supplies, shown: 640 },
    { what: 'Prepaid insurance', value: L.prepaid, shown: 300 },
    { what: 'Accounts payable', value: L.ap, shown: 9210 },
    { what: 'Suppliers adjustment', value: -(L.inventory + L.supplies + L.prepaid) + L.ap, shown: 2470 },
    { what: 'Suppliers from accruals', value: L.supplierExpenses + L.inventory + L.supplies + L.prepaid - L.ap, shown: 103330 },
    { what: 'Wages in total', value: L.wages, shown: 43600 },
    { what: 'Wages payable', value: L.wagesPayable, shown: 2100 },
    { what: 'Employees from accruals', value: L.wages - L.wagesPayable, shown: 41500 },
    { what: 'Interest expense', value: D.interestExpense, shown: 1200 },
    { what: 'Interest payable', value: L.interestPayable, shown: 750 },
    { what: 'Interest from accruals', value: D.interestExpense - L.interestPayable, shown: 450 },
    { what: 'Income tax expense', value: D.incomeTax, shown: 9129 },
    { what: 'Income taxes payable', value: L.taxPayable, shown: 3129 },
    { what: 'Taxes from accruals', value: D.incomeTax - L.taxPayable, shown: 6000 },
    { what: 'Operating total from accruals', value: (D.revenue - L.arGross - L.writeOff + L.unearned) - (L.supplierExpenses + L.inventory + L.supplies + L.prepaid - L.ap) - (L.wages - L.wagesPayable) - (D.interestExpense - L.interestPayable) - (D.incomeTax - L.taxPayable), shown: 39940 },
    { what: 'Depreciation', value: D.depreciation, shown: 4800 },
    { what: 'Bad debt expense', value: D.badDebt, shown: 1404 },
    { what: 'Payables: beans', value: F.inventory.purchases - F.inventory.paid, shown: 8400 },
    { what: 'Payables: supplies', value: F.supplies.bought - F.supplies.paid, shown: 520 },
    { what: 'Payables: utilities', value: F.utilities.unpaid, shown: 290 },
    { what: 'Payables add up', value: 8400 + 520 + 290, shown: 9210 },
    { what: 'Formula note: COGS', value: D.cogs, shown: 52800 },
    { what: 'Formula note: beans paid', value: D.cogs + L.inventory - (F.inventory.purchases - F.inventory.paid), shown: 50200 },
    { what: 'Formula note: interest', value: 1200 + 0 - 750, shown: 450 },
    // Merrow
    { what: 'Merrow operating', value: MV.op, shown: 51900 },
    { what: 'Merrow investing', value: MV.inv, shown: -69500 },
    { what: 'Merrow financing', value: MV.fin, shown: -54000 },
    { what: 'Merrow net change', value: MV.net, shown: -71600 },
    { what: 'Merrow closing', value: MV.end, shown: 52400 },
    // Coldharbour
    { what: 'Coldharbour income before tax', value: CT.pretax, shown: 84000 },
    { what: 'Coldharbour net income', value: CT.ni, shown: 63000 },
    { what: 'Coldharbour customers', value: CT.customers, shown: 902000 },
    { what: 'Coldharbour purchases', value: CT.cogs + dl(CT.inv), shown: 622000 },
    { what: 'Coldharbour suppliers', value: CT.suppliers, shown: 627000 },
    { what: 'Coldharbour employees', value: CT.staff, shown: 140500 },
    { what: 'Coldharbour rent and insurance', value: CT.other, shown: 54600 },
    { what: 'Coldharbour interest paid', value: CT.intPaid, shown: 9500 },
    { what: 'Coldharbour taxes paid', value: CT.taxPaid, shown: 19000 },
    { what: 'Coldharbour CFO direct', value: CT.cfo, shown: 51400 },
    { what: 'Coldharbour CFO indirect', value: CT.indirect, shown: 51400 },
    { what: 'Coldharbour NI + depreciation', value: CT.ni + CT.depreciation, shown: 84000 },
    { what: 'Coldharbour working capital absorbed', value: CT.ni + CT.depreciation - CT.cfo, shown: 32600 },
    { what: 'Coldharbour CFO below NI', value: CT.ni - CT.cfo, shown: 11600 },
    // applied
    { what: 'Internally generated after dividends', value: D.cfo + D.cfi - D.dividends, shown: 12940 },
    { what: 'Stock and borrowing', value: F.stock + F.coastline.principal, shown: 30000 },
    { what: 'Internal + external = closing cash', value: 12940 + 30000, shown: D.cashEnd },
    { what: 'Van interest for a year', value: vanInterestYear, shown: 1200 },
    { what: 'Coastline interest for a year', value: coastlineInterestYear, shown: 600 },
    { what: 'Coastline quarterly interest', value: coastlineInterestYear / 4, shown: 150 },
    { what: '2027 debt payments', value: debtService2027, shown: 6800 },
    { what: 'Timing: operating liabilities (case)', value: D.operatingCurrentLiabilities, shown: 21289 },
    { what: 'Timing: operating liabilities from balances', value: L.ap + L.wagesPayable + L.interestPayable + L.taxPayable + L.unearned, shown: 21289 },
    { what: 'Timing: operating current assets (case)', value: D.operatingCurrentAssets, shown: 13536 },
    { what: 'Timing: operating current assets from balances', value: L.arNet + L.inventory + L.supplies + L.prepaid, shown: 13536 },
    { what: 'Timing: net', value: D.operatingCurrentLiabilities - D.operatingCurrentAssets, shown: 7753 },
    { what: 'Timing: net = CFO − NI − depreciation', value: D.cfo - D.netIncome - D.depreciation, shown: 7753 },
    { what: 'Van interest rate 6%', value: F.vanNote.rate * 100, shown: 6 },
    // Pellow
    { what: 'Pellow US-basis CFO', value: PR.usBasis, shown: 54500 },
    { what: 'Pellow difference', value: PR.cfo - PR.usBasis, shown: 6500 },
  ],
};
