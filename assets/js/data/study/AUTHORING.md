# Writing Learn courses: the authoring guide

This guide is the contract between the lesson content and the code that turns it into pages. Follow it exactly: `node tools/study-check.mjs <course>/<slug>` checks every rule it can, and a lesson is not done until that command passes with no errors.

The standard is a university course, not a study guide. A student with no background must be able to learn the skill from the lesson alone, practise it, and prove they can do it. Quality beats length, but the parts listed below are all required.

---

## 1. Where things live

```
assets/js/data/study/
  catalog.js                 schools, all 32 courses, modules and lesson order (slugs), learning paths, labs
  AUTHORING.md               this guide
  f01/  b02/  m02/           one folder per built course
    case.js / market.js      the course's fictional case: names, accounts, figures. Use them; never contradict them.
    <slug>.js                lesson content (prose, formulas, worked examples). Read at build time only.
    <slug>.ex.js             lesson exercises, answer keys and interactive widgets. Loaded by the page in the browser.
    assess-m1.js …           module tests (one file per module)
    assess-diagnostic.js     course diagnostic
    assess-final.js          cumulative final
    project.js               the applied project
assets/data/study/           datasets students can download (B02)
assets/js/core/accounting.js, cleaning.js, mixsim.js   the engines behind the labs and widgets (tested separately)
```

Lesson slugs and their order come from `catalog.js` (`modules[].lessons`). Do not add or rename lessons there without agreement.

Two files per lesson keeps the reading text apart from the answer keys: the page's HTML is generated from `<slug>.js`, and the browser loads `<slug>.ex.js` only to run the exercises. Answer keys are therefore never printed in the page, though a determined student can read them in the JavaScript, as on any static site.

---

## 2. The lesson file: `<slug>.js`

```js
// <slug>.js — F01 · <Title>. Content only; exercises are in <slug>.ex.js.
export default {
  slug: 'accounting-equation',
  title: 'The accounting equation',
  blurb: 'One or two sentences: what the student will be able to do and why it matters.',
  status: 'draft',                       // 'draft' until an independent reviewer sets 'reviewed'
  objectives: ['Explain …', 'Calculate …', 'Record …'],      // 3–6, each starts with a measurable verb
  prerequisites: [
    { lesson: 'f01/accounts-and-classifications', why: 'You need the five kinds of account.' },
    { text: 'Adding and subtracting signed numbers.' },
  ],
  case: 'lantern',                       // the catalog case this lesson uses, or null
  concept: [ /* blocks */ ],             // The idea
  theory: [ /* blocks */ ],              // In depth
  formulas: [ /* formula cards */ ],     // may be [] when the topic has none
  examples: [ /* worked examples */ ],   // at least one 'simple' and one 'challenging'; add 'applied' where it fits
  demo: [ { widget: 'eq-explorer', intro: 'What to try and what to notice.' } ],
  mistakes: [ { title: 'What students get wrong', html: 'Why it is wrong and how to avoid it.' } ],
  application: [ /* blocks */ ],         // In practice: how a professional uses this in a real decision
  summary: ['Key point', '…'],           // 4–8 points
  glossary: [{ term: 'Asset', def: 'A resource the business controls …' }],
  references: [{ text: 'Author (Year). <i>Title</i>. Publisher.', url: 'https://…', checked: '2026-10-22' }],
  checks: [{ what: 'Total assets after transaction 3', value: 20000 + 10000 + 12000 - 4000, shown: 38000 }],
};
```

### The page these become

The parts appear in this order; the student can't reorder them, so write each one for its place:

