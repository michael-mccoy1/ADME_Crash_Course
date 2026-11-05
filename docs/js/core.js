"use strict";
/* ADME crash course core: utilities, canvas helpers, charts and the lesson framework. Everything runs in the browser. */
var C = { red: '#0F6E8C', dred: '#0A4A5E', char: '#34373F', bg: '#A1B1C4', silver: '#D1D8E0', light: '#EDF2F4', tint: '#8CC7D9', mid: '#34373F', white: '#FFFFFF', warn: '#B4561B' };
var $ = function(id){ return document.getElementById(id); };
var qs = function(s, r){ return (r || document).querySelector(s); };
var qsa = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
function h(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t){ return a + (b - a) * t; }
function ease(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function mean(a){ var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
function fix(v, n){ return (+v).toFixed(n); }
function rng(seed){ var s = seed >>> 0; return function(){ s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function colorMix(t, a, b){ a = a || [209, 216, 224]; b = b || [225, 36, 42]; t = clamp(t, 0, 1); return 'rgb(' + a.map(function(x, i){ return Math.round(lerp(x, b[i], t)); }).join(',') + ')'; }
function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/* ---------- animation control ---------- */
var ANIM = true, AUTOPLAY = false, LAZY = !!(window.matchMedia && matchMedia('(max-width: 900px)').matches);
var tick = function(){ return new Promise(function(r){ setTimeout(r, 0); }); };
function progress(p){ var b = $('bar'); if (!b) return; b.style.width = (p * 100) + '%'; if (p >= 1) setTimeout(function(){ b.style.width = '0'; }, 400); }
function Cancel(){ this.cancel = true; }

/* ---------- canvas helpers ---------- */
function cv(el){ el = typeof el === 'string' ? $(el) : el; var vs0 = (function(){ var q = el.getBoundingClientRect().width, c0 = el._w || +el.getAttribute('width'); return q && c0 ? q / c0 : 1; })(), dpr = Math.min(Math.max(Math.ceil((window.devicePixelRatio || 1) * Math.max(vs0, 1) * 4) / 4, 1), window.innerWidth < 900 ? 2 : 3), w = el._w || +el.getAttribute('width'), hh = el._h || +el.getAttribute('height'); el._w = w; el._h = hh; if (el._s !== dpr) { el.width = w * dpr; el.height = hh * dpr; el.style.width = w + 'px'; el.style.height = hh + 'px'; el._s = dpr; } var x = el.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, el.width, el.height); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.font = '12px Aptos, "Segoe UI", system-ui, sans-serif'; return { x: x, w: w, h: hh }; }
function niceStep(span, want){ var raw = span / (want || 5), mag = Math.pow(10, Math.floor(Math.log10(raw))), nm = raw / mag; return (nm < 1.5 ? 1 : (nm < 3.5 ? 2 : (nm < 7.5 ? 5 : 10))) * mag; }
function niceTicks(lo, hi, want){ if (!(hi > lo)) return { v: [lo], step: 1 }; var step = niceStep(hi - lo, want), out = [], t = Math.ceil(lo / step - 1e-9) * step; for (; t <= hi + step * 1e-6; t += step) out.push(+t.toFixed(10)); return { v: out, step: step }; }
function tickText(v, step, dec){ if (dec !== undefined) return v.toFixed(dec); var d = step >= 1 ? 0 : Math.min(4, Math.max(0, -Math.floor(Math.log10(step) + 1e-9))); return v.toFixed(d); }
function axes(g, box, xr, yr, xl, yl, ticks, o){
  o = o || {}; var x = g.x; x.strokeStyle = C.silver; x.fillStyle = C.mid; x.lineWidth = 1; x.textAlign = 'right'; ticks = ticks || 4;
  var yt = o.yticks || (function(){ var n = niceTicks(yr[0], yr[1], ticks + 1); return n.v.map(function(v){ return { v: v, t: tickText(v, n.step, o.ydec) }; }); })();
  yt.forEach(function(k){ var y = box.b - (k.v - yr[0]) / (yr[1] - yr[0]) * (box.b - box.t); x.beginPath(); x.moveTo(box.l, y); x.lineTo(box.r, y); x.stroke(); x.fillText(k.t, box.l - 6, y + 4); });
  x.textAlign = 'center';
  var xt = o.xticks || (function(){ var n = niceTicks(xr[0], xr[1], ticks + 1); return n.v.map(function(v){ return { v: v, t: tickText(v, n.step, o.xdec) }; }); })();
  xt.forEach(function(k){ var tw = x.measureText(k.t).width, xp = box.l + (k.v - xr[0]) / (xr[1] - xr[0]) * (box.r - box.l); xp = Math.max(tw / 2 + 1, Math.min(xp, g.w - 2 - tw / 2)); x.fillText(k.t, xp, box.b + 16); });
  x.fillStyle = C.char; x.font = '600 12px Aptos, "Segoe UI", sans-serif'; x.fillText(xl, (box.l + box.r) / 2, box.b + 33); x.save(); x.translate(13, (box.t + box.b) / 2); x.rotate(-Math.PI / 2); x.fillText(yl, 0, 0); x.restore(); x.font = '12px Aptos, "Segoe UI", sans-serif';
}
function lineChart(el, series, o){
  var g = cv(el), xs = [], ys = [], labelled = series.filter(function(s){ return s.label && s.pts.length; }), rows = 0, rowAt = [];
  if (labelled.length) { g.x.font = '600 11px Aptos, "Segoe UI", sans-serif'; var cx0 = 48, rr = 0; labelled.forEach(function(s){ var w = g.x.measureText(s.label).width + 30; if (cx0 + w > g.w - 10 && cx0 > 48) { cx0 = 48; rr++; } rowAt.push([cx0, rr]); cx0 += w; }); rows = rr + 1; }
  var box = { l: 48, r: g.w - 14, t: rows ? 10 + rows * 16 : 14, b: g.h - 40 }; series.forEach(function(s){ s.pts.forEach(function(p){ xs.push(p[0]); ys.push(p[1]); }); });
  if (!xs.length) return g; var xmn = Math.min.apply(null, xs), xmx = Math.max.apply(null, xs), ymn = Math.min.apply(null, ys), ymx = Math.max.apply(null, ys), ratio = /^accuracy/i.test(o.yl || '');
  var x0 = o.x0 !== undefined ? o.x0 : Math.min(0, xmn), x1 = o.x1 !== undefined ? o.x1 : xmx, y0 = o.y0 !== undefined ? o.y0 : (ymn >= 0 ? 0 : -niceStep(Math.max(ymx - ymn, 1e-9), 4) * Math.ceil(-ymn / niceStep(Math.max(ymx - ymn, 1e-9), 4))), y1 = o.y1 !== undefined ? o.y1 : (ratio ? 1 : (function(){ var st = niceStep(Math.max(ymx - y0, 1e-9), 4); return Math.ceil(ymx / st - 1e-9) * st; })()); if (x1 === x0) x1 = x0 + 1; if (y1 === y0) y1 = y0 + 1;
  axes(g, box, [x0, x1], [y0, y1], o.xl || '', o.yl || '', 4, o); var sx = function(v){ return box.l + (v - x0) / (x1 - x0) * (box.r - box.l); }, sy = function(v){ return box.b - (v - y0) / (y1 - y0) * (box.b - box.t); };
  series.forEach(function(s){ var x = g.x; x.strokeStyle = s.color; x.lineWidth = s.w || 2.6; x.lineJoin = 'round'; x.setLineDash(s.dash || []); x.beginPath(); s.pts.forEach(function(p, i){ i ? x.lineTo(sx(p[0]), sy(p[1])) : x.moveTo(sx(p[0]), sy(p[1])); }); x.stroke(); x.setLineDash([]);
    if (!s.nodot && s.pts.length) { var q = s.pts[s.pts.length - 1]; x.fillStyle = s.color; x.beginPath(); x.arc(sx(q[0]), sy(q[1]), 4.5, 0, 6.3); x.fill(); } });
  /* legend above the plot, so labels never sit on a line */
  labelled.forEach(function(s, i){ var x = g.x, px = rowAt[i][0], py = 8 + rowAt[i][1] * 16 + 6; x.strokeStyle = s.color; x.lineWidth = 3; x.setLineDash([]); x.beginPath(); x.moveTo(px, py); x.lineTo(px + 16, py); x.stroke(); x.fillStyle = C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'left'; x.fillText(s.label, px + 21, py + 4); });
  g.sx = sx; g.sy = sy; g.box = box; return g;
}
/* =====================================================================
   Lesson framework
   ===================================================================== */
var LESSONS = {}, LORDER = ['why', 'units', 'elim', 'oral', 'met', 'vitro', 'hep', 'dist', 'abs', 'ddi', 'tp', 'rn', 'dose', 'bbb', 'pbpk', 'quiz'], ACTIVE = 'why';
function Lesson(id, title){ this.id = id; this.title = title; this.steps = []; this.gloss = null; this.optsHTML = ''; this.onOpts = null; this.onData = null; LESSONS[id] = this; }
Lesson.prototype.add = function(def){ this.steps.push(def); return this; };
Lesson.prototype.glossary = function(items){ this.gloss = items; return this; };
Lesson.prototype.move = function(short, to){ var i = -1; this.steps.forEach(function(s, k){ if (s.short === short) i = k; }); if (i < 0) return; var s = this.steps.splice(i, 1)[0]; this.steps.splice(to, 0, s); };
Lesson.prototype.refresh = function(){ var L = this; L.steps.forEach(function(s){ s.dirty = true; if (s.visible && s.armed && s.handlers && s.handlers.render) { s.dirty = false; s.api.tok++; s.api.clearTexts(); s.safe(function(){ return s.handlers.render(); }); } }); };

function seg(items, cur, attr){ return '<div class="seg" ' + attr + '>' + items.map(function(it){ return '<button type="button" data-v="' + it[0] + '"' + (it[0] === cur ? ' class="on"' : '') + '>' + it[1] + '</button>'; }).join('') + '</div>'; }
function optGroup(label, html, hint){ return '<div class="og"><div class="ol">' + label + '</div>' + html + (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>'; }
function optRange(id, label, min, max, step, val, hint){ return '<div class="og"><label class="row" for="' + id + '">' + label + '<output id="o-' + id + '">' + val + '</output></label><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">' + (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>'; }
document.addEventListener('input', function(e){ var t = e.target; if (t && t.type === 'range') { var o = $('o-' + t.id); if (o) o.textContent = t.value; } });
var LEVELS = [['foundations', 'Foundations', 'Definitions and models.'], ['applied', 'Applied', 'Effect of each assumption on the prediction.'], ['advanced', 'Advanced', 'Limits of the methods.']];
function levelOf(st){ return st.level || 'applied'; }
function levelName(k){ for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i][0] === k) return LEVELS[i][1]; return k; }
function openAncestors(el){ for (var p = el; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true; }
function goStep(id){ var t = $(id); if (!t) return; openAncestors(t); setTimeout(function(){ window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: ANIM ? 'smooth' : 'auto' }); var L = LESSONS[ACTIVE]; if (L) kickVisible(L); }, 40); }
function kickVisible(L){ L.steps.forEach(function(s){ if (s.sec) { var r = s.sec.getBoundingClientRect(); s.visible = r.height > 0 && r.top < innerHeight && r.bottom > 0; } if (s.visible && s.armed && s.dirty && s.handlers && s.handlers.render) { s.dirty = false; s.safe(function(){ return s.handlers.render(); }); } }); }
/* the bookmark rail: marks the step in view */
var railBusy = false;
window.addEventListener('scroll', function(){ if (railBusy) return; railBusy = true; requestAnimationFrame(function(){ railBusy = false; var root = $('lesson-' + ACTIVE), L = LESSONS[ACTIVE]; if (!root || !L || !L.built) return; var best = null; qsa('.rail a.ra', root).forEach(function(a){ a.classList.remove('on'); var t = $(a.dataset.t); if (t && t.getBoundingClientRect().height > 0 && t.getBoundingClientRect().top <= 140) best = a; }); if (best) best.classList.add('on'); var rl = qs('.rail', root), fs = qs('section.step', root); if (rl && fs) rl.classList.toggle('show', fs.getBoundingClientRect().top < window.innerHeight * 0.6); }); }, { passive: true });
window.addEventListener('resize', function(){ window.dispatchEvent(new Event('scroll')); });
document.addEventListener('click', function(e){ if (e.target.closest && e.target.closest('nav.tabs')) setTimeout(function(){ window.dispatchEvent(new Event('scroll')); }, 400); });

function introHTML(ig){
  var html = '<div class="ig">';
  if (ig.scope) html += '<div class="isec"><div class="ol">Scope</div><p>' + esc(ig.scope) + '</p></div>';
  
  if (ig.notation) html += '<details class="idet" open><summary>Notation</summary><dl class="nt">' + ig.notation.map(function(n){ return '<dt>' + esc(n[0]) + '</dt><dd>' + esc(n[1]) + '</dd>'; }).join('') + '</dl></details>';
  if (ig.data) html += '<details class="idet" open><summary>Data and sources</summary><ul>' + ig.data.map(function(d){ return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></details>';
  return html + '</div>';
}
function buildLesson(L){
  var root = $('lesson-' + L.id), n = L.steps.length + (L.gloss ? 1 : 0), startsBeginner = false;
  if (L.optsClosed === undefined) L.optsClosed = startsBeginner; 
  if (L.custom) { L.custom(root); L.built = true; return; }
  if (L.noOpts) root.classList.add('noopts');
  root.innerHTML = (L.noOpts ? '' : '<aside class="options"><details class="optd"' + (L.optsClosed ? '' : ' open') + '><summary class="otitle">' + (L.optsLabel || 'Options') + '</summary><div class="obody"></div><div class="aff"><div class="hint">Change an option to see which steps use it.</div></div></details></aside>') + '<div class="steps"><nav class="toc"></nav></div>';
  if (!L.noOpts) qs('.obody', root).innerHTML = typeof L.optsHTML === 'function' ? L.optsHTML() : L.optsHTML; var stepsEl = qs('.steps', root), toc = qs('.toc', root);
  var ig = window.GUIDE && GUIDE.intro[L.id]; if (ig) { var card = h('div', 'intro', introHTML(ig)); stepsEl.insertBefore(card, toc); }
  var rank = { foundations: 0, applied: 1, advanced: 2 };
  L.steps.forEach(function(st, k){ st._o = k; }); function ordKey(st){ return st.ord !== undefined ? st.ord : 100 + st._o; }
  L.steps.sort(function(x, y){ return rank[levelOf(x)] - rank[levelOf(y)] || ordKey(x) - ordKey(y); });
  var secs = {}, opened = false, lastLv = null, rail = h('nav', 'rail'); rail.setAttribute('aria-label', 'Jump to a step');
  var cols = LEVELS.map(function(lv){ var items = []; L.steps.forEach(function(st, i){ if (levelOf(st) === lv[0]) items.push([st, i]); }); if (!items.length) return ''; return '<div class="tcol"><div class="tch"><b>' + lv[1] + '</b><span>' + items.length + (items.length > 1 ? ' steps' : ' step') + '</span></div><ol>' + items.map(function(it){ return '<li><a data-t="' + L.id + '-s' + (it[1] + 1) + '" data-si="' + it[1] + '" tabindex="0"><span class="n">' + (it[1] + 1) + '</span>' + esc(it[0].title) + '</a></li>'; }).join('') + '</ol></div>'; }).join('');
  toc.innerHTML = '<div class="tochead"><span class="toct">Contents</span><span class="tocr">' + (L.gloss ? '<a data-t="' + L.id + '-gl" tabindex="0">Glossary</a>' : '') + '<button type="button" data-all="1">Expand all</button><button type="button" data-all="0">Collapse all</button></span></div><div class="tocgrid">' + cols + '</div>';
  toc.addEventListener('click', function(e){ var a = e.target.closest('a[data-t]'); if (a) { goStep(a.dataset.t); return; } var b = e.target.closest('button[data-all]'); if (!b) return; qsa('details.lvl', root).forEach(function(d){ d.open = b.dataset.all === '1'; }); if (b.dataset.all === '1') setTimeout(function(){ kickVisible(L); }, 80); });
  toc.addEventListener('keydown', function(e){ var a = e.target.closest ? e.target.closest('a[data-t]') : null; if (a && e.key === 'Enter') goStep(a.dataset.t); });
  LEVELS.forEach(function(lv){
    var items = L.steps.filter(function(st){ return levelOf(st) === lv[0]; }); if (!items.length) return;
    var d = h('details', 'lvl lvl-' + lv[0]); d.id = L.id + '-lv-' + lv[0];
    d.innerHTML = '<summary><span class="lvn">' + lv[1] + '</span><span class="lvc">' + items.length + (items.length > 1 ? ' steps' : ' step') + '</span><span class="lvs">' + lv[2] + '</span></summary><div class="lvb"></div>';
    if (!opened) { d.open = true; opened = true; } stepsEl.appendChild(d); secs[lv[0]] = qs('.lvb', d);
    d.addEventListener('toggle', function(){ if (d.open) setTimeout(function(){ kickVisible(L); }, 80); });
  });
  L.steps.forEach(function(st, i){
    var lvl = levelOf(st); st.L = L; st.idx = i; buildStep(L, st, i, n, secs[lvl]);
    if (lvl !== lastLv) { lastLv = lvl; rail.appendChild(h('div', 'rl rl-' + lvl, esc(levelName(lvl).slice(0, 3)))); }
    var ra = h('a', 'ra rl-' + lvl, '<b>' + (i + 1) + '</b><span>' + esc(st.title) + '</span>'); ra.tabIndex = 0; ra.dataset.t = L.id + '-s' + (i + 1); ra.addEventListener('click', function(){ goStep(ra.dataset.t); }); ra.addEventListener('keydown', function(e){ if (e.key === 'Enter') goStep(ra.dataset.t); }); rail.appendChild(ra);
  });
  if (L.gloss) { var g = h('section', 'step gloss'); g.id = L.id + '-gl'; g.innerHTML = '<div class="shead"><i class="tick"></i><div><div class="eyebrow">GLOSSARY</div><h2>Terms in this lesson</h2></div></div><dl class="gl">' + L.gloss.map(function(t){ return '<div><dt>' + t[0] + '</dt><dd>' + t[1] + '</dd></div>'; }).join('') + '</dl>'; stepsEl.appendChild(g); var ra2 = h('a', 'ra rl-gl', '<b>G</b><span>Glossary</span>'); ra2.tabIndex = 0; ra2.dataset.t = L.id + '-gl'; ra2.addEventListener('click', function(){ goStep(ra2.dataset.t); }); rail.appendChild(ra2); }
  root.appendChild(rail);
  L.built = true; if (L.onOpts) L.onOpts(root);
}
function tocChip(target, label){ var b = h('button', 'tc', esc(label)); b.type = 'button'; b.addEventListener('click', function(){ goStep(target); }); return b; }
function buildStep(L, s, idx, total, parent){ var tx = window.STEPTEXT && STEPTEXT[L.id + '/' + s.short]; if (tx) { s.watch = tx.watch; s.change = tx.change; s.legend = tx.legend; }
  var sec = h('section', 'step' + (s.bench ? ' bench' : '')); sec.id = L.id + '-s' + (idx + 1); s.sec = sec;
  sec.innerHTML = '<div class="shead"><i class="tick"></i><div><div class="eyebrow">' + (s.bench ? 'WORKBENCH' : 'STEP ' + (idx + 1)) + '</div><h2>' + s.title + '</h2></div></div>' +
    '<p class="lead">' + s.watch + '</p><p class="try"><b>Controls</b> ' + s.change + '</p>' +
    '<div class="stagewrap"><div class="screen"><div class="inner"></div></div>' + (s.bench ? '' : '<div class="sbar"><button type="button" class="btn sm ghost" data-play>Walk through</button><span class="sx"></span></div>') + '</div>' + (s.legend ? '<p class="legend"><b>Figure.</b> ' + s.legend + '</p>' : '');
  var gd = window.GUIDE && GUIDE.steps[L.id + '/' + s.short]; if (gd) sec.insertAdjacentHTML('beforeend', '<div class="guide"><p class="gn"><b>Observation</b>' + esc(gd.notice) + '</p></div>');
  parent.appendChild(sec);
  var screen = qs('.screen', sec), inner = qs('.inner', sec), sbar = qs('.sbar', sec) || h('div', 'sbar'), sx = qs('.sx', sec) || h('span', 'sx');
  var cap = h('div', 'cap'), busy = h('div', 'busy', '<div class="bs"><i></i><span></span></div>'), stale = h('div', 'stalebadge'); inner.appendChild(cap); inner.appendChild(stale); inner.appendChild(busy);
  var api = { sec: sec, inner: inner, sbar: sbar, L: L, tok: 0, stepDef: s };
  api.el = function(cls, style, html){ var e = h('div', cls, html); if (style) e.style.cssText = style; inner.insertBefore(e, cap); return e; };
  api.cap = function(t){ if (t === null || t === undefined) { cap.classList.remove('on'); return; } cap.innerHTML = t; cap.classList.add('on'); };
  api.key = function(t){ api.cap(t || null); };
  api.clearTexts = function(){ cap.classList.remove('on'); };
  api.stat = function(t){ sx.innerHTML = t || ''; };
  api.stale = function(t){ if (t) { stale.textContent = t; stale.classList.add('on'); } else stale.classList.remove('on'); };
  api.busy = function(t){ qs('span', busy).textContent = t || 'Updating'; busy.classList.add('on'); };
  api.gate = function(t){ var sp = qs('span', busy); sp.innerHTML = esc(t) + ' <button type="button" class="btn sm" style="margin-left:10px">Go to workbench</button>'; qs('button', sp).addEventListener('click', function(){ var bi = 0; L.steps.forEach(function(st, k){ if (st.bench) bi = k; }); goStep(L.id + '-s' + (bi + 1)); }); busy.classList.add('on', 'gate'); };
  api.idle = function(){ busy.classList.remove('on', 'gate'); };
  api.sleep = function(ms){ var tok = api.tok; return new Promise(function(res, rej){ setTimeout(function(){ if (api.tok !== tok) rej(new Cancel()); else res(); }, ANIM ? ms : 0); }); };
  api.anim = function(ms, fn){ var tok = api.tok; return new Promise(function(res, rej){ if (!ANIM) { fn(1); return res(); } var t0 = performance.now(); (function f(now){ if (api.tok !== tok) return rej(new Cancel()); var t = clamp((now - t0) / ms, 0, 1); fn(ease(t)); if (t < 1) requestAnimationFrame(f); else res(); })(t0); }); };
  api.beat = async function(text, ms){ api.cap(text); await api.sleep(ms || 2200); };
  api.addControl = function(html){ var w = h('span', 'sc', html); sbar.insertBefore(w, sx); return w; };
  api.checkTok = function(tok){ if (api.tok !== tok) throw new Cancel(); };
  s.api = api;
  function fit(){ var w = screen.clientWidth; if (w) inner.style.transform = 'scale(' + (w / 960) + ')'; }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(screen); fit();
  var zb = h('button', 'btn sm ghost zoomb', 'Enlarge'), sw = qs('.stagewrap', sec); zb.type = 'button'; zb.addEventListener('click', function(){ var big = sw.classList.toggle('big'); zb.textContent = big ? 'Fit to screen' : 'Enlarge'; fit(); });
  if (sbar.parentNode) sbar.insertBefore(zb, sbar.firstChild);
  s.safe = function(fn){ try { var r = fn(); if (r && r.catch) r.catch(function(e){ if (!(e instanceof Cancel)) console.error(e); }); return r; } catch (e) { if (!(e instanceof Cancel)) console.error(e); } };
  s.handlers = s.build(api) || {};
  var pb = qs('[data-play]', sec); if (pb) { if (!s.handlers.play) pb.style.display = 'none'; else pb.addEventListener('click', function(){ s.play(); }); }
  s.play = function(){ if (!s.handlers.play) return; api.tok++; var tok = api.tok; api.clearTexts(); return s.safe(function(){ return s.handlers.play(tok); }); };
  s.visible = false; s.played = false; s.dirty = true; s.armed = !LAZY || idx === 0;
  function offerLoad(){ if (s.offered) return; s.offered = true; qs('span', busy).innerHTML = 'Tap to load this step <button type="button" class="btn sm" style="margin-left:10px">Load</button>'; busy.classList.add('on', 'gate'); qs('button', busy).addEventListener('click', function(){ s.armed = true; busy.classList.remove('on', 'gate'); if (s.handlers.render) { s.dirty = false; s.safe(function(){ return s.handlers.render(); }); } }); }
  var io = new IntersectionObserver(function(es){ es.forEach(function(en){
    var vis = en.isIntersecting; s.visible = vis; if (!vis || ACTIVE !== L.id) return; if (!s.armed) { offerLoad(); return; }
    if (s.dirty && s.handlers.render) { s.dirty = false; s.safe(function(){ return s.handlers.render(); }); }
  }); }, { threshold: [0, 0.25, 0.5, 0.75] });
  io.observe(sec);
}

/* a copy of a left-panel slider, placed under the stage so the step can be used without scrolling */
function mirrorSlider(api, id, label){
  var src = $(id), w = api.addControl(label + ' <input type="range" style="width:260px"><b class="mv"></b>'), r = qs('input', w), v = qs('.mv', w);
  function pull(){ r.min = src.min; r.max = src.max; r.step = src.step; r.value = src.value; v.textContent = src.value; }
  pull(); r.addEventListener('input', function(){ src.value = r.value; v.textContent = r.value; src.dispatchEvent(new Event('input', { bubbles: true })); }); src.addEventListener('input', pull); return w;
}
function delay(ms){ return new Promise(function(r){ setTimeout(r, ANIM ? ms : 0); }); }
/* ---------- tabs ---------- */
function showLesson(id){
  ACTIVE = id; LORDER.forEach(function(k){ var el = $('lesson-' + k); if (el) el.hidden = k !== id; }); qsa('#tabs button').forEach(function(b){ b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'); });
  var L = LESSONS[id]; if (L && !L.built) buildLesson(L); window.scrollTo({ top: 0 });
  if (L && L.onShow) L.onShow();
  if (L) setTimeout(function(){ L.steps.forEach(function(s){ if (s.sec) { var r = s.sec.getBoundingClientRect(); s.visible = r.top < innerHeight && r.bottom > 0; } if (s.visible && s.armed && s.dirty && s.handlers.render) { s.dirty = false; s.safe(function(){ return s.handlers.render(); }); } }); }, 60);
}
function boot(){
  qsa('#tabs button').forEach(function(b){ b.addEventListener('click', function(){ showLesson(b.dataset.tab); }); });
  $('animtoggle').addEventListener('click', function(){ ANIM = !ANIM; document.body.classList.toggle('noanim', !ANIM); this.setAttribute('aria-pressed', ANIM ? 'false' : 'true'); this.textContent = ANIM ? 'Animations on' : 'Animations off'; });
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) $('animtoggle').click();
}

/* ---------- small shared helpers ---------- */
function animateFree(ms, fn){ return new Promise(function(res){ if (!ANIM) { fn(1); return res(); } var t0 = performance.now(); (function f(now){ var t = clamp((now - t0) / ms, 0, 1); fn(ease(t)); if (t < 1) requestAnimationFrame(f); else res(); })(t0); }); }
function countUp(el, to, dec, ms){ animateFree(ms || 900, function(t){ el.textContent = (to * t).toFixed(dec); }); }
function pct(n, d){ return d ? Math.round(100 * n / d) : 0; }