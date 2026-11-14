// project-cash-flows.ex.js — F05 · Project cash flows: widgets, practice and the knowledge check (answer keys live here).
// Every number is recomputed by `check` (see ../AUTHORING.md). The two capbudget widgets rebuild coldBrewFlows() and
// roasterFlows() from COLD_BREW, ROASTER and TAX in case.js (project-cash-flows.js checks that they agree at the
// defaults); every other business here is fictional.
import { COLD_BREW as C, ROASTER as RO, TAX, WORKING_RATE } from './case.js?v=31';
import { depreciation, MACRS } from '../../../core/corpfin.js?v=31';

const R = WORKING_RATE * 100;
const af = (r, n) => (1 - (1 + r) ** -n) / r;
const M = '$#,##0';
const methodInput = { id: 'method', label: 'Depreciation method: 0 = straight line, 1 = MACRS', min: 0, max: 1, step: 1, value: 1, fmt: 'int' };

export const widgets = {
  'cold-brew-build': {
    type: 'capbudget',
    title: 'Cold Brew’s free cash flows, line by line',
    inputs: [
      { id: 'rate', label: 'Discount rate', min: 0, max: 30, step: 0.5, value: R, fmt: 'pct' },
      { id: 'volume', label: 'Cans sold, as a share of Ana’s forecast', min: 50, max: 150, step: 5, value: 100, fmt: 'pct' },
      { id: 'nwc', label: 'Working capital, as a share of next year’s revenue', min: 0, max: 30, step: 1, value: C.nwcShare * 100, fmt: 'pct' },
      { id: 'cann', label: 'Café margin lost a year, before tax', min: 0, max: 20000, step: 500, value: C.cannibalised, fmt: 'money' },
      methodInput,
      { id: 'over', label: 'Head-office overhead charged a year (not incremental)', min: 0, max: 10000, step: 500, value: 0, fmt: 'money' },
    ],
    model: (v) => {
      const cans = C.cans.map((n) => n * v.volume / 100);
      return {
        capex: C.equipment, years: C.years, revenue: cans.map((n) => n * C.netPrice), variable: cans.map((n) => n * C.cogs),
        fixed: C.promotion.map((p) => p + C.listing + C.brandManager + v.over),
        dep: v.method === 1 ? depreciation(C.equipment, { method: 5 }).slice(0, C.years) : depreciation(C.equipment, { life: C.years }),
        tax: TAX, nwcShare: v.nwc / 100, salvage: C.salvage, upfront: C.launch, side: Array(C.years).fill(-v.cann * (1 - TAX)),
      };
    },
    rate: 'rate',
    show: ['table', 'metrics'],
    note: 'Fixed costs are promotion, the $2,000 listing fee and the $24,000 brand manager (plus any overhead charged). “Up-front costs after tax” is the $6,000 launch × 0.75; “Effects on other cash flows” is the café margin lost × 0.75. The $9,600 needs study is sunk and never enters.',
  },
  'roaster-build': {
    type: 'capbudget',
    title: 'The roaster: a cost-saving project',
    inputs: [
      { id: 'rate', label: 'Discount rate', min: 0, max: 30, step: 0.5, value: R, fmt: 'pct' },
      { id: 'kg', label: 'Roasted coffee a year', min: 1200, max: 3600, step: 100, value: RO.kg, fmt: 'int', unit: 'kg' },
      { id: 'kiln', label: 'Kilnworth’s price per kg roasted', min: 28, max: 44, step: 0.5, value: RO.kilnworthPerKg, fmt: 'money' },
      { id: 'green', label: 'Green beans per kg', min: 6, max: 14, step: 0.1, value: RO.greenPerKg, fmt: 'money' },
      { id: 'space', label: 'Sublet rent forgone a year (opportunity cost)', min: 0, max: 6000, step: 300, value: RO.space, fmt: 'money' },
      methodInput,
    ],
    model: (v) => {
      const save = v.kg * (v.kiln - v.green / (1 - RO.weightLoss) - RO.runningPerKg), basis = RO.price + RO.install;
      return {
        capex: basis, years: RO.life, revenue: Array(RO.life).fill(save), variable: Array(RO.life).fill(0),
        fixed: RO.operator + RO.maintenance + v.space,
        dep: v.method === 1 ? depreciation(basis, { method: RO.macrs }).slice(0, RO.life) : depreciation(basis, { life: RO.life }),
        tax: TAX, salvage: RO.salvage,
      };
    },
    rate: 'rate',
    show: ['table', 'metrics'],
    note: 'The “revenue” line is the saving against buying from Kilnworth: kg × (Kilnworth’s price − green beans ÷ 0.84 − $2.80 running costs). Fixed costs are the operator ($30,000), servicing ($2,500) and the sublet rent forgone.',
  },
};

