// payout-policy.js — F05 · Payout policy. Content only; exercises are in payout-policy.ex.js.
// Marisco Tea Company and Avonmore Hardware and every figure about them are fictional. Lantern’s 2026 and 2027 dividends
// are facts from f02/f03 (case files); whether Lantern should pay a dividend in 2028 belongs to the course project and
// is not discussed. Survey figures are from Brav, Graham, Harvey & Michaely (NBER WP 9657, 2003), opened 2026-11-05;
// the dividend-date rule from Investor.gov; the tax rule from IRS Topic 404; Delaware’s rule from 8 Del. C. § 170.
import { PERIODS, FACTS } from '../f03/case.js?v=28';
import { FACTS as F02F } from '../f02/case.js?v=28';
import * as CF from '../../../core/corpfin.js?v=28';

const P26 = PERIODS[2026], P27 = PERIODS[2027];
const div26 = F02F.dividends.reduce((s, d) => s + d.amount, 0);                 // 5,000
const div27 = FACTS.dividends.reduce((s, d) => s + d.amount, 0);                // 2,000
// ---------------------------------------------------------------- Marisco Tea Company (fictional)
const M = { shares: 1_000_000, price: 40, cash: 4_000_000, earnings: 6_000_000, cashRate: 0.04, tax: 0.25 };
M.lost = M.cash * M.cashRate * (1 - M.tax);                                    // 120,000
const PO = CF.payout({ shares: M.shares, price: M.price, amount: M.cash, earnings: M.earnings, lostIncome: M.lost });
const pe0 = M.price / PO.epsBefore, peD = PO.dividend.priceAfter / PO.dividend.eps, peB = PO.buyback.priceAfter / PO.buyback.eps;
// homemade dividend / reinvestment for a holder of 1,000 shares
const H = { n: 1000 };
H.sell = H.n * PO.dividend.perShare / M.price;                                 // 100 shares
H.reinvest = H.n * PO.dividend.perShare / PO.dividend.priceAfter;              // 111.1 shares
// taxes for that holder (illustrative rate, same on dividends and gains)
const TX = { rate: 0.15, basis: 25 };
TX.onDividend = H.n * PO.dividend.perShare * TX.rate;                           // 600
TX.gain = H.sell * (M.price - TX.basis);                                       // 1,500
TX.onSale = TX.gain * TX.rate;                                                 // 225
// stock split and stock dividend
const split = { shares: M.shares * 2, price: M.price / 2 };
const sdiv = { shares: M.shares * 1.1, price: M.price / 1.1 };
// ---------------------------------------------------------------- Avonmore Hardware (fictional), simple example
const A = { ni: 12_000_000, shares: 8_000_000, div: 4_800_000, buyback: 3_000_000 };
A.eps = A.ni / A.shares; A.dps = A.div / A.shares; A.payout = A.div / A.ni; A.total = (A.div + A.buyback) / A.ni;
// ---------------------------------------------------------------- smoothing (partial adjustment)
const LZ = { prev: 2.40, eps: 7.00, target: 0.40, speed: 0.3 };
LZ.next = LZ.prev + LZ.speed * (LZ.target * LZ.eps - LZ.prev);                 // 2.52
const special = { regular: 2.40, windfall: 4_000_000 };
const f2 = (v) => v.toFixed(2);
const fmt = (v) => Math.round(v).toLocaleString('en-US');

