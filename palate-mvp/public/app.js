const DEFAULT_PROFILE = {
  authentic: 8,
  spice: 5,
  value: 8,
  aesthetic: 5,
  healthy: 6,
  hidden: 6,
  protein: 7,
  vegetarian: 4
};

const PROFILE_LABELS = {
  authentic: 'Cuisine fidelity',
  spice: 'Spice',
  value: 'Value',
  aesthetic: 'Atmosphere',
  healthy: 'Health-focused',
  hidden: 'Local character',
  protein: 'Protein-friendly',
  vegetarian: 'Plant-friendly'
};

const COLLECTION_ORDER = [
  'All',
  'Saved',
  'Authenticity Picks',
  'Local & Independent',
  'Student Favorites',
  'High Protein',
  'Plant-Friendly',
  'Budget-Friendly',
  'Date Night'
];

const CATEGORY_PRIORITY = [
  'All', 'Near campus', 'High protein', 'Vegetarian options', 'Vegan options',
  'Halal options', 'Gluten-conscious options', 'Budget', 'Spicy', 'Healthy',
  'Family-owned', 'Local', 'Chain', 'Date night', 'Aesthetic', 'Group friendly',
  'Chinese', 'Taiwanese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai',
  'Mediterranean', 'Italian', 'American', 'Greek', 'Seafood', 'Ramen', 'Hot Pot',
  'Korean BBQ', 'Dumplings', 'Noodles', 'Poke', 'Burgers', 'Breakfast', 'Cafe', 'Dessert'
];

const STORAGE_KEYS = {
  profile: 'palate_profile_v1',
  saved: 'palate_saved_v1'
};

const elements = {
  sliders: document.querySelector('#sliders'),
  restaurants: document.querySelector('#restaurants'),
  status: document.querySelector('#status'),
  heroStatus: document.querySelector('#heroDatasetStatus'),
  heroCount: document.querySelector('#heroRestaurantCount'),
  keywordSearch: document.querySelector('#keywordSearch'),
  distanceLimit: document.querySelector('#distanceLimit'),
  collectionFilters: document.querySelector('#collectionFilters'),
  categoryFilters: document.querySelector('#categoryFilters'),
  activeFilters: document.querySelector('#activeFilters'),
  resultCount: document.querySelector('#resultCount'),
  resultsTitle: document.querySelector('#resultsTitle'),
  sortBy: document.querySelector('#sortBy'),
  resetFilters: document.querySelector('#resetFilters'),
  smartPrompt: document.querySelector('#smartPrompt'),
  smartExplanation: document.querySelector('#smartExplanation'),
  runSmartSearch: document.querySelector('#runSmartSearch'),
  heroPrompt: document.querySelector('#heroPrompt'),
  heroSearchForm: document.querySelector('#heroSearchForm'),
  detailModal: document.querySelector('#detailModal'),
  detailName: document.querySelector('#detailName'),
  detailContent: document.querySelector('#detailContent'),
  closeDetail: document.querySelector('#closeDetail'),
  savedModal: document.querySelector('#savedModal'),
  savedContent: document.querySelector('#savedContent'),
  closeSaved: document.querySelector('#closeSaved'),
  savedNav: document.querySelector('#savedNav'),
  savedNavCount: document.querySelector('#savedNavCount'),
  toast: document.querySelector('#toast')
};

let profile = loadObject(STORAGE_KEYS.profile, DEFAULT_PROFILE);
let savedIds = new Set(loadArray(STORAGE_KEYS.saved));
let restaurants = [];
let meta = {};
let selectedCollection = 'All';
let selectedCategory = 'All';
let smartCategories = [];
let smartPromptText = '';
let fetchController = null;
let sliderTimer = null;
let toastTimer = null;

function loadObject(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { ...fallback, ...parsed } : { ...fallback };
  } catch {
    return { ...fallback };
  }
}

function loadArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed.filter(value => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify([...savedIds]));
  } catch {
    // The app still works when browser storage is unavailable; preferences simply will not persist.
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

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function humanDate(value) {
  if (!value) return 'recently';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2200);
}

