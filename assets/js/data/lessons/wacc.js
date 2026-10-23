// Lesson: the cost of capital (CAPM and WACC).
// `checks` recompute every number printed in the worked example; tests/lessons.test.mjs compares them.
import * as F from '../../core/format.js?v=10';
import { wacc } from '../../core/fin.js?v=10';

const EX = { rf: 0.045, beta: 0.9, erp: 0.055, kd: 0.07, tax: 0.21, equity: 750, debt: 250 };

export default {
  id: 'wacc',
  title: 'The cost of capital',
  minutes: 6,
  hook: 'Investors lend and invest only if they expect a return. The cost of capital is that expected return, and it is the rate a DCF discounts at.',
  idea: [
    'A company raises money from two kinds of investor. Lenders want interest; shareholders want a return high enough to compensate for the risk they carry. The <b>cost of capital</b> is the blend of the two: the return the company must earn on a project just to leave its investors as well off as before.',
    'The cost of equity can’t be read off a contract, so it is estimated. The <b>capital asset pricing model</b> (CAPM) starts from the risk-free rate and adds the market’s equity risk premium, scaled by <b>beta</b>: how much the share tends to move with the market. Only that market risk earns a premium, because company-specific risk can be diversified away.',
    'Debt is cheaper. Lenders are paid before shareholders, so they take less risk, and interest is tax-deductible, so each dollar of interest costs the company less than a dollar. The <b>weighted average cost of capital</b> (WACC) weights each cost by its share of the company’s market value.',
  ],
  formula: {
    html: 'k<sub>E</sub> = r<sub>f</sub> + β × ERP,&ensp; WACC = <span class="frac"><span>E</span><span>V</span></span> × k<sub>E</sub> + <span class="frac"><span>D</span><span>V</span></span> × k<sub>D</sub> × (1 − T)',
    terms: [
      ['k<sub>E</sub>', 'cost of equity: the return shareholders expect'],
      ['r<sub>f</sub>', 'risk-free rate, such as a government bond yield'],
      ['β', 'beta: the share’s sensitivity to market moves (the market itself is 1)'],
      ['ERP', 'equity risk premium: how much more the market is expected to return than r<sub>f</sub>'],
      ['E, D, V', 'market values of equity and debt, and their total V = E + D'],
      ['k<sub>D</sub>, T', 'pre-tax cost of debt, and the tax rate that interest is deducted at'],
    ],
  },
  example: {
    setup: 'A packaging company’s shares are worth $750m and its debt $250m. The risk-free rate is 4.5%, its beta 0.9, the equity risk premium 5.5%. It borrows at 7% and pays tax at 21%. What is its WACC?',
    steps: [
      'Cost of equity: 4.5% + 0.9 × 5.5% = 4.5% + 4.95% = <b>9.45%</b>.',
      'After-tax cost of debt: 7% × (1 − 0.21) = <b>5.53%</b>.',
      'Weights from market values: equity 750 ÷ 1,000 = <b>75%</b>, debt <b>25%</b>.',
      'WACC = 0.75 × 9.45% + 0.25 × 5.53% = 7.09% + 1.38% = <b>8.47%</b>.',
    ],
    result: 'Projects of the company’s usual risk must earn at least <b>8.47%</b> a year to add value, and 8.47% is the rate to discount its free cash flow at in a DCF.',
  },
  mistake: {
    title: 'Forgetting the tax saving on interest',
    html: 'Using the 7% pre-tax cost of debt gives 0.75 × 9.45% + 0.25 × 7% = 8.84%. That overstates the cost of capital by more than a third of a percentage point, and every DCF built on it comes out too low.',
  },
  remember: [
    'Cost of equity = risk-free rate + beta × equity risk premium. Beta scales the premium, not the risk-free rate.',
    'Debt costs k<sub>D</sub> × (1 − tax rate) after tax, because interest is deductible.',
    'Weight by market values, and use a rate that matches the project’s risk: a riskier project needs a higher rate than the company average.',
  ],
  calc: {
    title: 'Build a WACC',
    intro: 'The risk-free rate is set at 4% and the equity risk premium at 5%.',
    inputs: [
      { id: 'beta', label: 'Beta', min: 0.3, max: 2.5, step: 0.05, value: 1.1, fmt: 'num', digits: 2 },
      { id: 'dv', label: 'Debt as a share of value (D/V)', min: 0, max: 80, step: 5, value: 30, fmt: 'pct' },
      { id: 'kd', label: 'Pre-tax cost of debt', min: 2, max: 12, step: 0.25, value: 6, fmt: 'pct' },
      { id: 'tax', label: 'Tax rate', min: 0, max: 40, step: 1, value: 25, fmt: 'pct' },
    ],
    compute({ beta, dv, kd, tax }) {
      const w = wacc({ rf: 0.04, beta, erp: 0.05, kd: kd / 100, tax: tax / 100, equity: 100 - dv, debt: dv });
      if (w.error) return { error: w.error };
      const shield = w.wd * (kd / 100) * (tax / 100);
      return {
        headline: { value: F.pct(w.wacc, 2), label: 'WACC' },
        rows: [['Cost of equity', F.pct(w.ke, 2)], ['After-tax cost of debt', F.pct(w.kdAfter, 2)], ['Weights, equity : debt', `${F.pct(w.we, 0)} : ${F.pct(w.wd, 0)}`], ['Lowered by the tax saving on interest', `${F.num(shield * 100, 2)} points`]],
        note: dv > 50
          ? 'Here more debt lowers the WACC only because beta and the cost of debt are held fixed. In reality, heavier borrowing makes the shares riskier (a higher beta) and lenders charge more, which eats most of the gain.'
          : w.ke - w.kdAfter > 0.04
            ? 'Equity costs much more than debt after tax: that gap is why the debt share matters so much to the average.'
            : 'With equity and after-tax debt this close in cost, the mix of the two hardly moves the average.',
      };
    },
  },
  tool: { href: 'finance/valuation/#cost-of-capital', label: 'Cost of capital, in Finance › Valuation' },
  checks: (() => {
    const w = wacc(EX), noTax = w.we * w.ke + w.wd * EX.kd;
    return [
      { what: 'beta × ERP', value: EX.beta * EX.erp * 100, shown: 4.95, tol: 0.0005 },
      { what: 'cost of equity', value: w.ke * 100, shown: 9.45, tol: 0.0005 },
      { what: 'after-tax cost of debt', value: w.kdAfter * 100, shown: 5.53, tol: 0.0005 },
      { what: 'equity weight', value: w.we * 100, shown: 75, tol: 1e-9 },
      { what: 'debt weight', value: w.wd * 100, shown: 25, tol: 1e-9 },
      { what: 'equity part', value: w.we * w.ke * 100, shown: 7.09, tol: 0.005 },
      { what: 'debt part', value: w.wd * w.kdAfter * 100, shown: 1.38, tol: 0.005 },
      { what: 'WACC', value: w.wacc * 100, shown: 8.47, tol: 0.005 },
      { what: 'mistake: no tax saving', value: noTax * 100, shown: 8.84, tol: 0.005 },
      { what: 'mistake: overstatement over a third of a point', value: (noTax - w.wacc) * 100, shown: 0.37, tol: 0.04 },
    ];
  })(),
};
