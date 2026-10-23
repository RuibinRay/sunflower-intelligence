// assess-m1.js — F04 module 1 test: Interest (simple-and-compound-interest, effective-annual-rates). No hints. Each item
// has a full solution, shown when the student reviews the test. Every business and figure here is fictional; the
// lesson exercises' numbers are not reused, so the test checks the method.

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
    answer: 225.00, check: () => 12000 * 0.09 * 75 / 360, unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 221.92, say: 'That divides by 365. The agreement uses actual/360: 75 days over 360.' },
      { value: 1080, say: 'That is a full year’s interest. Multiply by 75 ÷ 360.' },
    ],
    solution: 'I = 12,000 × 0.09 × 75 ÷ 360 = $225.00. On actual/365 it would be $221.92: the 360-day basis charges a little more for the same quoted rate.',
  },
  {
    id: 'f04-m1-3', lesson: 'simple-and-compound-interest', type: 'num', kind: 'numerical',
    prompt: 'How many years does $20,000 take to grow to $50,000 at 7% a year compounded annually, by the formula? Give two decimal places.',
    answer: 13.54, check: () => Math.log(50000 / 20000) / Math.log(1.07), unit: 'years', places: 2, tol: 0.02,
    wrong: [
      { value: 21.43, say: 'That is 150% growth ÷ 7% a year: simple interest. Use n = ln(FV ÷ PV) ÷ ln(1 + r).' },
      { value: 10.29, say: 'That is the rule-of-72 doubling time at 7%. The target is 2.5 times the start, not double.' },
    ],
    solution: 'n = ln(50,000 ÷ 20,000) ÷ ln 1.07 = ln 2.5 ÷ ln 1.07 = 0.916291 ÷ 0.067659 ≈ 13.54 years.',
  },
  {
    id: 'f04-m1-4', lesson: 'simple-and-compound-interest', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional fund rises 50% in its first year and falls 50% in its second. What is its compound annual growth rate over the two years?',
    options: [
      'About −13.40% a year: $1 becomes $0.75, and 0.75^(1/2) − 1 ≈ −0.1340',
      '0%: the average of +50% and −50%',
      '−25% a year: the total loss of 25% spread over two years',
      '−50% a year, because the fall cancels the rise',
    ],
    answer: 0,
    feedback: {
      1: 'The average of the yearly returns is 0%, but the fund ends below where it started. The CAGR works from the start and end values.',
      2: 'The total loss is 25%, but dividing by two years ignores compounding. Take the square root of 0.75.',
      3: 'A 50% fall from a higher base loses more dollars than the 50% rise gained: $1 → $1.50 → $0.75.',
    },
    solution: '$1 grows to $1.50 and then falls to $0.75. CAGR = (0.75 ÷ 1)^(1/2) − 1 ≈ 0.8660 − 1 ≈ −13.40% a year. The arithmetic average of the yearly returns (0%) hides the loss.',
  },
  {
    id: 'f04-m1-5', lesson: 'simple-and-compound-interest', type: 'num', kind: 'applied',
    prompt: 'A fictional landlord bought a flat for $180,000 and sold it six years later for $243,000. Ignoring rent and costs, what compound annual growth rate did its price achieve? Give a percentage to two decimal places.',
    answer: 5.13, check: () => ((243000 / 180000) ** (1 / 6) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 5.83, say: 'That is the 35% total gain divided by six years: simple arithmetic. Take the sixth root of 1.35.' },
      { value: 35, say: 'That is the total gain, not the rate per year.' },
    ],
    solution: 'Ratio 243,000 ÷ 180,000 = 1.35. CAGR = 1.35^(1/6) − 1 ≈ 1.051289 − 1 ≈ 5.13% a year.',
  },
  {
    id: 'f04-m1-6', lesson: 'simple-and-compound-interest', type: 'mc', kind: 'conceptual',
    prompt: 'Two fictional banks quote the same 4% simple rate on a 120-day deposit, one on an actual/360 basis and one on an actual/365 basis. Which statement is correct?',
    options: [
      'The actual/360 deposit pays more, because 120 days is a larger fraction of a 360-day year',
      'They pay exactly the same, because the quoted rate is the same',
      'The actual/365 deposit pays more, because it counts more days in the year',
      'The actual/360 deposit pays less, because it ignores five days of interest',
    ],
    answer: 0,
    feedback: {
      1: 'The quoted rate is the same, but the fraction of a year it is applied to differs: 120 ÷ 360 against 120 ÷ 365.',
      2: 'A longer “year” makes the 120 days a smaller fraction of it, so less interest.',
      3: 'Both count the same 120 actual days; only the divisor differs, and the smaller divisor gives more interest.',
    },
    solution: 'Interest = P × r × days ÷ basis. With the same 120 days, dividing by 360 gives a fraction of 0.3333 against 0.3288 for 365, so the actual/360 deposit pays 365 ÷ 360 ≈ 1.39% more interest.',
  },
  {
    id: 'f04-m1-7', lesson: 'effective-annual-rates', type: 'num', kind: 'numerical',
    prompt: 'What is the effective annual rate of 10% a year compounded semi-annually? Give a percentage to two decimal places.',
    answer: 10.25, check: () => ear(0.10, 2) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 10, say: 'That is the nominal rate. Compound the half-year rate twice.' },
      { value: 5, say: 'That is the half-year rate. Compound it over two halves.' },
    ],
    solution: 'Half-year rate = 10% ÷ 2 = 5%. EAR = 1.05² − 1 = 0.1025, or 10.25%.',
  },
  {
    id: 'f04-m1-8', lesson: 'effective-annual-rates', type: 'num', kind: 'numerical',
    prompt: 'You invest $8,000 for three years at 4.5% a year compounded continuously. What is the balance at the end, to the nearest cent?',
    answer: 9156.29, check: () => 8000 * Math.exp(0.045 * 3), unit: '$', places: 2, tol: 0.05,
    wrong: [
      { value: 9129.33, say: 'That is annual compounding. Continuous: 8,000 × e^(0.045 × 3).' },
      { value: 9153.98, say: 'That is monthly compounding. Continuous compounding is the limit: e^0.135.' },
      { value: 9080, say: 'That is simple interest.' },
    ],
    solution: 'FV = 8,000 × e^(0.045 × 3) = 8,000 × e^0.135 ≈ 8,000 × 1.144537 ≈ $9,156.29.',
  },
  {
    id: 'f04-m1-9', lesson: 'effective-annual-rates', type: 'mc', kind: 'applied',
    prompt: 'A fictional bakery chain can borrow for one year, repaying everything at the end, at (A) 9.0% compounded monthly, (B) 9.2% compounded semi-annually, (C) 9.1% compounded quarterly or (D) 8.95% compounded continuously. Ignoring fees, which is cheapest?',
    options: [
      'D: its EAR is about 9.36%, the lowest of the four',
      'A: its EAR is about 9.38%, the lowest of the four',
      'B: semi-annual compounding is the least frequent of the four',
      'C: its quoted rate is in the middle, so its cost is too',
    ],
    answer: 0,
    feedback: {
      1: 'A’s EAR of 9.3807% is low, but D’s 9.3627% is lower.',
      2: 'B compounds least often, but its higher rate gives an EAR of 9.4116%, the second highest.',
      3: 'C is the dearest: (1 + 0.091 ÷ 4)⁴ − 1 ≈ 9.4153%.',
    },
    solution: 'EARs: A 1.0075¹² − 1 ≈ 9.3807%; B 1.046² − 1 = 9.4116%; C 1.02275⁴ − 1 ≈ 9.4153%; D e^0.0895 − 1 ≈ 9.3627%. D is cheapest despite continuous compounding, because its nominal rate is lowest by enough.',
  },
  {
    id: 'f04-m1-10', lesson: 'effective-annual-rates', type: 'num', kind: 'numerical',
    prompt: 'A savings plan must earn an effective 5% a year. What nominal annual rate, compounded monthly, achieves exactly that? Give a percentage to two decimal places.',
    answer: 4.89, check: () => 12 * (1.05 ** (1 / 12) - 1) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 5, say: 'A nominal 5% compounded monthly gives an EAR of about 5.12%, more than needed. The nominal rate must be lower.' },
      { value: 5.12, say: 'That is the EAR of 5% compounded monthly. Work backwards: 12 × (1.05^(1/12) − 1).' },
    ],
    solution: 'Monthly rate = 1.05^(1/12) − 1 ≈ 0.4074%. Nominal annual rate = 12 × 0.4074% ≈ 4.89%.',
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
    prompt: 'A fictional florist’s wholesaler offers terms of 3/15, net 45. What effective annual rate does the florist pay if it skips the discount and pays on day 45? Give a percentage to two decimal places.',
    answer: 44.86, check: () => ((1 + 3 / 97) ** (365 / 30) - 1) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: 37.63, say: 'That is the nominal annual rate (3.0928% × 365 ÷ 30). Compound it: 1.030928^(365 ÷ 30) − 1.' },
      { value: 3.09, say: 'That is the rate for the 30 extra days. Annualise it.' },
      { value: 36.5, say: 'That is 3% × 365 ÷ 30. The base is the discounted 97%, and the rate compounds.' },
    ],
    solution: 'Skipping the discount means paying 3% of the invoice to keep 97% of it for 30 more days: 3 ÷ 97 ≈ 3.0928% per 30 days. Periods a year = 365 ÷ 30 ≈ 12.17. EAR = 1.030928^(365 ÷ 30) − 1 ≈ 44.86%. Unless the florist’s other credit costs more than that, it should take the discount.',
  },
];
