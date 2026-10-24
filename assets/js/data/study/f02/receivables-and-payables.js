// receivables-and-payables.js — F02 · Receivables and payables. Content only; exercises are in receivables-and-payables.ex.js.
// Uses FACTS (catering invoices, collections, the Quayline write-off, payables), AGING, ADJUSTMENTS (e6) and DERIVED from
// case.js. Every Lantern figure in `checks` is recomputed from those imports. Other businesses here are fictional.
import { FACTS, AGING, DERIVED, LEDGER, YEAR, ADJUSTMENTS } from './case.js';

const F = FACTS;
const cat = F.catering;
const bal = (n) => LEDGER[n]?.balance || 0;
const tx = (id) => [...YEAR, ...ADJUSTMENTS].find((t) => t.id === id);
const line = (id, acct) => tx(id).lines.find((l) => l.acct === acct);
const agingRequired = AGING.reduce((s, b) => s + b.amount * b.rate, 0);
const fmt = (n) => n.toLocaleString('en-US');
const pct = (r) => `${Math.round(r * 100)}%`;
const vanNoteInterest = F.vanNote.principal * F.vanNote.rate * F.vanNote.months / 12;
// Fernbrook Office Furniture (simple example)
const FERN = [['Not yet due', 48000, 0.01], ['1–30 days past due', 12500, 0.04], ['31–60 days past due', 6200, 0.15], ['Over 60 days past due', 3300, 0.5]];
const fernAR = FERN.reduce((s, b) => s + b[1], 0);
const fernReq = FERN.reduce((s, b) => s + b[1] * b[2], 0);
// Corrib Outdoor Clothing (challenging example)
const COR = [['Not yet due', 168000, 0.01], ['1–30 days past due', 42000, 0.04], ['31–90 days past due', 21000, 0.12], ['Over 90 days past due', 9000, 0.5]];
const corAR = COR.reduce((s, b) => s + b[1], 0);
const corReq = COR.reduce((s, b) => s + b[1] * b[2], 0);
const corUnadj = 9000 - 11600 + 1100;           // credit balance (negative = debit)
// Lantern applied example: a 2/10, n/30 offer from Kilnworth (hypothetical)
const monthlyPurchases = F.inventory.purchases / F.period.months;   // 5,860
const discountRate = 0.02 / 0.98 * 365 / 20;
const discountEAR = (1 / 0.98) ** (365 / 20) - 1;

