// case.js — the F04 Mathematics of Finance story: Ana Lim and Lantern Coffee Co. in 2027, a year after Lantern opened
// (1 March 2026, F01) and a year after F00's savings decision. One source of truth for the facts every F04 lesson,
// exercise, assessment and the project use. Every name, price and rate here is invented for teaching; the rates are
// plausible, not quotes from any real lender, and none describes a real bank or product.
//
// Agrees with earlier courses:
// - f01/case.js: on 1 March 2026 Lantern borrowed $10,000 from Coastline Bank on a two-year note at 6% a year,
//   interest paid every three months starting 1 June 2026, the $10,000 repaid in full on 1 March 2028.
// - f00/case.js: Ana keeps a $6,000 emergency fund; her savings choices were a Coastline two-year CD at 4.0% and a
//   Sandpiper Online savings account at 3.2% compounded monthly; she assumes inflation of 2.8% a year.

/** Lantern's existing Coastline note (from F01): interest-only, paid quarterly, principal at maturity. */
export const COASTLINE_NOTE = {
  principal: 10_000, rate: 6, paymentsPerYear: 4,
  quarterlyInterest: 10_000 * 0.06 / 4,                  // $150 on 1 June, 1 September, 1 December, 1 March
  issued: '1 March 2026', matures: '1 March 2028',
  marketRateMarch2027: 8,                                // % a year compounded quarterly: what a similar loan costs in March 2027 (fictional)
};

/** March 2027: Lantern wants a cold-brew brewing system for $24,000 and has two ways to pay for it. */
export const BREWER = {
  price: 24_000,
  loan: { lender: 'Coastline Bank', amount: 24_000, apr: 7.2, months: 48, compounding: 'monthly' },
  vendor: { name: 'the supplier’s instalment plan', instalment: 1_050, months: 24, note: '24 monthly payments of $1,050, the first one month after delivery, at “0% interest”' },
};

/** Ana's personal plan, starting 1 April 2027. */
export const ANA_PLAN = {
  home: { price: 300_000, depositShare: 0.20, inYears: 5 },          // a flat she hopes to buy in April 2032
  saving: { account: 'Sandpiper Online savings', rate: 3.6, compounding: 'monthly', start: '1 April 2027' },   // the variable rate has risen from 3.2% (fictional)
  mortgage30: { years: 30, rate: 6.0, compounding: 'monthly' },
  mortgage15: { years: 15, rate: 5.4, compounding: 'monthly' },
  points: { cost: 0.01, rateCut: 0.25 },                              // pay 1% of the loan to cut the 30-year rate by 0.25 points
  inflation: 2.8,                                                     // % a year, her working assumption (as in F00)
  salaryFromLantern: 48_000,                                          // what Lantern pays her a year from 2027 (fictional)
};

// ---------------------------------------------------------------- derived figures (recomputed by the checker)
const pmt = (pv, r, n) => (r === 0 ? pv / n : pv * r / (1 - (1 + r) ** -n));
const balance = (pv, r, n, k) => pv * (1 + r) ** k - pmt(pv, r, n) * ((1 + r) ** k - 1) / r;

const deposit = ANA_PLAN.home.price * ANA_PLAN.home.depositShare;     // 60,000
const loan = ANA_PLAN.home.price - deposit;                            // 240,000
const rSave = ANA_PLAN.saving.rate / 100 / 12;
const r30 = ANA_PLAN.mortgage30.rate / 100 / 12, r15 = ANA_PLAN.mortgage15.rate / 100 / 12;
const p30 = pmt(loan, r30, 360), p15 = pmt(loan, r15, 180);
const rB = BREWER.loan.apr / 100 / 12;
const pB = pmt(BREWER.price, rB, 48);
const qN = COASTLINE_NOTE.marketRateMarch2027 / 100 / 4;

export const DERIVED = {
  deposit, loan,
  monthlySavingForDeposit: deposit * rSave / ((1 + rSave) ** 60 - 1),          // ≈ 914.19
  payment30: p30,                                                              // ≈ 1,438.92
  payment15: p15,                                                              // ≈ 1,948.29
  totalInterest30: p30 * 360 - loan,                                           // ≈ 278,011
  totalInterest15: p15 * 180 - loan,                                           // ≈ 110,692
  balance30after5y: balance(loan, r30, 360, 60),                               // ≈ 223,330
  payment30WithPoint: pmt(loan, (ANA_PLAN.mortgage30.rate - ANA_PLAN.points.rateCut) / 100 / 12, 360),   // ≈ 1,400.57
  brewerPayment: pB,                                                           // ≈ 576.94
  brewerTotalInterest: pB * 48 - BREWER.price,                                 // ≈ 3,693
  vendorPVat72: BREWER.vendor.instalment * (1 - (1 + rB) ** -24) / rB,         // ≈ 23,404: cheaper than $24,000 in cash, valued at 7.2%
  noteValueMarch2027: COASTLINE_NOTE.quarterlyInterest * (1 - (1 + qN) ** -4) / qN + COASTLINE_NOTE.principal * (1 + qN) ** -4,   // ≈ 9,809.61
};
