# Ke Hoach Nang Cap Lesson Theo Component Flow

Tai lieu nay tong hop tu:

- `docs/component-based-Lesson.md`: de xuat chuyen Lesson tu pipeline co dinh sang flow cac component doc lap.
- `docs/lesson_1b_mapping_and_improvements.md`: phan tich bai 1.b "Khai niem triet hoc" va cac gioi han khi map len Classic/Adventure hien tai.

Muc tieu nang cap: bien PhiloMind tu he thong bai hoc co cau truc cung thanh lesson engine linh hoat, trong do admin co the sap xep cac khoi tuong tac theo bat ky thu tu nao, frontend render theo registry, va progress/scoring duoc theo doi theo tung component.

---

## 1. Ket Luan Phan Tich

### 1.1 Van de hien tai

Lesson hien tai dang co 2 duong render chinh:

- Classic: `videoUrl -> warmups -> originalText -> podcast -> flashcards/final quiz`.
- Adventure: `storyIntro -> lessonContents -> minigame -> finalSummary`.

Cach nay phu hop voi bai hoc co format on dinh, nhung khong du cho bai 1.b vi bai nay can cac man hinh tuong tac rieng:

1. Target matching tren ban do co dai.
2. Category sorting the vao hop.
3. Mindmap click de lat mo y.
4. MCQ.
5. Matching columns.
6. True/false.
7. Final summary/celebration.

Neu ep vao Classic thi mat gan het tuong tac. Neu ep vao Adventure thi van bi khoa theo stage co dinh `intro/cognitive/social/summary/quiz/done`, khong cho dat minigame o dau bai, giua bai, hoac lap lai nhieu lan.

### 1.2 Huong dung

Them mot lop Lesson Flow moi song song voi Classic/Adventure:

```text
ConceptNode
  lessonType: "classic" | "adventure" | "flow"
  lessonFlow: [
    component_1,
    component_2,
    ...
  ]
```

Frontend se dung `FlowLessonPlayer` khi `lessonType === "flow"` hoac node co `lessonFlow`. Lesson cu van chay bang Classic/Adventure de tranh migration lon trong mot lan.

---

## 2. Hien Trang Du An Can Cham

### Backend

- `backend/prisma/schema.prisma`
  - `ConceptNode` da co cac cot JSON: `storyIntro`, `lessonContents`, `minigame`, `finalSummary`.
  - `Progress` hien con theo field cung: `lessonCompleted`, `flashcardCompleted`, `podcastCompleted`, `quizCompleted`.
- `backend/src/courses/dto/create-node.dto.ts` va `update-node.dto.ts`
  - Chua co `lessonFlow`.
  - Cac truong JSON dang de `any`.
- `backend/src/courses/validators/node-schema.validator.ts`
  - Validator moi validate schema cu, chua co component registry/schema.
- `backend/src/courses/courses.service.ts`
  - Create/update node da luu cac field JSON cu.
  - `completeNode` moi complete ca node, chua co complete theo component.

### Frontend user

- `frontend/src/pages/Lesson.jsx`
  - Dang lazy load `ClassicLessonPlayer` va `AdventureLessonPlayer`.
- `frontend/src/pages/lesson/ClassicLessonPlayer.jsx`
  - Flow co dinh theo video/warmup/markdown/podcast/quiz.
- `frontend/src/pages/lesson/AdventureLessonPlayer.jsx`
  - Flow co dinh theo stage, lay data tu `storyIntro`, `lessonContents`, `minigame`, `finalSummary`.
- `frontend/src/pages/lesson/adventure/*`
  - Co the tai su dung mot so UI nhu `FinalQuizStage`, `ChainGame`, `GradedQuestion`, nhung can tach thanh component renderer doc lap.

### Admin

- `admin/src/pages/Nodes.jsx`
  - Admin nhap `storyIntro`, `lessonContents`, `minigame`, `finalSummary` bang JSON text.
  - Chua co builder keo-tha, preview component, validation than thien, version/publish.

---

## 3. Kien Truc Dich

### 3.1 Lesson component contract

Moi component trong `lessonFlow` nen co contract thong nhat:

