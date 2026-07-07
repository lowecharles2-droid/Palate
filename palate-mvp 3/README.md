# Palate MVP

Palate is a dependency-free restaurant discovery product focused on helping people quickly find verified food around UC San Diego that fits their taste, budget, location, and dietary needs.

## Product features

- Four-question first-use onboarding for cuisines, dietary preferences, budget, and priorities
- Intent-aware natural-language search with strict cuisine and filter matching
- Personalized match scores with a clear “Why it matches” explanation
- Starting-location choices, browser geolocation, and approximate neighborhood-based distances
- Price, distance, cuisine, dietary, collection, and taste-profile filters
- Group mode that combines shared cuisines, dietary requirements, budget, and distance
- Helpful / Not for me recommendation feedback
- Saved and shareable restaurant listings
- Listing-correction reports stored locally during MVP testing
- Smarter zero-result handling that offers the closest alternatives
- Lightweight event analytics stored in the browser (`PalateAnalytics.summary()` in the console)
- Collapsible results grouped by cuisine
- 84 source-backed restaurant listings with official websites, directions, verification sources, and scoring explanations
- Responsive desktop and mobile design

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## Test

```bash
npm test
```

The test suite validates all supported cuisine/search rules, chain-versus-specialist ranking, restaurant data integrity, and the upgraded MVP interface.

## Data and MVP limitations

Distances outside UCSD are approximate and use neighborhood centers. Exact navigation opens through each restaurant’s directions link. Reports and analytics are stored in the current browser for MVP testing; a production version should connect them to a persistent database and analytics provider.

Restaurant hours, menus, closures, dietary details, and other information can change. Users should confirm current information through official restaurant links.
