"use strict";
/* Tab 09: absorption and bioavailability. Data: Obach (1999) for the hepatic first-pass limit; Hou (2007) human intestinal absorption,
   Wang (2016) Caco-2 permeability and AqSolDB (2019), all via Therapeutics Data Commons, with RDKit descriptors. */
var ABS = new Lesson('abs', 'Absorption');
ABS.noOpts = true;

function aLinScatter(el, pts, o){
  var g = cv(el), box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x;
  var sx = function(v){ return box.l + (v - o.xlo) / (o.xhi - o.xlo) * (box.r - box.l); }, sy = function(v){ return box.b - (v - o.ylo) / (o.yhi - o.ylo) * (box.b - box.t); };
  x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right';
  var yt = niceTicks(o.ylo, o.yhi, 5), xt = niceTicks(o.xlo, o.xhi, 6);
  yt.v.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 6, sy(v) + 4); });
  x.textAlign = 'center'; xt.v.forEach(function(v){ x.beginPath(); x.moveTo(sx(v), box.t); x.lineTo(sx(v), box.b); x.stroke(); x.fillText(tickText(v, xt.step), sx(v), box.b + 16); });
  x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(o.xl, (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(o.yl, 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
  var hit = [];
  pts.forEach(function(p){ var px = sx(Math.min(Math.max(p.x, o.xlo), o.xhi)), py = sy(Math.min(Math.max(p.y, o.ylo), o.yhi)), on = o.sel === p.d; x.fillStyle = C.red; x.globalAlpha = on ? 1 : 0.35; x.beginPath(); x.arc(px, py, on ? 7 : 3, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(p.d.name, px + 10, py - 8); x.font = '12px Aptos, "Segoe UI", sans-serif'; } hit.push({ x: px, y: py, r: p.d, vx: p.x, vy: p.y }); });
  if (o.trend) { x.strokeStyle = C.char; x.lineWidth = 3; x.beginPath(); o.trend.forEach(function(t, i){ i ? x.lineTo(sx(t[0]), sy(t[1])) : x.moveTo(sx(t[0]), sy(t[1])); }); x.stroke(); }
  el._pts = hit; el._g = g; return g;
}
function aRank(a){ var o = a.map(function(v, i){ return [v, i]; }).sort(function(p, q){ return p[0] - q[0]; }), r = new Array(a.length), i = 0; while (i < o.length) { var j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; var m = (i + j) / 2 + 1; for (var k = i; k <= j; k++) r[o[k][1]] = m; i = j + 1; } return r; }
function aSpearman(xs, ys){ var a = aRank(xs), b = aRank(ys), n = a.length, ma = (n + 1) / 2, sa = 0, sb = 0, sc = 0, i; for (i = 0; i < n; i++) { sa += (a[i] - ma) * (a[i] - ma); sb += (b[i] - ma) * (b[i] - ma); sc += (a[i] - ma) * (b[i] - ma); } return sc / Math.sqrt(sa * sb); }
function aAUC(pos, neg){ var all = pos.concat(neg), r = aRank(all), sp = 0, i; for (i = 0; i < pos.length; i++) sp += r[i]; return (sp - pos.length * (pos.length + 1) / 2) / (pos.length * neg.length); }
function aRows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:3px 0;font-size:12px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }

/* ---------- step 1: oral absorption pathway (animated schematic) ----------
   Seven transit compartments (Yu and Amidon, 1999; Tsi 3.32 h), V 250 mL, first-order dissolution limited by saturation in each compartment,
   gross absorption rate ka = 0.54 Peff x 7 / Tsi, efflux as return to the lumen, Qgut model for Fg, Fh = 1 - Eh.
   Each molecule is a tracer: its hazards use the saturation computed from the mass balance, so simulated fractions converge to the equations. */
(function(){
  var V = 250, TSI = 3.32, NC = 7, KT = NC / TSI, HODE = 0.01, TEND = 30, NX = 12, UPX = 10, SP = 0.6, HDT = 0.02;
  var LX0 = 12, LX1 = 158, LY0 = 30, LY1 = 394, SEG = (LY1 - LY0) / NC, EX0 = 166, EX1 = 252, PVX = 286, PVY = 84;
  var LV = { x0: 336, x1: 470, y0: 28, y1: 140 }, SB = { x0: 488, x1: 612, y0: 28, y1: 140 }, GT = { x0: 368, x1: 456, y: 122 };
  var WF = { l: 366, r: 606, t: 190, b: 368 };
  var GREY = '#A1B1C4';
  function tile(label, value, sub){ return '<div class="score" style="margin-bottom:8px"><b>' + label + '</b><div class="v" style="font-size:1.5rem">' + value + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>'; }
  function rws(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:4px 0;font-size:12.5px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function f2(v){ return v.toFixed(2); }
  function fd(v){ return v < 10 ? v.toFixed(1) : String(Math.round(v)); }
  function fg3(v){ return v >= 1000 ? Math.round(v).toLocaleString() : String(+v.toPrecision(2)); }
  function cellY(c){ return LY0 + c * SEG + SEG / 2; }

  /* mass balance in fractions of the dose: s_i solid, d_i dissolved, i = 1..7; phi_i = max(0, 1 - C_i / S) with C_i / S = 7 D0 d_i */
  function model(S){
    var dose = Math.pow(10, S.ld), sol = Math.pow(10, S.ls), d0 = dose / (V * sol), peff = Math.pow(10, S.lp), ka = 0.54 * peff * KT, kan = ka * (1 - S.fe), kd = S.kd;
    var n = Math.round(TEND / HODE), phi = new Float32Array((n + 1) * NC), ab = new Float32Array(n + 1), y = new Float64Array(2 * NC + 1), i, k;
    function der(yy, o){ var a = 0; for (var j = 0; j < NC; j++) { var s = yy[j], d = yy[NC + j], si = j ? yy[j - 1] : 0, di = j ? yy[NC + j - 1] : 0, ph = Math.max(0, 1 - NC * d0 * d); o[j] = KT * (si - s) - kd * ph * s; o[NC + j] = KT * (di - d) + kd * ph * s - kan * d; a += kan * d; } o[2 * NC] = a; }
    var k1 = new Float64Array(2 * NC + 1), k2 = new Float64Array(2 * NC + 1), k3 = new Float64Array(2 * NC + 1), k4 = new Float64Array(2 * NC + 1), tmp = new Float64Array(2 * NC + 1), m = 2 * NC + 1;
    y[0] = 1;
    for (k = 0; k <= n; k++) {
      for (i = 0; i < NC; i++) phi[k * NC + i] = Math.max(0, 1 - NC * d0 * y[NC + i]);
      ab[k] = y[2 * NC]; if (k === n) break;
      der(y, k1); for (i = 0; i < m; i++) tmp[i] = y[i] + 0.5 * HODE * k1[i];
      der(tmp, k2); for (i = 0; i < m; i++) tmp[i] = y[i] + 0.5 * HODE * k2[i];
      der(tmp, k3); for (i = 0; i < m; i++) tmp[i] = y[i] + HODE * k3[i];
      der(tmp, k4); for (i = 0; i < m; i++) y[i] += HODE / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
    var fa = y[2 * NC], fgv = 1 / (1 + S.rg), fh = 1 - S.eh;
    return { dose: dose, sol: sol, d0: d0, peff: peff, ka: ka, kan: kan, kd: kd, fe: S.fe, rg: S.rg, eh: S.eh, n: n, phi: phi, ab: ab,
      fa: fa, fg: fgv, fh: fh, F: fa * fgv * fh, faPerm: 1 - Math.pow(1 + 0.54 * peff * (1 - S.fe), -7), mad: sol * V * kan * TSI };
  }
  function phiAt(M, c, tau){ var k = Math.min(M.n, Math.max(0, Math.floor(tau / HODE))); return M.phi[k * NC + c]; }

  /* fast Monte Carlo of the same tracer process, without drawing */
  function headless(M, nd, st, R){
    var N = nd * NX * UPX, u;
    for (u = 0; u < N; u++) {
      var c = 0, tau = 0, solid = true, out = null, guard = 0;
      while (!out && guard++ < 100000) {
        if (solid) {
          var h = KT + M.kd * phiAt(M, c, tau + HDT / 2);
          if (R() < 1 - Math.exp(-h * HDT)) { if (R() * h < KT) { c++; if (c >= NC) out = 'col'; } else solid = false; }
          tau += HDT;
        } else {
          var hh = KT + M.ka;
          if (R() * hh < KT) { c++; if (c >= NC) out = 'col'; }
          else if (R() >= M.fe) out = R() < 1 - M.fg ? 'gm' : (R() < M.eh ? 'hep' : 'sys');
        }
      }
      st[out || 'col']++; st.n++;
    }
    st.doses += nd;
  }

  ABS.add({ short: 'Absorption schematic', level: 'foundations', title: 'Oral absorption pathway',
    build: function(api){
      var S = IX.state('abx', { ld: 2, ls: -1, kd: 2, lp: 0.1, fe: 0.3, rg: 0.5, eh: 0.4 }), R = SC.rand(20261105), M = null, st, co, loop = null, pins = [], tmr = null, hoverG = false;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('ld', 'Dose', 0, 3, 0.05, S.ld, 'mg')), c2 = api.addControl(IX.slider('ls', 'Solubility S', -3, 1, 0.1, S.ls, 'mg/mL')), c3 = api.addControl(IX.slider('kd', 'Dissolution kd', 0.2, 6, 0.1, S.kd, '1/h'));
      var c4 = api.addControl(IX.slider('lp', 'Peff', -1.3, 0.9, 0.05, S.lp, 'x 10^-4 cm/s')), c5 = api.addControl(IX.slider('fe', 'P-gp efflux, fraction returned', 0, 0.9, 0.05, S.fe)), c6 = api.addControl(IX.slider('rg', 'Gut CYP3A, fu,gut CLint,gut / Qgut', 0, 4, 0.1, S.rg)), c7 = api.addControl(IX.slider('eh', 'Hepatic Eh', 0, 0.95, 0.01, S.eh));
      var cb = api.addControl('<button type="button" class="btn sm ghost ab-run">Simulate 200 more doses</button>');
      var CT = [['ld', c1], ['ls', c2], ['kd', c3], ['lp', c4], ['fe', c5], ['rg', c6], ['eh', c7]];
      function labels(){
        qs('.ldv', c1).textContent = fd(Math.pow(10, S.ld)); qs('.lsv', c2).textContent = fg3(Math.pow(10, S.ls)); qs('.kdv', c3).textContent = S.kd.toFixed(1);
        qs('.lpv', c4).textContent = fg3(Math.pow(10, S.lp)); qs('.fev', c5).textContent = S.fe.toFixed(2); qs('.rgv', c6).textContent = S.rg.toFixed(1); qs('.ehv', c7).textContent = S.eh.toFixed(2);
      }
      function sync(){ CT.forEach(function(r){ qs('.' + r[0], r[1]).value = S[r[0]]; }); labels(); }
      function resetStats(){ st = { n: 0, col: 0, gm: 0, hep: 0, sys: 0, doses: 0 }; }
      function newCohort(){
        co = { t: 0, cr: [], u: [], tot: NX * UPX, done: 0, res: { n: 0, col: 0, gm: 0, hep: 0, sys: 0 }, closed: false, wait: 0 };
        for (var k = 0; k < NX; k++) { var vf = []; for (var j = 0; j < 7; j++) vf.push(0.75 + 0.4 * R()); var x0 = LX0 + 16 + R() * (LX1 - LX0 - 32), y0 = LY0 + 9 + R() * (SEG - 18); co.cr.push({ c: 0, n: UPX, x: x0, y: y0, tx: x0, ty: y0, vf: vf, rot: R() * 6.28 }); }
      }
      function simF(){ if (!st.n) return null; var ab = st.gm + st.hep + st.sys, por = st.hep + st.sys; return { fa: ab / st.n, fg: ab ? por / ab : 0, fh: por ? st.sys / por : 0, F: st.sys / st.n }; }
      function side_(){
        var q = simF(), sv = function(k){ return q ? f2(q[k]) : 'n/a'; };
        qs('.sd', side).innerHTML = tile('Bioavailability F', f2(M.F), 'simulation ' + sv('F') + ' (' + st.doses + ' doses, ' + st.n.toLocaleString() + ' molecules)') +
          rws([['Dose number D0', fg3(M.d0)], ['Fa, equations / simulation', f2(M.fa) + ' / ' + sv('fa')], ['Fg, equations / simulation', f2(M.fg) + ' / ' + sv('fg')], ['Fh, equations / simulation', f2(M.fh) + ' / ' + sv('fh')],
            ['Fa limit, dissolved dose', f2(M.faPerm)], ['Maximum absorbable dose', fg3(M.mad) + ' mg'], ['ka, net of efflux', fg3(M.kan) + ' 1/h']]) +
          '<div class="hint" style="font-size:11.5px;margin-top:8px">D0 = Dose / (V S), V = 250 mL. Fa: mass balance over seven transit compartments, Tsi = 3.32 h; for dissolved drug Fa = 1 - (1 + 0.54 Peff (1 - fe))^-7. Fg = 1 / (1 + fu,gut CLint,gut / Qgut). F = Fa x Fg x Fh. Drag the handle in the liver to set Eh.</div>';
        api.stat('F = ' + f2(M.F) + ' from the equations, ' + (q ? f2(q.F) : 'n/a') + ' simulated');
      }
      function changed(){
        IX.save('abx', S); labels(); M = model(S); resetStats(); newCohort(); side_(); redraw();
        if (tmr) clearTimeout(tmr); tmr = setTimeout(function(){ tmr = null; headless(M, 40, st, R); side_(); redraw(); }, 150);
      }
      function resolve(k){ co.done++; co.res[k]++; co.res.n++; }
      function mv(u, tx, ty, sp, dt){ var dx = tx - u.x, dy = ty - u.y, d = Math.sqrt(dx * dx + dy * dy), s = sp * dt; if (d <= s || d < 0.01) { u.x = tx; u.y = ty; return true; } u.x += dx / d * s; u.y += dy / d * s; return false; }
      function wander(u){ u.tx = LX0 + 8 + R() * (LX1 - LX0 - 16); u.ty = LY0 + u.c * SEG + 6 + R() * (SEG - 12); }
      function arrive(u){
        var cy = cellY(u.c);
        if (u.st === 'in') {
          if (R() < M.fe) { u.st = 'ef'; u.ring = 1; u.sp = 90; u.path = [[EX0 + 1, cy - 12], [LX1 - 10 - R() * 40, cy - 12 + R() * 12 - 6]]; }
          else if (R() < 1 - M.fg) { u.st = 'met'; u.fade = 1; }
          else { u.st = 'bl'; u.sp = 70; u.path = [[EX1 - 2, u.y], [PVX - 6 + R() * 12, u.y]]; }
        } else if (u.st === 'ef') { u.st = 'lum'; wander(u); }
        else if (u.st === 'bl') { u.st = 'por'; u.sp = 130; var jx = u.x; u.path = [[jx, PVY + 2 + R() * 8], [LV.x0 + 6, PVY - 6 + R() * 12]]; }
        else if (u.st === 'por') { u.st = 'liv'; u.sp = 60; u.path = [[(LV.x0 + LV.x1) / 2 + R() * 24 - 12, PVY - 7 + R() * 14]]; }
        else if (u.st === 'liv') { if (R() < M.eh) { u.st = 'hep'; u.fade = 1; } else { u.st = 'tos'; u.sp = 100; u.path = [[LV.x1 + 4, PVY - 4 + R() * 8], [SB.x0 + 12 + R() * (SB.x1 - SB.x0 - 24), 74 + R() * 56]]; } }
        else if (u.st === 'tos') { u.st = 'sys'; u.ph = R() * 6.28; resolve('sys'); }
        else if (u.st === 'out') { u.st = 'gone'; resolve('col'); }
      }
      function advance(dt){
        var dtm = dt * SP, i, j, u;
        if (co.closed) { co.wait += dt; if (co.wait > 1.5) newCohort(); return; }
        for (i = co.cr.length - 1; i >= 0; i--) {
          var cr = co.cr[i];
          if (R() < 1 - Math.exp(-KT * dtm)) { cr.c++; if (cr.c >= NC) { for (j = 0; j < cr.n; j++) resolve('col'); co.cr.splice(i, 1); continue; } cr.tx = LX0 + 16 + R() * (LX1 - LX0 - 32); cr.ty = LY0 + cr.c * SEG + 9 + R() * (SEG - 18); }
          var pd = 1 - Math.exp(-M.kd * phiAt(M, cr.c, co.t) * dtm), nd = 0;
          for (j = 0; j < cr.n; j++) if (R() < pd) nd++;
          for (j = 0; j < nd; j++) { u = { st: 'lum', c: cr.c, tau: co.t, x: cr.x + R() * 6 - 3, y: cr.y + R() * 6 - 3, ring: 0 }; wander(u); co.u.push(u); }
          cr.n -= nd; if (cr.n <= 0) { co.cr.splice(i, 1); continue; }
          var dx = cr.tx - cr.x, dy = cr.ty - cr.y; cr.x += dx * Math.min(1, dt * 2.5); cr.y += dy * Math.min(1, dt * 2.5); cr.rot += dt * 0.3;
        }
        co.t += dtm;
        for (i = 0; i < co.u.length; i++) {
          u = co.u[i]; if (u.ring > 0) u.ring = Math.max(0, u.ring - dt * 0.8);
          if (u.st === 'lum') {
            u.tau += dtm; var h = KT + M.ka;
            if (R() < 1 - Math.exp(-h * dtm)) {
              if (R() * h < KT) { u.c++; if (u.c >= NC) { u.st = 'out'; u.sp = 40; u.path = [[u.x, LY1 + 6]]; } else wander(u); }
              else { u.st = 'in'; u.sp = 80; var cy = cellY(u.c); u.path = [[EX0 + 3, cy + R() * 16 - 8], [200 + R() * 30, cy + R() * 20 - 10]]; }
            }
            if (u.st === 'lum' && mv(u, u.tx, u.ty, 45, dt)) wander(u);
          } else if (u.st === 'met' || u.st === 'hep') {
            u.fade -= dt / 1.4; if (u.fade <= 0) { u.st = 'gone'; resolve(u.st === 'met' ? 'gm' : 'hep'); }
          } else if (u.path && u.path.length) {
            if (mv(u, u.path[0][0], u.path[0][1], u.sp, dt)) { u.path.shift(); if (!u.path.length) arrive(u); }
          }
        }
        co.u = co.u.filter(function(q){ return q.st !== 'gone'; });
        if (co.done >= co.tot && !co.closed) { co.closed = true; ['n', 'col', 'gm', 'hep', 'sys'].forEach(function(k){ st[k] += co.res[k]; }); st.doses++; side_(); }
      }
      function crystal(x, cx, cy, r, vf, rot, alpha){
        x.beginPath(); for (var k = 0; k < 7; k++) { var a = rot + k * 6.2832 / 7, rr = r * vf[k]; k ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath();
        x.globalAlpha = alpha || 1; x.fillStyle = SC.mix(GREY, '#FFFFFF', 0.25); x.fill(); x.strokeStyle = C.char; x.lineWidth = 1.2; x.stroke(); x.globalAlpha = 1;
      }
      function pump(x, px, py, a){ x.globalAlpha = a; x.fillStyle = C.warn; SC.rr(x, px - 3, py - 6, 7, 12, 2); x.fill(); x.globalAlpha = 1; }
      function hex(x, px, py, r, a){ x.globalAlpha = a; x.beginPath(); for (var k = 0; k < 6; k++) { var an = k * 1.0472 + 0.5236; k ? x.lineTo(px + Math.cos(an) * r, py + Math.sin(an) * r) : x.moveTo(px + Math.cos(an) * r, py + Math.sin(an) * r); } x.closePath(); x.fillStyle = C.char; x.fill(); x.globalAlpha = 1; }
      function draw(tt){
        var g = cv(cvs), x = g.x, i, k, q = simF();
        /* headers */
        SC.text(x, 'Intestinal lumen', (LX0 + LX1) / 2, 18, { bold: true, align: 'center' }); SC.text(x, 'Enterocytes', (EX0 + EX1) / 2, 18, { bold: true, align: 'center' }); SC.text(x, 'Portal vein', PVX, 18, { bold: true, align: 'center' });
        /* lumen segments shaded by C / S from the mass balance */
        for (i = 0; i < NC; i++) { var sat = 1 - phiAt(M, i, co.t); x.fillStyle = SC.mix('#F3F7F9', C.tint, 0.12 + 0.6 * sat); x.fillRect(LX0, LY0 + i * SEG, LX1 - LX0, SEG); }
        x.strokeStyle = C.silver; x.lineWidth = 1; x.setLineDash([4, 4]); for (i = 1; i < NC; i++) { x.beginPath(); x.moveTo(LX0, LY0 + i * SEG); x.lineTo(LX1, LY0 + i * SEG); x.stroke(); } x.setLineDash([]);
        x.strokeStyle = C.bg; x.lineWidth = 1.2; x.strokeRect(LX0, LY0, LX1 - LX0, LY1 - LY0);
        SC.arrow(x, (LX0 + LX1) / 2, LY1 + 2, (LX0 + LX1) / 2, LY1 + 9, C.bg, 1.5, 6);
        SC.text(x, 'To colon, not absorbed', (LX0 + LX1) / 2, 412, { size: 11, align: 'center', color: C.char });
        SC.text(x, 'Time after dose ' + co.t.toFixed(1) + ' h', (EX0 + EX1) / 2 + 4, 412, { size: 11, align: 'center', color: C.char });
        /* brush border, enterocytes, P-gp, CYP3A */
        x.strokeStyle = C.bg; x.lineWidth = 1; for (k = LY0 + 2; k < LY1; k += 4) { x.beginPath(); x.moveTo(LX1, k); x.lineTo(EX0, k); x.stroke(); }
        for (i = 0; i < NC; i++) {
          var cy = cellY(i); SC.rr(x, EX0, LY0 + i * SEG + 2, EX1 - EX0, SEG - 4, 5); x.fillStyle = '#FBFCFD'; x.fill(); x.strokeStyle = C.bg; x.lineWidth = 1; x.stroke();
          if (M.fe > 0) pump(x, EX0, cy - 12, 0.35 + 0.65 * M.fe / 0.9);
          if (M.rg > 0) hex(x, EX1 - 12, cy + 12, 5, 0.3 + 0.7 * Math.min(1, M.rg / 2));
        }
        /* portal vein, liver, hepatic vein, systemic circulation */
        x.strokeStyle = SC.mix(C.tint, '#FFFFFF', 0.45); x.lineWidth = 24; x.lineCap = 'butt'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(PVX, LY1); x.lineTo(PVX, PVY + 14); x.quadraticCurveTo(PVX, PVY, PVX + 14, PVY); x.lineTo(LV.x0, PVY); x.stroke();
        x.lineWidth = 16; x.beginPath(); x.moveTo(LV.x1, PVY); x.lineTo(SB.x0, PVY); x.stroke(); x.lineJoin = 'miter';
        SC.arrow(x, PVX, 330, PVX, 300, C.red, 1.6, 7); SC.arrow(x, PVX, 200, PVX, 170, C.red, 1.6, 7);
        SC.rr(x, LV.x0, LV.y0, LV.x1 - LV.x0, LV.y1 - LV.y0, 10); x.fillStyle = SC.mix(C.warn, '#FFFFFF', 0.82); x.fill(); x.strokeStyle = C.warn; x.lineWidth = 1.4; x.stroke();
        x.fillStyle = SC.mix(C.warn, '#FFFFFF', 0.6); x.fillRect(LV.x0 + 1, PVY - 10, LV.x1 - LV.x0 - 2, 20);
        SC.text(x, 'Liver', LV.x0 + 10, 46, { bold: true }); SC.text(x, 'Eh = ' + f2(M.eh) + ', Fh = ' + f2(M.fh), LV.x0 + 10, 64, { size: 11 });
        SC.text(x, 'Eh', LV.x0 + 10, GT.y + 4, { size: 11, bold: true });
        x.strokeStyle = C.char; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(GT.x0, GT.y); x.lineTo(GT.x1, GT.y); x.stroke(); x.lineCap = 'butt';
        x.strokeStyle = C.warn; x.lineWidth = 5; x.beginPath(); x.moveTo(GT.x0, GT.y); x.lineTo(GT.x0 + M.eh * (GT.x1 - GT.x0), GT.y); x.stroke();
        SC.dot(x, GT.x0 + M.eh * (GT.x1 - GT.x0), GT.y, hoverG ? 8 : 7, C.warn, '#FFFFFF');
        SC.rr(x, SB.x0, SB.y0, SB.x1 - SB.x0, SB.y1 - SB.y0, 10); x.fillStyle = SC.mix(C.red, '#FFFFFF', 0.88); x.fill(); x.strokeStyle = C.red; x.lineWidth = 1.4; x.stroke();
        SC.text(x, 'Systemic circulation', SB.x0 + 6, 46, { bold: true, size: 11 }); SC.text(x, 'F = ' + f2(M.F), SB.x0 + 6, 62, { size: 11 });
        /* crystals and molecules */
        co.cr.forEach(function(cr){ crystal(x, cr.x, cr.y, 2.5 + 2.2 * Math.sqrt(cr.n), cr.vf, cr.rot); });
        co.u.forEach(function(u){
          var px = u.x, py = u.y;
          if (u.st === 'sys') { px += Math.sin(tt * 1.7 + u.ph) * 1.5; py += Math.cos(tt * 1.3 + u.ph) * 1.5; }
          if (u.st === 'met' || u.st === 'hep') { x.globalAlpha = Math.max(0, u.fade); SC.dot(x, px, py, 3.2, GREY, C.char); x.globalAlpha = 1; return; }
          if (u.st === 'out') x.globalAlpha = 0.5;
          SC.dot(x, px, py, 3.2, C.red);
          if (u.ring > 0 || u.st === 'ef') { x.globalAlpha = u.st === 'ef' ? 1 : u.ring; x.strokeStyle = C.warn; x.lineWidth = 1.8; x.beginPath(); x.arc(px, py, 5, 0, 6.2832); x.stroke(); }
          x.globalAlpha = 1;
        });
        /* waterfall: dose, Fa, Fa x Fg, F */
        SC.text(x, 'Fraction of the dose at each stage', LV.x0, 170, { bold: true });
        x.strokeStyle = C.silver; x.lineWidth = 1; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ var yy = WF.b - v * (WF.b - WF.t); x.beginPath(); x.moveTo(WF.l, yy); x.lineTo(WF.r, yy); x.stroke(); SC.text(x, v.toFixed(2), WF.l - 5, yy + 4, { size: 11, align: 'right', color: C.char }); });
        var lv = [1, M.fa, M.fa * M.fg, M.F], sl = q ? [1, q.fa, q.fa * q.fg, q.F] : null, nm = ['Dose', 'Fa', 'Fa x Fg', 'F'], sw = (WF.r - WF.l) / 4, bw = 34, sy = function(v){ return WF.b - v * (WF.b - WF.t); };
        for (k = 0; k < 4; k++) {
          var cx = WF.l + sw * (k + 0.5), bx = cx - bw / 2;
          if (k) { x.fillStyle = C.warn; x.globalAlpha = 0.35; x.fillRect(bx, sy(lv[k - 1]), bw, sy(lv[k]) - sy(lv[k - 1])); x.globalAlpha = 1; x.strokeStyle = C.bg; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(bx - sw + bw, sy(lv[k - 1])); x.lineTo(bx, sy(lv[k - 1])); x.stroke(); x.setLineDash([]); }
          x.fillStyle = C.red; x.fillRect(bx, sy(lv[k]), bw, WF.b - sy(lv[k]));
          pins.forEach(function(p){ x.strokeStyle = GREY; x.lineWidth = 1.6; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(bx - 4, sy(p[k])); x.lineTo(bx + bw + 4, sy(p[k])); x.stroke(); x.setLineDash([]); });
          if (sl) { x.strokeStyle = C.char; x.lineWidth = 2.6; x.beginPath(); x.moveTo(bx - 5, sy(sl[k])); x.lineTo(bx + bw + 5, sy(sl[k])); x.stroke(); }
          var ty = Math.min(sy(lv[k]), sl ? sy(sl[k]) : 999) - 5; SC.text(x, f2(lv[k]), cx, Math.max(ty, WF.t - 4), { size: 11, bold: true, align: 'center' });
          SC.text(x, nm[k], cx, WF.b + 16, { size: 11, bold: true, align: 'center' });
        }
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(WF.l, WF.b); x.lineTo(WF.r, WF.b); x.stroke();
        /* legend */
        var L = [[14, 438, 'cr', 'Undissolved drug'], [168, 438, 'dot', 'Dissolved drug'], [322, 438, 'ef', 'Returned by P-gp'], [476, 438, 'met', 'Metabolite'],
          [14, 458, 'pg', 'P-gp efflux pump'], [168, 458, 'hx', 'CYP3A, gut wall'], [322, 458, 'sh', 'Lumen shade, C / S'], [476, 458, 'eh', 'Eh handle (drag)'],
          [14, 478, 'bar', 'Bar: equations'], [168, 478, 'sim', 'Line: simulation'], [322, 478, 'loss', 'Loss at each stage'], [476, 478, 'pin', 'Pinned']];
        L.forEach(function(it){
          var ix = it[0] + 6, iy = it[1] - 4;
          if (it[2] === 'cr') crystal(x, ix, iy, 6, [1, 0.85, 1.1, 0.9, 1, 0.8, 1.05], 0.3);
          else if (it[2] === 'dot') SC.dot(x, ix, iy, 3.5, C.red);
          else if (it[2] === 'ef') { SC.dot(x, ix, iy, 3.5, C.red); x.strokeStyle = C.warn; x.lineWidth = 1.8; x.beginPath(); x.arc(ix, iy, 5.5, 0, 6.2832); x.stroke(); }
          else if (it[2] === 'met') SC.dot(x, ix, iy, 3.5, GREY, C.char);
          else if (it[2] === 'pg') pump(x, ix, iy, 1);
          else if (it[2] === 'hx') hex(x, ix, iy, 5, 1);
          else if (it[2] === 'sh') { x.fillStyle = SC.mix('#F3F7F9', C.tint, 0.72); x.fillRect(ix - 6, iy - 6, 12, 12); }
          else if (it[2] === 'eh') SC.dot(x, ix, iy, 5, C.warn, '#FFFFFF');
          else if (it[2] === 'bar') { x.fillStyle = C.red; x.fillRect(ix - 5, iy - 6, 10, 12); }
          else if (it[2] === 'sim') { x.strokeStyle = C.char; x.lineWidth = 2.6; x.beginPath(); x.moveTo(ix - 7, iy); x.lineTo(ix + 7, iy); x.stroke(); }
          else if (it[2] === 'loss') { x.fillStyle = C.warn; x.globalAlpha = 0.35; x.fillRect(ix - 5, iy - 6, 10, 12); x.globalAlpha = 1; }
          else if (it[2] === 'pin') { x.strokeStyle = GREY; x.lineWidth = 1.6; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(ix - 7, iy); x.lineTo(ix + 7, iy); x.stroke(); x.setLineDash([]); }
          SC.text(x, it[3], it[0] + 18, it[1], { size: 11 });
        });
      }
      function frame(dt, t){ if (!M) return; if (dt > 0) advance(dt); draw(t); }
      function redraw(){ if (loop) loop.redraw(); }
      CT.forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; changed(); }); });
      qs('.ab-run', cb).addEventListener('click', function(){ headless(M, 200, st, R); side_(); redraw(); });
      IX.tools(api, { pin: function(){ pins.push([1, M.fa, M.fa * M.fg, M.F]); if (pins.length > 3) pins.shift(); redraw(); }, clear: function(){ pins = []; redraw(); }, canvases: function(){ return [cvs]; }, name: 'oral-absorption-pathway',
        csv: function(){ var q = simF(), rows = [['Quantity', 'Equations', 'Simulation']];
          rows.push(['Fa', M.fa, q ? q.fa : ''], ['Fg', M.fg, q ? q.fg : ''], ['Fh', M.fh, q ? q.fh : ''], ['F', M.F, q ? q.F : ''], ['Molecules simulated', '', st.n], [],
            ['Dose (mg)', M.dose, ''], ['S (mg/mL)', M.sol, ''], ['D0', M.d0, ''], ['kd (1/h)', M.kd, ''], ['Peff (10^-4 cm/s)', M.peff, ''], ['Fraction returned by efflux', M.fe, ''], ['fu,gut CLint,gut / Qgut', M.rg, ''], ['Eh', M.eh, ''], [], ['t (h)', 'Fraction of dose absorbed', '']);
          for (var k = 0; k <= M.n; k += 50) rows.push([k * HODE, M.ab[k], '']); return IX.csv(rows); } });
      function onG(p){ return p.x >= GT.x0 - 10 && p.x <= GT.x1 + 10 && Math.abs(p.y - GT.y) <= 11; }
      function setEh(p){ S.eh = Math.round(cl((p.x - GT.x0) / (GT.x1 - GT.x0), 0, 0.95) * 100) / 100; sync(); changed(); }
      IX.attach(cvs, {
        move: function(p){ var o = onG(p); cvs.style.cursor = o ? 'ew-resize' : 'default'; if (o !== hoverG) { hoverG = o; redraw(); } },
        leave: function(){ if (hoverG) { hoverG = false; redraw(); } },
        down: function(p){ if (onG(p)) { setEh(p); return { k: 'eh' }; } return null; },
        drag: function(d, p){ setEh(p); },
        up: function(){ IX.save('abx', S); }
      });
      labels(); M = model(S); resetStats(); newCohort(); headless(M, 40, st, R); side_();
      return { render: function(){ if (!loop) loop = SC.run(cvs, frame); else loop.redraw(); } };
    } });
})();