| Part | Field | What it must do |
|---|---|---|
| Before you start | `objectives`, `prerequisites` | What the student will be able to do; what to review first (links). |
| The idea | `concept` | Teach from first principles in plain language. Introduce every term before using it. Say why it matters and when it is used. Bring in the case. |
| In depth | `theory` | Definitions, assumptions, rules, methods, limitations, comparisons (US GAAP vs IFRS where relevant). Don't skip essential theory for brevity. |
| Formulas | `formulas` | Every formula with every symbol defined, units and assumptions. |
| Worked examples | `examples` | Step-by-step solutions: one simple, one more challenging, and an applied one where it fits. |
| Explore | `demo` | Interactive demonstrations (widgets from the `.ex.js` file). |
| Common mistakes | `mistakes` | 3–6 real misconceptions: what students believe, why it fails, the fix. |
| Guided practice | `.ex.js guided` | Problems with hints. |
| On your own | `.ex.js independent` | Problems without hints; answers only after the student submits or asks. |
| In practice | `application` | A professional using this in an actual business decision. |
| Knowledge check | `.ex.js check` | Graded: conceptual, numerical and applied questions. 80% completes the lesson. |
| Summary | `summary`, key formulas, `glossary`, `references` | Recap, terms, sources. |

Length: `concept` + `theory` + `application` together should be roughly **1,800–3,500 words**. The checker warns outside 1,500–4,500. Estimated minutes are calculated from the words, examples and exercises; don't set them.

### Blocks

`concept`, `theory` and `application` are arrays of blocks. Each block is an object with one of these shapes:

| Block | Shape | Renders as |
|---|---|---|
| Paragraph | `{ p: 'html' }` | A paragraph. Keep to 2–5 sentences. |
| Subheading | `{ h: 'Text' }` | An `h3` inside the part. |
| Lists | `{ list: ['html', …] }`, `{ ol: ['html', …] }` | Bulleted or numbered list. |
| Callout | `{ callout: 'key' \| 'note' \| 'warn' \| 'standards', title: 'Text', html: 'html' }` | Key idea, side note, caution, or a standards box (US GAAP vs IFRS, effective dates). |
| Display maths | `{ math: 'TeX' }` | A centred equation. |
| Table | `{ table: { caption, head: ['…'], rows: [['…']], align: ['l', 'r'], foot: [['…']], note } }` | A data table. Numbers right-aligned with `align`. `foot` rows are totals. |
| Journal | `{ journal: { caption, entries: [{ date: '2026-03-03', lines: [{ acct: 'Equipment', dr: 12000 }, { acct: 'Cash', cr: 4000 }], memo: 'Bought espresso equipment.' }] } }` | A general journal: debits first, credits indented. Must balance; accounts must exist in the course chart. |
| T-accounts | `{ taccounts: { caption, accounts: [{ name: 'Cash', dr: [['3 Mar', 20000]], cr: [['4 Mar', 1800]] }] } }` | T-accounts with the balance computed and shown on the normal side. |
| Statement | `{ statement: { title: 'Lantern Coffee Co.', subtitle: 'Income statement for March 2026', sections: [{ head: 'Revenue', rows: [['Catering revenue', 5600]], total: ['Total revenue', 7100] }], grand: ['Net income', 990] } }` | A financial statement layout. Amounts in dollars; negative amounts in parentheses automatically. Totals are checked against the rows. |
| Definitions | `{ define: [['Term', 'html definition'], …] }` | A definition list. |
| Case | `{ case: 'html' }` | A paragraph from the fictional case, tagged “Fictional case”. |
| Figure | `{ figure: { svg: '<svg viewBox="…">…</svg>', caption: 'html', alt: 'Full description of what the figure shows.' } }` | An inline SVG diagram. Use `currentColor` and the CSS variables `var(--ink)`, `var(--ink-3)`, `var(--rule-strong)`, `var(--series-1)`, `var(--series-2)`, `var(--series-3)` so it works with the site's colours. No raster images. |
| Quote | `{ quote: { text: 'html', cite: 'html' } }` | A short quotation (one sentence at most, attributed). |

### Inline HTML allowed in strings

`<b> <strong> <i> <em> <sub> <sup> <br> <code> <abbr title="…"> <a href="…">`, plus three special tags:

