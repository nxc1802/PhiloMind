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

| Field          | Type               | Purpose                                        |
| -------------- | ------------------ | ---------------------------------------------- |
| `lessonFlow`   | JSON array         | Ordered top-level lesson components.           |
| `lessonMedia`  | JSON array or null | Optional media items for the center column.    |
| `lessonType`   | string             | Currently written as `flow` by create/update.  |
| `contentReady` | boolean            | Learner can open only when true and published. |
| `lessonStatus` | string             | `draft`, `published`, or `archived`.           |

`Progress` stores per-user runtime state:

| Field                   | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `status`                | `locked`, `available`, `in_progress`, or `completed`. |
| `lessonCompleted`       | Node-level lesson completion flag.                    |
| `activeComponentId`     | Component id to resume.                               |
| `currentComponentIndex` | Top-level flow index to resume.                       |
| `completedComponentIds` | JSON array of completed top-level component ids.      |
| `componentResults`      | JSON array of latest result per component id.         |

## Availability Rules

The learner UI and backend learner endpoints treat a node as content-locked unless both are true:

```js
node.contentReady === true;
node.lessonStatus === "published";
```

Admin create/update may save drafts. Learner journey and syllabus mapping prevent opening unpublished or not-ready nodes, and direct node-detail/progress/complete API calls reject unpublished lessons for non-admin users.

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

