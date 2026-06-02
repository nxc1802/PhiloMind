# 📘 TÀI LIỆU API HỆ THỐNG PHILOMIND (CHI TIẾT & ĐẦY ĐỦ NHẤT)

> **Phiên bản:** 1.0.0  
> **Địa chỉ API cục bộ:** `http://localhost:3001`  
> **Swagger API Docs:** `http://localhost:3001/docs`  
> **Mô tả chung:** Hệ thống sử dụng tiền tố `/api` toàn cục (ngoại trừ các endpoint kiểm tra sức khỏe `/` và `/health`). Tất cả dữ liệu đầu vào và đầu ra đều ở định dạng **JSON** chuẩn. Các trường ID được định nghĩa dạng `UUID` hoặc `String` tự tăng.

## 📊 TỔNG QUAN HỆ THỐNG ENDPOINT

| Nhóm API | Số Endpoint | Mô Tả | Trạng Thái |
| :--- | :---: | :--- | :---: |
| 1. Authentication & User Management | 6 | Quản lý tài khoản người học, cập nhật chuỗi ngày học liên tục (streak) và CRUD người dùng cho trang Admin. | Hoàn hảo |
| 2. Courses & PDF Documents | 6 | Tạo và hiển thị các không gian khóa học. Tải tài liệu PDF lên để AI phân tích tự động thành sơ đồ học tập. | Hoàn hảo |
| 3. Chapters | 5 | Quản lý các chương lớn trong khóa học. Đơn vị trung gian gom nhóm các bài học cụ thể. | Hoàn hảo |
| 4. Concept Nodes & Learning Journey | 6 | Các điểm kiến thức cốt lõi. Chứa nội dung tóm tắt, trích dẫn gốc, độ khó, thời lượng đọc và cập nhật tiến trình học. | Hoàn hảo |
| 5. Spaced Repetition Flashcards | 7 | Thẻ ôn tập từ khóa học giúp ghi nhớ lâu dài qua thuật toán SM-2 (Again, Hard, Good, Easy). Hỗ trợ CRUD từ Admin. | Hoàn hảo |
| 6. Socratic AI Debate | 10 | Khu vực tranh luận giữa người học và trợ lý ảo Socratic giúp làm sâu sắc lý luận bằng phản biện đa chiều. | Hoàn hảo |
| 7. Podcasts & AI Speech Synthesis | 5 | Các bài tóm tắt nói dạng podcast được tổng hợp tự động từ AI. Hỗ trợ CRUD và Preview từ Admin. | Hoàn hảo |
| 8. Concept Node Warmups | 3 | Quản lý các phần khởi động đa dạng kiểu (image-guess đoán thuật ngữ qua hình ảnh hoặc story đọc truyện trả lời câu hỏi) kết nối bài học thực tiễn. | Hoàn hảo |

---

## 🔑 ĐỊNH NGHĨA CHI TIẾT TỪNG ENDPOINT

### 📁 1. Authentication & User Management (Xác thực & Người dùng)
*Quản lý tài khoản người học, cập nhật chuỗi ngày học liên tục (streak) và CRUD người dùng cho trang Admin.*

#### 🔵 `POST /api/auth/register` - **Đăng ký người dùng mới**

* **Quyền truy cập:** `Public`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "email": "string" // [BẮT BUỘC] - Email đăng ký
    "name": "string" // [BẮT BUỘC] - Tên hiển thị người dùng
    "password": "string" // [TÙY CHỌN] - Mật khẩu đăng nhập (mock)
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "uuid-user-1234",
  "email": "student@philomind.local",
  "name": "Nguyễn Văn A",
  "streak": 0,
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🔵 `POST /api/auth/login` - **Đăng nhập hệ thống**

