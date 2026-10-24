// ml-worker.js — runs the model comparison off the main thread so sliders stay responsive while forests grow.
// Only the newest request is worked on; older ones that queued up behind a long run are skipped.
import { compareModels } from './ml.js?v=12';

const cache = {};
let pending = null, scheduled = false;
self.onmessage = (e) => {
  pending = e.data;
  if (!scheduled) { scheduled = true; setTimeout(work, 0); }
};
function work() {
  scheduled = false;
  const req = pending; pending = null;
  if (!req) return;
  try { self.postMessage({ id: req.id, ...compareModels(cache, req) }); }
  catch (err) { self.postMessage({ id: req.id, error: String(err && err.message || err) }); }
}
