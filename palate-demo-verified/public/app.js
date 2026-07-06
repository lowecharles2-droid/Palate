const defaultProfile = {
  authentic: 8,
  spice: 5,
  value: 8,
  aesthetic: 5,
  healthy: 6,
  hidden: 6,
  protein: 7,
  vegetarian: 4
};

const labels = {
  authentic: 'Cuisine fidelity',
  spice: 'Spicy',
  value: 'Budget/value',
  aesthetic: 'Atmosphere',
  healthy: 'Health-focused',
  hidden: 'Independent/local',
  protein: 'Protein-friendly',
  vegetarian: 'Plant-friendly'
};

const collectionDefinitions = [
  'All',
  'Authenticity Picks',
  'Local & Independent',
  'Student Favorites',
  'High Protein',
  'Plant-Friendly',
  'Budget-Friendly',
  'Date Night'
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
    'All', 'Near campus', 'High protein', 'Vegetarian options', 'Vegan options',
    'Halal options', 'Gluten-conscious options', 'Budget', 'Spicy', 'Healthy',
    'Family-owned', 'Local', 'Chain', 'Date night', 'Aesthetic', 'Group friendly',
    'Chinese', 'Taiwanese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai',
    'Mediterranean', 'Italian', 'American', 'Greek', 'Seafood', 'Ramen', 'Hot Pot',
    'Korean BBQ', 'Dumplings', 'Noodles', 'Poke', 'Burgers', 'Breakfast', 'Cafe', 'Dessert'
  ];

  const fromData = new Set(restaurants.flatMap(restaurant => restaurant.categories || []));
  const ordered = priority.filter(category => category === 'All' || fromData.has(category));
  const extra = [...fromData].filter(category => !ordered.includes(category)).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...extra];
}

