// balance-sheet-and-equity.js — F02 · The balance sheet and equity. Content only; exercises are in balance-sheet-and-equity.ex.js.
// Uses STATEMENTS.balance and STATEMENTS.equity, ADJUSTMENTS (e8), FACTS and DERIVED from case.js. New fictional detail
// introduced here: Lantern’s shares have no par value (consistent with case.js, where all $20,000 is in Common Stock and
// Additional Paid-in Capital has no balance). The December dividend payable and the van lender’s ratio test are hypothetical.
import { FACTS, DERIVED, STATEMENTS, ADJUSTMENTS, LEDGER } from './case.js?v=22';

const D = DERIVED;
const bal = (n) => LEDGER[n]?.balance || 0;
const e8 = ADJUSTMENTS.find((t) => t.id === 'e8');
const decDividend = FACTS.dividends[1].amount;                    // 4,700
const clNoE8 = D.currentLiabilities - FACTS.vanNote.instalment;   // 21,289
// Hypothetical extra dividend of $15,000 and a 1.5 minimum current ratio
const extra = 15000, minRatio = 1.5;
// Hazelmere Furniture (challenging example)
const EO = { shares0: 40000, cs0: 400, apic0: 239600, re0: 85000, newShares: 10000, price: 15, par: 0.01, ni: 64000, dps: 0.40 };
const eoCash = EO.newShares * EO.price;
const eoCS = EO.newShares * EO.par;
const eoDiv = EO.dps * (EO.shares0 + EO.newShares);
const eoRE = EO.re0 + EO.ni - eoDiv;
// Thistle Lane Florists (simple example)
const TL = { cash: 8400, ar: 6200, allow: 300, inv: 3100, prepaid: 1800, van: 36000, ad: 9000, ap: 4900, wages: 1100, deposits: 2600, intPay: 450, loan: 18000, instalment: 6000, cs: 10000 };
const tlCA = TL.cash + TL.ar - TL.allow + TL.inv + TL.prepaid;
const tlCL = TL.ap + TL.wages + TL.deposits + TL.intPay + TL.instalment;
const tlTA = tlCA + TL.van - TL.ad;
const tlTL = tlCL + TL.loan - TL.instalment;

