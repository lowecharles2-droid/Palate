const defaultProfile = {
  authentic: 7,
  spice: 5,
  value: 8,
  aesthetic: 5,
  healthy: 4,
  hidden: 8
};

const labels = {
  authentic: 'Authentic',
  spice: 'Spicy',
  value: 'Budget/value',
  aesthetic: 'Aesthetic',
  healthy: 'Healthy',
  hidden: 'Hidden gems'
};

let profile = { ...defaultProfile };
let restaurants = [];
let reviews = [];

const slidersEl = document.querySelector('#sliders');
const restaurantsEl = document.querySelector('#restaurants');
const reviewsEl = document.querySelector('#reviews');
const statusEl = document.querySelector('#status');
const searchEl = document.querySelector('#search');
const resetEl = document.querySelector('#reset');
const reviewModal = document.querySelector('#reviewModal');
const openReview = document.querySelector('#openReview');
const closeReview = document.querySelector('#closeReview');
const reviewForm = document.querySelector('#reviewForm');
const reviewRestaurant = document.querySelector('#reviewRestaurant');
const reviewRating = document.querySelector('#reviewRating');
const ratingValue = document.querySelector('#ratingValue');

function setStatus(text) {
  statusEl.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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
  renderRestaurants();
  buildRestaurantOptions();
}

async function loadReviews() {
  const response = await fetch('/api/reviews');
  const data = await response.json();
  reviews = data.reviews || [];
  renderReviews();
}

function renderRestaurants() {
  const query = searchEl.value.trim().toLowerCase();
  const filtered = restaurants.filter(restaurant => {
    const haystack = [
      restaurant.name,
      restaurant.area,
      restaurant.cuisine,
      restaurant.summary,
      ...(restaurant.tags || [])
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  if (!filtered.length) {
    restaurantsEl.innerHTML = '<p class="muted">No restaurants match that search yet.</p>';
    return;
  }

  restaurantsEl.innerHTML = filtered.map(restaurant => `
    <article class="restaurant-card">
      <div class="restaurant-top">
        <div>
          <h3>${escapeHtml(restaurant.name)}</h3>
          <div class="meta">
            <span class="pill">${escapeHtml(restaurant.cuisine)}</span>
            <span class="pill">${escapeHtml(restaurant.area)}</span>
            <span class="pill">${escapeHtml(restaurant.price)}</span>
          </div>
        </div>
        <div class="match">${restaurant.matchScore}%</div>
      </div>
      <p>${escapeHtml(restaurant.summary)}</p>
      <div class="tags">
        ${(restaurant.tags || []).map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}
      </div>
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
    </article>
  `).join('');
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
resetEl.addEventListener('click', () => {
  profile = { ...defaultProfile };
  buildSliders();
  loadRestaurants();
});

openReview.addEventListener('click', () => reviewModal.showModal());
closeReview.addEventListener('click', () => reviewModal.close());
reviewRating.addEventListener('input', () => ratingValue.textContent = reviewRating.value);
reviewForm.addEventListener('submit', submitReview);

setInterval(() => refreshAll(false), 20000);
