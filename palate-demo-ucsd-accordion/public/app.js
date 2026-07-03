const defaultProfile = {
  authentic: 8,
  spice: 5,
  value: 8,
  aesthetic: 5,
  healthy: 6,
  hidden: 7,
  protein: 7,
  vegetarian: 4
};

const labels = {
  authentic: 'Authentic',
  spice: 'Spicy',
  value: 'Budget/value',
  aesthetic: 'Aesthetic',
  healthy: 'Healthy',
  hidden: 'Hidden gems',
  protein: 'High protein',
  vegetarian: 'Vegetarian-friendly'
};

const collectionDefinitions = [
  'All',
  'Hidden Gems',
  'Authentic Mexican',
  'High Protein',
  'Under $10',
  'Vegan',
  'Student Favorites',
  'Family-Owned Businesses',
  'Worth the Wait'
];

let profile = { ...defaultProfile };
let restaurants = [];
let reviews = [];
let selectedCategory = 'All';
let selectedCollection = 'All';
let aiRules = {};

const slidersEl = document.querySelector('#sliders');
const restaurantsEl = document.querySelector('#restaurants');
const reviewsEl = document.querySelector('#reviews');
const statusEl = document.querySelector('#status');
const searchEl = document.querySelector('#search');
const categoryFiltersEl = document.querySelector('#categoryFilters');
const collectionFiltersEl = document.querySelector('#collectionFilters');
const resultCountEl = document.querySelector('#resultCount');
const resetEl = document.querySelector('#reset');
const reviewModal = document.querySelector('#reviewModal');
const detailModal = document.querySelector('#detailModal');
const openReview = document.querySelector('#openReview');
const closeReview = document.querySelector('#closeReview');
const closeDetail = document.querySelector('#closeDetail');
const reviewForm = document.querySelector('#reviewForm');
const reviewRestaurant = document.querySelector('#reviewRestaurant');
const reviewRating = document.querySelector('#reviewRating');
const ratingValue = document.querySelector('#ratingValue');
const aiPromptEl = document.querySelector('#aiPrompt');
const askAiEl = document.querySelector('#askAi');
const aiExplanationEl = document.querySelector('#aiExplanation');
const distanceLimitEl = document.querySelector('#distanceLimit');
const activeFiltersEl = document.querySelector('#activeFilters');
const detailNameEl = document.querySelector('#detailName');
const detailContentEl = document.querySelector('#detailContent');

function setStatus(text) {
  statusEl.textContent = text;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function externalLink(url, label, className = 'button secondary small') {
  if (!url) return '';
  return `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function buildSliders() {
  slidersEl.innerHTML = Object.keys(defaultProfile).map(key => `
    <div class="slider-row">
      <div class="slider-header">
        <span>${labels[key]}</span>
        <span id="value-${key}">${profile[key]}</span>
      </div>
      <input type="range" min="1" max="10" value="${profile[key]}" data-profile-key="${key}" />
    </div>
  `).join('');

  slidersEl.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', event => {
      const key = event.target.dataset.profileKey;
      profile[key] = Number(event.target.value);
      document.querySelector(`#value-${key}`).textContent = profile[key];
      loadRestaurants();
    });
  });
}

async function loadRestaurants() {
  const encodedProfile = encodeURIComponent(JSON.stringify(profile));
  const response = await fetch(`/api/restaurants?profile=${encodedProfile}`);
  const data = await response.json();
  restaurants = data.restaurants || [];
  renderCollectionFilters();
  renderCategoryFilters();
  renderRestaurants();
  buildRestaurantOptions();
}

async function loadReviews() {
  const response = await fetch('/api/reviews');
  const data = await response.json();
  reviews = data.reviews || [];
  renderReviews();
}

function getCategoryList() {
  const priority = [
    'All',
    'Near campus',
    'High protein',
    'Vegetarian options',
    'Vegan options',
    'Budget',
    'Spicy',
    'Healthy',
    'Chinese',
    'Indian',
    'Japanese',
    'Korean',
    'Mexican',
    'Thai',
    'Vietnamese',
    'Mediterranean',
    'American',
    'Italian',
    'Seafood',
    'Sushi',
    'Ramen',
    'Hot Pot',
    'BBQ',
    'Noodles',
    'Dumplings',
    'Poke',
    'Breakfast',
    'Dessert',
    'Cafe',
    'Group friendly',
    'Hidden gem',
    'Local'
  ];

  const fromData = new Set(restaurants.flatMap(restaurant => restaurant.categories || []));
  const ordered = priority.filter(category => category === 'All' || fromData.has(category));
  const extra = [...fromData]
    .filter(category => !ordered.includes(category))
    .sort((a, b) => a.localeCompare(b));

  return [...ordered, ...extra];
}

