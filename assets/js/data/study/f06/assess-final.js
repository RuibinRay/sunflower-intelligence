// assess-final.js — F06 final assessment: 24 questions across all four modules and all eight of the course’s outcomes,
// two or three per lesson (four for module 1, four for module 2, nine for module 3 and seven for module 4). 70% passes.
// Outcomes (main one per item): 1 shares, markets, market capitalisation and EV fn-1, fn-2; 2 bond prices, yields,
// duration, convexity and credit fn-3, fn-4; 3 returns and risk fn-5, fn-6, fn-7, fn-8; 4 diversification fn-9, fn-10;
// 5 efficient portfolios, the CAL and choosing a mix fn-11, fn-12, fn-13; 6 beta, the CAPM and alpha fn-14, fn-15;
// 7 funds, fees and tracking fn-16, fn-17; 8 valuation by DCF and multiples, judged by fundamental analysis fn-18 to fn-24.
// Mixed conceptual, numerical and applied items. Five are spreadsheet formula items, two of them steps inside steps items:
// a bond’s exact price after its spread widens by the basis points in B5 (fn-3, B5 varied); the bond fund’s real compound
// return from its simulated calendar-year returns at the inflation rate in E1 (fn-5, E1 varied); the expected return of
// the best complete portfolio for the risk aversion in B4 (fn-13, B4 varied); Northgate’s alpha a year from 60 simulated
// months of excess returns (fn-14); the terminal value’s share of a DCF value at the WACC in B8 (fn-18, B8 varied). Typed
// results fail on the marking copies.
// Items that combine lessons: a takeover price turned into the EV/EBITDA paid (fn-1: shares-and-markets,
// relative-valuation); a bond’s exact price after a spread widens, then duration and convexity against it (fn-3:
// bond-prices-and-yields, both halves); a credit spread from interpolated government yields, then a downgrade’s price
// effect by duration (fn-4: bond-prices-and-yields); geometric return then real return (fn-5: measuring-returns, with
// F04’s Fisher relation); arithmetic against geometric projection in today’s dollars (fn-6: measuring-returns); the
// spread of a 10-year average under a normal model (fn-7: measuring-risk, measuring-returns); drawdowns, worst years and
// the normal curve across the funds (fn-8: measuring-risk, measuring-returns); a monthly covariance annualised, then the
// two-asset SD and the minimum-variance weight (fn-9: diversification, measuring-risk); the optimal share in two risky
// portfolios and the choice between them by Sharpe ratio (fn-11: efficient-portfolios); the SE of the mean excess return
// (fn-12: efficient-portfolios, measuring-returns); the CAL and the optimal share in one formula (fn-13:
// efficient-portfolios); beta and alpha by regression, alpha before fees and its t-statistic (fn-14: capm-and-beta,
// funds-and-indexing); a portfolio beta and its CAPM return (fn-15: capm-and-beta, diversification); fee drag on a
// compounding balance, then the outperformance needed to break even (fn-16: funds-and-indexing, measuring-returns);
// tracking error, tracking difference and alpha for Northgate (fn-17: funds-and-indexing, capm-and-beta); the terminal
// value’s share of a DCF (fn-18: discounted-cash-flow-valuation); CAPM → WACC → Gordon EV → the bridge (fn-19:
// discounted-cash-flow-valuation, capm-and-beta, shares-and-markets); PVGO from CAPM costs of equity (fn-20:
// discounted-cash-flow-valuation, capm-and-beta, relative-valuation); a justified P/E from Gordon inputs against a peer
// (fn-21: relative-valuation, discounted-cash-flow-valuation, capm-and-beta); EV and equity multiples applied to a private
// target (fn-22: relative-valuation, shares-and-markets); a margin of safety off the conservative end of a DCF (fn-23:
// fundamental-analysis, discounted-cash-flow-valuation). Single-lesson items: fn-2, fn-10, fn-24.
// Data: the SIMULATED monthly series and fund facts in case.js (fn-5 to fn-9, fn-12, fn-14, fn-17), Morrow & Pike, Harbour
// Street, their bonds and the government bonds in case.js (fn-1, fn-4, fn-15, fn-22), and fictional businesses, funds and
// bonds built here (labelled). Nothing uses Brightcup or the project’s data or question. No hints; solutions are shown on
// review. Every figure is computed below from its inputs with core/investments.js and case.js; claims about the data’s
// shape throw if the data stop supporting them.
import { MONTHS, SERIES, ASSETS, COMPANIES, BONDS, MARKET, DERIVED as D, LAST60 } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';
import { normCdf } from '../../../core/inference.js?v=31';

