# Lesson Components

Last code audit: 2026-07-06.

This is the canonical documentation for the component-based lesson system. It replaces the old broad lesson analysis and copied lesson source dump.

## Source of Truth

Runtime files:

- Backend validator: `backend/src/courses/validators/node-schema.validator.ts`
- Backend DTOs: `backend/src/courses/dto/create-node.dto.ts`, `backend/src/courses/dto/update-node.dto.ts`, `backend/src/courses/dto/update-component-progress.dto.ts`
- Backend persistence: `backend/src/courses/courses.service.ts`
- Prisma fields: `backend/prisma/schema.prisma`
- Admin authoring: `admin/src/pages/Nodes.jsx`
- Learner entry: `frontend/src/pages/Lesson.jsx`
- Flow player: `frontend/src/pages/lesson/flow/FlowLessonPlayer.jsx`
- Right-column renderer switch: `frontend/src/pages/lesson/components/RightInteractive.jsx`
- Component registry: `frontend/src/pages/lesson/flow/components/componentRegistry.js`
- Flow utilities: `frontend/src/pages/lesson/flow/utils/normalizeFlow.js`, `normalizeOptions.js`

## Data Model

`ConceptNode` stores lesson content:

| Field | Type | Purpose |
|---|---|---|
| `lessonFlow` | JSON array | Ordered top-level lesson components. |
| `lessonMedia` | JSON array or null | Optional media items for the center column. |
| `lessonType` | string | Currently written as `flow` by create/update. |
| `contentReady` | boolean | Learner can open only when true and published. |
| `lessonStatus` | string | `draft`, `published`, or `archived`. |

`Progress` stores per-user runtime state:

| Field | Purpose |
|---|---|
| `status` | `locked`, `available`, `in_progress`, or `completed`. |
| `lessonCompleted` | Node-level lesson completion flag. |
| `activeComponentId` | Component id to resume. |
| `currentComponentIndex` | Top-level flow index to resume. |
| `completedComponentIds` | JSON array of completed top-level component ids. |
| `componentResults` | JSON array of latest result per component id. |

## Availability Rules

The learner UI treats a node as content-locked unless both are true:

```js
node.contentReady === true
node.lessonStatus === "published"
```

Admin create/update may save drafts. Learner journey and syllabus mapping prevent opening unpublished or not-ready nodes.

## Component Shape

Every top-level item in `lessonFlow` must be a JSON object:

```json
{
  "id": "unique-step-id",
  "type": "markdown",
  "title": "Tên bước",
  "linkedMediaId": "optional-media-id",
  "config": {},
  "completionRule": { "type": "viewed" }
}
```

Required common fields:

- `id`: non-empty string, unique across the whole flow, including children inside `component_group`.
- `type`: one supported component type.
- `config`: JSON object.

Optional common fields:

- `title`: display title for most renderers.
- `linkedMediaId` or `linked_media_id`: switches the center media while this component is active.
- `completionRule.type`: currently accepted by validator as a non-empty string; renderer behavior is still driven by each component's UI.
- `media`: optional inline media metadata used by some component renderers.

## Supported Types

The backend validator and frontend registry currently support:

| Type | Required config | Runtime behavior |
|---|---|---|
| `component_group` | `components[]` | Renders child components as one learner-facing group. Children cannot be another `component_group`. Default `revealMode` is `sequential`; default `completionMode` is `all`. Saves `childResults` when complete. |
| `dialogue` | `lines[]`, each line needs `text` | Uses dialogue renderer; `dialogs` is also accepted by the frontend for legacy data. |
| `media` | `url` | Accepted for backwards compatibility. Flow player extracts it into center media; right column asks learner to confirm they watched/read it. |
| `markdown` | `content` | Renders Markdown-like learning text and continues on acknowledgement. |
| `target_matching` | `targets[]`, `items[]` | Learner matches items to targets; returns a score/result. |
| `category_sorting` | `categories[]`, `cards[]` | Learner sorts cards into categories. |
| `mindmap_reveal` | `nodes[]` | Reveals concept cards. Each node needs `id` and either legacy `label`/`detail` or new `front`/`back`. Optional `layoutConfig.type`: `vertical`, `horizontal`, `matrix`, `custom`. |
| `mcq` | `question`, `options[]`, at least one correct option | Single-question multiple choice. Correct options can use `isCorrect: true` or `correct: true`. |
| `quiz_sequence` | `questions[]` | Multi-question sequence. Each question needs `question` or `prompt`, `options[]`, and either `correctIndex` or a correct option flag. |
| `multi_select` | `question`, `options[]`, at least one correct option | Multi-answer question. |
| `matching_columns` | `leftColumn[]`, `rightColumn[]`, `correctPairs[]` | Drag/match left and right columns. |
| `true_false` | `statement`, boolean `correctAnswer` | Binary true/false question. |
| `sequence_sorting` | `items[]` | Learner orders items into the correct sequence. |
| `chain_sorting` | `items[]` | Guided ordering/chain activity; supports optional `instruction`, `successFeedback`, and `reward`. |
| `knowledge_piece` | `config.label` or component `title` | Short knowledge card; optional `takeaways[]`. |
| `final_summary` | none strictly required | Completion/summary screen; optional `message`, `keyTakeaways[]`, and `rewards`. |