function renderCategoryFilters() {
  const categories = getCategoryList();
  if (!categories.includes(selectedCategory)) selectedCategory = 'All';

  categoryFiltersEl.innerHTML = categories.map(category => `
    <button
      type="button"
      class="category-chip ${selectedCategory === category ? 'active' : ''}"
      data-category="${escapeHtml(category)}"
    >${escapeHtml(category)}</button>
  `).join('');

  categoryFiltersEl.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategoryFilters();
      renderRestaurants();
    });
  });
}

function renderCollectionFilters() {
  const existing = new Set(restaurants.flatMap(restaurant => restaurant.collections || []));
  const collections = collectionDefinitions.filter(collection => collection === 'All' || existing.has(collection));
  if (!collections.includes(selectedCollection)) selectedCollection = 'All';

  collectionFiltersEl.innerHTML = collections.map(collection => {
    const count = collection === 'All'
      ? restaurants.length
      : restaurants.filter(restaurant => (restaurant.collections || []).includes(collection)).length;
    return `
      <button
        type="button"
        class="category-chip collection-chip ${selectedCollection === collection ? 'active' : ''}"
        data-collection="${escapeHtml(collection)}"
      >${escapeHtml(collection)} <span>${count}</span></button>
    `;
  }).join('');

  collectionFiltersEl.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      selectedCollection = button.dataset.collection;
      renderCollectionFilters();
      renderRestaurants();
    });
  });
}

function parseAiPrompt() {
  const prompt = aiPromptEl.value.trim().toLowerCase();
  const rules = {};
  const explanation = [];

  if (!prompt) {
    aiRules = {};
    aiExplanationEl.textContent = 'Type a craving, budget, nutrition goal, cuisine, category, or distance.';
    renderRestaurants();
    return;
  }

  if (prompt.includes('spicy')) { rules.category = 'Spicy'; explanation.push('spicy'); profile.spice = 8; }
  if (prompt.includes('protein') || prompt.includes('gym') || prompt.includes('athlete')) { rules.minProtein = 30; explanation.push('30g+ protein'); profile.protein = 9; }
  if (prompt.includes('healthy') || prompt.includes('calorie')) { rules.category = 'Healthy'; explanation.push('healthy'); profile.healthy = 8; }
  if (prompt.includes('vegetarian')) { rules.category = 'Vegetarian options'; explanation.push('vegetarian-friendly'); profile.vegetarian = 9; }
  if (prompt.includes('vegan')) { selectedCollection = 'Vegan'; rules.category = 'Vegan options'; explanation.push('vegan options'); profile.vegetarian = 10; }
  if (prompt.includes('mexican')) { selectedCollection = 'Authentic Mexican'; explanation.push('Mexican collection'); }
  if (prompt.includes('hidden')) { selectedCollection = 'Hidden Gems'; explanation.push('hidden gems'); profile.hidden = 9; }
  if (prompt.includes('student') || prompt.includes('campus') || prompt.includes('ucsd')) { selectedCollection = 'Student Favorites'; explanation.push('student favorites'); }
  if (prompt.includes('authentic')) { profile.authentic = 9; explanation.push('authenticity'); }
  if (prompt.includes('near') || prompt.includes('close')) { distanceLimitEl.value = '5'; explanation.push('within 5 miles'); }

  const budgetMatch = prompt.match(/under\s*\$?(\d+)/) || prompt.match(/less than\s*\$?(\d+)/);
  if (budgetMatch) {
    const maxBudget = Number(budgetMatch[1]);
    rules.maxBudget = maxBudget;
    explanation.push(`under $${maxBudget}`);
    if (maxBudget <= 10) selectedCollection = 'Under $10';
    profile.value = 9;
  }

  const cuisineWords = ['chinese', 'indian', 'japanese', 'korean', 'mexican', 'thai', 'vietnamese', 'mediterranean', 'sushi', 'ramen', 'bbq', 'pizza', 'seafood', 'poke', 'dessert', 'breakfast'];
  const cuisine = cuisineWords.find(word => prompt.includes(word));
  if (cuisine && cuisine !== 'mexican') {
    searchEl.value = cuisine;
    explanation.push(cuisine);
  }

  aiRules = rules;
  buildSliders();
  loadRestaurants();
  aiExplanationEl.textContent = explanation.length
    ? `AI matched: ${explanation.join(' + ')}.`
    : 'AI searched your words. Try adding a cuisine, budget, protein goal, or distance.';
}