* **Quyền truy cập:** `Public`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "email": "string" // [BẮT BUỘC] - Email đăng nhập
    "password": "string" // [TÙY CHỌN] - Mật khẩu đăng nhập (mock)
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "uuid-user-1234",
  "email": "student@philomind.local",
  "name": "Nguyễn Văn A",
  "streak": 3,
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🟢 `GET /api/users` - **Lấy danh sách tất cả người dùng (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "take": "number" // [TÙY CHỌN] - Số lượng bản ghi tối đa (mặc định 50)
    "skip": "number" // [TÙY CHỌN] - Số bản ghi bỏ qua để phân trang
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "uuid-user-1234",
    "email": "student@philomind.local",
    "name": "Nguyễn Văn A",
    "streak": 3,
    "createdAt": "2026-05-31T00:00:00.000Z"
  }
]
  ```

---

#### 🟢 `GET /api/users/:id` - **Lấy chi tiết thông tin một người dùng**

* **Quyền truy cập:** `Admin/Owner`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID của người dùng cần lấy
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "uuid-user-1234",
  "email": "student@philomind.local",
  "name": "Nguyễn Văn A",
  "streak": 3,
  "createdAt": "2026-05-31T00:00:00.000Z",
  "progress": [
    {
      "id": "progress-1",
      "nodeId": "node-1",
      "status": "completed"
    }
  ],
  "reviews": [
    {
      "id": "review-1",
      "flashcardId": "card-1",
      "ease": 3
    }
  ]
}
  ```

---

#### 🟡 `PUT /api/users/:id` - **Cập nhật thông tin người dùng (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID của người dùng
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "name": "string" // [TÙY CHỌN] - Tên mới của người dùng
    "email": "string" // [TÙY CHỌN] - Email mới
    "streak": "number" // [TÙY CHỌN] - Số ngày học liên tục
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "uuid-user-1234",
  "email": "student_updated@philomind.local",
  "name": "Nguyễn Văn A Đã Sửa",
  "streak": 5,
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🔴 `DELETE /api/users/:id` - **Xóa người dùng (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID của người dùng cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "User deleted successfully"
}
  ```

---

### 📁 2. Courses & PDF Documents (Khóa học & Tài liệu học tập)
*Tạo và hiển thị các không gian khóa học. Tải tài liệu PDF lên để AI phân tích tự động thành sơ đồ học tập.*

#### 🔵 `POST /api/courses` - **Tạo khóa học mới**

* **Quyền truy cập:** `User/Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [BẮT BUỘC] - Tiêu đề khóa học (Ví dụ: Triết học Mác-Lênin)
    "description": "string" // [TÙY CHỌN] - Mô tả tổng quát về nội dung học tập
    "userId": "string" // [BẮT BUỘC] - ID người dùng sở hữu khóa học này
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "course-uuid-999",
  "title": "Triết học Mác-Lênin",
  "description": "Nghiên cứu các quy luật vận động chung nhất...",
  "userId": "default-user-id",
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🟢 `GET /api/courses` - **Lấy danh sách khóa học**

* **Quyền truy cập:** `User/Admin`
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "userId": "string" // [TÙY CHỌN] - Lọc theo ID người học. Nếu bỏ qua sẽ trả về toàn bộ khóa học.
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "course-uuid-999",
    "title": "Triết học Mác-Lênin",
    "description": "Nghiên cứu các quy luật vận động chung nhất...",
    "userId": "default-user-id",
    "createdAt": "2026-05-31T00:00:00.000Z",
    "documents": [],
    "_count": {
      "chapters": 3
    }
  }
]
  ```

---

#### 🟢 `GET /api/courses/:id` - **Chi tiết một khóa học (Admin)**

* **Quyền truy cập:** `User/Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID khóa học
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "course-uuid-999",
  "title": "Triết học Mác-Lênin",
  "description": "Nghiên cứu các quy luật vận động chung nhất...",
  "userId": "default-user-id",
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🟡 `PUT /api/courses/:id` - **Cập nhật thông tin khóa học (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID khóa học
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [TÙY CHỌN] - Tiêu đề mới
    "description": "string" // [TÙY CHỌN] - Mô tả mới
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "course-uuid-999",
  "title": "Triết học Mác-Lênin Cập Nhật",
  "description": "Mô tả mới",
  "userId": "default-user-id",
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🔴 `DELETE /api/courses/:id` - **Xóa khóa học (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID khóa học
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Course and related chapters/nodes deleted successfully"
}
  ```

---

#### 🔵 `POST /api/courses/:id/upload` - **Tải lên tài liệu giáo trình để phân tích lộ trình tự động**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID khóa học đích nhận tài liệu
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "fileName": "string" // [BẮT BUỘC] - Tên file PDF/TXT tài liệu
    "content": "string" // [BẮT BUỘC] - Nội dung văn bản được trích xuất từ tài liệu
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `202`
  ```json
{
  "id": "doc-uuid-555",
  "fileName": "GiaoTrinhTrietHoc.pdf",
  "fileUrl": "https://mock-bucket.local/course-uuid-999/GiaoTrinhTrietHoc.pdf",
  "courseId": "course-uuid-999",
  "status": "parsing"
}
  ```

---

### 📁 3. Chapters (Chương học)
*Quản lý các chương lớn trong khóa học. Đơn vị trung gian gom nhóm các bài học cụ thể.*

#### 🔵 `POST /api/chapters` - **Tạo chương mới (Admin)**

* **Quyền truy cập:** `Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [BẮT BUỘC] - Tiêu đề chương (Ví dụ: Chương 1: Khái lược về triết học)
    "orderIndex": "number" // [BẮT BUỘC] - Thứ tự hiển thị (Ví dụ: 1)
    "courseId": "string" // [BẮT BUỘC] - ID khóa học chứa chương này
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "chap-uuid-001",
  "title": "Chương 1: Khái lược về triết học",
  "orderIndex": 1,
  "courseId": "course-uuid-999"
}
  ```

---

#### 🟢 `GET /api/chapters` - **Lấy danh sách tất cả chương (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "courseId": "string" // [TÙY CHỌN] - Lọc chương theo ID khóa học
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "chap-uuid-001",
    "title": "Chương 1: Khái lược về triết học",
    "orderIndex": 1,
    "courseId": "course-uuid-999"
  }
]
  ```

