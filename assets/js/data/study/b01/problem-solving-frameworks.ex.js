// problem-solving-frameworks.ex.js — B01 · Problem-solving frameworks: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const signed = (v) => {
  const c = Math.round(Math.abs(v));
  return `${c === 0 ? '' : v < 0 ? '−' : '+'}$${c.toLocaleString('en-US')}`;
};
const money = (v) => `$${Math.round(v).toLocaleString('en-US')}`;
const SPLIT = ['MECE', 'Overlap: not mutually exclusive', 'Gap: not collectively exhaustive'];

export const widgets = {
  'psf-driver': {
    type: 'formula',
    title: 'Revenue driver tree: which driver moved revenue?',
    intro: 'April (fixed): 50,000 visits, 2.0% conversion, $60 average order value, so $60,000 of revenue. Set May’s drivers. Contributions are found by changing visits first, then conversion, then order value.',
    inputs: [
      { id: 'visits', label: 'May visits', min: 30000, max: 80000, step: 1000, value: 56000, fmt: 'int', unit: 'visits' },
      { id: 'conv', label: 'May conversion rate', min: 0.5, max: 4, step: 0.1, value: 1.6, fmt: 'pct' },
      { id: 'aov', label: 'May average order value', min: 30, max: 100, step: 1, value: 62, fmt: 'money' },
    ],
    compute: (v) => {
      const V0 = 50000, c0 = 0.02, A0 = 60, R0 = V0 * c0 * A0;
      const V1 = v.visits, c1 = v.conv / 100, A1 = v.aov, R1 = V1 * c1 * A1;
      const dV = (V1 - V0) * c0 * A0, dc = V1 * (c1 - c0) * A0, dA = V1 * c1 * (A1 - A0);
      const fV = V1 / V0, fc = c1 / c0, fA = A1 / A0;
      const parts = [['visits', dV], ['the conversion rate', dc], ['the average order value', dA]];
      const big = parts.reduce((m, p) => (Math.abs(p[1]) > Math.abs(m[1]) ? p : m));
      const hidden = Math.abs(R1 - R0) / R0 < 0.05 && fc < 0.85;
      return {
        headline: { label: 'Change in revenue, May against April', value: signed(R1 - R0) },
        rows: [
          ['Revenue in April', money(R0)],
          ['Revenue in May', money(R1)],
          ['From visits (changed first)', signed(dV)],
          ['From conversion (changed second)', signed(dc)],
          ['From average order value (changed third)', signed(dA)],
          ['Growth factors: visits × conversion × order value', `${fV.toFixed(3)} × ${fc.toFixed(3)} × ${fA.toFixed(3)} = ${(fV * fc * fA).toFixed(3)}`],
        ],
        note: Math.abs(big[1]) < 0.5
          ? 'Nothing has changed: May’s drivers equal April’s.'
          : hidden
            ? `Revenue is within 5% of April’s, yet the conversion rate has fallen by ${((1 - fc) * 100).toFixed(0)}%. The headline hides a problem that the driver tree reveals.`
            : `The largest contribution comes from ${big[0]} (${signed(big[1])}). That is the branch to split further, for example by channel or device.`,
        chart: {
          kind: 'bar',
          x: { label: 'Driver', values: ['Visits', 'Conversion', 'Order value', 'Total change'] },
          series: [{ name: 'Change in revenue ($)', values: [dV, dc, dA, R1 - R0].map((x) => Math.round(x)) }],
          y: { label: 'Change in revenue ($)' },
        },
      };
    },
  },
};

