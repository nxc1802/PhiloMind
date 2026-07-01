# PhiloMind Lesson System Analysis

Ngay cap nhat: 2026-07-01

Tai lieu nay la nguon tham chieu duy nhat cho phan Lesson trong `docs/`. Noi dung duoc doi chieu voi code hien tai trong `frontend/src/pages/Lesson.jsx`, `frontend/src/pages/lesson/**`, `backend/src/courses/**`, `backend/prisma/schema.prisma` va du lieu Supabase dang chay.

## 1. Ket luan nhanh

Lesson hien tai da chuyen sang mo hinh component-based flow. Frontend khong con render lesson theo mot trang doc co dinh, ma render tung `lessonFlow[]` component trong layout 3 cot:

- Cot trai: danh sach component trong bai hoc va danh sach bai trong chuong.
- Cot giua: media trung tam tu `lessonMedia`.
- Cot phai: component tuong tac hien tai.

Backend va Prisma schema da co cac field moi phu hop voi thiet ke moi:

- `ConceptNode.lessonFlow`
- `ConceptNode.lessonType`
- `ConceptNode.contentReady`
- `ConceptNode.lessonStatus`
- `ConceptNode.lessonMedia`
- `Progress.activeComponentId`
- `Progress.currentComponentIndex`
- `Progress.completedComponentIds`
- `Progress.componentResults`

Trang thai seed tren Supabase: cau truc database va JSON cua cac bai published hop le, nhung du lieu lesson component moi chi day du cho 3/24 nodes. Neu yeu cau la toan bo course da san sang noi dung theo thiet ke moi, seed hien tai chua day du.

## 2. Entry point frontend

`frontend/src/pages/Lesson.jsx` la entry point cua tab Lesson. Khi dang o mot bai hoc active, page bi khoa trong mot viewport (`calc(100vh - 64px)`), chi con mot thanh title mong va layout 3 cot; cac cot tu scroll noi bo neu can.

Trach nhiem chinh:

- Doc `lesson` slug tu query string.
- Lay journey bang `useJourney(user)`.
- Tim `activeLesson` tu title slug.
- Lay chi tiet node bang `useNodeDetails(activeLesson?.id, user?.id)`.
- Khoa bai hoc khi `contentReady=false` hoac `lessonStatus` khac `published`.
- Tao danh sach bai hoc trong chuong hien tai cho left panel.
- Tao `progressMap` cho mindmap.
- Prefetch chi tiet cac node gan bai hien tai bang React Query.
- Lazy load `FlowLessonPlayer`.
- Hoan thanh bai hoc bang `useCompleteNodeMutation`, sau do auto-next sang node published tiep theo.

Trang thai khoa lesson:

```js
const isLessonContentLocked = (node) =>
  !node?.contentReady ||
  (node.lessonStatus && node.lessonStatus !== "published");
```

Hanh vi quan trong:

- Khi khong co active lesson, UI hien `LessonMindmap`.
- Khi co active lesson, UI hien header bai hoc va `FlowLessonPlayer`.
- Nut hoan thanh bai hoc khong dung lai o toast, ma chuyen route sang bai tiep theo neu backend tra duoc next node hoac frontend tim duoc `nextPlayableLesson`.
- `queryClient.prefetchQuery` lam nong detail data cho current/nearby lessons de giam waiting khi di chuyen qua lai.

Ghi chu code cleanup: `Lesson.jsx` dang import `LessonSidebar` nhung khong su dung trong render hien tai.

## 3. FlowLessonPlayer

`frontend/src/pages/lesson/flow/FlowLessonPlayer.jsx` la player chinh cua lesson component flow.

Pipeline:

1. Lay `progress` tu `nodeDetails.progress[0]`.
2. Chuan hoa `nodeDetails.lessonFlow` bang `normalizeFlow`.
3. Lay media tu `nodeDetails.lessonMedia`, dong thoi extract media component cu de tuong thich seed cu.
4. Khoi tao `activeIndex` tu progress neu khong phai revisit.
5. Khoi tao `completedIds` tu `progress.completedComponentIds`.
6. Khi node doi, reset `activeIndex`, `completedIds`, `activeMediaId`.
7. Khi component hoan thanh, goi `useUpdateComponentProgressMutation`.
8. Neu component cuoi hoan thanh, goi `onFinishLesson`.

