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

  /* ===== step 0: animated nephron schematic ===== */
  /* Each molecule entering the afferent arteriole is unbound with probability fu. An unbound molecule is filtered with probability GFR / RPF;
     a molecule left in the peritubular capillary is secreted with probability CLsec / (RPF - fu GFR); a molecule in the lumen is reabsorbed
     with probability FR. The expected urine fraction is (fu GFR + CLsec) (1 - FR) / RPF, so RPF x (urine count / molecules completed) estimates CLr. */
  RN.add({ short: 'Nephron schematic', level: 'foundations', ord: 5, title: 'Nephron handling of a drug',
    build: function(api){
      var S = IX.state('rnx', { f: -0.3, g: 120, s: 150, r: 0.2, kf: 1, inh: 0 });
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('f', 'fu', -2, 0, 0.05, S.f)), c2 = api.addControl(IX.slider('g', 'GFR', 10, 180, 5, S.g, 'mL/min')), c3 = api.addControl(IX.slider('s', 'CLsec', 0, 400, 5, S.s, 'mL/min')),
        c4 = api.addControl(IX.slider('r', 'FR', 0, 0.99, 0.01, S.r)), c5 = api.addControl(IX.slider('kf', 'Renal function', 0.1, 1, 0.05, S.kf, 'fraction of normal')),
        c6 = api.addControl('<label style="cursor:pointer"><input type="checkbox" class="inh"' + (S.inh ? ' checked' : '') + '> Secretion inhibitor</label>');
      var RPF0 = 650, INH = 0.2, LAM = 30, VB = 180, VL = 90, VF = 60, VS = 45, VR = 35, TMAX = 18, NMAX = 290, NU = 70;
      var GX = 100, GY = 165, CY = 62, CHW = 13, LY = 165, X0 = 146, XD0 = 340, XD1 = 516, XT = [178, 208, 238, 268, 298], BLK = [1, 1, 0, 1, 1];
      var VES = '#F4E4E0', VESS = '#B98A80', LUM = '#FBF6E4', LUMS = '#B8A878', ALB = '#DCE2E8', BDRUG = '#7D8A99';
      var rnd = SC.rand(7), par = null, parts = [], urine = [], acc = 0, simT = 0, ep = 0, pend = [], tot = null, dirty = true, lastSide = -1, lock = null, hv = -1, warmKey = '', G = null;
      function fz(v){ return v === 0 ? '0' : fx(v); }
      function P(){ var fu = Math.pow(10, S.f), g = S.g * S.kf, cs = S.s * S.kf * (S.inh ? INH : 1), rpf = RPF0 * S.kf, fl = fu * g, ex = fl + cs, re = ex * S.r;
        return { fu: fu, g: g, cs: cs, rpf: rpf, fl: fl, ex: ex, re: re, clr: ex - re, pf: g / rpf, ps: Math.min(1, cs / (rpf - fl)) }; }
      function mk(pts){ var c = [0], i; for (i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { p: pts, c: c, len: c[c.length - 1] }; }
      function at(Pp, s){ var i = 1; while (i < Pp.c.length - 1 && Pp.c[i] < s) i++; var a = Pp.p[i - 1], b = Pp.p[i], L = (Pp.c[i] - Pp.c[i - 1]) || 1, t = cl((s - Pp.c[i - 1]) / L, 0, 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (b[0] - a[0]) / L, (b[1] - a[1]) / L]; }
      var B = mk([[-10, GY], [66, GY], [84, 182], [112, 178], [118, 156], [108, 140], [108, CY], [640, CY]]), sT = B.c[3], sCap = B.c[6];
      var L = mk([[X0, LY], [520, LY], [560, 205], [560, 398]]);
      function hw0(){ return Math.min(22, 8 + 12 * Math.sqrt(par.g / 120)); }
      function hwL(x){ var h = hw0(); return h * (1 - 0.55 * cl((x - X0) / (520 - X0), 0, 1)); }
      function hd(){ return Math.max(5, 0.45 * hw0()); }
      function bhw(s){ return s < B.c[1] ? 5 : (s < sCap ? 4 : CHW - 3); }
      function lhw(s){ return s <= 520 - X0 ? hwL(X0 + s) - 3 : hd() - 2; }
      function pos(p){ var q; if (p.m === 'b') { q = at(B, p.s); var w = bhw(p.s) * p.j; return [q[0] - q[3] * w, q[1] + q[2] * w]; } if (p.m === 'l') { q = at(L, p.s); var w2 = lhw(p.s) * p.j; return [q[0] - q[3] * w2, q[1] + q[2] * w2]; } if (p.m === 'u') return [p.x, p.y]; q = at(p.P, p.s); return [q[0], q[1]]; }
      function resetStats(){ ep++; pend = []; tot = { n: 0, f: 0, s: 0, r: 0, u: 0 }; }
      function done(p, u){ if (p.deco || p.ep !== ep) return; pend.push({ bt: p.bt, f: p.F, s: p.S, r: p.R, u: u }); }
      function spawn(){ if (parts.length >= NMAX) return; parts.push({ m: 'b', s: 0, j: rnd() * 2 - 1, bound: rnd() >= par.fu, ep: ep, bt: simT, F: 0, S: 0, R: 0 }); }
      function toFilt(p){ var q = pos(p), a = Math.atan2(q[1] - GY, q[0] - GX), y1 = LY + p.j * 0.5 * hwL(X0 + 8); p.P = mk([q, [GX + 33 * Math.cos(a), GY + 33 * Math.sin(a)], [GX + 33 * Math.cos(a / 2), GY + 33 * Math.sin(a / 2)], [GX + 37, GY + (y1 - LY) * 0.5], [X0 + 8, y1]]); p.m = 'f'; p.v = VF; p.s = 0; p.F = 1; p.nm = 'l'; p.ns = 8; }
      function toSec(p){ var q = pos(p), xt = p.sx, lt = LY - hwL(xt), ct = lt - 20, y1 = LY + p.j * 0.5 * hwL(xt + 10);
        if (p.bound) { parts.push({ m: 'b', s: p.s, j: p.j, bound: true, deco: true }); p.bound = false; }
        p.P = mk([q, [xt, CY + CHW + 2], [xt, ct - 2], [xt, ct + 4], [xt, lt - 2], [xt + 3, lt + 5], [xt + 10, y1]]); p.m = 's'; p.v = VS; p.s = 0; p.S = 1; p.nm = 'l'; p.ns = xt + 10 - X0; }
      function toReab(p){ var q = pos(p), rx = p.rx, lt = LY - hwL(rx), ct = lt - 20, j = rnd() * 2 - 1; p.P = mk([q, [rx + 2, lt + 2], [rx + 6, ct - 2], [rx + 14, (ct + CY + CHW) / 2], [rx + 22, CY + j * (CHW - 3)]]); p.m = 'r'; p.v = VR; p.s = 0; p.R = 1; p.nm = 'b'; p.ns = sCap + rx + 22 - 108; p.j = j; p.rx = 0; }
      function step(dt){
        simT += dt; acc += dt * LAM; while (acc >= 1) { acc -= 1; spawn(); }
        var i, p, s0, open = S.inh ? XT.filter(function(x, k){ return !BLK[k]; }) : XT;
        for (i = parts.length - 1; i >= 0; i--) {
          p = parts[i]; p.j = cl(p.j + (rnd() - 0.5) * dt * 3, -1, 1);
          if (p.m === 'b') {
            s0 = p.s; p.s += VB * dt;
            if (!p.deco && s0 < sT && p.s >= sT && !p.bound && rnd() < par.pf) { toFilt(p); continue; }
            if (!p.deco && s0 < sCap && p.s >= sCap && rnd() < par.ps) p.sx = open[Math.floor(rnd() * open.length)];
            if (p.sx && p.s >= sCap + p.sx - 108 - 4) { toSec(p); p.sx = 0; continue; }
            if (p.s >= B.len) { done(p, 0); parts.splice(i, 1); }
          } else if (p.m === 'l') {
            s0 = p.s; p.s += VL * dt;
            if (!p.R && s0 < XD0 - X0 && p.s >= XD0 - X0 && rnd() < S.r) p.rx = XD0 + 6 + (XD1 - XD0 - 16) * Math.sqrt(rnd());
            if (p.rx && p.s >= p.rx - X0) { toReab(p); continue; }
            if (p.s >= L.len) { done(p, 1); parts.splice(i, 1); urine.push({ x: 526 + rnd() * 70, y: 428 + rnd() * 42 }); if (urine.length > NU) urine.shift(); }
          } else if (p.m !== 'u') {
            p.s += p.v * dt; if (p.s >= p.P.len) { p.m = p.nm; p.s = p.ns; p.P = null; }
          }
        }
        if (pend.length) { var lim = simT - TMAX, keep = []; pend.forEach(function(r){ if (r.bt <= lim) { tot.n++; tot.f += r.f; tot.s += r.s; tot.r += r.r; tot.u += r.u; } else keep.push(r); }); pend = keep; }
      }
      function warm(sec){ parts = []; urine = []; acc = 0; resetStats(); var k, n = Math.round(sec / 0.05); for (k = 0; k < n; k++) step(0.05); warmKey = JSON.stringify(S); }
      function sim(){ if (tot.n < 20) return null; var R = par.rpf / tot.n; return { f: tot.f * R, s: tot.s * R, r: tot.r * R, u: tot.u * R }; }
      function aw(v){ return 2 + 14 * Math.min(v, 400) / 400; }
      function vmax(){ return lock ? lock : Math.max(par.ex, 20) * 1.15; }
      var BX0 = 136, BX1 = 372;
      function bsx(v){ return BX0 + v / vmax() * (BX1 - BX0); }
      function rowY(i){ return 290 + i * 22; }
      function drawMol(x, px, py, bound, deco){ if (bound) { x.beginPath(); x.ellipse(px, py, 5.5, 4, 0, 0, 6.2832); x.fillStyle = ALB; x.fill(); x.lineWidth = 1; x.strokeStyle = C.bg; x.stroke(); if (!deco) SC.dot(x, px + 4, py - 2.5, 2.6, BDRUG); } else SC.dot(x, px, py, 3.2, C.red, '#FFFFFF'); }
      function paint(){
        var g = cv(cvs), x = g.x, t = simT, i, xx, h = hw0(), q = par, sm = sim();
        x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, g.w, g.h);
        /* Bowman's capsule, afferent and efferent arterioles, peritubular capillary, glomerular tuft */
        x.beginPath(); x.arc(GX, GY, 46, 0, 6.2832); x.fillStyle = LUM; x.fill(); x.lineWidth = 3; x.strokeStyle = C.bg; x.stroke();
        x.lineWidth = 1.2; x.strokeStyle = VESS; x.fillStyle = VES;
        SC.rr(x, -4, GY - 7, 78, 14, 6); x.fill(); x.stroke();
        SC.rr(x, 102, CY - 6, 12, 92, 5); x.fill(); x.stroke();
        SC.rr(x, 102, CY - CHW, 540, 2 * CHW, 11); x.fill(); x.stroke();
        [[-10, -8], [8, -10], [12, 6], [-2, 12], [-14, 6], [0, 0], [14, -6]].forEach(function(o){ x.beginPath(); x.arc(GX + o[0], GY + o[1], 9, 0, 6.2832); x.fillStyle = VES; x.fill(); x.strokeStyle = VESS; x.stroke(); });
        /* tubule: collecting duct, then lumen polygon that tapers as water is reabsorbed */
        x.lineJoin = 'round'; x.lineCap = 'butt'; x.beginPath(); x.moveTo(516, LY); x.lineTo(560, 205); x.lineTo(560, 400); x.strokeStyle = LUMS; x.lineWidth = 2 * hd() + 3; x.stroke(); x.strokeStyle = LUM; x.lineWidth = 2 * hd(); x.stroke();
        x.beginPath(); for (xx = 136; xx <= 520; xx += 8) x.lineTo(xx, LY - hwL(xx)); for (xx = 520; xx >= 136; xx -= 8) x.lineTo(xx, LY + hwL(xx)); x.closePath(); x.fillStyle = LUM; x.fill();
        x.strokeStyle = LUMS; x.lineWidth = 1.4; [-1, 1].forEach(function(sg){ x.beginPath(); for (xx = 141; xx <= 520; xx += 8) x.lineTo(xx, LY + sg * hwL(xx)); x.stroke(); });
        /* epithelial cells, brush border in the proximal tubule */
        [[150, 330, 1], [340, 516, 0]].forEach(function(sgm){ var w = (sgm[1] - sgm[0]) / 7, k; for (k = 0; k < 7; k++) { var xa = sgm[0] + k * w + 1, xb = xa + w - 2, xc = (xa + xb) / 2;
          [-1, 1].forEach(function(sg){ x.beginPath(); x.moveTo(xa, LY + sg * hwL(xa)); x.lineTo(xb, LY + sg * hwL(xb)); x.lineTo(xb, LY + sg * (hwL(xb) + 20)); x.lineTo(xa, LY + sg * (hwL(xa) + 20)); x.closePath(); x.fillStyle = sgm[2] ? C.light : '#F3F6F8'; x.fill(); x.strokeStyle = C.bg; x.lineWidth = 1; x.stroke();
            x.beginPath(); x.ellipse(xc, LY + sg * (hwL(xc) + 10), 4, 3, 0, 0, 6.2832); x.fillStyle = C.silver; x.fill(); }); } });
        x.strokeStyle = C.bg; x.lineWidth = 1; x.beginPath(); for (xx = 152; xx <= 328; xx += 3) { x.moveTo(xx, LY - hwL(xx)); x.lineTo(xx, LY - hwL(xx) + 3); x.moveTo(xx, LY + hwL(xx)); x.lineTo(xx, LY + hwL(xx) - 3); } x.stroke();
        /* transporters: basolateral uptake (OAT, OCT), apical efflux (MATE, P-gp) */
        XT.forEach(function(xt, k){ var lt = LY - hwL(xt), bt = lt - 20, off = S.inh && BLK[k]; x.globalAlpha = off ? 0.45 : 1; SC.rr(x, xt - 5, bt - 5, 10, 10, 3); x.fillStyle = C.dred; x.fill(); SC.rr(x, xt - 5, lt - 5, 10, 10, 3); x.fillStyle = C.tint; x.fill(); x.strokeStyle = C.dred; x.lineWidth = 1.2; x.stroke(); x.globalAlpha = 1;
          if (off) SC.dot(x, xt + Math.sin(t * 3 + k) * 0.8, bt - 8, 3.6, C.warn, '#FFFFFF'); });
        if (hv === 9) { var lt9 = LY - hwL(238); SC.rr(x, 166, lt9 - 36, 144, 44, 6); x.strokeStyle = C.warn; x.lineWidth = 1.2; x.setLineDash([3, 3]); x.stroke(); x.setLineDash([]); }
        if (S.inh) for (i = 0; i < 6; i++) { var ix = 112 + ((t * VB * 0.6 + i * 88) % 510); SC.dot(x, ix, CY + Math.sin(i * 1.7 + t * 2) * 8, 3.4, C.warn, '#FFFFFF'); }
        /* flux arrows, width proportional to drug flux */
        x.globalAlpha = 0.3; SC.arrow(x, X0 + 8, LY, X0 + 58, LY, C.red, aw(q.fl), aw(q.fl) + 8); if (q.cs > 0) SC.arrow(x, 318, CY + CHW + 3, 318, LY - hwL(318) + 8, C.dred, aw(q.cs), aw(q.cs) + 8);
        if (q.re > 0) SC.arrow(x, 470, LY - hwL(470) + 2, 470, CY + CHW + 3, GREY, aw(q.re), aw(q.re) + 8); if (q.clr > 0) SC.arrow(x, 604, 232, 604, 376, C.red, aw(q.clr), aw(q.clr) + 8); x.globalAlpha = 1;
        /* urine container */
        x.beginPath(); x.moveTo(516, 424); x.lineTo(606, 424); x.lineTo(606, 470); x.arcTo(606, 478, 598, 478, 8); x.lineTo(524, 478); x.arcTo(516, 478, 516, 470, 8); x.closePath(); x.fillStyle = LUM; x.fill();
        x.beginPath(); x.moveTo(516, 392); x.lineTo(516, 470); x.arcTo(516, 478, 524, 478, 8); x.lineTo(598, 478); x.arcTo(606, 478, 606, 470, 8); x.lineTo(606, 392); x.strokeStyle = C.char; x.lineWidth = 1.6; x.stroke();
        urine.forEach(function(u){ SC.dot(x, u.x, u.y, 3, C.red, '#FFFFFF'); });
        /* molecules */
        parts.forEach(function(p){ var r = pos(p); drawMol(x, r[0], r[1], p.bound, p.deco); });
        /* labels */
        var fs = { size: 11 }, fb = { size: 12, bold: true };
        SC.text(x, 'Peritubular capillary, plasma to renal vein', 132, 42, fb);
        SC.text(x, 'Afferent', 4, 188, fs); SC.text(x, 'arteriole', 4, 201, fs); SC.text(x, 'Efferent arteriole', 98, 100, { size: 11, align: 'right' });
        SC.text(x, 'Glomerulus,', GX, 226, { size: 11, align: 'center', bold: true }); SC.text(x, "Bowman's capsule", GX, 239, { size: 11, align: 'center' });
        SC.text(x, 'Proximal tubule', 160, 226, fb); SC.text(x, 'secretion via OAT, OCT', 160, 239, fs); SC.text(x, 'and MATE, P-gp', 160, 252, fs);
        SC.text(x, 'Loop of Henle, distal tubule', 348, 226, fb); SC.text(x, 'passive reabsorption', 348, 239, fs);
        SC.text(x, 'CLsec ' + fz(q.cs), 324, 104, { size: 11, color: C.dred, bold: true }); SC.text(x, 'reabsorbed ' + fz(q.re), 478, 104, { size: 11, color: C.char, bold: true });
        x.save(); x.translate(579, 236); x.rotate(Math.PI / 2); SC.text(x, 'Collecting duct', 0, 0, fs); x.restore();
        SC.text(x, 'Urine', 508, 424, { size: 12, bold: true, align: 'right' }); SC.text(x, 'n = ' + tot.u + ' of ' + tot.n, 508, 440, { size: 11, align: 'right' });
        /* flux bars: equation (bar) and simulation (tick) */
        SC.text(x, 'Flux, mL/min of plasma: bar = equation, tick = simulated count', 12, 270, { size: 11, bold: true, color: C.mid });
        var vm = vmax(), rows = [['Filtered, fu x GFR', q.fl, sm && sm.f, C.tint], ['Secreted, CLsec', q.cs, sm && sm.s, C.dred], ['Reabsorbed', q.re, sm && sm.r, GREY], ['Urine, CLr', q.clr, sm && sm.u, C.red]];
        G = { vm: vm };
        rows.forEach(function(rw, k){ var y = rowY(k), xe = bsx(rw[1]); SC.text(x, rw[0], 12, y, { size: 11.5, bold: k === 3 }); x.fillStyle = C.light; x.fillRect(BX0, y - 11, BX1 - BX0, 14); x.fillStyle = rw[3]; x.fillRect(BX0, y - 11, Math.max(0, Math.min(xe, BX1 + 30) - BX0), 14);
          if (rw[2] !== null && rw[2] !== undefined) { var xs = Math.min(bsx(rw[2]), BX1 + 30); x.fillStyle = C.char; x.fillRect(xs - 1, y - 14, 2.4, 20); }
          SC.text(x, 'eq ' + fz(rw[1]) + ', sim ' + (rw[2] === null || rw[2] === undefined ? 'collecting' : fz(rw[2])), BX1 + 38, y, { size: 11 });
          if (k < 3) { x.beginPath(); x.arc(xe, y - 4, hv === k ? 6.5 : 5, 0, 6.2832); x.fillStyle = '#FFFFFF'; x.fill(); x.strokeStyle = C.char; x.lineWidth = 1.6; x.stroke(); } });
        var xf = bsx(q.fl); x.strokeStyle = C.char; x.lineWidth = 1.2; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(xf, 276); x.lineTo(xf, 362); x.stroke(); x.setLineDash([]); SC.text(x, 'fu x GFR', xf, 375, { size: 11, align: 'center' });
        /* legend */
        var lx1 = 16, lx2 = 196, ly = [400, 418, 436, 454];
        drawMol(x, lx1 + 5, ly[0] - 4, false); SC.text(x, 'unbound drug', lx1 + 18, ly[0], fs);
        drawMol(x, lx1 + 4, ly[1] - 4, true); SC.text(x, 'albumin-bound drug', lx1 + 18, ly[1], fs);
        SC.dot(x, lx1 + 5, ly[2] - 4, 3.6, C.warn, '#FFFFFF'); SC.text(x, 'inhibitor', lx1 + 18, ly[2], fs);
        x.fillStyle = VES; x.strokeStyle = VESS; x.lineWidth = 1; x.fillRect(lx1, ly[3] - 10, 12, 10); x.strokeRect(lx1, ly[3] - 10, 12, 10); SC.text(x, 'plasma', lx1 + 18, ly[3], fs);
        SC.rr(x, lx2, ly[0] - 10, 10, 10, 3); x.fillStyle = C.dred; x.fill(); SC.text(x, 'OAT, OCT, basolateral uptake', lx2 + 16, ly[0], fs);
        SC.rr(x, lx2, ly[1] - 10, 10, 10, 3); x.fillStyle = C.tint; x.fill(); x.strokeStyle = C.dred; x.lineWidth = 1.2; x.stroke(); SC.text(x, 'MATE, P-gp, apical efflux', lx2 + 16, ly[1], fs);
        x.globalAlpha = 0.3; SC.arrow(x, lx2, ly[2] - 5, lx2 + 12, ly[2] - 5, C.red, 6, 9); x.globalAlpha = 1; SC.text(x, 'flux, width proportional', lx2 + 16, ly[2], fs);
        x.fillStyle = LUM; x.strokeStyle = LUMS; x.fillRect(lx2, ly[3] - 10, 12, 10); x.strokeRect(lx2, ly[3] - 10, 12, 10); SC.text(x, 'tubular fluid', lx2 + 16, ly[3], fs);
      }
      function updSide(){
        var q = par, sm = sim(), ratio = q.clr / Math.max(q.fl, 1e-9), net = ratio > 1.0001 ? 'net secretion' : (ratio < 0.9999 ? 'net reabsorption' : 'filtration only'), nu = tot.u, n = tot.n;
        qs('.sd', side).innerHTML = fTile('Renal clearance, CLr', fz(q.clr) + ' mL/min', '(fu x GFR + CLsec) x (1 - FR)') + fRows([['Filtration, fu x GFR', fz(q.fl) + ' mL/min'], ['Secretion, CLsec' + (S.inh ? ', inhibited' : ''), fz(q.cs) + ' mL/min'], ['CLr over fu x GFR', ratio.toFixed(2)], ['CLr over GFR', (q.clr / q.g).toFixed(2)], ['Net transport', net],
          ['Simulated CLr', sm ? fz(sm.u) + ' mL/min' : 'collecting'], ['Molecules to urine', nu + ' of ' + n], ['Expected from equation', (n * q.clr / q.rpf).toFixed(1)], ['GFR, renal plasma flow', fz(q.g) + ', ' + fz(q.rpf) + ' mL/min']]) +
          '<div class="hint" style="font-size:11.5px;margin-top:8px">Molecules are filtered, secreted and reabsorbed with probabilities GFR / RPF (unbound only), CLsec / (RPF - fu x GFR) and FR, where RPF is renal plasma flow. Simulated CLr = RPF x molecules in urine / molecules completed since the last change. Click the transporters to toggle the inhibitor.</div>';
        api.stat('CLr ' + fz(q.clr) + ' mL/min, ' + ratio.toFixed(2) + ' x fu x GFR, ' + net);
      }
      function changed(){ IX.save('rnx', S); par = P(); resetStats(); if (typeof ANIM !== 'undefined' && !ANIM) warm(40); dirty = true; lastSide = -1; draw(); }
      function sync(){ qs('.f', c1).value = S.f; qs('.g', c2).value = S.g; qs('.s', c3).value = S.s; qs('.r', c4).value = S.r; qs('.kf', c5).value = S.kf; qs('.inh', c6).checked = !!S.inh; }
      function labels(){ qs('.fv', c1).textContent = fx(Math.pow(10, S.f)); qs('.gv', c2).textContent = S.g; qs('.sv', c3).textContent = S.s; qs('.rv', c4).textContent = S.r.toFixed(2); qs('.kfv', c5).textContent = S.kf.toFixed(2); }
      function draw(){ labels(); if (typeof ANIM !== 'undefined' && !ANIM && warmKey !== JSON.stringify(S)) warm(40); paint(); updSide(); lastSide = simT; dirty = false; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'nephron-schematic', csv: function(){ var q = par, sm = sim(); return IX.csv([['Quantity (mL/min)', 'Equation', 'Simulated'], ['Filtered, fu x GFR', q.fl, sm ? sm.f : ''], ['Secreted, CLsec', q.cs, sm ? sm.s : ''], ['Reabsorbed', q.re, sm ? sm.r : ''], ['Renal clearance, CLr', q.clr, sm ? sm.u : ''], [], ['fu', q.fu], ['GFR', q.g], ['Renal plasma flow', q.rpf], ['FR', S.r], ['Inhibitor', S.inh ? 'on, CLsec x ' + INH : 'off'], ['Molecules completed', tot.n], ['Molecules in urine', tot.u]]); } });
      [['f', c1], ['g', c2], ['s', c3], ['r', c4], ['kf', c5]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; changed(); }); });
      qs('.inh', c6).addEventListener('change', function(){ S.inh = this.checked ? 1 : 0; changed(); });
      function trZone(p){ var lt = LY - hwL(238); return p.x >= 166 && p.x <= 310 && p.y >= lt - 36 && p.y <= lt + 8; }
      function hit(p){ if (!G) return -1; var i, b = -1, bd = 12, v = [par.fl, par.cs, par.re]; for (i = 0; i < 3; i++) { var d = Math.hypot(p.x - bsx(v[i]), p.y - (rowY(i) - 4)); if (d < bd) { bd = d; b = i; } } return b; }
      IX.attach(cvs, {
        move: function(p){ var i = hit(p), o = hv; hv = i >= 0 ? i : (trZone(p) ? 9 : -1); cvs.style.cursor = i >= 0 ? 'ew-resize' : (hv === 9 ? 'pointer' : 'default'); if (o !== hv) { dirty = true; if (typeof ANIM !== 'undefined' && !ANIM) paint(); } },
        leave: function(){ if (hv !== -1) { hv = -1; dirty = true; if (typeof ANIM !== 'undefined' && !ANIM) paint(); } },
        down: function(p){ var i = hit(p); if (i < 0) return null; lock = vmax(); return { k: i }; },
        drag: function(d, p){ var v = cl((p.x - BX0) / (BX1 - BX0) * lock, 0, lock);
          if (d.k === 0) S.f = cl(Math.round(Math.log10(Math.max(v / par.g, 0.01)) * 20) / 20, -2, 0);
          else if (d.k === 1) S.s = cl(Math.round(v / (S.kf * (S.inh ? INH : 1)) / 5) * 5, 0, 400);
          else S.r = cl(Math.round(v / Math.max(par.ex, 1e-6) * 100) / 100, 0, 0.99);
          sync(); changed(); },
        up: function(){ lock = null; changed(); },
        click: function(p){ if (trZone(p)) { S.inh = S.inh ? 0 : 1; sync(); changed(); } }
      });
      par = P(); sync(); warm(30);
      SC.run(cvs, function(dt){ if (dt > 0) { step(dt); dirty = true; } if (dirty) { dirty = false; paint(); } if (dt > 0 && simT - lastSide > 1.0) { lastSide = simT; updSide(); } });
      return { render: draw };
    } });

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
