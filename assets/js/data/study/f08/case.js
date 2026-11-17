// case.js — the F08 Derivatives and Risk Management story: Lantern Coffee Co. in September 2028, six months after the
// financing F05 and F07 planned, facing risks it can hedge: the price of its coffee and the euro cost of two espresso
// machines. Brightcup Coffee, F06's fictional listed chain, supplies the interest-rate swap. Every price, rate and
// contract below is invented for teaching: no real exchange contract, quote or bank offer is described.
//
// Agrees with earlier courses (checked in IDENTITIES):
// - f05: Lantern buys about 2,400 kg of roasted coffee a year from Kilnworth Roasting at $36.00 a kg; the specialty green
//   beans F05's roaster plan priced cost $9.80 a kg; the 25% tax rate.
// - f06: Brightcup Coffee has $630 million of debt.
// - f07: Lantern's base-case 2029 EBITDA, interest and scheduled principal.
import { ROASTER, TAX, HOLLIS } from '../f05/case.js?v=39';
import { COMPANIES, SERIES, MONTHS, DERIVED as F06D } from '../f06/case.js?v=39';
import { MODEL as F07M } from '../f07/case.js?v=39';
import * as DV from '../../../core/derivatives.js?v=39';
import { blackScholes } from '../../../core/fin.js?v=39';
import * as RISK from '../../../core/risk.js?v=39';

export const TODAY = 'September 2028';
export const TAX_RATE = TAX;

// ================================================================ coffee: Kilnworth's prices and a (fictional) futures contract
export const COFFEE = {
  kgRoasted: ROASTER.kg,                    // 2,400 kg of roasted coffee a year
  spotPerKg: ROASTER.kilnworthPerKg,        // Kilnworth's list price, $36.00 a kg
  forwardPerKg: 37.50,                      // Kilnworth's offer: a fixed price for every delivery in 2029
  expected2029: 37.00,                      // Ana's best guess of Kilnworth's 2029 list price
  specialtyGreen: ROASTER.greenPerKg,       // $9.80 a kg for the specialty green beans F05 priced
  // a fictional exchange-traded futures contract on standard-grade green coffee (not a real contract's terms)
  futures: { name: 'Green Coffee futures (fictional)', size: 5_000, unit: 'kg of standard-grade green coffee', price: 6.40, initial: 2_500, maintenance: 1_800 },
  // settlement prices ($ a kg) on the day a long position is opened and the six trading days after (fictional)
  settlements: [6.40, 6.32, 6.25, 6.35, 6.18, 6.26, 6.38],
  storagePV: 0.08,                          // warehouse and insurance for six months, a kg, present value
  // quarterly changes: Kilnworth's roasted price and the futures price (fictional estimates from three years of data)
  sdRoasted: 0.06, sdFutures: 0.09, rho: 0.85,
};

// ================================================================ the euro: two espresso machines from an Italian maker (fictional)
export const EURO = { maker: 'Officine Varese (fictional)', amount: 38_000, due: '31 March 2029', T: 0.5, spot: 1.0800, rUsd: 0.045, rEur: 0.025, bankSpread: 0.0015 };

// ================================================================ the swap: Brightcup's floating-rate bank loan
export const SWAP = {
  company: COMPANIES.brightcup.name, debt: COMPANIES.brightcup.debt * 1e6,
  notional: 200e6, years: 5, spread: 0.015,              // $200 million of its debt pays a floating rate + 1.5%
  zeros: [0.040, 0.042, 0.043, 0.044, 0.045],            // annual zero rates, years 1–5 (fictional curve)
  zerosLater: [0.048, 0.049, 0.050, 0.051],              // a year later, after rates rise (years 1–4 remaining)
};

