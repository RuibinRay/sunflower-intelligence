// scenarios-and-sensitivity.ex.js — F07 · Scenarios and sensitivity: widgets, practice and the knowledge check (answer
// keys live here). The explorer runs case.js's whole linked model through scenario(); every num item's `check` recomputes.
import { scenario, SCENARIO_RESULTS as S } from './case.js?v=35';

const f0 = (x) => (Math.round(x) + 0).toLocaleString('en-US');

export const widgets = {
  'sc-explorer': {
    type: 'formula', title: 'Lantern’s scenarios: the whole model on sliders',
    intro: 'Every slider changes an input of the linked model; the current ratios, the line of credit and the DCF are recalculated from scratch.',
    inputs: [
      { id: 'online', label: 'Online growth, share of plan', min: 0, max: 150, step: 5, value: 100, fmt: 'pct' },
      { id: 'cafe', label: 'Café growth a year (4 = Ana’s plan, slowing to 3%)', min: 0, max: 8, step: 0.5, value: 4, fmt: 'pct' },
      { id: 'cans', label: 'Cold Brew cans, share of plan', min: 50, max: 130, step: 5, value: 100, fmt: 'pct' },
      { id: 'month', label: 'Month the second kitchen opens (2028)', min: 4, max: 10, step: 1, value: 4, fmt: 'int' },
      { id: 'loan', label: 'Term loan', min: 60000, max: 140000, step: 5000, value: 60000, fmt: 'money' },
    ],
    compute: (v) => {
      const x = scenario({ online: v.online / 100, cafeGrowth: v.cafe === 4 ? null : v.cafe / 100, cans: v.cans / 100, opensMonth: v.month, termAmount: v.loan });
      const R = x.model.rows;
      return {
        headline: { label: 'Covenant (current ratio of at least 1.2 every year end)', value: x.passes ? 'Passes' : `Breached in ${R.filter((r) => r.currentRatio < 1.2).map((r) => r.year).join(', ')}` },
        rows: [...R.map((r) => [`Current ratio ${r.year}`, r.currentRatio.toFixed(2)]), ['Line of credit drawn, end of 2028', `$${f0(R[0].loc)}`], ['Equity value (DCF at the WACC)', `$${f0(x.equity)}`]],
        note: x.gap > 0 ? `The line of credit would need $${f0(x.gap)} more than its $30,000 limit: a funding gap.` : x.passes ? 'Every year end passes. Is there headroom, or only just?' : 'Try a larger loan, or see which slider moves 2028 most.',
        chart: { kind: 'line', x: { label: 'Year end', values: R.map((r) => String(r.year)) }, series: [{ name: 'Current ratio', values: R.map((r) => Math.round(r.currentRatio * 100) / 100) }, { name: 'Covenant minimum', values: R.map(() => 1.2) }], y: { label: 'Ratio' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f07-sc-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Which tool answers each question?',
    items: ['What happens to the covenant if growth is slower across all the lines?', 'Which single assumption moves the 2028 current ratio most?', 'How much worse than plan can sales be before the line of credit runs out?', 'How does the equity value change with the WACC and long-run growth together?'],
    categories: ['Scenario', 'Tornado (one at a time)', 'Stress test', 'Two-way sensitivity table'],
    answer: [0, 1, 2, 3],
    hints: ['Several assumptions together, one at a time, a limit, or two inputs crossed?'],
    solution: 'A scenario changes several assumptions together; a tornado ranks them one at a time; a stress test looks for the breaking point; a two-way table crosses two inputs.',
  },
  {
    id: 'f07-sc-g2', type: 'num', kind: 'numerical',
    prompt: 'A current-ratio covenant has a minimum of 1.2 and the forecast ratio is 1.35. What is the headroom, as a percentage of the limit?',
    answer: 12.5, check: () => (1.35 - 1.2) / 1.2 * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [{ value: 15, say: 'That is the gap in points of ratio (0.15) read as a percentage; headroom is the gap divided by the limit.' }],
    hints: ['(Ratio − limit) ÷ limit.'],
    solution: '(1.35 − 1.2) ÷ 1.2 = 12.5%.',
  },
  {
    id: 'f07-sc-g3', type: 'mc', kind: 'applied',
    prompt: 'A three-month delay to the second kitchen barely changes Lantern’s 2028 current ratio (1.01 either way). Why?',
    options: ['The kitchen’s costs start later along with its sales', 'The model ignores the kitchen until 2029 in every case', 'Kitchen revenue is paid in advance, so it is unearned revenue', 'The term loan is drawn only when the kitchen opens'],
    answer: 0,
    feedback: { 1: 'The model includes the kitchen from its opening month.', 2: 'Kitchen sales are invoiced, not prepaid.', 3: 'The loan is drawn on 31 March in every scenario.' },
    hints: ['What else moves when the opening date moves?'],
    solution: 'Variable costs, fixed costs and rent are calendarised from the same opening month, so the delay shifts both sides of the kitchen’s contribution.',
  },
  {
    id: 'f07-sc-g4', type: 'steps', kind: 'numerical',
    prompt: 'Searching for the smallest loan that passes a covenant: $60,000 fails and $100,000 passes.',
    steps: [
      { id: 'f07-sc-g4a', type: 'num', kind: 'numerical', prompt: 'What loan amount should be tried next ($)?', answer: 80000, check: () => (60000 + 100000) / 2, unit: '$', places: 0, tol: 1, hints: ['The midpoint of the range.'] },
      { id: 'f07-sc-g4b', type: 'num', kind: 'numerical', prompt: '$80,000 passes. What is the next amount to try ($)?', answer: 70000, check: () => (60000 + 80000) / 2, unit: '$', places: 0, tol: 1, hints: ['The answer lies between the last failure and the new pass.'] },
    ],
    solution: 'Try the midpoint, $80,000; it passes, so the answer lies between $60,000 and $80,000: try $70,000 next. Each step halves the range.',
  },
];

export const independent = [
  {
    id: 'f07-sc-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Why should scenarios live inside one model rather than in copies of it?',
    options: ['Copies drift apart as they are corrected', 'Because spreadsheets cannot hold more than one scenario', 'Because lenders refuse to read more than one file', 'Because copies make the model calculate more slowly'],
    answer: 0,
    feedback: { 1: 'They can hold many, through a scenario selector.', 2: 'The reason is reliability, not the number of files.', 3: 'Speed is not the issue.' },
    solution: 'With one model and a block of scenario inputs, every scenario uses the same, corrected calculations.',
  },
  {
    id: 'f07-sc-i2', type: 'num', kind: 'numerical',
    prompt: 'In a tornado chart for the 2028 current ratio, Cold Brew volume moves it from 0.87 to 1.18, and online growth from 0.94 to 1.10. What is the swing for Cold Brew volume?',
    answer: 0.31, check: () => 1.18 - 0.87, unit: '', places: 2, tol: 0.005,
    solution: '1.18 − 0.87 = 0.31; online growth swings 0.16, so Cold Brew volume goes higher on the chart.',
  },
  {
    id: 'f07-sc-i3', type: 'num', kind: 'numerical',
    prompt: `Under slow growth, Lantern’s current ratio is ${S.slow.ratios[0].toFixed(2)} at the end of 2028. By how much is that below the 1.2 covenant, as a percentage of the limit?`,
    answer: Math.round((1.2 - S.slow.ratios[0]) / 1.2 * 1000) / 10, check: () => (1.2 - S.slow.ratios[0]) / 1.2 * 100, unit: '%', places: 1, tol: 0.2,
    solution: `(1.2 − ${S.slow.ratios[0].toFixed(2)}) ÷ 1.2 = ${((1.2 - S.slow.ratios[0]) / 1.2 * 100).toFixed(1)}% short.`,
  },
  {
    id: 'f07-sc-i4', type: 'mc', kind: 'applied',
    prompt: 'A modeller’s tornado gives online growth a range of ±50% and every other assumption ±5%. What does the chart show?',
    options: ['Mostly the ranges chosen, not the business', 'That online growth is the only assumption that matters', 'That the other assumptions can safely be ignored', 'Nothing, because tornado charts need equal ranges to draw'],
    answer: 0,
    feedback: { 1: 'It may matter, but this chart cannot show it fairly.', 2: 'With fair ranges they might matter a lot.', 3: 'They draw with any ranges; the problem is interpretation.' },
    solution: 'A tornado ranks swings, which depend on the ranges chosen. Give each assumption an equally plausible range.',
  },
  {
    id: 'f07-sc-i5', type: 'num', kind: 'numerical',
    prompt: 'With an $80,000 term loan, Lantern’s slow-growth current ratios are 0.94 (2028) and 1.01 (2029). A stepped covenant sets minimums of 0.9 for 2028 and 1.0 for 2029. By how many points of ratio does 2029 clear its minimum?',
    answer: 0.01, check: () => 1.01 - 1.0, unit: '', places: 2, tol: 0.003,
    solution: '1.01 − 1.0 = 0.01: it passes, with almost no headroom; Ana should tell Coastline so.',
  },
];

export const check = [
  {
    id: 'f07-sc-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What makes a good downside scenario for a lender?',
    options: ['A plausible bad outcome with consistent inputs', 'The worst outcome imaginable, with every risk at once', 'The base case with revenue cut by exactly 50%', 'Whatever outcome still passes every covenant'],
    answer: 0,
    feedback: { 1: 'An implausible disaster tells a lender little about real risk.', 2: 'A mechanical cut ignores costs and the story behind it.', 3: 'Choosing scenarios to pass defeats the purpose.' },
    solution: 'Plausible and consistent: slower growth across the lines, as in Lantern’s slow-growth case.',
  },
  {
    id: 'f07-sc-k2', type: 'num', kind: 'numerical',
    prompt: 'The base case passes the covenant every year with a term loan of at least $76,481. Ana asks for $80,000. How much headroom, in dollars, is that above the break-even loan?',
    answer: 3519, check: () => 80000 - 76481, unit: '$', places: 0, tol: 1,
    solution: '80,000 − 76,481 = 3,519 dollars.',
  },
  {
    id: 'f07-sc-k3', type: 'mc', kind: 'applied',
    prompt: 'Coastline tests the covenant at every quarter end; Lantern’s model is annual. What should Ana do?',
    options: ['Add a quarterly cash forecast for 2028', 'Nothing: a year-end pass implies every quarter passes', 'Ask Coastline to test the covenant only at year ends', 'Divide the annual figures by four to estimate each quarter'],
    answer: 0,
    feedback: { 1: 'Cash can dip within a year; a year-end pass does not prove the quarters.', 2: 'Asking is possible, but the risk is still there; she should know it.', 3: 'Balances at a quarter end are not a quarter of annual flows.' },
    solution: 'A short-term quarterly or monthly model shows the quarter ends the annual model cannot.',
  },
  {
    id: 'f07-sc-k4', type: 'num', kind: 'numerical',
    prompt: 'In a two-way table, Lantern’s equity value is $557,475 at an 11.16% WACC with 1.5% growth and $695,855 with 3.5% growth. How much does the two-point change in long-run growth add?',
    answer: 138380, check: () => 695855 - 557475, unit: '$', places: 0, tol: 1,
    solution: '695,855 − 557,475 = 138,380 dollars.',
  },
  {
    id: 'f07-sc-k5', type: 'mc', kind: 'conceptual',
    prompt: 'A scenario table shows Lantern breaching its covenant under slow growth. What does it tell you about the probability of a breach?',
    options: ['Nothing on its own about likelihood', 'That a breach is certain if growth slows at all', 'That the chance of a breach is one in five, with five scenarios', 'That the base case is the most likely outcome'],
    answer: 0,
    feedback: { 1: 'It shows one specific slowdown, not every slowdown.', 2: 'Scenarios are not equally likely draws.', 3: 'The base case is the plan; the table does not say it is most likely.' },
    solution: 'Scenarios show consequences. Likelihood is a separate judgement.',
  },
  {
    id: 'f07-sc-k6', type: 'mc', kind: 'applied',
    prompt: 'Which proposal is best supported by Lantern’s scenarios?',
    options: ['An $80,000 loan with a covenant of 0.9, 1.0, then 1.2', 'A $60,000 loan with the original 1.2 covenant in every year', 'A $60,000 loan with no covenant at all on the current ratio', 'A $140,000 loan, so as to be safe in every possible case'],
    answer: 0,
    feedback: { 1: 'The base case breaches it at the end of 2028.', 2: 'A lender will not drop the covenant; it is how the bank protects itself.', 3: 'Borrowing far more than needed raises interest and repayments for no reason.' },
    solution: 'The base case passes 1.2 throughout with $80,000; slow growth passes the stepped covenant. That is a proposal the bank can accept.',
  },
];
