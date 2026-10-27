// solvency-and-leverage.ex.js — F03 · Solvency and leverage: widgets, practice and the knowledge check.
// Lantern’s figures come from case.js and the ratios from core/ratios.js; Starbucks FY2024 is from its Form 10-K;
// Harbourline is F00’s fictional roaster; every other business is fictional and invented for the exercise.
import { PERIODS } from './case.js?v=22';
import { HARBOURLINE as HB, HARBOURLINE_DETAIL as HBD } from '../f00/case.js?v=22';
import * as R from '../../../core/ratios.js?v=22';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const x2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : 'not meaningful');
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

export const widgets = {
  'solv-ratios': {
    type: 'ratios',
    title: 'Solvency and leverage: Lantern, Starbucks and Harbourline',
    periods: [{ label: '2026 (10 months)', data: P26 }, { label: '2027', data: P27 }],
    peers: [
      { label: 'Starbucks FY2024 ($m)', data: { months: 12, totalAssets: 31339.3, totalLiabilities: 38780.9, equity: -7441.6, debt: 15568.4, cash: 3286.2, shortTermInvestments: 257.0, ebit: 5408.8, da: 1592.4, interestExpense: 562.0 },
        note: 'Debt is long-term debt and its current portion; net debt subtracts cash and short-term investments. Its lease liabilities (10,234.7) are left out because the lease cost needed to adjust its earnings is not in our verified figures, so the lease box doesn’t change it.' },
      { label: 'Harbourline ($m, fictional)', data: { months: 12, totalAssets: HBD.totalAssets, totalLiabilities: HBD.totalAssets - HBD.bookEquity, equity: HBD.bookEquity, debt: HB.debt, leaseLiabilities: 0, cash: HB.cash, ebit: HB.ebit, da: HB.da, interestExpense: HBD.interest } },
    ],
    ratios: ['debtRatio', 'liabilitiesToEquity', 'debtToEquity', 'debtToCapital', 'equityMultiplier', 'interestCoverage', 'netDebtToEbitda'],
    toggles: ['leases', 'annualise'],
    select: 'debtToEquity',
    note: 'Counting operating lease liabilities as debt also treats the lease cost as financing: its interest part ($11,124 for Lantern in 2027) moves below EBIT into interest expense, and the whole lease cost is added back to EBITDA, so debt and earnings stay on one basis. Annualising matters only for 2026’s net debt ÷ EBITDA; coverage divides two flows of the same period.',
  },
  'solv-equity': {
    type: 'formula',
    title: 'Leverage ratios as equity shrinks',
    intro: 'Starting values: Lantern at 31 December 2027. Equity is whatever is left: total assets minus all three kinds of liability.',
    inputs: [
      { id: 'ta', label: 'Total assets', min: 50000, max: 600000, step: 1, value: P27.totalAssets, fmt: 'money' },
      { id: 'debt', label: 'Interest-bearing debt', min: 0, max: 300000, step: 1, value: P27.debt, fmt: 'money' },
      { id: 'lease', label: 'Lease liabilities', min: 0, max: 300000, step: 1, value: P27.leaseLiabilities, fmt: 'money' },
      { id: 'other', label: 'Operating liabilities (payables, accruals, unearned revenue)', min: 0, max: 100000, step: 1, value: P27.totalLiabilities - P27.debt - P27.leaseLiabilities, fmt: 'money' },
    ],
    compute: (v) => {
      const tl = v.debt + v.lease + v.other, eq = v.ta - tl;
      const ok = eq > 0;
      const s = R.solvency({ totalAssets: v.ta, totalLiabilities: tl, equity: eq, debt: v.debt, leaseLiabilities: v.lease });
      const sl = R.solvency({ totalAssets: v.ta, totalLiabilities: tl, equity: eq, debt: v.debt, leaseLiabilities: v.lease }, { withLeases: true });
      const show = (r) => (ok && Number.isFinite(r) ? x2(r) : 'not meaningful');
      return {
        headline: { label: 'Equity', value: money(eq) },
        rows: [
          ['Debt ratio (liabilities ÷ assets)', pct(s.debtRatio)],
          ['Liabilities ÷ equity', show(s.liabilitiesToEquity)],
          ['Debt ÷ equity', show(s.debtToEquity)],
          ['Debt and leases ÷ equity', show(sl.debtToEquity)],
          ['Equity multiplier', show(s.equityMultiplier)],
        ],
        note: ok
          ? `Each dollar of equity supports ${x2(v.ta / eq)} dollars of assets. ${eq < 0.1 * v.ta ? 'Equity is thin: small changes in it now swing every ratio that divides by it.' : 'The debt ratio and the equity multiplier tell the same story: equity multiplier = 1 ÷ (1 − debt ratio).'}`
          : 'Equity is zero or negative (a shareholders’ deficit). Every ratio that divides by equity has stopped meaning anything; the debt ratio, above 100%, still says that liabilities exceed assets.',
        chart: { kind: 'bar', x: { label: 'Financing of the assets', values: ['Debt', 'Leases', 'Operating liabilities', 'Equity'] }, series: [{ name: 'Dollars', values: [v.debt, v.lease, v.other, eq] }], y: { label: 'Dollars' } },
      };
    },
  },
};

