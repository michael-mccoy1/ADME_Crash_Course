"use strict";
/* Lesson scope, learning outcomes, notation and sources; for each step an observation and a check question with its answer. */
var GUIDE = {
  "intro": {
    "why": {
      "scope": "Drug effect depends on the concentration at the target, and absorption, distribution, metabolism and excretion (ADME) determine that concentration over time. Dose, concentration and effect are related by a concentration-effect curve, the stages of an oral dose are mapped, and the measures that summarize a concentration-time profile are defined. Tabs 02 to 06 define amount, concentration and volume, elimination, oral dosing, metabolism and excretion, and the conversion of in vitro data to predictions. Tabs 07 to 09 predict hepatic clearance, volume of distribution and absorption from public data.",
      "goals": [
        "Relate dose, concentration and effect with a concentration-effect curve.",
        "Name the stages an oral dose passes through, and the assay and quantity that go with each.",
        "Read Cmax, tmax, AUC, half-life and trough from a concentration-time profile."
      ],
      "notation": [
        [
          "C",
          "plasma concentration (mg/L)."
        ],
        [
          "EC50",
          "concentration that gives half of the maximal effect."
        ],
        [
          "Emax",
          "maximal effect."
        ],
        [
          "ADME",
          "absorption, distribution, metabolism, excretion."
        ],
        [
          "Cmax, tmax",
          "highest concentration, and the time at which it occurs."
        ],
        [
          "AUC",
          "area under the plasma concentration-time curve."
        ],
        [
          "F",
          "oral bioavailability."
        ]
      ],
      "data": [
        "No data set. The curves are calculated from the equations with the values set by the sliders."
      ]
    },
    "units": {
      "scope": "The amount of a drug, its concentration and the volume that relates them underlie every later calculation. Units and conversions are set, the apparent volume of distribution is defined and compared with body volumes for 667 drugs, and bound and unbound concentration are defined.",
      "goals": [
        "Convert between mass and molar concentrations and between per-kg and whole-body clearances.",
        "Explain the volume of distribution as an apparent volume and compare it with body volumes.",
        "Calculate the unbound concentration from the total concentration and fu."
      ],
      "notation": [
        [
          "A, C, V",
          "amount of drug in the body, concentration in plasma, and volume of distribution: C = A / V."
        ],
        [
          "MW",
          "molecular weight (g/mol)."
        ],
        [
          "fu",
          "fraction unbound in plasma."
        ],
        [
          "Cu",
          "unbound concentration, fu x C."
        ],
        [
          "Body volumes",
          "plasma 3.05 L, extracellular fluid 13.6 L and body water 40.2 L for a 70 kg adult."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385, via ChEMBL (CC BY-SA 3.0): Vss for 667 drugs and fu for 554.",
        "Body volumes from the constants of Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0)."
      ]
    },
    "elim": {
      "scope": "Elimination is treated in a one-compartment model: first-order kinetics and half-life, the definition of clearance, the intravenous profile, the dependence of half-life on volume and clearance, accumulation on repeat dosing, and a consistency check of these relations on 667 measured drugs. Distribution is treated in tab 08 and the processes that make up clearance in tab 05.",
      "goals": [
        "State what first-order elimination means and calculate the half-life from the rate constant.",
        "Define clearance and relate it to the volume and the rate constant.",
        "Calculate the half-life, the accumulation ratio and the average steady-state concentration.",
        "Check the consistency of a table of pharmacokinetic parameters."
      ],
      "notation": [
        [
          "k",
          "elimination rate constant (per hour)."
        ],
        [
          "t1/2",
          "half-life, 0.693 / k = 0.693 x V / CL."
        ],
        [
          "CL",
          "clearance: elimination rate = CL x C."
        ],
        [
          "V",
          "volume of distribution; k = CL / V."
        ],
        [
          "AUC",
          "dose / CL after an intravenous dose."
        ],
        [
          "R",
          "accumulation ratio on repeat dosing."
        ],
        [
          "MRT",
          "mean residence time, Vss / CL."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385, via ChEMBL (CC BY-SA 3.0): CL, Vss, MRT and half-life for 667 drugs (step 6)."
      ]
    },
    "oral": {
      "scope": "After oral administration a drug must be absorbed before it is eliminated. The oral profile, the measurement of bioavailability from oral and intravenous areas under the curve, and the decomposition of bioavailability into Fa, Fg and Fh are given. Tab 09 treats the hepatic limit on bioavailability, solubility and public absorption data.",
      "goals": [
        "Explain how bioavailability and the absorption rate shape the oral profile.",
        "Calculate bioavailability from oral and intravenous areas under the curve.",
        "Write bioavailability as the product Fa x Fg x Fh."
      ],
      "notation": [
        [
          "F",
          "oral bioavailability: the fraction of the dose that reaches the systemic circulation."
        ],
        [
          "ka",
          "first-order absorption rate constant."
        ],
        [
          "AUC",
          "F x dose / CL after an oral dose."
        ],
        [
          "Fa, Fg, Fh",
          "fraction absorbed, fraction escaping gut-wall metabolism, fraction escaping the liver."
        ]
      ],
      "data": [
        "No data set. The profiles are calculated from the one-compartment equations with the values set by the sliders."
      ]
    },
    "met": {
      "scope": "Metabolism and excretion are treated through metabolic routes and the in vitro systems that cover them, Michaelis-Menten kinetics and intrinsic clearance, the depletion assay and its unit conversions, organ clearance as the product of blood flow and extraction, and the addition of clearance routes. It prepares tab 07.",
      "goals": [
        "Name the main metabolic routes and say which in vitro systems measure them.",
        "Define intrinsic clearance from Vmax and Km, and state when the first-order approximation holds.",
        "Convert a depletion half-life to a scaled intrinsic clearance.",
        "Relate clearance to blood flow and extraction, and add the routes of clearance."
      ],
      "notation": [
        [
          "Vmax, Km",
          "maximal rate of an enzyme reaction, and the concentration at which the rate is half of it."
        ],
        [
          "CLint",
          "intrinsic clearance, Vmax / Km at low concentration."
        ],
        [
          "Q, E",
          "organ blood flow and extraction ratio; CL = Q x E."
        ],
        [
          "CLh, CLr",
          "hepatic and renal clearance."
        ],
        [
          "fe",
          "fraction excreted unchanged in urine, CLr / CL."
        ],
        [
          "GFR",
          "glomerular filtration rate, taken as 120 mL/min."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: chlorpromazine in vitro half-life and scaled CLint (step 3) and observed blood clearance (step 4)."
      ]
    },
    "vitro": {
      "scope": "In vitro measurements are connected to clinical quantities. Common assays and the parameters they yield are tabulated, one drug is followed from a microsomal assay value to a predicted blood clearance, and the measures used to score predictions are defined: fold error, average fold error, bias and the logarithmic scale. Tabs 07 to 09 report these measures.",
      "goals": [
        "State what each common in vitro assay measures and how its result is converted.",
        "Follow a microsomal CLint to a predicted blood clearance.",
        "Calculate the fold error, the average fold error and the bias, and explain the logarithmic scale."
      ],
      "notation": [
        [
          "Fold error",
          "predicted divided by observed, or its inverse when below 1, with a direction."
        ],
        [
          "Average fold error",
          "10 raised to the mean of the absolute log ratios. The typical size of the error."
        ],
        [
          "Bias",
          "10 raised to the mean of the log ratios. Below 1 is under-prediction."
        ],
        [
          "Within 2-fold",
          "predicted and observed differ by a factor of 2 or less."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: CLint, binding and observed clearance for 29 drugs."
      ]
    },
    "hep": {
      "scope": "Human hepatic blood clearance is predicted from the microsomal CLint of 29 drugs (Obach, 1999) and scored against intravenous clearance. Each step varies one assumption (scaling, extraction model, binding, fitted scalar, assay limit, hepatocyte data, clearance mechanism) and reports the effect on the same three measures: number within 2-fold, average fold error and bias.",
      "goals": [
        "Predict hepatic blood clearance from microsomal intrinsic clearance, and score the prediction against observed values.",
        "Apply scaling factors, binding corrections and an extraction model, and state how each changes the prediction.",
        "Identify which drugs a prediction method gets wrong, and why."
      ],
      "notation": [
        [
          "CLint",
          "intrinsic clearance: the clearance by metabolism with no limit from blood flow or binding. Scaled to the whole body it is in mL/min/kg."
        ],
        [
          "fu(blood)",
          "fraction of drug unbound in blood: the fraction unbound in plasma divided by the blood to plasma ratio."
        ],
        [
          "fu(mic)",
          "fraction of drug unbound in the microsomal incubation."
        ],
        [
          "Q",
          "hepatic blood flow, 21 mL/min/kg in the reference paper."
        ],
        [
          "CLh",
          "hepatic blood clearance."
        ],
        [
          "Average fold error",
          "geometric mean of the absolute fold difference between predicted and observed values. 1.0 is exact."
        ],
        [
          "Bias",
          "geometric mean of predicted divided by observed. Below 1 is under-prediction."
        ],
        [
          "Within 2-fold",
          "number of drugs whose predicted and observed values differ by a factor of 2 or less."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: microsomal CLint, binding and observed clearance for 29 drugs (Tables 2 and 3).",
        "AstraZeneca in vitro DMPK data in ChEMBL (CHEMBL3301361): microsome and hepatocyte CLint for 96 compounds (step 7).",
        "Varma et al. (2015), Pharm Res 32:3785: the extended clearance classification system (step 8)."
      ]
    },
    "dist": {
      "scope": "The volume of distribution at steady state (Vss) is expressed through fup and fut by the Oie-Tozer equation. Fut is not measured, so it is back-calculated from observed Vss for the drugs of Obach et al. (2008) and predicted from logD, pKa and fup. Further steps cover the dependence on ionization class, the half-life that follows from CL and Vss, the conversion between blood and plasma clearance, and the sensitivity of Vss to its inputs.",
      "goals": [
        "Divide the volume of distribution into plasma, extracellular and tissue terms with the Oie-Tozer equation.",
        "Back-calculate tissue binding from observed volumes and test a predictive equation for it, by ionization class.",
        "Propagate errors in clearance and volume to the half-life, and convert between blood and plasma clearance."
      ],
      "notation": [
        [
          "Vss",
          "volume of distribution at steady state (L/kg): amount of drug in the body divided by the plasma concentration."
        ],
        [
          "Kp",
          "ratio of the drug concentration in tissue to that in plasma (step 1)."
        ],
        [
          "Vp",
          "plasma volume, 0.0436 L/kg."
        ],
        [
          "Ve",
          "extracellular fluid volume outside plasma, 0.151 L/kg."
        ],
        [
          "Vr",
          "remaining volume the drug distributes to, 0.38 L/kg."
        ],
        [
          "Re/i",
          "ratio of binding proteins in extracellular fluid to those in plasma, 1.4."
        ],
        [
          "fup, fut",
          "fraction unbound in plasma and in tissue."
        ],
        [
          "B:P",
          "blood to plasma concentration ratio."
        ]
      ],
      "data": [
        "Obach RS, Lombardo F, Waters NJ (2008), Drug Metab Dispos 36:1385: human intravenous PK, 667 of the 670 drugs as deposited in ChEMBL (CC BY-SA 3.0).",
        "AstraZeneca measured logD and pKa in ChEMBL, available for 172 of these drugs.",
        "Coutinho et al. (2024), Pharm Res 41:1121 (CC BY 4.0): the Oie-Tozer constants and the tissue binding equation."
      ]
    },
    "abs": {
      "scope": "Oral bioavailability is treated further than in tab 04: the upper bound that hepatic clearance sets on it, the dose number and the effect of pH on solubility. Public Caco-2, absorption and solubility data test how far permeability and structural rules identify poorly absorbed compounds. Gut-wall metabolism, food effects and intestinal transporters are not covered; no public per-compound data were used for them.",
      "goals": [
        "Bound oral bioavailability with the hepatic first-pass limit.",
        "Relate dose, solubility and pH to the dose number.",
        "Score property rules for absorption against the baseline of calling every compound absorbed."
      ],
      "notation": [
        [
          "F",
          "oral bioavailability: the fraction of the dose that reaches the systemic circulation."
        ],
        [
          "Fa, Fg, Fh",
          "fraction absorbed across the intestinal membrane, fraction escaping gut-wall metabolism, fraction escaping the liver."
        ],
        [
          "CLb, Q",
          "hepatic blood clearance and hepatic blood flow. Fh = 1 - CLb / Q."
        ],
        [
          "D0",
          "dose number: dose divided by the volume of fluid and by the solubility."
        ],
        [
          "S, S0",
          "solubility at a given pH, and the intrinsic solubility of the neutral form."
        ],
        [
          "Papp",
          "apparent permeability across a cell monolayer (Caco-2), in cm/s."
        ],
        [
          "TPSA",
          "topological polar surface area (A^2)."
        ]
      ],
      "data": [
        "Obach RS (1999), Drug Metab Dispos 27:1350: observed clearance for the hepatic first-pass limit.",
        "AqSolDB (Sorkun et al., 2019), Caco-2 (Wang et al., 2016) and human intestinal absorption (Hou et al., 2007) sets from Therapeutics Data Commons (CC BY 4.0), with descriptors calculated by RDKit."
      ]
    }
  },
  "steps": {
    "why/Concentration and effect": {
      "notice": "Doubling the dose doubles the peak and extends the time above the EC50 by one half-life.",
      "q": "By how much does doubling an intravenous dose extend the time above the EC50?",
      "a": "By ln 2 / k, one half-life: C0 doubles and C then falls exponentially."
    },
    "why/Path of an oral dose": {
      "notice": "Each stage has one ADME category, one assay and one parameter.",
      "q": "Which parameter quantifies the fraction of an oral dose that escapes hepatic first-pass extraction?",
      "a": "Fh = 1 - CLh / Q."
    },
    "why/Exposure measures": {
      "notice": "Cmax, tmax, AUC, half-life and trough are read from different parts of one profile.",
      "q": "Which measure quantifies total exposure?",
      "a": "The AUC, the area under the concentration-time curve."
    },
    "units/Units and conversions": {
      "notice": "Each conversion is a fixed factor set by MW or body weight.",
      "q": "What is the relation between ng/mL and ug/L?",
      "a": "They are identical: 1 ng/mL = 1 ug/L."
    },
    "units/Amount and volume": {
      "notice": "Vss exceeds 40.2 L for 415 of 667 drugs.",
      "q": "Can V exceed the volume of the body?",
      "a": "Yes. V = A / C is an apparent volume. Tissue binding lowers C at a given A and raises V."
    },
    "units/Bound and unbound drug": {
      "notice": "At a given total concentration, Cu is proportional to fu.",
      "q": "At fu = 0.02 and C = 5 mg/L, what is Cu?",
      "a": "0.1 mg/L (Cu = fu x C)."
    },
    "elim/First-order elimination": {
      "notice": "A constant fraction, not a constant amount, is eliminated per unit time.",
      "q": "What mass of a 100 mg dose remains after three half-lives?",
      "a": "12.5 mg."
    },
    "elim/Clearance": {
      "notice": "The slope of each line is CL.",
      "q": "What is the elimination rate at C = 2 mg/L with CL = 10 L/h?",
      "a": "20 mg/h (rate = CL x C)."
    },
    "elim/Intravenous profile": {
      "notice": "On the log10 axis the profile is linear.",
      "q": "How does t1/2 change when V doubles at constant CL?",
      "a": "It doubles (t1/2 = 0.693 V / CL)."
    },
    "elim/Volume and half-life": {
      "notice": "At equal dose and CL the AUC is independent of V.",
      "q": "Why does a larger V lengthen t1/2 at constant CL?",
      "a": "The same clearance removes a smaller fraction of the amount in the body per unit time."
    },
    "elim/Repeat dosing": {
      "notice": "Css,avg depends on CL and not on V.",
      "q": "What is R when tau equals t1/2?",
      "a": "2, from R = 1 / (1 - 0.5)."
    },
    "elim/Checking a record": {
      "notice": "The calculated MRT agrees with the reported MRT, and 0.693 x MRT is below t1/2 for most drugs.",
      "q": "Why is 0.693 x MRT below the reported t1/2 for most drugs?",
      "a": "Disposition is multiphasic, and the reported t1/2 is the terminal value, which exceeds the one-compartment value."
    },
    "oral/Oral profile": {
      "notice": "The oral AUC is F times the intravenous AUC.",
      "q": "What is the oral AUC for a 100 mg dose with F = 0.4 and CL = 20 L/h?",
      "a": "2.0 mg x h/L (F x Dose / CL)."
    },
    "oral/Bioavailability from AUCs": {
      "notice": "F is the ratio of the dose-normalized AUCs.",
      "q": "An oral dose of 100 mg gives an AUC of 8 and an intravenous dose of 50 mg gives 10 mg x h/L. What is F?",
      "a": "0.4."
    },
    "oral/Bioavailability as a product": {
      "notice": "Each loss acts on the fraction remaining from the previous stage.",
      "q": "What is F when Fa, Fg and Fh are each 0.7?",
      "a": "0.34."
    },
    "met/Metabolic routes": {
      "notice": "An NADPH-supplemented microsomal incubation measures P450 oxidation only.",
      "q": "Why is aldehyde oxidase activity not measured in such an incubation?",
      "a": "The enzyme is cytosolic and absent from the microsomal fraction."
    },
    "met/Enzyme kinetics": {
      "notice": "The clearance v / S is highest at low S and falls as the enzyme saturates.",
      "q": "What is v at S = Km?",
      "a": "Vmax / 2."
    },
    "met/Depletion assay": {
      "notice": "ln(percent remaining) is linear in time with slope -k.",
      "q": "What is the scaled CLint for t1/2 = 25 min at 1 mg/mL?",
      "a": "25 mL/min/kg."
    },
    "met/Clearance and extraction": {
      "notice": "CL cannot exceed Q.",
      "q": "What is CL for Q = 21 mL/min/kg and E = 0.4?",
      "a": "8.4 mL/min/kg."
    },
    "met/Total clearance": {
      "notice": "Loss of a route that carries a fraction s of CL multiplies the AUC by 1 / (1 - s).",
      "q": "What is fe for CLh = 6 L/h and CLr = 2 L/h with no other route?",
      "a": "0.25."
    },
    "vitro/What an assay measures": {
      "notice": "Each assay yields one parameter that needs scaling or a model before it predicts an in vivo value.",
      "q": "What does a microsomal stability assay yield before scaling?",
      "a": "The in vitro half-life, converted to CLint in uL/min/mg protein."
    },
    "vitro/From assay to clearance": {
      "notice": "Each stage uses only the values of the earlier stages.",
      "q": "Which two quantities enter the extraction model?",
      "a": "The binding-corrected CLint and Q."
    },
    "vitro/Fold error": {
      "notice": "Equal fold errors above and below the observed value are equal errors on the ratio scale.",
      "q": "A prediction of 5 against an observed 20: what is the fold error?",
      "a": "A 4-fold under-prediction."
    },
    "vitro/Average fold error and bias": {
      "notice": "For the starting values the bias is 1.12 and the arithmetic mean ratio is 1.50.",
      "q": "Can the bias be 1.0 when the average fold error is 2.0?",
      "a": "Yes. Ratios of 0.5 and 2 cancel in the bias and add in the average fold error."
    },
    "vitro/Why the log scale": {
      "notice": "The 2-fold band has constant width only on logarithmic axes.",
      "q": "Why are clearances averaged as logarithms?",
      "a": "Errors are multiplicative, so fold errors above and below the observed value must carry equal weight."
    },
    "hep/Predicted against observed": {
      "notice": "Points above the identity line are over-predicted and points below it are under-predicted.",
      "q": "What does an average fold error of 2.0 mean?",
      "a": "Predictions differ from observations by a factor of 2 on average, in either direction (the geometric mean of the absolute fold difference)."
    },
    "hep/Scaling to the liver": {
      "notice": "The scaling factor that minimizes the average fold error exceeds 1 for this set.",
      "q": "What does a bias of 0.5 indicate?",
      "a": "Predictions average half the observed values: systematic under-prediction."
    },
    "hep/Extraction models": {
      "notice": "The models agree at low extraction and diverge as extraction rises.",
      "q": "When do the well-stirred and parallel-tube models give nearly equal extraction?",
      "a": "At low CL' / Q. At higher values the parallel-tube extraction rises faster toward 1."
    },
    "hep/Binding assumptions": {
      "notice": "The ranking of the three treatments differs between bases, neutrals and acids.",
      "q": "Why does fu(blood) alone worsen the predictions?",
      "a": "Measured CLint already reflects binding in the incubation. Applying fu(blood) alone lowers the prediction for highly bound drugs without correcting that."
    },
    "hep/Empirical scalars": {
      "notice": "The spread of the fitted factor increases as the fitting set shrinks.",
      "q": "Why does the spread increase?",
      "a": "The factor is estimated from fewer drugs. Of the 29, 27 are under-predicted, by up to 11-fold, and 2 are over-predicted, by up to 1.35-fold."
    },
    "hep/Low-turnover compounds": {
      "notice": "The shaded region marks losses that cannot be distinguished from assay variability.",
      "q": "Why is a prediction from a limit value an upper bound?",
      "a": "The true CLint lies below the limit, so the true predicted clearance is lower."
    },
    "hep/Microsomes against hepatocytes": {
      "notice": "Points fall on both sides of identity, and the number above it depends on the scalars.",
      "q": "What does a point above identity indicate?",
      "a": "A higher scaled clearance in hepatocytes. The cause can be an enzyme absent from the microsomal incubation, cellular uptake, binding or the scalars."
    },
    "hep/Choosing a method by class": {
      "notice": "Only classes 1A and 2 are metabolism classes.",
      "q": "Which ECCS classes can a microsomal prediction cover?",
      "a": "Classes 1A and 2. In the others the rate-determining step is hepatic uptake or renal clearance."
    },
    "dist/What Vss measures": {
      "notice": "Vss exceeds the body water volume when Kp is above 1.",
      "q": "What is Vss at Kp = 1?",
      "a": "Vp + Vt = 0.57 L/kg, about 40 L for 70 kg."
    },
    "dist/Volume from binding": {
      "notice": "Only the tissue term increases without limit as fut decreases.",
      "q": "What is Vss at fup = fut = 1?",
      "a": "0.57 L/kg (Vp + Ve + Vr)."
    },
    "dist/Implied tissue binding": {
      "notice": "Points below the fut = 1 curve imply fut above 1.",
      "q": "What does an implied fut above 1 indicate?",
      "a": "The observed Vss is below the equation value for fut = 1. The constants, the fup or the Vss do not fit that drug."
    },
    "dist/Predicting tissue binding": {
      "notice": "The average fold error and the bias differ between ionization classes.",
      "q": "Why is the equation scored by class?",
      "a": "The pooled error combines classes in which the equation performs differently."
    },
    "dist/Ionization class": {
      "notice": "The medians of Vss, fup and logD differ between groups.",
      "q": "Why is 'no pKa reported' not a neutral class?",
      "a": "A missing value can reflect no ionizable group in range, a pKa outside the range, or no measurement."
    },
    "dist/Half-life from CL and Vss": {
      "notice": "With independent errors the half-life error exceeds the error of either input.",
      "q": "Why does positive correlation of the CL and Vss errors reduce the half-life error?",
      "a": "t1/2 depends on Vss / CL, and errors in the same direction cancel in the ratio."
    },
    "dist/Blood to plasma ratio": {
      "notice": "The two comparisons differ most for drugs with the lowest B:P.",
      "q": "How is plasma clearance converted to blood clearance?",
      "a": "Divide by B:P."
    },
    "dist/Sensitivity of Vss": {
      "notice": "fup and fut dominate when tissue binding is strong.",
      "q": "What is the effect on Vss of doubling fut when the tissue term dominates?",
      "a": "Vss falls about 2-fold, because the tissue term is inversely proportional to fut."
    },
    "abs/Hepatic first-pass limit": {
      "notice": "The limit depends on CLb relative to Q and not on CLb alone.",
      "q": "What is Fh for CLb = 10.5 mL/min/kg and Q = 21 mL/min/kg?",
      "a": "0.5."
    },
    "abs/Solubility and dose": {
      "notice": "The share of compounds with D0 above 1 rises with dose and falls with volume.",
      "q": "What does a dose number above 1 indicate?",
      "a": "The dose cannot dissolve in the volume given, so dissolution can limit absorption."
    },
    "abs/pH-dependent solubility": {
      "notice": "The solubility of a base falls, and that of an acid rises, as pH increases.",
      "q": "Why can acid suppression reduce the absorption of a weak base?",
      "a": "A higher gastric pH lowers its solubility, so less dissolves in the stomach and more can reach the intestine undissolved."
    },
    "abs/Permeability descriptors": {
      "notice": "The median line decreases with TPSA and with donor count.",
      "q": "Does rho = -0.63 mean that TPSA predicts permeability closely?",
      "a": "No. It describes a tendency, and the spread at any TPSA is wide."
    },
    "abs/Property rules": {
      "notice": "Accuracy must be read against the baseline of 86.5%.",
      "q": "Why is accuracy a poor summary of a rule on this set?",
      "a": "Most compounds are well absorbed, so calling every compound good already scores 86.5%. The numbers of poor compounds caught and good compounds flagged describe the rule."
    }
  }
};
