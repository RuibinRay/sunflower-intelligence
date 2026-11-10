// project-cash-flows.js — F05 · Project cash flows. Content only; exercises are in project-cash-flows.ex.js.
// Builds coldBrewFlows() and roasterFlows() line by line from COLD_BREW, ROASTER and TAX in case.js (and checks the
// build against them), with MACRS from core/corpfin.js. F03’s 2027 EBIT is quoted to show that Lantern has other profits
// to absorb Cold Brew’s first-year loss. The $5,000 head-office allocation is a fictional proposal new to this lesson.
import { COLD_BREW as C, ROASTER as RO, TAX, WORKING_RATE, coldBrewFlows, roasterFlows } from './case.js?v=30';
import { RESULTS as F03R } from '../f03/case.js?v=30';
import { npv, irr } from '../../../core/invest.js?v=30';
import { depreciation, projectCashFlows, MACRS } from '../../../core/corpfin.js?v=30';
import { widgets } from './project-cash-flows.ex.js?v=30';

const r = WORKING_RATE, T = TAX;
const af = (rate, n) => (1 - (1 + rate) ** -n) / rate;
const base = coldBrewFlows(), rows = base.rows, cbNpv = npv(r, base.fcf);
const dep5 = depreciation(C.equipment, { method: 5 });
const book5 = C.equipment - dep5.slice(0, 5).reduce((a, b) => a + b, 0);
const cbIn = (o = {}) => ({
  capex: C.equipment, years: C.years, revenue: C.cans.map((n) => n * C.netPrice), variable: C.cans.map((n) => n * C.cogs),
  fixed: C.promotion.map((p) => p + C.listing + C.brandManager + (o.over || 0)), dep: o.sl ? depreciation(C.equipment, { life: 5 }) : dep5.slice(0, 5),
  tax: T, nwcShare: o.nwcShare ?? C.nwcShare, salvage: C.salvage, upfront: C.launch, side: Array(C.years).fill(-(o.cann ?? C.cannibalised) * (1 - T)),
});
const npvOf = (o) => npv(r, projectCashFlows(cbIn(o)).fcf);
const shields = dep5.slice(0, 5).map((d) => d * T);
const pvShields = shields.reduce((s, x, t) => s + x / (1 + r) ** (t + 1), 0);
const halfDep = dep5.slice(0, 5); halfDep[4] /= 2;
const half = projectCashFlows({ ...cbIn(), dep: halfDep });
// the roaster
const perKgOwn = RO.greenPerKg / (1 - RO.weightLoss) + RO.runningPerKg;
const saving = RO.kg * (RO.kilnworthPerKg - perKgOwn);
const ro = roasterFlows(), roNpv = npv(r, ro.fcf);
const roIn = (o = {}) => ({ capex: RO.price + RO.install, years: RO.life, revenue: Array(RO.life).fill(saving), variable: Array(RO.life).fill(0),
  fixed: RO.operator + RO.maintenance + (o.space ?? RO.space), dep: o.sl ? depreciation(RO.price + RO.install, { life: RO.life }) : depreciation(RO.price + RO.install, { method: RO.macrs }).slice(0, RO.life), tax: T, salvage: RO.salvage });
const roNpvOf = (o) => npv(r, projectCashFlows(roIn(o)).fcf);
const roBook = ro.book;
const wDef = (id) => Object.fromEntries(widgets[id].inputs.map((i) => [i.id, i.value]));
const maxDiff = (a, b) => Math.max(...a.map((x, i) => Math.abs(x - b[i])));

