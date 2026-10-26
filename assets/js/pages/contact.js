// contact.js — the letter: composes an email in the visitor's own mail app. Nothing is sent from the page.
import { initSite } from '../core/site.js?v=19';
import { $, copyText } from '../core/dom.js?v=19';

initSite();

const ADDRESS = 'ruibinjinyao@gmail.com';
const form = $('#letter'), msg = $('#msg'), email = $('#email'), name = $('#name'), status = $('#status');

name.addEventListener('input', () => { $('#sig').textContent = name.value.trim() || 'your name here'; });

function check() {
  let ok = true;
  const m = msg.value.trim();
  if (m.length < 10) { $('#msg-err').textContent = 'Write at least a sentence so I know what it’s about.'; msg.setAttribute('aria-invalid', 'true'); ok = false; }
  else { $('#msg-err').textContent = ''; msg.removeAttribute('aria-invalid'); }
  const e = email.value.trim();
  if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { $('#email-err').textContent = 'That email address looks incomplete, for example name@example.com.'; email.setAttribute('aria-invalid', 'true'); ok = false; }
  else { $('#email-err').textContent = ''; email.removeAttribute('aria-invalid'); }
  return ok;
}
msg.addEventListener('blur', () => { if (msg.value) check(); });
email.addEventListener('blur', () => { if (email.value) check(); });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!check()) { (msg.getAttribute('aria-invalid') ? msg : email).focus(); return; }
  const who = name.value.trim(), from = email.value.trim();
  const subject = `[Sunflower Intelligence] ${$('#topic').value}`;
  const body = `Dear Ray,\n\n${msg.value.trim()}\n\nWith thanks,\n${who || ''}${from ? `\n${from}` : ''}`;
  const href = `mailto:${ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (href.length > 1900) status.textContent = 'Your letter is long, and some email apps cut long letters short. If yours arrives incomplete, paste the full text into the email.';
  else status.textContent = `Your email app should open with the letter filled in. If nothing happens, copy my address and paste your letter into a new email to ${ADDRESS}.`;
  window.location.href = href;
});

$('#copy').addEventListener('click', async () => {
  const ok = await copyText(ADDRESS);
  status.textContent = ok ? `Copied ${ADDRESS} to your clipboard.` : `Copy didn’t work in this browser. The address is ${ADDRESS}.`;
});
