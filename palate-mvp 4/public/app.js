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

const DEFAULT_PREFS = {
  cuisines: [],
  dietary: [],
  budget: 'any',
  priority: 'authentic'
};

const DEFAULT_LOCATION = {
  key: 'ucsd',
  label: 'UCSD',
  lat: 32.8801,
  lng: -117.2340,
  source: 'preset'
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
  'All', 'Saved', 'Authenticity Picks', 'Local & Independent', 'Student Favorites',
  'High Protein', 'Plant-Friendly', 'Budget-Friendly', 'Date Night'
];

const CATEGORY_PRIORITY = [
  'All', 'Near campus', 'High protein', 'Vegetarian options', 'Vegan options',
  'Halal options', 'Gluten-conscious options', 'Budget', 'Spicy', 'Healthy',
  'Family-owned', 'Local', 'Chain', 'Date night', 'Aesthetic', 'Group friendly',
  'Chinese', 'Taiwanese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Vietnamese',
  'Mediterranean', 'Middle Eastern', 'Lebanese', 'Italian', 'American', 'Greek', 'Hawaiian', 'Seafood',
  'Ramen', 'Hot Pot', 'Korean BBQ', 'Barbecue', 'Dumplings', 'Noodles', 'Poke', 'Burgers',
  'Pizza', 'Breakfast', 'Cafe', 'Dessert'
];

const PRICE_LEVEL = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };

const LOCATION_PRESETS = {
  ucsd: { key: 'ucsd', label: 'UCSD', lat: 32.8801, lng: -117.2340, source: 'preset' },
  utc: { key: 'utc', label: 'UTC / University City', lat: 32.8704, lng: -117.2112, source: 'preset' },
  'la-jolla': { key: 'la-jolla', label: 'La Jolla', lat: 32.8328, lng: -117.2713, source: 'preset' },
  convoy: { key: 'convoy', label: 'Convoy / Kearny Mesa', lat: 32.8194, lng: -117.1549, source: 'preset' },
  'carmel-valley': { key: 'carmel-valley', label: 'Carmel Valley / Del Mar', lat: 32.9500, lng: -117.2350, source: 'preset' },
  'pacific-beach': { key: 'pacific-beach', label: 'Pacific Beach', lat: 32.7978, lng: -117.2403, source: 'preset' },
  'north-park': { key: 'north-park', label: 'North Park', lat: 32.7470, lng: -117.1290, source: 'preset' },
  'mira-mesa': { key: 'mira-mesa', label: 'Mira Mesa', lat: 32.9157, lng: -117.1439, source: 'custom' },
  'sorrento-valley': { key: 'sorrento-valley', label: 'Sorrento Valley', lat: 32.8998, lng: -117.1920, source: 'custom' },
  'clairemont-mesa': { key: 'clairemont-mesa', label: 'Clairemont Mesa', lat: 32.8300, lng: -117.2050, source: 'custom' },
  'ocean-beach': { key: 'ocean-beach', label: 'Ocean Beach', lat: 32.7503, lng: -117.2519, source: 'custom' },
  'la-jolla-shores': { key: 'la-jolla-shores', label: 'La Jolla Shores', lat: 32.8570, lng: -117.2568, source: 'custom' },
  'del-mar': { key: 'del-mar', label: 'Del Mar', lat: 32.9595, lng: -117.2653, source: 'custom' }
};

const AREA_COORDS = {
  'UCSD Campus': [32.8801, -117.2340],
  'Westfield UTC': [32.8704, -117.2112],
  'University City': [32.8645, -117.2110],
  'La Jolla': [32.8328, -117.2713],
  'La Jolla Shores': [32.8570, -117.2568],
  'Convoy District': [32.8194, -117.1549],
  'Kearny Mesa': [32.8310, -117.1430],
  'Clairemont Mesa': [32.8300, -117.2050],
  'Mira Mesa': [32.9157, -117.1439],
  'Sorrento Valley': [32.8998, -117.1920],
  'One Paseo': [32.9540, -117.2340],
  'Del Mar Highlands': [32.9504, -117.2332],
  'Carmel Valley': [32.9390, -117.2330],
  'Pacific Beach': [32.7978, -117.2403],
  'North Park': [32.7470, -117.1290],
  'Ocean Beach': [32.7503, -117.2519]
};

const STORAGE_KEYS = {
  profile: 'palate_profile_v2',
  prefs: 'palate_prefs_v2',
  saved: 'palate_saved_v2',
  hidden: 'palate_hidden_v2',
  helpful: 'palate_helpful_v2',
  location: 'palate_location_v2',
  onboarding: 'palate_onboarding_complete_v3',
  group: 'palate_group_mode_v3',
  reports: 'palate_reports_v2',
  analytics: 'palate_analytics_v2'
};

const elements = {
  sliders: document.querySelector('#sliders'),
  restaurants: document.querySelector('#restaurants'),
  status: document.querySelector('#status'),
  heroStatus: document.querySelector('#heroDatasetStatus'),
  heroCount: document.querySelector('#heroRestaurantCount'),
  keywordSearch: document.querySelector('#keywordSearch'),
  distanceLimit: document.querySelector('#distanceLimit'),
  priceLimit: document.querySelector('#priceLimit'),
  locationSelect: document.querySelector('#locationSelect'),
  locationSummary: document.querySelector('#locationSummary'),
  changeLocation: document.querySelector('#changeLocation'),
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
  locationNav: document.querySelector('#locationNav'),
  groupNav: document.querySelector('#groupNav'),
  profileNav: document.querySelector('#profileNav'),
  personalizeHero: document.querySelector('#personalizeHero'),
  onboardingModal: document.querySelector('#onboardingModal'),
  onboardingForm: document.querySelector('#onboardingForm'),
  skipOnboarding: document.querySelector('#skipOnboarding'),
  onboardingLater: document.querySelector('#onboardingLater'),
  onboardingBudget: document.querySelector('#onboardingBudget'),
  onboardingPriority: document.querySelector('#onboardingPriority'),
  locationModal: document.querySelector('#locationModal'),
  locationForm: document.querySelector('#locationForm'),
  modalLocationSelect: document.querySelector('#modalLocationSelect'),
  customLocationWrap: document.querySelector('#customLocationWrap'),
  customLocationInput: document.querySelector('#customLocationInput'),
  closeLocation: document.querySelector('#closeLocation'),
  groupModal: document.querySelector('#groupModal'),
  groupForm: document.querySelector('#groupForm'),
  groupBudget: document.querySelector('#groupBudget'),
  groupDistance: document.querySelector('#groupDistance'),
  clearGroupMode: document.querySelector('#clearGroupMode'),
  closeGroup: document.querySelector('#closeGroup'),
  reportModal: document.querySelector('#reportModal'),
  reportForm: document.querySelector('#reportForm'),
  reportRestaurantId: document.querySelector('#reportRestaurantId'),
  reportRestaurantName: document.querySelector('#reportRestaurantName'),
  reportType: document.querySelector('#reportType'),
  reportNote: document.querySelector('#reportNote'),
  closeReport: document.querySelector('#closeReport'),
  toast: document.querySelector('#toast')
};

