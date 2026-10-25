// measuring-the-mix.ex.js — M02 · Measuring promotion and bringing the mix together: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// Campaign figures are hypothetical; Lantern's prices, margins and costs come from ./market.js (fictional).

const money = (v, d = 2) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const pct = (v, d = 1) => `${v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(d)}%`;

export const widgets = {
  'mx-funnel': {
    type: 'formula',
    title: 'From impressions to ROI',
    intro: 'Enter a campaign’s spend and results. The defaults are Lantern’s online-shop campaign: $6,000 of social ads selling a $41.88 12-pack, with about 65.9% of each order left as contribution.',
    inputs: [
      { id: 'spend', label: 'Campaign spend', min: 1000, max: 100000, step: 500, value: 6000, fmt: 'money' },
      { id: 'imp', label: 'Impressions', min: 10000, max: 5000000, step: 10000, value: 750000, fmt: 'int' },
      { id: 'clicks', label: 'Clicks', min: 100, max: 100000, step: 100, value: 7500, fmt: 'int' },
      { id: 'conv', label: 'Conversions (orders)', min: 1, max: 5000, step: 1, value: 240, fmt: 'int' },
      { id: 'aov', label: 'Average order value', min: 5, max: 200, step: 0.01, value: 41.88, fmt: 'money' },
      { id: 'margin', label: 'Contribution margin on revenue', min: 5, max: 90, step: 0.1, value: 65.9, fmt: 'pct' },
      { id: 'incr', label: 'Share of orders that were incremental', min: 0, max: 100, step: 5, value: 100, fmt: 'pct' },
    ],
    compute: (v) => {
      if (v.clicks > v.imp) return { error: 'Clicks can’t exceed impressions: every click comes from an impression.' };
      if (v.conv > v.clicks) return { error: 'Conversions can’t exceed clicks when the conversion rate is measured per click.' };
      const revenue = v.conv * v.aov;
      const roas = revenue / v.spend;
      const m = v.margin / 100, s = v.incr / 100;
      const contrib = revenue * m * s;
      const roi = (contrib - v.spend) / v.spend;
      const be = 1 / m;
      const rows = [
        ['CPM (cost per thousand impressions)', money(v.spend / v.imp * 1000)],
        ['CTR (clicks ÷ impressions)', pct(v.clicks / v.imp, 2)],
        ['CPC (spend ÷ clicks)', money(v.spend / v.clicks)],
        ['Conversion rate (conversions ÷ clicks)', pct(v.conv / v.clicks, 2)],
        ['CPA (spend ÷ conversions)', money(v.spend / v.conv)],
        ['Attributed revenue', money(revenue)],
        ['ROAS (revenue ÷ spend)', roas.toFixed(2)],
        ['Break-even ROAS (1 ÷ contribution margin)', be.toFixed(2)],
        ['Incremental contribution', money(contrib)],
      ];
      let note;
      if (roi >= 0 && s === 1) note = `If every order was caused by the campaign, it returned ${pct(roi)} on its cost. That “if” matters: test it with a holdout group before relying on the figure.`;
      else if (roi >= 0) note = `Counting only the ${pct(s, 0)} of orders that were incremental, the campaign still returned ${pct(roi)}.`;
      else if (roas >= be) note = `ROAS of ${roas.toFixed(2)} is above the break-even ${be.toFixed(2)}, yet the campaign loses money: only ${pct(s, 0)} of the orders were incremental. Credit is not causation.`;
      else note = `ROAS of ${roas.toFixed(2)} is below the break-even ${be.toFixed(2)} for a ${pct(m)} contribution margin, so the campaign loses money even before asking how many orders were incremental.`;
      return { headline: { label: 'Marketing ROI', value: pct(roi) }, rows, note };
    },
  },
  'mx-mixsim': {
    type: 'mixsim',
    lock: {},
    show: ['units', 'share', 'revenue', 'margin', 'contribution', 'satisfaction', 'awareness', 'elasticity'],
    note: 'Every decision is open: tier, range, price, channels and the four promotion budgets. The simulator is a teaching model with invented coefficients: use it to compare plans and see trade-offs, not as a forecast.',
  },
};

