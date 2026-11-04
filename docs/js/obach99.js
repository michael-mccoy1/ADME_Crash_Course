"use strict";
/* Obach RS (1999) Drug Metab Dispos 27:1350-1359, Tables 2 and 3. Human liver microsomes, 29 drugs.
   Columns: drug, class, fu plasma, blood to plasma ratio, observed nonrenal blood clearance (mL/min/kg),
   scaled microsomal CLint (mL/min/kg, 45 mg protein per g liver, 20 g liver per kg), fu in the microsomal incubation.
   Warfarin CLint is reported as below 0.52 and is entered as 0.52. */
var OBACH99 = [
  ["Chlorpromazine","base",0.05,0.78,11,25,0.11],
  ["Propafenone","base",0.04,0.7,19,166,0.26],
  ["Verapamil","base",0.1,0.77,19,122,0.43],
  ["Diphenhydramine","base",0.22,0.65,9.5,2.1,0.29],
  ["Lorcainide","base",0.15,0.77,18,50,0.52],
  ["Diltiazem","base",0.22,1.0,12,15,0.76],
  ["Amitriptyline","base",0.05,0.86,12,14,0.15],
  ["Desipramine","base",0.18,0.96,12,17,0.21],
  ["Imipramine","base",0.1,1.1,12,19,0.18],
  ["Ketamine","base",0.88,0.82,20,27,0.49],
  ["Quinidine","base",0.13,0.92,2.7,3.4,0.32],
  ["Clozapine","base",0.05,0.87,2.9,4.6,0.13],
  ["Dexamethasone","neutral",0.32,0.93,3.8,3.0,1.0],
  ["Prednisone","neutral",0.25,0.83,4.9,2.7,0.2],
  ["Diazepam","neutral",0.013,0.71,0.6,2.3,0.28],
  ["Midazolam","neutral",0.05,0.53,8.7,160,0.88],
  ["Methoxsalen","neutral",0.09,0.67,18,40,0.94],
  ["Alprazolam","neutral",0.32,0.78,0.76,1.6,0.66],
  ["Triazolam","neutral",0.1,0.62,4.7,19,0.78],
  ["Zolpidem","neutral",0.08,0.76,5.7,2.8,0.58],
  ["Diclofenac","acid",0.005,0.55,7.6,189,1.0],
  ["Ibuprofen","acid",0.01,0.55,1.5,8.8,0.84],
  ["Tolbutamide","acid",0.04,0.55,0.36,0.9,0.95],
  ["Warfarin","acid",0.01,0.55,0.081,0.52,0.47],
  ["Tenidap","acid",0.0007,0.56,0.1,8.3,0.32],
  ["Tenoxicam","acid",0.009,0.67,0.03,1.7,0.78],
  ["Amobarbital","acid",0.39,1.5,0.35,0.94,0.76],
  ["Hexobarbital","acid",0.53,1.0,3.6,2.3,0.81],
  ["Methohexital","acid",0.27,0.7,16,49,0.86]
].map(function(r){ return { name: r[0], cls: r[1], fup: r[2], bp: r[3], obs: r[4], clint: r[5], fum: r[6] }; });
