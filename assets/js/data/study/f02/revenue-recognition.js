// revenue-recognition.js — F02 · Revenue recognition. Content only; exercises are in revenue-recognition.ex.js.
// Lantern’s figures come from case.js (FACTS, YEAR, DERIVED); the other businesses are fictional and live only here.
import { FACTS, YEAR, DERIVED as D } from './case.js?v=13';

const F = FACTS, cat = F.catering, tr = F.training, shop = F.shop;
const tx = (id) => YEAR.find((t) => t.id === id);
const entry = (id, memo) => { const t = tx(id); return { date: t.date, lines: t.lines, memo: memo ?? t.text }; };
const cr = (id, acct) => tx(id).lines.find((l) => l.acct === acct)?.cr || 0;
const dr = (id, acct) => tx(id).lines.find((l) => l.acct === acct)?.dr || 0;
// Selkie Swim School (simple example)
const selkie = { children: 40, fee: 180, lessons: 10, given: 8, school: 900 };
// Seaholme Sound Systems (challenging example): bundle price and stand-alone selling prices
const mer = { price: 7200, equip: 6000, install: 600, support: 1400, months: 24, elapsed: 3 };
const merSSP = mer.equip + mer.install + mer.support;
const merAlloc = (ssp) => mer.price * ssp / merSSP;
// Lantern’s hypothetical 2027 partner-roaster offer (applied example)
const pr = { bags: 1200, price: 17, cost: 9.5, commission: 0.25, unsold: 200 };

