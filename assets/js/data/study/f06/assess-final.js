// assess-final.js — F06 final assessment: 24 questions across all four modules and all eight of the course’s outcomes,
// two or three per lesson (four for module 1, four for module 2, nine for module 3 and seven for module 4). 70% passes.
// Outcomes (main one per item): 1 shares, markets, market capitalisation and EV fn-1, fn-2; 2 bond prices, yields,
// duration, convexity and credit fn-3, fn-4; 3 returns and risk fn-5, fn-6, fn-7, fn-8 (and fn-11’s scenario steps);
// 4 diversification fn-9, fn-10; 5 efficient portfolios, the CAL and choosing a mix fn-11, fn-12, fn-13; 6 beta, the
// CAPM and alpha fn-14, fn-15; 7 funds, fees and tracking fn-16, fn-17; 8 valuation by DCF and multiples, judged by
// fundamental analysis fn-18 to fn-24.
// Mixed conceptual, numerical and applied items. Five are spreadsheet formula items, two of them steps inside steps items:
// a bond’s yield to maturity from its price with RATE (fn-3, the price in B3 varied); the bond fund’s real compound
// return from its simulated calendar-year returns at the inflation rate in E1 (fn-5, E1 varied); the expected return of
// the best complete portfolio for the risk aversion in B4 (fn-13, B4 varied); Northgate’s alpha a year from 60 simulated
// months of excess returns (fn-14); the terminal value’s share of a DCF value at the WACC in B8 (fn-18, B8 varied). Typed
// results fail on the marking copies.
// Items that combine lessons: the largest takeover premium a cap on EV/EBITDA allows (fn-1: shares-and-markets,
// relative-valuation); a bond’s YTM from its price, then a spread widening estimated by duration and convexity and
// repriced exactly (fn-3: bond-prices-and-yields, all of it); a credit spread over interpolated government yields, then
// a downgrade’s price effect by duration (fn-4: bond-prices-and-yields); geometric return then real return (fn-5:
// measuring-returns, with F04’s Fisher relation); arithmetic against geometric projection in today’s dollars (fn-6:
// measuring-returns); the spread of a 10-year average under a normal model (fn-7: measuring-risk, measuring-returns);
// drawdowns, worst years and the normal curve across the funds (fn-8: measuring-risk, measuring-returns); a monthly
// covariance annualised, then the minimum-variance weight and its volatility (fn-9: diversification, measuring-risk); a
// risky portfolio’s expected return and SD from scenarios, the optimal share in it and in a rival, and the choice by
// Sharpe ratio (fn-11: efficient-portfolios, measuring-returns, measuring-risk); the SE of the international fund’s mean
// excess return (fn-12: efficient-portfolios, measuring-returns); the CAL and the optimal share in one formula (fn-13:
// efficient-portfolios); beta and alpha by regression, alpha before fees and its t-statistic (fn-14: capm-and-beta,
// funds-and-indexing); a portfolio beta and its CAPM return (fn-15: capm-and-beta, diversification); the share of a
// growing balance taken by fees, then the outperformance needed to break even (fn-16: funds-and-indexing,
// measuring-returns); tracking error, tracking difference and alpha for a fictional active fund (fn-17:
// funds-and-indexing, capm-and-beta); the terminal value’s share of a DCF (fn-18: discounted-cash-flow-valuation); CAPM
// → WACC → Gordon EV → the bridge (fn-19: discounted-cash-flow-valuation, capm-and-beta, shares-and-markets); PVGO from
// CAPM costs of equity (fn-20: discounted-cash-flow-valuation, capm-and-beta, relative-valuation); a justified P/E from
// Gordon inputs against a peer (fn-21: relative-valuation, discounted-cash-flow-valuation, capm-and-beta); an EV/EBIT and
// a price-to-book multiple applied to a private distributor (fn-22: relative-valuation, shares-and-markets); a margin of
// safety off the conservative end of a DCF (fn-23: fundamental-analysis, discounted-cash-flow-valuation). Single-lesson
// items: fn-2, fn-10, fn-24.
// Data: the SIMULATED monthly series and fund facts in case.js (fn-5 to fn-9, fn-12, fn-14), the betas of Morrow & Pike
// and Harbour Street and the government bonds in case.js (fn-4, fn-15), and fictional businesses, funds and bonds built
// here (labelled). Nothing uses Brightcup or the project’s data or question. No hints; solutions are shown on review.
// Every figure is computed below from its inputs with core/investments.js and case.js; claims about the data’s shape
// throw if the data stop supporting them.
import { MONTHS, SERIES, ASSETS, BONDS, MARKET, DERIVED as D, LAST60 } from './case.js?v=31';
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
const S = D.stats;

