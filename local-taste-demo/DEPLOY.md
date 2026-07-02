# Deploying Local Taste to Render

## Option A: Blueprint deploy

This repo includes `render.yaml`, so Render can detect the service settings automatically.

1. Push the project to GitHub.
2. Go to Render > New > Blueprint.
3. Select the GitHub repo.
4. Click Apply.

## Option B: Manual web service

1. Push the project to GitHub.
2. Go to Render > New > Web Service.
3. Connect your repo.
4. Set:
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
5. Deploy.

## Fix if Render says root directory does not exist

Leave Root Directory blank unless you put this project inside a subfolder. If your repo contains this folder inside another folder, set Root Directory to that exact folder name.
