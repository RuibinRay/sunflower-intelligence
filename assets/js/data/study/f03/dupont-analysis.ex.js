// dupont-analysis.ex.js — F03 · DuPont analysis: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Lantern’s figures come from case.js and core/ratios.js; Harbourline from f00/case.js (fictional, $ millions);
// Starbucks from its FY2024 Form 10-K, as cited in the lesson; every other business is fictional.
import { PERIODS, FACTS, LEASE } from './case.js?v=22';
import * as R from '../../../core/ratios.js?v=22';
import { HARBOURLINE as HL, HARBOURLINE_DETAIL as HD } from '../f00/case.js?v=22';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const d26 = R.dupont(P26), d27 = R.dupont(P27, P26);
const n = (v) => Math.round(v).toLocaleString('en-US');
const t = FACTS.tax.rate;
const research = FACTS.research;

const harbourline = {
  revenue: HL.revenue, operatingIncome: HL.ebit, ebit: HL.ebit, interestExpense: HD.interest, pretax: HD.profitBeforeTax,
  tax: HD.tax, netIncome: HL.netIncome, da: HL.da, cash: HL.cash, receivables: HD.receivables, inventory: HD.inventory,
  currentAssets: HL.currentAssets, totalAssets: HD.totalAssets, currentLiabilities: HL.currentLiabilities,
  totalLiabilities: HD.totalAssets - HD.bookEquity, debt: HL.debt, equity: HD.bookEquity,
};
const starbucks = { revenue: 36176.2, pretax: 4969.6, tax: 1207.3, netIncome: 3760.9, totalAssets: 31339.3, equity: -7448.9 };

