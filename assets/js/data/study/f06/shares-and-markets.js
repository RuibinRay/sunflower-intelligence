// shares-and-markets.js — F06 · Shares and markets. Content only; exercises are in shares-and-markets.ex.js.
// Morrow & Pike Roasters and Harbour Street Foods (fictional, F05's listed peers) come from case.js (COMPANIES, MARKET,
// ANA, ASSETS); market capitalisation and enterprise value from core/investments.js. Aldwick Rail, Brisa Telecom,
// Cobham Mills, Stoneleigh Foods Group and the Morrow & Pike quote ($27.98 bid, $28.02 ask) are fictional. Real-world
// statements are quoted from Investor.gov and S&P Dow Jones Indices pages opened on 11 November 2026.
import { COMPANIES, MARKET, ANA, ASSETS } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const MP = COMPANIES.morrow, HS = COMPANIES.harbour;
const evMP = IV.enterpriseValue({ marketCap: MP.marketCap, debt: MP.debt, cash: MP.cash });
const evHS = IV.enterpriseValue({ marketCap: HS.marketCap, debt: HS.debt, cash: HS.cash });
// the quote (fictional)
const Q = { bid: 27.98, ask: 28.02 };
const mid = (Q.bid + Q.ask) / 2;
// a three-company index (fictional)
const IX = [
  { name: 'Aldwick Rail', p0: 120, shares: 10, r: 0.10 },
  { name: 'Brisa Telecom', p0: 15, shares: 300, r: -0.02 },
  { name: 'Cobham Mills', p0: 40, shares: 50, r: 0.01 },
];
const sumP0 = IX.reduce((s, c) => s + c.p0, 0);
const sumP1 = IX.reduce((s, c) => s + c.p0 * (1 + c.r), 0);
const cap0 = IX.reduce((s, c) => s + c.p0 * c.shares, 0);
const cap1 = IX.reduce((s, c) => s + c.p0 * (1 + c.r) * c.shares, 0);
const divisor0 = sumP0 / 100;
const pwLevel1 = sumP1 / divisor0;
const sumAfterSplit = sumP1 - IX[0].p0 * (1 + IX[0].r) / 2;
const divisor1 = sumAfterSplit / pwLevel1;
// Morrow & Pike: what the price implies (Gordon, F04) at F05's CAPM rate
const rMP = IV.capm({ rf: MARKET.rf, beta: 0.90, mrp: MARKET.mrp });
const gImplied = (rMP * MP.price - MP.dps) / (MP.price + MP.dps);
// Stoneleigh's offer (fictional): 25% over the market price
const OFFER = MP.price * 1.25;
const offerEquity = OFFER * MP.shares;
const offerCost = offerEquity + MP.debt - MP.cash;

