// assess-m2.js — F00 module 2 test: The language of finance (capital-and-liquidity, value-and-valuation-words,
// interest-and-inflation). No hints. Each item has a full solution, shown when the student reviews the test.
// All businesses named here are fictional; Harbourline's figures are not reused, so the test checks the method.

export const items = [
  {
    id: 'f00-m2-1', lesson: 'capital-and-liquidity', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional brewery is financed by a $50,000 bank loan and $50,000 of shares bought by an investor. After a disastrous year it is wound up, and $30,000 is left once its suppliers and staff have been paid. How is the $30,000 divided?',
    options: [
      'All $30,000 goes to the bank; the shareholder receives nothing',
      'It is split equally: $15,000 to the bank and $15,000 to the shareholder',
      'All $30,000 goes to the shareholder, who owns the business',
      'The shareholder is repaid first, because equity is more expensive than debt',
    ],
    answer: 0,
    feedback: {
      1: 'Claims are not shared equally. Lenders rank ahead of shareholders, whose claim is residual: only what is left after all creditors.',
      2: 'Owning the business means owning what is left after its debts are paid. Here nothing is left.',
      3: 'Equity costs more precisely because it is paid last. Its higher expected return compensates for this risk.',
    },
    solution: 'The bank’s claim ($50,000) ranks ahead of the shareholder’s residual claim, so the bank takes all $30,000 and still loses $20,000. The shareholder receives nothing. This is why shareholders expect a higher return than lenders.',
  },
  {
    id: 'f00-m2-2', lesson: 'capital-and-liquidity', type: 'num', kind: 'numerical',
    prompt: 'A fictional university bookshop has cash of $40,000, receivables of $15,000 and inventory of $145,000. Its current liabilities are $125,000. What is its quick ratio? Give two decimal places.',
    answer: 0.44, check: () => (40000 + 15000) / 125000, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.6, say: 'That is the current ratio. The quick ratio leaves out inventory.' },
      { value: 0.32, say: 'You left out the receivables. Amounts customers owe are counted as quick assets.' },
    ],
    solution: 'Quick ratio = (40,000 + 15,000) ÷ 125,000 = 0.44. The current ratio is 200,000 ÷ 125,000 = 1.6, but without selling books the shop could cover less than half of what it owes within the year: its liquidity depends on its inventory.',
  },
  {
    id: 'f00-m2-3', lesson: 'capital-and-liquidity', type: 'classify', kind: 'applied',
    prompt: 'A fictional furniture maker has a current ratio of 1.5. What does each transaction, taken on its own, do to the current ratio?',
    items: [
      'A customer pays an invoice it owed',
      'The firm pays a supplier it owed, from cash',
      'The firm buys timber on 30-day credit',
      'The firm borrows on a five-year loan, repayable in one sum, and keeps the cash',
      'The firm buys a new saw for cash',
    ],
    categories: ['Rises', 'Falls', 'No change'],
    answer: [2, 0, 1, 0, 1],
    feedback: {
      0: 'Cash rises and receivables fall by the same amount: total current assets are unchanged.',
      1: 'Current assets and current liabilities fall by the same amount. With the ratio above 1, that raises it.',
      2: 'Inventory and payables rise by the same amount. With the ratio above 1, that pulls it down towards 1.',
      3: 'Cash (current) rises while the loan is noncurrent, so current liabilities do not change.',
      4: 'Cash (current) falls; the saw is a noncurrent asset.',
    },
    solution: 'Collecting a receivable: no change (one current asset becomes another). Paying a supplier: rises (equal falls on both sides of a ratio above 1). Buying timber on credit: falls (equal rises on both sides). Long-term borrowing: rises (cash up, current liabilities unchanged). Buying a saw for cash: falls (a current asset becomes a noncurrent one).',
  },
  {
    id: 'f00-m2-4', lesson: 'capital-and-liquidity', type: 'num', kind: 'numerical',
    prompt: 'A fictional bicycle shop is financed with $100,000 of capital: $40,000 borrowed at 5% a year and $60,000 of the owner’s equity. This year it earns operating profit (before interest) of $9,000. Ignoring tax, what return does the owner earn on her equity, in percent? Give one decimal place.',
    answer: 11.7, check: () => (9000 - 40000 * 0.05) / 60000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 9, say: 'That is the return on all $100,000 of capital. The owner’s return is what is left after interest, divided by her equity.' },
      { value: 15, say: 'You forgot the $2,000 of interest due to the lender.' },
    ],
    solution: 'Interest = 40,000 × 5% = $2,000. Left for the owner: 9,000 − 2,000 = $7,000. Return on equity = 7,000 ÷ 60,000 ≈ 11.7%. The business earned 9% on its capital, more than the 5% it pays the lender, so leverage raised the owner’s return above 9%.',
  },
  {
    id: 'f00-m2-5', lesson: 'value-and-valuation-words', type: 'num', kind: 'numerical',
    prompt: 'A fictional airline has 300 million shares trading at $12.00, debt of $2,900 million and cash of $700 million. What is its enterprise value, in $ millions?',
    answer: 5800, check: () => 12 * 300 + 2900 - 700, unit: '$m', places: 0, tol: 0.5,
    wrong: [
      { value: 3600, say: 'That is the market capitalisation. Enterprise value adds the debt and subtracts the cash.' },
      { value: 7200, say: 'You added the cash. A buyer receives the cash, so subtract it.' },
      { value: 1400, say: 'You reversed the signs: subtracted the debt and added the cash. A buyer takes on the debt (add it) and receives the cash (subtract it).' },
    ],
    solution: 'Market cap = 12 × 300 = $3,600 million. EV = 3,600 + 2,900 − 700 = $5,800 million. Lenders’ net claim (2,900 − 700 = $2,200 million) is about 38% of enterprise value, a large share, which is common when aircraft are financed with debt.',
  },
  {
    id: 'f00-m2-6', lesson: 'value-and-valuation-words', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these multiples pairs a measure of value with a measure of earnings that belongs to the same group of investors?',
    options: [
      'Enterprise value ÷ EBITDA',
      'Market capitalisation ÷ EBITDA',
      'Enterprise value ÷ net income',
      'Share price ÷ EBITDA per share',
    ],
    answer: 0,
    feedback: {
      1: 'Market capitalisation belongs to shareholders, but EBITDA is earned before the lenders’ interest. The ratio makes heavily indebted firms look cheap.',
      2: 'Net income is after interest and belongs to shareholders; enterprise value includes the lenders’ claim. The ratio makes indebted firms look expensive.',
      3: 'This is market capitalisation ÷ EBITDA, per share: the same mismatch.',
    },
    solution: 'Enterprise value belongs to lenders and shareholders together, and EBITDA is earned before interest, so it also belongs to both. Market capitalisation should be paired with net income (P/E) instead.',
  },
  {
    id: 'f00-m2-7', lesson: 'value-and-valuation-words', type: 'num', kind: 'applied',
    prompt: 'A fictional regional bus operator has EBITDA of $40 million, debt of $90 million, cash of $15 million and 15 million shares. Comparable operators trade at 7.5 times EBITDA. What value per share does that imply? Give dollars and cents.',
    answer: 15, check: () => (7.5 * 40 - 90 + 15) / 15, unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 20, say: 'That is enterprise value per share. Subtract the debt and add the cash before dividing by the shares.' },
      { value: 14, say: 'You subtracted the debt but did not add the cash, which belongs to the shareholders.' },
    ],
    solution: 'Implied EV = 7.5 × 40 = $300 million. Equity value = 300 − 90 + 15 = $225 million. Per share = 225 ÷ 15 = $15.00. A multiple of 6.5× or 8.5× would give $12.33 or $17.67: the choice of peers drives the answer.',
  },
  {
    id: 'f00-m2-8', lesson: 'value-and-valuation-words', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional software company’s market capitalisation is six times the book value of its equity. Which of these help explain the gap? Select all that apply.',
    options: [
      'The balance sheet records most assets at what they cost, not what they are worth now',
      'Valuable things the company built itself, such as its software and customer base, are largely not recorded as assets',
      'Investors expect strong future earnings, which the share price reflects and the balance sheet does not',
      'Book value includes the company’s debt, which makes it larger than market value',
      'Market capitalisation is calculated from the balance sheet, so the two should be equal',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'Book value of equity is assets minus liabilities: debt is subtracted, not included. In any case, book value here is the smaller number.',
      4: 'Market capitalisation comes from the share price, set by investors trading in the market, not from the accounts.',
    },
    solution: 'Book value looks back: it records assets mostly at historical cost and leaves out much internally built value. Market capitalisation looks forward: it reflects investors’ expectations of future earnings. For a software company, whose main assets are code and customers, the gap is often large.',
  },
  {
    id: 'f00-m2-9', lesson: 'interest-and-inflation', type: 'num', kind: 'numerical',
    prompt: 'You deposit $4,000 for two years at 6% a year compounded monthly. What is the balance at the end? Give dollars and cents.',
    answer: 4508.64, check: () => 4000 * (1 + 0.06 / 12) ** (12 * 2), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 4494.4, say: 'That is annual compounding. Use the monthly rate (0.5%) for 24 months.' },
      { value: 4480, say: 'That is simple interest. Interest is added to the balance every month.' },
    ],
    solution: 'Monthly rate = 6% ÷ 12 = 0.5%; months = 24. Balance = 4,000 × 1.005²⁴ ≈ $4,508.64.',
  },
  {
    id: 'f00-m2-10', lesson: 'interest-and-inflation', type: 'num', kind: 'applied',
    prompt: 'A fictional barista’s salary rises from $50,000 to $51,000 (2%) in a year in which prices rise by 3.5%. What is the exact real change in her salary, in percent? Give two decimal places and use a minus sign if it fell.',
    answer: -1.45, check: () => (1.02 / 1.035 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: -1.5, say: 'That is the approximation (2 − 3.5). Use 1.02 ÷ 1.035 − 1 for the exact figure.' },
      { value: 2, say: 'That is the nominal rise. The real change allows for the 3.5% rise in prices.' },
      { value: 1.45, say: 'Check the sign: prices rose faster than her salary, so its purchasing power fell.' },
    ],
    solution: 'Real change = 1.02 ÷ 1.035 − 1 ≈ −0.0145, or −1.45%. Her new salary buys what about 51,000 ÷ 1.035 ≈ $49,275 bought a year ago: a pay rise in dollars, a pay cut in purchasing power.',
  },
  {
    id: 'f00-m2-11', lesson: 'interest-and-inflation', type: 'mc', kind: 'applied',
    prompt: 'A fictional small business can borrow for a year, repaying everything at the end, at 8.0% a year compounded quarterly or at 8.2% a year compounded annually. Ignoring fees, which is cheaper?',
    options: [
      'The 8.2% annual loan: the quarterly loan’s effective annual rate is about 8.24%',
      'The 8.0% quarterly loan, because its quoted rate is lower',
      'They cost exactly the same',
      'The quarterly loan, because more frequent compounding always costs the borrower less',
    ],
    answer: 0,
    feedback: {
      1: 'Quoted rates with different compounding cannot be compared directly. Convert both to effective annual rates.',
      2: 'Their effective annual rates differ: about 8.24% against 8.20%.',
      3: 'More frequent compounding raises the effective cost for a borrower, because interest is charged on interest sooner.',
    },
    solution: 'Quarterly loan: EAR = (1 + 0.08 ÷ 4)⁴ − 1 = 1.02⁴ − 1 ≈ 8.24%. Annual loan: EAR = 8.20%. The annual loan is slightly cheaper despite its higher quoted rate.',
  },
];
