// learn-items.js — the skills and questions behind the Learn room.
// Each question carries 3PL item parameters set by the author (a = discrimination, b = difficulty, c = guessing
// floor for four options). They are reasoned starting values, not calibrated from learners' answers.

export const SKILLS = [
  { id: 'tvm', name: 'Time value and DCF', room: 'Finance', href: '../finance/#dcf' },
  { id: 'wacc', name: 'Cost of capital', room: 'Finance', href: '../finance/#cost-of-capital' },
  { id: 'bonds', name: 'Bonds and duration', room: 'Finance', href: '../finance/#bonds' },
  { id: 'options', name: 'Options', room: 'Finance', href: '../finance/#options' },
  { id: 'credit', name: 'Credit distress', room: 'Finance', href: '../finance/#altman' },
  { id: 'describe', name: 'Describing data', room: 'Business analytics', href: '../analytics/#describe' },
  { id: 'regression', name: 'Regression', room: 'Business analytics', href: '../analytics/#regress' },
  { id: 'classify', name: 'Classification and clustering', room: 'Business analytics', href: '../analytics/#classify' },
  { id: 'forecast', name: 'Forecasting', room: 'Business analytics', href: '../analytics/#forecast' },
  { id: 'pricing', name: 'Pricing', room: 'Marketing', href: '../marketing/#elasticity' },
  { id: 'growth', name: 'Growth and experiments', room: 'Marketing', href: '../marketing/#unit-economics' },
  { id: 'validation', name: 'Validating models', room: 'How I build the models', href: '../models/#lab' },
];

const q = (id, skill, b, a, stem, options, answer, why) => ({ id, skill, a, b, c: 0.2, stem, options, answer, why });