---

#### 🟢 `GET /api/chapters/:id` - **Lấy chi tiết một chương (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID chương
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "chap-uuid-001",
  "title": "Chương 1: Khái lược về triết học",
  "orderIndex": 1,
  "courseId": "course-uuid-999"
}
  ```

---

#### 🟡 `PUT /api/chapters/:id` - **Cập nhật chương (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID chương
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [TÙY CHỌN] - Tiêu đề mới
    "orderIndex": "number" // [TÙY CHỌN] - Thứ tự mới
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "chap-uuid-001",
  "title": "Chương 1: Khái lược về triết học Cập Nhật",
  "orderIndex": 2,
  "courseId": "course-uuid-999"
}
  ```

---

#### 🔴 `DELETE /api/chapters/:id` - **Xóa chương (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID chương
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Chapter and all nested nodes deleted successfully"
}
  ```

---

### 📁 4. Concept Nodes & Learning Journey (Bài học & Sơ đồ lộ trình)
*Các điểm kiến thức cốt lõi. Chứa nội dung tóm tắt, trích dẫn gốc, độ khó, thời lượng đọc và cập nhật tiến trình học.*

#### 🟢 `GET /api/courses/:id/journey` - **Lấy toàn bộ sơ đồ lộ trình học tập (Mindmap)**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID khóa học
  }
  ```
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng để hiển thị tiến độ học tập tương ứng
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "chap-uuid-001",
    "title": "Khái lược về Triết học",
    "orderIndex": 1,
    "courseId": "course-uuid-999",
    "nodes": [
      {
        "id": "node-uuid-111",
        "title": "Nguồn gốc của triết học",
        "summary": "Triết học ra đời từ nguồn gốc nhận thức và nguồn gốc xã hội...",
        "quickTake": "Triết học xuất hiện từ hoạt động thực tiễn của con người.",
        "difficulty": "Medium",
        "timeToRead": "8 min read",
        "orderIndex": 1,
        "chapterId": "chap-uuid-001",
        "progress": [
          {
            "id": "prog-1",
            "status": "available"
          }
        ],
        "_count": {
          "flashcards": 3
        }
      }
    ]
  }
]
  ```

---

#### 🟢 `GET /api/courses/nodes/:nodeId` - **Lấy chi tiết nội dung của một bài học (Concept Node)**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID của Concept Node
  }
  ```
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng để lấy trạng thái tiến độ và spaced repetition
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "node-uuid-111",
  "title": "Nguồn gốc của triết học",
  "summary": "Triết học ra đời từ...",
  "originalText": "Triết học có hai nguồn gốc chính: Nguồn gốc nhận thức và Nguồn gốc xã hội...",
  "quickTake": "Triết học xuất hiện từ hoạt động thực tiễn.",
  "difficulty": "Medium",
  "timeToRead": "8 min read",
  "orderIndex": 1,
  "chapterId": "chap-uuid-001",
  "podcast": {
    "id": "pod-1",
    "nodeId": "node-uuid-111",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "transcript": [
      {
        "speaker": "Host",
        "text": "Chào mừng các bạn đến với bài học hôm nay..."
      }
    ]
  },
  "flashcards": [
    {
      "id": "fc-1",
      "question": "Triết học ra đời từ nguồn gốc nào?",
      "answer": "Nguồn gốc nhận thức và xã hội."
    }
  ],
  "progress": [
    {
      "id": "prog-1",
      "status": "available"
    }
  ],
  "chapter": {
    "id": "chap-uuid-001",
    "title": "Khái lược về Triết học",
    "course": {
      "id": "course-uuid-999",
      "title": "Triết học Mác-Lênin"
    }
  }
}
  ```

---

#### 🔵 `POST /api/nodes` - **Tạo Concept Node mới (Admin)**

* **Quyền truy cập:** `Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [BẮT BUỘC] - Tên bài học
    "summary": "string" // [BẮT BUỘC] - Tóm tắt ngắn gọn (max 5 dòng)
    "originalText": "string" // [BẮT BUỘC] - Trích dẫn giáo trình học thuật gốc
    "quickTake": "string" // [BẮT BUỘC] - Ý chính rút gọn nhanh
    "difficulty": "string" // [BẮT BUỘC] - Độ khó: 'Easy' | 'Medium' | 'Hard'
    "timeToRead": "string" // [BẮT BUỘC] - Thời lượng đọc (ví dụ: '8 min read')
    "orderIndex": "number" // [BẮT BUỘC] - Thứ tự sắp xếp trong chương
    "chapterId": "string" // [BẮT BUỘC] - ID chương chứa bài học này
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "node-uuid-111",
  "title": "Nguồn gốc của triết học",
  "summary": "Triết học ra đời từ...",
  "originalText": "Giáo trình trích dẫn gốc...",
  "quickTake": "Ý chính rút gọn.",
  "difficulty": "Medium",
  "timeToRead": "8 min read",
  "orderIndex": 1,
  "chapterId": "chap-uuid-001"
}
  ```

---

#### 🟡 `PUT /api/nodes/:nodeId` - **Cập nhật Concept Node (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID Concept Node cần sửa
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [TÙY CHỌN] - Tiêu đề mới
    "summary": "string" // [TÙY CHỌN] - Tóm tắt mới
    "originalText": "string" // [TÙY CHỌN] - Trích dẫn mới
    "quickTake": "string" // [TÙY CHỌN] - Ý chính mới
    "difficulty": "string" // [TÙY CHỌN] - Độ khó mới
    "timeToRead": "string" // [TÙY CHỌN] - Thời lượng đọc mới
    "orderIndex": "number" // [TÙY CHỌN] - Thứ tự sắp xếp mới
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "node-uuid-111",
  "title": "Nguồn gốc triết học Cập Nhật",
  "summary": "Tóm tắt đã sửa...",
  "originalText": "Trích dẫn đã sửa...",
  "quickTake": "Ý chính đã sửa.",
  "difficulty": "Hard",
  "timeToRead": "12 min read",
  "orderIndex": 1,
  "chapterId": "chap-uuid-001"
}
  ```