- `<m>TeX</m>`: inline maths, rendered by KaTeX when the page is built.
- `<M>TeX</M>`: display maths inside a paragraph (prefer the `{ math }` block).
- `<g>term</g>`: links the word to its glossary entry. The term must be in this lesson's or an earlier lesson's `glossary`.

No other tags, no attributes besides `href` and `title`, no Markdown, no inline styles.

### Maths

- Write TeX inside JavaScript with `String.raw` so backslashes survive: ``{ math: String.raw`\text{Assets} = \text{Liabilities} + \text{Equity}` }``. In ordinary quotes every backslash must be doubled (`'\\frac{a}{b}'`).
- The trap: in ordinary quotes a single backslash is silently eaten. `'\times'` becomes a tab and `imes`, `'\frac'` a form feed and `rac`, `'\div'` just `div`. The result is still valid TeX, so it renders wrongly rather than failing. The checker now flags control characters, common commands that lost their backslash inside `<m>`, and the opposite mistake (doubled backslashes inside `String.raw`). A `%` inside `<m>` starts a TeX comment: write `\%`.
- Thousands separators inside TeX: `12{,}000`. Currency inside TeX: `\$12{,}000`. Words: `\text{…}`. Multiplication: `\times`.
- Keep currency and words outside TeX when you can: `the payment of $1,800 covers <m>12</m> months` is easier to read than putting the whole sentence in TeX.
- Exercises (`.ex.js`) cannot use TeX (the browser has no maths renderer). Use plain text with Unicode: × ÷ − ² ³ ≤ ≥ ≈ Σ √ and fractions like 1,800 ÷ 12.

### Formula cards

```js
{ id: 'straight-line', name: 'Straight-line depreciation (per year)',
  tex: String.raw`\text{Depreciation} = \dfrac{\text{Cost} - \text{Residual value}}{\text{Useful life}}`,
  where: [[String.raw`\text{Cost}`, 'What the asset cost to buy and get ready for use', '$'],
          [String.raw`\text{Residual value}`, 'What the business expects to sell it for at the end', '$'],
          [String.raw`\text{Useful life}`, 'How long the business expects to use it', 'years']],
  assumptions: 'The asset is used up evenly over its life.',
  note: 'Other methods (declining balance, units of production) exist; F02 covers them.' }
```

Every formula card needs `id`, `name`, `tex` and `where` (one row per symbol, with its unit; use `''` for pure numbers). Key formulas also appear in the site's formula library.

### Worked examples

```js
{ level: 'simple',                        // 'simple' | 'challenging' | 'applied'
  title: 'Short title',
  fictional: true,                        // true for any invented business, person or number
  setup: 'html: the situation and the question',
  steps: ['html: step 1 — show the substitution and the arithmetic', '…'],   // at least 3 steps
  answer: 'html: the final answer, with units',
  interpretation: 'html: what the answer means for the business',
  journal: { entries: [...] },            // optional: shown under the setup, in the journal block's format
  table: { head: [...], rows: [...] },     // optional: a table block, same format as in the lesson body
  statement: { title, sections, … } }      // optional: a statement block
```

When an example has a `journal`, `table` or `statement`, the page shows it under the setup, so don't repeat the whole entry in `answer`: refer to it.

Show the reasoning, not only the arithmetic: name the rule used in each step. A challenging example combines ideas or needs a judgement; an applied example puts the method to work on a realistic business decision.

### `checks`: every number is recomputed

Every number you print in prose, tables, examples, journal entries and statements must be reproduced by a calculation in `checks`:

```js
checks: [
  { what: 'Insurance expense per month', value: 1800 / 12, shown: 150 },
  { what: 'Net income for March', value: 7100 - 6110, shown: 990 },
  { what: 'Margin on price', value: (3.49 - 2.37) / 3.49, shown: 0.321, tol: 0.0005 },
]
```