export const guided = [
  {
    id: 'f05-pcf-g1', type: 'steps', kind: 'numerical',
    prompt: 'A fictional juice bar’s new site, in its second year: revenue $120,000; ingredients and cups 40% of revenue; fixed cash costs $35,000; depreciation $8,000; tax 25%. Working capital is 10% of the next year’s revenue, and revenue is $130,000 in year 3. Find year 2’s free cash flow (no capital spending that year).',
    solution: 'EBIT = 120,000 − 48,000 − 35,000 − 8,000 = $29,000. Tax = $7,250. OCF = 29,000 − 7,250 + 8,000 = $29,750. Working capital rises from 10% × 120,000 = $12,000 (end of year 1) to 10% × 130,000 = $13,000 (end of year 2): an outflow of $1,000. FCF = 29,750 − 1,000 = $28,750.',
    steps: [
      { id: 'f05-pcf-g1-s1', type: 'num', prompt: 'What is year 2’s EBIT?',
        answer: 29000, check: () => 120000 - 0.4 * 120000 - 35000 - 8000, unit: '$', places: 0, tol: 0.5,
        hints: ['Revenue minus variable costs (40% of revenue) minus fixed costs minus depreciation.'],
        wrong: [{ value: 37000, say: 'Depreciation is a cost for tax purposes: subtract it to get EBIT, then add it back after tax.' }] },
      { id: 'f05-pcf-g1-s2', type: 'num', prompt: 'What is year 2’s operating cash flow?',
        answer: 29750, check: () => 29000 * 0.75 + 8000, unit: '$', places: 0, tol: 0.5,
        hints: ['OCF = EBIT − tax + depreciation.', '29,000 × 0.75 + 8,000.'],
        wrong: [{ value: 21750, say: 'That is EBIT after tax. Depreciation is not paid in cash, so add it back.' }, { value: 27750, say: 'That taxes EBIT before depreciation. Tax is charged on EBIT (after depreciation): 25% × 29,000.' }] },
      { id: 'f05-pcf-g1-s3', type: 'num', prompt: 'What is year 2’s free cash flow?',
        answer: 28750, check: () => 29750 - (0.1 * 130000 - 0.1 * 120000), unit: '$', places: 0, tol: 0.5,
        hints: ['Working capital at the end of each year is 10% of the next year’s revenue.', 'It rises from $12,000 to $13,000.'],
        wrong: [{ value: 16750, say: 'That subtracts the whole $13,000 of working capital. Only the increase in year 2 is a cash flow.' }, { value: 30750, say: 'An increase in working capital uses cash: subtract it.' }] },
    ],
  },
  {
    id: 'f05-pcf-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Which of these belong in Cold Brew’s incremental cash flows?',
    items: [
      'The $9,600 Lantern paid for M05’s May 2027 needs study, which measured coffee drinkers’ interest in Cold Brew',
      'The iced-coffee margin the cafés lose when customers buy a can instead',
      'A $5,000 share of the website and bookkeeping costs, which are unchanged by Cold Brew',
      'Interest on the line of credit if Lantern draws on it to buy the fridges',
      'Stock held at the co-packer and grocers’ unpaid invoices',
      'The part-time brand manager hired for Cold Brew',
    ],
    categories: ['Include', 'Leave out'],
    answer: [1, 0, 1, 1, 0, 0],
    hints: ['Ask of each item: would Lantern’s cash be different if it did not launch Cold Brew?', 'Financing is handled by the discount rate, not the cash flows.'],
    feedback: {
      0: 'The study is paid for whatever Ana decides now: a sunk cost.',
      1: 'Lost margin elsewhere in Lantern is a real effect of the project: cannibalisation.',
      2: 'An allocation of costs that do not change is not incremental.',
      3: 'Interest is a financing cost; the opportunity cost of capital already charges for the money.',
      4: 'Working capital ties up cash while the project runs and is recovered at the end.',
      5: 'An extra salary paid only because of Cold Brew is incremental.',
    },
    solution: 'Include the cannibalised margin, the working capital and the brand manager; leave out the sunk study, the unchanged overhead and the interest.',
  },
  {
    id: 'f05-pcf-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional print studio bought a $50,000 press, depreciated as 7-year MACRS property (14.29%, 24.49% and 17.49% in years 1 to 3). It sells the press at the end of year 3 for $25,000. Tax is 25%. (Ignore the half-year rule in the year of sale, as the lesson does.)',
    solution: 'Depreciation deducted = 50,000 × (14.29% + 24.49% + 17.49%) = $28,135, so book value = $21,865. Gain = 25,000 − 21,865 = $3,135; tax = 25% × 3,135 = $783.75. After-tax salvage = 25,000 − 783.75 = $24,216.25.',
    steps: [
      { id: 'f05-pcf-g3-s1', type: 'num', prompt: 'What is the press’s tax book value at the end of year 3?',
        answer: 21865, check: () => 50000 * (1 - (MACRS[7][0] + MACRS[7][1] + MACRS[7][2]) / 100), unit: '$', places: 0, tol: 0.5,
        hints: ['Book value = cost − depreciation deducted so far.', '50,000 × (1 − 0.1429 − 0.2449 − 0.1749).'],
        wrong: [{ value: 28135, say: 'That is the depreciation deducted. Book value is what remains: 50,000 − 28,135.' }] },
      { id: 'f05-pcf-g3-s2', type: 'num', prompt: 'What tax is due on the sale? Give dollars and cents.',
        answer: 783.75, check: () => 0.25 * (25000 - 21865), unit: '$', places: 2, tol: 0.01,
        hints: ['Tax applies to the gain over book value, not to the whole price.'],
        wrong: [{ value: 6250, say: 'That taxes the whole sale price. Only the gain over book value ($3,135) is taxed.' }] },
      { id: 'f05-pcf-g3-s3', type: 'num', prompt: 'What is the after-tax salvage value? Give dollars and cents.',
        answer: 24216.25, check: () => 25000 - 0.25 * (25000 - 21865), unit: '$', places: 2, tol: 0.01,
        hints: ['After-tax salvage = S − T(S − B).'],
        wrong: [{ value: 25783.75, say: 'The tax on a gain is paid, so subtract it from the price.' }] },
    ],
  },
  {
    id: 'f05-pcf-g4', type: 'formula', kind: 'applied',
    prompt: 'A fictional project model has EBIT in row 3, depreciation in row 4, capital spending in row 5 and the increase in working capital in row 6, for years 0 to 4 in columns C to G. The tax rate is in B1. In C8, write the free-cash-flow formula for year 0 so that it can be filled right to G8.',
    sheet: {
      cells: {
        A1: 'Tax rate', B1: TAX, A2: 'Year', C2: 0, D2: 1, E2: 2, F2: 3, G2: 4,
        A3: 'EBIT', C3: 0, D3: 12000, E3: 15000, F3: 15000, G3: 9000,
        A4: 'Depreciation', C4: 0, D4: 4000, E4: 6400, F4: 3840, G4: 2304,
        A5: 'Capital spending', C5: 20000, D5: 0, E5: 0, F5: 0, G5: 0,
        A6: 'Increase in working capital', C6: 3000, D6: 500, E6: 500, F6: 0, G6: -4000,
        A8: 'Free cash flow',
      },
      fixed: ['C2:G2'],
    },
    cell: 'C8', fill: 'C8:G8', view: 'A1:G8', widths: { A: 26, B: 8 }, formats: { B1: '0%', C3: M, D3: M, E3: M, F3: M, G3: M, C4: M, D4: M, E4: M, F4: M, G4: M, C5: M, D5: M, E5: M, F5: M, G5: M, C6: M, D6: M, E6: M, F6: M, G6: M, C8: M, D8: M, E8: M, F8: M, G8: M },
    answer: '=C3*(1-$B$1)+C4-C5-C6',
    alt: ['=(1-$B$1)*C3+C4-C5-C6', '=C3-C3*$B$1+C4-C5-C6', '=C3*(1-$B$1)+C4-(C5+C6)'],
    wrong: [
      { formula: '=C3*(1-B1)+C4-C5-C6', say: 'Filled right, B1 becomes C1, D1… which are empty, so later years are taxed at 0%. Anchor the tax rate: $B$1.' },
      { formula: '=C3*(1-$B$1)-C4-C5-C6', say: 'Depreciation has already reduced EBIT; it is not a cash payment, so add it back.' },
      { formula: '=C3*(1-$B$1)+C4-C5+C6', say: 'An increase in working capital uses cash, so subtract it (and the negative increase in year 4, a release, then adds cash).' },
    ],
    hints: ['FCF = EBIT × (1 − tax rate) + depreciation − capital spending − increase in working capital.', 'The tax rate must stay on B1 as the formula moves right: $B$1.'],
    solution: '<x>=C3*(1-$B$1)+C4-C5-C6</x>. Year 0 gives −$23,000; year 1, 12,000 × 0.75 + 4,000 − 0 − 500 = $12,500; year 4, 9,000 × 0.75 + 2,304 + 4,000 = $13,054 as the working capital is released.',
  },
];