export default {
  slug: 'balance-sheet-and-equity',
  title: 'The balance sheet and equity',
  blurb: 'Put Lantern’s year-end balances into a classified balance sheet: decide what is current, split a loan into its current and noncurrent parts, and calculate working capital and the current ratio. Then look inside equity, at par value, additional paid-in capital, dividends and the statement of changes in equity.',
  status: 'reviewed',
  objectives: [
    'Classify assets and liabilities as current or noncurrent under US GAAP and IFRS, including the current portion of long-term debt.',
    'Prepare a classified balance sheet in report form, with contra accounts shown on its face.',
    'Calculate working capital and the current ratio, and the effect on them of debt classification and of when a dividend is paid.',
    'Record the issue of par-value and no-par stock and the declaration and payment of a cash dividend.',
    'Prepare a statement of changes in equity and reconcile it with the balance sheet.',
  ],
  prerequisites: [
    { lesson: 'f01/accounts-and-classifications', why: 'It introduced current and noncurrent items and the operating cycle.' },
    { lesson: 'f01/financial-statements', why: 'It introduced the classified balance sheet, the statement of changes in equity and how the statements articulate.' },
    { lesson: 'f00/capital-and-liquidity', why: 'Working capital and the current ratio are defined there.' },
    { lesson: 'f02/receivables-and-payables', why: 'Lantern’s current liabilities and its net receivables were built up there.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In January Ana sends Lantern’s first annual statements to Coastline Bank and to the finance company that lent $20,000 for the van. Both lenders turn first to the balance sheet at 31 December 2026, and both ask the same questions. What must Lantern pay within the next year, and what will it have to pay it with? How much of the business is financed by its owner, and how much of that is profit Ana has left in the business rather than paid out?' },
    { p: 'The balance sheet answers those questions only if it is organised. A <g>classified balance sheet</g> groups assets and liabilities into current and noncurrent. A <g>current asset</g> is cash or an asset expected to be turned into cash, sold or used up within one year or the <g>operating cycle</g>, whichever is longer; a <g>current liability</g> is one expected to be settled within the same horizon. Everything else is a <g>noncurrent asset</g> or a <g>noncurrent liability</g>. The split lets a reader set what is due soon against what will be available soon, which is the first test of <g>liquidity</g>.' },
    { p: 'Within each group, US companies list assets in <g>order of liquidity</g>: cash first, then receivables, inventory and prepayments, then long-lived assets. Liabilities follow in roughly the order they fall due, then equity. Long-term loans need care: most are repaid in instalments, so the part due within the next year is a current liability and the rest noncurrent, even though it is one loan. That part is the <g>current portion of long-term debt</g>, and Lantern’s van note is the example.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12"><rect x="40" y="34" width="140" height="120" fill="var(--series-1)" opacity="0.14"/><g fill="currentColor"><text x="320" y="18" text-anchor="middle" font-size="13" font-weight="600">Lantern’s loan repayments after 31 December 2026</text><text x="110" y="52" text-anchor="middle">Current</text><text x="110" y="66" text-anchor="middle" font-size="11">payables, wages, tax</text><text x="400" y="52" text-anchor="middle">Noncurrent</text></g><path d="M40 120 H620" stroke="currentColor" stroke-width="1.5"/><path d="M180 34 V160" stroke="var(--series-1)" stroke-width="2" stroke-dasharray="5 3"/><g stroke="currentColor" stroke-width="1.5"><path d="M40 115 V125"/><path d="M320 115 V125"/><path d="M460 115 V125"/><path d="M600 115 V125"/></g><g fill="currentColor" font-size="11"><text x="40" y="142" text-anchor="middle">31 Dec 2026</text><text x="180" y="176" text-anchor="middle">31 Dec 2027: the one-year line</text><text x="320" y="142" text-anchor="middle">31 Dec 2028</text><text x="460" y="142" text-anchor="middle">31 Dec 2029</text><text x="600" y="142" text-anchor="middle">31 Dec 2030</text></g><g fill="var(--series-2)"><circle cx="98" cy="120" r="6"/><circle cx="203" cy="120" r="6"/><circle cx="238" cy="120" r="6"/><circle cx="378" cy="120" r="6"/><circle cx="518" cy="120" r="6"/></g><g stroke="var(--rule-strong)" stroke-width="1"><path d="M98 113 V100"/><path d="M203 113 V82"/><path d="M238 113 V100"/><path d="M378 113 V100"/><path d="M518 113 V100"/></g><g fill="currentColor"><text x="98" y="95" text-anchor="middle">Van $5,000</text><text x="203" y="77" text-anchor="middle">Coastline $10,000</text><text x="252" y="95" text-anchor="middle">Van $5,000</text><text x="378" y="95" text-anchor="middle">Van $5,000</text><text x="518" y="95" text-anchor="middle">Van $5,000</text></g></svg>',
      caption: 'Lantern’s loan repayments on a time line from the balance sheet date (fictional). Only the van instalment due on 1 June 2027 falls before the one-year line, so only $5,000 of the $30,000 owed on the two notes is current.',
      alt: 'A time line runs from 31 December 2026 to 31 December 2030. A shaded band covers the first year, up to a dashed line at 31 December 2027 labelled the one-year line, and is marked current, with payables, wages and tax; the rest is marked noncurrent. Dots show the loan repayments: a $5,000 van instalment on 1 June 2027 inside the current band; the $10,000 Coastline note on 1 March 2028 and van instalments of $5,000 on 1 June 2028, 2029 and 2030, all beyond the line.',
    } },
    { p: 'The other half of the balance sheet is equity, the owners’ claim. It has two sources, and the balance sheet keeps them apart. <g>Contributed capital</g> is what owners paid in for their shares; <g>retained earnings</g> is the profit the business has earned and kept, net income since it began less every dividend. How contributed capital is split into par value and additional paid-in capital, how dividends are recorded, and how the statement of changes in equity ties the year together are the second half of this lesson.' },
    { callout: 'key', title: 'Classification changes ratios, not totals', html: 'Moving the van’s next instalment from noncurrent to current liabilities leaves total liabilities and total assets unchanged. It changes working capital and the current ratio, and those are the numbers lenders write into their agreements. Classifying correctly is therefore not a matter of tidiness.' },
  ],

  theory: [
    { h: 'Current or noncurrent: the rules' },
    { p: 'F01 introduced the test: an item is current if it will be realised, sold, used up or settled within one year or the operating cycle, whichever is longer. Three details matter when a balance sheet is prepared. Under US GAAP the operating cycle replaces the year only when it is longer than twelve months, and when there is no clearly defined cycle the one-year rule applies (ASC 210-10-45-3); Lantern, like most businesses, uses one year. Under IFRS, trade payables and accrued operating costs are current even if some are due after more than twelve months, because they belong to the operating cycle (IAS 1, paragraph 70). And a liability is current whenever the entity has no right, at the end of the reporting period, to defer its settlement for at least twelve months (IAS 1, paragraph 69(d), as amended from 2024; IFRS 18, which replaces IAS 1 for annual periods beginning on or after 1 January 2027, carries these requirements forward unchanged).' },
    { p: 'Some businesses, such as banks, have no clearly identifiable operating cycle, and IAS 1 lets them present assets and liabilities in order of liquidity without a current and noncurrent split when that is more relevant (paragraph 60). IAS 1 also doesn’t prescribe the order or format of the statement (paragraph 57), so some IFRS reporters list noncurrent assets first and show equity before liabilities. The facts are the same; only the layout differs.' },
    { h: 'Lantern’s classified balance sheet' },
    { statement: STATEMENTS.balance },
    { p: 'Current assets of $56,476 are dominated by cash ($42,940). Receivables are shown at the gross $7,380 with the allowance of $584 deducted on the face of the statement, so the reader sees both what customers owe and what Lantern expects to collect. Prepaid insurance of $300 is the cover for January and February 2027, the last two months of the policy. Property and equipment appear at cost less accumulated depreciation, $12,000 − $2,000 and $30,000 − $2,800, for a net $37,200. Total assets are $93,676.' },
    { p: 'On the other side, current liabilities of $26,289 are the six items built up in the receivables and payables lesson. Noncurrent liabilities of $25,000 are notes payable: Coastline’s $10,000, due in one sum on 1 March 2028, fourteen months after the balance sheet date, and the $15,000 of the van note due after 31 December 2027. Equity is $42,387: $20,000 of common stock and $22,387 of retained earnings. Liabilities plus equity, <m>51{,}289 + 42{,}387</m>, equal total assets of $93,676. The form shown, with assets above and liabilities and equity below, is the <g>report form</g>; the <g>account form</g> sets assets on the left and liabilities and equity on the right, like the two sides of an account.' },
    { h: 'The current portion of long-term debt' },
    { p: 'Lantern’s van note was $20,000, repayable in four yearly instalments of $5,000 from 1 June 2027. At 31 December 2026 the first instalment is due within twelve months and will be paid from current assets, so it is a current liability; the other $15,000 is not due until 2028 and later. The ledger keeps the note in one account, so at the year end the accountant moves the current part with a reclassification entry, adjustment e8. The entry changes no total and involves no cash: it moves $5,000 from one liability line to another.' },
    { journal: { caption: 'Lantern’s reclassification at 31 December 2026 (e8, from the case)', entries: [
      { date: '2026-12-31', lines: e8.lines, memo: 'e8: the instalment due on 1 June 2027 is shown as a current liability. The interest due with it, $700 accrued for June–December, is already in Interest Payable.' },
    ] } },
    { p: String.raw`The split is redone at every balance sheet date. By 31 December 2027 Lantern will have paid the first instalment, and two amounts will be due within the following year: the van’s second instalment on 1 June 2028 and the whole of Coastline’s note on 1 March 2028. The current portion will rise to <m>10{,}000 + 5{,}000 = 15{,}000</m> and only $10,000 of van instalments, those due in 2029 and 2030, will stay noncurrent. A loan that is comfortably long-term this year can become a large current liability next year just because time passes, which is why lenders and borrowers plan refinancing well before that happens.` },
    { p: 'Two complications are left to intermediate accounting. If a borrower breaches a loan condition (a covenant) on or before the balance sheet date and the loan becomes repayable on demand, IFRS classifies the whole loan as current even if the lender agrees after the year end not to demand repayment (IAS 1, paragraph 74). And a short-term loan the company intends to refinance on long-term terms may in some circumstances be shown as noncurrent; US GAAP (ASC 470-10) and IFRS draw that line in different places.' },
    { h: 'Working capital and the current ratio' },
    { p: String.raw`Two measures from F00 summarise the current section. <g>Working capital</g> is current assets minus current liabilities; the <g>current ratio</g> divides one by the other. For Lantern, working capital is <m>56{,}476 - 26{,}289 = 30{,}187</m> and the current ratio is <m>56{,}476 \div 26{,}289 \approx 2.15</m>: about $2.15 of current assets for every dollar due within the year. Had the accountant forgotten e8, current liabilities would have been $21,289, working capital $35,187 and the ratio 2.65, a flattering picture of the same business.` },
    { p: 'The current ratio treats every current asset as equally able to pay bills, which is rarely true. Lantern’s cash alone, $42,940, exceeds all its current liabilities, while $6,100 of those liabilities will be settled by delivering events and coffee, not by paying cash. Judging whether 2.15 is comfortable for a coffee business, and comparing it with others, is the work of F03 Financial Statement Analysis; here the point is that the ratio is only as good as the classification behind it.' },
    { h: 'Contributed capital: par value and additional paid-in capital' },
    { p: 'A corporation’s charter states how many shares it may issue, its <g>authorised shares</g>, and for many companies a <g>par value</g> for each: a nominal amount, often a cent or less, fixed by the charter and given meaning by state corporate law rather than by accounting standards. In Delaware, for example, shares with a par value may not be issued for less than par (Delaware General Corporation Law, section 153), and the capital a corporation records for them must be at least their total par value (section 154). Because par is usually tiny, it says nothing about what a share is worth.' },
    { p: 'When shares are issued, US practice splits the proceeds: Common Stock is credited with the par value of the shares issued, and the rest goes to <g>additional paid-in capital</g> (APIC). <g>No-par stock</g> is credited in full to Common Stock, unless the board assigns it a stated value, which is then treated like par. Lantern’s shares have no par value, so all of Ana’s $20,000 went to Common Stock and its Additional Paid-in Capital account is empty. Had the same $20,000 bought 2,000 shares with a $1 par value, the entry would have split it: $2,000 to Common Stock and $18,000 to APIC. Total contributed capital is the same either way.' },
    { journal: { caption: 'Ana’s investment as recorded (no-par shares, y1) and as it would have been recorded with a $1 par value (hypothetical)', entries: [
      { date: '2026-03-01', lines: [{ acct: 'Cash', dr: 20000 }, { acct: 'Common Stock', cr: 20000 }], memo: 'y1: no-par shares, so the whole amount is Common Stock.' },
      { date: '2026-03-01', lines: [{ acct: 'Cash', dr: 20000 }, { acct: 'Common Stock', cr: 2000 }, { acct: 'Additional Paid-in Capital', cr: 18000 }], memo: 'Alternative: 2,000 shares of $1 par issued at $10 each; par to Common Stock, the excess to APIC.' },
    ] } },
    { p: 'Shares are sometimes issued for something other than cash, such as equipment or professional services. The issue is then recorded at the fair value of the shares or of what is received, whichever can be measured more reliably, and split between par and APIC in the usual way.' },
    { p: 'The balance sheet or its notes give, for each class of stock, the par or stated value and the numbers of shares authorised, issued and outstanding. Shares are issued when first sold. Some may later be bought back and held as <g>treasury stock</g>, shown as a deduction from equity; issued shares not held in treasury are the <g>outstanding shares</g>, the ones that vote and receive dividends. Some companies also issue preferred stock, which ranks ahead of common stock for dividends; F04 meets it as a source of fixed payments. Companies reporting under IFRS, and UK companies, usually call common stock share capital and APIC share premium.' },
    { h: 'Retained earnings and dividends' },
    { p: 'A cash dividend involves three dates. On the <g>declaration date</g> the board votes the dividend, and it becomes a legal liability: debit Dividends (or Retained Earnings directly; Lantern uses a Dividends account, which is closed to Retained Earnings), credit <g>dividends payable</g>. The <g>date of record</g> fixes who will be paid, the shareholders on the register that day; no entry is made. On the <g>payment date</g> the company pays: debit Dividends Payable, credit Cash. Retained earnings fall when the dividend is declared, not when it is paid.' },
    { p: String.raw`Lantern’s two dividends were declared and paid on the same day, $300 on 30 March and $4,700 on 15 December, so no dividend was owed at the year end. Suppose instead that the December dividend had been declared on 15 December and paid on 8 January 2027. Retained earnings and total equity would be exactly as reported, but the balance sheet would show $4,700 of dividends payable among current liabilities and $4,700 more cash. Working capital would not change (<m>61{,}176 - 30{,}989 = 30{,}187</m>), but the current ratio would fall from 2.15 to about <m>61{,}176 \div 30{,}989 \approx 1.97</m>, because the same amount has been added to both sides of a ratio above one.` },
    { journal: { caption: 'If Lantern’s December dividend had been paid in January (hypothetical)', entries: [
      { date: '2026-12-15', lines: [{ acct: 'Dividends', dr: 4700 }, { acct: 'Dividends Payable', cr: 4700 }], memo: 'Declaration: the board votes the dividend, a liability from today.' },
      { date: '2027-01-08', lines: [{ acct: 'Dividends Payable', dr: 4700 }, { acct: 'Cash', cr: 4700 }], memo: 'Payment: the liability is settled. Nothing was recorded on the date of record.' },
    ] } },
    { h: 'The statement of changes in equity' },
    { p: 'The <g>statement of changes in equity</g> explains how each component of equity moved from the start of the period to the end. For Lantern’s first ten months it is short: common stock rose from nothing to $20,000 when Ana’s shares were issued, and retained earnings rose by net income of $27,387 and fell by dividends of $5,000, ending at $22,387. Each closing balance is the figure on the balance sheet, which is the articulation F01 introduced: net income from the income statement enters here, and total equity leaves here for the balance sheet.' },
    { statement: STATEMENTS.equity },
    { table: {
      caption: 'The same statement in columns, as companies usually present it (fictional)',
      head: ['', 'Common stock ($)', 'Retained earnings ($)', 'Total equity ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Balance at 1 March 2026', '0', '0', '0'],
        ['Shares issued', '20,000', '', '20,000'],
        ['Net income', '', '27,387', '27,387'],
        ['Dividends', '', '(5,000)', '(5,000)'],
      ],
      foot: [['Balance at 31 December 2026', '20,000', '22,387', '42,387']],
    } },
    { callout: 'note', title: 'Other components of equity', html: 'Larger companies’ statements have more columns. Additional paid-in capital and treasury stock each have their own. Under US GAAP so does accumulated other comprehensive income, which collects gains and losses that bypass net income, such as currency differences on foreign operations. IFRS reporters show similar amounts as reserves within equity, such as the revaluation surplus on property met in the long-lived assets lesson. The words vary too: statement of stockholders’ equity in much US practice, statement of changes in equity under IFRS.' },
  ],

  formulas: [
    { id: 'working-capital', name: 'Working capital',
      tex: String.raw`\text{Working capital} = \text{Current assets} - \text{Current liabilities}`,
      where: [
        [String.raw`\text{Current assets}`, 'Cash and assets expected to become cash, be sold or be used up within one year or the operating cycle', '$'],
        [String.raw`\text{Current liabilities}`, 'Obligations due within the same horizon, including the current portion of long-term debt', '$'],
      ],
      note: String.raw`Lantern, 31 December 2026: <m>56{,}476 - 26{,}289 = 30{,}187</m>.` },
    { id: 'current-ratio', name: 'Current ratio',
      tex: String.raw`\text{Current ratio} = \dfrac{\text{Current assets}}{\text{Current liabilities}}`,
      where: [
        [String.raw`\text{Current assets}`, 'As above', '$'],
        [String.raw`\text{Current liabilities}`, 'As above; must be greater than zero', '$'],
      ],
      note: String.raw`Lantern: <m>56{,}476 \div 26{,}289 \approx 2.15</m>. A pure number.` },
    { id: 'current-portion', name: 'Splitting a loan at the balance sheet date',
      tex: String.raw`\text{Noncurrent portion} = \text{Principal outstanding} - \text{Principal due within 12 months}`,
      where: [
        [String.raw`\text{Principal outstanding}`, 'Loan principal owed at the balance sheet date', '$'],
        [String.raw`\text{Principal due within 12 months}`, 'Instalments due in the next year: the current portion of long-term debt', '$'],
      ],
      note: 'Interest accrued to the balance sheet date is a separate current liability (Interest Payable).' },
    { id: 'apic', name: 'Common stock and additional paid-in capital on an issue of shares',
      tex: String.raw`\text{Common stock} = N \times \text{Par}, \qquad \text{APIC} = N \times (P - \text{Par})`,
      where: [
        [String.raw`N`, 'Number of shares issued', 'shares'],
        [String.raw`P`, 'Issue price per share', '$ per share'],
        [String.raw`\text{Par}`, 'Par (or stated) value per share; for no-par stock without a stated value, all proceeds go to common stock', '$ per share'],
      ] },
    { id: 'dividend-amount', name: 'Cash dividend declared',
      tex: String.raw`\text{Dividend} = d \times N_{\text{out}}`,
      where: [
        [String.raw`d`, 'Dividend per share declared by the board', '$ per share'],
        [String.raw`N_{\text{out}}`, 'Shares outstanding (issued shares less treasury shares) on the date of record', 'shares'],
      ] },
    { id: 'ratio-headroom', name: 'Largest cash payment that keeps a minimum current ratio',
      tex: String.raw`\text{Maximum payment} = \text{CA} - k \times \text{CL}`,
      where: [
        [String.raw`\text{CA}, \text{CL}`, 'Current assets and current liabilities before the payment', '$'],
        [String.raw`k`, 'Minimum current ratio required, for example by a loan agreement', ''],
      ],
      assumptions: 'The payment is made in cash from current assets and settles nothing in current liabilities (for example, a dividend paid at once).',
      note: 'If the dividend is declared but not yet paid, it adds to current liabilities instead, and the limit is CA ÷ k − CL.' },
  ],

  examples: [
    { level: 'simple', title: 'A florist’s classified balance sheet', fictional: true,
      setup: 'Thistle Lane Florists, a fictional shop, has these balances at 31 December 2026: Cash $8,400; Accounts Receivable $6,200; Allowance for Doubtful Accounts $300; Inventory (flowers and pots) $3,100; Prepaid Rent for January–March $1,800; Van $36,000; Accumulated Depreciation—Van $9,000; Accounts Payable $4,900; Wages Payable $1,100; Unearned Revenue (wedding deposits for spring) $2,600; Interest Payable $450; a bank loan of $18,000 repayable at $6,000 each 1 July; Common Stock $10,000. Find current assets, current liabilities, working capital, the current ratio and retained earnings.',
      steps: [
        String.raw`Current assets, with the allowance deducted: <m>8{,}400 + 6{,}200 - 300 + 3{,}100 + 1{,}800 = 19{,}200</m>. Prepaid rent is current: it will be used up within the year.`,
        String.raw`Split the loan: the $6,000 due on 1 July 2027 is current; <m>18{,}000 - 6{,}000 = 12{,}000</m> is noncurrent. Current liabilities: <m>4{,}900 + 1{,}100 + 2{,}600 + 450 + 6{,}000 = 15{,}050</m>.`,
        String.raw`Working capital <m>19{,}200 - 15{,}050 = 4{,}150</m>; current ratio <m>19{,}200 \div 15{,}050 \approx 1.28</m>.`,
        String.raw`Total assets <m>19{,}200 + (36{,}000 - 9{,}000) = 46{,}200</m>; total liabilities <m>15{,}050 + 12{,}000 = 27{,}050</m>; equity <m>46{,}200 - 27{,}050 = 19{,}150</m>, so retained earnings are <m>19{,}150 - 10{,}000 = 9{,}150</m>.`,
      ],
      answer: 'Current assets $19,200; current liabilities $15,050 (including the $6,000 current portion of the loan); working capital $4,150; current ratio about 1.28; retained earnings $9,150.',
      interpretation: 'Without the split the florist would have shown current liabilities of $9,050 and a ratio of about 2.12, hiding the fact that a July loan payment will take most of its cash.' },
    { level: 'challenging', title: 'A furniture maker’s year in equity', fictional: true,
      setup: 'Hazelmere Furniture Inc., a fictional company, has 1,000,000 shares of $0.01 par value common stock authorised. On 1 January 2026 it has 40,000 shares issued and outstanding, with Common Stock $400, Additional Paid-in Capital $239,600 and Retained Earnings $85,000. On 1 June it issues 10,000 more shares at $15 each for cash. Net income for 2026 is $64,000, and on 10 December the board declares a dividend of $0.40 a share to shareholders of record on 31 December, payable on 15 January 2027. Record the share issue and the dividend, and prepare the statement of changes in equity.',
      journal: { entries: [
        { date: '2026-06-01', lines: [{ acct: 'Cash', dr: 150000 }, { acct: 'Common Stock', cr: 100 }, { acct: 'Additional Paid-in Capital', cr: 149900 }], memo: '10,000 shares at $15: par 10,000 × $0.01 to Common Stock, the rest to APIC.' },
        { date: '2026-12-10', lines: [{ acct: 'Dividends', dr: 20000 }, { acct: 'Dividends Payable', cr: 20000 }], memo: 'Declaration: $0.40 × 50,000 shares outstanding.' },
        { date: '2027-01-15', lines: [{ acct: 'Dividends Payable', dr: 20000 }, { acct: 'Cash', cr: 20000 }], memo: 'Payment. No entry on the date of record, 31 December.' },
      ] },
      table: { head: ['', 'Common stock ($)', 'APIC ($)', 'Retained earnings ($)', 'Total ($)'], align: ['l', 'r', 'r', 'r', 'r'],
        rows: [
          ['Balance at 1 January 2026', '400', '239,600', '85,000', '325,000'],
          ['Shares issued', '100', '149,900', '', '150,000'],
          ['Net income', '', '', '64,000', '64,000'],
          ['Dividends declared', '', '', '(20,000)', '(20,000)'],
        ],
        foot: [['Balance at 31 December 2026', '500', '389,500', '129,000', '519,000']] },
      steps: [
        String.raw`Share issue: proceeds <m>10{,}000 \times 15 = 150{,}000</m>; Common Stock <m>10{,}000 \times 0.01 = 100</m>; APIC <m>10{,}000 \times (15 - 0.01) = 149{,}900</m>.`,
        String.raw`Shares outstanding at the date of record: <m>40{,}000 + 10{,}000 = 50{,}000</m>. Dividend <m>0.40 \times 50{,}000 = 20{,}000</m>, recorded on 10 December as a liability.`,
        String.raw`Retained earnings: <m>85{,}000 + 64{,}000 - 20{,}000 = 129{,}000</m>. The dividend reduces 2026’s retained earnings although the cash leaves in 2027.`,
        String.raw`Closing equity: <m>500 + 389{,}500 + 129{,}000 = 519{,}000</m>, which agrees with <m>325{,}000 + 150{,}000 + 64{,}000 - 20{,}000</m>. The $20,000 of dividends payable appears among current liabilities on the balance sheet.`,
      ],
      answer: 'Debit Cash 150,000; credit Common Stock 100 and APIC 149,900. Debit Dividends 20,000; credit Dividends Payable 20,000 (paid in January). Equity at 31 December 2026: Common Stock $500, APIC $389,500, Retained Earnings $129,000, total $519,000.',
      interpretation: 'Almost all of the $390,000 Hazelmere’s shareholders have paid in sits in APIC, because the par value is a cent. A reader judging how much capital the owners put in should add Common Stock and APIC together; the split between them is a legal formality.' },
    { level: 'applied', title: 'How much more can Lantern pay Ana?', fictional: true,
      setup: 'Suppose the van’s finance agreement requires Lantern to keep a current ratio of at least 1.5 at each year end, and that on 31 December 2026 Ana is considering an extra dividend of $15,000 on top of the $5,000 already paid. Using the balance sheet (current assets $56,476, current liabilities $26,289, retained earnings $22,387), test the dividend paid on 31 December and the same dividend declared on 31 December but paid in January, and find the largest dividend each way.',
      steps: [
        String.raw`Paid at once: current assets fall to <m>56{,}476 - 15{,}000 = 41{,}476</m>; current liabilities stay at 26,289; ratio <m>41{,}476 \div 26{,}289 \approx 1.58</m>. The test is passed.`,
        String.raw`Declared, paid in January: current liabilities rise to <m>26{,}289 + 15{,}000 = 41{,}289</m>; current assets stay at 56,476; ratio <m>56{,}476 \div 41{,}289 \approx 1.37</m>. The test is failed.`,
        String.raw`Largest dividend paid at once (ratio-headroom formula): <m>56{,}476 - 1.5 \times 26{,}289 = 17{,}042.50</m>. Largest declared but unpaid: <m>56{,}476 \div 1.5 - 26{,}289 \approx 11{,}361.67</m>.`,
        String.raw`Either way working capital falls by 15,000, to <m>30{,}187 - 15{,}000 = 15{,}187</m>, and retained earnings to <m>22{,}387 - 15{,}000 = 7{,}387</m>. Cash after paying it would be <m>42{,}940 - 15{,}000 = 27{,}940</m>, against $20,189 of current liabilities that need cash in the next five months.`,
      ],
      answer: 'A $15,000 dividend paid on 31 December keeps the ratio at about 1.58; declared then and paid in January it would push the ratio to about 1.37 and breach a 1.5 minimum. The limits are about $17,043 paid at once and about $11,362 declared but unpaid.',
      interpretation: 'The same dividend can pass or fail a ratio test depending on when it is paid, because a payable adds to the denominator while a payment subtracts from the numerator. A prudent answer for Ana is smaller still: the business needs cash for January’s bills, the June instalment and the tax payment, and a lender reads the whole balance sheet, not just one ratio.' },
  ],

  demo: [
    { widget: 'bse-ratio', intro: 'Start from Lantern’s balance sheet. Change how much of the long-term debt is classified as current (the default, $5,000, is adjustment e8), and add a dividend paid in cash or declared but unpaid. Watch working capital and the current ratio, and how much room is left under a minimum ratio.' },
    { widget: 'bse-build', intro: 'Build Lantern’s statement of changes in equity and balance sheet from its year: place each account on the right statement, then work out ending retained earnings and total assets. Contra accounts go with the assets they reduce.' },
  ],

  mistakes: [
    { title: '“A long-term loan is a noncurrent liability.”', html: 'Only the part not due within the next year is noncurrent. Instalments due in the next twelve months are current, and a loan repayable in one sum becomes wholly current a year before it falls due: Coastline’s note will be current at 31 December 2027.' },
    { title: '“Reclassifying the current portion means paying it.”', html: 'Entry e8 moves $5,000 from Notes Payable to Current Portion of Long-Term Debt. No cash moves, and total liabilities don’t change; the payment is recorded on 1 June 2027.' },
    { title: '“Par value is what a share is worth.”', html: 'In states such as Delaware, par is a legal minimum issue price, usually a cent or less. Hazelmere’s shares sold at $15 with a par of $0.01; the other $14.99 is additional paid-in capital. Market value, book value and par are three different numbers.' },
    { title: '“Dividends reduce retained earnings when they are paid.”', html: 'Retained earnings fall on the declaration date, when the dividend becomes a liability. The payment settles Dividends Payable and doesn’t touch equity. No entry is made on the date of record.' },
    { title: '“Accumulated depreciation and the allowance are liabilities because they have credit balances.”', html: 'Both are contra-assets. They are deducted from the assets they belong to, on the face of the balance sheet or in a note. Listing them as liabilities would overstate both total assets and total liabilities.' },
  ],

  application: [
    { p: 'Lenders read the classified balance sheet as the starting point for their own tests. Coastline’s loan officer checks that current liabilities include everything due within the year, including the van instalment and the tax, and that the current assets are what they claim to be: cash confirmed by the bank, receivables net of a supported allowance, inventory written down where needed. Loan agreements often set a minimum current ratio or working capital, and a breach can make a loan repayable on demand, which would itself turn a noncurrent liability into a current one. The applied example shows how much the timing of a single payment can matter.' },
    { p: 'Equity is read for what it says about the owners’ commitment. Lantern’s $20,000 of common stock is Ana’s investment; its $22,387 of retained earnings is profit she has left in the business, more than four times the $5,000 paid out. A lender likes that: retained earnings are a cushion that absorbs losses before the lender is affected. When Lantern takes on an outside investor, as the F00 scenario imagines, the statement of changes in equity will record the new shares, and the par and APIC split will depend on the charter.' },
    { p: 'For Ana the balance sheet is also a planning tool. It shows $42,940 of cash, but $20,189 of it is already spoken for by liabilities due in the next five months, and the first van instalment and the tax payment fall in the same weeks of the year. Before buying a new machine or paying a larger dividend she should prepare a cash budget for 2027, starting from this balance sheet. The statement of cash flows, the subject of the next module, explains how the year’s cash came to be $42,940 in the first place.' },
  ],

  summary: [
    'A classified balance sheet separates current items (within one year, or the operating cycle if longer) from noncurrent ones; US companies list assets in order of liquidity and IFRS doesn’t prescribe an order.',
    'IFRS classifies a liability as current if it is due within twelve months or the entity has no right at the period end to defer settlement for twelve months (IAS 1, carried into IFRS 18 from 2027).',
    'The current portion of long-term debt is the principal due within the next year; Lantern’s e8 moves $5,000 of the van note to current, leaving $25,000 of notes payable noncurrent.',
    'Lantern’s balance sheet: total assets $93,676 = liabilities $51,289 + equity $42,387; working capital $30,187; current ratio about 2.15 (2.65 if e8 were forgotten).',
    'Contributed capital is split between common stock (par or stated value) and additional paid-in capital; no-par stock without a stated value goes wholly to common stock, as Lantern’s $20,000 did.',
    'A cash dividend reduces retained earnings on the declaration date and creates dividends payable; the date of record needs no entry; payment settles the liability.',
    'The statement of changes in equity reconciles each component: Lantern’s retained earnings go from 0 + 27,387 − 5,000 to $22,387, and total equity to $42,387, the balance sheet figure.',
  ],

  glossary: [
    { term: 'Order of liquidity', def: 'Listing assets from the most easily turned into cash (cash, then receivables, inventory and prepayments) to the least, and liabilities in roughly the order they fall due.' },
    { term: 'Current portion of long-term debt', def: 'The part of a long-term loan’s principal that is due within one year (or the operating cycle) after the balance sheet date, shown as a current liability; the rest remains noncurrent.' },
    { term: 'Report form', def: 'A balance sheet layout with assets listed first and liabilities and equity below them.' },
    { term: 'Account form', def: 'A balance sheet layout with assets on the left and liabilities and equity on the right, like the two sides of an account.' },
    { term: 'Authorised shares', def: 'The maximum number of shares of a class that a corporation’s charter allows it to issue.' },
    { term: 'Outstanding shares', def: 'Shares that have been issued and are held by shareholders, that is, issued shares less any held as treasury stock. They carry votes and receive dividends.' },
    { term: 'Treasury stock', def: 'A corporation’s own shares that it has issued and later bought back and holds. Shown as a deduction from equity; treasury shares have no votes and receive no dividends.' },
    { term: 'Par value', def: 'A nominal amount per share set in a corporation’s charter, often a cent or less, with legal rather than economic meaning. In states such as Delaware, shares with a par value can’t be issued for less than par.' },
    { term: 'No-par stock', def: 'Shares issued without a par value. Unless the board assigns a stated value, the whole amount received is credited to Common Stock.' },
    { term: 'Additional paid-in capital', def: 'The amount shareholders paid for shares above their par or stated value. Called share premium under IFRS and in the UK.' },
    { term: 'Declaration date', def: 'The date a corporation’s board declares a dividend, when it becomes a liability and retained earnings are reduced.' },
    { term: 'Date of record', def: 'The date that decides which shareholders will receive a declared dividend: those on the register that day. No journal entry is made.' },
    { term: 'Payment date', def: 'The date a declared dividend is paid, settling the dividends payable.' },
    { term: 'Dividends payable', def: 'A current liability for dividends declared but not yet paid.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 5.3, “Apply the Results from the Adjusted Trial Balance to Compute Current Ratio and Working Capital Balance, and Explain How These Measures Represent Liquidity”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/5-3-apply-the-results-from-the-adjusted-trial-balance-to-compute-current-ratio-and-working-capital-balance-and-explain-how-these-measures-represent-liquidity', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, sections 14.2, “Analyze and Record Transactions for the Issuance and Repurchase of Stock”, and 14.3, “Record Transactions and the Effects on Financial Statements for Cash Dividends, Property Dividends, Stock Dividends, and Stock Splits”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/14-2-analyze-and-record-transactions-for-the-issuance-and-repurchase-of-stock', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Issuer’s Accounting for Debt</i>, section 13.3, “General” (balance sheet classification; reproduces ASC 210-10-45). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/liabilities/asc470-10/roadmap-debt/chapter-13-balance-sheet-classification/13-3-general', checked: '2026-10-23' },
    { text: 'European Union. Commission Regulation (EU) 2023/1803 of 13 August 2023 adopting international accounting standards, Annex: <i>IAS 1 Presentation of Financial Statements</i>, paragraphs 57–76. Official Journal L 237.', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R1803', checked: '2026-10-23' },
    { text: 'European Union. Commission Regulation (EU) 2023/2822 of 19 December 2023 amending Regulation (EU) 2023/1803 as regards IAS 1 (classification of liabilities as current or non-current), paragraphs 69(d) and 139U. Official Journal L.', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R2822', checked: '2026-10-23' },
    { text: 'BDO (June 2026). <i>IFRS 18: Classification of Loans as Current or Non-current</i>. IFRS Accounting Standards in Practice (the IAS 1 requirements as carried into IFRS 18, with a concordance of paragraphs).', url: 'https://www.bdo.global/getmedia/b8866082-2b56-4ed8-9df2-600f56d20d1a/IFRS-IP_Classification-of-loans-as-current-or-non-current_June-2026.pdf?ext=.pdf', checked: '2026-10-23' },
    { text: 'IFRS Foundation. <i>IFRS 18 Presentation and Disclosure in Financial Statements</i>, standard summary (effective for annual reporting periods beginning on or after 1 January 2027; replaces IAS 1).', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/', checked: '2026-10-23' },
    { text: 'State of Delaware. <i>Delaware Code</i>, Title 8 (General Corporation Law), chapter 1, subchapter V, sections 153–154 (consideration for stock; capital and surplus).', url: 'https://delcode.delaware.gov/title8/c001/sc05/index.html', checked: '2026-10-23' },
  ],

  checks: [
    // Lantern balance sheet (case.js)
    { what: 'Current assets', value: D.currentAssets, shown: 56476 },
    { what: 'Cash', value: D.cashEnd, shown: 42940 },
    { what: 'Accounts receivable', value: bal('Accounts Receivable'), shown: 7380 },
    { what: 'Allowance', value: D.allowance, shown: 584 },
    { what: 'Prepaid insurance', value: bal('Prepaid Insurance'), shown: 300 },
    { what: 'Prepaid insurance = 1,800 − 1,500', value: FACTS.insurance.premium - FACTS.insurance.monthly * FACTS.insurance.expired, shown: 300 },
    { what: 'Equipment cost', value: bal('Equipment'), shown: 12000 },
    { what: 'Accumulated depreciation, equipment', value: bal('Accumulated Depreciation—Equipment'), shown: 2000 },
    { what: 'Van cost', value: bal('Van'), shown: 30000 },
    { what: 'Accumulated depreciation, van', value: bal('Accumulated Depreciation—Van'), shown: 2800 },
    { what: 'Property and equipment, net', value: D.noncurrentAssets, shown: 37200 },
    { what: 'Total assets', value: D.totalAssets, shown: 93676 },
    { what: 'Current liabilities', value: D.currentLiabilities, shown: 26289 },
    { what: 'Noncurrent liabilities', value: D.noncurrentLiabilities, shown: 25000 },
    { what: 'Notes payable = Coastline 10,000 + van 15,000', value: FACTS.coastline.principal + FACTS.vanNote.principal - FACTS.vanNote.instalment, shown: 25000 },
    { what: 'Coastline principal', value: FACTS.coastline.principal, shown: 10000 },
    { what: 'Van note after e8', value: FACTS.vanNote.principal - FACTS.vanNote.instalment, shown: 15000 },
    { what: 'Van note principal', value: FACTS.vanNote.principal, shown: 20000 },
    { what: 'Van instalment', value: FACTS.vanNote.instalment, shown: 5000 },
    { what: 'e8 amount', value: e8.lines[0].dr, shown: 5000 },
    { what: 'Notes owed on the two notes', value: FACTS.coastline.principal + FACTS.vanNote.principal, shown: 30000 },
    { what: 'Months from 31 Dec 2026 to 1 Mar 2028 (fourteen)', value: 12 + 2, shown: 14 },
    { what: 'Total liabilities', value: D.totalLiabilities, shown: 51289 },
    { what: 'Equity', value: D.equity, shown: 42387 },
    { what: 'Common stock', value: bal('Common Stock'), shown: 20000 },
    { what: 'Retained earnings', value: D.retainedEarnings, shown: 22387 },
    { what: 'Liabilities + equity', value: D.totalLiabilities + D.equity, shown: 93676 },
    { what: 'Unearned revenue', value: D.unearned, shown: 6100 },
    { what: 'Statement row: inventory', value: D.inventoryEnd, shown: 5800 },
    { what: 'Statement row: supplies', value: bal('Supplies'), shown: 640 },
    { what: 'Statement row: accounts payable', value: bal('Accounts Payable'), shown: 9210 },
    { what: 'Statement row: wages payable', value: bal('Wages Payable'), shown: 2100 },
    { what: 'Statement row: interest payable', value: bal('Interest Payable'), shown: 750 },
    { what: 'Statement row: income taxes payable', value: D.taxPayable, shown: 3129 },
    { what: 'Statement row: current portion', value: bal('Current Portion of Long-Term Debt'), shown: 5000 },
    { what: 'Statement check: current assets add up', value: 42940 + 7380 - 584 + 5800 + 640 + 300, shown: 56476 },
    { what: 'Statement check: current liabilities add up', value: 9210 + 2100 + 750 + 6100 + 3129 + 5000, shown: 26289 },
    { what: 'Interest accrued on van note', value: FACTS.vanNote.principal * FACTS.vanNote.rate * FACTS.vanNote.months / 12, shown: 700 },
    // ratios
    { what: 'Working capital', value: D.workingCapital, shown: 30187 },
    { what: 'Current ratio', value: D.currentRatio, shown: 2.15, tol: 0.005 },
    { what: 'Current liabilities without e8', value: clNoE8, shown: 21289 },
    { what: 'Working capital without e8', value: D.currentAssets - clNoE8, shown: 35187 },
    { what: 'Current ratio without e8', value: D.currentAssets / clNoE8, shown: 2.65, tol: 0.005 },
    { what: 'Current portion at end-2027 (hypothetical)', value: FACTS.coastline.principal + FACTS.vanNote.instalment, shown: 15000 },
    { what: 'Noncurrent van instalments at end-2027', value: FACTS.vanNote.principal - 2 * FACTS.vanNote.instalment, shown: 10000 },
    // dividends
    { what: 'March dividend', value: FACTS.dividends[0].amount, shown: 300 },
    { what: 'December dividend', value: decDividend, shown: 4700 },
    { what: 'Dividends for the year', value: D.dividends, shown: 5000 },
    { what: 'Net income', value: D.netIncome, shown: 27387 },
    { what: 'Retained earnings = 0 + 27,387 − 5,000', value: 0 + D.netIncome - D.dividends, shown: 22387 },
    { what: 'Current assets if dividend unpaid', value: D.currentAssets + decDividend, shown: 61176 },
    { what: 'Current liabilities if dividend unpaid', value: D.currentLiabilities + decDividend, shown: 30989 },
    { what: 'Working capital if dividend unpaid', value: (D.currentAssets + decDividend) - (D.currentLiabilities + decDividend), shown: 30187 },
    { what: 'Current ratio if dividend unpaid', value: (D.currentAssets + decDividend) / (D.currentLiabilities + decDividend), shown: 1.97, tol: 0.005 },
    { what: 'Retained earnings more than four times dividends (1 = true)', value: D.retainedEarnings > 4 * D.dividends ? 1 : 0, shown: 1 },
    // par illustration
    { what: 'Par illustration: common stock', value: 2000 * 1, shown: 2000 },
    { what: 'Par illustration: APIC', value: 2000 * (10 - 1), shown: 18000 },
    { what: 'Par illustration: total', value: 2000 + 18000, shown: 20000 },
    // applied example
    { what: 'Paid: current assets', value: D.currentAssets - extra, shown: 41476 },
    { what: 'Paid: ratio', value: (D.currentAssets - extra) / D.currentLiabilities, shown: 1.58, tol: 0.005 },
    { what: 'Declared: current liabilities', value: D.currentLiabilities + extra, shown: 41289 },
    { what: 'Declared: ratio', value: D.currentAssets / (D.currentLiabilities + extra), shown: 1.37, tol: 0.005 },
    { what: 'Max paid', value: D.currentAssets - minRatio * D.currentLiabilities, shown: 17042.50 },
    { what: 'Max declared', value: D.currentAssets / minRatio - D.currentLiabilities, shown: 11361.67, tol: 0.005 },
    { what: 'Max paid (about)', value: D.currentAssets - minRatio * D.currentLiabilities, shown: 17043, tol: 0.5 },
    { what: 'Max declared (about)', value: D.currentAssets / minRatio - D.currentLiabilities, shown: 11362, tol: 0.5 },
    { what: 'Working capital after extra dividend', value: D.workingCapital - extra, shown: 15187 },
    { what: 'Retained earnings after extra dividend', value: D.retainedEarnings - extra, shown: 7387 },
    { what: 'Cash after extra dividend', value: D.cashEnd - extra, shown: 27940 },
    { what: 'Current liabilities needing cash', value: D.currentLiabilities - D.unearned, shown: 20189 },
    // Thistle Lane
    { what: 'Thistle current assets', value: tlCA, shown: 19200 },
    { what: 'Thistle noncurrent loan', value: TL.loan - TL.instalment, shown: 12000 },
    { what: 'Thistle current liabilities', value: tlCL, shown: 15050 },
    { what: 'Thistle working capital', value: tlCA - tlCL, shown: 4150 },
    { what: 'Thistle current ratio', value: tlCA / tlCL, shown: 1.28, tol: 0.005 },
    { what: 'Thistle van net', value: TL.van - TL.ad, shown: 27000 },
    { what: 'Thistle total assets', value: tlTA, shown: 46200 },
    { what: 'Thistle total liabilities', value: tlTL, shown: 27050 },
    { what: 'Thistle equity', value: tlTA - tlTL, shown: 19150 },
    { what: 'Thistle retained earnings', value: tlTA - tlTL - TL.cs, shown: 9150 },
    { what: 'Thistle CL without split', value: tlCL - TL.instalment, shown: 9050 },
    { what: 'Thistle ratio without split', value: tlCA / (tlCL - TL.instalment), shown: 2.12, tol: 0.005 },
    // Hazelmere Furniture
    { what: 'Hazelmere cash from issue', value: eoCash, shown: 150000 },
    { what: 'Hazelmere common stock on issue', value: eoCS, shown: 100 },
    { what: 'Hazelmere APIC on issue', value: eoCash - eoCS, shown: 149900 },
    { what: 'Hazelmere shares outstanding', value: EO.shares0 + EO.newShares, shown: 50000 },
    { what: 'Hazelmere dividend', value: eoDiv, shown: 20000 },
    { what: 'Hazelmere opening equity', value: EO.cs0 + EO.apic0 + EO.re0, shown: 325000 },
    { what: 'Hazelmere opening par check', value: EO.shares0 * EO.par, shown: 400 },
    { what: 'Hazelmere closing common stock', value: EO.cs0 + eoCS, shown: 500 },
    { what: 'Hazelmere closing APIC', value: EO.apic0 + eoCash - eoCS, shown: 389500 },
    { what: 'Hazelmere closing RE', value: eoRE, shown: 129000 },
    { what: 'Hazelmere closing total', value: EO.cs0 + eoCS + EO.apic0 + eoCash - eoCS + eoRE, shown: 519000 },
    { what: 'Hazelmere closing total (other route)', value: 325000 + 150000 + 64000 - 20000, shown: 519000 },
    { what: 'Hazelmere paid-in capital (about $390,000)', value: 500 + 389500, shown: 390000 },
    { what: 'Hazelmere excess over par per share', value: 15 - 0.01, shown: 14.99 },
  ],
};
