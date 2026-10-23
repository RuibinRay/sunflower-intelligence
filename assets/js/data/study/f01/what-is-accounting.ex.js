// what-is-accounting.ex.js — F01 · What accounting is and why businesses need it: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  const s = Number.isInteger(c) ? c.toLocaleString('en-US') : c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 && c !== 0 ? '−' : ''}$${s}`;
};
const pctText = (p) => (p === 0 ? '0%' : p >= 1 ? `${p.toFixed(1)}%` : p >= 0.01 ? `${p.toFixed(2)}%` : `${p.toFixed(4)}%`);

export const widgets = {
  materiality: {
    type: 'formula',
    title: 'Materiality explorer: the same error in different businesses',
    intro: 'An expense was left out of the records, so the reported profit is too high by the amount of the error. Change the business’s reported profit and the size of the error.',
    inputs: [
      { id: 'profit', label: 'Profit as reported', min: 500, max: 100000, step: 10, value: 990, fmt: 'money' },
      { id: 'error', label: 'Unrecorded expense (the error)', min: 0, max: 5000, step: 10, value: 150, fmt: 'money' },
    ],
    compute: (v) => {
      const pct = (v.error / v.profit) * 100;
      const corrected = v.profit - v.error;
      let note;
      if (v.error === 0) {
        note = 'With no error there is nothing to correct. Move the error slider to compare its size with the profit.';
      } else if (corrected <= 0) {
        note = `The error is at least as large as the reported profit, so correcting it turns a reported profit into ${corrected === 0 ? 'a break-even result' : 'a loss'}. That is material whatever the percentage: it changes the basic story the statements tell.`;
      } else if (pct >= 5) {
        note = `At ${pctText(pct)} of reported profit the error is above a 5% rule of thumb, so treat it as likely to be material and correct it. Size is only the first question; an error’s nature can make even a small one material.`;
      } else {
        note = `At ${pctText(pct)} of reported profit the error is below a 5% rule of thumb. That suggests, as a starting point only, that it may be immaterial. Now ask about its nature: does it mask a trend, decide whether a loan agreement is met, or conceal something unlawful? If so, it is material anyway.`;
      }
      return {
        headline: { label: 'Error as a share of reported profit', value: pctText(pct) },
        rows: [
          ['Profit as reported', money(v.profit)],
          ['Profit after correcting the error', money(corrected)],
          ['5% of reported profit (a rule-of-thumb starting point)', money(v.profit / 20)],
        ],
        note,
      };
    },
  },
};

const STATEMENTS = ['Statement of cash flows', 'Balance sheet', 'Income statement', 'Statement of changes in equity'];

