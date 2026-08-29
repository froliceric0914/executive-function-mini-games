# Development log

## 2026-08-29 — Local-first persistence architecture

- Added Dexie and an IndexedDB schema for raw attempts and training sessions.
- Added repositories plus a game storage service so React components do not manage database details.
- Replaced localStorage session history with a small, versioned, rebuildable progress/statistics cache.
- Added one-time migration of legacy localStorage session summaries into IndexedDB.
- Persist every completed Backward Digit Span attempt before updating cached progress and UI feedback.
- Restore current span and success streak from cache, rebuilding them from IndexedDB when cache is absent or invalid.
- Added an in-memory retry queue and visible warning for failed IndexedDB attempt writes.
- Updated progression to ask before increasing difficulty after three successful attempts at a span.
- Added cache and IndexedDB service tests.
- Added the persistence test suite to GitHub Actions CI before the production build.
- Made the Pages workflow perform first-time GitHub Pages enablement automatically.
- Added a direct live-site link to each successful Pages workflow summary.