```ts
type LessonComponent = {
  id: string;
  type:
    | "dialogue"
    | "media"
    | "markdown"
    | "target_matching"
    | "category_sorting"
    | "mindmap_reveal"
    | "mcq"
    | "matching_columns"
    | "true_false"
    | "final_summary";
  title?: string;
  config: Record<string, unknown>;
  completionRule?: {
    type: "viewed" | "correct" | "score_at_least" | "manual";
    value?: number;
  };
  scoring?: {
    maxScore?: number;
    attemptsAllowed?: number;
    forceUntilCorrect?: boolean;
  };
  feedback?: {
    correct?: string;
    incorrect?: string;
    reveal?: string;
  };
};
```

Quy uoc:

- `id` la component instance id, khong phai type id. Cung mot type co the xuat hien nhieu lan trong mot lesson.
- `type` la khoa tra renderer/validator trong registry.
- `config` chua data dac thu cua tung component.
- `completionRule`, `scoring`, `feedback` la metadata dung chung de player/progress khong phai biet tung component qua sau.

### 3.2 Component registry

Frontend can mot registry trung tam:

```ts
const lessonComponentRegistry = {
  dialogue: DialogueRenderer,
  media: MediaRenderer,
  markdown: MarkdownRenderer,
  target_matching: TargetMatchingRenderer,
  category_sorting: CategorySortingRenderer,
  mindmap_reveal: MindmapRevealRenderer,
  mcq: MCQRenderer,
  matching_columns: MatchingColumnsRenderer,
  true_false: TrueFalseRenderer,
  final_summary: FinalSummaryRenderer,
};
```

Backend can registry/validator tuong ung de reject data sai truoc khi luu.

### 3.3 Progress dong

Giai doan dau nen mo rong `Progress` de it thay doi API:

```prisma
model Progress {
  ...
  activeComponentId     String?
  currentComponentIndex Int     @default(0)
  completedComponentIds Json?
  componentResults      Json?
}
```

`componentResults` luu dang:

```json
[
  {
    "componentId": "worldview-sorting",
    "type": "category_sorting",
    "status": "completed",
    "score": 100,
    "attempts": 1,
    "answer": {},
    "completedAt": "2026-06-27T00:00:00.000Z"
  }
]
```

Sau khi analytics can truy van nang cao, co the tach thanh bang rieng `LessonComponentAttempt`, nhung khong nen lam ngay trong phase dau.

---

## 4. Roadmap Trien Khai

### Phase 1 - Backend foundation va backward compatibility

Muc tieu: co the luu/tra ve `lessonFlow` ma khong pha lesson cu.

Viec can lam:

- Them cot `lessonFlow Json?` vao `ConceptNode`.
- Them progress fields dong: `activeComponentId`, `currentComponentIndex`, `completedComponentIds`, `componentResults`.
- Cap nhat `CreateNodeDto`/`UpdateNodeDto` de nhan `lessonFlow`.
- Them `NodeSchemaValidator.validateLessonFlow(data)`.
- Trong `createNode`/`updateNode`, validate va luu `lessonFlow`.
- Them helper `buildLegacyLessonFlow(node)` o backend hoac frontend de fallback tu schema cu sang flow khi can preview.
- Khong xoa `storyIntro`, `lessonContents`, `minigame`, `finalSummary`, `warmups`, `flashcards`.

Acceptance criteria:

- Tao/update node `lessonType: "flow"` voi `lessonFlow` hop le thanh cong.
- Node cu `classic`/`adventure` van render nhu hien tai.
- Data sai type/component id/config bi reject voi loi ro rang.

### Phase 2 - FlowLessonPlayer va renderer registry

Muc tieu: frontend user co engine chung de render danh sach component.

Viec can lam:

- Tao `frontend/src/pages/lesson/flow/FlowLessonPlayer.jsx`.
- Tao `frontend/src/pages/lesson/flow/componentRegistry.js`.
- Tao state machine don gian:
  - `activeIndex`
  - `completedComponentIds`
  - `componentResults`
  - `canGoNext`
- Cap nhat `frontend/src/pages/Lesson.jsx`:
  - Neu `currentNodeDetails.lessonType === "flow"` hoac co `lessonFlow`, lazy load `FlowLessonPlayer`.
  - Neu khong, giu Classic/Adventure.
