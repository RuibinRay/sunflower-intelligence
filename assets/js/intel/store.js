// store.js — what Company Intelligence keeps in this browser (IndexedDB): saved analysis projects, and a file handed
// over from the homepage's "Analyze a company" drop zone. Nothing here leaves the device; it is a convenience store,
// not a secure or multi-device one, and every call degrades to "not available" if the browser blocks storage.
const DB = 'si-intel', VERSION = 1;

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('This browser has no local database.')); return; }
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' }); if (!db.objectStoreNames.contains('handoff')) db.createObjectStore('handoff', { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('The local database could not be opened.'));
  });
}
async function tx(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode), s = t.objectStore(store);
    let out; const req = fn(s);
    if (req) req.onsuccess = () => { out = req.result; };
    t.oncomplete = () => { db.close(); resolve(out); };
    t.onerror = () => { db.close(); reject(t.error); };
    t.onabort = () => { db.close(); reject(t.error || new Error('The save was cancelled.')); };
  });
}

/** Saved projects, newest first: [{ id, name, savedAt, years, rows }] (without the heavy parts). */
export async function listProjects() {
  try { const all = await tx('projects', 'readonly', (s) => s.getAll()); return (all || []).map(({ id, name, savedAt, summary }) => ({ id, name, savedAt, summary })).sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)); }
  catch { return []; }
}
export const loadProject = (id) => tx('projects', 'readonly', (s) => s.get(id));
export async function saveProject(record) {
  const rec = { ...record, id: record.id || `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, savedAt: new Date().toISOString() };
  await tx('projects', 'readwrite', (s) => s.put(rec));
  return rec.id;
}
export const deleteProject = (id) => tx('projects', 'readwrite', (s) => s.delete(id));

/** A file dropped on the homepage waits here until the Company Intelligence page picks it up. */
export const putPendingFile = (file) => file.arrayBuffer().then((buffer) => tx('handoff', 'readwrite', (s) => s.put({ id: 'pending', name: file.name, buffer, at: Date.now() })));
export async function takePendingFile() {
  try {
    const rec = await tx('handoff', 'readonly', (s) => s.get('pending'));
    if (!rec) return null;
    await tx('handoff', 'readwrite', (s) => s.delete('pending'));
    return Date.now() - rec.at < 10 * 60 * 1000 ? rec : null;
  } catch { return null; }
}
