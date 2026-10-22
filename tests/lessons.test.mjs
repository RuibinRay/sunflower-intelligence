// Run: node tests/lessons.test.mjs   (every lesson: shape, worked-example numbers, calculator at its defaults and extremes)
import { ORDER } from '../assets/js/data/lessons/index.js';
import { SKILLS, ITEMS } from '../assets/js/data/learn-items.js';
import { existsSync, readFileSync } from 'node:fs';

let fails = 0, checks = 0, missing = [];
const ok = (label, cond, detail = '') => { checks++; if (!cond) { fails++; console.log(`FAIL ${label}${detail ? `: ${detail}` : ''}`); } };
const root = new URL('../', import.meta.url);
const strip = (html) => String(html).replace(/<[^>]+>/g, '');
const words = (l) => [...l.idea, l.formula.note || '', l.example.setup, ...l.example.steps, l.example.result, l.mistake.html, ...l.remember].map(strip).join(' ').split(/\s+/).filter(Boolean).length;

for (const id of ORDER) {
  const file = new URL(`../assets/js/data/lessons/${id}.js`, import.meta.url);
  if (!existsSync(file)) { missing.push(id); continue; }
  const L = (await import(file)).default;
  ok(`${id}: id matches`, L.id === id);
  ok(`${id}: is a Learn skill`, SKILLS.some((s) => s.id === id));
  ok(`${id}: has questions to check yourself`, ITEMS.filter((it) => it.skill === id).length >= 3);
  for (const k of ['title', 'hook']) ok(`${id}: ${k}`, typeof L[k] === 'string' && L[k].length > 10);
  ok(`${id}: minutes`, Number.isInteger(L.minutes) && L.minutes >= 3 && L.minutes <= 12);
  ok(`${id}: 2–3 idea paragraphs`, Array.isArray(L.idea) && L.idea.length >= 2 && L.idea.length <= 3);
  ok(`${id}: formula and terms`, L.formula && L.formula.html && Array.isArray(L.formula.terms) && L.formula.terms.length >= 2);
  ok(`${id}: worked example with 3–6 steps`, L.example && L.example.setup && Array.isArray(L.example.steps) && L.example.steps.length >= 3 && L.example.steps.length <= 6 && L.example.result);
  ok(`${id}: a common mistake`, L.mistake && L.mistake.title && L.mistake.html);
  ok(`${id}: three things to remember`, Array.isArray(L.remember) && L.remember.length === 3);
  const w = words(L); ok(`${id}: length`, w >= 250 && w <= 700, `${w} words`);
  // the tool link points at a real page and section
  const [path, frag] = L.tool.href.split('#');
  const html = existsSync(new URL(`${path}index.html`, root)) ? readFileSync(new URL(`${path}index.html`, root), 'utf8') : '';
  ok(`${id}: tool link ${L.tool.href}`, html && (!frag || html.includes(`id="${frag}"`)));
  // every number printed in the worked example is reproduced
  ok(`${id}: has checks`, Array.isArray(L.checks) && L.checks.length >= 4);
  for (const c of L.checks || []) ok(`${id}: ${c.what}`, Number.isFinite(c.value) && Math.abs(c.value - c.shown) <= c.tol, `computed ${c.value}, shown ${c.shown}`);
  // the calculator works at its defaults and at every input's extremes
  const ins = L.calc.inputs, base = Object.fromEntries(ins.map((i) => [i.id, i.value]));
  ok(`${id}: 2–5 calculator inputs`, ins.length >= 2 && ins.length <= 5);
  ins.forEach((i) => ok(`${id}: input ${i.id} in range`, i.min <= i.value && i.value <= i.max && i.step > 0 && ['pct', 'money', 'num', 'int'].includes(i.fmt)));
  const run = (v, label) => {
    let r; try { r = L.calc.compute({ ...v }); } catch (e) { ok(`${id}: calculator ${label}`, false, e.message); return; }
    ok(`${id}: calculator ${label}`, r && (r.error ? typeof r.error === 'string' : (r.headline && r.headline.value && !/NaN|Infinity|undefined/.test(JSON.stringify(r)) && Array.isArray(r.rows))), JSON.stringify(r).slice(0, 160));
  };
  run(base, 'defaults');
  ok(`${id}: defaults give an answer, not an error`, !L.calc.compute({ ...base }).error);
  ins.forEach((i) => { run({ ...base, [i.id]: i.min }, `${i.id} at min`); run({ ...base, [i.id]: i.max }, `${i.id} at max`); });
}
if (missing.length) console.log(`not written yet: ${missing.join(', ')}`);
console.log(fails ? `${fails} of ${checks} checks failed` : `all ${checks} checks passed`);
process.exit(fails ? 1 : 0);
