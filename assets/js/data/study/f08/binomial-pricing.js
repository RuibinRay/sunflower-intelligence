// binomial-pricing.js — F08 · Binomial pricing. Content only; exercises are in binomial-pricing.ex.js. Figures from case.js:
// OPT (Brightcup at $42.00, 30% volatility, six months to expiry, 4.5% a year = ln 1.045 continuously) and bs (the
// Black–Scholes values the trees converge to); trees from core/derivatives.js.
import { OPT as O, bs, QUOTES as Q } from './case.js?v=39';
import { binomial, oneStep } from '../../../core/derivatives.js?v=39';

const $2 = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const r4 = (x) => x.toFixed(4);
const S = O.S, K = 42;
// one step of six months, u = 1.2, d = 0.85, with the six-month rate 1.045^0.5 − 1
const rh = 1.045 ** 0.5 - 1;
const c1 = oneStep({ S, u: 1.2, d: 0.85, K, r: rh }), p1 = oneStep({ S, u: 1.2, d: 0.85, K, r: rh, type: 'put' });
// two steps of three months, Cox–Ross–Rubinstein
const dt = O.T / 2, u = Math.exp(O.sigma * Math.sqrt(dt)), d = 1 / u, g = Math.exp(O.r * dt), p = (g - d) / (u - d);
const Su = S * u, Sd = S * d, Suu = S * u * u, Sdd = S * d * d;
const cu = p * (Suu - K) / g, c0 = p * cu / g;
const pdE = (1 - p) * (K - Sdd) / g, p0E = (1 - p) * pdE / g, exD = K - Sd, p0A = (1 - p) * Math.max(pdE, exD) / g;
const steps = [1, 2, 3, 5, 10, 50, 100, 500];
const tree = (n, type, american = false) => binomial({ S, K, T: O.T, r: O.r, sigma: O.sigma, steps: n, type, american }).price;
const bsCall = bs(K, 'call').price, bsPut = bs(K, 'put').price;
const amPremium = tree(500, 'put', true) - tree(500, 'put');