let profile = loadObject(STORAGE_KEYS.profile, DEFAULT_PROFILE);
let userPrefs = loadObject(STORAGE_KEYS.prefs, DEFAULT_PREFS);
let locationState = loadObject(STORAGE_KEYS.location, DEFAULT_LOCATION);
let savedIds = new Set(loadArray(STORAGE_KEYS.saved));
let hiddenIds = new Set(loadArray(STORAGE_KEYS.hidden));
let helpfulIds = new Set(loadArray(STORAGE_KEYS.helpful));
let reports = loadArray(STORAGE_KEYS.reports);
let analyticsEvents = loadArray(STORAGE_KEYS.analytics);
let restaurants = [];
let meta = {};
let selectedCollection = 'All';
let selectedCategory = 'All';
let groupMode = loadObject(STORAGE_KEYS.group, { active: false, cuisines: [], dietary: [], budget: 'any', distance: 999 });
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage may be blocked. */ }
}

function on(element, eventName, handler, options) {
  if (element && typeof element.addEventListener === 'function') {
    element.addEventListener(eventName, handler, options);
  }
}

function syncModalState() {
  const anyOpen = [...document.querySelectorAll('.modal')].some(modal => modal.open || modal.classList.contains('modal-fallback-open'));
  document.body.classList.toggle('modal-open', anyOpen);
  if (!anyOpen) document.querySelector('.modal-fallback-overlay')?.remove();
}

function closeModal(modal) {
  if (!modal) return;
  try {
    if (typeof modal.close === 'function' && modal.open) modal.close();
  } catch { /* Fall through to attribute cleanup. */ }
  modal.removeAttribute('open');
  modal.classList.remove('modal-fallback-open');
  syncModalState();
}

function openModal(modal) {
  if (!modal) return false;
  document.querySelectorAll('.modal').forEach(other => {
    if (other !== modal && (other.open || other.classList.contains('modal-fallback-open'))) closeModal(other);
  });
  if (modal.open || modal.classList.contains('modal-fallback-open')) return true;
  try {
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      throw new Error('Dialog API unavailable');
    }
  } catch {
    modal.setAttribute('open', '');
    modal.classList.add('modal-fallback-open');
    if (!document.querySelector('.modal-fallback-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'modal-fallback-overlay';
      overlay.addEventListener('click', () => closeModal(modal));
      document.body.appendChild(overlay);
    }
  }
  document.body.classList.add('modal-open');
  const focusTarget = modal.querySelector('input:not([type="hidden"]), select, button');
  setTimeout(() => focusTarget?.focus({ preventScroll: true }), 0);
  return true;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* Use fallback. */ }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(userPrefs));
    localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(locationState));
    localStorage.setItem(STORAGE_KEYS.group, JSON.stringify(groupMode));
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify([...savedIds]));
    localStorage.setItem(STORAGE_KEYS.hidden, JSON.stringify([...hiddenIds]));
    localStorage.setItem(STORAGE_KEYS.helpful, JSON.stringify([...helpfulIds]));
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports.slice(-100)));
    localStorage.setItem(STORAGE_KEYS.analytics, JSON.stringify(analyticsEvents.slice(-250)));
  } catch {
    // Palate remains usable if browser storage is unavailable.
  }
}

function track(event, data = {}) {
  analyticsEvents.push({ event, data, at: new Date().toISOString() });
  if (analyticsEvents.length > 250) analyticsEvents = analyticsEvents.slice(-250);
  persistState();
}

window.PalateAnalytics = {
  summary() {
    return analyticsEvents.reduce((out, item) => {
      out[item.event] = (out[item.event] || 0) + 1;
      return out;
    }, {});
  },
  events() { return [...analyticsEvents]; },
  reports() { return [...reports]; }
};

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
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  toastTimer = setTimeout(() => elements.toast?.classList.remove('show'), 2400);
}