/* ---------- step 2 ---------- */
ABS.add({ short: 'Hepatic first-pass limit', level: 'foundations', title: 'Hepatic first-pass limit',
  build: function(api){
    var q = 21, sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="450" style="width:624px;height:450px;cursor:pointer"></canvas>' + hepLegend()), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Liver blood flow <input type="range" class="q" min="15" max="30" step="1" value="' + q + '" style="width:120px"> <b class="qv"></b> mL/min/kg');
    function draw(){
      qs('.qv', c1).textContent = q;
      var rows = OBACH99.map(function(d){ return { d: d, fh: Math.max(0, 1 - d.obs / q) }; }).sort(function(a, b){ return b.fh - a.fh; });
      var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 10, t: 14, b: g.h - 80 }, bw = (box.r - box.l) / rows.length, hit = [];
      var sy = function(v){ return box.b - v * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right'; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(v.toFixed(2), box.l - 6, sy(v) + 4); });
      x.save(); x.translate(12, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Hepatic first-pass limit, Fh', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      cvs._bars = []; rows.forEach(function(r, i){ var bx = box.l + i * bw, on = sel === r.d; cvs._bars.push({ x0: bx, x1: bx + bw, y0: sy(r.fh), y1: box.b, lines: [r.d.name, 'observed CL ' + hfx(r.d.obs) + ' mL/min/kg', 'Fh upper bound ' + r.fh.toFixed(2)] }); x.fillStyle = HCLS[r.d.cls][1]; x.globalAlpha = on ? 1 : 0.85; x.fillRect(bx + 1, sy(r.fh), bw - 2, box.b - sy(r.fh)); x.globalAlpha = 1; x.save(); x.translate(bx + bw / 2 + 3, box.b + 6); x.rotate(Math.PI / 3); x.textAlign = 'left'; x.fillStyle = on ? C.char : C.mid; x.font = (on ? '600 ' : '') + '10.5px Aptos, "Segoe UI", sans-serif'; x.fillText(r.d.name, 0, 0); x.restore(); hit.push({ x: bx + bw / 2, y: sy(r.fh / 2 + 0.0001) , r: r.d }); });
      x.font = '12px Aptos, "Segoe UI", sans-serif'; cvs._pts = hit; cvs._g = g;
      var n5 = rows.filter(function(r){ return r.fh < 0.5; }).length, n2 = rows.filter(function(r){ return r.fh < 0.2; }).length, n9 = rows.filter(function(r){ return r.fh >= 0.9; }).length;
      var r0 = sel && rows.filter(function(r){ return r.d === sel; })[0];
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Limit below 0.5</b><div class="v">' + n5 + ' of 29</div><div class="s">below 0.2: ' + n2 + '; at 0.9 or above: ' + n9 + '</div></div>';
      qs('.det', side).innerHTML = r0 ? '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + sel.name + '</div>' + aRows([['Observed CL, blood', hfx(sel.obs) + ' mL/min/kg'], ['Extraction', (sel.obs / q).toFixed(2)], ['Fh upper bound', r0.fh.toFixed(2)]]) : '<div class="hint" style="font-size:12px">Select a bar.</div>';
      api.stat(n5 + ' of 29 drugs have a first-pass limit below 0.5');
    }
    qs('.q', c1).addEventListener('input', function(){ q = +this.value; draw(); });
    cvs.addEventListener('click', function(ev){ var rc = cvs.getBoundingClientRect(), g = cvs._g, mx = (ev.clientX - rc.left) * g.w / rc.width, i = Math.floor((mx - 46) / ((g.w - 56) / 29)); var rows = OBACH99.map(function(d){ return { d: d, fh: Math.max(0, 1 - d.obs / q) }; }).sort(function(a, b){ return b.fh - a.fh; }); sel = i >= 0 && i < rows.length ? rows[i].d : null; draw(); });
    return { render: draw };
  } });

