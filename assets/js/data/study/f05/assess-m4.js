// assess-m4.js — F05 module 4 test: Financing and payout (capital-structure, payout-policy, financial-planning).
// No hints. Each item has a full solution, shown when the student reviews the test. New questions, not copies of the
// lesson exercises. Every business named here is fictional; none of the items uses Lantern’s 2028 financing, cash
// budget, funds needed or dividend, which belong to the course project.
import * as CF from '../../../core/corpfin.js?v=30';

export const items = [
  {
    id: 'f05-m4-1', lesson: 'capital-structure', type: 'num', kind: 'numerical',
    prompt: 'Merrowfield Laundries (fictional) has no debt and its shareholders require 11%. In a world without taxes it borrows at 5% and uses the money to buy back shares until its debt equals its equity at market values. Under Modigliani and Miller, what return will its shareholders now require, as a percentage?',
    answer: 17, check: () => CF.mm({ Vu: 1, D: 0.5, rU: 0.11, rD: 0.05, tax: 0 }).rE * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 11, say: 'That is the unlevered cost of capital, which stays as the WACC. With half the firm financed by debt, equity carries all of the assets’ risk on half the base.' },
      { value: 14, say: 'That uses D/V (0.5) instead of D/E (1.0) in Proposition II.' },
      { value: 8, say: 'That averages the cost of debt and r_U; the cost of equity rises above r_U.' },
    ],
    solution: 'D/E = 1. r_E = r_U + (r_U − r_D) × D/E = 11% + (11% − 5%) × 1 = 17%. The WACC stays at 0.5 × 17% + 0.5 × 5% = 11%.',
  },
  {
    id: 'f05-m4-2', lesson: 'capital-structure', type: 'mc', kind: 'conceptual',
    prompt: 'In a study of a fictional industry, an analyst finds that the most profitable companies, which pay the most tax, have the lowest debt ratios. Which view of capital structure explains this most directly?',
    options: [
      'The pecking order: profitable firms fund investment from retained profit and so need less outside money',
      'The trade-off theory: profitable firms have the most taxable income to shield, so they should borrow the most',
      'Modigliani and Miller without taxes: capital structure is irrelevant, so any pattern is coincidence',
      'Agency theory: lenders refuse to lend to profitable firms because their managers have too much free cash',
    ],
    answer: 0,
    feedback: {
      1: 'That is what the trade-off theory predicts, the opposite of the finding; the pattern is a puzzle for it.',
      2: 'Proposition I says value does not depend on leverage, not that firms choose leverage at random; it doesn’t explain a systematic pattern.',
      3: 'Free cash flow is an argument for more debt, to discipline managers, not for lenders to refuse.',
    },
    solution: 'Under the pecking order, debt is the accumulated need for outside money. Profitable firms generate enough internally and so borrow little. The trade-off theory, which says profitable firms have the most taxable profit to shield, cannot explain it; Myers (1984) gives this as a prediction of the pecking order.',
  },
  {
    id: 'f05-m4-3', lesson: 'capital-structure', type: 'num', kind: 'applied',
    prompt: 'Copsewood Timber (fictional, listed) has 5,000,000 shares and no debt, and pays corporate tax at 21%. It announces that it will borrow $20,000,000, permanently, and use it to buy back shares. Under Modigliani and Miller with corporate tax, by how much should its share price rise on the announcement?',
    answer: 0.84, check: () => 0.21 * 20000000 / 5000000, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 4, say: 'That is the debt per share. The debt is used to buy shares at a fair price; only the tax shield is new value.' },
      { value: 0, say: 'That is the answer without taxes. With corporate tax, the present value of the interest tax shield, T × D, goes to the shareholders.' },
    ],
    solution: 'PV of the tax shield = T × D = 0.21 × 20,000,000 = $4,200,000. Spread over the 5,000,000 shares outstanding at the announcement: $0.84 a share. The buyback then takes place at the higher price.',
  },
  {
    id: 'f05-m4-4', lesson: 'capital-structure', type: 'classify', kind: 'conceptual',
    prompt: 'Tidecombe Hotels (fictional) has a bank loan with these terms. Classify each covenant.',
    items: [
      'Deliver audited financial statements within 120 days of each year end',
      'Pay no dividend while the loan is outstanding without the bank’s consent',
      'Keep EBITDA at least 4 times interest expense, tested every quarter',
      'Keep the hotels insured for their full replacement value',
      'Sell no hotel without the bank’s consent',
      'Keep net debt no more than 3.5 times EBITDA',
    ],
    categories: ['Affirmative: something the borrower must do', 'Negative: something it must not do', 'Financial: a ratio it must meet'],
    answer: [0, 1, 2, 0, 1, 2],
    feedback: {
      1: 'A limit on dividends restricts what the borrower may do: a negative covenant that protects the lenders from cash leaving before they are paid.',
      2: 'A coverage test is a financial (maintenance) covenant, checked at every test date.',
    },
    solution: 'Affirmative: audited accounts, insurance. Negative: no dividends or asset sales without consent. Financial: the coverage and leverage ratios.',
  },
  {
    id: 'f05-m4-5', lesson: 'payout-policy', type: 'num', kind: 'numerical',
    prompt: 'Cresswell Optics (fictional) has 4,000,000 shares at $25 and earnings of $12,000,000, which include $200,000 of after-tax interest on $10,000,000 of surplus cash. It spends the $10,000,000 buying back shares at $25. In a perfect market, what is its price-earnings ratio afterwards? Give two decimal places.',
    answer: 7.63, check: () => { const p = CF.payout({ shares: 4000000, price: 25, amount: 10000000, earnings: 12000000, lostIncome: 200000 }); return p.buyback.priceAfter / p.buyback.eps; }, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 8.33, say: 'That is the P/E before the buyback (25 ÷ 3.00). The buyback raises EPS while the price stays at $25.' },
      { value: 7.5, say: 'You kept the $200,000 of interest in earnings. Once the cash is spent it earns nothing: earnings fall to $11,800,000.' },
      { value: 6.86, say: 'You lowered the price as for a dividend ($22.50). A fair-price buyback leaves the price at $25: P/E = 25 ÷ EPS after.' },
    ],
    solution: 'Shares bought = 10,000,000 ÷ 25 = 400,000; left 3,600,000. Earnings = 11,800,000; EPS = $3.28 (3.2778). Price stays $25. P/E = 25 ÷ 3.2778 = 7.63, down from 8.33: the higher EPS is matched by a lower multiple.',
  },
  {
    id: 'f05-m4-6', lesson: 'payout-policy', type: 'mc', kind: 'applied',
    prompt: 'Thornleigh Foods (fictional), a US-listed company, has declared a dividend with a record date of Wednesday 14 June. Trades settle one business day after the trade, and the ex-dividend date is the record date. An investor buys shares on Wednesday 14 June. Does she receive the dividend?',
    options: [
      'No: she bought on the ex-dividend date, so the seller receives it',
      'Yes: she is on the register on the record date',
      'Yes, but only if she still holds the shares on the payment date',
      'No, because only shareholders on the declaration date receive a dividend',
    ],
    answer: 0,
    feedback: {
      1: 'A purchase on 14 June settles on 15 June, too late for the register that decides. That is why buyers on or after the ex-dividend date don’t get the dividend.',
      2: 'The entitlement is fixed by the register on the record date; selling before payment doesn’t lose it.',
      3: 'The declaration date is when the dividend is announced; the register on the record date decides who is paid.',
    },
    solution: 'With one-day settlement the ex-dividend date is the record date. A buyer must buy by the previous business day, 13 June, to be on the register at the end of 14 June.',
  },
  {
    id: 'f05-m4-7', lesson: 'payout-policy', type: 'mc', kind: 'conceptual',
    prompt: 'Ravenmoor Systems (fictional) believes its shares are worth $50 but they trade at $60. If it buys back shares at $60, what happens to the shareholders who do not sell, assuming the board is right about the value?',
    options: [
      'They lose: the company overpays by $10 for each share it buys',
      'They gain: fewer shares means a larger share of the earnings, so EPS rises',
      'Nothing changes for them, because a buyback never changes the value of the remaining shares',
      'They gain $10 a share, the difference between the market price and the value',
    ],
    answer: 0,
    feedback: {
      1: 'EPS may rise, but they have paid too much for it: the company’s value falls by more than the shares retired are worth.',
      2: 'That holds only at a fair price. At any other price, value moves between sellers and stayers.',
      3: 'The $10 goes the other way: from the stayers to the sellers.',
    },
    solution: 'A buyback at a fair price is neutral. Above value, the company hands $10 a share of value to each seller, at the expense of those who stay; below value, the stayers gain. That is why boards are told to buy back only when the shares are a good value, the most popular reason in the Brav survey.',
  },
  {
    id: 'f05-m4-8', lesson: 'financial-planning', type: 'num', kind: 'numerical',
    prompt: 'Saltings Bottling (fictional) sold $4,000,000 of drinks last year on a bottling plant that cost $2,000,000 and ran at 90% of its capacity. Its plan has sales rising to $4,800,000. Once the plant is full, more output needs more plant in the same proportion to sales as at full capacity. How much must Saltings spend on new plant to deliver the plan?',
    answer: 160000, check: () => { const full = 4000000 / 0.9; return Math.max(0, 2000000 * 4800000 / full - 2000000); }, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 400000, say: 'That grows the plant by the full 20% from today, ignoring the 10% of capacity standing idle.' },
      { value: 0, say: 'The plant can support $4,444,444 of sales at full stretch, less than the $4,800,000 planned.' },
      { value: 355556, say: 'That is the extra sales beyond capacity ($4,800,000 − $4,444,444), not the plant needed for them. Plant is 45% of sales at full capacity.' },
    ],
    solution: 'Full-capacity sales = 4,000,000 ÷ 0.9 = 4,444,444, so the plant supports 2,000,000 ÷ 4,444,444 = 45 cents of plant per dollar of sales when full. Plant needed for 4,800,000 = 0.45 × 4,800,000 = 2,160,000: $160,000 of new plant. Growing it with sales from today would have asked for $400,000.',
  },
  {
    id: 'f05-m4-9', lesson: 'financial-planning', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds a fictional firm’s net income, dividends and total assets at the end of the year. In B5, calculate its internal growth rate.',
    sheet: { cells: {
      A1: 'Net income ($)', B1: 300000,
      A2: 'Dividends ($)', B2: 120000,
      A3: 'Total assets at the end of the year ($)', B3: 2400000,
      A5: 'Internal growth rate',
    } },
    cell: 'B5', answer: '=((B1-B2)/B3)/(1-(B1-B2)/B3)',
    alt: ['=(B1/B3*(1-B2/B1))/(1-B1/B3*(1-B2/B1))', '=(B1-B2)/(B3-(B1-B2))', '=(B1-B2)/(B3-B1+B2)'],
    view: 'A1:B5', widths: { A: 36, B: 14 }, formats: { B1: '#,##0', B2: '#,##0', B3: '#,##0', B5: '0.00%' },
    wrong: [
      { formula: '=(B1-B2)/B3', say: 'That is ROA × b. The internal growth rate divides it by (1 − ROA × b).' },
      { formula: '=B1/B3', say: 'That is ROA. Only the retained part of the profit finances growth.' },
      { formula: '=(B1/B3*B2/B1)/(1-B1/B3*B2/B1)', say: 'That uses the payout ratio, B2/B1, in place of the retention ratio, 1 − B2/B1.' },
    ],
    solution: 'ROA × b = (300,000 − 120,000) ÷ 2,400,000 = 0.075. IGR = 0.075 ÷ 0.925 = 8.11%. Equivalently, retained earnings ÷ (assets at the end less retained earnings).',
  },
  {
    id: 'f05-m4-10', lesson: 'financial-planning', type: 'num', kind: 'applied',
    prompt: 'Kestrelby Tours (fictional) starts January with $20,000 of cash and nothing drawn on its line of credit, which charges 1.5% a month on the balance drawn at the start of each month. It keeps at least $8,000 of cash, drawing on the line when it would fall below that and repaying the line from any cash above it. January: receipts $30,000, payments $50,000. February: receipts $45,000, payments $32,000. How much cash will it have at the end of February?',
    answer: 12880, check: () => CF.cashBudget({ opening: 20000, receipts: [30000, 45000], payments: [50000, 32000], minimum: 8000, rate: 0.015 }).endCash, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 20880, say: 'That leaves the $8,000 drawn in January unpaid. Cash above the minimum repays the line first.' },
      { value: 13000, say: 'You left out February’s interest: 1.5% of the $8,000 drawn at the start of the month, $120.' },
      { value: 8000, say: 'The line is fully repaid in February, so the surplus beyond that stays as cash, above the minimum.' },
    ],
    solution: 'January: 20,000 + 30,000 − 50,000 = 0, so draw 8,000 to reach the minimum. February: interest 1.5% × 8,000 = 120; cash before financing = 8,000 + 45,000 − 32,000 − 120 = 20,880; repay the 8,000; cash at the end = $12,880 with nothing drawn.',
  },
  {
    id: 'f05-m4-11', lesson: 'financial-planning', type: 'mc', kind: 'applied',
    prompt: 'A fictional restaurant group earned net income of $400,000, paid no dividend, and ended the year with equity of $1,000,000 and total assets of $6,000,000, most of it leased restaurants. Its sustainable growth rate works out at about 67%. What is the best reading?',
    options: [
      'It is high because equity is thin: growing at 67% means adding about $5 of debt and leases per new $1 of equity',
      'The group can safely plan to grow by about two-thirds a year without raising any outside money',
      'The figure is wrong, because a sustainable growth rate cannot be higher than the return on assets',
      'It shows that the group should start paying dividends, since it retains more profit than it needs',
    ],
    answer: 0,
    feedback: {
      1: 'The SGR assumes the debt-to-equity ratio stays constant: debt and leases must grow with equity. That is outside money, from lenders and landlords.',
      2: 'The SGR uses ROE, which can far exceed ROA when leverage is high; the internal growth rate is the one tied to ROA.',
      3: 'The SGR says nothing about whether retained profit is surplus; with growth plans this large it is likely to be needed.',
    },
    solution: 'ROE = 400,000 ÷ 1,000,000 = 40% and b = 1, so SGR = 0.40 ÷ 0.60 = 67%: equity can grow 67% from retained profit (from $600,000 at the start of the year). Keeping the equity multiplier at 6 means each new dollar of equity brings five of debt and leases. Its internal growth rate, with ROA of 6.7%, is about 7.1%. The SGR is a consistency check, not a safe growth rate.',
  },
];