const fx = (v, d = 2) => `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pc = (v, d = 2) => `${fx(v * 100, d)}%`;
const sg = (v, d = 2) => `${v > 0 ? '+' : ''}${pc(v, d)}`;
const money = (v, d = 2) => `${v < 0 ? '−' : ''}$${fx(Math.abs(v), d)}`;
const mil = (v, d = 0) => `$${fx(v, d)} million`;
const rnd = (x, p) => Math.round(x * 10 ** p) / 10 ** p;
const sum = (a) => a.reduce((s, v) => s + v, 0);
const mean = (a) => sum(a) / a.length;
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (m) => `${MON[+m.slice(5) - 1]} ${m.slice(0, 4)}`;
const claim = (ok, what) => { if (!ok) throw new Error(`assess-final: the data no longer support “${what}”`); };
const { rf, mrp } = MARKET;
const MP = COMPANIES.morrow, HS = COMPANIES.harbour;
const S = D.stats;

// ---------------------------------------------------------------- module 1
// fn-1: an offer for Harbour Street at a premium, as an EV/EBITDA
const BID = { premium: 0.25 };
const bidPrice = HS.price * (1 + BID.premium);
const bidEquity = bidPrice * HS.shares, bidEv = IV.enterpriseValue({ marketCap: bidEquity, debt: HS.debt, cash: HS.cash });
const bidMult = bidEv / HS.ebitda;
// fn-2: a value-weighted index of three fictional companies; C issues shares at the month-end
const IX = { caps: [600, 300, 100], rets: [0.04, -0.02, 0.10], issue: 50 };
const ixW = IX.caps.map((c) => c / sum(IX.caps));
const ixRet = sum(ixW.map((w, i) => w * IX.rets[i]));
const ixCapChange = (sum(IX.caps.map((c, i) => c * (1 + IX.rets[i]))) + IX.issue) / sum(IX.caps) - 1;
// fn-3: Brackenmoor Mills’ bond (fictional): 8 years, 6.25% semi-annual, yielding 5.40%; the spread widens 75 bp
const BM = { face: 100, couponRate: 0.0625, years: 8, freq: 2, ytm: 0.054, bp: 75 };
const bmD = IV.duration(BM);
const bmNew = IV.bondAtYield({ face: 100, couponRate: BM.couponRate, years: BM.years, freq: BM.freq }, BM.ytm + BM.bp / 10000).price;
const bmDy = BM.bp / 10000;
const bmEst = IV.priceChangeApprox(bmD, bmDy), bmEstD = IV.priceChangeApprox({ modified: bmD.modified }, bmDy);
const bmExact = bmNew / bmD.price - 1;
claim(bmD.price > 100 && bmEstD < bmExact && Math.abs(bmEst - bmExact) < Math.abs(bmEstD - bmExact), 'the bond is at a premium, and convexity brings the estimate closer to the exact fall');
// fn-4: Morrow & Pike’s 2031 bond: spread over interpolated government yields, then a downgrade
const MB = BONDS.find((b) => b.name.startsWith('Morrow')), G2 = BONDS.find((b) => b.years === 2), G5 = BONDS.find((b) => b.years === 5);
const mbD = IV.duration({ face: 100, ...MB });
const govAt = (t) => G2.ytm + (t - G2.years) / (G5.years - G2.years) * (G5.ytm - G2.ytm);
const mbGov = govAt(MB.years), mbSpread = MB.ytm - mbGov;
const DG = { spread: 0.025 };
const mbDy = DG.spread - mbSpread;
const mbNewEst = mbD.price * (1 - mbD.modified * mbDy);

// ---------------------------------------------------------------- module 2
// fn-5: the bond fund’s calendar-year returns, rounded to four decimals for the sheet
const BY = IV.yearly(MONTHS, SERIES.bonds).map((y) => ({ year: y.year, ret: rnd(y.ret, 4) }));
const byGeo = Math.exp(mean(BY.map((y) => Math.log(1 + y.ret)))) - 1;
const INF = 0.028;
const byReal = (1 + byGeo) / (1 + INF) - 1;
const byL = BY.length + 1;
const byCells = { A1: 'Year', B1: 'Bond fund', D1: 'Inflation a year', E1: INF, D3: 'Real compound return a year' };
BY.forEach((y, i) => { byCells[`A${i + 2}`] = `${y.year}`; byCells[`B${i + 2}`] = y.ret; });
// fn-6: a projection with the arithmetic mean against the geometric, in today’s dollars
const PJ = { amount: 20_000, years: 25 };
const pjReal = (g) => PJ.amount * ((1 + g) / (1 + INF)) ** PJ.years;
const pjGap = pjReal(S.intl.mean) - pjReal(S.intl.growth);
// fn-7: the 10-year average annual return under a normal model
const HZ = { years: 10 };
const hzSe = S.market.sd / Math.sqrt(HZ.years);
const hzP = normCdf((0 - S.market.mean) / hzSe), hz1 = normCdf((0 - S.market.mean) / S.market.sd);
// fn-8: risk measures across the funds
const dd = D.drawdown, wy = D.worstYear;
const bondLossP = normCdf(-S.bonds.mean / S.bonds.sd);
const bondLossYears = IV.yearly(MONTHS, SERIES.bonds).filter((y) => y.ret < 0).length;
const ddPeak = MONTHS[dd.market.peak - 1], ddTrough = MONTHS[dd.market.trough - 1];
claim(dd.market.drawdown < wy.market && ddPeak.startsWith('2021') && ddTrough.startsWith('2022'), 'the market’s largest drawdown ran from 2021 into 2022 and was deeper than its worst calendar year');
claim(wy.intl < wy.market && S.intl.sd - S.market.sd < 0.02 && bondLossYears === 1 && bondLossP > 0.1, 'international’s worst year was worse with only slightly higher volatility; the bond fund lost money in one year of 15');
claim(Math.abs(S.bonds.sd / S.market.sd - 0.25) < 0.02 && Math.abs(wy.bonds / wy.market - 0.5) < 0.03, 'the bond fund’s volatility is about a quarter of the market’s and its worst year about half as bad');

// ---------------------------------------------------------------- module 3
// fn-9: the total-market and international funds
const MI = IV.sampleCov(SERIES.market, SERIES.intl);
const miCovM = rnd(MI.cov, 6);
const miCorr = (miCovM * 12) / (S.market.sd * S.intl.sd);
const MIX = { wm: 0.3 };
const miSd = IV.twoAsset({ w: MIX.wm, ra: 0, rb: 0, sa: S.market.sd, sb: S.intl.sd, corr: miCorr }).sd;
const miMin = IV.twoAssetMinVarWeight({ sa: S.market.sd, sb: S.intl.sd, corr: miCorr });
claim(miMin > 0.5 && miMin < 0.9, 'the least risky mix holds mostly the total-market fund');
// fn-10: an equally weighted portfolio of 25 shares
const EQ = { sd: 0.30, corr: 0.2, n: 25 };
const eqSd = IV.equalWeightSd(EQ.n, EQ.sd ** 2, EQ.corr * EQ.sd ** 2);
const eqRemoved = 1 - eqSd ** 2 / EQ.sd ** 2, eqMax = 1 - EQ.corr;
// fn-11: two candidate risky portfolios and a client with A = 6
const PQ = { rf: 0.03, A: 6, P: { er: 0.11, sd: 0.20 }, Q: { er: 0.08, sd: 0.10 } };
const yP = IV.optimalRiskyShare({ rf: PQ.rf, ...PQ.P, A: PQ.A }), yQ = IV.optimalRiskyShare({ rf: PQ.rf, ...PQ.Q, A: PQ.A });
const shP = IV.sharpe(PQ.P.er, PQ.rf, PQ.P.sd), shQ = IV.sharpe(PQ.Q.er, PQ.rf, PQ.Q.sd);
const uOf = (y, p) => { const c = IV.cal({ y, rf: PQ.rf, er: p.er, sd: p.sd }); return c.er - 0.5 * PQ.A * c.sd ** 2; };
const uP = uOf(yP, PQ.P), uQ = uOf(yQ, PQ.Q);
claim(shQ > shP && uQ > uP && yQ < 1, 'Q has the higher Sharpe ratio and gives the higher utility without borrowing');
// fn-12: the standard error of the market’s mean excess return
const EXM = SERIES.market.map((v, i) => v - SERIES.bills[i]);
const exMean = IV.annualise.mean(mean(EXM));
const exSdM = Math.sqrt(sum(EXM.map((v) => (v - mean(EXM)) ** 2)) / (EXM.length - 1));
const exSe = (exSdM / Math.sqrt(EXM.length)) * 12;
const exLo = exMean - 1.96 * exSe, exHi = exMean + 1.96 * exSe;
claim(exLo > 0 && exLo < 0.01, 'the lower 95% limit is just above zero');
// fn-13: the best complete portfolio’s expected return
const CP = { er: 0.088, sd: 0.15, rf: 0.042, A: 4 };
const cpEr = (A) => CP.rf + (CP.er - CP.rf) ** 2 / (A * CP.sd ** 2);
const cpCells = { A1: 'Risky portfolio: expected return', B1: CP.er, A2: 'Risky portfolio: standard deviation', B2: CP.sd, A3: 'Risk-free rate', B3: CP.rf, A4: 'Risk aversion, A', B4: CP.A, A6: 'Expected return of the best mix' };
// fn-14: Northgate against the market, 2023–2027 (simulated), excess returns
const L60 = (k) => SERIES[k].slice(LAST60.from);
const ex60 = (k) => L60(k).map((v, i) => rnd(v - L60('bills')[i], 6));
const NG = { m: ex60('market'), a: ex60('active') };
const ngReg = IV.regressBeta(NG.a, NG.m);
const ngAlphaY = ngReg.alpha * 12, ngGross = ngAlphaY + ASSETS.active.fee, ngT = ngReg.alpha / ngReg.seAlpha;
const ngL = NG.m.length + 1;
const ngCells = { A1: 'Month', B1: 'Harbourline excess', C1: 'Northgate excess', E1: 'Alpha a year' };
NG.m.forEach((v, i) => { ngCells[`A${i + 2}`] = MONTHS[LAST60.from + i]; ngCells[`B${i + 2}`] = v; ngCells[`C${i + 2}`] = NG.a[i]; });
claim(ngGross < 0 && ngT > -1.96 && ngT < -1.5 && ngReg.r2 > 0.9, 'Northgate’s alpha is negative even before fees, with t between −1.96 and −1.5, and R² above 0.9');
// fn-15: a trust’s portfolio beta
const TR = { morrow: 0.5, harbour: 0.3, bills: 0.2 };
const trBeta = TR.morrow * D.betas60.morrow.beta + TR.harbour * D.betas60.harbour.beta;
const trReq = IV.capm({ rf, beta: trBeta, mrp });
// fn-16: fees on a growing account, and the outperformance that would make up for them
const FD = { amount: 10_000, monthly: 250, years: 25, r: 0.065, fi: 0.0005, fa: 0.0095 };
const fdI = IV.feeDrag({ amount: FD.amount, monthly: FD.monthly, years: FD.years, r: FD.r, fee: FD.fi });
const fdA = IV.feeDrag({ amount: FD.amount, monthly: FD.monthly, years: FD.years, r: FD.r, fee: FD.fa });
const fdGap = fdI.net - fdA.net;
const fdBreak = (1 + FD.r) * (1 - FD.fi) / (1 - FD.fa) - (1 + FD.r);
// fn-17: Northgate against the index over the fifteen years
const ngTe = IV.annualise.sd(IV.trackingError(SERIES.active, SERIES.market));
const ngDiff = S.active.mean - S.market.mean;
const ngFull = IV.regressBeta(SERIES.active, SERIES.market, SERIES.bills);
const ngFullT = ngFull.alpha / ngFull.seAlpha;
const yrA = IV.yearly(MONTHS, SERIES.active), yrM = IV.yearly(MONTHS, SERIES.market);
const ngBeat = yrA.filter((y, i) => y.ret > yrM[i].ret).length;
claim(ngDiff < -(ASSETS.active.fee - ASSETS.market.fee) && ngFullT > -1.5 && ngBeat >= 5, 'Northgate trailed by more than the fee gap, its alpha’s t is above −1.5, and it beat the index in at least five years');

// ---------------------------------------------------------------- module 4
// fn-18: Lissendale Glassworks (fictional): the terminal value’s share
const LG = { fcf: [38, 41, 44, 46, 48], wacc: 0.085, g: 0.025 };
const lgShare = (w) => IV.dcf({ fcf: LG.fcf, rate: w, g: LG.g }).tvShare;
const lgD = IV.dcf({ fcf: LG.fcf, rate: LG.wacc, g: LG.g });
const lgCells = { A1: 'Year', B1: 'FCFF ($m)', A8: 'WACC', B8: LG.wacc, A9: 'Terminal growth', B9: LG.g, A11: 'Terminal value’s share of EV' };
LG.fcf.forEach((f, i) => { lgCells[`A${i + 2}`] = `Year ${i + 1}`; lgCells[`B${i + 2}`] = f; });
// fn-19: Esterby Water (fictional): CAPM, WACC, a Gordon EV and the bridge
const EW = { beta: 0.70, dv: 0.40, rd: 0.052, tax: 0.25, fcf1: 95, g: 0.025, debt: 1000, cash: 40, shares: 60, price: 22 };
const ewKe = IV.capm({ rf, beta: EW.beta, mrp });
const ewWacc = (1 - EW.dv) * ewKe + EW.dv * EW.rd * (1 - EW.tax);
const ewEv = EW.fcf1 / (ewWacc - EW.g);
const ewPs = IV.evToEquity({ ev: ewEv, debt: EW.debt, cash: EW.cash, shares: EW.shares }).perShare;
const ewNoTax = (1 - EW.dv) * ewKe + EW.dv * EW.rd;
claim(Math.abs(EW.debt / ewEv - EW.dv) < 0.03 && ewPs > EW.price, 'Esterby’s debt is close to 40% of its DCF value, and the value exceeds the price');
// fn-20: two fictional companies’ PVGO
const PV = [{ name: 'Cindral Software', price: 60, eps: 1.80, beta: 1.4 }, { name: 'Kelvarra Outdoor', price: 30, eps: 2.70, beta: 0.9 }]
  .map((c) => { const ke = IV.capm({ rf, beta: c.beta, mrp }); const g = IV.pvgo(c.price, c.eps, ke); return { ...c, ke, pvgo: g, share: g / c.price, pe: c.price / c.eps }; });
claim(PV[0].share > 0.7 && PV[1].share < 0.05, 'most of Cindral’s price is growth; almost none of Kelvarra’s is');
// fn-21: Marlstone Paints (fictional): a justified leading P/E against a peer
const MS = { roe: 0.12, payout: 0.40, beta: 1.1, peerPe: 15 };
const msKe = IV.capm({ rf, beta: MS.beta, mrp }), msG = IV.earningsGrowth(1 - MS.payout, MS.roe);
const msPe = MS.payout / (msKe - msG);
const msGap = MS.peerPe / msPe - 1;
// fn-22: Orvane Roasting (fictional, private) valued with Morrow & Pike’s multiples
const OR = { ebitda: 14, ni: 6, debt: 30, cash: 4 };
const orEv = IV.impliedValue({ multiple: MP.m.evEbitda, metric: OR.ebitda, basis: 'ev', debt: OR.debt, cash: OR.cash, shares: 1 }).equity;
const orPe = MP.m.pe * OR.ni;
const orEvNoBridge = MP.m.evEbitda * OR.ebitda, orPeBridged = orPe - OR.debt + OR.cash;
// fn-23: Saffordby Brewing (fictional): a margin of safety off the conservative DCF
const SB = { fcf1: 30, g: 0.03, wacc: 0.08, high: 0.09, debt: 100, cash: 20, shares: 20, margin: 0.20 };
const sbPs = (w) => IV.evToEquity({ ev: SB.fcf1 / (w - SB.g), debt: SB.debt, cash: SB.cash, shares: SB.shares }).perShare;
const sbMax = sbPs(SB.high) * (1 - SB.margin);

export const items = [
  // ================================================================ Module 1: Securities and markets
  {
    id: 'f06-fn-1', lesson: 'shares-and-markets', type: 'num', kind: 'applied',
    prompt: `A fictional food group offers to buy every share of Harbour Street Foods (fictional; ${HS.shares} million shares at $${fx(HS.price)}, debt ${mil(HS.debt)}, cash ${mil(HS.cash)}, 2027 EBITDA ${mil(HS.ebitda)}) at a ${pc(BID.premium, 0)} premium to the share price. It would take on the debt and keep the cash. What multiple of EBITDA is it paying for the business? Give two decimal places.`,
    answer: rnd(bidMult, 2), check: () => (18 * 1.25 * 120 + 1188 - 60) / 410, unit: '×', places: 2, tol: 0.01,
    wrong: [
      { value: rnd(HS.m.evEbitda, 2), say: 'That is the multiple at the market price. The offer adds a 25% premium to every share, which raises the equity and so the enterprise value.' },
      { value: rnd(bidEquity / HS.ebitda, 2), say: 'That divides the equity price alone by EBITDA. EBITDA belongs to lenders and shareholders together, so compare it with the enterprise value: add the debt, take off the cash.' },
      { value: rnd((bidEquity + HS.debt + HS.cash) / HS.ebitda, 2), say: 'The cash comes with the company, so it lowers the net price of the business: subtract it.' },
    ],
    solution: `Offer price $${fx(HS.price)} × ${fx(1 + BID.premium, 2)} = $${fx(bidPrice)}; equity ${HS.shares} × ${fx(bidPrice)} = ${mil(bidEquity)}. Enterprise value paid = ${fx(bidEquity, 0)} + ${fx(HS.debt, 0)} − ${HS.cash} = ${mil(bidEv)}; ÷ EBITDA ${HS.ebitda} = ${fx(bidMult)} times, against ${fx(HS.m.evEbitda)} at the market price. A 25% premium on the equity raises the EV multiple by less than 25% (here by ${pc(bidMult / HS.m.evEbitda - 1, 1)}), because the debt is bought at face value.`,
  },
  {
    id: 'f06-fn-2', lesson: 'shares-and-markets', type: 'num', kind: 'conceptual',
    prompt: `A value-weighted index holds three fictional companies, A, B and C, with market capitalisations of ${IX.caps.map((c) => mil(c)).join(', ')} at the start of a month. Over the month their share prices change by ${IX.rets.map((r) => sg(r, 0)).join(', ')} (no dividends). On the last day of the month C sells new shares worth ${mil(IX.issue)}, which the index includes from then on. What was the index’s return for the month? Give a percentage to one decimal place.`,
    answer: rnd(ixRet * 100, 1), check: () => (0.6 * 4 + 0.3 * -2 + 0.1 * 10), unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(ixCapChange * 100, 1), say: 'That is the change in the index’s total market value, which includes the new shares C sold. New money paid in is not a return to anyone holding the index.' },
      { value: rnd(mean(IX.rets) * 100, 1), say: 'That is the simple average of the three returns. A value-weighted index weights each return by the company’s share of the start-of-month value.' },
    ],
    solution: `Start weights: ${ixW.map((w) => pc(w, 0)).join(', ')}. Index return = ${ixW.map((w, i) => `${fx(w, 1)} × ${sg(IX.rets[i], 0)}`).join(' + ')} = ${sg(ixRet, 1)}. The index’s total value rose ${pc(ixCapChange, 1)}, but ${mil(IX.issue)} of that is new shares bought for cash: an index provider adjusts its divisor for issues so that only price changes count as return.`,
  },
  {
    id: 'f06-fn-3', lesson: 'bond-prices-and-yields', type: 'steps', kind: 'applied',
    prompt: `Brackenmoor Mills (fictional, listed) has a bond with ${BM.years} years left and a ${pc(BM.couponRate)} coupon paid twice a year; it yields ${pc(BM.ytm)}. Analysts expect a downgrade to widen its credit spread by ${BM.bp} basis points, with government yields unchanged.`,
    steps: [
      {
        id: 'f06-fn-3-s1', type: 'formula', kind: 'numerical',
        prompt: 'B1:B4 hold the bond’s coupon rate, years to maturity, yield today and face value; B5 holds the widening in basis points. In B7, write one formula for the bond’s price per $100 after the widening, as a positive number.',
        sheet: { cells: { A1: 'Coupon rate (a year)', B1: BM.couponRate, A2: 'Years to maturity', B2: BM.years, A3: 'Yield to maturity today', B3: BM.ytm, A4: 'Face value ($)', B4: 100, A5: 'Spread widening (basis points)', B5: BM.bp, A7: 'Price after the widening ($)' }, fixed: ['B2', 'B4'], vary: { B5: [50, 120] } },
        cell: 'B7', view: 'A1:B7', widths: { A: 30, B: 12 }, formats: { B1: '0.00%', B3: '0.00%', B4: '$#,##0.00', B7: '$#,##0.00' },
        answer: '=PV((B3+B5/10000)/2,B2*2,-B1*B4/2,-B4)',
        alt: ['=-PV((B3+B5/10000)/2,B2*2,B1*B4/2,B4)', '=PV((B3+B5*0.0001)/2,2*B2,-B4*B1/2,-B4)'],
        require: ['PV'],
        wrong: [
          { formula: '=PV(B3/2,B2*2,-B1*B4/2,-B4)', say: 'That is today’s price. Add the widening to the yield first: B5 ÷ 10,000 turns basis points into a decimal.' },
          { formula: '=PV((B3+B5/100)/2,B2*2,-B1*B4/2,-B4)', say: 'A basis point is a hundredth of a percentage point, 0.0001: divide B5 by 10,000, not 100.' },
          { formula: '=PV(B3+B5/10000,B2,-B1*B4,-B4)', say: 'That prices the bond as if it paid once a year. Coupons are paid twice a year: halve the yield and the coupon and double the periods.' },
        ],
        solution: `<x>=PV((B3+B5/10000)/2,B2*2,-B1*B4/2,-B4)</x>: at ${pc(BM.ytm + bmDy)} the price is $${fx(bmNew)}, down from $${fx(bmD.price)} (${pc(bmExact)}).`,
      },
      {
        id: 'f06-fn-3-s2', type: 'num', kind: 'numerical',
        prompt: `At today’s yield the bond’s modified duration is ${fx(bmD.modified)} and its convexity ${fx(bmD.convexity, 1)}. Estimate the percentage change in its price for the ${BM.bp}-basis-point widening, using both duration and convexity. Give a signed percentage to two decimal places.`,
        answer: rnd(bmEst * 100, 2), check: () => (-bmD.modified * 0.0075 + 0.5 * bmD.convexity * 0.0075 ** 2) * 100, unit: '%', places: 2, tol: 0.02,
        wrong: [
          { value: rnd(bmEstD * 100, 2), say: 'That is duration alone. Add the convexity term, ½ × convexity × (0.0075)², which is positive whichever way yields move.' },
          { value: rnd(-bmD.macaulay * bmDy * 100, 2), say: 'That uses the Macaulay duration. The price sensitivity is the modified duration, Macaulay ÷ (1 + yield/2).' },
        ],
        solution: `ΔP/P ≈ −${fx(bmD.modified)} × 0.0075 + ½ × ${fx(bmD.convexity, 1)} × 0.0075² = ${pc(bmEstD)} + ${pc(0.5 * bmD.convexity * bmDy ** 2, 3)} = ${pc(bmEst)}. The exact repricing in step 1 gives ${pc(bmExact, 3)}: duration alone overstates the fall (${pc(bmEstD)}), and adding convexity closes most of the gap.`,
      },
    ],
    solution: `Reprice at the new yield for the exact answer (${money(bmD.price)} → ${money(bmNew)}); duration and convexity give a quick estimate, ${pc(bmEst, 3)} against an exact ${pc(bmExact, 3)}, where duration alone gives ${pc(bmEstD, 3)}. A credit-spread move changes the price exactly as a move in government yields of the same size would.`,
  },
  {
    id: 'f06-fn-4', lesson: 'bond-prices-and-yields', type: 'num', kind: 'applied',
    prompt: `The Morrow & Pike 2031 bond (fictional; ${fx(MB.years, 1)} years left, ${pc(MB.couponRate)} coupon paid twice a year) yields ${pc(MB.ytm)}, a price of $${fx(mbD.price)} per $100, and has a modified duration of ${fx(mbD.modified)}. Government notes yield ${pc(G2.ytm)} at ${G2.years} years and ${pc(G5.ytm)} at ${G5.years} years. An analyst thinks that if the bond were cut from BBB to BB it would trade at a spread of ${fx(DG.spread * 10000, 0)} basis points over a government yield of the same maturity (found by straight-line interpolation), with government yields unchanged. Using modified duration alone, what price per $100 would that imply? Give dollars and cents.`,
    answer: rnd(mbNewEst, 2), check: () => mbD.price * (1 - mbD.modified * (0.025 - (0.0545 - (0.041 + 1.5 / 3 * 0.001)))), unit: '$', places: 2, tol: 0.03,
    wrong: [
      { value: rnd(mbD.price * (1 - mbD.modified * DG.spread), 2), say: 'That adds the whole 250 basis points to the yield. The bond already trades at a spread: only the widening, from today’s spread to 250, moves its yield.' },
      { value: rnd(mbD.price * (1 - mbD.modified * (DG.spread - (MB.ytm - G5.ytm))), 2), say: 'That measures today’s spread against the five-year note. The bond has 3.5 years left: interpolate the government yield at 3.5 years.' },
      { value: rnd(mbD.price * (1 - mbD.macaulay * mbDy), 2), say: 'That uses the Macaulay duration. Price sensitivity is the modified duration.' },
    ],
    solution: `Government yield at ${fx(MB.years, 1)} years: ${pc(G2.ytm)} + (1.5 ÷ 3) × (${pc(G5.ytm)} − ${pc(G2.ytm)}) = ${pc(mbGov)}. Today’s spread: ${pc(MB.ytm)} − ${pc(mbGov)} = ${fx(mbSpread * 10000, 0)} basis points. At ${fx(DG.spread * 10000, 0)} the yield rises by ${fx(mbDy * 10000, 0)} basis points, so ΔP/P ≈ −${fx(mbD.modified)} × ${fx(mbDy, 4)} = ${pc(-mbD.modified * mbDy)} and the price ≈ $${fx(mbD.price)} × ${fx(1 - mbD.modified * mbDy, 4)} = $${fx(mbNewEst)}. Falling below BBB also takes the bond out of investment grade, which can force some holders to sell.`,
  },

  // ================================================================ Module 2: Risk and return
  {
    id: 'f06-fn-5', lesson: 'measuring-returns', type: 'formula', kind: 'applied',
    prompt: `B2:B${byL} hold the Harbourline Aggregate Bond Index Fund’s calendar-year total returns for 2013–2027 (simulated for this course). E1 holds an inflation rate a year. In E3, write one formula for the fund’s real compound return a year over the fifteen years: the rate at which its purchasing power grew.`,
    sheet: { cells: byCells, vary: { E1: [0.022, 0.034] } },
    cell: 'E3', view: `A1:E${byL}`, widths: { A: 8, B: 11, C: 2, D: 24, E: 9 }, formats: { B: '0.00%', E1: '0.0%', E3: '0.00%' },
    answer: `=GEOMEAN(1+B2:B${byL})/(1+E1)-1`,
    alt: [`=PRODUCT(1+B2:B${byL})^(1/COUNT(B2:B${byL}))/(1+E1)-1`, `=(PRODUCT(1+B2:B${byL})/(1+E1)^15)^(1/15)-1`],
    wrong: [
      { formula: `=AVERAGE(B2:B${byL})-E1`, say: 'That subtracts inflation from the arithmetic mean. The compound rate is the geometric mean of the growth factors, and real growth divides growth factors: (1 + nominal) ÷ (1 + inflation) − 1.' },
      { formula: `=GEOMEAN(1+B2:B${byL})-1-E1`, say: 'The geometric mean is right, but subtracting inflation is only an approximation. Divide the growth factors: (1 + g) ÷ (1 + E1) − 1.' },
      { formula: `=AVERAGE(B2:B${byL})/(1+E1)-1`, say: 'Divide growth factors, not a return: (1 + the compound return) ÷ (1 + inflation) − 1.' },
      { formula: `=GEOMEAN(1+B2:B${byL})-1`, say: 'That is the nominal compound return. Purchasing power grows by (1 + nominal) ÷ (1 + inflation) − 1.' },
    ],
    solution: `<x>=GEOMEAN(1+B2:B${byL})/(1+E1)-1</x>. The fifteen growth factors compound to a geometric mean of ${pc(byGeo)} a year (GEOMEAN needs positive values, hence 1 + each return, which also copes with 2022’s ${pc(BY.find((y) => y.year === '2022').ret, 1)}). At ${pc(INF, 1)} inflation the real compound return is ${fx(1 + byGeo, 4)} ÷ ${fx(1 + INF, 3)} − 1 = ${pc(byReal)} a year. These returns are simulated for teaching; real bond-market history should be checked against a source such as Damodaran’s historical returns page.`,
  },
  {
    id: 'f06-fn-6', lesson: 'measuring-returns', type: 'num', kind: 'conceptual',
    prompt: `A fictional financial planner projects a client’s $${fx(PJ.amount, 0)} in the Harbourline International Index Fund over ${PJ.years} years. Over 2013–2027 the fund’s simulated monthly returns give an arithmetic mean of ${pc(S.intl.mean)} a year (the monthly mean × 12) and a compound growth rate of ${pc(S.intl.growth)} a year. The planner grows the money at the arithmetic mean; you grow it at the compound rate. Both then express the result in today’s dollars at 2.8% inflation a year. By how much, in today’s dollars, does the planner’s projection exceed yours? Give a whole number of dollars.`,
    answer: Math.round(pjGap), check: () => 20000 * ((1 + S.intl.mean) / 1.028) ** 25 - 20000 * ((1 + S.intl.growth) / 1.028) ** 25, unit: '$', places: 0, tol: 25,
    wrong: [
      { value: Math.round(PJ.amount * ((1 + S.intl.mean) ** PJ.years - (1 + S.intl.growth) ** PJ.years)), say: 'That is the gap in dollars of 25 years from now. Divide by 1.028²⁵ (or use real growth factors) to put it in today’s dollars.' },
      { value: Math.round(PJ.amount * (1 + S.intl.mean - INF) ** PJ.years - PJ.amount * (1 + S.intl.growth - INF) ** PJ.years), say: 'That subtracts 2.8 points from each rate. Real growth divides the factors: (1 + r) ÷ 1.028.' },
    ],
    solution: `Real growth factors: ${fx(1 + S.intl.mean, 4)} ÷ 1.028 and ${fx(1 + S.intl.growth, 4)} ÷ 1.028. Planner: 20,000 × (${fx((1 + S.intl.mean) / 1.028, 5)})²⁵ = ${money(pjReal(S.intl.mean), 0)}. Compound rate: 20,000 × (${fx((1 + S.intl.growth) / 1.028, 5)})²⁵ = ${money(pjReal(S.intl.growth), 0)}. The gap is ${money(pjGap, 0)} in today’s dollars. The arithmetic mean is the expected return for one year; money left for 25 years grows at the compound rate, which volatility pulls below it. (Both rates are from simulated data and are no forecast.)`,
  },
  {
    id: 'f06-fn-7', lesson: 'measuring-risk', type: 'num', kind: 'numerical',
    prompt: `Suppose the total-market fund’s yearly returns were independent and normally distributed, with the simulated history’s arithmetic mean of ${pc(S.market.mean)} and volatility of ${pc(S.market.sd)} a year. What would be the probability that its average yearly return over the next ${HZ.years} years is below zero? Give a percentage to one decimal place.`,
    answer: rnd(hzP * 100, 1), check: () => normCdf(-S.market.mean / (S.market.sd / Math.sqrt(10))) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: rnd(hz1 * 100, 1), say: 'That is the chance of a losing single year. The average of ten independent years varies less: its SD is σ ÷ √10.' },
      { value: rnd(normCdf(-S.market.mean / (S.market.sd * Math.sqrt(HZ.years))) * 100, 1), say: 'That multiplies the SD by √10, which is how the spread of the ten-year total grows. The average divides by √10.' },
    ],
    solution: `SD of the ten-year average = ${pc(S.market.sd)} ÷ √10 = ${pc(hzSe)}. z = (0 − ${pc(S.market.mean)}) ÷ ${pc(hzSe)} = ${fx(-S.market.mean / hzSe)}; P(z < ${fx(-S.market.mean / hzSe)}) = ${pc(hzP, 1)}, against ${pc(hz1, 1)} for a single year. Two cautions: real returns have fatter tails than the normal (the simulated ones were drawn from a t distribution), and a positive average yearly return can still leave less money than you started with, since what you end with depends on compound growth.`,
  },
  {
    id: 'f06-fn-8', lesson: 'measuring-risk', type: 'multi', kind: 'conceptual',
    prompt: 'Ana compares the risk of the course’s simulated funds over 2013–2027. Which statements are true? Select all that apply.',
    options: [
      `The international fund’s worst calendar year (${pc(wy.intl, 1)}) was clearly worse than the total-market fund’s (${pc(wy.market, 1)}), though its volatility was only ${fx((S.intl.sd - S.market.sd) * 100, 1)} points higher`,
      `The total-market fund’s largest fall from a peak (${pc(dd.market.drawdown, 1)}) was deeper than its worst calendar year, because the fall began in 2021 and ended in 2022`,
      `A normal distribution with the bond fund’s mean (${pc(S.bonds.mean)}) and volatility (${pc(S.bonds.sd)}) gives a loss in ${pc(bondLossP, 0)} of years; the history had ${bondLossYears} losing year in 15, so the normal curve must overstate bond risk`,
      `With a volatility of ${pc(S.market.sd)}, the total-market fund never lost more than about 16% in a calendar year`,
      `The bond fund’s volatility was about a quarter of the total-market fund’s, yet its worst calendar year was about half as bad (${pc(wy.bonds, 1)} against ${pc(wy.market, 1)})`,
    ],
    answer: [0, 1, 4],
    feedback: {
      2: `One losing year in 15 is consistent with a ${pc(bondLossP, 0)} chance a year (about ${fx(15 * bondLossP, 1)} expected): fifteen years are far too few to say the normal curve overstates the risk. Fat tails, if anything, make bad years worse than the normal suggests.`,
      3: `Volatility is a typical deviation from the mean, not a floor. The fund lost ${pc(-wy.market, 1)} in its worst year, well beyond one SD below its mean.`,
    },
    solution: `Worst years and drawdowns capture what volatility hides: international’s worst year was ${pc(wy.intl, 1)}, and the market’s drawdown from the end of ${monthName(ddPeak)} to the end of ${monthName(ddTrough)} (${pc(dd.market.drawdown, 1)}) spanned two calendar years. The bond fund had ${pc(S.bonds.sd / S.market.sd, 0)} of the market’s volatility but ${pc(wy.bonds / wy.market, 0)} of its worst year, because 2022 hit both. A normal model’s ${pc(bondLossP, 1)} chance of a losing year cannot be rejected from one loss in fifteen. Simulated data: real history should be checked against published sources.`,
  },

  // ================================================================ Module 3: Portfolios and the market
  {
    id: 'f06-fn-9', lesson: 'diversification', type: 'steps', kind: 'numerical',
    prompt: `Over 2013–2027 the simulated monthly returns of the Harbourline Total Market and International funds have a covariance of ${fx(miCovM, 6)} (monthly returns in decimals). Their annualised volatilities are ${pc(S.market.sd)} and ${pc(S.intl.sd)}.`,
    steps: [
      {
        id: 'f06-fn-9-s1', type: 'num', kind: 'numerical',
        prompt: 'Annualise the covariance and find the correlation between the two funds. Give two decimal places.',
        answer: rnd(miCorr, 2), check: () => miCovM * 12 / (S.market.sd * S.intl.sd), unit: '', places: 2, tol: 0.01,
        wrong: [
          { value: rnd(miCovM / (S.market.sd * S.intl.sd), 2), say: 'That divides a monthly covariance by annual SDs. Annualise the covariance first: like a variance, it scales by 12.' },
          { value: rnd(miCovM * Math.sqrt(12) / (S.market.sd * S.intl.sd), 2), say: 'A covariance scales like a variance, by 12, not like an SD, by √12.' },
        ],
        solution: `Annual covariance = ${fx(miCovM, 6)} × 12 = ${fx(miCovM * 12, 4)}. Correlation = ${fx(miCovM * 12, 4)} ÷ (${fx(S.market.sd, 4)} × ${fx(S.intl.sd, 4)}) = ${fx(miCorr)}.`,
      },
      {
        id: 'f06-fn-9-s2', type: 'num', kind: 'numerical',
        prompt: `What is the volatility of a portfolio with ${pc(MIX.wm, 0)} in the total-market fund and ${pc(1 - MIX.wm, 0)} in the international fund? Give a percentage to two decimal places.`,
        answer: rnd(miSd * 100, 2), check: () => Math.sqrt(0.09 * S.market.sd ** 2 + 0.49 * S.intl.sd ** 2 + 2 * 0.3 * 0.7 * miCovM * 12) * 100, unit: '%', places: 2, tol: 0.03,
        wrong: [
          { value: rnd((MIX.wm * S.market.sd + (1 - MIX.wm) * S.intl.sd) * 100, 2), say: 'That averages the volatilities, which holds only for a correlation of 1. Use the variances and the covariance.' },
          { value: rnd(Math.sqrt(MIX.wm ** 2 * S.market.sd ** 2 + (1 - MIX.wm) ** 2 * S.intl.sd ** 2) * 100, 2), say: 'That leaves out the covariance term, 2 × 0.3 × 0.7 × the annual covariance; with a correlation this high it is large.' },
        ],
        solution: `σ² = 0.3² × ${fx(S.market.sd, 4)}² + 0.7² × ${fx(S.intl.sd, 4)}² + 2 × 0.3 × 0.7 × ${fx(miCovM * 12, 4)} = ${fx(miSd ** 2, 5)}, so σ = ${pc(miSd)}: only a little below the ${pc(MIX.wm * S.market.sd + (1 - MIX.wm) * S.intl.sd)} weighted average, because the two share funds are highly correlated.`,
      },
      {
        id: 'f06-fn-9-s3', type: 'num', kind: 'numerical',
        prompt: 'What weight in the total-market fund gives the least risky mix of the two funds? Give a percentage to one decimal place.',
        answer: rnd(miMin * 100, 1), check: () => { const a = S.market.sd, b = S.intl.sd, c = miCovM * 12; return (b * b - c) / (a * a + b * b - 2 * c) * 100; }, unit: '%', places: 1, tol: 0.3,
        wrong: [
          { value: rnd(S.intl.sd ** 2 / (S.market.sd ** 2 + S.intl.sd ** 2) * 100, 1), say: 'That ignores the covariance: it is the minimum-variance weight only for uncorrelated assets.' },
          { value: rnd((1 - miMin) * 100, 1), say: 'That is the weight in the international fund. The formula’s numerator uses the other asset’s variance: σ_B² − cov for the weight in A.' },
        ],
        solution: `w_market = (σ_I² − cov) ÷ (σ_M² + σ_I² − 2cov) = (${fx(S.intl.sd ** 2, 5)} − ${fx(miCovM * 12, 5)}) ÷ (${fx(S.market.sd ** 2, 5)} + ${fx(S.intl.sd ** 2, 5)} − 2 × ${fx(miCovM * 12, 5)}) = ${pc(miMin, 1)}, with ${pc(1 - miMin, 1)} in the international fund; its volatility is ${pc(IV.twoAsset({ w: miMin, ra: 0, rb: 0, sa: S.market.sd, sb: S.intl.sd, corr: miCorr }).sd)}. With a correlation of ${fx(miCorr)} the saving from mixing two share funds is small: a bond fund diversifies far more.`,
      },
    ],
    solution: 'Annualise a covariance by 12 (like a variance), then use the two-asset formula. Highly correlated share funds diversify each other only a little.',
  },
  {
    id: 'f06-fn-10', lesson: 'diversification', type: 'num', kind: 'numerical',
    prompt: `On a fictional stock exchange, a typical share has a volatility of ${pc(EQ.sd, 0)} a year and pairs of shares have an average correlation of ${fx(EQ.corr, 1)}. An investor moves from one typical share into an equally weighted portfolio of ${EQ.n} of them. What percentage of the single share’s variance does she remove? Give a percentage to one decimal place.`,
    answer: rnd(eqRemoved * 100, 1), check: () => (1 - (0.09 / 25 + (24 / 25) * 0.2 * 0.09) / 0.09) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: rnd((1 - eqSd / EQ.sd) * 100, 1), say: 'That is the fall in the standard deviation. The question asks about the variance: compare σ_P² with σ².' },
      { value: rnd(eqMax * 100, 1), say: 'That is the most any number of shares could remove (1 − ρ). With 25 shares part of the specific risk still remains.' },
      { value: rnd((1 - 1 / EQ.n) * 100, 1), say: 'That would hold if the shares were uncorrelated. The average covariance can’t be diversified away.' },
    ],
    solution: `σ_P² = σ²/n + (1 − 1/n) × ρσ² = ${fx(EQ.sd ** 2, 2)} ÷ ${EQ.n} + ${fx(1 - 1 / EQ.n, 2)} × ${fx(EQ.corr * EQ.sd ** 2, 3)} = ${fx(eqSd ** 2, 5)} (σ_P = ${pc(eqSd)}). Removed: 1 − ${fx(eqSd ** 2, 5)} ÷ ${fx(EQ.sd ** 2, 2)} = ${pc(eqRemoved, 1)}, close to the ${pc(eqMax, 0)} limit: what is left is mostly systematic risk, which more shares from the same market can’t remove.`,
  },
  {
    id: 'f06-fn-11', lesson: 'efficient-portfolios', type: 'steps', kind: 'conceptual',
    prompt: `A fictional adviser offers two risky portfolios: P, with an expected return of ${pc(PQ.P.er, 0)} and a volatility of ${pc(PQ.P.sd, 0)}, and Q, with ${pc(PQ.Q.er, 0)} and ${pc(PQ.Q.sd, 0)}. Clients can lend and borrow at ${pc(PQ.rf, 0)}. A client with a risk-aversion coefficient of ${PQ.A} will combine one of them with the risk-free asset.`,
    steps: [
      {
        id: 'f06-fn-11-s1', type: 'num', kind: 'numerical',
        prompt: 'If she uses P, what share of her money maximises her utility, E(r) − ½ × A × σ²? Give a percentage to one decimal place.',
        answer: rnd(yP * 100, 1), check: () => (0.11 - 0.03) / (6 * 0.04) * 100, unit: '%', places: 1, tol: 0.15,
        wrong: [{ value: rnd((PQ.P.er - PQ.rf) / (PQ.A * PQ.P.sd) * 100, 1), say: `Square the volatility: the denominator is A × σ² = ${PQ.A} × ${fx(PQ.P.sd)}² = ${fx(PQ.A * PQ.P.sd ** 2)}.` }],
        solution: `y* = (${fx(PQ.P.er)} − ${fx(PQ.rf)}) ÷ (${PQ.A} × ${fx(PQ.P.sd)}²) = ${fx(PQ.P.er - PQ.rf)} ÷ ${fx(PQ.A * PQ.P.sd ** 2)} = ${pc(yP, 1)} in P, the rest in the risk-free asset.`,
      },
      {
        id: 'f06-fn-11-s2', type: 'num', kind: 'numerical',
        prompt: 'If she uses Q instead, what share should go into Q? Give a percentage to one decimal place.',
        answer: rnd(yQ * 100, 1), check: () => (0.08 - 0.03) / (6 * 0.01) * 100, unit: '%', places: 1, tol: 0.15,
        wrong: [{ value: rnd((PQ.Q.er - PQ.rf) / (PQ.A * PQ.Q.sd) * 100, 1), say: `Square the volatility: ${PQ.A} × ${fx(PQ.Q.sd)}² = ${fx(PQ.A * PQ.Q.sd ** 2)}.` }],
        solution: `y* = (${fx(PQ.Q.er)} − ${fx(PQ.rf)}) ÷ (${PQ.A} × ${fx(PQ.Q.sd)}²) = ${fx(PQ.Q.er - PQ.rf)} ÷ ${fx(PQ.A * PQ.Q.sd ** 2)} = ${pc(yQ, 1)} in Q.`,
      },
      {
        id: 'f06-fn-11-s3', type: 'mc', kind: 'conceptual',
        prompt: 'Which portfolio should she use, and why?',
        options: [
          'Q: its higher Sharpe ratio means its line through the risk-free rate gives more return at any risk',
          'P: its expected return is higher, and she can hold less of it to keep her overall risk down',
          'Either one, since her best share in each adjusts so that the risk she ends up with is the same',
          'Q: it is less volatile, and a client with a risk aversion as high as 6 should hold only low-volatility assets',
        ],
        answer: 0,
        feedback: {
          1: 'Holding less of P does lower risk, but at every level of risk the line through Q gives more expected return than the line through P.',
          2: 'The best share does adjust, but the two complete portfolios differ: the one on Q’s steeper line gives her a higher utility.',
          3: 'Q is right, but not because it is less volatile: Q could be levered to any volatility. It wins because its Sharpe ratio is higher, which would make it the better choice for any risk aversion.',
        },
        solution: `Sharpe ratios: P (${fx(PQ.P.er)} − ${fx(PQ.rf)}) ÷ ${fx(PQ.P.sd)} = ${fx(shP)}, Q (${fx(PQ.Q.er)} − ${fx(PQ.rf)}) ÷ ${fx(PQ.Q.sd)} = ${fx(shQ)}. Her utility at the best mix is ${pc(uP)} with P and ${pc(uQ)} with Q. Separation: choose the risky portfolio with the highest Sharpe ratio first, then set the share in it by risk aversion. Q levered to P’s ${pc(PQ.P.sd, 0)} volatility would offer ${pc(IV.cal({ y: PQ.P.sd / PQ.Q.sd, rf: PQ.rf, er: PQ.Q.er, sd: PQ.Q.sd }).er, 0)}, more than P’s ${pc(PQ.P.er, 0)}.`,
      },
    ],
    solution: 'Pick the risky portfolio with the highest Sharpe ratio, then choose how much of it to hold: y* = (E − r_f) ÷ (Aσ²).',
  },
  {
    id: 'f06-fn-12', lesson: 'efficient-portfolios', type: 'num', kind: 'numerical',
    prompt: `Over the 180 simulated months of 2013–2027 the total-market fund’s mean excess return over bills was ${pc(exMean)} a year (the monthly mean × 12), and the standard deviation of its monthly excess returns was ${pc(exSdM, 3)}. What is the lower end of an approximate 95% confidence interval for its true mean excess return a year (mean ± 1.96 standard errors)? Give a percentage to two decimal places.`,
    answer: rnd(exLo * 100, 2), check: () => (exMean - 1.96 * exSdM / Math.sqrt(180) * 12) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: rnd((exMean - 1.96 * exSdM * Math.sqrt(12)) * 100, 2), say: 'That uses the volatility of one year’s return. The uncertainty about a mean shrinks with the number of observations: the standard error is s ÷ √n.' },
      { value: rnd((exMean - 1.96 * exSdM / Math.sqrt(180)) * 100, 2), say: 'That is the standard error of the monthly mean, not annualised. The annual mean is the monthly mean × 12, so its standard error is × 12 too.' },
    ],
    solution: `SE of the monthly mean = ${pc(exSdM, 3)} ÷ √180 = ${pc(exSdM / Math.sqrt(180), 3)}; annualised × 12 = ${pc(exSe)} (equivalently ${pc(exSdM * Math.sqrt(12))} ÷ √15). Interval: ${pc(exMean)} ± 1.96 × ${pc(exSe)} = ${pc(exLo)} to ${pc(exHi)}. Fifteen years pin the risk premium down only to within about ±${fx(1.96 * exSe * 100, 0)} points, which is why an optimiser fed historical means chases noise. (The ${pc(exMean / 12)} monthly mean excess return was planted in the simulation.)`,
  },
  {
    id: 'f06-fn-13', lesson: 'efficient-portfolios', type: 'formula', kind: 'numerical',
    prompt: 'B1:B3 hold a fictional risky portfolio’s expected return and volatility and the risk-free rate; B4 holds a client’s risk-aversion coefficient A (utility = E(r) − ½ × A × σ²). In B6, write one formula for the expected return of the client’s best mix of the risky portfolio and the risk-free asset.',
    sheet: { cells: cpCells, vary: { B4: [2, 6] } },
    cell: 'B6', view: 'A1:B6', widths: { A: 34, B: 10 }, formats: { B1: '0.0%', B2: '0.0%', B3: '0.0%', B4: '0.0', B6: '0.00%' },
    answer: '=B3+(B1-B3)^2/(B4*B2^2)',
    alt: ['=B3+(B1-B3)/(B4*B2^2)*(B1-B3)'],
    wrong: [
      { formula: '=(B1-B3)/(B4*B2^2)', say: 'That is the best share in the risky portfolio, y*. The expected return of the mix is r_f + y* × (E − r_f).' },
      { formula: '=B3+(B1-B3)^2/(B4*B2)', say: 'The share y* divides by A × σ², the variance: square B2.' },
      { formula: '=B3+(B1-B3)/(B4*B2^2)*B1', say: 'Along the capital allocation line the risky share earns the excess return over r_f: multiply y* by (B1 − B3), not by B1.' },
    ],
    solution: `y* = (B1 − B3) ÷ (B4 × B2²), and on the capital allocation line E(r) = B3 + y* × (B1 − B3), so <x>=B3+(B1-B3)^2/(B4*B2^2)</x>. With A = ${CP.A}: y* = ${pc((CP.er - CP.rf) / (CP.A * CP.sd ** 2), 1)} and E(r) = ${pc(cpEr(CP.A))}. A more risk-averse client (higher A) holds less of the risky portfolio and expects less.`,
  },
  {
    id: 'f06-fn-14', lesson: 'capm-and-beta', type: 'steps', kind: 'applied',
    prompt: `Ana checks whether the Northgate Active Equity Fund (fictional, expense ratio ${pc(ASSETS.active.fee)}) has earned its fees. The sheet holds the simulated monthly excess returns over bills of the Harbourline total-market fund (B) and of Northgate (C) for January 2023 – December 2027. Northgate’s returns are after its fees.`,
    steps: [
      {
        id: 'f06-fn-14-s1', type: 'formula', kind: 'numerical',
        prompt: 'In E2, write one formula for Northgate’s alpha a year: the intercept of the regression of its excess returns on the market’s, annualised by this course’s convention for means.',
        sheet: { cells: ngCells }, cell: 'E2', view: `A1:E${ngL}`, maxHeight: '20rem',
        widths: { A: 9, B: 12, C: 12, D: 2, E: 12 }, formats: { B: '0.00%', C: '0.00%', E2: '0.00%' },
        answer: `=INTERCEPT(C2:C${ngL},B2:B${ngL})*12`,
        alt: [`=12*(AVERAGE(C2:C${ngL})-SLOPE(C2:C${ngL},B2:B${ngL})*AVERAGE(B2:B${ngL}))`],
        require: [],
        wrong: [
          { formula: `=INTERCEPT(B2:B${ngL},C2:C${ngL})*12`, say: 'The y range comes first: Northgate’s excess returns (C) regressed on the market’s (B).' },
          { formula: `=(AVERAGE(C2:C${ngL})-AVERAGE(B2:B${ngL}))*12`, say: 'That is the average gap, which assumes a beta of exactly 1. The intercept allows for Northgate’s estimated beta.' },
          { formula: `=INTERCEPT(C2:C${ngL},B2:B${ngL})`, say: 'That is alpha a month. Annualise it as a mean: × 12.' },
          { formula: `=SLOPE(C2:C${ngL},B2:B${ngL})`, say: 'That is the slope, Northgate’s beta. Alpha is the intercept.' },
        ],
        solution: `<x>=INTERCEPT(C2:C${ngL},B2:B${ngL})*12</x> gives ${pc(ngAlphaY)} a year (beta ${fx(ngReg.beta)}, R² ${fx(ngReg.r2)}). Because the intercept is the fund’s mean excess return less beta × the market’s, this is Jensen’s alpha: the return beyond what the CAPM requires for Northgate’s beta.`,
      },
      {
        id: 'f06-fn-14-s2', type: 'num', kind: 'numerical',
        prompt: 'Roughly what was Northgate’s alpha a year before its fees? Give a percentage to two decimal places, with a minus sign if it is negative.',
        answer: rnd(ngGross * 100, 2), check: () => (IV.regressBeta(NG.a, NG.m).alpha * 12 + 0.0085) * 100, unit: '%', places: 2, tol: 0.03,
        wrong: [
          { value: rnd((ngAlphaY - ASSETS.active.fee) * 100, 2), say: 'The fee has already been taken out of the returns; to see what the managers’ choices earned before it, add it back.' },
          { value: rnd(ngAlphaY * 100, 2), say: `That is the alpha after fees, from step 1. Add back the ${pc(ASSETS.active.fee)} the fund charges.` },
        ],
        solution: `After fees ${pc(ngAlphaY)} a year; adding back the ${pc(ASSETS.active.fee)} fee gives ${pc(ngGross)}: over these five simulated years the managers’ choices lost money relative to the market even before they were paid.`,
      },
      {
        id: 'f06-fn-14-s3', type: 'mc', kind: 'applied',
        prompt: `The regression gives the monthly alpha a t-statistic of ${fx(ngT)} and an R² of ${fx(ngReg.r2)}. What should Ana conclude?`,
        options: [
          'It lagged by more than its fee, but at this t-statistic five years can’t rule out a true alpha of zero',
          `The negative alpha is the price of the extra market risk Northgate took with a beta of ${fx(ngReg.beta)}, so it isn’t a shortfall`,
          `With an R² of ${fx(ngReg.r2)} the alpha estimate is almost exact, so the managers are proven to destroy value`,
          'The alpha is simply the fund’s fee showing up in the regression, so the managers did as well as the index',
        ],
        answer: 0,
        feedback: {
          1: 'Alpha is measured after allowing for beta: the CAPM’s required return already rises with beta, so a negative alpha is a shortfall beyond the reward for market risk.',
          2: 'R² says how much of the fund’s variation the market explains; it doesn’t make the intercept exact. Its t-statistic is what measures the evidence, and it falls short of −1.96.',
          3: 'The fee explains only part of it: alpha before fees is negative too.',
        },
        solution: `t = ${fx(ngT)}, inside ±1.96, so a zero true alpha isn’t ruled out at the 5% level, though the evidence leans against the fund and its fee is certain. The simulation built Northgate with a small negative alpha over the full fifteen years; these five years drew worse. For a fund held for decades, the certain cost matters more than an uncertain hope of skill.`,
      },
    ],
    solution: 'Regress excess returns on the market’s: the intercept is Jensen’s alpha, the slope beta. Add back fees to judge the managers’ choices, and read the t-statistic before calling a shortfall skill or luck.',
  },
  {
    id: 'f06-fn-15', lesson: 'capm-and-beta', type: 'num', kind: 'numerical',
    prompt: `A fictional family trust holds ${pc(TR.morrow, 0)} of its money in Morrow & Pike shares, ${pc(TR.harbour, 0)} in Harbour Street Foods shares and ${pc(TR.bills, 0)} in one-month bills. Regressions of 2023–2027 simulated excess returns give Morrow & Pike a beta of ${fx(D.betas60.morrow.beta)} and Harbour Street ${fx(D.betas60.harbour.beta)}. With F05’s ${pc(rf, 1)} risk-free rate and ${pc(mrp, 1)} market risk premium, what return does the CAPM require of the whole portfolio? Give a percentage to two decimal places.`,
    answer: rnd(trReq * 100, 2), check: () => (0.042 + (0.5 * 0.9 + 0.3 * 1.25) * 0.055) * 100, unit: '%', places: 2, tol: 0.02,
    wrong: [
      { value: rnd(IV.capm({ rf, beta: trBeta / (TR.morrow + TR.harbour), mrp }) * 100, 2), say: 'That rescales the share weights to add to 100% and leaves the bills out. Bills have a beta of 0 and earn the risk-free rate: keep their 20% weight.' },
      { value: rnd(IV.capm({ rf, beta: (D.betas60.morrow.beta + D.betas60.harbour.beta) / 2, mrp }) * 100, 2), say: 'That averages the two betas equally. Weight each holding’s beta by its share of the portfolio, bills (beta 0) included.' },
    ],
    solution: `Portfolio beta = ${fx(TR.morrow, 1)} × ${fx(D.betas60.morrow.beta)} + ${fx(TR.harbour, 1)} × ${fx(D.betas60.harbour.beta)} + ${fx(TR.bills, 1)} × 0 = ${fx(trBeta, 3)}. Required return = ${pc(rf, 1)} + ${fx(trBeta, 3)} × ${pc(mrp, 1)} = ${pc(trReq)}. Betas average by weight; volatilities don’t. Two shares leave a lot of specific risk (the two regressions’ R² are ${fx(D.betas60.morrow.r2)} and ${fx(D.betas60.harbour.r2)}), which the CAPM says earns no reward.`,
  },
  {
    id: 'f06-fn-16', lesson: 'funds-and-indexing', type: 'steps', kind: 'applied',
    prompt: `A fictional teacher invests $${fx(FD.amount, 0)} now and $${FD.monthly} at the end of every month for ${FD.years} years. She assumes ${pc(FD.r, 1)} a year before fees and compares an index fund charging ${pc(FD.fi)} a year with an active fund charging ${pc(FD.fa)}. Fees are taken as a share of the balance.`,
    steps: [
      {
        id: 'f06-fn-16-s1', type: 'num', kind: 'numerical',
        prompt: 'If the active fund’s managers add nothing before fees, how much more would she have at the end in the index fund? Give a whole number of dollars.',
        answer: Math.round(fdGap), check: () => IV.feeDrag({ amount: 10000, monthly: 250, years: 25, r: 0.065, fee: 0.0005 }).net - IV.feeDrag({ amount: 10000, monthly: 250, years: 25, r: 0.065, fee: 0.0095 }).net, unit: '$', places: 0, tol: 40,
        wrong: [
          { value: Math.round((FD.fa - FD.fi) * (FD.amount + FD.monthly * 12 * FD.years)), say: `That charges ${pc(FD.fa - FD.fi)} once on what she pays in. Fees are taken from the growing balance every year and lose their own growth.` },
          { value: Math.round(fdA.cost), say: 'That is what the active fund’s whole fee costs against no fees at all. Compare the two funds: the index fund charges a little too.' },
        ],
        solution: `With monthly compounding at the net rates (1.065 × (1 − fee) − 1): index fund ${money(fdI.net, 0)}, active fund ${money(fdA.net, 0)}; the gap is ${money(fdGap, 0)}, ${pc(fdGap / fdI.net, 1)} of the index fund’s balance, on ${money(FD.amount + FD.monthly * 12 * FD.years, 0)} paid in.`,
      },
      {
        id: 'f06-fn-16-s2', type: 'num', kind: 'numerical',
        prompt: 'By how many percentage points a year would the active managers have to beat the 6.5% before fees for her to end with the same amount in either fund? Give two decimal places.',
        answer: rnd(fdBreak * 100, 2), check: () => (1.065 * 0.9995 / 0.9905 - 1.065) * 100, unit: 'points', places: 2, tol: 0.01,
        wrong: [
          { value: rnd((FD.fa - FD.fi) * 100, 2), say: 'Close, but fees are a share of a growing balance, so the outperformance must cover the fee on the outperformance too: solve (1.065 + x)(1 − 0.0095) = 1.065 × (1 − 0.0005).' },
          { value: rnd(FD.fa * 100, 2), say: 'The index fund charges a fee too; the managers only need to make up the difference in costs.' },
        ],
        solution: `Equal net growth needs (1.065 + x) × (1 − 0.0095) = 1.065 × (1 − 0.0005), so x = 1.065 × 0.9995 ÷ 0.9905 − 1.065 = ${fx(fdBreak * 100)} points a year, every year for ${FD.years} years, just to break even. The fee is certain; the outperformance isn’t.`,
      },
    ],
    solution: 'Fees compound against you on a growing balance. An active fund must beat its index by roughly the fee gap, every year, to match it.',
  },
  {
    id: 'f06-fn-17', lesson: 'funds-and-indexing', type: 'multi', kind: 'conceptual',
    prompt: `Over the fifteen simulated years 2013–2027, Northgate’s monthly returns differ from the total-market index fund’s with a standard deviation that annualises to ${pc(ngTe)}; on average Northgate returned ${fx(Math.abs(ngDiff) * 100)} points a year less (arithmetic means); and a regression of its excess returns on the market’s gives an alpha with a t-statistic of ${fx(ngFullT)}. Northgate beat the index fund in ${ngBeat} of the 15 calendar years. Which statements are true? Select all that apply.`,
    options: [
      `The ${pc(ngTe)} is Northgate’s tracking error: it says how much the gap with the index varied, not how far Northgate trailed`,
      `Northgate trailed by more than the gap in fees between the two funds (${fx((ASSETS.active.fee - ASSETS.market.fee) * 100)} points a year)`,
      `A t-statistic of ${fx(ngFullT)} proves that Northgate’s managers have no skill at all`,
      `Northgate trailed the index by its tracking error, ${pc(ngTe)}, every year`,
      `Beating the index in ${ngBeat} of 15 years shows the managers have skill that the averages hide`,
    ],
    answer: [0, 1],
    feedback: {
      2: 'Failing to reject zero alpha is not proof of zero skill: with this much noise, fifteen years can’t tell a small skill from none. The fee, though, is certain.',
      3: `Tracking error is a standard deviation of the gap, not the gap itself. The average shortfall was ${fx(-ngDiff * 100)} points a year.`,
      4: 'A fund whose returns scatter around the index’s will beat it in some years by chance; what matters is the average gap and whether it is distinguishable from zero.',
    },
    solution: `Tracking error (${pc(ngTe)}) measures how far a fund strays from its benchmark; the tracking difference (here ${fx(ngDiff * 100)} points a year) is how far it trails or leads on average, which exceeded the ${fx((ASSETS.active.fee - ASSETS.market.fee) * 100)}-point fee gap. Alpha’s t of ${fx(ngFullT)} can’t separate a small skill from none, so the evidence can’t justify paying the higher fee. Simulated data, built with a small negative alpha.`,
  },

  // ================================================================ Module 4: Valuing shares
  {
    id: 'f06-fn-18', lesson: 'discounted-cash-flow-valuation', type: 'formula', kind: 'numerical',
    prompt: 'Lissendale Glassworks (fictional, listed) has the five-year forecast of free cash flow to the firm in B2:B6 ($ millions). B8 holds its WACC and B9 the growth rate of its free cash flow for ever after year 5. In B11, write one formula for the share of its enterprise value that comes from the terminal value.',
    sheet: { cells: lgCells, vary: { B8: [0.075, 0.095] } },
    cell: 'B11', view: 'A1:B11', widths: { A: 28, B: 11 }, formats: { B: '#,##0.0', B8: '0.0%', B9: '0.0%', B11: '0.0%' },
    answer: '=(B6*(1+B9)/(B8-B9)/(1+B8)^5)/(NPV(B8,B2:B6)+B6*(1+B9)/(B8-B9)/(1+B8)^5)',
    alt: ['=1-NPV(B8,B2:B6)/(NPV(B8,B2:B6)+B6*(1+B9)/(B8-B9)/(1+B8)^5)'],
    require: [],
    wrong: [
      { formula: '=(B6*(1+B9)/(B8-B9))/(NPV(B8,B2:B6)+B6*(1+B9)/(B8-B9))', say: 'The terminal value is a value at the end of year 5: discount it five years, in the numerator and in the enterprise value.' },
      { formula: '=(B6/(B8-B9)/(1+B8)^5)/(NPV(B8,B2:B6)+B6/(B8-B9)/(1+B8)^5)', say: 'The Gordon formula starts with the first cash flow after year 5: B6 × (1 + B9), not B6.' },
      { formula: '=(B6*(1+B9)/(B8-B9)/(1+B8)^6)/(NPV(B8,B2:B6)+B6*(1+B9)/(B8-B9)/(1+B8)^6)', say: 'The terminal value is already a value at the end of year 5, so discount it five years, not six.' },
    ],
    solution: `Terminal value at the end of year 5 = B6 × (1 + B9) ÷ (B8 − B9); today ÷ (1 + B8)⁵. Excel’s NPV discounts its first value one year, which is right for years 1–5. At the shown ${pc(LG.wacc, 1)}: PV of years 1–5 = ${mil(lgD.sumPv, 1)}, PV of the terminal value = ${mil(lgD.pvTv, 1)}, so the terminal value is ${pc(lgD.tvShare, 1)} of the ${mil(lgD.value, 1)} enterprise value (${pc(lgShare(0.075), 1)} at 7.5%, ${pc(lgShare(0.095), 1)} at 9.5%). Most of a DCF value rests on what happens after the forecast years.`,
  },
  {
    id: 'f06-fn-19', lesson: 'discounted-cash-flow-valuation', type: 'steps', kind: 'applied',
    prompt: `Esterby Water (fictional, listed) is a regulated utility with a beta of ${fx(EW.beta)}. It finances itself with ${pc(EW.dv, 0)} debt (at market values), borrows at ${pc(EW.rd, 1)} before tax and pays tax at ${pc(EW.tax, 0)}. Its free cash flow to the firm next year is expected to be ${mil(EW.fcf1)}, growing ${pc(EW.g, 1)} a year for ever. It has ${mil(EW.debt)} of debt, ${mil(EW.cash)} of cash and ${EW.shares} million shares, which trade at $${fx(EW.price)}. Use a ${pc(rf, 1)} risk-free rate and a ${pc(mrp, 1)} market risk premium.`,
    steps: [
      {
        id: 'f06-fn-19-s1', type: 'num', kind: 'numerical',
        prompt: 'At what rate should Esterby’s free cash flow to the firm be discounted? Give a percentage to two decimal places.',
        answer: rnd(ewWacc * 100, 2), check: () => (0.6 * (0.042 + 0.7 * 0.055) + 0.4 * 0.052 * 0.75) * 100, unit: '%', places: 2, tol: 0.02,
        wrong: [
          { value: rnd(ewNoTax * 100, 2), say: 'Interest is tax-deductible, so the after-tax cost of debt is 5.2% × (1 − 0.25).' },
          { value: rnd(ewKe * 100, 2), say: 'That is the cost of equity alone. Free cash flow to the firm belongs to lenders too: weight the costs of equity and after-tax debt.' },
        ],
        solution: `Cost of equity = ${pc(rf, 1)} + ${fx(EW.beta)} × ${pc(mrp, 1)} = ${pc(ewKe)}. WACC = 0.60 × ${pc(ewKe)} + 0.40 × ${pc(EW.rd, 1)} × 0.75 = ${pc(ewWacc)}.`,
      },
      {
        id: 'f06-fn-19-s2', type: 'num', kind: 'numerical',
        prompt: 'What is Esterby’s enterprise value, in $ millions? Give one decimal place.',
        answer: rnd(ewEv, 1), check: () => 95 / ((0.6 * (0.042 + 0.7 * 0.055) + 0.4 * 0.052 * 0.75) - 0.025), unit: '$m', places: 1, tol: 1,
        wrong: [{ value: rnd(EW.fcf1 * (1 + EW.g) / (ewWacc - EW.g), 1), say: 'The $95 million is already next year’s cash flow: don’t grow it again before dividing by WACC − g.' }],
        solution: `EV = ${fx(EW.fcf1, 0)} ÷ (${pc(ewWacc)} − ${pc(EW.g, 1)}) = ${mil(ewEv, 1)}. With WACC and growth this close, the value is very sensitive to both.`,
      },
      {
        id: 'f06-fn-19-s3', type: 'num', kind: 'numerical',
        prompt: 'What is one Esterby share worth by this DCF? Give dollars and cents.',
        answer: rnd(ewPs, 2), check: () => (95 / ((0.6 * (0.042 + 0.7 * 0.055) + 0.4 * 0.052 * 0.75) - 0.025) - 1000 + 40) / 60, unit: '$', places: 2, tol: 0.05,
        wrong: [
          { value: rnd(ewEv / EW.shares, 2), say: 'Enterprise value belongs to lenders and shareholders together: subtract the debt and add the cash before dividing by the shares.' },
          { value: rnd((ewEv - EW.debt - EW.cash) / EW.shares, 2), say: 'Cash is added to the value of the business, not subtracted.' },
        ],
        solution: `Equity = ${fx(ewEv, 1)} − ${fx(EW.debt, 0)} + ${EW.cash} = ${mil(ewEv - EW.debt + EW.cash, 1)}; ÷ ${EW.shares} million = $${fx(ewPs)}, ${pc(ewPs / EW.price - 1, 0)} above the $${fx(EW.price)} price. Before calling it cheap, test the inputs: at a WACC one point higher the value per share would be $${fx(IV.evToEquity({ ev: EW.fcf1 / (ewWacc + 0.01 - EW.g), debt: EW.debt, cash: EW.cash, shares: EW.shares }).perShare)}.`,
      },
    ],
    solution: 'CAPM gives the cost of equity; weighted with the after-tax cost of debt it gives the WACC; FCFF at the WACC gives the enterprise value; the bridge (− debt + cash) gives the equity.',
  },
  {
    id: 'f06-fn-20', lesson: 'discounted-cash-flow-valuation', type: 'mc', kind: 'conceptual',
    prompt: `Two fictional listed companies: ${PV[0].name} trades at $${fx(PV[0].price)} with a beta of ${fx(PV[0].beta, 1)}; ${PV[1].name} at $${fx(PV[1].price)} with a beta of ${fx(PV[1].beta, 1)}. If either stopped investing for growth, it could pay out its expected earnings every year for ever: $${fx(PV[0].eps)} a share for ${PV[0].name.split(' ')[0]}, $${fx(PV[1].eps)} for ${PV[1].name.split(' ')[0]}. Use a ${pc(rf, 1)} risk-free rate and a ${pc(mrp, 1)} market risk premium. Which statement is best supported?`,
    options: [
      `${PV[1].name.split(' ')[0]} is the better buy: its P/E of ${fx(PV[1].pe, 1)} is about a third of ${PV[0].name.split(' ')[0]}’s ${fx(PV[0].pe, 1)}, so its earnings come cheaper`,
      `About ${pc(PV[0].share, 0)} of ${PV[0].name.split(' ')[0]}’s price is growth opportunities; ${PV[1].name.split(' ')[0]}’s is almost all current earnings`,
      `${PV[0].name.split(' ')[0]}’s higher cost of equity (${pc(PV[0].ke)}) means investors value its growth less than ${PV[1].name.split(' ')[0]}’s`,
      'Both prices can be justified only if each company’s earnings grow at its cost of equity for ever',
    ],
    answer: 1,
    feedback: {
      0: 'A low P/E isn’t a bargain by itself: Kelvarra’s price is almost exactly its no-growth value, so the market expects little value from its growth, and Cindral’s higher P/E reflects growth the market expects to add value.',
      2: 'Its higher cost of equity lowers the value of its current earnings, but the market still puts most of its price on growth.',
      3: 'Growth at the cost of equity adds nothing; prices above the no-growth value need growth that earns more than the cost of capital.',
    },
    solution: `Costs of equity: ${PV.map((c) => `${c.name.split(' ')[0]} ${pc(rf, 1)} + ${fx(c.beta, 1)} × ${pc(mrp, 1)} = ${pc(c.ke)}`).join('; ')}. No-growth values E ÷ r_E: ${PV.map((c) => `${money(c.eps / c.ke)}`).join(' and ')}. PVGO = price − E ÷ r_E: ${PV.map((c) => `${c.name.split(' ')[0]} ${money(c.pvgo)} (${pc(c.share, 1)} of the price)`).join(', ')}. Buying ${PV[0].name.split(' ')[0]} is a bet that its growth will earn well above its cost of capital; ${PV[1].name.split(' ')[0]}’s price assumes almost no such growth.`,
  },
  {
    id: 'f06-fn-21', lesson: 'relative-valuation', type: 'steps', kind: 'numerical',
    prompt: `Marlstone Paints (fictional, listed) earns a return on equity of ${pc(MS.roe, 0)} and pays out ${pc(MS.payout, 0)} of its earnings, a policy it expects to keep for ever; its beta is ${fx(MS.beta, 1)}. Use a ${pc(rf, 1)} risk-free rate and a ${pc(mrp, 1)} market risk premium. Its closest listed peer trades at ${fx(MS.peerPe, 1)} times next year’s earnings.`,
    steps: [
      {
        id: 'f06-fn-21-s1', type: 'num', kind: 'numerical',
        prompt: 'What P/E on next year’s earnings (the leading P/E) does the Gordon model justify for Marlstone? Give two decimal places.',
        answer: rnd(msPe, 2), check: () => 0.4 / ((0.042 + 1.1 * 0.055) - 0.6 * 0.12), unit: '×', places: 2, tol: 0.02,
        wrong: [
          { value: rnd(msPe * (1 + msG), 2), say: 'That is the trailing P/E, on this year’s earnings. The leading P/E divides by next year’s: payout ÷ (r_E − g).' },
          { value: rnd(1 / (msKe - msG), 2), say: 'Only 40% of earnings is paid out: the numerator is the payout ratio.' },
          { value: rnd(MS.payout / (msKe - MS.payout * MS.roe), 2), say: 'Growth comes from what is retained: g = (1 − payout) × ROE = 0.6 × 12%.' },
        ],
        solution: `Cost of equity = ${pc(rf, 1)} + ${fx(MS.beta, 1)} × ${pc(mrp, 1)} = ${pc(msKe)}. Growth g = retention × ROE = 0.60 × 12% = ${pc(msG, 1)}. Leading P/E = payout ÷ (r_E − g) = 0.40 ÷ (${fx(msKe, 4)} − ${fx(msG, 3)}) = ${fx(msPe)}.`,
      },
      {
        id: 'f06-fn-21-s2', type: 'num', kind: 'numerical',
        prompt: 'By what percentage would a price set at the peer’s multiple exceed the price the Gordon model justifies? Give a percentage to one decimal place.',
        answer: rnd(msGap * 100, 1), check: () => (15 / (0.4 / ((0.042 + 1.1 * 0.055) - 0.6 * 0.12)) - 1) * 100, unit: '%', places: 1, tol: 0.15,
        wrong: [{ value: rnd((1 - msPe / MS.peerPe) * 100, 1), say: 'That measures the gap as a share of the peer-based price. The question asks how far the peer-based price is above the Gordon price: 15 ÷ justified − 1.' }],
        solution: `${fx(MS.peerPe, 1)} ÷ ${fx(msPe)} − 1 = ${pc(msGap, 1)}. Either Marlstone is cheap against its peer, or the peer differs in growth, risk or payout (a higher ROE, a lower beta) in ways that justify its higher multiple. A multiple compares; the Gordon inputs explain.`,
      },
    ],
    solution: 'A justified P/E comes from the Gordon model: payout ÷ (r_E − g), with g = retention × ROE and r_E from the CAPM. A gap against a peer is a question to answer, not a verdict.',
  },
  {
    id: 'f06-fn-22', lesson: 'relative-valuation', type: 'mc', kind: 'conceptual',
    prompt: `Orvane Roasting (fictional) is a private coffee roaster with EBITDA of ${mil(OR.ebitda)}, net income of ${mil(OR.ni)}, debt of ${mil(OR.debt)} and cash of ${mil(OR.cash)}. A buyer values its equity using Morrow & Pike’s multiples (fictional; at the end of 2027, EV/EBITDA ${fx(MP.m.evEbitda)} and P/E ${fx(MP.m.pe)}). Which pair of equity values applies both multiples correctly?`,
    options: [
      `${mil(orEvNoBridge, 1)} from EV/EBITDA and ${mil(orPe, 1)} from the P/E`,
      `${mil(orEv, 1)} from EV/EBITDA and ${mil(orPeBridged, 1)} from the P/E`,
      `${mil(orEvNoBridge, 1)} from EV/EBITDA and ${mil(orPeBridged, 1)} from the P/E`,
      `${mil(orEv, 1)} from EV/EBITDA and ${mil(orPe, 1)} from the P/E`,
    ],
    answer: 3,
    feedback: {
      0: 'The EV/EBITDA result is an enterprise value: take off the debt and add the cash to reach equity. The P/E figure is right.',
      1: 'The EV/EBITDA figure is right, but a P/E already gives equity: net income is what is left for shareholders after interest, so bridging it again counts the debt twice.',
      2: 'Both are the wrong way round: the enterprise multiple needs the bridge, and the equity multiple must not have one.',
    },
    solution: `EV/EBITDA: EV = ${fx(MP.m.evEbitda)} × ${OR.ebitda} = ${mil(orEvNoBridge, 1)}; equity = ${fx(orEvNoBridge, 1)} − ${OR.debt} + ${OR.cash} = ${mil(orEv, 1)}. P/E: equity = ${fx(MP.m.pe)} × ${OR.ni} = ${mil(orPe, 1)}, no bridge. The two methods disagree by ${mil(orEv - orPe, 1)}, which is normal; one listed peer is a thin basis, and a private roaster may deserve a discount for its size and illiquidity.`,
  },
  {
    id: 'f06-fn-23', lesson: 'fundamental-analysis', type: 'num', kind: 'applied',
    prompt: `An analyst values Saffordby Brewing (fictional, listed): free cash flow to the firm of ${mil(SB.fcf1)} next year, growing ${pc(SB.g, 0)} a year for ever; ${mil(SB.debt)} of debt, ${mil(SB.cash)} of cash and ${SB.shares} million shares. Her base-case WACC is ${pc(SB.wacc, 0)}, but she isn’t sure of it and bases her decision on the value at ${pc(SB.high, 0)}. She also requires a ${pc(SB.margin, 0)} margin of safety. What is the highest price she should pay per share? Give dollars and cents.`,
    answer: rnd(sbMax, 2), check: () => ((30 / (0.09 - 0.03) - 100 + 20) / 20) * 0.8, unit: '$', places: 2, tol: 0.02,
    wrong: [
      { value: rnd(sbPs(SB.wacc) * (1 - SB.margin), 2), say: 'That takes the margin off the base-case value. She decided to work from the value at the 9% WACC.' },
      { value: rnd(sbPs(SB.high), 2), say: 'That is the conservative value itself. She also wants a 20% margin of safety below it.' },
      { value: rnd(sbPs(SB.high) / (1 + SB.margin), 2), say: 'A margin of safety is a share of the value: multiply by (1 − 0.20), don’t divide by 1.20.' },
    ],
    solution: `At 9%: EV = 30 ÷ (0.09 − 0.03) = ${mil(SB.fcf1 / (SB.high - SB.g))}; equity = ${fx(SB.fcf1 / (SB.high - SB.g), 0)} − ${SB.debt} + ${SB.cash} = ${mil(SB.fcf1 / (SB.high - SB.g) - SB.debt + SB.cash)}; per share $${fx(sbPs(SB.high))}. With a 20% margin: $${fx(sbPs(SB.high))} × 0.80 = $${fx(sbMax)}. The base case at 8% gives $${fx(sbPs(SB.wacc))}: a one-point change in the WACC moves the value by ${pc(1 - sbPs(SB.high) / sbPs(SB.wacc), 0)}, which is why she buys only well below even the cautious figure.`,
  },
  {
    id: 'f06-fn-24', lesson: 'fundamental-analysis', type: 'classify', kind: 'conceptual',
    prompt: 'Each finding is hypothetical. Would it be consistent with a semi-strong efficient market (prices reflect all public information), or evidence against one?',
    items: [
      'A share price jumps within minutes of a surprise profit announcement, and on average moves no further afterwards',
      'Shares keep drifting upwards for weeks after good profit surprises, so buying the day after the announcement beats the market after costs',
      'Most professionally managed funds trail their index after costs, and last period’s winners do no better than average next period',
      'A director earns abnormal returns by trading on private knowledge of an unannounced takeover',
      'Buying shares that look cheap on their published accounts beats the market for decades, after costs and after allowing for their risk',
    ],
    categories: ['Consistent with semi-strong efficiency', 'Evidence against semi-strong efficiency'],
    answer: [0, 1, 0, 0, 1],
    feedback: {
      0: 'A fast, complete reaction to public news is what semi-strong efficiency predicts.',
      1: 'A predictable drift after public news means the price did not reflect it at once: a profit from public information.',
      2: 'If public information can’t be turned into profits after costs, professionals as a group shouldn’t beat the market, and past winners shouldn’t persist.',
      3: 'Private information is outside the semi-strong form; profiting from it violates only the strong form.',
      4: 'Published accounts are public information. A lasting profit from them, after costs and risk, contradicts semi-strong efficiency, unless the “risk adjustment” itself is wrong (the joint-hypothesis problem).',
    },
    solution: 'Semi-strong efficiency rules out profits, after costs and risk, from public information. Quick, complete price reactions and the failure of most professionals are consistent with it; predictable drifts after news and lasting profits from published data are evidence against it. Insider profits bear only on the strong form. Any test needs a model of risk, so an apparent anomaly may be a missing risk instead.',
  },
];
