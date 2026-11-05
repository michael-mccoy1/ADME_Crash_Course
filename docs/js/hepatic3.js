"use strict";
/* Tab 07, steps 7 and 8: microsomes against hepatocytes, and the extended clearance classification system. Uses the helpers in hepatic.js. */

/* ---------- step 7 ---------- */
HEP.add({ short: 'Microsomes against hepatocytes', level: 'advanced', title: 'Microsomes against hepatocytes',
  change: 'Move the scaling sliders. Select a point to read its two measurements.',
  watch: 'Each point is a compound measured in both human liver microsomes and human hepatocytes in the AstraZeneca data set deposited in ChEMBL. The microsomal value (uL/min/mg) is scaled with the protein content per g of liver and the hepatocyte value (uL/min/10^6 cells) with the hepatocellularity, both with the liver weight per kg. A compound on the dashed line has the same scaled clearance in both systems. Compounds above the line clear faster in hepatocytes. The plot shows the ratio and not its cause. Differences can reflect enzymes that a NADPH-supplemented microsomal incubation does not cover, uptake into the cell, binding, and the choice of scalars, which are the sliders here. Only compounds with uncensored values in both assays are shown, 96 of the 187 that have both. With 45 mg/g, 120 x 10^6 cells/g and 20 g/kg, 62 of the 96 lie above the line and the median ratio is 1.22. The hepatocellularity is an assumed value and the slider shows how much the result depends on it.',
  build: function(api){
    var mp = 45, hp = 120, lw = 20, sel = null;
    var pn = api.el('pn', 'left:28px;top:16px;width:600px;height:508px;padding:8px', '<canvas width="584" height="470" style="width:584px;height:470px;cursor:pointer"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:644px;top:16px;width:288px;height:508px;overflow:auto', '<div class="tl"></div><div class="det" style="margin-top:6px"></div>');
    var c1 = api.addControl('MPPGL <input type="range" class="mp" min="20" max="80" step="1" value="' + mp + '" style="width:110px"> <b class="mpv">' + mp + '</b> mg/g'), c2 = api.addControl('Hepatocellularity <input type="range" class="hp" min="60" max="200" step="5" value="' + hp + '" style="width:110px"> <b class="hpv">' + hp + '</b> 10^6 cells/g'), c3 = api.addControl('Liver weight <input type="range" class="lw" min="15" max="35" step="0.5" value="' + lw + '" style="width:110px"> <b class="lwv">' + lw + '</b> g/kg');
    function draw(){
      var rows = AZCL.map(function(z){ return { z: z, a: z.hlm * mp * lw / 1000, b: z.hep * hp * lw / 1000 }; });
      var g = cv(cvs), box = { l: 56, r: g.w - 14, t: 14, b: g.h - 42 }, x = g.x, lo = -1, hi = 3;
      var A = logAxes(g, box, lo, hi, 'Scaled microsomal CLint (mL/min/kg)', 'Scaled hepatocyte CLint (mL/min/kg)', lo, hi, [0.1, 1, 10, 100, 1000], [0.1, 1, 10, 100, 1000]);
      x.fillStyle = 'rgba(15,110,140,.09)'; x.beginPath(); x.moveTo(A.sx(0.1), A.sy(0.2)); x.lineTo(A.sx(1000), A.sy(2000)); x.lineTo(A.sx(1000), A.sy(500)); x.lineTo(A.sx(0.1), A.sy(0.05)); x.closePath(); x.fill();
      x.strokeStyle = C.mid; x.lineWidth = 1.2; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(A.sx(0.1), A.sy(0.1)); x.lineTo(A.sx(1000), A.sy(1000)); x.stroke(); x.setLineDash([]);
      var pts = [], above = 0, w2 = 0, lr = [];
      rows.forEach(function(r){
        var px = A.sx(Math.min(Math.max(r.a, 0.1001), 999)), py = A.sy(Math.min(Math.max(r.b, 0.1001), 999)), on = sel && sel.id === r.z.id, l = Math.log10(r.b / r.a); lr.push(l); if (l > 0) above++; if (Math.abs(l) <= Math.log10(2)) w2++;
        x.fillStyle = r.z.name ? C.dred : C.red; x.globalAlpha = on ? 1 : 0.7; x.beginPath(); x.arc(px, py, on ? 7 : 4.5, 0, 6.3); x.fill(); x.globalAlpha = 1; if (on) { x.strokeStyle = C.char; x.lineWidth = 2; x.stroke(); }
        pts.push({ x: px, y: py, r: { d: r.z, row: r } });
      });
      cvs._pts = pts; cvs._g = g;
      lr.sort(function(p, q){ return p - q; }); var med = Math.pow(10, lr[Math.floor(lr.length / 2)]);
      qs('.tl', side).innerHTML = '<div class="score" style="margin-bottom:8px"><b>Hepatocyte above microsomes</b><div class="v">' + above + ' of ' + rows.length + '</div><div class="s">' + Math.round(100 * above / rows.length) + ' percent of compounds</div></div><div class="score" style="margin-bottom:8px"><b>Within 2-fold of each other</b><div class="v">' + w2 + ' of ' + rows.length + '</div><div class="s">median ratio, hepatocyte over microsomes: ' + med.toFixed(2) + '</div></div>';
      var s = sel && rows.filter(function(r){ return r.z.id === sel.id; })[0];
      qs('.det', side).innerHTML = !s ? '<div class="hint" style="font-size:12px">Select a point. Dark points have a name in ChEMBL.</div>' : '<div style="font-weight:700;font-size:14px;margin-bottom:4px">' + (s.z.name || s.z.id) + '</div>' + [['ChEMBL id', s.z.id], ['Microsomal CLint', s.z.hlm + ' uL/min/mg'], ['Hepatocyte CLint', s.z.hep + ' uL/min/10^6 cells'], ['Scaled, microsomes', hfx(s.a) + ' mL/min/kg'], ['Scaled, hepatocytes', hfx(s.b) + ' mL/min/kg'], ['Ratio', (s.b / s.a).toFixed(2)]].map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:6px;border-top:1px solid ' + C.silver + ';padding:3px 0;font-size:12px"><span>' + t[0] + '</span><b>' + t[1] + '</b></div>'; }).join('');
      api.stat(above + ' of ' + rows.length + ' compounds clear faster in hepatocytes');
    }
    qs('.mp', c1).addEventListener('input', function(){ mp = +this.value; qs('.mpv', c1).textContent = mp; draw(); }); qs('.hp', c2).addEventListener('input', function(){ hp = +this.value; qs('.hpv', c2).textContent = hp; draw(); }); qs('.lw', c3).addEventListener('input', function(){ lw = +this.value; qs('.lwv', c3).textContent = lw; draw(); });
    cvs.addEventListener('click', function(ev){ var r = hepHit(cvs, ev); sel = r ? r.d : null; draw(); });
    return { render: draw };
  } });

