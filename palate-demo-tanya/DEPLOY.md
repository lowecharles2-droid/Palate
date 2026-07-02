# Render deployment

Use a Render **Web Service**, not a Static Site.

Settings:

- Service Type: Web Service
- Environment: Node
- Root Directory: `palate-demo-tanya`
- Build Command: `npm install`
- Start Command: `npm start`

If you move `package.json` directly into the GitHub repo root, leave Root Directory blank.

This version has no external dependencies, so `npm install` should finish quickly.
