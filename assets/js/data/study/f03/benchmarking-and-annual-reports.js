// benchmarking-and-annual-reports.js — F03 · Benchmarking and annual reports. Content only; exercises are in
// benchmarking-and-annual-reports.ex.js.
// Lantern’s figures come from case.js (PERIODS, LEASE, BREWER, FACTS); ratios from core/ratios.js. The peer file of nine
// coffee businesses is fictional (no published industry data was verified for this lesson). Starbucks’ FY2024 figures
// are from REAL-FIGURES.md and the 10-K pages cited.
import { PERIODS, LEASE, BREWER, FACTS } from './case.js?v=19';
import * as R from '../../../core/ratios.js?v=19';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const L = { current: R.liquidity(P27).current, opMargin: R.profitability(P27, P26).operatingMargin, z: R.altman(P27, 'zdouble').score,
  cover: R.solvency(P27).interestCoverage, leaseShare: P27.leaseLiabilities / P27.totalAssets };

// The peer file (fictional): nine independent coffee businesses with cafés, Coastline’s 2027 figures
export const PEERS = {
  names: ['Alder & Oak', 'Bramblecup', 'Copperline', 'Driftwood', 'Emberly', 'Fogwell', 'Greyfriars', 'Heronsgate', 'Ironbark'],
  current: [0.94, 0.62, 1.30, 1.05, 0.78, 1.75, 0.85, 1.48, 1.12],
  opMargin: [6.0, 3.1, 8.1, 6.8, 4.5, 12.0, 5.2, 9.6, 7.4],
  z: [1.9, -0.4, 3.8, 2.4, 0.6, 5.5, 1.2, 4.6, 3.1],
};
/** Excel’s QUARTILE.INC: position (n − 1)p in the sorted list, interpolating. */
export const quartileInc = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b), pos = (s.length - 1) * q / 4, lo = Math.floor(pos);
  return s[lo] + (pos - lo) * ((s[lo + 1] ?? s[lo]) - s[lo]);
};
const stats = (xs) => [1, 2, 3].map((q) => quartileInc(xs, q));
const SC = stats(PEERS.current), SM = stats(PEERS.opMargin), SZ = stats(PEERS.z);
const below = (xs, v) => xs.filter((x) => x < v).length;

// Starbucks FY2024 ($ millions; Form 10-K: statements of earnings R3, balance sheets R7; store data in Item 1)
const SB = { revenue: 36176.2, company: 29765.9, licensed: 4505.1, storeOps: 15286.5, opIncome: 5408.8, ca: 6847.4, cl: 9070.0, ta: 31339.3,
  leaseCur: 1463.1, leaseNon: 8771.6, deferred: 1781.2, equity: -7441.6, storesCo: 21018, storesLic: 19181 };
SB.lease = SB.leaseCur + SB.leaseNon;

// Lantern’s notes: the lease maturity schedule (payments of $4,000 on the 1st of each month to 1 February 2032)
const pay = LEASE.payment;
const leaseYears = [['2028', 12], ['2029', 12], ['2030', 12], ['2031', 12], ['2032 (January and February)', 2]].map(([y, m]) => [y, m * pay]);
const leaseUndiscounted = leaseYears.reduce((s, r) => s + r[1], 0);              // 200,000
const leaseInterest = leaseUndiscounted - LEASE.end2027;                           // 26,621
// debt maturities at 31 December 2027
const DEBT = { coastline: 10000, van2028: 5000, brewer2028: BREWER.current2027, line: P27.debt - 10000 - 5000 - BREWER.current2027 - 10000 - BREWER.noncurrent2027,
  van2029: 5000, van2030: 5000, brewer2029: BREWER.noncurrent2027 };
const due2028 = DEBT.coastline + DEBT.van2028 + DEBT.brewer2028 + DEBT.line;       // 51,091
const law = FACTS.lawFirm;
const fee1 = law.baseFee * (1 + law.expectedInflation);                           // 41,120
const fmt = (v) => (v < 0 ? `(${Math.abs(v).toLocaleString('en-US')})` : v.toLocaleString('en-US'));
const p1 = (v) => (v * 100).toFixed(1);
const d2 = (v) => v.toFixed(2).replace('-', '−');
const d1 = (v) => v.toFixed(1).replace('-', '−');