Layout:

```txt
lg: [LeftPanel 300px] [CenterMedia minmax(0,1fr)] [RightInteractive minmax(360px,0.95fr)]
mobile: chi hien RightInteractive
```

Progress component duoc cap nhat theo payload:

```json
{
  "activeComponentId": "id cua component tiep theo",
  "currentComponentIndex": 3,
  "completedComponentIds": ["component-a", "component-b"],
  "componentResult": {
    "componentId": "component-b",
    "type": "mcq",
    "status": "completed",
    "score": 100
  }
}
```

## 4. Layout components

### LeftPanel

File: `frontend/src/pages/lesson/components/LeftPanel.jsx`

Vai tro:

- O tren: course content, danh sach bai hoc trong chuong hien tai.
- O duoi: component flow, chi hien cac moc chinh trong bai hoc.
- Hien progress bang so moc chinh da hoan thanh / tong so moc chinh dang hien.
- Cho phep click lai component da qua/da hoan thanh.
- Hien status bai hoc: `completed`, `active`, `locked`, `content_locked`.
- Sub-component co `navigation_config.showInProgress=false` se khong hien trong timeline trai.

Rui ro hien tai:

- Logic UI cho component chua hoan thanh o tuong lai dat `cursor-not-allowed`, nhung button van goi `onSelectComponent(index)`. Neu muon khoa component tuong lai that su, can chan click khi `index > activeIndex` va chua completed.

### CenterMedia

File: `frontend/src/pages/lesson/components/CenterMedia.jsx`

Vai tro:

- Doc `lessonMedia[]`.
- Hien video bang `VideoScene`.
- Hien image bang `<img>`.
- Co selector khi bai hoc co nhieu media.
- Neu khong co `lessonMedia`, hien placeholder.

Trang thai Supabase hien tai: `Nguon goc cua triet hoc` co 3 media, `Pham tru vat chat` co 1 media, `Khai niem triet hoc` chua co media nguon nen cot giua hien placeholder o bai nay.

### RightInteractive

File: `frontend/src/pages/lesson/components/RightInteractive.jsx`

Vai tro:

- Nhan `flow`, `activeIndex`, `completedIds`.
- Lay active component.
- Anh xa type sang renderer bang convention:

```txt
matching_columns -> MatchingColumnsComponent
target_matching  -> TargetMatchingComponent
final_summary    -> FinalSummaryComponent
```

- Import registry tu `frontend/src/pages/lesson/flow/components/index.js`.
- Neu active component la `media`, khong render video o cot phai; cot phai chi hien the xac nhan xem xong, con video/hinh nam o cot giua.
- Neu khong co renderer, hien fallback va cho phep bo qua buoc.
- Neu component cuoi hoan thanh, goi `onFinishLesson`.

Rui ro hien tai:

- Registry phu thuoc convention ten component; them type moi phai export dung ten PascalCase + `Component`.

## 5. Component renderers

Tat ca renderer dang duoc export tu `frontend/src/pages/lesson/flow/components/index.js`.

### media

Renderer: `MediaComponent`

Config chinh:

```json
{
  "mediaType": "video|image",
  "url": "https://...",
  "title": "Tieu de",
  "subtitle": "Phu de",
  "alt": "Mo ta anh",
  "badge": "Nhan",
  "description": "Mo ta"
}
```

Hanh vi:

- Video dung `VideoScene`.
- Image dung `<img>`.
- Hoan thanh bang nut `Toi da xem xong`.

### dialogue

Renderer: `DialogueComponent`

Config:

```json
{
  "lines": [{ "who": "guide", "text": "..." }]
}
```

Hanh vi:

- Dung `DialogueSequence`.
- Hoan thanh khi dialogue sequence goi callback.
- Validator backend hien bat buoc `config.lines`; frontend co fallback `dialogs` nhung backend khong chap nhan `dialogs` neu tao/update qua API.

### markdown

Renderer: `MarkdownComponent`

Config:

```json
{
  "content": "Markdown content"
}
```

Hanh vi:

