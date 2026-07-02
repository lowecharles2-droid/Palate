const tasteKeys = [
  { key: 'authentic', label: 'Authentic' },
  { key: 'spicy', label: 'Spicy' },
  { key: 'budget', label: 'Budget' },
  { key: 'aesthetic', label: 'Aesthetic' },
  { key: 'hiddenGem', label: 'Hidden gem' },
  { key: 'healthy', label: 'Healthy' }
];

const defaultProfile = {
  authentic: 9,
  spicy: 5,
  budget: 8,
  aesthetic: 4,
  hiddenGem: 8,
  healthy: 4
};

let restaurants = [];
let profile = loadProfile();
let activeRestaurantId = null;

const elements = {
  sliderList: document.querySelector('#sliderList'),
  saveTasteButton: document.querySelector('#saveTasteButton'),
  saveNote: document.querySelector('#saveNote'),
  searchInput: document.querySelector('#searchInput'),
  cuisineFilter: document.querySelector('#cuisineFilter'),
  tagFilter: document.querySelector('#tagFilter'),
  restaurantGrid: document.querySelector('#restaurantGrid'),
  resultsCount: document.querySelector('#resultsCount'),
  lastUpdated: document.querySelector('#lastUpdated'),
  refreshButton: document.querySelector('#refreshButton'),
  reviewRestaurant: document.querySelector('#reviewRestaurant'),
  reviewName: document.querySelector('#reviewName'),
  reviewGroup: document.querySelector('#reviewGroup'),
  reviewRating: document.querySelector('#reviewRating'),
  ratingValue: document.querySelector('#ratingValue'),
  reviewScoreGrid: document.querySelector('#reviewScoreGrid'),
  reviewComment: document.querySelector('#reviewComment'),
  reviewForm: document.querySelector('#reviewForm'),
  formStatus: document.querySelector('#formStatus'),
  statsRow: document.querySelector('#statsRow'),
  modal: document.querySelector('#restaurantModal'),
  modalContent: document.querySelector('#modalContent'),
  closeModal: document.querySelector('#closeModal')
};

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem('localTasteProfile'));
    return { ...defaultProfile, ...saved };
  } catch (error) {
    return { ...defaultProfile };
  }
}

function saveProfile() {
  localStorage.setItem('localTasteProfile', JSON.stringify(profile));
  elements.saveNote.textContent = 'Saved. Recommendations updated.';
  window.setTimeout(() => {
    elements.saveNote.textContent = '';
  }, 2200);
}

function createSliders() {
  elements.sliderList.innerHTML = tasteKeys.map(({ key, label }) => `
    <div class="slider-row">
      <div class="slider-label">
        <span>${label}</span>
        <strong id="profile-${key}-value">${profile[key]}</strong>
      </div>
      <input type="range" min="0" max="10" value="${profile[key]}" data-profile-key="${key}" aria-label="${label} preference" />
    </div>
  `).join('');

  elements.sliderList.querySelectorAll('input[type="range"]').forEach((slider) => {
    slider.addEventListener('input', () => {
      const key = slider.dataset.profileKey;
      profile[key] = Number(slider.value);
      document.querySelector(`#profile-${key}-value`).textContent = slider.value;
      renderRestaurants();
    });
  });
}

function createReviewScoreInputs() {
  elements.reviewScoreGrid.innerHTML = tasteKeys.map(({ key, label }) => `
    <label>
      ${label}: <span id="review-${key}-value">7</span>/10
      <input type="range" min="1" max="10" value="7" data-review-key="${key}" />
    </label>
  `).join('');

  elements.reviewScoreGrid.querySelectorAll('input[type="range"]').forEach((slider) => {
    slider.addEventListener('input', () => {
      const key = slider.dataset.reviewKey;
      document.querySelector(`#review-${key}-value`).textContent = slider.value;
    });
  });
}

function calculateMatch(restaurant) {
  let weightedScore = 0;
  let maxPossible = 0;

  for (const { key } of tasteKeys) {
    const importance = Number(profile[key] || 0);
    weightedScore += importance * Number(restaurant.groupScores[key] || 0);
    maxPossible += importance * 10;
  }

  if (maxPossible === 0) return 0;
  return Math.round((weightedScore / maxPossible) * 100);
}

function topScoreKeys(restaurant) {
  return [...tasteKeys]
    .sort((a, b) => (restaurant.groupScores[b.key] || 0) - (restaurant.groupScores[a.key] || 0))
    .slice(0, 3);
}

