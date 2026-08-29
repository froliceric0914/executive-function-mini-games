# Executive Function Mini Games

A small, mobile-first React app for personal cognitive training and performance tracking. This project is not a medical or diagnostic tool.

## Run locally

Use Node.js 16.13 or newer, then:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. To verify a production build, run `npm run build`.

## Continuous integration and deployment

GitHub Actions runs TypeScript and production-build checks for every pull
request and every push to `main`. A separate GitHub Pages workflow publishes
the app automatically from `main`. See `docs/DEPLOYMENT.md` for setup and
mainland-China access notes.

## Project structure

- `src/components/` — reusable UI such as the keypad and result card
- `src/games/BackwardDigitSpan/` — core game rules and session calculations
- `src/pages/` — Home, Training, and History screens
- `src/types/` — shared TypeScript data shapes
- `src/db/` — Dexie database and durable history repositories
- `src/cache/` — disposable, versioned progress cache
- `src/services/` — storage API used by the UI

## Backward Digit Span

Each round briefly shows a random sequence, then hides it. Enter the sequence in reverse using the on-screen keypad. Sessions start at three digits. After three successful attempts at most spans, the app asks whether to stay or increase by one; span four needs only one successful attempt. It never raises difficulty silently, and each new session restarts at three digits.

## Local data architecture

The project follows one rule: **database for truth, cache for speed, React state for the current interaction**.

- React state holds temporary interaction data such as the visible sequence, answer input, phase, and timers.
- `localStorage` holds only a small, versioned cache of the current span, success streak, latest session, and optional derived statistics. It is disposable and can be rebuilt.
- IndexedDB, accessed through Dexie, is the durable source of truth for raw attempts and training sessions. History and statistics are read from these structured records.

Guest users use the same IndexedDB history store; login status does not change the local persistence model. Clearing only the app cache does not delete training history, but clearing browser/site data may delete a guest's IndexedDB history. A future login feature may associate and optionally synchronize this local history with a cloud account.

Older session summaries stored by previous versions in `localStorage` are migrated into IndexedDB when the app starts. If migration fails, the original data is left intact.
