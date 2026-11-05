"use strict";
/* Tab 10: drug-drug interactions by inhibition and induction of metabolism. Static models from the literature; data: the in vivo
   CYP inhibition database of Ito et al. (2004), 190 studies with CYP3A4, CYP2D6 or CYP2C9 as the interacting enzyme (ito_data.js). */
var DDI = new Lesson('ddi', 'Drug-drug interactions');
DDI.noOpts = true;

(function(){
  var GREY = '#A1B1C4', CYPC = { '3A4': '#B4561B', '2D6': '#0F6E8C', '2C9': '#34373F' };
  var IK = [['iav', '[I]av, average total'], ['iavu', '[I]av,u, average unbound'], ['imax', '[I]max, maximum total'], ['iin', '[I]in, maximum at the liver inlet']];
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function sel(label, cls, list, cur){ return label + ' <select class="' + cls + '">' + list.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
  function aucr(x, fm){ return 1 / (fm / (1 + x) + 1 - fm); }
  function subset(cyp){ return ITO.filter(function(r){ return cyp === 'all' || r.c === cyp; }); }
  function conf(rows, ik, cut, thr){ var o = { tp: 0, tn: 0, fp: 0, fn: 0 }; rows.forEach(function(r){ var pos = r.a >= thr, pr = r[ik] >= cut; if (pos && pr) o.tp++; else if (pos) o.fn++; else if (pr) o.fp++; else o.tn++; }); return o; }
  function score(rows, ik){ var n = rows.length, w2 = 0, s = 0, sa = 0; rows.forEach(function(r){ var l = Math.log10((1 + r[ik]) / r.a); s += l; sa += Math.abs(l); if (Math.abs(l) <= Math.log10(2)) w2++; }); return { n: n, w2: w2, afe: n ? Math.pow(10, sa / n) : NaN, bias: n ? Math.pow(10, s / n) : NaN }; }

  /* log-log (or log-linear) plot with inverse mapping */
  function ll(el, o){
    var g = cv(el), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, lg = Math.log10;
    var xl = lg(o.xr[0]), xh = lg(o.xr[1]), yl = o.ylog ? lg(o.yr[0]) : o.yr[0], yh = o.ylog ? lg(o.yr[1]) : o.yr[1];
    function sx(v){ return box.l + (lg(Math.max(v, 1e-12)) - xl) / (xh - xl) * (box.r - box.l); }
    function sy(v){ return box.b - ((o.ylog ? lg(Math.max(v, 1e-12)) : v) - yl) / (yh - yl) * (box.b - box.t); }
    function ix(px){ return Math.pow(10, xl + (px - box.l) / (box.r - box.l) * (xh - xl)); }
    function iy(py){ var v = yl + (box.b - py) / (box.b - box.t) * (yh - yl); return o.ylog ? Math.pow(10, v) : v; }
    x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right';
    (o.yt || []).forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(String(+v.toPrecision(3)), box.l - 6, sy(v) + 4); });
    x.textAlign = 'center'; (o.xt || []).forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(String(+v.toPrecision(3)), sx(v), box.b + 16); });
    x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(box.l, box.b); x.lineTo(box.r, box.b); x.moveTo(box.l, box.t); x.lineTo(box.l, box.b); x.stroke();
    x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(o.xl || '', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(o.yl || '', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
    function curve(s){ x.strokeStyle = s.color; x.lineWidth = s.w || 2.4; x.setLineDash(s.dash || []); x.lineJoin = 'round'; x.beginPath(); var open = false, i; for (i = 0; i <= 220; i++) { var v = Math.pow(10, xl + (xh - xl) * i / 220), yv = s.fn(v); if (!isFinite(yv)) { open = false; continue; } var py = sy(yv); if (py < box.t - 4 || py > box.b + 4) { open = false; continue; } open ? x.lineTo(sx(v), py) : x.moveTo(sx(v), py); open = true; } x.stroke(); x.setLineDash([]); }
    (o.pinned || []).forEach(curve); (o.series || []).forEach(curve);
    var lgd = (o.series || []).filter(function(s){ return s.label; }), lx = box.l + 8; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left';
    lgd.forEach(function(s){ x.strokeStyle = s.color; x.lineWidth = 2.4; x.setLineDash(s.dash || []); x.beginPath(); x.moveTo(lx, box.t + 10); x.lineTo(lx + 16, box.t + 10); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.fillText(s.label, lx + 20, box.t + 14); lx += 34 + s.label.length * 6.2; }); x.font = '12px Aptos, "Segoe UI", sans-serif';
    return { g: g, x: x, box: box, sx: sx, sy: sy, ix: ix, iy: iy, inside: function(p){ return p.x >= box.l && p.x <= box.r && p.y >= box.t && p.y <= box.b; } };
  }
  function tipBox(M){ return { x: M.x, box: M.box }; }

  /* ===== step 1: reversible inhibition ===== */
  DDI.add({ short: 'Reversible inhibition', level: 'foundations', ord: 10, title: 'Reversible inhibition and the AUC ratio',
    build: function(api){
      var S = IX.state('dd1', { i: 0, k: 0, fm: 0.9 }), pins = [], hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('i', '[I]', -2, 2, 0.05, S.i, 'uM')), c2 = api.addControl(IX.slider('k', 'Ki', -2, 2, 0.05, S.k, 'uM')), c3 = api.addControl(IX.slider('f', 'fm', 0, 1, 0.01, S.fm));
      function sync(){ qs('.i', c1).value = S.i; qs('.k', c2).value = S.k; qs('.f', c3).value = S.fm; }
      IX.tools(api, { pin: function(){ pins.push({ x: Math.pow(10, S.i - S.k), fm: S.fm }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'reversible-inhibition',
        csv: function(){ var rows = [['[I]/Ki', 'AUC ratio, fm 1', 'AUC ratio, fm 0.9', 'AUC ratio, fm 0.7', 'AUC ratio, fm 0.5', 'AUC ratio, fm 0.3', 'AUC ratio, fm set']], i; for (i = 0; i <= 80; i++) { var v = Math.pow(10, -2 + 4 * i / 80); rows.push([v, aucr(v, 1), aucr(v, 0.9), aucr(v, 0.7), aucr(v, 0.5), aucr(v, 0.3), aucr(v, S.fm)]); } return IX.csv(rows); } });
      function draw(){
        var I = Math.pow(10, S.i), Ki = Math.pow(10, S.k), x0 = I / Ki, R = aucr(x0, S.fm);
        qs('.iv', c1).textContent = fx(I); qs('.kv', c2).textContent = fx(Ki); qs('.fv', c3).textContent = S.fm.toFixed(2);
        var ser = [1, 0.9, 0.7, 0.5, 0.3].map(function(f){ return { fn: function(v){ return aucr(v, f); }, color: GREY, w: 1.4 }; }); ser.push({ fn: function(v){ return aucr(v, S.fm); }, color: C.red, w: 2.8 });
        M = ll(cvs, { xr: [0.01, 100], yr: [1, 100], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [1, 2, 5, 10, 20, 50, 100], xl: '[I] / Ki', yl: 'AUC ratio', series: ser, pinned: pins.map(function(p){ return { fn: function(v){ return aucr(v, p.fm); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var xg = M.x; [1, 0.9, 0.7, 0.5, 0.3].forEach(function(f){ lab(M, 'fm ' + f, M.box.r - 4, M.sy(aucr(100, f)) - 4, C.mid, 'right'); });
        IX.hline(M, M.sy(2), C.warn, [5, 4]); lab(M, 'AUC ratio 2', M.box.l + 8, M.sy(2) - 5, C.warn); IX.vline(M, M.sx(1), C.mid, [2, 4]);
        if (S.fm < 1) { var pl = 1 / (1 - S.fm); IX.hline(M, M.sy(pl), C.red, [2, 3]); lab(M, 'ceiling 1 / (1 - fm) = ' + fx(pl), M.box.l + 8, M.sy(pl) - 5, C.red); }
        pins.forEach(function(p){ IX.dot(M, M.sx(p.x), M.sy(aucr(p.x, p.fm)), 4, GREY); });
        IX.dot(M, M.sx(cl(x0, 0.0101, 99)), M.sy(R), 7, C.red); lab(M, 'drag', M.sx(cl(x0, 0.0101, 99)) + 11, M.sy(R) + 15, C.red);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(aucr(hv, S.fm)), ['[I] / Ki = ' + fx(hv), 'AUC ratio ' + aucr(hv, S.fm).toFixed(2) + ' at fm ' + S.fm.toFixed(2), 'at fm 1: ' + aucr(hv, 1).toFixed(2)]); }
        qs('.sd', side).innerHTML = fTile('AUC ratio', R.toFixed(2), '1 / [fm / (1 + [I]/Ki) + 1 - fm]') + fRows([['[I] / Ki', fx(x0)], ['fm', S.fm.toFixed(2)], ['Ceiling at this fm', S.fm < 1 ? fx(1 / (1 - S.fm)) : 'none'], ['Clearance reduced by', (100 * (1 - 1 / R)).toFixed(0) + ' percent'], ['AUC ratio at fm = 1', (1 + x0).toFixed(2)]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Drag the point: horizontal sets [I] with Ki fixed, vertical sets fm.</div>';
        api.stat('AUC ratio ' + R.toFixed(2) + ' at [I]/Ki ' + fx(x0) + ', fm ' + S.fm.toFixed(2));
      }
      [['i', c1], ['k', c2]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('dd1', S); draw(); }); });
      qs('.f', c3).addEventListener('input', function(){ S.fm = +this.value; IX.save('dd1', S); draw(); });
      function dotPos(){ var x0 = cl(Math.pow(10, S.i - S.k), 0.0101, 99); return [M.sx(x0), M.sy(aucr(x0, S.fm))]; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; var d = dotPos(); cvs.style.cursor = Math.hypot(p.x - d[0], p.y - d[1]) < 12 ? 'move' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var d = dotPos(); return Math.hypot(p.x - d[0], p.y - d[1]) < 14 ? { k: 'pt' } : null; },
        drag: function(d, p){ var x1 = cl(M.ix(p.x), 0.01, 100), r1 = cl(M.iy(p.y), 1.01, 99.5); S.i = cl(Math.round((S.k + Math.log10(x1)) * 20) / 20, -2, 2); S.fm = cl(Math.round((1 - 1 / r1) * (1 + x1) / x1 * 100) / 100, 0, 1); sync(); draw(); },
        up: function(){ IX.save('dd1', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: inhibitor concentration ===== */
  DDI.add({ short: 'Inhibitor concentration', level: 'foundations', ord: 20, title: 'Inhibitor concentration at the enzyme',
    build: function(api){
      var S = IX.state('dd2', { d: 100, mw: 350, tau: 12, cf: 3, t: 6, ka: -1.3, fu: -1, k: 0 }), hv = -1, M = null, QH = 1610;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('d', 'Dose', 10, 1000, 10, S.d, 'mg')), c2 = api.addControl(IX.slider('mw', 'MW', 150, 700, 10, S.mw, 'Da')), c3 = api.addControl(sel('Interval', 'tau', [[6, '6 h'], [8, '8 h'], [12, '12 h'], [24, '24 h']], S.tau)), c4 = api.addControl(IX.slider('cf', 'CL/F', 2, 4, 0.05, S.cf, 'mL/min')), c5 = api.addControl(IX.slider('t', 'Half-life', 1, 48, 1, S.t, 'h')), c6 = api.addControl(IX.slider('ka', 'ka x Fa', -3, -1, 0.05, S.ka, '1/min')), c7 = api.addControl(IX.slider('fu', 'fu', -2, 0, 0.05, S.fu)), c8 = api.addControl(IX.slider('k', 'Ki', -2, 2.4, 0.05, S.k, 'uM'));
      function sync(){ qs('.d', c1).value = S.d; qs('.mw', c2).value = S.mw; qs('.cf', c4).value = S.cf; qs('.t', c5).value = S.t; qs('.ka', c6).value = S.ka; qs('.fu', c7).value = S.fu; qs('.k', c8).value = S.k; qs('.tau', c3).value = S.tau; }
      function calc(){ var D = S.d / S.mw * 1e6, CLF = Math.pow(10, S.cf), tau = +S.tau, k = 0.693 / S.t, kaFa = Math.pow(10, S.ka), fu = Math.pow(10, S.fu), iav = D / (tau * 60) / CLF, imax = iav * k * tau / (1 - Math.exp(-k * tau)), iin = iav + kaFa * D / QH; return { D: D, iav: iav, iavu: fu * iav, imax: imax, iin: iin, Ki: Math.pow(10, S.k), fu: fu }; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'inhibitor-concentration', csv: function(){ var q = calc(), rows = [['Concentration', 'Value (uM)', '[I] / Ki', 'AUC ratio at fm = 1']]; IK.forEach(function(r){ rows.push([r[1], q[r[0]], q[r[0]] / q.Ki, 1 + q[r[0]] / q.Ki]); }); rows.push([], ['Ki (uM)', q.Ki], ['Dose (nmol)', q.D]); return IX.csv(rows); } });
      var LO = -3, HI = 3;
      function draw(){
        var q = calc(); qs('.dv', c1).textContent = S.d; qs('.mwv', c2).textContent = S.mw; qs('.cfv', c4).textContent = fx(Math.pow(10, S.cf)); qs('.tv', c5).textContent = S.t; qs('.kav', c6).textContent = fx(Math.pow(10, S.ka)); qs('.fuv', c7).textContent = fx(q.fu); qs('.kv', c8).textContent = fx(q.Ki);
        var g = cv(cvs), x = g.x, box = { l: 190, r: g.w - 24, t: 40, b: g.h - 64 }, rows = [['iavu', '[I]av,u', C.tint], ['iav', '[I]av', C.mid], ['imax', '[I]max', C.red], ['iin', '[I]in', C.dred]], bh = (box.b - box.t) / 4; M = { x: x, box: box };
        function bx(v){ return box.l + (Math.log10(Math.max(v, 1e-9)) - LO) / (HI - LO) * (box.r - box.l); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Inhibitor concentrations for the regimen set (uM, logarithmic axis)', 20, 22); x.font = '12px Aptos, "Segoe UI", sans-serif';
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [-3, -2, -1, 0, 1, 2, 3].forEach(function(e){ var px = bx(Math.pow(10, e)); x.beginPath(); x.moveTo(px, box.t); x.lineTo(px, box.b); x.stroke(); x.fillText(String(+Math.pow(10, e).toPrecision(3)), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText('Concentration (uM)', (box.l + box.r) / 2, box.b + 34);
        rows.forEach(function(r, i){ var y = box.t + i * bh + 8, w = bx(q[r[0]]) - box.l; x.fillStyle = r[2]; x.globalAlpha = hv === i ? 1 : 0.9; x.fillRect(box.l, y, Math.max(w, 1), bh - 18); x.globalAlpha = 1; x.fillStyle = C.char; x.textAlign = 'right'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(r[1], box.l - 10, y + (bh - 18) / 2 + 4); x.textAlign = 'left'; x.fillText(fx(q[r[0]]) + ' uM, ratio ' + fx(q[r[0]] / q.Ki), box.l + Math.max(w, 1) + 8, y + (bh - 18) / 2 + 4); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
        var kx = bx(q.Ki); x.strokeStyle = C.warn; x.lineWidth = 2; x.setLineDash([6, 4]); x.beginPath(); x.moveTo(kx, box.t - 8); x.lineTo(kx, box.b); x.stroke(); x.setLineDash([]); IX.dot(M, kx, box.t - 8, 6, C.warn); lab(M, 'Ki ' + fx(q.Ki) + ' uM (drag)', kx + 9, box.t - 12, C.warn);
        if (hv >= 0) IX.tip(M, bx(q[rows[hv][0]]), box.t + hv * bh + 20, [IK.filter(function(z){ return z[0] === rows[hv][0]; })[0][1], fx(q[rows[hv][0]]) + ' uM', '[I] / Ki ' + fx(q[rows[hv][0]] / q.Ki), 'AUC ratio at fm = 1: ' + (1 + q[rows[hv][0]] / q.Ki).toFixed(2)]);
        x.fillStyle = C.mid; x.font = '11.5px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('[I]av = (D / tau) / (CL/F);  [I]max = [I]av x k tau / (1 - exp(-k tau));  [I]in = [I]av + ka Fa D / Qh,  Qh = 1610 mL/min', 20, g.h - 14);
        qs('.sd', side).innerHTML = fTile('[I]in / Ki', fx(q.iin / q.Ki), 'AUC ratio at fm = 1: ' + (1 + q.iin / q.Ki).toFixed(2)) + fRows(rows.map(function(r){ return [r[1], fx(q[r[0]] / q.Ki)]; }).reverse()) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Dose ' + fx(q.D) + ' nmol. The ratios are [I] / Ki for each definition. Drag the Ki line.</div>';
        api.stat('[I]in / Ki = ' + fx(q.iin / q.Ki) + ', [I]av,u / Ki = ' + fx(q.iavu / q.Ki));
      }
      [['d', c1, 'd'], ['mw', c2, 'mw'], ['cf', c4, 'cf'], ['t', c5, 't'], ['ka', c6, 'ka'], ['fu', c7, 'fu'], ['k', c8, 'k']].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[2]] = +this.value; IX.save('dd2', S); draw(); }); });
      qs('.tau', c3).addEventListener('change', function(){ S.tau = +this.value; IX.save('dd2', S); draw(); });
      function bxv(px){ return Math.pow(10, LO + (px - M.box.l) / (M.box.r - M.box.l) * (HI - LO)); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; var i = (p.x >= M.box.l && p.y >= M.box.t && p.y <= M.box.b) ? Math.floor((p.y - M.box.t) / ((M.box.b - M.box.t) / 4)) : -1; hv = i; var kx = M.box.l + (S.k - LO) / (HI - LO) * (M.box.r - M.box.l); cvs.style.cursor = near(p.x, kx, 9) ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var kx = M.box.l + (S.k - LO) / (HI - LO) * (M.box.r - M.box.l); return near(p.x, kx, 10) ? { k: 'ki' } : null; },
        drag: function(d, p){ S.k = cl(Math.round(Math.log10(cl(bxv(p.x), 0.01, 250)) * 20) / 20, -2, 2.4); sync(); draw(); },
        up: function(){ IX.save('dd2', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: predicted against observed AUC ratio ===== */
  DDI.add({ short: 'Predicted against observed AUC ratio', level: 'applied', ord: 30, title: 'Predicted against observed AUC ratio',
    build: function(api){
      var S = IX.state('dd3', { cyp: 'all', ik: 'iin' }), selr = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
      var c1 = api.addControl(sel('Enzyme', 'cyp', [['all', 'All three'], ['3A4', 'CYP3A4'], ['2D6', 'CYP2D6'], ['2C9', 'CYP2C9']], S.cyp)), c2 = api.addControl(sel('Inhibitor concentration', 'ik', IK, S.ik));
      function draw(){
        var rows = subset(S.cyp), M = ll(cvs, { xr: [1, 10000], yr: [0.5, 40], ylog: true, xt: [1, 10, 100, 1000], yt: [0.5, 1, 2, 5, 10, 20], xl: 'Predicted AUC ratio, 1 + [I] / Ki', yl: 'Observed AUC ratio' }), x = M.x;
        x.fillStyle = 'rgba(15,110,140,.09)'; x.beginPath(); x.moveTo(M.sx(1), M.sy(2)); x.lineTo(M.sx(10000), M.sy(20000)); x.lineTo(M.sx(10000), M.sy(5000)); x.lineTo(M.sx(1), M.sy(0.5)); x.closePath(); x.fill();
        x.strokeStyle = C.mid; x.lineWidth = 1.2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(M.sx(1), M.sy(1)); x.lineTo(M.sx(10000), M.sy(10000)); x.stroke(); x.strokeStyle = C.warn; x.beginPath(); x.moveTo(M.box.l, M.sy(2)); x.lineTo(M.box.r, M.sy(2)); x.moveTo(M.sx(2), M.box.t); x.lineTo(M.sx(2), M.box.b); x.stroke(); x.setLineDash([]);
        var pts = []; rows.forEach(function(r){ var px = M.sx(1 + r[S.ik]), py = M.sy(r.a), on = selr === r; x.fillStyle = CYPC[r.c]; x.globalAlpha = on ? 1 : 0.72; x.beginPath(); x.arc(px, py, on ? 7 : 4.2, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } pts.push({ x: px, y: py, r: r, vx: r.a, vy: 1 + r[S.ik] }); });
        cvs._pts = pts; cvs._g = M.g;
        lab(M, 'false negatives', M.box.l + 8, M.sy(2) - 6, C.warn); lab(M, 'false positives', M.box.r - 6, M.sy(2) + 14, C.warn, 'right');
        var sc = score(rows, S.ik), cf = conf(rows, S.ik, 1, 2);
        qs('.tl', side).innerHTML = fTile('Within 2-fold', sc.w2 + ' of ' + sc.n, 'average fold error ' + sc.afe.toFixed(2) + ', bias ' + sc.bias.toFixed(2)) + fRows([['True positive', cf.tp], ['False negative', cf.fn], ['False positive', cf.fp], ['True negative', cf.tn], ['Sensitivity', cf.tp + cf.fn ? (cf.tp / (cf.tp + cf.fn)).toFixed(2) : 'n/a']]) + '<div style="display:flex;gap:10px;font-size:12px;margin-top:6px">' + Object.keys(CYPC).map(function(k){ return '<span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + CYPC[k] + ';margin-right:4px"></i>' + k + '</span>'; }).join('') + '</div><div class="hint" style="font-size:11.5px;margin-top:6px">Positive: observed AUC ratio of 2 or more. Predicted positive: [I]/Ki of 1 or more.</div>';
        qs('.det', side).innerHTML = selr ? '<div style="font-weight:700;font-size:14px;margin:8px 0 4px">' + selr.s + ' with ' + selr.i + '</div>' + fRows([['Enzyme', 'CYP' + selr.c], ['Observed AUC ratio', selr.a], ['Ki', fx(selr.k) + ' uM'], ['[I] / Ki', fx(selr[S.ik])], ['Predicted AUC ratio', fx(1 + selr[S.ik])]]) : '<div class="hint" style="font-size:12px;margin-top:8px">Select a point.</div>';
        api.stat(sc.w2 + ' of ' + sc.n + ' within 2-fold, ' + cf.fn + ' false negatives');
      }
      qs('.cyp', c1).addEventListener('change', function(){ S.cyp = this.value; selr = null; IX.save('dd3', S); draw(); }); qs('.ik', c2).addEventListener('change', function(){ S.ik = this.value; IX.save('dd3', S); draw(); });
      cvs.addEventListener('click', function(ev){ var rc = cvs.getBoundingClientRect(), g = cvs._g, mx = (ev.clientX - rc.left) * g.w / rc.width, my = (ev.clientY - rc.top) * g.h / rc.height, b = null, bd = 12; (cvs._pts || []).forEach(function(q){ var d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; b = q.r; } }); selr = b; draw(); });
      return { render: draw };
    } });

  /* ===== step 4: cutoff and classification ===== */
  DDI.add({ short: 'Cutoff and classification', level: 'applied', ord: 40, title: 'Cutoff and classification',
    build: function(api){
      var S = IX.state('dd4', { cyp: 'all', ik: 'iin', c: 0, t: 2 }), hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(sel('Enzyme', 'cyp', [['all', 'All three'], ['3A4', 'CYP3A4'], ['2D6', 'CYP2D6'], ['2C9', 'CYP2C9']], S.cyp)), c2 = api.addControl(sel('Inhibitor concentration', 'ik', IK, S.ik)), c3 = api.addControl(IX.slider('c', 'Cutoff on [I]/Ki', -2, 2, 0.05, S.c)), c4 = api.addControl(IX.slider('t', 'Positive if AUC ratio at least', 1.2, 5, 0.1, S.t));
      function sync(){ qs('.c', c3).value = S.c; qs('.t', c4).value = S.t; }
      function rates(rows, ik, cut, thr){ var o = conf(rows, ik, cut, thr); return { sens: o.tp + o.fn ? o.tp / (o.tp + o.fn) : 0, fpr: o.fp + o.tn ? o.fp / (o.fp + o.tn) : 0, o: o }; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'cutoff-and-classification', csv: function(){ var rows = subset(S.cyp), out = [['Cutoff on [I]/Ki', 'Sensitivity', 'False-positive rate', 'TP', 'FN', 'FP', 'TN']], i; for (i = 0; i <= 80; i++) { var cut = Math.pow(10, -2 + 4 * i / 80), r = rates(rows, S.ik, cut, S.t); out.push([cut, r.sens, r.fpr, r.o.tp, r.o.fn, r.o.fp, r.o.tn]); } return IX.csv(out); } });
      function draw(){
        var cut = Math.pow(10, S.c), rows = subset(S.cyp); qs('.cv', c3).textContent = fx(cut); qs('.tv', c4).textContent = S.t.toFixed(1);
        M = ll(cvs, { xr: [0.01, 100], yr: [0, 1], ylog: false, xt: [0.01, 0.1, 1, 10, 100], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'Cutoff on [I] / Ki', yl: 'Rate', series: [{ fn: function(v){ return rates(rows, S.ik, v, S.t).sens; }, color: C.red, w: 2.6, label: 'Sensitivity' }, { fn: function(v){ return rates(rows, S.ik, v, S.t).fpr; }, color: C.mid, w: 2.6, label: 'False-positive rate' }] });
        IX.vline(M, M.sx(cut), C.char, [4, 4]); var r0 = rates(rows, S.ik, cut, S.t); IX.dot(M, M.sx(cut), M.sy(r0.sens), 6, C.red); IX.dot(M, M.sx(cut), M.sy(r0.fpr), 6, C.mid); lab(M, 'cutoff ' + fx(cut) + ' (drag)', M.sx(cut) + 9, M.box.t + 30, C.char);
        if (hv !== null) { var rr = rates(rows, S.ik, hv, S.t); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(rr.sens), ['cutoff ' + fx(hv), 'sensitivity ' + rr.sens.toFixed(2), 'false-positive rate ' + rr.fpr.toFixed(2), rr.o.fn + ' false negatives, ' + rr.o.fp + ' false positives']); }
        qs('.sd', side).innerHTML = '<div class="ol">At the cutoff, by concentration definition</div><table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:4px"><tr style="text-align:left;color:' + C.mid + '"><th>[I]</th><th>TP</th><th>FN</th><th>FP</th><th>TN</th><th>Sens.</th></tr>' + IK.map(function(k){ var o = conf(rows, k[0], cut, S.t), se = o.tp + o.fn ? (o.tp / (o.tp + o.fn)).toFixed(2) : 'n/a'; return '<tr style="' + (k[0] === S.ik ? 'font-weight:700;background:' + C.light : '') + '"><td>' + k[1].split(',')[0] + '</td><td>' + o.tp + '</td><td>' + o.fn + '</td><td>' + o.fp + '</td><td>' + o.tn + '</td><td>' + se + '</td></tr>'; }).join('') + '</table>' + fTile('Selected, false negatives', r0.o.fn + ' of ' + (r0.o.tp + r0.o.fn), 'false positives ' + r0.o.fp + ' of ' + (r0.o.fp + r0.o.tn)) + '<div class="hint" style="font-size:11.5px;margin-top:8px">n = ' + rows.length + ' studies. Lowering the cutoff removes false negatives and adds false positives.</div>';
        api.stat('Cutoff ' + fx(cut) + ': sensitivity ' + r0.sens.toFixed(2) + ', false-positive rate ' + r0.fpr.toFixed(2));
      }
      qs('.cyp', c1).addEventListener('change', function(){ S.cyp = this.value; IX.save('dd4', S); draw(); }); qs('.ik', c2).addEventListener('change', function(){ S.ik = this.value; IX.save('dd4', S); draw(); });
      qs('.c', c3).addEventListener('input', function(){ S.c = +this.value; IX.save('dd4', S); draw(); }); qs('.t', c4).addEventListener('input', function(){ S.t = +this.value; IX.save('dd4', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = near(p.x, M.sx(Math.pow(10, S.c)), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ return near(p.x, M.sx(Math.pow(10, S.c)), 9) && p.y >= M.box.t && p.y <= M.box.b ? { k: 'c' } : null; },
        drag: function(d, p){ S.c = cl(Math.round(Math.log10(cl(M.ix(p.x), 0.01, 100)) * 20) / 20, -2, 2); sync(); draw(); },
        up: function(){ IX.save('dd4', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 5: inhibitors in the database ===== */
  DDI.add({ short: 'Inhibitor potency and exposure', level: 'applied', ord: 50, title: 'Inhibitor potency and exposure',
    build: function(api){
      var S = IX.state('dd5', { cyp: 'all', ik: 'iin' }), selr = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
      var c1 = api.addControl(sel('Enzyme', 'cyp', [['all', 'All three'], ['3A4', 'CYP3A4'], ['2D6', 'CYP2D6'], ['2C9', 'CYP2C9']], S.cyp)), c2 = api.addControl(sel('Inhibitor concentration', 'ik', IK, S.ik));
      function draw(){
        var rows = subset(S.cyp), M = ll(cvs, { xr: [0.005, 500], yr: [0.00001, 10000], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [0.0001, 0.01, 1, 100, 10000], xl: 'Ki (uM)', yl: 'Inhibitor concentration (uM)' }), x = M.x;
        [[1, 'solid', '[I] = Ki'], [0.1, 'dash', '[I] = 0.1 Ki']].forEach(function(l){ x.strokeStyle = l[1] === 'solid' ? C.char : C.mid; x.lineWidth = 1.3; x.setLineDash(l[1] === 'solid' ? [] : [5, 4]); x.beginPath(); x.moveTo(M.sx(0.005), M.sy(0.005 * l[0])); x.lineTo(M.sx(500), M.sy(500 * l[0])); x.stroke(); x.setLineDash([]); lab(M, l[2], M.sx(150), M.sy(150 * l[0]) - 6, l[1] === 'solid' ? C.char : C.mid, 'right'); });
        var pts = []; rows.forEach(function(r){ var cc = r[S.ik] * r.k, px = M.sx(r.k), py = M.sy(Math.max(cc, 0.000011)), on = selr === r; x.fillStyle = r.a >= 2 ? C.red : GREY; x.globalAlpha = on ? 1 : 0.75; x.beginPath(); x.arc(px, py, on ? 7 : 4, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } pts.push({ x: px, y: py, r: r, vx: r.k, vy: cc }); });
        cvs._pts = pts; cvs._g = M.g;
        var pos = rows.filter(function(r){ return r.a >= 2; }), above = rows.filter(function(r){ return r[S.ik] >= 1; });
        qs('.tl', side).innerHTML = fTile('Ki range', fx(Math.min.apply(null, rows.map(function(r){ return r.k; }))) + ' to ' + fx(Math.max.apply(null, rows.map(function(r){ return r.k; }))), 'uM, ' + rows.length + ' studies') + fRows([['AUC ratio 2 or more', pos.length + ' of ' + rows.length], ['[I] at or above Ki', above.length + ' of ' + rows.length], ['Of those, observed positive', above.length ? above.filter(function(r){ return r.a >= 2; }).length + ' of ' + above.length : 'n/a']]) + '<div style="display:flex;gap:12px;font-size:12px;margin-top:6px"><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + C.red + ';margin-right:4px"></i>AUC ratio 2 or more</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + GREY + ';margin-right:4px"></i>below 2</span></div>';
        qs('.det', side).innerHTML = selr ? '<div style="font-weight:700;font-size:14px;margin:8px 0 4px">' + selr.i + '</div>' + fRows([['Substrate', selr.s], ['Enzyme', 'CYP' + selr.c], ['Ki', fx(selr.k) + ' uM'], ['[I]', fx(selr[S.ik] * selr.k) + ' uM'], ['Observed AUC ratio', selr.a]]) : '<div class="hint" style="font-size:12px;margin-top:8px">Select a point.</div>';
        api.stat(pos.length + ' of ' + rows.length + ' studies with an AUC ratio of 2 or more');
      }
      qs('.cyp', c1).addEventListener('change', function(){ S.cyp = this.value; selr = null; IX.save('dd5', S); draw(); }); qs('.ik', c2).addEventListener('change', function(){ S.ik = this.value; IX.save('dd5', S); draw(); });
      cvs.addEventListener('click', function(ev){ var rc = cvs.getBoundingClientRect(), g = cvs._g, mx = (ev.clientX - rc.left) * g.w / rc.width, my = (ev.clientY - rc.top) * g.h / rc.height, b = null, bd = 12; (cvs._pts || []).forEach(function(q){ var d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; b = q.r; } }); selr = b; draw(); });
      return { render: draw };
    } });

  /* ===== step 6: time-dependent inhibition and induction ===== */
  DDI.add({ short: 'Time-dependent inhibition and induction', level: 'advanced', ord: 60, title: 'Time-dependent inhibition and induction',
    build: function(api){
      var S = IX.state('dd6', { i: 0, fm: 0.9, k: 0.7, ki: 0.5, kI: 0.5, kd: 0.019, em: 5, ec: 0.5, mode: 'all' }), pins = [], hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('i', '[I]', -2, 2, 0.05, S.i, 'uM')), c2 = api.addControl(IX.slider('f', 'fm', 0, 1, 0.01, S.fm)), c3 = api.addControl(IX.slider('k', 'Ki (reversible)', -1, 3, 0.05, S.k, 'uM')), c4 = api.addControl(IX.slider('ki', 'kinact', -2, 1, 0.05, S.ki, '1/h')), c5 = api.addControl(IX.slider('kI', 'KI', -1, 3, 0.05, S.kI, 'uM')), c6 = api.addControl(IX.slider('kd', 'kdeg', 0.005, 0.1, 0.001, S.kd, '1/h')), c7 = api.addControl(IX.slider('em', 'Emax', 0, 20, 0.5, S.em)), c8 = api.addControl(IX.slider('ec', 'EC50', -2, 2, 0.05, S.ec, 'uM'));
      function P(I, o){ o = o || S; var Ki = Math.pow(10, o.k), kinact = Math.pow(10, o.ki), KI = Math.pow(10, o.kI), EC = Math.pow(10, o.ec), A = 1 / (1 + I / Ki), B = o.kd / (o.kd + kinact * I / (KI + I)), Cc = 1 + o.em * I / (EC + I); function f(R){ return 1 / (R * o.fm + 1 - o.fm); } return { A: A, B: B, C: Cc, rev: f(A), tdi: f(B), ind: f(Cc), all: f(A * B * Cc) }; }
      function sync(){ ['i', 'f', 'k', 'ki', 'kI', 'kd', 'em', 'ec'].forEach(function(k, j){ var m = { i: ['i', c1], f: ['fm', c2], k: ['k', c3], ki: ['ki', c4], kI: ['kI', c5], kd: ['kd', c6], em: ['em', c7], ec: ['ec', c8] }[k]; qs('.' + k, m[1]).value = S[m[0]]; }); }
      IX.tools(api, { pin: function(){ pins.push(JSON.parse(JSON.stringify(S))); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'tdi-and-induction',
        csv: function(){ var rows = [['[I] (uM)', 'Reversible only', 'Time-dependent only', 'Induction only', 'Combined']], i; for (i = 0; i <= 80; i++) { var I = Math.pow(10, -2 + 4 * i / 80), q = P(I); rows.push([I, q.rev, q.tdi, q.ind, q.all]); } return IX.csv(rows); } });
      function draw(){
        var I = Math.pow(10, S.i); qs('.iv', c1).textContent = fx(I); qs('.fv', c2).textContent = S.fm.toFixed(2); qs('.kv', c3).textContent = fx(Math.pow(10, S.k)); qs('.kiv', c4).textContent = fx(Math.pow(10, S.ki)); qs('.kIv', c5).textContent = fx(Math.pow(10, S.kI)); qs('.kdv', c6).textContent = S.kd.toFixed(3); qs('.emv', c7).textContent = S.em.toFixed(1); qs('.ecv', c8).textContent = fx(Math.pow(10, S.ec));
        M = ll(cvs, { xr: [0.01, 100], yr: [0.1, 100], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100], xl: '[I] (uM)', yl: 'AUC ratio', series: [{ fn: function(v){ return P(v).rev; }, color: C.mid, w: 2, label: 'Reversible' }, { fn: function(v){ return P(v).tdi; }, color: C.warn, w: 2, label: 'Time-dependent' }, { fn: function(v){ return P(v).ind; }, color: C.tint, w: 2, label: 'Induction' }, { fn: function(v){ return P(v).all; }, color: C.red, w: 3, label: 'Combined' }], pinned: pins.map(function(o){ return { fn: function(v){ return P(v, o).all; }, color: GREY, w: 1.8, dash: [5, 4] }; }) });
        IX.hline(M, M.sy(1), C.char, [4, 4]); lab(M, 'no interaction', M.box.r - 4, M.sy(1) - 5, C.char, 'right');
        var q = P(I), xs = cl(I, 0.0101, 99.9); IX.vline(M, M.sx(xs), C.char, [3, 4]); IX.dot(M, M.sx(xs), M.sy(cl(q.all, 0.1005, 99.5)), 7, C.red); lab(M, 'drag', M.sx(xs) + 10, M.sy(cl(q.all, 0.1005, 99.5)) + 16, C.red);
        if (hv !== null) { var h = P(hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(cl(h.all, 0.11, 99)), ['[I] = ' + fx(hv) + ' uM', 'reversible ' + h.rev.toFixed(2), 'time-dependent ' + h.tdi.toFixed(2), 'induction ' + h.ind.toFixed(2), 'combined ' + h.all.toFixed(2)]); }
        qs('.sd', side).innerHTML = fTile('Combined AUC ratio', q.all.toFixed(2), '1 / [fm A B C + 1 - fm]') + fRows([['A, reversible', q.A.toFixed(3)], ['B, time-dependent', q.B.toFixed(3)], ['C, induction', q.C.toFixed(3)], ['Reversible only', q.rev.toFixed(2)], ['Time-dependent only', q.tdi.toFixed(2)], ['Induction only', q.ind.toFixed(2)]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">A = 1/(1 + [I]/Ki); B = kdeg/(kdeg + kinact [I]/(KI + [I])); C = 1 + Emax [I]/(EC50 + [I]). Gut-wall terms are omitted.</div>';
        api.stat('Combined AUC ratio ' + q.all.toFixed(2) + ' at [I] ' + fx(I) + ' uM');
      }
      [['i', c1, 'i'], ['f', c2, 'fm'], ['k', c3, 'k'], ['ki', c4, 'ki'], ['kI', c5, 'kI'], ['kd', c6, 'kd'], ['em', c7, 'em'], ['ec', c8, 'ec']].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[2]] = +this.value; IX.save('dd6', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = near(p.x, M.sx(Math.pow(10, S.i)), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ return near(p.x, M.sx(Math.pow(10, S.i)), 9) ? { k: 'i' } : null; },
        drag: function(d, p){ S.i = cl(Math.round(Math.log10(cl(M.ix(p.x), 0.01, 100)) * 20) / 20, -2, 2); sync(); draw(); },
        up: function(){ IX.save('dd6', S); }
      });
      sync();
      return { render: draw };
    } });
})();
