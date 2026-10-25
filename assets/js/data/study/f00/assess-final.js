// assess-final.js — F00 cumulative final: 24 items, every lesson at least twice, a third each conceptual, numerical
// and applied, several combining ideas from different lessons. New questions, not copies of lesson exercises,
// module-test, diagnostic or project items. No hints; solutions show in review. 70% passes.
// Businesses and people are fictional; Lantern’s and Harbourline’s later events are hypothetical (“Suppose…”) and
// agree with case.js. Real bodies (FDIC) appear only with facts the lessons state and cite.

export const items = [
  // ---------------------------------------------------------------- finance-time-and-risk
  {
    id: 'f00-fn-1', lesson: 'finance-time-and-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional prize lets the winner choose $500,000 today or $180,000 at the end of each of the next three years. At a discount rate of 5% a year, what is the three-payment option worth today? Give the answer to the nearest dollar.',
    answer: 490185, check: () => 180000 / 1.05 + 180000 / 1.05 ** 2 + 180000 / 1.05 ** 3, unit: '$', places: 0, tol: 10,
    wrong: [
      { value: 540000, say: 'That adds the three payments as if they all arrived today. Amounts at different dates must be moved to the same date first: discount each one.' },
      { value: 466472, say: 'You discounted all three payments for three years. The first arrives in one year and the second in two, so they are discounted less.' },
      { value: 155491, say: 'That is the present value of the last payment only. Add the present values of all three.' },
      { value: 171429, say: 'That is the present value of the first payment only. Add the present values of all three.' },
    ],
    solution: 'Discount each payment by its own number of years: 180,000 ÷ 1.05 = 171,428.57; 180,000 ÷ 1.05² = 163,265.31; 180,000 ÷ 1.05³ = 155,490.77. Total ≈ $490,185. That is less than $500,000, so at 5% the lump sum today is worth more, although the three payments add up to $540,000.',
  },
  {
    id: 'f00-fn-2', lesson: 'finance-time-and-risk', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional fund manager says: “Next year Fund A will return somewhere between +5% and +25%. It can’t lose money, so it is riskless.” In the sense finance uses the word, is she right?',
    options: [
      'No: risk is any chance that the outcome differs from what is expected, so a 5% to 25% range is risk',
      'Yes: in finance, risk means the chance of losing money, and this fund’s worst outcome is still a gain',
      'Yes: an investment whose expected return is well above zero cannot sensibly be called risky',
      'No: an investment is risky only when its expected return is below the risk-free rate, as it may be here',
    ],
    answer: 0,
    feedback: {
      1: 'That is the everyday meaning. Finance counts surprises in both directions, because a wide spread of outcomes is itself what makes planning hard.',
      2: 'Expected return and risk are different things. Risky investments usually have higher expected returns, not lower: that is the risk premium.',
      3: 'Risk is about the spread of outcomes, not about how the expected return compares with the risk-free rate. A risky investment normally offers more than the risk-free rate, not less.',
    },
    solution: 'In finance, risk is the possibility that an outcome will differ from what you expect, for better or for worse. A fund whose return could be anything from 5% to 25% is uncertain, so it is risky, even though it cannot lose money. A truly riskless investment pays a known amount, as a risk-free deposit does.',
  },

  // ---------------------------------------------------------------- finance-accounting-economics
  {
    id: 'f00-fn-3', lesson: 'finance-accounting-economics', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional dental practice reports an accounting profit of $95,000 for the year, yet a financial adviser tells the dentist who owns it that the practice made an economic loss. Which statement must then be true?',
    options: [
      'The salary and investment return the dentist gives up to run the practice exceed $95,000 a year',
      'The accounts must contain an error, because one year’s results cannot show both a profit and a loss',
      'The practice’s operating cash flow must have been negative, since economic profit is measured in cash',
      'The practice’s depreciation must have exceeded $95,000, since economic profit deducts it a second time',
    ],
    answer: 0,
    feedback: {
      1: 'Both figures can be right: they answer different questions. The accounts leave out opportunity costs because no transaction records them.',
      2: 'Economic profit starts from accounting profit, not from cash flow, so it is not a cash measure. Cash flow could be well above $95,000 and the economic loss would remain.',
      3: 'Depreciation is already deducted to reach the $95,000, and economic profit does not deduct it again. The gap between the two measures is the unrecorded opportunity costs.',
    },
    solution: 'Economic profit = accounting profit − opportunity costs not recorded. It is negative only if those opportunity costs (the dentist’s forgone salary and the forgone return on her money) exceed the $95,000 accounting profit. The practice covers its recorded costs but not what its owner gives up to run it.',
  },
  {
    id: 'f00-fn-4', lesson: 'finance-accounting-economics', type: 'num', kind: 'numerical',
    prompt: 'A fictional laundrette’s accounts for last year show revenue of $200,000, expenses paid in cash of $158,000 and depreciation of $12,000. Customers paid in cash and every bill was paid as it arrived. For next year, the owner assumes that general inflation will raise her cash costs by 4%, and she plans to raise her prices by 5% with no change in the number of customers. Depreciation stays at $12,000. What is her forecast operating cash flow for next year?',
    answer: 45680, check: () => 200000 * 1.05 - 158000 * 1.04, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 33680, say: 'That subtracts depreciation, which gives next year’s accounting profit. Depreciation uses no cash in the year, so operating cash flow leaves it out.' },
      { value: 42000, say: 'That is last year’s operating cash flow. A forecast starts there but adjusts for what is expected to change: higher prices and higher costs.' },
      { value: 52000, say: 'You raised the revenue but not the costs. The inflation assumption raises cash costs by 4%: 158,000 × 1.04.' },
      { value: 43680, say: 'You raised revenue by 4%. The price rise is 5%; the 4% applies to costs.' },
    ],
    solution: 'Last year: accounting profit 200,000 − 158,000 − 12,000 = $30,000; operating cash flow 30,000 + 12,000 = $42,000. Next year: revenue 200,000 × 1.05 = $210,000; cash costs 158,000 × 1.04 = $164,320; operating cash flow 210,000 − 164,320 = $45,680. The accounts supply the starting point, a macroeconomic assumption moves the costs, and finance turns both into a forecast of cash.',
  },

  // ---------------------------------------------------------------- decision-principles
  {
    id: 'f00-fn-5', lesson: 'decision-principles', type: 'num', kind: 'applied',
    prompt: 'Copperleaf Brewing, a fictional craft brewery, is considering a canning line. The equipment costs $400,000 today. In each of the next three years the line would bring in $320,000 of cash from canned beer and cost $110,000 in extra cash costs, and some customers would switch from Copperleaf’s bottled beer, cutting its cash from bottles by $40,000 a year. The line would occupy a warehouse that Copperleaf could otherwise rent out for $30,000 a year. Last year it paid $25,000 for a market study, and its accounts would charge the line $50,000 a year of head-office costs that will not change. At a discount rate of 8% a year, what is the present value of the line’s incremental cash flows minus the cost of the equipment? Give the answer to the nearest dollar (negative if the line would destroy value).',
    answer: -39206, check: () => [1, 2, 3].reduce((s, n) => s + (320000 - 110000 - 40000 - 30000) / 1.08 ** n, 0) - 400000, unit: '$', places: 0, tol: 15,
    wrong: [
      { value: 38106, say: 'You left out the warehouse rent. Using the warehouse means giving up $30,000 a year: an opportunity cost, and incremental even though no cash changes hands.' },
      { value: 63877, say: 'You left out the lost bottle sales. A side effect elsewhere in the business is part of the decision.' },
      { value: -168061, say: 'You charged the line the $50,000 of head-office costs. They are paid whether or not the line is built, so they are not incremental.' },
      { value: 20000, say: 'You added three years of $140,000 without discounting. Cash in later years is worth less today: divide each year’s cash by 1.08 for each year of waiting.' },
      { value: -64206, say: 'You subtracted the $25,000 market study. It was paid last year whatever Copperleaf decides now: a sunk cost.' },
    ],
    solution: 'Incremental cash each year: 320,000 − 110,000 − 40,000 (lost bottle sales) − 30,000 (rent forgone) = $140,000. Leave out the study (sunk) and the head-office charge (unchanged). Present value: 140,000 ÷ 1.08 + 140,000 ÷ 1.08² + 140,000 ÷ 1.08³ ≈ 129,629.63 + 120,027.43 + 111,136.51 ≈ $360,793.58 (adding the unrounded figures). Minus the $400,000 cost: about −$39,206. On these estimates the line would destroy value, although its cash flows add up to more than its cost.',
  },
  {
    id: 'f00-fn-6', lesson: 'decision-principles', type: 'mc', kind: 'conceptual',
    prompt: 'Why do investors expect a risk premium for bearing systematic risk but not for bearing unsystematic risk?',
    options: [
      'Unsystematic risk can be diversified away cheaply, so no one needs paying to bear it; systematic risk cannot',
      'Unsystematic risk does not move a company’s share price, so investors who hold it bear no real risk',
      'Systematic risk can be removed by holding enough shares, and investors are paid for the time and effort of doing so',
      'Regulators require companies to pay investors a premium for market-wide risk but not for company-specific risk',
    ],
    answer: 0,
    feedback: {
      1: 'It can: a product recall or a lost customer can send one company’s share price down sharply. But it tends to be offset across a diversified portfolio.',
      2: 'That reverses the two. Systematic risk, such as a recession, hits nearly all investments together, so diversification cannot remove it.',
      3: 'No regulation sets risk premiums. They arise because investors who cannot avoid a risk demand to be paid for bearing it.',
    },
    solution: 'Unsystematic (specific) risk belongs to one company or industry and largely cancels out across many holdings, so an investor who chooses to bear it could have avoided it at little cost; markets do not pay for it. Systematic risk, such as a recession or a change in interest rates, remains however many investments are held, so investors demand a premium for bearing it.',
  },
  {
    id: 'f00-fn-7', lesson: 'decision-principles', type: 'num', kind: 'applied',
    prompt: 'Suppose a fictional events company starts the year with $5,000 in the bank. From January onwards it invoices $10,000 of events every month, which customers pay two months later (January’s invoices in March, and so on), and it pays $7,000 of costs in cash every month. It records $500 of depreciation a month, so its accounting profit is $2,500 every month. How much extra cash, for example from a credit line, must it arrange so that its bank balance is never below zero at the end of January, February or March?',
    answer: 9000, check: () => -Math.min(5000 - 7000, 5000 - 2 * 7000, 5000 - 3 * 7000 + 10000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 0, say: 'The company is profitable every month, but profit is not cash: no customer pays until March, while $7,000 goes out every month.' },
      { value: 2000, say: 'That covers January only. By the end of February the balance has fallen to −$9,000.' },
      { value: 6000, say: 'That is the balance at the end of March, after January’s invoices are paid. The low point comes a month earlier.' },
      { value: 10000, say: 'Depreciation is not a payment, so it does not reduce the bank balance.' },
      { value: 14000, say: 'You left out the $5,000 the company starts the year with.' },
    ],
    solution: 'Track cash, not profit. End of January: 5,000 − 7,000 = −2,000. End of February: −2,000 − 7,000 = −9,000. End of March: −9,000 + 10,000 (January’s invoices) − 7,000 = −6,000. The low point is −$9,000, so the company needs at least $9,000 of extra cash, for example a credit line arranged in advance, although it earns $2,500 of profit every month. That is a liquidity problem in a profitable business.',
  },

  // ---------------------------------------------------------------- capital-and-liquidity
  {
    id: 'f00-fn-8', lesson: 'capital-and-liquidity', type: 'num', kind: 'numerical',
    prompt: 'A fictional furniture retailer has cash of $80,000, receivables of $40,000, inventory of $180,000 and current liabilities of $200,000. Before renewing a guarantee, its supplier asks it to raise its quick ratio to at least 0.8. How much would it need to borrow on a five-year loan, repayable at the end and kept as cash, to bring its quick ratio to exactly 0.8?',
    answer: 40000, check: () => 0.8 * 200000 - (80000 + 40000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 0, say: 'That would follow from the current ratio (300,000 ÷ 200,000 = 1.5), which counts inventory. The quick ratio leaves inventory out and is only 0.6.' },
      { value: 200000, say: 'You treated the loan as a current liability. A five-year loan is noncurrent, so current liabilities stay at $200,000.' },
      { value: 80000, say: 'You left out the receivables. Amounts customers owe count as quick assets.' },
    ],
    solution: 'Quick ratio now = (80,000 + 40,000) ÷ 200,000 = 0.6. The loan adds cash but no current liability, so the target needs quick assets of 0.8 × 200,000 = $160,000: borrow 160,000 − 120,000 = $40,000. The retailer is more liquid, but it now owes more and pays more interest every year.',
  },
  {
    id: 'f00-fn-9', lesson: 'capital-and-liquidity', type: 'mc', kind: 'conceptual',
    prompt: 'Two analysts work from the same balance sheet of a fictional company: interest-bearing debt of $240 million, other liabilities of $180 million and shareholders’ equity of $300 million. One reports a debt-to-equity ratio of 0.8, the other 1.4. Which explanation is right?',
    options: [
      'The first divides interest-bearing debt by equity, the second all liabilities by equity; both are used',
      'One of them has made an arithmetic error, since the debt-to-equity ratio has a single agreed definition',
      'The second used the market value of the equity rather than its book value from the balance sheet',
      'The first divided equity by debt, turning the ratio upside down, while the second divided debt by equity correctly',
    ],
    answer: 0,
    feedback: {
      1: 'Both are correct calculations: 240 ÷ 300 = 0.8 and (240 + 180) ÷ 300 = 1.4. Definitions of the ratio vary, which is why comparisons need care.',
      2: 'Market capitalisation is usually larger than book equity, which would make the ratio smaller, not larger; and both figures can be reproduced from the $300 million in the balance sheet.',
      3: 'Equity divided by debt would be 300 ÷ 240 = 1.25, which neither analyst reported.',
    },
    solution: 'Debt only: 240 ÷ 300 = 0.8. Total liabilities: (240 + 180) ÷ 300 = 1.4. Some analysts put only interest-bearing debt in the numerator; others, including OpenStax’s Principles of Finance, use total liabilities. Before comparing two firms’ leverage, check that the same definition was used.',
  },
  {
    id: 'f00-fn-10', lesson: 'capital-and-liquidity', type: 'mc', kind: 'applied',
    prompt: 'Desmond (fictional) is a self-employed electrician whose income varies from month to month. He wants to keep $9,000, about four months of essential spending, as an emergency fund, and he expects inflation of about 3% a year. The banks mentioned are FDIC-insured, and all rates are fictional. Which home for the money best fits what an emergency fund is for?',
    options: [
      'A savings account paying 3.5% a year, variable, from which he can withdraw any amount at any time',
      'Banknotes kept at home, because cash is the most liquid asset there is',
      'A five-year certificate of deposit paying 4.5% a year, with a penalty of twelve months’ interest for early withdrawal',
      'A stock-market index fund with an expected return of about 7% a year',
    ],
    answer: 0,
    feedback: {
      1: 'Cash is perfectly liquid, but it earns nothing: with 3% inflation its purchasing power falls by about 2.9% a year (1 ÷ 1.03 − 1), and banknotes can be lost or stolen.',
      2: 'The higher rate is earned only if the money stays for five years. An emergency fund may well be needed early, and a year’s interest as a penalty would wipe out much of the extra return.',
      3: 'The higher expected return is a reward for risk: the fund could be well down exactly when he needs the money. It is an investment, not a deposit, so FDIC insurance does not cover it.',
    },
    solution: 'An emergency fund must be liquid (reachable quickly at full value) and safe in dollars, and ideally should keep its purchasing power. The savings account is all three: withdrawable at any time, an insured deposit, and a real return of about 1.035 ÷ 1.03 − 1 ≈ 0.49% a year. Its one risk is that the variable rate could be cut. Cash loses purchasing power, the certificate locks the money up, and the index fund can fall in value just when the money is needed.',
  },

  // ---------------------------------------------------------------- value-and-valuation-words
  {
    id: 'f00-fn-11', lesson: 'value-and-valuation-words', type: 'num', kind: 'applied',
    prompt: 'Suppose Millbrook Bakeries, a fictional bakery chain, has EBITDA of $5 million, debt of $34 million and cash of $2 million. After two poor years it sells its whole operating business to a rival for 6 times EBITDA, paid in cash, and uses that money and the cash it already held to pay its lenders. How much do the lenders receive, in $ millions?',
    answer: 32, check: () => Math.min(6 * 5 + 2, 34), unit: '$m', places: 0, tol: 0.05,
    wrong: [
      { value: 34, say: 'The lenders are owed $34 million, but there is only 30 + 2 = $32 million to pay them. Lenders receive the smaller of what there is and what they are owed.' },
      { value: 30, say: 'You left out the $2 million of cash the chain already held. It is available to pay the lenders too.' },
      { value: -2, say: 'That is enterprise value minus debt plus cash, the value left for shareholders: here it is negative, so shareholders get nothing. The question asks what the lenders receive.' },
      { value: 0, say: 'That is what the shareholders receive. Lenders rank first and take all that there is, up to what they are owed.' },
    ],
    solution: 'The business sells for 6 × 5 = $30 million, the enterprise value the buyer pays. With the $2 million of cash, $32 million is available against $34 million of debt. Lenders receive min(32, 34) = $32 million and lose $2 million; shareholders receive max(32 − 34, 0) = $0. Going from enterprise value to equity (30 − 34 + 2 = −2) shows the same thing: the debt exceeds what the business is worth, and with limited liability the shareholders’ claim cannot fall below zero.',
  },
  {
    id: 'f00-fn-12', lesson: 'value-and-valuation-words', type: 'classify', kind: 'conceptual',
    prompt: 'Suppose Harbourline Roasters (fictional) uses $40 million of its $45 million of cash to repay $40 million of its long-term debt, and its share price does not change. What happens to each measure?',
    items: [
      'Market capitalisation',
      'Net debt',
      'Enterprise value',
      'Debt-to-equity ratio (debt ÷ book equity)',
      'Current ratio',
      'Next year’s net income, if nothing else changes',
    ],
    categories: ['Rises', 'Falls', 'No change'],
    answer: [2, 2, 2, 1, 1, 0],
    feedback: {
      1: 'Debt falls by $40 million and so does cash, so debt minus cash stays at $165 million: 210 − 45 before, 170 − 5 after.',
      2: 'Enterprise value is market capitalisation plus net debt, and neither has changed: 765 + 165 = $930 million. The operating business is the same.',
      3: 'Debt falls to $170 million while book equity stays at $300 million (assets and liabilities both fell by $40 million), so the ratio falls from 0.7 to about 0.57.',
      4: 'Cash is a current asset, while the debt repaid was long-term: current assets fall to $140 million and current liabilities stay at $120 million, so the ratio falls from 1.5 to about 1.17.',
      5: 'Deposits usually earn less than the debt costs, so using $40 million of cash to repay $40 million of debt cuts the interest paid by more than the interest income it gives up: with everything else unchanged, profit after interest and tax rises.',
    },
    solution: 'Market cap is unchanged (given). Net debt: (210 − 40) − (45 − 40) = $165 million, unchanged, so enterprise value stays at $930 million. Debt-to-equity falls (170 ÷ 300 ≈ 0.57). The current ratio falls (140 ÷ 120 ≈ 1.17), because cash was used to pay a noncurrent liability. Net income rises, because interest falls. Harbourline is less leveraged but also less liquid; the value of its operations has not changed.',
  },
  {
    id: 'f00-fn-13', lesson: 'value-and-valuation-words', type: 'num', kind: 'numerical',
    prompt: 'A fictional theme-park operator reports net income of $45 million, after income tax of $15 million, interest of $20 million and depreciation and amortisation of $40 million. Its market capitalisation is $900 million, its debt $400 million and its cash $60 million. What is its EV/EBITDA multiple? Give two decimal places.',
    answer: 10.33, check: () => (900 + 400 - 60) / (45 + 15 + 20 + 40), unit: '×', places: 2, tol: 0.005,
    wrong: [
      { value: 7.5, say: 'You divided market capitalisation by EBITDA. Pair EBITDA with enterprise value, which includes the lenders’ claim.' },
      { value: 15.5, say: 'You divided by EBIT ($80 million). EBITDA also adds back the $40 million of depreciation and amortisation.' },
      { value: 27.56, say: 'You divided enterprise value by net income. Net income belongs to shareholders only; build EBITDA by adding back tax, interest and D&A.' },
      { value: 11.33, say: 'You added the cash. A buyer receives the cash, so enterprise value subtracts it.' },
    ],
    solution: 'Build EBITDA up from net income: 45 + 15 (tax) + 20 (interest) + 40 (D&A) = $120 million. Enterprise value = 900 + 400 − 60 = $1,240 million. EV/EBITDA = 1,240 ÷ 120 ≈ 10.33.',
  },

  // ---------------------------------------------------------------- interest-and-inflation
  {
    id: 'f00-fn-14', lesson: 'interest-and-inflation', type: 'num', kind: 'numerical',
    prompt: 'You save $5,000 for three years in a fictional account paying 4.2% a year compounded monthly, while prices rise by 3% a year. What will the balance at the end buy, in today’s dollars? Give dollars and cents.',
    answer: 5189.0, check: () => 5000 * (1 + 0.042 / 12) ** 36 / 1.03 ** 3, unit: '$', places: 2, tol: 0.15,
    wrong: [
      { value: 5670.16, say: 'That is the balance in dollars after three years. To find what it buys in today’s prices, divide by 1.03³.' },
      { value: 5176.8, say: 'You compounded once a year. Interest is added monthly: use 0.042 ÷ 12 for 36 months.' },
      { value: 5182.17, say: 'You grew $5,000 at 4.2 − 3 = 1.2% a year: the subtraction shortcut. Find the balance first, then divide by 1.03³.' },
      { value: 5201.98, say: 'You took inflation as 3 × 3% = 9%. Prices compound too: divide by 1.03³ = 1.092727.' },
    ],
    solution: 'Balance: 5,000 × (1 + 0.042 ÷ 12)³⁶ = 5,000 × 1.0035³⁶ ≈ $5,670.16. In today’s dollars: 5,670.16 ÷ 1.03³ = 5,670.16 ÷ 1.092727 ≈ $5,189.00. The balance grows by $670 in dollars, but only by about $189 in purchasing power.',
  },
  {
    id: 'f00-fn-15', lesson: 'interest-and-inflation', type: 'multi', kind: 'conceptual',
    prompt: 'When a set of fixed-rate loans and fixed-price contracts is agreed, everyone expects inflation of 2% a year. Inflation turns out to be 6% a year instead. Which of these parties gain purchasing power because of the surprise? Select all that apply.',
    options: [
      'A company that borrowed at a fixed 5% a year',
      'A bank that lent at a fixed 5% a year',
      'A saver holding a five-year certificate of deposit at a fixed 4% a year',
      'A household repaying a fixed-rate mortgage',
      'A hotel that agreed to host a company’s training courses for three years at a fixed price per room-night',
      'A worker whose wage is fixed in dollars for three years',
    ],
    answer: [0, 3],
    feedback: {
      1: 'The bank is repaid in dollars that buy less than it expected: its real return falls from about 2.9% to about −0.9%. Lenders lose from unexpected inflation.',
      2: 'The certificate pays a fixed 4%, now below inflation, so its real return turns negative: 1.04 ÷ 1.06 − 1 ≈ −1.9%.',
      4: 'The hotel’s costs rise with prices while its price is fixed, so the real price it receives falls each year. That is why long contracts often include an index clause.',
      5: 'A wage fixed in dollars buys less each year as prices rise faster than expected.',
    },
    solution: 'Unexpected inflation moves purchasing power from those who receive fixed dollar amounts (lenders, savers on fixed rates, sellers on fixed-price contracts, workers on fixed wages) to those who pay them (fixed-rate borrowers, such as the company and the household). Inflation that is expected does not do this, because lenders build it into the rates they charge.',
  },
  {
    id: 'f00-fn-16', lesson: 'interest-and-inflation', type: 'num', kind: 'applied',
    prompt: 'Suppose that in 2027 Lantern signs a three-year contract to cater a fictional university’s staff events for $24,000 a year. A clause raises the price each year by the percentage change in a named consumer price index over the previous year. Over the first year the index rises from 310.0 to 322.4. What is the contract price for the second year?',
    answer: 24960, check: () => 24000 * (1 + (322.4 - 310.0) / 310.0), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 26976, say: 'You treated the 12.4-point rise in the index as 12.4%. Inflation is the percentage change: 12.4 ÷ 310.0 = 4%.' },
      { value: 24923.08, say: 'You divided the rise by the end value of the index. Divide by the starting value: 12.4 ÷ 310.0.' },
      { value: 24672, say: 'That uses Ana’s 2.8% planning assumption. The contract follows what the index actually did: a 4% rise.' },
    ],
    solution: 'Inflation over the year = (322.4 − 310.0) ÷ 310.0 = 4%. Second-year price = 24,000 × 1.04 = $24,960. The clause keeps the real value of the contract roughly constant, so Lantern is not hurt if its own costs rise with prices.',
  },

  // ---------------------------------------------------------------- financial-markets
  {
    id: 'f00-fn-17', lesson: 'financial-markets', type: 'num', kind: 'numerical',
    prompt: 'A fictional US coffee roaster agrees in March to pay a Colombian growers’ cooperative 180,000,000 Colombian pesos in June. Suppose the exchange rate is 4,000 pesos per US dollar in March and 3,600 pesos per dollar in June, when the roaster pays without having hedged (the rates are hypothetical). How many more dollars does the invoice cost than it would have at the March rate?',
    answer: 5000, check: () => 180e6 / 3600 - 180e6 / 4000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 45000, say: 'That is what the invoice would have cost at the March rate: 180,000,000 ÷ 4,000. The question asks how much more it costs in June.' },
      { value: 50000, say: 'That is the June cost: 180,000,000 ÷ 3,600. Subtract the March cost to find the extra.' },
      { value: 4500, say: 'You took 10% of $45,000, the size of the fall from 4,000 to 3,600 pesos. Each dollar now buys fewer pesos, so the dollar cost rises by 4,000 ÷ 3,600 − 1 ≈ 11.1%.' },
    ],
    solution: 'Both rates are quoted as pesos per dollar, so divide the peso amount by them. March: 180,000,000 ÷ 4,000 = $45,000. June: 180,000,000 ÷ 3,600 = $50,000. The invoice costs $5,000 more, because the peso has strengthened: a dollar buys fewer pesos. A forward contract agreed in March would have fixed the dollar cost; that is the currency risk hedging removes.',
  },
  {
    id: 'f00-fn-18', lesson: 'financial-markets', type: 'mc', kind: 'conceptual',
    prompt: 'Why can a bank whose loans are all sound still fail if many depositors ask for their money on the same day?',
    options: [
      'It funds long-term loans with deposits repayable on demand, and loans are slow to turn into cash',
      'A run reveals that its loans were bad all along, so the bank was insolvent before the first depositor asked for cash',
      'Depositors are repaid only after the bank’s shareholders, so a run quickly wipes out what depositors are owed',
      'The central bank is not allowed to lend to banks that are short of cash, so nobody can bridge the gap',
    ],
    answer: 0,
    feedback: {
      1: 'Sound loans can still be slow to turn into cash. The problem in a run is liquidity, not solvency.',
      2: 'It is the other way round: depositors are creditors of the bank and rank ahead of its shareholders.',
      3: 'The Federal Reserve’s discount window lends to banks in generally sound condition, against collateral, precisely to help them manage their liquidity.',
    },
    solution: 'Banks perform maturity transformation: they fund long-term loans with short-term deposits. That is useful and fragile, because if too many depositors withdraw at once the bank cannot call in its loans fast enough, even when they will all be repaid. Deposit insurance, which removes most depositors’ reason to run, and central bank lending to sound banks exist largely because of this fragility.',
  },
  {
    id: 'f00-fn-19', lesson: 'financial-markets', type: 'mc', kind: 'applied',
    prompt: 'A fictional chocolate maker buys cocoa futures to fix the price of the cocoa it must buy next year. On the same day a fictional trader who has no use for cocoa buys identical contracts because she expects cocoa prices to rise. Which statement is correct?',
    options: [
      'The maker is hedging a risk it already faces and the trader is speculating; neither trade raises any new capital',
      'Both are speculating, because a futures contract is a bet on the price of cocoa, whoever happens to hold it',
      'Both are hedging, because they hold identical contracts and therefore face exactly the same cocoa price risk',
      'The futures raise money for cocoa growers to plant next year’s crop, as a share issue raises money for a company',
    ],
    answer: 0,
    feedback: {
      1: 'What a trade does depends on who makes it and why. The chocolate maker already bears the risk of a rise in cocoa prices, and the futures reduce it.',
      2: 'The contracts are identical but the positions are not: the maker’s gain on the futures would offset a higher cocoa bill, while the trader has no cocoa bill to offset, so she takes risk on. That is speculation.',
      3: 'A derivative creates no new capital: for every party who gains on the contract, another loses the same amount. It moves risk; it does not raise money.',
    },
    solution: 'The same contract can serve opposite purposes. The chocolate maker uses it to remove a risk it already has (hedging); the trader uses it to take on risk for an expected profit (speculation). Hedgers need someone to take the other side, and speculators often do. Derivatives move risk; they raise no capital.',
  },

  // ---------------------------------------------------------------- market-participants
  {
    id: 'f00-fn-20', lesson: 'market-participants', type: 'num', kind: 'numerical',
    prompt: 'A fictional battery recycler plans to sell 5 million new shares in its initial public offering and wants net proceeds of $116.25 million, before its other costs. The underwriting spread is 7% of the offer price. What offer price does it need? Give dollars and cents.',
    answer: 25, check: () => 116.25 / (5 * (1 - 0.07)), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 23.25, say: 'That ignores the underwriting spread (116.25 ÷ 5). The underwriters keep 7% of the price, so the recycler receives only 93% of it on each share.' },
      { value: 24.88, say: 'You added 7% to the proceeds (116.25 × 1.07 ÷ 5). The spread is 7% of the gross proceeds, so the net is 93% of the gross: divide by 0.93 instead.' },
      { value: 21.73, say: 'You divided by 1.07. The recycler keeps 93% of each share’s price: divide by 5 × 0.93.' },
    ],
    solution: 'Net proceeds = N × P × (1 − g), so P = 116.25 ÷ (5 × 0.93) = 116.25 ÷ 4.65 = $25.00. Gross proceeds are 5 × 25 = $125 million, of which the underwriters keep 7%, or $8.75 million.',
  },
  {
    id: 'f00-fn-21', lesson: 'market-participants', type: 'classify', kind: 'conceptual',
    prompt: 'How is each participant mainly paid for what it does?',
    items: [
      'A market maker in a company’s shares',
      'A hedge fund manager',
      'A commercial bank that takes deposits and makes loans',
      'A full-service broker executing a client’s order as its agent',
      'An investment bank managing a company’s initial public offering',
    ],
    categories: ['Interest-rate spread', 'Underwriting spread', 'Commission or fee', 'Bid-ask spread', 'Management and performance fees'],
    answer: [3, 4, 0, 2, 1],
    feedback: {
      0: 'A market maker is a dealer: it buys at its bid and sells at its ask, and the gap is its reward for standing ready to trade.',
      1: 'Hedge funds typically charge a yearly management fee on the assets plus a performance fee on the profits.',
      2: 'A bank pays depositors one rate and charges borrowers a higher one; the gap, with its fees, pays for its costs, bad loans and a return to its owners.',
      3: 'A broker acts as the client’s agent and never owns the securities, so it is paid a commission or fee; a full-service broker charges more than a discount broker because it adds advice and planning.',
      4: 'The underwriters keep the difference between the price investors pay and the amount per share the issuer receives.',
    },
    solution: 'Market maker: bid-ask spread (a principal). Hedge fund manager: management and performance fees. Commercial bank: interest-rate spread (with fees). Broker: commission or fee (an agent). Investment bank in an IPO: underwriting spread. Knowing how each is paid shows where conflicts of interest can arise, such as a broker paid per trade.',
  },

  // ---------------------------------------------------------------- governance-and-agency
  {
    id: 'f00-fn-22', lesson: 'governance-and-agency', type: 'num', kind: 'numerical',
    prompt: 'A fictional company owes its lender $90,000, due at the end of the year. Under a safe plan it will be worth $120,000 at that date for certain. Under a risky plan it will be worth $260,000 with probability 25%, $90,000 with probability 25% or $30,000 with probability 50%. By how much does the shareholders’ expected payoff rise if the company switches from the safe plan to the risky plan?',
    answer: 12500, check: () => (0.25 * Math.max(260000 - 90000, 0) + 0.25 * Math.max(90000 - 90000, 0) + 0.5 * Math.max(30000 - 90000, 0)) - Math.max(120000 - 90000, 0), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 30000, say: 'That is the lender’s expected loss from the switch (90,000 − 60,000). Shareholders gain less than the lender loses, because the switch also destroys value.' },
      { value: 42500, say: 'That is the shareholders’ expected payoff under the risky plan. Subtract the $30,000 they receive under the safe plan.' },
      { value: -17500, say: 'You let the shareholders’ payoff go negative when the company is worth $30,000. With limited liability it is max(V − D, 0), which is 0 there. (Without limited liability shareholders would bear the whole −$17,500 fall in the company’s expected value.)' },
    ],
    solution: 'Shareholders receive max(V − D, 0). Safe: 120,000 − 90,000 = $30,000. Risky: 0.25 × 170,000 + 0.25 × 0 + 0.5 × 0 = $42,500. The rise is $12,500. Meanwhile the lender’s expected payoff, min(V, D), falls from $90,000 to 0.25 × 90,000 + 0.25 × 90,000 + 0.5 × 30,000 = $60,000, and the company’s expected value falls from $120,000 to $102,500. The switch destroys $17,500 of value yet leaves shareholders $12,500 better off, because $30,000 of expected value moves away from the lender: risk shifting.',
  },
  {
    id: 'f00-fn-23', lesson: 'governance-and-agency', type: 'mc', kind: 'applied',
    prompt: 'The board of a fictional retailer is offered a spending-control system that would cost $2 million a year to run. Its internal auditors estimate that the system would stop about $0.5 million a year of wasteful spending by store managers. Thinking in terms of agency costs, what should the board conclude?',
    options: [
      'Not to install it: it adds $2 million of monitoring cost to remove $0.5 million of residual loss, so total agency costs rise',
      'To install it: wasteful spending by agents is residual loss, which should be eliminated whatever it costs to do so',
      'To install it: monitoring costs are not agency costs, so only the $0.5 million a year of savings should count',
      'Not to install it, because store managers are employees of the company rather than agents of its shareholders',
    ],
    answer: 0,
    feedback: {
      1: 'Removing every dollar of waste can cost more than the waste itself. The aim is the smallest total of monitoring costs, bonding costs and residual loss.',
      2: 'Monitoring costs are one of the three parts of agency costs, alongside bonding costs and residual loss.',
      3: 'Managers at every level make decisions with the owners’ money, so they are agents whoever employs them. The reason not to install the system is its cost.',
    },
    solution: 'Agency costs = monitoring costs + bonding costs + residual loss. The system adds $2 million of monitoring and removes $0.5 million of residual loss, so total agency costs rise by about $1.5 million a year. Some residual loss is worth tolerating: good governance looks for the lowest total, not for zero waste, and the board should look for cheaper controls.',
  },
  {
    id: 'f00-fn-24', lesson: 'governance-and-agency', type: 'mc', kind: 'applied',
    prompt: 'A fictional airline with heavy debt plans to pay its chief executive mainly in stock options. Its bondholders object. What is the strongest reason for their concern?',
    options: [
      'Options gain if the share price rises and lose nothing more if it collapses, so she may favour bets whose losses hit bondholders',
      'Options give shareholders a reason to pay out more cash as dividends, leaving less to cover the interest owed to bondholders',
      'Options make chief executives too cautious, so the airline may earn too little to cover the interest it owes bondholders',
      'Options give the chief executive a vote at bondholders’ meetings, which she could use to weaken the bond covenants',
    ],
    answer: 0,
    feedback: {
      1: 'Dividends tend to lower the share price and so the value of options: options give the chief executive a reason to hold cash back, not to pay it out.',
      2: 'Options have the opposite effect: their one-sided payoff rewards risk-taking. Excess caution is a side effect of fixed salaries, and of managers whose own wealth is tied up in the firm.',
      3: 'Options are rights to buy shares; they give no vote over the bonds or their covenants.',
    },
    solution: 'Stock options pay off only if the share price rises above the exercise price, and lose nothing more however far it falls. A chief executive paid mainly in options gains from risk. In a heavily indebted firm, shareholders keep the upside of a risky bet while bondholders bear much of the downside, so options strengthen the incentive to shift risk onto lenders. Bondholders respond with higher rates or covenants that limit what the airline may do.',
  },
];
