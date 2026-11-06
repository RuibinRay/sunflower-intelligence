// capital-structure.ex.js — F05 · Capital structure: widgets, practice and the knowledge check (answer keys live here).
// Brookvale Bakeries is the lesson’s fictional running example; every other business here is fictional and invented for
// the exercise. Survey figures are Graham & Harvey (2002), as cited in the lesson.
import * as CF from '../../../core/corpfin.js?v=28';

const money = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const money2 = (v) => `${v < 0 ? '−' : ''}$${Math.abs(v).toFixed(2)}`;
const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const r2 = (v) => Math.round(v * 100) / 100;

const VU = 1_500_000;   // Brookvale with tax (lesson)

export const widgets = {
  'cap-eps': {
    type: 'formula',
    title: 'EPS with and without debt: Brookvale Bakeries (fictional)',
    intro: 'Brookvale has 100,000 shares at $20 and no debt. The levered plan borrows the amount below and buys back shares at $20.',
    inputs: [
      { id: 'ebit', label: 'EBIT this year', min: 0, max: 500000, step: 10000, value: 240000, fmt: 'money' },
      { id: 'debt', label: 'Debt raised to buy back shares', min: 0, max: 1600000, step: 100000, value: 800000, fmt: 'money' },
      { id: 'rate', label: 'Interest rate on the debt', min: 2, max: 15, step: 0.5, value: 8, fmt: 'pct' },
      { id: 'tax', label: 'Corporate tax rate', min: 0, max: 40, step: 1, value: 0, fmt: 'pct' },
    ],
    compute: (v) => {
      const N1 = 100000, N2 = N1 - v.debt / 20, t = v.tax / 100, I = v.debt * v.rate / 100;
      const epsU = (e) => e * (1 - t) / N1, epsL = (e) => (e - I) * (1 - t) / N2;
      const xs = Array.from({ length: 11 }, (_, i) => i * 50000);
      const be = v.debt > 0 ? I * N1 / (N1 - N2) : null;
      const rows = [
        ['EPS, all equity (100,000 shares)', money2(epsU(v.ebit))],
        [`EPS, levered (${N2.toLocaleString('en-US')} shares)`, money2(epsL(v.ebit))],
        ['Interest', money(I)],
        ['EBIT at which the plans tie', be == null ? 'no debt: the plans are the same' : money(be)],
      ];
      const above = be != null && v.ebit > be;
      return {
        headline: { label: 'Levered EPS minus all-equity EPS', value: money2(epsL(v.ebit) - epsU(v.ebit)) },
        rows,
        note: be == null ? 'With no debt the two plans are identical.'
          : `${above ? 'EBIT is above the break-even, so the assets earn more than the debt costs and leverage raises EPS.' : v.ebit < be ? 'EBIT is below the break-even, so the debt costs more than the assets earn and leverage lowers EPS.' : 'EBIT is exactly at the break-even: both plans give the same EPS.'} The break-even is where the assets earn ${v.rate}% on their $2,000,000, whatever the debt or the tax rate. The levered line is steeper: EPS swings more.`,
        chart: { kind: 'line', x: { label: 'EBIT ($)', values: xs },
          series: [{ name: 'All equity', values: xs.map((e) => r2(epsU(e))) }, { name: 'Levered', values: xs.map((e) => r2(epsL(e))) }],
          y: { label: 'EPS ($)' } },
      };
    },
  },
  'cap-mm': {
    type: 'capstructure',
    title: 'Modigliani and Miller: Brookvale Bakeries (fictional)',
    peers: [{ name: 'Brookvale’s assets (no debt, fictional)', beta: 0.8, de: 0, tax: 0.25 }],
    rf: 0.08, mrp: 0.05, tax: 0.25, rD: 0.08, dv: 0.25, dvMax: 0.7, taxToggle: true, Vu: VU,
    note: 'Debt is priced at the risk-free rate (8%) at every debt share, as in Modigliani and Miller’s propositions, and the asset beta of 0.8 gives r_U = 8% + 0.8 × 5% = 12%. Firm value uses Brookvale’s after-tax unlevered value of $1,500,000: with tax off it simply stays at V_U (Proposition I). Real lenders charge more as debt rises, and the costs of distress are not in this picture; the next widget adds them.',
  },
  'cap-tradeoff': {
    type: 'formula',
    title: 'The trade-off: tax shields against distress costs',
    intro: 'Brookvale (fictional) with V_U = $1,500,000. The present value of distress costs is assumed to be severity × D² ÷ V_U, an invented shape that rises steeply with debt.',
    inputs: [
      { id: 'debt', label: 'Permanent debt D', min: 0, max: 1200000, step: 25000, value: 300000, fmt: 'money' },
      { id: 'tax', label: 'Corporate tax rate', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
      { id: 'sev', label: 'Severity of distress costs', min: 0, max: 2, step: 0.05, value: 0.5, fmt: 'num' },
    ],
    compute: (v) => {
      const t = v.tax / 100, val = (D) => VU + t * D - v.sev * D * D / VU;
      const xs = Array.from({ length: 13 }, (_, i) => i * 100000);
      let best;
      if (v.sev === 0) best = t > 0 ? 'No interior best: with no distress costs every dollar of debt adds value (Modigliani–Miller with tax).' : 'Any debt: with no tax and no distress costs, value never changes (Modigliani–Miller without taxes).';
      else best = `${money(t * VU / (2 * v.sev))} of debt, firm value ${money(val(t * VU / (2 * v.sev)))}`;
      return {
        headline: { label: 'Firm value V_L', value: money(val(v.debt)) },
        rows: [
          ['PV of tax shields, T × D', money(t * v.debt)],
          ['PV of distress costs', money(v.sev * v.debt * v.debt / VU)],
          ['Debt share D/V_L', pct(v.debt / val(v.debt))],
          ['Best debt level', best],
        ],
        note: v.sev > 0 && t > 0 ? `At the best debt level one more dollar of debt adds ${pct(t, 0)} of tax shield and the same amount of expected distress cost. More severe distress costs, as for a firm whose value is in brands or research, move the best level down; a firm with saleable, tangible assets can borrow more.`
          : 'With one of the two forces switched off there is no balance to strike.',
        chart: { kind: 'line', x: { label: 'Debt ($)', values: xs },
          series: [{ name: 'Firm value', values: xs.map((D) => Math.round(val(D))) }, { name: 'No distress costs', values: xs.map((D) => Math.round(VU + t * D)) }],
          y: { label: 'Value ($)' } },
      };
    },
  },
};

export const guided = [
  {
    id: 'f05-cap-g1', type: 'steps', kind: 'numerical',
    prompt: 'Mirelle Cosmetics, a fictional listed firm, has 200,000 shares at $50 and no debt. It plans to borrow $4,000,000 at 6% and buy back 80,000 shares at $50. EBIT is expected to be $1,200,000 a year. Ignore taxes.',
    solution: 'All equity: EPS = 1,200,000 ÷ 200,000 = $6.00. Levered: interest 4,000,000 × 6% = 240,000; EPS = (1,200,000 − 240,000) ÷ 120,000 = $8.00. Break-even: EBIT ÷ 200,000 = (EBIT − 240,000) ÷ 120,000, so EBIT = 240,000 × 200,000 ÷ 80,000 = $600,000, where the assets earn 6% on their $10,000,000.',
    steps: [
      { id: 'f05-cap-g1-s1', type: 'num', prompt: 'What is EPS with no debt?',
        answer: 6, check: () => 1200000 / 200000, unit: '$', places: 2, tol: 0.005,
        hints: ['EPS = EBIT ÷ shares when there is no interest or tax.'] },
      { id: 'f05-cap-g1-s2', type: 'num', prompt: 'What is EPS under the levered plan?',
        answer: 8, check: () => (1200000 - 4000000 * 0.06) / (200000 - 80000), unit: '$', places: 2, tol: 0.005,
        hints: ['Subtract the interest from EBIT.', 'Divide by the shares left after the buyback: 120,000.'],
        wrong: [
          { value: 4.8, say: 'You divided by the original 200,000 shares. The buyback leaves 120,000.' },
          { value: 10, say: 'You left out the interest of $240,000.' },
        ] },
      { id: 'f05-cap-g1-s3', type: 'num', prompt: 'At what EBIT do the two plans give the same EPS?',
        answer: 600000, check: () => 4000000 * 0.06 * 200000 / 80000, unit: '$', places: 0, tol: 1,
        hints: ['Set EBIT ÷ 200,000 equal to (EBIT − 240,000) ÷ 120,000.', 'Cross-multiply: 120,000 EBIT = 200,000 EBIT − 48,000,000,000.'],
        wrong: [
          { value: 240000, say: 'That is the interest. At EBIT of $240,000 the levered plan’s EPS is zero, while the all-equity plan’s is $1.20.' },
          { value: 400000, say: 'Check by substituting: at $400,000 the plans give $2.00 and $1.33. Solve 120,000 × EBIT = 200,000 × (EBIT − 240,000).' },
        ] },
    ],
  },
  {
    id: 'f05-cap-g2', type: 'num', kind: 'numerical',
    prompt: 'In a world with no taxes, a fictional firm’s assets have a required return of 10%. It borrows at 5% and keeps debt at half the market value of its equity (D/E = 0.5). Under Modigliani and Miller’s Proposition II, what is its cost of equity, as a percentage?',
    answer: 12.5, check: () => (0.10 + (0.10 - 0.05) * 0.5) * 100, unit: '%', places: 2, tol: 0.01,
    hints: ['r_E = r_U + (r_U − r_D) × D/E.', '10% + 5% × 0.5.'],
    wrong: [
      { value: 11.67, say: 'You used D/V (one third) instead of D/E. Proposition II uses debt to equity.' },
      { value: 10, say: 'That is r_U, the cost of capital of the assets, which is also the WACC without taxes. Equity bears the assets’ risk on a smaller base, so it costs more.' },
      { value: 7.5, say: 'That averages the two rates. The cost of equity is above r_U, not between r_D and r_U.' },
    ],
    solution: 'r_E = 10% + (10% − 5%) × 0.5 = 12.5%. Check the WACC: D/V = 1/3, E/V = 2/3, so 2/3 × 12.5% + 1/3 × 5% = 10%, unchanged by the leverage.',
  },
  {
    id: 'f05-cap-g3', type: 'steps', kind: 'numerical',
    prompt: 'Tamberlin Cold Storage, a fictional warehouse company, is worth $8,000,000 with no debt. It pays tax at 25% and borrows $2,000,000 at 7%, intending to keep that debt for good. Use Modigliani and Miller with corporate tax.',
    solution: 'Interest = 2,000,000 × 7% = 140,000; tax saved = 25% × 140,000 = $35,000 a year. PV = 35,000 ÷ 0.07 = $500,000 = T × D. V_L = 8,000,000 + 500,000 = $8,500,000.',
    steps: [
      { id: 'f05-cap-g3-s1', type: 'num', prompt: 'What is the interest tax shield each year?',
        answer: 35000, check: () => 0.25 * 0.07 * 2000000, unit: '$', places: 0, tol: 1,
        hints: ['The shield is the tax saved on the interest.', 'Interest is $140,000; tax at 25% of that.'],
        wrong: [{ value: 140000, say: 'That is the interest itself. The shield is the tax the interest saves: 25% of it.' }, { value: 500000, say: 'That is the present value of all future shields, not one year’s.' }] },
      { id: 'f05-cap-g3-s2', type: 'num', prompt: 'What is the present value of the tax shields?',
        answer: 500000, check: () => 0.25 * 0.07 * 2000000 / 0.07, unit: '$', places: 0, tol: 1,
        hints: ['Permanent debt gives a perpetuity of shields.', 'Discount at the cost of debt: 35,000 ÷ 0.07, which equals T × D.'],
        wrong: [{ value: 140000, say: 'Discount the $35,000 a year as a perpetuity at 7%: 35,000 ÷ 0.07.' }] },
      { id: 'f05-cap-g3-s3', type: 'num', prompt: 'What is the value of the levered firm?',
        answer: 8500000, check: () => 8000000 + 0.25 * 2000000, unit: '$', places: 0, tol: 1,
        hints: ['V_L = V_U + T × D.'],
        wrong: [{ value: 10000000, say: 'Adding all the debt double-counts. The debt changes who holds the claims; only the tax saving adds value.' }, { value: 6000000, say: 'That is V_U − D, the equity if borrowing added nothing. V_L is debt plus equity: V_U + T × D.' }] },
    ],
  },
  {
    id: 'f05-cap-g4', type: 'mc', kind: 'conceptual',
    prompt: 'In a perfect market without taxes, Sallowfield Software (fictional) has debt equal to its equity at market values. An investor holds $10,000 of its shares but would rather have the risk of an all-equity Sallowfield. What does Modigliani and Miller’s homemade-leverage argument say she can do?',
    options: [
      'Sell half her shares and lend the $5,000, for example by buying Sallowfield’s bonds',
      'Borrow $10,000 on her own account at the bank’s rate and use it to buy more Sallowfield shares',
      'Nothing: only the company itself can change the risk of its shares, by repaying some of its debt',
      'Sell all her shares, because levered shares always carry more risk than she wants',
    ],
    answer: 0,
    hints: ['To undo the firm’s borrowing, do the opposite on your own account.', 'Holding both the firm’s debt and its equity in the same proportions as the firm is like owning the assets.'],
    feedback: {
      1: 'Borrowing adds more leverage on top of the firm’s. To undo leverage, lend.',
      2: 'That is exactly what the argument denies: an investor can undo a firm’s leverage herself, which is why the firm cannot create value by choosing it.',
      3: 'She needn’t give up the investment; she can reshape its risk by holding some of the firm’s debt alongside its shares.',
    },
    solution: 'With D = E, owning half of what she holds in shares and half in the firm’s debt gives her a slice of both claims in the firm’s own proportions: a slice of the whole asset cash flow, which is what all-equity shares would give. Because investors can make or undo leverage at no cost, they will not pay extra for a firm that does it for them.',
  },
];

export const independent = [
  {
    id: 'f05-cap-i1', type: 'num', kind: 'numerical',
    prompt: 'A fictional firm in a world without taxes has a cost of equity of 15%, borrows at 6%, and has debt equal to 40% of its value. It plans to repay debt until debt is 20% of its value; it will still borrow at 6%. Under Modigliani and Miller, what will its cost of equity be, as a percentage?',
    answer: 12.75, check: () => { const ru = 0.6 * 0.15 + 0.4 * 0.06; return (ru + (ru - 0.06) * (0.2 / 0.8)) * 100; }, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 15, say: 'The cost of equity falls when debt falls: equity carries less financial risk.' },
      { value: 11.4, say: 'That is r_U, which equals the WACC before and after. The cost of equity is r_U plus a premium for the remaining debt.' },
      { value: 12.48, say: 'You used D/V (0.2) instead of D/E (0.2 ÷ 0.8 = 0.25).' },
    ],
    solution: 'First find r_U, which without taxes equals the WACC: 0.6 × 15% + 0.4 × 6% = 11.4%. At D/V = 20%, D/E = 0.25. r_E = 11.4% + (11.4% − 6%) × 0.25 = 12.75%. Check: 0.8 × 12.75% + 0.2 × 6% = 11.4%.',
  },
  {
    id: 'f05-cap-i2', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds a fictional company’s unlevered cost of capital, cost of debt, tax rate, and the market values of its debt and equity. In B7, calculate its cost of equity under Modigliani and Miller with corporate tax.',
    sheet: { cells: {
      A1: 'Unlevered cost of capital r_U', B1: 0.11,
      A2: 'Cost of debt r_D', B2: 0.065,
      A3: 'Tax rate T', B3: 0.25,
      A4: 'Debt, market value ($)', B4: 3000000,
      A5: 'Equity, market value ($)', B5: 6000000,
      A7: 'Cost of equity r_E',
    } },
    cell: 'B7', answer: '=B1+(B1-B2)*(1-B3)*B4/B5',
    alt: ['=B1+(B1-B2)*(1-B3)*(B4/B5)', '=B1+(1-B3)*(B1-B2)*B4/B5', '=B1+B4/B5*(1-B3)*(B1-B2)'],
    view: 'A1:B7', widths: { A: 30, B: 14 }, formats: { B1: '0.00%', B2: '0.00%', B3: '0%', B4: '#,##0', B5: '#,##0', B7: '0.00%' },
    wrong: [
      { formula: '=B1+(B1-B2)*B4/B5', say: 'That is the no-tax version. With corporate tax the premium is multiplied by (1 − T), because the tax shield takes some of the risk off the shareholders.' },
      { formula: '=B1+(B1-B2)*(1-B3)*B4/(B4+B5)', say: 'Proposition II uses debt to equity, D/E, not debt to value.' },
      { formula: '=B1*B5/(B4+B5)+B2*(1-B3)*B4/(B4+B5)', say: 'That is a WACC built from r_U, not the cost of equity.' },
    ],
    solution: '<x>=B1+(B1-B2)*(1-B3)*B4/B5</x> = 11% + 4.5% × 0.75 × 0.5 = 12.69%. The premium over r_U grows with D/E and shrinks with the tax rate.',
  },
  {
    id: 'f05-cap-i3', type: 'classify', kind: 'conceptual',
    prompt: 'Which view of capital structure does each statement come from?',
    items: [
      'A firm’s value is the same whatever mix of debt and equity it uses.',
      'A firm with steady taxable profits and tangible assets should borrow more than one whose value lies in research.',
      'A very profitable firm with few investment needs will end up with little debt.',
      'Investors read a new share issue as a sign that managers think the shares are overpriced.',
      'Each firm has a debt level at which the last dollar of debt adds as much expected distress cost as tax saving.',
      'Investors can copy or undo any capital structure by borrowing or lending on their own account.',
    ],
    categories: ['Modigliani–Miller without taxes', 'Trade-off theory', 'Pecking order theory'],
    answer: [0, 1, 2, 2, 1, 0],
    feedback: {
      1: 'The trade-off theory: tangible assets keep their value in distress and steady profits use the tax shield, so expected distress costs are low relative to tax savings.',
      2: 'The pecking order: debt is the accumulated record of the need for outside money, so a cash-rich firm borrows little. The trade-off theory would predict the opposite, since such a firm has the most profit to shield.',
      3: 'The pecking order’s starting point is asymmetric information about the shares’ value.',
    },
    solution: 'MM without taxes: value independence and homemade leverage. Trade-off: debt capacity depends on tax use and on what assets are worth in distress; a target where marginal benefit equals marginal cost. Pecking order: equity issues read as bad news; leverage reflects accumulated financing needs.',
  },
  {
    id: 'f05-cap-i4', type: 'mc', kind: 'applied',
    prompt: 'Two fictional firms pay tax at the same rate and have the same expected EBIT. One operates a toll bridge under a 40-year concession with steady traffic; the other designs video games and its value lies in its studio’s staff and future titles. According to the trade-off theory, which should have more debt, and why?',
    options: [
      'The bridge operator: steady cash flows and an asset that keeps its value make expected distress costs low',
      'The games studio, because its higher growth means it has more future profit to shield from tax',
      'Neither: with equal tax rates and equal expected EBIT, the trade-off theory gives them the same target',
      'The games studio, because its shareholders can gain more from the risky new titles that extra debt would encourage them to fund',
    ],
    answer: 0,
    feedback: {
      1: 'Growth does not add tax shield today, and the studio’s value, its people and future games, could disappear in distress. That makes distress costs high, which lowers its debt capacity.',
      2: 'Same tax and same expected EBIT give the same tax benefit, but distress costs differ greatly between the two businesses, and the trade-off theory balances both.',
      3: 'Risk shifting is a cost of debt that lenders charge for, not a reason to borrow.',
    },
    solution: 'The trade-off theory compares tax shields with expected distress costs. Both firms can use the shield equally, but the bridge’s steady cash flows make distress unlikely and its tangible asset keeps its value if distress comes; the studio could lose its staff and titles. The bridge operator has the higher target debt.',
  },
  {
    id: 'f05-cap-i5', type: 'num', kind: 'numerical',
    prompt: 'Rookhollow Hotels, a fictional company taxed at 25%, is choosing between two plans: A, all equity with 500,000 shares; B, $6,000,000 of debt at 7% and 350,000 shares. At what EBIT do the two plans give the same EPS?',
    answer: 1400000, check: () => 6000000 * 0.07 * 500000 / (500000 - 350000), unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 1866667, say: 'The tax rate multiplies both sides of the equation and cancels: it does not change the break-even EBIT.' },
      { value: 420000, say: 'That is plan B’s interest. At that EBIT plan B’s EPS is zero.' },
      { value: 980000, say: 'That multiplies the interest by plan B’s 350,000 shares. Solve EBIT ÷ 500,000 = (EBIT − 420,000) ÷ 350,000: EBIT = 420,000 × 500,000 ÷ 150,000.' },
    ],
    solution: 'Interest under B = 6,000,000 × 7% = 420,000. EBIT(1 − T) ÷ 500,000 = (EBIT − 420,000)(1 − T) ÷ 350,000. The (1 − T) cancels: 350,000 EBIT = 500,000 EBIT − 210,000,000,000, so EBIT = $1,400,000. There the assets earn the 7% the debt costs.',
  },
  {
    id: 'f05-cap-i6', type: 'multi', kind: 'conceptual',
    prompt: 'A fictional regional airline is close to breaching its loan covenants. Which of these are indirect costs of financial distress? Select all that apply.',
    options: [
      'Passengers book with rivals because they fear their flights will be cancelled',
      'Fuel suppliers start demanding cash before each delivery',
      'Fees paid to the lawyers who negotiate with the lenders',
      'The board turns down a valuable route expansion because most of its payoff would go to repaying lenders',
      'The interest on the airline’s loans',
      'A spare aircraft is sold quickly at well below its value to raise cash',
    ],
    answer: [0, 1, 3, 5],
    feedback: {
      2: 'Lawyers’ and advisers’ fees are direct costs of distress.',
      4: 'Interest is the normal cost of debt, paid whether or not the firm is in distress; it is not a cost of distress.',
    },
    solution: 'Indirect costs: lost customers, suppliers’ tighter terms, underinvestment (debt overhang) and fire sales. Lawyers’ fees are direct costs; interest is not a distress cost at all.',
  },
];

