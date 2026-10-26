// cash-flow-and-earnings-quality.ex.js — F03 · Cash flow and earnings quality: widgets, practice and the knowledge
// check. Answer keys live here. Lantern’s figures come from case.js; every other business is fictional.
import { PERIODS, COMPARATIVE, FACTS, LEASE } from './case.js?v=19';
import * as R from '../../../core/ratios.js?v=19';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const contract = P27.contractAsset;
const taxOnContract = contract * FACTS.tax.rate;
// the lower tax first clears income taxes payable; the rest becomes a tax receivable (a current asset)
const taxPayable = COMPARATIVE.balance.find((r) => r[0] === 'Income Taxes Payable')[2];   // 2,977 at 31 December 2027
const taxReceivable = taxOnContract - taxPayable;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const ind = Object.fromEntries(COMPARATIVE.indirect2027);
const wcAbsorbed = -COMPARATIVE.indirect2027.slice(2, -1).reduce((s, r) => s + r[1], 0);   // 33,890

export const widgets = {
  'cfq-ratios': {
    type: 'ratios',
    title: 'Lantern’s cash-flow quality, 2026 and 2027',
    periods: [{ label: '2026 (10 months)', data: P26 }, { label: '2027', data: P27 }],
    groups: ['cash'],
    toggles: ['average'],
    adjust: [{
      id: 'no-contract', period: 1,
      label: '2027 without the law firm’s unbilled revenue ($30,840) and the tax on it',
      delta: { revenue: -contract, grossProfit: -contract, operatingIncome: -contract, ebit: -contract, pretax: -contract,
        tax: -taxOnContract, netIncome: -(contract - taxOnContract), contractAsset: -contract, currentAssets: -contract + taxReceivable, totalAssets: -contract + taxReceivable,
        currentLiabilities: -taxPayable, totalLiabilities: -taxPayable, equity: -(contract - taxOnContract), retainedEarnings: -(contract - taxOnContract) },
    }],
    select: 'cfoToNetIncome',
    note: 'Fictional figures. 2026 has no opening balance sheet, so its ratios use closing total assets; 2027’s use the average of the two year ends while “Use average balances” is ticked. Removing the contract asset leaves operating cash and free cash flow unchanged: the revenue was never cash. With it removed, net income is negative and CFO ÷ net income shows n/m (not meaningful): compare the dollar amounts instead. The lower tax first clears the $2,977 of income taxes payable; the rest is shown as a tax receivable.',
  },
  'cfq-explorer': {
    type: 'formula',
    title: 'Profit, operating cash and free cash flow',
    intro: 'Starting values: Lantern’s 2027 (average total assets rounded to the dollar). Working capital absorbed is the total of the working-capital lines in the indirect method, entered as a positive number when it reduces cash.',
    inputs: [
      { id: 'ni', label: 'Net income', min: -20000, max: 60000, step: 1, value: P27.netIncome, fmt: 'money' },
      { id: 'da', label: 'Depreciation and amortisation', min: 0, max: 40000, step: 100, value: P27.da, fmt: 'money' },
      { id: 'wc', label: 'Working capital absorbed (a release is negative)', min: -20000, max: 60000, step: 1, value: wcAbsorbed, fmt: 'money' },
      { id: 'capex', label: 'Capital expenditure', min: 0, max: 100000, step: 500, value: P27.capex, fmt: 'money' },
      { id: 'ta', label: 'Average total assets', min: 50000, max: 400000, step: 1, value: Math.round((P26.totalAssets + P27.totalAssets) / 2), fmt: 'money' },
    ],
    compute: (v) => {
      const cfo = v.ni + v.da - v.wc;
      const fcf = cfo - v.capex;
      const accruals = v.ni - cfo;
      const ratio = Math.abs(v.ni) < 1000 ? null : cfo / v.ni;
      const note = v.ni <= 0
        ? `Net income is ${v.ni < 0 ? 'negative' : 'zero'}, so CFO ÷ net income tells you nothing: compare the amounts instead. Operations ${cfo >= 0 ? `produced ${money(cfo)}` : `used ${money(-cfo)}`}.`
        : `Each dollar of profit brought in ${ratio === null ? 'an unstable amount of' : `$${ratio.toFixed(2)} of`} operating cash. Accruals are ${money(accruals)} (${(accruals / v.ta * 100).toFixed(1)}% of average assets): ${accruals > 0 ? 'profit is ahead of cash' : 'cash is ahead of profit'}. ${fcf < 0 ? `Investment exceeds operating cash by ${money(-fcf)}, which must come from cash reserves or financing.` : `After investment, ${money(fcf)} is free for lenders and owners.`}`;
      return {
        headline: { label: 'Free cash flow', value: money(fcf) },
        rows: [
          ['Cash from operations (NI + D&A − working capital absorbed)', money(cfo)],
          ['CFO ÷ net income', ratio === null ? 'not meaningful' : ratio.toFixed(2)],
          ['Total accruals (NI − CFO)', money(accruals)],
          ['Accruals ratio', `${(accruals / v.ta * 100).toFixed(1)}%`],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Measure', values: ['Net income', 'Cash from operations', 'Capital expenditure', 'Free cash flow'] },
          series: [{ name: 'Dollars', values: [v.ni, cfo, -v.capex, fcf] }], y: { label: 'Dollars' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f03-cfq-g1', type: 'steps', kind: 'numerical',
    prompt: 'Work out Lantern’s cash-flow quality measures for 2026, its first ten months: net income $27,387; net cash from operating activities $39,940; purchases of equipment and the van $22,000; total assets at 31 December 2026 $93,676 (there is no opening balance sheet).',
    steps: [
      { id: 'f03-cfq-g1a', type: 'num', kind: 'numerical', prompt: 'CFO ÷ net income, to two decimal places.',
        answer: 1.46, check: () => P26.cfo / P26.netIncome, tol: 0.005, unit: '', places: 2,
        hints: ['Divide operating cash by net income.', '39,940 ÷ 27,387.'],
        wrong: [{ value: 0.69, say: 'That is net income ÷ CFO, upside down. The measure is CFO ÷ net income.' }],
        solution: '39,940 ÷ 27,387 = 1.458, or 1.46.' },
      { id: 'f03-cfq-g1b', type: 'num', kind: 'numerical', prompt: 'The accruals ratio, as a percentage to one decimal place (enter a negative number if accruals are negative).',
        answer: -13.4, check: () => (P26.netIncome - P26.cfo) / P26.totalAssets * 100, tol: 0.05, unit: '%', places: 1,
        hints: ['Accruals are net income minus CFO.', 'Divide −12,553 by closing total assets, because 2026 has no opening balance sheet.'],
        wrong: [{ value: 13.4, say: 'Check the sign: net income minus CFO is negative here, because cash ran ahead of profit.' }],
        solution: 'Accruals = 27,387 − 39,940 = −12,553. Accruals ratio = −12,553 ÷ 93,676 = −13.4%.' },
      { id: 'f03-cfq-g1c', type: 'num', kind: 'numerical', prompt: 'Free cash flow, in dollars.',
        answer: 17940, check: () => P26.cfo - P26.capex, tol: 0.5, unit: '$', places: 0,
        hints: ['Free cash flow is CFO minus capital expenditure.', '39,940 − 22,000.'],
        wrong: [{ value: 5387, say: 'Free cash flow starts from operating cash, not net income: 39,940 − 22,000.' }],
        solution: '39,940 − 22,000 = $17,940.' },
    ],
    solution: 'CFO ÷ NI 1.46; accruals ratio −13.4% on closing total assets; free cash flow $17,940. In its first ten months Lantern’s operations produced more cash than profit, mainly because of depreciation and the amounts it owed to suppliers, staff and the tax authority at the year end.',
  },
  {
    id: 'f03-cfq-g2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s 2027 net income was $22,431 and its net cash from operating activities $8,341. Total assets were $93,676 at the start of the year and $327,883 at the end. What was the 2027 accruals ratio? Enter a percentage to one decimal place.',
    answer: 6.7, check: () => (P27.netIncome - P27.cfo) / ((P26.totalAssets + P27.totalAssets) / 2) * 100, tol: 0.05, unit: '%', places: 1,
    hints: ['Accruals are net income minus CFO: 14,090.', 'Divide by the average of opening and closing total assets, 210,779.5.'],
    wrong: [
      { value: 4.3, say: 'You divided by closing total assets. The course uses the average of opening and closing whenever both exist.' },
      { value: -6.7, say: 'Net income minus CFO is positive in 2027: profit ran ahead of cash.' },
      { value: 15.0, say: 'You divided by opening total assets. Use the average of the two year ends.' },
    ],
    solution: 'Accruals = 22,431 − 8,341 = 14,090. Average total assets = (93,676 + 327,883) ÷ 2 = 210,779.5. Accruals ratio = 14,090 ÷ 210,779.5 = 6.7%.',
  },
  {
    id: 'f03-cfq-g3', type: 'mc', kind: 'conceptual',
    prompt: 'In Lantern’s 2027 reconciliation of net income ($22,431) to operating cash ($8,341), which single line does most to explain why operating cash is so much lower than profit?',
    options: [
      'The increase of $30,840 in the contract asset for the law firm’s catering',
      'Depreciation of $19,800 charged in 2027 on the cafés’ fit-out, machines, brewer and van',
      'The increase of $3,902 in catering receivables, net of the allowance',
      'The $40,000 of lease payments for the Harbourside and Millbrook cafés',
    ],
    answer: 0,
    hints: ['Look for the largest negative line in the reconciliation.', 'Which revenue has been recognised but cannot yet be billed?'],
    feedback: {
      1: 'Depreciation is added back: it makes operating cash higher than profit, not lower.',
      2: 'It is a reduction, but a small one beside the $30,840 contract asset.',
      3: 'The lease payments are matched by an equal straight-line lease cost of $40,000 in net income, so they don’t open a gap between profit and cash.',
    },
    solution: 'The contract asset rose by $30,840: revenue earned on the law firm’s events but not billable until 31 March 2028. It is subtracted in full, and it is larger than the whole of net income.',
  },
  {
    id: 'f03-cfq-g4', type: 'num', kind: 'applied',
    prompt: 'Lantern reports under US GAAP, so its $40,000 of café lease payments in 2027 are operating cash outflows. $11,124 of that is the interest on the lease liability. An analyst wants to compare Lantern with a café group that reports under IFRS for 2027, applying IFRS 16 and IAS 7 as amended by IFRS 18; lending and investing are not its main business. What would Lantern’s 2027 net cash from operating activities be on that IFRS basis? Its US GAAP figure is $8,341.',
    answer: 48341, check: () => P27.cfo + LEASE.paid2027, tol: 0.5, unit: '$', places: 0,
    hints: ['Under IFRS 16 the principal part of each lease payment is a financing outflow. Where does IFRS 18 put interest paid?', 'Principal 28,876 and interest 11,124 both leave operating activities: add 40,000 back.'],
    wrong: [
      { value: 37217, say: 'That moves only the principal. Keeping interest paid in operating activities was IAS 7’s option before IFRS 18; from 2027 a company like this must classify it as financing.' },
      { value: -31659, say: 'Moving an outflow out of operating activities raises operating cash; add the payments back.' },
      { value: 19465, say: 'That adds back only the interest. The principal, $28,876, is a financing outflow under IFRS 16 as well.' },
    ],
    solution: 'Under IFRS 16 the principal portion (40,000 − 11,124 = 28,876) is financing; under IAS 7 as amended by IFRS 18 the interest portion (11,124) is financing too, for a company whose main business is not lending or investing. IFRS-basis operating cash = 8,341 + 40,000 = $48,341. Free cash flow would rise by the same amount, to −$5,659, with nothing about the cafés changed.',
  },
];

export const independent = [
  {
    id: 'f03-cfq-i1', type: 'num', kind: 'numerical',
    prompt: 'Marlow Print Studio, a fictional business, reports net cash from operating activities of $186,000 for 2027. In investing activities it shows purchases of equipment of $142,000 and proceeds of $12,000 from selling an old press. Using the course definition (CFO − capital expenditure), what is its free cash flow?',
    answer: 44000, check: () => 186000 - 142000, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 56000, say: 'You netted the sale proceeds against capital expenditure. Some companies define free cash flow that way, but the course definition subtracts capital expenditure only; state the definition if you use another.' },
      { value: 328000, say: 'Capital expenditure is subtracted from operating cash, not added.' },
    ],
    solution: 'Free cash flow = 186,000 − 142,000 = $44,000. The $12,000 of proceeds is an investing inflow but not part of this definition.',
  },
  {
    id: 'f03-cfq-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional furniture maker reports net income of $0.9 million and cash from operations of $0.4 million. Its total assets were $6.0 million at the start of the year and $7.0 million at the end. What is its accruals ratio? Enter a percentage to one decimal place.',
    answer: 7.7, check: () => (0.9 - 0.4) / ((6.0 + 7.0) / 2) * 100, tol: 0.05, unit: '%', places: 1,
    wrong: [
      { value: 7.1, say: 'You divided by closing total assets; use the average of opening and closing.' },
      { value: 8.3, say: 'You divided by opening total assets; use the average.' },
      { value: -7.7, say: 'Accruals are net income minus CFO, which is positive here.' },
    ],
    solution: 'Accruals = 0.9 − 0.4 = $0.5 million. Average total assets = (6.0 + 7.0) ÷ 2 = 6.5. Accruals ratio = 0.5 ÷ 6.5 = 7.7%.',
  },
  {
    id: 'f03-cfq-i3', type: 'classify', kind: 'conceptual',
    prompt: 'For each event at a fictional wholesaler, say what it changes in the current year: net income only, operating cash flow only, or both. Ignore income tax.',
    items: [
      'Lengthening the useful life of its delivery vans from five years to eight',
      'Persuading customers to pay in 30 days instead of 60',
      'Selling goods for cash at a profit',
      'Paying suppliers in 60 days instead of 30',
      'Recognising a gain on selling a warehouse for cash',
      'Lowering the estimated bad-debt rate on receivables',
    ],
    categories: ['Net income only', 'Operating cash flow only', 'Both'],
    answer: [0, 1, 2, 1, 0, 0],
    feedback: {
      0: 'Lower depreciation raises net income; no cash moves.',
      1: 'Collecting sooner turns receivables into cash; the revenue was already recognised.',
      2: 'The sale is revenue (and a cost of sales) and its cash is operating.',
      3: 'Holding cash longer raises operating cash this year; the expense is unchanged.',
      4: 'The gain is in net income, but the sale’s cash is an investing inflow, not operating.',
      5: 'A lower bad-debt expense raises net income; collections don’t change.',
    },
    solution: 'Estimates (useful lives, bad-debt rates) and gains change net income only. Timing of collections and payments changes operating cash only. A cash sale changes both. This is why comparing profit with operating cash exposes estimates and one-off gains.',
  },
  {
    id: 'f03-cfq-i4', type: 'multi', kind: 'applied',
    prompt: 'A fictional software reseller’s annual report shows the following. Select all that apply: which are red flags for earnings quality?',
    options: [
      'Revenue rose 12% while receivables rose 48%',
      'It started capitalising advertising costs that it used to expense',
      'Operating cash has exceeded net income in each of the last three years',
      'Operating income includes a $2 million gain on selling its head office',
      'Its capital expenditure is about equal to its depreciation',
      'It paid a special dividend funded by a new bank loan in a year of negative free cash flow',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'Operating cash above profit is reassuring, not a warning.',
      4: 'Capex close to depreciation suggests the business is maintaining its assets: no flag.',
    },
    solution: 'Flags: receivables growing four times as fast as revenue; a change in policy that moves costs to later years; a one-off gain inside operating income; a payout financed by debt while free cash flow is negative. Operating cash above profit and capex near depreciation are healthy signs.',
  },
  {
    id: 'f03-cfq-i5', type: 'num', kind: 'numerical',
    prompt: 'Lantern estimated 2.8% inflation for the law firm’s first contract year (a $40,000 base fee, raised by the CPI) and recognised nine months of the fee in 2027. Had it estimated 3.5% instead, how much 2027 revenue would it have recognised on the contract? Enter whole dollars.',
    answer: 31050, check: () => FACTS.lawFirm.baseFee * 1.035 * FACTS.lawFirm.months2027 / 12, tol: 0.5, unit: '$', places: 0,
    wrong: [
      { value: 41400, say: 'That is the whole first-year fee. Only April–December, nine months of it, belongs to 2027.' },
      { value: 30840, say: 'That is the amount at 2.8%. Recompute with 3.5%.' },
    ],
    solution: '40,000 × 1.035 = 41,400 for the first contract year; nine months of it is 41,400 × 9 ÷ 12 = $31,050, $210 more than the $30,840 recognised. Operating cash is unchanged.',
  },
  {
    id: 'f03-cfq-i6', type: 'mc', kind: 'conceptual',
    prompt: 'In 2014 Amazon reported a net loss of $241 million but net cash from operating activities of $6,842 million. Which explanation fits its 10-K?',
    options: [
      'Large noncash charges (depreciation, amortisation and stock-based compensation), and payables growing faster than inventories and receivables',
      'A one-off gain on selling warehouses and data centres, which was included in full in net cash from operating activities that year',
      'Operating lease payments that were classified as financing activities under IFRS 16',
      'A restatement that moved losses from earlier years into 2014',
    ],
    answer: 0,
    feedback: {
      1: 'Gains on asset sales are subtracted in the operating section; their cash is investing.',
      2: 'Amazon reports under US GAAP, and IFRS 16 did not exist in 2014.',
      3: 'Nothing in the filing points to a restatement; the gap is noncash charges and working capital.',
    },
    solution: 'Of the $7,083 million gap, depreciation and amortisation ($4,746 million) and stock-based compensation ($1,497 million) reduced profit without using cash, and working capital released $974 million because payables grew faster than inventories plus receivables.',
  },
];

export const check = [
  {
    id: 'f03-cfq-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A company’s cash from operations divided by its net income is 0.4 for the third year running, and it is not growing quickly. What is the best reading?',
    options: [
      'Profit keeps running ahead of cash: find what is absorbing it',
      'The company is very profitable, because it needs little cash to earn its profit',
      'Its free cash flow must have been negative in each of the three years, because operating cash is below profit',
      'Its depreciation must be unusually high for its industry',
    ],
    answer: 0,
    feedback: {
      1: 'A low ratio means the profit is not arriving as cash; it says nothing good about profitability.',
      2: 'Free cash flow also depends on capital expenditure, which this ratio doesn’t include.',
      3: 'High depreciation would push the ratio up, not down: it is added back.',
    },
    solution: 'A ratio persistently well below 1 without a growth story means accruals are building up year after year: read the reconciliation and the notes to find where.',
  },
  {
    id: 'f03-cfq-k2', type: 'num', kind: 'numerical',
    prompt: 'Lantern’s 2027 free cash flow was −$45,659 on revenue of $577,860. What was its free cash flow margin? Enter a percentage to one decimal place (negative if negative).',
    answer: -7.9, check: () => R.cashQuality(P27, P26).fcfMargin * 100, tol: 0.05, unit: '%', places: 1,
    wrong: [
      { value: 7.9, say: 'Free cash flow is negative, so the margin is negative too.' },
      { value: 1.4, say: 'That is CFO ÷ revenue. Free cash flow subtracts capital expenditure first.' },
    ],
    solution: 'FCF margin = −45,659 ÷ 577,860 = −7.9%.',
  },
  {
    id: 'f03-cfq-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional regional bus company spent $3.1 million on new buses in each of the last three years. Its depreciation is $7.4 million a year. What is its capital expenditure to depreciation ratio? Enter two decimal places.',
    answer: 0.42, check: () => 3.1 / 7.4, tol: 0.005, unit: '', places: 2,
    wrong: [{ value: 2.39, say: 'That is depreciation ÷ capex, upside down.' }],
    solution: '3.1 ÷ 7.4 = 0.42. Spending well under depreciation for years suggests the fleet is ageing, which flatters free cash flow until the buses must be replaced.',
  },
  {
    id: 'f03-cfq-k4', type: 'mc', kind: 'conceptual',
    prompt: 'According to Enron’s Form 8-K of 8 November 2001, what was the main reason for restating its 1997–2000 net income and debt?',
    options: [
      'Entities it had treated as unconsolidated (Chewco, JEDI and an LJM1 subsidiary) should have been consolidated',
      'It had used the wrong depreciation method for its pipelines and power plants, overstating profit in every year from 1997 onwards',
      'Its auditor had found that revenue from energy trading was overstated by a fixed percentage',
      'It had classified operating leases as finance leases',
    ],
    answer: 0,
    feedback: {
      1: 'The 8-K says nothing about depreciation methods.',
      2: 'The 8-K’s restatement is about consolidation of off-balance-sheet entities, not a percentage adjustment to trading revenue.',
      3: 'Lease classification is not what the 8-K restated.',
    },
    solution: 'Chewco did not meet the criteria for an unconsolidated special-purpose entity, so JEDI did not either, and an LJM1 subsidiary was inadequately capitalised. The restatement (mainly that consolidation, plus earlier proposed audit adjustments) cut net income by $96–$250 million a year, and consolidating JEDI and Chewco added $561–$711 million of debt.',
  },
  {
    id: 'f03-cfq-k5', type: 'mc', kind: 'applied',
    prompt: 'Coastline’s analyst sees that without the $30,840 law-firm contract asset Lantern would have made a small 2027 loss. Lantern asks to increase its line of credit. What should the analyst do first?',
    options: [
      'Check the law firm’s creditworthiness and payment terms, and ask for a cash forecast to after 31 March 2028',
      'Refuse at once, because revenue that is not yet billed should not have been recognised',
      'Approve at once, because net income was positive, the contract asset is a current asset and the current ratio will improve when it is billed',
      'Ask Lantern to restate 2027 using a lower inflation estimate',
    ],
    answer: 0,
    feedback: {
      1: 'The revenue is properly recognised under ASC 606: Lantern has performed the service. The question is when and whether the cash arrives.',
      2: 'A positive profit that depends on one unbilled amount is exactly what needs checking before lending more.',
      3: 'Each point of inflation moves 2027 revenue by only about $300; the estimate is not the issue.',
    },
    solution: 'The quality issue is timing and concentration: one client’s payment, due 31 March 2028, carries the year’s profit. Confirm the client can and will pay, and see whether Lantern’s cash covers the months until then (including the $10,000 note due on 1 March 2028).',
  },
  {
    id: 'f03-cfq-k6', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the sentences.',
    text: 'Free cash flow is cash from operations minus [[0]]. Total accruals are net income minus [[1]]. A large positive accruals ratio means profit is running [[2]] cash.',
    blanks: [
      { options: ['capital expenditure', 'dividends paid', 'depreciation'], answer: 0 },
      { options: ['capital expenditure', 'cash from operations', 'depreciation'], answer: 1 },
      { options: ['behind', 'in line with', 'ahead of'], answer: 2 },
    ],
    solution: 'FCF = CFO − capital expenditure (the course definition). Accruals = NI − CFO. A positive accruals ratio means profit is ahead of cash.',
  },
];
