# Palate MVP Reliability Report

Version: 1.3.1

## Regression testing completed

The app was tested in three layers:

1. Static and syntax validation
   - Node syntax checks for server, app, and search engine
   - Duplicate-ID and required-element checks
   - Cache-busting and persistence-key validation

2. Search and ranking validation
   - 2,362 assertions across 84 restaurants
   - Cuisine, dietary, distance, price, authenticity, local ownership, exact-name, and combined-intent searches

3. Browser interaction validation
   - 107 end-to-end feature assertions
   - Desktop layout
   - Mobile layout
   - Browser dialog fallback mode
   - Stored-state restoration

## Features explicitly tested

- First-visit onboarding popup
- Reopening preferences after onboarding
- Onboarding selection persistence
- Group mode open, apply, filter accuracy, persistence, and clear
- Location modal open and close
- Preset, custom, and current-location flows
- Distance recalculation after changing location
- Smart search and exact restaurant search
- Cuisine, dietary, distance, price, collection, and sorting controls
- Saved restaurants, saved list, and removal
- Restaurant details
- Share action
- Helpful and Not for me feedback
- Listing correction reports
- No-result recovery and reset
- Mobile navigation controls
- Modal fallback for browsers with incomplete dialog support
- Analytics event recording
- State restoration after returning to the app

## Important MVP limitations

- Current-location detection requires HTTPS and browser permission.
- Correction reports and analytics are stored in the visitor's browser, not in a shared database.
- Restaurant information can change; official restaurant links remain the final source for current hours, menus, and closures.
