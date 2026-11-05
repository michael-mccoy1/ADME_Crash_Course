"use strict";
/* Shared interaction layer: pointer coordinates, hover and drag on canvases, a plot with inverse mapping,
   pinned scenarios, PNG and CSV export, and parameter state in the URL hash. */
var IX = {};

/* position of a pointer event in the logical pixel space of a canvas prepared by cv() */
IX.pos = function(el, ev){ var rc = el.getBoundingClientRect(); return { x: (ev.clientX - rc.left) * el._w / rc.width, y: (ev.clientY - rc.top) * el._h / rc.height }; };

/* h.move(p), h.leave(), h.down(p) -> drag descriptor or falsy, h.drag(d, p), h.up(d, p) */
IX.attach = function(el, h){
  var drag = null; el.style.touchAction = 'none';
  el.addEventListener('pointermove', function(ev){ var p = IX.pos(el, ev); if (drag) { if (h.drag) h.drag(drag, p, ev); } else if (h.move) h.move(p, ev); });
  el.addEventListener('pointerdown', function(ev){ var p = IX.pos(el, ev), d = h.down ? h.down(p, ev) : null; if (d) { drag = d; try { el.setPointerCapture(ev.pointerId); } catch (e) {} ev.preventDefault(); } else if (h.click) h.click(p, ev); });
  function end(ev){ if (drag) { var d = drag; drag = null; if (h.up) h.up(d, IX.pos(el, ev), ev); } }
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', function(ev){ if (!drag && h.leave) h.leave(ev); });
};

/* A line plot with linear or logarithmic x, pinned series and inverse mapping.
   o: { xr, yr, xlog, xl, yl, series: [{ fn | pts, color, w, dash, label }], pinned: [same], xticks, hlines: [{ y, t, c }] }
   Returns { g, x, box, sx, sy, ix, iy } */
