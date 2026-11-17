// pricing-by-no-arbitrage.js — F08 · Pricing by no arbitrage. Content only; exercises are in pricing-by-no-arbitrage.ex.js.
// Figures from case.js: EURO (spot, dollar and euro rates), DERIVED.euroForward and euroBank (Coastline's quote),
// COFFEE.futures and storagePV (the fictional exchange coffee and its carrying costs); Brightcup's price and dividend
// from F06's COMPANIES.
import { EURO as E, COFFEE as K, DERIVED as D } from './case.js?v=40';
import { COMPANIES } from '../f06/case.js?v=40';
import { forwardPrice, fxForward, forwardValue } from '../../../core/derivatives.js?v=40';

const $ = (x) => Math.round(x).toLocaleString('en-US');
const $2 = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const r4 = (x) => x.toFixed(4);
const r = E.rUsd, T = E.T;
// coffee: cost of carry and an arbitrage
const S = K.futures.price, U = K.storagePV, Fc = D.coffeeForward;
const Fmkt = 6.80, arbKg = Fmkt - Fc, arbContract = arbKg * K.futures.size;
const borrowed = (S + U) * K.futures.size, repay = borrowed * (1 + r) ** T;
// the euro
const Ffx = D.euroForward, Fq = D.euroBank;
const eurToday = E.amount / (1 + E.rEur) ** T, usdToday = eurToday * E.spot, usdAtT = usdToday * (1 + r) ** T;
const margin = (Fq - Ffx) * E.amount;
const later = 1.1000, valueLater = forwardValue({ F: later, K: Fq, r, T: 0.25 }) * E.amount;
// Brightcup: a forward on a share that pays a dividend
const B = COMPANIES.brightcup, bT = 0.75, div = B.dps, divPV = div / (1 + r) ** (4 / 12);
const Fb = forwardPrice({ S: B.price, r, T: bT, income: divPV }), FbNoDiv = forwardPrice({ S: B.price, r, T: bT });