// ---------------------------------------------------------------- module 1
// fn-1: Vossmere Logistics (fictional): the largest premium a buyer capped at an EV/EBITDA multiple can offer
const VL = { shares: 50, price: 30, debt: 400, cash: 50, ebitda: 220, cap: 10 };
const vlCap0 = VL.shares * VL.price, vlEv0 = IV.enterpriseValue({ marketCap: vlCap0, debt: VL.debt, cash: VL.cash });
const vlEvMax = VL.cap * VL.ebitda;
const vlPriceMax = IV.evToEquity({ ev: vlEvMax, debt: VL.debt, cash: VL.cash, shares: VL.shares }).perShare;
const vlPrem = vlPriceMax / VL.price - 1;
const vlWrong = { onEv: vlEvMax / vlEv0 - 1, asEquity: vlEvMax / VL.shares / VL.price - 1, noCash: (vlEvMax - VL.debt) / VL.shares / VL.price - 1 };
claim(vlPrem > 0 && vlEv0 / VL.ebitda < VL.cap, 'the cap is above today’s multiple');
// fn-2: a value-weighted index of three fictional companies; C issues shares at the month-end
const IX = { caps: [600, 300, 100], rets: [0.04, -0.02, 0.10], issue: 50 };
const ixW = IX.caps.map((c) => c / sum(IX.caps));
const ixRet = sum(ixW.map((w, i) => w * IX.rets[i]));
const ixCapChange = (sum(IX.caps.map((c, i) => c * (1 + IX.rets[i]))) + IX.issue) / sum(IX.caps) - 1;
// fn-3: Brackenmoor Mills’ bond (fictional): 8 years, 6.25% semi-annual, priced to yield about 5.40%; the spread widens 75 bp
const BMS = { face: 100, couponRate: 0.0625, years: 8, freq: 2 };
const BM = { ...BMS, price: rnd(IV.bondAtYield(BMS, 0.054).price, 2), bp: 75 };
const bmY = IV.bondYield(BMS, BM.price);
const bmD = IV.duration({ ...BMS, ytm: bmY });
const bmDy = BM.bp / 10000;
const bmNew = IV.bondAtYield(BMS, bmY + bmDy).price;
const bmEst = IV.priceChangeApprox(bmD, bmDy), bmEstD = IV.priceChangeApprox({ modified: bmD.modified }, bmDy);
const bmExact = bmNew / BM.price - 1;
const bmPerHalf = IV.bondAtYield(BMS, bmY + 2 * bmDy).price;
claim(bmD.price > 100 && bmEstD < bmExact && Math.abs(bmEst - bmExact) < Math.abs(bmEstD - bmExact), 'the bond is at a premium, and convexity brings the estimate closer to the exact fall');
// fn-4: Brindlecote Haulage’s bond (fictional, BBB): spread over interpolated government yields, then a downgrade
const BH = { face: 100, couponRate: 0.056, years: 12, freq: 2, ytm: 0.0586 };
const G5 = BONDS.find((b) => b.years === 5), G20 = BONDS.find((b) => b.years === 20);
const bhD = IV.duration(BH);
const govAt = (t) => G5.ytm + (t - G5.years) / (G20.years - G5.years) * (G20.ytm - G5.ytm);
const bhGov = govAt(BH.years), bhSpread = BH.ytm - bhGov;
const DG = { spread: 0.025 };
const bhDy = DG.spread - bhSpread;
const bhNewEst = bhD.price * (1 - bhD.modified * bhDy);
claim(bhSpread > 0.01 && bhDy > 0.005, 'the bond trades at a spread well below 250 basis points');

// ---------------------------------------------------------------- module 2
// fn-5: the bond fund’s calendar-year returns, rounded to four decimals for the sheet
const BY = IV.yearly(MONTHS, SERIES.bonds).map((y) => ({ year: y.year, ret: rnd(y.ret, 4) }));
const byGeo = Math.exp(mean(BY.map((y) => Math.log(1 + y.ret)))) - 1;
const INF = 0.028;
const byReal = (1 + byGeo) / (1 + INF) - 1;
const byL = BY.length + 1;
const byCells = { A1: 'Year', B1: 'Bond fund', D1: 'Inflation', E1: INF, D3: 'Real return' };
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
const miMin = IV.twoAssetMinVarWeight({ sa: S.market.sd, sb: S.intl.sd, corr: miCorr });
const miMinSd = IV.twoAsset({ w: miMin, ra: 0, rb: 0, sa: S.market.sd, sb: S.intl.sd, corr: miCorr }).sd;
claim(miMin > 0.5 && miMin < 0.9, 'the least risky mix holds mostly the total-market fund');
// fn-10: an equally weighted portfolio of 25 shares
const EQ = { sd: 0.30, corr: 0.2, n: 25 };
const eqSd = IV.equalWeightSd(EQ.n, EQ.sd ** 2, EQ.corr * EQ.sd ** 2);
const eqRemoved = 1 - eqSd ** 2 / EQ.sd ** 2, eqMax = 1 - EQ.corr;
// fn-11: two candidate risky portfolios and a client with A = 6
const PSC = [{ p: 0.3, r: 0.35 }, { p: 0.5, r: 0.10 }, { p: 0.2, r: -0.20 }];
const pSc = IV.scenarios(PSC);
const PQ = { rf: 0.03, A: 6, P: { er: pSc.er, sd: pSc.sd }, Q: { er: 0.08, sd: 0.10 } };
const pScEq = Math.sqrt(mean(PSC.map((s) => (s.r - mean(PSC.map((x) => x.r))) ** 2)));
const yP = IV.optimalRiskyShare({ rf: PQ.rf, ...PQ.P, A: PQ.A }), yQ = IV.optimalRiskyShare({ rf: PQ.rf, ...PQ.Q, A: PQ.A });
const shP = IV.sharpe(PQ.P.er, PQ.rf, PQ.P.sd), shQ = IV.sharpe(PQ.Q.er, PQ.rf, PQ.Q.sd);
const uOf = (y, p) => { const c = IV.cal({ y, rf: PQ.rf, er: p.er, sd: p.sd }); return c.er - 0.5 * PQ.A * c.sd ** 2; };
const uP = uOf(yP, PQ.P), uQ = uOf(yQ, PQ.Q);
claim(shQ > shP && uQ > uP && yQ < 1 && PQ.P.er > PQ.Q.er && Math.abs(mean(PSC.map((s) => s.r)) - pSc.er) > 0.01, 'Q has the higher Sharpe ratio and gives the higher utility without borrowing');
// fn-12: the standard error of the international fund’s mean excess return
const EXM = SERIES.intl.map((v, i) => v - SERIES.bills[i]);
const exMean = IV.annualise.mean(mean(EXM));
const exSdM = Math.sqrt(sum(EXM.map((v) => (v - mean(EXM)) ** 2)) / (EXM.length - 1));
const exSe = (exSdM / Math.sqrt(EXM.length)) * 12;
const exLo = exMean - 1.96 * exSe, exHi = exMean + 1.96 * exSe;
claim(exLo < 0 && exHi > 0 && exMean > 0.05, 'the 95% interval for the international fund’s mean excess return contains zero');
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
// fn-17: Fenwardine Equity Fund (fictional, active) against an index fund tracking its benchmark; figures given in the item
const FW = { years: 10, sdDiffM: 0.006, diff: -0.0115, fee: 0.0100, idxFee: 0.0010, t: -0.9, beat: 4 };
const fwTe = IV.annualise.sd(FW.sdDiffM), fwGap = FW.fee - FW.idxFee;
claim(-FW.diff > fwGap && -FW.diff < fwTe / 1.5, 'the shortfall exceeds the fee gap and is well below the tracking error');

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
claim(Math.abs(EW.debt / ewEv - EW.dv) < 0.03 && ewPs > EW.price, 'Esterby’s debt is close to its 40% target share of its DCF value, and the value exceeds the price');
// fn-20: two fictional companies’ PVGO
const PV = [{ name: 'Harnwick Software', price: 60, eps: 1.80, beta: 1.4 }, { name: 'Kelvarra Outdoor', price: 30, eps: 2.70, beta: 0.9 }]
  .map((c) => { const ke = IV.capm({ rf, beta: c.beta, mrp }); const g = IV.pvgo(c.price, c.eps, ke); return { ...c, ke, pvgo: g, share: g / c.price, pe: c.price / c.eps }; });
