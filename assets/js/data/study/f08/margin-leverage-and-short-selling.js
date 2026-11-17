// margin-leverage-and-short-selling.js — F08 · Margin, leverage and short selling. Content only; exercises are in
// margin-leverage-and-short-selling.ex.js. Figures from case.js: OPT (Brightcup at $42.00), MARGIN_RULES (Regulation T's
// 50% initial margin and FINRA's minimum maintenance margins; an 8% broker loan rate, fictional), COFFEE.futures and QUOTES.
import { OPT as O, MARGIN_RULES as MR, COFFEE as K, QUOTES as Q } from './case.js?v=39';

const $ = (x) => Math.round(x).toLocaleString('en-US');
const $2 = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pc = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const n = O.holding, S = O.S, V = n * S, E = V * MR.initial, L = V - E, interest = L * MR.loanRate;
const callPrice = L / (n * (1 - MR.maintenance));
const endUp = S * 1.1, endDown = S * 0.9;
const eqUp = n * endUp - L - interest, eqDown = n * endDown - L - interest;
const rUp = eqUp / E - 1, rDown = eqDown / E - 1, breakEven = (E + L + interest) / n;
const shortAcct = V * (1 + MR.initial), shortCall = shortAcct / (n * (1 + MR.shortMaintenance));
const fee = 0.01, feeHalf = V * fee / 2, shortGain36 = (S - 36) * n - feeHalf, shortLoss50 = (50 - S) * n + feeHalf;
const futLev = K.futures.size * K.futures.price / K.futures.initial;
const callAt50 = (50 - 42 - Q[42].call) / Q[42].call;