export const guided = [
  {
    id: 'f01-wia-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Match each decision to the user of accounting information most likely to make it.',
    items: [
      'Decide whether to lend Lantern $15,000 to buy a delivery van',
      'Decide whether to buy shares in a listed café chain',
      'Decide whether to let Lantern pay for its coffee beans 30 days after delivery',
      'Work out how much income tax Lantern owes for the year',
      'Decide whether to raise the price of Lantern’s barista workshops',
      'Decide whether to accept a job offer from a company that has been losing money',
    ],
    categories: ['Investor', 'Manager or owner', 'Tax authority', 'Lender', 'Employee', 'Supplier'],
    answer: [3, 0, 5, 2, 1, 4],
    hints: [
      'For each decision, ask who would gain or lose from making it well or badly.',
      'A supplier that delivers now and is paid in 30 days is a short-term creditor; a bank financing a van is a long-term one. Setting prices is an internal decision.',
    ],
    feedback: {
      2: 'A supplier selling on credit is lending for a few weeks, so it reads the statements much as a bank does, but over a shorter horizon.',
      3: 'The tax authority uses the business’s figures, adjusted by tax rules, to assess the tax due. That is tax accounting.',
      4: 'Prices are set inside the business by its owner or managers, using managerial accounting such as the cost of running each workshop.',
      5: 'An employee (or a union) uses the statements to judge whether the employer is stable enough to pay and keep its staff.',
    },
    solution: 'Lender: the van loan. Investor: buying shares. Supplier: 30-day credit on beans. Tax authority: the income tax owed. Manager or owner: workshop prices, an internal decision based on managerial accounting. Employee: the job offer from a loss-making company.',
  },
  {
    id: 'f01-wia-g2', type: 'classify', kind: 'conceptual',
    prompt: 'Each statement describes something Lantern does. Match it to the assumption or principle behind it.',
    items: [
      'Lantern’s accounts leave out Ana’s personal car and mortgage.',
      'Lantern prepares statements for March, although its business carries on into April.',
      'Lantern spreads the cost of its espresso machine over the five years it expects to use it, instead of showing what the machine would fetch in a forced sale.',
      'Lantern does not record the value of its regular customers’ loyalty.',
      'The espresso machine stays in the records at $12,000, although the same model now sells for $13,000.',
      'Lantern’s notes describe the interest rate and repayment terms of its bank loan.',
    ],
    categories: ['Going concern assumption', 'Historical cost principle', 'Economic entity assumption', 'Full disclosure principle', 'Time period assumption', 'Monetary unit assumption'],
    answer: [2, 4, 0, 5, 1, 3],
    hints: [
      'For each one, ask what is being left out, or which amount is being used, and why.',
      'Kept separate from the owner: economic entity. Only what is measurable in money: monetary unit. Expected to keep trading: going concern. Kept at what it cost: historical cost.',
    ],
    feedback: {
      2: 'Spreading a cost over future years only makes sense if the business expects to be there to use the machine: that is the going concern assumption. Historical cost explains the starting amount, not why it is spread out.',
      3: 'Loyalty is valuable, but it cannot be measured reliably in money, so the monetary unit assumption keeps it out of the accounts.',
      4: 'Keeping the machine at what it cost, rather than updating it to today’s price, is the historical cost principle.',
      5: 'The notes exist so that readers have everything they need to understand the statements: the full disclosure principle.',
    },
    solution: 'Car and mortgage: economic entity assumption. Monthly statements: time period assumption. Spreading the machine’s cost over its use: going concern assumption. Loyalty not recorded: monetary unit assumption. Machine kept at $12,000: historical cost principle. Loan terms in the notes: full disclosure principle.',
  },
  {
    id: 'f01-wia-g3', type: 'steps', kind: 'applied',
    prompt: 'Ana pays $1,850 for her family’s holiday from Lantern’s bank account and asks the bookkeeper to record it as a business travel cost. Work through what the bookkeeper should do.',
    solution: 'Under the economic entity assumption, Lantern’s records contain only Lantern’s events. The holiday was Ana’s, so it is not a business expense. But $1,850 of Lantern’s cash really did leave the business, so the bookkeeper must record it as what it was: a transfer to the owner, which reduces the owners’ claim (like a dividend), or an amount Ana owes Lantern if she will repay it. Recording it as an expense would understate Lantern’s profit and misdescribe what the money was spent on, so the statements would not be a faithful representation, and Lantern’s tax return would overstate its costs.',
    steps: [
      { id: 'f01-wia-g3-s1', type: 'mc',
        prompt: 'Which assumption does Ana’s request run against?',
        options: ['Economic entity assumption', 'Going concern assumption', 'Time period assumption', 'Monetary unit assumption'],
        answer: 0,
        hints: ['Whose holiday is it?', 'The business is treated as separate from its owner.'],
        feedback: {
          1: 'Nothing suggests Lantern will stop trading. Going concern is about whether the business continues, not about whose spending this is.',
          2: 'When the payment happened is not the issue; who benefited from it is.',
          3: 'The amount is measured exactly in dollars. The question is whether it belongs in Lantern’s accounts as a business cost at all.',
        } },
      { id: 'f01-wia-g3-s2', type: 'mc',
        prompt: 'How should Lantern record the $1,850?',
        options: [
          'As a transfer to Ana as owner, reducing the owners’ claim (or as an amount she owes Lantern if she will repay it), not as an expense',
          'As a travel expense, because the money left the business’s bank account',
          'Not at all, because the holiday is Ana’s private matter',
          'As an asset, because Ana will come back rested and work harder',
        ],
        answer: 0,
        hints: ['Cash really did leave Lantern, so something has to be recorded.', 'Was this a cost of earning Lantern’s revenue, or a transfer of Lantern’s resources to its owner?'],
        feedback: {
          1: 'Which account the money left decides nothing. An expense is a resource used up in running the business, and the holiday earned Lantern nothing.',
          2: 'Lantern’s cash fell by $1,850, so leaving the payment out would make Lantern’s cash records wrong. Record it, but as what it is.',
          3: 'Ana’s rest is a benefit to Ana personally, not an economic resource that Lantern controls.',
        } },
      { id: 'f01-wia-g3-s3', type: 'mc',
        prompt: 'If the holiday were recorded as a travel expense, which fundamental qualitative characteristic would Lantern’s statements fail?',
        options: ['Faithful representation', 'Timeliness', 'Comparability', 'Understandability'],
        answer: 0,
        hints: ['Would the statements depict what actually happened?'],
        feedback: {
          1: 'Timeliness is about when information arrives, not whether it is right. It is also an enhancing characteristic, not a fundamental one.',
          2: 'Comparability is an enhancing characteristic. The problem here is more basic: the statements would depict a business cost that never happened.',
          3: 'The figures could be perfectly clear and still be wrong. The fault lies in what they depict, not how they are presented.',
        } },
    ],
  },
  {
    id: 'f01-wia-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Match each description to the qualitative characteristic it illustrates best.',
    items: [
      'Lantern’s March figures help Ana and the bank estimate April’s catering revenue.',
      'Lantern reports Harbor Tech’s deposit as an amount it owes, not as revenue, although calling it revenue would impress the bank.',
      'Two staff members who count the supplies on 31 March both arrive at $600.',
      'Lantern uses the same methods every month, so March and April can be set side by side.',
      'Lantern’s March statements are ready on 8 April, while the bank is still considering a new loan.',
      'Lantern groups everything it owes together and explains the bank loan’s terms in plain words.',
    ],
    categories: ['Comparability', 'Faithful representation', 'Understandability', 'Relevance', 'Timeliness', 'Verifiability'],
    answer: [3, 1, 5, 0, 4, 2],
    hints: [
      'Two of the six are fundamental (relevance and faithful representation); the other four enhance them.',
      'Helping users predict is relevance. Refusing to slant the figures is neutrality, part of faithful representation. Independent people reaching the same figure is verifiability.',
    ],
    feedback: {
      1: 'Choosing the honest classification even though another would look better is neutrality, one of the three parts of faithful representation.',
      2: 'When independent observers would reach the same figure, the information is verifiable.',
      3: 'Applying the same methods over time is consistency, which is what makes periods comparable.',
    },
    solution: 'Estimating April: relevance (predictive value). Deposit reported as owed: faithful representation (neutrality). Two identical counts: verifiability. Same methods each month: comparability. Ready on 8 April: timeliness. Grouped and explained: understandability.',
  },
];