export default {
  slug: 'benchmarking-and-annual-reports',
  title: 'Benchmarking and annual reports',
  blurb: 'Judge a company’s ratios against the right peers, read an annual report for what the ratios can’t show (the MD&A, the auditor’s report and the notes on revenue, leases and debt), and write an analysis that ends in a conclusion someone can act on.',
  status: 'reviewed',
  objectives: [
    'Choose a peer group and justify it by business model, size, ownership and accounting basis.',
    'Calculate a peer median and quartiles and place a company within them, stating the method used.',
    'Distinguish the differences between two companies that come from scale, from business model and from accounting.',
    'Locate in a Form 10-K the items an analyst needs (business, risk factors, MD&A, the financial statements, the notes and the auditor’s report) and explain what each adds.',
    'Read a company’s notes on revenue, leases and debt and use them to correct or extend a ratio analysis.',
    'Write an analysis memo that states a conclusion, supports it with evidence and names the risks and conditions.',
  ],
  prerequisites: [
    { lesson: 'f03/common-size-statements', why: 'Comparing a small business with a much larger one starts from common-size statements and margins.' },
    { lesson: 'f03/distress-scores', why: 'The peer comparison includes each business’s Z″.' },
    { lesson: 'f02/gaap-and-ifrs', why: 'Peers that report under different frameworks need adjusting before they are compared.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s 2027 current ratio is 0.52 and its operating margin 5.7%. Is that bad? Coastline’s loan officer can’t say from the numbers alone. A café business with daily card takings can run with fewer current assets than a manufacturer, and a business in its expansion year earns less on its assets than it will later. She needs two things: a standard to compare against, and the information behind the numbers that only the annual report and its notes contain.' },
    { p: 'A ratio on its own is a fact without a meaning. It acquires one when it is compared: with the same company’s earlier years (the trend, which earlier lessons covered), with a target such as a loan covenant, or with similar businesses. A <g>benchmark</g> is the standard used for that comparison, and the businesses chosen to supply it are the <g>peer group</g>.' },
    { h: 'Choosing peers' },
    { p: 'Good peers do the same thing in the same way. Four tests help.' },
    { list: [
      '<b>Business model.</b> Same products, customers and way of earning revenue. Café chains that own their stores differ from those that license their brand to other operators; a roaster that sells beans wholesale differs from one that runs cafés.',
      '<b>Size and stage.</b> A two-year-old business with three revenue lines is not comparable with a multinational on most measures, and a business in an expansion year looks different from one at steady state.',
      '<b>Ownership and financing.</b> Private firms often pay their owners partly through dividends rather than salaries (Lantern did in 2026), and listed firms can use market prices that private ones lack.',
      '<b>Accounting basis.</b> US GAAP and IFRS treat leases, interest paid and some other items differently; fiscal years end on different dates.',
    ] },
    { p: 'No peer passes all four perfectly, so analysts use several layers: a close peer set for the main comparison, and larger or listed companies for context. Published industry statistics are a third source, but use them only when you know where they come from and how they were calculated. For this lesson Coastline’s loan officer uses the bank’s own file of nine independent coffee businesses with cafés, which, like Lantern, is fictional.' },
    { h: 'Medians and quartiles' },
    { p: 'Peer figures are summarised by their median and quartiles rather than their average. The median is the middle value when the figures are sorted: half the peers are at or below it. The first quartile (Q1) has a quarter of the peers below it and the third (Q3) three-quarters. A few extreme peers, such as one with a large cash pile, pull an average a long way but barely move a median. Spreadsheets compute quartiles by more than one rule; this lesson uses Excel’s <x>=QUARTILE.INC(range,1)</x>, which places Q1 at position <m>(n - 1) \\times 0.25</m> in the sorted list, counting from zero. With nine peers that is exactly the third value.' },
    { table: {
      caption: 'Lantern 2027 against nine coffee businesses with cafés (Coastline’s peer file, fictional)',
      head: ['Measure', 'Q1', 'Median', 'Q3', 'Lantern', 'Peers below Lantern'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Current ratio', d2(SC[0]), d2(SC[1]), d2(SC[2]), d2(L.current), `${below(PEERS.current, L.current)} of 9`],
        ['Operating margin (%)', d1(SM[0]), d1(SM[1]), d1(SM[2]), p1(L.opMargin), `${below(PEERS.opMargin, L.opMargin * 100)} of 9`],
        ['Altman Z″', d1(SZ[0]), d1(SZ[1]), d1(SZ[2]), d2(L.z), `${below(PEERS.z, L.z)} of 9`],
      ],
      note: 'Quartiles by the inclusive method (QUARTILE.INC). All figures fictional.',
    } },
    { p: 'The table changes the reading of two of the three numbers. A current ratio of 0.52 is low for a café business, but the peer file shows that café businesses commonly run below 1: the median is 1.05 and Q1 is 0.85. Lantern is still the lowest of all ten, so its liquidity is weak even by its industry’s standards. Its operating margin of 5.7% sits between Q1 and the median: ordinary for a peer, not alarming. And its Z″ of 0.24 is below all but one peer, while the peer median of 2.4 is itself in Altman’s grey zone: lease-heavy café businesses score low on the model, which is worth knowing before reading too much into Lantern’s zone.' },
    { h: 'A much larger company: Starbucks' },
    { p: 'Students often compare a small business with the best-known company in its industry. It can be instructive, as long as you separate three kinds of difference: scale, business model and accounting.' },
    { table: {
      caption: 'Lantern 2027 and Starbucks fiscal 2024',
      head: ['', 'Lantern', 'Starbucks'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Revenue', '$577,860', '$36,176.2 million'],
        ['Operating margin', `${p1(L.opMargin)}%`, `${p1(SB.opIncome / SB.revenue)}%`],
        ['Current ratio', d2(L.current), d2(SB.ca / SB.cl)],
        ['Operating lease liabilities ÷ total assets', `${p1(L.leaseShare)}%`, `${p1(SB.lease / SB.ta)}%`],
        ['Total equity', '$62,818', '−$7,441.6 million'],
      ],
      note: 'Lantern: fictional. Starbucks: Form 10-K for the fiscal year ended 29 September 2024 (statements of earnings and balance sheets).',
    } },
    { p: `<b>Scale.</b> Starbucks’ revenue is about 62,600 times Lantern’s. Ratios remove size from the arithmetic, but not from the economics: Starbucks buys coffee, rents property and borrows on terms Lantern cannot get. <b>Business model.</b> Of Starbucks’ 40,199 stores at its year end, 19,181 were licensed: other companies run them, bearing the operating costs and investment, and Starbucks earns revenue from licensed stores (mostly product and equipment sales to licensees, plus royalties and licence fees; ${p1(SB.licensed / SB.revenue)}% of revenue) with little capital. Its customers also prepay on stored-value cards, a liability ($1,781.2 million, with current deferred revenue) that funds working capital. <b>Accounting and financing.</b> Starbucks has returned so much cash to shareholders that its equity is negative, so return on equity and debt-to-equity have no meaning for it. Of the five rows, only the operating margin and the lease share compare like with like, and even the margin reflects licensing.` },
  ],

  theory: [
    { h: 'Reading an annual report' },
    { p: 'A US public company’s annual report to the SEC is the <g>Form 10-K</g>. Its structure is fixed, so you can find the same information in every one. The SEC’s investor guide to the form describes each item; the ones an analyst reads first are these.' },
    { define: [
      ['Item 1, Business', 'What the company does: products, segments, customers, markets and, for a retailer, how many stores it runs and how (Starbucks’ company-operated and licensed stores, for example).'],
      ['Item 1A, Risk Factors', 'The most significant risks, in management’s words. Read it for what the numbers can’t show: dependence on a supplier, a customer or a lender; pending regulation.'],
      ['Item 7, Management’s Discussion and Analysis (MD&A)', 'Management explains the year’s results, liquidity and capital resources, known trends and uncertainties, and its critical accounting estimates. It is where a company explains a fall in margin or a rise in debt.'],
      ['Item 7A, Market Risk', 'Exposure to interest rates, exchange rates and commodity prices (coffee, for a roaster).'],
      ['Item 8, Financial Statements', 'The audited statements, the notes and the auditor’s report.'],
      ['Item 9A, Controls and Procedures', 'Management’s assessment of internal control over financial reporting; a material weakness here is a warning.'],
    ] },
    { p: 'Item 6 once held five years of selected financial data; the SEC removed the requirement in 2020, and filings now show it as “[Reserved]”, as Starbucks’ fiscal 2024 10-K does. For trends you now read the statements of several years.' },
    { h: 'The auditor’s report' },
    { p: 'The <g>auditor’s report</g> sits in Item 8, before the statements. Most reports give an unqualified (clean) opinion: the statements present fairly, in all material respects, the company’s position and results under US GAAP. The SEC’s guide advises investors to look carefully at any other opinion. Three things deserve a reader’s attention: a qualified or adverse opinion or a disclaimer; a paragraph on substantial doubt about the company’s ability to continue as a going concern (the <g>going concern assumption</g> from F01); and, for most public companies, critical audit matters, the areas the auditor found most challenging, which often point to the biggest estimates. Lantern is private and unaudited; a lender of Coastline’s size might ask for a review or an audit as the loan grows.' },
    { h: 'Non-GAAP measures' },
    { p: 'Companies often add their own measures to the GAAP figures: adjusted earnings, EBITDA, free cash flow. A <g>non-GAAP financial measure</g> is allowed in SEC filings with conditions, among them that the company presents the most directly comparable GAAP measure with equal or greater prominence and reconciles the two. Amazon’s free cash flow in its 2014 10-K is an example: defined in a footnote, computed from two lines of its cash-flow statement. Read the reconciliation, watch how the definition changes over time, and compute your own measures from the GAAP figures.' },
    { h: 'The notes that matter most' },
    { p: 'The SEC’s beginners’ guide says the notes to the financial statements are packed with information. For a credit or equity analysis, five notes repay the most attention.' },
    { list: [
      '<b>Revenue recognition</b>: what the company sells, when it recognises revenue, contract assets and liabilities, and the judgements involved (ASC 606).',
      '<b>Leases</b>: the right-of-use assets and lease liabilities, the discount rate, the remaining term and a maturity table of undiscounted payments (ASC 842).',
      '<b>Debt</b>: each borrowing, its rate, its security, its covenants and when it falls due.',
      '<b>Commitments and contingencies</b>: purchase obligations, guarantees and lawsuits that are not, or not yet, liabilities.',
      '<b>Subsequent events</b>: what happened between the balance-sheet date and the date the statements were issued, such as new borrowing or a lost customer.',
    ] },
    { h: 'Lantern’s notes' },
    { p: 'Lantern is private and doesn’t file a 10-K, but its accountant prepares notes with the 2027 statements, and three of them change the analysis.' },
    { table: {
      caption: 'Note: lease maturities at 31 December 2027 (the two cafés, $4,000 a month in advance)',
      head: ['Year', 'Payments ($)'],
      align: ['l', 'r'],
      rows: leaseYears.map(([y, v]) => [y, fmt(v)]),
      foot: [['Total undiscounted payments', fmt(leaseUndiscounted)], ['Less interest at 7.2%', fmt(-leaseInterest)], ['Lease liabilities (current $37,010; noncurrent $136,369)', fmt(LEASE.end2027)]],
      note: 'Fictional. The leases began on 1 March 2027 for five years; 50 monthly payments remain.',
    } },
    { p: `The lease note turns a balance-sheet line into a schedule of cash: $48,000 a year leaves Lantern for the cafés until early 2032, whatever their sales. The revenue note explains the contract asset: Lantern has recognised $30,840 of the law firm’s first-year fee, estimated at $${fee1.toLocaleString('en-US')} with 2.8% inflation, and the firm pays the whole year’s fee on 31 March 2028. The debt note lists what falls due when.` },
    { table: {
      caption: 'Note: debt maturities at 31 December 2027',
      head: ['Borrowing', '2028 ($)', '2029 ($)', '2030 ($)'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Coastline note (6%), due 1 March 2028', fmt(DEBT.coastline), '—', '—'],
        ['Van note (6%), $5,000 each 1 June', fmt(DEBT.van2028), fmt(DEBT.van2029), fmt(DEBT.van2030)],
        ['Brewer instalment plan (principal)', fmt(DEBT.brewer2028), fmt(DEBT.brewer2029), '—'],
        ['Line of credit (9%, revolving, $30,000 limit)', fmt(DEBT.line), '—', '—'],
      ],
      foot: [['Total', fmt(due2028), fmt(DEBT.van2029 + DEBT.brewer2029), fmt(DEBT.van2030)]],
      note: `Fictional. Total interest-bearing debt $${P27.debt.toLocaleString('en-US')}. The line of credit is shown as due in 2028 because it is classified as a current liability.`,
    } },
    { p: `Put the notes together and the analysis sharpens. $${due2028.toLocaleString('en-US')} of debt falls due in 2028, and $48,000 of lease payments, against year-end cash of $${P27.cash.toLocaleString('en-US')}. The largest single inflow in sight is the law firm’s fee in March 2028, a month after the Coastline note falls due. The ratios said Lantern was illiquid; the notes say exactly when the pressure peaks and what would relieve it.` },
    { h: 'Writing the analysis' },
    { p: 'An analysis is finished when it reaches a conclusion that its reader can act on. A memo to a lender or an owner usually has five parts, and the order matters: the reader should meet the conclusion first.' },
    { ol: [
      '<b>Conclusion and recommendation</b>, in two or three sentences: what you advise and on what conditions.',
      '<b>The evidence</b>: the few ratios and trends that support it, each with its benchmark (prior year, peers, covenant).',
      '<b>What the numbers don’t show</b>: from the notes and the MD&A, the timing of cash, the estimates, the commitments.',
      '<b>Risks</b>: what would make the conclusion wrong, and how likely it is.',
      '<b>Conditions and follow-up</b>: covenants, information to be reported, when to review.',
    ] },
    { p: 'State your conventions (averages or closing balances, leases in or out of debt, which Z-score), round sensibly, and don’t list every ratio you computed. A memo that ends “the company has strengths and weaknesses” has not finished the job.' },
  ],

  formulas: [
    { id: 'bench-quartile-position', name: 'Position of a quartile in a sorted list (inclusive method)',
      tex: String.raw`\text{Position}_q = (n - 1) \times \dfrac{q}{4}`,
      where: [
        [String.raw`n`, 'Number of values (peers)', ''],
        [String.raw`q`, 'Which quartile: 1, 2 (the median) or 3', ''],
        [String.raw`\text{Position}_q`, 'Position in the sorted list counting the smallest value as 0; interpolate between neighbours when it is not a whole number', ''],
      ],
      assumptions: 'Excel’s QUARTILE.INC and PERCENTILE.INC use this rule; QUARTILE.EXC uses (n + 1) × q/4 counting from 1. With few peers the methods can differ, so state which you used.',
      note: 'Nine peers: Q1 at position 2 (the third value), the median at 4 (the fifth), Q3 at 6 (the seventh).' },
    { id: 'bench-lease-share', name: 'Operating lease liabilities to total assets',
      tex: String.raw`\text{Lease share} = \dfrac{\text{Operating lease liabilities}}{\text{Total assets}}`,
      where: [[String.raw`\text{Operating lease liabilities}`, 'Current and noncurrent operating lease liabilities at the balance-sheet date', '$'], [String.raw`\text{Total assets}`, 'Total assets at the same date', '$']],
      note: `A quick test of how far two companies’ balance sheets are shaped by leasing: Lantern ${p1(L.leaseShare)}%, Starbucks ${p1(SB.lease / SB.ta)}%.` },
  ],

  examples: [
    { level: 'simple', title: 'Where does Lantern sit among its peers?', fictional: true,
      setup: 'The current ratios of the nine coffee businesses in Coastline’s peer file are 0.94, 0.62, 1.30, 1.05, 0.78, 1.75, 0.85, 1.48 and 1.12. Lantern’s is 0.52. Find the median and the quartiles (inclusive method) and describe Lantern’s position.',
      steps: [
        'Sort: 0.62, 0.78, 0.85, 0.94, 1.05, 1.12, 1.30, 1.48, 1.75.',
        'Positions with <m>n = 9</m>: Q1 at <m>8 \\times 0.25 = 2</m>, the median at <m>8 \\times 0.5 = 4</m>, Q3 at <m>8 \\times 0.75 = 6</m>, counting from 0. So Q1 = 0.85, median = 1.05, Q3 = 1.30.',
        'Lantern’s 0.52 is below the lowest peer (0.62), so below Q1 and outside the peers’ range.',
      ],
      answer: 'Q1 0.85, median 1.05, Q3 1.30. Lantern (0.52) is below every peer.',
      interpretation: 'Café businesses do run low current ratios (half the peers are at 1.05 or below), so 0.52 is not shocking in kind. But it is lower than any peer, so Lantern’s liquidity is weak by its industry’s standards, not only by textbook ones.' },
    { level: 'challenging', title: 'What can a comparison with Starbucks tell Ana?', fictional: true,
      setup: 'Ana reads that Starbucks earned an operating margin of about 15% in fiscal 2024 and asks whether Lantern (5.7% in 2027) should aim for the same. Using the figures in the lesson, separate the differences that come from scale, business model and accounting, and say what a fair target would be.',
      steps: [
        `Margins: Starbucks <m>5{,}408.8 \\div 36{,}176.2 = ${p1(SB.opIncome / SB.revenue)}\\%</m>; Lantern <m>32{,}787 \\div 577{,}860 = ${p1(L.opMargin)}\\%</m>.`,
        `Business model: ${p1(SB.licensed / SB.revenue)}% of Starbucks’ revenue comes from 19,181 licensed stores that others run (mostly product and equipment sales to licensees, plus royalties and licence fees), which earns a margin without store wages or rent; Lantern runs every café itself. Company-operated stores carry store operating expenses of <m>15{,}286.5 \\div 36{,}176.2 = ${p1(SB.storeOps / SB.revenue)}\\%</m> of total revenue.`,
        'Scale: Starbucks buys and leases at a scale about 62,600 times Lantern’s revenue; its purchasing terms and fixed-cost spread are not available to a business with two cafés and a kitchen.',
        'Stage and accounting: Lantern’s 2027 includes the cafés’ opening advertising, $21,000 of market research and only ten months of the new cafés; its owner’s $48,000 salary is an operating expense. Both companies report under US GAAP, so the lease cost is treated alike.',
      ],
      answer: 'Starbucks’ 15% is not a fair target. The peer file is: its median operating margin is 6.8% and Q3 8.1%, so moving from 5.7% to the peer median is a realistic goal for 2028, the cafés’ first full year.',
      interpretation: 'Large companies show what the industry can earn at scale with a different model; peers show what a business like Lantern does earn. Use the first for context and the second for targets.' },
    { level: 'applied', title: 'Coastline’s memo on Lantern', fictional: true,
      setup: 'Lantern asks Coastline to renew its $30,000 line of credit, on which $24,000 is drawn. Using the analysis in this module (the ratios, the cash-flow quality, the Z″ score, the peer file and the notes), draft the conclusion and evidence sections of the loan officer’s memo.',
      steps: [
        'Conclusion first: renew the line at $30,000 for twelve months; do not increase it; condition the renewal on monthly management accounts and a cash forecast to June 2028, and on no dividends until the line is below $10,000.',
        `Evidence, with benchmarks: current ratio 0.52 (2.15 in 2026; peer median 1.05; lowest in the peer file); operating margin 5.7% (peer median 6.8%); CFO $8,341 against net income $22,431, because $30,840 of revenue is unbilled until 31 March 2028; Z″ 0.24 (distress; 2.27 without leases; peer median 2.4).`,
        `Notes: $${due2028.toLocaleString('en-US')} of debt and $48,000 of lease payments fall due in 2028 against $6,531 of cash; the Coastline note ($10,000) is due on 1 March, before the law firm pays.`,
        'Risks: the law firm pays late or disputes the fee; café sales fall short in their first full year. Mitigants: the law firm’s fee is contractual; interest coverage is 11.39 times; the cafés’ operating cash is better than their profit.',
      ],
      answer: 'Renew at the current limit with reporting conditions and a dividend restriction; refer any increase to the credit committee after the law firm’s payment and the 2028 half-year figures.',
      interpretation: 'The memo reaches a decision, says what it rests on and what would change it. Every number in it has a benchmark beside it, and the notes supply the timing that the ratios couldn’t.' },
  ],

  demo: [
    { widget: 'bench-ratios', intro: 'Lantern 2027 beside Harbourline (fictional, $ millions) and Starbucks (fiscal 2024, $ millions). Pick a ratio to see its working. Tick “Count operating lease liabilities as debt” and watch debt to equity move most for Lantern; look at return on equity and debt to equity for Starbucks, whose equity is negative.' },
    { widget: 'bench-sheet', intro: 'Coastline’s peer file. Type formulas into B12:D14 to find each measure’s median and quartiles (for example <x>=MEDIAN(B2:B10)</x> and <x>=QUARTILE.INC(B2:B10,1)</x>), then change a peer’s figure to see how little the median moves.' },
  ],

  mistakes: [
    { title: '“Starbucks is the obvious benchmark for a coffee business.”', html: 'It is the obvious context, not a benchmark. Its scale, its licensed stores and its negative equity make most of its ratios incomparable with Lantern’s. Benchmark against businesses with the same model and size, and use large companies to understand the industry.' },
    { title: '“Use the average of the peers.”', html: 'One unusual peer can drag an average a long way. The median and quartiles describe where a typical peer sits and how widely peers differ; say which quartile method you used, because spreadsheets offer more than one.' },
    { title: '“The ratios are the analysis; the notes are detail.”', html: 'The notes often change the conclusion. Lantern’s current ratio says it is illiquid; the lease, revenue and debt notes say when the pressure peaks (1 March 2028) and when it eases (31 March 2028).' },
    { title: '“A clean audit opinion means the company is healthy.”', html: 'An unqualified opinion says the statements are fairly presented, not that the business is sound. A fairly presented set of statements can show a business in distress; read the going-concern paragraph and the critical audit matters, then do the analysis.' },
    { title: '“Adjusted earnings are the company’s real profit.”', html: 'Non-GAAP measures are management’s choices. Start from the GAAP figures, read the reconciliation and check whether the adjustments recur year after year.' },
  ],

  application: [
    { p: '<b>A bank’s peer files.</b> Lenders that specialise in an industry build peer files from the statements their borrowers provide, as Coastline does for café businesses. Each borrower’s ratios are compared with the file’s quartiles every year, and a borrower that falls into the bottom quartile on several measures is reviewed. The file is the bank’s own data, which is why it is more useful than a general statistic, and why the bank keeps it confidential.' },
    { p: '<b>An investor reading a 10-K.</b> An analyst who owns shares in a coffee roaster reads its 10-K in a fixed order: Item 1 for the business model, Item 1A for new risk factors (comparing them with last year’s), the MD&A for management’s explanation of margins and liquidity, the auditor’s report and its critical audit matters, then the notes on revenue, leases, debt and commitments, and only then the ratios. Reading in this order means she knows what the numbers ought to show before she computes them.' },
    { p: '<b>An owner’s own benchmark.</b> Ana asks Coastline whether it can share the peer file’s quartiles, without the names. With them she sets her 2028 targets: an operating margin at the peer median, a current ratio above the peer Q1 by the end of 2028, and no new café until Lantern’s Z″ is back above the peer median. The same comparison that a lender uses to judge risk gives an owner a plan.' },
  ],

  summary: [
    'A ratio means something only against a benchmark: the company’s own trend, a target such as a covenant, or a peer group.',
    'Choose peers by business model, size and stage, ownership and accounting basis; use larger companies for context, not targets.',
    'Summarise peers by the median and quartiles, and say which quartile method you used (QUARTILE.INC places Q1 at (n − 1) × 0.25).',
    'Lantern 2027 is below every peer on the current ratio, between Q1 and the median on operating margin, and near the bottom on Z″; the peers’ own Z″ median (2.4) is in the grey zone.',
    'Separate scale, business model and accounting when comparing with a much larger company: Starbucks’ licensed stores, stored-value cards and negative equity make most of its ratios incomparable.',
    'In a 10-K read Items 1, 1A, 7 (MD&A), 7A, 8 (statements, notes and the auditor’s report) and 9A; treat non-GAAP measures with care.',
    'The notes on revenue, leases, debt, commitments and subsequent events supply the timing and the estimates that ratios can’t; a memo should start from a conclusion and support it with benchmarked evidence.',
  ],

  glossary: [
    { term: 'Benchmark', def: 'A standard against which a ratio or result is judged, such as the company’s own earlier years, a target or covenant, or the median of a peer group.' },
    { term: 'Peer group', def: 'The set of comparable businesses, chosen for a similar business model, size, ownership and accounting basis, whose figures provide a benchmark.' },
    { term: 'Form 10-K', def: 'The annual report a US public company files with the SEC, with a fixed structure of items including the business description, risk factors, management’s discussion and analysis, and the audited financial statements and notes.' },
    { term: 'Management’s discussion and analysis', def: 'The section of an annual report (Item 7 of Form 10-K) in which management explains the results, liquidity, capital resources, known trends and uncertainties, and critical accounting estimates. Often shortened to MD&amp;A.' },
    { term: 'Auditor’s report', def: 'The independent auditor’s opinion on whether the financial statements are presented fairly, in all material respects, under the applicable framework, with any going-concern paragraph and, for most public companies, critical audit matters.' },
  ],

  references: [
    { text: 'US Securities and Exchange Commission, Office of Investor Education and Advocacy (2011). <i>Investor Bulletin: How to Read a 10-K</i>.', url: 'https://www.sec.gov/files/reada10k.pdf', checked: '2026-10-26' },
    { text: 'US Securities and Exchange Commission (2007). <i>Beginners’ Guide to Financial Statements</i>.', url: 'https://www.sec.gov/about/reports-publications/investorpubsbegfinstmtguide', checked: '2026-10-26' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 6.1, “Ratios: Condensing Information into Smaller Pieces”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/6-1-ratios-condensing-information-into-smaller-pieces', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for the fiscal year ended 29 September 2024 (Item 1 store data; Item 6 “Reserved”). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/sbux-20240929.htm', checked: '2026-10-26' },
    { text: 'Starbucks Corporation (2024). Form 10-K for fiscal 2024: Consolidated Statements of Earnings (R3) and Consolidated Balance Sheets (R7). SEC EDGAR.', url: 'https://www.sec.gov/Archives/edgar/data/829224/000082922424000057/R7.htm', checked: '2026-10-26' },
  ],

  checks: [
    // Lantern headline
    { what: 'Lantern current ratio', value: L.current, shown: 0.52 },
    { what: 'Lantern operating margin %', value: L.opMargin * 100, shown: 5.7, tol: 0.05 },
    { what: 'Lantern Z″', value: L.z, shown: 0.24 },
    { what: 'Lantern 2026 current ratio', value: R.liquidity(P26).current, shown: 2.15 },
    { what: 'Lantern interest coverage', value: L.cover, shown: 11.39 },
    { what: 'Lantern lease share %', value: L.leaseShare * 100, shown: 52.9, tol: 0.05 },
    { what: 'Lantern equity', value: P27.equity, shown: 62818 },
    { what: 'Lantern revenue', value: P27.revenue, shown: 577860 },
    { what: 'Lantern EBIT', value: P27.ebit, shown: 32787 },
    { what: 'Lantern CFO', value: P27.cfo, shown: 8341 },
    { what: 'Lantern NI', value: P27.netIncome, shown: 22431 },
    { what: 'Lantern contract asset', value: P27.contractAsset, shown: 30840 },
    { what: 'Lantern Z″ without leases', value: R.altman({ ...P27, totalAssets: P27.totalAssets - P27.rightOfUse, currentLiabilities: P27.currentLiabilities - LEASE.current2027, totalLiabilities: P27.totalLiabilities - P27.leaseLiabilities }, 'zdouble').score, shown: 2.27 },
    { what: 'Ana salary', value: FACTS.wages.ana, shown: 48000 },
    { what: 'Line limit', value: FACTS.lineOfCredit.limit, shown: 30000 },
    { what: 'Line drawn', value: DEBT.line, shown: 24000 },
    // peers
    { what: 'Peers: Q1 current', value: SC[0], shown: 0.85 },
    { what: 'Peers: median current', value: SC[1], shown: 1.05 },
    { what: 'Peers: Q3 current', value: SC[2], shown: 1.30 },
    { what: 'Peers: lowest current', value: Math.min(...PEERS.current), shown: 0.62 },
    { what: 'Peers below Lantern current', value: below(PEERS.current, L.current), shown: 0 },
    { what: 'Peers: Q1 margin', value: SM[0], shown: 5.2 },
    { what: 'Peers: median margin', value: SM[1], shown: 6.8 },
    { what: 'Peers: Q3 margin', value: SM[2], shown: 8.1 },
    { what: 'Peers below Lantern margin', value: below(PEERS.opMargin, L.opMargin * 100), shown: 3 },
    { what: 'Peers: Q1 Z″', value: SZ[0], shown: 1.2 },
    { what: 'Peers: median Z″', value: SZ[1], shown: 2.4 },
    { what: 'Peers: Q3 Z″', value: SZ[2], shown: 3.8 },
    { what: 'Peers below Lantern Z″', value: below(PEERS.z, L.z), shown: 1 },
    { what: 'Peer count', value: PEERS.names.length, shown: 9 },
    { what: 'Q1 position for nine', value: (9 - 1) * 0.25, shown: 2 },
    { what: 'Median position', value: (9 - 1) * 0.5, shown: 4 },
    { what: 'Q3 position', value: (9 - 1) * 0.75, shown: 6 },
    // Starbucks
    { what: 'SB revenue', value: SB.revenue, shown: 36176.2 },
    { what: 'SB operating income', value: SB.opIncome, shown: 5408.8 },
    { what: 'SB operating margin', value: SB.opIncome / SB.revenue * 100, shown: 15.0, tol: 0.05 },
    { what: 'SB current ratio', value: SB.ca / SB.cl, shown: 0.75 },
    { what: 'SB lease share', value: SB.lease / SB.ta * 100, shown: 32.7, tol: 0.05 },
    { what: 'SB equity', value: SB.equity, shown: -7441.6 },
    { what: 'Revenue multiple', value: SB.revenue * 1e6 / P27.revenue, shown: 62600, tol: 50 },
    { what: 'SB stores', value: SB.storesCo + SB.storesLic, shown: 40199 },
    { what: 'SB licensed stores', value: SB.storesLic, shown: 19181 },
    { what: 'SB licence share %', value: SB.licensed / SB.revenue * 100, shown: 12.5, tol: 0.05 },
    { what: 'SB stored value', value: SB.deferred, shown: 1781.2 },
    { what: 'SB store opex', value: SB.storeOps, shown: 15286.5 },
    { what: 'SB store opex %', value: SB.storeOps / SB.revenue * 100, shown: 42.3, tol: 0.05 },
    // lease note
    { what: 'Lease 2028', value: leaseYears[0][1], shown: 48000 },
    { what: 'Lease 2032', value: leaseYears[4][1], shown: 8000 },
    { what: 'Lease undiscounted', value: leaseUndiscounted, shown: 200000 },
    { what: 'Lease interest', value: leaseInterest, shown: 26621 },
    { what: 'Lease liabilities', value: LEASE.end2027, shown: 173379 },
    { what: 'Lease current', value: LEASE.current2027, shown: 37010 },
    { what: 'Lease noncurrent', value: LEASE.noncurrent2027, shown: 136369 },
    { what: 'Payments remaining', value: LEASE.rows.length - FACTS.cafes.months, shown: 50 },
    { what: 'Payment', value: pay, shown: 4000 },
    { what: 'Lease rate', value: LEASE.rate * 100, shown: 7.2 },
    // revenue and debt notes
    { what: 'First-year fee', value: fee1, shown: 41120 },
    { what: 'Inflation %', value: law.expectedInflation * 100, shown: 2.8 },
    { what: 'Coastline note', value: DEBT.coastline, shown: 10000 },
    { what: 'Van 2028', value: DEBT.van2028, shown: 5000 },
    { what: 'Brewer 2028', value: DEBT.brewer2028, shown: 12091 },
    { what: 'Brewer 2029', value: DEBT.brewer2029, shown: 4159 },
    { what: 'Due 2028', value: due2028, shown: 51091 },
    { what: 'Due 2029', value: DEBT.van2029 + DEBT.brewer2029, shown: 9159 },
    { what: 'Total debt', value: P27.debt, shown: 65250 },
    { what: 'Debt ties', value: due2028 + DEBT.van2029 + DEBT.brewer2029 + DEBT.van2030, shown: 65250 },
    { what: 'Cash at year end', value: P27.cash, shown: 6531 },
    { what: 'Market research 2027', value: FACTS.research, shown: 21000 },
    { what: 'Memo: dividend threshold', value: 10000, shown: 10000 },
  ],
};
