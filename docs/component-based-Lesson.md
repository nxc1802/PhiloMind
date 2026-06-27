## Idea nâng cấp phần **Lesson** cho PhiloMind

Nâng cấp hệ thống Lesson theo hướng **Component-based Lesson Flow** thay vì cấu trúc bài học cố định.

### 1. Tư tưởng chính

Mỗi bài học không còn bị ép theo format:

```text
Video → Warmup → Content → Podcast → Quiz
```

mà sẽ trở thành một **pipeline/flow tự do** gồm nhiều component độc lập:

```text
Lesson = Component 1 → Component 2 → Component 3 → ... → Component N
```

Admin có thể thêm bất kỳ component nào vào bất kỳ vị trí nào trong lesson, dùng lại nhiều lần, hoặc bỏ qua nếu không cần.

---

## 2. Cấu trúc đề xuất

```text
Lesson
 └── Flow
      ├── Dialogue Component
      ├── Drag & Drop Component
      ├── Category Sorting Component
      ├── Mindmap Reveal Component
      ├── MCQ Component
      ├── Matching Component
      ├── True/False Component
      └── Final Summary Component
```

Mỗi component là một đơn vị độc lập, có:

```text
id
type
title
config
completionRule
scoring
feedback
```

Ví dụ:

```ts
{
  id: "worldview-sorting",
  type: "category_sorting",
  title: "Phân loại thế giới quan",
  config: {
    categories: ["Thần thoại - Tôn giáo", "Triết học"],
    cards: ["Niềm tin", "Nghi lễ", "Lý tính", "Quy luật"]
  }
}
```

---

## 3. Lợi ích chính

| Lợi ích                     | Ý nghĩa                                         |
| --------------------------- | ----------------------------------------------- |
| Tự do thiết kế bài học      | Mỗi lesson có thể có flow riêng                 |
| Tái sử dụng component       | Một component dùng được cho nhiều bài           |
| Dễ mở rộng                  | Thêm component mới không ảnh hưởng lesson cũ    |
| Dễ cá nhân hóa              | Có thể tạo nhiều kiểu lesson khác nhau          |
| Hỗ trợ gamification tốt hơn | Dễ thêm minigame, tương tác, thử thách          |
| Quản lý progress linh hoạt  | Theo dõi theo từng component thay vì field cứng |

---

## 4. Kiến trúc nên có

```text
Lesson Engine
 ├── Lesson Flow
 ├── Component Registry
 ├── Component Renderer
 ├── Validation Layer
 ├── Progress Tracker
 ├── Scoring System
 └── Admin Lesson Builder
```

### Component Registry

Là nơi đăng ký tất cả component mà hệ thống hỗ trợ:

```ts
const componentRegistry = {
  mcq: MCQRenderer,
  true_false: TrueFalseRenderer,
  matching: MatchingRenderer,
  category_sorting: CategorySortingRenderer,
  target_matching: TargetMatchingRenderer,
  mindmap_reveal: MindmapRevealRenderer,
  dialogue: DialogueRenderer,
  markdown: MarkdownRenderer
};
```

Khi cần thêm component mới, chỉ cần thêm vào registry, không cần sửa cấu trúc Lesson.

---

## 5. Progress tracking mới

Không nên lưu kiểu cứng:

```ts
videoCompleted
warmupCompleted
quizCompleted
```

mà nên lưu theo component:

```ts
{
  lessonId: "lesson-1b",
  currentComponentIndex: 3,
  completedComponentIds: [
    "intro-map",
    "worldview-sorting",
    "mindmap-reveal"
  ],
  componentResults: [
    {
      componentId: "worldview-sorting",
      score: 100,
      attempts: 1,
      status: "completed"
    }
  ]
}
```

Như vậy bài học có 3 bước, 7 bước hay 15 bước đều hoạt động được.

---

## 6. Admin Lesson Builder

Cần xây dựng giao diện cho admin tạo lesson bằng cách kéo thả component:

```text
[+ Add Component]

1. Dialogue
2. Drag & Drop Map
3. Category Sorting
4. Mindmap Reveal
5. MCQ
6. Matching
7. Final Summary
```

Admin có thể:

```text
Thêm component
Sắp xếp lại thứ tự
Cấu hình nội dung
Xem trước bài học
Validate lỗi
Publish lesson
Quản lý version
```

---

## 7. Mapping với bài 1.b

Bài **1.b Khái niệm triết học** có thể được biểu diễn như sau:

```text
Target Matching Map
→ Category Sorting
→ Mindmap Reveal
→ MCQ
→ Matching Columns
→ True/False
→ Final Summary
```

Không cần ép bài học vào Classic hoặc Adventure cố định nữa.

---

## 8. Kết luận cô đọng

Ý tưởng nâng cấp Lesson nên là:

> Biến Lesson thành một flow linh hoạt gồm nhiều component độc lập.
> Component có thể được thêm, xóa, tái sử dụng, sắp xếp tự do trong từng bài học.
> Frontend render component theo registry.
> Progress, scoring và analytics được lưu theo từng component instance.
> Admin có thể tự thiết kế bài học mới mà không cần developer chỉnh lại cấu trúc Lesson cũ.

Đây là hướng giúp PhiloMind mở rộng từ một app học bài cố định thành một **nền tảng thiết kế bài học tương tác/gamified** linh hoạt hơn.