export const guided = [
  {
    id: 'b01-psf-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Is each split MECE? If not, is the problem an overlap or a gap?',
    items: [
      'Customers by age: under 35, 35 to 54, and 55 or over',
      'Customers as new, returning or subscribers (every subscriber has ordered before)',
      'Orders by channel: website or app, for a shop that also takes orders by phone',
      'Markets: the United Kingdom, Europe and the rest of the world',
      'Costs: food, staff and everything else',
      'Revenue: online and in shops, for a firm that also sells wholesale to cafés',
    ],
    categories: SPLIT,
    answer: [0, 1, 2, 1, 0, 2],
    hints: [
      'For each split, ask two questions: could one item belong to two groups? Could an item belong to none?',
      '“Everything else” is a common way to close a gap. Is the United Kingdom part of Europe?',
    ],
    feedback: {
      1: 'Every subscriber is also a returning customer, so subscribers fall in two groups.',
      2: 'Phone orders belong to neither group: there is a gap.',
      3: 'The United Kingdom is in Europe, so a British sale falls in two groups. “Rest of Europe” would fix it.',
      5: 'Wholesale sales to cafés fall in neither group.',
    },
    solution: 'The age bands and the cost split (closed by “everything else”) are MECE. New/returning/subscribers and UK/Europe overlap. Website/app (with phone orders) and online/shops (with wholesale) leave gaps.',
  },
  {
    id: 'b01-psf-g2', type: 'steps', kind: 'numerical',
    prompt: 'A fictional online tea shop had 20,000 visits in March, a conversion rate of 2.5% and an average order value of $40. In April it had 24,000 visits, a conversion rate of 2.0% and an average order value of $42. Use the driver tree to see what happened, changing visits first, then conversion, then order value.',
    solution: 'March revenue: 20,000 × 0.025 × 40 = $20,000. April: 24,000 × 0.020 × 42 = $20,160, up $160. Visits: (24,000 − 20,000) × 0.025 × 40 = +$4,000. Conversion: 24,000 × (0.020 − 0.025) × 40 = −$4,800. Order value: 24,000 × 0.020 × (42 − 40) = +$960. Check: 4,000 − 4,800 + 960 = $160. Flat revenue hides a 20% fall in conversion.',
    steps: [
      { id: 'b01-psf-g2-s1', type: 'num',
        prompt: 'What was revenue in March?',
        answer: 20000, check: () => 20000 * 0.025 * 40, unit: '$', places: 0, tol: 0.5,
        hints: ['Revenue = visits × conversion rate × average order value.', 'Write the conversion rate as a decimal: 2.5% = 0.025.'],
        wrong: [
          { value: 2000000, say: 'You used 2.5 instead of 0.025. Convert the percentage to a decimal before multiplying.' },
          { value: 800000, say: 'That is visits × order value. Only the visits that convert become orders: multiply by 0.025 as well.' },
        ] },
      { id: 'b01-psf-g2-s2', type: 'num',
        prompt: 'Changing visits first, how much did the rise in visits contribute?',
        answer: 4000, check: () => (24000 - 20000) * 0.025 * 40, unit: '$', places: 0, tol: 0.5,
        hints: ['Hold the conversion rate and order value at March’s levels.', '(24,000 − 20,000) × 0.025 × 40.'],
        wrong: [
          { value: 3360, say: 'You used April’s conversion rate and order value. The first driver is changed while the others stay at their March levels.' },
        ] },
      { id: 'b01-psf-g2-s3', type: 'num',
        prompt: 'Changing conversion second, how much did the fall in conversion contribute? (Enter a negative number for a fall.)',
        answer: -4800, check: () => 24000 * (0.02 - 0.025) * 40, unit: '$', places: 0, tol: 0.5,
        hints: ['Visits are now at April’s level; the order value is still at March’s.', '24,000 × (0.020 − 0.025) × 40.'],
        wrong: [
          { value: -4000, say: 'You used March’s visits. Visits were changed first, so use April’s 24,000.' },
          { value: -5040, say: 'You used April’s order value. Order value is changed last, so use March’s $40 here.' },
          { value: 4800, say: 'Check the sign: conversion fell, so its contribution is negative.' },
        ] },
      { id: 'b01-psf-g2-s4', type: 'num',
        prompt: 'Changing order value last, how much did the rise in order value contribute?',
        answer: 960, check: () => 24000 * 0.02 * (42 - 40), unit: '$', places: 0, tol: 0.5,
        hints: ['Visits and conversion are now both at April’s levels.', '24,000 × 0.020 × (42 − 40).'],
        wrong: [
          { value: 1000, say: 'You used March’s visits and conversion rate. By the third step both have been changed to April’s levels.' },
        ] },
      { id: 'b01-psf-g2-s5', type: 'mc',
        prompt: 'Revenue rose by only $160. What should the manager take from the driver tree?',
        options: [
          'A 20% fall in conversion is hidden by more visits: investigate conversion.',
          'Revenue barely moved, so nothing important changed and nothing needs investigating.',
          'Visits changed by the most, so visits are the driver to investigate first.',
          'Order value rose, so the shop should push its higher-value products harder.',
        ],
        answer: 0,
        hints: ['Which contribution is largest in size, and which way does it point?'],
        feedback: {
          1: 'The total barely moved, but two large changes cancelled out. A fall in conversion of a fifth is a real problem.',
          2: 'Visits rose and added revenue. The largest contribution in size, and the only large negative one, came from conversion.',
          3: 'Order value contributed the least of the three, and pushing it would not fix the fall in conversion.',
        } },
    ],
  },
  {
    id: 'b01-psf-g3', type: 'order', kind: 'conceptual',
    prompt: 'Put the six phases of CRISP-DM in order.',
    items: [
      'Business understanding: set the business objectives and success criteria, and plan the project',
      'Data understanding: collect, describe and explore the data, and verify its quality',
      'Data preparation: select, clean, construct and combine the data for analysis',
      'Modelling: choose techniques, build models and assess them',
      'Evaluation: judge the results against the business objectives and decide the next steps',
      'Deployment: put the results to use and plan monitoring and maintenance',
    ],
    hints: [
      'The first phase is about the business, not the data.',
      'Evaluation checks the results against the business objectives before anything is put into use.',
    ],
    solution: 'Business understanding, data understanding, data preparation, modelling, evaluation, deployment. The guide stresses that the sequence is not rigid: projects move back and forth between phases, and a deployed result raises new business questions.',
  },
  {
    id: 'b01-psf-g4', type: 'mc', kind: 'applied',
    prompt: 'A fictional supermarket chain has combined its loyalty-card data with daily weather records for the first time. Nobody has a specific question yet; the marketing director wants to know whether anything in the combined data is worth pursuing. Which approach fits best?',
    options: [
      'Explore first: chart and summarise the data, then test what looks promising.',
      'Pick the likeliest hypothesis now, such as sales rising on hot days, and test only that.',
      'Run the five whys on the merger, asking why the data were combined until a goal appears.',
      'Wait until a business question arises, because data without a question cannot be used.',
    ],
    answer: 0,
    hints: [
      'Is there a decision or a specific question yet?',
      'Exploration suits new data and open questions; its risk is mistaking chance patterns for findings.',
    ],
    feedback: {
      1: 'With no question yet, picking one hypothesis now is arbitrary and may miss what the data actually show.',
      2: 'The five whys looks for the cause of a specific problem. There is no problem here, only new data.',
      3: 'Exploration is exactly how new data suggest questions. The caution is to test what it finds before believing it.',
    },
    solution: 'With a new dataset and no question, explore first: check that the data are what you think, and look for patterns. Treat anything interesting (say, sales of a product rising on hot days) as a hypothesis to test on new data, because some patterns found by searching will be chance.',
  },
];

