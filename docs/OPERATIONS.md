# Operations

Last code audit: 2026-07-06.

This file replaces the old Supabase setup, DB pooling, deployment, security, and production checklist docs.

## Environment Files

Templates:

- Root stack: `.env.example`
- Backend only: `backend/.env.example`
- Learner frontend: `frontend/.env.example`
- Admin frontend: `admin/.env.example`

Core backend variables:

| Variable                    |                              Required | Notes                                                                           |
| --------------------------- | ------------------------------------: | ------------------------------------------------------------------------------- |
| `DATABASE_URL`              |                                   Yes | PostgreSQL URL. On hosted Supabase, prefer transaction pooler URL.              |
| `JWT_SECRET`                |                            Production | Backend throws in production if missing.                                        |
| `GOOGLE_CLIENT_ID`          |                 If using Google login | Used by backend Google ID token validation.                                     |
| `ALLOWED_ORIGINS`           |                            Production | Comma-separated frontend/admin origins for CORS.                                |
| `ENABLE_SWAGGER`            |                              Optional | `true` exposes Swagger in production.                                           |
| `SUPABASE_URL`              |                     If using Supabase | Supabase project URL.                                                           |
| `SUPABASE_ANON_KEY`         | If using Supabase Auth/client storage | Public anon key.                                                                |
| `SUPABASE_SERVICE_ROLE_KEY` |                      Server-side only | Used by backend/server-side storage and seed helpers. Never expose to frontend. |
| `OPENAI_API_KEY`            |                      If using real AI | AI service has mock fallback when absent.                                       |
| `OPENAI_API_BASE_URL`       |                              Optional | Defaults to OpenRouter-compatible URL.                                          |
| `LLM_MODEL`                 |                              Optional | Defaults to `meta-llama/llama-3-70b-instruct:free`.                             |
| `TTS_WORKER_URL`            |                              Optional | Defaults to local worker.                                                       |

Prisma and DB load variables:

| Variable                         |    Default | Notes                                                                   |
| -------------------------------- | ---------: | ----------------------------------------------------------------------- |
| `PRISMA_CONNECTION_LIMIT`        |  `5` local | Lower this for small hosted DB pools.                                   |
| `PRISMA_POOL_TIMEOUT`            | `60` local | Runtime URL normalization applies safe values for Supabase pooler URLs. |
| `PRISMA_CONNECT_TIMEOUT`         | `30` local | Runtime URL normalization applies safe values for Supabase pooler URLs. |
| `PRISMA_TRANSACTION_MAX_WAIT_MS` |    `20000` | Transaction wait limit.                                                 |
| `PRISMA_TRANSACTION_TIMEOUT_MS`  |    `60000` | Transaction runtime limit.                                              |
| `DB_QUERY_CONCURRENCY`           |        `5` | Backend query limiter.                                                  |
| `DB_QUEUE_TIMEOUT_MS`            |    `30000` | Query queue timeout.                                                    |

Frontend variables:

| Variable                      | Used by            | Notes                                                        |
| ----------------------------- | ------------------ | ------------------------------------------------------------ |
| `REACT_APP_API_URL`           | Frontend and admin | Vite embeds this name even though it has the old CRA prefix. |
| `REACT_APP_SUPABASE_URL`      | Learner frontend   | Used for Supabase client/OAuth.                              |
| `REACT_APP_SUPABASE_ANON_KEY` | Learner frontend   | Public anon key only.                                        |

## Local Stack

```bash
cp .env.example .env
docker compose up --build
```

Default local ports:

| Service    |   Port |
| ---------- | -----: |
| Frontend   | `3000` |
| Backend    | `3001` |
| Admin      | `3002` |
| TTS worker | `8000` |
| PostgreSQL | `5432` |

Backend database setup when running manually:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

Seed command:

```bash
cd backend
npm run prisma:seed
```

Do not assume seed state from docs. Verify against the database when content readiness matters.

## Supabase and Postgres Pooling

