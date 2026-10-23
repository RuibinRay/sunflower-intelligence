// linking-the-statements.js — F02 · Linking the statements. Content only; exercises are in linking-the-statements.ex.js.
// Lantern’s figures come from case.js (DERIVED, STATEMENTS, LEDGER, FACTS) and Ana’s 2027 salary from f04/case.js; prose
// prints them and `checks` recomputes each one from the imports. Thornwick Bakery and Hatherley Print Studio are fictional
// and used only in this lesson. The indirect method itself, the sign rules and the roll-forward of balance sheet accounts
// are taught in f02/indirect-method; this lesson builds on them rather than repeating them.
import { FACTS as F, LEDGER, DERIVED as D, STATEMENTS as S, ADJUSTMENTS } from './case.js';
import { ANA_PLAN } from '../f04/case.js';

const bal = (n) => LEDGER[n]?.balance || 0;
const adj = (id) => ADJUSTMENTS.find((e) => e.id === id);
const t = F.tax.rate;
const wd = adj('e7').lines[0].dr;                                                                                              // 400
// Thornwick Bakery (simple example)
const BR = { reBeg: 30000, ni: 48000, reEnd: 66000, cashBeg: 9000, cfo: 52000, cfi: -35000, cff: -10000, cashBS: 16000, assets: 214000, liab: 98000, stock: 50000 };
// Hatherley Print Studio (challenging example)
const CI = { ni: 41200, dep: 6500, ar: 3200, inv: 2700, ap: 1800, equip: 27500, loan: 8000, div: 9000, cashBeg: 14300, reBeg: 22000 };
const ciCfoDraft = CI.ni + CI.dep + CI.ar - CI.inv + CI.ap;
const ciCfo = CI.ni + CI.dep - CI.ar - CI.inv + CI.ap;
const ciEndDraft = CI.cashBeg + ciCfoDraft - CI.equip - (CI.loan + CI.div);
const ciEnd = CI.cashBeg + ciCfo - CI.equip - CI.loan;
// Ana’s dividend question (applied example): fixed cash costs in 2027 include Ana’s salary from Lantern
const cashClaims = D.currentLiabilities - bal('Unearned Revenue');                                                           // 20,189
const afterClaims = D.cashEnd - cashClaims;                                                                                     // 22,751
const salaryMonthly = ANA_PLAN.salaryFromLantern / 12;                                                                          // 4,000
const monthlyFixed = F.rent.monthly + F.wages.shopAndOffice / F.period.months + salaryMonthly;                                 // 7,040
const cushion = 3 * monthlyFixed;                                                                                               // 21,120

