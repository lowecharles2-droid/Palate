const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RESTAURANTS_FILE = path.join(DATA_DIR, 'restaurants.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function cleanText(value, maxLength = 240) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${filePath}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
  await fs.rename(tempFile, filePath);
}

function aggregateRestaurant(restaurant, reviews) {
  const restaurantReviews = reviews.filter((review) => review.restaurantId === restaurant.id);
  const reviewCount = restaurantReviews.length;

  if (reviewCount === 0) {
    return {
      ...restaurant,
      reviewCount: 0,
      averageRating: restaurant.baseRating,
      groupScores: restaurant.groupScores
    };
  }

  const averageRating = restaurantReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
  const groupTotals = { ...restaurant.groupScores };
  const groupCounts = Object.fromEntries(Object.keys(groupTotals).map((key) => [key, 1]));

  for (const review of restaurantReviews) {
    for (const [key, score] of Object.entries(review.groupScores || {})) {
      if (typeof groupTotals[key] !== 'number') groupTotals[key] = 0;
      groupTotals[key] += score;
      groupCounts[key] = (groupCounts[key] || 0) + 1;
    }
  }

  const groupScores = {};
  for (const key of Object.keys(groupTotals)) {
    groupScores[key] = Number((groupTotals[key] / (groupCounts[key] || 1)).toFixed(1));
  }

  return {
    ...restaurant,
    reviewCount,
    averageRating: Number(((restaurant.baseRating + averageRating) / 2).toFixed(1)),
    groupScores
  };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'Local Taste', timestamp: new Date().toISOString() });
});

app.get('/api/restaurants', async (req, res) => {
  const restaurants = await readJson(RESTAURANTS_FILE, []);
  const reviews = await readJson(REVIEWS_FILE, []);
  const aggregated = restaurants.map((restaurant) => aggregateRestaurant(restaurant, reviews));
  res.json({ restaurants: aggregated, updatedAt: new Date().toISOString() });
});

app.get('/api/restaurants/:id', async (req, res) => {
  const restaurants = await readJson(RESTAURANTS_FILE, []);
  const reviews = await readJson(REVIEWS_FILE, []);
  const restaurant = restaurants.find((item) => item.id === req.params.id);

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }

  const publicReviews = reviews
    .filter((review) => review.restaurantId === req.params.id)
    .slice(-10)
    .reverse()
    .map((review) => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      tasteGroup: review.tasteGroup,
      comment: review.comment,
      createdAt: review.createdAt
    }));

  res.json({ restaurant: aggregateRestaurant(restaurant, reviews), reviews: publicReviews });
});

app.get('/api/stats', async (req, res) => {
  const restaurants = await readJson(RESTAURANTS_FILE, []);
  const reviews = await readJson(REVIEWS_FILE, []);
  const cuisines = new Set(restaurants.map((restaurant) => restaurant.cuisine));
  const tags = new Set(restaurants.flatMap((restaurant) => restaurant.tags));

  res.json({
    restaurants: restaurants.length,
    reviews: reviews.length,
    cuisines: cuisines.size,
    tags: tags.size
  });
});

app.post('/api/reviews', async (req, res) => {
  const restaurants = await readJson(RESTAURANTS_FILE, []);
  const reviews = await readJson(REVIEWS_FILE, []);

  const restaurantId = cleanText(req.body.restaurantId, 60);
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  if (!restaurant) {
    return res.status(400).json({ error: 'Choose a valid restaurant.' });
  }

  const review = {
    id: `rev_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    restaurantId,
    name: cleanText(req.body.name, 40) || 'Anonymous foodie',
    rating: clampNumber(req.body.rating, 1, 10, 8),
    tasteGroup: cleanText(req.body.tasteGroup, 80) || 'General',
    comment: cleanText(req.body.comment, 400),
    groupScores: {
      authentic: clampNumber(req.body.groupScores?.authentic, 1, 10, restaurant.groupScores.authentic),
      spicy: clampNumber(req.body.groupScores?.spicy, 1, 10, restaurant.groupScores.spicy),
      budget: clampNumber(req.body.groupScores?.budget, 1, 10, restaurant.groupScores.budget),
      aesthetic: clampNumber(req.body.groupScores?.aesthetic, 1, 10, restaurant.groupScores.aesthetic),
      hiddenGem: clampNumber(req.body.groupScores?.hiddenGem, 1, 10, restaurant.groupScores.hiddenGem),
      healthy: clampNumber(req.body.groupScores?.healthy, 1, 10, restaurant.groupScores.healthy)
    },
    createdAt: new Date().toISOString()
  };

  reviews.push(review);
  await writeJson(REVIEWS_FILE, reviews);

  res.status(201).json({ ok: true, review });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Local Taste running on port ${PORT}`);
});
