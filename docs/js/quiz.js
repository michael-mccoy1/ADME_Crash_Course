"use strict";
/* Quiz for tabs 01 to 14. Each round draws 10 questions at random. Question types: multiple choice, select all, numeric and ordering.
   Every question has a schematic: q.fig = { name: 'xy', o: { ... } }. A schematic is a function in QZFIG that returns an SVG string. */
var QZ = { bank: [], cur: [], i: 0, score: 0, log: [], root: null, drawn: false };
var QZ_DRAW = 10;
/* Figures. Each question can name a schematic: q.fig = { name: 'treeDepth', o: { ... } }.
   A schematic is a function in QZFIG that takes the options and returns an SVG string. QZSV holds small drawing helpers. */
var QZFIG = {};
var QZSV = {
  C: { red: '#0F6E8C', dred: '#0A4A5E', char: '#34373F', bg: '#A1B1C4', silver: '#D1D8E0', light: '#EDF2F4', white: '#FFFFFF', mid: '#6F8196' },
  svg: function(w, hh, inner, cap){ return '<svg class="qsvg" viewBox="0 0 ' + w + ' ' + hh + '" width="100%" style="max-width:' + w + 'px" role="img" aria-label="' + esc(cap || 'Schematic') + '" font-family="Aptos, Segoe UI, sans-serif" font-size="12"><defs><marker id="qsa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#34373F"/></marker></defs>' + inner + '</svg>'; },
  text: function(x, y, t, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" fill="' + (o.c || '#34373F') + '"' + (o.b ? ' font-weight="700"' : '') + (o.s ? ' font-size="' + o.s + '"' : '') + (o.i ? ' font-style="italic"' : '') + '>' + esc(t) + '</text>'; },
  rect: function(x, y, w, hh, o){ o = o || {}; return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="' + (o.r === undefined ? 4 : o.r) + '" fill="' + (o.f || '#FFFFFF') + '" stroke="' + (o.s || '#34373F') + '" stroke-width="' + (o.w || 1.4) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + '/>'; },
  circle: function(x, y, r, o){ o = o || {}; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.f || '#FFFFFF') + '" stroke="' + (o.s || '#34373F') + '" stroke-width="' + (o.w || 1.4) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + '/>'; },
  line: function(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.c || '#34373F') + '" stroke-width="' + (o.w || 1.4) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + '/>'; },
  arrow: function(x1, y1, x2, y2, o){ o = o || {}; return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.c || '#34373F') + '" stroke-width="' + (o.w || 1.4) + '" marker-end="url(#qsa)"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + '/>'; },
  path: function(d, o){ o = o || {}; return '<path d="' + d + '" fill="' + (o.f || 'none') + '" stroke="' + (o.c || '#34373F') + '" stroke-width="' + (o.w || 1.8) + '"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + '/>'; }
};

function qMC(topic, text, right, wrong, why){ return { t: 'mc', topic: topic, text: text, opts: [right].concat(wrong), ans: 0, why: why }; }
function qMulti(topic, text, right, wrong, why){ return { t: 'multi', topic: topic, text: text, opts: right.concat(wrong), ans: right.map(function(_, i){ return i; }), why: why }; }
function qNum(topic, text, ans, tol, unit, why){ return { t: 'num', topic: topic, text: text, ans: ans, tol: tol, unit: unit || '', why: why }; }
function qOrder(topic, text, steps, why){ return { t: 'order', topic: topic, text: text, steps: steps, why: why }; }
function qzShuffle(a, rnd){ var o = a.slice(); for (var i = o.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = o[i]; o[i] = o[j]; o[j] = t; } return o; }
function qzDraw(){
  var rnd = Math.random, picks = qzShuffle(QZ.bank, rnd).slice(0, QZ_DRAW);
  QZ.cur = picks.map(function(q){ var c = Object.assign({}, q); if (c.t === 'mc' || c.t === 'multi') { c.view = qzShuffle(c.opts.map(function(_, i){ return i; }), rnd); } if (c.t === 'order') { var o; do { o = qzShuffle(c.steps.map(function(_, i){ return i; }), rnd); } while (o.every(function(v, i){ return v === i; })); c.view = o; } return c; });
  QZ.i = 0; QZ.score = 0; QZ.log = [];
}
function qzTopbar(){
  var dots = QZ.cur.map(function(_, i){ var st = QZ.log[i]; return '<i class="' + (st !== undefined ? (st ? 'ok' : 'no') : (i === QZ.i && QZ.i < QZ.cur.length ? 'now' : '')) + '"></i>'; }).join('');
  return '<div class="qtop"><div class="qdots">' + dots + '</div><div class="qsc">' + (QZ.i < QZ.cur.length ? 'Question ' + (QZ.i + 1) + ' of ' + QZ.cur.length : 'Finished') + '</div></div>';
}
function qzRender(){
  var root = QZ.root; if (!root) return; var q = QZ.cur[QZ.i];
  if (!q) return qzFinish();
  var html = '<div class="qwrap">' + qzTopbar() + '<div class="qcard"><div class="qtopic">' + esc(q.topic) + '</div><h3 class="qtext">' + esc(q.text) + '</h3><div class="qfig" hidden></div><div class="qbody"></div><div class="qfb" hidden></div><div class="qact"></div></div></div>';
  root.innerHTML = '<div class="qpage">' + html + '</div>';
  var body = qs('.qbody', root), act = qs('.qact', root), fb = qs('.qfb', root), done = false, fig = qs('.qfig', root);
  if (q.fig) { try { var fs = typeof q.fig === 'function' ? q.fig() : q.fig; if (QZFIG[fs.name]) { fig.innerHTML = QZFIG[fs.name](fs.o || {}); fig.hidden = false; } } catch (e) { console.error(e); } }
  function finish(ok, extra){ if (done) return; done = true; QZ.log[QZ.i] = ok; if (ok) QZ.score++; fb.hidden = false; fb.className = 'qfb ' + (ok ? 'ok' : 'no'); fb.innerHTML = '<b>' + (ok ? 'Correct.' : 'Incorrect.') + '</b> ' + (extra || '') + ' ' + esc(q.why || ''); act.innerHTML = '<button type="button" class="btn" data-next>' + (QZ.i === QZ.cur.length - 1 ? 'See my score' : 'Next question') + '</button>'; qs('[data-next]', act).addEventListener('click', function(){ QZ.i++; qzRender(); window.scrollTo({ top: 0 }); }); qs('.qtop', root).outerHTML = qzTopbar(); }
  if (q.t === 'mc' || q.t === 'multi') {
    var multi = q.t === 'multi'; body.innerHTML = (multi ? '<div class="qhint">Select every answer that applies.</div>' : '') + q.view.map(function(oi, k){ return '<label class="qopt"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="qo" value="' + oi + '"><span>' + esc(q.opts[oi]) + '</span></label>'; }).join('');
    act.innerHTML = '<button type="button" class="btn" data-check disabled>Check answer</button>'; var cb = qs('[data-check]', act);
    body.addEventListener('change', function(){ cb.disabled = !qsa('input:checked', body).length; });
    cb.addEventListener('click', function(){
      var chosen = qsa('input:checked', body).map(function(i){ return +i.value; }), want = multi ? q.ans : [0], ok = chosen.length === want.length && want.every(function(w){ return chosen.indexOf(w) >= 0; });
      qsa('.qopt', body).forEach(function(l){ var i = qs('input', l), v = +i.value, right = want.indexOf(v) >= 0; i.disabled = true; l.classList.toggle('right', right); l.classList.toggle('wrong', i.checked && !right); });
      finish(ok, ok ? '' : (multi ? 'The answers that apply are marked in green.' : 'The right answer is marked in green.'));
    });
  } else if (q.t === 'num') {
    body.innerHTML = '<div class="qnum"><input type="text" inputmode="decimal" placeholder="Your answer" aria-label="Your answer"> <span>' + esc(q.unit) + '</span></div>' + (q.tol ? '<div class="qhint">Any answer within ' + q.tol + ' of the exact value counts.</div>' : '');
    act.innerHTML = '<button type="button" class="btn" data-check disabled>Check answer</button>'; var inp = qs('input', body), cb2 = qs('[data-check]', act);
    inp.addEventListener('input', function(){ cb2.disabled = !String(inp.value).trim() || isNaN(parseFloat(String(inp.value).replace(/,/g, ''))); });
    function go(){ if (cb2.disabled) return; var v = parseFloat(String(inp.value).replace(/,/g, '')), ok = Math.abs(v - q.ans) <= q.tol + 1e-9; inp.disabled = true; finish(ok, ok ? '' : 'The answer is ' + q.ans + (q.unit ? ' ' + q.unit : '') + '.'); }
    cb2.addEventListener('click', go); inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') go(); });
  } else if (q.t === 'order') {
    var order = q.view.slice();
    function drawOrder(lock){ body.innerHTML = '<div class="qhint">Use the arrows to put the steps in order, first step at the top.</div><ol class="qord">' + order.map(function(si, k){ return '<li><span>' + esc(q.steps[si]) + '</span>' + (lock ? '' : '<button type="button" class="btn sm ghost" data-up="' + k + '" aria-label="Move up"' + (k === 0 ? ' disabled' : '') + '>&uarr;</button><button type="button" class="btn sm ghost" data-dn="' + k + '" aria-label="Move down"' + (k === order.length - 1 ? ' disabled' : '') + '>&darr;</button>') + '</li>'; }).join('') + '</ol>'; }
    drawOrder(false);
    body.addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b || done) return; var k = b.dataset.up !== undefined ? +b.dataset.up : (b.dataset.dn !== undefined ? +b.dataset.dn : -1); if (k < 0) return; var j = b.dataset.up !== undefined ? k - 1 : k + 1, t = order[k]; order[k] = order[j]; order[j] = t; drawOrder(false); });
    act.innerHTML = '<button type="button" class="btn" data-check>Check order</button>';
    qs('[data-check]', act).addEventListener('click', function(){ var ok = order.every(function(v, i){ return v === i; }); drawOrder(true); finish(ok, ok ? '' : 'The right order is: ' + q.steps.map(function(s, i){ return (i + 1) + ', ' + s; }).join(' ')); });
  }
}

