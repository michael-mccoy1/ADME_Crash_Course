# ADME Crash Course

Interactive lessons on quantitative DMPK for working DMPK scientists. Every lesson uses public data and runs in the browser. A static site in `docs/`, suitable for GitHub Pages.

## Design

* The course follows the translation chain: structure, in vitro, human PK, dose, interaction risk. Each tab covers one link.
* Each tab scores a standard prediction method on a fixed set of public drugs. The scoreboard is the same on every tab: the count within 2-fold, the average fold error (geometric mean of the absolute fold difference) and the bias (geometric mean of predicted over observed).
* Steps change one assumption and show how the scoreboard moves.

## Status

Tabs 01 to 03 are the foundations. Tab 01, the path of a drug, covers the stages of ADME and the concentration-time profile after intravenous and oral doses (3 steps). Tab 02, pharmacokinetic parameters, covers clearance and extraction, volume and half-life, repeat dosing and a check of real PK records (4 steps). Tab 03, scoring predictions, introduces fold error, average fold error, bias and the logarithmic scale (3 steps). Each tab opens with an overview, objectives, notation and data sources.

Tab 04, hepatic clearance from in vitro data, has nine steps. Source data: Obach (1999), Drug Metab Dispos 27:1350, Tables 2 and 3 (`tools/check_obach1999.py` reproduces the published accuracy values in Tables 4 and 5); the AstraZeneca in vitro DMPK deposit in ChEMBL (CHEMBL3301361, CC BY-SA 3.0) for the microsome and hepatocyte comparison; Varma et al. (2015), Pharm Res 32:3785, for the extended clearance classification system.

Tab 05, distribution, has eight steps. Source data: Obach et al. (2008), Drug Metab Dispos 36:1385, human intravenous PK for 670 drugs, via the ChEMBL deposit (CC BY-SA 3.0), joined to measured logD and pKa from the AstraZeneca deposit where available. The Oie-Tozer constants and the tissue binding equation are as stated in Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0).

Tab 06, absorption and bioavailability, has six steps. Source data: Obach (1999) for the hepatic first-pass limit; Hou et al. (2007) human intestinal absorption (578 compounds), Wang et al. (2016) Caco-2 permeability (910 compounds) and AqSolDB (Sorkun et al., 2019), all through Therapeutics Data Commons (CC BY 4.0), with descriptors calculated by RDKit.

The quiz (tab 07) has 64 questions on tabs 01 to 06. Each round draws 10 at random. Every question has a schematic, built from the same data as the lessons.

## Run locally

```
python -m http.server 8766 --directory docs
```

Open http://127.0.0.1:8766.

## Data policy

Public data only. No internal data, compounds or infrastructure. Each value used in a lesson is traceable to a published table.
