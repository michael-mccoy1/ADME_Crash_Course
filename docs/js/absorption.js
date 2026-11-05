"use strict";
/* Tab 09: absorption and bioavailability. Data: Obach (1999) for the hepatic first-pass limit; Hou (2007) human intestinal absorption,
   Wang (2016) Caco-2 permeability and AqSolDB (2019), all via Therapeutics Data Commons, with RDKit descriptors. */
var ABS = new Lesson('abs', 'Absorption');
ABS.noOpts = true;

function aLinScatter(el, pts, o){
  var g = cv(el), box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x;
  var sx = function(v){ return box.l + (v - o.xlo) / (o.xhi - o.xlo) * (box.r - box.l); }, sy = function(v){ return box.b - (v - o.ylo) / (o.yhi - o.ylo) * (box.b - box.t); };
  x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right';
  var yt = niceTicks(o.ylo, o.yhi, 5), xt = niceTicks(o.xlo, o.xhi, 6);
  yt.v.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 6, sy(v) + 4); });
  x.textAlign = 'center'; xt.v.forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(tickText(v, xt.step), sx(v), box.b + 16); });
  x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(o.xl, (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(o.yl, 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
  var hit = [];
  pts.forEach(function(p){ var px = sx(Math.min(Math.max(p.x, o.xlo), o.xhi)), py = sy(Math.min(Math.max(p.y, o.ylo), o.yhi)), on = o.sel === p.d; x.fillStyle = C.red; x.globalAlpha = on ? 1 : 0.35; x.beginPath(); x.arc(px, py, on ? 7 : 3, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(p.d.name, px + 10, py - 8); x.font = '12px Aptos, "Segoe UI", sans-serif'; } hit.push({ x: px, y: py, r: p.d }); });
  if (o.trend) { x.strokeStyle = C.char; x.lineWidth = 3; x.beginPath(); o.trend.forEach(function(t, i){ i ? x.lineTo(sx(t[0]), sy(t[1])) : x.moveTo(sx(t[0]), sy(t[1])); }); x.stroke(); }
  el._pts = hit; el._g = g; return g;
}
function aRank(a){ var o = a.map(function(v, i){ return [v, i]; }).sort(function(p, q){ return p[0] - q[0]; }), r = new Array(a.length), i = 0; while (i < o.length) { var j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; var m = (i + j) / 2 + 1; for (var k = i; k <= j; k++) r[o[k][1]] = m; i = j + 1; } return r; }
function aSpearman(xs, ys){ var a = aRank(xs), b = aRank(ys), n = a.length, ma = (n + 1) / 2, sa = 0, sb = 0, sc = 0, i; for (i = 0; i < n; i++) { sa += (a[i] - ma) * (a[i] - ma); sb += (b[i] - ma) * (b[i] - ma); sc += (a[i] - ma) * (b[i] - ma); } return sc / Math.sqrt(sa * sb); }
function aAUC(pos, neg){ var all = pos.concat(neg), r = aRank(all), sp = 0, i; for (i = 0; i < pos.length; i++) sp += r[i]; return (sp - pos.length * (pos.length + 1) / 2) / (pos.length * neg.length); }
function aRows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:3px 0;font-size:12px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }

/* ---------- step 2 ---------- */
ABS.add({ short: 'Hepatic first-pass limit', level: 'foundations', title: 'Hepatic first-pass limit',
  build: function(api){
    var q = 21, sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="450" style="width:624px;height:450px;cursor:pointer"></canvas>' + hepLegend()), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Liver blood flow <input type="range" class="q" min="15" max="30" step="1" value="' + q + '" style="width:120px"> <b class="qv"></b> mL/min/kg');
    function draw(){
      qs('.qv', c1).textContent = q;
      var rows = OBACH99.map(function(d){ return { d: d, fh: Math.max(0, 1 - d.obs / q) }; }).sort(function(a, b){ return b.fh - a.fh; });
      var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 10, t: 14, b: g.h - 80 }, bw = (box.r - box.l) / rows.length, hit = [];
      var sy = function(v){ return box.b - v * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right'; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(v.toFixed(2), box.l - 6, sy(v) + 4); });
      x.save(); x.translate(12, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Hepatic first-pass limit, Fh', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      rows.forEach(function(r, i){ var bx = box.l + i * bw, on = sel === r.d; x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = on ? 1 : 0.85; x.fillRect(bx + 1, sy(r.fh), bw - 2, box.b - sy(r.fh)); x.globalAlpha = 1; x.save(); x.translate(bx + bw / 2 + 3, box.b + 6); x.rotate(Math.PI / 3); x.textAlign = 'left'; x.fillStyle = on ? C.char : C.mid; x.font = (on ? '600 ' : '') + '10.5px Aptos, "Segoe UI", sans-serif'; x.fillText(r.d.name, 0, 0); x.restore(); hit.push({ x: bx + bw / 2, y: sy(r.fh / 2 + 0.0001) , r: r.d }); });
      x.font = '12px Aptos, "Segoe UI", sans-serif'; cvs._pts = hit; cvs._g = g;
      var n5 = rows.filter(function(r){ return r.fh < 0.5; }).length, n2 = rows.filter(function(r){ return r.fh < 0.2; }).length, n9 = rows.filter(function(r){ return r.fh >= 0.9; }).length;
      var r0 = sel && rows.filter(function(r){ return r.d === sel; })[0];
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Limit below 0.5</b><div class="v">' + n5 + ' of 29</div><div class="s">below 0.2: ' + n2 + '; at 0.9 or above: ' + n9 + '</div></div>';
      qs('.det', side).innerHTML = r0 ? '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + sel.name + '</div>' + aRows([['Observed CL, blood', hfx(sel.obs) + ' mL/min/kg'], ['Extraction', (sel.obs / q).toFixed(2)], ['Fh upper bound', r0.fh.toFixed(2)]]) : '<div class="hint" style="font-size:12px">Select a bar.</div>';
      api.stat(n5 + ' of 29 drugs have a first-pass limit below 0.5');
    }
    qs('.q', c1).addEventListener('input', function(){ q = +this.value; draw(); });
    cvs.addEventListener('click', function(ev){ var rc = cvs.getBoundingClientRect(), g = cvs._g, mx = (ev.clientX - rc.left) * g.w / rc.width, i = Math.floor((mx - 46) / ((g.w - 56) / 29)); var rows = OBACH99.map(function(d){ return { d: d, fh: Math.max(0, 1 - d.obs / q) }; }).sort(function(a, b){ return b.fh - a.fh; }); sel = i >= 0 && i < rows.length ? rows[i].d : null; draw(); });
    return { render: draw };
  } });

/* ---------- step 3 ---------- */
ABS.add({ short: 'Solubility and dose', level: 'applied', title: 'Solubility and dose number',
  build: function(api){
    var ld = 2, vol = 250;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="450" style="width:624px;height:450px"></canvas><div class="ro" style="font-size:12.5px;margin-top:6px"></div>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Dose <input type="range" class="d" min="0" max="3.3" step="0.05" value="' + ld + '" style="width:130px"> <b class="dv"></b> mg'), c2 = api.addControl('Volume <select class="v">' + hepOpts([['100', '100 mL'], ['250', '250 mL'], ['500', '500 mL']], '250') + '</select>');
    function draw(){
      var dose = Math.pow(10, ld); qs('.dv', c1).textContent = dose < 10 ? dose.toFixed(1) : Math.round(dose);
      var lo = -6, hi = 8, nb = 56, cnt = new Array(nb).fill(0), above = 0;
      AQ.forEach(function(a){ var S = Math.pow(10, a[0]) * a[1], d0 = (dose / vol) / S, l = Math.log10(d0); if (d0 > 1) above++; var k = Math.floor((l - lo) / (hi - lo) * nb); cnt[Math.max(0, Math.min(nb - 1, k))]++; });
      var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 14, t: 14, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.1, bw = (box.r - box.l) / nb;
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'center'; [-6, -4, -2, 0, 2, 4, 6, 8].forEach(function(v){ var xp = box.l + (v - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.t); x.lineTo(xp, box.b); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
      cnt.forEach(function(c, k){ var mid = lo + (k + 0.5) * (hi - lo) / nb, hg = c / ym * (box.b - box.t); x.fillStyle = mid > 0 ? C.warn : C.red; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); });
      var x0 = box.l + (0 - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.char; x.lineWidth = 1.6; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(x0, box.t); x.lineTo(x0, box.b); x.stroke(); x.setLineDash([]);
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('log10 of the dose number, D0', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(12, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Compounds', 0, 0); x.restore(); x.textAlign = 'left'; x.fillStyle = C.warn; x.fillText('D0 above 1: does not dissolve', x0 + 8, box.t + 14); x.font = '12px Aptos, "Segoe UI", sans-serif';
      qs('.ro', pn).innerHTML = 'Dose ' + (dose < 10 ? dose.toFixed(1) : Math.round(dose)) + ' mg in ' + vol + ' mL: <b>' + above.toLocaleString() + ' of ' + AQ.length.toLocaleString() + '</b> compounds (' + (100 * above / AQ.length).toFixed(1) + ' percent) have D0 above 1.';
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Dose number above 1</b><div class="v">' + (100 * above / AQ.length).toFixed(0) + ' percent</div><div class="s">of ' + AQ.length.toLocaleString() + ' compounds</div></div><div class="hint" style="font-size:11.5px">D0 = (dose / volume) / S, with S in mg/mL from logS and MW.</div>';
      api.stat((100 * above / AQ.length).toFixed(0) + ' percent with D0 above 1');
    }
    qs('.d', c1).addEventListener('input', function(){ ld = +this.value; draw(); }); qs('.v', c2).addEventListener('change', function(){ vol = +this.value; draw(); });
    vol = 250; return { render: draw };
  } });

/* ---------- step 4 ---------- */
ABS.add({ short: 'pH-dependent solubility', level: 'applied', title: 'Solubility and pH',
  build: function(api){
    var typ = 'base', pka = 5, ls0 = -2, dose = 100, gp = 1.2, ip = 6.5, vol = 250;
    var pn = api.el('pn', 'left:28px;top:16px;width:600px;height:508px;padding:8px', '<canvas width="584" height="490" style="width:584px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:644px;top:16px;width:288px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Type <select class="t">' + hepOpts([['base', 'Weak base'], ['acid', 'Weak acid'], ['neutral', 'Neutral']], typ) + '</select>'), c2 = api.addControl('pKa <input type="range" class="k" min="1" max="12" step="0.1" value="' + pka + '" style="width:100px"> <b class="kv"></b>'), c3 = api.addControl('S0 <input type="range" class="s" min="-4" max="2" step="0.1" value="' + ls0 + '" style="width:100px"> <b class="sv"></b> mg/mL'), c4 = api.addControl('Dose <select class="d">' + hepOpts([['10', '10 mg'], ['50', '50 mg'], ['100', '100 mg'], ['250', '250 mg'], ['500', '500 mg']], '100') + '</select>'), c5 = api.addControl('Gastric pH <input type="range" class="g" min="1" max="6" step="0.1" value="' + gp + '" style="width:80px"> <b class="gv"></b>'), c6 = api.addControl('Intestinal pH <input type="range" class="i" min="5" max="8" step="0.1" value="' + ip + '" style="width:80px"> <b class="iv"></b>');
    function S(ph){ var s0 = Math.pow(10, ls0); return typ === 'acid' ? s0 * (1 + Math.pow(10, ph - pka)) : (typ === 'base' ? s0 * (1 + Math.pow(10, pka - ph)) : s0); }
    function draw(){
      qs('.kv', c2).textContent = pka.toFixed(1); qs('.sv', c3).textContent = Math.pow(10, ls0).toPrecision(2); qs('.gv', c5).textContent = gp.toFixed(1); qs('.iv', c6).textContent = ip.toFixed(1);
      var g = cv(cvs), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, lo = 1, hi = 8, ylo = -3, yhi = 4;
      var sx = function(p){ return box.l + (p - lo) / (hi - lo) * (box.r - box.l); }, sy = function(l){ return box.b - (l - ylo) / (yhi - ylo) * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right'; for (var e = ylo; e <= yhi; e++) { x.beginPath(); x.moveTo(box.l, sy(e)); x.lineTo(box.r, sy(e)); x.stroke(); x.fillText(String(e), box.l - 6, sy(e) + 4); }
      x.textAlign = 'center'; for (var p = 1; p <= 8; p++) { x.beginPath(); x.moveTo(sx(p), box.t); x.lineTo(sx(p), box.b); x.stroke(); x.fillText(String(p), sx(p), box.b + 16); }
      var d0 = function(ph){ return (dose / vol) / S(ph); }, fm = function(v){ return (v < 0.001 || v >= 10000) ? v.toExponential(2) : v.toPrecision(3); };
      x.strokeStyle = C.char; x.setLineDash([5, 4]); x.lineWidth = 1.4; x.beginPath(); x.moveTo(box.l, sy(0)); x.lineTo(box.r, sy(0)); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.textAlign = 'left'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('D0 = 1', box.l + 6, sy(0) - 5);
      x.strokeStyle = C.red; x.lineWidth = 2.8; x.beginPath(); for (var i = 0; i <= 140; i++) { var ph = lo + (hi - lo) * i / 140, l = Math.max(ylo, Math.min(yhi, Math.log10(d0(ph)))); i ? x.lineTo(sx(ph), sy(l)) : x.moveTo(sx(ph), sy(l)); } x.stroke();
      [[gp, 'Gastric'], [ip, 'Intestinal']].forEach(function(m){ var l = Math.max(ylo, Math.min(yhi, Math.log10(d0(m[0])))); x.strokeStyle = C.warn; x.lineWidth = 1.4; x.beginPath(); x.moveTo(sx(m[0]), box.t); x.lineTo(sx(m[0]), box.b); x.stroke(); x.fillStyle = C.warn; x.beginPath(); x.arc(sx(m[0]), sy(l), 6, 0, 6.3); x.fill(); x.fillStyle = C.warn; x.textAlign = 'left'; x.fillText(m[1], sx(m[0]) + 6, box.t + 14); });
      x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('pH', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('log10 of the dose number, D0', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var dg = d0(gp), di = d0(ip);
      qs('.tl', side).innerHTML = [['Gastric pH ' + gp.toFixed(1), 'S ' + fm(S(gp)) + ' mg/mL, D0 ' + fm(dg)], ['Intestinal pH ' + ip.toFixed(1), 'S ' + fm(S(ip)) + ' mg/mL, D0 ' + fm(di)], ['Dissolved at stomach pH', dg <= 1 ? 'yes, D0 is 1 or below' : 'no, D0 above 1'], ['Dissolved at intestinal pH', di <= 1 ? 'yes, D0 is 1 or below' : 'no, D0 above 1'], ['Solubility ratio, stomach to intestine', fm(S(gp) / S(ip))]].map(function(t){ return '<div style="border-top:1px solid ' + C.silver + ';padding:6px 0;font-size:12.5px"><span style="color:' + C.mid + '">' + t[0] + '</span><br><b>' + t[1] + '</b></div>'; }).join('') + '<div class="hint" style="font-size:11.5px;margin-top:6px">Volume ' + vol + ' mL at every pH.</div>';
      api.stat('D0 at gastric pH ' + fm(dg) + ', at intestinal pH ' + fm(di));
    }
    qs('.t', c1).addEventListener('change', function(){ typ = this.value; draw(); }); qs('.k', c2).addEventListener('input', function(){ pka = +this.value; draw(); }); qs('.s', c3).addEventListener('input', function(){ ls0 = +this.value; draw(); }); qs('.d', c4).addEventListener('change', function(){ dose = +this.value; draw(); }); qs('.g', c5).addEventListener('input', function(){ gp = +this.value; draw(); }); qs('.i', c6).addEventListener('input', function(){ ip = +this.value; draw(); });
    return { render: draw };
  } });

/* ---------- step 5 ---------- */
ABS.add({ short: 'Permeability descriptors', level: 'applied', title: 'Permeability and structure',
  build: function(api){
    var dk = 'tpsa', sel = null, L = { tpsa: ['Topological polar surface area (A^2)', 0, 320], hbd: ['Hydrogen-bond donors', 0, 14], mw: ['Molecular weight (Da)', 0, 1200], logp: ['Crippen logP', -6, 10], hba: ['Hydrogen-bond acceptors', 0, 24] };
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Descriptor <select class="k">' + hepOpts([['tpsa', 'TPSA'], ['hbd', 'H-bond donors'], ['mw', 'Molecular weight'], ['logp', 'Crippen logP'], ['hba', 'H-bond acceptors']], dk) + '</select>');
    function draw(){
      var lab = L[dk], pts = CACO.map(function(r){ return { x: r[dk], y: r.y, d: r }; }), srt = pts.slice().sort(function(a, b){ return a.x - b.x; }), nb = 12, tr = [];
      for (var b = 0; b < nb; b++) { var seg = srt.slice(Math.floor(b * srt.length / nb), Math.floor((b + 1) * srt.length / nb)); if (!seg.length) continue; var ys = seg.map(function(p){ return p.y; }).sort(function(p, q){ return p - q; }); tr.push([seg.reduce(function(s, p){ return s + p.x; }, 0) / seg.length, ys[Math.floor(ys.length / 2)]]); }
      aLinScatter(cvs, pts, { xlo: lab[1], xhi: lab[2], ylo: -8.5, yhi: -3, xl: lab[0], yl: 'Caco-2 log10 Papp (cm/s)', sel: sel, trend: tr });
      var rho = aSpearman(pts.map(function(p){ return p.x; }), pts.map(function(p){ return p.y; }));
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Spearman correlation</b><div class="v">' + rho.toFixed(2) + '</div><div class="s">' + CACO.length + ' compounds</div></div>';
      qs('.det', side).innerHTML = sel ? '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + sel.name + '</div>' + aRows([['log10 Papp', sel.y.toFixed(2)], ['TPSA', sel.tpsa], ['Donors, acceptors', sel.hbd + ', ' + sel.hba], ['MW', sel.mw], ['Crippen logP', sel.logp]]) : '<div class="hint" style="font-size:12px">Select a point.</div>';
      api.stat('Spearman ' + rho.toFixed(2) + ' for ' + lab[0]);
    }
    qs('.k', c1).addEventListener('change', function(){ dk = this.value; draw(); }); cvs.addEventListener('click', function(ev){ sel = hepHit(cvs, ev); draw(); });
    return { render: draw };
  } });

/* ---------- step 6 ---------- */
ABS.add({ short: 'Property rules', level: 'advanced', title: 'Property rules for absorption',
  build: function(api){
    var T = { mw: [true, 500], logp: [true, 5], hbd: [true, 5], hba: [true, 10], tpsa: [false, 140], rb: [false, 10] }, need = 1, sel = 'lip1';
    var PRE = { lip1: ['Rule of five, 1 violation', { mw: 1, logp: 1, hbd: 1, hba: 1, tpsa: 0, rb: 0 }, 1], lip2: ['Rule of five, 2 violations', { mw: 1, logp: 1, hbd: 1, hba: 1, tpsa: 0, rb: 0 }, 2], veb: ['Veber, 1 violation', { mw: 0, logp: 0, hbd: 0, hba: 0, tpsa: 1, rb: 1 }, 1], tp: ['TPSA above 140 only', { mw: 0, logp: 0, hbd: 0, hba: 0, tpsa: 1, rb: 0 }, 1], hd: ['More than 5 donors only', { mw: 0, logp: 0, hbd: 1, hba: 0, tpsa: 0, rb: 0 }, 1] };
    var pn = api.el('pn', 'left:28px;top:16px;width:430px;height:508px;padding:8px', '<canvas class="a" width="414" height="330" style="width:414px;height:330px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>');
    var pn2 = api.el('pn', 'left:474px;top:16px;width:458px;height:508px;padding:8px', '<canvas class="b" width="442" height="250" style="width:442px;height:250px"></canvas><div class="th" style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;font-size:12px"></div>');
    var ca = qs('.a', pn), cb = qs('.b', pn2), th = qs('.th', pn2);
    var KEY = [['mw', 'MW above', 10], ['logp', 'logP above', 0.5], ['hbd', 'Donors above', 1], ['hba', 'Acceptors above', 1], ['tpsa', 'TPSA above', 5], ['rb', 'Rot. bonds above', 1]];
    th.innerHTML = KEY.map(function(k){ return '<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-k="' + k[0] + '"> ' + k[1] + ' <input type="number" data-t="' + k[0] + '" step="' + k[2] + '" style="width:64px"></label>'; }).join('');
    var c1 = api.addControl('Preset <select class="p">' + hepOpts(Object.keys(PRE).map(function(k){ return [k, PRE[k][0]]; }), sel) + '</select>'), c2 = api.addControl('Violations to flag <select class="n">' + hepOpts([['1', '1'], ['2', '2'], ['3', '3']], '1') + '</select>');
    function sync(){ KEY.forEach(function(k){ qs('[data-k="' + k[0] + '"]', th).checked = T[k[0]][0]; qs('[data-t="' + k[0] + '"]', th).value = T[k[0]][1]; }); qs('.n', c2).value = String(need); }
    function setPreset(id){ var p = PRE[id]; KEY.forEach(function(k){ T[k[0]][0] = !!p[1][k[0]]; }); T.mw[1] = 500; T.logp[1] = 5; T.hbd[1] = 5; T.hba[1] = 10; T.tpsa[1] = 140; T.rb[1] = 10; need = p[2]; sync(); }
    function draw(){
      var tp = 0, fn = 0, fp = 0, tn = 0;
      HIA.forEach(function(h){ var v = 0; KEY.forEach(function(k){ if (T[k[0]][0] && h[k[0]] > T[k[0]][1]) v++; }); var flag = v >= need; if (h.y === 0) { flag ? tp++ : fn++; } else { flag ? fp++ : tn++; } });
      var n = HIA.length, acc = (tp + tn) / n, base = 500 / n, sens = tp / 78, spec = tn / 500;
      var g = cv(ca), x = g.x, box = { l: 60, r: g.w - 14, t: 30, b: g.h - 30 }, bw = (box.r - box.l) / 2 - 24;
      [[0, 'Poor absorption (78)', fn, tp, C.tint, C.red], [1, 'Good absorption (500)', tn, fp, C.silver, C.warn]].forEach(function(c){ var bx = box.l + c[0] * ((box.r - box.l) / 2) + 12, tot = c[2] + c[3], hOk = (box.b - box.t) * (c[0] === 0 ? c[3] : c[2]) / tot, hBad = (box.b - box.t) - hOk;
        x.fillStyle = c[0] === 0 ? C.red : C.silver; x.fillRect(bx, box.b - hOk, bw, hOk); x.fillStyle = c[0] === 0 ? C.tint : C.warn; x.fillRect(bx, box.t, bw, hBad); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(c[1], bx + bw / 2, box.t - 10);
        x.fillStyle = c[0] === 0 ? '#fff' : C.char; x.fillText((c[0] === 0 ? 'flagged poor ' + tp : 'flagged good ' + tn), bx + bw / 2, box.b - hOk / 2 + 4); x.fillStyle = C.char; x.fillText((c[0] === 0 ? 'missed ' + fn : 'flagged poor ' + fp), bx + bw / 2, box.t + hBad / 2 + 4); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
      qs('.ra', pn).innerHTML = 'Poor compounds caught: <b>' + tp + ' of 78</b> (' + (100 * sens).toFixed(0) + ' percent). Good compounds flagged: <b>' + fp + ' of 500</b>. Accuracy <b>' + (100 * acc).toFixed(1) + ' percent</b>, against <b>' + (100 * base).toFixed(1) + ' percent</b> for calling every compound good. Balanced accuracy <b>' + (100 * (sens + spec) / 2).toFixed(1) + ' percent</b>.';
      var g2 = cv(cb), x2 = g2.x, b2 = { l: 90, r: g2.w - 40, t: 26, b: g2.h - 20 }, ds = [['tpsa', 'TPSA'], ['hbd', 'Donors'], ['mw', 'MW'], ['hba', 'Acceptors'], ['rb', 'Rot. bonds'], ['logp', 'Crippen logP']], bh = (b2.b - b2.t) / ds.length, sxa = function(a){ return b2.l + a * (b2.r - b2.l); };
      x2.fillStyle = C.char; x2.font = '600 12px Aptos, "Segoe UI", sans-serif'; x2.textAlign = 'left'; x2.fillText('Area under the ROC curve for poor against good', 6, 14); x2.font = '12px Aptos, "Segoe UI", sans-serif';
      var poor = HIA.filter(function(h){ return h.y === 0; }), good = HIA.filter(function(h){ return h.y === 1; });
      x2.strokeStyle = C.silver; x2.lineWidth = 1; [0, 0.5, 1].forEach(function(v){ x2.beginPath(); x2.moveTo(sxa(v), b2.t); x2.lineTo(sxa(v), b2.b); x2.stroke(); x2.fillStyle = C.mid; x2.textAlign = 'center'; x2.fillText(v.toFixed(1), sxa(v), b2.b + 14); });
      ds.forEach(function(d, i){ var a = aAUC(poor.map(function(h){ return h[d[0]]; }), good.map(function(h){ return h[d[0]]; })), y = b2.t + i * bh + 4; x2.fillStyle = a < 0.5 ? C.warn : C.red; x2.fillRect(Math.min(sxa(0.5), sxa(a)), y, Math.abs(sxa(a) - sxa(0.5)), bh - 10); x2.fillStyle = C.char; x2.textAlign = 'right'; x2.fillText(d[1], b2.l - 8, y + (bh - 10) / 2 + 4); x2.textAlign = 'left'; x2.fillText(a.toFixed(3), Math.max(sxa(a), sxa(0.5)) + 6, y + (bh - 10) / 2 + 4); });
      api.stat('Accuracy ' + (100 * acc).toFixed(1) + ' percent, baseline ' + (100 * base).toFixed(1) + ' percent');
    }
    th.addEventListener('change', function(e){ var t = e.target; if (t.dataset.k) T[t.dataset.k][0] = t.checked; if (t.dataset.t) T[t.dataset.t][1] = +t.value; draw(); });
    qs('.p', c1).addEventListener('change', function(){ setPreset(this.value); draw(); }); qs('.n', c2).addEventListener('change', function(){ need = +this.value; draw(); });
    setPreset('lip1');
    return { render: draw };
  } });
