"use strict";
/* Interaction layer for tabs 07 to 09. Each step keeps its own drawing; this file adds, on a transparent canvas above
   each plot: hover readouts for points, bars and histogram bins, draggable handles that set the step's own sliders,
   rectangle selection with summary statistics on scatter plots, and PNG and CSV export. */
var XP = { specs: [] };
XP.add = function(lid, short, spec){ XP.specs.push({ l: lid, s: short, spec: spec }); };
XP.install = function(){
  XP.specs.forEach(function(sp){
    var L = LESSONS[sp.l], d = L && L.steps.filter(function(s){ return s.short === sp.s; })[0];
    if (!d) { if (window.console) console.warn('XP: no step', sp.l, sp.s); return; }
    var ob = d.build;
    d.build = function(api){ var h = ob.call(d, api) || {}; XP.wire(api, h, sp.spec); return h; };
  });
};
XP.med = function(a){ var s = a.slice().sort(function(p, q){ return p - q; }); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
XP.label = function(r){ return r.name || (r.d && (r.d.name || r.d.id)) || r.id || ''; };

XP.wire = function(api, h, spec){
  var cvs = Array.prototype.slice.call(api.inner.querySelectorAll('canvas')), sb = api.sbar, st = [];
  function ctl(cls){ return qs('input.' + cls, sb) || qs('select.' + cls, sb); }
  var X = {
    val: function(cls){ var e = ctl(cls); return e ? parseFloat(e.value) : NaN; },
    sel: function(cls){ var e = ctl(cls); return e ? e.value : ''; },
    put: function(cls, v){ var e = ctl(cls); if (!e) return; if (e.type === 'range') { var mn = +e.min, mx = +e.max, sp = +e.step || 0; v = Math.max(mn, Math.min(mx, v)); if (sp) v = Math.round((v - mn) / sp) * sp + mn; v = +v.toFixed(6); } e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); },
    cvs: cvs
  };
  function cs(i){ return (spec.cv && spec.cv[i]) || {}; }
  cvs.forEach(function(c, i){
    var ov = document.createElement('canvas'); ov.style.cssText = 'position:absolute;pointer-events:none;z-index:3'; c.parentNode.appendChild(ov);
    st.push({ c: c, ov: ov, hover: null, brush: null, sel: [], orig: c.style.cursor || '' });
  });
  function place(s){ var c = s.c; if (!c._w) return false; s.ov.style.left = c.offsetLeft + 'px'; s.ov.style.top = c.offsetTop + 'px'; s.ov.style.width = c.style.width || (c.clientWidth + 'px'); s.ov.style.height = c.style.height || (c.clientHeight + 'px'); if (s.ov.width !== c.width) s.ov.width = c.width; if (s.ov.height !== c.height) s.ov.height = c.height; var g = s.ov.getContext('2d'); g.setTransform(c.width / c._w, 0, 0, c.height / c._h, 0, 0); g.clearRect(0, 0, c._w, c._h); s.g = g; return true; }
  function handles(i){ var f = cs(i).handles; return f && st[i].c._w ? f(st[i].c, X) || [] : []; }
  function nearHandle(i, p){ var hs = handles(i), b = null, bd = 14; hs.forEach(function(k){ var d = Math.hypot(k.x - p.x, k.y - p.y); if (d < bd) { bd = d; b = k; } }); return b; }
  function defTip(i, r, pt){ var o = cs(i); if (o.tip) return o.tip(r, pt, X); var l = [XP.label(r)]; if (pt.vx !== undefined) { l.push((o.xn || 'x') + ' ' + hfx(pt.vx)); l.push((o.yn || 'y') + ' ' + hfx(pt.vy)); var f = pt.vy / pt.vx; l.push('fold ' + (f >= 1 ? f.toFixed(1) + ' over' : (1 / f).toFixed(1) + ' under')); } return l; }
  function hoverAt(i, p){
    var s = st[i], c = s.c, o = cs(i), best = null, bd = 12;
    if (c._pts) c._pts.forEach(function(q){ var d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } });
    if (best) return { lines: defTip(i, best.r, best), x: best.x, y: best.y, ring: true };
    if (c._bars) { var bar = null; c._bars.forEach(function(b){ if (p.x >= b.x0 - 1 && p.x <= b.x1 + 1 && p.y >= b.y0 - 2 && p.y <= b.y1 + 2) bar = b; }); if (bar) return { lines: bar.lines, x: Math.min(p.x, (bar.x0 + bar.x1) / 2 + 20), y: Math.max(bar.y0, p.y - 4), box: bar }; }
    if (c._hist) { var H = c._hist, ser = H.series || [['Count', H.cnt]], nb = ser[0][1].length, b = H.box; if (p.x >= b.l && p.x <= b.r && p.y >= b.t && p.y <= b.b) { var k = Math.max(0, Math.min(nb - 1, Math.floor((p.x - b.l) / ((b.r - b.l) / nb)))), a0 = H.lo + k * (H.hi - H.lo) / nb, a1 = H.lo + (k + 1) * (H.hi - H.lo) / nb, fmt = function(v){ return H.log ? String(+Math.pow(10, v).toPrecision(3)) : v.toFixed(2); }; return { lines: [(H.name ? H.name + ' ' : '') + fmt(a0) + ' to ' + fmt(a1)].concat(ser.map(function(q){ return q[0] + ': ' + q[1][k]; })), x: b.l + (k + 0.5) * (b.r - b.l) / nb, y: b.t + 12, col: { x0: b.l + k * (b.r - b.l) / nb, x1: b.l + (k + 1) * (b.r - b.l) / nb, y0: b.t, y1: b.b } }; } }
    if (o.hover) return o.hover(p, c, X);
    return null;
  }
  function stats(i, pts){
    var o = cs(i), rs = pts.map(function(q){ return q.r; }), lines = [pts.length + ' selected'];
    if (o.stats) return o.stats(rs, pts, X);
    var xy = pts.filter(function(q){ return q.vx > 0 && q.vy > 0; });
    if (xy.length && !o.mode) { var ls = xy.map(function(q){ return Math.log10(q.vy / q.vx); }), n = ls.length; lines.push((o.statLabel || 'Average fold error') + ' ' + Math.pow(10, ls.reduce(function(a, l){ return a + Math.abs(l); }, 0) / n).toFixed(2)); lines.push('Bias ' + Math.pow(10, ls.reduce(function(a, l){ return a + l; }, 0) / n).toFixed(2)); lines.push('Within 2-fold ' + ls.filter(function(l){ return Math.abs(l) <= Math.log10(2) + 1e-9; }).length + ' of ' + n); }
    else if (xy.length) { lines.push('Median ' + (o.xn || 'x') + ' ' + hfx(XP.med(xy.map(function(q){ return q.vx; })))); lines.push('Median ' + (o.yn || 'y') + ' ' + hfx(XP.med(xy.map(function(q){ return q.vy; })))); }
    if (pts.length <= 4) pts.forEach(function(q){ lines.push(XP.label(q.r)); });
    return lines;
  }
  function paint(i){
    var s = st[i]; if (!place(s)) return; var g = s.g, c = s.c, M = { x: g, box: { l: 0, r: c._w, t: 0, b: c._h } };
    var many = s.sel.length > 60; s.sel.forEach(function(q){ g.strokeStyle = C.char; g.globalAlpha = many ? 0.55 : 1; g.lineWidth = many ? 1.1 : 2.2; g.beginPath(); g.arc(q.x, q.y, many ? 4.5 : 8, 0, 6.3); g.stroke(); }); g.globalAlpha = 1;
    if (s.brush) { var b = s.brush, x0 = Math.min(b.x0, b.x1), y0 = Math.min(b.y0, b.y1); g.fillStyle = 'rgba(52,55,63,.08)'; g.fillRect(x0, y0, Math.abs(b.x1 - b.x0), Math.abs(b.y1 - b.y0)); g.strokeStyle = C.char; g.lineWidth = 1.3; g.setLineDash([4, 3]); g.strokeRect(x0, y0, Math.abs(b.x1 - b.x0), Math.abs(b.y1 - b.y0)); g.setLineDash([]); }
    handles(i).forEach(function(k){ g.fillStyle = 'rgba(255,255,255,.7)'; g.strokeStyle = C.char; g.lineWidth = 2.2; g.beginPath(); g.arc(k.x, k.y, 9, 0, 6.3); g.fill(); g.stroke(); g.fillStyle = C.char; g.beginPath(); g.arc(k.x, k.y, 2.6, 0, 6.3); g.fill(); if (k.label) { g.font = '600 11px Aptos, "Segoe UI", sans-serif'; g.textAlign = 'left'; g.fillText(k.label, k.x + 13, k.y - 8); } });
    var hv = s.hover;
    if (hv) { if (hv.col) { g.fillStyle = 'rgba(52,55,63,.12)'; g.fillRect(hv.col.x0, hv.col.y0, hv.col.x1 - hv.col.x0, hv.col.y1 - hv.col.y0); } if (hv.box) { g.strokeStyle = C.char; g.lineWidth = 1.6; g.strokeRect(hv.box.x0, hv.box.y0, hv.box.x1 - hv.box.x0, hv.box.y1 - hv.box.y0); } if (hv.ring) { g.strokeStyle = C.char; g.lineWidth = 2.4; g.beginPath(); g.arc(hv.x, hv.y, 9, 0, 6.3); g.stroke(); } if (hv.draw) hv.draw(g, c); if (hv.lines) IX.tip(M, hv.x, hv.y, hv.lines); }
    if (s.sel.length) { var ln = stats(i, s.sel), w = 0; g.font = '600 11.5px Aptos, "Segoe UI", sans-serif'; ln.forEach(function(t){ w = Math.max(w, g.measureText(t).width); }); w += 16; var hh = ln.length * 15 + 8, bx = c._w - w - 14, by = 14; g.fillStyle = 'rgba(255,255,255,.94)'; g.fillRect(bx, by, w, hh); g.strokeStyle = C.silver; g.lineWidth = 1; g.strokeRect(bx, by, w, hh); g.fillStyle = C.char; g.textAlign = 'left'; ln.forEach(function(t, k){ g.fillText(t, bx + 8, by + 16 + k * 15); }); g.font = '12px Aptos, "Segoe UI", sans-serif'; }
  }
  function refresh(clear){ st.forEach(function(s, i){ if (clear) { s.sel = []; s.brush = null; } paint(i); }); }
  cvs.forEach(function(c, i){
    var s = st[i], o = cs(i);
    IX.attach(c, {
      move: function(p){ var k = nearHandle(i, p); s.hover = k ? (k.tip ? { lines: k.tip, x: k.x, y: k.y } : null) : hoverAt(i, p); c.style.cursor = k ? k.cur : (s.hover && (s.hover.ring || s.hover.box) ? 'pointer' : (o.custom ? 'grab' : s.orig)); paint(i); },
      leave: function(){ s.hover = null; c.style.cursor = s.orig; paint(i); },
      down: function(p){ var k = nearHandle(i, p); if (k) { s.hover = null; return { k: 'h', hd: k }; } if (o.custom) { var d = o.custom.down(p, c, X); if (d) { s.hover = null; return { k: 'c', d: d }; } } if (c._pts && c._pts.length && o.brush !== false) { s.hover = null; s.brush = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; s.sel = []; return { k: 'b' }; } return null; },
      drag: function(d, p){ if (d.k === 'h') { d.hd.set(p); } else if (d.k === 'c') { o.custom.move(p, d.d, c, X); } else { var b = s.brush; b.x1 = Math.max(0, Math.min(c._w, p.x)); b.y1 = Math.max(0, Math.min(c._h, p.y)); var xa = Math.min(b.x0, b.x1), xb = Math.max(b.x0, b.x1), ya = Math.min(b.y0, b.y1), yb = Math.max(b.y0, b.y1); s.sel = c._pts.filter(function(q){ return q.x >= xa && q.x <= xb && q.y >= ya && q.y <= yb; }); } paint(i); },
      up: function(d){ if (d.k === 'b') { var b = s.brush; if (Math.abs(b.x1 - b.x0) < 4 && Math.abs(b.y1 - b.y0) < 4) s.sel = []; s.brush = null; } paint(i); }
    });
  });
  var oR = h.render; h.render = function(){ var r = oR ? oR.apply(this, arguments) : undefined; refresh(true); return r; };
  ['input', 'change'].forEach(function(ev){ sb.addEventListener(ev, function(){ refresh(true); }); });
  sb.addEventListener('click', function(){ setTimeout(function(){ refresh(true); }, 0); });
  /* export */
  function defCsv(){ var rows = [], i; for (i = 0; i < cvs.length; i++) { var c = cvs[i], o = cs(i); if (c._pts && c._pts.length) { rows.push([o.cols ? o.cols[0] : 'Label', o.cols ? o.cols[1] : 'x', o.cols ? o.cols[2] : 'y']); c._pts.forEach(function(q){ rows.push([XP.label(q.r), q.vx !== undefined ? q.vx : '', q.vy !== undefined ? q.vy : '']); }); break; } } return IX.csv(rows); }
  var tl = { canvases: function(){ return cvs; }, name: spec.name || 'figure' };
  if (spec.csv) tl.csv = function(){ return spec.csv(X); }; else if (spec.csvPts) tl.csv = defCsv;
  IX.tools(api, tl);
};