function filteredRestaurants() {
  const search = elements.searchInput.value.trim().toLowerCase();
  const cuisine = elements.cuisineFilter.value;
  const tag = elements.tagFilter.value;

  return restaurants
    .filter((restaurant) => {
      const haystack = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.neighborhood,
        restaurant.description,
        restaurant.bestFor,
        ...(restaurant.tags || []),
        ...(restaurant.vibes || [])
      ].join(' ').toLowerCase();

      const matchesSearch = !search || haystack.includes(search);
      const matchesCuisine = cuisine === 'all' || restaurant.cuisine === cuisine;
      const matchesTag = tag === 'all' || restaurant.tags.includes(tag);
      return matchesSearch && matchesCuisine && matchesTag;
    })
    .map((restaurant) => ({ ...restaurant, matchScore: calculateMatch(restaurant) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

function renderFilters() {
  const cuisines = [...new Set(restaurants.map((restaurant) => restaurant.cuisine))].sort();
  const tags = [...new Set(restaurants.flatMap((restaurant) => restaurant.tags))].sort();

  const currentCuisine = elements.cuisineFilter.value || 'all';
  const currentTag = elements.tagFilter.value || 'all';

  elements.cuisineFilter.innerHTML = '<option value="all">All cuisines</option>' + cuisines.map((cuisine) => `
    <option value="${escapeHtml(cuisine)}">${escapeHtml(cuisine)}</option>
  `).join('');

  elements.tagFilter.innerHTML = '<option value="all">All tags</option>' + tags.map((tag) => `
    <option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>
  `).join('');

  elements.cuisineFilter.value = cuisines.includes(currentCuisine) ? currentCuisine : 'all';
  elements.tagFilter.value = tags.includes(currentTag) ? currentTag : 'all';
}

function renderReviewOptions() {
  const current = elements.reviewRestaurant.value;
  elements.reviewRestaurant.innerHTML = restaurants.map((restaurant) => `
    <option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</option>
  `).join('');

  if (restaurants.some((restaurant) => restaurant.id === current)) {
    elements.reviewRestaurant.value = current;
  }
}

function renderRestaurants() {
  const visible = filteredRestaurants();
  elements.resultsCount.textContent = `${visible.length} restaurant${visible.length === 1 ? '' : 's'} matched your taste profile`;

  if (visible.length === 0) {
    elements.restaurantGrid.innerHTML = `
      <article class="restaurant-card">
        <div class="restaurant-body">
          <h3>No matches yet</h3>
          <p class="muted">Try clearing filters or searching for another cuisine, location, or preference.</p>
        </div>
      </article>
    `;
    return;
  }

  elements.restaurantGrid.innerHTML = visible.map((restaurant) => renderRestaurantCard(restaurant)).join('');

  elements.restaurantGrid.querySelectorAll('[data-open-restaurant]').forEach((button) => {
    button.addEventListener('click', () => openRestaurant(button.dataset.openRestaurant));
  });

  elements.restaurantGrid.querySelectorAll('[data-review-restaurant]').forEach((button) => {
    button.addEventListener('click', () => {
      elements.reviewRestaurant.value = button.dataset.reviewRestaurant;
      document.querySelector('#review').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderRestaurantCard(restaurant) {
  const topScores = topScoreKeys(restaurant);
  return `
    <article class="restaurant-card">
      <div class="restaurant-image" style="background-image:url('${restaurant.image}')" role="img" aria-label="${escapeHtml(restaurant.name)} food image"></div>
      <div class="restaurant-body">
        <div class="card-header">
          <div>
            <h3>${escapeHtml(restaurant.name)}</h3>
            <p class="muted">${escapeHtml(restaurant.cuisine)} • ${escapeHtml(restaurant.neighborhood)} • ${escapeHtml(restaurant.price)}</p>
          </div>
          <div class="match-badge">${restaurant.matchScore}%<span>match</span></div>
        </div>
        <p>${escapeHtml(restaurant.description)}</p>
        <div class="tag-row">
          ${restaurant.tags.slice(0, 5).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="score-bars">
          ${topScores.map(({ key, label }) => renderScoreRow(label, restaurant.groupScores[key])).join('')}
        </div>
        <div class="card-actions">
          <button class="button ghost" type="button" data-open-restaurant="${escapeHtml(restaurant.id)}">Details</button>
          <button class="button primary" type="button" data-review-restaurant="${escapeHtml(restaurant.id)}">Review</button>
        </div>
      </div>
    </article>
  `;
}

function renderScoreRow(label, value) {
  const score = Number(value || 0);
  return `
    <div class="score-row">
      <span>${escapeHtml(label)}</span>
      <span class="bar"><span class="bar-fill" style="width:${score * 10}%"></span></span>
      <strong>${score.toFixed(1)}</strong>
    </div>
  `;
}

async function openRestaurant(id) {
  activeRestaurantId = id;
  const response = await fetch(`/api/restaurants/${encodeURIComponent(id)}`);
  if (!response.ok) return;

  const data = await response.json();
  const restaurant = { ...data.restaurant, matchScore: calculateMatch(data.restaurant) };
  const reviews = data.reviews || [];

  elements.modalContent.innerHTML = `
    <div class="modal-hero" style="background-image:url('${restaurant.image}')">
      <div>
        <span class="pill">${restaurant.matchScore}% match for you</span>
        <h2>${escapeHtml(restaurant.name)}</h2>
        <p>${escapeHtml(restaurant.cuisine)} • ${escapeHtml(restaurant.neighborhood)} • ${escapeHtml(restaurant.price)}</p>
      </div>
    </div>
    <div class="modal-body">
      <p>${escapeHtml(restaurant.description)}</p>
      <p><strong>Best for:</strong> ${escapeHtml(restaurant.bestFor)}</p>
      <div class="score-bars">
        ${tasteKeys.map(({ key, label }) => renderScoreRow(label, restaurant.groupScores[key])).join('')}
      </div>
      <div>
        <h3>Recent taste reviews</h3>
        <div class="review-list">
          ${reviews.length ? reviews.map(renderReview).join('') : '<p class="muted">No reviews yet. Be the first to add one.</p>'}
        </div>
      </div>
    </div>
  `;

  document.body.classList.add('modal-open');
  elements.modal.showModal();
}

function renderReview(review) {
  return `
    <div class="review-item">
      <p><strong>${escapeHtml(review.name)}</strong> rated it ${Number(review.rating).toFixed(0)}/10</p>
      <p class="muted">Taste group: ${escapeHtml(review.tasteGroup)}</p>
      <p>${escapeHtml(review.comment || 'No comment added.')}</p>
    </div>
  `;
}

async function loadRestaurants(showStatus = false) {
  try {
    const response = await fetch('/api/restaurants');
    if (!response.ok) throw new Error('Failed to load restaurants.');
    const data = await response.json();
    restaurants = data.restaurants || [];

    renderFilters();
    renderReviewOptions();
    renderRestaurants();
    await loadStats();

    const updated = new Date(data.updatedAt);
    elements.lastUpdated.textContent = `Updated ${updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    if (showStatus) {
      elements.lastUpdated.textContent = 'Data refreshed just now';
    }

    if (activeRestaurantId && elements.modal.open) {
      openRestaurant(activeRestaurantId);
    }
  } catch (error) {
    elements.restaurantGrid.innerHTML = `
      <article class="restaurant-card">
        <div class="restaurant-body">
          <h3>Could not load data</h3>
          <p class="muted">Check that the server is running, then refresh.</p>
        </div>
      </article>
    `;
  }
}

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    elements.statsRow.innerHTML = `
      <div><strong>${stats.restaurants}</strong><span>restaurants</span></div>
      <div><strong>${stats.cuisines}</strong><span>cuisines</span></div>
      <div><strong>${stats.reviews}</strong><span>taste reviews</span></div>
    `;
  } catch (error) {
    // Keep static stats if API fails.
  }
}

async function submitReview(event) {
  event.preventDefault();
  elements.formStatus.textContent = 'Submitting...';

  const groupScores = {};
  elements.reviewScoreGrid.querySelectorAll('input[type="range"]').forEach((slider) => {
    groupScores[slider.dataset.reviewKey] = Number(slider.value);
  });

  const payload = {
    restaurantId: elements.reviewRestaurant.value,
    name: elements.reviewName.value,
    tasteGroup: elements.reviewGroup.value,
    rating: Number(elements.reviewRating.value),
    comment: elements.reviewComment.value,
    groupScores
  };

  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Review failed.');

    elements.formStatus.textContent = 'Review submitted. Scores updated.';
    elements.reviewComment.value = '';
    await loadRestaurants(true);
  } catch (error) {
    elements.formStatus.textContent = error.message;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function attachEvents() {
  elements.saveTasteButton.addEventListener('click', saveProfile);
  elements.searchInput.addEventListener('input', renderRestaurants);
  elements.cuisineFilter.addEventListener('change', renderRestaurants);
  elements.tagFilter.addEventListener('change', renderRestaurants);
  elements.refreshButton.addEventListener('click', () => loadRestaurants(true));
  elements.reviewRating.addEventListener('input', () => {
    elements.ratingValue.textContent = elements.reviewRating.value;
  });
  elements.reviewForm.addEventListener('submit', submitReview);
  elements.closeModal.addEventListener('click', () => elements.modal.close());
  elements.modal.addEventListener('close', () => {
    activeRestaurantId = null;
    document.body.classList.remove('modal-open');
  });
}

createSliders();
createReviewScoreInputs();
attachEvents();
loadRestaurants();
window.setInterval(() => loadRestaurants(false), 20000);
