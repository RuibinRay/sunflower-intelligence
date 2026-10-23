// study-school.js — a school page: progress on each ready course card, and progress marks on the suggested order.
import { initSite } from '../core/site.js?v=7';
import { $$, h } from '../core/dom.js?v=7';
import * as P from '../study/progress.js?v=7';
import { pct } from '../study/common.js?v=7';
import { MAP } from '../data/study/map.js?v=7';

initSite();
function paint() {
  $$('.cc-progress[data-progress]').forEach((el) => {
    const id = el.dataset.progress;
    if (!MAP[id]) return;
    const cs = P.courseStatus(id);
    if (!cs.started) { el.replaceChildren(); return; }
    el.replaceChildren(
      h('span', {}, cs.complete ? 'Course complete' : `${cs.done} of ${cs.total} lessons complete · mastery ${pct(cs.masteryAvg)}`),
      h('span', { class: 'cp-bar', 'aria-hidden': 'true' }, h('i', { style: { width: `${(cs.done / cs.total) * 100}%` } })));
    const btn = el.parentElement.querySelector('.btn');
    if (btn && !cs.complete) btn.textContent = 'Continue the course';
  });
  $$('.route li[data-course]').forEach((li) => {
    const id = li.dataset.course;
    if (!MAP[id]) return;
    const cs = P.courseStatus(id);
    const meta = li.querySelector('.rt-meta');
    if (cs.complete) meta.textContent = 'Complete';
    else if (cs.started) meta.textContent = `In progress · ${cs.done} of ${cs.total} lessons`;
  });
}
P.onChange(paint);
paint();
