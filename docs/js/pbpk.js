"use strict";
/* Tab 15: physiologically based pharmacokinetic (PBPK) models. A flow-limited organ, a minimal whole-body model (blood, liver, rest of body) integrated
   in the browser, and population variability in intrinsic clearance for low- and high-extraction compounds. Equations only; organ volumes and flows are
   round reference values set by the sliders. */
var PB = new Lesson('pbpk', 'PBPK basics');
PB.noOpts = true;

(function(){
  var GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function sel(label, cls, list, cur){ return label + ' <select class="' + cls + '">' + list.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
  function qtl(a, p){ var s = a.slice().sort(function(x, y){ return x - y; }); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; }

  /* ===== step 1: a flow-limited organ ===== */
  PB.add({ short: 'Flow-limited organ', level: 'foundations', ord: 10, title: 'A flow-limited organ',
    build: function(api){
      var S = IX.state('pb1', { q: 90, v: 1.8, k: 3 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('q', 'Blood flow Q', 5, 300, 5, S.q, 'L/h')), c2 = api.addControl(IX.slider('v', 'Volume V', 0.2, 40, 0.2, S.v, 'L')), c3 = api.addControl(IX.slider('k', 'Kp', 0.2, 20, 0.2, S.k));
      function sync(){ qs('.q', c1).value = S.q; qs('.v', c2).value = S.v; qs('.k', c3).value = S.k; }
      function ct(P, t){ return P.k * (1 - Math.exp(-P.q * t / (P.k * P.v))); }
      IX.tools(api, { pin: function(){ pins.push({ q: S.q, v: S.v, k: S.k }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'flow-limited-organ',
        csv: function(){ var tau = S.k * S.v / S.q, T = 5 * tau, rows = [['t (h)', 'Tissue / arterial concentration']], i; for (i = 0; i <= 100; i++) rows.push([T * i / 100, ct(S, T * i / 100)]); return IX.csv(rows); } });
      function draw(){
        qs('.qv', c1).textContent = S.q; qs('.vv', c2).textContent = S.v.toFixed(1); qs('.kv', c3).textContent = S.k.toFixed(1);
        var tau = S.k * S.v / S.q, T = lock ? lock.T : 5 * tau, ym = lock ? lock.ym : Math.max(S.k, 1) * 1.15, pk = Math.max(S.k, 1);
        M = IX.chart(cvs, { xr: [0, T], yr: [0, ym], xl: 'Time after a constant arterial concentration of 1 (h)', yl: 'Tissue concentration relative to arterial', series: [{ fn: function(t){ return ct(S, t); }, color: C.red, w: 2.8 }], pinned: pins.map(function(p){ return { fn: function(t){ return ct(p, t); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        IX.hline(M, M.sy(S.k), C.warn, [5, 4]); lab(M, 'equilibrium, Kp = ' + S.k.toFixed(1), M.box.l + 8, M.sy(S.k) - 6, C.warn);
        var x63 = S.k * 0.632; IX.vline(M, M.sx(tau), C.char, [3, 4]); IX.dot(M, M.sx(tau), M.sy(x63), 7, C.red); lab(M, 'tau = Kp V / Q = ' + fx(tau) + ' h (drag)', M.sx(tau) + 10, M.sy(x63) + 16, C.red);
        if (hv !== null) { var c = ct(S, hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(c), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(c), ['t = ' + hv.toFixed(2) + ' h', 'C tissue / C arterial = ' + c.toFixed(2), (100 * c / S.k).toFixed(0) + '% of equilibrium']); }
        qs('.sd', side).innerHTML = fTile('Time constant tau', fx(tau) + ' h', 'Kp x V / Q') + fRows([['Time to 90% of equilibrium', fx(2.303 * tau) + ' h'], ['Equilibrium ratio', S.k.toFixed(1)], ['Amount at equilibrium, Kp x V', fx(S.k * S.v) + ' L-equivalents'], ['Uptake rate at time 0', fx(S.q) + ' per h of arterial concentration']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">dCt/dt = Q (Ca - Ct / Kp) / V. Equilibration is slower for a large volume, a high Kp or a low flow. Drag the point to set Q.</div>';
        api.stat('Time constant ' + fx(tau) + ' h, ' + fx(2.303 * tau) + ' h to 90% of equilibrium');
      }
      [['q', c1], ['v', c2], ['k', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('pb1', S); draw(); }); });
      function dp(){ var tau = S.k * S.v / S.q; return [M.sx(tau), M.sy(S.k * 0.632)]; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; var d = dp(); cvs.style.cursor = Math.hypot(p.x - d[0], p.y - d[1]) < 12 ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var d = dp(); if (Math.hypot(p.x - d[0], p.y - d[1]) < 14) { lock = { T: M.ix(M.box.r), ym: M.iy(M.box.t) }; return { k: 'tau' }; } return null; },
        drag: function(d, p){ var tau = cl(M.ix(p.x), 0.01, 100); S.q = cl(Math.round(S.k * S.v / tau / 5) * 5, 5, 300); sync(); draw(); },
        up: function(){ lock = null; IX.save('pb1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: a minimal whole-body model ===== */
  var VB = 3, VL = 1.8, VR = 40, QL = 90, QCO = 300, DOSE = 100;
  function simulate(P, T, dt){
    var kl = P.kl, kr = P.kr, fu = P.fu, cli = P.cli, clr = P.clr, QR = QCO - QL, cb = DOSE / VB, cl2 = 0, cr = 0, ya = 0, n = Math.round(T / dt), out = [[0, cb]], i;
    function f(b, l, r){ var db = (QL * (l / kl) + QR * (r / kr) - QCO * b - clr * b) / VB, dl = (QL * (b - l / kl) - fu * cli * (l / kl)) / VL, dr = (QR * (b - r / kr)) / VR; return [db, dl, dr, b]; }
    for (i = 1; i <= n; i++) { var k1 = f(cb, cl2, cr), k2 = f(cb + dt / 2 * k1[0], cl2 + dt / 2 * k1[1], cr + dt / 2 * k1[2]), k3 = f(cb + dt / 2 * k2[0], cl2 + dt / 2 * k2[1], cr + dt / 2 * k2[2]), k4 = f(cb + dt * k3[0], cl2 + dt * k3[1], cr + dt * k3[2]); cb += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); cl2 += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); cr += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]); ya += dt / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]); if (i % 10 === 0) out.push([i * dt, cb]); }
    out.auc = ya; return out;
  }
  function interp(pts, t){ var lo = 0, hi = pts.length - 1; if (t <= pts[0][0]) return pts[0][1]; if (t >= pts[hi][0]) return pts[hi][1]; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (pts[m][0] <= t) lo = m; else hi = m; } var f = (t - pts[lo][0]) / (pts[hi][0] - pts[lo][0]); return pts[lo][1] + f * (pts[hi][1] - pts[lo][1]); }
  function clh(P){ return QL * P.fu * P.cli / (QL + P.fu * P.cli); }

  /* ===== step 0: whole-body model schematic (animated) ===== */
  /* RK4 of the same three-compartment model as simulate(), also returning liver and rest-of-body concentrations and the
     cumulative amounts metabolized and excreted. Rows every 0.1 h: [t, Cb, C liver, C rest, mg metabolized, mg excreted]. */
  function simAll(P, T, dt){
    var kl = P.kl, kr = P.kr, fu = P.fu, cli = P.cli, clr = P.clr, QR = QCO - QL, y = [DOSE / VB, 0, 0, 0, 0], n = Math.round(T / dt), out = [[0, y[0], 0, 0, 0, 0]], i, j;
    function f(s){ var b = s[0], l = s[1], r = s[2]; return [(QL * (l / kl) + QR * (r / kr) - QCO * b - clr * b) / VB, (QL * (b - l / kl) - fu * cli * (l / kl)) / VL, (QR * (b - r / kr)) / VR, fu * cli * (l / kl), clr * b]; }
    function ad(s, k, h){ var o = [], q; for (q = 0; q < 5; q++) o.push(s[q] + h * k[q]); return o; }
    for (i = 1; i <= n; i++) { var k1 = f(y), k2 = f(ad(y, k1, dt / 2)), k3 = f(ad(y, k2, dt / 2)), k4 = f(ad(y, k3, dt)); for (j = 0; j < 5; j++) y[j] += dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]); if (i % 10 === 0) out.push([i * dt, y[0], y[1], y[2], y[3], y[4]]); }
    return out;
  }
  function rowAt(sim, t){ var h = sim[1][0] - sim[0][0], u = Math.max(0, Math.min(sim.length - 1.000001, t / h)), i = Math.floor(u), f = u - i, a = sim[i], b = sim[Math.min(i + 1, sim.length - 1)], o = [], q; for (q = 0; q < 6; q++) o.push(a[q] + f * (b[q] - a[q])); return o; }
  PB.add({ short: 'Body schematic', level: 'foundations', ord: 5, title: 'Whole-body model schematic',
    build: function(api){
      var S = IX.state('pbx', { kl: 4, kr: 1.5, fu: 0.2, cli: 2, clr: 1, t: 0.5, sel: 'l' }), TMAX = 48, play = true, ph = 0, dirty = true, sideT = -1, sideClock = 0, sim = null, rmax = 1, hov = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('kl', 'Kp liver', 0.5, 20, 0.5, S.kl)), c2 = api.addControl(IX.slider('kr', 'Kp rest of body', 0.2, 10, 0.1, S.kr)), c3 = api.addControl(IX.slider('fu', 'fu', 0.01, 1, 0.01, S.fu)), c4 = api.addControl(IX.slider('cli', 'CLint', -1, 3.3, 0.05, S.cli, 'L/h')), c5 = api.addControl(IX.slider('clr', 'CLr', 0, 10, 0.5, S.clr, 'L/h'));
      var c6 = api.addControl(IX.slider('t', 'Time', 0, TMAX, 0.1, S.t, 'h') + ' <button type="button" class="btn sm ghost pbx-play">Pause</button>');
      function P(){ return { kl: S.kl, kr: S.kr, fu: S.fu, cli: Math.pow(10, S.cli), clr: S.clr }; }
      function sync(){ qs('.kl', c1).value = S.kl; qs('.kr', c2).value = S.kr; qs('.fu', c3).value = S.fu; qs('.cli', c4).value = S.cli; qs('.clr', c5).value = S.clr; qs('.t', c6).value = S.t; }
      function resim(){ var p = P(); sim = simAll(p, TMAX, 0.01); rmax = 1e-9; sim.forEach(function(r){ rmax = Math.max(rmax, p.fu * p.cli * r[2] / p.kl, p.clr * r[1]); }); dirty = true; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'whole-body-model-schematic',
        csv: function(){ var rows = [['t (h)', 'Blood (mg/L)', 'Liver (mg/L)', 'Rest of body (mg/L)', 'Metabolized (mg)', 'Excreted in urine (mg)']]; sim.forEach(function(r){ rows.push(r.slice()); }); return IX.csv(rows); } });
      /* geometry: organ area proportional to the square root of volume; pipe width proportional to blood flow */
      function box(cx, cy, V, asp){ var A = 2957 * Math.sqrt(V), w = Math.sqrt(A * asp), h = Math.sqrt(A / asp); return { x: cx - w / 2, y: cy - h / 2, w: w, h: h, cx: cx, cy: cy }; }
      var BB = box(90, 165, VB, 0.8), BL = box(300, 85, VL, 1.6), BR = box(300, 230, VR, 1.545), BK = { x: 64, y: 240, w: 52, h: 30, cx: 90, cy: 255 };
      var QR = QCO - QL, PW = function(q){ return q / QCO * 14; };
      var PIPES = [
        { p: [[90, BB.y], [90, 36], [430, 36], [430, 85]], q: QCO, c: 'a' },
        { p: [[430, 85], [430, 230]], q: QR, c: 'a' },
        { p: [[430, 85], [BL.x + BL.w, 85]], q: QL, c: 'a' },
        { p: [[430, 230], [BR.x + BR.w, 230]], q: QR, c: 'a' },
        { p: [[BL.x, 85], [160, 85], [160, 165]], q: QL, c: 'vl' },
        { p: [[BR.x, 230], [160, 230], [160, 165]], q: QR, c: 'vr' },
        { p: [[160, 165], [BB.x + BB.w, 165]], q: QCO, c: 'vm' }
      ];
      PIPES.forEach(function(o){ var L = 0, i; o.seg = []; for (i = 1; i < o.p.length; i++) { var d = Math.hypot(o.p[i][0] - o.p[i - 1][0], o.p[i][1] - o.p[i - 1][1]); o.seg.push(d); L += d; } o.len = L; });
      function along(o, s){ var i; for (i = 0; i < o.seg.length; i++) { if (s <= o.seg[i] || i === o.seg.length - 1) { var f = Math.min(1, s / o.seg[i]); return [o.p[i][0] + f * (o.p[i + 1][0] - o.p[i][0]), o.p[i][1] + f * (o.p[i + 1][1] - o.p[i][1])]; } s -= o.seg[i]; } return o.p[0]; }
      var LMIN = -2, LMAX = 1.5;
      function fr(c){ return cl((Math.log10(Math.max(c, 1e-9)) - LMIN) / (LMAX - LMIN), 0, 1); }
      function col(c){ return SC.mix(C.light, C.red, fr(c)); }
      function dec(e){ return e < 0 ? Math.pow(10, e).toFixed(-e) : String(Math.pow(10, e)); }
      function tcol(c){ return fr(c) > 0.55 ? C.white : C.char; }
      function line(x, pts){ x.beginPath(); pts.forEach(function(q, i){ i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); }
      function organ(x, B, name, vol, c, key){
        SC.rr(x, B.x, B.y, B.w, B.h, 8); x.fillStyle = col(c); x.fill(); x.lineWidth = S.sel === key ? 2.6 : (hov === key ? 1.8 : 1.2); x.strokeStyle = S.sel === key ? C.warn : C.char; x.stroke();
        var tc = tcol(c), y0 = B.cy - (key === 'l' ? 11 : 8);
        SC.text(x, name, B.cx, y0, { bold: true, size: 12, color: tc, align: 'center' }); SC.text(x, vol, B.cx, y0 + 13, { size: 11, color: tc, align: 'center' }); SC.text(x, fx(c) + ' mg/L', B.cx, y0 + 26, { size: 11, color: tc, align: 'center' });
      }
      function elim(x, x1, y1, x2, y2, rate, lbl, ext, lx, ly){
        if (rate <= rmax * 1e-4) { SC.text(x, lbl, lx, ly, { bold: true, size: 11, color: C.warn }); SC.text(x, '0 mg/h' + ext, lx, ly + 14, { size: 11, color: C.warn }); return; }
        var w = 1.5 + 10.5 * Math.min(1, rate / rmax), L = Math.hypot(x2 - x1, y2 - y1), k;
        x.globalAlpha = 0.85; SC.arrow(x, x1, y1, x2, y2, C.warn, w, Math.max(9, w * 1.7)); x.globalAlpha = 1;
        for (k = 0; k < 4; k++) { var s = ((ph * 26 + k * L / 4) % (L * 0.8)), f = s / L; SC.dot(x, x1 + f * (x2 - x1), y1 + f * (y2 - y1), Math.min(2.4, w / 2), C.white); }
        SC.text(x, lbl, lx, ly, { bold: true, size: 11, color: C.warn }); SC.text(x, fx(rate) + ' mg/h' + ext, lx, ly + 14, { size: 11, color: C.warn });
      }
      function frame(){
        if (!sim) resim();
        var g = cv(cvs), x = g.x, p = P(), r = rowAt(sim, S.t), cb = r[1], cL = r[2], cR = r[3], cvl = cL / S.kl, cvr = cR / S.kr, cvm = (QL * cvl + QR * cvr) / QCO, cc = { a: cb, vl: cvl, vr: cvr, vm: cvm };
        x.lineCap = 'round'; x.lineJoin = 'round';
        /* pipes */
        PIPES.forEach(function(o){ var w = PW(o.q); line(x, o.p); x.strokeStyle = C.bg; x.lineWidth = w + 2; x.stroke(); line(x, o.p); x.strokeStyle = col(cc[o.c]); x.lineWidth = w; x.stroke(); });
        line(x, [[90, BB.y + BB.h], [90, BK.y]]); x.strokeStyle = C.bg; x.lineWidth = 5; x.stroke(); line(x, [[90, BB.y + BB.h], [90, BK.y]]); x.strokeStyle = col(cb); x.lineWidth = 3; x.stroke();
        /* flow particles: spacing 18 px, speed proportional to flow */
        PIPES.forEach(function(o){ var w = PW(o.q), sp = o.q * 0.3, off = (ph * sp) % 18, s, c = cc[o.c], pc = fr(c) < 0.5 ? C.dred : C.light; x.globalAlpha = 0.35 + 0.65 * fr(c);
          for (s = off; s < o.len; s += 18) { var q = along(o, s); SC.dot(x, q[0], q[1], Math.max(1.4, Math.min(2.6, w / 2 - 0.4)), pc); } x.globalAlpha = 1; });
        /* organs */
        organ(x, BB, 'Blood', '3 L', cb, 'b'); organ(x, BL, 'Liver', '1.8 L', cL, 'l'); organ(x, BR, 'Rest of body', '40 L', cR, 'r');
        x.beginPath(); x.ellipse(BK.cx, BK.cy, BK.w / 2, BK.h / 2, 0, 0, 6.2832); x.fillStyle = C.light; x.fill(); x.lineWidth = S.sel === 'k' ? 2.6 : (hov === 'k' ? 1.8 : 1.2); x.strokeStyle = S.sel === 'k' ? C.warn : C.char; x.stroke();
        SC.text(x, 'Kidney', BK.cx, BK.cy + 4, { bold: true, size: 11, align: 'center' });
        /* flow labels */
        SC.text(x, 'arterial blood, cardiac output 300 L/h', 260, 24, { size: 11, color: C.char, align: 'center' });
        SC.text(x, '90 L/h', 385, 77, { size: 11, align: 'center' }); SC.text(x, '210 L/h', 421, 166, { size: 11, align: 'right' });
        SC.text(x, 'venous', 167, 135, { size: 11 }); SC.text(x, 'return', 167, 148, { size: 11 });
        /* elimination */
        var rh = p.fu * p.cli * cvl, rr = p.clr * cb, E = p.fu * p.cli / (QL + p.fu * p.cli);
        elim(x, 300, BL.y + BL.h, 300, 160, rh, 'metabolism', ', E ' + E.toFixed(2), 312, 132);
        elim(x, 90, BK.y + BK.h, 90, 308, rr, 'urine, CLr x Cb', '', 102, 290);
        /* right column: time, color scale, fate of the dose */
        SC.text(x, 't = ' + S.t.toFixed(2) + ' h', 456, 62, { bold: true, size: 15 });
        SC.text(x, 'Concentration (mg/L)', 456, 84, { size: 11 });
        var gx = 456, gw = 150, k; for (k = 0; k < gw; k++) { x.fillStyle = SC.mix(C.light, C.red, k / (gw - 1)); x.fillRect(gx + k, 90, 1.2, 12); }
        x.strokeStyle = C.char; x.lineWidth = 1; x.strokeRect(gx, 90, gw, 12);
        [-2, -1, 0, 1].forEach(function(e){ var px = gx + (e - LMIN) / (LMAX - LMIN) * gw; x.beginPath(); x.moveTo(px, 102); x.lineTo(px, 106); x.stroke(); SC.text(x, dec(e), px, 118, { size: 11, align: 'center' }); });
        var am = [['Blood', cb * VB, C.red], ['Liver', cL * VL, C.tint], ['Rest of body', cR * VR, C.bg], ['Metabolized', r[4], C.warn], ['Excreted', r[5], C.char]], bx0 = 456;
        SC.text(x, 'Fate of the 100 mg dose', 456, 146, { size: 11 });
        am.forEach(function(a){ var w = gw * Math.max(0, a[1]) / DOSE; x.fillStyle = a[2]; x.fillRect(bx0, 152, w, 14); bx0 += w; }); x.strokeStyle = C.char; x.strokeRect(456, 152, gw, 14);
        am.forEach(function(a, i){ var yy = 186 + i * 16; x.fillStyle = a[2]; x.fillRect(456, yy - 9, 10, 10); SC.text(x, a[0], 472, yy, { size: 11 }); SC.text(x, (100 * a[1] / DOSE).toFixed(1) + '%', 606, yy, { size: 11, align: 'right' }); });
        SC.text(x, 'Click an organ to plot it.', 456, 278, { size: 11, color: C.char });
        /* inset: concentration-time curves */
        var ib = { l: 60, r: 612, t: 338, b: 456 }, cmax = 0; sim.forEach(function(q){ cmax = Math.max(cmax, q[1], q[2], q[3]); });
        var yh = Math.log10(cmax) + 0.15, yl = yh - 4, sx = function(t){ return ib.l + t / TMAX * (ib.r - ib.l); }, sy = function(c){ return ib.b - (cl(Math.log10(Math.max(c, 1e-12)), yl, yh) - yl) / (yh - yl) * (ib.b - ib.t); };
        x.strokeStyle = C.silver; x.lineWidth = 1;
        for (k = Math.ceil(yl); k <= Math.floor(yh); k++) { x.beginPath(); x.moveTo(ib.l, sy(Math.pow(10, k))); x.lineTo(ib.r, sy(Math.pow(10, k))); x.stroke(); SC.text(x, dec(k), ib.l - 6, sy(Math.pow(10, k)) + 4, { size: 11, color: C.mid, align: 'right' }); }
        for (k = 0; k <= TMAX; k += 6) { x.beginPath(); x.moveTo(sx(k), ib.t); x.lineTo(sx(k), ib.b); x.stroke(); SC.text(x, String(k), sx(k), ib.b + 14, { size: 11, color: C.mid, align: 'center' }); }
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(ib.l, ib.t); x.lineTo(ib.l, ib.b); x.lineTo(ib.r, ib.b); x.stroke();
        SC.text(x, 'Time after a 100 mg IV bolus (h)', (ib.l + ib.r) / 2, 486, { bold: true, size: 11, align: 'center' });
        var sk = S.sel === 'k' ? 'b' : S.sel, CUR = [['b', 1, C.red, 'blood'], ['l', 2, C.warn, 'liver'], ['r', 3, C.char, 'rest of body']], nm = { b: 'blood', l: 'liver', r: 'rest of body' }[sk];
        SC.text(x, S.sel === 'k' ? 'Blood concentration seen by the kidney (mg/L)' : nm.charAt(0).toUpperCase() + nm.slice(1) + ' concentration (mg/L, log scale)', ib.l, 330, { bold: true, size: 12 });
        CUR.forEach(function(cu){ var on = cu[0] === sk; x.strokeStyle = cu[2]; x.lineWidth = on ? 2.6 : 1.2; x.globalAlpha = on ? 1 : 0.55; x.beginPath(); sim.forEach(function(q, i){ i ? x.lineTo(sx(q[0]), sy(q[cu[1]])) : x.moveTo(sx(q[0]), sy(q[cu[1]])); }); x.stroke(); x.globalAlpha = 1; });
        var kx = 612; CUR.slice().reverse().forEach(function(cu){ x.font = '11px Aptos, "Segoe UI", sans-serif'; var tw = x.measureText(cu[3]).width; SC.text(x, cu[3], kx, 330, { size: 11, color: cu[2], align: 'right', bold: cu[0] === sk }); x.strokeStyle = cu[2]; x.lineWidth = 2.4; x.beginPath(); x.moveTo(kx - tw - 22, 326); x.lineTo(kx - tw - 6, 326); x.stroke(); kx -= tw + 34; });
        x.strokeStyle = C.mid; x.setLineDash([2, 3]); x.lineWidth = 1; x.beginPath(); x.moveTo(sx(S.t), ib.t); x.lineTo(sx(S.t), ib.b); x.stroke(); x.setLineDash([]);
        CUR.forEach(function(cu){ var on = cu[0] === sk; SC.dot(x, sx(S.t), sy(r[cu[1]]), on ? 5 : 3.5, cu[2], C.white); });
        return { r: r, p: p, rh: rh, rr: rr };
      }
      function sidePanel(o){
        var r = o.r, p = o.p, vss = VB + VL * S.kl + VR * S.kr, ch = clh(p), cl0 = ch + S.clr, te = 0.693 * vss / cl0;
        function a(v){ return fx(v) + ' mg (' + (100 * v / DOSE).toFixed(1) + '%)'; }
        qs('.sd', side).innerHTML = fTile('Blood concentration', fx(r[1]) + ' mg/L', 't = ' + S.t.toFixed(2) + ' h after 100 mg IV') + fRows([['Blood', a(r[1] * VB)], ['Liver', a(r[2] * VL)], ['Rest of body', a(r[3] * VR)], ['Metabolized', a(r[4])], ['Excreted in urine', a(r[5])], ['Metabolic rate', fx(o.rh) + ' mg/h'], ['Renal rate', fx(o.rr) + ' mg/h'], ['Vss', fx(vss) + ' L'], ['CLh, well-stirred', fx(ch) + ' L/h'], ['CL = CLh + CLr', fx(cl0) + ' L/h'], ['Half-life, 0.693 Vss / CL', fx(te) + ' h']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Organ area is proportional to the square root of volume; pipe width is proportional to blood flow; arrow width is proportional to the elimination rate.</div>';
        api.stat('t ' + S.t.toFixed(1) + ' h: blood ' + fx(r[1]) + ' mg/L, Vss ' + fx(vss) + ' L, CL ' + fx(cl0) + ' L/h, half-life ' + fx(te) + ' h');
      }
      function draw(force){
        qs('.klv', c1).textContent = S.kl.toFixed(1); qs('.krv', c2).textContent = S.kr.toFixed(1); qs('.fuv', c3).textContent = S.fu.toFixed(2); qs('.cliv', c4).textContent = fx(Math.pow(10, S.cli)); qs('.clrv', c5).textContent = S.clr.toFixed(1); qs('.tv', c6).textContent = S.t.toFixed(1);
        var o = frame(); if (force || (Math.abs(S.t - sideT) > 1e-9 && sideClock > 0.15)) { sidePanel(o); sideT = S.t; sideClock = 0; } dirty = false;
      }
      SC.run(cvs, function(dt){
        if (dt > 0) { ph += dt; sideClock += dt; if (play) { var u = Math.sqrt(S.t / TMAX) + dt / 18; if (u >= 1) u = 0; S.t = TMAX * u * u; qs('.t', c6).value = S.t; } }
        if (dt > 0 || dirty) draw(dirty);
      });
      var pb = qs('.pbx-play', c6);
      pb.addEventListener('click', function(){ play = !play; pb.textContent = play ? 'Pause' : 'Play'; if (!play) IX.save('pbx', S); draw(true); });
      [['kl', c1], ['kr', c2], ['fu', c3], ['cli', c4], ['clr', c5]].forEach(function(rw){ qs('.' + rw[0], rw[1]).addEventListener('input', function(){ S[rw[0]] = +this.value; IX.save('pbx', S); resim(); draw(true); }); });
      qs('.t', c6).addEventListener('input', function(){ S.t = +this.value; play = false; pb.textContent = 'Play'; IX.save('pbx', S); draw(true); });
      function hit(p){ var L = [['b', BB], ['l', BL], ['r', BR], ['k', BK]], i; for (i = 0; i < L.length; i++) { var B = L[i][1]; if (p.x >= B.x - 3 && p.x <= B.x + B.w + 3 && p.y >= B.y - 3 && p.y <= B.y + B.h + 3) return L[i][0]; } return null; }
      IX.attach(cvs, {
        move: function(p){ var h0 = hit(p); if (h0 !== hov) { hov = h0; dirty = true; } cvs.style.cursor = hov ? 'pointer' : 'default'; },
        leave: function(){ hov = null; dirty = true; },
        click: function(p){ var h0 = hit(p); if (h0) { S.sel = h0; IX.save('pbx', S); draw(true); } }
      });
      sync(); resim();
      return { render: function(){ sync(); if (!sim) resim(); draw(true); } };
    } });
  PB.add({ short: 'Minimal whole-body model', level: 'foundations', ord: 20, title: 'A minimal whole-body model',
    build: function(api){
      var S = IX.state('pb2', { kl: 4, kr: 1.5, fu: 0.2, cli: 2, clr: 1, ax: 'log' }), pins = [], hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('kl', 'Kp liver', 0.5, 20, 0.5, S.kl)), c2 = api.addControl(IX.slider('kr', 'Kp rest of body', 0.2, 10, 0.1, S.kr)), c3 = api.addControl(IX.slider('fu', 'fu', 0.01, 1, 0.01, S.fu)), c4 = api.addControl(IX.slider('cli', 'CLint', -1, 3.3, 0.05, S.cli, 'L/h')), c5 = api.addControl(IX.slider('clr', 'CLr', 0, 10, 0.5, S.clr, 'L/h')), c6 = api.addControl(sel('Axis', 'ax', [['log', 'Logarithmic'], ['lin', 'Linear']], S.ax));
      function P(o){ o = o || S; return { kl: o.kl, kr: o.kr, fu: o.fu, cli: Math.pow(10, o.cli), clr: o.clr }; }
      function sync(){ qs('.kl', c1).value = S.kl; qs('.kr', c2).value = S.kr; qs('.fu', c3).value = S.fu; qs('.cli', c4).value = S.cli; qs('.clr', c5).value = S.clr; qs('.ax', c6).value = S.ax; }
      IX.tools(api, { pin: function(){ pins.push(JSON.parse(JSON.stringify(S))); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'minimal-whole-body-model',
        csv: function(){ var s = simulate(P(), 48, 0.01), rows = [['t (h)', 'Blood concentration (mg/L), dose 100 mg']]; s.forEach(function(r, i){ if (i % 10 === 0) rows.push([r[0], r[1]]); }); return IX.csv(rows); } });
      function draw(){
        var p = P(); qs('.klv', c1).textContent = S.kl.toFixed(1); qs('.krv', c2).textContent = S.kr.toFixed(1); qs('.fuv', c3).textContent = S.fu.toFixed(2); qs('.cliv', c4).textContent = fx(p.cli); qs('.clrv', c5).textContent = S.clr.toFixed(1);
        var sim = simulate(p, 48, 0.01), vss = VB + VL * S.kl + VR * S.kr, cl0 = clh(p) + S.clr, lg = S.ax === 'log', one = function(t){ return DOSE / vss * Math.exp(-cl0 / vss * t); };
        var yv = function(c){ return lg ? Math.log10(Math.max(c, 1e-6)) : c; };
        M = IX.chart(cvs, { xr: [0, 48], yr: lg ? [Math.log10(DOSE / vss) - 3, Math.log10(DOSE / VB) + 0.1] : [0, DOSE / VB * 1.05], xl: 'Time after a 100 mg intravenous dose (h)', yl: lg ? 'log10 of the blood concentration (mg/L)' : 'Blood concentration (mg/L)', series: [{ fn: function(t){ return yv(one(t)); }, color: GREY, w: 1.8, dash: [5, 4], label: 'one compartment, Vss and CL' }, { fn: function(t){ return yv(interp(sim, t)); }, color: C.red, w: 2.8, label: 'three-compartment model' }], pinned: pins.map(function(o){ var ps = simulate(P(o), 48, 0.01); return { fn: function(t){ return yv(interp(ps, t)); }, color: GREY, w: 1.4, dash: [2, 3] }; }) });
        if (hv !== null) { var c = interp(sim, hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(yv(c)), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(yv(c)), ['t = ' + hv.toFixed(1) + ' h', 'model ' + fx(c) + ' mg/L', 'one compartment ' + fx(one(hv)) + ' mg/L']); }
        var auc = sim.auc, te = 0.693 * vss / cl0;
        qs('.sd', side).innerHTML = fTile('Vss', fx(vss) + ' L', 'Vb + Vl Kp,l + Vr Kp,r') + fRows([['CLh, well-stirred', fx(clh(p)) + ' L/h'], ['CL = CLh + CLr', fx(cl0) + ' L/h'], ['Half-life, 0.693 Vss / CL', fx(te) + ' h'], ['AUC to 48 h', fx(auc) + ' mg x h/L'], ['Dose over CL', fx(DOSE / cl0) + ' mg x h/L'], ['Initial concentration, dose / Vb', fx(DOSE / VB) + ' mg/L']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Blood 3 L, liver 1.8 L and 90 L/h, rest of body 40 L and 210 L/h. The distribution phase is the difference between the curves at early times.</div>';
        api.stat('Vss ' + fx(vss) + ' L, CL ' + fx(cl0) + ' L/h, half-life ' + fx(te) + ' h');
      }
      [['kl', c1], ['kr', c2], ['fu', c3], ['cli', c4], ['clr', c5]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('pb2', S); draw(); }); });
      qs('.ax', c6).addEventListener('change', function(){ S.ax = this.value; IX.save('pb2', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: population variability ===== */
  PB.add({ short: 'Variability in clearance', level: 'applied', ord: 30, title: 'Variability in intrinsic clearance',
    build: function(api){
      var S = IX.state('pb3', { cv: 0.5, lo: 0.5, hi: 3.3 }), hv = -1, M = null, NB = 36, LO = -1, HI = 1.6;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('cv', 'CV of CLint', 0.1, 1.5, 0.05, S.cv)), c2 = api.addControl(IX.slider('lo', 'CLint, low extraction', -0.5, 2, 0.05, S.lo, 'L/h')), c3 = api.addControl(IX.slider('hi', 'CLint, high extraction', 2, 4, 0.05, S.hi, 'L/h'));
      function sync(){ qs('.cv', c1).value = S.cv; qs('.lo', c2).value = S.lo; qs('.hi', c3).value = S.hi; }
      var FU = 0.2, CLR = 1;
      function draws(l10){ var r = rng(20260), sg = Math.sqrt(Math.log(1 + S.cv * S.cv)), mu = Math.log(Math.pow(10, l10)) - sg * sg / 2, out = [], i; for (i = 0; i < 3000; i++) { var u1 = Math.max(r(), 1e-9), u2 = r(), z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.2831853 * u2), cli = Math.exp(mu + sg * z), cll = QL * FU * cli / (QL + FU * cli); out.push(DOSE / (cll + CLR)); } return out; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'variability-in-clearance', csv: function(){ var a = draws(S.lo), b = draws(S.hi), rows = [['Draw', 'AUC, low extraction (mg x h/L)', 'AUC, high extraction (mg x h/L)']], i; for (i = 0; i < a.length; i++) rows.push([i + 1, a[i], b[i]]); return IX.csv(rows); } });
      function draw(){
        qs('.cvv', c1).textContent = S.cv.toFixed(2); qs('.lov', c2).textContent = fx(Math.pow(10, S.lo)); qs('.hiv', c3).textContent = fx(Math.pow(10, S.hi));
        var A = draws(S.lo), Bv = draws(S.hi), ca = new Array(NB).fill(0), cb = new Array(NB).fill(0);
        A.forEach(function(v){ ca[cl(Math.floor((Math.log10(v) - LO) / (HI - LO) * NB), 0, NB - 1)]++; }); Bv.forEach(function(v){ cb[cl(Math.floor((Math.log10(v) - LO) / (HI - LO) * NB), 0, NB - 1)]++; });
        var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 14, t: 26, b: g.h - 42 }, ym = Math.max(Math.max.apply(null, ca), Math.max.apply(null, cb)) * 1.12, bw = (box.r - box.l) / NB; M = { x: x, box: box };
        function bx(l){ return box.l + (l - LO) / (HI - LO) * (box.r - box.l); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('AUC of a 100 mg intravenous dose in 3,000 simulated subjects with the same variability in CLint', box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        [[cb, C.warn], [ca, C.red]].forEach(function(s, si){ s[0].forEach(function(n, k){ var hg = n / ym * (box.b - box.t); x.fillStyle = s[1]; x.globalAlpha = 0.6; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; }); });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [-1, -0.5, 0, 0.5, 1, 1.5].forEach(function(e){ var px = bx(e); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(+Math.pow(10, e).toPrecision(2)), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText('AUC (mg x h/L, logarithmic axis)', (box.l + box.r) / 2, g.h - 6);
        lab(M, 'low extraction', box.r - 4, box.t + 14, C.red, 'right'); lab(M, 'high extraction', box.r - 4, box.t + 28, C.warn, 'right');
        if (hv >= 0) IX.tip(M, box.l + (hv + 0.5) * bw, box.b - Math.max(ca[hv], cb[hv]) / ym * (box.b - box.t), [fx(Math.pow(10, LO + hv * (HI - LO) / NB)) + ' to ' + fx(Math.pow(10, LO + (hv + 1) * (HI - LO) / NB)), 'low extraction: ' + ca[hv], 'high extraction: ' + cb[hv]]);
        function sm(a, nm){ return [nm, fx(qtl(a, 0.5)) + ' (5th to 95th: ' + fx(qtl(a, 0.05)) + ' to ' + fx(qtl(a, 0.95)) + ')']; }
        var ra = qtl(A, 0.95) / qtl(A, 0.05), rb = qtl(Bv, 0.95) / qtl(Bv, 0.05), E1 = QL * FU * Math.pow(10, S.lo) / (QL + FU * Math.pow(10, S.lo)) / QL, E2 = FU * Math.pow(10, S.hi) / (QL + FU * Math.pow(10, S.hi));
        qs('.sd', side).innerHTML = fTile('95th over 5th percentile of AUC', 'low ' + fx(ra) + ', high ' + fx(rb), 'same CV of CLint, ' + (S.cv * 100).toFixed(0) + ' percent') + fRows([sm(A, 'Low extraction'), sm(Bv, 'High extraction'), ['Hepatic extraction, low', fx(E1 )], ['Hepatic extraction, high', fx(E2)]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">CLh = Q fu CLint / (Q + fu CLint). When extraction is high, clearance approaches blood flow and variability in CLint has little effect on AUC. Fixed: fu 0.2, CLr 1 L/h, Q 90 L/h.</div>';
        api.stat('AUC 95th over 5th percentile: ' + fx(ra) + ' for low and ' + fx(rb) + ' for high extraction');
      }
      [['cv', c1], ['lo', c2], ['hi', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('pb3', S); draw(); }); });
      function binAt(p){ if (p.x < M.box.l || p.x > M.box.r || p.y < M.box.t || p.y > M.box.b) return -1; return cl(Math.floor((p.x - M.box.l) / ((M.box.r - M.box.l) / NB)), 0, NB - 1); }
      IX.attach(cvs, { move: function(p){ if (!M) return; hv = binAt(p); draw(); }, leave: function(){ hv = -1; draw(); } });
      sync();
      return { render: draw };
    } });
})();
