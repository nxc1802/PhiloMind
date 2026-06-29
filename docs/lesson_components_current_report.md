# Report component Lesson hiện tại

Ngày cập nhật: 2026-06-28

## 1. Tóm tắt hiện trạng

Lesson hiện tại đã chuyển sang kiến trúc component-based flow. Màn `Lesson` không còn chọn giữa classic/adventure player nữa, mà lazy-load duy nhất `FlowLessonPlayer` để render danh sách component trong `ConceptNode.lessonFlow`.

Các điểm chính:

- Frontend entrypoint: `frontend/src/pages/Lesson.jsx`
- Player chính: `frontend/src/pages/lesson/flow/FlowLessonPlayer.jsx`
- Dữ liệu flow: `ConceptNode.lessonFlow` trong Prisma
- Loại lesson: `ConceptNode.lessonType`, mặc định `"flow"`
- Progress theo component: `Progress.activeComponentId`, `currentComponentIndex`, `completedComponentIds`, `componentResults`
- Backend validator: `backend/src/courses/validators/node-schema.validator.ts`

## 2. Luồng render Lesson

### 2.1 `Lesson.jsx`

Vai trò:

- Lấy `journey` bằng `useJourney(user)`.
- Match active node theo query param `?lesson=<slug>`.
- Lấy chi tiết node bằng `useNodeDetails(activeLesson.id, user.id)`.
- Render mindmap nếu chưa chọn bài.
- Render lesson player nếu đã chọn bài.
- Render sidebar tiến độ và tài liệu.

Luồng chính:

```txt
Lesson.jsx
  -> useJourney(user)
  -> activeLesson from slug
  -> useNodeDetails(activeLesson.id, user.id)
  -> FlowLessonPlayer(nodeDetails)
  -> LessonSidebar(...)
```

Hiện tại `FlowLessonPlayer` luôn được dùng khi mở bài, không có fallback về `ClassicLessonPlayer` hoặc `AdventureLessonPlayer`.

### 2.2 `FlowLessonPlayer.jsx`

Vai trò:

- Đọc `nodeDetails.lessonFlow`.
- Lấy progress hiện tại từ `nodeDetails.progress[0]`.
- Chọn component active theo `currentComponentIndex`.
- Render component bằng registry nội bộ.
- Gọi `PATCH /courses/nodes/:nodeId/component-progress` sau mỗi component hoàn thành.
- Khi tất cả component hoàn thành, gọi `onComplete`, từ đó `Lesson.jsx` gọi complete node để mở khóa bài kế tiếp.

Registry hiện tại:

```js
const registry = {
  media: MediaComponent,
  dialogue: DialogueComponent,
  markdown: MarkdownComponent,
  mcq: McqComponent,
  true_false: TrueFalseComponent,
  matching_columns: MatchingColumnsComponent,
  category_sorting: CategorySortingComponent,
  target_matching: TargetMatchingComponent,
  mindmap_reveal: MindmapRevealComponent,
  sequence_sorting: SequenceSortingComponent,
  final_summary: FinalSummaryComponent,
};
```

Nếu gặp component type chưa có renderer, player hiển thị fallback:

```txt
Component type "<type>" chưa có renderer.
```

## 3. Contract dữ liệu component

Mỗi item trong `lessonFlow` đang dùng contract tối thiểu:

```json
{
  "id": "unique-component-instance-id",
  "type": "mcq",
  "title": "Tên hoạt động",
  "config": {},
  "completionRule": {
    "type": "correct"
  },
  "feedback": {}
}
```

Ý nghĩa:

- `id`: ID instance trong lesson, phải unique trong cùng một flow.
- `type`: loại component, phải nằm trong danh sách supported của backend validator.
- `title`: tiêu đề hiển thị trong card component.
- `config`: dữ liệu riêng theo từng component.
- `completionRule`: metadata rule hoàn thành. Hiện validator mới kiểm tra object và `type`; FE chưa dùng rule này để điều phối generic.
- `feedback`: metadata phản hồi. Hiện mới được `mcq` đọc một phần.

