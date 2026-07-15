# Proposed Components

## 1. `fill_in_blanks` (Điền khuyết)

### Lý do đề xuất
Trong nhiều nội dung học tập, đặc biệt là triết học hay chính trị học, việc ghi nhớ nguyên văn một câu luận điểm hoặc nhận định là rất quan trọng. Ví dụ: việc học thuộc một nhận định của C. Mác hay V.I. Lênin bằng cách điền các từ khóa còn thiếu vào một đoạn văn dài.

Nếu chúng ta ép các nội dung này vào dạng `mcq` (Trắc nghiệm 1 câu) hay `matching_columns` (Ghép cột) thì sẽ làm mất đi bối cảnh của câu văn, khiến người học thấy gượng ép và khó hiểu.

### Định dạng JSON (Data Model)

```json
{
  "id": "unique-step-id",
  "type": "fill_in_blanks",
  "title": "Tên bài tập điền khuyết",
  "config": {
    "instruction": "Hãy kéo thả các từ khóa (hoặc gõ vào) chỗ trống để hoàn chỉnh đoạn văn sau.",
    "textWithBlanks": "Triết học không chỉ giải thích thế giới hiện tồn, mà phải trở thành công cụ nhận thức khoa học để [blank_1] bằng cách mạng.",
    "blanks": [
      {
        "id": "blank_1",
        "correctAnswer": "cải tạo thế giới",
        "distractors": ["thích nghi với thế giới", "bảo vệ thế giới"]
      }
    ],
    "successFeedback": "Chính xác! Luận điểm này nhấn mạnh chức năng cải tạo thế giới của triết học."
  },
  "completionRule": { "type": "correct" }
}
```

### Giải thích các field:
- `textWithBlanks`: Đoạn văn chứa các thẻ đánh dấu vị trí chỗ trống (ví dụ `[blank_id]`).
- `blanks`: Mảng định nghĩa chi tiết cho từng khoảng trống.
  - `id`: Định danh của chỗ trống (khớp với tag trong `textWithBlanks`).
  - `correctAnswer`: Đáp án đúng.
  - `distractors` (tuỳ chọn): Các phương án sai nhiễu. Nếu mảng này có dữ liệu, UI có thể hiển thị dạng dropdown list tại chỗ trống, hoặc dạng word bank (ngân hàng từ vựng) ở bên dưới đoạn văn để người dùng kéo thả/chọn. Nếu không có `distractors`, UI có thể yêu cầu người dùng tự gõ text (dạng input).

### Runtime Behavior
- **Dạng có sẵn từ khóa (Word Bank / Dropdown):** Hiển thị các `correctAnswer` và `distractors` xáo trộn ngẫu nhiên. Người học chọn từ khóa điền vào chỗ trống.
- **Dạng nhập liệu (Typing):** Người học tự gõ từ. Validate bằng cách so sánh string (có thể ignore case/khoảng trắng).
- **Completion Rule:** Chỉ hoàn thành khi tất cả các `blanks` đều được điền đúng (`completionRule.type = "correct"`).
