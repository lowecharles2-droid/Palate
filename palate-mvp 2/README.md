# Palate MVP

Palate is a dependency-free restaurant discovery MVP focused on verified restaurants near UC San Diego.

## Product features

- Intent-aware natural-language search with strict cuisine and filter matching
- Personalized taste-profile matching
- Cuisine, dietary, collection, and distance filters
- Collapsible result groups
- Sorting by match, distance, cuisine fidelity, local score, or name
- Saved restaurants stored in the user's browser
- 84 source-backed restaurant listings with expanded coverage across every supported cuisine
- Official websites, verification sources, and directions
- Transparent cuisine-fidelity and local-ownership scoring
- Responsive desktop and mobile design

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## Data note

The included restaurant directory is static and was source-checked through the dates shown in each listing. Restaurant hours, menus, closures, dietary details, and other information can change. Users should confirm current information through the official restaurant links.

## Search validation

Run `npm test` to execute the regression suite. It checks exact-name searches, every supported cuisine and every recognized search synonym, combined filters, distance limits, collection membership, data integrity, chain-vs-specialist ranking, and regression cases such as Panda Express appearing for authentic Chinese food.