/* live schematic for a challenge: the model being configured, and the attempts against the goal */
function qzFinish(){
  var root = QZ.root, n = QZ.cur.length, pc = Math.round(100 * QZ.score / n);
  var msg = '';
  var rev = QZ.cur.map(function(q, i){ return '<li class="' + (QZ.log[i] ? 'ok' : 'no') + '"><b>' + (QZ.log[i] ? 'Right' : 'Missed') + '</b> <span class="qtp">' + esc(q.topic) + '</span><div>' + esc(q.text) + '</div>' + (QZ.log[i] ? '' : '<div class="qwhy">' + esc(q.why || '') + '</div>') + '</li>'; }).join('');
  root.innerHTML = '<div class="qpage"><div class="qwrap">' + qzTopbar() + '<div class="qcard qend"><div class="qtopic">Your score</div><div class="qbig">' + QZ.score + ' of ' + n + '</div><p>' + pc + '% correct. The review below gives the explanation for each question that was missed.</p><div class="qact"><button type="button" class="btn" data-again>New set of ' + n + '</button></div></div><ol class="qrev">' + rev + '</ol></div></div>';
  qs('[data-again]', root).addEventListener('click', function(){ qzDraw(); qzRender(); window.scrollTo({ top: 0 }); });
}

var LQ = new Lesson('quiz', 'Quiz');
LQ.custom = function(root){
  QZ.root = root; root.classList.add('qz');
  root.innerHTML = '<div class="qpage"><div class="qwrap"><div class="qcard qintro"><div class="qtopic">Quiz</div><h3 class="qtext">Question set</h3><p>Ten questions per round, drawn at random from ' + QZ.bank.length + ' (tabs 01 to 14): multiple choice, select all, numeric (within the stated tolerance) and ordering.</p><div class="qact"><button type="button" class="btn" data-start>Start</button></div></div></div></div>';
  qs('[data-start]', root).addEventListener('click', function(){ qzDraw(); qzRender(); window.scrollTo({ top: 0 }); });
};