// lookups.js — B03 · Lookups: VLOOKUP, INDEX and MATCH, XLOOKUP. Content only; exercises are in lookups.ex.js.
// Every business, person and number is fictional (Lantern Coffee Co. from case.js; Spokewise Cycles invented here).
// Excel behaviour checked on Microsoft's pages on 23 October 2026 (see references).
import { PRODUCTS, PRODUCT_COLUMNS, ORDERS, ORDER_COLUMNS, EVENTS, DELIVERY_BANDS, SIZE_BANDS, DERIVED as D } from './case.js?v=15';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const col = (name) => ORDER_COLUMNS.indexOf(name);
const order = (id) => ORDERS.find((r) => r[0] === id);
const cost = (product) => PRODUCTS.find((p) => p[0] === product)[4];
const price = (product) => PRODUCTS.find((p) => p[0] === product)[3];
const pos = (product) => PRODUCTS.findIndex((p) => p[0] === product) + 1;
// approximate match: the last band whose lower bound is not above the value
const band = (bands, v) => { let k = -1; bands.forEach((b, i) => { if (b[0] <= v) k = i; }); return k < 0 ? null : bands[k][1]; };
const charge = (v) => band(DELIVERY_BANDS, v);
const sizeBand = (v) => band(SIZE_BANDS, v);
const month = (d) => ['Mar', 'Apr', 'May', 'Jun'][Number(d.slice(5, 7)) - 3];
const count = (m, ch) => ORDERS.filter((r) => month(r[col('order_date')]) === m && r[col('channel')] === ch).length;
const pier = EVENTS.filter((r) => r[2] === 'Pier Nine Studio');

// the simple example: five orders
const FIVE = ['LC-10001', 'LC-10002', 'LC-10003', 'LC-10004', 'LC-10005'].map(order);
const fiveCost = FIVE.map((r) => r[col('quantity')] * cost(r[col('product')]));
// the challenging example: six orders and two test values
const SIX = ['LC-10003', 'LC-10004', 'LC-10015', 'LC-10038', 'LC-10001', 'LC-10019'].map(order);
const sixTotals = SIX.map((r) => r[col('order_total')]);
// the applied example: Spokewise Cycles (fictional)
const PARTS = [[10432, 'Brake pads (pair)', 20], [10433, 'Inner tube 700c', 30], [10440, 'Chain, 11-speed', 8], [10451, 'Bar tape', 12], [10458, 'Tyre levers (set)', 25], [10466, 'Mudguard set', 6]];
const SUPPLIER = [[10432, 6.40], ['10433', 4.10], ['10440 ', 18.50], [10451, 7.25], [10458, 2.30], [10471, 12.90]];
const exact = (k) => SUPPLIER.find((s) => s[0] === k);                                   // as typed: types must match
const cleaned = (k) => SUPPLIER.find((s) => Number(String(s[0]).trim()) === k);           // after VALUE(TRIM(…))
const costIf = (find) => PARTS.reduce((s, p) => s + (find(p[0]) ? p[2] * find(p[0])[1] : 0), 0);

