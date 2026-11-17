// video.js — the lesson video: a narrated, chaptered walk through the whole lesson, played in the page.
//
// The storyboard (assets/data/study/video/<course>/<slug>.json, built by tools/study/video.mjs) holds chapters of
// scenes; each scene has narration segments, and a segment may show one of the lesson's own elements (a paragraph's
// equation, a table, a formula's symbol, an example's step), cloned from the page onto the stage. Time is the only
// input: seek(t) draws the frame for t, so pausing, scrubbing, changing speed or reloading always shows the same
// picture. Captions are always available; the narrator is the browser's own speech synthesis, off until asked for,
// so nothing is downloaded and nothing leaves the device. Custom visuals for authored chapters live in VISUALS below.
import { h } from '../core/dom.js?v=36';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;
const words = (s) => (String(s || '').match(/[\p{L}\p{N}][\p{L}\p{N}’'.,-]*/gu) || []).length;
const clock = (t) => { const s = Math.max(0, Math.round(t)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } } };

/** Sentences for captions: a full stop only ends one when a space and a new sentence follow ("$9,238.45 invested" stays whole). */
export const sentencesOf = (s) => String(s || '').split(/(?<=[.!?][”"’)]?)\s+(?=[A-Z“"‘(\d$])/).filter(Boolean);

/** Text for the speech engine: symbols the voice would skip or misread, spelled out. */
export function speakable(s) {
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', 'ⁿ': 'n', 'ⁱ': 'i', 'ᵗ': 't', '⁻': 'minus ', '⁺': 'plus ' };
  const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₕ': 'h', 'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₚ': 'p', 'ₛ': 's', 'ₜ': 't', 'ᵢ': 'i', 'ⱼ': 'j', 'ᵣ': 'r', 'ᵤ': 'u', 'ᵥ': 'v' };
  return String(s || '')
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿⁱᵗ⁻⁺]+)/g, (m) => { const t = [...m].map((c) => SUP[c]).join(''); return t === '2' ? ' squared ' : t === '3' ? ' cubed ' : ` to the power ${t} `; })
    .replace(/\^\(([^)]*)\)/g, ' to the power $1 ').replace(/\^(\S)/g, ' to the power $1 ')
    .replace(/([₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₕₖₗₘₙₚₛₜᵢⱼᵣᵤᵥ]+)/g, (m) => ` ${[...m].map((c) => SUB[c]).join('')} `)
    .replace(/_\(([^)]*)\)/g, ' $1 ').replace(/_(\S)/g, ' $1 ')
    .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/(\S)\/(\S)/g, '$1 over $2').replace(/ = /g, ' equals ')
    .replace(/−/g, ' minus ').replace(/ \+ /g, ' plus ').replace(/±/g, ' plus or minus ').replace(/≈/g, ' approximately ')
    .replace(/ < /g, ' is less than ').replace(/ > /g, ' is greater than ').replace(/≤/g, ' at most ').replace(/≥/g, ' at least ').replace(/≠/g, ' is not equal to ').replace(/⇔/g, ', or equivalently, ')
    .replace(/√/g, ' the square root of ').replace(/Σ/g, ' the sum of ').replace(/x̄/g, 'x bar').replace(/·/g, ' times ')
    .replace(/\s+/g, ' ').trim();
}

