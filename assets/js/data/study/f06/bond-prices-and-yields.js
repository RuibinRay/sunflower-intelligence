// bond-prices-and-yields.js — F06 · Bond prices and yields. Content only; exercises are in bond-prices-and-yields.ex.js.
// The four bonds (two government, two corporate; all fictional) come from case.js BONDS; prices, durations and
// convexity from core/investments.js (bondAtYield, duration, priceChangeApprox). The bond fund's 2022 fall is the
// SIMULATED history in data.js (tools/study/f06-data.py planted −13% for 2022). Real-world statements are quoted from
// OpenStax Principles of Finance (sections 10.1, 10.2, 10.4) and FINRA, opened on 11 November 2026.
import { BONDS, SERIES, MONTHS, ASSETS, ANA, COMPANIES } from './case.js?v=31';
import * as IV from '../../../core/investments.js?v=31';

const [G5, G20, HB, MB] = BONDS;
const at = (b, y) => IV.bondAtYield({ face: 100, ...b }, y);
const g5 = at(G5, G5.ytm), g20 = at(G20, G20.ytm), hb = at(HB, HB.ytm), mb = at(MB, MB.ytm);
const g5up = at(G5, G5.ytm + 0.01).price, g5dn = at(G5, G5.ytm - 0.01).price;
const g20up = at(G20, G20.ytm + 0.01).price, g20dn = at(G20, G20.ytm - 0.01).price;
const chg = (p1, p0) => (p1 / p0 - 1) * 100;
// the 5-year note's price as it ages, yield unchanged
const PATH = [5, 4, 3, 2, 1, 0].map((n) => ({ n, p: n === 0 ? 100 : at({ ...G5, years: n }, G5.ytm).price }));
const g5half = at({ ...G5, years: 4.5 }, G5.ytm).price;
const hprHalf = (g5half - g5.price + 2) / g5.price;
// the 5-year note's cash flows, for the duration table
const g5rows = g5.flows.map((f, i) => { const pv = f.cf / (1 + G5.ytm / 2) ** (i + 1); return { t: f.t, cf: f.cf, pv, w: pv / g5.price }; });
const annFactor = (1 - (1 + G5.ytm / 2) ** -10) / (G5.ytm / 2);
// spreads
const gov7 = G5.ytm + (7 - 5) / (20 - 5) * (G20.ytm - G5.ytm);
const spreadH = HB.ytm - gov7, spreadM = MB.ytm - G5.ytm;
const hbWide = at(HB, HB.ytm + 0.01).price;
// the simulated bond fund
const YB = IV.yearly(MONTHS, SERIES.bonds);
const r2022 = YB.find((y) => y.year === '2022').ret, r2023 = YB.find((y) => y.year === '2023').ret;
const DD = IV.maxDrawdown(SERIES.bonds), W = IV.wealth(SERIES.bonds);
const recIdx = W.findIndex((v, i) => i > DD.trough && v >= W[DD.peak]);
const fundDur = Number(/average duration about (\d+) years/.exec(ASSETS.bonds.holds)[1]);
// the price–yield figure (20-year government bond)
const FX = (y) => 70 + (y / 12) * 390, FY = (p) => 255 - (p / 200) * 230;
const curve = Array.from({ length: 49 }, (_, i) => i * 0.25).map((y) => `${FX(y).toFixed(1)},${FY(at(G20, y / 100).price).toFixed(1)}`).join(' ');
const slope = -g20.modified * g20.price;   // dollars per 1.00 of yield
const tan = (y) => g20.price + slope * (y - G20.ytm * 100) / 100;
const tanLine = `${FX(1).toFixed(1)},${FY(tan(1)).toFixed(1)} ${FX(11).toFixed(1)},${FY(tan(11)).toFixed(1)}`;
const SVG = `<svg viewBox="0 0 480 310" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="16"><g stroke="var(--rule-strong)" stroke-width="1"><line x1="70" y1="255" x2="460" y2="255"/><line x1="70" y1="25" x2="70" y2="255"/><line x1="70" y1="${FY(100).toFixed(1)}" x2="460" y2="${FY(100).toFixed(1)}" stroke-dasharray="4 4"/></g><polyline points="${curve}" fill="none" stroke="var(--series-1)" stroke-width="3"/><polyline points="${tanLine}" fill="none" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="7 5"/><circle cx="${FX(4.65).toFixed(1)}" cy="${FY(g20.price).toFixed(1)}" r="5" style="fill:var(--ink)"/><g fill="currentColor"><text x="70" y="278" text-anchor="middle">0%</text><text x="${FX(4).toFixed(1)}" y="278" text-anchor="middle">4%</text><text x="${FX(8).toFixed(1)}" y="278" text-anchor="middle">8%</text><text x="460" y="278" text-anchor="middle">12%</text><text x="265" y="302" text-anchor="middle">Yield to maturity</text><text x="62" y="${(FY(200) + 5).toFixed(1)}" text-anchor="end">$200</text><text x="62" y="${(FY(100) + 5).toFixed(1)}" text-anchor="end">$100</text><text x="62" y="260" text-anchor="end">$0</text><text x="${(FX(4.65) + 12).toFixed(1)}" y="${(FY(g20.price) - 12).toFixed(1)}">today: 4.65%, $${g20.price.toFixed(2)}</text><text x="340" y="45">exact price</text><text x="340" y="71">duration line</text></g><line x1="300" y1="40" x2="330" y2="40" stroke="var(--series-1)" stroke-width="3"/><line x1="300" y1="66" x2="330" y2="66" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="7 5"/></svg>`;

