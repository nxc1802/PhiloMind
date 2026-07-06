# PhiloMind Admin Portal

React/Vite admin application for managing PhiloMind content and operations.

## Scripts

```bash
npm install
npm run start
npm run test -- --run
npm run build
```

Default local URL: `http://localhost:3002`.

## Environment

```bash
REACT_APP_API_URL="http://localhost:3001/api"
```

The app uses Vite but keeps `REACT_APP_*` env names for compatibility with the existing code.

## Main Screens

| Route | Purpose |
|---|---|
| `/login` | Admin login. |
| `/` | Dashboard. |
| `/users` | User CRUD. |
| `/courses` | Course CRUD. |
| `/nodes` | Chapter/node authoring, lesson flow JSON, assets, warmups, flashcards, quizzes, podcasts, and documents. |
| `/practice` | Practice content management. |
| `/debates` | Debate topic/session management. |
| `/philosofun` | Philosofun video management. |

## Notes

- All protected API calls attach the JWT stored in `localStorage.token`.
- Admin-only actions require a backend user with role `admin`.
- Lesson component details are documented in `../docs/LESSON_COMPONENTS.md`.