- Tai su dung component co san:
  - `MarkdownRenderer` cho markdown/read block.
  - `GradedQuestion` cho MCQ/true-false ban dau.
  - `FinalQuizStage`/`CompletionStage` cho final neu phu hop.
- Them fallback UI cho unknown component type.

Acceptance criteria:

- Mot flow gom `dialogue -> markdown -> mcq -> final_summary` chay end-to-end.
- User co the refresh trang va tiep tuc tu component dang hoc.
- Revisit lesson da complete van xem lai duoc.

### Phase 3 - Component set toi thieu cho bai 1.b

Muc tieu: dua duoc bai 1.b len dung tinh than gamified.

Thu tu nen lam:

1. `MCQRenderer`
2. `TrueFalseRenderer`
3. `MatchingColumnsRenderer`
4. `CategorySortingRenderer`
5. `MindmapRevealRenderer`
6. `TargetMatchingRenderer`
7. `FinalSummaryRenderer`

Ghi chu:

- `MatchingColumnsRenderer` co the tai su dung logic tu quiz matching neu tach duoc phan core.
- `CategorySortingRenderer` va `TargetMatchingRenderer` can drag/drop tot tren mobile. Nen chon thu vien DnD ho tro pointer/touch on dinh thay vi tu viet event thap.
- `MindmapRevealRenderer` khong can 3D o phase dau; uu tien click reveal va completion tracking dung.
- Final 3D spiral la nice-to-have, lam sau khi core flow on dinh.

Acceptance criteria:

- Bai 1.b co flow:

```text
target_matching
-> category_sorting
-> mindmap_reveal
-> mcq
-> matching_columns
-> true_false
-> final_summary
```

- Moi component co validate config, complete rule, scoring toi thieu.
- Player khong can hard-code rieng bai 1.b.

### Phase 4 - Component progress API

Muc tieu: tracking theo tung component thay vi chi complete ca node.

Viec can lam:

- Them endpoint:
  - `PATCH /courses/nodes/:nodeId/component-progress`
  - Body: `{ activeComponentId, currentComponentIndex, completedComponentIds, componentResult }`
- Khi tat ca required components complete thi goi logic complete node hien tai de unlock bai tiep theo.
- Cap nhat React Query invalidation cho journey/node details.
- Giu `completeNode` hien tai cho Classic/Adventure.

Acceptance criteria:

- Hoc vien dang o component 4 refresh lai khong mat tien trinh.
- Ket qua tung component co score/attempts.
- Hoan thanh component cuoi van unlock bai tiep theo nhu hien tai.

### Phase 5 - Admin Lesson Builder

Muc tieu: admin khong phai viet JSON thu cong.

Nen chia 2 buoc:

#### 5A. Schema editor + preview nhanh

- Them tab `Lesson Flow` trong `admin/src/pages/Nodes.jsx`.
- Ban dau van cho nhap JSON, nhung co:
  - format/validate button,
  - danh sach component doc duoc tu JSON,
  - preview bang renderer user neu co the.
- Hien thi loi validator theo component id/type.

#### 5B. Builder keo-tha

- Sidebar component palette.
- Flow canvas sap xep component.
- Form editor theo type.
- Duplicate/remove/reorder component.
- Preview lesson.
- Draft/publish/version.

Acceptance criteria:

- Admin tao bai 1.b bang UI ma khong can sua code frontend.
- Admin reorder component va preview thay doi ngay.
- Draft khong anh huong node dang publish cho user.

### Phase 6 - Migration noi dung

Muc tieu: giam song song schema cu lau dai.

Viec can lam:

- Viet script convert `storyIntro/lessonContents/minigame/finalSummary` thanh `lessonFlow` cho adventure node.
- Convert Classic node theo dang:
  - `media(video)` neu co `videoUrl`
  - `warmup`/`mcq` neu co warmups
  - `markdown` tu `originalText`
  - `media(audio)`/`podcast`
  - `mcq` tu flashcards neu phu hop
  - `final_summary`
- Chay dry-run, sinh report truoc khi update DB.
- Giu adapter fallback toi khi tat ca node quan trong da migrate.

Acceptance criteria:

- Co report node nao convert duoc, node nao can sua tay.
- Khong mat flashcards/podcast/warmups hien co.

### Phase 7 - QA, release, rollback

Muc tieu: release an toan.

Can test:

- Backend unit test cho `validateLessonFlow`.
- Service test cho create/update node co `lessonFlow`.
- Frontend unit test cho registry va cac renderer co logic scoring.
- E2E happy path bai 1.b.
- Regression Classic/Adventure.
- Mobile/touch test cho drag/drop.

Rollback:

- Neu flow player loi, set `lessonType` ve `classic`/`adventure` hoac an `lessonFlow`.
- Khong xoa field cu trong it nhat 1 release cycle.

---

## 5. Mau Lesson Flow Cho Bai 1.b

Day la khung du lieu muc tieu, chua phai final content:

```json
[
  {
    "id": "ancient-origin-map",
    "type": "target_matching",
    "title": "Nguon goc thuat ngu triet hoc",
    "config": {
      "targets": [
        { "id": "china", "label": "Trung Quoc", "x": 72, "y": 42 },
        { "id": "india", "label": "An Do", "x": 58, "y": 55 },
        { "id": "greece", "label": "Hy Lap", "x": 42, "y": 39 }
      ],
      "items": [
        { "id": "zhe", "text": "哲", "targetId": "china" },
        { "id": "darsana", "text": "Dar'sana", "targetId": "india" },
        { "id": "philosophia", "text": "φιλοσοφία", "targetId": "greece" }
      ],
      "summary": "Triet hoc xuat hien tu nhung trung tam van minh lon va the hien nhu cau nhan thuc bac cao cua con nguoi."
    },
    "completionRule": { "type": "correct" },
    "scoring": { "maxScore": 100, "forceUntilCorrect": true }
  },
  {
    "id": "worldview-sorting",
    "type": "category_sorting",
    "title": "Phan loai the gioi quan",
    "config": {
      "categories": [
        { "id": "myth-religion", "label": "Than thoai - Ton giao" },
        { "id": "philosophy", "label": "Triet hoc" }
      ],
      "cards": [
        { "id": "faith", "text": "Niem tin", "categoryId": "myth-religion" },
        { "id": "ritual", "text": "Nghi le", "categoryId": "myth-religion" },
        { "id": "reason", "text": "Cong cu ly tinh", "categoryId": "philosophy" },
        { "id": "law", "text": "Quy luat", "categoryId": "philosophy" }
      ],
      "summary": "Triet hoc khac than thoai - ton giao o noi no tim cach ly giai the gioi bang ly tinh va khai quat."
    },
    "completionRule": { "type": "correct" },
    "scoring": { "maxScore": 100, "forceUntilCorrect": true }
  },
  {
    "id": "philosophy-core-features",
    "type": "mindmap_reveal",
    "title": "Bon dac trung cot loi cua triet hoc",
    "config": {
      "center": "Triet hoc",
      "nodes": [
        { "id": "worldview", "label": "Hat nhan the gioi quan", "detail": "Triet hoc giu vai tro dinh huong cach con nguoi nhin the gioi." },
        { "id": "generalization", "label": "Tinh khai quat cao", "detail": "Triet hoc tim nhung van de chung nhat cua the gioi va con nguoi." },
        { "id": "reasoning", "label": "Lap luan ly tinh", "detail": "Triet hoc dua vao ly luan, phan tich va chung minh." },
        { "id": "method", "label": "Phuong phap luan", "detail": "Triet hoc cung cap cach tiep can va dinh huong nhan thuc." }
      ]
    },
    "completionRule": { "type": "viewed" }
  },
  {
    "id": "marxist-definition-mcq",
    "type": "mcq",
    "title": "Dinh nghia triet hoc Mac - Lenin",
    "config": {
      "question": "Dinh nghia nao gan dung nhat voi triet hoc Mac - Lenin?",
      "options": [
        { "id": "a", "text": "Tap hop cac niem tin ton giao.", "isCorrect": false },
        { "id": "b", "text": "He thong tri thuc ly luan chung nhat ve the gioi, vi tri con nguoi trong the gioi va phuong phap nhan thuc, cai tao the gioi.", "isCorrect": true },
        { "id": "c", "text": "Mot khoa hoc thuc nghiem nghien cuu rieng mot linh vuc.", "isCorrect": false }
      ]
    },
    "completionRule": { "type": "correct" }
  },
  {
    "id": "philosophy-vs-science-matching",
    "type": "matching_columns",
    "title": "Phan biet tri thuc triet hoc va khoa hoc cu the",
    "config": {
      "leftColumn": [
        { "id": "philosophy", "text": "Tri thuc triet hoc" },
        { "id": "specific-science", "text": "Khoa hoc cu the" },
        { "id": "worldview", "text": "The gioi quan" }
      ],
      "rightColumn": [
        { "id": "general", "text": "Khai quat nhung van de chung nhat" },
        { "id": "domain", "text": "Nghien cuu mot linh vuc, doi tuong cu the" },
        { "id": "orientation", "text": "Dinh huong cach con nguoi nhin nhan the gioi" }
      ],
      "correctPairs": [
        { "leftId": "philosophy", "rightId": "general" },
        { "leftId": "specific-science", "rightId": "domain" },
        { "leftId": "worldview", "rightId": "orientation" }
      ]
    },
    "completionRule": { "type": "correct" }
  },
  {
    "id": "all-philosophy-is-science",
    "type": "true_false",
    "title": "Ket bai",
    "config": {
      "statement": "Moi hoc thuyet triet hoc deu la khoa hoc.",
      "correctAnswer": false,
      "explanation": "Khong phai moi hoc thuyet triet hoc deu khoa hoc; tinh khoa hoc phu thuoc vao co so ly luan, phuong phap va kha nang phan anh dung hien thuc."
    },
    "completionRule": { "type": "correct" }
  },
  {
    "id": "lesson-1b-final",
    "type": "final_summary",
    "title": "Hoan thanh bai 1.b",
    "config": {
      "message": "Ban da nam duoc khai niem triet hoc va vi tri cua triet hoc trong the gioi quan.",
      "keyTakeaways": [
        "Triet hoc la hinh thai y thuc xa hoi co tinh khai quat cao.",
        "Triet hoc la hat nhan ly luan cua the gioi quan.",
        "Can phan biet tri thuc triet hoc voi tri thuc cua cac khoa hoc cu the."
      ],
      "rewards": { "xp": 120, "badge": "Nguoi khai mo tu duy" }
    },
    "completionRule": { "type": "viewed" }
  }
]
```