## 4. Component đang được hỗ trợ

### 4.1 `media`

Renderer: `MediaComponent`

Mục đích:

- Hiển thị video/media nhập môn.
- Tái sử dụng `VideoScene` từ adventure common.

Config tối thiểu:

```json
{
  "url": "https://...",
  "title": "Tiêu đề video",
  "subtitle": "Mô tả ngắn",
  "badge": "optional",
  "description": "optional"
}
```

Completion:

- User bấm `Tôi đã xem xong`.
- Result lưu: `{ score: 100, status: "completed" }`.

Validator:

- Bắt buộc `config.url`.

Rủi ro/gap:

- `mediaType` có trong seed nhưng renderer chưa phân nhánh theo audio/image/video.
- Chưa có tracking xem video thật sự; user có thể bấm hoàn thành ngay.

### 4.2 `dialogue`

Renderer: `DialogueComponent`

Mục đích:

- Hiển thị hội thoại dạng typewriter giữa guide/NPC.
- Dùng `DialogueSequence` và `SpeechBubble`.

Config tối thiểu:

```json
{
  "lines": [
    { "who": "guide", "text": "..." }
  ]
}
```

Renderer cũng chấp nhận fallback `config.dialogs`.

Completion:

- Khi đọc hết hội thoại và bấm CTA.
- Result lưu: `{ score: 100, status: "completed" }`.

Validator:

- Bắt buộc `config.lines` là array.
- Mỗi line bắt buộc có `text`.

Rủi ro/gap:

- Backend validator chỉ chấp nhận `lines`, nhưng FE chấp nhận cả `dialogs`. Nếu admin nhập `dialogs` không có `lines`, backend sẽ reject.
- Danh sách nhân vật đang hardcode trong `GuideSpeech.jsx`.

### 4.3 `markdown`

Renderer: `MarkdownComponent`

Mục đích:

- Render nội dung đọc chính của bài học.
- Dùng `parseMarkdownToReact`.

Config tối thiểu:

```json
{
  "content": "# Nội dung markdown"
}
```

Markdown renderer hiện hỗ trợ:

- Heading bằng `#`, `##`, số thứ tự, hoặc dạng `a)`.
- Table markdown cơ bản.
- Inline bold `**text**`.
- Link `[label](url)`.
- Các block văn bản/list cơ bản theo parser hiện có.

Completion:

- User bấm `Hoàn thành bước này`.

Validator:

- Bắt buộc `config.content`.

Rủi ro/gap:

- Parser là custom parser, không phải Markdown engine đầy đủ.
- Chưa sanitize HTML vì hiện không render HTML thô, nhưng nếu mở rộng markdown cần kiểm soát XSS.

### 4.4 `mcq`

Renderer: `McqComponent`

Mục đích:

- Câu hỏi trắc nghiệm một đáp án đúng.

Config tối thiểu:

```json
{
  "question": "Câu hỏi?",
  "options": [
    { "id": "a", "text": "Đáp án A", "isCorrect": true, "explanation": "..." },
    { "id": "b", "text": "Đáp án B", "isCorrect": false }
  ],
  "explanation": "optional"
}
```

Renderer normalize option theo:

- `id` hoặc `answerId` hoặc fallback `option_<index>`.
- Correct nếu `isCorrect === true` hoặc `correct === true`.

Completion:

- Chỉ hiện nút tiếp tục khi chọn đúng.
- Result lưu: score 100, số lần thử, answer, status.

Validator:

- Bắt buộc `question`.
- Bắt buộc `options`.
- Bắt buộc có ít nhất một option đúng.

Rủi ro/gap:

- Không giới hạn một đáp án đúng.
- Chưa randomize options.
- Chưa lưu các đáp án sai cụ thể ngoài attempts.

### 4.5 `true_false`

Renderer: `TrueFalseComponent`

Mục đích:

- Kiểm tra đúng/sai.

Config tối thiểu:

```json
{
  "statement": "Mệnh đề",
  "correctAnswer": false,
  "explanation": "Giải thích"
}
```

Completion:

- Chỉ cho tiếp tục khi chọn đúng.
- Result lưu answer boolean.

Validator:

- Bắt buộc `statement`.
- `correctAnswer` phải là boolean.

Rủi ro/gap:

- Không có cơ chế retry count rõ ràng.
- Text explanation trong một số class chưa đồng bộ dark mode hoàn toàn.

### 4.6 `matching_columns`

Renderer: `MatchingColumnsComponent`

Mục đích:

- Nối khái niệm bên trái với mô tả bên phải.

Config tối thiểu:

```json
{
  "leftColumn": [
    { "id": "philosophy", "text": "Tri thức triết học" }
  ],
  "rightColumn": [
    { "id": "general", "text": "Khái quát vấn đề chung nhất" }
  ],
  "correctPairs": [
    { "leftId": "philosophy", "rightId": "general" }
  ]
}
```

Completion:

- Hoàn thành khi mọi item trái có pair đúng.
- Result lưu object `leftId -> rightId`.

Validator:

- Bắt buộc `leftColumn`, `rightColumn`, `correctPairs`.

Rủi ro/gap:

- Chưa có trạng thái báo sai rõ ngay khi ghép nhầm.
- Không ngăn chọn lại right item đã dùng.
- Không validate rằng `correctPairs` tham chiếu ID tồn tại.

### 4.7 `category_sorting`

Renderer: `CategorySortingComponent`

Mục đích:

- Chọn thẻ và đưa vào nhóm/category đúng.

Config tối thiểu:

```json
{
  "categories": [
    { "id": "philosophy", "label": "Triết học" }
  ],
  "cards": [
    { "id": "reason", "text": "Lý tính", "categoryId": "philosophy" }
  ],
  "summary": "optional"
}
```

Completion:

- Hoàn thành khi mọi card được đặt đúng `categoryId`.
- Result lưu object `cardId -> categoryId`.

Validator:

- Bắt buộc `categories`, `cards`.

Rủi ro/gap:

- Cơ chế thao tác là click-select rồi click target, chưa phải drag/drop.
- Backend chưa validate card `categoryId` có tồn tại trong categories.

### 4.8 `target_matching`

Renderer: `TargetMatchingComponent`

Mục đích:

- Ghép item vào target/vùng tương ứng, ví dụ thuật ngữ với nền văn minh.

Config tối thiểu:

```json
{
  "targets": [
    { "id": "greece", "label": "Hy Lạp", "icon": "account_balance" }
  ],
  "items": [
    { "id": "philosophia", "text": "φιλοσοφία", "targetId": "greece" }
  ],
  "summary": "optional"
}
```

Completion:

- Hoàn thành khi mọi item được đặt đúng `targetId`.

Validator:

- Bắt buộc `targets`, `items`.

Rủi ro/gap:

- Không validate targetId tồn tại.
- Chưa có affordance kéo thả; đang dùng click-select.

### 4.9 `mindmap_reveal`

Renderer: `MindmapRevealComponent`

Mục đích:

- Hiển thị node trung tâm và các mảnh ghép kiến thức bấm để lật mở.

Config tối thiểu:

```json
{
  "center": "Triết học",
  "nodes": [
    { "id": "worldview-core", "label": "Hạt nhân thế giới quan", "detail": "..." }
  ]
}
```

Completion:

- Hoàn thành khi user reveal toàn bộ nodes.
- Result lưu array ID đã reveal.

Validator:

- Bắt buộc `nodes`.

Rủi ro/gap:

- Đây là reveal grid, chưa phải mindmap graph/canvas thật.
- Không có quan hệ cạnh/level giữa các node.

### 4.10 `sequence_sorting`

Renderer: `SequenceSortingComponent`

Mục đích:

- Sắp xếp chuỗi sự kiện/luận điểm theo thứ tự.