export const independent = [
  {
    id: 'f01-wia-i1', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is an example of managerial accounting?',
    options: [
      'A weekly report for Ana showing the profit on each catering event',
      'Lantern’s March financial statements, sent to Coastline Bank',
      'Lantern’s corporate income tax return',
      'An auditor’s opinion on Lantern’s annual financial statements',
    ],
    answer: 0,
    feedback: {
      1: 'Statements sent to an outside lender are financial accounting: general-purpose reports prepared under GAAP.',
      2: 'A tax return is tax accounting: it follows tax law, not managers’ needs.',
      3: 'An audit opinion is given on financial statements prepared for outsiders, so it belongs to financial accounting.',
    },
    solution: 'Managerial accounting produces internal reports for decisions, in whatever form is useful. A report of profit per catering event, prepared weekly for Ana, fits exactly; it follows no external rules and no outsider sees it.',
  },
  {
    id: 'f01-wia-i2', type: 'classify', kind: 'conceptual',
    prompt: 'Which financial statement answers each question best?',
    items: [
      'How much profit did Lantern make in March?',
      'How much does Lantern owe its suppliers at 31 March?',
      'How much of March’s profit was paid out to the shareholder, and how much was kept?',
      'Did customers or lenders provide more of March’s cash?',
      'What did Lantern’s equipment cost, and how much does it still owe for it, at the end of March?',
    ],
    categories: STATEMENTS,
    answer: [2, 1, 3, 0, 1],
    feedback: {
      1: 'Amounts owed at a particular date are part of the business’s position at that moment, which the balance sheet shows.',
      2: 'Profit kept and profit paid out are changes in the owners’ claim, explained by the statement of changes in equity.',
      3: 'Where cash came from, by activity, is exactly what the statement of cash flows reports.',
      4: 'Both the equipment and the debt to the supplier exist at a date, so both are on the balance sheet.',
    },
    solution: 'Profit for March: income statement. Amounts owed at 31 March: balance sheet. Profit paid out versus kept: statement of changes in equity. Customers versus lenders as sources of cash: statement of cash flows. Equipment and the amount still owed for it at the end of March: balance sheet.',
  },
  {
    id: 'f01-wia-i3', type: 'num', kind: 'numerical',
    prompt: 'Suppose a clothing brand reports net income of $240,000 and then discovers an unrecorded expense of $9,000. How large is the error as a percentage of reported net income? Give your answer to two decimal places.',
    answer: 3.75, check: () => (9000 / 240000) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 3.9, say: 'You divided by the corrected net income ($231,000). Measure the error against the net income as reported, which is what readers saw.' },
      { value: 0.0375, say: 'That is the ratio as a decimal. Enter it as a percentage: 0.0375 is 3.75%.' },
      { value: 26.67, say: 'You divided the net income by the error. Divide the error by the net income.' },
    ],
    solution: '9,000 ÷ 240,000 = 0.0375, or 3.75%. That is below a 5% rule of thumb, so on size alone the error might be presumed immaterial. The brand must still ask whether its nature makes it material, for example whether correcting it would breach a loan condition or reverse a trend.',
  },
  {
    id: 'f01-wia-i4', type: 'mc', kind: 'applied',
    prompt: 'Suppose that, a year from now, Lantern loses its two largest clients, its bank refuses further credit, and Ana decides to close the business in two months and sell the equipment. Which statement about Lantern’s next financial statements is correct?',
    options: [
      'The going concern assumption no longer holds, so the statements may have to be prepared on a different basis, and they must say which basis and why.',
      'Nothing changes: statements are always prepared as if the business will continue.',
      'The economic entity assumption no longer holds, because the business is ending.',
      'Under the time period assumption, Lantern must wait until it has closed before preparing any statements.',
    ],
    answer: 0,
    feedback: {
      1: 'The going concern basis is an assumption, used only while there is no evidence against it. A decision to close is exactly such evidence.',
      2: 'Lantern is still a separate entity from Ana while it winds down; what has changed is whether it will continue operating.',
      3: 'Statements are still prepared for each period. The question is on what basis, not when.',
    },
    solution: 'Statements normally assume the business will keep operating, which is why assets such as equipment are carried at cost and spread over their use. Once Ana decides to close, that assumption fails: the statements may need a different basis (for example, amounts expected on liquidation), and full disclosure requires them to state the basis used and the reasons.',
  },
  {
    id: 'f01-wia-i5', type: 'multi', kind: 'applied',
    prompt: 'Which of these would Lantern record in its accounts? Select all that apply.',
    options: [
      'Lantern pays $1,200 rent for its shared kitchen for March.',
      'A friend promises to invest $50,000 in Lantern next year.',
      'Lantern receives its $260 utilities bill for March, due in April.',
      'A rival café opens across the street.',
      'Lantern sends Meridian Partners a $4,200 invoice for catering its conference.',
      'Ana pays her personal phone bill from her own bank account.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'A promise of future money changes nothing yet: no resource has arrived and no obligation exists.',
      3: 'Competition may affect future revenue, but it is not an event of Lantern’s that can be measured in money.',
      5: 'Ana’s personal bill, paid with her own money, is outside Lantern’s accounts under the economic entity assumption.',
    },
    solution: 'Record the rent paid (cash out, a cost of March), the utilities bill (a cost of March and an amount owed, even though unpaid) and the Meridian invoice (revenue earned and an amount receivable). Leave out the friend’s promise (nothing has happened yet), the rival café (not Lantern’s transaction and not measurable in money) and Ana’s personal phone bill (not Lantern’s event).',
  },
  {
    id: 'f01-wia-i6', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about who sets accounting rules is accurate?',
    options: [
      'The FASB, a private-sector body, sets US GAAP; the SEC has legal authority over public companies’ reporting and recognises the FASB’s standards.',
      'The SEC writes every US accounting standard itself, and the FASB only advises it.',
      'US public companies may choose to report under IFRS instead of US GAAP.',
      'The IASB decides which countries must use IFRS.',
    ],
    answer: 0,
    feedback: {
      1: 'The SEC has the legal power to set standards for public companies but relies on the FASB to write them.',
      2: 'The SEC requires US domestic public companies to use US GAAP. IFRS is accepted only from foreign private issuers.',
      3: 'The IASB writes the standards; each jurisdiction decides whether, and for which companies, to require them.',
    },
    solution: 'The FASB writes US GAAP. The SEC, which has statutory authority over the reporting of public companies, recognises the FASB as the designated standard setter for them and requires US domestic public companies to use US GAAP. The IASB writes IFRS, and each jurisdiction decides whether to require it.',
  },
];

