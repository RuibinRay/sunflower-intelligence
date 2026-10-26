// customer-value.js — M01 · Customer value, satisfaction and lifetime value. Content only; exercises are in
// customer-value.ex.js. Lantern facts come from ./case.js (fictional). The online-subscription figures (orders, order
// value, margin, renewal rate, campaign) are this lesson's own assumptions, labelled in the text. By design this lesson
// does not value a Lantern catering client: that is the course project.
import { BUSINESS, CLIENT_INTERVIEWS as I, COMPETITOR } from './case.js?v=20';

const c = BUSINESS.catering;
const clv = (m, r, d) => m / (1 + d - r);                                        // margins at year end, year 1 certain
const pv = (m, r, d, t) => (m * r ** (t - 1)) / (1 + d) ** t;
const clvT = (m, r, d, T) => Array.from({ length: T }, (_, k) => pv(m, r, d, k + 1)).reduce((a, b) => a + b, 0);
const SUB = { orders: 8, aov: 45, ratio: 0.40, r: 0.70, d: 0.10 };                 // assumed subscriber
const subRev = SUB.orders * SUB.aov;                                             // 360
const subM = subRev * SUB.ratio;                                                 // 144

const CHAIN = '<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="13"><defs><marker id="cv-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>'
  + '<text x="124" y="24" text-anchor="middle" font-size="12" fill="currentColor">judged by the customer</text><path d="M8 32V30H240V32" style="fill:none;stroke:var(--series-1);stroke-width:1.5"/>'
  + '<text x="444" y="24" text-anchor="middle" font-size="12" fill="currentColor">seen by the business</text><path d="M262 32V30H626V32" style="fill:none;stroke:var(--series-2);stroke-width:1.5"/>'
  + [['Customer value', 'benefits against', 'all the costs'], ['Satisfaction', 'performance against', 'expectations'], ['Loyalty', 'buying again and', 'recommending'], ['Retention', 'share of customers', 'still buying'], ['Lifetime value', 'margins over', 'the relationship']]
    .map(([a, b, e], i) => { const x = 8 + i * 127; const s = i < 2 ? 1 : 2; return `<rect x="${x}" y="42" width="112" height="84" rx="6" style="fill:none;stroke:var(--series-${s});stroke-width:2"/><text x="${x + 56}" y="70" text-anchor="middle" font-weight="700" fill="currentColor">${a}</text><text x="${x + 56}" y="92" text-anchor="middle" font-size="11.5" fill="currentColor">${b}</text><text x="${x + 56}" y="109" text-anchor="middle" font-size="11.5" fill="currentColor">${e}</text>`; }).join('')
  + [0, 1, 2, 3].map((i) => { const x = 120 + i * 127; return `<line x1="${x + 1}" y1="84" x2="${x + 14}" y2="84" style="stroke:currentColor;stroke-width:1.5" marker-end="url(#cv-ar)"/>`; }).join('')
  + '<text x="320" y="156" text-anchor="middle" font-size="12" fill="currentColor">Each arrow is a tendency, not a law: satisfied customers can still leave,</text>'
  + '<text x="320" y="176" text-anchor="middle" font-size="12" fill="currentColor">and dissatisfied ones can stay when switching is hard.</text>'
  + '</svg>';

