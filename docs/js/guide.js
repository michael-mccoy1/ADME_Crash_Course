"use strict";
/* Lesson overviews, objectives, notation and sources; what to notice in each step; and a pop quiz question with a hidden answer. */
var GUIDE = {
  "intro": {
    "why": {
      "overview": [
        "This course predicts how much of a drug reaches its target and for how long. This tab starts from the reason: the effect of a drug depends on its concentration at the target, and ADME determines that concentration. The first step links dose, concentration and effect. The second maps the stages a dose passes through. The third names the numbers that summarize a concentration-time profile.",
        "The tabs that follow take the concepts in order. Tab 02 sets out amount, concentration and volume. Tab 03 covers elimination. Tab 04 covers getting a drug in. Tab 05 covers metabolism and excretion. Tab 06 shows how in vitro assays are turned into predictions and how predictions are scored. Tabs 07 to 09 then predict hepatic clearance, volume of distribution and absorption from public data."
      ],
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
      "overview": [
        "This tab sets out the three quantities that every later tab uses: the amount of drug, its concentration and the volume that relates them. Step 1 gives the units and the conversions between them. Step 2 shows the volume of distribution as the ratio of an amount to a concentration, and compares real drugs with the volumes of the body. Step 3 separates the drug in plasma into bound and unbound parts, because only the unbound drug is available in the models used here.",
        "The values come from the Obach et al. (2008) data set of human intravenous pharmacokinetics."
      ],
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
      "overview": [
        "This tab covers how the body removes a drug. Step 1 starts with first-order elimination, in which the rate of removal is proportional to the amount present, and derives the half-life. Step 2 defines clearance from the same relation, written in terms of concentration. Steps 3 and 4 give the intravenous profile and show how volume and clearance together set the half-life. Step 5 gives repeat dosing, in which the drug accumulates until elimination matches the dose. Step 6 checks the relations against 667 measured drugs.",
        "The model is a single well-mixed compartment. Distribution is treated in tab 08, and the processes that make up clearance are treated in tab 05."
      ],
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
      "overview": [
        "This tab covers dosing by mouth. After an oral dose the drug has to be absorbed before it can be eliminated, so the profile is lower and later than after an intravenous dose, and not all of the dose may arrive. Step 1 gives the oral profile and its dependence on bioavailability and the absorption rate. Step 2 shows how bioavailability is measured from the areas under the curve after oral and intravenous doses. Step 3 divides bioavailability into the fractions absorbed, escaping the gut wall and escaping the liver.",
        "Tab 09 treats absorption in more detail: the hepatic limit on bioavailability, solubility and the public absorption data."
      ],
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
      "overview": [
        "This tab covers the two main routes by which the body removes a drug: metabolism and excretion. Step 1 names the metabolic routes, the enzymes and the in vitro systems that cover them. Step 2 gives the enzyme kinetics that define intrinsic clearance. Step 3 shows how a depletion assay yields it, with the unit conversions. Step 4 relates organ clearance to blood flow and extraction. Step 5 adds the routes together and shows how renal clearance is judged.",
        "These steps prepare tab 07, which predicts hepatic clearance from microsomal data."
      ],
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
      "overview": [
        "This tab connects the laboratory to the clinic. Step 1 lists common in vitro assays, the parameter each yields and how it is linked to a clinical quantity. Step 2 carries one drug through the whole chain, from a microsomal assay value to a predicted blood clearance, one stage at a time. Steps 3 to 5 introduce the numbers used to score a prediction: the fold error, the average fold error and bias, and the reason for the logarithmic scale.",
        "Tabs 07 to 09 report these numbers wherever a prediction is compared with data."
      ],
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
      "overview": [
        "This tab follows one prediction from a microsomal stability assay to a human hepatic blood clearance. A depletion assay gives the intrinsic clearance of a drug in liver microsomes. Scaling that value to the whole liver, correcting it for binding and passing it through a model of hepatic extraction gives a predicted blood clearance. The prediction can be compared with the clearance observed after intravenous dosing.",
        "The comparison set is 29 drugs for which Obach (1999) measured microsomal CLint and for which intravenous clearance has been published. Each step changes one assumption and reports the effect on the same three numbers, which makes the effects comparable. Tab 06 followed one drug through the calculation. Steps 1 to 4 set up the scoreboard, the scaling, the extraction models and the binding terms. Steps 5 to 8 test the method: a fitted scalar, the assay detection limit, the comparison with hepatocytes, and the clearance mechanisms that a microsomal assay does not cover."
      ],
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
      "overview": [
        "This tab covers the volume of distribution at steady state, Vss: the amount of drug in the body divided by the plasma concentration. A drug that binds to tissue has a Vss larger than the water volume of the body. A drug that binds mainly to plasma proteins has a small one. Step 1 shows what Vss measures with a two-term example.",
        "The Oie-Tozer equation divides Vss into plasma, extracellular and tissue terms. It needs two inputs for each drug: the fraction unbound in plasma (fup) and in tissue (fut). The first is measured. The second is not, so it is back-calculated from an observed Vss or predicted. Steps 2 and 3 introduce the terms and back-calculate fut for the Obach (2008) drugs. Steps 4 and 5 predict fut and group the drugs by ionization class. Steps 6 and 7 cover the half-life that follows from clearance and Vss, and the conversion between blood and plasma clearance. Step 8 gives the sensitivity of the prediction to each input."
      ],
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
      "overview": [
        "This tab covers oral bioavailability, F, in more detail than tab 04. F is the product of the fraction absorbed (Fa), the fraction that escapes the gut wall (Fg) and the fraction that escapes the liver (Fh). Step 1 gives the upper bound that hepatic clearance sets on F, calculated from observed clearance.",
        "Steps 2 and 3 cover dissolution: the dose number, and the effect of pH on the solubility of acids and bases. Steps 4 and 5 use public absorption data to ask how far permeability and simple structural rules identify poorly absorbed compounds. Gut-wall metabolism, food effects and intestinal transporters are not covered, because no public per-compound data were available for them."
      ],
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
    "hep/Predicted against observed": {
      "notice": "Points above the dashed line are over-predicted and points below it are under-predicted.",
      "q": "What does an average fold error of 2.0 mean?",
      "a": "Predictions differ from the observed values by a factor of 2 on average, in either direction. It is the geometric mean of the absolute fold difference, so 1.0 is a perfect prediction."
    },
    "hep/Scaling to the liver": {
      "notice": "The factor that gives the lowest average fold error is larger than 1 for this set.",
      "q": "What does a bias of 0.5 indicate?",
      "a": "Predictions average half the observed values, which is a systematic under-prediction. The average fold error alone does not show the direction of the error."
    },
    "hep/Extraction models": {
      "notice": "The curves are close at low extraction and separate as extraction rises.",
      "q": "When do the well-stirred and parallel-tube models give nearly the same extraction ratio?",
      "a": "At low intrinsic clearance relative to blood flow. As intrinsic clearance rises, the parallel-tube extraction ratio rises faster and approaches 1."
    },
    "hep/Binding assumptions": {
      "notice": "The ranking of the three treatments differs between bases, neutrals and acids.",
      "q": "Why does correcting for binding in blood alone give poor predictions?",
      "a": "It lowers the predicted clearance of highly bound drugs. The measured microsomal CLint already includes binding in the incubation, so the prediction falls too far for highly bound drugs unless the incubation binding is also corrected."
    },
    "hep/Empirical scalars": {
      "notice": "The fitted factor varies more between resamples when fewer drugs are used to fit it.",
      "q": "Why does the spread of the fitted factor widen as the fitting set shrinks?",
      "a": "The factor is estimated from fewer drugs. Of the 29 drugs, 27 are under-predicted by up to 11-fold and 2 are over-predicted by up to 1.35-fold, so the average of the log ratios depends strongly on which drugs are in the fitting set."
    },
    "hep/Low-turnover compounds": {
      "notice": "The shaded band marks losses that the assay cannot separate from its own variability.",
      "q": "Why is a prediction made from a limit value an upper bound?",
      "a": "The true CLint lies below the reported limit, so the true predicted clearance is lower than the value calculated at the limit."
    },
    "hep/Microsomes against hepatocytes": {
      "notice": "The points scatter on both sides of the dashed line. The number above it depends on the scalars.",
      "q": "What does a compound above the dashed line indicate?",
      "a": "Its scaled clearance is higher in hepatocytes than in microsomes. The plot does not identify the cause, which can be an enzyme absent from the microsomal incubation, uptake into the cell, binding, or the scalars."
    },
    "hep/Choosing a method by class": {
      "notice": "Only classes 1A and 2 are metabolism classes.",
      "q": "Which ECCS classes can a microsomal prediction cover?",
      "a": "Classes 1A and 2, where metabolism is the predicted rate-determining mechanism. In the other classes the rate-determining step is hepatic uptake or renal clearance, which a microsomal incubation does not measure."
    },
    "dist/Volume from binding": {
      "notice": "The tissue term is the only term that grows without limit as fut falls.",
      "q": "What is Vss when fup and fut are both 1?",
      "a": "0.57 L/kg, the sum of Vp (0.0436), Ve (0.151) and Vr (0.38)."
    },
    "dist/Implied tissue binding": {
      "notice": "Points below the fut = 1 curve imply a fut above 1, which cannot occur.",
      "q": "What does an implied fut above 1 indicate?",
      "a": "The observed Vss is below the value the equation gives with no tissue binding. The equation constants, the fup value or the Vss value do not describe that drug."
    },
    "dist/Predicting tissue binding": {
      "notice": "The average fold error and the bias differ between the ionization classes.",
      "q": "Why is the equation scored by ionization class and not only overall?",
      "a": "The overall error combines classes in which the equation performs differently, and it hides the classes in which it fails."
    },
    "dist/Ionization class": {
      "notice": "The median differs between the groups for each variable.",
      "q": "Why is the group with no pKa reported not a neutral class?",
      "a": "No reported pKa can mean no ionizable group in the measured range or no measurement. The group is a mixture."
    },
    "dist/Half-life from CL and Vss": {
      "notice": "With independent errors, the half-life error is larger than the error of either input.",
      "q": "Why does a positive correlation between the CL and Vss errors lower the half-life error?",
      "a": "The half-life depends on the ratio Vss / CL. Errors that move in the same direction cancel in the ratio."
    },
    "dist/Blood to plasma ratio": {
      "notice": "The shift between the two comparisons is largest for the drugs with the lowest blood to plasma ratio.",
      "q": "How is plasma clearance converted to blood clearance?",
      "a": "Divide by the blood to plasma ratio."
    },
    "dist/Sensitivity of Vss": {
      "notice": "fup and fut dominate when tissue binding is strong.",
      "q": "How does Vss change when fut doubles and the tissue term dominates?",
      "a": "It falls about 2-fold, because the tissue term is inversely proportional to fut."
    },
    "abs/Hepatic first-pass limit": {
      "notice": "The limit depends on clearance relative to blood flow and not on clearance alone.",
      "q": "What is Fh for a drug with a blood clearance of 10.5 mL/min/kg when the blood flow is 21?",
      "a": "0.5, because Fh = 1 - 10.5 / 21."
    },
    "abs/Solubility and dose": {
      "notice": "The share of compounds with D0 above 1 rises with the dose and falls with the volume.",
      "q": "What does a dose number above 1 indicate?",
      "a": "The dose cannot dissolve in the volume of fluid given, so dissolution can limit absorption."
    },
    "abs/pH-dependent solubility": {
      "notice": "The weak base loses solubility as the pH rises and the weak acid gains it.",
      "q": "Why can acid suppression lower the absorption of a weak base?",
      "a": "A higher gastric pH lowers the solubility of the base, so less of the dose dissolves in the stomach and more can reach the intestine undissolved."
    },
    "abs/Permeability descriptors": {
      "notice": "The median line falls as the polar surface area and the donor count increase.",
      "q": "Does a Spearman correlation of -0.63 mean that TPSA predicts permeability closely?",
      "a": "No. It means that a higher TPSA tends to go with a lower permeability. The spread of permeability at any TPSA is wide."
    },
    "abs/Property rules": {
      "notice": "The accuracy has to be read against the baseline of 86.5 percent.",
      "q": "Why is accuracy a poor summary of a rule on this set?",
      "a": "Most compounds are well absorbed, so calling every compound good already scores 86.5 percent. The fractions of poor compounds caught and good compounds flagged show what the rule does."
    },
    "dist/What Vss measures": {
      "notice": "Vss exceeds the body water volume once Kp exceeds 1.",
      "q": "What is Vss when Kp = 1?",
      "a": "The sum of the plasma and tissue volumes, 0.57 L/kg, or about 40 L for a 70 kg adult."
    },
    "why/Concentration and effect": {
      "notice": "Doubling the dose doubles the peak and adds one half-life to the time above the EC50.",
      "q": "Why does doubling the dose lengthen the time above the EC50 by one half-life only?",
      "a": "The concentration falls exponentially. A doubled peak takes one half-life to fall back to the original peak, and the course after that is unchanged."
    },
    "why/Path of an oral dose": {
      "notice": "Each stage has one letter of ADME and one quantity that links the assay to the clinic.",
      "q": "Which quantity describes the fraction of a dose that escapes the liver on the first pass?",
      "a": "Fh."
    },
    "why/Exposure measures": {
      "notice": "Each measure is read from a different part of the same curve.",
      "q": "Which measure follows the total exposure?",
      "a": "The AUC, the area under the concentration-time curve."
    },
    "units/Units and conversions": {
      "notice": "Dose, concentration and clearance each need their own conversion.",
      "q": "What is the relation between ng/mL and micrograms per liter?",
      "a": "They are equal: 1 ng/mL = 1 microgram/L."
    },
    "units/Amount and volume": {
      "notice": "Most of the 667 drugs have a volume above the body water volume.",
      "q": "Can a volume of distribution exceed the volume of the body?",
      "a": "Yes. It is an apparent volume. Binding to tissue lowers the plasma concentration for a given amount, so the volume rises."
    },
    "units/Bound and unbound drug": {
      "notice": "At one total concentration, the unbound concentration depends only on fu.",
      "q": "A drug has fu = 0.02 and a total plasma concentration of 5 mg/L. What is the unbound concentration?",
      "a": "0.1 mg/L, because Cu = fu x C."
    },
    "elim/First-order elimination": {
      "notice": "The fraction removed per hour is constant, and the amount removed per hour falls.",
      "q": "How much of a 100 mg dose remains after three half-lives?",
      "a": "12.5 mg."
    },
    "elim/Clearance": {
      "notice": "The slope of each line is the clearance.",
      "q": "What is the elimination rate at a concentration of 2 mg/L when the clearance is 10 L/h?",
      "a": "20 mg/h, because rate = CL x C."
    },
    "elim/Intravenous profile": {
      "notice": "On the logarithmic axis the curve is a straight line.",
      "q": "How does the half-life change when the volume of distribution doubles at constant clearance?",
      "a": "It doubles, because t1/2 = 0.693 x V / CL."
    },
    "elim/Volume and half-life": {
      "notice": "Equal clearance and equal dose give equal areas under the curve, whatever the volume.",
      "q": "Why does a larger volume lengthen the half-life at constant clearance?",
      "a": "The same clearance removes a smaller fraction of the drug in the body per hour."
    },
    "elim/Repeat dosing": {
      "notice": "The average steady-state concentration depends on the clearance and not on the volume.",
      "q": "What is the accumulation ratio when the dosing interval equals the half-life?",
      "a": "2, because R = 1 / (1 - 0.5)."
    },
    "elim/Checking a record": {
      "notice": "The calculated MRT matches the reported MRT, and 0.693 x MRT falls below the half-life.",
      "q": "Why is 0.693 x MRT below the reported half-life for most drugs?",
      "a": "Most drugs have more than one disposition phase. The reported half-life is the terminal one, which is longer than a one-compartment value."
    },
    "oral/Oral profile": {
      "notice": "The oral and intravenous curves differ in shape, and the oral area is F times the intravenous area.",
      "q": "What is the AUC after a 100 mg oral dose with F = 0.4 and CL = 20 L/h?",
      "a": "2.0 mg x h/L, because AUC = F x dose / CL = 0.4 x 100 / 20."
    },
    "oral/Bioavailability from AUCs": {
      "notice": "F is the ratio of the two dose-normalized areas.",
      "q": "An oral dose of 100 mg gives an AUC of 8 mg x h/L and an intravenous dose of 50 mg gives 10. What is F?",
      "a": "0.4, because (8 / 100) / (10 / 50) = 0.4."
    },
    "oral/Bioavailability as a product": {
      "notice": "The three terms multiply, so each loss acts on what the previous stage left.",
      "q": "What is F when Fa, Fg and Fh are each 0.7?",
      "a": "0.34, because 0.7 x 0.7 x 0.7 = 0.343."
    },
    "met/Metabolic routes": {
      "notice": "A microsomal incubation with NADPH covers oxidation and not the other routes.",
      "q": "Why does a microsomal incubation with NADPH not measure aldehyde oxidase activity?",
      "a": "The enzyme is in the cytosol, which is not part of the microsomal fraction."
    },
    "met/Enzyme kinetics": {
      "notice": "The clearance v / S is highest at low concentration and falls as the enzyme saturates.",
      "q": "What is the rate at S = Km?",
      "a": "Half of Vmax."
    },
    "met/Depletion assay": {
      "notice": "The logarithmic plot is a straight line with slope -k.",
      "q": "What is the scaled CLint for an in vitro half-life of 25 min at 1 mg/mL?",
      "a": "25 mL/min/kg: k = 0.0277 per min, CLint = 27.7 microL/min/mg, and scaling multiplies by 45 x 20 / 1000."
    },
    "met/Clearance and extraction": {
      "notice": "Clearance cannot exceed the blood flow.",
      "q": "What is the clearance of an organ with a blood flow of 21 mL/min/kg and an extraction ratio of 0.4?",
      "a": "8.4 mL/min/kg, because CL = Q x E."
    },
    "met/Total clearance": {
      "notice": "Removing a route that carries a fraction s of the clearance multiplies the AUC by 1 / (1 - s).",
      "q": "A drug has CLh 6, CLr 2 and no other route, in L/h. What is the fraction excreted unchanged?",
      "a": "0.25, because fe = CLr / CL = 2 / 8."
    },
    "vitro/What an assay measures": {
      "notice": "Each assay yields one parameter that needs scaling or a model before it predicts a clinical value.",
      "q": "Which parameter does a microsomal stability assay yield before scaling?",
      "a": "The in vitro half-life, converted to CLint in microL/min/mg of protein."
    },
    "vitro/From assay to clearance": {
      "notice": "Each stage uses only the values of the stages before it.",
      "q": "Which two quantities does the extraction model use?",
      "a": "The binding-corrected CLint and the hepatic blood flow Q."
    },
    "vitro/Fold error": {
      "notice": "A 4-fold over-prediction and a 4-fold under-prediction are equally large errors on the ratio scale.",
      "q": "A predicted value is 5 and the observed value is 20. What is the fold error?",
      "a": "A 4-fold under-prediction."
    },
    "vitro/Average fold error and bias": {
      "notice": "For the starting values the bias is 1.12 and the arithmetic mean of the ratios is 1.50.",
      "q": "Can the bias be 1.0 when the average fold error is 2.0?",
      "a": "Yes. Equal over- and under-predictions on the log scale cancel in the bias and add in the average fold error."
    },
    "vitro/Why the log scale": {
      "notice": "The 2-fold band has a constant width on logarithmic axes only.",
      "q": "Why are clearances averaged as logarithms?",
      "a": "Errors are multiplicative, so equal fold errors above and below the observed value should count equally."
    }
  }
};