/** Custom visuals an authored scene can ask for: draw(el, spec, step, k) must depend only on its arguments. */
export const VISUALS = {
  // A cash-flow timeline: `marks` are the dates; `values[k]` is where the amount stands at step k (period index and
  // value). The amount slides one period per step and its value is printed under it; `factor` labels each move.
  timeline(el, spec, step, k) {
    const n = spec.periods, W = 640, H = 210, x0 = 40, x1 = W - 40, X = (p) => x0 + ((x1 - x0) * p) / n;
    if (!el.firstChild) {
      el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="vid-timeline" aria-hidden="true"><line x1="${x0}" x2="${x1}" y1="120" y2="120" class="tl-axis"/>${spec.marks.map((m) => `<g transform="translate(${X(m.p)},120)"><line y1="-6" y2="6" class="tl-tick"/><text y="30" class="tl-date">${m.label}</text>${m.sub ? `<text y="48" class="tl-sub">${m.sub}</text>` : ''}</g>`).join('')}<g class="tl-trail"></g><g class="tl-coin"><circle r="9"/><text class="tl-val" y="-22"></text></g><text class="tl-factor" y="78"></text></svg>`;
    }
    const at = spec.values[Math.min(step, spec.values.length - 1)], from = spec.values[Math.max(0, Math.min(step, spec.values.length - 1) - 1)];
    const e = step === 0 ? 1 : ease(k);
    const p = from.p + (at.p - from.p) * e;
    const coin = el.querySelector('.tl-coin');
    coin.setAttribute('transform', `translate(${X(p)},120)`);
    coin.querySelector('.tl-val').textContent = e >= 1 ? at.label : from.label;
    coin.classList.toggle('is-final', !!at.final && e >= 1);
    el.querySelector('.tl-factor').setAttribute('x', X((from.p + at.p) / 2));
    el.querySelector('.tl-factor').textContent = step > 0 && at.p !== from.p ? (spec.factor || '') : '';
    el.querySelector('.tl-trail').innerHTML = spec.values.slice(0, Math.min(step, spec.values.length - 1)).map((v) => `<text x="${X(v.p)}" y="100" class="tl-ghost">${v.label}</text>`).join('');
  },
  // Bars that grow period by period: `series` (one or two, the second is the accent), `periods` labels, and
  // `upto[step]`, the last period shown at each step. New bars rise over the step; the last bar of each series
  // carries its value label (`labels[s][i]`).
  growth(el, spec, step, k) {
    const W = 640, H = 250, x0 = 56, x1 = W - 12, y0 = 210, top = 34, n = spec.periods.length, S = spec.series.length;
    const max = spec.max || Math.max(...spec.series.flatMap((s) => s.values));
    const slot = (x1 - x0) / n, bw = Math.min(26, (slot * 0.8) / S);
    if (!el.firstChild) {
      el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="vid-growth" aria-hidden="true"><line x1="${x0}" x2="${x1}" y1="${y0}" y2="${y0}" class="gr-axis"/>${spec.periods.map((p, i) => (spec.tick && i % spec.tick ? '' : `<text x="${x0 + slot * (i + 0.5)}" y="${y0 + 20}" class="gr-tick">${p}</text>`)).join('')}<g class="gr-bars"></g><g class="gr-key">${spec.series.map((s, j) => `<g transform="translate(${x0 + j * 250},12)"><rect width="14" height="14" class="gr-s${j}"/><text x="20" y="12">${s.name}</text></g>`).join('')}</g></svg>`;
    }
    const upto = spec.upto[Math.min(step, spec.upto.length - 1)], before = step > 0 ? spec.upto[Math.min(step, spec.upto.length - 1) - 1] : upto;
    const e = ease(k);
    let out = '';
    spec.series.forEach((s, j) => {
      for (let i = 0; i <= upto; i++) {
        const grow = i > before ? Math.min(1, Math.max(0, e * (upto - before + 1) - (i - before - 1))) : 1;
        const hgt = ((y0 - top) * s.values[i] * grow) / max;
        out += `<rect x="${(x0 + slot * i + (slot - bw * S) / 2 + j * bw).toFixed(1)}" y="${(y0 - hgt).toFixed(1)}" width="${bw.toFixed(1)}" height="${hgt.toFixed(1)}" class="gr-s${j}"/>`;
      }
      // the running value sits in the key, so labels never collide with the bars or the frame's edge
      el.querySelectorAll('.gr-key text')[j].textContent = `${s.name}: ${s.labels[e >= 1 || step === 0 ? upto : before]}`;
    });
    el.querySelector('.gr-bars').innerHTML = out;
  },
};