---

## 6. Thu Tu Uu Tien Khuyen Nghi

1. Lam backend `lessonFlow` + validator truoc.
2. Lam `FlowLessonPlayer` voi registry va 3 renderer don gian: `markdown`, `mcq`, `final_summary`.
3. Them progress theo component.
4. Lam cac renderer tuong tac cho bai 1.b.
5. Sau khi user flow on dinh moi dau tu admin builder keo-tha.
6. MDX/custom markdown tags nen de sau, vi no la cach nhung component trong bai doc, khong phai loi kien truc can de giai bai 1.b.

Ly do: neu lam admin builder truoc khi co engine/contract on dinh, UI se phai sua lai nhieu lan. Engine va schema la nen tang can dong bang truoc.

---

## 7. Rủi Ro Va Cach Giam

| Rui ro | Cach giam |
| --- | --- |
| Pha lesson cu | Giu Classic/Adventure, them Flow song song, khong xoa field cu trong phase dau |
| Schema JSON tro nen tuy tien | Dung registry validator theo `type`, bat buoc `id/type/config` |
| Drag/drop loi tren mobile | Chon thu vien DnD ho tro touch tot, test mobile som |
| Progress mat khi refresh | Luu component progress len backend sau moi component complete |
| Admin builder qua lon | Lam 5A schema editor + preview truoc, 5B drag/drop sau |
| Renderer phu thuoc content bai 1.b | Tat ca renderer nhan `config`, khong hard-code text cua bai 1.b |

---

## 8. Definition Of Done Cho Ban Nang Cap Dau Tien

Ban dau tien nen duoc coi la xong khi:

- Co `lessonType: "flow"` va `lessonFlow` trong database/API.
- Backend validate duoc it nhat 7 component cua bai 1.b.
- Frontend render bai 1.b end-to-end bang `FlowLessonPlayer`.
- Progress duoc luu theo component va complete node cuoi bai van unlock bai tiep theo.
- Admin co it nhat JSON schema editor + validate + preview cho `lessonFlow`.
- Classic/Adventure lesson cu khong bi regression.

