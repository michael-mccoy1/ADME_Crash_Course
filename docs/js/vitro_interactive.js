"use strict";
/* Tab 06, the five steps with direct manipulation: assay calculators against public distributions, a worked
   prediction with a draggable scale factor, draggable predicted and observed values, fold-error dots, and a brushed scatter. */
(function(){
  var GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }

  /* ===== step 1: quantities measured by in vitro assays ===== */
  var ASSAYS = [
    { k: 'mic', name: 'Microsomal stability', meas: 'Loss of compound in liver microsomes with NADPH.', par: 'In vitro half-life; CLint (uL/min/mg protein).', link: 'x 45 mg/g x 20 g/kg: CLint in mL/min/kg.', use: 'Tab 07', unit: 'uL/min/mg', lo: 0, hi: 3, x0: 1.2, src: 'AstraZeneca microsomal CLint, 96 compounds', vals: function(){ return AZCL.map(function(z){ return Math.log10(z.hlm); }); } },
    { k: 'hep', name: 'Hepatocyte stability', meas: 'Loss of compound in hepatocytes.', par: 'CLint (uL/min/10^6 cells).', link: 'x cells per g liver x 20 g/kg.', use: 'Tab 07', unit: 'uL/min/10^6 cells', lo: 0, hi: 3, x0: 1, src: 'AstraZeneca hepatocyte CLint, 96 compounds', vals: function(){ return AZCL.map(function(z){ return Math.log10(z.hep); }); } },
    { k: 'ppb', name: 'Plasma protein binding', meas: 'Plasma and buffer partition (for example equilibrium dialysis).', par: 'fu.', link: 'Corrects CLint; divided by B:P for blood; enters the fut prediction.', use: 'Tabs 07 and 08', unit: 'fu (log)', lo: -4, hi: 0, x0: -1, src: 'fu of 554 drugs, Obach et al. (2008)', vals: function(){ return OBACH08.filter(function(d){ return d.fu; }).map(function(d){ return Math.log10(d.fu); }); } },
    { k: 'bp', name: 'Blood to plasma ratio', meas: 'Whole-blood over plasma concentration.', par: 'B:P.', link: 'Converts plasma to blood clearance and fu(plasma) to fu(blood).', use: 'Tabs 07 and 08', unit: 'B:P', lo: 0.4, hi: 2.6, lin: true, x0: 1, src: 'B:P of 29 drugs, Obach (1999)', vals: function(){ return OBACH99.map(function(d){ return d.bp; }); } },
    { k: 'caco', name: 'Caco-2 permeability', meas: 'Flux across a Caco-2 monolayer.', par: 'Papp (cm/s).', link: 'Related to Fa through reference compounds.', use: 'Tab 09', unit: 'log10 Papp (cm/s)', lo: -8, hi: -3, x0: -5.3, src: 'Papp of 910 compounds, Wang et al. (2016)', vals: function(){ return CACO.map(function(d){ return d.y; }); } },
    { k: 'sol', name: 'Solubility', meas: 'Equilibrium solubility at a stated pH.', par: 'S (mg/mL or mol/L).', link: 'With dose and fluid volume gives D0.', use: 'Tab 09', unit: 'log10 S (mol/L)', lo: -8, hi: 0, x0: -3.5, src: 'logS of 9,980 compounds, AqSolDB', vals: function(){ return AQ.map(function(d){ return d[0]; }); } }];
  function outs(a, v){
    var x = a.lin ? v : Math.pow(10, v);
    if (a.k === 'mic') { var s = x * 45 * 20 / 1000; return [['CLint', fx(x) + ' uL/min/mg'], ['Scaled: x 45 mg/g x 20 g/kg / 1000', fx(s) + ' mL/min/kg'], ['Scaled CLint over liver blood flow (21)', fx(s / 21)]]; }
    if (a.k === 'hep') { var s2 = x * 120 * 20 / 1000; return [['CLint', fx(x) + ' uL/min/10^6 cells'], ['Scaled: x 120 x 10^6 cells/g x 20 g/kg / 1000', fx(s2) + ' mL/min/kg'], ['Scaled CLint over liver blood flow (21)', fx(s2 / 21)]]; }
    if (a.k === 'ppb') return [['fu', fx(x)], ['Bound', (100 * (1 - x)).toFixed(2) + ' percent'], ['Unbound at a total of 1 mg/L', fx(x) + ' mg/L'], ['CLint multiplier at B:P = 1', fx(x)]];
    if (a.k === 'bp') return [['Whole blood for 1 mg/L in plasma', fx(x) + ' mg/L'], ['Blood CL for a plasma CL of 10', fx(10 * x) + ' mL/min/kg'], ['fu(blood) for fu(plasma) = 0.1', fx(0.1 / x)]];
    if (a.k === 'caco') return [['Papp', x.toExponential(1) + ' cm/s'], ['Against the cutoff of 5 x 10^-6 cm/s', x >= 5e-6 ? 'at or above' : 'below']];
    var smg = x * 300 / 1000, d0 = (100 / 250) / smg; return [['S', x.toExponential(1) + ' mol/L'], ['S for MW 300', fx(smg) + ' mg/mL'], ['Dose number, 100 mg in 250 mL', fx(d0)], ['Dissolution limits absorption if D0 > 1', d0 > 1 ? 'yes' : 'no']];
  }
  VITRO.add({ short: 'What an assay measures', level: 'foundations', ord: 10, title: 'Quantities measured by in vitro assays',
    build: function(api){
      var S = IX.state('vt1', { a: 'mic', xs: {} }), hv = -1, M = null, NB = 28;
      var pn = api.el('pn', 'left:28px;top:16px;width:440px;height:508px;overflow:auto;padding:12px 14px', '<div class="cd"></div><div class="ol" style="margin:10px 0 2px">Calculation at the value set</div><div class="ou"></div>');
      var pn2 = api.el('pn', 'left:484px;top:16px;width:448px;height:508px;padding:8px', '<canvas width="432" height="330" style="width:432px;height:330px"></canvas><div class="hint dsc" style="font-size:12px;padding:6px"></div>'), cvs = qs('canvas', pn2);
      var c1 = api.addControl('Assay <select class="a">' + ASSAYS.map(function(a){ return '<option value="' + a.k + '"' + (a.k === S.a ? ' selected' : '') + '>' + a.name + '</option>'; }).join('') + '</select>'), c2 = api.addControl('Value <input type="range" class="x" step="0.02" style="width:150px"> <b class="xv"></b> <span class="un"></span>');
      function cur(){ return ASSAYS.filter(function(a){ return a.k === S.a; })[0]; }
      function xv(){ var a = cur(); return S.xs[a.k] !== undefined ? S.xs[a.k] : a.x0; }
      function setup(){ var a = cur(), el = qs('.x', c2); el.min = a.lo; el.max = a.hi; el.value = xv(); qs('.un', c2).textContent = a.unit; }
      var cache = {}; function vals(a){ return cache[a.k] || (cache[a.k] = a.vals()); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'assay-calculator', csv: function(){ var a = cur(), rows = [['Assay', a.name], ['Value (' + a.unit + ')', xv()], []]; outs(a, xv()).forEach(function(r){ rows.push(r); }); rows.push([], ['Distribution bin lower edge', 'Count']); var b = bins(a), i; for (i = 0; i < NB; i++) rows.push([a.lo + i * (a.hi - a.lo) / NB, b[i]]); return IX.csv(rows); } });
      function bins(a){ var b = new Array(NB).fill(0); vals(a).forEach(function(v){ var k = Math.floor((v - a.lo) / (a.hi - a.lo) * NB); if (k >= 0 && k < NB) b[k]++; else if (k === NB) b[NB - 1]++; }); return b; }
      function draw(){
        var a = cur(), v = xv(), b = bins(a), g = cv(cvs), x = g.x, box = { l: 40, r: g.w - 12, t: 28, b: g.h - 40 }, bw = (box.r - box.l) / NB, ym = Math.max.apply(null, b) * 1.12; M = { x: x, box: box };
        qs('.xv', c2).textContent = a.lin ? v.toFixed(2) : String(+v.toFixed(2));
        function bx(val){ return box.l + (val - a.lo) / (a.hi - a.lo) * (box.r - box.l); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(a.src, box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        b.forEach(function(c, k){ var hg = c / ym * (box.b - box.t); x.fillStyle = C.red; x.globalAlpha = k === hv ? 1 : 0.78; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; var st = a.lin ? 0.5 : (a.hi - a.lo > 5 ? 1 : 1), t; for (t = Math.ceil(a.lo / st) * st; t <= a.hi + 1e-9; t += st) { var px = bx(t); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(+t.toFixed(2)), px, box.b + 16); }
        x.fillStyle = C.char; x.fillText(a.unit + (a.lin ? '' : ' (logarithmic axis)'), (box.l + box.r) / 2, g.h - 6);
        var xm = bx(cl(v, a.lo, a.hi)); x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.moveTo(xm, box.t); x.lineTo(xm, box.b); x.stroke(); x.fillStyle = C.char; x.beginPath(); x.moveTo(xm - 6, box.t - 2); x.lineTo(xm + 6, box.t - 2); x.lineTo(xm, box.t + 8); x.fill();
        if (hv >= 0) IX.tip(M, box.l + (hv + 0.5) * bw, box.b - b[hv] / ym * (box.b - box.t), [(a.lo + hv * (a.hi - a.lo) / NB).toFixed(2) + ' to ' + (a.lo + (hv + 1) * (a.hi - a.lo) / NB).toFixed(2), b[hv] + ' compounds', 'click to set']);
        var below = vals(a).filter(function(z){ return z <= v; }).length; qs('.dsc', pn2).innerHTML = 'The value set is above ' + Math.round(100 * below / vals(a).length) + ' percent of the ' + vals(a).length + ' values. Drag the line or click a bar.';
        qs('.cd', pn).innerHTML = [['What is measured', a.meas], ['Parameter', a.par], ['Link to the clinic', a.link], ['Where the course uses it', a.use]].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:7px 12px;background:#fff;margin-bottom:6px"><div class="ol" style="margin-bottom:1px">' + t[0] + '</div><div style="font-size:13px;line-height:1.45">' + t[1] + '</div></div>'; }).join('');
        qs('.ou', pn).innerHTML = fRows(outs(a, v));
        api.stat(a.name + ': ' + outs(a, v)[0][1]);
      }
      qs('.a', c1).addEventListener('change', function(){ S.a = this.value; IX.save('vt1', S); setup(); draw(); });
      qs('.x', c2).addEventListener('input', function(){ S.xs[S.a] = +this.value; IX.save('vt1', S); draw(); });
      function binAt(p){ if (p.x < M.box.l || p.x > M.box.r || p.y < M.box.t || p.y > M.box.b) return -1; return cl(Math.floor((p.x - M.box.l) / ((M.box.r - M.box.l) / NB)), 0, NB - 1); }
      function setX(p){ var a = cur(); S.xs[a.k] = +cl(a.lo + (p.x - M.box.l) / (M.box.r - M.box.l) * (a.hi - a.lo), a.lo, a.hi).toFixed(2); qs('.x', c2).value = S.xs[a.k]; draw(); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = binAt(p); var a = cur(); cvs.style.cursor = near(p.x, M.box.l + (xv() - a.lo) / (a.hi - a.lo) * (M.box.r - M.box.l), 8) ? 'ew-resize' : (hv >= 0 ? 'pointer' : 'default'); draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var a = cur(); return near(p.x, M.box.l + (xv() - a.lo) / (a.hi - a.lo) * (M.box.r - M.box.l), 9) ? { k: 'x' } : null; },
        drag: function(d, p){ setX(p); },
        up: function(){ IX.save('vt1', S); },
        click: function(p){ if (binAt(p) >= 0) { var a = cur(), k = binAt(p); S.xs[a.k] = +(a.lo + (k + 0.5) * (a.hi - a.lo) / NB).toFixed(2); qs('.x', c2).value = S.xs[a.k]; IX.save('vt1', S); draw(); } }
      });
      setup();
      return { render: draw };
    } });

  /* ===== step 2: from assay to clearance ===== */
  VITRO.add({ short: 'From assay to clearance', level: 'foundations', ord: 20, title: 'From assay to clearance',
    build: function(api){
      var S = IX.state('vt2', { d: 'Verapamil', m: 'pt', sf: 0, n: 1 }), Q = HQ, hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:520px;height:508px;padding:12px', '<div class="grid" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"></div><div class="say" style="margin-top:10px;font-size:13px;line-height:1.5"></div>');
      var pn2 = api.el('pn', 'left:564px;top:16px;width:368px;height:508px;padding:8px', '<canvas width="352" height="400" style="width:352px;height:400px"></canvas><div class="nd" style="font-size:12px;padding:6px;line-height:1.5"></div>'), cvs = qs('canvas', pn2);
      var c1 = api.addControl('Drug <select class="d">' + hepOpts(OBACH99.map(function(d){ return [d.name, d.name]; }), S.d) + '</select>'), c2 = api.addControl('Model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], S.m) + '</select>'), c3 = api.addControl(IX.slider('f', 'CLint scale factor', -1, 1, 0.05, S.sf, 'x')), c4 = api.addControl('<button type="button" class="btn sm nx">Next</button> <button type="button" class="btn sm ghost rs">Show all</button> <button type="button" class="btn sm ghost mt">Match observation</button> <button type="button" class="btn sm ghost rt">Reset</button>');
      function dd(){ return OBACH99.filter(function(z){ return z.name === S.d; })[0]; }
      function pred(m, cl){ return m === 'pt' ? mPT(Q, cl) : mWS(Q, cl); }
      function need(d, m){ var o = d.obs; if (o >= Q) return Infinity; return m === 'pt' ? -Q * Math.log(1 - o / Q) : Q * o / (Q - o); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'assay-to-clearance', csv: function(){ var d = dd(), f = Math.pow(10, S.sf), fub = d.fup / d.bp, cl = fub * d.clint * f / d.fum; return IX.csv([['Quantity', 'Value'], ['Drug', d.name], ['Scaled CLint x factor (mL/min/kg)', d.clint * f], ['fu(blood)', fub], ['fu(mic)', d.fum], ['Corrected CLint (mL/min/kg)', cl], ['Predicted blood CL, well-stirred', mWS(Q, cl)], ['Predicted blood CL, parallel-tube', mPT(Q, cl)], ['Observed blood CL', d.obs]]); } });
      function draw(){
        var d = dd(), f = Math.pow(10, S.sf), fub = d.fup / d.bp, cl0 = fub * d.clint * f / d.fum, pr = pred(S.m, cl0), fe = pr / d.obs, shown = S.n; qs('.fv', c3).textContent = f.toFixed(2);
        var st = [['1. Scaled CLint', 'from the microsomal assay' + (Math.abs(S.sf) > 1e-9 ? ' x factor ' + f.toFixed(2) : ''), hfx(d.clint * f) + ' mL/min/kg'], ['2. fu(blood)', 'fu plasma / B:P = ' + d.fup + ' / ' + d.bp, fub.toFixed(3)], ['3. fu(mic)', 'unbound fraction in the incubation', String(d.fum)], ['4. Corrected CLint', 'fu(blood) x CLint / fu(mic)', hfx(cl0) + ' mL/min/kg'], ['5. Predicted blood CL', S.m === 'pt' ? 'Q x (1 - exp(-CL / Q)), Q = ' + Q : 'Q x CL / (Q + CL), Q = ' + Q, hfx(pr) + ' mL/min/kg'], ['6. Observed blood CL', 'intravenous studies', hfx(d.obs) + ' mL/min/kg']];
        qs('.grid', pn).innerHTML = st.map(function(s, i){ var on = i < shown; return '<div style="border:1px solid ' + (i === shown - 1 ? C.red : C.silver) + ';border-radius:8px;padding:10px 12px;background:#fff;opacity:' + (on ? 1 : 0.18) + ';transition:opacity .3s"><div class="ol" style="margin-bottom:3px">' + s[0] + '</div><div style="font-size:11.5px;color:' + C.mid + ';min-height:30px">' + s[1] + '</div><div style="font-size:19px;font-weight:700;margin-top:4px;color:' + (i === 5 ? C.dred : C.char) + '">' + (on ? s[2] : '') + '</div></div>'; }).join('');
        qs('.say', pn).innerHTML = shown < 6 ? 'Stage ' + shown + ' of 6.' : 'The predicted clearance is ' + hfx(pr) + ' mL/min/kg and the observed value is ' + hfx(d.obs) + ' mL/min/kg: ' + (fe >= 1 ? fe.toFixed(1) + '-fold above' : (1 / fe).toFixed(1) + '-fold below') + ' the observation, ' + ((fe >= 0.5 && fe <= 2) ? 'within' : 'outside') + ' 2-fold.';
        M = IX.chart(cvs, { xr: [0.05, 2000], xlog: true, yr: [0, 24], xl: 'Corrected CLint (mL/min/kg)', yl: 'Predicted blood CL (mL/min/kg)', series: [{ fn: function(c){ return mWS(Q, c); }, color: C.tint, w: S.m === 'ws' ? 3 : 1.8, label: 'Well-stirred' }, { fn: function(c){ return mPT(Q, c); }, color: C.mid, w: S.m === 'pt' ? 3 : 1.8, label: 'Parallel-tube' }] });
        IX.hline(M, M.sy(d.obs), C.warn, [5, 4]); lab(M, 'observed ' + hfx(d.obs), M.box.l + 8, M.sy(d.obs) - 5, C.warn); IX.hline(M, M.sy(Q), C.mid, [2, 4]); lab(M, 'Q = ' + Q, M.box.r - 4, M.sy(Q) - 5, C.mid, 'right');
        var nm = need(d, S.m); if (isFinite(nm) && nm >= 0.05 && nm <= 2000) { M.x.strokeStyle = C.warn; M.x.lineWidth = 1.2; M.x.setLineDash([2, 3]); M.x.beginPath(); M.x.moveTo(M.sx(nm), M.sy(d.obs)); M.x.lineTo(M.sx(nm), M.box.b); M.x.stroke(); M.x.setLineDash([]); }
        IX.dot(M, M.sx(cl(cl0, 0.05, 2000)), M.sy(pr), 7, C.red); lab(M, 'drag', M.sx(cl(cl0, 0.05, 2000)) + 10, M.sy(pr) + 16, C.red);
        if (hv !== null) { var cc = cl(hv, 0.05, 2000); IX.vline(M, M.sx(cc), C.mid, [2, 3]); IX.tip(M, M.sx(cc), M.sy(pred(S.m, cc)), ['CLint ' + hfx(cc), 'predicted ' + hfx(pred(S.m, cc)), 'fold ' + (pred(S.m, cc) / d.obs).toFixed(2)]); }
        var needed = need(d, S.m), nsf = isFinite(needed) ? needed * d.fum / (fub * d.clint) : NaN;
        qs('.nd', pn2).innerHTML = isFinite(nsf) ? 'Matching the observation with the ' + (S.m === 'pt' ? 'parallel-tube' : 'well-stirred') + ' model needs a corrected CLint of <b>' + hfx(needed) + '</b>, a factor of <b>' + nsf.toFixed(2) + '</b> on the scaled value (this drug: ' + hfx(cl0) + ' now).' : 'The observed clearance reaches the blood flow; no finite CLint reproduces it.';
        api.stat(S.d + ', ' + (S.m === 'pt' ? 'parallel-tube' : 'well-stirred'));
      }
      function sync(){ qs('.f', c3).value = S.sf; }
      qs('.d', c1).addEventListener('change', function(){ S.d = this.value; S.n = 1; S.sf = 0; sync(); IX.save('vt2', S); draw(); });
      qs('.m', c2).addEventListener('change', function(){ S.m = this.value; IX.save('vt2', S); draw(); });
      qs('.f', c3).addEventListener('input', function(){ S.sf = +this.value; IX.save('vt2', S); draw(); });
      qs('.nx', c4).addEventListener('click', function(){ S.n = Math.min(6, S.n + 1); draw(); });
      qs('.rs', c4).addEventListener('click', function(){ S.n = 6; draw(); });
      qs('.rt', c4).addEventListener('click', function(){ S.n = 1; S.sf = 0; sync(); draw(); });
      qs('.mt', c4).addEventListener('click', function(){ var d = dd(), nd = need(d, S.m), fub = d.fup / d.bp; if (isFinite(nd)) { S.sf = cl(Math.round(Math.log10(nd * d.fum / (fub * d.clint)) * 20) / 20, -1, 1); S.n = 6; sync(); IX.save('vt2', S); draw(); } });
      function dotPos(){ var d = dd(), f = Math.pow(10, S.sf), c0 = d.fup / d.bp * d.clint * f / d.fum; return [M.sx(cl(c0, 0.05, 2000)), M.sy(pred(S.m, cl(c0, 0.05, 2000)))]; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; var h = dotPos(); cvs.style.cursor = Math.hypot(p.x - h[0], p.y - h[1]) < 12 ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var h = dotPos(); return Math.hypot(p.x - h[0], p.y - h[1]) < 14 ? { k: 'sf' } : null; },
        drag: function(dr, p){ var d = dd(), fub = d.fup / d.bp, c = cl(M.ix(p.x), 0.05, 2000); S.sf = cl(Math.round(Math.log10(c * d.fum / (fub * d.clint)) * 20) / 20, -1, 1); S.n = 6; sync(); draw(); },
        up: function(){ IX.save('vt2', S); }
      });
      return { render: draw };
    } });

  /* ===== step 3: fold error ===== */
  VITRO.add({ short: 'Fold error', level: 'foundations', ord: 30, title: 'Fold error',
    build: function(api){
      var S = IX.state('vt3', { p: 0.3, o: 0.9 }), hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:520px;height:508px;padding:14px', '<canvas width="492" height="220" style="width:492px;height:220px"></canvas><div class="rd" style="margin-top:14px"></div>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:564px;top:16px;width:368px;height:508px;overflow:auto', '<h4>Six drugs, predicted against observed</h4><div class="tb"></div>');
      var c1 = api.addControl(IX.slider('p', 'Predicted', -2, 2, 0.02, S.p)), c2 = api.addControl(IX.slider('o', 'Observed', -2, 2, 0.02, S.o));
      var NAMES = ['Verapamil', 'Midazolam', 'Diazepam', 'Warfarin', 'Diclofenac', 'Zolpidem'], ROWS = NAMES.map(function(n){ var d = OBACH99.filter(function(z){ return z.name === n; })[0]; return { n: n, o: d.obs, p: hepPredict(d, { model: 'pt', bind: 'both' }) }; });
      function sync(){ qs('.p', c1).value = S.p; qs('.o', c2).value = S.o; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'fold-error', csv: function(){ var rows = [['Drug', 'Observed (mL/min/kg)', 'Predicted (mL/min/kg)', 'Predicted / observed']]; ROWS.forEach(function(r){ rows.push([r.n, r.o, r.p, r.p / r.o]); }); rows.push([], ['Set predicted', Math.pow(10, S.p)], ['Set observed', Math.pow(10, S.o)], ['Fold error', Math.pow(10, Math.abs(S.p - S.o))]); return IX.csv(rows); } });
      var L = 24;
      function draw(){
        var p = Math.pow(10, S.p), o = Math.pow(10, S.o), r = p / o; qs('.pv', c1).textContent = hfx(p); qs('.ov', c2).textContent = hfx(o);
        var g = cv(cvs), x = g.x, R = g.w - 24, y = 120, sx = function(v){ return L + (Math.log10(v) + 2) / 4 * (R - L); }; M = { x: x, box: { l: L, r: R, t: 40, b: 200 }, sx: sx };
        x.strokeStyle = C.char; x.lineWidth = 1.4; x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke(); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; [0.01, 0.1, 1, 10, 100].forEach(function(v){ x.beginPath(); x.moveTo(sx(v), y - 5); x.lineTo(sx(v), y + 5); x.stroke(); x.fillText(String(v), sx(v), y + 22); });
        x.fillStyle = 'rgba(15,110,140,.12)'; x.fillRect(Math.max(L, sx(o / 2)), y - 40, Math.min(R, sx(o * 2)) - Math.max(L, sx(o / 2)), 80);
        x.fillStyle = C.char; x.beginPath(); x.arc(sx(o), y, 8, 0, 6.3); x.fill(); x.fillStyle = C.red; x.beginPath(); x.arc(sx(p), y, 8, 0, 6.3); x.fill();
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Observed (drag)', sx(o), y - 52); x.fillStyle = C.red; x.fillText('Predicted (drag)', sx(p), y + 52);
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.fillText('Shaded: within 2-fold of the observed value. Axis is logarithmic.', (L + R) / 2, 208);
        if (hv !== null) { var hvv = Math.pow(10, hv); IX.vline(M, sx(hvv), C.mid, [2, 3]); IX.tip(M, sx(hvv), y - 20, [hfx(hvv) + ' mL/min/kg', 'versus observed: ' + (hvv / o).toFixed(2), 'versus predicted: ' + (hvv / p).toFixed(2)]); }
        var fe = r >= 1 ? r : 1 / r;
        qs('.rd', pn).innerHTML = '<div class="score"><b>Fold error</b><div class="v">' + fe.toFixed(2) + (r >= 1 ? ' over' : ' under') + '</div><div class="s">predicted / observed = ' + r.toFixed(3) + '. ' + ((r >= 0.5 && r <= 2) ? 'Within 2-fold.' : 'Outside 2-fold.') + '</div></div>';
        qs('.tb', side).innerHTML = '<table style="width:100%;font-size:12.5px;border-collapse:collapse"><tr style="text-align:left;color:' + C.mid + '"><th>Drug</th><th>Observed</th><th>Predicted</th><th>Fold error</th></tr>' + ROWS.map(function(r2){ var f = r2.p / r2.o; return '<tr data-n="' + r2.n + '" style="cursor:pointer"><td style="padding:3px 0;color:' + C.red + '">' + r2.n + '</td><td>' + hfx(r2.o) + '</td><td>' + hfx(r2.p) + '</td><td>' + (f >= 1 ? f.toFixed(1) + ' over' : (1 / f).toFixed(1) + ' under') + '</td></tr>'; }).join('') + '</table><div class="hint" style="font-size:11.5px;margin-top:8px">Clearance in mL/min/kg. Click a row to load the pair onto the axis.</div>';
        qsa('tr[data-n]', side).forEach(function(tr){ tr.addEventListener('click', function(){ var r2 = ROWS.filter(function(z){ return z.n === tr.dataset.n; })[0]; S.p = cl(Math.round(Math.log10(r2.p) * 50) / 50, -2, 2); S.o = cl(Math.round(Math.log10(r2.o) * 50) / 50, -2, 2); sync(); IX.save('vt3', S); draw(); }); });
        api.stat('Fold error ' + fe.toFixed(2) + (r >= 1 ? ' over' : ' under'));
      }
      qs('.p', c1).addEventListener('input', function(){ S.p = +this.value; IX.save('vt3', S); draw(); }); qs('.o', c2).addEventListener('input', function(){ S.o = +this.value; IX.save('vt3', S); draw(); });
      function which(p){ var dp = Math.abs(p.x - M.sx(Math.pow(10, S.p))), dob = Math.abs(p.x - M.sx(Math.pow(10, S.o))); if (Math.abs(p.y - 120) > 16) return null; if (dp <= 14 && dp <= dob) return 'p'; if (dob <= 14) return 'o'; return null; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; var w = which(p); hv = (p.x >= L && p.x <= M.box.r) ? Math.log10(10) * ((p.x - L) / (M.box.r - L) * 4 - 2) : null; cvs.style.cursor = w ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var w = which(p); return w ? { k: w } : null; },
        drag: function(d, p){ S[d.k] = cl(Math.round(((p.x - L) / (M.box.r - L) * 4 - 2) * 50) / 50, -2, 2); sync(); draw(); },
        up: function(){ IX.save('vt3', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 4: average fold error and bias ===== */
  VITRO.add({ short: 'Average fold error and bias', level: 'foundations', ord: 40, title: 'Average fold error and bias',
    build: function(api){
      var DEF = { obs: [10, 10, 10, 10, 2, 2], pred: [20, 5, 10, 40, 1, 2] }, S = IX.state('vt4', { obs: DEF.obs.slice(), pred: DEF.pred.slice() }), hv = -1, M = null;
      var obs = S.obs, pred = S.pred;
      var pn = api.el('pn', 'left:28px;top:16px;width:420px;height:508px;padding:14px', '<table class="tb" style="width:100%;border-collapse:collapse;font-size:13px"></table><div style="margin-top:12px"><button type="button" class="btn sm ghost rs">Reset</button></div>');
      var side = api.el('pn', 'left:464px;top:16px;width:468px;height:508px;overflow:auto', '<div class="sd"></div><canvas width="440" height="214" style="width:440px;height:214px;margin-top:8px"></canvas>'), cvs = qs('canvas', side);
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'average-fold-error', csv: function(){ var rows = [['Drug', 'Observed', 'Predicted', 'Ratio']]; obs.forEach(function(o, i){ rows.push(['ABCDEF'[i], o, pred[i], pred[i] / o]); }); return IX.csv(rows); } });
      var Lx = 30, lo = -0.8, hi = 0.8;
      function save(){ S.obs = obs; S.pred = pred; IX.save('vt4', S); }
      function build(){ qs('.tb', pn).innerHTML = '<tr style="text-align:left;color:' + C.mid + '"><th>Drug</th><th>Observed</th><th>Predicted</th><th>Ratio</th></tr>' + obs.map(function(o, i){ return '<tr><td>' + 'ABCDEF'[i] + '</td><td><input type="number" data-o="' + i + '" value="' + o + '" step="any" min="0.001" style="width:80px"></td><td><input type="number" data-p="' + i + '" value="' + pred[i] + '" step="any" min="0.001" style="width:80px"></td><td class="r' + i + '"></td></tr>'; }).join(''); qsa('input', pn).forEach(function(inp){ inp.addEventListener('input', function(){ var v = parseFloat(inp.value); if (!(v > 0)) return; if (inp.dataset.o !== undefined) obs[+inp.dataset.o] = v; else pred[+inp.dataset.p] = v; save(); draw(); }); }); }
      function fillInputs(){ qsa('input[data-p]', pn).forEach(function(inp){ inp.value = pred[+inp.dataset.p]; }); }
      function draw(){
        var ls = obs.map(function(o, i){ return Math.log10(pred[i] / o); }), n = ls.length, mean = ls.reduce(function(a, b){ return a + b; }, 0) / n, mabs = ls.reduce(function(a, b){ return a + Math.abs(b); }, 0) / n, ar = obs.reduce(function(a, o, i){ return a + pred[i] / o; }, 0) / n, w2 = ls.filter(function(l){ return Math.abs(l) <= Math.log10(2) + 1e-9; }).length;
        obs.forEach(function(o, i){ var c = qs('.r' + i, pn); if (c) c.textContent = (pred[i] / o).toFixed(2); });
        qs('.sd', side).innerHTML = fTile('Average fold error', Math.pow(10, mabs).toFixed(2), 'size of the typical error') + fTile('Bias', Math.pow(10, mean).toFixed(2), 'direction: below 1 is under-prediction') + fRows([['Arithmetic mean of the ratios', ar.toFixed(2)], ['Within 2-fold', w2 + ' of ' + n]]);
        var g = cv(cvs), x = g.x, R = g.w - 20, y0 = 20, y1 = g.h - 30, sx = function(l){ return Lx + (l - lo) / (hi - lo) * (R - Lx); }; M = { x: x, box: { l: Lx, r: R, t: y0, b: y1 }, sx: sx };
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(Lx, y1); x.lineTo(R, y1); x.stroke(); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; [0.25, 0.5, 1, 2, 4].forEach(function(v){ x.beginPath(); x.moveTo(sx(Math.log10(v)), y1); x.lineTo(sx(Math.log10(v)), y1 + 4); x.stroke(); x.fillText(String(v), sx(Math.log10(v)), y1 + 16); });
        x.strokeStyle = 'rgba(15,110,140,.5)'; x.setLineDash([2, 3]); [0.5, 2].forEach(function(v){ x.beginPath(); x.moveTo(sx(Math.log10(v)), y0); x.lineTo(sx(Math.log10(v)), y1); x.stroke(); }); x.setLineDash([]);
        ls.forEach(function(l, i){ var px = sx(cl(l, lo, hi)), py = y1 - 14 - i * 22; x.fillStyle = C.red; x.beginPath(); x.arc(px, py, i === hv ? 8 : 6, 0, 6.3); x.fill(); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('ABCDEF'[i], px + 11, py + 4); });
        x.strokeStyle = C.char; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(sx(mean), y0); x.lineTo(sx(mean), y1); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.textAlign = 'center'; x.fillText('bias', sx(mean), y0 - 4);
        if (hv >= 0) IX.tip(M, sx(cl(ls[hv], lo, hi)), y1 - 14 - hv * 22, ['Drug ' + 'ABCDEF'[hv], 'ratio ' + (pred[hv] / obs[hv]).toFixed(2), Math.abs(ls[hv]) <= Math.log10(2) + 1e-9 ? 'within 2-fold' : 'outside 2-fold']);
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; x.fillText('drag a dot to set the predicted value', R, y0 - 4);
        api.stat('Average fold error ' + Math.pow(10, mabs).toFixed(2) + ', bias ' + Math.pow(10, mean).toFixed(2));
      }
      function pick(p){ var i, b = -1, bd = 13; obs.forEach(function(o, k){ var l = Math.log10(pred[k] / o), d = Math.hypot(p.x - M.sx(cl(l, lo, hi)), p.y - (M.box.b - 14 - k * 22)); if (d < bd) { bd = d; b = k; } }); return b; }
      qs('.rs', pn).addEventListener('click', function(){ obs = DEF.obs.slice(); pred = DEF.pred.slice(); save(); build(); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = pick(p); cvs.style.cursor = hv >= 0 ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var i = pick(p); return i >= 0 ? { i: i } : null; },
        drag: function(d, p){ var l = cl((p.x - Lx) / (M.box.r - Lx) * (hi - lo) + lo, lo, hi); pred[d.i] = +(obs[d.i] * Math.pow(10, l)).toPrecision(3); fillInputs(); draw(); },
        up: function(){ save(); }
      });
      build();
      return { render: draw };
    } });

  /* ===== step 5: logarithmic scale, with brushing ===== */
  VITRO.add({ short: 'Why the log scale', level: 'foundations', ord: 50, title: 'Logarithmic scale',
    build: function(api){
      var S = IX.state('vt5', { ax: 'log' }), hv = -1, sel = -1, brush = null, chosen = [], PT = [], M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl('Axes <select class="a">' + hepOpts([['log', 'Logarithmic'], ['lin', 'Linear']], S.ax) + '</select>');
      var rows = hepRows({ model: 'pt', bind: 'both' });
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'log-scale-scatter', csv: function(){ var out = [['Drug', 'Class', 'Observed (mL/min/kg)', 'Predicted (mL/min/kg)', 'Fold error', 'Selected']]; rows.forEach(function(r, i){ out.push([r.d.name, r.d.cls, r.d.obs, r.p, r.p / r.d.obs, chosen.indexOf(i) >= 0 ? 'yes' : 'no']); }); return IX.csv(out); } });
      function draw(){
        var g = cv(cvs), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, lin = S.ax === 'lin', hi = lin ? 22 : 100, lo = lin ? 0 : 0.01; M = { x: x, box: box };
        var sx = lin ? function(v){ return box.l + v / hi * (box.r - box.l); } : function(v){ return box.l + (Math.log10(v) + 2) / 4 * (box.r - box.l); }, sy = lin ? function(v){ return box.b - v / hi * (box.b - box.t); } : function(v){ return box.b - (Math.log10(v) + 2) / 4 * (box.b - box.t); };
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", sans-serif';
        var ticks = lin ? [0, 5, 10, 15, 20] : [0.01, 0.1, 1, 10, 100];
        x.textAlign = 'right'; ticks.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(String(v), box.l - 6, sy(v) + 4); }); x.textAlign = 'center'; ticks.forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(String(v), sx(v), box.b + 16); });
        var a = lin ? 0 : 0.01, band = lin ? [[0, 0], [11, 22], [22, 22], [22, 11]] : [[0.01, 0.02], [50, 100], [100, 100], [100, 50], [0.02, 0.01], [0.01, 0.01]];
        x.fillStyle = 'rgba(15,110,140,.10)'; x.beginPath(); band.forEach(function(p, i){ i ? x.lineTo(sx(p[0]), sy(p[1])) : x.moveTo(sx(p[0]), sy(p[1])); }); x.closePath(); x.fill();
        x.strokeStyle = C.mid; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(sx(a), sy(a)); x.lineTo(sx(lin ? hi : 100), sy(lin ? hi : 100)); x.stroke(); x.setLineDash([]);
        PT = rows.map(function(r, i){ var px = sx(Math.max(r.d.obs, lo * 1.01)), py = sy(Math.max(Math.min(r.p, hi), lo * 1.01)); return { x: px, y: py, i: i }; });
        rows.forEach(function(r, i){ var pt = PT[i], on = chosen.indexOf(i) >= 0 || sel === i; x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = chosen.length && !on ? 0.25 : 0.88; x.beginPath(); x.arc(pt.x, pt.y, i === hv || on ? 7 : 5, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on || i === hv) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } });
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText('Observed blood clearance (mL/min/kg)', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Predicted (mL/min/kg)', 0, 0); x.restore();
        if (brush) { x.strokeStyle = C.char; x.lineWidth = 1.4; x.setLineDash([4, 3]); x.fillStyle = 'rgba(52,55,63,.08)'; var bx0 = Math.min(brush.x0, brush.x1), by0 = Math.min(brush.y0, brush.y1); x.fillRect(bx0, by0, Math.abs(brush.x1 - brush.x0), Math.abs(brush.y1 - brush.y0)); x.strokeRect(bx0, by0, Math.abs(brush.x1 - brush.x0), Math.abs(brush.y1 - brush.y0)); x.setLineDash([]); }
        if (hv >= 0) { var r = rows[hv]; IX.tip(M, PT[hv].x, PT[hv].y, [r.d.name, 'observed ' + hfx(r.d.obs), 'predicted ' + hfx(r.p), 'fold ' + (r.p / r.d.obs >= 1 ? (r.p / r.d.obs).toFixed(1) + ' over' : (r.d.obs / r.p).toFixed(1) + ' under')]); }
        var low = rows.filter(function(r){ return r.d.obs < 1; }).length, obsv = rows.map(function(r){ return r.d.obs; });
        var use = chosen.length ? chosen : (sel >= 0 ? [sel] : []), stat = '';
        if (use.length) { var sub = use.map(function(i){ return rows[i]; }), ls = sub.map(function(r){ return Math.log10(r.p / r.d.obs); }), n = ls.length; stat = '<div class="ol" style="margin:8px 0 2px">' + (chosen.length ? 'Selected by brush' : 'Selected drug') + '</div>' + fRows([['Drugs', n + (n === 1 ? ' (' + sub[0].d.name + ')' : '')], ['Average fold error', Math.pow(10, ls.reduce(function(s, l){ return s + Math.abs(l); }, 0) / n).toFixed(2)], ['Bias', Math.pow(10, ls.reduce(function(s, l){ return s + l; }, 0) / n).toFixed(2)], ['Within 2-fold', ls.filter(function(l){ return Math.abs(l) <= Math.log10(2) + 1e-9; }).length + ' of ' + n]]); }
        qs('.sd', side).innerHTML = fTile('Drugs below 1 mL/min/kg', low + ' of 29', 'observed clearance') + fRows([['Lowest observed', hfx(Math.min.apply(null, obsv)) + ' mL/min/kg'], ['Highest observed', hfx(Math.max.apply(null, obsv)) + ' mL/min/kg'], ['Range', Math.round(Math.max.apply(null, obsv) / Math.min.apply(null, obsv)) + '-fold']]) + stat + hepLegend() + '<div class="hint" style="font-size:11.5px;margin-top:6px">Hover for names, click a drug, or drag a rectangle to select several.</div>';
        api.stat(lin ? 'Linear axes' : 'Logarithmic axes');
      }
      qs('.a', c1).addEventListener('change', function(){ S.ax = this.value; chosen = []; sel = -1; IX.save('vt5', S); draw(); });
      function near1(p){ var b = -1, bd = 11; PT.forEach(function(q){ var d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; b = q.i; } }); return b; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = near1(p); cvs.style.cursor = hv >= 0 ? 'pointer' : 'crosshair'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ if (!M.box || p.x < M.box.l || p.x > M.box.r || p.y < M.box.t || p.y > M.box.b) return null; brush = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; return { k: 'brush' }; },
        drag: function(d, p){ brush.x1 = cl(p.x, M.box.l, M.box.r); brush.y1 = cl(p.y, M.box.t, M.box.b); var xa = Math.min(brush.x0, brush.x1), xb = Math.max(brush.x0, brush.x1), ya = Math.min(brush.y0, brush.y1), yb = Math.max(brush.y0, brush.y1); chosen = PT.filter(function(q){ return q.x >= xa && q.x <= xb && q.y >= ya && q.y <= yb; }).map(function(q){ return q.i; }); sel = -1; draw(); },
        up: function(d, p){ var small = Math.abs(brush.x1 - brush.x0) < 4 && Math.abs(brush.y1 - brush.y0) < 4; brush = null; if (small) { var i = near1(p); chosen = []; sel = i >= 0 && i !== sel ? i : -1; } draw(); }
      });
      return { render: draw };
    } });
})();