export const widgets = {
  'dup-lantern': {
    type: 'ratios',
    title: 'DuPont factors: Lantern, Harbourline and Starbucks',
    periods: [{ label: '2026 (ten months)', data: P26 }, { label: '2027', data: P27 }],
    peers: [
      { label: 'Harbourline ($m, closing)', data: harbourline },
      { label: 'Starbucks FY2024 ($m)', data: starbucks, prev: { totalAssets: 29445.5, equity: -7994.8 } },
    ],
    groups: ['dupont', 'dupont5'],
    toggles: ['average', 'annualise'],
    adjust: [
      { id: 'leases', label: 'Take the cafés’ right-of-use assets and lease liabilities off the 2027 balance sheet', period: 1,
        delta: { totalAssets: -P27.rightOfUse, rightOfUse: -P27.rightOfUse, totalLiabilities: -P27.leaseLiabilities, leaseLiabilities: -P27.leaseLiabilities, currentLiabilities: -LEASE.current2027 },
        note: 'Total assets and total liabilities both fall by the leases ($173,379), and current liabilities by the lease liability due in 2028. Net income is unchanged, so turnover rises and the multiplier falls in the same proportion: ROE doesn’t move.' },
      { id: 'research', label: 'Treat 2027’s $21,000 of market research as a one-off', period: 1,
        delta: { operatingIncome: research, ebit: research, pretax: research, tax: research * t, netIncome: research * (1 - t) } },
    ],
    select: 'dupontRoe',
    note: 'Lantern’s 2026 and Harbourline use closing balances; Lantern’s 2027 and Starbucks use averages when the averages box is ticked. Starbucks’ EBIT is left out, because its income before tax includes interest income and other items as well as interest expense, so its interest burden and EBIT margin show “—”. Its equity is negative: its multiplier and ROE are shown only to show that they mean nothing.',
  },
  'dup-explain': {
    type: 'formula',
    title: 'Three levers against Lantern’s 2026',
    intro: 'Each factor is compared with Lantern’s 2026 (ten months, closing balances): net margin 14.2%, asset turnover 2.06, equity multiplier 2.21, ROE 64.6%.',
    inputs: [
      { id: 'm', label: 'Net margin', min: 0.5, max: 20, step: 0.01, value: 3.88, fmt: 'pct' },
      { id: 'a', label: 'Asset turnover', min: 0.5, max: 6, step: 0.01, value: 2.74, fmt: 'num' },
      { id: 'e', label: 'Equity multiplier', min: 1, max: 8, step: 0.01, value: 4.01, fmt: 'num' },
    ],
    compute: (v) => {
      const m0 = d26.netMargin * 100, a0 = d26.assetTurnover, e0 = d26.equityMultiplier, roe0 = d26.roe * 100;
      const roe = v.m * v.a * v.e;
      const f = [v.m / m0, v.a / a0, v.e / e0];
      const fx = (x) => `× ${x.toFixed(2)}`;
      const r2 = (x) => Math.round(x * 100) / 100;
      const names = ['net margin', 'asset turnover', 'equity multiplier'];
      const big = f.map((x, i) => [Math.abs(Math.log(x)), i]).sort((p, q) => q[0] - p[0])[0][1];
      const note = `ROE is ${roe.toFixed(1)}% against 64.6% in 2026, a change of ${fx(roe / roe0)}. The ${names[big]} moved most (${fx(f[big])}). ROA, margin × turnover, is ${(v.m * v.a).toFixed(1)}%${v.e > e0 * 1.25 ? `; much of the ROE comes from leverage, which raises the owners’ risk as well as their return` : ''}.`;
      return {
        headline: { label: 'Return on equity', value: `${roe.toFixed(1)}%` },
        rows: [
          ['Return on assets (margin × turnover)', `${(v.m * v.a).toFixed(1)}%`],
          ['Net margin against 2026', fx(f[0])],
          ['Asset turnover against 2026', fx(f[1])],
          ['Equity multiplier against 2026', fx(f[2])],
          ['ROE against 2026 (the product of the three)', fx(roe / roe0)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Factor', values: ['Margin', 'Turnover', 'Multiplier', 'ROE'] },
          series: [{ name: 'Change from 2026 (× 1.00 = unchanged)', values: [...f, roe / roe0].map(r2) }], y: { label: 'Times the 2026 value' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f03-dup-g1', type: 'steps', kind: 'numerical',
    prompt: 'Decompose Lantern’s 2027 return on equity into three factors, on average balances.',
    data: { table: { head: ['Item', '31 Dec 2026 ($)', '31 Dec 2027 ($)'], rows: [
      ['Total assets', n(P26.totalAssets), n(P27.totalAssets)],
      ['Total equity', n(P26.equity), n(P27.equity)],
      ['Revenue for 2027', '', n(P27.revenue)],
      ['Net income for 2027', '', n(P27.netIncome)],
    ] } },
    solution: 'Net margin 22,431 ÷ 577,860 = 3.9%. Average total assets 210,779.5, so turnover 577,860 ÷ 210,779.5 = 2.74. Average equity 52,602.5, so the multiplier is 210,779.5 ÷ 52,602.5 = 4.01. Product 3.88% × 2.742 × 4.007 = 42.6%, equal to 22,431 ÷ 52,602.5.',
    steps: [
      { id: 'f03-dup-g1-s1', type: 'num', prompt: 'Net margin (%), to one decimal place',
        answer: 3.9, check: () => d27.netMargin * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['Net income ÷ revenue.'],
        wrong: [{ value: 5.7, say: 'That is the EBIT margin (operating income ÷ revenue). The three-step net margin uses net income.' }] },
      { id: 'f03-dup-g1-s2', type: 'num', prompt: 'Asset turnover, to two decimal places',
        answer: 2.74, check: () => d27.assetTurnover, unit: '', places: 2, tol: 0.01,
        hints: ['Revenue ÷ average total assets.', 'Average total assets = (93,676 + 327,883) ÷ 2.'],
        wrong: [{ value: 1.76, say: 'That uses closing total assets. Use the average, the same figure you will use in the multiplier.' }] },
      { id: 'f03-dup-g1-s3', type: 'num', prompt: 'Equity multiplier, to two decimal places',
        answer: 4.01, check: () => d27.equityMultiplier, unit: '', places: 2, tol: 0.01,
        hints: ['Average total assets ÷ average equity.'],
        wrong: [{ value: 5.22, say: 'That uses closing balances. With averages the product equals ROE exactly.' }] },
      { id: 'f03-dup-g1-s4', type: 'num', prompt: 'Return on equity: the product of the three (%), to one decimal place',
        answer: 42.6, check: () => d27.roe * 100, unit: '%', places: 1, tol: 0.1,
        hints: ['Multiply the unrounded factors, or check against net income ÷ average equity.'],
        wrong: [{ value: 35.7, say: 'That is net income over closing equity. The product of factors on averages equals net income over average equity.' }] },
    ],
  },
  {
    id: 'f03-dup-g2', type: 'steps', kind: 'numerical',
    prompt: 'Tern Coastal Ferries, a fictional ferry operator, reports for 2027 (in $ millions): revenue 120, EBIT 12, interest expense 3, income tax 1.8, net income 7.2. Its average total assets were 100 and its average equity 40. Work through the five-step decomposition.',
    solution: 'Tax burden 7.2 ÷ 9 = 0.80; interest burden 9 ÷ 12 = 0.75; EBIT margin 12 ÷ 120 = 10%; turnover 120 ÷ 100 = 1.2; multiplier 100 ÷ 40 = 2.5. ROE = 0.80 × 0.75 × 10% × 1.2 × 2.5 = 18%, equal to 7.2 ÷ 40.',
    steps: [
      { id: 'f03-dup-g2-s1', type: 'num', prompt: 'Tax burden (two decimal places)',
        answer: 0.8, check: () => 7.2 / (12 - 3), unit: '', places: 2, tol: 0.005,
        hints: ['Income before tax = EBIT − interest.', 'Tax burden = net income ÷ income before tax.'],
        wrong: [{ value: 0.2, say: 'That is the effective tax rate (1.8 ÷ 9). The tax burden is the share kept: 1 − 0.20.' }] },
      { id: 'f03-dup-g2-s2', type: 'num', prompt: 'Interest burden (two decimal places)',
        answer: 0.75, check: () => (12 - 3) / 12, unit: '', places: 2, tol: 0.005,
        hints: ['Income before tax ÷ EBIT.'],
        wrong: [
          { value: 0.25, say: 'That is interest as a share of EBIT. The interest burden is the share left after interest.' },
          { value: 1.33, say: 'Upside down: income before tax goes on top.' },
        ] },
      { id: 'f03-dup-g2-s3', type: 'num', prompt: 'Return on equity (%), from all five factors',
        answer: 18, check: () => 0.8 * 0.75 * (12 / 120) * (120 / 100) * (100 / 40) * 100, unit: '%', places: 1, tol: 0.06,
        hints: ['EBIT margin 10%, turnover 1.2, multiplier 2.5.', 'Multiply all five and check against 7.2 ÷ 40.'],
        wrong: [{ value: 24, say: 'You left out the tax burden. ROE uses net income, after tax.' }] },
    ],
  },
  {
    id: 'f03-dup-g3', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern’s ROE fell from 64.6% (2026) to 42.6% (2027). Its five-step factors were: tax burden 0.75 and 0.75; interest burden 0.97 and 0.91; EBIT margin 19.5% and 5.7%; asset turnover 2.06 and 2.74; equity multiplier 2.21 and 4.01. Which factor caused the fall?',
    options: [
      'The EBIT margin, which fell to less than a third of its 2026 level',
      'The interest burden, because interest expense more than doubled',
      'The equity multiplier, because more leverage means more risk',
      'Asset turnover, because the cafés added assets faster than revenue',
    ],
    answer: 0,
    hints: ['Divide each 2027 factor by its 2026 value. Which ratio is furthest below 1?'],
    feedback: {
      1: 'Interest did rise, but the interest burden only fell from 0.97 to 0.91, a factor of 0.94.',
      2: 'The multiplier rose, which pushed ROE up, not down. Risk is a separate question from what moved the ratio.',
      3: 'Turnover rose from 2.06 to 2.74: revenue grew faster than average assets.',
    },
    solution: 'EBIT margin 5.7% ÷ 19.5% = 0.29; interest burden 0.94; tax burden 1.00; turnover 1.33; multiplier 1.81. Only the margin factors fell, and the EBIT margin by far the most; turnover and leverage offset part of it.',
  },
  {
    id: 'f03-dup-g4', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery chain’s net margin fell from 8% to 6% while its asset turnover rose from 1.5 to 1.8; its equity multiplier stayed at 2.0. Using sequential substitution with the margin changed first, how many percentage points of ROE does the margin change account for? Enter a negative number for a fall, to one decimal place.',
    answer: -6, check: () => (6 * 1.5 * 2 - 8 * 1.5 * 2), unit: 'percentage points', places: 1, tol: 0.06,
    hints: ['Old ROE = 8% × 1.5 × 2.0. Change only the margin and keep the old turnover.', '6% × 1.5 × 2.0 − 8% × 1.5 × 2.0.'],
    wrong: [
      { value: -7.2, say: 'That changes turnover first and the margin second (with the new turnover). The question puts the margin first.' },
      { value: -2.4, say: 'You changed ROE from 24% to 21.6%: that is the total change, margin and turnover together.' },
    ],
    solution: 'Old ROE = 8% × 1.5 × 2.0 = 24.0%. With the new margin and old turnover: 6% × 1.5 × 2.0 = 18.0%, so the margin accounts for −6.0 points; turnover then adds 6% × 1.8 × 2.0 − 18.0% = +3.6 points, to 21.6%. Taken in the other order, the margin would account for −7.2 points.',
  },
];

export const independent = [
  {
    id: 'f03-dup-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand has a net margin of 6%, an asset turnover of 1.6 and an equity multiplier of 2.5, all on average balances. What is its return on equity? Enter a percentage to one decimal place.',
    answer: 24, check: () => 6 * 1.6 * 2.5, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 9.6, say: 'That is ROA (margin × turnover). Multiply by the equity multiplier to reach ROE.' },
      { value: 3.84, say: 'Multiply by the equity multiplier, don’t divide by it.' },
    ],
    solution: 'ROE = 6% × 1.6 × 2.5 = 24.0%. ROA is 6% × 1.6 = 9.6%.',
  },
  {
    id: 'f03-dup-i2', type: 'num', kind: 'numerical',
    prompt: `Harbourline Roasters, F00’s fictional listed roaster, reports (in $ millions) EBIT of ${HL.ebit}, interest expense of ${HD.interest}, income before tax of ${HD.profitBeforeTax} and net income of ${HL.netIncome}. What is its interest burden? Enter it to two decimal places.`,
    answer: 0.82, check: () => HD.profitBeforeTax / HL.ebit, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.22, say: 'Upside down: the interest burden is income before tax ÷ EBIT.' },
      { value: 0.62, say: 'That is net income ÷ EBIT, the tax and interest burdens together. The interest burden stops at income before tax.' },
      { value: 0.18, say: 'That is interest as a share of EBIT (11 ÷ 61). The burden is the share left: 50 ÷ 61.' },
    ],
    solution: 'Interest burden = income before tax ÷ EBIT = 50 ÷ 61 = 0.82: lenders take 18% of Harbourline’s operating profit, against 9% of Lantern’s in 2027.',
  },
  {
    id: 'f03-dup-i3', type: 'mc', kind: 'conceptual',
    prompt: 'A restaurant group adopts ASC 842 and records right-of-use assets and lease liabilities for its rented sites. Its rent becomes a straight-line operating lease cost of the same amount. Compared with its old figures, what happens to its DuPont factors?',
    options: [
      'Asset turnover falls and the equity multiplier rises; net margin and ROE are unchanged.',
      'Net margin falls, because the lease is now treated as debt; ROE falls with it.',
      'All three factors are unchanged, because no cash moved.',
      'Asset turnover rises, because the leases are now productive assets on the balance sheet.',
    ],
    answer: 0,
    feedback: {
      1: 'An operating lease keeps a single operating cost, here equal to the old rent, so net income and the margin don’t change. Only the balance sheet grows.',
      2: 'Total assets and total liabilities both grow by the lease amounts, so turnover and the multiplier change even though no cash moved.',
      3: 'Revenue is unchanged and assets are larger, so turnover falls.',
    },
    solution: 'Total assets rise by the right-of-use assets and liabilities by the lease liabilities, with equity unchanged. Turnover (revenue ÷ assets) falls and the multiplier (assets ÷ equity) rises by the same proportion, so ROE is unchanged. Lantern’s 2027 shows it: turnover 4.66 and multiplier 2.36 without the leases, 2.74 and 4.01 with them.',
  },
  {
    id: 'f03-dup-i4', type: 'num', kind: 'applied',
    prompt: 'Starbucks’ fiscal 2024 Form 10-K shows total net revenues of $36,176.2 million and net earnings attributable to Starbucks of $3,760.9 million; total assets were $29,445.5 million and $31,339.3 million at the two year ends. Its equity was negative, so an analyst decomposes return on assets instead of return on equity. What is its ROA, as net margin × asset turnover on average total assets? Enter a percentage to one decimal place.',
    answer: 12.4, check: () => (3760.9 / 36176.2) * (36176.2 / ((29445.5 + 31339.3) / 2)) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 12, say: 'That uses closing total assets. Average the two year ends: (29,445.5 + 31,339.3) ÷ 2.' },
      { value: 10.4, say: 'That is the net margin alone. Multiply by asset turnover, about 1.19.' },
    ],
    solution: 'Net margin 3,760.9 ÷ 36,176.2 = 10.4%; average total assets 30,392.4; turnover 36,176.2 ÷ 30,392.4 = 1.19; ROA = 10.4% × 1.19 = 12.4%.',
  },
  {
    id: 'f03-dup-i5', type: 'multi', kind: 'conceptual',
    prompt: 'Other things being equal, which of these raise a company’s equity multiplier (total assets ÷ equity)? Select all that apply.',
    options: [
      'Signing a new operating lease for a shop',
      'Borrowing from the bank to pay a special dividend',
      'Buying extra inventory on 30-day supplier credit',
      'Issuing new shares and using the cash to repay a loan',
      'Keeping the year’s profit in the business instead of paying a dividend',
      'Selling a machine for cash at its book value',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Assets are unchanged overall (cash in, then out) while equity rises: the multiplier falls.',
      4: 'Retained profit increases equity, and assets by the same amount, so assets ÷ equity falls (for a multiplier above 1).',
      5: 'One asset becomes another of the same value: total assets and equity are unchanged.',
    },
    solution: 'The lease adds a right-of-use asset and an equal liability; supplier credit adds inventory and a payable; borrowing to pay a dividend leaves assets unchanged and reduces equity. All three raise assets per dollar of equity. New shares that repay debt, and retained profit, lower it; swapping a machine for cash leaves it unchanged.',
  },
  {
    id: 'f03-dup-i6', type: 'num', kind: 'applied',
    prompt: 'For 2028 Ana expects Lantern’s asset turnover to be 2.9 and plans to bring the equity multiplier down to 3.5 by repaying the line of credit. What net margin would give a return on equity of 50%? Enter a percentage to two decimal places.',
    answer: 4.93, check: () => 50 / (2.9 * 3.5), unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 17.24, say: 'That divides by turnover only. ROE = margin × turnover × multiplier, so divide by both.' },
      { value: 14.29, say: 'That divides by the multiplier only. Divide by turnover × multiplier = 10.15.' },
    ],
    solution: 'Margin = ROE ÷ (turnover × multiplier) = 50% ÷ (2.9 × 3.5) = 50% ÷ 10.15 = 4.93%. Lantern’s 2027 net margin was 3.9%, so the target needs about a percentage point more profit on each dollar of sales.',
  },
];

