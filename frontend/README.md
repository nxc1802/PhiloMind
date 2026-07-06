# PhiloMind Learner Frontend

React/Vite learner application for course journey, lesson player, practice, Socratic debate, Philosofun, docs, and settings.

## Scripts

```bash
npm install
npm run start
npm run test -- --run
npm run build
```

Default local URL: `http://localhost:3000`.

## Environment

```bash
REACT_APP_API_URL="http://localhost:3001/api"
REACT_APP_SUPABASE_URL="https://your-project.supabase.co"
REACT_APP_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

The app uses Vite but keeps `REACT_APP_*` env names for compatibility with the existing code.

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Home dashboard. |
| `/lessons` | Course mindmap and component-based lesson player. |
| `/practice` | Practice hub. |
| `/practice/shinkei/:id` | Flashcard memory game. |
| `/debate` | Socratic debate. |
| `/philosofun` | Philosophy video content. |
| `/docs` | In-app reference page. |
| `/settings` | User settings. |
| `/quiz/*` and `/image-quiz/:id` | Specialized quiz screens. |

## Important Files

| Path | Purpose |
|---|---|
| `src/App.js` | Route map and auth-protected page wrapper. |
| `src/services/api.js` | Fetch client with JWT headers. |
| `src/services/queryKeys.js` | React Query key factory. |
| `src/hooks/` | Journey, node detail, progress, comment, debate, and flashcard mutations. |
| `src/pages/Lesson.jsx` | Journey and lesson player entrypoint. |
| `src/pages/lesson/flow/` | Component-based lesson runtime. |

## Docs

Lesson component details live in `../docs/LESSON_COMPONENTS.md`.