export default {
  slug: 'receivables-and-payables',
  title: 'Receivables and payables',
  blurb: 'Selling on credit creates receivables, and some of them will never be paid. Learn the allowance method that US GAAP and IFRS require, estimate bad debts by aging and by a percentage of sales, account for notes receivable, and build up a business’s current liabilities, using Lantern’s first year-end.',
  status: 'reviewed',
  objectives: [
    'Explain why US GAAP and IFRS require the allowance method for receivables, what the CECL model (ASC 326) asks for, and why the direct write-off method is acceptable only for immaterial amounts.',
    'Calculate the allowance for doubtful accounts by aging receivables and by a percentage of credit sales, and the bad debt expense when the allowance has a credit or a debit balance before adjustment.',
    'Record credit sales, collections, write-offs, recoveries and the year-end bad debt adjustment, and report receivables net of the allowance.',
    'Calculate the interest on a note receivable and record its accrual and collection.',
    'Identify and measure a business’s current liabilities (accounts payable, accrued liabilities, unearned revenue and income taxes payable) and assemble them for the balance sheet.',
  ],
  prerequisites: [
    { lesson: 'f01/adjusting-entries', why: 'The bad debt estimate is an adjusting entry, and interest on notes is accrued with I = P × r × t as you did there.' },
    { lesson: 'f01/general-ledger', why: 'Accounts Receivable is a control account backed by a subsidiary ledger of customers.' },
    { lesson: 'f02/revenue-recognition', why: 'A receivable arises when revenue is recognised before the customer pays; that lesson also covers sales discounts and unearned revenue.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s online shop is paid by card when each order is placed, so it never waits for its money. Catering is different. Apart from Harbor Tech’s prepaid events, Lantern invoiced its catering clients $59,920 during the year on 30-day terms, and by 31 December it had collected $51,720. One client, Quayline Events, closed down in November owing $820 for a September event, and Lantern wrote the invoice off. The other $7,380 is still owed: some of it will arrive in January, and some of it, almost certainly, never will.' },
    { p: 'When a business delivers goods or services and lets the customer pay later, it holds <g>accounts receivable</g>: the customer’s obligation to pay, usually within 30 to 60 days and without interest. Under IFRS they are called trade receivables. Each invoice states the <g>credit terms</g>. Lantern’s “n/30” means the full (net) amount is due within 30 days; “2/10, n/30” would offer 2% off to a client who pays within 10 days. Discounts for prompt payment (<g>sales discounts</g>) reduce revenue and are covered in the revenue recognition lesson; this lesson is about what happens after the invoice is sent.' },
    { p: 'Businesses sell on credit because customers expect it. Corporate clients, hotels and event agencies pay suppliers by invoice, and a caterer that demanded cash in advance from all of them would lose work. The price of credit is that some customers pay late and a few never pay. That raises two accounting questions: when should the loss from customers who won’t pay be recognised as an expense, and at what amount should the receivables be shown on the balance sheet?' },
    { p: 'Both questions have the same answer, the <g>allowance method</g>. At the end of each period the business estimates how much of its receivables it does not expect to collect, records that amount as <g>bad debt expense</g> in the period of the sales, and holds it in the <g>allowance for doubtful accounts</g>, a <g>contra account</g> deducted from Accounts Receivable. The difference, <g>net receivables</g>, is the amount the business expects to collect. When a particular customer later proves unable to pay, the account is written off against the allowance, with no new expense, because the loss was already expected and recorded.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 250" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><g fill="currentColor"><text x="20" y="28" font-weight="600">Invoiced to catering clients in 2026: $59,920</text></g><rect x="20" y="40" width="517.9" height="36" fill="var(--series-1)" opacity="0.85"/><rect x="537.9" y="40" width="8.2" height="36" fill="var(--series-3)"/><rect x="546.1" y="40" width="73.9" height="36" fill="var(--series-2)"/><g fill="currentColor"><text x="30" y="98">Collected $51,720</text><text x="535" y="98" text-anchor="end">Written off $820</text><text x="620" y="116" text-anchor="end">Still owed $7,380</text></g><path d="M546.1 76 V82 M620 76 V82 M546.1 124 L20 146 M620 124 V146" stroke="var(--rule-strong)" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/><rect x="20" y="150" width="552.5" height="36" fill="var(--series-2)" opacity="0.85"/><rect x="572.5" y="150" width="47.5" height="36" fill="var(--series-3)"/><g fill="currentColor"><text x="20" y="208">Expected to be collected $6,796</text><text x="620" y="208" text-anchor="end">Allowance $584</text><text x="20" y="236" font-weight="600">Still owed at 31 December, $7,380, split by the year-end estimate</text></g></svg>',
      caption: 'Where Lantern’s catering invoices went in 2026, and how the year-end estimate divides what is still owed (fictional figures in dollars; bar lengths to scale within each bar).',
      alt: 'Two horizontal bars. The first represents the $59,920 invoiced to catering clients in 2026 and is divided into three parts: $51,720 collected, a thin slice of $820 written off for Quayline Events, and $7,380 still owed at 31 December. Dashed lines lead from the still-owed part to a second bar, which enlarges that $7,380 and divides it into $6,796 expected to be collected and an allowance of $584 for the amount not expected to be collected.',
    } },
    { p: 'Lantern’s year-end shows the method at work. The $820 owed by Quayline is gone: there is no point listing it as an asset. Of the $7,380 still owed, Lantern’s accountant expects $584 not to be collected, so the balance sheet shows receivables of $7,380 less an allowance of $584, net $6,796. The year’s bad debt expense covers both losses, the $820 already known and the $584 expected, which is why the adjusting entry is for $1,404. The rest of this lesson explains each step, then turns to the other side of the balance sheet: what Lantern owes.' },
    { callout: 'key', title: 'Two events, two entries', html: 'The <b>estimate</b> at the period end is the expense: debit Bad Debt Expense, credit Allowance for Doubtful Accounts. The <b>write-off</b> of a named customer is not an expense: debit Allowance for Doubtful Accounts, credit Accounts Receivable. Keeping them apart puts the loss in the period of the sale, whenever the customer is finally given up on.' },
    { p: 'Payables are the mirror image. Lantern buys beans from Kilnworth Roasting on 30-day terms, owes its staff for the last days of December, owes interest on two notes, holds customers’ money for services it has not yet delivered, and owes income tax for the year. Each is a <g>current liability</g>, and each is measured differently. Together they tell a lender, and Ana, how much cash Lantern must find in the next few months.' },
  ],

  theory: [
    { h: 'Accounts receivable over a year' },
    { p: String.raw`Accounts Receivable is a <g>control account</g>: behind it sits a <g>subsidiary ledger</g> with one account for each client, so that Lantern knows who owes what and since when. The balance moves in a simple pattern, which the formula card calls the receivables roll-forward: what was owed at the start, plus credit sales, minus collections, minus write-offs. Lantern began in March with nothing owed, so its year is <m>0 + 59{,}920 - 51{,}720 - 820 = 7{,}380</m>. A business that knows three of the four movements can always find the fourth, a quick reasonableness check that auditors use on collections.` },
    { taccounts: { caption: 'Lantern’s receivables accounts for 2026 (fictional): y8 invoices, y9 collections, y10 the Quayline write-off, e6 the year-end estimate', accounts: [
      { name: 'Accounts Receivable', dr: [['y8 invoiced', 59920]], cr: [['y9 collected', 51720], ['y10 written off', 820]] },
      { name: 'Allowance for Doubtful Accounts', dr: [['y10 written off', 820]], cr: [['e6 estimate', 1404]] },
    ] } },
    { h: 'Why the direct write-off method is not enough' },
    { p: 'The simplest approach, the <g>direct write-off method</g>, records nothing until a particular customer is known not to pay, and then debits Bad Debt Expense and credits Accounts Receivable. Small businesses that keep their books for tax often work this way. It fails as financial reporting for two reasons. The expense lands in the period when the customer gives up, which is often a later year than the sale that earned the revenue. And until then the balance sheet shows receivables at the full amount owed, although some of that amount is not expected to be collected.' },
    { p: 'For these reasons US GAAP and IFRS require receivables to be measured net of expected losses, which means an allowance. The direct write-off method survives only where bad debts are immaterial: the Codification itself says that its provisions need not be applied to immaterial items (ASC 105-10-05-6), so a business whose losses are trivially small may expense them when they occur. Tax rules are different. The IRS lets a business deduct a bad debt when it becomes wholly or partly worthless, so the tax deduction follows the write-off, not the estimate, and a company’s books and tax return will show different bad debt figures for the same year.' },
    { h: 'The allowance method, entry by entry' },
    { p: 'Three kinds of entry run through the allowance account. The <b>estimate</b> is an adjusting entry at the period end: debit Bad Debt Expense, credit Allowance for Doubtful Accounts. The <b>write-off</b> of a named customer removes the balance from both the subsidiary ledger and the control account: debit the allowance, credit Accounts Receivable. A <b>recovery</b>, when a customer who was written off later pays after all, is recorded in two steps: first reverse the write-off for the amount recovered (debit Accounts Receivable, credit the allowance), then record the cash received (debit Cash, credit Accounts Receivable). Reinstating the receivable first keeps the customer’s history complete, so the credit file shows that the customer did pay.' },
    { journal: { caption: 'Lantern’s write-off and year-end estimate, and a recovery in 2027 (y10 and e6 are from the case; the recovery is hypothetical)', entries: [
      { date: '2026-11-20', lines: [{ acct: 'Allowance for Doubtful Accounts', dr: 820 }, { acct: 'Accounts Receivable', cr: 820 }], memo: 'y10: Quayline Events has closed down owing $820; the invoice is written off. No expense is recorded here.' },
      { date: '2026-12-31', lines: [{ acct: 'Bad Debt Expense', dr: 1404 }, { acct: 'Allowance for Doubtful Accounts', cr: 1404 }], memo: 'e6: the aging requires an allowance of $584; the account has a debit balance of $820, so the entry is 584 + 820.' },
      { date: '2027-04-05', lines: [{ acct: 'Accounts Receivable', dr: 300 }, { acct: 'Allowance for Doubtful Accounts', cr: 300 }], memo: 'Suppose Quayline’s liquidator later pays $300: first reinstate that part of the receivable …' },
      { date: '2027-04-05', lines: [{ acct: 'Cash', dr: 300 }, { acct: 'Accounts Receivable', cr: 300 }], memo: '… then record the cash collected.' },
    ] } },
    { p: 'In a business that keeps its allowance up to date, a write-off changes neither total assets nor net receivables: receivables and the allowance fall by the same amount. With receivables of $10,000 and an allowance of $900, net receivables are $9,100; writing off $820 leaves $9,180 less $80, still $9,100. Lantern’s position was different: it prepares annual statements and made its first estimate only at 31 December, so when Quayline was written off in November there was nothing in the allowance to absorb it. The account went into a debit balance of $820, which means only that a loss happened before any had been expected. The year-end adjustment must cover that loss as well as building the $584 needed for the receivables still held.' },
    { h: 'Estimating the allowance' },
    { p: 'There are two ways to arrive at the estimate. The <b>income statement approach</b> applies a loss rate to the period’s credit sales and records that amount as the expense; whatever is left in the allowance afterwards is the balance. The <b>balance sheet approach</b> starts from the receivables still held at the period end, decides how large the allowance must be, and records whatever expense brings the account to that balance. Its most common form is an <g>aging of receivables</g>, which sorts each customer’s balance by how long it has been outstanding and applies a higher loss rate to older balances, because the longer an invoice is overdue the less likely it is to be paid.' },
    { table: {
      caption: 'Lantern Coffee Co.: aging of receivables at 31 December 2026 (fictional)',
      head: ['Age of balance', 'Amount owed ($)', 'Expected loss rate', 'Allowance needed ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: AGING.map((b) => [b.band, fmt(b.amount), pct(b.rate), fmt(Math.round(b.amount * b.rate))]),
      foot: [['Total', fmt(AGING.reduce((s, b) => s + b.amount, 0)), '', fmt(agingRequired)]],
      note: 'The rates are the accountant’s estimates. With no history of its own, a new business bases them on industry experience and on what it knows about each client, and refines them as its own record builds up. The $820 more than 60 days overdue is another client’s September event, not Quayline’s invoice, which was written off in November and is no longer in receivables.',
    } },
    { p: String.raw`The aging says that $584 of the $7,380 should be held as an allowance. Before the adjustment the allowance has a debit balance of $820, so the entry must first bring it back to zero and then build the $584 credit: bad debt expense is <m>584 + 820 = 1{,}404</m> (adjustment e6). Had the allowance started with a credit balance, say $200 left over from earlier estimates, the expense would have been only <m>584 - 200 = 384</m>. The rule is the same in every case: expense = required balance − the balance already there, with a debit balance counted as a negative. After e6, net receivables are <m>7{,}380 - 584 = 6{,}796</m>.` },
    { p: 'The adjustment can also run the other way. If fewer customers default than expected, the allowance may already hold more than the aging requires; the entry then debits Allowance for Doubtful Accounts and credits Bad Debt Expense for the excess, reducing the year’s expense.' },
    { p: String.raw`The income statement approach would have given a different answer. Suppose Lantern’s accountant had expected losses of 2% of credit sales: the expense would be <m>0.02 \times 59{,}920 = 1{,}198.40</m>, and the allowance would end the year at <m>1{,}198.40 - 820 = 378.40</m>, about $206 less than the aging says the receivables actually held need. The percentage of sales is quick and keeps the expense in proportion to the year’s sales, but nothing in it tests whether the allowance left on the balance sheet is a sensible estimate. A business may use it for monthly estimates, but at the reporting date the allowance itself has to be supported.` },
    { callout: 'standards', title: 'Expected credit losses: CECL (ASC 326) and IFRS 9', html: 'US GAAP measures trade receivables under the current expected credit loss (CECL) model of ASC 326-20, introduced by ASU 2016-13 and in force, after the deferral in ASU 2019-10, for private companies such as Lantern for fiscal years beginning after 15 December 2022 (SEC filers other than smaller reporting companies applied it to fiscal years beginning after 15 December 2019). The allowance is a valuation account deducted from the receivables to present “the net amount expected to be collected” (ASC 326-20-30-1). It must reflect losses expected over the receivables’ contractual term, estimated from historical experience adjusted for current conditions and reasonable and supportable forecasts, and assessed on a pool basis for receivables with similar risk. ASC 326-20-30-3 accepts several methods, including “methods that utilize an aging schedule”. ASU 2025-05 (July 2025, effective for annual periods beginning after 15 December 2025) adds a practical expedient for current receivables arising under ASC 606: an entity may assume that conditions at the balance sheet date do not change over the receivables’ remaining life, and a private company that does so may also take account of cash collected after the year end.' },
    { p: 'IFRS 9 reaches a similar place by a different route: for trade receivables without a significant financing component, the loss allowance is always measured at lifetime expected credit losses (IFRS 9, paragraph 5.5.15), often using a provision matrix much like an aging schedule. Under either framework the allowance is not zero just because no customer has yet defaulted: some loss is expected on almost any pool of receivables. The older incurred-loss rules, which this course doesn’t use, recorded a loss only once it was probable that it had already happened. For short trade receivables the two models often give similar numbers; the difference shows most in long-term loans, which are a subject for later courses.' },
    { h: 'Notes receivable' },
    { p: String.raw`A <g>note receivable</g> is a written promise by a customer or borrower to pay a stated sum on a stated date, usually with interest. Businesses take notes for large sales on longer terms, for loans to suppliers or staff, and sometimes in place of an overdue invoice, because a signed note is easier to enforce and earns interest. Interest is calculated as for a loan, <m>I = P \times r \times t</m>, and accrued at each period end as accrued revenue. A note due within a year of the balance sheet date is a current asset; a longer one is noncurrent. If the maker fails to pay at maturity (a dishonoured note), the holder usually transfers the principal and interest due back into Accounts Receivable and pursues it, or writes it off against the allowance.` },
    { journal: { caption: 'Tarnside Joinery (fictional) takes a $6,000, six-month, 8% note in place of an overdue invoice', entries: [
      { date: '2026-11-01', lines: [{ acct: 'Notes Receivable', dr: 6000 }, { acct: 'Accounts Receivable', cr: 6000 }], memo: 'The customer signs a note due 1 May 2027 for the $6,000 invoice it cannot pay on time.' },
      { date: '2026-12-31', lines: [{ acct: 'Interest Receivable', dr: 80 }, { acct: 'Interest Revenue', cr: 80 }], memo: 'Two months of interest: 6,000 × 0.08 × 2/12.' },
      { date: '2027-05-01', lines: [{ acct: 'Cash', dr: 6240 }, { acct: 'Notes Receivable', cr: 6000 }, { acct: 'Interest Receivable', cr: 80 }, { acct: 'Interest Revenue', cr: 160 }], memo: 'Principal plus six months’ interest of 240; the 80 accrued in 2026 is collected, and 160 is 2027’s revenue.' },
    ] } },
    { h: 'Accounts payable and accrued liabilities' },
    { p: 'On the other side of the balance sheet, <g>accounts payable</g> (trade payables under IFRS) are amounts owed to suppliers for goods and services bought on credit. They are recorded when the goods or services are received, at the amount on the invoice, and removed when the supplier is paid. Lantern’s payables come from three sources: the beans bought from Kilnworth Roasting, supplies for events and workshops, and December’s utilities bill.' },
    { p: 'An <g>accrued liability</g> is the balance sheet side of an <g>accrued expense</g>: a cost incurred but not yet paid, for which no supplier’s invoice may yet exist. Wages earned in the last days of a period, interest building up on a loan, and utilities used but not yet billed are the usual examples. They are recorded by adjusting entries, as in F01. Some companies show them as a single line, “accrued liabilities”; Lantern shows Wages Payable and Interest Payable separately.' },
    { p: 'Two other current liabilities complete the list. <g>Unearned revenue</g> is cash received for goods or services not yet delivered, called a <g>contract liability</g> in ASC 606 and IFRS 15; the revenue recognition lesson explains how it arises. It will be settled by delivering the service, not by paying cash. <g>Income taxes payable</g> is the tax owed for the period less the estimated payments already made. Lantern’s tax for the year is $9,129, 25% of its income before tax of $36,516; it paid $6,000 during the year, so $3,129 is still owed at 31 December.' },
    { table: {
      caption: 'Lantern Coffee Co.: current liabilities at 31 December 2026 and where each comes from (fictional)',
      head: ['Liability', 'Amount ($)', 'Made up of', 'Settled by'],
      align: ['l', 'r', 'l', 'l'],
      rows: [
        ['Accounts payable', fmt(bal('Accounts Payable')), 'Kilnworth 8,400 (58,600 bought − 50,200 paid); supply vendors 520 (11,540 − 11,020); December utilities 290', 'Paying cash, in January'],
        ['Wages payable', fmt(bal('Wages Payable')), 'Wages earned in late December (y20)', 'Paying cash on 5 January'],
        ['Interest payable', fmt(bal('Interest Payable')), 'Coastline note, December, 50; van note, June–December, 700 (e5)', 'Paying cash: 1 March and 1 June 2027'],
        ['Unearned revenue', fmt(bal('Unearned Revenue')), 'Catering deposits 1,640; January workshop 1,500; subscriptions 2,960', 'Delivering the events, workshop and coffee'],
        ['Income taxes payable', fmt(bal('Income Taxes Payable')), 'Tax of 9,129 less 6,000 paid during the year (e9)', 'Paying cash with the tax return'],
        ['Current portion of long-term debt', fmt(bal('Current Portion of Long-Term Debt')), 'Van note instalment due 1 June 2027 (e8)', 'Paying cash; see the balance sheet lesson'],
      ],
      foot: [['Total current liabilities', fmt(DERIVED.currentLiabilities), '', '']],
    } },
    { p: 'The table shows why “current liabilities” is not the same as “cash Lantern must pay”. Of the $26,289, the $6,100 of unearned revenue will be settled by serving customers. The current portion of the van note is the part of a long-term loan due within the next year; the next lesson explains how it is separated from the rest of the note. Every other line will take cash within the next five months.' },
    { h: 'Paying suppliers early' },
    { p: String.raw`When a supplier offers terms such as 2/10, n/30, the buyer chooses between paying 98% of the invoice on day 10 and 100% on day 30. Skipping the discount is in effect borrowing 98% of the invoice for 20 days and paying 2% for the privilege. The cost of that borrowing, at a simple annual rate, is <m>\tfrac{2}{98} \times \tfrac{365}{20} \approx 37.2\%</m>, far above what most businesses pay a bank. That is why well-run businesses take such discounts whenever they have the cash, and why a business that stops taking them is often short of cash. How a discount taken is recorded in the inventory accounts is covered in the inventory lesson.` },
  ],

  formulas: [
    { id: 'receivables-rollforward', name: 'Accounts receivable roll-forward',
      tex: String.raw`\text{AR}_{\text{end}} = \text{AR}_{\text{beg}} + \text{Credit sales} - \text{Collections} - \text{Write-offs}`,
      where: [
        [String.raw`\text{AR}_{\text{beg}}, \text{AR}_{\text{end}}`, 'Accounts receivable at the start and end of the period (gross, before the allowance)', '$'],
        [String.raw`\text{Credit sales}`, 'Sales invoiced to customers on credit during the period', '$'],
        [String.raw`\text{Collections}`, 'Cash received from customers against their accounts', '$'],
        [String.raw`\text{Write-offs}`, 'Customer balances removed as uncollectible during the period', '$'],
      ],
      note: String.raw`Lantern, 2026: <m>0 + 59{,}920 - 51{,}720 - 820 = 7{,}380</m>. A reinstated recovery adds back to receivables and is then collected.` },
    { id: 'aging-allowance', name: 'Allowance required by an aging of receivables',
      tex: String.raw`\text{Required allowance} = \sum_{i} B_i \times r_i`,
      where: [
        [String.raw`B_i`, 'Receivables in age band i (for example, not yet due, 31–60 days, over 60 days)', '$'],
        [String.raw`r_i`, 'Expected loss rate for band i, as a decimal; higher for older bands', ''],
        [String.raw`\sum_{i}`, 'Sum over all the age bands', ''],
      ],
      assumptions: 'The rates reflect past losses adjusted for current conditions and reasonable forecasts.',
      note: String.raw`Lantern: <m>5{,}000 \times 0.02 + 1{,}560 \times 0.10 + 820 \times 0.40 = 584</m>.` },
    { id: 'bad-debt-balance-sheet', name: 'Bad debt expense under the balance sheet approach',
      tex: String.raw`\text{Bad debt expense} = \text{Required allowance} - \text{Unadjusted allowance}`,
      where: [
        [String.raw`\text{Required allowance}`, 'The credit balance the allowance must have after adjustment (from the aging or a percentage of receivables)', '$'],
        [String.raw`\text{Unadjusted allowance}`, 'The allowance’s balance before the adjustment: positive if a credit balance, negative if a debit balance', '$'],
      ],
      note: String.raw`A debit balance adds to the expense: Lantern’s is <m>584 - (-820) = 1{,}404</m>.` },
    { id: 'bad-debt-sales', name: 'Bad debt expense under the income statement approach',
      tex: String.raw`\text{Bad debt expense} = p \times \text{Credit sales}`,
      where: [
        [String.raw`p`, 'Expected loss rate on credit sales, as a decimal', ''],
        [String.raw`\text{Credit sales}`, 'Sales on credit for the period (cash and card sales carry no credit risk)', '$'],
      ],
      note: 'The allowance after adjustment is whatever results: unadjusted balance plus the expense.' },
    { id: 'net-receivables', name: 'Net receivables (net realisable value of receivables)',
      tex: String.raw`\text{Net receivables} = \text{Accounts receivable} - \text{Allowance for doubtful accounts}`,
      where: [
        [String.raw`\text{Accounts receivable}`, 'Gross amount customers owe at the balance sheet date', '$'],
        [String.raw`\text{Allowance for doubtful accounts}`, 'Credit balance of the allowance after adjustment', '$'],
      ],
      note: String.raw`Lantern: <m>7{,}380 - 584 = 6{,}796</m>, the amount it expects to collect.` },
    { id: 'note-interest', name: 'Interest on a note for part of a year',
      tex: String.raw`I = P \times r \times t`,
      where: [
        [String.raw`I`, 'Interest earned (or owed) for the period', '$'],
        [String.raw`P`, 'Principal of the note', '$'],
        [String.raw`r`, 'Annual interest rate, as a decimal', ''],
        [String.raw`t`, 'Time in years: months outstanding ÷ 12', 'years'],
      ] },
    { id: 'discount-cost', name: 'Annualised cost of skipping a cash discount',
      tex: String.raw`\text{Cost} = \dfrac{d}{1 - d} \times \dfrac{365}{n - p}`,
      where: [
        [String.raw`d`, 'Discount for early payment, as a decimal (2% = 0.02)', ''],
        [String.raw`n`, 'Days until the full amount is due (30 in 2/10, n/30)', 'days'],
        [String.raw`p`, 'Last day of the discount period (10 in 2/10, n/30)', 'days'],
      ],
      assumptions: 'A simple (not compounded) annual rate; the buyer would otherwise pay on the last day of each period.',
      note: String.raw`Compounding gives a higher effective annual rate: <m>(1/0.98)^{365/20} - 1 \approx 44.6\%</m> for 2/10, n/30.` },
  ],

  examples: [
    { level: 'simple', title: 'An aging for an office-furniture supplier', fictional: true,
      setup: 'Fernbrook Office Furniture, a fictional supplier to offices and schools, ages its receivables at 31 December as shown. Before adjustment its allowance for doubtful accounts has a credit balance of $1,140. Find the allowance required, the bad debt expense, the adjusting entry and net receivables.',
      table: { head: ['Age of balance', 'Amount ($)', 'Expected loss rate'], align: ['l', 'r', 'r'],
        rows: FERN.map((b) => [b[0], fmt(b[1]), pct(b[2])]), foot: [['Total', fmt(fernAR), '']] },
      steps: [
        String.raw`Apply each band’s rate (aging formula): <m>48{,}000 \times 0.01 = 480</m>; <m>12{,}500 \times 0.04 = 500</m>; <m>6{,}200 \times 0.15 = 930</m>; <m>3{,}300 \times 0.50 = 1{,}650</m>.`,
        String.raw`Required allowance: <m>480 + 500 + 930 + 1{,}650 = 3{,}560</m>.`,
        String.raw`The allowance already has a credit balance of 1,140, so only the difference is new expense: <m>3{,}560 - 1{,}140 = 2{,}420</m>. Entry: debit Bad Debt Expense 2,420; credit Allowance for Doubtful Accounts 2,420.`,
        String.raw`Net receivables: <m>70{,}000 - 3{,}560 = 66{,}440</m>.`,
      ],
      answer: 'Required allowance $3,560; bad debt expense $2,420 (debit Bad Debt Expense, credit Allowance for Doubtful Accounts); net receivables $66,440.',
      interpretation: 'Almost half the allowance comes from the $3,300 more than 60 days overdue, less than 5% of the receivables. Chasing the oldest balances is where Fernbrook’s credit controller can save the most.' },
    { level: 'challenging', title: 'A year in the allowance account', fictional: true,
      setup: 'Corrib Outdoor Clothing, a fictional brand that sells jackets and boots to independent shops on 60-day terms, starts 2026 with an allowance credit balance of $9,000. During the year it makes credit sales of $760,000 and writes off three shops’ balances totalling $11,600. In October a shop written off in 2025 pays $1,100. At 31 December receivables are $240,000, aged as in the table. Record the recovery, find the bad debt expense and net receivables, and compare the result with a policy of 1.5% of credit sales.',
      table: { head: ['Age of balance', 'Amount ($)', 'Expected loss rate'], align: ['l', 'r', 'r'],
        rows: COR.map((b) => [b[0], fmt(b[1]), pct(b[2])]), foot: [['Total', fmt(corAR), '']] },
      journal: { entries: [
        { date: '2026-08-31', lines: [{ acct: 'Allowance for Doubtful Accounts', dr: 11600 }, { acct: 'Accounts Receivable', cr: 11600 }], memo: 'Write-offs of three shops’ balances during the year (three entries, shown here in total).' },
        { date: '2026-10-15', lines: [{ acct: 'Accounts Receivable', dr: 1100 }, { acct: 'Allowance for Doubtful Accounts', cr: 1100 }], memo: 'Recovery: reinstate the part of the 2025 write-off that is being paid.' },
        { date: '2026-10-15', lines: [{ acct: 'Cash', dr: 1100 }, { acct: 'Accounts Receivable', cr: 1100 }], memo: 'Recovery: the cash received.' },
        { date: '2026-12-31', lines: [{ acct: 'Bad Debt Expense', dr: 11880 }, { acct: 'Allowance for Doubtful Accounts', cr: 11880 }], memo: 'Year-end estimate: required 10,380 + debit balance 1,500.' },
      ] },
      steps: [
        'The recovery is two entries: reinstate $1,100 (debit Accounts Receivable, credit the allowance), then record the cash (debit Cash, credit Accounts Receivable). The reinstatement puts the $1,100 back into the allowance, because the loss charged in 2025 turned out not to have happened.',
        String.raw`Unadjusted allowance: <m>9{,}000 - 11{,}600 + 1{,}100 = -1{,}500</m>, a debit balance of 1,500. The year’s write-offs were larger than the opening allowance plus the recovery.`,
        String.raw`Required allowance from the aging: <m>1{,}680 + 1{,}680 + 2{,}520 + 4{,}500 = 10{,}380</m>.`,
        String.raw`Bad debt expense: <m>10{,}380 - (-1{,}500) = 11{,}880</m>. Net receivables <m>240{,}000 - 10{,}380 = 229{,}620</m>.`,
        String.raw`The sales-based policy would charge <m>0.015 \times 760{,}000 = 11{,}400</m> and leave an allowance of <m>11{,}400 - 1{,}500 = 9{,}900</m>, which is 480 short of what the aging says the year-end receivables need.`,
      ],
      answer: 'Bad debt expense $11,880; allowance $10,380; net receivables $229,620. The 1.5% policy would have charged $11,400 and left the allowance $480 too small.',
      interpretation: 'The debit balance is a warning sign: the year’s write-offs, on 2025’s sales and on 2026’s, outran the $9,000 the allowance started with. If that happens year after year, Corrib’s loss rates are too low, and its profits are overstated in the years the sales are made.' },
    { level: 'applied', title: 'Should Lantern take Kilnworth’s discount?', fictional: true,
      setup: 'Suppose Kilnworth Roasting offered Lantern terms of 2/10, n/30 instead of plain 30-day terms. Lantern’s bean purchases averaged $5,860 a month in 2026 ($58,600 over ten months), and it holds $42,940 in cash. Should Ana pay on day 10?',
      steps: [
        String.raw`The discount on a typical month: <m>0.02 \times 5{,}860 = 117.20</m>. Paying on day 10 costs <m>5{,}860 - 117.20 = 5{,}742.80</m>; waiting costs 5,860 on day 30.`,
        String.raw`Waiting is like borrowing 5,742.80 for 20 days at a cost of 117.20: <m>117.20 \div 5{,}742.80 \approx 2.04\%</m> for 20 days, which is <m>\tfrac{2}{98}</m>.`,
        String.raw`Annualise (discount-cost formula): <m>\tfrac{2}{98} \times \tfrac{365}{20} \approx 37.2\%</m> a year at a simple rate, about 44.6% compounded.`,
        String.raw`Lantern’s cash earns far less than that, and even a bank overdraft would cost much less, so taking the discount is the better use of cash. Over a year of similar purchases it saves about <m>12 \times 117.20 = 1{,}406.40</m>.`,
      ],
      answer: 'Yes: skipping the discount costs the equivalent of about 37% a year. Paying on day 10 saves about $117 a month, roughly $1,406 a year.',
      interpretation: 'Credit terms are a source of finance with a price. Free 30-day credit is worth using in full; credit that costs 2% for 20 days is not. A business that can’t afford the discount is borrowing at 37%, which is worth telling its bank.' },
  ],

  demo: [
    { widget: 'rp-aging', intro: 'The defaults are Lantern’s aging and its allowance’s debit balance of $820 before adjustment. Change the amounts and loss rates, or the starting balance, and watch the required allowance, the bad debt expense and net receivables. Try a credit balance larger than the requirement: the entry then reduces the allowance.' },
    { widget: 'rp-drill', intro: 'Work through Lantern’s receivables entries for the year: the invoices (y8), the collections (y9), the Quayline write-off (y10) and the year-end estimate (e6). For each, choose the accounts, the direction and side, the amount and the statements affected.' },
  ],

  mistakes: [
    { title: '“A write-off is when the bad debt expense is recorded.”', html: 'Under the allowance method the expense is recorded at the period end, when the loss is estimated. The write-off moves a named customer’s balance out of receivables and out of the allowance; it changes neither the expense nor, when the allowance is adequate, net receivables.' },
    { title: '“Bad debt expense is the allowance figure from the aging.”', html: 'The aging gives the balance the allowance must <i>end</i> with. The expense is that balance minus what is already in the account. Lantern’s aging says $584, but its expense is $1,404, because the account started at a debit of $820.' },
    { title: '“A debit balance in the allowance is subtracted.”', html: 'A debit balance means losses have already outrun the allowance. The adjustment has to fill that hole before building the new balance, so a debit balance is <i>added</i>: 584 + 820. Subtract only a credit balance.' },
    { title: '“The percentage of sales gives the allowance.”', html: 'Under the income statement approach the percentage of sales gives the <i>expense</i>; the allowance is what is left after adding it to the unadjusted balance. Mixing the two approaches (taking a percentage of sales as the required balance) is a common slip.' },
    { title: '“Unearned revenue will be paid out in cash.”', html: 'Unearned revenue is a liability because Lantern owes a service. It is settled by delivering the events, workshop and coffee, and turns into revenue as it does. Treating it as a cash outflow overstates the cash a business needs.' },
  ],

  application: [
    { p: 'In businesses that sell on credit, the aging is a working document long before it becomes an adjusting entry. A credit controller reviews it every week: invoices just past due get a reminder, older ones a telephone call, and a customer whose balance keeps sliding into the older bands may be put on stop or asked for a deposit before the next order. New customers are given a credit limit after a check of their references or credit file. The loss rates in the year-end estimate are only as good as this follow-up, which is why auditors compare last year’s allowance with what was actually lost and test the aging against the payments received after the year end.' },
    { p: 'Lantern’s own aging points to two actions. The $820 more than 60 days overdue carries a 40% loss rate; a personal call from Ana is worth more than another emailed reminder. And Quayline’s failure suggests a policy for one-off event agencies: a deposit of a third or a half when the booking is made, as Harbor Tech already pays. Deposits turn a credit risk into unearned revenue, a liability Lantern settles by doing the work it is good at.' },
    { p: 'Payables are a question of timing and cash. Of Lantern’s $26,289 of current liabilities, $6,100 will be settled by serving customers; the other $20,189 needs cash over the next five months, from accounts payable and wages in January to the tax payment and the first van instalment on 1 June. Against that Lantern holds $42,940 in the bank and expects $6,796 from its catering clients, so it can pay every bill on time and take any discount offered. Measures that turn these balances into collection and payment periods, such as days sales outstanding, belong to F03.' },
  ],

  summary: [
    'Accounts receivable are amounts customers owe on credit terms; the roll-forward is beginning balance + credit sales − collections − write-offs (Lantern: 0 + 59,920 − 51,720 − 820 = $7,380).',
    'The allowance method records expected losses as bad debt expense in the period of the sale and holds them in a contra-asset; write-offs are charged against the allowance with no new expense.',
    'The direct write-off method delays the expense and overstates receivables, so US GAAP and IFRS allow it only for immaterial amounts; tax deductions, by contrast, follow write-offs.',
    'Under the balance sheet approach, expense = required allowance − unadjusted balance (a debit balance adds): Lantern’s aging requires $584, so e6 is 584 + 820 = $1,404 and net receivables are $6,796.',
    'CECL (ASC 326-20) and IFRS 9 measure the allowance as expected credit losses using history, current conditions and forecasts; an aging schedule or provision matrix is an accepted method.',
    'Notes receivable earn interest, I = P × r × t, accrued at each period end and collected at maturity.',
    'Current liabilities include accounts payable, accrued liabilities, unearned revenue, income taxes payable and the current portion of long-term debt: $26,289 for Lantern, of which $6,100 is settled by service rather than cash.',
    'Skipping a 2/10, n/30 discount costs about 37% a year at a simple rate, so a business with cash should take it.',
  ],

  glossary: [
    { term: 'Accounts receivable', def: 'Amounts customers owe a business for goods or services delivered on credit, usually due within 30 to 60 days and without interest. Called trade receivables under IFRS.' },
    { term: 'Credit terms', def: 'The conditions of a sale on credit: when payment is due and any discount for paying early. “n/30” means the full amount is due within 30 days; “2/10, n/30” offers 2% off for payment within 10 days.' },
    { term: 'Bad debt expense', def: 'The expense for credit sales a business does not expect to collect. Also called credit loss expense or uncollectible accounts expense.' },
    { term: 'Allowance for doubtful accounts', def: 'A contra-asset account holding the estimated amount of accounts receivable that will not be collected, deducted from Accounts Receivable on the balance sheet. Also called the allowance for credit losses.' },
    { term: 'Allowance method', def: 'Accounting for bad debts by estimating, at each period end, the receivables not expected to be collected, recording that estimate as an expense and an allowance, and later writing off specific accounts against the allowance.' },
    { term: 'Direct write-off method', def: 'Recording bad debt expense only when a specific customer’s account is found to be uncollectible. Not acceptable under US GAAP or IFRS unless the amounts are immaterial.' },
    { term: 'Write-off', def: 'Removing a specific customer’s balance from accounts receivable once it is judged uncollectible. Under the allowance method it is charged against the allowance, not to expense.' },
    { term: 'Aging of receivables', def: 'A schedule that groups receivables by how long they have been outstanding and applies a higher expected loss rate to older groups, used to estimate the allowance.' },
    { term: 'Expected credit losses', def: 'An estimate of the amounts a business does not expect to collect on its receivables or loans, based on past experience, current conditions and reasonable and supportable forecasts. US GAAP’s CECL model (ASC 326) and IFRS 9 both measure allowances this way.' },
    { term: 'Net receivables', def: 'Accounts receivable minus the allowance for doubtful accounts: the amount a business expects to collect. Also called the net realisable value of receivables.' },
    { term: 'Note receivable', def: 'A written promise by a customer or borrower to pay a stated sum on a stated date, usually with interest.' },
    { term: 'Accounts payable', def: 'Amounts a business owes suppliers for goods and services bought on credit. Called trade payables under IFRS.' },
    { term: 'Accrued liability', def: 'A liability for an expense incurred but not yet paid, such as wages, interest or utilities: the balance sheet side of an accrued expense.' },
    { term: 'Income taxes payable', def: 'Income tax owed for a period but not yet paid at the balance sheet date: the tax for the period less estimated payments already made.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 9.2, “Account for Uncollectible Accounts Using the Balance Sheet and Income Statement Approaches”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/9-2-account-for-uncollectible-accounts-using-the-balance-sheet-and-income-statement-approaches', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 9.6, “Explain How Notes Receivable and Accounts Receivable Differ”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/9-6-explain-how-notes-receivable-and-accounts-receivable-differ', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 12.1, “Identify and Describe Current Liabilities”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/12-1-identify-and-describe-current-liabilities', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2016). <i>Accounting Standards Update No. 2016-13, Financial Instruments—Credit Losses (Topic 326): Measurement of Credit Losses on Financial Instruments</i>.', url: 'https://storage.fasb.org/ASU%202016-13.pdf', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2025). <i>Accounting Standards Update No. 2025-05, Financial Instruments—Credit Losses (Topic 326): Measurement of Credit Losses for Accounts Receivable and Contract Assets</i>.', url: 'https://storage.fasb.org/ASU%202025-05.pdf', checked: '2026-10-23' },
    { text: 'Internal Revenue Service. <i>Topic no. 453, Bad debt deduction</i>.', url: 'https://www.irs.gov/taxtopics/tc453', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2019). <i>Accounting Standards Update No. 2019-10, Financial Instruments—Credit Losses (Topic 326), Derivatives and Hedging (Topic 815), and Leases (Topic 842): Effective Dates</i>.', url: 'https://storage.fasb.org/ASU%202019-10.pdf', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2009). <i>Accounting Standards Update No. 2009-01, Topic 105—Generally Accepted Accounting Principles</i>, paragraph 105-10-05-6 (“The provisions of the Codification need not be applied to immaterial items.”). Full text reproduced on PwC Viewpoint.', url: 'https://viewpoint.pwc.com/dt/us/en/fasb_financial_accou/asus_fulltext/2009/asu_200901generally_/asu_200901generally__US/asu_200901generally__US.html', checked: '2026-10-23' },
    { text: 'European Union. Commission Regulation (EU) 2023/1803 adopting international accounting standards, consolidated version of 8 March 2026, Annex: <i>IFRS 9 Financial Instruments</i>, paragraph 5.5.15 (simplified approach for trade receivables).', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02023R1803-20260308', checked: '2026-10-23' },
  ],

  checks: [
    // Lantern receivables (case.js)
    { what: 'Catering invoiced (y8)', value: cat.invoiced, shown: 59920 },
    { what: 'Catering collected (y9)', value: cat.collected, shown: 51720 },
    { what: 'Quayline write-off (y10)', value: cat.writtenOff, shown: 820 },
    { what: 'Receivables still owed', value: bal('Accounts Receivable'), shown: 7380 },
    { what: 'Roll-forward', value: 0 + cat.invoiced - cat.collected - cat.writtenOff, shown: 7380 },
    { what: 'Allowance after adjustment', value: DERIVED.allowance, shown: 584 },
    { what: 'Aging: required allowance', value: agingRequired, shown: 584 },
    { what: 'Aging band 1', value: AGING[0].amount * AGING[0].rate, shown: 100 },
    { what: 'Aging band 2', value: AGING[1].amount * AGING[1].rate, shown: 156 },
    { what: 'Aging band 3', value: AGING[2].amount * AGING[2].rate, shown: 328 },
    { what: 'Aging total receivables', value: AGING.reduce((s, b) => s + b.amount, 0), shown: 7380 },
    { what: 'Aging amounts in formula note', value: AGING[0].amount + AGING[1].amount + AGING[2].amount, shown: 5000 + 1560 + 820 },
    { what: 'Bad debt expense e6', value: line('e6', 'Bad Debt Expense').dr, shown: 1404 },
    { what: 'e6 = 584 + 820', value: DERIVED.badDebt, shown: 584 + 820 },
    { what: 'Net receivables', value: DERIVED.receivablesNet, shown: 6796 },
    { what: 'Net receivables = 7,380 − 584', value: 7380 - 584, shown: 6796 },
    { what: 'Expense if allowance had a 200 credit balance', value: 584 - 200, shown: 384 },
    { what: 'Generic write-off: net before', value: 10000 - 900, shown: 9100 },
    { what: 'Generic write-off: receivables after', value: 10000 - 820, shown: 9180 },
    { what: 'Generic write-off: allowance after', value: 900 - 820, shown: 80 },
    { what: 'Generic write-off: net after', value: 9180 - 80, shown: 9100 },
    { what: 'Recovery (hypothetical)', value: 300, shown: 300 },
    { what: '2% of credit sales', value: 0.02 * cat.invoiced, shown: 1198.40 },
    { what: 'Allowance under 2% of sales', value: 0.02 * cat.invoiced - cat.writtenOff, shown: 378.40 },
    { what: 'Shortfall vs aging (about $206)', value: agingRequired - (0.02 * cat.invoiced - cat.writtenOff), shown: 206, tol: 0.5 },
    // payables and current liabilities (case.js)
    { what: 'Accounts payable', value: bal('Accounts Payable'), shown: 9210 },
    { what: 'AP Kilnworth', value: F.inventory.purchases - F.inventory.paid, shown: 8400 },
    { what: 'AP supplies', value: F.supplies.bought - F.supplies.paid, shown: 520 },
    { what: 'AP utilities', value: F.utilities.unpaid, shown: 290 },
    { what: 'AP composition', value: 8400 + 520 + 290, shown: 9210 },
    { what: 'Inventory bought (case)', value: F.inventory.purchases, shown: 58600 },
    { what: 'Inventory paid (case)', value: F.inventory.paid, shown: 50200 },
    { what: 'Supplies bought (case)', value: F.supplies.bought, shown: 11540 },
    { what: 'Supplies paid (case)', value: F.supplies.paid, shown: 11020 },
    { what: 'Wages payable', value: bal('Wages Payable'), shown: 2100 },
    { what: 'Interest payable', value: bal('Interest Payable'), shown: 750 },
    { what: 'Interest payable: Coastline', value: F.coastline.interestAccrued, shown: 50 },
    { what: 'Interest payable: van note', value: vanNoteInterest, shown: 700 },
    { what: 'Unearned revenue', value: bal('Unearned Revenue'), shown: 6100 },
    { what: 'Unearned: catering deposits for January', value: cat.depositsReceived - cat.depositsEarned, shown: 1640 },
    { what: 'Unearned: January workshop', value: F.training.paidForJanuary, shown: 1500 },
    { what: 'Unearned: subscriptions', value: F.shop.prepaidSubscriptions, shown: 2960 },
    { what: 'Unearned composition', value: 1640 + 1500 + 2960, shown: 6100 },
    { what: 'Income tax for the year', value: DERIVED.incomeTax, shown: 9129 },
    { what: 'Income before tax', value: DERIVED.incomeBeforeTax, shown: 36516 },
    { what: 'Tax = 25% of income before tax', value: Math.round(F.tax.rate * DERIVED.incomeBeforeTax), shown: 9129 },
    { what: 'Tax rate', value: F.tax.rate * 100, shown: 25 },
    { what: 'Estimated tax paid', value: F.tax.estimatedPaid, shown: 6000 },
    { what: 'Income taxes payable', value: DERIVED.taxPayable, shown: 3129 },
    { what: 'Income taxes payable = 9,129 − 6,000', value: 9129 - 6000, shown: 3129 },
    { what: 'Current portion of long-term debt', value: bal('Current Portion of Long-Term Debt'), shown: 5000 },
    { what: 'Total current liabilities', value: DERIVED.currentLiabilities, shown: 26289 },
    { what: 'Current liabilities composition', value: 9210 + 2100 + 750 + 6100 + 3129 + 5000, shown: 26289 },
    { what: 'Liabilities needing cash', value: DERIVED.currentLiabilities - DERIVED.unearned, shown: 20189 },
    { what: 'Cash at year end', value: DERIVED.cashEnd, shown: 42940 },
    // discount
    { what: '2/98 × 365/20 (about 37.2%)', value: discountRate * 100, shown: 37.2, tol: 0.05 },
    { what: 'Compounded (about 44.6%)', value: discountEAR * 100, shown: 44.6, tol: 0.05 },
    // Tarnside note
    { what: 'Tarnside interest 2026', value: 6000 * 0.08 * 2 / 12, shown: 80 },
    { what: 'Tarnside interest for six months', value: 6000 * 0.08 * 6 / 12, shown: 240 },
    { what: 'Tarnside cash at maturity', value: 6000 + 240, shown: 6240 },
    { what: 'Tarnside 2027 interest revenue', value: 240 - 80, shown: 160 },
    // Fernbrook
    { what: 'Fernbrook band 1', value: 48000 * 0.01, shown: 480 },
    { what: 'Fernbrook band 2', value: 12500 * 0.04, shown: 500 },
    { what: 'Fernbrook band 3', value: 6200 * 0.15, shown: 930 },
    { what: 'Fernbrook band 4', value: 3300 * 0.5, shown: 1650 },
    { what: 'Fernbrook required allowance', value: fernReq, shown: 3560 },
    { what: 'Fernbrook expense', value: fernReq - 1140, shown: 2420 },
    { what: 'Fernbrook receivables', value: fernAR, shown: 70000 },
    { what: 'Fernbrook net receivables', value: fernAR - fernReq, shown: 66440 },
    { what: 'Fernbrook over-60 share of receivables (less than 5%)', value: 3300 / fernAR * 100, shown: 4.7, tol: 0.05 },
    { what: 'Fernbrook over-60 share of allowance (almost half)', value: 1650 / fernReq * 100, shown: 46.3, tol: 0.05 },
    // Corrib
    { what: 'Corrib unadjusted allowance', value: corUnadj, shown: -1500 },
    { what: 'Corrib band 1', value: 168000 * 0.01, shown: 1680 },
    { what: 'Corrib band 2', value: 42000 * 0.04, shown: 1680 },
    { what: 'Corrib band 3', value: 21000 * 0.12, shown: 2520 },
    { what: 'Corrib band 4', value: 9000 * 0.5, shown: 4500 },
    { what: 'Corrib required allowance', value: corReq, shown: 10380 },
    { what: 'Corrib receivables', value: corAR, shown: 240000 },
    { what: 'Corrib expense', value: corReq - corUnadj, shown: 11880 },
    { what: 'Corrib net receivables', value: corAR - corReq, shown: 229620 },
    { what: 'Corrib 1.5% of sales', value: 0.015 * 760000, shown: 11400 },
    { what: 'Corrib allowance under 1.5% policy', value: 0.015 * 760000 + corUnadj, shown: 9900 },
    { what: 'Corrib shortfall of 1.5% policy', value: corReq - (0.015 * 760000 + corUnadj), shown: 480 },
    // applied example
    { what: 'Average monthly bean purchases', value: monthlyPurchases, shown: 5860 },
    { what: 'Discount on a month', value: 0.02 * monthlyPurchases, shown: 117.20 },
    { what: 'Amount paid on day 10', value: monthlyPurchases * 0.98, shown: 5742.80 },
    { what: '117.20 ÷ 5,742.80 (about 2.04%)', value: 117.2 / 5742.8 * 100, shown: 2.04, tol: 0.005 },
    { what: 'Annual saving', value: 12 * 0.02 * monthlyPurchases, shown: 1406.40 },
    { what: 'Discount a month (about $117)', value: 0.02 * monthlyPurchases, shown: 117, tol: 0.5 },
    { what: 'Annual saving (about $1,406)', value: 12 * 0.02 * monthlyPurchases, shown: 1406, tol: 0.5 },
    { what: 'Simple annual cost (about 37%)', value: discountRate * 100, shown: 37, tol: 0.5 },
    { what: 'Months in Lantern’s first year', value: F.period.months, shown: 10 },
    { what: 'Aging amount: not yet due', value: AGING[0].amount, shown: 5000 },
    { what: 'Aging amount: 31–60 days', value: AGING[1].amount, shown: 1560 },
    { what: 'Aging amount: over 60 days', value: AGING[2].amount, shown: 820 },
    { what: 'Aging rate: not yet due (%)', value: AGING[0].rate * 100, shown: 2 },
    { what: 'Aging rate: 31–60 days (%)', value: AGING[1].rate * 100, shown: 10 },
    { what: 'Aging rate: over 60 days (%)', value: AGING[2].rate * 100, shown: 40 },
  ],
};