export const guided = [
  {
    id: 'm02-mx-g1', type: 'steps', kind: 'numerical',
    prompt: 'Harborview Hotel (fictional) runs a search-ad campaign: it spends $4,500, its ads are shown 300,000 times, they get 6,000 clicks and 150 people book a room.',
    solution: 'CPM = 4,500 ÷ 300,000 × 1,000 = $15.00. CTR = 6,000 ÷ 300,000 = 2.0%. Conversion rate = 150 ÷ 6,000 = 2.5%. CPA = 4,500 ÷ 150 = $30.00 per booking. Check: (15 ÷ 1,000) ÷ (0.02 × 0.025) = $30.',
    steps: [
      { id: 'm02-mx-g1-s1', type: 'num', prompt: 'What is the CPM?', answer: 15, check: () => 4500 / 300000 * 1000, unit: '$', places: 2, tol: 0.01,
        hints: ['CPM is the cost per thousand impressions.', 'Divide the spend by the impressions, then multiply by 1,000.'],
        wrong: [{ value: 0.015, say: 'That is the cost per single impression. CPM is per thousand: multiply by 1,000.' }] },
      { id: 'm02-mx-g1-s2', type: 'num', prompt: 'What is the click-through rate, as a percentage?', answer: 2, check: () => 6000 / 300000 * 100, unit: '%', places: 1, tol: 0.01,
        hints: ['CTR = clicks ÷ impressions.'],
        wrong: [{ value: 0.02, say: 'Enter percentages as percentages: 0.02 is 2%.' }] },
      { id: 'm02-mx-g1-s3', type: 'num', prompt: 'What is the conversion rate (bookings per click), as a percentage?', answer: 2.5, check: () => 150 / 6000 * 100, unit: '%', places: 1, tol: 0.01,
        hints: ['Divide conversions by clicks, not by impressions.'],
        wrong: [{ value: 0.05, say: 'You divided bookings by impressions. Conversion rate here is per click: 150 ÷ 6,000.' }] },
      { id: 'm02-mx-g1-s4', type: 'num', prompt: 'What is the CPA (cost per booking)?', answer: 30, check: () => 4500 / 150, unit: '$', places: 2, tol: 0.01,
        hints: ['CPA = spend ÷ conversions.'],
        wrong: [{ value: 0.75, say: 'That is the cost per click (4,500 ÷ 6,000). CPA divides by bookings.' }] },
    ],
  },
  {
    id: 'm02-mx-g2', type: 'num', kind: 'numerical',
    prompt: 'A radio schedule reaches 45% of its target audience, and those reached hear the ad 4 times on average. How many gross rating points does it deliver?',
    answer: 180, check: () => 45 * 4, unit: 'GRPs', places: 0, tol: 0.5,
    hints: ['GRPs = reach (as a percentage) × average frequency.', 'Use 45, not 0.45.'],
    wrong: [{ value: 1.8, say: 'Use reach as a percentage (45), not a decimal: GRPs are on a scale where 100 means one exposure per member of the audience.' }, { value: 49, say: 'Multiply reach by frequency; don’t add them.' }],
    solution: 'GRPs = 45 × 4 = 180. The same weight could come from 90% reach at a frequency of 2: GRPs measure weight, not how many people heard the ad.',
  },
  {
    id: 'm02-mx-g3', type: 'steps', kind: 'applied',
    prompt: 'A fictional online electronics retailer spends $15,000 on a campaign, and its analytics attribute $90,000 of sales to it. After the cost of the products, payment fees and delivery, 12% of each sale is left as contribution. Assume for now that all the attributed sales were caused by the campaign.',
    solution: 'ROAS = 90,000 ÷ 15,000 = 6.0. Contribution = 0.12 × 90,000 = $10,800. ROI = (10,800 − 15,000) ÷ 15,000 = −28%. Break-even ROAS = 1 ÷ 0.12 ≈ 8.33, so a ROAS of 6 loses money at a 12% margin, even if every sale was incremental.',
    steps: [
      { id: 'm02-mx-g3-s1', type: 'num', prompt: 'What is the ROAS?', answer: 6, check: () => 90000 / 15000, unit: '', places: 2, tol: 0.01,
        hints: ['ROAS = attributed revenue ÷ ad spend.'] },
      { id: 'm02-mx-g3-s2', type: 'num', prompt: 'How much contribution did the attributed sales add?', answer: 10800, check: () => 0.12 * 90000, unit: '$', places: 0, tol: 0.5,
        hints: ['Contribution = revenue × contribution margin.'],
        wrong: [{ value: 90000, say: 'That is revenue. Only 12% of it is left after the variable costs.' }] },
      { id: 'm02-mx-g3-s3', type: 'num', prompt: 'What is the marketing ROI, as a percentage?', answer: -28, check: () => (0.12 * 90000 - 15000) / 15000 * 100, unit: '%', places: 1, tol: 0.05,
        hints: ['ROI = (contribution − marketing cost) ÷ marketing cost.', 'The contribution is smaller than the cost, so the answer is negative.'],
        wrong: [{ value: 500, say: 'You used revenue: (90,000 − 15,000) ÷ 15,000. ROI must use contribution, because the retailer doesn’t keep the cost of the products.' }, { value: 72, say: 'That is contribution as a percentage of spend (10,800 ÷ 15,000). Subtract the spend first.' }] },
      { id: 'm02-mx-g3-s4', type: 'num', prompt: 'What ROAS would the campaign need just to break even? Give two decimal places.', answer: 8.33, check: () => 1 / 0.12, unit: '', places: 2, tol: 0.01,
        hints: ['At break-even, revenue × margin = spend.', 'Break-even ROAS = 1 ÷ contribution margin.'] },
    ],
  },
  {
    id: 'm02-mx-g4', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern wants to know how much it paid, on average, for each order its online-shop ads brought in. Which metric answers that?',
    options: ['CPA', 'CPM', 'CTR', 'GRPs'],
    answer: 0,
    hints: ['Look for the metric with conversions in the denominator.'],
    feedback: {
      1: 'CPM is the cost of a thousand impressions: what exposure costs, not what an order costs.',
      2: 'CTR is clicks per impression, a response rate with no cost in it.',
      3: 'GRPs measure the weight of exposure in the target audience; they say nothing about orders.',
    },
    solution: 'CPA (cost per acquisition) = spend ÷ conversions, here the cost of each order. Remember that it divides by all attributed orders, including any that would have happened anyway.',
  },
];

