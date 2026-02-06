# Octo Search

GitHub search application built with Next.js, Redux Toolkit, and Axios.

## Requirements

- Node.js: 24.13.x (via `.nvmrc`)
- npm: 11.6.x
- Bun: 1.2.21

## Environment

Optional GitHub token for higher rate limits (server-side only):

```
GITHUB_TOKEN=
```

Optional API base override:

```
GITHUB_API_BASE=https://api.github.com
```

You can copy `.env.example` to `.env.local`.

## Setup

```bash
nvm use

bun install
```

## Scripts

```bash
bun dev
bun run build
bun run start
bun run lint
bun run format:check
bun run format:write
```

## Tooling

- Redux Toolkit + RTK Query for state and data fetching.
- Axios used in RTK Query base query.
- ESLint + Prettier with standard settings.
- Theme toggle using `next-themes` (system/light/dark).
- Husky hooks:
  - `pre-commit`: `bun run lint` and `bun run format:check`
  - `pre-push`: `bun run build`
  - `commit-msg`: commit message linting

## Folder Structure

```
app/
  layout.tsx
  page.tsx
  providers.tsx
  globals.css

  (marketing)/
    layout.tsx

  (search)/
    page.tsx

  users/
    [login]/
      page.tsx

  repos/
    [owner]/
      [repo]/
        page.tsx

components/
  search/
  ui/

features/
  github/
    api.ts
    types.ts
    selectors.ts

lib/
  github/
    client.ts
  utils/

store/
  store.ts
  hooks.ts
```

## Why This Structure Works For SSR/SSG

- `app/` contains route segments, which is where SSR and SSG/ISR are defined in the App Router.
- Feature code lives under `features/` so API, types, and selectors stay grouped and reusable across routes.
- `store/` is centralized to avoid coupling Redux setup to route files.
- `lib/` keeps pure utilities and GitHub client helpers decoupled from React.
- `components/` is split by domain (`search`) and generic UI (`ui`) to keep server components thin and reuse client components where needed.

## API Layer Placement

API concerns are split for clarity:

- `lib/github/client.ts` owns the Axios client and base query (pure service layer).
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