// ================================================================ derived figures
const kgCost = COFFEE.kgRoasted * COFFEE.spotPerKg;
const F07_2029 = F07M.rows[1];
/** Lantern's 2029 EBITDA if Kilnworth's price is `price` a kg and a share `hedged` of the coffee is bought at the fixed price. */
export function ebitda2029(price, hedged = 0) {
  const cost = COFFEE.kgRoasted * (hedged * COFFEE.forwardPerKg + (1 - hedged) * price);
  return F07_2029.ebitda - (cost - kgCost);
}
export const DEBT_SERVICE_2029 = F07_2029.interest + F07_2029.debtPrincipal;
export const DERIVED = {
  coffeeCost: kgCost,
  coffeeAtForward: COFFEE.kgRoasted * COFFEE.forwardPerKg,
  coffeeUp20: kgCost * 0.20,
  ebitda2029: F07_2029.ebitda,
  ebitda2029Up20: F07_2029.ebitda - kgCost * 0.20,
  euroAtSpot: EURO.amount * EURO.spot,
  euroForward: DV.fxForward({ spot: EURO.spot, rDomestic: EURO.rUsd, rForeign: EURO.rEur, T: EURO.T }),
  coffeeForward: DV.forwardPrice({ S: COFFEE.futures.price, r: EURO.rUsd, T: 0.5, storage: COFFEE.storagePV }),
  margin: DV.marginAccount({ prices: COFFEE.settlements, contracts: 1, size: COFFEE.futures.size, initial: COFFEE.futures.initial, maintenance: COFFEE.futures.maintenance }),
  df: DV.discountFactors(SWAP.zeros),
  hedge: DV.hedgeRatio({ rho: COFFEE.rho, sdSpot: COFFEE.sdRoasted, sdFutures: COFFEE.sdFutures }),
};
DERIVED.euroAtForward = EURO.amount * DERIVED.euroForward;
DERIVED.euroBank = Math.round((DERIVED.euroForward + EURO.bankSpread) * 1e4) / 1e4;   // Coastline's quote, to 4 decimals
DERIVED.euroBankCost = EURO.amount * DERIVED.euroBank;
DERIVED.greenEquivalent = COFFEE.kgRoasted / (1 - ROASTER.weightLoss);             // green coffee behind 2,400 kg roasted
DERIVED.swapRate = DV.swapRate(DERIVED.df);
DERIVED.dfLater = DV.discountFactors(SWAP.zerosLater);
DERIVED.swapValueLater = DV.swapValue({ notional: SWAP.notional, fixed: DERIVED.swapRate, df: DERIVED.dfLater });

// ================================================================ options (module 2): Brightcup share options and Kilnworth's cap
// Option lessons use continuously compounded rates, as option traders do: 4.5% a year compounded annually is
// ln 1.045 = 4.402% continuously compounded, so e^(−rT) = 1.045^(−T) and the two conventions agree.
export const OPT = {
  r: Math.log(1 + EURO.rUsd),
  S: COMPANIES.brightcup.price,            // $42.00 (F06)
  sigma: 0.30,                             // Brightcup's volatility, a year (fictional estimate)
  T: 0.5, expiry: '31 March 2029',
  dividendMonth: 'June',                   // Brightcup pays its annual dividend in June (fictional), after these options expire
  contract: 100,                           // shares per exchange-traded option contract
  holder: HOLLIS.name, holding: 1_000,     // Hollis Avery owns 1,000 Brightcup shares (fictional)
  strikes: [38, 40, 42, 44, 46],
};
/** Black–Scholes values for the case's Brightcup options. */
export const bs = (K, type = 'call', over = {}) => blackScholes({ S: OPT.S, K, T: OPT.T, r: OPT.r, sigma: OPT.sigma, type, ...over });
/** Market quotes: the Black–Scholes values at 30% volatility, rounded to the cent (fictional). */
export const QUOTES = Object.fromEntries(OPT.strikes.map((K) => [K, { call: Math.round(bs(K, 'call').price * 100) / 100, put: Math.round(bs(K, 'put').price * 100) / 100 }]));
/** Kilnworth's alternative to a fixed price: list price for 2029, but never more than $40.00 a kg, for $1.20 a kg. */
export const CAP = { strike: 40, fee: 1.20 };
export const capPerKg = (price) => Math.min(price, CAP.strike) + CAP.fee;