export const independent = [
  {
    id: 'm02-mx-i1', type: 'num', kind: 'numerical',
    prompt: 'An outdoor and online campaign costs $27,000 and delivers 3,600,000 impressions. What is its CPM?',
    answer: 7.5, check: () => 27000 / 3600000 * 1000, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 0.0075, say: 'That is the cost per impression. Multiply by 1,000 for CPM.' }, { value: 133.33, say: 'You divided impressions by spend. CPM is spend ÷ impressions × 1,000.' }],
    solution: 'CPM = 27,000 ÷ 3,600,000 × 1,000 = $7.50 per thousand impressions.',
  },
  {
    id: 'm02-mx-i2', type: 'num', kind: 'numerical',
    prompt: 'A social campaign delivers 2,100,000 impressions to its target audience and reaches 350,000 different people. What is the average frequency?',
    answer: 6, check: () => 2100000 / 350000, unit: '', places: 1, tol: 0.01,
    wrong: [{ value: 0.17, say: 'You divided reach by impressions. Frequency is impressions per person reached.' }],
    solution: 'Average frequency = impressions ÷ reach = 2,100,000 ÷ 350,000 = 6 exposures per person reached.',
  },
  {
    id: 'm02-mx-i3', type: 'num', kind: 'numerical',
    prompt: 'A business keeps 25% of each sale as contribution. What ROAS does a campaign need to break even, assuming all attributed sales are incremental?',
    answer: 4, check: () => 1 / 0.25, unit: '', places: 2, tol: 0.01,
    wrong: [{ value: 1, say: 'A ROAS of 1 only returns the spend in revenue; the business keeps just 25% of that revenue.' }, { value: 0.25, say: 'Invert the margin: break-even ROAS = 1 ÷ 0.25.' }],
    solution: 'Break-even when revenue × 0.25 = spend, so revenue ÷ spend = 1 ÷ 0.25 = 4.0. Any ROAS below 4 loses money; any non-incremental sales raise the bar further.',
  },
  {
    id: 'm02-mx-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Lantern finds that supermarkets with an in-store display sell twice as many cans per week as supermarkets without one. Displays were placed in the stores whose managers agreed to them, mostly large, busy stores. What can Lantern conclude?',
    options: [
      'Not that displays double sales: the busy stores that got them would sell more anyway, so size and display are mixed.',
      'Displays double sales, so putting one in every supermarket should roughly double Lantern’s supermarket volume.',
      'Displays have no effect, because the result is only a correlation, and a correlation can never show an effect.',
      'The result proves displays work, because a difference as large as twice the sales couldn’t come from anything but the display.',
    ],
    answer: 0,
    feedback: {
      1: 'The comparison doesn’t show the display caused the difference: store size and traffic differ between the groups.',
      2: 'A correlation doesn’t prove an effect, but it doesn’t disprove one either. Displays may well help; the data can’t say how much.',
      3: 'A large difference can come entirely from confounding: big stores sell more whether or not they have displays.',
    },
    solution: 'This is correlation with a confounder (store size). To measure the display’s effect, assign displays at random among similar stores, or compare each store’s sales before and after against comparable stores without displays.',
  },
  {
    id: 'm02-mx-i5', type: 'num', kind: 'applied',
    prompt: 'An airline (fictional) emails a fare sale to 50,000 loyalty members but randomly holds out 5,000 of them. Of the 45,000 emailed, 6.0% book; of the 5,000 held out, 5.0% book anyway. How many bookings did the email add?',
    answer: 450, check: () => (0.06 - 0.05) * 45000, unit: 'bookings', places: 0, tol: 0.5,
    wrong: [{ value: 2700, say: 'That is all the bookings by emailed members. The holdout shows 5% would have booked anyway; only the difference is incremental.' }, { value: 500, say: 'Apply the 1-point difference to the 45,000 who were emailed, not to all 50,000.' }],
    solution: 'Emailed members booked at 6.0%, the holdout at 5.0%: the email added 1 percentage point. Incremental bookings = 0.01 × 45,000 = 450, out of 0.06 × 45,000 = 2,700 bookings that last-click reporting might credit to the email.',
  },
  {
    id: 'm02-mx-i6', type: 'short', kind: 'applied',
    prompt: 'A classmate proposes this plan for Lantern: the organic single-origin can at $2.99, three flavours, sold in supermarkets and convenience stores, with $80,000 of trade promotions, $20,000 of PR and no sampling. Use the consistency checklist (product–price, price–place, product–place, place–promotion, promotion–price, promotion–product) to judge whether the mix fits together, and suggest changes.',
    rubric: [
      'Product–price: a premium organic can (quality 8.5) at $2.99 is priced like the mid-range Arcadia ($2.89), undercutting its own positioning.',
      'Price–place: calculates thin margins, e.g. supermarkets 2.99 × 0.68 − 0.88 ≈ $1.15 and convenience 2.99 × 0.60 − 0.88 ≈ $0.91 a can.',
      'Product–place: three flavours in two channels cost (9,000 + 4,000) × 3 = $39,000 in fees plus $12,000 of production cost.',
      'Promotion: heavy trade promotion deepens discounts on an already low price; no sampling means no trial for an unknown brand.',
      'Suggests a coherent alternative (e.g. higher price, natural grocers and direct, fewer flavours, sampling) and how to test it.',
    ],
    model: 'The mix doesn’t fit. Product–price: the organic can is Lantern’s best liquid (taste score 8.5), but $2.99 prices it next to Arcadia, a mid-priced brand, so the price contradicts the product. Price–place: with $0.88 cost of goods, supermarkets leave 2.99 × 0.68 − 0.88 ≈ $1.15 a can and convenience stores 2.99 × 0.60 − 0.88 ≈ $0.91, thin margins to fund promotion. Product–place: three flavours in both channels cost (9,000 + 4,000) × 3 = $39,000 a year in listing fees, plus $12,000 for the range. Promotion: $80,000 of trade promotion cuts an already low price further and teaches shoppers that Lantern is a discount brand, while the absence of sampling leaves 88% of shoppers with no reason to try an unknown can. A consistent alternative: price the organic can around $3.99, launch one flavour in natural grocers and the direct channel (where shoppers pay for quality), spend on sampling and targeted ads around stocking stores, and keep trade promotion to a few windows. Then test the key assumption, that shoppers will pay $3.99, in a few stores before rolling out.',
  },
];