export const ITEMS = [
  // ---------------------------------------------------------------- time value and DCF
  q('tvm1', 'tvm', -1.5, 1.0, 'A project pays $110 in one year. At a 10% discount rate, what is it worth today?',
    ['$100', '$99', '$110', '$121'], 0, '$110 ÷ 1.10 = $100. Discounting undoes one year of 10% growth.'),
  q('tvm2', 'tvm', -0.5, 1.2, 'In a DCF, raising the discount rate (WACC) while everything else stays the same will…',
    ['Lower the value', 'Raise the value', 'Leave the value unchanged', 'Change only the terminal value'], 0, 'Every future cash flow is divided by a larger number, so the present value of each one falls, terminal value included.'),
  q('tvm3', 'tvm', 0.5, 1.2, 'A terminal value of $1,500m sits at the end of year 5 and WACC is 9%. Its present value is closest to…',
    ['$975m', '$1,376m', '$825m', '$1,500m'], 0, '$1,500m ÷ 1.09⁵ = $1,500m ÷ 1.539 ≈ $975m. $1,376m discounts only one year.'),
  q('tvm4', 'tvm', 1.3, 1.3, 'Next year’s free cash flow is $50m, WACC is 8% and growth after that is 3% a year forever. The Gordon-growth terminal value is…',
    ['$1,000m', '$625m', '$1,667m', '$1,050m'], 0, 'Terminal value = next year’s cash flow ÷ (WACC − growth) = $50m ÷ 0.05 = $1,000m. $625m forgets growth; $1,667m divides by growth alone.'),
  // ---------------------------------------------------------------- cost of capital
  q('wacc1', 'wacc', -1.0, 1.1, 'CAPM: the risk-free rate is 4%, beta is 1.5 and the equity risk premium is 5%. The cost of equity is…',
    ['11.5%', '9.0%', '7.5%', '13.5%'], 0, 'Cost of equity = 4% + 1.5 × 5% = 11.5%. Beta scales the premium, not the risk-free rate.'),
  q('wacc2', 'wacc', 0.0, 1.0, 'Why is debt usually a cheaper source of money than equity?',
    ['Interest is tax-deductible and lenders are paid before shareholders', 'Debt carries no risk at all', 'Banks don’t expect a return', 'Shareholders receive dividends'], 0, 'Lenders take less risk because they are paid first, and the tax saving on interest lowers the cost further.'),
  q('wacc3', 'wacc', 1.0, 1.3, 'Equity is $600m at a 10% cost; debt is $400m at 6% before tax; the tax rate is 25%. The WACC is…',
    ['7.8%', '8.4%', '8.0%', '6.9%'], 0, '0.6 × 10% + 0.4 × 6% × (1 − 0.25) = 6.0% + 1.8% = 7.8%. 8.4% forgets the tax saving on interest.'),
  // ---------------------------------------------------------------- bonds
  q('bond1', 'bonds', -1.2, 1.1, 'When market interest rates rise, the price of an existing fixed-coupon bond…',
    ['Falls', 'Rises', 'Stays the same', 'Moves with the coupon'], 0, 'Its fixed coupons now look worse than new bonds’, so buyers pay less for it: prices and yields move in opposite directions.'),
  q('bond2', 'bonds', -0.2, 1.2, 'A bond pays a 6% coupon and its yield to maturity is 5%. It trades…',
    ['Above face value (at a premium)', 'Below face value (at a discount)', 'At face value', 'It can’t be told from this'], 0, 'Its coupon pays more than the market requires, so buyers pay extra for it until their overall return falls to 5%.'),
  q('bond3', 'bonds', 0.7, 1.3, 'A bond has a modified duration of 7. If its yield rises by one percentage point, its price changes by about…',
    ['−7%', '+7%', '−1%', '−0.7%'], 0, 'Price change ≈ −modified duration × yield change = −7 × 1% = −7%.'),
  q('bond4', 'bonds', 1.6, 1.2, 'Two bonds have the same duration, but bond A has more convexity. If yields move sharply either way, bond A…',
    ['Gains more when yields fall and loses less when they rise', 'Loses more either way', 'Behaves exactly like the other bond', 'Does better only when yields rise'], 0, 'Convexity bends the price-yield curve upward, so for big moves in either direction the more convex bond comes out ahead.'),
  // ---------------------------------------------------------------- options
  q('opt1', 'options', -1.0, 1.0, 'A call option gives its owner the right to…',
    ['Buy the share at the strike price', 'Sell the share at the strike price', 'Be obliged to buy the share', 'Receive the share’s dividends'], 0, 'A call is the right, not the obligation, to buy at the strike. A put is the right to sell.'),
  q('opt2', 'options', 0.0, 1.2, 'With everything else fixed, higher volatility makes a call option…',
    ['More valuable', 'Less valuable', 'No different', 'Worthless'], 0, 'The holder gains from big moves up but losses are capped at the premium, so more uncertainty adds value. The same holds for puts.'),
  q('opt3', 'options', 0.8, 1.3, 'A call has a delta of 0.6. The share rises by $2. The option’s value rises by about…',
    ['$1.20', '$0.60', '$2.00', '$3.33'], 0, 'Value change ≈ delta × share move = 0.6 × $2 = $1.20.'),
  q('opt4', 'options', 1.4, 1.2, 'Put–call parity for European options on a share with no dividends: call − put = …',
    ['S − K·e^(−rT)', 'K − S', 'S − K', 'S·e^(−rT) − K'], 0, 'A call minus a put with the same strike and expiry behaves like owning the share and owing the present value of the strike.'),
  // ---------------------------------------------------------------- credit distress
  q('cr1', 'credit', -0.8, 1.0, 'In Altman’s original Z-score for manufacturers, a score below 1.81 puts a company in the…',
    ['Distress zone', 'Grey zone', 'Safe zone', 'Investment-grade zone'], 0, 'Below 1.81 is distress, 1.81 to 2.99 is grey, above 2.99 is safe.'),
  q('cr2', 'credit', 0.2, 1.1, 'Which ratio carries the largest weight (3.3) in Altman’s original Z-score?',
    ['EBIT ÷ total assets', 'Working capital ÷ total assets', 'Sales ÷ total assets', 'Retained earnings ÷ total assets'], 0, 'Operating profit relative to assets carries the 3.3 weight: earning power matters most for survival.'),
  q('cr3', 'credit', 1.2, 1.2, 'Why does Altman’s Z″ for non-manufacturers drop sales ÷ total assets?',
    ['Asset turnover differs so much between industries that it distorts comparisons', 'Non-manufacturers don’t report sales', 'It never predicted anything', 'It double-counts operating profit'], 0, 'Altman removed it to limit the industry effect of asset turnover, which would make asset-light firms look misleadingly strong.'),
  // ---------------------------------------------------------------- describing data
  q('ds1', 'describe', -1.3, 1.0, 'Incomes in a town are strongly skewed to the right (a few very high earners). Which is usually larger?',
    ['The mean', 'The median', 'They are equal', 'It can’t be told'], 0, 'The few very high incomes pull the mean up; the median, the middle value, barely moves.'),
  q('ds2', 'describe', -0.3, 1.2, 'Ice-cream sales and drownings rise and fall together. The most likely explanation is…',
    ['Hot weather drives both', 'Ice cream causes drowning', 'Drownings boost ice-cream sales', 'The correlation is a calculation error'], 0, 'A third factor, summer heat, raises both. Correlation alone says nothing about cause.'),
  q('ds3', 'describe', 0.5, 1.3, 'A Pearson correlation of 0 between X and Y means…',
    ['No straight-line relationship; there could still be a strong curved one', 'X and Y are independent', 'Y never changes', 'The data contain an error'], 0, 'Pearson measures linear association only. Y = X² over a symmetric range has Pearson correlation 0.'),
  q('ds4', 'describe', 1.2, 1.1, 'When is Spearman’s correlation a better choice than Pearson’s?',
    ['When outliers or a curved but steady relationship would mislead Pearson', 'Always, because it is larger', 'When you want to prove cause', 'Only when the data are normally distributed'], 0, 'Spearman correlates ranks, so it resists outliers and captures any consistently rising or falling relationship.'),
  // ---------------------------------------------------------------- regression
  q('rg1', 'regression', -0.8, 1.1, 'A regression has an R² of 0.64. That means…',
    ['The model explains 64% of the variation in the outcome', '64% of its predictions are exactly right', 'The correlation is 0.64', 'The p-value is 0.64'], 0, 'R² is the share of the outcome’s variation the predictors account for. (For one predictor, the correlation would be 0.8.)'),
  q('rg2', 'regression', 0.1, 1.3, 'A coefficient’s p-value is 0.30. The best reading is…',
    ['The data can’t tell its effect apart from zero', 'There is a 70% chance the effect is real', 'The effect is 30%', 'The variable must be deleted'], 0, 'A p-value is not the probability that the effect is real. 0.30 means a result like this is common even with no effect.'),
  q('rg3', 'regression', 0.9, 1.3, 'Residuals fan out as fitted values grow, and the Breusch–Pagan test rejects even spread. The right response is…',
    ['Use robust (HC3) standard errors', 'Delete the largest residuals', 'Add predictors until it passes', 'Discard the coefficients, which are now biased'], 0, 'Uneven spread leaves coefficients unbiased but makes ordinary standard errors unreliable; robust standard errors correct them.'),
  q('rg4', 'regression', 1.5, 1.2, 'Two predictors have variance inflation factors of 12. That means…',
    ['They overlap so much that their separate effects are hard to pin down', 'Their coefficients are biased', 'The R² is wrong', 'They should be multiplied together'], 0, 'High VIFs inflate standard errors: the model can’t tell which of two overlapping predictors deserves the credit.'),
  // ---------------------------------------------------------------- classification and clustering
  q('cl1', 'classify', -0.5, 1.1, 'In a churn model, the odds ratio for support calls is 1.5. Each extra call…',
    ['Multiplies the odds of churning by 1.5', 'Adds 50 percentage points to the chance of churning', 'Adds 1.5% to the chance of churning', 'Halves the odds of churning'], 0, 'Odds ratios multiply odds, not probabilities: 50% higher odds, holding the other predictors fixed.'),
  q('cl2', 'classify', 0.3, 1.2, 'A classifier has an area under the ROC curve of 0.5. It…',
    ['Ranks cases no better than a coin flip', 'Is right half the time at a 50% threshold', 'Is perfect', 'Explains half the variation'], 0, 'AUC is the chance a random positive is ranked above a random negative: 0.5 is chance, 1.0 is perfect.'),
  q('cl3', 'classify', 0.9, 1.3, 'Lowering the threshold for flagging customers from 50% to 20% usually…',
    ['Raises recall and lowers precision', 'Raises both recall and precision', 'Lowers recall', 'Changes nothing'], 0, 'More customers get flagged: you catch more true churners (recall up) but also more false alarms (precision down).'),
  q('cl4', 'classify', 1.3, 1.1, 'Before k-means on tenure (months) and monthly fee (dollars), why put the columns on a common scale?',
    ['Otherwise the column with the bigger spread dominates the distances', 'k-means needs normally distributed data', 'To remove outliers', 'To make the clusters equal in size'], 0, 'k-means groups by distance, so unscaled, whichever column has larger numbers decides the clusters.'),
  // ---------------------------------------------------------------- forecasting
  q('fc1', 'forecast', -0.6, 1.0, 'Sales peak every December. In a Holt-Winters model, which part captures that?',
    ['The seasonal component', 'The level', 'The trend', 'The error'], 0, 'Level is where the series is, trend is its slope, and the seasonal component is the repeating within-year pattern.'),
  q('fc2', 'forecast', 0.4, 1.2, 'Why compare a forecast with simply repeating last season?',
    ['A forecast is only worth using if it beats that simple baseline', 'Repeating last season is always best', 'To calculate R²', 'Because the forecast needs it as an input'], 0, 'Seasonal naive is free and often hard to beat; a model has to earn its complexity against it on held-back data.'),
  q('fc3', 'forecast', 1.2, 1.3, 'The seasonal swings grow as sales grow. Which model suits that pattern?',
    ['Multiplicative seasonality, for example modelling the logarithm', 'Additive seasonality', 'No seasonal component', 'A straight-line trend only'], 0, 'Swings proportional to the level are multiplicative; on a log scale they become constant, which additive smoothing handles.'),
  // ---------------------------------------------------------------- pricing
  q('pr1', 'pricing', -0.7, 1.1, 'A price elasticity of −2 means a 1% price rise cuts units sold by about…',
    ['2%', '0.5%', '1%', '20%'], 0, 'Elasticity is the percentage change in quantity per 1% change in price: −2 × 1% = −2%.'),
  q('pr2', 'pricing', 0.3, 1.2, 'Demand is inelastic (elasticity between −1 and 0). A small price rise will…',
    ['Raise revenue', 'Lower revenue', 'Leave revenue unchanged', 'Always lower profit'], 0, 'Units fall by a smaller percentage than price rises, so price × units goes up.'),
  q('pr3', 'pricing', 1.2, 1.2, 'Why fit ln(units) on ln(price) to estimate elasticity?',
    ['The slope reads directly as a constant elasticity', 'Logs remove outliers', 'Least squares requires logs', 'It always raises R²'], 0, 'In a log-log model the slope is the percentage response to a 1% price change, the same at every price.'),
  // ---------------------------------------------------------------- growth and experiments
  q('gr1', 'growth', -0.6, 1.0, 'A customer’s lifetime gross profit is $900 and it costs $300 to win one. LTV:CAC is…',
    ['3 to 1', '1 to 3', '0.33 to 1', '600 to 1'], 0, '$900 ÷ $300 = 3: each dollar spent winning a customer returns three dollars of gross profit.'),
  q('gr2', 'growth', 0.2, 1.2, 'Net revenue retention of 110% means…',
    ['Customers from a year ago now pay 10% more in total', '10% of customers left', '110% of customers renewed', 'New customers grew revenue by 10%'], 0, 'NRR follows last year’s customers only: upgrades minus downgrades and cancellations, against what they paid a year ago.'),
  q('gr3', 'growth', 0.7, 1.3, 'An A/B test reports p = 0.03. The correct reading is…',
    ['If the versions were really the same, a gap at least this big would turn up about 3% of the time', 'There is a 97% chance version B is better', 'There is a 3% chance the result is a mistake', 'Version B is 3% better'], 0, 'The p-value is computed assuming no real difference. It is not the probability that either version is better.'),
  q('gr4', 'growth', 1.4, 1.2, 'You decide to detect a lift half as large as originally planned. The visitors needed roughly…',
    ['Quadruple', 'Double', 'Halve', 'Stay the same'], 0, 'Sample size scales with 1 ÷ (difference)², so halving the difference multiplies it by about four.'),
  // ---------------------------------------------------------------- validating models
  q('vl1', 'validation', -0.9, 1.1, 'As a model grows more complex, training error keeps falling while held-out error rises. This is…',
    ['Overfitting', 'Underfitting', 'Data leakage', 'Regularisation'], 0, 'The model is memorising noise in the training data instead of the pattern.'),
  q('vl2', 'validation', 0.0, 1.0, 'Why keep back data the model never trains on?',
    ['To estimate how it will do on new data', 'To make training faster', 'To reduce bias in the coefficients', 'Because more data makes models worse'], 0, 'Error on data the model has already seen is optimistic; only unseen data gives an honest estimate.'),
  q('vl3', 'validation', 0.8, 1.3, 'Scaling the whole dataset before splitting it into training and test sets is a problem because…',
    ['Information from the test set leaks into training, flattering the score', 'Scaling is never needed', 'It changes the labels', 'It slows training down'], 0, 'The scaler has seen the test rows. Fit every preparation step on the training part only.'),
  q('vl4', 'validation', 1.5, 1.2, 'The one-standard-error rule picks…',
    ['The simplest model whose cross-validated error is within one standard error of the best', 'The model with the lowest error', 'The model with the smallest standard error', 'The most complex model that still converges'], 0, 'Models within one standard error of the best can’t really be told apart, so it takes the simplest of them.'),
];

/** Average difficulty per skill, used by spaced review (harder skills fade faster). */
SKILLS.forEach((s) => { const its = ITEMS.filter((it) => it.skill === s.id); s.difficulty = its.reduce((a, it) => a + it.b, 0) / its.length; });
