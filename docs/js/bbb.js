"use strict";
/* Tab 14: brain penetration. Total and unbound brain exposure (Kp, logBB, Kp,uu), efflux and Kp,uu, the measured logBB of 1,058 compounds and the
   BBB+ or BBB- label of 7,805 compounds (B3DB, Meng et al. 2021, CC0), with descriptors calculated here with RDKit (bbb_data.js). */
var BBBL = new Lesson('bbb', 'Brain penetration');
BBBL.noOpts = true;

(function(){
  var GREY = '#A1B1C4', POS = '#0F6E8C', NEG = '#B4561B';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function med(a){ var s = a.slice().sort(function(p, q){ return p - q; }); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; }
  var NP = BBB.filter(function(r){ return r.y === 1; }).length, N = BBB.length, LB = BBB.filter(function(r){ return r.lb !== null; });
  function conf(rule){ var o = { tp: 0, fn: 0, fp: 0, tn: 0 }; BBB.forEach(function(r){ var p = rule(r); if (r.y && p) o.tp++; else if (r.y) o.fn++; else if (p) o.fp++; else o.tn++; }); return o; }

  /* ===== step 1: total and unbound brain exposure ===== */
  BBBL.add({ short: 'Brain exposure measures', level: 'foundations', ord: 10, title: 'Total and unbound brain exposure',
    build: function(api){
      var S = IX.state('bb1', { kp: -0.3, fp: -1, fb: -1.7 }), hv = -1, M = null, G = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('kp', 'Kp', -2, 1, 0.05, S.kp)), c2 = api.addControl(IX.slider('fp', 'fu,p', -3, 0, 0.05, S.fp)), c3 = api.addControl(IX.slider('fb', 'fu,brain', -3, 0, 0.05, S.fb));
      function sync(){ qs('.kp', c1).value = S.kp; qs('.fp', c2).value = S.fp; qs('.fb', c3).value = S.fb; }
      function vals(){ var kp = Math.pow(10, S.kp), fp = Math.pow(10, S.fp), fb = Math.pow(10, S.fb); return { kp: kp, fp: fp, fb: fb, cb: kp, up: fp, ub: fb * kp, kpuu: kp * fb / fp }; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'brain-exposure', csv: function(){ var q = vals(); return IX.csv([['Quantity', 'Value'], ['Plasma total concentration (relative)', 1], ['Brain total concentration, Kp', q.cb], ['Plasma unbound concentration, fu,p', q.up], ['Brain unbound concentration, fu,brain x Kp', q.ub], ['logBB', Math.log10(q.kp)], ['Kp,uu', q.kpuu]]); } });
      var LO = -4, HI = 1;
      function draw(){
        var q = vals(); qs('.kpv', c1).textContent = fx(q.kp); qs('.fpv', c2).textContent = fx(q.fp); qs('.fbv', c3).textContent = fx(q.fb);
        var g = cv(cvs), x = g.x, box = { l: 70, r: g.w - 20, t: 40, b: g.h - 60 }, bw = (box.r - box.l) / 4; G = { box: box, bw: bw }; M = { x: x, box: box };
        function sy(v){ return box.b - (Math.log10(Math.max(v, 1e-9)) - LO) / (HI - LO) * (box.b - box.t); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; [-4, -3, -2, -1, 0, 1].forEach(function(e){ x.beginPath(); x.moveTo(box.l, sy(Math.pow(10, e))); x.lineTo(box.r, sy(Math.pow(10, e))); x.stroke(); x.fillText(String(Math.pow(10, e)), box.l - 6, sy(Math.pow(10, e)) + 4); });
        x.save(); x.translate(14, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Concentration relative to total plasma', 0, 0); x.restore();
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Total (grey) and unbound (teal) concentrations; drag the tops of the three right bars', box.l, 18);
        var bars = [['Plasma total', 1, GREY], ['Brain total', q.cb, GREY], ['Plasma unbound', q.up, POS], ['Brain unbound', q.ub, POS]];
        bars.forEach(function(b, i){ var bx = box.l + i * bw + bw * 0.16, w = bw * 0.68, y1 = sy(b[1]), y0 = sy(Math.pow(10, LO)); x.fillStyle = b[2]; x.globalAlpha = hv === i ? 1 : 0.88; x.fillRect(bx, y1, w, y0 - y1); x.globalAlpha = 1; x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(b[0], bx + w / 2, box.b + 18); x.fillText(fx(b[1]), bx + w / 2, y1 - 6); x.font = '12px Aptos, "Segoe UI", sans-serif'; if (i > 0) IX.dot(M, bx + w / 2, y1, 6, b[2] === GREY ? C.char : C.dred); });
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText('Kp = brain / plasma', box.l + 1.5 * bw, box.b + 36); x.fillText('Kp,uu = brain unbound / plasma unbound', box.l + 3 * bw, box.b + 36);
        if (hv >= 0) IX.tip(M, box.l + hv * bw + bw / 2, sy(bars[hv][1]), [bars[hv][0], fx(bars[hv][1]) + ' of the total plasma concentration', ['', 'Kp ' + fx(q.kp) + ', logBB ' + Math.log10(q.kp).toFixed(2), 'fu,p ' + fx(q.fp), 'fu,brain x Kp'][hv]].filter(function(t){ return t; }));
        var verdict = q.kpuu >= 0.5 ? 'near or above 0.5: little net efflux' : (q.kpuu >= 0.1 ? 'between 0.1 and 0.5: restricted' : 'below 0.1: strongly restricted');
        qs('.sd', side).innerHTML = fTile('Kp,uu', fx(q.kpuu), 'Kp x fu,brain / fu,p') + fRows([['Kp', fx(q.kp)], ['logBB = log10 Kp', Math.log10(q.kp).toFixed(2)], ['fu,p', fx(q.fp)], ['fu,brain', fx(q.fb)], ['Kp,uu', verdict]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">A high total Kp does not imply a high unbound exposure: binding in brain tissue raises Kp without raising Kp,uu.</div>';
        api.stat('Kp ' + fx(q.kp) + ', Kp,uu ' + fx(q.kpuu));
      }
      [['kp', c1], ['fp', c2], ['fb', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('bb1', S); draw(); }); });
      function hpos(i){ var q = vals(), v = [1, q.cb, q.up, q.ub][i]; return [G.box.l + i * G.bw + G.bw / 2, G.box.b - (Math.log10(v) - LO) / (HI - LO) * (G.box.b - G.box.t)]; }
      function hit(p){ var i, b = -1, bd = 14; for (i = 1; i < 4; i++) { var h = hpos(i), d = Math.hypot(p.x - h[0], p.y - h[1]); if (d < bd) { bd = d; b = i; } } return b; }
      IX.attach(cvs, {
        move: function(p){ if (!G) return; var i = hit(p); hv = i >= 0 ? i : ((p.x >= G.box.l && p.x <= G.box.r && p.y >= G.box.t && p.y <= G.box.b) ? Math.floor((p.x - G.box.l) / G.bw) : -1); cvs.style.cursor = i >= 0 ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var i = hit(p); return i >= 0 ? { k: i } : null; },
        drag: function(d, p){ var v = Math.pow(10, LO + (G.box.b - p.y) / (G.box.b - G.box.t) * (HI - LO)); if (d.k === 1) S.kp = cl(Math.round(Math.log10(v) * 20) / 20, -2, 1); else if (d.k === 2) S.fp = cl(Math.round(Math.log10(Math.min(v, 1)) * 20) / 20, -3, 0); else S.fb = cl(Math.round(Math.log10(Math.min(v / Math.pow(10, S.kp), 1)) * 20) / 20, -3, 0); sync(); draw(); },
        up: function(){ IX.save('bb1', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: efflux and Kp,uu ===== */
  BBBL.add({ short: 'Efflux and Kp,uu', level: 'foundations', ord: 20, title: 'Efflux and unbound brain exposure',
    build: function(api){
      var S = IX.state('bb2', { out: 1, inn: 0 }), pins = [], hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('out', 'Efflux clearance', -2, 3, 0.05, S.out, 'x passive (log10)')), c2 = api.addControl(IX.slider('inn', 'Active influx', 0, 20, 0.5, S.inn, 'x passive'));
      function sync(){ qs('.out', c1).value = S.out; qs('.inn', c2).value = S.inn; }
      function kpuu(o, ain){ return (1 + ain) / (1 + o); }
      IX.tools(api, { pin: function(){ pins.push({ out: S.out, inn: S.inn }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'efflux-and-kpuu', csv: function(){ var rows = [['Efflux clearance (x passive)', 'Kp,uu at the influx set', 'Kp,uu without active influx']], i; for (i = 0; i <= 100; i++) { var o = Math.pow(10, -2 + 5 * i / 100); rows.push([o, kpuu(o, S.inn), kpuu(o, 0)]); } return IX.csv(rows); } });
      function draw(){
        var o = Math.pow(10, S.out); qs('.outv', c1).textContent = fx(o); qs('.innv', c2).textContent = S.inn.toFixed(1);
        M = LL(cvs, { xr: [0.01, 1000], yr: [0.001, 30], ylog: true, xt: [0.01, 0.1, 1, 10, 100, 1000], yt: [0.001, 0.01, 0.1, 1, 10], xl: 'Active efflux clearance relative to passive clearance', yl: 'Kp,uu', series: [{ fn: function(v){ return kpuu(v, 0); }, color: GREY, w: 1.8, dash: [5, 4], label: 'no active influx' }, { fn: function(v){ return kpuu(v, S.inn); }, color: C.red, w: 2.8, label: 'influx set' }], pinned: pins.map(function(p){ return { fn: function(v){ return kpuu(v, p.inn); }, color: GREY, w: 1.4, dash: [2, 3] }; }) });
        IX.hline(M, M.sy(1), C.char, [4, 4]); lab(M, 'Kp,uu = 1', M.box.r - 4, M.sy(1) - 5, C.char, 'right'); IX.hline(M, M.sy(0.1), C.warn, [3, 4]); lab(M, '0.1', M.box.r - 4, M.sy(0.1) - 5, C.warn, 'right');
        var k = kpuu(o, S.inn); IX.vline(M, M.sx(o), C.char, [3, 4]); IX.dot(M, M.sx(o), M.sy(k), 7, C.red); lab(M, 'drag', M.sx(o) + 10, M.sy(k) + 16, C.red);
        if (hv !== null) { IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.tip(M, M.sx(hv), M.sy(kpuu(hv, S.inn)), ['efflux ' + fx(hv) + ' x passive', 'Kp,uu ' + fx(kpuu(hv, S.inn)), 'without influx ' + fx(kpuu(hv, 0))]); }
        qs('.sd', side).innerHTML = fTile('Kp,uu', fx(k), '(1 + influx) / (1 + efflux)') + fRows([['Net efflux ratio, 1 / Kp,uu', fx(1 / k)], ['Efflux over passive', fx(o)], ['Active influx over passive', S.inn.toFixed(1)], ['Brain unbound relative to plasma', (100 * k).toFixed(0) + ' percent']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">At steady state the unbound influx (P + A_in) Cu,p equals the unbound efflux (P + A_out) Cu,brain, with P the passive clearance. Drag the point: horizontal sets efflux, vertical sets active influx.</div>';
        api.stat('Kp,uu ' + fx(k) + ' at efflux ' + fx(o) + ' x passive');
      }
      qs('.out', c1).addEventListener('input', function(){ S.out = +this.value; IX.save('bb2', S); draw(); }); qs('.inn', c2).addEventListener('input', function(){ S.inn = +this.value; IX.save('bb2', S); draw(); });
      function dp(){ return [M.sx(Math.pow(10, S.out)), M.sy(kpuu(Math.pow(10, S.out), S.inn))]; }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; var d = dp(); cvs.style.cursor = Math.hypot(p.x - d[0], p.y - d[1]) < 12 ? 'move' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var d = dp(); return Math.hypot(p.x - d[0], p.y - d[1]) < 14 ? { k: 'pt' } : null; },
        drag: function(d, p){ var o = cl(M.ix(p.x), 0.01, 1000), k = M.iy(p.y); S.out = cl(Math.round(Math.log10(o) * 20) / 20, -2, 3); S.inn = cl(Math.round(Math.max(k * (1 + Math.pow(10, S.out)) - 1, 0) * 2) / 2, 0, 20); sync(); draw(); },
        up: function(){ IX.save('bb2', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: measured logBB ===== */
  BBBL.add({ short: 'Measured logBB', level: 'applied', ord: 30, title: 'Measured logBB of 1,058 compounds',
    build: function(api){
      var S = IX.state('bb3', { t: -1 }), hv = -1, M = null, NB = 40, LO = -3, HI = 2;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('t', 'Threshold on logBB', -2, 0.5, 0.05, S.t));
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'logbb-distribution', csv: function(){ var rows = [['Compound', 'logBB', 'BBB label (logBB of -1 or above)']]; LB.forEach(function(r){ rows.push([r.n, r.lb, r.lb >= S.t ? 'BBB+' : 'BBB-']); }); return IX.csv(rows); } });
      function draw(){
        qs('.tv', c1).textContent = S.t.toFixed(2); var cnt = new Array(NB).fill(0); LB.forEach(function(r){ cnt[cl(Math.floor((r.lb - LO) / (HI - LO) * NB), 0, NB - 1)]++; });
        var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 14, t: 26, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.12, bw = (box.r - box.l) / NB; M = { x: x, box: box };
        function bx(v){ return box.l + (v - LO) / (HI - LO) * (box.r - box.l); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('logBB of ' + LB.length + ' compounds (B3DB)', box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        cnt.forEach(function(n, k){ var mid = LO + (k + 0.5) * (HI - LO) / NB, hg = n / ym * (box.b - box.t); x.fillStyle = mid >= S.t ? POS : NEG; x.globalAlpha = k === hv ? 1 : 0.82; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [-3, -2, -1, 0, 1, 2].forEach(function(v){ var px = bx(v); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(v), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText('logBB = log10 (brain / plasma)', (box.l + box.r) / 2, g.h - 6);
        x.strokeStyle = C.char; x.lineWidth = 2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(bx(S.t), box.t); x.lineTo(bx(S.t), box.b); x.stroke(); x.setLineDash([]); IX.dot(M, bx(S.t), box.t, 6, C.char); lab(M, 'threshold ' + S.t.toFixed(2) + ' (drag)', bx(S.t) + 9, box.t + 14, C.char);
        if (hv >= 0) IX.tip(M, box.l + (hv + 0.5) * bw, box.b - cnt[hv] / ym * (box.b - box.t), [(LO + hv * (HI - LO) / NB).toFixed(2) + ' to ' + (LO + (hv + 1) * (HI - LO) / NB).toFixed(2), cnt[hv] + ' compounds']);
        var above = LB.filter(function(r){ return r.lb >= S.t; }).length;
        qs('.sd', side).innerHTML = fTile('Above the threshold', above + ' of ' + LB.length, (100 * above / LB.length).toFixed(0) + ' percent, labeled BBB+') + fRows([['Median logBB', med(LB.map(function(r){ return r.lb; })).toFixed(2)], ['Range', Math.min.apply(null, LB.map(function(r){ return r.lb; })).toFixed(2) + ' to ' + Math.max.apply(null, LB.map(function(r){ return r.lb; })).toFixed(2)], ['Median brain / plasma, 10^logBB', fx(Math.pow(10, med(LB.map(function(r){ return r.lb; }))))]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">B3DB labels a compound BBB+ when logBB is -1 or above, which is a brain to plasma ratio of 0.1. Drag the threshold line.</div>';
        api.stat(above + ' of ' + LB.length + ' compounds above logBB ' + S.t.toFixed(2));
      }
      qs('.t', c1).addEventListener('input', function(){ S.t = +this.value; IX.save('bb3', S); draw(); });
      function binAt(p){ if (p.x < M.box.l || p.x > M.box.r || p.y < M.box.t || p.y > M.box.b) return -1; return cl(Math.floor((p.x - M.box.l) / ((M.box.r - M.box.l) / NB)), 0, NB - 1); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = binAt(p); var tx = M.box.l + (S.t - LO) / (HI - LO) * (M.box.r - M.box.l); cvs.style.cursor = near(p.x, tx, 8) ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var tx = M.box.l + (S.t - LO) / (HI - LO) * (M.box.r - M.box.l); return near(p.x, tx, 9) ? { k: 't' } : null; },
        drag: function(d, p){ S.t = cl(Math.round((LO + (p.x - M.box.l) / (M.box.r - M.box.l) * (HI - LO)) * 20) / 20, -2, 0.5); qs('.t', c1).value = S.t; draw(); },
        up: function(){ IX.save('bb3', S); }
      });
      return { render: draw };
    } });

  /* ===== step 4: polar surface area and penetration ===== */
  BBBL.add({ short: 'Polar surface area and penetration', level: 'applied', ord: 40, title: 'Polar surface area and penetration',
    build: function(api){
      var S = IX.state('bb4', { t: 90 }), hvc = null, MA = null, MB = null, hp = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="440" style="width:436px;height:440px;cursor:crosshair"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="440" style="width:420px;height:440px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(IX.slider('t', 'TPSA cutoff', 20, 200, 1, S.t, 'A^2'));
      function rates(t){ var o = conf(function(r){ return r.tp <= t; }); return { acc: (o.tp + o.tn) / N, sens: o.tp / (o.tp + o.fn), spec: o.tn / (o.tn + o.fp), o: o }; }
      IX.tools(api, { canvases: function(){ return [ca, cb]; }, name: 'polar-surface-area', csv: function(){ var rows = [['TPSA cutoff', 'Accuracy', 'Sensitivity', 'Specificity']], t; for (t = 20; t <= 200; t += 5) { var r = rates(t); rows.push([t, r.acc, r.sens, r.spec]); } return IX.csv(rows); } });
      function drawA(){
        var g = cv(ca), x = g.x, box = { l: 50, r: g.w - 12, t: 16, b: g.h - 42 }; function sx(v){ return box.l + v / 200 * (box.r - box.l); } function sy(v){ return box.b - (v - 100) / 700 * (box.b - box.t); }
        MA = { x: x, box: box, sx: sx, sy: sy };
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; [100, 300, 500, 700].forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(String(v), box.l - 5, sy(v) + 4); }); x.textAlign = 'center'; [0, 50, 100, 150, 200].forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(String(v), sx(v), box.b + 16); });
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Topological polar surface area (A^2)', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Molecular weight (Da)', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
        var pts = []; BBB.forEach(function(r){ if (r.tp > 200 || r.mw > 800) return; var px = sx(r.tp), py = sy(r.mw); x.fillStyle = r.y ? POS : NEG; x.globalAlpha = 0.28; x.beginPath(); x.arc(px, py, 2.2, 0, 6.3); x.fill(); pts.push({ x: px, y: py, r: r, vx: r.tp, vy: r.mw }); }); x.globalAlpha = 1;
        ca._pts = pts; ca._g = g;
        x.strokeStyle = C.char; x.lineWidth = 2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(sx(S.t), box.t); x.lineTo(sx(S.t), box.b); x.stroke(); x.setLineDash([]); IX.dot(MA, sx(S.t), box.t, 6, C.char); lab(MA, 'cutoff ' + S.t + ' (drag)', sx(S.t) + 9, box.t + 14, C.char);
        lab(MA, 'BBB+', box.r - 4, box.t + 14, POS, 'right'); lab(MA, 'BBB-', box.r - 4, box.t + 28, NEG, 'right'); if (hp) { x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.arc(hp.x, hp.y, 6, 0, 6.3); x.stroke(); IX.tip(MA, hp.x, hp.y, [hp.r.n || 'unnamed', hp.r.y ? 'BBB+' : 'BBB-', 'TPSA ' + hp.r.tp + ', MW ' + hp.r.mw, 'donors ' + hp.r.hd + ', logP ' + hp.r.lp].concat(hp.r.lb !== null ? ['logBB ' + hp.r.lb] : [])); }
      }
      function draw(){
        qs('.tv', c1).textContent = S.t; drawA();
        var r0 = rates(S.t); MB = IX.chart(cb, { xr: [20, 200], yr: [0, 1], xl: 'TPSA cutoff (A^2)', yl: 'Rate', series: [{ fn: function(t){ return rates(t).sens; }, color: POS, w: 2.4, label: 'Sensitivity' }, { fn: function(t){ return rates(t).spec; }, color: NEG, w: 2.4, label: 'Specificity' }, { fn: function(t){ return rates(t).acc; }, color: C.char, w: 2.8, label: 'Accuracy' }] });
        IX.hline(MB, MB.sy(NP / N), C.mid, [3, 4]); lab(MB, 'all BBB+: ' + (100 * NP / N).toFixed(0) + '%', MB.box.r - 4, MB.sy(NP / N) - 5, C.mid, 'right'); IX.vline(MB, MB.sx(S.t), C.char, [4, 4]); IX.dot(MB, MB.sx(S.t), MB.sy(r0.acc), 6, C.char);
        if (hvc !== null) { var rr = rates(hvc); IX.vline(MB, MB.sx(hvc), C.mid, [2, 3]); IX.tip(MB, MB.sx(hvc), MB.sy(rr.acc), ['TPSA ' + hvc.toFixed(0), 'accuracy ' + rr.acc.toFixed(3), 'sensitivity ' + rr.sens.toFixed(3), 'specificity ' + rr.spec.toFixed(3)]); }
        var pos = BBB.filter(function(r){ return r.y === 1; }).map(function(r){ return r.tp; }), neg = BBB.filter(function(r){ return r.y === 0; }).map(function(r){ return r.tp; });
        qs('.ra', pn).innerHTML = 'Median TPSA is <b>' + med(pos).toFixed(0) + ' A^2</b> for BBB+ (n = ' + pos.length + ') and <b>' + med(neg).toFixed(0) + ' A^2</b> for BBB- (n = ' + neg.length + ').';
        qs('.rb', pn2).innerHTML = 'TPSA of ' + S.t + ' A^2 or below calls <b>' + (r0.o.tp + r0.o.fp) + '</b> compounds BBB+: accuracy <b>' + r0.acc.toFixed(3) + '</b>, sensitivity ' + r0.sens.toFixed(2) + ', specificity ' + r0.spec.toFixed(2) + '.';
        api.stat('TPSA cutoff ' + S.t + ': accuracy ' + r0.acc.toFixed(3));
      }
      qs('.t', c1).addEventListener('input', function(){ S.t = +this.value; IX.save('bb4', S); draw(); });
      IX.attach(ca, {
        move: function(p){ if (!MA) return; var b = null, bd = 7; (ca._pts || []).forEach(function(q){ var d = Math.abs(q.x - p.x) + Math.abs(q.y - p.y); if (d < bd) { bd = d; b = q; } }); hp = b; ca.style.cursor = near(p.x, MA.sx(S.t), 8) ? 'ew-resize' : (b ? 'pointer' : 'crosshair'); draw(); },
        leave: function(){ hp = null; draw(); },
        down: function(p){ return near(p.x, MA.sx(S.t), 9) ? { k: 't' } : null; },
        drag: function(d, p){ S.t = cl(Math.round((p.x - MA.box.l) / (MA.box.r - MA.box.l) * 200), 20, 200); qs('.t', c1).value = S.t; draw(); },
        up: function(){ IX.save('bb4', S); }
      });
      IX.attach(cb, {
        move: function(p){ if (!MB) return; hvc = MB.inside(p) ? MB.ix(p.x) : null; cb.style.cursor = near(p.x, MB.sx(S.t), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hvc = null; draw(); },
        down: function(p){ return near(p.x, MB.sx(S.t), 9) ? { k: 't' } : null; },
        drag: function(d, p){ S.t = cl(Math.round(MB.ix(p.x)), 20, 200); qs('.t', c1).value = S.t; draw(); },
        up: function(){ IX.save('bb4', S); }
      });
      return { render: draw };
    } });

  /* ===== step 5: combined property rule ===== */
  BBBL.add({ short: 'Combined property rule', level: 'applied', ord: 50, title: 'Combined property rule',
    build: function(api){
      var S = IX.state('bb5', { t: 90, h: 3, m: 450 }), hv = -1, M = null, G = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('t', 'TPSA at most', 20, 200, 1, S.t, 'A^2')), c2 = api.addControl(IX.slider('h', 'Donors at most', 0, 8, 1, S.h)), c3 = api.addControl(IX.slider('m', 'MW at most', 200, 800, 10, S.m, 'Da'));
      function sync(){ qs('.t', c1).value = S.t; qs('.h', c2).value = S.h; qs('.m', c3).value = S.m; }
      function rules(){ return [['All BBB+', function(){ return true; }], ['TPSA', function(r){ return r.tp <= S.t; }], ['TPSA and donors', function(r){ return r.tp <= S.t && r.hd <= S.h; }], ['TPSA, donors and MW', function(r){ return r.tp <= S.t && r.hd <= S.h && r.mw <= S.m; }]]; }
      function stats(f){ var o = conf(f); return { acc: (o.tp + o.tn) / N, sens: o.tp / (o.tp + o.fn), spec: o.tn / (o.tn + o.fp), o: o }; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'combined-property-rule', csv: function(){ var rows = [['Rule', 'Accuracy', 'Sensitivity', 'Specificity', 'TP', 'FN', 'FP', 'TN']]; rules().forEach(function(r){ var s = stats(r[1]); rows.push([r[0], s.acc, s.sens, s.spec, s.o.tp, s.o.fn, s.o.fp, s.o.tn]); }); rows.push([], ['TPSA at most', S.t], ['Donors at most', S.h], ['MW at most', S.m]); return IX.csv(rows); } });
      function draw(){
        qs('.tv', c1).textContent = S.t; qs('.hv', c2).textContent = S.h; qs('.mv', c3).textContent = S.m;
        var g = cv(cvs), x = g.x, box = { l: 56, r: g.w - 20, t: 36, b: g.h - 56 }, R = rules(), gw = (box.r - box.l) / R.length, bw = (gw - 26) / 3; G = { box: box, gw: gw }; M = { x: x, box: box };
        function sy(v){ return box.b - v * (box.b - box.t); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(v.toFixed(2), box.l - 6, sy(v) + 4); });
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Accuracy, sensitivity and specificity of nested rules on ' + N.toLocaleString() + ' compounds', box.l, 18);
        var all = [];
        R.forEach(function(r, i){ var s = stats(r[1]); all.push(s); [['acc', C.char], ['sens', POS], ['spec', NEG]].forEach(function(m, j){ var bx = box.l + i * gw + 13 + j * bw, v = s[m[0]]; x.fillStyle = m[1]; x.globalAlpha = hv === i ? 1 : 0.88; x.fillRect(bx, sy(v), bw - 3, box.b - sy(v)); x.globalAlpha = 1; x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText(v.toFixed(2), bx + (bw - 3) / 2, sy(v) - 4); }); x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillStyle = C.char; x.fillText(r[0], box.l + i * gw + gw / 2, box.b + 18); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
        var lx = box.l; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; [['Accuracy', C.char], ['Sensitivity', POS], ['Specificity', NEG]].forEach(function(l){ x.fillStyle = l[1]; x.fillRect(lx, g.h - 22, 12, 10); x.fillStyle = C.char; x.fillText(l[0], lx + 16, g.h - 13); lx += 100; }); x.font = '12px Aptos, "Segoe UI", sans-serif';
        if (hv >= 0) { var s2 = all[hv]; IX.tip(M, box.l + hv * gw + gw / 2, sy(s2.acc), [R[hv][0], 'TP ' + s2.o.tp + ', FN ' + s2.o.fn, 'FP ' + s2.o.fp + ', TN ' + s2.o.tn]); }
        var s3 = all[3];
        qs('.sd', side).innerHTML = fTile('Accuracy of the full rule', s3.acc.toFixed(3), 'TPSA, donors and MW') + fRows([['Compounds called BBB+', s3.o.tp + s3.o.fp], ['BBB+ found', s3.o.tp + ' of ' + (s3.o.tp + s3.o.fn)], ['BBB- rejected', s3.o.tn + ' of ' + (s3.o.tn + s3.o.fp)], ['Baseline, call every compound BBB+', (NP / N).toFixed(3)]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Rules are applied in sequence: each bar group adds one descriptor to the previous rule.</div>';
        api.stat('Full rule accuracy ' + s3.acc.toFixed(3) + ' against ' + (NP / N).toFixed(3) + ' for calling every compound BBB+');
      }
      [['t', c1], ['h', c2], ['m', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('bb5', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!G) return; hv = (p.x >= G.box.l && p.x <= G.box.r && p.y >= G.box.t && p.y <= G.box.b) ? Math.floor((p.x - G.box.l) / G.gw) : -1; draw(); },
        leave: function(){ hv = -1; draw(); }
      });
      sync();
      return { render: draw };
    } });
})();
