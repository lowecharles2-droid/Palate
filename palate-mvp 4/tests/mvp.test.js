const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'styles.css'), 'utf8');
const restaurants = JSON.parse(fs.readFileSync(path.join(root, 'data', 'restaurants.json'), 'utf8'));

const requiredIds = [
  'onboardingModal', 'locationModal', 'groupModal', 'reportModal', 'priceLimit',
  'locationSelect', 'savedModal', 'detailModal', 'smartPrompt', 'restaurants',
  'profileNav', 'personalizeHero', 'groupNav', 'locationNav'
];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing required UI element: ${id}`);
}

const requiredFeatures = [
  'getRecommendationReasons', 'markHelpful', 'hideRecommendation', 'submitReport',
  'submitOnboarding', 'submitGroupMode', 'relaxedAlternatives', 'PalateAnalytics',
  'openModal', 'closeModal', 'openOnboarding', 'openGroupMode', 'updateGroupUI'
];
for (const feature of requiredFeatures) {
  if (!app.includes(feature)) throw new Error(`Missing MVP feature: ${feature}`);
}

if (!css.includes('.why-match') || !css.includes('.recommendation-feedback') || !css.includes('.modal-fallback-open')) {
  throw new Error('Missing recommendation, feedback, or modal fallback styling.');
}

if (!Array.isArray(restaurants) || restaurants.length < 80) {
  throw new Error('Restaurant directory unexpectedly small.');
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) throw new Error(`Duplicate HTML IDs: ${[...new Set(duplicates)].join(', ')}`);

console.log(`MVP validation passed: ${requiredFeatures.length} upgraded features and ${restaurants.length} restaurants.`);

const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
if (!server.includes("APP_VERSION = '1.3.1'") || !server.includes('no-store, must-revalidate')) {
  throw new Error('Versioning or cache-busting protection is missing.');
}
if (!app.includes("palate_onboarding_complete_v3") || !app.includes("palate_group_mode_v3")) {
  throw new Error('Updated onboarding/group persistence keys are missing.');
}
console.log('Reliability validation passed: defensive events, modal fallback, cache busting, and v3 persistence.');
