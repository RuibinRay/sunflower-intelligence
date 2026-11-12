// assess-diagnostic.js — F06 course diagnostic: three items per module, each needing a step that only that module
// teaches, so a student who knows only the prerequisites (F04: discounting, annuities, perpetuities and the Gordon model,
// inflation; F05: YTM as a cost of debt, the CAPM as a formula, the WACC; B04: mean and SD) misses it, and one who has
// the module’s method gets it right. New questions, not copies of lesson exercises, module-test or project items. No
// hints; solutions show in review. Every business, fund and bond here is fictional; nothing uses the simulated series or
// the project’s data. Every figure is computed below from its inputs with core/investments.js.
//
// What each item needs, and why the prerequisites alone fail:
// dg-1  a price-weighted index’s return across a share split (the divisor is reset so the split doesn’t move the index).
//       F00, F04 and F05 never build an index; without the divisor the prerequisite answer is a large fall.
// dg-2  Macaulay duration (PV-weighted time). F05 prices a bond and finds its YTM; it never weights the payment dates, so
//       the prerequisite answer is the maturity, 3 years.
// dg-3  convexity: equal durations, unequal convexity. Nothing in F04/F05 says price moves are asymmetric in yields.
// dg-4  the chance of a losing year from weekly figures: the mean scales by 52, the SD by √52. B04 gives a normal
//       probability; scaling both alike (or neither) leaves the weekly z and the prerequisite answer near 47%.
// dg-5  compound growth ≈ arithmetic mean − ½σ². F04 compounds a given rate; B04’s mean is the arithmetic one, so the
//       prerequisite answer is 11%.
// dg-6  maximum drawdown (peak to later trough) against calendar-year returns. B04 and F04 give period returns only, so the
//       prerequisite answer is the worst calendar year.
// dg-7  two-asset portfolio SD with the covariance term. B04’s SD of one variable gives the weighted average of SDs.
// dg-8  the capital allocation line and the optimal risky share y* = (E − r_f) ÷ (Aσ²), here above 1 (borrowing). F05’s
//       CAPM prices one asset; it doesn’t choose how much risk to hold.
// dg-9  Jensen’s alpha as the intercept of a regression of excess returns (raw returns less bills). F05 takes beta as
//       given; the prerequisite guesses are the raw-return intercept or the gap in mean returns.
// dg-10 the EV-to-equity bridge after a Gordon value of free cash flow to the firm. F04 gives the Gordon value and F05 the
//       WACC; without the bridge the prerequisite answer is EV ÷ shares.
// dg-11 the justified price-to-book, (ROE − g) ÷ (r − g), from the constant-growth model with dividends set by what
//       growth leaves unreinvested. F04’s Gordon model values a given dividend; without the payout link the
//       prerequisite answers are ROE ÷ r or ROE ÷ (r − g).
// dg-12 growth creates value only when new investment earns more than the WACC (the value-driver formula). F04’s Gordon
//       model with a higher g always gives a higher value.
import * as IV from '../../../core/investments.js?v=31';
import { normCdf } from '../../../core/inference.js?v=31';

const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (v, d = 2) => `${fx(v * 100, d)}%`;
const mil = (v, d = 0) => `$${fx(v, d)} million`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const sum = (a) => a.reduce((s, v) => s + v, 0);
const mean = (a) => sum(a) / a.length;
const claim = (ok, what) => { if (!ok) throw new Error(`assess-diagnostic: the figures no longer support “${what}”`); };