function priceToMaxDollars(price) {
  if (price === '$') return 10;
  if (price === '$$') return 20;
  if (price === '$$$') return 35;
  return 99;
}

function getFilteredRestaurants() {
  const query = searchEl.value.trim().toLowerCase();
  const distanceLimit = Number(distanceLimitEl.value || 999);

  return restaurants.filter(restaurant => {
    const haystack = [
      restaurant.name,
      restaurant.area,
      restaurant.cuisine,
      restaurant.summary,
      restaurant.recommendedDish,
      ...(restaurant.tags || []),
      ...(restaurant.categories || []),
      ...(restaurant.collections || [])
    ].join(' ').toLowerCase();

    const matchesSearch = !query || haystack.includes(query);
    const matchesCategory = selectedCategory === 'All' || (restaurant.categories || []).includes(selectedCategory);
    const matchesCollection = selectedCollection === 'All' || (restaurant.collections || []).includes(selectedCollection);
    const matchesDistance = Number(restaurant.distanceMiles || 999) <= distanceLimit;
    const matchesProtein = !aiRules.minProtein || Number(restaurant.nutrition?.protein || 0) >= aiRules.minProtein;
    const matchesBudget = !aiRules.maxBudget || priceToMaxDollars(restaurant.price) <= aiRules.maxBudget || (restaurant.collections || []).includes('Under $10');
    const matchesAiCategory = !aiRules.category || (restaurant.categories || []).includes(aiRules.category) || (restaurant.collections || []).includes(aiRules.category);

    return matchesSearch && matchesCategory && matchesCollection && matchesDistance && matchesProtein && matchesBudget && matchesAiCategory;
  });
}

function renderActiveFilters() {
  const filters = [];
  if (selectedCollection !== 'All') filters.push(`Collection: ${selectedCollection}`);
  if (selectedCategory !== 'All') filters.push(`Category: ${selectedCategory}`);
  if (searchEl.value.trim()) filters.push(`Search: ${searchEl.value.trim()}`);
  if (Number(distanceLimitEl.value) < 999) filters.push(`Distance: within ${distanceLimitEl.value} miles`);
  if (aiRules.minProtein) filters.push('30g+ protein');
  if (aiRules.maxBudget) filters.push(`Under $${aiRules.maxBudget}`);

  activeFiltersEl.innerHTML = filters.map(filter => `<span class="pill active-pill">${escapeHtml(filter)}</span>`).join('');
}

function getGroupLabel(restaurant) {
  const priority = ['Chinese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Vietnamese', 'Mediterranean', 'American', 'Italian', 'Seafood', 'Healthy', 'Dessert', 'Cafe'];
  const categories = restaurant.categories || [];
  return priority.find(category => categories.includes(category)) || restaurant.cuisine || 'Other';
}

function groupByCuisine(list) {
  const groups = new Map();
  list.forEach(restaurant => {
    const label = getGroupLabel(restaurant);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(restaurant);
  });

  return [...groups.entries()].sort((a, b) => {
    const topA = Math.max(...a[1].map(r => r.matchScore || 0));
    const topB = Math.max(...b[1].map(r => r.matchScore || 0));
    return topB - topA || a[0].localeCompare(b[0]);
  });
}