export default {
  slug: 'shares-and-markets',
  title: 'Shares and markets',
  blurb: 'What a share is, how shares are issued and traded, how an index is built, and what market capitalisation and enterprise value measure, using two listed coffee and food companies.',
  status: 'draft',
  objectives: [
    'Distinguish common and preferred shares by their claim on cash flows, their votes and their place in the queue if a company fails.',
    'Explain how primary and secondary markets, brokers, exchanges, market and limit orders and the bid–ask spread fit together.',
    'Calculate the return on a value-weighted and a price-weighted index, and explain why the two can differ sharply.',
    'Calculate market capitalisation and enterprise value from a company’s share price, shares, debt and cash.',
    'Explain what a share price reflects, and what can move it, in terms of expected cash flows and required returns.',
  ],
  prerequisites: [
    { lesson: 'f00/financial-markets', why: 'Primary and secondary markets, exchanges and over-the-counter markets were introduced there.' },
    { lesson: 'f00/market-participants', why: 'Brokers, dealers, market makers and the bid–ask spread.' },
    { lesson: 'f00/value-and-valuation-words', why: 'Book value, market capitalisation and enterprise value in words, with a first example.' },
    { lesson: 'f04/perpetuities-and-growth', why: 'The Gordon growth model, used here to read what a share price implies.' },
    { lesson: 'f05/cost-of-debt-and-equity', why: 'The cost of preferred stock and the capital asset pricing model as a tool.' },
  ],
  case: 'lantern',

  concept: [
    { case: `June 2028. Lantern Coffee Co. is in its third year, and Ana Lim is opening a retirement account. From 1 July 2028 it will hold $${ANA.retirement.lump.toLocaleString('en-US')} from her parents and $${ANA.retirement.monthly} a month from her salary, for about 30 years, until she retires. Her other money stays where it is: the $${ANA.deposit.monthly.toFixed(2)} a month she saves towards a $${ANA.deposit.target.toLocaleString('en-US')} flat deposit by ${ANA.deposit.needed} stays in her savings account, and her $${ANA.emergency.toLocaleString('en-US')} emergency fund stays in cash. Module 2 shows with data why money needed within a few years is not for shares. The retirement money is different: it can be invested for decades, and the obvious candidate is the ${ASSETS.market.name}, which holds ${ASSETS.market.holds}. Before choosing, Ana wants to understand what she would own.` },
    { p: 'A <g>share</g> is a unit of ownership in a company. If a company has 40 million shares and you own 400 of them, you own one hundred-thousandth of it: a hundred-thousandth of its votes and of whatever it pays its owners. Owners are not lenders. A lender has a contract that fixes interest and repayment; an owner has a <g>residual claim</g>, a right to what is left after everyone with a prior claim has been paid. That is why shares can lose much of their value in a bad year and gain a great deal in a good one, and why shareholders expect a higher return than lenders over time.' },
    { p: 'Shares are bought and sold in markets. A company sells new shares to raise money in the <g>primary market</g>; investors then trade those shares among themselves in the <g>secondary market</g>, where the company receives nothing. Most trading happens in the secondary market, through a <g>broker</g> that sends an investor’s orders to an <g>exchange</g> or another trading venue. The price at which shares change hands is the market’s current view of what one share is worth.' },
    { p: 'Multiply that price by the number of shares and you have the market value of the whole company’s equity, its <g>market capitalisation</g>. Add the company’s debt and subtract its cash and you have its <g>enterprise value</g>, the price of the business as a whole. An index such as the Harbourline Total Market Index adds up many companies’ market values to measure how the whole market is doing, and an index fund buys the shares in the index in proportion to those values.' },
    { table: {
      caption: 'Two listed companies, 31 December 2027 (fictional; $ millions except per share)',
      head: ['', 'Morrow & Pike Roasters', 'Harbour Street Foods'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Business', 'speciality roaster', 'packaged-food maker'],
        ['Share price', `$${MP.price.toFixed(2)}`, `$${HS.price.toFixed(2)}`],
        ['Shares outstanding (millions)', String(MP.shares), String(HS.shares)],
        ['Debt', String(MP.debt), HS.debt.toLocaleString('en-US')],
        ['Cash', String(MP.cash), String(HS.cash)],
        ['Dividend per share, 2027', `$${MP.dps.toFixed(2)}`, `$${HS.dps.toFixed(2)}`],
      ],
      note: 'The two companies are F05’s fictional listed peers of Lantern; every figure is invented for the course.',
    } },
    { callout: 'key', title: 'Owning a share means owning what is left', html: 'A shareholder gets nothing until lenders (and any preferred shareholders) have been paid, and then gets everything that remains. The share price is the market’s estimate of the value of that remainder, now and in the future. Everything in this course, from risk to valuation, builds on that idea.' },
  ],

  theory: [
    { h: 'Common shares and preferred shares' },
    { p: 'Most shares are <b>common shares</b> (ordinary shares in the UK). Investor.gov summarises their two rights: common stock entitles owners to vote at shareholder meetings and to receive dividends. The votes elect the board of directors, which appoints management and decides whether to pay <g>dividends</g> and how much. Nothing obliges the board to pay any: a dividend is a decision, not a debt. Common shareholders also have <g>limited liability</g>: if the company fails they can lose what they paid for their shares, but creditors cannot pursue them for more.' },
    { p: '<g>Preferred stock</g> sits between debt and common equity. It pays a fixed dividend, usually stated as a percentage of its par value, and, in Investor.gov’s words, preferred stockholders usually don’t have voting rights; in exchange they are paid their dividends before common shareholders, and they have priority over common stockholders if the company goes bankrupt and its assets are liquidated. Because the dividend is fixed and usually has no end date, F04 valued a preferred share as a perpetuity, and F05 turned that round into its cost, <m>r_P = D_P \\div P_P</m>. Preferred dividends, unlike interest, are not a contractual obligation whose non-payment is a <g>default</g>, so preferred shares carry more risk than the same company’s bonds.' },
    { figure: {
      svg: '<svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="16"><g fill="none" stroke-width="3"><rect x="20" y="34" width="170" height="64" style="stroke:var(--series-3)"/><rect x="20" y="116" width="170" height="64" style="stroke:var(--series-2)"/><rect x="20" y="198" width="170" height="64" style="stroke:var(--series-1)"/></g><g fill="currentColor"><text x="105" y="71" text-anchor="middle" font-weight="bold">Lenders</text><text x="105" y="153" text-anchor="middle" font-weight="bold">Preferred shares</text><text x="105" y="235" text-anchor="middle" font-weight="bold">Common shares</text><text x="210" y="61">Contract: interest</text><text x="210" y="83">and repayment</text><text x="210" y="143">Fixed dividend,</text><text x="210" y="165">usually no vote</text><text x="210" y="225">Votes, and</text><text x="210" y="247">whatever is left</text></g><g style="fill:var(--ink-3)"><text x="20" y="22">Paid first</text><text x="20" y="290">Paid last</text></g></svg>',
      caption: 'Who is paid first. Lenders are paid before preferred shareholders, who are paid before common shareholders. The lower a claim sits, the more risk it carries and the higher the return its holders require.',
      alt: 'Three stacked boxes between the words paid first, above, and paid last, below. The top box is lenders, with a contract for interest and repayment. The middle box is preferred shares, with a fixed dividend and usually no vote. The bottom box is common shares, which carry votes and receive whatever is left.',
    } },
    { p: 'In this course “shares” means common shares unless stated otherwise. Index funds such as the Harbourline fund hold common shares; the return a shareholder earns is the change in the price plus the dividends received, a <b>total return</b>, which the measuring-returns lesson in module 2 calculates.' },

    { h: 'Primary and secondary markets' },
    { p: 'F00 introduced the two markets. A company raises money only in the primary market: in an <g>initial public offering</g>, when it first sells shares to the public, or in a later sale of new shares. Suppose Morrow & Pike sold 2 million new shares to investors. It would receive the money (less its bankers’ fees), and its shares outstanding would rise from 40 million to 42 million. When one investor later sells 1,000 Morrow & Pike shares to another, the money passes between the two investors and Morrow & Pike’s bank balance does not change.' },
    { p: 'The secondary market still matters to the company. Investors pay more for new shares when they know they can sell them easily later, and the secondary-market price tells the company what its next issue would raise. A price that has fallen means each new share raises less money and existing owners give up a larger slice of the company for the same amount.' },

    { h: 'Brokers, exchanges and orders' },
    { p: 'An individual investor does not trade on an exchange directly. She opens an account with a broker, which acts as her agent: it takes her order and routes it to an exchange or another venue where it can be matched with an order on the other side. Ana’s retirement account will work the same way, except that she will mostly buy units of a fund, and the fund’s managers will do the trading in individual shares. The funds-and-indexing lesson in module 3 explains how funds are bought and priced.' },
    { p: 'At any moment a share has two prices. The <g>bid</g> is the highest price at which someone is currently willing to buy, and the <g>ask</g> is the lowest price at which someone is willing to sell. Suppose Morrow & Pike is quoted at a bid of $27.98 and an ask of $28.02 (fictional quotes). The <g>bid-ask spread</g> is <m>28.02 - 27.98 = 0.04</m> dollars, or <m>0.04 \\div 28.00 = 0.14\\%</m> of the midpoint. Someone who bought 100 shares at the ask and sold them straight back at the bid would lose $4.00 without the price moving at all: the spread is a cost of trading.' },
    { p: 'An investor chooses how her order is filled. Investor.gov defines the two basic kinds. A <g>market order</g> is “an order to buy or sell a security immediately”: a market order to buy Morrow & Pike would normally be filled at about the ask, $28.02, but the page warns that the last-traded price is not necessarily the price at which a market order will be executed, because prices can move before the order arrives. A <g>limit order</g> is “an order to buy or sell a security at a specific price or better”: a buy limit order at $28.00 will be filled only if someone will sell at $28.00 or less. A market order gives certainty of trading but not of price; a limit order gives certainty of price but not of trading.' },
    { table: {
      caption: 'Market and limit orders compared',
      head: ['', 'Market order', 'Limit order'],
      align: ['l', 'l', 'l'],
      rows: [
        ['What you specify', 'Buy or sell, and how many', 'Also the worst price you accept'],
        ['Executes', 'Immediately, if anyone is trading', 'Only at your price or better'],
        ['Risk', 'The price may move before it is filled', 'It may never be filled'],
        ['Suits', 'Large, frequently traded shares with narrow spreads', 'Thinly traded shares, wide spreads, fast-moving prices'],
      ],
    } },

    { h: 'Market capitalisation and enterprise value' },
    { p: 'A company’s <g>market capitalisation</g> is its share price times its shares outstanding. For Morrow & Pike, <m>28.00 \\times 40 = 1{,}120</m> million dollars; for Harbour Street, <m>18.00 \\times 120 = 2{,}160</m> million. A share price alone says nothing about size: Morrow & Pike’s shares cost more than Harbour Street’s, but Harbour Street’s equity is worth almost twice as much, because it has three times as many shares.' },
    { p: 'Market capitalisation prices only the equity. A buyer of the whole business would also take on its debt and receive its cash, so the price of the business is its <g>enterprise value</g>: market capitalisation plus debt minus cash. F00 explained why debt is added and cash subtracted; here are the two companies.' },
    { table: {
      caption: 'Market capitalisation and enterprise value, 31 December 2027 ($ millions; fictional)',
      head: ['', 'Morrow & Pike', 'Harbour Street'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Market capitalisation', MP.marketCap.toLocaleString('en-US'), HS.marketCap.toLocaleString('en-US')],
        ['+ Debt', String(MP.debt), HS.debt.toLocaleString('en-US')],
        ['− Cash', String(MP.cash), String(HS.cash)],
      ],
      foot: [['Enterprise value', evMP.toLocaleString('en-US'), evHS.toLocaleString('en-US')]],
      note: 'Debt ÷ market capitalisation is 0.15 for Morrow & Pike and 0.55 for Harbour Street, the market debt-to-equity ratios F05 used to unlever their betas.',
    } },
    { p: 'Harbour Street is about 1.9 times Morrow & Pike by market capitalisation (<m>2{,}160 \\div 1{,}120 = 1.93</m>) but 2.6 times by enterprise value (<m>3{,}288 \\div 1{,}258 = 2.61</m>), because it is financed with far more debt. Its net debt, <m>1{,}188 - 60 = 1{,}128</m> million, is 34.3% of its enterprise value; Morrow & Pike’s, <m>168 - 30 = 138</m> million, is 11.0%. Which measure to use depends on the question. For what the shareholders own, and for an index fund’s weights, use market capitalisation. For the size of the business or what it would cost to buy, use enterprise value; the relative-valuation lesson uses it to compare companies financed differently.' },

    { h: 'Stock market indexes' },
    { p: 'A <g>stock market index</g> measures the combined price movement of a group of shares, so that “the market rose 1% today” has a precise meaning. The group may be all the listed shares in a market, the largest companies, or one industry. S&P Dow Jones Indices describes the S&P 500 as including 500 leading US companies and covering approximately 80% of available market capitalisation. How the shares are weighted matters as much as which shares are included.' },
    { p: 'In a <g>value-weighted index</g> (also called capitalisation-weighted) each company counts in proportion to its market capitalisation, so the index’s return is the average of the companies’ returns weighted by their market values. The Harbourline Total Market Index in this course is value-weighted: Harbour Street, with $2,160 million of equity, moves it almost twice as much as Morrow & Pike, with $1,120 million. In a <g>price-weighted index</g> each company counts in proportion to its share price: the index is the sum of the prices divided by a number called the divisor. S&P Dow Jones Indices describes the Dow Jones Industrial Average as a price-weighted measure of 30 US blue-chip companies.' },
    { p: 'The two methods can tell very different stories on the same day. The challenging worked example below builds a three-company index in which a 10% rise in the smallest company lifts the price-weighted index by 6.91% and the value-weighted one by only 0.65%. Price-weighting gives most weight to whichever share happens to have the highest price, which depends on how many shares the company chose to issue, not on its size. A <g>stock split</g> shows the problem: when a company splits each share in two, its price halves and its weight in a price-weighted index halves too, although nothing about the company has changed, so the divisor must be reset to stop the index jumping. A value-weighted index needs no such adjustment, because the market capitalisation does not change.' },
    { callout: 'note', title: 'Why index funds use value weights', html: 'A value-weighted index has a practical virtue: a fund that holds every share in proportion to its market value keeps those proportions automatically as prices move, because each holding grows or shrinks with its own price. The fund needs to trade only when companies enter or leave the index or issue or buy back shares. A price-weighted or equally weighted fund must trade to restore its weights whenever prices change.' },
    { p: 'An index can be calculated from prices alone (a price index) or with dividends reinvested (a total return index). Over long periods the difference is large, because dividends are a substantial part of what shareholders earn. The returns this course uses for the Harbourline funds are total returns, net of each fund’s fees.' },

    { h: 'What a share price reflects' },
    { p: 'Why does a Morrow & Pike share cost $28.00 rather than $10 or $100? A buyer is paying for the dividends the share will pay and the price she can sell it for later, which in turn depends on the dividends after that. The price is therefore the present value of the cash flows shareholders expect, discounted at the return they require for the risk, the same logic F04 used for annuities and perpetuities. Module 4 values shares carefully; here the aim is to see what the price says.' },
    { p: 'Morrow & Pike paid a dividend of $0.70 a share in 2027, a <g>dividend yield</g> of <m>0.70 \\div 28.00 = 2.5\\%</m>. F05’s capital asset pricing model, with its beta of 0.90, a 4.2% risk-free rate and a 5.5% market risk premium, gives a required return of <m>4.2\\% + 0.90 \\times 5.5\\% = 9.15\\%</m>. If dividends grew at a constant rate for ever, the <g>Gordon growth model</g> <m>P_0 = D_0(1 + g) \\div (r - g)</m> would hold, and solving it for <m>g</m> gives <m>g = (r P_0 - D_0) \\div (P_0 + D_0) = 6.49\\%</m>. In other words, at $28.00 investors are paying for dividends that grow about 6.5% a year for ever, or faster for a while and more slowly afterwards. The price is a bundle of expectations, not a measure of what the company has already done.' },
    { p: 'Two things move a share price, then: news about the cash flows shareholders can expect (a lost contract, a good harvest, a new product), and changes in the return they require (higher interest rates, or more fear about risk in general). A fall in the price is not always bad news about the company: when interest rates rise, the required return rises and prices of most shares fall together. Whether market prices fully reflect the available information is the question of market efficiency, which F00 introduced and the fundamental-analysis lesson in module 4 takes further.' },
  ],

  formulas: [
    { id: 'shr-market-cap', name: 'Market capitalisation',
      tex: String.raw`\text{Market cap} = P \times N`,
      where: [[String.raw`P`, 'Share price', '$ per share'], [String.raw`N`, 'Shares outstanding', 'shares']],
      assumptions: 'Uses the current market price; if a company has more than one class of share, add the value of each class.',
      note: 'Weights in a value-weighted index are proportional to market capitalisation (some index providers count only the shares available to trade).' },
    { id: 'shr-ev', name: 'Enterprise value',
      tex: String.raw`\text{EV} = \text{Market cap} + D - \text{Cash}`,
      where: [[String.raw`\text{Market cap}`, 'Share price × shares outstanding', '$'], [String.raw`D`, 'Debt: borrowings from banks and bondholders', '$'], [String.raw`\text{Cash}`, 'Cash and cash equivalents', '$']],
      assumptions: 'Debt at book value as an approximation of its market value; all cash treated as not needed to run the business.',
      note: 'Analysts also add preferred stock, lease obligations and noncontrolling interests where they exist; neither company here has any.' },
    { id: 'shr-vw-index', name: 'Return on a value-weighted index',
      tex: String.raw`r_{\text{index}} = \sum_{i} w_i\, r_i, \qquad w_i = \dfrac{P_i N_i}{\sum_j P_j N_j}`,
      where: [[String.raw`r_i`, 'Return on company i’s shares over the period', '%'], [String.raw`w_i`, 'Company i’s weight: its share of the index’s total market capitalisation at the start', ''], [String.raw`P_i N_i`, 'Company i’s market capitalisation at the start of the period', '$']],
      assumptions: 'Weights are set at the start of the period; the number of shares does not change during it.' },
    { id: 'shr-pw-index', name: 'Level of a price-weighted index',
      tex: String.raw`I = \dfrac{\sum_{i} P_i}{\text{Divisor}}`,
      where: [[String.raw`I`, 'Index level', 'points'], [String.raw`P_i`, 'Price of one share of company i', '$'], [String.raw`\text{Divisor}`, 'A number set so the index starts at a chosen level and reset after splits and changes of membership', '']],
      assumptions: 'One share of each company; the divisor changes only for splits, membership changes and similar events, so that they do not move the index.' },
  ],

  examples: [
    { level: 'simple', title: 'Morrow & Pike’s market capitalisation and enterprise value', fictional: true,
      setup: 'On 31 December 2027 Morrow & Pike Roasters’ shares closed at $28.00. It has 40 million shares outstanding, $168 million of debt and $30 million of cash. What are its market capitalisation and its enterprise value?',
      steps: [
        'Market capitalisation is price times shares outstanding: <m>28.00 \\times 40 = 1{,}120</m> million dollars. That is what the market says the shareholders’ claim is worth.',
        'Enterprise value adds the debt a buyer of the whole business would take on: <m>1{,}120 + 168 = 1{,}288</m> million.',
        'It subtracts the cash the buyer would receive and could use to repay part of that debt: <m>1{,}288 - 30 = 1{,}258</m> million.',
        'Check by net debt: <m>168 - 30 = 138</m> million, and <m>1{,}120 + 138 = 1{,}258</m> million.',
      ],
      answer: 'Market capitalisation $1,120 million; enterprise value $1,258 million.',
      interpretation: 'Net debt is a small part of Morrow & Pike’s enterprise value (11.0%), so its two measures of size are close. For a company financed mostly with debt the gap is much wider.' },
    { level: 'challenging', title: 'One day in a three-company index', fictional: true,
      setup: 'A small index holds three fictional listed companies: Aldwick Rail ($120.00 a share, 10 million shares), Brisa Telecom ($15.00, 300 million shares) and Cobham Mills ($40.00, 50 million shares). One day Aldwick rises 10%, Brisa falls 2% and Cobham rises 1%. What is the index’s return if it is price-weighted (starting at 100) and if it is value-weighted? The next morning Aldwick splits each share into two. What divisor keeps the price-weighted index unchanged?',
      table: { head: ['Company', 'Price before', 'Shares (m)', 'Market cap ($m)', 'Return', 'Price after'], align: ['l', 'r', 'r', 'r', 'r', 'r'],
        rows: IX.map((c) => [c.name, `$${c.p0.toFixed(2)}`, String(c.shares), (c.p0 * c.shares).toLocaleString('en-US'), `${c.r < 0 ? '−' : ''}${Math.abs(c.r * 100)}%`, `$${(c.p0 * (1 + c.r)).toFixed(2)}`]) },
      steps: [
        'Price-weighted: the prices add up to <m>120 + 15 + 40 = 175</m> dollars. A divisor of <m>175 \\div 100 = 1.75</m> starts the index at 100. After the day the prices add up to <m>132.00 + 14.70 + 40.40 = 187.10</m>, so the index is <m>187.10 \\div 1.75 = 106.91</m>: a return of 6.91%.',
        'Value-weighted: the market capitalisations are $1,200 million, $4,500 million and $2,000 million, $7,700 million in all. The weights are 15.6%, 58.4% and 26.0%. The return is <m>(1{,}200 \\times 10\\% + 4{,}500 \\times (-2\\%) + 2{,}000 \\times 1\\%) \\div 7{,}700 = 50 \\div 7{,}700 = 0.65\\%</m>.',
        'Check: total market capitalisation after the day is <m>1{,}320 + 4{,}410 + 2{,}020 = 7{,}750</m> million, and <m>7{,}750 \\div 7{,}700 - 1 = 0.65\\%</m>.',
        'The split halves Aldwick’s price to $66.00, so the prices add up to <m>66.00 + 14.70 + 40.40 = 121.10</m>. To keep the index at 106.91 the divisor must fall to <m>121.10 \\div 106.91 = 1.1327</m>. The value-weighted index needs no change: Aldwick’s market capitalisation is still $1,320 million.',
      ],
      answer: 'Price-weighted: +6.91% (100 to 106.91); value-weighted: +0.65%. After the split the price-weighted divisor becomes 1.1327.',
      interpretation: 'Aldwick is the smallest company but has the highest share price, so it dominates the price-weighted index. The value-weighted index is driven by Brisa, which is 58% of the market’s value. After the split Aldwick’s influence on the price-weighted index halves, although the company is the same: price weights depend on an arbitrary choice of how many shares to issue.' },
    { level: 'applied', title: 'What would it cost to buy Morrow & Pike?', fictional: true,
      setup: 'Stoneleigh Foods Group, a fictional food company, is considering an offer for the whole of Morrow & Pike. Its advisers say shareholders would accept nothing less than a 25% premium over the $28.00 market price. Stoneleigh would take on Morrow & Pike’s $168 million of debt and acquire its $30 million of cash. What would the business cost, and how does that compare with its enterprise value at the market price?',
      steps: [
        'Price per share offered: <m>28.00 \\times 1.25 = 35.00</m> dollars.',
        'Cost of the equity: <m>35.00 \\times 40 = 1{,}400</m> million dollars, against a market capitalisation of $1,120 million: a premium of $280 million.',
        'Add the debt Stoneleigh takes on and subtract the cash it acquires: <m>1{,}400 + 168 - 30 = 1{,}538</m> million.',
        'At the market price the enterprise value is $1,258 million, so Stoneleigh would pay <m>1{,}538 - 1{,}258 = 280</m> million more than the market’s value of the business: the whole premium falls on the equity, because the debt and cash are taken over at face value.',
      ],
      answer: 'About $1,538 million for the business: $1,400 million to the shareholders plus $138 million of net debt, $280 million above the enterprise value at the market price.',
      interpretation: 'The headline “a $1.4 billion offer” understates what Stoneleigh commits, because it also takes on Morrow & Pike’s net debt. The deal makes sense only if Stoneleigh expects to create more than $280 million of value, for example from cost savings, beyond what the market already expects; the discounted-cash-flow lesson shows how such a value is estimated.' },
  ],

  demo: [
    { widget: 'shr-ev', intro: 'Start at Morrow & Pike’s figures, then try Harbour Street’s (price $18.00, 120 million shares, debt $1,188 million, cash $60 million). Watch how much of the enterprise value is net debt, and what happens to enterprise value if the company borrows and keeps the money as cash.' },
    { widget: 'shr-index', intro: 'The three-company index from the worked example. Move Aldwick Rail’s return and the price-weighted index swings, though Aldwick is the smallest company; move Brisa Telecom’s and the value-weighted index follows.' },
  ],

  mistakes: [
    { title: 'Thinking a company receives money when its shares trade', html: 'Only a sale of new shares in the primary market raises money for the company. When investors trade existing shares the money moves between them. A rising share price makes the owners richer and makes a future issue cheaper, but it puts no cash in the company’s bank account.' },
    { title: 'Reading size from the share price', html: 'Morrow & Pike’s shares cost $28.00 and Harbour Street’s $18.00, yet Harbour Street’s equity is worth nearly twice as much. Size is price times shares: market capitalisation, or enterprise value for the whole business. The same error is built into a price-weighted index.' },
    { title: 'Adding cash to enterprise value, or leaving debt out', html: 'Enterprise value is market capitalisation <i>plus</i> debt <i>minus</i> cash. A buyer of the business takes on the debt (a cost) and acquires the cash (which offsets part of the cost). Writing 1,120 + 168 + 30 or using market capitalisation alone misstates the price of the business.' },
    { title: 'Treating preferred shares as safe because the dividend is fixed', html: 'The fixed dividend is paid only if the board declares it, and it ranks behind every lender. Preferred shares carry more risk than the same company’s bonds, though less than its common shares.' },
    { title: 'Expecting a market order to fill at the last price, or a limit order to fill at all', html: 'A market order buys at whatever the best available price is when it arrives, normally the ask, which may differ from the last trade. A limit order protects the price but may never be filled if the market moves away from it.' },
  ],

  application: [
    { p: '<b>Ana’s first look at the market fund.</b> Ana reads the Harbourline fund’s description: it holds every listed share in the home market, weighted by market value. That tells her that roughly twice as much of her money would go into Harbour Street as into Morrow & Pike (their market capitalisations are $2,160 million and $1,120 million), and that the fund need not trade when prices move. She also notes what it does not tell her: how risky the fund has been, how its returns compare with bonds’ and what its fees cost over 30 years. Those are the questions of modules 2 and 3.' },
    { p: '<b>An index provider’s weights.</b> An index provider building a value-weighted index decides which companies qualify and recalculates the weights whenever a company issues or buys back shares, joins or leaves. When a large company joins a widely followed index, every fund tracking that index must buy its shares on the same day, which is why index changes are announced in advance and why the rules are published. The weights are market capitalisations, not enterprise values, because the fund buys shares, not businesses.' },
    { p: '<b>A treasurer planning a share issue.</b> The finance director of a listed company that wants to raise $50 million of new equity watches the secondary-market price closely. At $28.00 a share Morrow & Pike would need to sell about 1.8 million new shares to raise $50 million (before fees); at $22.00 it would need about 2.3 million, and its existing shareholders would give up more of the company for the same money. She may delay the issue, raise debt instead, or sell the new shares at a discount to the market price so that the offering is taken up.' },
    { p: '<b>A buyer comparing targets.</b> An acquirer such as the fictional Stoneleigh compares businesses by enterprise value, because that is what it pays once the debt it inherits is counted. Comparing Morrow & Pike and Harbour Street by market capitalisation alone would understate Harbour Street’s size relative to Morrow & Pike, since so much of Harbour Street is financed with debt.' },
  ],

  summary: [
    'A share is a residual claim: votes and whatever is left after lenders and preferred shareholders are paid. Dividends are at the board’s discretion.',
    'Preferred shares pay a fixed dividend, usually carry no vote, and rank ahead of common shares but behind lenders.',
    'Companies raise money in the primary market; existing shares change hands in the secondary market, through brokers and exchanges.',
    'A market order trades at once at the best available price; a limit order trades only at a stated price or better. The bid–ask spread is a cost of trading.',
    'Market capitalisation = price × shares; enterprise value = market capitalisation + debt − cash. Morrow & Pike: $1,120 million and $1,258 million; Harbour Street: $2,160 million and $3,288 million.',
    'A value-weighted index weights companies by market capitalisation; a price-weighted index by share price, which can make a small company dominate. The Harbourline index is value-weighted.',
    'A share price is the present value of the cash flows shareholders expect, so it moves with news about cash flows and with the return investors require.',
  ],
  glossary: [
    { term: 'Share', def: 'A unit of ownership in a company, giving its holder a proportional part of the company’s votes and of what it pays its owners. Also called a stock.' },
    { term: 'Residual claim', def: 'The right to whatever is left of a company’s cash flows and assets after every prior claim, such as those of lenders and preferred shareholders, has been paid. Common shareholders hold it.' },
    { term: 'Limited liability', def: 'The rule that a company’s shareholders can lose no more than they paid for their shares: the company’s creditors cannot claim their other assets.' },
    { term: 'Market order', def: 'An order to buy or sell a security immediately at the best price available when the order arrives.' },
    { term: 'Limit order', def: 'An order to buy or sell a security only at a stated price or better: no higher for a buy order, no lower for a sell order.' },
    { term: 'Stock market index', def: 'A number that tracks the combined price movement of a defined group of shares, so that the performance of a market or part of it can be measured and compared.' },
    { term: 'Value-weighted index', def: 'An index in which each company counts in proportion to its market capitalisation. Also called a capitalisation-weighted index.' },
    { term: 'Price-weighted index', def: 'An index calculated as the sum of its members’ share prices divided by a divisor, so that each company counts in proportion to its share price.' },
    { term: 'Dividend yield', def: 'A share’s dividends per share for a year divided by its price.' },
  ],
  references: [
    { text: 'U.S. Securities and Exchange Commission. <i>Stocks – FAQs</i>. Investor.gov.', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks', checked: '2026-11-11' },
    { text: 'U.S. Securities and Exchange Commission. <i>Types of Orders</i>. Investor.gov.', url: 'https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders', checked: '2026-11-11' },
    { text: 'S&amp;P Dow Jones Indices. <i>Dow Jones Industrial Average</i> (index page).', url: 'https://www.spglobal.com/spdji/en/indices/equity/dow-jones-industrial-average/', checked: '2026-11-11' },
    { text: 'S&amp;P Dow Jones Indices. <i>S&amp;P 500</i> (index page).', url: 'https://www.spglobal.com/spdji/en/indices/equity/sp-500/', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 11.1, “Multiple Approaches to Stock Valuation”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/11-1-multiple-approaches-to-stock-valuation', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'Retirement lump sum', value: ANA.retirement.lump, shown: 5000 },
    { what: 'Retirement monthly', value: ANA.retirement.monthly, shown: 400 },
    { what: 'Deposit saving a month (F04)', value: ANA.deposit.monthly, shown: 914.19 },
    { what: 'Deposit target', value: ANA.deposit.target, shown: 60000 },
    { what: 'Emergency fund (F00)', value: ANA.emergency, shown: 6000 },
    { what: 'Morrow price', value: MP.price, shown: 28 },
    { what: 'Morrow shares', value: MP.shares, shown: 40 },
    { what: 'Morrow debt', value: MP.debt, shown: 168 },
    { what: 'Morrow cash', value: MP.cash, shown: 30 },
    { what: 'Morrow DPS', value: MP.dps, shown: 0.70 },
    { what: 'Harbour price', value: HS.price, shown: 18 },
    { what: 'Harbour shares', value: HS.shares, shown: 120 },
    { what: 'Harbour debt', value: HS.debt, shown: 1188 },
    { what: 'Harbour cash', value: HS.cash, shown: 60 },
    { what: 'Harbour DPS', value: HS.dps, shown: 0.60 },
    { what: 'Morrow market cap', value: MP.marketCap, shown: 1120 },
    { what: 'Harbour market cap', value: HS.marketCap, shown: 2160 },
    { what: 'Morrow EV', value: evMP, shown: 1258 },
    { what: 'Morrow EV equals multiples', value: MP.m.ev, shown: 1258 },
    { what: 'Harbour EV', value: evHS, shown: 3288 },
    { what: 'Morrow cap + debt', value: MP.marketCap + MP.debt, shown: 1288 },
    { what: 'Morrow net debt', value: MP.debt - MP.cash, shown: 138 },
    { what: 'Harbour net debt', value: HS.debt - HS.cash, shown: 1128 },
    { what: 'Morrow D/E (F05)', value: MP.debt / MP.marketCap, shown: 0.15 },
    { what: 'Harbour D/E (F05)', value: HS.debt / HS.marketCap, shown: 0.55 },
    { what: 'Cap ratio', value: HS.marketCap / MP.marketCap, shown: 1.93 },
    { what: 'Cap ratio about 1.9', value: HS.marketCap / MP.marketCap, shown: 1.9, tol: 0.05 },
    { what: 'EV ratio', value: evHS / evMP, shown: 2.61 },
    { what: 'EV ratio about 2.6', value: evHS / evMP, shown: 2.6, tol: 0.05 },
    { what: 'Harbour has three times the shares', value: HS.shares / MP.shares, shown: 3 },
    { what: 'Harbour net debt share of EV', value: (HS.debt - HS.cash) / evHS * 100, shown: 34.3, tol: 0.05 },
    { what: 'Morrow net debt share of EV', value: (MP.debt - MP.cash) / evMP * 100, shown: 11.0, tol: 0.05 },
    { what: 'New shares after a 2m issue', value: MP.shares + 2, shown: 42 },
    { what: 'Spread', value: Q.ask - Q.bid, shown: 0.04 },
    { what: 'Spread midpoint', value: mid, shown: 28.00 },
    { what: 'Spread % of midpoint', value: (Q.ask - Q.bid) / mid * 100, shown: 0.14 },
    { what: 'Round trip 100 shares', value: 100 * (Q.ask - Q.bid), shown: 4.00 },
    { what: 'Index price sum before', value: sumP0, shown: 175 },
    { what: 'Divisor', value: divisor0, shown: 1.75 },
    { what: 'Aldwick after', value: IX[0].p0 * 1.1, shown: 132 },
    { what: 'Brisa after', value: IX[1].p0 * 0.98, shown: 14.70 },
    { what: 'Cobham after', value: IX[2].p0 * 1.01, shown: 40.40 },
    { what: 'Index price sum after', value: sumP1, shown: 187.10 },
    { what: 'Price-weighted level', value: pwLevel1, shown: 106.91 },
    { what: 'Price-weighted return', value: (sumP1 / sumP0 - 1) * 100, shown: 6.91 },
    { what: 'Aldwick cap', value: IX[0].p0 * IX[0].shares, shown: 1200 },
    { what: 'Brisa cap', value: IX[1].p0 * IX[1].shares, shown: 4500 },
    { what: 'Cobham cap', value: IX[2].p0 * IX[2].shares, shown: 2000 },
    { what: 'Total cap', value: cap0, shown: 7700 },
    { what: 'Aldwick weight', value: 1200 / cap0 * 100, shown: 15.6, tol: 0.05 },
    { what: 'Brisa weight', value: 4500 / cap0 * 100, shown: 58.4, tol: 0.05 },
    { what: 'Brisa weight about 58', value: 4500 / cap0 * 100, shown: 58, tol: 0.5 },
    { what: 'Cobham weight', value: 2000 / cap0 * 100, shown: 26.0, tol: 0.05 },
    { what: 'Weighted gain $m', value: 1200 * 0.1 - 4500 * 0.02 + 2000 * 0.01, shown: 50 },
    { what: 'Value-weighted return', value: (cap1 / cap0 - 1) * 100, shown: 0.65 },
    { what: 'Aldwick cap after', value: 132 * 10, shown: 1320 },
    { what: 'Brisa cap after', value: 14.7 * 300, shown: 4410 },
    { what: 'Cobham cap after', value: 40.4 * 50, shown: 2020 },
    { what: 'Total cap after', value: cap1, shown: 7750 },
    { what: 'Aldwick after split', value: IX[0].p0 * 1.1 / 2, shown: 66 },
    { what: 'Sum after split', value: sumAfterSplit, shown: 121.10 },
    { what: 'New divisor', value: divisor1, shown: 1.1327, tol: 0.00005 },
    { what: 'Aldwick is the smallest and the highest-priced', value: IX[0].p0 * IX[0].shares === Math.min(...IX.map((c) => c.p0 * c.shares)) && IX[0].p0 === Math.max(...IX.map((c) => c.p0)) ? 1 : 0, shown: 1 },
    { what: 'Morrow dividend yield', value: MP.dps / MP.price * 100, shown: 2.5 },
    { what: 'Morrow beta (F05)', value: 0.90, shown: 0.90 },
    { what: 'Risk-free rate', value: MARKET.rf * 100, shown: 4.2 },
    { what: 'MRP', value: MARKET.mrp * 100, shown: 5.5 },
    { what: 'Morrow CAPM', value: rMP * 100, shown: 9.15 },
    { what: 'Implied perpetual growth', value: gImplied * 100, shown: 6.49 },
    { what: 'Implied growth about 6.5', value: gImplied * 100, shown: 6.5, tol: 0.05 },
    { what: 'Gordon reproduces price', value: MP.dps * (1 + gImplied) / (rMP - gImplied), shown: 28 },
    { what: 'Offer price', value: OFFER, shown: 35 },
    { what: 'Offer equity', value: offerEquity, shown: 1400 },
    { what: 'Offer premium on equity', value: offerEquity - MP.marketCap, shown: 280 },
    { what: 'Offer cost of business', value: offerCost, shown: 1538 },
    { what: 'Offer above EV', value: offerCost - evMP, shown: 280 },
    { what: 'Twice as much into Harbour (ratio about 2)', value: HS.marketCap / MP.marketCap, shown: 2, tol: 0.1 },
    { what: 'Shares to raise $50m at $28', value: 50 / 28, shown: 1.8, tol: 0.05 },
    { what: 'Shares to raise $50m at $22', value: 50 / 22, shown: 2.3, tol: 0.05 },
    { what: 'Dow members', value: 30, shown: 30 },
    { what: 'S&P 500 coverage', value: 80, shown: 80 },
  ],
};