`value` is the computation written out (not a copy of the number); `shown` is what the text prints; `tol` defaults to 0.005. The checker fails if they differ. Journal entries must balance and statement totals must add up; the checker does that itself.

---

## 3. The exercise file: `<slug>.ex.js`

```js
// <slug>.ex.js — F01 · <Title>: widgets, practice and the knowledge check (answer keys live here).
export const widgets = { 'eq-explorer': { type: 'equation', … } };
export const guided = [ /* 3–4 exercises, each with hints */ ];
export const independent = [ /* 4–6 exercises */ ];
export const check = [ /* 5–6 exercises: ≥1 conceptual, ≥1 numerical, ≥1 applied */ ];
```

### What counts

- **Guided practice** is scaffolded. Every item has at least one hint (better: a nudge, then a near-solution) and a full worked `solution`. Guided answers count toward completing the lesson, not toward mastery.
- **On your own** items have a `solution` but no hints needed. First attempts count toward mastery.
- **Knowledge check** items have no hints. A score of at least 80% (with every guided item attempted) completes the lesson. First attempts count toward mastery.
- Module tests, the diagnostic and the final use the same exercise shapes (see section 5).

### Fields every exercise has

```js
{ id: 'f01-eq-g1',              // unique in the course: <course>-<lesson short code>-<g|i|k><n>
  type: 'mc',                   // see the table below
  kind: 'conceptual',           // 'conceptual' | 'numerical' | 'applied'
  prompt: 'html (no TeX)',
  data: { table: { head: [...], rows: [[...]] } },   // optional: a small table shown under the prompt
  hints: ['A nudge.', 'Nearly the answer.'],         // required for guided items
  solution: 'html: the worked solution, shown after the student submits or asks',
  why: 'html: one or two sentences shown with a right answer (optional)' }
```

Write `solution` as a short worked method, not just the answer. Feedback on wrong answers must explain the misunderstanding and point to the right method.

### Exercise types

| `type` | Extra fields | Notes |
|---|---|---|
| `mc` | `options: ['…']`, `answer: 0`, `feedback: { 1: '…', 2: '…' }` | One right option. Give feedback for each wrong option that a student could plausibly choose: say why it is tempting and why it is wrong. Options are shuffled; don't write “all of the above”. |
| `multi` | `options`, `answer: [0, 2]`, `feedback` | Select all that apply. Say so in the prompt. |
| `num` | `answer: 150`, `check: () => 1800 / 12`, `tol: 0.5`, `unit: '$' \| '%' \| 'units' \| …`, `places: 0`, `wrong: [{ value: 1800, say: 'That is the whole policy…' }]` | `check` must recompute the answer independently; the checker fails if it differs. `tol` is absolute (default: 0.5% of the answer, at least 0.005). Percentages are entered as percentages (6 means 6%). `wrong` lists common wrong answers with targeted feedback. |
| `fill` | `text: 'Assets = [[0]] + [[1]]'`, `blanks: [{ options: ['Liabilities', 'Revenue', 'Expenses'], answer: 0 }, { accept: ['equity', 'owners equity', 'shareholders equity'] }]` | Each `[[n]]` is a blank: a drop-down (`options` + `answer`) or a short text box (`accept`, compared ignoring case, spaces and punctuation). Prefer drop-downs. |
| `classify` | `items: ['Cash', 'Unearned Revenue']`, `categories: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']`, `answer: [0, 1]`, `feedback: { 1: '…' }` | Each item gets a drop-down of the categories. `feedback` keyed by item index explains that item. |
| `order` | `items: ['first', 'second', …]` (in the correct order) | Shown shuffled; the student numbers them. |
| `journal` | `chart: 'f01'`, `accounts: ['Cash', …]` (optional: the drop-down list; default the whole chart), `lines: [{ acct: 'Equipment', dr: 3000 }, { acct: 'Accounts Payable', cr: 3000 }]`, `date: '2026-03-03'` | The student builds the entry line by line. Checked by account and side, ignoring line order; amounts to the cent. Lines must balance. |
| `equation` | `answer: { assets: 3000, liabilities: 3000, equity: 0 }` | The student enters the signed change in each side of the accounting equation. |
| `rows` | `data.table` (required), `answer: [2, 5]` | The student selects table rows that meet a condition (for example, the duplicates). Row indexes start at 0. |
| `short` | `rubric: ['criterion', …]`, `model: 'html model answer'` | A written answer (a recommendation, an explanation). Marked by the student against the rubric and model answer; counts as done, never toward mastery. Use only where writing is the skill. |
| `steps` | `steps: [exercise, …]` | A multi-step problem: each step is a full exercise (any type except `steps`) with its own hints. Use for guided practice that walks through a method. The parent has `id`, `type`, `kind`, `prompt`, `solution`; each step has its own `id`. |

