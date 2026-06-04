# Bộ Khung Thiết Kế Bài Học Đồng Bộ Hệ Thống (Admin & User)

## 1. Tổng Quan Hệ Thống

Toàn bộ bài học trong hệ thống được triển khai theo một bộ khung thống nhất gồm 4 giai đoạn chính:

1. Dẫn truyện
2. Nội dung chi tiết bài học
3. Minigame tương tác
4. Final (Đúc kết bài học)

Hệ thống được thiết kế để đồng bộ giữa giao diện Admin thiết kế bài học và giao diện User trải nghiệm bài học.

---

# 2. Giai Đoạn 1 — Dẫn Truyện

## 2.1 Mô tả

Phần dẫn truyện đóng vai trò mở đầu bài học, giúp dẫn dắt nội dung và tạo ngữ cảnh trước khi bắt đầu học.

## 2.2 Thành phần giao diện

- Khung hình nhân vật dẫn truyện

  - Nhân vật ở trạng thái đang ngồi nói chuyện
  - Có thể sử dụng image hoặc animation

- Khung hội thoại kiểu manga/comic

  - Nội dung hiển thị dạng bubble thoại
  - Các câu thoại hiển thị tuần tự
  - Câu thoại mới sẽ đè lên câu thoại cũ
  - Có hỗ trợ thay đổi vị trí và hiệu ứng chuyển động linh hoạt

## 2.3 Luồng hoạt động

1. Hiển thị nhân vật dẫn truyện
2. Hiển thị lần lượt các đoạn hội thoại
3. Sau khi hoàn thành toàn bộ đoạn dẫn:
   - Hiển thị button chuyển tiếp
   - Nội dung button được tùy chỉnh bởi Admin
   - Ví dụ:
     - “Bắt đầu bài học”
     - “Tiếp tục”
     - “Khám phá ngay”

---

# 3. Giai Đoạn 2 — Nội Dung Chi Tiết Bài Học

## 3.1 Mô tả

Đây là phần nội dung chính của bài học.

Khung nội dung có thể lặp lại N lần tùy theo số lượng khái niệm hoặc nội dung chính mà bài học cần truyền tải.

Mỗi vòng lặp đại diện cho 1 khái niệm chính.

---

## 3.2 Cấu trúc của mỗi khái niệm

### Bước 1 — Hiển thị media

Hệ thống hiển thị:

- Video  
  hoặc
- Image

Media đóng vai trò mô tả tình huống hoặc kiến thức nền cho nội dung đang học.

---

### Bước 2 — Hiển thị câu hỏi

Sau khi xem media:

- Hiển thị câu hỏi tương ứng
- Hiển thị danh sách đáp án lựa chọn

Hỗ trợ:

- Single choice
- Multiple choice (nếu cần mở rộng)

---

### Bước 3 — Kiểm tra đáp án

Sau khi User chọn đáp án:

#### Nếu đúng:

- Hiển thị giải thích:
  - Vì sao đáp án đúng
  - Ý nghĩa của kiến thức liên quan

#### Nếu sai:

- Hiển thị giải thích:
  - Vì sao đáp án sai
  - Gợi ý kiến thức liên quan
- User bắt buộc chọn lại cho đến khi chọn đúng

---

### Bước 4 — Đúc kết khái niệm

Sau khi hoàn thành một nhóm câu hỏi:

- Hiển thị phần đúc kết khái niệm
- Nội dung này tổng hợp kiến thức vừa học

Ví dụ:

- Định nghĩa
- Quy tắc
- Công thức
- Kết luận chính

---

## 3.3 Chuyển sang khái niệm tiếp theo

Nếu bài học còn nội dung:

- Hệ thống tiếp tục:
  1. Hiển thị media mới
  2. Đặt câu hỏi mới
  3. Giải thích đáp án
  4. Đúc kết khái niệm mới

Quy trình lặp lại cho đến khi hoàn thành toàn bộ nội dung bài học.

---

# 4. Giai Đoạn 3 — Minigame

## 4.1 Mô tả

Minigame được triển khai sau khi User hoàn thành toàn bộ phần nội dung bài học.

Mục tiêu:

- Củng cố kiến thức
- Tăng tính tương tác
- Kiểm tra mức độ ghi nhớ

Admin có thể lựa chọn 1 trong 3 loại minigame.

---

## 4.2 Các loại Minigame

### Loại 1 — Sắp xếp 1 cột

#### Mô tả

User kéo thả các component text để sắp xếp theo đúng thứ tự từ trên xuống dưới.

#### Ví dụ

- Quy trình thực hiện
- Các bước thao tác
- Thứ tự sự kiện

---

### Loại 2 — Matching 2 cột

#### Mô tả

User nối các khái niệm với phần giải thích tương ứng.

#### Cơ chế

- Cột trái: Khái niệm
- Cột phải: Giải thích
- User thực hiện nối ngang giữa 2 cột

#### Ví dụ

- Thuật ngữ ↔ Định nghĩa
- Khái niệm ↔ Ý nghĩa

---

### Loại 3 — MindMap Tree

#### Mô tả

User kéo các component text lên cây MindMap để tạo thành sơ đồ nhánh kiến thức hoàn chỉnh.

#### Mục tiêu

- Hệ thống hóa kiến thức
- Ghi nhớ mối liên kết giữa các khái niệm

---

# 5. Giai Đoạn 4 — Final (Đúc Kết)

## 5.1 Mô tả

Đây là phần tổng kết cuối cùng sau khi User hoàn thành toàn bộ bài học và minigame.

## 5.2 Nội dung hiển thị

- Tổng kết kiến thức trọng tâm
- Các khái niệm chính cần ghi nhớ
- Thành quả học tập
- Điểm số / tiến trình hoàn thành (nếu có)

## 5.3 Thành phần mở rộng (tùy chọn)

- Huy hiệu hoàn thành
- XP / Level
- Thành tích
- Button chuyển bài học tiếp theo
- Button học lại

---

# 6. Đồng Bộ Thiết Kế Giữa Admin & User

## 6.1 Phía Admin

Admin có thể:

- Tạo đoạn dẫn truyện
- Thiết lập vòng lặp nội dung bài học N lần, bao gồm:
  - Upload media
  - Tạo câu hỏi
  - Thiết lập đáp án
  - Viết giải thích đúng/sai
  - Thiết lập đúc kết khái niệm
- Chọn loại minigame
- Thiết lập nội dung Final

---

## 6.2 Phía User

User sẽ:

1. Xem dẫn truyện
2. Học theo từng khái niệm
3. Trả lời câu hỏi
4. Nhận giải thích
5. Đúc kết khái niệm
6. Lặp lại từ bước 2 đến bước 5 cho đến khi hoàn thành toàn bộ nội dung bài học
7. Hoàn thành minigame
8. Xem tổng kết cuối bài

---

# 7. Luồng Tổng Thể Hệ Thống

Dẫn truyện  
→ Nội dung khái niệm 1  
→ Đúc kết khái niệm 1  
→ Nội dung khái niệm 2  
→ Đúc kết khái niệm 2  
→ ...  
→ Minigame  
→ Final (Đúc kết cuối bài)
