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
