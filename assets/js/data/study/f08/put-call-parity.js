// put-call-parity.js — F08 · Put–call parity. Content only; exercises are in put-call-parity.ex.js. Figures from case.js:
// OPT (Brightcup at $42.00, options expiring 31 March 2029, the continuously compounded rate equal to 4.5% a year)
// and QUOTES (the case's fictional option prices).
import { OPT as O, QUOTES as Q } from './case.js?v=40';
import { parityGap } from '../../../core/derivatives.js?v=40';

const $2 = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const r4 = (x) => x.toFixed(4);
const disc = Math.exp(-O.r * O.T);                                   // = 1.045^−0.5
const pv = (K) => K * disc;
const S = O.S;
const dealerPut = 2.60, fairPut42 = Q[42].call - S + pv(42), arb = Q[42].call - dealerPut - S + pv(42);
const put44 = Q[44].call - S + pv(44);
const lhs40 = S + Q[40].put, rhs40 = Q[40].call + pv(40);
const box = (Q[40].call - Q[44].call) + (Q[44].put - Q[40].put), boxPV = 4 * disc;
const gaps = O.strikes.map((K) => parityGap({ C: Q[K].call, P: Q[K].put, S, K, r: O.r, T: O.T }));

export default {
  slug: 'put-call-parity',
  title: 'Put–call parity',
  blurb: 'A call and a put on the same share, with the same strike and expiry, are tied together: owning a call and a bond pays exactly the same as owning the share and a put. Use the relation to check Brightcup’s option quotes, build one option from the other, spot an arbitrage in a dealer’s price, and find the limits any option price must respect.',
  status: 'draft',
  objectives: [
    'Explain put–call parity by comparing two portfolios with the same payoff at expiry.',
    'Calculate a put’s price from the call’s (or the reverse) by put–call parity, and check quoted prices against it.',
    'Construct synthetic shares, calls, puts and forwards from the other instruments.',
    'Design the arbitrage trade that profits when quoted prices break parity.',
    'State the upper and lower bounds on option prices, and explain why an American call on a share that pays no dividend should not be exercised early.',
  ],
  prerequisites: [
    { lesson: 'f08/options-payoffs', why: 'Option payoffs at expiry, and the case’s Brightcup quotes.' },
    { lesson: 'f08/pricing-by-no-arbitrage', why: 'Pricing by replicating cash flows, and the trades that enforce it.' },
  ],
  case: 'lantern',
  concept: [
    { case: `Hollis Avery has been offered a deal by a dealer he trades with: $42 Brightcup puts expiring on ${O.expiry} for $${$2(dealerPut)} a share, well below the $${$2(Q[42].put)} on the exchange. The dealer says it has a surplus of puts to sell. Hollis wonders whether $${$2(dealerPut)} is a bargain, and asks Ana whether there is a way to tell what a put should cost without a pricing model. There is, as long as the call’s price is known.` },
    { h: 'Two portfolios with the same payoff' },
    { p: 'Compare two portfolios, each set up today and held until the options expire. The first holds a European call with strike <i>K</i> and enough cash in a risk-free deposit to grow to exactly <i>K</i> at expiry. The second holds one share and a European put with the same strike and expiry. At expiry, whatever the share price:' },
    { table: {
      caption: 'Payoffs at expiry of the two portfolios',
      head: ['', 'Share ends below K', 'Share ends above K'],
      rows: [
        ['Call', '0', 'S<sub>T</sub> − K'],
        ['Deposit grown to K', 'K', 'K'],
        ['<b>Call + deposit</b>', '<b>K</b>', '<b>S<sub>T</sub></b>'],
        ['Share', 'S<sub>T</sub>', 'S<sub>T</sub>'],
        ['Put', 'K − S<sub>T</sub>', '0'],
        ['<b>Share + put</b>', '<b>K</b>', '<b>S<sub>T</sub></b>'],
      ],
      align: ['l', 'r', 'r'],
    } },
    { p: 'Both portfolios pay the larger of the share price and the strike, in every outcome. Two portfolios with identical payoffs must cost the same today, or there is an arbitrage. That gives <g>put–call parity</g>, for European options on a share that pays no dividend before expiry:' },
    { math: String.raw`c + K e^{-rT} = p + S_0` },
    { p: `Here <i>c</i> and <i>p</i> are the call and put prices and <i>S</i><sub>0</sub> the share price. Option traders use continuously compounded rates. The case’s 4.5% a year compounded annually is ln 1.045 = ${(O.r * 100).toFixed(3)}% compounded continuously, so for six months <i>e</i><sup>−<i>rT</i></sup> = 1.045<sup>−0.5</sup> = ${disc.toFixed(6)}, and the present value of $42 is $${r4(pv(42))}. Brightcup pays its annual dividend in ${O.dividendMonth}, after these options expire, so the simple form applies.` },
    { h: 'Checking the quotes' },
    { p: `Parity says a $42 put should cost <i>c</i> − <i>S</i><sub>0</sub> + <i>K</i>e<sup>−<i>rT</i></sup> = ${$2(Q[42].call)} − 42.00 + ${r4(pv(42))} = $${r4(fairPut42)}. The exchange’s $${$2(Q[42].put)} agrees to within the rounding of quotes to the cent. The same holds at every strike in the case: the largest difference between c − p and S − Ke<sup>−rT</sup> is $${$2(Math.max(...gaps.map(Math.abs)))}. The dealer’s $${$2(dealerPut)}, on the other hand, is $${$2(fairPut42 - dealerPut)} below parity.` },
    { h: 'The arbitrage' },
    { p: 'When parity fails, the cheaper portfolio is bought and the dearer one sold. With the dealer’s put too cheap, share + put is cheaper than call + deposit, so Hollis (or anyone with access to the dealer) could:' },
    { table: {
      caption: 'Arbitrage against a $42 put offered at $2.60 ($ a share)',
      head: ['Trade', 'Today', 'At expiry, S_T < 42', 'At expiry, S_T > 42'],
      rows: [
        ['Buy the put from the dealer', `(${$2(dealerPut)})`, '42 − S<sub>T</sub>', '0'],
        ['Buy the share', `(${$2(S)})`, 'S<sub>T</sub>', 'S<sub>T</sub>'],
        ['Write the call on the exchange', $2(Q[42].call), '0', '−(S<sub>T</sub> − 42)'],
        ['Borrow the present value of $42', r4(pv(42)), '(42.00)', '(42.00)'],
      ],
      foot: [['<b>Net</b>', `<b>${r4(arb)}</b>`, '<b>0</b>', '<b>0</b>']],
      align: ['l', 'r', 'r', 'r'],
    } },
    { p: `The trade collects $${r4(arb)} a share today and owes nothing at expiry, whatever Brightcup does: $${(arb * 100).toFixed(2)} a contract. Buying a share and a put and writing a call is called a <g>conversion</g>; the opposite trade, used when the put is too dear, is a reversal. Exchanges’ market makers run these trades constantly, which is why quoted calls and puts obey parity so closely. A dealer offering puts this far below parity is either making a mistake or not telling the whole story, perhaps about its own ability to honour them.` },
  ],
  theory: [
    { h: 'Synthetic positions' },
    { p: 'Rearranging parity shows how to build any one of the four instruments from the other three. Each is called a synthetic version of the instrument:' },
    { list: [
      '<b>Synthetic put:</b> p = c − S<sub>0</sub> + Ke<sup>−rT</sup>: buy a call, sell the share short, deposit the present value of the strike.',
      '<b>Synthetic call:</b> c = p + S<sub>0</sub> − Ke<sup>−rT</sup>: buy the share and a put, borrowing the present value of the strike.',
      '<b>Synthetic share:</b> S<sub>0</sub> = c − p + Ke<sup>−rT</sup>: buy a call, write a put, deposit the present value of the strike.',
      '<b>Synthetic forward:</b> c − p = S<sub>0</sub> − Ke<sup>−rT</sup>: a long call and a short put with the same strike pay S<sub>T</sub> − K in every outcome, exactly like a long forward with delivery price K.',
    ] },
    { p: `The last line connects options with the forwards of module 1. A long call and a short put at the strike equal to the forward price cost nothing, just like a forward. With Brightcup’s six-month forward price at 42.00 × 1.045<sup>0.5</sup> = $${$2(S / disc)}, a call and a put struck at that price would have the same premium.` },
    { p: `Synthetics are also a check on what a strategy really is. Hollis’s protective put of lesson 5, a share plus the $40 put, costs ${$2(S)} + ${$2(Q[40].put)} = $${$2(lhs40)} a share. Parity says it is the same as the $40 call plus a deposit of the present value of $40: ${$2(Q[40].call)} + ${r4(pv(40))} = $${$2(rhs40)}. Hollis could get the same protection by selling his shares, putting $${r4(pv(40))} a share on deposit and buying the call. Which he prefers depends on taxes and trading costs, not on the payoff, which is identical.` },
    { h: 'Why the at-the-money call costs more than the put' },
    { p: `With Brightcup at $42 and a strike of $42, it might seem that the call and the put should cost the same: the share is as likely to end a little above $42 as a little below. Parity says otherwise. The call is worth more by S<sub>0</sub> − Ke<sup>−rT</sup> = $${r4(S - pv(42))}, because the call’s holder pays the strike only at expiry and earns interest on it until then, while the put’s holder receives the strike only at expiry. The difference is the interest on $42 for six months. Equal prices come at the forward price, not the spot price.` },
    { h: 'A riskless loan built from options: the box spread' },
    { p: `Combine a synthetic forward bought at one strike with one sold at another. Buying the $40 call and writing the $40 put is a long forward at $40; writing the $44 call and buying the $44 put is a short forward at $44. Together they pay $44 − $40 = $4 at expiry whatever Brightcup does: a <g>box spread</g>. With the case’s quotes it costs (${$2(Q[40].call)} − ${$2(Q[44].call)}) + (${$2(Q[44].put)} − ${$2(Q[40].put)}) = $${$2(box)}, against the present value of $4, which is $${r4(boxPV)}. The box is a zero-coupon bond made of options, and its price reveals the interest rate the options market is using. Traders use boxes to borrow and lend, and to check that a set of quotes is consistent across strikes.` },
    { h: 'What parity cannot tell you' },
    { p: 'Parity links a call to a put, but it does not say what either should cost. If calls were quoted at twice their fair value and puts adjusted to match, parity would still hold. Pricing the option itself needs a view of how the share price can move, and that is what the next two lessons supply: a binomial tree of possible prices, and the Black–Scholes–Merton formula that comes from making the tree’s steps very small.' },
    { h: 'Bounds on option prices' },
    { p: 'Arbitrage also sets limits that any option price must respect, whatever model is used. A call can never be worth more than the share, since it pays at most the share. A put can never be worth more than the present value of the strike. And because the call is worth at least what the call-plus-deposit portfolio must be worth, a European call on a share with no dividends is worth at least the share price less the present value of the strike:' },
    { math: String.raw`\max\!\big(S_0 - K e^{-rT},\ 0\big) \le c \le S_0 \qquad \max\!\big(K e^{-rT} - S_0,\ 0\big) \le p \le K e^{-rT}` },
    { p: `For the $42 Brightcup call the lower bound is 42.00 − ${r4(pv(42))} = $${r4(S - pv(42))}, well below its $${$2(Q[42].call)}. For the $38 put the lower bound is zero, since the present value of $38 is below $42. An option quoted outside these bounds offers an arbitrage as clear as the dealer’s put.` },
    { h: 'Early exercise' },
    { p: 'The lower bound for a call has a striking consequence. An American call can be exercised at any time for S − K. But it can always be sold for at least S − Ke<sup>−rT</sup>, which is more than S − K whenever interest rates are positive. Exercising early throws away both the time value and the interest on the strike. So an <b>American call on a share that pays no dividend before expiry should never be exercised early</b>, and is worth the same as a European call.' },
    { p: 'Puts are different. Exercising a deep in-the-money put early brings in the strike now, and the interest on it can be worth more than the small time value left. An American put is therefore sometimes exercised early and is worth more than the European put. Dividends change the call’s case too: just before a large dividend it can pay to exercise a call to collect the dividend. The binomial trees of the next lesson value these choices exactly.' },
    { h: 'Parity with dividends' },
    { p: 'If the share pays a dividend before expiry, the share-plus-put portfolio receives it and the call-plus-deposit portfolio does not, so the present value of the dividend, D, comes off the share price:' },
    { math: String.raw`c + K e^{-rT} = p + S_0 - D` },
  ],
  formulas: [
    { id: 'pc-parity', name: 'Put–call parity (European, no dividends)',
      tex: String.raw`c + K e^{-rT} = p + S_0`,
      where: [[String.raw`c,\ p`, 'European call and put prices, same strike and expiry', '$'], [String.raw`S_0`, 'Share price today', '$'], [String.raw`K`, 'Strike', '$'], [String.raw`r`, 'Continuously compounded risk-free rate', ''], [String.raw`T`, 'Time to expiry', 'years']],
      assumptions: 'No dividends before expiry; with a dividend of present value D, subtract D from S₀.' },
    { id: 'pc-bounds', name: 'Bounds on European option prices',
      tex: String.raw`\max(S_0 - Ke^{-rT},0) \le c \le S_0,\quad \max(Ke^{-rT} - S_0,0) \le p \le Ke^{-rT}`,
      where: [[String.raw`c,\ p`, 'European call and put prices', '$'], [String.raw`S_0`, 'Share price today', '$'], [String.raw`K`, 'Strike', '$'], [String.raw`r`, 'Continuously compounded rate', ''], [String.raw`T`, 'Time to expiry', 'years']] },
    { id: 'pc-forward', name: 'Synthetic forward',
      tex: String.raw`c - p = S_0 - K e^{-rT}`,
      where: [[String.raw`c - p`, 'Long call and short put, same strike K', '$'], [String.raw`K`, 'The common strike', '$'], [String.raw`S_0`, 'Share price today', '$'], [String.raw`Ke^{-rT}`, 'Present value of the strike', '$']],
      note: 'At K equal to the forward price, c = p.' },
  ],
  examples: [
    { level: 'simple', title: 'A put from a call', fictional: true,
      setup: `The $44 Brightcup call costs $${$2(Q[44].call)}. Brightcup is at $42.00, the continuous rate is ${(O.r * 100).toFixed(3)}% and the options expire in six months. What should the $44 put cost?`,
      steps: [
        `Present value of the strike: 44 × e<sup>−${O.r.toFixed(5)} × 0.5</sup> = 44 × ${disc.toFixed(6)} = ${r4(pv(44))}.`,
        `Parity: p = c − S<sub>0</sub> + Ke<sup>−rT</sup> = ${$2(Q[44].call)} − 42.00 + ${r4(pv(44))}.`,
        `p = ${r4(put44)}.`,
      ],
      answer: `$${$2(put44)}, against the quoted $${$2(Q[44].put)}: the difference is rounding.`,
      interpretation: 'Given the call, the put needs no model at all: only the share price and the interest rate.' },
    { level: 'challenging', title: 'The dealer’s cheap put', fictional: true,
      setup: `A dealer sells $42 Brightcup puts at $${$2(dealerPut)}. The $42 call trades at $${$2(Q[42].call)}, the share at $42.00. Set up the arbitrage for one contract (100 shares) and find the profit.`,
      steps: [
        `Fair put by parity: ${$2(Q[42].call)} − 42.00 + ${r4(pv(42))} = ${r4(fairPut42)}. The dealer’s put is too cheap.`,
        `Buy the cheap side (share + put), sell the dear side (call + deposit): buy 100 shares (−4,200.00) and 100 puts (−${$2(100 * dealerPut)}), write 100 calls (+${$2(100 * Q[42].call)}), borrow ${$2(100 * pv(42))}.`,
        `Today: −4,200.00 − ${$2(100 * dealerPut)} + ${$2(100 * Q[42].call)} + ${$2(100 * pv(42))} = ${$2(100 * arb)}.`,
        'At expiry the share is sold for $42 through the put or the call, whichever is exercised, and repays the $4,200 owed.',
      ],
      answer: `$${$2(100 * arb)} a contract today, with nothing owed later.`,
      interpretation: 'The profit is certain only if the dealer honours its puts. A price this far from parity is a warning about the counterparty as much as an opportunity.' },
    { level: 'applied', title: 'Two ways to protect Hollis’s shares', fictional: true,
      setup: `Hollis can keep his shares and buy the $40 put at $${$2(Q[40].put)}, or sell his shares and buy the $40 call at $${$2(Q[40].call)}, depositing the present value of $40. Compare the cost and the payoff of the two.`,
      steps: [
        `Share + put: ${$2(S)} + ${$2(Q[40].put)} = ${$2(lhs40)} a share.`,
        `Call + deposit: ${$2(Q[40].call)} + 40 × ${disc.toFixed(6)} = ${$2(Q[40].call)} + ${r4(pv(40))} = ${$2(rhs40)} a share.`,
        'At expiry both are worth max(S<sub>T</sub>, 40): at least $40 a share, and the share’s value above that.',
      ],
      answer: `Both cost $${$2(lhs40)} a share and pay the same in every outcome.`,
      interpretation: 'Parity says the choice is about practicalities: selling his shares might trigger tax on his gains, so the put is likely the better route for Hollis.' },
  ],
  demo: [{ widget: 'pc-check', intro: 'Enter a call and a put price for any strike and see whether they obey parity, and if not, the trade that profits and how much it makes a contract.' }],
  mistakes: [
    { title: 'Using the strike instead of its present value', html: 'The deposit in the call-plus-deposit portfolio must grow to K at expiry, so today it is Ke<sup>−rT</sup>, not K.' },
    { title: 'Applying parity to options with different strikes or expiries', html: 'Parity links a call and a put with the same strike, the same expiry and the same underlying. Different strikes or dates give no such identity.' },
    { title: 'Applying it to American options as an equality', html: 'Early exercise breaks the exact equality for American options; for them parity gives only a range.' },
    { title: 'Forgetting dividends', html: 'A dividend before expiry goes to the shareholder, not the option holder. Subtract its present value from the share price.' },
    { title: 'Exercising an American call early to lock in a gain', html: 'On a share with no dividend, selling the call always beats exercising it, because the call is worth at least S − Ke<sup>−rT</sup>, more than S − K.' },
  ],
  application: [
    { p: 'Market makers on options exchanges quote calls and puts at many strikes and expiries, and parity keeps their quotes consistent: if a put’s price drifts, the trades in this lesson pull it back within seconds. Traders also run parity backwards. Given the share price and a call and a put, it reveals the interest rate the market is using, or the dividend it expects; a parity-implied dividend that differs from the company’s announced one can signal that traders expect a cut. Where short selling is restricted, as for some shares in a crisis, parity can break down for a while, because the reversal trade needs a short sale.' },
    { p: 'The idea of comparing portfolios with identical payoffs, rather than predicting prices, is the foundation of all derivative pricing. The next lesson takes it one step further: instead of building an option from another option, it builds one from the share and a loan alone.' },
    { case: `Ana tells Hollis that the dealer’s puts are $${$2(fairPut42 - dealerPut)} too cheap by parity, which is suspicious rather than lucky. He buys the exchange’s $40 puts instead, where the clearing house stands behind the contract. He still wants to know where the $${$2(Q[42].call)} call price itself comes from.` },
  ],
  summary: [
    'A call plus a deposit of Ke<sup>−rT</sup> pays the same as a share plus a put at every price: max(S<sub>T</sub>, K).',
    'Put–call parity: c + Ke<sup>−rT</sup> = p + S<sub>0</sub> for European options on a share with no dividend; subtract the PV of dividends from S<sub>0</sub> otherwise.',
    'When parity fails, buy the cheap portfolio and sell the dear one: a conversion if the put is cheap, a reversal if it is dear.',
    'Any instrument can be built synthetically from the other three; a long call and short put at the same strike is a forward.',
    'Bounds: max(S<sub>0</sub> − Ke<sup>−rT</sup>, 0) ≤ c ≤ S<sub>0</sub> and max(Ke<sup>−rT</sup> − S<sub>0</sub>, 0) ≤ p ≤ Ke<sup>−rT</sup>.',
    'An American call on a share with no dividend should never be exercised early; an American put sometimes should.',
  ],
  glossary: [
    { term: 'Put–call parity', def: 'The no-arbitrage relation between European call and put prices with the same strike and expiry: c + Ke<sup>−rT</sup> = p + S<sub>0</sub> (less the present value of any dividends).' },
    { term: 'Synthetic position', def: 'A combination of other instruments that has the same payoff as a given instrument, such as a long call and a short put that together act as a forward.' },
    { term: 'Conversion', def: 'An arbitrage that buys a share and a put and writes a call with the same strike and expiry, locking in the strike at expiry; used when puts are cheap relative to calls.' },
    { term: 'Box spread', def: 'A long synthetic forward at one strike combined with a short synthetic forward at another, which pays the difference between the strikes at expiry whatever the price: a riskless bond built from options.' },
    { term: 'Continuously compounded rate', def: 'An interest rate applied continuously, so that $1 grows to e<sup>rT</sup> in T years; the rate equivalent to an annual rate R is ln(1 + R).' },
  ],
  references: [
    { text: 'Stoll, H. R. (1969). The relationship between put and call option prices. <i>The Journal of Finance</i>, 24(5), 801–824.', url: 'https://doi.org/10.1111/j.1540-6261.1969.tb01694.x' },
    { text: 'Hull, J. C. (2022). <i>Options, Futures, and Other Derivatives</i> (11th ed.), chapter 11. Pearson.' },
  ],
  checks: [
    { what: 'Continuous rate', value: O.r * 100, shown: 4.402, tol: 0.0005 },
    { what: 'Discount', value: disc, shown: 0.978232, tol: 5e-7 },
    { what: 'PV 42', value: pv(42), shown: 41.0857, tol: 0.00005 },
    { what: 'Fair put 42', value: fairPut42, shown: 3.0757, tol: 0.00005 },
    { what: 'Max gap', value: Math.max(...gaps.map(Math.abs)), shown: 0.01, tol: 0.005 },
    { what: 'Put too cheap', value: fairPut42 - dealerPut, shown: 0.48, tol: 0.005 },
    { what: 'Arbitrage', value: arb, shown: 0.4757, tol: 0.00005 },
    { what: 'Arbitrage contract', value: arb * 100, shown: 47.57, tol: 0.005 },
    { what: 'PV 44', value: pv(44), shown: 43.0422, tol: 0.00005 },
    { what: 'Put 44', value: put44, shown: 4.1322, tol: 0.00005 },
    { what: 'Put 44 rounded', value: put44, shown: 4.13, tol: 0.005 },
    { what: 'Forward price', value: S / disc, shown: 42.93, tol: 0.005 },
    { what: 'Share + put', value: lhs40, shown: 44.18, tol: 0.005 },
    { what: 'PV 40', value: pv(40), shown: 39.1293, tol: 0.00005 },
    { what: 'Call + deposit', value: rhs40, shown: 44.18, tol: 0.005 },
    { what: 'Lower bound', value: S - pv(42), shown: 0.9143, tol: 0.00005 },
    { what: 'Dealer puts', value: 100 * dealerPut, shown: 260 },
    { what: 'Calls written', value: 100 * Q[42].call, shown: 399 },
    { what: 'Borrow', value: 100 * pv(42), shown: 4108.57, tol: 0.005 },
    { what: 'Box cost', value: box, shown: 3.92, tol: 0.005 },
    { what: 'Box PV', value: boxPV, shown: 3.9129, tol: 0.00005 },
  ],
};
