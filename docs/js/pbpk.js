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
