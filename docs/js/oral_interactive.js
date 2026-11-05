"use strict";
/* Tab 04, the three steps with direct manipulation: a draggable oral peak and intravenous starting point,
   draggable AUC bars with the implied profiles, and draggable stage bars for F = Fa x Fg x Fh. */
(function(){
  var GREY = '#A1B1C4', D100 = 100;
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }
  function lab(M, text, px, py, col, anc){ var x = M.x; x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = anc || 'left'; x.fillText(text, px, py); x.font = '12px Aptos, "Segoe UI", sans-serif'; }

  /* ===== step 1: concentration after an oral dose ===== */
  ORAL.add({ short: 'Oral profile', level: 'foundations', ord: 10, title: 'Concentration after an oral dose',
    build: function(api){
      var T = 24, S = IX.state('or1', { f: 0.5, c: 10, v: 50, a: 1 }), pins = [], hv = null, M = null, lock = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('f', 'F', 0.05, 1, 0.01, S.f)), c2 = api.addControl(IX.slider('c', 'CL', 1, 50, 1, S.c, 'L/h')), c3 = api.addControl(IX.slider('v', 'V', 10, 300, 5, S.v, 'L')), c4 = api.addControl(IX.slider('a', 'ka', 0.1, 5, 0.1, S.a, '1/h'));
      function sync(){ qs('.f', c1).value = S.f; qs('.c', c2).value = S.c; qs('.v', c3).value = S.v; qs('.a', c4).value = S.a; }
      function kaa(P){ var ke = P.c / P.v; return Math.abs(P.a - ke) < 1e-3 ? P.a + 0.01 : P.a; }
      function oral(P, t){ var ke = P.c / P.v, ka = kaa(P); return P.f * D100 * ka / (P.v * (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t)); }
      function ivc(P, t){ return D100 / P.v * Math.exp(-P.c / P.v * t); }
      function peak(P){ var t, c, m = { cmax: 0, tmax: 0 }; for (t = 0; t <= T + 1e-9; t += 0.05) { c = oral(P, t); if (c > m.cmax) m = { cmax: c, tmax: t }; } return m; }
      function tmaxf(ke, ka){ return Math.abs(ka - ke) < 1e-6 ? 1 / ke : Math.log(ka / ke) / (ka - ke); }
      IX.tools(api, { pin: function(){ pins.push({ f: S.f, c: S.c, v: S.v, a: S.a }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'oral-profile',
        csv: function(){ var rows = [['t (h)', 'C oral (mg/L)', 'C intravenous (mg/L)']], i; for (i = 0; i <= 240; i++) rows.push([i / 10, oral(S, i / 10), ivc(S, i / 10)]); return IX.csv(rows); } });
      function draw(){
        qs('.fv', c1).textContent = S.f.toFixed(2); qs('.cv', c2).textContent = S.c; qs('.vv', c3).textContent = S.v; qs('.av', c4).textContent = S.a.toFixed(1);
        var pk = peak(S), ym = lock ? lock.ym : Math.max(D100 / S.v, pk.cmax, pins.reduce(function(m, p){ return Math.max(m, peak(p).cmax, D100 / p.v); }, 0)) * 1.1;
        M = IX.chart(cvs, { xr: [0, T], yr: [0, ym], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return ivc(S, t); }, color: C.mid, w: 2.4, label: 'Intravenous' }, { fn: function(t){ return oral(S, t); }, color: C.red, w: 2.6, label: 'Oral' }], pinned: pins.map(function(p){ return { fn: function(t){ return oral(p, t); }, color: GREY, w: 1.8, dash: [5, 4] }; }) });
        var x = M.x; x.fillStyle = 'rgba(180,60,40,.10)'; x.beginPath(); x.moveTo(M.sx(0), M.box.b); var i; for (i = 0; i <= 120; i++) { var t = T * i / 120; x.lineTo(M.sx(t), M.sy(Math.min(oral(S, t), ym))); } x.lineTo(M.sx(T), M.box.b); x.closePath(); x.fill();
        IX.dot(M, M.sx(pk.tmax), M.sy(pk.cmax), 6, C.red); lab(M, 'peak (drag)', M.sx(pk.tmax) + 9, M.sy(pk.cmax) - 8, C.red);
        IX.dot(M, M.sx(0), M.sy(D100 / S.v), 6, C.mid); lab(M, 'C0 (drag)', M.sx(0) + 10, M.sy(D100 / S.v) - 6, C.mid);
        if (hv !== null) { var co = oral(S, hv), ci = ivc(S, hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(co), 4.5, C.red); IX.tip(M, M.sx(hv), M.sy(co), ['t = ' + hv.toFixed(1) + ' h', 'oral ' + co.toFixed(2) + ' mg/L', 'intravenous ' + ci.toFixed(2) + ' mg/L']); }
        qs('.sd', side).innerHTML = fTile('AUC, oral', (S.f * D100 / S.c).toFixed(2), 'mg x h/L = F x dose / CL') + fTile('AUC, intravenous', (D100 / S.c).toFixed(2), 'mg x h/L = dose / CL') + '<div style="font-size:12px;color:' + C.mid + ';line-height:1.5">Oral Cmax ' + pk.cmax.toFixed(2) + ' mg/L at ' + pk.tmax.toFixed(1) + ' h. Half-life ' + (0.693 * S.v / S.c).toFixed(1) + ' h. Dose ' + D100 + ' mg.</div><div class="hint" style="font-size:11.5px;margin-top:8px">Drag the peak: vertical sets F, horizontal sets ka. Drag C0 to set V. The shaded area is proportional to the oral AUC.</div>';
        api.stat('AUC oral ' + (S.f * D100 / S.c).toFixed(2) + ', AUC intravenous ' + (D100 / S.c).toFixed(2));
      }
      [['f', c1], ['c', c2], ['v', c3], ['a', c4]].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[0]] = +this.value; IX.save('or1', S); draw(); }); });
      IX.attach(cvs, {
        move: function(p){ if (!M) return; hv = M.inside(p) ? cl(M.ix(p.x), 0, T) : null; var pk = peak(S); cvs.style.cursor = Math.hypot(p.x - M.sx(pk.tmax), p.y - M.sy(pk.cmax)) < 12 ? 'move' : (Math.hypot(p.x - M.sx(0), p.y - M.sy(D100 / S.v)) < 12 ? 'ns-resize' : 'crosshair'); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var pk = peak(S), fr = { ym: M.iy(M.box.t) }; if (Math.hypot(p.x - M.sx(pk.tmax), p.y - M.sy(pk.cmax)) < 13) { lock = fr; return { k: 'pk' }; } if (Math.hypot(p.x - M.sx(0), p.y - M.sy(D100 / S.v)) < 13) { lock = fr; return { k: 'v' }; } return null; },
        drag: function(d, p){
          if (d.k === 'v') S.v = cl(Math.round(D100 / Math.max(M.iy(p.y), 0.05) / 5) * 5, 10, 300);
          else { var ke = S.c / S.v, tt = cl(M.ix(p.x), 0.2, T / 2), lo = 0.1, hi = 5, mid, i; for (i = 0; i < 40; i++) { mid = (lo + hi) / 2; if (tmaxf(ke, mid) > tt) lo = mid; else hi = mid; } S.a = cl(Math.round(mid * 10) / 10, 0.1, 5); var one = peak({ f: 1, c: S.c, v: S.v, a: S.a }); S.f = cl(Math.round(M.iy(p.y) / one.cmax * 100) / 100, 0.05, 1); }
          sync(); draw(); },
        up: function(){ lock = null; IX.save('or1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: bioavailability from AUC ===== */
  ORAL.add({ short: 'Bioavailability from AUCs', level: 'foundations', ord: 20, title: 'Bioavailability from AUC',
    build: function(api){
      var S = IX.state('or2', { di: 50, ai: 10, dp: 100, ap: 8 }), pins = [], hv = null, Mb = null, Mp = null, lock = null, VV = 50, KA = 1;
      var pn = api.el('pn', 'left:28px;top:16px;width:330px;height:508px;overflow:auto;padding:8px', '<canvas class="b" width="314" height="270" style="width:314px;height:270px"></canvas><div class="sd"></div>');
      var pn2 = api.el('pn', 'left:374px;top:16px;width:558px;height:508px;padding:8px', '<canvas class="p" width="542" height="490" style="width:542px;height:490px"></canvas>');
      var cb = qs('.b', pn), cp = qs('.p', pn2);
      var c1 = api.addControl(IX.slider('a', 'Intravenous dose', 10, 200, 5, S.di, 'mg')), c2 = api.addControl(IX.slider('b', 'Intravenous AUC', 1, 40, 0.5, S.ai, 'mg x h/L')), c3 = api.addControl(IX.slider('c', 'Oral dose', 10, 400, 10, S.dp, 'mg')), c4 = api.addControl(IX.slider('d', 'Oral AUC', 0.5, 40, 0.5, S.ap, 'mg x h/L'));
      function sync(){ qs('.a', c1).value = S.di; qs('.b', c2).value = S.ai; qs('.c', c3).value = S.dp; qs('.d', c4).value = S.ap; }
      function Fof(P){ return (P.ap / P.dp) / (P.ai / P.di); }
      function ivc(P, t){ var ke = (P.di / P.ai) / VV; return P.di / VV * Math.exp(-ke * t); }
      function orc(P, t){ var ke = (P.di / P.ai) / VV, ka = Math.abs(KA - ke) < 1e-3 ? KA + 0.01 : KA; return Fof(P) * P.dp * ka / (VV * (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t)); }
      IX.tools(api, { pin: function(){ pins.push({ di: S.di, ai: S.ai, dp: S.dp, ap: S.ap }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cb, cp]; }, name: 'bioavailability-from-auc',
        csv: function(){ var T = Math.min(Math.max(4 * 0.693 * VV / (S.di / S.ai), 6), 72), rows = [['Quantity', 'Value'], ['IV dose (mg)', S.di], ['IV AUC (mg x h/L)', S.ai], ['Oral dose (mg)', S.dp], ['Oral AUC (mg x h/L)', S.ap], ['F', Fof(S)], [], ['t (h)', 'C intravenous (mg/L)', 'C oral (mg/L)']], i; for (i = 0; i <= 100; i++) rows.push([T * i / 100, ivc(S, T * i / 100), orc(S, T * i / 100)]); return IX.csv(rows); } });
      function bars(){
        var g = cv(cb), x = g.x, box = { l: 48, r: g.w - 14, t: 24, b: g.h - 34 }, ni = S.ai / S.di, np = S.ap / S.dp, mx = lock ? lock.mx : Math.max(ni, np, pins.reduce(function(m, p){ return Math.max(m, p.ai / p.di, p.ap / p.dp); }, 0)) * 1.25; Mb = { x: x, box: box, mx: mx };
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right';
        var yt = niceTicks(0, mx, 4); yt.v.forEach(function(v){ var y = box.b - v / mx * (box.b - box.t); x.beginPath(); x.moveTo(box.l, y); x.lineTo(box.r, y); x.stroke(); x.fillText(tickText(v, yt.step), box.l - 5, y + 4); });
        x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(box.l, box.b); x.lineTo(box.r, box.b); x.moveTo(box.l, box.t); x.lineTo(box.l, box.b); x.stroke(); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('AUC / dose (h/L)', 0, 0); x.restore();
        [['Intravenous', ni, C.mid, 0], ['Oral', np, C.red, 1]].forEach(function(b){ var bxp = box.l + 28 + b[3] * 124, hg = b[1] / mx * (box.b - box.t); x.fillStyle = b[2]; x.fillRect(bxp, box.b - hg, 84, hg); pins.forEach(function(p){ var pv = b[3] ? p.ap / p.dp : p.ai / p.di, py = box.b - pv / mx * (box.b - box.t); x.strokeStyle = GREY; x.lineWidth = 2; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(bxp - 4, py); x.lineTo(bxp + 88, py); x.stroke(); x.setLineDash([]); }); IX.dot(Mb, bxp + 42, box.b - hg, 6, b[2]); x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(b[0], bxp + 42, box.b + 18); x.fillText(b[1].toFixed(3), bxp + 42, box.b - hg - 12); });
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('drag a bar top to set its AUC', box.l + 4, 14);
      }
      function prof(){
        var CL = S.di / S.ai, T = Math.min(Math.max(4 * 0.693 * VV / CL, 6), 72), F = Fof(S), pkv = 0, i; for (i = 0; i <= 200; i++) pkv = Math.max(pkv, ivc(S, T * i / 200), orc(S, T * i / 200));
        Mp = IX.chart(cp, { xr: [0, T], yr: [0, pkv * 1.1], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return ivc(S, t); }, color: C.mid, w: 2.4, label: 'Intravenous' }, { fn: function(t){ return orc(S, t); }, color: C.red, w: 2.6, label: 'Oral' }], pinned: pins.map(function(p){ return { fn: function(t){ return orc(p, t); }, color: GREY, w: 1.6, dash: [5, 4] }; }) });
        var x = Mp.x; [[ivc, 'rgba(15,110,140,.12)'], [orc, 'rgba(180,60,40,.12)']].forEach(function(r){ x.fillStyle = r[1]; x.beginPath(); x.moveTo(Mp.sx(0), Mp.box.b); for (var j = 0; j <= 100; j++) { var t = T * j / 100; x.lineTo(Mp.sx(t), Mp.sy(r[0](S, t))); } x.lineTo(Mp.sx(T), Mp.box.b); x.closePath(); x.fill(); });
        lab(Mp, 'Profiles implied by the AUCs (V = 50 L, ka = 1 per h, equal CL)', Mp.box.l + 8, Mp.box.t + 30);
        if (hv !== null) { var ke = CL / VV, ci = ivc(S, hv), co = orc(S, hv); IX.vline(Mp, Mp.sx(hv), C.mid, [2, 3]); IX.dot(Mp, Mp.sx(hv), Mp.sy(co), 4.5, C.red); IX.tip(Mp, Mp.sx(hv), Mp.sy(Math.max(ci, co)), ['t = ' + hv.toFixed(1) + ' h', 'intravenous ' + ci.toFixed(2) + ' mg/L', 'oral ' + co.toFixed(2) + ' mg/L', 'AUC(0 to t) IV ' + (S.di / CL * (1 - Math.exp(-ke * hv))).toFixed(1)]); }
      }
      function draw(){
        qs('.av', c1).textContent = S.di; qs('.bv', c2).textContent = S.ai.toFixed(1); qs('.cv', c3).textContent = S.dp; qs('.dv', c4).textContent = S.ap.toFixed(1);
        var ni = S.ai / S.di, np = S.ap / S.dp, F = np / ni; bars(); prof();
        qs('.sd', pn).innerHTML = fTile('Bioavailability F', F.toFixed(2), 'oral AUC per dose over intravenous AUC per dose') + fRows([['Intravenous, AUC / dose', ni.toFixed(3) + ' h/L'], ['Oral, AUC / dose', np.toFixed(3) + ' h/L'], ['Implied clearance, dose / AUC (IV)', (S.di / S.ai).toFixed(1) + ' L/h'], ['Fraction of the oral dose lost', (100 * (1 - Math.min(F, 1))).toFixed(0) + ' percent']]) + (pins.length ? '<div class="ol" style="margin-top:8px">Pinned F</div>' + fRows(pins.map(function(p, i){ return ['Pin ' + (i + 1), Fof(p).toFixed(2)]; })) : '') + (F > 1 ? '<div class="hint" style="font-size:12px;margin-top:8px">F above 1 is not possible. The clearance or the AUCs differ between occasions.</div>' : '');
        api.stat('F = ' + F.toFixed(2));
      }
      [['a', c1, 'di'], ['b', c2, 'ai'], ['c', c3, 'dp'], ['d', c4, 'ap']].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[2]] = +this.value; IX.save('or2', S); draw(); }); });
      function topOf(i){ var box = Mb.box, v = i ? S.ap / S.dp : S.ai / S.di; return [box.l + 28 + i * 124 + 42, box.b - v / Mb.mx * (box.b - box.t)]; }
      IX.attach(cb, {
        move: function(p){ if (!Mb) return; var h = [topOf(0), topOf(1)]; cb.style.cursor = (Math.hypot(p.x - h[0][0], p.y - h[0][1]) < 12 || Math.hypot(p.x - h[1][0], p.y - h[1][1]) < 12) ? 'ns-resize' : 'default'; },
        down: function(p){ var h = [topOf(0), topOf(1)], i; for (i = 0; i < 2; i++) if (Math.hypot(p.x - h[i][0], p.y - h[i][1]) < 13) { lock = { mx: Mb.mx }; return { k: i }; } return null; },
        drag: function(d, p){ var v = cl((Mb.box.b - p.y) / (Mb.box.b - Mb.box.t) * Mb.mx, 0, Mb.mx); if (d.k === 0) S.ai = cl(Math.round(v * S.di * 2) / 2, 1, 40); else S.ap = cl(Math.round(v * S.dp * 2) / 2, 0.5, 40); sync(); draw(); },
        up: function(){ lock = null; IX.save('or2', S); draw(); }
      });
      IX.attach(cp, {
        move: function(p){ if (!Mp) return; hv = Mp.inside(p) ? cl(Mp.ix(p.x), 0, Mp.ix(Mp.box.r)) : null; cp.style.cursor = 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 3: bioavailability as a product ===== */
  ORAL.add({ short: 'Bioavailability as a product', level: 'foundations', ord: 30, title: 'Bioavailability as a product',
    build: function(api){
      var S = IX.state('or3', { fa: 0.9, fg: 0.8, cl: 8, q: 21 }), pins = [], hv = -1, Mx = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="sd"></div>');
      var c1 = api.addControl(IX.slider('a', 'Fa', 0, 1, 0.01, S.fa)), c2 = api.addControl(IX.slider('g', 'Fg', 0, 1, 0.01, S.fg)), c3 = api.addControl(IX.slider('c', 'CLh blood', 0, 30, 0.5, S.cl, 'mL/min/kg')), c4 = api.addControl(IX.slider('q', 'Liver blood flow', 15, 30, 1, S.q));
      function sync(){ qs('.a', c1).value = S.fa; qs('.g', c2).value = S.fg; qs('.c', c3).value = S.cl; qs('.q', c4).value = S.q; }
      function fhOf(P){ return Math.max(0, 1 - P.cl / P.q); }
      function stages(P){ var fh = fhOf(P); return [['Dose', 1], ['After absorption (Fa)', P.fa], ['After gut wall (Fg)', P.fa * P.fg], ['After liver (Fh)', P.fa * P.fg * fh]]; }
      var NAMES = ['Dose', 'Absorption, Fa', 'Gut-wall metabolism, Fg', 'Hepatic first pass, Fh'];
      IX.tools(api, { pin: function(){ pins.push({ fa: S.fa, fg: S.fg, cl: S.cl, q: S.q }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); }, canvases: function(){ return [cvs]; }, name: 'bioavailability-product',
        csv: function(){ var rows = [['Stage', 'Fraction of the dose remaining']]; stages(S).forEach(function(s){ rows.push([s[0], s[1]]); }); rows.push([], ['Fh', fhOf(S)], ['CLh blood (mL/min/kg)', S.cl], ['Q (mL/min/kg)', S.q]); return IX.csv(rows); } });
      var BOX = null;
      function xOf(v){ return BOX.l + v * (BOX.r - BOX.l); }
      function draw(){
        var fh = fhOf(S), f = S.fa * S.fg * fh; qs('.av', c1).textContent = S.fa.toFixed(2); qs('.gv', c2).textContent = S.fg.toFixed(2); qs('.cv', c3).textContent = S.cl.toFixed(1); qs('.qv', c4).textContent = S.q;
        var g = cv(cvs), x = g.x, box = { l: 150, r: g.w - 20, t: 20, b: g.h - 20 }, st = stages(S), bh = (box.b - box.t) / st.length; BOX = box; Mx = { x: x, box: box };
        x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'center'; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ var xp = xOf(v); x.beginPath(); x.moveTo(xp, box.t); x.lineTo(xp, box.b); x.stroke(); x.fillText(v.toFixed(2), xp, box.b + 14); });
        st.forEach(function(s, i){ var y = box.t + i * bh + 10, w = s[1] * (box.r - box.l), prev = i ? st[i - 1][1] : 1, hh = bh - 30; x.fillStyle = C.tint; x.fillRect(box.l, y, prev * (box.r - box.l), hh); x.fillStyle = i === 3 ? C.dred : C.red; x.globalAlpha = i === hv ? 1 : 0.9; x.fillRect(box.l, y, w, hh); x.globalAlpha = 1;
          pins.forEach(function(p){ var pv = stages(p)[i][1]; x.strokeStyle = GREY; x.lineWidth = 2; x.setLineDash([3, 3]); x.beginPath(); x.moveTo(xOf(pv), y - 3); x.lineTo(xOf(pv), y + hh + 3); x.stroke(); x.setLineDash([]); });
          x.fillStyle = C.char; x.textAlign = 'right'; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(s[0], box.l - 10, y + hh / 2 + 4); x.textAlign = 'left'; x.fillText(s[1].toFixed(3), box.l + w + 12, y + hh / 2 + 4); x.font = '12px Aptos, "Segoe UI", sans-serif';
          if (i > 0) IX.dot(Mx, box.l + w, y + hh / 2, 6, i === 3 ? C.dred : C.red); });
        x.fillStyle = C.mid; x.font = '11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'right'; x.fillText('drag a bar end to set its factor', box.r, box.t - 6);
        if (hv > 0) { var y2 = box.t + hv * bh + 10; IX.tip(Mx, xOf(st[hv][1]), y2 + 10, [NAMES[hv], 'remaining ' + st[hv][1].toFixed(3), 'lost at this stage ' + (st[hv - 1][1] - st[hv][1]).toFixed(3), 'factor ' + (st[hv - 1][1] > 0 ? (st[hv][1] / st[hv - 1][1]).toFixed(3) : 'n/a')]); }
        qs('.sd', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Oral bioavailability F</b><div class="v">' + f.toFixed(3) + '</div><div class="s">' + S.fa.toFixed(2) + ' x ' + S.fg.toFixed(2) + ' x ' + fh.toFixed(2) + '</div></div>' + aRows([['Hepatic extraction', Math.min(1, S.cl / S.q).toFixed(2)], ['Fh', fh.toFixed(2)], ['Largest loss', ['absorption', 'gut wall', 'liver'][[1 - S.fa, S.fa * (1 - S.fg), S.fa * S.fg * (1 - fh)].reduce(function(b, v, i, a){ return v > a[b] ? i : b; }, 0)]]]) + (pins.length ? '<div class="ol" style="margin:8px 0 2px">Pinned F</div>' + aRows(pins.map(function(p, i){ return ['Pin ' + (i + 1), (p.fa * p.fg * fhOf(p)).toFixed(3)]; })) : '') + '<div class="hint" style="font-size:11.5px;margin-top:8px">Fh = 1 - CLh / Q. Clearance above the blood flow is not possible for a hepatic route.</div>';
        api.stat('F = ' + f.toFixed(3));
      }
      [['a', c1, 'fa'], ['g', c2, 'fg'], ['c', c3, 'cl']].forEach(function(r){ qs('.' + r[0], r[1]).addEventListener('input', function(){ S[r[2]] = +this.value; IX.save('or3', S); draw(); }); });
      qs('.q', c4).addEventListener('input', function(){ S.q = +this.value; S.cl = Math.min(S.cl, S.q); sync(); IX.save('or3', S); draw(); });
      function row(p){ if (!Mx) return -1; var bh = (Mx.box.b - Mx.box.t) / 4, i = Math.floor((p.y - Mx.box.t) / bh); return i >= 0 && i < 4 ? i : -1; }
      function endOf(i){ return xOf(stages(S)[i][1]); }
      IX.attach(cvs, {
        move: function(p){ if (!Mx) return; var i = row(p); hv = i; cvs.style.cursor = (i > 0 && near(p.x, endOf(i), 11)) ? 'ew-resize' : 'default'; draw(); },
        leave: function(){ hv = -1; draw(); },
        down: function(p){ var i = row(p); return (i > 0 && near(p.x, endOf(i), 12)) ? { k: i } : null; },
        drag: function(d, p){ var v = cl((p.x - BOX.l) / (BOX.r - BOX.l), 0, 1), fa = S.fa, fg = S.fg, fh = fhOf(S);
          if (d.k === 1) S.fa = Math.round(v * 100) / 100; else if (d.k === 2) S.fg = fa > 0 ? Math.round(cl(v / fa, 0, 1) * 100) / 100 : S.fg; else { var den = fa * fg; if (den > 0) { fh = cl(v / den, 0, 1); S.cl = cl(Math.round(S.q * (1 - fh) * 2) / 2, 0, S.q); } }
          sync(); draw(); },
        up: function(){ IX.save('or3', S); draw(); }
      });
      sync();
      return { render: draw };
    } });
})();
