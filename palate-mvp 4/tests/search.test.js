'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Search = require('../public/search-core.js');

const dataPath = path.join(__dirname, '..', 'data', 'restaurants.json');
const restaurants = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

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

function clampScore(value, fallback = 5) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(10, number)) : fallback;
}

function calculateMatch(profile, restaurant) {
  const scores = restaurant.tasteScores || {};
  const keys = Object.keys(profile);
  const weightedDistance = keys.reduce((total, key) => {
    const weight = profile[key] >= 8 ? 1.25 : profile[key] <= 3 ? 0.8 : 1;
    return total + Math.abs(profile[key] - clampScore(scores[key])) * weight;
  }, 0);
  const maxDistance = keys.length * 9 * 1.25;
  return Math.max(40, Math.min(99, Math.round(100 - (weightedDistance / maxDistance) * 100)));
}

const rankedData = restaurants.map(restaurant => ({
  ...restaurant,
  matchScore: calculateMatch(DEFAULT_PROFILE, restaurant)
}));

let assertions = 0;
function check(condition, message) {
  assertions += 1;
  assert.ok(condition, message);
}

function results(query) {
  return Search.filterAndRank(rankedData, query);
}

function allHaveCategory(query, category) {
  const found = results(query);
  check(found.length > 0, `Expected results for “${query}”`);
  check(found.every(item => (item.categories || []).includes(category)), `Every result for “${query}” must have ${category}`);
}

