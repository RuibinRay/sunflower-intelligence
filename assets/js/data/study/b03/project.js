// project.js — B03 applied project: Lantern's summer workbook. Ana Lim's questions about the spring shop orders, the
// catering invoices, the relaunched shop's monthly profit and the first July stock order, answered in a spreadsheet.
// Every figure comes from case.js (ORDERS, PRODUCTS, DELIVERY_BANDS, EVENTS, SHOP_SHEET, STOCK_PLAN); each `check`
// recomputes its answer from the raw data by a different route from the one case.js uses, and `verify` compares
// the spreadsheet engine's results with the figures shown.
import {
  ORDERS, ORDER_COLUMNS, PRODUCTS, PRODUCT_COLUMNS, DELIVERY_BANDS, EVENTS, EVENT_COLUMNS, SHOP_MODEL, SHOP_SHEET, STOCK_PLAN,
  DERIVED as D, tableCells, orderRecords,
} from './case.js?v=11';
import { Sheet, solveSheet, goalSeek, dataTable, shiftFormula } from '../../../core/sheet.js?v=11';
import { ols } from '../../../core/stats.js?v=11';

const WORKBOOK = '../../../../assets/data/study/lantern-shop-workbook.xlsx';
const num = (id, prompt, answer, check, solution, wrong, { unit = '$', places = 2, tol = 0.005, kind = 'numerical' } = {}) =>
  ({ id, type: 'num', kind, unit, places, prompt, answer, check, tol, solution, ...(wrong ? { wrong } : {}) });
const r2 = (x) => Math.round(x * 100) / 100;
const fmt$ = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------- raw facts, recomputed here by hand
const O = ORDERS.map((r) => Object.fromEntries(ORDER_COLUMNS.map((c, i) => [c, r[i]])));
const P = Object.fromEntries(PRODUCTS.map((r) => [r[0], Object.fromEntries(PRODUCT_COLUMNS.map((c, i) => [c, r[i]]))]));
const margin = (o) => o.order_total - o.quantity * P[o.product].unit_cost;
const sumBy = (list, f) => list.reduce((s, x) => s + f(x), 0);
const totalMargin = sumBy(O, margin), totalValue = sumBy(O, (o) => o.order_total);
const lineOf = (o) => P[o.product].line;
const rate = (list) => sumBy(list, margin) / sumBy(list, (o) => o.order_total);
const blend = O.filter((o) => lineOf(o) === 'Blend');
const lineMargin = (l) => sumBy(O.filter((o) => lineOf(o) === l), margin);
const central = O.filter((o) => o.region === 'Central'), bulk = O.find((o) => o.order_id === 'LC-10144');
const centralNoBulk = central.filter((o) => o !== bulk);
const paying = O.filter((o) => o.order_total <= 35).length;            // "free over $35": $35.00 or less pays
const subs = O.filter((o) => o.subscription === 'yes'), oneOff = O.filter((o) => o.subscription === 'no'), oneOffNoBulk = oneOff.filter((o) => o.order_id !== 'LC-10144');

// the 75 one-day events and the three-variable model (by the stats engine; checked against hand formulas below)
const E = EVENTS.map((r) => Object.fromEntries(EVENT_COLUMNS.map((c, i) => [c, r[i]]))).filter((e) => e.days === 1);
const yv = E.map((e) => e.invoice), gv = E.map((e) => e.guests), hv = E.map((e) => e.hours), pv = E.map((e) => (e.pastries === 'yes' ? 1 : 0)), bv = E.map((e) => e.baristas);
const fit3 = ols([gv, hv, pv], yv, { names: ['guests', 'hours', 'pastries'] });
const fit1 = ols([gv], yv, { names: ['guests'] });
const fit4 = ols([gv, hv, pv, bv], yv, { names: ['guests', 'hours', 'pastries', 'baristas'] });
const coef = (f, n) => f.coefs.find((c) => c.name === n);
const predict = (g, h, p) => coef(fit3, 'Intercept').estimate + coef(fit3, 'guests').estimate * g + coef(fit3, 'hours').estimate * h + coef(fit3, 'pastries').estimate * p;
// the simple slope by the textbook formula, as a check on the engine: b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²
const xbar = gv.reduce((s, x) => s + x, 0) / gv.length, ybar = yv.reduce((s, x) => s + x, 0) / yv.length;
const slopeByHand = gv.reduce((s, x, i) => s + (x - xbar) * (yv[i] - ybar), 0) / gv.reduce((s, x) => s + (x - xbar) ** 2, 0);

// the shop model: contribution per order = AOV × (1 − cost share − fee rate) − courier
const M = SHOP_MODEL;
const perOrder = (aov) => aov * (1 - M.costShare - M.feeRate) - M.courier;
const profit = (orders, aov) => orders * perOrder(aov) - M.fixed;
const breakEven = Math.ceil(M.fixed / perOrder(M.aov));
const aovFor3000 = ((3000 + M.fixed) / M.orders + M.courier) / (1 - M.costShare - M.feeRate);
const pctDrop = { aov: (profit(M.orders, M.aov * 0.99) - profit(M.orders, M.aov)) / profit(M.orders, M.aov), orders: (profit(M.orders * 0.99, M.aov) - profit(M.orders, M.aov)) / profit(M.orders, M.aov) };

// the stock plan, solved by brute force over whole bags (a check on Solver)
const SP = STOCK_PLAN;
const cost = SP.items.map((it) => P[it.product].unit_cost), unit = SP.items.map((it) => r2(P[it.product].price - P[it.product].unit_cost));
function brute({ kg = SP.limits.kg, budget = SP.limits.budget, minutes = SP.limits.minutes, minHB = SP.items[0].min } = {}) {
  let best = { v: -1, x: null };
  for (let a = minHB; a <= SP.items[0].max; a++) for (let b = 0; b <= SP.items[1].max; b++) for (let c = 0; c <= SP.items[2].max; c++) {
    const x = [a, b, c];
    const restKg = kg - 0.25 * (a + b + c), restBudget = budget - (cost[0] * a + cost[1] * b + cost[2] * c), restMin = minutes - 2 * (a + b + c);
    if (restKg < -1e-9 || restBudget < -1e-9 || restMin < -1e-9) continue;
    const d = Math.floor(Math.min(SP.items[3].max, restKg / SP.items[3].kg, restBudget / cost[3], restMin / SP.items[3].minutes) + 1e-9);
    x.push(d);
    const v = x.reduce((s, xi, i) => s + xi * unit[i], 0);
    if (v > best.v + 1e-9) best = { v: r2(v), x };
  }
  return best;
}
const best = brute(), best60 = brute({ kg: 60 }), bestNoMin = brute({ minHB: 0 });
const budgetUsed = best.x.reduce((s, xi, i) => s + xi * cost[i], 0);