- Parse markdown bang `MarkdownRenderer`.
- Nut continue danh dau viewed/completed.

### mcq

Renderer: `McqComponent`

Config:

```json
{
  "question": "Cau hoi",
  "options": [
    { "id": "a", "text": "Dap an", "isCorrect": true, "explanation": "..." }
  ],
  "explanation": "Giai thich tong"
}
```

Hanh vi:

- Chon sai thi luu `wrongIds`.
- Chi cho tiep tuc khi chon dung.
- Ket qua gom `score`, `answer`, `status`.

### quiz_sequence

Renderer: `QuizSequenceComponent`

Config:

```json
{
  "questions": [
    {
      "question": "Cau hoi",
      "options": ["A", "B"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}
```

Hanh vi:

- Chuan hoa question bang `normalizeQuizQuestions`.
- Moi cau can chon dung moi qua cau tiep theo.
- Component tra `score` theo so cau dung.

### multi_select

Renderer: `MultiSelectComponent`

Config:

```json
{
  "question": "Chon cac dap an dung",
  "options": [
    { "id": "a", "text": "Lua chon", "isCorrect": true }
  ],
  "explanation": "..."
}
```

Hanh vi:

- Cho phep chon nhieu dap an.
- Submit xong moi hien dung/sai.
- Chi cho tiep tuc khi tap selected ids khop tap correct ids.

### true_false

Renderer: `TrueFalseComponent`

Config:

```json
{
  "statement": "Nhan dinh",
  "correctAnswer": true,
  "explanation": "..."
}
```

Hanh vi:

- Chon dung moi hien continue.

### matching_columns

Renderer: `MatchingColumnsComponent`

Config:

```json
{
  "leftColumn": [{ "id": "l1", "text": "Trai" }],
  "rightColumn": [{ "id": "r1", "text": "Phai" }],
  "correctPairs": [{ "leftId": "l1", "rightId": "r1" }]
}
```

Hanh vi:

- Dung `@dnd-kit/core`.
- Ke duong noi giua cot trai/phai.
- Co `LessonHint` popup.
- Hoan thanh khi tat ca cap dung.

### category_sorting

Renderer: `CategorySortingComponent`

Config:

```json
{
  "categories": [{ "id": "cat", "label": "Nhom" }],
  "cards": [{ "id": "card", "text": "The", "categoryId": "cat" }],
  "summary": "Tong ket"
}
```

Hanh vi:

- Dung drag/drop.
- The dung/sai duoc hien mau xanh/do.
- Hoan thanh khi tat ca card nam dung category.

### target_matching

Renderer: `TargetMatchingComponent`

Config:

```json
{
  "targets": [{ "id": "target", "label": "Dich", "icon": "ads_click" }],
  "items": [{ "id": "item", "text": "Noi dung", "targetId": "target" }],
  "summary": "Tong ket"
}
```

Hanh vi:

- Dung drag/drop vao target.
- Co `LessonHint`.
- Hoan thanh khi tat ca item nam dung target.

### mindmap_reveal

Renderer: `MindmapRevealComponent`

Config:

```json
{
  "center": "Chu de trung tam",
  "nodes": [
    {
      "id": "n1",
      "front": { "text": "Mat truoc", "image": "..." },
      "back": { "text": "Mat sau", "detail": "...", "image": "..." }
    }
  ],
  "summary": "Tong ket"
}
```

Hanh vi:

- Reveal tung node.
- Ho tro format moi `front/back` va legacy `label/detail/image`.
- Hoan thanh khi tat ca node duoc reveal.

### sequence_sorting

Renderer: `SequenceSortingComponent`

Config:

```json
{
  "instruction": "Sap xep theo thu tu dung",
  "items": [{ "id": "step-1", "text": "Buoc 1" }],
  "successFeedback": "Dung roi"
}
```

Hanh vi:

- Chon item theo dung thu tu.
- Sai thi danh dau item sai gan nhat.
- Co `LessonHint`.

### final_summary

Renderer: `FinalSummaryComponent`

Config:

```json
{
  "message": "Thong diep hoan thanh",
  "keyTakeaways": ["Y chinh"],
  "rewards": { "xp": 120, "badge": "Danh hieu" },
  "quiz": []
}
```

