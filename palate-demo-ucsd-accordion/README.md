# Palate Demo — UCSD Accordion MVP

Public demo website for **Palate**, a LaunchX proof-of-concept restaurant discovery app.

## What changed in this version

- Refocused the site around the MVP: personalized discovery for authentic local food near UCSD.
- Added **140+ real UCSD-area restaurant seed entries** across Chinese, Indian, Japanese, Korean, Mexican, Thai, Vietnamese, Mediterranean, Italian, seafood, healthy, dessert, breakfast, and more.
- Added categories such as **High protein**, **Vegetarian options**, **Vegan options**, **Budget**, **Spicy**, **Near campus**, **Healthy**, **Sushi**, **Ramen**, **Hot Pot**, **BBQ**, and **Hidden gem**.
- Replaced endless restaurant scrolling with **collapsible accordion sections**:
  - Best matches
  - Browse all results by cuisine
  - Nested cuisine bars with counts
- Kept the backend dependency-free: no Express and no external packages.
- Includes AI-style craving search, taste sliders, distance filter, category filters, review submission, and restaurant detail modal.

## Important demo note

Restaurant names are real seed data for MVP testing, but hours, phone numbers, nutrition estimates, exact addresses, and distances are for demo purposes. Verify live details before using screenshots or data in a final public pitch.

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
- Root Directory: `palate-demo-ucsd-accordion` if this folder is inside your GitHub repo
