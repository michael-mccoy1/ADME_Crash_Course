"use strict";
/* Tab 01, the three steps with direct manipulation: hover readouts, draggable parameters, pinned scenarios, export. */
(function(){
  var GREY = '#A1B1C4';
  function cl(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function near(a, b, d){ return Math.abs(a - b) <= d; }

  /* ===== step 1: concentration and effect ===== */
  WHY.add({ short: 'Concentration and effect', level: 'foundations', ord: 10, title: 'Dose, concentration and effect',
    build: function(api){
      var V1 = 50, S = IX.state('why1', { e: 0, h: 1, d: 100, c: 10, ax: 'lin' }), pins = [], hv = null, lock = null, MA = null, MB = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:440px;height:508px;padding:8px', '<canvas class="a" width="424" height="420" style="width:424px;height:420px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px;min-height:38px"></div>'), ca = qs('.a', pn);
      var pn2 = api.el('pn', 'left:484px;top:16px;width:448px;height:508px;padding:8px', '<canvas class="b" width="432" height="420" style="width:432px;height:420px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px;min-height:38px"></div>'), cb = qs('.b', pn2);
      var c1 = api.addControl(IX.slider('e', 'EC50', -1, 1, 0.05, S.e, 'mg/L')), c2 = api.addControl(IX.slider('h', 'h', 0.5, 4, 0.1, S.h)), c3 = api.addControl(IX.slider('d', 'Dose', 10, 500, 10, S.d, 'mg')), c4 = api.addControl(IX.slider('c', 'CL', 2, 40, 1, S.c, 'L/h')), c5 = api.addControl('Concentration axis <select class="ax"><option value="lin">Linear</option><option value="log">Logarithmic</option></select>');
      function eff(C, ec, h){ return 100 * Math.pow(C, h) / (Math.pow(ec, h) + Math.pow(C, h)); }
      function sync(){ qs('.e', c1).value = S.e; qs('.h', c2).value = S.h; qs('.d', c3).value = S.d; qs('.c', c4).value = S.c; qs('.ax', c5).value = S.ax; }
      IX.tools(api, {
        pin: function(){ pins.push({ e: S.e, h: S.h, d: S.d, c: S.c }); if (pins.length > 3) pins.shift(); draw(); }, clear: function(){ pins = []; draw(); },
        canvases: function(){ return [ca, cb]; }, name: 'concentration-effect',
        csv: function(){ var ec = Math.pow(10, S.e), k = S.c / V1, c0 = S.d / V1, T = Math.max(4 * 0.693 / k, 4), rows = [['EC50 (mg/L)', ec], ['h', S.h], ['Dose (mg)', S.d], ['V (L)', V1], ['CL (L/h)', S.c], [], ['C (mg/L)', 'Effect (percent of Emax)']], i; for (i = 0; i <= 100; i++) rows.push([i / 10, eff(i / 10, ec, S.h)]); rows.push([], ['t (h)', 'C (mg/L)']); for (i = 0; i <= 100; i++) rows.push([T * i / 100, c0 * Math.exp(-k * T * i / 100)]); return IX.csv(rows); }
      });
      function draw(){
        var ec = Math.pow(10, S.e), k = S.c / V1, c0 = S.d / V1, th = 0.693 / k, log = S.ax === 'log', i;
        qs('.ev', c1).textContent = ec.toFixed(2); qs('.hv', c2).textContent = S.h.toFixed(1); qs('.dv', c3).textContent = S.d; qs('.cv', c4).textContent = S.c;
        MA = IX.chart(ca, { xr: log ? [0.05, 20] : [0, 10], xlog: log, yr: [0, 100], xl: 'Concentration (mg/L)', yl: 'Effect (percent of Emax)', series: [{ fn: function(C){ return eff(C, ec, S.h); }, color: C.red, w: 2.6 }], pinned: pins.map(function(p){ var pe = Math.pow(10, p.e); return { fn: function(C){ return eff(C, pe, p.h); }, color: GREY, w: 1.8, dash: [5, 4] }; }) });
        var x = MA.x, ex = MA.sx(ec); IX.vline(MA, ex, C.char);
        x.fillStyle = C.char; x.beginPath(); x.moveTo(ex - 6, MA.box.t); x.lineTo(ex + 6, MA.box.t); x.lineTo(ex, MA.box.t + 9); x.fill(); x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('EC50 ' + ec.toFixed(2), ex + 8, MA.box.t + 12); x.font = '12px Aptos, "Segoe UI", sans-serif';
        var cp = cl(c0, MA.ix(MA.box.l), MA.ix(MA.box.r)); IX.dot(MA, MA.sx(cp), MA.sy(eff(cp, ec, S.h)), 6, C.red);
        var Ch = null; if (hv && hv.src === 'a') Ch = hv.C; if (hv && hv.src === 'b') Ch = c0 * Math.exp(-k * hv.t);
        if (Ch !== null) { IX.vline(MA, MA.sx(Ch), C.mid, [2, 3]); IX.dot(MA, MA.sx(Ch), MA.sy(eff(Ch, ec, S.h)), 5, C.char); if (hv.src === 'a') IX.tip(MA, MA.sx(Ch), MA.sy(eff(Ch, ec, S.h)), ['C = ' + Ch.toFixed(2) + ' mg/L', 'E = ' + eff(Ch, ec, S.h).toFixed(1) + '% of Emax']); }
        var ep = eff(c0, ec, S.h); qs('.ra', pn).innerHTML = 'Peak <b>' + c0.toFixed(2) + ' mg/L</b> gives <b>' + ep.toFixed(0) + '%</b> of Emax. Drag the EC50 line to set it.';
        var T = Math.max(4 * th, 4), ymax = lock ? lock.ymax : Math.max(c0, ec * 1.2) * 1.1, above = c0 > ec ? Math.log(c0 / ec) / k : 0;
        MB = IX.chart(cb, { xr: [0, T], yr: [0, ymax], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: function(t){ return c0 * Math.exp(-k * t); }, color: C.mid, w: 2.6 }], pinned: pins.map(function(p){ return { fn: function(t){ return (p.d / V1) * Math.exp(-(p.c / V1) * t); }, color: GREY, w: 1.8, dash: [5, 4] }; }) });
        var x2 = MB.x;
        if (above > 0) { x2.fillStyle = 'rgba(180,86,27,.15)'; x2.beginPath(); x2.moveTo(MB.sx(0), MB.sy(ec)); for (i = 0; i <= 60; i++) { var tt = above * i / 60; x2.lineTo(MB.sx(tt), MB.sy(c0 * Math.exp(-k * tt))); } x2.lineTo(MB.sx(above), MB.sy(ec)); x2.closePath(); x2.fill(); }
        IX.hline(MB, MB.sy(ec), C.warn, [5, 4]); x2.fillStyle = C.warn; x2.font = '600 11px Aptos, "Segoe UI", sans-serif'; x2.textAlign = 'right'; x2.fillText('EC50 (drag)', MB.box.r - 4, MB.sy(ec) - 5); x2.font = '12px Aptos, "Segoe UI", sans-serif';
        IX.dot(MB, MB.sx(0), MB.sy(c0), 6, C.mid); x2.fillStyle = C.char; x2.font = '600 11px Aptos, "Segoe UI", sans-serif'; x2.textAlign = 'left'; x2.fillText('C0 (drag)', MB.sx(0) + 10, MB.sy(c0) - 6); x2.font = '12px Aptos, "Segoe UI", sans-serif';
        if (hv && hv.src === 'b') { var cc = c0 * Math.exp(-k * hv.t); IX.vline(MB, MB.sx(hv.t), C.mid, [2, 3]); IX.dot(MB, MB.sx(hv.t), MB.sy(cc), 5, C.char); IX.tip(MB, MB.sx(hv.t), MB.sy(cc), ['t = ' + hv.t.toFixed(1) + ' h', 'C = ' + cc.toFixed(2) + ' mg/L', 'E = ' + eff(cc, ec, S.h).toFixed(1) + '% of Emax']); }
        if (hv && hv.src === 'a') { IX.hline(MB, MB.sy(hv.C), C.mid, [2, 3]); if (c0 > hv.C) IX.dot(MB, MB.sx(Math.log(c0 / hv.C) / k), MB.sy(hv.C), 5, C.char); }
        qs('.rb', pn2).innerHTML = 'Half-life <b>' + th.toFixed(1) + ' h</b>. Time above the EC50: <b>' + (above > 0 ? above.toFixed(1) + ' h' : 'none') + '</b>. A dose of ' + (2 * S.d) + ' mg gives ' + (2 * c0 > ec ? (Math.log(2 * c0 / ec) / k).toFixed(1) + ' h' : 'none') + '.';
        api.stat('Peak effect ' + ep.toFixed(0) + '% of Emax, time above EC50 ' + above.toFixed(1) + ' h');
      }
      qs('.e', c1).addEventListener('input', function(){ S.e = +this.value; IX.save('why1', S); draw(); });
      qs('.h', c2).addEventListener('input', function(){ S.h = +this.value; IX.save('why1', S); draw(); });
      qs('.d', c3).addEventListener('input', function(){ S.d = +this.value; IX.save('why1', S); draw(); });
      qs('.c', c4).addEventListener('input', function(){ S.c = +this.value; IX.save('why1', S); draw(); });
      qs('.ax', c5).addEventListener('change', function(){ S.ax = this.value; IX.save('why1', S); draw(); });
      IX.attach(ca, {
        move: function(p){ if (!MA || !MA.inside(p)) { hv = null; ca.style.cursor = 'default'; draw(); return; } hv = { src: 'a', C: cl(MA.ix(p.x), MA.ix(MA.box.l), MA.ix(MA.box.r)) }; ca.style.cursor = near(p.x, MA.sx(Math.pow(10, S.e)), 8) ? 'ew-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ return (MA && near(p.x, MA.sx(Math.pow(10, S.e)), 9) && p.y >= MA.box.t && p.y <= MA.box.b) ? { k: 'ec' } : null; },
        drag: function(d, p){ S.e = cl(Math.round(Math.log10(cl(MA.ix(p.x), 0.1, 10)) * 100) / 100, -1, 1); sync(); draw(); },
        up: function(){ IX.save('why1', S); }
      });
      IX.attach(cb, {
        move: function(p){ if (!MB || !MB.inside(p)) { hv = null; cb.style.cursor = 'default'; draw(); return; } hv = { src: 'b', t: cl(MB.ix(p.x), 0, MB.ix(MB.box.r)) }; var ec = Math.pow(10, S.e), c0 = S.d / V1; cb.style.cursor = (near(p.y, MB.sy(ec), 8) || Math.hypot(p.x - MB.sx(0), p.y - MB.sy(c0)) < 12) ? 'ns-resize' : 'crosshair'; draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var ec = Math.pow(10, S.e), c0 = S.d / V1; if (Math.hypot(p.x - MB.sx(0), p.y - MB.sy(c0)) < 12) { lock = { ymax: MB.iy(MB.box.t) }; return { k: 'dose' }; } if (near(p.y, MB.sy(ec), 9) && p.x >= MB.box.l && p.x <= MB.box.r) { lock = { ymax: MB.iy(MB.box.t) }; return { k: 'ec' }; } return null; },
        drag: function(d, p){ var Cv = MB.iy(p.y); if (d.k === 'dose') S.d = cl(Math.round(Cv * V1 / 10) * 10, 10, 500); else S.e = cl(Math.round(Math.log10(Math.max(Cv, 0.1)) * 100) / 100, -1, 1); sync(); draw(); },
        up: function(){ lock = null; IX.save('why1', S); draw(); }
      });
      sync();
      return { render: draw };
    } });

  /* ===== step 2: stages of an oral dose ===== */
  WHY.add({ short: 'Path of an oral dose', level: 'foundations', ord: 20, title: 'Stages of an oral dose',
    build: function(api){
      var D = 100, S = IX.state('why2', { fa: 0.9, fg: 0.8, fh: 0.6, sel: 'dis', f: 'all' }), hov = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:10px', '<svg class="dg" viewBox="0 0 884 334" style="width:884px;height:334px;display:block"></svg><div class="dt" style="margin-top:8px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"></div>');
      var c1 = api.addControl(IX.slider('fa', 'Fa', 0, 1, 0.01, S.fa)), c2 = api.addControl(IX.slider('fg', 'Fg', 0, 1, 0.01, S.fg)), c3 = api.addControl(IX.slider('fh', 'Fh', 0, 1, 0.01, S.fh)), c4 = api.addControl('Highlight <select class="flt"><option value="all">All stages</option><option value="A">Absorption</option><option value="D">Distribution</option><option value="M">Metabolism</option><option value="E">Excretion</option></select>');
      var NODES = [{ k: 'dose', x: 8, y: 24 }, { k: 'dis', x: 192, y: 24 }, { k: 'perm', x: 376, y: 24 }, { k: 'gutm', x: 560, y: 24 }, { k: 'liver', x: 744, y: 24 }, { k: 'blood', x: 744, y: 170 }, { k: 'tissue', x: 560, y: 170 }, { k: 'kidney', x: 744, y: 250 }];
      function meta(k){ var m = PATHN.filter(function(n){ return n.k === k; })[0]; return m || { label: 'Oral dose', letter: '', what: 'Administered amount.', assay: '', qty: '', where: '' }; }
      function amounts(){ var a1 = D * S.fa, a2 = a1 * S.fg, a3 = a2 * S.fh; return { dose: D, abs: a1, gut: a2, sys: a3, lost: [D - a1, a1 - a2, a2 - a3] }; }
      IX.tools(api, { csv: function(){ var A = amounts(); return IX.csv([['Stage', 'Amount reaching the stage (mg)'], ['Dose', A.dose], ['Gut wall', A.abs], ['Liver', A.gut], ['Systemic circulation', A.sys], [], ['Loss', 'Amount (mg)'], ['Not absorbed', A.lost[0]], ['Gut-wall metabolism', A.lost[1]], ['Hepatic first pass', A.lost[2]]]); }, name: 'oral-dose-stages' });
      function draw(){
        var A = amounts(), W = 118, H = 48, svg = '<defs><marker id="wa" markerUnits="userSpaceOnUse" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#34373F"/></marker><marker id="wr" markerUnits="userSpaceOnUse" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#B4561B"/></marker></defs>';
        qs('.fav', c1).textContent = S.fa.toFixed(2); qs('.fgv', c2).textContent = S.fg.toFixed(2); qs('.fhv', c3).textContent = S.fh.toFixed(2);
        function ln(x1, y1, x2, y2, amt, red, both){ var w = 1.5 + 8 * (amt / D); return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (red ? '#B4561B' : '#34373F') + '" stroke-width="' + w.toFixed(1) + '" marker-end="url(#' + (red ? 'wr' : 'wa') + ')"' + (both ? ' marker-start="url(#wa)"' : '') + ' opacity="0.85"/>'; }
        function tx(x, y, t, col, anc){ return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anc || 'middle') + '" font-size="12" font-weight="700" fill="' + (col || '#34373F') + '">' + t + '</text>'; }
        var my = 24 + H / 2, gap = 184 - W;
        [[0, D], [1, D], [2, A.abs], [3, A.gut]].forEach(function(e){ var x1 = 8 + e[0] * 184 + W, x2 = x1 + gap; svg += ln(x1, my, x2, my, e[1], false) + tx((x1 + x2) / 2, my - 11, e[1].toFixed(0) + ' mg'); });
        svg += ln(836, 24 + H, 836, 170, A.sys, false) + tx(826, 142, A.sys.toFixed(1) + ' mg', '#34373F', 'end');
        svg += ln(678, 194, 744, 194, 6, false, true) + ln(803, 218, 803, 250, 4, false);
        [[435, A.lost[0], 'not absorbed'], [619, A.lost[1], 'gut-wall metabolism'], [775, A.lost[2], 'first pass']].forEach(function(l){ svg += ln(l[0], 24 + H, l[0], 24 + H + 56, Math.max(l[1], 0.001), true) + tx(l[0], 24 + H + 74, l[1].toFixed(1) + ' mg', '#B4561B') + tx(l[0], 24 + H + 90, l[2], '#B4561B'); });
        NODES.forEach(function(n){ var m = meta(n.k), on = S.sel === n.k, dim = S.f !== 'all' && (m.letter || '').indexOf(S.f) < 0 && n.k !== 'dose'; svg += '<g data-k="' + n.k + '" style="cursor:pointer" opacity="' + (dim ? 0.25 : 1) + '"><rect x="' + n.x + '" y="' + n.y + '" width="' + W + '" height="' + H + '" rx="6" fill="' + (on ? '#E6F3F7' : '#FFFFFF') + '" stroke="' + (on || hov === n.k ? '#0F6E8C' : '#34373F') + '" stroke-width="' + (on || hov === n.k ? 3 : 1.4) + '"/><text x="' + (n.x + W / 2) + '" y="' + (n.y + 21) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#34373F">' + (n.k === 'dose' ? 'Dose' : m.label) + '</text><text x="' + (n.x + W / 2) + '" y="' + (n.y + 38) + '" text-anchor="middle" font-size="11" fill="#6F8196">' + (n.k === 'dose' ? '100 mg oral' : m.letter) + '</text></g>'; });
        svg += '<text x="8" y="326" font-size="12" fill="#6F8196">Arrow width is proportional to the amount. Red arrows are losses.</text>';
        qs('.dg', pn).innerHTML = svg;
        var cur = meta(S.sel);
        qs('.dt', pn).innerHTML = '<div style="grid-column:1/-1;border:1px solid ' + C.silver + ';border-radius:8px;padding:8px 12px;background:#fff;font-size:13px;line-height:1.5"><b>' + cur.label + ' (' + (cur.letter || '') + ').</b> ' + cur.what + '</div>' + [['Assay', cur.assay], ['Parameter', cur.qty], ['Course location', cur.where], ['F (Fa x Fg x Fh)', (S.fa * S.fg * S.fh).toFixed(3) + ', ' + A.sys.toFixed(1) + ' mg of ' + D + ' mg']].map(function(t){ return '<div style="border:1px solid ' + C.silver + ';border-radius:8px;padding:6px 12px;background:#fff"><div class="ol" style="margin-bottom:1px">' + t[0] + '</div><div style="font-size:13px;font-weight:600">' + t[1] + '</div></div>'; }).join('');
        qsa('[data-k]', pn).forEach(function(g){ g.addEventListener('click', function(){ S.sel = g.dataset.k; IX.save('why2', S); draw(); }); g.addEventListener('pointerenter', function(){ hov = g.dataset.k; var r = g.querySelector('rect'); r.setAttribute('stroke', '#0F6E8C'); r.setAttribute('stroke-width', 3); }); g.addEventListener('pointerleave', function(){ hov = null; var on = S.sel === g.dataset.k; var r = g.querySelector('rect'); r.setAttribute('stroke', on ? '#0F6E8C' : '#34373F'); r.setAttribute('stroke-width', on ? 3 : 1.4); }); });
        api.stat('F = ' + (S.fa * S.fg * S.fh).toFixed(3) + ', ' + A.sys.toFixed(1) + ' mg reach the circulation');
      }
      ['fa', 'fg', 'fh'].forEach(function(k, i){ qs('.' + k, [c1, c2, c3][i]).addEventListener('input', function(){ S[k] = +this.value; IX.save('why2', S); draw(); }); });
      qs('.flt', c4).addEventListener('change', function(){ S.f = this.value; IX.save('why2', S); draw(); });
      qs('.flt', c4).value = S.f;
      return { render: draw };
    } });

  /* ===== step 3: measures of exposure ===== */
  WHY.add({ short: 'Exposure measures', level: 'foundations', ord: 30, title: 'Measures of exposure',
    build: function(api){
      var V = 60, D = 100, T = 24, S = IX.state('why3', { f: 0.6, c: 8, a: 1.2, m: 'cmax', tau: 12, tend: 12, t1: 8 }), pin = null, hv = null, M = null;
      var pn = api.el('pn', 'left:28px;top:16px;width:640px;height:508px;padding:8px', '<canvas width="624" height="490" style="width:624px;height:490px"></canvas>'), cvs = qs('canvas', pn);
      var side = api.el('pn', 'left:684px;top:16px;width:248px;height:508px;overflow:auto', '<div class="tl"></div>');
      var c1 = api.addControl('Measure <select class="m"><option value="cmax">Cmax</option><option value="tmax">tmax</option><option value="auc">AUC</option><option value="half">Half-life</option><option value="trough">Trough</option></select>'), c2 = api.addControl(IX.slider('f', 'F', 0.05, 1, 0.01, S.f)), c3 = api.addControl(IX.slider('a', 'ka', 0.2, 4, 0.1, S.a, '1/h')), c4 = api.addControl(IX.slider('c', 'CL', 2, 30, 1, S.c, 'L/h'));
      function prof(P){ var ke = P.c / V, kaa = Math.abs(P.a - ke) < 1e-3 ? P.a + 0.01 : P.a; return function(t){ return P.f * D * kaa / (V * (kaa - ke)) * (Math.exp(-ke * t) - Math.exp(-kaa * t)); }; }
      function stats(P){ var f = prof(P), cmax = 0, tmax = 0, i, t, c, auc = 0, prev = 0, ke = P.c / V, kaa = Math.abs(P.a - ke) < 1e-3 ? P.a + 0.01 : P.a; for (i = 0; i <= 480; i++) { t = T * i / 480; c = f(t); if (c > cmax) { cmax = c; tmax = t; } } return { f: f, cmax: cmax, tmax: tmax, aucInf: P.f * D / P.c, th: 0.693 / Math.min(ke, kaa) }; }
      function aucTo(f, t){ var n = 240, s = 0, prev = 0, i, c; for (i = 1; i <= n; i++) { c = f(t * i / n); s += (c + prev) / 2 * (t / n); prev = c; } return s; }
      function sync(){ qs('.m', c1).value = S.m; qs('.f', c2).value = S.f; qs('.a', c3).value = S.a; qs('.c', c4).value = S.c; }
      IX.tools(api, {
        pin: function(){ pin = { f: S.f, c: S.c, a: S.a }; draw(); }, clear: function(){ pin = null; draw(); }, canvases: function(){ return [cvs]; }, name: 'exposure-measures',
        csv: function(){ var f = prof(S), g = pin ? prof(pin) : null, rows = [[ 't (h)', 'C (mg/L)' ].concat(g ? ['C pinned (mg/L)'] : [])], i; for (i = 0; i <= 240; i++) { var t = T * i / 240; rows.push([t, f(t)].concat(g ? [g(t)] : [])); } return IX.csv(rows); }
      });
      function draw(){
        qs('.fv', c2).textContent = S.f.toFixed(2); qs('.av', c3).textContent = S.a.toFixed(1); qs('.cv', c4).textContent = S.c;
        var st = stats(S), ps = pin ? stats(pin) : null, ymax = Math.max(st.cmax, ps ? ps.cmax : 0) * 1.15, f = st.f;
        M = IX.chart(cvs, { xr: [0, T], yr: [0, ymax], xl: 'Time (h)', yl: 'Plasma concentration (mg/L)', series: [{ fn: f, color: C.red, w: 2.6 }], pinned: pin ? [{ fn: ps.f, color: GREY, w: 1.8, dash: [5, 4] }] : [] });
        var x = M.x; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left';
        if (S.m === 'cmax') { IX.hline(M, M.sy(st.cmax)); IX.dot(M, M.sx(st.tmax), M.sy(st.cmax), 6, C.char); x.fillText('Cmax ' + st.cmax.toFixed(2) + ' mg/L', M.sx(st.tmax) + 10, M.sy(st.cmax) - 8); }
        if (S.m === 'tmax') { IX.vline(M, M.sx(st.tmax)); IX.dot(M, M.sx(st.tmax), M.box.b, 6, C.char); x.fillText('tmax ' + st.tmax.toFixed(1) + ' h', M.sx(st.tmax) + 10, M.box.b - 10); }
        if (S.m === 'auc') { x.fillStyle = 'rgba(15,110,140,.20)'; x.beginPath(); x.moveTo(M.sx(0), M.box.b); for (var i = 0; i <= 120; i++) { var tt = S.tend * i / 120; x.lineTo(M.sx(tt), M.sy(f(tt))); } x.lineTo(M.sx(S.tend), M.box.b); x.closePath(); x.fill(); IX.vline(M, M.sx(S.tend), C.char); IX.dot(M, M.sx(S.tend), M.sy(f(S.tend)), 6, C.char); x.fillStyle = C.char; var pa = aucTo(f, S.tend); x.fillText('AUC(0 to ' + S.tend.toFixed(1) + ' h) = ' + pa.toFixed(1) + ' mg x h/L (' + (100 * pa / st.aucInf).toFixed(0) + '% of AUC(0 to infinity))', M.box.l + 10, M.box.t + 38); }
        if (S.m === 'half') { var t1 = cl(S.t1, 0, T - st.th), c1v = f(t1), c2v = f(t1 + st.th); [[t1, c1v], [t1 + st.th, c2v]].forEach(function(p){ IX.hline(M, M.sy(p[1])); IX.dot(M, M.sx(p[0]), M.sy(p[1]), 5, C.char); }); x.fillText('t1/2 = ' + st.th.toFixed(1) + ' h: ' + c1v.toFixed(2) + ' to ' + c2v.toFixed(2) + ' mg/L (drag the first point)', M.box.l + 10, M.box.t + 38); }
        if (S.m === 'trough') { var ct = f(S.tau); IX.vline(M, M.sx(S.tau)); IX.dot(M, M.sx(S.tau), M.sy(ct), 6, C.char); x.fillText('C(' + S.tau.toFixed(1) + ' h) = ' + ct.toFixed(2) + ' mg/L (drag the line)', M.sx(S.tau) + 10, M.sy(ct) - 10); }
        if (hv !== null) { var ch = f(hv); IX.vline(M, M.sx(hv), C.mid, [2, 3]); IX.dot(M, M.sx(hv), M.sy(ch), 4.5, C.mid); IX.tip(M, M.sx(hv), M.sy(ch), ['t = ' + hv.toFixed(1) + ' h', 'C = ' + ch.toFixed(2) + ' mg/L', 'AUC(0 to t) = ' + aucTo(f, hv).toFixed(1)]); }
        var cmp = ps ? '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px"><tr style="text-align:left;color:' + C.mid + '"><th>Measure</th><th>Pinned</th><th>Now</th><th>Ratio</th></tr>' + [['Cmax', ps.cmax, st.cmax], ['tmax', ps.tmax, st.tmax], ['AUC', ps.aucInf, st.aucInf], ['t1/2', ps.th, st.th]].map(function(r){ return '<tr><td>' + r[0] + '</td><td>' + r[1].toFixed(2) + '</td><td>' + r[2].toFixed(2) + '</td><td>' + (r[2] / r[1]).toFixed(2) + '</td></tr>'; }).join('') + '</table>' : '';
        qs('.tl', side).innerHTML = fTile('AUC, 0 to infinity', st.aucInf.toFixed(1), 'mg x h/L = F x dose / CL') + fRows([['Cmax', st.cmax.toFixed(2) + ' mg/L'], ['tmax', st.tmax.toFixed(1) + ' h'], ['AUC, 0 to 24 h', aucTo(f, T).toFixed(1) + ' mg x h/L'], ['Terminal half-life', st.th.toFixed(1) + ' h'], ['Concentration at ' + S.tau.toFixed(0) + ' h', f(S.tau).toFixed(2) + ' mg/L']]) + cmp + '<div class="hint" style="font-size:11.5px;margin-top:8px">Hover for values. Click the peak to select Cmax.</div>';
        api.stat('Cmax ' + st.cmax.toFixed(2) + ' mg/L at ' + st.tmax.toFixed(1) + ' h');
      }
      function handle(){ var st = stats(S), f = st.f; if (S.m === 'auc') return { t: S.tend, py: M.sy(f(S.tend)), key: 'tend' }; if (S.m === 'trough') return { t: S.tau, py: M.sy(f(S.tau)), key: 'tau' }; if (S.m === 'half') return { t: cl(S.t1, 0, T - st.th), py: M.sy(f(cl(S.t1, 0, T - st.th))), key: 't1' }; return null; }
      qs('.m', c1).addEventListener('change', function(){ S.m = this.value; IX.save('why3', S); draw(); });
      qs('.f', c2).addEventListener('input', function(){ S.f = +this.value; IX.save('why3', S); draw(); });
      qs('.a', c3).addEventListener('input', function(){ S.a = +this.value; IX.save('why3', S); draw(); });
      qs('.c', c4).addEventListener('input', function(){ S.c = +this.value; IX.save('why3', S); draw(); });
      IX.attach(cvs, {
        move: function(p){ if (!M || !M.inside(p)) { hv = null; cvs.style.cursor = 'default'; draw(); return; } hv = cl(M.ix(p.x), 0, T); var h = handle(), st = stats(S); cvs.style.cursor = (h && near(p.x, M.sx(h.t), 9)) ? 'ew-resize' : (Math.hypot(p.x - M.sx(st.tmax), p.y - M.sy(st.cmax)) < 10 ? 'pointer' : 'crosshair'); draw(); },
        leave: function(){ hv = null; draw(); },
        down: function(p){ var h = handle(); return (h && M && near(p.x, M.sx(h.t), 10) && p.y >= M.box.t && p.y <= M.box.b) ? { k: h.key } : null; },
        drag: function(d, p){ var t = cl(M.ix(p.x), 0, T); if (d.k === 'tend') S.tend = Math.max(0.2, t); else if (d.k === 'tau') S.tau = t; else S.t1 = t; draw(); },
        up: function(){ IX.save('why3', S); },
        click: function(p){ var st = stats(S); if (M && Math.hypot(p.x - M.sx(st.tmax), p.y - M.sy(st.cmax)) < 12) { S.m = 'cmax'; sync(); IX.save('why3', S); draw(); } }
      });
      sync();
      return { render: draw };
    } });
})();