// Data integrity used by every card and filter.
const ids = new Set();
for (const restaurant of restaurants) {
  check(restaurant.id && !ids.has(restaurant.id), `Duplicate or missing id: ${restaurant.id}`);
  ids.add(restaurant.id);
  check(typeof restaurant.name === 'string' && restaurant.name.trim(), `Missing name for ${restaurant.id}`);
  check(/^https?:\/\//.test(restaurant.website || ''), `Missing valid website for ${restaurant.name}`);
  check(/^https?:\/\//.test(restaurant.verificationSource || ''), `Missing verification source for ${restaurant.name}`);
  check(Number.isFinite(Number(restaurant.distanceMiles)), `Invalid distance for ${restaurant.name}`);
  check(Array.isArray(restaurant.categories) && restaurant.categories.length > 0, `Missing categories for ${restaurant.name}`);
  check(Array.isArray(restaurant.tags), `Missing tags for ${restaurant.name}`);
  check(Number(restaurant.authenticityScore) >= 1 && Number(restaurant.authenticityScore) <= 10, `Invalid authenticity score for ${restaurant.name}`);
  check(Number(restaurant.localScore) >= 1 && Number(restaurant.localScore) <= 10, `Invalid local score for ${restaurant.name}`);
  for (const key of Object.keys(DEFAULT_PROFILE)) {
    check(Number(restaurant.tasteScores?.[key]) >= 1 && Number(restaurant.tasteScores?.[key]) <= 10, `Invalid ${key} score for ${restaurant.name}`);
  }
}

// Full restaurant-name searches must not be hijacked by category words in a name.
for (const restaurant of rankedData) {
  const found = results(restaurant.name);
  check(found.length === 1, `Exact-name search should return one result for ${restaurant.name}`);
  check(found[0].id === restaurant.id, `Exact-name search returned the wrong restaurant for ${restaurant.name}`);
}

// Every natural-language filter maps to a strict verified category.
const categoryQueries = [
  ['high protein', 'High protein'],
  ['vegetarian', 'Vegetarian options'],
  ['vegan', 'Vegan options'],
  ['halal', 'Halal options'],
  ['gluten free', 'Gluten-conscious options'],
  ['spicy', 'Spicy'],
  ['healthy', 'Healthy'],
  ['family owned', 'Family-owned'],
  ['date night', 'Date night'],
  ['aesthetic', 'Aesthetic'],
  ['group friendly', 'Group friendly'],
  ['ramen', 'Ramen'],
  ['hot pot', 'Hot Pot'],
  ['korean bbq', 'Korean BBQ'],
  ['dumplings', 'Dumplings'],
  ['noodles', 'Noodles'],
  ['poke', 'Poke'],
  ['burgers', 'Burgers'],
  ['breakfast', 'Breakfast'],
  ['cafe', 'Cafe'],
  ['dessert', 'Dessert'],
  ['sushi', 'Sushi'],
  ['pizza', 'Pizza'],
  ['seafood', 'Seafood']
];
for (const [query, category] of categoryQueries) allHaveCategory(query, category);

// Cuisine searches only return cuisine-family matches.
const cuisineQueries = ['chinese', 'taiwanese', 'indian', 'japanese', 'korean', 'mexican', 'thai', 'vietnamese', 'mediterranean', 'middle eastern', 'italian', 'american', 'greek', 'seafood', 'hawaiian'];
for (const query of cuisineQueries) {
  const intent = Search.parseSearchIntent(query);
  const found = results(query);
  check(found.length > 0, `Expected cuisine results for ${query}`);
  check(found.every(item => Search.cuisineMatchStrength(item, intent.cuisine) > 0), `Non-${query} result leaked into ${query} search`);
}

// Authentic searches must enforce cuisine fidelity before general match score.
const authenticCuisineQueries = ['chinese', 'indian', 'japanese', 'korean', 'mexican', 'thai', 'vietnamese', 'mediterranean', 'italian', 'american', 'greek', 'seafood'];
for (const cuisine of authenticCuisineQueries) {
  const query = `authentic ${cuisine}`;
  const intent = Search.parseSearchIntent(query);
  const found = results(query);
  check(found.length > 0, `Expected authentic results for ${cuisine}`);
  check(found.every(item => Search.cuisineMatchStrength(item, intent.cuisine) > 0), `Wrong cuisine leaked into ${query}`);
  check(found.every(item => Number(item.authenticityScore) >= 8), `Low-fidelity result leaked into ${query}`);
}

const authenticChinese = results('authentic chinese');
check(authenticChinese[0].name !== 'Panda Express', 'Panda Express must not rank first for authentic Chinese');
check(!authenticChinese.some(item => item.name === 'Panda Express'), 'Panda Express must be excluded from authentic Chinese results');
check(['Village Kitchen', 'Shan Xi Magic Kitchen', 'Spicy City', 'Jasmine Seafood Restaurant', 'Dagu Rice Noodle', 'Mom Kitchen'].includes(authenticChinese[0].name), 'Authentic Chinese should lead with a regional Chinese specialist');

// Local, hidden-gem, budget, and distance intent are strict constraints.
for (const query of ['local', 'independent', 'hidden gem']) {
  const found = results(query);
  check(found.length > 0, `Expected results for ${query}`);
  check(found.every(item => item.chain !== true && Number(item.localScore) >= 7), `${query} returned a chain or low-local-score restaurant`);
}
for (const query of ['cheap', 'budget', 'affordable', 'under $15']) {
  const found = results(query);
  check(found.length > 0, `Expected results for ${query}`);
  check(found.every(item => (item.categories || []).includes('Budget')), `${query} returned a non-budget restaurant`);
}
for (const [query, max] of [['near campus', 3], ['within 1 mile', 1], ['within 3 miles', 3], ['under 5 miles', 5]]) {
  const found = results(query);
  check(found.length > 0, `Expected distance results for ${query}`);
  check(found.every(item => Number(item.distanceMiles) <= max), `${query} returned a restaurant beyond ${max} miles`);
}

// Combined filters use AND semantics.
const combined = [
  ['vegan near campus', item => item.categories.includes('Vegan options') && Number(item.distanceMiles) <= 3],
  ['high protein under 3 miles', item => item.categories.includes('High protein') && Number(item.distanceMiles) <= 3],
  ['spicy chinese', item => item.categories.includes('Spicy') && Search.cuisineMatchStrength(item, 'chinese') > 0],
  ['authentic vegetarian chinese', item => item.categories.includes('Vegetarian options') && Search.cuisineMatchStrength(item, 'chinese') > 0 && Number(item.authenticityScore) >= 8],
  ['local thai', item => item.categories.includes('Thai') && item.chain !== true && Number(item.localScore) >= 7],
  ['date night italian', item => item.categories.includes('Date night') && item.categories.includes('Italian')]
];
for (const [query, predicate] of combined) {
  const found = results(query);
  check(found.length > 0, `Expected combined results for ${query}`);
  check(found.every(predicate), `Combined query returned an invalid result: ${query}`);
}

// UI category and collection filters use exact membership and must never leak items.
const allCategories = [...new Set(restaurants.flatMap(item => item.categories || []))];
for (const category of allCategories) {
  const found = rankedData.filter(item => (item.categories || []).includes(category));
  check(found.length > 0, `Category has no restaurants: ${category}`);
  check(found.every(item => item.categories.includes(category)), `Category filter leaked a restaurant for ${category}`);
}
const allCollections = [...new Set(restaurants.flatMap(item => item.collections || []))];
for (const collection of allCollections) {
  const found = rankedData.filter(item => (item.collections || []).includes(collection));
  check(found.length > 0, `Collection has no restaurants: ${collection}`);
  check(found.every(item => item.collections.includes(collection)), `Collection filter leaked a restaurant for ${collection}`);
}

// Regression checks for former substring and ranking bugs.
check(results('Spicy City').length === 1 && results('Spicy City')[0].name === 'Spicy City', '“City” must not match the “authenticity” substring');
check(results('Burger King').length === 1 && results('Burger King')[0].name === 'Burger King', 'Restaurant name search must override category parsing');
check(results('chinese').slice(0, 5).every(item => item.name !== 'Panda Express'), 'Panda Express should not appear among the first five general Chinese results');

// Every supported cuisine and every recognized cuisine synonym must behave consistently.
for (const rule of Search.CUISINE_RULES) {
  const baseResults = results(rule.key);
  check(baseResults.length >= 3, `Expected at least three ${rule.key} options, found ${baseResults.length}`);
  check(baseResults.every(item => Search.cuisineMatchStrength(item, rule.key) > 0), `${rule.key} search leaked another cuisine`);
  check(Number(baseResults[0].authenticityScore) >= 8, `${rule.key} search should lead with a high-fidelity option`);

  const authenticResults = results(`authentic ${rule.key}`);
  check(authenticResults.length >= 2, `Expected at least two authentic ${rule.key} options`);
  check(authenticResults.every(item => Search.cuisineMatchStrength(item, rule.key) >= 3), `Authentic ${rule.key} returned a weak cuisine match`);
  check(authenticResults.every(item => Number(item.authenticityScore) >= 8), `Authentic ${rule.key} returned a low-fidelity option`);

  const independent = rankedData.filter(item =>
    Search.cuisineMatchStrength(item, rule.key) >= 3
    && Number(item.authenticityScore) >= 8
    && item.chain !== true
    && Number(item.localScore) >= 7
  );
  if (independent.length >= 2) {
    check(authenticResults.every(item => item.chain !== true), `Authentic ${rule.key} should prefer independent specialists`);
  }

  for (const term of rule.terms) {
    const synonymResults = results(term);
    check(synonymResults.length > 0, `Cuisine synonym “${term}” returned no results`);
    check(synonymResults.every(item => Search.cuisineMatchStrength(item, rule.key) > 0), `Cuisine synonym “${term}” leaked another cuisine`);
  }
}

// Every natural-language category synonym must map to strict membership.
for (const rule of Search.CATEGORY_RULES) {
  for (const term of rule.terms) {
    const found = results(term);
    check(found.length > 0, `Category synonym “${term}” returned no results`);
    check(found.every(item => (item.categories || []).includes(rule.category)), `Category synonym “${term}” leaked a restaurant without ${rule.category}`);
  }
}

// National fast-food chains must not lead explicit authenticity searches when local specialists exist.
const authenticityRegressions = [
  ['authentic american', ['Burger King', 'Subway', 'Shake Shack', 'Tender Greens', 'True Food Kitchen']],
  ['authentic mexican', ['Taco Bell']],
  ['authentic indian', ['Curry Up Now']],
  ['authentic japanese', ['Marugame Udon', 'Ramen Nagi']],
  ['authentic korean', ['Gen Korean BBQ House']],
  ['authentic mediterranean', ['CAVA']],
  ['authentic italian', ['North Italia']],
  ['authentic hawaiian', ['L&L Hawaiian Barbecue']]
];
for (const [query, blockedLeaders] of authenticityRegressions) {
  const found = results(query);
  check(found.length > 0, `Expected results for ${query}`);
  check(!blockedLeaders.includes(found[0].name), `${found[0].name} must not lead ${query}`);
}

console.log(`Search validation passed: ${assertions} assertions across ${restaurants.length} restaurants.`);