export default {
  slug: 'pricing-by-no-arbitrage',
  title: 'Pricing by no arbitrage',
  blurb: 'A forward price is not a forecast. It is set by what it costs to buy the asset now and hold it until delivery, because any other price would let a trader make money with no risk. Price forwards on coffee, on a share and on the euro this way, check Coastline’s quote, and value a forward after the market has moved.',
  status: 'draft',
  objectives: [
    'Explain the no-arbitrage argument that ties a forward price to the spot price, and the cash-and-carry trades that enforce it.',
    'Calculate forward prices from the cost of carry, allowing for income from the asset, storage costs and interest.',
    'Price a currency forward by interest-rate parity, and build the same hedge from spot currency and money-market deposits.',
    'Calculate the value of an existing forward contract after the forward price has moved.',
    'Explain why a forward price is not the market’s forecast of the future spot price, and why commodity forwards can sit below full carry.',
  ],
  prerequisites: [
    { lesson: 'f08/forwards-and-futures', why: 'What forwards and futures are, and their payoffs at maturity.' },
    { lesson: 'f00/decision-principles', why: 'The idea of arbitrage, and why identical cash flows must have the same price.' },
    { lesson: 'f04/present-and-future-value', why: 'Growing and discounting amounts at an interest rate.' },
  ],
  case: 'lantern',
  concept: [
    { case: `Coastline has quoted Lantern $${r4(Fq)} a euro for €${$(E.amount)} on ${E.due}. The euro costs $${r4(E.spot)} today. Ana wonders why the forward rate is higher than today’s: does the bank expect the euro to rise? And is $${r4(Fq)} a fair price, or is she paying too much? On Coastline’s website she finds the rates it pays and charges: ${(r * 100).toFixed(1)}% a year on dollars and ${(E.rEur * 100).toFixed(1)}% on euros, both compounded annually. That is enough to answer both questions.` },
    { h: 'Two ways to own the asset later' },
    { p: 'Suppose someone wants to own one unit of an asset that pays no income, such as standard-grade green coffee, in six months. There are two ways. They can agree a forward today at price <i>F</i> and pay <i>F</i> in six months. Or they can borrow the spot price <i>S</i> today, buy the asset and store it, and repay the loan with interest in six months, <i>S</i>(1 + <i>r</i>)<sup><i>T</i></sup>. Both end with the asset in six months and nothing else, so they must cost the same; otherwise a trader could do one and the reverse of the other and keep the difference with no risk and none of their own money. That is an <g>arbitrage</g>, and the forward price that prevents it is the <g>no-arbitrage price</g>.' },
    { math: String.raw`F_0 = S_0\,(1+r)^T` },
    { p: 'The rule has a natural reading: the forward price is the spot price plus the cost of carrying the asset until delivery. The <g>cost of carry</g> is the interest on the money tied up, plus the cost of storing and insuring the asset, less any income it pays while held.' },
    { math: String.raw`F_0 = \big(S_0 - I + U\big)(1+r)^T` },
    { p: `Here <i>I</i> is the present value of income from the asset (dividends on a share, coupons on a bond) and <i>U</i> the present value of storage and insurance. For the fictional exchange coffee, spot is $${$2(S)} a kg, storage and insurance for six months cost $${$2(U)} a kg in present value, and the dollar rate is ${(r * 100).toFixed(1)}%. The six-month forward price is ($${$2(S)} + $${$2(U)}) × 1.045<sup>0.5</sup> = $${r4(Fc)} a kg.` },
    { h: 'What happens if the price is wrong' },
    { p: `Suppose the six-month coffee forward traded at $${$2(Fmkt)}, above $${r4(Fc)}. A trader could sell it and carry the coffee to meet the sale: the <g>cash-and-carry arbitrage</g>.` },
    { table: {
      caption: 'Cash-and-carry on one contract (5,000 kg), with the forward at $6.80 (dollars)',
      head: ['', 'Today', 'In six months'],
      rows: [
        ['Borrow (6.40 + 0.08) × 5,000 at 4.5%', $2(borrowed), `(${$2(repay)})`],
        ['Buy 5,000 kg spot and pay for storage', `(${$2(borrowed)})`, ''],
        ['Sell forward at $6.80 and deliver the coffee', '', $2(Fmkt * K.futures.size)],
      ],
      foot: [['<b>Net</b>', '<b>0.00</b>', `<b>${$2(Fmkt * K.futures.size - repay)}</b>`]],
      align: ['l', 'r', 'r'],
      note: 'No money is needed today and the profit in six months is certain: (6.80 − 6.6242) × 5,000.',
    } },
    { p: `The profit is $${$2(Fmkt * K.futures.size - repay)} a contract, ($${$2(Fmkt)} − $${r4(Fc)}) × ${$(K.futures.size)}, and every trader who sees it will sell forwards and buy spot until the prices come back into line. If the forward were too low, the trade would run the other way: sell the asset short (or sell coffee from inventory), invest the money and buy forward. This <g>reverse cash-and-carry</g> pushes a forward price that is too low back up. Arbitrage does not need everyone to agree on where coffee is going; it needs only a few traders able to borrow, store and sell.` },
  ],
  theory: [
    { h: 'A forward on a share that pays a dividend' },
    { p: `A share pays dividends to whoever holds it, so a trader who carries a share earns the dividend and the forward price is lower by its value. Brightcup Coffee’s shares trade at $${$2(B.price)} (F06) and it is due to pay a dividend of $${$2(div)} in four months. Its present value is $${$2(div)} ÷ 1.045<sup>4/12</sup> = $${$2(divPV)}, so the nine-month forward price is ($${$2(B.price)} − $${$2(divPV)}) × 1.045<sup>0.75</sup> = $${$2(Fb)}. Without the dividend it would be $${$2(FbNoDiv)}.` },
    { h: 'Continuous compounding' },
    { p: 'Many textbooks and traders use continuously compounded rates, which make the formulas tidy. With a continuous rate <i>r</i> and income paid continuously at a yield <i>q</i> (a share index’s dividends, or a foreign currency’s interest rate), the forward price is:' },
    { math: String.raw`F_0 = S_0\,e^{(r-q)T}` },
    { p: 'The idea is the same: the forward price grows from the spot price at the cost of carry, here <i>r</i> − <i>q</i>. Use whichever compounding the rates are quoted in; this lesson uses annual rates, as Coastline quotes them.' },
    { h: 'Currencies: interest-rate parity' },
    { p: 'For a currency, the “income” from holding it is the interest it earns. Holding euros for six months earns the euro rate; the dollars used to buy them would have earned the dollar rate. Comparing the two ways of having €1 in six months gives <g>covered interest-rate parity</g>, with exchange rates quoted in dollars a euro:' },
    { math: String.raw`F_0 = S_0 \times \frac{(1+r_{\text{USD}})^T}{(1+r_{\text{EUR}})^T}` },
    { p: `For Lantern: ${r4(E.spot)} × 1.045<sup>0.5</sup> ÷ 1.025<sup>0.5</sup> = $${r4(Ffx)} a euro. The euro trades at a <g>forward premium</g> to the dollar, not because anyone expects it to rise, but because dollar interest rates are higher than euro rates: someone who holds euros instead of dollars gives up interest, and the forward rate compensates them.` },
    { p: `Coastline’s $${r4(Fq)} is ${((Fq - Ffx) * 1e4).toFixed(0)} hundredths of a cent above the parity rate, a margin of $${$(margin)} on €${$(E.amount)}. That is the bank’s fee for the service. Ana can check it by building the hedge herself, a <g>money-market hedge</g>.` },
    { table: {
      caption: 'Lantern’s money-market hedge, built from spot euros and deposits',
      head: ['Step', 'Amount'],
      rows: [
        ['Euros to deposit today so they grow to €38,000 at 2.5%: 38,000 ÷ 1.025<sup>0.5</sup>', `€${$2(eurToday)}`],
        ['Dollars to buy them at today’s $1.0800', `$${$2(usdToday)}`],
        ['Borrow those dollars at 4.5% for six months; repay', `$${$2(usdAtT)}`],
        ['Effective rate fixed for 31 March: repayment ÷ 38,000', `$${r4(usdAtT / E.amount)}`],
      ],
      align: ['l', 'r'],
    } },
    { p: `Building it herself fixes $${$2(usdAtT)}, against $${$(D.euroBankCost)} with Coastline’s forward. In practice she would not get Coastline’s deposit rate on euros and its lending rate on dollars at the same time, and the paperwork would cost more than $${$(margin)}, so the forward is the sensible choice. The parity calculation tells her the quote is fair.` },
    { h: 'The value of a forward after the market moves' },
    { p: 'A forward is worth nothing on the day it is agreed. Afterwards it gains or loses value as the forward price for the same date moves. The holder of a long forward with delivery price <i>K</i> could, at any time <i>t</i>, sell a new forward for the same date at today’s forward price <i>F<sub>t</sub></i>. The two together fix a payment of <i>F<sub>t</sub></i> − <i>K</i> at maturity, whatever happens, so that is what the old forward is worth, discounted to today.' },
    { math: String.raw`f_t = \frac{F_t - K}{(1+r)^{T-t}}\quad\text{(long; the short is the negative)}` },
    { p: `Three months later, at the end of December, suppose the forward rate for 31 March has risen to $${later.toFixed(4)}. Lantern’s forward at $${r4(Fq)} is then worth (${later.toFixed(4)} − ${r4(Fq)}) × ${$(E.amount)} ÷ 1.045<sup>0.25</sup> = $${$2(valueLater)}. This is the figure Lantern would record if it accounted for the forward at fair value, and the amount Coastline would want as security if it were the other way round.` },
    { h: 'Forward prices and expected prices' },
    { p: 'Nothing in the no-arbitrage argument mentions what anyone expects. The forward price is fixed by today’s spot price, interest rates and carrying costs. Whether the euro will in fact be above or below $1.0905 in March depends on events that the forward price does not predict. Studies of currency markets find that forward rates are poor forecasts of future spot rates. A business should not read a forward premium as a forecast, nor choose whether to hedge because it thinks the forward rate is “too high”.' },
    { h: 'Arbitrage in practice: a band, not a line' },
    { p: 'Real traders pay to trade. They borrow at a higher rate than they can lend at, buy at the ask and sell at the bid, pay brokers and, to sell short, pay to borrow the asset. Each cost makes the arbitrage a little less profitable, so the forward price can drift a little way from the textbook price in either direction before anyone can profit from correcting it. The no-arbitrage price becomes a band:' },
    { math: String.raw`S_0\,(1+r_{\text{lend}})^T - c \;\le\; F_0 \;\le\; S_0\,(1+r_{\text{borrow}})^T + c` },
    { p: 'Here <i>c</i> stands for trading costs. For assets that large institutions trade cheaply in huge amounts, such as share indexes, government bonds and the main currencies, the band is very narrow, and the textbook price is a good guide. For a thinly traded commodity, or an asset that is hard to sell short, the band is wider. Lantern itself cannot arbitrage Coastline’s quote; it can only compare it with the band and decide whether the bank’s margin is reasonable.' },
    { h: 'Commodities and convenience yield' },
    { p: 'For commodities that people consume, the forward price can sit below the full cost of carry, and the reverse cash-and-carry may not correct it. Arbitrage would need someone to sell coffee they hold and buy it back forward, but a roaster holds coffee to keep roasting, not to trade it. Holding the physical commodity has a value to such users, the <g>convenience yield</g>: protection against running out when supplies are short. When stocks are low, the convenience yield is high and forward prices can be below spot, a pattern called <g>backwardation</g>. When stocks are ample, forward prices sit near full carry, above spot: <g>contango</g>.' },
  ],
  formulas: [
    { id: 'na-carry', name: 'Forward price by cost of carry',
      tex: String.raw`F_0 = (S_0 - I + U)(1+r)^T`,
      where: [[String.raw`F_0`, 'Forward price today for delivery at T', '$'], [String.raw`S_0`, 'Spot price today', '$'], [String.raw`I`, 'Present value of income from the asset before delivery', '$'], [String.raw`U`, 'Present value of storage and insurance costs', '$'], [String.raw`r`, 'Interest rate a year (annual compounding)', ''], [String.raw`T`, 'Time to delivery', 'years']],
      assumptions: 'Traders can borrow and lend at r, and buy, store and sell the asset; for a consumption commodity the price may be lower (convenience yield).' },
    { id: 'na-cont', name: 'Forward price, continuous rates',
      tex: String.raw`F_0 = S_0\,e^{(r-q)T}`,
      where: [[String.raw`F_0`, 'Forward price today', '$'], [String.raw`S_0`, 'Spot price today', '$'], [String.raw`r`, 'Continuously compounded interest rate', ''], [String.raw`q`, 'Continuous income yield (dividend yield, foreign interest rate)', ''], [String.raw`T`, 'Time to delivery', 'years']] },
    { id: 'na-irp', name: 'Covered interest-rate parity',
      tex: String.raw`F_0 = S_0\,\frac{(1+r_d)^T}{(1+r_f)^T}`,
      where: [[String.raw`F_0`, 'Forward rate, in domestic currency a unit of foreign', ''], [String.raw`S_0`, 'Spot rate, in domestic currency a unit of foreign', ''], [String.raw`r_d`, 'Domestic interest rate', ''], [String.raw`r_f`, 'Foreign interest rate', ''], [String.raw`T`, 'Time to delivery', 'years']],
      note: 'The currency with the higher interest rate trades at a forward discount.' },
    { id: 'na-value', name: 'Value of an existing long forward',
      tex: String.raw`f_t = \frac{F_t - K}{(1+r)^{T-t}}`,
      where: [[String.raw`f_t`, 'Value today of the long forward, a unit', '$'], [String.raw`F_t`, 'Today’s forward price for the same delivery date', '$'], [String.raw`K`, 'The contract’s delivery price', '$'], [String.raw`r`, 'Interest rate a year', ''], [String.raw`T-t`, 'Time left to delivery', 'years']] },
  ],
  examples: [
    { level: 'simple', title: 'A forward on Brightcup shares', fictional: true,
      setup: `Brightcup Coffee’s shares trade at $${$2(B.price)}. It will pay a dividend of $${$2(div)} in four months. The interest rate is 4.5% a year. Find the nine-month forward price.`,
      steps: [
        `Present value of the dividend: ${$2(div)} ÷ 1.045<sup>4/12</sup> = ${$2(divPV)}.`,
        `Spot less the dividend’s value: ${$2(B.price)} − ${$2(divPV)} = ${$2(B.price - divPV)}.`,
        `Grow at 4.5% for nine months: ${$2(B.price - divPV)} × 1.045<sup>0.75</sup> = ${$2(Fb)}.`,
      ],
      answer: `$${$2(Fb)} a share.`,
      interpretation: 'A buyer of the forward does not receive the dividend, so pays less than the full carry on $42.00.' },
    { level: 'challenging', title: 'An arbitrage in coffee', fictional: true,
      setup: `Standard-grade green coffee trades at $${$2(S)} a kg spot. Storage and insurance for six months cost $${$2(U)} a kg (present value). Dollars can be borrowed and lent at 4.5%. The six-month forward trades at $${$2(Fmkt)}. Is there an arbitrage, and how large is it on 5,000 kg?`,
      steps: [
        `No-arbitrage price: (${$2(S)} + ${$2(U)}) × 1.045<sup>0.5</sup> = ${r4(Fc)}.`,
        `The market price ${$2(Fmkt)} is higher, so sell forward and carry: borrow ${$2(borrowed)}, buy 5,000 kg and pay for storage.`,
        `In six months, deliver for ${$2(Fmkt * K.futures.size)} and repay ${$2(repay)}.`,
        `Profit: ${$2(Fmkt * K.futures.size - repay)}, with no money of one’s own and no risk.`,
      ],
      answer: `Yes: about $${$2(arbContract)} on 5,000 kg.`,
      interpretation: 'Selling forwards and buying spot pushes the forward price down and the spot price up until the profit disappears.' },
    { level: 'applied', title: 'Is Coastline’s quote fair?', fictional: true,
      setup: `Spot is $${r4(E.spot)} a euro, the dollar rate ${(r * 100).toFixed(1)}% and the euro rate ${(E.rEur * 100).toFixed(1)}% (annual). Coastline quotes $${r4(Fq)} for six months. Find the parity rate and the bank’s margin on €${$(E.amount)}.`,
      steps: [
        `Parity: ${r4(E.spot)} × 1.045<sup>0.5</sup> ÷ 1.025<sup>0.5</sup> = ${r4(Ffx)}.`,
        `Difference: ${r4(Fq)} − ${r4(Ffx)} = ${(Fq - Ffx).toFixed(6)} a euro.`,
        `On €${$(E.amount)}: ${$2(margin)} dollars.`,
      ],
      answer: `Parity gives $${r4(Ffx)}; Coastline’s margin is about $${$(margin)}, a small fee for the service.`,
      interpretation: 'The forward premium comes from the interest differential, not from a forecast; the bank’s margin is what Ana is really paying.' },
  ],
  demo: [
    { widget: 'na-fx', intro: 'Interest-rate parity for Lantern’s euros. Change the rates and the time to delivery and see the forward rate, and how it compares with Coastline’s quote.' },
    { widget: 'na-carry', intro: 'Cost of carry for the exchange coffee. Set the market’s forward price and see whether there is an arbitrage, which way it runs, and its profit on one contract.' },
  ],
  mistakes: [
    { title: 'Reading the forward price as a forecast', html: 'A currency forward is above spot when domestic rates are higher than foreign rates, whatever anyone expects. The forward price is set by carry, not by opinion.' },
    { title: 'Turning interest-rate parity upside down', html: 'With rates quoted in dollars a euro, multiply by (1 + dollar rate)<sup>T</sup> and divide by (1 + euro rate)<sup>T</sup>. Check the direction: the currency with the higher rate trades at a forward discount.' },
    { title: 'Forgetting income or storage', html: 'A share’s dividends lower its forward price; storage and insurance raise a commodity’s. Leaving them out misprices the forward and suggests arbitrage that is not there.' },
    { title: 'Mixing compounding conventions', html: 'Use (1 + r)<sup>T</sup> with annual rates and e<sup>rT</sup> with continuous ones. Mixing them creates errors of the size that traders call arbitrage.' },
    { title: 'Valuing an old forward at maturity prices without discounting', html: 'The gain F<sub>t</sub> − K is received at maturity; today’s value is its present value.' },
  ],
  application: [
    { p: 'Banks price currency forwards for customers in exactly this way: from the spot rate and the two currencies’ interest rates for the period, plus a margin. The difference between the forward and spot rates, quoted in small units called forward points, is published for each period alongside spot rates, and a business can check any quote against them. When large banks briefly found covered interest-rate parity failing, after 2008, it was because their own cost of borrowing and their limits on balance sheets stopped them from doing the arbitrage, not because the logic had changed.' },
    { p: 'Index arbitrage is the cost-of-carry model at work every second. Trading firms watch the futures price of a share index against the prices of the shares in it. When the futures price moves above the cost of carry on the shares (interest less dividends), they sell futures and buy the shares; when it falls below, they do the reverse. Their trades are so fast and cheap that index futures and their shares rarely drift apart by more than a few hundredths of a percent.' },
    { p: 'The cost-of-carry model also explains the shape of commodity futures prices from one delivery month to the next. A market in contango, with each month dearer than the last by about the cost of storage and interest, signals ample stocks. A market in backwardation signals a shortage that makes holding the physical commodity valuable now. Commodity traders watch these spreads as closely as the prices themselves.' },
    { case: `Ana accepts Coastline’s forward at $${r4(Fq)}: the margin of about $${$(margin)} is less than the cost of doing it herself. She also notes that Kilnworth’s fixed price of $37.50 a kg is not a forward on any traded asset, so no arbitrage pins it down; it reflects Kilnworth’s own costs and how much it charges to take Lantern’s risk. The next lesson turns to a contract that fixes interest rates: the swap.` },
  ],
  summary: [
    'A forward price is set by no arbitrage: buying forward must cost the same as buying now and carrying the asset to delivery.',
    'Cost of carry: F = (S − I + U)(1 + r)<sup>T</sup>, with I the present value of income and U of storage; with continuous rates, F = S e<sup>(r − q)T</sup>.',
    'If F is too high, sell forward and buy spot (cash-and-carry); if too low, sell spot and buy forward (reverse cash-and-carry).',
    'Covered interest-rate parity: F = S(1 + r<sub>d</sub>)<sup>T</sup> ÷ (1 + r<sub>f</sub>)<sup>T</sup>. The higher-rate currency trades at a forward discount.',
    'An existing long forward is worth (F<sub>t</sub> − K) ÷ (1 + r)<sup>T − t</sup>.',
    'Forward prices are not forecasts; for consumption commodities, convenience yield can hold them below full carry (backwardation).',
  ],
  glossary: [
    { term: 'No-arbitrage price', def: 'The price of a contract at which no trader can make a riskless profit, with none of their own money, by trading it against other assets.' },
    { term: 'Cost of carry', def: 'The net cost of holding an asset until a future date: interest on the money tied up, plus storage and insurance, less any income the asset pays.' },
    { term: 'Cash-and-carry arbitrage', def: 'Borrowing to buy an asset spot, holding it and selling it forward, when the forward price is above the spot price plus the cost of carry.' },
    { term: 'Reverse cash-and-carry', def: 'Selling an asset spot (often short), investing the proceeds and buying it forward, when the forward price is below the spot price plus the cost of carry.' },
    { term: 'Covered interest-rate parity', def: 'The no-arbitrage relation between spot and forward exchange rates: the forward rate equals the spot rate times the ratio of the two currencies’ interest growth factors over the period.' },
    { term: 'Forward premium', def: 'The amount by which a currency’s forward rate exceeds its spot rate (a forward discount if below).' },
    { term: 'Money-market hedge', def: 'A currency hedge built from spot exchange and borrowing and lending in the two currencies, which fixes the same rate as a forward.' },
    { term: 'Convenience yield', def: 'The benefit of holding a physical commodity rather than a forward contract on it, such as protection against a shortage; it can hold forward prices below full carry.' },
    { term: 'Contango', def: 'A pattern of futures prices that rise with the delivery date, typically by about the cost of carry.' },
    { term: 'Backwardation', def: 'A pattern of futures prices that fall with the delivery date, below the spot price, typically when stocks are short and convenience yield is high.' },
  ],
  references: [
    { text: 'Hull, J. C. (2022). <i>Options, Futures, and Other Derivatives</i> (11th ed.), chapter 5, “Determination of forward and futures prices”. Pearson.' },
    { text: 'Du, W., Tepper, A. &amp; Verdelhan, A. (2018). Deviations from covered interest rate parity. <i>The Journal of Finance</i>, 73(3), 915–957.', url: 'https://doi.org/10.1111/jofi.12620' },
  ],
  checks: [
    { what: 'Coffee forward', value: Fc, shown: 6.6242, tol: 0.00005 },
    { what: 'Borrowed', value: borrowed, shown: 32400, tol: 0.005 },
    { what: 'Repay', value: repay, shown: 33120.98, tol: 0.005 },
    { what: 'Sale', value: Fmkt * K.futures.size, shown: 34000 },
    { what: 'Arbitrage profit', value: Fmkt * K.futures.size - repay, shown: 879.02, tol: 0.005 },
    { what: 'Arbitrage per contract', value: arbContract, shown: 879.02, tol: 0.005 },
    { what: 'Dividend PV', value: divPV, shown: 0.84, tol: 0.005 },
    { what: 'Brightcup less dividend', value: B.price - divPV, shown: 41.16, tol: 0.005 },
    { what: 'Brightcup forward', value: Fb, shown: 42.54, tol: 0.005 },
    { what: 'Brightcup forward no dividend', value: FbNoDiv, shown: 43.41, tol: 0.005 },
    { what: 'Parity forward', value: Ffx, shown: 1.0905, tol: 0.00005 },
    { what: 'Bank quote', value: Fq, shown: 1.092, tol: 0.00005 },
    { what: 'Hundredths of a cent', value: (Fq - Ffx) * 1e4, shown: 15, tol: 0.5 },
    { what: 'Difference', value: Fq - Ffx, shown: 0.001514, tol: 0.0000005 },
    { what: 'Margin', value: margin, shown: 57.54, tol: 0.005 },
    { what: 'Euros today', value: eurToday, shown: 37533.72, tol: 0.005 },
    { what: 'Dollars today', value: usdToday, shown: 40536.42, tol: 0.005 },
    { what: 'Dollars at T', value: usdAtT, shown: 41438.46, tol: 0.005 },
    { what: 'Effective rate', value: usdAtT / E.amount, shown: 1.0905, tol: 0.00005 },
    { what: 'Bank cost', value: D.euroBankCost, shown: 41496 },
    { what: 'Value later', value: valueLater, shown: 300.67, tol: 0.005 },
  ],
};
