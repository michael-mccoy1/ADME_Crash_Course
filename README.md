# ADME Crash Course

Interactive lessons on quantitative DMPK for working DMPK scientists. Every lesson uses public data and runs in the browser. A static site in `docs/`, suitable for GitHub Pages.

## Design

* The course follows the translation chain: structure, in vitro, human PK, dose, interaction risk. Each tab covers one link.
* Each tab scores a standard prediction method on a fixed set of public drugs. The scoreboard is the same on every tab: the count within 2-fold, the average fold error (geometric mean of the absolute fold difference) and the bias (geometric mean of predicted over observed).
* Steps change one assumption and show how the scoreboard moves.

## Status

Tab 01, hepatic clearance from in vitro data, has eight steps. Source data: Obach (1999), Drug Metab Dispos 27:1350, Tables 2 and 3 (`tools/check_obach1999.py` reproduces the published accuracy values in Tables 4 and 5); the AstraZeneca in vitro DMPK deposit in ChEMBL (CHEMBL3301361, CC BY-SA 3.0) for the microsome and hepatocyte comparison; Varma et al. (2015), Pharm Res 32:3785, for the extended clearance classification system.

## Run locally

```
python -m http.server 8766 --directory docs
```

Open http://127.0.0.1:8766.

## Data policy

Public data only. No internal data, compounds or infrastructure. Each value used in a lesson is traceable to a published table.
