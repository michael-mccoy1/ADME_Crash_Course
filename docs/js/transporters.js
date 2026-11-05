"use strict";
/* Tab 11: transporters. Carrier-mediated uptake and its inhibition, the extended clearance model, uptake inhibition and the AUC ratio,
   biliary clearance by ECCS class (20 substrates, Miyake et al. 2023, Table 1) and the probe substrates and inhibitors recommended in
   Brouwer et al. (2013), Table 2. */
var TP = new Lesson('tp', 'Transporters');
TP.noOpts = true;

var TPBIL = [
  ['Cyclosporine A', '2', 0.06], ['Epirubicin', '3B', 4.94], ['Erythromycin', '4', 1.15], ['Fexofenadine', '3B', 1.40], ['Indocyanine green', '3B', 3.37],
  ['Paclitaxel', '4', 0.17], ['Pitavastatin', '1B', 1.49], ['Pravastatin', '3B', 3.11], ['Rosuvastatin', '3B', 5.85], ['Valsartan', '3B', 0.43],
  ['Cefazolin', '3B', 0.001], ['Cefixime', '3B', 0.14], ['Cefoperazone', '3B', 0.15], ['Cefotetan', '3B', 0.05], ['Cefpiramide', '3B', 0.04],
  ['Ceftriaxone', '3B', 0.07], ['Ciprofloxacin', '3A', 0.06], ['Diclofenac', '1A', 0.04], ['Irinotecan', '4', 0.94], ['Ranitidine', '4', 0.15]
].map(function(r){ return { n: r[0], k: r[1], b: r[2] }; });

var TPROBE = [
  { t: 'P-gp', sys: 'LLC-MDR1, MDCK-MDR1, Caco-2', sub: ['digoxin', 'verapamil', 'talinolol', 'amprenavir'], inh: ['GF120918', 'ketoconazole', 'verapamil', 'cyclosporin A', 'PSC833'], clin: ['digoxin'] },
  { t: 'BCRP', sys: 'MDCK-BCRP, Caco-2', sub: ['prazosin', 'sulfasalazine', 'cimetidine'], inh: ['Ko143', 'GF120918'], clin: ['rosuvastatin', 'methotrexate'] },
  { t: 'MRP2', sys: 'MDCK-MRP2', sub: ['vinblastine', 'dinitrophenyl-glutathione', 'Fluo 3-AM'], inh: ['MK-571', 'probenecid', 'cyclosporin A', 'PSC833'], clin: ['dehydropravastatin', '99mTc-mebrofenin'] },
  { t: 'OCT1', sys: 'CHO-OCT1, HEK293-OCT1', sub: ['tetraethylammonium', '1-methyl-4-phenylpyridinium', 'metformin'], inh: ['decynium-22', 'quinidine', 'verapamil'], clin: ['metformin', 'lamivudine'] },
  { t: 'OCT2', sys: 'CHO-OCT2, HEK293-OCT2', sub: ['tetraethylammonium', 'metformin'], inh: ['decynium-22'], clin: ['metformin', 'lamivudine'] },
  { t: 'OAT1', sys: 'CHO-OAT1, HEK293-OAT1, MDCK-OAT1', sub: ['p-aminohippurate', 'cidofovir', 'methotrexate'], inh: ['probenecid'], clin: ['cidofovir', 'cephradine', 'ciprofloxacin'] },
  { t: 'OAT3', sys: 'CHO-OAT3, HEK293-OAT3, MDCK-OAT3', sub: ['estrone 3-sulfate', 'cimetidine', 'methotrexate'], inh: ['probenecid'], clin: ['cimetidine', 'cephradine', 'ciprofloxacin'] },
  { t: 'OATP1B1', sys: 'CHO-, HEK293- and MDCK-OATP1B1 (expression boosted with butyrate)', sub: ['bromosulfophthalein', 'estradiol 17beta-glucuronide', 'estrone 3-sulfate', 'pitavastatin', 'atorvastatin', 'pravastatin', 'rosuvastatin', 'valsartan'], inh: ['estropipate', 'cyclosporin A', 'rifampin', 'rifamycin SV', 'bromosulfophthalein', 'MK-571'], clin: ['rosuvastatin', 'atorvastatin', 'pitavastatin', 'pravastatin'] },
  { t: 'OATP1B3', sys: 'CHO-, HEK293- and MDCK-OATP1B3 (expression boosted with butyrate)', sub: ['cholecystokinin octapeptide', 'estradiol 17beta-glucuronide', 'bromosulfophthalein', 'valsartan'], inh: ['bromosulfophthalein', 'ursolic acid', 'cyclosporin A', 'rifampin', 'rifamycin SV', 'MK-571'], clin: ['telmisartan'] },
  { t: 'OATP2B1', sys: 'CHO-, HEK293- and MDCK-OATP2B1 (expression boosted with butyrate)', sub: ['estrone 3-sulfate', 'bromosulfophthalein'], inh: ['bromosulfophthalein', 'MK-571'], clin: ['rosuvastatin'] },
  { t: 'MATE1', sys: 'CHO-MATE1, HEK293-MATE1', sub: ['tetraethylammonium', '1-methyl-4-phenylpyridinium', 'metformin', 'pyrimethamine'], inh: ['quinidine', 'verapamil', 'cimetidine'], clin: ['metformin'] },
  { t: 'MATE2-K', sys: 'CHO-MATE2-K, HEK293-MATE2-K', sub: ['tetraethylammonium', '1-methyl-4-phenylpyridinium', 'metformin', 'pyrimethamine'], inh: ['quinidine', 'verapamil', 'cimetidine'], clin: ['metformin'] }];