Config tối thiểu:

```json
{
  "instruction": "Chọn theo thứ tự đúng",
  "items": [
    { "id": "c1", "order": 0, "text": "..." }
  ],
  "successFeedback": "optional"
}
```

Completion:

- User chỉ đặt được item nếu đúng thứ tự kế tiếp.
- Hoàn thành khi đã đặt đủ items.

Validator:

- Bắt buộc `items`.

Rủi ro/gap:

- Nếu chọn sai, hiện tại gần như không có feedback rõ.
- Chưa có nút reset.
- Không validate `order` là số liên tục.

### 4.11 `final_summary`

Renderer: `FinalSummaryComponent`

Mục đích:

- Tổng kết bài học.
- Hiển thị takeaways, badge/xp.
- Có thể nhúng quiz tổng kết nhỏ.

Config tối thiểu:

```json
{
  "message": "Bạn đã hoàn thành bài học.",
  "keyTakeaways": ["..."],
  "rewards": { "xp": 120, "badge": "..." },
  "quiz": [
    {
      "question": "...",
      "options": ["A", "B", "C"],
      "correctIndex": 1
    }
  ]
}
```

Completion:

- Nếu không có quiz: có thể hoàn thành ngay.
- Nếu có quiz: user phải trả lời toàn bộ, sau đó hiện điểm tổng kết và nút hoàn thành.
- Result lưu score và answers.

Validator:

- Nếu có `keyTakeaways`, phải là array.
- Chưa validate cấu trúc quiz.

Rủi ro/gap:

- Quiz trong `final_summary` không có explanation từng câu.
- User có thể hoàn thành dù score thấp; hiện chưa có pass threshold.

## 5. Component frame và shared UI

### 5.1 `ComponentFrame`

Đây là wrapper chung cho toàn bộ renderer trong `FlowLessonPlayer`.

Chức năng:

- Card nền trắng/dark elevated.
- Hiển thị icon `widgets`.
- Hiển thị component type và title.
- Chuẩn hóa spacing/card style.

Gap:

- Icon giống nhau cho mọi type, chưa map icon theo component.
- Type hiển thị bằng `replaceAll("_", " ")`, chưa có label tiếng Việt.

### 5.2 `ContinueButton`

Button hoàn thành bước.

Chức năng:

- Gọi `onComplete({ score: 100, status: "completed" })` mặc định.
- Một số renderer truyền label/result riêng.

Gap:

- Completion logic nằm rải trong từng renderer.
- Chưa tận dụng `completionRule` để quyết định generic.

### 5.3 `LessonSidebar`

Sidebar bên phải khi đang ở lesson detail.

Chức năng:

- Hiển thị danh sách bài trong cùng chương.
- Hiển thị trạng thái `completed`, `active`, `locked`.
- Hiển thị progress chapter.
- Hiển thị dropdown tài liệu PDF từ `currentNodeDetails.chapter.course.documents`.

Gap:

- Sidebar không hiển thị progress theo từng component, chỉ theo bài học.
- Tài liệu là course-level documents, không map chính xác tài liệu theo từng node/chapter.

### 5.4 `MarkdownRenderer`

Parser markdown custom.

Chức năng:

- Inline bold/link.
- Table.
- Heading.
- Nội dung text/list cơ bản.

Gap:

- Không tương đương CommonMark/Markdown đầy đủ.
- Chưa hỗ trợ nhúng component bằng custom tags như định hướng trong docs cũ.

### 5.5 `DialogueSequence` / `SpeechBubble`

Đang được dùng bởi `DialogueComponent`.

Chức năng:

- Typewriter effect.
- Auto reveal từng dòng.
- Avatar nhân vật.
- Hỗ trợ reduced motion.

Gap:

- Danh sách nhân vật hardcode.
- Visual còn mang hơi hướng adventure cũ.

## 6. Backend, schema và progress

### 6.1 Prisma schema

`ConceptNode`:

```prisma
lessonFlow Json?
lessonType String @default("flow")
```

`Progress`:

```prisma
activeComponentId String?
currentComponentIndex Int @default(0)
completedComponentIds Json?
componentResults Json?
```

### 6.2 API liên quan

Journey:

```txt
GET /courses/:id/journey
```

Trả về node summary/quickTake/lessonType/progress count. Không trả `lessonFlow` đầy đủ.

Node details:

```txt
GET /courses/nodes/:nodeId
```

Trả về node đầy đủ gồm `lessonFlow`, `podcast`, `flashcards`, `progress`, `chapter.course.documents`, `warmups`.

Component progress:

```txt
PATCH /courses/nodes/:nodeId/component-progress
```

Body:

```json
{
  "activeComponentId": "main-reading",
  "currentComponentIndex": 1,
  "completedComponentIds": ["intro"],
  "componentResult": {
    "componentId": "intro",
    "type": "dialogue",
    "status": "completed",
    "score": 100
  }
}
```

Service behavior:

- Nếu progress đã có: update row hiện tại.
- Nếu chưa có: tạo progress mới với status `in_progress`.
- `componentResults` được merge theo `componentId`, ghi thêm `completedAt`.

Complete node:

```txt
POST /courses/nodes/:nodeId/complete
```

Được gọi sau khi toàn bộ component trong flow hoàn thành.

## 7. Validator backend

Supported component types:

- `dialogue`
- `media`
- `markdown`
- `target_matching`
- `category_sorting`
- `mindmap_reveal`
- `mcq`
- `matching_columns`
- `true_false`
- `sequence_sorting`
- `final_summary`

Validator đang kiểm tra:

- `lessonFlow` phải là array.
- Mỗi component phải là object.
- `id` không rỗng và không trùng.
- `type` thuộc set supported.
- `config` là object.
- Một số field bắt buộc theo type.
- `completionRule` nếu có thì phải là object và có `type`.

Gap:

- Chưa validate sâu ID references giữa items/targets/categories/pairs.
- Chưa validate quiz trong `final_summary`.
- Chưa validate scoring/feedback.
- Chưa validate `completionRule.type` nằm trong set hợp lệ.

## 8. Dữ liệu lesson hiện có

Seed hiện tạo 3 kiểu flow chính:

### 8.1 Bài mặc định

Builder: `buildDefaultLessonFlow(node)`

Component sequence:

1. `media` nếu node có `videoUrl`
2. `markdown`
3. `mcq`
4. `final_summary`

Áp dụng cho phần lớn node.

### 8.2 Bài "Nguồn gốc của triết học"

Builder: `buildOriginLessonFlow(node)`

Component sequence:

1. `dialogue`
2. `media`
3. `mcq`
4. `sequence_sorting`
5. `markdown`
6. `final_summary`

### 8.3 Bài "Khái niệm triết học"

Builder: `buildLesson1bFlow(seedingData.lesson_1b)`

Component sequence:

1. `target_matching`
2. `category_sorting`
3. `mindmap_reveal`
4. `mcq`
5. `matching_columns`
6. `true_false`
7. `final_summary`

Ghi chú:

- Trong seed còn thấy type `single_column_sorting` nằm ở dữ liệu cũ/nested legacy, nhưng type này không nằm trong validator và không có renderer trong `FlowLessonPlayer`.
- Warmup `game`, `image-guess`, `story` là hệ thống warmup riêng, không phải component trong `lessonFlow` hiện tại.

## 9. Component legacy/tồn dư trong thư mục Lesson

Các file còn tồn tại nhưng không còn nằm trên đường render chính của `Lesson.jsx`:

- `frontend/src/pages/lesson/adventure/*`
- `frontend/src/pages/lesson/components/FinalQuiz.jsx`
- `frontend/src/pages/lesson/components/PodcastPlayer.jsx`
- `frontend/src/pages/lesson/components/WarmupSection.jsx`
- `frontend/src/pages/lesson/components/VideoWithReminder.jsx`
- `frontend/src/pages/lesson/components/GradedQuestion.jsx`
- `frontend/src/pages/lesson/components/JourneyArt.jsx`