export default {
  slug: 'bond-prices-and-yields',
  title: 'Bond prices and yields',
  blurb: 'Price a bond as the present value of its payments, read its yields, measure how far its price moves when interest rates change (duration and convexity), and see what credit risk adds to a yield.',
  status: 'draft',
  objectives: [
    'Calculate a bond’s price from its coupon, maturity and yield to maturity, and its yield to maturity from its price.',
    'Distinguish the coupon rate, the current yield and the yield to maturity, and explain premium and discount bonds and the pull to par.',
    'Calculate Macaulay and modified duration, and use them, with convexity, to estimate the price change for a change in yields.',
    'Explain credit risk, ratings and credit spreads, and calculate a spread in basis points.',
    'Interpret a bond fund’s loss in a year of rising rates using its duration.',
  ],
  prerequisites: [
    { lesson: 'f04/annuities', why: 'A bond’s coupons are an annuity; its price is the present value of that annuity plus the face value.' },
    { lesson: 'f04/discounting-cash-flows', why: 'Discounting a stream of cash flows, and the yield as an internal rate of return.' },
    { lesson: 'f05/cost-of-debt-and-equity', why: 'The yield to maturity as the cost of debt, with Brightcup Coffee’s bond and the RATE function.' },
    { lesson: 'f06/shares-and-markets', why: 'Where bonds sit in the queue of claims, and how securities trade.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s retirement account could also hold the ${ASSETS.bonds.name}, which holds ${ASSETS.bonds.holds}. In the course’s simulated history it was the calm part of a portfolio: it turned $1 at the start of 2013 into $${W[180].toFixed(2)} by the end of 2027, and lost money in only one calendar year. That year, 2022, it fell ${Math.abs(r2022 * 100).toFixed(0)}%, while the market fund also fell. Ana wants to know how a fund of high-quality bonds, whose issuers paid every coupon, could lose 13% in a year, and whether it could happen again. The answer is in how bond prices respond to interest rates. (The market history in this course is simulated for teaching and the funds are fictional; real history should be checked against sources such as Aswath Damodaran’s annually updated historical returns.)` },
    { p: 'A <g>bond</g> is a loan that can be traded. The <g>issuer</g> (a government or a company) borrows by selling bonds, and promises each holder fixed interest payments, the coupons, and repayment of the <g>face value</g> on the maturity date. The <g>coupon rate</g> is fixed when the bond is issued. Once it trades, though, a bond’s price moves every day, and the return a buyer earns depends on the price she pays.' },
    { p: 'The link is the one F04 taught for any stream of cash flows: a bond’s price is the present value of its remaining payments, discounted at the return investors currently require for that kind of bond. That return is its <g>yield to maturity</g>. If investors come to require more, because interest rates in the economy have risen or the issuer looks riskier, the same fixed payments are discounted at a higher rate and the price falls. Bond prices and yields move in opposite directions, always.' },
    { p: 'How far the price moves depends on how long the investor must wait for the money. A payment due in six months is barely affected by a change in the discount rate; a payment due in twenty years is affected a great deal. The measure of that waiting time, and so of a bond’s sensitivity to interest rates, is its <g>duration</g>. The Harbourline bond fund’s average duration is about 6 years, which is why 2022 hurt.' },
    { table: {
      caption: 'Four bonds, June 2028 (fictional; coupons paid twice a year, prices per $100 of face value)',
      head: ['Bond', 'Coupon', 'Years left', 'Rating', 'Yield to maturity'],
      align: ['l', 'r', 'r', 'l', 'r'],
      rows: BONDS.map((b) => [b.name, `${(b.couponRate * 100).toFixed(2)}%`, String(b.years), b.rating, `${(b.ytm * 100).toFixed(2)}%`]),
      note: 'The governments, companies and yields are invented for the course. Yields are annual rates compounded twice a year, as bond yields are usually quoted.',
    } },
    { callout: 'key', title: 'Price and yield are two ways of stating the same thing', html: 'Given a bond’s payments, every price corresponds to exactly one yield to maturity and every yield to one price. Saying “the yield rose from 4.20% to 5.20%” and “the price fell from $99.11 to $94.78” describes the same event for the five-year government note.' },
  ],

  theory: [
    { h: 'The terms of a bond' },
    { p: 'Every bond states its issuer, its face value (usually quoted per $100, or a multiple of $1,000 for individual bonds), its coupon rate, how often the coupon is paid and its maturity date. OpenStax notes that bond yields are expressed in annual percentage terms unless otherwise indicated. With coupons paid twice a year, a 4% coupon on $100 means $2.00 every six months, and a yield quoted as 4.20% a year means 2.10% a half-year. Prices are quoted per $100 of face value, so a price of $99.11 means a bond with $1,000 of face value costs $991.06.' },
    { p: 'Government bonds issued in a country’s own currency are treated as free of <g>default</g> risk. Corporate bonds are not, and the two corporate bonds above are issued by F05’s listed peers. A bond with no coupons at all, a <g>zero-coupon bond</g>, pays only its face value at maturity and is sold at a deep discount instead.' },

    { h: 'Pricing a bond' },
    { p: 'The price is the present value of the coupons, an annuity, plus the present value of the face value. With <m>m</m> payments a year, an annual yield <m>y</m> and <m>n</m> remaining payments:' },
    { math: String.raw`P = \dfrac{C}{m} \times \dfrac{1 - (1 + y/m)^{-n}}{y/m} + \dfrac{F}{(1 + y/m)^{n}}` },
    { p: 'The five-year government note pays $2.00 every half-year for ten half-years and $100 at the end, and yields 4.20%, or 2.10% a half-year. The annuity factor is <m>(1 - 1.021^{-10}) \\div 0.021 = 8.936</m>, so the coupons are worth <m>2.00 \\times 8.936 = 17.87</m> dollars. The face value is worth <m>100 \\div 1.021^{10} = 81.23</m> dollars. The price is <m>17.87 + 81.23 = 99.11</m> dollars. A spreadsheet gives the same answer with <x>=PV(4.2%/2,10,-2,-100)</x>; Excel’s PRICE and YIELD functions need settlement and maturity dates, so this course builds prices with PV and yields with RATE.' },
    { p: 'The note trades below its $100 face value because its 4% coupon is below the 4.20% investors now require. OpenStax puts the rule in one line: when the coupon rate is less than the yield to maturity, the bond sells at a discount, and when the coupon rate exceeds the yield to maturity, it sells at a premium. A <g>discount bond</g> pays its buyer part of her return as a gain from the price up to face value; a <g>premium bond</g> pays a coupon above the market’s rate and loses the excess back as its price falls to face value.' },

    { h: 'Three yields' },
    { p: 'F05 used the yield to maturity as a firm’s cost of debt and found it from a price with the RATE function. Two other yields are quoted alongside it, and the three answer different questions.' },
    { list: [
      'The <b>coupon rate</b> is the annual coupon divided by face value: 4.00% for the note. It never changes.',
      `The <g>current yield</g> is the annual coupon divided by the price: <m>4.00 \\div 99.11 = 4.04\\%</m>. It measures the income a buyer receives each year on the money she pays, but ignores the gain or loss as the price moves to $100.`,
      'The <b>yield to maturity</b> includes both the coupons and that gain or loss: 4.20%. It is the internal rate of return a buyer earns if she holds the bond to maturity, every payment arrives and the coupons can be reinvested at the same rate.',
    ] },
    { p: 'For a discount bond the three are always in the order coupon rate < current yield < yield to maturity; for a premium bond the order reverses; at par all three are equal. The Harbour Street 2035 bond shows the order: coupon 5.50%, current yield <m>5.50 \\div 96.62 = 5.69\\%</m>, yield to maturity 6.10%.' },

    { h: 'The pull to par' },
    { p: 'A bond’s price must reach its face value on the maturity date, whatever happens before. If the yield stays where it is, a discount bond’s price rises towards $100 and a premium bond’s falls towards $100, a path called the <g>pull to par</g>. The table shows the five-year note at an unchanged 4.20% yield.' },
    { table: {
      caption: 'The five-year government note’s price as it ages, yield unchanged at 4.20% (fictional)',
      head: ['Years to maturity', ...PATH.map((r) => String(r.n))],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [['Price per $100', ...PATH.map((r) => r.p.toFixed(2))]],
    } },
    { p: 'An investor who buys at $99.11 and sells six months later, with the yield unchanged, earns the $2.00 coupon plus a small price gain to $99.19: <m>(99.19 - 99.11 + 2.00) \\div 99.11 = 2.10\\%</m> for the half-year, exactly the yield per period. When yields do not change, a bond earns its yield to maturity in every period. When they do change, the return in that period differs from the yield, sometimes by a great deal, which is the subject of the rest of this lesson.' },

    { h: 'Interest-rate risk and the price–yield curve' },
    { p: '<g>Interest-rate risk</g> is the risk that a bond’s price falls because yields rise. OpenStax states the core fact: when interest rates rise, bond values fall. The figure plots the 20-year government bond’s price against its yield. The curve slopes down, and it is bowed: as the yield rises, each further point of yield lowers the price by less.' },
    { figure: { svg: SVG,
      caption: `Price of the 20-year 4.5% government bond (fictional) against its yield to maturity. The solid curve is the exact price; the dashed straight line touches it at today’s yield of 4.65% and falls at the rate modified duration predicts. The curve lies above the line everywhere: that gap is convexity.`,
      alt: `A downward-sloping curve of price against yield to maturity, from $190 at a yield of 0% to $43.58 at 12%, bowed towards the origin. A dot marks today’s yield of 4.65% and price of $${g20.price.toFixed(2)}. A dashed straight line touches the curve at the dot and falls more steeply away from it in both directions, so it lies below the curve everywhere except at the dot. A dashed horizontal line marks a price of $100.` } },
    { p: 'Compare the two government bonds when every yield rises by one percentage point. The five-year note falls from $99.11 to $94.78, a loss of 4.37%; the 20-year bond falls from $98.06 to $86.32, a loss of 11.97%. Longer bonds carry more interest-rate risk, because more of their value lies in payments far in the future. Lower coupons add to it for the same reason: with smaller coupons, more of the value is in the face value at the end.' },

    { h: 'Duration' },
    { p: '<g>Macaulay duration</g> measures how long, on average, a bondholder waits for her money: the average time of the bond’s payments, each weighted by its share of the bond’s price.' },
    { math: String.raw`D_{\text{Mac}} = \sum_{k=1}^{n} \dfrac{t_k \times PV(CF_k)}{P}` },
    { table: {
      caption: 'Macaulay duration of the five-year government note at 4.20% (fictional; first four and last payments shown)',
      head: ['Time (years)', 'Payment', 'PV at 2.10% a half-year', 'Share of price', 'Time × share'],
      align: ['r', 'r', 'r', 'r', 'r'],
      rows: [...g5rows.slice(0, 4), g5rows[9]].map((r) => [r.t.toFixed(1), `$${r.cf.toFixed(2)}`, `$${r.pv.toFixed(2)}`, `${(r.w * 100).toFixed(1)}%`, (r.t * r.w).toFixed(3)]),
      foot: [['Total (all ten payments)', '', `$${g5.price.toFixed(2)}`, '100.0%', g5.macaulay.toFixed(2)]],
      note: 'The five half-year payments not shown (years 2.5 to 4.5) complete the totals.',
    } },
    { p: 'The final payment, $102, is 83.6% of the price, so the note’s duration, 4.58 years, is close to its five-year maturity. A zero-coupon bond’s duration equals its maturity exactly, because it has only one payment. Coupon bonds always have a duration shorter than their maturity.' },
    { p: '<g>Modified duration</g> turns the waiting time into a price sensitivity. It is Macaulay duration divided by one plus the yield per period, and it gives the approximate percentage change in price for a change in yield:' },
    { math: String.raw`D_{\text{mod}} = \dfrac{D_{\text{Mac}}}{1 + y/m}, \qquad \dfrac{\Delta P}{P} \approx -D_{\text{mod}} \times \Delta y` },
    { p: 'The five-year note’s modified duration is <m>4.58 \\div 1.021 = 4.48</m>, so a one-point rise in yields lowers its price by about 4.48%; the exact fall is 4.37%. FINRA gives investors the same rule of thumb: if a bond has a duration of 10 and interest rates increase by 1 percentage point, its price would be expected to decline by approximately 10 percent. Durations are measured in years, and for a portfolio or a fund they are the value-weighted average of the holdings’ durations.' },
    { table: {
      caption: 'Duration and a one-point rise in yields for the four bonds (fictional; prices per $100)',
      head: ['Bond', 'Price', 'Macaulay (years)', 'Modified', 'Exact change'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [[G5, g5], [G20, g20], [HB, hb], [MB, mb]].map(([b, a]) => [b.name, `$${a.price.toFixed(2)}`, a.macaulay.toFixed(2), a.modified.toFixed(2), `−${Math.abs(chg(at(b, b.ytm + 0.01).price, a.price)).toFixed(2)}%`]),
    } },

    { h: 'Convexity' },
    { p: 'Duration draws a straight line through a curve, so it is accurate only for small changes in yield. For the 20-year bond, modified duration of 13.02 predicts a fall of 13.02% for a one-point rise; the true fall is 11.97%. For a one-point fall it predicts a rise of 13.02%; the true rise is 14.21%. The bond loses less than duration predicts when yields rise and gains more when they fall. That asymmetry is <g>convexity</g>, the curvature in the figure, and adding a second term improves the estimate:' },
    { math: String.raw`\dfrac{\Delta P}{P} \approx -D_{\text{mod}}\,\Delta y + \tfrac{1}{2}\,C\,(\Delta y)^2` },
    { p: 'The 20-year bond’s convexity is 223.1 (in years squared). For a one-point rise the estimate becomes <m>-13.02 \\times 0.01 + 0.5 \\times 223.1 \\times 0.01^2 = -13.02\\% + 1.12\\% = -11.90\\%</m>, close to the true −11.97%. Convexity matters most for long bonds and large moves; for the five-year note and a one-point move it adds only 0.12 points. Other things equal, investors value convexity, because it cushions losses and adds to gains.' },

    { h: 'Credit risk, ratings and spreads' },
    { p: 'A corporate bond carries <g>credit risk</g>: the risk that the issuer pays late, pays less or does not pay at all. Investors demand a higher yield to bear it. <g>Credit rating</g> agencies grade issuers’ ability to pay; OpenStax describes a bond rating as a grade that indicates credit quality, and states that any bond rated BBB (S&P, Fitch) or Baa (Moody’s) or higher is referred to as <g>investment grade</g>. Lower-rated bonds are often called non-investment grade or high yield.' },
    { p: 'The extra yield over a government bond of the same maturity is the <g>credit spread</g>, usually quoted in <g>basis points</g> (hundredths of a percentage point). There is no seven-year government bond in the table, so estimate its yield by interpolating between the five-year (4.20%) and the 20-year (4.65%): <m>4.20\\% + (2 \\div 15) \\times 0.45\\% = 4.26\\%</m>. Harbour Street’s 2035 bond yields 6.10%, a spread of <m>6.10\\% - 4.26\\% = 1.84</m> points, or 184 basis points. Morrow & Pike’s 2031 bond, with three and a half years left, yields 5.45%, 125 basis points above the five-year note (a longer, and here higher-yielding, benchmark, so its spread over a matched maturity would be at least as wide).' },
    { p: 'Both companies are rated BBB, yet Harbour Street’s spread is wider. Part of the gap is maturity (lenders ask more to lend for longer to a risky borrower) and part is leverage: Harbour Street’s debt is 0.55 times its market capitalisation, against 0.15 for Morrow & Pike. A spread that widens after bad news is a price fall for the bondholders: if Harbour Street’s spread widened by one point, its bond would fall from $96.62 to $91.29, 5.52%. The yield to maturity is the promised return; F05 noted that the expected return on a risky bond is lower, because some payments may not arrive.' },

    { h: '2022 in the bond fund' },
    { p: `The Harbourline Aggregate Bond Index Fund holds investment-grade government and corporate bonds with an average duration of about ${fundDur} years. In the simulated history it returned ${(r2022 * 100).toFixed(2).replace('-', '−')}% in 2022, after nine years without a loss. From its peak at the end of December 2021 it fell ${Math.abs(DD.drawdown * 100).toFixed(1)}% to the end of October 2022, then rose ${(r2023 * 100).toFixed(1)}% in 2023 and regained its peak by the end of March 2025.` },
    { p: `Duration explains a fall of that size. With a duration of about ${fundDur}, every one-point rise in yields costs the fund about ${fundDur}% of its value, so a 13% loss is what a rise of roughly <m>13 \\div ${fundDur} \\approx 2.2</m> percentage points would produce, and a little more once the year’s coupon income is counted. The generator that built the data planted the 2022 loss to show exactly this; it does not model yields, so read the 2.2 points as what duration implies, not as a figure in the data. No issuer needs to default for a bond fund to lose money: rising rates alone are enough.` },
    { callout: 'note', title: 'Higher yields are bad news now and good news later', html: `A rise in yields lowers today’s prices but raises the income on every coupon reinvested and every new bond bought. For an investor who holds an individual bond to maturity the price fall is temporary: the pull to par brings it back to $100. For a fund, which keeps replacing maturing bonds, the higher yields flow into future returns. Roughly, an investor whose horizon is longer than her bonds’ duration ends up better off after a rise in yields, and one whose horizon is shorter ends up worse off. Ana’s horizon of ${ANA.retirement.horizon.replace('until she retires, in ', '')} is far longer than the fund’s duration of about ${fundDur} years; the measuring-risk lesson in module 2 looks at the fund’s ups and downs alongside the market’s.` },
  ],

  formulas: [
    { id: 'bond-price', name: 'Bond price',
      tex: String.raw`P = \dfrac{C}{m} \times \dfrac{1 - (1 + y/m)^{-n}}{y/m} + \dfrac{F}{(1 + y/m)^{n}}`,
      where: [[String.raw`P`, 'Price of the bond today, just after a coupon date', '$'], [String.raw`C`, 'Annual coupon: coupon rate × face value', '$ per year'], [String.raw`m`, 'Coupon payments a year (2 for semi-annual)', ''], [String.raw`y`, 'Yield to maturity, as an annual rate compounded m times a year', '% per year'], [String.raw`n`, 'Coupon payments remaining: years × m', ''], [String.raw`F`, 'Face value, repaid at maturity', '$']],
      assumptions: 'Priced on a coupon date; between coupon dates the buyer also pays accrued interest, which this course leaves aside.',
      note: 'In a spreadsheet: =PV(y/m, n, −C/m, −F).' },
    { id: 'bond-current-yield', name: 'Current yield',
      tex: String.raw`\text{Current yield} = \dfrac{C}{P}`,
      where: [[String.raw`C`, 'Annual coupon in dollars', '$ per year'], [String.raw`P`, 'Price today', '$']],
      assumptions: 'Ignores the gain or loss as the price moves to face value, so it differs from the yield to maturity except at par.' },
    { id: 'bond-macaulay', name: 'Macaulay duration',
      tex: String.raw`D_{\text{Mac}} = \dfrac{1}{P}\sum_{k=1}^{n} \dfrac{t_k\, CF_k}{(1 + y/m)^{k}}`,
      where: [[String.raw`D_{\text{Mac}}`, 'Macaulay duration: the present-value-weighted average time of the payments', 'years'], [String.raw`t_k`, 'Time of payment k', 'years'], [String.raw`CF_k`, 'Payment k: a coupon, plus the face value at the end', '$'], [String.raw`P`, 'Price: the sum of the payments’ present values', '$'], [String.raw`y`, 'Yield to maturity', '% per year'], [String.raw`m`, 'Payments a year', ''], [String.raw`n`, 'Number of payments', '']],
      assumptions: 'Every payment is made in full; one yield discounts every payment.' },
    { id: 'bond-modified', name: 'Modified duration and the price change for a yield change',
      tex: String.raw`D_{\text{mod}} = \dfrac{D_{\text{Mac}}}{1 + y/m}, \qquad \dfrac{\Delta P}{P} \approx -D_{\text{mod}}\,\Delta y + \tfrac{1}{2}\,C_{x}\,(\Delta y)^2`,
      where: [[String.raw`D_{\text{mod}}`, 'Modified duration: the approximate % price change for a 1-point change in yield', 'years'], [String.raw`D_{\text{Mac}}`, 'Macaulay duration', 'years'], [String.raw`\Delta y`, 'Change in yield, as a decimal (0.01 = one percentage point)', ''], [String.raw`C_{x}`, 'Convexity: the curvature of the price–yield curve', 'years²'], [String.raw`y/m`, 'Yield per coupon period', ''], [String.raw`P`, 'Price before the change in yield', '$']],
      assumptions: 'All yields move by the same amount; the duration term alone is accurate only for small changes, and the convexity term improves it for larger ones.' },
    { id: 'bond-spread', name: 'Credit spread',
      tex: String.raw`\text{Spread} = y_{\text{corporate}} - y_{\text{government}}`,
      where: [[String.raw`y_{\text{corporate}}`, 'Yield to maturity of the corporate bond', '% per year'], [String.raw`y_{\text{government}}`, 'Yield of a government bond of the same maturity (interpolated if none matches)', '% per year']],
      assumptions: 'Both yields are quoted on the same basis (here, compounded twice a year).',
      note: 'Usually quoted in basis points: 1 basis point = 0.01 percentage point.' },
  ],

  examples: [
    { level: 'simple', title: 'Pricing the five-year government note', fictional: true,
      setup: 'The five-year government note pays a 4% coupon twice a year on $100 of face value. Investors require a yield of 4.20% a year (compounded twice a year). What is its price, and what is its current yield?',
      steps: [
        'Per period: a coupon of <m>4 \\div 2 = 2.00</m> dollars, a yield of <m>4.20\\% \\div 2 = 2.10\\%</m>, and <m>5 \\times 2 = 10</m> payments.',
        'The coupons are an annuity: <m>2.00 \\times (1 - 1.021^{-10}) \\div 0.021 = 2.00 \\times 8.936 = 17.87</m> dollars.',
        'The face value is a single amount: <m>100 \\div 1.021^{10} = 81.23</m> dollars.',
        'Price: <m>17.87 + 81.23 = 99.11</m> dollars. Current yield: <m>4.00 \\div 99.11 = 4.04\\%</m>.',
      ],
      answer: 'About $99.11 per $100 of face value; current yield 4.04%, between the 4.00% coupon and the 4.20% yield to maturity.',
      interpretation: 'The note’s coupon is below what investors now require, so it sells at a discount. A buyer earns 4.20% a year if she holds it to maturity: $2.00 every half-year plus the $0.89 rise to $100.' },
    { level: 'challenging', title: 'How far does the 20-year bond fall?', fictional: true,
      setup: `The 20-year government bond (4.5% coupon, paid twice a year) yields 4.65% and is priced at $${g20.price.toFixed(2)}. Its Macaulay duration is ${g20.macaulay.toFixed(2)} years and its convexity ${g20.convexity.toFixed(1)}. Estimate its price if every yield rises by one percentage point, first with duration alone, then with convexity, and compare with the exact price.`,
      steps: [
        `Modified duration: <m>${g20.macaulay.toFixed(2)} \\div (1 + 0.0465 \\div 2) = ${g20.macaulay.toFixed(2)} \\div 1.02325 = ${g20.modified.toFixed(2)}</m>.`,
        `Duration alone: <m>\\Delta P / P \\approx -13.02 \\times 0.01 = -13.02\\%</m>, a price of <m>98.06 \\times (1 - 0.1302) = 85.30</m> dollars.`,
        `With convexity: <m>-13.02\\% + 0.5 \\times 223.1 \\times 0.01^2 = -13.02\\% + 1.12\\% = -11.90\\%</m>, a price of $86.39.`,
        'Exact: repricing the bond at 5.65% (2.825% a half-year for 40 payments) gives $86.32, a fall of 11.97%.',
      ],
      answer: 'About $85.30 with duration alone and $86.39 with convexity, against an exact $86.32: a fall of about 12%.',
      interpretation: 'Duration overstates the loss by about a point for a move this large in a bond this long; adding convexity brings the estimate within a tenth of a point. For small moves or short bonds, duration alone is close enough.' },
    { level: 'applied', title: 'What 2022 means for a bond fund holder', fictional: true,
      setup: `Ana compares the bond fund’s simulated 2022 return of ${(r2022 * 100).toFixed(0).replace('-', '−')}% with its average duration of about ${fundDur} years. She wants to know what rise in yields that loss implies, what a further one-point rise would cost on $10,000 in the fund, and why a loss on bonds she might hold for decades should not be read like a loss on bonds she needs next year.`,
      steps: [
        `Price change ≈ −duration × change in yield, so the change in yield ≈ <m>13\\% \\div ${fundDur} \\approx 2.2</m> percentage points, ignoring the year’s coupon income (which offset part of the price fall, so the true rise in yields would be a little larger).`,
        `A further one-point rise: <m>-${fundDur} \\times 1\\% = -${fundDur}\\%</m>, about <m>${fundDur / 100} \\times 10{,}000 = ${fundDur * 100}</m> dollars on $10,000, before income.`,
        'Each year the fund replaces maturing bonds with new ones at the higher yields, so its income rises; in the simulated data it gained 9.71% in 2023 and was back at its December 2021 peak by the end of March 2025.',
        `Her money will stay invested for about 30 years, far longer than the ${fundDur}-year duration: higher yields raise what she earns over most of that time. Money needed in a year, by contrast, would have to be sold at the lower price.`,
      ],
      answer: `The 2022 loss implies yields rose by roughly 2.2 points or more; another one-point rise would cost about $${fundDur * 100} on $10,000. For a 30-year investor the loss is a price change that later income can recover; for money needed soon it is a real loss.`,
      interpretation: 'Bond funds are not risk-free, even when every issuer pays. Their risk is mostly interest-rate risk, measured by duration, and matching duration to the horizon is how investors manage it. That is one reason Ana’s deposit money, needed in April 2032, stays in a savings account rather than a bond fund.' },
  ],

  demo: [
    { widget: 'bond-price', intro: 'Start with the five-year government note. Lower the yield below the coupon and watch the price rise above $100; lengthen the maturity and watch the curve steepen and the duration grow. Set the coupon to 0 to see a zero-coupon bond, whose Macaulay duration equals its maturity.' },
    { widget: 'bond-years', intro: 'The simulated bond fund’s calendar-year returns beside one-month bills. Find 2022, the only losing year, and note how much higher the bills’ return was by 2023: the same rise in interest rates that cut bond prices raised the income on new money.' },
    { widget: 'bond-shock', intro: 'Start with the 20-year bond and a one-point rise. Compare the exact change with the duration estimate, then make the move larger and the bond shorter: the gap between the straight line and the curve is convexity.' },
  ],

  mistakes: [
    { title: 'Thinking a bond’s price rises when interest rates rise', html: 'The payments are fixed, so a higher required return means a lower present value. Price and yield always move in opposite directions. A bond fund described as “paying more when rates rise” pays more on new bonds, after its existing bonds have fallen in price.' },
    { title: 'Using the coupon rate or the current yield as the return', html: 'The coupon rate is fixed at issue, and the current yield ignores the move to face value. Only the yield to maturity measures what a buyer earns by holding to maturity: 4.20% for the note, not 4.00% or 4.04%.' },
    { title: 'Forgetting to halve the yield and double the periods', html: 'With coupons twice a year, discount at the yield per half-year (4.20% ÷ 2 = 2.10%) for twice as many periods (10, not 5), and use half the annual coupon ($2.00). Discounting $4.00 a year for five years at 4.20% gives a slightly different, wrong, price for a semi-annual bond.' },
    { title: 'Treating duration as the time to maturity', html: 'Macaulay duration is the average time of all the payments, weighted by present value, so a coupon bond’s duration is shorter than its maturity: 4.58 years for the five-year note, 13.32 years for the 20-year bond. Only a zero-coupon bond’s duration equals its maturity.' },
    { title: 'Using duration for large moves without convexity', html: 'Duration is a straight-line estimate. For a one-point move in a 20-year bond it is wrong by about a point; for a three-point move by much more. Add the convexity term, or reprice the bond at the new yield.' },
    { title: 'Assuming a high-quality bond fund cannot lose money', html: 'Credit quality protects against default, not against rising rates. The simulated bond fund, holding only investment-grade bonds, fell 13% in 2022 because of its duration.' },
  ],

  application: [
    { p: '<b>Ana reading a bond fund’s fact sheet.</b> FINRA advises investors to look up a bond fund’s duration on its fact sheet. Ana does, and finds the Harbourline fund’s average duration of about six years and its average credit rating of investment grade. She now reads those two numbers as the fund’s two risks: about 6% of value for each point that yields rise, and a small chance that some issuers default. A short-term bond fund, with a duration of two or three years, would fall less in a year like 2022 and earn less when yields fall.' },
    { p: '<b>A pension fund matching its promises.</b> A fictional pension fund owes its members payments with a duration of about 14 years. If it held bonds with a duration of four years, a fall in interest rates would raise the present value of its promises far more than the value of its bonds. Its investment committee therefore buys long bonds so that the duration of its assets roughly matches that of its liabilities, and the two move together when rates change. Duration here is a tool for managing a balance sheet, not only a measure of risk.' },
    { p: '<b>A treasurer issuing bonds.</b> Harbour Street’s treasurer, planning to refinance in 2029, watches the spread on its 2035 bond. A spread of 184 basis points over government bonds tells her roughly what a new seven-year bond would have to pay; if the spread widened after a weak year, every new borrowing would cost more, and so would the company’s cost of capital, which F05 built from the yield on its debt.' },
    { p: '<b>A credit analyst.</b> A credit analyst at a fictional insurer compares Morrow & Pike’s and Harbour Street’s bonds, both rated BBB. She reads the wider spread on Harbour Street’s as the market’s price for its longer maturity and heavier debt, and checks whether that extra yield pays enough for the extra risk of a downgrade below investment grade, which would force some holders to sell.' },
  ],

  summary: [
    'A bond’s price is the present value of its coupons (an annuity) and its face value, discounted at its yield to maturity; price and yield move in opposite directions.',
    'Coupon rate, current yield and yield to maturity differ: for a discount bond coupon < current yield < YTM; for a premium bond the order reverses.',
    'With yields unchanged a bond’s price is pulled to par as it ages, and it earns its yield each period.',
    'Macaulay duration is the present-value-weighted average time of the payments; modified duration = Macaulay ÷ (1 + y/m) gives ΔP/P ≈ −D_mod × Δy.',
    'Convexity makes bonds fall less and rise more than duration predicts; add ½ × C × (Δy)² for large moves or long bonds.',
    'Credit risk adds a spread over government yields: Harbour Street’s 2035 bond is 184 basis points over an interpolated 4.26%.',
    'A bond fund with a duration of about 6 years loses about 6% for each one-point rise in yields: the simulated 13% fall in 2022 needed no defaults.',
  ],
  glossary: [
    { term: 'Current yield', def: 'A bond’s annual coupon divided by its price: the income it pays each year on the money invested, ignoring any gain or loss to maturity.' },
    { term: 'Discount bond', def: 'A bond that trades below its face value because its coupon rate is below its yield to maturity.' },
    { term: 'Premium bond', def: 'A bond that trades above its face value because its coupon rate is above its yield to maturity.' },
    { term: 'Pull to par', def: 'The movement of a bond’s price towards its face value as it approaches maturity, which happens whether the bond trades at a premium or a discount.' },
    { term: 'Zero-coupon bond', def: 'A bond that pays no coupons, only its face value at maturity, and so is sold at a discount to face value.' },
    { term: 'Interest-rate risk', def: 'The risk that the price of a bond or other fixed-income investment falls because market interest rates rise.' },
    { term: 'Duration', def: 'A measure of a bond’s sensitivity to interest rates and of the average time until its payments are received, in years. See Macaulay duration and modified duration.' },
    { term: 'Macaulay duration', def: 'The average time until a bond’s payments are received, each payment’s time weighted by its share of the bond’s present value, in years.' },
    { term: 'Modified duration', def: 'Macaulay duration divided by one plus the yield per period: the approximate percentage fall in a bond’s price for a one-percentage-point rise in its yield.' },
    { term: 'Convexity', def: 'The curvature of the relationship between a bond’s price and its yield, which makes the price fall less and rise more than duration alone predicts.' },
    { term: 'Credit risk', def: 'The risk that a borrower pays late, pays less than promised or does not pay at all.' },
    { term: 'Credit rating', def: 'A grade given by a rating agency to a borrower or a bond to indicate its credit quality, its ability and willingness to make the promised payments.' },
    { term: 'Investment grade', def: 'A credit rating of BBB (S&P, Fitch) or Baa (Moody’s) or higher; bonds rated below it are called non-investment grade or high yield.' },
    { term: 'Credit spread', def: 'The difference between the yield on a bond with credit risk and the yield on a government bond of the same maturity, usually quoted in basis points.' },
    { term: 'Basis point', def: 'One hundredth of a percentage point (0.01%), used to quote yields, spreads and fees precisely.' },
  ],
  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 10.1, “Characteristics of Bonds”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/10-1-characteristics-of-bonds', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 10.2, “Bond Valuation”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/10-2-bond-valuation', checked: '2026-11-11' },
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 10.4, “Risks of Interest Rates and Default”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/10-4-risks-of-interest-rates-and-default', checked: '2026-11-11' },
    { text: 'FINRA. <i>Brush Up on Bonds: Interest Rate Changes and Duration</i>. FINRA.org.', url: 'https://www.finra.org/investors/insights/bonds-interest-rate-changes-duration', checked: '2026-11-11' },
  ],
  checks: [
    { what: 'Bond fund $1 grows to', value: W[180], shown: 1.88 },
    { what: 'Bond fund lost money in only one calendar year', value: YB.filter((y) => y.ret < 0).length, shown: 1 },
    { what: 'Bond fund 2022', value: r2022 * 100, shown: -13.00 },
    { what: 'Bond fund 2022 (rounded)', value: Math.abs(r2022 * 100), shown: 13, tol: 0.5 },
    { what: 'Market fund also fell in 2022', value: IV.yearly(MONTHS, SERIES.market).find((y) => y.year === '2022').ret < 0 ? 1 : 0, shown: 1 },
    { what: 'No loss before 2022 (nine years)', value: YB.filter((y) => y.year < '2022' && y.ret < 0).length === 0 && YB.filter((y) => y.year < '2022').length === 9 ? 1 : 0, shown: 1 },
    { what: 'Fund duration from case', value: fundDur, shown: 6 },
    { what: '5y note price', value: g5.price, shown: 99.11 },
    { what: '5y note price per $1,000', value: g5.price * 10, shown: 991.06 },
    { what: '5y half-year coupon', value: G5.couponRate * 100 / 2, shown: 2.00 },
    { what: '5y half-year yield', value: G5.ytm / 2 * 100, shown: 2.10 },
    { what: '5y annuity factor', value: annFactor, shown: 8.936, tol: 0.0005 },
    { what: '5y PV coupons', value: 2 * annFactor, shown: 17.87 },
    { what: '5y PV face', value: 100 / 1.021 ** 10, shown: 81.23 },
    { what: '5y current yield', value: 4 / g5.price * 100, shown: 4.04 },
    { what: '5y gain to par', value: 100 - g5.price, shown: 0.89 },
    { what: '5y price at 5.20%', value: g5up, shown: 94.78 },
    { what: '5y change at +1pt', value: chg(g5up, g5.price), shown: -4.37 },
    { what: '5y up on −1pt', value: chg(g5dn, g5.price), shown: 4.60 },
    { what: '20y price', value: g20.price, shown: 98.06 },
    { what: '20y price at +1', value: g20up, shown: 86.32 },
    { what: '20y change +1', value: chg(g20up, g20.price), shown: -11.97 },
    { what: '20y change −1', value: chg(g20dn, g20.price), shown: 14.21 },
    { what: '20y Macaulay', value: g20.macaulay, shown: 13.32 },
    { what: '20y modified', value: g20.modified, shown: 13.02 },
    { what: '20y 1 + y/2', value: 1 + G20.ytm / 2, shown: 1.02325, tol: 0.000005 },
    { what: '20y duration-only price', value: g20.price * (1 - g20.modified * 0.01), shown: 85.30 },
    { what: '20y convexity', value: g20.convexity, shown: 223.1, tol: 0.05 },
    { what: '20y convexity term', value: 0.5 * g20.convexity * 0.0001 * 100, shown: 1.12 },
    { what: '20y with convexity', value: IV.priceChangeApprox(g20, 0.01) * 100, shown: -11.90 },
    { what: '20y with convexity price', value: g20.price * (1 + IV.priceChangeApprox(g20, 0.01)), shown: 86.39 },
    { what: '20y half-year yield at 5.65%', value: (G20.ytm + 0.01) / 2 * 100, shown: 2.825, tol: 0.0005 },
    { what: '20y duration error about a point', value: g20.modified - Math.abs(chg(g20up, g20.price)), shown: 1, tol: 0.1 },
    { what: '20y price at 0%', value: at(G20, 0).price, shown: 190 },
    { what: '20y price at 12%', value: at(G20, 0.12).price, shown: 43.58 },
    { what: 'Duration and investments.js agree', value: IV.duration({ ...G20 }).modified, shown: 13.02 },
    { what: '5y convexity adds', value: 0.5 * g5.convexity * 0.0001 * 100, shown: 0.12 },
    { what: '5y Macaulay', value: g5.macaulay, shown: 4.58 },
    { what: '5y modified', value: g5.modified, shown: 4.48 },
    { what: '5y last payment share', value: g5rows[9].w * 100, shown: 83.6, tol: 0.05 },
    { what: '5y last payment', value: g5rows[9].cf, shown: 102 },
    { what: 'Harbour price', value: hb.price, shown: 96.62 },
    { what: 'Harbour current yield', value: 5.5 / hb.price * 100, shown: 5.69 },
    { what: 'Harbour coupon < CY < YTM', value: HB.couponRate < 0.055 / hb.price * 100 && 0.055 / hb.price * 100 < HB.ytm ? 1 : 0, shown: 1 },
    { what: 'Path price 4y', value: PATH[1].p, shown: 99.27 },
    { what: 'Price after six months', value: g5half, shown: 99.19 },
    { what: 'Half-year HPR', value: hprHalf * 100, shown: 2.10 },
    { what: 'Path rises monotonically to par', value: PATH.every((r, i) => i === 0 || r.p > PATH[i - 1].p) ? 1 : 0, shown: 1 },
    { what: 'Interpolated 7y government', value: gov7 * 100, shown: 4.26 },
    { what: 'Harbour spread', value: spreadH * 100, shown: 1.84 },
    { what: 'Harbour spread bp', value: spreadH * 10000, shown: 184, tol: 0.5 },
    { what: 'Morrow spread bp', value: spreadM * 10000, shown: 125, tol: 0.5 },
    { what: 'Harbour D/E', value: COMPANIES.harbour.debt / COMPANIES.harbour.marketCap, shown: 0.55 },
    { what: 'Morrow D/E', value: COMPANIES.morrow.debt / COMPANIES.morrow.marketCap, shown: 0.15 },
    { what: 'Both corporate bonds BBB', value: HB.rating === 'BBB' && MB.rating === 'BBB' ? 1 : 0, shown: 1 },
    { what: 'Harbour spread wider', value: spreadH > spreadM ? 1 : 0, shown: 1 },
    { what: 'Harbour price after +1pt spread', value: hbWide, shown: 91.29 },
    { what: 'Harbour fall after +1pt', value: -chg(hbWide, hb.price), shown: 5.52 },
    { what: 'Drawdown', value: DD.drawdown * 100, shown: -13.4, tol: 0.05 },
    { what: 'Peak end of Dec 2021', value: MONTHS[DD.peak - 1] === '2021-12' ? 1 : 0, shown: 1 },
    { what: 'Trough end of Oct 2022', value: MONTHS[DD.trough - 1] === '2022-10' ? 1 : 0, shown: 1 },
    { what: 'Recovered by end of March 2025', value: MONTHS[recIdx - 1] === '2025-03' ? 1 : 0, shown: 1 },
    { what: '2023 bond fund', value: r2023 * 100, shown: 9.7, tol: 0.05 },
    { what: '2023 bond fund 2dp', value: r2023 * 100, shown: 9.71 },
    { what: 'Implied yield rise', value: 13 / fundDur, shown: 2.2, tol: 0.05 },
    { what: 'Cost of one-point rise on $10,000', value: fundDur / 100 * 10000, shown: 600 },
    { what: 'Morrow bond Macaulay', value: mb.macaulay, shown: 3.26 },
    { what: 'Harbour bond Macaulay', value: hb.macaulay, shown: 5.88 },
    { what: '20y Macaulay in mistakes', value: g20.macaulay, shown: 13.32 },
  ],
};
