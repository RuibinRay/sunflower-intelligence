// options-payoffs.ex.js — F08 · Calls, puts, payoffs and profits: widgets, practice and the knowledge check.
// Figures from case.js (OPT, QUOTES, CAP, COFFEE); every num item's `check` recomputes its answer.
import { OPT as O, QUOTES as Q, CAP, capPerKg, COFFEE as K } from './case.js?v=40';
import { optionPayoff } from '../../../core/derivatives.js?v=40';

const usd = (x, d = 2) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const xs = Array.from({ length: 13 }, (_, i) => 30 + 2 * i);

export const widgets = {
  'op-builder': {
    type: 'formula', title: 'Payoff and profit of a Brightcup option at expiry',
    intro: 'Premiums are the case’s quotes for options expiring 31 March 2029 (Brightcup at $42.00 today).',
    inputs: [
      { id: 'call', label: 'Option (1 = call, 0 = put)', min: 0, max: 1, step: 1, value: 1, fmt: 'int' },
      { id: 'side', label: 'Position (1 = buy, −1 = write)', min: -1, max: 1, step: 2, value: 1, fmt: 'int' },
      { id: 'K', label: 'Strike', min: 38, max: 46, step: 2, value: 42, fmt: 'money' },
      { id: 'S', label: 'Brightcup on 31 March', min: 30, max: 54, step: 0.5, value: 50, fmt: 'money' },
    ],
    compute: (v) => {
      const type = v.call ? 'call' : 'put', prem = Q[v.K][type], sgn = v.side > 0 ? 1 : -1;
      const pay = (s) => sgn * optionPayoff(s, v.K, type), prof = (s) => pay(s) - sgn * prem;
      const be = type === 'call' ? v.K + prem : v.K - prem;
      return {
        headline: { label: `Profit a share, ${sgn > 0 ? 'long' : 'short'} ${type}`, value: usd(prof(v.S)) },
        rows: [['Premium a share', `${usd(prem)} (${sgn > 0 ? 'paid' : 'received'})`], ['Payoff a share at this price', usd(pay(v.S))], ['Break-even price', usd(be)], ['Profit on one contract (100 shares)', usd(100 * prof(v.S))]],
        note: sgn > 0 ? 'The buyer can lose at most the premium.' : type === 'call' ? 'The writer of a call keeps the premium at best and can lose without limit as the share rises.' : `The writer of a put keeps the premium at best and can lose up to ${usd(v.K - prem)} a share if Brightcup falls to zero.`,
        chart: { kind: 'line', x: { label: 'Brightcup on 31 March ($)', values: xs },
          series: [{ name: 'Payoff', values: xs.map((s) => Math.round(pay(s) * 100) / 100) }, { name: 'Profit', values: xs.map((s) => Math.round(prof(s) * 100) / 100) }],
          y: { label: '$ a share', format: 'money' } },
      };
    },
  },
  'op-cap': {
    type: 'formula', title: 'Lantern’s 2029 coffee: no hedge, fixed price or cap',
    intro: '2,400 kg. Fixed price $37.50 a kg; cap at $40.00 a kg for a fee of $1.20 a kg.',
    inputs: [{ id: 'p', label: 'Kilnworth’s 2029 list price ($ a kg)', min: 24, max: 60, step: 0.6, value: 43.2, fmt: 'num' }],
    compute: (v) => {
      const none = K.kgRoasted * v.p, fixed = K.kgRoasted * K.forwardPerKg, cap = K.kgRoasted * capPerKg(v.p);
      const best = Math.min(none, fixed, cap);
      const ps = Array.from({ length: 13 }, (_, i) => 24 + 3 * i);
      return {
        headline: { label: 'Bill with the cap', value: usd(cap, 0) },
        rows: [['Bill with no hedge', usd(none, 0)], ['Bill with the fixed price', usd(fixed, 0)], ['Cheapest at this price', best === cap ? 'Cap' : best === fixed ? 'Fixed price' : 'No hedge']],
        note: v.p > CAP.strike ? 'Above $40 the cap holds the cost at $41.20 a kg; the fixed price is cheaper still.' : v.p < K.forwardPerKg - CAP.fee ? 'Below $36.30 the cap beats the fixed price: Lantern keeps most of the fall.' : 'Between $36.30 and $40 the fixed price is cheaper than the cap.',
        chart: { kind: 'line', x: { label: 'List price ($ a kg)', values: ps },
          series: [{ name: 'No hedge', values: ps.map((p) => Math.round(K.kgRoasted * p)) }, { name: 'Fixed price', values: ps.map(() => fixed) }, { name: 'Cap at $40', values: ps.map((p) => Math.round(K.kgRoasted * capPerKg(p))) }],
          y: { label: 'Coffee bill ($)', format: 'money' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-op-g1', type: 'num', kind: 'numerical',
    prompt: 'A put with a strike of $60 costs $4.50. The share ends at $52. What is the profit a share for the buyer of the put ($)?',
    answer: 3.5, check: () => optionPayoff(52, 60, 'put') - 4.5, unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 8, say: 'That is the payoff. Profit subtracts the $4.50 premium.' }, { value: -12.5, say: 'A put gains when the price falls below the strike: its payoff is 60 − 52.' }],
    hints: ['Payoff = max(K − S<sub>T</sub>, 0).', '(60 − 52) − 4.50.'],
    solution: 'Payoff 60 − 52 = $8.00; profit 8.00 − 4.50 = $3.50 a share.',
  },
  {
    id: 'f08-op-g2', type: 'steps', kind: 'numerical',
    prompt: `Brightcup is at $${O.S.toFixed(2)}. The $40 call costs $${Q[40].call.toFixed(2)} and the $46 call $${Q[46].call.toFixed(2)}.`,
    steps: [
      { id: 'f08-op-g2a', type: 'num', kind: 'numerical', prompt: 'What is the intrinsic value of the $40 call ($)?', answer: 2, check: () => Math.max(O.S - 40, 0), unit: '$', places: 2, tol: 0.005, hints: ['max(S − K, 0) at today’s price.'] },
      { id: 'f08-op-g2b', type: 'num', kind: 'numerical', prompt: 'What is its time value ($)?', answer: 3.05, check: () => Q[40].call - 2, unit: '$', places: 2, tol: 0.005, hints: ['Price less intrinsic value.'] },
      { id: 'f08-op-g2c', type: 'num', kind: 'numerical', prompt: 'What is the time value of the $46 call ($)?', answer: 2.37, check: () => Q[46].call - Math.max(O.S - 46, 0), unit: '$', places: 2, tol: 0.005, hints: ['It is out of the money: its intrinsic value is zero.'] },
    ],
    solution: '$40 call: intrinsic 42 − 40 = $2.00, time value 5.05 − 2.00 = $3.05. $46 call: out of the money, so all $2.37 is time value.',
  },
  {
    id: 'f08-op-g3', type: 'num', kind: 'numerical',
    prompt: 'An investor buys a share at $30 and a $28 put on it for $1.40. What is the least the position can be worth at expiry, net of the premium ($ a share)?',
    answer: 26.6, check: () => 28 - 1.4, unit: '$', places: 2, tol: 0.005,
    hints: ['Below $28, the put lets the investor sell at $28.', 'Floor = strike − premium.'],
    solution: 'The put guarantees $28 for the share; less the $1.40 premium, the floor is $26.60 (a loss of at most $3.40 from $30).',
  },
  {
    id: 'f08-op-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Which position can lose an unlimited amount?',
    options: ['Writing a call without owning the share', 'Buying a put option on a share', 'Buying a call option on a share', 'Writing a put option on a share'],
    answer: 0,
    feedback: { 1: 'A buyer loses at most the premium.', 2: 'A buyer loses at most the premium.', 3: 'The put writer’s loss is limited: the share cannot fall below zero.' },
    hints: ['Which payoff has no upper limit on what one side may owe?'],
    solution: 'A naked call writer must deliver at the strike however high the price goes, so the loss has no limit.',
  },
];

export const independent = [
  {
    id: 'f08-op-i1', type: 'num', kind: 'numerical',
    prompt: 'A trader writes 5 contracts (100 shares each) of a $25 call for $1.20 a share. The share ends at $28. What is the trader’s profit ($)?',
    answer: -900, check: () => 500 * (1.2 - optionPayoff(28, 25, 'call')), unit: '$', places: 0, tol: 1,
    solution: 'Premium received 500 × 1.20 = 600; payoff owed 500 × 3 = 1,500; profit −$900.',
  },
  {
    id: 'f08-op-i2', type: 'num', kind: 'numerical',
    prompt: `What is the lower break-even price of the $44 Brightcup straddle (call $${Q[44].call.toFixed(2)}, put $${Q[44].put.toFixed(2)})?`,
    answer: 44 - Q[44].call - Q[44].put, check: () => 44 - (Q[44].call + Q[44].put), unit: '$', places: 2, tol: 0.005,
    solution: `Cost ${Q[44].call.toFixed(2)} + ${Q[44].put.toFixed(2)} = ${(Q[44].call + Q[44].put).toFixed(2)}; lower break-even 44 − ${(Q[44].call + Q[44].put).toFixed(2)} = $${(44 - Q[44].call - Q[44].put).toFixed(2)}.`,
  },
  {
    id: 'f08-op-i3', type: 'classify', kind: 'conceptual',
    prompt: 'With Brightcup at $42, is each option in, at or out of the money?',
    items: ['$38 call', '$46 call', '$42 put', '$44 put'],
    categories: ['In the money', 'At the money', 'Out of the money'],
    answer: [0, 2, 1, 0],
    solution: 'Calls are in the money with strikes below $42, puts with strikes above. The $42 put is at the money.',
  },
  {
    id: 'f08-op-i4', type: 'num', kind: 'numerical',
    prompt: 'A bull spread buys a $50 call at $4.10 and writes a $55 call at $1.90. What is the largest possible profit a share ($)?',
    answer: 2.8, check: () => (55 - 50) - (4.1 - 1.9), unit: '$', places: 2, tol: 0.005,
    solution: 'Cost 4.10 − 1.90 = 2.20; maximum payoff 55 − 50 = 5.00; maximum profit $2.80.',
  },
  {
    id: 'f08-op-i5', type: 'mc', kind: 'applied',
    prompt: 'An airline wants protection against a rise in fuel prices but wants to benefit if they fall. Which hedge fits?',
    options: ['Buy call options on fuel', 'Sell fuel forward for next year', 'Buy fuel put options', 'Write fuel call options'],
    answer: 0,
    feedback: { 1: 'Selling forward would add to its exposure, not offset it, and fixes the price both ways.', 2: 'Puts gain when prices fall; the airline is hurt by rises.', 3: 'Writing calls adds to its losses when fuel rises.' },
    solution: 'A call caps the price it pays and keeps the benefit of a fall, at the cost of the premium.',
  },
];

export const check = [
  {
    id: 'f08-op-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does the buyer of a put option have?',
    options: ['The right to sell at the strike price', 'The obligation to buy at the strike price if asked', 'The right to buy at the strike price', 'The obligation to sell at the strike price on expiry'],
    answer: 0,
    feedback: { 1: 'That is the put writer’s obligation.', 2: 'That is a call.', 3: 'The buyer has a right, not an obligation.' },
    solution: 'A put gives its holder the right, but not the obligation, to sell at the strike.',
  },
  {
    id: 'f08-op-k2', type: 'num', kind: 'numerical',
    prompt: `Hollis buys 10 contracts of the $42 Brightcup call at $${Q[42].call.toFixed(2)}. Brightcup ends at $47. What is his profit ($)?`,
    answer: Math.round(1000 * (5 - Q[42].call)), check: () => 1000 * (optionPayoff(47, 42, 'call') - Q[42].call), unit: '$', places: 0, tol: 1,
    solution: `1,000 × (5.00 − ${Q[42].call.toFixed(2)}) = $${Math.round(1000 * (5 - Q[42].call)).toLocaleString('en-US')}.`,
  },
  {
    id: 'f08-op-k3', type: 'num', kind: 'numerical',
    prompt: 'A covered call: own a share bought at $36 and write a $40 call for $1.80. What is the most the position can be worth at expiry, including the premium ($ a share)?',
    answer: 41.8, check: () => 40 + 1.8, unit: '$', places: 2, tol: 0.005,
    solution: 'Above $40 the share is called away at $40; with the $1.80 premium, $41.80.',
  },
  {
    id: 'f08-op-k4', type: 'mc', kind: 'applied',
    prompt: 'An investor expects a share to move sharply after a court ruling but does not know which way. Which position fits?',
    options: ['Buy a straddle', 'Write a straddle', 'Write a covered call', 'Buy a bull call spread'],
    answer: 0,
    feedback: { 1: 'Writing a straddle profits if the share stays still.', 2: 'A covered call gains from a flat market and loses in a fall.', 3: 'A bull spread profits only from a rise.' },
    solution: 'A long straddle pays off on a large move in either direction.',
  },
  {
    id: 'f08-op-k5', type: 'num', kind: 'numerical',
    prompt: `Lantern takes Kilnworth’s cap ($${CAP.strike.toFixed(2)} a kg, fee $${CAP.fee.toFixed(2)} a kg) on 2,400 kg. The list price ends at $38.40. What is the 2029 coffee bill ($)?`,
    answer: 95040, check: () => K.kgRoasted * capPerKg(38.4), unit: '$', places: 0, tol: 1,
    solution: 'Below the cap, Lantern pays the list price plus the fee: 2,400 × (38.40 + 1.20) = $95,040.',
  },
  {
    id: 'f08-op-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Why does an at-the-money option have a positive price although its intrinsic value is zero?',
    options: ['It may end in the money before expiry', 'Because exchanges set a minimum price for every option', 'Because its writer must be paid interest', 'Because intrinsic value is measured at expiry, not now'],
    answer: 0,
    feedback: { 1: 'Prices come from trading, not minimums.', 2: 'The premium pays for the right, not for interest.', 3: 'Intrinsic value is measured at today’s price.' },
    solution: 'All of its price is time value: the chance that the price moves in its favour before expiry.',
  },
];
