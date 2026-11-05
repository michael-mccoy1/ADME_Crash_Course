"use strict";
/* Tab 08: distribution. Volume of distribution at steady state, tissue binding, ionization class, half-life, blood to plasma ratio.
   Oie-Tozer constants and the Lombardo fut equation as stated in Coutinho et al., Pharm Res 41:1121 (2024), Eq. 1 and 2. Data: Obach et al. (2008) via ChEMBL. */
var DIS = new Lesson('dist', 'Distribution');
DIS.noOpts = true;

var OT = { Vp: 0.0436, Ve: 0.151, Re: 1.4, Vr: 0.38 };
var DCLS = { acid: ['Acids', '#B4561B'], base: ['Bases', '#0F6E8C'], zwit: ['Zwitterions', '#34373F'], none: ['No pKa reported', '#A1B1C4'] };
function otParts(fup, fut, p){
  p = p || OT; return { plasma: p.Vp, ecf: fup * p.Ve + p.Re * p.Vp * (1 - fup), tissue: p.Vr * fup / fut };
}
function otVss(fup, fut, p){ var q = otParts(fup, fut, p); return q.plasma + q.ecf + q.tissue; }
function otImplied(d){ var den = d.vss - OT.Vp - d.fu * OT.Ve - OT.Re * OT.Vp * (1 - d.fu); return den > 0 ? OT.Vr * d.fu / den : null; }
function dClass(d){ return d.pka != null && d.pkb != null ? 'zwit' : (d.pka != null ? 'acid' : (d.pkb != null ? 'base' : 'none')); }
function dFi(d){ var fa = d.pka != null ? 1 / (1 + Math.pow(10, d.pka - 7.4)) : 0, fb = d.pkb != null ? 1 / (1 + Math.pow(10, 7.4 - d.pkb)) : 0; return 1 - (1 - fa) * (1 - fb); }
function lombFut(d){ return Math.min(1, Math.pow(10, 0.0080 - 0.2294 * d.logd - 0.9311 * dFi(d) + 0.8885 * Math.log10(d.fu))); }
var DALL = OBACH08.filter(function(d){ return d.fu; }), DSET = DALL.filter(function(d){ return d.logd != null; });
function dScore(rows){
  var n = rows.length, w2 = 0, s = 0, sa = 0; rows.forEach(function(r){ var l = Math.log10(r.p / r.o); s += l; sa += Math.abs(l); if (Math.abs(l) <= Math.log10(2)) w2++; });
  return { n: n, within2: w2, gmfe: n ? Math.pow(10, sa / n) : NaN, bias: n ? Math.pow(10, s / n) : NaN };
}
function dTicks(lo, hi){ var out = []; for (var e = Math.ceil(lo); e <= Math.floor(hi); e++) out.push(Math.pow(10, e)); return out.map(function(v){ return +v.toPrecision(6); }); }

