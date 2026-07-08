const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const APP_VERSION = '1.3.1';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const RESTAURANTS_FILE = path.join(ROOT, 'data', 'restaurants.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(text);
}

function readRestaurants() {
  try {
    const data = JSON.parse(fs.readFileSync(RESTAURANTS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Unable to load restaurant data:', error);
    return [];
  }
}

function clampScore(value, fallback = 5) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(10, number)) : fallback;
}

function normalizeProfile(raw) {
  const profile = {
    authentic: 8,
    spice: 5,
    value: 8,
    aesthetic: 5,
    healthy: 6,
    hidden: 6,
    protein: 7,
    vegetarian: 4
  };

  if (!raw || typeof raw !== 'object') return profile;
  for (const key of Object.keys(profile)) profile[key] = clampScore(raw[key], profile[key]);
  return profile;
}

function calculateMatch(profile, restaurant) {
  const scores = restaurant.tasteScores || {};
  const keys = Object.keys(profile);
  const weightedDistance = keys.reduce((total, key) => {
    const weight = profile[key] >= 8 ? 1.25 : profile[key] <= 3 ? 0.8 : 1;
    return total + Math.abs(profile[key] - clampScore(scores[key])) * weight;
  }, 0);
  const maxDistance = keys.length * 9 * 1.25;
  return Math.max(40, Math.min(99, Math.round(100 - (weightedDistance / maxDistance) * 100)));
}

function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      app: 'Palate',
      restaurants: readRestaurants().length,
      version: APP_VERSION,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/restaurants') {
    let profile;
    try {
      profile = normalizeProfile(url.searchParams.get('profile') ? JSON.parse(url.searchParams.get('profile')) : null);
    } catch {
      return sendJson(res, 400, { error: 'Invalid taste profile.' });
    }

    const restaurants = readRestaurants()
      .map(restaurant => ({ ...restaurant, matchScore: calculateMatch(profile, restaurant) }))
      .sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name));

    return sendJson(res, 200, {
      restaurants,
      meta: {
        count: restaurants.length,
        verifiedThrough: restaurants.map(item => item.lastVerified).filter(Boolean).sort().at(-1) || null,
        location: 'UC San Diego'
      }
    });
  }

  return sendJson(res, 404, { error: 'Not found.' });
}

function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, normalized);

  if (!filePath.startsWith(PUBLIC_DIR)) return sendText(res, 403, 'Forbidden');

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (!path.extname(pathname)) {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (indexError, indexContent) => {
          if (indexError) return sendText(res, 404, 'Not found');
          res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'], 'Cache-Control': 'no-store, must-revalidate' });
          res.end(indexContent);
        });
        return;
      }
      return sendText(res, 404, 'Not found');
    }

    const extension = path.extname(filePath).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.svg', '.ico'].includes(extension);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': isImage ? 'public, max-age=604800, immutable' : 'no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, () => console.log(`Palate is running on port ${PORT}`));
