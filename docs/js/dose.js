"use strict";
/* Tab 13: human pharmacokinetics and dose. Steady state on repeat oral dosing, allometric scaling of clearance, the daily dose implied by clearance
   and the dosing interval implied by half-life across 667 drugs (Obach et al. 2008), and the conversion of an animal no-observed-adverse-effect level
   to a starting dose (body-surface-area factors of the FDA guidance on starting doses, 2005). */
var DOSE = new Lesson('dose', 'Human PK and dose');
DOSE.noOpts = true;

(function(){
  var GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function fx(v){ return v < 0.0001 ? v.toExponential(1) : (v < 0.01 ? String(+v.toPrecision(2)) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString())))); }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
  function sel(label, cls, list, cur){ return label + ' <select class="' + cls + '">' + list.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
  function med(a){ var s = a.slice().sort(function(p, q){ return p - q; }); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; }
  var DR = OBACH08.filter(function(d){ return d.cl > 0 && d.t12 > 0; });
  var CLH = DR.map(function(d){ return d.cl * 70 * 60 / 1000; });

  /* ===== step 0: animated regimen schematic (depot, central compartment, drain) coupled to the analytic multiple-dose equations ===== */
  DOSE.add({ short: 'Regimen schematic', level: 'foundations', ord: 5, title: 'Dosing regimen and body model',
    build: function(api){
      var S = IX.state('dsx', { d: 200, tau: 12, cl: 5, v: 100, f: 0.8, ka: 1.5, lo: 1.5, hi: 4, sp: 4 }), pins = [], lockYm = null, G = null, D = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('d', 'Dose', 10, 1000, 10, S.d, 'mg')), c2 = api.addControl(IX.slider('tau', 'Interval tau', 2, 48, 1, S.tau, 'h')), c3 = api.addControl(IX.slider('cl', 'CL', 1, 50, 1, S.cl, 'L/h')), c4 = api.addControl(IX.slider('v', 'V', 10, 500, 10, S.v, 'L')), c5 = api.addControl(IX.slider('f', 'F', 0.1, 1, 0.01, S.f)), c6 = api.addControl(IX.slider('ka', 'ka', 0.2, 5, 0.1, S.ka, '1/h')), c7 = api.addControl(IX.slider('sp', 'Speed', 0, 24, 0.5, S.sp, 'h/s'));
      var c8 = api.addControl('<button type="button" class="btn sm gv">Give dose now</button> <button type="button" class="btn sm ghost rs">Restart</button>');
      var CTL = [['d', c1], ['tau', c2], ['cl', c3], ['v', c4], ['f', c5], ['ka', c6], ['sp', c7]], R = SC.rand(11);
      var tm = 0, doses = [], nDose = 0, nextT = 0, lastSched = -1e9, pills = [], parts = [], snap = true;
      var CX = 175, DEP = { l: 115, r: 235, t: 44, b: 100 }, CT = 130, CB = 220, GX = 578, GW = 18, GT = 44, GB = 220, PB = { l: 58, r: 606, t: 276, b: 450 };
      function sync(){ CTL.forEach(function(r){ qs('.' + r[0], r[1]).value = S[r[0]]; }); }
      function P(){ return { d: S.d, tau: S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }; }
      /* same one-compartment oral model as 'Dose and steady state': C = F D ka / (V (ka - ke)) (exp(-ke s) - exp(-ka s)), superposed over doses */
      function kin(p){ var ke = p.cl / p.v, ka = Math.abs(p.ka - ke) < 1e-3 ? p.ka + 0.01 : p.ka; return { ke: ke, ka: ka, a: p.f * p.d * ka / (p.v * (ka - ke)) }; }
      function concAt(p, t){ var q = kin(p), c = 0, i, s; for (i = 0; i < doses.length; i++) { s = t - doses[i].t; if (s >= 0) c += q.a * (Math.exp(-q.ke * s) - Math.exp(-q.ka * s)); } return Math.max(c, 0); }
      function depotAt(p, t){ var q = kin(p), a = 0, i, s; for (i = 0; i < doses.length; i++) { s = t - doses[i].t; if (s >= 0) a += p.f * p.d * Math.exp(-q.ka * s); } return a; }
      function concReg(p, t){ var q = kin(p), n, c = 0, s; for (n = 0; n * p.tau <= t + 1e-9; n++) { s = t - n * p.tau; c += q.a * (Math.exp(-q.ke * s) - Math.exp(-q.ka * s)); } return c; }
      function ssv(p){ var q = kin(p), e1 = 1 - Math.exp(-q.ke * p.tau), e2 = 1 - Math.exp(-q.ka * p.tau), mx = 0, mn = 1e9, i, s, c; for (i = 0; i <= 200; i++) { s = p.tau * i / 200; c = q.a * (Math.exp(-q.ke * s) / e1 - Math.exp(-q.ka * s) / e2); mx = Math.max(mx, c); mn = Math.min(mn, c); } return { mx: mx, mn: Math.max(mn, 0), ag: p.f * p.d / e2 }; }
      function niceUp(v){ var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e, L = [1, 1.5, 2, 3, 5, 7.5, 10], i; for (i = 0; i < L.length; i++) if (L[i] >= m - 1e-9) return L[i] * e; return 10 * e; }
      function derive(){ var p = P(), q = kin(p), th = 0.693 / q.ke, ss = ssv(p), u0 = D ? D.u : null;
        D = { th: th, t90: 3.32 * th, css: p.f * p.d / (p.cl * p.tau), ss: ss, R: 1 / (1 - Math.exp(-q.ke * p.tau)), Tw: cl(Math.max(5 * p.tau, 1.6 * 3.32 * th), 24, 600), u: niceUp((ss.mx * p.v + ss.ag) / 240) };
        if (u0 !== D.u) snap = true; }
      function geo(){ var W = 60 + 240 * (S.v - 10) / 490; return { cen: { l: CX - W / 2, r: CX + W / 2, t: CT, b: CB }, dw: 6 + 48 * (S.cl - 1) / 49 }; }
      function advanceTo(t){ while (nextT <= t + 1e-9) { doses.push({ t: nextT, x: false }); lastSched = nextT; nDose++; if (ANIM) pills.push({ y: 4 }); nextT += S.tau; } tm = t;
        var q = kin(P()); doses = doses.filter(function(o){ var s = tm - o.t; return !(s * q.ke > 30 && s * q.ka > 30); }); }
      function giveNow(){ doses.push({ t: tm, x: true }); nDose++; if (ANIM) pills.push({ y: 4 }); }
      function restart(){ tm = 0; doses = []; nDose = 0; nextT = 0; lastSched = -1e9; pills = []; parts = []; snap = true; }
      function rin(b){ return { x: b.l + 6 + R() * (b.r - b.l - 12), y: b.t + 6 + R() * (b.b - b.t - 12) }; }
      function mk(k, pt){ return { k: k, x: pt.x, y: pt.y, vx: (R() - 0.5) * 40, vy: (R() - 0.5) * 40, wp: [] }; }
      function fitCount(k, n, b){ var have = parts.filter(function(q){ return q.k === k; }), i; for (i = have.length; i > n; i--) parts.splice(parts.indexOf(have[i - 1]), 1); for (i = have.length; i < n && parts.length < 300; i++) parts.push(mk(k, rin(b))); }
      function move(dt, ge){
        parts.forEach(function(q){
          if (q.k === 'g' || q.k === 'c') { var b = q.k === 'g' ? DEP : ge.cen; q.vx = (q.vx + (R() - 0.5) * 300 * dt) * 0.98; q.vy = (q.vy + (R() - 0.5) * 300 * dt) * 0.98; var sp = Math.hypot(q.vx, q.vy); if (sp > 35) { q.vx *= 35 / sp; q.vy *= 35 / sp; } q.x += q.vx * dt; q.y += q.vy * dt;
            if (q.x < b.l + 4) { q.x = b.l + 4; q.vx = Math.abs(q.vx); } if (q.x > b.r - 4) { q.x = b.r - 4; q.vx = -Math.abs(q.vx); } if (q.y < b.t + 4) { q.y = b.t + 4; q.vy = Math.abs(q.vy); } if (q.y > b.b - 4) { q.y = b.b - 4; q.vy = -Math.abs(q.vy); } }
          else if (q.k === 'l') { q.x -= 70 * dt; q.y += 6 * dt; if (q.x < 40) q.dead = true; }
          else { var st = (q.k === 'p' ? 150 : 90) * dt; while (st > 0 && q.wp.length) { var w = q.wp[0], d = Math.hypot(w.x - q.x, w.y - q.y); if (d <= st) { q.x = w.x; q.y = w.y; q.wp.shift(); st -= d; } else { q.x += (w.x - q.x) / d * st; q.y += (w.y - q.y) / d * st; st = 0; } }
            if (!q.wp.length) { if (q.k === 'p') q.k = 'c'; else q.dead = true; } }
        });
        parts = parts.filter(function(q){ return !q.dead; });
      }
      function reconcile(dt, ge, Ng, Nc){
        if (snap || dt === 0) { parts = parts.filter(function(q){ return q.k === 'g' || q.k === 'c'; }); fitCount('g', Ng, DEP); fitCount('c', Nc, ge.cen); snap = false; return; }
        var g = parts.filter(function(q){ return q.k === 'g'; }), c = parts.filter(function(q){ return q.k === 'c'; }), np = parts.filter(function(q){ return q.k === 'p'; }).length, i;
        if (g.length > Ng) { g.sort(function(a, b){ return Math.hypot(a.x - CX, a.y - DEP.b) - Math.hypot(b.x - CX, b.y - DEP.b); }); for (i = 0; i < g.length - Ng; i++) { g[i].k = 'p'; g[i].wp = [{ x: CX, y: DEP.b - 3 }, { x: CX, y: CT + 6 }, rin(ge.cen)]; } np += g.length - Ng; }
        else if (g.length < Ng && !pills.length) { for (i = g.length; i < Ng && parts.length < 300; i++) parts.push(mk('g', { x: CX + (R() - 0.5) * 36, y: DEP.t + 6 + R() * 12 })); }
        var tot = c.length + np;
        if (tot > Nc) { c.sort(function(a, b){ return Math.hypot(a.x - CX, a.y - CB) - Math.hypot(b.x - CX, b.y - CB); }); for (i = 0; i < Math.min(c.length, tot - Nc); i++) { var ox = CX + (R() - 0.5) * ge.dw * 0.7; c[i].k = 'x'; c[i].wp = [{ x: ox, y: CB - 2 }, { x: ox, y: CB + 30 }]; } }
        else if (tot < Nc) { for (i = tot; i < Nc && parts.length < 300; i++) parts.push(mk('c', rin(ge.cen))); }
      }
      function frame(dt){
        if (!D) derive();
        if (dt > 0 && S.sp > 0) advanceTo(tm + dt * S.sp); else advanceTo(!ANIM ? Math.max(tm, 0.9 * D.Tw) : tm);
        var p = P(), ge = geo(), Ag = depotAt(p, tm), Cp = concAt(p, tm), Ng = Math.round(Ag / D.u), Nc = Math.round(Cp * p.v / D.u);
        pills.forEach(function(o){ if (dt > 0) o.y += 220 * dt; if (o.y >= DEP.t + 4 || !ANIM) { o.done = true; if (ANIM) { var nl = Math.min(14, Math.round((1 - S.f) * S.d / D.u)), i; for (i = 0; i < nl && parts.length < 300; i++) parts.push({ k: 'l', x: DEP.l + 8 + R() * 14, y: DEP.t + 14 + R() * 26, vx: 0, vy: 0, wp: [] }); } } });
        pills = pills.filter(function(o){ return !o.done; });
        if (dt > 0) move(dt, ge);
        reconcile(dt, ge, Ng, Nc);
        drawAll(p, ge, Ag, Cp);
      }
      function drawAll(p, ge, Ag, Cp){
        var g = cv(cvs), x = g.x, cen = ge.cen, dw = ge.dw, x0 = Math.max(0, tm - 0.9 * D.Tw), x1 = x0 + D.Tw, i, n = 220, pts = [], vmax = 0, tEnd = Math.min(tm, x1);
        for (i = 0; i <= n && tEnd > x0; i++) { var tt = x0 + (tEnd - x0) * i / n, cc = concAt(p, tt); pts.push([tt, cc]); vmax = Math.max(vmax, cc); }
        var ym = lockYm || Math.max(D.ss.mx, S.hi, D.css, vmax * 1.08 / 1.2) * 1.2;
        G = { ym: ym, dw: dw };
        /* clock and legend */
        SC.text(x, 't = ' + tm.toFixed(1) + ' h, ' + nDose + (nDose === 1 ? ' dose' : ' doses'), 12, 18, { bold: true });
        SC.text(x, S.sp > 0 ? 'next dose in ' + Math.max(0, nextT - tm).toFixed(1) + ' h' : 'paused (speed 0)', 12, 34, { color: C.mid, size: 11 });
        SC.dot(x, 346, 14, 3.2, C.red); SC.text(x, '1 particle = ' + fx(D.u) + ' mg of drug', 354, 18, { size: 11 });
        SC.dot(x, 346, 30, 3.2, GREY); SC.text(x, 'not bioavailable, (1 - F) x dose', 354, 34, { size: 11 });
        /* depot */
        SC.rr(x, DEP.l, DEP.t, DEP.r - DEP.l, DEP.b - DEP.t, 8); x.fillStyle = C.light; x.fill(); x.strokeStyle = C.bg; x.lineWidth = 1.5; x.stroke();
        SC.arrow(x, DEP.l - 2, 84, 46, 84, GREY, 1.6, 7); SC.text(x, '1 - F', 80, 76, { size: 11, bold: true, color: C.mid, align: 'center' });
        SC.text(x, 'Depot compartment (gut)', 340, 60, { bold: true }); SC.text(x, 'Ag = ' + fx(Ag) + ' mg', 340, 76, { color: C.mid });
        /* central compartment, tinted by concentration */
        var tint = SC.mix('#FFFFFF', C.tint, Math.min(1, Cp / ym) * 0.75);
        SC.rr(x, cen.l, cen.t, cen.r - cen.l, cen.b - cen.t, 8); x.fillStyle = tint; x.fill(); x.strokeStyle = C.bg; x.lineWidth = 1.5; x.stroke();
        /* absorption channel */
        x.fillStyle = C.light; x.fillRect(CX - 5, DEP.b - 2, 10, CT - DEP.b + 4); x.strokeStyle = C.bg; x.lineWidth = 1.5; x.beginPath(); x.moveTo(CX - 6, DEP.b); x.lineTo(CX - 6, CT); x.moveTo(CX + 6, DEP.b); x.lineTo(CX + 6, CT); x.stroke();
        SC.arrow(x, CX + 22, DEP.b + 4, CX + 22, CT - 4, C.red, 2, 8); SC.text(x, 'ka = ' + S.ka.toFixed(1) + ' 1/h, ' + fx(kin(p).ka * Ag) + ' mg/h', CX + 30, 119, { bold: true, color: C.red, size: 11 });
        /* drain, width proportional to CL */
        x.fillStyle = tint; x.fillRect(CX - dw / 2, CB - 2.5, dw, 5); x.fillStyle = C.light; x.fillRect(CX - dw / 2, CB + 1, dw, 16);
        x.strokeStyle = C.bg; x.beginPath(); x.moveTo(CX - dw / 2, CB); x.lineTo(CX - dw / 2, CB + 18); x.moveTo(CX + dw / 2, CB); x.lineTo(CX + dw / 2, CB + 18); x.stroke();
        SC.dot(x, CX + dw / 2, CB + 10, 6, C.char, '#FFFFFF'); SC.text(x, 'drag', CX - dw / 2 - 7, CB + 14, { size: 11, color: C.mid, align: 'right' });
        SC.arrow(x, CX + 44, CB + 4, CX + 44, CB + 30, C.warn, 2, 8); SC.text(x, 'CL = ' + S.cl + ' L/h, CL x C = ' + fx(S.cl * Cp) + ' mg/h', CX + 52, CB + 21, { bold: true, color: C.warn, size: 11 });
        SC.text(x, 'Central compartment', 340, 146, { bold: true }); SC.text(x, 'V = ' + S.v + ' L', 340, 162, { color: C.mid }); SC.text(x, 'C = ' + fx(Cp) + ' mg/L', 340, 178, { bold: true, color: C.red }); SC.text(x, 'A = C x V = ' + fx(Cp * S.v) + ' mg', 340, 194, { color: C.mid });
        /* particles and falling tablets */
        parts.forEach(function(q){ SC.dot(x, q.x, q.y, 2.8, q.k === 'l' ? GREY : C.red); });
        pills.forEach(function(o){ SC.rr(x, CX - 10, o.y - 5, 20, 10, 5); x.fillStyle = C.warn; x.fill(); x.fillStyle = '#FFFFFF'; x.fillRect(CX - 0.5, o.y - 5, 1, 10); });
        /* concentration gauge on the plot scale */
        function gy(v){ return GB - Math.min(v, ym) / ym * (GB - GT); }
        SC.rr(x, GX, GT, GW, GB - GT, 4); x.fillStyle = C.light; x.fill(); x.fillStyle = 'rgba(180,86,27,.14)'; x.fillRect(GX, gy(S.hi), GW, gy(S.lo) - gy(S.hi));
        x.fillStyle = C.red; x.fillRect(GX + 3, gy(Cp), GW - 6, GB - gy(Cp)); x.strokeStyle = C.bg; x.lineWidth = 1; SC.rr(x, GX, GT, GW, GB - GT, 4); x.stroke();
        x.strokeStyle = C.warn; x.lineWidth = 1.6; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(GX - 6, gy(S.hi)); x.lineTo(GX + GW + 3, gy(S.hi)); x.moveTo(GX - 6, gy(S.lo)); x.lineTo(GX + GW + 3, gy(S.lo)); x.stroke();
        x.strokeStyle = C.char; x.setLineDash([2, 3]); x.beginPath(); x.moveTo(GX - 6, gy(D.css)); x.lineTo(GX + GW + 3, gy(D.css)); x.stroke(); x.setLineDash([]);
        SC.text(x, 'C (mg/L)', GX + GW / 2, 36, { bold: true, size: 11, align: 'center' });
        SC.text(x, 'Cmax limit', GX - 10, gy(S.hi) - 3, { size: 11, color: C.warn, align: 'right' }); SC.text(x, 'Cmin target', GX - 10, gy(S.lo) + 12, { size: 11, color: C.warn, align: 'right' });
        /* concentration-time plot */
        function sx(t){ return PB.l + (t - x0) / (x1 - x0) * (PB.r - PB.l); } function sy(v){ return PB.b - Math.min(v, ym) / ym * (PB.b - PB.t); }
        G.sy = sy;
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.font = '12px Aptos, "Segoe UI", sans-serif';
        var yt = niceTicks(0, ym, 5), xt = niceTicks(x0, x1, 6); x.textAlign = 'right'; yt.v.forEach(function(v){ x.beginPath(); x.moveTo(PB.l, sy(v)); x.lineTo(PB.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), PB.l - 6, sy(v) + 4); });
        x.textAlign = 'center'; xt.v.forEach(function(v){ x.beginPath(); x.moveTo(sx(v), PB.t); x.lineTo(sx(v), PB.b); x.stroke(); x.fillText(tickText(v, xt.step), sx(v), PB.b + 16); });
        x.fillStyle = 'rgba(180,86,27,.10)'; x.fillRect(PB.l, sy(S.hi), PB.r - PB.l, sy(S.lo) - sy(S.hi));
        x.strokeStyle = C.warn; x.lineWidth = 1.4; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(PB.l, sy(S.hi)); x.lineTo(PB.r, sy(S.hi)); x.moveTo(PB.l, sy(S.lo)); x.lineTo(PB.r, sy(S.lo)); x.stroke();
        x.strokeStyle = C.char; x.setLineDash([2, 3]); x.beginPath(); x.moveTo(PB.l, sy(D.css)); x.lineTo(PB.r, sy(D.css)); x.stroke(); x.setLineDash([]);
        SC.text(x, 'Cmax limit (drag)', PB.r - 6, sy(S.hi) - 5, { size: 11, bold: true, color: C.warn, align: 'right' }); SC.text(x, 'Cmin target (drag)', PB.r - 6, sy(S.lo) + 14, { size: 11, bold: true, color: C.warn, align: 'right' });
        SC.text(x, 'Css,avg = F x dose / (CL x tau)', PB.l + 6, sy(D.css) - 5, { size: 11, bold: true });
        if (D.t90 >= x0 && D.t90 <= x1) { var tx = sx(D.t90), rgt = tx > PB.r - 190; x.strokeStyle = C.mid; x.lineWidth = 1; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(tx, PB.t); x.lineTo(tx, PB.b); x.stroke(); x.setLineDash([]); SC.text(x, '90% of steady state, ' + fx(D.t90) + ' h', tx + (rgt ? -4 : 4), PB.t + 12, { size: 11, color: C.mid, align: rgt ? 'right' : 'left' }); }
        pins.forEach(function(q){ x.strokeStyle = GREY; x.lineWidth = 1.6; x.setLineDash([5, 4]); x.beginPath(); for (i = 0; i <= 200; i++) { var t2 = x0 + (x1 - x0) * i / 200, yy = sy(concReg(q, t2)); i ? x.lineTo(sx(t2), yy) : x.moveTo(sx(t2), yy); } x.stroke(); x.setLineDash([]); });
        if (pts.length) { x.strokeStyle = C.red; x.lineWidth = 2.6; x.lineJoin = 'round'; x.beginPath(); pts.forEach(function(q, k){ k ? x.lineTo(sx(q[0]), sy(q[1])) : x.moveTo(sx(q[0]), sy(q[1])); }); x.stroke(); }
        doses.forEach(function(o){ if (o.t < x0 || o.t > x1) return; var px = sx(o.t); x.fillStyle = o.x ? C.warn : C.char; x.beginPath(); x.moveTo(px - 4, PB.b); x.lineTo(px + 4, PB.b); x.lineTo(px, PB.b - 8); x.fill(); });
        if (tm >= x0 && tm <= x1) { SC.dot(x, sx(tm), sy(Cp), 5, C.red, '#FFFFFF'); }
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(PB.l, PB.b); x.lineTo(PB.r, PB.b); x.moveTo(PB.l, PB.t); x.lineTo(PB.l, PB.b); x.stroke();
        SC.text(x, 'Time after the first dose (h)', (PB.l + PB.r) / 2, PB.b + 32, { bold: true, align: 'center' });
        x.save(); x.translate(14, (PB.t + PB.b) / 2); x.rotate(-Math.PI / 2); SC.text(x, 'C (mg/L)', 0, 0, { bold: true, align: 'center' }); x.restore();
      }
      function upd(){
        if (!D) derive(); var ss = D.ss, okLo = ss.mn >= S.lo, okHi = ss.mx <= S.hi;
        qs('.dv', c1).textContent = S.d; qs('.tauv', c2).textContent = S.tau; qs('.clv', c3).textContent = S.cl; qs('.vv', c4).textContent = S.v; qs('.fv', c5).textContent = S.f.toFixed(2); qs('.kav', c6).textContent = S.ka.toFixed(1); qs('.spv', c7).textContent = S.sp.toFixed(1);
        qs('.sd', side).innerHTML = fTile('Css,avg', fx(D.css) + ' mg/L', 'F x dose / (CL x tau)') + fRows([['Cmax,ss', fx(ss.mx) + ' mg/L'], ['Cmin,ss', fx(ss.mn) + ' mg/L'], ['Accumulation ratio R', fx(D.R)], ['Half-life, 0.693 V / CL', fx(D.th) + ' h'], ['Time to 90% of steady state', fx(D.t90) + ' h'], ['Cmin,ss at or above the target', okLo ? 'yes' : 'no'], ['Cmax,ss at or below the limit', okHi ? 'yes' : 'no'], ['Peak to trough', fx(ss.mx / Math.max(ss.mn, 1e-9))]]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">R = 1 / (1 - exp(-k tau)), k = CL / V; 90% of steady state is reached after 3.32 half-lives. Drag the drain edge to set CL and the dashed limits on the plot to set the window.</div>';
        api.stat('Css,avg ' + fx(D.css) + ' mg/L, Cmax,ss ' + fx(ss.mx) + ' and Cmin,ss ' + fx(ss.mn) + ' mg/L, ' + (okLo && okHi ? 'within the window' : 'outside the window'));
      }
      function onParam(){ var t0 = S.tau; derive(); if (lastSched > -1e8) nextT = lastSched + t0; upd(); }
      CTL.forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('dsx', S); onParam(); }); });
      qs('.gv', c8).addEventListener('click', function(){ giveNow(); });
      qs('.rs', c8).addEventListener('click', function(){ restart(); });
      IX.tools(api, { pin: function(){ pins.push(P()); if (pins.length > 2) pins.shift(); }, clear: function(){ pins = []; }, canvases: function(){ return [cvs]; }, name: 'dosing-regimen-schematic',
        csv: function(){ var p = P(), rows = [['t (h)', 'C (mg/L)', 'Depot amount (mg)']], i, T = Math.max(tm, 1e-6); for (i = 0; i <= 240; i++) rows.push([T * i / 240, concAt(p, T * i / 240), depotAt(p, T * i / 240)]); rows.push([], ['Dose times retained (h)'].concat(doses.map(function(o){ return o.t; })), ['Css,avg (mg/L)', D.css], ['Cmax,ss (mg/L)', D.ss.mx], ['Cmin,ss (mg/L)', D.ss.mn], ['Accumulation ratio R', D.R], ['Time to 90% of steady state (h)', D.t90]); return IX.csv(rows); } });
      function onDrain(p){ return G && Math.hypot(p.x - (CX + G.dw / 2), p.y - (CB + 10)) < 11; }
      function onLine(p, v){ return G && G.sy && p.x >= PB.l && p.x <= PB.r && near(p.y, G.sy(v), 7); }
      IX.attach(cvs, {
        move: function(p){ cvs.style.cursor = onDrain(p) ? 'ew-resize' : ((onLine(p, S.hi) || onLine(p, S.lo)) ? 'ns-resize' : 'default'); },
        down: function(p){ if (onDrain(p)) return { k: 'cl' }; if (onLine(p, S.hi)) { lockYm = G.ym; return { k: 'hi' }; } if (onLine(p, S.lo)) { lockYm = G.ym; return { k: 'lo' }; } return null; },
        drag: function(d, p){
          if (d.k === 'cl') { var w = cl(2 * Math.abs(p.x - CX), 6, 54); S.cl = cl(Math.round(1 + (w - 6) / 48 * 49), 1, 50); sync(); onParam(); return; }
          var v = Math.max((PB.b - p.y) / (PB.b - PB.t) * lockYm, 0.01);
          if (d.k === 'hi') S.hi = Math.max(Math.round(v * 20) / 20, S.lo + 0.05); else S.lo = cl(Math.round(v * 20) / 20, 0.05, S.hi - 0.05); D.ss = ssv(P()); upd(); },
        up: function(){ lockYm = null; IX.save('dsx', S); }
      });
      sync(); derive();
      SC.run(cvs, function(dt){ frame(dt); });
      return { render: function(){ upd(); frame(0); } };
    } });

  /* ===== step 1: dose and steady state ===== */
  DOSE.add({ short: 'Dose and steady state', level: 'foundations', ord: 10, title: 'Dose, interval and steady state',
    build: function(api){
      var S = IX.state('ds1', { d: 200, tau: 12, cl: 10, v: 50, f: 0.8, ka: 1.5, lo: 0.8, hi: 3 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('d', 'Dose', 10, 1000, 10, S.d, 'mg')), c2 = api.addControl(sel('Interval', 'tau', [[6, '6 h'], [8, '8 h'], [12, '12 h'], [24, '24 h']], S.tau)), c3 = api.addControl(IX.slider('cl', 'CL', 1, 50, 1, S.cl, 'L/h')), c4 = api.addControl(IX.slider('v', 'V', 10, 500, 10, S.v, 'L')), c5 = api.addControl(IX.slider('f', 'F', 0.1, 1, 0.01, S.f)), c6 = api.addControl(IX.slider('ka', 'ka', 0.2, 5, 0.1, S.ka, '1/h'));
      function sync(){ qs('.d', c1).value = S.d; qs('.cl', c3).value = S.cl; qs('.v', c4).value = S.v; qs('.f', c5).value = S.f; qs('.ka', c6).value = S.ka; qs('.tau', c2).value = S.tau; }
      function conc(P, t){ var ke = P.cl / P.v, ka = Math.abs(P.ka - ke) < 1e-3 ? P.ka + 0.01 : P.ka, k = P.f * P.d * ka / (P.v * (ka - ke)), n, c = 0; for (n = 0; n * P.tau <= t + 1e-9; n++) { var s = t - n * P.tau; c += k * (Math.exp(-ke * s) - Math.exp(-ka * s)); } return c; }
      function ss(P){ var ke = P.cl / P.v, N = Math.ceil(8 * 0.693 / ke / P.tau) + 2, t0 = N * P.tau, mx = 0, mn = 1e9, inw = 0, i, n = 120; for (i = 0; i <= n; i++) { var c = conc(P, t0 + P.tau * i / n); mx = Math.max(mx, c); mn = Math.min(mn, c); if (c >= S.lo && c <= S.hi) inw++; } return { mx: mx, mn: mn, inw: inw / (n + 1) }; }
      IX.tools(api, { pin: function(){ pins.push({ d: S.d, tau: +S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }); if (pins.length > 2) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'dose-and-steady-state',
        csv: function(){ var P = { d: S.d, tau: +S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }, T = Math.min(Math.max(6 * P.tau, 5 * 0.693 * P.v / P.cl), 240), rows = [['t (h)', 'C (mg/L)']], i; for (i = 0; i <= 240; i++) rows.push([T * i / 240, conc(P, T * i / 240)]); return IX.csv(rows); } });
      function draw(){
        var P = { d: S.d, tau: +S.tau, cl: S.cl, v: S.v, f: S.f, ka: S.ka }; qs('.dv', c1).textContent = S.d; qs('.clv', c3).textContent = S.cl; qs('.vv', c4).textContent = S.v; qs('.fv', c5).textContent = S.f.toFixed(2); qs('.kav', c6).textContent = S.ka.toFixed(1);
        var th = 0.693 * S.v / S.cl, T = Math.min(Math.max(6 * P.tau, 5 * th), 240), css = S.f * S.d / (S.cl * P.tau), s = ss(P), ym = lock ? lock.ym : Math.max(s.mx, S.hi, css) * 1.2;
        M = IX.chart(cvs, { xr: [0, T], yr: [0, ym], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return conc(P, t); }, color: C.red, w: 2.6 }], pinned: pins.map(function(q){ return { fn: function(t){ return conc(q, t); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var x = M.x; x.fillStyle = 'rgba(180,86,27,.10)'; x.fillRect(M.box.l, M.sy(S.hi), M.box.r - M.box.l, M.sy(S.lo) - M.sy(S.hi));
        IX.hline(M, M.sy(S.hi), C.warn, [5, 4]); IX.hline(M, M.sy(S.lo), C.warn, [5, 4]); lab(M, 'upper limit (drag)', M.box.r - 6, M.sy(S.hi) - 5, C.warn, 'right'); lab(M, 'lower limit (drag)', M.box.r - 6, M.sy(S.lo) + 14, C.warn, 'right');
        IX.hline(M, M.sy(css), C.char, [2, 3]); IX.dot(M, M.sx(T * 0.5), M.sy(css), 6, C.char); lab(M, 'Css,avg (drag to set the dose)', M.sx(T * 0.5) + 10, M.sy(css) - 8, C.char);
        var n; x.fillStyle = C.char; for (n = 0; n * P.tau <= T; n++) { x.beginPath(); x.moveTo(M.sx(n * P.tau) - 4, M.box.b); x.lineTo(M.sx(n * P.tau) + 4, M.box.b); x.lineTo(M.sx(n * P.tau), M.box.b - 8); x.fill(); }
        if (hv !== null) { var ch = conc(P, hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(ch), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(ch), ['t = ' + hv.toFixed(1) + ' h', 'C = ' + ch.toFixed(2) + ' mg/L', 'doses given ' + (Math.floor(hv / P.tau + 1e-9) + 1)]); }
        var mid = Math.sqrt(S.lo * S.hi);
        qs('.sd', side).innerHTML = fTile('Css,avg', fx(css) + ' mg/L', 'F x dose / (CL x tau)') + fRows([['Cmax,ss', fx(s.mx) + ' mg/L'], ['Cmin,ss', fx(s.mn) + ' mg/L'], ['Peak to trough', fx(s.mx / Math.max(s.mn, 1e-9))], ['Half-life', th.toFixed(1) + ' h'], ['Accumulation ratio R', fx(1 / (1 - Math.exp(-0.693 / th * P.tau)))], ['Time in the window', (100 * s.inw).toFixed(0) + ' percent'], ['Dose for Css,avg at the window midpoint', fx(mid * S.cl * P.tau / S.f) + ' mg']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Drag the dashed Css,avg point vertically to set the dose, and the two limits to set the window.</div>';
        api.stat('Css,avg ' + fx(css) + ' mg/L, ' + (100 * s.inw).toFixed(0) + ' percent of the interval in the window');
      }
      [['d', c1], ['cl', c3], ['v', c4], ['f', c5], ['ka', c6]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('ds1', S); draw(); }); });
      qs('.tau', c2).addEventListener('change', function(){ S.tau = +this.value; IX.save('ds1', S); draw(); });
      function cssY(){ return M.sy(S.f * S.d / (S.cl * +S.tau)); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? M.ix(p.x) : null; cvs.style.cursor = (Math.hypot(p.x - M.sx(M.ix(M.box.r) * 0.5), p.y - cssY()) < 12) ? 'ns-resize' : ((near(p.y, M.sy(S.hi), 7) || near(p.y, M.sy(S.lo), 7)) ? 'ns-resize' : 'crosshair'); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var fr = { ym: M.iy(M.box.t) }; if (Math.hypot(p.x - M.sx(M.ix(M.box.r) * 0.5), p.y - cssY()) < 13) { lock = fr; return { k: 'd' }; } if (near(p.y, M.sy(S.hi), 8)) { lock = fr; return { k: 'hi' }; } if (near(p.y, M.sy(S.lo), 8)) { lock = fr; return { k: 'lo' }; } return null; },
        drag: function(d, p){ var v = Math.max(M.iy(p.y), 0.01); if (d.k === 'd') S.d = cl(Math.round(v * S.cl * +S.tau / S.f / 10) * 10, 10, 1000); else if (d.k === 'hi') S.hi = Math.max(Math.round(v * 20) / 20, S.lo + 0.05); else S.lo = cl(Math.round(v * 20) / 20, 0.05, S.hi - 0.05); sync(); draw(); },
        up: function(){ lock = null; IX.save('ds1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: allometric scaling ===== */
  var SPEC = [['Mouse', 0.02], ['Rat', 0.25], ['Monkey', 5], ['Dog', 10]];
  DOSE.add({ short: 'Allometric scaling', level: 'foundations', ord: 20, title: 'Allometric scaling of clearance',
    build: function(api){
      var S = IX.state('ds2', { y: [Math.log10(0.0243), Math.log10(0.0993), Math.log10(1.41), Math.log10(1.78)] }), hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl('<button type="button" class="btn sm ghost rs">Reset points</button>');
      function fit(b0){ var xs = SPEC.map(function(s){ return Math.log10(s[1]); }), ys = S.y, n = xs.length, mx = xs.reduce(function(a, v){ return a + v; }, 0) / n, my = ys.reduce(function(a, v){ return a + v; }, 0) / n, b = b0, i; if (b0 === undefined) { var sxy = 0, sxx = 0; for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); } b = sxy / sxx; } return { b: b, a: my - b * mx }; }
      function pred(f, W){ return Math.pow(10, f.a + f.b * Math.log10(W)); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'allometric-scaling', csv: function(){ var f = fit(), rows = [['Species', 'Body weight (kg)', 'CL (L/h)']]; SPEC.forEach(function(s, i){ rows.push([s[0], s[1], Math.pow(10, S.y[i])]); }); rows.push([], ['Fitted exponent', f.b], ['Predicted human CL, 70 kg (L/h)', pred(f, 70)], ['Exponent 0.75, predicted human CL (L/h)', pred(fit(0.75), 70)], ['Exponent 1, predicted human CL (L/h)', pred(fit(1), 70)]); return IX.csv(rows); } });
      function draw(){
        var f = fit(), f75 = fit(0.75), f1 = fit(1), f67 = fit(0.67);
        M = LL(cvs, { xr: [0.01, 100], yr: [0.005, 100], ylog: true, xt: [0.01, 0.1, 1, 10, 100], yt: [0.01, 0.1, 1, 10, 100], xl: 'Body weight (kg)', yl: 'Clearance (L/h)', series: [{ fn: function(w){ return pred(f1, w); }, color: GREY, w: 1.5, dash: [2, 3], label: 'exponent 1' }, { fn: function(w){ return pred(f75, w); }, color: C.mid, w: 1.8, dash: [5, 4], label: 'exponent 0.75' }, { fn: function(w){ return pred(f, w); }, color: C.red, w: 2.8, label: 'fitted' }] });
        var x = M.x; IX.vline(M, M.sx(70), C.warn, [4, 4]); lab(M, 'human, 70 kg', M.sx(70) - 6, M.box.t + 30, C.warn, 'right');
        [[f1, GREY], [f75, C.mid], [f, C.red]].forEach(function(q){ IX.dot(M, M.sx(70), M.sy(pred(q[0], 70)), 5, q[1]); });
        SPEC.forEach(function(s, i){ IX.dot(M, M.sx(s[1]), M.sy(Math.pow(10, S.y[i])), hv === i ? 8 : 6.5, C.red); lab(M, s[0], M.sx(s[1]) + 10, M.sy(Math.pow(10, S.y[i])) - 8, C.char); });
        lab(M, 'drag the points vertically', M.box.l + 8, M.box.b - 8, C.mid);
        if (hv !== null && hv >= 0) IX.tip(M, M.sx(SPEC[hv][1]), M.sy(Math.pow(10, S.y[hv])), [SPEC[hv][0] + ', ' + SPEC[hv][1] + ' kg', 'CL ' + fx(Math.pow(10, S.y[hv])) + ' L/h', 'per kg ' + fx(Math.pow(10, S.y[hv]) / SPEC[hv][1]) + ' L/h/kg']);
        qs('.sd', side).innerHTML = fTile('Predicted human CL', fx(pred(f, 70)) + ' L/h', 'fitted exponent ' + f.b.toFixed(2)) + fRows([['Exponent 0.67', fx(pred(f67, 70)) + ' L/h'], ['Exponent 0.75', fx(pred(f75, 70)) + ' L/h'], ['Exponent 1', fx(pred(f1, 70)) + ' L/h'], ['Fitted, per kg', fx(pred(f, 70) / 70 * 1000 / 60) + ' mL/min/kg'], ['Highest to lowest prediction', fx(Math.max(pred(f1, 70), pred(f, 70), pred(f67, 70)) / Math.min(pred(f1, 70), pred(f, 70), pred(f67, 70))) + '-fold']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Illustrative values for one compound, set by dragging. CL = a W^b, so clearance per kg falls as body weight rises when b is below 1.</div>';
        api.stat('Fitted exponent ' + f.b.toFixed(2) + ', predicted human CL ' + fx(pred(f, 70)) + ' L/h');
      }
      function pt(i){ return [M.sx(SPEC[i][1]), M.sy(Math.pow(10, S.y[i]))]; }
      function hit(p){ var i, b = -1, bd = 14; SPEC.forEach(function(s, k){ var q = pt(k), d = Math.hypot(p.x - q[0], p.y - q[1]); if (d < bd) { bd = d; b = k; } }); return b; }
      qs('.rs', c1).addEventListener('click', function(){ S.y = [Math.log10(0.0243), Math.log10(0.0993), Math.log10(1.41), Math.log10(1.78)]; IX.save('ds2', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = hit(p); cvs.style.cursor = hv >= 0 ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var i = hit(p); return i >= 0 ? { i: i } : null; },
        drag: function(d, p){ S.y[d.i] = cl(Math.round(Math.log10(cl(M.iy(p.y), 0.006, 90)) * 50) / 50, -2.2, 1.9); draw(); },
        up: function(){ IX.save('ds2', S); }
      });
      return { render: draw };
    } });

  /* ===== step 3: daily dose from clearance across drugs ===== */
  DOSE.add({ short: 'Daily dose from clearance', level: 'applied', ord: 30, title: 'Daily dose implied by clearance',
    build: function(api){
      var S = IX.state('ds3', { c: -1, f: 1 }), hv = -1, M = null, NB = 36, LO = -1, HI = 4;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px;cursor:grab"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('c', 'Target Css,avg', -3, 1, 0.05, S.c, 'mg/L')), c2 = api.addControl(IX.slider('f', 'F', 0.1, 1, 0.01, S.f));
      function sync(){ qs('.c', c1).value = S.c; qs('.f', c2).value = S.f; }
      function doses(){ var c = Math.pow(10, S.c); return CLH.map(function(q){ return c * q * 24 / S.f; }); }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'daily-dose-from-clearance', csv: function(){ var ds = doses(), rows = [['Drug', 'CL (mL/min/kg)', 'CL for 70 kg (L/h)', 'Daily dose (mg)']]; DR.forEach(function(d, i){ rows.push([d.name || d.id, d.cl, CLH[i], ds[i]]); }); return IX.csv(rows); } });
      function draw(){
        var c = Math.pow(10, S.c), ds = doses(), cnt = new Array(NB).fill(0); qs('.cv', c1).textContent = fx(c); qs('.fv', c2).textContent = S.f.toFixed(2);
        ds.forEach(function(v){ var k = Math.floor((Math.log10(v) - LO) / (HI - LO) * NB); cnt[cl(k, 0, NB - 1)]++; });
        var g = cv(cvs), x = g.x, box = { l: 46, r: g.w - 14, t: 26, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.12, bw = (box.r - box.l) / NB; M = { x: x, box: box };
        function bx(l){ return box.l + (l - LO) / (HI - LO) * (box.r - box.l); }
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Daily dose for the target concentration, ' + DR.length + ' drugs (drag sideways to change the target)', box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        cnt.forEach(function(n, k){ var mid = LO + (k + 0.5) * (HI - LO) / NB, hg = n / ym * (box.b - box.t); x.fillStyle = mid > 3 ? C.warn : (mid < 1 ? C.tint : C.red); x.globalAlpha = k === hv ? 1 : 0.82; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; [-1, 0, 1, 2, 3, 4].forEach(function(e){ var px = bx(e); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(+Math.pow(10, e).toPrecision(3)), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText('Daily dose (mg, logarithmic axis)', (box.l + box.r) / 2, g.h - 6);
        x.strokeStyle = C.char; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(bx(3), box.t); x.lineTo(bx(3), box.b); x.stroke(); x.setLineDash([]); lab(M, '1 g/day', bx(3) + 5, box.t + 12, C.char);
        if (hv >= 0) IX.tip(M, box.l + (hv + 0.5) * bw, box.b - cnt[hv] / ym * (box.b - box.t), [fx(Math.pow(10, LO + hv * (HI - LO) / NB)) + ' to ' + fx(Math.pow(10, LO + (hv + 1) * (HI - LO) / NB)) + ' mg/day', cnt[hv] + ' drugs']);
        var md = med(ds), lo = ds.filter(function(v){ return v < 100; }).length, hi = ds.filter(function(v){ return v > 1000; }).length;
        qs('.sd', side).innerHTML = fTile('Median daily dose', fx(md) + ' mg', 'for Css,avg ' + fx(c) + ' mg/L') + fRows([['Below 100 mg/day', lo + ' of ' + DR.length], ['Above 1 g/day', hi + ' of ' + DR.length], ['Median CL for 70 kg', fx(med(CLH)) + ' L/h']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">Dose per day = Css,avg x CL x 24 h / F, with CL the total clearance of Obach et al. (2008) for a 70 kg adult. Drag the histogram sideways to change the target.</div>';
        api.stat('Median daily dose ' + fx(md) + ' mg for Css,avg ' + fx(c) + ' mg/L');
      }
      qs('.c', c1).addEventListener('input', function(){ S.c = +this.value; IX.save('ds3', S); draw(); }); qs('.f', c2).addEventListener('input', function(){ S.f = +this.value; IX.save('ds3', S); draw(); });
      function binAt(p){ if (p.x < M.box.l || p.x > M.box.r || p.y < M.box.t || p.y > M.box.b) return -1; return cl(Math.floor((p.x - M.box.l) / ((M.box.r - M.box.l) / NB)), 0, NB - 1); }
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = binAt(p); draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ return M && binAt(p) >= 0 ? { x0: p.x, c0: S.c } : null; },
        drag: function(d, p){ S.c = cl(Math.round((d.c0 + (p.x - d.x0) / (M.box.r - M.box.l) * (HI - LO)) * 20) / 20, -3, 1); sync(); draw(); },
        up: function(){ IX.save('ds3', S); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 4: half-life and dosing interval ===== */
  DOSE.add({ short: 'Half-life and dosing interval', level: 'applied', ord: 40, title: 'Half-life and dosing interval',
    build: function(api){
      var S = IX.state('ds4', { t: 1.08 }), hv = [-1, -1], M = [null, null], NB = 30;
      var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="430" style="width:436px;height:430px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="430" style="width:420px;height:430px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px;min-height:40px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(IX.slider('t', 'Dosing interval tau', 0, 2.2, 0.02, S.t, 'h'));
      var T12 = DR.map(function(d){ return d.t12; });
      function rOf(tau){ return DR.map(function(d){ return 1 / (1 - Math.exp(-0.693 / d.t12 * tau)); }); }
      IX.tools(api, { canvases: function(){ return [ca, cb]; }, name: 'half-life-and-dosing-interval', csv: function(){ var tau = Math.pow(10, S.t), r = rOf(tau), rows = [['Drug', 'Half-life (h)', 'Accumulation ratio at tau ' + fx(tau) + ' h', 'Peak to trough ratio, exp(k tau)']]; DR.forEach(function(d, i){ rows.push([d.name || d.id, d.t12, r[i], Math.exp(0.693 / d.t12 * tau)]); }); return IX.csv(rows); } });
      function hist(c, vals, lo, hi, title, xl, ticks, hvk, vline, key){
        var cnt = new Array(NB).fill(0); vals.forEach(function(v){ var k = Math.floor((Math.log10(v) - lo) / (hi - lo) * NB); cnt[cl(k, 0, NB - 1)]++; });
        var g = cv(c), x = g.x, box = { l: 40, r: g.w - 12, t: 26, b: g.h - 42 }, ym = Math.max.apply(null, cnt) * 1.12, bw = (box.r - box.l) / NB, Mx = { x: x, box: box, lo: lo, hi: hi, cnt: cnt, bw: bw, ym: ym };
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(title, box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
        cnt.forEach(function(n, k){ var hg = n / ym * (box.b - box.t); x.fillStyle = key === 'a' ? C.red : C.mid; x.globalAlpha = k === hv[key === 'a' ? 0 : 1] ? 1 : 0.8; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; ticks.forEach(function(v){ var px = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(px, box.b); x.lineTo(px, box.b + 4); x.stroke(); x.fillText(String(v), px, box.b + 16); });
        x.fillStyle = C.char; x.fillText(xl, (box.l + box.r) / 2, g.h - 6);
        if (vline !== null) { var vx = box.l + (Math.log10(vline) - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.warn; x.lineWidth = 2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(vx, box.t); x.lineTo(vx, box.b); x.stroke(); x.setLineDash([]); IX.dot(Mx, vx, box.t, 6, C.warn); lab(Mx, 'tau ' + fx(vline) + ' h (drag)', vx + 9, box.t + 14, C.warn); }
        var hk = hvk; if (hk >= 0) IX.tip(Mx, box.l + (hk + 0.5) * bw, box.b - cnt[hk] / ym * (box.b - box.t), [fx(Math.pow(10, lo + hk * (hi - lo) / NB)) + ' to ' + fx(Math.pow(10, lo + (hk + 1) * (hi - lo) / NB)), cnt[hk] + ' drugs']);
        return Mx;
      }
      function draw(){
        var tau = Math.pow(10, S.t); qs('.tv', c1).textContent = fx(tau);
        M[0] = hist(ca, T12, -1.5, 3.5, 'Terminal half-life, ' + DR.length + ' drugs', 'Half-life (h, logarithmic axis)', [0.1, 1, 10, 100, 1000], hv[0], tau, 'a');
        var r = rOf(tau); M[1] = hist(cb, r, 0, 3.5, 'Accumulation ratio at tau = ' + fx(tau) + ' h', 'Accumulation ratio R (logarithmic axis)', [1, 10, 100, 1000], hv[1], null, 'b');
        var above = T12.filter(function(t){ return tau > t; }).length, rm = med(r);
        qs('.ra', pn).innerHTML = 'Dosing interval <b>' + fx(tau) + ' h</b> exceeds the half-life for <b>' + above + ' of ' + DR.length + '</b> drugs (' + Math.round(100 * above / DR.length) + ' percent). Median half-life ' + fx(med(T12)) + ' h.';
        qs('.rb', pn2).innerHTML = 'Median accumulation ratio <b>' + rm.toFixed(2) + '</b>; ' + r.filter(function(v){ return v < 1.2; }).length + ' of ' + DR.length + ' drugs accumulate by less than 20 percent. Peak to trough, exp(k tau), is at least 2 for the ' + above + ' drugs above.';
        api.stat('tau ' + fx(tau) + ' h: ' + above + ' of ' + DR.length + ' drugs have tau above the half-life');
      }
      qs('.t', c1).addEventListener('input', function(){ S.t = +this.value; IX.save('ds4', S); draw(); });
      function binAt(i, p){ var m = M[i]; if (!m || p.x < m.box.l || p.x > m.box.r || p.y < m.box.t || p.y > m.box.b) return -1; return cl(Math.floor((p.x - m.box.l) / m.bw), 0, NB - 1); }
      IX.attach(ca, {
        move: function(p){ if (!M[0]) return; hv[0] = binAt(0, p); var m = M[0], vx = m.box.l + (S.t - m.lo) / (m.hi - m.lo) * (m.box.r - m.box.l); ca.style.cursor = near(p.x, vx, 8) ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv[0] = -1; draw(); },
        down: function(p){ var m = M[0], vx = m.box.l + (S.t - m.lo) / (m.hi - m.lo) * (m.box.r - m.box.l); return near(p.x, vx, 9) ? { k: 't' } : null; },
        drag: function(d, p){ var m = M[0]; S.t = cl(Math.round((m.lo + (p.x - m.box.l) / (m.box.r - m.box.l) * (m.hi - m.lo)) * 50) / 50, 0, 2.2); qs('.t', c1).value = S.t; draw(); },
        up: function(){ IX.save('ds4', S); }
      });
      IX.attach(cb, { move: function(p){ if (!M[1]) return; hv[1] = binAt(1, p); draw(); }, leave: function(){ hv[1] = -1; draw(); } });
      return { render: draw };
    } });

  /* ===== step 5: first-in-human starting dose ===== */
  var FDA = [['Mouse', 0.02, 3], ['Rat', 0.15, 6], ['Rabbit', 1.8, 12], ['Monkey', 3, 12], ['Dog', 10, 20]], KMH = 37, WH = 60;
  DOSE.add({ short: 'Starting dose from animal data', level: 'advanced', ord: 50, title: 'Starting dose from animal data',
    build: function(api){
      var S = IX.state('ds5', { n: 30, sp: 'Rat', sf: 10 }), hv = -1, M = null, G = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('n', 'NOAEL', 1, 300, 1, S.n, 'mg/kg')), c2 = api.addControl(sel('Species', 'sp', FDA.map(function(s){ return [s[0], s[0]]; }), S.sp)), c3 = api.addControl(IX.slider('sf', 'Safety factor', 1, 30, 1, S.sf));
      function sync(){ qs('.n', c1).value = S.n; qs('.sp', c2).value = S.sp; qs('.sf', c3).value = S.sf; }
      function cur(){ return FDA.filter(function(s){ return s[0] === S.sp; })[0]; }
      function hed(n, s){ return n * s[2] / KMH; }
      IX.tools(api, { canvases: function(){ return [cvs]; }, name: 'starting-dose', csv: function(){ var s = cur(), rows = [['Species', 'Body weight (kg)', 'Surface-area factor', 'Dose giving the same human equivalent dose (mg/kg)']]; FDA.forEach(function(q){ rows.push([q[0], q[1], q[2], S.n * s[2] / q[2]]); }); rows.push([], ['NOAEL (mg/kg)', S.n], ['Species', s[0]], ['Human equivalent dose (mg/kg)', hed(S.n, s)], ['Safety factor', S.sf], ['Starting dose (mg/kg)', hed(S.n, s) / S.sf], ['Starting dose for 60 kg (mg)', hed(S.n, s) / S.sf * WH]); return IX.csv(rows); } });
      function draw(){
        var s = cur(), H = hed(S.n, s); qs('.nv', c1).textContent = S.n; qs('.sfv', c3).textContent = S.sf;
        var g = cv(cvs), x = g.x, box = { l: 70, r: g.w - 20, t: 36, b: g.h - 56 }, bw = (box.r - box.l) / FDA.length, ym = lock || Math.max(FDA.reduce(function(m, q){ return Math.max(m, S.n * s[2] / q[2]); }, S.n), 10) * 1.15; G = { box: box, bw: bw, ym: ym }; M = { x: x, box: box };
        function sy(v){ return box.b - v / ym * (box.b - box.t); }
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; var yt = niceTicks(0, ym, 5); yt.v.forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 6, sy(v) + 4); });
        x.save(); x.translate(14, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Dose (mg/kg)', 0, 0); x.restore();
        x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('NOAEL in the selected species and the same human equivalent dose expressed in each species', box.l, 18);
        FDA.forEach(function(q, i){ var v = S.n * s[2] / q[2], bx = box.l + i * bw + bw * 0.16, w = bw * 0.68, on = q[0] === S.sp; x.fillStyle = on ? C.red : GREY; x.globalAlpha = hv === i ? 1 : 0.9; x.fillRect(bx, sy(v), w, box.b - sy(v)); x.globalAlpha = 1; x.fillStyle = C.char; x.textAlign = 'center'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(q[0], bx + w / 2, box.b + 18); x.font = '11px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.mid; x.fillText(q[1] + ' kg, factor ' + q[2], bx + w / 2, box.b + 34); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(fx(v), bx + w / 2, sy(v) - 6); x.font = '12px Aptos, "Segoe UI", sans-serif'; });
        var si = FDA.indexOf(s), hxp = box.l + si * bw + bw * 0.5; IX.dot(M, hxp, sy(S.n), 7, C.red);
        IX.hline(M, sy(H), C.warn, [5, 4]); lab(M, 'human equivalent dose ' + fx(H) + ' mg/kg', box.r - 4, sy(H) - 6, C.warn, 'right');
        if (hv >= 0) { var q = FDA[hv]; IX.tip(M, box.l + hv * bw + bw * 0.5, sy(S.n * s[2] / q[2]), [q[0] + ', ' + q[1] + ' kg', 'surface-area factor ' + q[2], 'dose ' + fx(S.n * s[2] / q[2]) + ' mg/kg']); }
        qs('.sd', side).innerHTML = fTile('Starting dose', fx(H / S.sf * WH) + ' mg', 'for a ' + WH + ' kg adult') + fRows([['Human equivalent dose', fx(H) + ' mg/kg'], ['Per kg after the safety factor', fx(H / S.sf) + ' mg/kg'], ['Conversion, animal factor / 37', fx(s[2] / KMH)], ['Species', s[0] + ', ' + s[1] + ' kg']]) + '<div class="hint" style="font-size:11.5px;margin-top:8px">HED = NOAEL x (animal factor / human factor 37). Drag the selected bar top to set the NOAEL.</div>';
        api.stat('Starting dose ' + fx(H / S.sf * WH) + ' mg from a NOAEL of ' + S.n + ' mg/kg in ' + s[0]);
      }
      [['n', c1], ['sf', c3]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('ds5', S); draw(); }); });
      qs('.sp', c2).addEventListener('change', function(){ S.sp = this.value; IX.save('ds5', S); draw(); });
      function hpos(){ var i = FDA.indexOf(cur()); return [G.box.l + i * G.bw + G.bw * 0.5, G.box.b - S.n / G.ym * (G.box.b - G.box.t)]; }
      IX.attach(cvs, {
        move: function(p){ if (!G) return; hv = (p.x >= G.box.l && p.x <= G.box.r && p.y >= G.box.t && p.y <= G.box.b) ? Math.floor((p.x - G.box.l) / G.bw) : -1; var h = hpos(); cvs.style.cursor = Math.hypot(p.x - h[0], p.y - h[1]) < 12 ? 'ns-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var h = hpos(); if (Math.hypot(p.x - h[0], p.y - h[1]) < 14) { lock = G.ym; return { k: 'n', ym: G.ym }; } return null; },
        drag: function(d, p){ S.n = cl(Math.round((G.box.b - p.y) / (G.box.b - G.box.t) * d.ym), 1, 300); sync(); draw(); },
        up: function(){ lock = null; IX.save('ds5', S); draw(); }
      });
      sync();
      return { render: draw };
    } });
})();
