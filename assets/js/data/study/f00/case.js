// case.js — the F00 Foundations of Finance story: Ana Lim in January and February 2026, before she starts Lantern
// Coffee Co. on 1 March 2026 (the business F01 follows from that day). One source of truth for the facts every F00
// lesson, exercise, assessment and the project use. Every name and figure here is invented for teaching, including
// the market rates and the listed company; none describes a real bank, fund or firm.
//
// Agrees with f01/case.js: on 1 March 2026 Ana invests $20,000 in Lantern for common stock, and Lantern borrows
// $10,000 from Coastline Bank on a two-year note at 6% a year, interest paid every three months, repaid 1 March 2028.

export const ANA = {
  name: 'Ana Lim',
  job: 'head barista trainer at a regional café chain',
  salary: 52_000,                 // a year, before tax; she gives this up to run Lantern full time
  savings: 26_000,                // in a Coastline Bank savings account on 1 January 2026
  savingsRate: 1.5,               // % a year, paid once a year
  investInLantern: 20_000,        // on 1 March 2026 (f01 m1)
  emergencyFund: 6_000,           // what she keeps outside the business: savings − investInLantern
  loan: { lender: 'Coastline Bank', amount: 10_000, rate: 6, years: 2, interestEvery: '3 months', start: '1 March 2026', repaid: '1 March 2028' },
};

/** The two homes Ana considers for her $6,000 emergency fund (the F00 project). Rates are fictional. */
export const SAVINGS_CHOICES = {
  cd: {
    name: 'Coastline Bank two-year certificate of deposit',
    rate: 4.0, compounding: 'annual', years: 2,
    penalty: 'six months’ interest if any money is withdrawn before the two years are up',
    insured: true,
  },
  savings: {
    name: 'Harbor Online high-yield savings account',
    rate: 3.2, compounding: 'monthly', years: 2,
    access: 'withdraw any amount at any time; the rate is variable and the bank can change it',
    insured: true,
  },
  inflation: 2.8,                 // % a year, Ana's assumption for the next two years (not a forecast)
};

/** A fictional listed coffee roaster, used to teach market value words. Figures in $ millions except per share. */
export const HARBOURLINE = {
  name: 'Harbourline Roasters Inc.',
  sharePrice: 42.5,               // $ per share
  shares: 18,                     // million shares outstanding
  debt: 210, cash: 45,
  revenue: 640, ebit: 61, da: 32, netIncome: 38,
  currentAssets: 180, currentLiabilities: 120,
};

/** More of Harbourline's (fictional) statements, first used in f00/capital-and-liquidity and value-and-valuation-words.
 *  They tie to HARBOURLINE: current assets 45 + 55 + 70 + 10 = 180; total assets 180 + 480 = 660 = liabilities
 *  120 + 210 + 30 + equity 300; revenue 640 − operating costs 547 = EBITDA 93; EBIT 61 − interest 11 = 50 before tax;
 *  tax 12 (24%) leaves net income 38. All $210m of debt is long-term. */
export const HARBOURLINE_DETAIL = {
  receivables: 55, inventory: 70, otherCurrentAssets: 10, noncurrentAssets: 480, totalAssets: 660,
  otherNoncurrentLiabilities: 30, bookEquity: 300,
  operatingCostsExDA: 547, interest: 11, profitBeforeTax: 50, tax: 12, capex: 35,
};

const h = HARBOURLINE;
export const HARBOURLINE_DERIVED = {
  marketCap: h.sharePrice * h.shares,                                   // 765
  enterpriseValue: h.sharePrice * h.shares + h.debt - h.cash,          // 930
  ebitda: h.ebit + h.da,                                                // 93
  evToEbitda: (h.sharePrice * h.shares + h.debt - h.cash) / (h.ebit + h.da),   // 10.0
  workingCapital: h.currentAssets - h.currentLiabilities,               // 60
  currentRatio: h.currentAssets / h.currentLiabilities,                 // 1.5
  pe: (h.sharePrice * h.shares) / h.netIncome,                          // 20.13…
};

/** Results for the project, recomputed by tools/study-check.mjs from SAVINGS_CHOICES. */
const c = SAVINGS_CHOICES;
const fvCd = ANA.emergencyFund * (1 + c.cd.rate / 100) ** 2;
const fvSav = ANA.emergencyFund * (1 + c.savings.rate / 100 / 12) ** 24;
export const PROJECT_RESULTS = {
  fvCd,                                                   // 6,489.60
  fvSavings: fvSav,                                       // ≈ 6,396.01
  earSavings: ((1 + c.savings.rate / 100 / 12) ** 12 - 1) * 100,   // ≈ 3.2474 %
  realCd: ((1 + c.cd.rate / 100) / (1 + c.inflation / 100) - 1) * 100,             // ≈ 1.167 %
  realSavings: ((1 + c.savings.rate / 100 / 12) ** 12 / (1 + c.inflation / 100) - 1) * 100,   // ≈ 0.435 %
  cdPenaltyYear1: ANA.emergencyFund * c.cd.rate / 100 / 2,           // six months' interest on $6,000 at 4%: $120
};
