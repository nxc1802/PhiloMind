# API Reference

Last controller audit: 2026-07-06.

Base URL in local development: `http://localhost:3001/api`.

Root health endpoints are outside the `/api` prefix:

| Method | Path      | Auth   | Notes                             |
| ------ | --------- | ------ | --------------------------------- |
| `GET`  | `/`       | Public | Backend service health payload.   |
| `GET`  | `/health` | Public | Minimal container health payload. |

Swagger is available at `/docs` when `NODE_ENV !== "production"` or `ENABLE_SWAGGER=true`. Use Swagger as the live source for DTO fields and response schemas; this file is a stable endpoint inventory.

## Auth Rules

- Public: auth entrypoints.
- JWT required: most application endpoints.
- Admin role required: create/update/delete operations and admin-only list/detail views.
- Debate message and podcast synthesize endpoints are throttled at 5 requests per minute per route decorator.

## Authentication and Users

| Method   | Path                 | Auth           | Purpose                                     |
| -------- | -------------------- | -------------- | ------------------------------------------- |
| `POST`   | `/api/auth/register` | Public         | Register local student account.             |
| `POST`   | `/api/auth/login`    | Public         | Login local account and return JWT.         |
| `POST`   | `/api/auth/google`   | Public         | Login with Google ID token.                 |
| `POST`   | `/api/auth/supabase` | Public         | Login with Supabase JWT.                    |
| `GET`    | `/api/users`         | Admin          | List users with optional `take` and `skip`. |
| `GET`    | `/api/users/:id`     | Owner or admin | Get one user.                               |
| `PUT`    | `/api/users/:id`     | Admin          | Update user fields.                         |
| `DELETE` | `/api/users/:id`     | Admin          | Delete user.                                |
| `POST`   | `/api/feedbacks`     | JWT            | Submit feedback for current user.           |
| `GET`    | `/api/feedbacks`     | Admin          | List feedback.                              |

## Courses, Chapters, Nodes, Documents, Files

| Method   | Path                                            | Auth  | Purpose                                               |
| -------- | ----------------------------------------------- | ----- | ----------------------------------------------------- |
| `POST`   | `/api/courses`                                  | Admin | Create course.                                        |
| `GET`    | `/api/courses`                                  | JWT   | List current user's courses; admin may pass `userId`. |
| `GET`    | `/api/courses/:id`                              | Admin | Get course details.                                   |
| `PUT`    | `/api/courses/:id`                              | Admin | Update course.                                        |
| `DELETE` | `/api/courses/:id`                              | Admin | Delete course.                                        |
| `POST`   | `/api/courses/:id/upload`                       | Admin | Process uploaded text content into roadmap structure. |
| `GET`    | `/api/courses/:id/journey`                      | JWT   | Get course journey roadmap for current user.          |
| `GET`    | `/api/courses/nodes/:nodeId`                    | JWT   | Get full concept node learning details.               |
| `GET`    | `/api/courses/nodes/:nodeId/core`               | JWT   | Get lightweight node progress/type info.              |
| `POST`   | `/api/courses/nodes/:nodeId/complete`           | JWT   | Mark node completed and unlock next node.             |
| `PATCH`  | `/api/courses/nodes/:nodeId/progress`           | JWT   | Update node-level progress booleans/status.           |
| `PATCH`  | `/api/courses/nodes/:nodeId/component-progress` | JWT   | Update component-level active index/results.          |
| `POST`   | `/api/nodes`                                    | Admin | Create concept node.                                  |
| `GET`    | `/api/nodes`                                    | Admin | List nodes, optionally `chapterId`.                   |
| `PUT`    | `/api/nodes/:nodeId`                            | Admin | Update concept node.                                  |
| `DELETE` | `/api/nodes/:nodeId`                            | Admin | Delete concept node.                                  |
| `POST`   | `/api/chapters`                                 | Admin | Create chapter.                                       |
| `GET`    | `/api/chapters`                                 | JWT   | List chapters, optionally `courseId`.                 |
| `GET`    | `/api/chapters/:id`                             | Admin | Get chapter details.                                  |
| `PUT`    | `/api/chapters/:id`                             | Admin | Update chapter.                                       |
| `DELETE` | `/api/chapters/:id`                             | Admin | Delete chapter.                                       |
| `POST`   | `/api/documents`                                | Admin | Save document reference.                              |
| `GET`    | `/api/documents`                                | JWT   | List document references, optionally `courseId`.      |
| `DELETE` | `/api/documents/:id`                            | Admin | Delete document reference.                            |
| `POST`   | `/api/files/upload`                             | Admin | Upload arbitrary file to storage.                     |
| `POST`   | `/api/files/lesson-assets/upload`               | Admin | Upload image asset for lesson flow.                   |
| `POST`   | `/api/files/lesson-videos/upload`               | Admin | Upload video file to YouTube.                         |
| `POST`   | `/api/files/lesson-videos/url`                  | Admin | Store external lesson video URL reference.            |

Learner node detail/progress/complete endpoints only allow nodes where `contentReady === true` and `lessonStatus === "published"`; admin node CRUD under `/api/nodes` remains the draft authoring surface.

