const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public', 'styles.css'), 'utf8');
const restaurants = JSON.parse(fs.readFileSync(path.join(root, 'data', 'restaurants.json'), 'utf8'));

const requiredIds = [
  'onboardingModal', 'locationModal', 'groupModal', 'reportModal', 'priceLimit',
  'locationSelect', 'savedModal', 'detailModal', 'smartPrompt', 'restaurants'
];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing required UI element: ${id}`);
}

const requiredFeatures = [
  'getRecommendationReasons', 'markHelpful', 'hideRecommendation', 'submitReport',
  'submitOnboarding', 'submitGroupMode', 'relaxedAlternatives', 'PalateAnalytics'
];
for (const feature of requiredFeatures) {
  if (!app.includes(feature)) throw new Error(`Missing MVP feature: ${feature}`);
}

if (!css.includes('.why-match') || !css.includes('.recommendation-feedback')) {
  throw new Error('Missing recommendation explanation or feedback styling.');
}

if (!Array.isArray(restaurants) || restaurants.length < 80) {
  throw new Error('Restaurant directory unexpectedly small.');
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) throw new Error(`Duplicate HTML IDs: ${[...new Set(duplicates)].join(', ')}`);

console.log(`MVP validation passed: ${requiredFeatures.length} upgraded features and ${restaurants.length} restaurants.`);
