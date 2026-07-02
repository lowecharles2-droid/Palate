# Local Taste Demo

Local Taste is a restaurant discovery demo that recommends restaurants based on users with similar taste preferences, not just average star ratings.

## Features

- Public landing page and app UI
- Taste profile onboarding
- Match score for each restaurant
- Search and filters by cuisine, vibe, budget, and tags
- Group-specific scores such as authentic, spicy, budget, aesthetic, hidden gem, and healthy
- Restaurant detail modal
- Submit a review/rating
- Live-ish refresh of restaurant data every 20 seconds
- JSON-file persistence for demo data
- Render-ready deployment files

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Deploy on Render

1. Upload this folder to GitHub.
2. Create a new Render Web Service.
3. Connect the repo.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
5. Deploy.

## Important demo note

This uses local JSON files for storage, which is fine for a LaunchX demo. On Render free instances, file changes may reset after redeploys. A real version should use a database like Supabase, Firebase, or PostgreSQL.