function setLoading(isLoading) {
  if (isLoading) {
    if (!elements.status) return;
    elements.status.textContent = 'Updating matches…';
    elements.status.setAttribute('aria-busy', 'true');
  } else {
    elements.status?.removeAttribute('aria-busy');
  }
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const toRad = value => value * Math.PI / 180;
  const radius = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function restaurantDistance(restaurant) {
  if (locationState.key === 'ucsd' && locationState.source !== 'current') return Number(restaurant.distanceMiles ?? 999);
  const coords = AREA_COORDS[restaurant.area];
  if (!coords || !Number.isFinite(Number(locationState.lat)) || !Number.isFinite(Number(locationState.lng))) {
    return Number(restaurant.distanceMiles ?? 999);
  }
  return haversineMiles(Number(locationState.lat), Number(locationState.lng), coords[0], coords[1]);
}

function withDisplayDistance(restaurant) {
  return { ...restaurant, distanceMiles: restaurantDistance(restaurant) };
}

function priceMatches(price, limit) {
  if (!limit || limit === 'any') return true;
  return (PRICE_LEVEL[price] || 99) <= (PRICE_LEVEL[limit] || 99);
}

function selectedCheckboxValues(containerSelector) {
  return [...document.querySelectorAll(`${containerSelector} input[type="checkbox"]:checked`)].map(input => input.value);
}

function preferenceBonus(restaurant) {
  let bonus = 0;
  const categories = new Set(restaurant.categories || []);
  if (userPrefs.cuisines.some(cuisine => categories.has(cuisine))) bonus += 5;
  for (const dietary of userPrefs.dietary) {
    if (categories.has(dietary)) bonus += 2;
  }
  if (priceMatches(restaurant.price, userPrefs.budget)) bonus += 2;
  if (helpfulIds.has(restaurant.id)) bonus += 5;
  return bonus;
}

function adjustedRestaurant(restaurant) {
  const distanceRestaurant = withDisplayDistance(restaurant);
  return {
    ...distanceRestaurant,
    matchScore: Math.min(99, Math.round(Number(distanceRestaurant.matchScore || 0) + preferenceBonus(distanceRestaurant)))
  };
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
    const response = await fetch(`/api/restaurants?profile=${encodeURIComponent(JSON.stringify(profile))}`, { signal: fetchController.signal });
    if (!response.ok) throw new Error('Restaurant directory unavailable');
    const data = await response.json();
    restaurants = Array.isArray(data.restaurants) ? data.restaurants : [];
    meta = data.meta || {};
    renderCollectionFilters();
    renderCategoryFilters();
    renderRestaurants();
    updateSavedCount();
    updateLocationUI();

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
      <div class="error-state"><h3>We could not load restaurants.</h3><p>Check your connection and try again.</p><button type="button" class="button secondary" id="retryLoad">Try again</button></div>`;
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
    const count = collection === 'All' ? restaurants.length : collection === 'Saved' ? savedIds.size : restaurants.filter(r => (r.collections || []).includes(collection)).length;
    return `<button type="button" class="filter-chip ${selectedCollection === collection ? 'active' : ''}" data-collection="${escapeHtml(collection)}">${escapeHtml(collection)} <span>${count}</span></button>`;
  }).join('');

  elements.collectionFilters.querySelectorAll('[data-collection]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCollection = button.dataset.collection;
      renderCollectionFilters();
      renderRestaurants();
      track('filter_collection', { collection: selectedCollection });
    });
  });
}

function renderCategoryFilters() {
  const categories = getCategoryList();
  if (!categories.includes(selectedCategory)) selectedCategory = 'All';
  elements.categoryFilters.innerHTML = categories.map(category => `<button type="button" class="filter-chip ${selectedCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  elements.categoryFilters.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategoryFilters();
      renderRestaurants();
      track('filter_category', { category: selectedCategory });
    });
  });
}

function parseSmartSearch(promptValue) {
  const prompt = String(promptValue || '').trim();
  if (!prompt) {
    elements.keywordSearch.value = '';
    elements.smartExplanation.textContent = 'Describe a cuisine, dietary preference, atmosphere, value, or distance.';
    renderRestaurants();
    return;
  }

  const intent = PalateSearch.parseSearchIntent(prompt);
  if (intent.authentic) profile.authentic = 10;
  if (intent.local || intent.hiddenGem) profile.hidden = 10;
  if (intent.budget) profile.value = 10;
  if (intent.categories.includes('High protein')) profile.protein = 10;
  if (intent.categories.includes('Vegetarian options') || intent.categories.includes('Vegan options')) profile.vegetarian = 10;
  if (intent.categories.includes('Spicy')) profile.spice = 10;
  if (intent.categories.includes('Healthy')) profile.healthy = 10;
  if (intent.categories.includes('Date night') || intent.categories.includes('Aesthetic')) profile.aesthetic = 10;
  if (intent.maxDistance != null) {
    const options = [1, 3, 5, 8, 12, 15];
    elements.distanceLimit.value = String(options.find(option => option >= intent.maxDistance) || 15);
  }

  elements.keywordSearch.value = prompt;
  buildSliders();
  persistState();
  loadRestaurants();
  const explanation = PalateSearch.describeIntent(intent);
  elements.smartExplanation.textContent = explanation.length ? `Searching for: ${explanation.join(' · ')}.` : 'Searching restaurant names, cuisines, dishes, and verified tags.';
  track('search', { prompt, intent: explanation });
}

function applyGroupFilters(list) {
  if (!groupMode.active) return list;
  return list.filter(restaurant => {
    const categories = new Set(restaurant.categories || []);
    const cuisineMatch = !groupMode.cuisines.length || groupMode.cuisines.some(cuisine => categories.has(cuisine));
    const dietaryMatch = groupMode.dietary.every(dietary => categories.has(dietary));
    const budgetMatch = priceMatches(restaurant.price, groupMode.budget);
    const distanceMatch = Number(restaurant.distanceMiles) <= Number(groupMode.distance);
    return cuisineMatch && dietaryMatch && budgetMatch && distanceMatch;
  });
}

function getFilteredRestaurants() {
  const query = elements.keywordSearch.value.trim();
  const distanceLimit = Number(elements.distanceLimit.value || 999);
  const priceLimit = elements.priceLimit.value || 'any';
  let filtered = restaurants.map(adjustedRestaurant).filter(restaurant => {
    if (hiddenIds.has(restaurant.id)) return false;
    const matchesDistance = Number(restaurant.distanceMiles ?? 999) <= distanceLimit;
    const matchesPrice = priceMatches(restaurant.price, priceLimit);
    const matchesCategory = selectedCategory === 'All' || (restaurant.categories || []).includes(selectedCategory);
    const matchesCollection = selectedCollection === 'All' || (selectedCollection === 'Saved' ? savedIds.has(restaurant.id) : (restaurant.collections || []).includes(selectedCollection));
    return matchesDistance && matchesPrice && matchesCategory && matchesCollection;
  });

  filtered = applyGroupFilters(filtered);
  if (query) filtered = PalateSearch.filterAndRank(filtered, query);
  return sortRestaurants(filtered, elements.sortBy.value, Boolean(query));
}

