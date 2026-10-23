// long-lived-assets.js — F02 · Long-lived assets. Content only; exercises are in long-lived-assets.ex.js.
// Uses FACTS.equipment and FACTS.van, ADJUSTMENTS e3 and e4, and DERIVED from case.js. Lantern sold nothing in 2026, so the
// disposal, patent, goodwill and impairment examples use other fictional businesses; the van’s mileage, the machine’s
// revised life and the method comparison are labelled hypothetical (“suppose”).
import { FACTS, ADJUSTMENTS, DERIVED, LEDGER } from './case.js';

const eq = FACTS.equipment, van = FACTS.van;
const tx = (id) => ADJUSTMENTS.find((t) => t.id === id);
const bal = (n) => LEDGER[n]?.balance || 0;
const fmt = (n) => Math.round(n).toLocaleString('en-US');
// The van by fiscal year: straight line and double-declining balance, full month in the month of purchase.
const vanYears = [2026, 2027, 2028, 2029, 2030, 2031];
const vanMonths = [7, 12, 12, 12, 12, 5];
const slYear = vanMonths.map((m) => (van.cost - van.residual) / van.life * m / 12);
const ddb = (() => {
  let bv = van.cost; const out = [];
  vanMonths.forEach((m) => { const d = Math.min(bv * (2 / van.life) * m / 12, bv - van.residual); bv -= d; out.push([d, bv]); });
  return out;
})();
const slBV = slYear.map((_, i) => van.cost - slYear.slice(0, i + 1).reduce((s, x) => s + x, 0));
// Saltire Print Studio: printer sold on 30 September 2026
const sal = { cost: 48000, residual: 6000, life: 6, proceeds: 20500 };
const salSL = (sal.cost - sal.residual) / sal.life;                                   // 7,000
const salAccum = 3 * salSL + salSL * 9 / 12;                                          // 26,250
const salDDB = (() => { let bv = sal.cost; for (const f of [1, 1, 1, 0.75]) bv -= bv / 3 * f; return bv; })();   // 10,666.67