export default {
  slug: 'revenue-recognition',
  title: 'Revenue recognition',
  blurb: 'Decide when revenue is earned and how much to record by working through the five steps of ASC 606 and IFRS 15: deposits and prepaid subscriptions, bundles, refunds, discounts and the question of gross or net. Then reconcile Lantern’s online-shop order values with the revenue in its books.',
  status: 'reviewed',
  objectives: [
    'Apply the five steps of ASC 606 and IFRS 15 to a contract, using the control criteria to decide whether revenue is recognised over time or at a point in time.',
    'Calculate the share of a transaction price allocated to each performance obligation, in proportion to stand-alone selling prices.',
    'Record contract liabilities (unearned revenue), receivables, refunds and sales discounts, and present contra-revenue accounts correctly.',
    'Distinguish a principal from an agent and explain how the answer changes reported revenue.',
    'Reconcile Lantern’s online-shop order values with the revenue, unearned revenue and cash in its books.',
  ],
  prerequisites: [
    { lesson: 'f01/accrual-vs-cash', why: 'It introduced the revenue recognition principle, performance obligations and the five steps, which this lesson applies to a full year.' },
    { lesson: 'f01/adjusting-entries', why: 'Unearned revenue and accrued revenue were adjusted there; here you see where those balances come from and what they mean.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'January 2027. Lantern’s accountant is preparing the statements for its first financial year, the ten months from 1 March to 31 December 2026. Lantern earned money in three ways: it catered 76 events, ran 14 barista workshops and sold bags of beans in its online shop. B02 and B01 together put the shop’s order values at $111,024.55, and the bank records show $191,220 received from customers. The first line of the income statement needs a third figure: how much revenue Lantern earned in those ten months.' },
    { p: 'In F01 you met the <g>revenue recognition principle</g>: revenue is recognised when, or as, a business satisfies a <g>performance obligation</g> by transferring control of a good or service to a customer, at the amount it expects to be entitled to. In one month of catering the principle was easy to apply. Over a year, with deposits, prepaid subscriptions, unpaid invoices, refunds and bundled sales, it becomes the source of most of the judgement in an income statement. Revenue is the figure readers look at first, and every subtotal beneath it inherits any error in it.' },
    { p: 'US GAAP (Accounting Standards Codification Topic 606) and IFRS (IFRS 15) apply the principle through the same five steps, summarised in the figure. The first four settle the contract and the amount; only the fifth decides the timing.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 390" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="15"><g fill="none" stroke="var(--rule-strong)" stroke-width="1.5"><rect x="10" y="10" width="250" height="58" rx="6"/><rect x="10" y="88" width="250" height="58" rx="6"/><rect x="10" y="166" width="250" height="58" rx="6"/><rect x="10" y="244" width="250" height="58" rx="6"/></g><rect x="10" y="322" width="250" height="58" rx="6" fill="none" stroke="var(--series-1)" stroke-width="2.5"/><g fill="currentColor"><text x="24" y="35" font-weight="600">1 Identify the contract</text><text x="24" y="56" font-size="13">enforceable rights and obligations</text><text x="24" y="113" font-weight="600">2 Find the obligations</text><text x="24" y="134" font-size="13">each distinct good or service</text><text x="24" y="191" font-weight="600">3 Set the transaction price</text><text x="24" y="212" font-size="13">what the business expects to get</text><text x="24" y="269" font-weight="600">4 Allocate the price</text><text x="24" y="290" font-size="13">by stand-alone selling prices</text><text x="24" y="347" font-weight="600">5 Recognise revenue</text><text x="24" y="368" font-size="13">when, or as, control transfers</text></g><g stroke="var(--rule-strong)" stroke-width="1.5"><path d="M135 68 V84"/><path d="M135 146 V162"/><path d="M135 224 V240"/><path d="M135 302 V318"/></g><g fill="var(--rule-strong)"><path d="M130 82 L135 88 L140 82 Z"/><path d="M130 160 L135 166 L140 160 Z"/><path d="M130 238 L135 244 L140 238 Z"/><path d="M130 316 L135 322 L140 316 Z"/></g><g fill="currentColor" font-size="14"><text x="285" y="44">A catered lunch booked at an agreed price</text><text x="285" y="122">One obligation: food, coffee and staff together</text><text x="285" y="200">$820, payable within 30 days</text><text x="285" y="278">All $820 to the one obligation</text><text x="285" y="356">$820 of revenue on the day of the lunch</text></g><g stroke="var(--rule-strong)" stroke-dasharray="3 4"><path d="M262 39 H280"/><path d="M262 117 H280"/><path d="M262 195 H280"/><path d="M262 273 H280"/><path d="M262 351 H280"/></g></svg>',
      caption: 'The five steps of ASC 606 and IFRS 15, applied to one of Lantern’s catering bookings (fictional). Steps 1–4 decide how much; step 5 decides when.',
      alt: 'A column of five boxes joined by downward arrows, each paired with a Lantern example. Step 1, identify the contract, which creates enforceable rights and obligations: a catered lunch booked at an agreed price. Step 2, find the performance obligations, each distinct good or service: one obligation, food, coffee and staff together. Step 3, set the transaction price, what the business expects to get: $820, payable within 30 days. Step 4, allocate the price by stand-alone selling prices: all $820 to the one obligation. Step 5, highlighted, recognise revenue when or as control transfers: $820 of revenue on the day of the lunch.',
    } },
    { p: 'Cash and revenue rarely move on the same day, and the gap between them leaves an asset or a liability on the balance sheet. If the customer pays first, the business owes the goods or service: a <g>contract liability</g>, which Lantern’s chart of accounts calls <g>unearned revenue</g> and many companies call deferred revenue. If the business performs first and the customer has not yet paid, it holds a receivable (or a contract asset, if its right to payment still depends on further performance). At 31 December Lantern had both: $6,100 of unearned revenue and $7,380 of accounts receivable.' },
    { callout: 'key', title: 'Four things that are not revenue events', html: 'Signing a contract, sending an invoice, receiving a deposit and receiving full payment are not, on their own, reasons to recognise revenue. Revenue follows the transfer of control: the event catered, the workshop held, the bag shipped. The other events decide only the amount, or where the money sits while it waits.' },
    { p: 'Each of Lantern’s streams fits the model differently. A catered event or a workshop is delivered on one day. A bag of beans is a good, recognised when it is shipped. A prepaid subscription is a promise of future bags, so its cash arrives before any revenue. The rest of the lesson works through the steps in turn, deals with refunds, discounts and the question of whose sale it is, and ends by reconciling the shop’s order values with the books.' },
  ],

  theory: [
    { h: 'Step 1: the contract' },
    { p: 'A contract is an agreement that creates enforceable rights and obligations; it can be written, spoken or implied by a business’s customary practice. IFRS 15 (paragraph 9) lists five conditions before the model applies, and ASC 606 has a parallel list:' },
    { list: [
      'the parties have approved the contract and are committed to performing;',
      'each party’s rights to the goods or services can be identified;',
      'the payment terms can be identified;',
      'the contract has commercial substance (it is expected to change the business’s future cash flows);',
      'it is probable that the business will collect the amount it will be entitled to.',
    ] },
    { p: 'Lantern’s contracts are simple: a catering booking confirmed by email at an agreed price, a workshop registration, an order placed at the shop’s checkout. A customer who later fails to pay, as Quayline Events did, doesn’t mean there was no contract. The loss is a bad debt, which the next module covers in <i>Receivables and payables</i>.' },
    { h: 'Step 2: the performance obligations' },
    { p: 'A performance obligation is a promise to transfer a distinct good or service. IFRS 15 (paragraph 27) treats a promise as distinct when two conditions hold: the customer can benefit from it on its own or with resources readily available to it, and the promise is separately identifiable from the other promises in the contract. A catered lunch includes food, coffee and the staff who serve them, but the client is buying one integrated service, so it is one obligation. A sound system sold with installation by the seller’s technician and a support plan is usually three obligations, because a customer could buy each separately and none significantly changes the others.' },
    { h: 'Step 3: the transaction price' },
    { p: 'The <g>transaction price</g> is the amount the business expects to be entitled to in exchange for the promised goods or services. It excludes amounts collected on behalf of third parties, such as some sales taxes (IFRS 15 paragraph 47). When the amount can change, because of discounts, rebates, refunds, credits, price concessions, incentives, bonuses or penalties, the business has <g>variable consideration</g> (ASC 606-10-32-6; IFRS 15 paragraph 51). It estimates the amount, but includes it only to the extent that it is probable that a significant reversal of the cumulative revenue recognised won’t occur later (ASC 606-10-32-11). Lantern’s prices are fixed: an agreed price for each event, $125 a workshop seat and a list price for each bag (its refunds for damaged bags, discussed below, are the exception).' },
    { h: 'Step 4: allocating the price' },
    { p: 'When a contract holds more than one performance obligation, the transaction price is divided in proportion to their <g>stand-alone selling prices</g>: what the business would charge for each promise sold separately (IFRS 15 paragraphs 74 and 77). A list price is evidence of a stand-alone selling price but isn’t automatically one. When no observable price exists, the business estimates it, for example by an adjusted market assessment or expected cost plus a margin; a residual approach is allowed only in limited circumstances (paragraph 79). A discount for buying the bundle is normally shared among all the obligations in proportion.' },
    { math: String.raw`\text{Allocated price}_i = \text{Transaction price} \times \dfrac{\text{SSP}_i}{\sum_j \text{SSP}_j}` },
    { p: 'The challenging example below allocates a $7,200 bundle across equipment, installation and a two-year support plan whose stand-alone prices add up to $8,000. Each obligation receives 90% of its stand-alone price, so each bears its share of the $800 discount.' },
    { h: 'Step 5: satisfying the obligation' },
    { p: 'An obligation is satisfied when the customer obtains <g>control</g> of the good or service: the ability to direct its use and obtain substantially all of its remaining benefits (IFRS 15 paragraph 33). Revenue is recognised over time if any one of three criteria is met (ASC 606-10-25-27; IFRS 15 paragraph 35):' },
    { ol: [
      'the customer receives and consumes the benefits as the business performs (cleaning, a gym membership, a monitoring service);',
      'the business’s work creates or enhances an asset the customer controls as it is created (an extension built on the customer’s land);',
      'the work creates an asset with no alternative use to the business, and the business has an enforceable right to payment for the work done to date (a machine built to one customer’s design).',
    ] },
    { p: 'Otherwise the obligation is satisfied at a point in time, and the business looks for indicators that control has passed: a present right to payment, the customer’s legal title, physical possession, the significant risks and rewards of ownership, and the customer’s acceptance (ASC 606-10-25-30; IFRS 15 paragraph 38). No single indicator decides; they are weighed together.' },
    { p: 'F01 described a catered event as delivered at a point in time, a fair shorthand: strictly, it meets the first over-time criterion, because the client consumes the service as Lantern performs it. The performance lasts a few hours on one day, so either way all its revenue falls on the event date, and the same is true of a workshop.' },
    { p: 'A bag of beans is a good. Lantern refunds bags damaged in transit, so it keeps the risk of loss until the parcel arrives, and control strictly passes on delivery. Its accountant nevertheless recognises shop sales when orders ship: parcels arrive within days, so only orders in transit on 31 December are affected, and they were judged below <g>materiality</g>. With material sales in transit at a year end, revenue would wait for delivery.' },
    { table: {
      caption: 'Lantern’s revenue streams through the five steps, March–December 2026 (fictional)',
      head: ['Stream', 'Performance obligation', 'Price', 'Satisfied', 'Revenue ($)'],
      align: ['l', 'l', 'l', 'l', 'r'],
      rows: [
        ['Catering', 'Each event (food, coffee and staff together)', 'Agreed per event; average $820', 'On the event day', '62,320'],
        ['Workshops', 'A seat at a workshop', '$125 a participant', 'On the workshop day', '21,000'],
        ['Shop orders', 'Each bag shipped', 'List price', 'When shipped', '111,025'],
        ['Prepaid subscriptions', 'Bags still to be shipped', 'Paid in advance', 'As each bag ships', '0'],
      ],
      foot: [['Gross revenue', '', '', '', '194,345'], ['Less refunds', '', '', '', '(1,025)'], ['Net revenue', '', '', '', '193,320']],
    } },
    { h: 'Contract liabilities and receivables' },
    { p: 'A contract liability is a business’s obligation to transfer goods or services to a customer from whom it has received payment, or from whom payment is already due (IFRS 15 paragraph 106; ASC 606 uses the same term). A receivable is a right to payment that is unconditional: only the passage of time stands between the business and the cash (paragraph 108). If the business has performed but its right to payment still depends on something other than time, such as finishing another part of the contract, it holds a <g>contract asset</g> rather than a receivable (IFRS 15 paragraph 107; ASC 606-10-45-3). Lantern’s catering invoices of $59,920 created receivables when the events took place; by 31 December it had collected $51,720 and written off $820, leaving $7,380.' },
    { p: 'Four of Lantern’s receipts created contract liabilities. The table follows each from receipt to the year end; the journal shows how the year’s summary entries record them.' },
    { table: {
      caption: 'Lantern’s Unearned Revenue account, March–December 2026 (fictional)',
      head: ['Source', 'Received ($)', 'Earned in 2026 ($)', 'Owed at 31 December ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Harbor Tech’s deposit for three events (March)', '2,400', '2,400', '0'],
        ['Deposits for two January events (December)', '1,640', '0', '1,640'],
        ['Fees for the workshop on 9 January 2027', '1,500', '0', '1,500'],
        ['Subscriptions paid for, bags not yet shipped', '2,960', '0', '2,960'],
      ],
      foot: [['Total', '8,500', '2,400', '6,100']],
    } },
    { journal: {
      caption: 'Lantern’s summary entries for deposits, workshops and shop receipts, 2026 (fictional)',
      entries: [entry('y6'), entry('y7'), entry('y11'), entry('y12')],
    } },
    { p: 'In early 2027 the $6,100 becomes revenue as Lantern caters the two events, runs the workshop and ships the subscription bags: each delivery debits Unearned Revenue and credits a revenue account. Had Lantern recorded the receipts as revenue in 2026, its 2026 revenue would be overstated by $6,100 and its balance sheet would hide obligations it still had to perform.' },
    { callout: 'note', title: 'Unearned revenue is not cash set aside', html: 'The $6,100 measures goods and services Lantern owes, not money in a separate account. The cash went into Lantern’s bank balance when it arrived; the liability tells a reader that part of that balance is already promised to customers, in coffee and service if Lantern performs, in refunds if it can’t.' },
    { h: 'Refunds, returns and allowances' },
    { p: 'When a customer returns goods or is given a price reduction, the business doesn’t erase the original sale. It debits a <g>contra-revenue account</g>, <g>Sales Returns and Allowances</g>, which has a normal debit balance and is deducted from gross revenue on the income statement. Keeping the reduction in its own account shows managers how much selling effort is undone by returns. Lantern refunded $1,025 to customers whose bags were damaged in transit. The damaged beans weren’t resold, so nothing went back into inventory:' },
    { journal: { caption: 'Lantern’s refunds, 2026 (fictional)', entries: [entry('y13')] } },
    { p: 'When returned goods can be resold, a second entry puts them back into inventory at cost and reduces cost of goods sold, as the next lesson shows. A business that sells with a right of return and expects returns at the year end estimates them instead of waiting: it recognises revenue only for the goods it expects customers to keep, a <g>refund liability</g> for the amount it expects to pay back, and an asset, with a matching reduction of cost of sales, for its right to recover the goods (ASC 606-10-55-23; IFRS 15 paragraph B21). Lantern’s practice of refunding damaged bags is variable consideration in principle, but refunds were under 1% of shop sales and are paid within days, so those still to come at 31 December for late-December shipments were immaterial: its accountant records refunds when paid and recognises no refund liability. A business whose expected refunds at the year end are material must estimate them.' },
    { p: 'A <g>sales discount</g> rewards prompt payment. Terms of “2/10, n/30” offer 2% off if the customer pays within 10 days, with the full amount due in 30. Introductory texts, OpenStax among them, record the discount in a contra-revenue account, Sales Discounts, when the customer takes it. Under ASC 606 and IFRS 15 a prompt-payment discount is variable consideration, so a seller that expects most customers to take it estimates the discount when it recognises the sale. Lantern’s shop customers pay by card at checkout, so its Sales Discounts account has no balance in 2026; it would be used if Lantern offered credit terms to wholesale customers.' },
    { math: String.raw`\text{Net revenue} = \text{Gross revenue} - \text{Sales returns and allowances} - \text{Sales discounts}` },
    { h: 'Gross or net: principal or agent' },
    { p: 'When another party is involved in supplying the customer, the business must decide whether it promised to provide the good or service itself, as a <b>principal</b>, or to arrange for the other party to provide it, as an <b>agent</b>. A principal recognises revenue at the gross amount the customer pays; an agent recognises only its fee or commission (IFRS 15 paragraphs B35B and B36). The test is whether the business controls the good or service before it reaches the customer. Three indicators help (paragraph B37): the business is primarily responsible for fulfilling the promise, it bears inventory risk, and it has discretion in setting the price.' },
    { p: 'Lantern buys roasted bags from Kilnworth Roasting, holds them in stock, sets their prices and answers customers’ complaints, so it is the principal and reports the full $111,025 as revenue. The card processor and the shop platform are Lantern’s suppliers, not partners in the sale: their $4,010 of fees is an operating expense, not a deduction from revenue. The answer matters for comparisons. A marketplace selling $1 million of other firms’ goods for a 10% commission reports $100,000 of revenue; a retailer selling the same goods as principal reports $1 million and the cost of the goods as well.' },
    { callout: 'standards', title: 'One model, two codifications', html: 'ASC 606 and IFRS 15 were developed jointly by the FASB and the IASB, and the five steps, the control criteria and the principal-versus-agent indicators are the same in both, which is why this lesson cites them side by side. F01’s accrual lesson gives their effective dates. Some detailed requirements differ, and courses after F02 deal with them; nothing in Lantern’s year depends on a difference.' },
    { h: 'Reconciling the shop’s order values with the books' },
    { p: 'B02 cleaned the shop’s order export for March to June and found order values of $9,096.15; B01 estimated July to December as orders multiplied by the average order value, $101,928.40. Analytics measures orders placed; the books measure obligations satisfied, refunds and cash received in advance. The reconciliation explains every difference:' },
    { table: {
      caption: 'Lantern’s online shop: from order values to the books, 2026 (fictional)',
      head: ['Item', '$'],
      align: ['l', 'r'],
      rows: [
        ['Order values, March–June (B02)', '9,096.15'],
        ['Order values, July–December (B01)', '101,928.40'],
        ['Total order values', '111,024.55'],
        ['Rounding to whole dollars, as the books are kept', '0.45'],
        ['Online Sales Revenue (gross)', '111,025.00'],
        ['Less refunds (Sales Returns and Allowances)', '(1,025.00)'],
        ['Net online sales', '110,000.00'],
        ['Add subscriptions paid for, bags not yet shipped (Unearned Revenue)', '2,960.00'],
      ],
      foot: [['Cash received from shop customers', '112,960.00']],
    } },
    { p: 'Three points follow. The analytics figure and the revenue figure agree only because every order in the export was shipped by 31 December; an order placed on 31 December and shipped on 2 January would be 2027 revenue. Refunds are a reduction of revenue, so the shop’s net sales are $110,000, the figure the next lesson uses for its gross margin. And $2,960 of the cash the shop collected isn’t revenue at all yet.' },
  ],

  formulas: [
    { id: 'rr-allocation', name: 'Allocating a transaction price (relative stand-alone selling prices)',
      tex: String.raw`\text{Allocated price}_i = \text{Transaction price} \times \dfrac{\text{SSP}_i}{\sum_j \text{SSP}_j}`,
      where: [
        [String.raw`\text{Allocated price}_i`, 'The part of the transaction price assigned to performance obligation i', '$'],
        [String.raw`\text{Transaction price}`, 'What the business expects to be entitled to for the whole contract', '$'],
        [String.raw`\text{SSP}_i`, 'The stand-alone selling price of obligation i: what it would sell for on its own', '$'],
        [String.raw`\sum_j \text{SSP}_j`, 'The total of the stand-alone selling prices of all the obligations in the contract', '$'],
      ],
      assumptions: 'Any discount for buying the bundle belongs to all the obligations in proportion.',
      note: 'Seaholme’s bundle: <m>7{,}200 \\times 6{,}000 \\div 8{,}000 = 5{,}400</m> for the equipment.' },
    { id: 'rr-over-time', name: 'Revenue to date on an obligation satisfied evenly over time',
      tex: String.raw`\text{Revenue to date} = \text{Allocated price} \times \dfrac{t}{T}`,
      where: [
        [String.raw`\text{Allocated price}`, 'The part of the transaction price assigned to the service', '$'],
        [String.raw`t`, 'The part of the service period that has passed', 'months'],
        [String.raw`T`, 'The whole service period', 'months'],
      ],
      assumptions: 'The service is provided evenly, so time elapsed measures progress.' },
    { id: 'rr-contract-liability', name: 'Contract liability (unearned revenue) at the end of a period',
      tex: String.raw`\text{CL}_{\text{end}} = \text{CL}_{\text{beg}} + \text{Received in advance} - \text{Recognised from advances}`,
      where: [
        [String.raw`\text{CL}_{\text{beg}}, \text{CL}_{\text{end}}`, 'The contract liability at the start and end of the period', '$'],
        [String.raw`\text{Received in advance}`, 'Payments received (or due) for goods and services not yet transferred', '$'],
        [String.raw`\text{Recognised from advances}`, 'Revenue recognised in the period for obligations that had been paid for in advance', '$'],
      ],
      note: 'Lantern, 2026: <m>0 + 8{,}500 - 2{,}400 = 6{,}100</m>.' },
    { id: 'rr-net-revenue', name: 'Net revenue',
      tex: String.raw`\text{Net revenue} = \text{Gross revenue} - \text{Sales returns and allowances} - \text{Sales discounts}`,
      where: [
        [String.raw`\text{Gross revenue}`, 'Revenue recognised for goods and services transferred, before reductions', '$'],
        [String.raw`\text{Sales returns and allowances}`, 'Refunds and price reductions for returned or unsatisfactory goods (a contra-revenue account)', '$'],
        [String.raw`\text{Sales discounts}`, 'Reductions for prompt payment taken by customers (a contra-revenue account)', '$'],
      ],
      note: 'Lantern, 2026: <m>194{,}345 - 1{,}025 - 0 = 193{,}320</m>.' },
  ],

  examples: [
    { level: 'simple', title: 'A swim school’s term at the year end', fictional: true,
      setup: 'Selkie Swim School, a fictional business, has a financial year ending 31 October. On 1 September, 40 children enrol for a term of ten weekly lessons, each paying $180 in advance; by 31 October eight of the ten lessons have been given. In October the school also teaches a primary school’s class for a fee of $900, invoiced on 31 October and payable within 30 days. How much revenue does Selkie recognise for the year from these two contracts, and what does its balance sheet show for them at 31 October?',
      steps: [
        'Steps 1 and 2: each enrolment is a contract to deliver ten lessons. The lessons are a service the children consume as they are given, so the obligation is satisfied over time, lesson by lesson.',
        String.raw`Steps 3 and 4: the price is $180 for ten lessons, so each lesson carries <m>180 \div 10 = 18</m> dollars. The school received <m>40 \times 180 = 7{,}200</m> in advance.`,
        String.raw`Step 5, the term: eight lessons have been given, so revenue is <m>40 \times 8 \times 18 = 5{,}760</m>. The other <m>7{,}200 - 5{,}760 = 1{,}440</m> is a contract liability: two lessons still owed to each child.`,
        'Step 5, the class: the lessons were given in October, so the $900 is October revenue although it hasn’t been paid. The right to the cash depends only on time passing, so it is a receivable.',
      ],
      answer: 'Revenue for the year: <m>5{,}760 + 900 = 6{,}660</m> dollars. At 31 October Selkie shows a contract liability (unearned revenue) of $1,440 and an account receivable of $900.',
      interpretation: 'Cash and revenue differ in both directions: the school holds $1,440 of cash it hasn’t yet earned and has earned $900 it hasn’t yet received. Both are on its balance sheet, which is what lets a reader see them.' },
    { level: 'challenging', title: 'A bundle with equipment, installation and support', fictional: true,
      setup: 'Seaholme Sound Systems, a fictional retailer, sells a home cinema package for $7,200, paid in full on 1 October 2026. The package includes the speakers and amplifier, delivered on 1 October; installation by Seaholme’s technician on 8 October; and 24 months of remote support from 1 October. Sold separately, Seaholme charges $6,000 for the equipment, $600 for installation and $1,400 for two years of support. Seaholme’s financial year ends on 31 December. How much revenue does it recognise in 2026, and what contract liability remains?',
      table: {
        caption: 'Seaholme’s allocation and 2026 revenue (fictional)',
        head: ['Obligation', 'Stand-alone price ($)', 'Allocated ($)', 'Revenue in 2026 ($)', 'Owed at 31 Dec ($)'],
        align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['Equipment', '6,000', '5,400', '5,400', '0'],
          ['Installation', '600', '540', '540', '0'],
          ['Support, 24 months', '1,400', '1,260', '157.50', '1,102.50'],
        ],
        foot: [['Total', '8,000', '7,200', '6,097.50', '1,102.50']],
      },
      steps: [
        'Step 2: the customer could buy the equipment, the installation and the support separately, and none of them significantly modifies another, so there are three performance obligations.',
        String.raw`Steps 3 and 4: the transaction price is 7,200 against stand-alone prices totalling <m>6{,}000 + 600 + 1{,}400 = 8{,}000</m>. Each obligation gets <m>7{,}200 \div 8{,}000 = 0.9</m> of its stand-alone price: 5,400, 540 and 1,260.`,
        'Step 5, the equipment: on 1 October the customer has the speakers, legal title and the risks of ownership, and Seaholme has been paid, so control passes at that point. Revenue: $5,400 on 1 October.',
        'Step 5, installation: performed on 8 October, so $540 of revenue that day.',
        String.raw`Step 5, support: the customer receives it as it is provided, evenly over 24 months, so it is satisfied over time: <m>1{,}260 \times 3 \div 24 = 157.50</m> for October–December. The remaining <m>1{,}260 - 157.50 = 1{,}102.50</m> is a contract liability.`,
      ],
      answer: 'Revenue in 2026: <m>5{,}400 + 540 + 157.50 = 6{,}097.50</m> dollars; contract liability at 31 December: $1,102.50.',
      interpretation: 'Recognising the whole $7,200 on delivery would overstate 2026 revenue by $1,102.50 and hide 21 months of support Seaholme still owes. Allocating the discount to the support alone, because it is “the extra”, would understate the liability; the standards spread it in proportion.' },
    { level: 'applied', title: 'Should Lantern sell a partner’s beans as principal or as agent?', fictional: true,
      setup: 'Suppose that in 2027 a partner roaster offers Lantern two ways to sell its single-origin beans in the online shop. (A) Lantern buys the bags at $9.50 each, holds them in stock and sells them at $17. (B) The partner keeps the stock, sets the price at $17, ships each order itself and pays Lantern a 25% commission on each sale. Lantern expects to sell 1,200 bags. What revenue and gross profit would each option report, and what should drive the choice?',
      steps: [
        String.raw`Option A: Lantern controls the bags before sale (it holds the inventory risk and sets the price), so it is the principal. Revenue <m>1{,}200 \times 17 = 20{,}400</m>; cost of goods sold <m>1{,}200 \times 9.50 = 11{,}400</m>; gross profit 9,000.`,
        String.raw`Option B: the partner controls the bags and sets the price; Lantern arranges the sale, so it is an agent and reports only its commission: <m>0.25 \times 20{,}400 = 5{,}100</m> of revenue, with no cost of goods sold.`,
        String.raw`Risk: under A Lantern pays for every bag it buys. If it buys 1,200 and sells only 1,000, it still holds 200 bags that cost <m>200 \times 9.50 = 1{,}900</m>, which may have to be written down. Under B unsold bags are the partner’s problem.`,
        'Reporting: Lantern can’t choose gross reporting for option B to make the shop look bigger. The arrangement decides who controls the goods, and control decides the presentation.',
      ],
      answer: 'Option A: revenue $20,400 and gross profit $9,000, with inventory risk. Option B: revenue and gross profit $5,100, with no inventory risk. Option A: $3,900 more gross profit if all 1,200 bags sell, before the shipping and card fees Lantern would bear on its own sales.',
      interpretation: 'The revenue figures differ fourfold although the coffee and the customers are the same. Under A, Lantern would also pay the couriers and card fees on every order, costs that sit below gross profit and narrow the gap. The real choice is between a larger, riskier margin and a smaller, safer one; anyone comparing Lantern’s revenue growth with another shop’s should first ask whether both report as principal.' },
  ],

  demo: [
    { widget: 'rr-allocate', intro: 'A bundle of equipment, installation and a support plan, as in the Seaholme example. Change the bundle price and the three stand-alone prices to see how the discount is shared, then move the months of support delivered to see how much revenue has been recognised and how much is still a contract liability.' },
    { widget: 'rr-drill', intro: 'Lantern’s year in summary entries for its revenue streams: deposits, prepaid events, invoiced events, workshops, shop sales and refunds. For each, choose the accounts, whether each increases or decreases, the debit or credit and the amount, then check the entry.' },
  ],

  mistakes: [
    { title: '“Subscription payments are shop sales.”', html: 'A prepaid subscription pays for bags not yet shipped, so it is a contract liability until each bag goes out. Lantern’s $2,960 of prepaid subscriptions is in Unearned Revenue, not in Online Sales Revenue; counting it as revenue would overstate 2026 sales.' },
    { title: '“Refunds are an operating expense.”', html: 'A refund undoes part of a sale, so it reduces revenue through a contra-revenue account. Lantern’s $1,025 appears between gross and net revenue. Treating it as an expense would leave net revenue $1,025 too high and distort the gross margin, which is calculated on net revenue.' },
    { title: '“A bundle discount belongs to the item with the highest margin” (or “to the service”).', html: 'The transaction price is allocated in proportion to stand-alone selling prices, so a bundle discount is shared by every obligation. Loading it onto one item moves revenue between periods, because the items are delivered at different times.' },
    { title: '“Whoever collects the customer’s money reports the full price as revenue.”', html: 'Collecting the cash doesn’t make a business the principal. The test is control of the good or service before transfer: who is responsible for delivering it, who bears inventory risk, who sets the price. An agent reports only its commission, even if it handles every payment.' },
    { title: '“The analytics dashboard’s order values are revenue.”', html: 'Order values measure orders placed. Revenue measures obligations satisfied: an order not yet shipped isn’t revenue, a refund reduces it and a prepayment isn’t revenue yet. Lantern’s figures happen to be close ($111,024.55 against $111,025 gross), but only a reconciliation shows why.' },
  ],

  application: [
    { p: '<b>A subscription plan.</b> Ana is considering an annual coffee subscription for 2027: twelve monthly bags for $180, paid at sign-up. Suppose 200 customers join on 1 April. The shop collects <m>200 \\times 180 = 36{,}000</m> dollars that day, but each bag shipped earns only <m>180 \\div 12 = 15</m> dollars of revenue, so by 31 December, after nine shipments, revenue is <m>200 \\times 9 \\times 15 = 27{,}000</m> and $9,000 is still owed in coffee. The plan improves Lantern’s cash immediately and its revenue only gradually, and the contract liability is the honest record of the gap between the two.' },
    { p: '<b>An auditor’s cut-off test.</b> Revenue errors cluster at period ends, where a sale can slip into the wrong year. An auditor testing Lantern’s 2026 revenue would select shipments and events on either side of 31 December and check, against shipping records and event confirmations, that each landed in the right year. The auditor would also confirm that the two January events and the 9 January workshop sit in Unearned Revenue rather than in 2026 revenue, and that refunds paid in late December were deducted from 2026 revenue. The five steps tell the auditor what evidence to ask for: proof of the contract, the price and, above all, the date control passed.' },
    { p: '<b>Reading revenue across business models.</b> An analyst comparing an online retailer with an online marketplace starts by asking how each reports. The retailer, as principal, reports the full price of what it sells; the marketplace, as agent, reports its commissions. A marketplace with smaller revenue may handle far more customer spending, and its gross margin will look much higher because it has almost no cost of goods sold. Comparing the two on revenue alone, or on gross margin alone, misleads; F03 develops the ratios that make such comparisons work.' },
  ],

  summary: [
    'ASC 606 and IFRS 15 recognise revenue through five steps: identify the contract, identify the performance obligations, determine the transaction price, allocate it by stand-alone selling prices, and recognise revenue when or as each obligation is satisfied.',
    'An obligation is satisfied over time if the customer consumes the benefit as the business performs, controls the asset as it is built, or the asset has no alternative use and the business has a right to payment to date; otherwise at a point in time, judged by indicators such as title, possession and acceptance.',
    'Cash received before performance is a contract liability (unearned revenue); performance before payment creates a receivable. Lantern ended 2026 with $6,100 of unearned revenue: $1,640 of event deposits, $1,500 of workshop fees and $2,960 of subscriptions.',
    'Returns, allowances and sales discounts reduce revenue through contra-revenue accounts; expected returns are estimated as a refund liability. Lantern’s gross revenue of $194,345 less $1,025 of refunds gives net revenue of $193,320.',
    'A principal reports the gross amount the customer pays; an agent reports its fee or commission. Lantern is the principal for its shop’s beans, so card and platform fees are expenses.',
    'Analytics order values ($111,024.55) reconcile to the books: Online Sales Revenue $111,025, net online sales $110,000, and $2,960 of subscriptions still owed.',
  ],

  glossary: [
    { term: 'Contract liability', def: 'A business’s obligation to transfer goods or services to a customer from whom it has received payment, or from whom payment is due. In the ledger it is usually called unearned or deferred revenue.' },
    { term: 'Contract asset', def: 'A business’s right to payment for goods or services it has already transferred, when that right depends on something other than the passage of time, such as its own further performance. When only time stands in the way, the right is a receivable instead.' },
    { term: 'Transaction price', def: 'The amount a business expects to be entitled to in exchange for the goods or services promised in a contract, excluding amounts collected for third parties such as some sales taxes.' },
    { term: 'Variable consideration', def: 'A part of the transaction price that can change, for example because of discounts, rebates, refunds, price concessions, bonuses or penalties. It is estimated and included only to the extent that a significant reversal of revenue is not expected.' },
    { term: 'Stand-alone selling price', def: 'The price at which a business would sell a promised good or service separately to a customer. Used to allocate a contract’s transaction price among its performance obligations.' },
    { term: 'Control', def: 'In revenue recognition, the customer’s ability to direct the use of a good or service and obtain substantially all of its remaining benefits. Revenue is recognised when control transfers.' },
    { term: 'Contra-revenue account', def: 'An account with a normal debit balance that reduces revenue on the income statement, such as Sales Returns and Allowances or Sales Discounts.' },
    { term: 'Sales Returns and Allowances', def: 'A contra-revenue account for refunds and credits given to customers who return goods or accept a price reduction for unsatisfactory goods.' },
    { term: 'Sales discount', def: 'A reduction of the amount owed that a seller offers for prompt payment, for example 2% off if the invoice is paid within 10 days (2/10, n/30). Recorded in a contra-revenue account.' },
    { term: 'Refund liability', def: 'A liability for the amount a business expects to refund to customers, for example for goods it expects to be returned. Revenue is not recognised for that amount.' },
    { term: 'Principal (in a sale)', def: 'In revenue recognition, a business that controls a good or service before it is transferred to the customer. It recognises revenue at the gross amount the customer pays.' },
    { term: 'Agent (in a sale)', def: 'In revenue recognition, a business that arranges for another party to provide a good or service. It recognises revenue at the amount of its fee or commission.' },
    { term: 'Net revenue', def: 'Gross revenue less sales returns and allowances and sales discounts; also called net sales. The first total on a multi-step income statement.' },
  ],

  references: [
    { text: 'IFRS Foundation. <i>IFRS 15 Revenue from Contracts with Customers</i>. Standard summary page (the core principle and the five steps; issued May 2014; effective for annual periods beginning on or after 1 January 2018).', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/', checked: '2026-10-23' },
    { text: 'Australian Accounting Standards Board. <i>Compiled AASB 15 Revenue from Contracts with Customers</i> (compiled 31 December 2022), which incorporates IFRS 15 with its paragraph numbering; paragraphs 9, 27, 33, 35, 38, 47, 51, 74, 77, 79, 106, 107, 108, B21 and B35B–B37, and Appendix A. Federal Register of Legislation.', url: 'https://www.legislation.gov.au/F2015L00115/2022-12-31/2022-12-31/text/original/epub/OEBPS/document_1/document_1.html', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Revenue Recognition</i>, section 1.6, “Step 3: Determine the Transaction Price” (ASC 606-10-32-6 and 606-10-32-11). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-1-overview/1-6-step-3-determine-transaction', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Revenue Recognition</i>, section 1.8, “Step 5: Recognize Revenue When (or as) the Entity Satisfies a Performance Obligation” (control, the over-time criteria and ASC 606-10-25-30). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-1-overview/1-8-step-5-recognize-revenue', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Revenue Recognition</i>, section 8.4, “Revenue Recognized Over Time” (ASC 606-10-25-27). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-8-step-5-determine-when/8-4-revenue-recognized-over-time', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Revenue Recognition</i>, section 14.4, “Contract Assets” (ASC 606-10-45-3). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-14-presentation/14-4-contract-assets', checked: '2026-10-23' },
    { text: 'PwC. <i>Revenue from contracts with customers</i> guide, section 8.2, “Rights of return” (ASC 606-10-55-23). Viewpoint.', url: 'https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_8_practical__US/82rights_of_return_US.html', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 6.4, “Analyze and Record Transactions for the Sale of Merchandise Using the Perpetual Inventory System” (sales returns and allowances, sales discounts). OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/6-4-analyze-and-record-transactions-for-the-sale-of-merchandise-using-the-perpetual-inventory-system', checked: '2026-10-23' },
  ],

  checks: [
    // the opening case and Lantern’s streams
    { what: 'Catering events (case)', value: cat.events, shown: 76 },
    { what: 'Workshops (case)', value: tr.workshops, shown: 14 },
    { what: 'Shop order values', value: D.shopOrderValue, shown: 111024.55 },
    { what: 'Cash received from customers', value: dr('y6', 'Cash') + dr('y9', 'Cash') + dr('y11', 'Cash') + dr('y12', 'Cash') - cr('y13', 'Cash'), shown: 191220 },
    { what: 'Unearned revenue at 31 December', value: D.unearned, shown: 6100 },
    { what: 'Accounts receivable at 31 December', value: cat.invoiced - cat.collected - cat.writtenOff, shown: 7380 },
    { what: 'Average catering price', value: cat.average, shown: 820 },
    { what: 'Workshop price', value: tr.price, shown: 125 },
    // the streams table
    { what: 'Catering revenue', value: D.cateringRevenue, shown: 62320 },
    { what: 'Catering revenue = events × average', value: cat.events * cat.average, shown: 62320 },
    { what: 'Training revenue', value: D.trainingRevenue, shown: 21000 },
    { what: 'Training revenue = 14 × 12 × 125', value: tr.workshops * tr.participants * tr.price, shown: 21000 },
    { what: 'Online sales revenue', value: D.onlineSales, shown: 111025 },
    { what: 'Gross revenue', value: D.grossRevenue, shown: 194345 },
    { what: 'Gross revenue = sum of streams', value: D.cateringRevenue + D.trainingRevenue + D.onlineSales, shown: 194345 },
    { what: 'Refunds under 1% of shop sales', value: shop.refunds / shop.sales * 100 < 1 ? 1 : 0, shown: 1 },
    { what: 'Refunds', value: shop.refunds, shown: 1025 },
    { what: 'Net revenue', value: D.revenue, shown: 193320 },
    { what: 'Net revenue = gross − refunds', value: D.grossRevenue - shop.refunds, shown: 193320 },
    // receivables and unearned revenue
    { what: 'Catering invoiced', value: cat.invoiced, shown: 59920 },
    { what: 'Catering collected', value: cat.collected, shown: 51720 },
    { what: 'Written off', value: cat.writtenOff, shown: 820 },
    { what: 'Harbor Tech deposit', value: cat.depositsEarned, shown: 2400 },
    { what: 'January event deposits', value: cat.depositsReceived - cat.depositsEarned, shown: 1640 },
    { what: 'Workshop paid for January', value: tr.paidForJanuary, shown: 1500 },
    { what: 'Prepaid subscriptions', value: shop.prepaidSubscriptions, shown: 2960 },
    { what: 'Total received in advance', value: cat.depositsReceived + tr.paidForJanuary + shop.prepaidSubscriptions, shown: 8500 },
    { what: 'Unearned revenue = received − earned', value: cat.depositsReceived + tr.paidForJanuary + shop.prepaidSubscriptions - cat.depositsEarned, shown: 6100 },
    { what: 'Unearned revenue composition', value: (cat.depositsReceived - cat.depositsEarned) + tr.paidForJanuary + shop.prepaidSubscriptions, shown: D.unearned },
    { what: 'Unearned Revenue credits in y6, y11, y12 less y7 debit', value: cr('y6', 'Unearned Revenue') + cr('y11', 'Unearned Revenue') + cr('y12', 'Unearned Revenue') - dr('y7', 'Unearned Revenue'), shown: 6100 },
    // principal or agent
    { what: 'Card and platform fees', value: shop.cardFees, shown: 4010 },
    { what: 'Marketplace commission on $1 million at 10%', value: 1000000 * 0.10, shown: 100000 },
    // reconciliation
    { what: 'Order values March–June', value: shop.orderValueMarJun, shown: 9096.15 },
    { what: 'Order values July–December', value: shop.orderValueJulDec, shown: 101928.40 },
    { what: 'Rounding', value: shop.sales - D.shopOrderValue, shown: 0.45 },
    { what: 'Net online sales', value: D.netOnlineSales, shown: 110000 },
    { what: 'Cash from shop customers', value: shop.sales - shop.refunds + shop.prepaidSubscriptions, shown: 112960 },
    { what: 'Cash from shop customers (from entries)', value: dr('y12', 'Cash') - cr('y13', 'Cash'), shown: 112960 },
    // allocation and Seaholme
    { what: 'Seaholme SSP total', value: merSSP, shown: 8000 },
    { what: 'Seaholme ratio', value: mer.price / merSSP, shown: 0.9 },
    { what: 'Seaholme bundle discount', value: merSSP - mer.price, shown: 800 },
    { what: 'Seaholme equipment', value: merAlloc(mer.equip), shown: 5400 },
    { what: 'Seaholme installation', value: merAlloc(mer.install), shown: 540 },
    { what: 'Seaholme support', value: merAlloc(mer.support), shown: 1260 },
    { what: 'Seaholme support recognised', value: merAlloc(mer.support) * mer.elapsed / mer.months, shown: 157.50 },
    { what: 'Seaholme contract liability', value: merAlloc(mer.support) * (1 - mer.elapsed / mer.months), shown: 1102.50 },
    { what: 'Seaholme 2026 revenue', value: merAlloc(mer.equip) + merAlloc(mer.install) + merAlloc(mer.support) * mer.elapsed / mer.months, shown: 6097.50 },
    { what: 'Seaholme support months left (21)', value: mer.months - mer.elapsed, shown: 21 },
    // Selkie
    { what: 'Selkie fee per lesson', value: selkie.fee / selkie.lessons, shown: 18 },
    { what: 'Selkie received', value: selkie.children * selkie.fee, shown: 7200 },
    { what: 'Selkie term revenue', value: selkie.children * selkie.given * selkie.fee / selkie.lessons, shown: 5760 },
    { what: 'Selkie contract liability', value: selkie.children * selkie.fee * (1 - selkie.given / selkie.lessons), shown: 1440 },
    { what: 'Selkie total revenue', value: 5760 + selkie.school, shown: 6660 },
    // partner roaster
    { what: 'Option A revenue', value: pr.bags * pr.price, shown: 20400 },
    { what: 'Option A COGS', value: pr.bags * pr.cost, shown: 11400 },
    { what: 'Option A gross profit', value: pr.bags * (pr.price - pr.cost), shown: 9000 },
    { what: 'Option B commission', value: pr.commission * pr.bags * pr.price, shown: 5100 },
    { what: 'Unsold bags cost', value: pr.unsold * pr.cost, shown: 1900 },
    { what: 'A − B gross profit', value: 9000 - 5100, shown: 3900 },
    { what: 'Revenue ratio about fourfold', value: 20400 / 5100, shown: 4 },
    // application
    { what: 'Subscription cash', value: 200 * 180, shown: 36000 },
    { what: 'Revenue per bag', value: 180 / 12, shown: 15 },
    { what: 'Subscription revenue to 31 Dec', value: 200 * 9 * 15, shown: 27000 },
    { what: 'Subscription still owed', value: 36000 - 27000, shown: 9000 },
  ],
};