function sortRestaurants(list, sort, hasSearch = false) {
  const copy = [...list];
  if (sort === 'distance') return copy.sort((a, b) => Number(a.distanceMiles) - Number(b.distanceMiles) || Number(b.searchScore || b.matchScore) - Number(a.searchScore || a.matchScore));
  if (sort === 'authenticity') return copy.sort((a, b) => Number(b.authenticityScore) - Number(a.authenticityScore) || Number(b.matchScore) - Number(a.matchScore));
  if (sort === 'local') return copy.sort((a, b) => Number(b.localScore) - Number(a.localScore) || Number(b.matchScore) - Number(a.matchScore));
  if (sort === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (hasSearch) return copy.sort((a, b) => Number(b.searchScore || 0) - Number(a.searchScore || 0) || Number(b.matchScore || 0) - Number(a.matchScore || 0) || Number(a.distanceMiles) - Number(b.distanceMiles));
  return copy.sort((a, b) => Number(b.matchScore) - Number(a.matchScore) || Number(a.distanceMiles) - Number(b.distanceMiles));
}

function getGroupLabel(restaurant) {
  const broad = ['Chinese', 'Taiwanese', 'Indian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Vietnamese', 'Mediterranean', 'Middle Eastern', 'Italian', 'American', 'Greek', 'Hawaiian', 'Seafood', 'Healthy'];
  return broad.find(category => (restaurant.categories || []).includes(category)) || restaurant.cuisine || 'Other';
}

function groupByCuisine(list) {
  const groups = new Map();
  list.forEach(restaurant => {
    const group = getGroupLabel(restaurant);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(restaurant);
  });
  return [...groups.entries()].sort((a, b) => Math.max(...b[1].map(item => item.matchScore || 0)) - Math.max(...a[1].map(item => item.matchScore || 0)) || a[0].localeCompare(b[0]));
}

function getRecommendationReasons(restaurant) {
  const reasons = [];
  const categories = new Set(restaurant.categories || []);
  const query = elements.keywordSearch.value.trim();
  if (query) {
    const intent = PalateSearch.parseSearchIntent(query);
    if (intent.cuisine && PalateSearch.cuisineMatchStrength(restaurant, intent.cuisine) > 0) reasons.push(`matches your ${intent.cuisine} search`);
    if (intent.authentic && Number(restaurant.authenticityScore) >= 8) reasons.push(`${restaurant.authenticityScore}/10 cuisine fidelity`);
    for (const category of intent.categories) if (categories.has(category)) reasons.push(category.toLowerCase());
  }
  if (userPrefs.cuisines.some(cuisine => categories.has(cuisine))) reasons.push('one of your favorite cuisines');
  if (userPrefs.dietary.some(dietary => categories.has(dietary))) reasons.push('fits your dietary preferences');
  const profileRank = Object.entries(profile).sort((a, b) => b[1] - a[1]).map(([key]) => key);
  for (const key of profileRank) {
    if (Number(restaurant.tasteScores?.[key] || 0) >= 8) {
      const labels = { authentic: 'strong cuisine fidelity', spice: 'plenty of heat', value: 'strong value', aesthetic: 'good atmosphere', healthy: 'health-focused options', hidden: 'local character', protein: 'protein-friendly', vegetarian: 'plant-friendly' };
      reasons.push(labels[key]);
    }
    if (reasons.length >= 3) break;
  }
  if (restaurantDistance(restaurant) <= 3) reasons.push(`about ${restaurantDistance(restaurant).toFixed(1)} miles away`);
  return [...new Set(reasons)].slice(0, 3);
}

function restaurantCard(restaurant) {
  const isSaved = savedIds.has(restaurant.id);
  const isHelpful = helpfulIds.has(restaurant.id);
  const reasons = getRecommendationReasons(restaurant);
  return `
    <article class="restaurant-card">
      <div class="card-top">
        <div><div class="verified-line">✓ Source checked ${escapeHtml(humanDate(restaurant.lastVerified))}</div><h3>${escapeHtml(restaurant.name)}</h3><div class="card-meta">${escapeHtml(restaurant.cuisine)} · ${escapeHtml(restaurant.price)} · ~${Number(restaurant.distanceMiles || 0).toFixed(1)} mi</div></div>
        <div class="match-score" title="Taste-profile match">${restaurant.matchScore}%</div>
      </div>
      <p class="restaurant-summary">${escapeHtml(restaurant.summary)}</p>
      <div class="why-match"><strong>Why it matches:</strong> ${reasons.length ? reasons.map(escapeHtml).join(' · ') : 'strong overall fit for your current preferences'}</div>
      <div class="signal-row"><span class="signal">${restaurant.authenticityScore}/10 cuisine fidelity</span><span class="signal">${restaurant.localScore}/10 local</span>${(restaurant.tags || []).slice(0, 2).map(tag => `<span class="signal">${escapeHtml(tag)}</span>`).join('')}</div>
      <p class="dish"><strong>Try:</strong> ${escapeHtml(restaurant.recommendedDish || 'A house specialty')}</p>
      <div class="recommendation-feedback" aria-label="Recommendation feedback">
        <span>Good recommendation?</span>
        <button type="button" class="feedback-button ${isHelpful ? 'active' : ''}" data-helpful-id="${escapeHtml(restaurant.id)}">${isHelpful ? '✓ Helpful' : 'Helpful'}</button>
        <button type="button" class="feedback-button" data-hide-id="${escapeHtml(restaurant.id)}">Not for me</button>
      </div>
      <div class="card-actions"><button type="button" class="button secondary details-button" data-id="${escapeHtml(restaurant.id)}">View details</button><button type="button" class="save-button ${isSaved ? 'saved' : ''}" data-save-id="${escapeHtml(restaurant.id)}" aria-label="${isSaved ? 'Remove from saved restaurants' : 'Save restaurant'}">${isSaved ? '♥' : '♡'}</button></div>
    </article>`;
}

function renderActiveFilters() {
  const filters = [];
  if (selectedCollection !== 'All') filters.push({ label: selectedCollection, type: 'collection' });
  if (selectedCategory !== 'All') filters.push({ label: selectedCategory, type: 'category' });
  if (elements.keywordSearch.value.trim()) filters.push({ label: `“${elements.keywordSearch.value.trim()}”`, type: 'query' });
  if (Number(elements.distanceLimit.value) < 999) filters.push({ label: `Within ~${elements.distanceLimit.value} mi`, type: 'distance' });
  if (elements.priceLimit.value !== 'any') filters.push({ label: `${elements.priceLimit.value} or less`, type: 'price' });
  filters.push({ label: `From ${locationState.label}`, type: 'location' });
  if (groupMode.active) filters.push({ label: 'Group mode', type: 'group' });
  if (hiddenIds.size) filters.push({ label: `${hiddenIds.size} hidden`, type: 'hidden' });

  elements.activeFilters.innerHTML = filters.map(item => `<button type="button" class="active-filter" data-filter-type="${item.type}">${escapeHtml(item.label)} ${['location'].includes(item.type) ? '' : '×'}</button>`).join('');
  elements.activeFilters.querySelectorAll('[data-filter-type]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.filterType;
      if (type === 'collection') selectedCollection = 'All';
      if (type === 'category') selectedCategory = 'All';
      if (type === 'query') elements.keywordSearch.value = '';
      if (type === 'distance') elements.distanceLimit.value = '999';
      if (type === 'price') elements.priceLimit.value = 'any';
      if (type === 'location') return openLocation();
      if (type === 'group') { groupMode = { active: false, cuisines: [], dietary: [], budget: 'any', distance: 999 }; updateGroupUI(); track('group_mode_clear'); }
      if (type === 'hidden') hiddenIds.clear();
      persistState();
      renderCollectionFilters();
      renderCategoryFilters();
      renderRestaurants();
    });
  });
}