Một số vẫn được tái sử dụng gián tiếp:

- `GuideSpeech.jsx` dùng bởi `DialogueComponent`.
- `AdventureCommon.jsx` dùng `VideoScene` cho `MediaComponent`.
- `MarkdownRenderer.jsx` dùng bởi `MarkdownComponent`.
- `LessonSidebar.jsx` vẫn dùng trong layout Lesson.
- `LessonSkeleton.jsx` vẫn dùng loading state.

Khuyến nghị:

- Không xóa ngay các component được FlowLessonPlayer import gián tiếp.
- Có thể dọn các component legacy không còn route/import sau khi chạy `rg` xác nhận.

## 10. Các vấn đề kỹ thuật cần ưu tiên

### P1 - Tách registry khỏi `FlowLessonPlayer`

Hiện registry và toàn bộ renderer nằm chung một file. File đã lớn và khó mở rộng.

Đề xuất:

```txt
frontend/src/pages/lesson/flow/
  FlowLessonPlayer.jsx
  componentRegistry.js
  renderers/
    MediaRenderer.jsx
    DialogueRenderer.jsx
    MarkdownRenderer.jsx
    McqRenderer.jsx
    ...
```

### P1 - Đồng bộ contract frontend/backend

Ví dụ `dialogue` FE chấp nhận `dialogs`, backend chỉ chấp nhận `lines`.

Đề xuất:

- Chỉ giữ một chuẩn field.
- Viết schema/type docs cho từng component.
- Admin editor dùng cùng schema với backend validator.

### P1 - Validate sâu cấu trúc config

Các component matching/sorting cần validate:

- ID không trùng.
- Reference tồn tại.
- `correctPairs.leftId/rightId` tồn tại.
- `items.order` hợp lệ.
- `final_summary.quiz` có options/correctIndex hợp lệ.

### P2 - Sử dụng `completionRule` thật sự

Hiện completion logic nằm trong renderer.

Đề xuất:

- `completionRule.type = viewed | correct | all_revealed | all_matched | custom`
- Player có helper đánh giá completion.
- Renderer chỉ phát event/result.

### P2 - Progress UX theo component

Hiện progress bar chỉ dựa vào số completed IDs, sidebar không hiển thị từng component.

Đề xuất:

- Hiển thị checklist component trong sidebar.
- Cho phép quay lại component đã hoàn thành.
- Hiển thị score/attempts từng component.

### P2 - Chuẩn hóa icon/label component

Hiện type label là raw text tiếng Anh.

Đề xuất:

```js
{
  mcq: { label: "Trắc nghiệm", icon: "quiz" },
  markdown: { label: "Bài đọc", icon: "article" }
}
```

### P3 - Dọn legacy sau kiểm tra import

Sau khi xác nhận không còn dùng:

- Xóa component adventure cũ không còn import.
- Xóa CSS/asset cũ nếu không còn route.
- Cập nhật docs cũ như `lesson_deep_analysis.md` vì hiện còn mô tả `AdventureLessonPlayer` lớn, không phản ánh trạng thái mới.

## 11. Kết luận

Hệ thống Lesson hiện tại đã đạt lõi component-based:

- DB lưu `lessonFlow`.
- Backend validate type/config cơ bản.
- Frontend render bằng registry.
- Progress lưu theo component.
- Hoàn thành toàn flow sẽ complete node và unlock bài kế tiếp.

Những phần còn thiếu chủ yếu nằm ở chất lượng engineering của lesson engine:

- Registry chưa tách file.
- Schema chưa đủ sâu.
- Admin authoring chưa phải builder trực quan.
- `completionRule`, scoring, analytics chưa thành lớp generic.
- Một số component legacy còn tồn tại và cần dọn sau khi xác nhận không còn phụ thuộc.
