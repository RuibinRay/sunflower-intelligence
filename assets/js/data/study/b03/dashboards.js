// dashboards.js — B03 · Dashboards. Content only; exercises are in dashboards.ex.js.
// The worked dashboard is Lantern's 2026 catering business, built from EVENTS (case.js); Ana's monthly revenue plan
// (PLAN in dashboards.ex.js) and her 50% ceiling on the top-four client share are fictional and introduced here.
// F02's catering revenue is used as a reconciliation total. The shop dashboard is the project's and is not used.
import { EVENTS, EVENT_COLUMNS, DERIVED as D } from './case.js';
import { FACTS as F02 } from '../f02/case.js';
import { MONTHS, PLAN, BY_MONTH } from './dashboards.ex.js';

const col = (n) => EVENTS.map((r) => r[EVENT_COLUMNS.indexOf(n)]);
const inv = col('invoice'), types = col('event_type'), clients = col('client'), dates = col('event_date');
const sum = (a) => a.reduce((t, x) => t + x, 0);
const total = sum(inv);
const rev = BY_MONTH.map((m) => m.revenue), cnt = BY_MONTH.map((m) => m.events);
const avg = BY_MONTH.map((m) => m.revenue / m.events);
const byType = {}; types.forEach((t, k) => { byType[t] = (byType[t] || 0) + inv[k]; });
const nType = {}; types.forEach((t) => { nType[t] = (nType[t] || 0) + 1; });
const byClient = {}; const nClient = {}; clients.forEach((c, k) => { byClient[c] = (byClient[c] || 0) + inv[k]; nClient[c] = (nClient[c] || 0) + 1; });
const ranked = Object.entries(byClient).sort((a, b) => b[1] - a[1]);
const top4 = sum(ranked.slice(0, 4).map((x) => x[1]));
const decClients = new Set(clients.filter((_, k) => dates[k].startsWith('2026-12'))).size;
const conf = EVENTS.find((r) => r[EVENT_COLUMNS.indexOf('days')] === 2);
const mean = (a) => sum(a) / a.length;

// the wireframe's bars, drawn to scale from the data (1 px = $100)
const bars = MONTHS.map((m, i) => {
  const x = 40 + 42 * i, h = rev[i] / 100, p = 300 - PLAN[i] / 100;
  return `<rect x="${x}" y="${(300 - h).toFixed(1)}" width="26" height="${h.toFixed(1)}" fill="var(--series-1)"/><line x1="${x - 4}" y1="${p}" x2="${x + 30}" y2="${p}" stroke="var(--ink)" stroke-width="2.5"/><text x="${x + 13}" y="316" text-anchor="middle" font-size="10" fill="var(--ink-3)">${m}</text>`;
}).join('');
const TYPES = Object.entries(byType).sort((a, b) => b[1] - a[1]);
const typeBars = TYPES.map(([t, v], i) => {
  const y = 172 + 24 * i, w = v / TYPES[0][1] * 110;
  return `<text x="558" y="${y + 12}" text-anchor="end" font-size="11">${t}</text><rect x="566" y="${y}" width="${w.toFixed(1)}" height="16" fill="var(--series-2)"/><text x="${(570 + w).toFixed(1)}" y="${y + 12}" font-size="11">$${v.toLocaleString('en-US')}</text>`;
}).join('');
const clientRows = ranked.slice(0, 4).map(([c, v], i) => `<text x="24" y="${372 + 18 * i}">${c.replace('&', '&amp;')}</text><text x="270" y="${372 + 18 * i}" text-anchor="end">$${v.toLocaleString('en-US')}</text><text x="350" y="${372 + 18 * i}" text-anchor="end" fill="var(--ink-3)">${nClient[c]} events</text>`).join('');
const tile = (x, label, value, cmp) => `<rect x="${x}" y="50" width="166" height="78" rx="6" fill="none" stroke="var(--rule-strong)"/><text x="${x + 12}" y="70" font-size="11" fill="var(--ink-3)">${label}</text><text x="${x + 12}" y="98" font-size="22" font-weight="bold">${value}</text><text x="${x + 12}" y="118" font-size="11">${cmp}</text>`;
const WIREFRAME = `<svg viewBox="0 0 760 470" xmlns="http://www.w3.org/2000/svg" font-size="12" fill="currentColor"><rect x="8" y="8" width="744" height="454" rx="8" fill="none" stroke="var(--rule-strong)" stroke-width="1.5"/><text x="24" y="34" font-size="15" font-weight="bold">Lantern catering: December 2026</text><text x="736" y="34" text-anchor="end" font-size="11" fill="var(--ink-3)">Month: Dec 2026 (drop-down) · data refreshed 4 Jan 2027</text>${tile(24, 'Revenue', '$10,120', 'Plan $11,000: 92%, below')}${tile(206, 'Events', '13', 'November 11: up 2')}${tile(388, 'Average invoice', '$778', 'November $799: down 3%')}${tile(570, 'Revenue, year to date', '$62,320', 'Plan $60,000: 104%, above')}<text x="24" y="160" font-weight="bold">Revenue by month against plan</text><rect x="300" y="151" width="10" height="10" fill="var(--series-1)"/><text x="314" y="160" font-size="11">revenue</text><line x1="370" y1="156" x2="390" y2="156" stroke="var(--ink)" stroke-width="2.5"/><text x="394" y="160" font-size="11">plan</text><line x1="34" y1="200" x2="450" y2="200" stroke="var(--rule-strong)" stroke-dasharray="2 3"/><text x="36" y="196" font-size="9" fill="var(--ink-3)">$10,000</text><line x1="34" y1="300" x2="450" y2="300" stroke="var(--ink-3)"/><text x="36" y="296" font-size="9" fill="var(--ink-3)">$0</text>${bars}<text x="488" y="160" font-weight="bold">Revenue by event type, 2026</text>${typeBars}<line x1="20" y1="330" x2="740" y2="330" stroke="var(--rule-strong)"/><text x="24" y="352" font-weight="bold">Top clients, 2026</text>${clientRows}<text x="24" y="448" font-size="11">Top four: 47% of revenue (ceiling 50%)</text><text x="488" y="352" font-weight="bold">Notes</text><text x="488" y="372" font-size="11">Revenue: invoices by event date</text><text x="488" y="390" font-size="11">Source: Events table, 76 events</text><text x="488" y="408" font-size="11">Period: 12 Mar to 24 Dec 2026</text><text x="488" y="426" font-size="11">Check: months and types total $62,320: OK</text></svg>`;