function relaxedAlternatives() {
  const query = elements.keywordSearch.value.trim().toLowerCase();
  const tokens = query.split(/\s+/).filter(token => token.length > 2);
  return restaurants.map(adjustedRestaurant).filter(r => !hiddenIds.has(r.id)).map(restaurant => {
    const text = [restaurant.name, restaurant.cuisine, ...(restaurant.categories || []), ...(restaurant.tags || [])].join(' ').toLowerCase();
    let score = Number(restaurant.matchScore || 0);
    if (selectedCategory !== 'All' && (restaurant.categories || []).includes(selectedCategory)) score += 30;
    if (selectedCollection !== 'All' && (restaurant.collections || []).includes(selectedCollection)) score += 20;
    score += tokens.filter(token => text.includes(token)).length * 18;
    score += Math.max(0, 12 - Number(restaurant.distanceMiles || 0));
    return { ...restaurant, relaxedScore: score };
  }).sort((a, b) => b.relaxedScore - a.relaxedScore).slice(0, 4);
}

function renderRestaurants() {
  const filtered = getFilteredRestaurants();
  elements.resultsTitle.textContent = groupMode.active ? 'Best options for your group' : selectedCollection === 'Saved' ? 'Saved restaurants' : 'Recommended for you';
  elements.resultCount.textContent = `${filtered.length} of ${restaurants.length} restaurants`;
  renderActiveFilters();

  if (!filtered.length) {
    const alternatives = relaxedAlternatives();
    elements.restaurants.innerHTML = `
      <div class="empty-state smart-empty"><h3>No exact matches.</h3><p>These are the closest options after relaxing one or more requirements.</p><div class="restaurant-grid relaxed-grid">${alternatives.map(restaurantCard).join('')}</div><div class="empty-actions"><button type="button" class="button primary" id="relaxFilters">Relax filters</button><button type="button" class="button secondary" id="emptyReset">Show everything</button></div></div>`;
    attachRestaurantHandlers(elements.restaurants);
    document.querySelector('#relaxFilters')?.addEventListener('click', () => {
      selectedCategory = 'All'; selectedCollection = 'All'; elements.distanceLimit.value = '999'; elements.priceLimit.value = 'any'; groupMode.active = false; persistState(); updateGroupUI(); renderRestaurants();
      track('relax_filters');
    });
    document.querySelector('#emptyReset')?.addEventListener('click', resetFilters);
    track('zero_results', { query: elements.keywordSearch.value });
    return;
  }

  const topResults = filtered.slice(0, 8);
  const grouped = groupByCuisine(filtered);
  elements.restaurants.innerHTML = `
    <details class="restaurant-accordion" open><summary><span>${selectedCollection === 'Saved' ? 'Your saved list' : 'Top results'}</span><em>${topResults.length} shown</em></summary><div class="restaurant-grid">${topResults.map(restaurantCard).join('')}</div></details>
    ${filtered.length > topResults.length ? `<details class="restaurant-accordion"><summary><span>Browse all by cuisine</span><em>${filtered.length} total</em></summary><div class="cuisine-list">${grouped.map(([group, items]) => `<details class="cuisine-accordion"><summary><span>${escapeHtml(group)}</span><em>${items.length} ${items.length === 1 ? 'place' : 'places'}</em></summary><div class="restaurant-grid">${items.map(restaurantCard).join('')}</div></details>`).join('')}</div></details>` : ''}`;
  attachRestaurantHandlers(elements.restaurants);
}

function attachRestaurantHandlers(root) {
  root.querySelectorAll('[data-save-id]').forEach(button => button.addEventListener('click', () => toggleSaved(button.dataset.saveId)));
  root.querySelectorAll('.details-button').forEach(button => button.addEventListener('click', () => openDetails(button.dataset.id)));
  root.querySelectorAll('[data-helpful-id]').forEach(button => button.addEventListener('click', () => markHelpful(button.dataset.helpfulId)));
  root.querySelectorAll('[data-hide-id]').forEach(button => button.addEventListener('click', () => hideRecommendation(button.dataset.hideId)));
}

function toggleSaved(id) {
  const restaurant = restaurants.find(item => item.id === id);
  if (!restaurant) return;
  if (savedIds.has(id)) { savedIds.delete(id); showToast(`${restaurant.name} removed from saved`); track('unsave', { id }); }
  else { savedIds.add(id); showToast(`${restaurant.name} saved`); track('save', { id }); }
  persistState(); updateSavedCount(); renderCollectionFilters(); renderRestaurants();
  if (elements.savedModal?.open || elements.savedModal?.classList.contains('modal-fallback-open')) renderSavedModal();
}

function markHelpful(id) {
  if (helpfulIds.has(id)) helpfulIds.delete(id); else helpfulIds.add(id);
  persistState(); renderRestaurants();
  showToast(helpfulIds.has(id) ? 'Thanks — recommendations will prioritize similar places' : 'Feedback removed');
  track('recommendation_helpful', { id, active: helpfulIds.has(id) });
}

function hideRecommendation(id) {
  hiddenIds.add(id);
  persistState(); renderRestaurants();
  showToast('Hidden. You can restore hidden places from the filter chip.');
  track('recommendation_not_for_me', { id });
}

function updateSavedCount() { elements.savedNavCount.textContent = savedIds.size; }

