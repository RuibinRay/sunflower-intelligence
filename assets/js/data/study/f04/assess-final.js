// assess-final.js — F04 cumulative final: 24 items, every lesson at least twice, eight each conceptual, numerical and
// applied. Many items combine lessons: day counts with effective rates, an equivalent monthly rate inside a loan payment,
// changing rates with monthly compounding, irregular dates with an effective rate, a deferred annuity funded by saving,
// a perpetuity with inflation, a quarterly perpetuity at an effective rate, a balance inside a refinancing decision,
// real growth inside a growing annuity, an effective rate inside the Fisher relation, and a balance inside a payoff time.
// New questions, not copies of lesson exercises, module-test, diagnostic or project items. No hints; solutions show in
// review. 70% passes. Every business, person, price and rate is fictional; Regulation Z appears only as the lessons state it.

export const items = [
  // ---------------------------------------------------------------- simple-and-compound-interest
  {
    id: 'f04-fn-1', lesson: 'simple-and-compound-interest', type: 'num', kind: 'numerical',
    prompt: 'On 1 January 2027 a fictional choir deposits $15,000 in an account paying 4.8% a year. Interest is compounded and credited once a year, on 1 January; for part of a year the account pays simple interest, on an actual/365 basis, on the balance at the last crediting date. How much will the account pay out if the choir closes it on 1 June 2030? Keep at least six decimal places in every factor and give the answer to the nearest cent.',
    answer: 17608.19, check: () => 15000 * 1.048 ** 3 * (1 + 0.048 * 151 / 365), unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 17610.65, say: 'That counts the five months as 5/12 of a year. The account counts the actual days, 151 from 1 January to 1 June 2030, over 365.' },
      { value: 17612.95, say: 'That divides the 151 days by 360. The account uses an actual/365 basis.' },
      { value: 17603.48, say: 'That uses the growth formula with a fractional exponent, 1.048^(3 + 151/365). This account credits interest only on 1 January and pays simple interest for the part-year, which within a period pays slightly more.' },
      { value: 17265.34, say: 'That stops at 1 January 2030. The 151 days after the last crediting date earn simple interest too.' },
      { value: 17459.84, say: 'That is simple interest for the whole time. Interest credited each 1 January earns interest after that: compound for the three full years.' },
    ],
    solution: 'Three full years compound: 15,000 × 1.048³ = 15,000 × 1.151023 ≈ $17,265.34 on 1 January 2030. From 1 January to 1 June 2030 there are 31 + 28 + 31 + 30 + 31 = 151 days (2030 is not a leap year). Simple interest on an actual/365 basis: 17,265.34 × 0.048 × 151 ÷ 365 ≈ $342.85. Total ≈ $17,608.19. Counting five months as 5/12 of a year would give $17,610.65, and the growth formula with a fractional exponent $17,603.48: the contract’s day count and crediting rule decide the cents.',
  },
  {
    id: 'f04-fn-2', lesson: 'simple-and-compound-interest', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional funds were each worth $10,000 at the start of 2021 and $16,000 at the end of 2025, five years later. Fund A rose by about the same percentage every year. Fund B fell by 30% in its first year and then rose strongly. Which statement about their compound annual growth rates is correct?',
    options: [
      'Equal, about 9.86% a year: a CAGR uses only the start and end values',
      'Fund B’s is higher, because its later gains were made from a smaller base',
      'Fund A’s is higher, because steady growth compounds faster than uneven growth',
      'Fund B’s cannot be found without knowing each of its five yearly returns',
    ],
    answer: 0,
    feedback: {
      1: 'Fund B’s later gains were larger percentages, but they first had to make up the 30% fall. Both funds go from $10,000 to $16,000 in five years, so the same constant rate links start and end.',
      2: 'For the same start, end and number of years the compound rate is the same, whatever the path. What differs is the risk along the way.',
      3: 'A CAGR needs only the start value, the end value and the number of years: (16,000 ÷ 10,000)^(1/5) − 1.',
    },
    solution: 'CAGR = (end ÷ start)^(1/years) − 1 = 1.6^(1/5) − 1 ≈ 1.098561 − 1 ≈ 9.86% a year for both funds. The CAGR summarises growth from start to end and hides the path: Fund B’s investors lived through a 30% fall that Fund A’s did not.',
  },
  {
    id: 'f04-fn-3', lesson: 'simple-and-compound-interest', type: 'num', kind: 'applied',
    prompt: 'The finance manager of a fictional orchestra can place spare cash for 120 days at 4.80% a year simple interest on an actual/360 basis, and expects to roll it over on the same terms. Alternatively, a money-market account pays an APY of 4.90%. Annualising the deposit’s 120-day return over a 365-day year with compounding, what effective annual rate does the deposit give? Give a percentage to two decimal places.',
    answer: 4.95, check: () => ((1 + 0.048 * 120 / 360) ** (365 / 120) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 4.87, say: 'That converts 4.80% from actual/360 to actual/365 (× 365 ÷ 360) but leaves out compounding. Rolling the deposit over means each 120 days’ interest earns interest: raise 1.016 to the power 365 ÷ 120.' },
      { value: 4.88, say: 'That uses a 365-day year for the interest. The deposit counts days over 360, so 120 days earn 0.048 × 120 ÷ 360 = 1.6%.' },
      { value: 4.8, say: 'That is the quoted rate, which is neither on a 365-day basis nor compounded.' },
      { value: 1.6, say: 'That is the return for 120 days. Annualise it.' },
    ],
    solution: 'Interest for 120 days on an actual/360 basis = 4.80% × 120 ÷ 360 = 1.6%. Rolled over, the effective annual rate is 1.016^(365/120) − 1 ≈ 1.049466 − 1 ≈ 4.95%. The account’s APY of 4.90% is already an effective rate, so on rate alone the deposit wins by about 0.05 of a percentage point; the manager should also weigh that the account’s money can be withdrawn at any time, while the deposit’s rate may change at each rollover.',
  },

  // ---------------------------------------------------------------- effective-annual-rates
  {
    id: 'f04-fn-4', lesson: 'effective-annual-rates', type: 'num', kind: 'numerical',
    prompt: 'A fictional equipment lender quotes 8.30% a year compounded semi-annually on a $36,000 van loan, repaid in 60 equal monthly payments, the first a month after the loan is made. What is the monthly payment? Keep at least six decimal places in every factor and give dollars and cents.',
    answer: 732.71, check: () => { const r = 1.0415 ** (1 / 6) - 1; return 36000 * r / (1 - (1 + r) ** -60); }, unit: '$', places: 2, tol: 0.15,
    wrong: [
      { value: 735.13, say: 'That divides 8.30% by 12. The rate is compounded semi-annually, so first find the equivalent monthly rate: (1 + 0.083 ÷ 2)^(1/6) − 1.' },
      { value: 738.11, say: 'That divides the effective annual rate (about 8.4722%) by 12. Dividing an effective rate overstates the monthly rate; take its twelfth root instead.' },
      { value: 760.74, say: 'That is an annual payment at the effective rate, divided by 12. The payments are monthly, so work in months: 60 payments at the monthly rate.' },
    ],
    solution: 'Rate per half-year = 8.30% ÷ 2 = 4.15%. Equivalent monthly rate: 1.0415^(1/6) − 1 ≈ 0.680000%, because six months must compound to one half-year. Payment = 36,000 × 0.0068 ÷ (1 − 1.0068⁻⁶⁰) = 244.80 ÷ (1 − 0.665897) ≈ $732.71. Using 8.30% ÷ 12 ≈ 0.6917% a month would give $735.13, about $2.42 a month too much.',
  },
  {
    id: 'f04-fn-5', lesson: 'effective-annual-rates', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these pairs are equivalent rates, giving the same growth over a year? Select all that apply.',
    options: [
      '6% compounded semi-annually and 6.09% compounded annually',
      '6% a year compounded monthly and 6% a year compounded quarterly',
      '5% compounded continuously and about 5.127% compounded annually',
      '10% compounded annually and 0.8333% a month, which is the 10% divided by 12',
      '4% a half-year and 8.16% compounded annually',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'The same nominal rate compounded more often grows faster: 6% monthly is about 6.17% effective, 6% quarterly about 6.14%.',
      3: 'A monthly 0.8333% compounds to 1.008333¹² − 1 ≈ 10.47% a year. The monthly rate equivalent to an effective 10% is 1.10^(1/12) − 1 ≈ 0.7974%.',
    },
    solution: 'Compare effective annual rates. 1.03² − 1 = 6.09%: equivalent. 1.005¹² − 1 ≈ 6.1678% against 1.015⁴ − 1 ≈ 6.1364%: not equivalent. e^0.05 − 1 ≈ 5.1271%: equivalent. 1.008333¹² − 1 ≈ 10.47% against 10%: not equivalent. 1.04² − 1 = 8.16%: equivalent.',
  },

  // ---------------------------------------------------------------- present-and-future-value
  {
    id: 'f04-fn-6', lesson: 'present-and-future-value', type: 'num', kind: 'applied',
    prompt: 'The Ashdown Playhouse (fictional) must pay $85,000 for a new lighting rig in 30 months. Its bank pays 3.6% a year compounded monthly on deposits for the next 12 months, and has fixed the rate for the 18 months after that at 4.2% a year compounded monthly. How much must the theatre deposit today to have exactly $85,000 then? Keep at least six decimal places in every factor and give dollars and cents.',
    answer: 77000.75, check: () => 85000 / ((1 + 0.036 / 12) ** 12 * (1 + 0.042 / 12) ** 18), unit: '$', places: 2, tol: 1.5,
    wrong: [
      { value: 77115.89, say: 'That discounts for 30 months at the average of the two rates, 3.9%. Each stretch has its own rate: divide by 1.003¹² × 1.0035¹⁸.' },
      { value: 77694.62, say: 'That uses 3.6% for all 30 months. The rate rises to 4.2% for the last 18.' },
      { value: 76541.61, say: 'That uses 4.2% for all 30 months. The first 12 months earn only 3.6%.' },
      { value: 77136.08, say: 'That compounds once a year (1.036 × 1.042^1.5). Both rates are compounded monthly: 0.3% and 0.35% a month.' },
    ],
    solution: 'Monthly rates: 3.6% ÷ 12 = 0.3% for 12 months, then 4.2% ÷ 12 = 0.35% for 18 months. Growth over the 30 months: 1.003¹² × 1.0035¹⁸ ≈ 1.036600 × 1.064910 ≈ 1.103885. Deposit = 85,000 ÷ 1.103885 ≈ $77,000.75. Check forward: after a year the deposit has grown to about $79,818.97, and 18 months at 0.35% take that to $85,000.',
  },
  {
    id: 'f04-fn-7', lesson: 'present-and-future-value', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional borrower owes $4,000 due in two years and $5,000 due in four years. The lender agrees to replace both with a single payment X at the end of year 1, at a rate r a year compounded annually. Which equation gives a fair X?',
    options: [
      'X = 4,000 ÷ (1 + r) + 5,000 ÷ (1 + r)³',
      'X = 9,000 ÷ (1 + r)², the total discounted from the average due date',
      'X = 4,000 × (1 + r) + 5,000 × (1 + r)³',
      'X = 4,000 ÷ (1 + r)² + 5,000 ÷ (1 + r)⁴',
    ],
    answer: 0,
    feedback: {
      1: 'Adding the debts first mixes dollars from different dates. Move each debt to year 1 on its own; only then add.',
      2: 'That compounds the debts forward. Both fall due after year 1, so paying them at year 1 is paying early: discount each one.',
      3: 'That values the debts today, at time 0. The single payment is made at year 1, so each debt is discounted to year 1: one period less.',
    },
    solution: 'Put both debts at the comparison date, year 1, the date of X. The $4,000 is due a year after it, so discount it once; the $5,000 is due three years after it, so discount it three times: X = 4,000 ÷ (1 + r) + 5,000 ÷ (1 + r)³. Writing the equation of value at time 0 instead, X ÷ (1 + r) = 4,000 ÷ (1 + r)² + 5,000 ÷ (1 + r)⁴, gives the same X.',
  },

  // ---------------------------------------------------------------- discounting-cash-flows
  {
    id: 'f04-fn-8', lesson: 'discounting-cash-flows', type: 'num', kind: 'numerical',
    prompt: 'A fictional two-year note has a face value of $1,000 and pays interest of $25 every six months, with the $1,000 repaid alongside the last interest payment. An investor buys it for $972.29 just after it is issued. What yield does she earn? Find the rate per half-year at which the payments are worth the price, and give it as a nominal annual rate compounded semi-annually (twice the half-year rate), to two decimal places.',
    answer: 6.50, check: () => { const f = (y) => 25 * (1 - (1 + y) ** -4) / y + 1000 * (1 + y) ** -4 - 972.29; let lo = 0.0001, hi = 0.2; for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return (lo + hi) * 100; }, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 5, say: 'That is the note’s own interest rate (2 × $25 on $1,000). Bought below face value, it earns more: the yield is the rate at which the payments are worth $972.29.' },
      { value: 6.61, say: 'That is the effective annual rate, 1.0325² − 1. The question asks for twice the half-year rate.' },
      { value: 5.14, say: 'That is a year’s interest divided by the price ($50 ÷ $972.29). It leaves out the $27.71 gain when the note repays $1,000.' },
      { value: 3.25, say: 'That is the rate per half-year. Double it for the nominal annual rate.' },
    ],
    solution: 'The yield is the IRR of buying the note: −$972.29 now, $25 at the end of half-years 1 to 3 and $1,025 at half-year 4. Try 3% a half-year: 25 × 3.717098 + 1,000 × 0.888487 ≈ $981.41, above the price, so the rate is higher. Try 3.25%: 25 × 3.694983 + 1,000 × 0.879913 ≈ $972.29, the price. The half-year rate is 3.25%, so the yield is 6.50% a year compounded semi-annually (about 6.61% as an effective rate).',
  },
  {
    id: 'f04-fn-9', lesson: 'discounting-cash-flows', type: 'num', kind: 'applied',
    prompt: 'Corran Solar (fictional) can take on a contract that needs $60,000 of equipment now. The client will pay $25,000 in 6 months, $25,000 in 18 months and $20,000 in 30 months. Corran discounts at an effective 9% a year. What is the contract’s NPV? Keep at least six decimal places in every factor and give dollars and cents, with a minus sign if it is negative.',
    answer: 2037.81, check: () => -60000 + 25000 / 1.09 ** 0.5 + 25000 / 1.09 ** 1.5 + 20000 / 1.09 ** 2.5, unit: '$', places: 2, tol: 1.5,
    wrong: [
      { value: 1879.88, say: 'That discounts at 4.5% a half-year, treating 9% as a nominal rate compounded semi-annually. An effective 9% a year is 1.09^0.5 − 1 ≈ 4.40% a half-year; or measure each date in years and divide by 1.09^t.' },
      { value: -578.55, say: 'That treats each payment as arriving at the next year end (1, 2 and 3 years). Use the actual times: 0.5, 1.5 and 2.5 years.' },
      { value: 4769.38, say: 'That counts whole years only, rounding each time down (0, 1 and 2 years). Use 0.5, 1.5 and 2.5 years.' },
      { value: 10000, say: 'That adds the cash flows without discounting.' },
    ],
    solution: 'Measure each date in years and discount at the effective rate: 25,000 ÷ 1.09^0.5 ≈ 23,945.66; 25,000 ÷ 1.09^1.5 ≈ 21,968.49; 20,000 ÷ 1.09^2.5 ≈ 16,123.66. Present value of the payments ≈ $62,037.81, so NPV ≈ 62,037.81 − 60,000 = +$2,037.81. On these figures the contract earns more than 9% a year and is worth taking.',
  },
  {
    id: 'f04-fn-10', lesson: 'discounting-cash-flows', type: 'mc', kind: 'conceptual',
    prompt: 'Greystone Quarries (fictional) is considering a project with cash flows of −$100,000 now, +$250,000 in one year and −$150,000 in two years, when it must restore the site. Its NPV is exactly zero at 0% and at 50%. A spreadsheet’s IRR function returns 0%, and the company requires 15% a year. What should it conclude?',
    options: [
      'Accept: at 15% its NPV is about +$3,970; the IRR is not unique here',
      'Reject: the spreadsheet’s IRR of 0% is far below the 15% the company requires',
      'Reject: cash flows that add up to exactly zero cannot create any value',
      'It cannot be valued, because NPV is undefined when cash flows change sign twice',
    ],
    answer: 0,
    feedback: {
      1: 'Cash flows that change sign twice can have two IRRs. This project has two, 0% and 50%, and the spreadsheet reported one of them. The IRR rule gives no clear answer here; the NPV does.',
      2: 'Undiscounted totals ignore timing. The large inflow comes before the restoration cost, and at 15% the later cost is discounted more.',
      3: 'NPV is always defined: discount each cash flow and add. It is the IRR that can fail to be unique.',
    },
    solution: 'NPV at 15% = −100,000 + 250,000 ÷ 1.15 − 150,000 ÷ 1.15² ≈ −100,000 + 217,391.30 − 113,421.55 ≈ +$3,969.75, so the project adds value at the required return. Because the cash flows change sign twice, the NPV is zero at two rates (0% and 50%) and positive between them. Trust the NPV.',
  },

  // ---------------------------------------------------------------- annuities
  {
    id: 'f04-fn-11', lesson: 'annuities', type: 'num', kind: 'numerical',
    prompt: 'Quillon Press (fictional) will pay an author royalties of $8,000 at the end of the first year, rising by 5% a year, for twelve years in all. At a discount rate of 5% a year, what are the royalties worth today? Give dollars and cents.',
    answer: 91428.57, check: () => { let pv = 0; for (let t = 1; t <= 12; t++) pv += 8000 * 1.05 ** (t - 1) / 1.05 ** t; return pv; }, unit: '$', places: 2, tol: 2,
    wrong: [
      { value: 70906.01, say: 'That treats the royalties as level at $8,000. They rise by 5% a year.' },
      { value: 96000, say: 'That is 12 × $8,000. Each payment, discounted, is worth $8,000 ÷ 1.05 today, not $8,000.' },
      { value: 127337.01, say: 'That adds up the twelve rising payments without discounting them.' },
    ],
    solution: 'This is a growing annuity with g = r, where the usual formula would divide by zero. Payment t is 8,000 × 1.05^(t−1), and its present value is 8,000 × 1.05^(t−1) ÷ 1.05^t = 8,000 ÷ 1.05 ≈ $7,619.05, the same for every year. Twelve of them: 12 × 8,000 ÷ 1.05 ≈ $91,428.57.',
  },
  {
    id: 'f04-fn-12', lesson: 'annuities', type: 'num', kind: 'applied',
    prompt: 'Noor (fictional), a physiotherapist, plans a three-year career break in ten years’ time. She wants to withdraw $1,500 at the end of each month of the break, months 121 to 156 from today. To pay for it she will deposit an equal amount at the end of each month for the next 120 months. Her account pays 4.8% a year compounded monthly throughout. How much must each deposit be? Give dollars and cents.',
    answer: 326.75, check: () => { const r = 0.004; const need = 1500 * (1 - (1 + r) ** -36) / r; return need * r / ((1 + r) ** 120 - 1); }, unit: '$', places: 2, tol: 0.15,
    wrong: [
      { value: 351.49, say: 'You saved for the $54,000 the withdrawals add up to. At month 120 they are worth only their present value, about $50,198.81, because the account keeps earning interest during the break.' },
      { value: 328.05, say: 'You valued the withdrawals as an annuity due, as if the first were at month 120. It is at month 121, one month after the last deposit, so the ordinary annuity formula values them at month 120 as it stands.' },
      { value: 450, say: 'That is $54,000 ÷ 120, which ignores interest altogether.' },
    ],
    solution: 'Step 1: value the break at month 120, one month before the first withdrawal: 1,500 × (1 − 1.004⁻³⁶) ÷ 0.004 ≈ $50,198.81. Step 2: find the deposit whose future value at month 120 is that amount: C = 50,198.81 × 0.004 ÷ (1.004¹²⁰ − 1) ≈ $326.75. She deposits about $39,210 in all; interest supplies the rest of the $54,000 she withdraws.',
  },
  {
    id: 'f04-fn-13', lesson: 'annuities', type: 'mc', kind: 'conceptual',
    prompt: 'At 8% a year, a 10-year ordinary annuity of $1,000 a year is worth about $6,710. Why is a 20-year annuity of $1,000 a year worth well under twice that, about $9,818?',
    options: [
      'Payments 11 to 20 arrive ten years later, so they are worth only about 46% of payments 1 to 10',
      'The annuity formula only holds for terms of up to ten years, so the 20-year figure is just an estimate',
      'Ten more payments add only their interest to the value today, not their full amount',
      'A longer annuity must be discounted at a higher rate, which lowers the value of every payment',
    ],
    answer: 0,
    feedback: {
      1: 'The formula holds for any number of payments, even for ever (the perpetuity). The shortfall is exact, not an estimate.',
      2: 'Every payment counts in full, discounted to today. The later ones are discounted for longer.',
      3: 'The rate is the same 8% for both. The difference comes from timing alone.',
    },
    solution: 'The 20-year annuity is the 10-year annuity plus a second 10-year annuity that starts ten years later. The second block is worth $6,710.08 at year 10, or 6,710.08 × 1.08⁻¹⁰ = 6,710.08 × 0.463193 ≈ $3,108.07 today. Total ≈ 6,710.08 + 3,108.07 = $9,818.15. The later the payments, the less each adds.',
  },

  // ---------------------------------------------------------------- perpetuities-and-growth
  {
    id: 'f04-fn-14', lesson: 'perpetuities-and-growth', type: 'num', kind: 'applied',
    prompt: 'The Tallis Foundation (fictional) wants to endow a nursing prize worth $5,000 in today’s dollars every year for ever. The first prize is awarded a year from now, and each prize is raised in line with inflation, which the foundation expects to average 2.5% a year. Its endowment earns a nominal 6.5% a year. How large must the gift be? Give dollars and cents.',
    answer: 128125, check: () => 5000 / (1.065 / 1.025 - 1), unit: '$', places: 2, tol: 100,
    wrong: [
      { value: 125000, say: 'That divides $5,000 by r − g, but $5,000 is the prize in today’s dollars: the first prize, a year from now, is 5,000 × 1.025 = $5,125. (The same wrong answer comes from the shortcut real rate 6.5% − 2.5% = 4%; the exact real rate is 1.065 ÷ 1.025 − 1 ≈ 3.90%.)' },
      { value: 76923.08, say: 'That funds a level $5,000 a year. To keep its purchasing power the prize must grow with inflation.' },
      { value: 78846.15, say: 'That funds a level $5,125 a year. The first prize is right, but the prize must keep growing at 2.5% a year: divide by r − g.' },
    ],
    solution: 'Nominal route: the first prize is 5,000 × 1.025 = $5,125, growing at 2.5% a year for ever, so the gift is 5,125 ÷ (0.065 − 0.025) = $128,125.00. Real route: a level $5,000 in today’s dollars discounted at the exact real rate, 1.065 ÷ 1.025 − 1 ≈ 3.9024%, gives 5,000 ÷ 0.039024 ≈ $128,125.00 too. The shortcut real rate of 4% would leave the foundation $3,125 short.',
  },
  {
    id: 'f04-fn-15', lesson: 'perpetuities-and-growth', type: 'num', kind: 'numerical',
    prompt: 'A fictional land trust owns the land under a marina and receives a fixed ground rent of $1,400 every quarter, for ever, the next payment in three months. It values the rent at an effective 9% a year. What is the rent worth today? Give dollars and cents.',
    answer: 64284.52, check: () => 1400 / (1.09 ** 0.25 - 1), unit: '$', places: 2, tol: 70,
    wrong: [
      { value: 62222.22, say: 'That uses 9% ÷ 4 = 2.25% a quarter (or $5,600 a year ÷ 9%, which gives the same). An effective 9% a year is a quarterly rate of 1.09^(1/4) − 1 ≈ 2.1778%, a little lower, because quarterly returns compound.' },
      { value: 65684.52, say: 'That adds a payment received today. The next payment is in three months, so this is an ordinary perpetuity: C ÷ r.' },
      { value: 15555.56, say: 'You divided the quarterly rent by the annual rate. Use a quarterly rate with a quarterly payment.' },
    ],
    solution: 'Quarterly rate equivalent to an effective 9% a year: 1.09^(1/4) − 1 ≈ 0.0217782. Value = 1,400 ÷ 0.0217782 ≈ $64,284.52. Dividing the annual rent by 9% gives $62,222.22, which ignores that quarterly payments arrive sooner than a single payment at the end of each year.',
  },

  // ---------------------------------------------------------------- loan-amortisation
  {
    id: 'f04-fn-16', lesson: 'loan-amortisation', type: 'num', kind: 'applied',
    prompt: 'Brackenridge Veterinary Clinic (fictional) borrowed $150,000 three years ago at 9.6% a year compounded monthly, to be repaid in 96 equal monthly payments, and has just made its 36th payment. A lender offers to refinance the outstanding balance at 7.5% a year compounded monthly over the remaining 60 months, for an arrangement fee of $2,500 paid now. Discounting the monthly savings at the new loan’s rate, what is the net present value of refinancing? Keep at least six decimal places in every factor and round only the final answer. Give dollars and cents.',
    answer: 2889.26, check: () => { const p = (pv, r, n) => pv * r / (1 - (1 + r) ** -n); const c0 = p(150000, 0.008, 96); const b = c0 * (1 - 1.008 ** -60) / 0.008; const c1 = p(b, 0.00625, 60); return (c0 - c1) * (1 - 1.00625 ** -60) / 0.00625 - 2500; }, unit: '$', places: 2, tol: 12,
    wrong: [
      { value: 3979.38, say: 'That adds up the 60 monthly savings without discounting them, then takes off the fee. Savings that come later are worth less today.' },
      { value: 5389.26, say: 'That is the present value of the savings before the $2,500 fee.' },
      { value: 2629.96, say: 'That discounts the savings at the old rate, 0.8% a month. The savings are as certain as the new loan’s payments, so discount them at the new rate, 0.625% a month.' },
    ],
    solution: 'Old payment: 150,000 × 0.008 ÷ (1 − 1.008⁻⁹⁶) ≈ $2,244.500373. Outstanding balance after 36 payments (prospective, 60 left): 2,244.500373 × (1 − 1.008⁻⁶⁰) ÷ 0.008 ≈ $106,623.23. New payment: 106,623.23 × 0.00625 ÷ (1 − 1.00625⁻⁶⁰) ≈ $2,136.51, a saving of about $107.989642 a month. Present value of the savings at 0.625% a month: 107.989642 × 49.905308 ≈ $5,389.26. Net of the fee ≈ $2,889.26: refinance. The fee is recovered in about 23 months, well inside the 60 remaining.',
  },
  {
    id: 'f04-fn-17', lesson: 'loan-amortisation', type: 'num', kind: 'numerical',
    prompt: 'Ravi (fictional) borrows $45,000 for a delivery van at 8.4% a year compounded monthly, repaid in 60 equal monthly payments. How much interest does he pay in the third year of the loan (payments 25 to 36)? Keep at least six decimal places in every factor and round only the final answer. Give dollars and cents.',
    answer: 2115.67, check: () => { const r = 0.007, c = 45000 * r / (1 - (1 + r) ** -60); const b = (k) => c * (1 - (1 + r) ** -(60 - k)) / r; return 12 * c - (b(24) - b(36)); }, unit: '$', places: 2, tol: 5,
    wrong: [
      { value: 2454.55, say: 'That charges a full year’s interest (8.4%) on the balance at the start of year 3. The balance falls every month, so the interest does too.' },
      { value: 2052.92, say: 'That spreads the loan’s total interest evenly over the five years. Interest is heaviest early and lightest late, because it is charged on a falling balance.' },
      { value: 2833.32, say: 'That is the interest in year 2 (payments 13 to 24).' },
    ],
    solution: 'Payment: 45,000 × 0.007 ÷ (1 − 1.007⁻⁶⁰) ≈ $921.076597, about $921.08. Outstanding balances by the prospective method: after 24 payments, 921.076597 × (1 − 1.007⁻³⁶) ÷ 0.007 ≈ $29,220.84; after 36 payments, 921.076597 × (1 − 1.007⁻²⁴) ÷ 0.007 ≈ $20,283.59. Interest in year 3 = payments made − fall in the balance = 12 × 921.076597 − (29,220.84 − 20,283.59) ≈ 11,052.92 − 8,937.25 ≈ $2,115.67.',
  },
  {
    id: 'f04-fn-18', lesson: 'loan-amortisation', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional loans of $10,000 are both quoted at 6% a year compounded monthly, and each deducts a $200 arrangement fee from the money the borrower receives. Loan A is repaid over 12 months, loan B over 48 months. Which statement about their APRs, including the fee, is correct?',
    options: [
      'Loan A’s APR is higher: the same fee is spread over fewer payments',
      'Both APRs are 6%, because a fee does not change the interest rate on the loan',
      'Loan B’s APR is higher, because it pays more interest in total',
      'Both APRs rise by the same amount, because the fee is the same $200',
    ],
    answer: 0,
    feedback: {
      1: 'The interest rate stays 6%, but the APR measures the cost of credit including the fee: the borrower receives $9,800 and repays as if she had received $10,000.',
      2: 'Total interest grows with the term at any rate, so it is not a measure of cost. The fee is what lifts the APR, and on loan A it buys a much shorter loan.',
      3: 'The fee is the same in dollars, but as a yearly rate it is spread over one year on loan A and over four on loan B.',
    },
    solution: 'On each loan the borrower receives $9,800 but makes the payments set for $10,000: $860.66 a month on A and $234.85 on B. The rate at which A’s 12 payments are worth $9,800 is about 0.8167% a month, an APR of about 9.80%; for B it is about 0.5866% a month, an APR of about 7.04%. A fee is a fixed cost of borrowing, so the shorter the loan, the larger it is as a yearly rate.',
  },

  // ---------------------------------------------------------------- inflation-and-real-returns
  {
    id: 'f04-fn-19', lesson: 'inflation-and-real-returns', type: 'num', kind: 'applied',
    prompt: 'Wrenfield Software (fictional) licenses its booking system to a hotel group for ten years. The fee is $30,000 at the end of the first year; after that it rises each year so that it grows by 3% a year in real terms. Inflation is expected to be 4% a year, and Wrenfield discounts at a nominal 11% a year. What is the licence worth today? Keep at least six decimal places in every factor and round only the final answer. Give the answer to the nearest dollar.',
    answer: 231488, check: () => { const g = 1.03 * 1.04 - 1; let pv = 0; for (let t = 1; t <= 10; t++) pv += 30000 * (1 + g) ** (t - 1) / 1.11 ** t; return pv; }, unit: '$', places: 0, tol: 10,
    wrong: [
      { value: 230399.87, say: 'That grows the fee at 3% + 4% = 7% a year. Real growth and inflation combine by multiplying: 1.03 × 1.04 − 1 = 7.12% a year in dollars.' },
      { value: 197510.07, say: 'That grows the fee at 3% but discounts at the nominal 11%. A fee that grows 3% in real terms grows 7.12% in dollars: grow it in dollars, or discount at the real rate.' },
      { value: 285739, say: 'That grows the fee in dollars (7.12%) but discounts at the real rate. Nominal cash flows go with the nominal rate.' },
      { value: 228476.73, say: 'That takes the real route with the shortcut real rate, 11% − 4% = 7%. The exact real rate is 1.11 ÷ 1.04 − 1 ≈ 6.73%.' },
    ],
    solution: 'Nominal growth: 1.03 × 1.04 − 1 = 7.12% a year. The fees form a growing annuity: PV = 30,000 ÷ (0.11 − 0.0712) × [1 − (1.0712 ÷ 1.11)¹⁰] ≈ 773,195.88 × (1 − 0.700609) ≈ $231,488. The real route agrees: the first fee is 30,000 ÷ 1.04 ≈ $28,846.15 in today’s dollars, growing 3% a year, discounted at the real rate 1.11 ÷ 1.04 − 1 ≈ 6.7308%.',
  },
  {
    id: 'f04-fn-20', lesson: 'inflation-and-real-returns', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about the exact Fisher relation, 1 + r_nom = (1 + r_real)(1 + i), are correct? Select all that apply.',
    options: [
      'It holds over any period if all three are effective rates for that period',
      'At 6% nominal and 4% inflation, the exact real rate is a little below 2%',
      'A savings rate quoted as an APR compounded monthly can go into it as it stands, with no conversion',
      'Over ten years, the real growth factor is the nominal factor divided by the inflation factor',
      'The subtraction shortcut, r_real ≈ r_nom − i, is exact whenever inflation is below about 3% a year',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'An APR compounded monthly is a nominal annual rate that ignores compounding. Convert it to an effective annual rate first.',
      4: 'The shortcut drops the product r_real × i. That is small when rates are low, but it is never zero while both rates are positive.',
    },
    solution: 'Correct: the relation is exact for any period when all three are effective rates over that period; 1.06 ÷ 1.04 − 1 ≈ 1.923%, a little below the 2% the shortcut gives; and growth factors over several years divide the same way, (1 + r_nom)ⁿ ÷ (1 + i)ⁿ. Wrong: an APR must first be converted to an effective rate, and the shortcut is never exact while both rates are positive.',
  },
  {
    id: 'f04-fn-21', lesson: 'inflation-and-real-returns', type: 'num', kind: 'numerical',
    prompt: 'Odette (fictional) keeps her savings in an account paying 6.6% a year compounded monthly. She wants them to grow by at least 2.4% a year in purchasing power. What is the highest average annual inflation rate at which she achieves that? Give a percentage to two decimal places.',
    answer: 4.30, check: () => ((1 + 0.066 / 12) ** 12 / 1.024 - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 4.2, say: 'That is the shortcut 6.6 − 2.4, on the quoted rate. Use the account’s effective rate and divide: (1 + EAR) ÷ 1.024 − 1.' },
      { value: 4.1, say: 'That uses the exact relation with the quoted 6.6%, which ignores monthly compounding. Convert to the effective rate first: 1.0055¹² − 1 ≈ 6.80%.' },
      { value: 4.4, say: 'That subtracts 2.4 from the effective rate. The exact relation divides the growth factors.' },
    ],
    solution: 'Effective annual rate: (1 + 0.066 ÷ 12)¹² − 1 = 1.0055¹² − 1 ≈ 6.8034%. Fisher: 1 + i = (1 + EAR) ÷ (1 + r_real) = 1.068034 ÷ 1.024 ≈ 1.043002, so inflation can average up to about 4.30% a year. Any higher and her purchasing power grows by less than 2.4% a year.',
  },

  // ---------------------------------------------------------------- mortgages
  {
    id: 'f04-fn-22', lesson: 'mortgages', type: 'num', kind: 'applied',
    prompt: 'Kenji and Sunniva (fictional) took a $260,000 30-year fixed-rate mortgage at 6.5% a year, repaid monthly (payment about $1,643.38). They have just made their 84th payment, and now pay a lump sum of $25,000 off the outstanding balance. They keep paying $1,643.38 a month, and the loan has no prepayment penalty. How many more monthly payments will they make, counting a smaller final payment as one?',
    answer: 219, check: () => { const r = 0.065 / 12, c = 260000 * r / (1 - (1 + r) ** -360); const b = c * (1 - (1 + r) ** -276) / r - 25000; return Math.ceil(-Math.log(1 - r * b / c) / Math.log(1 + r)); }, unit: 'payments', places: 0, tol: 0.4,
    wrong: [
      { value: 276, say: 'That is the number of payments left on the original schedule. The lump sum cuts the outstanding balance, so the same payment clears it sooner.' },
      { value: 261, say: 'That takes off only about 15 payments (25,000 ÷ 1,643.38). Every dollar repaid early also stops being charged interest for the rest of the loan, so the term falls by much more.' },
      { value: 218, say: 'The formula gives about 218.27: 218 full payments leave a little still owed, so a smaller 219th payment is needed.' },
    ],
    solution: 'Outstanding balance after 84 payments (prospective, 276 left), with the unrounded payment: 1,643.376861 × (1 − 1.00541667⁻²⁷⁶) ÷ 0.00541667 ≈ $235,082.24. After the lump sum: $210,082.24. Payments needed at $1,643.38: n = −ln(1 − 0.00541667 × 210,082.24 ÷ 1,643.38) ÷ ln 1.00541667 ≈ 218.27, so 218 full payments and a smaller 219th: 57 fewer than the 276 scheduled, finishing 4 years and 9 months sooner.',
  },
  {
    id: 'f04-fn-23', lesson: 'mortgages', type: 'num', kind: 'numerical',
    prompt: 'A fictional $200,000 30-year fixed-rate mortgage at 6% a year has a monthly payment of about $1,199.10. After how many payments is less than half of the amount borrowed still owed for the first time?',
    answer: 252, check: () => { const r = 0.005, c = 200000 * r / (1 - (1 + r) ** -360); let k = 0; while (c * (1 - (1 + r) ** -(360 - k)) / r >= 100000) k += 1; return k; }, unit: 'payments', places: 0, tol: 0.4,
    wrong: [
      { value: 180, say: 'That is half the term. Early payments are mostly interest, so half the loan is repaid much later than halfway through.' },
      { value: 251, say: 'After 251 payments about $100,573 is still owed, just over half. The outstanding balance first falls below $100,000 with the 252nd payment.' },
      { value: 108, say: 'That is the number of payments still to come when the balance is half the loan. Subtract it from 360.' },
    ],
    solution: 'Half the loan is $100,000. The outstanding balance is the present value of the payments still to come, so find how many remaining payments are worth $100,000: n = −ln(1 − 0.005 × 100,000 ÷ 1,199.10) ÷ ln 1.005 ≈ 108.18. That leaves 360 − 108.18 ≈ 251.8 payments made, so the balance first falls below half after the 252nd payment, 21 years into a 30-year loan. Check: after 251 payments about $100,573 is owed; after 252, about $99,877.',
  },
  {
    id: 'f04-fn-24', lesson: 'mortgages', type: 'classify', kind: 'conceptual',
    prompt: 'In each situation, who bears the cost of the surprise: the borrower or the lender? Assume the loan is not refinanced.',
    items: [
      'A 30-year fixed-rate mortgage, and inflation turns out higher than expected',
      'A 30-year fixed-rate mortgage, and inflation turns out lower than expected',
      'An adjustable-rate mortgage after its initial fixed period, and the index rises by one point, within the caps',
      'A 30-year fixed-rate mortgage, and market interest rates rise sharply after closing',
      'An adjustable-rate mortgage during its initial fixed period, and market interest rates fall',
    ],
    categories: ['The borrower', 'The lender'],
    answer: [1, 0, 0, 1, 0],
    feedback: {
      0: 'The fixed payments are made in dollars that buy less than expected, so the lender’s real return falls and the borrower’s real burden falls.',
      1: 'The fixed payments now take more purchasing power than expected: the real rate the borrower pays is higher than planned.',
      2: 'At the reset the rate and the payment rise with the index: an adjustable rate moves interest-rate risk to the borrower, up to the caps.',
      3: 'The lender holds a loan paying less than new loans do, so the loan is worth less, as a fixed-rate note is when market rates rise.',
      4: 'Until the first reset the rate is fixed, so the borrower keeps paying the higher starting rate.',
    },
    solution: 'A fixed rate puts the cost of surprises on the lender when inflation or market rates rise and on the borrower when they fall. An adjustable-rate mortgage shifts interest-rate risk to the borrower once its fixed period ends, within its caps; during the fixed period it behaves like a fixed-rate loan.',
  },
];
