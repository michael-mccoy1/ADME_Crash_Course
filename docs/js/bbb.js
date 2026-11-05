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

  /* ===== step 0: blood-brain barrier schematic =====
     Stochastic compartment model of N independent molecules, simulated exactly in continuous time (each molecule draws an exponential waiting time).
     States: 0 plasma unbound, 1 plasma bound, 2 endothelial cell, 3 brain unbound, 4 brain bound; all compartment volumes 1, so counts are concentrations.
     Per-molecule rates (1/s, passive clearance P): 0 -> 2 P (+ A_in), 2 -> 0 P (+ A_out via P-gp), 2 -> 3 P, 3 -> 2 P; binding koff = 2, kon = koff (1 - fu) / fu.
     Steady state: C_cell = Cu,brain and (P + A_in) Cu,p = (P + A_out) Cu,brain, so Kp,uu = (1 + A_in/P) / (1 + A_out/P) as in step 2. */
  BBBL.add({ short: 'Barrier schematic', level: 'foundations', ord: 5, title: 'Blood-brain barrier schematic',
    build: function(api){
      var S = IX.state('bbx', { p: 1, ao: 3, ai: 0, fp: -1, fb: -1.3, inh: 0 });
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('p', 'Passive P', 0.25, 2, 0.05, S.p, 'x reference')), c2 = api.addControl(IX.slider('ao', 'Efflux A_out/P', 0, 30, 0.5, S.ao)), c3 = api.addControl(IX.slider('ai', 'Influx A_in/P', 0, 10, 0.5, S.ai));
      var c4 = api.addControl(IX.slider('fp', 'fu,p', -1.3, 0, 0.05, S.fp)), c5 = api.addControl(IX.slider('fb', 'fu,brain', -1.7, 0, 0.05, S.fb));
      var c6 = api.addControl('<label style="cursor:pointer"><input type="checkbox" class="inh"' + (S.inh ? ' checked' : '') + '> Inhibit P-gp</label>');
      var c7 = api.addControl('<button type="button" class="btn sm ghost ff">Fast-forward 2,000 s</button> <button type="button" class="btn sm ghost rs">Empty brain</button>');
      var NM = 260, KOFF = 2, BATCH = 5, DTS = 0.5, WIN = 240, FF = 2000;
      var BLD = { l: 8, r: 246, t: 40, b: 306 }, BRN = { l: 364, r: 616, t: 40, b: 306 };
      var BOX = [{ l: 14, r: 238, t: 46, b: 300 }, null, { l: 262, r: 350, t: 74, b: 272 }, { l: 374, r: 610, t: 46, b: 300 }, null];
      var LUM = 250, ABL = 360, PUMP = { y: 122 }, CARR = { y: 228 }, BOUND = SC.mix(C.bg, C.char, 0.45), MEM = SC.mix(C.light, C.bg, 0.65), FAINT = SC.mix(C.char, '#FFFFFF', 0.3);
      var NAMES = ['unbound in plasma', 'bound to plasma protein', 'in the endothelial cell', 'unbound in brain', 'bound to brain tissue'];
      var rnd = SC.rand(14), PROT = [], SITE = [], MOL = [], CNT = [0, 0, 0, 0, 0], R = [], TOT = [], T = 0, nextS = DTS;
      var occ = [0, 0, 0, 0, 0], bT = 0, batches = [], hist = [], marks = [], emaR = 0, emaB = 0, flashP = 0, flashC = 0, hov = null, hovM = null, loop = null, lastSide = 0, M = null;
      (function(){ var tries = 0; while (PROT.length < 10 && tries++ < 2000) { var q = { x: 34 + rnd() * 186, y: 52 + rnd() * 246, r: 12 + rnd() * 4, rot: rnd() * 3 }; if (PROT.every(function(o){ return Math.hypot(o.x - q.x, o.y - q.y) > 42; })) PROT.push(q); } })();
      [0, 1, 2].forEach(function(i){ [0, 1, 2, 3].forEach(function(j){ SITE.push({ x: 410 + i * 80 + (rnd() - 0.5) * 16, y: 78 + j * 63 + (rnd() - 0.5) * 12, w: 40 + rnd() * 10, h: 22 + rnd() * 6 }); }); });
      function fu(){ return [Math.pow(10, S.fp), Math.pow(10, S.fb)]; }
      function aOut(){ return S.inh ? 0 : S.ao; }
      function kpuuEq(){ return (1 + S.ai) / (1 + aOut()); }
      function expo(r){ return r > 0 ? -Math.log(1 - Math.random()) / r : Infinity; }
      function rs(){ return Math.random() - 0.5; }
      function pt(b){ return { x: b.l + Math.random() * (b.r - b.l), y: b.t + Math.random() * (b.b - b.t) }; }
      function rebuild(){ var f = fu(), p = S.p;
        R = [[[1, KOFF * (1 - f[0]) / f[0], 'bind'], [2, p, 'pass'], [2, p * S.ai, 'in']], [[0, KOFF, 'unbind']], [[0, p, 'pass'], [3, p, 'pass'], [0, p * aOut(), 'eff']], [[4, KOFF * (1 - f[1]) / f[1], 'bind'], [2, p, 'pass']], [[3, KOFF, 'unbind']]];
        TOT = R.map(function(L){ return L.reduce(function(a, e){ return a + e[1]; }, 0); }); }
      function hostPos(m){ if (m.s === 1) { var q = PROT[m.host]; return { x: q.x + Math.cos(m.a) * (q.r * 1.25 + 3 + m.j * 2), y: q.y + Math.sin(m.a) * (q.r + 3 + m.j * 2) }; } var st = SITE[m.host]; return { x: st.x + (m.a / 6.2832 - 0.5) * (st.w - 8), y: st.y + (m.j - 0.5) * (st.h - 8) }; }
      function pickHost(m, list, vis){ if (!vis) return Math.floor(Math.random() * list.length); var b = 0, bd = 1e9, k; for (k = 0; k < 4; k++) { var i = Math.floor(Math.random() * list.length), d = Math.hypot(list[i].x - m.x, list[i].y - m.y); if (d < bd) { bd = d; b = i; } } return b; }
      function place(m){ m.path = []; if (m.s === 1 || m.s === 4) { var h = hostPos(m); m.x = h.x; m.y = h.y; } else { var q = pt(BOX[m.s]); m.x = q.x; m.y = q.y; } }
      function yNear(y){ y = cl(y + rs() * 30, 76, 270); if (Math.abs(y - PUMP.y) < 24) y = PUMP.y + (y < PUMP.y ? -24 : 24); if (Math.abs(y - CARR.y) < 22) y = CARR.y + (y < CARR.y ? -22 : 22); return y; }
      function hop(m, vis){
        var L = R[m.s], u = Math.random() * TOT[m.s], k = 0;
        while (k < L.length - 1 && (u >= L[k][1] || L[k][1] === 0)) { u -= L[k][1]; k++; }
        while (L[k][1] === 0 && k > 0) k--;
        var from = m.s, to = L[k][0], kind = L[k][2], y;
        CNT[from]--; CNT[to]++; m.s = to; m.host = (to === 1 || to === 4) ? pickHost(m, to === 1 ? PROT : SITE, vis) : -1;
        if (kind === 'eff') flashP = 1; if (kind === 'in') flashC = 1;
        if (!vis) { m.path = []; return; }
        if (from === 0 && to === 2) { if (kind === 'in') m.path = [{ x: 232, y: CARR.y }, { x: 268, y: CARR.y }, pt(BOX[2])]; else { y = yNear(m.y); m.path = [{ x: 243, y: y }, { x: 257, y: y }, { x: 266 + Math.random() * 40, y: cl(y + rs() * 24, 76, 270) }]; } }
        else if (from === 2 && to === 0) { if (kind === 'eff') m.path = [{ x: 268, y: PUMP.y }, { x: 232, y: PUMP.y }, { x: 196 + Math.random() * 34, y: PUMP.y + rs() * 40 }]; else { y = yNear(m.y); m.path = [{ x: 257, y: y }, { x: 243, y: y }, { x: 206 + Math.random() * 28, y: y }]; } }
        else if (from === 2 && to === 3) { y = cl(m.y + rs() * 30, 76, 270); m.path = [{ x: 353, y: y }, { x: 367, y: y }, { x: 380 + Math.random() * 36, y: y }]; }
        else if (from === 3 && to === 2) { y = cl(m.y + rs() * 30, 76, 270); m.path = [{ x: 367, y: y }, { x: 353, y: y }, { x: 304 + Math.random() * 40, y: y }]; }
        else { m.path = []; if (kind === 'unbind') { m.vx = rs() * 80; m.vy = rs() * 80; } }
      }
      function sample(){
        var a = DTS / 6, bt = CNT[0] + CNT[1]; emaR += a * (CNT[3] - emaR); emaB += a * (CNT[0] - emaB);
        hist.push({ t: T, kp: bt ? (CNT[3] + CNT[4]) / bt : NaN, uu: emaB > 0.05 ? emaR / emaB : NaN }); if (hist.length > WIN / DTS + 2) hist.shift();
        bT += DTS; if (bT >= BATCH - 1e-9) { batches.push(occ); occ = [0, 0, 0, 0, 0]; bT = 0; }
      }
      function advance(H, vis){
        var end = T + H, i, m, nb;
        while (T < end - 1e-9) {
          nb = Math.min(end, nextS);
          for (i = 0; i < MOL.length; i++) { m = MOL[i];
            if (m.held) { m.tl = nb; if (m.tn < nb) m.tn = nb; continue; }
            while (m.tn < nb) { occ[m.s] += m.tn - m.tl; m.tl = m.tn; hop(m, vis); m.tn = m.tl + expo(TOT[m.s]); }
            occ[m.s] += nb - m.tl; m.tl = nb;
          }
          T = nb; if (T >= nextS - 1e-9) { sample(); nextS += DTS; }
        }
      }
      function resetEst(){ batches = []; occ = [0, 0, 0, 0, 0]; bT = 0; }
      function populate(empty){
        var f = fu(), K = empty ? 0 : kpuuEq(), w = [1, (1 - f[0]) / f[0], K, K, K * (1 - f[1]) / f[1]], sw = w.reduce(function(a, b){ return a + b; }, 0), i;
        CNT = [0, 0, 0, 0, 0]; if (!MOL.length) for (i = 0; i < NM; i++) MOL.push({ s: 0, x: 0, y: 0, vx: 0, vy: 0, path: [], host: -1, a: Math.random() * 6.2832, j: Math.random(), tl: 0, tn: 0, held: false });
        MOL.forEach(function(m){ var u = Math.random() * sw, s = 0; while (s < 4 && u >= w[s]) { u -= w[s]; s++; } if (w[s] === 0) s = 0; m.s = s; CNT[s]++; m.held = false; m.host = s === 1 ? Math.floor(Math.random() * PROT.length) : (s === 4 ? Math.floor(Math.random() * SITE.length) : -1); m.tl = T; m.tn = T + expo(TOT[s]); place(m); });
        emaR = CNT[3]; emaB = CNT[0]; resetEst();
      }
      function mark(label){ var lm = marks[marks.length - 1]; if (lm && !label && !lm.label && T - lm.t < 3) lm.t = T; else marks.push({ t: T, label: label || '' }); if (marks.length > 30) marks.shift(); }
      function changed(label){ rebuild(); MOL.forEach(function(m){ if (!m.held) { m.tl = T; m.tn = T + expo(TOT[m.s]); } }); resetEst(); mark(label); IX.save('bbx', S); }
      function est(){
        var n = batches.length; if (n < 4) return null;
        var ret = batches.slice(Math.floor(n * 0.25)), su = [0, 0, 0, 0, 0], se = null, G, gs, rr = [], i, k;
        ret.forEach(function(b){ for (k = 0; k < 5; k++) su[k] += b[k]; });
        var uu = su[0] > 0 ? su[3] / su[0] : NaN, kp = (su[0] + su[1]) > 0 ? (su[3] + su[4]) / (su[0] + su[1]) : NaN;
        G = Math.min(10, Math.floor(ret.length / 3));
        if (G >= 4 && isFinite(uu)) { gs = Math.floor(ret.length / G); for (i = 0; i < G; i++) { var a = 0, b = 0; ret.slice(i * gs, (i + 1) * gs).forEach(function(q){ a += q[3]; b += q[0]; }); if (b > 0) rr.push(a / b); }
          if (rr.length >= 4) { var mu = rr.reduce(function(p, q){ return p + q; }, 0) / rr.length, v = rr.reduce(function(p, q){ return p + (q - mu) * (q - mu); }, 0) / (rr.length - 1); se = 100 * Math.sqrt(v / rr.length) / uu; } }
        return { uu: uu, kp: kp, se: se, dur: ret.length * BATCH };
      }
      function move(dt){
        PROT.forEach(function(q){ q.y += 10 * dt; if (q.y > BLD.b + 18) q.y = BLD.t - 18; });
        flashP = Math.max(0, flashP - 3 * dt); flashC = Math.max(0, flashC - 3 * dt);
        var sp = 260 * dt;
        MOL.forEach(function(m){
          if (m.held) return; var dx, dy, d;
          if (m.path.length) { var w = m.path[0]; dx = w.x - m.x; dy = w.y - m.y; d = Math.hypot(dx, dy); if (d <= sp) { m.x = w.x; m.y = w.y; m.path.shift(); } else { m.x += dx / d * sp; m.y += dy / d * sp; } return; }
          if (m.s === 1 || m.s === 4) { var hp = hostPos(m); dx = hp.x - m.x; dy = hp.y - m.y; d = Math.hypot(dx, dy); if (d > 90 || d <= sp) { m.x = hp.x; m.y = hp.y; } else { m.x += dx / d * sp; m.y += dy / d * sp; } return; }
          var b = BOX[m.s]; m.vx = m.vx * 0.9 + rs() * 36; m.vy = m.vy * 0.9 + rs() * 36; m.x += m.vx * dt; m.y += (m.vy + (m.s === 0 ? 10 : 0)) * dt;
          if (m.x < b.l) { m.x = b.l; m.vx = Math.abs(m.vx); } if (m.x > b.r) { m.x = b.r; m.vx = -Math.abs(m.vx); }
          if (m.y < b.t) { m.y = b.t; m.vy = Math.abs(m.vy); } if (m.y > b.b) { if (m.s === 0) m.y = b.t; else { m.y = b.b; m.vy = -Math.abs(m.vy); } }
        });
      }
      function verdict(k){ return k < 0.7 ? 'restricted by efflux (Kp,uu below 0.7)' : (k <= 1.4 ? 'passive equilibrium (Kp,uu 0.7 to 1.4)' : 'active uptake (Kp,uu above 1.4)'); }
      function labels(){ var f = fu(); qs('.pv', c1).textContent = S.p.toFixed(2); qs('.aov', c2).textContent = S.ao.toFixed(1) + (S.inh ? ' (inhibited)' : ''); qs('.aiv', c3).textContent = S.ai.toFixed(1); qs('.fpv', c4).textContent = fx(f[0]); qs('.fbv', c5).textContent = fx(f[1]); }
      function upSide(){
        var e = est(), eq = kpuuEq(), f = fu(), kq = eq * f[0] / f[1], ok = e && isFinite(e.uu), diff = ok ? 100 * (e.uu - eq) / eq : NaN;
        labels();
        qs('.sd', side).innerHTML = fTile('Kp,uu simulated', ok ? fx(e.uu) : 'averaging', 'equation ' + fx(eq) + (ok ? ', difference ' + (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' percent' : ', needs 20 s of simulated time')) +
          fRows([['Kp,uu equation, (1 + A_in/P) / (1 + A_out/P)', fx(eq)], ['Standard error of simulated Kp,uu', ok && e.se !== null ? e.se.toFixed(1) + ' percent' : 'pending'], ['Averaged over', (e ? Math.round(e.dur) : batches.length * BATCH) + ' s'],
            ['Kp simulated, brain / plasma total', e && isFinite(e.kp) ? fx(e.kp) : 'pending'], ['Kp equation, Kp,uu x fu,p / fu,brain', fx(kq)], ['logBB, log10 Kp', Math.log10(kq).toFixed(2)], ['Molecules in plasma, cell, brain', (CNT[0] + CNT[1]) + ', ' + CNT[2] + ', ' + (CNT[3] + CNT[4])], ['Verdict', verdict(eq)]]) +
          '<div class="hint" style="font-size:11.5px;margin-top:8px">Fast-forward advances the same stochastic model by 2,000 s without drawing. The estimate uses the last 75 percent of 5 s batches since the last change. Click the pump to inhibit P-gp; drag a molecule into another compartment.</div>';
        api.stat('Kp,uu equation ' + fx(eq) + (ok ? ', simulated ' + fx(e.uu) : '') + '; Kp ' + fx(kq) + ', logBB ' + Math.log10(kq).toFixed(2));
      }
      function draw(){
        var g = cv(cvs), x = g.x, f = fu(), ao = aOut(), eq = kpuuEq(), k, i; M = { x: x, box: { l: 0, r: g.w, t: 0, b: g.h } };
        SC.text(x, 'Drug exchange across one brain capillary endothelial cell', 8, 16, { bold: true });
        SC.text(x, 'simulated time ' + Math.round(T) + ' s', 616, 16, { align: 'right', size: 11 });
        SC.text(x, 'Blood (plasma)', 127, 33, { bold: true, align: 'center' }); SC.text(x, 'Endothelial cell', 305, 33, { bold: true, align: 'center' }); SC.text(x, 'Brain parenchyma', 490, 33, { bold: true, align: 'center' });
        SC.rr(x, BLD.l, BLD.t, BLD.r - BLD.l, BLD.b - BLD.t, 6); x.fillStyle = SC.mix('#FFFFFF', C.warn, 0.09); x.fill();
        SC.rr(x, BRN.l, BRN.t, BRN.r - BRN.l, BRN.b - BRN.t, 6); x.fillStyle = SC.mix('#FFFFFF', C.tint, 0.25); x.fill();
        x.fillStyle = SC.mix('#FFFFFF', C.bg, 0.2); x.fillRect(BLD.r, BLD.t, BRN.l - BLD.r, BLD.b - BLD.t);
        /* plasma proteins drift with blood flow; tissue binding sites are fixed */
        x.save(); x.beginPath(); x.rect(BLD.l, BLD.t, BLD.r - BLD.l, BLD.b - BLD.t); x.clip();
        PROT.forEach(function(q){ x.beginPath(); x.ellipse(q.x, q.y, q.r * 1.25, q.r, q.rot, 0, 6.2832); x.fillStyle = C.silver; x.fill(); x.lineWidth = 1.2; x.strokeStyle = C.bg; x.stroke(); });
        x.restore();
        SITE.forEach(function(st){ SC.rr(x, st.x - st.w / 2, st.y - st.h / 2, st.w, st.h, 8); x.fillStyle = C.silver; x.fill(); x.lineWidth = 1.2; x.strokeStyle = C.bg; x.stroke(); });
        /* endothelial cell and its two neighbors; the membranes are 8 px bands */
        x.save(); x.beginPath(); x.rect(BLD.r, BLD.t, BRN.l - BLD.r, BLD.b - BLD.t); x.clip();
        [[20, 32], [68, 210], [294, 36]].forEach(function(c){ SC.rr(x, LUM, c[0], ABL - LUM, c[1], 10); x.fillStyle = C.light; x.fill(); x.lineWidth = 8; x.strokeStyle = MEM; x.stroke(); });
        x.restore();
        x.fillStyle = SC.mix(C.bg, C.char, 0.3); for (k = 74; k <= 272; k += 5) [247, 253, 357, 363].forEach(function(px){ x.beginPath(); x.arc(px, k, 1.3, 0, 6.2832); x.fill(); });
        [60, 286].forEach(function(yc){ for (k = 0; k < 4; k++) { SC.rr(x, 256 + k * 7, yc - 5, 4, 10, 2); x.fillStyle = C.char; x.fill(); } });
        x.strokeStyle = C.char; x.lineWidth = 1; x.beginPath(); x.moveTo(278, 76); x.lineTo(270, 65); x.moveTo(278, 260); x.lineTo(270, 281); x.stroke();
        SC.text(x, 'tight junction', 270, 87, { bold: true, size: 11 }); SC.text(x, 'tight junction', 270, 257, { bold: true, size: 11 });
        /* P-gp efflux pump and influx carrier in the luminal membrane */
        x.globalAlpha = S.inh ? 0.3 : 1; SC.rr(x, 238, PUMP.y - 20, 24, 40, 7); x.fillStyle = C.warn; x.fill(); x.fillStyle = '#FFFFFF'; x.fillRect(248.5, PUMP.y - 14, 3, 28); x.globalAlpha = 1;
        if (S.inh) { x.strokeStyle = C.char; x.lineWidth = 2.4; x.beginPath(); x.moveTo(236, PUMP.y - 16); x.lineTo(264, PUMP.y + 16); x.moveTo(264, PUMP.y - 16); x.lineTo(236, PUMP.y + 16); x.stroke(); }
        else { SC.arrow(x, 234, PUMP.y, 214, PUMP.y, C.warn, 2, 7); if (flashP > 0) { x.globalAlpha = flashP; x.strokeStyle = C.warn; x.lineWidth = 2; SC.rr(x, 234, PUMP.y - 24, 32, 48, 9); x.stroke(); x.globalAlpha = 1; } }
        x.globalAlpha = S.ai > 0 ? 1 : 0.3; SC.rr(x, 238, CARR.y - 18, 24, 36, 7); x.fillStyle = C.dred; x.fill(); x.fillStyle = '#FFFFFF'; x.fillRect(248.5, CARR.y - 12, 3, 24); x.globalAlpha = 1;
        if (S.ai > 0) { SC.arrow(x, 214, CARR.y, 234, CARR.y, C.dred, 2, 7); if (flashC > 0) { x.globalAlpha = flashC; x.strokeStyle = C.dred; x.lineWidth = 2; SC.rr(x, 234, CARR.y - 22, 32, 44, 9); x.stroke(); x.globalAlpha = 1; } }
        SC.text(x, S.inh ? 'P-gp inhibited' : 'P-gp efflux', 268, PUMP.y - 3, { bold: true, size: 11, color: C.warn }); SC.text(x, 'A_out/P = ' + ao.toFixed(1), 268, PUMP.y + 12, { size: 11 });
        SC.text(x, S.ai > 0 ? 'influx carrier' : 'influx carrier off', 268, CARR.y - 3, { bold: true, size: 11, color: S.ai > 0 ? C.dred : FAINT }); SC.text(x, 'A_in/P = ' + S.ai.toFixed(1), 268, CARR.y + 12, { size: 11 });
        /* drug molecules */
        MOL.forEach(function(m){ var bd = m.s === 1 || m.s === 4; SC.dot(x, m.x, m.y, bd ? 3.5 : 4, bd ? BOUND : C.red, '#FFFFFF'); });
        if (hovM) { x.strokeStyle = C.char; x.lineWidth = 1.5; x.beginPath(); x.arc(hovM.x, hovM.y, 7, 0, 6.2832); x.stroke(); }
        /* counts and legend */
        SC.text(x, 'unbound ' + CNT[0] + ', bound ' + CNT[1], 104, 322, { size: 11, align: 'center' }); SC.text(x, 'in cell ' + CNT[2], 305, 322, { size: 11, align: 'center' }); SC.text(x, 'unbound ' + CNT[3] + ', bound ' + CNT[4], 530, 322, { size: 11, align: 'center' });
        x.strokeStyle = FAINT; x.lineWidth = 1; x.beginPath(); x.moveTo(LUM, 307); x.lineTo(LUM, 313); x.moveTo(ABL, 307); x.lineTo(ABL, 313); x.stroke();
        var lx = 8; x.font = '11px Aptos, "Segoe UI", sans-serif';
        [['d', C.red, 'unbound drug'], ['d', BOUND, 'bound drug'], ['e', C.silver, 'plasma protein'], ['r', C.silver, 'tissue binding site'], ['r', C.warn, 'P-gp'], ['r', C.dred, 'influx carrier']].forEach(function(l){
          if (l[0] === 'd') SC.dot(x, lx + 5, 338, 4, l[1], '#FFFFFF'); else if (l[0] === 'e') { x.beginPath(); x.ellipse(lx + 6, 338, 7, 5, 0, 0, 6.2832); x.fillStyle = l[1]; x.fill(); x.strokeStyle = C.bg; x.lineWidth = 1; x.stroke(); }
          else { SC.rr(x, lx, 333, 12, 10, 3); x.fillStyle = l[1]; x.fill(); if (l[1] === C.silver) { x.strokeStyle = C.bg; x.lineWidth = 1; x.stroke(); } }
          SC.text(x, l[2], lx + 16, 342, { size: 11 }); lx += 16 + x.measureText(l[2]).width + 12; });
        /* time course of the simulated ratios against the equation */
        var cb = { l: 52, r: 612, t: 358, b: 450 }, tmax = Math.max(T, WIN), tmin = tmax - WIN;
        function sx(t){ return cb.l + (t - tmin) / WIN * (cb.r - cb.l); }
        function sy(v){ return cb.b - (cl(Math.log10(Math.max(v, 1e-4)), -2, 2) + 2) / 4 * (cb.b - cb.t); }
        x.lineWidth = 1; x.strokeStyle = C.silver; [0.01, 0.1, 1, 10, 100].forEach(function(v){ x.beginPath(); x.moveTo(cb.l, sy(v)); x.lineTo(cb.r, sy(v)); x.stroke(); SC.text(x, String(v), cb.l - 5, sy(v) + 4, { size: 11, align: 'right' }); });
        for (k = Math.ceil(tmin / 60) * 60; k <= tmax + 1e-6; k += 60) { x.strokeStyle = C.silver; x.beginPath(); x.moveTo(sx(k), cb.t); x.lineTo(sx(k), cb.b); x.stroke(); SC.text(x, String(Math.round(k)), sx(k), cb.b + 13, { size: 11, align: 'center' }); }
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(cb.l, cb.t); x.lineTo(cb.l, cb.b); x.lineTo(cb.r, cb.b); x.stroke();
        SC.text(x, 'Simulated time (s)', (cb.l + cb.r) / 2, 482, { bold: true, size: 11, align: 'center' });
        x.save(); x.translate(14, (cb.t + cb.b) / 2); x.rotate(-Math.PI / 2); SC.text(x, 'Brain / plasma', 0, 0, { bold: true, size: 11, align: 'center' }); x.restore();
        marks.forEach(function(mk){ if (mk.t < tmin) return; x.strokeStyle = C.bg; x.lineWidth = 1.2; x.setLineDash([2, 3]); x.beginPath(); x.moveTo(sx(mk.t), cb.t); x.lineTo(sx(mk.t), cb.b); x.stroke(); x.setLineDash([]); if (mk.label) { x.font = '11px Aptos, "Segoe UI", sans-serif'; var lw = x.measureText(mk.label).width, rt = sx(mk.t) + 3 + lw > cb.r; SC.text(x, mk.label, sx(mk.t) + (rt ? -3 : 3), cb.b - 5, { size: 11, align: rt ? 'right' : 'left' }); } });
        [[eq * f[0] / f[1], C.char], [eq, C.red]].forEach(function(r){ x.strokeStyle = r[1]; x.lineWidth = 1.4; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(cb.l, sy(r[0])); x.lineTo(cb.r, sy(r[0])); x.stroke(); x.setLineDash([]); });
        [['kp', C.char, 1.6], ['uu', C.red, 2.2]].forEach(function(r){ x.strokeStyle = r[1]; x.lineWidth = r[2]; x.beginPath(); var open = false; hist.forEach(function(hq){ var v = hq[r[0]]; if (!isFinite(v) || v <= 0 || hq.t < tmin) { open = false; return; } if (open) x.lineTo(sx(hq.t), sy(v)); else { x.moveTo(sx(hq.t), sy(v)); open = true; } }); x.stroke(); });
        x.fillStyle = 'rgba(255,255,255,0.88)'; x.fillRect(cb.l + 4, cb.t + 3, 420, 16); lx = cb.l + 10;
        [['Kp, total', C.char, []], ['Kp,uu, unbound (6 s moving average)', C.red, []], ['equation', C.char, [5, 4]]].forEach(function(l){ x.strokeStyle = l[1]; x.lineWidth = 2; x.setLineDash(l[2]); x.beginPath(); x.moveTo(lx, cb.t + 11); x.lineTo(lx + 16, cb.t + 11); x.stroke(); x.setLineDash([]); SC.text(x, l[0], lx + 20, cb.t + 15, { size: 11 }); lx += 32 + x.measureText(l[0]).width; });
        if (hov) IX.tip(M, hov.x, hov.y, hov.lines);
      }
      function frame(dt){
        if (dt > 0) { if (!api.stepDef.visible) return; advance(dt, true); move(dt); }
        draw(); var now = performance.now(); if (now - lastSide > 1000) { lastSide = now; upSide(); }
      }
      function redraw(){ if (!loop || !ANIM) draw(); }
      function inPump(p){ return Math.abs(p.x - LUM) < 15 && Math.abs(p.y - PUMP.y) < 22; }
      function pickMol(p){ var b = null, bd = 8; MOL.forEach(function(m){ var d = Math.hypot(m.x - p.x, m.y - p.y); if (d < bd) { bd = d; b = m; } }); return b; }
      function hoverAt(p){
        var f = fu(), m = pickMol(p), q;
        if (m) return [NAMES[m.s], 'drag to move it'];
        if (inPump(p)) return ['P-glycoprotein (P-gp, ABCB1)', 'ATP-dependent efflux from the cell to blood', 'A_out/P = ' + aOut().toFixed(1), S.inh ? 'inhibited; click to restore' : 'click to inhibit'];
        if (Math.abs(p.x - LUM) < 15 && Math.abs(p.y - CARR.y) < 20) return ['Influx carrier (solute carrier)', 'A_in/P = ' + S.ai.toFixed(1)];
        if (p.x >= 252 && p.x <= 284 && (Math.abs(p.y - 60) < 7 || Math.abs(p.y - 286) < 7)) return ['Tight junction', 'seals the cleft between adjacent cells', 'paracellular flux is zero'];
        if (Math.abs(p.x - LUM) < 5 && p.y > 64 && p.y < 282) return ['Luminal membrane', 'passive clearance P in both directions'];
        if (Math.abs(p.x - ABL) < 5 && p.y > 64 && p.y < 282) return ['Abluminal membrane', 'passive clearance P in both directions'];
        for (q = 0; q < PROT.length; q++) if (Math.hypot((p.x - PROT[q].x) / 1.25, p.y - PROT[q].y) < PROT[q].r + 3) return ['Plasma protein', 'fu,p = ' + fx(f[0])];
        for (q = 0; q < SITE.length; q++) if (Math.abs(p.x - SITE[q].x) < SITE[q].w / 2 && Math.abs(p.y - SITE[q].y) < SITE[q].h / 2) return ['Tissue binding site (lipid, protein)', 'fu,brain = ' + fx(f[1])];
        return null;
      }
      function setInh(v){ S.inh = v ? 1 : 0; qs('.inh', c6).checked = !!v; changed(v ? 'P-gp inhibited' : 'P-gp active'); upSide(); redraw(); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'bbb-schematic', csv: function(){ var f = fu(), e = est(), eq = kpuuEq(), rows = [['Simulated time (s)', 'Kp from molecule counts', 'Kp,uu 6 s moving average', 'Kp equation', 'Kp,uu equation']];
        hist.forEach(function(hq){ rows.push([hq.t, isFinite(hq.kp) ? hq.kp : '', isFinite(hq.uu) ? hq.uu : '', eq * f[0] / f[1], eq]); });
        rows.push([], ['Passive P (x reference)', S.p], ['A_out/P', aOut()], ['A_in/P', S.ai], ['fu,p', f[0]], ['fu,brain', f[1]], ['Kp,uu simulated (batch average)', e && isFinite(e.uu) ? e.uu : ''], ['Standard error (percent)', e && e.se !== null ? e.se : ''], ['Averaging time (s)', e ? e.dur : 0]); return IX.csv(rows); } });
      [['p', c1], ['ao', c2], ['ai', c3], ['fp', c4], ['fb', c5]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; changed(); upSide(); redraw(); }); });
      qs('.inh', c6).addEventListener('change', function(){ setInh(this.checked); });
      qs('.ff', c7).addEventListener('click', function(){ advance(FF, false); MOL.forEach(function(m){ if (!m.held) place(m); }); upSide(); draw(); });
      qs('.rs', c7).addEventListener('click', function(){ populate(true); mark('brain emptied'); upSide(); draw(); });
      IX.attach(cvs, {
        move: function(p){ hovM = pickMol(p); var l = hoverAt(p); hov = l ? { x: p.x, y: p.y, lines: l } : null; cvs.style.cursor = hovM ? 'grab' : (inPump(p) ? 'pointer' : 'default'); redraw(); },
        leave: function(){ hov = null; hovM = null; redraw(); },
        down: function(p){ var m = pickMol(p); if (!m) return null; m.held = true; m.path = []; hov = null; cvs.style.cursor = 'grabbing'; return { m: m }; },
        drag: function(d, p){ d.m.x = cl(p.x, 10, 614); d.m.y = cl(p.y, 42, 304); hovM = d.m; redraw(); },
        up: function(d){ var m = d.m, s = m.x < BLD.r ? 0 : (m.x >= BRN.l ? 3 : (m.y > 64 && m.y < 282 ? 2 : 0)); CNT[m.s]--; CNT[s]++; m.s = s; m.host = -1; m.held = false; m.tl = T; m.tn = T + expo(TOT[s]);
          var b = BOX[s]; m.x = cl(m.x, b.l, b.r); m.y = cl(m.y, b.t, b.b); cvs.style.cursor = 'grab'; upSide(); redraw(); },
        click: function(p){ if (inPump(p)) setInh(!S.inh); }
      });
      rebuild(); populate(false);
      return { render: function(){ if (!loop) loop = SC.run(cvs, frame); draw(); upSide(); } };
    } });

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