function externalButton(url, label, primary = false, eventName = '') {
  const safe = safeUrl(url);
  if (!safe) return '';
  return `<a class="button ${primary ? 'primary' : 'secondary'} small external-action" data-track-event="${escapeHtml(eventName)}" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function openDetails(id) {
  const raw = restaurants.find(item => item.id === id);
  if (!raw) return;
  const restaurant = adjustedRestaurant(raw);
  const isSaved = savedIds.has(id);
  const reasons = getRecommendationReasons(restaurant);
  elements.detailName.textContent = restaurant.name;
  elements.detailContent.innerHTML = `
    <section class="detail-hero"><div><span class="verified-line">✓ Source checked ${escapeHtml(humanDate(restaurant.lastVerified))}</span><h3>${escapeHtml(restaurant.cuisine)} · ${escapeHtml(restaurant.area)}</h3><p>${escapeHtml(restaurant.summary)}</p><p class="detail-reason"><strong>Recommended because:</strong> ${reasons.map(escapeHtml).join(' · ') || 'it fits your current taste profile'}</p><div class="detail-actions"><button type="button" class="button ${isSaved ? 'primary' : 'secondary'} small" id="detailSave">${isSaved ? '♥ Saved' : '♡ Save'}</button><button type="button" class="button secondary small" id="detailShare">Share</button><button type="button" class="button secondary small" id="detailReport">Report info</button></div></div><div class="detail-score"><strong>${restaurant.matchScore}%</strong><span>your match</span></div></section>
    <div class="detail-grid">
      <section class="detail-card"><h3>Plan your visit</h3><p><strong>Distance:</strong> approximately ${Number(restaurant.distanceMiles || 0).toFixed(1)} miles from ${escapeHtml(locationState.label)}</p><p><strong>Price:</strong> ${escapeHtml(restaurant.price)}</p><p><strong>Address:</strong> ${escapeHtml(restaurant.address)}</p><p><strong>Hours:</strong> ${escapeHtml(restaurant.hours)}</p>${restaurant.phone ? `<p><strong>Phone:</strong> ${escapeHtml(restaurant.phone)}</p>` : ''}<div class="detail-actions">${externalButton(restaurant.website, 'Official website', true, 'website_click')}${externalButton(restaurant.directions, 'Directions', false, 'directions_click')}${externalButton(restaurant.reservation, 'Reserve', false, 'reservation_click')}${externalButton(restaurant.instagram, 'Instagram', false, 'instagram_click')}</div></section>
      <section class="detail-card"><h3>Palate signals</h3><p><strong>Cuisine fidelity:</strong> ${Number(restaurant.authenticityScore)}/10</p><p><strong>Local/independent:</strong> ${Number(restaurant.localScore)}/10</p><p>${escapeHtml(restaurant.authenticityReason)}</p><p><strong>Suggested order:</strong> ${escapeHtml(restaurant.recommendedDish || 'A house specialty')}</p></section>
      <section class="detail-card full"><h3>Why these filters apply</h3><div class="signal-row">${(restaurant.categories || []).filter(category => category !== restaurant.area).map(category => `<span class="signal">${escapeHtml(category)}</span>`).join('')}</div><ul class="evidence-list">${(restaurant.filterEvidence || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><p>Dietary tags indicate menu availability, not allergy safety or certification. Confirm ingredients and cross-contact directly with the restaurant.</p><div class="detail-actions">${externalButton(restaurant.verificationSource, restaurant.verificationSourceLabel || 'View source', false, 'source_click')}</div></section>
      <section class="detail-card full"><h3>Taste profile</h3><div class="score-bars">${Object.entries(PROFILE_LABELS).map(([key, label]) => { const score = Number(restaurant.tasteScores?.[key] || 5); return `<div class="score-line"><span>${escapeHtml(label)}</span><div class="bar"><span style="width:${score * 10}%"></span></div><strong>${score}</strong></div>`; }).join('')}</div></section>
    </div>`;
  document.querySelector('#detailSave')?.addEventListener('click', () => { toggleSaved(id); openDetails(id); });
  document.querySelector('#detailShare')?.addEventListener('click', () => shareRestaurant(restaurant));
  document.querySelector('#detailReport')?.addEventListener('click', () => openReport(restaurant));
  elements.detailContent.querySelectorAll('[data-track-event]').forEach(link => link.addEventListener('click', () => track(link.dataset.trackEvent, { id })));
  if (!elements.detailModal.open) openModal(elements.detailModal);
  track('restaurant_detail', { id });
}

async function shareRestaurant(restaurant) {
  const shareText = `${restaurant.name} — ${restaurant.cuisine}, about ${Number(restaurant.distanceMiles || 0).toFixed(1)} miles from ${locationState.label}. ${restaurant.website || restaurant.directions || ''}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: restaurant.name, text: shareText, url: restaurant.website || restaurant.directions || undefined });
      showToast('Shared');
    } else if (await copyText(shareText)) {
      showToast('Restaurant details copied');
    } else {
      throw new Error('Copy unavailable');
    }
    track('share', { id: restaurant.id });
  } catch (error) {
    if (error?.name !== 'AbortError') showToast('Could not share this restaurant');
  }
}

function openReport(restaurant) {
  closeModal(elements.detailModal);
  elements.reportRestaurantId.value = restaurant.id;
  elements.reportRestaurantName.textContent = restaurant.name;
  elements.reportType.value = '';
  elements.reportNote.value = '';
  openModal(elements.reportModal);
}

function submitReport(event) {
  event.preventDefault();
  const id = elements.reportRestaurantId.value;
  const type = elements.reportType.value;
  if (!id || !type) return showToast('Choose what is incorrect');
  reports.push({ id, type, note: elements.reportNote.value.trim(), at: new Date().toISOString() });
  persistState();
  closeModal(elements.reportModal);
  showToast('Thanks. The correction was recorded.');
  track('report_listing', { id, type });
}

