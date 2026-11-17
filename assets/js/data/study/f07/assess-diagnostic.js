// assess-diagnostic.js — F07 diagnostic: what a student already knows about building, linking and using a model.
// Ten items across the three modules; `route` suggests where to start. Quayside Books and its figures are fictional and
// introduced here. No hints; solutions on review.
export const items = [
  {
    id: 'f07-dg-1', lesson: 'modelling-principles', type: 'mc', kind: 'conceptual',
    prompt: 'Quayside Books (fictional) wants a model to decide whether to open a second shop. What should its builder settle first?',
    options: ['Which colour to use for input cells', 'The decision and the outputs that would inform it', 'How many years of history to type in before starting', 'Whether to use one worksheet or several, and how to name the tabs'],
    answer: 1,
    feedback: { 0: 'Conventions matter, but only once you know what the model is for.', 2: 'History comes later; first decide what the model must answer.', 3: 'Layout follows from the outputs and calculations needed.' },
    solution: 'Plan backwards from the decision: the outputs it needs, then the calculations, then the inputs. Build in the other direction.',
  },
  {
    id: 'f07-dg-2', lesson: 'modelling-principles', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the rule for a forecast row.',
    text: 'Each forecast cell in a row holds [[0]] formula, and refers to assumptions in [[1]] cells rather than typing them in.',
    blanks: [{ options: ['a different', 'the same'], answer: 1 }, { options: ['input', 'output'], answer: 0 }],
    solution: 'One formula per row, filled across, referring to input cells: checking one cell checks the row.',
  },
  {
    id: 'f07-dg-3', lesson: 'setting-up-the-history', type: 'num', kind: 'numerical',
    prompt: 'Quayside’s reported EBITDA last year was $64,000, after a one-off $11,000 cost of moving premises. What is its normalised EBITDA?',
    answer: 75000, check: () => 64000 + 11000, unit: '$', places: 0, tol: 1,
    wrong: [{ value: 53000, say: 'A one-off cost is added back to normalise, not subtracted again.' }],
    solution: '64,000 + 11,000 = 75,000 dollars.',
  },
  {
    id: 'f07-dg-4', lesson: 'revenue-and-cost-forecasts', type: 'num', kind: 'numerical',
    prompt: 'Quayside plans 18 author events next year, each selling 40 tickets at $15. What is the forecast event revenue?',
    answer: 10800, check: () => 18 * 40 * 15, unit: '$', places: 0, tol: 1,
    solution: '18 × 40 × 15 = 10,800 dollars: price times volume.',
  },
  {
    id: 'f07-dg-5', lesson: 'working-capital-and-capex', type: 'num', kind: 'numerical',
    prompt: 'Quayside’s cost of goods sold is $292,000 a year and it holds 75 days of stock. What inventory should the model show?',
    answer: 60000, check: () => 292000 * 75 / 365, unit: '$', places: 0, tol: 1,
    solution: '292,000 × 75 ÷ 365 = 60,000 dollars.',
  },
  {
    id: 'f07-dg-6', lesson: 'debt-schedules', type: 'mc', kind: 'conceptual',
    prompt: 'In a model, what is the job of a revolving line of credit?',
    options: ['To pay the dividends each year', 'To balance the cash: drawn to a minimum cash balance, repaid when cash allows', 'To record the interest on every other loan', 'To finance capital spending at a fixed rate over many years, repaid in equal monthly payments'],
    answer: 1,
    feedback: { 0: 'Dividends are a financing outflow decided separately.', 2: 'Each loan carries its own interest.', 3: 'Long-lived assets are usually financed by term loans.' },
    solution: 'The revolver absorbs whatever the other flows leave: it draws to keep cash at the minimum and repays when cash is spare, within its limit.',
  },
  {
    id: 'f07-dg-7', lesson: 'linking-the-statements', type: 'num', kind: 'numerical',
    prompt: 'Quayside’s forecast balance sheet shows assets of $410,000 and liabilities of $260,000. Equity was $120,000 at the start of the year; net income is $40,000 and dividends $10,000. What does the balance check (assets − liabilities − equity) show?',
    answer: 0, check: () => 410000 - 260000 - (120000 + 40000 - 10000), unit: '$', places: 0, tol: 0.5,
    wrong: [{ value: 10000, say: 'Equity at the year end is 120,000 + 40,000 − 10,000 = 150,000: dividends reduce it.' }],
    solution: 'Closing equity 120,000 + 40,000 − 10,000 = 150,000; 410,000 − 260,000 − 150,000 = 0: the statements tie.',
  },
  {
    id: 'f07-dg-8', lesson: 'dcf-model', type: 'num', kind: 'numerical',
    prompt: 'A business’s EBIT is $80,000, its tax rate 25%, depreciation $12,000, capital spending $18,000 and the increase in working capital $4,000. What is its free cash flow to the firm?',
    answer: 50000, check: () => 80000 * 0.75 + 12000 - 18000 - 4000, unit: '$', places: 0, tol: 1,
    solution: '80,000 × 0.75 + 12,000 − 18,000 − 4,000 = 50,000 dollars.',
  },
  {
    id: 'f07-dg-9', lesson: 'scenarios-and-sensitivity', type: 'mc', kind: 'applied',
    prompt: 'A lender asks how much worse than plan Quayside’s sales could be before its loan covenant is breached. Which tool answers that?',
    options: ['A two-way data table of value against the discount rate', 'A stress test that searches for the breaking point', 'A copy of the model with lower sales typed in', 'The base case, read more carefully'],
    answer: 1,
    feedback: { 0: 'That shows how value moves, not where a covenant breaks.', 2: 'A copy answers one guess, and drifts from the real model.', 3: 'The base case shows one outcome, not the limit.' },
    solution: 'A stress test (or a Goal Seek on the covenant) finds the input at which the limit is reached.',
  },
  {
    id: 'f07-dg-10', lesson: 'model-review-and-presentation', type: 'mc', kind: 'applied',
    prompt: 'A model passes all its integrity checks. What should a reviewer do next?',
    options: ['Approve it, because a model whose statements balance in every year must be correct', 'Test whether the forecast is reasonable against the history and the plan', 'Delete the check rows, which have done their job', 'Recalculate every formula by hand to be sure'],
    answer: 1,
    feedback: { 0: 'A model can balance on an impossible forecast.', 2: 'The checks protect every future change: keep them.', 3: 'Reading the symptoms and ratios is far more efficient.' },
    solution: 'Integrity proves consistency; reasonableness tests whether the assumptions make sense.',
  },
];

/** Start at module 2 or 3 when the items for the earlier modules are answered well. */
export const route = [
  { module: 2, ifAtLeast: 0.8 },
  { module: 3, ifAtLeast: 0.8 },
];
