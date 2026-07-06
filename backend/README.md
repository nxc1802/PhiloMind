# PhiloMind Backend

NestJS API server for auth, learning roadmap, lesson flow, progress, AI debate, flashcards, quizzes, podcast/TTS, storage, and admin CRUD.

## Scripts

```bash
npm install
npx prisma generate
npx prisma db push
npm run start:dev
npm run test -- --runInBand
npm run build
```

Default local URL: `http://localhost:3001`.

## Runtime

- Global API prefix: `/api`
- Health endpoints outside prefix: `/` and `/health`
- Swagger: `/docs` when not production or when `ENABLE_SWAGGER=true`
- Static upload serving: `/public/`
- Hugging Face Spaces port: `7860` when `SPACE_ID` is present

## Main Folders

| Path | Purpose |
|---|---|
| `src/main.ts` | App bootstrap, CORS, Helmet, validation, Swagger, static uploads. |
| `src/app.module.ts` | Module wiring. |
| `src/auth/` | JWT and role guards. |
| `src/users/` | Auth routes, users, feedback. |
| `src/courses/` | Courses, chapters, nodes, lesson flow, documents, comments, podcasts, uploads. |
| `src/flashcards/` | Flashcard CRUD and spaced repetition reviews. |
| `src/quizzes/` | Quiz CRUD. |
| `src/debate/` | Socratic debate topics and sessions. |
| `src/philosofun/` | Philosofun video CRUD. |
| `src/ai/` | OpenAI-compatible AI client. |
| `src/tts/` | TTS worker proxy and upload. |
| `src/supabase/` | Supabase client/storage helper. |
| `src/database/` | Prisma service and DB connection guards. |
| `prisma/schema.prisma` | Database schema. |

## Docs

- API inventory: `../docs/API.md`
- Operations/env/deploy: `../docs/OPERATIONS.md`
- Lesson component contract: `../docs/LESSON_COMPONENTS.md`