function renderSavedModal() {
  const savedRestaurants = restaurants.map(adjustedRestaurant).filter(restaurant => savedIds.has(restaurant.id));
  if (!savedRestaurants.length) {
    elements.savedContent.innerHTML = `<div class="empty-state"><h3>Your saved list is empty.</h3><p>Save restaurants while browsing so you can compare them later.</p><button type="button" class="button primary" id="savedBrowse">Browse restaurants</button></div>`;
    document.querySelector('#savedBrowse')?.addEventListener('click', () => { closeModal(elements.savedModal); document.querySelector('#discover').scrollIntoView({ behavior: 'smooth' }); });
    return;
  }
  elements.savedContent.innerHTML = `<div class="saved-list">${savedRestaurants.map(restaurant => `<article class="saved-item"><div><h3>${escapeHtml(restaurant.name)}</h3><p>${escapeHtml(restaurant.cuisine)} · ~${Number(restaurant.distanceMiles || 0).toFixed(1)} mi · ${restaurant.matchScore}% match</p></div><div class="saved-item-actions"><button type="button" class="button secondary small saved-view" data-id="${escapeHtml(restaurant.id)}">View</button><button type="button" class="button secondary small saved-remove" data-id="${escapeHtml(restaurant.id)}">Remove</button></div></article>`).join('')}</div>`;
  elements.savedContent.querySelectorAll('.saved-view').forEach(button => button.addEventListener('click', () => { closeModal(elements.savedModal); openDetails(button.dataset.id); }));
  elements.savedContent.querySelectorAll('.saved-remove').forEach(button => button.addEventListener('click', () => toggleSaved(button.dataset.id)));
}

function resetFilters() {
  profile = { ...DEFAULT_PROFILE };
  userPrefs = { ...DEFAULT_PREFS };
  hiddenIds.clear();
  selectedCollection = 'All'; selectedCategory = 'All'; groupMode = { active: false, cuisines: [], dietary: [], budget: 'any', distance: 999 };
  elements.keywordSearch.value = ''; elements.distanceLimit.value = '999'; elements.priceLimit.value = 'any'; elements.smartPrompt.value = ''; elements.heroPrompt.value = ''; elements.smartExplanation.textContent = 'Try “vegan near campus,” “high protein,” or “authentic Mexican.”'; elements.sortBy.value = 'match';
  persistState(); updateGroupUI(); buildSliders(); loadRestaurants(); showToast('Filters reset'); track('reset_filters');
}

function updateLocationUI() {
  if (!elements.locationSelect || !elements.modalLocationSelect) return;
  const mainOptions = new Set([...elements.locationSelect.options].map(option => option.value));
  const modalOptions = new Set([...elements.modalLocationSelect.options].map(option => option.value));
  const mainKey = locationState.key === 'current' ? 'current' : mainOptions.has(locationState.key) ? locationState.key : 'custom';
  const modalKey = locationState.key === 'current' ? 'current' : modalOptions.has(locationState.key) ? locationState.key : 'custom';
  elements.locationSelect.value = mainKey;
  elements.modalLocationSelect.value = modalKey;
  if (elements.locationSummary) elements.locationSummary.textContent = `Distances are estimated from ${locationState.label}.`;
  if (elements.locationNav) elements.locationNav.textContent = `Location: ${locationState.label}`;
  if (elements.customLocationInput && mainKey === 'custom') elements.customLocationInput.value = locationState.label;
}

function updateGroupUI() {
  if (!elements.groupNav) return;
  elements.groupNav.textContent = groupMode.active ? 'Group: On' : 'Group mode';
  elements.groupNav.classList.toggle('active', Boolean(groupMode.active));
  if (elements.groupBudget) elements.groupBudget.value = groupMode.budget || 'any';
  if (elements.groupDistance) elements.groupDistance.value = String(groupMode.distance ?? 5);
  document.querySelectorAll('#groupCuisines input[type="checkbox"]').forEach(input => { input.checked = (groupMode.cuisines || []).includes(input.value); });
  document.querySelectorAll('#groupDietary input[type="checkbox"]').forEach(input => { input.checked = (groupMode.dietary || []).includes(input.value); });
}

function openLocation() {
  updateLocationUI();
  if (elements.customLocationWrap) elements.customLocationWrap.hidden = elements.modalLocationSelect?.value !== 'custom';
  openModal(elements.locationModal);
}

function openGroupMode() {
  updateGroupUI();
  openModal(elements.groupModal);
}

function openOnboarding() {
  document.querySelectorAll('#onboardingCuisines input[type="checkbox"]').forEach(input => { input.checked = (userPrefs.cuisines || []).includes(input.value); });
  document.querySelectorAll('#onboardingDietary input[type="checkbox"]').forEach(input => { input.checked = (userPrefs.dietary || []).includes(input.value); });
  if (elements.onboardingBudget) elements.onboardingBudget.value = userPrefs.budget || 'any';
  if (elements.onboardingPriority) elements.onboardingPriority.value = userPrefs.priority || 'authentic';
  openModal(elements.onboardingModal);
  track('open_preferences');
}