// ---------------------------------------------------------------- the worksheets the stages use
// Stage 1: the 231 orders in A1:M232, the price list in R1:V12 (a table named Products), the delivery bands in X1:Y3.
const orders = tableCells(ORDER_COLUMNS, ORDERS);
const products = tableCells(PRODUCT_COLUMNS, PRODUCTS, { at: 'R1' });
const bands = { X1: 'Order from', Y1: 'Delivery', X2: DELIVERY_BANDS[0][0], Y2: DELIVERY_BANDS[0][1], X3: DELIVERY_BANDS[1][0], Y3: DELIVERY_BANDS[1][1] };
const base = { ...orders.cells, ...products.cells, ...bands, N1: 'unit_cost', O1: 'gross_margin', P1: 'delivery' };
const LOOKUP = '=XLOOKUP(E2,Products[product],Products[unit_cost])';
const filled = (col, f, from = 2, to = 232) => { const c = {}; for (let r = from; r <= to; r++) c[`${col}${r}`] = shiftFormula(f, r - 2, 0); return c; };
const sheet1 = (extra = {}) => ({ cells: { ...base, ...extra }, tables: { Orders: 'A1:P232', Products: 'R1:V12' }, fixed: ['X2:Y3'] });
const FMT1 = { B: 'date', H: '$#,##0.00', I: '$#,##0.00', J: '$#,##0.00', N: '$#,##0.00', O: '$#,##0.00', P: '$#,##0.00', U: '$#,##0.00', V: '$#,##0.00', X: '$#,##0.00', Y: '$#,##0.00' };
const W1 = { E: 24, R: 24 };

// Stage 5: the stock plan laid out as in the workbook's “Stock plan” sheet
const spCells = { A1: 'First July stock order (1–14 July 2026)', A3: 'Product', B3: 'Bags to order', C3: 'Margin per bag', D3: 'Cost per bag', E3: 'kg per bag', F3: 'Packing minutes', G3: 'At least', H3: 'At most' };
SP.items.forEach((it, i) => { const r = 4 + i; Object.assign(spCells, { [`A${r}`]: it.product, [`B${r}`]: 0, [`C${r}`]: unit[i], [`D${r}`]: cost[i], [`E${r}`]: it.kg, [`F${r}`]: it.minutes, [`G${r}`]: it.min, [`H${r}`]: it.max }); });
Object.assign(spCells, { B9: 'Used', D9: 'Limit', A10: 'Roasted coffee (kg)', B10: '=SUMPRODUCT(B4:B7,E4:E7)', D10: SP.limits.kg, A11: 'Stock budget ($)', B11: '=SUMPRODUCT(B4:B7,D4:D7)', D11: SP.limits.budget,
  A12: 'Packing time (minutes)', B12: '=SUMPRODUCT(B4:B7,F4:F7)', D12: SP.limits.minutes, A14: 'Total contribution', B14: '=SUMPRODUCT(B4:B7,C4:C7)' });
const SOLVER = { objective: 'B14', sense: 'max', changing: ['B4:B7'], integer: ['B4:B7'], nonNegative: true,
  constraints: [
    { cell: 'B10', op: '<=', rhs: 'D10', label: 'roasted coffee' }, { cell: 'B11', op: '<=', rhs: 'D11', label: 'stock budget' }, { cell: 'B12', op: '<=', rhs: 'D12', label: 'packing time' },
    ...SP.items.map((it, i) => ({ cell: `B${4 + i}`, op: '<=', rhs: `H${4 + i}`, label: `${it.product} forecast` })),
    { cell: 'B4', op: '>=', rhs: 'G4', label: 'House Blend for subscribers' },
  ] };

const money = (v) => fmt$(v);
const pct1 = (v) => `${(v * 100).toFixed(1)}%`;