export const check = [
  {
    id: 'f05-cap-k1', type: 'mc', kind: 'conceptual',
    prompt: 'What does Modigliani and Miller’s Proposition I, without taxes, say about a firm that borrows to buy back shares?',
    options: [
      'Its value is unchanged; only the split of the cash flows changes',
      'Its value rises, because the debt replaces equity with cheaper finance',
      'Its value falls, because the shares that remain are now riskier than before',
      'Its share price rises by the amount of debt raised divided by the number of shares',
    ],
    answer: 0,
    feedback: {
      1: 'Cheaper debt makes the remaining equity dearer (Proposition II), and the two effects cancel.',
      2: 'The shares are riskier, but their expected return rises to match, so their price does not fall.',
      3: 'The cash raised is paid out to buy shares, so it does not add to the value of the shares that remain.',
    },
    solution: 'In a perfect market without taxes, firm value depends on the assets’ cash flows and risk. Splitting the cash flows between debt and equity changes the risk and required return of each claim but not the total value.',
  },
  {
    id: 'f05-cap-k2', type: 'num', kind: 'numerical',
    prompt: 'A fictional manufacturer in a country with a 30% corporate tax rate is worth $12,000,000 with no debt. It borrows $4,000,000, which it intends to keep permanently, and pays it out to shareholders. Using Modigliani and Miller with corporate tax, what is the firm worth?',
    answer: 13200000, check: () => 12000000 + 0.30 * 4000000, unit: '$', places: 0, tol: 1,
    wrong: [
      { value: 12000000, say: 'That is the no-tax answer. With corporate tax, the interest deduction adds T × D.' },
      { value: 16000000, say: 'The debt itself is not new value; only the tax it saves is.' },
      { value: 9200000, say: 'That is the equity after the payout (13,200,000 − 4,000,000). The question asks for the whole firm, debt plus equity.' },
    ],
    solution: 'V_L = V_U + T × D = 12,000,000 + 0.30 × 4,000,000 = $13,200,000. Of this, $4,000,000 is debt and $9,200,000 equity; the shareholders have the $4,000,000 payout plus $9,200,000 of shares, $1,200,000 more than before.',
  },
  {
    id: 'f05-cap-k3', type: 'num', kind: 'numerical',
    prompt: 'A fictional firm taxed at 25% has an unlevered cost of capital of 10%, borrows at 6%, and keeps D/E at 0.8 at market values. Under Modigliani and Miller with corporate tax, what is its cost of equity, as a percentage?',
    answer: 12.4, check: () => (0.10 + (0.10 - 0.06) * 0.75 * 0.8) * 100, unit: '%', places: 2, tol: 0.01,
    wrong: [
      { value: 13.2, say: 'That leaves out (1 − T). With corporate tax the premium is (r_U − r_D)(1 − T) D/E.' },
      { value: 11.33, say: 'You used D/V (0.8 ÷ 1.8) rather than D/E.' },
    ],
    solution: 'r_E = 10% + (10% − 6%) × 0.75 × 0.8 = 10% + 2.4% = 12.4%.',
  },
  {
    id: 'f05-cap-k4', type: 'mc', kind: 'applied',
    prompt: 'Pelham Instruments (fictional) announces that it will sell new shares to fund a factory. Its share price falls 3% on the day, although analysts think the factory has a positive NPV. Which explanation fits the pecking order theory?',
    options: [
      'Investors assume managers sell shares when they think them overpriced, so the issue is read as bad news about value',
      'New shares dilute earnings per share, and the price always falls in proportion to the EPS dilution',
      'The factory’s NPV is shared with the new shareholders, so the old shareholders lose that much value',
      'The issue lowers Pelham’s debt ratio and so its tax shield, which costs exactly 3% of the share price',
    ],
    answer: 0,
    feedback: {
      1: 'Selling shares at a fair price does not transfer value through EPS: the new money buys an asset. The fall is about what the issue reveals.',
      2: 'If the shares are sold at a fair price, new shareholders pay for their share of the NPV; old shareholders keep theirs.',
      3: 'Funding with equity forgoes a tax shield the firm might have had, but that is the trade-off theory, and nothing makes it equal to 3%.',
    },
    solution: 'With asymmetric information, a manager acting for existing shareholders prefers to issue when the shares are overpriced. Investors know this and mark the price down on the announcement. That is why the pecking order puts new equity last, after internal funds and debt.',
  },
  {
    id: 'f05-cap-k5', type: 'formula', kind: 'numerical',
    prompt: 'The sheet holds a fictional firm’s EBIT, debt, interest rate, tax rate and shares outstanding. In B7, calculate its earnings per share.',
    sheet: { cells: {
      A1: 'EBIT ($)', B1: 900000,
      A2: 'Debt ($)', B2: 2500000,
      A3: 'Interest rate', B3: 0.07,
      A4: 'Tax rate', B4: 0.25,
      A5: 'Shares outstanding', B5: 150000,
      A7: 'Earnings per share ($)',
    } },
    cell: 'B7', answer: '=(B1-B2*B3)*(1-B4)/B5',
    alt: ['=(B1-B3*B2)*(1-B4)/B5', '=(1-B4)*(B1-B2*B3)/B5', '=((B1-B2*B3)-(B1-B2*B3)*B4)/B5'],
    view: 'A1:B7', widths: { A: 24, B: 14 }, formats: { B1: '#,##0', B2: '#,##0', B3: '0.0%', B4: '0%', B5: '#,##0', B7: '$#,##0.00' },
    wrong: [
      { formula: '=(B1-B2*B3)/B5', say: 'That is earnings before tax per share. Net income is after tax: multiply by (1 − B4).' },
      { formula: '=B1*(1-B4)/B5', say: 'That ignores the interest. Subtract B2*B3 from EBIT before tax.' },
      { formula: '=(B1*(1-B4)-B2*B3)/B5', say: 'That taxes EBIT but deducts the full interest after tax. Interest is deductible: tax is charged on EBIT minus interest.' },
    ],
    solution: '<x>=(B1-B2*B3)*(1-B4)/B5</x>: interest 175,000; profit before tax 725,000; net income 543,750; EPS $3.63 (3.625).',
  },
  {
    id: 'f05-cap-k6', type: 'multi', kind: 'conceptual',
    prompt: 'Which of these did Graham and Harvey’s 2002 survey of US chief financial officers report? Select all that apply.',
    options: [
      'Almost 60% rated financial flexibility and credit ratings as important or very important in debt decisions.',
      'Most firms had no target debt ratio at all.',
      'Most CFOs who had seriously considered issuing shares named dilution of earnings per share as important.',
      'Most CFOs rated the costs of bankruptcy and distress as important in setting debt.',
      'Fewer than one in ten said investors’ personal taxes were important to their debt decisions.',
    ],
    answer: [0, 2, 4],
    feedback: {
      1: 'Only 19% had no target; 44% had strict or somewhat strict targets and 37% flexible ones.',
      3: 'Only 21.4% rated distress costs important or very important, a puzzle for the trade-off theory.',
    },
    solution: 'Almost 60% rated flexibility and credit ratings important, and preserving flexibility, not minimising the WACC, was the main aim; 69% of those considering an equity issue named EPS dilution; 4.5% cited investors’ taxes. Most firms had some target, and only about a fifth rated distress costs important.',
  },
];
