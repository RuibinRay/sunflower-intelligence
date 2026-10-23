// study-playthrough.mjs — answers every exercise in every built lesson and assessment through the real pages, using
// the answer keys, and checks the page marks each one right (practice) or scores 100% (knowledge checks and tests).
// Needs the site served locally: node tests/study-playthrough.mjs http://127.0.0.1:8766/sunflower-intelligence/
// Optional filter: a course id or course/slug as the second argument. Projects are played too (items only; labs are
// tested by their own suites).
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://127.0.0.1:8766/sunflower-intelligence/';
const ONLY = process.argv[3] || '';
const ROOT = new URL('..', import.meta.url).pathname;
const { MAP } = await import(pathToFileURL(join(ROOT, 'assets/js/data/study/map.js')).href);

// in-page: put the keyed answer for one item into `box` (a card or a step), then return nothing
const ANSWER = (box, item) => {
  const strip = (s) => { const d = document.createElement('div'); d.innerHTML = String(s).replace(/<x>([\s\S]*?)<\/x>/g, (_, t) => `<code>${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code>`); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const body = box.querySelector(':scope > .ex-body') || box.querySelector('.ex-body');
  const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));
  const setVal = (el, v) => { el.value = v; fire(el, 'input'); fire(el, 'change'); };
  const opt = (text) => [...body.querySelectorAll('.option')].find((l) => strip(l.querySelector('.option-text').innerHTML) === strip(text));
  switch (item.type) {
    case 'mc': opt(item.options[item.answer]).querySelector('input').click(); break;
    case 'multi': item.answer.forEach((i) => opt(item.options[i]).querySelector('input').click()); break;
    case 'num': setVal(body.querySelector('input'), String(item.answer)); break;
    case 'fill': {
      const els = [...body.querySelectorAll('select, input')];
      item.blanks.forEach((b, i) => setVal(els[i], b.options ? String(b.answer) : b.accept[0]));
      break;
    }
    // rows are shown shuffled: each select's id ends in -c<data index>
    case 'classify': [...body.querySelectorAll('select')].forEach((s) => setVal(s, String(item.answer[+s.id.match(/-c(\d+)$/)[1]]))); break;
    case 'order': {
      for (let k = 0; k < item.items.length; k++) {
        for (let guard = 0; guard < 50; guard++) {
          const rows = [...body.querySelectorAll('.order-row')];
          const p = rows.findIndex((r) => +r.dataset.i === k);
          if (p <= k) break;
          rows[p].querySelector('.move-btn').click();
        }
      }
      break;
    }
    case 'journal': {
      const add = body.querySelector('.je-add');
      while (body.querySelectorAll('.je-line').length < item.lines.length) add.click();
      const lines = [...body.querySelectorAll('.je-line')];
      item.lines.forEach((l, i) => {
        const [sel, dr, cr] = lines[i].querySelectorAll('select, input');
        setVal(sel, l.acct);
        setVal(l.dr != null ? dr : cr, String(l.dr ?? l.cr));
      });
      break;
    }
    case 'equation': {
      const ins = [...body.querySelectorAll('input')];
      ['assets', 'liabilities', 'equity'].forEach((k, i) => setVal(ins[i], String(item.answer[k])));
      break;
    }
    case 'rows': item.answer.forEach((i) => body.querySelector(`input[type="checkbox"][value="${i}"]`).click()); break;
    case 'short': setVal(body.querySelector('textarea'), 'A written answer for the automated play-through, long enough to compare.'); break;
    case 'formula': setVal(body.querySelector('.sg-input'), item.answer); break;
    default: throw new Error(`no answerer for ${item.type}`);
  }
};

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
let checked = 0;
const fails = [];
const fail = (where, msg) => { fails.push(`${where}: ${msg}`); };