export default {
  slug: 'linking-the-statements',
  title: 'Linking the statements',
  blurb: 'Put Lantern’s whole annual report together, check that its four statements articulate and find the error when they don’t, follow single transactions through all of them, see where the gap between profit and cash sits, and push one change through the three main statements the way analysts test a model.',
  status: 'draft',
  objectives: [
    'Trace a transaction through the income statement, the statement of changes in equity, the balance sheet and the statement of cash flows.',
    'Use a preparer’s checklist of links to test whether a set of statements articulates, and locate the error when a link fails.',
    'Locate each part of the gap between Lantern’s net income and its operating cash flow on the balance sheet, and judge which parts will reverse.',
    'Calculate the effect of one change, such as $1,000 more depreciation with tax at 25%, on all three main statements, with the tax paid or still owed.',
    'Interpret the linked statements to judge how much cash a business can afford to distribute.',
  ],
  prerequisites: [
    { lesson: 'f01/financial-statements', why: 'Articulation was introduced there, on Lantern’s first month.' },
    { lesson: 'f02/balance-sheet-and-equity', why: 'The statement of changes in equity and the classified balance sheet are two of the four statements linked here.' },
    { lesson: 'f02/indirect-method', why: 'The reconciliation of net income to operating cash flow, its sign rules and the roll-forward of accounts are used here without being re-taught.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'It is January 2027. Lantern’s accountant has closed the books for the ten months to 31 December 2026 and drafted the four statements. Before they go to Coastline Bank and to the dealer’s finance company that lent Lantern $20,000 for the van, she checks that they tell one consistent story: every figure that appears in two places must agree, and every change on the balance sheet must be explained somewhere else.' },
    { p: 'F01 introduced <g>articulation</g> on a single month: net income flows into equity, ending equity into the balance sheet, and ending cash from the <g>statement of cash flows</g> into the balance sheet. A full year adds inventory, bad debts, depreciation on two assets, accrued interest, income tax and a second dividend, so there are many more places for a link to break. This lesson puts Lantern’s whole <g>annual report</g> together, shows how a preparer finds an error when a link fails, follows single transactions through all four statements, and walks one change through the three main statements, the way analysts test a financial model.' },
    { p: 'The idea underneath every link is that comparative balance sheets list balances at two moments, and the other three statements explain how those balances moved in between. The income statement explains most of the change in retained earnings; the statement of changes in equity explains all of the change in equity; the statement of cash flows explains all of the change in cash. Any other balance sheet change is the other half of an entry whose first half appears on one of those statements, or a <g>noncash investing and financing activity</g> disclosed in a note.' },
    { figure: {
      svg: '<svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="14"><g fill="none" stroke="var(--rule-strong)" stroke-width="1.5"><rect x="10" y="20" width="300" height="110" rx="6"/><rect x="370" y="20" width="300" height="110" rx="6"/><rect x="10" y="200" width="300" height="140" rx="6"/><rect x="370" y="200" width="300" height="140" rx="6"/></g><g fill="currentColor"><text x="160" y="46" text-anchor="middle" font-weight="600">Income statement</text><text x="160" y="72" text-anchor="middle">Net revenue 193,320</text><text x="160" y="96" text-anchor="middle">Expenses and tax (165,933)</text><text x="160" y="120" text-anchor="middle" font-weight="600">Net income 27,387</text><text x="520" y="46" text-anchor="middle" font-weight="600">Changes in equity</text><text x="520" y="72" text-anchor="middle">Retained earnings</text><text x="520" y="96" text-anchor="middle">0 + 27,387 − 5,000 = 22,387</text><text x="520" y="120" text-anchor="middle" font-weight="600">Equity 20,000 + 22,387 = 42,387</text><text x="160" y="226" text-anchor="middle" font-weight="600">Statement of cash flows</text><text x="160" y="252" text-anchor="middle">Operating 39,940</text><text x="160" y="274" text-anchor="middle">Investing (22,000)</text><text x="160" y="296" text-anchor="middle">Financing 25,000</text><text x="160" y="324" text-anchor="middle" font-weight="600">Cash at end 42,940</text><text x="520" y="226" text-anchor="middle" font-weight="600">Balance sheet</text><text x="380" y="258">Cash 42,940</text><text x="380" y="282">Other assets 50,736</text><text x="380" y="306" font-weight="600">Assets 93,676</text><text x="530" y="258">Liabilities 51,289</text><text x="530" y="282">Equity 42,387</text><text x="530" y="306" font-weight="600">Total 93,676</text></g><g stroke="var(--series-1)" stroke-width="2" fill="none"><path d="M310 75 H362"/><path d="M520 130 V192"/><path d="M310 254 H362"/></g><path d="M160 130 V192" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="6 4" fill="none"/><g fill="var(--series-1)"><path d="M362 69 L372 75 L362 81 Z"/><path d="M514 192 L520 202 L526 192 Z"/><path d="M362 248 L372 254 L362 260 Z"/></g><path d="M154 192 L160 202 L166 192 Z" fill="var(--series-2)"/><g fill="currentColor" font-size="12"><text x="340" y="98" text-anchor="middle">net</text><text x="340" y="112" text-anchor="middle">income</text><text x="528" y="168">ending equity</text><text x="340" y="278" text-anchor="middle">ending</text><text x="340" y="292" text-anchor="middle">cash</text><text x="168" y="162">net income starts</text><text x="168" y="176">the indirect method</text></g></svg>',
      caption: 'How Lantern’s statements for the ten months to 31 December 2026 articulate (fictional figures in dollars).',
      alt: 'Diagram of four boxes in two rows. Top left, the income statement shows net revenue of 193,320, expenses and tax of 165,933 and net income of 27,387; an arrow labelled net income leads right to the statement of changes in equity, which shows retained earnings of 0 plus 27,387 minus 5,000 equals 22,387 and equity of 20,000 plus 22,387 equals 42,387. An arrow labelled ending equity leads down from it to the balance sheet, bottom right, which shows cash of 42,940, other assets of 50,736 and assets of 93,676 on the left, and liabilities of 51,289, equity of 42,387 and a total of 93,676 on the right. Bottom left, the statement of cash flows shows operating 39,940, investing minus 22,000, financing 25,000 and cash at the end of 42,940; an arrow labelled ending cash leads right to the cash line of the balance sheet. A dashed arrow leads down from the income statement to the statement of cash flows, labelled net income starts the indirect method.',
    } },
    { p: 'Lantern makes the links easy to see because it began on 1 March 2026 with nothing: every opening balance is zero, so every closing balance on its balance sheet is also the year’s change. Cash of $42,940 is the year’s increase in cash; retained earnings of $22,387 are the year’s net income less the year’s dividends. From 2027 onward the opening balances will be the 2026 closing balances, and every link will compare two balance sheets.' },
    { callout: 'key', title: 'Three links and one identity', html: 'Net income on the income statement equals net income in the statement of changes in equity. Ending equity there equals equity on the balance sheet. Ending cash on the statement of cash flows equals cash on the balance sheet. And the balance sheet must balance: assets equal liabilities plus equity. A set of statements that passes all four tests is not necessarily right, but one that fails any of them is certainly wrong.' },
    { p: 'Readers rely on the links as much as preparers do. A lender who sees profit rising while operating cash flow falls turns to the balance sheet to find where the cash went: into receivables, into inventory, or into paying suppliers faster. An owner who wants to know how much of the profit has been kept in the business looks at retained earnings. Each question is answered by reading two statements together, which only works if they articulate.' },
  ],

  theory: [
    { h: 'Lantern’s annual report' },
    { p: 'Here are the four statements the accountant drafted, in the order F01 taught. The income statement comes first, because net income feeds the statement of changes in equity; that statement comes next, because ending equity feeds the balance sheet; then the balance sheet; then the statement of cash flows, which explains the change in the balance sheet’s cash. The income statement is in the multi-step format and the statement of cash flows uses the direct method, followed by the indirect reconciliation of net income to operating cash flow.' },
    { statement: S.income },
    { statement: S.equity },
    { statement: S.balance },
    { statement: S.cashDirect },
    { statement: S.cashIndirect },
    { p: 'The notes complete the report: Lantern’s accounting policies (first in, first out for inventory, straight-line depreciation with a full month in the month of purchase, the aging method for bad debts), the terms of its two notes payable, and the noncash part of the van purchase. Under the <g>full disclosure principle</g> a reader shouldn’t have to guess any of them.' },

    { h: 'The preparer’s checks' },
    { p: 'Before the statements leave the office, the accountant works through a list of links. Most are <g>tie-out</g>s, a comparison of the same figure in two places; the rest are <g>roll-forward</g>s, which need a short calculation. The last column says what a failed check usually points to, which is where the search for an error starts.' },
    { table: {
      caption: 'Articulation checks on Lantern’s 2026 statements (fictional figures in dollars)',
      head: ['Check', 'Figures that must agree', 'Lantern', 'A failure usually means'],
      rows: [
        ['Net income', 'Income statement = statement of changes in equity = first line of the indirect method', '27,387 in all three', 'A copying or transposition error'],
        ['Retained earnings', 'Opening + net income − dividends = balance sheet', '0 + 27,387 − 5,000 = 22,387', 'Dividends left out, or the trial balance’s opening figure used'],
        ['Equity', 'Statement of changes in equity = balance sheet', '20,000 + 22,387 = 42,387', 'A share issue or dividend recorded in only one place'],
        ['Balance sheet', 'Assets = liabilities + equity', '93,676 = 51,289 + 42,387', 'A balance left out, or an amount entered on one side only'],
        ['Cash', 'Opening cash + operating + investing + financing = balance sheet cash', '0 + 39,940 − 22,000 + 25,000 = 42,940', 'A noncash item treated as cash, a cash flow missed, or a sign error'],
        ['Operating cash flow', 'Direct method = indirect method', '39,940 both ways', 'A sign error on a working-capital change'],
        ['Income tax', 'Opening + expense − amount paid = closing income taxes payable', '0 + 9,129 − 6,000 = 3,129', 'The year-end tax entry missing or misstated'],
        ['Interest', 'Opening + expense − amount paid = closing interest payable', '0 + 1,200 − 450 = 750', 'An accrual missed, or a payment posted to the wrong account'],
        ['Accumulated depreciation', 'Opening + depreciation expense − disposals = closing', '0 + 4,800 − 0 = 2,000 + 2,800', 'Depreciation posted to the wrong account'],
      ],
    } },
    { p: 'The last three checks are roll-forwards, which the indirect method lesson used to rebuild cash flows; here they test the statements. Lantern’s opening balances are zero, but from 2027 every roll-forward starts from the previous year’s closing balance. Accounts receivable rolls forward the same way: opening $0, plus catering invoiced of $59,920, less cash collected of $51,720, less the $820 written off, gives $7,380, the gross balance on the balance sheet.' },
    { p: 'Passing every check is necessary, not sufficient. An expense posted to the wrong expense account, a noncurrent asset shown as current, or an adjusting entry left out of the ledger altogether leaves every link intact, because all four statements are drawn from the same ledger. The checks catch omissions and copying errors between the statements; review and judgement catch the rest.' },
    { h: 'Finding the error when a link fails' },
    { p: 'When a link fails, the size of the difference is the first clue. A difference equal to one item suggests that item was left out, counted twice, or is a noncash item treated as cash; a difference of exactly twice an item suggests it was entered with the wrong sign. The direction narrows the search further: a statement of cash flows that ends below the balance sheet’s cash has too little coming in or too much going out. Two errors can partly offset, so after fixing the first, measure the difference again; the challenging example below works through such a case.' },

    { h: 'One transaction, four statements' },
    { p: 'Following single transactions shows why the links hold. Each journal entry changes at least two accounts. When one of them is a revenue, expense or dividends account, the entry reaches equity; when one of them is Cash, it reaches the statement of cash flows. Four of Lantern’s entries show the patterns, and every amount in the income statement column also reaches the statement of changes in equity through net income.' },
    { table: {
      caption: 'Four Lantern entries traced through the statements (fictional figures in dollars)',
      head: ['Entry', 'Income statement', 'Balance sheet at 31 December', 'Statement of cash flows'],
      rows: [
        ['y4: van bought on 1 June for $30,000 ($10,000 in cash, $20,000 on a note)', 'Nothing on the day; later depreciation of $2,800 (e4) and interest of $700 (part of e5)', 'Van 30,000 less accumulated depreciation 2,800; note: 5,000 current, 15,000 noncurrent', 'Investing outflow 10,000; the 20,000 note disclosed as a noncash transaction'],
        ['e5: interest accrued on 31 December, $750', 'Interest expense 750 (1,200 for the year with the 450 paid)', 'Interest payable 750', 'No cash in 2026; the indirect method shows the increase in interest payable, offsetting the expense'],
        ['y12: online shop, $111,025 shipped and $2,960 of subscriptions paid ahead', 'Online sales revenue 111,025', 'Unearned revenue includes 2,960', '113,985 inside cash received from customers; indirect method: increase in unearned revenue'],
        ['e7: Holiday Blend written down by $400', 'Cost of goods sold 400 higher, so gross profit 400 lower', 'Inventory 5,800, after the write-down', 'No cash; inside the inventory line of the indirect method'],
      ],
    } },
    { p: 'The van shows one decision touching every statement at different times. On 1 June it changed the balance sheet and, for the $10,000 paid, the investing section. The $20,000 borrowed from the dealer’s finance company never passed through Lantern’s bank account, so it is disclosed as a noncash investing and financing activity, and the instalments repaying it from June 2027 will be financing outflows. From June onward the van generated expenses: $400 a month of depreciation and $100 a month of interest (20,000 × 6% ÷ 12), both reducing net income and so retained earnings. At the year end, entry e8 moved the $5,000 due on 1 June 2027 into current liabilities, which changed the balance sheet’s classification and nothing else.' },
    { p: String.raw`The write-down shows how an entry with no cash still reaches the statement of cash flows. In the <g>indirect method</g> it lowers income before tax by $400 and, after the $100 of tax it saves, net income by $300; it makes the increase in inventory $400 smaller (Lantern’s inventory line, $5,800, is measured after it); and, because Lantern’s 2026 tax is partly unpaid, it makes the increase in income taxes payable $100 smaller. The three effects, <m>-300 + 400 - 100 = 0</m>, cancel, as they must when no cash moves. Bad debt expense works the same way, through the net receivables line ($6,796, which already includes the $1,404 charge) and through income taxes payable.` },

    { h: 'Where the gap between profit and cash sits' },
    { p: 'The indirect method lesson reconciled Lantern’s net income of $27,387 with its $39,940 of cash from operations; the question here is where each part of the $12,553 gap sits and what happens to it next. Depreciation of $4,800 is the cost of assets already paid for or financed: the equipment and the van’s $10,000 down payment left through investing, and the $20,000 financed by the van note leaves through financing as it is repaid from June 2027. The $13,536 of operating current assets (net receivables, inventory, supplies and prepaid insurance) sits on the asset side of the balance sheet and turns into cash, or expense, in 2027. The $21,289 of operating current liabilities sits on the other side and financed more than the whole gap, but it reverses early in 2027, when Lantern pays the December bills, the wages and the tax, and delivers $6,100 of service it has already been paid for. A first year flatters operating cash flow this way, because a new business has no old liabilities to pay off, so a lender who projected $39,940 a year forward would be overestimating.' },

    { h: 'A three-statement walkthrough' },
    { p: 'Analysts test their understanding of the links, and their spreadsheet models, by pushing one change through all three main statements. The standard exercise: suppose depreciation is $1,000 higher, tax is 25% of income before tax, and the change in tax is paid in cash within the year.' },
    { ol: [
      String.raw`<b>Income statement.</b> Operating income and income before tax fall by $1,000. Income tax falls by <m>25\% \times 1{,}000 = 250</m>, so net income falls by <m>1{,}000 - 250 = 750</m>.`,
      String.raw`<b>Statement of cash flows.</b> Net income is $750 lower, but the $1,000 of depreciation is added back, so operating cash flow rises by <m>-750 + 1{,}000 = 250</m>: the tax saved. Investing and financing are unchanged.`,
      '<b>Balance sheet.</b> Cash is $250 higher. Accumulated depreciation is $1,000 higher, so property and equipment (net) is $1,000 lower, and total assets fall by $750. Retained earnings fall by the $750 drop in net income. Assets −750 = liabilities 0 + equity −750: the balance sheet still balances.',
    ] },
    { p: 'Lantern’s own books add a twist. Its estimated tax payments were fixed at $6,000, and entry e9 sets Income Taxes Payable at the year’s tax expense less that amount, so none of a change in its 2026 tax is paid within 2026. If depreciation were $1,000 higher, the tax expense would be $250 lower and so would the payable; the saving would reach cash only when the 2026 tax is paid in 2027. For 2026, then: net income −750, depreciation +1,000, change in income taxes payable −250, so operating cash flow is unchanged; on the balance sheet, assets −1,000 = liabilities −250 + equity −750.' },
    { callout: 'note', title: 'Book tax and real tax', html: 'Like the case, this lesson assumes income tax is 25% of income before tax. Real tax returns follow their own depreciation rules, so the tax a business pays for a year is not exactly 25% of its accounting profit; accountants record the difference as deferred tax, a topic for intermediate accounting.' },
  ],

  formulas: [
    { id: 'lnk-gap-clue', name: 'Reading the size of a failed cash link',
      tex: String.raw`\text{Gap} = \begin{cases} X & \text{item omitted, counted twice, or noncash treated as cash} \\ 2X & \text{item entered with the wrong sign} \end{cases}`,
      where: [
        [String.raw`\text{Gap}`, 'Ending cash on the draft statement of cash flows minus cash on the balance sheet (or the reverse)', '$'],
        [String.raw`X`, 'The amount of the item that is wrong', '$'],
      ],
      assumptions: 'One error at a time. Two errors can partly offset, so measure the gap again after correcting the first.',
      note: String.raw`Hatherley Print Studio: after the unpaid dividend is removed, a gap of <m>6{,}400 = 2 \times 3{,}200</m> points to the sign of the $3,200 change in receivables.` },
    { id: 'lnk-after-tax', name: 'After-tax effect of a change in a pretax expense',
      tex: String.raw`\Delta NI = -(1 - t)\,\Delta X`,
      where: [
        [String.raw`\Delta NI`, 'Change in net income', '$'],
        [String.raw`\Delta X`, 'Change in an expense deducted before tax (positive when the expense rises)', '$'],
        [String.raw`t`, 'Tax rate on income before tax, as a decimal', ''],
      ],
      assumptions: 'Tax is a fixed share of income before tax, as in the Lantern case (25%).',
      note: String.raw`$1,000 more depreciation at 25%: <m>\Delta NI = -(1 - 0.25) \times 1{,}000 = -750</m>.` },
    { id: 'lnk-noncash-cash', name: 'Cash and tax payable after a change in a noncash expense',
      tex: String.raw`\Delta \text{CFO} = t \times p \times \Delta N, \qquad \Delta \text{Tax payable} = -t \times (1 - p) \times \Delta N`,
      where: [
        [String.raw`\Delta \text{CFO}`, 'Change in cash from operating activities', '$'],
        [String.raw`\Delta \text{Tax payable}`, 'Change in income taxes payable at the year end', '$'],
        [String.raw`\Delta N`, 'Change in a tax-deductible noncash expense, such as depreciation or a write-down', '$'],
        [String.raw`t`, 'Tax rate on income before tax, as a decimal', ''],
        [String.raw`p`, 'Share of the change in tax that is paid within the year (1 if all of it, 0 if none)', ''],
      ],
      assumptions: 'The expense itself moves no cash; only the tax it changes does, and only when that tax is paid.',
      note: String.raw`$1,000 more depreciation at 25%: with <m>p = 1</m>, <m>\Delta \text{CFO} = 250</m>; for Lantern in 2026, <m>p = 0</m>, so <m>\Delta \text{CFO} = 0</m> and income taxes payable fall by 250.` },
  ],

  examples: [
    { level: 'simple', title: 'Finding the missing links for a bakery', fictional: true,
      setup: 'Thornwick Bakery Inc., a fictional company, has drafted its statements for the year. Retained earnings were $30,000 at the start of the year and $66,000 at the end; net income was $48,000. Cash was $9,000 at the start of the year; operating activities provided $52,000, investing activities used $35,000 and financing activities used $10,000. The balance sheet shows cash of $16,000, total assets of $214,000, liabilities of $98,000 and common stock of $50,000. The dividends figure is missing from the draft: find it, and check the links.',
      steps: [
        String.raw`Retained earnings link, solved for dividends: <m>D = RE_{\text{beg}} + NI - RE_{\text{end}} = 30{,}000 + 48{,}000 - 66{,}000 = 12{,}000</m>.`,
        String.raw`Cash link: <m>9{,}000 + 52{,}000 - 35{,}000 - 10{,}000 = 16{,}000</m>, the balance sheet’s cash. The statement of cash flows explains the whole change in cash, <m>16{,}000 - 9{,}000 = 7{,}000</m>.`,
        String.raw`Equity link: total equity <m>= 50{,}000 + 66{,}000 = 116{,}000</m>, assuming no stock was issued during the year.`,
        String.raw`Balance sheet: <m>98{,}000 + 116{,}000 = 214{,}000</m>, equal to total assets.`,
      ],
      answer: 'Dividends were $12,000. Every link holds: retained earnings 30,000 + 48,000 − 12,000 = 66,000; cash 9,000 + 52,000 − 35,000 − 10,000 = 16,000; assets $214,000 = liabilities $98,000 + equity $116,000.',
      interpretation: 'The links let a reader recover a figure that isn’t printed: dividends declared follow from the opening and closing retained earnings and net income. Thornwick paid out a quarter of its profit (12,000 ÷ 48,000) and kept the rest in the business. Passing every check shows the statements are consistent, not that every figure in them is right.' },
    { level: 'challenging', title: 'A statement of cash flows that doesn’t tie', fictional: true,
      setup: 'Hatherley Print Studio Inc., a fictional company, began the year with cash of $14,300 and retained earnings of $22,000. Its draft statement of cash flows, prepared by the indirect method, is below; it ends at $19,800, but the balance sheet, taken from the ledger, shows cash of $22,400. The balance sheet also shows retained earnings of $54,200 and a $9,000 dividend payable: the board declared a dividend on 15 December, payable on 10 January. Net income was $41,200. Find the errors and correct the statement.',
      table: {
        caption: 'Hatherley Print Studio: draft and corrected statement of cash flows (fictional, $)',
        head: ['Line', 'Draft', 'Corrected'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Net income', '41,200', '41,200'],
          ['Depreciation', '6,500', '6,500'],
          ['Increase in accounts receivable', '3,200', '(3,200)'],
          ['Increase in inventory', '(2,700)', '(2,700)'],
          ['Increase in accounts payable', '1,800', '1,800'],
          ['Net cash from operating activities', '50,000', '43,600'],
          ['Purchase of equipment (investing)', '(27,500)', '(27,500)'],
          ['Repayment of loan principal', '(8,000)', '(8,000)'],
          ['Dividends paid', '(9,000)', '0'],
          ['Net cash used in financing activities', '(17,000)', '(8,000)'],
          ['Cash at the start of the year', '14,300', '14,300'],
        ],
        foot: [['Cash at the end of the year', '19,800', '22,400']],
      },
      steps: [
        String.raw`Retained earnings link: <m>22{,}000 + 41{,}200 - 9{,}000 = 54{,}200</m>, which agrees with the balance sheet. A dividend reduces retained earnings when it is declared, paid or not, so this link can’t reveal whether the dividend was paid.`,
        String.raw`Cash link: the draft ends at 19,800 but the balance sheet shows 22,400, so the draft is <m>22{,}400 - 19{,}800 = 2{,}600</m> short.`,
        String.raw`The dividend payable says the $9,000 was not paid in the year, yet the draft shows it as paid. Removing it raises financing to <m>-8{,}000</m> and the ending cash to <m>19{,}800 + 9{,}000 = 28{,}800</m>, now <m>28{,}800 - 22{,}400 = 6{,}400</m> too high.`,
        String.raw`A remaining difference of exactly twice an item points to a sign error: <m>6{,}400 = 2 \times 3{,}200</m>. Receivables increased, which ties up cash, so the change must be subtracted. Operating cash flow becomes <m>41{,}200 + 6{,}500 - 3{,}200 - 2{,}700 + 1{,}800 = 43{,}600</m>.`,
        String.raw`Corrected ending cash: <m>14{,}300 + 43{,}600 - 27{,}500 - 8{,}000 = 22{,}400</m>, the balance sheet’s figure. The unpaid dividend appears as a current liability, not as a cash flow; it will be a financing outflow next year, when it is paid.`,
      ],
      answer: 'Two errors: the unpaid $9,000 dividend shown as paid, and the $3,200 increase in receivables added instead of subtracted. Corrected: operating activities $43,600; investing ($27,500); financing ($8,000); ending cash $22,400, as on the balance sheet.',
      interpretation: 'The two errors partly offset, so the $2,600 difference matched neither of them. Working through the links one at a time, and using the clue that a difference of exactly twice an item points to a sign error, found both. The corrected statement also changes the story: operations provided $6,400 less cash than the draft claimed.' },
    { level: 'applied', title: 'How much cash can Ana take out of Lantern?', fictional: true,
      setup: 'In January 2027 Ana asks whether Lantern can pay her a $20,000 dividend. Use the 2026 statements: retained earnings $22,387; cash $42,940; current liabilities $26,289, of which $6,100 is unearned revenue. Lantern’s fixed cash costs in 2027 are kitchen rent of $1,200 a month, shop and office wages at 2026’s rate ($18,400 for the ten months) and the $48,000 a year salary Lantern pays Ana from 2027. Assume Lantern wants to keep at least three months of those fixed costs in the bank as a cushion.',
      steps: [
        'Earnings test: a $20,000 dividend is within retained earnings of $22,387, so it would not pay out more profit than Lantern has kept.',
        String.raw`Cash already claimed: current liabilities of 26,289 include 6,100 of unearned revenue, which Lantern settles by delivering service, not by paying cash. The rest, <m>26{,}289 - 6{,}100 = 20{,}189</m>, needs cash within the year, including the $5,000 van instalment and $3,129 of tax.`,
        String.raw`Cash left after those payments: <m>42{,}940 - 20{,}189 = 22{,}751</m>.`,
        String.raw`Cushion: monthly fixed cash costs in 2027 are rent 1,200 + shop and office wages <m>18{,}400 \div 10 = 1{,}840</m> + Ana’s salary <m>48{,}000 \div 12 = 4{,}000</m>, so <m>7{,}040</m>. Three months is <m>3 \times 7{,}040 = 21{,}120</m>, and the largest dividend that keeps the cushion is about <m>22{,}751 - 21{,}120 = 1{,}631</m>.`,
        'Timing: $21,289 of 2026’s operating cash flow came from operating liabilities that reverse in 2027; delivering the $6,100 of prepaid service will use cash (baristas, beans, materials) without bringing any in; and the insurance policy expires on 28 February 2027 and must be renewed. The cushion is not generous.',
      ],
      answer: 'A $20,000 dividend passes the earnings test but fails the cash test: it would leave about $2,751 after known payments, less than half a month of 2027’s fixed costs. On these assumptions a dividend of about $1,600 is the most Lantern can afford now; a larger one should wait until 2027’s own operating cash has come in, and Ana should check the loan agreements first, since lenders’ <g>covenants</g> often limit dividends.',
      interpretation: 'Retained earnings show how much of the profit earned has been kept in the business; state law and lenders’ covenants set what Lantern may legally distribute, and the balance sheet and the statement of cash flows show what it can afford. Here the linked statements also explain why the bank balance looks bigger than the business’s spare cash: much of it is owed to suppliers, staff, lenders and the tax authorities, or has been paid by customers for work still to do.' },
  ],

  demo: [
    { widget: 'lnk-annual', intro: 'Build Lantern’s annual report from the year’s summary entries and adjustments (y1–y30, e1–e9). Place each account on its statement, then work out net income, ending retained earnings and total assets; the tool checks each link and shows all four statements, including the statement of cash flows.' },
    { widget: 'lnk-walk', intro: 'Push a change in depreciation through the three main statements. Change the amount, the tax rate and the share of the change in tax that is paid within the year, and watch which figures move and how the balance sheet stays in balance.' },
    { widget: 'lnk-trace', intro: 'Analyse seven of Lantern’s entries, from the van in June to the year-end income tax. For each, choose the accounts, the sides and the amounts, then tick every statement it changes and, if cash moves, the activity. Watch for the entries that change the statement of cash flows without touching the income statement, and the reverse.' },
  ],

  mistakes: [
    { title: '“Tax can be left out of a three-statement walkthrough.”', html: 'Without tax, $1,000 more depreciation would lower net income by $1,000 and leave cash unchanged. With tax at 25%, net income falls by only $750, and the $250 of tax saved is cash once the tax is paid. Every pretax change has a tax echo on all three statements: in income tax expense, in cash or income taxes payable, and in retained earnings.' },
    { title: '“If the balance sheet balances, the statements are right.”', html: 'Balancing is one test among several. Hatherley Print Studio’s balance sheet balanced while its statement of cash flows was wrong in two places. Run every link, and remember that some errors, such as an expense posted to the wrong expense account, break none of them.' },
    { title: '“A dividend reduces cash when it is declared.”', html: 'Declaring a dividend reduces retained earnings and creates Dividends Payable; cash falls only when it is paid, and that payment is the financing outflow. A December declaration paid in January appears in this year’s statement of changes in equity and next year’s statement of cash flows.' },
    { title: '“The tax saved by an extra expense is always cash this year.”', html: 'Only if the change in tax is paid within the year. Lantern’s estimated payments were fixed at $6,000, so $1,000 more depreciation would lower income taxes payable by $250 and leave 2026’s operating cash flow unchanged; the cash saving arrives when the tax is paid in 2027.' },
    { title: '“Operating cash flow above net income is always good news.”', html: 'Lantern’s operating cash flow exceeds its net income by $12,553, but $21,289 of its operating cash came from liabilities that will be paid, or worked off, early in 2027. Read where each part of the gap sits before drawing a conclusion from its size.' },
    { title: '“An entry with no cash never appears in the statement of cash flows.”', html: 'It never changes a cash total, but it can still appear. The accrued interest (e5) shows up in Lantern’s indirect reconciliation as an increase in interest payable, offsetting its effect on net income and on income taxes payable, and the $20,000 van note appears in the noncash disclosure beneath the statement. Count an entry as a cash flow only when cash moves.' },
  ],

  application: [
    { p: 'Coastline Bank’s credit analyst receives Lantern’s annual report in February 2027. Before calculating anything she repeats the accountant’s checks, because statements that don’t articulate can’t be relied on, and then reads the statements in pairs. The income statement and the statement of cash flows together show that Lantern’s operations produced more cash than profit; the balance sheet shows why: $21,289 of operating liabilities, most of which fall due early in 2027.' },
    { p: 'Her next step is a forecast for 2027, which she builds as a <g>three-statement model</g>. Assumptions about sales, margins, how quickly customers pay and suppliers are paid, and capital spending drive a forecast income statement and balance sheet; the statement of cash flows is derived from the changes between the two balance sheets. The links are the model’s skeleton. Forecast net income feeds retained earnings, forecast depreciation feeds accumulated depreciation and the add-back, and the van note’s $5,000 instalment reduces both cash and the liability. If the forecast balance sheet doesn’t balance, a link is missing, and she finds it the way the accountant finds errors in a draft: by the size and direction of the difference.' },
    { p: 'The model answers the lender’s real question: can Lantern pay the $5,000 instalment and $1,200 of interest due on the van note on 1 June 2027, and $600 of interest on the Coastline note during the year, from its own operations, now that it also pays Ana a salary? Read together, the 2026 statements suggest it can, provided the first year’s timing benefit is not mistaken for a permanent level of cash flow. Ratios that summarise this kind of judgement, such as cash flow relative to debt payments, belong to F03; the reasoning they rest on is the articulation in this lesson.' },
  ],

  summary: [
    'Comparative balance sheets list balances at two moments; the income statement, the statement of changes in equity and the statement of cash flows explain how they moved in between.',
    'Three links and one identity: net income to the statement of changes in equity, ending equity to the balance sheet, ending cash to the balance sheet, and assets = liabilities + equity. Lantern: 27,387; 42,387; 42,940; 93,676 = 51,289 + 42,387.',
    'Roll-forwards (opening + movements = closing) extend the checks to tax, interest, accumulated depreciation and receivables. When a link fails, a gap equal to an item suggests an omission and twice an item a sign error.',
    'A transaction reaches equity through any revenue, expense or dividend it touches and the statement of cash flows through any cash it moves; an entry with no cash changes no cash total, though it may appear as offsetting reconciliation lines or in the noncash disclosure.',
    'Lantern’s $12,553 gap between operating cash flow and net income sits in three places: depreciation of $4,800 on assets already paid for or financed, $13,536 of operating current assets, and $21,289 of operating current liabilities that reverse early in 2027.',
    'One change through three statements: $1,000 more depreciation at 25% lowers net income by $750; operating cash flow rises by $250 only if the change in tax is paid within the year, otherwise income taxes payable fall instead.',
    'Retained earnings show how much of the profit earned has been kept in the business; state law and lenders’ covenants set what it may legally distribute, and the balance sheet and the statement of cash flows show what it can afford.',
  ],

  glossary: [
    { term: 'Annual report', def: 'The document a business issues after its financial year: the financial statements and their notes, and, for larger companies, management’s commentary and the auditor’s report.' },
    { term: 'Roll-forward', def: 'A check or schedule that starts from an account’s opening balance, adds and subtracts the period’s movements and arrives at its closing balance, with each movement traced to another statement or to the ledger.' },
    { term: 'Tie-out', def: 'Confirming that a figure shown in one statement or note agrees with the same figure wherever else it appears and with the ledger.' },
    { term: 'Three-statement model', def: 'A financial model in which the income statement, balance sheet and statement of cash flows are linked, so that a change in one assumption flows through all three and the forecast balance sheet still balances.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 2.1, “Describe the Income Statement, Statement of Owner’s Equity, Balance Sheet, and Statement of Cash Flows, and How They Interrelate”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/2-1-describe-the-income-statement-statement-of-owners-equity-balance-sheet-and-statement-of-cash-flows-and-how-they-interrelate', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 16.3, “Prepare the Statement of Cash Flows Using the Indirect Method”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/16-3-prepare-the-statement-of-cash-flows-using-the-indirect-method', checked: '2026-10-23' },
    { text: 'US Securities and Exchange Commission. <i>Beginners’ Guide to Financial Statements</i> (“Cash Flow Statements” and “Bringing It All Together”).', url: 'https://www.sec.gov/about/reports-publications/beginners-guide-financial-statements', checked: '2026-10-23' },
  ],

  checks: [
    // case figures quoted
    { what: 'Van note principal', value: F.vanNote.principal, shown: 20000 },
    { what: 'Net income', value: D.netIncome, shown: 27387 },
    { what: 'Cash from operations', value: D.cfo, shown: 39940 },
    { what: 'Cash from operations (indirect)', value: D.cfoIndirect, shown: 39940 },
    { what: 'Net revenue', value: D.revenue, shown: 193320 },
    { what: 'Expenses and tax in the figure', value: D.revenue - D.netIncome, shown: 165933 },
    { what: 'Dividends', value: D.dividends, shown: 5000 },
    { what: 'Retained earnings', value: D.retainedEarnings, shown: 22387 },
    { what: 'Retained earnings link', value: 0 + D.netIncome - D.dividends, shown: 22387 },
    { what: 'Common stock', value: F.stock, shown: 20000 },
    { what: 'Equity', value: D.equity, shown: 42387 },
    { what: 'Equity = stock + RE', value: F.stock + D.retainedEarnings, shown: 42387 },
    { what: 'Cash', value: D.cashEnd, shown: 42940 },
    { what: 'Other (noncash) assets', value: D.totalAssets - D.cashEnd, shown: 50736 },
    { what: 'Total assets', value: D.totalAssets, shown: 93676 },
    { what: 'Total liabilities', value: D.totalLiabilities, shown: 51289 },
    { what: 'L + E', value: D.totalLiabilities + D.equity, shown: 93676 },
    { what: 'Investing', value: D.cfi, shown: -22000 },
    { what: 'Financing', value: D.cff, shown: 25000 },
    { what: 'Cash link', value: 0 + D.cfo + D.cfi + D.cff, shown: 42940 },
    { what: 'Income tax expense', value: D.incomeTax, shown: 9129 },
    { what: 'Income taxes paid', value: D.incomeTaxesPaid, shown: 6000 },
    { what: 'Estimated payments fixed at', value: F.tax.estimatedPaid, shown: 6000 },
    { what: 'Income taxes payable', value: D.taxPayable, shown: 3129 },
    { what: 'Tax roll-forward', value: 0 + D.incomeTax - D.incomeTaxesPaid, shown: 3129 },
    { what: 'Interest expense', value: D.interestExpense, shown: 1200 },
    { what: 'Interest paid', value: D.interestPaid, shown: 450 },
    { what: 'Interest payable', value: bal('Interest Payable'), shown: 750 },
    { what: 'Interest roll-forward', value: 0 + D.interestExpense - D.interestPaid, shown: 750 },
    { what: 'Depreciation', value: D.depreciation, shown: 4800 },
    { what: 'Accumulated depreciation, equipment', value: bal('Accumulated Depreciation—Equipment'), shown: 2000 },
    { what: 'Accumulated depreciation, van', value: bal('Accumulated Depreciation—Van'), shown: 2800 },
    { what: 'Depreciation roll-forward', value: bal('Accumulated Depreciation—Equipment') + bal('Accumulated Depreciation—Van'), shown: 4800 },
    { what: 'Catering invoiced', value: F.catering.invoiced, shown: 59920 },
    { what: 'Catering collected', value: F.catering.collected, shown: 51720 },
    { what: 'Written off', value: F.catering.writtenOff, shown: 820 },
    { what: 'Receivables roll-forward', value: 0 + F.catering.invoiced - F.catering.collected - F.catering.writtenOff, shown: 7380 },
    { what: 'Accounts receivable (gross)', value: bal('Accounts Receivable'), shown: 7380 },
    // trace table and paragraphs
    { what: 'Van cost', value: F.van.cost, shown: 30000 },
    { what: 'Van cash', value: F.van.cashDown, shown: 10000 },
    { what: 'Van depreciation 2026 (e4)', value: adj('e4').lines[0].dr, shown: 2800 },
    { what: 'Van note interest Jun–Dec', value: F.vanNote.principal * F.vanNote.rate * F.vanNote.months / 12, shown: 700 },
    { what: 'Van note current portion', value: bal('Current Portion of Long-Term Debt'), shown: 5000 },
    { what: 'Van note noncurrent part', value: F.vanNote.principal - F.vanNote.instalment, shown: 15000 },
    { what: 'e5 accrued interest', value: adj('e5').lines[0].dr, shown: 750 },
    { what: 'Online sales', value: D.onlineSales, shown: 111025 },
    { what: 'Prepaid subscriptions', value: F.shop.prepaidSubscriptions, shown: 2960 },
    { what: 'Shop cash received (y12)', value: F.shop.sales + F.shop.prepaidSubscriptions, shown: 113985 },
    { what: 'Write-down (e7)', value: wd, shown: 400 },
    { what: 'Write-down = Holiday Blend cost − NRV', value: F.inventory.holidayBlend.cost - F.inventory.holidayBlend.nrv, shown: 400 },
    { what: 'Tax saved by the write-down', value: t * wd, shown: 100 },
    { what: 'Net income effect of the write-down', value: (1 - t) * wd, shown: 300 },
    { what: 'Write-down effects cancel', value: -(1 - t) * wd + wd - t * wd, shown: 0 },
    { what: 'Inventory', value: D.inventoryEnd, shown: 5800 },
    { what: 'Van depreciation per month', value: F.van.monthly, shown: 400 },
    { what: 'Van note interest per month', value: F.vanNote.principal * F.vanNote.rate / 12, shown: 100 },
    { what: 'Receivables (net)', value: D.receivablesNet, shown: 6796 },
    { what: 'Bad debt expense', value: D.badDebt, shown: 1404 },
    // where the gap sits
    { what: 'Gap CFO − NI', value: D.cfo - D.netIncome, shown: 12553 },
    { what: 'Operating current assets', value: D.operatingCurrentAssets, shown: 13536 },
    { what: 'Operating current liabilities', value: D.operatingCurrentLiabilities, shown: 21289 },
    { what: 'Gap = depreciation − op. assets + op. liabilities', value: D.depreciation - D.operatingCurrentAssets + D.operatingCurrentLiabilities, shown: 12553 },
    { what: 'Unearned revenue', value: bal('Unearned Revenue'), shown: 6100 },
    // walkthrough
    { what: 'Tax rate (%)', value: t * 100, shown: 25 },
    { what: 'Tax saved on $1,000', value: t * 1000, shown: 250 },
    { what: 'Net income change', value: -(1 - t) * 1000, shown: -750 },
    { what: 'CFO change (tax paid)', value: -(1 - t) * 1000 + 1000, shown: 250 },
    { what: 'Assets change (tax paid)', value: t * 1000 - 1000, shown: -750 },
    { what: 'Lantern variant: CFO change', value: -(1 - t) * 1000 + 1000 - t * 1000, shown: 0 },
    { what: 'Lantern variant: assets = liabilities + equity', value: -1000, shown: -250 + -750 },
    // Thornwick
    { what: 'Thornwick dividends', value: BR.reBeg + BR.ni - BR.reEnd, shown: 12000 },
    { what: 'Thornwick ending cash', value: BR.cashBeg + BR.cfo + BR.cfi + BR.cff, shown: BR.cashBS },
    { what: 'Thornwick change in cash', value: BR.cashBS - BR.cashBeg, shown: 7000 },
    { what: 'Thornwick equity', value: BR.stock + BR.reEnd, shown: 116000 },
    { what: 'Thornwick L + E', value: BR.liab + BR.stock + BR.reEnd, shown: BR.assets },
    { what: 'Thornwick payout (a quarter)', value: 12000 / 48000, shown: 0.25 },
    // Hatherley
    { what: 'Hatherley RE', value: CI.reBeg + CI.ni - CI.div, shown: 54200 },
    { what: 'Hatherley draft CFO', value: ciCfoDraft, shown: 50000 },
    { what: 'Hatherley corrected CFO', value: ciCfo, shown: 43600 },
    { what: 'Hatherley draft CFF', value: -(CI.loan + CI.div), shown: -17000 },
    { what: 'Hatherley draft ending cash', value: ciEndDraft, shown: 19800 },
    { what: 'Hatherley corrected ending cash', value: ciEnd, shown: 22400 },
    { what: 'Hatherley shortfall', value: ciEnd - ciEndDraft, shown: 2600 },
    { what: 'Hatherley after removing dividend', value: ciEndDraft + CI.div, shown: 28800 },
    { what: 'Hatherley excess', value: ciEndDraft + CI.div - ciEnd, shown: 6400 },
    { what: 'Hatherley twice receivables', value: 2 * CI.ar, shown: 6400 },
    { what: 'Hatherley CFO difference', value: ciCfoDraft - ciCfo, shown: 6400 },
    // Ana's dividend
    { what: 'Current liabilities', value: D.currentLiabilities, shown: 26289 },
    { what: 'Liabilities needing cash', value: cashClaims, shown: 20189 },
    { what: 'Cash after claims', value: afterClaims, shown: 22751 },
    { what: 'Left after $20,000 dividend', value: afterClaims - 20000, shown: 2751 },
    { what: 'Left after dividend < half a month of fixed costs', value: (afterClaims - 20000) / monthlyFixed, shown: 0.39, tol: 0.01 },
    { what: 'Monthly rent', value: F.rent.monthly, shown: 1200 },
    { what: 'Shop and office wages (ten months)', value: F.wages.shopAndOffice, shown: 18400 },
    { what: 'Shop and office wages per month', value: F.wages.shopAndOffice / F.period.months, shown: 1840 },
    { what: 'Ana’s salary a year (f04 case)', value: ANA_PLAN.salaryFromLantern, shown: 48000 },
    { what: 'Ana’s salary a month', value: salaryMonthly, shown: 4000 },
    { what: 'Monthly fixed cash costs 2027', value: monthlyFixed, shown: 7040 },
    { what: 'Three-month cushion', value: cushion, shown: 21120 },
    { what: 'Largest dividend', value: afterClaims - cushion, shown: 1631 },
    { what: 'About $1,600', value: afterClaims - cushion, shown: 1600, tol: 50 },
    { what: 'Van instalment', value: F.vanNote.instalment, shown: 5000 },
    { what: 'Tax payable in cushion step', value: D.taxPayable, shown: 3129 },
    // application
    { what: 'Van note interest due 1 June 2027', value: F.vanNote.principal * F.vanNote.rate, shown: 1200 },
    { what: 'Coastline interest in 2027 (four quarters)', value: F.coastline.principal * F.coastline.rate, shown: 600 },
  ],
};