/* ---------- step 8 ---------- */
function eccsClass(acid, mw, papp){
  var hi = papp >= 5;
  if (acid) return hi ? (mw <= 400 ? '1A' : '1B') : (mw <= 400 ? '3A' : '3B');
  return hi ? '2' : '4';
}
var ECCS = {
  '1A': ['Metabolism', 'High-permeability acids and zwitterions, MW 400 Da or below.', true],
  '1B': ['Transporter-mediated hepatic uptake', 'High-permeability acids and zwitterions, MW above 400 Da.', false],
  '2': ['Metabolism', 'High-permeability bases and neutrals.', true],
  '3A': ['Renal clearance', 'Low-permeability acids and zwitterions, MW 400 Da or below.', false],
  '3B': ['Hepatic uptake or renal clearance', 'Low-permeability acids and zwitterions, MW above 400 Da.', false],
  '4': ['Renal clearance', 'Low-permeability bases and neutrals.', false]
};
HEP.add({ short: 'Choosing a method by class', level: 'advanced', title: 'Choosing a method by class',
  change: 'Select a point on the map or use the sliders. Switch between acids or zwitterions and bases or neutrals.',
  watch: 'The extended clearance classification system (ECCS; Varma et al., 2015) assigns a compound to a class from its ionization at pH 7, its molecular weight and its passive permeability, and predicts the rate-determining clearance mechanism. The permeability cut-off is an apparent permeability of 5 x 10^-6 cm/s in a low-efflux MDCK cell line, and the molecular weight cut-off for acids and zwitterions is 400 Da. The authors report that the scheme gave the correct mechanism for about 92 percent of 307 compounds with a single mechanism contributing 70 percent or more of systemic clearance. The microsomal scaling in steps 1 to 4 measures metabolism. It applies to the metabolism classes, 1A and 2, and not to the uptake and renal classes.',
  build: function(api){
    var acid = true, mw = 350, papp = 10, ppb = 95;
    var pn = api.el('pn', 'left:28px;top:16px;width:520px;height:508px;padding:8px', '<canvas width="504" height="490" style="width:504px;height:490px;cursor:crosshair"></canvas>'), cvs = qs('canvas', pn);
    var side = api.el('pn', 'left:564px;top:16px;width:368px;height:508px;overflow:auto', '<div class="out"></div>');
    var c1 = api.addControl('Ionization at pH 7 <select class="io">' + hepOpts([['a', 'Acid or zwitterion'], ['b', 'Base or neutral']], 'a') + '</select>'), c2 = api.addControl('MW <input type="range" class="mw" min="150" max="800" step="10" value="' + mw + '" style="width:130px"> <b class="mwv">' + mw + '</b> Da'), c3 = api.addControl('Papp <input type="range" class="pp" min="-1" max="2" step="0.05" value="' + Math.log10(papp) + '" style="width:130px"> <b class="ppv"></b>'), c4 = api.addControl('Plasma protein binding <input type="range" class="pb" min="50" max="99.9" step="0.5" value="' + ppb + '" style="width:110px"> <b class="pbv">' + ppb + '</b> percent');
    var COL = { '1A': '#0F6E8C', '1B': '#0A4A5E', '2': '#4C93AC', '3A': '#B4561B', '3B': '#8A3F10', '4': '#C98A5B' };
    var BX = { l: 56, r: 490, t: 14, b: 448 };
    function draw(){
      var cl = eccsClass(acid, mw, papp), info = ECCS[cl];
      var g = cv(cvs), box = BX, x = g.x, lo = -1, hi = 2, mlo = 150, mhi = 800;
      var sx = function(p){ return box.l + (Math.log10(p) - lo) / (hi - lo) * (box.r - box.l); }, sy = function(m){ return box.b - (m - mlo) / (mhi - mlo) * (box.b - box.t); };
      function fillR(c, x0, x1, y0, y1){ x.fillStyle = COL[c]; x.globalAlpha = c === cl ? 0.55 : 0.2; x.fillRect(x0, y1, x1 - x0, y0 - y1); x.globalAlpha = 1; x.fillStyle = C.char; x.font = '600 14px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText('Class ' + c, (x0 + x1) / 2, (y0 + y1) / 2 + 5); }
      if (acid) { fillR('3A', sx(0.1), sx(5), sy(150), sy(400)); fillR('3B', sx(0.1), sx(5), sy(400), sy(800)); fillR('1A', sx(5), sx(100), sy(150), sy(400)); fillR('1B', sx(5), sx(100), sy(400), sy(800)); }
      else { fillR('4', sx(0.1), sx(5), sy(150), sy(800)); fillR('2', sx(5), sx(100), sy(150), sy(800)); }
      x.font = '12px Aptos, "Segoe UI", sans-serif'; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'center'; [0.1, 1, 10, 100].forEach(function(v){ x.fillText(String(v), sx(v), box.b + 16); }); x.textAlign = 'right'; [200, 400, 600, 800].forEach(function(v){ x.fillText(String(v), box.l - 6, sy(v) + 4); });
      x.strokeStyle = C.char; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(sx(5), box.t); x.lineTo(sx(5), box.b); x.stroke(); if (acid) { x.beginPath(); x.moveTo(box.l, sy(400)); x.lineTo(box.r, sy(400)); x.stroke(); } x.setLineDash([]);
      x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText('Apparent permeability (10^-6 cm/s)', (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText('Molecular weight (Da)', 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
      x.fillStyle = C.char; x.beginPath(); x.arc(sx(papp), sy(mw), 7, 0, 6.3); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke();
      var ref = '';
      if (cl === '1B' || cl === '3B') ref = '<div style="border-top:1px solid ' + C.silver + ';margin-top:10px;padding-top:8px;font-size:12.5px"><b>Plasma protein binding refinement</b> (ECCS refinement, 2022): for acids and zwitterions above 400 Da, binding of 90 percent or more points to hepatic uptake and binding below 90 percent to renal clearance. At ' + ppb + ' percent: <b>' + (ppb >= 90 ? 'hepatic uptake' : 'renal clearance') + '</b>.</div>';
      qs('.out', side).innerHTML = '<div class="score" style="margin-bottom:10px"><b>ECCS class</b><div class="v">' + cl + '</div><div class="s">' + info[1] + '</div></div><div style="font-size:13px"><b>Predicted rate-determining mechanism:</b> ' + info[0] + '.</div><div style="font-size:13px;margin-top:8px"><b>Microsomal scaling (steps 1 to 4):</b> ' + (info[2] ? 'applies. This is a metabolism class.' : 'does not measure this mechanism. A microsomal incubation does not include it.') + '</div>' + ref + '<div class="hint" style="font-size:12px;margin-top:12px">Source: Varma et al., Pharm Res 32:3785 (2015). Cut-offs: permeability 5 x 10^-6 cm/s, MW 400 Da, ionization at pH 7.</div>';
      qs('.ppv', c3).textContent = papp.toFixed(papp < 10 ? 2 : 1) + ' x 10^-6 cm/s'; api.stat('Class ' + cl + ': ' + info[0]);
    }
    qs('.io', c1).addEventListener('change', function(){ acid = this.value === 'a'; draw(); }); qs('.mw', c2).addEventListener('input', function(){ mw = +this.value; qs('.mwv', c2).textContent = mw; draw(); }); qs('.pp', c3).addEventListener('input', function(){ papp = Math.pow(10, +this.value); draw(); }); qs('.pb', c4).addEventListener('input', function(){ ppb = +this.value; qs('.pbv', c4).textContent = ppb; draw(); });
    cvs.addEventListener('click', function(ev){ var rc = cvs.getBoundingClientRect(), mx = (ev.clientX - rc.left) * 504 / rc.width, my = (ev.clientY - rc.top) * 490 / rc.height; papp = Math.pow(10, clamp(-1 + (mx - BX.l) / (BX.r - BX.l) * 3, -1, 2)); mw = Math.round(clamp(150 + (BX.b - my) / (BX.b - BX.t) * 650, 150, 800) / 10) * 10; qs('.pp', c3).value = Math.log10(papp); qs('.mw', c2).value = mw; qs('.mwv', c2).textContent = mw; draw(); });
    return { render: draw };
  } });
