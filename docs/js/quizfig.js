"use strict";
/* Quiz schematics. Generic builders: xy (points, curves, reference lines), bars, gbars (grouped bars), flow (boxes and arrows) and eccs (class map).
   A figure depicts the quantities in the question. It does not mark the correct option. */
(function(){
  var S = QZSV, C = S.C;
  function fmtTick(v){ return Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(0).replace('e+', 'e') : String(+v.toPrecision(3)); }
  function mapper(r, log, a, b){ var lo = log ? Math.log10(r[0]) : r[0], hi = log ? Math.log10(r[1]) : r[1]; return function(v){ var t = log ? Math.log10(Math.max(v, r[0] * 1e-6)) : v; return a + (t - lo) / (hi - lo) * (b - a); }; }
  /* inner drawing of one xy panel at offset (ox, oy) */
  function xyInner(o, ox, oy){
    var W = o.w || 600, H = o.h || 240, m = { l: 56, r: 14, t: o.title ? 26 : 12, b: o.xl ? 44 : 28 }, g = '';
    var L = ox + m.l, R = ox + W - m.r, T = oy + m.t, B = oy + H - m.b;
    var sx = mapper(o.xr, o.xlog, L, R), sy = mapper(o.yr, o.ylog, B, T);
    if (o.title) g += S.text(ox + W / 2, oy + 16, o.title, { b: true });
    (o.yt || []).forEach(function(v){ g += S.line(L, sy(v), R, sy(v), { c: C.silver, w: 1 }) + S.text(L - 6, sy(v) + 4, o.yf ? o.yf(v) : fmtTick(v), { a: 'end', c: C.mid, s: 11 }); });
    (o.xt || []).forEach(function(v){ g += S.line(sx(v), T, sx(v), B, { c: C.silver, w: 1 }) + S.text(sx(v), B + 15, o.xf ? o.xf(v) : fmtTick(v), { c: C.mid, s: 11 }); });
    g += S.line(L, B, R, B, { c: C.char, w: 1.2 }) + S.line(L, T, L, B, { c: C.char, w: 1.2 });
    if (o.xl) g += S.text((L + R) / 2, oy + H - 6, o.xl, { b: true, s: 12 });
    if (o.yl) g += '<text transform="translate(' + (ox + 13) + ',' + ((T + B) / 2) + ') rotate(-90)" text-anchor="middle" fill="' + C.char + '" font-weight="700" font-size="12">' + o.yl + '</text>';
    if (o.fold2) { var lo = Math.max(o.xr[0], o.yr[0]) * 1.0001, hi = Math.min(o.xr[1], o.yr[1]) * 0.9999; g += '<polygon points="' + sx(lo) + ',' + sy(lo * 2) + ' ' + sx(hi / 2) + ',' + sy(hi) + ' ' + sx(hi) + ',' + sy(hi) + ' ' + sx(hi) + ',' + sy(hi / 2) + ' ' + sx(lo * 2) + ',' + sy(lo) + ' ' + sx(lo) + ',' + sy(lo) + '" fill="#0F6E8C" opacity="0.10"/>'; }
    if (o.unity) { var u0 = Math.max(o.xr[0], o.yr[0]), u1 = Math.min(o.xr[1], o.yr[1]); g += S.line(sx(u0), sy(u0), sx(u1), sy(u1), { c: C.char, w: 1.3, d: '5 4' }); }
    (o.hlines || []).forEach(function(h){ g += S.line(L, sy(h.y), R, sy(h.y), { c: h.c || C.char, w: 1.3, d: '5 4' }) + (h.t ? S.text(R - 4, sy(h.y) - 5, h.t, { a: 'end', c: h.c || C.char, s: 11 }) : ''); });
    (o.vlines || []).forEach(function(v){ g += S.line(sx(v.x), T, sx(v.x), B, { c: v.c || C.char, w: 1.3, d: '5 4' }) + (v.t ? S.text(sx(v.x) + 4, T + 12, v.t, { a: 'start', c: v.c || C.char, s: 11 }) : ''); });
    (o.series || []).forEach(function(s){
      var pts = s.pts || [], i, x;
      if (s.fn) { pts = []; for (i = 0; i <= 90; i++) { x = o.xlog ? Math.pow(10, Math.log10(o.xr[0]) + (Math.log10(o.xr[1]) - Math.log10(o.xr[0])) * i / 90) : o.xr[0] + (o.xr[1] - o.xr[0]) * i / 90; pts.push([x, s.fn(x)]); } }
      if (s.line !== false && pts.length > 1 && (s.fn || s.l)) { var d = ''; pts.forEach(function(p, k){ var yy = Math.min(Math.max(p[1], o.yr[0]), o.yr[1]); d += (k ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(yy).toFixed(1); }); g += S.path(d, { c: s.c || C.red, w: s.w || 2.4, d: s.d }); }
      if (s.dots) pts.forEach(function(p){ g += S.circle(sx(p[0]), sy(Math.min(Math.max(p[1], o.yr[0] * 1.001), o.yr[1] * 0.999)), s.r || 3.6, { f: s.c || C.red, s: '#fff', w: 0.8 }); });
    });
    (o.marks || []).forEach(function(k){ g += S.circle(sx(k.x), sy(k.y), k.r || 6, { f: k.c || C.char, s: '#fff', w: 2 }) + (k.t ? S.text(sx(k.x) + (k.dx === undefined ? 10 : k.dx), sy(k.y) + (k.dy === undefined ? -8 : k.dy), k.t, { a: k.a || 'start', b: true, c: C.char, s: 12 }) : ''); });
    var lg = (o.series || []).filter(function(s){ return s.label; }), lx = L + 8;
    lg.forEach(function(s){ g += S.line(lx, T + 12, lx + 16, T + 12, { c: s.c || C.red, w: 2.4, d: s.d }) + S.text(lx + 20, T + 16, s.label, { a: 'start', s: 11 }); lx += 28 + s.label.length * 6.2; });
    (o.texts || []).forEach(function(t){ g += S.text(sx(t.x), sy(t.y), t.t, { a: t.a || 'middle', c: t.c || C.mid, s: t.s || 11, b: t.b, i: t.i }); });
    return g;
  }
  QZFIG.xy = function(o){ return S.svg(o.w || 600, o.h || 240, xyInner(o, 0, 0), o.cap); };
  QZFIG.pair = function(p){ var a = p[0], b = p[1], wa = a.w || 300, wb = b.w || 300, h = Math.max(a.h || 240, b.h || 240); return S.svg(wa + wb, h, xyInner(a, 0, 0) + xyInner(b, wa, 0), a.cap); };

  /* bars: items [[label, value, colour]], yr range, optional reference lines and value labels */
  function barsInner(o, ox, oy){
    var W = o.w || 600, H = o.h || 240, m = { l: 56, r: 14, t: o.title ? 26 : 14, b: o.rot ? 70 : 38 }, g = '', L = ox + m.l, R = ox + W - m.r, T = oy + m.t, B = oy + H - m.b;
    var sy = function(v){ return B - (v - o.yr[0]) / (o.yr[1] - o.yr[0]) * (B - T); }, n = o.items.length, bw = (R - L) / n;
    if (o.title) g += S.text(ox + W / 2, oy + 16, o.title, { b: true });
    (o.yt || []).forEach(function(v){ g += S.line(L, sy(v), R, sy(v), { c: C.silver, w: 1 }) + S.text(L - 6, sy(v) + 4, o.yf ? o.yf(v) : fmtTick(v), { a: 'end', c: C.mid, s: 11 }); });
    g += S.line(L, sy(Math.max(0, o.yr[0])), R, sy(Math.max(0, o.yr[0])), { c: C.char, w: 1.2 }) + S.line(L, T, L, B, { c: C.char, w: 1.2 });
    o.items.forEach(function(it, i){ var v = it[1], y0 = sy(Math.max(0, o.yr[0])), y1 = sy(v), x = L + i * bw + bw * 0.14, w = bw * 0.72; g += S.rect(x, Math.min(y0, y1), w, Math.abs(y1 - y0), { f: it[2] || C.red, s: it[2] || C.red, w: 0, r: 1 });
      if (o.vals !== false) g += S.text(x + w / 2, (v >= 0 ? Math.min(y0, y1) - 4 : Math.max(y0, y1) + 12), o.vf ? o.vf(v) : fmtTick(v), { s: 10.5, b: true });
      if (o.rot) g += '<text transform="translate(' + (x + w / 2 + 3) + ',' + (B + 8) + ') rotate(55)" font-size="10" fill="' + C.mid + '">' + esc(it[0]) + '</text>'; else g += S.text(x + w / 2, B + 16, it[0], { s: 11 }); });
    (o.hlines || []).forEach(function(h){ g += S.line(L, sy(h.y), R, sy(h.y), { c: h.c || C.char, w: 1.3, d: '5 4' }) + (h.t ? S.text(R - 4, sy(h.y) - 5, h.t, { a: 'end', c: h.c || C.char, s: 11 }) : ''); });
    if (o.yl) g += '<text transform="translate(' + (ox + 13) + ',' + ((T + B) / 2) + ') rotate(-90)" text-anchor="middle" fill="' + C.char + '" font-weight="700" font-size="12">' + o.yl + '</text>';
    if (o.xl) g += S.text((L + R) / 2, oy + H - 6, o.xl, { b: true, s: 12 });
    return g;
  }
  QZFIG.bars = function(o){ return S.svg(o.w || 600, o.h || 240, barsInner(o, 0, 0), o.cap); };
  QZFIG.barpair = function(p){ var a = p[0], b = p[1], wa = a.w || 300; return S.svg(wa + (b.w || 300), Math.max(a.h || 240, b.h || 240), barsInner(a, 0, 0) + barsInner(b, wa, 0), a.cap); };
  /* grouped bars: groups [[label, [v1, v2, ...]]], colours per series, legend labels */
  QZFIG.gbars = function(o){
    var W = o.w || 600, H = o.h || 250, m = { l: 56, r: 14, t: 34, b: 34 }, L = m.l, R = W - m.r, T = m.t, B = H - m.b, g = '', n = o.groups.length, k = o.cols.length, gw = (R - L) / n;
    var sy = function(v){ return B - v / o.ymax * (B - T); };
    (o.yt || []).forEach(function(v){ g += S.line(L, sy(v), R, sy(v), { c: C.silver, w: 1 }) + S.text(L - 6, sy(v) + 4, fmtTick(v), { a: 'end', c: C.mid, s: 11 }); });
    g += S.line(L, B, R, B, { c: C.char, w: 1.2 }) + S.line(L, T, L, B, { c: C.char, w: 1.2 });
    o.groups.forEach(function(gr, i){ var bw = (gw - 16) / k; gr[1].forEach(function(v, j){ var x = L + i * gw + 8 + j * bw; g += S.rect(x + 1, sy(v), bw - 3, B - sy(v), { f: o.cols[j], s: o.cols[j], w: 0, r: 1 }) + S.text(x + bw / 2 - 1, sy(v) - 4, o.vf ? o.vf(v) : v.toFixed(2), { s: 10, b: true }); }); g += S.text(L + i * gw + gw / 2, B + 16, gr[0], { b: true, s: 11 }); });
    var lx = L; o.legend.forEach(function(t, j){ g += S.rect(lx, 10, 11, 11, { f: o.cols[j], s: o.cols[j], w: 0, r: 1 }) + S.text(lx + 16, 20, t, { a: 'start', s: 11 }); lx += 30 + t.length * 6.2; });
    (o.hlines || []).forEach(function(h){ g += S.line(L, sy(h.y), R, sy(h.y), { c: C.char, w: 1.3, d: '5 4' }); });
    if (o.yl) g += '<text transform="translate(13,' + ((T + B) / 2) + ') rotate(-90)" text-anchor="middle" fill="' + C.char + '" font-weight="700" font-size="12">' + o.yl + '</text>';
    return S.svg(W, H, g, o.cap);
  };
  /* flow: boxes [{x, y, w, h, t (string or array of lines), f, s, c}] and arrows [[x1, y1, x2, y2, label]], plus free texts */
  QZFIG.flow = function(o){
    var g = '';
    (o.boxes || []).forEach(function(b){ g += S.rect(b.x, b.y, b.w, b.h, { f: b.f || '#FFFFFF', s: b.s || C.char, w: b.sw || 1.4, r: b.r === undefined ? 5 : b.r, d: b.d }); var ls = Array.isArray(b.t) ? b.t : [b.t]; ls.forEach(function(t, i){ g += S.text(b.x + b.w / 2, b.y + b.h / 2 + 4 - (ls.length - 1) * 7.5 + i * 15, t, { c: b.c || C.char, b: i === 0 && b.b !== false && ls.length > 1, s: b.fs }); }); });
    (o.arrows || []).forEach(function(a){ g += S.arrow(a[0], a[1], a[2], a[3], { c: a[5] || C.char, d: a[6] }); if (a[4]) g += S.text((a[0] + a[2]) / 2, (a[1] + a[3]) / 2 - 6, a[4], { s: 11, c: C.mid }); });
    (o.lines || []).forEach(function(a){ g += S.line(a[0], a[1], a[2], a[3], { c: a[4] || C.char, w: a[5] || 1.4, d: a[6] }); });
    (o.circles || []).forEach(function(c){ g += S.circle(c[0], c[1], c[2], { f: c[3] || '#fff', s: c[4] || C.char, w: c[5] || 1.4 }); });
    (o.texts || []).forEach(function(t){ g += S.text(t.x, t.y, t.t, { a: t.a || 'middle', c: t.c || C.char, b: t.b, s: t.s, i: t.i }); });
    return S.svg(o.w || 600, o.h || 200, g, o.cap);
  };
  /* ECCS map: axes and cut-offs only. o.acid selects the acid or base layout, o.pt is the compound as [Papp, MW] */
  QZFIG.eccs = function(o){
    var W = 600, H = 270, L = 62, R = 580, T = 14, B = 224, g = '', sx = mapper([0.1, 100], true, L, R), sy = mapper([150, 800], false, B, T);
    [0.1, 1, 10, 100].forEach(function(v){ g += S.text(sx(v), B + 15, String(v), { c: C.mid, s: 11 }); });
    [200, 400, 600, 800].forEach(function(v){ g += S.text(L - 6, sy(v) + 4, String(v), { a: 'end', c: C.mid, s: 11 }); });
    g += S.rect(L, T, R - L, B - T, { f: '#fff', s: C.char, w: 1.2, r: 0 });
    g += S.line(sx(5), T, sx(5), B, { c: C.char, w: 1.3, d: '5 4' }) + S.text(sx(5) + 4, T + 12, 'cut-off', { a: 'start', s: 11, c: C.mid });
    if (o.acid !== false) g += S.line(L, sy(400), R, sy(400), { c: C.char, w: 1.3, d: '5 4' }) + S.text(R - 4, sy(400) - 5, 'molecular weight cut-off', { a: 'end', s: 11, c: C.mid });
    g += S.text((L + R) / 2, H - 22, 'Apparent permeability (10^-6 cm/s)', { b: true, s: 12 }) + '<text transform="translate(14,' + ((T + B) / 2) + ') rotate(-90)" text-anchor="middle" fill="' + C.char + '" font-weight="700" font-size="12">Molecular weight (Da)</text>';
    g += S.text(L + 4, H - 6, o.acid !== false ? 'Acids and zwitterions' : 'Bases and neutrals', { a: 'start', c: C.mid, s: 11, i: true });
    (o.labels || []).forEach(function(l){ g += S.text(sx(l[0]), sy(l[1]), l[2], { b: true, c: C.mid, s: 13 }); });
    if (o.pt) g += S.circle(sx(o.pt[0]), sy(o.pt[1]), 7, { f: C.char, s: '#fff', w: 2 }) + S.text(sx(o.pt[0]) + 11, sy(o.pt[1]) - 8, o.ptl || 'Compound', { a: 'start', b: true, s: 12 });
    return S.svg(W, H, g, o.cap);
  };
})();