export default {
  slug: 'customer-value',
  title: 'Customer value, satisfaction and lifetime value',
  blurb: 'Customers choose the offer they judge best value, stay if it meets the expectations they formed, and are worth what they bring in over the years they stay. Learn customer-perceived value, satisfaction and loyalty, how to calculate a simple customer lifetime value with its assumptions stated, how to compare it with the cost of winning a customer, and how to write a value proposition.',
  status: 'reviewed',
  objectives: [
    'Explain customer-perceived value as benefits weighed against money and non-money costs, and why the customer’s judgement is the one that counts.',
    'Explain satisfaction as perceived performance measured against expectations, and how it relates to loyalty and retention.',
    'Calculate a customer’s lifetime value from margin, retention and a discount rate, stating the assumptions about timing and horizon.',
    'Compare lifetime value with the cost of acquiring a customer to judge whether acquisition or retention spending pays.',
    'Evaluate a value proposition: whom it is for, what it promises, and why that beats the alternatives.',
  ],
  prerequisites: [
    { lesson: 'm01/what-is-marketing', why: 'This lesson builds on exchange, willingness to pay and the marketing process.' },
    { lesson: 'f00/finance-time-and-risk', why: 'Lifetime value discounts future margins, so you need present value and the discount rate.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In November 2026 Ana asked 12 of Lantern’s 18 catering clients why they had chosen Lantern. Each could give several reasons. Coffee quality came up 9 times and reliability on the day 7 times; price came up only twice.' },
    { case: 'Lantern is not the cheap option. Brewline Catering, a larger caterer with self-serve urns and pod machines and no baristas, charges $7.50 a head; Lantern charges $9.00, which is $1.50 a head more. In 2026 Lantern also lost 5 bids, all to Brewline on price.' },
    { p: 'Both facts are about value. The clients who chose Lantern judged its offer worth $1.50 a head more than Brewline’s; the five organisations that chose Brewline judged otherwise. Neither group made a mistake. <g>Customer value</g> is the customer’s judgement of the benefits of an offer relative to its total cost, compared with the alternatives, and different customers judge differently. This lesson follows value from that judgement to satisfaction after the purchase, then to loyalty and retention, and finally to what a customer is worth to the business over the years.' },

    { h: 'What customers weigh' },
    { p: 'Valarie Zeithaml (1988), who asked consumers what “value” meant to them, found the word used in several senses. For some it meant no more than a low price. For others it meant “what I get for what I give”, and that is the sense marketers build on: a judgement of everything received against everything given up.' },
    { list: [
      '<b>Benefits</b> can be functional (the coffee keeps people alert), emotional (a small treat in a long day) or social (visitors notice that the firm looks after its guests). Organisations also weigh economic benefits: an event that runs smoothly protects the reputation of the person who booked it.',
      '<b>Money costs</b> are the price and any extras, such as delivery charges, deposits and cancellation fees.',
      '<b>Non-money costs</b> are time (the hours an office manager spends organising), effort (setting up and clearing away) and risk: the chance that the coffee runs out, the staff arrive late or the product disappoints.',
    ] },
    { p: 'Most of the reasons Lantern’s clients gave are benefits or reductions in risk, not price. Reliability on the day, named by 7 of the 12, is a reduction in risk: an office manager who books catering for 90 colleagues is the one embarrassed if it goes wrong. A client who weighs that risk heavily can rationally choose the dearer caterer; one organising a simple internal meeting can rationally choose the cheaper one.' },
    { p: 'When the benefits and the non-money costs can be put in money, value can be calculated. The first lesson introduced <g>willingness to pay</g>, the most a customer would pay for an offer rather than go without it. Subtract the price and the money value of the time, effort and risk, and what is left is the net value of the offer to that customer. She chooses the offer with the highest net value, which need not be the one with the lowest price.' },

    { h: 'Satisfaction: performance against expectations' },
    { p: '<g>Customer satisfaction</g> is the customer’s judgement, after buying, of how well the offer performed compared with what they expected. Richard Oliver (1980) modelled satisfaction as depending on expectations and on <g>expectation disconfirmation</g>: the gap between the performance the customer perceives and the performance she expected. Performance above expectations (positive disconfirmation) leads to satisfaction; performance that matches them (confirmation) leads to satisfaction; performance below them (negative disconfirmation) leads to dissatisfaction.' },
    { p: 'Expectations come from past experience, from what friends and reviews say, from the price and from the seller’s own promises. That gives a business two levers, not one: it can improve performance, or it can set expectations it is able to meet. A caterer that promises “the best coffee you will ever taste” turns a very good cup into a disappointment. One that promises baristas on site 30 minutes before every event, and keeps the promise, builds satisfaction on something it controls.' },
    { figure: {
      svg: CHAIN,
      caption: 'From value to lifetime value. The customer judges value before buying and satisfaction after; the business sees the result in loyalty, retention and the margins a customer brings in over time.',
      alt: 'Five boxes in a row joined by arrows: Customer value (benefits against all the costs), Satisfaction (performance against expectations), Loyalty (buying again and recommending), Retention (share of customers still buying) and Lifetime value (margins over the relationship). A bracket over the first two boxes reads “judged by the customer”; a bracket over the last three reads “seen by the business”. A note underneath says that each arrow is a tendency, not a law: satisfied customers can still leave, and dissatisfied ones can stay when switching is hard.',
    } },

    { h: 'Loyalty and retention' },
    { p: '<g>Customer loyalty</g> has two sides: behaviour (buying again) and attitude (preferring the business and recommending it). Satisfaction usually helps both, but the link is loose. Satisfied customers can still leave, for variety or for a better offer; dissatisfied ones can stay when there is no real alternative or switching is costly. That is why businesses measure what customers do as well as what they say.' },
    { p: 'The simplest measure of what they do is the <g>retention rate</g>: the share of customers at the start of a period who are still customers at its end. Its complement is the <g>churn rate</g>, the share who leave, so churn = 1 − retention. Lantern expects 61% of its catering clients to stay from one year to the next, so 39% leave each year and have to be replaced before the business can grow at all.' },

    { h: 'What a customer is worth' },
    { p: 'A customer who stays is worth more than one sale. <g>Customer lifetime value</g> (CLV) is the present value of the margins a customer is expected to bring in over the whole relationship. It turns retention into money, and it answers a question every marketer faces: how much is it worth spending to win a customer, or to keep one?' },
    { case: 'Lantern’s online shop offers a bean subscription. Suppose (these are assumptions for this lesson, not figures from the case) that a typical subscriber orders 8 times a year at about $45 an order, $360 of revenue a year, and that 40% of it is left after the beans, packaging, delivery and payment fees: a margin of $144 a year. Suppose too that 70% of subscribers renew each year, and that Lantern discounts future money at 10% a year. The theory section works out what such a subscriber is worth.' },

    { h: 'The value proposition' },
    { p: 'A business can’t be everything to everyone, so it makes a promise to the customers it wants. A <g>value proposition</g> is the promise of benefits that gives target customers a reason to choose an offer over the alternatives. A good one answers four questions: for whom, which benefits, why this offer delivers them better than the alternatives, and what it will cost the customer.' },
    { p: 'Compare two versions for Lantern’s subscription. “High-quality coffee at great prices” names no customer, promises nothing that can be checked and could be printed by any rival. “For people who make coffee at home every morning: beans delivered within three days of roasting, so every cup tastes as it should; skip or cancel any month” names the customer, states a benefit and a reason to believe it (the roasting date is printed on every bag), and lowers the risk of signing up. The value proposition is chosen in step 2 of the marketing process, delivered by the offer in step 3 and tested by satisfaction in step 4.' },
  ],

  theory: [
    { h: 'Two ways to write customer value' },
    { p: 'OpenStax writes customer value as a ratio, value = benefits ÷ price, and M02 uses the same ratio with total cost in place of price. A ratio is a way of thinking: value rises if benefits rise or costs fall. When the benefits and the costs can be put in money, a difference is more useful, because it says how much better off the customer is and can be compared across offers. That is the net value in the formulas below. It extends the first lesson’s buyer’s gain, willingness to pay minus price, by subtracting the money value of time, effort and risk as well.' },
    { p: 'Two cautions apply to either form. Value is judged against the next-best alternative, which may be doing nothing or doing the job yourself. And it differs between customers: in the simple example below, the same flight is the better value for one traveller and the worse for another. Groups of customers who weigh benefits and costs alike are segments, the subject of M05.' },

    { h: 'Expectation disconfirmation and its limits' },
    { p: 'The disconfirmation model is a useful simplification. Customers don’t always form clear expectations, especially for things they have never bought. Performance is perceived, not measured: two guests at the same event can judge it differently. Pleasant surprises raise the bar, because today’s surprise can become tomorrow’s expectation. And satisfaction surveys hear from the customers willing to answer, who are not a random sample of all customers, so their scores can mislead (<g>non-response bias</g>, from B01).' },

    { h: 'Retention and expected lifetime' },
    { p: String.raw`Suppose a share <m>r</m> of customers stays each year, the same every year. A new customer is certain to be there in year 1, is still there in year 2 with probability <m>r</m>, in year 3 with probability <m>r \times r = r^2</m>, and in year <m>t</m> with probability <m>r^{t-1}</m>. On average a customer then stays <m>1 \div (1 - r)</m> years. With <m>r = 0.70</m> that is <m>1 \div 0.30 \approx 3.33</m> years; with <m>r = 0.90</m> it is 10 years. Small changes in retention make large changes in how long customers stay, which is why retention is worth managing.` },

    { h: 'Calculating customer lifetime value' },
    { p: 'Customer lifetime value adds up the margins a customer is expected to bring in, each weighted by the chance that the customer is still there and discounted to today. Five assumptions go into it, and each must be stated.' },
    { list: [
      '<b>Margin, not revenue.</b> <m>m</m> is what the customer brings in each year after the costs that serving them causes: for the subscriber, $144, not $360. It is a <g>contribution margin</g> per customer per year, the same idea M02 applies to each unit sold.',
      '<b>Retention.</b> The customer is there for year 1, then stays from one year to the next with probability <m>r</m>, the same every year.',
      '<b>Discount rate.</b> Money received later is worth less today, as F00 showed. <m>d</m> is the business’s <g>discount rate</g>, here 10% a year.',
      '<b>Timing.</b> Each year’s margin arrives at the end of that year.',
      '<b>Horizon.</b> Either a fixed number of years, <m>T</m>, or every future year.',
    ] },
    { math: String.raw`\text{CLV} = \sum_{t=1}^{T} \frac{m\, r^{t-1}}{(1+d)^{t}}` },
    { table: {
      caption: 'Lifetime value of a Lantern subscriber over five years (assumed: m = $144, r = 0.70, d = 0.10)',
      head: ['Year', 'Chance still a subscriber', 'Expected margin', 'Discount factor', 'Present value'],
      align: ['l', 'r', 'r', 'r', 'r'],
      rows: [
        ['1', '1.000', '$144.00', '0.909', '$131'],
        ['2', '0.700', '$100.80', '0.826', '$83'],
        ['3', '0.490', '$70.56', '0.751', '$53'],
        ['4', '0.343', '$49.39', '0.683', '$34'],
        ['5', '0.240', '$34.57', '0.621', '$21'],
      ],
      foot: [['Years 1–5', '', '', '', '$322']],
      note: 'Expected margin = $144 × chance still a subscriber. Discount factor = 1 ÷ 1.10 raised to the year. Present values are rounded to the nearest dollar after multiplying.',
    } },
    { p: String.raw`Adding every future year, instead of stopping at <m>T</m>, gives a short formula: <m>\text{CLV} = m \div (1 + d - r)</m>. For the subscriber, <m>144 \div (1 + 0.10 - 0.70) = 144 \div 0.40 = 360</m> dollars. That this equals a year’s revenue is a coincidence of these assumptions (the 40% margin ratio happens to equal the 0.40 denominator); the formula starts from the $144 margin. The first five years already contain $322 of it, about 90%: distant years add little, because the subscriber has probably left by then and the money would be worth less today.` },
    { p: String.raw`Two shortcuts give tempting but wrong answers. Leave out discounting (<m>d = 0</m>) and the formula becomes <m>m \div (1 - r) = 144 \div 0.30 = 480</m> dollars: the margin times the expected lifetime of 3.33 years. Use revenue instead of margin and you get <m>360 \div 0.40 = 900</m> dollars. Both overstate what a subscriber is worth.` },
    { callout: 'warn', title: 'Lifetime value is an estimate built on assumptions', html: 'Change retention from 70% to 65% and the subscriber’s CLV falls from $360 to $320; raise it to 75% and CLV rises to about $411. Retention is uncertain, and the formula assumes it never changes. Treat CLV as a range under stated assumptions, not as a fact about a customer.' },
    { p: 'Texts also time the margins differently. Gupta, Lehmann and Stuart (2004), who used retention and margins to value companies’ whole customer bases, count a first margin at the moment a customer is acquired; others count the first margin only once the customer has renewed. For the Lantern subscriber those two conventions give about $396 and $252, against $360 here. None is wrong, provided you say which you use. This course uses the timing above throughout: margins at the end of each year, with the customer certain to be there for the first.' },

    { h: 'Lifetime value against acquisition cost' },
    { p: '<g>Customer acquisition cost</g> (CAC) is the marketing and sales spending on winning new customers in a period, divided by the number of new customers won. It is the cost per acquisition that M02 measures, with becoming a customer as the action. Suppose Lantern spends $2,700 on a subscription campaign (social ads and a free first bag) and wins 30 subscribers: CAC = $2,700 ÷ 30 = $90. Each subscriber is expected to bring in $360 of discounted margin, four times what it cost to win, so the campaign creates $360 − $90 = $270 of value per subscriber, on these assumptions.' },
    { list: [
      '<b>Compare like with like.</b> CLV should be built from margin, and CAC from all the spending that winning the customers caused, including free samples and discounts.',
      '<b>Averages hide the margin.</b> The last customers a campaign wins usually cost more than the average and may stay less. The applied example below works this out.',
      '<b>Past acquisition spending is sunk.</b> As Gupta, Lehmann and Stuart point out, the cost of winning existing customers has already been incurred, so it plays no part in valuing them or in deciding how to keep them.',
      '<b>Retention competes for the same money.</b> Raising retention lifts the CLV of every customer, so a dollar spent keeping customers can be worth more than one spent finding them. The challenging example compares the two.',
    ] },

    { h: 'Testing a value proposition' },
    { p: 'A value proposition is worth writing down only if it survives a few tests. Does it name customers specific enough that you could find them? Does it promise a benefit those customers value, which the business can check against what they say? Lantern’s clients named quality and reliability, not price.' },
    { p: 'Does it give a reason to believe, such as a guarantee, a printed roasting date or a client who will vouch for it? Can the business keep the promise every time, since the promise sets the expectations that satisfaction will be judged against? And is it different from what the rivals promise? A proposition that fails the last test may still be true, but it gives customers no reason to choose.' },
  ],

  formulas: [
    { id: 'm01-net-value', name: 'Net value of an offer to a customer (when benefits and costs can be put in money)',
      tex: String.raw`\text{Net value} = W - (P + N)`,
      where: [
        [String.raw`W`, 'Willingness to pay: the most this customer would pay for the offer rather than go without it (the money value of its benefits to her)', '$'],
        [String.raw`P`, 'Price, including any money extras such as delivery', '$'],
        [String.raw`N`, 'Non-money costs put in money: time at the customer’s own value of time, effort, and the expected cost of risk (probability × cost if it goes wrong)', '$'],
      ],
      assumptions: 'The customer can put a money value on the benefits and on her time and risk. She compares the net value of each alternative, including doing nothing (net value $0), and chooses the highest.',
      note: 'With no non-money costs this is the buyer’s gain from the first lesson, W − P. M02 writes customer value as a ratio of benefits to total cost; both are ways of organising the same judgement.' },
    { id: 'm01-clv', name: 'Customer lifetime value (margins at year end; retention constant)',
      tex: String.raw`\text{CLV} = \sum_{t=1}^{T} \frac{m\, r^{t-1}}{(1+d)^{t}} \qquad \text{every future year: } \text{CLV} = \frac{m}{1 + d - r}`,
      where: [
        [String.raw`\text{CLV}`, 'Customer lifetime value: the present value of the margins the customer is expected to bring in', '$'],
        [String.raw`m`, 'Margin per year from the customer: revenue minus the costs that serving them causes (not revenue)', '$ per year'],
        [String.raw`r`, 'Retention rate: the probability that a customer in one year is still a customer the next', 'decimal (0.70 = 70%)'],
        [String.raw`d`, 'Discount rate per year', 'decimal (0.10 = 10%)'],
        [String.raw`t`, 'Year of the relationship, 1 for the first year', 'years'],
        [String.raw`T`, 'Number of years counted (the horizon)', 'years'],
      ],
      assumptions: 'Each year’s margin arrives at the end of the year; the customer is certain to be there for year 1 and stays from one year to the next with the same probability r; m, r and d don’t change; acquisition cost is not included. The short form adds every future year and needs r < 1 + d.',
      note: 'Other texts time the margins differently (a first margin at once, or only after the first renewal), which changes the answer, so state the timing. Without discounting (d = 0) the short form is m ÷ (1 − r): the margin times the expected lifetime 1 ÷ (1 − r). M06 Customer Analytics and RFM estimates margins and retention from data.' },
    { id: 'm01-cac', name: 'Customer acquisition cost, and the net value of winning a customer',
      tex: String.raw`\text{CAC} = \frac{S}{n} \qquad \text{Net value of a new customer} = \text{CLV} - \text{CAC}`,
      where: [
        [String.raw`\text{CAC}`, 'Customer acquisition cost: the average cost of winning one new customer', '$ per customer'],
        [String.raw`S`, 'Marketing and sales spending on winning new customers in the period, including free samples and introductory discounts', '$'],
        [String.raw`n`, 'Number of new customers won in the period', 'customers'],
        [String.raw`\text{CLV}`, 'Customer lifetime value of the customers won, measured from margin', '$ per customer'],
      ],
      assumptions: 'The spending caused the new customers (those who would have come anyway shouldn’t be counted as won by it), and CLV is estimated for the kind of customer the spending wins.',
      note: 'For a decision about spending more, compare the extra spending with the extra customers it wins (the marginal CAC), not the average. M02 measures the same quantity as cost per acquisition.' },
  ],

  examples: [
    { level: 'simple', title: 'Which flight is better value?', fictional: true,
      setup: 'A consultant must fly to a client meeting. A direct flight on Ashcombe Airways (fictional) costs $420. A connecting flight costs $280 but takes 3 hours longer, and there is a 10% chance of missing the connection, which would cost her about $300 in a new ticket, a hotel night and a lost meeting. She values her working time at $60 an hour. Both are scheduled to get her there in time. Which is better value for her?',
      steps: [
        'The benefits are the same (she arrives for the meeting), so compare total costs: price plus non-money costs put in money.',
        'Connecting flight: time cost 3 × $60 = $180; expected cost of risk 0.10 × $300 = $30; total $280 + $180 + $30 = $490.',
        'Direct flight: $420, with no extra time and (we assume) no risk of a missed connection.',
        'Compare: the direct flight costs her $490 − $420 = $70 less in total, although its price is $420 − $280 = $140 higher.',
        'Change the customer. A student who values her time at $10 an hour faces a connecting cost of $280 + 3 × $10 + $30 = $340, less than $420: for her the connection is the better value.',
      ],
      answer: 'For the consultant the direct flight is better value: a total cost of $420 against $490 for the connection, although its price is $140 higher.',
      interpretation: 'The same two offers rank differently for different customers, because value is the customer’s judgement of all the costs, not the price alone. An airline that competed only on price would lose travellers like the consultant; one that charged everyone for speed would lose travellers like the student.' },

    { level: 'challenging', title: 'Keep members longer, or charge them more?', fictional: true,
      setup: 'Meadowlark Fitness (fictional) charges members $50 a month. Serving a member (staff, equipment, cleaning and payment fees) costs $240 a year, 60% of members renew each year, it spends $250 to win each new member and it discounts future money at 10% a year. The manager has two proposals. A: a $60 onboarding programme for every new member (a personal plan and two coaching sessions), which she expects to raise retention to 70%. B: raise the fee to $55 a month, which she expects to lower retention to 55%. Which proposal raises the value of a new member more?',
      table: {
        caption: 'Value of a new member under each proposal (fictional)',
        head: ['Option', 'Margin a year', 'Retention', 'CLV', 'Extra cost per member', 'CLV − extra cost − CAC'],
        align: ['l', 'r', 'r', 'r', 'r', 'r'],
        rows: [
          ['Today', '$360', '60%', '$720', '$0', '$470'],
          ['A: onboarding', '$360', '70%', '$900', '$60', '$590'],
          ['B: $55 a month', '$420', '55%', '$764', '$0', '$514'],
        ],
      },
      steps: [
        String.raw`Today. Annual margin <m>m = 12 \times 50 - 240 = 360</m> dollars. <m>\text{CLV} = 360 \div (1 + 0.10 - 0.60) = 360 \div 0.50 = 720</m> dollars. After the $250 acquisition cost, a new member is worth $470.`,
        String.raw`Proposal A. The margin is unchanged and retention is 70%: <m>\text{CLV} = 360 \div 0.40 = 900</m> dollars. Subtract the programme and the acquisition cost: <m>900 - 60 - 250 = 590</m> dollars, $120 more than today.`,
        String.raw`Proposal B. The margin rises to <m>12 \times 55 - 240 = 420</m> dollars but retention falls to 55%: <m>\text{CLV} = 420 \div 0.55 \approx 763.64</m> dollars. After the acquisition cost, about $513.64, roughly $44 more than today.`,
        String.raw`How sure must the manager be about A? It beats today if <m>360 \div (1.10 - r) - 60 \geq 720</m>, which means <m>1.10 - r \leq 360 \div 780</m>, or <m>r \geq 0.638</m> to three decimal places. The programme pays for itself if it lifts retention by about 3.8 percentage points, well short of the 10 she expects.`,
        'Check what the numbers leave out. B assumes the higher fee doesn’t also put off people thinking of joining; if it does, the cost of winning members rises too. A assumes the effect of onboarding lasts. Both can be tested: run A for one intake of members and compare their renewals with the intake before.',
      ],
      answer: 'Proposal A: it raises the net value of a new member from $470 to $590, against about $514 under proposal B, and it pays for itself if retention rises by about 3.8 points or more.',
      interpretation: 'Retention multiplies every year that follows, so a modest improvement in it can be worth more than a price rise that looks like free money. The comparison holds only under its assumptions, which is why the manager should test the programme on one intake before offering it to every member.' },

    { level: 'applied', title: 'Should Ana triple the subscription campaign?', fictional: true,
      setup: 'Lantern’s first subscription campaign cost $2,700 and won 30 subscribers, a CAC of $90, against the estimated CLV of $360 from the theory section (margin $144 a year, retention 70%, discount rate 10%). Ana could triple the spending to $8,100 and expects 75 subscribers in all. The extra subscribers would come from people less interested in coffee, so they might renew less often: perhaps 50% a year. Should she triple the spending? All the figures are assumptions for this lesson.',
      steps: [
        'Find the cost of the extra subscribers, not the average. Tripling the spending adds $8,100 − $2,700 = $5,400 and 75 − 30 = 45 subscribers: $5,400 ÷ 45 = $120 each. The average across all 75, $8,100 ÷ 75 = $108, flatters the extra spending.',
        String.raw`Value the extra subscribers on their own assumptions. With 50% retention: <m>\text{CLV} = 144 \div (1 + 0.10 - 0.50) = 144 \div 0.60 = 240</m> dollars.`,
        'Compare: $240 of lifetime value for $120 of acquisition cost. On these assumptions the extra spending returns twice its cost.',
        String.raw`Stress-test the assumptions. Even if the extra subscribers all left after one year, the first year’s margin alone is worth <m>144 \div 1.10 \approx 131</m> dollars, more than $120. The decision is more sensitive to margin than to retention: at 50% retention the CLV falls to $120 only if the annual margin falls to <m>120 \times 0.60 = 72</m> dollars, half the assumed $144, which could happen if the campaign relied on deep discounts.`,
        'Decide and measure. Triple the spending, but follow the new subscribers as a group: how many renew, and what margin they bring after any discounts. M06 Customer Analytics and RFM shows how to follow such groups of customers over time.',
      ],
      answer: 'Yes, on these assumptions: the 45 extra subscribers cost $120 each and are worth about $240 each even at 50% retention. The decision would be wrong only if their annual margin fell below about $72, so margin is the figure to watch.',
      interpretation: 'Two habits matter more than the formula: compare the cost of the extra customers with their value (not the averages), and find out which assumption would have to be wrong to reverse the decision. Lifetime value turns a marketing budget into an investment decision of the kind F00 taught you to judge.' },
  ],

  demo: [
    { widget: 'cv-clv', intro: 'Lifetime value with every assumption on a slider, starting from the Lantern subscriber ($144 a year, 70% retention, 10% discount rate, $90 to win). Move retention a few points either way and watch how far CLV moves; then set the discount rate to zero to see how much discounting matters; then shorten the horizon. The chart shows the discounted margin building up year by year against the cost of winning the customer.' },
  ],

  mistakes: [
    { title: '“Customer value means a low price.”', html: 'Price is one cost among several, and benefits count too. The consultant in the simple example chose the dearer flight because it cost her less in time and risk, and most of Lantern’s clients chose the dearer caterer for quality and reliability. A low price is one way to offer value, not the definition of it.' },
    { title: '“A satisfied customer is a loyal customer.”', html: 'Satisfaction helps loyalty, but satisfied customers can still leave for variety or a better offer, and dissatisfied ones can stay when switching is hard. Measure behaviour, such as retention and repeat purchases, as well as satisfaction scores.' },
    { title: '“Promise as much as possible; customers like ambition.”', html: 'Promises set the expectations that performance is judged against. Over-promising turns good performance into negative disconfirmation and a dissatisfied customer. Promise what you can deliver every time, then deliver it.' },
    { title: '“Lifetime value is the revenue a customer brings in.”', html: 'CLV is built from margin, what is left after the costs of serving the customer. Using the subscriber’s annual revenue ($360) instead of the $144 margin gives a CLV of $900 rather than $360, two and a half times too much, and would justify spending far too much to win customers.' },
    { title: '“CLV is a fact about a customer.”', html: 'It is a forecast built on assumptions about margin, retention, the discount rate and timing. Five points of retention move the subscriber’s CLV between $320 and about $411. Say what you assumed, and show how the answer changes if the assumptions are wrong.' },
    { title: '“If CLV beats our average CAC, every extra customer is worth winning.”', html: 'The extra customers a bigger campaign wins usually cost more than the average and may be worth less. Compare the extra spending with the extra customers, and value those customers on their own assumptions. And don’t count money already spent winning existing customers: it is sunk.' },
  ],

  application: [
    { case: 'Rowan Lane, a fictional online clothing retailer, wins new customers in two ways. Social media ads cost it $35 for each new customer they bring. A referral programme gives an existing customer a $10 credit and the friend she refers $10 off a first order: $20 for each new customer. Its marketing analyst, Kofi, has to advise how to split next year’s budget between them.' },
    { p: String.raw`Kofi starts from the value of the customers each route brings, not the cost of winning them. Following last year’s new customers through their first year, he estimates that customers from ads bring an annual margin of about $28 and that 30% of them buy again the following year, while referred customers bring about $40 a year and 50% of them come back. With Rowan Lane’s 10% discount rate, a customer from ads has <m>\text{CLV} = 28 \div (1 + 0.10 - 0.30) = 35</m> dollars, and a referred customer <m>\text{CLV} = 40 \div (1 + 0.10 - 0.50) \approx 66.67</m> dollars.` },
    { p: 'On these figures an ad customer is worth exactly what it costs to win, $35 against $35, so the ads create no value. A referred customer is worth about $66.67 against a $20 cost: about $46.67 of value each.' },
    { p: 'Kofi’s first instinct is to move the whole budget to referrals. He resists it for two reasons. Referrals are limited by how many customers are willing to recommend the shop, so the programme can’t absorb the whole budget. And referred customers may differ from ad customers in ways the programme didn’t cause: people whose friends recommend a shop were perhaps more likely to like it anyway.' },
    { p: 'His recommendation has three parts. Grow the referral programme as far as customers will take it, and track what each extra referral costs. Cut the ads back to the campaigns whose customers renew most, and test whether the rest bring in any customers who wouldn’t have come anyway, by holding back a randomly chosen group from seeing them, as M02 describes. And find out why ad customers leave. If most leave after a disappointing first order, such as clothes that don’t fit or a late delivery, the problem is satisfaction, not acquisition, and a better size guide may be worth more than any change to the budget.' },
    { p: 'The last point brings the lesson full circle. Lifetime value is the money at the end of a chain that starts with whether customers judge an offer worth what it costs them, and whether it meets the expectations the business set. A marketer who manages only the last link, by spending more to win customers, is pouring water into a leaking bucket.' },
  ],

  summary: [
    'Customer value is the customer’s judgement of an offer’s benefits relative to its total cost (money, time, effort and risk), compared with the alternatives; when all can be put in money, net value = W − (P + N).',
    'Satisfaction depends on perceived performance against expectations (Oliver, 1980): positive disconfirmation and confirmation satisfy; negative disconfirmation disappoints. Promises set expectations.',
    'Loyalty has a behavioural side (buying again) and an attitudinal side (preferring and recommending). Retention is the share of customers who stay; churn = 1 − retention.',
    'Customer lifetime value is the present value of expected margins: with margins at year end and constant retention, CLV = m ÷ (1 + d − r). Use margin, not revenue, and state the timing.',
    'CLV is an estimate: small changes in retention move it a lot. Compare it with the customer acquisition cost of the extra customers a decision would win, and treat past acquisition spending as sunk.',
    'A value proposition names the target customers, the benefits, the reason to believe and the cost to the customer; it must be a promise the business can keep.',
  ],

  glossary: [
    { term: 'Customer value', def: 'The customer’s judgement of the benefits of an offer relative to its total cost in money, time, effort and risk, compared with the alternatives.' },
    { term: 'Customer satisfaction', def: 'The customer’s judgement, after buying, of how well an offer performed compared with what they expected.' },
    { term: 'Expectation disconfirmation', def: 'The gap between an offer’s perceived performance and the customer’s expectations. Performance above expectations is positive disconfirmation, below them negative disconfirmation, and equal to them confirmation.' },
    { term: 'Customer loyalty', def: 'A customer’s tendency to keep buying from a business (behavioural loyalty) and to prefer and recommend it (attitudinal loyalty).' },
    { term: 'Retention rate', def: 'The share of customers at the start of a period who are still customers at its end.' },
    { term: 'Churn rate', def: 'The share of customers at the start of a period who have stopped buying by its end: 1 minus the retention rate.' },
    { term: 'Customer lifetime value', def: 'The present value of the margins a customer is expected to bring in over the whole relationship. Abbreviated CLV.' },
    { term: 'Customer acquisition cost', def: 'Marketing and sales spending on winning new customers in a period, divided by the number of new customers won. Abbreviated CAC.' },
    { term: 'Contribution margin', def: 'Price received minus variable cost per unit: what each unit contributes towards fixed costs and then profit. As a share of price it is the contribution margin ratio.' },
    { term: 'Value proposition', def: 'The promise of benefits that gives target customers a reason to choose an offer over the alternatives.' },
  ],

  references: [
    { text: 'Zeithaml, V. A. (1988). Consumer perceptions of price, quality, and value: a means-end model and synthesis of evidence. <i>Journal of Marketing</i>, 52(3), 2–22. The abstract was consulted; the consumers’ meanings of value (“value is low price”, “what I get for what I give”) were confirmed from Wikipedia’s summary in its article “Consumer value”.', url: 'https://doi.org/10.1177/002224298805200302', checked: '2026-10-23' },
    { text: 'Oliver, R. L. (1980). A cognitive model of the antecedents and consequences of satisfaction decisions. <i>Journal of Marketing Research</i>, 17(4), 460–469. The abstract was consulted.', url: 'https://doi.org/10.1177/002224378001700405', checked: '2026-10-23' },
    { text: 'Newcastle University. “Expectation Confirmation Theory”, <i>TheoryHub</i>: expectations, perceived performance, disconfirmation, and why satisfied customers may still switch.', url: 'https://open.ncl.ac.uk/theories/14/expectation-confirmation-theory/', checked: '2026-10-23' },
    { text: 'Gupta, S., Lehmann, D. R. &amp; Stuart, J. A. (2004). Valuing customers. <i>Journal of Marketing Research</i>, 41(1), 7–18. The pre-publication version consulted gives the lifetime-value formula with margins from the moment of acquisition and notes that acquisition costs already incurred are sunk.', url: 'https://business.columbia.edu/sites/default/files-efs/pubfiles/534/Valuing_Customers--JMR_2003.pdf', checked: '2026-10-23' },
    { text: 'Gomez Albrecht, M., Green, M. &amp; Hoffman, L. (2023). <i>Principles of Marketing</i>, sections 1.1 “Marketing and the Marketing Process” (customer value as benefits ÷ price; customer equity) and 1.5 “Determining Consumer Needs and Wants” (value propositions). OpenStax.', url: 'https://openstax.org/books/principles-marketing/pages/1-1-marketing-and-the-marketing-process', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Clients interviewed (case.js)', value: I.interviewed, shown: 12 },
    { what: 'Catering clients (case.js)', value: c.clients, shown: 18 },
    { what: 'Coffee quality mentions (case.js)', value: I.reasons['Coffee quality'], shown: 9 },
    { what: 'Reliability mentions (case.js)', value: I.reasons['Reliability on the day'], shown: 7 },
    { what: 'Price mentions (case.js)', value: I.reasons.Price, shown: 2 },
    { what: 'Brewline price per head (case.js)', value: COMPETITOR.pricePerHead, shown: 7.5 },
    { what: 'Lantern price per head (case.js)', value: c.pricePerHead, shown: 9 },
    { what: 'Gap per head', value: c.pricePerHead - COMPETITOR.pricePerHead, shown: 1.5 },
    { what: 'Lost bids (case.js)', value: I.lostBids, shown: 5 },
    { what: 'Catering retention (case.js)', value: c.retention * 100, shown: 61 },
    { what: 'Catering churn', value: (1 - c.retention) * 100, shown: 39 },
    { what: 'Subscriber revenue a year', value: subRev, shown: 360 },
    { what: 'Subscriber margin a year', value: subM, shown: 144 },
    { what: 'Expected lifetime at r = 0.70', value: 1 / (1 - SUB.r), shown: 3.33 },
    { what: 'Expected lifetime at r = 0.90', value: 1 / (1 - 0.9), shown: 10 },
    { what: 'Year 3 survival', value: SUB.r ** 2, shown: 0.49 },
    { what: 'Year 4 survival', value: SUB.r ** 3, shown: 0.343 },
    { what: 'Year 5 survival', value: SUB.r ** 4, shown: 0.240, tol: 0.0005 },
    { what: 'Year 2 expected margin', value: subM * SUB.r, shown: 100.8 },
    { what: 'Year 3 expected margin', value: subM * SUB.r ** 2, shown: 70.56 },
    { what: 'Year 4 expected margin', value: subM * SUB.r ** 3, shown: 49.39 },
    { what: 'Year 5 expected margin', value: subM * SUB.r ** 4, shown: 34.57 },
    { what: 'Discount factor year 1', value: 1 / 1.1, shown: 0.909, tol: 0.0005 },
    { what: 'Discount factor year 2', value: 1 / 1.1 ** 2, shown: 0.826, tol: 0.0005 },
    { what: 'Discount factor year 3', value: 1 / 1.1 ** 3, shown: 0.751, tol: 0.0005 },
    { what: 'Discount factor year 4', value: 1 / 1.1 ** 4, shown: 0.683, tol: 0.0005 },
    { what: 'Discount factor year 5', value: 1 / 1.1 ** 5, shown: 0.621, tol: 0.0005 },
    { what: 'PV year 1', value: pv(subM, SUB.r, SUB.d, 1), shown: 131, tol: 0.5 },
    { what: 'PV year 2', value: pv(subM, SUB.r, SUB.d, 2), shown: 83, tol: 0.5 },
    { what: 'PV year 3', value: pv(subM, SUB.r, SUB.d, 3), shown: 53, tol: 0.5 },
    { what: 'PV year 4', value: pv(subM, SUB.r, SUB.d, 4), shown: 34, tol: 0.5 },
    { what: 'PV year 5', value: pv(subM, SUB.r, SUB.d, 5), shown: 21, tol: 0.5 },
    { what: 'Five-year CLV', value: clvT(subM, SUB.r, SUB.d, 5), shown: 322, tol: 0.5 },
    { what: 'Rounded rows add to the total', value: [1, 2, 3, 4, 5].map((t) => Math.round(pv(subM, SUB.r, SUB.d, t))).reduce((a, b) => a + b, 0), shown: 322 },
    { what: 'Denominator 1 + d − r', value: 1 + SUB.d - SUB.r, shown: 0.4 },
    { what: 'CLV every year', value: clv(subM, SUB.r, SUB.d), shown: 360 },
    { what: 'Share in first five years (%)', value: clvT(subM, SUB.r, SUB.d, 5) / clv(subM, SUB.r, SUB.d) * 100, shown: 90, tol: 0.5 },
    { what: 'Undiscounted CLV', value: subM / (1 - SUB.r), shown: 480 },
    { what: 'CLV on revenue (wrong)', value: subRev / (1 + SUB.d - SUB.r), shown: 900 },
    { what: 'CLV on revenue is 2.5 times too much', value: (subRev / (1 + SUB.d - SUB.r)) / clv(subM, SUB.r, SUB.d), shown: 2.5 },
    { what: 'Coincidence: margin ratio equals denominator', value: SUB.ratio, shown: 1 + SUB.d - SUB.r },
    { what: 'Gupta timing (first margin at acquisition)', value: subM * (1 + SUB.d) / (1 + SUB.d - SUB.r), shown: 396 },
    { what: 'First margin only after renewal', value: subM * SUB.r / (1 + SUB.d - SUB.r), shown: 252 },
    { what: 'CLV at 65% retention', value: clv(subM, 0.65, SUB.d), shown: 320 },
    { what: 'CLV at 75% retention', value: clv(subM, 0.75, SUB.d), shown: 411, tol: 0.5 },
    { what: 'Campaign CAC', value: 2700 / 30, shown: 90 },
    { what: 'CLV ÷ CAC', value: clv(subM, SUB.r, SUB.d) / (2700 / 30), shown: 4 },
    { what: 'Net value per subscriber', value: clv(subM, SUB.r, SUB.d) - 2700 / 30, shown: 270 },
    { what: 'Flight: time cost', value: 3 * 60, shown: 180 },
    { what: 'Flight: expected cost of risk', value: 0.10 * 300, shown: 30 },
    { what: 'Flight: connecting total', value: 280 + 3 * 60 + 0.1 * 300, shown: 490 },
    { what: 'Flight: direct cheaper in total by', value: 280 + 3 * 60 + 0.1 * 300 - 420, shown: 70 },
    { what: 'Flight: price gap', value: 420 - 280, shown: 140 },
    { what: 'Flight: student connecting total', value: 280 + 3 * 10 + 0.1 * 300, shown: 340 },
    { what: 'Gym: revenue a year', value: 12 * 50, shown: 600 },
    { what: 'Gym: margin today', value: 12 * 50 - 240, shown: 360 },
    { what: 'Gym: CLV today', value: clv(360, 0.6, 0.1), shown: 720 },
    { what: 'Gym: denominator today', value: 1 + 0.1 - 0.6, shown: 0.5 },
    { what: 'Gym: net today', value: clv(360, 0.6, 0.1) - 250, shown: 470 },
    { what: 'Gym: CLV under A', value: clv(360, 0.7, 0.1), shown: 900 },
    { what: 'Gym: net under A', value: clv(360, 0.7, 0.1) - 60 - 250, shown: 590 },
    { what: 'Gym: A gain over today', value: (clv(360, 0.7, 0.1) - 60 - 250) - (clv(360, 0.6, 0.1) - 250), shown: 120 },
    { what: 'Gym: margin under B', value: 12 * 55 - 240, shown: 420 },
    { what: 'Gym: CLV under B', value: clv(420, 0.55, 0.1), shown: 763.64 },
    { what: 'Gym: CLV under B (table)', value: clv(420, 0.55, 0.1), shown: 764, tol: 0.5 },
    { what: 'Gym: net under B', value: clv(420, 0.55, 0.1) - 250, shown: 513.64 },
    { what: 'Gym: net under B (table)', value: clv(420, 0.55, 0.1) - 250, shown: 514, tol: 0.5 },
    { what: 'Gym: B gain over today', value: clv(420, 0.55, 0.1) - 250 - 470, shown: 44, tol: 0.5 },
    { what: 'Gym: CLV needed for A to break even', value: 720 + 60, shown: 780 },
    { what: 'Gym: break-even retention for A', value: 1.1 - 360 / 780, shown: 0.638, tol: 0.0005 },
    { what: 'Gym: break-even rise in points', value: (1.1 - 360 / 780 - 0.6) * 100, shown: 3.8, tol: 0.05 },
    { what: 'Gym: rise expected in points', value: (0.7 - 0.6) * 100, shown: 10 },
    { what: 'Applied: extra spending', value: 8100 - 2700, shown: 5400 },
    { what: 'Applied: extra subscribers', value: 75 - 30, shown: 45 },
    { what: 'Applied: marginal CAC', value: (8100 - 2700) / (75 - 30), shown: 120 },
    { what: 'Applied: average CAC', value: 8100 / 75, shown: 108 },
    { what: 'Applied: tripled spend', value: 3 * 2700, shown: 8100 },
    { what: 'Applied: CLV at 50% retention', value: clv(subM, 0.5, SUB.d), shown: 240 },
    { what: 'Applied: denominator at 50%', value: 1 + SUB.d - 0.5, shown: 0.6 },
    { what: 'Applied: CLV ÷ marginal CAC', value: clv(subM, 0.5, SUB.d) / 120, shown: 2 },
    { what: 'Applied: first-year margin alone', value: subM / 1.1, shown: 131, tol: 0.5 },
    { what: 'Applied: break-even margin at 50%', value: 120 * (1 + SUB.d - 0.5), shown: 72 },
    { what: 'Applied: half of assumed margin', value: subM / 2, shown: 72 },
    { what: 'Rowan Lane: ads CLV', value: clv(28, 0.3, 0.1), shown: 35 },
    { what: 'Rowan Lane: referral CLV', value: clv(40, 0.5, 0.1), shown: 66.67 },
    { what: 'Rowan Lane: referral net', value: clv(40, 0.5, 0.1) - 20, shown: 46.67 },
    { what: 'Rowan Lane: referral cost', value: 10 + 10, shown: 20 },
  ],
};