---

#### 🔴 `DELETE /api/nodes/:nodeId` - **Xóa Concept Node (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID Concept Node cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Concept node and nested flashcards, progress records deleted successfully"
}
  ```

---

#### 🟠 `PATCH /api/courses/nodes/:nodeId/progress` - **Cập nhật trạng thái tiến trình học tập của Concept Node**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID của Concept Node
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng đang học
    "status": "string" // [BẮT BUỘC] - Trạng thái mới: 'locked' | 'available' | 'in_progress' | 'completed'
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "prog-uuid-abc",
  "userId": "default-user-id",
  "nodeId": "node-uuid-111",
  "status": "completed",
  "updatedAt": "2026-05-31T01:00:00.000Z"
}
  ```

---

### 📁 5. Spaced Repetition Flashcards (Thẻ nhớ lặp lại ngắt quãng)
*Thẻ ôn tập từ khóa học giúp ghi nhớ lâu dài qua thuật toán SM-2 (Again, Hard, Good, Easy). Hỗ trợ CRUD từ Admin.*

#### 🟢 `GET /api/flashcards/due` - **Lấy danh sách thẻ nhớ cần học (Spaced Repetition)**

* **Quyền truy cập:** `User`
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng
    "courseId": "string" // [TÙY CHỌN] - ID khóa học (tùy chọn) để lọc thẻ ôn tập
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "fc-uuid-222",
    "nodeId": "node-uuid-111",
    "tag": "Triết học Mác",
    "question": "Định nghĩa vật chất của Lênin giải quyết mặt thứ nhất vấn đề cơ bản thế nào?",
    "answer": "Khẳng định vật chất là cái thứ nhất, ý thức có sau và phản ánh vật chất khách quan."
  }
]
  ```

---

#### 🔵 `POST /api/flashcards/review` - **Gửi kết quả ôn tập thẻ nhớ (Cập nhật lịch SM-2 và tăng Streak)**

* **Quyền truy cập:** `User`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng đang ôn
    "flashcardId": "string" // [BẮT BUỘC] - ID thẻ nhớ vừa lật
    "ease": "number" // [BẮT BUỘC] - Mức độ dễ: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "rev-uuid-777",
  "flashcardId": "fc-uuid-222",
  "userId": "default-user-id",
  "ease": 3,
  "interval": 5,
  "nextReview": "2026-06-05T01:00:00.000Z"
}
  ```

