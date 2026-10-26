// gaap-and-ifrs.js — F02 · US GAAP and IFRS. Content only; exercises are in gaap-and-ifrs.ex.js.
// Every standards fact was checked at its source on 2026-10-23 (see references): the IFRS 18 project summary on ifrs.org;
// ASUs 2015-11, 2024-03 and 2025-01 on storage.fasb.org; Deloitte’s IFRS/US GAAP roadmap (inventories, intangibles,
// PP&E, cash flows, leases); SEC non-GAAP interpretations; IRS on LIFO conformity; the IFRS Foundation’s US profile.
// The rules taught in Modules 1–3 (LIFO, write-downs, revaluation, components, development costs, cash-flow
// classification) are summarised here with links back, not re-taught. Lantern’s figures come from case.js.
// Aldgate Coffee plc, Voltmere Energy and Fairhaven Hotel are fictional and appear only in this lesson.
import { FACTS as F, LEDGER, DERIVED as D, COSTING } from './case.js?v=19';

const bal = (n) => LEDGER[n]?.balance || 0;
const t = F.tax.rate;
// componentised espresso equipment (hypothetical split of the $12,000)
const machine = 8400, grinder = 3600;
const compMonthly = machine / 60 + grinder / 36;                                    // 240
// IFRS 18 version of Lantern’s cash flows and income statement
const cfoIfrs = D.cfo + D.interestPaid, cffIfrs = D.cff - D.interestPaid;
const wcExFin = D.operatingCurrentLiabilities - bal('Interest Payable') - D.taxPayable - D.operatingCurrentAssets;   // 3,874
const employees = F.wages.events + F.wages.shopAndOffice;                           // 43,600
const otherOpex = D.operatingExpenses - D.badDebt;                                  // 65,300
// Voltmere Energy (challenging example)
const V = { research: 180000, devBefore: 120000, devAfter: 300000, life: 5 };
const vUs = V.research + V.devBefore + V.devAfter, vIfrs = V.research + V.devBefore, vAmort = V.devAfter / V.life;
// Fairhaven Hotel (simple example): revalued up, then down
const FH = { ca: 2000000, fv1: 2600000, life: 20, years: 2, fv2: 1600000 };
const fhSurplus = FH.fv1 - FH.ca, fhDepRev = FH.fv1 / FH.life, fhDepCost = FH.ca / FH.life;
const fhCarry2 = FH.fv1 - FH.years * fhDepRev, fhDecrease = fhCarry2 - FH.fv2;
const fhToOci = Math.min(fhDecrease, fhSurplus), fhToPl = fhDecrease - fhToOci;
const fhUs = FH.ca - FH.years * fhDepCost;

