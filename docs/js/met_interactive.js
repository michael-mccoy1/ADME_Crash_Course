"use strict";
/* Tab 05, the five steps with direct manipulation: route fractions against in vitro coverage, draggable
   Michaelis-Menten parameters, a depletion fit set by dragging the data, extraction against measured drugs, and total clearance. */
(function(){
  var GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function box4(el, f){ return f; }

  /* ===== step 1: routes of metabolism and in vitro coverage ===== */
  var SYS = [['mic', 'Microsomes, NADPH'], ['micu', 'Microsomes, UDPGA'], ['hep', 'Hepatocytes'], ['s9', 'S9'], ['cyt', 'Cytosol'], ['pla', 'Plasma']];
  var ROUTES = [
    { k: 'ox', name: 'Oxidation', col: '#0F6E8C', sys: ['mic', 'hep', 's9'], enz: 'Cytochrome P450 (endoplasmic reticulum); flavin-containing monooxygenases.', what: 'Oxygen insertion or dealkylation.', use: 'Liver microsomes with NADPH; hepatocytes.', cov: 'Covered by the tab 07 prediction.' },
    { k: 'conj', name: 'Conjugation', col: '#B4561B', sys: ['micu', 'hep', 's9'], enz: 'UDP-glucuronosyltransferases; sulfotransferases.', what: 'Attachment of glucuronic acid or sulfate.', use: 'Microsomes with UDP-glucuronic acid (glucuronidation); hepatocytes.', cov: 'Not measured by an NADPH-only microsomal incubation.' },
    { k: 'hyd', name: 'Hydrolysis', col: '#6F8196', sys: ['hep', 'pla', 's9'], enz: 'Esterases and amidases (plasma, liver).', what: 'Cleavage of ester and amide bonds.', use: 'Hepatocytes; plasma; liver S9.', cov: 'Not predicted here.' },
    { k: 'oth', name: 'Other routes', col: '#34373F', sys: ['cyt', 'hep', 's9'], enz: 'Aldehyde oxidase (cytosol); monoamine oxidase (mitochondria).', what: 'Oxidation of aldehydes and N-heterocycles; oxidative deamination.', use: 'Cytosol or S9; hepatocytes.', cov: 'Not measured by microsomes (the enzyme is not in the microsomal fraction).' }];
  MET.add({ short: 'Metabolic routes', level: 'foundations', ord: 10, title: 'Routes of metabolism',
    build: function(api){
      var S = IX.state('mt1', { f: [0.6, 0.2, 0.1, 0.1], s: ['mic', 'hep'], r: 'ox' }), hv = -1, M = null, BH = 120;
      var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:10px 14px;overflow:auto', '<canvas width="874" height="' + BH + '" style="width:874px;height:' + BH + 'px"></canvas><div class="rd" style="font-size:13px;margin:6px 0 8px"></div><div style="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px"><div class="mx"></div><div class="dt"></div></div>'), cvs = qs('canvas', pn);
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'metabolic-routes', csv: function(){ var rows = [['Route', 'Fraction of clearance', 'Covered by the selected systems']]; ROUTES.forEach(function(r, i){ rows.push([r.name, S.f[i], covered(r) ? 'yes' : 'no']); }); rows.push([], ['Selected systems', S.s.join(' ')]); return IX.csv(rows); } });
      function covered(r){ return r.sys.some(function(k){ return S.s.indexOf(k) >= 0; }); }
      function cum(){ var c = [0], i; for (i = 0; i < 4; i++) c.push(c[i] + S.f[i]); return c; }
      function draw(){
        var g = cv(cvs), x = g.x, L = 8, R = g.w - 8, Y = 28, H = 60, c = cum(), cap = 0; M = { x: x, box: { l: L, r: R, t: Y, b: Y + H } };
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Share of the clearance of one compound by route (drag the dividers)', L, 16);
        ROUTES.forEach(function(r, i){ var a = L + c[i] * (R - L), b = L + c[i + 1] * (R - L), on = covered(r); if (on) cap += S.f[i]; x.fillStyle = r.col; x.globalAlpha = on ? 1 : 0.28; x.fillRect(a, Y, b - a, H); x.globalAlpha = 1; if (!on) { x.strokeStyle = 'rgba(52,55,63,.35)'; x.lineWidth = 1; for (var s = a; s < b; s += 8) { x.beginPath(); x.moveTo(s, Y + H); x.lineTo(Math.min(s + H, b), Y + H - Math.min(H, b - s)); x.stroke(); } }
          if (i === hv || r.k === S.r) { x.strokeStyle = C.char; x.lineWidth = 2.4; x.strokeRect(a + 1, Y + 1, b - a - 2, H - 2); }
          if (b - a > 70) { x.fillStyle = on ? '#fff' : C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(r.name + ' ' + Math.round(S.f[i] * 100) + '%', (a + b) / 2, Y + H / 2 + 4); } });
        [1, 2, 3].forEach(function(i){ IX.dot(M, L + c[i] * (R - L), Y + H + 12, 6, C.char); });
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Hatched: route not measured by the systems selected below', L, Y + H + 40);
        if (hv >= 0) IX.tip(M, L + (c[hv] + c[hv + 1]) / 2 * (R - L), Y + 6, [ROUTES[hv].name, Math.round(S.f[hv] * 100) + '% of clearance', covered(ROUTES[hv]) ? 'measured' : 'not measured']);
        var missed = ROUTES.filter(function(r, i){ return !covered(r) && S.f[i] > 0.005; }).map(function(r){ return r.name.toLowerCase(); });
        qs('.rd', pn).innerHTML = 'The systems selected measure <b>' + Math.round(cap * 100) + '%</b> of the clearance' + (missed.length ? '; the remaining <b>' + Math.round((1 - cap) * 100) + '%</b> (' + missed.join(', ') + ') is not captured, so the in vitro CLint underestimates it.' : '. No route is missed.');
        qs('.mx', pn).innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr><th style="text-align:left;padding:4px">Route</th>' + SYS.map(function(s){ var on = S.s.indexOf(s[0]) >= 0; return '<th data-sys="' + s[0] + '" style="cursor:pointer;padding:4px;border:1px solid ' + C.silver + ';background:' + (on ? C.light : '#fff') + ';font-weight:' + (on ? 700 : 500) + '">' + s[1] + '</th>'; }).join('') + '</tr>' + ROUTES.map(function(r){ return '<tr data-r="' + r.k + '" style="cursor:pointer;background:' + (r.k === S.r ? C.light : '#fff') + '"><td style="padding:5px 6px;font-weight:700;border:1px solid ' + C.silver + '">' + r.name + '</td>' + SYS.map(function(s){ var has = r.sys.indexOf(s[0]) >= 0, on = S.s.indexOf(s[0]) >= 0; return '<td style="text-align:center;border:1px solid ' + C.silver + ';color:' + (has ? (on ? C.red : C.mid) : C.silver) + ';font-weight:700">' + (has ? (on ? 'measured' : 'covers') : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table><div class="hint" style="font-size:11.5px;margin-top:6px">Click a column to run that system; click a row for its details.</div>';
        var cur = ROUTES.filter(function(r){ return r.k === S.r; })[0];
        qs('.dt', pn).innerHTML = [['What the reaction does', cur.what], ['Enzymes', cur.enz], ['In vitro system that covers it', cur.use], ['Covered by the prediction in tab 07?', cur.cov]].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:6px 10px;background:#fff;margin-bottom:5px"><div class="ol" style="margin-bottom:1px">' + t[0] + '</div><div style="font-size:12.5px;line-height:1.4">' + t[1] + '</div></div>'; }).join('');
        qsa('[data-sys]', pn).forEach(function(th){ th.addEventListener('click', function(){ var k = th.dataset.sys, i = S.s.indexOf(k); if (i >= 0) S.s.splice(i, 1); else S.s.push(k); IX.save('mt1', S); draw(); }); });
        qsa('tr[data-r]', pn).forEach(function(tr){ tr.addEventListener('click', function(){ S.r = tr.dataset.r; IX.save('mt1', S); draw(); }); });
        api.stat('Measured ' + Math.round(cap * 100) + '% of clearance');
      }
      function seg(p){ var c = cum(), v = (p.x - M.box.l) / (M.box.r - M.box.l), i; if (p.y < M.box.t || p.y > M.box.b) return -1; for (i = 0; i < 4; i++) if (v >= c[i] && v <= c[i + 1]) return i; return -1; }
      function div(p){ var c = cum(), i; for (i = 1; i <= 3; i++) if (Math.hypot(p.x - (M.box.l + c[i] * (M.box.r - M.box.l)), p.y - (M.box.b + 12)) < 13 || (p.y >= M.box.t && p.y <= M.box.b && near(p.x, M.box.l + c[i] * (M.box.r - M.box.l), 5))) return i; return 0; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = seg(p); cvs.style.cursor = div(p) ? 'ew-resize' : 'pointer'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var i = div(p); return i ? { k: i } : null; },
        drag: function(d, p){ var c = cum(), v = cl(Math.round((p.x - M.box.l) / (M.box.r - M.box.l) * 100) / 100, c[d.k - 1], c[d.k + 1]), a = S.f.slice(); a[d.k - 1] = Math.round((v - c[d.k - 1]) * 100) / 100; a[d.k] = Math.round((c[d.k + 1] - v) * 100) / 100; S.f = a; draw(); },
        up: function(){ IX.save('mt1', S); },
        click: function(p){ var i = seg(p); if (i >= 0) { S.r = ROUTES[i].k; IX.save('mt1', S); draw(); } }
      });
      return { render: draw };
    } });

  /* ===== step 2: enzyme kinetics ===== */
  MET.add({ short: 'Enzyme kinetics', level: 'foundations', ord: 20, title: 'Enzyme kinetics and intrinsic clearance',
    build: function(api){
      var S = IX.state('mt2', { v: 200, k: 1, s: 0 }), pins = [], hv = null, MA = null, MB = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="436" style="width:436px;height:436px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="436" style="width:420px;height:436px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(IX.slider('v', 'Vmax', 20, 1000, 10, S.v, 'pmol/min/mg')), c2 = api.addControl(IX.slider('k', 'Km', -1, 2, 0.05, S.k, 'uM (log)')), c3 = api.addControl(IX.slider('s', 'Substrate', -2, 2, 0.05, S.s, 'uM (log)'));
      function sync(){ qs('.v', c1).value = S.v; qs('.k', c2).value = S.k; qs('.s', c3).value = S.s; }
      IX.tools(api, { pin: function(){ pins.push({ v: S.v, k: S.k }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [ca, cb]; }, name: 'enzyme-kinetics',
        csv: function(){ var Km = Math.pow(10, S.k), rows = [['Vmax (pmol/min/mg)', S.v], ['Km (uM)', Km], ['CLint = Vmax / Km (uL/min/mg)', S.v / Km], [], ['S (uM)', 'Rate (pmol/min/mg)', 'Clearance, rate / S (uL/min/mg)']], i; for (i = 1; i <= 100; i++) { var s = 5 * Km * i / 100; rows.push([s, S.v * s / (Km + s), S.v / (Km + s)]); } return IX.csv(rows); } });
      function draw(){
        var Km = Math.pow(10, S.k), Sv = Math.pow(10, S.s), cl0 = S.v / Km, xm = lock ? lock.xm : 5 * Km; qs('.vv', c1).textContent = S.v; qs('.kv', c2).textContent = fx(Km); qs('.sv', c3).textContent = fx(Sv);
        function rate(s){ return S.v * s / (Km + s); }
        MA = IX.chart(ca, { xr: [0, xm], yr: [0, lock ? lock.ym : S.v * 1.15], xl: 'Substrate concentration (uM)', yl: 'Rate (pmol/min/mg)', series: [{ fn: function(s){ return Math.min(cl0 * s, S.v * 1.15); }, color: C.tint, w: 2, dash: [5, 4], label: 'Low-concentration slope' }, { fn: rate, color: C.red, w: 2.6, label: 'Michaelis-Menten' }], pinned: pins.map(function(p){ var pk = Math.pow(10, p.k); return { fn: function(s){ return p.v * s / (pk + s); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var xa = MA.x; IX.hline(MA, MA.sy(S.v), C.warn, [5, 4]); lab(MA, 'Vmax (drag)', MA.box.l + 8, MA.sy(S.v) - 6, C.warn);
        IX.dot(MA, MA.sx(Math.min(Km, xm)), MA.sy(S.v / 2), 6, C.char); lab(MA, 'Km (drag)', MA.sx(Math.min(Km, xm)) + 9, MA.sy(S.v / 2) + 16);
        var sp = cl(Sv, 0, xm); IX.vline(MA, MA.sx(sp), C.mid, [3, 4]); IX.dot(MA, MA.sx(sp), MA.sy(rate(sp)), 5.5, C.red);
        var hs = hv !== null ? cl(hv, 0, xm) : null; if (hs !== null) { IX.vline(MA, MA.sx(hs), C.mid, [2, 3]); IX.tip(MA, MA.sx(hs), MA.sy(rate(hs)), ['S = ' + fx(hs) + ' uM', 'rate ' + fx(rate(hs)) + ' pmol/min/mg', fx(100 * rate(hs) / S.v) + '% of Vmax']); }
        var v = rate(Sv); qs('.ra', pn).innerHTML = 'At S = ' + fx(Sv) + ' uM the rate is <b>' + fx(v) + ' pmol/min/mg</b>, ' + (100 * v / S.v).toFixed(0) + ' percent of Vmax. The first-order approximation gives ' + fx(cl0 * Sv) + ', which is ' + (100 * Sv / Km).toFixed(0) + ' percent too high.';
        MB = IX.chart(cb, { xr: [0, xm], yr: [0, lock ? lock.yc : cl0 * 1.1], xl: 'Substrate concentration (uM)', yl: 'Clearance, rate / S (uL/min/mg)', series: [{ fn: function(s){ return S.v / (Km + Math.max(s, 0)); }, color: C.mid, w: 2.6 }], pinned: pins.map(function(p){ var pk = Math.pow(10, p.k); return { fn: function(s){ return p.v / (pk + s); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        IX.hline(MB, MB.sy(cl0), C.warn, [5, 4]); lab(MB, 'CLint = Vmax / Km', MB.box.r - 6, MB.sy(cl0) - 6, C.warn, 'right');
        IX.vline(MB, MB.sx(sp), C.mid, [3, 4]); IX.dot(MB, MB.sx(sp), MB.sy(S.v / (Km + sp)), 5.5, C.mid);
        if (hs !== null) { IX.vline(MB, MB.sx(hs), C.mid, [2, 3]); IX.tip(MB, MB.sx(hs), MB.sy(S.v / (Km + hs)), ['S = ' + fx(hs) + ' uM', 'clearance ' + fx(S.v / (Km + hs)), fx(100 * Km / (Km + hs)) + '% of CLint']); }
        qs('.rb', pn2).innerHTML = 'Intrinsic clearance Vmax / Km = <b>' + fx(cl0) + ' uL/min/mg</b>. At the substrate concentration set, the clearance is <b>' + fx(S.v / (Km + Sv)) + '</b>, ' + (100 * Km / (Km + Sv)).toFixed(0) + ' percent of that value.';
        api.stat('CLint = ' + fx(cl0) + ' uL/min/mg');
      }
      [['v', c1], ['k', c2], ['s', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('mt2', S); draw(); }); });
      function hit(M, p){ var Km = Math.pow(10, S.k), xm = M.ix(M.box.r); return { km: Math.hypot(p.x - M.sx(Math.min(Km, xm)), p.y - M.sy(S.v / 2)) < 12, vm: near(p.y, M.sy(S.v), 8), s: near(p.x, M.sx(cl(Math.pow(10, S.s), 0, xm)), 7) }; }
      IX.attach(ca, {
        move: function(p){ if (!MA) return; hv = MA.inside(p) ? MA.ix(p.x) : null; var h = hit(MA, p); ca.style.cursor = h.km ? 'ew-resize' : (h.vm ? 'ns-resize' : (h.s ? 'ew-resize' : 'crosshair')); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var h = hit(MA, p), fr = { xm: MA.ix(MA.box.r), ym: MA.iy(MA.box.t), yc: MB.iy(MB.box.t) }; if (h.km) { lock = fr; return { k: 'km' }; } if (h.vm && p.x >= MA.box.l && p.x <= MA.box.r) { lock = fr; return { k: 'vm' }; } if (h.s) return { k: 's' }; return null; },
        drag: function(d, p){ if (d.k === 'km') S.k = cl(Math.round(Math.log10(cl(MA.ix(p.x), 0.1, 100)) * 20) / 20, -1, 2); else if (d.k === 'vm') S.v = cl(Math.round(MA.iy(p.y) / 10) * 10, 20, 1000); else S.s = cl(Math.round(Math.log10(cl(MA.ix(p.x), 0.01, 100)) * 20) / 20, -2, 2); sync(); draw(); },
        up: function(){ lock = null; IX.save('mt2', S); draw(); }
      });
      IX.attach(cb, {
        move: function(p){ if (!MB) return; hv = MB.inside(p) ? MB.ix(p.x) : null; cb.style.cursor = near(p.x, MB.sx(cl(Math.pow(10, S.s), 0, MB.ix(MB.box.r))), 7) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ return near(p.x, MB.sx(cl(Math.pow(10, S.s), 0, MB.ix(MB.box.r))), 8) ? { k: 's' } : null; },
        drag: function(d, p){ S.s = cl(Math.round(Math.log10(cl(MB.ix(p.x), 0.01, 100)) * 20) / 20, -2, 2); sync(); draw(); },
        up: function(){ IX.save('mt2', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: substrate depletion assay (fit by hand) ===== */
  var TS = [0, 5, 15, 30, 45, 60], NZ = [0, 0.05, -0.07, 0.04, -0.05, 0.06];
  MET.add({ short: 'Depletion assay', level: 'foundations', ord: 30, title: 'Substrate depletion assay',
    build: function(api){
      var L100 = Math.log(100), S = IX.state('mt3', { th: 25, p: '1', ly: null }), hv = -1, MA = null, MB = null;
      function gen(th){ return TS.map(function(t, i){ return L100 - 0.693 / th * t + NZ[i]; }); }
      if (!S.ly || S.ly.length !== 6) S.ly = gen(S.th);
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="436" style="width:436px;height:436px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="436" style="width:420px;height:436px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px;min-height:40px;line-height:1.7"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(IX.slider('h', 'Half-life of the generated data', 5, 240, 5, S.th, 'min')), c2 = api.addControl('Protein <select class="p">' + hepOpts([['0.1', '0.1 mg/mL'], ['0.25', '0.25 mg/mL'], ['0.5', '0.5 mg/mL'], ['1', '1 mg/mL'], ['2', '2 mg/mL'], ['5', '5 mg/mL']], S.p) + '</select>'), c3 = api.addControl('<button type="button" class="btn sm ghost rg">Regenerate points</button>');
      function fit(){ var n = 6, st = 0, sy = 0, stt = 0, sty = 0, i; for (i = 0; i < n; i++) { st += TS[i]; sy += S.ly[i]; stt += TS[i] * TS[i]; sty += TS[i] * S.ly[i]; } var b = (n * sty - st * sy) / (n * stt - st * st), a = (sy - b * st) / n, ss = 0; for (i = 0; i < n; i++) ss += Math.pow(S.ly[i] - (a + b * TS[i]), 2); return { a: a, b: b, sd: Math.sqrt(ss / (n - 2)) }; }
      IX.tools(api, { canvases: function(){ return [ca, cb]; }, name: 'depletion-assay', csv: function(){ var f = fit(), rows = [['t (min)', 'Remaining (percent)', 'ln of percent', 'Fit, ln of percent']], i; for (i = 0; i < 6; i++) rows.push([TS[i], Math.exp(S.ly[i]), S.ly[i], f.a + f.b * TS[i]]); rows.push([], ['Fitted k (per min)', -f.b], ['Fitted half-life (min)', 0.693 / -f.b]); return IX.csv(rows); } });
      var yL = function(lv){ return Math.exp(lv); };
      function draw(){
        qs('.hv', c1).textContent = S.th; var f = fit(), k = -f.b, ok = k > 1e-4;
        MA = IX.chart(ca, { xr: [0, 60], yr: [0, 110], xl: 'Time (min)', yl: 'Compound remaining (percent)', series: [{ fn: function(t){ return Math.exp(f.a + f.b * t); }, color: C.red, w: 2.4 }] });
        MB = IX.chart(cb, { xr: [0, 60], yr: [L100 - 4.2, L100 + 0.4], xl: 'Time (min)', yl: 'ln of percent remaining', series: [{ fn: function(t){ return f.a + f.b * t; }, color: C.mid, w: 2.4 }] });
        TS.forEach(function(t, i){ var ya = Math.min(Math.exp(S.ly[i]), 108); IX.dot(MA, MA.sx(t), MA.sy(ya), i === hv ? 7 : 5, C.char); IX.dot(MB, MB.sx(t), MB.sy(cl(S.ly[i], L100 - 4.2, L100 + 0.4)), i === hv ? 7 : 5, C.char); });
        lab(MA, 'drag any point', MA.box.r - 6, MA.box.t + 14, C.mid, 'right'); lab(MB, 'drag any point', MB.box.r - 6, MB.box.t + 14, C.mid, 'right');
        if (hv >= 0) { var tp = [Math.exp(S.ly[hv]).toFixed(1) + '% remaining', 'ln = ' + S.ly[hv].toFixed(2), 'fit residual ' + (S.ly[hv] - (f.a + f.b * TS[hv])).toFixed(2)]; IX.tip(MA, MA.sx(TS[hv]), MA.sy(Math.min(Math.exp(S.ly[hv]), 108)), ['t = ' + TS[hv] + ' min'].concat(tp)); IX.vline(MB, MB.sx(TS[hv]), C.mid, [2, 3]); }
        var th = ok ? 0.693 / k : Infinity, prot = +S.p, cli = ok ? k / prot * 1000 : 0, scaled = cli * 45 * 20 / 1000;
        qs('.ra', pn).innerHTML = ok ? 'Fitted slope gives k = <b>' + k.toFixed(4) + ' per min</b>, half-life <b>' + fx(th) + ' min</b>. The residual SD of the fit is ' + f.sd.toFixed(3) + ' in ln units.' : 'The fitted slope is not negative; no depletion is measurable.';
        qs('.rb', pn2).innerHTML = ok ? 'CLint per mg = ' + k.toFixed(4) + ' / ' + prot + ' x 1000 = <b>' + fx(cli) + ' uL/min/mg</b><br>Scaled = ' + fx(cli) + ' x 45 x 20 / 1000 = <b>' + fx(scaled) + ' mL/min/kg</b>' : '';
        api.stat(ok ? 'Fitted half-life ' + fx(th) + ' min, scaled CLint ' + fx(scaled) + ' mL/min/kg' : 'No measurable depletion');
      }
      qs('.h', c1).addEventListener('input', function(){ S.th = +this.value; S.ly = gen(S.th); IX.save('mt3', S); draw(); });
      qs('.p', c2).addEventListener('change', function(){ S.p = this.value; IX.save('mt3', S); draw(); });
      qs('.rg', c3).addEventListener('click', function(){ S.ly = gen(S.th); IX.save('mt3', S); draw(); });
      function pick(M, p, yfun){ var i, b = -1, bd = 13; TS.forEach(function(t, k){ var d = Math.hypot(p.x - M.sx(t), p.y - yfun(k)); if (d < bd) { bd = d; b = k; } }); return b; }
      [[ca, function(){ return MA; }, function(k){ return MA.sy(Math.min(Math.exp(S.ly[k]), 108)); }, function(p){ return Math.log(Math.max(MA.iy(p.y), 0.5)); }], [cb, function(){ return MB; }, function(k){ return MB.sy(cl(S.ly[k], L100 - 4.2, L100 + 0.4)); }, function(p){ return cl(MB.iy(p.y), L100 - 4.2, L100 + 0.4); }]].forEach(function(r){
        IX.attach(r[0], {
          move: function(p){ if (!r[1]()) return; hv = pick(r[1](), p, r[2]); r[0].style.cursor = hv >= 0 ? 'ns-resize' : 'default'; draw(); },
          leave: function(){ hv = -1; draw(); },
          down: function(p){ var i = pick(r[1](), p, r[2]); return i >= 0 ? { i: i } : null; },
          drag: function(d, p){ S.ly[d.i] = r[3](p); draw(); },
          up: function(){ IX.save('mt3', S); }
        });
      });
      return { render: draw };
    } });

  /* ===== step 4: clearance, flow and extraction ===== */
  MET.add({ short: 'Clearance and extraction', level: 'foundations', ord: 40, title: 'Clearance, flow and extraction',
    build: function(api){
      var S = IX.state('mt4', { q: 21, e: 0.4, d: '' }), pins = [], hv = -1, MS = null, bars = null, strip = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<canvas class="st" width="312" height="190" style="width:312px;height:190px"></canvas><div class="sd"></div>'), cs = qs('.st', side);
      var c1 = api.addControl(IX.slider('q', 'Blood flow Q', 5, 40, 1, S.q, 'mL/min/kg')), c2 = api.addControl(IX.slider('e', 'Extraction E', 0, 1, 0.01, S.e)), c3 = api.addControl('From drug <select class="d"><option value="">choose</option>' + OBACH99.map(function(d){ return '<option' + (d.name === S.d ? ' selected' : '') + '>' + d.name + '</option>'; }).join('') + '</select>');
      function sync(){ qs('.q', c1).value = S.q; qs('.e', c2).value = S.e; qs('.d', c3).value = S.d; }
      IX.tools(api, { pin: function(){ pins.push({ q: S.q, e: S.e }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs, cs]; }, name: 'clearance-extraction',
        csv: function(){ var rows = [['Drug', 'Observed blood CL (mL/min/kg)', 'E = CL / Q at Q = ' + S.q]]; OBACH99.forEach(function(d){ rows.push([d.name, d.obs, Math.min(1, d.obs / S.q)]); }); return IX.csv(rows); } });
      var dots = OBACH99.map(function(d, i){ return { d: d, j: (i * 0.6180339887) % 1 }; });
      function draw(){
        qs('.qv', c1).textContent = S.q; qs('.ev', c2).textContent = S.e.toFixed(2);
        var g = cv(cvs), x = g.x, L = 70, R = g.w - 30, T0 = 40, B0 = g.h - 70, hgt = B0 - T0, CL = S.q * S.e, bw = 120, bx = [L + 80, L + 80 + 220]; bars = { L: L, R: R, T0: T0, B0: B0, hgt: hgt, bx: bx, bw: bw }; MS = { x: x, box: { l: L, r: R, t: T0, b: B0 } };
        [['Inlet, Cin', 1, C.red], ['Outlet, Cout', 1 - S.e, C.tint]].forEach(function(b, i){ x.fillStyle = b[2]; x.fillRect(bx[i], B0 - b[1] * hgt, bw, b[1] * hgt); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(b[0], bx[i] + bw / 2, B0 + 18); x.fillText(b[1].toFixed(2) + ' x Cin', bx[i] + bw / 2, B0 - b[1] * hgt - 8); });
        pins.forEach(function(p){ var py = B0 - (1 - p.e) * hgt; x.strokeStyle = GREY; x.lineWidth = 2; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(bx[1] - 6, py); x.lineTo(bx[1] + bw + 6, py); x.stroke(); x.setLineDash([]); });
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(L, B0); x.lineTo(R, B0); x.stroke(); x.textAlign = 'left'; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillText('Concentration relative to the inlet value (drag the outlet bar top to set E)', L, 24);
        x.strokeStyle = C.mid; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(bx[0] + bw, T0); x.lineTo(bx[1], T0); x.stroke(); x.setLineDash([]);
        IX.dot(MS, bx[1] + bw / 2, B0 - (1 - S.e) * hgt, 7, C.char);
        if (hv === 1) IX.tip(MS, bx[1] + bw / 2, B0 - (1 - S.e) * hgt, ['Cout = ' + (1 - S.e).toFixed(2) + ' x Cin', 'E = ' + S.e.toFixed(2), 'CL = ' + CL.toFixed(1) + ' mL/min/kg']);
        var gs = cv(cs), xs = gs.x, sl = 14, sr = gs.w - 14, sy0 = 30, sy1 = gs.h - 30; strip = { l: sl, r: sr, t: sy0, b: sy1, g: gs };
        xs.fillStyle = C.char; xs.font = '600 11px Aptos, "Segoe UI", sans-serif'; xs.textAlign = 'left'; xs.fillText('Observed CL / Q of 29 drugs (click a drug)', sl, 14); xs.strokeStyle = C.silver; xs.fillStyle = C.mid; xs.textAlign = 'center'; xs.font = '11px Aptos, "Segoe UI", sans-serif';
        [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ var px = sl + v * (sr - sl); xs.beginPath(); xs.moveTo(px, sy0); xs.lineTo(px, sy1); xs.stroke(); xs.fillText(v.toFixed(2), px, sy1 + 14); });
        dots.forEach(function(o, i){ var e = Math.min(1, o.d.obs / S.q), px = sl + e * (sr - sl), py = sy0 + 6 + o.j * (sy1 - sy0 - 12); xs.fillStyle = HCLS[o.d.cls][1]; xs.globalAlpha = o.d.name === S.d ? 1 : 0.7; xs.beginPath(); xs.arc(px, py, o.d.name === S.d || i === hv - 10 ? 6 : 3.6, 0, 6.3); xs.fill(); xs.globalAlpha = 1; o.px = px; o.py = py; });
        xs.strokeStyle = C.char; xs.lineWidth = 2; var pe = sl + S.e * (sr - sl); xs.beginPath(); xs.moveTo(pe, sy0); xs.lineTo(pe, sy1); xs.stroke();
        if (hv >= 10) { var o = dots[hv - 10]; IX.tip({ x: xs, box: { l: sl, r: sr, t: sy0, b: sy1 } }, o.px, o.py, [o.d.name, 'CL ' + o.d.obs + ' mL/min/kg', 'E = ' + Math.min(1, o.d.obs / S.q).toFixed(2)]); }
        qs('.sd', side).innerHTML = fTile('Clearance CL = Q x E', CL.toFixed(1) + ' mL/min/kg', 'upper limit: Q = ' + S.q) + fRows([['Extraction ratio E', S.e.toFixed(2)], ['Fh = 1 - E', (1 - S.e).toFixed(2)], ['CL as share of Q', (100 * S.e).toFixed(0) + ' percent'], ['CL for a 70 kg adult', (CL * 70 * 60 / 1000).toFixed(1) + ' L/h']]);
        api.stat('CL = ' + CL.toFixed(1) + ' mL/min/kg');
      }
      [['q', c1], ['e', c2]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; S.d = ''; qs('.d', c3).value = ''; IX.save('mt4', S); draw(); }); });
      qs('.d', c3).addEventListener('change', function(){ var d = OBACH99.filter(function(z){ return z.name === this.value; }.bind(this))[0]; if (d) { S.d = d.name; S.e = Math.min(1, d.obs / S.q); sync(); IX.save('mt4', S); draw(); } });
      function onTop(p){ return bars && Math.hypot(p.x - (bars.bx[1] + bars.bw / 2), p.y - (bars.B0 - (1 - S.e) * bars.hgt)) < 14; }
      IX.attach(cvs, {
        move: function(p){ if (!bars) return; hv = (p.x >= bars.bx[1] && p.x <= bars.bx[1] + bars.bw && p.y >= bars.B0 - (1 - S.e) * bars.hgt && p.y <= bars.B0) ? 1 : -1; cvs.style.cursor = onTop(p) ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ return onTop(p) ? { k: 'e' } : null; },
        drag: function(d, p){ S.e = cl(Math.round((1 - (bars.B0 - p.y) / bars.hgt) * 100) / 100, 0, 1); S.d = ''; sync(); draw(); },
        up: function(){ IX.save('mt4', S); }
      });
      function stripNear(p){ var b = -1, bd = 10; dots.forEach(function(o, i){ var d = Math.hypot(p.x - o.px, p.y - o.py); if (d < bd) { bd = d; b = i; } }); return b; }
      IX.attach(cs, {
        move: function(p){ if (!strip) return; var i = stripNear(p); hv = i >= 0 ? i + 10 : -1; cs.style.cursor = i >= 0 ? 'pointer' : (near(p.x, strip.l + S.e * (strip.r - strip.l), 7) ? 'ew-resize' : 'default'); draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ return (stripNear(p) < 0 && near(p.x, strip.l + S.e * (strip.r - strip.l), 8)) ? { k: 'e' } : null; },
        drag: function(d, p){ S.e = cl(Math.round((p.x - strip.l) / (strip.r - strip.l) * 100) / 100, 0, 1); S.d = ''; sync(); draw(); },
        up: function(){ IX.save('mt4', S); },
        click: function(p){ var i = stripNear(p); if (i >= 0) { S.d = dots[i].d.name; S.e = Math.min(1, dots[i].d.obs / S.q); sync(); IX.save('mt4', S); draw(); } }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 5: total clearance and routes ===== */
  MET.add({ short: 'Total clearance', level: 'foundations', ord: 50, title: 'Total clearance and routes',
    build: function(api){
      var GFR = 7.2, D = 100, S = IX.state('mt5', { h: 6, r: 2, o: 0, f: 0.5 }), pins = [], hv = -1, M = null, lock = null, G = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:560px;height:508px;padding:8px', '<canvas width="544" height="490" style="width:544px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:604px;top:16px;width:328px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('h', 'CLh', 0, 30, 0.5, S.h, 'L/h')), c2 = api.addControl(IX.slider('r', 'CLr', 0, 30, 0.5, S.r, 'L/h')), c3 = api.addControl(IX.slider('o', 'CL other', 0, 10, 0.5, S.o, 'L/h')), c4 = api.addControl(IX.slider('f', 'fu', 0.01, 1, 0.01, S.f));
      function sync(){ qs('.h', c1).value = S.h; qs('.r', c2).value = S.r; qs('.o', c3).value = S.o; qs('.f', c4).value = S.f; }
      var NM = [['Hepatic', 'h', C.red], ['Renal', 'r', C.mid], ['Other', 'o', C.tint]];
      IX.tools(api, { pin: function(){ pins.push({ h: S.h, r: S.r, o: S.o }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'total-clearance', csv: function(){ var CL = S.h + S.r + S.o; return IX.csv([['Route', 'CL (L/h)', 'Share'], ['Hepatic', S.h, CL > 0 ? S.h / CL : 0], ['Renal', S.r, CL > 0 ? S.r / CL : 0], ['Other', S.o, CL > 0 ? S.o / CL : 0], [], ['Total CL (L/h)', CL], ['fu', S.f], ['Filtration only, fu x 7.2 (L/h)', S.f * GFR]]); } });
      function draw(){
        qs('.hv', c1).textContent = S.h.toFixed(1); qs('.rv', c2).textContent = S.r.toFixed(1); qs('.ov', c3).textContent = S.o.toFixed(1); qs('.fv', c4).textContent = S.f.toFixed(2);
        var CL = S.h + S.r + S.o, g = cv(cvs), x = g.x, L = 40, R = g.w - 40, y = 120, hgt = 70, scale = lock ? lock.sc : (R - L) / Math.max(CL, 8), xp = L; G = { L: L, y: y, hgt: hgt, scale: scale }; M = { x: x, box: { l: L, r: R, t: y, b: y + hgt } };
        x.font = '600 13px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.char; x.textAlign = 'left'; x.fillText('Total clearance ' + CL.toFixed(1) + ' L/h (drag the segment ends)', L, 40);
        NM.forEach(function(r, i){ var w = S[r[1]] * scale; if (w > 0) { x.fillStyle = r[2]; x.globalAlpha = hv === i ? 1 : 0.92; x.fillRect(xp, y, w, hgt); x.globalAlpha = 1; x.fillStyle = r[2] === C.tint ? C.char : '#fff'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; if (w > 60) { x.textAlign = 'center'; x.fillText(r[0] + ' ' + S[r[1]].toFixed(1), xp + w / 2, y + hgt / 2 + 4); } } xp += w; IX.dot(M, xp, y + hgt + 14, 6, r[2] === C.tint ? C.mid : r[2]); });
        var filt = S.f * GFR, net = S.r > filt + 1e-9 ? 'net secretion' : (S.r < filt - 1e-9 ? 'net reabsorption' : 'filtration only'), xr = L + S.h * scale;
        x.strokeStyle = C.char; x.lineWidth = 2; x.setLineDash([4, 3]); x.strokeRect(xr, y + hgt + 26, filt * scale, 10); x.setLineDash([]); x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('filtration alone: ' + filt.toFixed(2) + ' L/h', xr, y + hgt + 54);
        x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillText('Renal clearance set: ' + S.r.toFixed(1) + ' L/h, which is ' + net, L, 262);
        var full = D / CL, noh = S.h > 0 ? D / (CL - S.h) : full; x.fillStyle = C.char; x.fillText('AUC after an intravenous dose of ' + D + ' mg: ' + (CL > 0 ? full.toFixed(1) : 'undefined') + ' mg x h/L', L, 300); if (S.h > 0 && CL - S.h > 0) x.fillText('Without the hepatic route: ' + noh.toFixed(1) + ' mg x h/L, ' + (noh / full).toFixed(1) + ' times higher', L, 322);
        pins.forEach(function(p, i){ var py = 360 + i * 30, px = L; x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Pin ' + (i + 1) + ', total ' + (p.h + p.r + p.o).toFixed(1) + ' L/h', L, py - 4); NM.forEach(function(r){ var w = p[r[1]] * scale; x.fillStyle = r[2]; x.globalAlpha = 0.5; x.fillRect(px, py, w, 12); x.globalAlpha = 1; px += w; }); });
        if (hv >= 0) { var key = NM[hv][1], sx0 = L + (hv ? (hv === 1 ? S.h : S.h + S.r) : 0) * scale; IX.tip(M, sx0 + S[key] * scale / 2, y + 6, [NM[hv][0] + ' ' + S[key].toFixed(1) + ' L/h', CL > 0 ? Math.round(100 * S[key] / CL) + '% of total' : 'n/a']); }
        qs('.sd', side).innerHTML = fTile('Fraction excreted unchanged', CL > 0 ? (S.r / CL).toFixed(2) : 'n/a', 'fe = CLr / CL') + fRows([['Share, hepatic', CL > 0 ? (100 * S.h / CL).toFixed(0) + ' percent' : 'n/a'], ['Share, renal', CL > 0 ? (100 * S.r / CL).toFixed(0) + ' percent' : 'n/a'], ['Filtration-only CLr', filt.toFixed(2) + ' L/h'], ['Renal clearance is', net]]) + (pins.length ? '<div class="ol" style="margin:8px 0 2px">Pinned total CL</div>' + fRows(pins.map(function(p, i){ return ['Pin ' + (i + 1), (p.h + p.r + p.o).toFixed(1) + ' L/h']; })) : '');
        api.stat('CL ' + CL.toFixed(1) + ' L/h, fe ' + (CL > 0 ? (S.r / CL).toFixed(2) : 'n/a'));
      }
      [['h', c1], ['r', c2], ['o', c3], ['f', c4]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('mt5', S); draw(); }); });
      function edges(){ var e = [], xp = G.L; NM.forEach(function(r){ xp += S[r[1]] * G.scale; e.push(xp); }); return e; }
      function segAt(p){ if (!G || p.y < G.y || p.y > G.y + G.hgt) return -1; var e = edges(), xp = G.L, i; for (i = 0; i < 3; i++) { if (p.x >= xp && p.x <= e[i]) return i; xp = e[i]; } return -1; }
      function handleAt(p){ if (!G) return -1; var e = edges(), i, best = -1, bd = 14; for (i = 0; i < 3; i++) { var d = Math.hypot(p.x - e[i], p.y - (G.y + G.hgt + 14)); if (d <= bd) { bd = d; best = i; } } return best; }
      IX.attach(cvs, {
        move: function(p){ if (!G) return; hv = segAt(p); cvs.style.cursor = handleAt(p) >= 0 ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var i = handleAt(p); if (i < 0) return null; lock = { sc: G.scale }; return { k: i }; },
        drag: function(d, p){ var e = edges(), start = d.k ? e[d.k - 1] : G.L, max = d.k === 0 ? 30 : (d.k === 1 ? 30 : 10), key = NM[d.k][1]; S[key] = cl(Math.round((p.x - start) / G.scale * 2) / 2, 0, max); sync(); draw(); },
        up: function(){ lock = null; IX.save('mt5', S); draw(); }
      });
      sync();
      return { render: draw };
    } });
})();
