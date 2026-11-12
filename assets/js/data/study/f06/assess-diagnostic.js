// assess-diagnostic.js — F06 course diagnostic: three items per module, each needing a step that only that module
// teaches, so a student who knows only the prerequisites (F04: discounting, annuities, perpetuities and the Gordon model,
// inflation; F05: YTM as a cost of debt, the CAPM as a formula, the WACC; B04: mean and SD) misses it, and one who has
// the module’s method gets it right. New questions, not copies of lesson exercises, module-test or project items. No
// hints; solutions show in review. Every business, fund and bond here is fictional; nothing uses the simulated series or
// the project’s data. Every figure is computed below from its inputs with core/investments.js.
//
// What each item needs, and why the prerequisites alone fail:
// dg-1  enterprise value (market cap + debt − cash) as the price of a whole business. F04/F05 value cash flows but never
//       bridge a share price to the business; the prerequisite answer is the market capitalisation.
// dg-2  Macaulay duration (PV-weighted time). F05 prices a bond and finds its YTM; it never weights the payment dates, so
//       the prerequisite answer is the maturity, 3 years.
// dg-3  convexity: equal durations, unequal convexity. Nothing in F04/F05 says price moves are asymmetric in yields.
// dg-4  annualising a standard deviation by √(periods). B04 gives the weekly SD; the prerequisite instinct is × 52.
// dg-5  compound growth ≈ arithmetic mean − ½σ². F04 compounds a given rate; B04’s mean is the arithmetic one, so the
//       prerequisite answer is 11%.
// dg-6  maximum drawdown (peak to later trough) against calendar-year returns. B04 and F04 give period returns only, so the
//       prerequisite answer is the worst calendar year.
// dg-7  two-asset portfolio SD with the covariance term. B04’s SD of one variable gives the weighted average of SDs.
// dg-8  the capital allocation line and the optimal risky share y* = (E − r_f) ÷ (Aσ²), here above 1 (borrowing). F05’s
//       CAPM prices one asset; it doesn’t choose how much risk to hold.
// dg-9  beta as the slope of a regression of excess returns. F05 takes beta as given (and unlevers it); the prerequisite
//       guesses are the ratio of mean excess returns or of SDs.
// dg-10 the EV-to-equity bridge after a Gordon value of free cash flow to the firm. F04 gives the Gordon value and F05 the
//       WACC; without the bridge the prerequisite answer is EV ÷ shares.
// dg-11 an EV multiple applied to EBITDA, then bridged to equity per share. Not in F04/F05; the prerequisite answer
//       divides the EV by the shares.
// dg-12 growth creates value only when new investment earns more than the WACC (the value-driver formula). F04’s Gordon
//       model with a higher g always gives a higher value.
import * as IV from '../../../core/investments.js?v=31';

const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (v, d = 2) => `${fx(v * 100, d)}%`;
const mil = (v, d = 0) => `$${fx(v, d)} million`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const claim = (ok, what) => { if (!ok) throw new Error(`assess-diagnostic: the figures no longer support “${what}”`); };

// ---------------------------------------------------------------- module 1
// dg-1 Tolvane Ferries (fictional): the cost of buying the whole business
const TF = { shares: 30, price: 24.5, debt: 310, cash: 45 };
const tfCap = TF.shares * TF.price, tfEv = IV.enterpriseValue({ marketCap: tfCap, debt: TF.debt, cash: TF.cash });
// dg-2 a three-year 7% annual-coupon bond at a 5% yield
const B3 = { face: 100, couponRate: 0.07, years: 3, freq: 1, ytm: 0.05 };
const b3 = IV.duration(B3);
const b3pv = [1, 2, 3].map((t) => (t === 3 ? 107 : 7) / 1.05 ** t);
// dg-3 equal modified duration, unequal convexity, ±1.5 points
const CVX = { d: 7, a: 75, b: 50, dy: 0.015 };
const cv = (c, dy) => IV.priceChangeApprox({ modified: CVX.d, convexity: c }, dy);
claim(cv(CVX.a, CVX.dy) > cv(CVX.b, CVX.dy) && cv(CVX.a, -CVX.dy) > cv(CVX.b, -CVX.dy), 'the more convex bond does better both ways');