---

#### 🔵 `POST /api/flashcards` - **Tạo thẻ nhớ thủ công (Admin)**

* **Quyền truy cập:** `Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID bài học (Concept Node) liên kết
    "tag": "string" // [BẮT BUỘC] - Nhãn gom nhóm (Ví dụ: Vật chất, Ý thức, Phép biện chứng)
    "question": "string" // [BẮT BUỘC] - Câu hỏi ở mặt trước thẻ
    "answer": "string" // [BẮT BUỘC] - Đáp án diễn giải ở mặt sau thẻ
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "fc-uuid-222",
  "nodeId": "node-uuid-111",
  "tag": "Vật chất",
  "question": "Đáp án vật chất là gì?",
  "answer": "Thực tại khách quan tồn tại độc lập..."
}
  ```

---

#### 🟢 `GET /api/flashcards` - **Lấy danh sách tất cả các thẻ nhớ trong hệ thống (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "nodeId": "string" // [TÙY CHỌN] - Lọc thẻ nhớ theo bài học
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "fc-uuid-222",
    "nodeId": "node-uuid-111",
    "tag": "Vật chất",
    "question": "Câu hỏi ôn tập?",
    "answer": "Câu trả lời đúng."
  }
]
  ```

---

#### 🟢 `GET /api/flashcards/:id` - **Lấy thông tin chi tiết một thẻ nhớ (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID thẻ nhớ
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "fc-uuid-222",
  "nodeId": "node-uuid-111",
  "tag": "Vật chất",
  "question": "Câu hỏi ôn tập?",
  "answer": "Câu trả lời đúng."
}
  ```

---

#### 🟡 `PUT /api/flashcards/:id` - **Cập nhật nội dung thẻ nhớ (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID thẻ nhớ
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "tag": "string" // [TÙY CHỌN] - Nhãn mới
    "question": "string" // [TÙY CHỌN] - Câu hỏi mới
    "answer": "string" // [TÙY CHỌN] - Đáp án mới
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "fc-uuid-222",
  "nodeId": "node-uuid-111",
  "tag": "Vật chất Cập Nhật",
  "question": "Câu hỏi mới?",
  "answer": "Đáp án mới."
}
  ```

---

#### 🔴 `DELETE /api/flashcards/:id` - **Xóa thẻ nhớ (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID thẻ nhớ cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Flashcard deleted successfully"
}
  ```

---

### 📁 6. Socratic AI Debate (Tranh luận Socratic trí tuệ nhân tạo)
*Khu vực tranh luận giữa người học và trợ lý ảo Socratic giúp làm sâu sắc lý luận bằng phản biện đa chiều.*

