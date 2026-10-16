# PhonePe Recharge

## Backend database: PostgreSQL

The Express backend (`server/`) stores everything in **PostgreSQL** (via the `pg` package).
Tables are created automatically on first start and default providers/plans/settings are seeded.

```bash
cp .env.example .env        # then set DATABASE_URL
npm install
npm run dev:all             # API on :5001 + Vite dev server
npm run setup-admin         # optional: create/reset the owner account
```

On Render (or any host), add `DATABASE_URL` to the backend service's environment variables.

### Moving existing SQLite data (one time)

```bash
npm install --no-save better-sqlite3      # only for this script, package.json is not changed
npm run migrate:sqlite                    # reads server/data/database.sqlite
# add -- --force to wipe the PostgreSQL tables first, or pass a path to another .sqlite file
```

## Deployment architecture (Vercel + Render + PostgreSQL)

- **Vercel** serves the static Vite build (`dist/`). It has **no serverless functions**:
  the project must NOT contain an `api/` directory.
- **Render** runs the Express backend (`npm start` -> `tsx server/index.ts`) and connects to PostgreSQL via `DATABASE_URL`.
- `vercel.json` rewrites `/api/*` to the Render service. Replace `YOUR-RENDER-SERVICE` in
  `vercel.json` with your real Render hostname. `npm run build` runs `scripts/check-vercel-config.mjs`
  first and **fails the build on Vercel** if the placeholder is still present or an `api/` folder exists.
- Required backend env vars on Render: `DATABASE_URL`, `JWT_SECRET` (see `.env.example`).
- Health check: `GET https://<render-host>/api/health`.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
