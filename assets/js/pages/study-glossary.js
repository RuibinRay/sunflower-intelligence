// study-glossary.js — filter the glossary by words and by course; ?course=f01 preselects a course.
import { initSite } from '../core/site.js?v=19';
import { $, $$, debounce } from '../core/dom.js?v=19';

initSite();
const q = $('#g-search'), sel = $('#g-course'), count = $('#g-count'), empty = $('#g-empty');
const entries = $$('.g-entry'), groups = $$('.g-group'), letters = $$('.alpha a');
const pre = new URLSearchParams(location.search).get('course');
if (pre && [...sel.options].some((o) => o.value === pre)) sel.value = pre;
function apply() {
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const c = sel.value;
  let n = 0;
  entries.forEach((e) => {
    const show = (!c || e.dataset.course === c) && words.every((w) => e.dataset.text.includes(w));
    e.hidden = !show; if (show) n++;
  });
  groups.forEach((g) => { g.hidden = !g.querySelector('.g-entry:not([hidden])'); });
  letters.forEach((a) => { const g = document.getElementById(a.getAttribute('href').slice(1)); a.classList.toggle('is-empty', !!g?.hidden); a.setAttribute('aria-disabled', String(!!g?.hidden)); });
  count.textContent = `${n} term${n === 1 ? '' : 's'}`;
  empty.hidden = n > 0;
}
q.addEventListener('input', debounce(apply, 80));
sel.addEventListener('change', apply);
apply();
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