export const check = [
  {
    id: 'm02-mx-k1', type: 'num', kind: 'numerical',
    prompt: 'A campaign spends $8,400 and produces 210 sign-ups. What is the cost per acquisition?',
    answer: 40, check: () => 8400 / 210, unit: '$', places: 2, tol: 0.01,
    wrong: [{ value: 0.025, say: 'You divided sign-ups by spend. CPA is spend ÷ conversions.' }],
    solution: 'CPA = 8,400 ÷ 210 = $40 per sign-up.',
  },
  {
    id: 'm02-mx-k2', type: 'num', kind: 'applied',
    prompt: 'A campaign costs $12,000 and reports a ROAS of 3.5. The business keeps 30% of revenue as contribution, and a holdout test confirms that all the attributed sales were incremental. What is the marketing ROI, as a percentage?',
    answer: 5, check: () => (12000 * 3.5 * 0.30 - 12000) / 12000 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 250, say: 'That treats revenue as profit: (42,000 − 12,000) ÷ 12,000. Only 30% of revenue is contribution.' },
      { value: 105, say: 'That is contribution ÷ spend (12,600 ÷ 12,000). Subtract the spend before dividing.' },
    ],
    solution: 'Revenue = 3.5 × 12,000 = $42,000. Contribution = 0.30 × 42,000 = $12,600. ROI = (12,600 − 12,000) ÷ 12,000 = 5%. A ROAS of 3.5 only just beats the break-even ROAS of 1 ÷ 0.30 ≈ 3.33.',
  },
  {
    id: 'm02-mx-k3', type: 'mc', kind: 'conceptual',
    prompt: 'Under last-click attribution, Lantern’s brand-name search ads (shown when people search “Lantern cold brew”) have the highest ROAS of any spending. Why should Lantern be cautious about moving more money into them?',
    options: [
      'Many of these searchers already knew Lantern and would have used the free listing, so the ads’ incremental effect may be small.',
      'Search ads can never be measured reliably, so no test could show whether these ads add any sales.',
      'Last-click attribution always understates search ads, so their true ROAS is even higher than the report shows.',
      'ROAS is always lower than ROI, so the search ads are even better than their high ROAS makes them look.',
    ],
    answer: 0,
    feedback: {
      1: 'Search ads are among the easiest to measure, and a holdout test can show what brand-name ads add; the issue is what last-click credits, not whether measurement is possible.',
      2: 'Last click tends to overstate touchpoints near the purchase, such as brand search, not understate them.',
      3: 'ROAS and ROI measure different things, and neither is always larger. ROI uses contribution, which is usually much smaller than revenue.',
    },
    solution: 'People searching for the brand by name have usually been persuaded by something else (ads, PR, the shelf, a friend). Last-click gives the search ad the credit. A holdout test, as in eBay’s experiments on brand-keyword ads, is the way to find out how many of those sales the ads actually added.',
  },
  {
    id: 'm02-mx-k4', type: 'mc', kind: 'conceptual',
    prompt: 'Which metric tells you how many different people in the target audience saw a campaign at least once?',
    options: ['Reach', 'Impressions', 'Gross rating points', 'Average frequency'],
    answer: 0,
    feedback: {
      1: 'Impressions count displays, so one person who saw the ad five times counts five times.',
      2: 'GRPs combine reach and frequency into the weight of a schedule; the same GRPs can come from very different numbers of people.',
      3: 'Frequency is how many times, on average, each reached person saw the ad.',
    },
    solution: 'Reach counts different people exposed at least once (often as a percentage of the target audience). Impressions ÷ reach gives average frequency, and reach % × frequency gives GRPs.',
  },
  {
    id: 'm02-mx-k5', type: 'multi', kind: 'applied',
    prompt: 'Lantern is reviewing a proposed plan: the single-origin can at $3.49, one flavour, sold in supermarkets, natural grocers and its own cafés and online shop. Which elements would make the mix inconsistent? Select all that apply.',
    options: [
      'A 12-pack online at a price that works out at $2.79 a can',
      'Sampling teams in convenience stores',
      'Trade promotions at 40% off every other week',
      'Ads near stocking stores during sampling weeks',
      'A press kit about the single-origin beans and the 20-hour steep',
    ],
    answer: [0, 1, 2],
    feedback: {
      3: 'This fits: the ads reach people who can find the can, at the time sampling teams are there.',
      4: 'This fits: the message matches what the product delivers and supports its positioning.',
    },
    solution: 'The cheap online 12-pack undercuts the stores (vertical conflict) and the price position; sampling where the can isn’t stocked wastes trial; frequent 40% deals make the deal price the real price. The geo-targeted ads and the provenance press kit are consistent with the plan.',
  },
  {
    id: 'm02-mx-k6', type: 'num', kind: 'numerical',
    prompt: 'A campaign delivers 840,000 impressions to a target audience of 350,000 people. How many gross rating points is that?',
    answer: 240, check: () => 840000 / 350000 * 100, unit: 'GRPs', places: 0, tol: 0.5,
    wrong: [{ value: 2.4, say: 'GRPs are on a percentage scale: impressions ÷ audience × 100.' }],
    solution: 'GRPs = impressions ÷ audience × 100 = 840,000 ÷ 350,000 × 100 = 240. For example, 60% reach at an average frequency of 4.',
  },
];
