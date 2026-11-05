"use strict";
/* Tabs 01 to 03: the foundations. 01 The path of a drug, 02 Pharmacokinetic parameters, 03 Scoring predictions.
   Standard one-compartment relations; real values from Obach (2008) and Obach (1999). */

function fRows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:4px 0;font-size:12.5px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
function fTile(label, value, sub){ return '<div class="score" style="margin-bottom:8px"><b>' + label + '</b><div class="v" style="font-size:1.5rem">' + value + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>'; }
function fMarks(g, x, ts, labels, col){ ts.forEach(function(t, i){ x.strokeStyle = col || C.char; x.lineWidth = 1; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(g.sx(t), g.box.t); x.lineTo(g.sx(t), g.box.b); x.stroke(); x.setLineDash([]); x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(labels[i], g.sx(t), g.box.t + 12); }); x.font = '12px Aptos, "Segoe UI", sans-serif'; }

/* =========================== tab 01: the path of a drug =========================== */
var PATHN = [
  { k: 'dis', label: 'Dissolution', letter: 'A', what: 'Dissolution in gastric and intestinal fluid, limited by solubility and fluid volume.', assay: 'Solubility at several pH values', qty: 'Dose number, D0', where: 'Tab 09' },
  { k: 'perm', label: 'Gut wall permeation', letter: 'A', what: 'Passive permeability and efflux across the intestinal membrane determine the fraction absorbed, Fa.', assay: 'Caco-2 or PAMPA permeability', qty: 'Fa', where: 'Tab 09' },
  { k: 'gutm', label: 'Gut wall metabolism', letter: 'M', what: 'Gut-wall enzymes metabolize drug before the portal vein; the fraction escaping is Fg.', assay: 'Intestinal microsomes or S9', qty: 'Fg', where: 'Not predicted' },
  { k: 'liver', label: 'Liver, first pass', letter: 'M and E', what: 'First-pass metabolism and biliary excretion; the fraction escaping is Fh.', assay: 'Liver microsomes or hepatocytes', qty: 'CLint, CLh, Fh', where: 'Tabs 05, 07 and 09' },
  { k: 'blood', label: 'Blood and plasma', letter: 'D', what: 'Plasma protein binding and red-cell partitioning. In the models used, only unbound drug is cleared or distributes to tissue.', assay: 'Plasma protein binding, blood to plasma ratio', qty: 'fu, B:P', where: 'Tabs 02 and 08' },
  { k: 'tissue', label: 'Tissues', letter: 'D', what: 'Distribution into tissue, quantified by the volume of distribution.', assay: 'Tissue binding; Vss from animal or human data', qty: 'Vss, fut', where: 'Tabs 02 and 08' },
  { k: 'kidney', label: 'Kidney and bile', letter: 'E', what: 'Renal and biliary excretion add to hepatic metabolic clearance.', assay: 'Renal and biliary clearance; transporter assays', qty: 'CLr, CLbile', where: 'Tab 05; not predicted' }];
function ivPts(D, V, CL, T, step){ var k = CL / V, pts = [], t; for (t = 0; t <= T + 1e-9; t += step) pts.push([t, D / V * Math.exp(-k * t)]); return pts; }
/* =========================== tab 02: pharmacokinetic parameters =========================== */
MET.add({ short: 'Clearance and extraction', level: 'foundations', ord: 40, title: 'Clearance, flow and extraction',
  build: function(api){
    var Q = 21, E = 0.4;
    var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Blood flow Q <input type="range" class="q" min="5" max="40" step="1" value="' + Q + '" style="width:100px"> <b class="qv"></b> mL/min/kg'), c2 = api.addControl('Extraction E <input type="range" class="e" min="0" max="1" step="0.01" value="' + E + '" style="width:100px"> <b class="ev"></b>'), c3 = api.addControl('From drug <select class="d"><option value="">choose</option>' + OBACH99.map(function(d){ return '<option>' + d.name + '</option>'; }).join('') + '</select>');
    function draw(){
      qs('.qv', c1).textContent = Q; qs('.ev', c2).textContent = E.toFixed(2);
      var g = cv(cvs), x = g.x, L = 70, R = g.w - 30, T0 = 40, B0 = g.h - 70, hgt = B0 - T0, cl = Q * E, bw = 120;
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center';
      [['Inlet, Cin', 1, C.red, L + 80], ['Outlet, Cout', 1 - E, C.tint, L + 80 + 220]].forEach(function(b){ x.fillStyle = b[2]; x.fillRect(b[3], B0 - b[1] * hgt, bw, b[1] * hgt); x.fillStyle = C.char; x.fillText(b[0], b[3] + bw / 2, B0 + 18); x.fillText(b[1].toFixed(2) + ' x Cin', b[3] + bw / 2, B0 - b[1] * hgt - 8); });
      x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(L, B0); x.lineTo(R, B0); x.stroke(); x.textAlign = 'left'; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillText('Concentration relative to the inlet value', L, 24);
      x.strokeStyle = C.mid; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(L + 80 + bw, B0 - hgt); x.lineTo(L + 80 + 220, B0 - hgt); x.stroke(); x.setLineDash([]);
      qs('.tl', side).innerHTML = fTile('Clearance CL = Q x E', cl.toFixed(1) + ' mL/min/kg', 'upper limit: Q = ' + Q) + fRows([['Extraction ratio E', E.toFixed(2)], ['Fh = 1 - E', (1 - E).toFixed(2)], ['CL as share of Q', (100 * E).toFixed(0) + ' percent'], ['CL for a 70 kg adult', (cl * 70 * 60 / 1000).toFixed(1) + ' L/h']]);
      api.stat('CL = ' + cl.toFixed(1) + ' mL/min/kg');
    }
    qs('.q', c1).addEventListener('input', function(){ Q = +this.value; draw(); }); qs('.e', c2).addEventListener('input', function(){ E = +this.value; draw(); });
    qs('.d', c3).addEventListener('change', function(){ var d = OBACH99.filter(function(z){ return z.name === this.value; }.bind(this))[0]; if (d) { Q = 21; E = Math.min(1, d.obs / 21); qs('.q', c1).value = Q; qs('.e', c2).value = E; draw(); } });
    return { render: draw };
  } });

/* =========================== tab 03: scoring predictions =========================== */
function logTicks(lo, hi){ var o = []; for (var e = Math.ceil(lo); e <= Math.floor(hi); e++) o.push(Math.pow(10, e)); return o; }
VITRO.add({ short: 'Fold error', level: 'foundations', ord: 30, title: 'Fold error',
  build: function(api){
    var lp = 0.3, lo = 0.9;
    var pn = api.el('pn', 'left:28px;top:16px;width:520px;height:508px;padding:14px', '<canvas width="492" height="200" style="width:492px;height:200px"></canvas><div class="rd" style="margin-top:14px"></div>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:564px;top:16px;width:368px;height:508px;overflow:auto', '<h4>Six drugs, predicted against observed</h4><div class="tb"></div>');
    var c1 = api.addControl('Predicted <input type="range" class="p" min="-2" max="2" step="0.02" value="' + lp + '" style="width:130px"> <b class="pv"></b>'), c2 = api.addControl('Observed <input type="range" class="o" min="-2" max="2" step="0.02" value="' + lo + '" style="width:130px"> <b class="ov"></b>');
    function draw(){
      var p = Math.pow(10, lp), o = Math.pow(10, lo), r = p / o; qs('.pv', c1).textContent = hfx(p); qs('.ov', c2).textContent = hfx(o);
      var g = cv(cvs), x = g.x, L = 24, R = g.w - 24, y = 110, sx = function(v){ return L + (Math.log10(v) + 2) / 4 * (R - L); };
      x.strokeStyle = C.char; x.lineWidth = 1.4; x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke(); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; [0.01, 0.1, 1, 10, 100].forEach(function(v){ x.beginPath(); x.moveTo(sx(v), y - 5); x.lineTo(sx(v), y + 5); x.stroke(); x.fillText(String(v), sx(v), y + 22); });
      x.fillStyle = 'rgba(15,110,140,.12)'; x.fillRect(Math.max(L, sx(o / 2)), y - 40, Math.min(R, sx(o * 2)) - Math.max(L, sx(o / 2)), 80);
      x.fillStyle = C.char; x.beginPath(); x.arc(sx(o), y, 8, 0, 6.3); x.fill(); x.fillStyle = C.red; x.beginPath(); x.arc(sx(p), y, 8, 0, 6.3); x.fill();
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Observed', sx(o), y - 52); x.fillStyle = C.red; x.fillText('Predicted', sx(p), y + 52);
      x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.fillText('Shaded: within 2-fold of the observed value. Axis is logarithmic.', (L + R) / 2, 190);
      var fe = r >= 1 ? r : 1 / r;
      qs('.rd', pn).innerHTML = '<div class="score"><b>Fold error</b><div class="v">' + fe.toFixed(2) + (r >= 1 ? ' over' : ' under') + '</div><div class="s">predicted / observed = ' + r.toFixed(3) + '. ' + ((r >= 0.5 && r <= 2) ? 'Within 2-fold.' : 'Outside 2-fold.') + '</div></div>';
      var rows = ['Verapamil', 'Midazolam', 'Diazepam', 'Warfarin', 'Diclofenac', 'Zolpidem'].map(function(n){ var d = OBACH99.filter(function(z){ return z.name === n; })[0], pp = hepPredict(d, { model: 'pt', bind: 'both' }), f = pp / d.obs; return '<tr><td>' + n + '</td><td>' + hfx(d.obs) + '</td><td>' + hfx(pp) + '</td><td>' + (f >= 1 ? f.toFixed(1) + ' over' : (1 / f).toFixed(1) + ' under') + '</td></tr>'; }).join('');
      qs('.tb', side).innerHTML = '<table style="width:100%;font-size:12.5px;border-collapse:collapse"><tr style="text-align:left;color:' + C.mid + '"><th>Drug</th><th>Observed</th><th>Predicted</th><th>Fold error</th></tr>' + rows + '</table><div class="hint" style="font-size:11.5px;margin-top:8px">Clearance in mL/min/kg.</div>';
      api.stat('Fold error ' + fe.toFixed(2) + (r >= 1 ? ' over' : ' under'));
    }
    qs('.p', c1).addEventListener('input', function(){ lp = +this.value; draw(); }); qs('.o', c2).addEventListener('input', function(){ lo = +this.value; draw(); });
    return { render: draw };
  } });

VITRO.add({ short: 'Average fold error and bias', level: 'foundations', ord: 40, title: 'Average fold error and bias',
  build: function(api){
    var obs = [10, 10, 10, 10, 2, 2], pred = [20, 5, 10, 40, 1, 2];
    var pn = api.el('pn', 'left:28px;top:16px;width:420px;height:508px;padding:14px', '<table class="tb" style="width:100%;border-collapse:collapse;font-size:13px"></table><div style="margin-top:12px"><button type="button" class="btn sm ghost rs">Reset</button></div>');
    var side = api.el('pn', 'left:464px;top:16px;width:468px;height:508px;overflow:auto', '<div class="tl"></div><canvas width="440" height="190" style="width:440px;height:190px;margin-top:8px"></canvas>');
    var cvs = qs('canvas', side);
    function build(){ qs('.tb', pn).innerHTML = '<tr style="text-align:left;color:' + C.mid + '"><th>Drug</th><th>Observed</th><th>Predicted</th><th>Ratio</th></tr>' + obs.map(function(o, i){ return '<tr><td>' + 'ABCDEF'[i] + '</td><td><input type="number" data-o="' + i + '" value="' + o + '" step="any" min="0.001" style="width:80px"></td><td><input type="number" data-p="' + i + '" value="' + pred[i] + '" step="any" min="0.001" style="width:80px"></td><td class="r' + i + '"></td></tr>'; }).join(''); qsa('input', pn).forEach(function(inp){ inp.addEventListener('input', function(){ var v = parseFloat(inp.value); if (!(v > 0)) return; if (inp.dataset.o !== undefined) obs[+inp.dataset.o] = v; else pred[+inp.dataset.p] = v; draw(); }); }); }
    function draw(){
      var ls = obs.map(function(o, i){ return Math.log10(pred[i] / o); }), n = ls.length, mean = ls.reduce(function(a, b){ return a + b; }, 0) / n, mabs = ls.reduce(function(a, b){ return a + Math.abs(b); }, 0) / n, ar = obs.reduce(function(a, o, i){ return a + pred[i] / o; }, 0) / n, w2 = ls.filter(function(l){ return Math.abs(l) <= Math.log10(2) + 1e-9; }).length;
      obs.forEach(function(o, i){ var c = qs('.r' + i, pn); if (c) c.textContent = (pred[i] / o).toFixed(2); });
      qs('.tl', side).innerHTML = fTile('Average fold error', Math.pow(10, mabs).toFixed(2), 'size of the typical error') + fTile('Bias', Math.pow(10, mean).toFixed(2), 'direction: below 1 is under-prediction') + fRows([['Arithmetic mean of the ratios', ar.toFixed(2)], ['Within 2-fold', w2 + ' of ' + n]]);
      var g = cv(cvs), x = g.x, L = 30, R = g.w - 20, y0 = 20, y1 = g.h - 30, lo = -0.8, hi = 0.8, sx = function(l){ return L + (l - lo) / (hi - lo) * (R - L); };
      x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(L, y1); x.lineTo(R, y1); x.stroke(); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; [0.25, 0.5, 1, 2, 4].forEach(function(v){ x.beginPath(); x.moveTo(sx(Math.log10(v)), y1); x.lineTo(sx(Math.log10(v)), y1 + 4); x.stroke(); x.fillText(String(v), sx(Math.log10(v)), y1 + 16); });
      ls.forEach(function(l, i){ x.fillStyle = C.red; x.beginPath(); x.arc(sx(Math.max(lo, Math.min(hi, l))), y1 - 12 - i * 18, 6, 0, 6.3); x.fill(); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('ABCDEF'[i], sx(Math.max(lo, Math.min(hi, l))) + 10, y1 - 8 - i * 18); });
      x.strokeStyle = C.char; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(sx(mean), y0); x.lineTo(sx(mean), y1); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('bias', sx(mean), y0 - 4);
      api.stat('Average fold error ' + Math.pow(10, mabs).toFixed(2) + ', bias ' + Math.pow(10, mean).toFixed(2));
    }
    qs('.rs', pn).addEventListener('click', function(){ obs = [10, 10, 10, 10, 2, 2]; pred = [20, 5, 10, 40, 1, 2]; build(); draw(); });
    build();
    return { render: draw };
  } });

VITRO.add({ short: 'Why the log scale', level: 'foundations', ord: 50, title: 'Logarithmic scale',
  build: function(api){
    var ax = 'log';
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Axes <select class="a">' + hepOpts([['log', 'Logarithmic'], ['lin', 'Linear']], ax) + '</select>');
    function draw(){
      var rows = hepRows({ model: 'pt', bind: 'both' }), g = cv(cvs), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 };
      var lin = ax === 'lin', hi = lin ? 22 : 100, lo = lin ? 0 : 0.01;
      var sx = lin ? function(v){ return box.l + v / hi * (box.r - box.l); } : function(v){ return box.l + (Math.log10(v) + 2) / 4 * (box.r - box.l); };
      var sy = lin ? function(v){ return box.b - v / hi * (box.b - box.t); } : function(v){ return box.b - (Math.log10(v) + 2) / 4 * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", sans-serif';
      var ticks = lin ? [0, 5, 10, 15, 20] : [0.01, 0.1, 1, 10, 100];
      x.textAlign = 'right'; ticks.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(String(v), box.l - 6, sy(v) + 4); }); x.textAlign = 'center'; ticks.forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(String(v), sx(v), box.b + 16); });
      var a = lin ? 0 : 0.01, band = lin ? [[0, 0], [11, 22], [22, 22], [22, 11]] : [[0.01, 0.02], [50, 100], [100, 100], [100, 50], [0.02, 0.01], [0.01, 0.01]];
      x.fillStyle = 'rgba(15,110,140,.10)'; x.beginPath(); band.forEach(function(p, i){ i ? x.lineTo(sx(p[0]), sy(p[1])) : x.moveTo(sx(p[0]), sy(p[1])); }); x.closePath(); x.fill();
      x.strokeStyle = C.mid; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(sx(a), sy(a)); x.lineTo(sx(lin ? hi : 100), sy(lin ? hi : 100)); x.stroke(); x.setLineDash([]);
      rows.forEach(function(r){ x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = 0.85; x.beginPath(); x.arc(sx(Math.max(r.d.obs, lo * 1.01)), sy(Math.max(Math.min(r.p, hi), lo * 1.01)), 5, 0, 6.3); x.fill(); x.globalAlpha = 1; });
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText('Observed blood clearance (mL/min/kg)', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Predicted (mL/min/kg)', 0, 0); x.restore();
      var low = rows.filter(function(r){ return r.d.obs < 1; }).length;
      qs('.tl', side).innerHTML = fTile('Drugs below 1 mL/min/kg', low + ' of 29', 'observed clearance') + fRows([['Lowest observed', hfx(Math.min.apply(null, rows.map(function(r){ return r.d.obs; }))) + ' mL/min/kg'], ['Highest observed', hfx(Math.max.apply(null, rows.map(function(r){ return r.d.obs; }))) + ' mL/min/kg'], ['Range', Math.round(Math.max.apply(null, rows.map(function(r){ return r.d.obs; })) / Math.min.apply(null, rows.map(function(r){ return r.d.obs; }))) + '-fold']]) + hepLegend();
      api.stat(lin ? 'Linear axes' : 'Logarithmic axes');
    }
    qs('.a', c1).addEventListener('change', function(){ ax = this.value; draw(); });
    return { render: draw };
  } });