export default {
  slug: 'long-lived-assets',
  title: 'Long-lived assets',
  blurb: 'Equipment, vehicles, buildings and patents help a business earn revenue for years, so their cost is spread over those years. Learn what goes into an asset’s cost, how to depreciate it by three methods, what to do when estimates change or the asset is sold, how intangible assets and goodwill are treated, and where US GAAP and IFRS part company.',
  status: 'draft',
  objectives: [
    'Determine the cost of a long-lived asset by deciding which expenditures to capitalise and which to expense.',
    'Calculate depreciation by the straight-line, double-declining-balance and units-of-production methods, including part years under a stated convention.',
    'Record depreciation, a change in an accounting estimate and the disposal of an asset with a gain or loss.',
    'Calculate the amortisation of a patent, and explain how goodwill is treated by public and private companies under US GAAP and under IFRS.',
    'Compare US GAAP and IFRS on revaluation, component depreciation and impairment.',
  ],
  prerequisites: [
    { lesson: 'f01/adjusting-entries', why: 'It introduced straight-line depreciation, accumulated depreciation, book value and part-period conventions, which this lesson builds on.' },
    { lesson: 'f01/what-is-accounting', why: 'The historical cost principle and materiality decide what is capitalised.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'Lantern’s balance sheet at 31 December lists two assets that will still be working long after this year’s coffee has been drunk: the espresso machine and grinder bought on 3 March for $12,000, and the delivery van bought on 1 June for $30,000, paid with $10,000 in cash and a $20,000 note. Neither cost went straight to expense. Each is being spread over the years it helps earn revenue, $200 a month for the equipment and $400 a month for the van, so at the year end their book values are $10,000 and $27,200.' },
    { p: 'Assets that a business expects to use for more than a year are called long-lived assets. Those with a physical form, such as land, buildings, vehicles and equipment, are <g>property, plant and equipment</g>. Those without one, such as patents, software licences and trademarks, are <g>intangible assets</g>. Because their benefits last for several periods, their cost is first recorded as an asset, which is what it means to <g>capitalise</g> a cost, and then allocated to expense over the periods that benefit. For tangible assets the allocation is <g>depreciation</g>; for intangible assets it is <g>amortisation</g>. Land is the exception: it doesn’t wear out, so it is not depreciated.' },
    { p: 'Every long-lived asset passes through the same four decisions. When it is acquired, the accountant decides which costs belong in it. While it is used, a method and estimates (useful life and <g>residual value</g>) decide how much of the cost each period bears. Each year the estimates are reviewed, and the asset is checked for impairment if something suggests it can no longer earn back its book value. And when it is sold or scrapped, it leaves the books, usually with a gain or a loss.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12"><g fill="none" stroke="var(--rule-strong)" stroke-width="1.5"><rect x="8" y="30" width="136" height="150" rx="6"/><rect x="168" y="30" width="136" height="150" rx="6"/><rect x="328" y="30" width="136" height="150" rx="6"/><rect x="488" y="30" width="144" height="150" rx="6"/></g><g fill="var(--series-1)"><path d="M146 99 L162 105 L146 111 Z"/><path d="M306 99 L322 105 L306 111 Z"/><path d="M466 99 L482 105 L466 111 Z"/></g><g fill="currentColor"><text x="76" y="54" text-anchor="middle" font-weight="600">1 Acquire</text><text x="76" y="78" text-anchor="middle">Capitalise every</text><text x="76" y="94" text-anchor="middle">cost of getting</text><text x="76" y="110" text-anchor="middle">it ready for use</text><text x="76" y="142" text-anchor="middle">Van: $30,000</text><text x="236" y="54" text-anchor="middle" font-weight="600">2 Use</text><text x="236" y="78" text-anchor="middle">Depreciate or</text><text x="236" y="94" text-anchor="middle">amortise by a</text><text x="236" y="110" text-anchor="middle">chosen method</text><text x="236" y="142" text-anchor="middle">$400 a month</text><text x="396" y="54" text-anchor="middle" font-weight="600">3 Review</text><text x="396" y="78" text-anchor="middle">Update life and</text><text x="396" y="94" text-anchor="middle">residual value;</text><text x="396" y="110" text-anchor="middle">test for impairment</text><text x="396" y="142" text-anchor="middle">Going forward only</text><text x="560" y="54" text-anchor="middle" font-weight="600">4 Dispose</text><text x="560" y="78" text-anchor="middle">Remove cost and</text><text x="560" y="94" text-anchor="middle">accumulated</text><text x="560" y="110" text-anchor="middle">depreciation</text><text x="560" y="142" text-anchor="middle">Gain or loss =</text><text x="560" y="158" text-anchor="middle">proceeds − book value</text></g><g fill="currentColor" font-size="13"><text x="320" y="20" text-anchor="middle">The life of a long-lived asset</text></g></svg>',
      caption: 'Four decisions in the life of a long-lived asset, with Lantern’s van where the case gives a figure (fictional).',
      alt: 'Four boxes in a row joined by arrows. Box 1, Acquire: capitalise every cost of getting the asset ready for use; for Lantern’s van, $30,000. Box 2, Use: depreciate or amortise by a chosen method; $400 a month for the van. Box 3, Review: update the useful life and residual value and test for impairment; changes apply going forward only. Box 4, Dispose: remove the cost and accumulated depreciation; the gain or loss equals the proceeds minus the book value.',
    } },
    { p: 'These choices matter because they move profit between years without moving any cash. Lantern’s depreciation for 2026 is $4,800, about 13% of its operating income of $37,716. A longer life, a higher residual value or a slower method would raise this year’s profit and lower later years’; the cash paid for the machine and the van left the bank when they were bought, and nothing about depreciation brings it back. That is why readers of financial statements look at depreciation policies closely, and why both US GAAP and IFRS require estimates to be reasonable and reviewed.' },
    { callout: 'key', title: 'What depreciation is, and isn’t', html: 'Depreciation allocates the cost of an asset, less its expected residual value, over the periods that use it. It is not an estimate of what the asset is worth today, and it doesn’t set money aside to replace it. A van with a book value of $27,200 might sell for more or less than that.' },
  ],

  theory: [
    { h: 'What goes into the cost of an asset' },
    { p: 'Under the <g>historical cost principle</g> an asset is recorded at everything it took to acquire it and get it ready for its intended use. IAS 16 spells this out: cost is the purchase price, including import duties and non-refundable purchase taxes, after trade discounts and rebates, plus the costs directly attributable to bringing the asset to the location and condition needed for it to operate as intended, such as site preparation, delivery and handling, installation and assembly, and testing (IAS 16, paragraphs 16–17). US GAAP (ASC 360) applies the same idea. Costs that would be incurred whether or not the asset was bought do not qualify: opening a new facility, advertising a new product, training staff, and administration and general overheads are expenses (IAS 16, paragraph 19).' },
    { list: [
      '<b>Capitalise:</b> purchase price less trade discounts; non-refundable sales tax and import duties; freight and insurance in transit; installation, assembly and testing; professional fees such as an architect’s or engineer’s; for land, legal fees, title costs and the cost of clearing it.',
      '<b>Expense:</b> staff training; day-to-day servicing and repairs; repairs of damage caused in delivery or installation; advertising; general overheads; interest on money borrowed to buy a finished asset.',
    ] },
    { p: 'Land, land improvements and buildings are kept in separate accounts because they are treated differently. Land has an unlimited life and is not depreciated. Land improvements, such as a car park, fences and outdoor lighting, wear out and are depreciated. A building is depreciated over its own life. When a business buys land with an old building that it demolishes, the cost of demolition (less anything recovered from the materials) is part of the cost of the land, because it was needed to make the land ready for use.' },
    { p: 'Spending after an asset is in use follows the same test. Day-to-day servicing (oil changes, descaling the espresso machine, new tyres when they wear out) keeps the asset working as expected and is expensed (IAS 16, paragraph 12). Spending that extends the useful life, increases capacity or improves quality, such as a new engine or a second grinder head, is capitalised and depreciated over the remaining life. Many businesses set a capitalisation threshold, expensing small purchases such as a $40 kettle even though it will last for years; this applies the idea of <g>materiality</g> and is a policy, not a rule of the standards.' },
    { h: 'Three depreciation methods' },
    { p: 'Every method allocates the same total, the <g>depreciable amount</g> (cost minus residual value), over the same useful life; they differ only in timing. IAS 16 requires the depreciable amount to be allocated on a systematic basis (paragraph 50) by a method that reflects the pattern in which the asset’s benefits are consumed (paragraph 60), and names three: the straight-line method, the diminishing balance method and the units of production method (paragraph 62). It forbids methods based on the revenue an asset generates (paragraph 62A). US companies use the same three methods.' },
    { p: String.raw`The <g>straight-line method</g> of F01 charges the same amount every full year. The <g>double-declining-balance method</g>, the commonest diminishing balance method, charges twice the straight-line rate on the asset’s book value at the start of each year. For a five-year asset the straight-line rate is 20%, so the rate is 40%. Residual value is not subtracted from the base, but depreciation stops when book value reaches it. The method front-loads the expense, which suits assets that lose most of their usefulness early, such as computers. The <g>units-of-production method</g> ties depreciation to use: divide the depreciable amount by the total expected output (miles, hours, units), and charge that rate for each unit used.` },
    { table: {
      caption: 'Lantern’s van by financial year: straight line and double-declining balance, full month in the month of purchase (straight line is the case; the declining-balance column is hypothetical)',
      head: ['Year', 'Months used', 'Straight-line depreciation ($)', 'Book value ($)', 'Double-declining depreciation ($)', 'Book value ($)'],
      align: ['l', 'r', 'r', 'r', 'r', 'r'],
      rows: vanYears.map((y, i) => [String(y), String(vanMonths[i]), fmt(slYear[i]), fmt(slBV[i]), fmt(ddb[i][0]), fmt(ddb[i][1])]),
      foot: [['Total', '60', fmt(slYear.reduce((s, x) => s + x, 0)), '', fmt(ddb.reduce((s, x) => s + x[0], 0)), '']],
      note: 'Double-declining balance: 2026 is 30,000 × 40% × 7/12 = 7,000; 2027 is 23,000 × 40% = 9,200; 2028 is 13,800 × 40% = 5,520; in 2029 40% of 8,280 would be 3,312, which would take book value below the $6,000 residual value, so only 2,280 is charged.',
    } },
    { p: String.raw`The table shows the pattern. Both methods charge $24,000 in total and end at the $6,000 residual value, but double-declining balance charges $7,000 in 2026 against $2,800 for the straight line, and nothing at all in 2030 and 2031. Suppose instead that Ana expected the van to cover 120,000 miles in its life, and that it covered 16,500 miles from June to December. Units of production would charge <m>(30{,}000 - 6{,}000) \div 120{,}000 = 0.20</m> a mile, <m>16{,}500 \times 0.20 = 3{,}300</m> for 2026, and more in a busy year than in a quiet one.` },
    { callout: 'note', title: 'Part years, and tax', html: 'An asset bought during the year needs a convention for its first and last years. Lantern’s policy, from F01, charges a full month in the month of purchase, so its van bears seven months in 2026 and five in 2031. Other businesses use half a year whatever the purchase date, or count months from the middle of the month; any convention is acceptable if applied consistently. US tax returns ignore all of this: most business property must be depreciated for tax by the Modified Accelerated Cost Recovery System (MACRS) set out in IRS Publication 946, with its own recovery periods and accelerated methods. A company’s book and tax depreciation are therefore usually different.' },
    { h: 'Lantern’s depreciation for 2026' },
    { p: 'Both of Lantern’s adjustments use the straight-line method and the full-month convention. The equipment was bought in March, so it bears ten months; the van, bought in June, bears seven.' },
    { journal: { caption: 'Lantern’s depreciation adjustments at 31 December 2026 (e3 and e4, from the case)', entries: [
      { date: '2026-12-31', lines: tx('e3').lines, memo: 'e3: (12,000 − 0) ÷ 5 = 2,400 a year, 200 a month; March–December is ten months.' },
      { date: '2026-12-31', lines: tx('e4').lines, memo: 'e4: (30,000 − 6,000) ÷ 5 = 4,800 a year, 400 a month; June–December is seven months.' },
    ] } },
    { p: String.raw`After the two entries, the equipment’s book value is <m>12{,}000 - 2{,}000 = 10{,}000</m> and the van’s is <m>30{,}000 - 2{,}800 = 27{,}200</m>, so property and equipment are shown at <m>37{,}200</m>. Depreciation expense for the year is <m>2{,}000 + 2{,}800 = 4{,}800</m>, the amount added back to operating income to give EBITDA.` },
    { h: 'When an estimate changes' },
    { p: String.raw`Useful lives and residual values are estimates, and IAS 16 requires them to be reviewed at least at each financial year-end (paragraph 51). When new information changes an estimate, the change is a <g>change in accounting estimate</g>: it is applied from the period of the change onward, and earlier statements are not restated (ASC 250; IAS 8, paragraph 36). The new charge spreads the book value that remains, less the new residual value, over the remaining life. Suppose that on 1 January 2028 Ana decides to replace the espresso machine at the end of 2029 and expects to sell it then for $1,600. Its book value at 31 December 2027 is <m>12{,}000 - 2{,}000 - 2{,}400 = 7{,}600</m>, so depreciation for 2028 and 2029 becomes <m>(7{,}600 - 1{,}600) \div 2 = 3{,}000</m> a year instead of $2,400. The 2026 and 2027 figures stand: they were the best estimates at the time.` },
    { p: 'A change of depreciation method is treated the same way, prospectively. US GAAP calls it a change in estimate effected by a change in accounting principle and allows it only if the new method is preferable; IAS 16 requires the method itself to be reviewed each year (paragraph 61). A method is not something to switch to improve a year’s profit.' },
    { h: 'Disposals: gains and losses' },
    { p: 'When an asset is sold, scrapped or traded in, three steps take it off the books. First, record depreciation up to the date of disposal, so the book value is current. Second, remove the asset’s cost and its accumulated depreciation: credit the asset account, debit the contra account. Third, record what was received and the difference: proceeds above book value are a <g>gain on disposal</g>; proceeds below it, a loss. An asset scrapped for nothing produces a loss equal to its book value.' },
    { p: 'A gain on disposal is not revenue, because selling used equipment is not what the business exists to do (IAS 16 says so in paragraph 68). Under US GAAP the gain or loss belongs in income from continuing operations, and if the income statement shows an operating income subtotal, it is included in that subtotal (ASC 360-10-45-5). Many textbooks show gains and losses under other income for simplicity; Lantern’s chart has accounts for both, and the challenging example below uses them. A gain or loss is partly a correction of the depreciation charged earlier: had the estimates been perfect, the book value would have equalled the proceeds and there would have been neither.' },
    { h: 'Intangible assets' },
    { p: 'An intangible asset is recognised when it is bought, or acquired as part of a business, and can be identified separately: a patent, a copyright, a trademark, a licence, customer lists or software. A <g>patent</g> gives its owner the exclusive right to an invention; a US utility patent filed on or after 8 June 1995 runs for 20 years from the filing date. Intangibles with a finite useful life are amortised, usually by the straight-line method and with no residual value, over the shorter of their legal life and the period the business expects to benefit. Those with an indefinite life, such as a trademark the owner can renew indefinitely and intends to keep, are not amortised but are tested for impairment every year. Lantern’s chart records amortisation in a contra account, Accumulated Amortisation—Patents; some companies credit the patent account directly.' },
    { p: 'Intangibles a business creates itself are a different matter. US GAAP expenses research and development as it is incurred (ASC 730-10), so a patent developed in-house carries only its legal and registration costs. IAS 38 also expenses research but capitalises development costs once specified criteria are met. The GAAP and IFRS lesson compares the two.' },
    { journal: { caption: 'Vireo Solar (fictional) buys a patent on 1 April 2026 with 15 years of legal life left and expects to use it for six', entries: [
      { date: '2026-04-01', lines: [{ acct: 'Patents', dr: 90000 }, { acct: 'Cash', cr: 90000 }], memo: 'The price paid to the inventor, capitalised.' },
      { date: '2026-12-31', lines: [{ acct: 'Amortisation Expense', dr: 11250 }, { acct: 'Accumulated Amortisation—Patents', cr: 11250 }], memo: '90,000 ÷ 6 years = 15,000 a year; April–December is nine months: 15,000 × 9/12.' },
    ] } },
    { h: 'Goodwill' },
    { p: String.raw`<g>Goodwill</g> arises only when one business buys another. It is the amount by which the price paid exceeds the fair value of the identifiable assets acquired less the liabilities assumed, and it stands for things that can’t be recognised separately: reputation, an assembled workforce, expected savings from combining the two. Suppose Aster Hotel Group, a fictional chain, pays $2,600,000 for a guesthouse business whose identifiable assets are worth $2,450,000 and whose liabilities are $350,000. Goodwill is <m>2{,}600{,}000 - (2{,}450{,}000 - 350{,}000) = 500{,}000</m>. A business can’t record goodwill it builds for itself, however valuable its name.` },
    { p: String.raw`What happens next depends on who reports. A public company under US GAAP does not amortise goodwill; it tests it for impairment at least annually (ASC 350-20-35-28) and writes it down if it is impaired. A private company or not-for-profit may elect an accounting alternative, introduced by ASU 2014-02, that amortises goodwill on a straight-line basis over ten years, or less if another life is more appropriate, and tests it for impairment only when an event suggests it may be impaired; Aster, if private, could amortise <m>500{,}000 \div 10 = 50{,}000</m> a year. IFRS does not amortise goodwill either: IAS 36 tests it every year, and an impairment loss on goodwill is never reversed. The FASB considered requiring public companies to amortise goodwill but removed that project from its agenda in June 2022; in 2026 it added a project on the level and frequency of goodwill impairment testing, so check the current rule before relying on this paragraph.` },
    { h: 'Impairment in outline' },
    { p: 'An asset is impaired when it can no longer earn back its carrying amount, perhaps because demand has fallen, the asset is damaged or technology has moved on. The two frameworks test this differently. US GAAP (ASC 360) uses two steps when events suggest a problem: if the undiscounted future cash flows from the asset are less than its carrying amount, the asset is written down to fair value; an impairment loss is never reversed. IAS 36 uses one step: the carrying amount is compared with the recoverable amount, the higher of fair value less costs of disposal and value in use (the present value of the future cash flows). If conditions improve, an impairment loss on an asset other than goodwill is reversed, up to the carrying amount the asset would have had without it.' },
    { table: {
      caption: 'A fictional airline’s flight simulator: the same facts under the two impairment tests',
      head: ['', 'US GAAP (ASC 360)', 'IFRS (IAS 36)'],
      align: ['l', 'r', 'r'],
      rows: [
        ['Carrying amount', '500,000', '500,000'],
        ['Test', 'Undiscounted cash flows 560,000', 'Recoverable amount 440,000'],
        ['Fails the test?', 'No: 560,000 ≥ 500,000', 'Yes: 440,000 < 500,000'],
        ['Impairment loss', '0', '60,000'],
      ],
      note: 'Value in use (discounted cash flows) is 440,000; fair value less costs of disposal is 410,000 − 10,000 = 400,000; the recoverable amount is the higher. Under US GAAP the loss, had the test been failed, would have been carrying amount minus fair value.',
    } },
    { callout: 'standards', title: 'IAS 16: revaluation and component depreciation', html: 'IAS 16 lets a company choose, class by class, between the cost model (cost less accumulated depreciation and impairment, the only model US GAAP permits for property, plant and equipment) and the <g>revaluation model</g>: the asset is carried at fair value at the date of revaluation less later depreciation and impairment, revaluations are made often enough that the carrying amount stays close to fair value, and the entire class is revalued together (paragraphs 29, 31, 34 and 36). An increase goes to other comprehensive income and builds up in equity as a revaluation surplus; a decrease goes to profit or loss, except to the extent it reverses an earlier surplus (paragraphs 39–40). IAS 16 also requires <g>component depreciation</g>: each part with a cost that is significant in relation to the total is depreciated separately (paragraph 43). Aster’s $2,400,000 hotel building might be a $1,800,000 structure lasting 40 years, a $300,000 roof lasting 20 and $300,000 of lifts and air-conditioning lasting 15, giving 45,000 + 15,000 + 20,000 = $80,000 a year, against $60,000 for the whole building over 40 years. Under US GAAP component depreciation is acceptable but not required, and composite depreciation of whole groups is common in industries such as utilities and railroads.' },
  ],

  formulas: [
    { id: 'depreciable-amount', name: 'Depreciable amount',
      tex: String.raw`\text{Depreciable amount} = \text{Cost} - \text{Residual value}`,
      where: [
        [String.raw`\text{Cost}`, 'Everything paid to acquire the asset and get it ready for use', '$'],
        [String.raw`\text{Residual value}`, 'What the business expects to get for the asset at the end of its useful life', '$'],
      ],
      note: 'The total depreciation over the asset’s life under every method.' },
    { id: 'ddb', name: 'Double-declining-balance depreciation',
      tex: String.raw`D_t = \dfrac{2}{n} \times BV_{t-1}, \quad \text{but never taking } BV_t \text{ below the residual value}`,
      where: [
        [String.raw`D_t`, 'Depreciation for year t (for a part year, multiply by months used ÷ 12)', '$'],
        [String.raw`n`, 'Useful life', 'years'],
        [String.raw`BV_{t-1}`, 'Book value at the start of year t: cost minus accumulated depreciation', '$'],
        [String.raw`BV_t`, 'Book value at the end of year t', '$'],
      ],
      assumptions: 'Residual value is not deducted from the base; it is a floor.',
      note: String.raw`Lantern’s van, 2026: <m>30{,}000 \times 0.40 \times \tfrac{7}{12} = 7{,}000</m>.` },
    { id: 'units-of-production', name: 'Units-of-production depreciation',
      tex: String.raw`D = \dfrac{\text{Cost} - \text{Residual value}}{\text{Total expected units}} \times \text{Units used}`,
      where: [
        [String.raw`D`, 'Depreciation for the period', '$'],
        [String.raw`\text{Total expected units}`, 'Output expected over the asset’s life: miles, hours, units made', 'units'],
        [String.raw`\text{Units used}`, 'Output in the period', 'units'],
      ],
      note: String.raw`The van, if it ran 120,000 miles in its life: <m>0.20</m> a mile.` },
    { id: 'revised-depreciation', name: 'Depreciation after a change in estimate',
      tex: String.raw`\text{New depreciation per year} = \dfrac{BV - \text{New residual value}}{\text{Remaining useful life}}`,
      where: [
        [String.raw`BV`, 'Book value at the date of the change', '$'],
        [String.raw`\text{New residual value}`, 'Revised estimate of what the asset will fetch at the end', '$'],
        [String.raw`\text{Remaining useful life}`, 'Revised years of use left from the date of the change', 'years'],
      ],
      assumptions: 'Straight line from the date of change; earlier periods are not restated.' },
    { id: 'disposal-gain-loss', name: 'Gain or loss on disposal',
      tex: String.raw`\text{Gain (loss)} = \text{Proceeds} - BV_{\text{disposal}}`,
      where: [
        [String.raw`\text{Proceeds}`, 'Cash or the fair value of other assets received, less costs of selling', '$'],
        [String.raw`BV_{\text{disposal}}`, 'Cost minus accumulated depreciation, updated to the date of disposal', '$'],
      ],
      note: 'A negative result is a loss.' },
    { id: 'patent-amortisation', name: 'Straight-line amortisation of a finite-lived intangible',
      tex: String.raw`\text{Amortisation per year} = \dfrac{\text{Cost}}{\min(\text{Legal life left}, \ \text{Useful life})}`,
      where: [
        [String.raw`\text{Cost}`, 'Price paid for the intangible (residual value usually nil)', '$'],
        [String.raw`\text{Legal life left}`, 'Years of legal protection remaining (20 years from filing for a US utility patent)', 'years'],
        [String.raw`\text{Useful life}`, 'Years the business expects the intangible to bring benefits', 'years'],
      ] },
    { id: 'goodwill', name: 'Goodwill in an acquisition',
      tex: String.raw`\text{Goodwill} = \text{Price paid} - (\text{FV of identifiable assets} - \text{FV of liabilities assumed})`,
      where: [
        [String.raw`\text{Price paid}`, 'Consideration transferred for the business', '$'],
        [String.raw`\text{FV of identifiable assets}`, 'Fair value of the assets that can be recognised separately, including intangibles', '$'],
        [String.raw`\text{FV of liabilities assumed}`, 'Fair value of the liabilities the buyer takes on', '$'],
      ] },
  ],

  examples: [
    { level: 'simple', title: 'A bakery’s new oven', fictional: true,
      setup: 'Millrace Bakery, a fictional bakery, buys a deck oven on 1 October 2026. The invoice shows a price of $18,500 plus 7% sales tax, which the bakery can’t recover. It also pays $400 for delivery, $650 for installation, $900 for an electrician to add the circuit the oven needs, and $300 for a half-day course for its bakers. The oven should last eight years and fetch $1,745 at the end. Millrace uses straight-line depreciation with a full month in the month of purchase; its year ends on 31 December. What is the oven’s cost, and what is depreciation for 2026?',
      steps: [
        String.raw`Sales tax: <m>18{,}500 \times 0.07 = 1{,}295</m>. It is not recoverable, so it is part of the cost.`,
        String.raw`Capitalise the costs of getting the oven to its location and ready to use: <m>18{,}500 + 1{,}295 + 400 + 650 + 900 = 21{,}745</m>. The bakers’ course is training, an expense of $300.`,
        String.raw`Depreciable amount <m>21{,}745 - 1{,}745 = 20{,}000</m>; per year <m>20{,}000 \div 8 = 2{,}500</m>.`,
        String.raw`October to December is three months: <m>2{,}500 \times \tfrac{3}{12} = 625</m>. Book value at 31 December: <m>21{,}745 - 625 = 21{,}120</m>.`,
      ],
      answer: 'Cost $21,745 (training of $300 is expensed); 2026 depreciation $625; book value at 31 December $21,120.',
      interpretation: 'Putting the electrician’s $900 into the oven spreads it over eight years; expensing it would have cut 2026’s profit by $900 and overstated every later year’s. The training, by contrast, improves the bakers, not the oven.' },
    { level: 'challenging', title: 'Selling a printer, and what the method did to the gain', fictional: true,
      setup: 'Saltire Print Studio, a fictional print shop, bought a large-format printer on 1 January 2023 for $48,000, expecting to use it for six years and sell it for $6,000. It uses the straight-line method. On 30 September 2026 it sells the printer for $20,500 in cash. Record the sale, find the gain or loss, and work out what the result would have been under double-declining balance.',
      journal: { entries: [
        { date: '2026-09-30', lines: [{ acct: 'Depreciation Expense', dr: 5250 }, { acct: 'Accumulated Depreciation—Equipment', cr: 5250 }], memo: 'Bring depreciation up to the date of sale: 7,000 × 9/12.' },
        { date: '2026-09-30', lines: [{ acct: 'Cash', dr: 20500 }, { acct: 'Accumulated Depreciation—Equipment', dr: 26250 }, { acct: 'Loss on Sale of Equipment', dr: 1250 }, { acct: 'Equipment', cr: 48000 }], memo: 'Remove cost and accumulated depreciation; the shortfall of proceeds below book value is a loss.' },
      ] },
      steps: [
        String.raw`Straight line: <m>(48{,}000 - 6{,}000) \div 6 = 7{,}000</m> a year. Depreciation for January to September 2026: <m>7{,}000 \times \tfrac{9}{12} = 5{,}250</m>, recorded first.`,
        String.raw`Accumulated depreciation at the sale: <m>3 \times 7{,}000 + 5{,}250 = 26{,}250</m>. Book value <m>48{,}000 - 26{,}250 = 21{,}750</m>.`,
        String.raw`Loss: <m>20{,}500 - 21{,}750 = -1{,}250</m>. Entry: debit Cash 20,500, Accumulated Depreciation—Equipment 26,250 and Loss on Sale of Equipment 1,250; credit Equipment 48,000.`,
        String.raw`Double-declining balance at one-third a year: 2023 <m>16{,}000</m>, 2024 <m>10{,}666.67</m>, 2025 <m>7{,}111.11</m>, and nine months of 2026 <m>14{,}222.22 \times \tfrac{1}{3} \times \tfrac{9}{12} = 3{,}555.56</m>, leaving a book value of <m>10{,}666.67</m>. The same sale would show a gain of <m>20{,}500 - 10{,}666.67 = 9{,}833.33</m>.`,
        String.raw`Over the four years the total charge to profit is the same: <m>26{,}250 + 1{,}250 = 27{,}500</m> under the straight line and <m>37{,}333.33 - 9{,}833.33 = 27{,}500</m> under declining balance, both equal to <m>48{,}000 - 20{,}500</m>.`,
      ],
      answer: 'Loss on sale $1,250 under the straight-line method (book value $21,750); under double-declining balance the same sale would show a gain of $9,833.33. Either way the printer cost the business $27,500 over its life.',
      interpretation: 'A gain or loss on disposal mostly reflects how well depreciation tracked the asset’s real decline. Saltire’s straight-line estimates were close; a large gain or loss would have been a signal to revisit the lives and residual values of its other equipment.' },
    { level: 'applied', title: 'Choosing a method for Lantern’s van', fictional: true,
      setup: 'Before the year-end, Ana’s accountant asks which depreciation method suits the van. It makes deliveries five days a week all year, with no seasonal peak. Suppose its mileage log shows 16,500 miles from June to December and the dealer expects such vans to cover about 120,000 miles before they are sold for around $6,000. Compare 2026 under the three methods and recommend one.',
      steps: [
        String.raw`Straight line (case, e4): <m>400 \times 7 = 2{,}800</m>. Double-declining balance: <m>30{,}000 \times 0.40 \times \tfrac{7}{12} = 7{,}000</m>. Units of production: <m>16{,}500 \times 0.20 = 3{,}300</m>.`,
        String.raw`Effect on profit: double-declining balance would cut operating income by <m>7{,}000 - 2{,}800 = 4{,}200</m>, and net income by <m>4{,}200 \times (1 - 0.25) = 3{,}150</m> at the case’s 25% tax rate; units of production would cut it by <m>500 \times 0.75 = 375</m>.`,
        'Effect on cash: none. The van was paid for on 1 June. In a real US tax return, tax depreciation follows MACRS whatever method the books use, so the book method doesn’t change the tax actually paid either.',
        'Fit with the pattern of use, the test IAS 16 sets in paragraph 60: steady weekly use with no early burst of benefit points to the straight line or units of production, not an accelerated method.',
      ],
      answer: 'Keep the straight-line method (2026 depreciation $2,800). Units of production ($3,300) would track the van’s use slightly better but needs a reliable mileage log; double-declining balance ($7,000) would front-load a cost that the van’s steady use doesn’t justify.',
      interpretation: 'A method should describe how the asset is used up, not produce the profit the owner would like. Whichever is chosen must be applied consistently, disclosed in the notes, and revisited only if the van’s pattern of use changes.' },
  ],

  demo: [
    { widget: 'lla-methods', intro: 'The defaults are Lantern’s van: $30,000, a $6,000 residual value, five years and seven months used in the first financial year. Compare the book value under the straight-line and declining-balance methods year by year, then try a factor of 1.5 instead of 2, a zero residual value, or a full first year.' },
    { widget: 'lla-disposal', intro: 'The defaults are Saltire’s printer, sold after 45 months for $20,500. Change the sale price or the months held and watch the gain or loss: it is always proceeds minus book value at the date of sale.' },
  ],

  mistakes: [
    { title: '“Training and the first service are part of the machine’s cost.”', html: 'Only costs needed to get the asset to its location and ready to work are capitalised. Training improves the staff, and servicing keeps the machine running; both are expenses. Repairs of damage caused during installation are expenses too: they restore, they don’t create.' },
    { title: '“Double-declining balance is twice the straight-line charge every year.”', html: 'The rate is twice the straight-line <i>rate</i>, applied to the falling book value, so the charge shrinks each year. And the base is cost, not cost minus residual value; the residual value acts as a floor. Lantern’s van would have no depreciation at all in 2030 under this method.' },
    { title: '“When the life changes, correct the earlier years.”', html: 'A change in estimate is prospective: spread the remaining book value, less the new residual value, over the remaining life. Earlier years were right on the information then available and are not restated. Restating is for errors, not for new estimates.' },
    { title: '“A gain on selling equipment is revenue.”', html: 'Revenue comes from the business’s ordinary activities. A gain or loss on disposal is the difference between proceeds and book value; it is reported separately (inside operating income under US GAAP when that subtotal is shown) and never in net revenue.' },
    { title: '“Forgetting to update depreciation before the sale.”', html: 'If depreciation for the months before the sale is skipped, book value is overstated and the loss is overstated (or the gain understated) by the same amount. Saltire would report a loss of $6,500 instead of $1,250 without the $5,250 for 2026.' },
    { title: '“Goodwill is never amortised.”', html: 'That is the rule for public companies under US GAAP and for all IFRS reporters. A US private company may elect to amortise goodwill over ten years or less. Read a private company’s accounting policies before comparing its profit with a public company’s.' },
  ],

  application: [
    { p: 'Behind the two lines of property and equipment on a balance sheet sits a fixed-asset register: one record for each asset, with its cost, date in service, method, life, residual value and location, from which each month’s depreciation is calculated automatically. Accountants reconcile it to the general ledger, add new purchases with their full cost (invoices, freight, installation), and remove assets that are sold or scrapped. Each year-end they review lives and residual values, which is where most judgement lies, and auditors test those judgements by comparing them with how long similar assets have actually lasted and what they have sold for.' },
    { p: 'Outside the accounting department the same numbers drive decisions. A capital budget decides which assets to buy, using the cash flows taught in F04 and F05, not depreciation. Lenders and analysts often add depreciation and amortisation back to operating income, giving <g>EBITDA</g>, because the charges are allocations of past spending; Lantern’s 2026 EBITDA is $42,516, its operating income of $37,716 plus $4,800 of depreciation. They then look at capital spending separately, because a business that stops replacing its equipment will flatter its profit for a while and pay for it later.' },
    { p: 'For Lantern the next decision is the espresso machine. Its book value will be $7,600 at the end of 2027, a number that says nothing about whether to replace it: that depends on what a new machine costs, what the old one would fetch and how much more coffee a faster machine would let Lantern sell. If Ana does decide on an earlier replacement, the accounts will follow her decision with a revised depreciation charge, not lead it. And if she ever buys another roaster’s business, the price above the fair value of its identifiable assets will appear as goodwill, which Lantern, as a private company, could choose to amortise over ten years.' },
  ],

  summary: [
    'Capitalise every cost needed to acquire an asset and get it ready for use (price net of discounts, non-refundable taxes, delivery, installation, testing); expense training, servicing and overheads.',
    'Depreciation methods share the depreciable amount (cost − residual value) but differ in timing: straight line evenly, double-declining balance at 2 ÷ life on book value with residual value as a floor, units of production by use.',
    'Lantern’s 2026 depreciation is $4,800: equipment $2,000 (ten months) and van $2,800 (seven months); property and equipment are $37,200 net.',
    'A change in an estimate or method is prospective: (book value − new residual value) ÷ remaining life; earlier years are not restated.',
    'On disposal, update depreciation, remove cost and accumulated depreciation, and record a gain or loss equal to proceeds − book value; it is not revenue.',
    'Finite-lived intangibles such as patents are amortised over the shorter of legal and useful life; goodwill is not amortised by public companies or under IFRS, but US private companies may amortise it over ten years or less.',
    'IAS 16 allows revaluation to fair value and requires component depreciation; US GAAP permits only the cost model and doesn’t require components. US GAAP never reverses impairment losses; IAS 36 reverses them except on goodwill.',
  ],

  glossary: [
    { term: 'Property, plant and equipment', def: 'Tangible assets a business uses to produce or supply goods and services, rent to others or administer itself, and expects to use for more than one year, such as land, buildings, vehicles and equipment. Also called fixed assets.' },
    { term: 'Intangible asset', def: 'An identifiable asset without physical substance, such as a patent, copyright, trademark, licence or software.' },
    { term: 'Capitalise', def: 'To record a cost as an asset, because it will bring benefits beyond the current period, rather than as an expense of the period.' },
    { term: 'Depreciable amount', def: 'Cost minus residual value: the total depreciation to be recognised over an asset’s useful life.' },
    { term: 'Double-declining-balance method', def: 'An accelerated depreciation method that charges twice the straight-line rate on the asset’s book value at the start of each year, never taking book value below the residual value.' },
    { term: 'Units-of-production method', def: 'A depreciation method that charges depreciation in proportion to use: (cost − residual value) ÷ total expected units, times the units used in the period.' },
    { term: 'Change in accounting estimate', def: 'A revision of an estimate, such as an asset’s useful life or residual value, because of new information. It is applied from the period of the change onward, without restating earlier periods.' },
    { term: 'Gain on disposal', def: 'The amount by which the proceeds from selling a long-lived asset exceed its book value at the date of sale; a shortfall is a loss on disposal. Neither is revenue.' },
    { term: 'Patent', def: 'An exclusive legal right to make, use and sell an invention. A US utility patent runs for 20 years from the date the application was filed.' },
    { term: 'Goodwill', def: 'The amount by which the price paid for a business exceeds the fair value of its identifiable assets less its liabilities. It is recognised only when a business is acquired.' },
    { term: 'Impairment', def: 'A loss recognised when an asset’s carrying amount can no longer be recovered from its use or sale, measured under US GAAP against fair value and under IFRS against recoverable amount.' },
    { term: 'Revaluation model', def: 'An IFRS option (IAS 16) to carry a whole class of property, plant and equipment at fair value at the revaluation date, less later depreciation and impairment, with increases taken to other comprehensive income. Not permitted under US GAAP.' },
    { term: 'Component depreciation', def: 'Depreciating separately each significant part of an asset that has a different useful life, such as a building’s structure, roof and lifts. Required by IAS 16; acceptable but not required under US GAAP.' },
  ],

  references: [
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 11.2, “Analyze and Classify Capitalized Costs versus Expenses”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/11-2-analyze-and-classify-capitalized-costs-versus-expenses', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 11.3, “Explain and Apply Depreciation Methods to Allocate Capitalized Costs”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/11-3-explain-and-apply-depreciation-methods-to-allocate-capitalized-costs', checked: '2026-10-23' },
    { text: 'Australian Accounting Standards Board. <i>AASB 116 Property, Plant and Equipment</i>, “Measurement after recognition” (compiled March 2020). AASB 116 reproduces IAS 16’s requirements and paragraph numbers; the original standard states that for-profit entities complying with it comply with IAS 16.', url: 'https://standards.aasb.gov.au/node/81', checked: '2026-10-23' },
    { text: 'IFRS Foundation. <i>IAS 36 Impairment of Assets</i> and <i>IAS 38 Intangible Assets</i>, standard summary pages.', url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-36-impairment-of-assets/', checked: '2026-10-23' },
    { text: 'Deloitte. <i>A Roadmap Comparing IFRS Accounting Standards and US GAAP</i>, sections 1.6, “Property, Plant, and Equipment”, and 1.7, “Impairment of Nonfinancial Assets”. DART.', url: 'https://dart.deloitte.com/USDART/home/publications/deloitte/additional-deloitte-guidance/roadmap-ifrs-us-gaap-comparison/chapter-1-assets/1-6-property-plant-equipment', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Business Combinations</i>, section 8.2, “Accounting Alternatives for Private Companies and Not-for-Profit Entities” (the goodwill amortisation alternative of ASU 2014-02). DART.', url: 'https://dart.deloitte.com/USDART/home/codification/broad-transactions/asc805-10/roadmap-business-combinations/chapter-8-private-company-not-for/8-2-accounting-alternatives-for-private', checked: '2026-10-23' },
  ],

  checks: [
    // Lantern (case.js)
    { what: 'Equipment cost', value: eq.cost, shown: 12000 },
    { what: 'Van cost', value: van.cost, shown: 30000 },
    { what: 'Van cash down', value: van.cashDown, shown: 10000 },
    { what: 'Van note', value: van.cost - van.cashDown, shown: 20000 },
    { what: 'Van residual', value: van.residual, shown: 6000 },
    { what: 'Equipment per month', value: eq.monthly, shown: 200 },
    { what: 'Equipment per month (formula)', value: (eq.cost - eq.residual) / eq.life / 12, shown: 200 },
    { what: 'Equipment per year', value: (eq.cost - eq.residual) / eq.life, shown: 2400 },
    { what: 'Van per month', value: van.monthly, shown: 400 },
    { what: 'Van per year', value: (van.cost - van.residual) / van.life, shown: 4800 },
    { what: 'e3', value: tx('e3').lines[0].dr, shown: 2000 },
    { what: 'e3 = 200 × 10', value: eq.monthly * eq.months, shown: 2000 },
    { what: 'e4', value: tx('e4').lines[0].dr, shown: 2800 },
    { what: 'e4 = 400 × 7', value: van.monthly * van.months, shown: 2800 },
    { what: 'Equipment book value', value: eq.cost - bal('Accumulated Depreciation—Equipment'), shown: 10000 },
    { what: 'Van book value', value: van.cost - bal('Accumulated Depreciation—Van'), shown: 27200 },
    { what: 'Property and equipment, net', value: DERIVED.noncurrentAssets, shown: 37200 },
    { what: 'Depreciation for 2026', value: DERIVED.depreciation, shown: 4800 },
    { what: 'Operating income', value: DERIVED.operatingIncome, shown: 37716 },
    { what: 'Depreciation share of operating income (about 13%)', value: DERIVED.depreciation / DERIVED.operatingIncome * 100, shown: 13, tol: 0.5 },
    { what: 'EBITDA', value: DERIVED.ebitda, shown: 42516 },
    { what: 'EBITDA = operating income + depreciation', value: DERIVED.operatingIncome + DERIVED.depreciation, shown: 42516 },
    // van schedules (hypothetical DDB)
    { what: 'Van SL 2026', value: slYear[0], shown: 2800 },
    { what: 'Van SL 2031 (5 months)', value: slYear[5], shown: 2000 },
    { what: 'Van SL total', value: slYear.reduce((s, x) => s + x, 0), shown: 24000 },
    { what: 'Van SL BV 2027', value: slBV[1], shown: 22400 },
    { what: 'Van SL BV 2028', value: slBV[2], shown: 17600 },
    { what: 'Van SL BV 2029', value: slBV[3], shown: 12800 },
    { what: 'Van SL BV 2030', value: slBV[4], shown: 8000 },
    { what: 'Van SL BV 2031', value: slBV[5], shown: 6000 },
    { what: 'Van months total', value: vanMonths.reduce((s, x) => s + x, 0), shown: 60 },
    { what: 'Van DDB 2026', value: ddb[0][0], shown: 7000 },
    { what: 'Van DDB 2026 formula', value: 30000 * 0.4 * 7 / 12, shown: 7000 },
    { what: 'Van DDB BV 2026', value: ddb[0][1], shown: 23000 },
    { what: 'Van DDB 2027', value: ddb[1][0], shown: 9200 },
    { what: 'Van DDB BV 2027', value: ddb[1][1], shown: 13800 },
    { what: 'Van DDB 2028', value: ddb[2][0], shown: 5520 },
    { what: 'Van DDB BV 2028', value: ddb[2][1], shown: 8280 },
    { what: 'Van DDB uncapped 2029', value: 8280 * 0.4, shown: 3312 },
    { what: 'Van DDB 2029 (capped)', value: ddb[3][0], shown: 2280 },
    { what: 'Van DDB BV 2029', value: ddb[3][1], shown: 6000 },
    { what: 'Van DDB 2030', value: ddb[4][0], shown: 0 },
    { what: 'Van DDB total', value: ddb.reduce((s, x) => s + x[0], 0), shown: 24000 },
    { what: 'Straight-line rate (%)', value: 100 / van.life, shown: 20 },
    { what: 'DDB rate (%)', value: 200 / van.life, shown: 40 },
    { what: 'Units of production rate', value: (30000 - 6000) / 120000, shown: 0.20 },
    { what: 'Units of production 2026', value: 16500 * 0.2, shown: 3300 },
    // applied example
    { what: 'DDB − SL', value: 7000 - 2800, shown: 4200 },
    { what: 'Net income effect DDB', value: 4200 * (1 - FACTS.tax.rate), shown: 3150 },
    { what: 'UoP − SL', value: 3300 - 2800, shown: 500 },
    { what: 'Net income effect UoP', value: 500 * (1 - FACTS.tax.rate), shown: 375 },
    { what: 'Tax rate (%)', value: FACTS.tax.rate * 100, shown: 25 },
    // change in estimate (hypothetical)
    { what: 'Equipment BV end-2027', value: 12000 - 2000 - 2400, shown: 7600 },
    { what: 'Revised depreciation', value: (7600 - 1600) / 2, shown: 3000 },
    // Millrace
    { what: 'Millrace sales tax', value: 18500 * 0.07, shown: 1295 },
    { what: 'Millrace cost', value: 18500 + 1295 + 400 + 650 + 900, shown: 21745 },
    { what: 'Millrace depreciable', value: 21745 - 1745, shown: 20000 },
    { what: 'Millrace per year', value: 20000 / 8, shown: 2500 },
    { what: 'Millrace 2026', value: 2500 * 3 / 12, shown: 625 },
    { what: 'Millrace BV', value: 21745 - 625, shown: 21120 },
    // Saltire
    { what: 'Saltire per year', value: salSL, shown: 7000 },
    { what: 'Saltire 2026 depreciation', value: salSL * 9 / 12, shown: 5250 },
    { what: 'Saltire accumulated', value: salAccum, shown: 26250 },
    { what: 'Saltire BV', value: sal.cost - salAccum, shown: 21750 },
    { what: 'Saltire loss', value: sal.proceeds - (sal.cost - salAccum), shown: -1250 },
    { what: 'Saltire DDB 2023', value: 48000 / 3, shown: 16000 },
    { what: 'Saltire DDB 2024', value: (48000 - 16000) / 3, shown: 10666.67 },
    { what: 'Saltire DDB 2025', value: (48000 - 16000 - 32000 / 3) / 3, shown: 7111.11 },
    { what: 'Saltire DDB BV start 2026', value: 48000 * (2 / 3) ** 3, shown: 14222.22 },
    { what: 'Saltire DDB 2026', value: 48000 * (2 / 3) ** 3 / 3 * 0.75, shown: 3555.56 },
    { what: 'Saltire DDB BV at sale', value: salDDB, shown: 10666.67 },
    { what: 'Saltire DDB gain', value: sal.proceeds - salDDB, shown: 9833.33 },
    { what: 'Saltire DDB accumulated', value: sal.cost - salDDB, shown: 37333.33 },
    { what: 'Saltire total charge (SL)', value: salAccum + 1250, shown: 27500 },
    { what: 'Saltire total charge (DDB)', value: (sal.cost - salDDB) - (sal.proceeds - salDDB), shown: 27500 },
    { what: 'Saltire cost − proceeds', value: 48000 - 20500, shown: 27500 },
    { what: 'Saltire loss without 2026 depreciation', value: 20500 - (48000 - 21000), shown: -6500 },
    { what: 'Saltire months held', value: 3 * 12 + 9, shown: 45 },
    { what: 'Saltire loss (as printed)', value: (sal.cost - salAccum) - sal.proceeds, shown: 1250 },
    { what: 'Saltire loss without 2026 depreciation (as printed)', value: (48000 - 21000) - 20500, shown: 6500 },
    // Vireo patent
    { what: 'Vireo per year', value: 90000 / 6, shown: 15000 },
    { what: 'Vireo 2026', value: 15000 * 9 / 12, shown: 11250 },
    // Aster
    { what: 'Aster goodwill', value: 2600000 - (2450000 - 350000), shown: 500000 },
    { what: 'Aster private amortisation', value: 500000 / 10, shown: 50000 },
    { what: 'Aster structure', value: 1800000 / 40, shown: 45000 },
    { what: 'Aster roof', value: 300000 / 20, shown: 15000 },
    { what: 'Aster lifts', value: 300000 / 15, shown: 20000 },
    { what: 'Aster components total', value: 45000 + 15000 + 20000, shown: 80000 },
    { what: 'Aster single life', value: 2400000 / 40, shown: 60000 },
    { what: 'Aster building parts', value: 1800000 + 300000 + 300000, shown: 2400000 },
    // simulator
    { what: 'Simulator FV less costs', value: 410000 - 10000, shown: 400000 },
    { what: 'Simulator recoverable amount', value: Math.max(400000, 440000), shown: 440000 },
    { what: 'Simulator IFRS loss', value: 500000 - 440000, shown: 60000 },
  ],
};