export default {
  slug: 'margin-leverage-and-short-selling',
  title: 'Margin, leverage and short selling',
  blurb: 'Borrowing to invest magnifies gains and losses, and a broker that lends will demand more cash when prices move the wrong way. Buy Brightcup shares on margin, find the price that brings a margin call, sell short and see why the loss has no limit, and compare the leverage in margin accounts, futures and options.',
  status: 'draft',
  objectives: [
    'Calculate the equity, margin ratio and return of a position bought on margin, and the price at which a margin call comes.',
    'Explain how leverage magnifies returns, and calculate the return on equity from the return on the asset and the cost of borrowing.',
    'Describe how a short sale works, and calculate its profit, costs and margin call price.',
    'Compare the leverage in margin purchases, short sales, futures and options.',
    'Explain how margin calls and forced selling turn price falls into liquidity crises.',
  ],
  prerequisites: [
    { lesson: 'f08/forwards-and-futures', why: 'Margin accounts and margin calls on futures.' },
    { lesson: 'f00/market-participants', why: 'Brokers, and what short selling is.' },
    { lesson: 'f05/capital-structure', why: 'How borrowing changes the risk and return of equity.' },
  ],
  case: 'lantern',
  concept: [
    { case: `Hollis Avery thinks Brightcup is cheap at $${$2(S)}. He wants to buy another ${$(n)} shares, but would rather not sell anything to pay for them. His broker offers to lend him half the cost against the shares, at ${pc(MR.loanRate, 0)} a year. A friend of his thinks the opposite, that Brightcup will fall after its results, and plans to sell its shares short. Ana, who has watched Lantern’s cash closely for years, wants to know what each of them is risking.` },
    { h: 'Buying on margin' },
    { p: `A <g>margin account</g> lets an investor buy securities with money partly borrowed from the broker, with the securities as collateral. In the United States the Federal Reserve’s Regulation T sets the <g>initial margin</g> for shares at ${pc(MR.initial, 0)}: the investor must put up at least half the cost. Hollis buys ${$(n)} shares for $${$(V)}, paying $${$(E)} himself and borrowing $${$(L)}.` },
    { p: 'The investor’s equity is the value of the shares less the loan, and the margin ratio is equity divided by the value of the shares. As the price falls, the loan stays fixed, so equity falls faster than the price.' },
    { math: String.raw`\text{Margin} = \frac{\text{Value of shares} - \text{Loan}}{\text{Value of shares}}` },
    { h: 'The margin call' },
    { p: `Brokers require the margin to stay above a <g>maintenance margin</g>; FINRA’s minimum for shares bought on margin is ${pc(MR.maintenance, 0)}, and many brokers ask for more. If the margin falls below it, the broker makes a margin call, and the investor must add cash or securities, or the broker sells the shares. The price that triggers the call solves (nP − L) ÷ nP = m:` },
    { math: String.raw`P^* = \frac{L}{n\,(1 - m)}` },
    { p: `For Hollis, P* = ${$(L)} ÷ (${$(n)} × ${(1 - MR.maintenance).toFixed(2)}) = $${$2(callPrice)}. If Brightcup falls ${pc(1 - callPrice / S, 1)}, from $${$2(S)} to $${$2(callPrice)}, his equity is $${$(n * callPrice - L)}, a quarter of the $${$(n * callPrice)} the shares are then worth, and his broker calls.` },
    { h: 'Leverage magnifies returns' },
    { p: `Over a year, with interest of ${pc(MR.loanRate, 0)} on the $${$(L)} loan ($${$(interest)}), a 10% rise to $${$2(endUp)} leaves Hollis with equity of $${$(eqUp)}: a return of ${pc(rUp)} on his $${$(E)}. A 10% fall to $${$2(endDown)} leaves $${$(eqDown)}: ${pc(rDown)}. The shares moved 10% either way; his money moved ${pc(rUp)} and ${pc(rDown)}. He needs Brightcup above $${$2(breakEven)} just to cover the interest.` },
    { math: String.raw`r_E = \frac{V\,r_A - L\,i}{E} = r_A + \frac{L}{E}\,(r_A - i)` },
    { p: 'This is the same arithmetic as the financial leverage of F05: borrowing adds to the return on equity whenever the asset earns more than the interest rate, and subtracts from it when it earns less. With half the cost borrowed, the equity moves twice as far as the asset, and the interest is a drag in every outcome.' },
  ],
  theory: [
    { h: 'Short selling' },
    { p: `A <g>short sale</g> sells shares the seller does not own. The broker borrows them from another client or a lender, the short seller sells them and receives the cash, and later buys the shares back to return them. The short seller profits if the price falls between the sale and the purchase. Hollis’s friend sells ${$(n)} Brightcup shares short at $${$2(S)}, receiving $${$(V)}.` },
    { p: `The proceeds stay in the account as collateral, and Regulation T requires a further ${pc(MR.initial, 0)} of the sale value: $${$(V * MR.initial)}, so the account holds $${$(shortAcct)}. The short seller’s equity is the account less the cost of buying the shares back. FINRA’s minimum maintenance margin for short positions is ${pc(MR.shortMaintenance, 0)} of the shares’ value for most shares, so a call comes when:` },
    { math: String.raw`\frac{A - nP}{nP} < m_s \;\Longrightarrow\; P^* = \frac{A}{n\,(1 + m_s)}` },
    { p: `With A = $${$(shortAcct)}: P* = ${$(shortAcct)} ÷ (${$(n)} × 1.30) = $${$2(shortCall)}. A rise of ${pc(shortCall / S - 1)} brings a call.` },
    { h: 'What a short seller pays' },
    { list: [
      `<b>A fee to borrow the shares</b>, usually small for widely held shares (say 1% a year: $${$(feeHalf)} for six months on $${$(V)}) but sometimes very high for shares that many people want to short.`,
      `<b>Any dividends</b> paid while the shares are borrowed, which go to the lender. Brightcup pays $${$2(0.85)} a share in ${O.dividendMonth}; a short position held over that date owes $${$(0.85 * n)}.`,
      '<b>The risk of recall.</b> The lender can ask for its shares back, and if no other lender can be found, the position must be closed, perhaps at a bad price.',
    ] },
    { p: `If Brightcup falls to $36 in six months, the short seller gains ($${$2(S)} − $36) × ${$(n)} less the $${$(feeHalf)} fee: $${$(shortGain36)}. If it rises to $50, the loss is $${$(shortLoss50)} including the fee. And there is no limit: a share can rise without limit, so a short seller’s loss can exceed the whole account. When many short sellers rush to buy back at once, pushing the price up further, the result is a <g>short squeeze</g>.` },
    { h: 'The other side: lending shares' },
    { p: 'The shares a short seller borrows come from somewhere. Pension funds, index funds and insurers lend shares from their portfolios through securities lending programmes, receiving cash or other securities as collateral and a fee. The lender keeps the economic exposure to the share: it is paid the equivalent of any dividends, and can recall the shares. For index funds the fees are a small but steady source of income that helps keep their charges low. For Hollis, it means that the shares in his margin account may be lent out by his broker, as most margin agreements allow.' },
    { h: 'Why short selling matters' },
    { p: 'Short selling lets investors who think a share is overpriced act on that view, and so helps prices reflect bad news as well as good. Short sellers have exposed accounting frauds, and the reverse cash-and-carry trades of lesson 3 and the reversals of lesson 6 need short sales to work. Regulators have at times restricted it during crises, and studies of those bans generally found that markets became less liquid and prices less informative. Index futures and put options give much the same exposure as a short sale without borrowing shares.' },
    { h: 'Leverage across instruments' },
    { table: {
      caption: 'Leverage in the positions of this course (approximate)',
      head: ['Position', 'Cash committed', 'Exposure', 'Exposure ÷ cash'],
      rows: [
        ['Shares bought outright', '$42,000', '$42,000', '1.0'],
        [`Shares on ${pc(MR.initial, 0)} margin`, `$${$(E)}`, `$${$(V)}`, (V / E).toFixed(1)],
        ['One Green Coffee futures contract', `$${$(K.futures.initial)} margin`, `$${$(K.futures.size * K.futures.price)}`, futLev.toFixed(1)],
        ['$42 Brightcup call, 10 contracts', `$${$(Q[42].call * n)} premium`, `${$(n)} shares ($${$(V)})`, (V / (Q[42].call * n)).toFixed(1)],
      ],
      align: ['l', 'r', 'r', 'r'],
    } },
    { p: `Leverage is not only about the ratio. A margin loan or a futures position can lose more than the cash committed, and brings margin calls along the way. A bought option can lose only its premium, but loses it all if the share does not move: the call that returns ${pc(callAt50, 0)} if Brightcup reaches $50 returns −100% if it ends below $42.` },
    { h: 'How margins are set' },
    { p: 'The fixed percentages of Regulation T and FINRA are minimums for ordinary retail accounts. Futures exchanges set margins from the risk of each contract, as lesson 2 showed, and change them as volatility changes. Larger investors may qualify for portfolio margin, which sets the requirement from the worst loss the whole account could suffer in a set of price scenarios, so that hedged positions need less margin than the same positions held separately. The logic is the stress testing of the next lesson: margin is the cash needed to cover a bad day.' },
    { h: 'Margin calls and liquidity spirals' },
    { p: 'Margin calls turn falling prices into forced selling. When prices fall, leveraged investors receive calls; those who cannot pay must sell; their sales push prices down further, bringing more calls. Lenders also tend to raise margins when markets are volatile, which forces more selling just when buyers are scarce. This feedback, a liquidity spiral, has deepened many market falls, from 1929, when shares bought with small margins were sold off as prices collapsed, to the collapse of the hedge fund Long-Term Capital Management in 1998 and the crisis of 2008. Lesson 2’s energy companies in 2022 faced the same mechanism in futures markets. For any leveraged position the question is not only “what if I am wrong?” but “can I meet the calls while I wait to be right?”' },
  ],
  formulas: [
    { id: 'ml-call', name: 'Margin call price, long position',
      tex: String.raw`P^* = \frac{L}{n(1-m)}`,
      where: [[String.raw`P^*`, 'Share price at which a margin call comes', '$'], [String.raw`L`, 'Amount borrowed', '$'], [String.raw`n`, 'Number of shares', ''], [String.raw`m`, 'Maintenance margin', '']] },
    { id: 'ml-return', name: 'Return on equity with borrowing',
      tex: String.raw`r_E = r_A + \frac{L}{E}(r_A - i)`,
      where: [[String.raw`r_E`, 'Return on the investor’s equity', ''], [String.raw`r_A`, 'Return on the shares', ''], [String.raw`L,\ E`, 'Loan and equity at the start', '$'], [String.raw`i`, 'Interest rate on the loan for the period', '']],
      assumptions: 'Ignores dividends; interest paid at the end.' },
    { id: 'ml-short', name: 'Margin call price, short position',
      tex: String.raw`P^* = \frac{A}{n(1+m_s)}`,
      where: [[String.raw`P^*`, 'Share price at which a margin call comes', '$'], [String.raw`A`, 'Account balance: sale proceeds plus margin deposited', '$'], [String.raw`n`, 'Number of shares sold short', ''], [String.raw`m_s`, 'Maintenance margin for short positions', '']] },
  ],
  examples: [
    { level: 'simple', title: 'Hollis’s margin call price', fictional: true,
      setup: `Hollis buys ${$(n)} Brightcup shares at $${$2(S)} with ${pc(MR.initial, 0)} initial margin. The maintenance margin is ${pc(MR.maintenance, 0)}. At what price does a margin call come?`,
      steps: [
        `Cost ${$(V)}; equity ${$(E)}; loan ${$(L)}.`,
        `P* = ${$(L)} ÷ (${$(n)} × (1 − ${MR.maintenance})) = ${$2(callPrice)}.`,
        `Check at $${$2(callPrice)}: shares ${$(n * callPrice)}, equity ${$(n * callPrice - L)}, margin ${pc((n * callPrice - L) / (n * callPrice), 0)}.`,
      ],
      answer: `$${$2(callPrice)}, a fall of ${pc(1 - callPrice / S, 1)}.`,
      interpretation: 'Brightcup’s simulated history in F06 includes single months in which the share fell more than 15%; a fall of a third within a year is unusual but far from impossible.' },
    { level: 'challenging', title: 'The return on a margin purchase', fictional: true,
      setup: `With the same purchase, interest at ${pc(MR.loanRate, 0)} a year, find Hollis’s return on equity after one year if Brightcup rises 10% and if it falls 10%, and the price he needs to break even. Ignore dividends.`,
      steps: [
        `Interest: ${$(L)} × ${MR.loanRate} = ${$(interest)}.`,
        `Up 10% to ${$2(endUp)}: equity ${$(n * endUp)} − ${$(L)} − ${$(interest)} = ${$(eqUp)}; return ${pc(rUp)}.`,
        `Down 10% to ${$2(endDown)}: equity ${$(n * endDown)} − ${$(L + interest)} = ${$(eqDown)}; return ${pc(rDown)}.`,
        `Formula check: r<sub>E</sub> = r<sub>A</sub> + (L/E)(r<sub>A</sub> − i) = 0.10 + 1 × (0.10 − 0.08) = 12%.`,
        `Break-even: (${$(E)} + ${$(L)} + ${$(interest)}) ÷ ${$(n)} = ${$2(breakEven)}.`,
      ],
      answer: `${pc(rUp)} and ${pc(rDown)}; break-even $${$2(breakEven)}.`,
      interpretation: 'The losses are larger than the gains for moves of the same size, because the interest is owed either way.' },
    { level: 'applied', title: 'The friend’s short sale', fictional: true,
      setup: `Hollis’s friend sells ${$(n)} Brightcup short at $${$2(S)} with ${pc(MR.initial, 0)} margin, a ${pc(MR.shortMaintenance, 0)} maintenance margin and a 1% a year borrowing fee. Find the margin call price and the result after six months at $36 and at $50.`,
      steps: [
        `Account: ${$(V)} proceeds + ${$(V * MR.initial)} margin = ${$(shortAcct)}.`,
        `P* = ${$(shortAcct)} ÷ (${$(n)} × 1.30) = ${$2(shortCall)}.`,
        `Fee for six months: ${$(V)} × 1% ÷ 2 = ${$(feeHalf)}.`,
        `At $36: (42 − 36) × ${$(n)} − ${$(feeHalf)} = ${$(shortGain36)}. At $50: −(50 − 42) × ${$(n)} − ${$(feeHalf)} = −${$(shortLoss50)}.`,
      ],
      answer: `Call above $${$2(shortCall)}; +$${$(shortGain36)} at $36, −$${$(shortLoss50)} at $50.`,
      interpretation: 'Holding past June would also cost the $850 dividend. A put would give similar exposure with a known maximum loss.' },
  ],
  demo: [
    { widget: 'ml-margin', intro: 'Hollis’s margin purchase. Change how much he borrows, the interest rate and Brightcup’s price in a year, and compare his return with buying for cash.' },
    { widget: 'ml-short', intro: 'The short sale. Move Brightcup’s price and the time held, and see the profit, the costs and how close the position is to a margin call.' },
  ],
  mistakes: [
    { title: 'Measuring return on the whole position', html: 'With borrowing, the investor’s return is on equity: the change in equity divided by the cash put up, after interest.' },
    { title: 'Forgetting interest and fees', html: 'Margin loans charge interest whether the trade wins or loses; short sales pay a borrowing fee and any dividends.' },
    { title: 'Using the initial margin for the call price', html: 'Calls come when equity falls below the maintenance margin, not the initial margin.' },
    { title: 'Thinking a short seller’s loss is limited', html: 'A price can rise without limit, so a short position can lose more than the account holds.' },
    { title: 'Ignoring the cash needed to survive', html: 'A leveraged position that would be right in the end can still be closed at a loss by margin calls along the way.' },
  ],
  application: [
    { p: 'Margin lending is a large business for brokers, and its total is watched as a gauge of investors’ appetite for risk: it tends to peak near market tops. Professional investors usually borrow more cheaply and on different terms, through prime brokers, and often take leverage through derivatives instead: futures, swaps that pay the return on a share, and options. Regulators set minimum margins for retail accounts, and exchanges and clearing houses set them for futures and options, raising them when markets become volatile.' },
    { p: 'Leverage taken through derivatives can be hard for lenders to see. In 2021 Archegos Capital, a private investment office, built very large positions in a few shares through swaps with several banks, each of which saw only its own part. When the shares fell, Archegos could not meet the margin calls, and the banks sold the shares they held as hedges into a falling market; together they lost billions of dollars. It is the liquidity spiral again, made worse by leverage no single lender could measure.' },
    { p: 'For a business, the lesson carries over to any borrowing secured on assets whose value moves. A loan with a covenant tied to a market value, like a margin loan, can demand cash at the worst time. Ana’s caution about Coastline’s current-ratio covenant in F07 is the same instinct.' },
    { case: `Ana tells Hollis that a margin call would come at $${$2(callPrice)}, a fall Brightcup could easily make in a bad year, and that his ${$(n)} existing shares are already hedged with puts. He buys 500 more shares for cash instead. His friend switches from a short sale to buying puts: the most he can lose is the premium. Both now want to know how much the whole portfolio could lose, which is the subject of the last lesson.` },
  ],
  summary: [
    'A margin purchase borrows part of the cost; equity = value of shares − loan; margin = equity ÷ value.',
    'Regulation T requires 50% initial margin on shares; FINRA’s minimum maintenance margin is 25% for long positions and 30% for most short positions.',
    'A margin call comes at P* = L ÷ n(1 − m) for a long position and P* = A ÷ n(1 + m<sub>s</sub>) for a short.',
    'Leverage magnifies returns: r<sub>E</sub> = r<sub>A</sub> + (L/E)(r<sub>A</sub> − i).',
    'Short sellers borrow and sell shares, pay fees and dividends, and face unlimited losses and recall risk.',
    'Margin calls force selling into falling markets: leverage can turn a price fall into a liquidity crisis.',
  ],
  glossary: [
    { term: 'Margin account', def: 'A brokerage account in which the investor may borrow from the broker to buy securities, or borrow securities to sell short, with the account’s assets as collateral.' },
    { term: 'Short sale', def: 'The sale of securities the seller has borrowed, in the expectation of buying them back later at a lower price to return to the lender.' },
    { term: 'Short squeeze', def: 'A rapid rise in a share’s price driven by short sellers buying it back to close their positions, often forced by margin calls or recalls.' },
    { term: 'Liquidity spiral', def: 'A feedback loop in which falling prices bring margin calls, forced sales push prices down further, and higher margins force more sales.' },
  ],
  references: [
    { text: 'FINRA. “Purchasing on Margin, Risks Involved with Trading in a Margin Account”. FINRA Investor Insights.', url: 'https://www.finra.org/investors/insights/margin-accounts' },
    { text: 'Brunnermeier, M. K. &amp; Pedersen, L. H. (2009). Market liquidity and funding liquidity. <i>The Review of Financial Studies</i>, 22(6), 2201–2238.', url: 'https://doi.org/10.1093/rfs/hhn098' },
  ],
  checks: [
    { what: 'Cost', value: V, shown: 42000 },
    { what: 'Equity', value: E, shown: 21000 },
    { what: 'Loan', value: L, shown: 21000 },
    { what: 'Call price', value: callPrice, shown: 28, tol: 0.005 },
    { what: 'Fall to call', value: (1 - callPrice / S) * 100, shown: 33.3, tol: 0.05 },
    { what: 'Equity at call', value: n * callPrice - L, shown: 7000, tol: 0.5 },
    { what: 'Value at call', value: n * callPrice, shown: 28000, tol: 0.5 },
    { what: 'Interest', value: interest, shown: 1680 },
    { what: 'End up', value: endUp, shown: 46.2, tol: 0.005 },
    { what: 'End down', value: endDown, shown: 37.8, tol: 0.005 },
    { what: 'Equity up', value: eqUp, shown: 23520, tol: 0.5 },
    { what: 'Equity down', value: eqDown, shown: 15120, tol: 0.5 },
    { what: 'Return up', value: rUp * 100, shown: 12, tol: 0.05 },
    { what: 'Return down', value: rDown * 100, shown: -28, tol: 0.05 },
    { what: 'Break-even', value: breakEven, shown: 43.68, tol: 0.005 },
    { what: 'Value up', value: n * endUp, shown: 46200, tol: 0.5 },
    { what: 'Value down', value: n * endDown, shown: 37800, tol: 0.5 },
    { what: 'Loan plus interest', value: L + interest, shown: 22680 },
    { what: 'Short margin', value: V * MR.initial, shown: 21000 },
    { what: 'Short account', value: shortAcct, shown: 63000 },
    { what: 'Short call', value: shortCall, shown: 48.46, tol: 0.005 },
    { what: 'Short rise', value: (shortCall / S - 1) * 100, shown: 15.4, tol: 0.05 },
    { what: 'Fee', value: feeHalf, shown: 210 },
    { what: 'Short gain', value: shortGain36, shown: 5790 },
    { what: 'Short loss', value: shortLoss50, shown: 8210 },
    { what: 'Dividend owed', value: 0.85 * n, shown: 850 },
    { what: 'Margin leverage', value: V / E, shown: 2, tol: 0.05 },
    { what: 'Futures leverage', value: futLev, shown: 12.8, tol: 0.05 },
    { what: 'Call premium', value: Q[42].call * n, shown: 3990, tol: 0.5 },
    { what: 'Call leverage', value: V / (Q[42].call * n), shown: 10.5, tol: 0.05 },
    { what: 'Call return', value: callAt50 * 100, shown: 101, tol: 0.5 },
  ],
};
