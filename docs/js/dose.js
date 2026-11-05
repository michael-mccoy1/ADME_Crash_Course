"use strict";
/* Tab 13: human pharmacokinetics and dose. Steady state on repeat oral dosing, allometric scaling of clearance, the daily dose implied by clearance
   and the dosing interval implied by half-life across 667 drugs (Obach et al. 2008), and the conversion of an animal no-observed-adverse-effect level
   to a starting dose (body-surface-area factors of the FDA guidance on starting doses, 2005). */
var DOSE = new Lesson('dose', 'Human PK and dose');
DOSE.noOpts = true;

(function(){
  var GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function sel(label, cls, list, cur){ return label + ' <select class="' + cls + '">' + list.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
  function med(a){ var s = a.slice().sort(function(p, q){ return p - q; }); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; }
  var DR = OBACH08.filter(function(d){ return d.cl > 0 && d.t12 > 0; });
  var CLH = DR.map(function(d){ return d.cl * 70 * 60 / 1000; });

  /* ===== step 1: dose and steady state ===== */
  DOSE.add({ short: 'Dose and steady state', level: 'foundations', ord: 10, title: 'Dose, interval and steady state',
    build: function(api){
      var S = IX.state('ds1', { d: 200, tau: 12, cl: 10, v: 50, f: 0.8, ka: 1.5, lo: 0.8, hi: 3 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('d', 'Dose', 10, 1000, 10, S.d, 'mg')), c2 = api.addControl(sel('Interval', 'tau', [[6, '6 h'], [8, '8 h'], [12, '12 h'], [24, '24 h']], S.tau)), c3 = api.addControl(IX.slider('cl', 'CL', 1, 50, 1, S.cl, 'L/h')), c4 = api.addControl(IX.slider('v', 'V', 10, 500, 10, S.v, 'L')), c5 = api.addControl(IX.slider('f', 'F', 0.1, 1, 0.01, S.f)), c6 = api.addControl(IX.slider('ka', 'ka', 0.2, 5, 0.1, S.ka, '1/h'));
      function sync(){ qs('.d', c1).value = S.d; qs('.cl', c3).value = S.cl; qs('.v', c4).value = S.v; qs('.f', c5).value = S.f; qs('.ka', c6).value = S.ka; qs('.tau', c2).value = S.tau; }
      function conc(P, t){ var ke = P.cl / P.v, ka = Math.abs(P.ka - ke) < 1e-3 ? P.ka + 0.01 : P.ka, k = P.f * P.d * ka / (P.v * (ka - ke)), n, c = 0; for (n = 0; n * P.tau <= t + 1e-9; n++) { var s = t - n * P.tau; c += k * (Math.exp(-ke * s) - Math.exp(-ka * s)); } return c; }
      function ss(P){ var ke = P.cl / P.v, N = Math.ceil(8 * 0.693 / ke / P.tau) + 2, t0 = N * P.tau, mx = 0, mn = 1e9, inw = 0, i, n = 120; for (i = 0; i <= n; i++) { var c = conc(P, t0 + P.tau * i / n); mx = Math.max(mx, c); mn = Math.min(mn, c); if (c >= S.lo && c <= S.hi) inw++; } return { mx: mx, mn: mn, inw: inw / (n + 1) }; }
      IX.tools(api, { pin: function(){ pins.push({ d: S.d, tau: +S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'dose-and-steady-state',
        csv: function(){ var P = { d: S.d, tau: +S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }, T = Math.min(Math.max(6 * P.tau, 5 * 0.693 * P.v / P.cl), 240), rows = [['t (h)', 'C (mg/L)']], i; for (i = 0; i <= 240; i++) rows.push([T * i / 240, conc(P, T * i / 240)]); return IX.csv(rows); } });
      function draw(){
        var P = { d: S.d, tau: +S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }; qs('.dv', c1).textContent = S.d; qs('.clv', c3).textContent = S.cl; qs('.vv', c4).textContent = S.v; qs('.fv', c5).textContent = S.f.toFixed(2); qs('.kav', c6).textContent = S.ka.toFixed(1);
        var th = 0.693 * S.v / S.cl, T = Math.min(Math.max(6 * P.tau, 5 * th), 240), css = S.f * S.d / (S.cl * P.tau), s = ss(P), ym = lock ? lock.ym : Math.max(s.mx, S.hi, css) * 1.2;
        M = IX.chart(cvs, { xr: [0, T], yr: [0, ym], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return conc(P, t); }, color: C.red, w: 2.6 }], pinned: pins.map(function(q){ return { fn: function(t){ return conc(q, t); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var x = M.x; x.fillStyle = 'rgba(180,86,27,.10)'; x.fillRect(M.box.l, M.sy(S.hi), M.box.r - M.box.l, M.sy(S.lo) - M.sy(S.hi));
        IX.hline(M, M.sy(S.hi), C.warn, [5, 4]); IX.hline(M, M.sy(S.lo), C.warn, [5, 4]); lab(M, 'upper limit (drag)', M.box.r - 6, M.sy(S.hi) - 5, C.warn, 'right'); lab(M, 'lower limit (drag)', M.box.r - 6, M.sy(S.lo) + 14, C.warn, 'right');
        IX.hline(M, M.sy(css), C.char, [2, 3]); IX.dot(M, M.sx(T * 0.5), M.sy(css), 6, C.char); lab(M, 'Css,avg (drag to set the dose)', M.sx(T * 0.5) + 10, M.sy(css) - 8, C.char);
        var n; x.fillStyle = C.char; for (n = 0; n * P.tau <= T; n++) { x.beginPath(); x.moveTo(M.sx(n * P.tau) - 4, M.box.b); x.lineTo(M.sx(n * P.tau) + 4, M.box.b); x.lineTo(M.sx(n * P.tau), M.box.b - 8); x.fill(); }
        if (hv !== null) { var ch = conc(P, hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(ch), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(ch), ['t = ' + hv.toFixed(1) + ' h', 'C = ' + ch.toFixed(2) + ' mg/L', 'doses given ' + (Math.floor(hv / P.tau + 1e-9) + 1)]); }
        var mid = Math.sqrt(S.lo * S.hi);
        qs('.sd', side).innerHTML = fTile('Css,avg', fx(css) + ' mg/L', 'F x dose / (CL x tau)') + fRows([['Cmax,ss', fx(s.mx) + ' mg/L'], ['Cmin,ss', fx(s.mn) + ' mg/L'], ['Peak to trough', fx(s.mx / Math.max(s.mn, 1e-9))], ['Half-life', th.toFixed(1) + ' h'], ['Accumulation ratio R', fx(1 / (1 - Math.exp(-0.693 / th * P.tau)))], ['Time in the window', (100 * s.inw).toFixed(0) + ' percent'], ['Dose for Css,avg at the window midpoint', fx(mid * S.cl * P.tau / S.f) + ' mg']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Drag the dashed Css,avg point vertically to set the dose, and the two limits to set the window.</div>';
        api.stat('Css,avg ' + fx(css) + ' mg/L, ' + (100 * s.inw).toFixed(0) + ' percent of the interval in the window');
      }
      [['d', c1], ['cl', c3], ['v', c4], ['f', c5], ['ka', c6]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('ds1', S); draw(); }); });
      qs('.tau', c2).addEventListener('change', function(){ S.tau = +this.value; IX.save('ds1', S); draw(); });
      function cssY(){ return M.sy(S.f * S.d / (S.cl * +S.tau)); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = (Math.hypot(p.x - M.sx(M.ix(M.box.r) * 0.5), p.y - cssY()) < 12) ? 'ns-resize' : ((near(p.y, M.sy(S.hi), 7) || near(p.y, M.sy(S.lo), 7)) ? 'ns-resize' : 'crosshair'); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var fr = { ym: M.iy(M.box.t) }; if (Math.hypot(p.x - M.sx(M.ix(M.box.r) * 0.5), p.y - cssY()) < 13) { lock = fr; return { k: 'd' }; } if (near(p.y, M.sy(S.hi), 8)) { lock = fr; return { k: 'hi' }; } if (near(p.y, M.sy(S.lo), 8)) { lock = fr; return { k: 'lo' }; } return null; },
        drag: function(d, p){ var v = Math.max(M.iy(p.y), 0.01); if (d.k === 'd') S.d = cl(Math.round(v * S.cl * +S.tau / S.f / 10) * 10, 10, 1000); else if (d.k === 'hi') S.hi = Math.max(Math.round(v * 20) / 20, S.lo + 0.05); else S.lo = cl(Math.round(v * 20) / 20, 0.05, S.hi - 0.05); sync(); draw(); },
        up: function(){ lock = null; IX.save('ds1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: allometric scaling ===== */
  var SPEC = [['Mouse', 0.02], ['Rat', 0.25], ['Monkey', 5], ['Dog', 10]];
  DOSE.add({ short: 'Allometric scaling', level: 'foundations', ord: 20, title: 'Allometric scaling of clearance',
    build: function(api){
      var S = IX.state('ds2', { y: [Math.log10(0.0243), Math.log10(0.0993), Math.log10(1.41), Math.log10(1.78)] }), hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl('<button type="button" class="btn sm ghost rs">Reset points</button>');
      function fit(b0){ var xs = SPEC.map(function(s){ return Math.log10(s[1]); }), ys = S.y, n = xs.length, mx = xs.reduce(function(a, v){ return a + v; }, 0) / n, my = ys.reduce(function(a, v){ return a + v; }, 0) / n, b = b0, i; if (b0 === undefined) { var sxy = 0, sxx = 0; for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); } b = sxy / sxx; } return { b: b, a: my - b * mx }; }
      function pred(f, W){ return Math.pow(10, f.a + f.b * Math.log10(W)); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'allometric-scaling', csv: function(){ var f = fit(), rows = [['Species', 'Body weight (kg)', 'CL (L/h)']]; SPEC.forEach(function(s, i){ rows.push([s[0], s[1], Math.pow(10, S.y[i])]); }); rows.push([], ['Fitted exponent', f.b], ['Predicted human CL, 70 kg (L/h)', pred(f, 70)], ['Exponent 0.75, predicted human CL (L/h)', pred(fit(0.75), 70)], ['Exponent 1, predicted human CL (L/h)', pred(fit(1), 70)]); return IX.csv(rows); } });
      function draw(){
        var f = fit(), f75 = fit(0.75), f1 = fit(1), f67 = fit(0.67);
        M = LL(cvs, { xr: [0.01, 100], yr: [0.005, 100], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [0.01, 0.1, 1, 10, 100], xl: 'Body weight (kg)', yl: 'Clearance (L/h)', series: [{ fn: function(w){ return pred(f1, w); }, color: GREY, w: 1.5, dash: [2, 3], label: 'exponent 1' }, { fn: function(w){ return pred(f75, w); }, color: C.mid, w: 1.8, dash: [5, 4], label: 'exponent 0.75' }, { fn: function(w){ return pred(f, w); }, color: C.red, w: 2.8, label: 'fitted' }] });
        var x = M.x; IX.vline(M, M.sx(70), C.warn, [4, 4]); lab(M, 'human, 70 kg', M.sx(70) - 6, M.box.t + 30, C.warn, 'right');
        [[f1, GREY], [f75, C.mid], [f, C.red]].forEach(function(q){ IX.dot(M, M.sx(70), M.sy(pred(q[0], 70)), 5, q[1]); });
        SPEC.forEach(function(s, i){ IX.dot(M, M.sx(s[1]), M.sy(Math.pow(10, S.y[i])), hv === i ? 8 : 6.5, C.red); lab(M, s[0], M.sx(s[1]) + 10, M.sy(Math.pow(10, S.y[i])) - 8, C.char); });
        lab(M, 'drag the points vertically', M.box.l + 8, M.box.b - 8, C.mid);
        if (hv !== null && hv >= 0) IX.tip(M, M.sx(SPEC[hv][1]), M.sy(Math.pow(10, S.y[hv])), [SPEC[hv][0] + ', ' + SPEC[hv][1] + ' kg', 'CL ' + fx(Math.pow(10, S.y[hv])) + ' L/h', 'per kg ' + fx(Math.pow(10, S.y[hv]) / SPEC[hv][1]) + ' L/h/kg']);
        qs('.sd', side).innerHTML = fTile('Predicted human CL', fx(pred(f, 70)) + ' L/h', 'fitted exponent ' + f.b.toFixed(2)) + fRows([['Exponent 0.67', fx(pred(f67, 70)) + ' L/h'], ['Exponent 0.75', fx(pred(f75, 70)) + ' L/h'], ['Exponent 1', fx(pred(f1, 70)) + ' L/h'], ['Fitted, per kg', fx(pred(f, 70) / 70 * 1000 / 60) + ' mL/min/kg'], ['Highest to lowest prediction', fx(Math.max(pred(f1, 70), pred(f, 70), pred(f67, 70)) / Math.min(pred(f1, 70), pred(f, 70), pred(f67, 70))) + '-fold']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Illustrative values for one compound, set by dragging. CL = a W^b, so clearance per kg falls as body weight rises when b is below 1.</div>';
        api.stat('Fitted exponent ' + f.b.toFixed(2) + ', predicted human CL ' + fx(pred(f, 70)) + ' L/h');
      }
      function pt(i){ return [M.sx(SPEC[i][1]), M.sy(Math.pow(10, S.y[i]))]; }
      function hit(p){ var i, b = -1, bd = 14; SPEC.forEach(function(s, k){ var q = pt(k), d = Math.hypot(p.x - q[0], p.y - q[1]); if (d < bd) { bd = d; b = k; } }); return b; }
      qs('.rs', c1).addEventListener('click', function(){ S.y = [Math.log10(0.0243), Math.log10(0.0993), Math.log10(1.41), Math.log10(1.78)]; IX.save('ds2', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = hit(p); cvs.style.cursor = hv >= 0 ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var i = hit(p); return i >= 0 ? { i: i } : null; },
        drag: function(d, p){ S.y[d.i] = cl(Math.round(Math.log10(cl(M.iy(p.y), 0.006, 90)) * 50) / 50, -2.2, 1.9); draw(); },
        up: function(){ IX.save('ds2', S); }
      });
      return { render: draw };
    } });

  /* ===== step 3: daily dose from clearance across drugs ===== */
  DOSE.add({ short: 'Daily dose from clearance', level: 'applied', ord: 30, title: 'Daily dose implied by clearance',
    build: function(api){
      var S = IX.state('ds3', { c: -1, f: 1 }), hv = -1, M = null, NB = 36, LO = -1, HI = 4;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:grab"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('c', 'Target Css,avg', -3, 1, 0.05, S.c, 'mg/L')), c2 = api.addControl(IX.slider('f', 'F', 0.1, 1, 0.01, S.f));
      function sync(){ qs('.c', c1).value = S.c; qs('.f', c2).value = S.f; }
      function doses(){ var c = Math.pow(10, S.c); return CLH.map(function(q){ return c * q * 24 / S.f; }); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'daily-dose-from-clearance', csv: function(){ var ds = doses(), rows = [['Drug', 'CL (mL/min/kg)', 'CL for 70 kg (L/h)', 'Daily dose (mg)']]; DR.forEach(function(d, i){ rows.push([d.name || d.id, d.cl, CLH[i], ds[i]]); }); return IX.csv(rows); } });
      function draw(){
        var c = Math.pow(10, S.c), ds = doses(), cnt = new Array(NB).fill(0); qs('.cv', c1).textContent = fx(c); qs('.fv', c2).textContent = S.f.toFixed(2);
        ds.forEach(function(v){ var k = Math.floor((Math.log10(v) - LO) / (HI - LO) * NB); cnt[cl(k, 0, NB - 1)]++; });
        var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 14, t: 26, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.12, bw = (box.r - box.l) / NB; M = { x: x, box: box };
        function bx(l){ return box.l + (l - LO) / (HI - LO) * (box.r - box.l); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Daily dose for the target concentration, ' + DR.length + ' drugs (drag sideways to change the target)', box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        cnt.forEach(function(n, k){ var mid = LO + (k + 0.5) * (HI - LO) / NB, hg = n / ym * (box.b - box.t); x.fillStyle = mid > 3 ? C.warn : (mid < 1 ? C.tint : C.red); x.globalAlpha = k === hv ? 1 : 0.82; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [-1, 0, 1, 2, 3, 4].forEach(function(e){ var px = bx(e); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(+Math.pow(10, e).toPrecision(3)), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText('Daily dose (mg, logarithmic axis)', (box.l + box.r) / 2, g.h - 6);
        x.strokeStyle = C.char; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(bx(3), box.t); x.lineTo(bx(3), box.b); x.stroke(); x.setLineDash([]); lab(M, '1 g/day', bx(3) + 5, box.t + 12, C.char);
        if (hv >= 0) IX.tip(M, box.l + (hv + 0.5) * bw, box.b - cnt[hv] / ym * (box.b - box.t), [fx(Math.pow(10, LO + hv * (HI - LO) / NB)) + ' to ' + fx(Math.pow(10, LO + (hv + 1) * (HI - LO) / NB)) + ' mg/day', cnt[hv] + ' drugs']);
        var md = med(ds), lo = ds.filter(function(v){ return v < 100; }).length, hi = ds.filter(function(v){ return v > 1000; }).length;
        qs('.sd', side).innerHTML = fTile('Median daily dose', fx(md) + ' mg', 'for Css,avg ' + fx(c) + ' mg/L') + fRows([['Below 100 mg/day', lo + ' of ' + DR.length], ['Above 1 g/day', hi + ' of ' + DR.length], ['Median CL for 70 kg', fx(med(CLH)) + ' L/h']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Dose per day = Css,avg x CL x 24 h / F, with CL the total clearance of Obach et al. (2008) for a 70 kg adult. Drag the histogram sideways to change the target.</div>';
        api.stat('Median daily dose ' + fx(md) + ' mg for Css,avg ' + fx(c) + ' mg/L');
      }
      qs('.c', c1).addEventListener('input', function(){ S.c = +this.value; IX.save('ds3', S); draw(); }); qs('.f', c2).addEventListener('input', function(){ S.f = +this.value; IX.save('ds3', S); draw(); });
      function binAt(p){ if (p.x < M.box.l || p.x > M.box.r || p.y < M.box.t || p.y > M.box.b) return -1; return cl(Math.floor((p.x - M.box.l) / ((M.box.r - M.box.l) / NB)), 0, NB - 1); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = binAt(p); draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ return M && binAt(p) >= 0 ? { x0: p.x, c0: S.c } : null; },
        drag: function(d, p){ S.c = cl(Math.round((d.c0 + (p.x - d.x0) / (M.box.r - M.box.l) * (HI - LO)) * 20) / 20, -3, 1); sync(); draw(); },
        up: function(){ IX.save('ds3', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 4: half-life and dosing interval ===== */
  DOSE.add({ short: 'Half-life and dosing interval', level: 'applied', ord: 40, title: 'Half-life and dosing interval',
    build: function(api){
      var S = IX.state('ds4', { t: 1.08 }), hv = [-1, -1], M = [null, null], NB = 30;
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="430" style="width:436px;height:430px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="430" style="width:420px;height:430px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(IX.slider('t', 'Dosing interval tau', 0, 2.2, 0.02, S.t, 'h'));
      var T12 = DR.map(function(d){ return d.t12; });
      function rOf(tau){ return DR.map(function(d){ return 1 / (1 - Math.exp(-0.693 / d.t12 * tau)); }); }
      IX.tools(api, { canvases: function(){ return [ca, cb]; }, name: 'half-life-and-dosing-interval', csv: function(){ var tau = Math.pow(10, S.t), r = rOf(tau), rows = [['Drug', 'Half-life (h)', 'Accumulation ratio at tau ' + fx(tau) + ' h', 'Peak to trough ratio, exp(k tau)']]; DR.forEach(function(d, i){ rows.push([d.name || d.id, d.t12, r[i], Math.exp(0.693 / d.t12 * tau)]); }); return IX.csv(rows); } });
      function hist(c, vals, lo, hi, title, xl, ticks, hvk, vline, key){
        var cnt = new Array(NB).fill(0); vals.forEach(function(v){ var k = Math.floor((Math.log10(v) - lo) / (hi - lo) * NB); cnt[cl(k, 0, NB - 1)]++; });
        var g = cv(c), x = g.x, box = { l: 40, r: g.w - 12, t: 26, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.12, bw = (box.r - box.l) / NB, Mx = { x: x, box: box, lo: lo, hi: hi, cnt: cnt, bw: bw, ym: ym };
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(title, box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        cnt.forEach(function(n, k){ var hg = n / ym * (box.b - box.t); x.fillStyle = key === 'a' ? C.red : C.mid; x.globalAlpha = k === hv[key === 'a' ? 0 : 1] ? 1 : 0.8; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; ticks.forEach(function(v){ var px = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(v), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText(xl, (box.l + box.r) / 2, g.h - 6);
        if (vline !== null) { var vx = box.l + (Math.log10(vline) - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.warn; x.lineWidth = 2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(vx, box.t); x.lineTo(vx, box.b); x.stroke(); x.setLineDash([]); IX.dot(Mx, vx, box.t, 6, C.warn); lab(Mx, 'tau ' + fx(vline) + ' h (drag)', vx + 9, box.t + 14, C.warn); }
        var hk = hvk; if (hk >= 0) IX.tip(Mx, box.l + (hk + 0.5) * bw, box.b - cnt[hk] / ym * (box.b - box.t), [fx(Math.pow(10, lo + hk * (hi - lo) / NB)) + ' to ' + fx(Math.pow(10, lo + (hk + 1) * (hi - lo) / NB)), cnt[hk] + ' drugs']);
        return Mx;
      }
      function draw(){
        var tau = Math.pow(10, S.t); qs('.tv', c1).textContent = fx(tau);
        M[0] = hist(ca, T12, -1.5, 3.5, 'Terminal half-life, ' + DR.length + ' drugs', 'Half-life (h, logarithmic axis)', [0.1, 1, 10, 100, 1000], hv[0], tau, 'a');
        var r = rOf(tau); M[1] = hist(cb, r, 0, 3.5, 'Accumulation ratio at tau = ' + fx(tau) + ' h', 'Accumulation ratio R (logarithmic axis)', [1, 10, 100, 1000], hv[1], null, 'b');
        var above = T12.filter(function(t){ return tau > t; }).length, rm = med(r);
        qs('.ra', pn).innerHTML = 'Dosing interval <b>' + fx(tau) + ' h</b> exceeds the half-life for <b>' + above + ' of ' + DR.length + '</b> drugs (' + Math.round(100 * above / DR.length) + ' percent). Median half-life ' + fx(med(T12)) + ' h.';
        qs('.rb', pn2).innerHTML = 'Median accumulation ratio <b>' + rm.toFixed(2) + '</b>; ' + r.filter(function(v){ return v < 1.2; }).length + ' of ' + DR.length + ' drugs accumulate by less than 20 percent. Peak to trough, exp(k tau), is at least 2 for the ' + above + ' drugs above.';
        api.stat('tau ' + fx(tau) + ' h: ' + above + ' of ' + DR.length + ' drugs have tau above the half-life');
      }
      qs('.t', c1).addEventListener('input', function(){ S.t = +this.value; IX.save('ds4', S); draw(); });
      function binAt(i, p){ var m = M[i]; if (!m || p.x < m.box.l || p.x > m.box.r || p.y < m.box.t || p.y > m.box.b) return -1; return cl(Math.floor((p.x - m.box.l) / m.bw), 0, NB - 1); }
      IX.attach(ca, {
        move: function(p){ if (!M[0]) return; hv[0] = binAt(0, p); var m = M[0], vx = m.box.l + (S.t - m.lo) / (m.hi - m.lo) * (m.box.r - m.box.l); ca.style.cursor = near(p.x, vx, 8) ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv[0] = -1; draw(); },
        down: function(p){ var m = M[0], vx = m.box.l + (S.t - m.lo) / (m.hi - m.lo) * (m.box.r - m.box.l); return near(p.x, vx, 9) ? { k: 't' } : null; },
        drag: function(d, p){ var m = M[0]; S.t = cl(Math.round((m.lo + (p.x - m.box.l) / (m.box.r - m.box.l) * (m.hi - m.lo)) * 50) / 50, 0, 2.2); qs('.t', c1).value = S.t; draw(); },
        up: function(){ IX.save('ds4', S); }
      });
      IX.attach(cb, { move: function(p){ if (!M[1]) return; hv[1] = binAt(1, p); draw(); }, leave: function(){ hv[1] = -1; draw(); } });
      return { render: draw };
    } });

  /* ===== step 5: first-in-human starting dose ===== */
  var FDA = [['Mouse', 0.02, 3], ['Rat', 0.15, 6], ['Rabbit', 1.8, 12], ['Monkey', 3, 12], ['Dog', 10, 20]], KMH = 37, WH = 60;
  DOSE.add({ short: 'Starting dose from animal data', level: 'advanced', ord: 50, title: 'Starting dose from animal data',
    build: function(api){
      var S = IX.state('ds5', { n: 30, sp: 'Rat', sf: 10 }), hv = -1, M = null, G = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('n', 'NOAEL', 1, 300, 1, S.n, 'mg/kg')), c2 = api.addControl(sel('Species', 'sp', FDA.map(function(s){ return [s[0], s[0]]; }), S.sp)), c3 = api.addControl(IX.slider('sf', 'Safety factor', 1, 30, 1, S.sf));
      function sync(){ qs('.n', c1).value = S.n; qs('.sp', c2).value = S.sp; qs('.sf', c3).value = S.sf; }
      function cur(){ return FDA.filter(function(s){ return s[0] === S.sp; })[0]; }
      function hed(n, s){ return n * s[2] / KMH; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'starting-dose', csv: function(){ var s = cur(), rows = [['Species', 'Body weight (kg)', 'Surface-area factor', 'Dose giving the same human equivalent dose (mg/kg)']]; FDA.forEach(function(q){ rows.push([q[0], q[1], q[2], S.n * s[2] / q[2]]); }); rows.push([], ['NOAEL (mg/kg)', S.n], ['Species', s[0]], ['Human equivalent dose (mg/kg)', hed(S.n, s)], ['Safety factor', S.sf], ['Starting dose (mg/kg)', hed(S.n, s) / S.sf], ['Starting dose for 60 kg (mg)', hed(S.n, s) / S.sf * WH]); return IX.csv(rows); } });
      function draw(){
        var s = cur(), H = hed(S.n, s); qs('.nv', c1).textContent = S.n; qs('.sfv', c3).textContent = S.sf;
        var g = cv(cvs), x = g.x, box = { l: 70, r: g.w - 20, t: 36, b: g.h - 56 }, bw = (box.r - box.l) / FDA.length, ym = lock || Math.max(FDA.reduce(function(m, q){ return Math.max(m, S.n * s[2] / q[2]); }, S.n), 10) * 1.15; G = { box: box, bw: bw, ym: ym }; M = { x: x, box: box };
        function sy(v){ return box.b - v / ym * (box.b - box.t); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; var yt = niceTicks(0, ym, 5); yt.v.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 6, sy(v) + 4); });
        x.save(); x.translate(14, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Dose (mg/kg)', 0, 0); x.restore();
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('NOAEL in the selected species and the same human equivalent dose expressed in each species', box.l, 18);
        FDA.forEach(function(q, i){ var v = S.n * s[2] / q[2], bx = box.l + i * bw + bw * 0.16, w = bw * 0.68, on = q[0] === S.sp; x.fillStyle = on ? C.red : GREY; x.globalAlpha = hv === i ? 1 : 0.9; x.fillRect(bx, sy(v), w, box.b - sy(v)); x.globalAlpha = 1; x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(q[0], bx + w / 2, box.b + 18); x.font = '11px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.mid; x.fillText(q[1] + ' kg, factor ' + q[2], bx + w / 2, box.b + 34); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(fx(v), bx + w / 2, sy(v) - 6); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
        var si = FDA.indexOf(s), hxp = box.l + si * bw + bw * 0.5; IX.dot(M, hxp, sy(S.n), 7, C.red);
        IX.hline(M, sy(H), C.warn, [5, 4]); lab(M, 'human equivalent dose ' + fx(H) + ' mg/kg', box.r - 4, sy(H) - 6, C.warn, 'right');
        if (hv >= 0) { var q = FDA[hv]; IX.tip(M, box.l + hv * bw + bw * 0.5, sy(S.n * s[2] / q[2]), [q[0] + ', ' + q[1] + ' kg', 'surface-area factor ' + q[2], 'dose ' + fx(S.n * s[2] / q[2]) + ' mg/kg']); }
        qs('.sd', side).innerHTML = fTile('Starting dose', fx(H / S.sf * WH) + ' mg', 'for a ' + WH + ' kg adult') + fRows([['Human equivalent dose', fx(H) + ' mg/kg'], ['Per kg after the safety factor', fx(H / S.sf) + ' mg/kg'], ['Conversion, animal factor / 37', fx(s[2] / KMH)], ['Species', s[0] + ', ' + s[1] + ' kg']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">HED = NOAEL x (animal factor / human factor 37). Drag the selected bar top to set the NOAEL.</div>';
        api.stat('Starting dose ' + fx(H / S.sf * WH) + ' mg from a NOAEL of ' + S.n + ' mg/kg in ' + s[0]);
      }
      [['n', c1], ['sf', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('ds5', S); draw(); }); });
      qs('.sp', c2).addEventListener('change', function(){ S.sp = this.value; IX.save('ds5', S); draw(); });
      function hpos(){ var i = FDA.indexOf(cur()); return [G.box.l + i * G.bw + G.bw * 0.5, G.box.b - S.n / G.ym * (G.box.b - G.box.t)]; }
      IX.attach(cvs, {
        move: function(p){ if (!G) return; hv = (p.x >= G.box.l && p.x <= G.box.r && p.y >= G.box.t && p.y <= G.box.b) ? Math.floor((p.x - G.box.l) / G.bw) : -1; var h = hpos(); cvs.style.cursor = Math.hypot(p.x - h[0], p.y - h[1]) < 12 ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var h = hpos(); if (Math.hypot(p.x - h[0], p.y - h[1]) < 14) { lock = G.ym; return { k: 'n', ym: G.ym }; } return null; },
        drag: function(d, p){ S.n = cl(Math.round((G.box.b - p.y) / (G.box.b - G.box.t) * d.ym), 1, 300); sync(); draw(); },
        up: function(){ lock = null; IX.save('ds5', S); draw(); }
      });
      sync();
      return { render: draw };
    } });
})();