## Media Model

Node-level `lessonMedia` is optional:

```json
[
  {
    "id": "intro-video",
    "type": "video",
    "url": "https://example.com/video.mp4",
    "title": "Video nhập môn",
    "subtitle": "5 phút",
    "alt": "Mô tả hình ảnh nếu là image",
    "description": "Gợi ý quan sát",
    "badge": "Video"
  }
]
```

Validation rules:

- `lessonMedia` must be an array when present.
- Each item needs unique `id`, `type`, and `url`.
- `type` must be `video` or `image`.

Flow player media behavior:

1. Start with `nodeDetails.lessonMedia`.
2. Extract legacy `media` components from `lessonFlow`.
3. Deduplicate by media id.
4. Use `linkedMediaId`/`linked_media_id` to switch active media per component.
5. Fall back to the first media item when no explicit media link exists.

Admin `Nodes.jsx` currently appends uploaded lesson images and videos as `media` components inside `lessonFlow`. Node-level `lessonMedia` is supported by backend/player even though the current admin UI does not expose it as a separate field.

## Runtime Lifecycle

1. Admin creates or edits a node in `/nodes`.
2. Admin saves `lessonFlow` JSON and readiness fields.
3. Backend validates `lessonFlow` with `NodeSchemaValidator.validateNode`.
4. Backend validates `lessonMedia` when provided.
5. Learner opens `/lessons?lesson=<slug>`.
6. `useJourney` loads the course roadmap and progress.
7. `useNodeDetails` loads full node detail.
8. `FlowLessonPlayer` normalizes flow, builds media list, chooses resume index, and renders the split player.
9. `RightInteractive` selects a renderer from `componentRegistry`.
10. Component completion calls `/api/courses/nodes/:nodeId/component-progress`.
11. Finishing the last component calls `/api/courses/nodes/:nodeId/complete`.
12. Backend marks the node complete and unlocks the next node.

## Progress Result Shape

On component completion, the frontend sends a `componentResult` similar to:

```json
{
  "componentId": "cognitive-shift-quiz",
  "type": "mcq",
  "status": "completed",
  "score": 100,
  "answer": "selected-option-id"
}
```

Backend upserts the `Progress` row, replaces any older result for the same `componentId`, and adds `completedAt` if missing.

For `component_group`, the result can include:

```json
{
  "componentId": "cognitive-turning-point",
  "type": "component_group",
  "status": "completed",
  "childResults": [
    { "componentId": "lyra-doubt", "type": "dialogue", "status": "completed" },
    { "componentId": "cognitive-shift-quiz", "type": "mcq", "score": 100 }
  ]
}
```

## Component Group Rules

Use `component_group` when a dialogue, question, reveal, or short activity should feel like one cohesive learning moment.

Example:

```json
{
  "id": "cognitive-turning-point",
  "type": "component_group",
  "title": "Một bước ngoặt nhận thức",
  "config": {
    "revealMode": "sequential",
    "completionMode": "all",
    "components": [
      {
        "id": "lyra-doubt",
        "type": "dialogue",
        "title": "Lyra đặt câu hỏi",
        "config": {
          "lines": [
            { "speaker": "Lyra", "text": "Nếu triết học bắt đầu từ ngạc nhiên, vậy điều gì làm ta thật sự phải nghĩ lại?" }
          ]
        }
      },
      {
        "id": "cognitive-shift-quiz",
        "type": "mcq",
        "title": "Kiểm tra nhận thức",
        "config": {
          "question": "Điều gì mở đầu tốt nhất cho tư duy triết học?",
          "options": [
            { "id": "a", "text": "Học thuộc kết luận", "isCorrect": false },
            { "id": "b", "text": "Đặt vấn đề với điều tưởng như hiển nhiên", "isCorrect": true }
          ],
          "explanation": "Tư duy triết học bắt đầu khi ta chất vấn nền tảng của điều quen thuộc."
        }
      }
    ]
  },
  "completionRule": { "type": "completed" }
}
```

Do not show the raw label "component group" to learners. The grouped UI should present the group title and child content as one page/box with a clear next action.

## Authoring Checklist

Before publishing a node:

- `lessonFlow` is valid JSON array.
- Every component and child component has a unique `id`.
- Every component has supported `type` and object `config`.
- MCQ/multi-select/quiz sequence questions include correct answers.
- `media` components and `lessonMedia` items have valid URLs.
- Child components inside `component_group` do not use `component_group`.
- `contentReady` is true only when the lesson is learner-ready.
- `lessonStatus` is `published` only when the node should appear as playable.
- Test the lesson from the learner UI, not only the admin JSON editor.
- If changing supported types, update validator, frontend registry, renderer exports, TypeScript schema docs, admin helper text, seed SQL, and this file together.
