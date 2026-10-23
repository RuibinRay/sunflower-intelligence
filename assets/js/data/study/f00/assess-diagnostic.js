// assess-diagnostic.js — F00 course diagnostic: four items per module, written to separate a student who already
// knows a module from one who doesn’t (each item needs the module’s method, not just its vocabulary).
// New questions, not copies of lesson exercises, module-test or project items. No hints; solutions show in review.
// Every business and person here is fictional; real bodies (FDIC) appear only with facts the lessons state and cite.

export const items = [
  // ================================================================ Module 1: what finance is
  {
    id: 'f00-dg-1', lesson: 'finance-time-and-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional university will need $15,000 in four years to replace laboratory equipment. How much must it deposit today, in an account paying 3% a year compounded once a year, to have exactly that amount then? Give the answer to the nearest cent.',
    answer: 13327.31, check: () => 15000 / 1.03 ** 4, unit: '$', places: 2, tol: 0.2,
    wrong: [
      { value: 16882.63, say: 'That is what $15,000 deposited today would grow to. The university needs $15,000 later, so bring it back to today: divide by 1.03⁴.' },
      { value: 13392.86, say: 'You divided by 1 + 4 × 0.03 = 1.12, which is simple interest. Interest is compounded, so divide by 1.03⁴ = 1.125509.' },
      { value: 13200, say: 'You took 12% off $15,000. Discounting divides by the growth factor; it does not subtract a percentage.' },
      { value: 14563.11, say: 'That discounts for one year only. The money is needed in four years.' },
    ],
    solution: 'This is a present value: PV = FV ÷ (1 + r)ⁿ = 15,000 ÷ 1.03⁴ = 15,000 ÷ 1.125509 = $13,327.31. Check: 13,327.31 × 1.125509 ≈ $15,000 after four years.',
  },
  {
    id: 'f00-dg-2', lesson: 'finance-time-and-risk', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional investor is valuing a promise to receive $10,000 in five years. Which one of these changes, taken on its own, would raise the promise’s value to her today?',
    options: [
      'The return she could earn elsewhere on a safe investment falls, so her discount rate falls',
      'She learns that the payer is more likely to default than she had thought',
      'The payment is delayed from five years to six',
      'She becomes more risk averse, so she demands a larger risk premium for waiting on this payer',
    ],
    answer: 0,
    feedback: {
      1: 'A less certain payment is worth less, not more: a riskier payer is discounted at a higher rate (or its expected payment is lower), so the present value falls.',
      2: 'Money that arrives later is worth less today, because there is an extra year of discounting: 10,000 ÷ (1 + r)⁶ is smaller than 10,000 ÷ (1 + r)⁵.',
      3: 'A larger risk premium raises the discount rate, which lowers the present value.',
    },
    solution: 'PV = 10,000 ÷ (1 + r)⁵. The present value rises only if the discount rate falls or the payment comes sooner. The discount rate is the risk-free rate plus a risk premium, so a lower safe rate lowers it; more default risk, a longer wait or a larger premium all lower the present value.',
  },
  {
    id: 'f00-dg-3', lesson: 'finance-accounting-economics', type: 'num', kind: 'applied',
    prompt: 'A fictional florist’s accounts for last year show revenue of $150,000 and expenses of $112,000, including $7,000 of depreciation on its van and refrigerators. Its owner gave up a $40,000 salary to run it, and the $25,000 she has invested in the shop could have earned 4% a year in a safe deposit. What was the shop’s economic profit? (Enter a negative number for an economic loss.)',
    answer: -3000, check: () => (150000 - 112000) - (40000 + 25000 * 0.04), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 4000, say: 'You started from operating cash flow (38,000 + 7,000 = 45,000). Economic profit starts from accounting profit, which already deducts depreciation.' },
      { value: -2000, say: 'You left out the return the $25,000 could have earned elsewhere: 4% of it is $1,000, another opportunity cost.' },
      { value: 3000, say: 'Check the sign: the opportunity costs ($41,000) are larger than the accounting profit ($38,000).' },
      { value: 37000, say: 'You subtracted only the forgone return. The $40,000 salary she gave up is the larger opportunity cost.' },
    ],
    solution: 'Accounting profit = 150,000 − 112,000 = $38,000 (depreciation is a recorded expense, so it is already deducted). Opportunity costs not recorded = 40,000 + 25,000 × 0.04 = $41,000. Economic profit = 38,000 − 41,000 = −$3,000. The shop is profitable in its accounts, but the owner would be slightly better off in her old job with her money in the deposit.',
  },
  {
    id: 'f00-dg-4', lesson: 'decision-principles', type: 'num', kind: 'applied',
    prompt: 'A fictional independent cinema is deciding whether to open a café in its foyer, in space it now rents to a florist for $9,000 a year. The café would bring in $60,000 a year of cash from sales and pay $38,000 a year in cash for staff and supplies. Some customers would buy café snacks instead of popcorn, cutting the cash the cinema makes on popcorn by $4,000 a year. A $2,000 design study has already been paid for, and the cinema’s accounts would charge the café $6,000 a year of the manager’s salary, which will not change. What is the café’s incremental cash flow per year?',
    answer: 9000, check: () => 60000 - 38000 - 4000 - 9000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 18000, say: 'You left out the florist’s rent. Using the space for the café means giving up $9,000 a year: an opportunity cost, which counts.' },
      { value: 13000, say: 'You left out the popcorn margin the café takes away. A side effect on another part of the business belongs to the decision.' },
      { value: 3000, say: 'You subtracted the manager’s salary allocation. The salary is paid either way, so it is not incremental.' },
      { value: 7000, say: 'You subtracted the design study. It is already paid whatever the cinema decides (a sunk cost), and it is not a yearly cost in any case. (If you didn’t, check that you counted the lost popcorn margin and left out the manager’s salary.)' },
    ],
    solution: 'Count only what changes: sales +60,000, cash costs −38,000, lost popcorn margin −4,000 (a side effect) and rent forgone −9,000 (an opportunity cost): 60,000 − 38,000 − 4,000 − 9,000 = $9,000 a year. Leave out the design study (sunk) and the allocated salary (unchanged).',
  },

  // ================================================================ Module 2: the language of finance
  {
    id: 'f00-dg-5', lesson: 'capital-and-liquidity', type: 'mc', kind: 'applied',
    prompt: 'A fictional garden centre has current assets of $300,000 (cash $60,000, receivables $40,000, inventory $200,000) and current liabilities of $200,000. It borrows $50,000 on a five-year bank loan, repayable in full at the end, and spends all of it at once on extra plants for its inventory. Compared with before, what happens to its working capital, current ratio and quick ratio?',
    options: [
      'Working capital rises by $50,000; the current ratio rises from 1.5 to 1.75; the quick ratio stays at 0.5',
      'All three are unchanged, because the money borrowed was spent straight away',
      'Working capital rises by $50,000 and the quick ratio rises from 0.5 to 0.75, because the loan added cash',
      'Working capital is unchanged and the current ratio falls to 1.4, because the business owes $50,000 more',
    ],
    answer: 0,
    feedback: {
      1: 'Cash came in and went out again, but it was swapped for inventory, a current asset, while the loan is not due within the year. Current assets rose by $50,000 and current liabilities did not.',
      2: 'The cash was spent on plants, so cash is back at $60,000. The extra $50,000 sits in inventory, which the quick ratio leaves out.',
      3: 'That treats the loan as a current liability. It is repayable in five years, so it is noncurrent and does not enter the ratios.',
    },
    solution: 'The loan is noncurrent, so current liabilities stay at $200,000. Current assets rise to 300,000 + 50,000 = $350,000 (inventory up; cash in and then out). Working capital: 350,000 − 200,000 = $150,000, up $50,000. Current ratio: 350,000 ÷ 200,000 = 1.75. Quick ratio: (60,000 + 40,000) ÷ 200,000 = 0.5, unchanged. On the quick measure the centre is no more liquid: paying its bills still depends on selling plants.',
  },
  {
    id: 'f00-dg-6', lesson: 'value-and-valuation-words', type: 'num', kind: 'numerical',
    prompt: 'A fictional regional supermarket chain has 40 million shares trading at $15.00, debt of $350 million, cash of $50 million and EBITDA of $80 million. What is its EV/EBITDA multiple? Give two decimal places.',
    answer: 11.25, check: () => (40 * 15 + 350 - 50) / 80, unit: '×', places: 2, tol: 0.005,
    wrong: [
      { value: 7.5, say: 'You divided market capitalisation ($600 million) by EBITDA. EBITDA belongs to lenders and shareholders, so divide enterprise value by it.' },
      { value: 12.5, say: 'You added the cash. A buyer of the business receives the cash, so enterprise value subtracts it.' },
      { value: 3.75, say: 'You subtracted the debt and added the cash: that is the step from enterprise value back to equity, not the other way round.' },
    ],
    solution: 'Market capitalisation = 15.00 × 40 = $600 million. Enterprise value = 600 + 350 − 50 = $900 million. EV/EBITDA = 900 ÷ 80 = 11.25.',
  },
  {
    id: 'f00-dg-7', lesson: 'interest-and-inflation', type: 'num', kind: 'numerical',
    prompt: 'A fictional online bank pays 4.8% a year compounded monthly on its savings account. If inflation is 3% a year, what is the exact real return on the account per year? Use the account’s effective annual rate, and give a percentage to two decimal places.',
    answer: 1.85, check: () => (((1 + 0.048 / 12) ** 12) / 1.03 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 1.8, say: 'That is the shortcut 4.8 − 3. Convert the quoted rate to its effective annual rate first, then divide: (1 + EAR) ÷ 1.03 − 1.' },
      { value: 1.75, say: 'That uses the quoted 4.8% in the exact formula. Monthly compounding makes the effective rate higher: about 4.91%.' },
      { value: 1.91, say: 'That subtracts inflation from the effective rate. The exact real return divides: 1.04907 ÷ 1.03 − 1.' },
      { value: 4.91, say: 'That is the effective annual rate, a nominal return. The real return removes the 3% inflation.' },
    ],
    solution: 'Monthly rate = 4.8% ÷ 12 = 0.4%. EAR = 1.004¹² − 1 ≈ 4.907%. Real return = 1.04907 ÷ 1.03 − 1 ≈ 0.0185, or 1.85% a year.',
  },
  {
    id: 'f00-dg-8', lesson: 'value-and-valuation-words', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional chain of gyms reports EBITDA of $12 million, and its chief executive tells investors that the business “generates $12 million of cash a year”. Which reply is most accurate?',
    options: [
      'EBITDA ignores interest, tax, equipment replacement and working capital, so the cash it can pay out is likely lower',
      'That is right: EBITDA is the cash a chain like this has left once all of its operating costs have been paid in full',
      'EBITDA overstates cash only because it is measured before staff wages and the rent on the gyms',
      'EBITDA understates cash, because depreciation on the gym equipment has already been subtracted',
    ],
    answer: 0,
    feedback: {
      1: 'EBITDA stops before interest, taxes and depreciation: all three stand for cash the business must pay or spend to keep going.',
      2: 'Wages and rent are operating costs, subtracted before EBITDA is reached.',
      3: 'It is the other way round: EBITDA adds depreciation and amortisation back, so they have not been subtracted.',
    },
    solution: 'EBITDA = EBIT + D&A. It leaves out interest and tax, which are paid in cash; by adding back depreciation it ignores the equipment (here, gym machines and fit-outs) that must be replaced; and it ignores cash tied up in working capital. It is also not a GAAP measure. It is a starting point for comparing similar businesses, not a measure of cash available.',
  },

  // ================================================================ Module 3: markets and the people in them
  {
    id: 'f00-dg-9', lesson: 'financial-markets', type: 'classify', kind: 'conceptual',
    prompt: 'Is each transaction direct finance or indirect finance?',
    items: [
      'A saver deposits $5,000 in a credit union, which lends the money to local businesses',
      'A retired teacher buys bonds newly issued by a city to pay for a bridge',
      'A worker buys shares in a mutual fund, which invests in many companies’ shares',
      'A family buys shares in a company’s initial public offering',
      'Lantern borrows $10,000 from Coastline Bank, which is funded by deposits such as Ana’s',
    ],
    categories: ['Direct finance', 'Indirect finance'],
    answer: [1, 0, 1, 0, 1],
    feedback: {
      0: 'The saver’s claim is on the credit union, not on the businesses it lends to: an intermediary stands in the middle.',
      1: 'The teacher holds the city’s own bonds, a claim on the borrower itself: direct finance.',
      2: 'The worker owns shares in the fund, which in turn owns the companies’ shares. The fund is an intermediary.',
      3: 'Investment banks run the sale, but the family ends up holding the company’s own shares: direct finance.',
      4: 'Ana’s deposit is a claim on Coastline, not on Lantern: the bank is the intermediary.',
    },
    solution: 'Direct finance: the saver holds the borrower’s own security (the city’s bonds, the company’s new shares). Indirect finance: the saver holds a claim on an intermediary that holds the claim on the borrower (the credit union, the mutual fund, Coastline Bank).',
  },
  {
    id: 'f00-dg-10', lesson: 'market-participants', type: 'num', kind: 'applied',
    prompt: 'Leila (fictional) has these deposits. At Seabright Bank: a savings account of $180,000 and a certificate of deposit of $120,000, both in her own name, and a joint account of $480,000 that she owns equally with her sister. At Pinewood Bank: a savings account of $200,000 in her own name. Both banks are FDIC-insured, and the standard limit is $250,000 per depositor, per insured bank, for each ownership category. How much of the money in these accounts is uninsured?',
    answer: 50000, check: () => (180000 + 120000 - Math.min(180000 + 120000, 250000)) + 2 * (480000 / 2 - Math.min(480000 / 2, 250000)) + (200000 - Math.min(200000, 250000)), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 0, say: 'Her two single accounts at Seabright are in the same ownership category at the same bank, so they are added together ($300,000) before the $250,000 limit applies.' },
      { value: 280000, say: 'The joint account is insured up to $250,000 for each co-owner’s share. Each sister owns $240,000, so all $480,000 is insured.' },
      { value: 250000, say: 'You added her single accounts at both banks together. Each insured bank has its own limit, so the $200,000 at Pinewood is insured separately.' },
    ],
    solution: 'Work bank by bank and category by category. Seabright, single accounts: 180,000 + 120,000 = $300,000, insured to $250,000, so $50,000 uninsured. Seabright, joint account: each co-owner’s share is 480,000 ÷ 2 = $240,000, under the limit, so all of it is insured. Pinewood, single account: $200,000, all insured. Uninsured in total: $50,000.',
  },
  {
    id: 'f00-dg-11', lesson: 'governance-and-agency', type: 'num', kind: 'numerical',
    prompt: 'A fictional company owes its bank $50,000, due at the end of the year. A safe plan would leave the company worth $65,000 at that date for certain. A risky plan would leave it worth $120,000 with probability 30% or $20,000 with probability 70%. What is the shareholders’ expected payoff under the risky plan?',
    answer: 21000, check: () => 0.3 * Math.max(120000 - 50000, 0) + 0.7 * Math.max(20000 - 50000, 0), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 0, say: 'You let the shareholders’ payoff go negative in the bad outcome. With limited liability it is max(V − D, 0), which is 0 there, not −30,000.' },
      { value: 50000, say: 'That is the expected value of the whole company. Shareholders receive only what is left after the $50,000 debt.' },
      { value: 15000, say: 'That is the shareholders’ payoff under the safe plan (65,000 − 50,000).' },
      { value: 36000, say: 'You weighted the whole $120,000 by 30%. Shareholders get only what is left after the debt: 120,000 − 50,000.' },
    ],
    solution: 'Good outcome: max(120,000 − 50,000, 0) = 70,000. Bad outcome: max(20,000 − 50,000, 0) = 0. Expected: 0.3 × 70,000 + 0.7 × 0 = $21,000, against $15,000 under the safe plan. Yet the company’s expected value falls from $65,000 to 0.3 × 120,000 + 0.7 × 20,000 = $50,000, and the bank’s expected payoff from $50,000 to 0.3 × 50,000 + 0.7 × 20,000 = $29,000. That is risk shifting.',
  },
  {
    id: 'f00-dg-12', lesson: 'market-participants', type: 'mc', kind: 'conceptual',
    prompt: 'A market maker quotes a fictional company’s shares at $31.95 bid and $32.05 ask. An investor sells 200 shares to the market maker straight away. How much does she receive, and why?',
    options: [
      '$6,390: she sells at the bid, the price at which the dealer buys',
      '$6,410: she sells at the ask, the higher of the two prices',
      '$6,400: trades take place at the midpoint of the bid and the ask',
      '$6,390 less a commission, because the market maker acts as her agent',
    ],
    answer: 0,
    feedback: {
      1: 'The ask is the price at which the dealer sells to investors. An investor who sells receives the dealer’s buying price, the bid.',
      2: 'The midpoint is a reference price. A dealer buys at its bid and sells at its ask; the gap is how it is paid.',
      3: 'A market maker is a dealer, acting as a principal: it buys into its own inventory and is paid through the spread, not a commission. Commissions are how brokers, acting as agents, are paid.',
    },
    solution: 'The bid is the price at which the dealer will buy, so the investor receives 200 × 31.95 = $6,390. Had she bought, she would have paid the ask: 200 × 32.05 = $6,410. The $0.10 gap per share is the market maker’s reward for standing ready to trade.',
  },
];

// Start at module N if the student scores at least 75% on the items for the modules before N
// (four items per module, so one slip is allowed per module).
export const route = [
  { module: 2, ifAtLeast: 0.75 },
  { module: 3, ifAtLeast: 0.75 },
];
