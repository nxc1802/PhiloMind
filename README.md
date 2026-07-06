---
title: PhiloMind
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

# PhiloMind

PhiloMind is a monorepo for an AI-assisted philosophy learning product. It turns a linear course into a guided journey with a learner frontend, an admin portal, a NestJS API, PostgreSQL/Supabase storage, AI-assisted debate and podcast generation, flashcards, quizzes, and a FastAPI TTS worker.

This repository should be read from the current code first. Historical proposal files, old frontend optimization reports, and copied lesson code dumps were removed because they no longer matched the running architecture.

## Services

| Service | Path | Stack | Default port | Role |
|---|---|---:|---:|---|
| Learner frontend | `frontend/` | React 18, Vite, Tailwind, TanStack Query | `3000` | Student-facing journey, lesson player, practice, debate, settings |
| Admin portal | `admin/` | React 18, Vite, Tailwind | `3002` | CRUD for users, courses, nodes, practice content, debates, Philosofun |
| Backend API | `backend/` | NestJS 11, Prisma, PostgreSQL, Supabase JS | `3001` or `7860` on Hugging Face | Auth, roadmap, lesson flow, progress, AI, storage, TTS proxy |
| TTS worker | `tts_worker/` | FastAPI, Kokoro ONNX, fallback WAV generator | `8000` or `7860` on Hugging Face | Text-to-speech synthesis for podcast previews |
| Local DB | `docker-compose.yml` | PostgreSQL 15 with pgvector image | `5432` | Local development database |

## Canonical Docs

Start here:

- [Project overview](docs/PROJECT_OVERVIEW.md) - current architecture, modules, data model, and major flows.
- [API reference](docs/API.md) - current endpoint inventory generated from controller inspection; use Swagger `/docs` for live schemas.
- [Lesson components](docs/LESSON_COMPONENTS.md) - detailed `lessonFlow`, `lessonMedia`, renderer, validator, progress, and authoring contract.
- [Operations](docs/OPERATIONS.md) - environment variables, local setup, Supabase/Postgres pooling, deployment, security, and post-deploy checks.
- [Design system](docs/DESIGN_SYSTEM.md) - current product UX principles and frontend layout conventions.

Module docs:

- [Backend](backend/README.md)
- [Learner frontend](frontend/README.md)
- [Admin portal](admin/README.md)
- [TTS worker](tts_worker/README.md)

## Local Development

Copy the root env template and fill real secrets:

```bash
cp .env.example .env
```

Run the full local stack:

```bash
docker compose up --build
```

Run services manually when debugging a single layer:

```bash
cd backend && npm install && npx prisma generate && npm run start:dev
cd frontend && npm install && npm run start
cd admin && npm install && npm run start
cd tts_worker && pip install -r requirements.txt && python main.py
```

The backend API uses global prefix `/api`. Root health endpoints are outside the prefix: `/` and `/health`. Swagger is available at `/docs` outside production, or when `ENABLE_SWAGGER=true`.

## Verification

Common checks:

```bash
cd backend && npm run test -- --runInBand
cd frontend && npm run test -- --run && npm run build
cd admin && npm run test -- --run && npm run build
```

CI runs backend tests plus frontend/admin test and build verification on GitHub Actions.
