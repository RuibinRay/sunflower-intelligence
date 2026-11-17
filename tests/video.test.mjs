// video.test.mjs — the lesson videos: every finance lesson has a storyboard, the stored one matches the lesson
// (so a lesson edit without a rebuild fails here), the narration covers every part of the lesson, no raw TeX or
// HTML reaches the narrator, and every number in an authored script is recomputed by its checks.
// Run: node tests/video.test.mjs   (rebuild storyboards with: node tools/study.mjs)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../tools/study/lib.mjs';
import { loadAll } from '../tools/study/course.mjs';
import { storyboard, authoredFor, texText, plain } from '../tools/study/video.mjs';

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.error(`✗ ${what}`); } };
const norm = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// ---------------------------------------------------------------- the TeX reader
for (const [src, want] of [
  [String.raw`\text{PV} = \frac{\text{FV}}{(1 + r)^n}`, 'PV = FV/(1 + r)ⁿ'],
  [String.raw`10{,}000 \times 0.923845 = 9{,}238.45`, '10,000 × 0.923845 = 9,238.45'],
  [String.raw`\text{DF}_{12} = 1 \div 1.025^{12}`, 'DF₁₂ = 1 ÷ 1.025¹²'],
  [String.raw`8\% \div 4 = 2\%`, '8% ÷ 4 = 2%'],
  [String.raw`k_e = r_f + \beta(E[R_m]-r_f)`, 'kₑ = r_f + β(E[Rₘ] − r_f)'],
]) ok(texText(src) === want, `texText(${src}) gave "${texText(src)}", expected "${want}"`);
ok(plain('Use <m>r = \\text{APR} \\div m</m> and <g>future value</g>.') === 'Use r = APR ÷ m and future value.', 'plain() turns inline maths and glossary tags into text');

// ---------------------------------------------------------------- every finance lesson
const courses = (await loadAll()).filter((c) => c.school === 'finance');
let lessons = 0;
for (const c of courses) {
  for (const l of c.lessons) {
    lessons++;
    const key = `${c.id}/${l.slug}`;
    const authored = await authoredFor(c.id, l.slug);
    const fresh = storyboard(c, l, authored);
    const file = join(ROOT, `assets/data/study/video/${c.id}/${l.slug}.json`);
    ok(existsSync(file), `${key}: storyboard file exists`);
    if (existsSync(file)) ok(readFileSync(file, 'utf8') === JSON.stringify(fresh), `${key}: stored storyboard is up to date (run node tools/study.mjs)`);

    const segs = fresh.chapters.flatMap((ch) => ch.scenes.flatMap((s) => s.segs));
    const said = norm(segs.map((g) => g.say).join(' '));
    const shown = new Set(segs.map((g) => g.show).filter(Boolean));
    const has = (text, what) => ok(said.includes(norm(text)), `${key}: narration includes ${what}`);

    // parts replaced by an authored chapter must have every number in them said
    const replaced = new Set((authored?.chapters || []).flatMap((ch) => ch.covers || []));
    const partText = (field, list) => (list || []).forEach((b, i) => {
      const where = `${field}[${i}]`;
      const text = b.p ?? b.case ?? (b.callout ? `${b.title ? `${b.title}. ` : ''}${b.html}` : null);
      if (text != null) {
        if (replaced.has(where)) for (const n of plain(text).match(/\d[\d,.]*\d|\d/g) || []) ok(said.includes(norm(n)), `${key}: authored chapter replacing ${where} says ${n}`);
        else has(plain(text), `${where} in full`);
      }
      for (const x of b.list || b.ol || []) has(plain(x), `a list item in ${where}`);
      for (const [t, d] of b.define || []) has(`${plain(t)}. ${plain(d)}`, `the definition of ${plain(t)} in ${where}`);
      if (b.math || b.table || b.figure || b.statement || b.journal || b.taccounts) {
        const part = { concept: 'idea', theory: 'depth', application: 'practice' }[field];
        ok(replaced.has(where) || shown.has(`#${part} [data-vb="${i}"]`), `${key}: ${where} (${Object.keys(b)[0]}) is shown on the stage`);
      }
    });
    partText('concept', l.L.concept); partText('theory', l.L.theory); partText('application', l.L.application);
    l.L.objectives.forEach((o, k) => has(plain(o), `objective ${k + 1}`));
    (l.L.formulas || []).forEach((f) => { ok(shown.has(`#f-${f.id} .math-block`), `${key}: formula ${f.id} is shown`); (f.where || []).forEach(([, m]) => has(plain(m), `the meaning of a symbol in ${f.id}`)); });
    l.L.examples.forEach((e, i) => { has(plain(e.setup), `example ${i + 1}'s setup`); e.steps.forEach((st, k) => has(plain(st), `example ${i + 1}, step ${k + 1}`)); has(plain(e.answer), `example ${i + 1}'s answer`); has(plain(e.interpretation), `example ${i + 1}'s interpretation`); });
    l.L.mistakes.forEach((m) => has(`${plain(m.title)}. ${plain(m.html)}`, `the mistake "${plain(m.title)}"`));
    l.L.summary.forEach((x, k) => has(plain(x), `summary point ${k + 1}`));
    (l.L.demo || []).forEach((d) => ok(fresh.chapters.some((ch) => ch.scenes.some((s) => s.cta?.href === `#w-${d.widget}`)), `${key}: the interactive ${d.widget} has a scene`));

    for (const g of segs) ok(!/[\\{}]|<\/?[a-zA-Z]/.test(g.say.replace(/=[A-Z]+\([^)]*\)/g, '')), `${key}: no raw TeX or HTML in "${g.say.slice(0, 70)}…"`);
    ok(fresh.seconds > 60, `${key}: the video has a length`);
    for (const ch of authored?.checks || []) ok(Math.abs(ch.value - ch.shown) <= (ch.tol ?? 0.005) + 1e-9, `${key}.video.js check "${ch.what}": ${ch.value} vs shown ${ch.shown}`);
  }
}
ok(lessons >= 71, `at least 71 finance lessons have videos (found ${lessons})`);
console.log(fail ? `${fail} failed, ${pass} passed` : `${pass}/${pass} video checks passed (${lessons} lessons)`);
process.exit(fail ? 1 : 0);