// ================================================================ module 3: hedging, margin and Value at Risk
/** Brightcup's coffee: next quarter's purchases of roasted coffee, hedged with the fictional green-coffee futures. */
export const BRIGHTCUP_COFFEE = { quarterValue: 6_000_000 };
DERIVED.contractValue = COFFEE.futures.size * COFFEE.futures.price;                 // $32,000
DERIVED.brightcupContracts = DV.contractsNeeded({ h: DERIVED.hedge.h, exposure: BRIGHTCUP_COFFEE.quarterValue, size: DERIVED.contractValue });
/** A grower's hedge and its basis: spot and futures when the hedge is set and when it is lifted (fictional). */
export const BASIS = { spot0: 6.30, fut0: 6.40, spot1: 5.90, fut1: 6.05 };
/** Hollis Avery's listed investments in September 2028 (fictional), and a fictional index futures contract. */
export const BOOK = { brightcup: OPT.S * OPT.holding, market: 308_000, bonds: 150_000 };
export const BOOK_VALUE = BOOK.brightcup + BOOK.market + BOOK.bonds;
export const INDEX_FUTURES = { name: 'Harbourline index futures (fictional)', level: 5_000, multiplier: 50 };
export const BOOK_BETAS = { brightcup: F06D.betas60.brightcup.beta, market: 1, bonds: F06D.betas60.bonds.beta };   // F06's 2023–2027 regression betas (simulated data)
export const BOOK_BETA = (BOOK.brightcup * BOOK_BETAS.brightcup + BOOK.market * BOOK_BETAS.market + BOOK.bonds * BOOK_BETAS.bonds) / BOOK_VALUE;
/** Monthly returns of Hollis's book with fixed weights, from F06's SIMULATED series (January 2013 – December 2027). */
export const BOOK_RETURNS = SERIES.market.map((_, i) => (BOOK.brightcup * SERIES.brightcup[i] + BOOK.market * SERIES.market[i] + BOOK.bonds * SERIES.bonds[i]) / BOOK_VALUE);
export const BOOK_MONTHS = MONTHS;
export const VAR = {
  hist95: RISK.historical(BOOK_RETURNS, 0.95), hist99: RISK.historical(BOOK_RETURNS, 0.99),
  norm95: RISK.parametric(BOOK_RETURNS, 0.95), norm99: RISK.parametric(BOOK_RETURNS, 0.99),
  backtest: RISK.backtest(BOOK_RETURNS, 0.95, { method: 'historical', window: 60 }),
};
VAR.kupiec = RISK.kupiec(VAR.backtest.exceptions, VAR.backtest.n, 0.05);
/** US margin rules used in the case: Regulation T's 50% initial margin; FINRA's minimum maintenance (25% long, 30% short). */
export const MARGIN_RULES = { initial: 0.50, maintenance: 0.25, shortMaintenance: 0.30, loanRate: 0.08 };

export const IDENTITIES = [
  ['F05: 2,400 kg of roasted coffee a year from Kilnworth at $36.00 a kg', COFFEE.kgRoasted === 2_400 && COFFEE.spotPerKg === 36],
  ['F05: specialty green beans cost $9.80 a kg, more than the standard grade on the (fictional) exchange', COFFEE.specialtyGreen === 9.8 && COFFEE.futures.price < COFFEE.specialtyGreen],
  ['F07: 2029 interest $4,525 and scheduled principal $20,027 (DSCR 3.45)', Math.abs(DEBT_SERVICE_2029 - 24_552) < 1 && Math.abs(F07_2029.ebitda / DEBT_SERVICE_2029 - 3.45) < 0.005],
  ['the fixed price fully hedged gives the same EBITDA at any price', Math.abs(ebitda2029(30, 1) - ebitda2029(50, 1)) < 1e-9],
  ['F06: Brightcup has $630 million of debt, more than the $200 million swapped', SWAP.debt === 630e6 && SWAP.notional < SWAP.debt],
  ['F07: 2029 base-case EBITDA is the model’s', Math.abs(DERIVED.ebitda2029 - F07_2029.ebitda) < 1e-9],
  ['the tax rate is 25%', TAX_RATE === 0.25],
  ['F06: Brightcup’s share price is $42.00; F05: Hollis Avery is Lantern’s investor', OPT.S === 42 && OPT.holder === 'Hollis Avery'],
  ['F05/F06: Brightcup’s beta is 1.05; Hollis’s book is $500,000 with his 1,000 Brightcup shares in it', Math.abs(F06D.betas60.brightcup.beta - 1.05) < 1e-5 && BOOK_VALUE === 500_000],
  ['F06: the book’s returns come from 180 simulated months, January 2013 – December 2027', BOOK_RETURNS.length === 180 && MONTHS[0] === '2013-01' && MONTHS[179] === '2027-12'],
  ['the continuous option rate matches the 4.5% annual rate', Math.abs(Math.exp(-OPT.r * OPT.T) - 1.045 ** -OPT.T) < 1e-15],
  ['the quotes satisfy put–call parity to within rounding', OPT.strikes.every((K) => Math.abs(DV.parityGap({ C: QUOTES[K].call, P: QUOTES[K].put, S: OPT.S, K, r: OPT.r, T: OPT.T })) <= 0.01 + 1e-12)],
];
