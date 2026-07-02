# Render Deploy Instructions

1. Push this folder to GitHub.
2. In Render, create a **New Web Service**.
3. Connect your GitHub repo.
4. Use these settings:

```txt
Environment: Node
Build Command: npm install
Start Command: npm start
```

Root Directory:

- If `package.json` is directly at the top of your GitHub repo: leave Root Directory blank.
- If this folder is inside your GitHub repo, set Root Directory to the exact folder name, like `palate-demo-clean`.

5. Deploy.

Health check URL after deploy:

```txt
https://YOUR-RENDER-URL.onrender.com/api/health
```
