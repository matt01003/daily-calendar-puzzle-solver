# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All scripts run via npm (the README's `yarn start` is stale — there is no `start` script):

```bash
npm run dev       # start Vite dev server (--host)
npm run build     # type-check (tsc -b) then bundle (vite build) → dist/
npm run lint      # eslint .
npm test          # run vitest once (no watch)
npm run preview   # serve the production build locally
npm run deploy    # build + publish dist/ to gh-pages
```

Tests live in `src/puzzle-solver.test.ts` and cover only the pure solver logic (there are no React tests).

## Architecture

A Vite + React 18 + TypeScript single-page app that solves a "daily calendar" packing puzzle. The core is a single pure, framework-agnostic module: `src/puzzle-solver.ts`. The React layer is a thin view over it.

### Solver (`src/puzzle-solver.ts`) — pure logic, no React

- Defines two puzzle layouts via ASCII string grids in `puzzleByType`:
  - `DEFAULT` — 7×7 grid, 8 pieces
  - `STANDARD` — 8×7 grid, 10 pieces
- Pieces are defined as ASCII masks (`items`); `x` is a filled square, `.` empty. `computeItemMasks` generates all 8 orientations (4 rotations × flip) and dedupes them with `uniqBy`.
- `buildBoard(type, date)` returns the wall layout as a `Board` (`"x"` = blocked/wall/date cell, `"."` = free).
- `solve(type, board)` runs a recursive DFS backtracking search over that board (mutating it in place, restoring on return) and returns up to 10 `{ index, maskIndex }` solutions for `STANDARD` (unbounded for `DEFAULT`).
- `formatSolution(type, solution)` renders a solution back into a `Board` — a 2D grid where `null` = wall, `"."` = empty, and a piece's item-index string = occupied by that piece.
- `getDateCells(type, date)` is the single source of truth for where the month/day/weekday labels sit on the board.

### React view (`src/App/`)

- `App.tsx` → `component/Board` → `useBoard` hook (all state) + `component/Cell` / `component/Button` presentational components. Styles are CSS Modules (`*.module.scss`).
- `useBoard.tsx` owns the app state: puzzle `type`, `selectedDate`, the list of `solutions`, and the current `count` (which solution to display). It re-runs the solver via `useEffect` whenever `type` or `selectedDate` changes.
- `Board/index.tsx` renders the fixed calendar grid by mapping flat cell indices onto the board: months (index 0–11), days 1–31 (index 12–42), then weekdays (index 43–49, `STANDARD` only).

### Coordinate conventions to be aware of

- Column/row arithmetic is driven by `puzzleDimensions[type]` (`ROWS`/`COLS`), passed into `placeOrRemove`/`canPlace`/`solve`. Both puzzle types are 7 columns wide today.
- Date → cell mapping lives in `getDateCells(type, date)` (in `puzzle-solver.ts`) and is the single source of truth. The index-based mapping in `useBoard.updateDate` and the rendering offsets in `Board/index.tsx` must stay consistent with it — they map the same flat cell indices (months 0–11, days 12–42, weekdays 43–49 for `STANDARD`).
- `Cell` colors each piece by its item index via a hardcoded `colors` map (index → hex) in `component/Cell/index.tsx`.

## Deployment

`vite.config.ts` sets `base: "/daily-calendar-puzzle-solver/"`, so the app is served from a GitHub Pages subpath. `npm run deploy` publishes the `dist/` folder via `gh-pages`.