export async function mountVideo(panel, url, lesson) {
  const data = await (await fetch(url)).json();
  const P = data.pace;
  const segDur = (say) => { const w = words(say); return w ? Math.max(P.minSeg, w / P.wps) + P.pad : P.hold; };
  const LEAD = 0.7;
  // ---------------------------------------------------------------- the timeline: every scene and segment in seconds
  const scenes = [], segs = [];
  let t0 = 0;
  data.chapters.forEach((ch, ci) => ch.scenes.forEach((sc) => {
    const s = { ...sc, chapter: ci, start: t0, segs: [] };
    let t = t0 + LEAD;
    sc.segs.forEach((g, k) => { const d = segDur(g.say); const seg = { ...g, scene: scenes.length, k, start: t, dur: d }; s.segs.push(seg); segs.push(seg); t += d; });
    s.end = t; t0 = t; scenes.push(s);
  }));
  const DUR = t0;
  const chStart = data.chapters.map((_, ci) => scenes.find((s) => s.chapter === ci).start);

  // ---------------------------------------------------------------- the player's frame
  const stage = h('div', { class: 'vid-stage', role: 'img', 'aria-roledescription': 'video frame' });
  const caption = h('p', { class: 'vid-caption', 'aria-live': 'off' });
  const playBtn = h('button', { class: 'vid-btn vid-play', type: 'button', 'aria-label': 'Play' }, h('span', { class: 'vid-ico' }));
  const prevBtn = h('button', { class: 'vid-btn', type: 'button', 'aria-label': 'Previous chapter', title: 'Previous chapter' }, '⏮');
  const nextBtn = h('button', { class: 'vid-btn', type: 'button', 'aria-label': 'Next chapter', title: 'Next chapter' }, '⏭');
  const scrub = h('input', { class: 'vid-scrub', type: 'range', min: 0, max: DUR.toFixed(1), step: 0.1, value: 0, 'aria-label': 'Position in the video' });
  const time = h('span', { class: 'vid-time' }, `0:00 / ${clock(DUR)}`);
  const speed = h('select', { class: 'vid-speed', 'aria-label': 'Playback speed' }, ...[0.75, 1, 1.25, 1.5, 1.75].map((r) => h('option', { value: r, selected: r === 1 ? '' : null }, `${r}×`)));
  const voiceBtn = h('button', { class: 'vid-btn vid-voice', type: 'button', 'aria-pressed': 'false', title: 'Read aloud with this browser’s voice' }, 'Voice off');
  const ccBtn = h('button', { class: 'vid-btn', type: 'button', 'aria-pressed': 'true', title: 'Captions' }, 'CC');
  const trBtn = h('button', { class: 'vid-btn', type: 'button', 'aria-expanded': 'false' }, 'Transcript');
  const fsBtn = h('button', { class: 'vid-btn', type: 'button', 'aria-label': 'Full screen', title: 'Full screen' }, '⛶');
  const chapterList = h('ol', { class: 'vid-chapters' }, ...data.chapters.map((c, ci) => h('li', {}, h('button', { type: 'button', 'data-ch': ci }, h('span', { class: 'vid-ch-t' }, clock(chStart[ci])), ' ', c.title))));
  const transcript = h('div', { class: 'vid-transcript', hidden: '' }, ...data.chapters.map((c, ci) => h('section', {}, h('h4', {}, c.title), ...scenes.filter((s) => s.chapter === ci).flatMap((s) => s.segs.filter((g) => g.say).map((g) => h('p', {}, h('button', { type: 'button', class: 'vid-tr-t', 'data-t': g.start.toFixed(2) }, clock(g.start)), ' ', g.say))))));
  const frame = h('div', { class: 'vid-frame', tabindex: '0', 'aria-label': `Lesson video: ${data.title}. Space plays or pauses; the arrow keys move between steps.` }, stage, caption);
  const bar = h('div', { class: 'vid-bar' }, playBtn, prevBtn, nextBtn, scrub, time, speed, voiceBtn, ccBtn, trBtn, fsBtn);
  const voiceSel = h('select', { class: 'vid-voices', 'aria-label': 'Narrator voice', hidden: '' });
  const note = h('p', { class: 'vid-note' }, data.authored ? 'Narration written for this lesson, with the rest generated from the lesson text. ' : 'Generated from the lesson text: it narrates every part of the lesson in order. ', 'Captions are always on offer; the voice is your browser’s own and varies by device.');
  panel.replaceChildren(h('div', { class: 'vid-player' }, frame, bar, h('div', { class: 'vid-side' }, h('h3', {}, 'Chapters'), chapterList, voiceSel, note), transcript));

  // ---------------------------------------------------------------- drawing a frame
  let built = -1, cur = null;
  const clean = (n) => { n.removeAttribute('id'); n.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id')); n.querySelectorAll('[aria-labelledby]').forEach((x) => x.removeAttribute('aria-labelledby')); return n; };
  function cloneOf(sel) {
    const src = document.querySelector(sel);
    if (!src) return null;
    const node = clean(src.cloneNode(true));
    const parent = src.parentElement;
    if (parent && /^(UL|OL|DL)$/.test(parent.tagName)) {
      const box = clean(parent.cloneNode(false));
      if (parent.tagName === 'OL') box.setAttribute('start', String([...parent.children].indexOf(src) + 1));
      box.append(node); return box;
    }
    if (src.classList.contains('plate-steps')) return node;
    return node;
  }
  function build(i) {
    const s = scenes[i];
    const board = h('div', { class: 'vid-board' });
    // an authored scene may carry one custom visual, stepped on by its segments (segment k shows step g.step ?? k)
    const visual = s.visual && VISUALS[s.visual.kind] ? h('div', { class: `vid-visual vid-visual--${s.visual.kind}` }) : null;
    if (visual) board.append(visual);
    const items = s.segs.map((g) => (g.show ? cloneOf(g.show) : null));
    items.forEach((it) => { if (it) board.append(it); });
    const head = s.head ? h('p', { class: 'vid-head' }, s.head) : null;
    const sub = s.sub ? h('p', { class: 'vid-sub' }, s.sub) : null;
    const kicker = h('p', { class: 'vid-kicker' }, s.kicker || data.chapters[s.chapter].title);
    const terms = s.terms?.length ? h('p', { class: 'vid-terms' }, ...s.terms.map((t) => h('span', {}, t))) : null;
    const cta = s.cta ? h('a', { class: 'vid-cta', href: s.cta.href }, s.cta.label) : null;
    stage.className = `vid-stage vid-scene--${s.kind}${board.childElementCount ? '' : ' is-type'}`;
    if (!board.childElementCount) board.hidden = true;
    stage.replaceChildren(h('div', { class: 'vid-top' }, kicker, head, sub, terms), board, cta || '');
    cur = { s, items, board, head, terms, visual, sub };
    built = i;
  }
  function seek(t) {
    t = Math.min(Math.max(0, t), DUR - 0.001);
    let i = scenes.findIndex((s) => t < s.end); if (i < 0) i = scenes.length - 1;
    if (i !== built) build(i);
    const { s, items, board, head, terms, visual, sub } = cur;
    const lt = t - s.start, still = reduce();
    const fade = (el, x, dy = 10) => { if (!el) return; const e = ease(x); el.style.opacity = String(e); el.style.transform = still ? '' : `translateY(${((1 - e) * dy).toFixed(2)}px)`; };
    fade(head, lt / 0.6, 14); fade(sub, (lt - 0.4) / 0.6); fade(terms, (lt - 0.3) / 0.6);
    let active = 0;
    s.segs.forEach((g, k) => { if (t >= g.start) active = k; });
    if (visual) {
      const g = s.segs[active], on = t >= g.start;
      VISUALS[s.visual.kind](visual, s.visual, on ? g.step ?? active : 0, on ? Math.min(1, (t - g.start) / Math.min(1.6, g.dur * 0.6)) : 1);
      fade(visual, lt / 0.6);
    }
    items.forEach((it, k) => {
      if (!it) return;
      const g = s.segs[k], x = (t - g.start) / 0.55;
      fade(it, x);
      it.classList.toggle('is-current', k === active && t >= g.start);
      it.classList.toggle('is-past', k < active);
    });
    const live = items[active];
    if (live && board.scrollHeight > board.clientHeight) board.scrollTop = Math.max(0, live.offsetTop - board.offsetTop - board.clientHeight * 0.25);
    // the caption: the sentence the narrator is on, found from the share of the segment's words already spoken
    const g = s.segs[active];
    if (t >= g.start && g.say) {
      const sentences = sentencesOf(g.say);
      const share = spoken.seg === g ? spoken.share : Math.min(1, (t - g.start) / (g.dur - P.pad));
      const total = words(g.say); let acc = 0, pick = sentences[0];
      for (const x of sentences) { pick = x; acc += words(x); if (acc / total >= share - 1e-9) break; }
      caption.textContent = pick.trim();
    } else caption.textContent = '';
    scrub.value = t.toFixed(1);
    time.textContent = `${clock(t)} / ${clock(DUR)}`;
    chapterList.querySelectorAll('button').forEach((b) => b.toggleAttribute('aria-current', +b.dataset.ch === s.chapter));
    now = t;
  }

  // ---------------------------------------------------------------- playback, with or without the voice
  let now = 0, held = 0, playing = false, last = 0, rate = 1, raf = 0, voice = false, spoken = { seg: null, share: 0, done: true };
  const key = `si:video:${lesson}`;
  const synth = 'speechSynthesis' in window ? speechSynthesis : null;
  if (!synth) voiceBtn.hidden = true;
  const segAt = (t) => segs.find((g) => t >= g.start && t < g.start + g.dur);
  function speak(g) {
    synth.cancel();
    spoken = { seg: g, share: 0, done: !g.say };
    if (!g.say) return;
    const u = new SpeechSynthesisUtterance(speakable(g.say));
    const v = synth.getVoices().find((x) => x.name === voiceSel.value); if (v) u.voice = v;
    u.lang = v?.lang || 'en-GB'; u.rate = rate;
    const len = u.text.length;
    u.onboundary = (e) => { if (spoken.seg === g) spoken.share = Math.min(1, e.charIndex / len); };
    u.onend = () => { if (spoken.seg === g) { spoken.done = true; spoken.share = 1; } };
    u.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      // the engine refused (no voice, blocked audio): carry on with captions only, and say so
      voice = false; voiceBtn.setAttribute('aria-pressed', 'false'); voiceBtn.textContent = 'Voice off'; voiceSel.hidden = true;
      note.textContent = `This browser could not read the narration aloud (${e.error || 'no voice available'}). Captions carry on.`;
      spoken = { seg: null, share: 0, done: true };
    };
    synth.speak(u);
  }
  function tick(ts) {
    if (!playing) return;
    const dt = Math.min(0.25, (ts - last) / 1000); last = ts;
    let t = now + dt * rate;
    if (voice) {
      const g = segAt(now);
      if (g && spoken.seg !== g) { t = Math.min(t, g.start + 0.05); speak(g); }   // the voice reads whole segments: start each from its beginning
      if (g && !spoken.done && t > g.start + g.dur - P.pad) {                                        // wait for the voice,
        held = held || ts;                                                                            // but not for ever:
        if (ts - held > (g.dur / rate) * 1000 + 4000) { spoken.done = true; held = 0; }               // some engines never end
        t = g.start + g.dur - P.pad;
      } else held = 0;
      if (g && spoken.done && spoken.seg === g && t < g.start + g.dur - P.pad) t = g.start + g.dur - P.pad;        // the voice finished early
    }
    if (t >= DUR - 0.001) { seek(DUR - 0.001); pause(); store.set(key, 0); return; }
    seek(t);
    if (Math.floor(t / 2) !== Math.floor((t - dt * rate) / 2)) store.set(key, t);
    raf = requestAnimationFrame(tick);
  }
  function play() { if (playing) return; playing = true; playBtn.setAttribute('aria-label', 'Pause'); playBtn.classList.add('is-playing'); last = performance.now(); spoken = { seg: null, share: 0, done: true }; raf = requestAnimationFrame(tick); }
  function pause() { playing = false; cancelAnimationFrame(raf); playBtn.setAttribute('aria-label', 'Play'); playBtn.classList.remove('is-playing'); synth?.cancel(); spoken = { seg: null, share: 0, done: true }; store.set(key, now); }
  const jump = (t) => { const was = playing; if (was) pause(); seek(t); if (was) play(); };

  playBtn.addEventListener('click', () => (playing ? pause() : play()));
  prevBtn.addEventListener('click', () => { const ci = scenes[built].chapter; jump(now - chStart[ci] > 2 || ci === 0 ? chStart[ci] : chStart[ci - 1]); });
  nextBtn.addEventListener('click', () => { const ci = scenes[built].chapter; if (ci + 1 < chStart.length) jump(chStart[ci + 1]); });
  scrub.addEventListener('input', () => jump(+scrub.value));
  speed.addEventListener('change', () => { rate = +speed.value; if (voice && playing) spoken = { seg: null, share: 0, done: true }; });
  chapterList.addEventListener('click', (e) => { const b = e.target.closest('button[data-ch]'); if (b) { jump(chStart[+b.dataset.ch]); frame.focus(); } });
  transcript.addEventListener('click', (e) => { const b = e.target.closest('button[data-t]'); if (b) { jump(+b.dataset.t); frame.scrollIntoView({ block: 'nearest' }); } });
  ccBtn.addEventListener('click', () => { const on = ccBtn.getAttribute('aria-pressed') !== 'true'; ccBtn.setAttribute('aria-pressed', String(on)); caption.hidden = !on; });
  trBtn.addEventListener('click', () => { const on = transcript.hidden; transcript.hidden = !on; trBtn.setAttribute('aria-expanded', String(on)); });
  fsBtn.addEventListener('click', () => { const el = panel.querySelector('.vid-player'); if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.(); });
  const fillVoices = () => {
    const vs = synth.getVoices().filter((v) => /^en/i.test(v.lang));
    const rank = (v) => (/natural|neural|premium|enhanced/i.test(v.name) ? 0 : /google|daniel|samantha|serena|karen|moira/i.test(v.name) ? 1 : 2);
    vs.sort((a, b) => rank(a) - rank(b));
    voiceSel.replaceChildren(...vs.map((v) => h('option', { value: v.name }, `${v.name} (${v.lang})`)));
  };
  voiceBtn.addEventListener('click', () => {
    voice = !voice; voiceBtn.setAttribute('aria-pressed', String(voice)); voiceBtn.textContent = voice ? 'Voice on' : 'Voice off';
    voiceSel.hidden = !voice;
    if (voice && !voiceSel.options.length) fillVoices();
    if (!voice) synth.cancel();
    spoken = { seg: null, share: 0, done: true };
  });
  synth?.addEventListener?.('voiceschanged', () => { if (voice) fillVoices(); });
  voiceSel.addEventListener('change', () => { spoken = { seg: null, share: 0, done: true }; });
  frame.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); const k = segs.findIndex((g) => g.start > now + 0.01); if (k >= 0) jump(segs[k].start); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); const back = segs.filter((g) => g.start < now - 0.6); jump(back.length ? back[back.length - 1].start : 0); }
  });
  stage.addEventListener('click', (e) => { if (!e.target.closest('a')) playing ? pause() : play(); });
  addEventListener('pagehide', () => { synth?.cancel(); store.set(key, now); });

  const resume = +(store.get(key) || 0);
  seek(resume > 0 && resume < DUR - 1 ? resume : 0);
  window.__lessonVideo = { DUR, seek, scenes, chapters: data.chapters, play, pause };
  return window.__lessonVideo;
}