export const independent = [
  {
    id: 'f05-pcf-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery buys a $30,000 dough sheeter, 3-year MACRS property (33.33%, 44.45%, 14.81% and 7.41% in years 1 to 4). Tax is 25% and the discount rate 10%. What is the present value of its depreciation tax shields? Give whole dollars.',
    answer: 6242, check: () => MACRS[3].reduce((s, p, t) => s + 30000 * p / 100 * 0.25 / 1.1 ** (t + 1), 0), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 7500, say: 'That is the undiscounted total (25% × $30,000). The shields arrive over four years: discount each one.' },
      { value: 5943, say: 'That spreads the shields evenly (straight line over four years, $1,875 a year). MACRS front-loads them, which is worth more.' },
    ],
    solution: 'Shields: 0.25 × 30,000 × (0.3333, 0.4445, 0.1481, 0.0741) = $2,499.75, $3,333.75, $1,110.75, $555.75. PV at 10% = 2,272.50 + 2,755.17 + 834.52 + 379.59 ≈ $6,242.',
  },
  {
    id: 'f05-pcf-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional pop-up shop runs for three years with revenue of $100,000, $120,000 and $150,000. It must hold working capital equal to 20% of the next year’s revenue, from year 0, and recovers it all at the end of year 3. What is the working-capital cash flow in year 2? Use a minus sign for an outflow.',
    answer: -6000, check: () => -(0.2 * 150000 - 0.2 * 120000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: -30000, say: 'That is the level held at the end of year 2. The cash flow is the change from the year before: 30,000 − 24,000.' },
      { value: -4000, say: 'That is year 1’s change (24,000 − 20,000). In year 2 the level rises from $24,000 to $30,000.' },
      { value: 6000, say: 'An increase in working capital uses cash, so it is an outflow (negative).' },
    ],
    solution: 'Levels: end of year 0, 20% × 100,000 = $20,000; year 1, 20% × 120,000 = $24,000; year 2, 20% × 150,000 = $30,000; year 3, 0. Year 2’s cash flow = −(30,000 − 24,000) = −$6,000. The flows (−20,000, −4,000, −6,000, +30,000) add to zero: working capital costs only time.',
  },
  {
    id: 'f05-pcf-i3', type: 'num', kind: 'applied',
    prompt: 'Suppose the kitchen corner the roaster would occupy could be sublet for $400 a month instead of $300. By how much would the roaster’s NPV at 11% fall? Tax is 25% and the roaster runs for seven years. Give whole dollars.',
    answer: 4241, check: () => 1200 * (1 - TAX) * af(0.11, RO.life), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 5655, say: 'That uses the extra $1,200 a year before tax. Rent Lantern would have received is taxable, so the forgone amount after tax is $900 a year.' },
      { value: 8400, say: 'That adds $1,200 a year for seven years without tax or discounting.' },
    ],
    solution: 'The extra rent forgone is $100 a month, $1,200 a year, or $900 after tax. Its present value over seven years at 11% is 900 × 4.712196 ≈ $4,241, so the NPV falls from about $18,386 to about $14,145.',
  },
  {
    id: 'f05-pcf-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Ana’s accountant says the roaster’s cash flows should subtract interest, because Lantern would pay for it partly with borrowed money. Why is that wrong?',
    options: [
      'Interest is not tax-deductible, so it never affects cash',
      'It counts the cost of the money twice',
      'The roaster would be paid for in cash, so there is no interest',
      'Interest is a sunk cost once the loan is signed',
    ],
    answer: 1,
    feedback: {
      0: 'Interest is generally tax-deductible for a business. The reason it is left out is that financing costs belong in the discount rate.',
      2: 'Even if the roaster were paid for in cash, the answer would not change: the money has an opportunity cost, which the discount rate charges.',
      3: 'Future interest on a new loan is not sunk; it is a financing flow, kept out of the project’s cash flows for a different reason.',
    },
    solution: 'Project cash flows are measured before financing. The opportunity cost of capital charges the project for all the money it ties up, however it is raised; module 3 shows how the after-tax cost of debt enters that rate. Subtracting interest as well would charge twice.',
  },
  {
    id: 'f05-pcf-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional ferry company forecasts a project’s cash flows in today’s dollars (real terms): $10,000 a year for three years. Its nominal opportunity cost of capital is 10.25% and expected inflation is 5% a year. What are the cash flows worth today? Give whole dollars.',
    answer: 27232, check: () => 10000 * af(1.1025 / 1.05 - 1, 3), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 24759, say: 'That discounts real cash flows at the nominal rate, which counts inflation against them without ever adding it. Use the real rate: 1.1025 ÷ 1.05 − 1 = 5%.' },
      { value: 30000, say: 'That ignores discounting altogether.' },
    ],
    solution: 'Real rate = 1.1025 ÷ 1.05 − 1 = 5%. PV = 10,000 × annuity factor (5%, 3) = 10,000 × 2.723248 ≈ $27,232. Inflating the cash flows by 5% a year and discounting at 10.25% gives the same answer.',
  },
];

