// project.js — F07 applied project: Lantern's five-year model for Coastline Bank. The student works through the model
// stage by stage on the lessons' worksheets and explorers, then answers Coastline's credit committee, which asks for
// its own "committee case" (online growth at 65% of plan, cafés at 3% a year, Cold Brew 10% fewer cans). Every figure
// is computed below from case.js (scenario(), MODEL, DERIVED) and checked by `verify`.
import { scenario, MODEL as M, DERIVED, HISTORY, VALUATION as V } from './case.js?v=37';
import { historyCells } from './setting-up-the-history.ex.js?v=37';
import { forecastCells } from './revenue-and-cost-forecasts.ex.js?v=37';
import { widgets as SCW } from './scenarios-and-sensitivity.ex.js?v=37';

const COMMITTEE = { online: 0.65, cafeGrowth: 0.03, cans: 0.9 };
const C60 = scenario(COMMITTEE), C80 = scenario({ ...COMMITTEE, termAmount: 80000 });
const CF = C60.model.F;
let lo = 60000, hi = 400000; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (scenario({ ...COMMITTEE, termAmount: mid }).passes) hi = mid; else lo = mid; }
const NEED = hi;
const stepped = (x) => x.ratios[0] >= 0.9 && x.ratios[1] >= 1.0 && x.ratios.slice(2).every((v) => v >= 1.2);
// 2027 at a twelve-month run rate: the one-off research added back, and the cafés' two missing months at 2027's
// café economics (sales, 31% cost of goods, wages and lease cost for two months)
const twoMonths = 236000 / 10 * 2;
const runRate = DERIVED.normalisedEbitda2027 + twoMonths * (1 - 0.31) - 92000 / 10 * 2 - 40000 / 10 * 2;
const n = (x) => (Math.round(x) + 0).toLocaleString('en-US');
const r2 = (x) => x.toFixed(2);

const M$ = '$#,##0', P = '0.0%';
const fcCols = ['D', 'E', 'F', 'G', 'H'];
const fcFormats = { ...Object.fromEntries(fcCols.flatMap((k) => [[`${k}3`, P], [`${k}4`, P], [`${k}5`, P], [`${k}9`, '#,##0'], [`${k}10`, M$], [`${k}11`, M$], [`${k}8`, M$], [`${k}45`, P], ...[28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].map((r) => [`${k}${r}`, M$])])), C28: M$, C29: M$, C30: M$, C31: M$ };