#### 🟢 `GET /api/debates/topics` - **Lấy toàn bộ danh sách kịch bản/chủ đề tranh luận có sẵn**

* **Quyền truy cập:** `User/Admin`
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "topic-uuid-abc",
    "title": "Tính khách quan của Vật chất",
    "description": "Tranh biện về quan điểm vật chất có trước ý thức...",
    "initialPrompt": "Xin chào đồng chí! Tôi muốn tranh biện...",
    "createdAt": "2026-05-31T00:00:00.000Z"
  }
]
  ```

---

#### 🔵 `POST /api/debates/topics` - **Tạo kịch bản tranh luận mới (Admin)**

* **Quyền truy cập:** `Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [BẮT BUỘC] - Tiêu đề kịch bản
    "description": "string" // [BẮT BUỘC] - Mô tả ngắn
    "initialPrompt": "string" // [BẮT BUỘC] - Lời mở đầu phái Socratic khêu gợi phản biện
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "topic-uuid-abc",
  "title": "Tính khách quan của Vật chất",
  "description": "Tranh biện về quan điểm...",
  "initialPrompt": "Xin chào đồng chí!...",
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🟡 `PUT /api/debates/topics/:id` - **Cập nhật kịch bản tranh luận (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID kịch bản
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "title": "string" // [TÙY CHỌN] - Tiêu đề mới
    "description": "string" // [TÙY CHỌN] - Mô tả mới
    "initialPrompt": "string" // [TÙY CHỌN] - Lời mở đầu mới
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "topic-uuid-abc",
  "title": "Tính khách quan của Vật chất (Cập nhật)",
  "description": "Mô tả đã sửa...",
  "initialPrompt": "Lời mở đầu đã sửa...",
  "createdAt": "2026-05-31T00:00:00.000Z"
}
  ```

---

#### 🔴 `DELETE /api/debates/topics/:id` - **Xóa kịch bản tranh luận (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID kịch bản cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Debate topic deleted successfully"
}
  ```

---

#### 🟢 `GET /api/debates/topic/:topicId` - **Lấy hoặc khởi tạo phiên đối thoại tranh luận theo Kịch Bản (Topic)**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "topicId": "string" // [BẮT BUỘC] - ID của kịch bản tranh luận
  }
  ```
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "deb-uuid-333",
  "topicId": "topic-uuid-abc",
  "userId": "default-user-id",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Xin chào đồng chí! Tôi có một luận điểm muốn phản biện cùng đồng chí: 'Ý thức quyết định vật chất'...",
      "time": 0
    }
  ]
}
  ```

---

#### 🔵 `POST /api/debates/topic/:topicId/message` - **Gửi tin nhắn phản biện theo Kịch Bản và nhận rebuttals có lịch sử liên tục**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "topicId": "string" // [BẮT BUỘC] - ID kịch bản
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng
    "message": "string" // [BẮT BUỘC] - Luận cứ biện chứng của sinh viên
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "deb-uuid-333",
  "topicId": "topic-uuid-abc",
  "userId": "default-user-id",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Xin chào...",
      "time": 0
    },
    {
      "speaker": "User",
      "text": "Vật chất khách quan tồn tại độc lập...",
      "time": 1779223000
    },
    {
      "speaker": "Host",
      "text": "Nhưng ý chí chủ quan có thể dời non lấp bể, chẳng phải đó là biểu hiện của ý thức quyết định vật chất sao?",
      "time": 1779223050
    }
  ]
}
  ```

---

#### 🟢 `GET /api/debates/:nodeId` - **Lấy hoặc khởi tạo cuộc hội thoại tranh luận theo Nút Bài Học**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID của bài học đang tranh luận
  }
  ```
