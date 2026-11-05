"use strict";
/* A worked single-drug step in tab 06 and the first step of tab 08: one worked example, with every quantity shown, before any scoreboard. */

/* ---------- tab 06: from assay to clearance for one drug ---------- */
VITRO.add({ short: 'From assay to clearance', level: 'foundations', ord: 20, title: 'From assay to clearance',
  build: function(api){
    var cur = 'Verapamil', model = 'pt', shown = 1, Q = HQ;
    var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:14px', '<div class="grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px"></div><div class="say" style="margin-top:14px;font-size:13.5px;line-height:1.5"></div>');
    var c1 = api.addControl('Drug <select class="d">' + hepOpts(OBACH99.map(function(d){ return [d.name, d.name]; }), cur) + '</select>'), c2 = api.addControl('Model <select class="m">' + hepOpts([['ws', 'Well-stirred'], ['pt', 'Parallel-tube']], model) + '</select>'), c3 = api.addControl('<button type="button" class="btn sm nx">Next</button> <button type="button" class="btn sm ghost rs">Show all</button> <button type="button" class="btn sm ghost rt">Reset</button>');
    function draw(){
      var d = OBACH99.filter(function(z){ return z.name === cur; })[0], fub = d.fup / d.bp, cl = fub * d.clint / d.fum, pred = model === 'pt' ? mPT(Q, cl) : mWS(Q, cl), fe = pred / d.obs;
      var st = [
        ['1. Scaled CLint', 'from the microsomal assay', hfx(d.clint) + ' mL/min/kg'],
        ['2. fu(blood)', 'fu plasma / B:P = ' + d.fup + ' / ' + d.bp, fub.toFixed(3)],
        ['3. fu(mic)', 'unbound fraction in the incubation', String(d.fum)],
        ['4. Corrected CLint', 'fu(blood) x CLint / fu(mic) = ' + fub.toFixed(3) + ' x ' + hfx(d.clint) + ' / ' + d.fum, hfx(cl) + ' mL/min/kg'],
        ['5. Predicted blood CL', model === 'pt' ? 'Q x (1 - exp(-CL / Q)), Q = ' + Q : 'Q x CL / (Q + CL), Q = ' + Q, hfx(pred) + ' mL/min/kg'],
        ['6. Observed blood CL', 'intravenous studies', hfx(d.obs) + ' mL/min/kg']];
      qs('.grid', pn).innerHTML = st.map(function(s, i){ var on = i < shown; return '<div style="border:1px solid ' + (i === shown - 1 ? C.red : C.silver) + ';border-radius:8px;padding:14px 16px;background:#fff;opacity:' + (on ? 1 : 0.18) + ';transition:opacity .3s"><div class="ol" style="margin-bottom:4px">' + s[0] + '</div><div style="font-size:12px;color:' + C.mid + ';min-height:34px">' + s[1] + '</div><div style="font-size:22px;font-weight:700;margin-top:6px;color:' + (i === 5 ? C.dred : C.char) + '">' + (on ? s[2] : '') + '</div></div>'; }).join('');
      var msg = shown < 6 ? 'Stage ' + shown + ' of 6.' : 'The predicted clearance is ' + hfx(pred) + ' mL/min/kg and the observed value is ' + hfx(d.obs) + ' mL/min/kg. The prediction is ' + (fe >= 1 ? fe.toFixed(1) + '-fold above' : (1 / fe).toFixed(1) + '-fold below') + ' the observation, and ' + ((fe >= 0.5 && fe <= 2) ? 'within' : 'outside') + ' 2-fold.';
      qs('.say', pn).innerHTML = msg; api.stat(cur + ', ' + (model === 'pt' ? 'parallel-tube' : 'well-stirred'));
    }
    qs('.d', c1).addEventListener('change', function(){ cur = this.value; shown = 1; draw(); });
    qs('.m', c2).addEventListener('change', function(){ model = this.value; draw(); });
    qs('.nx', c3).addEventListener('click', function(){ shown = Math.min(6, shown + 1); draw(); });
    qs('.rs', c3).addEventListener('click', function(){ shown = 6; draw(); });
    qs('.rt', c3).addEventListener('click', function(){ shown = 1; draw(); });
    return { render: draw };
  } });

