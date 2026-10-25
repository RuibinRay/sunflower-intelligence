// assess-m1.js — F00 module 1 test: What finance is (finance-time-and-risk, finance-accounting-economics, decision-principles).
// No hints. Each item has a full solution, shown when the student reviews the test.

export const items = [
  {
    id: 'f00-m1-1', lesson: 'finance-time-and-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional university invests $5,000 of a prize fund at 4% a year, compounded once a year. How much will the fund hold after three years? Give the answer to the nearest cent.',
    answer: 5624.32, check: () => 5000 * 1.04 ** 3, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 5600, say: 'That is simple interest: 5,000 × (1 + 0.04 × 3). With annual compounding each year’s interest earns interest too: 5,000 × 1.04³.' },
      { value: 4444.98, say: 'That is the present value of $5,000 due in three years. Money invested today grows: multiply by 1.04³.' },
    ],
    solution: 'FV = PV(1 + r)ⁿ = 5,000 × 1.04³ = 5,000 × 1.124864 = $5,624.32.',
  },
  {
    id: 'f00-m1-2', lesson: 'finance-time-and-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional clothing brand will receive a certain payment of $8,000 in two years. At a discount rate of 5% a year, what is the payment worth today? Give the answer to the nearest cent.',
    answer: 7256.24, check: () => 8000 / 1.05 ** 2, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 8820, say: 'That is the future value of $8,000 today. A later payment is worth less today, so divide by 1.05².' },
      { value: 7619.05, say: 'That discounts for one year only. The payment is two years away: divide by 1.05 twice.' },
      { value: 7200, say: 'You subtracted 10% simple interest. Discounting divides by (1 + r)ⁿ.' },
    ],
    solution: 'PV = FV ÷ (1 + r)ⁿ = 8,000 ÷ 1.05² = 8,000 ÷ 1.1025 = $7,256.24.',
  },
  {
    id: 'f00-m1-3', lesson: 'finance-time-and-risk', type: 'mc', kind: 'applied',
    prompt: 'A game show contestant can take a certain $500 or flip a coin: heads wins $1,100, tails wins nothing. Which statement is correct?',
    options: [
      'The flip’s expected value is $550, yet a risk-averse contestant may still prefer the certain $500.',
      'The flip has an expected value of $1,100, its winning prize, so anyone sensible should flip rather than take $500.',
      'The two choices are worth exactly the same to every contestant, because their expected values are equal.',
      'The certain $500 has a higher expected value, because it carries no risk and the flip may pay nothing.',
    ],
    answer: 0,
    feedback: {
      1: '$1,100 is the best outcome, not the expected value. Weight it by its 50% probability: 0.5 × 1,100 + 0.5 × 0 = $550.',
      2: 'The expected values are not equal ($550 against $500), and even when they are, a risk-averse person prefers the certain amount.',
      3: 'A certain $500 has an expected value of exactly $500, less than the flip’s $550. Being safe does not raise an expected value; it is a separate attraction.',
    },
    solution: 'Expected value of the flip: 0.5 × 1,100 + 0.5 × 0 = $550, which is $50 more than the certain $500. That $50 is the premium on offer for bearing the risk. Whether it is enough depends on how risk averse the contestant is: someone who badly needs the $500 may sensibly take it.',
  },
  {
    id: 'f00-m1-4', lesson: 'finance-time-and-risk', type: 'classify', kind: 'applied',
    prompt: 'Match each decision to the branch of finance it belongs to.',
    items: [
      'An insurance company decides how much of its investment portfolio to hold in government bonds.',
      'A young nurse decides how much to pay into her retirement savings each month.',
      'A national government decides whether to borrow to pay for new hospitals.',
      'A battery-storage installer decides whether to lease or buy its delivery trucks.',
      'A couple compares two mortgages for their first home.',
    ],
    categories: ['Personal finance', 'Corporate finance', 'Investment finance', 'Public finance'],
    answer: [2, 0, 3, 1, 0],
    feedback: {
      0: 'The insurer is acting as an investor, choosing securities for a portfolio: investment finance.',
      2: 'A government borrowing and spending is public finance.',
      3: 'How a business acquires and pays for the assets it uses is corporate finance.',
    },
    solution: 'Insurer’s portfolio: investment finance. Nurse’s retirement saving and the couple’s mortgage: personal finance. Government borrowing for hospitals: public finance. Installer’s trucks: corporate finance.',
  },
  {
    id: 'f00-m1-5', lesson: 'finance-accounting-economics', type: 'mc', kind: 'conceptual',
    prompt: 'A company’s auditor and a bank’s credit analyst both read the company’s financial statements for last year. How do their purposes differ?',
    options: [
      'The auditor judges whether the statements fairly record the past under the accounting rules; the analyst uses them as evidence of whether the company can repay a loan.',
      'The auditor forecasts next year’s cash flows to see whether the company can borrow; the analyst checks that the statements follow US GAAP.',
      'Both do the same job, because both read the same statements for the same year and must reach the same conclusion about them.',
      'The analyst prepares the statements for the bank from the company’s records; the auditor then decides whether the bank should lend.',
    ],
    answer: 0,
    feedback: {
      1: 'That reverses the roles. Checking the record against the rules is accounting work (the audit); forecasting repayment is finance work.',
      2: 'Reading the same document for different purposes is exactly the point: one checks the record of the past, the other decides about the future.',
      3: 'The company’s management prepares its statements; the auditor gives an opinion on them, and the bank decides whether to lend.',
    },
    solution: 'The audit is accounting: is the record of the past faithful and prepared under the rules? The credit analysis is finance: given that record and the economic outlook, will the company’s future cash flows cover the loan?',
  },
  {
    id: 'f00-m1-6', lesson: 'finance-accounting-economics', type: 'num', kind: 'applied',
    prompt: 'A fictional yoga studio shows an accounting profit of $48,000 for the year. Its owner gave up a job paying $55,000 to run it, and the $40,000 she invested could have earned 3% a year in a safe deposit. What is the studio’s economic profit? (Enter a negative number for an economic loss.)',
    answer: -8200, check: () => 48000 - (55000 + 40000 * 0.03), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -7000, say: 'You left out the return the $40,000 could have earned: 3% of it is $1,200, another opportunity cost.' },
      { value: 8200, say: 'Check the sign: the opportunity costs ($56,200) exceed the accounting profit ($48,000).' },
      { value: 46800, say: 'You subtracted only the forgone return. The $55,000 salary she gave up is the larger opportunity cost.' },
    ],
    solution: 'Opportunity costs: 55,000 + 40,000 × 0.03 = 55,000 + 1,200 = $56,200. Economic profit: 48,000 − 56,200 = −$8,200. The studio is profitable in its accounts, but its owner would be better off, financially, in her old job.',
  },
  {
    id: 'f00-m1-7', lesson: 'finance-accounting-economics', type: 'classify', kind: 'conceptual',
    prompt: 'Which field does each task mainly belong to?',
    items: [
      'Estimating how many more rooms a hotel would fill if it cut its prices by 10%',
      'Recording a customer’s deposit for next month’s event as a liability',
      'Forecasting the national unemployment rate for next year',
      'Deciding whether a battery-storage installer should borrow to open a second depot, given the expected cash flows and their risk',
      'Preparing an airline’s annual report for its shareholders',
    ],
    categories: ['Accounting', 'Microeconomics', 'Macroeconomics', 'Finance'],
    answer: [1, 0, 2, 3, 0],
    feedback: {
      0: 'How buyers in one market respond to a price change is a question about demand: microeconomics.',
      2: 'National unemployment is an economy-wide measure: macroeconomics.',
      3: 'Weighing expected cash flows and risk to decide on borrowing and investing is finance.',
    },
    solution: 'Hotel prices and room demand: microeconomics. Recording the deposit and preparing the annual report: accounting. National unemployment: macroeconomics. The depot decision: finance.',
  },
  {
    id: 'f00-m1-8', lesson: 'decision-principles', type: 'multi', kind: 'applied',
    prompt: 'A fictional clothing brand is deciding whether to open a shop in a building it already owns. Which of these are incremental cash flows that belong in the decision? Select all that apply.',
    options: [
      'Rent of $36,000 a year that a tenant has offered for the building',
      'A $12,000 market study of the area, already paid for',
      'Wages of the shop’s staff',
      'Sales the brand’s online store would lose to the new shop',
      'A share of the chief executive’s salary, which will not change, allocated to the shop in the accounts',
      'Sales at the new shop',
    ],
    answer: [0, 2, 3, 5],
    feedback: {
      1: 'The study is paid for whether or not the shop opens: a sunk cost. Leave it out.',
      4: 'An allocation of a cost that does not change is not incremental, however the accounts label it.',
    },
    solution: 'Count the shop’s sales and staff wages, the online sales it takes away (a side effect) and the $36,000 of rent given up by using the building (an opportunity cost). Leave out the market study (sunk) and the allocated share of an unchanged salary.',
  },
  {
    id: 'f00-m1-9', lesson: 'decision-principles', type: 'num', kind: 'numerical',
    prompt: 'Anyone can borrow or lend at a risk-free rate of 4% a year. A certain promise to pay $5,200 in one year is for sale at $4,950. If you borrow $4,950 at 4% to buy it, how much riskless profit do you have after a year, once the loan is repaid?',
    answer: 52, check: () => 5200 - 4950 * 1.04, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 250, say: 'That ignores the interest on the borrowed $4,950. Repay 4,950 × 1.04 = $5,148, not $4,950.' },
      { value: 50, say: 'That is the gap between the price and the no-arbitrage price ($5,000) today. After a year it has grown by 4%.' },
    ],
    solution: 'The no-arbitrage price is 5,200 ÷ 1.04 = $5,000, so the promise is $50 too cheap. Borrow $4,950, buy the promise, collect $5,200 and repay 4,950 × 1.04 = $5,148, leaving $52 with no risk and none of your own money. Buyers would bid the price up to $5,000.',
  },
  {
    id: 'f00-m1-10', lesson: 'decision-principles', type: 'mc', kind: 'conceptual',
    prompt: 'Why does holding shares in twenty companies from many industries reduce risk much more than holding shares in twenty companies from the same industry?',
    options: [
      'Firms in different industries are less likely to move together, so losses on some are more often offset by gains on others.',
      'Twenty companies from many industries remove all risk, including the risk of a recession that hits the whole economy at once.',
      'Companies in different industries always have higher expected returns, which make up for any losses on the others.',
      'Risk falls with the number of companies held, whatever they are, so twenty shares reduce it by the same amount either way.',
    ],
    answer: 0,
    feedback: {
      1: 'Diversification cannot remove systematic risk: in a recession, most companies’ results fall together.',
      2: 'Diversification reduces risk; it does not raise expected returns.',
      3: 'The number matters less than how closely the holdings move together. Twenty shares in one industry share that industry’s risks.',
    },
    solution: 'Diversification works because investments do not move in lockstep. Companies in different industries are less closely related, so their specific (unsystematic) risks partly cancel. Companies in one industry face the same shocks, so they offer little diversification. Neither portfolio escapes systematic risk.',
  },
  {
    id: 'f00-m1-11', lesson: 'decision-principles', type: 'num', kind: 'numerical',
    prompt: 'In its first quarter a fictional consultancy delivers work invoiced at $20,000 and collects $12,000 of it; the rest is due next quarter. It pays $14,000 of expenses in cash and records $1,000 of depreciation. Its accounting profit for the quarter is $5,000. By how much does its cash change? (Enter a decrease as a negative number.)',
    answer: -2000, check: () => 12000 - 14000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 5000, say: 'That is the accounting profit. Cash counts only what was collected ($12,000) and paid ($14,000).' },
      { value: 6000, say: 'You counted the whole $20,000 invoiced as cash. Only $12,000 has been collected.' },
      { value: -3000, say: 'Depreciation is not a payment, so it does not reduce cash.' },
    ],
    solution: 'Cash in: $12,000. Cash out: $14,000. Change: 12,000 − 14,000 = −$2,000. Profit is 20,000 − 14,000 − 1,000 = $5,000. The firm is profitable but its cash fell, because $8,000 is still owed by customers.',
  },
];
