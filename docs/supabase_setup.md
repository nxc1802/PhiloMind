# PhiloMind — Cấu hình Supabase & Deployment

Do môi trường local không có sẵn database (env) để migrate trực tiếp, bạn cần thực hiện thủ công các bước sau để hoàn tất quá trình nâng cấp Big Update.

## 1. Cập nhật Database Schema trên Supabase

Truy cập vào Dashboard Supabase của dự án, mở phần **SQL Editor** và chạy đoạn script sau để cập nhật bảng `ConceptNode` với trường `lessonMedia` (cột kiểu JSONB) mới:

```sql
-- Thêm cột lessonMedia kiểu JSONB vào bảng ConceptNode nếu chưa có
ALTER TABLE "ConceptNode"
ADD COLUMN IF NOT EXISTS "lessonMedia" JSONB DEFAULT '[]'::jsonb;

-- (Tùy chọn) Thêm comment mô tả cho cột
COMMENT ON COLUMN "ConceptNode"."lessonMedia" IS 'Lưu trữ danh sách media assets (video, image) cho center column của bài học.';
```

Sau khi chạy xong, hãy sử dụng Postman hoặc Swagger để test API tạo node mới (`POST /courses/nodes`) với payload bao gồm trường `lessonMedia` xem dữ liệu có lưu thành công vào DB không.

## 2. Migrate Schema ở môi trường Development (Khi có .env)

Nếu bạn thiết lập lại `.env` chứa biến `DATABASE_URL`, hãy chạy lệnh sau ở thư mục `backend` để Prisma đồng bộ schema vào DB:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_lesson_media
```

## 3. Xác minh tính năng Frontend

Các tính năng vừa được triển khai:
- **Layout 3 Cột**: Hãy vào một trang bài học bất kỳ để xác nhận giao diện đã có 3 cột: Thanh điều hướng (Trái) - Media (Giữa) - Tương tác (Phải).
- **Tính năng Drag & Drop**: Test tính năng kéo thả trong các game: Phân loại thẻ (Category Sorting), Nối cột (Matching Columns) và Nối icon (Target Matching). 
- **Đường kẻ Bezier Curve**: Trong game Matching Columns, kéo thả từ cột trái sang cột phải, bạn sẽ thấy đường nối cong SVG hiển thị theo thời gian thực (đường màu xanh nếu đúng, màu đỏ nếu sai).
- **Thẻ lật 3D (Mindmap Reveal)**: Các lá bài mindmap giờ có giao diện lật 3D (Flip Card). Nó cũng sẽ tự động lật tuần tự (2s mỗi thẻ) nếu bạn thiết lập cấu hình trong schema của bài học.

## 4. Xây dựng và Deploy

Dự án Frontend đã vượt qua bài test build (hoàn thành trong ~4.7s). Bạn có thể triển khai lên Vercel/Netlify hoặc build image Docker cho backend:

- **Frontend**:
```bash
cd frontend
npm run build
```

- **Backend**:
```bash
cd backend
npm run build
npm run start:prod
```
