// assess-m2.js — F03 module 2 test: Liquidity, solvency and efficiency (liquidity, solvency-and-leverage,
// efficiency-and-working-capital). New questions, not copies of lesson exercises: other fictional businesses, other
// angles (a transaction that lowers the ratio it seems to help, a loan’s effect on coverage, US GAAP against IFRS 16,
// a nine-month period, the cash value of supplier terms). Lantern’s figures come from case.js. No hints.
import { PERIODS, COMPARATIVE } from './case.js?v=22';

const P27 = PERIODS[2027];
const b27 = (label) => COMPARATIVE.balance.find((r) => r[0] === label)[2];

export const items = [
  // ---------------------------------------------------------------- liquidity
  {
    id: 'f03-m2-1', lesson: 'liquidity', type: 'mc', kind: 'conceptual',
    prompt: 'Which transaction raises a business’s quick ratio while leaving its current ratio unchanged?',
    options: [
      'Selling inventory for cash at its cost',
      'Paying a supplier’s invoice in cash',
      'Buying inventory from a supplier on 30-day credit',
      'Paying next year’s insurance premium in advance',
    ],
    answer: 0,
    feedback: {
      1: 'Paying a supplier lowers current assets and current liabilities together, so the current ratio changes too (unless it is exactly 1).',
      2: 'Inventory is not a quick asset, so the quick ratio falls as current liabilities rise; the current ratio moves too.',
      3: 'Cash becomes a prepayment: current assets are unchanged, but quick assets fall.',
    },
    solution: 'Selling stock at cost swaps one current asset (inventory) for another (cash) of the same amount, so total current assets and the current ratio stay the same, while quick assets rise by the cash received.',
  },
  {
    id: 'f03-m2-2', lesson: 'liquidity', type: 'num', kind: 'numerical',
    prompt: 'Fellside Ski Hire, a fictional business, has current assets of $120,000 and current liabilities of $150,000. It borrows $50,000 on a three-year loan, with nothing repayable in the first year, and holds the cash. What is its current ratio afterwards? Give two decimal places.',
    answer: 1.13, check: () => (120000 + 50000) / 150000, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.85, say: 'The loan is not due within the year, so it does not join current liabilities. Only current assets change.' },
      { value: 0.8, say: 'That is the ratio before the loan. The cash received is a current asset.' },
    ],
    solution: 'Current assets become 120,000 + 50,000 = 170,000; current liabilities stay at 150,000 because the loan is noncurrent. Current ratio = 170,000 ÷ 150,000 = 1.13.',
  },
  {
    id: 'f03-m2-3', lesson: 'liquidity', type: 'num', kind: 'applied',
    prompt: 'Suppose the law firm had paid Lantern its $30,840 for 2027 on 30 December 2027, and Lantern had used $24,000 of the cash at once to repay its line of credit in full. Starting from Lantern’s reported current assets of $59,104 and current liabilities of $114,537, what would its current ratio have been at 31 December? Give two decimal places.',
    answer: 0.39, check: () => (P27.currentAssets - b27('Line of Credit')) / (P27.currentLiabilities - b27('Line of Credit')), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.52, say: 'Collecting the contract asset leaves current assets unchanged, but repaying the line takes $24,000 off both totals, and a ratio below 1 then falls.' },
      { value: 0.65, say: 'Repaying the line uses cash: current assets fall by $24,000 as well as current liabilities.' },
      { value: 0.25, say: 'The $30,840 does not leave current assets: it turns from a contract asset into cash.' },
    ],
    solution: 'Collecting the $30,840 turns a contract asset into cash: current assets stay at 59,104. Repaying the line takes 24,000 off both totals: 35,104 ÷ 90,537 = 0.39. The quick and cash ratios would improve, but the current ratio falls, because it was below 1 to begin with.',
  },
  // ---------------------------------------------------------------- solvency-and-leverage
  {
    id: 'f03-m2-4', lesson: 'solvency-and-leverage', type: 'num', kind: 'applied',
    prompt: 'Brackenridge Foods, a fictional company, earns EBIT of $900,000 a year and pays interest of $150,000. It plans a new $2,000,000 loan at 6% to build a warehouse, which will not add to EBIT in its first year. What will its interest coverage be in that year? Give two decimal places.',
    answer: 3.33, check: () => 900000 / (150000 + 2000000 * 0.06), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 6, say: 'That is the coverage before the loan. Add the new interest, 2,000,000 × 6% = 120,000.' },
      { value: 7.5, say: 'That divides by the new interest only. Coverage uses all interest expense: 150,000 + 120,000.' },
    ],
    solution: 'New interest = 2,000,000 × 0.06 = 120,000; total interest = 270,000. Coverage = 900,000 ÷ 270,000 = 3.33, down from 6.00.',
  },
  {
    id: 'f03-m2-5', lesson: 'solvency-and-leverage', type: 'mc', kind: 'conceptual',
    prompt: 'Two identical cafés lease identical premises on identical terms. One reports under US GAAP (ASC 842, an operating lease); the other under IFRS 16. Which statement about their reported figures is correct?',
    options: [
      'The IFRS café reports higher EBITDA and higher interest expense',
      'The US GAAP café reports higher EBITDA, because its lease cost is below EBITDA',
      'Only the IFRS café shows a lease liability on its balance sheet',
      'Their EBITDA is identical, because both record a right-of-use asset',
    ],
    answer: 0,
    feedback: {
      1: 'Under ASC 842 the operating lease cost is a single operating expense, so it reduces EBITDA; that is why the US GAAP café’s EBITDA is lower.',
      2: 'Both frameworks put a lease liability and a right-of-use asset on the balance sheet.',
      3: 'The balance sheets are similar; the income statements differ. Under IFRS 16 the lease cost becomes depreciation and interest, both excluded from EBITDA.',
    },
    solution: 'Under IFRS 16 the lessee records depreciation of the right-of-use asset and interest on the liability, so neither reduces EBITDA and interest expense rises. Under ASC 842 an operating lease cost is a single straight-line operating expense, which reduces EBITDA and leaves interest expense unchanged. Comparisons across the frameworks need a lease adjustment.',
  },
  {
    id: 'f03-m2-6', lesson: 'solvency-and-leverage', type: 'num', kind: 'numerical',
    prompt: 'A fictional company’s total liabilities are 1.5 times its equity. What is its debt ratio (total liabilities ÷ total assets), as a percentage?',
    answer: 60, check: () => 1.5 / (1 + 1.5) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 150, say: 'That is liabilities to equity as a percentage. The debt ratio divides by total assets, which equal liabilities plus equity: 1.5 ÷ 2.5.' },
      { value: 40, say: 'That is equity’s share of total assets. Liabilities’ share is 1.5 ÷ 2.5.' },
    ],
    solution: 'For each $1 of equity there is $1.50 of liabilities, so total assets are $2.50. Debt ratio = 1.5 ÷ 2.5 = 60.0%.',
  },
  {
    id: 'f03-m2-7', lesson: 'solvency-and-leverage', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional restaurant group has a shareholders’ deficit after years of share buybacks. Which measures can an analyst still interpret? Select all that apply.',
    options: [
      'Interest coverage (EBIT ÷ interest expense)',
      'Net debt ÷ EBITDA',
      'Total liabilities ÷ total assets',
      'Debt ÷ equity',
      'Return on equity',
      'The equity multiplier',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'With negative equity the ratio turns negative and stops meaning anything.',
      4: 'Dividing net income by negative equity gives a number with no sensible reading.',
      5: 'Total assets ÷ negative equity is negative: meaningless.',
    },
    solution: 'Measures that don’t divide by equity still work: coverage, net debt to EBITDA and the debt ratio (above 100% with negative equity). Debt to equity, return on equity and the equity multiplier all divide by equity and lose their meaning.',
  },
  // ---------------------------------------------------------------- efficiency-and-working-capital
  {
    id: 'f03-m2-8', lesson: 'efficiency-and-working-capital', type: 'num', kind: 'numerical',
    prompt: 'Redcap Brewing, a fictional brewery, began trading on 1 April 2027. For the nine months to 31 December its cost of goods sold was $270,000, and its inventory at 31 December was $60,000. What are its inventory days, using the days in the period? Give one decimal place.',
    answer: 60.8, check: () => 60000 / 270000 * (365 * 9 / 12), unit: 'days', places: 1, tol: 0.05,
    wrong: [
      { value: 81.1, say: 'Nine months of cost of goods sold belongs with nine months of days, 273.75, not 365.' },
      { value: 30.4, say: 'There is no opening balance to average with: the business started with no stock. Use the closing balance alone, not half of it.' },
    ],
    solution: 'Days in the period = 365 × 9 ÷ 12 = 273.75. With no opening balance, use closing inventory: DIO = 60,000 ÷ 270,000 × 273.75 = 60.8 days. Annualising the cost of goods sold (360,000) and using 365 gives the same answer.',
  },
  {
    id: 'f03-m2-9', lesson: 'efficiency-and-working-capital', type: 'num', kind: 'applied',
    prompt: 'Oakhurst Print, a fictional printer, buys $1,095,000 of paper and ink a year on credit and pays its suppliers in 30 days. Its main supplier offers 45-day terms if Oakhurst signs a two-year supply contract. How much cash would the longer terms release, once, in dollars?',
    answer: 45000, check: () => 1095000 / 365 * (45 - 30), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 135000, say: 'That is the payables balance at 45 days. The cash released is the increase from 30 to 45 days.' },
      { value: 90000, say: 'That is the payables balance at 30 days. Find how much larger it would be at 45.' },
    ],
    solution: 'Purchases per day = 1,095,000 ÷ 365 = 3,000. Fifteen more days of credit = 15 × 3,000 = $45,000, released once. Whether the contract is worth it depends on its prices and on what the cash would otherwise cost to borrow.',
  },
  {
    id: 'f03-m2-10', lesson: 'efficiency-and-working-capital', type: 'num', kind: 'applied',
    prompt: 'Lantern’s 2027 working-capital days were: receivables 37.2 (invoiced catering), inventory 17.1 and payables 18.0. If in 2028 it pays suppliers at the full 30 days Kilnworth allows, with the other days unchanged, what will its cash conversion cycle be?',
    answer: 24.3, check: () => 37.2 + 17.1 - 30, unit: 'days', places: 1, tol: 0.05,
    wrong: [
      { value: 36.3, say: 'That is 2027’s cycle. Replace the 18.0 days of payables with 30.' },
      { value: 84.3, say: 'Payables days are subtracted: suppliers finance part of the cycle.' },
      { value: 54.3, say: 'That is the operating cycle, before supplier credit.' },
    ],
    solution: 'CCC = DIO + DSO − DPO = 17.1 + 37.2 − 30 = 24.3 days, 12 days shorter than in 2027.',
  },
  {
    id: 'f03-m2-11', lesson: 'efficiency-and-working-capital', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional juice bar chain sells almost entirely for cash and card at the counter but invoices a few office clients monthly. An analyst calculates its receivables days on total revenue and finds 3 days. What is the main problem with that figure?',
    options: [
      'It understates how long the office clients take to pay',
      'It overstates collection time, because card payments take two days to settle',
      'It should use cost of goods sold, because receivables are carried at cost',
      'It should use closing receivables, because averages hide late payers',
    ],
    answer: 0,
    feedback: {
      1: 'Card settlement is a small effect; the large one is dividing by sales that never became receivables.',
      2: 'Receivables are carried at the invoiced amount, so the matching flow is sales on credit, not cost.',
      3: 'Averages are the better divisor for a flow earned over the year; the problem is the flow you divide by.',
    },
    solution: 'Only the invoiced office sales create receivables. Dividing those receivables by all revenue, mostly paid at once, makes collection look almost instant. Use the invoiced sales, or say that the figure understates the days.',
  },
];
