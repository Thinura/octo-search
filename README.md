# Octo Search

GitHub search application built with Next.js (App Router), Redux Toolkit, and Axios.

## Setup

### Requirements

- Node.js `24.13.x` (via `.nvmrc`)
- npm `11.6.x`
- Bun `1.2.21`

### Environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Optional GitHub token for higher rate limits (server-side only):

```
GITHUB_TOKEN=
```

Optional API base override:

```
GITHUB_API_BASE=https://api.github.com
```

### Install

```bash
nvm use
bun install
```

### Run

```bash
bun dev
```

### Scripts

```bash
bun run build
bun run start
bun run lint
bun run format:check
bun run format:write
```

## Key Features Added

- Search for users, organizations, and repositories from the GitHub public API.
- Rich results UI (cards), infinite scroll, and manual “Load more”.
- Favorites with add/remove and a dedicated Favorites page.
- Dynamic detail pages for users, organizations, and repositories.
- Server-side GitHub API proxy with token support to avoid rate limits.
- Dark/light/system theme toggle.

## Architecture (Brief)

- **App Router** (`app/`) drives routing, metadata, and server rendering.
- **Client UI** lives in `components/`, with feature-specific UI under `components/search` and shared UI under `components/ui`.
- **Data layer** is split into `lib/` (Axios clients, server fetch helpers) and `features/` (Redux state, selectors, RTK Query).
- **Redux store** is centralized in `store/` to keep state concerns out of route files.

## Key Decisions

### Why Redux Toolkit

- Global, persistent cross-page state for Favorites.
- Predictable updates and selectors for UI composition.
- Extensible for future caching or cross-feature state.

### Axios Structure

- `lib/api/client.ts` is a reusable Axios client for app-level API calls (`/api/search`, `/api/profile-repos`).
- `lib/github/client.ts` is a dedicated Axios client for GitHub proxy calls and RTK Query base query.
- Centralized interceptors keep headers and error handling consistent.

### SSR/SSG Choice (and Why)

- **SSR/ISR on detail pages** via `fetch` with `revalidate` to keep profiles fresh without re-building.
- **Client-side search** for responsiveness and live updates (avoids full page reloads per keystroke).
- App Router simplifies per-route caching and metadata generation.

### Component Paths (Why)

- `components/search/` contains search-specific UI (cards, shells, results).
- `components/favorites/` contains favorites-specific UI.
- `components/ui/` contains shared primitives.
- This keeps server components thin and client components reusable.

## Folder Structure

```
app/
  layout.tsx
  providers.tsx
  globals.css

  (search)/
    page.tsx

  users/
    [username]/
      page.tsx

  organizations/
    [username]/
      page.tsx

  repositories/
    [owner]/
      [repo]/
        page.tsx

  repos/
    [owner]/
      [repo]/
        page.tsx

components/
  search/
  favorites/
  ui/

features/
  github/
    api.ts
    types.ts
    selectors.ts

lib/
  api/
  github/
    client.ts
  utils/

store/
  store.ts
  hooks.ts
```

### Folder Structure Explained

- `app/`: Route segments, server components, metadata, and API routes (App Router). Each folder maps to a URL segment.
- `components/`: Client UI building blocks. Domain UI lives in `search/` and `favorites/`, while shared primitives live in `ui/`.
- `features/`: Feature-scoped Redux/RTK Query code (API, types, selectors) to keep data logic close to the domain.
- `lib/`: Pure utilities and clients (`api/` for app API calls, `github/` for GitHub proxy + base query).
- `store/`: Centralized Redux setup and hooks, keeping route files clean.

## Why This Structure Works For SSR/SSG

- `app/` contains route segments, which is where SSR and SSG/ISR are defined in the App Router.
- Feature code lives under `features/` so API, types, and selectors stay grouped and reusable across routes.
- `store/` is centralized to avoid coupling Redux setup to route files.
- `lib/` keeps pure utilities and GitHub client helpers decoupled from React.
- `components/` is split by domain (`search`) and generic UI (`ui`) to keep server components thin and reuse client components where needed.

## API Layer Placement

API concerns are split for clarity:

- `lib/api/client.ts` owns a reusable Axios client for app endpoints.
- `lib/github/client.ts` owns the Axios client and RTK Query base query for GitHub proxy.
- `features/github/api.ts` defines RTK Query endpoints using the shared client.
- `app/api/github/[...path]/route.ts` is a server-side proxy that attaches the GitHub token.

This keeps networking reusable across features while letting Redux remain feature-scoped.

## Commit Message Format

Conventional Commits are enforced.

```text
type(optional-scope): short summary
```

Examples:

```text
feat: add github user search
fix: handle empty query
chore: update eslint config
```