export default {
  slug: 'project-cash-flows',
  title: 'Project cash flows',
  blurb: 'An NPV is only as good as the cash flows behind it. Learn to build a project’s free cash flows year by year: the operating cash flow and its depreciation tax shield, working capital tied up and released, capital spending and its after-tax resale, and the costs that do and do not belong, from sunk studies and allocated overheads to lost sales elsewhere in the business.',
  status: 'draft',
  objectives: [
    'Identify a project’s incremental cash flows, excluding sunk costs, allocated overheads and financing costs, and including opportunity costs and side effects on the rest of the firm.',
    'Calculate a project’s free cash flow each year from its revenue, costs, depreciation, tax, capital spending and working capital.',
    'Calculate depreciation by MACRS and straight line, the depreciation tax shield, and the after-tax value of an asset sold at a gain or a loss.',
    'Build the free cash flows of a cost-saving project and decide whether it is worth doing.',
    'Explain why interest is left out of project cash flows and why nominal cash flows must be discounted at a nominal rate.',
  ],
  prerequisites: [
    { lesson: 'f05/net-present-value', why: 'The cash flows built here are what the NPV discounts at the opportunity cost of capital.' },
    { lesson: 'f02/long-lived-assets', why: 'Depreciation methods, book value and gains or losses on disposal.' },
    { lesson: 'f03/efficiency-and-working-capital', why: 'Inventory and receivables are the working capital a growing product ties up.' },
    { lesson: 'f04/inflation-and-real-returns', why: 'Nominal and real amounts and the Fisher relation, which must be kept consistent in a forecast.' },
    { lesson: 'f00/decision-principles', why: 'Cash flow rather than profit, and why only incremental cash flows count.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Ana’s biggest proposal is Cold Brew: canned cold brew sold through natural and specialty grocers from 1 April 2028, made by a co-packer (M02 set the product, its price and its channel). She has forecasts for five April–March years: cans sold, the price, the cost of each can, promotion, the grocers’ listing fee, a part-time brand manager, display fridges for the two cafés, a launch, and the stock and unpaid invoices a grocery business carries. She also knows that some café customers who now buy iced coffee will buy a can instead. Turning all this into the six numbers an NPV needs is the job of this lesson. Every figure is fictional.' },

    { h: 'Incremental cash flows, after tax' },
    { p: 'A project’s cash flows are its <g>incremental cash flows</g>: the firm’s cash flows with the project minus its cash flows without it, after tax. Three words in that sentence do the work. <i>Cash</i>, because owners can spend cash, not profit. <i>Incremental</i>, because only what changes with the decision belongs. <i>After tax</i>, because the tax authority takes its share of any extra profit, and the opportunity cost of capital is an after-tax return.' },
    { p: 'For each year the result is the project’s <b>free cash flow</b>: the cash it frees up for the firm’s investors after paying for everything it needs. (F03 defined <g>free cash flow</g> for a whole company as operating cash flow less capital expenditure; a project’s version adds working capital and the after-tax resale of its assets.)' },
    { math: String.raw`\text{FCF}_t = \underbrace{\text{EBIT}_t (1 - T) + D_t}_{\text{operating cash flow}} - \text{CapEx}_t - \Delta\text{NWC}_t + \text{after-tax salvage}_t` },
    { p: String.raw`Here <m>\text{EBIT}_t</m> is the project’s earnings before interest and tax, <m>T</m> the tax rate (25% for Lantern), <m>D_t</m> its depreciation, <m>\text{CapEx}_t</m> its spending on long-lived assets and <m>\Delta\text{NWC}_t</m> the increase in the working capital it ties up. Depreciation is subtracted to work out the tax and then added back, because it is not a cash payment.` },

    { h: 'Cold Brew, line by line: the operating cash flow' },
    { p: 'Each can sells for $3.49 on the shelf; distributors and grocers keep 38%, so Lantern receives $3.49 × 0.62 = $2.1638 a can. Each can costs $0.74 from the co-packer, delivered. Promotion falls from $30,000 in the launch year to $15,000 a year; the listing fee is $2,000 a year and the brand manager $24,000. The display fridges cost $9,000 and are depreciated for tax over five years by MACRS.' },
    { table: {
      caption: 'Cold Brew: from sales to operating cash flow (years 1–5, April–March; Ana’s fictional forecasts)',
      head: ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Cans sold', '30,000', '45,000', '55,000', '60,000', '60,000'],
        ['Revenue ($2.1638 a can)', '64,914', '97,371', '119,009', '129,828', '129,828'],
        ['− Cost of cans ($0.74 each)', '22,200', '33,300', '40,700', '44,400', '44,400'],
        ['− Promotion, listing, brand manager', '56,000', '44,000', '41,000', '41,000', '41,000'],
        ['− Depreciation (MACRS 5-year)', '1,800', '2,880', '1,728', '1,037', '1,037'],
        ['= EBIT', '−15,086', '17,191', '35,581', '43,391', '43,391'],
        ['− Tax at 25%', '−3,771', '4,298', '8,895', '10,848', '10,848'],
        ['+ Depreciation added back', '1,800', '2,880', '1,728', '1,037', '1,037'],
        ['= Operating cash flow', '−9,514', '15,773', '28,414', '33,580', '33,580'],
      ],
      note: 'Dollars, rounded from unrounded values, so a column may not add exactly. Year 1’s tax is negative: the loss reduces the tax Lantern pays on its other profits.',
    } },
    { p: `Year 1 makes an operating loss, because the launch promotion is heavy and sales are still building. The case assumes that the loss saves tax against Lantern’s other profits (its 2027 EBIT, from F03, was $${F03R.incomeStatement.ebit.toLocaleString('en-US')}), so the project receives a tax credit of $3,771. A firm with no other profits could not use the loss at once, and the project would be worth less to it.` },

    { h: 'From operating cash flow to free cash flow' },
    { p: 'Four more items turn operating cash flow into free cash flow: the fridges, the launch, the café sales lost, and working capital.' },
    { table: {
      caption: 'Cold Brew: from operating cash flow to free cash flow (year 0 = 1 April 2028)',
      head: ['', 'Yr 0', 'Yr 1', 'Yr 2', 'Yr 3', 'Yr 4', 'Yr 5'],
      align: ['l', 'r', 'r', 'r', 'r', 'r', 'r'],
      rows: [
        ['Operating cash flow', '', '−9,514', '15,773', '28,414', '33,580', '33,580'],
        ['− Fridges bought', '−9,000', '', '', '', '', ''],
        ['− Launch, after tax', '−4,500', '', '', '', '', ''],
        ['− Café margin lost, after tax', '', '−6,000', '−6,000', '−6,000', '−6,000', '−6,000'],
        ['Working capital held', '9,737', '14,606', '17,851', '19,474', '19,474', '0'],
        ['− Increase in working capital', '−9,737', '−4,869', '−3,246', '−1,623', '0', '+19,474'],
        ['+ Fridges sold, after tax', '', '', '', '', '', '1,255'],
        ['= Free cash flow', '−23,237', '−20,383', '6,528', '20,791', '27,580', '48,309'],
      ],
      note: 'Dollars, rounded from unrounded values. Working capital is 15% of the next year’s revenue, held from year 0 and recovered in full at the end of year 5.',
    } },
    { list: [
      '<b>The launch.</b> Can design and the launch event cost $6,000 at the start. They are expensed for tax, so they save 25% of their cost in tax: their after-tax cost is $6,000 × 0.75 = $4,500.',
      '<b>The café margin lost.</b> Some café customers will buy a can instead of an iced coffee. Ana estimates $8,000 a year of café margin lost, before tax, which is $6,000 after tax. This <g>cannibalisation</g> is a real effect of the project on the rest of Lantern, so it belongs in the project’s cash flows.',
      '<b>Working capital.</b> Lantern must hold stock at the co-packer and wait about 60 days for grocers to pay. Ana estimates the <g>working capital</g> needed at 15% of the coming year’s revenue, so it must be in place a year ahead: $9,737 at the start, rising to $19,474. Each increase is a cash outflow; at the end the stock is sold and the invoices collected, so all of it comes back.',
      '<b>The fridges at the end.</b> They are expected to fetch $1,500 after five years. The tax on that sale is the subject of the next section.',
    ] },
    { p: 'Discounted at Ana’s working rate of 11%, these free cash flows give Cold Brew an NPV of <b>+$25,737</b>, the figure the previous lesson took as given.' },
  ],

  theory: [
    { h: 'Depreciation, MACRS and the tax shield' },
    { p: String.raw`Depreciation is not a cash flow, but it reduces taxable profit and so reduces tax, which is. The tax saved each year is the <g>depreciation tax shield</g>, <m>T \times D_t</m>. Rearranging the operating cash flow shows it directly: <m>\text{OCF} = (\text{Revenue} - \text{Cash costs})(1 - T) + T \times D</m>. The first term is what the operations earn after tax; the second is the shield. For Cold Brew’s fridges the shields are $450, $720, $432, $259 and $259, worth about $1,630 today at 11%.` },
    { p: 'How fast an asset is depreciated for tax is set by tax law, not by how fast it wears out. In the United States most business equipment is depreciated under <g>MACRS</g>, the Modified Accelerated Cost Recovery System, which assigns each kind of asset a recovery class and publishes the percentage of its cost to deduct each year (IRS Publication 946, Table A-1). Under the <g>half-year convention</g> an asset is treated as placed in service in the middle of its first tax year, so a 5-year asset is deducted over six tax years: 20%, 32%, 19.2%, 11.52%, 11.52% and 5.76%. The case treats the fridges as 5-year property and the roaster as 7-year property.' },
    { p: 'MACRS front-loads the deductions compared with straight-line depreciation, so the tax savings come sooner and are worth more in present value. The total deducted is the same; only the timing differs. For Cold Brew the difference is small: straight-line depreciation over five years would lower the NPV by about $44. For the $48,000 roaster it is about $356. Tax rules also allow larger first-year deductions in many cases: IRS Publication 946 for 2025 returns describes a 100% special depreciation allowance for qualified property acquired and placed in service after 19 January 2025, and section 179 expensing up to a limit. These rules change often; the case uses MACRS without them, and a real appraisal should check the rules in force for the year the asset is bought.' },

    { h: 'Selling the asset: after-tax salvage' },
    { p: String.raw`When an asset is sold, the tax on the sale depends on its <g>book value</g> for tax: its cost less the depreciation already deducted. If it sells for more than book value, the gain is taxed; if for less, the loss saves tax. Either way the cash the project receives is the <g>after-tax salvage value</g>:` },
    { math: String.raw`\text{After-tax salvage} = S - T\,(S - B)` },
    { p: String.raw`where <m>S</m> is the sale price and <m>B</m> the tax book value at the sale. Five years of MACRS deductions leave the fridges with a book value of $518 (the 5.76% never claimed). Selling them for $1,500 gives a taxable gain of $982 and tax of $245, so the project receives <m>1{,}500 - 0.25 \times (1{,}500 - 518) \approx 1{,}255</m> dollars. Strictly, the half-year convention also applies in the year of disposal, so only half of year 5’s MACRS deduction is allowed. That lowers year 5’s depreciation and raises the book value by the same $518, and the two effects on year 5’s cash flow cancel exactly, so the case ignores the refinement.` },

    { h: 'Working capital: tied up, then released' },
    { p: 'A product sold on credit through stockists needs money tied up in stock and receivables before the cash from sales arrives. The amount needed is a level; the cash flow is the change in that level. Cold Brew’s working capital grows with sales, from $9,737 to $19,474, and each increase is an outflow in the year it happens. At the end of the project the level returns to zero and the whole amount flows back. Working capital therefore costs the project time, not money: it is lent to the project and repaid later without interest. At 11% that delay costs Cold Brew about $6,387 in present value. Leaving working capital out would overstate the NPV by that amount.' },

    { h: 'What belongs in the cash flows, and what does not' },
    { define: [
      ['Sunk costs: out', 'Lantern has already spent $9,600 on M05’s May 2027 needs study, which measured coffee drinkers’ interest in Cold Brew. That money is gone whether or not Lantern launches, so it is a <g>sunk cost</g> and is left out. Charging it to the project would cut the NPV to about $16,137 for no reason.'],
      ['Opportunity costs: in', 'If the project uses something the firm already owns that has another use, the value of that use is a cost of the project. The roaster would occupy a corner of the kitchen that could be sublet for $300 a month: $3,600 a year of rent forgone is part of the roaster’s cost even though no cash is paid.'],
      ['Side effects: in', 'Effects on the rest of the firm count, good or bad: the café margin that Cold Brew takes from iced coffee ($6,000 a year after tax), or extra sales a new product brings to existing ones.'],
      ['Allocated overheads: out, unless they change', 'Ana’s accountant suggests charging Cold Brew $5,000 a year as its share of the website and bookkeeping (a fictional proposal). If those costs are the same with or without Cold Brew, the charge is not incremental and is left out; with it, the NPV would fall by about $13,860 for no real cost. Only overheads that the project actually adds, such as an extra bookkeeping hour each month, belong.'],
      ['Financing costs: out', 'Interest and loan repayments are not project cash flows. The opportunity cost of capital already charges the project for the money it uses. Subtracting interest as well would charge for the same money twice. How a project is financed is a separate decision (module 4), and module 3 shows how the cost of borrowing enters the discount rate.'],
    ] },

    { h: 'Nominal and real: be consistent' },
    { p: 'A forecast is in <b>nominal</b> dollars if it includes the price rises expected over the years, and in <b>real</b> dollars if it is in today’s purchasing power. Either is fine, as long as nominal cash flows are discounted at a nominal rate and real cash flows at a real rate, linked by the Fisher relation from F04: (1 + nominal) = (1 + real) × (1 + inflation). Ana’s 11% is a nominal rate, so her forecasts must be nominal. Her Cold Brew price and costs are flat for five years, which in nominal terms is an assumption that prices will not rise; if she expects shelf prices and wages to rise with inflation she should build that in. In practice analysts usually work in nominal terms, because some cash flows are fixed in nominal dollars: the depreciation tax shields are set by the original cost and cannot rise with inflation, and contracts often fix prices.' },

    { h: 'A cost-saving project: the roaster' },
    { p: 'Not every project sells something new. The roaster saves money: Lantern would roast its own coffee instead of buying roasted, packed beans from Kilnworth at $36 a kilogram ($9.00 a 250 g bag). For a cost-saving project the “revenue” line is the saving, and the incremental cash flows are built the same way. Worked example 2 does it in full.' },
  ],

  formulas: [
    { id: 'pcf-fcf', name: 'Project free cash flow',
      tex: String.raw`\text{FCF}_t = \text{EBIT}_t (1 - T) + D_t - \text{CapEx}_t - \Delta\text{NWC}_t + \text{ATS}_t`,
      where: [
        [String.raw`\text{FCF}_t`, 'Free cash flow of the project in year t', '$'],
        [String.raw`\text{EBIT}_t`, 'Incremental earnings before interest and tax', '$'],
        [String.raw`T`, 'Tax rate, as a decimal', ''],
        [String.raw`D_t`, 'Depreciation for tax in year t', '$'],
        [String.raw`\text{CapEx}_t`, 'Spending on long-lived assets in year t', '$'],
        [String.raw`\Delta\text{NWC}_t`, 'Increase in net working capital in year t (negative when it is released)', '$'],
        [String.raw`\text{ATS}_t`, 'After-tax salvage value of assets sold in year t', '$'],
      ],
      assumptions: 'Incremental, after-tax cash flows; no interest; a loss saves tax against the firm’s other profits.',
      note: 'Add other after-tax side effects (lost margin elsewhere) and up-front expenses × (1 − T).' },
    { id: 'pcf-ocf-shield', name: 'Operating cash flow with the tax shield',
      tex: String.raw`\text{OCF} = (R - C)(1 - T) + T \times D`,
      where: [
        [String.raw`\text{OCF}`, 'Operating cash flow', '$'],
        [String.raw`R`, 'Incremental revenue (or cost saving)', '$'],
        [String.raw`C`, 'Incremental cash operating costs', '$'],
        [String.raw`T`, 'Tax rate, as a decimal', ''],
        [String.raw`D`, 'Depreciation for tax', '$'],
      ],
      note: 'Equal to EBIT × (1 − T) + D. T × D is the depreciation tax shield.' },
    { id: 'pcf-macrs', name: 'MACRS depreciation',
      tex: String.raw`D_t = \text{Cost} \times m_t`,
      where: [
        [String.raw`D_t`, 'Depreciation deducted in tax year t', '$'],
        [String.raw`\text{Cost}`, 'Depreciable basis: price plus installation and delivery', '$'],
        [String.raw`m_t`, 'MACRS percentage for year t of the asset’s class (IRS Publication 946, Table A-1)', ''],
      ],
      assumptions: 'Half-year convention; salvage value ignored for tax.',
      note: '5-year class: 20%, 32%, 19.2%, 11.52%, 11.52%, 5.76%.' },
    { id: 'pcf-salvage', name: 'After-tax salvage value',
      tex: String.raw`\text{ATS} = S - T\,(S - B)`,
      where: [
        [String.raw`\text{ATS}`, 'Cash received from the sale after tax', '$'],
        [String.raw`S`, 'Sale price', '$'],
        [String.raw`T`, 'Tax rate, as a decimal', ''],
        [String.raw`B`, 'Tax book value at the sale: cost minus depreciation deducted', '$'],
      ],
      note: 'A sale below book value gives a loss that saves tax, so ATS > S.' },
    { id: 'pcf-nwc', name: 'Working capital cash flow',
      tex: String.raw`\Delta\text{NWC}_t = \text{NWC}_t - \text{NWC}_{t-1}, \quad \text{NWC}_t = s \times R_{t+1}`,
      where: [
        [String.raw`\Delta\text{NWC}_t`, 'Increase in working capital in year t (a cash outflow)', '$'],
        [String.raw`\text{NWC}_t`, 'Working capital held at the end of year t', '$'],
        [String.raw`s`, 'Working capital as a share of next year’s revenue', ''],
        [String.raw`R_{t+1}`, 'Revenue in year t + 1', '$'],
      ],
      assumptions: 'NWC returns to zero at the end of the project, so all of it is recovered.' },
  ],

  examples: [
    { level: 'simple', title: 'Cold Brew’s second year', fictional: true,
      setup: 'In year 2 Cold Brew is forecast to sell 45,000 cans at $2.1638 each to Lantern, at $0.74 a can, with $18,000 of promotion, the $2,000 listing fee and the $24,000 brand manager. Depreciation is 32% of the fridges’ $9,000. Working capital is 15% of next year’s revenue (year 3: 55,000 cans), and the café loses $8,000 of margin before tax. Find year 2’s free cash flow.',
      steps: [
        'Revenue = 45,000 × 2.1638 = $97,371. Cost of cans = 45,000 × 0.74 = $33,300. Fixed costs = 18,000 + 2,000 + 24,000 = $44,000. Depreciation = 0.32 × 9,000 = $2,880.',
        'EBIT = 97,371 − 33,300 − 44,000 − 2,880 = $17,191. Tax = 25% × 17,191 ≈ $4,298. Operating cash flow = 17,191 − 4,298 + 2,880 ≈ $15,773.',
        'Working capital: at the end of year 2 it must be 15% × 119,009 ≈ $17,851 (year 3’s revenue); at the end of year 1 it was 15% × 97,371 ≈ $14,606. The increase, $3,246, is an outflow.',
        'Café margin lost after tax = 8,000 × 0.75 = $6,000. Free cash flow = 15,773 − 6,000 − 3,246 ≈ $6,528.',
      ],
      answer: 'Year 2’s free cash flow is about $6,528.',
      interpretation: 'EBIT of $17,191 turns into only $6,528 of free cash: tax takes $4,298, growing sales tie up another $3,246 of working capital, and the café loses $6,000 after tax. Profit and free cash flow differ for real reasons, and the NPV uses the cash.' },
    { level: 'challenging', title: 'Should Lantern roast its own coffee?', fictional: true,
      setup: 'Lantern uses 2,400 kg of roasted coffee a year, bought from Kilnworth at $36.00 a kg. A roaster would cost $42,000 plus $6,000 to install (7-year MACRS), last seven years and then sell for $8,000. Green beans cost $9.80 a kg and lose 16% of their weight in roasting; gas, bags and labels cost $2.80 per kg roasted. A part-time operator costs $30,000 a year and servicing $2,500. The roaster would fill a kitchen corner that could otherwise be sublet for $300 a month. Tax is 25% and the rate 11%. Find the free cash flows and the NPV.',
      steps: [
        String.raw`Saving per kg roasted: one kg of roasted coffee needs <m>1 \div 0.84</m> kg of green beans, costing <m>9.80 \div 0.84 \approx 11.67</m> dollars, plus $2.80 of running costs: $14.47 against Kilnworth’s $36.00, a saving of about $21.53 a kg. Over 2,400 kg: <m>2{,}400 \times 21.5333 = 51{,}680</m> dollars a year.`,
        'Yearly fixed costs: operator $30,000 + servicing $2,500 + the sublet rent forgone $3,600 (an opportunity cost) = $36,100. Before depreciation the roaster saves 51,680 − 36,100 = $15,580 a year.',
        'Depreciation on the $48,000 basis (installation included) by 7-year MACRS: $6,859, $11,755, $8,395, $5,995, $4,286, $4,282 and $4,286; year 1’s EBIT is 15,580 − 6,859 = $8,721, tax $2,180, operating cash flow ≈ $13,400. The other years follow the same way.',
        String.raw`Salvage: after seven years the tax book value is the unclaimed 4.46%, $2,141. After-tax salvage = <m>8{,}000 - 0.25 \times (8{,}000 - 2{,}141) \approx 6{,}535</m> dollars, added to year 7.`,
        'Free cash flows: −$48,000; then $13,400, $14,624, $13,784, $13,184, $12,757, $12,755 and $19,292 (year 7 with the salvage). NPV at 11% ≈ +$18,386; IRR ≈ 21.8%.',
      ],
      answer: 'NPV ≈ +$18,386 at 11%: on these estimates roasting in-house adds value.',
      interpretation: 'The opportunity cost matters: leaving out the sublet rent would overstate the NPV by about $12,723, to $31,109. The saving rests on the bean price, the weight loss and the operator’s cost, any of which could move. And the roaster is not the only machine on offer: module 2 compares two roasters with different lives, which NPV alone cannot rank.' },
    { level: 'applied', title: 'Arguing the Cold Brew cash flows', fictional: true,
      setup: 'Ana’s accountant reviews her Cold Brew cash flows (NPV +$25,737) and suggests four changes: charge the $9,600 needs study to the project; charge $5,000 a year of head-office overhead; deduct interest on the line of credit she might draw to pay for the fridges; and drop the café margin lost, “because the cafés aren’t part of Cold Brew”. Which should she accept?',
      steps: [
        'The needs study: spent in 2027 and unrecoverable, a sunk cost. Including it would cut the NPV to about $16,137. Reject the change.',
        'The overhead charge: the website and bookkeeping cost the same with or without Cold Brew, so the charge is not incremental. It would cut the NPV by about $13,860. Reject, unless some of it is a genuine extra cost.',
        'Interest: the 11% opportunity cost of capital already charges the project for the money tied up in it. Deducting interest as well would count the cost of the money twice. Reject.',
        'The café margin: it is a real loss of cash to Lantern caused by Cold Brew, so it must stay. Without it the NPV would be about $47,912, overstated by the present value of $6,000 a year for five years, $22,175. Keep the margin in.',
      ],
      answer: 'Accept none of the changes: the cash flows as built are the incremental ones, and the NPV stays at about +$25,737.',
      interpretation: 'Three of the suggestions would make Cold Brew look worse than it is and one would make it look much better. All four come from treating the project like a set of accounts rather than as the difference the decision makes to Lantern’s cash. The cannibalisation estimate is the least certain of Ana’s figures and has a large effect, so it is the first thing she will test in module 2’s sensitivity analysis.' },
  ],

  demo: [
    { widget: 'cold-brew-build', intro: 'Cold Brew’s free-cash-flow table. Change the volume or the working-capital share and follow the change through each line. Switch depreciation between MACRS and straight line to see the small value of earlier tax shields; set the cannibalised margin to zero to see how much it matters. The head-office charge starts at zero because it is not incremental: raise it to see what charging it would wrongly do.' },
    { widget: 'roaster-build', intro: 'The roaster as a cost-saving project. The “revenue” line is the saving against Kilnworth’s price. Change the price Kilnworth charges, the price of green beans or the volume roasted; set the sublet rent to zero to see what ignoring the opportunity cost would do to the NPV.' },
  ],

  mistakes: [
    { title: 'Charging sunk costs to the project', html: 'Money already spent, like the $9,600 needs study, is the same whatever Ana decides. Including it understates the NPV and can kill good projects (“we’ve spent too much already”) or, by the opposite logic, keep bad ones alive.' },
    { title: 'Deducting interest', html: 'Interest is a financing cost, and the discount rate already charges for the money. Deducting it from the cash flows as well counts that cost twice. Leave financing out of the cash flows; module 3 builds the cost of debt into the rate.' },
    { title: 'Forgetting working capital, or forgetting to get it back', html: 'Stock and receivables tie up real cash. Leaving them out overstates Cold Brew’s NPV by about $6,387; including the build-up but not the recovery at the end understates it heavily.' },
    { title: 'Treating the sale price as the salvage cash flow', html: 'The tax book value decides the tax on a sale. The fridges sell for $1,500 but bring in about $1,255 after tax on the gain over their $518 book value. An asset sold below book value brings in more than its price, because the loss saves tax.' },
    { title: 'Ignoring effects on the rest of the firm', html: 'A new product that takes sales from existing ones is worth only its net effect. Cold Brew without its cannibalisation would look about $22,175 better than it is. Free things are not free either: space or equipment the project uses has an opportunity cost if it has another use.' },
    { title: 'Mixing nominal and real', html: 'Discounting real (today’s-dollar) forecasts at a nominal rate understates the NPV; discounting nominal forecasts at a real rate overstates it. Match the rate to the cash flows.' },
  ],

  application: [
    { p: 'Building project cash flows is where most of an analyst’s time goes, and where most errors live. In a typical firm the marketing team forecasts volumes and prices, operations forecasts costs and capital spending, and finance assembles them into a free-cash-flow model, adds tax and working capital, and checks that every line is incremental. The model is usually a spreadsheet with one column per year, like Lantern’s, and its weakest inputs are flagged for the sensitivity analysis that follows.' },
    { p: '<b>A fictional regional bakery chain</b> launching a frozen range in supermarkets learned the working-capital lesson the hard way. Its first appraisal treated the supermarkets’ 60-day payment terms and the freezer stock as accounting details and left them out. The range was profitable on paper but needed far more cash than planned in its first two years, and the reworked model, with working capital built up and recovered, showed a much thinner NPV.' },
    { p: '<b>A fictional solar-panel installer</b> deciding whether to install its own warehouse racking or keep renting space compares the two options on incremental after-tax cash flows: the racking’s cost and its depreciation tax shield against the rent saved, with the resale value of the racking after tax. It leaves out its head-office costs, which do not change, and the interest on the loan that would pay for the racking, which its discount rate already reflects.' },
    { case: 'Ana keeps the Cold Brew cash flows as built and records why each disputed item is in or out, so that her accountant and, later, any lender can follow the logic. Both of her big proposals have positive NPVs on her working rate: Cold Brew about +$25,737 and the roaster about +$18,386. Together with the kiosks and the cargo bike, they need far more than the $40,000 she can spend in April without new financing, and the roaster comes in two versions with different lives. Choosing among projects under those limits, and testing how far the forecasts can be trusted, is the work of module 2.' },
  ],

  summary: [
    'Project cash flows are incremental, after-tax cash flows: the firm with the project minus the firm without it.',
    'FCF = EBIT(1 − T) + depreciation − capital spending − increase in working capital + after-tax salvage, plus after-tax side effects.',
    'Depreciation saves tax (T × D); MACRS front-loads the deductions, which makes them worth a little more than straight line. Tax rules on bonus depreciation change: check them.',
    'After-tax salvage = S − T(S − B), where B is the tax book value: a gain is taxed, a loss saves tax.',
    'Working capital is an outflow as it builds up and an inflow when it is released; its cost is the time value of the money tied up.',
    'Leave out sunk costs, unchanged allocated overheads and interest; include opportunity costs and side effects such as cannibalisation.',
    'Discount nominal cash flows at a nominal rate and real cash flows at a real rate.',
    'Cold Brew: NPV ≈ +$25,737 at 11%; the roaster, a cost-saving project, ≈ +$18,386.',
  ],

  glossary: [
    { term: 'Depreciation tax shield', def: 'The tax saved because depreciation reduces taxable profit: the tax rate times the depreciation deducted.' },
    { term: 'MACRS', def: 'The Modified Accelerated Cost Recovery System, the main US tax depreciation system, which sets a recovery period and yearly percentages of cost for each class of business property (IRS Publication 946).' },
    { term: 'Half-year convention', def: 'A tax depreciation rule that treats property placed in service or disposed of during a tax year as placed in service or disposed of at the midpoint of that year.' },
    { term: 'After-tax salvage value', def: 'The cash a firm keeps from selling a project’s asset: the sale price minus the tax on any gain over the asset’s tax book value, or plus the tax saved on a loss.' },
    { term: 'Cannibalisation', def: 'Sales a new offer takes from the same company’s existing offers, rather than from rivals or from people who would otherwise have bought nothing.' },
    { term: 'Allocated overhead', def: 'A share of a firm’s existing shared costs, such as rent or administration, charged to a project by an accounting rule. It belongs in project cash flows only to the extent that the project changes those costs.' },
  ],

  references: [
    { text: 'Internal Revenue Service. <i>Publication 946 (2025), How To Depreciate Property</i> (MACRS, the half-year convention, Table A-1, the special depreciation allowance).', url: 'https://www.irs.gov/publications/p946', checked: '2026-11-05' },
    { text: 'Damodaran, A. (2024). <i>Corporate Finance</i>, spring 2024, session 13 slides (project cash flows: the working-capital effect, sunk costs, allocated costs, salvage value). NYU Stern.', url: 'https://pages.stern.nyu.edu/~adamodar/podcasts/cfspr24/session13slides.pdf', checked: '2026-11-06' },
  ],

  checks: [
    // inputs
    { what: 'Shelf price', value: C.shelfPrice, shown: 3.49 },
    { what: 'Trade keeps (%)', value: C.tradeMargin * 100, shown: 38 },
    { what: 'Net price', value: C.netPrice, shown: 2.1638, tol: 0.00005 },
    { what: 'Share kept (0.62)', value: 1 - C.tradeMargin, shown: 0.62 },
    { what: 'Cost a can', value: C.cogs, shown: 0.74 },
    { what: 'Promotion year 1', value: C.promotion[0], shown: 30000 },
    { what: 'Promotion later', value: C.promotion[4], shown: 15000 },
    { what: 'Promotion year 2', value: C.promotion[1], shown: 18000 },
    { what: 'Listing fee', value: C.listing, shown: 2000 },
    { what: 'Brand manager', value: C.brandManager, shown: 24000 },
    { what: 'Fridges', value: C.equipment, shown: 9000 },
    { what: 'Launch', value: C.launch, shown: 6000 },
    { what: 'Launch after tax', value: C.launch * (1 - T), shown: 4500 },
    { what: 'Cannibalised margin before tax', value: C.cannibalised, shown: 8000 },
    { what: 'Cannibalised after tax', value: C.cannibalised * (1 - T), shown: 6000 },
    { what: 'NWC share (%)', value: C.nwcShare * 100, shown: 15 },
    { what: 'Salvage price', value: C.salvage, shown: 1500 },
    { what: 'Sunk study', value: C.sunk.research, shown: 9600 },
    { what: 'F03 2027 EBIT', value: F03R.incomeStatement.ebit, shown: 32787 },
    // table 1
    ...C.cans.map((n, i) => ({ what: `Cans year ${i + 1}`, value: rows[i + 1].revenue / C.netPrice, shown: n, tol: 1e-6 })),
    ...rows.slice(1).map((x, i) => ({ what: `Revenue y${i + 1}`, value: x.revenue, shown: [64914, 97371, 119009, 129828, 129828][i], tol: 0.5 })),
    ...rows.slice(1).map((x, i) => ({ what: `COGS y${i + 1}`, value: x.variable, shown: [22200, 33300, 40700, 44400, 44400][i], tol: 0.5 })),
    ...rows.slice(1).map((x, i) => ({ what: `Fixed y${i + 1}`, value: x.fixed, shown: [56000, 44000, 41000, 41000, 41000][i], tol: 0.5 })),
    ...rows.slice(1).map((x, i) => ({ what: `Dep y${i + 1}`, value: x.depreciation, shown: [1800, 2880, 1728, 1037, 1037][i], tol: 0.5 })),
    ...rows.slice(1).map((x, i) => ({ what: `EBIT y${i + 1}`, value: x.ebit, shown: [-15086, 17191, 35581, 43391, 43391][i], tol: 0.5 })),
    ...rows.slice(1).map((x, i) => ({ what: `Tax y${i + 1}`, value: x.taxes, shown: [-3771, 4298, 8895, 10848, 10848][i], tol: 0.5 })),
    ...rows.slice(1).map((x, i) => ({ what: `OCF y${i + 1}`, value: x.ocf, shown: [-9514, 15773, 28414, 33580, 33580][i], tol: 0.5 })),
    { what: 'Year-1 tax credit', value: -rows[1].taxes, shown: 3771, tol: 0.5 },
    // table 2
    ...rows.map((x, t) => ({ what: `NWC held y${t}`, value: x.nwc, shown: [9737, 14606, 17851, 19474, 19474, 0][t], tol: 0.5 })),
    ...rows.map((x, t) => ({ what: `ΔNWC y${t}`, value: -x.dNwc, shown: [-9737, -4869, -3246, -1623, 0, 19474][t], tol: 0.5 })),
    ...rows.map((x, t) => ({ what: `FCF y${t}`, value: x.fcf, shown: [-23237, -20383, 6528, 20791, 27580, 48309][t], tol: 0.5 })),
    { what: 'After-tax salvage', value: rows[5].salvage, shown: 1255, tol: 0.5 },
    { what: 'Cold Brew NPV', value: cbNpv, shown: 25737, tol: 0.5 },
    { what: 'Build matches case (cbIn vs coldBrewFlows)', value: maxDiff(projectCashFlows(cbIn()).fcf, base.fcf), shown: 0, tol: 1e-6 },
    { what: 'Widget cold-brew-build at defaults matches case', value: maxDiff(projectCashFlows(widgets['cold-brew-build'].model(wDef('cold-brew-build'))).fcf, base.fcf), shown: 0, tol: 1e-6 },
    { what: 'Widget roaster-build at defaults matches case', value: maxDiff(projectCashFlows(widgets['roaster-build'].model(wDef('roaster-build'))).fcf, ro.fcf), shown: 0, tol: 1e-6 },
    { what: 'Example: year-2 fixed', value: 18000 + 2000 + 24000, shown: 44000 },
    { what: 'Example: year-2 dep', value: 0.32 * 9000, shown: 2880 },
    { what: 'Example: year-1 NWC', value: 0.15 * C.cans[1] * C.netPrice, shown: 14606, tol: 0.5 },
    { what: 'Example: year-2 NWC', value: 0.15 * C.cans[2] * C.netPrice, shown: 17851, tol: 0.5 },
    { what: 'Example: ΔNWC y2', value: rows[2].dNwc, shown: 3246, tol: 0.5 },
    { what: 'Example: OCF − margin − ΔNWC', value: rows[2].ocf - 6000 - rows[2].dNwc, shown: 6528, tol: 0.5 },
    // MACRS and shields
    { what: 'MACRS 5-yr year 1 (%)', value: MACRS[5][0], shown: 20 },
    { what: 'MACRS 5-yr year 2 (%)', value: MACRS[5][1], shown: 32 },
    { what: 'MACRS 5-yr year 3 (%)', value: MACRS[5][2], shown: 19.2 },
    { what: 'MACRS 5-yr year 4 (%)', value: MACRS[5][3], shown: 11.52 },
    { what: 'MACRS 5-yr year 6 (%)', value: MACRS[5][5], shown: 5.76 },
    { what: 'MACRS 5-yr sums to 100', value: MACRS[5].reduce((a, b) => a + b, 0), shown: 100, tol: 1e-9 },
    ...shields.map((x, i) => ({ what: `Shield y${i + 1}`, value: x, shown: [450, 720, 432, 259, 259][i], tol: 0.5 })),
    { what: 'PV of shields', value: pvShields, shown: 1630, tol: 0.5 },
    { what: 'Fridge book value', value: book5, shown: 518, tol: 0.5 },
    { what: 'Fridge book value by MACRS 5.76%', value: C.equipment * MACRS[5][5] / 100, shown: 518, tol: 0.5 },
    { what: 'Gain on fridges', value: C.salvage - book5, shown: 982, tol: 0.5 },
    { what: 'Tax on gain', value: T * (C.salvage - book5), shown: 245, tol: 0.5 },
    { what: 'Half-year disposal: year-5 FCF unchanged', value: half.fcf[5] - base.fcf[5], shown: 0, tol: 1e-6 },
    { what: 'Half-year disposal: book rises by $518', value: half.book - book5, shown: 518, tol: 0.5 },
    { what: 'SL instead of MACRS: NPV falls', value: cbNpv - npvOf({ sl: true }), shown: 44, tol: 0.5 },
    { what: 'Roaster SL instead of MACRS: NPV falls', value: roNpv - roNpvOf({ sl: true }), shown: 356, tol: 0.5 },
    { what: 'MACRS worth more (claim)', value: cbNpv > npvOf({ sl: true }) && roNpv > roNpvOf({ sl: true }) ? 1 : 0, shown: 1 },
    // NWC, sunk, overhead, cannibalisation
    { what: 'NWC year 0', value: rows[0].nwc, shown: 9737, tol: 0.5 },
    { what: 'NWC peak', value: Math.max(...rows.map((x) => x.nwc)), shown: 19474, tol: 0.5 },
    { what: 'PV cost of NWC', value: -npv(r, rows.map((x) => -x.dNwc)), shown: 6387, tol: 0.5 },
    { what: 'NPV without NWC minus base', value: npvOf({ nwcShare: 0 }) - cbNpv, shown: 6387, tol: 0.5 },
    { what: 'NPV with sunk study', value: cbNpv - C.sunk.research, shown: 16137, tol: 0.5 },
    { what: 'Overhead fall', value: cbNpv - npvOf({ over: 5000 }), shown: 13860, tol: 0.5 },
    { what: 'Overhead fall by annuity', value: 5000 * (1 - T) * af(r, 5), shown: 13860, tol: 0.5 },
    { what: 'NPV without cannibalisation', value: npvOf({ cann: 0 }), shown: 47912, tol: 0.5 },
    { what: 'PV of lost margin', value: 6000 * af(r, 5), shown: 22175, tol: 0.5 },
    { what: 'Sublet a month', value: RO.space / 12, shown: 300 },
    { what: 'Sublet a year', value: RO.space, shown: 3600 },
    // roaster
    { what: 'Roaster price', value: RO.price, shown: 42000 },
    { what: 'Roaster install', value: RO.install, shown: 6000 },
    { what: 'Roaster basis', value: RO.price + RO.install, shown: 48000 },
    { what: 'Roaster kg', value: RO.kg, shown: 2400 },
    { what: 'Kilnworth per kg', value: RO.kilnworthPerKg, shown: 36 },
    { what: 'Kilnworth per bag', value: RO.kilnworthPerKg / 4, shown: 9 },
    { what: 'Green per kg', value: RO.greenPerKg, shown: 9.80 },
    { what: 'Weight loss (%)', value: RO.weightLoss * 100, shown: 16 },
    { what: 'Running per kg', value: RO.runningPerKg, shown: 2.80 },
    { what: 'Green cost per roasted kg', value: RO.greenPerKg / (1 - RO.weightLoss), shown: 11.67, tol: 0.005 },
    { what: 'Own cost per kg', value: perKgOwn, shown: 14.47, tol: 0.005 },
    { what: 'Saving per kg', value: RO.kilnworthPerKg - perKgOwn, shown: 21.53, tol: 0.005 },
    { what: 'Saving per kg (4 dp)', value: RO.kilnworthPerKg - perKgOwn, shown: 21.5333, tol: 0.00005 },
    { what: 'Saving a year', value: saving, shown: 51680, tol: 0.5 },
    { what: 'Operator', value: RO.operator, shown: 30000 },
    { what: 'Maintenance', value: RO.maintenance, shown: 2500 },
    { what: 'Roaster fixed', value: RO.operator + RO.maintenance + RO.space, shown: 36100 },
    { what: 'Roaster pre-tax saving', value: saving - (RO.operator + RO.maintenance + RO.space), shown: 15580, tol: 0.5 },
    ...ro.rows.slice(1).map((x, i) => ({ what: `Roaster dep y${i + 1}`, value: x.depreciation, shown: [6859, 11755, 8395, 5995, 4286, 4282, 4286][i], tol: 0.5 })),
    { what: 'Roaster EBIT y1', value: ro.rows[1].ebit, shown: 8721, tol: 0.5 },
    { what: 'Roaster tax y1', value: ro.rows[1].taxes, shown: 2180, tol: 0.5 },
    { what: 'Roaster OCF y1', value: ro.rows[1].ocf, shown: 13400, tol: 0.5 },
    { what: 'Roaster book after 7 years', value: roBook, shown: 2141, tol: 0.5 },
    { what: 'Roaster book = 4.46%', value: 48000 * MACRS[7][7] / 100, shown: 2141, tol: 0.5 },
    { what: 'Roaster salvage', value: RO.salvage, shown: 8000 },
    { what: 'Roaster after-tax salvage', value: ro.rows[7].salvage, shown: 6535, tol: 0.5 },
    ...ro.fcf.map((x, t) => ({ what: `Roaster FCF y${t}`, value: x, shown: [-48000, 13400, 14624, 13784, 13184, 12757, 12755, 19292][t], tol: 0.5 })),
    { what: 'Roaster NPV', value: roNpv, shown: 18386, tol: 0.5 },
    { what: 'Roaster IRR (%)', value: irr(ro.fcf) * 100, shown: 21.8, tol: 0.05 },
    { what: 'Roaster: PV of sublet forgone', value: RO.space * (1 - T) * af(r, RO.life), shown: 12723, tol: 0.5 },
    { what: 'Roaster without opportunity cost', value: roNpvOf({ space: 0 }), shown: 31109, tol: 0.5 },
    { what: 'Roaster build matches case', value: maxDiff(projectCashFlows(roIn()).fcf, ro.fcf), shown: 0, tol: 1e-6 },
  ],
};