export default {
  slug: 'dashboards',
  title: 'Dashboards that answer questions',
  blurb: 'A dashboard is one page that tells its readers where things stand. Learn to start from the audience’s questions, give every number a comparison, lay the page out so the most important measure comes first, build it on tables, formulas and PivotTables so it refreshes, and add the documentation and checks that make it trustworthy.',
  status: 'reviewed',
  objectives: [
    'Identify a dashboard’s audience and questions, and choose the measures that answer them, each with a definition, a comparison and an owner.',
    'Design a one-page layout that puts the most important measure first, with consistent scales, formats and labels and a fitting display for each question.',
    'Build dashboard figures with SUMIFS, COUNTIFS, AVERAGEIFS and XLOOKUP driven by a drop-down cell, and with PivotTables, slicers and timelines on one table of data.',
    'Document a dashboard’s sources, definitions and refresh date, and add reconciliation checks that prove it agrees with its data.',
    'Evaluate a dashboard for common failures and accessibility problems, and plan how it is shared and kept under version control.',
  ],
  prerequisites: [
    { lesson: 'b01/kpis', why: 'A dashboard shows KPIs, each with a formula, a target, a direction and an owner, written down in a KPI dictionary.' },
    { lesson: 'b03/conditional-sums-and-counts', why: 'The tiles are SUMIFS, COUNTIFS and AVERAGEIFS with date windows.' },
    { lesson: 'b03/pivot-tables', why: 'The charts are built on PivotTables, which must be refreshed when the data change.' },
    { lesson: 'b03/charts-and-conditional-formatting', why: 'Each question on the page needs the chart that answers it, drawn honestly.' },
    { lesson: 'b03/tables-and-cleaning', why: 'An Excel table that grows with the data, and data validation lists, are the dashboard’s foundations.' },
  ],
  case: 'lantern',

  concept: [
    { case: `It is the first working day of January 2027. Lantern’s catering business held ${D.events} events in 2026 and invoiced $${total.toLocaleString('en-US')} for them, from ${D.clients} clients. Ana Lim reviews catering every month, and Lantern’s accountant looks at it every quarter. Until now each review has begun with an hour of filtering the events list. Ana wants one page that answers her standing questions as soon as she opens it, refreshes from the events list in minutes, and is trustworthy enough to send to the accountant.` },

    { h: 'A dashboard answers someone’s questions' },
    { p: 'B01 defined a <g>dashboard</g> as a single screen or page showing a small set of KPIs, each with its current value, target, comparison and trend, for the people who act on them. Stephen Few, a consultant who has written widely on dashboard design, described it as a “single-screen display of the most important information needed to do a job”. The words that matter are <i>most important</i> and <i>a job</i>: a dashboard is designed for particular readers and the decisions they make, not to show everything the data contain.' },
    { p: 'So design starts with the audience and their questions, not with the data. Ana decides staffing, pricing and which clients to chase; the accountant checks that catering is on plan and that the figures agree with the books. Their standing questions are:' },
    { ol: [
      'Are we on plan this month, and for the year so far?',
      'Is the business growing from month to month?',
      'What kinds of event bring in the revenue?',
      'Is the typical job holding its size?',
      'How much do we depend on a few clients?',
    ] },

    { h: 'From questions to measures' },
    { p: 'Each question becomes a measure, and each measure is written down with its exact definition, the comparison that gives it meaning and its owner, in the <g>key performance indicator</g> dictionary that B01 introduced. Writing the definitions forces decisions: is revenue counted when an event happens or when it is invoiced? Which month does Meridian Partners’ two-day conference belong to?' },
    { table: {
      caption: 'Ana’s catering dashboard: measures and definitions (fictional plan and ceiling)',
      head: ['Measure', 'Definition', 'Compared with', 'Owner'],
      rows: [
        ['Revenue', 'Sum of invoices for events held in the month; a two-day event counts in the month it starts', 'The month’s plan; last month', 'Ana'],
        ['Events', 'Number of events held in the month', 'Last month', 'Ana'],
        ['Average invoice', 'Revenue ÷ events for the month', 'Last month; the year so far', 'Ana'],
        ['Revenue by event type', 'Sum of invoices by type, <g>year to date</g>', 'Share of the year’s revenue', 'Ana'],
        ['Top-four client share', 'Revenue from the four largest clients ÷ total revenue, year to date', 'A ceiling of 50%', 'Ana'],
        ['Revenue, year to date', 'Sum of invoices since March 2026', 'Plan to date', 'The accountant'],
      ],
    } },
    { p: 'The last measure but one deserves a word. <g>Client concentration</g> is the share of revenue that comes from the largest few clients. In 2026 Lantern’s top four clients brought in $29,420 of the $62,320, 47.2%: the loss of one of them would hurt. Ana sets a ceiling of 50%, a guardrail in B01’s sense, which the dashboard watches.' },

    { h: 'A number needs a comparison' },
    { p: 'Few’s blunt test for any number on a dashboard is “compared to what?”. A tile reading “Revenue $10,120” can’t be judged on its own. Three comparisons are standard: a target or plan, the previous period, and the same period last year, which removes the seasons. Each is a <g>baseline</g> in B01’s sense. Lantern began catering in March 2026, so it has no last year yet; its plan and the previous month have to do.' },
    { p: 'With them, December’s figure tells a story: $10,120 was the best month of the year, $1,330 more than November, yet $880 below the month’s plan of $11,000 (92.0%). Show the comparison as a gap or a share, as B01’s KPI lesson did, and say which way is good in words, not only in colour.' },

    { h: 'Layout: the most important first' },
    { p: 'Readers of left-to-right languages start at the top left, and many stop once they have what they came for. Put the headline numbers there, the explanations below, and the detail last. The UK Government Analysis Function’s guidance calls this an inverted pyramid, “with your most important headline content up front”, and asks dashboards to minimise scrolling. Ordering a page by position, size and emphasis in this way is its <g>visual hierarchy</g>.' },
    { figure: {
      svg: WIREFRAME,
      caption: 'Ana’s catering dashboard for December 2026, as a wireframe. Headline tiles first, then the trend and the mix, then the detail and the notes. The bars are drawn to scale from the events data.',
      alt: 'A one-page dashboard titled Lantern catering: December 2026, with the month chosen from a drop-down and the note that the data were refreshed on 4 January 2027. Across the top, four tiles: Revenue $10,120, against a plan of $11,000, 92%, below; Events 13, against 11 in November, up 2; Average invoice $778, against $799 in November, down 3%; Revenue year to date $62,320, against a plan of $60,000, 104%, above. Below, on the left, a column chart of revenue by month from March to December with a short horizontal mark for each month’s plan: the bars are low from April to August, rise from September and are highest in December, which sits just under its plan mark. On the right, a horizontal bar chart of revenue by event type in 2026, sorted: Meeting $18,200, Conference $14,540, Breakfast $12,060, Team day $8,830 and Launch $8,690. At the bottom left, a table of the top clients: Meridian Partners $9,000 from 8 events, Harbor Tech $8,130 from 11, Orchard Row Clinic $6,210 from 8 and Pier Nine Studio $6,080 from 8, with the note that the top four bring 47% of revenue against a ceiling of 50%. At the bottom right, notes: revenue means invoices by event date; source, the Events table of 76 events; period 12 March to 24 December 2026; and a check that the months and the types both total $62,320, marked OK.',
    } },
    { p: 'Read the wireframe in its own order. The tiles answer “are we on plan?” in a second; the column chart answers “is it growing?” and shows the quiet summer; the type bars and the client table answer the questions about mix and dependence. The notes say what the numbers mean, where they came from and whether they add up. Nothing on the page is there for decoration.' },
    { callout: 'key', title: 'One page, few measures, every number with a comparison', html: 'Choose the handful of measures the readers act on, give each a comparison, put the most important first, and leave everything else in the workbook behind the page.' },
  ],

  theory: [
    { h: 'A display for each question' },
    { p: 'The charts lesson matched charts to questions; a dashboard applies that rule to a whole page.' },
    { list: [
      '<b>Headline measures</b> are tiles: the number, its comparison, and a word or symbol for the direction (“below plan”, ▼). Use the same layout and format for every tile.',
      '<b>Trends</b> are columns or a line along a time axis. Monthly revenue against plan suits columns with the plan as a marker, so the bars stay the main message; columns start at zero.',
      '<b>Composition and ranking</b> are sorted bars. Five event types compare far better as bars than as slices; keep pies, if at all, for two or three parts of a whole.',
      '<b>A few items with details</b>, such as top clients with their revenue and events, are a small sorted table, with the rest grouped as “others” if they are shown at all.',
    ] },
    { p: 'Avoid what spends space without informing. Gauges and dials take room for one number and add no comparison of their own; 3-D effects distort sizes; a second vertical axis invites false comparisons; and decoration such as shading, pictures and borders competes with the data. Few’s review of failed dashboards singles out gauges and decoration in the same way.' },
    { p: 'Keep everything consistent so that differences mean something. One money format throughout (whole dollars on a summary page), one colour for revenue in every chart, the event types always in the same order, and the same axis range for charts that are meant to be compared side by side. A reader who has to work out each chart afresh will misread one of them.' },

    { h: 'Building it so it refreshes' },
    { p: 'A dashboard that takes an hour to update will be out of date. Build it in three layers: the data, untouched, in one <g>Excel table</g> (Events) that grows as rows are added; the calculations, as formulas and <g>PivotTables</g> that read the table; and the page, which only displays results. When January’s events are added, formulas that refer to the table’s columns pick them up at once, and PivotTables pick them up when they are refreshed (the PivotTables lesson shows how).' },
    { p: 'The tiles are formulas driven by one input cell, the month the reader chooses. Each formula reads the month from that cell and builds a date window from it, so a single change updates the whole page:' },
    { table: {
      caption: 'The tile formulas (events in A2:D35: date, client, type, invoice; plan in G2:H4; revenue by month in G7:H9)',
      head: ['Cell', 'Shows', 'Formula'],
      rows: [
        ['F1', 'Month chosen (drop-down: October, November or December)', '12'],
        ['F2', 'First day of that month', '<x>=DATE(2026,F1,1)</x>'],
        ['F3', 'Revenue', '<x>=SUMIFS($D$2:$D$35,$A$2:$A$35,">="&F2,$A$2:$A$35,"<="&EOMONTH(F2,0))</x>'],
        ['F4', 'Events', '<x>=COUNTIFS($A$2:$A$35,">="&F2,$A$2:$A$35,"<="&EOMONTH(F2,0))</x>'],
        ['F5', 'Average invoice', '<x>=F3/F4</x>'],
        ['F6', 'Plan', '<x>=XLOOKUP(F2,G2:G4,H2:H4)</x>'],
        ['F7', 'Revenue less plan', '<x>=F3-F6</x>'],
        ['F8', 'Share of plan', '<x>=F3/F6</x>'],
        ['F9', 'Largest invoice', '<x>=MAXIFS($D$2:$D$35,$A$2:$A$35,">="&F2,$A$2:$A$35,"<="&EOMONTH(F2,0))</x>'],
        ['H7', 'Revenue for the month in G7 (filled to H9)', '<x>=SUMIFS($D$2:$D$35,$A$2:$A$35,">="&G7,$A$2:$A$35,"<="&EOMONTH(G7,0))</x>'],
        ['F10', 'Check: the months add up to the data', '<x>=IF(ROUND(SUM(H7:H9)-SUM(D2:D35),2)=0,"OK","CHECK")</x>'],
      ],
      note: 'In the full workbook the ranges are the table’s columns, such as Events[invoice], so they grow with the data. The third widget under Explore is this sheet.',
    } },
    { p: 'The average invoice is the month’s revenue divided by its events, not an average of other averages; the challenging example shows why. The charts sit on PivotTables built from the same table, so every figure on the page comes from one source.' },

    { h: 'Interactivity: drop-downs, slicers and timelines' },
    { p: 'A <g>drop-down list</g> lets the reader choose what the formulas show without typing. In Excel it is <g>data validation</g>: select the cell, then Data › Data Validation, set Allow to List and give the Source. If the list itself is an Excel table, the drop-down updates as items are added or removed. The Error Alert tab’s Stop style refuses anything typed that isn’t on the list, so a reader can’t type a month the formulas can’t read (pasted values still get through, as the tables lesson warns).' },
    { p: 'A <g>slicer</g> is a panel of buttons that filters a table or a PivotTable and shows which items are selected. Click inside the table or PivotTable and choose Insert › Slicer; select one item or several, and use Clear Filter to show them all again. One slicer can drive several PivotTables through <b>Report Connections</b>, but only PivotTables that share the same data source, which is another reason to build them all on one table. A <g>timeline</g> does the same job for dates in PivotTables: a slider that selects years, quarters, months or days (PivotTable Analyze › Insert Timeline).' },
    { callout: 'warn', title: 'Filters and formulas don’t talk to each other', html: 'A slicer on a table hides the rows it filters out. SUBTOTAL, which a table’s total row uses, ignores those rows; SUMIFS, COUNTIFS and the rest do not, and go on adding every row that meets their own criteria. A page that mixes slicer-filtered charts with SUMIFS tiles can show two answers to the same question. Choose one mechanism for each part of the page, or put the slicer’s choice into the formulas as a criterion.' },

    { h: 'Documentation and checks' },
    { p: 'A dashboard is trusted only if its readers know what the numbers mean and can see that they add up. A short notes panel does the first job: the source and how it was extracted; the period covered (the Analysis Function’s guidance is to make the dates always clear); the date the data were refreshed, typed in when it happens rather than calculated with TODAY(), which would show the date the file was opened; the definitions, or a link to the KPI dictionary; and the owner. When something changes, a dated change note says what and why.' },
    { p: String.raw`A <g>reconciliation check</g> does the second. It compares a total on the page with the same total computed another way and flags any difference: the ten monthly revenues (March to December, in J2:J11) should add up to the total of the Events table, so should the five event types, and both should match the $62,320 of catering revenue in Lantern’s books (F02); the events should number 76. A check cell such as <x>=IF(ROUND(SUM(J2:J11)-SUM(Events[invoice]),2)=0,"OK","CHECK")</x> sits beside the figures it protects. Rounding to the cent stops the tiny binary differences of the cells-and-formulas lesson from raising false alarms.` },

    { h: 'Common failures' },
    { list: [
      '<b>Too much.</b> Eleven charts make the important three hard to find. Each measure must answer a question someone acts on.',
      '<b>No comparison.</b> Numbers without a plan, last period or last year can’t be judged.',
      '<b>Decoration.</b> Gauges, 3-D and pictures spend space and attention without informing.',
      '<b>Stale data.</b> A page with no refresh date invites decisions on old figures; <g>timeliness</g> is part of data quality (B01).',
      '<b>Inconsistent scales and formats.</b> Cents in one chart and thousands in another, or axes that differ without warning.',
      '<b>Colour alone.</b> Red and green with no words or symbols fail readers who can’t tell them apart.',
      '<b>Drifting definitions.</b> A measure quietly redefined breaks its own history; the KPI dictionary and a change note prevent it.',
    ] },

    { h: 'Accessibility' },
    { p: 'Microsoft’s guidance for accessible spreadsheets applies directly. Give every chart alt text that states what it shows and its main message, and clear titles and axis labels. Name each sheet descriptively and remove blank sheets. Avoid merged cells and blank rows and columns, which confuse screen readers. Turn on header rows in tables.' },
    { p: 'Keep a high <g>contrast ratio</g> between text and background, and never let colour carry meaning alone. Run Review › Check Accessibility before sharing.' },
    { p: 'Even so, dashboards are hard to make fully accessible. The Analysis Function notes that they rarely meet every accessibility requirement and advises publishing the data in another format as well, and in the UK public-sector dashboards must meet WCAG 2.2 at level AA. For Ana that means sending the accountant the underlying table alongside the page.' },

    { h: 'Sharing and version control' },
    { p: 'Readers should not be able to break the page. Send a PDF or a read-only copy, or protect the formula and data areas and leave only the drop-down cells open. Keep one master workbook with one owner. If it is stored in OneDrive or SharePoint, Version history lets you open an earlier version and restore it (a personal Microsoft account keeps the last 25 versions); record what changed in a change log sheet, dated, so that a number that moves between two versions can be explained.' },
  ],

  formulas: [
    { id: 'db-gap', name: 'Gap to plan and share of plan',
      tex: String.raw`\text{Gap} = A - P, \qquad \text{Share of plan} = \dfrac{A}{P} \times 100`,
      where: [[String.raw`A`, 'Actual value for the period', 'units of the measure'], [String.raw`P`, 'Planned (target) value for the same period', 'units of the measure']],
      note: 'For a measure that is itself a percentage, the gap is in percentage points (B01).' },
    { id: 'db-change', name: 'Change on the previous period',
      tex: String.raw`\%\Delta = \dfrac{A_t - A_{t-1}}{A_{t-1}} \times 100`,
      where: [[String.raw`\%\Delta`, 'Percentage change on the previous period', '%'], [String.raw`A_t`, 'Value this period', 'units of the measure'], [String.raw`A_{t-1}`, 'Value in the previous period', 'units of the measure']] },
    { id: 'db-average', name: 'Average invoice from totals',
      tex: String.raw`\bar{I} = \dfrac{\sum_{m} R_m}{\sum_{m} N_m}`,
      where: [[String.raw`\bar{I}`, 'Average invoice over the months', '$ per event'], [String.raw`R_m`, 'Revenue in month m', '$'], [String.raw`N_m`, 'Events in month m', 'events']],
      assumptions: 'Each month counts in proportion to its number of events.',
      note: 'The plain average of the monthly averages weights a 3-event month as heavily as a 13-event month, and is wrong unless every month has the same number of events.' },
    { id: 'db-concentration', name: 'Top-k client share',
      tex: String.raw`C_k = \dfrac{\sum_{c \in \text{top } k} R_c}{R} \times 100`,
      where: [[String.raw`C_k`, 'Share of revenue from the k largest clients', '%'], [String.raw`k`, 'Number of clients counted (Ana uses 4)', 'clients'], [String.raw`R_c`, 'Revenue from client c over the period', '$'], [String.raw`R`, 'Total revenue over the period', '$']] },
  ],

  examples: [
    { level: 'simple', title: 'December’s headline tiles', fictional: true,
      setup: 'December 2026: revenue $10,120 from 13 events; plan $11,000. November: revenue $8,790 from 11 events. Year to date (March to December): revenue $62,320 against a plan of $60,000. Calculate what the four tiles should show.',
      steps: [
        String.raw`Revenue against plan: gap <m>10{,}120 - 11{,}000 = -880</m> dollars; share <m>10{,}120 \div 11{,}000 \times 100 \approx 92.0\%</m>. Against November: <m>10{,}120 - 8{,}790 = 1{,}330</m> dollars, <m>1{,}330 \div 8{,}790 \times 100 \approx 15.1\%</m> up.`,
        'Events: 13 against November’s 11, up 2.',
        String.raw`Average invoice: <m>10{,}120 \div 13 \approx 778.46</m> dollars in December against <m>8{,}790 \div 11 \approx 799.09</m> in November, down $20.63 or 2.6%.`,
        String.raw`Year to date: <m>62{,}320 \div 60{,}000 \times 100 \approx 103.9\%</m> of plan, $2,320 ahead.`,
      ],
      answer: 'Revenue $10,120: 92.0% of plan ($880 below), up 15.1% on November. Events 13, up 2. Average invoice $778.46, down 2.6% on November’s $799.09. Year to date $62,320: 103.9% of plan, $2,320 ahead.',
      interpretation: 'December was the busiest month and still missed its plan, because the plan expected a bigger jump than came, and the jobs were slightly smaller on average. The year as a whole beat its plan. Each tile needs both its comparisons to tell that story; a single “$10,120” tells none of it.' },
    { level: 'challenging', title: 'The average invoice that wasn’t', fictional: true,
      setup: 'A draft of the dashboard shows “average invoice, 2026: $872.23”, calculated as the average of the ten monthly average invoices. Monthly events ranged from 3 (March) to 13 (December), and March included Meridian Partners’ two-day conference, invoiced at $4,200. Find the right figure, explain the difference and decide how the average should be shown by event type.',
      steps: [
        String.raw`The year’s average invoice comes from totals: <m>62{,}320 \div 76 = 820</m> dollars.`,
        String.raw`The draft weights each month equally. March’s average was <m>5{,}600 \div 3 \approx 1{,}866.67</m> dollars because one of its three events was the $4,200 conference; in the average of averages that one month counts as much as December’s 13 events, pulling the result up by $52.23.`,
        String.raw`The same outlier distorts the type averages: conferences average <m>14{,}540 \div 13 \approx 1{,}118.46</m> dollars, but without the two-day conference the other 12 average <m>(14{,}540 - 4{,}200) \div 12 \approx 861.67</m> dollars.`,
        'Decide. Show averages computed from totals, and footnote the conference (it is genuine, so it stays in the revenue), or show the median invoice, $790 for the year, beside the mean. B02 treated the same choice for outliers.',
      ],
      answer: 'The year’s average invoice is $820 (total revenue ÷ total events), not $872.23. Conferences average $1,118.46 with the two-day event and $861.67 without it: show the first with a footnote, or add the median.',
      interpretation: 'An average of averages is right only when every group is the same size. Dashboards are full of rates and averages by month, type and client, so the rule “divide totals, don’t average averages” matters on almost every page.' },
    { level: 'applied', title: 'From first draft to one page', fictional: true,
      setup: 'Ana’s first draft had eleven charts: a 3-D pie of revenue by all 18 clients, a gauge for the month’s revenue, a pie of events by type, two tables of every event, and more. Months above and below plan were coloured green and red with no labels, revenue was shown to the cent in some charts and in thousands in others, and nothing said when the data had been refreshed. Redesign it for Ana and the accountant.',
      steps: [
        'Start from the questions (on plan? growing? which types? job size? dependence on clients?) and keep only the displays that answer them: four tiles, the monthly column chart with plan markers, the sorted bars by type and a small top-clients table.',
        'Replace the gauge with the number and its comparisons ($10,120: 92.0% of plan, up 15.1% on November), and the 18-slice 3-D pie with the top four clients and their share, grouping the rest.',
        String.raw`Add the concentration measure the draft lacked: <m>29{,}420 \div 62{,}320 \approx 47.2\%</m> of revenue from four clients, under Ana’s 50% ceiling but close, and Meridian’s 14.4% includes the conference, which may not recur.`,
        'Make the page trustworthy: one money format (whole dollars), “above” and “below” in words beside any colour, the period and refresh date in the notes, and check cells showing that the months and the types both total $62,320, the catering revenue in Lantern’s books.',
        'Build it to refresh: the Events table as the single source, tile formulas reading a drop-down month cell, PivotTables for the charts, and one slicer for event type connected to both PivotTables, kept away from the formula-driven tiles.',
      ],
      answer: 'One page with four tiles (revenue against plan and last month; events; average invoice; revenue year to date against plan), a monthly column chart with plan markers, sorted bars by event type, a top-four client table with their 47.2% share, and a notes panel with definitions, source, period, refresh date and reconciliation checks.',
      interpretation: 'The redesign removed more than it added. What it added, the comparisons, the concentration measure and the checks, is what turns a collection of charts into a tool for decisions.' },
  ],

  demo: [
    { widget: 'db-month', intro: 'Revenue by month against Ana’s plan. Which months beat the plan? Is December a good month or a bad one? Decide what a tile for December should say.' },
    { widget: 'db-pivot', intro: 'The PivotTable behind the type chart. Filter by Month (as a slicer would), change the rows to Client to find the top clients, and switch to Average to see the conference outlier.' },
    { widget: 'db-sheet', intro: 'One month of the dashboard, built from the October to December events. Pick a month from the drop-down and watch every tile follow; use Show formulas to read the date windows and the check in F10.' },
  ],

  mistakes: [
    { title: '“Put everything on it, in case someone asks.”', html: 'Each extra chart makes the important ones harder to find. Keep the measures the readers act on; leave the rest in the workbook, one click away.' },
    { title: '“Red is bad and green is good; everyone can see that.”', html: 'Not everyone can tell red from green, and a printed page in grey loses both. Say “below plan” or use a symbol as well as the colour.' },
    { title: '“The slicer filtered the table, so the SUMIFS tiles changed.”', html: 'They didn’t. SUMIFS and COUNTIFS add every row that meets their criteria, hidden or not; only SUBTOTAL ignores rows a filter excludes. Drive formula tiles from a drop-down cell, or use PivotTables with the slicer.' },
    { title: '“The average of the monthly averages is the year’s average.”', html: 'Only if every month has the same number of events. Divide total revenue by total events: $62,320 ÷ 76 = $820, not $872.23.' },
    { title: '“=TODAY() shows readers the data are current.”', html: 'TODAY() shows the date the file is opened, so it makes old figures look new. Type the date the data were refreshed, and state the period covered.' },
    { title: '“A gauge makes it look like a real dashboard.”', html: 'A dial takes the space of several numbers to show one, and its scale ends are arbitrary. The number with its comparison says more in less space.' },
  ],

  application: [
    { p: 'Dashboards are among the most common things analysts build, and the same design decisions recur everywhere. Three fictional examples show the range.' },
    { p: '<b>A hotel group’s weekly page.</b> The operations director of three hotels reviews occupancy, average room rate and revenue per available room every Monday, each against budget and the same week last year. The page also shows the next four weeks’ bookings already made, a leading indicator, and a single exceptions list of hotels more than five points below budget.' },
    { p: '<b>A charity’s fundraising page.</b> The trustees see income year to date against the plan, the share from regular donors (their guardrail against relying on one-off appeals) and the cost of raising each dollar. A notes panel explains that legacy gifts are counted when they are confirmed, not when they are promised, after a year in which a promised gift that never arrived flattered the figures.' },
    { p: '<b>A gym’s membership page.</b> The manager tracks members, joiners and leavers by month, with a drop-down for the site. A reconciliation check compares the membership system’s count with the payments system’s every month; when the two disagreed, the dashboard found a batch of failed card payments before the accountant did.' },
    { case: 'At her January review Ana reads the page in a minute. The year beat its plan, but the fourth quarter came in at $27,900 against a plan of $28,000, and December missed by $880. The type bars show meetings bringing the most revenue and launches the least. The client table worries her most: four clients bring 47.2% of the revenue, close to her 50% ceiling. She sets two actions for the first quarter, winning three new clients and applying the new hourly rule from the what-if lesson to long events, and adds both to the change log so that March’s page can show whether they worked.' },
    { p: 'A dashboard is the end of an analysis, not the start: it is where the cleaned data, the formulas, the PivotTables and the charts of this course meet the people who decide. Its quality is measured by the decisions it makes easier, which is why every choice on the page, from the measures to the date in the corner, should be traceable to a question someone asked.' },
  ],

  summary: [
    'A dashboard is one page of the few measures its audience acts on; design starts from the readers and their questions, not from the data.',
    'Write each measure down with its definition, comparison and owner; client concentration (the top clients’ share of revenue) is a measure of risk worth watching.',
    'Every number needs a comparison: a plan or target, the previous period, or the same period last year.',
    'Put the most important measure first (top left, an inverted pyramid), choose the display from the question, and keep formats, colours and scales consistent; avoid gauges, 3-D and decoration.',
    'Build on one Excel table: formula tiles driven by a drop-down cell and date windows, PivotTables refreshed from the table, slicers and timelines connected to PivotTables with the same data source.',
    'Slicers and filters don’t change SUMIFS results; SUBTOTAL ignores filtered-out rows. Use one mechanism per part of the page.',
    'Document the source, period, refresh date and definitions, and add reconciliation checks that prove the page agrees with its data.',
    'Make it accessible (alt text, names, contrast, no colour-only meaning), share a protected or read-only copy, and keep versions and a change log.',
  ],

  glossary: [
    { term: 'Client concentration', def: 'The share of revenue that comes from a business’s largest few clients; a high share means the loss of one client would hurt badly.' },
    { term: 'Visual hierarchy', def: 'The ordering of a page by position, size and emphasis so that readers see the most important information first.' },
    { term: 'Drop-down list', def: 'A cell limited by data validation to the values in a list, which the user picks from an arrow beside the cell; in a dashboard it lets the reader choose what the formulas show.' },
    { term: 'Timeline', def: 'An Excel filter for the date fields of PivotTables: a slider that selects years, quarters, months or days.' },
    { term: 'Reconciliation check', def: 'A formula that compares a total shown in a report with the same total calculated another way, such as from the source data or the accounts, and flags any difference.' },
    { term: 'Year to date', def: 'The period from the start of the year, or of the series, to the end of the latest complete period. Abbreviated YTD.' },
  ],

  references: [
    { text: 'Few, S. (2007). <i>Why Most Dashboards Fail</i>. Perceptual Edge. (Copy hosted for a UC Berkeley School of Information course.)', url: 'https://blogs.ischool.berkeley.edu/i247s13/files/2013/02/WhyMostDashboardsFail.pdf', checked: '2026-10-23' },
    { text: 'Government Analysis Function (2026). “Data visualisation: testing dashboards for design and accessibility” and “Data visualisation: building and managing dashboards” (analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-building-and-managing-dashboards/). UK Government Statistical Service.', url: 'https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-testing-dashboards-for-design-and-accessibility/', checked: '2026-10-23' },
    { text: 'Microsoft. “Use slicers to filter data” and “Create a PivotTable timeline to filter dates”. Microsoft Support.', url: 'https://support.microsoft.com/office/249f966b-a9d5-4b0f-b31a-12651785d29d', checked: '2026-10-23' },
    { text: 'Microsoft. “Create a drop-down list”. Microsoft Support.', url: 'https://support.microsoft.com/office/7693307a-59ef-400a-b769-c5402dce407b', checked: '2026-10-23' },
    { text: 'Microsoft. “SUBTOTAL function”. Microsoft Support.', url: 'https://support.microsoft.com/en-us/excel/subtotal-function', checked: '2026-10-23' },
    { text: 'Microsoft. “Accessibility best practices with Excel spreadsheets”. Microsoft Support.', url: 'https://support.microsoft.com/en-us/office/accessibility-best-practices-with-excel-spreadsheets-6cc05fc5-1314-48b5-8eb3-683e49b3e593', checked: '2026-10-23' },
    { text: 'Microsoft. “View previous versions of Office files”. Microsoft Support.', url: 'https://support.microsoft.com/topic/5c1e076f-a9c9-41b8-8ace-f77b9642e2c2', checked: '2026-10-23' },
  ],

  checks: [
    // the case
    { what: 'Events in 2026', value: D.events, shown: 76 },
    { what: 'Catering revenue 2026', value: total, shown: 62320 },
    { what: 'Catering revenue in the books (F02)', value: F02.catering.events * F02.catering.average, shown: 62320 },
    { what: 'Clients', value: D.clients, shown: 18 },
    { what: 'Plan total', value: sum(PLAN), shown: 60000 },
    // top clients
    { what: 'Top client: Meridian', value: byClient['Meridian Partners'], shown: 9000 },
    { what: 'Harbor Tech', value: byClient['Harbor Tech'], shown: 8130 },
    { what: 'Orchard Row Clinic', value: byClient['Orchard Row Clinic'], shown: 6210 },
    { what: 'Pier Nine Studio', value: byClient['Pier Nine Studio'], shown: 6080 },
    { what: 'Top four are these four', value: ranked.slice(0, 4).map((x) => x[0]).join() === 'Meridian Partners,Harbor Tech,Orchard Row Clinic,Pier Nine Studio' ? 1 : 0, shown: 1 },
    { what: 'Meridian events', value: nClient['Meridian Partners'], shown: 8 },
    { what: 'Harbor Tech events', value: nClient['Harbor Tech'], shown: 11 },
    { what: 'Orchard Row events', value: nClient['Orchard Row Clinic'], shown: 8 },
    { what: 'Pier Nine events', value: nClient['Pier Nine Studio'], shown: 8 },
    { what: 'Top-four revenue', value: top4, shown: 29420 },
    { what: 'Top-four share (%)', value: top4 / total * 100, shown: 47.2, tol: 0.05 },
    { what: 'Top-four share rounded on the page (%)', value: top4 / total * 100, shown: 47, tol: 0.5 },
    { what: 'Meridian share (%)', value: byClient['Meridian Partners'] / total * 100, shown: 14.4, tol: 0.05 },
    { what: 'Concentration ceiling (%)', value: 50, shown: 50 },
    { what: 'Conference invoice', value: conf[9], shown: 4200 },
    // December tiles
    { what: 'December revenue', value: rev[9], shown: 10120 },
    { what: 'December plan', value: PLAN[9], shown: 11000 },
    { what: 'December gap', value: rev[9] - PLAN[9], shown: -880 },
    { what: 'December share of plan (%)', value: rev[9] / PLAN[9] * 100, shown: 92.0, tol: 0.05 },
    { what: 'November revenue', value: rev[8], shown: 8790 },
    { what: 'December on November', value: rev[9] - rev[8], shown: 1330 },
    { what: 'December on November (%)', value: (rev[9] / rev[8] - 1) * 100, shown: 15.1, tol: 0.05 },
    { what: 'December events', value: cnt[9], shown: 13 },
    { what: 'November events', value: cnt[8], shown: 11 },
    { what: 'Events up', value: cnt[9] - cnt[8], shown: 2 },
    { what: 'December average invoice', value: avg[9], shown: 778.46 },
    { what: 'November average invoice', value: avg[8], shown: 799.09 },
    { what: 'Average invoice change', value: avg[9] - avg[8], shown: -20.63 },
    { what: 'Average invoice change (%)', value: (avg[9] / avg[8] - 1) * 100, shown: -2.6, tol: 0.05 },
    { what: 'Average invoice change on the page (%)', value: (avg[9] / avg[8] - 1) * 100, shown: -3, tol: 0.5 },
    { what: 'December average on the page', value: avg[9], shown: 778, tol: 0.5 },
    { what: 'November average on the page', value: avg[8], shown: 799, tol: 0.5 },
    { what: 'December share on the page (%)', value: rev[9] / PLAN[9] * 100, shown: 92, tol: 0.5 },
    { what: 'Year to date share (%)', value: total / sum(PLAN) * 100, shown: 103.9, tol: 0.05 },
    { what: 'Year to date share on the page (%)', value: total / sum(PLAN) * 100, shown: 104, tol: 0.5 },
    { what: 'Year to date ahead', value: total - sum(PLAN), shown: 2320 },
    { what: 'December clients (distinct)', value: decClients, shown: 10 },
    // by type
    { what: 'Meeting revenue', value: byType.Meeting, shown: 18200 },
    { what: 'Conference revenue', value: byType.Conference, shown: 14540 },
    { what: 'Breakfast revenue', value: byType.Breakfast, shown: 12060 },
    { what: 'Team day revenue', value: byType['Team day'], shown: 8830 },
    { what: 'Launch revenue', value: byType.Launch, shown: 8690 },
    { what: 'Types add to the total', value: sum(Object.values(byType)), shown: 62320 },
    { what: 'Event types', value: Object.keys(byType).length, shown: 5 },
    // averages
    { what: 'Year average invoice', value: total / D.events, shown: 820 },
    { what: 'Year average invoice (DERIVED)', value: D.eventMean, shown: 820 },
    { what: 'Mean of monthly averages', value: mean(avg), shown: 872.23 },
    { what: 'Average of averages overstates by', value: mean(avg) - total / D.events, shown: 52.23 },
    { what: 'March average', value: avg[0], shown: 1866.67 },
    { what: 'March events', value: cnt[0], shown: 3 },
    { what: 'March revenue', value: rev[0], shown: 5600 },
    { what: 'Conference events', value: nType.Conference, shown: 13 },
    { what: 'Conference average', value: byType.Conference / nType.Conference, shown: 1118.46 },
    { what: 'Conference average without the two-day event', value: (byType.Conference - conf[9]) / (nType.Conference - 1), shown: 861.67 },
    { what: 'Other conferences', value: nType.Conference - 1, shown: 12 },
    { what: 'Median invoice (DERIVED)', value: D.eventMedian, shown: 790 },
    // the year and Q4
    { what: 'Months above plan', value: rev.filter((v, i) => v >= PLAN[i]).length, shown: 4 },
    { what: 'Q4 revenue', value: rev[7] + rev[8] + rev[9], shown: 27900 },
    { what: 'Q4 plan', value: PLAN[7] + PLAN[8] + PLAN[9], shown: 28000 },
    { what: 'First event date is 12 March', value: dates.reduce((a, b) => (a < b ? a : b)) === '2026-03-12' ? 1 : 0, shown: 1 },
    { what: 'Last event date is 24 December', value: dates.reduce((a, b) => (a > b ? a : b)) === '2026-12-24' ? 1 : 0, shown: 1 },
    { what: 'Monthly revenues add to the total', value: sum(rev), shown: 62320 },
    { what: 'Tile formulas cover Oct–Dec events', value: EVENTS.filter((r) => r[1] >= '2026-10-01').length + 1, shown: 35 },
    // other numbers in the text
    { what: 'Draft charts', value: 11, shown: 11 },
    { what: 'Wireframe gridline', value: 10000, shown: 10000 },
    { what: 'Wireframe axis starts at', value: 0, shown: 0 },
    { what: 'Version history: personal account versions', value: 25, shown: 25 },
    { what: 'WCAG version', value: 2.2, shown: 2.2 },
    { what: 'Ten monthly revenues, March to December', value: MONTHS.length, shown: 10 },
    { what: 'Hotel example: hotels', value: 3, shown: 3 },
    { what: 'Hotel example: weeks of bookings', value: 4, shown: 4 },
    { what: 'Hotel example: points below budget', value: 5, shown: 5 },
    { what: 'Wireframe refresh date: 4 January 2027 is a Monday', value: new Date(Date.UTC(2027, 0, 4)).getUTCDay(), shown: 1 },
    { what: 'New clients targeted', value: 3, shown: 3 },
  ],
};
