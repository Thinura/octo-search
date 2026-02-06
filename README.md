# Octo Search

GitHub search application built with Next.js, Redux Toolkit, and Axios.

## Requirements

- Node.js: 22.x (via `.nvmrc`)
- npm: 10.x
- Yarn: 4.12.x

## Setup

```bash
nvm use

yarn install
```

## Scripts

```bash
yarn dev
yarn build
yarn start
yarn lint
yarn format:check
yarn format:write
```

## Tooling

- Redux Toolkit + RTK Query for state and data fetching.
- Axios used in RTK Query base query.
- ESLint + Prettier with standard settings.
- Husky hooks:
  - `pre-commit`: `yarn lint` and `yarn format:check`
  - `pre-push`: `yarn build`
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
