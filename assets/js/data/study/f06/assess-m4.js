// assess-m4.js — F06 module 4 test: Valuing shares (discounted-cash-flow-valuation, relative-valuation,
// fundamental-analysis). No hints. Each item has a full solution, shown when the student reviews the test. New
// questions, not copies of the lesson exercises. Every business named here is fictional; Brightcup Coffee is the
// course project’s and is not valued.
import * as IV from '../../../core/investments.js?v=31';

export const items = [
  {
    id: 'f06-m4-1', lesson: 'discounted-cash-flow-valuation', type: 'num', kind: 'numerical',
    prompt: 'Quellbrook Outfitters (fictional, listed) expects next year’s EBIT to be $48 million, with depreciation of $15 million and capital spending of $22 million. Revenue will rise from $400 million to $440 million, and it holds net working capital at 10% of revenue. Tax is 25%. What is next year’s free cash flow to the firm, in $ millions?',
    answer: 25, check: () => 48 * 0.75 + 15 - 22 - 0.10 * (440 - 400), unit: '$m', places: 1, tol: 0.05,
    wrong: [
      { value: -15, say: 'That subtracts working capital of 10% of the whole revenue ($44 million). Only the increase in working capital uses cash: 10% of the $40 million rise.' },
      { value: 33, say: 'That leaves out the tax: operating profit is taxed as if the firm had no debt.' },
      { value: 29, say: 'You left out the investment in working capital: 10% of the $40 million increase in revenue.' },
    ],
    solution: 'EBIT after tax 48 × 0.75 = 36. Working capital rises by 10% × (440 − 400) = 4. FCFF = 36 + 15 − 22 − 4 = $25 million.',
  },
  {
    id: 'f06-m4-2', lesson: 'discounted-cash-flow-valuation', type: 'num', kind: 'numerical',
    prompt: 'In a five-year DCF, a fictional logistics company’s free cash flow in year 5 is $30 million. After that it is expected to grow 2.5% a year for ever, and its WACC is 9%. What is the present value today of its terminal value, in $ millions?',
    answer: 307.5, check: () => (30 * 1.025 / (0.09 - 0.025)) / 1.09 ** 5, unit: '$m', places: 1, tol: 0.3,
    wrong: [
      { value: 473.1, say: 'That is the terminal value at the end of year 5. Discount it five years to today.' },
      { value: 299.9, say: 'That uses year 5’s cash flow as the first of the perpetuity. The first is year 6’s: 30 × 1.025.' },
      { value: 282.1, say: 'That discounts the terminal value six years. It is a value at the end of year 5.' },
    ],
    solution: 'Terminal value at the end of year 5: 30 × 1.025 ÷ (0.09 − 0.025) = 30.75 ÷ 0.065 = $473.1 million. Today: 473.1 ÷ 1.09⁵ = $307.5 million.',
  },
  {
    id: 'f06-m4-3', lesson: 'discounted-cash-flow-valuation', type: 'mc', kind: 'conceptual',
    prompt: 'Thornby Insurance (fictional) earns a return on equity exactly equal to its cost of equity, and is expected to do so for ever. Its board is choosing between paying out 30% and 80% of earnings. By the Gordon model, which payout gives the higher share value?',
    options: ['80%, because shareholders receive more cash now', 'Neither: the value is the same at both payouts', '30%, because retaining more makes the company grow faster', 'It depends on whether the shareholders prefer income or growth'],
    answer: 1,
    feedback: {
      0: 'More cash now is exactly offset by slower growth when retained earnings earn just the cost of equity.',
      2: 'Faster growth is real, but when retained earnings earn only what shareholders require it adds nothing to the value.',
      3: 'Preferences do not change the arithmetic: with ROE equal to the cost of equity, value equals EPS₁ ÷ r_E whatever the payout.',
    },
    solution: 'With g = (1 − payout) × ROE and ROE = r_E, the Gordon value payout × E₁ ÷ (r_E − (1 − payout) × r_E) simplifies to E₁ ÷ r_E: the payout drops out. Growth adds value only when the return on reinvested earnings exceeds the cost of equity.',
  },
  {
    id: 'f06-m4-4', lesson: 'discounted-cash-flow-valuation', type: 'num', kind: 'applied',
    prompt: 'A DCF puts the enterprise value of Kellaway Ferries (fictional, listed) at $900 million. The company has $260 million of debt, $40 million of cash, $50 million of preferred stock and 25 million ordinary shares. What is an ordinary share worth? Give dollars and cents.',
    answer: 25.2, check: () => IV.evToEquity({ ev: 900, debt: 260, cash: 40, other: 50, shares: 25 }).perShare, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 27.2, say: 'Preferred shareholders are paid before ordinary shareholders: subtract the $50 million like debt.' },
      { value: 36, say: 'That is enterprise value per share: the lenders and preferred holders own part of it.' },
      { value: 22, say: 'Cash belongs to the ordinary shareholders: add it, don’t subtract it.' },
    ],
    solution: 'Ordinary equity = 900 − 260 + 40 − 50 = $630 million; ÷ 25 million shares = $25.20.',
  },
  {
    id: 'f06-m4-5', lesson: 'relative-valuation', type: 'num', kind: 'applied',
    prompt: 'Analysts expect Hartsgill Brewing (fictional, listed) to earn $2.40 a share next year. Four listed brewers trade at forward P/Es of 12.5, 13.5, 14.5 and 22.0. Using the median, what share price do the peers imply? Give dollars and cents.',
    answer: 33.6, check: () => 2.4 * (13.5 + 14.5) / 2, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 37.5, say: 'That uses the mean, 15.6, which the peer at 22.0 pulls up. Use the median: the average of the middle two.' },
      { value: 32.4, say: 'That uses 13.5, one of the two middle values. With four peers the median is the average of the middle two.' },
    ],
    solution: 'The median of 12.5, 13.5, 14.5 and 22.0 is (13.5 + 14.5) ÷ 2 = 14.0. Price = 14.0 × 2.40 = $33.60. Forward P/Es go with forward earnings; a P/E needs no bridge.',
  },
  {
    id: 'f06-m4-6', lesson: 'relative-valuation', type: 'mc', kind: 'conceptual',
    prompt: 'An analyst compares two fictional rail-freight companies with similar debt. One owns its locomotives and wagons; the other leases most of them under short contracts and has far lower depreciation. Which multiple gives the fairer comparison of their operations?',
    options: ['EV/EBIT, which charges each for the cost of using its equipment', 'EV/EBITDA, because it ignores depreciation entirely', 'Price-to-book, because the owner has more assets', 'Dividend yield, since both companies pay out most of their earnings'],
    answer: 0,
    feedback: {
      1: 'Ignoring depreciation flatters the company that owns its equipment: the leaser’s cost of equipment sits in its operating costs, the owner’s in depreciation, which EBITDA leaves out.',
      2: 'Book value depends on the decision to own or lease, not on how good the businesses are.',
      3: 'Dividend yield reflects payout decisions and says little about operations.',
    },
    solution: 'The owner’s equipment cost appears as depreciation; the leaser’s as lease payments in operating costs. EBITDA removes only the first, so EV/EBITDA makes the owner look cheaper. EBIT charges both for their equipment.',
  },
  {
    id: 'f06-m4-7', lesson: 'relative-valuation', type: 'num', kind: 'numerical',
    prompt: 'A fictional regulated water company pays out 60% of its earnings, its dividends are expected to grow 4% a year for ever, and its shareholders require 9%. What P/E on next year’s earnings (the leading P/E) does the Gordon model justify? Give one decimal place.',
    answer: 12, check: () => 0.6 / (0.09 - 0.04), unit: '×', places: 1, tol: 0.05,
    wrong: [
      { value: 12.5, say: 'That is the trailing P/E, on this year’s earnings (× 1.04). The leading P/E divides by next year’s.' },
      { value: 20, say: 'That leaves out the payout: only 60% of earnings is paid as dividends.' },
    ],
    solution: 'P₀ = D₁ ÷ (r − g) and D₁ = 0.60 × E₁, so P₀ ÷ E₁ = 0.60 ÷ (0.09 − 0.04) = 12.0.',
  },
  {
    id: 'f06-m4-8', lesson: 'fundamental-analysis', type: 'num', kind: 'numerical',
    prompt: 'A fictional packaging company expects after-tax operating profit of $100 million next year, growing 2% a year for ever. New investment earns 12% and its WACC is 8%. Using the value-driver formula, what is its enterprise value, in $ millions?',
    answer: 1388.9, check: () => 100 * (1 - 0.02 / 0.12) / (0.08 - 0.02), unit: '$m', places: 1, tol: 1,
    wrong: [
      { value: 1666.7, say: 'That ignores the reinvestment growth needs: 2% growth at a 12% return takes a sixth of the profit each year.' },
      { value: 1250, say: 'That is the no-growth value, 100 ÷ 0.08. Growth at a return above the WACC adds to it.' },
    ],
    solution: 'Reinvestment = g ÷ RONIC = 0.02 ÷ 0.12 = 16.7% of profit. EV = 100 × (1 − 0.167) ÷ (0.08 − 0.02) = 83.3 ÷ 0.06 = $1,388.9 million, above the $1,250 million no-growth value because new investment earns more than it costs.',
  },
  {
    id: 'f06-m4-9', lesson: 'fundamental-analysis', type: 'fill', kind: 'conceptual',
    prompt: 'Choose the word that completes each blank.',
    text: 'If prices reflect all past prices and trading volume, the market is [[0]] efficient, and [[1]] analysis cannot be expected to beat it. If prices also reflect all published information, it is [[2]] efficient, and fundamental analysis of the published accounts cannot be expected to beat it after costs.',
    blanks: [
      { options: ['strong-form', 'weak-form', 'semi-strong-form'], answer: 1 },
      { options: ['technical', 'fundamental', 'credit'], answer: 0 },
      { options: ['weak-form', 'strong-form', 'semi-strong-form'], answer: 2 },
    ],
    solution: 'Weak-form efficiency covers past market data, ruling out technical analysis. Semi-strong efficiency covers all public information, ruling out profits from fundamental analysis of it. The strong form adds private information.',
  },
  {
    id: 'f06-m4-10', lesson: 'fundamental-analysis', type: 'mc', kind: 'applied',
    prompt: 'A software engineer who has picked three technology shares that doubled in a year plans to move her whole pension into five technology companies she follows, trading them weekly. Which pair of biases best describes the plan?',
    options: ['Overconfidence and familiarity bias', 'Loss aversion and the disposition effect', 'Home bias and survivorship bias', 'Anchoring and herd behaviour'],
    answer: 0,
    feedback: {
      1: 'Those are about holding losers too long; nothing here involves losses.',
      2: 'Home bias is a form of familiarity bias, but survivorship bias is a data problem, not an investor’s behaviour; the frequent trading on three successes points to overconfidence.',
      3: 'Neither is the main problem described: she is not fixing on a price or following a crowd.',
    },
    solution: 'Three wins in one year are read as skill (overconfidence), leading to weekly trading, which Barber and Odean found costly; concentrating in the industry she works in and knows is familiarity bias, and it ties her pension to the same sector as her salary.',
  },
  {
    id: 'f06-m4-11', lesson: 'fundamental-analysis', type: 'formula', kind: 'applied',
    prompt: 'The sheet holds an analyst’s estimate of a share’s intrinsic value (B1), its market price (B2) and the margin of safety she requires (B3). In B5, write a formula that returns the highest price at which she would buy.',
    sheet: { cells: { A1: 'Estimated value ($)', B1: 52, A2: 'Market price ($)', B2: 41.5, A3: 'Required margin of safety', B3: 0.25, A5: 'Highest buying price ($)' },
      vary: { B3: [0.2, 0.3] } },
    cell: 'B5', view: 'A1:B5', widths: { A: 26, B: 12 }, formats: { B1: '$#,##0.00', B2: '$#,##0.00', B3: '0%', B5: '$#,##0.00' },
    answer: '=B1*(1-B3)',
    wrong: [
      { formula: '=B2*(1-B3)', say: 'The margin is taken off the estimated value, not the price.' },
      { formula: '=B1/(1+B3)', say: 'That divides by 1 + margin. The margin is a share of the value: multiply by (1 − margin).' },
      { formula: '=1-B2/B1', say: 'That is the margin of safety the current price offers, not the highest buying price.' },
    ],
    solution: '<x>=B1*(1-B3)</x>: 52 × 0.75 = $39.00. The price of $41.50 offers a margin of only 1 − 41.5 ÷ 52 = 20%, less than she requires, so she waits.',
  },
];