Numbers in exercises follow the same rule as content: a `num` item's `check` recomputes it, a `journal` key balances, and anything a prompt states must agree with the case files.

---

## 4. Widgets (interactive demonstrations)

Widgets go in `widgets` in the `.ex.js` file, keyed by an id that `demo[].widget` refers to. Every control must do something meaningful; if a widget would only decorate, leave it out.

### Shared widgets (all courses)

**`formula`**: a Formula Explorer. Sliders change the inputs; the answer, the working and an optional chart update.

```js
'sl-dep': { type: 'formula', title: 'Straight-line depreciation',
  intro: 'Change the cost, residual value and life.',
  inputs: [
    { id: 'cost', label: 'Cost', min: 1000, max: 50000, step: 500, value: 12000, fmt: 'money' },
    { id: 'life', label: 'Useful life', min: 1, max: 20, step: 1, value: 5, fmt: 'int', unit: 'years' },
  ],
  compute: (v) => ({
    headline: { label: 'Depreciation per year', value: `$${(v.cost / v.life).toFixed(2)}` },
    rows: [['Per month', `$${(v.cost / v.life / 12).toFixed(2)}`]],
    note: 'Plain-language interpretation of the result for these inputs.',
    chart: { kind: 'line', x: { label: 'Year', values: [0, 1, 2] }, series: [{ name: 'Book value', values: [12000, 9600, 7200] }], y: { label: 'Book value ($)' } },   // optional
  }) }
```

`fmt` is `'money' | 'pct' | 'int' | 'num'` (`pct` shows the value with a % sign: 6 means 6%). `compute` must work at every input's min, max and default (the checker runs all of them) and return `{ headline, rows, note }`, optionally `chart` (`kind: 'line' | 'bar'`, up to three series) or `error` (a message when the inputs make no sense). Use this for any calculation a student should explore: depreciation, interest, break-even, markup and margin, elasticity, z-scores, scaling.

**`chart`**: a fixed chart of data you supply, with its data table for screen readers.

```js
'plc-curve': { type: 'chart', kind: 'line', title: '…', x: { label: 'Year', values: [1, 2, 3] },
  series: [{ name: 'Sales', values: [10, 40, 90] }], y: { label: 'Units (thousands)' }, note: 'html' }
```

### F01 accounting widgets (engine: `assets/js/core/accounting.js`; chart and case: `f01/case.js`)

Transactions in widgets use the same shape as `case.js`: `{ id, date, text, lines: [{ acct, dr } | { acct, cr }], cash? }`. To reuse the March transactions, list their ids: `transactions: ['m1', 'm2', 'm3']` (and `'a1'`… for the adjustments).

- **`equation`**: the accounting equation explorer. Steps through transactions, showing each account's balance in equation columns (assets = liabilities + equity) and bars for the three totals, always in balance.
  `{ type: 'equation', transactions: ['m1', …], mode: 'watch' | 'predict' }`. In `predict` mode the student enters the change in assets, liabilities and equity before each transaction is revealed.
