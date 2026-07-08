# Lesson Component Data

Nguồn chuyển đổi: `data/data_lesson.txt`

Contract đối chiếu: `docs/LESSON_COMPONENTS.md` (audit 2026-07-06)

Thư mục này lưu dữ liệu lesson đã được chuyển từ kịch bản prose sang `lessonFlow` component JSON để kiểm tra trước khi đưa vào seed hoặc DB.

## Files

- `manifest.json`: danh sách lesson đã convert và thứ tự học.
- `chapter-1-1a-nguon-goc-triet-hoc.json`: bài 1.1.a.
- `chapter-1-1b-khai-niem-triet-hoc.json`: bài 1.1.b.
- `chapter-1-1c-triet-hoc-hat-nhan-the-gioi-quan.json`: bài 1.1.c.
- `component-gap-analysis.md`: nhận xét về khả năng biểu diễn bằng component hiện tại và đề xuất component mới.
- `validate.mjs`: kiểm tra nhanh component type, id trùng, và required config theo contract hiện tại.

Các lesson có `status: "converted"` trong manifest là nguồn seed cho lesson đã chuyển đổi. Backend seed và script `backend/prisma/reseed_lessons.ts` đọc trực tiếp các file này.

## Validate

```bash
node data/lesson_components/validate.mjs
```

Script này không thay DB và không phụ thuộc backend runtime.