export const check = [
  {
    id: 'f05-pcf-k1', type: 'mc', kind: 'conceptual',
    prompt: 'A fictional brewery spent $50,000 last year on engineering studies for a new canning line. Its managers now argue: “We have already spent $50,000, so we must go ahead, or the money is wasted.” What is wrong with the argument?',
    options: [
      'The $50,000 should be added to the line’s cost, which makes it less attractive',
      'The $50,000 is gone whatever they decide, so it is irrelevant',
      'The $50,000 should be depreciated over the canning line’s life, like any other cost of the line',
      'Nothing: past spending is an opportunity cost of stopping',
    ],
    answer: 1,
    feedback: {
      0: 'Adding it is the opposite mistake. The money is gone either way, so it belongs on neither side.',
      2: 'How the studies are treated in the accounts does not change the cash: none of it can be recovered by deciding either way.',
      3: 'An opportunity cost is a value given up by the decision. Nothing about the $50,000 changes with the decision.',
    },
    solution: 'The studies are a sunk cost: unrecoverable whatever happens. The line should be judged only on the cash flows that depend on building it. Continuing a value-losing project to “justify” past spending is the sunk-cost fallacy.',
  },
  {
    id: 'f05-pcf-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional laundry’s new dryers save $20,000 a year in cash operating costs and are depreciated at $6,000 a year. Tax is 25%. What is the yearly operating cash flow?',
    answer: 16500, check: () => 20000 * 0.75 + 0.25 * 6000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 15000, say: 'That leaves out the depreciation tax shield, 25% × $6,000 = $1,500.' },
      { value: 10500, say: 'That is EBIT after tax, (20,000 − 6,000) × 0.75. Add back the $6,000 of depreciation.' },
      { value: 21500, say: 'The saving is taxed: its after-tax value is 20,000 × 0.75.' },
    ],
    solution: 'OCF = saving × (1 − T) + T × D = 20,000 × 0.75 + 0.25 × 6,000 = 15,000 + 1,500 = $16,500. Equivalently, EBIT = $14,000, tax $3,500, OCF = 14,000 − 3,500 + 6,000.',
  },
  {
    id: 'f05-pcf-k3', type: 'num', kind: 'applied',
    prompt: 'At the end of a project a fictional catering firm sells a van for $2,000. Its tax book value is $5,000 and tax is 25%. How much cash does the sale bring in after tax?',
    answer: 2750, check: () => 2000 - 0.25 * (2000 - 5000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2000, say: 'The van sells below book value, so the $3,000 loss saves tax: add 25% × 3,000.' },
      { value: 1250, say: 'A loss saves tax rather than costing it. ATS = S − T(S − B) = 2,000 + 750.' },
    ],
    solution: 'ATS = 2,000 − 0.25 × (2,000 − 5,000) = 2,000 + 750 = $2,750. The $3,000 loss on sale reduces tax on the firm’s other profits by $750.',
  },
  {
    id: 'f05-pcf-k4', type: 'mc', kind: 'applied',
    prompt: 'A fictional bookshop chain opens a branch expected to sell $400,000 a year. It estimates that $60,000 of those sales would otherwise have been made at its existing branch two streets away, and that the new branch will draw $15,000 of extra sales a year to the existing branch’s café. Which sales should the new branch’s appraisal count?',
    options: [
      '$400,000: the new branch’s own forecast sales, since those are what its tills will record',
      '$355,000: its own sales, less the $60,000 taken, plus the café’s $15,000',
      '$340,000: its own sales less the $60,000 taken from the existing branch two streets away',
      '$415,000: its own sales plus the extra café sales',
    ],
    answer: 1,
    feedback: {
      0: 'The $60,000 would have been made anyway; counting it overstates the project.',
      2: 'Side effects count in both directions: the extra café sales exist only because of the new branch.',
      3: 'The cannibalised $60,000 must come off as well.',
    },
    solution: 'Incremental sales = 400,000 − 60,000 + 15,000 = $355,000 (each then converted into cash flow with its own costs and tax). Cannibalisation and positive spillovers are both incremental effects of the decision.',
  },
  {
    id: 'f05-pcf-k5', type: 'num', kind: 'numerical',
    prompt: 'A fictional project needs $10,000 of working capital at year 0, held until it is recovered in full at the end of year 4. At 10%, what is the present value of the cost of tying up this working capital? Give whole dollars.',
    answer: 3170, check: () => 10000 - 10000 / 1.1 ** 4, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 0, say: 'The $10,000 does come back, but four years later: its present value then is less than $10,000 today.' },
      { value: 10000, say: 'The working capital is recovered at the end; its cost is the time value of the money, not the whole amount.' },
      { value: 6830, say: 'That is the present value of the recovery. The cost is $10,000 today minus that.' },
    ],
    solution: 'Cash flows: −10,000 at year 0, +10,000 at year 4. PV = −10,000 + 10,000 ÷ 1.1⁴ = −10,000 + 6,830.13 ≈ −$3,170.',
  },
  {
    id: 'f05-pcf-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Select all the items that belong in a project’s free cash flows.',
    options: [
      'The tax saved because the project’s depreciation reduces taxable profit',
      'Rent the firm gives up because the project uses space it could let',
      'Interest paid on a loan taken to fund the project',
      'The after-tax value of the project’s equipment when it is sold at the end',
      'A share of the chief executive’s salary allocated to the project',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'Interest is a financing flow; the discount rate already charges for the money.',
      4: 'The chief executive is paid the same with or without the project, so the allocation is not incremental.',
    },
    solution: 'Include the depreciation tax shield, the opportunity cost of the space and the after-tax salvage. Leave out interest (financing) and allocations of costs the project does not change.',
  },
];