- **`journal`**: the transaction analysis drill (the core of the Accounting Lab). For each transaction the student picks the accounts affected, whether each increases or decreases, debit or credit, the amounts, the effect on the equation and the statements affected; then sees feedback and the correct entry.
  `{ type: 'journal', transactions: [...], ask: ['accounts', 'direction', 'side', 'amount', 'equation', 'statements'] }` (`ask` lists which questions to include; default all).
- **`ledger`**: posting. Shows the journal and the T-accounts side by side; “Post next entry” posts one entry and highlights where each line lands; the trial balance updates.
  `{ type: 'ledger', transactions: [...], show: ['taccounts', 'trial'], mode: 'watch' | 'balance' }`. In `balance` mode the student calculates each account's balance before it is shown.
- **`statements`**: from an adjusted trial balance to statements. The student places each account on the right statement and works out net income, ending retained earnings and total assets.
  `{ type: 'statements', transactions: ['m1', …, 'a7'], build: ['income', 'equity', 'balance'] }`.

### B02 data widgets (engine: `assets/js/core/cleaning.js`; datasets in `assets/data/study/`)

Datasets (all fictional, generated with known defects; see `assets/data/study/README.md` once built):

- `lantern-orders`: Lantern Coffee's online-shop order export. Columns: `order_id, order_date, customer_id, email, region, product, size_g, quantity, unit_price, discount, order_total, channel, subscription, rating`. Defects: exact duplicate rows; repeated order ids with changed values; dates in several formats (ISO, day/month/year, month/day/year, written out, spreadsheet serial numbers); prices stored as text with `$`, thousands separators and one decimal comma; negative, zero and impossible quantities; region spelled several ways; product names with stray spaces and case; missing emails and ratings; order totals that don't equal quantity × price − discount; one genuine bulk order and one typing-error outlier.
- `harborview-bookings`: hotel bookings. Columns: `booking_id, booked_on, check_in, check_out, nights, room_type, adults, children, rate, channel, country, status, total`. Defects: check-out before check-in; nights that don't match the dates; placeholder rates (0 and 9999); country written as codes and names; blank `children` meaning 0; duplicate bookings from a channel-manager sync; a right-skewed total.
- `northfield-students`: student records. Columns: `student_id, programme, year, gpa, credits, attendance_pct, study_hours, scholarship, entry_score, residence`. Defects: GPA on two scales (0–4 and 0–100); attendance above 100%; study hours missing more often in some years; programme names spelled several ways; skewed study hours; extreme entry scores.

- **`cleaning`**: a mini Data Cleaning Lab on a dataset (or an inline table), limited to the operations the lesson teaches. The student inspects the issues, applies steps, sees the table and the summary statistics change, and reads what each step did.
  `{ type: 'cleaning', dataset: 'lantern-orders' | { columns: ['…'], rows: [['…']] }, ops: ['dedupe', 'dedupe-key', 'trim', 'case', 'map', 'to-number', 'to-date', 'fill', 'drop-missing', 'flag-missing', 'validate', 'outliers', 'transform', 'scale', 'encode', 'derive', 'rename', 'drop-column'], watch: ['quantity', 'region'], task: 'html: what to achieve' }`
- **`cleaning` options beyond the basics** (supported by `assets/js/study/widgets/cleaning.js`):
  - `ops: []`, or leaving `ops` out, gives an inspect-only view: the profile and the issue list, with no steps.
  - `split: 'column'` names a column whose values are `train` or `test`. With `fit: ['train', 'all']` the student chooses whether scaling and encoding parameters are fitted on the training rows only or on all rows, which shows leakage.
  - `target: 'column'` names the outcome column for `encode` with `method: 'target'`.
  - `goals: [{ rule, column, … }]` sets what to achieve. Goals use the same shape as validation rules, and the widget reports progress as goals are met. The rule types are `unique`, `no-missing`, `type`, `in-set`, `range` (`min`, `max`, `integer`), `pattern`, `rows-between`, `equals` and `compare` (one column against another, e.g. check-out after check-in).
  - `transform` also has `fn: 'rescale'` (multiply values above a threshold, e.g. GPAs on a 0–100 scale).
  - The data table's column headers sort the view (not the data).
