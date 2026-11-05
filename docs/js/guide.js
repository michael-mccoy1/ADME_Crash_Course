"use strict";
/* Lesson scope, notation and sources; one observation per step. */
var GUIDE = {
  "intro": {
    "why": {
      "scope": "Effect is related to the concentration at the target by an Emax model (Emax is the maximal effect), and absorption, distribution, metabolism and excretion (ADME) determine the concentration-time course. Stages of an oral dose are classified by ADME category, assay and parameter, and the maximum concentration (Cmax), the time of the maximum (tmax), the area under the concentration-time curve (AUC), half-life and trough are defined.",
      "data": [
        "No data set. The curves are calculated from the equations with the values set by the sliders."
      ],
      "notation": [
        [
          "Emax",
          "maximal effect."
        ],
        [
          "EC50",
          "concentration giving 50 percent of the maximal effect."
        ],
        [
          "Cmax",
          "maximum plasma concentration."
        ],
        [
          "tmax",
          "time at which Cmax occurs."
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "Fa",
          "fraction of the dose absorbed."
        ],
        [
          "Fg",
          "fraction escaping gut-wall metabolism."
        ],
        [
          "Fh",
          "fraction escaping hepatic first-pass extraction."
        ],
        [
          "ka",
          "first-order absorption rate constant."
        ],
        [
          "ke",
          "first-order elimination rate constant, CL / V."
        ],
        [
          "V",
          "volume of distribution."
        ],
        [
          "F",
          "oral bioavailability."
        ]
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
        ],
        [
          "Vss",
          "volume of distribution at steady state."
        ],
        [
          "MW",
          "molecular weight."
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "V",
          "apparent volume of distribution, amount divided by concentration."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385, via ChEMBL (public database of bioactive molecules, European Bioinformatics Institute) (CC BY-SA 3.0): Vss for 667 drugs and fu for 554.",
        "Body volumes from the constants of Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0)."
      ]
    },
    "elim": {
      "scope": "One-compartment elimination: first-order kinetics, clearance (CL), the intravenous profile, half-life as a function of volume (V) and CL, accumulation on repeat dosing, and a consistency check on 667 measured drugs. Distribution is treated in tab 08 and the processes that make up clearance in tab 05.",
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385, via ChEMBL (public database of bioactive molecules, European Bioinformatics Institute) (CC BY-SA 3.0): CL, Vss, MRT and half-life for 667 drugs (step 6)."
      ],
      "notation": [
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "V",
          "volume of distribution in the one-compartment model."
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "Vss",
          "volume of distribution at steady state."
        ],
        [
          "MRT",
          "mean residence time."
        ],
        [
          "R",
          "accumulation ratio on repeat dosing, 1 / (1 - exp(-k tau))."
        ],
        [
          "F",
          "oral bioavailability."
        ]
      ]
    },
    "oral": {
      "scope": "The oral profile, bioavailability from the oral and intravenous area under the concentration-time curve (AUC), and its decomposition into the fraction absorbed (Fa), the fraction escaping gut-wall metabolism (Fg) and the fraction escaping hepatic first-pass extraction (Fh). Tab 09 treats the hepatic upper bound, solubility and public absorption data.",
      "notation": [
        [
          "Fa, Fg, Fh",
          "fraction absorbed, fraction escaping gut-wall metabolism, fraction escaping hepatic first-pass extraction."
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "F",
          "oral bioavailability, the fraction of the dose reaching the systemic circulation."
        ],
        [
          "Cmax",
          "maximum plasma concentration."
        ],
        [
          "tmax",
          "time at which Cmax occurs."
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "CLh",
          "hepatic clearance."
        ],
        [
          "ka",
          "first-order absorption rate constant."
        ],
        [
          "ke",
          "first-order elimination rate constant, CL / V."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg."
        ],
        [
          "V",
          "volume of distribution."
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
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "CLh",
          "hepatic clearance."
        ],
        [
          "CLr",
          "renal clearance."
        ],
        [
          "CLother",
          "clearance by routes other than hepatic and renal."
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "Vmax",
          "maximum rate of the enzyme or carrier."
        ],
        [
          "Km",
          "Michaelis constant, the substrate concentration at half of Vmax."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "fe",
          "fraction of the dose excreted unchanged in urine."
        ],
        [
          "Fh",
          "fraction escaping hepatic first-pass extraction."
        ],
        [
          "NADPH",
          "reduced nicotinamide adenine dinucleotide phosphate, the cofactor of cytochrome P450 reactions."
        ],
        [
          "UDP",
          "uridine diphosphate; UDP-glucuronic acid is the cofactor of glucuronidation."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg."
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
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg."
        ],
        [
          "CLint",
          "intrinsic clearance, the clearance of unbound drug by an organ with no limit from blood flow or binding."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: CLint, binding and observed clearance for 29 drugs."
      ]
    },
    "hep": {
      "scope": "Prediction of human hepatic blood clearance from the microsomal intrinsic clearance (CLint) of 29 drugs (Obach, 1999), scored against intravenous clearance. Each step varies one assumption and reports the number within 2-fold, the average fold error and the bias.",
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
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "B:P",
          "blood to plasma concentration ratio."
        ],
        [
          "MW",
          "molecular weight."
        ],
        [
          "MPPGL",
          "mg of microsomal protein per g of liver."
        ],
        [
          "ECCS",
          "extended clearance classification system, which assigns classes 1A to 4 from ionization, permeability and molecular weight."
        ],
        [
          "NADPH",
          "reduced nicotinamide adenine dinucleotide phosphate, the cofactor of cytochrome P450 reactions."
        ],
        [
          "CV",
          "coefficient of variation."
        ],
        [
          "Dn",
          "dispersion number of the dispersion model."
        ],
        [
          "ChEMBL",
          "public database of bioactive molecules maintained by the European Bioinformatics Institute."
        ],
        [
          "MDCK",
          "Madin-Darby canine kidney cells, a cell line used for permeability and transporter assays."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: microsomal CLint, binding and observed clearance for 29 drugs (Tables 2 and 3).",
        "AstraZeneca in vitro DMPK data in ChEMBL (CHEMBL3301361): microsome and hepatocyte CLint for 96 compounds (step 7).",
        "Varma et al. (2015), Pharm Res 32:3785: the extended clearance classification system (step 8)."
      ]
    },
    "dist": {
      "scope": "The volume of distribution at steady state (Vss) through the Oie-Tozer equation. The fraction unbound in tissue (fut) is back-calculated from observed Vss (Obach et al., 2008) and predicted from the distribution coefficient at pH 7.4 (logD), the acid dissociation constant (pKa) and the fraction unbound in plasma (fup). Further analyses cover ionization class, the half-life implied by clearance (CL) and Vss, blood and plasma clearance, and the sensitivity of Vss to its inputs.",
      "notation": [
        [
          "Vp, Ve, Vr",
          "plasma, extracellular (outside plasma) and residual tissue water volumes of the Oie-Tozer model: 0.0436, 0.151 and 0.38 L/kg."
        ],
        [
          "Re/i",
          "1.4, ratio of binding proteins in extracellular fluid to plasma."
        ],
        [
          "fut",
          "fraction unbound in tissue."
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "fup",
          "fraction unbound in plasma."
        ],
        [
          "logD",
          "logarithm of the octanol-water distribution coefficient at pH 7.4."
        ],
        [
          "logP",
          "logarithm of the octanol-water partition coefficient."
        ],
        [
          "pKa",
          "acid dissociation constant, as a logarithm."
        ],
        [
          "Kp",
          "tissue to plasma partition coefficient."
        ],
        [
          "B:P",
          "blood to plasma concentration ratio."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385: human intravenous PK, 667 of the 670 drugs as deposited in ChEMBL (public database of bioactive molecules, European Bioinformatics Institute) (CC BY-SA 3.0).",
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
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "CLb",
          "nonrenal blood clearance."
        ],
        [
          "Fa",
          "fraction of the dose absorbed."
        ],
        [
          "Fg",
          "fraction escaping gut-wall metabolism."
        ],
        [
          "Fh",
          "fraction escaping hepatic first-pass extraction."
        ],
        [
          "MW",
          "molecular weight."
        ],
        [
          "TPSA",
          "topological polar surface area."
        ],
        [
          "logP",
          "logarithm of the octanol-water partition coefficient."
        ],
        [
          "pKa",
          "acid dissociation constant, as a logarithm."
        ],
        [
          "S0",
          "intrinsic solubility of the neutral form."
        ],
        [
          "ROC",
          "receiver operating characteristic; the area under the ROC curve measures how well a descriptor separates two groups."
        ],
        [
          "AqSolDB",
          "aqueous solubility database."
        ],
        [
          "Caco-2",
          "human colorectal cell line used as an intestinal permeability model."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg."
        ],
        [
          "V",
          "volume of fluid in which the dose dissolves (dose number), or the volume of distribution."
        ],
        [
          "F",
          "oral bioavailability."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: observed clearance for the hepatic first-pass limit.",
        "AqSolDB (Sorkun et al., 2019), Caco-2 (Wang et al., 2016) and human intestinal absorption (Hou et al., 2007) sets from Therapeutics Data Commons (CC BY 4.0), with descriptors calculated by RDKit."
      ]
    },
    "ddi": {
      "scope": "Static prediction of the substrate area under the curve (AUC) ratio from [I] / Ki for reversible inhibition, four definitions of the inhibitor concentration, and their performance against 190 in vivo studies of inhibition of the cytochrome P450 (CYP) enzymes CYP3A4, CYP2D6 and CYP2C9. Time-dependent inhibition and induction are given as equations only. Transporter-mediated interactions and dynamic (physiologically based) models are not covered.",
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
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "CYP",
          "cytochrome P450, a family of metabolizing enzymes; CYP3A4, CYP2D6 and CYP2C9 are individual enzymes."
        ],
        [
          "KI",
          "inhibitor concentration giving half of the maximal inactivation rate, kinact."
        ],
        [
          "kinact",
          "maximum inactivation rate constant."
        ],
        [
          "kobs",
          "observed inactivation rate constant, kinact [I] / (KI + [I])."
        ],
        [
          "kdeg",
          "enzyme degradation rate constant."
        ],
        [
          "EC50",
          "concentration giving 50 percent of the maximal effect."
        ],
        [
          "Emax",
          "maximal effect."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "Fa",
          "fraction of the dose absorbed."
        ],
        [
          "ka",
          "first-order absorption rate constant."
        ],
        [
          "Qh",
          "hepatic blood flow, 21 mL/min/kg unless set."
        ],
        [
          "MW",
          "molecular weight."
        ],
        [
          "F",
          "oral bioavailability; CL/F is the oral clearance."
        ]
      ],
      "data": [
        "Ito K, Brown HS, Houston JB (2004), Br J Clin Pharmacol 57:473: AUC ratio, Ki and [I] / Ki for 190 of 193 in vivo studies (Tables 2 to 4; open access). Three studies with a missing inhibitor concentration are omitted."
      ]
    },
    "tp": {
      "scope": "Carrier-mediated and passive uptake, the inhibition constant from the concentration giving half-maximal inhibition (IC50), the extended clearance model for hepatic uptake, the effect of uptake inhibition on the hepatic clearance ratio, and public data on biliary clearance by class of the extended clearance classification system (ECCS) and on recommended probe substrates and inhibitors. The model steps use parameters set by the sliders, and no transporter kinetic database is analyzed. Renal transport and uptake into other tissues are not covered.",
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
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "CLint",
          "intrinsic clearance, the clearance of unbound drug by an organ with no limit from blood flow or binding."
        ],
        [
          "CLh",
          "hepatic clearance."
        ],
        [
          "CLmet",
          "intrinsic clearance by metabolism in the hepatocyte."
        ],
        [
          "CLbile",
          "biliary clearance."
        ],
        [
          "Vmax",
          "maximum rate of the enzyme or carrier."
        ],
        [
          "Km",
          "Michaelis constant, the substrate concentration at half of Vmax."
        ],
        [
          "Ki",
          "reversible inhibition constant."
        ],
        [
          "IC50",
          "inhibitor concentration giving 50 percent inhibition."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg."
        ],
        [
          "Qh",
          "hepatic blood flow, 21 mL/min/kg unless set."
        ],
        [
          "Pdif",
          "passive diffusion clearance."
        ],
        [
          "Iu",
          "unbound inhibitor concentration."
        ],
        [
          "R",
          "ratio 1 + Iu / Ki that predicts the clearance ratio at uptake-limited clearance."
        ],
        [
          "OATP",
          "organic anion-transporting polypeptide; OAT is organic anion transporter and OCT is organic cation transporter."
        ],
        [
          "MATE",
          "multidrug and toxin extrusion protein."
        ],
        [
          "MRP",
          "multidrug resistance-associated protein."
        ],
        [
          "P-gp",
          "P-glycoprotein."
        ],
        [
          "BCRP",
          "breast cancer resistance protein."
        ],
        [
          "MDCK, CHO, HEK293",
          "cell lines used for transporter assays: Madin-Darby canine kidney, Chinese hamster ovary and human embryonic kidney 293."
        ],
        [
          "fu,b",
          "fraction unbound in blood."
        ]
      ],
      "data": [
        "Miyake et al., J Pharmacol Exp Ther 387:135 (2023), Table 1: ECCS class and human biliary clearance of 20 substrates, as collected there from the Drug Interaction Database and the literature.",
        "Brouwer KLR et al., Clin Pharmacol Ther 94:95 (2013), Table 2: recommended probe substrates, inhibitors and potential clinical probes for each transporter (open access)."
      ]
    },
    "rn": {
      "scope": "Renal clearance as filtration plus net tubular transport, the effect of renal impairment on the area under the curve (AUC) ratio, a filtration limit applied to 554 drugs, and the biliary share of total clearance for 16 substrates. No public per-compound renal clearance data were used, so renal excretion is analyzed through the filtration limit and the equations only. Transporter identity is covered in tab 11.",
      "notation": [
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "GFR",
          "glomerular filtration rate, 120 mL/min for a 70 kg adult or about 1.8 mL/min/kg."
        ],
        [
          "fe",
          "fraction of the dose excreted unchanged in urine."
        ],
        [
          "KF",
          "renal function relative to normal, GFR / normal GFR."
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "AUCR",
          "ratio of the substrate AUC with and without the perpetrator or with and without impairment."
        ],
        [
          "CL",
          "clearance, the volume of plasma cleared of drug per unit time."
        ],
        [
          "CLr",
          "renal clearance."
        ],
        [
          "CLbile",
          "biliary clearance."
        ],
        [
          "CLsec",
          "secretory clearance in the kidney tubule."
        ],
        [
          "ECCS",
          "extended clearance classification system, which assigns classes 1A to 4 from ionization, permeability and molecular weight."
        ],
        [
          "Q",
          "dose adjustment factor, 1 - fe (1 - KF)."
        ]
      ],
      "data": [
        "Obach et al. (2008), Drug Metab Dispos 36:1385, via ChEMBL (public database of bioactive molecules, European Bioinformatics Institute) (CC BY-SA 3.0): total clearance and fu of 554 drugs (step 3) and total clearance of 16 substrates (step 4).",
        "Miyake et al., J Pharmacol Exp Ther 387:135 (2023), Table 1: human biliary clearance of 16 substrates that also have a total clearance in the Obach set."
      ]
    },
    "dose": {
        "scope": "Repeat oral dosing to steady state with the average steady-state concentration (Css,avg), the allometric scaling of clearance from animal species to humans, the daily dose and dosing interval implied by the clearance and half-life of 667 drugs, and the conversion of an animal no-observed-adverse-effect level (NOAEL) to a human starting dose. Dose-dependent kinetics, pharmacodynamic models and physiologically based pharmacokinetic (PBPK) models are not covered.",
        "notation": [
              [
                    "Css,avg",
                    "average steady-state plasma concentration, F x dose / (CL x tau)."
              ],
              [
                    "Cmax,ss, Cmin,ss",
                    "maximum and minimum plasma concentration within a dosing interval at steady state."
              ],
              [
                    "tau",
                    "dosing interval."
              ],
              [
                    "CL",
                    "clearance, the volume of plasma cleared of drug per unit time."
              ],
              [
                    "V",
                    "volume of distribution."
              ],
              [
                    "F",
                    "oral bioavailability, the fraction of the dose reaching the systemic circulation."
              ],
              [
                    "ka",
                    "first-order absorption rate constant."
              ],
              [
                    "R",
                    "accumulation ratio on repeat dosing, 1 / (1 - exp(-k tau))."
              ],
              [
                    "W, a, b",
                    "body weight, allometric coefficient and exponent in CL = a W^b."
              ],
              [
                    "NOAEL",
                    "no-observed-adverse-effect level, the highest animal dose without adverse findings."
              ],
              [
                    "HED",
                    "human equivalent dose, the human dose with the same body-surface-area-normalized exposure as the animal dose."
              ],
              [
                    "Surface-area factor",
                    "conversion factor of the FDA guidance between dose per kg and dose per body surface area: 3 for mouse, 6 for rat, 12 for rabbit and monkey, 20 for dog and 37 for human."
              ]
        ],
        "data": [
              "Obach et al. (2008), Drug Metab Dispos 36:1385, via ChEMBL (public database of bioactive molecules, European Bioinformatics Institute; CC BY-SA 3.0): clearance and half-life of 667 drugs.",
              "FDA (2005), Estimating the Maximum Safe Starting Dose in Initial Clinical Trials for Therapeutics in Adult Healthy Volunteers: surface-area factors and reference body weights."
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
    },
    "rn/Filtration and net renal clearance": {
      "notice": "A renal clearance above fu x GFR requires net secretion, and one below it requires net reabsorption."
    },
    "rn/Renal impairment and AUC ratio": {
      "notice": "The dose adjustment factor 1 - fe (1 - KF) equals the inverse of the AUC ratio."
    },
    "rn/Filtration limit across drugs": {
      "notice": "At a GFR of 1.8 mL/min/kg, 40 of the 554 drugs have a total clearance below fu x GFR."
    },
    "rn/Biliary share of clearance": {
      "notice": "Valsartan has the largest biliary share, 0.88 of total clearance, among the 16 substrates."
    },
    "dose/Dose and steady state": {
      "notice": "Css,avg depends on dose, F, CL and tau, and not on V or ka."
    },
    "dose/Allometric scaling": {
      "notice": "With an exponent below 1, clearance per kg is lower in the larger species."
    },
    "dose/Daily dose from clearance": {
      "notice": "At a Css,avg of 1 mg/L, 170 of the 667 drugs would need more than 1 g/day."
    },
    "dose/Half-life and dosing interval": {
      "notice": "A 12 h interval exceeds the half-life of 513 of the 667 drugs."
    },
    "dose/Starting dose from animal data": {
      "notice": "The human equivalent dose from a rat NOAEL is 6 / 37, or 0.16, of the rat dose."
    }
  }
};