async function practiceSet(where, setSel, items) {
  for (const item of items) {
    const card = page.locator(`${setSel} #ex-${CSS_ESC(item.id)}`);
    if (!(await card.count())) { fail(where, `${item.id} card not found`); continue; }
    await card.scrollIntoViewIfNeeded();
    if (item.type === 'steps') {
      for (const [k, st] of item.steps.entries()) {
        const li = card.locator(`li.ex-step[data-step="${st.id}"]`);
        await li.evaluate(ANSWER, plain(st));
        await li.locator(':scope > .ex-actions button.btn-primary').click();
        const fb = await li.locator(':scope > .ex-feedback').innerText();
        checked++;
        if (st.type !== 'short' && !/^Right\./.test(fb.trim())) fail(where, `${st.id} (${st.type}) not marked right: ${fb.slice(0, 160).replace(/\s+/g, ' ')}`);
        void k;
      }
      const state = await card.locator('.ex-state').innerText();
      if (!/Right first time|Worked|Done/.test(state)) fail(where, `${item.id} steps finished with state “${state}”`);
    } else {
      await card.evaluate(ANSWER, plain(item));
      await card.locator(':scope > .ex-actions button.btn-primary').first().click();
      const state = (await card.locator('.ex-state').innerText()).trim();
      checked++;
      if (item.type === 'short' ? state !== 'Done' : state !== 'Right') {
        const fb = await card.locator(':scope > .ex-feedback').innerText().catch(() => '');
        fail(where, `${item.id} (${item.type}) state “${state}”: ${fb.slice(0, 160).replace(/\s+/g, ' ')}`);
      }
    }
  }
}
async function quiz(where, rootSel, items) {
  const root = page.locator(rootSel);
  await root.locator('form.ex-form').waitFor({ timeout: 15000 });
  for (const item of items) {
    const card = root.locator(`#q-${CSS_ESC(item.id)}`);
    if (item.type === 'steps') {
      for (const st of item.steps) await card.locator(`li.ex-step`).nth(item.steps.indexOf(st)).evaluate(ANSWER, plain(st));
    } else await card.evaluate(ANSWER, plain(item));
  }
  await root.locator('button[type="submit"]').click();
  const sub = root.locator('button[type="submit"]');
  if (await sub.count()) await sub.click();   // "Submit anyway" when only self-marked items are blank
  const big = (await root.locator('.score-big').innerText()).trim();
  checked += items.length;
  if (big !== '100%') {
    const wrong = await root.locator('.ex-card.is-wrong').evaluateAll((cs) => cs.map((c) => `${c.dataset.item}: ${c.querySelector('.ex-feedback')?.innerText.slice(0, 140).replace(/\s+/g, ' ')}`));
    fail(where, `scored ${big}; wrong: ${wrong.join(' | ')}`);
  }
}
const plain = (x) => JSON.parse(JSON.stringify(x));   // functions (check) can't cross into the page
const CSS_ESC = (s) => s.replace(/([^a-zA-Z0-9_-])/g, '\\$1');

for (const [cid, c] of Object.entries(MAP)) {
  if (ONLY && !ONLY.startsWith(cid)) continue;
  for (const l of c.lessons) {
    if (ONLY.includes('/') && ONLY !== `${cid}/${l.slug}`) continue;
    const where = `${cid}/${l.slug}`;
    errors.length = 0;
    await page.goto(`${BASE}${l.href}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    const X = await import(pathToFileURL(join(ROOT, `assets/js/data/study/${cid}/${l.slug}.ex.js`)).href);
    await page.locator('#set-guided .ex-card').first().waitFor({ timeout: 15000 });
    await practiceSet(where, '#set-guided', X.guided || []);
    await practiceSet(where, '#set-independent', X.independent || []);
    await quiz(where, '#set-check', X.check || []);
    const status = await page.locator('#lesson-status').innerText();
    if (!/Complete/.test(status)) fail(where, `lesson status after everything right: “${status}”`);
    if (errors.length) fail(where, errors.join(' | '));
    process.stdout.write('.');
  }
  // assessments
  const tests = [...c.modules.filter((m) => m.test).map((m) => [`assess-m${m.n}`, m.test.href]), c.diagnostic && ['assess-diagnostic', c.diagnostic.href], c.final && ['assess-final', c.final.href]].filter(Boolean);
  for (const [file, href] of tests) {
    if (ONLY.includes('/')) break;
    const where = `${cid}/${file}`;
    errors.length = 0;
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    const M = await import(pathToFileURL(join(ROOT, `assets/js/data/study/${cid}/${file}.js`)).href);
    await quiz(where, '#assess-root', M.items);
    if (errors.length) fail(where, errors.join(' | '));
    process.stdout.write('+');
  }
  // the project: every item answered from its key is marked right (or done, for writing); stages without a lab end done
  if (c.project && !ONLY.includes('/')) {
    const where = `${cid}/project`;
    errors.length = 0;
    await page.goto(`${BASE}${c.project.href}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    const P = (await import(pathToFileURL(join(ROOT, `assets/js/data/study/${cid}/project.js`)).href)).default;
    await page.locator('.project-stage').first().waitFor({ timeout: 15000 });
    for (const st of P.stages) {
      await practiceSet(where, `#stage-${CSS_ESC(st.id)}`, st.items || []);
      if (!st.tool) {
        const state = (await page.locator(`#stage-${CSS_ESC(st.id)} .stage-state`).innerText()).trim();
        if (state !== 'Stage done') fail(where, `stage ${st.id} ends “${state}”`);
      }
    }
    if (errors.length) fail(where, errors.join(' | '));
    process.stdout.write('*');
  }
}
await b.close();
console.log(`\n${checked} answers checked; ${fails.length} problem${fails.length === 1 ? '' : 's'}`);
fails.forEach((f) => console.log(`✗ ${f}`));
process.exit(fails.length ? 1 : 0);