- **`distribution`**: a histogram explorer for one numeric column: choose a transformation (none, log, log(1 + x), square root) and an outlier rule (1.5 × IQR, |z| > 3, modified z > 3.5) and see the shape, skewness and flagged values change.
  `{ type: 'distribution', dataset: 'harborview-bookings', column: 'total', transforms: ['none', 'log', 'log1p', 'sqrt'], rules: ['iqr', 'z', 'mad'] }` or `{ values: [12, 15, …], label: 'Order value ($)' }`.

### M02 marketing widgets (engine: `assets/js/core/mixsim.js`; market: `m02/market.js`)

- **`mixsim`**: the Marketing Mix Simulator, cut down to the decisions a lesson is about. `lock` fixes decisions at the given values (or at `DEFAULT_PLAN` with `true`); the rest are open.
  `{ type: 'mixsim', lock: { tier: 'single', range: 'one', channels: true, promotion: true }, show: ['units', 'share', 'revenue', 'margin', 'contribution', 'satisfaction', 'awareness', 'elasticity'], note: 'html' }`
- **`plc`**: the product life cycle explorer: sales and profit curves over the stages, with the stage boundaries draggable by keyboard and pointer, and the typical objectives and 4P decisions for the selected stage.
  `{ type: 'plc', stages: ['introduction', 'growth', 'maturity', 'decline'] }`

For any other calculation (break-even, markup, price build-up, GRPs, ROAS), use the `formula` widget.

---

## 5. Assessments and projects

```js
// assess-m2.js — F01 module 2 test
export const items = [ { ...exercise, lesson: 'journal-entries' }, … ];   // 8–12 items, every lesson in the module covered
```

- Every assessment item has a `lesson` (the slug it tests) so the answer updates the right mastery.
- Items are new questions, not copies of lesson exercises, and cover conceptual, numerical and applied knowledge in roughly equal measure, with at least two of the course's characteristic formats (journal entries for F01, `rows` and dataset questions for B02, decisions and calculations for M02).
- No hints. `solution` is shown when the student reviews the test after submitting.
- `assess-diagnostic.js` exports `items` (8–12, spread across modules) and `route`: `[{ module: 2, ifAtLeast: 0.8 }, …]` meaning “if the student scores at least 80% on the items for modules before this one, suggest starting here”.
- `assess-final.js` exports `items` (20–25, all modules). 70% passes.
- `project.js` exports (as `default` or `project`):

```js
export default {
  title: 'One month at Brightwater Bike Repair',
  brief: [{ p: 'html' }, …],                     // blocks, as in a lesson body (or one html string)
  deliverables: ['html', …],
  stages: [
    { id: 'record', title: 'Record the month', html: 'what to do and why',
      tool: { kind: 'recorder', scenario: { name, chart: [...], transactions: [...] } },   // optional; see below
      items: [ /* exercises, any type; `short` for writing */ ] },
    …
  ],
  rubric: ['html: a criterion the student checks their own work against', …],
};
```

  A stage's `tool` mounts the course's lab inside the stage: `{ kind: 'recorder', scenario }` (Accounting Lab recorder, done when every entry is posted), `{ kind: 'cleaning', dataset, ops, watch, task, goals }` (Data Cleaning Lab, done when every goal is met) or `{ kind: 'mix', lock, show, plan }` (Marketing Mix Simulator; the plan is kept for the write-up). A stage is done when its tool's goal is met and every item has been answered. Projects never change mastery; the student finishes by checking their work against the `rubric`.

