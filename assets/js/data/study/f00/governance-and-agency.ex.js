// governance-and-agency.ex.js — F00 · Governance and the agency problem: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const money = (v) => {
  const c = Math.round(Math.abs(v) * 100) / 100;
  const s = Number.isInteger(c) ? c.toLocaleString('en-US') : c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${v < 0 && c !== 0 ? '−' : ''}$${s}`;
};

export const widgets = {
  'ga-risk-shift': {
    type: 'formula',
    title: 'Risk shifting: who gains from a risky plan?',
    intro: 'A company owes its lender a fixed amount at a future date. Compare a safe plan with a risky one and see who gains and who loses from choosing the risky plan.',
    inputs: [
      { id: 'debt', label: 'Amount owed to the lender', min: 10000, max: 100000, step: 1000, value: 60000, fmt: 'money' },
      { id: 'safe', label: 'Company value under the safe plan', min: 10000, max: 150000, step: 1000, value: 70000, fmt: 'money' },
      { id: 'good', label: 'Risky plan: value if it goes well', min: 10000, max: 200000, step: 1000, value: 110000, fmt: 'money' },
      { id: 'bad', label: 'Risky plan: value if it goes badly', min: 0, max: 100000, step: 1000, value: 20000, fmt: 'money' },
      { id: 'p', label: 'Chance the risky plan goes well', min: 0, max: 100, step: 5, value: 50, fmt: 'pct' },
    ],
    compute: (v) => {
      const p = v.p / 100;
      const eq = (V) => Math.max(V - v.debt, 0);
      const dt = (V) => Math.min(V, v.debt);
      const safeE = eq(v.safe), safeD = dt(v.safe);
      const riskV = p * v.good + (1 - p) * v.bad;
      const riskE = p * eq(v.good) + (1 - p) * eq(v.bad);
      const riskD = p * dt(v.good) + (1 - p) * dt(v.bad);
      const gainE = riskE - safeE, gainD = riskD - safeD, gainV = riskV - v.safe;
      let note;
      if (gainE > 0 && gainV < 0) {
        note = `Risk shifting: the risky plan is worth ${money(-gainV)} less overall, yet shareholders gain ${money(gainE)} in expected value because the lender loses ${money(-gainD)}. Limited liability lets shareholders keep the upside while the lender bears much of the downside. This is why lenders write covenants.`;
      } else if (gainE > 0 && gainV >= 0) {
        note = `The risky plan is worth at least as much overall (${money(gainV)} more in expected value), so choosing it need not be risk shifting; but notice how the gain is split: shareholders ${money(gainE)}, lender ${money(gainD)}.`;
      } else if (gainE <= 0 && gainV > 0) {
        note = `The risky plan adds ${money(gainV)} of expected value, yet shareholders would not gain from it: the debt is so large that they expect nothing under either plan, so all of the gain goes to the lender.`;
      } else {
        note = 'Shareholders do not gain from the risky plan here. Try a larger debt, a worse bad outcome or a better good outcome to see when their interests split from the lender’s.';
      }
      return {
        headline: { label: 'Shareholders’ expected gain from choosing the risky plan', value: money(gainE) },
        rows: [
          ['Company value: safe / risky (expected)', `${money(v.safe)} / ${money(riskV)}`],
          ['Shareholders: safe / risky (expected)', `${money(safeE)} / ${money(riskE)}`],
          ['Lender: safe / risky (expected)', `${money(safeD)} / ${money(riskD)}`],
          ['Lender’s expected gain from the risky plan', money(gainD)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Claim', values: ['Shareholders', 'Lender', 'Whole company'] },
          series: [{ name: 'Safe plan', values: [safeE, safeD, v.safe] }, { name: 'Risky plan (expected)', values: [riskE, riskD, riskV] }],
          y: { label: 'Dollars' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-ga-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Is each situation mainly a conflict between shareholders and managers, or between shareholders and lenders?',
    items: [
      'A chief executive buys a rival firm mainly to run a bigger company, although the price is too high.',
      'A heavily indebted firm switches its spare cash from a safe project to a long-shot bet.',
      'A manager on a fixed salary avoids a profitable but demanding expansion.',
      'A struggling firm pays its owners a large dividend just before a loan payment falls due.',
      'A chief executive fills the office with expensive art she enjoys.',
    ],
    categories: ['Shareholders versus managers', 'Shareholders versus lenders'],
    answer: [0, 1, 0, 1, 0],
    hints: [
      'Ask who is acting and whose money is put at risk.',
      'Conflicts with lenders arise because shareholders keep the upside above the debt and can pass losses to the lender.',
    ],
    feedback: {
      1: 'The long-shot bet helps shareholders, who keep the upside, at the expense of the lenders, who bear much of the downside: risk shifting.',
      3: 'Paying cash out to owners before the lender is paid moves value from lenders to shareholders, which is why covenants often limit dividends.',
    },
    solution: 'Shareholders versus managers: the empire-building acquisition, the avoided expansion (effort) and the art (perks). Shareholders versus lenders: the long-shot bet (risk shifting) and the dividend before the loan payment.',
  },
  {
    id: 'f00-ga-g2', type: 'steps', kind: 'numerical',
    prompt: 'A chief executive owns 2% of her company’s shares. She proposes a $500,000 refurbishment of her own office that adds nothing to the company’s value. Work out who bears the cost.',
    solution: 'She bears α × P = 0.02 × 500,000 = $10,000; other shareholders bear 0.98 × 500,000 = $490,000. If incentive pay raised her stake to 10%, she would bear 0.10 × 500,000 = $50,000, five times as much, and the refurbishment would be less tempting.',
    steps: [
      { id: 'f00-ga-g2-s1', type: 'num',
        prompt: 'How much of the cost falls on the chief executive herself?',
        answer: 10000, check: () => 0.02 * 500000, unit: '$', places: 0, tol: 0.5,
        hints: ['Use C = α × P.', 'α = 0.02 and P = 500,000.'],
        wrong: [{ value: 490000, say: 'That is the other shareholders’ part. Hers is her 2% of the cost.' }, { value: 1000000, say: 'You multiplied by 2 instead of 2%. Use 0.02.' }] },
      { id: 'f00-ga-g2-s2', type: 'num',
        prompt: 'How much falls on the other shareholders?',
        answer: 490000, check: () => (1 - 0.02) * 500000, unit: '$', places: 0, tol: 0.5,
        hints: ['They own the other 98%.'],
        wrong: [{ value: 500000, say: 'The chief executive bears $10,000 of it herself through her own shares.' }] },
      { id: 'f00-ga-g2-s3', type: 'num',
        prompt: 'If her stake rose to 10%, how much of the same refurbishment would she bear?',
        answer: 50000, check: () => 0.10 * 500000, unit: '$', places: 0, tol: 0.5,
        hints: ['Same formula, α = 0.10.'] },
    ],
  },
  {
    id: 'f00-ga-g3', type: 'steps', kind: 'numerical',
    prompt: 'A fictional company owes its bank $100,000 at year end. A safe plan leaves it worth $120,000 for certain. A risky plan leaves it worth $200,000 or $20,000, each with probability 50%. Compare the plans for the whole company, the shareholders and the bank.',
    solution: 'Company: safe $120,000; risky 0.5 × 200,000 + 0.5 × 20,000 = $110,000. Shareholders: safe 120,000 − 100,000 = $20,000; risky 0.5 × 100,000 + 0.5 × 0 = $50,000. Bank: safe $100,000; risky 0.5 × 100,000 + 0.5 × 20,000 = $60,000. The risky plan is worth $10,000 less, but shareholders gain $30,000 and the bank loses $40,000: risk shifting.',
    steps: [
      { id: 'f00-ga-g3-s1', type: 'num',
        prompt: 'What is the company’s expected value under the risky plan?',
        answer: 110000, check: () => 0.5 * 200000 + 0.5 * 20000, unit: '$', places: 0, tol: 0.5,
        hints: ['Expected value = probability × outcome, added over the outcomes.', '0.5 × 200,000 + 0.5 × 20,000.'] },
      { id: 'f00-ga-g3-s2', type: 'num',
        prompt: 'What is the shareholders’ expected payoff under the risky plan?',
        answer: 50000, check: () => 0.5 * Math.max(200000 - 100000, 0) + 0.5 * Math.max(20000 - 100000, 0), unit: '$', places: 0, tol: 0.5,
        hints: ['Shareholders receive max(V − D, 0) in each outcome.', 'Good outcome: 100,000; bad outcome: 0, not a negative number.'],
        wrong: [{ value: 10000, say: 'You let the shareholders’ payoff go negative in the bad outcome. With limited liability it cannot fall below zero.' }] },
      { id: 'f00-ga-g3-s3', type: 'num',
        prompt: 'What is the bank’s expected payoff under the risky plan?',
        answer: 60000, check: () => 0.5 * Math.min(200000, 100000) + 0.5 * Math.min(20000, 100000), unit: '$', places: 0, tol: 0.5,
        hints: ['The bank receives min(V, D): at most the $100,000 it is owed.', 'Good outcome: 100,000; bad outcome: 20,000.'],
        wrong: [{ value: 100000, say: 'In the bad outcome the company is worth only $20,000, so the bank cannot be paid in full.' }, { value: 110000, say: 'The bank is never paid more than it is owed. Cap its payoff at $100,000 in the good outcome.' }] },
    ],
  },
  {
    id: 'f00-ga-g4', type: 'classify', kind: 'conceptual',
    prompt: 'Classify each item as a monitoring cost, a bonding cost or residual loss.',
    items: [
      'The fee shareholders pay an outside auditor to check the financial statements',
      'A manager agrees to a contract under which she loses her bonus if she breaks the company’s spending rules',
      'Value lost because a manager still chooses a slightly worse supplier she likes, despite all the controls',
      'The cost of independent directors’ fees and time',
      'A borrower’s cost of preparing quarterly reports that its lender’s covenants require',
    ],
    categories: ['Monitoring cost', 'Bonding cost', 'Residual loss'],
    answer: [0, 1, 2, 0, 1],
    hints: [
      'Monitoring is paid for by the principal to watch the agent; bonding is borne by the agent to reassure the principal.',
      'Residual loss is what remains after monitoring and bonding.',
    ],
    feedback: {
      1: 'The manager, the agent, accepts a penalty to assure the shareholders: a bonding cost.',
      2: 'Value still lost after the controls are in place is residual loss.',
      4: 'The borrower (here the agent) bears the cost of reports that reassure the lender: bonding. The lender’s cost of reading and checking them would be monitoring.',
    },
    solution: 'Monitoring: the auditor’s fee and the independent directors. Bonding: the manager’s penalty contract and the borrower’s covenant reports. Residual loss: the value lost to the favoured supplier despite the controls.',
  },
];

export const independent = [
  {
    id: 'f00-ga-i1', type: 'mc', kind: 'conceptual',
    prompt: 'A board pays its chief executive mostly in stock options. Which side effect should it watch for most closely?',
    options: [
      'Taking on too much risk, because options gain from a rise in the share price but lose nothing extra from a large fall',
      'Avoiding all risk, because options lose value whenever the company invests in a project whose outcome is still uncertain',
      'Paying out every dollar of profit as dividends, to keep shareholders content with her pay',
      'Refusing to work on anything that affects the share price, so that her options keep their value',
    ],
    answer: 0,
    feedback: {
      1: 'Options do the opposite: they become more valuable when outcomes are more spread out, so they tend to encourage risk, not avoid it.',
      2: 'Dividends tend to lower the share price, which reduces an option’s value, so options give no reason to pay them out.',
      3: 'Options tie the manager’s pay directly to the share price, so she has every reason to care about it.',
    },
    solution: 'An option pays only if the share price ends above the exercise price, and its holder loses nothing more however far the price falls below it. That one-sided payoff can reward risky bets whose losses fall on shareholders and lenders.',
  },
  {
    id: 'f00-ga-i2', type: 'num', kind: 'applied',
    prompt: 'A fictional bakery chain has current assets of $50,000 and current liabilities of $30,000. Its loan covenant requires a current ratio of at least 1.5. What is the largest cash dividend it can pay without breaking the covenant?',
    answer: 5000, check: () => 50000 - 1.5 * 30000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 20000, say: 'That is the whole of working capital (50,000 − 30,000). The covenant requires current assets of at least 1.5 × 30,000 = $45,000.' },
      { value: 45000, say: 'That is the minimum current assets the bakery must keep. The dividend is what can be paid out above that.' },
    ],
    solution: 'Current assets must stay at least 1.5 × 30,000 = $45,000, and a cash dividend reduces current assets one for one. Largest dividend: 50,000 − 45,000 = $5,000.',
  },
  {
    id: 'f00-ga-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Does each statement express the shareholder view or the stakeholder view of what a company is for?',
    items: [
      'Managers work for the owners and should make the company as valuable as possible for them, within the law and ethical custom.',
      'A company should deliver value to its customers, employees, suppliers and communities as well as its shareholders.',
      'Having one clear goal makes managers accountable and their performance measurable.',
      'Employees invest years of firm-specific skill that their contracts do not fully protect, so their interests deserve weight in decisions.',
    ],
    categories: ['Shareholder view', 'Stakeholder view'],
    answer: [0, 1, 0, 1],
    feedback: {
      2: 'The argument that a single goal improves accountability is the shareholder view’s main defence.',
      3: 'Pointing to investments by groups other than shareholders that contracts do not protect is a core stakeholder argument.',
    },
    solution: 'Shareholder view: managers as agents of the owners maximising value within the law and ethical custom (Friedman, 1970), and the accountability argument. Stakeholder view: serving all groups (Business Roundtable, 2019), and the argument from employees’ unprotected investments.',
  },
  {
    id: 'f00-ga-i4', type: 'mc', kind: 'conceptual',
    prompt: 'Which of these is a job of a corporation’s board of directors?',
    options: [
      'Hiring, paying and if necessary replacing the chief executive',
      'Running the company’s day-to-day operations and supervising its staff',
      'Auditing the company’s financial statements',
      'Setting the interest rate on the company’s bank loans each year',
    ],
    answer: 0,
    feedback: {
      1: 'Day-to-day operations are the managers’ job; the board oversees them on the shareholders’ behalf.',
      2: 'The audit is done by an independent outside auditor. The board oversees the reporting and the audit, but does not perform it.',
      3: 'Loan terms are agreed with the lender; the board may approve major borrowing but does not set a bank’s rates.',
    },
    solution: 'The board is elected by shareholders to oversee management: it hires, evaluates, pays and can replace the chief executive, approves strategy, major investments and dividends, and oversees financial reporting and the audit.',
  },
  {
    id: 'f00-ga-i5', type: 'num', kind: 'numerical',
    prompt: 'The chief executive of a fictional airline owns 0.2% of its shares and wants the company to buy a $5,000,000 jet for her personal trips. How much of the cost falls on her through her shares?',
    answer: 10000, check: () => 0.002 * 5000000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 1000000, say: 'You used 0.2 rather than 0.2%. As a decimal, 0.2% is 0.002.' },
      { value: 4990000, say: 'That is the cost borne by the other shareholders.' },
    ],
    solution: 'C = α × P = 0.002 × 5,000,000 = $10,000. The other shareholders bear $4,990,000, which is why boards limit and disclose such perks.',
  },
  {
    id: 'f00-ga-i6', type: 'short', kind: 'applied',
    prompt: 'In the 2028 scenario, Hollis Avery is about to buy new shares that will give her 30% of Lantern, and Coastline is about to lend $60,000. Write a short note (100–150 words) to Ana recommending three governance arrangements, and explain for each which conflict it addresses.',
    rubric: [
      'Names at least one arrangement that addresses the conflict between Ana as manager and Hollis as outside shareholder (for example a board seat, approval of large purchases or of Ana’s pay, monthly accounts).',
      'Names at least one arrangement that addresses the conflict between shareholders and the bank (for example a covenant on the current ratio, limits on dividends or new borrowing, quarterly statements).',
      'Explains why each is needed: Ana now bears only 70% of any perk; shareholders could gain from risk or dividends at the bank’s expense.',
      'Recognises a cost: the arrangements take time and reduce Ana’s freedom, which is the price of the new capital.',
    ],
    model: 'Ana, three suggestions. First, give Hollis a board seat and agree that purchases over $3,000 and any change to your salary need board approval: you now bear only 70 cents of each dollar Lantern spends, so Hollis needs a way to see and check those decisions. Second, send both Hollis and Coastline monthly accounts; the bank’s covenant requires quarterly statements anyway, and regular reporting builds trust cheaply. Third, agree a dividend policy that keeps the current ratio comfortably above the bank’s 1.2 covenant, because paying cash out to shareholders while the loan is outstanding is exactly what the bank fears. These steps cost you time and some freedom, but they are the price of $60,000 of debt and an investor you could not otherwise have.',
    solution: 'A good answer addresses both conflicts (Ana versus Hollis, shareholders versus the bank), ties each arrangement to the problem it solves, and admits the cost in time and freedom.',
  },
];

export const check = [
  {
    id: 'f00-ga-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What creates the agency problem between a company’s shareholders and its managers?',
    options: [
      'Managers’ interests differ from shareholders’, and shareholders cannot fully observe or control what managers do',
      'Managers are usually dishonest, so they hide what they do from the shareholders',
      'Shareholders are legally forbidden from knowing anything about how the company is run, so they cannot check managers',
      'Managers own too many of the company’s shares, so they can outvote the outside shareholders on every major decision',
    ],
    answer: 0,
    feedback: {
      1: 'The problem needs no dishonesty: ordinary differences in pay, effort, risk and horizon are enough.',
      2: 'Shareholders receive financial statements and other disclosure; the problem is that no report shows everything a manager does or why.',
      3: 'A larger stake actually narrows the gap, because the manager bears more of the cost of her own decisions. And the agency problem exists even when managers own no shares: it comes from the separation of ownership and control.',
    },
    solution: 'The agency problem has two ingredients: different interests (pay, effort, perks, empire, risk, horizon) and incomplete information, which stops principals from writing and enforcing a contract that makes the agent act exactly as they would.',
  },
  {
    id: 'f00-ga-k2', type: 'num', kind: 'numerical',
    prompt: 'A company owes its lender $60,000. When the debt falls due, the company’s assets are worth only $45,000. How much does the lender receive?',
    answer: 45000, check: () => Math.min(45000, 60000), unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 60000, say: 'The lender is owed $60,000, but the company has only $45,000. Lenders receive min(V, D).' },
      { value: 15000, say: 'That is the shortfall the lender suffers, not what it receives.' },
      { value: 0, say: 'That is the shareholders’ payoff, max(V − D, 0). The lender takes what there is, up to what it is owed.' },
    ],
    solution: 'Lenders receive min(V, D) = min(45,000, 60,000) = $45,000; shareholders receive max(45,000 − 60,000, 0) = $0. The lender bears the $15,000 shortfall.',
  },
  {
    id: 'f00-ga-k3', type: 'mc', kind: 'applied',
    prompt: 'Coastline Bank is about to lend $60,000 to Lantern, which now has an outside shareholder. Which covenant most directly protects the bank against shareholders taking cash out of the business while the loan is outstanding?',
    options: [
      'A limit on dividends, or a minimum current ratio that a large cash dividend would break',
      'A requirement to send the bank annual financial statements',
      'A requirement that Ana remain chief executive and keep running Lantern while the loan is outstanding',
      'A requirement to keep the equipment insured for its full replacement value while the loan is outstanding',
    ],
    answer: 0,
    feedback: {
      1: 'Annual statements tell the bank what has happened, after the event; they inform it but do not stop a payout.',
      2: 'This protects the bank against Ana leaving the business, not against cash leaving it.',
      3: 'Insurance protects the value of the equipment the bank may rely on as collateral; it does nothing to stop dividends.',
    },
    solution: 'Paying out cash to shareholders before the lender is repaid moves value from lender to shareholders. A dividend limit, or a minimum current ratio that a large cash dividend would breach, limits it, and breaking the covenant lets the bank demand repayment or renegotiate.',
  },
  {
    id: 'f00-ga-k4', type: 'num', kind: 'numerical',
    prompt: 'In the 2028 scenario Ana owns 70% of Lantern. She has Lantern pay $4,000 for a coffee-tasting trip that is really a holiday and adds nothing to the business. How much of the cost falls on Hollis, the outside shareholder?',
    answer: 1200, check: () => (1 - 0.7) * 4000, unit: '$', places: 0, tol: 0.5,
    wrong: [
      { value: 2800, say: 'That is Ana’s part, 70% of $4,000. Hollis owns the other 30%.' },
      { value: 4000, say: 'Ana bears 70% of the cost herself through her shares; Hollis bears the rest.' },
    ],
    solution: 'Others bear (1 − α) × P = 0.30 × 4,000 = $1,200; Ana bears 0.70 × 4,000 = $2,800. Before Hollis invested, Ana would have borne all $4,000.',
  },
  {
    id: 'f00-ga-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Under the SEC’s say-on-pay rules, adopted in 2011, what vote do shareholders of companies subject to the federal proxy rules get on executive pay?',
    options: [
      'An advisory, non-binding vote, held at least once every three years',
      'A binding vote that sets each executive’s salary and bonus every year',
      'No vote: pay is set by the board alone and never put to shareholders',
      'A vote by the SEC’s five commissioners on behalf of the shareholders',
    ],
    answer: 0,
    feedback: {
      1: 'The vote does not bind the company; its force comes from being public.',
      2: 'The rules require a shareholder vote, though an advisory one.',
      3: 'The shareholders vote; the SEC wrote the rules requiring the vote.',
    },
    solution: 'The rules give shareholders an advisory vote on executive pay at least once every three years, plus a vote on how often to hold it. The board still sets pay, but a large vote against is public and puts pressure on the directors.',
  },
  {
    id: 'f00-ga-k6', type: 'mc', kind: 'applied',
    prompt: 'A chief executive’s whole bonus depends on beating last year’s net income. Late in the year profit is just short of the target. Which response does this plan encourage?',
    options: [
      'Delaying maintenance and marketing spending into next year to lift this year’s profit',
      'Investing heavily in research that will pay off in five years',
      'Building up cash reserves for a downturn',
      'Increasing the training budget for staff',
    ],
    answer: 0,
    feedback: {
      1: 'Research spending lowers this year’s profit, so a one-year target discourages it.',
      2: 'A cash reserve does nothing for this year’s profit; the plan gives no reason to build one.',
      3: 'Training is an expense this year with benefits later, the kind of spending a one-year target discourages.',
    },
    solution: 'A one-year profit target rewards moving profit into the current year: postponing maintenance and marketing, pulling sales forward, stretching estimates. Boards counter it with multi-year targets, several measures and pay in shares that vest over years.',
  },
];