claim(PV[0].share > 0.7 && PV[1].share < 0.05, 'most of Harnwick’s price is growth; almost none of Kelvarra’s is');
// fn-21: Marlstone Paints (fictional): a justified leading P/E against a peer
const MS = { roe: 0.12, payout: 0.40, beta: 1.1, peerPe: 15 };
const msKe = IV.capm({ rf, beta: MS.beta, mrp }), msG = IV.earningsGrowth(1 - MS.payout, MS.roe);
const msPe = MS.payout / (msKe - msG);
const msGap = MS.peerPe / msPe - 1;
// fn-22: Kestrigan Supply (fictional, private distributor) valued with fictional listed peers’ EV/EBIT and P/B
const KS = { ebit: 20, book: 90, debt: 60, cash: 10, evEbit: 9.0, pb: 1.6 };
const ksEv = KS.evEbit * KS.ebit, ksFromEv = ksEv - KS.debt + KS.cash, ksFromPb = KS.pb * KS.book, ksPbBridged = ksFromPb - KS.debt + KS.cash;
// fn-23: Saffordby Brewing (fictional): a margin of safety off the conservative DCF
const SB = { fcf1: 30, g: 0.03, wacc: 0.08, high: 0.09, debt: 100, cash: 20, shares: 20, margin: 0.20 };
const sbPs = (w) => IV.evToEquity({ ev: SB.fcf1 / (w - SB.g), debt: SB.debt, cash: SB.cash, shares: SB.shares }).perShare;
const sbMax = sbPs(SB.high) * (1 - SB.margin);

