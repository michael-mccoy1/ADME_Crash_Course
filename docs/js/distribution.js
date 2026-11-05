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
    hit.push({ x: px, y: py, r: p.d, vx: p.x, vy: p.y }); });
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
      cb._hist = { cnt: cnt, lo: lo, hi: hi, box: box, log: true, name: 'Predicted over true half-life' }; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Predicted over true half-life', (box.l + box.r) / 2, box.b + 33); x.font = '12px Aptos, "Segoe UI", sans-serif';
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
      rows.forEach(function(r){ var px = A.sx(r.o), py = A.sy(Math.max(r.p, 0.0101)), on = sel === r.d; x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = on ? 1 : 0.85; x.beginPath(); x.arc(px, py, on ? 7 : 5, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(r.d.name, px + 10, py - 8); x.font = '12px Aptos, "Segoe UI", sans-serif'; } hit.push({ x: px, y: py, r: r.d, vx: r.o, vy: r.p }); });
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
      var lines = []; cvs._bars = [];
      items.forEach(function(it, i){ var lo = Math.log10(it[1](1 / f) / base), hi = Math.log10(it[1](f) / base), y = box.t + i * bh + 6; x.fillStyle = C.char; x.textAlign = 'right'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(it[0], box.l - 8, y + bh / 2 + 2); x.font = '12px Aptos, "Segoe UI", sans-serif';
        x.fillStyle = C.tint; x.fillRect(Math.min(sx(0), sx(lo)), y, Math.abs(sx(lo) - sx(0)), bh - 14); x.fillStyle = C.red; x.fillRect(Math.min(sx(0), sx(hi)), y, Math.abs(sx(hi) - sx(0)), bh - 14); lines.push([it[0], Math.pow(10, lo).toFixed(2) + ' to ' + Math.pow(10, hi).toFixed(2)]); cvs._bars.push({ x0: Math.min(sx(0), sx(lo)), x1: Math.max(sx(0), sx(lo)), y0: y, y1: y + bh - 14, lines: [it[0] + ' divided by ' + f.toFixed(1), 'Vss x ' + Math.pow(10, lo).toFixed(2)] }, { x0: Math.min(sx(0), sx(hi)), x1: Math.max(sx(0), sx(hi)), y0: y, y1: y + bh - 14, lines: [it[0] + ' multiplied by ' + f.toFixed(1), 'Vss x ' + Math.pow(10, hi).toFixed(2)] }); });
      x.strokeStyle = C.char; x.lineWidth = 1.5; x.beginPath(); x.moveTo(zero, box.t); x.lineTo(zero, box.b); x.stroke();
      var q = otParts(fup, fut);
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Vss</b><div class="v">' + hfx(base) + ' L/kg</div><div class="s">tissue term ' + (100 * q.tissue / base).toFixed(0) + ' percent of the total</div></div><h4>Vss ratio, divided to multiplied</h4>' + dRows(lines);
      api.stat('Vss ' + hfx(base) + ' L/kg');
    }
    qs('.a', c1).addEventListener('input', function(){ lf = +this.value; draw(); }); qs('.b', c2).addEventListener('input', function(){ lt = +this.value; draw(); }); qs('.p', c3).addEventListener('input', function(){ f = +this.value; draw(); });
    return { render: draw };
  } });

/* ---------- binding schematic (sorted first: ord -1) ----------
   Two compartments at equilibrium. Vp = 0.0436 L/kg and Vt = 0.151 + 0.38 L/kg for 70 kg, the same constants as the step 'What Vss measures'.
   Particle model: each molecule is a four-state Markov chain (plasma or tissue, bound or unbound). Binding and unbinding are first order with
   kon + koff = KB and koff / (kon + koff) = fu (plasma) or fu,t (tissue). Unbound transfer is first order with the same permeability-surface
   product PS in both directions, kPT = PS / Vp and kTP = PS / Vt, so unbound concentrations equalize. Positions are drawn only: unbound molecules
   move by Brownian motion (Ornstein-Uhlenbeck velocity); a transfer event sends the molecule through the nearest pore of the capillary wall. */