* **Tham số truy vấn (Query Params):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "deb-uuid-333",
  "nodeId": "node-uuid-111",
  "userId": "default-user-id",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Chào mừng bạn! Chúng ta hãy tranh luận về luận điểm: Vật chất là thực tại khách quan...",
      "time": 0
    }
  ]
}
  ```

---

#### 🔵 `POST /api/debates/:nodeId/message` - **Gửi tin nhắn lập luận và nhận phản hồi phản biện Socratic theo bài học**

* **Quyền truy cập:** `User`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID của bài học
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "userId": "string" // [BẮT BUỘC] - ID người dùng
    "message": "string" // [BẮT BUỘC] - Lập luận/Câu trả lời của học viên gửi lên
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "deb-uuid-333",
  "nodeId": "node-uuid-111",
  "userId": "default-user-id",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Chào mừng...",
      "time": 0
    },
    {
      "speaker": "User",
      "text": "Tôi nghĩ vật chất có trước vì...",
      "time": 1779223000
    },
    {
      "speaker": "Host",
      "text": "Một lập luận thú vị! Tuy nhiên, nếu bạn cho rằng vật chất có trước hoàn toàn, hãy giải thích trường hợp ý chí con người có thể làm biến đổi thiên nhiên?",
      "time": 1779223050
    }
  ]
}
  ```

---

#### 🟢 `GET /api/debates/all` - **Danh sách tất cả cuộc tranh luận đang diễn ra của học viên (Admin)**

* **Quyền truy cập:** `Admin`
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "deb-uuid-333",
    "nodeId": "node-uuid-111",
    "userId": "default-user-id",
    "node": {
      "title": "Nguồn gốc của triết học"
    },
    "user": {
      "name": "Nguyễn Văn A"
    }
  }
]
  ```

---

#### 🔴 `DELETE /api/debates/:id` - **Xóa phiên tranh luận học viên (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID cuộc tranh luận cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Debate history deleted successfully"
}
  ```

---

### 📁 7. Podcasts & AI Speech Synthesis (Âm thanh bài học & Chuyển văn bản thành giọng nói)
*Các bài tóm tắt nói dạng podcast được tổng hợp tự động từ AI. Hỗ trợ CRUD và Preview từ Admin.*

#### 🟢 `GET /api/podcasts` - **Lấy danh sách các podcast bài học (Admin)**

* **Quyền truy cập:** `Admin`
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "pod-1",
    "nodeId": "node-uuid-111",
    "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "node": {
      "title": "Nguồn gốc của triết học"
    }
  }
]
  ```

---

#### 🔵 `POST /api/podcasts` - **Tạo podcast học tập thủ công (Admin)**

* **Quyền truy cập:** `Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID bài học (Concept Node) liên kết
    "audioUrl": "string" // [BẮT BUỘC] - Đường dẫn URL chứa file âm thanh WAV/MP3
    "transcript": "object" // [BẮT BUỘC] - Kịch bản đồng bộ dạng mảng đối tượng { speaker: string, text: string, time?: number }
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "pod-uuid-888",
  "nodeId": "node-uuid-111",
  "audioUrl": "https://mock-bucket.local/podcasts/manual.wav",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Xin chào các học viên..."
    }
  ]
}
  ```

---

#### 🟡 `PUT /api/podcasts/:id` - **Cập nhật thông tin podcast (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID podcast
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "audioUrl": "string" // [TÙY CHỌN] - URL file âm thanh mới
    "transcript": "object" // [TÙY CHỌN] - Kịch bản tóm tắt nói mới
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "id": "pod-uuid-888",
  "nodeId": "node-uuid-111",
  "audioUrl": "https://mock-bucket.local/podcasts/manual_updated.wav",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Xin chào các học viên đã cập nhật..."
    }
  ]
}
  ```

---

#### 🔴 `DELETE /api/podcasts/:id` - **Xóa podcast (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID podcast cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Podcast deleted successfully"
}
  ```

---

#### 🔵 `POST /api/podcasts/synthesize` - **Tổng hợp giọng nói TTS dạng Preview để nghe thử trước khi tạo chính thức (Admin)**

* **Quyền truy cập:** `Admin`
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID bài học cần liên kết
    "scriptText": "string" // [BẮT BUỘC] - Kịch bản lời thoại thô dạng tiếng Việt để máy đọc
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "audioUrl": "https://supabase-bucket.local/temp/preview-abc.wav",
  "transcript": [
    {
      "speaker": "Host",
      "text": "Chào mừng các bạn học sinh đến với bài giảng hôm nay...",
      "time": 0
    }
  ]
}
  ```

---

### 📁 8. Concept Node Warmups (Phần khởi động làm nóng bài học)
*Quản lý các phần khởi động đa dạng kiểu (image-guess đoán thuật ngữ qua hình ảnh hoặc story đọc truyện trả lời câu hỏi) kết nối bài học thực tiễn.*