// ---------------------------------------------------------------- module 2
// dg-4 weekly returns
const WK = { sd: 0.021, mean: 0.0018 };
const wkAnn = IV.annualise.sd(WK.sd, 52);
// dg-5 arithmetic mean and SD to compound growth
const VD = { a: 0.11, s: 0.30 };
const vdG = VD.a - VD.s ** 2 / 2;
// dg-6 quarter-end values over two years
const QV = [100, 108, 115, 104, 97, 88, 94, 103, 110];
const qRets = QV.slice(1).map((v, i) => v / QV[i] - 1);
const qDd = IV.maxDrawdown(qRets).drawdown;
const qY1 = QV[4] / QV[0] - 1, qY2 = QV[8] / QV[4] - 1;
claim(Math.abs(qDd - (88 / 115 - 1)) < 1e-12 && qY1 > -0.05 && qY2 > 0, 'the drawdown runs from the second quarter of year 1 into year 2, and neither calendar year lost much');

// ---------------------------------------------------------------- module 3
// dg-7 two funds with a covariance
const TW = { sa: 0.22, sb: 0.09, cov: 0.004, w: 0.6 };
const twSd = IV.twoAsset({ w: TW.w, ra: 0, rb: 0, sa: TW.sa, sb: TW.sb, corr: TW.cov / (TW.sa * TW.sb) }).sd;
const twNoCov = Math.sqrt(TW.w ** 2 * TW.sa ** 2 + (1 - TW.w) ** 2 * TW.sb ** 2);
// dg-8 the best complete portfolio for A = 1.5
const CL = { er: 0.095, sd: 0.18, rf: 0.035, A: 1.5 };
const clY = IV.optimalRiskyShare(CL), clEr = IV.cal({ y: clY, rf: CL.rf, er: CL.er, sd: CL.sd }).er;
const clYsd = (CL.er - CL.rf) / (CL.A * CL.sd);
claim(clY > 1, 'the investor borrows');
// dg-9 five months of excess returns (per cent)
const RX = [-2, 0, 1, 3, 3], RY = [-3, 1, 1, 4, 7];
const rg = IV.regressBeta(RY.map((v) => v / 100), RX.map((v) => v / 100));
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const sdS = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };

// ---------------------------------------------------------------- module 4
// dg-10 Dorrimer Tools (fictional): Gordon value of FCFF, then the bridge
const DT = { fcf1: 42, g: 0.03, wacc: 0.085, debt: 220, cash: 35, shares: 25 };
const dtEv = DT.fcf1 / (DT.wacc - DT.g);
const dtPs = IV.evToEquity({ ev: dtEv, debt: DT.debt, cash: DT.cash, shares: DT.shares }).perShare;
// dg-11 Wyvernlake Telecom (fictional): a peer EV/EBITDA
const WT = { mult: 7.5, ebitda: 180, debt: 520, cash: 60, shares: 80 };
const wtPs = IV.impliedValue({ multiple: WT.mult, metric: WT.ebitda, basis: 'ev', debt: WT.debt, cash: WT.cash, shares: WT.shares }).perShare;
// dg-12 Fernhallow Foods (fictional): growth that earns less than the WACC
const FH = { nopat: 50, wacc: 0.08, g: 0.04, ronic: 0.07 };
const fhFlat = FH.nopat / FH.wacc, fhGrow = FH.nopat * (1 - FH.g / FH.ronic) / (FH.wacc - FH.g), fhNaive = FH.nopat / (FH.wacc - FH.g);
claim(fhGrow < fhFlat, 'growth at 7% on new investment lowers the value');

