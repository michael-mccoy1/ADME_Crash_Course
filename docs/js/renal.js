"use strict";
/* Tab 12: renal and biliary excretion. Filtration and net renal clearance, renal impairment and the AUC ratio, the filtration limit
   for 554 drugs (Obach et al. 2008) and the biliary share of clearance for 16 substrates (Miyake et al. 2023, Table 1, joined to total clearance). */
var RN = new Lesson('rn', 'Renal and biliary excretion');
RN.noOpts = true;

(function(){
  var GREY = '#A1B1C4', ECC = { '1A': '#0F6E8C', '1B': '#0A4A5E', '2': '#4C93AC', '3A': '#B4561B', '3B': '#8A3F10', '4': '#C98A5B' };
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  var DRUGS = OBACH08.filter(function(d){ return d.fu && d.cl > 0; });
  var BIL = TPBIL.map(function(r){ var d = OBACH08.filter(function(z){ return z.name && z.name.toLowerCase() === r.n.toLowerCase(); })[0]; return d ? { n: r.n, k: r.k, b: r.b, cl: d.cl, s: r.b / d.cl } : null; }).filter(function(r){ return r; });

  /* ===== step 1: filtration and net renal clearance ===== */
  RN.add({ short: 'Filtration and net renal clearance', level: 'foundations', ord: 10, title: 'Filtration and net renal clearance',
    build: function(api){
      var S = IX.state('rn1', { f: -0.3, g: 1.8, s: 1, r: 0.3 }), hv = -1, M = null, lock = null, G = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('f', 'fu', -2, 0, 0.05, S.f)), c2 = api.addControl(IX.slider('g', 'GFR', 0.5, 2.5, 0.05, S.g, 'mL/min/kg')), c3 = api.addControl(IX.slider('s', 'CLsec', 0, 5, 0.05, S.s, 'mL/min/kg')), c4 = api.addControl(IX.slider('r', 'Reabsorbed', 0, 1, 0.01, S.r, 'fraction'));
      function sync(){ qs('.f', c1).value = S.f; qs('.g', c2).value = S.g; qs('.s', c3).value = S.s; qs('.r', c4).value = S.r; }
      function calc(){ var fu = Math.pow(10, S.f), fl = fu * S.g, ex = fl + S.s, clr = ex * (1 - S.r); return { fu: fu, fl: fl, ex: ex, clr: clr }; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'net-renal-clearance', csv: function(){ var q = calc(); return IX.csv([['Quantity', 'Value (mL/min/kg)'], ['Filtered, fu x GFR', q.fl], ['Secreted', S.s], ['Filtered plus secreted', q.ex], ['Reabsorbed fraction', S.r], ['Renal clearance', q.clr], [], ['fu', q.fu], ['GFR', S.g]]); } });
      function draw(){
        var q = calc(); qs('.fv', c1).textContent = fx(q.fu); qs('.gv', c2).textContent = S.g.toFixed(2); qs('.sv', c3).textContent = S.s.toFixed(2); qs('.rv', c4).textContent = S.r.toFixed(2);
        var g = cv(cvs), x = g.x, box = { l: 62, r: g.w - 20, t: 30, b: g.h - 70 }, ym = lock ? lock.ym : Math.max(q.ex, 0.5) * 1.2, bw = (box.r - box.l) / 4; G = { box: box, ym: ym, bw: bw }; M = { x: x, box: box };
        function sy(v){ return box.b - v / ym * (box.b - box.t); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; var yt = niceTicks(0, ym, 5); yt.v.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 6, sy(v) + 4); });
        x.save(); x.translate(14, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Clearance (mL/min/kg)', 0, 0); x.restore();
        var bars = [['Filtered', 0, q.fl, C.mid], ['Secreted', q.fl, q.ex, C.warn], ['Reabsorbed', q.ex * (1 - S.r), q.ex, GREY], ['Renal clearance', 0, q.clr, C.red]];
        bars.forEach(function(b, i){ var bx = box.l + i * bw + bw * 0.16, w = bw * 0.68, y0 = sy(b[1]), y1 = sy(b[2]); x.fillStyle = b[3]; x.globalAlpha = hv === i ? 1 : 0.9; x.fillRect(bx, Math.min(y0, y1), w, Math.abs(y1 - y0)); x.globalAlpha = 1; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(b[0], bx + w / 2, box.b + 18); x.fillText(fx(Math.abs(b[2] - b[1])), bx + w / 2, Math.min(y0, y1) - 6); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(box.l, box.b); x.lineTo(box.r, box.b); x.stroke();
        function hx(i){ return box.l + i * bw + bw * 0.5; }
        IX.dot(M, hx(0), sy(q.fl), 7, C.mid); IX.dot(M, hx(1), sy(q.ex), 7, C.warn); IX.dot(M, hx(2), sy(q.clr), 7, GREY); IX.dot(M, hx(3), sy(q.clr), 7, C.red);
        lab(M, 'drag the tops to set fu, CLsec and the reabsorbed fraction', box.l, 16, C.mid);
        if (hv >= 0) IX.tip(M, hx(hv), sy([q.fl, q.ex, q.clr, q.clr][hv]), [['Filtered: fu x GFR', 'Secreted: CLsec', 'Reabsorbed: ' + (100 * S.r).toFixed(0) + '% of filtered plus secreted', 'Renal clearance'][hv], ['fu ' + fx(q.fu) + ' x GFR ' + S.g.toFixed(2) + ' = ' + fx(q.fl), 'adds ' + fx(S.s), 'removes ' + fx(q.ex * S.r), '= ' + fx(q.clr) + ' mL/min/kg'][hv]]);
        var ratio = q.clr / q.fl, net = ratio > 1.0001 ? 'net secretion' : (ratio < 0.9999 ? 'net reabsorption' : 'filtration only');
        qs('.sd', side).innerHTML = fTile('Renal clearance', fx(q.clr) + ' mL/min/kg', '(fu x GFR + CLsec) x (1 - reabsorbed)') + fRows([['Filtration alone, fu x GFR', fx(q.fl)], ['CLr over filtration', ratio.toFixed(2)], ['Net transport', net], ['CLr over GFR', (q.clr / S.g).toFixed(2)], ['For a 70 kg adult', fx(q.clr * 70) + ' mL/min']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">A CLr over filtration above 1 means net secretion, below 1 net reabsorption.</div>';
        api.stat('CLr ' + fx(q.clr) + ' mL/min/kg, ' + net);
      }
      [['f', c1], ['g', c2], ['s', c3], ['r', c4]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('rn1', S); draw(); }); });
      function sy1(v){ return G.box.b - v / G.ym * (G.box.b - G.box.t); }
      function hpos(i){ var q = calc(); return [G.box.l + i * G.bw + G.bw * 0.5, sy1([q.fl, q.ex, q.clr, q.clr][i])]; }
      function hit(p){ var i, b = -1, bd = 14; for (i = 0; i < 4; i++) { var h = hpos(i), d = Math.hypot(p.x - h[0], p.y - h[1]); if (d < bd) { bd = d; b = i; } } return b; }
      IX.attach(cvs, {
        move: function(p){ if (!G) return; var i = hit(p); hv = i >= 0 ? i : (p.x >= G.box.l && p.x <= G.box.r && p.y >= G.box.t && p.y <= G.box.b ? Math.floor((p.x - G.box.l) / G.bw) : -1); cvs.style.cursor = (i === 0 || i === 1 || i === 2 || i === 3) ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var i = hit(p); if (i < 0) return null; lock = { ym: G.ym }; return { k: i }; },
        drag: function(d, p){ var v = cl((G.box.b - p.y) / (G.box.b - G.box.t) * G.ym, 0, G.ym), q = calc(); if (d.k === 0) S.f = cl(Math.round(Math.log10(Math.max(v / S.g, 0.01)) * 20) / 20, -2, 0); else if (d.k === 1) S.s = cl(Math.round(Math.max(v - q.fl, 0) * 20) / 20, 0, 5); else S.r = cl(Math.round((1 - v / Math.max(q.ex, 1e-6)) * 100) / 100, 0, 1); sync(); draw(); },
        up: function(){ lock = null; IX.save('rn1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: renal impairment and the AUC ratio ===== */
  RN.add({ short: 'Renal impairment and AUC ratio', level: 'foundations', ord: 20, title: 'Renal impairment and the AUC ratio',
    build: function(api){
      var S = IX.state('rn2', { fe: 0.6, kf: 0.4 }), pins = [], hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('fe', 'fe', 0, 0.99, 0.01, S.fe)), c2 = api.addControl(IX.slider('kf', 'Renal function', 0.05, 1, 0.01, S.kf, 'fraction of normal'));
      function sync(){ qs('.fe', c1).value = S.fe; qs('.kf', c2).value = S.kf; }
      function auc(fe, kf){ return 1 / (1 - fe + fe * kf); }
      IX.tools(api, { pin: function(){ pins.push({ fe: S.fe, kf: S.kf }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'renal-impairment-auc-ratio',
        csv: function(){ var rows = [['Renal function (fraction of normal)', 'AUC ratio, fe 0.2', 'fe 0.5', 'fe 0.8', 'fe 0.95', 'fe set']], i; for (i = 0; i <= 95; i++) { var k = 0.05 + 0.95 * i / 95; rows.push([k, auc(0.2, k), auc(0.5, k), auc(0.8, k), auc(0.95, k), auc(S.fe, k)]); } return IX.csv(rows); } });
      function draw(){
        qs('.fev', c1).textContent = S.fe.toFixed(2); qs('.kfv', c2).textContent = S.kf.toFixed(2);
        var ser = [0.2, 0.5, 0.8, 0.95].map(function(f){ return { fn: function(k){ return auc(f, k); }, color: GREY, w: 1.4 }; }); ser.push({ fn: function(k){ return auc(S.fe, k); }, color: C.red, w: 3 });
        M = IX.chart(cvs, { xr: [0, 1], yr: [1, 12], xl: 'Renal function relative to normal (GFR / normal GFR)', yl: 'AUC ratio, impaired over normal', series: ser, pinned: pins.map(function(p){ return { fn: function(k){ return auc(p.fe, k); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var xg = M.x; [[0.125, 0.245, 'severe'], [0.25, 0.49, 'moderate'], [0.5, 0.74, 'mild']].forEach(function(b){ xg.fillStyle = 'rgba(15,110,140,.06)'; xg.fillRect(M.sx(b[0]), M.box.t, M.sx(b[1]) - M.sx(b[0]), M.box.b - M.box.t); lab(M, b[2], (M.sx(b[0]) + M.sx(b[1])) / 2, M.box.b - 6, C.mid, 'center'); });
        [0.2, 0.5, 0.8, 0.95].forEach(function(f){ lab(M, 'fe ' + f, M.sx(0.06) + 2, M.sy(auc(f, 0.06)) - 5, C.mid); });
        pins.forEach(function(p){ IX.dot(M, M.sx(p.kf), M.sy(auc(p.fe, p.kf)), 4, GREY); });
        var A = auc(S.fe, S.kf); IX.vline(M, M.sx(S.kf), C.char, [3, 4]); IX.dot(M, M.sx(S.kf), M.sy(A), 7, C.red); lab(M, 'drag', M.sx(S.kf) + 11, M.sy(A) + 15, C.red);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(auc(S.fe, hv)), ['renal function ' + hv.toFixed(2), 'AUC ratio ' + auc(S.fe, hv).toFixed(2), 'fe 0.2: ' + auc(0.2, hv).toFixed(2), 'fe 0.8: ' + auc(0.8, hv).toFixed(2)]); }
        qs('.sd', side).innerHTML = fTile('AUC ratio', A.toFixed(2), '1 / (1 - fe + fe x KF)') + fRows([['fe', S.fe.toFixed(2)], ['Renal function, KF', S.kf.toFixed(2)], ['Dose adjustment factor Q = 1 - fe (1 - KF)', (1 / A).toFixed(2)], ['Ceiling at KF -> 0, 1 / (1 - fe)', fx(1 / (1 - S.fe))]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Assumes the nonrenal clearance is unchanged. Bands mark mild, moderate and severe impairment as GFR of 60 to 89, 30 to 59 and 15 to 29 mL/min divided by 120.</div>';
        api.stat('AUC ratio ' + A.toFixed(2) + ' at fe ' + S.fe.toFixed(2) + ' and renal function ' + S.kf.toFixed(2));
      }
      qs('.fe', c1).addEventListener('input', function(){ S.fe = +this.value; IX.save('rn2', S); draw(); }); qs('.kf', c2).addEventListener('input', function(){ S.kf = +this.value; IX.save('rn2', S); draw(); });
      function dp(){ return [M.sx(S.kf), M.sy(auc(S.fe, S.kf))]; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0.05, 1) : null; var d = dp(); cvs.style.cursor = Math.hypot(p.x - d[0], p.y - d[1]) < 12 ? 'move' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var d = dp(); return Math.hypot(p.x - d[0], p.y - d[1]) < 14 ? { k: 'pt' } : null; },
        drag: function(d, p){ var k = cl(Math.round(M.ix(p.x) * 100) / 100, 0.05, 0.98), a = cl(M.iy(p.y), 1.01, 11.9); S.kf = k; S.fe = cl(Math.round((1 - 1 / a) / (1 - k) * 100) / 100, 0, 0.99); sync(); draw(); },
        up: function(){ IX.save('rn2', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: filtration limit across drugs ===== */
  RN.add({ short: 'Filtration limit across drugs', level: 'applied', ord: 30, title: 'Filtration limit across 554 drugs',
    build: function(api){
      var S = IX.state('rn3', { g: 1.8 }), selr = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
      var c1 = api.addControl(IX.slider('g', 'GFR', 0.2, 2.5, 0.05, S.g, 'mL/min/kg'));
      function draw(){
        qs('.gv', c1).textContent = S.g.toFixed(2);
        var M = LL(cvs, { xr: [0.01, 100], yr: [0.001, 10], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [0.001, 0.01, 0.1, 1, 10], xl: 'Total clearance (mL/min/kg)', yl: 'Filtration clearance, fu x GFR (mL/min/kg)' }), x = M.x;
        x.strokeStyle = C.char; x.lineWidth = 1.4; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(M.sx(0.01), M.sy(0.01)); x.lineTo(M.sx(10), M.sy(10)); x.stroke(); x.setLineDash([]); lab(M, 'filtration = total clearance', M.sx(6), M.sy(6) - 8, C.char, 'right');
        var pts = [], below = 0; DRUGS.forEach(function(d){ var f = d.fu * S.g, px = M.sx(d.cl), py = M.sy(Math.max(f, 0.00101)), lim = d.cl < f; if (lim) below++; var on = selr === d; x.fillStyle = lim ? C.warn : C.red; x.globalAlpha = on ? 1 : 0.55; x.beginPath(); x.arc(px, py, on ? 7 : 3.2, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } pts.push({ x: px, y: py, r: d, vx: d.cl, vy: f }); });
        cvs._pts = pts; cvs._g = M.g;
        var ratios = DRUGS.map(function(d){ return d.cl / (d.fu * S.g); }).sort(function(a, b){ return a - b; });
        qs('.tl', side).innerHTML = fTile('Total clearance below filtration', below + ' of ' + DRUGS.length, Math.round(100 * below / DRUGS.length) + ' percent of drugs at GFR ' + S.g.toFixed(2)) + fRows([['Median CL over fu x GFR', fx(ratios[Math.floor(ratios.length / 2)])], ['Orange points', 'CL below fu x GFR'], ['Teal points', 'CL above fu x GFR']]) + '<div class="hint" style="font-size:11.5px;margin-top:6px">Assumes the reported CL is a plasma clearance.</div>';
        qs('.det', side).innerHTML = selr ? '<div style="font-weight:700;font-size:14px;margin:8px 0 4px">' + (selr.name || selr.id) + '</div>' + fRows([['CL', fx(selr.cl) + ' mL/min/kg'], ['fu', selr.fu], ['fu x GFR', fx(selr.fu * S.g)], ['CL over fu x GFR', fx(selr.cl / (selr.fu * S.g))]]) : '<div class="hint" style="font-size:12px;margin-top:8px">Select a point.</div>';
        api.stat(below + ' of ' + DRUGS.length + ' drugs have a total clearance below fu x GFR');
      }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'filtration-limit', csv: function(){ var rows = [['Drug', 'Total clearance (mL/min/kg)', 'fu', 'fu x GFR (mL/min/kg)', 'CL over fu x GFR']]; DRUGS.forEach(function(d){ rows.push([d.name || d.id, d.cl, d.fu, d.fu * S.g, d.cl / (d.fu * S.g)]); }); return IX.csv(rows); } });
      qs('.g', c1).addEventListener('input', function(){ S.g = +this.value; IX.save('rn3', S); draw(); });
      cvs.addEventListener('click', function(ev){ var rc = cvs.getBoundingClientRect(), g = cvs._g, mx = (ev.clientX - rc.left) * g.w / rc.width, my = (ev.clientY - rc.top) * g.h / rc.height, b = null, bd = 10; (cvs._pts || []).forEach(function(q){ var d = Math.hypot(q.x - mx, q.y - my); if (d < bd) { bd = d; b = q.r; } }); selr = b; draw(); });
      return { render: draw };
    } });

  /* ===== step 4: biliary share of clearance ===== */
  RN.add({ short: 'Biliary share of clearance', level: 'applied', ord: 40, title: 'Biliary share of total clearance',
    build: function(api){
      var sel = -1, hv = -1, M = null, ROWS = BIL.slice().sort(function(a, b){ return b.s - a.s; }), G = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'biliary-share', csv: function(){ var rows = [['Compound', 'ECCS class', 'Human CLbile (mL/min/kg)', 'Total clearance (mL/min/kg)', 'CLbile / CL']]; ROWS.forEach(function(r){ rows.push([r.n, r.k, r.b, r.cl, r.s]); }); return IX.csv(rows); } });
      function draw(){
        var g = cv(cvs), x = g.x, box = { l: 150, r: g.w - 60, t: 26, b: g.h - 40 }, bh = (box.b - box.t) / ROWS.length; G = { box: box, bh: bh }; M = { x: x, box: box };
        function sx(v){ return box.l + v * (box.r - box.l); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(v.toFixed(2), sx(v), box.b + 16); });
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Human CLbile / total clearance', (box.l + box.r) / 2, g.h - 6); x.textAlign = 'left'; x.fillText('Share of total clearance excreted in bile, 16 substrates', box.l, 14);
        ROWS.forEach(function(r, i){ var y = box.t + i * bh + 3, on = i === sel || i === hv; x.fillStyle = ECC[r.k]; x.globalAlpha = on ? 1 : 0.85; x.fillRect(box.l, y, Math.max(sx(Math.min(r.s, 1)) - box.l, 1.5), bh - 6); x.globalAlpha = 1; x.fillStyle = C.char; x.textAlign = 'right'; x.font = (on ? '700 ' : '500 ') + '12px Aptos, "Segoe UI", sans-serif'; x.fillText(r.n + ' (' + r.k + ')', box.l - 8, y + (bh - 6) / 2 + 4); x.textAlign = 'left'; x.fillText(fx(r.s), sx(Math.min(r.s, 1)) + 6, y + (bh - 6) / 2 + 4); });
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(box.l, box.t); x.lineTo(box.l, box.b); x.stroke();
        if (hv >= 0) { var r = ROWS[hv]; IX.tip(M, sx(Math.min(r.s, 1)), box.t + hv * bh + bh / 2, [r.n + ', ECCS class ' + r.k, 'CLbile ' + fx(r.b) + ' mL/min/kg', 'total CL ' + fx(r.cl) + ' mL/min/kg', 'bile ' + (100 * r.s).toFixed(1) + '% of total']); }
        var over = ROWS.filter(function(r){ return r.s >= 0.2; }).length, c3 = ROWS.filter(function(r){ return r.k === '3B'; }), mm = c3.map(function(r){ return r.s; }).sort(function(a, b){ return a - b; });
        qs('.sd', side).innerHTML = fTile('Bile at least 20 percent of CL', over + ' of ' + ROWS.length, 'compounds with a total CL in Obach et al. (2008)') + fRows([['Class 3B compounds', c3.length], ['Class 3B median share', fx(mm.length ? (mm.length % 2 ? mm[(mm.length - 1) / 2] : (mm[mm.length / 2 - 1] + mm[mm.length / 2]) / 2) : NaN)], ['Highest share', ROWS[0].n + ', ' + fx(ROWS[0].s)], ['Lowest share', ROWS[ROWS.length - 1].n + ', ' + fx(ROWS[ROWS.length - 1].s)]]) + (sel >= 0 ? '<div style="font-weight:700;font-size:14px;margin:8px 0 4px">' + ROWS[sel].n + '</div>' + fRows([['ECCS class', ROWS[sel].k], ['CLbile', fx(ROWS[sel].b)], ['Total CL', fx(ROWS[sel].cl)], ['Bile share', fx(ROWS[sel].s)]]) : '<div class="hint" style="font-size:11.5px;margin-top:8px">Click a bar. The two quantities come from different studies, so the shares are indicative.</div>');
        api.stat(over + ' of ' + ROWS.length + ' compounds excrete at least 20 percent of clearance in bile');
      }
      function row(p){ if (!G || p.x < 0 || p.y < G.box.t || p.y > G.box.b) return -1; return Math.floor((p.y - G.box.t) / G.bh); }
      IX.attach(cvs, {
        move: function(p){ hv = row(p); cvs.style.cursor = hv >= 0 ? 'pointer' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        click: function(p){ var i = row(p); sel = i >= 0 && i !== sel ? i : -1; draw(); }
      });
      return { render: draw };
    } });
})();
