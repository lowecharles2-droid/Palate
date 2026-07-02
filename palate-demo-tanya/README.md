# Palate Demo — LaunchX Version

Public demo website for **Palate**, a curated restaurant discovery platform for authentic, healthy, local dining.

## Added from Tanya's notes

- Positioning changed from “Yelp for food” to **authentic local food personalized to taste, nutrition goals, and budget**.
- Target user section: college students and young professionals first, tourists/foodies/health-conscious users later.
- Curated collections: Hidden Gems, Authentic Mexican, High Protein, Under $10, Vegan, Student Favorites, Family-Owned Businesses, and Worth the Wait.
- AI craving assistant demo: parses prompts like “spicy under $15 with at least 30g protein.”
- Nutrition layer: estimated calories, protein, and carbs for a typical recommended meal.
- Authenticity score on restaurant cards and detail pages.
- Distance from you in miles. The public demo uses **UCSD / La Jolla** as the sample user location.
- Restaurant detail modal with address, hours, phone field, official website, Instagram, Google Maps directions, and reservation link when included.
- Revenue model section: sponsored restaurants, premium subscription, analytics, and affiliate commission.

## Important demo note

This is MVP/demo data. Restaurant hours, phone numbers, and links can change, so verify details before using this for a real public launch or pitch deck screenshots.

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

## Render

Use a **Web Service**, not a Static Site.

- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `palate-demo-tanya` if this folder is inside your GitHub repo