export default {
  slug: 'gaap-and-ifrs',
  title: 'US GAAP and IFRS',
  blurb: 'Compare the two frameworks where they differ for the statements in this course (inventory, property, development costs, leases, cash-flow classification and, from 2027, the structure of the income statement), measure what each difference does to the figures, and see why Lantern reports under US GAAP.',
  status: 'reviewed',
  objectives: [
    'Describe who sets US GAAP and IFRS, the SEC’s role, and how far the two frameworks converged.',
    'Classify each difference between the frameworks by what it changes: profit, assets and equity only, or presentation only.',
    'Calculate how a difference between the frameworks changes a company’s profit, assets or operating cash flow, and restate a profit figure from one framework to the other.',
    'Explain what IFRS 18 changes in the income statement and what ASU 2024-03 requires of US public business entities, with their effective dates.',
    'Identify the frameworks a US private company may use, and explain why Lantern uses US GAAP.',
  ],
  prerequisites: [
    { lesson: 'f01/what-is-accounting', why: 'It introduced the FASB, the IASB and the SEC, whose roles this lesson builds on.' },
    { lesson: 'f02/inventory-and-cost-of-goods-sold', why: 'LIFO, net realisable value and write-down reversals are summarised here, not re-taught.' },
    { lesson: 'f02/long-lived-assets', why: 'The revaluation model, component depreciation and development costs are summarised here, not re-taught.' },
    { lesson: 'f02/cash-flow-statement', why: 'The classification of interest and dividends under ASC 230 and IAS 7 comes from there.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'In January 2027 Ana meets a possible investor who also owns shares in Aldgate Coffee plc, a fictional UK-listed roaster that reports under IFRS. “Your numbers and Aldgate’s won’t be comparable,” he tells her. Ana wants to know whether he is right: which of Lantern’s figures would change under IFRS, and which rules could make Aldgate’s statements look different from Lantern’s even if the two businesses were identical?' },
    { p: 'Two frameworks dominate financial reporting. US <g>GAAP</g>, written by the <g>FASB</g> and organised in its Accounting Standards Codification, is what the <g>SEC</g> requires of US public companies and what Lantern uses. <g>IFRS</g> Accounting Standards, written by the <g>IASB</g>, are required in more than 140 jurisdictions. F01 introduced the boards, and earlier lessons in this course met most of the differences one at a time; this lesson puts them side by side and asks what each does to the figures.' },
    { p: 'Most of what you have learned works the same way under both. Both use accrual accounting and double entry, and both produce the same four statements. Revenue, the largest figure on most income statements, follows the same five-step model, because the IASB issued IFRS 15 in May 2014 together with the FASB’s Topic 606. The differences sit in particular choices: how inventory is costed and whether a write-down can be reversed, whether property can be carried at fair value and how it is depreciated, whether development spending becomes an asset, how leases are accounted for, where interest and dividends go in the statement of cash flows and, from 2027, how the income statement itself is structured.' },
    { p: 'A difference matters when it changes a figure a reader uses, and the differences change different figures. Some change profit: LIFO, write-down reversals, development costs and component depreciation. One changes assets and equity without passing through profit when it happens: an upward revaluation. Some change only where an item is shown: interest and dividends in the statement of cash flows, and the new income statement categories; leases do some of each. Knowing which kind you face tells you what to adjust before comparing two companies.' },
    { callout: 'key', title: 'Recognition, measurement, presentation', html: 'Ask three questions of any difference. Is the item recognised at all, or when (development costs)? At what amount is it measured (LIFO, write-down reversals, revaluation, components)? Where is it presented (cash-flow classification, income statement categories)? Differences of the first two kinds change profit, assets or equity; differences of the third kind change only subtotals.' },
  ],

  theory: [
    { h: 'Who sets the rules, and how far they converged' },
    { p: 'The SEC has legal authority over the financial reporting of US public companies and recognises the FASB as their standard setter; it requires domestic public companies to use US GAAP. Since a 2007 rule it has accepted statements prepared under IFRS as issued by the IASB from <g>foreign private issuer</g>s (foreign companies whose securities trade in the United States) without a reconciliation to US GAAP. The SEC sets no framework for private companies such as Lantern; who decides for them is covered at the end of this lesson.' },
    { p: 'On 18 September 2002, at a joint meeting in Norwalk, Connecticut, the FASB and the IASB pledged their best efforts to make their existing standards fully compatible as soon as practicable, and to coordinate their future work so that compatibility would last. The Norwalk Agreement started a decade of joint projects aimed at <g>convergence</g>. The most visible result for this course is revenue: IFRS 15 and Topic 606 were issued together in May 2014. Many differences survived, including every one in this lesson, and in 2024 the two boards issued separate standards on the income statement, IFRS 18 and ASU 2024-03, that differ in scope and depth.' },
    { figure: {
      svg: '<svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="12"><path d="M15 100 H665" stroke="var(--rule-strong)" stroke-width="2"/><g stroke="var(--rule-strong)" stroke-width="1"><path d="M45 100 V82"/><path d="M215 100 V82"/><path d="M385 100 V82"/><path d="M555 100 V82"/><path d="M130 100 V118"/><path d="M300 100 V118"/><path d="M470 100 V118"/><path d="M640 100 V118"/></g><g fill="var(--series-1)"><circle cx="45" cy="100" r="5"/><circle cx="130" cy="100" r="5"/><circle cx="215" cy="100" r="5"/><circle cx="300" cy="100" r="5"/><circle cx="385" cy="100" r="5"/></g><g fill="var(--series-2)"><circle cx="470" cy="100" r="5"/><circle cx="555" cy="100" r="5"/><circle cx="640" cy="100" r="5"/></g><g fill="currentColor" text-anchor="middle"><text x="45" y="40" font-weight="600" font-size="13">1973</text><text x="45" y="56">FASB set up</text><text x="45" y="72">(US GAAP)</text><text x="215" y="40" font-weight="600" font-size="13">Sep 2002</text><text x="215" y="56">Norwalk Agreement</text><text x="215" y="72">to converge</text><text x="385" y="40" font-weight="600" font-size="13">May 2014</text><text x="385" y="56">IFRS 15 and</text><text x="385" y="72">Topic 606 issued</text><text x="555" y="40" font-weight="600" font-size="13">Nov 2024</text><text x="555" y="56">ASU 2024-03</text><text x="555" y="72">issued (FASB)</text><text x="130" y="136" font-weight="600" font-size="13">2001</text><text x="130" y="152">IASB set up</text><text x="130" y="168">(IFRS)</text><text x="300" y="136" font-weight="600" font-size="13">2007</text><text x="300" y="152">SEC accepts IFRS</text><text x="300" y="168">from foreign issuers</text><text x="470" y="136" font-weight="600" font-size="13">Apr 2024</text><text x="470" y="152">IFRS 18 issued</text><text x="470" y="168">(IASB)</text></g><g fill="currentColor" text-anchor="end"><text x="675" y="136" font-weight="600" font-size="13">2027</text><text x="675" y="152">IFRS 18 and</text><text x="675" y="168">ASU 2024-03 apply</text></g></svg>',
      caption: 'Milestones for the two frameworks. The last three markers are the 2024 income statement standards and the year both take effect for calendar-year companies.',
      alt: 'A timeline from left to right with eight events. 1973: the FASB is set up to write US GAAP. 2001: the IASB is set up to write IFRS. September 2002: the Norwalk Agreement to converge. 2007: the SEC accepts IFRS statements from foreign issuers. May 2014: IFRS 15 and Topic 606 are issued together. April 2024: the IASB issues IFRS 18. November 2024: the FASB issues ASU 2024-03. 2027: IFRS 18 and ASU 2024-03 apply, for calendar-year companies.',
    } },

    { h: 'The vocabulary' },
    { p: 'The frameworks often use different words for the same thing, and companies vary in which they use. The pairs below are the usual ones; F02 uses the US terms because Lantern reports under US GAAP.' },
    { table: {
      caption: 'Common US GAAP terms and their usual IFRS equivalents',
      head: ['US GAAP (common usage)', 'IFRS (common usage)'],
      rows: [
        ['Balance sheet', 'Statement of financial position'],
        ['Income statement', 'Statement of profit or loss'],
        ['Net income', 'Profit for the year'],
        ['Stockholders’ equity; common stock', 'Equity; share capital'],
        ['Accounts receivable; accounts payable', 'Trade receivables; trade payables'],
        ['Book value', 'Carrying amount'],
        ['Allowance for doubtful accounts', 'Loss allowance'],
      ],
    } },

    { h: 'Inventory, property and development costs, in brief' },
    { p: 'Earlier lessons in this course taught each of these rules. Here they are side by side, with what each does to the figures.' },
    { list: [
      '<b>Inventory cost formulas.</b> US GAAP (ASC 330) allows LIFO; IAS 2 doesn’t, and the US <g>LIFO conformity rule</g> means a company that wants LIFO’s tax saving must report under LIFO too. For Lantern’s House Blend in the fourth quarter of 2026, periodic LIFO would have meant $360 less gross profit than FIFO ($22,920 of cost of goods sold against $22,560) and, at 25%, $90 less tax.',
      '<b>Write-downs that recover.</b> Both frameworks write inventory down to <g>net realisable value</g>; US GAAP has done so since ASU 2015-11 for every cost method except LIFO and the retail inventory method. Only IAS 2 reverses a write-down when value recovers, up to the amount written off (paragraph 33); under ASC 330-10-35-14 the written-down amount becomes the new cost. IFRS profit is therefore higher in the year of recovery, US GAAP profit when the goods are sold.',
      '<b>Revaluation.</b> IAS 16 offers a <g>revaluation model</g>, class by class: increases go to <g>other comprehensive income</g> and a revaluation surplus in equity, and later depreciation is based on the revalued amount. US GAAP allows the cost model only. The simple example below follows a revaluation and a later fall in value.',
      String.raw`<b>Components.</b> IAS 16 requires <g>component depreciation</g> for significant parts with different useful lives (paragraph 43); US GAAP permits it but doesn’t require it. Had Lantern’s $12,000 of equipment been an $8,400 machine lasting five years and a $3,600 grinder lasting three, ten months’ depreciation would have been <m>(8{,}400 \div 60 + 3{,}600 \div 36) \times 10 = 2{,}400</m> rather than $2,000.`,
      '<b>Development costs.</b> ASC 730 expenses research and development as incurred; software to be sold is capitalised under ASC 985-20 once technological feasibility is established. IAS 38 expenses research but capitalises development once six criteria are met (paragraph 57): technical feasibility, the intention and the ability to complete and use or sell the asset, probable future economic benefits, adequate resources, and reliable measurement of its cost. Spending expensed before then can’t be capitalised later (paragraph 71).',
    ] },

    { h: 'Cash-flow classification and leases' },
    { p: 'Two differences change where amounts appear more than their totals. Under ASC 230 interest paid, interest received and dividends received are operating cash flows; IAS 7 as amended by IFRS 18 makes interest and dividends paid financing, and interest and dividends received investing, for a company without a specified main business activity (the statement of cash flows lesson has the full table). Lantern’s only such item is the $450 of interest paid, so its operating cash flow would be $40,390 instead of $39,940, financing $24,550 instead of $25,000, and the increase in cash unchanged at $42,940. The amendments also make operating profit, not profit for the year, the starting point of the indirect method.' },
    { p: 'Leases are the larger difference for most companies. Both standards put most leases longer than 12 months on the balance sheet, but IFRS 16 has a single lessee model, with depreciation and interest in profit or loss and principal repayments in financing, while ASC 842 keeps operating leases, whose cost is one straight-line expense and whose payments are operating cash flows. For the same lease an IFRS reporter therefore usually shows higher operating profit and higher operating cash flow. Lantern pays $1,200 a month for its shared kitchen (F01’s entry m13); assuming either side can end the arrangement at a month’s notice, it is a short-term lease of 12 months or less, which both standards let a lessee keep off the balance sheet, so the rent is an expense under either.' },

    { h: 'The income statement: IFRS 18 and ASU 2024-03' },
    { p: 'IFRS 18 <i>Presentation and Disclosure in Financial Statements</i>, issued by the IASB in April 2024, replaces IAS 1 for annual reporting periods beginning on or after 1 January 2027, with earlier application permitted. It is applied retrospectively, so the previous year’s comparative figures are restated. Its three main changes are two to the statement of profit or loss and one to the notes.' },
    { list: [
      '<b>Categories.</b> Income and expenses are classified in five categories: operating, investing, financing, income taxes and discontinued operations. Operating is the default category, holding everything not classified elsewhere, including unusual items. Investing holds returns from assets that earn a return largely independently of the company’s other resources, such as dividends from shares in other companies and rental income. Financing holds income and expenses on liabilities such as bank loans and bonds, and interest on other liabilities such as leases and pensions.',
      '<b>Required subtotals.</b> A company without a specified main business activity presents operating profit and profit before financing and income taxes, so these subtotals mean the same thing in every such company’s income statement. Companies whose main business is lending or investing classify some of these items differently.',
      '<b>Management-defined performance measures, in a note.</b> A subtotal of income and expenses that a company uses in public communications outside its financial statements, such as an “adjusted operating profit”, is a <g>management-defined performance measure</g> and must be explained in a single note: how it is calculated and why it is useful, a reconciliation to the most directly comparable subtotal that IFRS requires, with the tax and non-controlling-interest effect of each reconciling item, and a statement that it may not be comparable with similar measures used by other companies.',
    ] },
    { p: 'IFRS 18 also adds principles for grouping information, aggregating and disaggregating items. A company that presents any operating expenses by function (cost of sales, selling, administration) must disclose in a note the amounts of five specified expenses by nature included in each line: depreciation, amortisation, employee benefits, impairment losses and inventory write-downs. The IASB described its proposals as changes to presentation and disclosure, not to recognition and measurement: a company’s profit for the year is the same, but the way it is built up and explained changes.' },
    { p: 'US GAAP has no equivalent of the IFRS 18 categories or required subtotals. It sets few rules for the layout of a private company’s income statement; SEC registrants follow the line items of Regulation S-X Rule 5-03. Measures such as adjusted EBITDA stay outside the financial statements, as <g>non-GAAP financial measure</g>s: a public company that uses one must reconcile it to the most directly comparable GAAP measure (Regulation G) and, in SEC filings and earnings releases, present that GAAP measure with equal or greater prominence (Item 10(e) of Regulation S-K).' },
    { p: 'The FASB’s 2024 standard on the income statement is narrower. ASU 2024-03, issued in November 2024 (Subtopic 220-40, Expense Disaggregation Disclosures), applies only to public business entities and changes nothing on the face of the income statement. In a tabular note, a company discloses for each relevant expense caption the amounts of purchases of inventory, employee compensation, depreciation, intangible asset amortisation and depletion that it contains, describes the rest qualitatively, and discloses its total selling expenses and, in annual periods, how it defines them. It is effective for annual reporting periods beginning after 15 December 2026 and for interim periods within annual reporting periods beginning after 15 December 2027, as ASU 2025-01 (January 2025) clarified, with early adoption permitted.' },
    { table: {
      caption: 'US GAAP and IFRS: the differences that matter for these statements (checked 23 October 2026)',
      head: ['Topic', 'US GAAP', 'IFRS', 'Effect on the statements'],
      rows: [
        ['Inventory cost formula', 'Specific identification, FIFO, weighted average or LIFO (ASC 330)', 'Specific identification, FIFO or weighted average; LIFO not permitted (IAS 2)', 'With rising prices LIFO lowers gross profit, tax and inventory'],
        ['Write-down later recovered', 'Not reversed: the written-down amount is the new cost (ASC 330-10-35-14; interim recoveries within a year aside)', 'Reversed, up to the original write-down (IAS 2.33)', 'IFRS profit and inventory higher in the year of recovery'],
        ['Property after purchase', 'Cost model only', 'Cost model or revaluation model, class by class (IAS 16)', 'Revaluation raises assets and equity through other comprehensive income, and later depreciation'],
        ['Significant components', 'Permitted, not required; composite depreciation accepted', 'Required for significant parts with different useful lives (IAS 16.43)', 'IFRS depreciation can be faster in the early years'],
        ['Development costs', 'Expensed as incurred (ASC 730); software to be sold capitalised after technological feasibility (ASC 985-20)', 'Capitalised once six criteria are met; research expensed (IAS 38.57)', 'IFRS profit and assets higher while developing; amortisation later'],
        ['Leases (lessee)', 'Finance and operating leases; operating lease cost one straight-line expense, payments operating (ASC 842)', 'One model: depreciation and interest; principal repayments financing (IFRS 16)', 'IFRS usually shows higher operating profit and operating cash flow for the same lease'],
        ['Interest paid; interest and dividends received', 'Operating (ASC 230)', 'Choice under IAS 7; from 2027 financing and investing for most companies (IFRS 18)', 'Same total cash; different operating cash flow'],
        ['Income statement structure', 'Few rules for private companies; Regulation S-X Rule 5-03 for SEC registrants', 'Five categories and two required subtotals from 2027 (IFRS 18)', 'Operating profit defined the same way by every IFRS reporter without a specified main business activity'],
        ['Performance measures', 'Outside the statements, under the SEC’s non-GAAP rules', 'Management-defined performance measures explained and reconciled in a note (IFRS 18)', 'IFRS brings company-specific measures into the audited statements'],
        ['Expense detail', 'Public business entities: note disaggregating expense captions, annual periods beginning after 15 December 2026 (ASU 2024-03)', 'Specified expenses by nature in a note when expenses are presented by function (IFRS 18)', 'More detail about what each expense line contains'],
      ],
    } },

    { h: 'What Lantern uses, and why' },
    { p: 'No regulator tells a US private company which framework to use. The IFRS Foundation’s profile of the United States says a private company can select the framework that fits the purpose of its statements, unless a contract specifies one: US GAAP, full IFRS, or the IFRS for SMEs Accounting Standard, a separate, simpler IASB standard that the American Institute of Certified Public Accountants (AICPA) recognises. Owner-managed businesses that don’t need GAAP statements may also use a special-purpose framework: the cash or modified cash basis, the tax basis, or the AICPA’s Financial Reporting Framework for Small- and Medium-Sized Entities, released in June 2013.' },
    { p: 'Lantern uses US GAAP for the reason F01 gave: its bank and any future investor expect GAAP statements, and can compare them with those of other US businesses. As a private company it may also elect accounting alternatives developed by the <g>Private Company Council</g>. Lantern is not a <g>public business entity</g>, so ASU 2024-03 doesn’t apply to it, and IFRS 18 applies only to companies that report under IFRS.' },
    { callout: 'standards', title: 'Lantern under IFRS in 2026', html: 'If Lantern had prepared its 2026 statements under IFRS, with IFRS 18 applied early, its net income, total assets and increase in cash would be the same. It uses FIFO, has spent nothing on development, owns no property it might revalue, rents its kitchen month by month (a short-term lease under either standard), and its Holiday Blend write-down has not recovered; its equipment would need splitting only if it had significant parts with different lives. Two things would change: the $450 of interest paid would move to financing, and the income statement would show operating profit and profit before financing and income taxes, both $37,716, with the $1,200 of interest expense in the financing category.' },
  ],

  formulas: [
    { id: 'gi-revaluation', name: 'Revaluation surplus and depreciation after revaluation (IAS 16)',
      tex: String.raw`\text{Surplus} = \text{FV} - \text{CA}, \qquad \text{Depreciation} = \dfrac{\text{FV} - \text{Residual value}}{\text{Remaining life}}`,
      where: [
        [String.raw`\text{FV}`, 'Fair value of the asset at the revaluation date', '$'],
        [String.raw`\text{CA}`, 'Carrying amount just before the revaluation (cost less accumulated depreciation)', '$'],
        [String.raw`\text{Residual value}`, 'Expected value at the end of the asset’s use', '$'],
        [String.raw`\text{Remaining life}`, 'Years of use left after the revaluation', 'years'],
      ],
      assumptions: 'The surplus goes to other comprehensive income and equity unless it reverses an earlier revaluation loss on the same asset recognised in profit or loss.',
      note: String.raw`Fairhaven Hotel (fictional): <m>2{,}600{,}000 - 2{,}000{,}000 = 600{,}000</m>; depreciation rises from <m>2{,}000{,}000 \div 20 = 100{,}000</m> to <m>2{,}600{,}000 \div 20 = 130{,}000</m> dollars a year.` },
    { id: 'gi-reval-decrease', name: 'A later fall in value under the revaluation model (IAS 16)',
      tex: String.raw`\text{OCI part} = \min(\text{Decrease},\ \text{Surplus}), \qquad \text{Loss in profit} = \text{Decrease} - \text{OCI part}`,
      where: [
        [String.raw`\text{Decrease}`, 'Carrying amount just before the valuation minus the new fair value', '$'],
        [String.raw`\text{Surplus}`, 'Revaluation surplus still held in equity for the same asset', '$'],
        [String.raw`\text{OCI part}`, 'Part of the decrease taken against the surplus, through other comprehensive income', '$'],
        [String.raw`\text{Loss in profit}`, 'Part of the decrease recognised in profit or loss', '$'],
      ],
      assumptions: 'Only the surplus on the same asset can absorb a decrease. No part of the surplus has been transferred to retained earnings (IAS 16 permits but doesn’t require such transfers).',
      note: String.raw`Fairhaven: <m>\min(740{,}000,\ 600{,}000) = 600{,}000</m> through OCI and <m>740{,}000 - 600{,}000 = 140{,}000</m> in profit or loss.` },
    { id: 'gi-dev-profit', name: 'Profit difference from capitalised development costs',
      tex: String.raw`\Delta \text{Profit}_{\text{IFRS} - \text{US}} = \text{Development capitalised} - \text{Amortisation}`,
      where: [
        [String.raw`\Delta \text{Profit}_{\text{IFRS} - \text{US}}`, 'IFRS profit before tax minus US GAAP profit before tax for the period', '$'],
        [String.raw`\text{Development capitalised}`, 'Development costs recognised as an intangible asset in the period (zero under US GAAP)', '$'],
        [String.raw`\text{Amortisation}`, 'Amortisation of capitalised development costs charged in the period', '$'],
      ],
      assumptions: 'Research costs and development costs incurred before the six criteria were met are expensed under both frameworks.' },
    { id: 'gi-ifrs-to-us', name: 'Restating IFRS profit before tax on a US GAAP basis',
      tex: String.raw`\text{PBT}_{\text{US}} = \text{PBT}_{\text{IFRS}} - \text{DC} + \text{AM} - \text{RV} + \text{XD}`,
      where: [
        [String.raw`\text{PBT}_{\text{IFRS}},\ \text{PBT}_{\text{US}}`, 'Profit before tax under each framework', '$'],
        [String.raw`\text{DC}`, 'Development costs capitalised under IAS 38 in the period', '$'],
        [String.raw`\text{AM}`, 'Amortisation of development costs capitalised earlier', '$'],
        [String.raw`\text{RV}`, 'Reversals of inventory write-downs recognised in the period', '$'],
        [String.raw`\text{XD}`, 'Depreciation on revalued amounts above what cost-based depreciation would be, plus any revaluation losses in profit', '$'],
      ],
      assumptions: 'Only the differences listed; revaluation surpluses go to other comprehensive income and so don’t enter. Classification differences (interest, leases) change subtotals, not profit before tax, except where lease expense patterns differ.',
      note: 'For Lantern in 2026 every term is zero.' },
    { id: 'gi-cfo-ifrs18', name: 'Operating cash flow: from US GAAP to IAS 7 as amended by IFRS 18',
      tex: String.raw`\text{CFO}_{\text{IFRS 18}} = \text{CFO}_{\text{US}} + \text{IP} - \text{IR} - \text{DR}`,
      where: [
        [String.raw`\text{CFO}_{\text{US}}`, 'Cash from operating activities under US GAAP', '$'],
        [String.raw`\text{IP}`, 'Interest paid (moves to financing)', '$'],
        [String.raw`\text{IR}`, 'Interest received (moves to investing)', '$'],
        [String.raw`\text{DR}`, 'Dividends received (move to investing)', '$'],
      ],
      assumptions: 'A company without a specified main business activity and no leases accounted for differently. Dividends paid are financing under both, so they don’t enter.',
      note: String.raw`Lantern, 2026: <m>39{,}940 + 450 - 0 - 0 = 40{,}390</m>.` },
  ],

  examples: [
    { level: 'simple', title: 'A hotel revalued up, then down', fictional: true,
      setup: 'Fairhaven Hotel Ltd, a fictional hotel reporting under IFRS, uses the revaluation model for its building. At the start of year 1 the building is carried at $2,000,000 (cost less accumulated depreciation) with 20 years of use left and no residual value, and is revalued to its fair value of $2,600,000. At the end of year 2 a valuation finds fair value has fallen to $1,600,000. Fairhaven makes no transfers from the surplus to retained earnings. Compare its figures with those of an identical hotel reporting under US GAAP.',
      table: {
        caption: 'Fairhaven Hotel: the building under the two frameworks (fictional, $)',
        head: ['', 'IFRS (revaluation model)', 'US GAAP (cost model)'],
        align: ['l', 'r', 'r'],
        rows: [
          ['Carrying amount, start of year 1', '2,000,000', '2,000,000'],
          ['Revaluation, start of year 1', '+600,000 (OCI)', 'none'],
          ['Depreciation a year, years 1 and 2', '130,000', '100,000'],
          ['Carrying amount, end of year 2, before the valuation', '2,340,000', '1,800,000'],
          ['Fall in fair value to 1,600,000', '600,000 (OCI) and 140,000 (profit)', 'none'],
          ['Carrying amount, end of year 2', '1,600,000', '1,800,000'],
        ],
      },
      steps: [
        String.raw`Start of year 1: the surplus is <m>2{,}600{,}000 - 2{,}000{,}000 = 600{,}000</m>, recognised in other comprehensive income and held in equity as a revaluation surplus. It is not profit.`,
        String.raw`Depreciation is based on the revalued amount: <m>2{,}600{,}000 \div 20 = 130{,}000</m> a year, against <m>2{,}000{,}000 \div 20 = 100{,}000</m> at cost.`,
        String.raw`End of year 2: the carrying amount is <m>2{,}600{,}000 - 2 \times 130{,}000 = 2{,}340{,}000</m>; fair value is 1,600,000, so the decrease is <m>2{,}340{,}000 - 1{,}600{,}000 = 740{,}000</m>.`,
        String.raw`IAS 16 takes the decrease first against the surplus on the same building, 600,000 through other comprehensive income, and the rest, <m>740{,}000 - 600{,}000 = 140{,}000</m>, as a loss in profit or loss.`,
        String.raw`US GAAP: no revaluation entries at all. The building stands at <m>2{,}000{,}000 - 2 \times 100{,}000 = 1{,}800{,}000</m>, and a fall in fair value matters only if an impairment test, met in outline in the long-lived-assets lesson, calls for a write-down.`,
      ],
      answer: 'IFRS: a $600,000 surplus in other comprehensive income in year 1, reversed in year 2; depreciation of $130,000 a year; a $140,000 loss in profit in year 2; carrying amount $1,600,000. US GAAP: depreciation of $100,000 a year and a carrying amount of $1,800,000.',
      interpretation: 'Over the two years Fairhaven’s IFRS profit is $200,000 lower than the US GAAP hotel’s ((130,000 − 100,000) × 2 + 140,000), and its building is carried $200,000 lower. The revaluation brought the building’s value onto the balance sheet in both directions; an analyst comparing the two hotels would read the property note before comparing returns on assets.' },
    { level: 'challenging', title: 'Development costs at a battery-storage company', fictional: true,
      setup: 'Voltmere Energy Inc., a fictional battery-storage installer, spends $180,000 on research for a new home-battery controller from January to April, then $420,000 on development from May to December. Management can demonstrate all six IAS 38 criteria from 1 September; development spending after that date is $300,000. The controller is available for use on 1 January of the next year and will be amortised straight-line over five years with no residual value. Compare the expense and the asset under US GAAP and IFRS for each year.',
      table: {
        caption: 'Voltmere Energy: development project expense by year (fictional, $)',
        head: ['Year', 'US GAAP expense', 'IFRS expense', 'IFRS intangible asset at year end'],
        align: ['l', 'r', 'r', 'r'],
        rows: [
          ['1 (research and development)', '600,000', '300,000', '300,000'],
          ['2', '0', '60,000', '240,000'],
          ['3', '0', '60,000', '180,000'],
          ['4', '0', '60,000', '120,000'],
          ['5', '0', '60,000', '60,000'],
          ['6', '0', '60,000', '0'],
        ],
        foot: [['Total', '600,000', '600,000', '']],
      },
      steps: [
        String.raw`US GAAP (ASC 730): all research and development is expensed as incurred: <m>180{,}000 + 420{,}000 = 600{,}000</m> in year 1.`,
        String.raw`IFRS (IAS 38): research is expensed (180,000), and so is development before the criteria were met, <m>420{,}000 - 300{,}000 = 120{,}000</m>. Year-1 expense: <m>180{,}000 + 120{,}000 = 300{,}000</m>.`,
        'IFRS: the $300,000 spent after 1 September is capitalised as an intangible asset. Spending before that date can’t be capitalised later, even though the criteria are now met.',
        String.raw`IFRS amortisation from year 2: <m>300{,}000 \div 5 = 60{,}000</m> a year for five years; the asset falls to zero by the end of year 6.`,
        String.raw`Year-1 profit before tax is <m>600{,}000 - 300{,}000 = 300{,}000</m> higher under IFRS; in each of years 2 to 6 it is 60,000 lower. Over six years the totals are equal.`,
      ],
      answer: 'Year 1: expense $600,000 under US GAAP, $300,000 under IFRS, with a $300,000 intangible asset. Years 2–6: $60,000 a year of amortisation under IFRS only. Total expense $600,000 under both.',
      interpretation: 'IFRS shifts expense into the years when the controller earns revenue. Voltmere’s IFRS statements show higher profit and assets while the product is being developed, and both depend on management’s judgement about when the criteria were met; US GAAP statements show a bigger loss now and none of that judgement.' },
    { level: 'applied', title: 'Lantern’s 2026 results in the IFRS 18 format', fictional: true,
      setup: 'The investor asks what Lantern’s 2026 results would look like if it reported under IFRS with IFRS 18 applied early. Restate the income statement by category, find the two required subtotals, list the specified expenses by nature Lantern would disclose, and restate the cash flow classification.',
      statement: {
        title: 'Lantern Coffee Co. (illustration)',
        subtitle: 'Statement of profit or loss in the IFRS 18 format, for the ten months ended 31 December 2026',
        sections: [
          { head: 'Operating category', rows: [['Revenue', D.revenue], ['Cost of sales', -D.costOfSales], ['Impairment losses on receivables', -D.badDebt], ['Other operating expenses', -otherOpex]], total: ['Operating profit', D.operatingIncome] },
          { head: 'Investing category', rows: [['Operating profit', D.operatingIncome], ['Income from investments', 0]], total: ['Profit before financing and income taxes', D.operatingIncome] },
          { head: 'Financing category', rows: [['Profit before financing and income taxes', D.operatingIncome], ['Interest expense on notes payable', -D.interestExpense]], total: ['Profit before tax', D.incomeBeforeTax] },
          { head: 'Income taxes category', rows: [['Profit before tax', D.incomeBeforeTax], ['Income tax expense', -D.incomeTax]], total: ['Profit for the period', D.netIncome] },
        ],
        note: 'Fictional figures from the Lantern case. Lantern reports under US GAAP; this layout only illustrates IFRS 18.',
      },
      steps: [
        'Classify: revenue, cost of sales and operating expenses are operating. Lantern sold no equipment in 2026, so there is no gain or loss on disposal to place (under both frameworks it would be operating). Lantern has no investment income, so the investing category is empty. Interest on its two notes payable is financing; income tax has its own category.',
        String.raw`Lines: IFRS 18 (paragraph 75) keeps impairment losses on receivables, measured under IFRS 9, on a line of their own, subject to materiality, so Lantern’s $1,404 of bad debt expense is shown separately and the other operating expenses are <m>66{,}704 - 1{,}404 = 65{,}300</m>.`,
        String.raw`Subtotals: operating profit <m>193{,}320 - 88{,}900 - 1{,}404 - 65{,}300 = 37{,}716</m>; profit before financing and income taxes is the same, 37,716, because nothing is in investing. Then <m>37{,}716 - 1{,}200 = 36{,}516</m> before tax and <m>36{,}516 - 9{,}129 = 27{,}387</m> for the period.`,
        String.raw`Specified expenses by nature (Lantern presents cost of sales by function): employee benefits <m>25{,}200 + 18{,}400 = 43{,}600</m>, of which 25,200 is in cost of services and 18,400 in operating expenses; depreciation 4,800 in operating expenses; inventory write-down 400 in cost of goods sold; no amortisation, and impairment losses only on receivables.`,
        String.raw`Cash flows: interest paid of 450 moves to financing. Operating <m>39{,}940 + 450 = 40{,}390</m>; financing <m>25{,}000 - 450 = 24{,}550</m>; investing unchanged at (22,000). The indirect method now starts from operating profit: <m>37{,}716 + 4{,}800 + 3{,}874 - 6{,}000 = 40{,}390</m>, where 3,874 is the change in operating working capital excluding interest and income taxes payable, and 6,000 is income tax paid.`,
      ],
      answer: 'Operating profit $37,716; profit before financing and income taxes $37,716; profit for the period $27,387, unchanged. Specified expenses by nature: employee benefits $43,600, depreciation $4,800, inventory write-down $400. Operating cash flow $40,390 and financing $24,550 instead of $39,940 and $25,000; the increase in cash is unchanged.',
      interpretation: 'For Lantern, IFRS 18 changes the frame, not the figures: profit, assets and cash are the same, and its operating income already excludes interest and tax, as IFRS 18’s operating profit does. For a company with investment income, interest received, long leases or several “adjusted” profit measures, the new categories and the management-defined performance measure note change much more of what a reader sees.' },
  ],

  demo: [
    { widget: 'gi-dev', intro: 'A development project under the two frameworks. Change the spending before and after the IAS 38 criteria are met and the amortisation period, and compare the cumulative expense year by year: the lines start apart and meet when the asset is fully amortised.' },
    { widget: 'gi-reval', intro: 'A building under the revaluation model and the cost model. Set the first revaluation, the years until the next valuation and the later fair value, and see how much of each change goes through other comprehensive income and how much through profit.' },
    { widget: 'gi-cash', intro: 'Lantern’s 2026 cash flows by activity under US GAAP and under IAS 7 as amended by IFRS 18. The only difference is where the $450 of interest paid sits.' },
  ],

  mistakes: [
    { title: '“A revaluation gain is profit.”', html: 'Under IAS 16 a revaluation increase goes to other comprehensive income and builds up a revaluation surplus in equity; it reaches profit only to the extent that it reverses an earlier revaluation loss recognised in profit or loss. It does raise later depreciation, which lowers future profit.' },
    { title: '“A fall in a revalued asset’s value always goes to profit.”', html: 'Under IAS 16 the decrease is first taken against any revaluation surplus on the same asset, through other comprehensive income; only the excess is a loss in profit. Fairhaven’s $740,000 decrease cost its profit only $140,000.' },
    { title: '“IFRS capitalises research and development.”', html: 'IAS 38 never capitalises research. Development costs are capitalised only from the point at which all six criteria are demonstrated; earlier development spending stays in expense and can’t be capitalised later. US GAAP expenses both, apart from software to be sold.' },
    { title: '“IFRS 18 changes how much profit a company makes.”', html: 'IFRS 18 is about presentation and disclosure. It reorganises the income statement into categories, requires two subtotals and adds notes; Lantern’s profit for the period would still be $27,387. What changes is what the subtotals mean and where items such as interest are shown.' },
    { title: '“ASU 2024-03 is the US version of IFRS 18.”', html: 'ASU 2024-03 adds a note disaggregating expense captions for public business entities. It requires no new categories or subtotals on the face of the income statement and has nothing on management-defined performance measures, which in the United States stay outside the statements under the SEC’s non-GAAP rules.' },
    { title: '“Leases are off the balance sheet under US GAAP.”', html: 'Under ASC 842 operating leases longer than 12 months are on the balance sheet too, as a right-of-use asset and a lease liability. The difference from IFRS 16 is the expense pattern and the cash-flow classification: a single straight-line cost and operating cash flows under ASC 842, depreciation, interest and financing repayments under IFRS 16.' },
  ],

  application: [
    { p: 'Return to the investor’s claim. Suppose he wants to compare Lantern’s results with Aldgate Coffee plc’s, and Aldgate reports under IFRS with IFRS 18 from 2027. A careful analyst doesn’t compare headline figures until the frameworks’ differences have been dealt with, and she works through them in the order of the comparison table, asking each time whether the difference changes profit, assets and equity, or only a subtotal.' },
    { p: 'Cash flows come first. Aldgate will classify interest paid as financing, so she moves Lantern’s $450 there too, or moves Aldgate’s interest back, so that both are measured the same way. If Aldgate leases its cafés for several years at a time, IFRS 16 also puts the principal part of its rent in financing, so she reads the lease note before comparing operating cash flows or operating profit.' },
    { p: 'Then profit. Aldgate can’t use LIFO and Lantern doesn’t, so no adjustment is needed there. If Aldgate has capitalised development costs, for a new cold-brew line say, its profit is higher this year than US GAAP would allow, and the intangible assets note shows how much was capitalised and how much amortised; if it reversed an inventory write-down, the inventory note says so. With those amounts she can restate Aldgate’s profit before tax on a US GAAP basis.' },
    { p: 'Then assets and equity. If Aldgate revalues its roastery, its equity includes a revaluation surplus and its depreciation is based on fair value, so any ratio built on assets or equity will differ from a cost-based company’s for the same business; F03 covers those ratios. Finally the subtotals: from 2027 Aldgate’s operating profit is defined by IFRS 18, and any “adjusted” profit its managers quote is reconciled in a note. Lantern’s multi-step income statement has an operating income line too, but US GAAP doesn’t define it, so the analyst checks what Lantern included: for Lantern, operating income of $37,716 contains everything except interest and tax, the same boundary IFRS 18 would draw.' },
    { p: 'The conclusion for Ana: the investor is right that the frameworks differ, but for a business like Lantern’s the differences are few, identifiable and measurable, and none of them changes its 2026 net income. The analyst’s work is to find them, adjust for them and say which she couldn’t adjust for, which is the same discipline a preparer applies when checking that statements articulate.' },
  ],

  summary: [
    'The FASB writes US GAAP, which the SEC requires of US public companies; the IASB writes IFRS, required in more than 140 jurisdictions. The 2002 Norwalk Agreement led to joint standards such as IFRS 15 and Topic 606 (May 2014), but many differences remain.',
    'Differences change profit (LIFO, write-down reversals, development costs, components), assets and equity without profit (an upward revaluation), or only presentation (cash-flow classification, IFRS 18 subtotals); leases do some of each.',
    'Under IAS 16 a revaluation increase goes to other comprehensive income, and a later decrease is taken first against that surplus and only then to profit; US GAAP stays at cost.',
    'Development costs are expensed under ASC 730 but capitalised under IAS 38 once six criteria are met; total expense over a project’s life is the same, only its timing differs.',
    'Cash flows: IFRS 18 amends IAS 7 so most companies show interest and dividends paid as financing and those received as investing, and IFRS 16 puts lease principal in financing. Lantern’s operating cash flow would be $40,390 instead of $39,940.',
    'IFRS 18 (issued April 2024; annual periods beginning on or after 1 January 2027) adds five categories, two required subtotals and a note on management-defined performance measures; ASU 2024-03 (November 2024; public business entities, annual periods beginning after 15 December 2026) adds a note disaggregating expenses.',
    'A US private company chooses its framework; Lantern uses US GAAP because its bank and investors expect it, and neither ASU 2024-03 nor IFRS 18 applies to it.',
  ],

  glossary: [
    { term: 'Convergence', def: 'The effort by the FASB and the IASB, formalised in the 2002 Norwalk Agreement, to remove differences between US GAAP and IFRS and to coordinate their future standards.' },
    { term: 'Foreign private issuer', def: 'A company incorporated outside the United States that meets the SEC’s tests for foreign status (broadly, no more than half its voting shares held by US residents or, if more, management, assets and administration not mainly in the United States). Since 2007 the SEC has accepted its IFRS statements without reconciliation to US GAAP.' },
    { term: 'Other comprehensive income', def: 'Income and expenses that accounting standards require to be reported outside profit or loss and accumulated in a separate part of equity, such as revaluation increases on property under IAS 16.' },
    { term: 'Management-defined performance measure', def: 'Under IFRS 18, a subtotal of income and expenses that a company uses in public communications outside its financial statements to convey management’s view of its performance, and that IFRS does not itself specify. It must be explained and reconciled in a note.' },
    { term: 'Public business entity', def: 'A US GAAP term for a business that meets any of five criteria, such as filing financial statements with the SEC or having securities traded, listed or quoted on an exchange or an over-the-counter market. Some standards, such as ASU 2024-03, apply only to public business entities.' },
    { term: 'Private Company Council', def: 'The body set up in 2012 by the Financial Accounting Foundation, which oversees the FASB, as the FASB’s main advisory body on private-company matters. It develops accounting alternatives that private companies may elect, subject to the FASB’s endorsement.' },
  ],

  references: [
    { text: 'IFRS Foundation (2024). <i>Project Summary: IFRS 18 Presentation and Disclosure in Financial Statements</i>, April 2024 (categories, required subtotals, management-defined performance measures, specified expenses by nature, IAS 7 amendments, effective date).', url: 'https://www.ifrs.org/content/dam/ifrs/project/primary-financial-statements/ifrs-standard/projectsummary-ifrs18-april2024.pdf', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2024). <i>Accounting Standards Update No. 2024-03, Income Statement—Reporting Comprehensive Income—Expense Disaggregation Disclosures (Subtopic 220-40)</i>, November 2024.', url: 'https://storage.fasb.org/ASU%202024-03.pdf', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2025). <i>Accounting Standards Update No. 2025-01, Income Statement—Reporting Comprehensive Income—Expense Disaggregation Disclosures (Subtopic 220-40): Clarifying the Effective Date</i>, January 2025.', url: 'https://storage.fasb.org/ASU%202025-01.pdf', checked: '2026-10-23' },
    { text: 'Financial Accounting Standards Board (2015). <i>Accounting Standards Update No. 2015-11, Inventory (Topic 330): Simplifying the Measurement of Inventory</i>, July 2015 (including the interim-period exception for recoveries).', url: 'https://storage.fasb.org/ASU%202015-11.pdf', checked: '2026-10-23' },
    { text: 'Deloitte. <i>Roadmap: Comparing IFRS Accounting Standards and U.S. GAAP: Bridging the Differences</i>, sections 1.4 Inventories, 1.5 Intangible Assets, 1.6 Property, Plant, and Equipment, 4.3 Statement of Cash Flows and 5.7 Leases. DART (2026).', url: 'https://dart.deloitte.com/USDART/home/publications/deloitte/additional-deloitte-guidance/roadmap-ifrs-us-gaap-comparison', checked: '2026-10-23' },
    { text: 'IAS 38 <i>Intangible Assets</i>, paragraph 71, as reproduced in Australian Accounting Standards Board, <i>AASB 138 Intangible Assets</i>, paragraph 71, “Recognition of an expense”.', url: 'https://standards.aasb.gov.au/node/954', checked: '2026-10-23' },
    { text: 'Internal Revenue Service, Large Business and International Division. <i>Adopting LIFO</i>, concept unit COR-C-014 (last updated 12 May 2020), on the LIFO conformity requirement.', url: 'https://www.irs.gov/pub/fatca/int_practice_units/cor_c_014.pdf', checked: '2026-10-23' },
    { text: 'US Securities and Exchange Commission, Division of Corporation Finance. <i>Non-GAAP Financial Measures</i>, Compliance and Disclosure Interpretations (last updated 13 December 2022).', url: 'https://www.sec.gov/divisions/corpfin/guidance/nongaapinterp.htm', checked: '2026-10-23' },
    { text: 'FASB and IASB (2002). <i>Memorandum of Understanding: “The Norwalk Agreement”</i>, 18 September 2002.', url: 'https://www.ifrs.org/content/dam/ifrs/around-the-world/mous/norwalk-agreement-2002.pdf', checked: '2026-10-23' },
    { text: 'IFRS Foundation. <i>Use of IFRS Accounting Standards by jurisdiction: United States</i> (profile last updated 4 April 2025).', url: 'https://www.ifrs.org/content/ifrs/home/use-around-the-world/use-of-ifrs-standards-by-jurisdiction/view-jurisdiction.html/united-states', checked: '2026-10-23' },
  ],

  checks: [
    // House Blend costing
    { what: 'LIFO COGS', value: COSTING.lifo.cogs, shown: 22920 },
    { what: 'FIFO COGS', value: COSTING.fifo.cogs, shown: 22560 },
    { what: 'Gross profit difference', value: COSTING.lifo.cogs - COSTING.fifo.cogs, shown: 360 },
    { what: 'Tax rate (%)', value: t * 100, shown: 25 },
    { what: 'LIFO tax saving', value: t * (COSTING.lifo.cogs - COSTING.fifo.cogs), shown: 90 },
    // components
    { what: 'Equipment cost split', value: machine + grinder, shown: F.equipment.cost },
    { what: 'Equipment cost', value: F.equipment.cost, shown: 12000 },
    { what: 'Componentised ten months', value: compMonthly * F.equipment.months, shown: 2400 },
    { what: 'Single unit ten months', value: bal('Accumulated Depreciation—Equipment'), shown: 2000 },
    // cash flows and leases
    { what: 'Interest paid', value: D.interestPaid, shown: 450 },
    { what: 'CFO US GAAP', value: D.cfo, shown: 39940 },
    { what: 'CFO IFRS 18', value: cfoIfrs, shown: 40390 },
    { what: 'CFF US GAAP', value: D.cff, shown: 25000 },
    { what: 'CFF IFRS 18', value: cffIfrs, shown: 24550 },
    { what: 'CFI', value: D.cfi, shown: -22000 },
    { what: 'Increase in cash', value: cfoIfrs + D.cfi + cffIfrs, shown: 42940 },
    { what: 'Increase in cash (case)', value: D.netCash, shown: 42940 },
    { what: 'Kitchen rent a month', value: F.rent.monthly, shown: 1200 },
    // IFRS 18 income statement
    { what: 'Revenue', value: D.revenue, shown: 193320 },
    { what: 'Cost of sales', value: D.costOfSales, shown: 88900 },
    { what: 'Operating expenses', value: D.operatingExpenses, shown: 66704 },
    { what: 'Bad debt expense', value: D.badDebt, shown: 1404 },
    { what: 'Other operating expenses', value: otherOpex, shown: 65300 },
    { what: 'Operating profit', value: D.revenue - D.costOfSales - D.badDebt - otherOpex, shown: 37716 },
    { what: 'Operating income (case)', value: D.operatingIncome, shown: 37716 },
    { what: 'Interest expense', value: D.interestExpense, shown: 1200 },
    { what: 'Profit before tax', value: D.operatingIncome - D.interestExpense, shown: 36516 },
    { what: 'Income tax', value: D.incomeTax, shown: 9129 },
    { what: 'Profit for the period', value: D.incomeBeforeTax - D.incomeTax, shown: 27387 },
    { what: 'Net income (case)', value: D.netIncome, shown: 27387 },
    { what: 'Employee benefits', value: employees, shown: 43600 },
    { what: 'Event wages', value: F.wages.events, shown: 25200 },
    { what: 'Shop and office wages', value: bal('Wages Expense'), shown: 18400 },
    { what: 'Depreciation', value: D.depreciation, shown: 4800 },
    { what: 'Inventory write-down', value: F.inventory.holidayBlend.cost - F.inventory.holidayBlend.nrv, shown: 400 },
    { what: 'Working capital excl. interest and tax', value: wcExFin, shown: 3874 },
    { what: 'Tax paid', value: D.incomeTaxesPaid, shown: 6000 },
    { what: 'Indirect from operating profit', value: D.operatingIncome + D.depreciation + wcExFin - D.incomeTaxesPaid, shown: 40390 },
    // Voltmere
    { what: 'Voltmere development total', value: V.devBefore + V.devAfter, shown: 420000 },
    { what: 'Voltmere US expense', value: vUs, shown: 600000 },
    { what: 'Voltmere dev before criteria', value: 420000 - V.devAfter, shown: 120000 },
    { what: 'Voltmere IFRS expense year 1', value: vIfrs, shown: 300000 },
    { what: 'Voltmere capitalised', value: V.devAfter, shown: 300000 },
    { what: 'Voltmere amortisation', value: vAmort, shown: 60000 },
    { what: 'Voltmere year-1 difference', value: vUs - vIfrs, shown: 300000 },
    { what: 'Voltmere asset end year 2', value: V.devAfter - vAmort, shown: 240000 },
    { what: 'Voltmere asset end year 3', value: V.devAfter - 2 * vAmort, shown: 180000 },
    { what: 'Voltmere asset end year 4', value: V.devAfter - 3 * vAmort, shown: 120000 },
    { what: 'Voltmere asset end year 5', value: V.devAfter - 4 * vAmort, shown: 60000 },
    { what: 'Voltmere asset end year 6', value: V.devAfter - 5 * vAmort, shown: 0 },
    { what: 'Voltmere IFRS total', value: vIfrs + V.life * vAmort, shown: 600000 },
    // Fairhaven
    { what: 'Fairhaven surplus', value: fhSurplus, shown: 600000 },
    { what: 'Fairhaven depreciation at cost', value: fhDepCost, shown: 100000 },
    { what: 'Fairhaven depreciation after revaluation', value: fhDepRev, shown: 130000 },
    { what: 'Fairhaven carrying before valuation', value: fhCarry2, shown: 2340000 },
    { what: 'Fairhaven decrease', value: fhDecrease, shown: 740000 },
    { what: 'Fairhaven OCI part', value: fhToOci, shown: 600000 },
    { what: 'Fairhaven loss in profit', value: fhToPl, shown: 140000 },
    { what: 'Fairhaven US carrying', value: fhUs, shown: 1800000 },
    { what: 'Fairhaven two-year profit difference', value: (fhDepRev - fhDepCost) * FH.years + fhToPl, shown: 200000 },
    { what: 'Fairhaven carrying difference', value: fhUs - FH.fv2, shown: 200000 },
  ],
};