export const independent = [
  {
    id: 'b01-psf-i1', type: 'num', kind: 'numerical',
    prompt: 'At a fictional online shop, visits rose by 10%, the conversion rate fell by 10% and the average order value did not change. By what percentage did revenue change? Give one decimal place, with a minus sign for a fall.',
    answer: -1, check: () => (1.1 * 0.9 * 1 - 1) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 0, say: 'Growth rates of drivers that multiply do not add. Multiply the growth factors: 1.10 × 0.90 = 0.99.' },
      { value: -10, say: 'That is the change in conversion alone. Visits rose by 10% too: multiply 1.10 × 0.90.' },
    ],
    solution: 'Revenue’s growth factor is 1.10 × 0.90 × 1.00 = 0.99, so revenue fell by 1.0%. Adding the growth rates (+10% − 10% = 0%) misses the 1%.',
  },
  {
    id: 'b01-psf-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Which framework fits each task best?',
    items: [
      'Charting a newly acquired dataset of sensor readings to see what it contains before forming any hypothesis',
      'Tracing a fall in revenue to changes in visits, conversion rate and average order value',
      'Planning a project to build a model that predicts which customers will cancel, from agreeing objectives through to putting the model into use',
      'Splitting “why are our hotel’s guests less satisfied?” into every area that could be responsible, without overlaps',
      'Asking repeatedly why one delivery went to the wrong address, until reaching a step in the process that failed',
    ],
    categories: ['Issue tree', 'Driver tree', 'Five whys', 'Exploratory data analysis', 'CRISP-DM'],
    answer: [3, 1, 4, 0, 2],
    feedback: {
      1: 'Revenue = visits × conversion × order value is arithmetic, so the tree is a driver tree.',
      3: 'Satisfaction has no arithmetic formula, so a MECE issue tree, not a driver tree, organises the search.',
      4: 'A single, contained incident traced back step by step suits the five whys.',
    },
    solution: 'New sensor data: exploratory data analysis. Revenue’s drivers: driver tree. A model-building project from objectives to deployment: CRISP-DM. Guest satisfaction: issue tree. The misdelivered parcel: five whys.',
  },
  {
    id: 'b01-psf-i3', type: 'rows', kind: 'applied',
    prompt: 'Rentals at a fictional bike-hire kiosk fell by a quarter from 1 May. The analyst wrote each hypothesis with what it predicts, then gathered the evidence. Select every hypothesis that the evidence contradicts.',
    data: { table: {
      head: ['Hypothesis', 'If true, expect', 'What the data show'],
      rows: [
        ['Fewer people passed the kiosk', 'Footfall down by a similar amount', 'Footfall down 2%, within its usual variation'],
        ['A rival opened nearby', 'Fall starting when the rival opened', 'The rival opened on 3 June; rentals fell from 1 May'],
        ['Bikes were out of service', 'More bikes marked under repair', 'Bikes under repair rose from 4 to 19 on 1 May'],
        ['Prices rose', 'Fall starting on the date of a price change', 'Prices unchanged since January'],
        ['Bad weather', 'Fall on rainy days, normal on dry days', 'Rentals down on dry and rainy days alike'],
      ],
    } },
    answer: [0, 1, 3, 4],
    solution: 'Footfall barely moved, the rival came a month too late, prices did not change and the fall happened in all weather, so those four hypotheses are contradicted. Only the out-of-service hypothesis fits: 15 more bikes under repair from 1 May. The next step is a root-cause question about why so many bikes broke at once.',
  },
  {
    id: 'b01-psf-i4', type: 'mc', kind: 'applied',
    prompt: 'An analyst finds that late deliveries at a fictional courier firm rose because one depot lost two drivers, which explains about 90% of the rise. Two agency drivers would cost $3,000 a month and can be cancelled at any time. Two more weeks of analysis might explain the other 10%. What should she recommend?',
    options: [
      'Hire the agency drivers now and measure late deliveries weekly.',
      'Wait two weeks so the whole rise is explained before spending money.',
      'Run a formal statistical test on the 90% before acting on it.',
      'Hire two permanent drivers now, since the cause is known.',
    ],
    answer: 0,
    feedback: {
      1: 'Explaining the last 10% would not change the decision about the depot, and two weeks of late deliveries have a cost.',
      2: 'The evidence already points clearly at the depot, and the action is cheap and reversible. Measuring after acting is the test.',
      3: 'Acting is right, but permanent hires are harder to reverse, and without measurement nobody will know whether the fix worked.',
    },
    solution: 'The explanation accounts for most of the change, the action is cheap and reversible, and further analysis could not change it. Act, measure the result weekly, and keep investigating the remaining 10% if it persists rather than letting it delay the decision.',
  },
  {
    id: 'b01-psf-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional hotel’s room revenue is rooms sold × average rate. Last month it sold 2,000 room-nights at $150; this month 1,900 at $160. Changing rooms sold first and then the rate, how much did the change in rate contribute to the change in revenue?',
    answer: 19000, check: () => 1900 * (160 - 150), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 20000, say: 'You used last month’s 2,000 rooms. Rooms sold were changed first, so the rate step uses this month’s 1,900.' },
      { value: 4000, say: 'That is the total change in revenue (304,000 − 300,000). The question asks for the rate’s share of it.' },
      { value: -15000, say: 'That is the contribution of rooms sold: (1,900 − 2,000) × 150.' },
    ],
    solution: 'Rooms first: (1,900 − 2,000) × 150 = −$15,000. Rate second: 1,900 × (160 − 150) = +$19,000. Together: +$4,000, which matches 1,900 × 160 − 2,000 × 150 = 304,000 − 300,000.',
  },
  {
    id: 'b01-psf-i6', type: 'multi', kind: 'conceptual',
    prompt: 'Which are real limitations of the five whys? Select all that apply.',
    options: [
      'Different people can follow different chains of whys from the same problem and reach different causes.',
      'It tends to follow a single causal path, so problems with several causes can be missed.',
      'Five is a strict rule: stopping after four whys or going to six is an error.',
      'The deepest cause it reaches is not always the best place to intervene.',
      'It cannot be used outside car manufacturing.',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'Five is a rule of thumb. Stop when the answer points to something the business can change.',
      4: 'It began in the Toyota Production System but is used widely, for example in hospitals and offices; its limits come from its single-path logic, not its origin.',
    },
    solution: 'Card (2017) describes three problems: results depend on who asks (different chains), the single path misses other causes, and the deepest cause is not always the most effective point of control. The number five is a rule of thumb, and the method is used in many industries.',
  },
];

