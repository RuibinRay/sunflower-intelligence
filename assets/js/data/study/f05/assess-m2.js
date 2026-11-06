// assess-m2.js — F05 module 2 test: Analysing projects (choosing-between-projects, project-risk).
// No hints. Each item has a full solution, shown when the student reviews the test. New scenarios, not copies of the lesson
// exercises. Every business, person and figure is fictional; item 9 uses Lantern’s roaster from case.js.
import { ROASTER, ROASTERS } from './case.js?v=28';
import { breakEvenVolumes } from '../../../core/corpfin.js?v=28';
import { irr, ration } from '../../../core/invest.js?v=28';

const af = (n, k) => (1 - (1 + k) ** -n) / k;
const vans = { E: 48000 / af(8, 0.08) + 3000, D: 30000 / af(5, 0.08) + 7500 };
// H1 and H2 are mutually exclusive: ration() over the list without H2 and without H1, and keep the better answer
const garden = [{ outlay: 30000, npv: 9000 }, { outlay: 30000, npv: 8400 }, { outlay: 25000, npv: 5500 }, { outlay: 20000, npv: 3600 }];
const RG = [ration([garden[0], garden[2], garden[3]], 60000), ration([garden[1], garden[2], garden[3]], 60000)].sort((x, y) => y.exactNpv - x.exactNpv)[0];
const ebike = breakEvenVolumes({ price: 18, unitCost: 4, fixed: 50000, dep: 12000, capex: 60000, n: 5, r: 0.10, tax: 0.25 });

