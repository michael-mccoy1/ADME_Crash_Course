"use strict";
/* Tabs 01 to 03: the foundations. 01 The path of a drug, 02 Pharmacokinetic parameters, 03 Scoring predictions.
   Standard one-compartment relations; real values from Obach (2008) and Obach (1999). */

function fRows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:4px 0;font-size:12.5px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
function fTile(label, value, sub){ return '<div class="score" style="margin-bottom:8px"><b>' + label + '</b><div class="v" style="font-size:1.5rem">' + value + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>'; }
function fMarks(g, x, ts, labels, col){ ts.forEach(function(t, i){ x.strokeStyle = col || C.char; x.lineWidth = 1; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(g.sx(t), g.box.t); x.lineTo(g.sx(t), g.box.b); x.stroke(); x.setLineDash([]); x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(labels[i], g.sx(t), g.box.t + 12); }); x.font = '12px Aptos, "Segoe UI", sans-serif'; }

/* =========================== tab 01: the path of a drug =========================== */
var PATHN = [
  { k: 'dis', label: 'Dissolution', letter: 'A', what: 'The dose dissolves in gastric and intestinal fluid. The solubility of the compound and the volume of fluid set how much of the dose can dissolve.', assay: 'Solubility at several pH values', qty: 'Dose number, D0', where: 'Tab 09, the steps on solubility' },
  { k: 'perm', label: 'Gut wall permeation', letter: 'A', what: 'Dissolved drug crosses the intestinal membrane into the gut wall. Passive permeability and efflux transporters control the fraction absorbed, Fa.', assay: 'Caco-2 or PAMPA permeability', qty: 'Fa', where: 'Tab 09, permeability and property rules' },
  { k: 'gutm', label: 'Gut wall metabolism', letter: 'M', what: 'Enzymes in the gut wall can metabolize the drug before it reaches the portal vein. The fraction that escapes is Fg.', assay: 'Intestinal microsomes or S9', qty: 'Fg', where: 'Named in tab 04 only. No public per-compound data were used.' },
  { k: 'liver', label: 'Liver, first pass', letter: 'M and E', what: 'All drug in the portal vein passes through the liver. Metabolism, and biliary excretion where it occurs, remove part of it. The fraction that escapes is Fh.', assay: 'Liver microsomes or hepatocytes', qty: 'CLint, CLh, Fh', where: 'Tab 05 for the principles, tab 07 for prediction, and the hepatic first-pass limit in tab 09' },
  { k: 'blood', label: 'Blood and plasma', letter: 'D', what: 'Drug in the systemic circulation binds to plasma proteins and may partition into red cells. In the simple models used here, only unbound drug is cleared or distributes into tissue.', assay: 'Plasma protein binding, blood to plasma ratio', qty: 'fu, B:P', where: 'Tab 02 for the principles, tab 08 for prediction' },
  { k: 'tissue', label: 'Tissues', letter: 'D', what: 'Drug distributes from blood into tissues, where it can bind. The extent of distribution is the volume of distribution.', assay: 'Tissue binding, or Vss from animal or human data', qty: 'Vss, fut', where: 'Tab 02 for the principles, tab 08 for prediction' },
  { k: 'kidney', label: 'Kidney and bile', letter: 'E', what: 'Drug leaves the body unchanged in urine and bile, or as metabolites. Renal and biliary clearance add to hepatic metabolic clearance.', assay: 'Renal and biliary clearance, transporter assays', qty: 'CLr, CLbile', where: 'Routes are described in tab 05. The ECCS in tab 07 names them. Not predicted.' }];
WHY.add({ short: 'Path of an oral dose', level: 'foundations', ord: 20, title: 'The path of an oral dose',
  build: function(api){
    var sel = 'dis';
    var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:14px', '<div class="nd" style="display:flex;gap:8px;flex-wrap:wrap"></div><div class="dt" style="margin-top:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"></div>');
    function draw(){
      var cur = PATHN.filter(function(n){ return n.k === sel; })[0];
      qs('.nd', pn).innerHTML = PATHN.map(function(n, i){ var on = n.k === sel; return '<button type="button" data-k="' + n.k + '" style="cursor:pointer;border:2px solid ' + (on ? C.red : C.silver) + ';background:' + (on ? C.light : '#fff') + ';border-radius:8px;padding:8px 12px;text-align:left;min-width:112px"><div style="font-size:11px;color:' + C.mid + '">' + (i + 1) + ', ' + n.letter + '</div><div style="font-weight:700;font-size:13px">' + n.label + '</div></button>'; }).join('');
      qsa('[data-k]', pn).forEach(function(b){ b.addEventListener('click', function(){ sel = b.dataset.k; draw(); }); });
      qs('.dt', pn).innerHTML = '<div style="grid-column:1/-1;font-size:14px;line-height:1.55;border:1px solid ' + C.silver + ';border-radius:8px;padding:12px 14px;background:#fff"><b>' + cur.label + '.</b> ' + cur.what + '</div>' + [['ADME letter', cur.letter], ['Typical in vitro assay', cur.assay], ['Quantity', cur.qty], ['Where in this course', cur.where]].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:10px 14px;background:#fff"><div class="ol" style="margin-bottom:2px">' + t[0] + '</div><div style="font-size:13.5px;font-weight:600">' + t[1] + '</div></div>'; }).join('');
      api.stat(cur.label);
    }
    return { render: draw };
  } });

function ivPts(D, V, CL, T, step){ var k = CL / V, pts = [], t; for (t = 0; t <= T + 1e-9; t += step) pts.push([t, D / V * Math.exp(-k * t)]); return pts; }
ELIM.add({ short: 'Intravenous profile', level: 'foundations', ord: 30, title: 'Concentration after an intravenous dose',
  build: function(api){
    var D = 100, V = 50, CL = 10, ax = 'lin';
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Dose <input type="range" class="d" min="10" max="500" step="10" value="' + D + '" style="width:90px"> <b class="dv"></b> mg'), c2 = api.addControl('V <input type="range" class="v" min="5" max="300" step="5" value="' + V + '" style="width:90px"> <b class="vv"></b> L'), c3 = api.addControl('CL <input type="range" class="c" min="1" max="50" step="1" value="' + CL + '" style="width:90px"> <b class="cv"></b> L/h'), c4 = api.addControl('Axis <select class="a">' + hepOpts([['lin', 'Concentration'], ['log', 'log10 concentration']], ax) + '</select>');
    function draw(){
      qs('.dv', c1).textContent = D; qs('.vv', c2).textContent = V; qs('.cv', c3).textContent = CL;
      var k = CL / V, th = 0.693 / k, T = Math.max(4 * th, 4), pts = ivPts(D, V, CL, T, T / 80), c0 = D / V, g, x = cvs.getContext('2d');
      if (ax === 'lin') g = lineChart(cvs, [{ pts: pts, color: C.red, nodot: true }], { xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', x0: 0, x1: T, y0: 0, y1: c0 * 1.1 });
      else { var lp = pts.map(function(p){ return [p[0], Math.log10(p[1])]; }); g = lineChart(cvs, [{ pts: lp, color: C.red, nodot: true }], { xl: 'Time (h)', yl: 'log10 of concentration (mg/L)', x0: 0, x1: T, y0: Math.log10(c0) - 1.6, y1: Math.log10(c0) + 0.1 }); }
      fMarks(g, g.x, [th, 2 * th, 3 * th].filter(function(t){ return t <= T; }), ['50%', '25%', '12.5%'], C.char);
      qs('.tl', side).innerHTML = fTile('Half-life', th.toFixed(1) + ' h', '0.693 x V / CL') + fRows([['C0 = dose / V', c0.toFixed(2) + ' mg/L'], ['k = CL / V', k.toFixed(3) + ' per h'], ['AUC = dose / CL', (D / CL).toFixed(1) + ' mg x h/L'], ['Concentration at 24 h', (c0 * Math.exp(-k * 24)).toFixed(3) + ' mg/L']]);
      api.stat('Half-life ' + th.toFixed(1) + ' h, AUC ' + (D / CL).toFixed(1) + ' mg x h/L');
    }
    qs('.d', c1).addEventListener('input', function(){ D = +this.value; draw(); }); qs('.v', c2).addEventListener('input', function(){ V = +this.value; draw(); }); qs('.c', c3).addEventListener('input', function(){ CL = +this.value; draw(); }); qs('.a', c4).addEventListener('change', function(){ ax = this.value; draw(); });
    return { render: draw };
  } });

ORAL.add({ short: 'Oral profile', level: 'foundations', ord: 10, title: 'Concentration after an oral dose',
  build: function(api){
    var F = 0.5, CL = 10, V = 50, ka = 1, D = 100;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('F <input type="range" class="f" min="0.05" max="1" step="0.01" value="' + F + '" style="width:90px"> <b class="fv"></b>'), c2 = api.addControl('CL <input type="range" class="c" min="1" max="50" step="1" value="' + CL + '" style="width:90px"> <b class="cv"></b> L/h'), c3 = api.addControl('V <input type="range" class="v" min="10" max="300" step="5" value="' + V + '" style="width:90px"> <b class="vv"></b> L'), c4 = api.addControl('ka <input type="range" class="a" min="0.1" max="5" step="0.1" value="' + ka + '" style="width:90px"> <b class="av"></b> 1/h');
    function draw(){
      qs('.fv', c1).textContent = F.toFixed(2); qs('.cv', c2).textContent = CL; qs('.vv', c3).textContent = V; qs('.av', c4).textContent = ka.toFixed(1);
      var ke = CL / V, kaa = Math.abs(ka - ke) < 1e-3 ? ka + 0.01 : ka, T = 24, iv = [], po = [], cmax = 0, tmax = 0, dt = 0.1, t, ci, cp;
      for (t = 0; t <= T + 1e-9; t += dt) { ci = D / V * Math.exp(-ke * t); cp = F * D * kaa / (V * (kaa - ke)) * (Math.exp(-ke * t) - Math.exp(-kaa * t)); if (cp > cmax) { cmax = cp; tmax = t; } if (Math.abs(t * 2 - Math.round(t * 2)) < 1e-6) { iv.push([t, ci]); po.push([t, cp]); } }
      lineChart(cvs, [{ pts: iv, color: C.mid, label: 'Intravenous', nodot: true }, { pts: po, color: C.red, label: 'Oral', nodot: true }], { xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', x0: 0, x1: T, y0: 0, y1: Math.max(D / V, cmax) * 1.1 });
      qs('.tl', side).innerHTML = fTile('AUC, oral', (F * D / CL).toFixed(2), 'mg x h/L = F x dose / CL') + fTile('AUC, intravenous', (D / CL).toFixed(2), 'mg x h/L = dose / CL') + '<div style="font-size:12px;color:' + C.mid + ';line-height:1.5">Oral Cmax ' + cmax.toFixed(2) + ' mg/L at ' + tmax.toFixed(1) + ' h. Half-life ' + (0.693 * V / CL).toFixed(1) + ' h. Dose ' + D + ' mg.</div>';
      api.stat('AUC oral ' + (F * D / CL).toFixed(2) + ', AUC intravenous ' + (D / CL).toFixed(2));
    }
    qs('.f', c1).addEventListener('input', function(){ F = +this.value; draw(); }); qs('.c', c2).addEventListener('input', function(){ CL = +this.value; draw(); }); qs('.v', c3).addEventListener('input', function(){ V = +this.value; draw(); }); qs('.a', c4).addEventListener('input', function(){ ka = +this.value; draw(); });
    return { render: draw };
  } });

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

ELIM.add({ short: 'Volume and half-life', level: 'foundations', ord: 40, title: 'Volume of distribution and half-life',
  build: function(api){
    var CL = 10, V1 = 40, V2 = 160, D = 100;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('CL <input type="range" class="c" min="1" max="50" step="1" value="' + CL + '" style="width:90px"> <b class="cv"></b> L/h'), c2 = api.addControl('V, drug A <input type="range" class="a" min="5" max="300" step="5" value="' + V1 + '" style="width:90px"> <b class="av"></b> L'), c3 = api.addControl('V, drug B <input type="range" class="b" min="5" max="300" step="5" value="' + V2 + '" style="width:90px"> <b class="bv"></b> L');
    function draw(){
      qs('.cv', c1).textContent = CL; qs('.av', c2).textContent = V1; qs('.bv', c3).textContent = V2;
      var t1 = 0.693 * V1 / CL, t2 = 0.693 * V2 / CL, T = Math.max(4 * Math.max(t1, t2), 6);
      lineChart(cvs, [{ pts: ivPts(D, V1, CL, T, T / 90), color: C.red, label: 'Drug A', nodot: true }, { pts: ivPts(D, V2, CL, T, T / 90), color: C.mid, label: 'Drug B', nodot: true }], { xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', x0: 0, x1: T, y0: 0, y1: D / Math.min(V1, V2) * 1.1 });
      qs('.tl', side).innerHTML = fTile('Half-life, drug A', t1.toFixed(1) + ' h', 'V = ' + V1 + ' L') + fTile('Half-life, drug B', t2.toFixed(1) + ' h', 'V = ' + V2 + ' L') + fRows([['Starting concentration, A', (D / V1).toFixed(2) + ' mg/L'], ['Starting concentration, B', (D / V2).toFixed(2) + ' mg/L'], ['AUC, both', (D / CL).toFixed(1) + ' mg x h/L'], ['Half-life ratio B / A', (t2 / t1).toFixed(2)]]);
      api.stat('Half-lives ' + t1.toFixed(1) + ' h and ' + t2.toFixed(1) + ' h');
    }
    qs('.c', c1).addEventListener('input', function(){ CL = +this.value; draw(); }); qs('.a', c2).addEventListener('input', function(){ V1 = +this.value; draw(); }); qs('.b', c3).addEventListener('input', function(){ V2 = +this.value; draw(); });
    return { render: draw };
  } });

ELIM.add({ short: 'Repeat dosing', level: 'foundations', ord: 50, title: 'Accumulation on repeat dosing',
  build: function(api){
    var tau = 12, CL = 10, V = 50, D = 100;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Interval <input type="range" class="t" min="2" max="48" step="1" value="' + tau + '" style="width:90px"> <b class="tv"></b> h'), c2 = api.addControl('CL <input type="range" class="c" min="1" max="50" step="1" value="' + CL + '" style="width:90px"> <b class="cv"></b> L/h'), c3 = api.addControl('V <input type="range" class="v" min="10" max="300" step="5" value="' + V + '" style="width:90px"> <b class="vv"></b> L');
    function draw(){
      qs('.tv', c1).textContent = tau; qs('.cv', c2).textContent = CL; qs('.vv', c3).textContent = V;
      var k = CL / V, th = 0.693 / k, T = Math.min(Math.max(8 * th, 5 * tau), 400), pts = [], t, n, c, css = D / (CL * tau), R = 1 / (1 - Math.exp(-k * tau)), cmaxss = D / V * R, cmin = cmaxss * Math.exp(-k * tau), peak = 0;
      for (t = 0; t <= T + 1e-9; t += T / 400) { c = 0; for (n = 0; n * tau <= t + 1e-9; n++) c += D / V * Math.exp(-k * (t - n * tau)); pts.push([t, c]); if (c > peak) peak = c; }
      var g = lineChart(cvs, [{ pts: pts, color: C.red, nodot: true }], { xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', x0: 0, x1: T, y0: 0, y1: peak * 1.1 }), ctx = g.x;
      ctx.strokeStyle = C.char; ctx.lineWidth = 1.4; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(g.box.l, g.sy(css)); ctx.lineTo(g.box.r, g.sy(css)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.char; ctx.font = '600 11px Aptos, "Segoe UI", sans-serif'; ctx.textAlign = 'right'; ctx.fillText('Css,avg = ' + css.toFixed(2) + ' mg/L', g.box.r - 6, g.sy(css) - 5);
      qs('.tl', side).innerHTML = fTile('Accumulation ratio R', R.toFixed(2), '1 / (1 - exp(-k x interval))') + fRows([['Half-life', th.toFixed(1) + ' h'], ['Interval / half-life', (tau / th).toFixed(2)], ['Css,avg = dose / (CL x interval)', css.toFixed(2) + ' mg/L'], ['Peak at steady state', cmaxss.toFixed(2) + ' mg/L'], ['Trough at steady state', cmin.toFixed(2) + ' mg/L'], ['Time to 90 percent of steady state', (3.32 * th).toFixed(0) + ' h']]);
      api.stat('R = ' + R.toFixed(2) + ', Css,avg = ' + css.toFixed(2) + ' mg/L');
    }
    qs('.t', c1).addEventListener('input', function(){ tau = +this.value; draw(); }); qs('.c', c2).addEventListener('input', function(){ CL = +this.value; draw(); }); qs('.v', c3).addEventListener('input', function(){ V = +this.value; draw(); });
    return { render: draw };
  } });

ELIM.add({ short: 'Checking a record', level: 'foundations', ord: 60, title: 'Checking a pharmacokinetic record',
  build: function(api){
    var cur = 'Verapamil', named = OBACH08.filter(function(d){ return d.name && d.cl > 0 && d.vss > 0 && d.mrt > 0 && d.t12 > 0; }).sort(function(a, b){ return a.name < b.name ? -1 : 1; });
    var all = OBACH08.filter(function(d){ return d.cl > 0 && d.vss > 0 && d.mrt > 0 && d.t12 > 0; });
    var pn = api.el('pn', 'left:28px;top:16px;width:300px;height:508px;overflow:auto', '<div class="tl"></div>');
    var pn2 = api.el('pn', 'left:344px;top:16px;width:588px;height:508px;padding:8px', '<canvas class="a" width="572" height="240" style="width:572px;height:240px"></canvas><canvas class="b" width="572" height="240" style="width:572px;height:240px"></canvas>');
    var ca = qs('.a', pn2), cb = qs('.b', pn2);
    var c1 = api.addControl('Drug <select class="d">' + named.map(function(d){ return '<option' + (d.name === cur ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select>');
    function hist(el, vals, mark, lo, hi, nb, title, xl){
      var g = cv(el), x = g.x, box = { l: 40, r: g.w - 12, t: 26, b: g.h - 40 }, cnt = new Array(nb).fill(0), bw = (box.r - box.l) / nb, i;
      vals.forEach(function(v){ var k = Math.floor((Math.log10(v) - lo) / (hi - lo) * nb); if (k >= 0 && k < nb) cnt[k]++; });
      var ym = Math.max.apply(null, cnt) * 1.1; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(title, box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
      cnt.forEach(function(c, k){ var hg = c / ym * (box.b - box.t); x.fillStyle = C.red; x.globalAlpha = 0.8; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [0.25, 0.5, 1, 2, 4].filter(function(v){ return Math.log10(v) >= lo && Math.log10(v) <= hi; }).forEach(function(v){ var xp = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.b); x.lineTo(xp, box.b + 4); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
      var xm = box.l + (Math.log10(mark) - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.moveTo(xm, box.t); x.lineTo(xm, box.b); x.stroke(); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('selected', xm, box.t - 2); x.font = '12px Aptos, "Segoe UI", sans-serif';
      x.fillText(xl, (box.l + box.r) / 2, g.h - 6);
    }
    function draw(){
      var d = named.filter(function(z){ return z.name === cur; })[0], mrtc = d.vss / d.cl * 1000 / 60, r1 = mrtc / d.mrt, r2 = 0.693 * d.mrt / d.t12;
      qs('.tl', pn).innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:6px">' + d.name + '</div><div class="ol">Reported</div>' + fRows([['CL', hfx(d.cl) + ' mL/min/kg'], ['Vss', hfx(d.vss) + ' L/kg'], ['MRT', hfx(d.mrt) + ' h'], ['Half-life', hfx(d.t12) + ' h'], ['CL for a 70 kg adult', hfx(d.cl * 70 * 60 / 1000) + ' L/h'], ['Vss for a 70 kg adult', hfx(d.vss * 70) + ' L']]) + '<div class="ol" style="margin-top:12px">Calculated</div>' + fRows([['MRT = Vss / CL x 1000 / 60', hfx(mrtc) + ' h'], ['Calculated over reported MRT', r1.toFixed(3)], ['0.693 x reported MRT', hfx(0.693 * d.mrt) + ' h'], ['That value over the half-life', r2.toFixed(2)]]);
      hist(ca, all.map(function(z){ return (z.vss / z.cl * 1000 / 60) / z.mrt; }), r1, Math.log10(0.8), Math.log10(1.25), 28, 'Calculated MRT over reported MRT', 'Ratio');
      hist(cb, all.map(function(z){ return 0.693 * z.mrt / z.t12; }), r2, Math.log10(0.25), Math.log10(2), 28, '0.693 x reported MRT over reported half-life', 'Ratio');
      api.stat(cur);
    }
    qs('.d', c1).addEventListener('change', function(){ cur = this.value; draw(); });
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

VITRO.add({ short: 'Why the log scale', level: 'foundations', ord: 50, title: 'Why a logarithmic scale',
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