function restaurantCard(restaurant, compact = false) {
  const categories = (restaurant.categories || []).slice(0, compact ? 4 : 6);
  return `
    <article class="restaurant-card ${compact ? 'compact-card' : ''}">
      <div class="restaurant-top">
        <div>
          <h3>${escapeHtml(restaurant.name)}</h3>
          <div class="meta">
            <span class="pill cuisine-pill">${escapeHtml(restaurant.cuisine)}</span>
            <span class="pill">${escapeHtml(restaurant.price)}</span>
            <span class="pill distance-pill">${Number(restaurant.distanceMiles || 0).toFixed(1)} mi</span>
          </div>
        </div>
        <div class="match-wrap">
          <div class="match" aria-label="${restaurant.matchScore}% match">${restaurant.matchScore}%</div>
          <span>${restaurant.authenticityScore || 7}/10 authentic</span>
        </div>
      </div>
      <p>${escapeHtml(restaurant.summary)}</p>
      <div class="nutrition-row">
        <span>🔥 ${escapeHtml(restaurant.nutrition?.calories || '—')} cal</span>
        <span>💪 ${escapeHtml(restaurant.nutrition?.protein || '—')}g protein</span>
        <span>🍚 ${escapeHtml(restaurant.nutrition?.carbs || '—')}g carbs</span>
      </div>
      <p class="dish"><strong>Try:</strong> ${escapeHtml(restaurant.recommendedDish || 'Popular dish')}</p>
      <div class="category-list">
        ${categories.map(category => `<button type="button" class="mini-category" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}
      </div>
      <button type="button" class="button secondary full details-button" data-id="${escapeHtml(restaurant.id)}">View details</button>
    </article>
  `;
}

function attachResultHandlers() {
  restaurantsEl.querySelectorAll('.mini-category[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategoryFilters();
      renderRestaurants();
      document.querySelector('#demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  restaurantsEl.querySelectorAll('.details-button').forEach(button => {
    button.addEventListener('click', () => openDetails(button.dataset.id));
  });
}

function renderRestaurants() {
  const filtered = getFilteredRestaurants();
  resultCountEl.textContent = `${filtered.length} curated restaurant${filtered.length === 1 ? '' : 's'} shown out of ${restaurants.length}+ seed spots`;
  renderActiveFilters();

  if (!filtered.length) {
    restaurantsEl.innerHTML = '<p class="muted empty-state">No restaurants match that combo yet. Try clearing distance, budget, or collection filters.</p>';
    return;
  }

  const topMatches = filtered.slice(0, 12);
  const grouped = groupByCuisine(filtered);

  restaurantsEl.innerHTML = `
    <details class="restaurant-accordion" open>
      <summary>
        <span>Best matches</span>
        <em>${topMatches.length} spots</em>
      </summary>
      <div class="restaurant-grid">
        ${topMatches.map(restaurant => restaurantCard(restaurant)).join('')}
      </div>
    </details>

    <details class="restaurant-accordion">
      <summary>
        <span>Browse all results by cuisine</span>
        <em>${filtered.length} spots</em>
      </summary>
      <div class="nested-accordion-list">
        ${grouped.map(([group, items]) => `
          <details class="nested-accordion">
            <summary>
              <span>${escapeHtml(group)}</span>
              <em>${items.length} spot${items.length === 1 ? '' : 's'}</em>
            </summary>
            <div class="restaurant-grid compact-grid">
              ${items.map(restaurant => restaurantCard(restaurant, true)).join('')}
            </div>
          </details>
        `).join('')}
      </div>
    </details>
  `;

  attachResultHandlers();
}

function openDetails(id) {
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return;

  detailNameEl.textContent = restaurant.name;
  detailContentEl.innerHTML = `
    <div class="detail-grid">
      <section class="detail-card">
        <h4>Quick info</h4>
        <p><strong>Cuisine:</strong> ${escapeHtml(restaurant.cuisine)}</p>
        <p><strong>Area:</strong> ${escapeHtml(restaurant.area)}</p>
        <p><strong>Distance:</strong> ${Number(restaurant.distanceMiles || 0).toFixed(1)} miles from UCSD</p>
        <p><strong>Price:</strong> ${escapeHtml(restaurant.price)}</p>
        <p><strong>Authenticity score:</strong> ${escapeHtml(restaurant.authenticityScore || 7)}/10</p>
        <p><strong>Recommended dish:</strong> ${escapeHtml(restaurant.recommendedDish || 'Popular dish')}</p>
      </section>
      <section class="detail-card">
        <h4>Nutrition estimate</h4>
        <p>🔥 Calories: ${escapeHtml(restaurant.nutrition?.calories || '—')}</p>
        <p>💪 Protein: ${escapeHtml(restaurant.nutrition?.protein || '—')}g</p>
        <p>🍚 Carbs: ${escapeHtml(restaurant.nutrition?.carbs || '—')}g</p>
        <p class="muted compact">Estimates are demo estimates for a typical meal, not official nutrition facts.</p>
      </section>
      <section class="detail-card full-detail">
        <h4>Restaurant details</h4>
        <p>📍 <strong>Address:</strong> ${escapeHtml(restaurant.address || 'Check Google Maps')}</p>
        <p>🕒 <strong>Hours:</strong> ${escapeHtml(restaurant.hours || 'Check official site')}</p>
        <p>📞 <strong>Phone:</strong> ${escapeHtml(restaurant.phone || 'Check official site or Google Maps')}</p>
        <div class="detail-actions">
          ${externalLink(restaurant.website, 'Official website')}
          ${externalLink(restaurant.instagram, 'Instagram')}
          ${externalLink(restaurant.directions, 'Directions')}
          ${externalLink(restaurant.reservation, 'Reservation')}
        </div>
      </section>
      <section class="detail-card full-detail">
        <h4>Taste breakdown</h4>
        <div class="score-bars">
          ${Object.entries(labels).map(([key, label]) => {
            const score = restaurant.tasteScores?.[key] || 5;
            return `
              <div class="score-line">
                <span>${label}</span>
                <div class="bar"><span style="width: ${score * 10}%"></span></div>
                <span>${score}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;
  detailModal.showModal();
}

function buildRestaurantOptions() {
  reviewRestaurant.innerHTML = restaurants.map(restaurant => `
    <option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</option>
  `).join('');
}

function getRestaurantName(id) {
  return restaurants.find(restaurant => restaurant.id === id)?.name || 'Restaurant';
}

function renderReviews() {
  if (!reviews.length) {
    reviewsEl.innerHTML = '<p class="muted">No reviews yet. Add the first one.</p>';
    return;
  }

  reviewsEl.innerHTML = reviews.slice(0, 8).map(review => `
    <article class="review-card">
      <div class="review-meta">${escapeHtml(getRestaurantName(review.restaurantId))} • ${review.rating}/10</div>
      <h3>${escapeHtml(review.group || 'General taste group')}</h3>
      <p>“${escapeHtml(review.comment)}”</p>
      <p class="muted">— ${escapeHtml(review.name || 'Anonymous')}</p>
    </article>
  `).join('');
}

async function submitReview(event) {
  event.preventDefault();

  const payload = {
    restaurantId: reviewRestaurant.value,
    name: document.querySelector('#reviewName').value,
    group: document.querySelector('#reviewGroup').value,
    rating: Number(reviewRating.value),
    comment: document.querySelector('#reviewComment').value
  };

  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    alert('Could not save review. Make sure you wrote a comment.');
    return;
  }

  reviewForm.reset();
  reviewRating.value = 8;
  ratingValue.textContent = '8';
  reviewModal.close();
  await loadReviews();
}

async function refreshAll(showStatus = true) {
  try {
    await loadRestaurants();
    await loadReviews();
    if (showStatus) setStatus('Updated just now');
  } catch (error) {
    console.error(error);
    setStatus('Could not connect');
  }
}

buildSliders();
refreshAll();

searchEl.addEventListener('input', renderRestaurants);
distanceLimitEl.addEventListener('change', renderRestaurants);
askAiEl.addEventListener('click', parseAiPrompt);
aiPromptEl.addEventListener('keydown', event => {
  if (event.key === 'Enter') parseAiPrompt();
});
resetEl.addEventListener('click', () => {
  profile = { ...defaultProfile };
  selectedCategory = 'All';
  selectedCollection = 'All';
  aiRules = {};
  searchEl.value = '';
  aiPromptEl.value = '';
  distanceLimitEl.value = '999';
  aiExplanationEl.textContent = 'Try: “vegan near campus”, “authentic Chinese”, “high protein Korean BBQ”, or “under $10 Mexican”.';
  buildSliders();
  loadRestaurants();
});

openReview.addEventListener('click', () => reviewModal.showModal());
closeReview.addEventListener('click', () => reviewModal.close());
closeDetail.addEventListener('click', () => detailModal.close());
reviewRating.addEventListener('input', () => ratingValue.textContent = reviewRating.value);
reviewForm.addEventListener('submit', submitReview);

setInterval(() => refreshAll(false), 20000);
