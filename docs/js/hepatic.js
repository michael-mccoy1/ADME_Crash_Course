"use strict";
/* Tab 01: hepatic clearance from microsomal data. Data: Obach (1999), 29 drugs. Hepatic blood flow Q = 21 mL/min/kg as in that paper. */
var HEP = new Lesson('hep', 'Hepatic clearance');
HEP.noOpts = true;
HEP.hint = 'Hepatic clearance from in vitro data';

var HCLS = { base: ['Bases', '#0F6E8C'], neutral: ['Neutrals', '#34373F'], acid: ['Acids', '#B4561B'] };
var HQ = 21, HMP0 = 45, HLW0 = 20;

/* ---------- models ---------- */
function mWS(q, cl){ return q * cl / (q + cl); }
function mPT(q, cl){ return q * (1 - Math.exp(-cl / q)); }
function mDS(q, cl, dn){
  var x = cl / q, a = Math.sqrt(1 + 4 * x * dn), den = (1 + a) * (1 + a) * Math.exp((a - 1) / (2 * dn)) - (1 - a) * (1 - a) * Math.exp(-(a + 1) / (2 * dn));
  return q * (1 - 4 * a / den);
}
/* o: { model: 'ws' | 'pt', bind: 'none' | 'blood' | 'both', sf: scale factor on CLint, q, plasma: use fu plasma without the blood to plasma ratio } */
function hepPredict(d, o){
  var cl = d.clint * (o.sf || 1), fub = o.plasma ? d.fup : d.fup / d.bp, q = o.q || HQ;
  if (o.bind !== 'none') cl *= fub;
  if (o.bind === 'both') cl /= d.fum;
  return o.model === 'pt' ? mPT(q, cl) : mWS(q, cl);
}
function hepRows(o, subset){
  return OBACH99.filter(function(d){ return !subset || d.cls === subset; }).map(function(d){ return { d: d, p: hepPredict(d, o) }; });
}
function hepScore(rows){
  var n = rows.length, w2 = 0, s = 0, sa = 0, over = 0;
  rows.forEach(function(r){ var l = Math.log10(r.p / r.d.obs); s += l; sa += Math.abs(l); if (Math.abs(l) <= Math.log10(2)) w2++; if (l > 0) over++; });
  return { n: n, within2: w2, gmfe: Math.pow(10, sa / n), bias: Math.pow(10, s / n), over: over };
}
function hfx(v){ return v < 0.1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : v.toFixed(1)); }
function hfold(p, o){ var r = p / o; return (r >= 1 ? r.toFixed(1) + ' over' : (1 / r).toFixed(1) + ' under'); }