// ---------------------------------------------------------------- module 1
// dg-1 a price-weighted index of three fictional shares; X splits two for one during the month
const PW = { start: [150, 50, 25], split: 2, end: [79, 48, 26] };
const pwAfter = [PW.start[0] / PW.split, ...PW.start.slice(1)];
const pwLevel0 = 100, pwDiv0 = sum(PW.start) / pwLevel0, pwDiv1 = sum(pwAfter) / pwLevel0;
const pwRet = sum(PW.end) / pwDiv1 / pwLevel0 - 1;
const pwNoAdj = sum(PW.end) / pwDiv0 / pwLevel0 - 1, pwEqual = mean(PW.end.map((p, i) => p / pwAfter[i] - 1));
// dg-2 a three-year 7% annual-coupon bond at a 5% yield
const B3 = { face: 100, couponRate: 0.07, years: 3, freq: 1, ytm: 0.05 };
const b3 = IV.duration(B3);
const b3pv = [1, 2, 3].map((t) => (t === 3 ? 107 : 7) / 1.05 ** t);
// dg-3 equal modified duration, unequal convexity, ±1.5 points
const CVX = { d: 7, a: 75, b: 50, dy: 0.015 };
const cv = (c, dy) => IV.priceChangeApprox({ modified: CVX.d, convexity: c }, dy);
claim(cv(CVX.a, CVX.dy) > cv(CVX.b, CVX.dy) && cv(CVX.a, -CVX.dy) > cv(CVX.b, -CVX.dy), 'the more convex bond does better both ways');

// ---------------------------------------------------------------- module 2
// dg-4 weekly returns to the chance of a losing year
const WK = { sd: 0.021, mean: 0.0018 };
const wkMeanY = WK.mean * 52, wkSdY = IV.annualise.sd(WK.sd, 52);
const wkP = normCdf(-wkMeanY / wkSdY), wkSame = normCdf(-WK.mean / WK.sd), wkMixed = normCdf(-wkMeanY / IV.annualise.sd(WK.sd, 12));
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
// dg-9 five months of raw returns and a constant bill return (per cent)
const RX = [-2, 0, 1, 3, 3], RY = [-3, 1, 1, 4, 7], BILL = 0.3;   // excess returns; raw = excess + bills
const RXr = RX.map((v) => v + BILL), RYr = RY.map((v) => v + BILL);
const rg = IV.regressBeta(RYr.map((v) => v / 100), RXr.map((v) => v / 100), RXr.map(() => BILL / 100));
const rgRaw = IV.regressBeta(RYr.map((v) => v / 100), RXr.map((v) => v / 100));
claim(Math.abs(rg.alpha - rgRaw.alpha) > 0.001, 'regressing raw returns gives a visibly different intercept');
const sdS = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };

// ---------------------------------------------------------------- module 4
// dg-10 Quillmarsh Tools (fictional): Gordon value of FCFF, then the bridge
const DT = { fcf1: 42, g: 0.03, wacc: 0.085, debt: 220, cash: 35, shares: 25 };
const dtEv = DT.fcf1 / (DT.wacc - DT.g);
const dtPs = IV.evToEquity({ ev: dtEv, debt: DT.debt, cash: DT.cash, shares: DT.shares }).perShare;
// dg-11 Corvellan Telecom (fictional): the justified price-to-book
const CT = { roe: 0.14, g: 0.05, r: 0.09 };
const ctPb = (CT.roe - CT.g) / (CT.r - CT.g), ctNoG = CT.roe / CT.r, ctAll = CT.roe / (CT.r - CT.g);
// dg-12 Fernhallow Foods (fictional): growth that earns less than the WACC
const FH = { nopat: 50, wacc: 0.08, g: 0.04, ronic: 0.07 };
const fhFlat = FH.nopat / FH.wacc, fhGrow = FH.nopat * (1 - FH.g / FH.ronic) / (FH.wacc - FH.g), fhNaive = FH.nopat / (FH.wacc - FH.g);
claim(fhGrow < fhFlat, 'growth at 7% on new investment lowers the value');

