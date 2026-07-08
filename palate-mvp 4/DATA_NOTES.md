# Restaurant data policy

Each listing includes an official website, source link, and last-verified date. Palate separates:

- **Cuisine fidelity:** how clearly a restaurant delivers the cuisine or category it claims to represent
- **Local score:** how local or independently operated the business is
- **Taste signals:** editorial values used for personalized matching

Dietary tags indicate menu options found in source material. They are not allergy-safety guarantees, certifications, or medical advice. Palate does not claim exact nutrition values unless a restaurant publishes them.

## Distance behavior

The original directory contains estimated distances from central UCSD. When users select another starting area or browser location, Palate estimates distance using neighborhood centers. These estimates are for discovery and sorting only; users should use the listing’s directions link for exact routes.

## Search behavior

Palate applies explicit cuisine and category constraints before personalization scores. Cuisine searches rank dedicated specialists ahead of generic fusion and national chains. “Authentic” requires a cuisine-fidelity score of at least 8/10 and, whenever the directory has enough coverage, shows independent specialists before chain restaurants. “Local” excludes national chains and requires a local score of at least 7/10. Combined requests use AND logic, while exact restaurant-name searches take priority over category parsing.

## MVP feedback storage

Saved restaurants, onboarding choices, recommendation feedback, correction reports, and product analytics are stored in the user’s browser. This is appropriate for a deployable prototype but not a substitute for a production database.