For hosted Supabase/Postgres deployments:

- Use the Supabase transaction pooler URL for `DATABASE_URL` on public backend services.
- Keep `replicas * PRISMA_CONNECTION_LIMIT` below the effective DB pool size.
- `backend/src/database/prisma.service.ts` normalizes Supabase pooler URLs at runtime and adds safe defaults when needed.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Prefer RLS for tables exposed through Supabase Data API; do not treat backend Prisma authorization as a substitute for public Data API access control.

Recommended production starting point for small Supabase pools:

```bash
PRISMA_CONNECTION_LIMIT=1
PRISMA_POOL_TIMEOUT=30
PRISMA_CONNECT_TIMEOUT=30
DB_QUERY_CONCURRENCY=3
DB_QUEUE_TIMEOUT_MS=30000
```

Adjust only after checking actual traffic and pool capacity.

## Deployment

Current workflows:

| Workflow                               | Trigger                                       | Target                                                                    |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`             | Push/PR to `main` or `master`                 | Backend tests/audit, frontend tests/build/audit, admin tests/build/audit. |
| `.github/workflows/deploy_backend.yml` | Backend path changes on `main` or `master`    | Hugging Face Space `Cuong2004/PhiloMind`.                                 |
| `.github/workflows/deploy_tts.yml`     | TTS worker path changes on `main` or `master` | Hugging Face Space `Cuong2004/PhiloMind_TTSworker`.                       |

Backend listens on `7860` when `SPACE_ID` is present for Hugging Face Spaces; otherwise it uses `PORT` or `3001`.

TTS worker reads `PORT` and defaults to `8000` locally. Hugging Face Spaces should run HTTP containers on `7860`.

Frontend deployment is expected to build the `frontend/` Vite app with `dist` output. Admin deployment builds `admin/` similarly.

Required deployment secrets/config:

- GitHub secret `HF_TOKEN` for Hugging Face deployment workflows.
- Backend production env: `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, Supabase keys as needed, AI/TTS vars as needed.
- Frontend production env: `REACT_APP_API_URL`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`.
- Admin production env: `REACT_APP_API_URL`.

## Security Checklist

Before production deploy:

- Rotate any secret that has been pasted into logs, docs, or local screenshots.
- Use a strong `JWT_SECRET`; never reuse local/dev values.
- Keep `SUPABASE_SERVICE_ROLE_KEY` out of browser builds.
- Keep `ALLOWED_ORIGINS` explicit. Do not use `*` for credentialed production traffic.
- Leave `ENABLE_SWAGGER=false` in production unless access is intentionally controlled.
- Check admin-only endpoints with a non-admin JWT.
- Check user-owned endpoint behavior with another user's ID.
- For Supabase-exposed tables, verify RLS policies and role grants separately from Prisma behavior.
- Keep lockfiles committed and use `npm ci` in CI/deploy.

## Post-Deploy Smoke Check

Run these after backend, frontend, admin, and TTS deploys:

- `GET /health` on backend returns healthy.
- Swagger availability matches `ENABLE_SWAGGER`.
- Login works for local account and configured OAuth/Supabase path.
- Learner `/lessons` loads journey and blocks unpublished lessons.
- Direct learner node-detail/progress/complete API calls reject unpublished lessons.
- A published lesson opens, renders media and a right-column component, then writes component progress.
- Completing a lesson unlocks or moves to the next available lesson.
- Admin `/nodes` can save a valid `lessonFlow` and rejects invalid JSON/component shapes.
- Admin cannot publish a lesson with an empty `lessonFlow`.
- Upload image asset and video URL flows return usable URLs.
- Podcast synthesize returns an audio URL or expected fallback behavior.
- Flashcard due/review flow updates review schedule.
- Debate message endpoint returns a response and honors throttling.

## Verification Commands

```bash
cd backend && npm run test -- --runInBand
cd frontend && npm run test -- --run && npm run build
cd admin && npm run test -- --run && npm run build
```
