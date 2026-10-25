// assess-m4.js — F04 module 4 test: Real versus nominal (inflation-and-real-returns, mortgages).
// No hints. Each item has a full solution, shown when the student reviews the test. All people, prices, indexes, loans
// and rates are fictional; none of the lessons' exercises or ANA_PLAN's figures are reused, so the test checks the method.

export const items = [
  {
    id: 'f04-m4-1', lesson: 'inflation-and-real-returns', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional city’s rent index was 100.0 in a base year and 145.0 eight years later. A newspaper reports that “rents rose 5.6% a year”. Which statement is correct?',
    options: [
      'Rents rose about 4.75% a year on average; dividing the 45% total by eight overstates the yearly rate',
      'The newspaper is right: 45% ÷ 8 ≈ 5.6% a year',
      'Rents rose 45% a year, because the index rose 45 points',
      'The yearly rate cannot be found without each year’s index, because rents may have risen unevenly from year to year',
    ],
    answer: 0,
    feedback: {
      1: 'Dividing ignores compounding: 1.05625⁸ ≈ 1.55, a 55% rise, not 45%.',
      2: '45% is the rise over all eight years, not each year.',
      3: 'The average annual rate needs only the start and end levels: (145.0 ÷ 100.0)^(1/8) − 1.',
    },
    solution: 'Average annual rise = 1.45^(1/8) − 1 ≈ 0.0475, about 4.75% a year. Check: 1.0475⁸ ≈ 1.45. Rises compound, so the yearly average is a root, not a division.',
  },
  {
    id: 'f04-m4-2', lesson: 'inflation-and-real-returns', type: 'num', kind: 'numerical',
    prompt: 'A fictional museum charged $18 for a ticket when a price index stood at 230.0. The index now stands at 287.5 and the ticket costs $24. By how much has the ticket price risen in real terms? Give a percentage to two decimal places.',
    answer: 6.67, check: () => (24 / (18 * 287.5 / 230) - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 33.33, say: 'That is the rise in dollars. Prices in general rose 25% over the same period; remove that first.' },
      { value: 8.33, say: 'That subtracts 25 percentage points of inflation from 33.33. Divide the growth factors: 1.3333 ÷ 1.25 − 1.' },
    ],
    solution: 'In today’s dollars the old price was 18 × 287.5 ÷ 230.0 = $22.50. Real rise = 24 ÷ 22.50 − 1 ≈ 6.67%. Equivalently, 1.3333 ÷ 1.25 − 1.',
  },
  {
    id: 'f04-m4-3', lesson: 'inflation-and-real-returns', type: 'num', kind: 'applied',
    prompt: 'Last year a fictional scholarship fund earned 6.9% while a price index rose from 304.0 to 313.1. What was the fund’s exact real return? Give a percentage to two decimal places.',
    answer: 3.79, check: () => (1.069 / (313.1 / 304) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 3.91, say: 'That subtracts the 2.99% inflation from 6.9%. The exact real return divides: 1.069 ÷ 1.029934 − 1.' },
      { value: -2.2, say: 'That subtracts the 9.1 index points. Inflation is the percentage change in the index: 313.1 ÷ 304.0 − 1 ≈ 2.99%.' },
    ],
    solution: 'Inflation = 313.1 ÷ 304.0 − 1 ≈ 2.9934%. Real return = 1.069 ÷ 1.029934 − 1 ≈ 0.0379, or 3.79%. The fund’s awards could grow by about 3.8% in purchasing power, not the 6.9% the statement shows.',
  },
  {
    id: 'f04-m4-4', lesson: 'inflation-and-real-returns', type: 'num', kind: 'applied',
    prompt: 'A fictional landlord leases a shop for four years. The rent is $30,000 for the first year, paid at the end of the year, and the lease raises it by a fixed 2% a year after that. The landlord expects inflation of 3% a year and discounts at a nominal 9% a year. What is the present value of the rent? Give dollars and cents.',
    answer: 99933.33, check: () => 30000 / 0.07 * (1 - (1.02 / 1.09) ** 4), unit: '$', places: 2, tol: 5,
    wrong: [
      { value: 107393.05, say: 'That discounts the contractual (nominal) rents at the real rate. The rents are fixed in dollars by the lease, so discount them at the nominal 9%.' },
      { value: 97191.6, say: 'That ignores the 2% rises: it values four level rents of $30,000.' },
      { value: 101330.59, say: 'That grows the rent at the 3% inflation rate. The lease fixes the rises at 2% a year whatever inflation does.' },
    ],
    solution: 'The rents are written into the lease in dollars, so they are nominal: $30,000, $30,600, $31,212 and $31,836.24. They form a growing annuity, valued at the nominal rate: PV = 30,000 ÷ (0.09 − 0.02) × [1 − (1.02 ÷ 1.09)⁴] ≈ $99,933.33. The 3% inflation forecast is not needed for the value; it tells the landlord that the rent loses about 1% of purchasing power a year.',
  },
  {
    id: 'f04-m4-5', lesson: 'inflation-and-real-returns', type: 'mc', kind: 'conceptual',
    prompt: 'An investor buys US TIPS with an original principal of $1,000. Over the five years to maturity, prices fall overall, so the inflation-adjusted principal at maturity is $970. How much principal does the investor receive at maturity?',
    options: ['$1,000', '$970', '$1,030', '$970 plus the interest withheld during the deflation'],
    answer: 0,
    feedback: {
      1: 'The adjusted principal falls with deflation, but at maturity TIPS repay the adjusted principal or the original principal, whichever is greater.',
      2: 'That would be the result of 3% inflation, not 3% deflation.',
      3: 'No interest is withheld. Interest is paid every six months on the adjusted principal as it stands; only the final repayment has a floor.',
    },
    solution: 'At maturity TIPS repay the greater of the adjusted principal and the original principal, so the investor receives $1,000. Interest paid along the way was calculated on the lower adjusted principal.',
  },
  {
    id: 'f04-m4-6', lesson: 'mortgages', type: 'num', kind: 'numerical',
    prompt: 'A fictional couple can afford at most $1,900 a month for principal and interest. At a fixed 7.25% a year over 30 years, repaid monthly, what is the largest loan they can take? Give the answer to the nearest dollar.',
    answer: 278520.38, check: () => { const r = 0.0725 / 12; return 1900 * (1 - (1 + r) ** -360) / r; }, unit: '$', places: 0, tol: 25,
    wrong: [
      { value: 684000, say: 'That adds up 360 payments without discounting. Most of each payment covers interest; the loan is the present value of the payments.' },
      { value: 275963.51, say: 'That values twelve months’ payments as one annual payment over 30 years. Interest is charged monthly: use the monthly rate and 360 months.' },
    ],
    solution: 'The loan is the present value of the payments: PV = 1,900 × (1 − 1.00604167⁻³⁶⁰) ÷ 0.00604167 ≈ 1,900 × 146.5897 ≈ $278,520.',
  },
  {
    id: 'f04-m4-7', lesson: 'mortgages', type: 'num', kind: 'numerical',
    prompt: 'A fictional 15-year mortgage of $200,000 at 5.75% has a payment of about $1,660.82 a month. How much is still owed after five years (60 payments)? Give the answer to the nearest dollar.',
    answer: 151301.08, check: () => { const r = 0.0575 / 12, C = 200000 * r / (1 - (1 + r) ** -180); return C * (1 - (1 + r) ** -120) / r; }, unit: '$', places: 0, tol: 25,
    wrong: [{ value: 100350.79, say: 'Subtracting 60 payments from the loan ignores the interest they covered. Value the 120 payments still to come.' }],
    solution: 'Prospective method: B₆₀ = 1,660.82 × (1 − 1.00479167⁻¹²⁰) ÷ 0.00479167 ≈ $151,301. A third of the way through a 15-year loan, about a quarter of the principal has been repaid.',
  },
  {
    id: 'f04-m4-8', lesson: 'mortgages', type: 'num', kind: 'applied',
    prompt: 'A fictional family has just taken a $310,000 30-year mortgage at 6.875% (payment about $2,036.48) and decides to pay $300 extra every month from the start. How many monthly payments will it take to repay the loan, counting a final smaller payment as one?',
    answer: 250, check: () => { const r = 0.06875 / 12, C = 310000 * r / (1 - (1 + r) ** -360) + 300; return Math.ceil(-Math.log(1 - r * 310000 / C) / Math.log(1 + r)); }, unit: 'payments', places: 0, tol: 0.5,
    wrong: [
      { value: 360, say: 'That is the original term. The extra $300 goes straight to principal, so the loan ends sooner.' },
      { value: 249, say: 'That counts only the full payments; the smaller final payment is still a payment.' },
      { value: 20.8, say: 'That is the answer in years. Give the number of monthly payments.' },
    ],
    solution: 'C = 2,036.48 + 300 = $2,336.48; r × PV = 0.00572917 × 310,000 ≈ $1,776.04. n = −ln(1 − 1,776.04 ÷ 2,336.48) ÷ ln(1.00572917) ≈ 249.9, so 250 payments, about 20 years 10 months instead of 30 years.',
  },
  {
    id: 'f04-m4-9', lesson: 'mortgages', type: 'mc', kind: 'applied',
    prompt: 'A fictional buyer borrowing $350,000 over 30 years can pay 1 point ($3,500) to cut the rate from 6.875% to 6.625%, saving about $58.16 a month. She expects to keep the loan for at least twelve years and does not expect to refinance. What should she conclude?',
    options: [
      'Buying the point is likely worth it: the simple break-even is about 60 months, and over twelve years its net present-value gain, valued at 6.875%, is about $3,133',
      'Decline the point: $3,500 is more than a year of savings',
      'Decline the point: the APR with the point is higher than 6.625%, so the point must be a bad deal',
      'It cannot be judged without knowing the property taxes',
    ],
    answer: 0,
    feedback: {
      1: 'A year of savings is only the start; she expects to keep the loan for twelve years.',
      2: 'The APR is always above the contract rate when points are paid; compare it with the no-points loan’s 6.875%, or better, test the holding period.',
      3: 'Taxes are paid either way and do not depend on the points.',
    },
    solution: 'Break-even = 3,500 ÷ 58.16 ≈ 60.2 months (about five years). Valuing the points loan’s cash flows over 144 months at 6.875% gives a gain of about $3,133. With a long expected stay and no plan to refinance, the point pays.',
  },
  {
    id: 'f04-m4-10', lesson: 'mortgages', type: 'num', kind: 'applied',
    prompt: 'A fictional household’s fixed mortgage payment is $2,200 a month. At what constant inflation rate would the payment due in 20 years be worth half as much in today’s dollars as it is today? Give a percentage to two decimal places.',
    answer: 3.53, check: () => (2 ** (1 / 20) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 2.5, say: 'That spreads a 50% fall evenly over 20 years (50 ÷ 20). Inflation compounds: solve (1 + i)²⁰ = 2.' },
      { value: 5, say: 'That treats a doubling of prices as 100% spread over 20 years (100 ÷ 20). Inflation compounds: take the 20th root of 2.' },
    ],
    solution: 'The payment is worth half as much when prices have doubled: (1 + i)²⁰ = 2, so i = 2^(1/20) − 1 ≈ 0.0353, or 3.53% a year. (The rule of 72 gives about 72 ÷ 20 = 3.6%.) The $2,200 payment would then be worth $1,100 of today’s purchasing power.',
  },
  {
    id: 'f04-m4-11', lesson: 'mortgages', type: 'classify', kind: 'conceptual',
    prompt: 'According to the CFPB, which of these does the APR on a US mortgage reflect?',
    items: [
      'The interest rate',
      'Discount points',
      'A mortgage broker’s fee',
      'Property taxes collected through escrow',
      'Homeowners insurance premiums',
    ],
    categories: ['Reflected in the APR', 'Not reflected in the APR'],
    answer: [0, 0, 0, 1, 1],
    feedback: {
      1: 'Points are a charge paid to get the loan, so they are in the APR.',
      2: 'Broker fees are named by the CFPB as part of what the APR reflects.',
      3: 'Taxes are a cost of owning the home, not of the loan.',
      4: 'Insurance protects the home; it is not a charge for the credit.',
    },
    solution: 'The CFPB explains that the APR reflects the interest rate, any points, mortgage broker fees and other charges paid to get the loan. Property taxes and homeowners insurance, even when paid through escrow, are costs of owning the home.',
  },
  {
    id: 'f04-m4-12', lesson: 'mortgages', type: 'num', kind: 'numerical',
    prompt: 'A fictional ARM started at 5.0% and after its first reset charges 7.0%. Its caps are 2 percentage points at the first reset, 1 point at each later reset and 5 points over the life of the loan. At the next reset the index is 5.8% and the margin 2.5 points. What is the new interest rate, in percent?',
    answer: 8, check: () => Math.min(5.8 + 2.5, 7.0 + 1, 5.0 + 5), unit: '%', places: 2, tol: 0.005,
    wrong: [
      { value: 8.3, say: 'That is the fully indexed rate before caps. After the first reset the subsequent cap limits each move to 1 point.' },
      { value: 9, say: 'That applies the 2-point initial cap. The first reset has already happened; later resets use the 1-point cap.' },
      { value: 10, say: 'That is the lifetime maximum (5.0% + 5). The 1-point subsequent cap binds first.' },
    ],
    solution: 'Fully indexed rate = 5.8% + 2.5% = 8.3%. The subsequent cap allows at most 7.0% + 1 = 8.0%; the lifetime cap allows up to 5.0% + 5 = 10.0%. The tightest limit applies, so the new rate is 8.0%.',
  },
];
