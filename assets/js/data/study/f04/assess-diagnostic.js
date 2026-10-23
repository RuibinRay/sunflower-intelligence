// assess-diagnostic.js — F04 course diagnostic: three items per module, each written so that it needs the module’s
// method, not just its vocabulary, to separate a student who already knows a module from one who doesn’t.
// New questions, not copies of lesson exercises, module-test or project items. No hints; solutions show in review.
// Every business, person, price and rate here is fictional; Regulation DD appears only as the lessons state it.

export const items = [
  // ================================================================ Module 1: Interest
  {
    id: 'f04-dg-1', lesson: 'simple-and-compound-interest', type: 'num', kind: 'numerical',
    prompt: 'Imani (fictional) puts $10,000 into an account paying 4% a year compounded annually. On the same day her friend Callum puts $9,000 into an account paying 5.5% a year compounded annually. Neither adds or withdraws anything. By the formula, after how many years will the two balances be equal? Give the answer to two decimal places.',
    answer: 7.36, check: () => Math.log(10000 / 9000) / Math.log(1.055 / 1.04), unit: 'years', places: 2, tol: 0.02,
    wrong: [
      { value: 10.53, say: 'That uses simple interest (10,000 + 400t = 9,000 + 495t). Both balances compound, so set 10,000 × 1.04ⁿ = 9,000 × 1.055ⁿ and solve with logarithms.' },
      { value: 7.08, say: 'You divided by ln 1.015, as if the faster account gained 1.5% a year. It gains by the ratio of the growth factors, 1.055 ÷ 1.04 ≈ 1.014423, not by the difference of the rates.' },
    ],
    solution: 'Set the balances equal: 10,000 × 1.04ⁿ = 9,000 × 1.055ⁿ, so (1.055 ÷ 1.04)ⁿ = 10,000 ÷ 9,000. Take logarithms: n = ln 1.111111 ÷ ln 1.014423 = 0.105361 ÷ 0.014320 ≈ 7.36 years. Check: after 7.36 years both balances are about $13,345.',
  },
  {
    id: 'f04-dg-2', lesson: 'effective-annual-rates', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional US bank advertises a savings account with an APY of 5.00%. It also lends at an APR of 5.00%, with interest compounded monthly and no fees. Suppose $10,000 sits untouched for a year in each: the savings left to grow, the loan left unpaid. Which statement is correct?',
    options: [
      'The savings grow by $500.00; the loan balance grows by about $511.62',
      'Both grow by exactly $500.00, because both rates are quoted as 5.00% a year',
      'The savings grow by about $511.62; the loan balance grows by $500.00',
      'Both grow by about $511.62, because interest on both is compounded within the year',
    ],
    answer: 0,
    feedback: {
      1: 'The two figures are on different bases. Under Regulation DD an APY already reflects compounding over a year, so it is an effective rate; a loan’s APR is a nominal rate, the monthly rate × 12, and compounding comes on top.',
      2: 'That swaps them. The APY already includes compounding, so the savings grow by exactly the APY; the loan’s 5.00% is nominal, so its monthly rate of about 0.4167% compounds to about 5.12%.',
      3: 'The APY is already an effective rate: its compounding is built in, so it is not compounded a second time.',
    },
    solution: 'An APY is an effective annual rate: 10,000 × 5.00% = $500.00 in a year. A loan APR is a nominal rate: the monthly rate is 5% ÷ 12 ≈ 0.4167%, and (1 + 0.05 ÷ 12)¹² − 1 ≈ 5.1162%, so an unpaid $10,000 grows by about $511.62. The same headline number describes two different kinds of rate.',
  },
  {
    id: 'f04-dg-3', lesson: 'effective-annual-rates', type: 'num', kind: 'applied',
    prompt: 'A fictional US bank offers a three-year certificate of deposit with a term of 1,095 days. On a $15,000 deposit it pays $2,400 of interest at maturity. What annual percentage yield must it disclose under Regulation DD? Give a percentage to two decimal places.',
    answer: 5.07, check: () => 100 * ((1 + 2400 / 15000) ** (365 / 1095) - 1), unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 5.33, say: 'That divides the 16% return over the term by three. The APY formula compounds instead: it raises 1.16 to the power 365 ÷ 1,095, which is a cube root.' },
      { value: 16, say: 'That is the return over the whole three-year term. The APY states it as a yearly rate.' },
    ],
    solution: 'Return over the term = 2,400 ÷ 15,000 = 16%. APY = 100 × [(1.16)^(365 ÷ 1,095) − 1] = 100 × (1.16^(1/3) − 1) ≈ 100 × (1.050718 − 1) ≈ 5.07%. Dividing by three (5.33%) treats the growth as simple interest and overstates the yearly rate.',
  },

  // ================================================================ Module 2: Present and future value
  {
    id: 'f04-dg-4', lesson: 'present-and-future-value', type: 'num', kind: 'numerical',
    prompt: 'A fictional three-year deposit grew from $20,000 to $23,000. It paid 4.0% in the first year and 4.5% in the second, each credited at the end of the year. What rate did it pay in the third year? Give a percentage to two decimal places.',
    answer: 5.82, check: () => (23000 / (20000 * 1.04 * 1.045) - 1) * 100, unit: '%', places: 2, tol: 0.015,
    wrong: [
      { value: 6.5, say: 'That takes 4.0 and 4.5 away from the 15% total growth: it adds rates. Growth factors multiply, so divide: 1.15 ÷ (1.04 × 1.045) − 1.' },
      { value: 4.77, say: 'That is the constant rate that gives the same three-year growth (1.15^(1/3) − 1). The question asks for the third year’s own rate, given the first two.' },
      { value: 15, say: 'That is the growth over all three years, not the third year’s rate.' },
    ],
    solution: 'Each year multiplies the balance by its own growth factor: 20,000 × 1.04 × 1.045 × (1 + r₃) = 23,000. After two years the balance is 20,000 × 1.0868 = $21,736, so 1 + r₃ = 23,000 ÷ 21,736 ≈ 1.058152 and r₃ ≈ 5.82%.',
  },
  {
    id: 'f04-dg-5', lesson: 'discounting-cash-flows', type: 'num', kind: 'applied',
    prompt: 'Kittiwake Events (fictional) is fitting out a seasonal marquee venue. It would pay $30,000 now and a further $10,000 at the end of year 1 to finish the work. The venue opens in year 2 and is expected to bring in net cash of $15,000 at the end of years 2 and 3 and $18,000 at the end of year 4, including what the marquee sells for. Kittiwake requires 9% a year. What is the NPV of the project? Keep at least six decimal places in every factor and round only the final answer. Give dollars and cents, with a minus sign if it is negative.',
    answer: -2214.71, check: () => -30000 - 10000 / 1.09 + 15000 / 1.09 ** 2 + 15000 / 1.09 ** 3 + 18000 / 1.09 ** 4, unit: '$', places: 2, tol: 1.5,
    wrong: [
      { value: 8000, say: 'That adds the cash flows without discounting. Discount each one to today at 9% before adding.' },
      { value: -3040.39, say: 'That treats the $10,000 paid at the end of year 1 as if it were paid today. Only the time-0 cost is left undiscounted: divide the second payment by 1.09.' },
      { value: 1111.66, say: 'That discounts each inflow one year too little, as if the first arrived at the end of year 1. Count periods from the timeline: the first inflow is at year 2.' },
    ],
    solution: 'Timeline: −30,000 at 0, −10,000 at 1, +15,000 at 2 and 3, +18,000 at 4. Discount each at 9%: −10,000 ÷ 1.09 ≈ −9,174.31; 15,000 ÷ 1.09² ≈ 12,625.20; 15,000 ÷ 1.09³ ≈ 11,582.75; 18,000 ÷ 1.09⁴ ≈ 12,751.65. NPV ≈ −30,000 − 9,174.31 + 12,625.20 + 11,582.75 + 12,751.65 ≈ −$2,214.71. Reject on these estimates: the inflows exceed the costs by $8,000, but they return less than 9% a year.',
  },
  {
    id: 'f04-dg-6', lesson: 'present-and-future-value', type: 'mc', kind: 'conceptual',
    prompt: 'At some constant annual rate, the six-year discount factor is 0.75. What is the twelve-year discount factor at the same rate?',
    options: [
      '0.5625: twelve years of discounting is six years done twice',
      '0.50: each six years takes another 0.25 off the factor',
      '0.375: twelve years is twice as long, so the factor halves',
      '0.8660: doubling the time takes the square root of the factor',
    ],
    answer: 0,
    feedback: {
      1: 'Discount factors multiply over time; they do not fall by a fixed amount. The second six years multiply the factor by 0.75 again.',
      2: 'Halving would be right only if the factor fell in proportion to time. Each extra six years multiplies it by 0.75, not by 0.5.',
      3: 'A square root would correspond to a shorter wait. A longer wait means more discounting, so the factor must be below 0.75.',
    },
    solution: 'DF₁₂ = 1 ÷ (1 + r)¹² = [1 ÷ (1 + r)⁶]² = 0.75² = 0.5625. A dollar due in twelve years is worth 75% of a dollar due in six, which is itself worth 75% of a dollar today. (The rate is 0.75^(−1/6) − 1 ≈ 4.91% a year.)',
  },

  // ================================================================ Module 3: Streams of cash
  {
    id: 'f04-dg-7', lesson: 'annuities', type: 'num', kind: 'numerical',
    prompt: 'Tamsin (fictional) saves $250 at the end of every month in an account paying 4.2% a year compounded monthly. By the formula, how many months will it take for her savings to reach $10,000? Give n to two decimal places.',
    answer: 37.50, check: () => Math.log(1 + 10000 * 0.0035 / 250) / Math.log(1.0035), unit: 'months', places: 2, tol: 0.1,
    wrong: [
      { value: 40, say: 'That is 10,000 ÷ 250, which ignores the interest her deposits earn. With interest she gets there sooner.' },
      { value: 43.17, say: 'That uses the loan version, n = −ln(1 − PV × r ÷ C) ÷ ln(1 + r), which treats $10,000 as an amount owed today. Here $10,000 is a target at the end: n = ln(1 + FV × r ÷ C) ÷ ln(1 + r).' },
      { value: 3.13, say: 'That is the time in years. The question asks for the number of months.' },
    ],
    solution: 'Monthly rate r = 4.2% ÷ 12 = 0.35%. From FV = C × [(1 + r)ⁿ − 1] ÷ r: (1 + r)ⁿ = 1 + FV × r ÷ C = 1 + 10,000 × 0.0035 ÷ 250 = 1.14. So n = ln 1.14 ÷ ln 1.0035 = 0.131028 ÷ 0.003494 ≈ 37.50 months. After 37 deposits she has about $9,857.27; the 38th takes her past $10,000.',
  },
  {
    id: 'f04-dg-8', lesson: 'perpetuities-and-growth', type: 'num', kind: 'applied',
    prompt: 'A fictional donor wants to fund a $3,000 annual prize for a school choir, the first award a year from now. The school’s fund earns 7% a year. How much more must she give to pay the prize for ever than to pay it for exactly 30 years? Keep at least six decimal places in every factor and round only the final answer. Give dollars and cents.',
    answer: 5630.02, check: () => 3000 / 0.07 - 3000 * (1 - 1.07 ** -30) / 0.07, unit: '$', places: 2, tol: 2,
    wrong: [
      { value: 5261.70, say: 'You discounted the extra prizes 31 years. Prizes from year 31 on are a perpetuity worth C ÷ r at year 30, one period before the first of them: discount 30 years.' },
      { value: 42857.14, say: 'That is the cost of the prize for ever. The question asks how much more that is than the cost for 30 years.' },
      { value: 37227.12, say: 'That is the cost of 30 years of prizes. Subtract it from the cost for ever.' },
    ],
    solution: 'For ever: 3,000 ÷ 0.07 ≈ $42,857.14. For 30 years: 3,000 × (1 − 1.07⁻³⁰) ÷ 0.07 = 3,000 × 12.409041 ≈ $37,227.12. Difference ≈ $5,630.02. Check: the extra prizes form a perpetuity worth $42,857.14 at year 30, or 42,857.14 ÷ 1.07³⁰ ≈ $5,630.02 today. Every prize after year 30, together, adds only about 13% to the cost.',
  },
  {
    id: 'f04-dg-9', lesson: 'loan-amortisation', type: 'mc', kind: 'conceptual',
    prompt: 'The outstanding balance on an amortising loan after k payments can be found prospectively (the present value of the payments still to come) or retrospectively (the amount borrowed grown at the loan rate, minus the payments made, each grown to the same date). Why do the two methods always give the same balance?',
    options: [
      'The payments were set to be worth exactly the loan, at the loan rate',
      'Both methods use one and the same annuity factor, so the sums are identical',
      'The lender rounds the payment so that the two results agree to the cent',
      'They agree only at the payment where interest and principal repaid are equal',
    ],
    answer: 0,
    feedback: {
      1: 'They use different factors: the prospective method an annuity factor for the n − k payments left, the retrospective method growth factors for the k payments made.',
      2: 'Rounding is why a lender’s schedule can differ from the formulas by a cent or two. With the unrounded payment the two methods agree exactly.',
      3: 'They agree after any number of payments, not at one particular point.',
    },
    solution: 'When the loan is made, the amount borrowed equals the present value of all n payments at the loan rate. Move that equality forward k periods: the amount borrowed, grown, equals the payments already made, grown, plus the present value of the payments still to come. Rearranged, the retrospective balance equals the prospective one.',
  },

  // ================================================================ Module 4: Real versus nominal
  {
    id: 'f04-dg-10', lesson: 'inflation-and-real-returns', type: 'num', kind: 'numerical',
    prompt: 'Over five years the value of a fictional investment fund rose by 38% in total, while a price index rose by 15%. What was the fund’s average annual real return? Give a percentage to two decimal places.',
    answer: 3.71, check: () => ((1.38 / 1.15) ** (1 / 5) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 4.6, say: 'That subtracts 15 from 38 and divides by five. Growth factors divide and compound: (1.38 ÷ 1.15)^(1/5) − 1.' },
      { value: 4, say: 'You found the cumulative real return (1.38 ÷ 1.15 − 1 = 20%) but divided it by five. Take the fifth root of 1.20.' },
      { value: 3.82, say: 'That subtracts average annual inflation (2.83%) from the average annual nominal return (6.65%). Use the exact relation: divide the growth factors.' },
      { value: 20, say: 'That is the cumulative real return over the five years. Convert it to a rate per year.' },
    ],
    solution: 'Real growth over the five years = 1.38 ÷ 1.15 = 1.20, a 20% gain in purchasing power. Average annual real return = 1.20^(1/5) − 1 ≈ 1.037137 − 1 ≈ 3.71%. Check with yearly averages: 1.38^(1/5) ≈ 1.066537 and 1.15^(1/5) ≈ 1.028347, and 1.066537 ÷ 1.028347 − 1 ≈ 3.71%.',
  },
  {
    id: 'f04-dg-11', lesson: 'inflation-and-real-returns', type: 'classify', kind: 'conceptual',
    prompt: 'A fictional hospital forecasts the cost of a ten-year cleaning contract in today’s dollars; the contract price rises each year with the CPI. Its nominal discount rate is 7% a year and expected inflation is 3%, so the exact real rate is about 3.88%. How does each valuation compare with the correct present value of the costs?',
    items: [
      'The real costs discounted at 3.88%',
      'The real costs discounted at 7%',
      'The costs inflated at 3% a year, then discounted at 7%',
      'The costs inflated at 3% a year, then discounted at 3.88%',
      'The real costs discounted at 4%, the shortcut 7% − 3%',
    ],
    categories: ['Correct', 'Too high', 'Too low'],
    answer: [0, 2, 0, 1, 2],
    feedback: {
      0: 'Real cash flows with the real rate: inflation is left out of both.',
      1: 'The 7% includes compensation for inflation, but these costs are in today’s dollars: inflation is counted in the rate and not in the cash flows, so the value comes out too low.',
      2: 'Nominal cash flows with the nominal rate: inflation is counted in both, and it gives the same value as the real route.',
      3: 'Inflation is counted in the cash flows but not in the rate, so the value comes out too high.',
      4: 'The shortcut gives a slightly higher rate than the exact 1.07 ÷ 1.03 − 1 ≈ 3.88%, so the value comes out a little too low.',
    },
    solution: 'Match like with like: real cash flows with the real rate, nominal cash flows with the nominal rate; both routes give the same value. Real flows at the nominal rate count inflation only in the rate (too low); nominal flows at the real rate count it only in the cash flows (too high); and the subtraction shortcut slightly overstates the real rate (too low).',
  },
  {
    id: 'f04-dg-12', lesson: 'mortgages', type: 'num', kind: 'applied',
    prompt: 'Ellery (fictional) can afford a principal-and-interest payment of at most $2,000 a month. A lender offers a 30-year fixed-rate mortgage at 6.75% a year, repaid monthly. What is the largest loan she can take? Keep at least six decimal places in every factor and round only the final answer. Give the answer to the nearest dollar.',
    answer: 308357, check: () => 2000 * (1 - (1 + 0.0675 / 12) ** -360) / (0.0675 / 12), unit: '$', places: 0, tol: 20,
    wrong: [
      { value: 720000, say: 'That is 360 × $2,000, which ignores interest. The largest loan is the present value of the payments at the loan rate.' },
      { value: 305451.72, say: 'That values 30 annual payments of $24,000 at 6.75%. The payments are monthly: use 6.75% ÷ 12 = 0.5625% for 360 months.' },
      { value: 55068.60, say: 'That uses the monthly rate for only 30 periods. Thirty years of monthly payments is 360 periods.' },
    ],
    solution: 'The loan is the present value of 360 monthly payments of $2,000 at r = 6.75% ÷ 12 = 0.5625%: PV = 2,000 × (1 − 1.005625⁻³⁶⁰) ÷ 0.005625 = 2,000 × 154.178682 ≈ $308,357. Property taxes, insurance and any escrow come on top of this payment, so her full monthly housing cost would be higher.',
  },
];

// Start at module N if the student scores at least 75% on the items for all the modules before N. With three items per
// module that means all three module-1 items for module 2, five of the six module 1–2 items for module 3, and seven of
// the nine module 1–3 items for module 4.
export const route = [
  { module: 2, ifAtLeast: 0.75 },
  { module: 3, ifAtLeast: 0.75 },
  { module: 4, ifAtLeast: 0.75 },
];