(function(){
  var GREY = '#A1B1C4', ECC = { '1A': '#0F6E8C', '1B': '#0A4A5E', '2': '#4C93AC', '3A': '#B4561B', '3B': '#8A3F10', '4': '#C98A5B' };
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }

  /* ===== step 1: carrier-mediated uptake ===== */
  TP.add({ short: 'Carrier-mediated uptake', level: 'foundations', ord: 10, title: 'Carrier-mediated and passive uptake',
    build: function(api){
      var S = IX.state('tp1', { v: 200, k: 1, p: 2, c: 0.5 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('v', 'Vmax', 20, 1000, 10, S.v, 'pmol/min/mg')), c2 = api.addControl(IX.slider('k', 'Km', -1, 2, 0.05, S.k, 'uM')), c3 = api.addControl(IX.slider('p', 'Pdif', 0, 20, 0.5, S.p, 'uL/min/mg')), c4 = api.addControl(IX.slider('c', 'Substrate', -1, 2.5, 0.05, S.c, 'uM'));
      function sync(){ qs('.v', c1).value = S.v; qs('.k', c2).value = S.k; qs('.p', c3).value = S.p; qs('.c', c4).value = S.c; }
      IX.tools(api, { pin: function(){ pins.push({ v: S.v, k: S.k, p: S.p }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'carrier-mediated-uptake',
        csv: function(){ var Km = Math.pow(10, S.k), rows = [['C (uM)', 'Active (pmol/min/mg)', 'Passive (pmol/min/mg)', 'Total (pmol/min/mg)']], i; for (i = 0; i <= 100; i++) { var c = 5 * Km * i / 100; rows.push([c, S.v * c / (Km + c), S.p * c, S.v * c / (Km + c) + S.p * c]); } return IX.csv(rows); } });
      function draw(){
        var Km = Math.pow(10, S.k), C0 = Math.pow(10, S.c), xm = lock ? lock.xm : 5 * Km; qs('.vv', c1).textContent = S.v; qs('.kv', c2).textContent = fx(Km); qs('.pv', c3).textContent = S.p.toFixed(1); qs('.cv', c4).textContent = fx(C0);
        function act(c){ return S.v * c / (Km + c); }
        var ymax = lock ? lock.ym : Math.max(S.v + S.p * xm, 10) * 1.05;
        M = IX.chart(cvs, { xr: [0, xm], yr: [0, ymax], xl: 'Substrate concentration (uM)', yl: 'Uptake rate (pmol/min/mg)', series: [{ fn: function(c){ return S.p * c; }, color: GREY, w: 2, label: 'Passive' }, { fn: act, color: C.mid, w: 2.4, dash: [5, 4], label: 'Carrier-mediated' }, { fn: function(c){ return act(c) + S.p * c; }, color: C.red, w: 3, label: 'Total' }], pinned: pins.map(function(q){ var qk = Math.pow(10, q.k); return { fn: function(c){ return q.v * c / (qk + c) + q.p * c; }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        IX.hline(M, M.sy(S.v), C.warn, [5, 4]); lab(M, 'Vmax (drag)', M.box.l + 8, M.sy(S.v) - 6, C.warn);
        IX.dot(M, M.sx(Math.min(Km, xm)), M.sy(S.v / 2), 6, C.mid); lab(M, 'Km (drag)', M.sx(Math.min(Km, xm)) + 9, M.sy(S.v / 2) + 16, C.mid);
        IX.dot(M, M.sx(xm * 0.85), M.sy(S.p * xm * 0.85), 6, GREY); lab(M, 'Pdif (drag)', M.sx(xm * 0.85) - 8, M.sy(S.p * xm * 0.85) + 18, C.mid, 'right');
        var cm = cl(C0, 0, xm); IX.vline(M, M.sx(cm), C.char, [3, 4]); IX.dot(M, M.sx(cm), M.sy(act(cm) + S.p * cm), 5, C.red);
        if (hv !== null) { var a = act(hv), ps = S.p * hv; IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(a + ps), ['C = ' + fx(hv) + ' uM', 'carrier-mediated ' + fx(a), 'passive ' + fx(ps), 'carrier share ' + (100 * a / (a + ps || 1)).toFixed(0) + '%']); }
        var a0 = act(C0), p0 = S.p * C0;
        qs('.sd', side).innerHTML = fTile('Carrier-mediated share', (100 * a0 / (a0 + p0 || 1)).toFixed(0) + '%', 'at ' + fx(C0) + ' uM') + fRows([['Total uptake', fx(a0 + p0) + ' pmol/min/mg'], ['Carrier-mediated', fx(a0)], ['Passive', fx(p0)], ['Carrier clearance at low C, Vmax / Km', fx(S.v / Km) + ' uL/min/mg'], ['Concentration where carrier = passive', S.p > 0 && S.v / S.p - Km > 0 ? fx(S.v / S.p - Km) + ' uM' : 'none']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">v = Vmax C / (Km + C) + Pdif C. Drag the Vmax line, the Km point, the Pdif point or the dashed substrate line.</div>';
        api.stat('Carrier-mediated share ' + (100 * a0 / (a0 + p0 || 1)).toFixed(0) + '% at ' + fx(C0) + ' uM');
      }
      [['v', c1], ['k', c2], ['p', c3], ['c', c4]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('tp1', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; var Km = Math.pow(10, S.k), xm = M.ix(M.box.r); cvs.style.cursor = (Math.hypot(p.x - M.sx(Math.min(Km, xm)), p.y - M.sy(S.v / 2)) < 12 || Math.hypot(p.x - M.sx(xm * 0.85), p.y - M.sy(S.p * xm * 0.85)) < 12) ? 'move' : (near(p.y, M.sy(S.v), 8) ? 'ns-resize' : (near(p.x, M.sx(cl(Math.pow(10, S.c), 0, xm)), 7) ? 'ew-resize' : 'crosshair')); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var Km = Math.pow(10, S.k), xm = M.ix(M.box.r), fr = { xm: xm, ym: M.iy(M.box.t) }; if (Math.hypot(p.x - M.sx(Math.min(Km, xm)), p.y - M.sy(S.v / 2)) < 13) { lock = fr; return { k: 'km' }; } if (Math.hypot(p.x - M.sx(xm * 0.85), p.y - M.sy(S.p * xm * 0.85)) < 13) { lock = fr; return { k: 'pd', xm: xm }; } if (near(p.y, M.sy(S.v), 9) && p.x >= M.box.l && p.x <= M.box.r) { lock = fr; return { k: 'vm' }; } if (near(p.x, M.sx(cl(Math.pow(10, S.c), 0, xm)), 8)) return { k: 'c' }; return null; },
        drag: function(d, p){ if (d.k === 'km') S.k = cl(Math.round(Math.log10(cl(M.ix(p.x), 0.1, 100)) * 20) / 20, -1, 2); else if (d.k === 'vm') S.v = cl(Math.round(M.iy(p.y) / 10) * 10, 20, 1000); else if (d.k === 'pd') S.p = cl(Math.round(M.iy(p.y) / (d.xm * 0.85) * 2) / 2, 0, 20); else S.c = cl(Math.round(Math.log10(cl(M.ix(p.x), 0.1, 300)) * 20) / 20, -1, 2.5); sync(); draw(); },
        up: function(){ lock = null; IX.save('tp1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: inhibition and the Cheng-Prusoff equation ===== */
  TP.add({ short: 'Inhibition of uptake', level: 'foundations', ord: 20, title: 'Inhibition of carrier-mediated uptake',
    build: function(api){
      var S = IX.state('tp2', { ki: 0, s: 1, k: 1 }), pins = [], hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('ki', 'Ki', -2, 2, 0.05, S.ki, 'uM')), c2 = api.addControl(IX.slider('s', 'Substrate', -2, 3, 0.05, S.s, 'uM')), c3 = api.addControl(IX.slider('k', 'Km', -1, 2, 0.05, S.k, 'uM'));
      function sync(){ qs('.ki', c1).value = S.ki; qs('.s', c2).value = S.s; qs('.k', c3).value = S.k; }
      function ic50(o){ return Math.pow(10, o.ki) * (1 + Math.pow(10, o.s) / Math.pow(10, o.k)); }
      function rel(I, o){ return 100 / (1 + I / ic50(o)); }
      IX.tools(api, { pin: function(){ pins.push({ ki: S.ki, s: S.s, k: S.k }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'inhibition-of-uptake',
        csv: function(){ var rows = [['[I] (uM)', 'Carrier-mediated uptake (percent of control)'], [], ['Ki (uM)', Math.pow(10, S.ki)], ['Substrate (uM)', Math.pow(10, S.s)], ['Km (uM)', Math.pow(10, S.k)], ['IC50 (uM)', ic50(S)]], out = [['[I] (uM)', 'Uptake (percent of control)']], i; for (i = 0; i <= 100; i++) { var I = Math.pow(10, -3 + 6 * i / 100); out.push([I, rel(I, S)]); } return IX.csv(out.concat([[]], rows.slice(2))); } });
      function draw(){
        var Ki = Math.pow(10, S.ki), Sv = Math.pow(10, S.s), Km = Math.pow(10, S.k), IC = ic50(S); qs('.kiv', c1).textContent = fx(Ki); qs('.sv', c2).textContent = fx(Sv); qs('.kv', c3).textContent = fx(Km);
        M = LL(cvs, { xr: [0.001, 1000], yr: [0, 100], ylog: false, xt: [0.001, 0.01, 0.1, 1, 10, 100, 1000], yt: [0, 25, 50, 75, 100], xl: 'Inhibitor concentration (uM)', yl: 'Carrier-mediated uptake (percent of control)', series: [{ fn: function(I){ return 100 / (1 + I / Ki); }, color: GREY, w: 1.8, dash: [5, 4], label: 'Substrate near 0' }, { fn: function(I){ return rel(I, S); }, color: C.red, w: 2.8, label: 'Substrate set' }], pinned: pins.map(function(o){ return { fn: function(I){ return rel(I, o); }, color: GREY, w: 1.4, dash: [2, 3] }; }) });
        IX.hline(M, M.sy(50), C.mid, [2, 4]); IX.vline(M, M.sx(IC), C.red, [4, 4]); IX.dot(M, M.sx(IC), M.sy(50), 7, C.red); lab(M, 'IC50 ' + fx(IC) + ' uM (drag)', M.sx(IC) + 10, M.sy(50) - 10, C.red); IX.vline(M, M.sx(Ki), GREY, [3, 4]); lab(M, 'Ki ' + fx(Ki), M.sx(Ki) - 6, M.box.b - 8, C.mid, 'right');
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(rel(hv, S)), ['[I] = ' + fx(hv) + ' uM', 'uptake ' + rel(hv, S).toFixed(0) + '% of control', 'substrate near 0: ' + (100 / (1 + hv / Ki)).toFixed(0) + '%']); }
        qs('.sd', side).innerHTML = fTile('IC50', fx(IC) + ' uM', 'Ki (1 + S / Km)') + fRows([['Ki', fx(Ki) + ' uM'], ['S / Km', fx(Sv / Km)], ['IC50 over Ki', fx(1 + Sv / Km)], ['Ki from the IC50, IC50 / (1 + S / Km)', fx(IC / (1 + Sv / Km)) + ' uM']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">For competitive inhibition of the carrier-mediated component. Drag the IC50 marker to set Ki at the substrate concentration chosen.</div>';
        api.stat('IC50 ' + fx(IC) + ' uM for Ki ' + fx(Ki) + ' uM and S / Km ' + fx(Sv / Km));
      }
      [['ki', c1], ['s', c2], ['k', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('tp2', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = near(p.x, M.sx(ic50(S)), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ return near(p.x, M.sx(ic50(S)), 9) ? { k: 'ic' } : null; },
        drag: function(d, p){ var ic = cl(M.ix(p.x), 0.001, 1000), ki = ic / (1 + Math.pow(10, S.s - S.k)); S.ki = cl(Math.round(Math.log10(ki) * 20) / 20, -2, 2); sync(); draw(); },
        up: function(){ IX.save('tp2', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== extended clearance model (shared by steps 3 and 4) ===== */
  function ecm(o, Q, fb){ var pi = Math.pow(10, o.pi), pe = Math.pow(10, o.pe), mi = Math.pow(10, o.m), bi = Math.pow(10, o.b), pint = mi + bi, all = pi * pint / (pe + pint); return { pi: pi, pe: pe, pint: pint, all: all, frac: pint / (pe + pint), cl: Q * fb * all / (Q + fb * all) }; }

  /* ===== step 3: extended clearance model ===== */
  TP.add({ short: 'Extended clearance model', level: 'applied', ord: 30, title: 'Extended clearance model',
    build: function(api){
      var S = IX.state('tp3', { pi: 2.5, pe: 1, m: 1.5, b: 0.5, fb: -1, q: 21 }), pins = [], hv = null, M = null, Mrg = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('pi', 'PSinf', -1, 3, 0.05, S.pi, 'mL/min/kg')), c2 = api.addControl(IX.slider('pe', 'PSeff', -1, 3, 0.05, S.pe, 'mL/min/kg')), c3 = api.addControl(IX.slider('m', 'CLmet', -2, 3, 0.05, S.m, 'mL/min/kg')), c4 = api.addControl(IX.slider('b', 'CLbile', -2, 3, 0.05, S.b, 'mL/min/kg')), c5 = api.addControl(IX.slider('fb', 'fu,b', -2, 0, 0.05, S.fb)), c6 = api.addControl(IX.slider('q', 'Qh', 15, 30, 1, S.q, 'mL/min/kg'));
      function sync(){ ['pi', 'pe', 'm', 'b', 'fb', 'q'].forEach(function(k, i){ qs('.' + k, [c1, c2, c3, c4, c5, c6][i]).value = S[k]; }); }
      IX.tools(api, { pin: function(){ pins.push(JSON.parse(JSON.stringify(S))); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'extended-clearance-model',
        csv: function(){ var fb = Math.pow(10, S.fb), rows = [['PSinf (mL/min/kg)', 'Hepatic blood clearance (mL/min/kg)', 'CLint,all (mL/min/kg)']], i; for (i = 0; i <= 80; i++) { var o = JSON.parse(JSON.stringify(S)); o.pi = -1 + 4 * i / 80; var r = ecm(o, S.q, fb); rows.push([r.pi, r.cl, r.all]); } return IX.csv(rows); } });
      function draw(){
        var fb = Math.pow(10, S.fb), r = ecm(S, S.q, fb); ['pi', 'pe', 'm', 'b'].forEach(function(k, i){ qs('.' + k + 'v', [c1, c2, c3, c4][i]).textContent = fx(Math.pow(10, S[k])); }); qs('.fbv', c5).textContent = fx(fb); qs('.qv', c6).textContent = S.q;
        function cur(psi){ var o = JSON.parse(JSON.stringify(S)); o.pi = Math.log10(psi); return ecm(o, S.q, fb).cl; }
        M = LL(cvs, { xr: [0.1, 1000], yr: [0, S.q], ylog: false, xt: [0.1, 1, 10, 100, 1000], yt: [0, 5, 10, 15, 20, 25, 30].filter(function(v){ return v <= S.q; }), xl: 'Sinusoidal uptake clearance PSinf (mL/min/kg)', yl: 'Hepatic blood clearance (mL/min/kg)', series: [{ fn: function(v){ return S.q * fb * v / (S.q + fb * v); }, color: GREY, w: 1.8, dash: [5, 4], label: 'Uptake-limited ceiling' }, { fn: cur, color: C.red, w: 2.8, label: 'Model' }], pinned: pins.map(function(o){ return { fn: function(v){ var q = JSON.parse(JSON.stringify(o)); q.pi = Math.log10(v); return ecm(q, o.q, Math.pow(10, o.fb)).cl; }, color: GREY, w: 1.5, dash: [3, 3] }; }) });
        IX.hline(M, M.sy(S.q), C.warn, [5, 4]); lab(M, 'blood flow ' + S.q, M.box.l + 8, M.sy(S.q) + 14, C.warn);
        var xs = cl(r.pi, 0.1005, 999); IX.vline(M, M.sx(xs), C.char, [3, 4]); IX.dot(M, M.sx(xs), M.sy(r.cl), 7, C.red); lab(M, 'PSinf (drag)', M.sx(xs) + 10, M.sy(r.cl) + 16, C.red);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(cur(hv)), ['PSinf ' + fx(hv), 'CLh ' + cur(hv).toFixed(2), 'ceiling ' + (S.q * fb * hv / (S.q + fb * hv)).toFixed(2)]); }
        var reg = r.frac > 0.7 ? 'uptake-limited' : (r.frac < 0.3 ? 'intracellular (metabolism and bile) limited' : 'both steps contribute');
        qs('.sd', side).innerHTML = fTile('Hepatic clearance', r.cl.toFixed(2) + ' mL/min/kg', 'Q fu,b CLint,all / (Q + fu,b CLint,all)') + fRows([['CLint,all', fx(r.all) + ' mL/min/kg'], ['PSint = CLmet + CLbile', fx(r.pint)], ['Share of uptake eliminated, PSint / (PSeff + PSint)', r.frac.toFixed(2)], ['Rate-determining', reg]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">CLint,all = PSinf x PSint / (PSeff + PSint). Drag the point along PSinf.</div>';
        api.stat('CLh ' + r.cl.toFixed(2) + ' mL/min/kg, ' + reg);
      }
      [['pi', c1], ['pe', c2], ['m', c3], ['b', c4], ['fb', c5], ['q', c6]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('tp3', S); draw(); }); });
      function dpos(){ var r = ecm(S, S.q, Math.pow(10, S.fb)); return [M.sx(cl(r.pi, 0.1005, 999)), M.sy(r.cl)]; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; var d = dpos(); cvs.style.cursor = Math.hypot(p.x - d[0], p.y - d[1]) < 12 ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var d = dpos(); return Math.hypot(p.x - d[0], p.y - d[1]) < 14 ? { k: 'pi' } : null; },
        drag: function(d, p){ S.pi = cl(Math.round(Math.log10(cl(M.ix(p.x), 0.1, 1000)) * 20) / 20, -1, 3); sync(); draw(); },
        up: function(){ IX.save('tp3', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 4: uptake inhibition and the AUC ratio ===== */
  TP.add({ short: 'Uptake inhibition and AUC ratio', level: 'applied', ord: 40, title: 'Uptake inhibition and the AUC ratio',
    build: function(api){
      var S = IX.state('tp4', { pi: 2.5, pe: 1, m: 1.5, b: 0.5, fb: -1, q: 21, x: 0 }), hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('pi', 'PSinf', -1, 3, 0.05, S.pi, 'mL/min/kg')), c2 = api.addControl(IX.slider('pe', 'PSeff', -1, 3, 0.05, S.pe, 'mL/min/kg')), c3 = api.addControl(IX.slider('m', 'CLmet', -2, 3, 0.05, S.m, 'mL/min/kg')), c4 = api.addControl(IX.slider('b', 'CLbile', -2, 3, 0.05, S.b, 'mL/min/kg')), c5 = api.addControl(IX.slider('fb', 'fu,b', -2, 0, 0.05, S.fb)), c6 = api.addControl(IX.slider('x', 'Iu / Ki', -2, 2, 0.05, S.x));
      function sync(){ ['pi', 'pe', 'm', 'b', 'fb', 'x'].forEach(function(k, i){ qs('.' + k, [c1, c2, c3, c4, c5, c6][i]).value = S[k]; }); }
      function aucr(x, o){ var fb = Math.pow(10, o.fb), a = ecm(o, o.q || S.q, fb).cl, q = JSON.parse(JSON.stringify(o)); q.pi = o.pi - Math.log10(1 + x); return a / ecm(q, o.q || S.q, fb).cl * 1; }
      function inv(x, o){ var fb = Math.pow(10, o.fb), a = ecm(o, S.q, fb).cl, q = JSON.parse(JSON.stringify(o)); q.pi = o.pi - Math.log10(1 + x); return a / ecm(q, S.q, fb).cl; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'uptake-inhibition-auc-ratio', csv: function(){ var rows = [['Iu / Ki', 'CLh ratio (AUC ratio)', 'R = 1 + Iu / Ki']], i; for (i = 0; i <= 80; i++) { var x = Math.pow(10, -2 + 4 * i / 80); rows.push([x, inv(x, S), 1 + x]); } return IX.csv(rows); } });
      function draw(){
        ['pi', 'pe', 'm', 'b'].forEach(function(k, i){ qs('.' + k + 'v', [c1, c2, c3, c4][i]).textContent = fx(Math.pow(10, S[k])); }); qs('.fbv', c5).textContent = fx(Math.pow(10, S.fb)); qs('.xv', c6).textContent = fx(Math.pow(10, S.x));
        var X0 = Math.pow(10, S.x), lo = JSON.parse(JSON.stringify(S)), hi = JSON.parse(JSON.stringify(S)); lo.m = S.m - 1; lo.b = S.b - 1; hi.m = S.m + 1; hi.b = S.b + 1;
        M = LL(cvs, { xr: [0.01, 100], yr: [1, 50], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [1, 1.1, 2, 5, 10, 20, 50], xl: 'Unbound inhibitor concentration / Ki', yl: 'Hepatic clearance ratio (AUC ratio)', series: [{ fn: function(v){ return 1 + v; }, color: GREY, w: 1.8, dash: [5, 4], label: 'R = 1 + Iu/Ki' }, { fn: function(v){ return inv(v, lo); }, color: C.mid, w: 2, label: 'CLint / 10' }, { fn: function(v){ return inv(v, S); }, color: C.red, w: 3, label: 'Set' }, { fn: function(v){ return inv(v, hi); }, color: C.warn, w: 2, label: 'CLint x 10' }] });
        IX.hline(M, M.sy(1.1), C.char, [3, 4]); lab(M, '1.1', M.box.l + 6, M.sy(1.1) - 4, C.char); var a = inv(X0, S); IX.vline(M, M.sx(X0), C.char, [3, 4]); IX.dot(M, M.sx(X0), M.sy(a), 7, C.red); lab(M, 'drag', M.sx(X0) + 10, M.sy(a) + 16, C.red);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(inv(hv, S)), ['Iu / Ki = ' + fx(hv), 'set: ' + inv(hv, S).toFixed(2), 'CLint / 10: ' + inv(hv, lo).toFixed(2), 'CLint x 10: ' + inv(hv, hi).toFixed(2), 'R = ' + (1 + hv).toFixed(2)]); }
        var r = ecm(S, S.q, Math.pow(10, S.fb));
        qs('.sd', side).innerHTML = fTile('Hepatic clearance ratio', a.toFixed(2), 'CLh control / CLh with the inhibitor') + fRows([['R-value, 1 + Iu / Ki', (1 + X0).toFixed(2)], ['Model over R', (a / (1 + X0)).toFixed(2)], ['Share of uptake eliminated', r.frac.toFixed(2)], ['CLh control', r.cl.toFixed(2) + ' mL/min/kg']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">The inhibitor lowers PSinf by 1 / (1 + Iu / Ki). The clearance ratio reaches R only when uptake limits clearance and clearance is not limited by blood flow.</div>';
        api.stat('Clearance ratio ' + a.toFixed(2) + ' at Iu / Ki ' + fx(X0));
      }
      [['pi', c1], ['pe', c2], ['m', c3], ['b', c4], ['fb', c5], ['x', c6]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('tp4', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = near(p.x, M.sx(Math.pow(10, S.x)), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ return near(p.x, M.sx(Math.pow(10, S.x)), 9) ? { k: 'x' } : null; },
        drag: function(d, p){ S.x = cl(Math.round(Math.log10(cl(M.ix(p.x), 0.01, 100)) * 20) / 20, -2, 2); sync(); draw(); },
        up: function(){ IX.save('tp4', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 5: ECCS class and biliary clearance ===== */
  TP.add({ short: 'ECCS class and biliary clearance', level: 'applied', ord: 50, title: 'ECCS class and biliary clearance',
    build: function(api){
      var KEYS = ['1A', '1B', '2', '3A', '3B', '4'], hv = -1, M = null, sel = -1, PT = [];
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'eccs-biliary-clearance', csv: function(){ var rows = [['Compound', 'ECCS class', 'Human CLbile (mL/min/kg)']]; TPBIL.forEach(function(r){ rows.push([r.n, r.k, r.b]); }); return IX.csv(rows); } });
      function med(a){ var s = a.slice().sort(function(p, q){ return p - q; }); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; }
      function draw(){
        var g = cv(cvs), x = g.x, box = { l: 62, r: g.w - 16, t: 20, b: g.h - 50 }, lo = Math.log10(0.0005), hi = Math.log10(10), cw = (box.r - box.l) / KEYS.length; M = { x: x, box: box };
        function sy(v){ return box.b - (Math.log10(v) - lo) / (hi - lo) * (box.b - box.t); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right';
        [0.001, 0.01, 0.1, 1, 10].forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(String(v), box.l - 6, sy(v) + 4); });
        x.save(); x.translate(14, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Human CLbile (mL/min/kg)', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
        PT = [];
        KEYS.forEach(function(k, i){ var cx = box.l + cw * (i + 0.5), items = TPBIL.filter(function(r){ return r.k === k; }); x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Class ' + k + ' (' + items.length + ')', cx, box.b + 18); x.font = '12px Aptos, "Segoe UI", sans-serif';
          items.forEach(function(r, j){ var px = cx + (j - (items.length - 1) / 2) * Math.min(26, (cw - 24) / Math.max(items.length, 1)), py = sy(r.b), gi = TPBIL.indexOf(r), on = gi === sel || gi === hv; x.fillStyle = ECC[k]; x.globalAlpha = on ? 1 : 0.8; x.beginPath(); x.arc(px, py, on ? 8 : 6, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); } PT.push({ x: px, y: py, i: gi }); });
          if (items.length) { var m = med(items.map(function(r){ return r.b; })); x.strokeStyle = C.char; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - cw / 2 + 12, sy(m)); x.lineTo(cx + cw / 2 - 12, sy(m)); x.stroke(); } });
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Bars: median of the class. Hover a point for the compound.', box.l, g.h - 8);
        if (hv >= 0) { var r = TPBIL[hv], pt = PT.filter(function(q){ return q.i === hv; })[0]; IX.tip(M, pt.x, pt.y, [r.n, 'ECCS class ' + r.k, 'CLbile ' + fx(r.b) + ' mL/min/kg']); }
        var by = {}; KEYS.forEach(function(k){ var it = TPBIL.filter(function(r){ return r.k === k; }); by[k] = it.length ? fx(med(it.map(function(r){ return r.b; }))) : 'n/a'; });
        qs('.sd', side).innerHTML = fTile('Class 3B median CLbile', by['3B'] + ' mL/min/kg', TPBIL.filter(function(r){ return r.k === '3B'; }).length + ' of 20 compounds') + fRows(KEYS.map(function(k){ return ['Class ' + k + ' median', by[k]]; })) + (sel >= 0 ? '<div style="font-weight:700;font-size:14px;margin:8px 0 4px">' + TPBIL[sel].n + '</div>' + fRows([['ECCS class', TPBIL[sel].k], ['CLbile', fx(TPBIL[sel].b) + ' mL/min/kg']]) : '<div class="hint" style="font-size:11.5px;margin-top:8px">Click a point. Source: Miyake et al. (2023), Table 1.</div>');
        api.stat('Class 3B median CLbile ' + by['3B'] + ' mL/min/kg');
      }
      function near1(p){ var b = -1, bd = 12; PT.forEach(function(q){ var d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; b = q.i; } }); return b; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = near1(p); cvs.style.cursor = hv >= 0 ? 'pointer' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        click: function(p){ var i = near1(p); sel = i >= 0 && i !== sel ? i : -1; draw(); }
      });
      return { render: draw };
    } });

  /* ===== step 6: probe substrates and inhibitors ===== */
  TP.add({ short: 'Probe substrates and inhibitors', level: 'applied', ord: 60, title: 'Probe substrates and inhibitors',
    build: function(api){
      var S = IX.state('tp6', { t: 'OATP1B1', i: '' });
      var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:12px 14px;overflow:auto', '<div style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px"><div class="mx"></div><div class="dt"></div></div>');
      var INH = []; TPROBE.forEach(function(r){ r.inh.forEach(function(n){ if (INH.indexOf(n) < 0) INH.push(n); }); }); INH.sort(function(a, b){ var ca = TPROBE.filter(function(r){ return r.inh.indexOf(a) >= 0; }).length, cb = TPROBE.filter(function(r){ return r.inh.indexOf(b) >= 0; }).length; return cb - ca || (a < b ? -1 : 1); });
      IX.tools(api, { csv: function(){ var rows = [['Transporter', 'In vitro systems', 'Substrates', 'Inhibitors', 'Potential clinical probes']]; TPROBE.forEach(function(r){ rows.push([r.t, r.sys, r.sub.join('; '), r.inh.join('; '), r.clin.join('; ')]); }); return IX.csv(rows); }, name: 'transporter-probes' });
      function draw(){
        var cur = TPROBE.filter(function(r){ return r.t === S.t; })[0];
        qs('.mx', pn).innerHTML = '<table style="border-collapse:collapse;font-size:11.5px"><tr><th style="text-align:left;padding:3px 6px">Inhibitor</th>' + TPROBE.map(function(r){ return '<th data-t="' + r.t + '" style="cursor:pointer;padding:3px 4px;border:1px solid ' + C.silver + ';background:' + (r.t === S.t ? C.light : '#fff') + ';font-weight:' + (r.t === S.t ? 700 : 500) + ';writing-mode:vertical-rl;transform:rotate(180deg)">' + r.t + '</th>'; }).join('') + '</tr>' + INH.map(function(n){ var on = S.i === n; return '<tr data-i="' + n + '" style="cursor:pointer;background:' + (on ? C.light : '#fff') + '"><td style="padding:3px 6px;border:1px solid ' + C.silver + ';font-weight:' + (on ? 700 : 500) + '">' + n + '</td>' + TPROBE.map(function(r){ var has = r.inh.indexOf(n) >= 0; return '<td style="text-align:center;border:1px solid ' + C.silver + ';background:' + (has ? (r.t === S.t || on ? '#F3D3BF' : '#F7E5D8') : '#fff') + ';width:30px;color:' + C.warn + ';font-weight:700">' + (has ? 'yes' : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table><div class="hint" style="font-size:11.5px;margin-top:6px">Rows: inhibitors recommended for at least one transporter. Click a column for the transporter or a row for the inhibitor.</div>';
        var ih = S.i ? TPROBE.filter(function(r){ return r.inh.indexOf(S.i) >= 0; }).map(function(r){ return r.t; }) : null;
        qs('.dt', pn).innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:6px">' + cur.t + '</div>' + [['In vitro systems', cur.sys], ['Positive-control substrates', cur.sub.join(', ')], ['Inhibitors', cur.inh.join(', ')], ['Potential clinical probes', cur.clin.join(', ')]].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:6px 10px;background:#fff;margin-bottom:5px"><div class="ol" style="margin-bottom:1px">' + t[0] + '</div><div style="font-size:12.5px;line-height:1.4">' + t[1] + '</div></div>'; }).join('') + (ih ? '<div style="border:1px solid ' + C.red + ';border-radius:8px;padding:6px 10px;background:#fff;font-size:12.5px"><b>' + S.i + '</b> is listed for ' + ih.length + ' transporter' + (ih.length === 1 ? '' : 's') + ': ' + ih.join(', ') + '.</div>' : '');
        qsa('th[data-t]', pn).forEach(function(th){ th.addEventListener('click', function(){ S.t = th.dataset.t; IX.save('tp6', S); draw(); }); });
        qsa('tr[data-i]', pn).forEach(function(tr){ tr.addEventListener('click', function(){ S.i = S.i === tr.dataset.i ? '' : tr.dataset.i; IX.save('tp6', S); draw(); }); });
        api.stat(cur.t + ', ' + cur.inh.length + ' inhibitors listed');
      }
      return { render: draw };
    } });
})();
