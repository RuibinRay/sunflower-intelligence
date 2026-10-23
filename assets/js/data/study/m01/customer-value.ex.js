// customer-value.ex.js — M01 · Customer value, satisfaction and lifetime value: widgets, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).
// All businesses and figures are fictional. Lifetime value uses the lesson's timing: margins at the end of each year,
// the customer certain to be there for year 1, constant retention.

const clv = (m, r, d) => m / (1 + d - r);
const money = (v, dp = 0) => {
  const a = Math.abs(v);
  const s = a.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return `${v < 0 && Number(a.toFixed(dp)) !== 0 ? '−' : ''}$${s}`;
};

export const widgets = {
  'cv-clv': {
    type: 'formula',
    title: 'Customer lifetime value explorer',
    intro: 'Margins arrive at the end of each year; the customer is certain to be there for year 1 and stays from one year to the next with the retention rate shown.',
    inputs: [
      { id: 'margin', label: 'Margin per customer per year (m)', min: 10, max: 3000, step: 2, value: 144, fmt: 'money' },
      { id: 'retention', label: 'Retention rate (r)', min: 0, max: 95, step: 1, value: 70, fmt: 'pct' },
      { id: 'discount', label: 'Discount rate (d)', min: 0, max: 20, step: 1, value: 10, fmt: 'pct' },
      { id: 'years', label: 'Horizon (T)', min: 1, max: 30, step: 1, value: 10, fmt: 'int', unit: 'years' },
      { id: 'cac', label: 'Cost to win a customer (CAC)', min: 0, max: 2000, step: 10, value: 90, fmt: 'money' },
    ],
    compute: (v) => {
      const r = v.retention / 100;
      const d = v.discount / 100;
      const pv = (t) => (v.margin * r ** (t - 1)) / (1 + d) ** t;
      const xs = Array.from({ length: v.years }, (_, k) => k + 1);
      const cum = [];
      xs.forEach((t, i) => cum.push((i ? cum[i - 1] : 0) + pv(t)));
      const finite = cum[cum.length - 1];
      const all = clv(v.margin, r, d);
      const life = 1 / (1 - r);
      let payback = null;
      let run = 0;
      for (let t = 1; t <= 60; t++) { run += pv(t); if (run >= v.cac - 1e-9) { payback = t; break; } }
      const ratio = v.cac > 0 ? `${(all / v.cac).toFixed(1)} times` : 'no acquisition cost entered';
      let note;
      if (all < v.cac) note = `On these assumptions a customer is worth ${money(all)} in all, less than the ${money(v.cac)} it costs to win one: acquisition at this cost destroys value. Raise retention or margin, or win customers more cheaply.`;
      else if (finite / all < 0.75) note = `The ${v.years}-year horizon captures only ${(finite / all * 100).toFixed(0)}% of the lifetime value: with retention this high, later years still matter. Small changes in retention move the answer a lot, so treat it as an estimate.`;
      else note = `Each customer is worth about ${money(all)} over every future year${v.cac > 0 ? `, ${ratio} the cost of winning one` : ''}. Move retention by five points either way to see how sensitive that is.`;
      return {
        headline: { label: `CLV over ${v.years} year${v.years === 1 ? '' : 's'}`, value: money(finite, 2) },
        rows: [
          ['CLV over every future year: m ÷ (1 + d − r)', money(all, 2)],
          [`Share of that within ${v.years} year${v.years === 1 ? '' : 's'}`, `${(finite / all * 100).toFixed(1)}%`],
          ['Expected years as a customer: 1 ÷ (1 − r)', life.toFixed(2)],
          ['CLV (every future year) minus CAC', money(all - v.cac, 2)],
          ['CLV (every future year) ÷ CAC', ratio],
          ['Year in which discounted margin first covers CAC', v.cac <= 0 ? 'no cost to cover' : payback ? `year ${payback}` : 'not within 60 years'],
        ],
        note,
        chart: {
          kind: 'line',
          x: { label: 'Year of the relationship', values: xs },
          series: [
            { name: 'Cumulative discounted margin ($)', values: cum.map((x) => Math.round(x * 100) / 100) },
            { name: 'Cost to win the customer ($)', values: xs.map(() => v.cac) },
          ],
          y: { label: 'Dollars per customer' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'm01-cv-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional language-learning app charges $10 a month. Serving a subscriber (hosting, support and payment fees) costs $4 a month. 65% of subscribers renew each year, the company discounts future money at 10% a year, and it spends $45 to win each new subscriber. Use the lesson’s timing: margins at the end of each year, with the subscriber certain to be there for year 1.',
    solution: 'Annual margin: ($10 − $4) × 12 = $72. CLV = 72 ÷ (1 + 0.10 − 0.65) = 72 ÷ 0.45 = $160. After the $45 it costs to win a subscriber, each new subscriber is worth $160 − $45 = $115.',
    steps: [
      { id: 'm01-cv-g1-s1', type: 'num',
        prompt: 'What margin does a subscriber bring in a year?',
        answer: 72, check: () => (10 - 4) * 12, unit: '$', places: 0, tol: 0.5,
        hints: ['Margin is what is left after the costs of serving the subscriber.', '($10 − $4) a month, for 12 months.'],
        wrong: [
          { value: 120, say: 'That is a year’s revenue. Lifetime value is built from margin: subtract the $4 a month it costs to serve the subscriber.' },
          { value: 6, say: 'That is the margin for one month. The formula needs the margin for a year.' },
        ] },
      { id: 'm01-cv-g1-s2', type: 'num',
        prompt: 'What is the subscriber’s lifetime value over every future year? Give dollars and cents.',
        answer: 160, check: () => 72 / (1 + 0.10 - 0.65), unit: '$', places: 2, tol: 0.01,
        hints: ['CLV = m ÷ (1 + d − r).', '72 ÷ (1 + 0.10 − 0.65) = 72 ÷ 0.45.'],
        wrong: [
          { value: 205.71, say: 'That is 72 ÷ (1 − 0.65): it leaves out discounting. Later margins are worth less today, so add the discount rate to the denominator.' },
          { value: 266.67, say: 'That uses a year’s revenue ($120). Use the $72 margin.' },
          { value: 110.77, say: 'You divided by the retention rate. The denominator is 1 + d − r = 0.45.' },
        ] },
      { id: 'm01-cv-g1-s3', type: 'num',
        prompt: 'After the $45 it costs to win one, what is a new subscriber worth to the company?',
        answer: 115, check: () => 72 / 0.45 - 45, unit: '$', places: 0, tol: 0.5,
        hints: ['Subtract the acquisition cost from the lifetime value.', '$160 − $45.'],
        wrong: [{ value: 160, say: 'That is the lifetime value before the cost of winning the subscriber.' }] },
    ],
  },
  {
    id: 'm01-cv-g2', type: 'mc', kind: 'conceptual',
    prompt: 'Two guests stay at fictional hotels on the same night. Guest A paid $320 for a luxury hotel, expected near-perfect service and found a good room but a slow, muddled check-in. Guest B paid $90 for a budget hotel, expected a basic room and found it spotless, with a friendly welcome. According to the expectation-disconfirmation model, which is most likely?',
    options: [
      'Guest B is more satisfied, because her stay beat her expectations while A’s fell short of his.',
      'Guest A is more satisfied, because his hotel performed better overall than hers.',
      'Both are equally satisfied, because each got roughly what they paid for.',
      'Neither is satisfied until each hotel lowers its prices.',
    ],
    answer: 0,
    hints: ['Satisfaction compares perceived performance with expectations, not with other hotels.', 'Whose experience was above what they expected, and whose below?'],
    feedback: {
      1: 'A better hotel can still disappoint. A expected near-perfect service, and the slow check-in fell short of that: negative disconfirmation.',
      2: 'Price shapes expectations, but the guests’ experiences relative to those expectations differ: B’s was better than expected, A’s worse.',
      3: 'Satisfaction depends on performance against expectations. A price cut would change future expectations, not how these stays compared with what the guests expected.',
    },
    why: 'B experienced positive disconfirmation (better than expected) and A negative disconfirmation (worse than expected), whatever the absolute standard of the two hotels.',
    solution: 'In Oliver’s model, satisfaction depends on expectations and on disconfirmation, the gap between perceived performance and expectations. B expected little and got more: positive disconfirmation. A expected near-perfection, partly because of the price, and got less: negative disconfirmation. The dearer, better hotel can produce the less satisfied guest.',
  },
  {
    id: 'm01-cv-g3', type: 'classify', kind: 'conceptual',
    prompt: 'An office manager is choosing a caterer for a staff event (some items are hypothetical). Classify each item as a benefit or a cost to the client, and of which kind.',
    items: [
      'Staff stay alert through a long afternoon meeting',
      'Visiting clients see that the firm looks after its guests',
      '$9.00 a head',
      'The two hours the office manager spends planning the event',
      'The chance that the caterer arrives late',
      'A $40 charge for events outside the city centre',
    ],
    categories: ['Functional benefit', 'Emotional or social benefit', 'Money cost', 'Non-money cost'],
    answer: [0, 1, 2, 3, 3, 2],
    hints: [
      'Benefits are what the client gets; costs are what it gives up. Money costs are paid; non-money costs are time, effort and risk.',
      'A risk is a cost even though no money is paid unless it happens.',
    ],
    feedback: {
      1: 'Impressing visitors is about how the firm is seen: a social benefit, not a functional one.',
      4: 'The chance of lateness is a risk the client bears, so it is a non-money cost of choosing this caterer.',
      5: 'An extra charge is part of the money the client pays, even though it isn’t the headline price.',
    },
    solution: 'Functional benefit: alert staff. Social benefit: visitors see the firm looks after them. Money costs: the $9.00 a head and the $40 charge. Non-money costs: the manager’s two hours and the risk of lateness. Customer value weighs all of these against the alternatives.',
  },
  {
    id: 'm01-cv-g4', type: 'short', kind: 'applied',
    prompt: 'A fictional laundry service collects washing from customers’ homes or offices and returns it washed and folded within 48 hours, for $2.50 a kilogram. The alternatives are a self-service laundrette (cheaper, but it takes an evening) and dry cleaners (dearer, and slow for everyday clothes). Write a value proposition for busy working professionals in no more than two sentences, then explain in two or three sentences why it should work.',
    hints: ['Answer four questions: for whom, which benefit, why this beats the alternatives, and what it costs the customer.', 'Give a reason to believe: something specific the service can promise and keep.'],
    rubric: [
      'Names the target customers specifically (for example, professionals who work long hours and have no time for the laundrette).',
      'States the main benefit in the customer’s terms: getting evenings back, not “quality washing”.',
      'Says why it beats the alternatives: cheaper than dry cleaning, and no evening at the laundrette.',
      'Gives a reason to believe that the business can keep, such as a 48-hour promise or a refund if it is late.',
      'Avoids vague claims that any rival could make, such as “great service at great prices”.',
    ],
    model: 'For busy professionals who would rather spend their evenings on anything but laundry: we collect from your home or office and bring it back washed and folded within 48 hours, for $2.50 a kilogram, or that load is free. It should work because it speaks to the customers’ real cost, their time, rather than the price of washing; it sits clearly between the laundrette (cheap but an evening lost) and dry cleaning (dear and slow); and the 48-hour guarantee is a specific promise customers can check, which makes the claim believable and sets an expectation the service can meet every time.',
  },
];

export const independent = [
  {
    id: 'm01-cv-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional software company keeps 80% of its business customers from one year to the next. On the lesson’s assumptions (every customer is there for year 1; retention is the same every year), how many years does a customer stay on average?',
    answer: 5, check: () => 1 / (1 - 0.8), unit: 'years', places: 1, tol: 0.05,
    wrong: [
      { value: 1.25, say: 'That is 1 ÷ 0.8. The expected lifetime is 1 ÷ (1 − r), using the share who leave each year.' },
      { value: 4, say: 'That is r ÷ (1 − r), which counts the years after the first. The customer is there for year 1 as well: 1 ÷ (1 − r).' },
      { value: 0.2, say: 'That is the churn rate, the share who leave each year. Divide 1 by it.' },
    ],
    solution: 'Churn = 1 − 0.80 = 0.20, so on average a customer stays 1 ÷ 0.20 = 5 years. A rise in retention to 90% would double that to 10 years.',
  },
  {
    id: 'm01-cv-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional window-cleaning firm earns a margin of $200 a year from a typical household client. 60% of clients stay from one year to the next, and the firm discounts at 8% a year. The owner counts only the first three years. What is a client’s three-year lifetime value? Give dollars and cents.',
    answer: 345.22, check: () => [1, 2, 3].reduce((s, t) => s + (200 * 0.6 ** (t - 1)) / 1.08 ** t, 0), unit: '$', places: 2, tol: 0.5,
    wrong: [
      { value: 392, say: 'That adds the expected margins ($200 + $120 + $72) without discounting them. Divide year t’s margin by 1.08 raised to t.' },
      { value: 515.42, say: 'That discounts $200 in every year, as if every client stayed. Multiply each year’s margin by the chance the client is still there: 1, 0.6 and 0.36.' },
      { value: 416.67, say: 'That is the value over every future year, 200 ÷ (1.08 − 0.6). The owner counts only three years.' },
    ],
    solution: 'Year 1: 200 ÷ 1.08 = $185.19. Year 2: 200 × 0.6 ÷ 1.08² = 120 ÷ 1.1664 = $102.88. Year 3: 200 × 0.36 ÷ 1.08³ = 72 ÷ 1.2597 = $57.16. Total ≈ $345.22. Over every future year the value would be 200 ÷ (1 + 0.08 − 0.60) ≈ $416.67, so the first three years hold about 83% of it.',
  },
  {
    id: 'm01-cv-i3', type: 'mc', kind: 'applied',
    prompt: 'Last year a fictional gym spent $30,000 to win 120 members, a CAC of $250. The manager is deciding whether to run a new campaign this year. Which comparison should decide it?',
    options: [
      'The expected lifetime value of the members the new campaign would win, against what it would cost per member won',
      'Last year’s $250 CAC against the lifetime value of the members won last year',
      'This year’s campaign cost against the revenue the gym earned last year',
      'The number of members the campaign would win against the number who left last year',
    ],
    answer: 0,
    feedback: {
      1: 'Last year’s spending is sunk: nothing decided now can change it. It may help estimate this year’s costs, but the decision rests on what the new campaign would cost and win.',
      2: 'Last year’s revenue says nothing about whether this campaign’s new members will be worth more than they cost.',
      3: 'Replacing leavers may matter for capacity, but the economic test is value against cost for the new members.',
    },
    why: 'A decision about future spending compares its future cost with the future value it creates; money already spent can’t be recovered either way.',
    solution: 'The relevant comparison is forward-looking: the expected CLV of the members this campaign would win (who may differ from last year’s) against the campaign’s cost per member won, ideally the cost of the extra members it wins. Last year’s acquisition spending is sunk.',
  },
  {
    id: 'm01-cv-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which statements about satisfaction, loyalty and retention are correct? Select all that apply.',
    options: [
      'A satisfied customer may still switch to a rival, for example for variety or a better offer.',
      'A dissatisfied customer may stay when there is no real alternative or switching is costly.',
      'Churn rate is 1 minus the retention rate.',
      'Satisfaction scores from a survey describe all customers accurately, whoever answered.',
      'Raising retention from 80% to 90% doubles the average time a customer stays.',
      'Loyalty refers only to repeat buying, never to what customers think or say.',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Surveys hear from the customers willing to answer, who may be the most (or least) satisfied: non-response bias.',
      5: 'Loyalty also has an attitudinal side: preferring the business and recommending it.',
    },
    solution: 'Satisfaction and loyalty are linked loosely: satisfied customers can leave and dissatisfied ones can stay. Churn = 1 − retention. Expected lifetime is 1 ÷ (1 − r): 5 years at 80% and 10 years at 90%, so it doubles. Loyalty has behavioural and attitudinal sides, and survey scores can be biased by who answers.',
  },
  {
    id: 'm01-cv-i5', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each experience using the expectation-disconfirmation model.',
    items: [
      'A restaurant quoted a 30-minute wait; the table was ready in 10 minutes',
      'A parcel promised for Tuesday arrived on Tuesday',
      'A phone advertised with “all-day battery” needs charging by mid-afternoon',
      'A hotel guest expecting a standard room is upgraded to a suite',
      'A caterer promised baristas on site 30 minutes early; they arrived 30 minutes early',
    ],
    categories: ['Positive disconfirmation', 'Confirmation', 'Negative disconfirmation'],
    answer: [0, 1, 2, 0, 1],
    feedback: {
      2: 'The advertisement set the expectation; performance fell short of it, so this is negative disconfirmation even if the battery is good by industry standards.',
      4: 'Exactly what was promised: confirmation, which still produces satisfaction.',
    },
    solution: 'Better than expected (the short wait, the upgrade): positive disconfirmation. As expected (the Tuesday parcel, the punctual baristas): confirmation. Worse than expected (the battery): negative disconfirmation. In each case the comparison is with what the customer expected, often set by the seller’s own promise.',
  },
  {
    id: 'm01-cv-i6', type: 'num', kind: 'numerical',
    prompt: 'A fictional plant nursery spent $12,600 on advertising and introductory discounts in the spring and won 180 new customers. What was its customer acquisition cost?',
    answer: 70, check: () => 12600 / 180, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 12600, say: 'That is the total spending. Divide it by the 180 new customers it won.' },
      { value: 0.01, say: 'You divided customers by spending. CAC is spending ÷ new customers.' },
    ],
    solution: 'CAC = spending ÷ new customers won = $12,600 ÷ 180 = $70 per customer. Whether that is worth paying depends on the customers’ lifetime value, measured from margin.',
  },
];

export const check = [
  {
    id: 'm01-cv-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement best describes customer value?',
    options: [
      'The customer’s judgement of what she gets against everything she gives up, compared with the alternatives',
      'The lowest price a customer can find for a product of acceptable quality',
      'The margin a business earns from a customer over the whole relationship',
      'The quality of a product as measured by independent experts and tests',
    ],
    answer: 0,
    feedback: {
      1: 'Some consumers do equate value with a low price, but marketers use the broader sense: benefits against all costs, of which price is one.',
      2: 'That is customer lifetime value: value to the business, not value to the customer.',
      3: 'Quality is one benefit, and it counts as the customer perceives it, not as experts measure it. Costs matter too.',
    },
    solution: 'Customer value is the customer’s judgement of the benefits of an offer relative to its total cost in money, time, effort and risk, compared with the alternatives: in Zeithaml’s respondents’ words, “what I get for what I give”.',
  },
  {
    id: 'm01-cv-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional accountancy practice earns a margin of $250 a year from a typical small-business client. 75% of clients stay each year, and the practice discounts at 10% a year. Using the lesson’s formula for every future year, what is a client’s lifetime value? Give dollars and cents.',
    answer: 714.29, check: () => 250 / (1 + 0.10 - 0.75), unit: '$', places: 2, tol: 0.01,
    wrong: [
      { value: 1000, say: 'That is 250 ÷ (1 − 0.75): it leaves out discounting. The denominator is 1 + d − r = 0.35.' },
      { value: 333.33, say: 'You divided by the retention rate. The denominator is 1 + 0.10 − 0.75.' },
      { value: 294.12, say: 'That divides by 1 + d − (1 − r), using the churn rate where the formula needs retention.' },
    ],
    solution: 'CLV = m ÷ (1 + d − r) = 250 ÷ (1 + 0.10 − 0.75) = 250 ÷ 0.35 ≈ $714.29.',
  },
  {
    id: 'm01-cv-k3', type: 'mc', kind: 'applied',
    prompt: 'A fictional children’s swimming school is choosing a value proposition. Which is the strongest?',
    options: [
      'For parents of 4-to-10-year-olds: classes of four at most, so your child swims 10 metres alone within a term, or the next term is free.',
      'The best swimming lessons in town: friendly, experienced teachers, a warm pool and great value for every family.',
      'Swimming lessons for children and adults at every level, seven days a week, at prices to suit every budget.',
      'A newly renovated pool, modern changing rooms, free parking and a comfortable café where parents can wait.',
    ],
    answer: 0,
    feedback: {
      1: 'Every rival can claim to be the best with great value. It names no target customer and gives no reason to believe.',
      2: 'Trying to serve everyone gives no one a reason to choose this school over the alternatives.',
      3: 'These are features, some of them useful, but they don’t say what benefit a child or parent gets, or why that beats the alternatives.',
    },
    why: 'It names the customers, promises a specific benefit, explains how it is delivered (small classes) and backs it with a guarantee the school must keep.',
    solution: 'A strong value proposition answers: for whom (parents of 4-to-10-year-olds), which benefit (swimming 10 metres alone), why this school delivers it better (classes of four) and a reason to believe (the free-term guarantee). The others are vague, try to serve everyone, or list features without benefits.',
  },
  {
    id: 'm01-cv-k4', type: 'num', kind: 'applied',
    prompt: 'A fictional broadband provider earns a margin of $180 a year per household. 80% of households stay each year, it discounts at 10% a year, and it spends $250 to win each new household. On the lesson’s formula for every future year, what is a new household worth to the provider after the cost of winning it?',
    answer: 350, check: () => 180 / (1 + 0.10 - 0.80) - 250, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 600, say: 'That is the lifetime value. Subtract the $250 it costs to win the household.' },
      { value: -70, say: 'That compares one year’s margin with the acquisition cost. The household is expected to stay several years: use the lifetime value.' },
      { value: 650, say: 'That uses 180 ÷ (1 − 0.8) = $900, leaving out discounting. Use 1 + d − r = 0.30.' },
    ],
    solution: 'CLV = 180 ÷ (1 + 0.10 − 0.80) = 180 ÷ 0.30 = $600. After the $250 acquisition cost, a new household is worth $600 − $250 = $350, so winning households at this cost creates value, on these assumptions.',
  },
  {
    id: 'm01-cv-k5', type: 'classify', kind: 'conceptual',
    prompt: 'On the lesson’s lifetime-value formula, does each change raise a customer’s CLV, lower it, or leave it unchanged?',
    items: [
      'Retention rises from 60% to 65%',
      'The discount rate rises from 8% to 12%',
      'The cost of serving each customer rises, with prices unchanged',
      'Last year’s acquisition spending turns out to have been higher than budgeted',
      'Each customer orders once more a year, at the same margin per order',
    ],
    categories: ['Raises CLV', 'Lowers CLV', 'Leaves CLV unchanged'],
    answer: [0, 1, 1, 2, 0],
    feedback: {
      1: 'A higher discount rate makes future margins worth less today, so CLV falls.',
      3: 'Acquisition spending is not part of CLV, and last year’s is sunk. It changes CLV minus CAC for last year’s customers, not their lifetime value.',
      4: 'More orders at the same margin each raise the annual margin m, and CLV rises with m.',
    },
    solution: 'CLV = m ÷ (1 + d − r). Higher retention or a higher annual margin (more orders) raise it; a higher discount rate or higher costs of serving (a lower m) lower it. Acquisition spending is outside the formula, and past spending is sunk.',
  },
  {
    id: 'm01-cv-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are assumptions behind the lesson’s formula CLV = m ÷ (1 + d − r)? Select all that apply.',
    options: [
      'Each year’s margin arrives at the end of that year.',
      'The customer is certain to be there for the first year.',
      'Retention is the same in every year.',
      'Every future year is counted.',
      'The margin is the customer’s revenue, before any costs.',
      'The cost of winning the customer is included in the margin.',
    ],
    answer: [0, 1, 2, 3],
    feedback: {
      4: 'The formula uses margin, what is left after the costs of serving the customer. Using revenue overstates CLV.',
      5: 'Acquisition cost is kept out of CLV and compared with it separately: CLV − CAC.',
    },
    solution: 'The short formula assumes end-of-year margins, a customer certain to be there in year 1, constant retention (and margin and discount rate) and an unlimited horizon. It uses margin, not revenue, and leaves acquisition cost out so that it can be compared with CLV.',
  },
];
