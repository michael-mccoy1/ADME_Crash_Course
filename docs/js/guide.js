"use strict";
/* Lesson objectives, what to notice in each step, and a pop quiz question with a hidden answer. */
var GUIDE = {
  intro: {
    hep: { goals: ['Predict hepatic blood clearance from microsomal intrinsic clearance, and score the prediction against observed values.', 'Apply scaling factors, binding corrections and an extraction model, and state how each changes the prediction.', 'Identify which drugs a prediction method gets wrong, and why.'] }
  },
  steps: {
    'hep/Predicted against observed': { notice: 'Points above the dashed line are over-predicted and points below it are under-predicted.', q: 'What does an average fold error of 2.0 mean?', a: 'Predictions differ from the observed values by a factor of 2 on average, in either direction. It is the geometric mean of the absolute fold difference, so 1.0 is a perfect prediction.' },
    'hep/Scaling to the liver': { notice: 'The factor that gives the lowest average fold error is larger than 1 for this set.', q: 'What does a bias of 0.5 indicate?', a: 'Predictions average half the observed values, which is a systematic under-prediction. The average fold error alone does not show the direction of the error.' },
    'hep/Extraction models': { notice: 'The curves are close at low extraction and separate as extraction rises.', q: 'At what intrinsic clearance do the well-stirred and parallel-tube models give the same extraction ratio?', a: 'Only in the limit of low intrinsic clearance. As intrinsic clearance rises, the parallel-tube extraction ratio rises faster and approaches 1.' },
    'hep/Binding assumptions': { notice: 'The ranking of the three treatments differs between bases, neutrals and acids.', q: 'Why does correcting for binding in blood alone give poor predictions?', a: 'It lowers the predicted clearance of highly bound drugs. The measured microsomal CLint already includes binding in the incubation, so the prediction falls too far for highly bound drugs unless the incubation binding is also corrected.' }
  }
};