(function(){
  var W = 70, VP = OT.Vp * W, ND = 200, KB = 2, OCC = 0.5, TAVG = 15, TAU = 0.35, SIG = 230, PS = 4;
  var PX0 = 10, PX1 = 210, WX1 = 222, TX1 = 614, BY0 = 32, BY1 = 296, MR = 3.6, BX0 = 84, BX1 = 600;
  var GREY = '#A1B1C4';
  function fx(v){ if (!isFinite(v)) return 'n/a'; return v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString()))); }
  function tile(label, value, sub){ return '<div class="score" style="margin-bottom:8px"><b>' + label + '</b><div class="v" style="font-size:1.5rem">' + value + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>'; }
  function rows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:4px 0;font-size:12.5px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function gauss(r){ var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); }
  function blobR(s, a){ return s.R * (1 + 0.13 * Math.sin(3 * a + s.ph) + 0.07 * Math.sin(5 * a + 2 * s.ph)); }
  function blobPath(x, s, cx, cy){ x.beginPath(); for (var i = 0; i <= 28; i++) { var a = i / 28 * 6.2832, r = blobR(s, a); if (i) x.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); else x.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } x.closePath(); }
  function pore(y){ return ((y - BY0) % 22) > 14; }
  function noAnim(){ return typeof ANIM !== 'undefined' && !ANIM; }

  DIS.add({ short: 'Binding schematic', level: 'foundations', ord: -1, title: 'Binding and volume of distribution',
    build: function(api){
      var S = IX.state('dsx', { lf: -1, lt: -0.7, vt: 37.2, alb: 100, sp: 6, cmp: 0 });
      var rnd = SC.rand(808), mol = [], alb = [], sites = [], tsim = 0, avg = { np: 0, nt: 0, nup: 0, nut: 0 }, lock = null, hovB = false, lastSide = 0, scale = 1, endX = 0, loop = null, force = true;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('xf', 'fu', -2, 0, 0.05, S.lf)), c2 = api.addControl(IX.slider('xt', 'fu,t', -2, 0, 0.05, S.lt)), c3 = api.addControl(IX.slider('xv', 'Vt', 10, 80, 0.5, S.vt, 'L'));
      var c4 = api.addControl(IX.slider('xa', 'Albumin', 25, 200, 5, S.alb, '% of normal')), c5 = api.addControl(IX.slider('xs', 'Speed', 1, 20, 1, S.sp, 'x real time'));
      var c6 = api.addControl('<label style="display:inline-flex;gap:5px;align-items:center"><input type="checkbox" class="xc"' + (S.cmp ? ' checked' : '') + '> Displacing drug</label> <button type="button" class="btn sm ghost xd">Dose into plasma</button> <button type="button" class="btn sm ghost xe">Equilibrate</button>');

      function par(){
        var fu = Math.pow(10, S.lf), fut = Math.pow(10, S.lt), a = S.alb / 100, occ = S.cmp ? OCC : 0;
        var fuE = 1 / (1 + (1 / fu - 1) * a * (1 - occ)), Kp = fuE / fut, Vt = S.vt, Vss = VP + Vt * Kp;
        return { fu: fu, fut: fut, fuE: fuE, Kp: Kp, Vt: Vt, Vss: Vss, kPT: PS / VP, kTP: PS / Vt };
      }
      /* tissue binding sites (lipid droplets and membrane patches), fixed */
      (function(){ var i, j, cw = (TX1 - WX1) / 4, rh = (BY1 - BY0) / 4; for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) sites.push({ kind: 't', x: WX1 + cw * (i + 0.5) + (rnd() - 0.5) * 28, y: BY0 + rh * (j + 0.5) + (rnd() - 0.5) * 20, rx: 12 + rnd() * 5, ry: 8 + rnd() * 4 }); })();
      function newAlb(){ var R = 10 + rnd() * 3; return { kind: 'a', R: R, ph: rnd() * 6.28, x: PX0 + 26 + rnd() * (PX1 - PX0 - 52), y: BY0 + 26 + rnd() * (BY1 - BY0 - 52), vx: 0, vy: 0 }; }
      function setAlb(){
        var n = Math.max(2, Math.round(12 * S.alb / 100));
        while (alb.length < n) alb.push(newAlb());
        while (alb.length > n) { var s = alb.pop(); mol.forEach(function(m){ if (m.b === s) release(m); }); }
      }
      function inBox(m){ if (m.side === 0) m.x = cl(m.x, PX0 + MR, PX1 - MR); else m.x = cl(m.x, WX1 + MR, TX1 - MR); m.y = cl(m.y, BY0 + MR, BY1 - MR); }
      function bpos(m){ var s = m.b; if (s.kind === 'a') { var r = blobR(s, m.a) + MR + 0.5 + m.o; return [s.x + r * Math.cos(m.a), s.y + r * Math.sin(m.a)]; } return [s.x + (s.rx + MR + 0.5 + m.o) * Math.cos(m.a), s.y + (s.ry + MR + 0.5 + m.o) * Math.sin(m.a)]; }
      function bind(m){ m.pend = false; m.fly = false; m.side = m.c; var L = m.c === 0 ? alb : sites, best = null, bd = 1e9; L.forEach(function(s){ var d = (s.x - m.x) * (s.x - m.x) + (s.y - m.y) * (s.y - m.y); if (d < bd) { bd = d; best = s; } }); if (!best) return; m.b = best; m.a = Math.atan2(m.y - best.y, m.x - best.x) + (rnd() - 0.5) * 0.6; m.o = rnd() < 0.6 ? 0 : 6.5; }
      function release(m){ var p = bpos(m); m.b = null; m.pend = false; m.fly = false; m.side = m.c; m.x = p[0]; m.y = p[1]; m.vx = Math.cos(m.a) * 60; m.vy = Math.sin(m.a) * 60; inBox(m); }
      function place(m){ m.b = null; m.pend = false; m.fly = false; m.side = m.c; m.vx = gauss(rnd) * 60; m.vy = gauss(rnd) * 60; m.y = BY0 + MR + rnd() * (BY1 - BY0 - 2 * MR); m.x = m.c === 0 ? PX0 + MR + rnd() * (PX1 - PX0 - 2 * MR) : WX1 + MR + rnd() * (TX1 - WX1 - 2 * MR); }
      function counts(){ var o = { np: 0, nt: 0, nup: 0, nut: 0 }; mol.forEach(function(m){ var u = !m.b && !m.pend; if (m.c === 0) { o.np++; if (u) o.nup++; } else { o.nt++; if (u) o.nut++; } }); return o; }
      function resetAvg(){ avg = counts(); }
      function dose(){ mol = []; for (var i = 0; i < ND; i++) { var m = { c: 0 }; place(m); mol.push(m); } tsim = 0; resetAvg(); }
      function equil(){ var P = par(), fp = VP / P.Vss; mol.forEach(function(m){ m.c = rnd() < fp ? 0 : 1; place(m); if (rnd() < 1 - (m.c ? P.fut : P.fuE)) bind(m); }); resetAvg(); }

      function sim(h, P){
        var sq = Math.sqrt(h), da = Math.exp(-h / 0.6);
        alb.forEach(function(s){ s.vx = s.vx * da + 14 * sq * gauss(rnd); s.vy = s.vy * da + 14 * sq * gauss(rnd); s.x += s.vx * h; s.y += s.vy * h; var mx = s.R * 1.25 + MR + 8;
          if (s.x < PX0 + mx) { s.x = PX0 + mx; s.vx = Math.abs(s.vx); } if (s.x > PX1 - mx) { s.x = PX1 - mx; s.vx = -Math.abs(s.vx); } if (s.y < BY0 + mx) { s.y = BY0 + mx; s.vy = Math.abs(s.vy); } if (s.y > BY1 - mx) { s.y = BY1 - mx; s.vy = -Math.abs(s.vy); } });
        var pOffP = 1 - Math.exp(-KB * P.fuE * h), pOffT = 1 - Math.exp(-KB * P.fut * h), pOnP = 1 - Math.exp(-KB * (1 - P.fuE) * h), pOnT = 1 - Math.exp(-KB * (1 - P.fut) * h), dv = Math.exp(-h / TAU);
        var qT = [1 - Math.exp(-P.kPT * h), 1 - Math.exp(-P.kTP * h)];
        mol.forEach(function(m){
          var bound = m.b || m.pend;
          if (bound) { if (rnd() < (m.c ? pOffT : pOffP)) { if (m.b) release(m); else m.pend = false; } if (m.b) return; }
          else {
            if (rnd() < (m.c ? pOnT : pOnP)) { if (m.fly) m.pend = true; else { bind(m); return; } }
            else if (rnd() < qT[m.c]) { m.c = 1 - m.c; m.fly = m.side !== m.c; }
          }
          /* motion of an unattached molecule: Brownian, with a drift toward the nearest pore while it is transferring */
          var nz = m.fly ? 0.35 : 1;
          m.vx = m.vx * dv + nz * SIG * sq * gauss(rnd); m.vy = m.vy * dv + nz * SIG * sq * gauss(rnd);
          var dx = 0, dy = 0;
          if (m.fly) { var wx = m.side === 0 ? PX1 : WX1, py = BY0 + 22 * Math.round((m.y - BY0 - 18) / 22) + 18; py = cl(py, BY0 + 18, BY1 - 4); var ex = wx - m.x, ey = py - m.y, dd = Math.sqrt(ex * ex + ey * ey) || 1, sp = Math.max(160, dd / 0.6); dx = sp * ex / dd; dy = sp * ey / dd; }
          var nx = m.x + (m.vx + dx) * h, ny = m.y + (m.vy + dy) * h;
          if (ny < BY0 + MR) { ny = 2 * (BY0 + MR) - ny; m.vy = -m.vy; } else if (ny > BY1 - MR) { ny = 2 * (BY1 - MR) - ny; m.vy = -m.vy; }
          if (m.side === 0) {
            if (nx < PX0 + MR) { nx = 2 * (PX0 + MR) - nx; m.vx = -m.vx; }
            else if (nx > PX1 - MR) { if (m.fly && pore(ny)) { m.side = 1; nx = WX1 + MR + 1; m.vx = Math.abs(m.vx); } else { nx = 2 * (PX1 - MR) - nx; m.vx = -m.vx; } }
          } else {
            if (nx > TX1 - MR) { nx = 2 * (TX1 - MR) - nx; m.vx = -m.vx; }
            else if (nx < WX1 + MR) { if (m.fly && pore(ny)) { m.side = 0; nx = PX1 - MR - 1; m.vx = -Math.abs(m.vx); } else { nx = 2 * (WX1 + MR) - nx; m.vx = -m.vx; } }
          }
          m.x = nx; m.y = ny; inBox(m);
          if (m.fly && m.side === m.c && (m.side === 1 ? m.x > WX1 + 14 : m.x < PX1 - 14)) { m.fly = false; if (m.pend) bind(m); }
        });
        var k = counts(), w = 1 - Math.exp(-h / TAVG); avg.np += (k.np - avg.np) * w; avg.nt += (k.nt - avg.nt) * w; avg.nup += (k.nup - avg.nup) * w; avg.nut += (k.nut - avg.nut) * w;
      }

      function bar(x, g, y, v, mx, lab, hl){
        var wp = Math.min(VP, mx) * scale, wt = Math.max(0, Math.min(v, mx) - VP) * scale; SC.text(x, lab, 10, y + 13, { size: 11.5 });
        x.fillStyle = GREY; x.fillRect(BX0, y, wp, 18); x.fillStyle = C.red; x.fillRect(BX0 + wp, y, wt, 18);
        if (hl) { x.strokeStyle = C.char; x.lineWidth = 2; x.strokeRect(BX0 + 0.5, y + 0.5, wp + wt - 1, 17); }
        var ex = BX0 + wp + wt, t = (v > mx ? 'above ' : '') + (isFinite(v) ? fx(Math.min(v, 1e6)) + ' L' : 'no molecules in plasma'); x.font = '600 11.5px Aptos, "Segoe UI", sans-serif'; var tw = x.measureText(t).width;
        if (ex + 6 + tw <= g.w - 4) SC.text(x, t, ex + 6, y + 13, { size: 11.5, bold: true }); else SC.text(x, t, ex - 6, y + 13, { size: 11.5, bold: true, align: 'right', color: '#FFFFFF' });
        return ex;
      }

      function frame(dt){
        var P = par();
        if (dt > 0) { var T = dt * S.sp, n = Math.ceil(T / 0.02), h = T / n, i; for (i = 0; i < n; i++) sim(h, P); tsim += T; }
        var g = cv(cvs), x = g.x, k = counts(), yy;
        /* compartments */
        x.fillStyle = 'rgba(140,199,217,0.18)'; SC.rr(x, PX0, BY0, PX1 - PX0, BY1 - BY0, 6); x.fill(); x.strokeStyle = C.red; x.lineWidth = 1.5; x.stroke();
        x.fillStyle = C.light; SC.rr(x, WX1, BY0, TX1 - WX1, BY1 - BY0, 6); x.fill(); x.strokeStyle = GREY; x.lineWidth = 1.5; x.stroke();
        /* capillary wall: endothelial cells with pores */
        x.fillStyle = C.silver; x.strokeStyle = GREY; x.lineWidth = 1; for (yy = BY0; yy < BY1; yy += 22) { SC.rr(x, PX1 + 1, yy, WX1 - PX1 - 2, Math.min(14, BY1 - yy), 3); x.fill(); x.stroke(); }
        SC.text(x, 'Plasma, Vp = ' + VP.toFixed(2) + ' L', (PX0 + PX1) / 2, 22, { bold: true, align: 'center' });
        SC.text(x, 'capillary wall', (PX1 + WX1) / 2, 22, { size: 11, align: 'center', color: C.mid });
        SC.text(x, 'Tissue, Vt = ' + S.vt.toFixed(1) + ' L (not to scale)', (WX1 + TX1) / 2 + 10, 22, { bold: true, align: 'center' });
        SC.text(x, 't = ' + Math.round(tsim) + ' s', TX1, 22, { size: 11, align: 'right', color: C.mid });
        /* tissue binding sites */
        sites.forEach(function(s){ x.beginPath(); x.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, 6.2832); x.fillStyle = '#D5DCE3'; x.fill(); x.strokeStyle = GREY; x.lineWidth = 1.2; x.stroke(); });
        /* albumin, with the displacing drug on two sites of each molecule */
        alb.forEach(function(s){ blobPath(x, s, s.x, s.y); x.fillStyle = GREY; x.fill(); x.strokeStyle = '#7F8FA3'; x.lineWidth = 1; x.stroke();
          if (S.cmp) [s.ph + 0.9, s.ph + 3.6].forEach(function(a){ var r = blobR(s, a) + MR + 0.5; SC.dot(x, s.x + r * Math.cos(a), s.y + r * Math.sin(a), MR, C.warn, '#7A3A12'); }); });
        /* drug */
        mol.forEach(function(m){ if (m.b) { var p = bpos(m); SC.dot(x, p[0], p[1], MR, C.dred, '#FFFFFF'); } });
        mol.forEach(function(m){ if (!m.b) SC.dot(x, m.x, m.y, MR, m.pend ? C.dred : C.red, '#FFFFFF'); });
        /* counts and concentrations under the compartments */
        var cP = avg.np / VP, cuP = avg.nup / VP, cT = avg.nt / P.Vt, cuT = avg.nut / P.Vt;
        SC.text(x, 'n = ' + k.np + ' total, ' + k.nup + ' unbound', (PX0 + PX1) / 2, 312, { size: 11.5, align: 'center' });
        SC.text(x, 'C = ' + fx(cP) + ', Cu = ' + fx(cuP) + ' per L', (PX0 + PX1) / 2, 328, { size: 11.5, align: 'center', bold: true, color: C.dred });
        SC.text(x, 'n = ' + k.nt + ' total, ' + k.nut + ' unbound', (WX1 + TX1) / 2, 312, { size: 11.5, align: 'center' });
        SC.text(x, 'C = ' + fx(cT) + ', Cu = ' + fx(cuT) + ' per L (molecules, ' + TAVG + ' s average)', (WX1 + TX1) / 2, 328, { size: 11.5, align: 'center', bold: true, color: C.dred });
        /* apparent volume bars */
        var phys = VP + P.Vt, mx = lock ? lock.mx : Math.max(P.Vss, phys) * 1.15; scale = (BX1 - BX0) / mx;
        var vS = avg.np > 0.05 ? VP * ND / avg.np : Infinity;
        SC.text(x, 'Apparent volume, Vss = Vp + Vt x Kp (L)', 10, 350, { bold: true });
        endX = bar(x, g, 358, P.Vss, mx, 'Equation', hovB || !!lock); bar(x, g, 384, vS, mx, 'Particles', false);
        var px = BX0 + Math.min(phys, mx) * scale; x.strokeStyle = C.char; x.lineWidth = 1.2; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(px, 354); x.lineTo(px, 408); x.stroke(); x.setLineDash([]);
        var pl = 'Vp + Vt = ' + fx(phys) + ' L, physical volume', right = px > BX1 - 200; SC.text(x, pl, right ? px - 4 : px + 4, 421, { size: 11, align: right ? 'right' : 'left', color: C.mid });
        if (hovB || lock) SC.text(x, 'drag the bar end to set Kp through fu,t', BX0, 436, { size: 11, color: C.red });
        /* legend */
        var L1 = 450, L2 = 474;
        SC.dot(x, 16, L1 - 4, MR, C.red, '#FFFFFF'); SC.text(x, 'Unbound drug', 26, L1, { size: 11.5 });
        x.beginPath(); x.arc(160, L1 - 4, 7, 2.2, 4.1); x.strokeStyle = GREY; x.lineWidth = 3; x.stroke(); SC.dot(x, 163, L1 - 4, MR, C.dred, '#FFFFFF'); SC.text(x, 'Bound drug', 173, L1, { size: 11.5 });
        blobPath(x, { R: 7, ph: 0.5 }, 318, L1 - 4); x.fillStyle = GREY; x.fill(); SC.text(x, 'Albumin', 330, L1, { size: 11.5 });
        x.beginPath(); x.ellipse(452, L1 - 4, 9, 6, 0, 0, 6.2832); x.fillStyle = '#D5DCE3'; x.fill(); x.strokeStyle = GREY; x.lineWidth = 1.2; x.stroke(); SC.text(x, 'Tissue binding site', 466, L1, { size: 11.5 });
        SC.dot(x, 16, L2 - 4, MR, C.warn, '#7A3A12'); SC.text(x, 'Displacing drug', 26, L2, { size: 11.5 });
        x.fillStyle = C.silver; x.strokeStyle = GREY; x.lineWidth = 1; SC.rr(x, 156, L2 - 11, 10, 14, 3); x.fill(); x.stroke(); SC.text(x, 'Endothelial cell', 173, L2, { size: 11.5 });
        x.fillStyle = GREY; x.fillRect(312, L2 - 10, 12, 10); SC.text(x, 'Vp', 330, L2, { size: 11.5 });
        x.fillStyle = C.red; x.fillRect(360, L2 - 10, 12, 10); SC.text(x, 'Vt x Kp', 378, L2, { size: 11.5 });
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(452, L2 - 11); x.lineTo(452, L2 + 2); x.stroke(); x.setLineDash([]); SC.text(x, 'Physical volume', 466, L2, { size: 11.5 });
        var now = performance.now(); if (now - lastSide > 1000 || force) { lastSide = now; force = false; sidePanel(P, k); }
      }

      function sidePanel(P, k){
        var a = avg, KpS = a.np > 0.05 ? (a.nt / P.Vt) / (a.np / VP) : NaN, VssS = a.np > 0.05 ? VP * ND / a.np : NaN, cu = a.nup > 0.2 ? (a.nut / P.Vt) / (a.nup / VP) : NaN, eP = ND * VP / P.Vss;
        qs('.sd', side).innerHTML = tile('Vss, equation', fx(P.Vss) + ' L', fx(P.Vss / W) + ' L/kg at 70 kg; Vp + Vt x fu / fu,t') + rows([
          ['fu set, effective', fx(P.fu) + ', ' + fx(P.fuE)], ['fu,t', fx(P.fut)], ['Kp = fu / fu,t, equation', fx(P.Kp)], ['Kp = C tissue / C plasma, particles', fx(KpS)],
          ['Vss, particles', isFinite(VssS) ? fx(VssS) + ' L' : 'n/a'], ['Cu tissue / Cu plasma, particles', isFinite(cu) ? fx(cu) : 'too few unbound in plasma'],
          ['Molecules in plasma, tissue', k.np + ', ' + k.nt], ['Expected at equilibrium', eP.toFixed(1) + ', ' + (ND - eP).toFixed(1)]]) +
          '<div class="hint" style="font-size:11.5px;margin-top:8px">' + ND + ' drug molecules. Particle values are averaged over about ' + TAVG + ' s of simulated time. Effective fu = 1 / (1 + (1/fu - 1) x albumin fraction x (1 - occupancy)); the displacing drug occupies ' + (OCC * 100) + '% of albumin sites. Drag the end of the equation bar to set Kp.</div>';
        api.stat('Vss ' + fx(P.Vss) + ' L, Kp ' + fx(P.Kp) + ', effective fu ' + fx(P.fuE));
      }
      function labels(){ qs('.xfv', c1).textContent = fx(Math.pow(10, S.lf)); qs('.xtv', c2).textContent = fx(Math.pow(10, S.lt)); qs('.xvv', c3).textContent = S.vt.toFixed(1); qs('.xav', c4).textContent = S.alb; qs('.xsv', c5).textContent = S.sp; }
      function sync(){ qs('.xf', c1).value = S.lf; qs('.xt', c2).value = S.lt; qs('.xv', c3).value = S.vt; qs('.xa', c4).value = S.alb; qs('.xs', c5).value = S.sp; }
      function redraw(){ force = true; if (loop) loop.redraw(); }
      function changed(){ IX.save('dsx', S); setAlb(); labels(); if (noAnim()) equil(); redraw(); }
      [['xf', c1, 'lf'], ['xt', c2, 'lt'], ['xv', c3, 'vt'], ['xa', c4, 'alb'], ['xs', c5, 'sp']].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[2]] = +this.value; changed(); }); });
      qs('.xc', c6).addEventListener('change', function(){ S.cmp = this.checked ? 1 : 0; changed(); });
      qs('.xd', c6).addEventListener('click', function(){ dose(); if (noAnim()) equil(); redraw(); });
      qs('.xe', c6).addEventListener('click', function(){ equil(); redraw(); });
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'binding-schematic', csv: function(){ var P = par(), k = counts();
        return IX.csv([['Quantity', 'Value'], ['fu set', P.fu], ['fu effective', P.fuE], ['fu,t', P.fut], ['Albumin (% of normal)', S.alb], ['Displacing drug', S.cmp ? 'on' : 'off'], ['Vp (L)', VP], ['Vt (L)', P.Vt], ['Kp equation', P.Kp], ['Vss equation (L)', P.Vss],
          ['Simulated time (s)', tsim], ['Molecules plasma', k.np], ['Molecules tissue', k.nt], ['Unbound plasma', k.nup], ['Unbound tissue', k.nut], ['Averaged molecules plasma', avg.np], ['Averaged molecules tissue', avg.nt], ['Averaged unbound plasma', avg.nup], ['Averaged unbound tissue', avg.nut]]); } });
      function onBar(p){ return Math.abs(p.x - endX) < 9 && p.y >= 354 && p.y <= 380; }
      IX.attach(cvs, {
        move: function(p){ var o = onBar(p); cvs.style.cursor = o ? 'ew-resize' : 'default'; if (o !== hovB) { hovB = o; redraw(); } },
        leave: function(){ if (hovB) { hovB = false; redraw(); } },
        down: function(p){ if (!onBar(p)) return null; lock = { mx: (BX1 - BX0) / scale }; return { k: 'v' }; },
        drag: function(d, p){ var P = par(), v = (cl(p.x, BX0, BX1) - BX0) / scale, Kp = Math.max((v - VP) / P.Vt, 1e-6), lt = Math.log10(P.fuE / Kp); S.lt = +cl(Math.round(lt / 0.05) * 0.05, -2, 0).toFixed(2); sync(); labels(); if (noAnim()) equil(); redraw(); },
        up: function(){ lock = null; IX.save('dsx', S); redraw(); }
      });
      setAlb(); dose(); if (noAnim()) equil();
      sync(); labels();
      loop = SC.run(cvs, function(dt){ frame(dt); });
      function draw(){ labels(); redraw(); }
      return { render: draw };
    } });
})();