export default {
  title: 'Lantern’s five-year model for Coastline Bank',
  brief: [
    { p: 'It is February 2028. Coastline Bank’s credit committee has read Ana’s model and her proposal: an $80,000 term loan instead of $60,000, with a stepped current-ratio covenant (at least 0.9 at the end of 2028, 1.0 in 2029 and 1.2 from 2030). Before it decides, the committee wants the model run on its own, more cautious assumptions, the <b>committee case</b>: online sales growing at 65% of Ana’s planned rates, café sales growing 3% a year, and 10% fewer cans of Cold Brew than planned. Everything else stays as in Ana’s base case.' },
    { p: 'You are working as Ana’s modeller. Rebuild the key parts of the model, run the committee case through it, and answer the committee with a recommendation it can act on. Every figure is fictional; the method is the one a real bank would use.' },
  ],
  deliverables: [
    'A check that the history is right, and the twelve-month run rate of 2027 EBITDA.',
    'The committee case’s revenue and EBITDA, from the forecast worksheet.',
    'The committee case’s current ratio at each year end, with the $60,000 and the $80,000 loan, and the smallest loan that would meet a flat 1.2 covenant.',
    'The committee case’s equity value, compared with the base case.',
    'A one-page memo to the credit committee with your recommendation.',
  ],
  stages: [
    {
      id: 'history', title: 'Check the history and the run rate',
      html: 'The condensed history is on the worksheet. Confirm it agrees with the accounts, then answer the committee’s first question: what would 2027 EBITDA have been in a normal, twelve-month year?',
      tool: { kind: 'widget', widget: { type: 'sheet', title: 'Lantern’s condensed history (fictional case figures)', sheet: { cells: historyCells() }, view: 'A1:C24', widths: { A: 36, B: 12, C: 12 }, editable: true, tools: ['formulas', 'reset'], formats: Object.fromEntries(['B', 'C'].flatMap((k) => [[`${k}17`, M$], [`${k}22`, M$], [`${k}19`, P], [`${k}20`, P], [`${k}23`, P]])) } },
      items: [
        { id: 'f07-pj-1', type: 'num', kind: 'numerical',
          prompt: `Start from normalised 2027 EBITDA of $${n(DERIVED.normalisedEbitda2027)} (the one-off research added back). The cafés traded ten months; add the two missing months at 2027’s café economics: sales of $236,000 for ten months, cost of goods 31% of sales, café wages $92,000 and lease cost $40,000 for the ten months. What is 2027 EBITDA at a twelve-month run rate?`,
          answer: Math.round(runRate), check: () => runRate, unit: '$', places: 0, tol: 2,
          solution: `Two months of sales: 236,000 ÷ 10 × 2 = 47,200; less 31% cost of goods (14,632), two months of wages (18,400) and lease cost (8,000): +6,168. Run rate ${n(DERIVED.normalisedEbitda2027)} + 6,168 = ${n(runRate)} dollars.` },
        { id: 'f07-pj-2', type: 'mc', kind: 'applied',
          prompt: 'The committee’s analyst asks why the run-rate figure, not reported 2027 EBITDA ($52,587), is the right base to compare the forecast with. What is the best answer?',
          options: ['Because it is higher and so makes the forecast look better', 'It removes a one-off cost and the cafés’ part year, so it shows a typical year', 'Because reported figures are never used in models of private businesses', 'Because the bank’s rules require every borrower to annualise all its figures'],
          answer: 1,
          feedback: { 0: 'That would be a bad reason; the adjustments must each be justified.', 2: 'Reported figures stay in the history; the run rate is an adjusted view beside them.', 3: 'Only part-year items are annualised, and only where it makes sense.' },
          solution: 'Each adjustment has a reason: research that will not recur, and two months the cafés did not yet trade. The result is a fairer picture of the business that will exist in 2028.' },
      ],
    },
    {
      id: 'forecast', title: 'Run the committee case through the forecast',
      html: 'Change the worksheet’s inputs to the committee case: online growth at 65% of each year’s rate (row 4), café growth 3% in every year (row 3), and Cold Brew cans 10% lower (row 9). Read the results in rows 34 and 44.',
      tool: { kind: 'widget', widget: { type: 'sheet', title: 'Lantern’s forecast to EBITDA (set the committee case)', sheet: { cells: forecastCells() }, view: 'A1:H45', maxHeight: '32rem', widths: { A: 40, B: 10, C: 11, D: 11, E: 11, F: 11, G: 11, H: 11 }, editable: true, formats: fcFormats, tools: ['formulas', 'reset'] } },
      items: [
        { id: 'f07-pj-3', type: 'num', kind: 'numerical', prompt: 'In the committee case, what is Lantern’s revenue in 2028?', answer: Math.round(CF.revenue[0]), check: () => CF.revenue[0], unit: '$', places: 0, tol: 2,
          solution: `$${n(CF.revenue[0])}, against $${n(M.F.revenue[0])} in the base case.` },
        { id: 'f07-pj-4', type: 'num', kind: 'numerical', prompt: 'In the committee case, what is Lantern’s EBITDA in 2029?', answer: Math.round(CF.ebitda[1]), check: () => CF.ebitda[1], unit: '$', places: 0, tol: 2,
          solution: `$${n(CF.ebitda[1])}, against $${n(M.F.ebitda[1])} in the base case: ${((1 - CF.ebitda[1] / M.F.ebitda[1]) * 100).toFixed(0)}% lower, because fixed costs do not fall with sales.` },
      ],
    },
    {
      id: 'covenant', title: 'Test the covenant and the loan',
      html: 'The scenario explorer runs the whole linked model. Set the committee case (online 65%, cafés 3%, Cold Brew 90%), then try the $60,000 and $80,000 loans and search for the smallest loan that passes a flat 1.2 covenant.',
      tool: { kind: 'widget', widget: SCW['sc-explorer'] },
      items: [
        { id: 'f07-pj-5', type: 'num', kind: 'numerical', prompt: 'With the original $60,000 loan, what is the committee case’s current ratio at the end of 2028? Give two decimal places.', answer: Math.round(C60.ratios[0] * 100) / 100, check: () => C60.ratios[0], unit: '×', places: 2, tol: 0.006,
          solution: `${r2(C60.ratios[0])}: well below 1.2, with $${n(C60.model.rows[0].loc)} still drawn on the line of credit.` },
        { id: 'f07-pj-6', type: 'num', kind: 'numerical', prompt: 'With the $80,000 loan Ana proposes, what is the committee case’s current ratio at the end of 2028?', answer: Math.round(C80.ratios[0] * 100) / 100, check: () => C80.ratios[0], unit: '×', places: 2, tol: 0.006,
          solution: `${r2(C80.ratios[0])}: below a flat 1.2, above the stepped covenant’s 0.9 for 2028.` },
        { id: 'f07-pj-7', type: 'num', kind: 'numerical', prompt: 'To the nearest thousand dollars, what is the smallest term loan for which the committee case passes a flat 1.2 covenant at every year end?', answer: Math.ceil(NEED / 1000) * 1000, check: () => Math.ceil(NEED / 1000) * 1000, unit: '$', places: 0, tol: 500,
          solution: `The break-even is $${n(NEED)}: $${n(Math.ceil(NEED / 1000) * 1000)} is the smallest whole thousand that passes.` },
        { id: 'f07-pj-8', type: 'mc', kind: 'applied',
          prompt: 'With $80,000, does the committee case meet Ana’s stepped covenant (0.9, 1.0, then 1.2)?',
          options: ['No: it fails in 2028', 'Yes: every year end meets its step', 'Only from 2030 onward, after the line is repaid', 'It cannot be told without a monthly model'],
          answer: 1,
          feedback: { 0: `2028 is ${r2(C80.ratios[0])}, above the 0.9 step.`, 2: 'The earlier steps are met too.', 3: 'The annual model answers the year ends; a monthly model would add the quarters.' },
          solution: `${C80.ratios.map(r2).join(', ')}: above 0.9, 1.0 and then 1.2 at every year end.` },
      ],
    },
    {
      id: 'value', title: 'What the committee case does to value',
      html: 'Hollis Avery will see the committee case too. Compare its value with the base case.',
      items: [
        { id: 'f07-pj-9', type: 'num', kind: 'numerical', prompt: `The base case values Lantern’s equity at $${n(scenario({}).equity)} at the WACC. The committee case gives $${n(C60.equity)}. By what percentage is the committee case lower? Give one decimal place.`,
          answer: Math.round((1 - C60.equity / scenario({}).equity) * 1000) / 10, check: () => (1 - C60.equity / scenario({}).equity) * 100, unit: '%', places: 1, tol: 0.06,
          solution: `1 − ${n(C60.equity)} ÷ ${n(scenario({}).equity)} = ${((1 - C60.equity / scenario({}).equity) * 100).toFixed(1)}%. Still far above the $${n(V.hollisPre)} Hollis’s price implies.` },
      ],
    },
    {
      id: 'memo', title: 'Write to the credit committee',
      html: 'Write the one-page memo: lead with the recommendation, then the evidence from both cases, then the risks and what Lantern will do about them.',
      items: [
        { id: 'f07-pj-10', type: 'short', kind: 'applied',
          prompt: 'Write the memo to Coastline’s credit committee (200–300 words).',
          rubric: [
            'Leads with a clear request: the loan amount and the covenant terms.',
            'Gives the base case and the committee case side by side: current ratio each year, and what is drawn on the line of credit.',
            'States the smallest loan that meets a flat 1.2 covenant in the committee case, and why Lantern asks for the stepped covenant instead.',
            'Names the main risks (Cold Brew’s launch, slower growth) and the controls: a quarterly cash forecast for 2028, and reporting actual results against the model.',
            'States the model’s simplifications and that it balances in every year and scenario.',
          ],
          model: `<b>Recommendation.</b> Lend Lantern $80,000 over five years at 7.5%, with a current-ratio covenant of at least 0.9 at 31 December 2028, 1.0 in 2029 and 1.2 from 2030. <b>Evidence.</b> In Ana’s base case the ratio is ${scenario({ termAmount: 80000 }).ratios.map(r2).join(', ')} at the year ends 2028–2032, above a flat 1.2 throughout. In the committee’s more cautious case (online growth at 65% of plan, cafés at 3%, 10% fewer Cold Brew cans) it is ${C80.ratios.map(r2).join(', ')}: inside the stepped covenant every year, with the line of credit repaid during 2029. Meeting a flat 1.2 in the committee case would need a loan of about $${n(Math.ceil(NEED / 1000) * 1000)}; the stepped covenant protects the bank at lower debt. <b>Risks.</b> 2028 is the investment year: Cold Brew’s launch costs are fixed while its volume is not, and coverage is thin until 2029. Lantern will send a quarterly cash forecast for 2028 and quarterly actual-versus-forecast reports. <b>Model.</b> Three linked statements, 2028–2032, balancing in every year and scenario; annual, so quarter ends are covered by the quarterly forecast; the second kitchen’s rent expensed and book depreciation used for tax, both stated.` },
      ],
    },
  ],
  rubric: [
    'The history ties to the accounts, and every adjustment to it is labelled and explained.',
    'The committee case was run through the model by changing inputs only, never by typing over results.',
    'The covenant was tested at every year end for both loan sizes, and the break-even loan found by search, with headroom added.',
    'The memo leads with a recommendation the committee can act on, and shows both cases and their risks honestly.',
    'The model’s simplifications are stated where they matter to the decision.',
  ],
  verify() {
    return [
      ['run rate', runRate, 79755, 0.5],
      ['committee revenue 2028', CF.revenue[0], Math.round(CF.revenue[0]), 0.5],
      ['committee ratio 2028 at 60k', C60.ratios[0], 0.88, 0.005],
      ['committee ratio 2028 at 80k', C80.ratios[0], 1.09, 0.005],
      ['break-even loan', NEED, 90224, 1],
      ['stepped covenant met at 80k', stepped(C80) ? 1 : 0, 1, 0],
      ['committee case equity', C60.equity, 430852, 1],
      ['base equity', scenario({}).equity, Math.round(scenario({}).equity), 0.5],
      ['history EBITDA 2027', HISTORY[2027].ebitda, 52587, 0.5],
    ];
  },
};