IX.chart = function(el, o){
  var g = cv(el), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 };
  var xl = o.xlog ? Math.log10(o.xr[0]) : o.xr[0], xh = o.xlog ? Math.log10(o.xr[1]) : o.xr[1];
  function sx(v){ var t = o.xlog ? Math.log10(Math.max(v, o.xr[0] * 1e-6)) : v; return box.l + (t - xl) / (xh - xl) * (box.r - box.l); }
  function sy(v){ return box.b - (v - o.yr[0]) / (o.yr[1] - o.yr[0]) * (box.b - box.t); }
  function ix(px){ var t = xl + (px - box.l) / (box.r - box.l) * (xh - xl); return o.xlog ? Math.pow(10, t) : t; }
  function iy(py){ return o.yr[0] + (box.b - py) / (box.b - box.t) * (o.yr[1] - o.yr[0]); }
  x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", system-ui, sans-serif';
  var yt = niceTicks(o.yr[0], o.yr[1], 5); x.textAlign = 'right';
  yt.v.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 6, sy(v) + 4); });
  var xt = o.xticks || (o.xlog ? (function(){ var a = [], e; for (e = Math.ceil(xl); e <= Math.floor(xh); e++) a.push(Math.pow(10, e)); return a; })() : niceTicks(o.xr[0], o.xr[1], 6).v), xstep = o.xlog ? 1 : niceTicks(o.xr[0], o.xr[1], 6).step; x.textAlign = 'center';
  xt.forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(o.xlog ? String(+v.toPrecision(3)) : tickText(v, xstep), sx(v), box.b + 16); });
  x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(box.l, box.b); x.lineTo(box.r, box.b); x.moveTo(box.l, box.t); x.lineTo(box.l, box.b); x.stroke();
  x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(o.xl || '', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(o.yl || '', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
  function curve(s){ var pts = s.pts, i, v; if (!pts) { pts = []; for (i = 0; i <= 160; i++) { v = o.xlog ? Math.pow(10, xl + (xh - xl) * i / 160) : o.xr[0] + (o.xr[1] - o.xr[0]) * i / 160; pts.push([v, s.fn(v)]); } }
    x.strokeStyle = s.color; x.lineWidth = s.w || 2.4; x.setLineDash(s.dash || []); x.lineJoin = 'round'; x.beginPath(); var open = false;
    pts.forEach(function(p){ var yy = sy(Math.min(Math.max(p[1], o.yr[0]), o.yr[1])); open ? x.lineTo(sx(p[0]), yy) : x.moveTo(sx(p[0]), yy); open = true; }); x.stroke(); x.setLineDash([]); }
  (o.pinned || []).forEach(curve); (o.series || []).forEach(curve);
  (o.hlines || []).forEach(function(h){ x.strokeStyle = h.c || C.warn; x.lineWidth = 1.4; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(box.l, sy(h.y)); x.lineTo(box.r, sy(h.y)); x.stroke(); x.setLineDash([]); });
  var lg = (o.series || []).filter(function(s){ return s.label; }).concat(o.pinned && o.pinned.length ? [{ label: 'Pinned', color: '#A1B1C4', dash: [5, 4] }] : []), lx = box.l + 8; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left';
  lg.forEach(function(s){ x.strokeStyle = s.color; x.lineWidth = 2.4; x.setLineDash(s.dash || []); x.beginPath(); x.moveTo(lx, box.t + 10); x.lineTo(lx + 16, box.t + 10); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.fillText(s.label, lx + 20, box.t + 14); lx += 30 + s.label.length * 6.2; });
  x.font = '12px Aptos, "Segoe UI", sans-serif';
  return { g: g, x: x, box: box, sx: sx, sy: sy, ix: ix, iy: iy, inside: function(p){ return p.x >= box.l && p.x <= box.r && p.y >= box.t && p.y <= box.b; } };
};

/* small drawing helpers for overlays */
IX.dot = function(M, px, py, r, col){ M.x.fillStyle = col || C.char; M.x.beginPath(); M.x.arc(px, py, r || 5, 0, 6.3); M.x.fill(); M.x.strokeStyle = '#fff'; M.x.lineWidth = 1.6; M.x.stroke(); };
IX.vline = function(M, px, col, dash){ M.x.strokeStyle = col || C.char; M.x.lineWidth = 1.3; M.x.setLineDash(dash || [4, 4]); M.x.beginPath(); M.x.moveTo(px, M.box.t); M.x.lineTo(px, M.box.b); M.x.stroke(); M.x.setLineDash([]); };
IX.hline = function(M, py, col, dash){ M.x.strokeStyle = col || C.char; M.x.lineWidth = 1.3; M.x.setLineDash(dash || [4, 4]); M.x.beginPath(); M.x.moveTo(M.box.l, py); M.x.lineTo(M.box.r, py); M.x.stroke(); M.x.setLineDash([]); };
IX.tip = function(M, px, py, lines){ var x = M.x; x.font = '600 11.5px Aptos, "Segoe UI", sans-serif'; var w = 0; lines.forEach(function(l){ w = Math.max(w, x.measureText(l).width); }); w += 14; var h = lines.length * 15 + 8, tx = px + 12, ty = py - h - 8; if (tx + w > M.box.r) tx = px - w - 12; if (ty < M.box.t) ty = py + 12; x.fillStyle = 'rgba(52,55,63,.94)'; x.fillRect(tx, ty, w, h); x.fillStyle = '#fff'; x.textAlign = 'left'; lines.forEach(function(l, i){ x.fillText(l, tx + 7, ty + 17 + i * 15); }); x.font = '12px Aptos, "Segoe UI", sans-serif'; };

/* export and sharing */
IX.download = function(name, content, mime){ var a = document.createElement('a'); a.href = typeof content === 'string' && content.indexOf('data:') === 0 ? content : URL.createObjectURL(new Blob([content], { type: mime })); a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
IX.png = function(canvases, name){ var w = 0, h = 0; canvases.forEach(function(c){ w += c.width; h = Math.max(h, c.height); }); var off = document.createElement('canvas'); off.width = w; off.height = h; var ctx = off.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); var px = 0; canvases.forEach(function(c){ ctx.drawImage(c, px, 0); px += c.width; }); IX.download(name + '.png', off.toDataURL('image/png')); return off.toDataURL('image/png').length; };
IX.csv = function(rows){ return rows.map(function(r){ return r.map(function(v){ return typeof v === 'number' ? String(+v.toPrecision(6)) : '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n'); };
IX.tools = function(api, o){
  var w = api.addControl((o.pin ? '<button type="button" class="btn sm ghost px-pin">Pin</button> <button type="button" class="btn sm ghost px-clr">Clear pins</button> ' : '') + (o.canvases ? '<button type="button" class="btn sm ghost px-png">PNG</button> ' : '') + (o.csv ? '<button type="button" class="btn sm ghost px-csv">CSV</button>' : ''));
  if (o.pin) { qs('.px-pin', w).addEventListener('click', o.pin); qs('.px-clr', w).addEventListener('click', o.clear); }
  if (o.canvases) qs('.px-png', w).addEventListener('click', function(){ IX.png(o.canvases(), o.name || 'figure'); });
  if (o.csv) qs('.px-csv', w).addEventListener('click', function(){ IX.download((o.name || 'data') + '.csv', o.csv(), 'text/csv'); });
  return w;
};

/* parameter state kept in the URL hash, one key per step */
IX.state = function(key, def){ try { var v = new URLSearchParams(location.hash.slice(1)).get(key); if (v) return Object.assign({}, def, JSON.parse(v)); } catch (e) {} return Object.assign({}, def); };
IX.save = function(key, obj){ try { var h = new URLSearchParams(location.hash.slice(1)); h.set(key, JSON.stringify(obj)); history.replaceState(null, '', '#' + h.toString()); } catch (e) {} };
IX.slider = function(cls, label, min, max, step, val, unit){ return label + ' <input type="range" class="' + cls + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" style="width:96px"> <b class="' + cls + 'v"></b>' + (unit ? ' ' + unit : ''); };

/* Side panels are rewritten while simulations run. Update changed text in place instead of replacing the nodes, so nothing is recreated or repainted when only numbers change. */
(function(){
  var d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (!d || !d.set) return;
  function morph(a, b){
    if (a.childNodes.length !== b.childNodes.length) return false;
    for (var i = 0; i < a.childNodes.length; i++) {
      var x = a.childNodes[i], y = b.childNodes[i];
      if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) return false;
      if (x.nodeType === 3) { if (x.data !== y.data) x.data = y.data; }
      else if (x.nodeType === 1) {
        var s = y.getAttribute('style') || '', c = y.getAttribute('class') || '';
        if ((x.getAttribute('style') || '') !== s) x.setAttribute('style', s);
        if ((x.getAttribute('class') || '') !== c) x.setAttribute('class', c);
        if (!morph(x, y)) return false;
      }
    }
    return true;
  }
  Object.defineProperty(Element.prototype, 'innerHTML', { get: d.get, configurable: true, set: function(h){
    var cl = this.classList;
    if (cl && (cl.contains('sd') || cl.contains('tl') || cl.contains('det')) && typeof h === 'string') {
      if (this.__h === h) return;
      if (this.firstChild) { var t = document.createElement('div'); d.set.call(t, h); if (morph(this, t)) { this.__h = h; return; } }
      this.__h = h;
    }
    d.set.call(this, h);
  } });
})();
