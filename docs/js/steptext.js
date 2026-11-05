"use strict";
/* Step text. watch: theory, method and result. legend: figure caption. change: controls and outputs. */
var STEPTEXT = {
 "why/Concentration and effect": {
  "watch": "The pharmacological effect is a function of the concentration at the target. For a single binding site the Emax model gives E = Emax x C^h / (EC50^h + C^h), where EC50 is the concentration producing 50% of Emax and h is the Hill coefficient. Plasma concentration is taken as the target concentration. After an intravenous bolus, C(t) = (Dose / V) exp(-kt), and C exceeds the EC50 for ln(C0 / EC50) / k. Doubling the dose doubles C0 and extends this interval by ln 2 / k, one half-life.",
  "legend": "Left: effect against concentration. Right: plasma concentration after an intravenous bolus (V = 50 L); the shaded interval marks C above the EC50.",
  "change": "EC50, h, dose, CL. Outputs: effect at C0, half-life, time above the EC50."
 },
 "why/Path of an oral dose": {
  "watch": "After oral administration a dose passes through seven stages. Each stage belongs to absorption (A), distribution (D), metabolism (M) or excretion (E), is probed by an in vitro assay, and is quantified by a parameter that links the assay to the clinic. Tabs 02 to 05 define these parameters. Tabs 07 to 09 predict hepatic clearance, volume of distribution and absorption. Gut-wall metabolism, renal clearance and biliary clearance are not predicted, because no public per-compound data were used for them.",
  "legend": "Stages of an oral dose with the associated ADME category, assay, parameter and course location.",
  "change": "Stage. Outputs: process, assay, parameter, course location."
 },
 "why/Exposure measures": {
  "watch": "A concentration-time profile is summarized by Cmax (peak concentration), tmax (time of Cmax), AUC (area under the curve, the total exposure), the terminal half-life and the trough (concentration at the end of a dosing interval). Toxicity related to the peak depends on Cmax. Efficacy that requires C above a threshold depends on the trough or the time above the EC50. For first-order absorption, C(t) = F D ka / [V (ka - ke)] x [exp(-ke t) - exp(-ka t)], and AUC(0 to infinity) = F D / CL.",
  "legend": "Oral profile (dose 100 mg, F = 0.6, V = 60 L) with the selected measure highlighted.",
  "change": "Measure, ka, CL. Outputs: Cmax, tmax, AUC(0 to 24 h), half-life, concentration at 12 h."
 },
 "units/Units and conversions": {
  "watch": "Concentrations are reported in mass or molar units: mg/L = uM x MW / 1000, and ng/mL = ug/L = uM x MW (MW in g/mol). A dose in micromoles is dose (mg) / MW x 1000. A clearance normalized to body weight converts to a whole-body value by CL (L/h) = CL (mL/min/kg) x W (kg) x 60 / 1000. An error in one of these conversions changes a value by a factor of 10, 60 or 1000 and can be mistaken for a real difference between compounds.",
  "legend": "Conversions for the values set, and the units used in this course.",
  "change": "MW, concentration, dose, body weight, CL. Outputs: converted values."
 },
 "units/Amount and volume": {
  "watch": "The apparent volume of distribution V relates the amount of drug in the body A to the plasma concentration C: V = A / C. V is a proportionality constant and need not correspond to a physical space. For a 70 kg adult, plasma volume is 3.05 L, extracellular fluid 13.6 L and total body water 40.2 L (Oie-Tozer constants; Coutinho et al., 2024). Binding to tissue components lowers C at a given A and raises V above total body water. In the Obach et al. (2008) data set (n = 667), Vss exceeds 40.2 L for 415 drugs (range 2.5 to 49,000 L).",
  "legend": "Vss of the selected drug (70 kg adult, logarithmic axis) with plasma, extracellular fluid and body water volumes marked.",
  "change": "Drug. Outputs: Vss, concentration after a 100 mg dose, ratio to body water."
 },
 "units/Bound and unbound drug": {
  "watch": "Plasma drug is partly bound to albumin and alpha-1 acid glycoprotein. The fraction unbound is fu = Cu / C, so Cu = fu x C. In the models used here only unbound drug crosses membranes, is cleared and binds the target. For the 554 drugs of the Obach et al. (2008) data set with a reported fu, the median is 0.25 (quartiles 0.06 and 0.70); fu is below 0.1 for 179 drugs and below 0.01 for 41.",
  "legend": "Left: total, unbound and bound concentration of the selected drug. Right: distribution of fu (n = 554).",
  "change": "Drug, total concentration. Outputs: Cu, bound concentration."
 },
 "elim/First-order elimination": {
  "watch": "Elimination is first order when its rate is proportional to the amount of drug present: dA/dt = -kA, so A(t) = A0 exp(-kt). The half-life, t1/2 = ln 2 / k = 0.693 / k, is independent of the amount, and the fraction 1 - exp(-k) is eliminated per hour. The elimination rate falls in proportion to A. Of a 100 mg dose, 50, 25 and 3.1 mg remain after 1, 2 and 5 half-lives.",
  "legend": "Amount in the body after a 100 mg dose, with markers at multiples of the half-life; table of amount and elimination rate at each multiple.",
  "change": "Half-life. Outputs: k, fraction eliminated per hour, amount and rate at each half-life."
 },
 "elim/Clearance": {
  "watch": "With A = V x C, the elimination rate is k x V x C. Clearance is defined as CL = k x V, so that rate = CL x C. CL has the dimensions of volume per time and is the volume of plasma completely cleared of drug per unit time. For a given V, k = CL / V. At equal concentrations, the elimination rates of two drugs are in the ratio of their clearances.",
  "legend": "Elimination rate against plasma concentration for two drugs; the slope of each line is CL.",
  "change": "Concentration, V, CL of drugs A and B. Outputs: A, rate, k, half-life."
 },
 "elim/Intravenous profile": {
  "watch": "After an intravenous bolus in a one-compartment model, C(t) = C0 exp(-kt), with C0 = Dose / V and k = CL / V. The half-life is t1/2 = 0.693 V / CL, and AUC(0 to infinity) = Dose / CL. On a log10 concentration axis the profile is linear with slope -k / 2.303. After 1, 2 and 3 half-lives, 50, 25 and 12.5% of C0 remain.",
  "legend": "Plasma concentration after an intravenous bolus; markers at 1, 2 and 3 half-lives.",
  "change": "Dose, V, CL, axis. Outputs: C0, k, half-life, AUC."
 },
 "elim/Volume and half-life": {
  "watch": "The half-life is determined by V and CL: t1/2 = 0.693 V / CL. For equal dose and CL, a drug with larger V has a lower C0 and a longer half-life, because the same clearance removes a smaller fraction of the amount in the body per unit time. The AUC, Dose / CL, is independent of V.",
  "legend": "Intravenous profiles of two drugs with equal dose and CL and different V.",
  "change": "CL, V of drugs A and B. Outputs: half-lives, C0, AUC."
 },
 "elim/Repeat dosing": {
  "watch": "On repeated dosing the drug accumulates until the amount eliminated per interval equals the dose. The average steady-state concentration is Css,avg = F x Dose / (CL x tau), independent of V. The accumulation ratio is R = 1 / (1 - exp(-k x tau)) with k = CL / V, and the steady-state peak is R times the first peak. Steady state is 90% approached after 3.3 half-lives.",
  "legend": "Plasma concentration after repeated 100 mg intravenous boluses at interval tau; dashed line, Css,avg.",
  "change": "tau, CL, V. Outputs: R, Css,avg, steady-state peak and trough, time to 90% of steady state."
 },
 "elim/Checking a record": {
  "watch": "Reported pharmacokinetic parameters are related by MRT = Vss / CL; with Vss in L/kg and CL in mL/min/kg, MRT (h) = Vss / CL x 1000 / 60. For a one-compartment drug, t1/2 = 0.693 x MRT. For the 667 drugs of Obach et al. (2008), the calculated MRT is within 10% of the reported value for 637 (median ratio 1.00). The value 0.693 x MRT is below the reported t1/2 for most drugs (median ratio 0.76), consistent with multiphasic disposition.",
  "legend": "Distributions of calculated over reported MRT and of 0.693 x MRT over reported t1/2 (n = 667); the selected drug is marked.",
  "change": "Drug. Outputs: reported and calculated values and their ratios."
 },
 "oral/Oral profile": {
  "watch": "After oral dosing with first-order absorption (rate constant ka), C(t) = F D ka / [V (ka - ke)] x [exp(-ke t) - exp(-ka t)], with ke = CL / V. The profile peaks at tmax = ln(ka / ke) / (ka - ke) and has AUC(0 to infinity) = F D / CL, which is the intravenous AUC multiplied by F. Cmax is lower and tmax later than after an intravenous dose of the same size.",
  "legend": "Plasma concentration after oral and intravenous doses of 100 mg.",
  "change": "F, CL, V, ka. Outputs: oral and intravenous AUC, Cmax, tmax, half-life."
 },
 "oral/Bioavailability from AUCs": {
  "watch": "Absolute bioavailability is F = (AUC_po / Dose_po) / (AUC_iv / Dose_iv), measured by administering both routes to the same subjects. By definition F = 1 for the intravenous route. The estimate assumes that CL is the same on both occasions and independent of dose, because AUC = F x Dose / CL. For Dose_po = 100 mg with AUC 8 mg x h/L and Dose_iv = 50 mg with AUC 10 mg x h/L, F = 0.4.",
  "legend": "Dose-normalized AUC for each route.",
  "change": "Both doses and both AUCs. Output: F."
 },
 "oral/Bioavailability as a product": {
  "watch": "Oral bioavailability is the product F = Fa x Fg x Fh of the fraction absorbed across the intestinal membrane, the fraction escaping gut-wall metabolism and the fraction escaping hepatic first-pass extraction. Fh = 1 - CLh / Q, where CLh is the hepatic blood clearance and Q the hepatic blood flow. Three terms of 0.7 give F = 0.34.",
  "legend": "Fraction of the dose remaining after each stage.",
  "change": "Fa, Fg, CLh, Q. Outputs: Fh, F, stage with the largest loss."
 },
 "met/Metabolic routes": {
  "watch": "Metabolism converts a drug to more polar compounds. Each enzyme group catalyses characteristic reactions, has a subcellular location and requires a cofactor, and an in vitro system measures a route only if it contains the enzyme and the cofactor. Liver microsomes are fragments of the endoplasmic reticulum that contain cytochrome P450 and UDP-glucuronosyltransferases; with NADPH they support P450 oxidation. Hepatocytes contain the hepatic enzymes of all four routes. The predictions in tab 07 use microsomes with NADPH and therefore cover oxidation only.",
  "legend": "Reaction, enzymes, covering in vitro system and coverage by the tab 07 prediction, for four routes.",
  "change": "Route. Outputs: reaction, enzymes, in vitro system, coverage."
 },
 "met/Enzyme kinetics": {
  "watch": "The rate of an enzyme-catalysed reaction is v = Vmax x S / (Km + S). For S much below Km, v is approximately (Vmax / Km) x S, and CLint = Vmax / Km. With Vmax in pmol/min/mg protein and Km in uM, CLint is in uL/min/mg. The clearance v / S = Vmax / (Km + S) falls as S rises. The first-order approximation overestimates v by the factor 1 + S / Km: 10% at S = 0.1 Km and 100% at S = Km.",
  "legend": "Left: rate against substrate concentration with the low-concentration tangent. Right: clearance v / S against concentration.",
  "change": "Vmax, Km, S. Outputs: v, CLint, error of the first-order approximation."
 },
 "met/Depletion assay": {
  "watch": "Substrate depletion at S much below Km is first order: ln C = ln C0 - kt, with k = ln 2 / t1/2 (in vitro). CLint (uL/min/mg) = k (1/min) / protein (mg/mL) x 1000. Scaling to the body uses 45 mg microsomal protein per g liver and 20 g liver per kg: CLint (mL/min/kg) = CLint (uL/min/mg) x 45 x 20 / 1000. For chlorpromazine (Obach, 1999), t1/2 = 25 min at 1 mg/mL gives 25 mL/min/kg.",
  "legend": "Left: percent remaining against time. Right: natural logarithm of percent remaining. Sampling times 0, 5, 15, 30, 45 and 60 min are marked.",
  "change": "In vitro half-life, protein concentration. Outputs: k, CLint per mg, scaled CLint."
 },
 "met/Clearance and extraction": {
  "watch": "For an organ with blood flow Q, the extraction ratio is E = (Cin - Cout) / Cin and the organ clearance is CL = Q x E, so CL cannot exceed Q. For the liver, the fraction of an absorbed dose that escapes first-pass extraction is Fh = 1 - E. Hepatic blood flow is taken as 21 mL/min/kg (Obach, 1999). Selecting a drug sets E to its observed nonrenal blood clearance divided by 21.",
  "legend": "Inlet and outlet concentration relative to the inlet value.",
  "change": "Q, E or drug. Outputs: CL, Fh."
 },
 "met/Total clearance": {
  "watch": "Organ clearances are additive: CL = CLh + CLr + CLother, and the fraction excreted unchanged is fe = CLr / CL. Renal clearance is the net result of filtration of unbound drug, active secretion and reabsorption. With GFR = 120 mL/min (7.2 L/h), filtration alone gives CLr = fu x 7.2 L/h; a higher CLr indicates net secretion and a lower one net reabsorption. Exposure is inversely proportional to CL, so loss of a route that carries a fraction s of CL multiplies the AUC by 1 / (1 - s).",
  "legend": "Components of total clearance.",
  "change": "CLh, CLr, CLother, fu. Outputs: CL, fe, renal clearance relative to filtration."
 },
 "vitro/What an assay measures": {
  "watch": "An in vitro assay measures one property of a compound under defined conditions. Conversion to a clinical quantity requires a scaling step that expresses the parameter on the scale of the body, and a model that combines it with other parameters. Six assays are tabulated with the parameter each yields and the course section that uses it. The next step follows one drug from a microsomal assay to a predicted clearance. Tabs 07 to 09 compare such predictions with observations.",
  "legend": "Measurement, parameter, link to the in vivo parameter and course location for six assays.",
  "change": "Assay. Outputs: measurement, parameter, scaling, course location."
 },
 "vitro/From assay to clearance": {
  "watch": "The scaled CLint of each drug (Obach, 1999) is corrected for binding: CL' = fu(blood) x CLint / fu(mic). With the hepatic blood flow Q = 21 mL/min/kg, the well-stirred model gives CL = Q x CL' / (Q + CL') and the parallel-tube model gives CL = Q x [1 - exp(-CL' / Q)]. The predicted blood clearance is compared with the observed nonrenal blood clearance after intravenous dosing. Tab 07 varies one stage at a time and scores the effect for all 29 drugs.",
  "legend": "Value at each stage for the selected drug.",
  "change": "Drug, model, stage. Outputs: predicted CL, fold error."
 },
 "vitro/Fold error": {
  "watch": "A prediction of a quantity that spans orders of magnitude is scored by the ratio r of the predicted to the observed value. The fold error is r, or 1 / r when r is below 1, with the direction stated. A 4-fold under-prediction and a 4-fold over-prediction are equal errors on this scale. A prediction is within 2-fold when 0.5 <= r <= 2.",
  "legend": "Predicted and observed values on a logarithmic axis; the shaded interval is within 2-fold. Table: observed and predicted clearance (mL/min/kg) for six drugs.",
  "change": "Predicted and observed values. Output: fold error."
 },
 "vitro/Average fold error and bias": {
  "watch": "Fold errors are summarized on the logarithmic scale. The average fold error is 10^mean(|log10 r|), the size of the typical error. The bias is 10^mean(log10 r); a value of 1 indicates balanced over- and under-prediction. The arithmetic mean of r is not used, because large over-predictions inflate it. For the starting values, r = 2, 0.5, 1, 4, 0.5 and 1 give an average fold error of 1.78, a bias of 1.12 and an arithmetic mean of 1.50.",
  "legend": "Log ratio of each drug; the dashed line marks the bias.",
  "change": "Predicted and observed values for six drugs. Outputs: average fold error, bias, arithmetic mean ratio, count within 2-fold."
 },
 "vitro/Why the log scale": {
  "watch": "Observed clearance in the Obach (1999) set spans 0.03 to 20 mL/min/kg, a 670-fold range. On linear axes the 2-fold band widens with the value, and the seven drugs below 1 mL/min/kg are compressed at the origin so that their errors cannot be read. On logarithmic axes the band has constant width. Fold errors are therefore plotted and averaged on the logarithmic scale in tabs 07 to 09.",
  "legend": "Parallel-tube predictions with both binding corrections against observed blood clearance (n = 29) on linear or logarithmic axes.",
  "change": "Axis scale. Outputs: number of drugs below 1 mL/min/kg, range."
 },
 "hep/Predicted against observed": {
  "watch": "Hepatic blood clearance is predicted from the microsomal CLint of Obach (1999), scaled with 45 mg protein per g liver and 20 g liver per kg. The observed value is the nonrenal blood clearance from intravenous studies (for chlorpromazine, an intramuscular dose). Agreement is summarized by the number of drugs within 2-fold, the average fold error and the bias, defined in tab 06. The same three measures are used throughout tabs 07 to 09.",
  "legend": "Predicted against observed clearance (n = 29); shaded band, within 2-fold; dashed line, identity.",
  "change": "Extraction model, binding correction. Outputs: within 2-fold, average fold error, bias."
 },
 "hep/Scaling to the liver": {
  "watch": "Microsomal CLint is scaled by the microsomal protein content per g liver (MPPGL) and the liver weight per kg body weight; Obach (1999) used 45 mg/g and 20 g/kg. Their product acts as one scaling factor on CLint. For the parallel-tube model with both binding corrections at factor 1.0, the bias is 0.48 and 16 of 29 drugs are within 2-fold. The average fold error is lowest (1.60) at a factor of about 3.2, and the bias is 1.0 at about 2.6.",
  "legend": "Left: predicted against observed clearance for the scalars set. Right: average fold error and bias against scaling factor.",
  "change": "MPPGL, liver weight, model. Outputs: average fold error, bias, within 2-fold, optimal factor."
 },
 "hep/Extraction models": {
  "watch": "The well-stirred model treats the liver as a single compartment: E = CL' / (Q + CL'). The parallel-tube model treats each sinusoid as a plug-flow tube: E = 1 - exp(-CL' / Q). The dispersion model interpolates between them through the dispersion number Dn, approaching the parallel-tube model as Dn tends to 0 and the well-stirred model as Dn tends to infinity. At equal CL', the well-stirred extraction ratio is 9% lower than the parallel-tube value where the latter is 0.2, and 18% lower where it is 0.5.",
  "legend": "Extraction ratio against binding-corrected CLint / Q for the three models; points, the 29 drugs at their observed extraction ratio.",
  "change": "Q, Dn, drug. Outputs: clearance predicted by each model."
 },
 "hep/Binding assumptions": {
  "watch": "Three treatments of binding are compared: none, fu(blood) only, and fu(blood) with fu(mic). Measured CLint is reduced by binding in the incubation, so applying fu(blood) alone lowers the prediction without correcting the measurement and over-corrects. For bases (n = 12) the average fold error is lowest without correction (1.31, against 1.60 with both fractions). For acids (n = 9) it is lowest with both (2.71, against 5.41 without).",
  "legend": "Average fold error by compound class and treatment; table, the five largest fold errors.",
  "change": "Extraction model, form of fu(blood). Outputs: average fold error by class."
 },
 "hep/Empirical scalars": {
  "watch": "An empirical scalar multiplies the predicted CLint by one factor, chosen so that the fitting set has a bias of 1. The 29 drugs were split at random into fitting and held-out sets (300 resamples). Fitted on all drugs, the factor is 2.6 and the average fold error falls from 2.14 to 1.62 (parallel-tube, both corrections). The in vitro data for all drugs come from one laboratory under one set of conditions, so the held-out score does not estimate transfer to another assay.",
  "legend": "Left: fitted factor over resamples. Right: held-out average fold error with and without the factor.",
  "change": "Number of fitting drugs, model. Outputs: median and 5th to 95th percentiles of the factor and of the held-out error."
 },
 "hep/Low-turnover compounds": {
  "watch": "In a depletion assay, a loss that does not exceed a set multiple of the assay variability cannot be distinguished from zero, and CLint is reported as a limit. For a multiple of 2, k(min) = -ln(1 - 2 CV) / T, and the lowest reportable scaled CLint is k(min) / protein x 45 x 20 (k in 1/min, protein in mg/mL). A half-life of 120 min at 10 mg/mL gives 0.52 mL/min/kg, the limit reported for warfarin (Obach, 1999). A prediction from the limit is an upper bound, and its distance from the observed value depends on the binding terms.",
  "legend": "Percent remaining against time, with the region of losses below twice the variability shaded. Panel: predictions at the limit for the selected drug.",
  "change": "Protein, incubation time, variability, CLint, drug, model. Outputs: lowest reportable CLint, prediction at the limit."
 },
 "hep/Microsomes against hepatocytes": {
  "watch": "Microsomal (uL/min/mg) and hepatocyte (uL/min/10^6 cells) CLint of 96 compounds with uncensored values in both assays (AstraZeneca data in ChEMBL; 96 of 187 compounds with both) are scaled with MPPGL and hepatocellularity, each multiplied by the liver weight per kg. Differences between the systems can reflect enzymes absent from an NADPH-supplemented microsomal incubation, cellular uptake, binding and the scalars. With 45 mg/g, 120 x 10^6 cells/g (assumed) and 20 g/kg, 62 of 96 compounds have the higher clearance in hepatocytes (median ratio 1.22).",
  "legend": "Scaled hepatocyte against scaled microsomal CLint; dashed line, identity; shaded band, within 2-fold.",
  "change": "MPPGL, hepatocellularity, liver weight. Outputs: number above identity, median ratio."
 },
 "hep/Choosing a method by class": {
  "watch": "The extended clearance classification system (ECCS; Varma et al., 2015) assigns a compound to a class from its ionization at pH 7, molecular weight and passive permeability, and predicts the rate-determining clearance mechanism. The cut-offs are an apparent permeability of 5 x 10^-6 cm/s in low-efflux MDCK cells and, for acids and zwitterions, MW 400 Da. The scheme predicted the mechanism correctly for about 92% of 307 compounds with a single mechanism contributing at least 70% of systemic clearance. Microsomal scaling measures metabolism and applies to classes 1A and 2.",
  "legend": "ECCS class map; the marked compound is set by the controls.",
  "change": "Ionization, MW, permeability, plasma protein binding. Outputs: class, predicted mechanism."
 },
 "dist/What Vss measures": {
  "watch": "In a two-term model, Vss = Vp + Kp x Vt, where Vp is the plasma volume, Vt the tissue volume and Kp the tissue to plasma concentration ratio. For a 70 kg adult, Vp = 3.05 L (0.0436 L/kg) and Vt = 37.2 L (0.151 + 0.38 L/kg, the Oie-Tozer constants). Kp = 1 gives a Vss of 40 L (0.57 L/kg), and Kp = 10 gives 375 L.",
  "legend": "Distribution of a 100 mg dose between plasma and tissue at equilibrium; second bar, Vss on a scale to 400 L.",
  "change": "Kp. Outputs: Vss, concentrations, amounts in plasma and tissue."
 },
 "dist/Volume from binding": {
  "watch": "The Oie-Tozer equation divides Vss into plasma, extracellular and tissue terms: Vss = Vp + fup x Ve + Re/i x Vp x (1 - fup) + Vr x fup / fut. The constants are Vp = 0.0436, Ve = 0.151 and Vr = 0.38 L/kg, and Re/i = 1.4 (Coutinho et al., 2024). Only the tissue term increases without limit as fut decreases. For fup = fut = 1, Vss = 0.57 L/kg.",
  "legend": "Vss against fut at the fup set, with curves for fup = 0.001, 0.01, 0.1 and 1. Panel: the three terms.",
  "change": "fup, fut. Outputs: Vss and the share of each term."
 },
 "dist/Implied tissue binding": {
  "watch": "Solving the Oie-Tozer equation for fut gives fut = Vr x fup / (Vss - Vp - fup x Ve - Re/i x Vp x (1 - fup)). The value is undefined where Vss is below the sum of the plasma and extracellular terms, and exceeds 1 where Vss lies below the fut = 1 curve. For 554 drugs (Obach et al., 2008), the implied fut is undefined for 26 and above 1 for 76; the median over the remaining 528 is 0.09.",
  "legend": "Observed Vss against fup (n = 554) with Oie-Tozer curves at fut = 1, 0.1, 0.01 and 0.001.",
  "change": "Drug. Outputs: counts, median implied fut."
 },
 "dist/Predicting tissue binding": {
  "watch": "fut was predicted for the 163 drugs with fup and a measured logD (AstraZeneca data) by (a) fut = 1, (b) the Lombardo equation as stated by Coutinho et al. (2024), log fut = 0.0080 - 0.2294 logD - 0.9311 fi + 0.8885 log fup, with fi from the measured pKa (fi = 0 where none is reported), and (c) the median implied fut, fitted on the same drugs. The source applies the equation with logP to compounds that are neutral at pH 7.4. Here it is applied with logD to all classes.",
  "legend": "Predicted against observed Vss. Table: within 2-fold, average fold error and bias by ionization class.",
  "change": "Source of fut. Outputs: scoreboard by class."
 },
 "dist/Ionization class": {
  "watch": "The 172 drugs with a measured logD are grouped by the AstraZeneca pKa values: acids, bases, zwitterions and no pKa reported. A missing pKa can indicate no ionizable group in the measured range, a pKa outside it, or no measurement, so this group is a mixture and not a class. Medians for acids, bases, zwitterions and no pKa reported: Vss 0.19, 2.2, 1.7 and 1.3 L/kg; fup 0.05, 0.36, 0.75 and 0.15; logD 0.31, 1.67, -0.35 and 1.47.",
  "legend": "Selected variable by group; bars mark the medians.",
  "change": "Variable. Outputs: group medians."
 },
 "dist/Half-life from CL and Vss": {
  "watch": "For a one-compartment drug, t1/2 = 0.693 x Vss / CL. For 667 drugs (Obach et al., 2008) this value is within 2-fold of the reported terminal half-life for 554 (average fold error 1.51, bias 0.68), because disposition is multiphasic. For log-normal errors in predicted CL and Vss with fold errors fc and fv and correlation rho, the variance of ln t1/2 is (ln fv)^2 + (ln fc)^2 - 2 x rho x ln fv x ln fc. Independent errors therefore give a larger error in t1/2 than in either input, and positive correlation reduces it.",
  "legend": "Left: 0.693 x Vss / CL against reported t1/2. Right: distribution of predicted over true t1/2 from 4000 draws.",
  "change": "Fold errors of CL and Vss, correlation. Outputs: fraction within 2-fold, geometric standard deviation."
 },
 "dist/Blood to plasma ratio": {
  "watch": "Hepatic clearance predicted from in vitro data is a blood clearance, whereas clearance is often reported for plasma: CL(blood) = CL(plasma) / B:P. In the Obach (1999) set B:P ranges from 0.53 to 1.5. Against the observed blood clearance, the parallel-tube prediction with both corrections has an average fold error of 2.14 and a bias of 0.48. Against the observed plasma clearance the values are 1.93 and 0.64. The improvement arises because the under-prediction is offset by the higher plasma value (B:P below 1), and it does not indicate a better prediction.",
  "legend": "Predicted blood clearance against observed blood or plasma clearance (n = 29).",
  "change": "Comparison basis. Outputs: scoreboard by class."
 },
 "dist/Sensitivity of Vss": {
  "watch": "Where the tissue term dominates, Vss is proportional to fup and inversely proportional to fut, so a 2-fold change in either changes Vss 2-fold. At fup = fut = 0.03 the tissue term is 78% of Vss. A 2-fold change in Ve changes Vss by 1% or less, in Re/i by 6 to 12% and in Vp by 10 to 21%.",
  "legend": "Vss relative to its unperturbed value when each input is divided and multiplied by the perturbation factor.",
  "change": "fup, fut, perturbation factor. Outputs: Vss ratio for each input."
 },
 "abs/Hepatic first-pass limit": {
  "watch": "For complete absorption and gut-wall escape (Fa = Fg = 1), F = Fh = 1 - CLb / Q, which is an upper bound on bioavailability. Fh was calculated from the observed nonrenal blood clearance of the 29 drugs of Obach (1999), on the assumption that nonrenal clearance is hepatic. With Q = 21 mL/min/kg, Fh is below 0.5 for 11 drugs, below 0.2 for 5 and at least 0.9 for 8.",
  "legend": "Fh for each drug, in descending order; colour, compound class.",
  "change": "Q. Outputs: counts below thresholds; drug details."
 },
 "abs/Solubility and dose": {
  "watch": "The dose number is D0 = (Dose / V) / S, with V the volume of fluid and S the solubility; D0 above 1 indicates that the dose cannot dissolve in V. For the 9,980 compounds of AqSolDB (Sorkun et al., 2019), S in mg/mL is 10^logS x MW. The set comprises chemicals in general, not drugs, and its values are not at a controlled intestinal pH. For 100 mg in 250 mL, D0 exceeds 1 for 4,712 compounds.",
  "legend": "Distribution of log10 D0; shaded bars, D0 above 1.",
  "change": "Dose, volume. Outputs: number and percentage with D0 above 1."
 },
 "abs/pH-dependent solubility": {
  "watch": "For a monoprotic acid, S = S0 x (1 + 10^(pH - pKa)). For a monoprotic base, S = S0 x (1 + 10^(pKa - pH)). S0 is the intrinsic solubility. The equations neglect salt solubility limits and micellar solubilization, so S at low pH is an upper limit for a base. The solubility of a base falls as pH rises, so raising gastric pH, for example by acid suppression, raises D0 in the stomach. D0 at intestinal pH indicates whether the dose can remain dissolved there.",
  "legend": "log10 D0 against pH for the dose and volume set; markers at gastric and intestinal pH.",
  "change": "Type, pKa, S0, dose, gastric and intestinal pH. Outputs: S and D0 at each pH."
 },
 "abs/Permeability descriptors": {
  "watch": "Caco-2 apparent permeability (log10 Papp, cm/s; Wang et al., 2016; n = 910) decreases with TPSA (Spearman rho = -0.63) and with hydrogen-bond donors (-0.65), more weakly with molecular weight (-0.38) and hydrogen-bond acceptors (-0.45), and increases weakly with Crippen logP (0.28). No single descriptor orders the compounds closely; Wang et al. built their model on 30 selected descriptors.",
  "legend": "log10 Papp against the selected descriptor; line, median of equal-count bins.",
  "change": "Descriptor. Output: Spearman correlation."
 },
 "abs/Property rules": {
  "watch": "A rule flags a compound as poorly absorbed when it breaks enough thresholds. Rule of five (Lipinski): MW above 500, logP above 5, more than 5 donors, more than 10 acceptors. Veber: more than 10 rotatable bonds, TPSA above 140 A^2. The 578 compounds of Hou et al. (2007) comprise 78 with a fraction absorbed of 30% or less (poor) and 500 above 30% (good), so calling every compound good is correct for 86.5%. The rule of five with one violation scores 86.7%. The ROC area of Crippen logP is 0.27, below 0.5, so poorly absorbed compounds have the lower logP.",
  "legend": "Left: classification of poor and good compounds by the rule set. Right: ROC area of each descriptor for poor against good.",
  "change": "Preset, thresholds, violations required. Outputs: compounds caught and flagged, accuracy, baseline, balanced accuracy."
 }
};