function setLoading(isLoading) {
  if (isLoading) {
    elements.status.textContent = 'Updating matches…';
    elements.status.setAttribute('aria-busy', 'true');
  } else {
    elements.status.removeAttribute('aria-busy');
  }
}

function buildSliders() {
  elements.sliders.innerHTML = Object.entries(PROFILE_LABELS).map(([key, label]) => `
    <div class="slider-row">
      <label class="slider-label" for="profile-${key}">
        <span>${escapeHtml(label)}</span>
        <output id="profile-output-${key}">${Number(profile[key])}</output>
      </label>
      <input id="profile-${key}" type="range" min="1" max="10" value="${Number(profile[key])}" data-profile-key="${key}" />
    </div>
  `).join('');

  elements.sliders.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', event => {
      const key = event.target.dataset.profileKey;
      profile[key] = Number(event.target.value);
      document.querySelector(`#profile-output-${key}`).value = profile[key];
      persistState();
      clearTimeout(sliderTimer);
      sliderTimer = setTimeout(loadRestaurants, 140);
    });
  });
}

async function loadRestaurants() {
  if (fetchController) fetchController.abort();
  fetchController = new AbortController();
  setLoading(true);

  try {
    const response = await fetch(`/api/restaurants?profile=${encodeURIComponent(JSON.stringify(profile))}`, {
      signal: fetchController.signal
    });
    if (!response.ok) throw new Error('Restaurant directory unavailable');

    const data = await response.json();
    restaurants = Array.isArray(data.restaurants) ? data.restaurants : [];
    meta = data.meta || {};

    renderCollectionFilters();
    renderCategoryFilters();
    renderRestaurants();
    updateSavedCount();

    const verifiedDate = humanDate(meta.verifiedThrough);
    elements.status.textContent = `${restaurants.length} restaurants · checked through ${verifiedDate}`;
    elements.heroStatus.textContent = `Directory checked through ${verifiedDate}`;
    elements.heroCount.textContent = restaurants.length;
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error(error);
    elements.status.textContent = 'Directory unavailable';
    elements.heroStatus.textContent = 'Unable to load directory';
    elements.restaurants.innerHTML = `
      <div class="error-state">
        <h3>We could not load restaurants.</h3>
        <p>Check your connection and try again.</p>
        <button type="button" class="button secondary" id="retryLoad">Try again</button>
      </div>`;
    document.querySelector('#retryLoad')?.addEventListener('click', loadRestaurants);
  } finally {
    setLoading(false);
  }
}

function getCategoryList() {
  const available = new Set(restaurants.flatMap(restaurant => restaurant.categories || []));
  const ordered = CATEGORY_PRIORITY.filter(category => category === 'All' || available.has(category));
  const extras = [...available].filter(category => !ordered.includes(category)).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...extras];
}

function renderCollectionFilters() {
  const available = new Set(restaurants.flatMap(restaurant => restaurant.collections || []));
  const collections = COLLECTION_ORDER.filter(collection => ['All', 'Saved'].includes(collection) || available.has(collection));
  if (!collections.includes(selectedCollection)) selectedCollection = 'All';

  elements.collectionFilters.innerHTML = collections.map(collection => {
    const count = collection === 'All'
      ? restaurants.length
      : collection === 'Saved'
        ? savedIds.size
        : restaurants.filter(restaurant => (restaurant.collections || []).includes(collection)).length;
    return `<button type="button" class="filter-chip ${selectedCollection === collection ? 'active' : ''}" data-collection="${escapeHtml(collection)}">${escapeHtml(collection)} <span>${count}</span></button>`;
  }).join('');

  elements.collectionFilters.querySelectorAll('[data-collection]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCollection = button.dataset.collection;
      renderCollectionFilters();
      renderRestaurants();
    });
  });
}