Hanh vi:

- Hien tong ket, takeaways, reward.
- Neu co `quiz`, component tu xu ly cau hoi tong ket.
- `normalizeFlow` se tach `final_summary.config.quiz` thanh mot `quiz_sequence` rieng truoc `final_summary`, nen nen uu tien dat quiz cuoi bai thanh `quiz_sequence` ro rang.

## 6. Shared components va utilities

### ComponentFrame

Wrapper dung chung cho moi renderer:

- Hien icon theo type.
- Hien label type.
- Hien title.
- Tao card nen, border, dark mode.

### ContinueButton

Nut continue dung chung. Mac dinh goi:

```json
{ "score": 100, "status": "completed" }
```

### LessonHint

Huong dan cach choi dang popup:

- Hien step dau inline.
- Nut `Cach choi` mo modal.
- Co nut close.
- Click backdrop de dong.

### normalizeFlow

File: `frontend/src/pages/lesson/flow/utils/normalizeFlow.js`

Chuc nang:

- Bo qua item khong phai object.
- Gan `id` fallback.
- Gan `type` fallback `unsupported`.
- Gan `title` fallback.
- Gan `config` fallback `{}`.
- Tach `final_summary.config.quiz` thanh `quiz_sequence` truoc `final_summary`.

Luu y: backend validator khong cho `unsupported`, nen fallback nay chu yeu de tranh crash khi doc du lieu cu/hong, khong phai schema hop le de ghi vao DB.

### normalizeOptions

File: `frontend/src/pages/lesson/flow/utils/normalizeOptions.js`

Chuc nang:

- Chuan hoa option MCQ/multi-select.
- Chuan hoa quiz questions co `correctIndex` hoac option object.

## 7. Backend va API

### Prisma schema

Model lien quan:

- `ConceptNode`
- `Progress`
- `Course`
- `Chapter`
- `Document`
- `Podcast`
- `Warmup`
- `Quiz`

Field lesson moi trong `ConceptNode`:

```prisma
lessonFlow   Json?
lessonType   String  @default("flow")
contentReady Boolean @default(false)
lessonStatus String  @default("draft")
lessonMedia  Json?
```

Field progress moi:

```prisma
activeComponentId       String?
currentComponentIndex   Int @default(0)
completedComponentIds   Json?
componentResults        Json?
```

### NodeSchemaValidator

File: `backend/src/courses/validators/node-schema.validator.ts`

Supported types:

- `dialogue`
- `media`
- `markdown`
- `target_matching`
- `category_sorting`
- `mindmap_reveal`
- `mcq`
- `quiz_sequence`
- `multi_select`
- `matching_columns`
- `true_false`
- `sequence_sorting`
- `final_summary`

Validator hien chi validate shape co ban. No chua validate sau cac rang buoc chi tiet:

- `target_matching.items[].targetId` co ton tai trong `targets[].id`.
- `category_sorting.cards[].categoryId` co ton tai trong `categories[].id`.
- `matching_columns.correctPairs` tham chieu id co ton tai.
- `sequence_sorting.items` co id unique.
- `lessonMedia` URL/type co phu hop voi noi dung that hay khong.

### CoursesService

File: `backend/src/courses/courses.service.ts`

Luon can doi chieu cac method sau khi sua Lesson:

- `getCourseJourney(courseId, userId)`: tra node summary, status, progress nhe cho mindmap/sidebar.
- `getNodeDetails(nodeId, userId)`: tra full node, podcast, flashcards, progress, course documents, warmups.
- `getNodeCore(nodeId, userId)`: tra core node/progress nhe hon.
- `createNode(dto)`: tao node, validate `lessonFlow`, infer `contentReady`/`lessonStatus`.
- `updateNode(nodeId, dto)`: update lessonFlow/media/status.
- `updateComponentProgress(...)`: upsert progress cho tung component.
- `completeNode(nodeId, userId)`: hoan thanh node va mo khoa/pick next published node.

## 8. Database seed check tren Supabase

Da kiem tra truc tiep bang Prisma voi `backend/.env` vao ngay 2026-07-01.

Tong quan:

