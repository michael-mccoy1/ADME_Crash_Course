"use strict";
/* Shared helpers for animated mechanism schematics (cells, barriers, nephron, organs). Plain canvas 2D, no dependencies.
   SC.run(cvs, step) starts a requestAnimationFrame loop that draws only while the canvas is on screen and the page is visible;
   step(dt, t) receives seconds since the last frame (capped at 0.05) and total seconds. Draw with the cv() context (cvs._w, cvs._h are logical pixels). */
var SC = {};

SC.run = function(cvs, step){
  var last = 0, t = 0, stop = false;
  (function f(now){
    if (stop) return;
    var vis = cvs.offsetParent !== null && !document.hidden;
    if (vis) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (typeof ANIM !== 'undefined' && !ANIM) dt = 0;
      t += dt; step(dt, t);
    } else last = 0;
    requestAnimationFrame(f);
  })(performance.now());
  return { stop: function(){ stop = true; }, redraw: function(){ step(0, t); } };
};

/* rounded rectangle path */
SC.rr = function(x, px, py, w, h, r){ x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); };

SC.text = function(x, s, px, py, o){ o = o || {}; x.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px Aptos, "Segoe UI", sans-serif'; x.fillStyle = o.color || C.char; x.textAlign = o.align || 'left'; x.textBaseline = o.base || 'alphabetic'; x.fillText(s, px, py); };

SC.arrow = function(x, x1, y1, x2, y2, color, w, head){ var a = Math.atan2(y2 - y1, x2 - x1), h = head || 8; x.strokeStyle = color; x.fillStyle = color; x.lineWidth = w || 2; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2 - Math.cos(a) * h * 0.6, y2 - Math.sin(a) * h * 0.6); x.stroke(); x.beginPath(); x.moveTo(x2, y2); x.lineTo(x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)); x.lineTo(x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)); x.closePath(); x.fill(); };

/* a drug molecule: a filled disc with a thin ring; bound = grey disc attached to a larger protein shape is drawn by the caller */
SC.dot = function(x, px, py, r, fill, stroke){ x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fillStyle = fill; x.fill(); if (stroke) { x.lineWidth = 1; x.strokeStyle = stroke; x.stroke(); } };

/* mix two #rrggbb colors, t in [0,1] */
SC.mix = function(a, b, t){ function p(h){ return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; } var A = p(a), B = p(b), i, o = []; for (i = 0; i < 3; i++) o.push(Math.round(A[i] + (B[i] - A[i]) * t)); return 'rgb(' + o.join(',') + ')'; };

/* seeded random so schematics look the same on each load; returns function () -> [0,1) */
SC.rand = function(seed){ var s = seed >>> 0 || 1; return function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
