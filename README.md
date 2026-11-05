# ADME Lab

Interactive lessons on quantitative DMPK for working DMPK scientists. Every lesson uses public data and runs in the browser. A static site in `docs/`, suitable for GitHub Pages.

## Design

* The course follows the translation chain: structure, in vitro, human PK, dose, interaction risk. Each tab covers one link.
* Each tab scores a standard prediction method on a fixed set of public drugs. The scoreboard is the same on every tab: the count within 2-fold, the average fold error (geometric mean of the absolute fold difference) and the bias (geometric mean of predicted over observed).
* Steps change one assumption and show how the scoreboard moves.

## Status

Tabs 01 to 06 are the foundations, built from first principles with no term used before it is defined: exposure and effect (concentration and effect, the ADME stages, measures of exposure); amount, concentration and volume (units, apparent volume, bound and unbound drug); elimination (first-order kinetics, clearance, the intravenous profile, volume and half-life, repeat dosing, a consistency check on 667 PK records); oral dosing and bioavailability (the oral profile, bioavailability from areas, Fa x Fg x Fh); metabolism and excretion (metabolic routes, enzyme kinetics, the depletion assay, extraction, total clearance); and in vitro to in vivo (what assays measure, one drug from assay to clearance, fold error, bias and the log scale). Every tab opens with an overview, objectives, notation and data sources.

Tab 07, hepatic clearance from in vitro data, has eight steps. Source data: Obach (1999), Drug Metab Dispos 27:1350, Tables 2 and 3 (`tools/check_obach1999.py` reproduces the published accuracy values in Tables 4 and 5); the AstraZeneca in vitro DMPK deposit in ChEMBL (CHEMBL3301361, CC BY-SA 3.0) for the microsome and hepatocyte comparison; Varma et al. (2015), Pharm Res 32:3785, for the extended clearance classification system.

Tab 08, distribution, has eight steps. Source data: Obach et al. (2008), Drug Metab Dispos 36:1385, human intravenous PK for 670 drugs, via the ChEMBL deposit (CC BY-SA 3.0), joined to measured logD and pKa from the AstraZeneca deposit where available. The Oie-Tozer constants and the tissue binding equation are as stated in Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0).

Tab 09, absorption and bioavailability, has five steps. Source data: Obach (1999) for the hepatic first-pass limit; Hou et al. (2007) human intestinal absorption (578 compounds), Wang et al. (2016) Caco-2 permeability (910 compounds) and AqSolDB (Sorkun et al., 2019), all through Therapeutics Data Commons (CC BY 4.0), with descriptors calculated by RDKit.

Tab 10, drug-drug interactions, has six steps: reversible inhibition and the AUC ratio, the four definitions of inhibitor concentration, predicted against observed AUC ratio, cutoff and classification, inhibitor potency and exposure, and time-dependent inhibition and induction (equations only). Source data: Ito K, Brown HS, Houston JB (2004), Br J Clin Pharmacol 57:473, Tables 2 to 4 (open access): 190 of 193 in vivo studies of CYP3A4, CYP2D6 and CYP2C9 inhibition with observed AUC ratio, Ki and [I] / Ki; three rows with a missing inhibitor concentration are omitted. The counts at [I] / Ki of 1 follow Table 5 of that paper (CYP2C9 exactly; CYP3A4 and CYP2D6 differ because the paper used a subset).

Tab 11, transporters, has six steps: carrier-mediated and passive uptake, inhibition of uptake (IC50 and Ki), the extended clearance model, uptake inhibition and the AUC ratio, biliary clearance by ECCS class, and probe substrates and inhibitors. The model steps use slider parameters. Data: Miyake et al., J Pharmacol Exp Ther 387:135 (2023), Table 1 (ECCS class and human biliary clearance of 20 substrates); Brouwer et al., Clin Pharmacol Ther 94:95 (2013), Table 2 (open access) and the kinetic equations of its Table 3.

Tab 12, renal and biliary excretion, has four steps: filtration and net renal clearance, renal impairment and the AUC ratio, the filtration limit across 554 drugs, and the biliary share of total clearance. Source data: Obach et al. (2008) total clearance and fu (554 drugs) and, for the biliary step, total clearance of 16 substrates that also appear in Table 1 of Miyake et al., J Pharmacol Exp Ther 387:135 (2023). No per-compound renal clearance or fe data are used; the renal steps use equations and the filtration limit fu x GFR.

Tab 13, human pharmacokinetics and dose, has five steps: dose, interval and steady state; allometric scaling of clearance; the daily dose implied by clearance across 667 drugs; the dosing interval implied by half-life; and the conversion of an animal no-observed-adverse-effect level to a starting dose. Source data: Obach et al. (2008) clearance and half-life, and the body-surface-area factors and reference body weights of the FDA guidance on maximum safe starting doses (2005). The allometry step uses illustrative values for one compound, set by dragging.

Tab 14, brain penetration, has five steps: total and unbound brain exposure (Kp, logBB, Kp,uu), efflux and Kp,uu, the measured logBB of 1,058 compounds, polar surface area and penetration, and a combined property rule. Source data: B3DB, Meng et al., Sci Data 8:289 (2021), file B3DB_classification.tsv from github.com/theochem/B3DB (CC0 1.0): 7,805 of 7,807 structures parsed, labeled BBB+ or BBB-, 1,058 with a measured logBB. Molecular weight, TPSA, hydrogen-bond donors and Crippen logP were calculated with RDKit. The first two steps use equations only.

Tab 15, PBPK basics, has three steps: a flow-limited organ and its time constant, a minimal whole-body model (blood, liver, rest of body) compared with a one-compartment model of the same Vss and CL, and the effect of interindividual variability in intrinsic clearance on AUC for low- and high-extraction compounds. No data set is used; organ volumes and flows are round reference values set in the code.

Tabs 08 to 15 each open with an animated mechanism schematic (docs/js/schem.js provides the shared animation helper): binding and volume of distribution (08), the oral absorption pathway (09), enzyme competition (10), hepatocyte uptake and efflux (11), nephron handling (12), a dosing regimen and body compartments (13), the blood-brain barrier (14) and a whole-body PBPK diagram (15). Each simulation is stochastic or numerical and is displayed next to the equation it must reproduce.

The quiz (tab 16) has 138 questions on tabs 01 to 15. Each round draws 10 at random. Every question has a schematic, built from the same data as the lessons.

## Run locally

```
python -m http.server 8766 --directory docs
```

Open http://127.0.0.1:8766.

## Data policy

Public data only. No internal data, compounds or infrastructure. Each value used in a lesson is traceable to a published table.