/* ---------- step 3 ---------- */
ABS.add({ short: 'Solubility and dose', level: 'applied', title: 'Solubility and dose number',
  build: function(api){
    var ld = 2, vol = 250;
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="450" style="width:624px;height:450px"></canvas><div class="ro" style="font-size:12.5px;margin-top:6px"></div>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Dose <input type="range" class="d" min="0" max="3.3" step="0.05" value="' + ld + '" style="width:130px"> <b class="dv"></b> mg'), c2 = api.addControl('Volume <select class="v">' + hepOpts([['100', '100 mL'], ['250', '250 mL'], ['500', '500 mL']], '250') + '</select>');
    function draw(){
      var dose = Math.pow(10, ld); qs('.dv', c1).textContent = dose < 10 ? dose.toFixed(1) : Math.round(dose);
      var lo = -6, hi = 8, nb = 56, cnt = new Array(nb).fill(0), above = 0;
      AQ.forEach(function(a){ var S = Math.pow(10, a[0]) * a[1], d0 = (dose / vol) / S, l = Math.log10(d0); if (d0 > 1) above++; var k = Math.floor((l - lo) / (hi - lo) * nb); cnt[Math.max(0, Math.min(nb - 1, k))]++; });
      var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 14, t: 14, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.1, bw = (box.r - box.l) / nb;
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'center'; [-6, -4, -2, 0, 2, 4, 6, 8].forEach(function(v){ var xp = box.l + (v - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.t); x.lineTo(xp, box.b); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
      cnt.forEach(function(c, k){ var mid = lo + (k + 0.5) * (hi - lo) / nb, hg = c / ym * (box.b - box.t); x.fillStyle = mid > 0 ? C.warn : C.red; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); });
      cvs._hist = { cnt: cnt, lo: lo, hi: hi, box: box, log: false, name: 'log10 D0', series: [['Compounds', cnt]] }; var x0 = box.l + (0 - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.char; x.lineWidth = 1.6; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(x0, box.t); x.lineTo(x0, box.b); x.stroke(); x.setLineDash([]);
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('log10 of the dose number, D0', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(12, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Compounds', 0, 0); x.restore(); x.textAlign = 'left'; x.fillStyle = C.warn; x.fillText('D0 above 1: does not dissolve', x0 + 8, box.t + 14); x.font = '12px Aptos, "Segoe UI", sans-serif';
      qs('.ro', pn).innerHTML = 'Dose ' + (dose < 10 ? dose.toFixed(1) : Math.round(dose)) + ' mg in ' + vol + ' mL: <b>' + above.toLocaleString() + ' of ' + AQ.length.toLocaleString() + '</b> compounds (' + (100 * above / AQ.length).toFixed(1) + ' percent) have D0 above 1.';
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Dose number above 1</b><div class="v">' + (100 * above / AQ.length).toFixed(0) + ' percent</div><div class="s">of ' + AQ.length.toLocaleString() + ' compounds</div></div><div class="hint" style="font-size:11.5px">D0 = (dose / volume) / S, with S in mg/mL from logS and MW.</div>';
      api.stat((100 * above / AQ.length).toFixed(0) + ' percent with D0 above 1');
    }
    qs('.d', c1).addEventListener('input', function(){ ld = +this.value; draw(); }); qs('.v', c2).addEventListener('change', function(){ vol = +this.value; draw(); });
    vol = 250; return { render: draw };
  } });

/* ---------- step 4 ---------- */
ABS.add({ short: 'pH-dependent solubility', level: 'applied', title: 'Solubility and pH',
  build: function(api){
    var typ = 'base', pka = 5, ls0 = -2, dose = 100, gp = 1.2, ip = 6.5, vol = 250;
    var pn = api.el('pn', 'left:28px;top:16px;width:600px;height:508px;padding:8px', '<canvas width="584" height="490" style="width:584px;height:490px"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:644px;top:16px;width:288px;height:508px;overflow:auto', '<div class="tl"></div>');
    var c1 = api.addControl('Type <select class="t">' + hepOpts([['base', 'Weak base'], ['acid', 'Weak acid'], ['neutral', 'Neutral']], typ) + '</select>'), c2 = api.addControl('pKa <input type="range" class="k" min="1" max="12" step="0.1" value="' + pka + '" style="width:100px"> <b class="kv"></b>'), c3 = api.addControl('S0 <input type="range" class="s" min="-4" max="2" step="0.1" value="' + ls0 + '" style="width:100px"> <b class="sv"></b> mg/mL'), c4 = api.addControl('Dose <select class="d">' + hepOpts([['10', '10 mg'], ['50', '50 mg'], ['100', '100 mg'], ['250', '250 mg'], ['500', '500 mg']], '100') + '</select>'), c5 = api.addControl('Gastric pH <input type="range" class="g" min="1" max="6" step="0.1" value="' + gp + '" style="width:80px"> <b class="gv"></b>'), c6 = api.addControl('Intestinal pH <input type="range" class="i" min="5" max="8" step="0.1" value="' + ip + '" style="width:80px"> <b class="iv"></b>');
    function S(ph){ var s0 = Math.pow(10, ls0); return typ === 'acid' ? s0 * (1 + Math.pow(10, ph - pka)) : (typ === 'base' ? s0 * (1 + Math.pow(10, pka - ph)) : s0); }
    function draw(){
      qs('.kv', c2).textContent = pka.toFixed(1); qs('.sv', c3).textContent = Math.pow(10, ls0).toPrecision(2); qs('.gv', c5).textContent = gp.toFixed(1); qs('.iv', c6).textContent = ip.toFixed(1);
      var g = cv(cvs), x = g.x, box = { l: 58, r: g.w - 14, t: 14, b: g.h - 42 }, lo = 1, hi = 8, ylo = -3, yhi = 4;
      var sx = function(p){ return box.l + (p - lo) / (hi - lo) * (box.r - box.l); }, sy = function(l){ return box.b - (l - ylo) / (yhi - ylo) * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right'; for (var e = ylo; e <= yhi; e++) { x.beginPath(); x.moveTo(box.l, sy(e)); x.lineTo(box.r, sy(e)); x.stroke(); x.fillText(String(e), box.l - 6, sy(e) + 4); }
      x.textAlign = 'center'; for (var p = 1; p <= 8; p++) { x.beginPath(); x.moveTo(sx(p), box.t); x.lineTo(sx(p), box.b); x.stroke(); x.fillText(String(p), sx(p), box.b + 16); }
      var d0 = function(ph){ return (dose / vol) / S(ph); }, fm = function(v){ return (v < 0.001 || v >= 10000) ? v.toExponential(2) : v.toPrecision(3); };
      x.strokeStyle = C.char; x.setLineDash([5, 4]); x.lineWidth = 1.4; x.beginPath(); x.moveTo(box.l, sy(0)); x.lineTo(box.r, sy(0)); x.stroke(); x.setLineDash([]); x.fillStyle = C.char; x.textAlign = 'left'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('D0 = 1', box.l + 6, sy(0) - 5);
      x.strokeStyle = C.red; x.lineWidth = 2.8; x.beginPath(); for (var i = 0; i <= 140; i++) { var ph = lo + (hi - lo) * i / 140, l = Math.max(ylo, Math.min(yhi, Math.log10(d0(ph)))); i ? x.lineTo(sx(ph), sy(l)) : x.moveTo(sx(ph), sy(l)); } x.stroke();
      [[gp, 'Gastric'], [ip, 'Intestinal']].forEach(function(m){ var l = Math.max(ylo, Math.min(yhi, Math.log10(d0(m[0])))); x.strokeStyle = C.warn; x.lineWidth = 1.4; x.beginPath(); x.moveTo(sx(m[0]), box.t); x.lineTo(sx(m[0]), box.b); x.stroke(); x.fillStyle = C.warn; x.beginPath(); x.arc(sx(m[0]), sy(l), 6, 0, 6.3); x.fill(); x.fillStyle = C.warn; x.textAlign = 'left'; x.fillText(m[1], sx(m[0]) + 6, box.t + 14); });
      x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('pH', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('log10 of the dose number, D0', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      var dg = d0(gp), di = d0(ip);
      qs('.tl', side).innerHTML = [['Gastric pH ' + gp.toFixed(1), 'S ' + fm(S(gp)) + ' mg/mL, D0 ' + fm(dg)], ['Intestinal pH ' + ip.toFixed(1), 'S ' + fm(S(ip)) + ' mg/mL, D0 ' + fm(di)], ['Dissolved at stomach pH', dg <= 1 ? 'yes, D0 is 1 or below' : 'no, D0 above 1'], ['Dissolved at intestinal pH', di <= 1 ? 'yes, D0 is 1 or below' : 'no, D0 above 1'], ['Solubility ratio, stomach to intestine', fm(S(gp) / S(ip))]].map(function(t){ return '<div style="border-top:1px solid ' + C.silver + ';padding:6px 0;font-size:12.5px"><span style="color:' + C.mid + '">' + t[0] + '</span><br><b>' + t[1] + '</b></div>'; }).join('') + '<div class="hint" style="font-size:11.5px;margin-top:6px">Volume ' + vol + ' mL at every pH.</div>';
      api.stat('D0 at gastric pH ' + fm(dg) + ', at intestinal pH ' + fm(di));
    }
    qs('.t', c1).addEventListener('change', function(){ typ = this.value; draw(); }); qs('.k', c2).addEventListener('input', function(){ pka = +this.value; draw(); }); qs('.s', c3).addEventListener('input', function(){ ls0 = +this.value; draw(); }); qs('.d', c4).addEventListener('change', function(){ dose = +this.value; draw(); }); qs('.g', c5).addEventListener('input', function(){ gp = +this.value; draw(); }); qs('.i', c6).addEventListener('input', function(){ ip = +this.value; draw(); });
    return { render: draw };
  } });

/* ---------- step 5 ---------- */
ABS.add({ short: 'Permeability descriptors', level: 'applied', title: 'Permeability and structure',
  build: function(api){
    var dk = 'tpsa', sel = null, L = { tpsa: ['Topological polar surface area (A^2)', 0, 320], hbd: ['Hydrogen-bond donors', 0, 14], mw: ['Molecular weight (Da)', 0, 1200], logp: ['Crippen logP', -6, 10], hba: ['Hydrogen-bond acceptors', 0, 24] };
    var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('Descriptor <select class="k">' + hepOpts([['tpsa', 'TPSA'], ['hbd', 'H-bond donors'], ['mw', 'Molecular weight'], ['logp', 'Crippen logP'], ['hba', 'H-bond acceptors']], dk) + '</select>');
    function draw(){
      var lab = L[dk], pts = CACO.map(function(r){ return { x: r[dk], y: r.y, d: r }; }), srt = pts.slice().sort(function(a, b){ return a.x - b.x; }), nb = 12, tr = [];
      for (var b = 0; b < nb; b++) { var seg = srt.slice(Math.floor(b * srt.length / nb), Math.floor((b + 1) * srt.length / nb)); if (!seg.length) continue; var ys = seg.map(function(p){ return p.y; }).sort(function(p, q){ return p - q; }); tr.push([seg.reduce(function(s, p){ return s + p.x; }, 0) / seg.length, ys[Math.floor(ys.length / 2)]]); }
      aLinScatter(cvs, pts, { xlo: lab[1], xhi: lab[2], ylo: -8.5, yhi: -3, xl: lab[0], yl: 'Caco-2 log10 Papp (cm/s)', sel: sel, trend: tr });
      var rho = aSpearman(pts.map(function(p){ return p.x; }), pts.map(function(p){ return p.y; }));
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Spearman correlation</b><div class="v">' + rho.toFixed(2) + '</div><div class="s">' + CACO.length + ' compounds</div></div>';
      qs('.det', side).innerHTML = sel ? '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + sel.name + '</div>' + aRows([['log10 Papp', sel.y.toFixed(2)], ['TPSA', sel.tpsa], ['Donors, acceptors', sel.hbd + ', ' + sel.hba], ['MW', sel.mw], ['Crippen logP', sel.logp]]) : '<div class="hint" style="font-size:12px">Select a point.</div>';
      api.stat('Spearman ' + rho.toFixed(2) + ' for ' + lab[0]);
    }
    qs('.k', c1).addEventListener('change', function(){ dk = this.value; draw(); }); cvs.addEventListener('click', function(ev){ sel = hepHit(cvs, ev); draw(); });
    return { render: draw };
  } });

/* ---------- step 6 ---------- */
ABS.add({ short: 'Property rules', level: 'advanced', title: 'Property rules for absorption',
  build: function(api){
    var T = { mw: [true, 500], logp: [true, 5], hbd: [true, 5], hba: [true, 10], tpsa: [false, 140], rb: [false, 10] }, need = 1, sel = 'lip1';
    var PRE = { lip1: ['Rule of five, 1 violation', { mw: 1, logp: 1, hbd: 1, hba: 1, tpsa: 0, rb: 0 }, 1], lip2: ['Rule of five, 2 violations', { mw: 1, logp: 1, hbd: 1, hba: 1, tpsa: 0, rb: 0 }, 2], veb: ['Veber, 1 violation', { mw: 0, logp: 0, hbd: 0, hba: 0, tpsa: 1, rb: 1 }, 1], tp: ['TPSA above 140 only', { mw: 0, logp: 0, hbd: 0, hba: 0, tpsa: 1, rb: 0 }, 1], hd: ['More than 5 donors only', { mw: 0, logp: 0, hbd: 1, hba: 0, tpsa: 0, rb: 0 }, 1] };
    var pn = api.el('pn', 'left:28px;top:16px;width:430px;height:508px;padding:8px', '<canvas class="a" width="414" height="330" style="width:414px;height:330px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>');
    var pn2 = api.el('pn', 'left:474px;top:16px;width:458px;height:508px;padding:8px', '<canvas class="b" width="442" height="250" style="width:442px;height:250px"></canvas><div class="th" style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;font-size:12px"></div>');
    var ca = qs('.a', pn), cb = qs('.b', pn2), th = qs('.th', pn2);
    var KEY = [['mw', 'MW above', 10], ['logp', 'logP above', 0.5], ['hbd', 'Donors above', 1], ['hba', 'Acceptors above', 1], ['tpsa', 'TPSA above', 5], ['rb', 'Rot. bonds above', 1]];
    th.innerHTML = KEY.map(function(k){ return '<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-k="' + k[0] + '"> ' + k[1] + ' <input type="number" data-t="' + k[0] + '" step="' + k[2] + '" style="width:64px"></label>'; }).join('');
    var c1 = api.addControl('Preset <select class="p">' + hepOpts(Object.keys(PRE).map(function(k){ return [k, PRE[k][0]]; }), sel) + '</select>'), c2 = api.addControl('Violations to flag <select class="n">' + hepOpts([['1', '1'], ['2', '2'], ['3', '3']], '1') + '</select>');
    function sync(){ KEY.forEach(function(k){ qs('[data-k="' + k[0] + '"]', th).checked = T[k[0]][0]; qs('[data-t="' + k[0] + '"]', th).value = T[k[0]][1]; }); qs('.n', c2).value = String(need); }
    function setPreset(id){ var p = PRE[id]; KEY.forEach(function(k){ T[k[0]][0] = !!p[1][k[0]]; }); T.mw[1] = 500; T.logp[1] = 5; T.hbd[1] = 5; T.hba[1] = 10; T.tpsa[1] = 140; T.rb[1] = 10; need = p[2]; sync(); }
    function draw(){
      var tp = 0, fn = 0, fp = 0, tn = 0;
      HIA.forEach(function(h){ var v = 0; KEY.forEach(function(k){ if (T[k[0]][0] && h[k[0]] > T[k[0]][1]) v++; }); var flag = v >= need; if (h.y === 0) { flag ? tp++ : fn++; } else { flag ? fp++ : tn++; } });
      var n = HIA.length, acc = (tp + tn) / n, base = 500 / n, sens = tp / 78, spec = tn / 500;
      var g = cv(ca), x = g.x, box = { l: 60, r: g.w - 14, t: 30, b: g.h - 30 }, bw = (box.r - box.l) / 2 - 24;
      ca._bars = []; [[0, 'Poor absorption (78)', fn, tp, C.tint, C.red], [1, 'Good absorption (500)', tn, fp, C.silver, C.warn]].forEach(function(c){ var bx = box.l + c[0] * ((box.r - box.l) / 2) + 12, tot = c[2] + c[3], hOk = (box.b - box.t) * (c[0] === 0 ? c[3] : c[2]) / tot, hBad = (box.b - box.t) - hOk;
        ca._bars.push({ x0: bx, x1: bx + bw, y0: box.b - hOk, y1: box.b, lines: [c[0] === 0 ? 'Poor compounds flagged poor' : 'Good compounds flagged good', (c[0] === 0 ? tp : tn) + ' of ' + (c[2] + c[3])] }, { x0: bx, x1: bx + bw, y0: box.t, y1: box.t + hBad, lines: [c[0] === 0 ? 'Poor compounds missed' : 'Good compounds flagged poor', (c[0] === 0 ? fn : fp) + ' of ' + (c[2] + c[3])] }); x.fillStyle = c[0] === 0 ? C.red : C.silver; x.fillRect(bx, box.b - hOk, bw, hOk); x.fillStyle = c[0] === 0 ? C.tint : C.warn; x.fillRect(bx, box.t, bw, hBad); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(c[1], bx + bw / 2, box.t - 10);
        x.fillStyle = c[0] === 0 ? '#fff' : C.char; x.fillText((c[0] === 0 ? 'flagged poor ' + tp : 'flagged good ' + tn), bx + bw / 2, box.b - hOk / 2 + 4); x.fillStyle = C.char; x.fillText((c[0] === 0 ? 'missed ' + fn : 'flagged poor ' + fp), bx + bw / 2, box.t + hBad / 2 + 4); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
      qs('.ra', pn).innerHTML = 'Poor compounds caught: <b>' + tp + ' of 78</b> (' + (100 * sens).toFixed(0) + ' percent). Good compounds flagged: <b>' + fp + ' of 500</b>. Accuracy <b>' + (100 * acc).toFixed(1) + ' percent</b>, against <b>' + (100 * base).toFixed(1) + ' percent</b> for calling every compound good. Balanced accuracy <b>' + (100 * (sens + spec) / 2).toFixed(1) + ' percent</b>.';
      var g2 = cv(cb), x2 = g2.x, b2 = { l: 90, r: g2.w - 40, t: 26, b: g2.h - 20 }, ds = [['tpsa', 'TPSA'], ['hbd', 'Donors'], ['mw', 'MW'], ['hba', 'Acceptors'], ['rb', 'Rot. bonds'], ['logp', 'Crippen logP']], bh = (b2.b - b2.t) / ds.length, sxa = function(a){ return b2.l + a * (b2.r - b2.l); };
      x2.fillStyle = C.char; x2.font = '600 12px Aptos, "Segoe UI", sans-serif'; x2.textAlign = 'left'; x2.fillText('Area under the ROC curve for poor against good', 6, 14); x2.font = '12px Aptos, "Segoe UI", sans-serif';
      var poor = HIA.filter(function(h){ return h.y === 0; }), good = HIA.filter(function(h){ return h.y === 1; });
      x2.strokeStyle = C.silver; x2.lineWidth = 1; [0, 0.5, 1].forEach(function(v){ x2.beginPath(); x2.moveTo(sxa(v), b2.t); x2.lineTo(sxa(v), b2.b); x2.stroke(); x2.fillStyle = C.mid; x2.textAlign = 'center'; x2.fillText(v.toFixed(1), sxa(v), b2.b + 14); });
      cb._bars = []; ds.forEach(function(d, i){ var a = aAUC(poor.map(function(h){ return h[d[0]]; }), good.map(function(h){ return h[d[0]]; })), y = b2.t + i * bh + 4; cb._bars.push({ x0: Math.min(sxa(0.5), sxa(a)), x1: Math.max(sxa(0.5), sxa(a)), y0: y, y1: y + bh - 10, lines: [d[1], 'AUC ' + a.toFixed(3), a < 0.5 ? 'lower values favor good absorption' : 'higher values favor good absorption'] }); x2.fillStyle = a < 0.5 ? C.warn : C.red; x2.fillRect(Math.min(sxa(0.5), sxa(a)), y, Math.abs(sxa(a) - sxa(0.5)), bh - 10); x2.fillStyle = C.char; x2.textAlign = 'right'; x2.fillText(d[1], b2.l - 8, y + (bh - 10) / 2 + 4); x2.textAlign = 'left'; x2.fillText(a.toFixed(3), Math.max(sxa(a), sxa(0.5)) + 6, y + (bh - 10) / 2 + 4); });
      api.stat('Accuracy ' + (100 * acc).toFixed(1) + ' percent, baseline ' + (100 * base).toFixed(1) + ' percent');
    }
    th.addEventListener('change', function(e){ var t = e.target; if (t.dataset.k) T[t.dataset.k][0] = t.checked; if (t.dataset.t) T[t.dataset.t][1] = +t.value; draw(); });
    qs('.p', c1).addEventListener('change', function(){ setPreset(this.value); draw(); }); qs('.n', c2).addEventListener('change', function(){ need = +this.value; draw(); });
    setPreset('lip1');
    return { render: draw };
  } });
