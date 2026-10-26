// assess-m3.js — F03 module 3 test: Returns (return-on-assets-and-equity, dupont-analysis).
// New questions, not copies of lesson exercises: other fictional businesses and other angles (a share issue during the
// year, solving for the leverage a target needs, the interest hidden in lease cost, Lantern without its leases).
// Lantern’s figures come from case.js; every other business is fictional. No hints; solutions show in review.
import { PERIODS } from './case.js?v=18';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const n = (v) => Math.round(v).toLocaleString('en-US');

export const items = [
  // ---------------------------------------------------------------- return-on-assets-and-equity
  {
    id: 'f03-m3-1', lesson: 'return-on-assets-and-equity', type: 'num', kind: 'numerical',
    prompt: 'Calloway Vineyards, a fictional wine producer, had equity of $1,500,000 on 1 January 2027. In July it issued new shares for $400,000. It earned net income of $312,000 for the year and paid dividends of $112,000. What is its return on equity on average equity? Enter a percentage to one decimal place.',
    answer: 17.3, check: () => 312000 / ((1500000 + (1500000 + 400000 + 312000 - 112000)) / 2) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 14.9, say: 'That divides by closing equity ($2,100,000). The course uses the average of opening and closing equity.' },
      { value: 20.8, say: 'That divides by opening equity. Work out closing equity (opening + new shares + net income − dividends) and average the two.' },
      { value: 19.5, say: 'Closing equity includes the $400,000 of new shares as well as the retained profit: 1,500,000 + 400,000 + 312,000 − 112,000 = 2,100,000.' },
    ],
    solution: 'Closing equity = 1,500,000 + 400,000 + 312,000 − 112,000 = 2,100,000. Average = (1,500,000 + 2,100,000) ÷ 2 = 1,800,000. ROE = 312,000 ÷ 1,800,000 = 17.3%. A simple average treats the July issue as if it were spread over the year, which is roughly right here.',
  },
  {
    id: 'f03-m3-2', lesson: 'return-on-assets-and-equity', type: 'mc', kind: 'conceptual',
    prompt: 'A profitable company earns a return on invested capital well above its after-tax cost of borrowing. Which action would raise its return on equity while lowering its return on assets measured on net income?',
    options: [
      'Borrowing to pay shareholders a special dividend',
      'Issuing new shares and using the cash to repay a loan',
      'Raising prices with no loss of sales volume',
      'Selling surplus land at book value and keeping the cash',
    ],
    answer: 0,
    feedback: {
      1: 'That lowers leverage: interest falls, so ROA on net income rises, while equity grows, so ROE falls.',
      2: 'Higher prices raise net income with assets and equity unchanged, so both ratios rise.',
      3: 'At book value one asset becomes another of equal value and net income is unchanged: neither ratio moves (until the cash earns or is spent).',
    },
    solution: 'Paying the dividend with borrowed money leaves total assets where they were, adds interest (so net income and ROA on net income fall) and cuts equity. With ROIC above the after-tax cost of debt the spread is positive, so ROE rises. The owners get a higher return in exchange for more risk.',
  },
  {
    id: 'f03-m3-3', lesson: 'return-on-assets-and-equity', type: 'num', kind: 'applied',
    prompt: 'A buyer is valuing Greenway Landscapes, a fictional firm run by its owner, who draws no salary. Its income before tax is $140,000; hiring a manager to do the owner’s work would cost $85,000 a year. The tax rate is 21% and average total assets are $400,000. What is the firm’s return on assets after charging a market salary? Enter a percentage to one decimal place.',
    answer: 10.9, check: () => (140000 - 85000) * (1 - 0.21) / 400000 * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 27.7, say: 'That is the reported ROA, before paying anyone for the owner’s work. A buyer must pay a manager.' },
      { value: 6.4, say: 'You took the salary off net income, so it saved no tax. Charge it before tax: (140,000 − 85,000) × 0.79.' },
      { value: 13.75, say: 'That is income before tax over assets. ROA uses net income, after the 21% tax.' },
    ],
    solution: 'Normalised income before tax = 140,000 − 85,000 = 55,000; net income = 55,000 × 0.79 = 43,450; ROA = 43,450 ÷ 400,000 = 10.9%, against 110,600 ÷ 400,000 = 27.7% as reported.',
  },
  {
    id: 'f03-m3-4', lesson: 'return-on-assets-and-equity', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel company earns a return on invested capital of 12%. It can borrow at 5% before tax, and its tax rate is 20%. Its owners want a return on equity of 20%. Using ROE = ROIC + (ROIC − r(1 − t)) × D ÷ E, how much debt per dollar of equity does it need? Enter D ÷ E to two decimal places.',
    answer: 1, check: () => (20 - 12) / (12 - 5 * (1 - 0.2)), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 1.14, say: 'That uses the pre-tax cost of debt. Interest is deductible, so debt costs 5% × 0.8 = 4% after tax.' },
      { value: 0.67, say: 'Divide the extra return needed (20% − 12% = 8%) by the spread (12% − 4% = 8%), not by ROIC.' },
    ],
    solution: 'After-tax cost of debt = 5% × 0.8 = 4%; spread = 12% − 4% = 8%. Needed: 20% = 12% + 8% × D ÷ E, so D ÷ E = 8 ÷ 8 = 1.00. If ROIC later fell to 4% or below, the same leverage would add nothing or subtract.',
  },
  {
    id: 'f03-m3-5', lesson: 'return-on-assets-and-equity', type: 'mc', kind: 'applied',
    prompt: 'A start-up’s pitch says: “Our return on equity last year was 300%.” The accounts show net income of $30,000, average equity of $10,000 and average total assets of $600,000. What should an investor make of the claim?',
    options: [
      'Little: ROE is huge because equity is tiny; ROA of 5% describes the business better.',
      'It is outstanding: few companies of any size earn 300% on their owners’ capital.',
      'It is wrong: ROE can never be above 100%, so the numbers must be misstated.',
      'It is fair, since a return should be judged on the owners’ $10,000 at risk.',
    ],
    answer: 0,
    feedback: {
      1: 'The 300% says more about the $10,000 denominator than about the business. Assets of $600,000 earned 5%.',
      2: 'ROE has no upper limit; a tiny denominator can make it any size. That is why it misleads here.',
      3: 'The $10,000 didn’t earn the profit: $600,000 of assets did, almost all financed by others. Here ROE measures leverage, not performance.',
    },
    solution: 'ROE = 30,000 ÷ 10,000 = 300%, but the business finances $60 of assets with each dollar of equity. ROA = 30,000 ÷ 600,000 = 5%. With equity this thin, ROE describes the denominator and the risk, not performance: compare ROA (or ROIC) with other businesses.',
  },
  // ---------------------------------------------------------------- dupont-analysis
  {
    id: 'f03-m3-6', lesson: 'dupont-analysis', type: 'steps', kind: 'numerical',
    prompt: 'Marrow Valley Buses, a fictional regional bus operator, earned a return on equity of 18.0% in 2027. Its tax burden was 0.75, its EBIT margin 10%, its asset turnover 0.80 and its equity multiplier 4.0. Its EBIT was $4.8 million. Work backwards to its financing costs.',
    solution: 'ROE = tax burden × interest burden × EBIT margin × turnover × multiplier, so the interest burden = 18% ÷ (0.75 × 10% × 0.80 × 4.0) = 18% ÷ 24% = 0.75. Income before tax = 0.75 × 4.8 = 3.6, so interest expense = 4.8 − 3.6 = $1.2 million: lenders take a quarter of operating profit.',
    steps: [
      { id: 'f03-m3-6-s1', type: 'num', prompt: 'What interest burden is implied by the other four factors and the ROE? Two decimal places.',
        answer: 0.75, check: () => 0.18 / (0.75 * 0.10 * 0.80 * 4.0), unit: '', places: 2, tol: 0.005,
        wrong: [
          { value: 1.33, say: 'Upside down: divide the ROE by the product of the other four factors (24%), not the other way round.' },
          { value: 0.56, say: 'The tax burden is one of the four known factors: divide 18% by 0.75 × 10% × 0.80 × 4.0 = 24%, not by 32%.' },
        ] },
      { id: 'f03-m3-6-s2', type: 'num', prompt: 'What was its interest expense, in $ millions? One decimal place.',
        answer: 1.2, check: () => 4.8 - 4.8 * (0.18 / (0.75 * 0.10 * 0.80 * 4.0)), unit: '$ millions', places: 1, tol: 0.05,
        wrong: [
          { value: 3.6, say: 'That is income before tax (interest burden × EBIT). Interest is EBIT minus income before tax.' },
          { value: 2.1, say: 'That is EBIT − net income (4.8 − 2.7), which is interest and tax together (1.2 + 0.9). Interest alone is EBIT − income before tax = 4.8 − 3.6.' },
        ] },
    ],
  },
  {
    id: 'f03-m3-7', lesson: 'dupont-analysis', type: 'mc', kind: 'conceptual',
    prompt: 'A café chain reports under US GAAP and rents all its sites on operating leases. Why does its interest burden (income before tax ÷ EBIT) understate how much of its operating profit goes on financing?',
    options: [
      'Its implicit lease interest sits in operating lease cost, above EBIT.',
      'Lease liabilities are left off the balance sheet, so the burden ignores them.',
      'The burden uses income after tax, which already deducts the lease payments.',
      'Operating lease cost counts as interest expense, which double-counts it.',
    ],
    answer: 0,
    feedback: {
      1: 'Under ASC 842 operating lease liabilities are on the balance sheet; that is why they raise the equity multiplier.',
      2: 'The interest burden uses income before tax, not after.',
      3: 'The reverse: the whole operating lease cost is an operating expense, so none of it is interest expense.',
    },
    solution: 'An operating lease has one straight-line lease cost in operating expenses, which includes the interest on the lease liability. EBIT is already after it, so the interest burden sees only interest on borrowings. The equity multiplier, meanwhile, counts the lease liabilities in full: the two factors treat the leases differently.',
  },
  {
    id: 'f03-m3-8', lesson: 'dupont-analysis', type: 'num', kind: 'applied',
    prompt: 'A fictional furniture retailer’s board wants a return on equity of 15%. Its net margin is 5% and it doesn’t want its equity multiplier above 2.0. What asset turnover does it need? Enter it to two decimal places.',
    answer: 1.5, check: () => 15 / (5 * 2), unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: 3, say: 'That ignores the multiplier: ROE = margin × turnover × multiplier, so turnover = 15% ÷ (5% × 2.0).' },
      { value: 6, say: 'Divide the target by both the margin and the multiplier, don’t multiply by the multiplier.' },
    ],
    solution: 'Turnover = ROE ÷ (margin × multiplier) = 15% ÷ (5% × 2.0) = 1.50: the retailer must sell $1.50 a year for each dollar of average assets, by selling more from the same stores and stock or carrying fewer assets.',
  },
  {
    id: 'f03-m3-9', lesson: 'dupont-analysis', type: 'classify', kind: 'conceptual',
    prompt: 'For a fictional manufacturer, which five-step DuPont factor does each change move directly, everything else unchanged?',
    items: [
      'The government cuts the corporate income tax rate',
      'The company refinances the same amount of debt at a lower interest rate',
      'A cheaper supplier cuts the cost of materials with prices and volumes unchanged',
      'The same profit per order on 20% more orders, with no new assets',
      'The company borrows to buy back some of its shares',
    ],
    categories: ['Tax burden', 'Interest burden', 'EBIT margin', 'Asset turnover', 'Equity multiplier'],
    answer: [0, 1, 2, 3, 4],
    feedback: {
      1: 'EBIT is unchanged; less of it goes on interest, so income before tax ÷ EBIT rises.',
      3: 'Revenue rises on the same assets: turnover. Profit per order is unchanged, so the margin stays where it was.',
      4: 'Assets are unchanged and equity falls: assets per dollar of equity rise.',
    },
    solution: 'Tax rate: tax burden. Cheaper refinancing: interest burden. Cheaper materials: EBIT margin. More orders on the same assets at the same margin: asset turnover. Borrowing to buy back shares: equity multiplier (and, through the extra interest, a little of the interest burden).',
  },
  {
    id: 'f03-m3-10', lesson: 'dupont-analysis', type: 'num', kind: 'applied',
    prompt: `An analyst wants to compare Lantern with older borrowers whose cafés were rented before operating leases came onto balance sheets. Lantern’s 2027 net income was $${n(P27.netIncome)}. Its total assets were $${n(P26.totalAssets)} at 31 December 2026 (no leases) and $${n(P27.totalAssets)} at 31 December 2027, including $${n(P27.rightOfUse)} of right-of-use assets. What is its 2027 return on average total assets without the right-of-use assets? Enter a percentage to one decimal place.`,
    answer: 18.1, check: () => P27.netIncome / ((P26.totalAssets + P27.totalAssets - P27.rightOfUse) / 2) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 10.6, say: 'That includes the right-of-use assets. Take them out of the closing total before averaging.' },
      { value: 14.5, say: 'That uses closing total assets without the leases. Average them with the opening $93,676.' },
    ],
    solution: 'Closing assets without the leases = 327,883 − 173,379 = 154,504; average with 93,676 = 124,090; ROA = 22,431 ÷ 124,090 = 18.1%, against 10.6% with the leases. Net income is the same either way; only the denominator changes.',
  },
  {
    id: 'f03-m3-11', lesson: 'dupont-analysis', type: 'mc', kind: 'applied',
    prompt: 'Lantern’s 2027 factors are net margin 3.9%, asset turnover 2.74 and equity multiplier 4.01 (ROE 42.6%). Harbourline Roasters’, on closing balances, are 5.9%, 0.97 and 2.20 (ROE 12.7%). Which conclusion do they support?',
    options: [
      'Lantern earns less on each sale; its higher ROE comes from turnover and leverage.',
      'Lantern is the more profitable business on every measure the factors show.',
      'Harbourline is the safer investment, because its margin is the higher of the two.',
      'The two can’t be compared, because one is a roaster and the other a café business.',
    ],
    answer: 0,
    feedback: {
      1: 'Lantern’s margin is lower (3.9% against 5.9%). Its advantage is in turnover, and its ROE also rests on nearly twice Harbourline’s leverage.',
      2: 'Margin measures profitability, not safety. Safety needs the leverage, liquidity and coverage ratios.',
      3: 'Different business models are exactly what DuPont helps compare, as long as the bases are stated and differences in scale are kept in mind.',
    },
    solution: 'With the factors unrounded, Lantern’s ROA is 3.88% × 2.742 = 10.6% against Harbourline’s 5.94% × 0.970 = 5.8%: turnover, not margin, puts Lantern ahead. Its multiplier of 4.01 against 2.20 then nearly doubles the gap in ROE. The bases differ (averages against closing balances), which should be noted in any comparison.',
  },
];
