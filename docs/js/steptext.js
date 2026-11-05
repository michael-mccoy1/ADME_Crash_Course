"use strict";
/* Step text. watch: model, equation, assumptions and result. legend: figure caption. change: controls and outputs. */
var STEPTEXT = {
 "why/Concentration and effect": {
  "watch": "Effect follows the Emax model, E = Emax C^h / (EC50^h + C^h), with plasma concentration taken as the target concentration. After an intravenous bolus, C exceeds the EC50 for ln(C0 / EC50) / k, so doubling the dose extends the interval by one half-life, ln 2 / k.",
  "legend": "Left: effect against concentration. Right: plasma concentration after an intravenous bolus (V = 50 L); the shaded interval marks C above the EC50. Grey dashed curves are pinned scenarios. Hovering on either plot marks the same concentration on both.",
  "change": "EC50, h, dose, CL, concentration axis; drag the EC50 line or the C0 point; Pin keeps up to three scenarios; PNG and CSV export. Outputs: effect at C0, half-life, time above the EC50."
 },
 "why/Path of an oral dose": {
  "watch": "Seven stages follow oral administration. Each is assigned to absorption (A), distribution (D), metabolism (M) or excretion (E) and characterized by an in vitro assay and a parameter that relates it to a clinical quantity (table). Gut-wall metabolism, renal clearance and biliary clearance are described and not predicted; no public per-compound data were used.",
  "legend": "Dose, 100 mg, through the stages of an oral dose. Arrow width is proportional to the amount; red arrows are losses (not absorbed, gut-wall metabolism, hepatic first pass). Selecting a stage gives its ADME category, assay, parameter and course location.",
  "change": "Fa, Fg, Fh, ADME highlight; click a stage. Outputs: amount at each stage, F = Fa x Fg x Fh, assay and parameter of the selected stage."
 },
 "why/Exposure measures": {
  "watch": "Exposure is summarized by Cmax, tmax, AUC, terminal half-life and trough. For first-order absorption, C(t) = F D ka / [V (ka - ke)] x [exp(-ke t) - exp(-ka t)] and AUC(0 to infinity) = F D / CL. Peak-related toxicity is assessed by Cmax; efficacy that requires C above a threshold, by the trough or the time above the EC50.",
  "legend": "Oral profile (dose 100 mg, V = 60 L) with the selected measure highlighted. The grey dashed curve is the pinned profile.",
  "change": "Measure, F, ka, CL; hover for C and AUC(0 to t); drag the AUC end, the trough time or the half-life start; Pin compares a profile with the current one; PNG and CSV export. Outputs: Cmax, tmax, AUC, half-life, concentration at the trough time."
 },
 "units/Units and conversions": {
  "watch": "mg/L = uM x MW / 1000 and ng/mL = ug/L = uM x MW. Dose (umol) = dose (mg) / MW x 1000. CL (L/h) = CL (mL/min/kg) x W (kg) x 60 / 1000. Errors in these conversions produce factors of 10, 60 or 1000 that can be mistaken for differences between compounds.",
  "legend": "Linked unit fields (editing any field updates the others), and the clearance of 667 drugs (Obach et al., 2008) on a logarithmic axis with the value set and hepatic blood flow marked; units used in this course are tabulated below.",
  "change": "Edit any field; drag the CL line or click a drug on the strip; hover for names; PNG and CSV export. Outputs: converted values, percentile of CL in the set, fraction of hepatic blood flow."
 },
 "units/Amount and volume": {
  "watch": "V = A / C is an apparent volume. For a 70 kg adult, plasma volume is 3.05 L, extracellular fluid 13.6 L and total body water 40.2 L (Oie-Tozer constants; Coutinho et al., 2024). In the Obach et al. (2008) data (n = 667), Vss exceeds 40.2 L for 415 drugs (range 2.5 to 49,000 L), consistent with tissue binding.",
  "legend": "Vss of 667 drugs (70 kg adult, logarithmic axis) with plasma, extracellular fluid and body water volumes marked; the selected drug is the large point and the pinned drug the open circle.",
  "change": "Drug, dose; click or drag on the strip to select the nearest drug; hover for names; Pin keeps a reference drug; PNG and CSV export. Outputs: Vss, concentration after the dose, ratio to body water."
 },
 "units/Bound and unbound drug": {
  "watch": "Cu = fu x C, with only unbound drug assumed to cross membranes, be cleared and bind the target. For the 554 drugs with a reported fu (Obach et al., 2008), the median is 0.25 (quartiles 0.06 and 0.70); fu is below 0.1 for 179 and below 0.01 for 41.",
  "legend": "Left: total, unbound and bound concentration of the selected drug. Right: distribution of fu (n = 554); the dark line marks the selected drug and the grey line the pinned drug.",
  "change": "Drug, total concentration; drag the line on the histogram to move through the set; click a bar to list its drugs; Pin compares two drugs; PNG and CSV export. Outputs: Cu, bound concentration."
 },
 "elim/First-order elimination": {
  "watch": "First-order elimination: dA/dt = -kA, A(t) = A0 exp(-kt), t1/2 = 0.693 / k; the fraction 1 - exp(-k) is eliminated per hour. Of a 100 mg dose, 50, 25 and 3.1 mg remain after 1, 2 and 5 half-lives.",
  "legend": "Amount in the body after a 100 mg dose, with markers at multiples of the half-life; table of amount and elimination rate at each multiple. Grey dashed curves are pinned half-lives.",
  "change": "Half-life, axis; drag the half-life point; hover for amount and rate; Pin keeps up to three; PNG and CSV export. Outputs: k, fraction eliminated per hour, amount and rate at each half-life."
 },
 "elim/Clearance": {
  "watch": "With A = V C, the elimination rate is kVC. Defining CL = kV gives rate = CL x C and k = CL / V; CL is the volume of plasma cleared of drug per unit time.",
  "legend": "Elimination rate against plasma concentration for two drugs; the slope of each line is CL. Grey lines are pinned values.",
  "change": "Concentration, V, CL of drugs A and B; drag a point vertically to set CL, or the dashed line to set the concentration; hover for both rates; Pin; PNG and CSV export. Outputs: A, rate, k, half-life."
 },
 "elim/Intravenous profile": {
  "watch": "One-compartment bolus: C(t) = C0 exp(-kt), C0 = Dose / V, k = CL / V, t1/2 = 0.693 V / CL, AUC(0 to infinity) = Dose / CL. The log10 profile is linear with slope -k / 2.303; 50, 25 and 12.5% of C0 remain after 1, 2 and 3 half-lives.",
  "legend": "Plasma concentration after an intravenous bolus; markers at 1, 2 and 3 half-lives. Hovering shades AUC(0 to t); grey dashed curves are pinned scenarios.",
  "change": "Dose, V, CL, axis; drag the dose point vertically and the half-life point horizontally; hover for C and AUC(0 to t); Pin keeps up to three; PNG and CSV export. Outputs: C0, k, half-life, AUC."
 },
 "elim/Volume and half-life": {
  "watch": "t1/2 = 0.693 V / CL. At equal dose and CL, a larger V gives a lower C0 and a longer t1/2; AUC = Dose / CL is independent of V.",
  "legend": "Intravenous profiles of two drugs with equal dose and CL and different V; dots on the curves mark the half-lives.",
  "change": "CL, V of drugs A and B, axis; drag the starting point of either curve to set V; hover for both concentrations; Pin; PNG and CSV export. Outputs: half-lives, C0, AUC."
 },
 "elim/Repeat dosing": {
  "watch": "Css,avg = F x Dose / (CL x tau), independent of V. The accumulation ratio is R = 1 / (1 - exp(-k tau)) with k = CL / V, and the steady-state peak is R times the first peak. Steady state is 90% approached after 3.3 half-lives.",
  "legend": "Plasma concentration after repeated 100 mg intravenous boluses at interval tau; dashed line, Css,avg; triangles mark the doses.",
  "change": "tau, CL, V; drag the interval marker; hover for C and the number of doses given; Pin keeps a regimen; PNG and CSV export. Outputs: R, Css,avg, steady-state peak and trough, time to 90% of steady state."
 },
 "elim/Checking a record": {
  "watch": "MRT = Vss / CL; with Vss in L/kg and CL in mL/min/kg, MRT (h) = Vss / CL x 1000 / 60. For the 667 drugs of Obach et al. (2008), the calculated MRT is within 10% of the reported value for 637 (median ratio 1.00). 0.693 x MRT is below the reported t1/2 for most drugs (median ratio 0.76), consistent with multiphasic disposition.",
  "legend": "Distributions of calculated over reported MRT and of 0.693 x MRT over reported t1/2 (n = 667); the dark line marks the selected drug in both panels and the grey line the pinned drug.",
  "change": "Drug; drag the line in either histogram to select the nearest drug; click a bar to list its drugs; Pin keeps a drug; PNG and CSV export. Outputs: reported and calculated values and their ratios."
 },
 "oral/Oral profile": {
  "watch": "First-order absorption gives C(t) = F D ka / [V (ka - ke)] x [exp(-ke t) - exp(-ka t)] with ke = CL / V. tmax = ln(ka / ke) / (ka - ke), and AUC(0 to infinity) = F D / CL, the intravenous AUC multiplied by F.",
  "legend": "Plasma concentration after oral and intravenous doses of 100 mg.",
  "change": "F, CL, V, ka. Outputs: oral and intravenous AUC, Cmax, tmax, half-life."
 },
 "oral/Bioavailability from AUCs": {
  "watch": "F = (AUC_po / Dose_po) / (AUC_iv / Dose_iv) from crossover administration, assuming equal CL on both occasions and dose-independent CL. For 100 mg orally with AUC 8 mg x h/L and 50 mg intravenously with AUC 10 mg x h/L, F = 0.4.",
  "legend": "Dose-normalized AUC for each route.",
  "change": "Both doses and both AUCs. Output: F."
 },
 "oral/Bioavailability as a product": {
  "watch": "F = Fa x Fg x Fh (fraction absorbed, fraction escaping gut-wall metabolism, fraction escaping hepatic first-pass extraction), with Fh = 1 - CLh / Q. Three terms of 0.7 give F = 0.34.",
  "legend": "Fraction of the dose remaining after each stage.",
  "change": "Fa, Fg, CLh, Q. Outputs: Fh, F, stage with the largest loss."
 },
 "met/Metabolic routes": {
  "watch": "An in vitro system measures a route only if it contains the enzyme and its cofactor. Liver microsomes contain cytochrome P450 and UDP-glucuronosyltransferases and, with NADPH, support P450 oxidation. Hepatocytes contain the hepatic enzymes of all four routes. The tab 07 predictions use microsomes with NADPH and cover oxidation only.",
  "legend": "Reaction, enzymes, covering in vitro system and coverage by the tab 07 prediction, for four routes.",
  "change": "Route. Outputs: reaction, enzymes, in vitro system, coverage."
 },
 "met/Enzyme kinetics": {
  "watch": "v = Vmax S / (Km + S). For S << Km, v is approximately (Vmax / Km) S and CLint = Vmax / Km (uL/min/mg for Vmax in pmol/min/mg and Km in uM). The first-order approximation overestimates v by 1 + S / Km: 10% at S = 0.1 Km and 100% at S = Km.",
  "legend": "Left: rate against substrate concentration with the low-concentration tangent. Right: clearance v / S against concentration.",
  "change": "Vmax, Km, S. Outputs: v, CLint, error of the first-order approximation."
 },
 "met/Depletion assay": {
  "watch": "For S << Km, ln C = ln C0 - kt with k = 0.693 / t1/2. CLint (uL/min/mg) = k (1/min) / protein (mg/mL) x 1000; scaled CLint (mL/min/kg) = CLint x 45 x 20 / 1000 (45 mg protein per g liver, 20 g liver per kg). Chlorpromazine (Obach, 1999): t1/2 = 25 min at 1 mg/mL gives 25 mL/min/kg.",
  "legend": "Left: percent remaining against time. Right: natural logarithm of percent remaining. Sampling times 0, 5, 15, 30, 45 and 60 min are marked.",
  "change": "In vitro half-life, protein concentration. Outputs: k, CLint per mg, scaled CLint."
 },
 "met/Clearance and extraction": {
  "watch": "E = (Cin - Cout) / Cin and CL = Q x E, so CL cannot exceed Q; for the liver, Fh = 1 - E. Hepatic blood flow is 21 mL/min/kg (Obach, 1999). Selecting a drug sets E to its observed nonrenal blood clearance divided by 21.",
  "legend": "Inlet and outlet concentration relative to the inlet value.",
  "change": "Q, E or drug. Outputs: CL, Fh."
 },
 "met/Total clearance": {
  "watch": "CL = CLh + CLr + CLother and fe = CLr / CL. With GFR = 120 mL/min (7.2 L/h), filtration alone gives CLr = fu x 7.2 L/h; a higher CLr indicates net secretion and a lower one net reabsorption. Loss of a route that carries a fraction s of CL multiplies the AUC by 1 / (1 - s).",
  "legend": "Components of total clearance.",
  "change": "CLh, CLr, CLother, fu. Outputs: CL, fe, renal clearance relative to filtration."
 },
 "vitro/What an assay measures": {
  "watch": "Each assay yields a parameter that requires a scaling step and a model to predict a clinical quantity (table). Six assays are listed with the parameter, the scaling and the course section that uses them.",
  "legend": "Measurement, parameter, link to the in vivo parameter and course location for six assays.",
  "change": "Assay. Outputs: measurement, parameter, scaling, course location."
 },
 "vitro/From assay to clearance": {
  "watch": "CL' = fu(blood) x CLint / fu(mic). With Q = 21 mL/min/kg, the well-stirred model gives CL = Q x CL' / (Q + CL') and the parallel-tube model CL = Q x [1 - exp(-CL' / Q)]. Predictions are compared with the observed nonrenal blood clearance after intravenous dosing (Obach, 1999).",
  "legend": "Value at each stage for the selected drug.",
  "change": "Drug, model, stage. Outputs: predicted CL, fold error."
 },
 "vitro/Fold error": {
  "watch": "Fold error is r = predicted / observed, or 1 / r when r is below 1, with the direction stated. A prediction is within 2-fold when 0.5 <= r <= 2.",
  "legend": "Predicted and observed values on a logarithmic axis; the shaded interval is within 2-fold. Table: observed and predicted clearance (mL/min/kg) for six drugs.",
  "change": "Predicted and observed values. Output: fold error."
 },
 "vitro/Average fold error and bias": {
  "watch": "Average fold error = 10^mean(|log10 r|). Bias = 10^mean(log10 r); 1 indicates balanced over- and under-prediction. The arithmetic mean of r is not used because large over-predictions inflate it. For r = 2, 0.5, 1, 4, 0.5 and 1: average fold error 1.78, bias 1.12, arithmetic mean 1.50.",
  "legend": "Log ratio of each drug; the dashed line marks the bias.",
  "change": "Predicted and observed values for six drugs. Outputs: average fold error, bias, arithmetic mean ratio, count within 2-fold."
 },
 "vitro/Why the log scale": {
  "watch": "Observed clearance in the Obach (1999) set spans 0.03 to 20 mL/min/kg (670-fold). On linear axes the 2-fold band widens with the value and the seven drugs below 1 mL/min/kg are compressed at the origin. Fold errors are plotted and averaged on the logarithmic scale in tabs 07 to 09.",
  "legend": "Parallel-tube predictions with both binding corrections against observed blood clearance (n = 29) on linear or logarithmic axes.",
  "change": "Axis scale. Outputs: number of drugs below 1 mL/min/kg, range."
 },
 "hep/Predicted against observed": {
  "watch": "CLint from Obach (1999) is scaled with 45 mg protein per g liver and 20 g liver per kg. Observed values are nonrenal blood clearances from intravenous studies (chlorpromazine, intramuscular). Agreement is summarized by the number within 2-fold, the average fold error and the bias (tab 06), used throughout tabs 07 to 09.",
  "legend": "Predicted against observed clearance (n = 29); shaded band, within 2-fold; dashed line, identity.",
  "change": "Extraction model, binding correction. Outputs: within 2-fold, average fold error, bias."
 },
 "hep/Scaling to the liver": {
  "watch": "Scaling uses microsomal protein per g liver (MPPGL) and liver weight per kg (Obach, 1999: 45 mg/g, 20 g/kg), acting as one factor on CLint. For the parallel-tube model with both binding corrections at factor 1.0, bias = 0.48 and 16 of 29 drugs are within 2-fold. The average fold error is lowest (1.60) at a factor of about 3.2, and bias = 1.0 at about 2.6.",
  "legend": "Left: predicted against observed clearance for the scalars set. Right: average fold error and bias against scaling factor.",
  "change": "MPPGL, liver weight, model. Outputs: average fold error, bias, within 2-fold, optimal factor."
 },
 "hep/Extraction models": {
  "watch": "Well-stirred: E = CL' / (Q + CL'). Parallel-tube: E = 1 - exp(-CL' / Q). The dispersion model approaches parallel-tube as Dn tends to 0 and well-stirred as Dn tends to infinity. At equal CL', the well-stirred E is 9% lower than the parallel-tube value where the latter is 0.2, and 18% lower where it is 0.5.",
  "legend": "Extraction ratio against binding-corrected CLint / Q for the three models; points, the 29 drugs at their observed extraction ratio.",
  "change": "Q, Dn, drug. Outputs: clearance predicted by each model."
 },
 "hep/Binding assumptions": {
  "watch": "Treatments: none, fu(blood) only, and fu(blood) with fu(mic). Measured CLint is already reduced by incubation binding, so fu(blood) alone over-corrects. For bases (n = 12) the average fold error is lowest without correction (1.31, against 1.60 with both); for acids (n = 9), with both (2.71, against 5.41 without).",
  "legend": "Average fold error by compound class and treatment; table, the five largest fold errors.",
  "change": "Extraction model, form of fu(blood). Outputs: average fold error by class."
 },
 "hep/Empirical scalars": {
  "watch": "The factor is chosen so that the fitting set has bias 1 (300 random fitting and held-out splits of the 29 drugs). Fitted on all drugs it is 2.6, and the average fold error falls from 2.14 to 1.62 (parallel-tube, both corrections). All in vitro data come from one laboratory, so the held-out score does not estimate transfer to another assay.",
  "legend": "Left: fitted factor over resamples. Right: held-out average fold error with and without the factor.",
  "change": "Number of fitting drugs, model. Outputs: median and 5th to 95th percentiles of the factor and of the held-out error."
 },
 "hep/Low-turnover compounds": {
  "watch": "A loss below a set multiple of the assay variability is reported as a CLint limit. For a multiple of 2, k(min) = -ln(1 - 2 CV) / T, and the lowest reportable scaled CLint is k(min) / protein x 45 x 20. A half-life of 120 min at 10 mg/mL gives 0.52 mL/min/kg, the warfarin limit (Obach, 1999). A prediction from the limit is an upper bound.",
  "legend": "Percent remaining against time, with the region of losses below twice the variability shaded. Panel: predictions at the limit for the selected drug.",
  "change": "Protein, incubation time, variability, CLint, drug, model. Outputs: lowest reportable CLint, prediction at the limit."
 },
 "hep/Microsomes against hepatocytes": {
  "watch": "CLint of 96 compounds with uncensored values in both assays (AstraZeneca data in ChEMBL; 96 of 187 with both) is scaled with MPPGL and hepatocellularity, each times liver weight per kg. Differences can reflect enzymes absent from an NADPH-supplemented incubation, uptake, binding and the scalars. With 45 mg/g, 120 x 10^6 cells/g (assumed) and 20 g/kg, 62 of 96 have the higher clearance in hepatocytes (median ratio 1.22).",
  "legend": "Scaled hepatocyte against scaled microsomal CLint; dashed line, identity; shaded band, within 2-fold.",
  "change": "MPPGL, hepatocellularity, liver weight. Outputs: number above identity, median ratio."
 },
 "hep/Choosing a method by class": {
  "watch": "The extended clearance classification system (Varma et al., 2015) assigns a class from ionization at pH 7, MW and passive permeability (cut-offs: 5 x 10^-6 cm/s in low-efflux MDCK cells; MW 400 Da for acids and zwitterions) and predicts the rate-determining mechanism. It was correct for about 92% of 307 compounds with one mechanism contributing at least 70% of clearance. Microsomal scaling applies to classes 1A and 2.",
  "legend": "ECCS class map; the marked compound is set by the controls.",
  "change": "Ionization, MW, permeability, plasma protein binding. Outputs: class, predicted mechanism."
 },
 "dist/What Vss measures": {
  "watch": "Vss = Vp + Kp x Vt. For a 70 kg adult, Vp = 3.05 L and Vt = 37.2 L (0.0436 and 0.151 + 0.38 L/kg; Oie-Tozer constants). Kp = 1 gives 40 L (0.57 L/kg) and Kp = 10 gives 375 L.",
  "legend": "Distribution of a 100 mg dose between plasma and tissue at equilibrium; second bar, Vss on a scale to 400 L.",
  "change": "Kp. Outputs: Vss, concentrations, amounts in plasma and tissue."
 },
 "dist/Volume from binding": {
  "watch": "Vss = Vp + fup Ve + Re/i Vp (1 - fup) + Vr fup / fut, with Vp = 0.0436, Ve = 0.151 and Vr = 0.38 L/kg and Re/i = 1.4 (Coutinho et al., 2024). Only the tissue term is unbounded as fut decreases. At fup = fut = 1, Vss = 0.57 L/kg.",
  "legend": "Vss against fut at the fup set, with curves for fup = 0.001, 0.01, 0.1 and 1. Panel: the three terms.",
  "change": "fup, fut. Outputs: Vss and the share of each term."
 },
 "dist/Implied tissue binding": {
  "watch": "fut = Vr fup / (Vss - Vp - fup Ve - Re/i Vp (1 - fup)); undefined where Vss is below the plasma and extracellular terms, and above 1 where Vss lies below the fut = 1 curve. For 554 drugs (Obach et al., 2008) it is undefined for 26 and above 1 for 76; the median of the remaining 528 is 0.09.",
  "legend": "Observed Vss against fup (n = 554) with Oie-Tozer curves at fut = 1, 0.1, 0.01 and 0.001.",
  "change": "Drug. Outputs: counts, median implied fut."
 },
 "dist/Predicting tissue binding": {
  "watch": "fut was predicted for 163 drugs with fup and measured logD (AstraZeneca) by (a) fut = 1, (b) the Lombardo equation as stated by Coutinho et al. (2024), log fut = 0.0080 - 0.2294 logD - 0.9311 fi + 0.8885 log fup, with fi from measured pKa (0 if none), and (c) the median implied fut, fitted on the same drugs. The source applies the equation with logP to compounds neutral at pH 7.4; here it is applied with logD to all classes.",
  "legend": "Predicted against observed Vss. Table: within 2-fold, average fold error and bias by ionization class.",
  "change": "Source of fut. Outputs: scoreboard by class."
 },
 "dist/Ionization class": {
  "watch": "172 drugs with measured logD, grouped by AstraZeneca pKa. The group with no pKa reported mixes compounds without an ionizable group, with a pKa outside the measured range, and unmeasured. Medians (acids, bases, zwitterions, no pKa): Vss 0.19, 2.2, 1.7 and 1.3 L/kg; fup 0.05, 0.36, 0.75 and 0.15; logD 0.31, 1.67, -0.35 and 1.47.",
  "legend": "Selected variable by group; bars mark the medians.",
  "change": "Variable. Outputs: group medians."
 },
 "dist/Half-life from CL and Vss": {
  "watch": "For a one-compartment drug t1/2 = 0.693 Vss / CL; for 667 drugs (Obach et al., 2008) it is within 2-fold of the reported terminal half-life for 554 (average fold error 1.51, bias 0.68). For log-normal errors in CL and Vss (fold errors fc and fv, correlation rho), var(ln t1/2) = (ln fv)^2 + (ln fc)^2 - 2 rho ln fv ln fc.",
  "legend": "Left: 0.693 x Vss / CL against reported t1/2. Right: distribution of predicted over true t1/2 from 4000 draws.",
  "change": "Fold errors of CL and Vss, correlation. Outputs: fraction within 2-fold, geometric standard deviation."
 },
 "dist/Blood to plasma ratio": {
  "watch": "CL(blood) = CL(plasma) / B:P; B:P is 0.53 to 1.5 in the Obach (1999) set. The parallel-tube prediction with both corrections has an average fold error of 2.14 and a bias of 0.48 against blood clearance, and 1.93 and 0.64 against plasma clearance. The improvement reflects the higher plasma value offsetting the under-prediction (B:P below 1) and not a better prediction.",
  "legend": "Predicted blood clearance against observed blood or plasma clearance (n = 29).",
  "change": "Comparison basis. Outputs: scoreboard by class."
 },
 "dist/Sensitivity of Vss": {
  "watch": "Where the tissue term dominates, Vss is proportional to fup / fut. At fup = fut = 0.03 the tissue term is 78% of Vss; 2-fold changes in Ve, Re/i and Vp change Vss by 1% or less, 6 to 12% and 10 to 21%.",
  "legend": "Vss relative to its unperturbed value when each input is divided and multiplied by the perturbation factor.",
  "change": "fup, fut, perturbation factor. Outputs: Vss ratio for each input."
 },
 "abs/Hepatic first-pass limit": {
  "watch": "For Fa = Fg = 1, F = Fh = 1 - CLb / Q, an upper bound. Fh from the observed nonrenal blood clearance of the 29 drugs of Obach (1999), assuming nonrenal clearance is hepatic: with Q = 21 mL/min/kg, Fh is below 0.5 for 11 drugs, below 0.2 for 5 and at least 0.9 for 8.",
  "legend": "Fh for each drug, in descending order; colour, compound class.",
  "change": "Q. Outputs: counts below thresholds; drug details."
 },
 "abs/Solubility and dose": {
  "watch": "D0 = (Dose / V) / S; D0 above 1 indicates incomplete dissolution in V. S (mg/mL) = 10^logS x MW for the 9,980 AqSolDB compounds (Sorkun et al., 2019), which are chemicals in general, not drugs, at uncontrolled pH. For 100 mg in 250 mL, D0 exceeds 1 for 4,712.",
  "legend": "Distribution of log10 D0; shaded bars, D0 above 1.",
  "change": "Dose, volume. Outputs: number and percentage with D0 above 1."
 },
 "abs/pH-dependent solubility": {
  "watch": "Monoprotic acid: S = S0 (1 + 10^(pH - pKa)); base: S = S0 (1 + 10^(pKa - pH)). Salt solubility limits and micellar solubilization are neglected, so S at low pH is an upper limit for a base. Raising gastric pH, for example by acid suppression, raises D0 in the stomach; D0 at intestinal pH indicates whether the dose remains dissolved.",
  "legend": "log10 D0 against pH for the dose and volume set; markers at gastric and intestinal pH.",
  "change": "Type, pKa, S0, dose, gastric and intestinal pH. Outputs: S and D0 at each pH."
 },
 "abs/Permeability descriptors": {
  "watch": "Caco-2 log10 Papp (Wang et al., 2016; n = 910) correlates with TPSA (Spearman rho = -0.63), donors (-0.65), MW (-0.38), acceptors (-0.45) and Crippen logP (+0.28). Wang et al. built their model on 30 selected descriptors.",
  "legend": "log10 Papp against the selected descriptor; line, median of equal-count bins.",
  "change": "Descriptor. Output: Spearman correlation."
 },
 "abs/Property rules": {
  "watch": "Rule of five (Lipinski): MW above 500, logP above 5, donors above 5, acceptors above 10. Veber: rotatable bonds above 10, TPSA above 140 A^2. Of the 578 compounds of Hou et al. (2007), 78 have a fraction absorbed of 30% or less (poor). Calling all compounds good scores 86.5%, and the rule of five with one violation 86.7%. The ROC area of Crippen logP is 0.27: poorly absorbed compounds have lower logP.",
  "legend": "Left: classification of poor and good compounds by the rule set. Right: ROC area of each descriptor for poor against good.",
  "change": "Preset, thresholds, violations required. Outputs: compounds caught and flagged, accuracy, baseline, balanced accuracy."
 }
};
