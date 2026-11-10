// workbook-read.js — turns a spreadsheet file into plain rows, with SheetJS. A classic script (no imports) so the
// same code runs inside the Web Worker (importScripts) and in Node tests (require). It reads EVERY row of EVERY sheet:
// nothing is truncated, and the counts it returns (rows, cells, formulas, cached values, errors) let the page prove it.
// Macros are never run: SheetJS has no macro engine; the workbook's VBA part is only detected and reported.
//
// readWorkbook(XLSX, bytes, name, onProgress) -> {
//   name, format ('xls' | 'xlsx' | 'csv' | ...), bytes, hasMacros, sheets: [{
//     name, hidden, ref, nRows, nCols, rows: [[value, ...], ...]   (number | string | boolean | null; dates as 'YYYY-MM-DD')
//     cells, numbers, texts, dates, blanks, formulas, formulasNoCache, errors: [{ cell, code }], merges, sum (of numeric cells)
//   }], warnings: [text]
// }
(function (root) {
  'use strict';

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function detectFormat(name, bytes) {
    var ext = (/\.([a-z0-9]+)$/i.exec(name || '') || [])[1];
    ext = ext ? ext.toLowerCase() : '';
    if (bytes && bytes.length >= 8) {
      if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) return 'xls';         // OLE2 compound file (BIFF)
      if (bytes[0] === 0x50 && bytes[1] === 0x4B) return ext === 'xlsm' ? 'xlsm' : ext === 'xlsb' ? 'xlsb' : ext === 'ods' ? 'ods' : 'xlsx';   // ZIP container
    }
    if (ext === 'tsv' || ext === 'tab') return 'tsv';
    if (ext === 'csv' || ext === 'txt') return 'csv';
    return ext || 'unknown';
  }

  function readWorkbook(XLSX, bytes, name, onProgress) {
    var progress = onProgress || function () {};
    var u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    var format = detectFormat(name, u8);
    var warnings = [];
    progress({ stage: 'parse', done: 0, total: 1, text: 'Reading the file' });
    var opts = { type: 'array', dense: true, cellFormula: true, cellNF: true, cellDates: false, cellText: false, bookVBA: true };
    if (format === 'csv' || format === 'tsv') { opts.raw = true; opts.codepage = 65001; if (format === 'tsv') opts.FS = '\t'; }
    var wb = XLSX.read(u8, opts);
    var hasMacros = !!wb.vbaraw;
    if (hasMacros) warnings.push('This workbook contains macros (VBA). They were not run and are ignored; only cell values are read.');
    var date1904 = !!(wb.Workbook && wb.Workbook.WBProps && wb.Workbook.WBProps.date1904);
    var meta = (wb.Workbook && wb.Workbook.Sheets) || [];
    var sheets = [];
    var names = wb.SheetNames;
    for (var s = 0; s < names.length; s++) {
      var ws = wb.Sheets[names[s]];
      var out = { name: names[s], hidden: !!(meta[s] && meta[s].Hidden), ref: ws['!ref'] || '', nRows: 0, nCols: 0, rows: [], cells: 0, numbers: 0, texts: 0, dates: 0, blanks: 0, formulas: 0, formulasNoCache: 0, errors: [], merges: (ws['!merges'] || []).length, sum: 0, r0: 0, c0: 0 };
      if (ws['!type'] && ws['!type'] !== 'sheet') { out.kindHint = ws['!type']; sheets.push(out); continue; }
      var data = ws['!data'] || [];
      if (!ws['!ref']) { sheets.push(out); continue; }
      var range = XLSX.utils.decode_range(ws['!ref']);
      // Excel can declare a used range far larger than the data (formatted empty rows); find the true last row and column
      var lastR = -1, lastC = -1, r, c, row, cell;
      for (r = range.s.r; r <= range.e.r; r++) {
        row = data[r]; if (!row) continue;
        for (c = row.length - 1; c >= range.s.c; c--) { cell = row[c]; if (cell && cell.t !== 'z' && cell.v !== undefined && cell.v !== '') { if (c > lastC) lastC = c; lastR = r; break; } }
      }
      if (lastR < 0) { sheets.push(out); continue; }
      out.r0 = range.s.r; out.c0 = range.s.c;
      out.nRows = lastR - range.s.r + 1; out.nCols = lastC - range.s.c + 1;
      var rows = new Array(out.nRows);
      for (r = range.s.r; r <= lastR; r++) {
        row = data[r];
        var arr = new Array(out.nCols);
        for (c = range.s.c; c <= lastC; c++) {
          cell = row ? row[c] : undefined;
          var v = null;
          if (cell) {
            if (cell.f !== undefined) { out.formulas++; if (cell.v === undefined) out.formulasNoCache++; }
            if (cell.t === 'n') {
              if (cell.z && XLSX.SSF.is_date(cell.z)) {
                var d = XLSX.SSF.parse_date_code(cell.v, { date1904: date1904 });
                if (d && d.y > 1900 && d.y < 2200) { v = d.y + '-' + pad(d.m) + '-' + pad(d.d); out.dates++; }
                else { v = cell.v; out.numbers++; out.sum += cell.v; }
              } else { v = cell.v; out.numbers++; out.sum += cell.v; }
            } else if (cell.t === 's') { v = String(cell.v); if (v.trim() === '') v = null; else out.texts++; }
            else if (cell.t === 'b') { v = !!cell.v; out.texts++; }
            else if (cell.t === 'd') { var dd = cell.v; v = dd.getUTCFullYear() + '-' + pad(dd.getUTCMonth() + 1) + '-' + pad(dd.getUTCDate()); out.dates++; }
            else if (cell.t === 'e') { if (out.errors.length < 200) out.errors.push({ cell: XLSX.utils.encode_cell({ r: r, c: c }), code: cell.w || String(cell.v) }); out.errorCount = (out.errorCount || 0) + 1; }
          }
          if (v === null) out.blanks++; else out.cells++;
          arr[c - range.s.c] = v;
        }
        rows[r - range.s.r] = arr;
        if ((r & 2047) === 0) progress({ stage: 'sheet', sheet: names[s], done: r - range.s.r, total: out.nRows, text: 'Reading ' + names[s] });
      }
      out.rows = rows;
      out.errorCount = out.errorCount || 0;
      if (out.formulasNoCache) warnings.push('Sheet “' + names[s] + '”: ' + out.formulasNoCache + ' formula cell' + (out.formulasNoCache === 1 ? ' has' : 's have') + ' no stored result (the file was saved without calculating). Those cells are read as blank: open the file in Excel, let it recalculate, and save.');
      if (out.errorCount) warnings.push('Sheet “' + names[s] + '”: ' + out.errorCount + ' cell' + (out.errorCount === 1 ? ' holds' : 's hold') + ' an Excel error value (' + out.errors.slice(0, 3).map(function (e) { return e.cell + ' ' + e.code; }).join(', ') + (out.errorCount > 3 ? ', …' : '') + '); they are read as blank.');
      sheets.push(out);
      progress({ stage: 'sheet', sheet: names[s], done: out.nRows, total: out.nRows, text: 'Read ' + names[s] });
    }
    return { name: name || '', format: format, bytes: u8.length, hasMacros: hasMacros, date1904: date1904, sheets: sheets, warnings: warnings };
  }

  root.readWorkbook = readWorkbook;
  root.detectWorkbookFormat = detectFormat;
  if (typeof module !== 'undefined' && module.exports) module.exports = { readWorkbook: readWorkbook, detectFormat: detectFormat };
}(typeof self !== 'undefined' ? self : globalThis));