export const check = [
  {
    id: 'f03-dup-k1', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery-storage installer has a tax burden of 0.78, an interest burden of 0.85, an EBIT margin of 12%, an asset turnover of 1.1 and an equity multiplier of 2.4. What is its return on equity? Enter a percentage to one decimal place.',
    answer: 21, check: () => 0.78 * 0.85 * 12 * 1.1 * 2.4, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 31.7, say: 'You left out the tax and interest burdens: they turn the EBIT margin into a net margin.' },
      { value: 8.75, say: 'That is ROA. Multiply by the equity multiplier, 2.4.' },
    ],
    solution: 'Net margin = 0.78 × 0.85 × 12% = 7.96%; ROA = 7.96% × 1.1 = 8.75%; ROE = 8.75% × 2.4 = 21.0%.',
  },
  {
    id: 'f03-dup-k2', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst computes asset turnover on closing total assets but the equity multiplier on average total assets and average equity. What goes wrong?',
    options: [
      'The product no longer equals ROE, so the factors can’t be reconciled.',
      'Nothing: total assets cancel in the product whatever figures are used.',
      'The net margin becomes wrong, because it depends on the balance sheet basis.',
      'ROE has to be restated on closing equity, and then the product is exact.',
    ],
    answer: 0,
    feedback: {
      1: 'They cancel only if the same total-assets figure appears in both factors.',
      2: 'The margin divides one flow by another; the basis of the balance sheet doesn’t enter it.',
      3: 'Closing equity doesn’t fix it: the turnover’s closing assets and the multiplier’s average assets still differ.',
    },
    solution: 'ROE = margin × (revenue ÷ assets) × (assets ÷ equity) holds only if the same assets appear in both factors. Use the same averages throughout.',
  },
  {
    id: 'f03-dup-k3', type: 'num', kind: 'applied',
    prompt: `Lantern’s revenue in 2027 was $${n(P27.revenue)}. Its total assets were $${n(P26.totalAssets)} at 31 December 2026 (no leases) and $${n(P27.totalAssets)} at 31 December 2027, including $${n(P27.rightOfUse)} of right-of-use assets for the cafés. What would its 2027 asset turnover be on average total assets without the right-of-use assets? Enter it to two decimal places.`,
    answer: 4.66, check: () => P27.revenue / ((P26.totalAssets + P27.totalAssets - P27.rightOfUse) / 2), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 2.74, say: 'That includes the right-of-use assets. Take them out of the closing total first.' },
      { value: 3.74, say: 'That uses closing total assets without the leases. Average them with the opening $93,676.' },
    ],
    solution: 'Closing assets without the leases = 327,883 − 173,379 = 154,504; average with 93,676 = 124,090; turnover = 577,860 ÷ 124,090 = 4.66, against 2.74 with the leases. The equity multiplier falls correspondingly, from 4.01 to 2.36, and ROE is unchanged.',
  },
  {
    id: 'f03-dup-k4', type: 'mc', kind: 'applied',
    prompt: 'Two fictional coffee chains report on average balances. Chain A: net margin 12%, asset turnover 1.0, equity multiplier 1.5. Chain B: net margin 4%, asset turnover 2.0, equity multiplier 3.0. Which conclusion is right?',
    options: [
      'A earns more on its assets; B’s higher ROE comes from its leverage.',
      'B is the better business, because its ROE is 24% against A’s 18%.',
      'A and B are equally profitable, because both have an ROE close to 20%.',
      'B uses its assets less efficiently, because its margin is a third of A’s.',
    ],
    answer: 0,
    feedback: {
      1: 'B’s ROE is higher only because it finances three dollars of assets with each dollar of equity. Its ROA is lower.',
      2: 'Their ROEs differ (18% and 24%), and so do their ROAs (12% and 8%). Similar ROEs can hide very different businesses anyway.',
      3: 'Efficiency is turnover, and B’s is twice A’s. The margin measures profitability.',
    },
    solution: 'ROA: A 12% × 1.0 = 12%; B 4% × 2.0 = 8%. ROE: A 12% × 1.5 = 18%; B 8% × 3.0 = 24%. B turns its assets faster but keeps less of each sale, and its higher ROE comes from leverage, with the extra risk that brings.',
  },
  {
    id: 'f03-dup-k5', type: 'fill', kind: 'conceptual',
    prompt: 'Name each factor of the five-step DuPont decomposition.',
    text: 'Net income ÷ income before tax is the [[0]]. Income before tax ÷ EBIT is the [[1]]. EBIT ÷ revenue is the [[2]]. Revenue ÷ average total assets is the [[3]]. Average total assets ÷ average equity is the [[4]].',
    blanks: [
      { options: ['tax burden', 'interest burden', 'EBIT margin', 'asset turnover', 'equity multiplier'], answer: 0 },
      { options: ['tax burden', 'interest burden', 'EBIT margin', 'asset turnover', 'equity multiplier'], answer: 1 },
      { options: ['tax burden', 'interest burden', 'EBIT margin', 'asset turnover', 'equity multiplier'], answer: 2 },
      { options: ['tax burden', 'interest burden', 'EBIT margin', 'asset turnover', 'equity multiplier'], answer: 3 },
      { options: ['tax burden', 'interest burden', 'EBIT margin', 'asset turnover', 'equity multiplier'], answer: 4 },
    ],
    solution: 'Tax burden, interest burden, EBIT margin, asset turnover, equity multiplier. The first three multiply to the net margin; with turnover they make ROA; the multiplier turns ROA into ROE.',
  },
  {
    id: 'f03-dup-k6', type: 'num', kind: 'numerical',
    prompt: 'A fictional software company has EBIT of $10.5 million, income before tax of $8.4 million and income tax of $2.1 million. What share of its EBIT reaches the shareholders as net income (tax burden × interest burden)? Enter it to two decimal places.',
    answer: 0.6, check: () => (8.4 - 2.1) / 8.4 * (8.4 / 10.5), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.75, say: 'That is the tax burden alone (6.3 ÷ 8.4). Multiply by the interest burden, 8.4 ÷ 10.5 = 0.80.' },
      { value: 0.8, say: 'That is the interest burden alone. Multiply by the tax burden, 0.75.' },
    ],
    solution: 'Net income = 8.4 − 2.1 = 6.3. Tax burden 6.3 ÷ 8.4 = 0.75; interest burden 8.4 ÷ 10.5 = 0.80; product 0.60, which is 6.3 ÷ 10.5.',
  },
];
