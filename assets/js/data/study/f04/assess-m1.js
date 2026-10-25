// assess-m1.js — F04 module 1 test: Interest (simple-and-compound-interest, effective-annual-rates). No hints. Each item
// has a full solution, shown when the student reviews the test. Every business and figure here is fictional; the
// lesson exercises' numbers and set-ups are not reused, so the test checks the method.

const ear = (apr, m) => (1 + apr / m) ** m - 1;

export const items = [
  {
    id: 'f04-m1-1', lesson: 'simple-and-compound-interest', type: 'num', kind: 'numerical',
    prompt: 'A fictional food truck pays $210 of simple interest on a $4,500 loan that runs for eight months. What annual interest rate is it paying? Give a percentage to two decimal places.',
    answer: 7.00, check: () => 210 / (4500 * 8 / 12) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 4.67, say: 'That is the interest as a share of the loan for the eight months. An annual rate divides by the time in years as well: r = I ÷ (P × t).' },
      { value: 0.58, say: 'That is the rate per month. Multiply by 12, or divide by t = 8 ÷ 12 of a year.' },
    ],
    solution: 'r = I ÷ (P × t) = 210 ÷ (4,500 × 8 ÷ 12) = 210 ÷ 3,000 = 0.07, or 7.00% a year.',
  },
  {
    id: 'f04-m1-2', lesson: 'simple-and-compound-interest', type: 'num', kind: 'applied',
    prompt: 'A fictional events company owes a supplier $12,000 and is charged 9% a year simple interest, on an actual/360 basis, for the 75 days it pays late. How much interest does it owe, to the nearest cent?',
    answer: 225.00, check: () => 12000 * 0.09 * 75 / 360, unit: '$', places: 2, tol: 0.05,
    wrong: [
      { value: 221.92, say: 'That divides by 365. The agreement uses actual/360: 75 days over 360.' },
      { value: 1080, say: 'That is a full year’s interest. Multiply by 75 ÷ 360.' },
    ],
    solution: 'I = 12,000 × 0.09 × 75 ÷ 360 = $225.00. On actual/365 it would be $221.92: the 360-day basis charges a little more for the same quoted rate.',
  },
  {
    id: 'f04-m1-3', lesson: 'simple-and-compound-interest', type: 'num', kind: 'numerical',
    prompt: 'A fictional saver deposits $6,000 in an account paying 5% a year, compounded and credited once a year on the anniversary of the deposit. If money is withdrawn between anniversaries, the account pays simple interest on the balance for the part-year. The saver closes the account after 2 years and 9 months. How much does she receive, to the nearest cent?',
    answer: 6863.06, check: () => 6000 * 1.05 ** 2 * (1 + 0.05 * 0.75), unit: '$', places: 2, tol: 0.25,
    wrong: [
      { value: 6861.54, say: 'That is the smooth-growth formula with n = 2.75. This account compounds only on its anniversaries and pays simple interest for the last nine months.' },
      { value: 6825, say: 'That is simple interest for the whole time. The first two years’ interest is credited and compounds.' },
      { value: 6615, say: 'That leaves out the nine months after the second anniversary, for which the account pays simple interest on withdrawal.' },
    ],
    solution: 'After two anniversaries: 6,000 × 1.05² = $6,615.00. Then nine months of simple interest on that balance: 6,615 × 0.05 × 0.75 ≈ $248.06. She receives about $6,863.06, slightly more than the smooth-growth formula (6,000 × 1.05^2.75 ≈ $6,861.54), because within a period simple interest pays more than compound.',
  },
  {
    id: 'f04-m1-4', lesson: 'simple-and-compound-interest', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional fund rises 50% in its first year and falls 50% in its second. What is its compound annual growth rate over the two years?',
    options: [
      'About −13.40% a year',
      '0% a year',
      '−25% a year',
      '−50% a year',
    ],
    answer: 0,
    feedback: {
      1: '0% is the average of the yearly returns, but the fund ends below where it started. The CAGR works from the start and end values.',
      2: 'The total loss is 25%, but dividing it by two years ignores compounding. Take the square root of 0.75.',
      3: 'The fund ends at $0.75 per $1: a 25% loss over two years, about −13.40% a year compounded, not −50% a year.',
    },
    solution: '$1 grows to $1.50 and then falls to $0.75. CAGR = (0.75 ÷ 1)^(1/2) − 1 ≈ 0.8660 − 1 ≈ −13.40% a year. The average of the yearly returns (0%) hides the loss.',
  },
  {
    id: 'f04-m1-5', lesson: 'simple-and-compound-interest', type: 'num', kind: 'applied',
    prompt: 'A fictional investor puts $250,000 into a café chain and wants her stake to be worth $1,000,000 when she sells it in eight years. What compound annual return does her plan require? Give a percentage to two decimal places.',
    answer: 18.92, check: () => ((1000000 / 250000) ** (1 / 8) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 37.5, say: 'That is the 300% total gain divided by eight years: simple arithmetic. Take the eighth root of 4.' },
      { value: 18, say: 'That is the rule-of-72 estimate (two doublings in eight years, so 72 ÷ 4). The question asks for the exact rate.' },
      { value: 300, say: 'That is the total gain, not the rate per year.' },
    ],
    solution: 'Ratio 1,000,000 ÷ 250,000 = 4. Required return = 4^(1/8) − 1 ≈ 1.189207 − 1 ≈ 18.92% a year. The stake must double twice in eight years, so the rule of 72 gives a quick check: 72 ÷ 4 = 18%.',
  },
  {
    id: 'f04-m1-6', lesson: 'simple-and-compound-interest', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional banks quote the same 4% simple rate on a 120-day deposit, one on an actual/360 basis and one on an actual/365 basis. Which statement is correct?',
    options: [
      'The actual/360 deposit pays more, because 120 days is a larger fraction of a 360-day year',
      'They pay exactly the same, because the quoted rate is the same',
      'The actual/365 deposit pays more, because it counts more days in the year',
      'The actual/360 deposit pays less, because a 360-day year leaves out five days that a 365-day year pays interest for',
    ],
    answer: 0,
    feedback: {
      1: 'The quoted rate is the same, but the fraction of a year it is applied to differs: 120 ÷ 360 against 120 ÷ 365.',
      2: 'A longer “year” makes the 120 days a smaller fraction of it, so less interest.',
      3: 'Both count the same 120 actual days; only the divisor differs, and the smaller divisor gives more interest.',
    },
    solution: 'Interest = P × r × days ÷ basis. With the same 120 days, dividing by 360 gives a fraction of 0.3333 against 0.3288 for 365, so the actual/360 deposit pays 365 ÷ 360 ≈ 1.0139 times as much, about 1.39% more.',
  },
  {
    id: 'f04-m1-7', lesson: 'effective-annual-rates', type: 'num', kind: 'applied',
    prompt: 'A fictional US bank pays $187.50 of interest at maturity on a $5,000 certificate of deposit with a 270-day term. What annual percentage yield must it disclose under Regulation DD? Give a percentage to two decimal places.',
    answer: 5.10, check: () => 100 * ((1 + 187.5 / 5000) ** (365 / 270) - 1), unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 5.07, say: 'That scales the 3.75% term return by 365 ÷ 270 without compounding. The APY formula raises 1.0375 to the power 365 ÷ 270.' },
      { value: 3.75, say: 'That is the return over the 270-day term. The APY annualises it.' },
      { value: 5, say: 'That treats 270 days as nine months and scales by 12 ÷ 9, without compounding. Use the actual days and the Appendix A formula.' },
    ],
    solution: 'APY = 100 × [(1 + Interest ÷ Principal)^(365 ÷ Days in term) − 1] = 100 × [(1 + 187.50 ÷ 5,000)^(365 ÷ 270) − 1] = 100 × (1.0375^1.351852 − 1) ≈ 5.10%.',
  },
  {
    id: 'f04-m1-8', lesson: 'effective-annual-rates', type: 'num', kind: 'numerical',
    prompt: 'A fictional rowing club’s reserve fund grew from $15,000 to $18,600 in four years, with nothing added or withdrawn, in an account that compounds interest continuously. What nominal annual rate, compounded continuously, did the account pay? Give a percentage to two decimal places.',
    answer: 5.38, check: () => Math.log(18600 / 15000) / 4 * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 5.53, say: 'That is 1.24^(1/4) − 1, the rate compounded annually (the account’s EAR). Continuously, e^(4 × APR) = 1.24, so APR = ln 1.24 ÷ 4.' },
      { value: 6, say: 'That is the 24% growth divided by four years: simple interest. With compounding, a lower rate reaches the same balance.' },
      { value: 21.51, say: 'That is ln 1.24, the continuously compounded rate for the whole four years. Divide by 4 for the rate a year.' },
    ],
    solution: 'FV = PV × e^(APR × t), so e^(4 × APR) = 18,600 ÷ 15,000 = 1.24. Taking natural logarithms: 4 × APR = ln 1.24 ≈ 0.215111, so APR ≈ 0.053778, or 5.38% a year. The same growth compounded annually needs 1.24^(1/4) − 1 ≈ 5.53%, the account’s EAR, and e^0.053778 − 1 gives the same 5.53%.',
  },
  {
    id: 'f04-m1-9', lesson: 'effective-annual-rates', type: 'mc', kind: 'applied',
    prompt: 'A fictional bakery chain can borrow for one year, repaying everything at the end, at (A) 9.0% compounded monthly, (B) 9.2% compounded semi-annually, (C) 9.1% compounded quarterly or (D) 8.95% compounded continuously. Ignoring fees, which is cheapest?',
    options: [
      'D (8.95% compounded continuously)',
      'A (9.0% compounded monthly)',
      'B (9.2% compounded semi-annually)',
      'C (9.1% compounded quarterly)',
    ],
    answer: 0,
    feedback: {
      1: 'A’s EAR, about 9.3807%, is low but above D’s 9.3627%.',
      2: 'B compounds least often, but its higher rate gives an EAR of 9.4116%, the second highest.',
      3: 'C is the dearest: (1 + 0.091 ÷ 4)⁴ − 1 ≈ 9.4153%.',
    },
    solution: 'EARs: A 1.0075¹² − 1 ≈ 9.3807%; B 1.046² − 1 = 9.4116%; C 1.02275⁴ − 1 ≈ 9.4153%; D e^0.0895 − 1 ≈ 9.3627%. D is cheapest despite continuous compounding, because its nominal rate is lowest by enough.',
  },
  {
    id: 'f04-m1-10', lesson: 'effective-annual-rates', type: 'num', kind: 'numerical',
    prompt: 'A savings plan must earn an effective 5% a year. What nominal annual rate, compounded quarterly, achieves exactly that? Keep the quarterly rate to at least six significant figures, and give a percentage to two decimal places.',
    answer: 4.91, check: () => 4 * (1.05 ** 0.25 - 1) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: 5, say: 'A nominal 5% compounded quarterly gives an EAR of about 5.09%, more than needed. The nominal rate must be lower.' },
      { value: 5.09, say: 'That is the EAR of 5% compounded quarterly. Work backwards: 4 × (1.05^(1/4) − 1).' },
      { value: 1.25, say: 'That is 5% ÷ 4, a quarterly rate, and dividing an effective rate overstates it. The nominal annual rate is 4 × (1.05^(1/4) − 1).' },
    ],
    solution: 'Quarterly rate = 1.05^(1/4) − 1 ≈ 1.2272%. Nominal annual rate = 4 × 1.2272% ≈ 4.91%.',
  },
  {
    id: 'f04-m1-11', lesson: 'effective-annual-rates', type: 'classify', kind: 'conceptual',
    prompt: 'Is each statement true or false?',
    items: [
      'A US savings account’s APY reflects compounding.',
      'A US credit card’s APR includes the effect of monthly compounding.',
      'Two rates with the same effective annual rate are equivalent, whatever their compounding frequencies.',
      'Compounding more and more often makes the effective annual rate grow without limit.',
      'Dividing an effective annual rate by 12 gives the equivalent monthly rate.',
    ],
    categories: ['True', 'False'],
    answer: [0, 1, 0, 1, 1],
    feedback: {
      0: 'Regulation DD defines the APY as reflecting the total interest paid, based on the rate and the frequency of compounding.',
      1: 'A card APR is the periodic rate times the number of periods in a year: a nominal rate that ignores compounding.',
      2: 'Equivalent rates are defined as those giving the same growth over a year, which is the same EAR.',
      3: 'It approaches a ceiling, e^APR − 1, the continuously compounded rate.',
      4: 'The monthly rate is (1 + EAR)^(1/12) − 1, which is smaller than EAR ÷ 12.',
    },
    solution: 'True: the APY reflects compounding; equivalent rates share an EAR. False: a card APR ignores compounding; the EAR approaches e^APR − 1 rather than growing without limit; the monthly equivalent of an EAR is its twelfth root minus 1, not EAR ÷ 12.',
  },
  {
    id: 'f04-m1-12', lesson: 'effective-annual-rates', type: 'num', kind: 'applied',
    prompt: 'A fictional invoice-finance firm pays a café $9,800 today for a $10,000 invoice that the café’s client will pay in 45 days. What effective annual rate is the café paying for the money? Give a percentage to two decimal places.',
    answer: 17.81, check: () => ((1 + 200 / 9800) ** (365 / 45) - 1) * 100, unit: '%', places: 2, tol: 0.05,
    wrong: [
      { value: 16.55, say: 'That is the nominal annual rate (2.0408% × 365 ÷ 45). Compound it: 1.020408^(365 ÷ 45) − 1.' },
      { value: 16.22, say: 'That takes 2% of the invoice and scales it to a year. The café receives $9,800, so the 45-day rate is 200 ÷ 9,800, and it compounds.' },
      { value: 2.04, say: 'That is the rate for 45 days. Annualise it.' },
    ],
    solution: 'The café receives $9,800 and gives up $10,000 in 45 days: $200 for the use of $9,800, or 200 ÷ 9,800 ≈ 2.0408% per 45 days. Periods a year = 365 ÷ 45 ≈ 8.11. EAR = 1.020408^(365 ÷ 45) − 1 ≈ 17.81%. The café should compare that with what a bank would charge it to borrow for the same 45 days.',
  },
];