export default {
  slug: 'binomial-pricing',
  title: 'Binomial pricing',
  blurb: 'Price an option by building it from the share and a loan. In a world where the share can only go up or down, a mix of shares and borrowing can copy the option exactly, so the option must cost what the mix costs. Price Brightcup’s options in one step and two, value early exercise of a put, and watch the tree converge as the steps shrink.',
  status: 'draft',
  objectives: [
    'Construct a portfolio of shares and borrowing that replicates an option in a one-step binomial model, and price the option from it.',
    'Explain risk-neutral valuation, and calculate the risk-neutral probability and an option’s price from it.',
    'Build a two-step Cox–Ross–Rubinstein tree from a volatility, and price European calls and puts by working backwards.',
    'Price an American put in a tree by checking early exercise at each node, and explain the early-exercise premium.',
    'Explain why binomial prices converge as the number of steps grows, and what delta means for hedging.',
  ],
  prerequisites: [
    { lesson: 'f08/put-call-parity', why: 'Pricing by replication, and the link between calls and puts.' },
    { lesson: 'f06/measuring-risk', why: 'Volatility as the standard deviation of returns.' },
  ],
  case: 'lantern',
  concept: [
    { case: `Hollis has learned that the Brightcup $42 put must cost what parity says, given the call. But what sets the call’s $${$2(Q[42].call)}? Nobody knows where Brightcup will be on ${O.expiry}. Ana’s answer is that nobody needs to: if the option can be built from things whose prices are known, it must cost what the building costs.` },
    { h: 'One step: up or down' },
    { p: `Start with a deliberately simple world. In six months Brightcup, now $${$2(S)}, will be either 20% higher, at $${$2(c1.Su)}, or 15% lower, at $${$2(c1.Sd)}. Money can be borrowed or lent risk-free for six months at 1.045<sup>0.5</sup> − 1 = ${(rh * 100).toFixed(4)}%. The $42 call will be worth $${$2(c1.Cu)} in the up state and nothing in the down state.` },
    { p: 'Now try to copy the call with Δ shares and a loan of B dollars. The portfolio must be worth the call’s payoff in both states:' },
    { math: String.raw`\Delta \times 50.40 - B(1+r) = 8.40 \qquad \Delta \times 35.70 - B(1+r) = 0` },
    { p: `Subtracting the second equation from the first gives Δ = (8.40 − 0) ÷ (50.40 − 35.70) = ${r4(c1.delta)} shares. Then B = 0.5714 × 35.70 ÷ ${(1 + rh).toFixed(6)} = $${r4(-c1.bond)}. The portfolio costs ${r4(c1.delta)} × 42.00 − ${r4(-c1.bond)} = $${r4(c1.price)} today and pays exactly what the call pays in both states. So the call must cost $${$2(c1.price)}: at any other price, buying the cheaper of the call and the portfolio and selling the dearer is an arbitrage. The number of shares, the option’s <g>delta</g>, is the change in the option’s value divided by the change in the share price.` },
    { math: String.raw`\Delta = \frac{C_u - C_d}{S_u - S_d} \qquad C_0 = \Delta S_0 - B` },
    { h: 'Probabilities do not matter, and then they do' },
    { p: 'Nothing in that calculation used the probability that Brightcup goes up. Investors may think a rise is likely or unlikely; the call’s price is fixed by the share price and the interest rate, because the replicating portfolio already reflects whatever investors think about Brightcup through its price. This is the central insight of option pricing.' },
    { p: 'There is a convenient way to get the same answer. Find the probability <i>p</i> that would make the share earn exactly the risk-free rate on average, as if investors did not care about risk. Then value the option as its expected payoff under that probability, discounted at the risk-free rate. This is <g>risk-neutral valuation</g>, and the <g>risk-neutral probability</g> is:' },
    { math: String.raw`p = \frac{(1+r) - d}{u - d} \qquad C_0 = \frac{p\,C_u + (1-p)\,C_d}{1+r}` },
    { p: `For Brightcup, p = (${(1 + rh).toFixed(6)} − 0.85) ÷ (1.20 − 0.85) = ${r4(c1.p)}, and the call is ${r4(c1.p)} × 8.40 ÷ ${(1 + rh).toFixed(6)} = $${r4(c1.riskNeutral)}, the same as before. The put, which pays $${$2(p1.Cd)} in the down state, is ${r4(1 - c1.p)} × ${$2(p1.Cd)} ÷ ${(1 + rh).toFixed(6)} = $${r4(p1.price)}. And the two satisfy put–call parity exactly: ${r4(c1.price)} − ${r4(p1.price)} = ${r4(c1.price - p1.price)} = 42.00 − 42 ÷ 1.045<sup>0.5</sup>. The risk-neutral probability is not a forecast; it is a device that gives the replication price with less algebra.` },
  ],
  theory: [
    { h: 'The same answer from a hedge' },
    { p: `There is a third way to see the price, closest to what a dealer does. Write one call and buy ${r4(c1.delta)} shares. If Brightcup rises to $50.40, the shares are worth ${r4(c1.delta)} × 50.40 = $${$2(c1.delta * c1.Su)} and the call costs $8.40 to settle, leaving $${$2(c1.delta * c1.Su - c1.Cu)}. If it falls to $35.70, the shares are worth $${$2(c1.delta * c1.Sd)} and the call costs nothing: again $${$2(c1.delta * c1.Sd)}. The combination is riskless, so it must earn the risk-free rate: it is worth $${$2(c1.delta * c1.Sd)} ÷ ${(1 + rh).toFixed(6)} = $${r4(-c1.bond)} today. The shares cost ${r4(c1.delta)} × 42.00 = $${$2(c1.delta * S)}, so the call must bring in the difference, $${r4(c1.price)}. Delta is the hedge ratio that makes an option and its share offset each other.` },
    { h: 'More steps, from a volatility' },
    { p: 'Two outcomes in six months is too crude. A better tree divides the time into many short steps, each with an up and a down move, so that the share can end at many prices. The usual choice, from Cox, Ross and Rubinstein, sets the moves from the share’s volatility σ and the length of a step Δt, with rates compounded continuously:' },
    { math: String.raw`u = e^{\sigma\sqrt{\Delta t}},\quad d = \frac{1}{u},\quad p = \frac{e^{r\Delta t} - d}{u - d}` },
    { p: `With σ = ${(O.sigma * 100).toFixed(0)}% and two steps of three months, u = e<sup>0.30 × 0.5</sup> = ${r4(u)} and d = ${r4(d)}. Brightcup can be at $${$2(Su)} or $${$2(Sd)} after three months, and at $${$2(Suu)}, $${$2(S)} or $${$2(Sdd)} at expiry. The risk-neutral probability of an up move is (e<sup>${O.r.toFixed(5)} × 0.25</sup> − ${r4(d)}) ÷ (${r4(u)} − ${r4(d)}) = ${r4(p)}.` },
    { p: 'Why these factors? Over a short step the share’s return should have a standard deviation of σ√Δt, the volatility scaled to the step, and choosing u = e<sup>σ√Δt</sup> with d = 1/u gives exactly that spread of log returns. The tree does not try to match the share’s expected return: the risk-neutral probability takes care of the drift, which is why the share’s real-world growth rate never appears in option prices. Only its volatility does.' },
    { h: 'Working backwards' },
    { p: `The tree is valued from the end. At expiry each node’s value is the payoff. One step earlier, each node is worth its risk-neutral expected value one step on, discounted for one step. For the $42 call, only the top node pays: $${$2(Suu - K)}. At the up node after three months the call is worth ${r4(p)} × ${$2(Suu - K)} ÷ ${r4(g)} = $${$2(cu)}; at the down node, nothing. Today it is ${r4(p)} × ${$2(cu)} ÷ ${r4(g)} = $${$2(c0)}.` },
    { table: {
      caption: 'Two-step tree for Brightcup: share price, then $42 call value ($)',
      head: ['', 'Today', 'After 3 months', 'At expiry'],
      rows: [
        ['Up, up', '', '', `${$2(Suu)} → ${$2(Suu - K)}`],
        ['Up', '', `${$2(Su)} → ${$2(cu)}`, ''],
        ['Start / middle', `${$2(S)} → ${$2(c0)}`, '', `${$2(S)} → 0.00`],
        ['Down', '', `${$2(Sd)} → 0.00`, ''],
        ['Down, down', '', '', `${$2(Sdd)} → 0.00`],
      ],
      align: ['l', 'r', 'r', 'r'],
    } },
    { h: 'American options: exercise when it pays' },
    { p: `An American option adds one check at every node: is it worth more exercised now than held? For the $42 put, the European value at the down node after three months is (1 − ${r4(p)}) × ${$2(K - Sdd)} ÷ ${r4(g)} = $${$2(pdE)}. But exercising there brings $42.00 − $${$2(Sd)} = $${$2(exD)} at once, more than holding. An American put holder exercises, so that node is worth $${$2(exD)}, and the put today is worth (1 − ${r4(p)}) × ${$2(exD)} ÷ ${r4(g)} = $${$2(p0A)}, against $${$2(p0E)} for the European put. The difference is the <g>early-exercise premium</g>: the value of being able to take the strike early and earn interest on it. For a call on a share with no dividend, the check never triggers, as the previous lesson showed.` },
    { h: 'Convergence' },
    { p: 'As the number of steps grows, the tree’s range of final prices fills in and its option prices settle down. Each added step changes the price less, though not always in the same direction, because the strike falls at different places relative to the tree’s nodes.' },
    { table: {
      caption: 'Brightcup $42 options by number of steps (σ = 30%, six months)',
      head: ['Steps', ...steps.map(String), 'Black–Scholes'],
      rows: [
        ['European call', ...steps.map((n) => $2(tree(n, 'call'))), $2(bsCall)],
        ['European put', ...steps.map((n) => $2(tree(n, 'put'))), $2(bsPut)],
        ['American put', ...steps.map((n) => $2(tree(n, 'put', true))), '—'],
      ],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'],
    } },
    { p: `With 500 steps the call is $${$2(tree(500, 'call'))}, within a cent of the $${$2(bsCall)} given by the Black–Scholes–Merton formula, which is what the tree becomes as the steps become infinitely small. The American put stays above the European by about $${$2(amPremium)}, the early-exercise premium, which no simple formula gives: for American puts, and for options with unusual features, trees are still the practical tool.` },
    { h: 'Dividends in a tree' },
    { p: 'A share that pays a dividend drops by about the dividend on the day it goes ex-dividend. A tree handles this by marking the drop at the nodes on that date, or, for a continuous dividend yield q, by using e<sup>(r − q)Δt</sup> in place of e<sup>rΔt</sup> in the risk-neutral probability. Just before a large dividend, an American call can be worth more exercised than held, because exercising captures the dividend; the tree’s check at each node finds those nodes automatically. Brightcup’s dividend falls in June, after the case’s options expire, so its trees need neither adjustment.' },
    { h: 'Delta and dynamic hedging' },
    { p: `The replicating portfolio changes as the tree moves. At the start of the two-step tree the call’s delta is (${$2(cu)} − 0) ÷ (${$2(Su)} − ${$2(Sd)}) = ${r4(cu / (Su - Sd))}; after an up move it rises to 1, since the call is then sure to end in the money; after a down move it falls to 0. Someone who has written the call can hedge it by holding delta shares and adjusting the holding at each step, <g>delta hedging</g>. If the tree is right, the adjustments cost exactly what the call was sold for. This is how option dealers manage the options they write: not by betting on the share, but by rebalancing a hedge.` },
  ],
  formulas: [
    { id: 'bt-delta', name: 'Replicating an option in one step',
      tex: String.raw`\Delta = \frac{C_u - C_d}{S_u - S_d},\qquad B = \frac{\Delta S_d - C_d}{1+r},\qquad C_0 = \Delta S_0 - B`,
      where: [[String.raw`C_u,\ C_d`, 'Option values in the up and down states', '$'], [String.raw`S_u,\ S_d`, 'Share prices in the up and down states', '$'], [String.raw`S_0`, 'Share price today', '$'], [String.raw`r`, 'Risk-free rate for the step', ''], [String.raw`B`, 'The amount borrowed (negative means lent)', '$'], [String.raw`\Delta`, 'Shares held', '']] },
    { id: 'bt-rn', name: 'Risk-neutral valuation, one step',
      tex: String.raw`p = \frac{(1+r) - d}{u - d},\qquad C_0 = \frac{p\,C_u + (1-p)\,C_d}{1+r}`,
      where: [[String.raw`u,\ d`, 'Up and down factors (S_u = uS_0, S_d = dS_0)', ''], [String.raw`p`, 'Risk-neutral probability of an up move', ''], [String.raw`r`, 'Risk-free rate for the step', ''], [String.raw`C_u,\ C_d`, 'Option values in the up and down states', '$']],
      assumptions: 'No arbitrage requires d < 1 + r < u.' },
    { id: 'bt-crr', name: 'Cox–Ross–Rubinstein tree',
      tex: String.raw`u = e^{\sigma\sqrt{\Delta t}},\ d = 1/u,\ p = \frac{e^{r\Delta t} - d}{u - d}`,
      where: [[String.raw`\sigma`, 'Volatility a year', ''], [String.raw`\Delta t`, 'Length of a step', 'years'], [String.raw`r`, 'Continuously compounded rate', ''], [String.raw`u,\ d`, 'Up and down factors', ''], [String.raw`p`, 'Risk-neutral probability of an up move', '']],
      note: 'Each node is worth e<sup>−rΔt</sup>[pV<sub>up</sub> + (1 − p)V<sub>down</sub>]; for an American option, the larger of that and the exercise value.' },
  ],
  examples: [
    { level: 'simple', title: 'One step: the call by replication', fictional: true,
      setup: `Brightcup at $42.00 will be $50.40 or $35.70 in six months; the six-month risk-free rate is ${(rh * 100).toFixed(4)}%. Price the $42 call by replication.`,
      steps: [
        'Payoffs: 8.40 up, 0 down.',
        `Δ = 8.40 ÷ (50.40 − 35.70) = ${r4(c1.delta)} shares.`,
        `Loan: B = ${r4(c1.delta)} × 35.70 ÷ ${(1 + rh).toFixed(6)} = ${r4(-c1.bond)}.`,
        `Price: ${r4(c1.delta)} × 42.00 − ${r4(-c1.bond)} = ${r4(c1.price)}.`,
      ],
      answer: `$${$2(c1.price)}.`,
      interpretation: 'Buying 0.5714 shares with $19.96 of borrowed money and $4.04 of one’s own copies the call exactly.' },
    { level: 'challenging', title: 'Two steps: European and American puts', fictional: true,
      setup: `Use the two-step tree (u = ${r4(u)}, d = ${r4(d)}, p = ${r4(p)}, one-step growth e<sup>rΔt</sup> = ${r4(g)}). Price the $42 European put and the $42 American put.`,
      steps: [
        `Expiry: put pays 0 at ${$2(Suu)}, 0 at 42.00 and ${$2(K - Sdd)} at ${$2(Sdd)}.`,
        `Down node (${$2(Sd)}): hold = (1 − ${r4(p)}) × ${$2(K - Sdd)} ÷ ${r4(g)} = ${$2(pdE)}; exercise = 42.00 − ${$2(Sd)} = ${$2(exD)}.`,
        `European: today = (1 − ${r4(p)}) × ${$2(pdE)} ÷ ${r4(g)} = ${$2(p0E)}.`,
        `American: exercise at the down node, so today = (1 − ${r4(p)}) × ${$2(exD)} ÷ ${r4(g)} = ${$2(p0A)}.`,
      ],
      answer: `European $${$2(p0E)}, American $${$2(p0A)}.`,
      interpretation: 'Early exercise is worth taking when the put is deep in the money: the interest on the strike outweighs the little time value left.' },
    { level: 'applied', title: 'How many steps are enough?', fictional: true,
      setup: `A dealer prices the Brightcup $42 call with a binomial tree and wants an answer within a cent of the Black–Scholes value of $${$2(bsCall)}. Using the convergence table, how many steps would do?`,
      steps: [
        `10 steps: ${$2(tree(10, 'call'))}, off by ${$2(Math.abs(tree(10, 'call') - bsCall))}.`,
        `100 steps: ${$2(tree(100, 'call'))}, off by ${$2(Math.abs(tree(100, 'call') - bsCall))}.`,
        `500 steps: ${$2(tree(500, 'call'))}, within a cent.`,
      ],
      answer: 'Several hundred steps; for a European call, the formula is simpler.',
      interpretation: 'Trees earn their keep for American options and unusual contracts, where no formula exists; then hundreds of steps take a computer a fraction of a second.' },
  ],
  demo: [
    { widget: 'bt-one', intro: 'A one-step tree for Brightcup. Change the up and down moves and the strike, and see the replicating portfolio and the risk-neutral probability. If the moves allow an arbitrage, the widget says so.' },
    { widget: 'bt-steps', intro: 'The Cox–Ross–Rubinstein tree with more and more steps. Watch the call, the European put and the American put settle towards their limits.' },
  ],
  mistakes: [
    { title: 'Using real-world probabilities', html: 'The option’s price does not depend on how likely investors think a rise is. Use the risk-neutral probability, and discount at the risk-free rate.' },
    { title: 'Discounting at the share’s expected return', html: 'Under the risk-neutral probability every asset earns the risk-free rate, so the expected payoff is discounted at that rate, not at a cost of equity.' },
    { title: 'Mixing per-step and annual rates', html: 'In each step, grow by the rate for the step: (1 + r)<sup>Δt</sup> with annual compounding, e<sup>rΔt</sup> with continuous.' },
    { title: 'Forgetting the early-exercise check', html: 'An American option is worth the larger of its continuation value and its exercise value at every node, not only at expiry.' },
    { title: 'A tree that allows arbitrage', html: 'If d ≥ 1 + r, the share beats the risk-free rate in every state; if u ≤ 1 + r, it never does. Either way, p falls outside 0 to 1 and the tree is unusable.' },
  ],
  application: [
    { p: 'Binomial trees are taught first because they show the logic of option pricing with nothing but arithmetic, but they are also a working tool. Exchanges and dealers use them, and their cousins, finite-difference methods, to value American options on shares and futures, options on shares that pay dividends at known dates, and contracts whose payoff depends on the path the price takes. Convertible bonds, employee share options with vesting periods and real options in capital budgeting are often valued on trees, because each node can carry the decision that a holder would take there.' },
    { p: 'Companies meet trees when they account for the share options they give employees. Accounting standards (ASC 718 in the United States, IFRS 2 elsewhere) require the options to be expensed at their fair value when granted, and allow either a closed-form model or a lattice model such as a binomial tree. Lattice models are often preferred for employee options because they can include features a formula cannot: vesting periods during which the options cannot be exercised, and employees’ habit of exercising early once the share price has risen well above the strike.' },
    { p: 'The same backward induction appears wherever a decision can be revisited. F05’s real options to expand or abandon a project are American options on the project’s value; a tree of the project’s value, with the decision checked at each node, prices them exactly as this lesson prices the American put.' },
    { case: `Ana shows Hollis the convergence table. With 500 steps, the tree prices the $42 call at $${$2(tree(500, 'call'))} using only Brightcup’s price, a 30% volatility and the interest rate. The exchange’s $${$2(Q[42].call)} is consistent with that volatility. The next lesson gives the formula the tree converges to, and the sensitivities a hedger needs.` },
  ],
  summary: [
    'In a one-step tree, Δ = (C<sub>u</sub> − C<sub>d</sub>) ÷ (S<sub>u</sub> − S<sub>d</sub>) shares and a loan replicate the option, so it must cost ΔS<sub>0</sub> − B.',
    'Real-world probabilities do not enter. The risk-neutral probability p = (1 + r − d) ÷ (u − d) gives the same price as an expected payoff discounted at the risk-free rate.',
    'Cox–Ross–Rubinstein trees set u = e<sup>σ√Δt</sup>, d = 1/u, p = (e<sup>rΔt</sup> − d)/(u − d) and work backwards from the payoffs.',
    'American options take the larger of continuation and exercise value at each node; American puts carry an early-exercise premium.',
    'As steps shrink, binomial prices converge to Black–Scholes–Merton.',
    'Delta changes as the price moves; a hedger who rebalances delta shares replicates the option.',
  ],
  glossary: [
    { term: 'Binomial tree', def: 'A model in which an asset’s price moves up or down by set factors in each of a number of steps, used to value options by working backwards from their payoffs.' },
    { term: 'Delta', def: 'The change in an option’s value for a small change in the price of the underlying; also the number of shares in the portfolio that replicates the option.' },
    { term: 'Risk-neutral valuation', def: 'Valuing a derivative as its expected payoff under probabilities that make every asset earn the risk-free rate, discounted at the risk-free rate; it gives the same price as replication.' },
    { term: 'Risk-neutral probability', def: 'The probability of each outcome under which the underlying asset’s expected return equals the risk-free rate; in a binomial step, p = (1 + r − d) ÷ (u − d).' },
    { term: 'Early-exercise premium', def: 'The amount by which an American option is worth more than the otherwise identical European option.' },
    { term: 'Delta hedging', def: 'Holding delta units of the underlying against an option position, and adjusting the holding as delta changes, so that small price moves leave the combined position unchanged.' },
  ],
  references: [
    { text: 'Cox, J. C., Ross, S. A. &amp; Rubinstein, M. (1979). Option pricing: a simplified approach. <i>Journal of Financial Economics</i>, 7(3), 229–263.', url: 'https://doi.org/10.1016/0304-405X(79)90015-1' },
    { text: 'Hull, J. C. (2022). <i>Options, Futures, and Other Derivatives</i> (11th ed.), chapter 13. Pearson.' },
  ],
  checks: [
    { what: 'Six-month rate', value: rh * 100, shown: 2.2252, tol: 0.00005 },
    { what: 'Su', value: c1.Su, shown: 50.4, tol: 1e-9 },
    { what: 'Sd', value: c1.Sd, shown: 35.7, tol: 1e-9 },
    { what: 'Cu', value: c1.Cu, shown: 8.4, tol: 1e-9 },
    { what: 'Delta', value: c1.delta, shown: 0.5714, tol: 0.00005 },
    { what: 'Loan', value: -c1.bond, shown: 19.9559, tol: 0.00005 },
    { what: 'Call one step', value: c1.price, shown: 4.0441, tol: 0.00005 },
    { what: 'Growth', value: 1 + rh, shown: 1.022252, tol: 5e-7 },
    { what: 'p', value: c1.p, shown: 0.4921, tol: 0.00005 },
    { what: '1 − p', value: 1 - c1.p, shown: 0.5079, tol: 0.00005 },
    { what: 'Put Cd', value: p1.Cd, shown: 6.3, tol: 1e-9 },
    { what: 'Put one step', value: p1.price, shown: 3.1298, tol: 0.00005 },
    { what: 'Parity gap', value: c1.price - p1.price, shown: 0.9143, tol: 0.00005 },
    { what: 'u', value: u, shown: 1.1618, tol: 0.00005 },
    { what: 'd', value: d, shown: 0.8607, tol: 0.00005 },
    { what: 'Su2', value: Su, shown: 48.8, tol: 0.005 },
    { what: 'Sd2', value: Sd, shown: 36.15, tol: 0.005 },
    { what: 'Suu', value: Suu, shown: 56.69, tol: 0.005 },
    { what: 'Sdd', value: Sdd, shown: 31.11, tol: 0.005 },
    { what: 'p two-step', value: p, shown: 0.4993, tol: 0.00005 },
    { what: 'g', value: g, shown: 1.0111, tol: 0.00005 },
    { what: 'Suu − K', value: Suu - K, shown: 14.69, tol: 0.005 },
    { what: 'cu', value: cu, shown: 7.26, tol: 0.005 },
    { what: 'c0', value: c0, shown: 3.58, tol: 0.005 },
    { what: 'K − Sdd', value: K - Sdd, shown: 10.89, tol: 0.005 },
    { what: 'pd European', value: pdE, shown: 5.39, tol: 0.005 },
    { what: 'Exercise at d', value: exD, shown: 5.85, tol: 0.005 },
    { what: 'European put 2 steps', value: p0E, shown: 2.67, tol: 0.005 },
    { what: 'American put 2 steps', value: p0A, shown: 2.9, tol: 0.005 },
    { what: 'Tree 2 = hand', value: tree(2, 'put', true) - p0A, shown: 0, tol: 1e-9 },
    { what: 'BS call', value: bsCall, shown: 3.99, tol: 0.005 },
    { what: 'Tree 500 call', value: tree(500, 'call'), shown: 3.98, tol: 0.005 },
    { what: 'Am premium', value: amPremium, shown: 0.08, tol: 0.005 },
    { what: 'Delta two-step', value: cu / (Su - Sd), shown: 0.5738, tol: 0.00005 },
    { what: 'Tree 10', value: tree(10, 'call'), shown: 3.90, tol: 0.005 },
    { what: 'Tree 10 error', value: Math.abs(tree(10, 'call') - bsCall), shown: 0.09, tol: 0.005 },
    { what: 'Tree 100', value: tree(100, 'call'), shown: 3.98, tol: 0.005 },
    { what: 'Shares up', value: c1.delta * c1.Su, shown: 28.8, tol: 0.005 },
    { what: 'Hedged up', value: c1.delta * c1.Su - c1.Cu, shown: 20.4, tol: 0.005 },
    { what: 'Shares down', value: c1.delta * c1.Sd, shown: 20.4, tol: 0.005 },
    { what: 'Shares cost', value: c1.delta * S, shown: 24, tol: 0.005 },
    { what: 'Tree 100 error', value: Math.abs(tree(100, 'call') - bsCall), shown: 0.01, tol: 0.005 },
  ],
};