(function(){
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function lg(v){ return Math.log10(v); }
  var NAMEA = function(r){ return r.d.name; };

  /* ---------------- tab 07 ---------------- */
  XP.add('hep', 'Predicted against observed', { name: 'predicted-against-observed', csvPts: true, cv: [{ xn: 'observed', yn: 'predicted', cols: ['Drug', 'Observed (mL/min/kg)', 'Predicted (mL/min/kg)'], tip: function(r, q){ return [r.d.name, 'observed ' + hfx(r.d.obs) + ' mL/min/kg', 'predicted ' + hfx(r.p), hfold(r.p, r.d.obs)]; } }] });
  XP.add('hep', 'Scaling to the liver', { name: 'scaling-to-the-liver', cv: [
    { xn: 'observed', yn: 'predicted', tip: function(r){ return [r.d.name, 'observed ' + hfx(r.d.obs) + ' mL/min/kg', 'predicted ' + hfx(r.p), hfold(r.p, r.d.obs)]; } },
    (function(){
      var geo = function(c){ return { l: 52, r: c._w - 14, t: 14, b: c._h - 42 }; };
      var fAt = function(c, x){ var g = geo(c); return Math.pow(10, -0.8 + (x - g.l) / (g.r - g.l) * 1.6); };
      var xOf = function(c, f){ var g = geo(c); return g.l + (lg(f) + 0.8) / 1.6 * (g.r - g.l); };
      var sc = function(X, f){ return hepScore(hepRows({ model: X.sel('m'), bind: 'both', sf: f })); };
      return {
        handles: function(c, X){ var g = geo(c), f = (X.val('mp') / HMP0) * (X.val('lw') / HLW0); return [{ x: xOf(c, f), y: g.t + 10, cur: 'ew-resize', label: 'factor ' + f.toFixed(2), set: function(p){ X.put('mp', fAt(c, p.x) * HMP0 * HLW0 / X.val('lw')); } }]; },
        hover: function(p, c, X){ var g = geo(c); if (p.x < g.l || p.x > g.r || p.y < g.t || p.y > g.b) return null; var f = fAt(c, p.x), s = sc(X, f); return { x: p.x, y: p.y, lines: ['factor ' + f.toFixed(2), 'average fold error ' + s.gmfe.toFixed(2), 'bias ' + s.bias.toFixed(2), s.within2 + ' of ' + s.n + ' within 2-fold'], draw: function(g2){ g2.strokeStyle = C.mid; g2.setLineDash([2, 3]); g2.beginPath(); g2.moveTo(p.x, g.t); g2.lineTo(p.x, g.b); g2.stroke(); g2.setLineDash([]); } }; }
      };
    })()], csv: function(X){ var rows = [['Scaling factor', 'Average fold error', 'Bias', 'Within 2-fold']], i; for (i = 0; i <= 40; i++) { var f = Math.pow(10, -0.8 + 1.6 * i / 40), s = hepScore(hepRows({ model: X.sel('m'), bind: 'both', sf: f })); rows.push([f, s.gmfe, s.bias, s.within2]); } return IX.csv(rows); } });
  XP.add('hep', 'Extraction models', { name: 'extraction-models', cv: [{ tip: function(r, q, X){ return [r.d.name, 'CLint over Q ' + hfx(r.xv), 'observed extraction ' + Math.min(r.d.obs / X.val('q'), 1).toFixed(2)]; } }], csv: function(X){ var rows = [['Drug', 'Binding-corrected CLint over Q', 'Observed extraction']]; OBACH99.forEach(function(d){ var q = X.val('q'); rows.push([d.name, d.clint * (d.fup / d.bp) / d.fum / q, Math.min(d.obs / q, 1)]); }); return IX.csv(rows); } });
  XP.add('hep', 'Binding assumptions', { name: 'binding-assumptions', cv: [(function(){
      var GR = [['base', 'Bases'], ['neutral', 'Neutrals'], ['acid', 'Acids'], [null, 'All 29']], BN = [['none', 'No binding correction'], ['blood', 'fu(blood) only'], ['both', 'fu(blood) and fu(microsomes)']];
      return { hover: function(p, c, X){ var l = 52, r = c._w - 14, t = 38, b = c._h - 40, gw = (r - l) / 4, bw = (gw - 22) / 3; if (p.x < l || p.x > r || p.y < t - 20 || p.y > b) return null; var gi = Math.floor((p.x - l) / gw), rel = p.x - (l + gi * gw + 11), bi = Math.floor(rel / bw); if (gi < 0 || gi > 3 || rel < 0 || bi < 0 || bi > 2) return null; var s = hepScore(hepRows({ model: X.sel('m'), bind: BN[bi][0], plasma: X.sel('f') === 'pl' }, GR[gi][0])); return { x: p.x, y: p.y, lines: [GR[gi][1] + ', ' + BN[bi][1], 'average fold error ' + s.gmfe.toFixed(2), 'bias ' + s.bias.toFixed(2), s.within2 + ' of ' + s.n + ' within 2-fold'] }; } };
    })()], csv: function(X){ var rows = [['Group', 'Binding correction', 'Average fold error', 'Bias', 'Within 2-fold', 'n']]; [['base', 'Bases'], ['neutral', 'Neutrals'], ['acid', 'Acids'], [null, 'All 29']].forEach(function(g){ [['none', 'none'], ['blood', 'fu(blood)'], ['both', 'fu(blood) and fu(microsomes)']].forEach(function(b){ var s = hepScore(hepRows({ model: X.sel('m'), bind: b[0], plasma: X.sel('f') === 'pl' }, g[0])); rows.push([g[1], b[1], s.gmfe, s.bias, s.within2, s.n]); }); }); return IX.csv(rows); } });
  XP.add('hep', 'Empirical scalars', { name: 'empirical-scalars', cv: [{}, {}] });
  XP.add('hep', 'Low-turnover compounds', { name: 'low-turnover', cv: [(function(){
      var geo = function(c){ return { l: 52, r: c._w - 14, t: 16, b: c._h - 42 }; };
      var k0 = function(X){ return Math.pow(10, X.val('l')) / 900 * parseFloat(X.sel('p')); };
      return {
        handles: function(c, X){ var g = geo(c), T = X.val('t'), k = k0(X), sx = function(t){ return g.l + t / 180 * (g.r - g.l); }, sy = function(v){ return g.b - v / 110 * (g.b - g.t); };
          return [{ x: sx(T), y: sy(100 * Math.exp(-k * T)), cur: 'ns-resize', label: 'CLint', set: function(p){ var pv = cl((g.b - p.y) / (g.b - g.t) * 110, 0.5, 99.9), kk = -Math.log(pv / 100) / T; X.put('l', lg(kk * 900 / parseFloat(X.sel('p')))); } }, { x: sx(T), y: g.t + 10, cur: 'ew-resize', label: 'incubation', set: function(p){ X.put('t', (p.x - g.l) / (g.r - g.l) * 180); } }]; },
        hover: function(p, c, X){ var g = geo(c); if (p.x < g.l || p.x > g.r || p.y < g.t || p.y > g.b) return null; var t = (p.x - g.l) / (g.r - g.l) * 180; return { x: p.x, y: p.y, lines: ['t = ' + t.toFixed(0) + ' min', 'parent remaining ' + (100 * Math.exp(-k0(X) * t)).toFixed(1) + '%', 'loss ' + (100 * (1 - Math.exp(-k0(X) * t))).toFixed(1) + '%'] }; }
      };
    })()] });
  XP.add('hep', 'Microsomes against hepatocytes', { name: 'microsomes-against-hepatocytes', csvPts: true, cv: [{ xn: 'microsomes', yn: 'hepatocytes', statLabel: 'Average fold difference', cols: ['Compound', 'Scaled microsomal CLint (mL/min/kg)', 'Scaled hepatocyte CLint (mL/min/kg)'], tip: function(r){ return [r.d.name || r.d.id, 'microsomes ' + hfx(r.row.a) + ' mL/min/kg', 'hepatocytes ' + hfx(r.row.b) + ' mL/min/kg', 'ratio ' + (r.row.b / r.row.a).toFixed(2)]; } }] });
  XP.add('hep', 'Choosing a method by class', { name: 'eccs-class', cv: [(function(){
      var BX = { l: 56, r: 490, t: 14, b: 448 };
      return {
        handles: function(c, X){ var lp = X.val('pp'), mw = X.val('mw'); return [{ x: BX.l + (lp + 1) / 3 * (BX.r - BX.l), y: BX.b - (mw - 150) / 650 * (BX.b - BX.t), cur: 'move', set: function(p){ X.put('pp', -1 + cl((p.x - BX.l) / (BX.r - BX.l), 0, 1) * 3); X.put('mw', 150 + cl((BX.b - p.y) / (BX.b - BX.t), 0, 1) * 650); } }]; },
        hover: function(p, c, X){ if (p.x < BX.l || p.x > BX.r || p.y < BX.t || p.y > BX.b) return null; var papp = Math.pow(10, -1 + (p.x - BX.l) / (BX.r - BX.l) * 3), mw = 150 + (BX.b - p.y) / (BX.b - BX.t) * 650, k = eccsClass(X.sel('io') === 'a', mw, papp); return { x: p.x, y: p.y, lines: ['Class ' + k, ECCS[k][0], 'Papp ' + (papp < 10 ? papp.toFixed(2) : papp.toFixed(1)) + ' x 10^-6 cm/s', 'MW ' + Math.round(mw / 10) * 10 + ' Da'] }; }
      };
    })()] });

  /* ---------------- tab 08 ---------------- */
  XP.add('dist', 'What Vss measures', { name: 'what-vss-measures', cv: [(function(){
      var W = 70, L = 20, T0 = 70, B0 = 150, BY = 215;
      var calc = function(X){ var Kp = Math.pow(10, X.val('k')), Vp = OT.Vp * W, Vt = (OT.Ve + OT.Vr) * W; return { Kp: Kp, Vp: Vp, Vt: Vt, Vss: Vp + Kp * Vt }; };
      return {
        handles: function(c, X){ var R = c._w - 20, q = calc(X), sc = (R - L) / 400; return [{ x: L + q.Vp / q.Vss * (R - L), y: (T0 + B0) / 2, cur: 'ew-resize', label: 'plasma share', set: function(p){ var f = cl((p.x - L) / (R - L), 0.005, 0.999), Vss = q.Vp / f; X.put('k', lg(Math.max((Vss - q.Vp) / q.Vt, 0.001))); } }, { x: L + Math.min(q.Vss, 400) * sc, y: BY + 17, cur: 'ew-resize', label: 'Vss', set: function(p){ var Vss = cl((p.x - L) / sc, q.Vp * 1.001, 400); X.put('k', lg(Math.max((Vss - q.Vp) / q.Vt, 0.001))); } }]; },
        hover: function(p, c, X){ var q = calc(X), dose = 100, Cp = dose / q.Vss; if (p.y >= T0 && p.y <= B0) return { x: p.x, y: p.y, lines: ['Plasma ' + (Cp * q.Vp).toFixed(1) + ' mg', 'Tissue ' + (Cp * q.Kp * q.Vt).toFixed(1) + ' mg', 'Cp ' + Cp.toFixed(3) + ' mg/L'] }; if (p.y >= BY && p.y <= BY + 34) return { x: p.x, y: p.y, lines: ['Vss ' + q.Vss.toFixed(0) + ' L', 'plasma ' + q.Vp.toFixed(1) + ' L', 'tissue ' + (q.Kp * q.Vt).toFixed(0) + ' L'] }; return null; }
      };
    })()] });
  XP.add('dist', 'Volume from binding', { name: 'volume-from-binding', cv: [(function(){
      var geo = function(c){ return { l: 58, r: c._w - 14, t: 14, b: c._h - 42 }; };
      var sx = function(g, ft){ return g.l + (lg(ft) + 3) / 3 * (g.r - g.l); }, sy = function(g, v){ return g.b - (lg(v) + 1) / 3 * (g.b - g.t); };
      return {
        handles: function(c, X){ var g = geo(c), fup = Math.pow(10, X.val('f')), fut = Math.pow(10, X.val('t')); return [{ x: sx(g, fut), y: sy(g, otVss(fup, fut)), cur: 'move', label: 'drag', set: function(p){ var lt = cl(-3 + (p.x - g.l) / (g.r - g.l) * 3, -3, 0), tgt = Math.pow(10, -1 + (g.b - p.y) / (g.b - g.t) * 3), ft = Math.pow(10, lt), lo = -3, hi = 0, m, i; for (i = 0; i < 30; i++) { m = (lo + hi) / 2; if (otVss(Math.pow(10, m), ft) < tgt) lo = m; else hi = m; } X.put('t', lt); X.put('f', m); } }]; },
        hover: function(p, c, X){ var g = geo(c); if (p.x < g.l || p.x > g.r || p.y < g.t || p.y > g.b) return null; var ft = Math.pow(10, -3 + (p.x - g.l) / (g.r - g.l) * 3), fup = Math.pow(10, X.val('f')); return { x: p.x, y: p.y, lines: ['fut ' + +ft.toPrecision(3), 'Vss ' + hfx(otVss(fup, ft)) + ' L/kg at fup ' + +fup.toPrecision(3)] }; }
      };
    })()] });
  XP.add('dist', 'Implied tissue binding', { name: 'implied-tissue-binding', csvPts: true, cv: [{ mode: 'xy', xn: 'fup', yn: 'Vss', cols: ['Drug', 'fup', 'Vss (L/kg)'], tip: function(r){ var im = r.fu ? otImplied(r) : null; return [r.name || r.id, 'fup ' + r.fu, 'Vss ' + hfx(r.vss) + ' L/kg', 'implied fut ' + (im ? im.toFixed(3) : 'undefined')]; } }] });
  XP.add('dist', 'Predicting tissue binding', { name: 'predicting-tissue-binding', csvPts: true, cv: [{ xn: 'observed', yn: 'predicted', cols: ['Drug', 'Observed Vss (L/kg)', 'Predicted Vss (L/kg)'] }] });
  XP.add('dist', 'Ionization class', { name: 'ionization-class', cv: [{ tip: function(r, q, X){ var y = X.sel('y'); return [r.name || r.id, DCLS[dClass(r)][0], y === 'vss' ? 'Vss ' + hfx(r.vss) + ' L/kg' : (y === 'fu' ? 'fup ' + r.fu : 'logD ' + r.logd)]; } }] });
  XP.add('dist', 'Half-life from CL and Vss', { name: 'half-life-from-cl-and-vss', csvPts: true, cv: [{ xn: 'reported', yn: '0.693 Vss / CL', cols: ['Drug', 'Reported half-life (h)', '0.693 x Vss / CL (h)'] }, {}] });
  XP.add('dist', 'Blood to plasma ratio', { name: 'blood-to-plasma-ratio', csvPts: true, cv: [{ xn: 'observed', yn: 'predicted', cols: ['Drug', 'Observed clearance (mL/min/kg)', 'Predicted blood clearance (mL/min/kg)'], tip: function(r, q){ return [r.name, 'B:P ' + r.bp, 'observed ' + hfx(q.vx), 'predicted ' + hfx(q.vy), hfold(q.vy, q.vx)]; } }] });
  XP.add('dist', 'Sensitivity of Vss', { name: 'sensitivity-of-vss', cv: [{}] });

  /* ---------------- tab 09 ---------------- */
  XP.add('abs', 'Hepatic first-pass limit', { name: 'hepatic-first-pass-limit', cv: [{}], csv: function(X){ var q = X.val('q'), rows = [['Drug', 'Observed blood CL (mL/min/kg)', 'Fh upper bound at Q = ' + q]]; OBACH99.forEach(function(d){ rows.push([d.name, d.obs, Math.max(0, 1 - d.obs / q)]); }); return IX.csv(rows); } });
  XP.add('abs', 'Solubility and dose', { name: 'solubility-and-dose', cv: [{
      custom: { down: function(p, c, X){ if (p.x < 46 || p.x > c._w - 14 || p.y < 14 || p.y > c._h - 42) return null; return { x0: p.x, ld0: X.val('d') }; }, move: function(p, d, c, X){ X.put('d', d.ld0 + (p.x - d.x0) / (c._w - 60) * 14); } } }] });
  XP.add('abs', 'pH-dependent solubility', { name: 'ph-dependent-solubility', cv: [(function(){
      var geo = function(c){ return { l: 58, r: c._w - 14, t: 14, b: c._h - 42 }; };
      var prm = function(X){ return { typ: X.sel('t'), pka: X.val('k'), s0: Math.pow(10, X.val('s')), dose: parseFloat(X.sel('d')) }; };
      var S = function(P, ph){ return P.typ === 'acid' ? P.s0 * (1 + Math.pow(10, ph - P.pka)) : (P.typ === 'base' ? P.s0 * (1 + Math.pow(10, P.pka - ph)) : P.s0); };
      var d0 = function(P, ph){ return (P.dose / 250) / S(P, ph); };
      var sx = function(g, ph){ return g.l + (ph - 1) / 7 * (g.r - g.l); }, sy = function(g, l){ return g.b - (cl(l, -3, 4) + 3) / 7 * (g.b - g.t); };
      var pHat = function(g, x){ return 1 + (x - g.l) / (g.r - g.l) * 7; };
      return {
        handles: function(c, X){ var g = geo(c), P = prm(X), hs = [{ x: sx(g, X.val('g')), y: sy(g, lg(d0(P, X.val('g')))), cur: 'ew-resize', label: 'gastric', set: function(p){ X.put('g', pHat(g, p.x)); } }, { x: sx(g, X.val('i')), y: sy(g, lg(d0(P, X.val('i')))), cur: 'ew-resize', label: 'intestinal', set: function(p){ X.put('i', pHat(g, p.x)); } }]; if (P.typ !== 'neutral') hs.push({ x: sx(g, P.pka), y: sy(g, lg(d0(P, P.pka))), cur: 'ew-resize', label: 'pKa', set: function(p){ X.put('k', pHat(g, p.x)); } }); return hs; },
        hover: function(p, c, X){ var g = geo(c); if (p.x < g.l || p.x > g.r || p.y < g.t || p.y > g.b) return null; var P = prm(X), ph = pHat(g, p.x), fm = function(v){ return (v < 0.001 || v >= 10000) ? v.toExponential(2) : v.toPrecision(3); }; return { x: p.x, y: p.y, lines: ['pH ' + ph.toFixed(1), 'S ' + fm(S(P, ph)) + ' mg/mL', 'D0 ' + fm(d0(P, ph))] }; }
      };
    })()] });
  XP.add('abs', 'Permeability descriptors', { name: 'permeability-descriptors', csvPts: true, cv: [{ mode: 'xy', cols: ['Compound', 'Descriptor', 'Caco-2 log10 Papp (cm/s)'], tip: function(r, q, X){ var dk = X.sel('k'); return [r.name, 'log10 Papp ' + r.y.toFixed(2), dk + ' ' + r[dk]]; }, stats: function(rs, pts, X){ var dk = X.sel('k'); return [rs.length + ' selected', 'Median log10 Papp ' + XP.med(rs.map(function(r){ return r.y; })).toFixed(2), 'Median ' + dk + ' ' + hfx(XP.med(rs.map(function(r){ return r[dk]; })))]; } }] });
  XP.add('abs', 'Property rules', { name: 'property-rules', cv: [{}, {}] });
})();

XP.install();
