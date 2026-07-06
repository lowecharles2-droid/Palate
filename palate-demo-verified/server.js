const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const RESTAURANTS_FILE = path.join(DATA_DIR, 'restaurants.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(text);
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function cleanString(value, maxLength = 120) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeProfile(profile) {
  const defaults = {
    authentic: 5,
    spice: 5,
    value: 5,
    aesthetic: 5,
    healthy: 5,
    hidden: 5,
    protein: 5,
    vegetarian: 5
  };

  if (!profile || typeof profile !== 'object') return defaults;

  for (const key of Object.keys(defaults)) {
    const number = Number(profile[key]);
    defaults[key] = Number.isFinite(number) ? Math.max(1, Math.min(10, number)) : defaults[key];
  }

  return defaults;
}

function calculateMatch(profile, restaurant) {
  const p = normalizeProfile(profile);
  const t = restaurant.tasteScores || {};
  const keys = Object.keys(p);

  let distance = 0;
  for (const key of keys) {
    const restaurantScore = Number(t[key] || 5);
    distance += Math.abs(p[key] - restaurantScore);
  }

  const maxDistance = keys.length * 9;
  const raw = 100 - (distance / maxDistance) * 100;
  return Math.max(40, Math.round(raw));
}

function getRestaurantsWithMatches(profile) {
  const restaurants = readJson(RESTAURANTS_FILE, []);
  return restaurants
    .map(restaurant => ({
      ...restaurant,
      matchScore: calculateMatch(profile, restaurant)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function serveStatic(req, res, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(requestedPath).replace(/^([.][.][\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendText(res, 403, 'Forbidden');
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fallbackError, fallbackContent) => {
        if (fallbackError) return sendText(res, 404, 'Not found');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      app: 'Palate',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/restaurants') {
    let profile = null;
    const rawProfile = url.searchParams.get('profile');

    if (rawProfile) {
      try {
        profile = JSON.parse(rawProfile);
      } catch (error) {
        return sendJson(res, 400, { error: 'Invalid profile JSON' });
      }
    }

    return sendJson(res, 200, {
      restaurants: getRestaurantsWithMatches(profile)
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/reviews') {
    return sendJson(res, 200, {
      reviews: readJson(REVIEWS_FILE, [])
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/reviews') {
    try {
      const body = await getBody(req);
      const payload = body ? JSON.parse(body) : {};

      const restaurantId = cleanString(payload.restaurantId, 60);
      const name = cleanString(payload.name, 40) || 'Anonymous';
      const group = cleanString(payload.group, 60) || 'General';
      const comment = cleanString(payload.comment, 300);
      const rating = Number(payload.rating);

      if (!restaurantId || !comment || !Number.isFinite(rating)) {
        return sendJson(res, 400, { error: 'restaurantId, rating, and comment are required.' });
      }

      const newReview = {
        id: `review_${Date.now()}`,
        restaurantId,
        name,
        group,
        rating: Math.max(1, Math.min(10, Math.round(rating))),
        comment,
        createdAt: new Date().toISOString()
      };

      const reviews = readJson(REVIEWS_FILE, []);
      reviews.unshift(newReview);
      writeJson(REVIEWS_FILE, reviews.slice(0, 200));

      return sendJson(res, 201, { review: newReview });
    } catch (error) {
      console.error(error);
      return sendJson(res, 400, { error: 'Could not save review.' });
    }
  }

  return sendJson(res, 404, { error: 'API route not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(req, res, url);
    }

    return serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Palate demo running on port ${PORT}`);
});