/* ---------- log axes ---------- */
function logAxes(g, box, lo, hi, xl, yl, ylo, yhi, ticksX, ticksY){
  var x = g.x; x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", system-ui, sans-serif';
  var sx = function(v){ return box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); }, sy = function(v){ return box.b - (Math.log10(v) - ylo) / (yhi - ylo) * (box.b - box.t); };
  x.textAlign = 'right'; ticksY.forEach(function(v){ var y = sy(v); x.beginPath(); x.moveTo(box.l, y); x.lineTo(box.r, y); x.stroke(); x.fillText(String(v), box.l - 6, y + 4); });
  x.textAlign = 'center'; ticksX.forEach(function(v){ var xp = sx(v); x.beginPath(); x.moveTo(xp, box.t); x.lineTo(xp, box.b); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
  x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(xl, (box.l + box.r) / 2, box.b + 33);
  x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(yl, 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
  return { sx: sx, sy: sy };
}

/* Predicted against observed clearance, log scales, 2-fold band, one point per drug. */
function hepScatter(el, rows, sel){
  var g = cv(el), box = { l: 56, r: g.w - 14, t: 14, b: g.h - 42 }, lo = -2, hi = 2, x = g.x;
  var A = logAxes(g, box, lo, hi, 'Observed blood clearance (mL/min/kg)', 'Predicted blood clearance (mL/min/kg)', lo, hi, [0.01, 0.1, 1, 10, 100], [0.01, 0.1, 1, 10, 100]);
  var d2 = Math.log10(2);
  x.fillStyle = 'rgba(15,110,140,.09)'; x.beginPath(); x.moveTo(A.sx(0.01), A.sy(0.01 * 2)); x.lineTo(A.sx(100), A.sy(100 * 2)); x.lineTo(A.sx(100), A.sy(100 / 2)); x.lineTo(A.sx(0.01), A.sy(0.01 / 2)); x.closePath(); x.fill();
  x.strokeStyle = C.mid; x.lineWidth = 1.2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(A.sx(0.01), A.sy(0.01)); x.lineTo(A.sx(100), A.sy(100)); x.stroke(); x.setLineDash([]);
  x.strokeStyle = C.tint; x.lineWidth = 1; [2, 0.5].forEach(function(f){ x.beginPath(); x.moveTo(A.sx(0.01), A.sy(0.01 * f)); x.lineTo(A.sx(100), A.sy(100 * f)); x.stroke(); });
  var pts = [];
  rows.forEach(function(r){
    var px = A.sx(r.d.obs), py = A.sy(Math.max(r.p, 0.0101)), on = sel && sel.name === r.d.name;
    x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = on ? 1 : 0.85; x.beginPath(); x.arc(px, py, on ? 7 : 5, 0, 6.3); x.fill(); x.globalAlpha = 1;
    if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(r.d.name, px + 10, py - 8); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
    pts.push({ x: px, y: py, r: r });
  });
  el._pts = pts; el._g = g; return g;
}
function hepHit(el, ev){
  var rc = el.getBoundingClientRect(), g = el._g; if (!g || !el._pts) return null;
  var mx = (ev.clientX - rc.left) * g.w / rc.width, my = (ev.clientY - rc.top) * g.h / rc.height, best = null, bd = 14;
  el._pts.forEach(function(p){ var dd = Math.hypot(p.x - mx, p.y - my); if (dd < bd) { bd = dd; best = p.r; } });
  return best;
}
function hepLegend(){
  return '<div style="display:flex;gap:14px;font-size:12px;margin-top:4px">' + Object.keys(HCLS).map(function(k){ return '<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + HCLS[k][1] + ';margin-right:5px"></i>' + HCLS[k][0] + '</span>'; }).join('') + '</div>';
}
function hepOpts(vals, sel){ return vals.map(function(v){ return '<option value="' + v[0] + '"' + (v[0] === sel ? ' selected' : '') + '>' + v[1] + '</option>'; }).join(''); }
function hepTiles(sc){
  function tile(l, v, s){ return '<div class="score" style="margin-bottom:8px"><b>' + l + '</b><div class="v">' + v + '</div><div class="s">' + s + '</div></div>'; }
  return tile('Within 2-fold', sc.within2 + ' of ' + sc.n, Math.round(100 * sc.within2 / sc.n) + ' percent of drugs') +
    tile('Average fold error', sc.gmfe.toFixed(2), 'geometric mean of |predicted / observed|') +
    tile('Bias', sc.bias.toFixed(2), sc.bias < 1 ? 'under-prediction on average' : 'over-prediction on average');
}
function hepDetail(r, o){
  if (!r) return '<div class="hint" style="font-size:12px">Select a point to read its inputs.</div>';
  var d = r.d, rowsT = [['Class', HCLS[d.cls][0].slice(0, -1)], ['fu plasma', d.fup], ['Blood to plasma', d.bp], ['fu microsomes', d.fum], ['Scaled CLint', hfx(d.clint * (o.sf || 1)) + ' mL/min/kg'], ['Observed CL', hfx(d.obs) + ' mL/min/kg'], ['Predicted CL', hfx(r.p) + ' mL/min/kg'], ['Fold error', hfold(r.p, d.obs)]];
  return '<div style="font-weight:700;font-size:14px;margin-bottom:4px;color:' + HCLS[d.cls][1] + '">' + d.name + '</div>' + rowsT.map(function(t){ return '<div style="display:flex;justify-content:space-between;border-top:1px solid ' + C.silver + ';padding:3px 0;font-size:12px"><span>' + t[0] + '</span><b>' + t[1] + '</b></div>'; }).join('');
}

/* ---------- step 1 ---------- */
HEP.add({ short: 'Predicted against observed', level: 'foundations', title: 'Predicted against observed clearance',
  change: 'Select a point. Change the extraction model and the binding corrections.',
  watch: 'Each point is one drug from Obach (1999). The predicted hepatic blood clearance is calculated from the human liver microsomal intrinsic clearance, scaled with 45 mg of microsomal protein per g of liver and 20 g of liver per kg, and the observed value is the nonrenal blood clearance from intravenous studies. The shaded band marks agreement within 2-fold. Three numbers summarise the 29 drugs: the count within 2-fold, the average fold error (the geometric mean of the absolute fold difference, 1.0 being perfect) and the bias (the geometric mean of predicted divided by observed). The same three numbers are used on every tab of this course.',
  build: function(api){
    var o = { model: 'pt', bind: 'both', sf: 1 }, sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="620" height="470" style="width:620px;height:470px;cursor:pointer"></canvas>' + hepLegend()), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tiles"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Extraction model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], o.model) + '</select>'), c2 = api.addControl('Binding <select class="b">' + hepOpts([['none', 'None'], ['blood', 'fu(blood) only'], ['both', 'fu(blood) and fu(microsomes)']], o.bind) + '</select>');
    function draw(){ var rows = hepRows(o); hepScatter(cvs, rows, sel); var sc = hepScore(rows); qs('.tiles', side).innerHTML = hepTiles(sc); var r = sel && rows.filter(function(x){ return x.d.name === sel.name; })[0]; qs('.det', side).innerHTML = hepDetail(r, o); api.stat('Average fold error ' + sc.gmfe.toFixed(2) + ', ' + sc.within2 + ' of ' + sc.n + ' within 2-fold'); }
    qs('.m', c1).addEventListener('change', function(){ o.model = this.value; draw(); }); qs('.b', c2).addEventListener('change', function(){ o.bind = this.value; draw(); });
    cvs.addEventListener('click', function(ev){ var r = hepHit(cvs, ev); sel = r ? r.d : null; draw(); });
    return { render: draw };
  } });

/* ---------- step 2 ---------- */
HEP.add({ short: 'Scaling to the liver', level: 'foundations', title: 'Scaling from microsomes to liver',
  change: 'Move the two scaling sliders. Read where the average fold error reaches its minimum.',
  watch: 'Microsomal clearance is scaled to the whole liver with the microsomal protein content per g of liver (MPPGL) and the liver weight per kg of body weight. Obach (1999) used 45 mg per g and 20 g per kg. The left plot recalculates the predictions with the values set below. The right plot gives the average fold error and the bias of the whole set as a function of the combined scaling factor, which multiplies CLint. For the parallel-tube model with both binding corrections and the published scalars (factor 1.0), the bias is 0.48, so predictions average about half the observed values, and 16 of 29 drugs are within 2-fold. The average fold error is lowest, 1.60, at a factor of about 3.2, and the bias reaches 1.0 at about 2.6.',
  build: function(api){
    var o = { model: 'pt', bind: 'both', sf: 1 }, mp = HMP0, lw = HLW0;
    var pn = api.el('pn', 'left:28px;top:16px;width:440px;height:508px;padding:8px', '<canvas width="424" height="470" style="width:424px;height:470px"></canvas>'), cvs = qs('canvas', pn);
    var pn2 = api.el('pn', 'left:484px;top:16px;width:448px;height:508px;padding:8px', '<canvas width="432" height="420" style="width:432px;height:420px"></canvas><div class="ro" style="font-size:12.5px;margin-top:6px"></div>'), cv2 = qs('canvas', pn2);
    var c1 = api.addControl('MPPGL <input type="range" class="mp" min="20" max="80" step="1" value="' + mp + '" style="width:150px"> <b class="mpv">' + mp + '</b> mg/g'), c2 = api.addControl('Liver weight <input type="range" class="lw" min="15" max="35" step="0.5" value="' + lw + '" style="width:150px"> <b class="lwv">' + lw + '</b> g/kg');
    var c3 = api.addControl('Extraction model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], o.model) + '</select>');
    function curve(){
      var g = cv(cv2), box = { l: 52, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x, lo = -0.8, hi = 0.8, ylo = Math.log10(0.1), yhi = Math.log10(10);
      var A = logAxes(g, box, lo, hi, 'Scaling factor on CLint', 'Average fold error, bias', ylo, yhi, [0.25, 0.5, 1, 2, 4], [0.1, 0.3, 1, 3, 10]);
      function line(fn, col){ x.strokeStyle = col; x.lineWidth = 2.6; x.beginPath(); for (var i = 0; i <= 80; i++) { var f = Math.pow(10, lo + (hi - lo) * i / 80), v = fn(f); var px = A.sx(f), py = A.sy(Math.max(Math.min(v, 9.9), 0.101)); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
      var base = { model: o.model, bind: o.bind };
      function sc(f){ return hepScore(hepRows({ model: base.model, bind: base.bind, sf: f })); }
      line(function(f){ return sc(f).gmfe; }, C.red); line(function(f){ return sc(f).bias; }, C.mid);
      var bestF = 1, bestV = 1e9; for (var i = 0; i <= 160; i++) { var f = Math.pow(10, lo + (hi - lo) * i / 160), v = sc(f).gmfe; if (v < bestV) { bestV = v; bestF = f; } }
      var cur = o.sf; x.strokeStyle = C.char; x.setLineDash([4, 4]); x.lineWidth = 1.2; x.beginPath(); x.moveTo(A.sx(cur), box.t); x.lineTo(A.sx(cur), box.b); x.stroke(); x.setLineDash([]);
      x.fillStyle = C.red; x.beginPath(); x.arc(A.sx(bestF), A.sy(bestV), 5, 0, 6.3); x.fill();
      x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillStyle = C.red; x.fillText('Average fold error', box.r - 120, box.t + 14); x.fillStyle = C.mid; x.fillText('Bias', box.r - 120, box.t + 28); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var here = sc(cur); qs('.ro', pn2).innerHTML = 'At the current factor of <b>' + cur.toFixed(2) + '</b>: average fold error <b>' + here.gmfe.toFixed(2) + '</b>, bias <b>' + here.bias.toFixed(2) + '</b>, ' + here.within2 + ' of ' + here.n + ' within 2-fold. Lowest average fold error <b>' + bestV.toFixed(2) + '</b> at a factor of <b>' + bestF.toFixed(2) + '</b>.';
    }
    function draw(){ o.sf = (mp / HMP0) * (lw / HLW0); var rows = hepRows(o); hepScatter(cvs, rows, null); curve(); api.stat('Scaling factor ' + o.sf.toFixed(2)); }
    qs('.mp', c1).addEventListener('input', function(){ mp = +this.value; qs('.mpv', c1).textContent = mp; draw(); });
    qs('.lw', c2).addEventListener('input', function(){ lw = +this.value; qs('.lwv', c2).textContent = lw; draw(); });
    qs('.m', c3).addEventListener('change', function(){ o.model = this.value; draw(); });
    return { render: draw };
  } });

/* ---------- step 3 ---------- */
HEP.add({ short: 'Extraction models', level: 'foundations', title: 'Hepatic extraction models',
  change: 'Move the blood flow and dispersion sliders. Select a drug to read its predictions under each model.',
  watch: 'The well-stirred model treats the liver as one mixed compartment. The parallel-tube model treats each sinusoid as a plug-flow tube. The dispersion model lies between them and is controlled by the dispersion number Dn: the plug-flow result is reached as Dn approaches 0 and the well-stirred result as Dn becomes large. The curves give the hepatic extraction ratio against the intrinsic clearance expressed relative to blood flow. At the same intrinsic clearance, the well-stirred extraction ratio is 9 percent lower than the parallel-tube value when the parallel-tube value is 0.2, and 18 percent lower when it is 0.5. The points are the Obach drugs, placed at their binding-corrected intrinsic clearance and at their observed extraction ratio.',
  build: function(api){
    var q = HQ, dn = 0.2, sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:600px;height:508px;padding:8px', '<canvas width="584" height="470" style="width:584px;height:470px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:644px;top:16px;width:288px;height:508px;overflow:auto', '<div class="det"></div>');
    var c1 = api.addControl('Blood flow <input type="range" class="q" min="12" max="30" step="1" value="' + q + '" style="width:140px"> <b class="qv">' + q + '</b> mL/min/kg'), c2 = api.addControl('Dispersion number <input type="range" class="dn" min="0.02" max="1.5" step="0.01" value="' + dn + '" style="width:140px"> <b class="dnv">' + dn.toFixed(2) + '</b>');
    function xin(d){ return d.clint * (d.fup / d.bp) / d.fum / q; }
    function draw(){
      var g = cv(cvs), box = { l: 56, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x, lo = -2, hi = 2;
      var A = logAxes(g, box, lo, hi, 'Binding-corrected CLint relative to blood flow', 'Hepatic extraction ratio', 0, 1, [0.01, 0.1, 1, 10, 100], []);
      var sy = function(e){ return box.b - e * (box.b - box.t); }, sx = function(v){ return A.sx(v); };
      x.fillStyle = C.mid; x.textAlign = 'right'; [0, 0.25, 0.5, 0.75, 1].forEach(function(e){ x.strokeStyle = C.silver; x.beginPath(); x.moveTo(box.l, sy(e)); x.lineTo(box.r, sy(e)); x.stroke(); x.fillText(e.toFixed(2), box.l - 6, sy(e) + 4); });
      function curve(fn, col, w, dash){ x.strokeStyle = col; x.lineWidth = w; x.setLineDash(dash || []); x.beginPath(); for (var i = 0; i <= 140; i++) { var v = Math.pow(10, lo + (hi - lo) * i / 140), e = fn(v * q) / q; i ? x.lineTo(sx(v), sy(e)) : x.moveTo(sx(v), sy(e)); } x.stroke(); x.setLineDash([]); }
      curve(function(c){ return mWS(q, c); }, C.mid, 2.6); curve(function(c){ return mPT(q, c); }, C.red, 2.6); curve(function(c){ return mDS(q, c, dn); }, C.tint, 2.6, [6, 4]);
      var rows = OBACH99.map(function(d){ var xv = xin(d), e = Math.min(d.obs / q, 1); return { d: d, px: sx(Math.min(Math.max(xv, 0.0101), 99)), py: sy(e), xv: xv }; });
      cvs._pts = rows.map(function(r){ return { x: r.px, y: r.py, r: r }; }); cvs._g = g;
      rows.forEach(function(r){ var on = sel && sel.name === r.d.name; x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = on ? 1 : 0.8; x.beginPath(); x.arc(r.px, r.py, on ? 7 : 4.5, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } });
      x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; [['Well-stirred', C.mid], ['Parallel-tube', C.red], ['Dispersion', C.tint]].forEach(function(l, i){ x.fillStyle = l[1]; x.fillRect(box.l + 10, box.t + 8 + i * 15, 14, 3); x.fillStyle = C.char; x.fillText(l[0], box.l + 30, box.t + 13 + i * 15); }); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var s = sel; var html;
      if (!s) html = '<div class="hint" style="font-size:12px">Select a point. Observed extraction ratio is the observed blood clearance divided by blood flow.</div>';
      else { var cl = s.clint * (s.fup / s.bp) / s.fum, rr = [['Binding-corrected CLint', hfx(cl) + ' mL/min/kg'], ['Observed CL', hfx(s.obs) + ' mL/min/kg'], ['Well-stirred', hfx(mWS(q, cl)) + ' (' + hfold(mWS(q, cl), s.obs) + ')'], ['Parallel-tube', hfx(mPT(q, cl)) + ' (' + hfold(mPT(q, cl), s.obs) + ')'], ['Dispersion', hfx(mDS(q, cl, dn)) + ' (' + hfold(mDS(q, cl, dn), s.obs) + ')'], ['Extraction, parallel-tube', (mPT(q, cl) / q).toFixed(2)]];
        html = '<div style="font-weight:700;font-size:14px;margin-bottom:4px;color:' + HCLS[s.cls][1] + '">' + s.name + '</div>' + rr.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:3px 0;font-size:12px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
      qs('.det', side).innerHTML = html;
      api.stat('Blood flow ' + q + ' mL/min/kg, dispersion number ' + dn.toFixed(2));
    }
    qs('.q', c1).addEventListener('input', function(){ q = +this.value; qs('.qv', c1).textContent = q; draw(); });
    qs('.dn', c2).addEventListener('input', function(){ dn = +this.value; qs('.dnv', c2).textContent = dn.toFixed(2); draw(); });
    cvs.addEventListener('click', function(ev){ var r = hepHit(cvs, ev); sel = r ? r.d : null; draw(); });
    return { render: draw };
  } });

/* ---------- step 4 ---------- */
HEP.add({ short: 'Binding assumptions', level: 'applied', title: 'Binding assumptions',
  change: 'Switch the extraction model and the form of fu(blood). Read which drugs are predicted worst.',
  watch: 'Three treatments of binding are compared: none, the unbound fraction in blood only, and the unbound fraction in blood together with the unbound fraction in the microsomal incubation. The bars give the average fold error for each compound class. Correcting only for binding in blood lowers the predicted clearance of highly bound drugs and over-corrects, because the nonspecific binding in the incubation lowers the measured CLint as well. Which treatment is best depends on the class: for the bases in this set no binding correction gives the lowest error, and for the acids the correction with both fractions does. The table lists the five drugs with the largest fold error for the settings selected.',
  build: function(api){
    var o = { model: 'pt', plasma: false };
    var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="470" style="width:544px;height:470px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<h4>Largest fold errors</h4><div class="wl"></div>');
    var c1 = api.addControl('Extraction model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], o.model) + '</select>'), c2 = api.addControl('fu(blood) <select class="f">' + hepOpts([['bp', 'fu plasma / blood to plasma ratio'], ['pl', 'fu plasma only']], 'bp') + '</select>');
    var BIND = [['none', 'None', C.silver], ['blood', 'fu(blood) only', C.tint], ['both', 'fu(blood) and fu(microsomes)', C.red]], GROUPS = [['base', 'Bases'], ['neutral', 'Neutrals'], ['acid', 'Acids'], [null, 'All 29']];
    function draw(){
      var g = cv(cvs), x = g.x, box = { l: 52, r: g.w - 14, t: 38, b: g.h - 40 }, ymax = 6, ylo = 1;
      var yv = function(v){ return box.b - (Math.min(v, ymax) - ylo) / (ymax - ylo) * (box.b - box.t); };
      x.textAlign = 'right'; x.fillStyle = C.mid; [1, 2, 3, 4, 5, 6].forEach(function(t){ x.strokeStyle = C.silver; x.beginPath(); x.moveTo(box.l, yv(t)); x.lineTo(box.r, yv(t)); x.stroke(); x.fillText(String(t), box.l - 6, yv(t) + 4); });
      x.strokeStyle = C.char; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(box.l, yv(2)); x.lineTo(box.r, yv(2)); x.stroke(); x.setLineDash([]);
      x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Average fold error', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var gw = (box.r - box.l) / GROUPS.length, bw = (gw - 22) / 3;
      GROUPS.forEach(function(gr, gi){ BIND.forEach(function(b, bi){ var rows = hepRows({ model: o.model, bind: b[0], plasma: o.plasma }, gr[0]), sc = hepScore(rows), bx = box.l + gi * gw + 11 + bi * bw; x.fillStyle = b[2]; x.fillRect(bx, yv(sc.gmfe), bw - 3, box.b - yv(sc.gmfe)); x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText(sc.gmfe.toFixed(2), bx + (bw - 3) / 2, yv(sc.gmfe) - 4); });
        x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.char; x.textAlign = 'center'; x.fillText(gr[1] + (gr[0] ? ' (' + OBACH99.filter(function(d){ return d.cls === gr[0]; }).length + ')' : ''), box.l + gi * gw + gw / 2, box.b + 18); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
      x.textAlign = 'left'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; var lx = box.l; BIND.forEach(function(b){ x.fillStyle = b[2]; x.fillRect(lx, 12, 12, 12); x.fillStyle = C.char; x.fillText(b[1], lx + 17, 22); lx += x.measureText(b[1]).width + 38; }); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var best = null, bs = 1e9; BIND.forEach(function(b){ var s = hepScore(hepRows({ model: o.model, bind: b[0], plasma: o.plasma })).gmfe; if (s < bs) { bs = s; best = b; } });
      var all = hepRows({ model: o.model, bind: 'both', plasma: o.plasma }).map(function(r){ return { r: r, f: Math.abs(Math.log10(r.p / r.d.obs)) }; }).sort(function(a, b){ return b.f - a.f; }).slice(0, 5);
      qs('.wl', side).innerHTML = '<div class="hint" style="font-size:12px;margin-bottom:6px">Settings: fu(blood) and fu(microsomes).</div>' + all.map(function(a){ return '<div style="display:flex;justify-content:space-between;border-top:1px solid ' + C.silver + ';padding:5px 0;font-size:12.5px"><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + HCLS[a.r.d.cls][1] + ';margin-right:6px"></i>' + a.r.d.name + '</span><b>' + hfold(a.r.p, a.r.d.obs) + '</b></div>'; }).join('') + '<div class="hint" style="font-size:12px;margin-top:10px">Lowest overall error: ' + best[1] + ' (' + bs.toFixed(2) + ').</div>';
      api.stat('Lowest overall average fold error: ' + best[1] + ', ' + bs.toFixed(2));
    }
    qs('.m', c1).addEventListener('change', function(){ o.model = this.value; draw(); }); qs('.f', c2).addEventListener('change', function(){ o.plasma = this.value === 'pl'; draw(); });
    return { render: draw };
  } });