function setLocationFromChoice(choice, customText = '') {
  if (choice === 'current') {
    if (!navigator.geolocation || !window.isSecureContext) { showToast('Use a neighborhood instead; precise location needs a secure browser connection'); return; }
    showToast('Requesting your location…');
    navigator.geolocation.getCurrentPosition(position => {
      locationState = { key: 'current', label: 'your location', lat: position.coords.latitude, lng: position.coords.longitude, source: 'current' };
      persistState(); updateLocationUI(); renderRestaurants(); closeModal(elements.locationModal); showToast('Location updated'); track('location_change', { source: 'current' });
    }, error => {
      const message = error?.code === 1 ? 'Location permission was not granted' : 'Your location could not be detected. Choose a neighborhood instead.';
      showToast(message);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    return;
  }
  if (choice === 'custom') {
    const slug = slugify(customText);
    if (!slug) return showToast('Enter a supported neighborhood');
    const preset = LOCATION_PRESETS[slug] || Object.values(LOCATION_PRESETS).find(item => slug.includes(item.key) || item.key.includes(slug));
    if (!preset) return showToast('Choose a supported neighborhood from the suggestions');
    locationState = { ...preset, label: customText.trim() || preset.label, source: 'custom' };
  } else {
    locationState = { ...(LOCATION_PRESETS[choice] || DEFAULT_LOCATION) };
  }
  persistState(); updateLocationUI(); renderRestaurants(); closeModal(elements.locationModal); showToast(`Using ${locationState.label}`); track('location_change', { location: locationState.key });
}

function submitOnboarding(event) {
  event.preventDefault();
  userPrefs = {
    cuisines: selectedCheckboxValues('#onboardingCuisines'),
    dietary: selectedCheckboxValues('#onboardingDietary'),
    budget: elements.onboardingBudget.value,
    priority: elements.onboardingPriority.value
  };
  profile = { ...DEFAULT_PROFILE, [userPrefs.priority]: 10 };
  elements.priceLimit.value = userPrefs.budget;
  storageSet(STORAGE_KEYS.onboarding, 'true');
  persistState(); buildSliders(); closeModal(elements.onboardingModal); loadRestaurants(); showToast('Your recommendations are ready'); track('onboarding_complete', userPrefs);
}

function skipOnboarding() {
  storageSet(STORAGE_KEYS.onboarding, 'true');
  closeModal(elements.onboardingModal);
  track('onboarding_skip');
}

function submitGroupMode(event) {
  event.preventDefault();
  groupMode = {
    active: true,
    cuisines: selectedCheckboxValues('#groupCuisines'),
    dietary: selectedCheckboxValues('#groupDietary'),
    budget: elements.groupBudget.value,
    distance: Number(elements.groupDistance.value)
  };
  persistState();
  updateGroupUI();
  closeModal(elements.groupModal);
  renderRestaurants();
  document.querySelector('#discover').scrollIntoView({ behavior: 'smooth' });
  showToast('Group mode applied');
  track('group_mode', groupMode);
}

function clearGroupMode() {
  groupMode = { active: false, cuisines: [], dietary: [], budget: 'any', distance: 999 };
  document.querySelectorAll('#groupForm input[type="checkbox"]').forEach(input => { input.checked = false; });
  if (elements.groupBudget) elements.groupBudget.value = 'any';
  if (elements.groupDistance) elements.groupDistance.value = '5';
  persistState(); updateGroupUI(); closeModal(elements.groupModal); renderRestaurants(); showToast('Group mode cleared'); track('group_mode_clear');
}

function initializeEvents() {
  on(elements.keywordSearch, 'input', renderRestaurants);
  on(elements.distanceLimit, 'change', () => { renderRestaurants(); track('distance_filter', { value: elements.distanceLimit.value }); });
  on(elements.priceLimit, 'change', () => { renderRestaurants(); track('price_filter', { value: elements.priceLimit.value }); });
  on(elements.sortBy, 'change', () => { renderRestaurants(); track('sort', { value: elements.sortBy.value }); });
  on(elements.resetFilters, 'click', resetFilters);
  on(elements.runSmartSearch, 'click', () => parseSmartSearch(elements.smartPrompt?.value));
  on(elements.smartPrompt, 'keydown', event => { if (event.key === 'Enter') { event.preventDefault(); parseSmartSearch(elements.smartPrompt.value); } });
  on(elements.heroSearchForm, 'submit', event => {
    event.preventDefault();
    if (elements.smartPrompt) elements.smartPrompt.value = elements.heroPrompt?.value || '';
    parseSmartSearch(elements.heroPrompt?.value || '');
    document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('[data-prompt]').forEach(button => on(button, 'click', () => {
    const prompt = button.dataset.prompt || '';
    if (elements.heroPrompt) elements.heroPrompt.value = prompt;
    if (elements.smartPrompt) elements.smartPrompt.value = prompt;
    parseSmartSearch(prompt);
    document.querySelector('#discover')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  on(elements.closeDetail, 'click', () => closeModal(elements.detailModal));
  on(elements.closeSaved, 'click', () => closeModal(elements.savedModal));
  on(elements.savedNav, 'click', () => { renderSavedModal(); openModal(elements.savedModal); track('open_saved'); });
  on(elements.profileNav, 'click', openOnboarding);
  on(elements.personalizeHero, 'click', openOnboarding);
  on(elements.locationNav, 'click', openLocation);
  on(elements.changeLocation, 'click', () => {
    const choice = elements.locationSelect?.value || 'ucsd';
    if (choice === 'custom') return openLocation();
    setLocationFromChoice(choice);
  });
  on(elements.locationSelect, 'change', () => {
    const choice = elements.locationSelect.value;
    if (choice === 'custom') openLocation();
    else setLocationFromChoice(choice);
  });
  on(elements.modalLocationSelect, 'change', () => {
    if (elements.customLocationWrap) elements.customLocationWrap.hidden = elements.modalLocationSelect.value !== 'custom';
  });
  on(elements.locationForm, 'submit', event => {
    event.preventDefault();
    setLocationFromChoice(elements.modalLocationSelect?.value || 'ucsd', elements.customLocationInput?.value || '');
  });
  on(elements.closeLocation, 'click', () => closeModal(elements.locationModal));

  on(elements.groupNav, 'click', openGroupMode);
  on(elements.groupForm, 'submit', submitGroupMode);
  on(elements.clearGroupMode, 'click', clearGroupMode);
  on(elements.closeGroup, 'click', () => closeModal(elements.groupModal));

  on(elements.onboardingForm, 'submit', submitOnboarding);
  on(elements.skipOnboarding, 'click', skipOnboarding);
  on(elements.onboardingLater, 'click', skipOnboarding);
  on(elements.reportForm, 'submit', submitReport);
  on(elements.closeReport, 'click', () => closeModal(elements.reportModal));

  [elements.detailModal, elements.savedModal, elements.onboardingModal, elements.locationModal, elements.groupModal, elements.reportModal]
    .filter(Boolean)
    .forEach(modal => {
      on(modal, 'click', event => { if (event.target === modal) closeModal(modal); });
      on(modal, 'close', syncModalState);
      on(modal, 'cancel', () => setTimeout(syncModalState, 0));
    });
}

function showStartupError(error) {
  console.error('Palate startup error:', error);
  if (elements.status) elements.status.textContent = 'Palate could not finish loading. Refresh to try again.';
  if (elements.restaurants) elements.restaurants.innerHTML = '<div class="error-state"><h3>Something went wrong.</h3><p>Refresh the page to reload Palate.</p><button type="button" class="button primary" onclick="location.reload()">Refresh</button></div>';
}

function bootstrap() {
  try {
    buildSliders();
    updateSavedCount();
    updateLocationUI();
    updateGroupUI();
    initializeEvents();
    loadRestaurants();
    track('app_open', { version: '1.3.1' });
    if (storageGet(STORAGE_KEYS.onboarding) !== 'true') setTimeout(openOnboarding, 350);
  } catch (error) {
    showStartupError(error);
  }
}

window.addEventListener('error', event => console.error('Palate runtime error:', event.error || event.message));
window.addEventListener('unhandledrejection', event => console.error('Palate promise error:', event.reason));
window.PalateVersion = '1.3.1';
bootstrap();