export const check = [
  {
    id: 'f01-wia-k1', type: 'mc', kind: 'conceptual',
    prompt: 'According to the conceptual frameworks of the FASB and the IASB, what is the objective of general purpose financial reporting?',
    options: [
      'To provide financial information that helps existing and potential investors, lenders and other creditors decide whether to provide resources to the business',
      'To calculate the tax the business owes',
      'To show what the business would sell for today',
      'To give managers the detailed information they need to run daily operations',
    ],
    answer: 0,
    feedback: {
      1: 'Tax is calculated under tax law, a separate branch of accounting with its own rules.',
      2: 'Financial statements are not valuations: many assets are carried at historical cost, and some valuable resources are not recorded at all.',
      3: 'That is the job of managerial accounting. General purpose reports serve outsiders who cannot ask for tailored reports.',
    },
    solution: 'Both frameworks state the objective as providing financial information about the reporting entity that is useful to existing and potential investors, lenders and other creditors in making decisions about providing resources to it: buying or selling shares and debt, lending, and (in the IASB’s wording) influencing management’s use of resources.',
  },
  {
    id: 'f01-wia-k2', type: 'num', kind: 'numerical',
    prompt: 'Suppose Lantern reports April net income of $1,600 and later finds a $120 bill for April that was never recorded. What is the error as a percentage of reported net income?',
    answer: 7.5, check: () => (120 / 1600) * 100, unit: '%', places: 1, tol: 0.05,
    wrong: [
      { value: 8.11, say: 'You divided by the corrected net income ($1,480). Measure the error against the net income as reported.' },
      { value: 0.075, say: 'That is the decimal ratio. Enter it as a percentage: 0.075 is 7.5%.' },
    ],
    solution: '120 ÷ 1,600 = 0.075, or 7.5%. That is above a 5% rule of thumb, so Lantern should treat the error as likely to be material and correct it; net income becomes 1,600 − 120 = $1,480.',
  },
  {
    id: 'f01-wia-k3', type: 'classify', kind: 'applied',
    prompt: 'Match each practice to the assumption or principle it reflects.',
    items: [
      'A university’s accounts exclude the personal investments of its president.',
      'An airline publishes results every quarter as well as every year.',
      'An online retailer’s notes describe a lawsuit a customer has filed against it.',
      'A battery-storage installer keeps its warehouse in the records at the $380,000 it paid, although an agent now values it at $450,000.',
      'A hotel does not record the reputation its friendly staff have built.',
      'Before signing the audit report, a clothing brand’s auditor considers whether the brand can keep trading for at least the next year.',
    ],
    categories: ['Economic entity assumption', 'Full disclosure principle', 'Going concern assumption', 'Historical cost principle', 'Monetary unit assumption', 'Time period assumption'],
    answer: [0, 5, 1, 3, 4, 2],
    feedback: {
      2: 'A lawsuit is not yet a transaction, but readers need to know about it to understand the statements: full disclosure.',
      3: 'Keeping the warehouse at the price paid, rather than an estimate of today’s value, is the historical cost principle.',
      4: 'A reputation cannot be measured reliably in money, so the monetary unit assumption keeps it out.',
      5: 'Whether the business can keep trading is the going concern question, which auditors and managers must consider.',
    },
    solution: 'President’s investments: economic entity. Quarterly results: time period. Lawsuit in the notes: full disclosure. Warehouse at $380,000: historical cost. Staff reputation not recorded: monetary unit. Ability to keep trading: going concern.',
  },
  {
    id: 'f01-wia-k4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are fundamental qualitative characteristics of useful financial information? Select all that apply.',
    options: ['Relevance', 'Faithful representation', 'Comparability', 'Timeliness', 'Verifiability', 'Understandability'],
    answer: [0, 1],
    feedback: {
      2: 'Comparability is an enhancing characteristic: it makes relevant, faithful information more useful, but cannot make up for its absence.',
      3: 'Timeliness is an enhancing characteristic.',
      4: 'Verifiability is an enhancing characteristic.',
      5: 'Understandability is an enhancing characteristic.',
    },
    solution: 'The two fundamental characteristics are relevance (capable of making a difference to decisions, including materiality) and faithful representation (complete, neutral and free from error). Comparability, verifiability, timeliness and understandability enhance them.',
  },
  {
    id: 'f01-wia-k5', type: 'mc', kind: 'applied',
    prompt: 'A local café offers Lantern $14,000 for the espresso machine and grinder that Lantern bought for $12,000. Lantern declines. Ignoring the wear on the equipment that later lessons will record, at what amount does Lantern’s balance sheet show the equipment?',
    options: ['$12,000', '$14,000', '$13,000', '$0'],
    answer: 0,
    feedback: {
      1: 'An offer is not a transaction, and under the historical cost principle assets are not marked up to what someone would pay for them.',
      2: 'There is no rule for averaging cost and offers. The equipment stays at what it cost.',
      3: 'Lantern owns and uses the equipment, so it is an asset whether or not Lantern plans to sell it.',
    },
    solution: 'Under the historical cost principle, the equipment stays at its $12,000 cost. The café’s offer is useful information for Ana, but it is not a transaction and does not change the recorded amount.',
  },
  {
    id: 'f01-wia-k6', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about managerial accounting is correct?',
    options: [
      'It serves people inside the business, follows no externally imposed rules, and can use nonfinancial measures such as the number of events catered each week.',
      'It must follow US GAAP, because managers also read the financial statements.',
      'It reports only on past periods, and only for the business as a whole.',
      'It is another name for tax accounting.',
    ],
    answer: 0,
    feedback: {
      1: 'GAAP governs reports for outsiders. Internal reports can take whatever form is most useful for the decision.',
      2: 'Managerial accounting often looks forward (budgets, forecasts) and at parts of the business, such as one service or one event.',
      3: 'Tax accounting follows tax law to work out taxable income; managerial accounting serves managers’ decisions.',
    },
    solution: 'Managerial accounting produces internal reports for planning, control and decisions. It is free of external rules, can focus on parts of the business and on the future, and mixes money with nonfinancial measures.',
  },
];
