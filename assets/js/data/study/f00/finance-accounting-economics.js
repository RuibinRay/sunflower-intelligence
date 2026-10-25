// finance-accounting-economics.js — F00 · Finance, accounting and economics. Content only; exercises are in finance-accounting-economics.ex.js.
import { ANA, SAVINGS_CHOICES } from './case.js?v=13';

export default {
  slug: 'finance-accounting-economics',
  title: 'Finance, accounting and economics',
  blurb: 'Accounting records what has happened, economics explains how people and whole economies behave, and finance decides what to do next with money. Learn what each field asks of the same decision, how finance turns accounting records into forecasts, and what people in each field do.',
  status: 'reviewed',
  objectives: [
    'Distinguish finance, accounting and economics by the question each asks, the period it looks at and what it produces.',
    'Distinguish financial accounting from managerial accounting by their users, rules and purpose.',
    'Distinguish microeconomics from macroeconomics and identify the economic conditions that matter to a financial decision.',
    'Explain how finance uses accounting data, and calculate accounting profit, operating cash flow and economic profit for a simple business.',
    'Apply all three perspectives to one business decision and describe typical careers in each field.',
  ],
  prerequisites: [
    { lesson: 'f00/finance-time-and-risk', why: 'You need the definition of finance, the time value of money and present value, which this lesson uses.' },
  ],
  case: 'lantern',

  concept: [
    { case: 'It is February 2026, and Ana has nearly decided to open Lantern Coffee Co. on 1 March. Before she resigns from her $52,000 job she asks three friends from college for advice (all three are fictional). The first, an accountant, asks to see her records: what she has saved, what she spent last year, and what Lantern will need to keep track of from its first day. The second, an economist, asks about the world around the business: how many offices nearby might want catered coffee, what other cafés charge, and what would happen to her customers if the economy slowed or prices kept rising. The third, a financial analyst, asks how much cash Lantern will produce, when, and how sure Ana is, and whether that is worth more than the salary and the interest she would give up. Same decision, three different first questions.' },
    { p: 'The three questions come from three related fields that are easy to confuse. Each one looks at a different part of the same decision, and a sound decision needs all three. A useful picture is a car journey. <g>Accounting</g> is the rear-view mirror: it shows, accurately and by agreed rules, the road already travelled. <g>Finance</g> is the windscreen: it looks ahead and decides where to steer. <g>Economics</g> is the road map and the weather report: it describes the conditions every driver faces, such as traffic, road works and storms. Like any picture it is a simplification, and the theory section shows where it breaks down.' },
    { figure: {
      svg: '<svg viewBox="0 0 640 284" xmlns="http://www.w3.org/2000/svg" font-family="inherit" font-size="15"><defs><marker id="fae-a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--series-1)"/></marker><marker id="fae-a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--series-2)"/></marker></defs><rect x="30" y="20" width="580" height="56" rx="8" style="fill:none;stroke:var(--series-3);stroke-width:2;stroke-dasharray:6 4"/><text x="320" y="44" text-anchor="middle" font-weight="700" fill="currentColor">Economics: the conditions around every decision</text><text x="320" y="65" text-anchor="middle" fill="currentColor">demand, prices, competition (micro); inflation, interest rates, jobs (macro)</text><line x1="40" y1="150" x2="600" y2="150" style="stroke:var(--rule-strong);stroke-width:2"/><circle cx="320" cy="150" r="7" fill="currentColor"/><text x="320" y="180" text-anchor="middle" font-weight="700" fill="currentColor">Today</text><text x="140" y="180" text-anchor="middle" fill="currentColor">The past</text><text x="500" y="180" text-anchor="middle" fill="currentColor">The future</text><path d="M305 125L60 125" style="fill:none;stroke:var(--series-1);stroke-width:3" marker-end="url(#fae-a1)"/><text x="180" y="115" text-anchor="middle" font-weight="700" fill="currentColor">Accounting looks back</text><path d="M335 125L580 125" style="fill:none;stroke:var(--series-2);stroke-width:3;stroke-dasharray:8 4" marker-end="url(#fae-a2)"/><text x="460" y="115" text-anchor="middle" font-weight="700" fill="currentColor">Finance looks forward</text><text x="180" y="210" text-anchor="middle" fill="currentColor">records what happened, by agreed rules:</text><text x="180" y="230" text-anchor="middle" fill="currentColor">financial statements, budgets vs actual</text><text x="460" y="210" text-anchor="middle" fill="currentColor">forecasts cash, time and risk:</text><text x="460" y="230" text-anchor="middle" fill="currentColor">decides what to invest and how to fund it</text><path d="M180 240Q320 262 455 240" style="fill:none;stroke:currentColor;stroke-width:1.5" marker-end="url(#fae-a2)"/><text x="320" y="276" text-anchor="middle" font-size="13" fill="currentColor">accounting data feed finance’s forecasts</text></svg>',
      caption: 'Three fields, one decision. Accounting reports the past, finance decides about the future, and economics describes the conditions both have to reckon with. Finance’s forecasts start from accounting’s records.',
      alt: 'A horizontal timeline with “Today” marked in the middle, “The past” to the left and “The future” to the right. A solid arrow points left from today, labelled “Accounting looks back”, with the note “records what happened, by agreed rules: financial statements, budgets versus actual”. A dashed arrow points right from today, labelled “Finance looks forward”, with the note “forecasts cash, time and risk: decides what to invest and how to fund it”. A dashed box across the top of the whole timeline is labelled “Economics: the conditions around every decision”, listing demand, prices and competition (micro) and inflation, interest rates and jobs (macro). A thin curved arrow at the bottom runs from the accounting note to the finance note, labelled “accounting data feed finance’s forecasts”.',
    } },

    { h: 'Accounting: the record of what happened' },
    { p: 'Accounting is an information system that identifies the economic events of an organisation, records them in money and communicates the results to the people who make decisions about it. Its main products are <g>financial statements</g>: reports of what a business earned over a period, what it owns and owes at a date, and where its cash came from and went. Because outsiders such as banks and investors rely on these reports, they follow agreed rules: US GAAP in the United States and IFRS in many other jurisdictions. F01 Introduction to Financial Accounting teaches the whole system, starting with Lantern’s first transaction on 1 March.' },
    { p: 'Accounting has two main branches. <g>Financial accounting</g> prepares general-purpose reports for people outside the business, chiefly investors and lenders, under those external rules. <g>Managerial accounting</g> prepares whatever internal reports help managers plan and control the business, such as the cost of each catering event, with no external rule book. For Ana before 1 March, accounting means her personal records; from 1 March, Lantern’s books, which Coastline Bank may ask to see.' },

    { h: 'Economics: choices under scarcity' },
    { p: 'Economics is the study of how people make decisions in the face of <g>scarcity</g>: there is never enough time, money, labour or materials for everything that people want, so every choice to use a resource one way is a choice not to use it another. Economics has two halves. <g>Microeconomics</g> studies the decisions of individual households and firms and how they meet in particular markets: how many people near Ana want catered coffee at $3.50 a cup, how her rivals will respond, what coffee beans will cost. <g>Macroeconomics</g> studies the economy as a whole: total output and its growth, unemployment, <g>inflation</g> (a general rise in prices) and interest rates, and the policies that governments and central banks use to influence them.' },
    { p: 'Economics gives finance one idea it uses constantly: the <g>opportunity cost</g> of a choice is the value of the best alternative you give up to make it. The opportunity cost of Ana’s time at Lantern is, at least, the $52,000 salary she could otherwise earn. Accounting does not record it, because no money changes hands, but no economist or financial analyst would ignore it. The lesson on decision principles builds on this idea.' },

    { h: 'Finance: deciding what to do next' },
    { p: 'Finance, as the previous lesson defined it, studies how money is raised, allocated and managed over time, under uncertainty. Where accounting asks “what happened?”, finance asks “what should we do?”. Its raw material is forecasts of future <g>cash flows</g>: the cash a decision will bring in and pay out, and when. It values those cash flows with the tools of the previous lesson, present value and the risk premium, and compares them with the alternatives. And it draws on both neighbours: accounting records are the starting point for most forecasts, and economic conditions shape what the forecasts should say.' },
    { table: {
      caption: 'The same decision through three lenses: should Ana open Lantern?',
      head: ['', 'Accounting', 'Economics', 'Finance'],
      rows: [
        ['Core question', 'What has happened, and what is the position now?', 'How do people and markets behave, and what conditions will the business face?', 'Which choice creates the most value, given timing and risk?'],
        ['Looks at', 'The past and the present', 'Both: past data to explain, models to predict', 'Mainly the future'],
        ['Main output', 'Records and financial statements, prepared by rules', 'Explanations, models and forecasts of markets and the economy', 'Decisions: what to invest in, how to fund it, how to manage cash'],
        ['Ana’s question', 'What do I have, and what will Lantern need to record?', 'Is there demand at my prices? What will inflation and interest rates do to my costs and customers?', 'Is the expected cash from Lantern, adjusted for time and risk, worth more than my salary and the interest on my savings?'],
      ],
    } },
    { callout: 'key', title: 'One decision, three questions', html: 'Accounting tells you where you are, economics tells you what the road ahead is like, and finance decides where to go. A financial decision that ignores the accounts has no starting point; one that ignores the economy has no context.' },
  ],

  theory: [
    { h: 'Where the picture breaks down' },
    { p: '“Accounting looks back, finance looks forward” is a good first approximation, but each field does some of both. Managerial accounting prepares budgets and forecasts, which look ahead, and then compares them with what actually happened. Financial accounting is full of estimates about the future: how many years equipment will last, how much customers will fail to pay. Finance, for its part, studies the past closely, because past returns and past cash flows are the evidence for its forecasts. The difference is one of purpose. Accounting’s first duty is a faithful, verifiable record; finance’s is a good decision, which always concerns what has not happened yet.' },
    { table: {
      caption: 'Financial and managerial accounting compared',
      head: ['', 'Financial accounting', 'Managerial accounting'],
      rows: [
        ['Main users', 'Investors, lenders, regulators and other outsiders', 'Owners, managers and staff'],
        ['Rules', 'US GAAP or IFRS', 'None imposed: whatever helps the decision'],
        ['Scope', 'The business as a whole', 'Any part: a product, an event, a team'],
        ['Time', 'Mainly past periods, reported after they end', 'Past, present and future: budgets, forecasts, cost reports'],
        ['Example at Lantern', 'Quarterly statements sent to Coastline Bank', 'A weekly report of the profit on each catering event'],
      ],
    } },

    { h: 'Microeconomics and macroeconomics in a financial decision' },
    { p: 'A financial forecast is built from microeconomic estimates and set inside macroeconomic assumptions. On the micro side, Ana’s forecast of Lantern’s revenue is a price multiplied by a quantity, and both depend on demand: how many offices and event organisers want her service, how sensitive they are to price, and what competing caterers offer. Her costs depend on the markets she buys in: coffee beans, milk, rent and staff. These are questions about particular markets, and microeconomics supplies the tools: supply and demand, competition, and opportunity cost.' },
    { p: 'On the macro side, conditions that no single business controls move all of these numbers at once. Inflation raises the prices Ana pays and, she hopes, the prices she can charge. Interest rates, influenced by the central bank (the Federal Reserve in the United States), set what Lantern pays to borrow and what Ana’s savings earn. Unemployment affects both how easily she can hire baristas and how freely offices spend on extras such as catered coffee. Economic growth or recession changes demand across the board. Ana’s own planning assumes inflation of 2.8% a year for the next two years; that is an assumption, not a forecast she can rely on, and finance treats it as one more uncertain input.' },
    { callout: 'note', title: 'Top down and bottom up', html: 'Macroeconomics is often described as a top-down view and microeconomics as a bottom-up one. Financial analysts use both: macro forecasts to set the scene (how fast will the economy grow, where will interest rates go?) and micro analysis to judge one business within it (can this café win customers from its rivals?).' },

    { h: 'How finance uses accounting data' },
    { p: 'Finance depends on accounting, but it rarely takes accounting figures at face value. It uses them in four main ways.' },
    { ol: [
      '<b>As the starting point for forecasts.</b> Last year’s revenue and costs, from the income statement, are the base from which next year’s are projected, adjusted for what the analyst expects to change.',
      '<b>Converted from profit to cash.</b> Accounting profit is measured on the accrual basis: revenue is recorded when it is earned and expenses when resources are used, not when cash moves. Some expenses involve no cash at all in the period. <g>Depreciation</g>, the spreading of an asset’s cost over the years it is used, is the clearest case: the cash left when the asset was bought. Finance cares about cash, so it adds such items back and adjusts for timing.',
      '<b>Adjusted for what accounting leaves out.</b> Accounting records transactions, so costs with no transaction, such as the opportunity cost of an owner’s time, are missing. Many assets are recorded at what they cost, not at what they are worth today; the module 2 lesson on value and valuation words explains the difference between book value and market value.',
      '<b>As the language of contracts and comparisons.</b> Loan agreements, bonus plans and comparisons between companies are written in accounting numbers, so financial managers must understand exactly how those numbers are produced.',
    ] },
    { p: 'This gives three different measures of how a business is doing, and they answer different questions. <g>Accounting profit</g> (net income) is revenue minus expenses, measured by the accounting rules. <g>Operating cash flow</g> is the cash the business’s day-to-day activities actually brought in, minus what they paid out. <g>Economic profit</g> is accounting profit minus the opportunity costs that accounting leaves out, such as the owner’s forgone salary and the return her money could have earned elsewhere. A business can show an accounting profit and still have an economic loss: it covers its recorded costs but not what its owner gave up to run it.' },
    { math: String.raw`\text{Economic profit} = \text{Accounting profit} - \text{Opportunity costs not recorded}` },

    { h: 'Careers in each field' },
    { p: 'The three fields lead to different kinds of work, and many careers combine them.' },
    { list: [
      '<b>Accounting.</b> Auditors examine financial statements and give an opinion on whether they are fairly presented; tax accountants work out and file tax; management accountants prepare budgets, cost reports and forecasts inside a business; a <g>controller</g> runs a company’s accounting and reporting. In the United States, the independent auditors whose reports accompany companies’ financial statements filed with the SEC must be licensed <g>certified public accountants</g> (CPAs); CPAs are licensed by each state’s board of accountancy after passing a national exam and meeting the state’s education and other requirements.',
      '<b>Finance.</b> Financial analysts study financial statements and economic and industry trends to value companies and recommend investments; credit analysts and loan officers decide whether to lend; treasurers manage a company’s cash, borrowing and investments; personal financial advisers help households plan. At the top of a company’s finance function, the chief financial officer (<g>CFO</g>) is responsible for its investment, financing and working capital decisions. Many jobs selling or advising on securities in the United States require a licence from FINRA, the industry’s self-regulatory organisation, usually sponsored by an employer.',
      '<b>Economics.</b> Economists collect and analyse data, build models and forecast trends such as inflation, interest rates and demand. Many work for governments and central banks, assessing policy; others work for consulting and research firms, international organisations and businesses, where they help managers understand demand and the economic outlook.',
    ] },
    { p: 'In a company the three meet constantly. The controller’s team produces the accounts, an economist or an outside forecaster supplies the outlook for prices and interest rates, and the finance team turns both into decisions. In a business as small as Lantern, Ana plays all three parts herself, with help from an outside accountant.' },
  ],

  formulas: [
    { id: 'economic-profit', name: 'Economic profit',
      tex: String.raw`\text{Economic profit} = \text{Accounting profit} - \text{Opportunity costs not recorded}`,
      where: [
        [String.raw`\text{Accounting profit}`, 'Revenue minus expenses as recorded under the accounting rules (net income)', '$'],
        [String.raw`\text{Opportunity costs not recorded}`, 'The value of alternatives given up that involve no transaction, such as the owner’s forgone salary and the return her money could earn elsewhere', '$'],
      ],
      assumptions: 'Both are measured over the same period. The opportunity costs are estimates of what the best alternatives would really have paid.',
      note: 'A positive economic profit means the business earns more than its owners could earn by putting their time and money into the next best alternative.' },
    { id: 'operating-cash-flow-simple', name: 'Operating cash flow (simplified)',
      tex: String.raw`\text{Operating cash flow} = \text{Accounting profit} + \text{Non-cash expenses}`,
      where: [
        [String.raw`\text{Accounting profit}`, 'Net income for the period', '$'],
        [String.raw`\text{Non-cash expenses}`, 'Expenses that used no cash in the period, chiefly depreciation', '$'],
      ],
      assumptions: 'A simplification: it assumes customers paid in cash, bills were paid as they arose, and stocks of supplies did not change. When they did, timing differences must also be adjusted for.',
      note: 'The full method, with changes in receivables, payables and other items, is taught in F01 (the statement of cash flows) and later finance courses.' },
  ],

  examples: [
    { level: 'simple', title: 'Whose question is it?', fictional: true,
      setup: 'Ana writes down five questions about Lantern. For each, decide whether it is mainly a question for accounting, microeconomics, macroeconomics or finance. (a) How much did I spend on personal expenses in 2025? (b) If I charge $4.00 a cup instead of $3.50, how many fewer cups will offices order? (c) If inflation stays near 2.8%, what will happen to the price of milk and to my landlord’s rent? (d) Is it worth borrowing $10,000 at 6% to buy equipment, compared with waiting and saving? (e) How should Lantern record the $10,000 it receives from the bank on 1 March?',
      steps: [
        '(a) Accounting: it asks what already happened, and the answer comes from records of past transactions.',
        '(b) Microeconomics: it is about demand in one market, and how buyers respond to a change in price.',
        '(c) Macroeconomics: inflation is an economy-wide condition that no single business controls, though it feeds into Lantern’s costs.',
        '(d) Finance: it is a forward-looking decision about raising and using money, which turns on timing (pay now or later) and risk (will the equipment earn enough?).',
        '(e) Accounting: it asks how to record an event by the rules. (In F01 you will record it: cash rises by $10,000 and so does a liability, Notes Payable.)',
      ],
      answer: '(a) Accounting. (b) Microeconomics. (c) Macroeconomics. (d) Finance. (e) Accounting.',
      interpretation: 'The test is the direction and scope of the question. Records of what happened belong to accounting; how a market or the whole economy behaves belongs to economics; what to do next with money belongs to finance. Real decisions, like (d), draw on all of them.' },
    { level: 'challenging', title: 'The coffee cart: profit, cash and opportunity cost', fictional: true,
      setup: 'Before settling on Lantern, Ana considers a different plan: buying Dockside Coffee Cart, a fictional cart near the harbour, from its retiring owner for $24,000 and running it herself instead of keeping her job. The cart’s accounts for 2025 show revenue of $84,000 and expenses of $66,000, including $3,000 of depreciation on the cart. The owner paid himself no wage. Sales were all in cash and every bill was paid as it arrived. The city has also told the owner that the cart’s harbour pitch fee will rise from $6,000 to $9,000 a year from 2026. What does each field say about the purchase?',
      steps: [
        'Accounting: net income for 2025 is revenue minus expenses, <m>84{,}000 - 66{,}000 = 18{,}000</m> dollars. It is a verifiable record of last year, measured by the rules.',
        String.raw`Finance, from profit to cash: depreciation used no cash in 2025, so with all sales in cash and bills paid as they arose, operating cash flow was <m>18{,}000 + 3{,}000 = 21{,}000</m> dollars. (Check: cash costs were <m>66{,}000 - 3{,}000 = 63{,}000</m>, and <m>84{,}000 - 63{,}000 = 21{,}000</m>.)`,
        'Finance, looking forward: the pitch fee rises by <m>9{,}000 - 6{,}000 = 3{,}000</m> dollars, so if nothing else changes, next year’s cash flow falls to <m>21{,}000 - 3{,}000 = 18{,}000</m> dollars.',
        String.raw`Economics, opportunity cost: running the cart means giving up Ana’s $52,000 salary, and the $24,000 price could have earned 1.5% in her savings account: <m>24{,}000 \times 0.015 = 360</m> dollars. Together, <m>52{,}000 + 360 = 52{,}360</m> dollars a year.`,
        'Economic profit on last year’s figures: <m>18{,}000 - 52{,}360 = -34{,}360</m> dollars. The cart covers its recorded costs but falls far short of what Ana would give up to run it.',
      ],
      answer: 'Accounting profit was $18,000 and operating cash flow $21,000, falling to about $18,000 a year once the fee rises. Against opportunity costs of $52,360 a year, the economic profit is about −$34,360: buying the cart to replace her job would leave Ana much worse off.',
      interpretation: 'Each field caught something the others missed. Accounting supplied a reliable history; finance converted it to cash and moved it forward, picking up the fee rise; economics added the costs that never appear in any ledger. The $18,000 profit that looks attractive on its own is a poor return for a full-time job and $24,000 of savings.' },
    { level: 'applied', title: 'Turning a hotel restaurant into a café', fictional: true,
      setup: 'Seagrass Hotel, a fictional 90-room hotel, is reviewing its restaurant. The controller reports that last year the restaurant had revenue of $410,000 and expenses of $455,000. An economist the hotel consults reports that more people now work remotely in the surrounding district, and that local building costs are rising at about 4% a year. The finance director estimates that converting the restaurant into a daytime café and co-working space would cost $120,000 now and would add $60,000 a year to the hotel’s cash flow, compared with keeping the restaurant, for three years. She discounts at 8% a year. What does each specialist contribute, and should the hotel convert?',
      steps: [
        'Accounting (the controller): the restaurant’s loss last year was <m>410{,}000 - 455{,}000 = -45{,}000</m> dollars. This is the record that starts the discussion, though it says nothing yet about the alternative.',
        String.raw`Economics (the economist): local demand is shifting towards daytime workspace, which supports the forecast, and with building costs rising at 4% a year, waiting a year would raise the conversion cost to about <m>120{,}000 \times 1.04 = 124{,}800</m> dollars.`,
        String.raw`Finance (the finance director): discount each year’s extra $60,000 back to today: <m>60{,}000 \div 1.08 = 55{,}555.56</m>, <m>60{,}000 \div 1.08^2 = 51{,}440.33</m> and <m>60{,}000 \div 1.08^3 = 47{,}629.93</m> dollars.`,
        'Finance: the present value of the extra cash is <m>55{,}555.56 + 51{,}440.33 + 47{,}629.93 = 154{,}625.82</m> dollars, against a cost of $120,000 today, a gain of <m>154{,}625.82 - 120{,}000 = 34{,}625.82</m> dollars in today’s money.',
      ],
      answer: 'On these estimates the conversion is worth about $154,626 today for a cost of $120,000, so it adds about $34,626 of value: convert, and sooner rather than later, since building costs are rising.',
      interpretation: 'The controller’s loss figure prompted the question, the economist’s outlook supported the forecast and the timing, and the finance director’s present-value comparison made the decision. The calculation she used, the present value of future cash flows minus today’s cost, is what F05 Corporate Finance calls net present value. Every input except the cost is an estimate, so a careful finance director would also ask how the answer changes if the extra cash is lower.' },
  ],

  demo: [
    { widget: 'three-lenses', intro: 'The explorer starts with the coffee cart’s 2025 figures and Ana’s opportunity costs. Change the revenue and costs to see accounting profit and operating cash flow move together, then raise the depreciation: profit falls but cash does not. Finally change the salary Ana would give up, and watch economic profit change while the accounts stay exactly the same.' },
  ],

  mistakes: [
    { title: '“Finance and accounting are the same subject.”', html: 'They share a vocabulary, and finance relies on accounting data, but they do different jobs. Accounting produces a faithful, verifiable record of what happened, by agreed rules; finance makes decisions about the future, using forecasts of cash, time and risk. An accountant can tell Ana what Lantern earned in March; a financial analyst asks what Lantern is worth and whether to expand it.' },
    { title: '“Accounting only ever looks backward.”', html: 'It is a useful first picture, not a rule. Managerial accounting prepares budgets and forecasts, and financial accounting uses estimates about the future, such as how long equipment will last. The real difference is purpose: a reliable record for accounting, a good decision for finance.' },
    { title: '“If the accounts show a profit, the business is a good use of the owner’s time and money.”', html: 'Accounting profit leaves out opportunity costs, because no transaction records them. The coffee cart earned $18,000 by the accounting rules, but running it would cost Ana a $52,000 salary: an economic loss. Always ask what the owner gives up.' },
    { title: '“Profit and cash are the same thing.”', html: 'Accounting profit is measured on the accrual basis, so it includes non-cash expenses such as depreciation and records revenue when it is earned, not when the customer pays. Finance values cash, so it converts profit into cash flow before deciding.' },
    { title: '“Macroeconomics is for governments; a small business can ignore it.”', html: 'No small business controls inflation, interest rates or unemployment, but all three reach it: through the prices it pays, the rate on its loan and how freely its customers spend. Ana cannot change the economy, but her forecasts must make an assumption about it, and say so.' },
  ],

  application: [
    { case: 'Aldridge Air, a fictional regional airline, is deciding whether to open a new daily route between two mid-sized cities. Three departments contribute to the decision, and its chief financial officer brings their work together.' },
    { p: 'The controller’s team starts with the airline’s own records. From the accounts and the managerial cost reports they produce what flying a similar route actually cost last year: fuel per flight, crew, airport and handling charges, maintenance, and how full similar flights were. These numbers have the great virtue of being real; their weakness is that they describe last year, on other routes.' },
    { p: 'The airline’s economist works on demand and conditions. At the micro level she studies the market for travel between the two cities: how many people travel by road and rail today, what they pay, how a rival airline might respond, and how sensitive business and leisure travellers are to fares. At the macro level she sets out the airline’s assumptions for economic growth in the region, fuel prices and interest rates, and she is explicit that each is uncertain.' },
    { p: 'The finance team combines the two into a forecast of the route’s cash flows: fares multiplied by passengers, minus the costs the route would add, year by year. It adds the cost of leasing an extra aircraft, discounts the cash flows at a rate that reflects the route’s risk, and compares their present value with what the airline must spend to launch the route. Then it asks the questions that decide the matter: what happens if passenger numbers are 15% lower than forecast, or fuel prices rise? A route that adds value only if every estimate goes right is a poor bet.' },
    { p: 'The CFO’s recommendation to the board cites all three: the cost history from accounting, the demand and economic outlook from the economist, and the value, timing and risk from finance. Remove any one and the decision is weaker, which is why, in large companies and small ones, the three fields work side by side.' },
  ],

  summary: [
    'Accounting records and reports what has happened, by agreed rules (US GAAP or IFRS); finance decides what to do next with money; economics studies how people, markets and whole economies behave under scarcity.',
    'Financial accounting serves outsiders under external rules; managerial accounting serves managers, with no imposed rules, and often looks ahead.',
    'Microeconomics studies individual households, firms and markets (demand, prices, competition); macroeconomics studies the whole economy (growth, unemployment, inflation, interest rates).',
    'Finance uses accounting data as the starting point for forecasts, converts profit to cash, adds the opportunity costs accounting leaves out, and reads contracts written in accounting numbers.',
    'Accounting profit, operating cash flow and economic profit answer different questions; a business can be profitable in its accounts and still be a poor use of its owner’s time and money.',
    'Careers range from auditor, tax accountant and controller, through financial analyst, treasurer and CFO, to economist in government or business; real decisions need all three fields.',
  ],

  glossary: [
    { term: 'Accounting', def: 'An information system that identifies the economic events of an organisation, records them in money and communicates the results to the people who make decisions about it.' },
    { term: 'Economics', def: 'The study of how people, firms and societies make decisions in the face of scarcity.' },
    { term: 'Scarcity', def: 'The condition that resources such as time, money, labour and materials are limited relative to what people want, so every use of a resource means giving up another.' },
    { term: 'Microeconomics', def: 'The part of economics that studies the decisions of individual households and firms and how they interact in particular markets.' },
    { term: 'Macroeconomics', def: 'The part of economics that studies the economy as a whole: total output and growth, unemployment, inflation, interest rates and government and central bank policy.' },
    { term: 'Inflation', def: 'A sustained rise in the general level of prices, measured as the percentage change in a price index.' },
    { term: 'Opportunity cost', def: 'The value of the best alternative given up when a choice is made, such as the salary an owner forgoes to run her own business.' },
    { term: 'Financial statements', def: 'Structured reports of a business’s performance and cash flows for a period and its financial position at a date, prepared under accounting rules: the income statement, statement of changes in equity, balance sheet and statement of cash flows, together with their notes.' },
    { term: 'Financial accounting', def: 'The branch of accounting that prepares general-purpose financial statements for outside users, such as investors and lenders, following accounting standards (US GAAP or IFRS).' },
    { term: 'Managerial accounting', def: 'The branch of accounting that prepares internal reports, such as budgets, cost reports and forecasts, to help managers plan, control and decide. It follows no externally imposed rules and often uses nonfinancial measures. Also called management accounting.' },
    { term: 'Cash flow', def: 'Cash received or paid out by a person or business over a period, or expected to be received or paid as a result of a decision.' },
    { term: 'Depreciation', def: 'The systematic allocation of the cost of a long-lived asset, less its residual value, over its useful life. It is an expense in the accounts but uses no cash in the period it is recorded, and it is not a measure of market value.' },
    { term: 'Accounting profit', def: 'Revenue minus expenses as measured under the accounting rules; also called net income.' },
    { term: 'Operating cash flow', def: 'The cash brought in by a business’s day-to-day activities minus the cash those activities paid out, over a period.' },
    { term: 'Economic profit', def: 'Accounting profit minus the opportunity costs that accounting does not record, such as the owner’s forgone salary and the return her money could have earned elsewhere.' },
    { term: 'Controller', def: 'The manager responsible for a company’s accounting, financial reporting and internal controls.' },
    { term: 'Certified public accountant', def: 'In the United States, an accountant licensed by a state board of accountancy after passing a national exam and meeting the state’s requirements. Often shortened to CPA.' },
    { term: 'CFO', def: 'Chief financial officer: the senior executive responsible for a company’s financial decisions, including investment, financing and working capital, and for its financial reporting.' },
  ],

  references: [
    { text: 'Dahlquist, J. &amp; Knight, R. (2022). <i>Principles of Finance</i>, section 1.6, “Microeconomic and Macroeconomic Matters”. OpenStax.', url: 'https://openstax.org/books/principles-finance/pages/1-6-microeconomic-and-macroeconomic-matters', checked: '2026-10-23' },
    { text: 'Greenlaw, S. A., Shapiro, D. &amp; MacDonald, D. (2022). <i>Principles of Economics</i> (3rd ed.), section 1.2, “Microeconomics and Macroeconomics”. OpenStax.', url: 'https://openstax.org/books/principles-economics-3e/pages/1-2-microeconomics-and-macroeconomics', checked: '2026-10-23' },
    { text: 'Franklin, M., Graybeal, P. &amp; Cooper, D. (2019). <i>Principles of Accounting, Volume 1: Financial Accounting</i>, section 1.1, “Explain the Importance of Accounting and Distinguish between Financial and Managerial Accounting”. OpenStax.', url: 'https://openstax.org/books/principles-financial-accounting/pages/1-1-explain-the-importance-of-accounting-and-distinguish-between-financial-and-managerial-accounting', checked: '2026-10-23' },
    { text: 'US Bureau of Labor Statistics. <i>Occupational Outlook Handbook</i>: “Accountants and Auditors”.', url: 'https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm', checked: '2026-10-23' },
    { text: 'US Bureau of Labor Statistics. <i>Occupational Outlook Handbook</i>: “Financial Analysts”.', url: 'https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm', checked: '2026-10-23' },
    { text: 'US Bureau of Labor Statistics. <i>Occupational Outlook Handbook</i>: “Economists”.', url: 'https://www.bls.gov/ooh/life-physical-and-social-science/economists.htm', checked: '2026-10-23' },
  ],

  checks: [
    { what: 'Bank loan recorded on 1 March (case.js)', value: ANA.loan.amount, shown: 10000 },
    { what: 'Ana’s salary (case.js)', value: ANA.salary, shown: 52000 },
    { what: 'Planning inflation assumption (case.js)', value: SAVINGS_CHOICES.inflation, shown: 2.8 },
    { what: 'Cart: net income', value: 84000 - 66000, shown: 18000 },
    { what: 'Cart: cash costs', value: 66000 - 3000, shown: 63000 },
    { what: 'Cart: operating cash flow from revenue', value: 84000 - (66000 - 3000), shown: 21000 },
    { what: 'Cart: operating cash flow from profit', value: (84000 - 66000) + 3000, shown: 21000 },
    { what: 'Cart: fee rise', value: 9000 - 6000, shown: 3000 },
    { what: 'Cart: next year cash flow', value: 21000 - (9000 - 6000), shown: 18000 },
    { what: 'Cart: forgone interest on $24,000 at 1.5%', value: 24000 * 0.015, shown: 360 },
    { what: 'Cart: opportunity costs', value: 52000 + 24000 * 0.015, shown: 52360 },
    { what: 'Cart: economic profit', value: (84000 - 66000) - (52000 + 24000 * 0.015), shown: -34360 },
    { what: 'Cart price within Ana’s savings', value: 26000 >= 24000 ? 1 : 0, shown: 1 },
    { what: 'Hotel: restaurant result', value: 410000 - 455000, shown: -45000 },
    { what: 'Hotel: conversion cost after a year at 4%', value: 120000 * 1.04, shown: 124800 },
    { what: 'Hotel: PV year 1', value: 60000 / 1.08, shown: 55555.56 },
    { what: 'Hotel: PV year 2', value: 60000 / 1.08 ** 2, shown: 51440.33 },
    { what: 'Hotel: PV year 3', value: 60000 / 1.08 ** 3, shown: 47629.93 },
    { what: 'Hotel: total PV', value: 60000 / 1.08 + 60000 / 1.08 ** 2 + 60000 / 1.08 ** 3, shown: 154625.82 },
    { what: 'Hotel: total PV rounded', value: 60000 / 1.08 + 60000 / 1.08 ** 2 + 60000 / 1.08 ** 3, shown: 154626, tol: 0.5 },
    { what: 'Hotel: value added', value: 60000 / 1.08 + 60000 / 1.08 ** 2 + 60000 / 1.08 ** 3 - 120000, shown: 34625.82 },
    { what: 'Hotel: value added rounded', value: 60000 / 1.08 + 60000 / 1.08 ** 2 + 60000 / 1.08 ** 3 - 120000, shown: 34626, tol: 0.5 },
  ],
};