const DEBT_CATS = ['Interest-bearing debt', 'Debt only as a stated lease adjustment', 'Operating liability, not debt'];

export const guided = [
  {
    id: 'f03-solv-g1', type: 'steps', kind: 'numerical',
    prompt: 'Larkspur Bakeries, a fictional chain of six bakeries, reports at 31 December 2027: total assets $800,000; total liabilities $500,000, of which bank loans and an overdraft are $300,000 and the rest is payables, accruals and deposits; equity $300,000. Calculate its leverage ratios.',
    solution: 'Debt ratio = 500,000 ÷ 800,000 = 62.5%. Debt to equity = 300,000 ÷ 300,000 = 1.00. Equity multiplier = 800,000 ÷ 300,000 = 2.67, which equals 1 + 500,000 ÷ 300,000.',
    steps: [
      { id: 'f03-solv-g1-s1', type: 'num', prompt: 'What is the debt ratio (total liabilities ÷ total assets), as a percentage?',
        answer: 62.5, check: () => 500000 / 800000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['Use all liabilities, not just the loans.', '500,000 ÷ 800,000.'],
        wrong: [{ value: 37.5, say: 'That is the loans alone over total assets. The debt ratio uses total liabilities.' }] },
      { id: 'f03-solv-g1-s2', type: 'num', prompt: 'What is debt to equity, using interest-bearing debt?',
        answer: 1, check: () => 300000 / 300000, unit: '', places: 2, tol: 0.005,
        hints: ['Interest-bearing debt is the bank loans and the overdraft.'],
        wrong: [{ value: 1.67, say: 'That is total liabilities to equity. Debt to equity in this course uses interest-bearing debt.' }] },
      { id: 'f03-solv-g1-s3', type: 'num', prompt: 'What is the equity multiplier?',
        answer: 2.67, check: () => 800000 / 300000, unit: '', places: 2, tol: 0.005,
        hints: ['Total assets ÷ equity.', 'Check: 1 + total liabilities ÷ equity.'],
        wrong: [{ value: 1.6, say: 'That is total assets ÷ total liabilities. The equity multiplier divides by equity.' }] },
    ],
  },
  {
    id: 'f03-solv-g2', type: 'num', kind: 'numerical',
    prompt: 'Quayside Hotel, a fictional business, reports for 2027: revenue $2,400,000; operating income (EBIT) $360,000; interest expense $90,000; income tax $67,500; net income $202,500. It has no non-operating items. What is its interest coverage?',
    answer: 4, check: () => 360000 / 90000, unit: '', places: 2, tol: 0.005,
    hints: ['Use earnings before the interest you are testing.', 'EBIT ÷ interest expense.'],
    wrong: [
      { value: 2.25, say: 'That uses net income, which is after interest and tax. Coverage asks how many times the earnings available to pay interest cover it: use EBIT.' },
      { value: 3, say: 'That uses income before tax, which is already after interest. Use EBIT.' },
      { value: 26.67, say: 'That is revenue over interest. Costs have to be paid before interest: use EBIT.' },
    ],
    solution: 'Interest coverage = EBIT ÷ interest expense = 360,000 ÷ 90,000 = 4.00 times.',
  },
  {
    id: 'f03-solv-g3', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional catering company’s balance sheet lists these liabilities. Classify each for a debt-to-equity ratio that follows this course’s conventions.',
    items: ['A bank overdraft', 'An instalment note for a combi oven bought on the maker’s 36-month plan', 'The current portion of a five-year bank loan', 'Accounts payable to food suppliers', 'Deposits received for future events', 'Operating lease liabilities for the kitchen', 'Wages payable'],
    categories: DEBT_CATS,
    answer: [0, 0, 0, 2, 2, 1, 2],
    hints: ['Does the item charge interest, openly or implicitly?', 'Leases are a stated adjustment: they go in “debt” only when the analyst says so.'],
    feedback: {
      1: 'An instalment plan from the seller is vendor finance: the price includes interest, and the note is debt.',
      2: 'The current portion of a loan is still the loan. It moves to current liabilities but stays debt.',
      4: 'Deposits are unearned revenue, settled by delivering the events. No interest, so not debt.',
      5: 'Lease liabilities are on the balance sheet under ASC 842; counting them as debt is an adjustment to state openly.',
    },
    solution: 'Interest-bearing debt: the overdraft, the oven’s instalment note and the current portion of the bank loan. Lease liabilities: debt only as a stated adjustment. Payables, deposits and wages are operating liabilities.',
  },
  {
    id: 'f03-solv-g4', type: 'steps', kind: 'applied',
    prompt: 'Pinewood Fitness, a fictional chain of gyms reporting under US GAAP, has: interest-bearing debt $400,000; operating lease liabilities $1,200,000; cash $100,000; EBIT $350,000; depreciation $150,000; interest expense $30,000. Its operating lease cost for the year was $260,000, of which $70,000 was interest on the lease liabilities. Restate its ratios treating the leases as debt.',
    solution: 'Net debt with leases = 400,000 + 1,200,000 − 100,000 = 1,500,000. Lease-adjusted EBITDA = 350,000 + 150,000 + 260,000 = 760,000; net debt ÷ EBITDA = 1.97. Lease-adjusted EBIT = 350,000 + 70,000 = 420,000; interest = 30,000 + 70,000 = 100,000; coverage = 4.20 (against 11.67 unadjusted).',
    steps: [
      { id: 'f03-solv-g4-s1', type: 'num', prompt: 'What is lease-adjusted EBITDA?',
        answer: 760000, check: () => 350000 + 150000 + 260000, unit: '$', places: 0, tol: 0.5,
        hints: ['Start from reported EBITDA: EBIT + depreciation.', 'If leases are debt, their whole cost is financing: add the $260,000 back.'],
        wrong: [
          { value: 500000, say: 'That is reported EBITDA. If the leases are debt, add the lease cost back as well.' },
          { value: 570000, say: 'Only the interest part is added back there. Under the loan view the amortisation part becomes D&A, which EBITDA also adds back: add the whole $260,000.' },
        ] },
      { id: 'f03-solv-g4-s2', type: 'num', prompt: 'What is lease-adjusted net debt ÷ EBITDA?',
        answer: 1.97, check: () => (400000 + 1200000 - 100000) / (350000 + 150000 + 260000), unit: '', places: 2, tol: 0.005,
        hints: ['Net debt = debt + lease liabilities − cash.', '1,500,000 ÷ 760,000.'],
        wrong: [
          { value: 3, say: 'That puts leases in debt but keeps EBITDA after the lease cost: two bases. Use 760,000.' },
          { value: 0.39, say: 'That leaves the leases out of debt while adding their cost back to EBITDA. Adjust both sides.' },
        ] },
      { id: 'f03-solv-g4-s3', type: 'num', prompt: 'What is lease-adjusted interest coverage?',
        answer: 4.2, check: () => (350000 + 70000) / (30000 + 70000), unit: '', places: 2, tol: 0.005,
        hints: ['The lease interest moves out of operating costs (EBIT rises) and into interest expense.', '(350,000 + 70,000) ÷ (30,000 + 70,000).'],
        wrong: [
          { value: 11.67, say: 'That is the unadjusted coverage, 350,000 ÷ 30,000.' },
          { value: 3.5, say: 'You added the lease interest to interest expense but not back to EBIT: it was inside operating costs, so EBIT rises by $70,000 too.' },
        ] },
    ],
  },
];

