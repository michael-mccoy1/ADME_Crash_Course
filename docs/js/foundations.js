"use strict";
/* Tabs 01 to 03: the foundations. 01 The path of a drug, 02 Pharmacokinetic parameters, 03 Scoring predictions.
   Standard one-compartment relations; real values from Obach (2008) and Obach (1999). */

function fRows(items){ return items.map(function(t){ return '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid ' + C.silver + ';padding:4px 0;font-size:12.5px"><span>' + t[0] + '</span><b style="text-align:right">' + t[1] + '</b></div>'; }).join(''); }
function fTile(label, value, sub){ return '<div class="score" style="margin-bottom:8px"><b>' + label + '</b><div class="v" style="font-size:1.5rem">' + value + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>'; }
function fMarks(g, x, ts, labels, col){ ts.forEach(function(t, i){ x.strokeStyle = col || C.char; x.lineWidth = 1; x.setLineDash([3, 4]); x.beginPath(); x.moveTo(g.sx(t), g.box.t); x.lineTo(g.sx(t), g.box.b); x.stroke(); x.setLineDash([]); x.fillStyle = col || C.char; x.font = '600 11px Aptos, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(labels[i], g.sx(t), g.box.t + 12); }); x.font = '12px Aptos, "Segoe UI", sans-serif'; }

/* =========================== tab 01: the path of a drug =========================== */
var PATHN = [
  { k: 'dis', label: 'Dissolution', letter: 'A', what: 'Dissolution in gastric and intestinal fluid, limited by solubility and fluid volume.', assay: 'Solubility at several pH values', qty: 'Dose number, D0', where: 'Tab 09' },
  { k: 'perm', label: 'Gut wall permeation', letter: 'A', what: 'Passive permeability and efflux across the intestinal membrane determine the fraction absorbed, Fa.', assay: 'Caco-2 or PAMPA permeability', qty: 'Fa', where: 'Tab 09' },
  { k: 'gutm', label: 'Gut wall metabolism', letter: 'M', what: 'Gut-wall enzymes metabolize drug before the portal vein; the fraction escaping is Fg.', assay: 'Intestinal microsomes or S9', qty: 'Fg', where: 'Not predicted' },
  { k: 'liver', label: 'Liver, first pass', letter: 'M and E', what: 'First-pass metabolism and biliary excretion; the fraction escaping is Fh.', assay: 'Liver microsomes or hepatocytes', qty: 'CLint, CLh, Fh', where: 'Tabs 05, 07 and 09' },
  { k: 'blood', label: 'Blood and plasma', letter: 'D', what: 'Plasma protein binding and red-cell partitioning. In the models used, only unbound drug is cleared or distributes to tissue.', assay: 'Plasma protein binding, blood to plasma ratio', qty: 'fu, B:P', where: 'Tabs 02 and 08' },
  { k: 'tissue', label: 'Tissues', letter: 'D', what: 'Distribution into tissue, quantified by the volume of distribution.', assay: 'Tissue binding; Vss from animal or human data', qty: 'Vss, fut', where: 'Tabs 02 and 08' },
  { k: 'kidney', label: 'Kidney and bile', letter: 'E', what: 'Renal and biliary excretion add to hepatic metabolic clearance.', assay: 'Renal and biliary clearance; transporter assays', qty: 'CLr, CLbile', where: 'Tab 05; not predicted' }];
function ivPts(D, V, CL, T, step){ var k = CL / V, pts = [], t; for (t = 0; t <= T + 1e-9; t += step) pts.push([t, D / V * Math.exp(-k * t)]); return pts; }
/* =========================== tab 02: pharmacokinetic parameters =========================== */
/* =========================== tab 03: scoring predictions =========================== */
function logTicks(lo, hi){ var o = []; for (var e = Math.ceil(lo); e <= Math.floor(hi); e++) o.push(Math.pow(10, e)); return o; }