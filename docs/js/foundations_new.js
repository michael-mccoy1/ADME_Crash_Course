"use strict";
/* New foundation steps for tabs 01 to 06. Standard relations; real values from Obach (2008) and Obach (1999).
   Reference volumes for a 70 kg adult use the Oie-Tozer constants (Coutinho et al., 2024): plasma 3.05 L, extracellular fluid 13.6 L, body water 40.2 L. */
(function(){
  var W70 = 70, VP = OT.Vp * W70, VECF = (OT.Vp + OT.Ve) * W70, VTBW = (OT.Vp + OT.Ve + OT.Vr) * W70;
  function fx(v){ return v < 0.01 ? v.toExponential(1) : (v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : (v < 1000 ? v.toFixed(1) : Math.round(v).toLocaleString()))); }
  function sld(cls, label, min, max, step, val, unit){ return label + ' <input type="range" class="' + cls + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '" style="width:100px"> <b class="' + cls + 'v"></b>' + (unit ? ' ' + unit : ''); }
  function logHist(el, vals, mark, lo, hi, nb, title, xl, ticks){
    var g = cv(el), x = g.x, box = { l: 40, r: g.w - 12, t: 26, b: g.h - 40 }, cnt = new Array(nb).fill(0), bw = (box.r - box.l) / nb;
    vals.forEach(function(v){ var k = Math.floor((Math.log10(v) - lo) / (hi - lo) * nb); if (k >= 0 && k < nb) cnt[k]++; });
    var ym = Math.max.apply(null, cnt) * 1.1; x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(title, box.l, 16); x.font = '12px Aptos, "Segoe UI", sans-serif';
    cnt.forEach(function(c, k){ var hg = c / ym * (box.b - box.t); x.fillStyle = C.red; x.globalAlpha = 0.8; x.fillRect(box.l + k * bw + 1, box.b - hg, bw - 2, hg); x.globalAlpha = 1; });
    x.strokeStyle = C.silver; x.fillStyle = C.mid; x.textAlign = 'center'; ticks.forEach(function(v){ var xp = box.l + (Math.log10(v) - lo) / (hi - lo) * (box.r - box.l); x.beginPath(); x.moveTo(xp, box.b); x.lineTo(xp, box.b + 4); x.stroke(); x.fillText(String(v), xp, box.b + 16); });
    if (mark) { var xm = box.l + (Math.log10(mark) - lo) / (hi - lo) * (box.r - box.l); x.strokeStyle = C.char; x.lineWidth = 2; x.beginPath(); x.moveTo(xm, box.t); x.lineTo(xm, box.b); x.stroke(); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.fillText('selected', xm, box.t - 2); x.font = '12px Aptos, "Segoe UI", sans-serif'; }
    x.fillStyle = C.char; x.fillText(xl, (box.l + box.r) / 2, g.h - 6);
  }

})();