| Type                  | Required config                                      | Runtime behavior                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component_group`     | `components[]`                                       | Renders child components as one learner-facing group. Children cannot be another `component_group`. Default `revealMode` is `sequential`; default `completionMode` is `all`. Saves `childResults` when complete. |
| `dialogue`            | `lines[]`, each line needs `text`                    | Uses dialogue renderer; `dialogs` is also accepted by the frontend for legacy data.                                                                                                                              |
| `media`               | `url`                                                | Accepted for backwards compatibility. Flow player extracts it into center media; right column asks learner to confirm they watched/read it.                                                                      |
| `markdown`            | `content`                                            | Renders Markdown-like learning text and continues on acknowledgement.                                                                                                                                            |
| `target_matching`     | `targets[]`, `items[]`                               | Learner matches items to targets; returns a score/result.                                                                                                                                                        |
| `map_target_matching` | `targets[]`, `items[]`                               | Learner drags items onto positioned map targets. Targets/items can define optional `image`, `x`, `y`, `icon`, and `detail`.                                                                                      |
| `category_sorting`    | `categories[]`, `cards[]`                            | Learner sorts cards into categories.                                                                                                                                                                             |
| `mindmap_reveal`      | `nodes[]`                                            | Reveals concept cards. Each node needs `id` and either legacy `label`/`detail` or new `front`/`back`. Optional `layoutConfig.type`: `vertical`, `horizontal`, `matrix`, `custom`.                                |
| `mcq`                 | `question`, `options[]`, at least one correct option | Single-question multiple choice. Correct options can use `isCorrect: true` or `correct: true`.                                                                                                                   |
| `quiz_sequence`       | `questions[]`                                        | Multi-question sequence. Each question needs `question` or `prompt`, `options[]`, and either `correctIndex` or a correct option flag.                                                                            |
| `multi_select`        | `question`, `options[]`, at least one correct option | Multi-answer question.                                                                                                                                                                                           |
| `matching_columns`    | `leftColumn[]`, `rightColumn[]`, `correctPairs[]`    | Drag/match left and right columns. Multiple left cards can match the same right card.                                                                                                                            |
| `true_false`          | `statement`, boolean `correctAnswer`                 | Binary true/false question.                                                                                                                                                                                      |
| `sequence_sorting`    | `items[]`                                            | Learner orders items into the correct sequence.                                                                                                                                                                  |
| `chain_sorting`       | `items[]`                                            | Guided ordering/chain activity; supports optional `instruction`, `successFeedback`, and `reward`.                                                                                                                |
| `knowledge_piece`     | `config.label` or component `title`                  | Short knowledge card; optional `takeaways[]`.                                                                                                                                                                    |
| `progression_spiral`  | `milestones[]`                                       | Learner opens milestones on a spiral/progression surface; completes after all milestones are visited.                                                                                                            |
| `timeline_explorer`   | `periods[]`                                          | Learner explores historical periods with persistent visited state.                                                                                                                                               |
| `hotspot_gallery`     | `items[]`                                            | Learner opens image/icon hotspots or cards and reads details for each item.                                                                                                                                      |
| `shinkei_matching`    | `pairs[]`                                            | Two-column memory game. Learner flips one left card and one right card; correct pairs stay open, wrong pairs show a miss state and close again.                                                                  |
| `final_summary`       | none strictly required                               | Completion/summary screen; optional `message`, `keyTakeaways[]`, and `rewards`.                                                                                                                                  |

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

Component-level inline images are optional and ignored when absent. Any image
field can be a URL string or an object:

```json
{
  "url": "https://example.com/image.png",
  "alt": "Mô tả hình ảnh",
  "caption": "Chú thích ngắn",
  "fit": "contain",
  "width": 320,
  "height": "12rem",
  "maxWidth": "100%",
  "aspectRatio": "16 / 9",
  "position": "center"
}
```

Image display sizing is carried with the image object and is optional. Supported
fields are `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`,
`aspectRatio`, `fit`, `position`, `radius`, `borderRadius`, and `align`.
Numeric sizes are rendered as pixels; string sizes are passed through for values
such as `"50%"`, `"18rem"`, `"240px"`, or `"clamp(12rem, 40vw, 28rem)"`.
The same fields can also be nested under `size`, `display`, or `layout`.

Examples:

```json
{
  "url": "/public/lesson-assets/map.png",
  "alt": "Bản đồ ba trung tâm văn minh",
  "size": {
    "width": "min(100%, 520px)",
    "height": 280,
    "aspectRatio": "16 / 9"
  },
  "fit": "contain",
  "align": "center"
}
```

Supported authoring fields:

- Any component: `media.image`, `media.componentImage`, `config.componentImage`, or `config.heroImage`.
- Reading/summary components: `config.image` or `config.imageUrl`.
- `mcq`, `multi_select`, `true_false`, `quiz_sequence`: prompt images via `config.image`, `questionImage`, `statementImage`, `promptImage`, or `question.image`; option images via `option.image`, `option.imageUrl`, or `component.media.answerImages[optionId]`.
- `final_summary.config.quiz[]`: question and option objects can include `image`.
- Drag/drop and sorting components: `items[]`, `cards[]`, `targets[]`, `categories[]`, `leftColumn[]`, `rightColumn[]`, `milestones[]`, `periods[]`, and hotspot `items[]` can include `image`.
- `shinkei_matching.config.pairs[]`: each `left` and `right` card can include `image`, `imageUrl`, `media`, or `thumbnail`.
- `dialogue`: each line can include `image`; alternatively use `component.media.dialogueImages[lineIdOrIndex]`.
- `mindmap_reveal`: `front.image`, `back.image`, or legacy node-level `image` are supported.

All inline image fields are backward-compatible. Existing lessons without these
fields render exactly as before.

## Matching Relationships

Matching components support many-to-one authoring without changing existing
seed data.

For `matching_columns`, legacy one-to-one pairs remain valid:

```json
{ "leftId": "plato", "rightId": "idealism" }
```

For several left cards matching the same right card, either repeat `rightId`:

```json
[
  { "leftId": "socrates", "rightId": "greek" },
  { "leftId": "plato", "rightId": "greek" }
]
```

or use the shorthand:

```json
{ "leftIds": ["socrates", "plato"], "rightId": "greek" }
```

For `target_matching`, `map_target_matching`, and `category_sorting`, many
cards/items can already point to one target/category. The renderer now supports
both directions:

- Item/card-side: `targetId`, `targetIds`, `acceptedTargetIds`, `categoryId`, `categoryIds`, or `acceptedCategoryIds`.
- Target/category-side: `itemIds`, `acceptedItemIds`, `cardIds`, or `acceptedCardIds`.

## Shinkei Matching

`shinkei_matching` is a two-column memory game inspired by Shinkei-suijaku /
concentration games. It renders N left cards and N right cards face down.
Learners flip one card from each side. Correct pairs stay open; wrong pairs show
a miss state and close again after a short delay.

```json
{
  "id": "philosopher-memory",
  "type": "shinkei_matching",
  "title": "Ghép triết gia với đóng góp",
  "config": {
    "instruction": "Lật một thẻ triết gia và một thẻ đóng góp tương ứng.",
    "shuffle": true,
    "pairs": [
      {
        "id": "socrates-dialogue",
        "left": {
          "id": "socrates",
          "text": "Socrates",
          "image": {
            "url": "/public/lesson-assets/socrates.png",
            "width": 96,
            "height": 96,
            "fit": "contain"
          }
        },
        "right": {
          "id": "dialogue-method",
          "text": "Đối thoại phản biện",
          "image": {
            "url": "/public/lesson-assets/dialogue.png",
            "size": { "width": 120, "height": 90 },
            "fit": "cover"
          }
        }
      }
    ],
    "successFeedback": "Tất cả cặp thẻ đã được mở chính xác."
  },
  "completionRule": { "type": "correct" }
}
```

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

Backend runtime guards:

- Student `GET /api/courses/nodes/:nodeId`, `GET /api/courses/nodes/:nodeId/core`, `PATCH /api/courses/nodes/:nodeId/progress`, `PATCH /api/courses/nodes/:nodeId/component-progress`, and `POST /api/courses/nodes/:nodeId/complete` require the node to be published and content-ready.
- Admin node CRUD can still inspect and edit draft lesson content through `/api/nodes`.
- Component progress writes are checked against the current `lessonFlow`: active ids, completed ids, component result ids, and top-level indexes must match the stored flow.

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
            {
              "speaker": "Lyra",
              "text": "Nếu triết học bắt đầu từ ngạc nhiên, vậy điều gì làm ta thật sự phải nghĩ lại?"
            }
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
            {
              "id": "b",
              "text": "Đặt vấn đề với điều tưởng như hiển nhiên",
              "isCorrect": true
            }
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
- A published node must have a non-empty valid `lessonFlow`.
- Test the lesson from the learner UI, not only the admin JSON editor.
- If changing supported types, update validator, frontend registry, renderer exports, TypeScript schema docs, admin helper text, seed SQL, and this file together.