function renderCategoryFilters() {
  const categories = getCategoryList();
  if (!categories.includes(selectedCategory)) selectedCategory = 'All';

  elements.categoryFilters.innerHTML = categories.map(category => `
    <button type="button" class="filter-chip ${selectedCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join('');

  elements.categoryFilters.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategoryFilters();
      renderRestaurants();
    });
  });
}

function parseSmartSearch(promptValue) {
  const prompt = String(promptValue || '').trim().toLowerCase();
  smartPromptText = prompt;
  smartCategories = [];

  if (!prompt) {
    elements.smartExplanation.textContent = 'Describe a cuisine, dietary preference, atmosphere, value, or distance.';
    renderRestaurants();
    return;
  }

  const explanations = [];
  const categoryRules = [
    [['high protein', 'protein', 'gym'], 'High protein'],
    [['vegetarian', 'veggie'], 'Vegetarian options'],
    [['vegan', 'plant based', 'plant-based'], 'Vegan options'],
    [['halal'], 'Halal options'],
    [['gluten free', 'gluten-free', 'gluten'], 'Gluten-conscious options'],
    [['spicy', 'heat'], 'Spicy'],
    [['healthy', 'health'], 'Healthy'],
    [['family owned', 'family-owned'], 'Family-owned'],
    [['local', 'independent', 'hidden gem'], 'Local'],
    [['date night', 'romantic'], 'Date night'],
    [['aesthetic', 'instagram'], 'Aesthetic'],
    [['group', 'friends'], 'Group friendly'],
    [['ramen'], 'Ramen'],
    [['hot pot'], 'Hot Pot'],
    [['korean bbq', 'kbbq'], 'Korean BBQ'],
    [['poke'], 'Poke'],
    [['breakfast', 'brunch'], 'Breakfast'],
    [['dessert', 'sweet'], 'Dessert']
  ];

  for (const [terms, category] of categoryRules) {
    if (terms.some(term => prompt.includes(term))) smartCategories.push(category);
  }

  if (smartCategories.length) explanations.push(...smartCategories);

  if (prompt.includes('authentic') || prompt.includes('traditional')) {
    profile.authentic = 10;
    explanations.push('higher cuisine fidelity');
  }
  if (prompt.includes('cheap') || prompt.includes('budget') || prompt.includes('affordable') || /under\s*\$?\d+/.test(prompt)) {
    profile.value = 10;
    if (!smartCategories.includes('Budget')) smartCategories.push('Budget');
    explanations.push('budget-friendly');
  }

  const mileMatch = prompt.match(/(?:within|under|less than)?\s*(\d{1,2})\s*(?:mile|miles|mi)\b/);
  if (mileMatch) {
    const requested = Number(mileMatch[1]);
    const options = [1, 3, 5, 8, 12, 15];
    const selected = options.find(option => option >= requested) || 15;
    elements.distanceLimit.value = String(selected);
    explanations.push(`within about ${selected} miles`);
  } else if (prompt.includes('near') || prompt.includes('campus') || prompt.includes('ucsd')) {
    elements.distanceLimit.value = '3';
    explanations.push('near UCSD');
  }

  const cuisines = [
    'chinese', 'taiwanese', 'indian', 'japanese', 'korean', 'mexican', 'thai',
    'mediterranean', 'italian', 'american', 'greek', 'seafood', 'burger',
    'dumpling', 'noodle', 'sushi', 'pizza', 'vietnamese', 'middle eastern'
  ];
  const cuisine = cuisines.find(term => prompt.includes(term));
  elements.keywordSearch.value = cuisine || '';
  if (cuisine) explanations.push(cuisine);

  smartCategories = [...new Set(smartCategories)];
  buildSliders();
  persistState();
  loadRestaurants();
  elements.smartExplanation.textContent = explanations.length
    ? `Searching for: ${[...new Set(explanations)].join(' · ')}.`
    : 'Searching the restaurant names, cuisines, dishes, and tags in your request.';
}

function matchesSmartCategories(restaurant) {
  if (!smartCategories.length) return true;
  const categories = restaurant.categories || [];
  return smartCategories.every(category => categories.includes(category));
}

function getFilteredRestaurants() {
  const query = elements.keywordSearch.value.trim().toLowerCase();
  const distanceLimit = Number(elements.distanceLimit.value || 999);

  const filtered = restaurants.filter(restaurant => {
    const haystack = [
      restaurant.name, restaurant.area, restaurant.cuisine, restaurant.summary,
      restaurant.recommendedDish, restaurant.authenticityReason,
      ...(restaurant.tags || []), ...(restaurant.categories || []), ...(restaurant.collections || [])
    ].join(' ').toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesDistance = Number(restaurant.distanceMiles ?? 999) <= distanceLimit;
    const matchesCategory = selectedCategory === 'All' || (restaurant.categories || []).includes(selectedCategory);
    const matchesCollection = selectedCollection === 'All'
      || (selectedCollection === 'Saved' ? savedIds.has(restaurant.id) : (restaurant.collections || []).includes(selectedCollection));

    return matchesQuery && matchesDistance && matchesCategory && matchesCollection && matchesSmartCategories(restaurant);
  });

  return sortRestaurants(filtered, elements.sortBy.value);
}

function sortRestaurants(list, sort) {
  const copy = [...list];
  if (sort === 'distance') return copy.sort((a, b) => Number(a.distanceMiles) - Number(b.distanceMiles) || b.matchScore - a.matchScore);
  if (sort === 'authenticity') return copy.sort((a, b) => Number(b.authenticityScore) - Number(a.authenticityScore) || b.matchScore - a.matchScore);
  if (sort === 'local') return copy.sort((a, b) => Number(b.localScore) - Number(a.localScore) || b.matchScore - a.matchScore);
  if (sort === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy.sort((a, b) => b.matchScore - a.matchScore || Number(a.distanceMiles) - Number(b.distanceMiles));
}

function getGroupLabel(restaurant) {
  const broadCategories = ['Chinese', 'Taiwanese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Mediterranean', 'Italian', 'American', 'Greek', 'Seafood', 'Healthy'];
  return broadCategories.find(category => (restaurant.categories || []).includes(category)) || restaurant.cuisine || 'Other';
}

function groupByCuisine(list) {
  const groups = new Map();
  list.forEach(restaurant => {
    const group = getGroupLabel(restaurant);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(restaurant);
  });
  return [...groups.entries()].sort((a, b) => {
    const highestA = Math.max(...a[1].map(item => item.matchScore || 0));
    const highestB = Math.max(...b[1].map(item => item.matchScore || 0));
    return highestB - highestA || a[0].localeCompare(b[0]);
  });
}

function restaurantCard(restaurant) {
  const isSaved = savedIds.has(restaurant.id);
  const signals = [
    `${restaurant.authenticityScore}/10 cuisine fidelity`,
    `${restaurant.localScore}/10 local`,
    ...(restaurant.tags || []).slice(0, 2)
  ];

  return `
    <article class="restaurant-card">
      <div class="card-top">
        <div>
          <div class="verified-line">✓ Source checked ${escapeHtml(humanDate(restaurant.lastVerified))}</div>
          <h3>${escapeHtml(restaurant.name)}</h3>
          <div class="card-meta">${escapeHtml(restaurant.cuisine)} · ${escapeHtml(restaurant.price)} · ~${Number(restaurant.distanceMiles || 0).toFixed(1)} mi</div>
        </div>
        <div class="match-score" title="Taste-profile match">${restaurant.matchScore}%</div>
      </div>
      <p class="restaurant-summary">${escapeHtml(restaurant.summary)}</p>
      <div class="signal-row">${signals.map(signal => `<span class="signal">${escapeHtml(signal)}</span>`).join('')}</div>
      <p class="dish"><strong>Try:</strong> ${escapeHtml(restaurant.recommendedDish || 'A house specialty')}</p>
      <div class="card-actions">
        <button type="button" class="button secondary details-button" data-id="${escapeHtml(restaurant.id)}">View details</button>
        <button type="button" class="save-button ${isSaved ? 'saved' : ''}" data-save-id="${escapeHtml(restaurant.id)}" aria-label="${isSaved ? 'Remove from saved restaurants' : 'Save restaurant'}" title="${isSaved ? 'Saved' : 'Save'}">${isSaved ? '♥' : '♡'}</button>
      </div>
    </article>`;
}

function renderActiveFilters() {
  const filters = [];
  if (selectedCollection !== 'All') filters.push({ label: selectedCollection, type: 'collection' });
  if (selectedCategory !== 'All') filters.push({ label: selectedCategory, type: 'category' });
  if (elements.keywordSearch.value.trim()) filters.push({ label: `“${elements.keywordSearch.value.trim()}”`, type: 'query' });
  if (Number(elements.distanceLimit.value) < 999) filters.push({ label: `Within ~${elements.distanceLimit.value} mi`, type: 'distance' });
  smartCategories.forEach(category => filters.push({ label: category, type: 'smart-category', value: category }));

  const unique = filters.filter((item, index, all) => all.findIndex(other => other.label === item.label) === index);
  elements.activeFilters.innerHTML = unique.map(item => `
    <button type="button" class="active-filter" data-filter-type="${item.type}" data-filter-value="${escapeHtml(item.value || '')}">${escapeHtml(item.label)} ×</button>
  `).join('');

  elements.activeFilters.querySelectorAll('[data-filter-type]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.filterType;
      if (type === 'collection') selectedCollection = 'All';
      if (type === 'category') selectedCategory = 'All';
      if (type === 'query') elements.keywordSearch.value = '';
      if (type === 'distance') elements.distanceLimit.value = '999';
      if (type === 'smart-category') smartCategories = smartCategories.filter(category => category !== button.dataset.filterValue);
      renderCollectionFilters();
      renderCategoryFilters();
      renderRestaurants();
    });
  });
}

function renderRestaurants() {
  const filtered = getFilteredRestaurants();
  const activeCount = restaurants.length;

  elements.resultsTitle.textContent = selectedCollection === 'Saved' ? 'Saved restaurants' : 'Recommended for you';
  elements.resultCount.textContent = `${filtered.length} of ${activeCount} restaurants`;
  renderActiveFilters();

  if (!filtered.length) {
    const savedEmpty = selectedCollection === 'Saved' && savedIds.size === 0;
    elements.restaurants.innerHTML = `
      <div class="empty-state">
        <h3>${savedEmpty ? 'You have not saved any restaurants yet.' : 'No restaurants match all of those filters.'}</h3>
        <p>${savedEmpty ? 'Tap the heart on a restaurant to build your list.' : 'Try removing one filter or increasing the distance.'}</p>
        <button type="button" class="button secondary" id="emptyReset">${savedEmpty ? 'Browse restaurants' : 'Clear filters'}</button>
      </div>`;
    document.querySelector('#emptyReset')?.addEventListener('click', resetFilters);
    return;
  }

  const topResults = filtered.slice(0, 8);
  const grouped = groupByCuisine(filtered);
  elements.restaurants.innerHTML = `
    <details class="restaurant-accordion" open>
      <summary><span>${selectedCollection === 'Saved' ? 'Your saved list' : 'Top results'}</span><em>${topResults.length} shown</em></summary>
      <div class="restaurant-grid">${topResults.map(restaurantCard).join('')}</div>
    </details>
    ${filtered.length > topResults.length ? `
      <details class="restaurant-accordion">
        <summary><span>Browse all by cuisine</span><em>${filtered.length} total</em></summary>
        <div class="cuisine-list">
          ${grouped.map(([group, items]) => `
            <details class="cuisine-accordion">
              <summary><span>${escapeHtml(group)}</span><em>${items.length} ${items.length === 1 ? 'place' : 'places'}</em></summary>
              <div class="restaurant-grid">${items.map(restaurantCard).join('')}</div>
            </details>`).join('')}
        </div>
      </details>` : ''}`;

  attachRestaurantHandlers(elements.restaurants);
}

function attachRestaurantHandlers(root) {
  root.querySelectorAll('[data-save-id]').forEach(button => {
    button.addEventListener('click', () => toggleSaved(button.dataset.saveId));
  });
  root.querySelectorAll('.details-button').forEach(button => {
    button.addEventListener('click', () => openDetails(button.dataset.id));
  });
}

function toggleSaved(id) {
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return;

  if (savedIds.has(id)) {
    savedIds.delete(id);
    showToast(`${restaurant.name} removed from saved`);
  } else {
    savedIds.add(id);
    showToast(`${restaurant.name} saved`);
  }

  persistState();
  updateSavedCount();
  renderCollectionFilters();
  renderRestaurants();
  if (elements.savedModal.open) renderSavedModal();
}

function updateSavedCount() {
  elements.savedNavCount.textContent = savedIds.size;
}

function externalButton(url, label, primary = false) {
  const safe = safeUrl(url);
  if (!safe) return '';
  return `<a class="button ${primary ? 'primary' : 'secondary'} small" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function openDetails(id) {
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return;
  const isSaved = savedIds.has(id);

  elements.detailName.textContent = restaurant.name;
  elements.detailContent.innerHTML = `
    <section class="detail-hero">
      <div>
        <span class="verified-line">✓ Source checked ${escapeHtml(humanDate(restaurant.lastVerified))}</span>
        <h3>${escapeHtml(restaurant.cuisine)} · ${escapeHtml(restaurant.area)}</h3>
        <p>${escapeHtml(restaurant.summary)}</p>
        <div class="detail-actions">
          <button type="button" class="button ${isSaved ? 'primary' : 'secondary'} small" id="detailSave">${isSaved ? '♥ Saved' : '♡ Save'}</button>
          <button type="button" class="button secondary small" id="detailShare">Share</button>
        </div>
      </div>
      <div class="detail-score"><strong>${restaurant.matchScore}%</strong><span>your match</span></div>
    </section>
    <div class="detail-grid">
      <section class="detail-card">
        <h3>Plan your visit</h3>
        <p><strong>Distance:</strong> approximately ${Number(restaurant.distanceMiles || 0).toFixed(1)} miles from central UCSD</p>
        <p><strong>Price:</strong> ${escapeHtml(restaurant.price)}</p>
        <p><strong>Address:</strong> ${escapeHtml(restaurant.address)}</p>
        <p><strong>Hours:</strong> ${escapeHtml(restaurant.hours)}</p>
        ${restaurant.phone ? `<p><strong>Phone:</strong> ${escapeHtml(restaurant.phone)}</p>` : ''}
        <div class="detail-actions">
          ${externalButton(restaurant.website, 'Official website', true)}
          ${externalButton(restaurant.directions, 'Directions')}
          ${externalButton(restaurant.reservation, 'Reserve')}
          ${externalButton(restaurant.instagram, 'Instagram')}
        </div>
      </section>
      <section class="detail-card">
        <h3>Palate signals</h3>
        <p><strong>Cuisine fidelity:</strong> ${Number(restaurant.authenticityScore)}/10</p>
        <p><strong>Local/independent:</strong> ${Number(restaurant.localScore)}/10</p>
        <p>${escapeHtml(restaurant.authenticityReason)}</p>
        <p><strong>Suggested order:</strong> ${escapeHtml(restaurant.recommendedDish || 'A house specialty')}</p>
      </section>
      <section class="detail-card full">
        <h3>Why these filters apply</h3>
        <div class="signal-row">${(restaurant.categories || []).filter(category => category !== restaurant.area).map(category => `<span class="signal">${escapeHtml(category)}</span>`).join('')}</div>
        <ul class="evidence-list">${(restaurant.filterEvidence || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <p>Dietary tags indicate menu availability, not allergy safety or certification. Confirm ingredients and cross-contact directly with the restaurant.</p>
        <div class="detail-actions">${externalButton(restaurant.verificationSource, restaurant.verificationSourceLabel || 'View source')}</div>
      </section>
      <section class="detail-card full">
        <h3>Taste profile</h3>
        <div class="score-bars">
          ${Object.entries(PROFILE_LABELS).map(([key, label]) => {
            const score = Number(restaurant.tasteScores?.[key] || 5);
            return `<div class="score-line"><span>${escapeHtml(label)}</span><div class="bar"><span style="width:${score * 10}%"></span></div><strong>${score}</strong></div>`;
          }).join('')}
        </div>
      </section>
    </div>`;

  document.querySelector('#detailSave')?.addEventListener('click', () => {
    toggleSaved(id);
    openDetails(id);
  });
  document.querySelector('#detailShare')?.addEventListener('click', () => shareRestaurant(restaurant));
  if (!elements.detailModal.open) elements.detailModal.showModal();
}

async function shareRestaurant(restaurant) {
  const shareText = `${restaurant.name} — ${restaurant.cuisine}, about ${Number(restaurant.distanceMiles || 0).toFixed(1)} miles from UCSD. ${restaurant.website || restaurant.directions || ''}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: restaurant.name, text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast('Restaurant details copied');
    }
  } catch (error) {
    if (error.name !== 'AbortError') showToast('Could not share this restaurant');
  }
}

function renderSavedModal() {
  const savedRestaurants = restaurants.filter(restaurant => savedIds.has(restaurant.id));
  if (!savedRestaurants.length) {
    elements.savedContent.innerHTML = `
      <div class="empty-state">
        <h3>Your saved list is empty.</h3>
        <p>Save restaurants while browsing so you can compare them later.</p>
        <button type="button" class="button primary" id="savedBrowse">Browse restaurants</button>
      </div>`;
    document.querySelector('#savedBrowse')?.addEventListener('click', () => {
      elements.savedModal.close();
      document.querySelector('#discover').scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  elements.savedContent.innerHTML = `<div class="saved-list">${savedRestaurants.map(restaurant => `
    <article class="saved-item">
      <div>
        <h3>${escapeHtml(restaurant.name)}</h3>
        <p>${escapeHtml(restaurant.cuisine)} · ~${Number(restaurant.distanceMiles || 0).toFixed(1)} mi · ${restaurant.matchScore}% match</p>
      </div>
      <div class="saved-item-actions">
        <button type="button" class="button secondary small saved-view" data-id="${escapeHtml(restaurant.id)}">View</button>
        <button type="button" class="button secondary small saved-remove" data-id="${escapeHtml(restaurant.id)}">Remove</button>
      </div>
    </article>`).join('')}</div>`;

  elements.savedContent.querySelectorAll('.saved-view').forEach(button => {
    button.addEventListener('click', () => {
      elements.savedModal.close();
      openDetails(button.dataset.id);
    });
  });
  elements.savedContent.querySelectorAll('.saved-remove').forEach(button => {
    button.addEventListener('click', () => toggleSaved(button.dataset.id));
  });
}

function resetFilters() {
  profile = { ...DEFAULT_PROFILE };
  selectedCollection = 'All';
  selectedCategory = 'All';
  smartCategories = [];
  smartPromptText = '';
  elements.keywordSearch.value = '';
  elements.distanceLimit.value = '999';
  elements.smartPrompt.value = '';
  elements.heroPrompt.value = '';
  elements.smartExplanation.textContent = 'Try “vegan near campus,” “high protein,” or “authentic Mexican.”';
  elements.sortBy.value = 'match';
  persistState();
  buildSliders();
  loadRestaurants();
  showToast('Filters reset');
}

function openSaved() {
  renderSavedModal();
  elements.savedModal.showModal();
}

function initializeEvents() {
  elements.keywordSearch.addEventListener('input', renderRestaurants);
  elements.distanceLimit.addEventListener('change', renderRestaurants);
  elements.sortBy.addEventListener('change', renderRestaurants);
  elements.resetFilters.addEventListener('click', resetFilters);
  elements.runSmartSearch.addEventListener('click', () => parseSmartSearch(elements.smartPrompt.value));
  elements.smartPrompt.addEventListener('keydown', event => {
    if (event.key === 'Enter') parseSmartSearch(elements.smartPrompt.value);
  });
  elements.heroSearchForm.addEventListener('submit', event => {
    event.preventDefault();
    elements.smartPrompt.value = elements.heroPrompt.value;
    parseSmartSearch(elements.heroPrompt.value);
    document.querySelector('#discover').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', () => {
      const prompt = button.dataset.prompt;
      elements.heroPrompt.value = prompt;
      elements.smartPrompt.value = prompt;
      parseSmartSearch(prompt);
      document.querySelector('#discover').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.closeDetail.addEventListener('click', () => elements.detailModal.close());
  elements.closeSaved.addEventListener('click', () => elements.savedModal.close());
  elements.savedNav.addEventListener('click', openSaved);

  [elements.detailModal, elements.savedModal].forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) modal.close();
    });
  });
}

buildSliders();
updateSavedCount();
initializeEvents();
loadRestaurants();
