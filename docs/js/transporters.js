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
        IX.hline(M, M.sy(S.q), C.warn, [5, 4]); lab(M, 'blood flow ' + S.q, M.box.r - 6, M.sy(S.q) + 14, C.warn, 'right');
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
      var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:10px 14px;overflow:auto', '<div class="mx"></div><div class="dt" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px"></div>');
      var INH = []; TPROBE.forEach(function(r){ r.inh.forEach(function(n){ if (INH.indexOf(n) < 0) INH.push(n); }); }); INH.sort(function(a, b){ var ca = TPROBE.filter(function(r){ return r.inh.indexOf(a) >= 0; }).length, cb = TPROBE.filter(function(r){ return r.inh.indexOf(b) >= 0; }).length; return cb - ca || (a < b ? -1 : 1); });
      IX.tools(api, { csv: function(){ var rows = [['Transporter', 'In vitro systems', 'Substrates', 'Inhibitors', 'Potential clinical probes']]; TPROBE.forEach(function(r){ rows.push([r.t, r.sys, r.sub.join('; '), r.inh.join('; '), r.clin.join('; ')]); }); return IX.csv(rows); }, name: 'transporter-probes' });
      function draw(){
        var cur = TPROBE.filter(function(r){ return r.t === S.t; })[0], TH = 'padding:3px 2px;border:1px solid ' + C.silver + ';font-size:10.5px;text-align:center;color:' + C.char + ';cursor:pointer;';
        qs('.mx', pn).innerHTML = '<table style="border-collapse:collapse;width:100%;table-layout:fixed;font-size:11.5px"><colgroup><col style="width:150px">' + TPROBE.map(function(){ return '<col>'; }).join('') + '</colgroup><tr><th style="padding:4px 6px;text-align:left;border:1px solid ' + C.silver + ';background:#fff;color:' + C.char + ';font-size:11px">Inhibitor</th>' + TPROBE.map(function(r){ var on = r.t === S.t; return '<th data-t="' + r.t + '" style="' + TH + 'background:' + (on ? '#CFE6EE' : '#fff') + ';font-weight:' + (on ? 700 : 500) + '">' + r.t + '</th>'; }).join('') + '</tr>' + INH.map(function(n){ var on = S.i === n; return '<tr data-i="' + n + '" style="cursor:pointer"><td style="padding:1px 6px;border:1px solid ' + C.silver + ';background:' + (on ? '#CFE6EE' : '#fff') + ';font-weight:' + (on ? 700 : 500) + ';white-space:nowrap">' + n + '</td>' + TPROBE.map(function(r){ var has = r.inh.indexOf(n) >= 0, hl = r.t === S.t || on; return '<td style="text-align:center;border:1px solid ' + C.silver + ';height:16px;line-height:1;padding:1px 2px;background:' + (hl && has ? '#F3D3BF' : (r.t === S.t ? '#F2F8FA' : '#fff')) + '">' + (has ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + C.warn + '"></span>' : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
        var ih = S.i ? TPROBE.filter(function(r){ return r.inh.indexOf(S.i) >= 0; }).map(function(r){ return r.t; }) : null;
        function card(t, v, w){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:6px 10px;background:#fff;' + (w ? 'grid-column:span ' + w + ';' : '') + '"><div class="ol" style="margin-bottom:1px">' + t + '</div><div style="font-size:12px;line-height:1.4">' + v + '</div></div>'; }
        qs('.dt', pn).innerHTML = card('Transporter', '<b style="font-size:14px">' + cur.t + '</b><br>' + cur.sys) + card('Positive-control substrates', cur.sub.join(', ')) + card('Inhibitors', cur.inh.join(', ')) + card('Potential clinical probes', cur.clin.join(', ')) + (ih ? '<div style="grid-column:1 / -1;border:1px solid ' + C.red + ';border-radius:8px;padding:6px 10px;background:#fff;font-size:12.5px"><b>' + S.i + '</b> is listed for ' + ih.length + ' transporter' + (ih.length === 1 ? '' : 's') + ': ' + ih.join(', ') + '.</div>' : '');
        qsa('th[data-t]', pn).forEach(function(th){ th.addEventListener('click', function(){ S.t = th.dataset.t; IX.save('tp6', S); draw(); }); });
        qsa('tr[data-i]', pn).forEach(function(tr){ tr.addEventListener('click', function(){ S.i = S.i === tr.dataset.i ? '' : tr.dataset.i; IX.save('tp6', S); draw(); }); });
        api.stat(cur.t + ', ' + cur.inh.length + ' inhibitors listed');
      }
      return { render: draw };
    } });

  /* ===== schematic (first step): hepatocyte uptake, metabolism and efflux as a particle simulation of the extended clearance model =====
     Blood discs are held at a fixed number (unbound blood concentration clamped). Each blood disc enters with hazard h0 Kpuu / W split between OATP and
     passive diffusion in proportion PSact : PSdif; each cytosol disc leaves with hazard h0 split in proportion CLint,met : CLint,bile : PSeff,act : PSdif.
     The time-averaged ratio of cytosol to blood discs (times the disc weight W) is then PSinf / (PSeff + PSint), the equation value of Kpuu. */
  TP.add({ short: 'Hepatocyte schematic', level: 'foundations', ord: 5, title: 'Hepatocyte uptake and efflux',
    build: function(api){
      var S = IX.state('tpx', { ua: 2, pd: 0.5, cm: 1.5, cb: 0.5, ef: -0.5, k: 0 }), FB = 0.1, QH = 21, H0 = 0.35, TAU = 20, FV = 45, BV = 30;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('ua', 'OATP uptake PSact', -1, 3, 0.05, S.ua, 'mL/min/kg')), c2 = api.addControl(IX.slider('pd', 'Passive PSdif', -1, 3, 0.05, S.pd, 'mL/min/kg')), c3 = api.addControl(IX.slider('cm', 'CLint,met', -2, 3, 0.05, S.cm, 'mL/min/kg')), c4 = api.addControl(IX.slider('cb', 'CLint,bile', -2, 3, 0.05, S.cb, 'mL/min/kg')), c5 = api.addControl(IX.slider('ef', 'Basolateral efflux PSeff,act', -2, 3, 0.05, S.ef, 'mL/min/kg'));
      var c6 = api.addControl('<button type="button" class="btn sm ghost ih">Inhibit uptake</button> <button type="button" class="btn sm ghost rs">Restart</button>');
      var SL = [['ua', c1], ['pd', c2], ['cm', c3], ['cb', c4], ['ef', c5]];
      var OAT = [70, 130, 250, 320], EFB = 190, CAN = [[110, 'MRP2'], [190, 'BCRP'], [270, 'P-gp']], FREE = [[36, 58], [82, 118], [142, 178], [202, 238], [262, 308], [332, 366]];
      var CYP = { x: 270, y: 92, w: 70, h: 36 }, NUC = { x: 320, y: 272, r: 40 }, GATE = [], rnd = SC.rand(11), P = [], R = null, W = 1, NB = 30, acc = null, hov = null, dragI = null, tside = 0, i;
      OAT.forEach(function(y){ GATE.push({ x: 152, y: y, o: 0, busy: 0 }); }); GATE.push({ x: 152, y: EFB, o: 0, busy: 0 }); CAN.forEach(function(c){ GATE.push({ x: 450, y: c[0], o: 0, busy: 0 }); });
      function nblk(){ var n = 0, j; for (j = 0; j < 4; j++) if (S.k & (1 << j)) n++; return n; }
      function blk(j){ return !!(S.k & (1 << j)); }
      function mdl(){
        var nf = 4 - nblk(), ua0 = Math.pow(10, S.ua), ua = ua0 * nf / 4, pd = Math.pow(10, S.pd), ef = Math.pow(10, S.ef), cm = Math.pow(10, S.cm), cb = Math.pow(10, S.cb), psinf = ua + pd, pseff = pd + ef, psint = cm + cb, out = pseff + psint;
        var r = ecm({ pi: Math.log10(psinf), pe: Math.log10(pseff), m: S.cm, b: S.cb }, QH, FB), r0 = ecm({ pi: Math.log10(ua0 + pd), pe: Math.log10(pseff), m: S.cm, b: S.cb }, QH, FB);
        return { ua0: ua0, ua: ua, pd: pd, ef: ef, cm: cm, cb: cb, psinf: psinf, pseff: pseff, psint: psint, kp: psinf / out, fm: cm / out, fbi: cb / out, fbk: pseff / out, r: r, r0: r0 };
      }
      function rin(a, b){ return a + (b - a) * rnd(); }
      function freeY(){ var s = FREE[Math.floor(rnd() * FREE.length)]; return rin(s[0], s[1]); }
      function cellPt(){ var x = 300, y = 200, j; for (j = 0; j < 30; j++) { x = rin(178, 428); y = rin(42, 360); if (Math.hypot(x - NUC.x, y - NUC.y) > NUC.r + 6) break; } return [x, y]; }
      function mk(s, x, y, o){ var p = { s: s, x: x, y: y, vx: 0, vy: 0, met: false, f: 0, g: -1, life: 0, tm: 0 }, k; if (o) for (k in o) p[k] = o[k]; P.push(p); return p; }
      function go(p, pts, sp, nx, g){ p.s = 'mv'; p.path = pts; p.sp = sp; p.nx = nx; p.g = g === undefined ? -1 : g; }
      function land(p){ p.s = p.nx; p.path = null; p.g = -1; p.vx = 0; p.vy = 0; if (p.s === 'cyp') p.tm = 0.4; if (p.s === 'bl' || p.s === 'mb') p.life = 2.5; if (p.s === 'rb') p.life = 1.6; }
      function scale(){ NB = Math.round(cl(70 / R.kp, 8, 40)); return Math.max(1, R.kp * NB / 80); }
      function count(s){ var n = 0; P.forEach(function(p){ if (p.s === s) n++; }); return n; }
      function zero(){ acc = { met: 0, bile: 0, blood: 0, ic: 0, ib: 0 }; }
      function seed(){
        R = mdl(); W = scale(); P = []; zero(); var nc = Math.min(200, Math.round(R.kp * NB / W)), ex = nc * H0, q, j;
        for (j = 0; j < NB; j++) mk('b', rin(16, 126), rin(34, 366));
        for (j = 0; j < nc; j++) { q = cellPt(); mk('c', q[0], q[1]); }
        for (j = 0; j < Math.min(40, Math.round(ex * R.fbi * 2.5)); j++) mk('bl', rin(466, 516), rin(40, 366), { life: rin(0.3, 2.5) });
        for (j = 0; j < Math.min(30, Math.round(ex * R.fm * 2.5)); j++) mk('mb', rin(16, 126), rin(40, 366), { met: true, f: 1, life: rin(0.3, 2.5) });
        for (j = 0; j < Math.min(20, Math.round(ex * R.fbk * 1.6)); j++) mk('rb', rin(96, 126), rin(40, 366), { life: rin(0.3, 1.6) });
        for (j = 0; j < 3 * nblk(); j++) mk('inh', rin(16, 126), rin(34, 366));
      }
      function rescale(){
        var w0 = W, nb0 = NB; R = mdl(); W = scale();
        if (w0 !== W) { var cs = P.filter(function(p){ return p.s === 'c'; }), tgt = Math.round(cs.length * w0 / W), q;
          if (tgt < cs.length) { var drop = cs.slice(0); while (drop.length > tgt) { var k = Math.floor(rnd() * drop.length); P.splice(P.indexOf(drop[k]), 1); drop.splice(k, 1); } }
          else while (tgt-- > cs.length && P.length < 300) { q = cellPt(); mk('c', q[0], q[1]); } }
        if (NB < nb0) { var bs = P.filter(function(p){ return p.s === 'b'; }); while (bs.length > NB) { var m = Math.floor(rnd() * bs.length); P.splice(P.indexOf(bs[m]), 1); bs.splice(m, 1); } }
        else if (NB > nb0) { var add = NB - count('b'); while (add-- > 0) mk('b', rin(16, 126), rin(34, 366)); }
      }
      function adv(dt){
        var dec = Math.exp(-dt / TAU), nb = 0, nc = 0, hin = H0 * R.kp / W, pa = R.ua / R.psinf, pIn = 1 - Math.exp(-hin * dt), pOut = 1 - Math.exp(-H0 * dt), free = [], j, p, y, g, u;
        ['met', 'bile', 'blood', 'ic', 'ib'].forEach(function(k){ acc[k] *= dec; });
        for (j = 0; j < 4; j++) if (!blk(j)) free.push(j);
        GATE.forEach(function(G){ G.busy = Math.max(0, G.busy - dt); });
        for (j = P.length - 1; j >= 0; j--) {
          p = P[j];
          if (p.s === 'b' || p.s === 'mb' || p.s === 'rb' || p.s === 'inh') {
            p.y += FV * dt; p.x = cl(p.x + (rnd() - 0.5) * 60 * dt, 14, 128);
            if (p.s === 'mb' || p.s === 'rb') p.life -= dt;
            if (p.y > 368 || ((p.s === 'mb' || p.s === 'rb') && p.life <= 0)) { P.splice(j, 1); continue; }
            if (p.s === 'b') { nb++;
              if (rnd() < pIn) {
                if (free.length && rnd() < pa) { g = free[Math.floor(rnd() * free.length)]; y = OAT[g]; go(p, [[134, y], [170, y], [rin(182, 204), y + rin(-10, 10)]], 80, 'c', g); }
                else { y = freeY(); go(p, [[134, y], [170, y], [rin(180, 198), y]], 45, 'c'); } } }
          } else if (p.s === 'bl') {
            p.y += BV * dt; p.x = cl(p.x + (rnd() - 0.5) * 40 * dt, 466, 516); p.life -= dt; if (p.y > 368 || p.life <= 0) { P.splice(j, 1); continue; }
          } else if (p.s === 'c') { nc++;
            p.vx += (rnd() - 0.5) * 260 * dt; p.vy += (rnd() - 0.5) * 260 * dt; p.vx *= 1 - Math.min(1, 1.2 * dt); p.vy *= 1 - Math.min(1, 1.2 * dt);
            var sp = Math.hypot(p.vx, p.vy); if (sp > 30) { p.vx *= 30 / sp; p.vy *= 30 / sp; }
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.x < 176) { p.x = 176; p.vx = Math.abs(p.vx); } if (p.x > 430) { p.x = 430; p.vx = -Math.abs(p.vx); } if (p.y < 40) { p.y = 40; p.vy = Math.abs(p.vy); } if (p.y > 362) { p.y = 362; p.vy = -Math.abs(p.vy); }
            var dn = Math.hypot(p.x - NUC.x, p.y - NUC.y); if (dn < NUC.r + 5) { var ux = (p.x - NUC.x) / (dn || 1), uy = (p.y - NUC.y) / (dn || 1); p.x = NUC.x + ux * (NUC.r + 5); p.y = NUC.y + uy * (NUC.r + 5); p.vx = ux * 15; p.vy = uy * 15; }
            if (rnd() < pOut) {
              u = rnd() * (R.pseff + R.psint);
              if (u < R.cm) { acc.met++; go(p, [[rin(CYP.x + 10, CYP.x + CYP.w - 10), rin(CYP.y + 8, CYP.y + CYP.h - 8)]], 70, 'cyp'); }
              else if (u < R.cm + R.cb) { acc.bile++; g = Math.floor(rnd() * 3); y = CAN[g][0]; go(p, [[432, y], [468, y], [rin(476, 510), y + rin(-8, 8)]], 80, 'bl', 5 + g); }
              else if (u < R.cm + R.cb + R.ef) { acc.blood++; go(p, [[172, EFB], [134, EFB], [rin(104, 124), EFB]], 80, 'rb', 4); }
              else { acc.blood++; y = freeY(); go(p, [[170, y], [134, y], [rin(104, 124), y]], 45, 'rb'); } }
          } else if (p.s === 'mv') {
            var tg = p.path[0], dx = tg[0] - p.x, dy = tg[1] - p.y, d = Math.hypot(dx, dy), st = p.sp * dt;
            if (d <= st) { p.x = tg[0]; p.y = tg[1]; p.path.shift(); if (!p.path.length) land(p); } else { p.x += dx / d * st; p.y += dy / d * st; }
            if (p.g >= 0 && Math.hypot(p.x - GATE[p.g].x, p.y - GATE[p.g].y) < 20) GATE[p.g].busy = 0.12;
          } else if (p.s === 'cyp') {
            p.tm -= dt; p.f = cl(1 - p.tm / 0.4, 0, 1); if (p.tm <= 0) { p.met = true; p.f = 1; y = freeY(); go(p, [[172, y], [134, y], [rin(104, 124), y]], 50, 'mb'); }
          }
        }
        acc.ic += nc * W * dt; acc.ib += nb * dt;
        var def = NB - count('b'); while (def-- > 0) mk('b', rin(16, 126), def > 3 ? rin(34, 366) : rin(32, 40));
        if (count('inh') < 3 * nblk() && P.length < 300 && rnd() < 4 * dt) mk('inh', rin(16, 126), 32);
        GATE.forEach(function(G, k){ var on = k < 4 && blk(k) ? 0 : (G.busy > 0 ? 1 : 0); G.o += (on - G.o) * Math.min(1, dt * 14); });
      }
      function sim(){ var n = acc.met + acc.bile + acc.blood; return { n: n, ok: ANIM && n > 15, fm: n ? acc.met / n : 0, fbi: n ? acc.bile / n : 0, fbk: n ? acc.blood / n : 0, kp: acc.ib > 0.5 ? acc.ic / acc.ib : NaN }; }
      function reg(){ var f = R.r.frac; return f > 0.7 ? 'uptake (PSinf)' : (f < 0.3 ? 'intracellular elimination' : 'uptake and elimination both'); }

      function bil(x, x0){ var y; x.fillStyle = C.light; x.fillRect(x0, 30, 20, 342); x.fillStyle = C.bg; for (y = 33; y < 372; y += 6) { x.beginPath(); x.arc(x0 + 3, y, 2, 0, 6.2832); x.arc(x0 + 17, y, 2, 0, 6.2832); x.fill(); } }
      function gate(x, G, col, isBlk, hl){
        var gp = 2 + 6 * G.o; x.fillStyle = col; SC.rr(x, G.x - 13, G.y - gp - 10, 26, 10, 4); x.fill(); SC.rr(x, G.x - 13, G.y + gp, 26, 10, 4); x.fill();
        if (isBlk) SC.dot(x, G.x - 6, G.y, 4.5, C.warn, '#fff');
        if (hl) { x.strokeStyle = C.char; x.lineWidth = 1.5; SC.rr(x, G.x - 16, G.y - 22, 32, 44, 6); x.stroke(); }
      }
      function draw(){
        var g = cv(cvs), x = g.x, j, sm = sim(), nbk = nblk();
        /* compartments */
        x.fillStyle = '#F6ECE8'; SC.rr(x, 6, 30, 140, 342, 10); x.fill();
        x.fillStyle = '#FFFFFF'; x.fillRect(142, 30, 318, 342); x.strokeStyle = C.silver; x.lineWidth = 1; x.strokeRect(142, 30, 318, 342);
        x.fillStyle = '#F3F0DE'; x.fillRect(460, 30, 62, 342);
        x.fillStyle = '#F6F8F9'; SC.rr(x, 522, 30, 96, 342, 10); x.fill(); bil(x, 522);
        bil(x, 142); bil(x, 440);
        x.strokeStyle = C.silver; x.setLineDash([3, 6]); [40, 72, 104].forEach(function(xx){ x.beginPath(); x.moveTo(xx, 40); x.lineTo(xx, 360); x.stroke(); }); x.setLineDash([]);
        SC.arrow(x, 70, 350, 70, 368, C.bg, 2, 8); SC.arrow(x, 491, 350, 491, 368, C.bg, 2, 8);
        SC.text(x, 'Sinusoidal blood', 76, 20, { bold: true, align: 'center' }); SC.text(x, 'Hepatocyte', 301, 20, { bold: true, align: 'center' }); SC.text(x, 'Bile canaliculus', 491, 20, { bold: true, align: 'center' });
        SC.text(x, 'Adjacent', 584, 196, { size: 11, color: C.bg, align: 'center' }); SC.text(x, 'hepatocyte', 584, 210, { size: 11, color: C.bg, align: 'center' });
        /* nucleus and CYP */
        x.beginPath(); x.arc(NUC.x, NUC.y, NUC.r, 0, 6.2832); x.fillStyle = C.light; x.fill(); x.strokeStyle = C.silver; x.lineWidth = 1.5; x.stroke(); SC.text(x, 'Nucleus', NUC.x, NUC.y + 4, { size: 11, color: C.bg, align: 'center' });
        x.fillStyle = '#E9EEF2'; SC.rr(x, CYP.x, CYP.y, CYP.w, CYP.h, 12); x.fill(); x.strokeStyle = hov && hov.k === 'cyp' ? C.char : C.bg; x.lineWidth = 1.5; x.stroke();
        SC.text(x, 'CYP', CYP.x + CYP.w / 2, CYP.y - 6, { bold: true, size: 11, align: 'center', color: C.char });
        /* passive path */
        x.setLineDash([4, 3]); SC.arrow(x, 128, 96, 176, 96, C.bg, 1.4, 7); SC.arrow(x, 176, 104, 128, 104, C.bg, 1.4, 7); x.setLineDash([]);
        SC.text(x, 'passive', 182, 104, { size: 11, bold: true, color: C.mid });
        /* transporters */
        for (j = 0; j < 4; j++) { gate(x, GATE[j], C.dred, blk(j), hov && hov.k === 'g' && hov.i === j); SC.text(x, 'OATP', 172, OAT[j] + 4, { size: 11, bold: true, color: C.dred }); }
        gate(x, GATE[4], '#4C93AC', false, hov && hov.k === 'g' && hov.i === 4); SC.text(x, 'MRP3', 172, EFB + 4, { size: 11, bold: true, color: '#2F6F86' });
        for (j = 0; j < 3; j++) { gate(x, GATE[5 + j], '#4C93AC', false, hov && hov.k === 'g' && hov.i === 5 + j); SC.text(x, CAN[j][1], 432, CAN[j][0] + 4, { size: 11, bold: true, color: '#2F6F86', align: 'right' }); }
        /* particles */
        P.forEach(function(p){
          var col = p.s === 'inh' ? C.warn : (p.met ? C.bg : (p.s === 'cyp' ? SC.mix(C.red, C.bg, p.f) : C.red)), a = (p.s === 'bl' || p.s === 'mb' || p.s === 'rb') ? cl(p.life / 0.6, 0, 1) : 1;
          x.globalAlpha = a; SC.dot(x, p.x, p.y, p.s === 'inh' ? 4.2 : 3.6, col, '#fff'); x.globalAlpha = 1; });
        if (dragI) SC.dot(x, dragI.x, dragI.y, 6, C.warn, '#fff');
        /* fate bars */
        SC.text(x, 'Fate of drug entering the hepatocyte (bar: simulated, tick: equation)', 8, 396, { size: 11.5, bold: true });
        [['Metabolism (CYP)', sm.fm, R.fm, C.bg], ['Bile', sm.fbi, R.fbi, '#C98A5B'], ['Back to blood', sm.fbk, R.fbk, C.red]].forEach(function(r, k){
          var y = 404 + k * 19; SC.text(x, r[0], 8, y + 10, { size: 11 }); x.fillStyle = C.light; x.fillRect(128, y, 280, 12);
          if (sm.ok) { x.fillStyle = r[3]; x.fillRect(128, y, 280 * r[1], 12); }
          x.fillStyle = C.char; x.fillRect(128 + 280 * r[2] - 1, y - 3, 2.5, 18);
          SC.text(x, (sm.ok ? r[1].toFixed(2) : 'n/a') + '   equation ' + r[2].toFixed(2), 418, y + 10, { size: 11 }); });
        /* legend */
        var ly = 478; SC.dot(x, 14, ly - 4, 4, C.red, '#fff'); SC.text(x, 'Drug', 22, ly, { size: 11 }); SC.dot(x, 64, ly - 4, 4, C.bg, '#fff'); SC.text(x, 'Metabolite', 72, ly, { size: 11 });
        SC.dot(x, 144, ly - 4, 6, C.warn, '#fff'); SC.text(x, 'Inhibitor (drag onto an OATP)', 154, ly, { size: 11 });
        x.fillStyle = C.dred; SC.rr(x, 330, ly - 12, 16, 5, 2); x.fill(); SC.rr(x, 330, ly - 3, 16, 5, 2); x.fill(); SC.text(x, 'Uptake transporter', 352, ly, { size: 11 });
        x.fillStyle = '#4C93AC'; SC.rr(x, 462, ly - 12, 16, 5, 2); x.fill(); SC.rr(x, 462, ly - 3, 16, 5, 2); x.fill(); SC.text(x, 'Efflux transporter', 484, ly, { size: 11 });
        if (hov) IX.tip({ x: x, box: { l: 0, r: 624, t: 0, b: 490 } }, hov.x, hov.y, tipLines(hov));
      }
      function tipLines(h){
        if (h.k === 'cyp') return ['CYP (cytochrome P450)', 'CLint,met ' + fx(R.cm) + ' mL/min/kg', 'share of exits ' + R.fm.toFixed(2)];
        if (h.k === 'pas') return ['Passive diffusion, both directions', 'PSdif ' + fx(R.pd) + ' mL/min/kg'];
        if (h.i < 4) return ['OATP, site ' + (h.i + 1) + ' of 4', blk(h.i) ? 'blocked by inhibitor' : 'active', 'PSact ' + fx(R.ua) + ' of ' + fx(R.ua0) + ' mL/min/kg', blk(h.i) ? 'drag the inhibitor off to unblock' : 'click to block'];
        if (h.i === 4) return ['MRP3, basolateral efflux', 'PSeff,act ' + fx(R.ef) + ' mL/min/kg'];
        return [CAN[h.i - 5][1] + ', canalicular efflux', 'CLint,bile ' + fx(R.cb) + ' mL/min/kg', 'shared by MRP2, BCRP and P-gp'];
      }
      function hit(p){
        var j; for (j = 0; j < GATE.length; j++) if (Math.abs(p.x - GATE[j].x) < 16 && Math.abs(p.y - GATE[j].y) < 20) return { k: 'g', i: j, x: p.x, y: p.y };
        if (p.x >= CYP.x && p.x <= CYP.x + CYP.w && p.y >= CYP.y - 16 && p.y <= CYP.y + CYP.h) return { k: 'cyp', x: p.x, y: p.y };
        if (p.y > 30 && p.y < 372 && ((p.x > 140 && p.x < 164) || (p.x > 120 && p.x < 226 && p.y > 88 && p.y < 110))) return { k: 'pas', x: p.x, y: p.y };
        return null;
      }
      function panel(){
        var sm = sim(), nbk = nblk(), rows = [['PSinf = PSact + PSdif', fx(R.psinf) + ' mL/min/kg'], ['PSeff = PSdif + PSeff,act', fx(R.pseff)], ['PSint = CLint,met + CLint,bile', fx(R.psint)], ['CLint,all', fx(R.r.all) + ' mL/min/kg'], ['CLh, fu,b 0.1, Qh 21', R.r.cl.toFixed(2) + ' mL/min/kg'], ['Hepatic extraction, CLh / Qh', (R.r.cl / QH).toFixed(3)], ['Rate-determining step', reg()]];
        if (nbk) rows.push(['OATP sites blocked', nbk + ' of 4' + (nbk < 4 ? ', Iu / Ki = ' + fx(nbk / (4 - nbk)) : '')], ['CLh ratio, control / inhibited', (R.r0.cl / R.r.cl).toFixed(2)]);
        rows.push(['Simulated exits counted', sm.ok ? Math.round(sm.n) + ' (last ' + TAU + ' s)' : 'n/a']);
        qs('.sd', side).innerHTML = fTile('Kpuu, cytosol / blood', fx(R.kp), 'PSinf / (PSeff + PSint); simulated ' + (sm.ok && isFinite(sm.kp) ? fx(sm.kp) : 'n/a')) + fRows(rows) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Unbound blood concentration held constant. Click an OATP to block it or drag the orange inhibitor onto it.' + (W > 1.01 ? ' Each cytosol disc represents ' + fx(W) + ' blood-disc equivalents.' : '') + '</div>';
        qs('.ih', c6).textContent = nbk ? 'Remove inhibitor' : 'Inhibit uptake';
        api.stat('Kpuu ' + fx(R.kp) + ', CLh ' + R.r.cl.toFixed(2) + ' mL/min/kg, rate-determining step: ' + reg());
      }
      function labels(){ SL.forEach(function(r){ qs('.' + r[0] + 'v', r[1]).textContent = fx(Math.pow(10, S[r[0]])); }); }
      function sync(){ SL.forEach(function(r){ qs('.' + r[0], r[1]).value = S[r[0]]; }); }
      function changed(){ IX.save('tpx', S); labels(); rescale(); if (!ANIM) seed(); render(); }
      function render(){ labels(); draw(); panel(); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'hepatocyte-schematic',
        csv: function(){ var sm = sim(); return IX.csv([['Quantity', 'Equation', 'Simulated'], ['PSact (mL/min/kg)', R.ua, ''], ['PSdif (mL/min/kg)', R.pd, ''], ['CLint,met (mL/min/kg)', R.cm, ''], ['CLint,bile (mL/min/kg)', R.cb, ''], ['PSeff,act (mL/min/kg)', R.ef, ''], ['OATP sites blocked of 4', nblk(), ''], ['Kpuu', R.kp, sm.ok ? sm.kp : ''], ['Fraction metabolized', R.fm, sm.ok ? sm.fm : ''], ['Fraction to bile', R.fbi, sm.ok ? sm.fbi : ''], ['Fraction back to blood', R.fbk, sm.ok ? sm.fbk : ''], ['CLint,all (mL/min/kg)', R.r.all, ''], ['CLh (mL/min/kg)', R.r.cl, '']]); } });
      SL.forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; changed(); }); });
      qs('.ih', c6).addEventListener('click', function(){ S.k = nblk() ? 0 : 7; changed(); });
      qs('.rs', c6).addEventListener('click', function(){ seed(); render(); });
      function onOat(p){ var j; for (j = 0; j < 4; j++) if (Math.abs(p.x - GATE[j].x) < 18 && Math.abs(p.y - GATE[j].y) < 20) return j; return -1; }
      IX.attach(cvs, {
        move: function(p){ hov = hit(p); var o = onOat(p); cvs.style.cursor = Math.hypot(p.x - 144, p.y - 474) < 12 || (o >= 0 && blk(o)) ? 'grab' : (o >= 0 ? 'pointer' : 'default'); if (!ANIM) draw(); },
        leave: function(){ hov = null; if (!ANIM) draw(); },
        down: function(p){ var o = onOat(p); if (Math.hypot(p.x - 144, p.y - 474) < 12) { dragI = { x: p.x, y: p.y, from: -1, x0: p.x, y0: p.y }; return { k: 'inh' }; } if (o >= 0 && blk(o)) { S.k &= ~(1 << o); dragI = { x: p.x, y: p.y, from: o, x0: p.x, y0: p.y }; changed(); return { k: 'inh' }; } return null; },
        drag: function(d, p){ dragI.x = p.x; dragI.y = p.y; hov = null; if (!ANIM) draw(); },
        up: function(d, p){ var o = onOat(p), moved = Math.hypot(p.x - dragI.x0, p.y - dragI.y0) > 4; if (o >= 0 && (moved || o !== dragI.from)) S.k |= 1 << o; dragI = null; changed(); },
        click: function(p){ var o = onOat(p); if (o >= 0 && !blk(o)) { S.k |= 1 << o; changed(); } }
      });
      sync(); seed(); labels();
      SC.run(cvs, function(dt){ if (dt > 0) adv(dt); draw(); tside += dt; if (tside > 0.25) { tside = 0; panel(); } });
      return { render: render };
    } });
})();
