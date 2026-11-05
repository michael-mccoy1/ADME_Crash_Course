"use strict";
/* Tab 03, the six steps with direct manipulation: draggable half-life, clearance slopes, dose and volume points,
   dosing interval, linked record-consistency histograms, hover readouts, pinned scenarios, export. */
(function(){
  var GREY = '#A1B1C4', D100 = 100;
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function nm(d){ return d.name || d.id; }
  function byName(a, b){ return a.n < b.n ? -1 : (a.n > b.n ? 1 : 0); }
  function sel(id, cls, list, cur){ return id + ' <select class="' + cls + '">' + list.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }

  /* ===== step 1: first-order elimination ===== */
  ELIM.add({ short: 'First-order elimination', level: 'foundations', ord: 10, title: 'First-order elimination',
    build: function(api){
      var A0 = 100, S = IX.state('el1', { th: 6, ax: 'lin' }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('h', 'Half-life', 1, 48, 1, S.th, 'h')), c2 = api.addControl(sel('Axis', 'ax', [['lin', 'Amount'], ['log', 'log10 amount']], S.ax));
      function yv(a){ return S.ax === 'log' ? Math.log10(Math.max(a, 1e-9)) : a; }
      IX.tools(api, { pin: function(){ pins.push({ th: S.th }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'first-order-elimination',
        csv: function(){ var k = 0.693 / S.th, T = 5.5 * S.th, rows = [['t (h)', 'Amount (mg)', 'Rate (mg/h)']], i; for (i = 0; i <= 110; i++) { var t = T * i / 110, a = A0 * Math.exp(-k * t); rows.push([t, a, k * a]); } return IX.csv(rows); } });
      function draw(){
        qs('.hv', c1).textContent = S.th; var th = S.th, k = 0.693 / th, T = lock ? lock.T : 5.5 * th, lg = S.ax === 'log';
        M = IX.chart(cvs, { xr: [0, T], yr: lg ? [Math.log10(A0) - 1.8, Math.log10(A0) + 0.05] : [0, 105], xl: 'Time (h)', yl: lg ? 'log10 of the amount (mg)' : 'Amount in the body (mg)', series: [{ fn: function(t){ return yv(A0 * Math.exp(-k * t)); }, color: C.red, w: 2.6 }], pinned: pins.map(function(p){ var kp = 0.693 / p.th; return { fn: function(t){ return yv(A0 * Math.exp(-kp * t)); }, color: GREY, w: 1.8, dash: [5, 4] }; }) });
        fMarks(M, M.x, [1, 2, 3, 4, 5].map(function(n){ return n * th; }).filter(function(t){ return t <= T; }), ['50', '25', '12.5', '6.3', '3.1'], C.char);
        IX.dot(M, M.sx(th), M.sy(yv(A0 / 2)), 6, C.red); lab(M, 'half-life (drag)', M.sx(th) + 9, M.sy(yv(A0 / 2)) - 8);
        if (hv !== null) { var a = A0 * Math.exp(-k * hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(yv(a)), 4.5, C.char); IX.tip(M, M.sx(hv), M.sy(yv(a)), ['t = ' + hv.toFixed(1) + ' h (' + (hv / th).toFixed(2) + ' half-lives)', 'A = ' + a.toFixed(1) + ' mg', 'rate = ' + (k * a).toFixed(2) + ' mg/h']); }
        var rows = [0, 1, 2, 3, 4, 5].map(function(n){ return '<tr><td>' + n + '</td><td>' + (n * th) + ' h</td><td>' + (A0 / Math.pow(2, n)).toFixed(1) + ' mg</td><td>' + (k * A0 / Math.pow(2, n)).toFixed(2) + '</td></tr>'; }).join('');
        qs('.sd', side).innerHTML = fTile('Rate constant k', k.toFixed(3) + ' per h', '0.693 / half-life') + fRows([['Removed per hour', (100 * (1 - Math.exp(-k))).toFixed(1) + ' percent of what is present'], ['Rate at time 0', (k * A0).toFixed(2) + ' mg/h']]) + '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px"><tr style="text-align:left;color:' + C.mid + '"><th>Half-lives</th><th>Time</th><th>Amount</th><th>Rate, mg/h</th></tr>' + rows + '</table>';
        api.stat('k = ' + k.toFixed(3) + ' per h');
      }
      qs('.h', c1).addEventListener('input', function(){ S.th = +this.value; IX.save('el1', S); draw(); });
      qs('.ax', c2).addEventListener('change', function(){ S.ax = this.value; IX.save('el1', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0, M.ix(M.box.r)) : null; cvs.style.cursor = Math.hypot(p.x - M.sx(S.th), p.y - M.sy(yv(A0 / 2))) < 12 ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ if (Math.hypot(p.x - M.sx(S.th), p.y - M.sy(yv(A0 / 2))) < 13) { lock = { T: 5.5 * S.th }; return { k: 'th' }; } return null; },
        drag: function(d, p){ S.th = cl(Math.round(M.ix(p.x)), 1, 48); qs('.h', c1).value = S.th; draw(); },
        up: function(){ lock = null; IX.save('el1', S); draw(); }
      });
      return { render: draw };
    } });

  /* ===== step 2: clearance ===== */
  ELIM.add({ short: 'Clearance', level: 'foundations', ord: 20, title: 'Clearance',
    build: function(api){
      var S = IX.state('el2', { c: 2, a: 10, b: 25, v: 50 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('c', 'Concentration', 0.2, 10, 0.2, S.c, 'mg/L')), c2 = api.addControl(IX.slider('a', 'CL, drug A', 2, 50, 1, S.a, 'L/h')), c3 = api.addControl(IX.slider('b', 'CL, drug B', 2, 50, 1, S.b, 'L/h')), c4 = api.addControl(IX.slider('v', 'V', 10, 300, 5, S.v, 'L'));
      function sync(){ qs('.c', c1).value = S.c; qs('.a', c2).value = S.a; qs('.b', c3).value = S.b; qs('.v', c4).value = S.v; }
      IX.tools(api, { pin: function(){ pins.push({ a: S.a, b: S.b }); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'clearance',
        csv: function(){ var rows = [['C (mg/L)', 'Rate, drug A (mg/h)', 'Rate, drug B (mg/h)']], i; for (i = 0; i <= 50; i++) rows.push([i / 5, S.a * i / 5, S.b * i / 5]); return IX.csv(rows); } });
      function draw(){
        qs('.cv', c1).textContent = S.c.toFixed(1); qs('.av', c2).textContent = S.a; qs('.bv', c3).textContent = S.b; qs('.vv', c4).textContent = S.v;
        var ym = lock ? lock.ym : Math.max(S.a, S.b) * 10 * 1.05;
        var pinned = []; pins.forEach(function(p){ pinned.push({ fn: function(c){ return p.a * c; }, color: GREY, w: 1.6, dash: [5, 4] }, { fn: function(c){ return p.b * c; }, color: GREY, w: 1.6, dash: [2, 4] }); });
        M = IX.chart(cvs, { xr: [0, 10], yr: [0, ym], xl: 'Plasma concentration (mg/L)', yl: 'Elimination rate (mg/h)', series: [{ fn: function(c){ return S.a * c; }, color: C.red, w: 2.6, label: 'Drug A' }, { fn: function(c){ return S.b * c; }, color: C.mid, w: 2.6, label: 'Drug B' }], pinned: pinned });
        IX.vline(M, M.sx(S.c), C.char, [3, 4]); IX.dot(M, M.sx(S.c), M.sy(S.a * S.c), 6, C.red); IX.dot(M, M.sx(S.c), M.sy(S.b * S.c), 6, C.mid);
        lab(M, 'A: ' + (S.a * S.c).toFixed(1) + ' mg/h (drag)', M.sx(S.c) + 10, M.sy(S.a * S.c) - 6, C.red); lab(M, 'B: ' + (S.b * S.c).toFixed(1) + ' mg/h (drag)', M.sx(S.c) + 10, M.sy(S.b * S.c) - 6, C.mid);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(Math.max(S.a, S.b) * hv), ['C = ' + hv.toFixed(2) + ' mg/L', 'rate A = ' + (S.a * hv).toFixed(1) + ' mg/h', 'rate B = ' + (S.b * hv).toFixed(1) + ' mg/h']); }
        function blk(n, CL){ var k = CL / S.v, A = S.v * S.c; return '<div class="ol" style="margin-top:8px">Drug ' + n + '</div>' + fRows([['Amount in the body, A = V x C', A.toFixed(0) + ' mg'], ['Rate = CL x C', (CL * S.c).toFixed(1) + ' mg/h'], ['Check: k x A', (k * A).toFixed(1) + ' mg/h'], ['k = CL / V', k.toFixed(3) + ' per h'], ['Half-life', (0.693 / k).toFixed(1) + ' h']]); }
        qs('.sd', side).innerHTML = blk('A', S.a) + blk('B', S.b) + '<div class="hint" style="font-size:11.5px;margin-top:8px">The slope of each line is the clearance. Drag a point vertically to change it.</div>';
        api.stat('Rates ' + (S.a * S.c).toFixed(1) + ' and ' + (S.b * S.c).toFixed(1) + ' mg/h');
      }
      [['c', c1, 'c'], ['a', c2, 'a'], ['b', c3, 'b'], ['v', c4, 'v']].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[2]] = +this.value; IX.save('el2', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0, 10) : null; var onp = Math.hypot(p.x - M.sx(S.c), p.y - M.sy(S.a * S.c)) < 12 || Math.hypot(p.x - M.sx(S.c), p.y - M.sy(S.b * S.c)) < 12; cvs.style.cursor = onp ? 'ns-resize' : (near(p.x, M.sx(S.c), 8) ? 'ew-resize' : 'crosshair'); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var ym = M.iy(M.box.t); if (Math.hypot(p.x - M.sx(S.c), p.y - M.sy(S.a * S.c)) < 13) { lock = { ym: ym }; return { k: 'a' }; } if (Math.hypot(p.x - M.sx(S.c), p.y - M.sy(S.b * S.c)) < 13) { lock = { ym: ym }; return { k: 'b' }; } if (near(p.x, M.sx(S.c), 9)) return { k: 'c' }; return null; },
        drag: function(d, q){ if (d.k === 'c') S.c = cl(Math.round(M.ix(q.x) / 0.2) * 0.2, 0.2, 10); else S[d.k] = cl(Math.round(M.iy(q.y) / S.c), 2, 50); sync(); draw(); },
        up: function(){ lock = null; IX.save('el2', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: intravenous profile ===== */
  ELIM.add({ short: 'Intravenous profile', level: 'foundations', ord: 30, title: 'Concentration after an intravenous dose',
    build: function(api){
      var S = IX.state('el3', { d: 100, v: 50, c: 10, ax: 'lin' }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('d', 'Dose', 10, 500, 10, S.d, 'mg')), c2 = api.addControl(IX.slider('v', 'V', 5, 300, 5, S.v, 'L')), c3 = api.addControl(IX.slider('c', 'CL', 1, 50, 1, S.c, 'L/h')), c4 = api.addControl(sel('Axis', 'ax', [['lin', 'Concentration'], ['log', 'log10 concentration']], S.ax));
      function sync(){ qs('.d', c1).value = S.d; qs('.v', c2).value = S.v; qs('.c', c3).value = S.c; }
      function yv(c){ return S.ax === 'log' ? Math.log10(Math.max(c, 1e-9)) : c; }
      function inv(y){ return S.ax === 'log' ? Math.pow(10, y) : y; }
      IX.tools(api, { pin: function(){ pins.push({ d: S.d, v: S.v, c: S.c }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'intravenous-profile',
        csv: function(){ var k = S.c / S.v, T = Math.max(4 * 0.693 / k, 4), rows = [['t (h)', 'C (mg/L)', 'AUC(0 to t) (mg x h/L)']], i; for (i = 0; i <= 100; i++) { var t = T * i / 100; rows.push([t, S.d / S.v * Math.exp(-k * t), S.d / S.c * (1 - Math.exp(-k * t))]); } return IX.csv(rows); } });
      function draw(){
        qs('.dv', c1).textContent = S.d; qs('.vv', c2).textContent = S.v; qs('.cv', c3).textContent = S.c;
        var k = S.c / S.v, th = 0.693 / k, c0 = S.d / S.v, T = lock ? lock.T : Math.max(4 * th, 4), lg = S.ax === 'log', yr = lock ? lock.yr : (lg ? [Math.log10(c0) - 1.6, Math.log10(c0) + 0.1] : [0, c0 * 1.1]);
        M = IX.chart(cvs, { xr: [0, T], yr: yr, xl: 'Time (h)', yl: lg ? 'log10 of concentration (mg/L)' : 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return yv(c0 * Math.exp(-k * t)); }, color: C.red, w: 2.6 }], pinned: pins.map(function(p){ var kp = p.c / p.v, cp = p.d / p.v; return { fn: function(t){ return yv(cp * Math.exp(-kp * t)); }, color: GREY, w: 1.8, dash: [5, 4] }; }) });
        var x = M.x;
        if (hv !== null && !lg) { x.fillStyle = 'rgba(15,110,140,.16)'; x.beginPath(); x.moveTo(M.sx(0), M.box.b); var i; for (i = 0; i <= 80; i++) { var tt = hv * i / 80; x.lineTo(M.sx(tt), M.sy(c0 * Math.exp(-k * tt))); } x.lineTo(M.sx(hv), M.box.b); x.closePath(); x.fill(); }
        fMarks(M, x, [th, 2 * th, 3 * th].filter(function(t){ return t <= T; }), ['50%', '25%', '12.5%'], C.char);
        IX.dot(M, M.sx(0), M.sy(yv(c0)), 6, C.red); lab(M, 'dose (drag)', M.sx(0) + 10, M.sy(yv(c0)) - 6);
        if (th <= T) { IX.dot(M, M.sx(th), M.sy(yv(c0 / 2)), 6, C.char); lab(M, 'half-life (drag)', M.sx(th) + 9, M.sy(yv(c0 / 2)) - 8); }
        if (hv !== null) { var ch = c0 * Math.exp(-k * hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(yv(ch)), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(yv(ch)), ['t = ' + hv.toFixed(1) + ' h', 'C = ' + ch.toFixed(2) + ' mg/L', 'AUC(0 to t) = ' + (S.d / S.c * (1 - Math.exp(-k * hv))).toFixed(1), 'eliminated ' + (100 * (1 - Math.exp(-k * hv))).toFixed(0) + '%']); }
        qs('.sd', side).innerHTML = fTile('Half-life', th.toFixed(1) + ' h', '0.693 x V / CL') + fRows([['C0 = dose / V', c0.toFixed(2) + ' mg/L'], ['k = CL / V', k.toFixed(3) + ' per h'], ['AUC = dose / CL', (S.d / S.c).toFixed(1) + ' mg x h/L'], ['Concentration at 24 h', (c0 * Math.exp(-k * 24)).toFixed(3) + ' mg/L']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Drag the dose point vertically and the half-life point horizontally. Hover shades the AUC to that time.</div>';
        api.stat('Half-life ' + th.toFixed(1) + ' h, AUC ' + (S.d / S.c).toFixed(1) + ' mg x h/L');
      }
      [['d', c1], ['v', c2], ['c', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('el3', S); draw(); }); });
      qs('.ax', c4).addEventListener('change', function(){ S.ax = this.value; IX.save('el3', S); draw(); });
      function handles(){ var k = S.c / S.v, th = 0.693 / k, c0 = S.d / S.v; return { dose: [M.sx(0), M.sy(yv(c0))], half: [M.sx(th), M.sy(yv(c0 / 2))] }; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0, M.ix(M.box.r)) : null; var h = handles(); cvs.style.cursor = Math.hypot(p.x - h.dose[0], p.y - h.dose[1]) < 12 ? 'ns-resize' : (Math.hypot(p.x - h.half[0], p.y - h.half[1]) < 12 ? 'ew-resize' : 'crosshair'); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var h = handles(), fr = { T: M.ix(M.box.r), yr: [M.iy(M.box.b), M.iy(M.box.t)] }; if (Math.hypot(p.x - h.dose[0], p.y - h.dose[1]) < 13) { lock = fr; return { k: 'dose' }; } if (Math.hypot(p.x - h.half[0], p.y - h.half[1]) < 13) { lock = fr; return { k: 'half' }; } return null; },
        drag: function(d, p){ if (d.k === 'dose') S.d = cl(Math.round(inv(M.iy(p.y)) * S.v / 10) * 10, 10, 500); else S.c = cl(Math.round(0.693 * S.v / Math.max(M.ix(p.x), 0.1)), 1, 50); sync(); draw(); },
        up: function(){ lock = null; IX.save('el3', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 4: volume and half-life ===== */
  ELIM.add({ short: 'Volume and half-life', level: 'foundations', ord: 40, title: 'Volume of distribution and half-life',
    build: function(api){
      var S = IX.state('el4', { c: 10, a: 40, b: 160, ax: 'lin' }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('c', 'CL', 1, 50, 1, S.c, 'L/h')), c2 = api.addControl(IX.slider('a', 'V, drug A', 5, 300, 5, S.a, 'L')), c3 = api.addControl(IX.slider('b', 'V, drug B', 5, 300, 5, S.b, 'L')), c4 = api.addControl(sel('Axis', 'ax', [['lin', 'Concentration'], ['log', 'log10 concentration']], S.ax));
      function sync(){ qs('.c', c1).value = S.c; qs('.a', c2).value = S.a; qs('.b', c3).value = S.b; }
      function yv(c){ return S.ax === 'log' ? Math.log10(Math.max(c, 1e-9)) : c; }
      function inv(y){ return S.ax === 'log' ? Math.pow(10, y) : y; }
      function cA(t){ return D100 / S.a * Math.exp(-S.c / S.a * t); } function cB(t){ return D100 / S.b * Math.exp(-S.c / S.b * t); }
      IX.tools(api, { pin: function(){ pins.push({ c: S.c, a: S.a, b: S.b }); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'volume-and-half-life',
        csv: function(){ var T = Math.max(4 * 0.693 * Math.max(S.a, S.b) / S.c, 6), rows = [['t (h)', 'C, drug A (mg/L)', 'C, drug B (mg/L)']], i; for (i = 0; i <= 100; i++) rows.push([T * i / 100, cA(T * i / 100), cB(T * i / 100)]); return IX.csv(rows); } });
      function draw(){
        qs('.cv', c1).textContent = S.c; qs('.av', c2).textContent = S.a; qs('.bv', c3).textContent = S.b;
        var t1 = 0.693 * S.a / S.c, t2 = 0.693 * S.b / S.c, lg = S.ax === 'log', T = lock ? lock.T : Math.max(4 * Math.max(t1, t2), 6), lo = D100 / Math.max(S.a, S.b), hi = D100 / Math.min(S.a, S.b), yr = lock ? lock.yr : (lg ? [Math.log10(lo) - 1.5, Math.log10(hi) + 0.1] : [0, hi * 1.1]);
        var pinned = []; pins.forEach(function(p){ pinned.push({ fn: function(t){ return yv(D100 / p.a * Math.exp(-p.c / p.a * t)); }, color: GREY, w: 1.6, dash: [5, 4] }, { fn: function(t){ return yv(D100 / p.b * Math.exp(-p.c / p.b * t)); }, color: GREY, w: 1.6, dash: [2, 4] }); });
        M = IX.chart(cvs, { xr: [0, T], yr: yr, xl: 'Time (h)', yl: lg ? 'log10 of concentration (mg/L)' : 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return yv(cA(t)); }, color: C.red, w: 2.6, label: 'Drug A' }, { fn: function(t){ return yv(cB(t)); }, color: C.mid, w: 2.6, label: 'Drug B' }], pinned: pinned });
        IX.dot(M, M.sx(0), M.sy(yv(D100 / S.a)), 6, C.red); IX.dot(M, M.sx(0), M.sy(yv(D100 / S.b)), 6, C.mid);
        lab(M, 'A, V = ' + S.a + ' L (drag)', M.sx(0) + 10, M.sy(yv(D100 / S.a)) - 6, C.red); lab(M, 'B, V = ' + S.b + ' L (drag)', M.sx(0) + 10, M.sy(yv(D100 / S.b)) - 6, C.mid);
        if (t1 <= T) IX.dot(M, M.sx(t1), M.sy(yv(D100 / S.a / 2)), 4.5, C.red); if (t2 <= T) IX.dot(M, M.sx(t2), M.sy(yv(D100 / S.b / 2)), 4.5, C.mid);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(yv(cA(hv))), ['t = ' + hv.toFixed(1) + ' h', 'A: ' + cA(hv).toFixed(2) + ' mg/L', 'B: ' + cB(hv).toFixed(2) + ' mg/L']); }
        qs('.sd', side).innerHTML = fTile('Half-life, drug A', t1.toFixed(1) + ' h', 'V = ' + S.a + ' L') + fTile('Half-life, drug B', t2.toFixed(1) + ' h', 'V = ' + S.b + ' L') + fRows([['Starting concentration, A', (D100 / S.a).toFixed(2) + ' mg/L'], ['Starting concentration, B', (D100 / S.b).toFixed(2) + ' mg/L'], ['AUC, both', (D100 / S.c).toFixed(1) + ' mg x h/L'], ['Half-life ratio B / A', (t2 / t1).toFixed(2)]]);
        api.stat('Half-lives ' + t1.toFixed(1) + ' h and ' + t2.toFixed(1) + ' h');
      }
      [['c', c1], ['a', c2], ['b', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('el4', S); draw(); }); });
      qs('.ax', c4).addEventListener('change', function(){ S.ax = this.value; IX.save('el4', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0, M.ix(M.box.r)) : null; var ons = Math.hypot(p.x - M.sx(0), p.y - M.sy(yv(D100 / S.a))) < 12 || Math.hypot(p.x - M.sx(0), p.y - M.sy(yv(D100 / S.b))) < 12; cvs.style.cursor = ons ? 'ns-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var fr = { T: M.ix(M.box.r), yr: [M.iy(M.box.b), M.iy(M.box.t)] }; if (Math.hypot(p.x - M.sx(0), p.y - M.sy(yv(D100 / S.a))) < 13) { lock = fr; return { k: 'a' }; } if (Math.hypot(p.x - M.sx(0), p.y - M.sy(yv(D100 / S.b))) < 13) { lock = fr; return { k: 'b' }; } return null; },
        drag: function(d, p){ S[d.k] = cl(Math.round(D100 / Math.max(inv(M.iy(p.y)), 0.05) / 5) * 5, 5, 300); sync(); draw(); },
        up: function(){ lock = null; IX.save('el4', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 5: repeat dosing ===== */
  ELIM.add({ short: 'Repeat dosing', level: 'foundations', ord: 50, title: 'Accumulation on repeat dosing',
    build: function(api){
      var S = IX.state('el5', { t: 12, c: 10, v: 50 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('t', 'Interval', 2, 48, 1, S.t, 'h')), c2 = api.addControl(IX.slider('c', 'CL', 1, 50, 1, S.c, 'L/h')), c3 = api.addControl(IX.slider('v', 'V', 10, 300, 5, S.v, 'L'));
      function sync(){ qs('.t', c1).value = S.t; qs('.c', c2).value = S.c; qs('.v', c3).value = S.v; }
      function conc(P, t){ var k = P.c / P.v, n, c = 0; for (n = 0; n * P.t <= t + 1e-9; n++) c += D100 / P.v * Math.exp(-k * (t - n * P.t)); return c; }
      function peakOf(P, T){ var t, m = 0; for (t = 0; t <= T; t += T / 300) m = Math.max(m, conc(P, t)); return m; }
      IX.tools(api, { pin: function(){ pins.push({ t: S.t, c: S.c, v: S.v }); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'repeat-dosing',
        csv: function(){ var k = S.c / S.v, th = 0.693 / k, T = Math.min(Math.max(8 * th, 5 * S.t), 400), rows = [['t (h)', 'C (mg/L)']], i; for (i = 0; i <= 400; i++) rows.push([T * i / 400, conc(S, T * i / 400)]); return IX.csv(rows); } });
      function draw(){
        qs('.tv', c1).textContent = S.t; qs('.cv', c2).textContent = S.c; qs('.vv', c3).textContent = S.v;
        var k = S.c / S.v, th = 0.693 / k, T = lock ? lock.T : Math.min(Math.max(8 * th, 5 * S.t), 400), css = D100 / (S.c * S.t), R = 1 / (1 - Math.exp(-k * S.t)), cmaxss = D100 / S.v * R, cmin = cmaxss * Math.exp(-k * S.t), pk = lock ? lock.pk : Math.max(peakOf(S, T), pins.reduce(function(m, p){ return Math.max(m, peakOf(p, T)); }, 0));
        M = IX.chart(cvs, { xr: [0, T], yr: [0, pk * 1.1], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return conc(S, t); }, color: C.red, w: 2.4 }], pinned: pins.map(function(p){ return { fn: function(t){ return conc(p, t); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var x = M.x; IX.hline(M, M.sy(css)); lab(M, 'Css,avg = ' + css.toFixed(2) + ' mg/L', M.box.r - 6, M.sy(css) - 5, C.char, 'right');
        x.fillStyle = C.char; var n; for (n = 0; n * S.t <= T; n++) { x.beginPath(); x.moveTo(M.sx(n * S.t) - 4, M.box.b); x.lineTo(M.sx(n * S.t) + 4, M.box.b); x.lineTo(M.sx(n * S.t), M.box.b - 8); x.fill(); }
        IX.vline(M, M.sx(S.t), C.warn, [4, 4]); IX.dot(M, M.sx(S.t), M.box.b - 12, 6, C.warn); lab(M, 'interval (drag)', M.sx(S.t) + 9, M.box.b - 18, C.warn);
        if (hv !== null) { var ch = conc(S, hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(ch), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(ch), ['t = ' + hv.toFixed(1) + ' h', 'C = ' + ch.toFixed(2) + ' mg/L', 'doses given: ' + (Math.floor(hv / S.t + 1e-9) + 1)]); }
        qs('.sd', side).innerHTML = fTile('Accumulation ratio R', R.toFixed(2), '1 / (1 - exp(-k x interval))') + fRows([['Half-life', th.toFixed(1) + ' h'], ['Interval / half-life', (S.t / th).toFixed(2)], ['Css,avg = dose / (CL x interval)', css.toFixed(2) + ' mg/L'], ['Peak at steady state', cmaxss.toFixed(2) + ' mg/L'], ['Trough at steady state', cmin.toFixed(2) + ' mg/L'], ['Time to 90 percent of steady state', (3.32 * th).toFixed(0) + ' h']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Drag the interval marker. Pin keeps a regimen for comparison.</div>';
        api.stat('R = ' + R.toFixed(2) + ', Css,avg = ' + css.toFixed(2) + ' mg/L');
      }
      [['t', c1], ['c', c2], ['v', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('el5', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0, M.ix(M.box.r)) : null; cvs.style.cursor = near(p.x, M.sx(S.t), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ if (near(p.x, M.sx(S.t), 10) && p.y >= M.box.t && p.y <= M.box.b) { lock = { T: M.ix(M.box.r), pk: M.iy(M.box.t) / 1.1 }; return { k: 't' }; } return null; },
        drag: function(d, p){ S.t = cl(Math.round(M.ix(p.x)), 2, 48); sync(); draw(); },
        up: function(){ lock = null; IX.save('el5', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 6: consistency of pharmacokinetic records ===== */
  ELIM.add({ short: 'Checking a record', level: 'foundations', ord: 60, title: 'Consistency of pharmacokinetic records',
    build: function(api){
      var S = IX.state('el6', { d: 'Verapamil' }), pins = [], M = [null, null], hv = [-1, -1], sb = [-1, -1];
      var all = OBACH08.filter(function(d){ return d.cl > 0 && d.vss > 0 && d.mrt > 0 && d.t12 > 0; }).map(function(d){ return { n: nm(d), d: d, r1: (d.vss / d.cl * 1000 / 60) / d.mrt, r2: 0.693 * d.mrt / d.t12 }; });
      var list = all.slice().sort(byName);
      function find(n){ return all.filter(function(z){ return z.n === n; })[0] || null; }
      if (!find(S.d)) S.d = 'Verapamil';
      var pn = api.el('pn', 'left:28px;top:16px;width:300px;height:508px;overflow:auto', '<div class="sd"></div>');
      var pn2 = api.el('pn', 'left:344px;top:16px;width:588px;height:508px;padding:8px', '<canvas class="a" width="572" height="224" style="width:572px;height:224px"></canvas><canvas class="b" width="572" height="224" style="width:572px;height:224px"></canvas><div class="lst" style="font-size:12px;padding:4px 6px;line-height:1.8;max-height:50px;overflow:auto"></div>');
      var cvs = [qs('.a', pn2), qs('.b', pn2)];
      var c1 = api.addControl('Drug <select class="dg">' + list.map(function(z){ return '<option' + (z.n === S.d ? ' selected' : '') + '>' + z.n + '</option>'; }).join('') + '</select>');
      var CFG = [{ key: 'r1', lo: Math.log10(0.8), hi: Math.log10(1.25), title: 'Calculated MRT over reported MRT', ticks: [0.8, 1, 1.25] }, { key: 'r2', lo: Math.log10(0.25), hi: Math.log10(2), title: '0.693 x reported MRT over reported half-life', ticks: [0.25, 0.5, 1, 2] }], NB = 28, bins = [[], []];
      CFG.forEach(function(c, j){ var i; for (i = 0; i < NB; i++) bins[j].push([]); all.forEach(function(z){ var k = Math.floor((Math.log10(z[c.key]) - c.lo) / (c.hi - c.lo) * NB); if (k >= 0 && k < NB) bins[j][k].push(z); }); });
      IX.tools(api, { pin: function(){ pins = [S.d]; draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return cvs; }, name: 'pk-record-consistency', csv: function(){ var rows = [['Drug', 'Calculated MRT / reported MRT', '0.693 x MRT / half-life']]; all.forEach(function(z){ rows.push([z.n, z.r1, z.r2]); }); return IX.csv(rows); } });
      function box(j){ return { l: 40, r: cvs[j]._w - 12, t: 26, b: cvs[j]._h - 40 }; }
      function bx(j, v){ var c = CFG[j], b = box(j); return b.l + (Math.log10(v) - c.lo) / (c.hi - c.lo) * (b.r - b.l); }
      function drawHist(j){
        var c = CFG[j], g = cv(cvs[j]), x = g.x, b = box(j), bw = (b.r - b.l) / NB, ym = Math.max.apply(null, bins[j].map(function(a){ return a.length; })) * 1.1, d = find(S.d), pd = pins.length ? find(pins[0]) : null; M[j] = { x: x, box: b };
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(c.title, b.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        bins[j].forEach(function(a, k){ var hg = a.length / ym * (b.b - b.t); x.fillStyle = k === sb[j] ? C.char : C.red; x.globalAlpha = k === hv[j] ? 1 : 0.78; x.fillRect(b.l + k * bw + 1, b.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; c.ticks.forEach(function(v){ var xp = bx(j, v); x.beginPath(); x.moveTo(xp, b.b); x.lineTo(xp, b.b + 4); x.stroke(); x.fillText(String(v), xp, b.b + 16); });
        x.fillStyle = C.char; x.fillText('Ratio, logarithmic axis (drag the line to select the nearest drug)', (b.l + b.r) / 2, g.h - 6);
        if (pd) { x.strokeStyle = GREY; x.lineWidth = 2; x.beginPath(); x.moveTo(bx(j, cl(pd[c.key], Math.pow(10, c.lo), Math.pow(10, c.hi))), b.t); x.lineTo(bx(j, cl(pd[c.key], Math.pow(10, c.lo), Math.pow(10, c.hi))), b.b); x.stroke(); }
        var xm = bx(j, cl(d[c.key], Math.pow(10, c.lo), Math.pow(10, c.hi))); x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.moveTo(xm, b.t); x.lineTo(xm, b.b); x.stroke(); x.fillStyle = C.char; x.beginPath(); x.moveTo(xm - 6, b.t - 2); x.lineTo(xm + 6, b.t - 2); x.lineTo(xm, b.t + 8); x.fill();
        if (hv[j] >= 0) { var lo = Math.pow(10, c.lo + hv[j] * (c.hi - c.lo) / NB), hi = Math.pow(10, c.lo + (hv[j] + 1) * (c.hi - c.lo) / NB); IX.tip(M[j], b.l + (hv[j] + 0.5) * bw, b.b - bins[j][hv[j]].length / ym * (b.b - b.t), [+lo.toPrecision(3) + ' to ' + +hi.toPrecision(3), bins[j][hv[j]].length + ' drugs', 'click to list']); }
      }
      function draw(){
        var d = find(S.d), dd = d.d, mrtc = dd.vss / dd.cl * 1000 / 60;
        qs('.sd', pn).innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:6px">' + d.n + '</div><div class="ol">Reported</div>' + fRows([['CL', fx(dd.cl) + ' mL/min/kg'], ['Vss', fx(dd.vss) + ' L/kg'], ['MRT', fx(dd.mrt) + ' h'], ['Half-life', fx(dd.t12) + ' h'], ['CL for a 70 kg adult', fx(dd.cl * 70 * 60 / 1000) + ' L/h'], ['Vss for a 70 kg adult', fx(dd.vss * 70) + ' L']]) + '<div class="ol" style="margin-top:12px">Calculated</div>' + fRows([['MRT = Vss / CL x 1000 / 60', fx(mrtc) + ' h'], ['Calculated over reported MRT', d.r1.toFixed(3)], ['0.693 x reported MRT', fx(0.693 * dd.mrt) + ' h'], ['That value over the half-life', d.r2.toFixed(2)]]);
        drawHist(0); drawHist(1);
        var j = sb[0] >= 0 ? 0 : (sb[1] >= 0 ? 1 : -1), ls = j >= 0 ? bins[j][sb[j]].slice().sort(byName) : [];
        qs('.lst', pn2).innerHTML = j < 0 ? '<span style="color:' + C.mid + '">Click a bar to list its drugs.</span>' : '<b>' + ls.length + ' drugs:</b> ' + ls.slice(0, 10).map(function(z){ return '<a href="#" data-n="' + z.n + '" style="margin-right:8px;color:' + C.red + '">' + z.n + '</a>'; }).join(' ') + (ls.length > 10 ? ' and ' + (ls.length - 10) + ' more' : '');
        qsa('[data-n]', pn2).forEach(function(a){ a.addEventListener('click', function(ev){ ev.preventDefault(); S.d = a.dataset.n; qs('.dg', c1).value = S.d; IX.save('el6', S); draw(); }); });
        api.stat(S.d);
      }
      function binAt(j, p){ var b = box(j); if (p.x < b.l || p.x > b.r || p.y < b.t || p.y > b.b) return -1; return cl(Math.floor((p.x - b.l) / ((b.r - b.l) / NB)), 0, NB - 1); }
      function nearest(j, p){ var c = CFG[j], b = box(j), lv = c.lo + (p.x - b.l) / (b.r - b.l) * (c.hi - c.lo), best = null, bd = 1e9; all.forEach(function(z){ var dd = Math.abs(Math.log10(z[c.key]) - lv); if (dd < bd) { bd = dd; best = z; } }); return best; }
      qs('.dg', c1).addEventListener('change', function(){ S.d = this.value; IX.save('el6', S); draw(); });
      [0, 1].forEach(function(j){
        IX.attach(cvs[j], {
          move: function(p){ if (!M[j]) return; hv[j] = binAt(j, p); var d = find(S.d); cvs[j].style.cursor = near(p.x, bx(j, cl(d[CFG[j].key], Math.pow(10, CFG[j].lo), Math.pow(10, CFG[j].hi))), 8) ? 'ew-resize' : (hv[j] >= 0 ? 'pointer' : 'default'); draw(); },
          leave: function(){ hv[j] = -1; draw(); },
          down: function(p){ var d = find(S.d); return (M[j] && near(p.x, bx(j, cl(d[CFG[j].key], Math.pow(10, CFG[j].lo), Math.pow(10, CFG[j].hi))), 9)) ? { k: 'r' } : null; },
          drag: function(d, p){ S.d = nearest(j, p).n; qs('.dg', c1).value = S.d; draw(); },
          up: function(){ IX.save('el6', S); },
          click: function(p){ var k = binAt(j, p); sb[1 - j] = -1; sb[j] = k === sb[j] ? -1 : k; draw(); }
        });
      });
      qs('.dg', c1).value = S.d;
      return { render: draw };
    } });
})();