| Hang muc | So luong |
| --- | ---: |
| Users | 10 |
| Courses | 1 |
| Chapters | 11 |
| ConceptNodes | 24 |
| Published + contentReady nodes | 3 |
| Draft/locked nodes | 21 |
| Progress rows | 29 |
| Flashcards | 100 |
| Quizzes | 4 |
| Warmups | 5 |
| Podcasts | 2 |
| Documents | 7 |

Lesson published:

| Node | Components | Media | Component types |
| --- | ---: | ---: | --- |
| Nguon goc cua triet hoc | 16 | 3 | dialogue, final_summary, markdown, media, mindmap_reveal, quiz_sequence, sequence_sorting |
| Pham tru vat chat | 11 | 1 | dialogue, final_summary, markdown, matching_columns, mcq, mindmap_reveal, multi_select, media |
| Khai niem triet hoc | 8 | 0 | category_sorting, final_summary, matching_columns, mcq, mindmap_reveal, quiz_sequence, target_matching, true_false |

Integrity checks:

| Check | Ket qua |
| --- | ---: |
| Published node khong co lessonFlow | 0 |
| `contentReady=true` nhung khong published | 0 |
| Published nhung `contentReady=false` | 0 |
| Component thieu `type` | 0 |
| Component thieu `config` object | 0 |
| Duplicate component id trong cung node | 0 |

Coverage type trong toan bo `lessonFlow`:

| Type | Count |
| --- | ---: |
| category_sorting | 1 |
| dialogue | 5 |
| final_summary | 24 |
| markdown | 24 |
| matching_columns | 3 |
| mcq | 24 |
| media | 3 |
| mindmap_reveal | 4 |
| multi_select | 2 |
| quiz_sequence | 4 |
| sequence_sorting | 1 |
| target_matching | 1 |
| true_false | 1 |

Danh gia:

- Dat: schema moi da co tren DB.
- Dat: 3 bai published co `lessonFlow` hop le o muc shape co ban.
- Dat: khong co duplicate component id trong cac flow da seed.
- Dat mot phan: 24/24 nodes co flow, nhung 21 node dang la draft va chi co default flow 3 component.
- Chua dat neu muc tieu la full production content: chi 3/24 nodes published.
- Dat mot phan ve media trung tam: 2/3 published nodes co `lessonMedia`; bai `Khai niem triet hoc` chua co media nguon nen van hien placeholder.
- Chua day du ve user progress: chi `student@philomind.local` co 24 progress rows; nhieu user khac khong co progress seed san. Frontend co fallback unlock first lesson khi user chua co progress, nhung DB khong seed progress coverage cho moi user.

## 9. Legacy / chua duoc noi vao flow chinh

Nhung file sau van ton tai nhung khong phai render path chinh cua `Lesson.jsx` hien tai:

- `frontend/src/pages/lesson/adventure/**`
- `frontend/src/pages/lesson/components/WarmupSection.jsx`
- `frontend/src/pages/lesson/components/VideoWithReminder.jsx`
- `frontend/src/pages/lesson/components/FinalQuiz.jsx`
- `frontend/src/pages/lesson/components/PodcastPlayer.jsx`
- `frontend/src/pages/lesson/components/LessonDiscussion.jsx`
- `frontend/src/pages/lesson/components/LessonSidebar.jsx`

Khuyen nghi:

- Neu khong con dung, xoa hoac tach thanh archive de giam nham lan.
- Neu muon dung lai, can noi vao component flow bang renderer ro rang thay vi render song song voi flow moi.

## 10. Viec can lam tiep

Uu tien cao:

- Seed rich `lessonFlow` cho 21 nodes con lai hoac chap nhan ro rang rang chung la draft.
- Them media nguon cho `Khai niem triet hoc` neu bai nay can day du cot giua.

Uu tien trung binh:

- Tang validator backend de kiem tra quan he id trong matching/sorting/target components.
- Them test cho `normalizeFlow`, `RightInteractive` registry fallback, component progress mutation payload.
- Them admin tooling de preview/validate `lessonFlow` truoc khi publish.

Uu tien thap:

- Xoa hoac tai cau truc legacy lesson components/adventure flow sau khi chac chan khong con route nao can.
- Dong bo comment code sang mot ngon ngu nhat quan.