export const independent = [
  {
    id: 'f03-solv-i1', type: 'num', kind: 'numerical',
    prompt: 'Highgate Pharmacies, a fictional chain, has interest-bearing debt of $1.8 million and shareholders’ equity of $4.2 million. What is its debt-to-capital ratio, as a percentage?',
    answer: 30, check: () => 1.8 / (1.8 + 4.2) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 42.9, say: 'That is debt to equity (1.8 ÷ 4.2). Debt to capital divides by debt plus equity.' },
      { value: 70, say: 'That is equity’s share of capital. Debt to capital is debt’s share.' },
    ],
    solution: 'Debt to capital = 1.8 ÷ (1.8 + 4.2) = 1.8 ÷ 6.0 = 30.0%.',
  },
  {
    id: 'f03-solv-i2', type: 'num', kind: 'numerical',
    prompt: 'Northwind Kayaks, a fictional business, changed its year end and reports a six-month period to 30 June 2027 with EBITDA of $210,000. At 30 June it has interest-bearing debt of $1,050,000 and cash of $90,000. What is its net debt ÷ EBITDA, with EBITDA annualised? Its trade is not seasonal.',
    answer: 2.29, check: () => (1050000 - 90000) / R.annualise(210000, 6), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 4.57, say: 'That divides by six months of EBITDA. A balance divided by a flow needs a twelve-month flow: annualise first.' },
      { value: 2.5, say: 'Net debt subtracts cash: 1,050,000 − 90,000.' },
    ],
    solution: 'Annualised EBITDA = 210,000 × 12 ÷ 6 = 420,000. Net debt = 1,050,000 − 90,000 = 960,000. Net debt ÷ EBITDA = 960,000 ÷ 420,000 = 2.29.',
  },
  {
    id: 'f03-solv-i3', type: 'num', kind: 'numerical',
    prompt: 'A fictional company’s liabilities are 75% of its total assets. What is its equity multiplier?',
    answer: 4, check: () => 1 / (1 - 0.75), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.33, say: 'That is total assets ÷ total liabilities (1 ÷ 0.75). The equity multiplier divides by equity, which is 25% of assets.' },
      { value: 3, say: 'That is liabilities to equity (75 ÷ 25). The equity multiplier is one more: total assets ÷ equity.' },
    ],
    solution: 'Equity is 100% − 75% = 25% of total assets, so the equity multiplier = 1 ÷ 0.25 = 4.00. Check: 1 + liabilities ÷ equity = 1 + 3 = 4.',
  },
  {
    id: 'f03-solv-i4', type: 'mc', kind: 'conceptual',
    prompt: 'A data provider lists Starbucks’ FY2024 debt-to-equity ratio as −2.09. What is the right way to read it?',
    options: [
      'Equity is negative, so the ratio has no meaning; use debt to EBITDA and coverage instead',
      'Starbucks holds more cash and short-term investments than debt, so its net leverage is negative',
      'Starbucks has repaid all its borrowings, and the negative figure shows the surplus cash it now holds instead',
      'The ratio is low, so Starbucks carries unusually little leverage for a company of its size',
    ],
    answer: 0,
    feedback: {
      1: 'Net cash would make net debt negative, not debt to equity. Starbucks’ debt of $15,568.4 million exceeds its cash.',
      2: 'Starbucks owed $15,568.4 million of debt at its 2024 year end.',
      3: 'Its liabilities exceed its assets (a debt ratio of 123.7%). A negative ratio is not a small one.',
    },
    solution: 'Starbucks has a shareholders’ deficit of $7,441.6 million, so any ratio that divides by equity, including debt to equity and return on equity, is not meaningful. Its interest coverage (9.62) and net debt to EBITDA (1.72) show how comfortably it carries its debt.',
  },
  {
    id: 'f03-solv-i5', type: 'short', kind: 'applied',
    prompt: 'Ana asks why Coastline’s credit officer reports two debt-to-equity ratios for Lantern in 2027, 1.04 and 3.80, and which is “right”. Write four to six sentences answering her.',
    rubric: [
      'Explains that 1.04 counts interest-bearing debt only and 3.80 adds the cafés’ operating lease liabilities.',
      'Explains why leases resemble debt: fixed payments for five years, recorded as a liability under ASC 842.',
      'States that neither is wrong; the choice must be stated and applied consistently, including to EBITDA and interest.',
      'Notes the consequence for coverage (about 11.4 times against about 3.1) or for a loan covenant’s definition.',
    ],
    model: 'Both are right; they answer different questions. The 1.04 compares Lantern’s loans, the Coastline note, the van note, the brewer plan and the credit line, with your equity. The 3.80 also counts the $173,379 you owe under the cafés’ leases, because five years of fixed rent is a commitment as binding as a loan, and since ASC 842 it sits on the balance sheet as a liability. A lender who counts the leases also treats the rent as financing, so on that view your earnings cover your financing costs about three times rather than eleven. What matters is that the bank says which definition it uses, especially in any covenant you sign.',
  },
];

