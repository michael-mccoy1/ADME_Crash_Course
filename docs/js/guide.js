"use strict";
/* Lesson scope, notation and sources; one observation per step. */
var GUIDE = {
  "intro": {
    "why": {
      "scope": "Effect is related to the concentration at the target by an Emax model, and absorption, distribution, metabolism and excretion (ADME) determine the concentration-time course. Stages of an oral dose are classified by ADME category, assay and parameter, and Cmax, tmax, AUC, half-life and trough are defined.",
      "data": [
        "No data set. The curves are calculated from the equations with the values set by the sliders."
      ]
    },
    "units": {
      "scope": "Units and conversions; the apparent volume of distribution compared with body volumes for 667 drugs; bound and unbound concentration.",
      "notation": [
        [
          "Body volumes",
          "plasma 3.05 L, extracellular fluid 13.6 L, body water 40.2 L (70 kg adult)."
        ],
        [
          "Cu",
          "unbound concentration, fu x C."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385, via ChEMBL (CC BY-SA 3.0): Vss for 667 drugs and fu for 554.",
        "Body volumes from the constants of Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0)."
      ]
    },
    "elim": {
      "scope": "One-compartment elimination: first-order kinetics, clearance, the intravenous profile, half-life as a function of V and CL, accumulation on repeat dosing, and a consistency check on 667 measured drugs. Distribution is treated in tab 08 and the processes that make up clearance in tab 05.",
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385, via ChEMBL (CC BY-SA 3.0): CL, Vss, MRT and half-life for 667 drugs (step 6)."
      ]
    },
    "oral": {
      "scope": "The oral profile, bioavailability from oral and intravenous AUC, and its decomposition into Fa, Fg and Fh. Tab 09 treats the hepatic upper bound, solubility and public absorption data.",
      "notation": [
        [
          "Fa, Fg, Fh",
          "fraction absorbed, fraction escaping gut-wall metabolism, fraction escaping hepatic first-pass extraction."
        ]
      ],
      "data": [
        "No data set. The profiles are calculated from the one-compartment equations with the values set by the sliders."
      ]
    },
    "met": {
      "scope": "Metabolic routes and the in vitro systems that cover them, Michaelis-Menten kinetics and intrinsic clearance, the depletion assay and its unit conversions, organ clearance as blood flow times extraction, and the addition of clearance routes.",
      "notation": [
        [
          "CLint",
          "Vmax / Km at low S; uL/min/mg protein, scaled to mL/min/kg with 45 mg/g and 20 g/kg."
        ],
        [
          "GFR",
          "120 mL/min."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: chlorpromazine in vitro half-life and scaled CLint (step 3) and observed blood clearance (step 4)."
      ]
    },
    "vitro": {
      "scope": "In vitro assays and the parameters they yield; one drug from assay value to predicted blood clearance; the scoring measures used in tabs 07 to 09: fold error, average fold error, bias and the logarithmic scale.",
      "notation": [
        [
          "Fold error",
          "predicted / observed, or its inverse below 1, with direction."
        ],
        [
          "Average fold error",
          "10^mean(|log10 r|)."
        ],
        [
          "Bias",
          "10^mean(log10 r); below 1 is under-prediction."
        ],
        [
          "Within 2-fold",
          "0.5 <= predicted / observed <= 2."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: CLint, binding and observed clearance for 29 drugs."
      ]
    },
    "hep": {
      "scope": "Prediction of human hepatic blood clearance from the microsomal CLint of 29 drugs (Obach, 1999), scored against intravenous clearance. Each step varies one assumption and reports the number within 2-fold, the average fold error and the bias.",
      "notation": [
        [
          "fu(blood)",
          "fu(plasma) / B:P."
        ],
        [
          "fu(mic)",
          "fraction unbound in the microsomal incubation."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg."
        ],
        [
          "CL'",
          "binding-corrected CLint, fu(blood) x CLint / fu(mic)."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: microsomal CLint, binding and observed clearance for 29 drugs (Tables 2 and 3).",
        "AstraZeneca in vitro DMPK data in ChEMBL (CHEMBL3301361): microsome and hepatocyte CLint for 96 compounds (step 7).",
        "Varma et al. (2015), Pharm Res 32:3785: the extended clearance classification system (step 8)."
      ]
    },
    "dist": {
      "scope": "Vss through the Oie-Tozer equation. fut is back-calculated from observed Vss (Obach et al., 2008) and predicted from logD, pKa and fup. Further analyses cover ionization class, the half-life implied by CL and Vss, blood and plasma clearance, and the sensitivity of Vss to its inputs.",
      "notation": [
        [
          "Vp, Ve, Vr",
          "0.0436, 0.151 and 0.38 L/kg (Oie-Tozer)."
        ],
        [
          "Re/i",
          "1.4, ratio of binding proteins in extracellular fluid to plasma."
        ],
        [
          "fut",
          "fraction unbound in tissue."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385: human intravenous PK, 667 of the 670 drugs as deposited in ChEMBL (CC BY-SA 3.0).",
        "AstraZeneca measured logD and pKa in ChEMBL, available for 172 of these drugs.",
        "Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0): the Oie-Tozer constants and the tissue binding equation."
      ]
    },
    "abs": {
      "scope": "The hepatic upper bound on oral bioavailability, the dose number and pH-dependent solubility, and public Caco-2, absorption and solubility data that test permeability and structural rules. Gut-wall metabolism, food effects and intestinal transporters are not covered.",
      "notation": [
        [
          "D0",
          "dose number, (dose / volume) / S."
        ],
        [
          "Papp",
          "apparent permeability, cm/s."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: observed clearance for the hepatic first-pass limit.",
        "AqSolDB (Sorkun et al., 2019), Caco-2 (Wang et al., 2016) and human intestinal absorption (Hou et al., 2007) sets from Therapeutics Data Commons (CC BY 4.0), with descriptors calculated by RDKit."
      ]
    },
    "ddi": {
        "scope": "Static prediction of the substrate AUC ratio from [I] / Ki for reversible inhibition, four definitions of the inhibitor concentration, and their performance against 190 in vivo studies of CYP3A4, CYP2D6 and CYP2C9 inhibition. Time-dependent inhibition and induction are given as equations only. Transporter-mediated interactions and dynamic (physiologically based) models are not covered.",
        "notation": [
              [
                    "AUCR",
                    "ratio of the substrate AUC with and without the perpetrator."
              ],
              [
                    "fm",
                    "fraction of the substrate clearance through the inhibited enzyme."
              ],
              [
                    "[I]",
                    "inhibitor concentration: [I]av, [I]av,u, [I]max or [I]in (step 2)."
              ],
              [
                    "Ki",
                    "reversible inhibition constant, uM."
              ]
        ],
        "data": [
              "Ito K, Brown HS, Houston JB (2004), Br J Clin Pharmacol 57:473: AUC ratio, Ki and [I] / Ki for 190 of 193 in vivo studies (Tables 2 to 4; open access). Three studies with a missing inhibitor concentration are omitted."
        ]
  },
    "tp": {
        "scope": "Carrier-mediated and passive uptake, the inhibition constant from an IC50, the extended clearance model for hepatic uptake, the effect of uptake inhibition on the hepatic clearance ratio, and public data on biliary clearance by ECCS class and on recommended probe substrates and inhibitors. The model steps use parameters set by the sliders, and no transporter kinetic database is analyzed. Renal transport and uptake into other tissues are not covered.",
        "notation": [
              [
                    "PSinf",
                    "sinusoidal uptake clearance into hepatocytes."
              ],
              [
                    "PSeff",
                    "efflux clearance from hepatocytes back to blood."
              ],
              [
                    "PSint",
                    "intracellular elimination clearance, CLmet + CLbile."
              ],
              [
                    "ECCS",
                    "extended clearance classification system (tab 07, step 8)."
              ]
        ],
        "data": [
              "Miyake et al., J Pharmacol Exp Ther 387:135 (2023), Table 1: ECCS class and human biliary clearance of 20 substrates, as collected there from the Drug Interaction Database and the literature.",
              "Brouwer KLR et al., Clin Pharmacol Ther 94:95 (2013), Table 2: recommended probe substrates, inhibitors and potential clinical probes for each transporter (open access)."
        ]
  }
  },
  "steps": {
    "why/Concentration and effect": {
      "notice": "Doubling the dose doubles the peak and extends the time above the EC50 by one half-life."
    },
    "why/Path of an oral dose": {
      "notice": "Each stage has one ADME category, one assay and one parameter."
    },
    "why/Exposure measures": {
      "notice": "Cmax, tmax, AUC, half-life and trough are read from different parts of one profile."
    },
    "units/Units and conversions": {
      "notice": "Each conversion is a fixed factor set by MW or body weight."
    },
    "units/Amount and volume": {
      "notice": "Vss exceeds 40.2 L for 415 of 667 drugs."
    },
    "units/Bound and unbound drug": {
      "notice": "At a given total concentration, Cu is proportional to fu."
    },
    "elim/First-order elimination": {
      "notice": "A constant fraction, not a constant amount, is eliminated per unit time."
    },
    "elim/Clearance": {
      "notice": "The slope of each line is CL."
    },
    "elim/Intravenous profile": {
      "notice": "On the log10 axis the profile is linear."
    },
    "elim/Volume and half-life": {
      "notice": "At equal dose and CL the AUC is independent of V."
    },
    "elim/Repeat dosing": {
      "notice": "Css,avg depends on CL and not on V."
    },
    "elim/Checking a record": {
      "notice": "The calculated MRT agrees with the reported MRT, and 0.693 x MRT is below t1/2 for most drugs."
    },
    "oral/Oral profile": {
      "notice": "The oral AUC is F times the intravenous AUC."
    },
    "oral/Bioavailability from AUCs": {
      "notice": "F is the ratio of the dose-normalized AUCs."
    },
    "oral/Bioavailability as a product": {
      "notice": "Each loss acts on the fraction remaining from the previous stage."
    },
    "met/Metabolic routes": {
      "notice": "An NADPH-supplemented microsomal incubation measures P450 oxidation only."
    },
    "met/Enzyme kinetics": {
      "notice": "The clearance v / S is highest at low S and falls as the enzyme saturates."
    },
    "met/Depletion assay": {
      "notice": "ln(percent remaining) is linear in time with slope -k."
    },
    "met/Clearance and extraction": {
      "notice": "CL cannot exceed Q."
    },
    "met/Total clearance": {
      "notice": "Loss of a route that carries a fraction s of CL multiplies the AUC by 1 / (1 - s)."
    },
    "vitro/What an assay measures": {
      "notice": "Each assay yields one parameter that needs scaling or a model before it predicts an in vivo value."
    },
    "vitro/From assay to clearance": {
      "notice": "Each stage uses only the values of the earlier stages."
    },
    "vitro/Fold error": {
      "notice": "Equal fold errors above and below the observed value are equal errors on the ratio scale."
    },
    "vitro/Average fold error and bias": {
      "notice": "For the starting values the bias is 1.12 and the arithmetic mean ratio is 1.50."
    },
    "vitro/Why the log scale": {
      "notice": "The 2-fold band has constant width only on logarithmic axes."
    },
    "hep/Predicted against observed": {
      "notice": "Points above the identity line are over-predicted and points below it are under-predicted."
    },
    "hep/Scaling to the liver": {
      "notice": "The scaling factor that minimizes the average fold error exceeds 1 for this set."
    },
    "hep/Extraction models": {
      "notice": "The models agree at low extraction and diverge as extraction rises."
    },
    "hep/Binding assumptions": {
      "notice": "The ranking of the three treatments differs between bases, neutrals and acids."
    },
    "hep/Empirical scalars": {
      "notice": "The spread of the fitted factor increases as the fitting set shrinks."
    },
    "hep/Low-turnover compounds": {
      "notice": "The shaded region marks losses that cannot be distinguished from assay variability."
    },
    "hep/Microsomes against hepatocytes": {
      "notice": "Points fall on both sides of identity, and the number above it depends on the scalars."
    },
    "hep/Choosing a method by class": {
      "notice": "Only classes 1A and 2 are metabolism classes."
    },
    "dist/What Vss measures": {
      "notice": "Vss exceeds the body water volume when Kp is above 1."
    },
    "dist/Volume from binding": {
      "notice": "Only the tissue term increases without limit as fut decreases."
    },
    "dist/Implied tissue binding": {
      "notice": "Points below the fut = 1 curve imply fut above 1."
    },
    "dist/Predicting tissue binding": {
      "notice": "The average fold error and the bias differ between ionization classes."
    },
    "dist/Ionization class": {
      "notice": "The medians of Vss, fup and logD differ between groups."
    },
    "dist/Half-life from CL and Vss": {
      "notice": "With independent errors the half-life error exceeds the error of either input."
    },
    "dist/Blood to plasma ratio": {
      "notice": "The two comparisons differ most for drugs with the lowest B:P."
    },
    "dist/Sensitivity of Vss": {
      "notice": "fup and fut dominate when tissue binding is strong."
    },
    "abs/Hepatic first-pass limit": {
      "notice": "The limit depends on CLb relative to Q and not on CLb alone."
    },
    "abs/Solubility and dose": {
      "notice": "The share of compounds with D0 above 1 rises with dose and falls with volume."
    },
    "abs/pH-dependent solubility": {
      "notice": "The solubility of a base falls, and that of an acid rises, as pH increases."
    },
    "abs/Permeability descriptors": {
      "notice": "The median line decreases with TPSA and with donor count."
    },
    "abs/Property rules": {
      "notice": "Accuracy must be read against the baseline of 86.5%."
    },
    "ddi/Reversible inhibition": {
      "notice": "At fm = 0.9 the AUC ratio cannot exceed 10, however large [I] / Ki becomes."
    },
    "ddi/Inhibitor concentration": {
      "notice": "[I]in exceeds [I]max in 188 of the 190 studies, and [I]av,u is [I]av multiplied by fu."
    },
    "ddi/Predicted against observed AUC ratio": {
      "notice": "At [I] / Ki of 1 or more, [I]in identifies 65 of the 93 studies with an AUC ratio of 2 or more and [I]av,u identifies 9."
    },
    "ddi/Cutoff and classification": {
      "notice": "Lowering the cutoff on [I]in / Ki from 1 to 0.1 raises false positives from 46 to 90 of 97."
    },
    "ddi/Inhibitor potency and exposure": {
      "notice": "28 studies with an AUC ratio of 2 or more have [I]in / Ki below 1."
    },
    "ddi/Time-dependent inhibition and induction": {
      "notice": "Induction lowers the AUC ratio below 1, so the combined curve can cross 1 as [I] increases."
    },
    "tp/Carrier-mediated uptake": {
      "notice": "Below Km the carrier-mediated uptake is linear in concentration with slope Vmax / Km, and above Km it saturates at Vmax."
    },
    "tp/Inhibition of uptake": {
      "notice": "At a substrate concentration equal to Km, the IC50 is twice the Ki."
    },
    "tp/Extended clearance model": {
      "notice": "Hepatic clearance cannot exceed the uptake-limited ceiling or the blood flow."
    },
    "tp/Uptake inhibition and AUC ratio": {
      "notice": "The clearance ratio equals 1 + Iu / Ki only when uptake limits clearance and clearance is well below blood flow."
    },
    "tp/ECCS class and biliary clearance": {
      "notice": "Biliary clearance within class 3B spans 0.001 to 5.85 mL/min/kg, a 5850-fold range."
    },
    "tp/Probe substrates and inhibitors": {
      "notice": "Cyclosporin A, MK-571 and verapamil are each listed as inhibitors for four transporters."
    }
  }
};
