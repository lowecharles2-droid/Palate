# Palate Demo

A public demo website for a taste-based restaurant recommendation app.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Deploy on Render

Use a **Web Service**, not a Static Site.

Settings:

- Environment: Node
- Root Directory: `palate-demo-clean` if this folder is inside your repo; otherwise leave blank
- Build Command: `npm install`
- Start Command: `npm start`

This version has no external dependencies, so it should not fail with `Cannot find module 'express'`.