/* ---------- tab 08: what volume of distribution measures ---------- */
DIS.add({ short: 'What Vss measures', level: 'foundations', ord: 0, title: 'What volume of distribution measures',
  build: function(api){
    var lk = 0, dose = 100, W = 70;
    var pn = api.el('pn', 'left:28px;top:16px;width:904px;height:508px;padding:14px', '<canvas width="876" height="300" style="width:876px;height:300px"></canvas><div class="tm" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:12px"></div>'), cvs = qs('canvas', pn);
    var c1 = api.addControl('Kp <input type="range" class="k" min="-1" max="2" step="0.05" value="' + lk + '" style="width:200px"> <b class="kv"></b>');
    function draw(){
      var Kp = Math.pow(10, lk), Vp = OT.Vp * W, Vt = (OT.Ve + OT.Vr) * W, Vss = Vp + Kp * Vt, Cp = dose / Vss, Ap = Cp * Vp, At = Cp * Kp * Vt;
      qs('.kv', c1).textContent = Kp < 10 ? Kp.toFixed(2) : Kp.toFixed(1);
      var g = cv(cvs), x = g.x, L = 20, R = g.w - 20, T0 = 70, B0 = 150, wp = Ap / dose * (R - L);
      x.font = '600 13px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.char; x.textAlign = 'left'; x.fillText('Where a ' + dose + ' mg dose sits at equilibrium', L, 30);
      x.fillStyle = C.red; x.fillRect(L, T0, wp, B0 - T0); x.fillStyle = C.tint; x.fillRect(L + wp, T0, (R - L) - wp, B0 - T0);
      x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.char; x.textAlign = 'left'; x.fillText('Plasma ' + Ap.toFixed(1) + ' mg (' + (100 * Ap / dose).toFixed(1) + ' percent)', L, T0 - 10); x.textAlign = 'right'; x.fillText('Tissue ' + At.toFixed(1) + ' mg (' + (100 * At / dose).toFixed(1) + ' percent)', R, T0 - 10);
      x.strokeStyle = C.silver; x.lineWidth = 1; [0, 0.25, 0.5, 0.75, 1].forEach(function(v){ x.beginPath(); x.moveTo(L + v * (R - L), B0); x.lineTo(L + v * (R - L), B0 + 6); x.stroke(); x.textAlign = 'center'; x.fillStyle = C.mid; x.fillText(String(Math.round(v * dose)), L + v * (R - L), B0 + 20); });
      x.textAlign = 'center'; x.fillStyle = C.char; x.fillText('Amount of drug (mg)', (L + R) / 2, B0 + 40);
      var bx = L, by = 215, bw = R - L; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText('Volume that the dose appears to fill, on a scale to 400 L', L, by - 10);
      var sc = bw / 400; x.fillStyle = C.red; x.fillRect(L, by, Vp * sc, 34); x.fillStyle = C.tint; x.fillRect(L + Vp * sc, by, Math.min(Kp * Vt * sc, bw - Vp * sc), 34); x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.char; x.textAlign = 'left'; x.fillText('Vss = ' + Vss.toFixed(0) + ' L', L, by + 54); x.strokeStyle = C.char; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(L + 40.2 * sc, by - 4); x.lineTo(L + 40.2 * sc, by + 40); x.stroke(); x.setLineDash([]); x.fillStyle = C.mid; x.fillText('body water, 40 L', L + 40.2 * sc + 6, by + 54);
      qs('.tm', pn).innerHTML = [['Vss', Vss.toFixed(0) + ' L'], ['Vss per kg', (Vss / W).toFixed(2) + ' L/kg'], ['Plasma concentration', Cp.toFixed(3) + ' mg/L'], ['Tissue concentration', (Cp * Kp).toFixed(3) + ' mg/L']].map(function(t){ return '<div class="score"><b>' + t[0] + '</b><div class="v" style="font-size:1.4rem">' + t[1] + '</div></div>'; }).join('');
      api.stat('Vss ' + Vss.toFixed(0) + ' L (' + (Vss / W).toFixed(2) + ' L/kg)');
    }
    qs('.k', c1).addEventListener('input', function(){ lk = +this.value; draw(); });
    return { render: draw };
  } });
