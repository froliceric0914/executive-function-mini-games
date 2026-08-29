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
- `src/utils/` — formatting and local storage helpers

## Backward Digit Span

Each round briefly shows a random sequence, then hides it. Enter the sequence in reverse using the on-screen keypad. Sessions start at three digits. A correct answer increases the next span by one; an incorrect answer repeats the same span. The session ends after three incorrect trials.

## Saved data

Completed sessions are saved only in the browser's `localStorage`. Each record includes completion date/time, total/correct/incorrect trials, accuracy, maximum successful span, average response time, and session duration. Clearing browser site data removes the history.
