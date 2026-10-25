// capital-and-liquidity.ex.js — F00 · Capital and liquidity: widget, practice and the knowledge check.
// Answer keys live here, not in the page's HTML. Every number is recomputed by `check` (see ../AUTHORING.md).

const m = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 1 })}m`;

export const widgets = {
  liquidity: {
    type: 'formula',
    title: 'Liquidity explorer: working capital, current ratio and quick ratio',
    intro: 'Amounts in $ millions. The starting values are Harbourline Roasters’ (fictional) current assets and current liabilities.',
    inputs: [
      { id: 'cash', label: 'Cash', min: 0, max: 200, step: 5, value: 45, fmt: 'num', unit: '$m' },
      { id: 'rec', label: 'Receivables', min: 0, max: 200, step: 5, value: 55, fmt: 'num', unit: '$m' },
      { id: 'inv', label: 'Inventory and other current assets', min: 0, max: 300, step: 5, value: 80, fmt: 'num', unit: '$m' },
      { id: 'cl', label: 'Current liabilities', min: 10, max: 400, step: 5, value: 120, fmt: 'num', unit: '$m' },
    ],
    compute: (v) => {
      const ca = v.cash + v.rec + v.inv;
      const wc = ca - v.cl;
      const cr = ca / v.cl;
      const qr = (v.cash + v.rec) / v.cl;
      let note;
      if (cr < 1) note = `Current liabilities exceed current assets by ${m(-wc)}, so the firm cannot cover the year’s obligations from its current assets alone. That is not automatically a crisis (a supermarket that collects cash at the till can run like this), but it calls for a close look at timing and at any credit line.`;
      else if (qr < 1) note = `The current ratio of ${cr.toFixed(2)} looks covered, but the quick ratio of ${qr.toFixed(2)} shows that paying the bills depends on selling inventory. Notice that inventory moves the current ratio and never the quick ratio.`;
      else note = `Cash and receivables alone cover current liabilities (quick ratio ${qr.toFixed(2)}). The firm is liquid on these measures; if the ratios are very high, ask whether cash or inventory is sitting idle.`;
      return {
        headline: { label: 'Current ratio', value: cr.toFixed(2) },
        rows: [
          ['Current assets', m(ca)],
          ['Working capital (current assets − current liabilities)', m(wc)],
          ['Quick ratio ((cash + receivables) ÷ current liabilities)', qr.toFixed(2)],
        ],
        note,
        chart: { kind: 'bar', x: { label: 'Item', values: ['Cash + receivables', 'All current assets', 'Current liabilities'] }, series: [{ name: '$ millions', values: [v.cash + v.rec, ca, v.cl] }], y: { label: '$ millions' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f00-cl-g1', type: 'classify', kind: 'conceptual',
    prompt: 'Is each source of money for a business debt or equity?',
    items: [
      'A five-year bank loan at 7% a year',
      'Shares sold to a group of private investors',
      'Bonds sold to investors, paying interest every six months',
      'A founder’s savings invested in exchange for common stock',
      'Profits the company keeps instead of paying them out as dividends',
      'A government-backed small-business loan',
    ],
    categories: ['Debt', 'Equity'],
    answer: [0, 1, 0, 1, 1, 0],
    hints: [
      'Ask: is a payment promised by contract, or does the supplier become an owner?',
      'Profits kept in the business belong to the shareholders, so they add to the owners’ stake, not to what the business owes.',
    ],
    feedback: {
      2: 'A bond is a loan from many investors: interest and repayment are promised, so it is debt.',
      4: 'Retained profits belong to the owners. They raise equity, even though no new shares are sold.',
      5: 'Whoever backs it, a loan must be repaid with interest: debt.',
    },
    solution: 'Debt: the bank loan, the bonds and the government-backed loan, because each promises interest and repayment. Equity: shares sold to investors, the founder’s investment for stock, and retained profits, because each is an ownership claim with no promised payment.',
  },
  {
    id: 'f00-cl-g2', type: 'steps', kind: 'numerical',
    prompt: 'An online clothing retailer (fictional) has cash of $2.0 million, receivables of $0.5 million and inventory of $4.5 million. Its current liabilities are $5.0 million. Work out its liquidity measures.',
    solution: 'Current assets = 2.0 + 0.5 + 4.5 = $7.0 million. Working capital = 7.0 − 5.0 = $2.0 million. Current ratio = 7.0 ÷ 5.0 = 1.4. Quick ratio = (2.0 + 0.5) ÷ 5.0 = 0.5. The retailer covers its obligations only if it sells its clothes: cash and receivables cover half of them.',
    steps: [
      { id: 'f00-cl-g2-s1', type: 'num', prompt: 'Working capital, in $ millions.',
        answer: 2.0, check: () => (2.0 + 0.5 + 4.5) - 5.0, unit: '$m', places: 1, tol: 0.05,
        hints: ['Add up the current assets first.', 'Current assets are 7.0; subtract current liabilities.'],
        wrong: [{ value: 7.0, say: 'That is total current assets. Working capital subtracts current liabilities.' }, { value: -2.5, say: 'You left inventory out. Working capital uses all current assets; only the quick ratio leaves inventory out.' }] },
      { id: 'f00-cl-g2-s2', type: 'num', prompt: 'Current ratio.',
        answer: 1.4, check: () => (2.0 + 0.5 + 4.5) / 5.0, unit: '', places: 2, tol: 0.005,
        hints: ['Divide current assets by current liabilities.'],
        wrong: [{ value: 0.71, say: 'You divided current liabilities by current assets. Put current assets on top.' }] },
      { id: 'f00-cl-g2-s3', type: 'num', prompt: 'Quick ratio.',
        answer: 0.5, check: () => (2.0 + 0.5) / 5.0, unit: '', places: 2, tol: 0.005,
        hints: ['Leave inventory out of the top.', '(Cash + receivables) ÷ current liabilities.'],
        wrong: [{ value: 1.4, say: 'That is the current ratio. The quick ratio leaves out inventory.' }, { value: 0.4, say: 'You left out receivables. Customers’ debts count as quick assets; only inventory and prepayments are left out.' }] },
    ],
  },
  {
    id: 'f00-cl-g3', type: 'classify', kind: 'applied',
    prompt: 'Each business is fictional. Classify each situation.',
    items: [
      'A family farm owns land worth $4 million and owes $500,000, but its harvest money arrives in October and a $60,000 equipment payment is due in June. It has $5,000 in the bank.',
      'A software firm holds $50 million in cash and owes $10 million, all due within the year.',
      'A travel agency holds $3 million of customers’ advance payments in its bank account, but after a collapse in bookings its total debts of $9 million exceed everything it owns, which is worth $4 million. Its bills due in the next three months total $1 million.',
      'A café owes $200,000 to a bank, due next month, and has $5,000 in cash; its equipment would sell for $40,000.',
    ],
    categories: ['Liquid and solvent', 'Solvent but illiquid', 'Liquid but insolvent', 'Illiquid and insolvent'],
    answer: [1, 0, 2, 3],
    hints: [
      'Ask two questions for each: can it pay what is due soon? Are its assets worth more than everything it owes?',
      'The farm is rich in land but short of cash; the travel agency has cash now but owes more than it owns.',
    ],
    feedback: {
      0: 'The farm’s land is worth far more than its debts (solvent), but its cash cannot cover the June payment (illiquid). Borrowing against the land could bridge the gap.',
      2: 'The agency can pay this month’s bills from the deposits (liquid) but owes $9 million against $4 million of assets (insolvent).',
      3: 'The café cannot pay next month’s $200,000 and its assets are worth far less than it owes: both problems at once.',
    },
    solution: 'Farm: solvent but illiquid. Software firm: liquid and solvent. Travel agency: liquid but insolvent. Café: illiquid and insolvent.',
  },
  {
    id: 'f00-cl-g4', type: 'num', kind: 'applied',
    prompt: 'Ana keeps a $6,000 emergency fund. Suppose her essential personal spending turns out to be $2,400 a month rather than the $2,000 assumed in the lesson. How many months of essential spending does the fund cover?',
    answer: 2.5, check: () => 6000 / 2400, unit: 'months', places: 1, tol: 0.05,
    hints: ['Months covered = liquid savings ÷ essential spending per month.', '6,000 ÷ 2,400.'],
    wrong: [
      { value: 3, say: 'That uses the lesson’s $2,000 a month. Use the higher figure of $2,400.' },
      { value: 10.83, say: 'You included her $20,000 stake in Lantern. Shares in a private company are not liquid, so they don’t count.' },
    ],
    solution: '6,000 ÷ 2,400 = 2.5 months. Higher spending shortens the cushion from three months to two and a half. Only liquid savings count: her $20,000 in Lantern cannot be reached quickly at a fair price.',
  },
];

export const independent = [
  {
    id: 'f00-cl-i1', type: 'order', kind: 'conceptual',
    prompt: 'Put these assets in order from the most liquid to the least liquid, for a typical owner.',
    items: [
      'Banknotes in a cash register',
      'Money in a bank savings account',
      'Shares of a large company listed on a stock exchange',
      'A delivery van the business uses every day',
      'A 30% stake in a small private company',
    ],
    solution: 'Banknotes are cash already. A savings account can usually be withdrawn the same day at full value. Listed shares sell in seconds, but at whatever price the market offers that day. A used van takes time to sell and usually fetches less than it is worth to its owner. A minority stake in a private company may find no buyer at all for months.',
  },
  {
    id: 'f00-cl-i2', type: 'num', kind: 'numerical',
    prompt: 'A fictional 120-room hotel has current assets of $1,350,000 and current liabilities of $1,500,000. What is its current ratio? Give two decimal places.',
    answer: 0.9, check: () => 1350000 / 1500000, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.11, say: 'You divided current liabilities by current assets. The current ratio puts current assets on top.' },
      { value: -150000, say: 'That is the working capital (negative here). The question asks for the ratio.' },
    ],
    solution: '1,350,000 ÷ 1,500,000 = 0.90. The hotel’s working capital is negative (−$150,000): its current assets do not cover what it owes within the year. That needs a closer look at timing, for example whether guests’ payments arrive before the bills are due, and at whether the hotel has a credit line.',
  },
  {
    id: 'f00-cl-i3', type: 'mc', kind: 'conceptual',
    prompt: 'A firm with a current ratio of 2.0 uses cash to pay a supplier it owes. What happens to its working capital and its current ratio?',
    options: [
      'Working capital is unchanged; the current ratio rises',
      'Working capital falls; the current ratio falls',
      'Both are unchanged, because the payment is not an expense',
      'Working capital is unchanged; the current ratio falls',
    ],
    answer: 0,
    feedback: {
      1: 'Cash falls, but so does the amount owed, by the same sum. The difference between them, working capital, cannot change.',
      2: 'Working capital is unchanged, but the ratio changes because both totals shrink by the same amount from different starting sizes.',
      3: 'With current assets twice current liabilities, taking the same sum from both raises the ratio. Try it: 200 ÷ 100 = 2.0; 150 ÷ 50 = 3.0.',
    },
    solution: 'Current assets and current liabilities both fall by the payment, so their difference is unchanged. When the ratio is above 1, removing the same amount from both raises it (for example, 200 ÷ 100 = 2.0 becomes 150 ÷ 50 = 3.0). The firm has not become more liquid in any useful sense: it has less cash and fewer bills.',
  },
  {
    id: 'f00-cl-i4', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these are features of equity rather than debt? Select all that apply.',
    options: [
      'A residual claim: paid after all lenders and other creditors',
      'Votes on major decisions, such as electing the board',
      'Payments promised by contract on fixed dates',
      'No upper limit on what the holder can gain',
      'Repayment of the amount invested on a set date',
    ],
    answer: [0, 1, 3],
    feedback: {
      2: 'Promised payments on fixed dates are the defining feature of debt. Shareholders are promised nothing.',
      4: 'Lenders are repaid by a set date. Shareholders get money back only through dividends or by selling their shares to someone else.',
    },
    solution: 'Equity holders have a residual claim, vote, and have unlimited upside. Contractual payments and repayment by a set date belong to debt.',
  },
  {
    id: 'f00-cl-i5', type: 'num', kind: 'numerical',
    prompt: 'A fictional bakery chain is financed with $4.5 million of debt and $3.0 million of shareholders’ equity. What is its debt-to-equity ratio (debt divided by equity)?',
    answer: 1.5, check: () => 4.5 / 3.0, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 0.67, say: 'You divided equity by debt. Debt goes on top.' },
      { value: 0.6, say: 'That is debt as a share of all capital (4.5 ÷ 7.5). The debt-to-equity ratio divides debt by equity only.' },
    ],
    solution: '4.5 ÷ 3.0 = 1.5: the chain has $1.50 of debt for every dollar of equity. Debt is 4.5 ÷ 7.5 = 60% of its capital, so its shareholders’ returns are strongly leveraged.',
  },
  {
    id: 'f00-cl-i6', type: 'mc', kind: 'applied',
    prompt: 'Lantern earns operating profit (before interest) of $1,500 in a year on its $30,000 of capital, and pays $600 of interest on its $10,000 loan. Ignoring tax, how does Ana’s return on her $20,000 compare with what it would have been had she supplied all $30,000 herself?',
    options: [
      'Lower: 4.5% instead of 5%, because the business earned less on its capital than the 6% loan rate',
      'Higher: 7.5% instead of 5%, because debt always raises the owner’s return on the money she put in',
      'The same: 5% either way, because how a business is financed does not change what its owner earns',
      'Lower: 3% instead of 5%, because Ana’s $900 of profit after interest is spread over all $30,000 of capital',
    ],
    answer: 0,
    feedback: {
      1: '7.5% is $1,500 ÷ $20,000, which forgets the $600 of interest. Debt raises the owner’s return only when the business earns more on its capital than the interest rate.',
      2: 'With debt, the owner receives what is left after the interest set by the loan contract, so her return differs from the return on all capital unless the business earns exactly the interest rate.',
      3: 'That divides Ana’s $900 by all $30,000. The bank is paid separately through its interest; Ana’s return is $900 on her own $20,000: 4.5%.',
    },
    solution: 'Return on all capital = 1,500 ÷ 30,000 = 5%. With the loan, Ana receives 1,500 − 600 = $900, which is 900 ÷ 20,000 = 4.5% of her $20,000. Because the business earned 5%, less than the 6% the bank charges, leverage lowered her return. Had Lantern earned more than 6% on its capital, it would have raised it.',
  },
];

export const check = [
  {
    id: 'f00-cl-k1', type: 'mc', kind: 'conceptual',
    prompt: 'Why is equity usually expected to cost a business more than debt?',
    options: [
      'Shareholders are paid last and promised nothing, so they bear more risk and expect a higher return',
      'The law requires a company to pay its shareholders a higher return each year than the interest rate it pays its lenders',
      'Equity has to be repaid to shareholders sooner than loans have to be repaid to the banks that made them',
      'Banks charge large fees for issuing shares, and those fees are the main cost of equity',
    ],
    answer: 0,
    feedback: {
      1: 'There is no such rule; a company need never pay a dividend. The cost of equity is an expected return, not a legal payment.',
      2: 'Equity is never repaid on a set date; debt is.',
      3: 'Issuing shares does have costs, but they are not the main reason. The main reason is the risk shareholders bear.',
    },
    solution: 'Lenders have a claim set by contract that comes first; shareholders have a residual claim that comes last and is not promised. Bearing more risk, shareholders require a higher expected return, so equity is the more expensive source of capital even though no payment is guaranteed.',
  },
  {
    id: 'f00-cl-k2', type: 'num', kind: 'numerical',
    prompt: 'Using the lesson’s figures, Harbourline has current assets of $180 million and current liabilities of $120 million. It buys $15 million of extra green coffee on 30-day credit from a supplier. What is its current ratio afterwards? Give two decimal places.',
    answer: 1.44, check: () => (180 + 15) / (120 + 15), unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.5, say: 'Both inventory (a current asset) and the amount owed to the supplier (a current liability) rise by $15 million, and that changes the ratio.' },
      { value: 1.63, say: 'You added the inventory but not the new amount owed. Buying on credit creates a current liability too.' },
    ],
    solution: 'Inventory rises by $15 million and so does the amount owed to the supplier: (180 + 15) ÷ (120 + 15) = 195 ÷ 135 ≈ 1.44. Working capital stays at $60 million, but adding the same amount to both sides pulls a ratio above 1 down towards 1.',
  },
  {
    id: 'f00-cl-k3', type: 'mc', kind: 'applied',
    prompt: 'A fictional builder reports a current ratio of 2.2 but a quick ratio of 0.4. Most of its current assets are unsold new houses. Which conclusion is best?',
    options: [
      'Paying its near-term bills depends on selling the houses; check how fast they sell and whether it has a credit line',
      'It is very liquid, because a current ratio above 2 is always a safe sign, whatever its current assets consist of',
      'It is insolvent, because a quick ratio below 1 means it owes more than it owns',
      'The two ratios contradict each other, so one of them must have been calculated wrongly',
    ],
    answer: 0,
    feedback: {
      1: 'The current ratio counts unsold houses as if they were nearly cash. The quick ratio shows that, without sales, cash and receivables cover only 40% of what is due.',
      2: 'A low quick ratio is about liquidity, not solvency. The builder may well own more than it owes.',
      3: 'Both can be right: they differ precisely because inventory is a large part of current assets.',
    },
    solution: 'The gap between 2.2 and 0.4 is the unsold houses. Whether the builder can pay its bills depends on selling them in time, so an analyst looks at sales speed, at the timing of the obligations and at any credit line before drawing a conclusion.',
  },
  {
    id: 'f00-cl-k4', type: 'num', kind: 'numerical',
    prompt: 'On 3 March 2026 Lantern buys equipment for $12,000, paying $4,000 in cash and owing the supplier $8,000 within 30 days. Before this, its only asset was $30,000 of cash and its only liability the $10,000 bank note due in 2028. What is Lantern’s current ratio after the purchase?',
    answer: 3.25, check: () => (30000 - 4000) / 8000, unit: '', places: 2, tol: 0.005,
    wrong: [
      { value: 1.44, say: 'The bank note is due in 2028, more than a year away, so it is not a current liability. Only the $8,000 owed to the supplier is.' },
      { value: 4.75, say: 'You counted the $12,000 of equipment as a current asset. Lantern will use it for years, so it is noncurrent: current assets are only the $26,000 of cash.' },
      { value: 3.75, say: 'Cash fell by the $4,000 paid to the supplier: use 26,000, not 30,000.' },
    ],
    solution: 'Current assets: cash 30,000 − 4,000 = $26,000 (the equipment is noncurrent). Current liabilities: the $8,000 due to the supplier (the bank note is due in 2028, so it is noncurrent). Current ratio = 26,000 ÷ 8,000 = 3.25.',
  },
  {
    id: 'f00-cl-k5', type: 'mc', kind: 'conceptual',
    prompt: 'Which statement about working capital is correct?',
    options: [
      'It is current assets minus current liabilities, a measure of a firm’s short-term cushion',
      'It is the money shareholders invested to run the firm’s day-to-day operations, such as buying inventory',
      'It is the same thing as the firm’s cash balance',
      'It is total assets minus total liabilities, a measure of what the whole firm is worth to its owners',
    ],
    answer: 0,
    feedback: {
      1: 'Despite the name, working capital is not invested money; it is a difference between two parts of the balance sheet.',
      2: 'Cash is only one current asset. Working capital also counts receivables and inventory, and subtracts current liabilities.',
      3: 'Total assets minus total liabilities is equity (book value), a solvency idea. Working capital uses only current items.',
    },
    solution: 'Working capital = current assets − current liabilities. Positive working capital means the assets that should turn into cash within a year exceed what must be paid within a year.',
  },
  {
    id: 'f00-cl-k6', type: 'mc', kind: 'applied',
    prompt: 'After 1 March 2026, Ana owns $20,000 of Lantern’s shares and $6,000 in a savings account. A friend says: “You have $26,000, so you don’t need an emergency fund.” What is the best reply?',
    options: [
      'Only the $6,000 is liquid; the Lantern shares can’t be sold quickly at a fair price to pay an urgent bill',
      'The friend is right: $26,000 is plenty for an emergency, whatever form the money is in',
      'The Lantern shares are more liquid than the savings, because they could rise in value before she needs the money',
      'Neither is liquid, because both the shares and the savings account could lose value',
    ],
    answer: 0,
    feedback: {
      1: 'Liquidity depends on the form of the asset, not only its value. Shares in a small private company have no market where they can be sold in a day.',
      2: 'A chance to rise in value is about return, not liquidity. Liquidity is how quickly and cheaply an asset becomes cash.',
      3: 'A bank deposit can be withdrawn at its full value at short notice: it is highly liquid.',
    },
    solution: 'Personal liquidity counts only what can be reached quickly at full value. Ana’s savings account is liquid; her stake in Lantern is not, so her emergency fund is $6,000, about three months of essential spending on the lesson’s assumption.',
  },
];