export default {
  slug: 'payout-policy',
  title: 'Payout policy',
  blurb: 'How firms return cash to shareholders, by dividends and share buybacks, why the choice does not change shareholders’ wealth in a perfect market, and why taxes, signals, investor clienteles, agency costs and flexibility make it matter in practice.',
  status: 'draft',
  objectives: [
    'Describe cash dividends, special dividends, share repurchases, stock dividends and splits, and the dates in a dividend’s timetable.',
    'Calculate the payout and retention ratios, the ex-dividend share price, and the share count, price and EPS after a buyback.',
    'Show that a dividend and a buyback of the same cash leave shareholders equally wealthy in a perfect market, and explain why the EPS increase from a buyback is not value.',
    'Explain how taxes, signalling, clienteles, agency costs and flexibility affect the choice of payout, and summarise survey evidence on how managers decide.',
    'Model dividend smoothing with a partial-adjustment rule, and state the legal and contractual limits on payouts.',
  ],
  prerequisites: [
    { lesson: 'f02/balance-sheet-and-equity', why: 'How dividends are declared and recorded, treasury stock, and the declaration, record and payment dates.' },
    { lesson: 'f05/capital-structure', why: 'The Modigliani–Miller argument, asymmetric information and agency costs carry over from financing to payout.' },
    { lesson: 'f00/governance-and-agency', why: 'Free cash flow in managers’ hands is an agency problem; covenants limit dividends.' },
  ],
  case: 'lantern',

  concept: [
    { case: String.raw`Lantern has paid three dividends, all to Ana, its only shareholder: $300 in March 2026 and $4,700 in December 2026, out of 2026 net income of $${fmt(P26.netIncome)}, and $2,000 in June 2027, out of $${fmt(P27.netIncome)}. Each time the money left a company that could have used it, for coffee stock or a deposit on equipment, and went to a shareholder who could have used it too. A listed company faces the same question with thousands of shareholders who want different things, and with a second tool, buying back its own shares.` },
    { p: '<g>Payout policy</g> is a firm’s choice of how much cash to return to its shareholders, in what form, and when. It is the other side of the investment decision: cash the firm pays out is cash it does not invest, and cash it keeps must earn at least what shareholders could earn elsewhere at the same risk. A firm with more positive-NPV projects than cash should pay out little; a firm with more cash than good projects should pay out the rest. The interesting questions are about the rest: in what form, and does the form matter?' },

    { h: 'Ways to pay out' },
    { list: [
      '<b>Regular cash <g>dividends</g>.</b> A payment per share, usually quarterly in the US and half-yearly in the UK. Boards treat the regular dividend as a commitment.',
      '<b>Special dividends.</b> One-off payments, usually after a windfall, labelled so that shareholders don’t expect them again.',
      '<b>Share repurchases (buybacks).</b> The company buys its own shares, usually on the stock market over months, sometimes by a tender offer at a fixed price. The shares bought are cancelled or held as <g>treasury stock</g>. Only shareholders who sell receive cash; the others own a larger share of a smaller company.',
      '<b>Stock dividends and splits.</b> New shares handed to existing shareholders in proportion to their holdings. No cash leaves the company, so these are not payouts at all, a point the In depth section returns to.',
    ] },
    { p: String.raw`Two ratios describe how much is paid. The <g>payout ratio</g> is dividends divided by net income; the <g>retention ratio</g>, or plowback ratio, is the share kept, 1 minus the payout ratio. Lantern paid out <m>${fmt(div26)} \div ${fmt(P26.netIncome)} = ${(div26 / P26.netIncome * 100).toFixed(1)}\%</m> of its 2026 profit and <m>${fmt(div27)} \div ${fmt(P27.netIncome)} = ${(div27 / P27.netIncome * 100).toFixed(1)}\%</m> of 2027’s, retaining ${(100 - div27 / P27.netIncome * 100).toFixed(1)}% to finance its growth. Because buybacks have become a large part of what listed companies return, analysts also use a total payout ratio: dividends plus buybacks, divided by net income.` },

    { h: 'The dividend timetable' },
    { p: 'A dividend passes through four dates. On the <g>declaration date</g> the board announces the amount and the dates, and the company records a liability. The <g>date of record</g> decides who is paid: shareholders on the register at the end of that day. Because a share bought on the stock market takes time to settle onto the register, there is an <g>ex-dividend date</g>: anyone who buys on or after it does not receive the dividend. Investor.gov explains that the ex-dividend date is now usually set as the record date itself (or the business day before, if the record date is not a business day), since US trades settle one business day after the trade. Finally, on the <g>payment date</g> the cash is paid.' },
    { table: {
      caption: 'Marisco Tea Company (fictional): a dividend timetable',
      head: ['Date', 'Event'],
      align: ['l', 'l'],
      rows: [
        ['Tuesday 18 April 2028', 'Declaration date: the board declares $0.60 a share'],
        ['Thursday 11 May 2028', 'Last day to buy the shares and receive the dividend'],
        ['Friday 12 May 2028', 'Ex-dividend date and record date: buyers from today do not receive it'],
        ['Thursday 1 June 2028', 'Payment date'],
      ],
    } },
    { p: 'In a market without taxes or frictions, the share price falls by the dividend when the shares go ex-dividend: a share with the dividend attached is worth the share without it plus the cash. The shareholder is no richer; part of her investment has turned into cash.' },
  ],

  theory: [
    { h: 'Dividends and buybacks in a perfect market' },
    { p: String.raw`<b>Marisco Tea Company</b>, a fictional listed tea importer, has 1,000,000 shares at $40, a market value of $40,000,000. Of that, $4,000,000 is surplus cash it has no use for. It earns $6,000,000 a year, of which $${fmt(M.lost)} is interest on the cash (4% before 25% tax). The board can pay out the $4,000,000 as a dividend of $4 a share, or buy back shares at the market price of $40.` },
    { table: {
      caption: 'Marisco Tea Company (fictional): a $4 million payout two ways',
      head: ['', 'Before', 'After the dividend', 'After the buyback'],
      align: ['l', 'r', 'r', 'r'],
      rows: [
        ['Shares outstanding', fmt(M.shares), fmt(PO.dividend.shares), fmt(PO.buyback.shares)],
        ['Market value of the equity ($)', fmt(M.shares * M.price), fmt(M.shares * M.price - M.cash), fmt(M.shares * M.price - M.cash)],
        ['Share price', `$${f2(M.price)}`, `$${f2(PO.dividend.priceAfter)}`, `$${f2(PO.buyback.priceAfter)}`],
        ['Earnings ($)', fmt(M.earnings), fmt(M.earnings - M.lost), fmt(M.earnings - M.lost)],
        ['Earnings per share', `$${f2(PO.epsBefore)}`, `$${f2(PO.dividend.eps)}`, `$${f2(PO.buyback.eps)}`],
        ['Price ÷ earnings', f2(pe0), f2(peD), f2(peB)],
        ['Wealth per original share', `$${f2(M.price)}`, `$${f2(PO.dividend.priceAfter)} + $${f2(PO.dividend.perShare)} cash`, `$${f2(PO.buyback.priceAfter)} (in shares or cash)`],
      ],
      note: 'The buyback retires 4,000,000 ÷ 40 = 100,000 shares. Both payouts remove the cash and the interest it earned.',
    } },
    { p: 'Shareholders end with $40 of wealth per share either way. With the dividend, each has a $36 share and $4 of cash. With the buyback, those who sold have $40 of cash and those who kept their shares hold shares still worth $40, because the company paid a fair price: the shares it bought cost exactly what they were worth. Neither form creates or destroys value, because the cash was already the shareholders’; the payout only moves it out of the company.' },
    { p: String.raw`Shareholders can also undo either choice themselves, as investors could undo leverage in the capital-structure lesson. An investor with 1,000 shares who wants $4,000 of cash after a buyback can sell ${fmt(H.sell)} shares at $40: a <g>homemade dividend</g>. One who would rather not receive a dividend can reinvest the $4,000 in shares at $36, buying ${H.reinvest.toFixed(1)} and owning shares worth <m>${(H.n + H.reinvest).toFixed(1)} \times 36 = 40{,}000</m>. Miller and Modigliani showed in 1961 that in a perfect and frictionless market a firm’s value does not depend on its payout policy, given its investment decisions; Brav and colleagues (2003) start their survey from that result.` },
    { callout: 'key', title: 'A buyback raises EPS without raising value', html: String.raw`After the buyback, Marisco’s EPS rises from $${f2(PO.epsBefore)} to $${f2(PO.buyback.eps)}, ${((PO.buyback.eps / PO.epsBefore - 1) * 100).toFixed(1)}% higher, yet the share price stays at $40. The price-earnings ratio falls from ${f2(pe0)} to ${f2(peB)}, because the company has given away its safest asset, cash, and the remaining shares are a claim on riskier tea importing alone. The dividend shows the same fall in the ratio. Higher EPS from a buyback is arithmetic, not value.` },

    { h: 'Why payout policy matters in practice' },
    { p: 'Real markets have taxes, information gaps, transaction costs and managers whose interests differ from shareholders’. Each gives a reason why the form and level of payout can matter.' },
    { p: String.raw`<b>Taxes.</b> A dividend is taxed as income for every shareholder in the year it is paid. A buyback taxes only the shareholders who sell, and only on their gain over what they paid; the others defer tax until they sell. In the US, qualified dividends are taxed at the lower capital-gains rates (IRS Topic 404), which narrows the difference, but the deferral and the taxation of gains rather than proceeds remain. Suppose a holder of 1,000 Marisco shares, bought at $25, pays 15% on both dividends and gains (an assumed rate). The $4,000 dividend costs her <m>4{,}000 \times 0.15 = ${fmt(TX.onDividend)}</m> in tax. Raising the same $4,000 by selling ${fmt(H.sell)} shares realises a gain of <m>${fmt(H.sell)} \times (40 - 25) = ${fmt(TX.gain)}</m> and costs <m>${fmt(TX.onSale)}</m>; if she does not sell, nothing now. Tax-exempt investors such as pension funds are indifferent.` },
    { p: '<b>Signals.</b> Managers know more about future earnings than investors do. Because boards are reluctant to cut a regular dividend, an increase suggests they expect earnings to stay high enough to sustain it, and a cut suggests the opposite; dividend changes therefore carry information. A buyback can suggest managers think the shares are cheap, the mirror image of the pecking order’s equity issue.' },
    { p: '<b>Clienteles.</b> Investors differ in their taxes and in whether they want regular cash. A firm may attract a <g>clientele</g> whose tastes match its policy, and if each clientele is already served, changing the policy gains nothing and may upset the existing holders.' },
    { p: '<b>Agency costs.</b> Cash left in a mature firm with few good projects tempts managers to spend it on growth for its own sake, the free-cash-flow problem associated with Michael Jensen. Paying it out, and especially committing to a regular dividend, takes it out of their hands and makes them raise money from investors, who scrutinise it, when they need more.' },
    { p: '<b>Flexibility.</b> A regular dividend is hard to cut; a buyback programme can be slowed or stopped quietly. Firms with volatile or temporary cash flows therefore prefer buybacks or special dividends for the variable part of their payout.' },

    { h: 'What managers say' },
    { p: 'Brav, Graham, Harvey and Michaely surveyed 384 financial executives and interviewed 23 more about payout policy (NBER working paper, 2003). Among dividend payers, 94% agreed or strongly agreed that they try to avoid cutting dividends and 90% that they smooth dividends from year to year; cuts were a last resort. Repurchases were seen as more flexible: only 22.5% thought reducing repurchases had negative consequences. The most popular reason for repurchasing, agreed by 86.6%, was buying when the shares were a good value relative to their true value, and three-quarters said increasing EPS was an important factor. Taxes were second-order: 21.4% of dividend payers called investors’ personal taxes important or very important. Only 4.2% agreed that they used dividends to show they could bear costly payments, the classic signalling model, yet about four-fifths believed dividend decisions convey information to investors. Among firms that paid nothing, 70% said they never planned to start paying dividends.' },
    { p: 'The authors also revisit John Lintner’s 1956 study of 28 industrial firms, which found dividends sticky, smoothed and tied to long-run sustainable earnings. They found the conservatism persists but the tie to earnings has weakened: managers no longer treat a target payout ratio as the main decision.' },

    { h: 'Smoothing as a formula' },
    { p: String.raw`Lintner’s description is usually written as a partial-adjustment rule. The firm has a target payout ratio <m>p</m> of its earnings <m>E_t</m>, but closes only a fraction <m>a</m> of the gap between the target and last year’s dividend each year:` },
    { math: String.raw`D_t = D_{t-1} + a\,(p\,E_t - D_{t-1})` },
    { p: String.raw`A firm paying $${f2(LZ.prev)} a share with a 40% target and an adjustment speed of 0.3, whose EPS jumps to $${f2(LZ.eps)}, raises its dividend only to <m>${f2(LZ.prev)} + 0.3 \times (0.4 \times ${f2(LZ.eps)} - ${f2(LZ.prev)}) = ${f2(LZ.next)}</m>, not to the target’s $${f2(LZ.target * LZ.eps)}. If the higher earnings last, the dividend keeps climbing towards the target; if they fall back, the board has not raised the dividend to a level it would have to cut. The widget below shows the effect on a bumpy earnings path.` },

    { h: 'Stock dividends and splits' },
    { p: String.raw`In a two-for-one <g>stock split</g> each share becomes two. Marisco would have ${fmt(split.shares)} shares and, with nothing else changed, a price of $${f2(split.price)}. A 10% <g>stock dividend</g> gives one new share for every ten held: ${fmt(sdiv.shares)} shares at <m>40 \div 1.1 = \$${f2(sdiv.price)}</m>. In both cases the company is cut into more, smaller slices and every shareholder keeps the same fraction of it. The accounting differs (a stock dividend moves an amount from retained earnings to contributed capital; a split changes the number of shares and any par value), but no cash moves and no value is created. The reason usually given is to keep the share price in a range that is convenient to trade.` },

    { h: 'Limits on payouts' },
    { p: 'Payouts are limited by law and by contract. Corporate law protects creditors by limiting distributions that would leave a company unable to pay what it owes; the details vary by jurisdiction. Delaware, for example, allows a corporation to pay dividends out of its surplus or, if it has none, out of its net profits for the year in which the dividend is declared and/or the preceding year (8 Del. C. § 170). Loan agreements often add covenants that cap dividends and buybacks or forbid them while a ratio is below a threshold, which is how lenders stop shareholders paying themselves before the lenders are paid (see F00’s governance lesson). Directors who approve an unlawful distribution can be personally liable, so boards check these limits before each declaration.' },
  ],

  formulas: [
    { id: 'pay-ratios', name: 'Payout and retention ratios',
      tex: String.raw`\text{Payout ratio} = \dfrac{\text{Dividends}}{\text{Net income}} = \dfrac{\text{DPS}}{\text{EPS}}, \qquad b = 1 - \text{Payout ratio}`,
      where: [[String.raw`\text{Dividends}`, 'Cash dividends to common shareholders for the year', '$'], [String.raw`\text{Net income}`, 'Net income for the year', '$'], [String.raw`\text{DPS}, \text{EPS}`, 'Dividends and earnings per share', '$ a share'], [String.raw`b`, 'Retention (plowback) ratio: the share of net income kept', '']],
      note: 'Total payout ratio = (dividends + buybacks) ÷ net income.' },
    { id: 'pay-ex-price', name: 'Share price when it goes ex-dividend (perfect market)',
      tex: String.raw`P_{\text{ex}} = P_{\text{cum}} - \text{DPS}`,
      where: [[String.raw`P_{\text{ex}}`, 'Price once the shares trade without the dividend', '$'], [String.raw`P_{\text{cum}}`, 'Price with the dividend attached', '$'], [String.raw`\text{DPS}`, 'Dividend per share', '$']],
      assumptions: 'No taxes or transaction costs and no news on the day; in practice the fall can differ from the dividend.' },
    { id: 'pay-buyback', name: 'Shares, price and EPS after a buyback at the market price',
      tex: String.raw`N_1 = N_0 - \dfrac{C}{P_0}, \qquad P_1 = \dfrac{N_0 P_0 - C}{N_1} = P_0, \qquad \text{EPS}_1 = \dfrac{E - r C}{N_1}`,
      where: [[String.raw`N_0, N_1`, 'Shares before and after', 'shares'], [String.raw`C`, 'Cash spent on the buyback', '$'], [String.raw`P_0, P_1`, 'Share price before and after', '$'], [String.raw`E`, 'Earnings before the payout', '$'], [String.raw`r`, 'After-tax return the cash was earning', '']],
      assumptions: 'The shares are bought at their fair market price in a perfect market.' },
    { id: 'pay-lintner', name: 'Dividend smoothing (partial adjustment)',
      tex: String.raw`D_t = D_{t-1} + a\,(p\,E_t - D_{t-1})`,
      where: [[String.raw`D_t, D_{t-1}`, 'Dividend per share this year and last year', '$'], [String.raw`p`, 'Target payout ratio', ''], [String.raw`E_t`, 'Earnings per share this year', '$'], [String.raw`a`, 'Speed of adjustment, between 0 (never change) and 1 (pay the target every year)', '']],
      note: 'A standard way of writing Lintner’s (1956) description of how managers set dividends.' },
  ],

  examples: [
    { level: 'simple', title: 'Avonmore Hardware’s payout',
      fictional: true,
      setup: 'Avonmore Hardware, a fictional listed chain, earned net income of $12,000,000 last year with 8,000,000 shares outstanding. It paid dividends of $4,800,000 and bought back $3,000,000 of shares. Find EPS, dividends per share, the payout and retention ratios, and the total payout ratio.',
      steps: [
        String.raw`EPS <m>= 12{,}000{,}000 \div 8{,}000{,}000 = \$${f2(A.eps)}</m>; DPS <m>= 4{,}800{,}000 \div 8{,}000{,}000 = \$${f2(A.dps)}</m>.`,
        String.raw`Payout ratio <m>= 4{,}800{,}000 \div 12{,}000{,}000 = ${(A.payout * 100).toFixed(0)}\%</m> (equivalently <m>${f2(A.dps)} \div ${f2(A.eps)}</m>); retention ratio <m>= 1 - 0.40 = ${((1 - A.payout) * 100).toFixed(0)}\%</m>.`,
        String.raw`Total payout ratio <m>= (4{,}800{,}000 + 3{,}000{,}000) \div 12{,}000{,}000 = ${(A.total * 100).toFixed(0)}\%</m>.`,
      ],
      answer: String.raw`EPS $${f2(A.eps)}, DPS $${f2(A.dps)}; payout ${(A.payout * 100).toFixed(0)}%, retention ${((1 - A.payout) * 100).toFixed(0)}%; total payout ${(A.total * 100).toFixed(0)}%.`,
      interpretation: 'Avonmore returns almost two-thirds of its profit. The retention ratio of 60% counts only dividends; the cash actually kept for investment is the 35% left after the buyback too.' },
    { level: 'challenging', title: 'Marisco’s dividend against its buyback',
      fictional: true,
      setup: 'Use Marisco’s figures from the In depth section: 1,000,000 shares at $40, $4,000,000 of surplus cash earning $120,000 a year after tax, earnings of $6,000,000. Compare a $4 dividend with a $4,000,000 buyback at $40: shares, price, EPS and price-earnings ratio after each, and the wealth of a shareholder with 1,000 shares who wants $4,000 of cash.',
      steps: [
        String.raw`Equity after either payout: <m>40{,}000{,}000 - 4{,}000{,}000 = 36{,}000{,}000</m>; earnings <m>6{,}000{,}000 - 120{,}000 = ${fmt(M.earnings - M.lost)}</m>.`,
        String.raw`Dividend: 1,000,000 shares at <m>36{,}000{,}000 \div 1{,}000{,}000 = \$36</m>; EPS <m>${fmt(M.earnings - M.lost)} \div 1{,}000{,}000 = \$${f2(PO.dividend.eps)}</m>; P/E <m>36 \div ${f2(PO.dividend.eps)} = ${f2(peD)}</m>.`,
        String.raw`Buyback: <m>4{,}000{,}000 \div 40 = 100{,}000</m> shares bought, 900,000 left, at <m>36{,}000{,}000 \div 900{,}000 = \$40</m>; EPS <m>${fmt(M.earnings - M.lost)} \div 900{,}000 = \$${f2(PO.buyback.eps)}</m>; P/E <m>40 \div ${f2(PO.buyback.eps)} = ${f2(peB)}</m>.`,
        String.raw`The shareholder: with the dividend she has 1,000 shares at $36 and $4,000 of cash, <m>\$40{,}000</m>. With the buyback she sells 100 shares at $40 for $4,000 and keeps 900 at $40, also <m>\$40{,}000</m>, and owns 0.1% of Marisco in both cases (1,000 of 1,000,000, or 900 of 900,000).`,
      ],
      answer: String.raw`Dividend: 1,000,000 shares at $36, EPS $${f2(PO.dividend.eps)}, P/E ${f2(peD)}. Buyback: 900,000 shares at $40, EPS $${f2(PO.buyback.eps)}, P/E ${f2(peB)}. The shareholder has $40,000 and 0.1% of the company either way.`,
      interpretation: 'In a perfect market the form of payout is a matter of packaging. EPS rose with the buyback only because the same earnings are spread over fewer shares, and the falling P/E offsets it exactly. What can differ in practice is tax, what each form signals, and how hard it is to reverse.' },
    { level: 'applied', title: 'Paying out a windfall',
      fictional: true,
      setup: 'Marisco’s regular dividend is $2.40 a share. The $4,000,000 of surplus cash came from selling a warehouse, a one-off. One director proposes raising the regular dividend to $6.40 this year; another proposes a special dividend of $4; the finance director proposes a buyback. Most of Marisco’s shares are held by individuals who pay tax on dividends and gains at the same 15% rate, and many bought years ago at around $25. Which should the board choose?',
      steps: [
        'Raising the regular dividend to $6.40 would signal that earnings of about $6 a share can sustain it, when the extra cash is a one-off. Next year the board would face a cut, which managers avoid (94% in the Brav survey) and investors read as bad news. Reject it.',
        String.raw`A special dividend labels the payment as one-off, but every shareholder is taxed on it: a holder of 1,000 shares pays <m>${fmt(TX.onDividend)}</m>.`,
        String.raw`A buyback at a fair price leaves non-sellers untaxed now; a holder who wants the cash sells 100 shares and pays tax only on the gain: <m>${fmt(TX.onSale)}</m>. It is also flexible: it can be spread over months and stopped if a good use for the cash appears.`,
        'Check the limits: the loan agreements and the legal test for distributions must allow it, and the buyback should not be justified by the higher EPS, which is arithmetic.',
      ],
      answer: 'A buyback, or failing that a special dividend; not a higher regular dividend. For this shareholder base the buyback is cheaper in tax and keeps flexibility.',
      interpretation: 'Smoothing, taxes and flexibility all point the same way for a one-off windfall. A firm whose earnings had permanently risen would instead raise its regular dividend gradually, as the partial-adjustment rule describes.' },
  ],

  demo: [
    { widget: 'pay-compare', intro: 'Marisco’s choice. Change the cash paid out and the return the cash was earning: the wealth per share is the same under both forms every time, while the buyback’s EPS rises above the dividend’s. Set the cash’s return to the earnings yield ($6 ÷ $40 = 15%) and the buyback no longer raises EPS at all.' },
    { widget: 'pay-smooth', intro: 'A fictional firm’s earnings per share over ten years, with a bad year in year 4 and another dip in year 8. Set the adjustment speed to 1: the dividend follows earnings and is cut twice. Lower it towards 0.2: the dividend rises steadily and is never cut, the pattern the survey managers describe.' },
  ],

  mistakes: [
    { title: '“A buyback that raises EPS creates value.”', html: 'Marisco’s buyback raised EPS by 8.9% and left the price at $40. Fewer shares share the same earnings, but each share is now a riskier claim, so the P/E falls. A buyback adds value only if the shares were bought below their true value (which transfers value from sellers to those who stay) or if it stops managers wasting the cash.' },
    { title: '“A dividend gives shareholders money they would not otherwise have.”', html: 'The cash was already theirs, inside the company. When the share goes ex-dividend its price falls by about the dividend: the shareholder swaps part of her share’s value for cash, and pays tax on it.' },
    { title: '“Shareholders who don’t sell in a buyback get nothing.”', html: 'They own a larger fraction of a company that has fewer shares, and in a fair-price buyback their shares are worth as much as before. They also defer tax until they choose to sell.' },
    { title: '“To get the dividend, buy the shares by the record date.”', html: 'Settlement takes time, so the cut-off for buyers is the ex-dividend date. With one-day settlement it is now usually the record date itself, so you must buy before it, by the previous trading day.' },
    { title: '“A stock split or stock dividend makes shareholders richer.”', html: 'Each shareholder keeps the same fraction of the same company; the price per share falls in proportion. No cash moves.' },
  ],

  application: [
    { p: '<b>A board sets a payout policy.</b> The board of a fictional mature food company with steady cash flows sets a regular dividend at about 40% of earnings it believes are sustainable, raises it only when it is confident it will not have to cut it, and returns the rest of its surplus by buybacks that can be scaled down in a bad year. Before each buyback it checks the price against its own estimate of value, because buying shares above their value transfers wealth from the shareholders who stay to those who sell. It reports buybacks as returning cash, not as boosting EPS.' },
    { p: '<b>A growing company pays nothing.</b> A fictional software firm with more positive-NPV projects than cash pays no dividend and buys back no shares: every dollar retained is invested at more than its cost of capital. Its investors expect returns from a rising share price. Paying a dividend and then raising money by selling shares would cost issue fees and, by the pecking order, a lower price.' },
    { p: '<b>An owner-managed company.</b> In a business like Lantern, with one shareholder who also runs it, signalling and clienteles barely arise: Ana knows exactly what Lantern earns. The questions are whether the cash earns more inside the business than outside, whether Lantern’s lenders’ terms and the law allow the payment, and how a dividend, a salary and retaining the profit are each taxed, a tax-planning question beyond this course. Lantern’s payout ratios of 18.3% in 2026 and 8.9% in 2027 reflect a growing business keeping most of its profit.' },
  ],

  summary: [
    'Payout policy decides how much cash to return, in what form and when. Cash that cannot be invested at its cost of capital should be returned.',
    'Forms: regular and special dividends, share repurchases; stock dividends and splits move no cash. Payout ratio = dividends ÷ net income; retention ratio = 1 − payout ratio.',
    'The timetable: declaration, ex-dividend (now usually the record date in the US), record and payment. The price falls by about the dividend on the ex-dividend date.',
    'In a perfect market a dividend and a fair-price buyback of the same cash leave shareholders equally wealthy (Marisco: $40 a share either way). A buyback raises EPS but the P/E falls: no value is created.',
    'In practice: dividends are taxed in full when paid, buybacks only on sellers’ gains; dividend changes signal; clienteles form; payouts limit managers’ free cash; buybacks are more flexible.',
    'Managers smooth dividends and avoid cuts (94% in the Brav survey); D_t = D_{t−1} + a(pE_t − D_{t−1}) captures it. Buybacks absorb the variable part.',
    'Payouts are limited by corporate law (Delaware: surplus or recent net profits) and by loan covenants.',
  ],

  glossary: [
    { term: 'Payout policy', def: 'A firm’s choice of how much cash to return to its shareholders, in what form (dividends or share repurchases) and when.' },
    { term: 'Payout ratio', def: 'Dividends divided by net income, or dividends per share divided by earnings per share. The total payout ratio adds share repurchases to dividends.' },
    { term: 'Retention ratio', def: 'The share of net income a firm keeps rather than pays as dividends: 1 minus the payout ratio. Also called the plowback ratio.' },
    { term: 'Share repurchase', def: 'A company’s purchase of its own shares from shareholders, on the market or by a tender offer; the shares are cancelled or held as treasury stock. Also called a buyback.' },
    { term: 'Ex-dividend date', def: 'The first day on which a share trades without the right to a declared dividend: buyers on or after it do not receive the dividend. In the US it is now usually the record date.' },
    { term: 'Homemade dividend', def: 'Cash an investor raises by selling some of her shares, which replaces a dividend the company did not pay.' },
    { term: 'Clientele', def: 'A group of investors drawn to a firm by its payout policy, for example because of their tax position or their need for regular income.' },
    { term: 'Stock split', def: 'A division of each existing share into several, such as two-for-one, which lowers the price per share in proportion and moves no cash.' },
    { term: 'Stock dividend', def: 'A distribution of new shares to existing shareholders in proportion to their holdings, such as one new share for every ten held; no cash leaves the company.' },
  ],

  references: [
    { text: 'Brav, A., Graham, J. R., Harvey, C. R. &amp; Michaely, R. (2003). “Payout Policy in the 21st Century.” NBER Working Paper 9657.', url: 'https://www.nber.org/system/files/working_papers/w9657/w9657.pdf', checked: '2026-11-05' },
    { text: 'U.S. Securities and Exchange Commission, Investor.gov. “Ex-Dividend Dates: When Are You Entitled to Stock and Cash Dividends.”', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/ex-dividend-dates-when-are-you-entitled-stock-and', checked: '2026-11-05' },
    { text: 'Internal Revenue Service. Topic no. 404, “Dividends and other corporate distributions.”', url: 'https://www.irs.gov/taxtopics/tc404', checked: '2026-11-05' },
    { text: 'Delaware Code, Title 8, § 170, “Dividends; payment; wasting asset corporations” (2025 code, via Justia).', url: 'https://law.justia.com/codes/delaware/title-8/chapter-1/subchapter-v/section-170/', checked: '2026-11-06' },
  ],

  checks: [
    // Lantern (F02/F03)
    { what: 'Dividends 2026 parts', value: F02F.dividends[0].amount + F02F.dividends[1].amount, shown: 5000 },
    { what: 'March 2026 dividend', value: F02F.dividends[0].amount, shown: 300 },
    { what: 'December 2026 dividend', value: F02F.dividends[1].amount, shown: 4700 },
    { what: 'June 2027 dividend', value: div27, shown: 2000 },
    { what: 'Net income 2026', value: P26.netIncome, shown: 27387 },
    { what: 'Net income 2027', value: P27.netIncome, shown: 22431 },
    { what: 'Payout 2026', value: div26 / P26.netIncome * 100, shown: 18.3, tol: 0.05 },
    { what: 'Payout 2027', value: div27 / P27.netIncome * 100, shown: 8.9, tol: 0.05 },
    { what: 'Retention 2027', value: 100 - div27 / P27.netIncome * 100, shown: 91.1, tol: 0.05 },
    // Marisco
    { what: 'Marisco value', value: M.shares * M.price, shown: 40000000 },
    { what: 'Lost interest after tax', value: M.lost, shown: 120000 },
    { what: 'Dividend per share', value: PO.dividend.perShare, shown: 4 },
    { what: 'Equity after payout', value: M.shares * M.price - M.cash, shown: 36000000 },
    { what: 'Earnings after payout', value: M.earnings - M.lost, shown: 5880000 },
    { what: 'Ex-dividend price', value: PO.dividend.priceAfter, shown: 36 },
    { what: 'Shares bought', value: PO.buyback.sharesBought, shown: 100000 },
    { what: 'Shares left', value: PO.buyback.shares, shown: 900000 },
    { what: 'Price after buyback', value: PO.buyback.priceAfter, shown: 40 },
    { what: 'EPS before', value: PO.epsBefore, shown: 6 },
    { what: 'EPS after dividend', value: PO.dividend.eps, shown: 5.88 },
    { what: 'EPS after buyback', value: PO.buyback.eps, shown: 6.53 },
    { what: 'EPS rise', value: (PO.buyback.eps / PO.epsBefore - 1) * 100, shown: 8.9, tol: 0.05 },
    { what: 'P/E before', value: pe0, shown: 6.67 },
    { what: 'P/E after dividend', value: peD, shown: 6.12 },
    { what: 'P/E after buyback', value: peB, shown: 6.12 },
    { what: 'Wealth dividend', value: PO.dividend.wealth, shown: 40 },
    { what: 'Wealth buyback', value: PO.buyback.wealth, shown: 40 },
    { what: 'Wealth equal', value: Math.abs(PO.dividend.wealth - PO.buyback.wealth) < 1e-9 ? 1 : 0, shown: 1 },
    { what: 'P/E falls with buyback', value: peB < pe0 ? 1 : 0, shown: 1 },
    { what: 'EPS × P/E unchanged price', value: PO.buyback.eps * peB, shown: 40 },
    { what: 'Homemade: shares sold', value: H.sell, shown: 100 },
    { what: 'Reinvest shares', value: H.reinvest, shown: 111.1, tol: 0.05 },
    { what: 'Reinvest total shares', value: H.n + H.reinvest, shown: 1111.1, tol: 0.05 },
    { what: 'Reinvest wealth', value: (H.n + H.reinvest) * PO.dividend.priceAfter, shown: 40000 },
    { what: 'Holder’s fraction', value: 900 / 900000 * 100, shown: 0.1 },
    { what: 'Holder’s fraction before', value: 1000 / 1000000 * 100, shown: 0.1 },
    { what: 'Shareholder dividend', value: H.n * PO.dividend.perShare, shown: 4000 },
    { what: 'Tax on dividend', value: TX.onDividend, shown: 600 },
    { what: 'Gain on sale', value: TX.gain, shown: 1500 },
    { what: 'Tax on sale', value: TX.onSale, shown: 225 },
    // smoothing
    { what: 'Partial adjustment', value: LZ.next, shown: 2.52 },
    { what: 'Target dividend', value: LZ.target * LZ.eps, shown: 2.80 },
    { what: 'Regular dividend raised to', value: special.regular + PO.dividend.perShare, shown: 6.40 },
    { what: 'Earnings yield', value: M.earnings / (M.shares * M.price) * 100, shown: 15 },
    // split and stock dividend
    { what: 'Split shares', value: split.shares, shown: 2000000 },
    { what: 'Split price', value: split.price, shown: 20 },
    { what: 'Stock dividend shares', value: sdiv.shares, shown: 1100000 },
    { what: 'Stock dividend price', value: sdiv.price, shown: 36.36 },
    // Avonmore
    { what: 'Avonmore EPS', value: A.eps, shown: 1.50 },
    { what: 'Avonmore DPS', value: A.dps, shown: 0.60 },
    { what: 'Avonmore payout', value: A.payout * 100, shown: 40 },
    { what: 'Avonmore retention', value: (1 - A.payout) * 100, shown: 60 },
    { what: 'Avonmore total payout', value: A.total * 100, shown: 65 },
    { what: 'Avonmore kept after buyback', value: (1 - A.total) * 100, shown: 35 },
    { what: 'Avonmore almost two-thirds', value: A.total, shown: 0.65, tol: 0.02 },
    // survey
    { what: 'Brav respondents', value: 384, shown: 384 },
    { what: 'Brav interviews', value: 23, shown: 23 },
    { what: 'Avoid cuts', value: 94, shown: 94 },
    { what: 'Smooth', value: 90, shown: 90 },
    { what: 'Reduce repurchases negative', value: 22.5, shown: 22.5 },
    { what: 'Repurchase when good value', value: 86.6, shown: 86.6 },
    { what: 'Personal taxes important', value: 21.4, shown: 21.4 },
    { what: 'Costly signal', value: 4.2, shown: 4.2 },
    { what: 'Never initiate', value: 70, shown: 70 },
    { what: 'Lintner firms', value: 28, shown: 28 },
    { what: 'Marisco dividend in timetable', value: 0.60, shown: 0.60 },
    { what: 'EPS rise in mistakes', value: (PO.buyback.eps / PO.epsBefore - 1) * 100, shown: 8.9, tol: 0.05 },
  ],
};
