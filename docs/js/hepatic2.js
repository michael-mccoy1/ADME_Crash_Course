"use strict";
/* Tab 07, steps 5 and 6: empirical scalars and low-turnover compounds. Uses the helpers in hepatic.js. */

/* ---------- step 5 ---------- */
function hepFit(S, o){
  var lo = 0.02, hi = 60, m, i;
  function bias(f){ var s = 0; S.forEach(function(d){ s += Math.log10(hepPredict(d, { model: o.model, bind: 'both', sf: f }) / d.obs); }); return s / S.length; }
  for (i = 0; i < 34; i++) { m = Math.sqrt(lo * hi); if (bias(m) < 0) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
}
function hepHist(g, vals, box, lo, hi, nb, col, alpha, ymax){
  var cnt = new Array(nb).fill(0); vals.forEach(function(v){ var k = Math.floor((Math.log10(v) - lo) / (hi - lo) * nb); if (k < 0) k = 0; if (k >= nb) k = nb - 1; cnt[k]++; });
  var bw = (box.r - box.l) / nb, x = g.x; x.globalAlpha = alpha; x.fillStyle = col;
  cnt.forEach(function(c, k){ var hgt = c / ymax * (box.b - box.t); x.fillRect(box.l + k * bw + 1, box.b - hgt, bw - 2, hgt); }); x.globalAlpha = 1; return cnt;
}
function hepBinMax(vals, lo, hi, nb){ var c = new Array(nb).fill(0); vals.forEach(function(v){ c[Math.max(0, Math.min(nb - 1, Math.floor((Math.log10(v) - lo) / (hi - lo) * nb)))]++; }); return Math.max.apply(null, c); }
function hepQ(a, p){ var s = a.slice().sort(function(x, y){ return x - y; }); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; }
function hepAxisX(g, box, ticks, lo, hi, label, ylabel){
  var x = g.x; x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; x.lineWidth = 1;
  ticks.forEach(function(v){ var xp = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.t); x.lineTo(xp, box.b); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
  x.beginPath(); x.moveTo(box.l, box.b); x.lineTo(box.r, box.b); x.stroke();
  x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(label, (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(12, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(ylabel, 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
}
HEP.add({ short: 'Empirical scalars', level: 'applied', title: 'Empirical scalars',
  build: function(api){
    var o = { model: 'pt' }, n = 10, seed = 1, N = 300;
    var pn = api.el('pn', 'left:28px;top:16px;width:452px;height:508px;padding:8px', '<canvas class="a" width="436" height="430" style="width:436px;height:430px"></canvas><div class="ra" style="font-size:12.5px;margin-top:6px"></div>');
    var pn2 = api.el('pn', 'left:496px;top:16px;width:436px;height:508px;padding:8px', '<canvas class="b" width="420" height="430" style="width:420px;height:430px"></canvas><div class="rb" style="font-size:12.5px;margin-top:6px"></div>');
    var ca = qs('.a', pn), cb = qs('.b', pn2);
    var c1 = api.addControl('Fitting drugs <input type="range" class="n" min="3" max="25" step="1" value="' + n + '" style="width:150px"> <b class="nv">' + n + '</b> of 29'), c2 = api.addControl('Extraction model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], o.model) + '</select>'), c3 = api.addControl('<button type="button" class="btn sm ghost rs">Resample</button>');
    function draw(){
      var r = rng(seed * 7919 + n), fs = [], held = [], heldRaw = [], full = hepFit(OBACH99, o), i, k;
      for (i = 0; i < N; i++) {
        var idx = OBACH99.map(function(_, j){ return j; }); for (k = idx.length - 1; k > 0; k--) { var j2 = Math.floor(r() * (k + 1)), t = idx[k]; idx[k] = idx[j2]; idx[j2] = t; }
        var T = idx.slice(0, n).map(function(j){ return OBACH99[j]; }), H = idx.slice(n).map(function(j){ return OBACH99[j]; }), f = hepFit(T, o); fs.push(f);
        held.push(hepScore(H.map(function(d){ return { d: d, p: hepPredict(d, { model: o.model, bind: 'both', sf: f }) }; })).gmfe); heldRaw.push(hepScore(H.map(function(d){ return { d: d, p: hepPredict(d, { model: o.model, bind: 'both', sf: 1 }) }; })).gmfe);
      }
      var g = cv(ca), box = { l: 40, r: g.w - 12, t: 16, b: g.h - 42 }, x = g.x, lo = Math.log10(0.5), hi = Math.log10(12), nb = 24, ymax = hepBinMax(fs, lo, hi, nb) * 1.15;
      hepAxisX(g, box, [0.5, 1, 2, 4, 8], lo, hi, 'Fitted scalar factor (fitting set)', 'Resamples');
      ca._hist = { lo: lo, hi: hi, box: box, log: true, series: [['Resamples', hepHist(g, fs, box, lo, hi, nb, C.red, 0.85, ymax)]], name: 'Fitted scalar factor' };
      var xf = box.l + (Math.log10(full) - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.char; x.setLineDash([4, 4]); x.lineWidth = 1.4; x.beginPath(); x.moveTo(xf, box.t); x.lineTo(xf, box.b); x.stroke(); x.setLineDash([]);
      qs('.ra', pn).innerHTML = 'Fitting set of <b>' + n + '</b> drugs: median factor <b>' + hepQ(fs, 0.5).toFixed(2) + '</b> (5th to 95th percentile ' + hepQ(fs, 0.05).toFixed(2) + ' to ' + hepQ(fs, 0.95).toFixed(2) + '). Dashed line: all 29 drugs, ' + full.toFixed(2) + '.';
      var g2 = cv(cb), b2 = { l: 40, r: g2.w - 12, t: 16, b: g2.h - 42 }, x2 = g2.x, lo2 = Math.log10(1), hi2 = Math.log10(5), nb2 = 24, ym2 = Math.max(hepBinMax(held, lo2, hi2, nb2), hepBinMax(heldRaw, lo2, hi2, nb2)) * 1.15;
      hepAxisX(g2, b2, [1, 1.5, 2, 3, 4], lo2, hi2, 'Held-out average fold error', 'Resamples');
      var cRaw = hepHist(g2, heldRaw, b2, lo2, hi2, nb2, C.mid, 0.45, ym2), cHeld = hepHist(g2, held, b2, lo2, hi2, nb2, C.red, 0.8, ym2); cb._hist = { lo: lo2, hi: hi2, box: b2, log: true, series: [['With fitted factor', cHeld], ['Factor 1.0', cRaw]], name: 'Held-out average fold error' };
      x2.textAlign = 'left'; x2.font = '600 11px Aptos, "Segoe UI", sans-serif'; x2.fillStyle = C.red; x2.fillRect(b2.r - 150, b2.t + 6, 12, 10); x2.fillStyle = C.char; x2.fillText('With fitted factor', b2.r - 134, b2.t + 15); x2.fillStyle = C.mid; x2.globalAlpha = 0.45; x2.fillRect(b2.r - 150, b2.t + 22, 12, 10); x2.globalAlpha = 1; x2.fillStyle = C.char; x2.fillText('Factor 1.0', b2.r - 134, b2.t + 31); x2.font = '12px Aptos, "Segoe UI", sans-serif';
      qs('.rb', pn2).innerHTML = 'Held-out average fold error, median: <b>' + hepQ(held, 0.5).toFixed(2) + '</b> with the fitted factor (5th to 95th percentile ' + hepQ(held, 0.05).toFixed(2) + ' to ' + hepQ(held, 0.95).toFixed(2) + ') and <b>' + hepQ(heldRaw, 0.5).toFixed(2) + '</b> without it.';
      api.stat(n + ' fitting drugs, ' + N + ' resamples');
    }
    qs('.n', c1).addEventListener('input', function(){ n = +this.value; qs('.nv', c1).textContent = n; draw(); });
    qs('.m', c2).addEventListener('change', function(){ o.model = this.value; draw(); });
    qs('.rs', c3).addEventListener('click', function(){ seed++; draw(); });
    return { render: draw };
  } });

/* ---------- step 6 ---------- */
HEP.add({ short: 'Low-turnover compounds', level: 'applied', title: 'Low-turnover compounds',
  build: function(api){
    var prot = 1, T = 60, cvp = 10, lcl = 1, drug = 'Warfarin', mod = 'pt', bind = 'both';
    var low = OBACH99.filter(function(d){ return d.clint <= 3; });
    var pn = api.el('pn', 'left:28px;top:16px;width:520px;height:508px;padding:8px', '<canvas width="504" height="430" style="width:504px;height:430px"></canvas><div class="ro" style="font-size:12.5px;margin-top:6px"></div>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:564px;top:16px;width:368px;height:508px;overflow:auto', '<h4>Prediction at the detection limit</h4><div class="pd"></div>');
    var c1 = api.addControl('Protein <select class="p">' + hepOpts([['0.1', '0.1 mg/mL'], ['0.25', '0.25 mg/mL'], ['0.5', '0.5 mg/mL'], ['1', '1 mg/mL'], ['2', '2 mg/mL'], ['5', '5 mg/mL'], ['10', '10 mg/mL']], '1') + '</select>'), c2 = api.addControl('Incubation <input type="range" class="t" min="30" max="180" step="10" value="' + T + '" style="width:120px"> <b class="tv">' + T + '</b> min'), c3 = api.addControl('Assay variability <select class="cv">' + hepOpts([['5', '5 percent'], ['10', '10 percent'], ['15', '15 percent'], ['20', '20 percent']], '10') + '</select>'), c4 = api.addControl('CLint <input type="range" class="l" min="-1" max="3" step="0.05" value="' + lcl + '" style="width:130px"> <b class="lv"></b>'), c5 = api.addControl('Drug <select class="d">' + hepOpts(low.map(function(d){ return [d.name, d.name]; }), drug) + '</select>');
    var c6 = api.addControl('Model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], mod) + '</select> <select class="bn">' + hepOpts([['none', 'No binding'], ['both', 'fu(blood) and fu(microsomes)']], bind) + '</select>');
    function draw(){
      var clint = Math.pow(10, lcl), k = clint / 900 * prot, floorK = -Math.log(1 - 2 * cvp / 100) / T, floor = floorK / prot * 900;
      qs('.lv', c4).textContent = hfx(clint) + ' mL/min/kg';
      var g = cv(cvs), box = { l: 52, r: g.w - 14, t: 16, b: g.h - 42 }, x = g.x, TM = 180;
      var sx = function(t){ return box.l + t / TM * (box.r - box.l); }, sy = function(p){ return box.b - p / 110 * (box.b - box.t); };
      x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right'; [0, 25, 50, 75, 100].forEach(function(v){ x.beginPath(); x.moveTo(box.l, sy(v)); x.lineTo(box.r, sy(v)); x.stroke(); x.fillText(String(v), box.l - 6, sy(v) + 4); });
      x.textAlign = 'center'; [0, 30, 60, 90, 120, 150, 180].forEach(function(v){ x.fillText(String(v), sx(v), box.b + 16); });
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText('Time (min)', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Parent remaining (percent of time 0)', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      x.fillStyle = 'rgba(180,86,27,.12)'; x.fillRect(box.l, sy(100), box.r - box.l, sy(100 - 2 * cvp) - sy(100)); x.strokeStyle = C.warn; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(box.l, sy(100 - 2 * cvp)); x.lineTo(box.r, sy(100 - 2 * cvp)); x.stroke(); x.setLineDash([]);
      x.fillStyle = C.warn; x.textAlign = 'right'; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('Loss below twice the assay variability', box.r - 8, sy(100 - 2 * cvp) + 14); x.font = '12px Aptos, "Segoe UI", sans-serif';
      x.strokeStyle = C.red; x.lineWidth = 2.6; x.beginPath(); for (var i = 0; i <= 120; i++) { var t = TM * i / 120, p = 100 * Math.exp(-k * t); i ? x.lineTo(sx(t), sy(p)) : x.moveTo(sx(t), sy(p)); } x.stroke();
      x.strokeStyle = C.char; x.lineWidth = 1.5; x.setLineDash([2, 3]); x.beginPath(); x.moveTo(sx(T), box.t); x.lineTo(sx(T), box.b); x.stroke(); x.setLineDash([]);
      [0, 5, 15, 30, 45, 60, 90, 120, 150, 180].filter(function(t){ return t <= T; }).forEach(function(t){ var p = 100 * Math.exp(-k * t); x.fillStyle = C.char; x.beginPath(); x.arc(sx(t), sy(p), 3.5, 0, 6.3); x.fill(); x.strokeStyle = C.char; x.lineWidth = 1.2; x.beginPath(); x.moveTo(sx(t), sy(p * (1 - cvp / 100))); x.lineTo(sx(t), sy(p * (1 + cvp / 100))); x.stroke(); });
      var lossT = 100 * (1 - Math.exp(-k * T)), meas = lossT > 2 * cvp;
      qs('.ro', pn).innerHTML = 'Loss over ' + T + ' min: <b>' + lossT.toFixed(1) + ' percent</b>. Lowest reportable scaled CLint: <b>' + hfx(floor) + ' mL/min/kg</b>. A CLint of ' + hfx(clint) + ' is <b>' + (meas ? 'reportable' : 'below the limit and reported as a limit') + '</b>.';
      var d = OBACH99.filter(function(z){ return z.name === drug; })[0], cap = { name: d.name, cls: d.cls, fup: d.fup, bp: d.bp, fum: d.fum, obs: d.obs, clint: floor }, pl = hepPredict(cap, { model: mod, bind: bind }), pm = hepPredict(d, { model: mod, bind: bind });
      qs('.pd', side).innerHTML = [['Observed CL', hfx(d.obs) + ' mL/min/kg'], ['Reported CLint (Obach 1999)', (d.name === 'Warfarin' ? 'below ' : '') + hfx(d.clint) + ' mL/min/kg'], ['Limit with current settings', hfx(floor) + ' mL/min/kg'], ['Prediction at the limit (upper bound)', hfx(pl) + ' mL/min/kg'], ['Upper bound against observed', hfold(pl, d.obs)], ['Prediction from the reported CLint', hfx(pm) + ' (' + hfold(pm, d.obs) + ')']].map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:5px 0;font-size:12.5px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join('');
      api.stat('Lowest reportable CLint ' + hfx(floor) + ' mL/min/kg');
    }
    qs('.p', c1).addEventListener('change', function(){ prot = +this.value; draw(); }); qs('.t', c2).addEventListener('input', function(){ T = +this.value; qs('.tv', c2).textContent = T; draw(); }); qs('.cv', c3).addEventListener('change', function(){ cvp = +this.value; draw(); });
    qs('.l', c4).addEventListener('input', function(){ lcl = +this.value; draw(); }); qs('.d', c5).addEventListener('change', function(){ drug = this.value; draw(); });
    qs('.m', c6).addEventListener('change', function(){ mod = this.value; draw(); }); qs('.bn', c6).addEventListener('change', function(){ bind = this.value; draw(); });
    return { render: draw };
  } });
