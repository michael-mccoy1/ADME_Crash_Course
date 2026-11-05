"use strict";
/* Tab 02, the three steps with direct manipulation: linked unit fields and a clearance strip, a volume strip with
   nearest-drug selection, and a draggable fraction-unbound histogram. Data: Obach et al. (2008), n = 667. */
(function(){
  var W70 = 70, VP = OT.Vp * W70, VECF = (OT.Vp + OT.Ve) * W70, VTBW = (OT.Vp + OT.Ve + OT.Vr) * W70, GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function nm(d){ return d.name || d.id; }
  function p5(v){ return String(+v.toPrecision(5)); }
  function byName(a, b){ return a.n < b.n ? -1 : (a.n > b.n ? 1 : 0); }
  function jit(i){ return (i * 0.6180339887) % 1; }
  function opts(list, cur){ return list.map(function(d){ return '<option' + (d.n === cur ? ' selected' : '') + '>' + d.n + '</option>'; }).join(''); }

  /* ===== step 1: units and conversions ===== */
  UNITS.add({ short: 'Units and conversions', level: 'foundations', ord: 10, title: 'Units and conversions',
    build: function(api){
      var S = IX.state('un1', { mw: 400, c: 1, dose: 100, wt: 70, cl: 5 }), hv = -1, M = null;
      var pts = OBACH08.filter(function(d){ return d.cl > 0; }).map(function(d, i){ return { n: nm(d), cl: d.cl, j: jit(i) }; }).sort(function(a, b){ return a.cl - b.cl; });
      var GET = { mw: function(){ return S.mw; }, c: function(){ return S.c; }, mgl: function(){ return S.c * S.mw / 1000; }, ngml: function(){ return S.c * S.mw; }, dose: function(){ return S.dose; }, umol: function(){ return S.dose / S.mw * 1000; }, mgkg: function(){ return S.dose / S.wt; }, wt: function(){ return S.wt; }, cl: function(){ return S.cl; }, lh: function(){ return S.cl * S.wt * 0.06; }, mlmin: function(){ return S.cl * S.wt; }, lhkg: function(){ return S.cl * 0.06; } };
      var SET = { mw: function(v){ S.mw = v; }, c: function(v){ S.c = v; }, mgl: function(v){ S.c = v * 1000 / S.mw; }, ngml: function(v){ S.c = v / S.mw; }, dose: function(v){ S.dose = v; }, umol: function(v){ S.dose = v * S.mw / 1000; }, mgkg: function(v){ S.dose = v * S.wt; }, wt: function(v){ S.wt = v; }, cl: function(v){ S.cl = v; }, lh: function(v){ S.cl = v / (S.wt * 0.06); }, mlmin: function(v){ S.cl = v / S.wt; }, lhkg: function(v){ S.cl = v / 0.06; } };
      var GR = [['Concentration', [['mw', 'Molecular weight', 'g/mol'], ['c', 'Concentration', 'uM'], ['mgl', 'Concentration', 'mg/L'], ['ngml', 'Concentration', 'ng/mL']], 'mg/L = uM x MW / 1000. ng/mL = uM x MW.'], ['Dose', [['dose', 'Dose', 'mg'], ['umol', 'Dose', 'umol'], ['wt', 'Body weight', 'kg'], ['mgkg', 'Dose per weight', 'mg/kg']], 'umol = mg / MW x 1000.'], ['Clearance', [['cl', 'Clearance', 'mL/min/kg'], ['lh', 'Clearance', 'L/h'], ['mlmin', 'Clearance', 'mL/min'], ['lhkg', 'Clearance', 'L/h/kg']], 'L/h = mL/min/kg x weight x 60 / 1000.']];
      var pn = api.el('pn', 'left:28px;top:16px;width:440px;height:508px;overflow:auto;padding:10px 14px', GR.map(function(g){ return '<div class="ol" style="margin:6px 0 2px">' + g[0] + '</div>' + g[1].map(function(r){ return '<div style="display:grid;grid-template-columns:1fr 110px 74px;gap:8px;align-items:center;padding:2px 0;font-size:12.5px"><span>' + r[1] + '</span><input type="number" step="any" data-f="' + r[0] + '" style="width:110px;text-align:right;padding:3px 6px;border:1px solid ' + C.silver + ';border-radius:4px"><span style="color:' + C.mid + '">' + r[2] + '</span></div>'; }).join('') + '<div class="hint" style="font-size:11.5px;margin-top:2px">' + g[2] + '</div>'; }).join(''));
      var pn2 = api.el('pn', 'left:484px;top:16px;width:448px;height:508px;overflow:auto;padding:8px', '<canvas class="b" width="414" height="236" style="width:414px;height:236px"></canvas><div class="ro" style="font-size:12.5px;margin:4px 4px 8px;min-height:36px"></div><div class="ol" style="margin:0 4px 2px">Units used in this course</div><div class="c"></div>');
      var cvs = qs('.b', pn2);
      qs('.c', pn2).innerHTML = fRows([['Dose', 'mg, or mg/kg'], ['Plasma concentration', 'mg/L, ng/mL or uM'], ['Clearance', 'L/h, or mL/min/kg'], ['Volume of distribution', 'L, or L/kg'], ['Half-life, MRT', 'h'], ['AUC', 'mg x h/L'], ['CLint, microsomes', 'uL/min/mg protein'], ['CLint, hepatocytes', 'uL/min/10^6 cells'], ['CLint scaled to the body', 'mL/min/kg']]);
      var inputs = qsa('input[data-f]', pn);
      function fill(skip){ inputs.forEach(function(e){ if (e !== skip) e.value = p5(GET[e.dataset.f]()); }); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'unit-conversions', csv: function(){ var rows = [['Quantity', 'Value', 'Unit']]; GR.forEach(function(g){ g[1].forEach(function(r){ rows.push([r[1], GET[r[0]](), r[2]]); }); }); return IX.csv(rows); } });
      function draw(){
        var g = cv(cvs), x = g.x, lo = -2, hi = 3, L = 22, R = g.w - 14, ax = g.h - 34, t = 40;
        function sx(v){ return L + (cl(Math.log10(v), lo, hi) - lo) / (hi - lo) * (R - L); } function ixv(px){ return Math.pow(10, lo + (px - L) / (R - L) * (hi - lo)); }
        M = { x: x, box: { l: L, r: R, t: t, b: ax }, sx: sx, ix: ixv };
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Clearance of ' + pts.length + ' drugs (mL/min/kg; values beyond the axis at its edge)', L, 16); x.font = '11px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.mid; x.strokeStyle = C.silver; x.textAlign = 'center';
        for (var e = lo; e <= hi; e++) { x.beginPath(); x.moveTo(sx(Math.pow(10, e)), t); x.lineTo(sx(Math.pow(10, e)), ax); x.stroke(); x.fillText(String(+Math.pow(10, e).toPrecision(2)), sx(Math.pow(10, e)), ax + 14); }
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(L, ax); x.lineTo(R, ax); x.stroke();
        pts.forEach(function(p, i){ x.fillStyle = i === hv ? C.char : 'rgba(15,110,140,.55)'; x.beginPath(); x.arc(sx(p.cl), t + 8 + p.j * (ax - t - 16), i === hv ? 4.5 : 2.6, 0, 6.3); x.fill(); });
        IX.vline(M, sx(20), C.warn, [5, 4]); x.fillStyle = C.warn; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; x.fillText('hepatic blood flow, about 20', sx(20) - 4, t - 4);
        var cx = sx(cl(S.cl, Math.pow(10, lo) * 1.001, Math.pow(10, hi) * 0.999)); IX.vline(M, cx, C.red, []); x.fillStyle = C.red; x.beginPath(); x.moveTo(cx - 6, t); x.lineTo(cx + 6, t); x.lineTo(cx, t + 9); x.fill(); x.textAlign = 'left'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText(p5(+S.cl.toPrecision(3)), cx + 8, ax - 6);
        if (hv >= 0) { var p = pts[hv]; IX.tip(M, sx(p.cl), t + 8 + p.j * (ax - t - 16), [p.n, 'CL ' + fx(p.cl) + ' mL/min/kg', 'click to use']); }
        var rank = pts.filter(function(p){ return p.cl <= S.cl; }).length;
        qs('.ro', pn2).innerHTML = 'CL <b>' + p5(+S.cl.toPrecision(3)) + ' mL/min/kg</b> is the <b>' + Math.round(100 * rank / pts.length) + 'th percentile</b> of the set and <b>' + Math.round(100 * S.cl / 20) + '%</b> of hepatic blood flow. Drag the line or click a drug.';
        api.stat(fx(S.c) + ' uM = ' + fx(S.c * S.mw) + ' ng/mL');
      }
      function pick(p){ var b = -1, bd = 10, i; for (i = 0; i < pts.length; i++) { var dx = M.sx(pts[i].cl) - p.x, dy = (M.box.t + 8 + pts[i].j * (M.box.b - M.box.t - 16)) - p.y, d = Math.hypot(dx, dy); if (d < bd) { bd = d; b = i; } } return b; }
      inputs.forEach(function(e){ e.addEventListener('input', function(){ var v = parseFloat(this.value); if (!(v > 0) || !isFinite(v)) return; SET[this.dataset.f](v); IX.save('un1', S); fill(this); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = pick(p); cvs.style.cursor = near(p.x, M.sx(S.cl), 8) ? 'ew-resize' : (hv >= 0 ? 'pointer' : 'default'); draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ return (M && near(p.x, M.sx(S.cl), 9)) ? { k: 'cl' } : null; },
        drag: function(d, p){ S.cl = +cl(M.ix(p.x), 0.01, 1e4).toPrecision(3); fill(); draw(); },
        up: function(){ IX.save('un1', S); },
        click: function(p){ var i = pick(p); if (i >= 0) { S.cl = pts[i].cl; IX.save('un1', S); fill(); draw(); } }
      });
      fill();
      return { render: draw };
    } });

  /* ===== step 2: amount, concentration and volume ===== */
  UNITS.add({ short: 'Amount and volume', level: 'foundations', ord: 20, title: 'Amount, concentration and volume',
    build: function(api){
      var S = IX.state('un2', { d: 'Warfarin', D: 100, p: '' }), hv = -1, M = null;
      var all = OBACH08.filter(function(d){ return d.vss > 0; }).map(function(d, i){ return { n: nm(d), vss: d.vss, v: d.vss * W70, j: jit(i), d: d }; }), list = all.slice().sort(byName);
      function find(n){ return all.filter(function(z){ return z.n === n; })[0] || null; }
      if (!find(S.d)) S.d = 'Warfarin';
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="340" style="width:624px;height:340px"></canvas><div class="ro" style="font-size:13px;margin-top:8px;line-height:1.5"></div>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl('Drug <select class="dg">' + opts(list, S.d) + '</select>'), c2 = api.addControl(IX.slider('D', 'Dose', 10, 500, 10, S.D, 'mg'));
      IX.tools(api, { pin: function(){ S.p = S.d; IX.save('un2', S); draw(); }, clear: function(){ S.p = ''; IX.save('un2', S); draw(); }, canvases: function(){ return [cvs]; }, name: 'volume-of-distribution', csv: function(){ var rows = [['Drug', 'Vss (L/kg)', 'V for 70 kg (L)', 'C0 for the dose (mg/L)']]; all.forEach(function(z){ rows.push([z.n, z.vss, z.v, S.D / z.v]); }); return IX.csv(rows); } });
      var L = 30, AX = 190, T0 = 214, T1 = 296, lo = 0, hi = 4.8;
      function sx(v){ return L + (Math.log10(v) - lo) / (hi - lo) * (cvs._w - 30 - L); } function ixv(px){ return Math.pow(10, lo + (px - L) / (cvs._w - 30 - L) * (hi - lo)); }
      function sy(z){ return T0 + z.j * (T1 - T0); }
      function pick(p, tol){ var b = null, bd = tol, bx = null, bxd = 1e9; all.forEach(function(z){ var d = Math.hypot(sx(z.v) - p.x, sy(z) - p.y); if (d < bd) { bd = d; b = z; } var dx = Math.abs(sx(z.v) - p.x); if (dx < bxd) { bxd = dx; bx = z; } }); return { dot: b, x: bx }; }
      function draw(){
        qs('.Dv', c2).textContent = S.D; var d = find(S.d), pd = S.p ? find(S.p) : null, V = d.v, c0 = S.D / V, g = cv(cvs), x = g.x, R = g.w - 30; M = { x: x, box: { l: L, r: R, t: 10, b: 300 } };
        x.strokeStyle = C.char; x.lineWidth = 1.4; x.beginPath(); x.moveTo(L, AX); x.lineTo(R, AX); x.stroke(); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center';
        [1, 10, 100, 1000, 10000].forEach(function(v){ x.beginPath(); x.moveTo(sx(v), AX - 5); x.lineTo(sx(v), AX + 5); x.stroke(); x.fillText(String(v) + ' L', sx(v), AX + 20); });
        [['plasma', VP, 150], ['extracellular fluid', VECF, 120], ['body water', VTBW, 90]].forEach(function(r){ x.strokeStyle = C.warn; x.setLineDash([4, 4]); x.lineWidth = 1.3; x.beginPath(); x.moveTo(sx(r[1]), r[2] + 8); x.lineTo(sx(r[1]), AX); x.stroke(); x.setLineDash([]); x.fillStyle = C.warn; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText(r[0] + ' ' + r[1].toFixed(r[1] < 10 ? 2 : 1) + ' L', sx(r[1]), r[2]); });
        all.forEach(function(z, i){ x.fillStyle = z === all[hv] ? C.char : 'rgba(15,110,140,.5)'; x.beginPath(); x.arc(sx(z.v), sy(z), z === all[hv] ? 4.5 : 2.6, 0, 6.3); x.fill(); });
        if (pd) { x.strokeStyle = GREY; x.lineWidth = 2; x.beginPath(); x.arc(sx(pd.v), AX, 8, 0, 6.3); x.stroke(); x.fillStyle = C.mid; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('pinned ' + pd.n, Math.min(Math.max(sx(pd.v), 90), R - 90), 242 + 70); }
        x.fillStyle = C.char; x.beginPath(); x.arc(sx(V), AX, 8, 0, 6.3); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 1.6; x.stroke(); x.font = '600 13px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(d.n + ', V = ' + fx(V) + ' L', Math.min(Math.max(sx(V), 110), R - 110), 172 - 0);
        x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillText('Vss of ' + all.length + ' drugs for a 70 kg adult, logarithmic axis. Click or drag to select the nearest drug.', (L + R) / 2, 330);
        if (hv >= 0) { var z = all[hv]; IX.tip(M, sx(z.v), sy(z), [z.n, 'Vss ' + fx(z.vss) + ' L/kg', 'V ' + fx(z.v) + ' L']); }
        qs('.ro', pn).innerHTML = 'A ' + S.D + ' mg dose spread over ' + fx(V) + ' L gives a concentration of <b>' + fx(c0) + ' mg/L</b>. The volume is <b>' + (V / VTBW).toFixed(1) + ' times</b> the body water volume of 40.2 L.' + (pd ? ' Pinned ' + pd.n + ': ' + fx(S.D / pd.v) + ' mg/L, ratio ' + fx(c0 / (S.D / pd.v)) + '.' : '');
        qs('.sd', side).innerHTML = fTile('Vss', fx(d.vss) + ' L/kg', fx(V) + ' L for 70 kg') + fRows([['Fraction unbound in plasma', d.d.fu != null ? d.d.fu : 'not reported'], ['Clearance', fx(d.d.cl) + ' mL/min/kg'], ['Half-life', fx(d.d.t12) + ' h'], ['Relation to body water', V > VTBW ? 'above' : (V > VECF ? 'between extracellular fluid and body water' : 'below extracellular fluid')]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Hover a point for its name. Pin keeps a reference drug.</div>';
        api.stat(d.n + ', V = ' + fx(V) + ' L');
      }
      function choose(z){ S.d = z.n; qs('.dg', c1).value = z.n; }
      qs('.dg', c1).addEventListener('change', function(){ S.d = this.value; IX.save('un2', S); draw(); });
      qs('.D', c2).addEventListener('input', function(){ S.D = +this.value; IX.save('un2', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ var r = pick(p, 9); hv = r.dot ? all.indexOf(r.dot) : -1; cvs.style.cursor = 'pointer'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var r = pick(p, 9); choose(r.dot || r.x); draw(); return { k: 's' }; },
        drag: function(d, p){ var r = pick(p, 0); choose(r.x); draw(); },
        up: function(){ IX.save('un2', S); }
      });
      qs('.dg', c1).value = S.d;
      return { render: draw };
    } });

  /* ===== step 3: bound and unbound drug ===== */
  UNITS.add({ short: 'Bound and unbound drug', level: 'foundations', ord: 30, title: 'Bound and unbound drug',
    build: function(api){
      var S = IX.state('un3', { d: 'Warfarin', t: 0, p: '' }), hv = -1, sb = -1, M = null, NB = 24, LO = -4, HI = 0;
      var fus = OBACH08.filter(function(d){ return d.fu; }).map(function(d){ return { n: nm(d), fu: d.fu, lf: Math.log10(d.fu) }; }), list = fus.slice().sort(byName), bins = [], i;
      for (i = 0; i < NB; i++) bins.push([]);
      fus.forEach(function(z){ var k = Math.floor((z.lf - LO) / (HI - LO) * NB); if (k >= 0 && k < NB) bins[k].push(z); });
      function find(n){ return fus.filter(function(z){ return z.n === n; })[0] || null; }
      if (!find(S.d)) S.d = 'Warfarin';
      var pn = api.el('pn', 'left:28px;top:16px;width:420px;height:508px;padding:14px', '<div class="bars"></div><div class="ro" style="font-size:13px;margin-top:14px;line-height:1.5"></div>');
      var pn2 = api.el('pn', 'left:464px;top:16px;width:468px;height:508px;padding:8px', '<canvas width="452" height="320" style="width:452px;height:320px"></canvas><div class="lst" style="font-size:12px;padding:6px;line-height:1.9"></div>'), cvs = qs('canvas', pn2);
      var c1 = api.addControl('Drug <select class="dg">' + opts(list, S.d) + '</select>'), c2 = api.addControl(IX.slider('t', 'Total concentration', -2, 2, 0.05, S.t, 'mg/L (log)'));
      IX.tools(api, { pin: function(){ S.p = S.d; IX.save('un3', S); draw(); }, clear: function(){ S.p = ''; IX.save('un3', S); draw(); }, canvases: function(){ return [cvs]; }, name: 'fraction-unbound', csv: function(){ var rows = [['Drug', 'fu', 'Unbound at the total concentration (mg/L)']], tot = Math.pow(10, S.t); fus.forEach(function(z){ rows.push([z.n, z.fu, z.fu * tot]); }); return IX.csv(rows); } });
      function box(){ return { l: 40, r: cvs._w - 12, t: 26, b: cvs._h - 40 }; }
      function bx(lf){ var b = box(); return b.l + (lf - LO) / (HI - LO) * (b.r - b.l); }
      function draw(){
        var d = find(S.d), pd = S.p ? find(S.p) : null, tot = Math.pow(10, S.t), free = d.fu * tot; qs('.tv', c2).textContent = fx(tot);
        var bar = function(label, v, col){ return '<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>' + label + '</span><b>' + fx(v) + ' mg/L</b></div><div style="height:16px;background:' + C.light + ';border-radius:3px"><div style="height:16px;width:' + Math.max(0.5, 100 * v / tot).toFixed(1) + '%;background:' + col + ';border-radius:3px"></div></div></div>'; };
        qs('.bars', pn).innerHTML = '<div class="ol">Total plasma concentration split</div>' + bar('Total, C', tot, C.char) + bar('Unbound, Cu = fu x C', free, C.red) + bar('Bound', tot - free, C.tint) + (pd ? bar('Pinned ' + pd.n + ', unbound', pd.fu * tot, GREY) : '');
        qs('.ro', pn).innerHTML = d.n + ' has fu = <b>' + d.fu + '</b>, so <b>' + (100 * d.fu).toFixed(d.fu < 0.1 ? 2 : 0) + ' percent</b> of the drug in plasma is unbound. At a total concentration of ' + fx(tot) + ' mg/L the unbound concentration is ' + fx(free) + ' mg/L.' + (pd ? ' Pinned ' + pd.n + ' (fu ' + pd.fu + ') gives ' + fx(pd.fu * tot) + ' mg/L, ratio ' + fx(free / (pd.fu * tot)) + '.' : '');
        var g = cv(cvs), x = g.x, b = box(), bw = (b.r - b.l) / NB, ym = Math.max.apply(null, bins.map(function(a){ return a.length; })) * 1.1; M = { x: x, box: b };
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Fraction unbound, ' + fus.length + ' drugs', b.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        bins.forEach(function(a, k){ var hg = a.length / ym * (b.b - b.t); x.fillStyle = k === sb ? C.char : C.red; x.globalAlpha = k === hv ? 1 : 0.78; x.fillRect(b.l + k * bw + 1, b.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center';
        [0.0001, 0.001, 0.01, 0.1, 1].forEach(function(v){ var xp = bx(Math.log10(v)); x.beginPath(); x.moveTo(xp, b.b); x.lineTo(xp, b.b + 4); x.stroke(); x.fillText(String(v), xp, b.b + 16); });
        x.fillStyle = C.char; x.fillText('fu, logarithmic axis (drag the line to select the nearest drug)', (b.l + b.r) / 2, g.h - 6);
        if (pd) { x.strokeStyle = GREY; x.lineWidth = 2; x.beginPath(); x.moveTo(bx(pd.lf), b.t); x.lineTo(bx(pd.lf), b.b); x.stroke(); }
        var xm = bx(d.lf); x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.moveTo(xm, b.t); x.lineTo(xm, b.b); x.stroke(); x.fillStyle = C.char; x.beginPath(); x.moveTo(xm - 6, b.t - 2); x.lineTo(xm + 6, b.t - 2); x.lineTo(xm, b.t + 8); x.fill();
        if (hv >= 0) { var lo = Math.pow(10, LO + hv * (HI - LO) / NB), hi = Math.pow(10, LO + (hv + 1) * (HI - LO) / NB); IX.tip(M, b.l + (hv + 0.5) * bw, b.b - bins[hv].length / ym * (b.b - b.t), ['fu ' + +lo.toPrecision(2) + ' to ' + +hi.toPrecision(2), bins[hv].length + ' drugs', 'click to list']); }
        var ls = sb >= 0 ? bins[sb].slice().sort(byName) : [];
        qs('.lst', pn2).innerHTML = sb < 0 ? '<span style="color:' + C.mid + '">Click a bar to list its drugs, drag the line to move through the set.</span>' : '<b>' + ls.length + ' drugs with fu ' + +Math.pow(10, LO + sb * (HI - LO) / NB).toPrecision(2) + ' to ' + +Math.pow(10, LO + (sb + 1) * (HI - LO) / NB).toPrecision(2) + ':</b> ' + ls.slice(0, 14).map(function(z){ return '<a href="#" data-n="' + z.n + '" style="margin-right:8px;color:' + C.red + '">' + z.n + '</a>'; }).join(' ') + (ls.length > 14 ? ' and ' + (ls.length - 14) + ' more' : '');
        qsa('[data-n]', pn2).forEach(function(a){ a.addEventListener('click', function(ev){ ev.preventDefault(); S.d = a.dataset.n; qs('.dg', c1).value = S.d; IX.save('un3', S); draw(); }); });
        api.stat(d.n + ', fu ' + d.fu);
      }
      function binAt(p){ var b = box(); if (p.x < b.l || p.x > b.r || p.y < b.t || p.y > b.b) return -1; return cl(Math.floor((p.x - b.l) / ((b.r - b.l) / NB)), 0, NB - 1); }
      function nearest(p){ var lf = LO + (p.x - box().l) / (box().r - box().l) * (HI - LO), best = null, bd = 1e9; fus.forEach(function(z){ var dd = Math.abs(z.lf - lf); if (dd < bd) { bd = dd; best = z; } }); return best; }
      qs('.dg', c1).addEventListener('change', function(){ S.d = this.value; IX.save('un3', S); draw(); });
      qs('.t', c2).addEventListener('input', function(){ S.t = +this.value; IX.save('un3', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = binAt(p); cvs.style.cursor = near(p.x, bx(find(S.d).lf), 8) ? 'ew-resize' : (hv >= 0 ? 'pointer' : 'default'); draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ return (M && near(p.x, bx(find(S.d).lf), 9)) ? { k: 'fu' } : null; },
        drag: function(d, p){ S.d = nearest(p).n; qs('.dg', c1).value = S.d; draw(); },
        up: function(){ IX.save('un3', S); },
        click: function(p){ var k = binAt(p); sb = k === sb ? -1 : k; draw(); }
      });
      qs('.dg', c1).value = S.d;
      return { render: draw };
    } });
})();