export default {
  slug: 'lookups',
  title: 'Lookups: VLOOKUP, INDEX and MATCH, XLOOKUP',
  blurb: 'Bring a value from one table into another by matching a key: a product’s cost from a price list, a delivery charge from a table of bands. Learn VLOOKUP, INDEX and MATCH, and XLOOKUP, when to match exactly and when approximately, and how to find out why a lookup returns #N/A or, worse, a wrong answer.',
  status: 'reviewed',
  objectives: [
    'Use VLOOKUP with an exact match to bring a value from a lookup table into a list, and explain why leaving out its fourth argument is a trap.',
    'Build INDEX and MATCH lookups, including lookups to the left of the key and two-way lookups by a row and a column label.',
    'Use XLOOKUP and XMATCH with a not-found value, match modes and search modes, and state which versions of Excel have them.',
    'Apply approximate-match lookups to band tables such as delivery charges, and test the boundaries of every band.',
    'Diagnose lookups that return #N/A or a wrong value because of spaces, numbers stored as text, misspellings, missing keys or duplicate keys.',
  ],
  prerequisites: [
    { lesson: 'b03/cells-and-formulas', why: 'A lookup table must stay put when the formula is filled down, which takes absolute references such as $H$2:$L$12.' },
    { lesson: 'b03/functions-and-logic', why: 'Lookups are combined with IF, IFNA, TRIM and VALUE, which that lesson introduces.' },
    { lesson: 'b02/datasets-and-variables', why: 'A lookup matches rows by a key; primary keys are defined there.' },
  ],
  case: 'lantern',

  concept: [
    { case: `Ana’s spring order sheet lists each order’s product and quantity, but not what the coffee cost Lantern. That is on Kilnworth Roasting’s spring price list: ${PRODUCTS.length} products, each with its line, bag size, Lantern’s shop price and Kilnworth’s cost per item. To cost an order she needs the right unit cost beside it. Typing ${D.orders} costs by hand would take an afternoon and invite slips, and when Kilnworth raises its prices in the autumn every typed cost would be out of date.` },
    { p: 'A lookup formula does the job in one step. It takes the product named in the order row, finds that product in the price list and brings back the value in the same row of the cost column. Filled down the order sheet, it costs every order, and if the price list changes, every cost changes with it.' },
    { p: 'Every lookup has three parts. The <g>lookup value</g> is what you search for: the product in the order row. The <g>lookup table</g> is the range that holds the keys and the answers: the price list. The return column holds the answer you want: <code>unit_cost</code>. Excel searches the key column for the lookup value and returns the value from the same row of the return column, much as you find a word in a dictionary and read the definition beside it.' },
    { table: {
      caption: 'Kilnworth’s spring price list as Ana keeps it, in H1:L12 of her order workbook (fictional)',
      head: ['', 'H', 'I', 'J', 'K', 'L'],
      align: ['r', 'l', 'l', 'r', 'r', 'r'],
      rows: [['1', 'product', 'line', 'size_g', 'price', 'unit_cost'], ...PRODUCTS.map((p, i) => [String(i + 2), p[0], p[1], String(p[2]), money(p[3]), money(p[4])])],
    } },
    { p: 'In the order sheet, column A holds the order id, B the product and C the quantity. In D2 Ana types <x>=XLOOKUP(B2,$H$2:$H$12,$L$2:$L$12)</x>, which reads: look for B2 in H2:H12 and return the value in the same position of L2:L12. Order LC-10001 is two Gift Box Trios, so D2 shows ' + money(cost('Gift Box Trio')) + '. Filled down, B2 becomes B3, B4 and so on, while the dollar signs keep the price list where it is.' },
    { p: 'Excel offers three ways to write a lookup. VLOOKUP is the oldest and works in every version. INDEX with MATCH also works everywhere and is more flexible. XLOOKUP is the newest and the simplest to read, but among desktop versions only Excel for Microsoft 365, Excel 2021 and Excel 2024 have it. You will meet all three in other people’s workbooks, so this lesson teaches all three.' },
    { p: 'Each can match in two ways. An <g>exact match</g> returns a result only when it finds a key equal to the lookup value, and #N/A when it doesn’t: right for product names, order ids and customer numbers. An <g>approximate match</g> finds the band a number falls in: the row with the largest lower bound that is not above the value. That is right for delivery charges, quantity discounts and tax bands. Lantern’s July delivery rule (from B01) is a two-row band table: orders up to $35.00 pay ' + money(DELIVERY_BANDS[0][1]) + ', and orders over $35 travel free.' },
    { figure: {
      svg: '<svg viewBox="0 0 680 310" xmlns="http://www.w3.org/2000/svg" font-size="13" fill="currentColor"><defs><marker id="lk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)"/></marker></defs><text x="10" y="20" font-weight="700">Exact match: =VLOOKUP(&quot;Cold Brew Pack&quot;,H2:L12,5,FALSE)</text><g stroke="var(--rule-strong)" fill="none" stroke-width="1"><rect x="60" y="40" width="170" height="22"/><rect x="230" y="40" width="90" height="22"/><rect x="320" y="40" width="70" height="22"/><rect x="60" y="62" width="170" height="22"/><rect x="230" y="62" width="90" height="22"/><rect x="320" y="62" width="70" height="22"/><rect x="60" y="84" width="170" height="22"/><rect x="230" y="84" width="90" height="22"/><rect x="320" y="84" width="70" height="22"/><rect x="60" y="106" width="170" height="22"/><rect x="230" y="106" width="90" height="22"/><rect x="320" y="106" width="70" height="22"/><rect x="60" y="128" width="170" height="22"/><rect x="230" y="128" width="90" height="22"/><rect x="320" y="128" width="70" height="22"/></g><text x="145" y="56" text-anchor="middle" font-weight="700">H: product</text><text x="275" y="56" text-anchor="middle" font-weight="700">I to K</text><text x="355" y="56" text-anchor="middle" font-weight="700">L: cost</text><text x="66" y="78">House Blend 250g</text><text x="275" y="78" text-anchor="middle">…</text><text x="384" y="78" text-anchor="end">8.00</text><text x="66" y="100">House Blend 1kg</text><text x="275" y="100" text-anchor="middle">…</text><text x="384" y="100" text-anchor="end">26.00</text><text x="145" y="122" text-anchor="middle">⋮</text><text x="66" y="144" font-weight="700">Cold Brew Pack</text><text x="275" y="144" text-anchor="middle">…</text><text x="384" y="144" text-anchor="end" font-weight="700">8.50</text><rect x="320" y="128" width="70" height="22" fill="none" stroke="var(--series-1)" stroke-width="2.5"/><rect x="60" y="128" width="170" height="22" fill="none" stroke="var(--series-1)" stroke-width="2.5"/><line x1="44" y1="66" x2="44" y2="140" stroke="var(--ink-3)" stroke-width="1.5" marker-end="url(#lk-arrow)"/><line x1="232" y1="139" x2="318" y2="139" stroke="var(--series-1)" stroke-width="1.5" marker-end="url(#lk-arrow)"/><text x="10" y="178">1. Search the first column, top to bottom, for an equal value.</text><text x="10" y="198">2. Move across the same row to column 5 and return it: 8.50.</text><text x="10" y="218">No equal value anywhere: #N/A.</text><text x="430" y="20" font-weight="700">Approximate match: order value $34.99</text><g stroke="var(--rule-strong)" fill="none" stroke-width="1"><rect x="450" y="40" width="90" height="22"/><rect x="540" y="40" width="90" height="22"/><rect x="450" y="62" width="90" height="22"/><rect x="540" y="62" width="90" height="22"/><rect x="450" y="84" width="90" height="22"/><rect x="540" y="84" width="90" height="22"/></g><text x="495" y="56" text-anchor="middle" font-weight="700">from</text><text x="585" y="56" text-anchor="middle" font-weight="700">charge</text><text x="534" y="78" text-anchor="end">0.00</text><text x="624" y="78" text-anchor="end" font-weight="700">4.95</text><text x="534" y="100" text-anchor="end">35.01</text><text x="624" y="100" text-anchor="end">0.00</text><rect x="450" y="62" width="180" height="22" fill="none" stroke="var(--series-2)" stroke-width="2.5"/><text x="430" y="132">0.00 is not above 34.99: a candidate.</text><text x="430" y="152">35.01 is above 34.99: stop.</text><text x="430" y="172">Return the last candidate’s charge: 4.95.</text><text x="430" y="198">An order of 35.01 or more lands in the</text><text x="430" y="216">second band and pays 0.00.</text><line x1="10" y1="244" x2="670" y2="244" stroke="var(--rule-strong)" stroke-width="1" stroke-dasharray="4 4"/><text x="340" y="268" text-anchor="middle">Exact matching works on a list in any order. VLOOKUP’s approximate match needs the “from”</text><text x="340" y="288" text-anchor="middle">column sorted from smallest to largest, because it assumes the bounds rise down the column.</text></svg>',
      caption: 'How the two kinds of lookup search. An exact match scans the key column for an equal value; an approximate match finds the last band whose lower bound is not above the value.',
      alt: 'Two panels. The left panel, titled “Exact match”, shows a VLOOKUP that looks up Cold Brew Pack in H2:L12 and returns column 5 with FALSE as its last argument. It shows part of the price list with columns H (product), I to K (collapsed) and L (cost). The rows read House Blend 250g with cost 8.00, House Blend 1kg with cost 26.00, a gap, and Cold Brew Pack with cost 8.50, which is highlighted. An arrow runs down the product column to the Cold Brew Pack row and a second arrow runs across that row to the cost cell. Text explains: 1. search the first column, top to bottom, for an equal value; 2. move across the same row to column 5 and return it, 8.50; no equal value anywhere gives #N/A. The right panel, titled “Approximate match: order value $34.99”, shows a band table with columns from and charge: 0.00 with 4.95 (highlighted) and 35.01 with 0.00. Text explains that 0.00 is not above 34.99 so it is a candidate, 35.01 is above 34.99 so the search stops, and the last candidate’s charge, 4.95, is returned; an order of 35.01 or more lands in the second band and pays 0.00. A note along the bottom says that exact matching works on a list in any order, while VLOOKUP’s approximate match needs the from column sorted from smallest to largest, because it assumes the bounds rise down the column.',
    } },
    { callout: 'key', title: 'A lookup needs a key that identifies one row', html: 'The price list must hold each product once: product is its <g>primary key</g>. If a key appears twice, every lookup function in this lesson returns the first match and ignores the second, without any warning, unless XLOOKUP is told to search from the last item. Check a key column for duplicates before you rely on lookups into it.' },
  ],

  theory: [
    { h: 'VLOOKUP' },
    { p: 'VLOOKUP (“vertical lookup”) searches down the first column of a range and returns a value from a column to its right. It takes four arguments.' },
    { table: {
      caption: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
      head: ['Argument', 'What it is', 'In Ana’s formula'],
      rows: [
        ['lookup_value', 'The value to find in the first column of the table', 'B2, the order’s product'],
        ['table_array', 'The range holding the keys (first column) and the answers', '$H$2:$L$12, locked with $'],
        ['col_index_num', 'Which column of the range to return, counting the first as 1', '5, column L (unit_cost)'],
        ['range_lookup', 'FALSE (or 0) for an exact match; TRUE or left out for an approximate match', 'FALSE'],
      ],
    } },
    { p: 'So Ana’s VLOOKUP version is <x>=VLOOKUP(B2,$H$2:$L$12,5,FALSE)</x>. It returns the same costs as her XLOOKUP. Without the dollar signs of an <g>absolute reference</g>, filling it down would slide the range to H3:L13, H4:L14 and so on, and the lower rows would stop finding the products near the top of the list.' },
    { callout: 'warn', title: 'Leave out the fourth argument and VLOOKUP approximates', html: 'If range_lookup is TRUE or missing, VLOOKUP assumes the first column is sorted from smallest to largest and returns the closest match below the lookup value. On an unsorted product list it returns some other product’s cost for some orders and #N/A for others, with no warning. Type FALSE (or 0) every time you want an exact match. Try it in the worksheet under Explore: delete <x>,FALSE</x> and watch some costs change.' },
    { p: 'VLOOKUP has two more weaknesses. First, the lookup value must be in the first column of table_array, so it can’t return anything to the left of the key: to find an order id from a customer number, the customer column must come first. Second, the column number is a constant typed into the formula. If someone inserts a column for supplier codes between <code>line</code> and <code>size_g</code>, Excel widens the range to $H$2:$M$12 but leaves the 5 alone, so the formula now returns column L, which holds the price: Gift Box Trio comes back at ' + money(price('Gift Box Trio')) + ' instead of ' + money(cost('Gift Box Trio')) + '. A column number larger than the range is wide gives #REF!.' },
    { p: 'HLOOKUP is the same function turned on its side: it searches across the top row of a range and returns a value from a row below, with the same fourth argument and the same default. You need it only for tables laid out sideways, such as a rate card with months across the top.' },

    { h: 'INDEX and MATCH' },
    { p: 'MATCH finds a position: <x>=MATCH("Cold Brew Pack",$H$2:$H$12,0)</x> returns ' + pos('Cold Brew Pack') + ', because Cold Brew Pack is the ' + pos('Cold Brew Pack') + 'th item in H2:H12. INDEX returns what is at a position: <x>=INDEX($L$2:$L$12,10)</x> returns ' + money(cost('Cold Brew Pack')) + ', the 10th value in L2:L12. Put together, <x>=INDEX($L$2:$L$12,MATCH(B2,$H$2:$H$12,0))</x> finds the order’s product in column H and returns the cost from the same position in column L.' },
    { p: 'The pair fixes both of VLOOKUP’s weaknesses. The return range is separate from the key range, so it can lie to the left. And because both are ordinary references, inserting a column shifts them along with the data, so the formula keeps pointing at the cost. One MATCH can also feed several INDEX formulas, which matters in a large workbook.' },
    { callout: 'warn', title: 'MATCH’s default isn’t exact either', html: 'MATCH’s third argument, match_type, defaults to 1: the largest value less than or equal to the lookup value, in a list sorted from smallest to largest. 0 finds the first value exactly equal to the lookup value, in a list in any order, and −1 finds the smallest value greater than or equal to it, in a list sorted from largest to smallest. For keys, always type 0.' },
    { p: 'INDEX can also take a row number and a column number, which gives a <g>two-way lookup</g>: one MATCH finds the row, another the column. The table below counts Ana’s spring orders by month and channel. To fetch May’s web orders, <x>=INDEX($B$2:$C$5,MATCH("May",$A$2:$A$5,0),MATCH("web",$B$1:$C$1,0))</x> returns ' + count('May', 'web') + '. Point the two lookup values at cells holding a month and a channel, and the same formula answers any combination.' },
    { table: {
      caption: 'Spring orders by month and channel, as a small worksheet (counted from Lantern’s 231 orders)',
      head: ['', 'A', 'B', 'C'],
      align: ['r', 'l', 'r', 'r'],
      rows: [['1', 'month', 'app', 'web'], ...['Mar', 'Apr', 'May', 'Jun'].map((m, i) => [String(i + 2), m, String(count(m, 'app')), String(count(m, 'web'))])],
    } },

    { h: 'XLOOKUP and XMATCH' },
    { p: 'XLOOKUP keeps the lookup range and the return range apart, as INDEX and MATCH do, and matches exactly unless told otherwise. Its first three arguments are required.' },
    { table: {
      caption: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
      head: ['Argument', 'Values and meaning'],
      rows: [
        ['lookup_value', 'The value to find'],
        ['lookup_array', 'The column (or row) to search'],
        ['return_array', 'The column (or row) to return from, the same length as lookup_array; several columns return several values'],
        ['if_not_found', 'What to show when nothing matches; left out, the result is #N/A'],
        ['match_mode', '0 exact match (the default); −1 exact match or else the next smaller item; 1 exact match or else the next larger item; 2 wildcard match, where * and ? stand for any characters and ~ escapes them'],
        ['search_mode', '1 search from the first item (the default); −1 search from the last item; 2 and −2 binary search, which needs the list sorted ascending or descending'],
      ],
    } },
    { p: 'Three of these options solve everyday problems. A not-found value makes a missing key visible: <x>=XLOOKUP(B2,$H$2:$H$12,$L$2:$L$12,"not on price list")</x>. Searching from the last item finds the most recent match in a list kept in date order: in Lantern’s events sheet, with event ids in column A and clients in column C, <x>=XLOOKUP("Pier Nine Studio",$C$2:$C$77,$A$2:$A$77,,0,-1)</x> returns ' + pier[pier.length - 1][0] + ', the client’s latest event (' + pier[pier.length - 1][1].slice(8, 10).replace(/^0/, '') + ' December), while searching from the first item returns ' + pier[0][0] + '. And a return range of several columns brings back several values at once: <x>=XLOOKUP("Cold Brew Pack",$H$2:$H$12,$I$2:$L$12)</x> returns the line, size, price and cost, which <g>spill</g> into four cells side by side.' },
    { p: 'XLOOKUP also works on tables laid out across a row, so it replaces HLOOKUP too. XMATCH is MATCH with XLOOKUP’s arguments: it returns a position, matches exactly by default, and takes the same match and search modes. Microsoft’s own two-way example combines them: <x>=INDEX($B$2:$C$5,XMATCH("May",$A$2:$A$5),XMATCH("web",$B$1:$C$1))</x> gives the same ' + count('May', 'web') + ' as the INDEX and MATCH version.' },
    { callout: 'standards', title: 'Which versions have XLOOKUP and XMATCH', html: 'XLOOKUP and XMATCH work in Excel for Microsoft 365, Excel 2024 and Excel 2021, on Windows and on Mac. Microsoft states that XLOOKUP is not available in Excel 2016 or Excel 2019. VLOOKUP, HLOOKUP, INDEX and MATCH work in all of these. If a workbook will be opened by someone on an older version, build its lookups with INDEX and MATCH.' },

    { h: 'Approximate match: lookups into bands' },
    { p: 'A band table lists the lower bound (“from”) of each band in its first column, sorted from smallest to largest, with each band’s result beside it. An approximate match returns the result of the last band whose lower bound is not above the lookup value. The formula card below states the rule; the figure above shows it working.' },
    { table: {
      caption: 'Two band tables from the case: the July delivery rule (F1:G3) and Ana’s order-size bands (I1:J5)',
      head: ['', 'F: from', 'G: charge', 'I: from', 'J: band'],
      align: ['r', 'r', 'r', 'r', 'l'],
      rows: [
        ['1', 'from', 'charge', 'from', 'band'],
        ...SIZE_BANDS.map((b, i) => [String(i + 2), DELIVERY_BANDS[i] ? money(DELIVERY_BANDS[i][0]) : '', DELIVERY_BANDS[i] ? money(DELIVERY_BANDS[i][1]) : '', money(b[0]), b[1]]),
      ],
    } },
    { p: 'With the order value in B2, any of three formulas returns the delivery charge: <x>=VLOOKUP(B2,$F$2:$G$3,2,TRUE)</x>, <x>=XLOOKUP(B2,$F$2:$F$3,$G$2:$G$3,,-1)</x> (match mode −1: exact match or else the next smaller item) and <x>=INDEX($G$2:$G$3,MATCH(B2,$F$2:$F$3,1))</x>. The size band is the same idea with four rows: <x>=XLOOKUP(B2,$I$2:$I$5,$J$2:$J$5,,-1)</x>.' },
    { p: 'The boundary needs care. B01’s rule is free delivery on orders over $35, and order values are whole cents, so the free band starts at ' + money(DELIVERY_BANDS[1][0]) + ' and an order of exactly $35.00 pays ' + money(DELIVERY_BANDS[0][1]) + '. Typing 35 in the table would hand a $35.00 order free delivery that the rule doesn’t give. Test every boundary with a value just below it, one exactly on it and one just above it: 34.99, 35.00 and 35.01 here. Test the bottom too: a value below the first lower bound, such as a −12.60 refund, has no band and returns #N/A.' },
    { p: 'Keep band tables sorted. Microsoft documents that VLOOKUP’s approximate match and MATCH with match_type 1 assume the first column is sorted from smallest to largest, and that XLOOKUP’s binary search modes give invalid results on unsorted data. XLOOKUP’s default search reads every item, so its match_mode −1 copes with an unsorted table, but a sorted table is the one a reader can check at a glance. Why not use IF? <x>=IF(B2>35,0,4.95)</x> works for two bands, but four size bands need nested IFs with the thresholds buried inside the formula, while a band table puts the rule where anyone can read and change it.' },

    { h: 'Why a lookup returns #N/A, or the wrong answer' },
    { p: 'An #N/A from an exact-match lookup is an <g>error value</g> that means “no key equal to this one”. Microsoft’s list of the usual causes covers four of the rows below: the value really isn’t there, the two sides hold different data types, there are extra spaces, and the match type is wrong. The wrong match type, the unlocked range and the duplicate key are the dangerous ones, because they can give a plausible number instead of an error. Two tests help with types: <x>=ISTEXT(B2)</x> is TRUE when B2 holds text, and <x>=ISNUMBER(B2)</x> is TRUE when it holds a number.' },
    { table: {
      caption: 'Diagnosing a lookup',
      head: ['Cause', 'What you see', 'How to test', 'Fix'],
      rows: [
        ['Extra spaces: “Cold Brew Pack ” with a trailing space', '#N/A', '<x>=LEN(B2)</x> is longer than the name looks', 'TRIM the key, or look up <x>TRIM(B2)</x>'],
        ['A number stored as text on one side: “10144” against 10144', '#N/A', '<x>=ISTEXT(B2)</x> and <x>=ISNUMBER(H2)</x> disagree', 'Convert one side so both match: VALUE for text to number, <x>&""</x> for number to text'],
        ['A different spelling: “Ethiopia Yirgachefe”', '#N/A', 'Compare with the list; <x>=COUNTIF($H$2:$H$12,B2)</x> is 0', 'Correct the source or add a mapping table'],
        ['The key isn’t in the table: a new product', '#N/A', 'Search the list for it', 'Add it, or flag it with if_not_found or IFNA'],
        ['Approximate match by accident: VLOOKUP without FALSE', 'A wrong value, or sometimes #N/A', 'Read the fourth argument', 'Type FALSE (or 0)'],
        ['The table range wasn’t locked', 'Right in the top rows, #N/A or wrong lower down', 'Show Formulas and read a lower row', 'Add $ to the table range'],
        ['The key appears twice', 'The first match, no error', '<x>=COUNTIF($H$2:$H$12,H2)</x> above 1', 'Remove or merge the duplicate'],
      ],
    } },
    { p: 'Handle a genuine miss on purpose. XLOOKUP’s if_not_found, or <x>=IFNA(VLOOKUP(B2,$H$2:$L$12,5,FALSE),"not on price list")</x> in versions without XLOOKUP, labels the rows that need attention. Don’t wrap lookups in IFERROR to make the errors go away: IFERROR also hides a #REF! or #VALUE! from a broken formula, and a cost replaced by 0 or a blank understates the product cost without anyone noticing. The functions-and-logic lesson compares IFERROR and IFNA.' },
    { p: 'Duplicate keys deserve a check of their own. Microsoft’s developer reference for VLOOKUP says that when two or more values in the first column match, the first value found is used; MATCH with 0 finds the first value exactly equal to the lookup value; and XLOOKUP searches from the first item unless told otherwise. A price list with House Blend 250g twice, at two costs, would return the first cost for every order, right or not. Fill <x>=COUNTIF($H$2:$H$12,H2)</x> down beside the key column: any result above 1 is a duplicate key to resolve (B02’s duplicates lesson covers how).' },

    { h: 'Which lookup to use' },
    { table: {
      caption: 'The three ways compared',
      head: ['', 'VLOOKUP', 'INDEX and MATCH', 'XLOOKUP'],
      rows: [
        ['Versions', 'All', 'All', 'Microsoft 365, 2021 and 2024'],
        ['Default match', 'Approximate (type FALSE)', 'MATCH approximate (type 0)', 'Exact'],
        ['Return a column left of the key', 'No', 'Yes', 'Yes'],
        ['Survives an inserted column', 'No: the column number stays', 'Yes', 'Yes'],
        ['When the key is missing', '#N/A (wrap in IFNA)', '#N/A (wrap in IFNA)', 'if_not_found argument'],
        ['Several columns at once', 'No', 'No, without extra work', 'Yes, they spill'],
      ],
    } },
    { p: 'Use XLOOKUP when everyone who opens the workbook has a version that supports it; use INDEX and MATCH when someone may open it in Excel 2019 or earlier; and learn to read VLOOKUP, because it fills the workbooks you will inherit. Whichever you write, check the match type, lock the table range and test a key you know.' },
  ],

  formulas: [
    { id: 'approximate-match', name: 'Approximate-match (band) lookup',
      tex: String.raw`\text{result} = r_k, \quad k = \max\{\, i : f_i \le v \,\}`,
      where: [
        [String.raw`v`, 'The lookup value, such as an order value', 'as the table'],
        [String.raw`f_i`, 'The lower bound (“from”) of band i; the bounds are sorted so that f₁ < f₂ < …', 'as v'],
        [String.raw`r_i`, 'The result for band i, such as its delivery charge or its label', 'any'],
        [String.raw`i`, 'A band’s position in the table, counting from the top', ''],
        [String.raw`k`, 'The band the value falls in: the last band whose lower bound is not above v', ''],
      ],
      assumptions: 'VLOOKUP with TRUE and MATCH with match_type 1 need the “from” column sorted from smallest to largest; XLOOKUP’s default search reads every item, so its match_mode −1 also works on an unsorted table (keep it sorted anyway, so people can check it). If v is below the first lower bound, no band qualifies and the lookup returns #N/A.',
      note: 'VLOOKUP with TRUE, MATCH with match_type 1 and XLOOKUP with match_mode −1 all apply this rule.' },
  ],

  examples: [
    { level: 'simple', title: 'The product cost of five orders', fictional: true,
      setup: 'Ana wants the product cost (what the coffee cost Lantern) of the first five spring orders. The orders are in A1:C6 of her sheet and Kilnworth’s price list in H1:L12, as in the table under The idea. Write the unit-cost formula, fill it down, and work out each order’s product cost.',
      table: {
        caption: 'The order sheet with the formulas in row 2 (filled down to row 6)',
        head: ['', 'A: order_id', 'B: product', 'C: quantity', 'D: unit_cost', 'E: product_cost'],
        align: ['r', 'l', 'l', 'r', 'r', 'r'],
        rows: [
          ['2', FIVE[0][0], FIVE[0][col('product')], String(FIVE[0][col('quantity')]), '<x>=XLOOKUP(B2,$H$2:$H$12,$L$2:$L$12)</x>', '<x>=C2*D2</x>'],
          ...FIVE.slice(1).map((r, i) => [String(i + 3), r[0], r[col('product')], String(r[col('quantity')]), '(filled)', '(filled)']),
        ],
      },
      steps: [
        'Decide the match type. Products are keys, so the lookup must be exact; XLOOKUP matches exactly by default (with VLOOKUP you would type FALSE).',
        'Write D2 so that it fills down correctly: B2 is relative, so it moves to B3, B4…, and the two price-list ranges carry $ so they stay on H2:H12 and L2:L12.',
        'Read the results. D2 to D6 show ' + FIVE.map((r) => money(cost(r[col('product')]))).join(', ') + ' (Gift Box Trio, Colombia Huila 250g, House Blend 250g twice, House Blend 1kg).',
        'Multiply by the quantity in E: ' + FIVE.map((r, i) => `${r[col('quantity')]} × ${money(cost(r[col('product')]))} = ${money(fiveCost[i])}`).join('; ') + '.',
        'Check one result by hand against the price list: House Blend 1kg costs ' + money(cost('House Blend 1kg')) + ' a bag, and LC-10005 has two, so ' + money(fiveCost[4]) + '. Then add the column: ' + money(fiveCost.reduce((s, x) => s + x, 0)) + '.',
      ],
      answer: 'The five orders cost Lantern ' + fiveCost.slice(0, 4).map(money).join(', ') + ' and ' + money(fiveCost[4]) + ': ' + money(fiveCost.reduce((s, x) => s + x, 0)) + ' in all.',
      interpretation: 'One formula, filled down, costs every order and stays right when Kilnworth’s list changes. The same formula over all 231 orders is the first step of the course project, where Ana turns these costs into her margin figures.' },

    { level: 'challenging', title: 'Delivery charges and size bands, boundaries included', fictional: true,
      setup: 'Ana wants to know what six spring orders would have paid under the July delivery rule, and which size band each falls in. She adds two test values, $35.00 and $35.01, to check the boundary. The bands are in F1:G3 and I1:J5 as in the table under In depth.',
      table: {
        caption: 'Six orders and two test values, with the formulas in row 2 (filled down)',
        head: ['', 'A: order', 'B: order_total', 'C: delivery', 'D: size band'],
        align: ['r', 'l', 'r', 'r', 'l'],
        rows: [
          ['2', SIX[0][0], money(sixTotals[0]), '<x>=VLOOKUP(B2,$F$2:$G$3,2,TRUE)</x>', '<x>=XLOOKUP(B2,$I$2:$I$5,$J$2:$J$5,,-1)</x>'],
          ...SIX.slice(1).map((r, i) => [String(i + 3), r[0], money(sixTotals[i + 1]), money(charge(sixTotals[i + 1])), sizeBand(sixTotals[i + 1])]),
          ['8', 'test', money(35), money(charge(35)), sizeBand(35)],
          ['9', 'test', money(35.01), money(charge(35.01)), sizeBand(35.01)],
        ],
      },
      steps: [
        'Choose approximate matching: the order values are not in the table, and each must land in the band whose lower bound is the largest one not above it. VLOOKUP needs TRUE; XLOOKUP needs match_mode −1.',
        'Check the tables are sorted ascending by “from”: 0, 35.01 and 0, 20, 40, 100. Approximate matching relies on that order.',
        'Read the delivery column. ' + SIX.map((r, i) => `${r[0]} (${money(sixTotals[i])}) pays ${money(charge(sixTotals[i]))}`).join('; ') + '. Three of the six would pay, ' + money(SIX.filter((_, i) => charge(sixTotals[i]) > 0).length * DELIVERY_BANDS[0][1]) + ' between them.',
        'Check the boundary rows: $35.00 pays ' + money(charge(35)) + ' because it is not over $35, and $35.01 travels free. Had the table said 35 instead of 35.01, the $35.00 test would show $0.00, contradicting the rule; none of the six real orders would change, which is exactly why the test values are needed.',
        'Read the size bands: ' + SIX.map((r, i) => `${r[0]} ${sizeBand(sixTotals[i])}`).join('; ') + '. LC-10038 at ' + money(sixTotals[3]) + ' is free to deliver but still in the $20 to $39.99 band, because the two tables have different boundaries.',
        'Finally, see what goes wrong with an exact match: <x>=VLOOKUP(B2,$F$2:$G$3,2,FALSE)</x> finds no order value equal to 0 or 35.01, so all six rows show #N/A.',
      ],
      answer: 'Three of the six orders (' + SIX.filter((_, i) => charge(sixTotals[i]) > 0).map((r) => r[0]).join(', ') + ') would pay ' + money(DELIVERY_BANDS[0][1]) + ' each; the other three travel free. The test values confirm that $35.00 pays and $35.01 is free.',
      interpretation: 'An approximate match is only as good as its band table. Writing the boundary as 35.01 encodes “over $35” exactly, and the two test rows prove it; a table that is wrong by one cent would pass every real order in this sample and still be wrong. The project applies the same lookup to all 231 orders.' },

    { level: 'applied', title: 'Three lookups fail at a bike shop', fictional: true,
      setup: 'Spokewise Cycles, a fictional bike shop, reorders six parts. Its reorder sheet holds part numbers as numbers in A2:A7; the supplier’s new price file is pasted into H1:I7, beside it. The buyer’s formula <x>=XLOOKUP(A2,$H$2:$H$7,$I$2:$I$7)</x> finds only three prices, and a colleague suggests wrapping it in IFERROR with 0 so the total adds up. Should she?',
      table: {
        caption: 'The reorder sheet (A:C) and the supplier’s file as pasted (H:I); columns D to G are empty (fictional)',
        head: ['', 'A: part_no', 'B: part', 'C: qty', 'H: part_no', 'I: unit_price'],
        align: ['r', 'r', 'l', 'r', 'l', 'r'],
        rows: [
          ['1', 'part_no', 'part', 'qty', 'part_no', 'unit_price'],
          ...PARTS.map((p, i) => [String(i + 2), String(p[0]), p[1], String(p[2]), typeof SUPPLIER[i][0] === 'number' ? `${SUPPLIER[i][0]} (number)` : `“${SUPPLIER[i][0]}” (text)`, money(SUPPLIER[i][1])]),
        ],
      },
      steps: [
        'Test the failures before hiding them. Parts 10433 and 10440 are in the file, but <x>=ISTEXT(H3)</x> is TRUE: the supplier exported them as text, so the number 10433 is never equal to the text “10433”. Part 10440’s key also has a trailing space, which <x>=LEN(H4)</x> shows as 6 characters instead of 5.',
        'Fix the key, not the result. In a helper column G, <x>=VALUE(TRIM(H2))</x> filled down turns every supplier key into a number with no spaces. Then look up against it: <x>=XLOOKUP(A2,$G$2:$G$7,$I$2:$I$7,"not in supplier file")</x>.',
        'Now ' + PARTS.filter((p) => cleaned(p[0])).length + ' of 6 parts find a price, and the mudguard set (10466) is flagged: it is genuinely missing, perhaps discontinued, which is a question for the supplier, not a formula. (Part 10471 in the file is one Spokewise isn’t reordering.)',
        'Compare the totals. With IFERROR and 0, the reorder would have cost ' + money(costIf(exact)) + ' on paper; with the keys fixed, the five priced parts cost ' + money(costIf(cleaned)) + '. The IFERROR version understated the order by ' + money(costIf(cleaned) - costIf(exact)) + ' and hid the missing part.',
      ],
      answer: 'No. Two of the three failures were type and space problems in the supplier’s keys, fixed with VALUE and TRIM; only one part is really missing, and it should be flagged, not costed at $0. The reorder costs ' + money(costIf(cleaned)) + ' for five parts, plus the mudguards once the supplier confirms a price.',
      interpretation: 'An error value is information. Replacing it with 0 would have turned “we can’t find this price” into “this part is free” and sent a purchase order $' + (costIf(cleaned) - costIf(exact)).toFixed(2) + ' short. Diagnose each #N/A, fix the key where the key is at fault, and flag what is really missing.' },
  ],

  demo: [
    { widget: 'lk-sheet', intro: 'Eight spring orders, Kilnworth’s price list and the July delivery bands. Click Show formulas to read the lookups. Then break them on purpose: delete <x>,FALSE</x> from a VLOOKUP and see which costs change; type a space after a product name in column B; change a cost in the price list and watch the order rows follow; change 35.01 in the band table to 35 and type 35 into an order value.' },
  ],

  mistakes: [
    { title: '“VLOOKUP finds the matching row.”', html: 'Only if you ask for an exact match. Its fourth argument defaults to TRUE, an approximate match that assumes a sorted first column; on an unsorted list it returns plausible wrong values without any error. Type FALSE every time you look up a key, or use XLOOKUP, which is exact by default.' },
    { title: '“The formula worked in the first row, so it works all the way down.”', html: 'Without dollar signs on the table range, filling down slides the range: by row 10 it starts eight rows below the top of the list, and the products above it can no longer be found. Lock the table range ($H$2:$L$12) and check a row near the bottom.' },
    { title: '“#N/A means the product isn’t on the list.”', html: 'Often it is there, but stored differently: a trailing space, a number stored as text, or a slightly different spelling. Test with LEN, ISTEXT and ISNUMBER, and fix the key. Only when the key really is missing should you flag it with if_not_found or IFNA.' },
    { title: '“Wrap it in IFERROR and the errors go away.”', html: 'They go away from view, not from the data. IFERROR replaces every error, including the #REF! of a broken formula, and a cost of 0 makes totals look complete when they aren’t. Use IFNA or if_not_found with a visible message, and count the rows that carry it.' },
    { title: '“Over $35 means the band starts at 35.”', html: 'An approximate match puts a value equal to a lower bound in that band, so a band starting at 35 includes $35.00. For “over $35” in whole cents the band starts at 35.01. Test every boundary with a value just below, exactly on and just above it.' },
    { title: '“A lookup returns every matching row.”', html: 'VLOOKUP, MATCH and XLOOKUP return one match: the first, unless XLOOKUP is told to search from the last. If the key column has duplicates, the others are ignored. Check the key column with COUNTIF before relying on it, or use FILTER (next lesson) when you really want every match.' },
  ],

  application: [
    { p: '<b>Kilnworth’s autumn prices.</b> When Kilnworth sends its autumn list, Ana pastes it over the spring one, and every cost in the order sheet updates at once. She adds “not on price list” as XLOOKUP’s not-found value, so a product Kilnworth has renamed or dropped shows up immediately instead of costing nothing. To see which costs rose, she keeps the spring list beside the new one and looks each product up in both, a side-by-side comparison that would take an hour to type by hand.' },
    { p: '<b>A hotel’s rate card.</b> Ridgeline Lodge, a fictional hotel, prices rooms by room type (rows) and season (columns). Its booking sheet finds each booking’s nightly rate with a two-way INDEX and MATCH, so the revenue manager can change one cell of the rate card and see every quote move. Because the reservations team uses an older version of Excel, the workbook avoids XLOOKUP.' },
    { p: '<b>Commission tiers.</b> A sales team paid 2% commission on monthly sales of up to $10,000, and 3% on all its sales in a month when they are above $10,000, uses a band table and an approximate match, not a nested IF. Before payroll, the analyst runs the boundary test ($9,999.99, $10,000.00 and $10,000.01) against the policy wording, because “above $10,000” and “from $10,000” differ by exactly the cent the test checks.' },
    { p: '<b>Matching payments to invoices.</b> A finance team looks up each bank payment’s invoice number in the invoice list with XLOOKUP and “unmatched” as the not-found value. The unmatched rows are the reconciliation’s to-do list: typos in references, payments covering two invoices, or money that belongs to someone else. This is B02’s referential-integrity check done with a lookup: every key in one table should point to a row in the other.' },
  ],

  summary: [
    'A lookup finds a lookup value in the key column of a lookup table and returns the value from the same row of a return column; fill it down with the table range locked by $.',
    'VLOOKUP needs FALSE for an exact match, can’t look left of its key, and breaks when a column is inserted; INDEX with MATCH (match_type 0) fixes both weaknesses and works in every version.',
    'XLOOKUP is exact by default, takes a not-found value, can search from the last item and can return several columns; it and XMATCH need Excel for Microsoft 365, 2021 or 2024.',
    'Approximate matching returns the result of the last band whose lower bound is not above the value; keep band tables sorted and test every boundary (“over $35” starts at 35.01).',
    '#N/A usually means a key stored differently (spaces, text versus number, spelling), not a missing one; diagnose with LEN, ISTEXT and ISNUMBER and fix the key.',
    'Handle genuine misses with IFNA or if_not_found and a visible message; IFERROR with 0 hides broken formulas and understates totals.',
    'Lookups return the first match only, so check key columns for duplicates with COUNTIF.',
  ],

  glossary: [
    { term: 'Lookup value', def: 'The value a lookup formula searches for, such as the product named in an order row.' },
    { term: 'Lookup table', def: 'A range holding the keys a lookup searches and the values it can return, such as a price list or a table of bands.' },
    { term: 'Exact match', def: 'A lookup that returns a result only when it finds a key equal to the lookup value, and #N/A when it doesn’t.' },
    { term: 'Approximate match', def: 'A lookup that, when no key equals the lookup value, returns the row of the largest key below it (or, in some modes, the smallest key above it); used with band tables sorted by their lower bounds.' },
    { term: 'Two-way lookup', def: 'A lookup that finds a value by its row label and its column label at once, for example with INDEX and two MATCH functions.' },
    { term: 'Spill', def: 'What a formula that returns several values does in Excel for Microsoft 365, Excel 2021 and Excel 2024: the results fill the neighbouring cells, the spill range, starting from the formula’s cell.' },
  ],

  references: [
    { text: 'Microsoft Support. <i>VLOOKUP function</i>.', url: 'https://support.microsoft.com/en-us/Excel/vlookup-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>XLOOKUP function</i>.', url: 'https://support.microsoft.com/excel/functions/xlookup-function', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>MATCH function</i>.', url: 'https://support.microsoft.com/en-au/office/match-function-e8dffd45-c762-47d6-bf89-533f4a37673a', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>XMATCH function</i>.', url: 'https://support.microsoft.com/en-us/office/xmatch-function-d966da31-7a6b-4a13-a1c6-5a33ed6a0312', checked: '2026-10-23' },
    { text: 'Microsoft Support. <i>How to correct a #N/A error</i>.', url: 'https://support.microsoft.com/en-us/excel/how-to-correct-a-n-a-error', checked: '2026-10-23' },
    { text: 'Microsoft Learn. <i>WorksheetFunction.VLookup method (Excel)</i>. Describes the worksheet function’s handling of duplicate keys and sorted data.', url: 'https://learn.microsoft.com/en-us/office/vba/api/excel.worksheetfunction.vlookup', checked: '2026-10-23' },
  ],

  checks: [
    // the idea
    { what: 'Products on the price list', value: PRODUCTS.length, shown: 11 },
    { what: 'Spring orders', value: D.orders, shown: 231 },
    { what: 'Gift Box Trio cost (LC-10001)', value: cost(order('LC-10001')[col('product')]), shown: 20 },
    { what: 'July charge below the threshold', value: DELIVERY_BANDS[0][1], shown: 4.95 },
    { what: 'Free band starts at', value: DELIVERY_BANDS[1][0], shown: 35.01 },
    { what: 'Free over (B01)', value: DELIVERY_BANDS[1][0] - 0.01, shown: 35 },
    // VLOOKUP column insertion
    { what: 'Gift Box Trio price returned after a column is inserted', value: price('Gift Box Trio'), shown: 58 },
    { what: 'unit_cost is the 5th column of H:L', value: PRODUCT_COLUMNS.indexOf('unit_cost') + 1, shown: 5 },
    // INDEX and MATCH
    { what: 'Cold Brew Pack position in H2:H12', value: pos('Cold Brew Pack'), shown: 10 },
    { what: 'Cold Brew Pack cost', value: cost('Cold Brew Pack'), shown: 8.5 },
    { what: 'May web orders', value: count('May', 'web'), shown: 23 },
    { what: 'Mar app orders', value: count('Mar', 'app'), shown: 23 },
    { what: 'Mar web orders', value: count('Mar', 'web'), shown: 36 },
    { what: 'Month × channel counts add to 231', value: ['Mar', 'Apr', 'May', 'Jun'].reduce((s, m) => s + count(m, 'app') + count(m, 'web'), 0), shown: 231 },
    // XLOOKUP
    { what: 'Pier Nine Studio events', value: pier.length, shown: 8 },
    { what: 'Pier Nine latest event is EV-068 (number)', value: Number(pier[pier.length - 1][0].slice(3)), shown: 68 },
    { what: 'Pier Nine latest event day (December)', value: Number(pier[pier.length - 1][1].slice(8, 10)), shown: 9 },
    { what: 'Pier Nine latest event month', value: Number(pier[pier.length - 1][1].slice(5, 7)), shown: 12 },
    { what: 'Pier Nine first event is EV-003', value: Number(pier[0][0].slice(3)), shown: 3 },
    { what: 'Events sheet last row (76 events + header)', value: EVENTS.length + 1, shown: 77 },
    // bands
    { what: 'Second size bound', value: SIZE_BANDS[1][0], shown: 20 },
    { what: 'Third size bound', value: SIZE_BANDS[2][0], shown: 40 },
    { what: 'Fourth size bound', value: SIZE_BANDS[3][0], shown: 100 },
    { what: '$35.00 pays', value: charge(35), shown: 4.95 },
    { what: '$35.01 is free', value: charge(35.01), shown: 0 },
    { what: '$34.99 pays', value: charge(34.99), shown: 4.95 },
    { what: 'A −12.60 refund has no band (0 = none)', value: charge(-12.6) === null ? 0 : 1, shown: 0 },
    // simple example
    { what: 'Simple: LC-10001 cost', value: fiveCost[0], shown: 40 },
    { what: 'Simple: LC-10002 cost', value: fiveCost[1], shown: 15.2 },
    { what: 'Simple: LC-10003 cost', value: fiveCost[2], shown: 8 },
    { what: 'Simple: LC-10004 cost', value: fiveCost[3], shown: 24 },
    { what: 'Simple: LC-10005 cost', value: fiveCost[4], shown: 52 },
    { what: 'Simple: total', value: fiveCost.reduce((s, x) => s + x, 0), shown: 139.2 },
    { what: 'Simple: House Blend 1kg cost', value: cost('House Blend 1kg'), shown: 26 },
    // challenging example
    { what: 'Challenging: LC-10003 total', value: sixTotals[0], shown: 14 },
    { what: 'Challenging: LC-10004 total', value: sixTotals[1], shown: 37 },
    { what: 'Challenging: LC-10015 total', value: sixTotals[2], shown: 34 },
    { what: 'Challenging: LC-10038 total', value: sixTotals[3], shown: 35.1 },
    { what: 'Challenging: LC-10001 total', value: sixTotals[4], shown: 111 },
    { what: 'Challenging: LC-10019 total', value: sixTotals[5], shown: 31 },
    { what: 'Challenging: orders that pay', value: sixTotals.filter((t) => charge(t) > 0).length, shown: 3 },
    { what: 'Challenging: charges paid', value: sixTotals.filter((t) => charge(t) > 0).length * DELIVERY_BANDS[0][1], shown: 14.85 },
    // applied example
    { what: 'Applied: parts found before the fix', value: PARTS.filter((p) => exact(p[0])).length, shown: 3 },
    { what: 'Applied: parts found after the fix', value: PARTS.filter((p) => cleaned(p[0])).length, shown: 5 },
    { what: 'Applied: cost with IFERROR(…,0)', value: costIf(exact), shown: 272.5 },
    { what: 'Applied: cost after the fix', value: costIf(cleaned), shown: 543.5 },
    { what: 'Applied: understatement', value: costIf(cleaned) - costIf(exact), shown: 271 },
    { what: 'Applied: LEN("10440 ")', value: '10440 '.length, shown: 6 },
  ],
};