export const items = [
  // ================================================================ Module 1: Securities and markets
  {
    id: 'f06-dg-1', lesson: 'shares-and-markets', type: 'num', kind: 'conceptual',
    prompt: `A fictional price-weighted index follows three shares, X, Y and Z. At the end of one month they trade at $${PW.start.join(', $')} and the index stands at ${pwLevel0}. During the next month X splits two for one (each share becomes two, at half the price), and the index provider rescales the divisor so that the split alone leaves the index unchanged. At the end of that month X, Y and Z trade at $${PW.end.join(', $')}. What did the index return over the month? Give a percentage to one decimal place.`,
    answer: rnd(pwRet * 100, 1), check: () => ((79 + 48 + 26) / (75 + 50 + 25) - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(pwNoAdj * 100, 1), say: 'That keeps the old divisor, so the split shows up as a fall in the index that no shareholder suffered. After the split the divisor must shrink in proportion to the sum of the prices.' },
      { value: rnd(pwEqual * 100, 1), say: 'That averages the three shares’ returns equally. A price-weighted index weights each share by its price: its return is the change in the sum of the prices over the starting sum.' },
    ],
    solution: `Before the split the prices sum to $${sum(PW.start)}, so the divisor is ${sum(PW.start)} ÷ ${pwLevel0} = ${fx(pwDiv0)}. After it they sum to $${sum(pwAfter)}, so the divisor becomes ${sum(pwAfter)} ÷ ${pwLevel0} = ${fx(pwDiv1)}. At the month-end the index is ${sum(PW.end)} ÷ ${fx(pwDiv1)} = ${fx(sum(PW.end) / pwDiv1)}, a return of ${pc(pwRet, 1)}: the change in the sum of the prices, ${sum(PW.end) - sum(pwAfter)}, over the post-split sum, ${sum(pwAfter)}. Keeping the old divisor would show ${pc(pwNoAdj, 1)}.`,
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
      2: `Duration is only the straight-line part of the price change. For a move of ${fx(CVX.dy * 100, 1)} points the curvature term differs between the bonds.`,
      3: 'Lower convexity means less of the favourable curvature, so B gains less when yields fall and loses more when they rise.',
    },
    solution: `ΔP/P ≈ −D_mod × Δy + ½ × C × Δy². Yields up ${fx(CVX.dy * 100, 1)} points: A ${pc(cv(CVX.a, CVX.dy))}, B ${pc(cv(CVX.b, CVX.dy))}. Yields down: A +${pc(cv(CVX.a, -CVX.dy))}, B +${pc(cv(CVX.b, -CVX.dy))}. With equal durations, the more convex bond is ahead either way, which is why investors pay for convexity.`,
  },

  // ================================================================ Module 2: Risk and return
  {
    id: 'f06-dg-4', lesson: 'measuring-risk', type: 'num', kind: 'applied',
    prompt: `A fictional fund’s weekly returns average ${pc(WK.mean)} with a standard deviation of ${pc(WK.sd, 1)}. Treat the weeks as independent, take 52 weeks to a year and suppose the yearly return is normally distributed. What is the probability that the fund loses money in a year? Give a percentage to one decimal place.`,
    answer: rnd(wkP * 100, 1), check: () => normCdf(-(0.0018 * 52) / (0.021 * Math.sqrt(52))) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [
      { value: rnd(wkSame * 100, 1), say: 'That is the chance of a losing week: it uses the weekly mean and SD, or scales both by the same factor, which leaves z unchanged. Over a year the mean grows with 52 but the SD only with √52.' },
      { value: rnd(wkMixed * 100, 1), say: 'That scales the SD by √12, the factor for monthly data. With weekly returns it is √52.' },
    ],
    solution: `Yearly mean = ${pc(WK.mean)} × 52 = ${pc(wkMeanY)}; yearly SD = ${pc(WK.sd, 1)} × √52 = ${pc(wkSdY)}. z = (0 − ${pc(wkMeanY)}) ÷ ${pc(wkSdY)} = ${fx(-wkMeanY / wkSdY, 3)}, and P(z < ${fx(-wkMeanY / wkSdY, 3)}) = ${pc(wkP, 1)}, against ${pc(wkSame, 1)} for a single week. Because the mean grows faster than the SD, losses get less likely as the horizon lengthens, though real returns have fatter tails than the normal.`,
  },
  {
    id: 'f06-dg-5', lesson: 'measuring-returns', type: 'num', kind: 'conceptual',
    prompt: `A fictional emerging-markets fund’s yearly returns had an arithmetic mean of ${pc(VD.a, 0)} and a standard deviation of ${pc(VD.s, 0)}. Approximately what compound growth rate a year did money left in the fund earn? Give a percentage to one decimal place.`,
    answer: rnd(vdG * 100, 1), check: () => (VD.a - VD.s ** 2 / 2) * 100, unit: '%', places: 1, tol: 0.15,
    wrong: [
      { value: VD.a * 100, say: 'That is the arithmetic mean. With volatile returns the compound (geometric) rate is lower: a fall needs a bigger gain to recover.' },
      { value: rnd((VD.a - VD.s ** 2) * 100, 1), say: 'The gap is about half the variance, ½ × 0.30², not the whole of it.' },
    ],
    solution: `Geometric mean ≈ arithmetic mean − ½σ² = ${fx(VD.a, 2)} − ½ × ${fx(VD.s, 2)}² = ${fx(VD.a, 2)} − ${fx(VD.s ** 2 / 2, 3)} = ${pc(vdG, 1)} a year. The arithmetic mean is the right estimate of one year’s expected return; the compound rate is what money actually grew at, and with an SD of 30% the two are far apart.`,
  },
  {
    id: 'f06-dg-6', lesson: 'measuring-risk', type: 'num', kind: 'applied',
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
      { value: rnd(IV.cal({ y: clYsd, rf: CL.rf, er: CL.er, sd: CL.sd }).er * 100, 2), say: `That divides by A × σ instead of A × σ². Square the standard deviation: ${fx(CL.A, 1)} × ${fx(CL.sd)}² = ${fx(CL.A * CL.sd ** 2, 4)}.` },
    ],
    solution: `Best share in the risky portfolio: y* = (${fx(CL.er, 3)} − ${fx(CL.rf, 3)}) ÷ (${fx(CL.A, 1)} × ${fx(CL.sd, 2)}²) = ${fx(CL.er - CL.rf, 3)} ÷ ${fx(CL.A * CL.sd ** 2, 4)} = ${fx(clY, 3)}: she borrows about $${fx((clY - 1) * 100, 0)} for every $100 she has and holds ${pc(clY, 1)} in the risky portfolio. On the capital allocation line, E(r) = ${pc(CL.rf, 1)} + ${fx(clY, 3)} × ${pc(CL.er - CL.rf, 1)} = ${pc(clEr)}, with an SD of ${pc(clY * CL.sd, 1)}.`,
  },
  {
    id: 'f06-dg-9', lesson: 'capm-and-beta', type: 'num', kind: 'numerical',
    prompt: `Over five months a fictional fund returned ${RYr.map((v) => `${fx(v, 1)}%`).join(', ')} and the market ${RXr.map((v) => `${fx(v, 1)}%`).join(', ')} (month by month, in the same order). One-month bills returned ${fx(BILL, 1)}% each month. Estimate the fund’s Jensen’s alpha a month: the intercept of the regression of its excess returns over bills on the market’s. Give a percentage to two decimal places.`,
    answer: rnd(rg.alpha * 100, 2), check: () => { const x = [-2, 0, 1, 3, 3], y = [-3, 1, 1, 4, 7], mx = 1, my = 2; const b = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / x.reduce((s, v) => s + (v - mx) ** 2, 0); return my - b * mx; }, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(rgRaw.alpha * 100, 2), say: 'That regresses the raw returns. Alpha comes from excess returns: take the bill return off both series first. With a beta above 1, the raw intercept understates alpha by (β − 1) × the bill return.' },
      { value: rnd((mean(RY) - mean(RX)), 2), say: 'That is the gap between the mean returns, which assumes a beta of exactly 1. The intercept allows for the fund’s beta.' },
      { value: rnd(rg.beta, 2), say: 'That is the slope, the fund’s beta. Alpha is the intercept: mean fund excess return − β × mean market excess return.' },
    ],
    solution: `Excess returns (less ${fx(BILL, 1)}%): fund ${RY.map((v) => fx(v, 0)).join(', ')}; market ${RX.map((v) => fx(v, 0)).join(', ')}. Means ${fx(mean(RY), 0)}% and ${fx(mean(RX), 0)}%. Slope β = Σ(products of deviations) ÷ Σ(market deviations²) = ${fx(RX.reduce((s, x, i) => s + (x - mean(RX)) * (RY[i] - mean(RY)), 0), 0)} ÷ ${fx(RX.reduce((s, x) => s + (x - mean(RX)) ** 2, 0), 0)} = ${fx(rg.beta)}. Alpha = ${fx(mean(RY), 0)} − ${fx(rg.beta)} × ${fx(mean(RX), 0)} = ${fx(rg.alpha * 100)}% a month: what the fund earned beyond the CAPM’s reward for its beta. Five months are far too few to trust it.`,
  },

  // ================================================================ Module 4: Valuing shares
  {
    id: 'f06-dg-10', lesson: 'discounted-cash-flow-valuation', type: 'num', kind: 'applied',
    prompt: `Quillmarsh Tools (fictional, listed) is expected to generate free cash flow to the firm of ${mil(DT.fcf1)} next year, growing ${pc(DT.g, 0)} a year for ever. Its WACC is ${pc(DT.wacc, 1)}. It has ${mil(DT.debt)} of debt, ${mil(DT.cash)} of cash and ${DT.shares} million shares. What is one share worth? Give dollars and cents.`,
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
    prompt: `Corvellan Telecom (fictional, listed) earns a return on equity of ${pc(CT.roe, 0)} on its book equity and is expected to do so for ever. Each year it reinvests just enough of its earnings to grow them ${pc(CT.g, 0)} a year and pays the rest out as dividends. Its shareholders require ${pc(CT.r, 0)}. What price-to-book ratio (today’s price ÷ today’s book equity per share) does the constant-growth dividend model justify? Give two decimal places.`,
    answer: rnd(ctPb, 2), check: () => (0.14 - 0.05) / (0.09 - 0.05), unit: '×', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(ctNoG, 2), say: 'That is the no-growth answer, ROE ÷ r. With 5% growth the shares are worth more, even though part of each year’s earnings is kept back.' },
      { value: rnd(ctAll, 2), say: 'That pays out all the earnings and still grows them 5% a year. Growth has to be paid for: reinvesting g ÷ ROE of earnings leaves dividends of (ROE − g) × book equity.' },
    ],
    solution: `Next year’s earnings = ROE × book equity. To grow ${pc(CT.g, 0)} it reinvests g ÷ ROE = ${pc(CT.g / CT.roe, 1)} of them, so the dividend is (ROE − g) × book = ${fx(CT.roe - CT.g)} × book. Gordon: price = ${fx(CT.roe - CT.g)} × book ÷ (${fx(CT.r)} − ${fx(CT.g)}), so P/B = (ROE − g) ÷ (r − g) = ${fx(CT.roe - CT.g)} ÷ ${fx(CT.r - CT.g)} = ${fx(ctPb)}. A P/B above 1 is justified because ROE exceeds the ${pc(CT.r, 0)} shareholders require.`,
  },
  {
    id: 'f06-dg-12', lesson: 'fundamental-analysis', type: 'mc', kind: 'conceptual',
    prompt: `Fernhallow Foods (fictional, listed) expects after-tax operating profit of ${mil(FH.nopat)} next year and has a WACC of ${pc(FH.wacc, 0)}. If it invests nothing beyond upkeep, the profit stays flat for ever. Its board proposes reinvesting enough to grow ${pc(FH.g, 0)} a year for ever; the new investment would earn ${pc(FH.ronic, 0)}. What does the plan do to the value of the business?`,
    options: [
      `It raises it to ${mil(fhNaive)}, because the same ${mil(FH.nopat)} now grows ${pc(FH.g, 0)} a year for ever`,
      `It lowers it to about ${mil(fhGrow)}: the new investment earns less than the WACC`,
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