export const items = [
  // ================================================================ Module 1: Securities and markets
  {
    id: 'f06-dg-1', lesson: 'shares-and-markets', type: 'num', kind: 'applied',
    prompt: `Tolvane Ferries (fictional, listed) has ${TF.shares} million shares trading at $${fx(TF.price)}, ${mil(TF.debt)} of debt and ${mil(TF.cash)} of cash. A rival offers to buy every share at the market price; it must also repay all of Tolvane’s debt, and it will own Tolvane’s cash. Ignoring any premium and fees, what does the rival effectively pay for Tolvane’s business, in $ millions?`,
    answer: rnd(tfEv, 1), check: () => TF.shares * TF.price + TF.debt - TF.cash, unit: '$m', places: 0, tol: 1,
    wrong: [
      { value: tfCap, say: 'That is the market capitalisation: what the shares cost. The buyer also takes on the debt, and gets the cash back.' },
      { value: tfCap + TF.debt, say: 'The cash comes with the company, so it reduces the net cost: subtract it.' },
      { value: tfCap + TF.debt + TF.cash, say: 'The cash is the buyer’s once it owns Tolvane, so it lowers the net cost; it isn’t an extra payment.' },
    ],
    solution: `Shares: ${TF.shares} × $${fx(TF.price)} = ${mil(tfCap)} (market capitalisation). Debt to repay: ${mil(TF.debt)}. Cash acquired: ${mil(TF.cash)}. Net cost of the business = ${fx(tfCap, 0)} + ${fx(TF.debt, 0)} − ${fx(TF.cash, 0)} = ${mil(tfEv)}: its enterprise value, the value of the business to all who finance it, whoever holds the claims.`,
  },
  {
    id: 'f06-dg-2', lesson: 'bond-prices-and-yields', type: 'num', kind: 'numerical',
    prompt: `A fictional three-year bond pays a ${pc(B3.couponRate, 0)} coupon once a year on $100 of face value and is priced to yield ${pc(B3.ytm, 0)}. What is its Macaulay duration, in years? Give two decimal places.`,
    answer: rnd(b3.macaulay, 2), check: () => b3pv.reduce((s, v, i) => s + (i + 1) * v, 0) / b3pv.reduce((s, v) => s + v, 0), unit: 'years', places: 2, tol: 0.01,
    wrong: [
      { value: 3, say: 'That is the maturity. The coupons in years 1 and 2 arrive earlier, so the present-value-weighted average time is shorter.' },
      { value: rnd(b3.modified, 2), say: `That is the modified duration, the Macaulay duration ÷ ${fx(1 + B3.ytm, 2)}. The question asks for the Macaulay duration.` },
      { value: rnd((1 * 7 + 2 * 7 + 3 * 107) / 121, 2), say: 'That weights each year by the payment itself. Macaulay duration weights each year by the payment’s present value.' },
    ],
    solution: `Present values at ${pc(B3.ytm, 0)}: ${b3pv.map((v) => `$${fx(v)}`).join(', ')}; price $${fx(b3.price)}. Macaulay duration = (1 × ${fx(b3pv[0])} + 2 × ${fx(b3pv[1])} + 3 × ${fx(b3pv[2])}) ÷ ${fx(b3.price)} = ${fx(b3.macaulay)} years: the average time to the payments, each weighted by its share of the price. Modified duration, ${fx(b3.macaulay)} ÷ ${fx(1 + B3.ytm, 2)} = ${fx(b3.modified)}, gives the approximate % price change per point of yield.`,
  },
  {
    id: 'f06-dg-3', lesson: 'bond-prices-and-yields', type: 'mc', kind: 'conceptual',
    prompt: `Two fictional bonds both yield 5% and both have a modified duration of ${fx(CVX.d, 1)}. Bond A’s convexity is ${CVX.a}; bond B’s is ${CVX.b}. All yields then move by ${fx(CVX.dy * 100, 1)} percentage points, but you don’t yet know in which direction. How do the two bonds compare?`,
    options: [
      'A gains a little more if yields fall and loses a little less if they rise',
      'A gains more if yields fall but loses more if they rise: higher convexity means a more sensitive price either way',
      'They move by the same amount either way, because they have the same duration',
      'B does better both ways, since lower convexity makes a price steadier',
    ],
    answer: 0,
    feedback: {
      1: 'Convexity curves the price–yield line upwards: the curvature term ½ × C × Δy² is positive whichever way yields move, so more of it helps in both directions.',
      2: 'Duration is only the straight-line part of the price change. For a move of 1.5 points the curvature term differs between the bonds.',
      3: 'Lower convexity means less of the favourable curvature, so B gains less when yields fall and loses more when they rise.',
    },
    solution: `ΔP/P ≈ −D_mod × Δy + ½ × C × Δy². Yields up ${fx(CVX.dy * 100, 1)} points: A ${pc(cv(CVX.a, CVX.dy))}, B ${pc(cv(CVX.b, CVX.dy))}. Yields down: A +${pc(cv(CVX.a, -CVX.dy))}, B +${pc(cv(CVX.b, -CVX.dy))}. With equal durations, the more convex bond is ahead either way, which is why investors pay for convexity.`,
  },

  // ================================================================ Module 2: Risk and return
  {
    id: 'f06-dg-4', lesson: 'measuring-risk', type: 'num', kind: 'numerical',
    prompt: `A fictional fund publishes weekly returns. Over five years they averaged ${pc(WK.mean)} a week with a standard deviation of ${pc(WK.sd, 1)} a week. Assuming the weeks are independent, what is its volatility (standard deviation) a year, using 52 weeks? Give a percentage to two decimal places.`,
    answer: rnd(wkAnn * 100, 2), check: () => WK.sd * Math.sqrt(52) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: rnd(WK.sd * 52 * 100, 2), say: 'Multiplying by 52 is right for the mean, not the SD. With independent weeks the variances add, so the SD grows with √52.' },
      { value: rnd(WK.sd * Math.sqrt(12) * 100, 2), say: 'That uses √12, the factor for monthly data. There are 52 weeks in a year.' },
    ],
    solution: `With independent weeks the variance of a year’s return is 52 times the weekly variance, so the SD is √52 times the weekly SD: ${pc(WK.sd, 1)} × √52 = ${pc(wkAnn)} a year. (The mean, by contrast, scales by 52: about ${pc(WK.mean * 52, 1)} a year.)`,
  },
  {
    id: 'f06-dg-5', lesson: 'measuring-returns', type: 'num', kind: 'applied',
    prompt: `A fictional emerging-markets fund’s yearly returns had an arithmetic mean of ${pc(VD.a, 0)} and a standard deviation of ${pc(VD.s, 0)}. Approximately what compound growth rate a year did money left in the fund earn? Give a percentage to one decimal place.`,
    answer: rnd(vdG * 100, 1), check: () => (VD.a - VD.s ** 2 / 2) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [
      { value: VD.a * 100, say: 'That is the arithmetic mean. With volatile returns the compound (geometric) rate is lower: a fall needs a bigger gain to recover.' },
      { value: rnd((VD.a - VD.s ** 2) * 100, 1), say: 'The gap is about half the variance, ½ × 0.30², not the whole of it.' },
    ],
    solution: `Geometric mean ≈ arithmetic mean − ½σ² = ${fx(VD.a, 2)} − ½ × ${fx(VD.s, 2)}² = ${fx(VD.a, 2)} − ${fx(VD.s ** 2 / 2, 3)} = ${pc(vdG, 1)} a year. The arithmetic mean is the right estimate of one year’s expected return; the compound rate is what money actually grew at, and with an SD of 30% the two are far apart.`,
  },
  {
    id: 'f06-dg-6', lesson: 'measuring-risk', type: 'num', kind: 'numerical',
    prompt: `A fictional fund was worth $${QV[0]} at the end of year 0. Its quarter-end values over the next two years were ${QV.slice(1, 5).map((v) => `$${v}`).join(', ')} (year 1) and ${QV.slice(5).map((v) => `$${v}`).join(', ')} (year 2). What was its maximum drawdown over the two years? Give a percentage to one decimal place (as a negative number).`,
    answer: rnd(qDd * 100, 1), check: () => (Math.min(...QV.map((v, i) => v / Math.max(...QV.slice(0, i + 1)))) - 1) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: rnd(qY1 * 100, 1), say: 'That is the worst calendar-year return. The fall from $115 to $88 runs across the year-end, so neither calendar year shows it.' },
      { value: rnd((88 / 100 - 1) * 100, 1), say: 'That measures from the starting value. A drawdown is measured from the highest value so far, $115.' },
      { value: rnd((97 / 115 - 1) * 100, 1), say: 'That stops at the end of year 1. The value kept falling to $88 in the first quarter of year 2.' },
    ],
    solution: `The highest value before the low is $115 (mid-year 1) and the lowest after it $88 (first quarter of year 2): 88 ÷ 115 − 1 = ${pc(qDd, 1)}. The calendar years returned ${pc(qY1, 1)} and +${pc(qY2, 1)}, so year-by-year figures hide a fall of almost a quarter that an investor who bought at the peak lived through.`,
  },

  // ================================================================ Module 3: Portfolios and the market
  {
    id: 'f06-dg-7', lesson: 'diversification', type: 'num', kind: 'numerical',
    prompt: `A fictional investor puts ${pc(TW.w, 0)} in a share fund with a standard deviation of ${pc(TW.sa, 0)} a year and the rest in a property fund with ${pc(TW.sb, 0)}. The covariance of their annual returns is ${fx(TW.cov, 4)}. What is the standard deviation of her portfolio? Give a percentage to two decimal places.`,
    answer: rnd(twSd * 100, 2), check: () => Math.sqrt(0.36 * 0.22 ** 2 + 0.16 * 0.09 ** 2 + 2 * 0.6 * 0.4 * 0.004) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: rnd((TW.w * TW.sa + (1 - TW.w) * TW.sb) * 100, 2), say: 'That is the weighted average of the SDs, true only if the funds were perfectly correlated. Combine the variances and the covariance.' },
      { value: rnd(twNoCov * 100, 2), say: 'That leaves out the covariance term, 2 × 0.6 × 0.4 × 0.0040.' },
    ],
    solution: `σ² = 0.6² × 0.22² + 0.4² × 0.09² + 2 × 0.6 × 0.4 × 0.0040 = ${fx(TW.w ** 2 * TW.sa ** 2, 6)} + ${fx((1 - TW.w) ** 2 * TW.sb ** 2, 6)} + ${fx(2 * TW.w * (1 - TW.w) * TW.cov, 6)} = ${fx(twSd ** 2, 6)}, so σ = ${pc(twSd)}. The correlation is ${fx(TW.cov / (TW.sa * TW.sb), 2)}, well below 1, so the portfolio is less risky than the ${pc(TW.w * TW.sa + (1 - TW.w) * TW.sb, 1)} weighted average.`,
  },
  {
    id: 'f06-dg-8', lesson: 'efficient-portfolios', type: 'num', kind: 'applied',
    prompt: `A fictional adviser’s best risky portfolio has an expected return of ${pc(CL.er, 1)} and a standard deviation of ${pc(CL.sd, 0)}. Clients can lend and borrow at ${pc(CL.rf, 1)}. A client with a risk-aversion coefficient of ${fx(CL.A, 1)} (utility = E(r) − ½ × A × σ²) holds the mix that maximises her utility. What is the expected return of her whole portfolio? Give a percentage to two decimal places.`,
    answer: rnd(clEr * 100, 2), check: () => (0.035 + (0.095 - 0.035) ** 2 / (1.5 * 0.18 ** 2)) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: CL.er * 100, say: 'That holds exactly 100% in the risky portfolio. Her best share is (E − r_f) ÷ (Aσ²), which for a risk aversion this low is above 1: she borrows to hold more.' },
      { value: rnd(IV.cal({ y: clYsd, rf: CL.rf, er: CL.er, sd: CL.sd }).er * 100, 2), say: 'That divides by A × σ instead of A × σ². Square the standard deviation: 1.5 × 0.18² = 0.0486.' },
    ],
    solution: `Best share in the risky portfolio: y* = (${fx(CL.er, 3)} − ${fx(CL.rf, 3)}) ÷ (${fx(CL.A, 1)} × ${fx(CL.sd, 2)}²) = ${fx(CL.er - CL.rf, 3)} ÷ ${fx(CL.A * CL.sd ** 2, 4)} = ${fx(clY, 3)}: she borrows about $${fx((clY - 1) * 100, 0)} for every $100 she has and holds ${pc(clY, 1)} in the risky portfolio. On the capital allocation line, E(r) = ${pc(CL.rf, 1)} + ${fx(clY, 3)} × ${pc(CL.er - CL.rf, 1)} = ${pc(clEr)}, with an SD of ${pc(clY * CL.sd, 1)}.`,
  },
  {
    id: 'f06-dg-9', lesson: 'capm-and-beta', type: 'num', kind: 'numerical',
    prompt: `Over five months a fictional fund’s excess returns over bills were ${RY.map((v) => `${fx(v, 0)}%`).join(', ')} while the market’s were ${RX.map((v) => `${fx(v, 0)}%`).join(', ')} (month by month, in the same order). Estimate the fund’s beta from these months. Give two decimal places.`,
    answer: rnd(rg.beta, 2), check: () => { const mx = 1, my = 2; return RX.reduce((s, x, i) => s + (x - mx) * (RY[i] - my), 0) / RX.reduce((s, x) => s + (x - mx) ** 2, 0); }, unit: '', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(mean(RY) / mean(RX), 2), say: 'That is the ratio of the mean excess returns. Beta is the slope of the fund’s excess return on the market’s: how much the fund moves when the market moves.' },
      { value: rnd(sdS(RY) / sdS(RX), 2), say: 'That is the ratio of the SDs, which counts all of the fund’s variation as market risk. Beta = covariance ÷ market variance, the regression slope.' },
    ],
    solution: `Beta is the least-squares slope of the fund’s excess returns on the market’s. Means: market ${fx(mean(RX), 0)}%, fund ${fx(mean(RY), 0)}%. Deviations of the market: ${RX.map((v) => fx(v - mean(RX), 0)).join(', ')}; of the fund: ${RY.map((v) => fx(v - mean(RY), 0)).join(', ')}. Σ(products) = ${fx(RX.reduce((s, x, i) => s + (x - mean(RX)) * (RY[i] - mean(RY)), 0), 0)}; Σ(market deviations²) = ${fx(RX.reduce((s, x) => s + (x - mean(RX)) ** 2, 0), 0)}. β = ${fx(rg.beta, 2)}. The intercept, ${fx(mean(RY), 0)} − ${fx(rg.beta, 2)} × ${fx(mean(RX), 0)} = ${fx(rg.alpha * 100, 2)}% a month, is the fund’s alpha; five months are far too few to trust either figure.`,
  },

  // ================================================================ Module 4: Valuing shares
  {
    id: 'f06-dg-10', lesson: 'discounted-cash-flow-valuation', type: 'num', kind: 'applied',
    prompt: `Dorrimer Tools (fictional, listed) is expected to generate free cash flow to the firm of ${mil(DT.fcf1)} next year, growing ${pc(DT.g, 0)} a year for ever. Its WACC is ${pc(DT.wacc, 1)}. It has ${mil(DT.debt)} of debt, ${mil(DT.cash)} of cash and ${DT.shares} million shares. What is one share worth? Give dollars and cents.`,
    answer: rnd(dtPs, 2), check: () => (42 / (0.085 - 0.03) - 220 + 35) / 25, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: rnd(dtEv / DT.shares, 2), say: 'That divides the whole enterprise value by the shares. Discounting FCFF at the WACC values the business for lenders and shareholders together: subtract the debt and add the cash first.' },
      { value: rnd((dtEv - DT.debt - DT.cash) / DT.shares, 2), say: 'The cash belongs to the shareholders on top of the business: add it, don’t subtract it.' },
      { value: rnd((DT.fcf1 * (1 + DT.g) / (DT.wacc - DT.g) - DT.debt + DT.cash) / DT.shares, 2), say: 'The $42 million is already next year’s cash flow, so it goes straight into the Gordon formula without growing it again.' },
    ],
    solution: `Enterprise value = FCFF₁ ÷ (WACC − g) = ${fx(DT.fcf1, 0)} ÷ (${fx(DT.wacc, 3)} − ${fx(DT.g, 2)}) = ${mil(dtEv, 1)}. Equity = EV − debt + cash = ${fx(dtEv, 1)} − ${DT.debt} + ${DT.cash} = ${mil(dtEv - DT.debt + DT.cash, 1)}. Per share: ÷ ${DT.shares} million = $${fx(dtPs)}.`,
  },
  {
    id: 'f06-dg-11', lesson: 'relative-valuation', type: 'num', kind: 'numerical',
    prompt: `Listed peers of Wyvernlake Telecom (fictional, listed) trade at a median of ${fx(WT.mult, 1)} times EBITDA, measured on enterprise value. Wyvernlake’s EBITDA is ${mil(WT.ebitda)}; it has ${mil(WT.debt)} of debt, ${mil(WT.cash)} of cash and ${WT.shares} million shares. What value per share does the peer multiple imply? Give dollars and cents.`,
    answer: rnd(wtPs, 2), check: () => (7.5 * 180 - 520 + 60) / 80, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: rnd(WT.mult * WT.ebitda / WT.shares, 2), say: 'That treats the multiple’s result as equity. EV/EBITDA gives an enterprise value; take off the debt and add the cash before dividing by the shares.' },
      { value: rnd((WT.mult * WT.ebitda - WT.debt - WT.cash) / WT.shares, 2), say: 'Cash is added back in the bridge from enterprise value to equity, not subtracted.' },
    ],
    solution: `Implied enterprise value = ${fx(WT.mult, 1)} × ${fx(WT.ebitda, 0)} = ${mil(WT.mult * WT.ebitda)}. Equity = ${fx(WT.mult * WT.ebitda, 0)} − ${WT.debt} + ${WT.cash} = ${mil(WT.mult * WT.ebitda - WT.debt + WT.cash)}; per share ÷ ${WT.shares} million = $${fx(wtPs)}. An enterprise-value multiple goes with an enterprise-value result; only after the bridge is it a share price.`,
  },
  {
    id: 'f06-dg-12', lesson: 'fundamental-analysis', type: 'mc', kind: 'applied',
    prompt: `Fernhallow Foods (fictional, listed) expects after-tax operating profit of ${mil(FH.nopat)} next year and has a WACC of ${pc(FH.wacc, 0)}. If it invests nothing beyond upkeep, the profit stays flat for ever. Its board proposes reinvesting enough to grow ${pc(FH.g, 0)} a year for ever; the new investment would earn ${pc(FH.ronic, 0)}. What does the plan do to the value of the business?`,
    options: [
      `It raises it to ${mil(fhNaive)}, because the same ${mil(FH.nopat)} now grows ${pc(FH.g, 0)} a year for ever`,
      `It lowers it, from ${mil(fhFlat)} to about ${mil(fhGrow)}, because the new investment earns less than the WACC`,
      `It leaves it at ${mil(fhFlat)}: growth paid for by the company’s own profits can’t change its value`,
      `It raises it only if the ${pc(FH.g, 0)} growth rate is above the rate of inflation over the period`,
    ],
    answer: 1,
    feedback: {
      0: `Growth isn’t free: growing ${pc(FH.g, 0)} a year at a ${pc(FH.ronic, 0)} return means reinvesting ${pc(FH.g / FH.ronic, 1)} of each year’s profit, so far less cash is paid out.`,
      2: 'Growth leaves value unchanged only when new investment earns exactly the WACC. Here it earns less.',
      3: 'Inflation doesn’t decide it: what matters is the return on the new investment against the cost of the money that funds it.',
    },
    solution: `Flat: ${fx(FH.nopat, 0)} ÷ ${fx(FH.wacc, 2)} = ${mil(fhFlat)}. With growth, reinvestment = g ÷ return on new investment = ${fx(FH.g, 2)} ÷ ${fx(FH.ronic, 2)} = ${pc(FH.g / FH.ronic, 1)} of profit, so value = ${fx(FH.nopat, 0)} × (1 − ${fx(FH.g / FH.ronic, 4)}) ÷ (${fx(FH.wacc, 2)} − ${fx(FH.g, 2)}) = ${mil(fhGrow)}. Investing at ${pc(FH.ronic, 0)} money that costs ${pc(FH.wacc, 0)} destroys value; growth helps only when the return on new investment exceeds the WACC.`,
  },
];

// Start at module N if the student scores at least 75% on the items for all the modules before N: all three module-1
// items for module 2, five of the six module 1–2 items for module 3, and seven of the nine module 1–3 items for module 4.
export const route = [
  { module: 2, ifAtLeast: 0.75 },
  { module: 3, ifAtLeast: 0.75 },
  { module: 4, ifAtLeast: 0.75 },
];
