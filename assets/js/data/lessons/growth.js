// Lesson: unit economics (LTV, CAC, payback, retention) and reading an A/B test.
import * as F from '../../core/format.js?v=9';

const m0 = 32 * 0.45, ltv0 = m0 / 0.06, cac0 = 54000 / 1200;

export default {
  id: 'growth',
  title: 'Unit economics and experiments',
  minutes: 7,
  hook: 'Is each customer worth more than it costs to win? Lifetime value against acquisition cost, how fast that cost comes back, and how to read a test of a new idea.',
  idea: [
    'A subscriber pays every month until they cancel. The gross profit they bring each month is revenue × gross margin, and if a share <i>c</i> of customers cancels each month, the average customer stays 1 ÷ <i>c</i> months. <b>Lifetime value</b> (LTV) is that monthly gross profit × the lifetime.',
    '<b>Customer acquisition cost</b> (CAC) is sales and marketing spend ÷ customers won. An LTV:CAC of 3 or more is the usual comfort zone, and <b>payback</b> (CAC ÷ monthly gross profit) says how many months the cost takes to come back. <b>Net revenue retention</b> follows last year’s customers: above 100% means their upgrades outweigh cancellations.',
    'Growth ideas get tested. An A/B test’s p-value is the chance of a gap at least this large <em>if the two versions were really the same</em>; it is not the chance that B is better. To detect a lift half the size, you need about four times the visitors, because the sample grows with 1 ÷ (lift)².',
  ],
  formula: {
    html: 'LTV = <span class="frac"><span>revenue per month × margin</span><span>monthly churn</span></span>,&ensp; CAC = <span class="frac"><span>acquisition spend</span><span>customers won</span></span>,&ensp; payback = <span class="frac"><span>CAC</span><span>revenue per month × margin</span></span>',
    terms: [
      ['margin', 'gross margin: the share of revenue left after the cost of serving the customer'],
      ['churn', 'the share of customers who cancel each month'],
      ['LTV:CAC', 'gross profit a customer returns per dollar spent winning one'],
      ['NRR', 'net revenue retention: what last year’s customers pay now ÷ what they paid then'],
    ],
  },
  example: {
    setup: 'A subscription box charges $32 a month at a 45% gross margin, and 6% of subscribers cancel each month. Last quarter it spent $54,000 on marketing and won 1,200 subscribers.',
    steps: [
      'Gross profit per subscriber per month: $32 × 0.45 = <b>$14.40</b>.',
      'Lifetime value: $14.40 ÷ 0.06 = <b>$240</b>, over an average lifetime of 1 ÷ 0.06 ≈ <b>16.7 months</b>.',
      'Acquisition cost: $54,000 ÷ 1,200 = <b>$45</b>, so LTV:CAC = 240 ÷ 45 = <b>5.3</b>.',
      'Payback: $45 ÷ $14.40 = <b>3.1 months</b>.',
    ],
    result: 'Each subscriber returns more than five times what it cost to win, and the cost is back in about three months: room to spend more on growth, as long as churn holds as the business scales.',
  },
  mistake: {
    title: 'Using revenue instead of gross profit',
    html: 'Dividing revenue by churn gives $32 ÷ 0.06 = $533 and an LTV:CAC of 11.9, more than twice the real 5.3. Revenue also pays for the boxes; only gross profit is left to repay the cost of winning the customer.',
  },
  remember: [
    'LTV = monthly gross profit ÷ monthly churn; CAC = acquisition spend ÷ customers won. Aim for an LTV:CAC of 3 or more.',
    'Payback = CAC ÷ monthly gross profit. Net revenue retention above 100% means existing customers grow on their own.',
    'p = 0.03 means a gap this big would turn up 3% of the time if the versions were the same, not that B is 97% likely to be better. Halving the lift you want to detect quadruples the sample.',
  ],
  calc: {
    title: 'What a customer is worth',
    intro: 'Monthly figures for one average customer.',
    inputs: [
      { id: 'arpa', label: 'Revenue per customer per month', min: 5, max: 500, step: 1, value: 32, fmt: 'money' },
      { id: 'margin', label: 'Gross margin', min: 10, max: 95, step: 1, value: 45, fmt: 'pct' },
      { id: 'churn', label: 'Customers cancelling each month', min: 0.5, max: 20, step: 0.5, value: 6, fmt: 'pct', digits: 1 },
      { id: 'cac', label: 'Cost to win a customer', min: 5, max: 2000, step: 5, value: 45, fmt: 'money' },
    ],
    compute({ arpa, margin, churn, cac }) {
      const m = arpa * (margin / 100), c = churn / 100, ltv = m / c, ratio = ltv / cac;
      const payChurn = cac < ltv ? Math.log(1 - (cac * c) / m) / Math.log(1 - c) : Infinity;
      return {
        headline: { value: `${F.num(ratio, 1)} : 1`, label: 'LTV:CAC' },
        rows: [['Lifetime value (gross profit)', F.money(ltv)], ['Payback, ignoring churn', `${F.num(cac / m, 1)} months`], ['Payback, allowing for churn', Number.isFinite(payChurn) ? `${F.num(payChurn, 1)} months` : 'never']],
        note: ratio >= 3 ? 'Comfortably above 3: each customer returns well over what it costs to win.' : ratio >= 1 ? 'Above 1 but below 3: customers pay back, with little room for error. Lower churn or cheaper acquisition helps most.' : 'Below 1: each customer costs more to win than it ever returns. Fix retention or pricing before spending more on acquisition.',
      };
    },
  },
  tool: { href: 'marketing/growth/#unit-economics', label: 'Unit economics, in Marketing › Growth and experiments' },
  checks: [
    { what: 'gross profit a month', value: m0, shown: 14.4, tol: 1e-9 },
    { what: 'LTV', value: ltv0, shown: 240, tol: 1e-9 },
    { what: 'lifetime months', value: 1 / 0.06, shown: 16.7, tol: 0.05 },
    { what: 'CAC', value: cac0, shown: 45, tol: 1e-9 },
    { what: 'LTV:CAC', value: ltv0 / cac0, shown: 5.3, tol: 0.05 },
    { what: 'payback', value: cac0 / m0, shown: 3.1, tol: 0.05 },
    { what: 'revenue LTV', value: 32 / 0.06, shown: 533, tol: 0.5 },
    { what: 'revenue LTV:CAC', value: 32 / 0.06 / cac0, shown: 11.9, tol: 0.05 },
  ],
};