export const check = [
  {
    id: 'f03-solv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why does interest coverage use EBIT rather than net income?',
    options: [
      'Interest is paid before tax, out of earnings before interest',
      'EBIT is always larger than net income, which gives a more favourable ratio',
      'Net income excludes depreciation, so it overstates the cash available',
      'US GAAP requires EBIT to be shown on the income statement, while net income is optional',
    ],
    answer: 0,
    feedback: {
      1: 'The aim is the right numerator, not a flattering one. EBIT can be smaller than net income when there are large non-operating gains.',
      2: 'Net income is after depreciation, as EBIT is. The difference between them is interest and tax.',
      3: 'Net income must be shown; EBIT is an analyst’s measure and often equals operating income.',
    },
    solution: 'Interest is deducted before tax, so the earnings available to pay it are those before interest and taxes. Net income has already paid the interest being tested (and the tax), so a coverage ratio built on it understates the cushion: Lantern’s would be 7.79 rather than 11.39.',
  },
  {
    id: 'f03-solv-k2', type: 'num', kind: 'numerical',
    prompt: 'Suppose Hollis Avery had invested $40,000 in Lantern for new shares on 31 December 2027, with the cash still in the bank at the year end. Lantern’s total liabilities were $265,065 and its equity $62,818. What would its liabilities-to-equity ratio have been? Give two decimal places.',
    answer: 2.58, check: () => P27.totalLiabilities / (P27.equity + 40000), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 4.22, say: 'That is the reported ratio. New shares add $40,000 to equity.' },
      { value: 3.58, say: 'Adding cash raises total assets, not liabilities; liabilities to equity divides the unchanged liabilities by the larger equity. 3.58 is the new equity multiplier, total assets ÷ equity, which is one more.' },
    ],
    solution: 'Equity becomes 62,818 + 40,000 = 102,818; liabilities are unchanged at 265,065. Liabilities to equity = 265,065 ÷ 102,818 = 2.58, down from 4.22.',
  },
  {
    id: 'f03-solv-k3', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these should an analyst include in a business’s interest-bearing debt? Select all that apply.',
    options: [
      'A machine bought on the supplier’s 24-month instalment plan, recorded at its cash price',
      'The drawn balance of a revolving line of credit',
      'The current portion of a long-term bank loan',
      'Gift cards sold but not yet redeemed',
      'Amounts owed to suppliers on 30-day terms',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Gift cards are unearned revenue, settled by delivering goods, and carry no interest.',
      4: 'Trade payables on normal terms carry no interest; they are operating liabilities.',
    },
    solution: 'The instalment plan is vendor finance (interest is built into the payments), the drawn line of credit is a loan, and the current portion of a loan is still the loan. Gift cards and trade payables are operating liabilities.',
  },
  {
    id: 'f03-solv-k4', type: 'num', kind: 'numerical',
    prompt: 'Starbucks’ FY2024 balance sheet shows long-term debt of $14,319.5 million, current maturities of long-term debt of $1,248.9 million, no short-term debt, operating lease liabilities of $1,463.1 million (current) and $8,771.6 million (noncurrent), cash and cash equivalents of $3,286.2 million and short-term investments of $257.0 million. What is its net debt including lease liabilities, in $ millions?',
    answer: 22259.9, check: () => 14319.5 + 1248.9 + 1463.1 + 8771.6 - 3286.2 - 257.0, unit: '$m', places: 1, tol: 0.5,
    wrong: [
      { value: 12025.2, say: 'That is net debt without the leases. The question asks you to include them.' },
      { value: 25803.1, say: 'Net debt subtracts cash and short-term investments.' },
      { value: 22516.9, say: 'Subtract the short-term investments as well as cash: they are part of the cash a company could use to repay.' },
    ],
    solution: 'Debt = 14,319.5 + 1,248.9 = 15,568.4; leases = 1,463.1 + 8,771.6 = 10,234.7; cash and short-term investments = 3,543.2. Net debt including leases = 15,568.4 + 10,234.7 − 3,543.2 = $22,259.9 million.',
  },
  {
    id: 'f03-solv-k5', type: 'mc', kind: 'applied',
    prompt: 'A lender’s term sheet for a fictional restaurant group says: “Net debt shall not exceed 3.0 × EBITDA. Debt includes lease liabilities.” It does not mention lease costs. The group’s operating lease cost is large. What should the group’s finance director ask for before signing?',
    options: [
      'That EBITDA be defined before operating lease costs',
      'That the ratio be tested on the group’s balance sheet before the new loan is drawn',
      'That lease liabilities be counted at their undiscounted total, to be conservative',
      'That interest coverage replace the leverage test, since coverage ignores leases',
    ],
    answer: 0,
    feedback: {
      1: 'A test before the loan is drawn would miss the borrowing it is meant to limit.',
      2: 'The undiscounted payments overstate the liability and make the mismatch worse.',
      3: 'Under US GAAP, interest expense also excludes the interest inside the lease cost; coverage has the same mismatch unless it is adjusted.',
    },
    solution: 'With leases in debt but EBITDA after the lease cost, the ratio counts the leases twice against the group: as debt, and by reducing the earnings that pay for them. Defining EBITDA before lease costs (sometimes called EBITDAR when all rent is added back) puts both sides on the same basis.',
  },
  {
    id: 'f03-solv-k6', type: 'num', kind: 'numerical',
    prompt: 'Marlow Logistics, a fictional company, reports EBIT of $1.2 million, depreciation and amortisation of $0.6 million and interest expense of $0.4 million. What is its EBITDA coverage?',
    answer: 4.5, check: () => (1.2 + 0.6) / 0.4, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 3, say: 'That is interest coverage on EBIT. EBITDA coverage adds back depreciation and amortisation.' },
      { value: 1.5, say: 'That divides depreciation by interest. EBITDA is EBIT plus D&A.' },
    ],
    solution: 'EBITDA = 1.2 + 0.6 = $1.8 million. EBITDA coverage = 1.8 ÷ 0.4 = 4.50 times.',
  },
];
