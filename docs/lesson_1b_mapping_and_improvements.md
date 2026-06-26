# Phân Tích Bài 1.b "Khái Niệm Triết Học" & Đề Xuất Cải Tiến Cấu Trúc Bài Học

Tài liệu này phân tích tính khả thi và phương pháp đưa kịch bản bài học **1.b Khái niệm triết học** (Chương 1) lên giao diện học tập của PhiloMind, đồng thời đề xuất những thay đổi cần thiết cho hệ thống bài học (Lesson) để tăng tính linh hoạt và tự do thiết kế.

---

## 1. Phân Tích Kịch Bản Bài 1.b "Khái Niệm Triết Học"

Kịch bản bài 1.b là một bài học tương tác cao (gamified e-learning) bao gồm 6 màn hình:

* **Màn hình 1 (Khởi động - Kéo thả khối đá):** Người học kéo thả các chữ cổ đại đại diện cho thuật ngữ Triết học về đúng quốc gia tương ứng trên bản đồ thế giới cổ đại:
  * Khối chữ `"哲"` (Triết) $\rightarrow$ Trung Quốc.
  * Khối chữ `"Dar'sana"` $\rightarrow$ Ấn Độ.
  * Khối chữ `"φιλοσοφία"` (Philosophia) $\rightarrow$ Hy Lạp.
  * *Đúc kết:* Khẳng định nguồn gốc và tính chất tinh thần bậc cao của triết học ngay từ sơ khai.
* **Màn hình 2 (Phân loại thế giới quan):** Kéo thả các thẻ chứa từ khóa (Niềm tin, Nghi lễ, Công cụ lý tính, Quy luật...) vào 2 chiếc hộp cổ: **Thần thoại - Tôn giáo** và **Triết học**.
  * *Đúc kết:* Mở hộp hiển thị định nghĩa Britannica & Viện Triết học Nga.
* **Màn hình 3 (Sơ đồ tư duy click lật thẻ):** Sơ đồ tư duy kết nối với 4 mảnh ghép bị lật úp. Click vào từng mảnh để lật mở 4 đặc trưng cốt lõi của triết học.
  * *Đúc kết:* Tổng hợp định nghĩa khái quát và chỉ ra triết học là hạt nhân của thế giới quan.
* **Màn hình 4 (Trắc nghiệm sách cổ):** MCQ 3 phương án để chọn định nghĩa chính xác nhất về triết học Mác - Lênin.
* **Màn hình 5 (Ghép đôi hai cột):** Kéo nối 3 thẻ khái niệm (cột trái) với mô tả giải thích (cột phải) để phân biệt tri thức triết học với khoa học cụ thể.
* **Màn hình 6 (Câu hỏi Đúng/Sai kết bài):** Trả lời phát biểu *"Mọi học thuyết triết học đều là khoa học. Đúng hay Sai?"* (Đáp án đúng: **Sai**).
  * *Đúc kết:* Hoàn thành bài học, hiển thị đồ họa đường xoáy ốc 3D và thông điệp chúc mừng.

---

## 2. Phương Án Ánh Xạ (Mapping) Lên Hệ Thống Bài Học Hiện Tại

Hệ thống PhiloMind hiện tại hỗ trợ 2 chế độ học: **Classic (Truyền thống)** và **Adventure (Nhập vai)**.

### 2.1 Sử dụng Classic Player
* **Hạn chế:** Chế độ Classic thiết kế theo luồng cố định (`Video -> Warmup -> Markdown -> Podcast -> Quiz`). Toàn bộ tính tương tác kéo thả, click lật thẻ sẽ bị mất đi.
* **Cách mapping:**
  * `videoUrl`: Video bài giảng bổ trợ (nếu có).
  * `warmups`: Chuyển đổi Màn hình 1 hoặc Màn hình 2 thành 1 hoạt động Warmup duy nhất (dạng trắc nghiệm hoặc điền chữ). Hệ thống hiện tại chỉ cho phép tạo 1 Warmup mỗi bài học.
  * `originalText` (Markdown): Soạn thảo văn bản tĩnh mô tả lại toàn bộ nội dung của các màn hình tương tác. Học viên chỉ đọc tài liệu mà không thể thực hiện các thao tác kéo thả.
  * `flashcards`: Chuyển đổi câu hỏi MCQ ở Màn 4 và Đúng/Sai ở Màn 6 thành các Flashcard trắc nghiệm cuối bài.

