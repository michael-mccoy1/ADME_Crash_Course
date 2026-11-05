"use strict";
/* New foundation steps for tabs 01 to 06. Standard relations; real values from Obach (2008) and Obach (1999).
   Reference volumes for a 70 kg adult use the Oie-Tozer constants (Coutinho et al., 2024): plasma 3.05 L, extracellular fluid 13.6 L, body water 40.2 L. */
(function(){
  var W70 = 70, VP = OT.Vp * W70, VECF = (OT.Vp + OT.Ve) * W70, VTBW = (OT.Vp + OT.Ve + OT.Vr) * W70;
  function fx(v){ return v < 0.01 ? v.toExponential(1) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString()))); }
  function sld(cls, label, min, max, step, val, unit){ return label + ' <input type="range" class="' + cls + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" style="width:100px"> <b class="' + cls + 'v"></b>' + (unit ? ' ' + unit : ''); }
  function logHist(el, vals, mark, lo, hi, nb, title, xl, ticks){
    var g = cv(el), x = g.x, box = { l: 40, r: g.w - 12, t: 26, b: g.h - 40 }, cnt = new Array(nb).fill(0), bw = (box.r - box.l) / nb;
    vals.forEach(function(v){ var k = Math.floor((Math.log10(v) - lo) / (hi - lo) * nb); if (k >= 0 && k < nb) cnt[k]++; });
    var ym = Math.max.apply(null, cnt) * 1.1; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(title, box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
    cnt.forEach(function(c, k){ var hg = c / ym * (box.b - box.t); x.fillStyle = C.red; x.globalAlpha = 0.8; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
    x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; ticks.forEach(function(v){ var xp = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.b); x.lineTo(xp, box.b + 4); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
    if (mark) { var xm = box.l + (Math.log10(mark) - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.moveTo(xm, box.t); x.lineTo(xm, box.b); x.stroke(); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('selected', xm, box.t - 2); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
    x.fillStyle = C.char; x.fillText(xl, (box.l + box.r) / 2, g.h - 6);
  }

  /* ===== tab 01, step 1: concentration and effect ===== */
  WHY.add({ short: 'Concentration and effect', level: 'foundations', ord: 10, title: 'Dose, concentration and effect',
    build: function(api){
      var lec = 0, h = 1, D = 100, CL = 10, V = 50;
      var pn = api.el('pn', 'left:28px;top:16px;width:440px;height:508px;padding:8px', '<canvas width="424" height="440" style="width:424px;height:440px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>'), ca = qs('canvas', pn);
      var pn2 = api.el('pn', 'left:484px;top:16px;width:448px;height:508px;padding:8px', '<canvas width="432" height="440" style="width:432px;height:440px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px"></div>'), cb = qs('canvas', pn2);
      var c1 = api.addControl(sld('e', 'EC50', -1, 1, 0.05, lec, 'mg/L')), c2 = api.addControl(sld('h', 'Steepness h', 0.5, 4, 0.1, h)), c3 = api.addControl(sld('d', 'Dose', 10, 500, 10, D, 'mg')), c4 = api.addControl(sld('c', 'CL', 2, 40, 1, CL, 'L/h'));
      function eff(C, ec){ return 100 * Math.pow(C, h) / (Math.pow(ec, h) + Math.pow(C, h)); }
      function draw(){
        var ec = Math.pow(10, lec), k = CL / V, c0 = D / V, th = 0.693 / k; qs('.ev', c1).textContent = ec.toFixed(2); qs('.hv', c2).textContent = h.toFixed(1); qs('.dv', c3).textContent = D; qs('.cv', c4).textContent = CL;
        var pts = [], i; for (i = 0; i <= 100; i++) { var C = 10 * i / 100; pts.push([C, eff(C, ec)]); }
        var g = lineChart(ca, [{ pts: pts, color: C.red, nodot: true }], { xl: 'Concentration (mg/L)', yl: 'Effect (percent of Emax)', x0: 0, x1: 10, y0: 0, y1: 100 }), x = g.x;
        x.strokeStyle = C.char; x.setLineDash([4, 4]); x.lineWidth = 1.3; x.beginPath(); x.moveTo(g.sx(ec), g.box.b); x.lineTo(g.sx(ec), g.sy(50)); x.lineTo(g.box.l, g.sy(50)); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('EC50', g.sx(ec) + 4, g.box.b - 6);
        var ep = eff(Math.min(c0, 10), ec); x.fillStyle = C.red; x.beginPath(); x.arc(g.sx(Math.min(c0, 10)), g.sy(ep), 6, 0, 6.3); x.fill(); x.fillStyle = C.char; x.fillText('peak', g.sx(Math.min(c0, 10)) + 8, g.sy(ep) - 6);
        qs('.ra', pn).innerHTML = 'Peak concentration <b>' + c0.toFixed(2) + ' mg/L</b> gives <b>' + ep.toFixed(0) + ' percent</b> of the maximal effect.';
        var T = Math.max(4 * th, 4), cp = []; for (i = 0; i <= 100; i++) { var t = T * i / 100; cp.push([t, c0 * Math.exp(-k * t)]); }
        var g2 = lineChart(cb, [{ pts: cp, color: C.mid, nodot: true }], { xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', x0: 0, x1: T, y0: 0, y1: Math.max(c0, ec * 1.2) * 1.1 }), x2 = g2.x, above = c0 > ec ? Math.log(c0 / ec) / k : 0;
        x2.strokeStyle = C.warn; x2.setLineDash([5, 4]); x2.lineWidth = 1.4; x2.beginPath(); x2.moveTo(g2.box.l, g2.sy(ec)); x2.lineTo(g2.box.r, g2.sy(ec)); x2.stroke(); x2.setLineDash([]);
        if (above > 0) { x2.fillStyle = 'rgba(180,86,27,.15)'; x2.beginPath(); x2.moveTo(g2.sx(0), g2.sy(ec)); for (i = 0; i <= 60; i++) { var tt = above * i / 60; x2.lineTo(g2.sx(tt), g2.sy(c0 * Math.exp(-k * tt))); } x2.lineTo(g2.sx(above), g2.sy(ec)); x2.closePath(); x2.fill(); }
        x2.fillStyle = C.warn; x2.font = '600 11px Aptos, "Segoe UI", sans-serif'; x2.textAlign = 'right'; x2.fillText('EC50', g2.box.r - 4, g2.sy(ec) - 5);
        qs('.rb', pn2).innerHTML = 'Half-life <b>' + th.toFixed(1) + ' h</b>. Time above the EC50: <b>' + (above > 0 ? above.toFixed(1) + ' h' : 'none, the peak is below the EC50') + '</b>. A dose of ' + (2 * D) + ' mg would give ' + (c0 * 2 > ec ? (Math.log(2 * c0 / ec) / k).toFixed(1) + ' h' : 'none') + '.';
        api.stat('Peak effect ' + ep.toFixed(0) + ' percent of Emax, time above EC50 ' + above.toFixed(1) + ' h');
      }
      qs('.e', c1).addEventListener('input', function(){ lec = +this.value; draw(); }); qs('.h', c2).addEventListener('input', function(){ h = +this.value; draw(); }); qs('.d', c3).addEventListener('input', function(){ D = +this.value; draw(); }); qs('.c', c4).addEventListener('input', function(){ CL = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 01, step 3: exposure measures ===== */
  WHY.add({ short: 'Exposure measures', level: 'foundations', ord: 30, title: 'Measures of exposure',
    build: function(api){
      var F = 0.6, V = 60, D = 100, CL = 8, ka = 1.2, sel = 'cmax';
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl('Measure <select class="m">' + hepOpts([['cmax', 'Cmax'], ['tmax', 'tmax'], ['auc', 'AUC'], ['half', 'Half-life'], ['trough', 'Trough at 12 h']], sel) + '</select>'), c2 = api.addControl(sld('k', 'ka', 0.2, 4, 0.1, ka, '1/h')), c3 = api.addControl(sld('c', 'CL', 2, 30, 1, CL, 'L/h'));
      function cOf(t, ke, kaa){ return F * D * kaa / (V * (kaa - ke)) * (Math.exp(-ke * t) - Math.exp(-kaa * t)); }
      function draw(){
        qs('.kv', c2).textContent = ka.toFixed(1); qs('.cv', c3).textContent = CL;
        var ke = CL / V, kaa = Math.abs(ka - ke) < 1e-3 ? ka + 0.01 : ka, T = 24, pts = [], cmax = 0, tmax = 0, t, i, auc24 = 0, prev = 0;
        for (i = 0; i <= 240; i++) { t = T * i / 240; var c = cOf(t, ke, kaa); pts.push([t, c]); if (c > cmax) { cmax = c; tmax = t; } if (i) auc24 += (c + prev) / 2 * (T / 240); prev = c; }
        var g = lineChart(cvs, [{ pts: pts, color: C.red, nodot: true }], { xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', x0: 0, x1: T, y0: 0, y1: cmax * 1.15 }), x = g.x, th = 0.693 / Math.min(ke, kaa);
        x.strokeStyle = C.char; x.fillStyle = C.char; x.lineWidth = 1.5; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left';
        if (sel === 'cmax') { x.setLineDash([5, 4]); x.beginPath(); x.moveTo(g.box.l, g.sy(cmax)); x.lineTo(g.sx(tmax), g.sy(cmax)); x.stroke(); x.setLineDash([]); x.beginPath(); x.arc(g.sx(tmax), g.sy(cmax), 6, 0, 6.3); x.fill(); x.fillText('Cmax ' + cmax.toFixed(2) + ' mg/L', g.sx(tmax) + 10, g.sy(cmax) - 8); }
        if (sel === 'tmax') { x.setLineDash([5, 4]); x.beginPath(); x.moveTo(g.sx(tmax), g.sy(cmax)); x.lineTo(g.sx(tmax), g.box.b); x.stroke(); x.setLineDash([]); x.beginPath(); x.arc(g.sx(tmax), g.box.b, 6, 0, 6.3); x.fill(); x.fillText('tmax ' + tmax.toFixed(1) + ' h', g.sx(tmax) + 10, g.box.b - 10); }
        if (sel === 'auc') { x.fillStyle = 'rgba(15,110,140,.20)'; x.beginPath(); x.moveTo(g.sx(0), g.box.b); pts.forEach(function(p){ x.lineTo(g.sx(p[0]), g.sy(p[1])); }); x.lineTo(g.sx(T), g.box.b); x.closePath(); x.fill(); x.fillStyle = C.char; x.fillText('AUC 0 to 24 h = ' + auc24.toFixed(1) + ' mg x h/L', g.sx(T * 0.35), g.sy(cmax * 0.45)); }
        if (sel === 'half') { var t1 = Math.min(Math.max(2 * tmax, 8), T - th - 0.5), c1v = cOf(t1, ke, kaa), c2v = cOf(t1 + th, ke, kaa); [[t1, c1v], [t1 + th, c2v]].forEach(function(p){ x.setLineDash([4, 4]); x.beginPath(); x.moveTo(g.box.l, g.sy(p[1])); x.lineTo(g.sx(p[0]), g.sy(p[1])); x.lineTo(g.sx(p[0]), g.box.b); x.stroke(); x.setLineDash([]); x.beginPath(); x.arc(g.sx(p[0]), g.sy(p[1]), 5, 0, 6.3); x.fill(); }); x.fillText('half-life ' + th.toFixed(1) + ' h: ' + c1v.toFixed(2) + ' to ' + c2v.toFixed(2) + ' mg/L', g.sx(t1) + 10, g.sy(c1v) - 12); }
        if (sel === 'trough') { var ct = cOf(12, ke, kaa); x.setLineDash([5, 4]); x.beginPath(); x.moveTo(g.sx(12), g.box.b); x.lineTo(g.sx(12), g.sy(ct)); x.stroke(); x.setLineDash([]); x.beginPath(); x.arc(g.sx(12), g.sy(ct), 6, 0, 6.3); x.fill(); x.fillText('trough ' + ct.toFixed(2) + ' mg/L at 12 h', g.sx(12) + 10, g.sy(ct) - 10); }
        qs('.tl', side).innerHTML = fTile('AUC, 0 to infinity', (F * D / CL).toFixed(1), 'mg x h/L = F x dose / CL') + fRows([['Cmax', cmax.toFixed(2) + ' mg/L'], ['tmax', tmax.toFixed(1) + ' h'], ['AUC, 0 to 24 h', auc24.toFixed(1) + ' mg x h/L'], ['Terminal half-life', th.toFixed(1) + ' h'], ['Concentration at 12 h', cOf(12, ke, kaa).toFixed(2) + ' mg/L']]);
        api.stat('Cmax ' + cmax.toFixed(2) + ' mg/L at ' + tmax.toFixed(1) + ' h');
      }
      qs('.m', c1).addEventListener('change', function(){ sel = this.value; draw(); }); qs('.k', c2).addEventListener('input', function(){ ka = +this.value; draw(); }); qs('.c', c3).addEventListener('input', function(){ CL = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 02, step 1: units and conversions ===== */
  UNITS.add({ short: 'Units and conversions', level: 'foundations', ord: 10, title: 'Units and conversions',
    build: function(api){
      var mw = 400, lc = 0, dose = 100, wt = 70, clk = 5;
      var pn = api.el('pn', 'left:28px;top:16px;width:440px;height:508px;overflow:auto', '<h4>Concentration and dose</h4><div class="a"></div>');
      var pn2 = api.el('pn', 'left:484px;top:16px;width:448px;height:508px;overflow:auto', '<h4>Clearance</h4><div class="b"></div><h4 style="margin-top:14px">Units used in this course</h4><div class="c"></div>');
      var c1 = api.addControl(sld('m', 'MW', 150, 800, 10, mw, 'Da')), c2 = api.addControl(sld('x', 'Concentration', -2, 2, 0.05, lc, 'micromolar (log)')), c3 = api.addControl(sld('d', 'Dose', 1, 500, 1, dose, 'mg')), c4 = api.addControl(sld('w', 'Body weight', 40, 120, 1, wt, 'kg')), c5 = api.addControl(sld('k', 'CL', 0.1, 30, 0.1, clk, 'mL/min/kg'));
      function draw(){
        var c = Math.pow(10, lc); qs('.mv', c1).textContent = mw; qs('.xv', c2).textContent = fx(c); qs('.dv', c3).textContent = dose; qs('.wv', c4).textContent = wt; qs('.kv', c5).textContent = clk.toFixed(1);
        qs('.a', pn).innerHTML = fRows([['Concentration', fx(c) + ' micromolar'], ['In mg/L', fx(c * mw / 1000) + ' mg/L'], ['In ng/mL (= microgram/L)', fx(c * mw) + ' ng/mL'], ['Molecular weight', mw + ' g/mol'], ['Dose', dose + ' mg'], ['Dose in micromoles', fx(dose / mw * 1000) + ' micromol'], ['Dose per kg for ' + wt + ' kg', (dose / wt).toFixed(2) + ' mg/kg']]) + '<div class="hint" style="font-size:12px;margin-top:8px">mg/L = micromolar x MW / 1000. ng/mL = micromolar x MW. Micromoles = mg / MW x 1000.</div>';
        qs('.b', pn2).innerHTML = fRows([['Clearance per kg', clk.toFixed(1) + ' mL/min/kg'], ['Whole body, ' + wt + ' kg', fx(clk * wt * 60 / 1000) + ' L/h'], ['Whole body in mL/min', fx(clk * wt) + ' mL/min'], ['Same value in L/h/kg', (clk * 60 / 1000).toFixed(3) + ' L/h/kg']]) + '<div class="hint" style="font-size:12px;margin-top:8px">L/h = mL/min/kg x weight x 60 / 1000.</div>';
        qs('.c', pn2).innerHTML = fRows([['Dose', 'mg, or mg/kg'], ['Plasma concentration', 'mg/L, ng/mL or micromolar'], ['Clearance', 'L/h, or mL/min/kg'], ['Volume of distribution', 'L, or L/kg'], ['Half-life, MRT', 'h'], ['AUC', 'mg x h/L'], ['CLint, microsomes', 'microL/min/mg protein'], ['CLint, hepatocytes', 'microL/min/10^6 cells'], ['CLint scaled to the body', 'mL/min/kg']]);
        api.stat(fx(c) + ' micromolar = ' + fx(c * mw) + ' ng/mL');
      }
      qs('.m', c1).addEventListener('input', function(){ mw = +this.value; draw(); }); qs('.x', c2).addEventListener('input', function(){ lc = +this.value; draw(); }); qs('.d', c3).addEventListener('input', function(){ dose = +this.value; draw(); }); qs('.w', c4).addEventListener('input', function(){ wt = +this.value; draw(); }); qs('.k', c5).addEventListener('input', function(){ clk = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 02, step 2: concentration is amount over volume ===== */
  UNITS.add({ short: 'Amount and volume', level: 'foundations', ord: 20, title: 'Amount, concentration and volume',
    build: function(api){
      var named = OBACH08.filter(function(d){ return d.name && d.vss > 0; }).sort(function(a, b){ return a.name < b.name ? -1 : 1; }), cur = 'Warfarin', D = 100;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="330" style="width:624px;height:330px"></canvas><div class="ro" style="font-size:13px;margin-top:8px;line-height:1.5"></div>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl('Drug <select class="d">' + named.map(function(d){ return '<option' + (d.name === cur ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select>');
      function draw(){
        var d = named.filter(function(z){ return z.name === cur; })[0], V = d.vss * W70, c0 = D / V, g = cv(cvs), x = g.x, L = 30, R = g.w - 30, lo = 0, hi = 4.8;
        var sx = function(v){ return L + (Math.log10(v) - lo) / (hi - lo) * (R - L); };
        x.strokeStyle = C.char; x.lineWidth = 1.4; x.beginPath(); x.moveTo(L, 200); x.lineTo(R, 200); x.stroke(); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center';
        [1, 10, 100, 1000, 10000].forEach(function(v){ x.beginPath(); x.moveTo(sx(v), 195); x.lineTo(sx(v), 205); x.stroke(); x.fillText(String(v) + ' L', sx(v), 222); });
        [['plasma', VP, 150], ['extracellular fluid', VECF, 120], ['body water', VTBW, 90]].forEach(function(r, i){ x.strokeStyle = C.warn; x.setLineDash([4, 4]); x.lineWidth = 1.3; x.beginPath(); x.moveTo(sx(r[1]), r[2] + 8); x.lineTo(sx(r[1]), 200); x.stroke(); x.setLineDash([]); x.fillStyle = C.warn; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText(r[0] + ' ' + r[1].toFixed(r[1] < 10 ? 2 : 1) + ' L', sx(r[1]), r[2]); });
        x.fillStyle = C.char; x.beginPath(); x.arc(sx(V), 200, 8, 0, 6.3); x.fill(); x.font = '600 13px Aptos, "Segoe UI", sans-serif'; x.fillText(d.name + ', V = ' + fx(V) + ' L', Math.min(Math.max(sx(V), 110), R - 110), 270);
        x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillText('Volume of distribution at steady state, logarithmic axis, 70 kg adult', (L + R) / 2, 318);
        qs('.ro', pn).innerHTML = 'A ' + D + ' mg dose spread over ' + fx(V) + ' L gives a concentration of <b>' + fx(c0) + ' mg/L</b>. The volume is <b>' + (V / VTBW).toFixed(1) + ' times</b> the body water volume of 40.2 L.';
        qs('.tl', side).innerHTML = fTile('Vss', fx(d.vss) + ' L/kg', fx(V) + ' L for 70 kg') + fRows([['Fraction unbound in plasma', d.fu != null ? d.fu : 'not reported'], ['Clearance', fx(d.cl) + ' mL/min/kg'], ['Half-life', fx(d.t12) + ' h'], ['Relation to body water', V > VTBW ? 'above' : (V > VECF ? 'between extracellular fluid and body water' : 'below extracellular fluid')]]);
        api.stat(d.name + ', V = ' + fx(V) + ' L');
      }
      qs('.d', c1).addEventListener('change', function(){ cur = this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 02, step 3: bound and unbound drug ===== */
  UNITS.add({ short: 'Bound and unbound drug', level: 'foundations', ord: 30, title: 'Bound and unbound drug',
    build: function(api){
      var fus = OBACH08.filter(function(d){ return d.name && d.fu; }).sort(function(a, b){ return a.name < b.name ? -1 : 1; }), cur = 'Warfarin', lt = 0, all = OBACH08.filter(function(d){ return d.fu; });
      var pn = api.el('pn', 'left:28px;top:16px;width:420px;height:508px;padding:14px', '<div class="bars"></div><div class="ro" style="font-size:13px;margin-top:14px;line-height:1.5"></div>');
      var pn2 = api.el('pn', 'left:464px;top:16px;width:468px;height:508px;padding:8px', '<canvas width="452" height="320" style="width:452px;height:320px"></canvas><div class="hint" style="font-size:12px;padding:6px">Each bar counts drugs. The line marks the selected drug.</div>'), cvs = qs('canvas', pn2);
      var c1 = api.addControl('Drug <select class="d">' + fus.map(function(d){ return '<option' + (d.name === cur ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select>'), c2 = api.addControl(sld('t', 'Total concentration', -2, 2, 0.05, lt, 'mg/L (log)'));
      function draw(){
        var d = fus.filter(function(z){ return z.name === cur; })[0], tot = Math.pow(10, lt), free = d.fu * tot; qs('.tv', c2).textContent = fx(tot);
        var bar = function(label, v, col){ return '<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>' + label + '</span><b>' + fx(v) + ' mg/L</b></div><div style="height:16px;background:' + C.light + ';border-radius:3px"><div style="height:16px;width:' + Math.max(0.5, 100 * v / tot).toFixed(1) + '%;background:' + col + ';border-radius:3px"></div></div></div>'; };
        qs('.bars', pn).innerHTML = '<div class="ol">Total plasma concentration split</div>' + bar('Total, C', tot, C.char) + bar('Unbound, Cu = fu x C', free, C.red) + bar('Bound', tot - free, C.tint);
        qs('.ro', pn).innerHTML = d.name + ' has fu = <b>' + d.fu + '</b>, so <b>' + (100 * d.fu).toFixed(d.fu < 0.1 ? 2 : 0) + ' percent</b> of the drug in plasma is unbound. At a total concentration of ' + fx(tot) + ' mg/L the unbound concentration is ' + fx(free) + ' mg/L.';
        logHist(cvs, all.map(function(z){ return z.fu; }), d.fu, -4, 0, 24, 'Fraction unbound, 554 drugs', 'fu, logarithmic axis', [0.0001, 0.001, 0.01, 0.1, 1]);
        api.stat(d.name + ', fu ' + d.fu);
      }
      qs('.d', c1).addEventListener('change', function(){ cur = this.value; draw(); }); qs('.t', c2).addEventListener('input', function(){ lt = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 03, step 1: first-order elimination ===== */
  ELIM.add({ short: 'First-order elimination', level: 'foundations', ord: 10, title: 'First-order elimination',
    build: function(api){
      var th = 6, A0 = 100;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl(sld('h', 'Half-life', 1, 48, 1, th, 'h'));
      function draw(){
        qs('.hv', c1).textContent = th; var k = 0.693 / th, T = 5.5 * th, pts = [], i;
        for (i = 0; i <= 100; i++) { var t = T * i / 100; pts.push([t, A0 * Math.exp(-k * t)]); }
        var g = lineChart(cvs, [{ pts: pts, color: C.red, nodot: true }], { xl: 'Time (h)', yl: 'Amount in the body (mg)', x0: 0, x1: T, y0: 0, y1: 105 });
        fMarks(g, g.x, [1, 2, 3, 4, 5].map(function(n){ return n * th; }), ['50', '25', '12.5', '6.3', '3.1'], C.char);
        var rows = [0, 1, 2, 3, 4, 5].map(function(n){ return '<tr><td>' + n + '</td><td>' + (n * th) + ' h</td><td>' + (A0 / Math.pow(2, n)).toFixed(1) + ' mg</td><td>' + (k * A0 / Math.pow(2, n)).toFixed(2) + '</td></tr>'; }).join('');
        qs('.tl', side).innerHTML = fTile('Rate constant k', k.toFixed(3) + ' per h', '0.693 / half-life') + fRows([['Removed per hour', (100 * (1 - Math.exp(-k))).toFixed(1) + ' percent of what is present'], ['Rate at time 0', (k * A0).toFixed(2) + ' mg/h']]) + '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px"><tr style="text-align:left;color:' + C.mid + '"><th>Half-lives</th><th>Time</th><th>Amount</th><th>Rate, mg/h</th></tr>' + rows + '</table>';
        api.stat('k = ' + k.toFixed(3) + ' per h');
      }
      qs('.h', c1).addEventListener('input', function(){ th = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 03, step 2: clearance defined ===== */
  ELIM.add({ short: 'Clearance', level: 'foundations', ord: 20, title: 'Clearance',
    build: function(api){
      var C0 = 2, CLa = 10, CLb = 25, V = 50;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl(sld('c', 'Concentration', 0.2, 10, 0.2, C0, 'mg/L')), c2 = api.addControl(sld('a', 'CL, drug A', 2, 50, 1, CLa, 'L/h')), c3 = api.addControl(sld('b', 'CL, drug B', 2, 50, 1, CLb, 'L/h')), c4 = api.addControl(sld('v', 'V', 10, 300, 5, V, 'L'));
      function draw(){
        qs('.cv', c1).textContent = C0.toFixed(1); qs('.av', c2).textContent = CLa; qs('.bv', c3).textContent = CLb; qs('.vv', c4).textContent = V;
        var ymax = 50 * 10 * 1.0, g = lineChart(cvs, [{ pts: [[0, 0], [10, CLa * 10]], color: C.red, label: 'Drug A', nodot: true, l: true }, { pts: [[0, 0], [10, CLb * 10]], color: C.mid, label: 'Drug B', nodot: true }], { xl: 'Plasma concentration (mg/L)', yl: 'Elimination rate (mg/h)', x0: 0, x1: 10, y0: 0, y1: Math.max(CLa, CLb) * 10 * 1.05 }), x = g.x;
        [[CLa, C.red], [CLb, C.mid]].forEach(function(r){ x.fillStyle = r[1]; x.beginPath(); x.arc(g.sx(C0), g.sy(r[0] * C0), 6, 0, 6.3); x.fill(); });
        function blk(n, CL){ var k = CL / V, A = V * C0; return fRows([['Amount in the body, A = V x C', A.toFixed(0) + ' mg'], ['Rate = CL x C', (CL * C0).toFixed(1) + ' mg/h'], ['Check: k x A', (k * A).toFixed(1) + ' mg/h'], ['k = CL / V', k.toFixed(3) + ' per h'], ['Half-life', (0.693 / k).toFixed(1) + ' h']]).replace(/^/, '<div class="ol" style="margin-top:8px">Drug ' + n + '</div>'); }
        qs('.tl', side).innerHTML = blk('A', CLa) + blk('B', CLb) + '<div class="hint" style="font-size:11.5px;margin-top:8px">The slope of each line is the clearance.</div>';
        api.stat('Rates ' + (CLa * C0).toFixed(1) + ' and ' + (CLb * C0).toFixed(1) + ' mg/h');
      }
      qs('.c', c1).addEventListener('input', function(){ C0 = +this.value; draw(); }); qs('.a', c2).addEventListener('input', function(){ CLa = +this.value; draw(); }); qs('.b', c3).addEventListener('input', function(){ CLb = +this.value; draw(); }); qs('.v', c4).addEventListener('input', function(){ V = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 04, step 2: bioavailability from the areas ===== */
  ORAL.add({ short: 'Bioavailability from AUCs', level: 'foundations', ord: 20, title: 'Bioavailability from AUC',
    build: function(api){
      var Di = 50, Dp = 100, Ai = 10, Ap = 8;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl(sld('a', 'Intravenous dose', 10, 200, 5, Di, 'mg')), c2 = api.addControl(sld('b', 'Intravenous AUC', 1, 40, 0.5, Ai, 'mg x h/L')), c3 = api.addControl(sld('c', 'Oral dose', 10, 400, 10, Dp, 'mg')), c4 = api.addControl(sld('d', 'Oral AUC', 0.5, 40, 0.5, Ap, 'mg x h/L'));
      function draw(){
        qs('.av', c1).textContent = Di; qs('.bv', c2).textContent = Ai.toFixed(1); qs('.cv', c3).textContent = Dp; qs('.dv', c4).textContent = Ap.toFixed(1);
        var ni = Ai / Di, np = Ap / Dp, F = np / ni, g = cv(cvs), x = g.x, box = { l: 70, r: g.w - 30, t: 40, b: g.h - 60 }, mx = Math.max(ni, np) * 1.25;
        [['Intravenous', ni, C.mid], ['Oral', np, C.red]].forEach(function(b, i){ var bx = box.l + 60 + i * 200, hg = b[1] / mx * (box.b - box.t); x.fillStyle = b[2]; x.fillRect(bx, box.b - hg, 110, hg); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(b[0], bx + 55, box.b + 18); x.fillText(b[1].toFixed(3), bx + 55, box.b - hg - 8); });
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(box.l, box.b); x.lineTo(box.r, box.b); x.moveTo(box.l, box.t); x.lineTo(box.l, box.b); x.stroke(); x.save(); x.translate(18, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillText('AUC / dose (h/L)', 0, 0); x.restore();
        qs('.tl', side).innerHTML = fTile('Bioavailability F', F.toFixed(2), 'oral AUC per dose over intravenous AUC per dose') + fRows([['Intravenous, AUC / dose', ni.toFixed(3) + ' h/L'], ['Oral, AUC / dose', np.toFixed(3) + ' h/L'], ['Implied clearance, dose / AUC (IV)', (Di / Ai).toFixed(1) + ' L/h'], ['Fraction of the oral dose lost', (100 * (1 - Math.min(F, 1))).toFixed(0) + ' percent']]) + (F > 1 ? '<div class="hint" style="font-size:12px;margin-top:8px">F above 1 is not possible. The clearance or the AUCs differ between occasions.</div>' : '');
        api.stat('F = ' + F.toFixed(2));
      }
      qs('.a', c1).addEventListener('input', function(){ Di = +this.value; draw(); }); qs('.b', c2).addEventListener('input', function(){ Ai = +this.value; draw(); }); qs('.c', c3).addEventListener('input', function(){ Dp = +this.value; draw(); }); qs('.d', c4).addEventListener('input', function(){ Ap = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 05, step 1: routes of metabolism ===== */
  var ROUTES = [
    { k: 'ox', name: 'Oxidation', enz: 'Cytochrome P450 (endoplasmic reticulum); flavin-containing monooxygenases.', what: 'Oxygen insertion or dealkylation.', sys: 'Liver microsomes with NADPH; hepatocytes.', cov: 'Covered by the tab 07 prediction.' },
    { k: 'conj', name: 'Conjugation', enz: 'UDP-glucuronosyltransferases; sulfotransferases.', what: 'Attachment of glucuronic acid or sulfate.', sys: 'Microsomes with UDP-glucuronic acid (glucuronidation); hepatocytes.', cov: 'Not measured by an NADPH-only microsomal incubation.' },
    { k: 'hyd', name: 'Hydrolysis', enz: 'Esterases and amidases (plasma, liver).', what: 'Cleavage of ester and amide bonds.', sys: 'Hepatocytes; plasma; liver S9.', cov: 'Not predicted here.' },
    { k: 'oth', name: 'Other routes', enz: 'Aldehyde oxidase (cytosol); monoamine oxidase (mitochondria).', what: 'Oxidation of aldehydes and N-heterocycles; oxidative deamination.', sys: 'Cytosol or S9; hepatocytes.', cov: 'Not measured by microsomes (the enzyme is not in the microsomal fraction).' }];
  MET.add({ short: 'Metabolic routes', level: 'foundations', ord: 10, title: 'Routes of metabolism',
    build: function(api){
      var sel = 'ox';
      var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:14px', '<div class="nd" style="display:flex;gap:10px;flex-wrap:wrap"></div><div class="dt" style="margin-top:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"></div>');
      function draw(){
        var cur = ROUTES.filter(function(n){ return n.k === sel; })[0];
        qs('.nd', pn).innerHTML = ROUTES.map(function(n){ var on = n.k === sel; return '<button type="button" data-k="' + n.k + '" style="cursor:pointer;border:2px solid ' + (on ? C.red : C.silver) + ';background:' + (on ? C.light : '#fff') + ';border-radius:8px;padding:10px 16px;font-weight:700;font-size:14px">' + n.name + '</button>'; }).join('');
        qsa('[data-k]', pn).forEach(function(b){ b.addEventListener('click', function(){ sel = b.dataset.k; draw(); }); });
        qs('.dt', pn).innerHTML = [['What the reaction does', cur.what], ['Enzymes', cur.enz], ['In vitro system that covers it', cur.sys], ['Covered by the prediction in tab 07?', cur.cov]].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:12px 14px;background:#fff"><div class="ol" style="margin-bottom:3px">' + t[0] + '</div><div style="font-size:14px;line-height:1.5">' + t[1] + '</div></div>'; }).join('');
        api.stat(cur.name);
      }
      return { render: draw };
    } });

  /* ===== tab 05, step 2: enzyme kinetics ===== */
  MET.add({ short: 'Enzyme kinetics', level: 'foundations', ord: 20, title: 'Enzyme kinetics and intrinsic clearance',
    build: function(api){
      var Vm = 200, lk = 1, ls = 0;
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="440" style="width:436px;height:440px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="440" style="width:420px;height:440px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(sld('v', 'Vmax', 20, 1000, 10, Vm, 'pmol/min/mg')), c2 = api.addControl(sld('k', 'Km', -1, 2, 0.05, lk, 'micromolar (log)')), c3 = api.addControl(sld('s', 'Substrate', -2, 2, 0.05, ls, 'micromolar (log)'));
      function draw(){
        var Km = Math.pow(10, lk), S = Math.pow(10, ls), cl0 = Vm / Km, xmax = 5 * Km; qs('.vv', c1).textContent = Vm; qs('.kv', c2).textContent = fx(Km); qs('.sv', c3).textContent = fx(S);
        var pts = [], lin = [], i; for (i = 0; i <= 100; i++) { var s = xmax * i / 100; pts.push([s, Vm * s / (Km + s)]); lin.push([s, Math.min(cl0 * s, Vm * 1.15)]); }
        var g = lineChart(ca, [{ pts: lin, color: C.tint, label: 'Low-concentration slope', nodot: true, dash: [5, 4] }, { pts: pts, color: C.red, label: 'Michaelis-Menten', nodot: true }], { xl: 'Substrate concentration (micromolar)', yl: 'Rate (pmol/min/mg)', x0: 0, x1: xmax, y0: 0, y1: Vm * 1.15 }), x = g.x, v = Vm * S / (Km + S);
        x.fillStyle = C.char; x.beginPath(); x.arc(g.sx(Math.min(S, xmax)), g.sy(v), 6, 0, 6.3); x.fill();
        qs('.ra', pn).innerHTML = 'At S = ' + fx(S) + ' micromolar the rate is <b>' + fx(v) + ' pmol/min/mg</b>, ' + (100 * v / Vm).toFixed(0) + ' percent of Vmax. The first-order approximation gives ' + fx(cl0 * S) + ', which is ' + (100 * S / Km).toFixed(0) + ' percent too high.';
        var cp = [], mxs = xmax; for (i = 1; i <= 100; i++) { var s2 = mxs * i / 100; cp.push([s2, Vm / (Km + s2)]); }
        lineChart(cb, [{ pts: cp, color: C.mid, nodot: true }], { xl: 'Substrate concentration (micromolar)', yl: 'Clearance, rate / S (microL/min/mg)', x0: 0, x1: xmax, y0: 0, y1: cl0 * 1.1 });
        qs('.rb', pn2).innerHTML = 'Intrinsic clearance Vmax / Km = <b>' + fx(cl0) + ' microL/min/mg</b>. At the substrate concentration set, the clearance is <b>' + fx(Vm / (Km + S)) + '</b>, ' + (100 * Km / (Km + S)).toFixed(0) + ' percent of that value.';
        api.stat('CLint = ' + fx(cl0) + ' microL/min/mg');
      }
      qs('.v', c1).addEventListener('input', function(){ Vm = +this.value; draw(); }); qs('.k', c2).addEventListener('input', function(){ lk = +this.value; draw(); }); qs('.s', c3).addEventListener('input', function(){ ls = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 05, step 3: the depletion assay ===== */
  MET.add({ short: 'Depletion assay', level: 'foundations', ord: 30, title: 'Substrate depletion assay',
    build: function(api){
      var th = 25, prot = 1;
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="440" style="width:436px;height:440px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="440" style="width:420px;height:440px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(sld('h', 'In vitro half-life', 5, 240, 5, th, 'min')), c2 = api.addControl('Protein <select class="p">' + hepOpts([['0.1', '0.1 mg/mL'], ['0.25', '0.25 mg/mL'], ['0.5', '0.5 mg/mL'], ['1', '1 mg/mL'], ['2', '2 mg/mL'], ['5', '5 mg/mL']], '1') + '</select>');
      function draw(){
        qs('.hv', c1).textContent = th; var k = 0.693 / th, T = 60, pts = [], lp = [], i, ts = [0, 5, 15, 30, 45, 60];
        for (i = 0; i <= 60; i++) { pts.push([i, 100 * Math.exp(-k * i)]); lp.push([i, Math.log(100 * Math.exp(-k * i))]); }
        var g = lineChart(ca, [{ pts: pts, color: C.red, nodot: true }], { xl: 'Time (min)', yl: 'Compound remaining (percent)', x0: 0, x1: T, y0: 0, y1: 105 });
        ts.forEach(function(t){ g.x.fillStyle = C.char; g.x.beginPath(); g.x.arc(g.sx(t), g.sy(100 * Math.exp(-k * t)), 4, 0, 6.3); g.x.fill(); });
        var g2 = lineChart(cb, [{ pts: lp, color: C.mid, nodot: true }], { xl: 'Time (min)', yl: 'ln of percent remaining', x0: 0, x1: T, y0: Math.log(100) - 4.2, y1: Math.log(100) + 0.2 });
        ts.forEach(function(t){ g2.x.fillStyle = C.char; g2.x.beginPath(); g2.x.arc(g2.sx(t), g2.sy(Math.log(100 * Math.exp(-k * t))), 4, 0, 6.3); g2.x.fill(); });
        var cli = k / prot * 1000, scaled = cli * 45 * 20 / 1000;
        qs('.ra', pn).innerHTML = 'Half-life <b>' + th + ' min</b>, so k = 0.693 / ' + th + ' = <b>' + k.toFixed(4) + ' per min</b>. After 60 min ' + (100 * Math.exp(-k * 60)).toFixed(0) + ' percent remains.';
        qs('.rb', pn2).innerHTML = '<div style="line-height:1.7">CLint per mg = ' + k.toFixed(4) + ' / ' + prot + ' x 1000 = <b>' + fx(cli) + ' microL/min/mg</b><br>Scaled = ' + fx(cli) + ' x 45 x 20 / 1000 = <b>' + fx(scaled) + ' mL/min/kg</b></div>';
        api.stat('Scaled CLint ' + fx(scaled) + ' mL/min/kg');
      }
      qs('.h', c1).addEventListener('input', function(){ th = +this.value; draw(); }); qs('.p', c2).addEventListener('change', function(){ prot = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 05, step 5: total clearance and routes ===== */
  MET.add({ short: 'Total clearance', level: 'foundations', ord: 50, title: 'Total clearance and routes',
    build: function(api){
      var CLh = 6, CLr = 2, CLo = 0, fu = 0.5, GFR = 7.2, D = 100;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl(sld('h', 'CLh', 0, 30, 0.5, CLh, 'L/h')), c2 = api.addControl(sld('r', 'CLr', 0, 30, 0.5, CLr, 'L/h')), c3 = api.addControl(sld('o', 'CL other', 0, 10, 0.5, CLo, 'L/h')), c4 = api.addControl(sld('f', 'fu', 0.01, 1, 0.01, fu));
      function draw(){
        qs('.hv', c1).textContent = CLh.toFixed(1); qs('.rv', c2).textContent = CLr.toFixed(1); qs('.ov', c3).textContent = CLo.toFixed(1); qs('.fv', c4).textContent = fu.toFixed(2);
        var CL = CLh + CLr + CLo, g = cv(cvs), x = g.x, L = 40, R = g.w - 40, y = 120, hgt = 70, scale = (R - L) / Math.max(CL, 8), xp = L;
        x.font = '600 13px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.char; x.textAlign = 'left'; x.fillText('Total clearance ' + CL.toFixed(1) + ' L/h', L, 40);
        [['Hepatic', CLh, C.red], ['Renal', CLr, C.mid], ['Other', CLo, C.tint]].forEach(function(r){ var w = r[1] * scale; if (w > 0) { x.fillStyle = r[2]; x.fillRect(xp, y, w, hgt); x.fillStyle = r[2] === C.tint ? C.char : '#fff'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; if (w > 60) { x.textAlign = 'center'; x.fillText(r[0] + ' ' + r[1].toFixed(1), xp + w / 2, y + hgt / 2 + 4); } xp += w; } });
        var filt = fu * GFR, net = CLr > filt + 1e-9 ? 'net secretion' : (CLr < filt - 1e-9 ? 'net reabsorption' : 'filtration only');
        x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Filtration alone would give CLr = fu x 7.2 = ' + filt.toFixed(2) + ' L/h', L, 240); x.fillText('Renal clearance set: ' + CLr.toFixed(1) + ' L/h, which is ' + net, L, 262);
        var full = D / CL, noh = CLh > 0 ? D / (CL - CLh) : full; x.fillStyle = C.char; x.fillText('AUC after an intravenous dose of ' + D + ' mg: ' + (CL > 0 ? full.toFixed(1) : 'undefined') + ' mg x h/L', L, 310); if (CLh > 0 && CL - CLh > 0) x.fillText('Without the hepatic route: ' + noh.toFixed(1) + ' mg x h/L, ' + (noh / full).toFixed(1) + ' times higher', L, 332);
        qs('.tl', side).innerHTML = fTile('Fraction excreted unchanged', CL > 0 ? (CLr / CL).toFixed(2) : 'n/a', 'fe = CLr / CL') + fRows([['Share, hepatic', CL > 0 ? (100 * CLh / CL).toFixed(0) + ' percent' : 'n/a'], ['Share, renal', CL > 0 ? (100 * CLr / CL).toFixed(0) + ' percent' : 'n/a'], ['Filtration-only CLr', filt.toFixed(2) + ' L/h'], ['Renal clearance is', net]]);
        api.stat('CL ' + CL.toFixed(1) + ' L/h, fe ' + (CL > 0 ? (CLr / CL).toFixed(2) : 'n/a'));
      }
      qs('.h', c1).addEventListener('input', function(){ CLh = +this.value; draw(); }); qs('.r', c2).addEventListener('input', function(){ CLr = +this.value; draw(); }); qs('.o', c3).addEventListener('input', function(){ CLo = +this.value; draw(); }); qs('.f', c4).addEventListener('input', function(){ fu = +this.value; draw(); });
      return { render: draw };
    } });

  /* ===== tab 06, step 1: what an assay measures ===== */
  var ASSAYS = [
    { k: 'mic', name: 'Microsomal stability', meas: 'Loss of compound in liver microsomes with NADPH.', par: 'In vitro half-life; CLint (uL/min/mg protein).', link: 'x 45 mg/g x 20 g/kg: CLint in mL/min/kg.', use: 'Tab 07' },
    { k: 'hep', name: 'Hepatocyte stability', meas: 'Loss of compound in hepatocytes.', par: 'CLint (uL/min/10^6 cells).', link: 'x cells per g liver x 20 g/kg.', use: 'Tab 07' },
    { k: 'ppb', name: 'Plasma protein binding', meas: 'Plasma and buffer partition (for example equilibrium dialysis).', par: 'fu.', link: 'Corrects CLint; divided by B:P for blood; enters the fut prediction.', use: 'Tabs 07 and 08' },
    { k: 'bp', name: 'Blood to plasma ratio', meas: 'Whole-blood over plasma concentration.', par: 'B:P.', link: 'Converts plasma to blood clearance and fu(plasma) to fu(blood).', use: 'Tabs 07 and 08' },
    { k: 'caco', name: 'Caco-2 permeability', meas: 'Flux across a Caco-2 monolayer.', par: 'Papp (cm/s).', link: 'Related to Fa through reference compounds.', use: 'Tab 09' },
    { k: 'sol', name: 'Solubility', meas: 'Equilibrium solubility at a stated pH.', par: 'S (mg/mL or mol/L).', link: 'With dose and fluid volume gives D0.', use: 'Tab 09' }];
  VITRO.add({ short: 'What an assay measures', level: 'foundations', ord: 10, title: 'Quantities measured by in vitro assays',
    build: function(api){
      var sel = 'mic';
      var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:14px', '<div class="nd" style="display:flex;gap:10px;flex-wrap:wrap"></div><div class="dt" style="margin-top:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"></div>');
      function draw(){
        var cur = ASSAYS.filter(function(n){ return n.k === sel; })[0];
        qs('.nd', pn).innerHTML = ASSAYS.map(function(n){ var on = n.k === sel; return '<button type="button" data-k="' + n.k + '" style="cursor:pointer;border:2px solid ' + (on ? C.red : C.silver) + ';background:' + (on ? C.light : '#fff') + ';border-radius:8px;padding:10px 14px;font-weight:700;font-size:13.5px">' + n.name + '</button>'; }).join('');
        qsa('[data-k]', pn).forEach(function(b){ b.addEventListener('click', function(){ sel = b.dataset.k; draw(); }); });
        qs('.dt', pn).innerHTML = [['What is measured', cur.meas], ['Parameter', cur.par], ['Link to the clinic', cur.link], ['Where the course uses it', cur.use]].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:12px 14px;background:#fff"><div class="ol" style="margin-bottom:3px">' + t[0] + '</div><div style="font-size:14px;line-height:1.5">' + t[1] + '</div></div>'; }).join('');
        api.stat(cur.name);
      }
      return { render: draw };
    } });
})();
