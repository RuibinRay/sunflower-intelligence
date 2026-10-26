// ledger.js — F01 widget: posting from the journal to the ledger.
// config: { type: 'ledger', transactions: ['m1', …] | [inline], show: ['taccounts', 'trial'], mode: 'watch' | 'balance' }
// The journal sits beside the T-accounts. "Post next entry" posts one entry, fills in its posting references and
// marks where each line lands; the trial balance updates. In balance mode the balances stay hidden until the
// student has worked each one out (after every entry is posted).
import { h } from '../../core/dom.js?v=17';
import { verdict } from '../../core/ui.js?v=17';
import * as U from '../labs/accounting-ui.js?v=17';

const { A } = U;

export async function mount(el, config = {}, ctx = {}) {
  U.ensureStyles();
  let ch, txs;
  try {
    ch = A.makeChart(config.chart || U.CHART);
    txs = U.resolveTransactions(config.transactions);
    if (!txs.length) throw new Error('The ledger needs at least one transaction.');
  } catch (e) { U.errorBox(el, e.message); return; }
  const show = Array.isArray(config.show) && config.show.length ? config.show : ['taccounts', 'trial'];
  const showT = show.includes('taccounts'), showTB = show.includes('trial');
  const balanceMode = config.mode === 'balance' && showT;
  const opening = config.opening || {};
  const report = (ev, d) => { try { ctx.report?.(ev, d); } catch { /* the page may not listen */ } };
  const accounts = ch.list.filter((a) => txs.some((t) => t.lines.some((l) => l.acct === a.name)) || opening[a.name]).map((a) => a.name);

  let posted = 0, justPosted = null;
  const revealed = new Set();
  let firstTry = null;                   // balance mode: how many were right at the first check
  const answers = {};                    // balance mode: what the student typed, kept across redraws
  const live = U.liveRegion();
  const root = h('div', { class: 'acc acc-lw' });
  el.replaceChildren(root, live);

  const allPosted = () => posted >= txs.length;
  const ledgerNow = () => A.post(txs.slice(0, posted), ch, opening);

  function balanceSlot(name, L) {
    const t = L[name] || U.blankAccount(name, ch);
    if (revealed.has(name)) return null;
    const amtId = U.uid('ba'), sideId = U.uid('bs');
    const a = answers[name] ||= { amount: '', side: '' };
    const inp = h('input', { class: 'input', id: amtId, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Balance of ${name}, in dollars` });
    inp.value = a.amount;
    inp.addEventListener('input', () => { a.amount = inp.value; });
    const sel = h('select', { class: 'select acc-side-select', id: sideId, 'aria-label': `Side of the ${name} balance` },
      h('option', { value: '' }, 'Side'), h('option', { value: 'dr' }, 'Debit'), h('option', { value: 'cr' }, 'Credit'));
    sel.value = a.side;
    sel.addEventListener('change', () => { a.side = sel.value; });
    return h('div', { class: `acc-bal-in${a.state ? ` is-${a.state}` : ''}` },
      h('span', { class: 'acc-mini', 'aria-hidden': 'true' }, 'Balance'),
      h('div', { class: 'affix' }, h('span', { class: 'affix-pre', 'aria-hidden': 'true' }, '$'), inp), sel,
      a.msg ? h('p', { class: 'acc-bal-msg' }, h('span', { 'aria-hidden': 'true' }, '✗ '), a.msg) : null,
      t.lines.length ? null : h('p', { class: 'acc-bal-msg' }, 'Nothing posted here.'));
  }

  function checkBalances(L) {
    let right = 0, wrongs = 0, blank = 0;
    for (const n of accounts) {
      if (revealed.has(n)) continue;
      const t = L[n] || U.blankAccount(n, ch);
      const a = answers[n] ||= { amount: '', side: '' };
      const v = U.parseAmount(a.amount);
      if (v == null) { blank++; a.state = ''; a.msg = ''; continue; }
      const want = Math.abs(t.balance);
      const wantSide = t.balance === 0 ? null : ((t.balance > 0) === (t.normal === 'dr') ? 'dr' : 'cr');
      const okAmt = Number.isFinite(v) && Math.round(v * 100) === Math.round(want * 100);
      const okSide = wantSide == null || a.side === wantSide;
      if (okAmt && okSide) { revealed.add(n); right++; a.msg = ''; continue; }
      wrongs++;
      a.state = 'wrong';
      a.msg = !okAmt
        ? `Not yet. Debits total ${U.usd(t.dr)} and credits ${U.usd(t.cr)}: the balance is the difference.`
        : `The amount is right, but the balance sits on the ${wantSide === 'dr' ? 'debit' : 'credit'} side, where the total is larger.`;
    }
    if (firstTry == null) firstTry = right;
    return { right, wrongs, blank };
  }

  function draw({ focus = null } = {}) {
    const L = ledgerNow();
    const nextId = allPosted() ? null : txs[posted].id;
    const postedIds = new Set(txs.slice(0, posted).map((t) => t.id));
    const status = h('p', { class: 'acc-lw-status' }, h('strong', {}, `${posted} of ${txs.length}`), ' entries posted');
    const postNext = h('button', { class: 'btn btn-primary', type: 'button', disabled: allPosted() }, allPosted() ? 'All entries posted' : `Post entry ${A.entryLabel(txs[posted])}`);
    const postAll = h('button', { class: 'btn btn-secondary', type: 'button', disabled: allPosted() }, 'Post all');
    const reset = h('button', { class: 'btn btn-ghost', type: 'button', disabled: posted === 0 }, 'Reset');
    postNext.addEventListener('click', () => {
      const t = txs[posted]; posted++; justPosted = t.id; draw({ focus: allPosted() ? 'after' : 'post' });
      U.say(live, `Posted entry ${A.entryLabel(t)}: ${t.lines.map((l) => `${l.acct} ${l.dr != null ? 'debit' : 'credit'} ${A.usd(l.dr ?? l.cr)}`).join(', ')}.`);
    });
    postAll.addEventListener('click', () => { posted = txs.length; justPosted = null; draw({ focus: 'after' }); U.say(live, 'Every entry is posted.'); });
    reset.addEventListener('click', () => { posted = 0; justPosted = null; revealed.clear(); firstTry = null; for (const k of Object.keys(answers)) delete answers[k]; draw({ focus: 'post' }); U.say(live, 'Back to the start: nothing posted.'); });
    const controls = h('div', { class: 'acc-actions acc-lw-controls' }, postNext, postAll, reset, status);

    const journal = h('section', { class: 'acc-lw-journal', 'aria-label': 'General journal' },
      h('h4', { class: 'acc-h' }, 'General journal'),
      U.journalTable(txs, { chart: ch, posted: postedIds, highlight: justPosted, next: nextId, memo: true }));
    const side = h('div', { class: 'acc-lw-books' });
    let balanceTools = null;
    if (showT) {
      const balancing = balanceMode && allPosted();
      const slots = balancing ? Object.fromEntries(accounts.map((n) => [n, balanceSlot(n, L)]).filter(([, v]) => v)) : null;
      side.append(h('section', { 'aria-label': 'Ledger' },
        h('h4', { class: 'acc-h' }, 'Ledger'),
        balanceMode ? h('p', { class: 'acc-note' }, allPosted() ? 'Work out each balance: add each side, take the difference, and put it on the larger side.' : 'Balances stay hidden in this exercise. Post every entry, then work out each account’s balance.') : null,
        U.tAccountsGrid(L, ch, { include: accounts, highlight: justPosted, hideBalance: balanceMode && !balancing, slots })));
      if (balancing && revealed.size < accounts.length) {
        const check = h('button', { class: 'btn btn-primary', type: 'button' }, 'Check balances');
        const reveal = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Show balances');
        check.addEventListener('click', () => {
          const r = checkBalances(L);
          const done = revealed.size === accounts.length;
          draw({ focus: done ? 'tb' : 'firstWrong' });
          U.say(live, done ? 'Every balance is right.' : `${r.right} right${r.wrongs ? `, ${r.wrongs} to fix` : ''}${r.blank ? `, ${r.blank} not answered` : ''}.`);
          if (done) report('done', { correct: firstTry, total: accounts.length });
        });
        reveal.addEventListener('click', () => { if (firstTry == null) firstTry = 0; accounts.forEach((n) => revealed.add(n)); draw({ focus: 'tb' }); U.say(live, 'All balances shown.'); report('done', { correct: firstTry, total: accounts.length }); });
        balanceTools = h('div', { class: 'acc-actions' }, check, reveal, h('span', { class: 'acc-note' }, `${revealed.size} of ${accounts.length} worked out`));
        side.append(balanceTools);
      }
      if (balanceMode && revealed.size === accounts.length && allPosted()) side.append(verdict('good', 'Every balance worked out.', firstTry != null ? `${firstTry} of ${accounts.length} were right at the first check.` : ''));
    }
    if (showTB) {
      const hidden = balanceMode && !(allPosted() && revealed.size === accounts.length);
      const touched = new Set(justPosted ? txs.find((t) => t.id === justPosted).lines.map((l) => l.acct) : []);
      side.append(h('section', { class: 'acc-lw-tb', 'aria-label': 'Trial balance' },
        h('h4', { class: 'acc-h', tabindex: '-1' }, 'Trial balance'),
        hidden ? h('p', { class: 'acc-empty' }, 'The trial balance appears once you’ve worked out every balance.') : U.trialBalanceTable(A.trialBalance(L, ch), { caption: `Trial balance after ${posted} ${posted === 1 ? 'entry' : 'entries'}`, highlight: touched })));
    }
    root.replaceChildren(controls, h('div', { class: `acc-lw-grid${showT || showTB ? '' : ' is-single'}` }, journal, side));
    if (focus === 'post') (root.querySelector('.acc-lw-controls .btn-primary:not([disabled])') || root.querySelector('.acc-lw-controls .btn')).focus();
    else if (focus === 'after') (root.querySelector('.acc-bal-in input') || root.querySelector('.acc-lw-tb .acc-h') || root.querySelector('.acc-lw-controls .btn-ghost')).focus();
    else if (focus === 'firstWrong') (root.querySelector('.acc-bal-in.is-wrong input') || root.querySelector('.acc-bal-in input'))?.focus();
    else if (focus === 'tb') (root.querySelector('.acc-lw-tb .acc-h') || root.querySelector('.acc-lw-controls .btn-ghost')).focus();
  }
  draw();
}
