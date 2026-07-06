# PhiloMind Documentation Index

These are the canonical docs for the current repository state.

| File | Purpose |
|---|---|
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Current service architecture, module boundaries, database model, frontend routes, admin scope, and major runtime flows. |
| [API.md](API.md) | Current REST endpoint inventory based on NestJS controllers. Use backend Swagger `/docs` for live DTO and response schemas. |
| [LESSON_COMPONENTS.md](LESSON_COMPONENTS.md) | Dedicated contract for the component-based lesson system: JSON schema, validators, renderers, media, progress, and authoring checklist. |
| [OPERATIONS.md](OPERATIONS.md) | Environment variables, local setup, Supabase/Postgres pooling, deployment, security, and post-deploy smoke checks. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Current UI/UX principles and frontend layout conventions. |

Removed legacy docs:

- Project proposal and broad analysis docs were replaced by `PROJECT_OVERVIEW.md`.
- Old lesson analysis and copied MLN_FE lesson source dump were replaced by `LESSON_COMPONENTS.md`.
- Old deployment, Supabase setup, security checklist, production checklist, and DB pooling notes were merged into `OPERATIONS.md`.
- Old API Markdown and its hardcoded generator were replaced by `API.md` plus live Swagger.
- Old frontend optimization report was removed because it described a prior app snapshot rather than this Vite/Tailwind codebase.