function renderCategoryFilters() {
  const categories = getCategoryList();
  if (!categories.includes(selectedCategory)) selectedCategory = 'All';

  categoryFiltersEl.innerHTML = categories.map(category => `
    <button type="button" class="category-chip ${selectedCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
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
    const count = collection === 'All' ? restaurants.length : restaurants.filter(r => (r.collections || []).includes(collection)).length;
    return `<button type="button" class="category-chip collection-chip ${selectedCollection === collection ? 'active' : ''}" data-collection="${escapeHtml(collection)}">${escapeHtml(collection)} <span>${count}</span></button>`;
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
  const explanation = [];
  aiRules = {};

  if (!prompt) {
    aiExplanationEl.textContent = 'Type a cuisine, budget, dietary need, atmosphere, or distance.';
    renderRestaurants();
    return;
  }

  const categoryMap = [
    ['spicy', 'Spicy'], ['protein', 'High protein'], ['gym', 'High protein'],
    ['healthy', 'Healthy'], ['vegetarian', 'Vegetarian options'], ['vegan', 'Vegan options'],
    ['halal', 'Halal options'], ['gluten', 'Gluten-conscious options'],
    ['family owned', 'Family-owned'], ['local', 'Local'], ['date night', 'Date night'],
    ['chain', 'Chain'], ['ramen', 'Ramen'], ['hot pot', 'Hot Pot'], ['poke', 'Poke']
  ];

  const matches = categoryMap.filter(([word]) => prompt.includes(word)).map(([, category]) => category);
  if (matches.length) {
    aiRules.categories = matches;
    explanation.push(...matches);
  }

  if (prompt.includes('authentic')) {
    profile.authentic = 10;
    explanation.push('highest cuisine-fidelity scores');
  }
  if (prompt.includes('cheap') || prompt.includes('budget') || /under\s*\$?\d+/.test(prompt)) {
    selectedCollection = 'Budget-Friendly';
    profile.value = 10;
    explanation.push('budget-friendly');
  }
  if (prompt.includes('near') || prompt.includes('campus') || prompt.includes('ucsd')) {
    distanceLimitEl.value = '3';
    explanation.push('within about 3 miles of UCSD');
  }

  const cuisineWords = ['chinese', 'taiwanese', 'indian', 'japanese', 'korean', 'mexican', 'thai', 'mediterranean', 'italian', 'american', 'greek', 'seafood', 'burger', 'dumpling', 'noodle'];
  const cuisine = cuisineWords.find(word => prompt.includes(word));
  searchEl.value = cuisine || '';
  if (cuisine) explanation.push(cuisine);

  buildSliders();
  loadRestaurants();
  aiExplanationEl.textContent = explanation.length ? `Matched: ${[...new Set(explanation)].join(' + ')}.` : 'Searched your words. Add a cuisine, dietary tag, budget, or distance.';
}

function getFilteredRestaurants() {
  const query = searchEl.value.trim().toLowerCase();
  const distanceLimit = Number(distanceLimitEl.value || 999);

  return restaurants.filter(restaurant => {
    const haystack = [restaurant.name, restaurant.area, restaurant.cuisine, restaurant.summary, restaurant.recommendedDish, restaurant.authenticityReason, ...(restaurant.tags || []), ...(restaurant.categories || []), ...(restaurant.collections || [])].join(' ').toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    const matchesCategory = selectedCategory === 'All' || (restaurant.categories || []).includes(selectedCategory);
    const matchesCollection = selectedCollection === 'All' || (restaurant.collections || []).includes(selectedCollection);
    const matchesDistance = Number(restaurant.distanceMiles ?? 999) <= distanceLimit;
    const matchesAi = !aiRules.categories || aiRules.categories.every(category => (restaurant.categories || []).includes(category));
    return matchesSearch && matchesCategory && matchesCollection && matchesDistance && matchesAi;
  });
}

function renderActiveFilters() {
  const filters = [];
  if (selectedCollection !== 'All') filters.push(`Collection: ${selectedCollection}`);
  if (selectedCategory !== 'All') filters.push(`Category: ${selectedCategory}`);
  if (searchEl.value.trim()) filters.push(`Search: ${searchEl.value.trim()}`);
  if (Number(distanceLimitEl.value) < 999) filters.push(`Approx. within ${distanceLimitEl.value} miles`);
  (aiRules.categories || []).forEach(category => filters.push(category));
  activeFiltersEl.innerHTML = [...new Set(filters)].map(filter => `<span class="pill active-pill">${escapeHtml(filter)}</span>`).join('');
}

function getGroupLabel(restaurant) {
  const priority = ['Chinese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Mediterranean', 'Italian', 'American', 'Greek', 'Seafood', 'Healthy'];
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
  return [...groups.entries()].sort((a, b) => Math.max(...b[1].map(r => r.matchScore || 0)) - Math.max(...a[1].map(r => r.matchScore || 0)) || a[0].localeCompare(b[0]));
}

function restaurantCard(restaurant, compact = false) {
  const categories = (restaurant.categories || []).filter(c => ![restaurant.area, restaurant.cuisine].includes(c)).slice(0, compact ? 4 : 6);
  return `
    <article class="restaurant-card ${compact ? 'compact-card' : ''}">
      <div class="restaurant-top">
        <div>
          <div class="verified-line"><span class="verified-badge">Source-checked</span><span>Verified ${escapeHtml(restaurant.lastVerified)}</span></div>
          <h3>${escapeHtml(restaurant.name)}</h3>
          <div class="meta">
            <span class="pill cuisine-pill">${escapeHtml(restaurant.cuisine)}</span>
            <span class="pill">${escapeHtml(restaurant.price)}</span>
            <span class="pill distance-pill">~${Number(restaurant.distanceMiles || 0).toFixed(1)} mi</span>
          </div>
        </div>
        <div class="match-wrap">
          <div class="match" aria-label="${restaurant.matchScore}% match">${restaurant.matchScore}%</div>
          <span>${restaurant.authenticityScore}/10 cuisine fidelity</span>
        </div>
      </div>
      <p>${escapeHtml(restaurant.summary)}</p>
      <div class="evidence-row">
        <span>Authenticity ${restaurant.authenticityScore}/10</span>
        <span>Local ${restaurant.localScore}/10</span>
        <span>${restaurant.chain ? 'Chain' : 'Independent/local'}</span>
      </div>
      <p class="dish"><strong>Try:</strong> ${escapeHtml(restaurant.recommendedDish || 'A menu specialty')}</p>
      <div class="category-list">${categories.map(category => `<button type="button" class="mini-category" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}</div>
      <button type="button" class="button secondary full details-button" data-id="${escapeHtml(restaurant.id)}">View evidence & details</button>
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
  restaurantsEl.querySelectorAll('.details-button').forEach(button => button.addEventListener('click', () => openDetails(button.dataset.id)));
}

function renderRestaurants() {
  const filtered = getFilteredRestaurants();
  resultCountEl.textContent = `${filtered.length} source-checked restaurant${filtered.length === 1 ? '' : 's'} shown out of ${restaurants.length}`;
  renderActiveFilters();

  if (!filtered.length) {
    restaurantsEl.innerHTML = '<p class="muted empty-state">No verified restaurants match that combination. Clear one or more filters.</p>';
    return;
  }

  const topMatches = filtered.slice(0, 12);
  const grouped = groupByCuisine(filtered);
  restaurantsEl.innerHTML = `
    <details class="restaurant-accordion" open>
      <summary><span>Best matches</span><em>${topMatches.length} spots</em></summary>
      <div class="restaurant-grid">${topMatches.map(restaurant => restaurantCard(restaurant)).join('')}</div>
    </details>
    <details class="restaurant-accordion">
      <summary><span>Browse all verified results by cuisine</span><em>${filtered.length} spots</em></summary>
      <div class="nested-accordion-list">
        ${grouped.map(([group, items]) => `<details class="nested-accordion"><summary><span>${escapeHtml(group)}</span><em>${items.length} spot${items.length === 1 ? '' : 's'}</em></summary><div class="restaurant-grid compact-grid">${items.map(restaurant => restaurantCard(restaurant, true)).join('')}</div></details>`).join('')}
      </div>
    </details>`;
  attachResultHandlers();
}

function openDetails(id) {
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return;
  detailNameEl.textContent = restaurant.name;
  detailContentEl.innerHTML = `
    <div class="detail-grid">
      <section class="detail-card">
        <h4>Verified basics</h4>
        <p><strong>Cuisine:</strong> ${escapeHtml(restaurant.cuisine)}</p>
        <p><strong>Area:</strong> ${escapeHtml(restaurant.area)}</p>
        <p><strong>Approx. distance:</strong> ${Number(restaurant.distanceMiles || 0).toFixed(1)} miles from central UCSD</p>
        <p><strong>Price level:</strong> ${escapeHtml(restaurant.price)}</p>
        <p><strong>Last checked:</strong> ${escapeHtml(restaurant.lastVerified)}</p>
      </section>
      <section class="detail-card">
        <h4>Palate scoring</h4>
        <p><strong>Cuisine fidelity:</strong> ${restaurant.authenticityScore}/10</p>
        <p><strong>Local/independent:</strong> ${restaurant.localScore}/10</p>
        <p>${escapeHtml(restaurant.authenticityReason)}</p>
        <p class="muted compact">Cuisine fidelity asks how closely the restaurant delivers the food category it claims—not whether one culture is “better” than another.</p>
      </section>
      <section class="detail-card full-detail">
        <h4>Location and official links</h4>
        <p>📍 <strong>Address:</strong> ${escapeHtml(restaurant.address)}</p>
        <p>🕒 <strong>Hours:</strong> ${escapeHtml(restaurant.hours)}</p>
        ${restaurant.phone ? `<p>📞 <strong>Phone:</strong> ${escapeHtml(restaurant.phone)}</p>` : ''}
        <div class="detail-actions">
          ${externalLink(restaurant.website, 'Official website')}
          ${externalLink(restaurant.verificationSource, restaurant.verificationSourceLabel || 'Verification source')}
          ${externalLink(restaurant.directions, 'Directions')}
        </div>
      </section>
      <section class="detail-card full-detail">
        <h4>Why the filters apply</h4>
        <div class="category-list">${(restaurant.categories || []).filter(c => c !== restaurant.area).map(category => `<span class="mini-category static">${escapeHtml(category)}</span>`).join('')}</div>
        <ul class="evidence-list">${(restaurant.filterEvidence || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <p class="muted compact">Dietary tags describe menu availability, not allergy safety. Confirm ingredients and cross-contact directly with the restaurant.</p>
      </section>
      <section class="detail-card full-detail">
        <h4>Taste profile</h4>
        <div class="score-bars">${Object.entries(labels).map(([key, label]) => { const score = restaurant.tasteScores?.[key] || 5; return `<div class="score-line"><span>${label}</span><div class="bar"><span style="width:${score * 10}%"></span></div><span>${score}</span></div>`; }).join('')}</div>
      </section>
    </div>`;
  detailModal.showModal();
}

function buildRestaurantOptions() {
  reviewRestaurant.innerHTML = restaurants.map(restaurant => `<option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</option>`).join('');
}
function getRestaurantName(id) { return restaurants.find(restaurant => restaurant.id === id)?.name || 'Restaurant'; }
function renderReviews() {
  if (!reviews.length) { reviewsEl.innerHTML = '<p class="muted">No reviews yet. Add the first one.</p>'; return; }
  reviewsEl.innerHTML = reviews.slice(0, 8).map(review => `<article class="review-card"><div class="review-meta">${escapeHtml(getRestaurantName(review.restaurantId))} • ${review.rating}/10</div><h3>${escapeHtml(review.group || 'General taste group')}</h3><p>“${escapeHtml(review.comment)}”</p><p class="muted">— ${escapeHtml(review.name || 'Anonymous')}</p></article>`).join('');
}

async function submitReview(event) {
  event.preventDefault();
  const payload = { restaurantId: reviewRestaurant.value, name: document.querySelector('#reviewName').value, group: document.querySelector('#reviewGroup').value, rating: Number(reviewRating.value), comment: document.querySelector('#reviewComment').value };
  const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) { alert('Could not save review. Make sure you wrote a comment.'); return; }
  reviewForm.reset(); reviewRating.value = 8; ratingValue.textContent = '8'; reviewModal.close(); await loadReviews();
}

async function refreshAll(showStatus = true) {
  try { await loadRestaurants(); await loadReviews(); if (showStatus) setStatus('Verified dataset loaded'); }
  catch (error) { console.error(error); setStatus('Could not connect'); }
}

buildSliders();
refreshAll();
searchEl.addEventListener('input', renderRestaurants);
distanceLimitEl.addEventListener('change', renderRestaurants);
askAiEl.addEventListener('click', parseAiPrompt);
aiPromptEl.addEventListener('keydown', event => { if (event.key === 'Enter') parseAiPrompt(); });
resetEl.addEventListener('click', () => {
  profile = { ...defaultProfile }; selectedCategory = 'All'; selectedCollection = 'All'; aiRules = {};
  searchEl.value = ''; aiPromptEl.value = ''; distanceLimitEl.value = '999';
  aiExplanationEl.textContent = 'Try: “authentic Chinese”, “vegan near campus”, “high protein”, or “local date night”.';
  buildSliders(); loadRestaurants();
});
openReview.addEventListener('click', () => reviewModal.showModal());
closeReview.addEventListener('click', () => reviewModal.close());
closeDetail.addEventListener('click', () => detailModal.close());
reviewRating.addEventListener('input', () => ratingValue.textContent = reviewRating.value);
reviewForm.addEventListener('submit', submitReview);
setInterval(() => refreshAll(false), 60000);