export default {
  title: 'Lantern’s summer workbook',
  brief: [
    { case: 'It is July 2026. Lantern Coffee Co.’s online shop has just relaunched with free delivery on orders over $35, and Ana Lim wants a workbook that answers her questions before she commits to the summer: which spring orders actually made money, how her catering prices hang together, how many orders a month the relaunched shop needs, and how much of each coffee to order from Kilnworth Roasting for the first fortnight of July. You are building that workbook. Lantern, Ana, Kilnworth and every figure are fictional.' },
    { p: `You can work in the worksheets on this page, or in Excel: <a href="${WORKBOOK}">download Lantern’s workbook</a> (the same data on separate sheets: Orders, Products, Bands, Events, Stock plan and Shop model). If you work in Excel, type your answers to the questions below; for the formula tasks, enter your formula in the worksheet here so it can be checked.` },
    { p: 'What you have:' },
    { list: [
      `<b>Orders</b>: the shop’s ${O.length} orders for 1 March – 30 June 2026 after B02’s cleaning (order value ${money(totalValue)}). Subscription orders carry 10% off; other discounts are a $5 promotion code; LC-10144 is a 120-bag office order with 10% off.`,
      '<b>Products</b>: Kilnworth Roasting’s spring price list to Lantern (<code>unit_cost</code>, what Lantern pays per bag or box) and Lantern’s shop price for each of the 11 products, with each product’s line (Blend, Single origin, Decaf, Cold brew, Gift).',
      `<b>Bands</b>: the July delivery rule as a lookup table: orders up to $35.00 pay ${money(DELIVERY_BANDS[0][1])}; orders from $35.01 travel free.`,
      `<b>Events</b>: Lantern’s ${EVENTS.length} catering events in 2026 with each event’s guests, hours of service, whether a pastry platter was added, the number of baristas sent and the invoice.`,
      '<b>Shop model</b>: one month of the relaunched shop (B01’s July figures and the cost rates from Lantern’s books), and <b>Stock plan</b>: Kilnworth’s allocation, Ana’s stock budget, her packing time and her sales forecast for 1–14 July.',
    ] },
  ],
  deliverables: [
    'An order sheet with three new columns: each order’s unit cost, gross margin and July delivery charge, all calculated by formulas that fill down.',
    'Ana’s answers: the spring gross margin and margin rate, where the margin comes from (product lines, regions, subscriptions) and how many spring orders would have paid delivery.',
    'A reading of the catering regression and a price for a new quote.',
    'The relaunched shop’s break-even order count, a profit table and the average order value Ana needs for her profit goal.',
    'The July stock order from Solver, with the limit that binds and what two of Ana’s rules cost her.',
    'A short memo recommending what Ana’s shop dashboard should show.',
  ],
  stages: [
    {
      id: 'orders', title: 'Build the order sheet',
      html: '<p>The worksheet below has the orders in columns A to M (a table named <b>Orders</b>, which takes in the three new columns as you add them, as an Excel table does), the price list in R1:V12 (a table named <b>Products</b>) and the delivery bands in X1:Y3. In Excel they would be on separate sheets; here they sit side by side so one formula can reach them all. Add three columns: <code>unit_cost</code> in N, <code>gross_margin</code> in O and <code>delivery</code> in P. Each formula goes in row 2 and is filled down to row 232, so write it once, with references that stay right as it moves. Gross margin here means order value less what Lantern paid Kilnworth for the coffee: it leaves out delivery, card fees and wages.</p>',
      items: [
        { id: 'b03-pj-1', type: 'formula', kind: 'applied',
          prompt: 'In N2, write a formula that looks up the order’s unit cost from the price list, then fill it down to N232.',
          sheet: sheet1(), cell: 'N2', fill: 'N2:N232', answer: LOOKUP, view: 'A1:Y232', formats: FMT1, widths: W1, maxHeight: '24rem',
          alt: ['=VLOOKUP(E2,$R$2:$V$12,5,FALSE)', '=INDEX($V$2:$V$12,MATCH(E2,$R$2:$R$12,0))', '=XLOOKUP([@product],Products[product],Products[unit_cost])'],
          wrong: [
            { formula: '=XLOOKUP(E2,R2:R12,V2:V12)', say: 'Your formula is right in N2, but its lookup ranges move as it fills down (R3:R13, R4:R14, …) and soon miss the price list. Anchor them with $ ($R$2:$R$12, $V$2:$V$12) or use the table’s names.' },
            { formula: '=VLOOKUP(E2,$R$2:$V$12,5)', say: 'Without FALSE, VLOOKUP does an approximate match, which assumes the first column is sorted; the price list isn’t, so some orders get another product’s cost. Add FALSE as the fourth argument.' },
            { formula: '=VLOOKUP(E2,$R$2:$V$12,4,FALSE)', say: 'Column 4 of R:V is the shop price, not the cost. unit_cost is the fifth column of the range.' },
          ],
          solution: `<x>${LOOKUP}</x> finds the product in the price list’s first column and returns the matching <code>unit_cost</code>. Structured references don’t move when the formula fills down. Equivalent: <x>=VLOOKUP(E2,$R$2:$V$12,5,FALSE)</x> or <x>=INDEX($V$2:$V$12,MATCH(E2,$R$2:$R$12,0))</x>. Order LC-10001 is a Gift Box Trio, so N2 shows ${money(P['Gift Box Trio'].unit_cost)}.` },
        { id: 'b03-pj-2', type: 'formula', kind: 'applied',
          prompt: 'Column N now holds each order’s unit cost. In O2, write the order’s gross margin (its order value less what the coffee cost Lantern), and fill it down to O232.',
          sheet: sheet1(filled('N', LOOKUP)), cell: 'O2', fill: 'O2:O232', answer: '=J2-G2*N2', view: 'A1:Y232', formats: FMT1, widths: W1, maxHeight: '24rem',
          alt: ['=[@order_total]-[@quantity]*N2', '=J2-N2*G2'],
          wrong: [
            { formula: '=G2*H2-G2*N2', say: 'That is the margin before discounts: quantity × price ignores the 10% subscriber discount and the promotion codes. Start from order_total, what the customer actually paid.' },
            { formula: '=J2-N2', say: 'That subtracts the cost of one bag. Multiply the unit cost by the quantity first.' },
          ],
          solution: '<x>=J2-G2*N2</x>: the order’s value after discounts (J) less the quantity (G) times the unit cost (N). LC-10001 sold two Gift Box Trios for $111.00 after a $5 code; they cost Lantern 2 × $20.00 = $40.00, so its gross margin is $71.00.' },
        { id: 'b03-pj-3', type: 'formula', kind: 'applied',
          prompt: 'In P2, use the delivery bands in X1:Y3 to find the delivery charge the order would pay under the July rule, and fill it down to P232.',
          sheet: sheet1(), cell: 'P2', fill: 'P2:P232', answer: '=VLOOKUP(J2,$X$2:$Y$3,2,TRUE)', view: 'A1:Y232', formats: FMT1, widths: W1, maxHeight: '24rem',
          alt: ['=XLOOKUP(J2,$X$2:$X$3,$Y$2:$Y$3,,-1)', '=VLOOKUP(J2,$X$2:$Y$3,2)', '=INDEX($Y$2:$Y$3,MATCH(J2,$X$2:$X$3,1))'],
          wrong: [
            { formula: '=VLOOKUP(J2,$X$2:$Y$3,2,FALSE)', say: 'An exact match finds only orders of exactly $0.00 or $35.01. Bands need an approximate match: TRUE (or nothing) as the fourth argument, or XLOOKUP with match mode −1.' },
            { formula: '=VLOOKUP(J2,X2:Y3,2,TRUE)', say: 'Right in P2, but the band table’s reference moves as the formula fills down, so later rows look in the wrong place. Anchor it: $X$2:$Y$3.' },
          ],
          solution: `<x>=VLOOKUP(J2,$X$2:$Y$3,2,TRUE)</x> finds the largest “Order from” value not above the order value and returns its charge: ${money(DELIVERY_BANDS[0][1])} up to $35.00, nothing from $35.01. The table’s first column is sorted, which approximate matching needs. <x>=XLOOKUP(J2,$X$2:$X$3,$Y$2:$Y$3,,-1)</x> does the same without needing the sort.` },
        num('b03-pj-4', 'How many of the 231 spring orders would have paid the July delivery charge?', paying,
          () => O.filter((o) => !(o.order_total >= DELIVERY_BANDS[1][0])).length,
          `<x>=COUNTIF(P2:P232,">0")</x> or <x>=COUNTIF(J2:J232,"<=35")</x> gives ${paying}. No spring order was exactly $35.00, so “over $35” and “$35 or more” would give the same count here; the rule still has to be written correctly for the orders that will be.`,
          [{ value: O.length - paying, say: 'That counts the orders that would travel free. The question asks how many would pay.' }], { unit: 'orders', places: 0, tol: 0.5, kind: 'applied' }),
        num('b03-pj-5', 'What was the total gross margin on the spring orders? Give it to the cent.', r2(totalMargin), () => sumBy(O, (o) => o.order_total) - sumBy(O, (o) => o.quantity * P[o.product].unit_cost),
          `<x>=SUM(O2:O232)</x> = ${money(totalMargin)}: order value ${money(totalValue)} less coffee costing ${money(totalValue - totalMargin)}.`,
          [{ value: r2(sumBy(O, (o) => o.quantity * (o.unit_price - P[o.product].unit_cost))), say: 'That is the margin at list prices, before the $588.85 of discounts. Use order_total.' }]),
        num('b03-pj-6', 'What was the spring gross margin rate (gross margin as a percentage of order value)? Give it to one decimal place.', r2(rate(O) * 1000) / 10, () => (totalMargin / totalValue) * 100,
          `${money(totalMargin)} ÷ ${money(totalValue)} = ${pct1(rate(O))}. Lantern’s whole first year reached 52% (F02), with the gift season and higher-margin lines still to come.`,
          [{ value: r2((1 - rate(O)) * 1000) / 10, say: 'That is the coffee’s cost as a share of order value. The margin rate is what is left: 100% minus that.' }], { unit: '%', places: 1, tol: 0.05 }),
      ],
    },
    {
      id: 'margin', title: 'Find where the margin comes from',
      html: '<p>The PivotTable below uses the same 231 orders with your three new columns (and each product’s line from the price list). Use it to answer Ana’s questions about where the margin comes from. A PivotTable can’t divide one sum by another in its standard layout, so for a margin rate take the sum of gross margin and the sum of order value for the same group and divide.</p>',
      tool: { kind: 'widget', widget: { type: 'pivot', title: 'Lantern’s spring orders', records: orderRecords(),
        fields: ['Line', 'Region', 'Month', 'Channel', 'Subscription', 'Product'], values: ['Gross margin', 'Order value', 'Product cost', 'Quantity', 'Orders'],
        defaults: { rows: 'Line', value: 'Gross margin', agg: 'sum' }, order: { Month: ['Mar', 'Apr', 'May', 'Jun'] },
        formats: { 'Gross margin': '$#,##0.00', 'Order value': '$#,##0.00', 'Product cost': '$#,##0.00', Quantity: '#,##0', Orders: '#,##0' } } },
      items: [
        num('b03-pj-7', 'What is the gross margin rate of the Blend line (House Blend and Espresso Roast, both sizes)? Give it to one decimal place.', r2(rate(blend) * 1000) / 10, () => (lineMargin('Blend') / sumBy(blend, (o) => o.order_total)) * 100,
          `Sum of gross margin for Blend, ${money(lineMargin('Blend'))}, ÷ sum of order value, ${money(sumBy(blend, (o) => o.order_total))}, = ${pct1(rate(blend))}.`,
          [{ value: r2(((14 - 8) / 14) * 1000) / 10, say: 'That is a House Blend 250 g bag’s margin at list price. The line’s rate includes the other blends, the discounts and the 10%-off bulk order.' }], { unit: '%', places: 1, tol: 0.05 }),
        { id: 'b03-pj-8', type: 'mc', kind: 'applied',
          prompt: 'Gift boxes earn the highest margin rate of any line. Which line contributed the most gross margin in dollars in the spring?',
          options: ['Blend', 'Gift', 'Single origin', 'Cold brew'], answer: 0,
          feedback: { 1: `Gift boxes earn ${pct1(rate(O.filter((o) => lineOf(o) === 'Gift')))} of their value, but only eight orders bought them: ${money(lineMargin('Gift'))} of margin in all. A rate isn’t a total.`, 2: `Single origins earn a higher rate than blends, ${pct1(rate(O.filter((o) => lineOf(o) === 'Single origin')))}, on ${money(sumBy(O.filter((o) => lineOf(o) === 'Single origin'), (o) => o.order_total))} of sales: ${money(lineMargin('Single origin'))}. Blends sold almost twice as much.`, 3: 'Cold brew sold nine packs in the spring: a high rate on a small base.' },
          solution: `Blend: ${money(lineMargin('Blend'))} of gross margin, the most of any line, at the lowest rate (${pct1(rate(blend))}), because blends are most of what the shop sells. The best rate and the biggest contribution are different questions; a manager deciding what to promote needs both.` },
        { id: 'b03-pj-9', type: 'mc', kind: 'applied',
          prompt: `Central has the lowest gross margin rate of the five regions, ${pct1(rate(central))}. What is the main reason?`,
          options: ['One 120-bag House Blend order at 10% off makes up most of Central’s sales', 'Central’s customers buy more decaf, which has a low margin', 'Central has the most subscription orders, which carry 10% off', 'Central’s orders are the smallest, so delivery eats the margin'], answer: 0,
          feedback: { 1: 'Decaf is a small line everywhere, and its margin rate is close to the average.', 2: 'Check the PivotTable with Subscription in the columns: Central’s orders are not mainly subscriptions.', 3: 'Delivery isn’t in this gross margin at all, and Central’s average order is the largest, not the smallest.' },
          solution: `LC-10144 is ${money(bulk.order_total)} of Central’s ${money(sumBy(central, (o) => o.order_total))}, ${((bulk.order_total / sumBy(central, (o) => o.order_total)) * 100).toFixed(1)}% of it. It is House Blend, the lowest-margin product, sold at 10% off, so its rate is ${pct1(margin(bulk) / bulk.order_total)}, and it dominates the region’s average.` },
        num('b03-pj-10', 'What would Central’s gross margin rate be without order LC-10144? Give it to one decimal place.', r2(rate(centralNoBulk) * 1000) / 10, () => ((sumBy(central, margin) - margin(bulk)) / (sumBy(central, (o) => o.order_total) - bulk.order_total)) * 100,
          `Central without the office order: (${money(sumBy(central, margin))} − ${money(margin(bulk))}) ÷ (${money(sumBy(central, (o) => o.order_total))} − ${money(bulk.order_total)}) = ${money(sumBy(centralNoBulk, margin))} ÷ ${money(sumBy(centralNoBulk, (o) => o.order_total))} = ${pct1(rate(centralNoBulk))}, in line with the other regions. Filtering the PivotTable to leave out the bulk order isn’t possible by region alone; subtract it, or add a field that marks it.`,
          [{ value: r2(rate(central) * 1000) / 10, say: 'That is Central’s rate with the bulk order still in. Take its margin and its value out of both sums.' }], { unit: '%', places: 1, tol: 0.05 }),
        { id: 'b03-pj-11', type: 'mc', kind: 'conceptual',
          prompt: `Subscription orders earned ${pct1(rate(subs))} gross margin and one-off orders ${pct1(rate(oneOff))}. Ana concludes that the 10% subscriber discount costs her only about two points of margin rate. What is wrong with that?`,
          options: [`The one-off figure includes the 120-bag office order at 10% off; without it, one-off orders earned ${pct1(rate(oneOffNoBulk))}, so the gap is nearer six points`, 'Nothing: the two rates are measured on the same orders, so the comparison is fair', 'Margin rates can’t be compared between groups of different sizes', 'Subscribers buy cheaper coffee, so the gap understates nothing'], answer: 0,
          feedback: { 1: 'The groups aren’t like for like: one very large, discounted House Blend order sits in the one-off group and pulls its rate down.', 2: 'Rates can be compared across groups of any size; that is what makes them useful. The problem is what is in the groups.', 3: `Subscribers buy a little more single origin than one-off customers, which raises their rate if anything; at list prices their orders would have earned ${pct1(sumBy(subs, (o) => o.quantity * (o.unit_price - P[o.product].unit_cost)) / sumBy(subs, (o) => o.quantity * o.unit_price))}.` },
          solution: `Comparing like with like (B01): take LC-10144 out and one-off orders earned ${pct1(rate(oneOffNoBulk))} against subscribers’ ${pct1(rate(subs))}, a gap of ${((rate(oneOffNoBulk) - rate(subs)) * 100).toFixed(1)} points, about what a 10% discount does to products with a margin near 50%. Whether the discount pays depends on how many more orders subscribers place over time, which this table can’t show: that is the next thing to measure.` },
      ],
    },
    {
      id: 'catering', title: 'Read the catering regression',
      html: `<p>Ana prices catering from a quote sheet (a setup charge, a price per guest, a charge per hour and a pastry platter), then adjusts each invoice for the job. She wants to know how her invoices actually behave. The regression below uses the ${E.length} one-day events; the two-day Meridian conference is set aside because it is priced day by day. Choose the X variables (Input X Range) to match each question: <code>pastries</code> is 1 when a platter was ordered and 0 when not.</p>`,
      tool: { kind: 'widget', widget: { type: 'regression', title: 'Catering invoices, 2026 (one-day events)', y: { name: 'invoice', values: yv },
        xs: [{ name: 'guests', values: gv }, { name: 'hours', values: hv }, { name: 'pastries', values: pv }, { name: 'baristas', values: bv }], picked: [0, 1, 2] } },
      items: [
        num('b03-pj-12', 'Use the regression of invoice on guests, hours and pastries to predict the invoice for an event with 120 guests, 4 hours of service and a pastry platter. Give it to the nearest dollar.', Math.round(predict(120, 4, 1)), () => predict(120, 4, 1),
          `Intercept + 120 × the guests coefficient + 4 × the hours coefficient + 1 × the pastries coefficient = ${coef(fit3, 'Intercept').estimate.toFixed(2)} + 120 × ${coef(fit3, 'guests').estimate.toFixed(4)} + 4 × ${coef(fit3, 'hours').estimate.toFixed(3)} + ${coef(fit3, 'pastries').estimate.toFixed(2)} = $${predict(120, 4, 1).toFixed(2)}, about $${Math.round(predict(120, 4, 1)).toLocaleString('en-US')}. The event is inside the range of the data (${Math.min(...gv)}–${Math.max(...gv)} guests, ${Math.min(...hv)}–${Math.max(...hv)} hours), so the prediction is an interpolation.`,
          [{ value: Math.round(coef(fit1, 'Intercept').estimate + coef(fit1, 'guests').estimate * 120), say: 'That uses the regression on guests alone. This event’s hours and platter matter: use the model with all three X variables.' }], { places: 0, tol: 1.5 }),
        { id: 'b03-pj-13', type: 'mc', kind: 'conceptual',
          prompt: `In the three-variable model the guests coefficient is ${coef(fit3, 'guests').estimate.toFixed(2)}. What does it mean?`,
          options: [`Between events with the same hours and platter choice, each extra guest goes with about $${coef(fit3, 'guests').estimate.toFixed(2)} more on the invoice`, `Lantern charges $${coef(fit3, 'guests').estimate.toFixed(2)} a guest`, `Each guest adds $${coef(fit3, 'guests').estimate.toFixed(2)} of profit`, `An event with no guests would be invoiced $${coef(fit3, 'guests').estimate.toFixed(2)}`], answer: 0,
          feedback: { 1: 'The coefficient describes how the invoices behaved, not the price list: Ana’s quote sheet says $6.50 a guest, and invoices are adjusted. The estimate is close, not the same thing.', 2: 'The invoice is revenue. Nothing in this regression is about costs or profit.', 3: 'That would be the intercept’s job, and with no guests it is far outside the data.' },
          solution: `A coefficient in a multiple regression is the estimated change in Y for one more unit of that X with the other Xs held the same. Its 95% interval, ${coef(fit3, 'guests').low.toFixed(2)} to ${coef(fit3, 'guests').high.toFixed(2)}, includes Ana’s list price of $6.50 a guest: the invoices track the quote sheet.` },
        { id: 'b03-pj-14', type: 'mc', kind: 'conceptual',
          prompt: `Add <code>baristas</code> to the model (all four X variables). Its coefficient is ${coef(fit4, 'baristas').estimate.toFixed(2)} with a P-value of ${coef(fit4, 'baristas').p.toFixed(2)}, and the guests coefficient’s standard error rises from ${coef(fit3, 'guests').se.toFixed(3)} to ${coef(fit4, 'guests').se.toFixed(3)}. What is the best reading?`,
          options: ['Lantern sends baristas in proportion to guests, so baristas adds no information once guests is in; leave it out', 'Baristas have no effect on invoices, so Ana could send fewer without changing what she charges', 'The model is now better because it has more variables', 'Baristas should replace guests, because they are what Lantern pays for'], answer: 0,
          feedback: { 1: 'The regression can’t say that: baristas move with guests in this data, so their separate effect can’t be estimated. It says nothing about what would happen if Ana changed her staffing.', 2: `Adjusted R² falls slightly (${fit3.adjR2.toFixed(4)} to ${fit4.adjR2.toFixed(4)}) and the standard error rises: the extra variable costs a degree of freedom and adds nothing.`, 3: 'Invoices follow the quote sheet, which prices guests, hours and platters; baristas are a cost Lantern bears, not a price.' },
          solution: 'When two X variables move together (here Lantern sends about one barista per 40 guests), the regression can’t separate their effects: the coefficients become unstable and their standard errors grow. That is multicollinearity, which B06 treats properly. The P-value of about 0.96 means the data give no evidence of a separate barista effect, so the simpler model is the better one to price from.' },
        { id: 'b03-pj-15', type: 'mc', kind: 'conceptual',
          prompt: 'Why is the two-day Meridian conference ($4,200) left out of this regression?',
          options: ['It is priced per day, so one row for two days doesn’t fit a model of one-day invoices; included, it would pull the line towards it', 'Its invoice is an error that B02’s cleaning should have caught', 'Regressions can’t include values above $4,000', 'It was paid by deposit, so it isn’t revenue'], answer: 0,
          feedback: { 1: 'The invoice is genuine (it is in F01’s March books). It is a different kind of job, not a mistake.', 2: 'There is no such limit. The issue is that the row measures something different.', 3: 'The deposit was Harbor Tech’s; Meridian was invoiced on 30-day terms, and either way it is catering revenue.' },
          solution: `Each row should measure the same kind of thing. A two-day event is quoted day by day, so its invoice is roughly twice a one-day event of the same size. Including it as one row of ${E.length + 1} raises the guests slope from ${coef(fit1, 'guests').estimate.toFixed(2)} to ${D.regression.allEvents.coefs.guests.b.toFixed(2)} and cuts R² from ${fit1.r2.toFixed(3)} to ${D.regression.allEvents.r2.toFixed(3)}. Setting it aside, and saying so, is honest; deleting awkward rows without a reason is not.` },
        { id: 'b03-pj-16', type: 'mc', kind: 'conceptual',
          prompt: `The three-variable model’s Standard Error is ${fit3.sigma.toFixed(2)}. What does that tell Ana?`,
          options: [`Its predictions typically miss an actual invoice by about $${Math.round(fit3.sigma)}, so a quote around $1,086 could easily end up $50 to $100 either way`, `The guests coefficient could be off by $${fit3.sigma.toFixed(2)}`, `The average invoice is $${fit3.sigma.toFixed(2)} too high`, `${fit3.sigma.toFixed(2)}% of invoices are predicted wrongly`], answer: 0,
          feedback: { 1: 'Each coefficient has its own standard error in the coefficients table; this one is the residuals’.', 2: 'Residuals average zero in a regression with an intercept: there is no overall bias to read off.', 3: 'It is in dollars, the units of the invoice, not a percentage.' },
          solution: 'The Standard Error in the Regression Statistics block is the standard deviation of the residuals: how far, typically, the actual invoices sit from the fitted ones. For a rough 95% band around a single new invoice, Ana can allow about two standard errors either way (a little more, since the coefficients are estimates too).' },
      ],
    },
    {
      id: 'shop', title: 'Model the relaunched shop',
      html: '<p>The worksheet below is Ana’s model of one month of the relaunched shop: inputs in B3:B8, results in B10:B16. Use Goal Seek and the Data table tool (or the same sheet in the workbook). Ana’s fixed costs are a part-time packer and advertising; product cost, card and platform fees and the courier vary with orders.</p>',
      tool: { kind: 'widget', widget: { type: 'sheet', title: 'Shop model', sheet: SHOP_SHEET, view: 'A1:B16', editable: 'B3:B8', widths: { A: 34 },
        formats: { B4: '$#,##0.00', B5: '0.0%', B6: '0.0%', B7: '$#,##0.00', B8: '$#,##0.00', B10: '$#,##0.00', B11: '$#,##0.00', B12: '$#,##0.00', B13: '$#,##0.00', B14: '$#,##0.00', B15: '$#,##0.00', B16: '$#,##0.00' },
        tools: ['formulas', 'goalseek', 'datatable', 'reset'], goalseek: { target: 'B15', goal: 0, changing: 'B3' },
        datatable: { target: 'B15', input: 'B4', values: [35, 40, 45, 50, 55], input2: 'B3', values2: [250, 300, 350, 400], format: '$#,##0.00' } } },
      items: [
        num('b03-pj-17', 'What is the shop’s contribution per order at the July figures (cell B16)? Give it to the cent.', r2(perOrder(M.aov)), () => (M.aov * M.orders * (1 - M.costShare - M.feeRate) - M.courier * M.orders) / M.orders,
          `$${M.aov.toFixed(2)} × (1 − ${M.costShare} − ${M.feeRate}) − $${M.courier.toFixed(2)} = $${perOrder(M.aov).toFixed(3)}: what each order leaves towards the fixed costs.`,
          [{ value: r2(M.aov * (1 - M.costShare - M.feeRate)), say: 'That leaves out the courier’s $5.20 an order.' }], { tol: 0.01 }),
        num('b03-pj-18', 'What is the smallest whole number of orders a month at which the shop’s profit is not negative?', breakEven, () => Math.ceil(2000 / perOrder(M.aov)),
          `Goal Seek sets B15 to 0 by changing B3 and finds ${(M.fixed / perOrder(M.aov)).toFixed(2)} orders. Orders come whole, and ${Math.floor(M.fixed / perOrder(M.aov))} orders still make a small loss, so the answer is ${breakEven}: well under July’s ${M.orders}.`,
          [{ value: Math.floor(M.fixed / perOrder(M.aov)), say: `At ${Math.floor(M.fixed / perOrder(M.aov))} orders the shop still loses a few dollars (check B15). Round up.` }], { unit: 'orders', places: 0, tol: 0.4 }),
        num('b03-pj-19', 'Use a two-variable data table: what would the monthly profit be at an average order value of $45 and 350 orders? Give it to the cent.', r2(profit(350, 45)), () => 350 * 45 * (1 - 0.48 - 0.035) - 350 * 5.2 - 2000,
          `350 × ($45 × 0.485 − $5.20) − $2,000 = ${money(profit(350, 45))}.`, null, { tol: 0.01 }),
        num('b03-pj-20', 'Ana wants $3,000 of profit a month at July’s 294 orders. What average order value would that need? Give it to the cent.', r2(aovFor3000), () => (5000 / 294 + 5.2) / 0.485,
          `Goal Seek: set B15 to 3000 by changing B4. By hand, 294 × (AOV × 0.485 − 5.20) − 2,000 = 3,000 gives AOV = (5,000 ÷ 294 + 5.20) ÷ 0.485 = ${money(aovFor3000)}, about $4.60 more than July’s $41.20 and close to her $45 target from B01.`, null, { tol: 0.01 }),
        { id: 'b03-pj-21', type: 'mc', kind: 'applied',
          prompt: 'Which would cut the monthly profit more: a 1% fall in the average order value or a 1% fall in the number of orders?',
          options: ['The 1% fall in average order value', 'The 1% fall in orders', 'They cut profit by the same amount', 'Neither changes profit, because the fixed costs stay the same'], answer: 0,
          feedback: { 1: `Fewer orders also means fewer courier charges, which softens the fall: profit drops ${(Math.abs(pctDrop.orders) * 100).toFixed(1)}%, against ${(Math.abs(pctDrop.aov) * 100).toFixed(1)}% for the AOV fall.`, 2: 'The courier cost is per order, not per dollar, so the two changes don’t have the same effect.', 3: 'Fixed costs stay the same, which is exactly why a fall in contribution goes straight to profit.' },
          solution: `A 1% fall in AOV removes 0.485 × $0.412 × 294 = $${(0.485 * 0.412 * 294).toFixed(2)} of contribution (${(Math.abs(pctDrop.aov) * 100).toFixed(1)}% of profit); a 1% fall in orders removes 2.94 orders × $${perOrder(M.aov).toFixed(2)} = $${(2.94 * perOrder(M.aov)).toFixed(2)} (${(Math.abs(pctDrop.orders) * 100).toFixed(1)}%). Changing one input at a time like this is a sensitivity analysis; a data table does it for many values at once.` },
      ],
    },
    {
      id: 'stock', title: 'Plan the July stock order',
      html: '<p>Kilnworth roasts to order. For 1–14 July it can roast at most 55 kg for Lantern; Ana has $1,800 for stock and six hours (360 minutes) to pack bags; she won’t order more of a coffee than she expects to sell in the fortnight; and she needs at least 80 bags of House Blend 250 g for subscribers. The worksheet is laid out for Solver: the bags to order are in B4:B7, the totals in B10:B14. Solve it, then switch the constraints to answer the questions.</p>',
      tool: { kind: 'widget', widget: { type: 'sheet', title: 'Stock plan', sheet: { cells: spCells }, view: 'A1:H14', editable: 'B4:B7', widths: { A: 26 },
        formats: { C: '$#,##0.00', D: '$#,##0.00', B11: '$#,##0.00', B14: '$#,##0.00', D11: '$#,##0.00' },
        tools: ['formulas', 'solver', 'reset'], solver: SOLVER } },
      items: [
        { id: 'b03-pj-22', type: 'steps', kind: 'applied', prompt: 'Run Solver with every constraint. How many of each should Ana order?',
          steps: SP.items.map((it, i) => ({ id: `b03-pj-22-${i + 1}`, type: 'num', unit: 'bags', places: 0, tol: 0.4, prompt: `${it.product}`, answer: best.x[i], check: () => brute().x[i] })),
          solution: `Solver (Simplex LP, whole bags) orders ${best.x.map((x, i) => `${x} × ${SP.items[i].product}`).join(', ')}. House Blend sits at its minimum and Ethiopia at its forecast: Ethiopia earns the most per bag of the 250 g coffees, and the 1 kg Espresso earns the most per minute of packing.` },
        num('b03-pj-23', 'What total contribution does that order give? Give it to the cent.', best.v, () => brute().v,
          `${best.x.map((x, i) => `${x} × $${unit[i].toFixed(2)}`).join(' + ')} = ${money(best.v)}.`,
          [{ value: r2(D.stock.relaxedContribution), say: 'That is the answer with fractional bags (switch the integer constraint off to see it). Bags come whole: keep B4:B7 = integer.' }], { tol: 0.01 }),
        { id: 'b03-pj-24', type: 'mc', kind: 'conceptual',
          prompt: 'Which limit binds in the best order (is used up exactly)?',
          options: ['Kilnworth’s 55 kg of roasted coffee', 'Ana’s $1,800 stock budget', 'The 360 minutes of packing time', 'None of them: the forecasts limit every coffee'], answer: 0,
          feedback: { 1: `The order costs ${money(budgetUsed)}, leaving ${money(SP.limits.budget - budgetUsed)} unspent: the budget has slack.`, 2: `Packing uses ${best.x.reduce((s, x, i) => s + x * SP.items[i].minutes, 0)} of 360 minutes; 2.5 minutes are left, too few for another 1 kg bag but not used up.`, 3: 'Colombia (30 of 60) and Espresso (15 of 25) are below their forecasts, so something else stops them.' },
          solution: `B10 = 0.25 × (80 + 30 + 50) + 15 = 55 kg, exactly the allocation. A binding constraint is the one to relax first: in this plan another kilogram is worth more than another dollar of budget, which has ${money(SP.limits.budget - budgetUsed)} of slack.` },
        num('b03-pj-25', 'If Kilnworth could roast 60 kg instead of 55, what would the best total contribution be? Give it to the cent.', best60.v, () => brute({ kg: 60 }).v,
          `Change D10 to 60 and solve again: ${best60.x.map((x, i) => `${x} × ${SP.items[i].product}`).join(', ')}, ${money(best60.v)}, ${money(best60.v - best.v)} more. Worth asking Kilnworth for, if the extra 5 kg costs less than that.`,
          [{ value: best.v, say: 'That is the 55 kg answer. Change the limit in D10 to 60 before you solve.' }], { tol: 0.01 }),
        num('b03-pj-26', 'Ana’s rule of at least 80 bags of House Blend for subscribers keeps a low-margin coffee in the order. How much contribution does that rule cost her in this plan? Give it to the cent.', r2(bestNoMin.v - best.v), () => brute({ minHB: 0 }).v - brute().v,
          `Switch off the House Blend constraint and solve: Solver orders only ${bestNoMin.x[0]} bags of House Blend and the contribution rises to ${money(bestNoMin.v)}. The rule costs ${money(bestNoMin.v - best.v)} this fortnight, which is the price of keeping subscribers supplied: a judgement Solver can’t make for her.`,
          [{ value: bestNoMin.v, say: 'That is the contribution without the rule. The question asks for the difference it makes.' }], { tol: 0.01 }),
      ],
    },
    {
      id: 'dashboard', title: 'Recommend Ana’s shop dashboard',
      html: '<p>From August Ana wants a one-page dashboard for the shop that she can refresh each month from the order export. Use what you found in this project and B01’s targets for the shop (conversion of 3.0%, average order value of $45, $15,000 of revenue a month and 35% of orders from returning customers).</p>',
      items: [
        { id: 'b03-pj-27', type: 'short', kind: 'applied',
          prompt: 'Write Ana a memo of 200–300 words recommending what her shop dashboard should show: the 4–6 measures (each with its definition and what it is compared with), the chart for each, the layout, how it refreshes and what checks keep it right.',
          rubric: [
            'Chooses 4–6 measures that answer Ana’s questions (for example revenue against the $15,000 target, orders, average order value against $45, gross margin rate, the share of orders paying delivery, subscriptions or returning customers) and defines each exactly.',
            'Gives every number a comparison: a target, last month or the same month last year.',
            'Picks a fitting chart for each (a line for trends, bars for comparisons, a single number with its comparison for headline measures) and avoids gauges, 3-D and pie charts of many slices.',
            'Puts the most important measure first and keeps scales and formats consistent.',
            'Builds it on a table of orders and the price list so that it refreshes, and lists checks (orders and revenue agree with the shop system; margin uses the current price list) and the date of the data.',
          ],
          model: '<b>To:</b> Ana · <b>From:</b> analyst · <b>Re:</b> the shop dashboard<br><br>I recommend one page with five measures, each against a target or last month. Across the top, three numbers: revenue against your $15,000 monthly target, orders against last month, and average order value against $45. Below them, a line chart of revenue and gross margin by month since March, so the trend is visible, with the margin rate (47.4% in the spring; 52% for the books’ year) labelled on it. Beside it, a bar chart of gross margin by product line: blends earn the most dollars at the lowest rate, gift boxes the reverse, and promotions should be judged on dollars, not rates.<br><br>Two smaller measures complete the page: the share of orders paying delivery (70% of spring orders were $35 or less, so the July rule will change this) and the share of orders from subscribers, whose 10% discount costs about six points of margin rate until we know how long they stay.<br><br>Build it on the order export as an Excel table, with the price list on its own sheet so the margin uses current costs; refreshing the table refreshes every PivotTable and chart. Each month, check that orders and revenue agree with the shop system’s totals, that no order fails the price-list lookup, and show the date of the data at the top. Leave out gauges and 3-D effects: they make numbers harder to compare.' },
      ],
    },
  ],
  rubric: [
    'Every new column is one formula filled down, with references that stay right (anchored ranges or table names), and no typed-in numbers.',
    'Margins come from what customers paid (after discounts) less what the coffee cost, and margin rates divide sums, not averages of percentages.',
    'The regression is read for what it shows: coefficients with the other variables held the same, a prediction inside the data’s range, the standard error as the typical miss, and no claim that the model shows causes.',
    'Goal Seek, the data table and Solver are set up on the model’s cells, whole bags are whole, and the binding limit and the cost of each rule are stated.',
    'The dashboard memo chooses few measures, gives each a comparison, and says how it refreshes and is checked.',
  ],
  verify() {
    const sh = new Sheet(sheet1({ ...filled('N', LOOKUP), ...filled('O', '=J2-G2*N2'), ...filled('P', '=VLOOKUP(J2,$X$2:$Y$3,2,TRUE)'), AA1: '=SUM(O2:O232)', AA2: '=AA1/SUM(J2:J232)', AA3: '=COUNTIF(P2:P232,">0")' }));
    const shop = new Sheet(SHOP_SHEET);
    const stock = solveSheet(new Sheet({ cells: spCells }), SOLVER);
    const stock60 = solveSheet(new Sheet({ cells: { ...spCells, D10: 60 } }), SOLVER);
    const dt = dataTable(shop, { target: 'B15', rowInput: 'B4', rowValues: [45], colInput: 'B3', colValues: [350] });
    return [
      ['gross margin (sheet)', sh.get('AA1'), 4315.85], ['gross margin (by hand)', totalMargin, 4315.85], ['margin rate %', sh.get('AA2') * 100, 47.45, 0.005],
      ['orders paying delivery (sheet)', sh.get('AA3'), 161], ['orders paying delivery', paying, 161], ['case DERIVED margin', D.grossMargin, 4315.85],
      ['Blend margin rate %', rate(blend) * 100, 41.49, 0.005], ['Central rate %', rate(central) * 100, 40.21, 0.005], ['Central without bulk %', rate(centralNoBulk) * 100, 49.34, 0.005],
      ['subscriptions rate %', rate(subs) * 100, 46.14, 0.005], ['one-off rate %', rate(oneOff) * 100, 48.08, 0.005], ['one-off without bulk %', rate(oneOffNoBulk) * 100, 51.88, 0.005], ['Blend margin $', lineMargin('Blend'), 2002.35],
      ['simple slope = by hand', coef(fit1, 'guests').estimate, slopeByHand, 1e-9], ['simple slope = case', coef(fit1, 'guests').estimate, D.regression.simple.coefs.guests.b, 1e-9],
      ['multi R² = case', fit3.r2, D.regression.multi.r2, 1e-12], ['prediction', predict(120, 4, 1), 1085.75, 0.005],
      ['contribution per order (sheet)', shop.get('B16'), 14.782, 1e-9], ['break-even (Goal Seek)', goalSeek(shop, { target: 'B15', goal: 0, changing: 'B3' }).value, M.fixed / perOrder(M.aov), 1e-6],
      ['break-even orders', breakEven, 136], ['profit at $45 and 350 (data table)', dt[0][0], 3818.75, 1e-6], ['AOV for $3,000 (Goal Seek)', goalSeek(shop, { target: 'B15', goal: 3000, changing: 'B4' }).value, aovFor3000, 1e-6],
      ['AOV for $3,000', aovFor3000, 45.79, 0.005],
      ['Solver = brute force: contribution', stock.objective, best.v, 1e-6], ...SP.items.map((it, i) => [`Solver = brute force: ${it.product}`, stock.values[`B${4 + i}`], best.x[i], 1e-9]),
      ['stock contribution', best.v, 1684.5], ['60 kg (Solver)', stock60.objective, best60.v, 1e-6], ['60 kg', best60.v, 1780.8], ['minimum House Blend costs', bestNoMin.v - best.v, 107],
      ['budget slack', SP.limits.budget - budgetUsed, 144.5], ['case stock = brute', D.stock.contribution, best.v, 1e-9],
      ['bulk order share of Central %', (bulk.order_total / sumBy(central, (o) => o.order_total)) * 100, 71.12, 0.005],
    ];
  },
};
