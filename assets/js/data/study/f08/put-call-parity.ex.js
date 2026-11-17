// put-call-parity.ex.js — F08 · Put–call parity: widgets, practice and the knowledge check (answer keys live here).
// Figures from case.js (OPT, QUOTES); every num item's `check` recomputes its answer.
import { OPT as O, QUOTES as Q } from './case.js?v=40';
import { parityGap } from '../../../core/derivatives.js?v=40';

const disc = Math.exp(-O.r * O.T);
const usd = (x, d = 2) => `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const widgets = {
  'pc-check': {
    type: 'formula', title: 'Do these quotes obey put–call parity?',
    intro: 'Brightcup at $42.00; European options expiring in six months; continuous rate 4.402% (4.5% a year compounded annually).',
    inputs: [
      { id: 'K', label: 'Strike', min: 38, max: 46, step: 2, value: 42, fmt: 'money' },
      { id: 'c', label: 'Call price', min: 0, max: 10, step: 0.01, value: Q[42].call, fmt: 'money' },
      { id: 'p', label: 'Put price', min: 0, max: 10, step: 0.01, value: 2.6, fmt: 'money' },
    ],
    compute: (v) => {
      const gap = parityGap({ C: v.c, P: v.p, S: O.S, K: v.K, r: O.r, T: O.T });
      const fairP = v.c - O.S + v.K * disc, tiny = Math.abs(gap) < 0.01;
      return {
        headline: { label: 'Call − put less (S − PV of strike)', value: usd(gap, 4) },
        rows: [['PV of the strike', usd(v.K * disc, 4)], ['Put price parity implies from this call', usd(fairP, 4)], ['Trade', tiny ? 'None worth doing (within a cent)' : gap > 0 ? 'Conversion: write the call, buy the put and the share, borrow PV(K)' : 'Reversal: buy the call, write the put, short the share, deposit PV(K)'], ['Profit today on one contract (100 shares)', tiny ? '—' : usd(Math.abs(gap) * 100)]],
        note: tiny ? 'The quotes agree with parity to within rounding.' : gap > 0 ? 'The call is dear relative to the put (or the put cheap): sell the call side, buy the put side.' : 'The put is dear relative to the call: sell the put side, buy the call side.',
      };
    },
  },
};

export const guided = [
  {
    id: 'f08-pc-g1', type: 'num', kind: 'numerical',
    prompt: 'A share is at $50. A one-year European call with strike $50 costs $6.00. The continuously compounded rate is 4%. What should the matching put cost ($)?',
    answer: 4.04, check: () => 6 - 50 + 50 * Math.exp(-0.04), unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 6, say: 'At the money, the call is worth more than the put by S − Ke<sup>−rT</sup>, because the strike is paid later.' }],
    hints: ['p = c − S<sub>0</sub> + Ke<sup>−rT</sup>.', '6.00 − 50 + 50e<sup>−0.04</sup>.'],
    solution: '50e<sup>−0.04</sup> = 48.0395; p = 6.00 − 50 + 48.0395 = $4.04.',
  },
  {
    id: 'f08-pc-g2', type: 'steps', kind: 'numerical',
    prompt: `Brightcup is at $42.00 and six-month options are priced with e<sup>−rT</sup> = ${disc.toFixed(6)}. The $40 put trades at $${Q[40].put.toFixed(2)}.`,
    steps: [
      { id: 'f08-pc-g2a', type: 'num', kind: 'numerical', prompt: 'What is the present value of the $40 strike ($, 4 decimals)?', answer: 39.1293, check: () => 40 * disc, unit: '$', places: 4, tol: 0.0001, hints: ['40 × e<sup>−rT</sup>.'] },
      { id: 'f08-pc-g2b', type: 'num', kind: 'numerical', prompt: 'What call price does parity imply ($)?', answer: Math.round((Q[40].put + O.S - 40 * disc) * 100) / 100, check: () => Q[40].put + O.S - 40 * disc, unit: '$', places: 2, tol: 0.005, hints: ['c = p + S<sub>0</sub> − Ke<sup>−rT</sup>.'] },
    ],
    solution: `PV(40) = 39.1293; c = ${Q[40].put.toFixed(2)} + 42.00 − 39.1293 = $${(Q[40].put + O.S - 40 * disc).toFixed(2)}, matching the quoted $${Q[40].call.toFixed(2)}.`,
  },
  {
    id: 'f08-pc-g3', type: 'mc', kind: 'applied',
    prompt: 'A call and a put on the same share, strike and expiry are quoted so that c − p is $0.80 more than S<sub>0</sub> − Ke<sup>−rT</sup>. What trade earns the difference?',
    options: ['Write the call, buy the put, buy the share, borrow PV(K)', 'Buy the call, write the put, short the share, deposit PV(K)', 'Buy both the call and the put and wait', 'Write both options and invest the premiums at the risk-free rate'],
    answer: 0,
    feedback: { 1: 'That trade earns money when c − p is too low.', 2: 'A straddle is a bet on volatility, not an arbitrage.', 3: 'Writing both is a bet that the share stays still.' },
    hints: ['c − p is too high: is the call dear or the put cheap? Sell the dear side.'],
    solution: 'The call side (call + deposit) is dear; the put side (share + put) cheap. Sell the call, buy put and share, borrow PV(K): a conversion that collects $0.80 today.',
  },
  {
    id: 'f08-pc-g4', type: 'num', kind: 'numerical',
    prompt: 'A share is at $30 and pays no dividend. The rate is 5% (continuous) and a one-year European call has strike $25. What is the lowest price the call can have without an arbitrage ($)?',
    answer: 6.22, check: () => 30 - 25 * Math.exp(-0.05), unit: '$', places: 2, tol: 0.005,
    wrong: [{ value: 5, say: 'That is S − K. The bound is S − Ke<sup>−rT</sup>, higher because the strike is paid later.' }],
    hints: ['Lower bound: S<sub>0</sub> − Ke<sup>−rT</sup>.'],
    solution: '30 − 25e<sup>−0.05</sup> = 30 − 23.7807 = $6.22.',
  },
];

export const independent = [
  {
    id: 'f08-pc-i1', type: 'num', kind: 'numerical',
    prompt: `What put price does parity imply for the $46 Brightcup option, given the $46 call at $${Q[46].call.toFixed(2)}? ($, 2 decimals)`,
    answer: Math.round((Q[46].call - O.S + 46 * disc) * 100) / 100, check: () => Q[46].call - O.S + 46 * disc, unit: '$', places: 2, tol: 0.005,
    solution: `${Q[46].call.toFixed(2)} − 42.00 + 46 × ${disc.toFixed(6)} = $${(Q[46].call - O.S + 46 * disc).toFixed(2)}.`,
  },
  {
    id: 'f08-pc-i2', type: 'num', kind: 'numerical',
    prompt: 'A share at $80 will pay a dividend with present value $1.50 before expiry. A $80 call costs $5.20, the rate is 4% (continuous) and expiry is in nine months. What should the $80 put cost ($)?',
    answer: 4.34, check: () => 5.2 - (80 - 1.5) + 80 * Math.exp(-0.04 * 0.75), unit: '$', places: 2, tol: 0.005,
    solution: 'p = c − (S<sub>0</sub> − D) + Ke<sup>−rT</sup> = 5.20 − 78.50 + 80e<sup>−0.03</sup> (77.6356) = $4.34.',
  },
  {
    id: 'f08-pc-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Which combination builds each synthetic position (all options with strike K and the same expiry)?',
    items: ['A long forward at K', 'A long put', 'A long share', 'A long call'],
    categories: ['Long call + short put', 'Long call + short share + deposit of PV(K)', 'Long call + short put + deposit of PV(K)', 'Long put + long share − borrowing of PV(K)'],
    answer: [0, 1, 2, 3],
    solution: 'From c + Ke<sup>−rT</sup> = p + S<sub>0</sub>: c − p is a forward; p = c − S + PV(K); S = c − p + PV(K); c = p + S − PV(K).',
  },
  {
    id: 'f08-pc-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Why is it never optimal to exercise an American call early on a share that pays no dividend?',
    options: ['The call can always be sold for more than S − K', 'Because the exchange forbids exercise before the expiry date', 'Because the share price always rises before expiry', 'Because the call’s time value is always zero'],
    answer: 0,
    feedback: { 1: 'American options can be exercised early; the question is whether it pays.', 2: 'Prices can fall; the argument does not depend on a forecast.', 3: 'Time value is positive before expiry, which is part of the reason.' },
    solution: 'Its price is at least S − Ke<sup>−rT</sup>, which exceeds the S − K that exercise yields; selling beats exercising.',
  },
  {
    id: 'f08-pc-i5', type: 'num', kind: 'numerical',
    prompt: 'A three-month $100 call costs $4.00 and the matching put $3.00; the share is at $101 and the rate 4% (continuous). What profit does the arbitrage lock in a share today ($, 3 decimals)?',
    answer: 0.995, check: () => Math.abs(parityGap({ C: 4, P: 3, S: 101, K: 100, r: 0.04, T: 0.25 })), unit: '$', places: 3, tol: 0.006,
    solution: 'S − Ke<sup>−rT</sup> = 101 − 99.0050 = 1.9950; c − p = 1.00. The put side is dear: buy the call, write the put, short the share, deposit PV(K): 101 + 3 − 4 − 99.0050 = $0.995.',
  },
];

export const check = [
  {
    id: 'f08-pc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What do a call plus a deposit of Ke<sup>−rT</sup>, and a share plus a put, both pay at expiry?',
    options: ['The larger of S<sub>T</sub> and K', 'The smaller of S<sub>T</sub> and K', 'S<sub>T</sub> − K in every outcome', 'K in every outcome'],
    answer: 0,
    feedback: { 1: 'Each portfolio gets the higher value: K as a floor, S<sub>T</sub> above it.', 2: 'That is a forward’s payoff (call − put).', 3: 'Above K both are worth S<sub>T</sub>.' },
    solution: 'Both pay max(S<sub>T</sub>, K), so they must cost the same today.',
  },
  {
    id: 'f08-pc-k2', type: 'num', kind: 'numerical',
    prompt: 'A share is at $64; a six-month European put with strike $60 costs $2.10; the continuous rate is 5%. What should the matching call cost ($)?',
    answer: 7.58, check: () => 2.1 + 64 - 60 * Math.exp(-0.05 * 0.5), unit: '$', places: 2, tol: 0.005,
    solution: 'c = 2.10 + 64 − 60e<sup>−0.025</sup> (58.5185) = $7.58.',
  },
  {
    id: 'f08-pc-k3', type: 'num', kind: 'numerical',
    prompt: 'A put with strike $50 expires in one year; the continuous rate is 5%. What is the most it can be worth ($)?',
    answer: 47.56, check: () => 50 * Math.exp(-0.05), unit: '$', places: 2, tol: 0.005,
    solution: 'p ≤ Ke<sup>−rT</sup> = 50e<sup>−0.05</sup> = $47.56: it can pay at most $50 in a year.',
  },
  {
    id: 'f08-pc-k4', type: 'mc', kind: 'applied',
    prompt: 'An investor wants exposure to a share but cannot buy shares in her account. Which options position gives the same payoff as holding the share until expiry (with a deposit)?',
    options: ['Buy a call, write a put at the same strike, deposit PV(K)', 'Buy a call and a put at the same strike and expiry', 'Write a call and buy a put at the same strike, deposit PV(K)', 'Buy a call alone, with no other position'],
    answer: 0,
    feedback: { 1: 'That is a straddle, which gains from a move either way.', 2: 'That is a short synthetic forward plus a deposit: it gains when the share falls.', 3: 'A call alone does not lose when the share falls below K.' },
    solution: 'S<sub>0</sub> = c − p + Ke<sup>−rT</sup>: a synthetic share.',
  },
  {
    id: 'f08-pc-k5', type: 'num', kind: 'numerical',
    prompt: 'With Brightcup at $42.00 and e<sup>−rT</sup> = 0.978232, at what strike would six-month call and put prices be equal ($, 2 decimals)?',
    answer: 42.93, check: () => O.S / disc, unit: '$', places: 2, tol: 0.005,
    solution: 'c = p when S<sub>0</sub> = Ke<sup>−rT</sup>, so K = 42 ÷ 0.978232 = $42.93, the forward price.',
  },
  {
    id: 'f08-pc-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Why might an American put be exercised early?',
    options: ['Deep in the money, interest on the strike can outweigh the time value', 'Because puts lose all their value after half their life', 'Because the put’s writer can demand early exercise', 'Because parity requires puts to be exercised before calls'],
    answer: 0,
    feedback: { 1: 'Time value falls gradually, not to zero halfway.', 2: 'Only the holder decides to exercise.', 3: 'Parity says nothing about the order of exercise.' },
    solution: 'Exercising brings in K now; if little time value is left, the interest on K can be worth more than keeping the option.',
  },
];
