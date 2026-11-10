// workbook-worker.js — reads an uploaded spreadsheet off the main thread so the page never freezes.
// A classic worker: SheetJS and the reader are loaded with importScripts. The file's bytes arrive as a transferred
// ArrayBuffer and never leave the device. Messages out: { type: 'progress', ... } and { type: 'done', workbook } or
// { type: 'error', message }.
/* global importScripts, XLSX, readWorkbook */
importScripts('../../vendor/xlsx.full.min.js', './workbook-read.js');

self.onmessage = function (e) {
  var req = e.data || {};
  try {
    var t0 = Date.now(), last = 0;
    var wb = readWorkbook(XLSX, new Uint8Array(req.buffer), req.name, function (p) {
      var now = Date.now();
      if (now - last > 60 || p.done === p.total) { last = now; self.postMessage({ type: 'progress', id: req.id, stage: p.stage, sheet: p.sheet, done: p.done, total: p.total, text: p.text }); }
    });
    wb.ms = Date.now() - t0;
    self.postMessage({ type: 'done', id: req.id, workbook: wb });
  } catch (err) {
    self.postMessage({ type: 'error', id: req.id, message: String((err && err.message) || err) });
  }
};
