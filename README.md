# ADME Crash Course

Interactive lessons on quantitative DMPK for working DMPK scientists. Every lesson uses public data and runs in the browser. A static site in `docs/`, suitable for GitHub Pages.

## Design

* The course follows the translation chain: structure, in vitro, human PK, dose, interaction risk. Each tab covers one link.
* Each tab scores a standard prediction method on a fixed set of public drugs. The scoreboard is the same on every tab: the count within 2-fold, the average fold error (geometric mean of the absolute fold difference) and the bias (geometric mean of predicted over observed).
* Steps change one assumption and show how the scoreboard moves.

## Status

Tabs 01 to 06 are the foundations, built from first principles with no term used before it is defined: why exposure matters (concentration and effect, the ADME stages, measures of exposure); amount, concentration and volume (units, apparent volume, bound and unbound drug); elimination (first-order kinetics, clearance, the intravenous profile, volume and half-life, repeat dosing, a consistency check on 667 PK records); getting a drug in (the oral profile, bioavailability from areas, Fa x Fg x Fh); metabolism and excretion (metabolic routes, enzyme kinetics, the depletion assay, extraction, total clearance); and from test tube to patient (what assays measure, one drug from assay to clearance, fold error, bias and the log scale). Every tab opens with an overview, objectives, notation and data sources.

Tab 07, hepatic clearance from in vitro data, has eight steps. Source data: Obach (1999), Drug Metab Dispos 27:1350, Tables 2 and 3 (`tools/check_obach1999.py` reproduces the published accuracy values in Tables 4 and 5); the AstraZeneca in vitro DMPK deposit in ChEMBL (CHEMBL3301361, CC BY-SA 3.0) for the microsome and hepatocyte comparison; Varma et al. (2015), Pharm Res 32:3785, for the extended clearance classification system.

Tab 08, distribution, has eight steps. Source data: Obach et al. (2008), Drug Metab Dispos 36:1385, human intravenous PK for 670 drugs, via the ChEMBL deposit (CC BY-SA 3.0), joined to measured logD and pKa from the AstraZeneca deposit where available. The Oie-Tozer constants and the tissue binding equation are as stated in Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0).

Tab 09, absorption and bioavailability, has five steps. Source data: Obach (1999) for the hepatic first-pass limit; Hou et al. (2007) human intestinal absorption (578 compounds), Wang et al. (2016) Caco-2 permeability (910 compounds) and AqSolDB (Sorkun et al., 2019), all through Therapeutics Data Commons (CC BY 4.0), with descriptors calculated by RDKit.

The quiz (tab 10) has 80 questions on tabs 01 to 09. Each round draws 10 at random. Every question has a schematic, built from the same data as the lessons.

## Run locally

```
python -m http.server 8766 --directory docs
```

Open http://127.0.0.1:8766.

## Data policy

Public data only. No internal data, compounds or infrastructure. Each value used in a lesson is traceable to a published table.