export const check = [
  {
    id: 'b01-psf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does it mean for the branches at one level of an issue tree to be MECE?',
    options: [
      'No overlaps between the branches, and no gaps.',
      'Every branch is measured in the same units, so they can be added.',
      'Each branch is equally likely to contain the cause.',
      'The branches are listed from most to least important.',
    ],
    answer: 0,
    feedback: {
      1: 'Units matter in a driver tree’s arithmetic, but MECE is about overlaps and gaps.',
      2: 'Branches can differ greatly in how likely they are; MECE only requires that they do not overlap and leave nothing out.',
      3: 'Order of importance helps when deciding where to look first, but it is not part of the MECE test.',
    },
    solution: 'Mutually exclusive: no overlaps, so nothing is investigated or counted twice. Collectively exhaustive: no gaps, so no possible cause is left without a branch.',
  },
  {
    id: 'b01-psf-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional online jewellery shop had revenue of $30,600 in May from 18,000 visits at a conversion rate of 2.5%. What was its average order value?',
    answer: 68, check: () => 30600 / (18000 * 0.025), unit: '$', places: 2, tol: 0.005,
    wrong: [
      { value: 1.7, say: 'That is revenue per visit (30,600 ÷ 18,000). Average order value divides revenue by orders.' },
      { value: 0.68, say: 'You multiplied by 2.5 instead of 0.025. There were 18,000 × 0.025 = 450 orders.' },
    ],
    solution: 'Orders = visits × conversion rate = 18,000 × 0.025 = 450. Average order value = revenue ÷ orders = 30,600 ÷ 450 = $68.00.',
  },
  {
    id: 'b01-psf-k3', type: 'classify', kind: 'conceptual',
    prompt: 'A team is building a model to predict which customers will cancel their subscription. Which CRISP-DM phase does each task belong to?',
    items: [
      'Remove duplicate customers and create a column for months since the last order',
      'Agree with the sales director what success would look like for the model',
      'Check whether the best model meets the sales director’s success criteria before it is used',
      'Count missing values and find out what each column in the customer table means',
      'Put the model’s scores into the customer-service system and plan how they will be monitored',
      'Fit several models that predict cancellation and compare them',
    ],
    categories: ['Business understanding', 'Data understanding', 'Data preparation', 'Modelling', 'Evaluation', 'Deployment'],
    answer: [2, 0, 4, 1, 5, 3],
    feedback: {
      0: 'Cleaning and constructing new columns is data preparation.',
      2: 'Judging results against the business objectives before use is evaluation.',
      3: 'Describing the data and verifying its quality is data understanding, which comes before changing anything.',
    },
    solution: 'Success criteria: business understanding. Missing values and column meanings: data understanding. Duplicates and a new column: data preparation. Fitting and comparing models: modelling. Checking against the success criteria: evaluation. Putting scores into use and planning monitoring: deployment.',
  },
  {
    id: 'b01-psf-k4', type: 'mc', kind: 'applied',
    prompt: 'With Ana’s question brief for September agreed, which check should you run first, and why?',
    options: [
      'Match September’s paid orders to the payment provider’s statement.',
      'Build a model of which visits convert, using every column in the data.',
      'Survey September’s website visitors about the new checkout.',
      'Chart every column of the export by hour to see what stands out.',
    ],
    answer: 0,
    feedback: {
      1: 'A model is far more work, does not test any of the brief’s hypotheses directly, and would inherit any counting error.',
      2: 'Lantern has no way to reach visitors who did not order, and a survey would take weeks; the decision is due in days.',
      3: 'That is a fishing trip. The brief already names the hypotheses to test, in a sensible order.',
    },
    solution: 'Hypothesis-driven work starts with the branch that is cheapest to test and most damaging if true. Comparing the shop’s paid orders with the payment provider’s statement takes minutes, and if the counts disagree (H4), every other result would rest on wrong numbers. So it comes first; then work down the driver tree.',
  },
  {
    id: 'b01-psf-k5', type: 'num', kind: 'numerical',
    prompt: 'At a fictional online shop, visits fell by 5%, the conversion rate rose by 8% and the average order value rose by 2%. By what percentage did revenue change? Give one decimal place.',
    answer: 4.7, check: () => (0.95 * 1.08 * 1.02 - 1) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 5, say: 'That adds the growth rates (−5 + 8 + 2). The drivers multiply: 0.95 × 1.08 × 1.02.' },
      { value: 104.7, say: 'That is the growth factor as a percentage. The change is the factor minus 1: 1.0465 − 1.' },
    ],
    solution: 'Growth factor: 0.95 × 1.08 × 1.02 ≈ 1.0465, so revenue rose by about 4.7%. Adding the rates gives 5%, a small but real error.',
  },
  {
    id: 'b01-psf-k6', type: 'multi', kind: 'applied',
    prompt: 'A fictional online shoe retailer has traced most of a fall in sales to a discount-code bug that has rejected valid codes since Monday. Which are good reasons to stop analysing and fix it now? Select all that apply.',
    options: [
      'The explanation accounts for most of the fall.',
      'The fix is cheap and can be reversed if it does not help.',
      'Further analysis would not change what to do.',
      'Every other possible cause has been ruled out with certainty.',
      'Sales will be measured after the fix to confirm that it worked.',
      'The analyst has a favourite explanation and the data have not contradicted it yet.',
    ],
    answer: [0, 1, 2, 4],
    feedback: {
      3: 'Certainty never arrives. The test is whether more evidence could change the decision, not whether every doubt is gone.',
      5: 'Not being contradicted yet is weak evidence. The reasons to stop are about the size of the explanation and the cost of further delay.',
    },
    solution: 'Stop when the explanation accounts for most of the change, when the action is cheap and reversible, and when more evidence could not change the decision, and then measure the result. Waiting for certainty, or stopping because an explanation is attractive, are not good reasons.',
  },
];