### 2.2 Sử dụng Adventure Player
Chế độ Adventure tương thích tốt hơn nhờ hỗ trợ stages, hội thoại NPC và minigame, tuy nhiên cấu trúc JSON vẫn gặp một số giới hạn:
* **Màn hình 1 (Kéo thả địa lý):** Bản đồ và việc kéo thả đá không được hỗ trợ trong `storyIntro` (chỉ hỗ trợ dialog text). Giải pháp là chuyển game này thành đoạn hội thoại dẫn chuyện giới thiệu của NPC Sophia.
* **Màn hình 2 (Phân loại hộp):** Cấu trúc chặng `lessonContents` hiện chỉ hỗ trợ câu hỏi MCQ (`single_choice`). Giải pháp là chuyển đổi game phân loại hộp thành một câu hỏi trắc nghiệm thông thường.
* **Màn hình 3 (Click lật sơ đồ):** Cấu trúc không hỗ trợ mindmap tương tác trong chặng này. Giải pháp là chèn nội dung 4 mảnh ghép làm văn bản đúc kết tĩnh trong `conceptSummary.content`.
* **Màn hình 4 (MCQ trắc nghiệm):** Ánh xạ hoàn hảo vào một phần tử trong danh sách `lessonContents` với câu hỏi `single_choice`, truyền ảnh cuốn sách cổ qua `media.url`.
* **Màn hình 5 (Ghép đôi):** Ánh xạ trực tiếp vào giai đoạn `minigame` của bài học bằng cách cấu hình `type: "matching_2_columns"` với dữ liệu cột trái, cột phải và cặp nối đúng.
* **Màn hình 6 (Đúng/Sai):** Đưa vào phần quiz tổng kết của chặng `finalSummary` và hiển thị kết quả chúc mừng trong `finalSummary.description`.

---

## 3. Đề Xuất Cải Tiến Hệ Thống Lesson Để Tăng Tính Tự Do Thiết Kế

Hệ thống Lesson hiện tại còn mang tính **cứng nhắc (rigid)**. Để admin có thể tự do sáng tạo nội dung mà không cần lập trình lại frontend cho mỗi bài học mới, chúng ta cần triển khai các cải tiến kiến trúc sau:

### 3.1 Mô hình Khối hoạt động tự do (Block-based Activity Flow)
Thay thế cấu trúc pipeline cố định bằng một mảng các block hoạt động tuần tự. Mỗi block có một kiểu render riêng biệt:
```typescript
type ActivityBlock = 
  | DialogueBlock       // Hội thoại NPC
  | MediaBlock          // Video, ảnh, âm thanh
  | MCQBlock            // Trắc nghiệm một/nhiều lựa chọn
  | TrueFalseBlock      // Câu hỏi Đúng/Sai
  | CategorySortingBlock // Game phân loại thẻ vào hộp
  | MatchingColumnsBlock // Game nối cột
  | InteractiveMindmapBlock // Sơ đồ click lật mở
  | MarkdownReadBlock   // Bài đọc văn bản tĩnh
```
Admin có thể cấu hình sắp xếp thứ tự tùy ý trong bài học, cho phép chèn game vào đầu bài, giữa bài hay đan xen linh hoạt.

### 3.2 Tổng quát hóa các Component Game tương tác (Dynamic Game Engines)
Tách biệt hoàn toàn code logic hiển thị game và dữ liệu đầu vào. Toàn bộ các trò chơi tương tác phải nhận cấu hình từ database thay vì code cứng trên frontend:
* **`CategorySortingGame`:** Nhận cấu hình số lượng hộp phân loại, nhãn của các hộp và danh sách thẻ bài cần kéo thả kèm đáp án đúng.
* **`TargetMatchingGame`:** Nhận danh sách tọa độ các khu vực đích (Drop zones) và danh sách hình ảnh/chữ cần kéo thả.

### 3.3 Hỗ Trợ MDX hoặc Custom Markdown Tags
Trong chế độ đọc tài liệu, hỗ trợ hiển thị các component tương tác thông qua các tag tùy biến trong file Markdown. Điều này giúp admin vừa viết tài liệu dạng chữ, vừa nhúng được các widget tương tác nhỏ (như biểu đồ, sơ đồ bấm lật, game mini) vào giữa văn bản:
```markdown
Dưới đây là sơ đồ đặc trưng triết học:
:::interactive-mindmap
{
  "central": "Nội dung cốt lõi",
  "branches": ["Ý thức xã hội", "Chỉnh thể", "Quy luật", "Thế giới quan"]
}
:::
```

### 3.4 Quản lý tiến trình động (Dynamic Step Tracker)
Thay đổi cơ chế lưu trữ progress của học viên:
* Thay thế việc theo dõi các thuộc tính cứng (`videoCompleted`, `warmupCompleted`, `quizCompleted`) bằng việc lưu trữ chỉ mục bước hiện tại (`activeActivityIndex`) hoặc danh sách các block ID đã vượt qua.
* Giúp hỗ trợ các bài học có số lượng chặng khác nhau tùy biến (bài 3 bước, bài 10 bước).