export const items = [
  {
    id: 'f05-m2-1', lesson: 'choosing-between-projects', type: 'num', kind: 'numerical',
    prompt: 'A fictional cinema can refit one screen in one of two ways. Basic: −$20,000 today, then +$9,000 a year for three years. Premium: −$32,000 today, then +$14,000 a year for three years. What is the incremental IRR of the premium refit over the basic one, in % to one decimal place?',
    answer: 12.0, check: () => irr([-12000, 5000, 5000, 5000]) * 100, unit: '%', places: 1, tol: 0.06,
    wrong: [
      { value: 16.6, say: 'That is the basic refit’s own IRR. The incremental IRR is the IRR of premium minus basic: −$12,000, then +$5,000 a year.' },
      { value: 14.9, say: 'That is the premium refit’s own IRR. Subtract the basic refit’s cash flows first.' },
      { value: -1.7, say: 'That subtracts one IRR from the other. Take the IRR of the difference in cash flows.' },
    ],
    solution: 'Premium − basic: −$12,000 today and +$5,000 a year for three years. The 3-year annuity factor must be 12,000 ÷ 5,000 = 2.4, which gives an IRR of about 12.0%. If the cinema’s cost of capital is below 12.0% (say 10%), the premium refit adds more value (NPV $2,816 against $2,382 at 10%) even though its own IRR (14.9%) is below the basic refit’s (16.6%).',
  },
  {
    id: 'f05-m2-2', lesson: 'choosing-between-projects', type: 'mc', kind: 'conceptual',
    prompt: 'Two mutually exclusive projects cost the same today. Project L pays most of its cash in years 4 and 5; project S pays most in years 1 and 2. Their NPV profiles cross at 13%, and the firm’s cost of capital is 9%. Which statement is true?',
    options: ['At 9% L has the higher NPV, and the ranking flips above 13%', 'S has the higher NPV at 9%, because cash that arrives sooner is worth more', 'The two have equal NPVs at 9%, because they cost the same amount today', 'Each project’s IRR is 13%, so at 9% both should be accepted together'],
    answer: 0,
    feedback: { 1: 'Quick cash is worth more per dollar, but L pays more in total. Below the crossover rate the later-paying project has the higher NPV.', 2: 'Equal NPVs happen only at the crossover rate, 13%.', 3: 'The crossover rate is where the two NPVs are equal, not where either NPV is zero; and mutually exclusive projects can’t both be accepted.' },
    solution: 'Below the crossover rate, the project with more (but later) cash has the higher NPV; above it, the quicker project wins. At 9% choose L. IRR ranks the projects as if the rate were above the crossover, so it would often favour S.',
  },
  {
    id: 'f05-m2-3', lesson: 'choosing-between-projects', type: 'num', kind: 'applied',
    prompt: 'A fictional courier firm needs a van for the foreseeable future. An electric van costs $48,000, lasts eight years and costs $3,000 a year to run; a diesel van costs $30,000, lasts five years and costs $7,500 a year to run. Running costs are paid at the end of each year; ignore tax and resale values; the rate is 8%. How much a year does the cheaper van save, to the nearest dollar?',
    answer: Math.round(vans.D - vans.E), check: () => vans.D - vans.E, unit: '$', places: 0, tol: 1.5,
    wrong: [
      { value: 4500, say: 'That spreads the prices evenly without discounting (48,000 ÷ 8 and 30,000 ÷ 5 are both $6,000). Use the annuity factors at 8%: 5.7466 for eight years, 3.9927 for five.' },
    ],
    solution: 'Electric: 48,000 ÷ 5.7466 + 3,000 = 8,352.71 + 3,000 = $11,352.71 a year. Diesel: 30,000 ÷ 3.9927 + 7,500 = 7,513.69 + 7,500 = $15,013.69 a year. The electric van is cheaper by about $3,661 a year, assuming each van is replaced like for like.',
  },
  {
    id: 'f05-m2-4', lesson: 'choosing-between-projects', type: 'num', kind: 'applied',
    prompt: 'A fictional garden centre has $60,000 to invest this year in projects that can’t be split. H1, a glasshouse on the south plot, costs $30,000 (NPV $9,000). H2, a café on the same south plot, costs $30,000 (NPV $8,400): the plot can hold only one of them. H3, a delivery van, costs $25,000 (NPV $5,500), and H4, a new till system, $20,000 (NPV $3,600). What is the largest total NPV the centre can achieve?',
    answer: 14500, check: () => RG.exactNpv, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 17400, say: 'That is H1 + H2, the top two by profitability index. They are mutually exclusive: the south plot holds only one.' },
      { value: 12600, say: 'H1 + H4 fits, but H1 + H3 adds more within the $60,000.' },
      { value: 13900, say: 'H2 + H3 fits, but the glasshouse (H1) adds more than the café on the same plot.' },
    ],
    solution: 'PIs: H1 1.30, H2 1.28, H3 1.22, H4 1.18. Taking them in PI order would pick H1 and H2 ($60,000, NPV $17,400), but they are mutually exclusive. Allowing at most one of them, the sets that fit are H1 + H3 ($55,000, NPV $14,500), H1 + H4 ($12,600), H2 + H3 ($13,900), H2 + H4 ($12,000) and H3 + H4 ($9,100); three projects would cost at least $75,000. The best is H1 + H3: $14,500.',
  },
  {
    id: 'f05-m2-5', lesson: 'choosing-between-projects', type: 'mc', kind: 'conceptual',
    prompt: 'A hospital compares two scanners with different lives by their equivalent annual costs. Its engineers expect much cheaper and better scanners to be available in five years. What does this mean for the comparison?',
    options: ['Annual equivalents assume like-for-like replacement, so model the actual replacement path', 'Nothing: the equivalent annual cost already allows for technical change through the discount rate', 'The hospital should raise the discount rate on both scanners to allow for the new technology', 'The scanner with the shorter life should be rejected, since it will be the first to become obsolete'],
    answer: 0,
    feedback: {
      1: 'The equivalent annual cost assumes each machine is replaced by an identical one at the same real cost, which is exactly what the engineers doubt.',
      2: 'Technical change affects the cash flows (what the replacement will cost and do), not the rate for risk.',
      3: 'A shorter life could be an advantage here: it lets the hospital switch to the better scanner sooner.',
    },
    solution: 'Annual equivalents and replacement chains both assume identical replacements. When the replacement will differ, model the actual sequence: each scanner now, then the new technology when each wears out, over a common horizon. The short-lived scanner may then win because it reaches the better technology sooner.',
  },
  {
    id: 'f05-m2-6', lesson: 'project-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional e-bike hire stand charges $18 a hire, and each hire costs $4 in charging, cleaning and repairs. Fixed cash costs are $50,000 a year. The bikes and stand cost $60,000, depreciated straight line over five years to zero. Tax is 25%; the required return is 10%. What is the financial (NPV) break-even, in hires a year? Round to the nearest hire.',
    answer: Math.round(ebike.financial), check: () => ebike.financial, unit: 'hires', places: 0, tol: 1.5,
    wrong: [
      { value: Math.round(ebike.accounting), say: 'That is the accounting break-even, (50,000 + 12,000) ÷ 14. At that volume the investment earns no return at all.' },
      { value: Math.round(ebike.cash), say: 'That is the cash break-even, 50,000 ÷ 14, which ignores the investment altogether.' },
    ],
    solution: `Contribution = 18 − 4 = $14 a hire; depreciation = $12,000 a year. EAC of the investment = 60,000 × 0.10 ÷ (1 − 1.1⁻⁵) = $15,827.85. Q = [50,000 + (15,827.85 − 0.25 × 12,000) ÷ 0.75] ÷ 14 = [50,000 + 17,103.80] ÷ 14 ≈ ${Math.round(ebike.financial).toLocaleString('en-US')} hires a year, against an accounting break-even of ${Math.round(ebike.accounting).toLocaleString('en-US')} and a cash break-even of ${Math.round(ebike.cash).toLocaleString('en-US')}.`,
  },
  {
    id: 'f05-m2-7', lesson: 'project-risk', type: 'mc', kind: 'conceptual',
    prompt: 'In a fictional hotel’s tornado chart, the room rate is tested from $140 to $160 and occupancy from 50% to 90%; occupancy shows by far the widest swing. A colleague concludes that the room rate hardly matters. What is the main weakness in that conclusion?',
    options: ['The swings reflect the ranges chosen, and occupancy’s range is far wider; ranges should be equally plausible', 'Tornado charts can only test one input at a time, so the room rate was never really tested against occupancy', 'Room rates are set by the hotel itself, so they carry no risk that a tornado chart could show', 'The widest bar in a tornado chart always belongs to the input with the least uncertainty'],
    answer: 0,
    feedback: {
      1: 'A tornado tests each input in turn; both inputs were tested.',
      2: 'The hotel sets its rates, but competition may force them down; what matters is the plausible range.',
      3: 'The widest bar reflects both the input’s range and the NPV’s sensitivity to it.',
    },
    solution: 'A tornado ranks inputs by the swing over the ranges chosen. Occupancy was given a ±40% range and the rate only about ±7%, so the comparison is unfair. Choose ranges with the same likelihood (for example, a 1-in-10 chance of falling outside each end) before reading the ranking.',
  },
  {
    id: 'f05-m2-8', lesson: 'project-risk', type: 'num', kind: 'applied',
    prompt: 'A fictional skincare brand can launch a pilot range now, with an NPV of −$5,000 on its own. If the pilot shows strong demand (probability 40%), the brand will launch a full range a year from now, with an NPV of $30,000 measured today; otherwise it will not launch the full range. What is the pilot worth today, including the option to expand?',
    answer: 7000, check: () => -5000 + 0.4 * Math.max(30000, 0) + 0.6 * 0, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: -5000, say: 'That ignores the option to expand, which the pilot buys.' },
      { value: 25000, say: 'That assumes the full range is launched for certain. It is launched only if demand is strong (40%).' },
      { value: 13000, say: 'That adds 0.4 × 30,000 without subtracting the pilot’s own −$5,000.' },
    ],
    solution: 'The pilot’s value = its own NPV + the expected value of the decision it allows: −5,000 + 0.4 × 30,000 + 0.6 × 0 = $7,000. A negative-NPV pilot can be worth doing for the option it creates, provided the firm really can expand and competitors can’t take the opportunity first.',
  },
  {
    id: 'f05-m2-9', lesson: 'project-risk', type: 'mc', kind: 'applied',
    prompt: `Lantern’s in-house roaster would replace beans bought from Kilnworth at $${ROASTER.kilnworthPerKg} a kg (a variable cost) with a roaster costing $${(ROASTERS[0].price).toLocaleString('en-US')} and a $${ROASTER.operator.toLocaleString('en-US')}-a-year operator (largely fixed costs). What does the switch do to the risk of Lantern’s profits?`,
    options: [
      'It raises operating leverage, so a fall in sales cuts profit by a larger percentage',
      'It lowers risk, because Lantern no longer depends on Kilnworth’s prices for its beans',
      'It has no effect on risk, because the roaster has a positive NPV at 11%',
      'It raises risk only if the roaster is financed with debt rather than with equity',
    ],
    answer: 0,
    feedback: {
      1: 'It removes one risk (Kilnworth’s price) but adds another: fixed costs that must be paid however much coffee Lantern sells.',
      2: 'A positive NPV says the expected value is positive; it says nothing about how variable the outcome is.',
      3: 'Financial leverage (debt) adds risk on top; operating leverage comes from the cost structure itself.',
    },
    solution: 'Swapping a variable cost for fixed costs raises operating leverage. The lesson found the roaster breaks even at about 90% of the 2,400 kg Lantern needs, so a modest fall in sales would remove its value, whereas bought beans would simply be bought in smaller quantities.',
  },
  {
    id: 'f05-m2-10', lesson: 'project-risk', type: 'num', kind: 'numerical',
    prompt: 'A fictional print works’ EBIT rose from $40,000 to $52,000 when its volume rose by 10%, with prices and unit costs unchanged. What was its degree of operating leverage?',
    answer: 3, check: () => ((52000 - 40000) / 40000 * 100) / 10, unit: '', places: 1, tol: 0.05,
    wrong: [
      { value: 30, say: 'That is the percentage change in EBIT. Divide it by the 10% change in volume.' },
      { value: 1.3, say: 'That is the ratio of the new EBIT to the old. DOL compares percentage changes: 30% ÷ 10%.' },
    ],
    solution: 'EBIT rose (52,000 − 40,000) ÷ 40,000 = 30%. DOL = 30% ÷ 10% = 3.0: each 1% change in volume moves EBIT by about 3%, in either direction.',
  },
  {
    id: 'f05-m2-11', lesson: 'project-risk', type: 'fill', kind: 'conceptual',
    prompt: 'Complete the statements about where risk belongs in a project valuation.',
    text: 'A recession that would hurt nearly every business is [[0]] risk, and belongs in [[1]]. The chance that one firm’s new product fails in its first year belongs in [[2]]. Adding a premium to the discount rate for it penalises [[3]] cash flows the most.',
    blanks: [
      { options: ['systematic', 'diversifiable', 'forecasting'], answer: 0 },
      { options: ['the expected cash flows', 'the discount rate', 'the payback period'], answer: 1 },
      { options: ['the discount rate', 'the payback period', 'the expected cash flows'], answer: 2 },
      { options: ['the earliest', 'the most distant', 'the largest'], answer: 1 },
    ],
    solution: 'Systematic risk (a recession) is the risk investors can’t diversify, so it is priced in the discount rate. A product failure specific to one firm belongs in the expected cash flows, as a probability-weighted scenario. A rate premium compounds, so it cuts distant cash flows far more than near ones.',
  },
];