#### 🟢 `GET /api/nodes/:nodeId/warmups` - **Lấy danh sách các warmup khởi động của một bài học**

* **Quyền truy cập:** `User/Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID bài học
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
[
  {
    "id": "warm-uuid-123",
    "nodeId": "node-uuid-111",
    "type": "image-guess",
    "title": "Nhìn hình đoán thuật ngữ",
    "image": "https://mock-image.local/vat_chat.png",
    "blanks": "V _ T  C H _ T",
    "answer": "VẬT CHẤT",
    "reveal": "Vật chất biện chứng là thực tại khách quan..."
  }
]
  ```

---

#### 🔵 `POST /api/nodes/:nodeId/warmups` - **Tạo thêm câu hỏi khởi động Warmup cho bài học (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "nodeId": "string" // [BẮT BUỘC] - ID bài học
  }
  ```
* **Dữ liệu yêu cầu (Request Body):**
  ```json
  {
    "type": "string" // [BẮT BUỘC] - Kiểu khởi động: 'image-guess' hoặc 'story'
    "title": "string" // [BẮT BUỘC] - Tiêu đề câu hỏi khởi động
    "image": "string" // [TÙY CHỌN] - Đường dẫn ảnh (dành cho image-guess)
    "blanks": "string" // [TÙY CHỌN] - Từ khóa dạng khuyết chữ (dành cho image-guess)
    "answer": "string" // [TÙY CHỌN] - Đáp án đúng (dành cho image-guess)
    "story": "string" // [TÙY CHỌN] - Nội dung câu chuyện (dành cho story)
    "question": "string" // [TÙY CHỌN] - Câu hỏi chiêm nghiệm trắc nghiệm (dành cho story)
    "options": "array" // [TÙY CHỌN] - Mảng các phương án lựa chọn dạng mảng chuỗi (dành cho story)
    "correctIndex": "number" // [TÙY CHỌN] - Mã số index đáp án chính xác (dành cho story)
    "reveal": "string" // [BẮT BUỘC] - Lời lý giải khoa học mở khóa khi học viên hoàn thành
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `201`
  ```json
{
  "id": "warm-uuid-123",
  "nodeId": "node-uuid-111",
  "type": "image-guess",
  "title": "Nhìn hình đoán thuật ngữ",
  "image": "https://mock-image.local/vat_chat.png",
  "blanks": "V _ T  C H _ T",
  "answer": "VẬT CHẤT",
  "reveal": "Vật chất biện chứng..."
}
  ```

---

#### 🔴 `DELETE /api/warmups/:id` - **Xóa phần khởi động Warmup (Admin)**

* **Quyền truy cập:** `Admin`
* **Tham số đường dẫn (Path Params):**
  ```json
  {
    "id": "string" // [BẮT BUỘC] - ID của Warmup cần xóa
  }
  ```
* **Kết quả trả về mẫu (Response):**
  * Trạng thái phản hồi: `200`
  ```json
{
  "success": true,
  "message": "Warmup deleted successfully"
}
  ```

---

## ⚠️ DANH SÁCH LỖI THƯỜNG GẶP (ERROR HANDLING)

Hệ thống trả về các mã trạng thái HTTP chuẩn để thông báo lỗi một cách tường minh:

* **`400 Bad Request`**: Dữ liệu yêu cầu đầu vào không hợp lệ hoặc thiếu các trường bắt buộc (được kiểm tra tự động thông qua NestJS `ValidationPipe`).
  ```json
  {
    "statusCode": 400,
    "message": ["title must be a string", "userId should not be empty"],
    "error": "Bad Request"
  }
  ```
* **`404 Not Found`**: Không tìm thấy tài nguyên được yêu cầu (ví dụ: không có khóa học hoặc Concept Node nào với ID được truyền vào).
  ```json
  {
    "statusCode": 404,
    "message": "Concept node not found",
    "error": "Not Found"
  }
  ```
* **`500 Internal Server Error`**: Lỗi hệ thống hoặc lỗi kết nối dịch vụ bên thứ ba (Ví dụ: OpenRouter AI hoặc Hugging Face TTS worker gặp sự cố).
  ```json
  {
    "statusCode": 500,
    "message": "Internal server error",
    "error": "Internal Server Error"
  }
  ```