/* Log-log scatter. pts: [{ x, y, col, d }]. o: { xlo, xhi, ylo, yhi (log10), xl, yl, curves: [{ fn, col, label, dash }], band, sel } */
function dScatter(el, pts, o){
  var g = cv(el), box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x;
  var A = logAxes(g, box, o.xlo, o.xhi, o.xl, o.yl, o.ylo, o.yhi, dTicks(o.xlo, o.xhi), dTicks(o.ylo, o.yhi));
  if (o.band) { x.fillStyle = 'rgba(15,110,140,.09)'; var lo = Math.pow(10, Math.max(o.xlo, o.ylo)), hi = Math.pow(10, Math.min(o.xhi, o.yhi)); x.beginPath(); x.moveTo(A.sx(lo), A.sy(lo * 2)); x.lineTo(A.sx(hi), A.sy(hi * 2)); x.lineTo(A.sx(hi), A.sy(hi / 2)); x.lineTo(A.sx(lo), A.sy(lo / 2)); x.closePath(); x.fill(); x.strokeStyle = C.mid; x.lineWidth = 1.2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(A.sx(lo), A.sy(lo)); x.lineTo(A.sx(hi), A.sy(hi)); x.stroke(); x.setLineDash([]); }
  (o.curves || []).forEach(function(c, k){ x.strokeStyle = c.col; x.lineWidth = 2; x.setLineDash(c.dash || []); x.beginPath(); var first = true; for (var i = 0; i <= 120; i++) { var xv = Math.pow(10, o.xlo + (o.xhi - o.xlo) * i / 120), yv = c.fn(xv); if (yv < Math.pow(10, o.ylo) || yv > Math.pow(10, o.yhi)) { first = true; continue; } first ? x.moveTo(A.sx(xv), A.sy(yv)) : x.lineTo(A.sx(xv), A.sy(yv)); first = false; } x.stroke(); x.setLineDash([]); });
  var hit = [];
  pts.forEach(function(p){ var px = A.sx(Math.min(Math.max(p.x, Math.pow(10, o.xlo) * 1.001), Math.pow(10, o.xhi) * 0.999)), py = A.sy(Math.min(Math.max(p.y, Math.pow(10, o.ylo) * 1.001), Math.pow(10, o.yhi) * 0.999)), on = o.sel && o.sel === p.d;
    x.fillStyle = p.col; x.globalAlpha = on ? 1 : 0.65; x.beginPath(); x.arc(px, py, on ? 7 : 3.6, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(p.d.name || p.d.id, px + 10, py - 8); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
    hit.push({ x: px, y: py, r: p.d }); });
  var lx = box.l + 8; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left';
  (o.curves || []).forEach(function(c){ if (!c.label) return; x.strokeStyle = c.col; x.lineWidth = 2; x.setLineDash(c.dash || []); x.beginPath(); x.moveTo(lx, box.t + 10); x.lineTo(lx + 14, box.t + 10); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.fillText(c.label, lx + 18, box.t + 14); lx += x.measureText(c.label).width + 34; });
  x.font = '12px Aptos, "Segoe UI", sans-serif'; el._pts = hit; el._g = g; return g;
}
function dHit(el, ev){ return hepHit(el, ev); }
function dRows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:3px 0;font-size:12px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
function dLegend(keys){ return '<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;margin-top:4px">' + keys.map(function(k){ return '<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + DCLS[k][1] + ';margin-right:5px"></i>' + DCLS[k][0] + '</span>'; }).join('') + '</div>'; }
function dDrugDetail(d){
  if (!d) return '<div class="hint" style="font-size:12px">Select a point to read its values.</div>';
  var im = d.fu ? otImplied(d) : null;
  return '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + (d.name || d.id) + '</div>' + dRows([['Vss', hfx(d.vss) + ' L/kg'], ['CL', hfx(d.cl) + ' mL/min/kg'], ['fu plasma', d.fu != null ? d.fu : 'not reported'], ['Half-life', hfx(d.t12) + ' h'], ['logD 7.4', d.logd != null ? d.logd : 'not reported'], ['pKa acid, base', (d.pka != null ? d.pka : 'none') + ', ' + (d.pkb != null ? d.pkb : 'none')], ['Implied fut', d.fu ? (im ? im.toFixed(3) : 'undefined, Vss below the model minimum') : 'n/a']]);
}

/* ---------- step 1 ---------- */
DIS.add({ short: 'Volume from binding', level: 'foundations', title: 'Volume from plasma and tissue binding',
  build: function(api){
    var lf = -1.5, lt = -1;
    var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<h4>Terms at the chosen values</h4><div class="tm"></div>');
    var c1 = api.addControl('fup <input type="range" class="f" min="-3" max="0" step="0.05" value="' + lf + '" style="width:140px"> <b class="fv"></b>'), c2 = api.addControl('fut <input type="range" class="t" min="-3" max="0" step="0.05" value="' + lt + '" style="width:140px"> <b class="tv"></b>');
    function draw(){
      var fup = Math.pow(10, lf), fut = Math.pow(10, lt); qs('.fv', c1).textContent = fup < 0.1 ? fup.toFixed(3) : fup.toFixed(2); qs('.tv', c2).textContent = fut < 0.1 ? fut.toFixed(3) : fut.toFixed(2);
      var pts = [], g = cv(cvs), box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x;
      var A = logAxes(g, box, -3, 0, 'Fraction unbound in tissue (fut)', 'Vss (L/kg)', -1, 2, [0.001, 0.01, 0.1, 1], [0.1, 1, 10, 100]);
      [[0.001, '#A1B1C4'], [0.01, '#8CC7D9'], [0.1, '#4C93AC'], [1, '#0A4A5E']].forEach(function(c){ x.strokeStyle = c[1]; x.lineWidth = 2; x.beginPath(); for (var i = 0; i <= 100; i++) { var ft = Math.pow(10, -3 + 3 * i / 100), v = otVss(c[0], ft); i ? x.lineTo(A.sx(ft), A.sy(v)) : x.moveTo(A.sx(ft), A.sy(v)); } x.stroke(); x.fillStyle = c[1]; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('fup ' + c[0], A.sx(0.0012) + 4, A.sy(otVss(c[0], 0.0012)) - 5); });
      var v = otVss(fup, fut); x.font = '12px Aptos, "Segoe UI", sans-serif';
      x.fillStyle = C.char; x.beginPath(); x.arc(A.sx(fut), A.sy(v), 7, 0, 6.3); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke();
      var q = otParts(fup, fut), tot = q.plasma + q.ecf + q.tissue;
      qs('.tm', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Vss</b><div class="v">' + hfx(tot) + ' L/kg</div><div class="s">' + hfx(tot * 70) + ' L for a 70 kg adult</div></div>' + [['Plasma', q.plasma], ['Extracellular', q.ecf], ['Tissue', q.tissue]].map(function(t){ var pc = 100 * t[1] / tot; return '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:12.5px"><span>' + t[0] + '</span><b>' + hfx(t[1]) + ' L/kg, ' + pc.toFixed(0) + ' percent</b></div><div style="height:9px;background:' + C.light + ';border-radius:3px"><div style="height:9px;width:' + pc.toFixed(1) + '%;background:' + C.red + ';border-radius:3px"></div></div></div>'; }).join('');
      api.stat('Vss ' + hfx(tot) + ' L/kg');
    }
    qs('.f', c1).addEventListener('input', function(){ lf = +this.value; draw(); }); qs('.t', c2).addEventListener('input', function(){ lt = +this.value; draw(); });
    return { render: draw };
  } });

/* ---------- step 2 ---------- */
DIS.add({ short: 'Implied tissue binding', level: 'foundations', title: 'Implied tissue binding',
  build: function(api){
    var sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:620px;height:508px;padding:8px', '<canvas width="604" height="470" style="width:604px;height:470px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:664px;top:16px;width:268px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    function draw(){
      var pts = DALL.map(function(d){ return { x: d.fu, y: d.vss, col: DCLS[d.logd != null ? dClass(d) : 'none'][1], d: d }; }), und = 0, over = 0, imp = [];
      DALL.forEach(function(d){ var m = otImplied(d); if (m === null) und++; else { imp.push(m); if (m > 1) over++; } }); imp.sort(function(a, b){ return a - b; });
      dScatter(cvs, pts, { xlo: -4, xhi: 0, ylo: -1.5, yhi: 1.7, xl: 'Fraction unbound in plasma (fup)', yl: 'Observed Vss (L/kg)', sel: sel, curves: [1, 0.1, 0.01, 0.001].map(function(ft, i){ return { fn: function(fu){ return otVss(fu, ft); }, col: ['#0A4A5E', '#4C93AC', '#8CC7D9', '#B4561B'][i], label: 'fut ' + ft }; }) });
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Drugs with fup</b><div class="v">' + DALL.length + '</div><div class="s">undefined implied fut: ' + und + '; above 1: ' + over + '</div></div><div class="score" style="margin-bottom:8px"><b>Median implied fut</b><div class="v">' + imp[Math.floor(imp.length / 2)].toFixed(3) + '</div><div class="s">over ' + imp.length + ' drugs with a defined value</div></div>';
      qs('.det', side).innerHTML = dDrugDetail(sel); api.stat(DALL.length + ' drugs');
    }
    cvs.addEventListener('click', function(ev){ sel = dHit(cvs, ev); draw(); });
    return { render: draw };
  } });

/* ---------- step 3 ---------- */
DIS.add({ short: 'Predicting tissue binding', level: 'applied', title: 'Predicting tissue binding',
  build: function(api){
    var src = 'lomb', sel = null, med;
    var im = DSET.map(otImplied).filter(function(v){ return v !== null; }).sort(function(a, b){ return a - b; }); med = im[Math.floor(im.length / 2)];
    var pn = api.el('pn', 'left:28px;top:16px;width:500px;height:508px;padding:8px', '<canvas width="484" height="450" style="width:484px;height:450px;cursor:pointer"></canvas>' + dLegend(['acid', 'base', 'zwit', 'none'])), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:544px;top:16px;width:388px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('fut from <select class="s">' + hepOpts([['one', 'No tissue binding (fut = 1)'], ['lomb', 'Lombardo equation'], ['const', 'Median implied fut']], src) + '</select>');
    function futOf(d){ return src === 'one' ? 1 : (src === 'const' ? med : lombFut(d)); }
    function draw(){
      var rows = DSET.map(function(d){ return { d: d, p: otVss(d.fu, futOf(d)), o: d.vss }; });
      dScatter(cvs, rows.map(function(r){ return { x: r.o, y: r.p, col: DCLS[dClass(r.d)][1], d: r.d }; }), { xlo: -1.5, xhi: 1.7, ylo: -1.5, yhi: 1.7, xl: 'Observed Vss (L/kg)', yl: 'Predicted Vss (L/kg)', band: true, sel: sel });
      var all = dScore(rows), tab = ['acid', 'base', 'zwit', 'none'].map(function(k){ var s = dScore(rows.filter(function(r){ return dClass(r.d) === k; })); return '<tr><td><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + DCLS[k][1] + ';margin-right:6px"></i>' + DCLS[k][0] + '</td><td>' + s.n + '</td><td>' + s.within2 + '</td><td>' + s.gmfe.toFixed(2) + '</td><td>' + s.bias.toFixed(2) + '</td></tr>'; }).join('');
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>All 163 drugs</b><div class="v">' + all.within2 + ' within 2-fold</div><div class="s">average fold error ' + all.gmfe.toFixed(2) + ', bias ' + all.bias.toFixed(2) + '</div></div><table style="width:100%;font-size:12px;border-collapse:collapse"><tr style="text-align:left;color:' + C.mid + '"><th>Class</th><th>n</th><th>2-fold</th><th>Error</th><th>Bias</th></tr>' + tab + '</table><div class="hint" style="font-size:11.5px;margin-top:6px">Median implied fut: ' + med.toFixed(3) + '. Class from the AstraZeneca pKa values.</div>';
      var r0 = sel && rows.filter(function(r){ return r.d === sel; })[0];
      qs('.det', side).innerHTML = r0 ? '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + (sel.name || sel.id) + '</div>' + dRows([['Observed Vss', hfx(r0.o) + ' L/kg'], ['Predicted Vss', hfx(r0.p) + ' L/kg'], ['Fold error', hfold(r0.p, r0.o)], ['fut used', futOf(sel).toFixed(4)], ['fu plasma, logD', sel.fu + ', ' + sel.logd], ['Implied fut', otImplied(sel) ? otImplied(sel).toFixed(3) : 'undefined']]) : '<div class="hint" style="font-size:12px;margin-top:8px">Select a point to read its values.</div>';
      api.stat(all.within2 + ' of ' + all.n + ' within 2-fold, average fold error ' + all.gmfe.toFixed(2));
    }
    qs('.s', c1).addEventListener('change', function(){ src = this.value; draw(); });
    cvs.addEventListener('click', function(ev){ sel = dHit(cvs, ev); draw(); });
    return { render: draw };
  } });

/* ---------- step 4 ---------- */
DIS.add({ short: 'Ionization class', level: 'applied', title: 'Ionization class and distribution',
  build: function(api){
    var yv = 'vss', sel = null, lab = { vss: ['Vss (L/kg)', -1.5, 1.7], fu: ['Fraction unbound in plasma', -4, 0.2], logd: ['logD at pH 7.4', -3, 6] };
    var pn = api.el('pn', 'left:28px;top:16px;width:620px;height:508px;padding:8px', '<canvas width="604" height="470" style="width:604px;height:470px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:664px;top:16px;width:268px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Vertical axis <select class="y">' + hepOpts([['vss', 'Vss'], ['fu', 'fup'], ['logd', 'logD']], yv) + '</select>');
    var KEYS = ['acid', 'base', 'zwit', 'none'];
    function val(d){ return yv === 'vss' ? d.vss : (yv === 'fu' ? d.fu : d.logd); }
    function draw(){
      var set = OBACH08.filter(function(d){ return d.logd != null && val(d) != null && val(d) > 0 || (d.logd != null && yv === 'logd'); }), g = cv(cvs), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, L = lab[yv], isLog = yv !== 'logd';
      var sy = function(v){ var lv = isLog ? Math.log10(v) : v; return box.b - (lv - L[1]) / (L[2] - L[1]) * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right';
      if (isLog) { for (var e = Math.ceil(L[1]); e <= Math.floor(L[2]); e++) { var yy = sy(Math.pow(10, e)); x.beginPath(); x.moveTo(box.l, yy); x.lineTo(box.r, yy); x.stroke(); x.fillText(String(+Math.pow(10, e).toPrecision(3)), box.l - 6, yy + 4); } } else { for (var t = Math.ceil(L[1]); t <= Math.floor(L[2]); t += 1) { var y2 = sy(t); x.beginPath(); x.moveTo(box.l, y2); x.lineTo(box.r, y2); x.stroke(); x.fillText(String(t), box.l - 6, y2 + 4); } }
      x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(L[0], 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var cw = (box.r - box.l) / KEYS.length, hit = [], rnd = rng(11), meds = {};
      KEYS.forEach(function(k, i){ var cx = box.l + cw * (i + 0.5), items = set.filter(function(d){ return dClass(d) === k; }), vs = items.map(val).sort(function(a, b){ return a - b; });
        items.forEach(function(d){ var px = cx + (rnd() - 0.5) * (cw - 30), py = sy(val(d)), on = sel === d; x.fillStyle = DCLS[k][1]; x.globalAlpha = on ? 1 : 0.65; x.beginPath(); x.arc(px, py, on ? 7 : 3.6, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } hit.push({ x: px, y: py, r: d }); });
        if (vs.length) { var m = vs[Math.floor(vs.length / 2)]; meds[k] = m; x.strokeStyle = C.char; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - cw / 2 + 12, sy(m)); x.lineTo(cx + cw / 2 - 12, sy(m)); x.stroke(); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(DCLS[k][0] + ' (' + items.length + ')', cx, box.b + 18); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
      cvs._pts = hit; cvs._g = g;
      qs('.tl', side).innerHTML = '<h4>Median by group</h4>' + dRows(KEYS.map(function(k){ return [DCLS[k][0], meds[k] !== undefined ? (yv === 'logd' ? meds[k].toFixed(1) : hfx(meds[k])) : 'n/a']; }));
      qs('.det', side).innerHTML = dDrugDetail(sel); api.stat(set.length + ' drugs');
    }
    qs('.y', c1).addEventListener('change', function(){ yv = this.value; draw(); }); cvs.addEventListener('click', function(ev){ sel = dHit(cvs, ev); draw(); });
    return { render: draw };
  } });

/* ---------- step 5 ---------- */
function dRandn(r){ var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); }
DIS.add({ short: 'Half-life from CL and Vss', level: 'applied', title: 'Half-life from clearance and volume',
  build: function(api){
    var fc = 2, fv = 2, rho = 0;
    var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="430" style="width:436px;height:430px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>'), ca = qs('.a', pn);
    var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="430" style="width:420px;height:430px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px"></div>'), cb = qs('.b', pn2);
    var c1 = api.addControl('CL fold error <input type="range" class="c" min="1" max="4" step="0.1" value="' + fc + '" style="width:100px"> <b class="cv"></b>'), c2 = api.addControl('Vss fold error <input type="range" class="v" min="1" max="4" step="0.1" value="' + fv + '" style="width:100px"> <b class="vv"></b>'), c3 = api.addControl('Correlation <input type="range" class="r" min="-0.9" max="0.9" step="0.1" value="' + rho + '" style="width:100px"> <b class="rv"></b>');
    function draw(){
      qs('.cv', c1).textContent = fc.toFixed(1); qs('.vv', c2).textContent = fv.toFixed(1); qs('.rv', c3).textContent = rho.toFixed(1);
      var set = OBACH08.filter(function(d){ return d.t12 > 0 && d.vss > 0 && d.cl > 0; }), rows = set.map(function(d){ return { d: d, p: 11.55 * d.vss / d.cl, o: d.t12 }; });
      dScatter(ca, rows.map(function(r){ return { x: r.o, y: r.p, col: '#0F6E8C', d: r.d }; }), { xlo: -1, xhi: 3.3, ylo: -1, yhi: 3.3, xl: 'Reported terminal half-life (h)', yl: '0.693 x Vss / CL (h)', band: true });
      var s = dScore(rows); qs('.ra', pn).innerHTML = '<b>' + s.within2 + ' of ' + s.n + '</b> within 2-fold. Average fold error <b>' + s.gmfe.toFixed(2) + '</b>, bias <b>' + s.bias.toFixed(2) + '</b>.';
      var r = rng(5), sc = Math.log(fc), sv = Math.log(fv), N = 4000, lr = [], w2 = 0;
      for (var i = 0; i < N; i++) { var z1 = dRandn(r), z2 = rho * z1 + Math.sqrt(1 - rho * rho) * dRandn(r), l = sv * z2 - sc * z1; lr.push(l / Math.LN10); if (Math.abs(l) <= Math.LN2) w2++; }
      var g = cv(cb), box = { l: 40, r: g.w - 12, t: 16, b: g.h - 42 }, lo = -1.2, hi = 1.2, nb = 40, cnt = new Array(nb).fill(0);
      lr.forEach(function(v){ var k = Math.floor((v - lo) / (hi - lo) * nb); if (k >= 0 && k < nb) cnt[k]++; }); var ym = Math.max.apply(null, cnt) * 1.15, x = g.x, bw = (box.r - box.l) / nb;
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [0.1, 0.25, 0.5, 1, 2, 4, 10].forEach(function(v){ var xp = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.t); x.lineTo(xp, box.b); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
      cnt.forEach(function(c, k){ var hg = c / ym * (box.b - box.t), mid = lo + (k + 0.5) * (hi - lo) / nb, ok = Math.abs(mid) <= Math.log10(2); x.fillStyle = ok ? C.red : C.tint; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); });
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Predicted over true half-life', (box.l + box.r) / 2, box.b + 33); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var ana = Math.exp(Math.sqrt(sc * sc + sv * sv - 2 * rho * sc * sv));
      qs('.rb', pn2).innerHTML = 'Half-life error: <b>' + (100 * w2 / N).toFixed(0) + ' percent</b> within 2-fold of the true value. Geometric standard deviation: <b>' + ana.toFixed(2) + '</b> (from the CL and Vss values and their correlation). Dark bars lie within 2-fold.';
      api.stat('Half-life within 2-fold: ' + (100 * w2 / N).toFixed(0) + ' percent');
    }
    qs('.c', c1).addEventListener('input', function(){ fc = +this.value; draw(); }); qs('.v', c2).addEventListener('input', function(){ fv = +this.value; draw(); }); qs('.r', c3).addEventListener('input', function(){ rho = +this.value; draw(); });
    return { render: draw };
  } });

/* ---------- step 6 ---------- */
var CLP99 = { Chlorpromazine: 8.6, Propafenone: 13, Verapamil: 15, Diphenhydramine: 6.2, Lorcainide: 14, Diltiazem: 12, Amitriptyline: 10, Desipramine: 12, Imipramine: 13, Ketamine: 16, Quinidine: 2.5, Clozapine: 2.5, Dexamethasone: 3.5, Prednisone: 4.1, Diazepam: 0.4, Midazolam: 4.6, Methoxsalen: 12, Alprazolam: 0.59, Triazolam: 2.9, Zolpidem: 4.3, Diclofenac: 4.2, Ibuprofen: 0.8, Tolbutamide: 0.2, Warfarin: 0.045, Tenidap: 0.058, Tenoxicam: 0.02, Amobarbital: 0.53, Hexobarbital: 3.6, Methohexital: 11 };
DIS.add({ short: 'Blood to plasma ratio', level: 'applied', title: 'Blood to plasma ratio',
  build: function(api){
    var use = 'blood', sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:620px;height:508px;padding:8px', '<canvas width="604" height="470" style="width:604px;height:470px;cursor:pointer"></canvas>' + hepLegend()), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:664px;top:16px;width:268px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Observed value <select class="u">' + hepOpts([['blood', 'Blood clearance'], ['plasma', 'Plasma clearance']], use) + '</select>');
    function draw(){
      var rows = OBACH99.map(function(d){ var o = use === 'blood' ? d.obs : CLP99[d.name]; return { d: d, p: hepPredict(d, { model: 'pt', bind: 'both' }), o: o }; });
      var g = cv(cvs), box = { l: 56, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x, lo = -2, hi = 2;
      var A = logAxes(g, box, lo, hi, 'Observed ' + use + ' clearance (mL/min/kg)', 'Predicted blood clearance (mL/min/kg)', lo, hi, [0.01, 0.1, 1, 10, 100], [0.01, 0.1, 1, 10, 100]);
      x.fillStyle = 'rgba(15,110,140,.09)'; x.beginPath(); x.moveTo(A.sx(0.01), A.sy(0.02)); x.lineTo(A.sx(100), A.sy(200)); x.lineTo(A.sx(100), A.sy(50)); x.lineTo(A.sx(0.01), A.sy(0.005)); x.closePath(); x.fill();
      x.strokeStyle = C.mid; x.lineWidth = 1.2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(A.sx(0.01), A.sy(0.01)); x.lineTo(A.sx(100), A.sy(100)); x.stroke(); x.setLineDash([]);
      var hit = [];
      rows.forEach(function(r){ var px = A.sx(r.o), py = A.sy(Math.max(r.p, 0.0101)), on = sel === r.d; x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = on ? 1 : 0.85; x.beginPath(); x.arc(px, py, on ? 7 : 5, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(r.d.name, px + 10, py - 8); x.font = '12px Aptos, "Segoe UI", sans-serif'; } hit.push({ x: px, y: py, r: r.d }); });
      cvs._pts = hit; cvs._g = g;
      var sc = dScore(rows), byc = ['base', 'neutral', 'acid'].map(function(k){ var s = dScore(rows.filter(function(r){ return r.d.cls === k; })); return [HCLS[k][0], s.gmfe.toFixed(2) + ', bias ' + s.bias.toFixed(2)]; });
      var r0 = sel && rows.filter(function(r){ return r.d === sel; })[0];
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Average fold error</b><div class="v">' + sc.gmfe.toFixed(2) + '</div><div class="s">' + sc.within2 + ' of 29 within 2-fold, bias ' + sc.bias.toFixed(2) + '</div></div>' + dRows(byc);
      qs('.det', side).innerHTML = r0 ? '<div style="font-weight:700;font-size:14px;margin:8px 0 4px">' + sel.name + '</div>' + dRows([['B:P', sel.bp], ['CL blood', hfx(sel.obs)], ['CL plasma', hfx(CLP99[sel.name])], ['Predicted', hfx(r0.p)], ['Fold error', hfold(r0.p, r0.o)]]) : '<div class="hint" style="font-size:12px;margin-top:8px">Select a point.</div>';
      api.stat('Average fold error ' + sc.gmfe.toFixed(2) + ' against ' + use + ' clearance');
    }
    qs('.u', c1).addEventListener('change', function(){ use = this.value; draw(); }); cvs.addEventListener('click', function(ev){ sel = hepHit(cvs, ev); draw(); });
    return { render: draw };
  } });

/* ---------- step 7 ---------- */
DIS.add({ short: 'Sensitivity of Vss', level: 'advanced', title: 'Sensitivity of volume of distribution',
  build: function(api){
    var lf = -1.5, lt = -1.5, f = 2;
    var pn = api.el('pn', 'left:28px;top:16px;width:620px;height:508px;padding:8px', '<canvas width="604" height="490" style="width:604px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:664px;top:16px;width:268px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('fup <input type="range" class="a" min="-3" max="0" step="0.05" value="' + lf + '" style="width:110px"> <b class="av"></b>'), c2 = api.addControl('fut <input type="range" class="b" min="-3" max="0" step="0.05" value="' + lt + '" style="width:110px"> <b class="bv"></b>'), c3 = api.addControl('Perturbation <input type="range" class="p" min="1.2" max="4" step="0.1" value="' + f + '" style="width:90px"> <b class="pv"></b>-fold');
    function draw(){
      var fup = Math.pow(10, lf), fut = Math.pow(10, lt); qs('.av', c1).textContent = fup < 0.1 ? fup.toFixed(3) : fup.toFixed(2); qs('.bv', c2).textContent = fut < 0.1 ? fut.toFixed(3) : fut.toFixed(2); qs('.pv', c3).textContent = f.toFixed(1);
      var base = otVss(fup, fut), items = [['fup', function(m){ return otVss(Math.min(1, fup * m), fut); }], ['fut', function(m){ return otVss(fup, Math.min(1, fut * m)); }], ['Vp', function(m){ return otVss(fup, fut, { Vp: OT.Vp * m, Ve: OT.Ve, Re: OT.Re, Vr: OT.Vr }); }], ['Ve', function(m){ return otVss(fup, fut, { Vp: OT.Vp, Ve: OT.Ve * m, Re: OT.Re, Vr: OT.Vr }); }], ['Re/i', function(m){ return otVss(fup, fut, { Vp: OT.Vp, Ve: OT.Ve, Re: OT.Re * m, Vr: OT.Vr }); }], ['Vr', function(m){ return otVss(fup, fut, { Vp: OT.Vp, Ve: OT.Ve, Re: OT.Re, Vr: OT.Vr * m }); }]];
      var g = cv(cvs), box = { l: 70, r: g.w - 20, t: 30, b: g.h - 40 }, x = g.x, span = Math.log10(f) * 1.1 + 0.02, zero = (box.l + box.r) / 2, bh = (box.b - box.t) / items.length;
      var sx = function(l){ return zero + l / span * (box.r - box.l) / 2; };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'center'; [-1, -0.5, 0, 0.5, 1].forEach(function(t){ var l = t * Math.log10(f); x.beginPath(); x.moveTo(sx(l), box.t); x.lineTo(sx(l), box.b); x.stroke(); x.fillText(Math.pow(10, l).toFixed(2), sx(l), box.b + 16); });
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Vss relative to the unperturbed value', zero, box.b + 33); x.textAlign = 'left'; x.fillText('Input divided by ' + f.toFixed(1) + ' (left bar), multiplied (right bar)', box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var lines = [];
      items.forEach(function(it, i){ var lo = Math.log10(it[1](1 / f) / base), hi = Math.log10(it[1](f) / base), y = box.t + i * bh + 6; x.fillStyle = C.char; x.textAlign = 'right'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(it[0], box.l - 8, y + bh / 2 + 2); x.font = '12px Aptos, "Segoe UI", sans-serif';
        x.fillStyle = C.tint; x.fillRect(Math.min(sx(0), sx(lo)), y, Math.abs(sx(lo) - sx(0)), bh - 14); x.fillStyle = C.red; x.fillRect(Math.min(sx(0), sx(hi)), y, Math.abs(sx(hi) - sx(0)), bh - 14); lines.push([it[0], Math.pow(10, lo).toFixed(2) + ' to ' + Math.pow(10, hi).toFixed(2)]); });
      x.strokeStyle = C.char; x.lineWidth = 1.5; x.beginPath(); x.moveTo(zero, box.t); x.lineTo(zero, box.b); x.stroke();
      var q = otParts(fup, fut);
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Vss</b><div class="v">' + hfx(base) + ' L/kg</div><div class="s">tissue term ' + (100 * q.tissue / base).toFixed(0) + ' percent of the total</div></div><h4>Vss ratio, divided to multiplied</h4>' + dRows(lines);
      api.stat('Vss ' + hfx(base) + ' L/kg');
    }
    qs('.a', c1).addEventListener('input', function(){ lf = +this.value; draw(); }); qs('.b', c2).addEventListener('input', function(){ lt = +this.value; draw(); }); qs('.p', c3).addEventListener('input', function(){ f = +this.value; draw(); });
    return { render: draw };
  } });
