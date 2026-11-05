"use strict";
/* A worked single-drug step in tab 06 and the first step of tab 08: one worked example, with every quantity shown, before any scoreboard. */

/* ---------- tab 06: from assay to clearance for one drug ---------- */
/* ---------- tab 08: what volume of distribution measures ---------- */
DIS.add({ short: 'What Vss measures', level: 'foundations', ord: 0, title: 'Apparent volume of distribution',
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
