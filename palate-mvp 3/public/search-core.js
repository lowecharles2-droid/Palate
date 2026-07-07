(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PalateSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CATEGORY_RULES = [
    { terms: ['high protein', 'protein rich', 'protein-friendly', 'protein friendly', 'gym'], category: 'High protein', scoreKey: 'protein' },
    { terms: ['vegetarian', 'veggie'], category: 'Vegetarian options', scoreKey: 'vegetarian' },
    { terms: ['vegan', 'plant based', 'plant-based'], category: 'Vegan options', scoreKey: 'vegetarian' },
    { terms: ['halal'], category: 'Halal options' },
    { terms: ['gluten free', 'gluten-free', 'gluten conscious', 'gluten-conscious'], category: 'Gluten-conscious options' },
    { terms: ['spicy', 'hot food', 'heat'], category: 'Spicy', scoreKey: 'spice' },
    { terms: ['healthy', 'health focused', 'health-focused', 'clean eating'], category: 'Healthy', scoreKey: 'healthy' },
    { terms: ['family owned', 'family-owned'], category: 'Family-owned', scoreKey: 'hidden' },
    { terms: ['date night', 'romantic'], category: 'Date night', scoreKey: 'aesthetic' },
    { terms: ['aesthetic', 'instagrammable', 'instagram worthy'], category: 'Aesthetic', scoreKey: 'aesthetic' },
    { terms: ['group friendly', 'good for groups', 'group', 'friends'], category: 'Group friendly' },
    { terms: ['ramen'], category: 'Ramen' },
    { terms: ['hot pot', 'hotpot'], category: 'Hot Pot' },
    { terms: ['korean bbq', 'kbbq'], category: 'Korean BBQ' },
    { terms: ['barbecue', 'barbeque', 'bbq'], category: 'Barbecue', scoreKey: 'protein' },
    { terms: ['dumpling', 'dumplings', 'dim sum'], category: 'Dumplings' },
    { terms: ['noodle', 'noodles'], category: 'Noodles' },
    { terms: ['poke'], category: 'Poke' },
    { terms: ['burger', 'burgers'], category: 'Burgers' },
    { terms: ['breakfast', 'brunch'], category: 'Breakfast' },
    { terms: ['cafe', 'coffee'], category: 'Cafe' },
    { terms: ['dessert', 'desserts', 'sweet'], category: 'Dessert' },
    { terms: ['sushi'], category: 'Sushi' },
    { terms: ['pizza'], category: 'Pizza' },
    { terms: ['seafood'], category: 'Seafood' }
  ];

  const CUISINE_RULES = [
    { key: 'chinese', terms: ['chinese', 'sichuan', 'szechuan', 'cantonese', 'hunan', 'shanghai', 'shanghainese', 'yunnan', 'xian', "xi'an", 'hong kong'], categories: ['Chinese', 'Chinese American', 'Taiwanese'] },
    { key: 'taiwanese', terms: ['taiwanese', 'taiwan'], categories: ['Taiwanese'] },
    { key: 'indian', terms: ['indian'], categories: ['Indian'] },
    { key: 'japanese', terms: ['japanese'], categories: ['Japanese'] },
    { key: 'korean', terms: ['korean'], categories: ['Korean'] },
    { key: 'mexican', terms: ['mexican', 'taco', 'tacos', 'baja', 'tijuana'], categories: ['Mexican'] },
    { key: 'thai', terms: ['thai'], categories: ['Thai'] },
    { key: 'vietnamese', terms: ['vietnamese', 'pho'], categories: ['Vietnamese'] },
    { key: 'mediterranean', terms: ['mediterranean'], categories: ['Mediterranean'] },
    { key: 'middle eastern', terms: ['middle eastern', 'levantine'], categories: ['Middle Eastern', 'Lebanese'] },
    { key: 'italian', terms: ['italian', 'pasta'], categories: ['Italian'] },
    { key: 'american', terms: ['american'], categories: ['American', 'American fast food'] },
    { key: 'greek', terms: ['greek'], categories: ['Greek'] },
    { key: 'seafood', terms: ['seafood'], categories: ['Seafood'] },
    { key: 'hawaiian', terms: ['hawaiian'], categories: ['Hawaiian'] }
  ];

  const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'around', 'at', 'best', 'by', 'close', 'find', 'food', 'for', 'from',
    'good', 'i', 'in', 'is', 'me', 'near', 'of', 'or', 'place', 'places', 'restaurant', 'restaurants',
    'show', 'some', 'spot', 'spots', 'that', 'the', 'to', 'want', 'with', 'within', 'under', 'less', 'than',
    'authentic', 'traditional', 'cheap', 'budget', 'affordable', 'local', 'independent', 'hidden', 'gem',
    'ucsd', 'campus', 'miles', 'mile', 'mi'
  ]);

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9$'.-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function includesPhrase(text, phrase) {
    const normalizedText = ` ${normalize(text)} `;
    const normalizedPhrase = ` ${normalize(phrase)} `;
    return normalizedText.includes(normalizedPhrase);
  }

  function getSearchText(restaurant) {
    return normalize([
      restaurant.name,
      restaurant.area,
      restaurant.cuisine,
      restaurant.summary,
      restaurant.recommendedDish,
      restaurant.authenticityReason,
      ...(restaurant.tags || []),
      ...(restaurant.categories || []),
      ...(restaurant.collections || []),
      ...(restaurant.cuisineAliases || [])
    ].join(' '));
  }

  function getCategorySet(restaurant) {
    return new Set((restaurant.categories || []).map(normalize));
  }

  function parseSearchIntent(rawPrompt) {
    const prompt = normalize(rawPrompt);
    const intent = {
      raw: String(rawPrompt || '').trim(),
      normalized: prompt,
      categories: [],
      cuisine: null,
      authentic: false,
      local: false,
      hiddenGem: false,
      budget: false,
      nearCampus: false,
      maxDistance: null,
      genericTokens: [],
      recognizedPhrases: []
    };

    if (!prompt) return intent;

    for (const rule of CATEGORY_RULES) {
      const matched = rule.terms.find(term => includesPhrase(prompt, term));
      if (matched) {
        intent.categories.push(rule.category);
        intent.recognizedPhrases.push(matched);
      }
    }

    const cuisineMatches = CUISINE_RULES
      .map(rule => ({ rule, matched: rule.terms.find(term => includesPhrase(prompt, term)) }))
      .filter(item => item.matched)
      .sort((a, b) => b.matched.length - a.matched.length);
    if (cuisineMatches.length) {
      intent.cuisine = cuisineMatches[0].rule.key;
      intent.recognizedPhrases.push(cuisineMatches[0].matched);
    }

    intent.authentic = includesPhrase(prompt, 'authentic') || includesPhrase(prompt, 'traditional');
    intent.local = includesPhrase(prompt, 'local') || includesPhrase(prompt, 'independent') || includesPhrase(prompt, 'family owned') || includesPhrase(prompt, 'family-owned');
    intent.hiddenGem = includesPhrase(prompt, 'hidden gem') || includesPhrase(prompt, 'underrated');
    intent.budget = includesPhrase(prompt, 'cheap') || includesPhrase(prompt, 'budget') || includesPhrase(prompt, 'affordable') || /(?:under|below|less than)\s*\$?\d+/.test(prompt);
    intent.nearCampus = includesPhrase(prompt, 'near campus') || includesPhrase(prompt, 'near ucsd') || includesPhrase(prompt, 'on campus') || prompt === 'ucsd';

    if (intent.authentic) intent.recognizedPhrases.push('authentic', 'traditional');
    if (intent.local) intent.recognizedPhrases.push('local', 'independent', 'family owned', 'family-owned');
    if (intent.hiddenGem) intent.recognizedPhrases.push('hidden gem', 'underrated');
    if (intent.budget) intent.recognizedPhrases.push('cheap', 'budget', 'affordable');
    if (intent.nearCampus) intent.recognizedPhrases.push('near campus', 'near ucsd', 'on campus', 'ucsd');

    const mileMatch = prompt.match(/(?:within|under|less than|below)?\s*(\d{1,2}(?:\.\d+)?)\s*(?:mile|miles|mi)\b/);
    if (mileMatch) intent.maxDistance = Number(mileMatch[1]);
    else if (intent.nearCampus) intent.maxDistance = 3;

    intent.categories = unique(intent.categories);
    if (intent.categories.includes('Korean BBQ')) {
      intent.categories = intent.categories.filter(category => category !== 'Barbecue');
    }

    let remainder = prompt;
    for (const phrase of unique(intent.recognizedPhrases).sort((a, b) => b.length - a.length)) {
      remainder = remainder.replace(new RegExp(`\\b${escapeRegExp(normalize(phrase)).replace(/\\ /g, '\\s+')}\\b`, 'g'), ' ');
    }
    remainder = remainder.replace(/(?:within|under|less than|below)?\s*\$?\d+(?:\.\d+)?\s*(?:mile|miles|mi)?/g, ' ');
    intent.genericTokens = unique(normalize(remainder).split(' ').filter(token => token.length > 1 && !STOP_WORDS.has(token)));
    return intent;
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function cuisineMatchStrength(restaurant, cuisineKey) {
    if (!cuisineKey) return 0;
    const rule = CUISINE_RULES.find(item => item.key === cuisineKey);
    if (!rule) return 0;

    const categorySet = getCategorySet(restaurant);
    const cuisineText = normalize(restaurant.cuisine);
    const aliases = (restaurant.cuisineAliases || []).map(normalize);

    if (categorySet.has(normalize(cuisineKey))) return 4;
    if (rule.categories.some(category => categorySet.has(normalize(category)))) {
      if (cuisineKey === 'chinese' && categorySet.has('chinese american')) return 2;
      return 4;
    }
    if (aliases.includes(normalize(cuisineKey))) return 4;
    if (rule.terms.some(term => includesPhrase(cuisineText, term) || aliases.some(alias => includesPhrase(alias, term)))) {
      if (cuisineKey === 'chinese' && cuisineText.includes('chinese american')) return 2;
      return 3;
    }
    return 0;
  }

  function matchesCategory(restaurant, category) {
    return getCategorySet(restaurant).has(normalize(category));
  }

  function matchesIntent(restaurant, intent) {
    if (!intent || !intent.normalized) return true;
    const normalizedName = normalize(restaurant.name);
    if (normalizedName === intent.normalized) return true;
    if (intent.cuisine && cuisineMatchStrength(restaurant, intent.cuisine) === 0) return false;
    if (intent.categories.some(category => !matchesCategory(restaurant, category))) return false;
    if (intent.maxDistance != null && Number(restaurant.distanceMiles ?? Infinity) > intent.maxDistance) return false;

    if (intent.authentic && Number(restaurant.authenticityScore || 0) < 8) return false;
    if (intent.local && (restaurant.chain === true || Number(restaurant.localScore || 0) < 7)) return false;
    if (intent.hiddenGem && (restaurant.chain === true || Number(restaurant.localScore || 0) < 7)) return false;
    if (intent.budget && !matchesCategory(restaurant, 'Budget')) return false;

    if (intent.genericTokens.length) {
      const tokenSet = new Set(getSearchText(restaurant).split(' ').filter(Boolean));
      if (!intent.genericTokens.every(token => tokenSet.has(token))) return false;
    }
    return true;
  }

  function relevanceScore(restaurant, intent) {
    if (!intent || !intent.normalized) return Number(restaurant.matchScore || 0);
    let score = Number(restaurant.matchScore || 0) * 0.25;
    const cuisineStrength = cuisineMatchStrength(restaurant, intent.cuisine);
    score += cuisineStrength * 35;
    score += intent.categories.length * 30;

    // Cuisine searches should lead with restaurants that strongly represent the requested cuisine,
    // not whichever chain happens to match the user's general taste sliders.
    if (intent.cuisine) {
      score += Number(restaurant.authenticityScore || 0) * 7;
      score += Number(restaurant.localScore || 0) * 2;
      if (restaurant.chain) score -= 12;
      if (cuisineStrength === 2) score -= 45;
      if ((restaurant.categories || []).includes('Fusion')) score -= 12;
    }

    if (intent.authentic) {
      score += Number(restaurant.authenticityScore || 0) * 13;
      score += Number(restaurant.localScore || 0) * 3;
      if (restaurant.chain) score -= 30;
      if (cuisineStrength === 2) score -= 55;
    }
    if (intent.local || intent.hiddenGem) {
      score += Number(restaurant.localScore || 0) * 13;
      if (restaurant.chain) score -= 70;
      score += Number(restaurant.tasteScores?.hidden || 0) * 5;
    }
    if (intent.budget) score += Number(restaurant.tasteScores?.value || 0) * 8;

    const scoreKeyByCategory = new Map(CATEGORY_RULES.map(rule => [rule.category, rule.scoreKey]));
    for (const category of intent.categories) {
      const key = scoreKeyByCategory.get(category);
      if (key) score += Number(restaurant.tasteScores?.[key] || 0) * 8;
    }

    if (intent.maxDistance != null) score += Math.max(0, (intent.maxDistance - Number(restaurant.distanceMiles || 0)) * 5);
    if (normalize(restaurant.name) === intent.normalized) score += 300;
    else if (!intent.cuisine && !intent.categories.length && intent.genericTokens.length && normalize(restaurant.name).includes(intent.normalized)) score += 120;
    return score;
  }

  function filterAndRank(restaurants, rawPrompt) {
    const intent = typeof rawPrompt === 'object' && rawPrompt.normalized != null ? rawPrompt : parseSearchIntent(rawPrompt);
    const exactNameMatches = restaurants.filter(restaurant => normalize(restaurant.name) === intent.normalized);
    if (exactNameMatches.length) {
      return exactNameMatches
        .map(restaurant => ({ ...restaurant, searchScore: relevanceScore(restaurant, intent) }))
        .sort((a, b) => Number(b.searchScore || 0) - Number(a.searchScore || 0));
    }

    let matches = restaurants.filter(restaurant => matchesIntent(restaurant, intent));

    // When a user explicitly asks for authentic/traditional food, prefer independent cuisine
    // specialists whenever the directory has enough of them. Chains remain available as a
    // fallback for cuisines where local coverage is still limited.
    if (intent.authentic) {
      const independentSpecialists = matches.filter(restaurant =>
        restaurant.chain !== true
        && Number(restaurant.localScore || 0) >= 7
        && Number(restaurant.authenticityScore || 0) >= 8
        && (!intent.cuisine || cuisineMatchStrength(restaurant, intent.cuisine) >= 3)
      );
      if (independentSpecialists.length >= 2) {
        matches = independentSpecialists;
      } else {
        const specialists = matches.filter(restaurant =>
          Number(restaurant.authenticityScore || 0) >= 8
          && (!intent.cuisine || cuisineMatchStrength(restaurant, intent.cuisine) >= 3)
        );
        if (specialists.length) matches = specialists;
      }
    }

    return matches
      .map(restaurant => ({ ...restaurant, searchScore: relevanceScore(restaurant, intent) }))
      .sort((a, b) => b.searchScore - a.searchScore || Number(b.authenticityScore || 0) - Number(a.authenticityScore || 0) || Number(b.localScore || 0) - Number(a.localScore || 0) || Number(a.distanceMiles || 999) - Number(b.distanceMiles || 999) || a.name.localeCompare(b.name));
  }

  function describeIntent(intent) {
    const parts = [];
    if (intent.authentic) parts.push('high cuisine fidelity');
    if (intent.local) parts.push('local and independent');
    if (intent.hiddenGem) parts.push('hidden gems');
    if (intent.budget) parts.push('budget-friendly');
    if (intent.cuisine) parts.push(intent.cuisine);
    parts.push(...intent.categories.map(category => category.toLowerCase()));
    if (intent.maxDistance != null) parts.push(`within ${intent.maxDistance} miles`);
    if (intent.genericTokens.length) parts.push(intent.genericTokens.join(' '));
    return unique(parts);
  }

  return {
    CATEGORY_RULES,
    CUISINE_RULES,
    normalize,
    parseSearchIntent,
    cuisineMatchStrength,
    matchesCategory,
    matchesIntent,
    relevanceScore,
    filterAndRank,
    describeIntent
  };
});
