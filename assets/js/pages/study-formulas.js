// study-formulas.js — filter the formula library by words and, with ?course=f01, by course.
import { initSite } from '../core/site.js?v=20';
import { $, $$, debounce } from '../core/dom.js?v=20';
import { scrollersFocusable } from '../study/common.js?v=20';

initSite();
scrollersFocusable();
const q = $('#f-search'), count = $('#f-count'), empty = $('#f-empty');
const cards = $$('.formula-card[data-text]'), lessons = $$('.fl-lesson'), courses = $$('.fl-course');
const only = new URLSearchParams(location.search).get('course');
function apply() {
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let n = 0;
  cards.forEach((c) => { const show = (!only || c.dataset.course === only) && words.every((w) => c.dataset.text.includes(w)); c.hidden = !show; if (show) n++; });
  lessons.forEach((l) => { l.hidden = !l.querySelector('.formula-card:not([hidden])'); });
  courses.forEach((c) => { c.hidden = !c.querySelector('.formula-card:not([hidden])'); });
  count.textContent = `${n} formula${n === 1 ? '' : 's'}${only ? ' in this course' : ''}`;
  empty.hidden = n > 0;
}
q.addEventListener('input', debounce(apply, 80));
apply();
if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) { t.classList.add('is-target'); t.scrollIntoView(); } }
