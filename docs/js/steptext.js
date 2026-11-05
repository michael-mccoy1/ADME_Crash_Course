"use strict";
/* Step text. watch: model, equation, assumptions and result. legend: figure caption. change: controls and outputs. */
var STEPTEXT = {
 "why/Concentration and effect": {
  "watch": "Effect follows the Emax model, E = Emax C^h / (EC50^h + C^h), with plasma concentration taken as the target concentration. After an intravenous bolus, C exceeds the EC50 for ln(C0 / EC50) / k, so doubling the dose extends the interval by one half-life, ln 2 / k.",
  "legend": "Left: effect against concentration. Right: plasma concentration after an intravenous bolus (V = 50 L); the shaded interval marks C above the EC50. Grey dashed curves are pinned scenarios. Hovering on either plot marks the same concentration on both.",
  "change": "EC50, h, dose, CL, concentration axis; drag the EC50 line or the C0 point; Pin keeps up to three scenarios; export as an image (PNG) and a table (CSV). Outputs: effect at C0, half-life, time above the EC50."
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
  "change": "Edit any field; drag the CL line or click a drug on the strip; hover for names; export as an image (PNG) and a table (CSV). Outputs: converted values, percentile of CL in the set, fraction of hepatic blood flow."
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
  "change": "Half-life, axis; drag the half-life point; hover for amount and rate; Pin keeps up to three; export as an image (PNG) and a table (CSV). Outputs: k, fraction eliminated per hour, amount and rate at each half-life."
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
  "legend": "Plasma concentration after oral and intravenous doses of 100 mg; the shaded area under the oral curve is proportional to the oral AUC. Grey dashed curves are pinned oral profiles.",
  "change": "F, CL, V, ka; drag the oral peak (vertical sets F, horizontal sets ka) or the intravenous starting point (sets V); hover for both concentrations; Pin keeps up to three; export as an image (PNG) and a table (CSV). Outputs: oral and intravenous AUC, Cmax, tmax, half-life."
 },
 "oral/Bioavailability from AUCs": {
  "watch": "F = (AUC_po / Dose_po) / (AUC_iv / Dose_iv) from crossover administration, assuming equal CL on both occasions and dose-independent CL. For 100 mg orally with AUC 8 mg x h/L and 50 mg intravenously with AUC 10 mg x h/L, F = 0.4.",
  "legend": "Left: dose-normalized AUC for each route. Right: the intravenous and oral profiles implied by the AUCs (V = 50 L, ka = 1 per h, equal CL), with the area under each curve shaded.",
  "change": "Both doses and both AUCs; drag a bar top to set its AUC; hover the profiles for concentration and AUC(0 to t); Pin lists F for kept scenarios; PNG and CSV export. Output: F."
 },
 "oral/Bioavailability as a product": {
  "watch": "F = Fa x Fg x Fh (fraction absorbed, fraction escaping gut-wall metabolism, fraction escaping hepatic first-pass extraction), with Fh = 1 - CLh / Q. Three terms of 0.7 give F = 0.34.",
  "legend": "Fraction of the dose remaining after each stage; dashed grey ticks mark pinned scenarios.",
  "change": "Fa, Fg, CLh, Q; drag the end of a bar to set its factor (the last bar sets CLh through Fh = 1 - CLh / Q); hover for the loss at each stage; Pin; PNG and CSV export. Outputs: Fh, F, stage with the largest loss."
 },
 "met/Metabolic routes": {
  "watch": "An in vitro system measures a route only if it contains the enzyme and its cofactor. Liver microsomes contain cytochrome P450 and UDP-glucuronosyltransferases and, with NADPH, support P450 oxidation. Hepatocytes contain the hepatic enzymes of all four routes. The tab 07 predictions use microsomes with NADPH and cover oxidation only.",
  "legend": "Share of one compound's clearance by route (stacked bar; hatched segments are routes not measured by the systems selected), with the in vitro systems that cover each route.",
  "change": "Drag the dividers to set route shares; click a system column to run it; click a route for its details; export as an image (PNG) and a table (CSV). Outputs: share of clearance captured, routes missed, reaction, enzymes, system."
 },
 "met/Enzyme kinetics": {
  "watch": "v = Vmax S / (Km + S). For S << Km, v is approximately (Vmax / Km) S and CLint = Vmax / Km (uL/min/mg for Vmax in pmol/min/mg and Km in uM). The first-order approximation overestimates v by 1 + S / Km: 10% at S = 0.1 Km and 100% at S = Km.",
  "legend": "Left: rate against substrate concentration with the low-concentration tangent. Right: clearance v / S against concentration. The vertical line marks the substrate concentration set; grey dashed curves are pinned parameter sets.",
  "change": "Vmax, Km, S; drag the Vmax line, the Km point or the substrate line; hover for values on both plots; Pin keeps up to three; PNG and CSV export. Outputs: v, CLint, error of the first-order approximation."
 },
 "met/Depletion assay": {
  "watch": "For S << Km, ln C = ln C0 - kt with k = 0.693 / t1/2. CLint (uL/min/mg) = k (1/min) / protein (mg/mL) x 1000; scaled CLint (mL/min/kg) = CLint x 45 x 20 / 1000 (45 mg protein per g liver, 20 g liver per kg). Chlorpromazine (Obach, 1999): t1/2 = 25 min at 1 mg/mL gives 25 mL/min/kg.",
  "legend": "Left: percent remaining against time. Right: natural logarithm of percent remaining. The points are the sampling times 0, 5, 15, 30, 45 and 60 min; the line is the least-squares fit of ln(percent) against time.",
  "change": "Half-life of the generated data, protein concentration; drag any point on either plot and the fit follows; Regenerate resets the points; PNG and CSV export. Outputs: fitted k and half-life, CLint per mg, scaled CLint."
 },
 "met/Clearance and extraction": {
  "watch": "E = (Cin - Cout) / Cin and CL = Q x E, so CL cannot exceed Q; for the liver, Fh = 1 - E. Hepatic blood flow is 21 mL/min/kg (Obach, 1999). Selecting a drug sets E to its observed nonrenal blood clearance divided by 21.",
  "legend": "Inlet and outlet concentration relative to the inlet value (left), and observed CL / Q of 29 drugs with the selected E marked (right).",
  "change": "Q, E or drug; drag the outlet bar top or the line on the strip to set E; click a drug on the strip; Pin keeps E values; PNG and CSV export. Outputs: CL, Fh."
 },
 "met/Total clearance": {
  "watch": "CL = CLh + CLr + CLother and fe = CLr / CL. With GFR = 120 mL/min (7.2 L/h), filtration alone gives CLr = fu x 7.2 L/h; a higher CLr indicates net secretion and a lower one net reabsorption. Loss of a route that carries a fraction s of CL multiplies the AUC by 1 / (1 - s).",
  "legend": "Components of total clearance; the dashed outline under the bar is the clearance by filtration alone.",
  "change": "CLh, CLr, CLother, fu; drag the end of a segment; hover for the share; Pin compares totals; PNG and CSV export. Outputs: CL, fe, renal clearance relative to filtration."
 },
 "vitro/What an assay measures": {
  "watch": "Each assay yields a parameter that requires a scaling step and a model to predict a clinical quantity (table). Six assays are listed with the parameter, the scaling and the course section that uses them.",
  "legend": "Left: measurement, parameter, link to the in vivo parameter and course location for the selected assay, with the calculation at the value set. Right: public distribution of that quantity; the line marks the value set.",
  "change": "Assay, value; drag the line or click a bar on the distribution; export as an image (PNG) and a table (CSV). Outputs: scaled quantity, percentile within the public data."
 },
 "vitro/From assay to clearance": {
  "watch": "CL' = fu(blood) x CLint / fu(mic). With Q = 21 mL/min/kg, the well-stirred model gives CL = Q x CL' / (Q + CL') and the parallel-tube model CL = Q x [1 - exp(-CL' / Q)]. Predictions are compared with the observed nonrenal blood clearance after intravenous dosing (Obach, 1999).",
  "legend": "Value at each stage for the selected drug (left). Right: predicted blood CL against corrected CLint for both models, with the observed value; the point marks this drug.",
  "change": "Drug, model, stage, CLint scale factor; drag the point along the curve to change the scale factor; Match observation sets the factor that reproduces the observed CL. Outputs: predicted CL, fold error, CLint needed."
 },
 "vitro/Fold error": {
  "watch": "Fold error is r = predicted / observed, or 1 / r when r is below 1, with the direction stated. A prediction is within 2-fold when 0.5 <= r <= 2.",
  "legend": "Predicted and observed values on a logarithmic axis; the shaded interval is within 2-fold. Table: observed and predicted clearance (mL/min/kg) for six drugs.",
  "change": "Predicted and observed values; drag either dot on the axis; click a drug in the table to load its pair; hover for the ratio to each; PNG and CSV export. Output: fold error."
 },
 "vitro/Average fold error and bias": {
  "watch": "Average fold error = 10^mean(|log10 r|). Bias = 10^mean(log10 r); 1 indicates balanced over- and under-prediction. The arithmetic mean of r is not used because large over-predictions inflate it. For r = 2, 0.5, 1, 4, 0.5 and 1: average fold error 1.78, bias 1.12, arithmetic mean 1.50.",
  "legend": "Log ratio of each drug; the dotted lines mark 2-fold and the dashed line marks the bias.",
  "change": "Predicted and observed values for six drugs; drag a dot to set that drug's predicted value; PNG and CSV export. Outputs: average fold error, bias, arithmetic mean ratio, count within 2-fold."
 },
 "vitro/Why the log scale": {
  "watch": "Observed clearance in the Obach (1999) set spans 0.03 to 20 mL/min/kg (670-fold). On linear axes the 2-fold band widens with the value and the seven drugs below 1 mL/min/kg are compressed at the origin. Fold errors are plotted and averaged on the logarithmic scale in tabs 07 to 09.",
  "legend": "Parallel-tube predictions with both binding corrections against observed blood clearance (n = 29) on linear or logarithmic axes.",
  "change": "Axis scale; hover for names; click a drug or drag a rectangle to select several; PNG and CSV export. Outputs: number of drugs below 1 mL/min/kg, range, and for a selection the average fold error, bias and count within 2-fold."
 },
 "hep/Predicted against observed": {
  "watch": "CLint from Obach (1999) is scaled with 45 mg protein per g liver and 20 g liver per kg. Observed values are nonrenal blood clearances from intravenous studies (chlorpromazine, intramuscular). Agreement is summarized by the number within 2-fold, the average fold error and the bias (tab 06), used throughout tabs 07 to 09.",
  "legend": "Predicted against observed clearance (n = 29); shaded band, within 2-fold; dashed line, identity.",
  "change": "Extraction model, binding correction; hover for names and values; drag a rectangle to select drugs for their average fold error, bias and count within 2-fold; export as an image (PNG) and a table (CSV). Outputs: within 2-fold, average fold error, bias."
 },
 "hep/Scaling to the liver": {
  "watch": "Scaling uses microsomal protein per g liver (MPPGL) and liver weight per kg (Obach, 1999: 45 mg/g, 20 g/kg), acting as one factor on CLint. For the parallel-tube model with both binding corrections at factor 1.0, bias = 0.48 and 16 of 29 drugs are within 2-fold. The average fold error is lowest (1.60) at a factor of about 3.2, and bias = 1.0 at about 2.6.",
  "legend": "Left: predicted against observed clearance for the scalars set. Right: average fold error and bias against scaling factor.",
  "change": "MPPGL, liver weight, model; drag the factor marker on the right plot to set MPPGL; hover for the scores at any factor; drag a rectangle on the scatter to select drugs; PNG and CSV export. Outputs: average fold error, bias, within 2-fold, optimal factor."
 },
 "hep/Extraction models": {
  "watch": "Well-stirred: E = CL' / (Q + CL'). Parallel-tube: E = 1 - exp(-CL' / Q). The dispersion model approaches parallel-tube as Dn tends to 0 and well-stirred as Dn tends to infinity. At equal CL', the well-stirred E is 9% lower than the parallel-tube value where the latter is 0.2, and 18% lower where it is 0.5.",
  "legend": "Extraction ratio against binding-corrected CLint / Q for the three models; points, the 29 drugs at their observed extraction ratio.",
  "change": "Q, Dn, drug; hover a point for its values; PNG and CSV export. Outputs: clearance predicted by each model."
 },
 "hep/Binding assumptions": {
  "watch": "Treatments: none, fu(blood) only, and fu(blood) with fu(mic). Measured CLint is already reduced by incubation binding, so fu(blood) alone over-corrects. For bases (n = 12) the average fold error is lowest without correction (1.31, against 1.60 with both); for acids (n = 9), with both (2.71, against 5.41 without).",
  "legend": "Average fold error by compound class and treatment; table, the five largest fold errors.",
  "change": "Extraction model, form of fu(blood); hover a bar for the score of that class and treatment; PNG and CSV export. Outputs: average fold error by class."
 },
 "hep/Empirical scalars": {
  "watch": "The factor is chosen so that the fitting set has bias 1 (300 random fitting and held-out splits of the 29 drugs). Fitted on all drugs it is 2.6, and the average fold error falls from 2.14 to 1.62 (parallel-tube, both corrections). All in vitro data come from one laboratory, so the held-out score does not estimate transfer to another assay.",
  "legend": "Left: fitted factor over resamples. Right: held-out average fold error with and without the factor.",
  "change": "Number of fitting drugs, model; hover a bin for its counts; PNG export. Outputs: median and 5th to 95th percentiles of the factor and of the held-out error."
 },
 "hep/Low-turnover compounds": {
  "watch": "A loss below a set multiple of the assay variability is reported as a CLint limit. For a multiple of 2, k(min) = -ln(1 - 2 CV) / T, and the lowest reportable scaled CLint is k(min) / protein x 45 x 20. A half-life of 120 min at 10 mg/mL gives 0.52 mL/min/kg, the warfarin limit (Obach, 1999). A prediction from the limit is an upper bound.",
  "legend": "Percent remaining against time, with the region of losses below twice the variability shaded. Panel: predictions at the limit for the selected drug.",
  "change": "Protein, incubation time, variability, CLint, drug, model; drag the CLint point vertically and the incubation marker horizontally; hover for the loss at any time; PNG export. Outputs: lowest reportable CLint, prediction at the limit."
 },
 "hep/Microsomes against hepatocytes": {
  "watch": "CLint of 96 compounds with uncensored values in both assays (AstraZeneca data in ChEMBL; 96 of 187 with both) is scaled with MPPGL and hepatocellularity, each times liver weight per kg. Differences can reflect enzymes absent from an NADPH-supplemented incubation, uptake, binding and the scalars. With 45 mg/g, 120 x 10^6 cells/g (assumed) and 20 g/kg, 62 of 96 have the higher clearance in hepatocytes (median ratio 1.22).",
  "legend": "Scaled hepatocyte against scaled microsomal CLint; dashed line, identity; shaded band, within 2-fold.",
  "change": "MPPGL, hepatocellularity, liver weight; hover for values; drag a rectangle to select compounds; PNG and CSV export. Outputs: number above identity, median ratio."
 },
 "hep/Choosing a method by class": {
  "watch": "The extended clearance classification system (Varma et al., 2015) assigns a class from ionization at pH 7, MW and passive permeability (cut-offs: 5 x 10^-6 cm/s in low-efflux MDCK cells; MW 400 Da for acids and zwitterions) and predicts the rate-determining mechanism. It was correct for about 92% of 307 compounds with one mechanism contributing at least 70% of clearance. Microsomal scaling applies to classes 1A and 2.",
  "legend": "ECCS class map; the marked compound is set by the controls.",
  "change": "Ionization, MW, permeability, plasma protein binding; drag the marked compound on the map; hover for the class at any position; PNG export. Outputs: class, predicted mechanism."
 },
 "dist/What Vss measures": {
  "watch": "Vss = Vp + Kp x Vt. For a 70 kg adult, Vp = 3.05 L and Vt = 37.2 L (0.0436 and 0.151 + 0.38 L/kg; Oie-Tozer constants). Kp = 1 gives 40 L (0.57 L/kg) and Kp = 10 gives 375 L.",
  "legend": "Distribution of a 100 mg dose between plasma and tissue at equilibrium; second bar, Vss on a scale to 400 L.",
  "change": "Kp; drag the plasma share boundary or the end of the volume bar to set Kp; hover the bars for amounts and volumes; export as an image (PNG). Outputs: Vss, concentrations, amounts in plasma and tissue."
 },
 "dist/Volume from binding": {
  "watch": "Vss = Vp + fup Ve + Re/i Vp (1 - fup) + Vr fup / fut, with Vp = 0.0436, Ve = 0.151 and Vr = 0.38 L/kg and Re/i = 1.4 (Coutinho et al., 2024). Only the tissue term is unbounded as fut decreases. At fup = fut = 1, Vss = 0.57 L/kg.",
  "legend": "Vss against fut at the fup set, with curves for fup = 0.001, 0.01, 0.1 and 1. Panel: the three terms.",
  "change": "fup, fut; drag the point (horizontal sets fut, vertical sets fup); hover for Vss at any fut; PNG export. Outputs: Vss and the share of each term."
 },
 "dist/Implied tissue binding": {
  "watch": "fut = Vr fup / (Vss - Vp - fup Ve - Re/i Vp (1 - fup)); undefined where Vss is below the plasma and extracellular terms, and above 1 where Vss lies below the fut = 1 curve. For 554 drugs (Obach et al., 2008) it is undefined for 26 and above 1 for 76; the median of the remaining 528 is 0.09.",
  "legend": "Observed Vss against fup (n = 554) with Oie-Tozer curves at fut = 1, 0.1, 0.01 and 0.001.",
  "change": "Drug; hover for names and values; drag a rectangle to select drugs; PNG and CSV export. Outputs: counts, median implied fut."
 },
 "dist/Predicting tissue binding": {
  "watch": "fut was predicted for 163 drugs with fup and measured logD (AstraZeneca) by (a) fut = 1, (b) the Lombardo equation as stated by Coutinho et al. (2024), log fut = 0.0080 - 0.2294 logD - 0.9311 fi + 0.8885 log fup, with fi from measured pKa (0 if none), and (c) the median implied fut, fitted on the same drugs. The source applies the equation with logP to compounds neutral at pH 7.4; here it is applied with logD to all classes.",
  "legend": "Predicted against observed Vss. Table: within 2-fold, average fold error and bias by ionization class.",
  "change": "Source of fut; hover for names and values; drag a rectangle to select drugs for their score; PNG and CSV export. Outputs: scoreboard by class."
 },
 "dist/Ionization class": {
  "watch": "172 drugs with measured logD, grouped by AstraZeneca pKa. The group with no pKa reported mixes compounds without an ionizable group, with a pKa outside the measured range, and unmeasured. Medians (acids, bases, zwitterions, no pKa): Vss 0.19, 2.2, 1.7 and 1.3 L/kg; fup 0.05, 0.36, 0.75 and 0.15; logD 0.31, 1.67, -0.35 and 1.47.",
  "legend": "Selected variable by group; bars mark the medians.",
  "change": "Variable; hover for names and values; drag a rectangle to select drugs; PNG export. Outputs: group medians."
 },
 "dist/Half-life from CL and Vss": {
  "watch": "For a one-compartment drug t1/2 = 0.693 Vss / CL; for 667 drugs (Obach et al., 2008) it is within 2-fold of the reported terminal half-life for 554 (average fold error 1.51, bias 0.68). For log-normal errors in CL and Vss (fold errors fc and fv, correlation rho), var(ln t1/2) = (ln fv)^2 + (ln fc)^2 - 2 rho ln fv ln fc.",
  "legend": "Left: 0.693 x Vss / CL against reported t1/2. Right: distribution of predicted over true t1/2 from 4000 draws.",
  "change": "Fold errors of CL and Vss, correlation; hover for names and bin counts; drag a rectangle on the scatter to select drugs; PNG and CSV export. Outputs: fraction within 2-fold, geometric standard deviation."
 },
 "dist/Blood to plasma ratio": {
  "watch": "CL(blood) = CL(plasma) / B:P; B:P is 0.53 to 1.5 in the Obach (1999) set. The parallel-tube prediction with both corrections has an average fold error of 2.14 and a bias of 0.48 against blood clearance, and 1.93 and 0.64 against plasma clearance. The improvement reflects the higher plasma value offsetting the under-prediction (B:P below 1) and not a better prediction.",
  "legend": "Predicted blood clearance against observed blood or plasma clearance (n = 29).",
  "change": "Comparison basis; hover for names and values; drag a rectangle to select drugs; PNG and CSV export. Outputs: scoreboard by class."
 },
 "dist/Sensitivity of Vss": {
  "watch": "Where the tissue term dominates, Vss is proportional to fup / fut. At fup = fut = 0.03 the tissue term is 78% of Vss; 2-fold changes in Ve, Re/i and Vp change Vss by 1% or less, 6 to 12% and 10 to 21%.",
  "legend": "Vss relative to its unperturbed value when each input is divided and multiplied by the perturbation factor.",
  "change": "fup, fut, perturbation factor; hover a bar for its Vss ratio; PNG export. Outputs: Vss ratio for each input."
 },
 "abs/Hepatic first-pass limit": {
  "watch": "For Fa = Fg = 1, F = Fh = 1 - CLb / Q, an upper bound. Fh from the observed nonrenal blood clearance of the 29 drugs of Obach (1999), assuming nonrenal clearance is hepatic: with Q = 21 mL/min/kg, Fh is below 0.5 for 11 drugs, below 0.2 for 5 and at least 0.9 for 8.",
  "legend": "Fh for each drug, in descending order; colour, compound class.",
  "change": "Q; hover a bar for the drug; export as an image (PNG) and a table (CSV). Outputs: counts below thresholds; drug details."
 },
 "abs/Solubility and dose": {
  "watch": "D0 = (Dose / V) / S; D0 above 1 indicates incomplete dissolution in V. S (mg/mL) = 10^logS x MW for the 9,980 AqSolDB compounds (Sorkun et al., 2019), which are chemicals in general, not drugs, at uncontrolled pH. For 100 mg in 250 mL, D0 exceeds 1 for 4,712.",
  "legend": "Distribution of log10 D0; shaded bars, D0 above 1.",
  "change": "Dose, volume; drag the histogram sideways to change the dose; hover for bin counts; PNG export. Outputs: number and percentage with D0 above 1."
 },
 "abs/pH-dependent solubility": {
  "watch": "Monoprotic acid: S = S0 (1 + 10^(pH - pKa)); base: S = S0 (1 + 10^(pKa - pH)). Salt solubility limits and micellar solubilization are neglected, so S at low pH is an upper limit for a base. Raising gastric pH, for example by acid suppression, raises D0 in the stomach; D0 at intestinal pH indicates whether the dose remains dissolved.",
  "legend": "log10 D0 against pH for the dose and volume set; markers at gastric and intestinal pH.",
  "change": "Type, pKa, S0, dose, gastric and intestinal pH; drag the gastric, intestinal or pKa markers; hover for S and D0 at any pH; PNG export. Outputs: S and D0 at each pH."
 },
 "abs/Permeability descriptors": {
  "watch": "Caco-2 log10 Papp (Wang et al., 2016; n = 910) correlates with TPSA (Spearman rho = -0.63), donors (-0.65), MW (-0.38), acceptors (-0.45) and Crippen logP (+0.28). Wang et al. built their model on 30 selected descriptors.",
  "legend": "log10 Papp against the selected descriptor; line, median of equal-count bins.",
  "change": "Descriptor; hover for names and values; drag a rectangle to select compounds for their medians; PNG and CSV export. Output: Spearman correlation."
 },
 "abs/Property rules": {
  "watch": "Rule of five (Lipinski): MW above 500, logP above 5, donors above 5, acceptors above 10. Veber: rotatable bonds above 10, TPSA above 140 A^2. Of the 578 compounds of Hou et al. (2007), 78 have a fraction absorbed of 30% or less (poor). Calling all compounds good scores 86.5%, and the rule of five with one violation 86.7%. The ROC area of Crippen logP is 0.27: poorly absorbed compounds have lower logP.",
  "legend": "Left: classification of poor and good compounds by the rule set. Right: ROC area of each descriptor for poor against good.",
  "change": "Preset, thresholds, violations required; hover a bar for its counts or AUC; PNG export. Outputs: compounds caught and flagged, accuracy, baseline, balanced accuracy."
 },
 "ddi/Reversible inhibition": {
  "watch": "For a competitive inhibitor of the enzyme that clears the substrate, AUCR = 1 + [I] / Ki. With a fraction fm of clearance through the inhibited enzyme, AUCR = 1 / [fm / (1 + [I] / Ki) + 1 - fm], which approaches 1 / (1 - fm) as [I] / Ki increases. An AUC ratio of 2 or more is the usual positive threshold; it is reached at [I] / Ki = 1 when fm = 1.",
  "legend": "AUC ratio against [I] / Ki for fm = 1, 0.9, 0.7, 0.5 and 0.3 (grey) and for the fm set (teal). Dashed lines: AUC ratio 2, [I] / Ki = 1 and the ceiling 1 / (1 - fm). Grey dashed curves are pinned values of fm.",
  "change": "[I], Ki, fm; drag the point (horizontal sets [I], vertical sets fm); hover for the ratio at any [I] / Ki; Pin keeps up to three; export as an image (PNG) and a table (CSV). Outputs: AUC ratio, ceiling, clearance reduction."
 },
 "ddi/Inhibitor concentration": {
  "watch": "Ito et al. (2004) used four estimates of the inhibitor concentration: the average during repeated oral dosing, [I]av = (D / tau) / (CL/F); the unbound average, fu x [I]av; the maximum, [I]max = [I]av k tau / (1 - exp(-k tau)); and the maximum concentration at the liver inlet, [I]in = [I]av + ka Fa D / Qh, with Qh = 1610 mL/min. Each is divided by Ki to give the ratio that enters the AUC ratio.",
  "legend": "Four inhibitor concentrations for the regimen set (logarithmic axis, uM) with the value of Ki as a dashed line; bar labels give [I] and [I] / Ki.",
  "change": "Dose, MW, interval, CL/F, half-life, ka x Fa, fu, Ki; drag the Ki line; hover a bar for [I] / Ki and the AUC ratio at fm = 1; PNG and CSV export. Outputs: the four concentrations and ratios."
 },
 "ddi/Predicted against observed AUC ratio": {
  "watch": "Observed AUC ratios from 190 in vivo studies (CYP3A4, n = 109; CYP2D6, n = 56; CYP2C9, n = 25) are compared with the prediction 1 + [I] / Ki. Mean observed ratios are 4.5 for CYP3A4, 2.6 for CYP2D6 and 2.0 for CYP2C9. Predicted values are within 2-fold of observed for 110 of 190 studies with [I]av and 98 with [I]in, which over-predicts on average (bias 2.2). At [I] / Ki of 1 or more, [I]in identifies 65 of the 93 studies with an AUC ratio of 2 or more and [I]av,u identifies 9.",
  "legend": "Observed AUC ratio against 1 + [I] / Ki for the enzyme and concentration chosen; shaded band, within 2-fold; dashed lines mark an AUC ratio of 2. Points above the horizontal line and left of the vertical line are false negatives.",
  "change": "Enzyme, inhibitor concentration; hover for substrate, inhibitor and values; drag a rectangle to select studies for their score; click a study for its inputs; PNG and CSV export. Outputs: within 2-fold, average fold error, bias, classification counts."
 },
 "ddi/Cutoff and classification": {
  "watch": "A study is predicted positive when [I] / Ki is at least the cutoff and observed positive when the AUC ratio is at least 2. At a cutoff of 1, [I]in identifies 65 of 93 observed positives with 46 false positives among 97 negatives; at 0.1 it identifies 92 with 90 false positives. [I]av,u identifies 9 at a cutoff of 1. The counts follow the pattern of Table 5 in Ito et al. (2004), which used a subset of the studies for CYP3A4 and CYP2D6.",
  "legend": "Sensitivity and false-positive rate against the cutoff on [I] / Ki for the enzyme and concentration chosen. Table: classification counts at the cutoff for the four concentration definitions.",
  "change": "Enzyme, concentration, cutoff, positive threshold; drag the cutoff line; hover for rates; PNG and CSV export. Outputs: counts and sensitivity at the cutoff."
 },
 "ddi/Inhibitor potency and exposure": {
  "watch": "Ki in the database spans 0.0085 to 240 uM, 4.5 orders of magnitude. Each study is placed by Ki and the inhibitor concentration; points above the line [I] = Ki have [I] / Ki above 1. 93 of 190 studies have an AUC ratio of 2 or more.",
  "legend": "Inhibitor concentration against Ki for each study; lines mark [I] = Ki and [I] = 0.1 Ki; red points have an AUC ratio of 2 or more.",
  "change": "Enzyme, inhibitor concentration; hover for names and values; drag a rectangle to select studies; click a study for its inputs; PNG and CSV export. Outputs: Ki range, counts above [I] = Ki and their observed outcome."
 },
 "ddi/Time-dependent inhibition and induction": {
  "watch": "Time-dependent inhibition lowers enzyme content at the rate kobs = kinact [I] / (KI + [I]), giving B = kdeg / (kdeg + kobs). Induction raises enzyme content, C = 1 + Emax [I] / (EC50 + [I]). With A = 1 / (1 + [I] / Ki) for reversible inhibition, the combined AUC ratio is 1 / [fm A B C + 1 - fm]. Intestinal terms are omitted. kdeg is the enzyme degradation rate constant; 0.019 per h is used here, of the order used for hepatic CYP3A. No in vivo data are plotted.",
  "legend": "AUC ratio against [I] for reversible inhibition, time-dependent inhibition, induction and their combination. Grey dashed curves are pinned parameter sets.",
  "change": "[I], fm, Ki, kinact, KI, kdeg, Emax, EC50; drag the [I] line; hover for each term; Pin keeps up to two; PNG and CSV export. Outputs: A, B, C and the AUC ratios."
 },
 "tp/Carrier-mediated uptake": {
  "watch": "Uptake into hepatocytes or transfected cells is the sum of a saturable carrier-mediated term and passive diffusion, v = Vmax C / (Km + C) + Pdif C (Brouwer et al., 2013, Table 3). At C well below Km the carrier-mediated clearance is Vmax / Km. The carrier-mediated and passive terms are equal at C = Vmax / Pdif - Km.",
  "legend": "Uptake rate against substrate concentration: passive (grey), carrier-mediated (dashed) and total (teal). The vertical dashed line marks the substrate concentration set.",
  "change": "Vmax, Km, Pdif, substrate; drag the Vmax line, the Km point, the Pdif point or the substrate line; hover for the components; Pin keeps up to three; export as an image (PNG) and a table (CSV). Outputs: carrier-mediated share, carrier clearance, crossover concentration."
 },
 "tp/Inhibition of uptake": {
  "watch": "For a competitive inhibitor of the carrier-mediated component, uptake relative to control is 1 / (1 + [I] / IC50), with IC50 = Ki (1 + S / Km); hence Ki = IC50 / (1 + S / Km) (the Cheng-Prusoff relation). The IC50 equals Ki only when S is much smaller than Km.",
  "legend": "Carrier-mediated uptake as a percentage of control against inhibitor concentration, for substrate near zero (grey dashed) and at the concentration set (teal); the IC50 is marked.",
  "change": "Ki, substrate, Km; drag the IC50 marker to set Ki; hover for values; Pin keeps up to three; PNG and CSV export. Outputs: IC50, IC50 over Ki."
 },
 "tp/Extended clearance model": {
  "watch": "In the extended clearance model, CLint,all = PSinf PSint / (PSeff + PSint) with PSint = CLmet + CLbile, and CLh = Q fu,b CLint,all / (Q + fu,b CLint,all). When PSint is much greater than PSeff, CLint,all approaches PSinf (uptake-limited). When it is much smaller, CLint,all approaches PSinf PSint / PSeff (intracellular-limited).",
  "legend": "Hepatic blood clearance against PSinf for the parameters set (teal), the uptake-limited ceiling (grey dashed) and blood flow.",
  "change": "PSinf, PSeff, CLmet, CLbile, fu,b, Qh; drag the point along PSinf; hover for values; Pin keeps up to two; PNG and CSV export. Outputs: CLint,all, share of uptake eliminated, hepatic clearance, rate-determining step."
 },
 "tp/Uptake inhibition and AUC ratio": {
  "watch": "An inhibitor that lowers PSinf by the factor 1 / (1 + Iu / Ki) changes the hepatic clearance by an amount that depends on how much uptake controls clearance. The clearance ratio approaches R = 1 + Iu / Ki for uptake-limited compounds with clearance well below blood flow, and is smaller when intracellular elimination or blood flow limits clearance. Regulatory screening criteria apply a cutoff to R, of the order of 1.1.",
  "legend": "Hepatic clearance ratio against Iu / Ki for the parameters set (teal) and with intracellular clearance (CLmet and CLbile) divided and multiplied by 10; dashed grey, R = 1 + Iu / Ki.",
  "change": "PSinf, PSeff, CLmet, CLbile, fu,b, Iu / Ki; drag the marker; hover for the four curves; PNG and CSV export. Outputs: clearance ratio, R, model over R."
 },
 "tp/ECCS class and biliary clearance": {
  "watch": "In the 20 substrates tabulated by Miyake et al. (2023), human biliary clearance within ECCS class 3B spans 0.001 to 5.85 mL/min/kg (n = 12), a 5850-fold range, with a median of 0.29. ECCS assigns classes 1B and 3B (acids and zwitterions above 400 Da) to hepatic uptake as the expected rate-determining step.",
  "legend": "Human biliary clearance of 20 substrates by ECCS class; bars, class medians.",
  "change": "Hover a point for the compound; click a point for its values; PNG and CSV export. Outputs: class medians, selected compound."
 },
 "tp/Probe substrates and inhibitors": {
  "watch": "Brouwer et al. (2013) recommend probe substrates, inhibitors and potential clinical probes for each transporter. Several inhibitors are listed for more than one transporter, so inhibition by one agent does not identify the transporter involved.",
  "legend": "Inhibitors listed in Table 2 of Brouwer et al. (2013) against transporter; shaded cells mark an inhibitor recommended for that transporter.",
  "change": "Click a transporter column for its systems, substrates, inhibitors and clinical probes; click an inhibitor row to see every transporter it is listed for; CSV export. Outputs: lists for the selection."
 },
 "rn/Filtration and net renal clearance": {
  "watch": "Free drug is filtered at the rate fu x GFR. Tubular secretion adds CLsec and reabsorption removes a fraction Fr of what is filtered and secreted, so CLr = (fu x GFR + CLsec) x (1 - Fr). A CLr above fu x GFR requires net secretion and a CLr below it requires net reabsorption.",
  "legend": "Waterfall from filtration through secretion and reabsorption to the renal clearance.",
  "change": "fu, GFR, CLsec, reabsorbed fraction; drag the top of the filtered, secreted or renal clearance bar; hover a bar for its value; export as an image (PNG) and a table (CSV). Outputs: CLr, CLr over filtration, net transport, CLr over GFR."
 },
 "rn/Renal impairment and AUC ratio": {
  "watch": "With a fraction fe of clearance renal and the nonrenal clearance unchanged, a renal function KF relative to normal gives AUCR = 1 / (1 - fe + fe KF). The dose adjustment factor of Giusti and Hayton, Q = 1 - fe (1 - KF), is the inverse of the AUC ratio. At KF near 0 the ratio approaches 1 / (1 - fe).",
  "legend": "AUC ratio against renal function for fe = 0.2, 0.5, 0.8 and 0.95 (grey) and the fe set (teal); bands mark mild, moderate and severe impairment.",
  "change": "fe, renal function; drag the point (horizontal sets KF, vertical sets fe); hover for values; Pin keeps up to three; PNG and CSV export. Outputs: AUC ratio, dose adjustment factor, ceiling."
 },
 "rn/Filtration limit across drugs": {
  "watch": "Filtration alone clears fu x GFR. For the 554 drugs with fu and total clearance in Obach et al. (2008), a total clearance below fu x GFR means that filtered drug is largely reabsorbed, and a total clearance above it requires secretion or nonrenal routes. At a GFR of 1.8 mL/min/kg, 40 of 554 drugs (7 percent) have CL below fu x GFR. The analysis assumes the reported CL is a plasma clearance.",
  "legend": "Filtration clearance fu x GFR against total clearance for 554 drugs; the dashed line is equality; orange points have CL below fu x GFR.",
  "change": "GFR; hover for names and values; drag a rectangle to select drugs; click a drug for its values; PNG and CSV export. Outputs: number below the limit, median CL over fu x GFR."
 },
 "rn/Biliary share of clearance": {
  "watch": "For the 16 substrates tabulated by Miyake et al. (2023) that also have a total clearance in Obach et al. (2008), the biliary share CLbile / CL ranges from 0.001 (cefazolin) to 0.88 (valsartan); 7 of 16 have a share of at least 0.2. The two quantities come from different studies, so the shares are indicative.",
  "legend": "Human biliary clearance as a fraction of total clearance for 16 substrates, colored by ECCS class.",
  "change": "Hover a bar for the compound; click a bar for its values; PNG and CSV export. Outputs: compounds with at least 0.2 of clearance in bile, class 3B median, highest and lowest share."
 },
 "dose/Dose and steady state": {
  "watch": "At steady state on repeated oral doses, Css,avg = F x dose / (CL x tau), independent of V and ka. The peak and trough depend on V, ka and tau and follow from superposition of single-dose profiles. The dose for a target Css,avg is dose = Css,avg x CL x tau / F. The accumulation ratio is R = 1 / (1 - exp(-k tau)) with k = CL / V.",
  "legend": "Plasma concentration after repeated oral doses (triangles on the time axis mark the doses); the shaded band is the target window and the dashed line is Css,avg. Grey dashed curves are pinned regimens.",
  "change": "Dose, interval, CL, V, F, ka; drag the Css,avg point to set the dose and the two limits to set the window; hover for C; Pin keeps up to two; export as an image (PNG) and a table (CSV). Outputs: Css,avg, Cmax,ss, Cmin,ss, time in the window, dose for the window midpoint."
 },
 "dose/Allometric scaling": {
  "watch": "Clearance scales with body weight W as CL = a W^b. A fit of log CL against log W over the species gives b, and fixed exponents of 0.75 and 1 (equal clearance per kg) bracket the choice. The human clearance is predicted at 70 kg. With b below 1, clearance per kg falls as body weight rises. The species values are illustrative values for one compound, set by dragging.",
  "legend": "Clearance against body weight on logarithmic axes: species (teal points), the fitted line and lines of exponent 0.75 and 1; the dashed vertical line marks 70 kg.",
  "change": "Drag each species point vertically; Reset points; export as an image (PNG) and a table (CSV). Outputs: fitted exponent, predicted human CL for each exponent."
 },
 "dose/Daily dose from clearance": {
  "watch": "The daily dose that holds a target Css,avg is Css,avg x CL x 24 h / F. For the 667 drugs of Obach et al. (2008), with CL for a 70 kg adult, the median daily dose is 40 mg for a Css,avg of 0.1 mg/L and 403 mg for 1 mg/L; 170 drugs would require more than 1 g/day at 1 mg/L.",
  "legend": "Number of drugs against the daily dose for the target Css,avg and F set; the dashed line marks 1 g/day.",
  "change": "Target Css,avg, F; drag the histogram sideways to change the target; hover for bin counts; export as an image (PNG) and a table (CSV). Outputs: median daily dose, drugs below 100 mg and above 1 g per day."
 },
 "dose/Half-life and dosing interval": {
  "watch": "The accumulation ratio R = 1 / (1 - exp(-0.693 tau / t1/2)) and the peak to trough ratio exp(0.693 tau / t1/2) depend on tau / t1/2, where t1/2 is the half-life. In the Obach et al. (2008) set the median half-life is 4.1 h and 403 of 667 drugs have a half-life below 6 h. A 12 h interval exceeds the half-life of 513 drugs.",
  "legend": "Left: half-life of 667 drugs with the dosing interval marked. Right: accumulation ratio at that interval.",
  "change": "Dosing interval tau; drag the interval line on the left histogram; hover for bin counts; export as an image (PNG) and a table (CSV). Outputs: drugs with tau above the half-life, median accumulation ratio."
 },
 "dose/Starting dose from animal data": {
  "watch": "The FDA guidance converts a no-observed-adverse-effect level (NOAEL) in an animal species to a human equivalent dose (HED) with body-surface-area factors: HED = NOAEL x (animal factor / 37). The maximum recommended starting dose is the HED divided by a safety factor, 10 by default. The factors are 3 for mouse, 6 for rat, 12 for rabbit and monkey, 20 for dog and 37 for human, with reference body weights of 0.02, 0.15, 1.8, 3, 10 and 60 kg.",
  "legend": "The NOAEL in the selected species (teal bar) and the dose in each species with the same human equivalent dose; the dashed line marks the human equivalent dose.",
  "change": "NOAEL, species, safety factor; drag the top of the selected bar to set the NOAEL; hover a bar for the factor; export as an image (PNG) and a table (CSV). Outputs: HED, starting dose per kg and for a 60 kg adult."
 },
 "bbb/Brain exposure measures": {
  "watch": "At steady state, Kp = Cbrain / Cplasma on total concentrations and logBB = log10 Kp. Only unbound drug crosses the barrier, so the unbound ratio is Kp,uu = Cu,brain / Cu,plasma = Kp x fu,brain / fu,p. Binding in brain tissue (low fu,brain) raises Kp without raising Kp,uu. Kp,uu of 1 indicates passive equilibrium of unbound drug, below 1 net efflux or restricted entry, and above 1 net active uptake.",
  "legend": "Total (grey) and unbound (teal) concentration in plasma and brain, relative to the total plasma concentration, on a logarithmic axis.",
  "change": "Kp, fu,p, fu,brain; drag the tops of the brain total, plasma unbound and brain unbound bars; hover for values; export as an image (PNG) and a table (CSV). Outputs: logBB, Kp,uu."
 },
 "bbb/Efflux and Kp,uu": {
  "watch": "At steady state the unbound influx equals the unbound efflux: (P + A_in) Cu,plasma = (P + A_out) Cu,brain, where P is the passive clearance in each direction, A_in an active influx clearance and A_out an active efflux clearance. Hence Kp,uu = (1 + A_in / P) / (1 + A_out / P), and without active influx Kp,uu = 1 / (1 + A_out / P). An efflux clearance of 9 times P gives Kp,uu = 0.1.",
  "legend": "Kp,uu against efflux clearance relative to passive clearance, without active influx (grey dashed) and at the influx set (teal); the lines mark Kp,uu = 1 and 0.1.",
  "change": "Efflux clearance, active influx; drag the point (horizontal sets efflux, vertical sets influx); hover for values; Pin keeps up to three; export as an image (PNG) and a table (CSV). Outputs: Kp,uu, net efflux ratio."
 },
 "bbb/Measured logBB": {
  "watch": "B3DB contains 1,058 compounds with a measured logBB (median -0.02, range -2.69 to 1.70); 930 have a logBB of -1 or above, a brain to plasma ratio of 0.1 or more, which B3DB labels BBB+. Total concentration ratios include tissue binding, so logBB does not by itself give the unbound exposure.",
  "legend": "Histogram of logBB for 1,058 compounds; bars at or above the threshold are teal.",
  "change": "Threshold; drag the threshold line; hover for bin counts; export as an image (PNG) and a table (CSV). Outputs: share above the threshold, median logBB."
 },
 "bbb/Polar surface area and penetration": {
  "watch": "Compounds labeled BBB+ have a lower topological polar surface area (TPSA) than those labeled BBB-: the median is 54.0 A^2 for 4,956 BBB+ compounds and 115.1 A^2 for 2,849 BBB- compounds, and the median molecular weight (MW) is 330.5 and 424.5 Da. A rule that calls BBB+ at TPSA of 90 A^2 or below has an accuracy of 0.746, sensitivity 0.79 and specificity 0.67, against 0.635 for calling every compound BBB+.",
  "legend": "Left: MW against TPSA for 7,805 compounds (teal BBB+, orange BBB-) with the TPSA cutoff. Right: sensitivity, specificity and accuracy against the cutoff.",
  "change": "TPSA cutoff; drag the cutoff on either plot; hover a point for its name and descriptors; export as an image (PNG) and a table (CSV). Outputs: accuracy, sensitivity, specificity."
 },
 "bbb/Combined property rule": {
  "watch": "Rules built from descriptors are applied in sequence: TPSA at most a cutoff, then also donors at most a number, then also MW at most a limit. Each added condition removes some BBB- compounds and also some BBB+ compounds. With TPSA at most 90 A^2, donors at most 3 and MW at most 450 Da, the accuracy is 0.725 (sensitivity 0.73, specificity 0.72), below the 0.746 of the TPSA rule alone.",
  "legend": "Accuracy (dark), sensitivity (teal) and specificity (orange) of four nested rules; the first is calling every compound BBB+.",
  "change": "TPSA, donors, MW cutoffs; hover a group for its counts; export as an image (PNG) and a table (CSV). Outputs: accuracy of the full rule, compounds called BBB+, baseline."
 },
 "pbpk/Flow-limited organ": {
  "watch": "In a flow-limited (perfusion-limited) organ, the tissue equilibrates with the arterial blood as fast as blood arrives: V dCt/dt = Q (Ca - Ct / Kp). For a constant arterial concentration Ca, Ct(t) = Kp Ca (1 - exp(-Q t / (Kp V))). The time constant is tau = Kp V / Q, and 90 percent of equilibrium is reached at 2.303 tau.",
  "legend": "Tissue concentration relative to the arterial concentration against time; the dashed line is the equilibrium ratio Kp and the marked point is tau. Grey dashed curves are pinned settings.",
  "change": "Q, V, Kp; drag the point on the curve to set Q; hover for values; Pin keeps up to three; export as an image (PNG) and a table (CSV). Outputs: tau, time to 90 percent of equilibrium."
 },
 "pbpk/Minimal whole-body model": {
  "watch": "Blood (3 L), liver (1.8 L, flow 90 L/h) and the rest of the body (40 L, flow 210 L/h) exchange drug by flow-limited distribution. In the liver, V dC/dt = Q (Cb - C / Kp) - fu CLint C / Kp; the kidney removes CLr x Cb from blood. The model has Vss = Vb + Vl Kp,l + Vr Kp,r and, at steady flow, CL = CLh + CLr with CLh = Q fu CLint / (Q + fu CLint) (the well-stirred model of tab 07). The equations are integrated numerically.",
  "legend": "Blood concentration after an intravenous dose of 100 mg for the three-compartment model (teal) and for a one-compartment model with the same Vss and CL (grey dashed).",
  "change": "Kp of liver, Kp of the rest of body, fu, CLint, CLr, axis; hover for both curves; Pin keeps up to two; export as an image (PNG) and a table (CSV). Outputs: Vss, CLh, CL, half-life, AUC."
 },
 "pbpk/Variability in clearance": {
  "watch": "Interindividual variability in CLint is represented by a log-normal distribution with a coefficient of variation (CV). The AUC of an intravenous dose is dose / (CLh + CLr), with CLh = Q fu CLint / (Q + fu CLint). When extraction is low, CLh is proportional to CLint and the variability passes into the AUC; when extraction is high, CLh approaches Q and the AUC varies little. For a log-normal distribution the 95th to 5th percentile ratio is exp(2 x 1.645 x sigma), with sigma^2 = ln(1 + CV^2).",
  "legend": "AUC in 3,000 simulated subjects for a low-extraction and a high-extraction compound with the same CV of CLint (fu 0.2, CLr 1 L/h, Q 90 L/h).",
  "change": "CV, CLint of each compound; hover for bin counts; export as an image (PNG) and a table (CSV). Outputs: median and 5th to 95th percentile of AUC, 95th to 5th ratio, hepatic extraction."
 },
 "ddi/Enzyme competition": {
  "watch": "Cytochrome P450 (CYP) enzymes in the endoplasmic reticulum (ER) membrane bind substrate and competitive inhibitor at one site. With unbound [S] and [I] held constant, each enzyme occupies the states E, ES and EI in the steady-state proportions 1 : [S]/Km : [I]/Ki. Metabolite formation, kcat x ES, relative to control is v/v0 = (1 + [S]/Km) / (1 + [S]/Km + [I]/Ki), which reduces to 1 / (1 + [I]/Ki) for [S] well below Km. With the other routes (1 - fm) unchanged, the area under the curve (AUC) ratio is AUCR = 1 / [fm v/v0 + 1 - fm]. Assumed: no inhibitor depletion, one inhibited enzyme.",
  "legend": "Top: twelve CYP molecules on the cytosolic face of the ER membrane, each with an active-site pocket above the heme; substrate (teal), inhibitor (orange) and metabolite (grey) particles in the cytosol. Each enzyme is simulated as a three-state stochastic system with rates set by [S]/Km and [I]/Ki; free particle numbers increase with concentration and are held constant by exchange at the top edge. A colored pocket rim marks a bound ligand. Bottom left: clearance routes as bands of width proportional to clearance relative to control; the orange stub is the CYP clearance removed by the inhibitor. Bottom right: inhibitor-bound fraction (orange) and v/v0 (teal) against [I]/Ki; open circles are equation values, filled points time-averaged simulation values.",
  "change": "[I]/Ki, fm and [S]/Km (logarithmic sliders for the ratios); drag the orange handle on the [I]/Ki axis; export as an image (PNG) and a table (CSV). Outputs: inhibitor-bound fraction, metabolite formation relative to control and AUC ratio, each from the equations and from the simulation, with the averaging time and the current counts of free, substrate-bound and inhibitor-bound enzyme."
 },
 "tp/Hepatocyte schematic": {
  "watch": "Sinusoidal uptake is PSinf = PSact + PSdif: carrier-mediated uptake by organic anion transporting polypeptides (OATP) plus passive diffusion. Return to blood is PSeff = PSdif + PSeff,act (multidrug resistance-associated protein 3, MRP3). Intracellular elimination is PSint = CLint,met + CLint,bile: cytochrome P450 (CYP) metabolism and canalicular efflux by MRP2, breast cancer resistance protein (BCRP) and P-glycoprotein (P-gp). At steady state Kpuu = PSinf / (PSeff + PSint); an entering molecule is metabolized, excreted or returned with probabilities CLint,met, CLint,bile and PSeff over (PSeff + PSint). CLint,all = PSinf PSint / (PSeff + PSint); CLh is well-stirred (fu,b 0.1, Qh 21 mL/min/kg). Assumes constant unbound blood concentration and linear kinetics.",
  "legend": "Cross-section of a sinusoid (left), one hepatocyte and a bile canaliculus (right). Teal discs, drug; grey discs, metabolite formed at CYP; orange discs, inhibitor. Uptake (OATP, dark teal) and efflux (MRP3, MRP2, BCRP, P-gp, light teal) transporters open while a molecule crosses; dashed arrows mark passive diffusion. Bars give the simulated fate of molecules entering the cell over the last 20 s; black ticks give the equation values.",
  "change": "PSact, PSdif, CLint,met, CLint,bile, PSeff,act; Inhibit uptake blocks 3 of 4 OATP sites; click an OATP or drag the orange inhibitor onto it to block one site and drag it off to unblock; Restart reseeds the simulation; hover a transporter, CYP or the membrane for values; PNG and CSV export. Outputs: Kpuu (equation and simulated), fractions metabolized, to bile and back to blood, CLint,all, CLh, hepatic extraction, rate-determining step, clearance ratio with the inhibitor."
 },
 "rn/Nephron schematic": {
  "watch": "Unbound drug (fraction fu) is filtered at fu x GFR, the glomerular filtration rate. In the proximal tubule, basolateral organic anion and organic cation transporters (OAT1, OAT3, OCT2) take up drug from peritubular plasma, and apical multidrug and toxin extrusion proteins (MATE1, MATE2-K) and P-glycoprotein (P-gp) transport it into the lumen, giving a secretion clearance CLsec. A fraction FR of filtered plus secreted drug diffuses back to plasma as water is reabsorbed, so CLr = (fu x GFR + CLsec) x (1 - FR). Renal plasma flow (RPF) is 650 mL/min. The inhibitor reduces CLsec fivefold. Renal function scales GFR, CLsec and RPF together (intact nephron hypothesis).",
  "legend": "Nephron schematic: afferent arteriole, glomerular tuft in Bowman's capsule, efferent arteriole and peritubular capillary (top), proximal tubule with basolateral (dark) and apical (light) transporters and brush border, loop of Henle and distal tubule, collecting duct and urine. Teal discs are unbound drug, grey discs on pale ellipses are albumin-bound drug, orange discs are inhibitor. Lumen width scales with the square root of GFR and narrows along the tubule; arrow width scales with drug flux. Bars give each flux from the equation and black ticks the simulated value.",
  "change": "fu, GFR, CLsec, FR, renal function, inhibitor on or off; click the transporters to toggle the inhibitor; drag the end of the filtered, secreted or reabsorbed bar; PNG and CSV export. Outputs: CLr from the equation and from the simulated molecule count, molecules in urine observed and expected, CLr over fu x GFR, CLr over GFR, net transport."
 },
 "dose/Regimen schematic": {
  "watch": "One-compartment model with first-order absorption and linear elimination. Each dose places F x dose (F, oral bioavailability) in the depot, which empties at ka x Ag (ka, absorption rate constant; Ag, depot amount) into the central compartment of volume V, cleared at CL x C (CL, clearance). Superposition gives C(t) = sum of F x dose x ka / (V (ka - k)) x (exp(-k s) - exp(-ka s)), with k = CL / V and s the time since each dose. The average steady-state concentration is Css,avg = F x dose / (CL x tau), the accumulation ratio R = 1 / (1 - exp(-k tau)), and 90% of steady state takes 3.32 half-lives. Defaults: R = 2.2, Css,avg = 2.67 mg/L.",
  "legend": "Upper panel: depot (gut) and central compartment, the absorption channel (ka) and an outlet whose width is proportional to CL; the central compartment widens with V and its tint scales with C. Each teal particle is a fixed amount of drug, grey particles are the non-bioavailable fraction, falling tablets are doses, and the bar on the right is the current concentration with the window. Lower panel: concentration from the analytic multiple-dose equation (teal line), dose times (triangles, orange for extra doses), target window (shaded), Css,avg (dotted line) and time to 90% of steady state (dashed vertical line); grey dashed curves are pinned regimens.",
  "change": "Dose, interval tau, CL, V, F, ka and simulation speed (hours per second, 0 pauses); drag the outlet edge to set CL and the dashed limits on the plot to set the window; Give dose now adds an extra dose; Restart returns to time 0; Pin keeps up to two regimens; export as an image (PNG) and a table (CSV). The curve is recomputed for the current parameters over all doses given. Outputs: Css,avg, Cmax,ss, Cmin,ss, R, half-life, time to 90% of steady state, and whether Cmin,ss and Cmax,ss lie in the window."
 },
 "bbb/Barrier schematic": {
  "watch": "The blood-brain barrier (BBB) is modeled as one endothelial cell between plasma and brain, with tight junctions closing the paracellular route. Unbound drug crosses the luminal and abluminal membranes with passive clearance P in each direction; P-glycoprotein (P-gp) pumps drug from the cell to blood (A_out) and a carrier adds influx (A_in). Binding equilibrates with the unbound fractions in plasma (fu,p) and brain (fu,brain). At steady state Cu,cell = Cu,brain, so the unbound brain to plasma ratio Kp,uu = (1 + A_in/P) / (1 + A_out/P), the total ratio Kp = Kp,uu x fu,p / fu,brain and logBB = log10 Kp. Molecules move independently with first-order rates; compartment volumes are equal.",
  "legend": "Cross-section of a brain capillary: plasma (left) with plasma proteins, one endothelial cell joined to its neighbors by tight junctions, P-gp (orange) and an influx carrier (dark teal) in the luminal membrane, and brain parenchyma (right) with tissue binding sites. Teal discs are unbound and grey discs bound drug molecules; molecule counts per compartment are given below each region. Lower panel: Kp from molecule counts (dark) and the 6 s moving average of Kp,uu (teal) against simulated time, with the equation values dashed and dotted vertical lines at parameter changes.",
  "change": "Passive permeability P, efflux A_out/P, influx A_in/P, fu,p, fu,brain; Inhibit P-gp (or click the pump) sets A_out to zero; Fast-forward advances the same model by 2,000 s; Empty brain moves every molecule to plasma; drag a molecule into another compartment; hover for part names; export as an image (PNG) and a table (CSV). Outputs: simulated and equation Kp,uu with the standard error of the simulation, Kp, logBB, verdict (restricted by efflux, passive equilibrium, active uptake)."
 },
 "pbpk/Body schematic": {
  "watch": "Blood (Vb 3 L), liver (Vl 1.8 L, Ql 90 L/h) and rest of body (Vr 40 L, Qr 210 L/h) are flow-limited compartments, V dC/dt = Q (Cb - C / Kp), with venous outflow at C / Kp; cardiac output is 300 L/h. Metabolism removes fu CLint C / Kp,l from the liver, giving the well-stirred CLh = Ql fu CLint / (Ql + fu CLint). The kidney removes CLr Cb from blood and has no tissue compartment. After an intravenous (IV) bolus of 100 mg, tissue amounts plus amounts metabolized and excreted sum to the dose. Vss = Vb + Vl Kp,l + Vr Kp,r. Integration is fourth-order Runge-Kutta, step 0.01 h.",
  "legend": "Blood, liver and rest of body drawn with area proportional to the square root of volume and filled by concentration on a logarithmic scale (0.01 to 30 mg/L). Pipe width is proportional to blood flow and particle speed to flow; venous pipes carry C / Kp. Orange arrows are metabolism and urinary excretion, with width proportional to rate. The bar gives the fate of the dose. The inset gives blood (teal), liver (orange) and rest-of-body (dark) concentrations with markers at the current time.",
  "change": "Kp of liver, Kp of rest of body, fu, CLint, CLr, time; Play or Pause loops time over 48 h; click an organ to plot its curve; export as an image (PNG) and a table (CSV). Outputs: amount and percent of dose in each compartment, metabolized and excreted, blood concentration, elimination rates, Vss, CLh, CL, half-life."
 },
 "dist/Binding schematic": {
  "watch": "Vss (volume of distribution at steady state) = Vp + Vt x Kp, with Kp = fu / fu,t, the total tissue to plasma ratio at equal unbound concentrations. Vp = 3.05 L and Vt = 37.2 L (0.0436 and 0.151 + 0.38 L/kg at 70 kg; Oie-Tozer constants). Assumed: linear binding, passive transfer of unbound drug, no pH partitioning. fu depends on albumin concentration P as fu = 1 / (1 + (1/fu0 - 1) P / P0); a displacing drug that occupies 50% of sites halves the binding term. Particles bind and cross by first-order kinetics. At fu = 0.1 and fu,t = 0.2, Vss = 21.7 L.",
  "legend": "Left: plasma (3.05 L) with albumin (grey); right: tissue (Vt, not to scale) with binding sites (light grey), separated by endothelial cells with pores. Teal discs: 200 drug molecules, dark when bound; orange discs: displacing drug on albumin. Below each compartment: molecule counts and concentrations in molecules per L, averaged over 15 s. Bars: Vss from the equation and from the particles (Vp x total molecules / molecules in plasma); dashed line: Vp + Vt.",
  "change": "fu at normal albumin, fu,t, Vt, albumin (25 to 200% of normal), simulation speed, displacing drug on or off; Dose into plasma restarts from a bolus, Equilibrate samples the equilibrium state; drag the end of the equation bar to set Kp through fu,t; PNG and CSV export. Outputs: Vss and Kp from the equation and from the particles, effective fu, Cu tissue / Cu plasma."
 },
 "abs/Absorption schematic": {
  "watch": "Fa is the mass balance of seven small-intestinal transit compartments (Yu and Amidon, 1999; Tsi = 3.32 h, V = 250 mL). Solid drug dissolves at kd (1 - C/S) per compartment; D0 = Dose / (V S). Dissolved drug is absorbed at ka = 0.54 Peff x 7 / Tsi (Peff, human jejunal permeability, 10^-4 cm/s), so a dissolved dose gives Fa = 1 - (1 + 0.54 Peff)^-7. P-glycoprotein (P-gp) returns a fraction fe of entering molecules to the lumen; this lowers Fa and not Fg. For cytochrome P450 3A (CYP3A), Fg = 1 / (1 + fu,gut CLint,gut / Qgut); Fh = 1 - Eh; F = Fa x Fg x Fh.",
  "legend": "Cross-section from the intestinal lumen (seven transit segments, shaded by dissolved concentration relative to S) through the enterocytes, with apical P-gp pumps and CYP3A, to the portal vein, liver and systemic circulation. Gray polygons, undissolved drug; teal discs, dissolved molecules; orange ring, returned by P-gp; gray discs, metabolites. Bars, fraction of the dose remaining after each stage from the equations; orange, loss at that stage; black lines, simulation; gray dashed lines, pinned scenarios.",
  "change": "Dose, solubility S, dissolution rate constant kd, Peff, fraction returned by P-gp, fu,gut CLint,gut / Qgut, Eh; drag the handle in the liver to set Eh; Simulate 200 more doses adds stochastic doses; Pin keeps up to three scenarios; PNG and CSV export. Outputs: D0, Fa, Fg, Fh and F from the equations and from the simulation, the dissolved-dose Fa limit, maximum absorbable dose and net ka."
 }
};
