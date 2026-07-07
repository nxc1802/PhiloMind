# Component Gap Analysis

Nguồn phân tích:

- `data/data_lesson.txt`
- `docs/LESSON_COMPONENTS.md`
- `backend/src/courses/validators/node-schema.validator.ts`
- `frontend/src/pages/lesson/flow/components/componentRegistry.js`

## Kết luận cho bài 1.1.a-1.1.c

Ba bài 1.1.a đến 1.1.c có thể biểu diễn bằng component hiện tại mà không cần thêm type bắt buộc.

Mapping chính:

| Lesson | Nội dung prose                             | Component hiện tại                                      |
| ------ | ------------------------------------------ | ------------------------------------------------------- |
| 1.1.a  | Dẫn nhập + lựa chọn hành trình             | `component_group` + `dialogue` + `mcq`                  |
| 1.1.a  | Thử thách nhận thức                        | `dialogue`, `mcq`, `component_group`, `knowledge_piece` |
| 1.1.a  | Trải nghiệm Borin/Theon                    | 2 `component_group` top-level riêng                     |
| 1.1.a  | Chuỗi nhân quả                             | `chain_sorting`                                         |
| 1.1.a  | Tổng kết nguồn gốc                         | `mindmap_reveal`, `quiz_sequence`, `final_summary`      |
| 1.1.b  | Bản đồ 3 vùng văn minh                     | `map_target_matching`                                   |
| 1.1.b  | Phân loại thần thoại/tôn giáo và triết học | `category_sorting`                                      |
| 1.1.b  | Lật mảnh ghép định nghĩa                   | `mindmap_reveal`                                        |
| 1.1.c  | Chọn định nghĩa đúng                       | `mcq`                                                   |
| 1.1.c  | Ghép đôi tính đặc thù                      | `matching_columns`                                      |
| 1.1.c  | Đúng/Sai mọi triết học đều là khoa học     | `true_false`                                            |

## Component mới đã build

Không có blocker cho 1.1.a-1.1.c. Các component sau đã được build vào frontend/backend contract để giữ sát trải nghiệm mô tả trong `data_lesson.txt`.

### 1. `map_target_matching` (đã dùng cho 1.1.b)

Lý do:

- Bài 1.1.b mô tả bản đồ thế giới cổ đại với 3 vùng phát sáng.
- `target_matching` hiện đủ dữ liệu logic, nhưng không biểu diễn được tọa độ vùng, hotspot bản đồ, đường bay khối đá vào vùng.

Gợi ý config:

```json
{
  "mapImage": "ancient-world-map",
  "targets": [
    { "id": "china", "label": "Trung Quốc", "x": 72, "y": 44 },
    { "id": "india", "label": "Ấn Độ", "x": 58, "y": 55 },
    { "id": "greece", "label": "Hy Lạp", "x": 34, "y": 46 }
  ],
  "items": [{ "id": "zhe", "text": "哲", "targetId": "china" }]
}
```

### 2. `progression_spiral` (đã dùng cho 1.1.c)

Lý do:

- Bài 1.1.c mô tả đường xoáy ốc 3D của lịch sử tư tưởng sau câu hỏi Đúng/Sai.
- `knowledge_piece` và `final_summary` đủ truyền tải nội dung, nhưng chưa diễn đạt tốt ý "vòng khâu/mắt khâu" theo tiến trình lịch sử.

Gợi ý config:

```json
{
  "center": "Lịch sử tư tưởng triết học",
  "milestones": [
    {
      "id": "ancient",
      "label": "Triết học cổ đại",
      "summary": "Đặt nền móng tư duy lý luận."
    },
    {
      "id": "marxist",
      "label": "Triết học Mác - Lênin",
      "summary": "Bước phát triển khoa học trong lịch sử triết học."
    }
  ]
}
```

### 3. `timeline_explorer` (sẵn sàng cho 1.1.d)

Lý do:

- Phần 1.1.d trong `data_lesson.txt` mô tả rất nhiều mốc lịch sử: cổ đại, trung cổ, cận đại, hiện đại.
- Có thể biểu diễn bằng `sequence_sorting`, `mindmap_reveal`, `category_sorting`, nhưng sẽ thiếu UI điều hướng theo thời kỳ.

Gợi ý config:

```json
{
  "periods": [
    { "id": "ancient", "label": "Thời kỳ cổ đại", "components": [] },
    { "id": "medieval", "label": "Thời trung cổ", "components": [] },
    { "id": "modern", "label": "Thời cận đại", "components": [] }
  ]
}
```

### 4. `hotspot_gallery` (sẵn sàng cho Chương 2)

Lý do:

- Chương 2 trong `data_lesson.txt` mô tả click chân dung Platon, Protagoras, Anaximander, Democritus và các nhà duy vật cận đại.
- Có thể dùng `mindmap_reveal`, nhưng thiếu ảnh, hotspot, trạng thái đã khám phá và modal nhân vật.

Gợi ý config:

```json
{
  "items": [
    {
      "id": "platon",
      "image": "data/asset/platon.jpg",
      "title": "Platon",
      "detail": "Đại diện chủ nghĩa duy tâm khách quan."
    }
  ]
}
```

## Ưu tiên

1. Seed 1.1.b dùng `map_target_matching` để biểu diễn bản đồ 3 vùng văn minh.
2. Seed 1.1.c dùng `progression_spiral` để biểu diễn đường xoáy ốc lịch sử tư tưởng.
3. `timeline_explorer` và `hotspot_gallery` chưa dùng trong 1.1.a-1.1.c, nhưng đã có contract/renderer để dùng cho 1.1.d và Chương 2.