export const items = [
  // ================================================================ Module 1: Securities and markets
  {
    id: 'f06-fn-1', lesson: 'shares-and-markets', type: 'num', kind: 'applied',
    prompt: `Vossmere Logistics (fictional, listed) has ${VL.shares} million shares at $${fx(VL.price)}, ${mil(VL.debt)} of debt, ${mil(VL.cash)} of cash and EBITDA of ${mil(VL.ebitda)}. A fictional rival wants to buy every share; it would take on the debt and keep the cash, and its board will pay at most ${fx(VL.cap, 1)} times EBITDA for the business as a whole. What is the largest premium over today’s share price it can offer? Give a percentage to one decimal place.`,
    answer: rnd(vlPrem * 100, 1), check: () => ((10 * 220 - 400 + 50) / 50 / 30 - 1) * 100, unit: '%', places: 1, tol: 0.1,
    wrong: [
      { value: rnd(vlWrong.onEv * 100, 1), say: 'That is how far the enterprise value can rise. The debt doesn’t rise with the offer, so all the extra value goes to the shares, a smaller base: find the most the equity can be worth.' },
      { value: rnd(vlWrong.asEquity * 100, 1), say: `That treats ${fx(VL.cap, 1)} × EBITDA as the price of the shares alone. An EBITDA multiple prices the whole business: take off the debt and add back the cash before dividing by the shares.` },
      { value: rnd(vlWrong.noCash * 100, 1), say: 'That takes off the debt but forgets the cash, which the buyer keeps: add it back.' },
    ],
    solution: `Today: market capitalisation ${mil(vlCap0)}, enterprise value ${fx(vlCap0, 0)} + ${VL.debt} − ${VL.cash} = ${mil(vlEv0)}, or ${fx(vlEv0 / VL.ebitda)} times EBITDA. At the cap the business is worth ${fx(VL.cap, 1)} × ${VL.ebitda} = ${mil(vlEvMax)}; equity = ${fx(vlEvMax, 0)} − ${VL.debt} + ${VL.cash} = ${mil(vlEvMax - VL.debt + VL.cash)}, or $${fx(vlPriceMax)} a share. Premium = ${fx(vlPriceMax)} ÷ ${fx(VL.price)} − 1 = ${pc(vlPrem, 1)}. The enterprise value can rise only ${pc(vlWrong.onEv, 1)}, but the debt is taken on at face value, so the shareholders get all of the rise.`,
  },
  {
    id: 'f06-fn-2', lesson: 'shares-and-markets', type: 'num', kind: 'conceptual',
    prompt: `A value-weighted index holds three fictional companies, A, B and C, with market capitalisations of ${IX.caps.map((c) => mil(c)).join(', ')} at the start of a month. Over the month their share prices change by ${IX.rets.map((r) => sg(r, 0)).join(', ')} (no dividends). On the last day of the month C sells new shares worth ${mil(IX.issue)}, which the index includes from then on. What was the index’s return for the month? Give a percentage to one decimal place.`,
    answer: rnd(ixRet * 100, 1), check: () => (0.6 * 4 + 0.3 * -2 + 0.1 * 10), unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: rnd(ixCapChange * 100, 1), say: 'That is the change in the index’s total market value, which includes the new shares C sold. New money paid in is not a return to anyone holding the index.' },
      { value: rnd(mean(IX.rets) * 100, 1), say: 'That is the simple average of the three returns. A value-weighted index weights each return by the company’s share of the start-of-month value.' },
    ],
    solution: `Start weights: ${ixW.map((w) => pc(w, 0)).join(', ')}. Index return = ${ixW.map((w, i) => `${fx(w, 1)} × ${sg(IX.rets[i], 0)}`).join(' + ')} = ${sg(ixRet, 1)}. The index’s total value rose ${pc(ixCapChange, 1)}, but ${mil(IX.issue)} of that is new shares bought for cash: the index counts only price changes, not new money paid in for shares.`,
  },
  {
    id: 'f06-fn-3', lesson: 'bond-prices-and-yields', type: 'steps', kind: 'applied',
    prompt: `Brackenmoor Mills (fictional, listed) has a bond with ${BM.years} years left and a ${pc(BM.couponRate)} coupon paid twice a year; it trades at $${fx(BM.price)} per $100 of face value. Analysts expect a downgrade to widen its credit spread by ${BM.bp} basis points, with government yields unchanged.`,
    steps: [
      {
        id: 'f06-fn-3-s1', type: 'formula', kind: 'numerical',
        prompt: 'B1:B4 hold the bond’s coupon rate, years to maturity, price and face value. In B6, write one formula for its yield to maturity today, as an annual rate compounded twice a year.',
        sheet: { cells: { A1: 'Coupon rate (a year)', B1: BM.couponRate, A2: 'Years to maturity', B2: BM.years, A3: 'Price ($)', B3: BM.price, A4: 'Face value ($)', B4: 100, A6: 'Yield to maturity' }, fixed: ['B2', 'B4'], vary: { B3: [101.8, 108.9] } },
        cell: 'B6', view: 'A1:B6', widths: { A: 20, B: 11 }, formats: { B1: '0.00%', B3: '$#,##0.00', B4: '$#,##0.00', B6: '0.00%' },
        answer: '=RATE(B2*2,B1*B4/2,-B3,B4)*2',
        alt: ['=2*RATE(2*B2,B4*B1/2,-B3,B4)'],
        require: ['RATE'],
        wrong: [
          { formula: '=RATE(B2*2,B1*B4/2,-B3,B4)', say: 'That is the yield per half-year. Quote it as an annual rate: × 2.' },
          { formula: '=RATE(B2,B1*B4,-B3,B4)', say: 'That treats the coupons as paid once a year. They are paid twice a year: 2 × B2 periods of B1 × B4 ÷ 2, then double the rate.' },
          { formula: '=B1*B4/B3', say: 'That is the current yield, the coupon over the price. It ignores the premium the holder loses as the price falls to $100 at maturity.' },
        ],
        solution: `<x>=RATE(B2*2,B1*B4/2,-B3,B4)*2</x>: ${pc(bmY / 2, 3)} a half-year, ${pc(bmY)} a year. The price is above $100, so the yield is below the ${pc(BM.couponRate)} coupon; the current yield, ${pc(BM.couponRate * 100 / BM.price)}, lies between them.`,
      },
      {
        id: 'f06-fn-3-s2', type: 'num', kind: 'numerical',
        prompt: `At today’s yield the bond’s modified duration is ${fx(bmD.modified)} and its convexity ${fx(bmD.convexity, 1)}. Estimate the percentage change in its price for the ${BM.bp}-basis-point widening, using both duration and convexity. Give a signed percentage to two decimal places.`,
        answer: rnd(bmEst * 100, 2), check: () => (-bmD.modified * 0.0075 + 0.5 * bmD.convexity * 0.0075 ** 2) * 100, unit: '%', places: 2, tol: 0.02,
        wrong: [
          { value: rnd(bmEstD * 100, 2), say: 'That is duration alone. Add the convexity term, ½ × convexity × (0.0075)², which is positive whichever way yields move.' },
          { value: rnd(-bmD.macaulay * bmDy * 100, 2), say: 'That uses the Macaulay duration. The price sensitivity is the modified duration, Macaulay ÷ (1 + yield/2).' },
        ],
        solution: `ΔP/P ≈ −${fx(bmD.modified)} × 0.0075 + ½ × ${fx(bmD.convexity, 1)} × 0.0075² = ${pc(bmEstD)} + ${pc(0.5 * bmD.convexity * bmDy ** 2, 3)} = ${pc(bmEst)}.`,
      },
      {
        id: 'f06-fn-3-s3', type: 'num', kind: 'numerical',
        prompt: 'Now reprice the bond exactly at its widened yield. What is its new price per $100? Give dollars and cents.',
        answer: rnd(bmNew, 2), check: () => IV.bondAtYield(BMS, IV.bondYield(BMS, BM.price) + 0.0075).price, unit: '$', places: 2, tol: 0.02,
        wrong: [
          { value: rnd(BM.price * (1 + bmEstD), 2), say: 'That applies the duration-only estimate. Reprice exactly: discount every coupon and the face value at the new half-year yield.' },
          { value: rnd(bmPerHalf, 2), say: 'That adds 75 basis points to the half-year rate, which is 150 a year. Add them to the annual yield, then halve it.' },
        ],
        solution: `At ${pc(bmY + bmDy)} a year (${pc((bmY + bmDy) / 2, 3)} a half-year) the price is $${fx(bmNew)}, a change of ${pc(bmExact, 3)}. The duration-and-convexity estimate (${pc(bmEst, 3)}) is ${fx(Math.abs(bmEst - bmExact) * 100, 3)} points away; duration alone (${pc(bmEstD, 3)}) is ${fx(Math.abs(bmEstD - bmExact) * 100, 3)} points away.`,
      },
    ],
    solution: `Find the yield from the price (${pc(bmY)}), add the widening, and reprice for the exact answer ($${fx(BM.price)} → $${fx(bmNew)}); duration and convexity give a quick estimate. A credit-spread move changes the price exactly as a move in government yields of the same size would.`,
  },
  {
    id: 'f06-fn-4', lesson: 'bond-prices-and-yields', type: 'num', kind: 'applied',
    prompt: `Brindlecote Haulage (fictional, listed) has a BBB-rated bond with ${BH.years} years left and a ${pc(BH.couponRate)} coupon paid twice a year. It yields ${pc(BH.ytm)}, a price of $${fx(bhD.price)} per $100, and its modified duration is ${fx(bhD.modified)}. Government bonds yield ${pc(G5.ytm)} at ${G5.years} years and ${pc(G20.ytm)} at ${G20.years} years. An analyst thinks that if the bond were cut to BB it would trade at a spread of ${fx(DG.spread * 10000, 0)} basis points over a government yield of the same maturity (found by straight-line interpolation), with government yields unchanged. Using modified duration alone, what price per $100 would that imply? Give dollars and cents.`,
    answer: rnd(bhNewEst, 2), check: () => bhD.price * (1 - bhD.modified * (0.025 - (0.0586 - (0.042 + (12 - 5) / 15 * 0.0045)))), unit: '$', places: 2, tol: 0.03,
    wrong: [
      { value: rnd(bhD.price * (1 - bhD.modified * DG.spread), 2), say: 'That adds the whole 250 basis points to the yield. The bond already trades at a spread: only the widening, from today’s spread to 250, moves its yield.' },
      { value: rnd(bhD.price * (1 - bhD.modified * (DG.spread - (BH.ytm - G20.ytm))), 2), say: `That measures today’s spread against the ${G20.years}-year bond. This bond has ${BH.years} years left: interpolate the government yield at ${BH.years} years.` },
      { value: rnd(bhD.price * (1 - bhD.macaulay * bhDy), 2), say: 'That uses the Macaulay duration. Price sensitivity is the modified duration.' },
    ],
    solution: `Government yield at ${BH.years} years: ${pc(G5.ytm)} + (${BH.years - G5.years} ÷ ${G20.years - G5.years}) × (${pc(G20.ytm)} − ${pc(G5.ytm)}) = ${pc(bhGov)}. Today’s spread: ${pc(BH.ytm)} − ${pc(bhGov)} = ${fx(bhSpread * 10000, 0)} basis points. At ${fx(DG.spread * 10000, 0)} the yield rises by ${fx(bhDy * 10000, 0)} basis points, so ΔP/P ≈ −${fx(bhD.modified)} × ${fx(bhDy, 4)} = ${pc(-bhD.modified * bhDy)} and the price ≈ $${fx(bhD.price)} × ${fx(1 - bhD.modified * bhDy, 4)} = $${fx(bhNewEst)}. For a move this large convexity would make the true fall a little smaller. Falling below BBB also takes the bond out of investment grade, which can force some holders to sell.`,
  },

  // ================================================================ Module 2: Risk and return
  {
    id: 'f06-fn-5', lesson: 'measuring-returns', type: 'formula', kind: 'applied',
    prompt: `B2:B${byL} hold the Harbourline Aggregate Bond Index Fund’s calendar-year total returns for 2013–2027 (simulated for this course). E1 holds an inflation rate a year. In E3, write one formula for the fund’s real compound return a year over the fifteen years: the rate at which its purchasing power grew.`,
    sheet: { cells: byCells, vary: { E1: [0.022, 0.034] } },
    cell: 'E3', view: `A1:E${byL}`, widths: { A: 8, B: 11, C: 2, D: 12, E: 9 }, formats: { B: '0.00%', E1: '0.0%', E3: '0.00%' },
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
      `A normal distribution with the bond fund’s mean (${pc(S.bonds.mean)}) and volatility (${pc(S.bonds.sd)}) gives a loss in ${pc(bondLossP, 0)} of years; the history had ${bondLossYears} losing year in 15, which shows that the normal curve overstates bond risk`,
      `With a volatility of ${pc(S.market.sd)}, the total-market fund lost about ${fx(S.market.sd * 100, 0)}% in its worst calendar year`,
      `The bond fund’s volatility was about a quarter of the total-market fund’s, yet its worst calendar year was about half as bad (${pc(wy.bonds, 1)} against ${pc(wy.market, 1)})`,
    ],
    answer: [0, 1, 4],
    feedback: {
      2: `One losing year in 15 is consistent with a ${pc(bondLossP, 0)} chance a year (about ${fx(15 * bondLossP, 1)} expected): fifteen years are far too few to say the normal curve overstates the risk. Fat tails, if anything, make bad years worse than the normal suggests.`,
      3: `Volatility is a typical deviation from the mean, not the size of the worst year. The fund lost ${pc(-wy.market, 1)} in its worst year, well beyond one SD below its mean.`,
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
        prompt: 'What weight in the total-market fund gives the least risky mix of the two funds? Give a percentage to one decimal place.',
        answer: rnd(miMin * 100, 1), check: () => { const a = S.market.sd, b = S.intl.sd, c = miCovM * 12; return (b * b - c) / (a * a + b * b - 2 * c) * 100; }, unit: '%', places: 1, tol: 0.3,
        wrong: [
          { value: rnd(S.intl.sd ** 2 / (S.market.sd ** 2 + S.intl.sd ** 2) * 100, 1), say: 'That ignores the covariance: it is the minimum-variance weight only for uncorrelated assets.' },
          { value: rnd((1 - miMin) * 100, 1), say: 'That is the weight in the international fund. The formula’s numerator uses the other asset’s variance: σ_B² − cov for the weight in A.' },
        ],
        solution: `w_market = (σ_I² − cov) ÷ (σ_M² + σ_I² − 2cov) = (${fx(S.intl.sd ** 2, 5)} − ${fx(miCovM * 12, 5)}) ÷ (${fx(S.market.sd ** 2, 5)} + ${fx(S.intl.sd ** 2, 5)} − 2 × ${fx(miCovM * 12, 5)}) = ${pc(miMin, 1)}, with ${pc(1 - miMin, 1)} in the international fund.`,
      },
      {
        id: 'f06-fn-9-s3', type: 'num', kind: 'numerical',
        prompt: 'What is the volatility of that least risky mix? Give a percentage to two decimal places.',
        answer: rnd(miMinSd * 100, 2), check: () => { const a = S.market.sd, b = S.intl.sd, c = miCovM * 12, w = (b * b - c) / (a * a + b * b - 2 * c); return Math.sqrt(w * w * a * a + (1 - w) ** 2 * b * b + 2 * w * (1 - w) * c) * 100; }, unit: '%', places: 2, tol: 0.03,
        wrong: [
          { value: rnd((miMin * S.market.sd + (1 - miMin) * S.intl.sd) * 100, 2), say: 'That averages the volatilities at those weights, which holds only for a correlation of 1. Use the variances and the covariance.' },
          { value: rnd(Math.sqrt(miMin ** 2 * S.market.sd ** 2 + (1 - miMin) ** 2 * S.intl.sd ** 2) * 100, 2), say: 'That leaves out the covariance term, 2 × w × (1 − w) × the annual covariance; with a correlation this high it is large.' },
        ],
        solution: `σ² = ${fx(miMin, 4)}² × ${fx(S.market.sd, 4)}² + ${fx(1 - miMin, 4)}² × ${fx(S.intl.sd, 4)}² + 2 × ${fx(miMin, 4)} × ${fx(1 - miMin, 4)} × ${fx(miCovM * 12, 4)} = ${fx(miMinSd ** 2, 5)}, so σ = ${pc(miMinSd)}: only ${fx((S.market.sd - miMinSd) * 100)} points below the total-market fund alone. With a correlation of ${fx(miCorr)} two share funds diversify each other only a little; a bond fund does far more.`,
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
    prompt: `A fictional adviser offers two risky portfolios. For P she gives three scenarios for next year: a return of ${PSC.map((s) => `${pc(s.r, 0)} with probability ${fx(s.p, 1)}`).join(', ')}. Q has an expected return of ${pc(PQ.Q.er, 0)} and a volatility of ${pc(PQ.Q.sd, 0)}. Clients can lend and borrow at ${pc(PQ.rf, 0)}. A client with a risk-aversion coefficient of ${PQ.A} will combine one of the two with the risk-free asset.`,
    steps: [
      {
        id: 'f06-fn-11-s1', type: 'num', kind: 'numerical',
        prompt: 'What is P’s expected return? Give a percentage to one decimal place.',
        answer: rnd(PQ.P.er * 100, 1), check: () => (0.3 * 0.35 + 0.5 * 0.10 + 0.2 * -0.20) * 100, unit: '%', places: 1, tol: 0.05,
        wrong: [{ value: rnd(mean(PSC.map((s) => s.r)) * 100, 1), say: 'That averages the three outcomes equally. Weight each by its probability.' }],
        solution: `E(r) = ${PSC.map((s) => `${fx(s.p, 1)} × ${pc(s.r, 0)}`).join(' + ')} = ${pc(PQ.P.er, 1)}.`,
      },
      {
        id: 'f06-fn-11-s2', type: 'num', kind: 'numerical',
        prompt: 'Weighting each scenario by its probability, how volatile is P’s return next year: what is its standard deviation? Give a percentage to two decimal places.',
        answer: rnd(PQ.P.sd * 100, 2), check: () => { const e = 0.3 * 0.35 + 0.5 * 0.10 + 0.2 * -0.20; return Math.sqrt(0.3 * (0.35 - e) ** 2 + 0.5 * (0.10 - e) ** 2 + 0.2 * (-0.20 - e) ** 2) * 100; }, unit: '%', places: 2, tol: 0.03,
        wrong: [
          { value: rnd(pSc.variance * 100, 2), say: 'That is the variance (in decimal form, × 100). Take its square root for the standard deviation.' },
          { value: rnd(pScEq * 100, 2), say: 'That treats the three outcomes as equally likely. Weight each squared deviation from the expected return by its probability.' },
        ],
        solution: `σ² = ${PSC.map((s) => `${fx(s.p, 1)} × (${fx(s.r, 2)} − ${fx(PQ.P.er, 3)})²`).join(' + ')} = ${fx(pSc.variance, 6)}, so σ = ${pc(PQ.P.sd)}.`,
      },
      {
        id: 'f06-fn-11-s3', type: 'num', kind: 'numerical',
        prompt: 'If she uses P, what share of her money maximises her utility, E(r) − ½ × A × σ²? Give a percentage to one decimal place.',
        answer: rnd(yP * 100, 1), check: () => IV.optimalRiskyShare({ rf: 0.03, er: pSc.er, sd: pSc.sd, A: 6 }) * 100, unit: '%', places: 1, tol: 0.2,
        wrong: [{ value: rnd((PQ.P.er - PQ.rf) / (PQ.A * PQ.P.sd) * 100, 1), say: `Square the volatility: the denominator is A × σ² = ${PQ.A} × ${fx(PQ.P.sd, 4)}² = ${fx(PQ.A * PQ.P.sd ** 2, 4)}.` }],
        solution: `y* = (${fx(PQ.P.er, 3)} − ${fx(PQ.rf)}) ÷ (${PQ.A} × ${fx(PQ.P.sd, 4)}²) = ${fx(PQ.P.er - PQ.rf, 3)} ÷ ${fx(PQ.A * PQ.P.sd ** 2, 4)} = ${pc(yP, 1)} in P, the rest in the risk-free asset.`,
      },
      {
        id: 'f06-fn-11-s4', type: 'num', kind: 'numerical',
        prompt: 'If she uses Q instead, what share should go into Q? Give a percentage to one decimal place.',
        answer: rnd(yQ * 100, 1), check: () => (0.08 - 0.03) / (6 * 0.01) * 100, unit: '%', places: 1, tol: 0.15,
        wrong: [{ value: rnd((PQ.Q.er - PQ.rf) / (PQ.A * PQ.Q.sd) * 100, 1), say: `Square the volatility: ${PQ.A} × ${fx(PQ.Q.sd)}² = ${fx(PQ.A * PQ.Q.sd ** 2)}.` }],
        solution: `y* = (${fx(PQ.Q.er)} − ${fx(PQ.rf)}) ÷ (${PQ.A} × ${fx(PQ.Q.sd)}²) = ${fx(PQ.Q.er - PQ.rf)} ÷ ${fx(PQ.A * PQ.Q.sd ** 2)} = ${pc(yQ, 1)} in Q.`,
      },
      {
        id: 'f06-fn-11-s5', type: 'mc', kind: 'conceptual',
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
        solution: `Sharpe ratios: P (${fx(PQ.P.er, 3)} − ${fx(PQ.rf)}) ÷ ${fx(PQ.P.sd, 4)} = ${fx(shP, 3)}, Q (${fx(PQ.Q.er)} − ${fx(PQ.rf)}) ÷ ${fx(PQ.Q.sd)} = ${fx(shQ, 3)}. Her utility at the best mix is ${pc(uP)} with P and ${pc(uQ)} with Q. Separation: choose the risky portfolio with the highest Sharpe ratio first, then set the share in it by risk aversion. Q levered to P’s ${pc(PQ.P.sd)} volatility would offer ${pc(IV.cal({ y: PQ.P.sd / PQ.Q.sd, rf: PQ.rf, er: PQ.Q.er, sd: PQ.Q.sd }).er, 1)}, more than P’s ${pc(PQ.P.er, 1)}.`,
      },
    ],
    solution: 'Scenarios give a portfolio’s expected return and SD; pick the risky portfolio with the highest Sharpe ratio, then choose how much of it to hold: y* = (E − r_f) ÷ (Aσ²).',
  },
  {
    id: 'f06-fn-12', lesson: 'efficient-portfolios', type: 'num', kind: 'numerical',
    prompt: `Over the 180 simulated months of 2013–2027 the Harbourline International Index Fund’s mean excess return over bills was ${pc(exMean)} a year (the monthly mean × 12), and the standard deviation of its monthly excess returns was ${pc(exSdM, 3)}. What is the lower end of an approximate 95% confidence interval for its true mean excess return a year (mean ± 1.96 standard errors)? Give a percentage to two decimal places, with a minus sign if it is negative.`,
    answer: rnd(exLo * 100, 2), check: () => (exMean - 1.96 * exSdM / Math.sqrt(180) * 12) * 100, unit: '%', places: 2, tol: 0.03,
    wrong: [
      { value: rnd((exMean - 1.96 * exSdM * Math.sqrt(12)) * 100, 2), say: 'That uses the volatility of one year’s return. The uncertainty about a mean shrinks with the number of observations: the standard error is s ÷ √n.' },
      { value: rnd((exMean - 1.96 * exSdM / Math.sqrt(180)) * 100, 2), say: 'That is the standard error of the monthly mean, not annualised. The annual mean is the monthly mean × 12, so its standard error is × 12 too.' },
    ],
    solution: `SE of the monthly mean = ${pc(exSdM, 3)} ÷ √180 = ${pc(exSdM / Math.sqrt(180), 3)}; annualised × 12 = ${pc(exSe)} (equivalently ${pc(exSdM * Math.sqrt(12))} ÷ √15). Interval: ${pc(exMean)} ± 1.96 × ${pc(exSe)} = ${pc(exLo)} to ${pc(exHi)}. It contains zero: fifteen years of this fund’s own history can’t even show that its risk premium is positive, though the simulation built it to share in the market’s. An optimiser fed historical means treats a figure known only to within about ±${fx(1.96 * exSe * 100, 0)} points as exact, which is why it chases noise.`,
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
        prompt: 'Suppose the active fund’s managers add nothing before fees. By the end, its fees have cost her what percentage of the balance she would have had with no fees at all? Give one decimal place.',
        answer: rnd(fdA.share * 100, 1), check: () => { const g = IV.feeDrag({ amount: 10000, monthly: 250, years: 25, r: 0.065, fee: 0.0095 }); return (1 - g.net / g.gross) * 100; }, unit: '%', places: 1, tol: 0.1,
        wrong: [
          { value: rnd(FD.fa * FD.years * 100, 1), say: 'That adds up 25 years of the fee rate as if the whole balance had been there from the start. Much of the money is paid in later and is charged for fewer years, while fees taken early also lose their growth.' },
          { value: rnd(fdGap / fdI.net * 100, 1), say: 'That compares the active fund with the index fund, which charges a fee too. The question compares it with no fees at all.' },
        ],
        solution: `With no fees she would have ${money(fdA.gross, 0)}; after the ${pc(FD.fa)} fee, ${money(fdA.net, 0)}. The fees take ${money(fdA.cost, 0)}, ${pc(fdA.share, 1)} of the no-fee balance, on ${money(FD.amount + FD.monthly * 12 * FD.years, 0)} paid in. The index fund’s ${pc(FD.fi)} would take ${pc(fdI.share, 1)}.`,
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
    prompt: `The Fenwardine Equity Fund (fictional, actively managed, expense ratio ${pc(FW.fee)}) is compared with an index fund (fictional, expense ratio ${pc(FW.idxFee)}) that tracks its benchmark. Over ${FW.years} years of monthly data the difference between their monthly returns had a standard deviation of ${pc(FW.sdDiffM)}; on average Fenwardine returned ${fx(-FW.diff * 100)} points a year less; a regression of its excess returns on the benchmark’s gives an alpha with a t-statistic of ${fx(FW.t, 1)}; and it beat the index fund in ${FW.beat} of the ${FW.years} calendar years. Which statements are true? Select all that apply.`,
    options: [
      `Its tracking error is about ${pc(fwTe)} a year; it measures how much the gap with the index fund varied and says nothing about which way the gap ran`,
      `Its average shortfall was larger than the extra it charges over the index fund (${fx(fwGap * 100)} points a year)`,
      `A t-statistic of ${fx(FW.t, 1)} is strong evidence that its managers’ choices lost money before fees`,
      'Its average shortfall each year was about the size of its tracking error',
      `Beating the index fund in ${FW.beat} of ${FW.years} years suggests the managers have a skill that the averages hide`,
    ],
    answer: [0, 1],
    feedback: {
      2: `A t of ${fx(FW.t, 1)} is well inside ±1.96: ${FW.years} years can’t tell the managers’ choices from luck either way. The fee, though, is certain.`,
      3: `Tracking error is the standard deviation of the gap, ${pc(fwTe)} a year; the average shortfall was ${fx(-FW.diff * 100)} points a year.`,
      4: 'A fund whose returns scatter around the index’s will beat it in some years by chance; what matters is the average gap and whether it can be told apart from zero.',
    },
    solution: `Tracking error = ${pc(FW.sdDiffM)} × √12 = ${pc(fwTe)} a year: how far Fenwardine strays from its benchmark, in either direction. The tracking difference, ${fx(FW.diff * 100)} points a year, is how far it trailed on average, more than the ${fx(fwGap * 100)}-point fee gap, so other costs or poor picks cost about ${fx((-FW.diff - fwGap) * 100)} points more. An alpha t of ${fx(FW.t, 1)} can’t separate a small skill from none, so nothing in these figures justifies paying the higher fee.`,
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
    prompt: `Esterby Water (fictional, listed) is a regulated utility with a beta of ${fx(EW.beta)}. Its long-run target is ${pc(EW.dv, 0)} debt; it borrows at ${pc(EW.rd, 1)} before tax and pays tax at ${pc(EW.tax, 0)}. Its free cash flow to the firm next year is expected to be ${mil(EW.fcf1)}, growing ${pc(EW.g, 1)} a year for ever. It has ${mil(EW.debt)} of debt, ${mil(EW.cash)} of cash and ${EW.shares} million shares, which trade at $${fx(EW.price)}. Use a ${pc(rf, 1)} risk-free rate and a ${pc(mrp, 1)} market risk premium.`,
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
      0: 'A low P/E isn’t a bargain by itself: Kelvarra’s price is almost exactly its no-growth value, so the market expects little value from its growth, and Harnwick’s higher P/E reflects growth the market expects to add value.',
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
    prompt: `Kestrigan Supply (fictional) is a private distributor of building materials with EBIT of ${mil(KS.ebit)}, book equity of ${mil(KS.book)}, debt of ${mil(KS.debt)} and cash of ${mil(KS.cash)}. Its listed peers (fictional distributors) trade at a median of ${fx(KS.evEbit, 1)} times EBIT, measured on enterprise value, and ${fx(KS.pb, 1)} times book equity. Which pair of equity values applies both multiples correctly?`,
    options: [
      `${mil(ksEv, 1)} from EV/EBIT and ${mil(ksFromPb, 1)} from price-to-book`,
      `${mil(ksFromEv, 1)} from EV/EBIT and ${mil(ksPbBridged, 1)} from price-to-book`,
      `${mil(ksFromEv, 1)} from EV/EBIT and ${mil(ksFromPb, 1)} from price-to-book`,
      `${mil(ksEv, 1)} from EV/EBIT and ${mil(ksPbBridged, 1)} from price-to-book`,
    ],
    answer: 2,
    feedback: {
      0: 'The EV/EBIT result is an enterprise value: take off the debt and add the cash to reach equity. The price-to-book figure is right.',
      1: 'The EV/EBIT figure is right, but price-to-book already gives equity: book equity is the shareholders’ figure, after the debt, so bridging it again counts the debt twice.',
      3: 'Both are the wrong way round: the enterprise multiple needs the bridge, and the equity multiple must not have one.',
    },
    solution: `EV/EBIT: EV = ${fx(KS.evEbit, 1)} × ${KS.ebit} = ${mil(ksEv, 1)}; equity = ${fx(ksEv, 1)} − ${KS.debt} + ${KS.cash} = ${mil(ksFromEv, 1)}. Price-to-book: equity = ${fx(KS.pb, 1)} × ${KS.book} = ${mil(ksFromPb, 1)}, no bridge. The two disagree by ${mil(Math.abs(ksFromPb - ksFromEv), 1)}, which is normal: book value records what was put into the business, EBIT what it earns. A private company may also deserve a discount for its size and illiquidity.`,
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