---

## 6. Style

- **Spelling and register.** British spelling (analyse, organisation, colour, modelling, labelled, practise as the verb and practice as the noun). Keep US GAAP account names as they are (Accounts Receivable, Common Stock) and mention the IFRS or UK name where it differs (trade receivables, share capital).
- **Voice.** Direct, precise and warm, addressed to “you”. Short paragraphs. Introduce a term before using it. No filler openings (“In this lesson we will explore…”), no exclamation marks, no emojis, no “simply” or “obviously”.
- **Numbers.** `$3,000`; `6%`; `1–15 March`; dates as `1 March 2026`; × and ÷ in prose; a real minus sign (−) for negative numbers in prose; parentheses for negatives in financial statements (the statement block does this). Round only at the end and say when you round.
- **Typography.** Curly quotes and apostrophes (’ “ ”) in prose. Inside JavaScript, use template literals or the ’ character so quotes don't break strings.
- **Fictional material.** Every invented business, person, dataset and number is labelled: `fictional: true` on examples and the `case` block for narrative. Never attach invented facts to real companies or people. Real organisations (FASB, IASB, SEC, AMA) appear only with true statements about them.
- **Variety.** Use the course case for continuity, and other industries for breadth (a hotel, an airline, a university, an online retailer, a battery-storage installer, a clothing brand).
- **Accessibility.** Don't rely on colour in descriptions (“the red bar”); describe figures fully in `alt`; keep tables small enough to read on a phone (≤ 6 columns where possible).

---

## 7. Accuracy

Treat every lesson as a textbook chapter that will be checked.

1. **Recompute everything.** Every number goes in `checks`; every `num` exercise has a `check`; every entry balances. Work examples twice, by two routes where possible.
2. **Use the case files.** F01 uses `f01/case.js` (accounts, March transactions, adjustments, totals). M02 uses `m02/market.js`. Don't introduce facts that contradict them; if you need a new fact, put it in your lesson and keep it consistent.
3. **Standards and rules.** Distinguish US GAAP from IFRS where they differ, name the standard (for example ASC 606 or IFRS 15) only after confirming it, and give effective dates where they matter. Say when something is a convention that varies (chart-of-accounts numbering, the 1.5 × IQR fence, “markup” versus “margin”) rather than a rule.
4. **Several valid views.** Where a framework has more than one accepted interpretation, present them.
5. **Misconceptions the brief requires.** Where your topic touches them, state clearly: a debit is not an expense; cash flow and profit differ; correlation is not causation; R² is not predictive accuracy; preprocessing must avoid leakage; ROI and ROAS are different; RFM thresholds depend on context; valuations depend on assumptions.
6. **Sources.** 2–6 references per lesson, real and verifiable, preferably free to read: OpenStax (Principles of Accounting, Introductory Statistics, Principles of Marketing), FASB and IFRS Foundation pages, the SEC, NIST/SEMATECH e-Handbook of Statistical Methods, scikit-learn documentation, the American Marketing Association, and peer-reviewed papers. Open each one (WebFetch or WebSearch) before citing it and set `checked` to the date. If you could not open it, set `checked: null`; the page then marks it “not yet verified”. Never invent a citation, page number, quotation or statistic. Write in your own words; quote at most one sentence.
7. **No uncited real-world statistics.** Market sizes, growth rates and survey results about the real world need a verified source, or must be left out. Fictional figures are fine when labelled.

---

## 8. Checking your work

```
node tools/study-check.mjs f01/accounting-equation      # one lesson
node tools/study-check.mjs f01                          # every lesson and assessment in the course
```

It reports errors (must fix) and warnings (fix unless you have a reason). It checks the shapes above, renders every piece of TeX, reruns `checks` and every `num` exercise's `check`, balances journal entries against the chart, adds up statements, runs each `formula` widget at its defaults and extremes, counts words, and confirms ids are unique.
