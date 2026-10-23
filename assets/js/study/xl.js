// xl.js — Excel formulas inside authored HTML (B03). Course text writes a formula as <x>=SUMIF(B2:B13,"<>Online",F2:F13)</x>;
// the formula is shown exactly as typed, in code type, so its <, > and & never act as HTML. Every place that puts
// authored HTML into the page passes it through xl() first; the static lesson builder does the same (tools/study/lib.mjs).
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const xl = (html) => String(html ?? '').replace(/<x>([\s\S]*?)<\/x>/g, (_, t) => `<code class="xl">${esc(t)}</code>`);