## Warmups and Comments

| Method   | Path                                  | Auth  | Purpose                           |
| -------- | ------------------------------------- | ----- | --------------------------------- |
| `POST`   | `/api/nodes/:nodeId/warmups`          | Admin | Create node warmup.               |
| `GET`    | `/api/nodes/:nodeId/warmups`          | JWT   | List node warmups.                |
| `DELETE` | `/api/warmups/:id`                    | Admin | Delete warmup.                    |
| `POST`   | `/api/courses/nodes/:nodeId/comments` | JWT   | Add node comment as current user. |
| `GET`    | `/api/courses/nodes/:nodeId/comments` | JWT   | List node comments.               |

## Podcasts and TTS

| Method   | Path                       | Auth             | Purpose                                    |
| -------- | -------------------------- | ---------------- | ------------------------------------------ |
| `GET`    | `/api/podcasts`            | Admin            | List podcasts.                             |
| `GET`    | `/api/podcasts/:id`        | Admin            | Get podcast details.                       |
| `POST`   | `/api/podcasts`            | Admin            | Create podcast manually.                   |
| `PUT`    | `/api/podcasts/:id`        | Admin            | Update podcast.                            |
| `DELETE` | `/api/podcasts/:id`        | Admin            | Delete podcast.                            |
| `POST`   | `/api/podcasts/synthesize` | Admin, throttled | Generate preview audio through TTS worker. |

TTS worker direct endpoints:

| Method | Path                  | Auth                          | Purpose                                                        |
| ------ | --------------------- | ----------------------------- | -------------------------------------------------------------- |
| `GET`  | `/health`             | Public                        | TTS worker health and engine state.                            |
| `POST` | `/api/tts/synthesize` | Public inside worker boundary | Return WAV audio for `{ "text": "...", "voice": "af_bella" }`. |

## Flashcards

| Method   | Path                                 | Auth  | Purpose                                               |
| -------- | ------------------------------------ | ----- | ----------------------------------------------------- |
| `GET`    | `/api/flashcards/due`                | JWT   | List due cards for current user; optional `courseId`. |
| `POST`   | `/api/flashcards/review`             | JWT   | Submit review score.                                  |
| `POST`   | `/api/flashcards`                    | Admin | Create flashcard.                                     |
| `GET`    | `/api/flashcards`                    | JWT   | List flashcards, optionally `nodeId`.                 |
| `GET`    | `/api/flashcards/:id`                | Admin | Get flashcard details.                                |
| `PUT`    | `/api/flashcards/:id`                | Admin | Update flashcard.                                     |
| `DELETE` | `/api/flashcards/:id`                | Admin | Delete flashcard.                                     |
| `POST`   | `/api/flashcards/nodes/:nodeId/bulk` | Admin | Bulk import flashcards for a node.                    |

## Quizzes

| Method   | Path               | Auth  | Purpose                            |
| -------- | ------------------ | ----- | ---------------------------------- |
| `POST`   | `/api/quizzes`     | Admin | Create quiz/game.                  |
| `GET`    | `/api/quizzes`     | JWT   | List quizzes, optionally `nodeId`. |
| `GET`    | `/api/quizzes/:id` | JWT   | Get quiz details.                  |
| `PUT`    | `/api/quizzes/:id` | Admin | Update quiz.                       |
| `DELETE` | `/api/quizzes/:id` | Admin | Delete quiz.                       |

## Debate

| Method   | Path                                  | Auth           | Purpose                                                |
| -------- | ------------------------------------- | -------------- | ------------------------------------------------------ |
| `GET`    | `/api/debates/topics`                 | JWT            | List debate topics.                                    |
| `POST`   | `/api/debates/topics`                 | Admin          | Create topic.                                          |
| `PUT`    | `/api/debates/topics/:id`             | Admin          | Update topic.                                          |
| `DELETE` | `/api/debates/topics/:id`             | Admin          | Delete topic.                                          |
| `GET`    | `/api/debates/topic/:topicId`         | JWT            | Get or initialize topic debate.                        |
| `POST`   | `/api/debates/topic/:topicId/message` | JWT, throttled | Send topic debate message and receive rebuttal.        |
| `GET`    | `/api/debates/all`                    | Admin          | List all debate sessions.                              |
| `GET`    | `/api/debates/:nodeId`                | JWT            | Get or initialize concept-node debate.                 |
| `POST`   | `/api/debates/:nodeId/message`        | JWT, throttled | Send concept-node debate message and receive rebuttal. |
| `DELETE` | `/api/debates/:id`                    | Admin          | Delete debate session.                                 |

## Philosofun

| Method   | Path                  | Auth  | Purpose            |
| -------- | --------------------- | ----- | ------------------ |
| `POST`   | `/api/philosofun`     | Admin | Create video item. |
| `GET`    | `/api/philosofun`     | JWT   | List videos.       |
| `GET`    | `/api/philosofun/:id` | JWT   | Get video item.    |
| `PUT`    | `/api/philosofun/:id` | Admin | Update video item. |
| `DELETE` | `/api/philosofun/:id` | Admin | Delete video item. |
