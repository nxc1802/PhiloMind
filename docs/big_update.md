# Báo Cáo Update Mới Nhất Cho Dự Án Ứng Dụng Triết Học

## 1. Tổng quan định hướng update

Dự án ứng dụng học Triết học sẽ được nâng cấp theo hai nhóm update chính:

1. **Update back-end / lesson architecture**
   Tái thiết kế hệ thống lesson component để bài học trở nên linh hoạt hơn. Các component như dialogue, question, game, review, matching, multi-select, mind map... không còn bị xem là thành phần rời rạc, mà có thể được gắn trực tiếp với video, hình ảnh, hoặc từng thời điểm trong tiến trình học.

2. **Update front-end / giao diện và component interaction**
   Thiết kế lại bố cục học tập, đặc biệt là sidebar, lesson tab và cách hiển thị component song song với video/hình ảnh. Đồng thời sửa lỗi và nâng cấp chi tiết các component hiện có để tăng trải nghiệm học tập tương tác.

Mục tiêu tổng thể là biến mỗi lesson thành một **learning flow hoàn chỉnh**, trong đó người học có thể xem video, quan sát hình ảnh, trả lời câu hỏi, chơi game, tham gia dialogue và review kiến thức trong cùng một không gian học tập thống nhất.

---

## 2. Update 1: Back-end — Thiết kế lại Lesson Component System

### 2.1. Tái cấu trúc lesson theo hướng component-based flow

Hệ thống lesson sẽ được thiết kế lại để mỗi bài học có thể chứa nhiều component độc lập. Mỗi component có thể được thêm vào bất kỳ vị trí nào trong lesson, xuất hiện nhiều lần nếu cần, và không bị ràng buộc cứng với một loại bài học cụ thể.

Các component có thể bao gồm:

* Video component
* Image component
* Dialogue component
* Question component
* Game component
* Matching column component
* Multi-select component
* Mind map review component
* Các component mở rộng khác trong tương lai

Cách tiếp cận này giúp lesson có tính mở rộng cao hơn. Khi cần tạo component mới cho một bài học đặc biệt, hệ thống không cần sửa lại cấu trúc lesson cũ mà chỉ cần thêm component mới vào flow.

---

### 2.2. Cho phép component gắn với video và hình ảnh

Một điểm update quan trọng là các component như dialogue, question và game đều có thể nằm trong phạm vi của video hoặc hình ảnh.

Điều này có nghĩa là khi người học đang xem một video hoặc một hình ảnh ở cột giữa, hệ thống có thể hiển thị song song các nội dung tương tác liên quan ở cột phải.

Ví dụ:

* Video đang giải thích một khái niệm triết học.
* Cột phải hiển thị câu hỏi kiểm tra nhanh.
* Sau đó chuyển sang một dialogue mô phỏng tranh luận.
* Tiếp theo là một game nhỏ để củng cố kiến thức.

Như vậy, video/hình ảnh không còn chỉ là nội dung trình chiếu thụ động, mà trở thành trung tâm điều phối các hoạt động học tập tương tác.

---

### 2.3. Component có thể chứa hình ảnh linh hoạt

Tất cả component thuộc nhóm question, dialogue và game cần được hỗ trợ hình ảnh ở nhiều vị trí khác nhau.

Cụ thể:

* Câu hỏi có thể chứa hình ảnh.
* Câu trả lời có thể chứa hình ảnh.
* Dialogue có thể chứa hình ảnh trong từng lượt hội thoại.
* Game có thể sử dụng hình ảnh như một phần của đề bài, đáp án hoặc vật phẩm tương tác.
* Mind map, matching, multi-select và các component review khác cũng có thể mở rộng để hỗ trợ ảnh.

Điều này đặc biệt quan trọng với môn Triết học, vì nhiều nội dung có thể cần sơ đồ, hình minh họa, ảnh nhân vật, timeline, bản đồ tư duy hoặc ví dụ trực quan để tăng khả năng ghi nhớ.

---

### 2.4. Component Flow và khả năng revert

Lesson cần có một hệ thống **component flow** để theo dõi tiến trình học của người dùng.

Component flow sẽ cho phép:

* Hiển thị danh sách các component trong lesson.
* Cho biết người học đang ở component nào.
* Cho phép quay lại các component trước đó.
* Cho phép người học review lại các phần đã hoàn thành.
* Hỗ trợ điều hướng mềm giữa video, question, dialogue và game.

Tính năng revert rất quan trọng vì người học có thể quay lại câu hỏi, đoạn hội thoại hoặc nội dung trước đó để xem lại kiến thức trước khi tiếp tục bài học.

---

## 3. Update 2: Front-end — Thiết kế lại giao diện học tập

### 3.1. Left sidebar có thể thu gọn dạng icon-only

Left sidebar sẽ được chỉnh sửa để có thể thu gọn lại ở dạng chỉ hiển thị icon.

Mục tiêu của thay đổi này là:

* Tăng không gian hiển thị cho phần lesson.
* Giúp giao diện học tập gọn hơn.
* Giữ khả năng điều hướng nhanh mà không chiếm quá nhiều diện tích.
* Phù hợp hơn với màn hình nhỏ hoặc các layout học tập có nhiều cột.

Khi sidebar được mở rộng, người dùng có thể xem đầy đủ tên chương, bài học và mục lục. Khi thu gọn, hệ thống chỉ giữ lại các icon chính để điều hướng.

---

### 3.2. Thiết kế lại tab Lesson theo bố cục ba cột

Tab Lesson sẽ được thiết kế lại thành bố cục ba cột.

#### Cột trái: Course content và Component flow

Cột trái sẽ chứa hai phần chính:

1. **Course content**
   Hiển thị cấu trúc khóa học, chương, bài học và các nội dung chính.

2. **Component flow**
   Hiển thị tiến trình các component trong bài học. Người học có thể xem mình đang ở đâu trong flow và có thể revert về các component trước đó.

Cột này đóng vai trò như khu vực điều hướng và quản lý tiến trình học.

---

#### Cột giữa: Video và hình ảnh

Cột giữa là khu vực hiển thị nội dung trực quan chính của lesson.

Nội dung có thể bao gồm:

* Video bài học
* Hình ảnh minh họa
* Sơ đồ
* Mind map
* Slide hoặc ảnh giải thích
* Các visual content khác

Đây là khu vực trung tâm của lesson, nơi người học tiếp nhận nội dung chính.

---

#### Cột phải: Question, game và dialogue

Cột phải sẽ chứa các component tương tác liên quan đến nội dung ở cột giữa.

Các component có thể bao gồm:

* Câu hỏi kiểm tra
* Trắc nghiệm
* Multi-select
* Matching column
* Dialogue
* Mini game
* Review activity
* Nội dung tương tác theo từng đoạn video hoặc từng hình ảnh

Cột phải giúp người học tương tác ngay trong quá trình xem video hoặc hình ảnh, thay vì phải chuyển sang một màn hình khác.

---

## 4. Update chi tiết các component

## 4.1. Matching Column Component

Matching column hiện đang có lỗi liên quan đến số dòng hiển thị trong một component. Do nội dung mỗi ô có số dòng khác nhau, các ô bị lệch chiều cao quá nhiều, làm giao diện mất cân đối.

Các update cần thực hiện:

### 4.1.1. Fix bug chiều cao ô

Mỗi ô trong matching column cần có kích thước cố định hoặc được chuẩn hóa theo một chiều cao hợp lý, thay vì tự động co giãn quá nhiều theo số dòng text.

Mục tiêu:

* Các ô nhìn cân đối hơn.
* Hạn chế việc một đáp án quá dài làm vỡ layout.
* Tăng tính thẩm mỹ và dễ thao tác.
* Giữ trải nghiệm nhất quán giữa các câu hỏi.

Nếu nội dung quá dài, có thể xử lý bằng cách giới hạn chiều cao, hiển thị ellipsis, tooltip hoặc mở rộng khi hover/click.

---

### 4.1.2. Tạo độ thụt cho mũi tên

Hiện tại mũi tên nối giữa các cột chỉ đi ngang, khiến giao diện khá cứng và khó phân biệt khi có nhiều kết nối.

Update mới cần tạo độ thụt hoặc đường cong nhẹ cho mũi tên.

Mục tiêu:

* Đường nối dễ nhìn hơn.
* Hạn chế chồng chéo trực quan.
* Tạo cảm giác tự nhiên khi nối các cặp đáp án.
* Giúp người học dễ theo dõi lựa chọn của mình.

---

### 4.1.3. Xóa phần hiển thị các đường nối đã chọn

Cần loại bỏ phần hiển thị danh sách các đường nối đã chọn nếu phần này đang làm giao diện dư thừa hoặc rối mắt.

Thay vào đó, trạng thái kết nối nên được thể hiện trực tiếp trên UI thông qua:

* Màu sắc của ô đã chọn.
* Đường nối trực quan.
* Trạng thái đúng/sai sau khi submit.
* Animation hoặc highlight nhẹ khi nối thành công.

---

### 4.1.4. Cho phép kéo thả

Matching column cần hỗ trợ thao tác kéo thả để người học có thể nối hoặc ghép cặp bằng cách drag item từ một cột sang cột còn lại.

Tuy nhiên, hệ thống drag-and-drop không nên chỉ áp dụng riêng cho matching column. Đây nên được thiết kế thành một cơ chế dùng chung cho toàn bộ game component.

---

## 4.2. Drag-and-drop system dùng chung cho game

Cơ chế kéo thả cần được tách thành một interaction system có thể tái sử dụng.

Các component có thể sử dụng drag-and-drop gồm:

* Matching column
* Sorting game
* Classification game
* Fill-in-the-blank dạng kéo đáp án
* Mind map arrangement
* Timeline arrangement
* Các game tương tác khác trong tương lai

Việc tách drag-and-drop thành một hệ thống dùng chung giúp giảm trùng lặp code, dễ bảo trì và dễ mở rộng khi thêm game mới.

---

## 4.3. Multi-select Component

Multi-select component cần chỉnh lại màu sắc hiển thị kết quả.

Hiện tại, các đáp án đúng nhưng không được người học chọn đang được hiển thị màu xanh. Điều này có thể gây hiểu nhầm rằng người học đã chọn đúng đáp án đó.

Update mới:

* Những đáp án người học chọn đúng: hiển thị màu xanh.
* Những đáp án người học chọn sai: hiển thị màu đỏ.
* Những đáp án đúng nhưng người học không chọn: hiển thị màu đỏ hoặc trạng thái cảnh báo.
* Những đáp án không liên quan và không được chọn: giữ trạng thái trung tính.

Mục tiêu là giúp người học hiểu rõ lỗi sai của mình: không chỉ sai vì chọn nhầm, mà còn sai vì bỏ sót đáp án đúng.

---

## 4.4. Mind Map Review Component

Mind map review sẽ được nâng cấp mạnh để hỗ trợ nhiều dạng hiển thị và nội dung phong phú hơn.

### 4.4.1. Cho phép thêm ảnh vào mỗi mảnh ghép

Mỗi mảnh ghép trong mind map review có thể chứa:

* Text
* Hình ảnh
* Kết hợp cả text và hình ảnh

Điều này giúp mind map không chỉ là nội dung chữ, mà có thể trở thành một dạng flashcard trực quan, phù hợp với các bài học có nhiều khái niệm, nhân vật, ví dụ hoặc sơ đồ.

---

### 4.4.2. Tự động mở mảnh ghép sau 2 giây

Mỗi mảnh ghép cần có cơ chế tự động mở sau 2 giây.

Cách hoạt động đề xuất:

* Ban đầu mảnh ghép hiển thị mặt úp.
* Sau 2 giây, mảnh ghép tự động mở.
* Khi mở, nội dung bên trong được hiển thị.
* Có thể kết hợp animation flip để tăng trải nghiệm.

Tính năng này giúp tạo nhịp học tập tự động, phù hợp với hoạt động review nhanh hoặc ghi nhớ khái niệm.

---

### 4.4.3. Mặt úp có thể chứa cả chữ và ảnh

Trước khi mở, mặt úp của mảnh ghép cũng cần hỗ trợ cả chữ và ảnh.

Ví dụ:

* Mặt úp hiển thị một khái niệm.
* Mặt mở hiển thị định nghĩa.
* Mặt úp hiển thị hình ảnh một triết gia.
* Mặt mở hiển thị tên, trường phái hoặc tư tưởng chính.
* Mặt úp hiển thị câu hỏi.
* Mặt mở hiển thị gợi ý hoặc đáp án.

Điều này giúp mind map review linh hoạt hơn, không bị giới hạn vào dạng lật thẻ đơn giản.

---

### 4.4.4. Hỗ trợ nhiều bố cục hiển thị

Mind map review cần hỗ trợ nhiều dạng layout khác nhau.

Các layout cần có:

1. **Hiển thị dọc**
   Các mảnh ghép xếp theo chiều dọc.

2. **Hiển thị ngang**
   Các mảnh ghép xếp theo chiều ngang.

3. **Hiển thị dạng ma trận A × B**
   Ví dụ: 2 × 3, 3 × 4, 4 × 4.

4. **Hiển thị theo từng hàng có số lượng khác nhau**
   Ví dụ:

   * Hàng đầu tiên có A mảnh ghép.
   * Hàng thứ hai có B mảnh ghép.
   * Các hàng sau có thể tiếp tục theo cấu hình riêng.

Dạng layout này giúp designer bài học có thể tạo bố cục phù hợp với từng nội dung, thay vì bị ép vào một kiểu hiển thị cố định.

---

## 5. Quy chuẩn chung cho Question, Dialogue và Game Component

Tất cả component thuộc nhóm question, dialogue và game cần được chuẩn hóa theo hướng hỗ trợ nội dung đa phương tiện.

Mỗi component nên có khả năng chứa:

* Text
* Image
* Video reference nếu cần
* Audio nếu mở rộng sau này
* Answer options có text hoặc image
* Feedback có text hoặc image
* Explanation sau khi submit
* Metadata để liên kết với video hoặc hình ảnh ở cột giữa

Điều này giúp hệ thống lesson đủ linh hoạt để xây dựng các bài học phức tạp hơn, đặc biệt là các bài học Triết học có nhiều khái niệm trừu tượng cần hình ảnh, ví dụ và tương tác để làm rõ.

---

## 6. Định hướng dữ liệu đề xuất cho component

Để hỗ trợ các update trên, mỗi component nên có cấu trúc dữ liệu mở rộng, bao gồm các nhóm thông tin chính:

* `component_id`: định danh component.
* `component_type`: loại component, ví dụ: question, dialogue, game, matching, multi_select, mind_map_review.
* `title`: tiêu đề component.
* `content`: nội dung chính.
* `media`: hình ảnh, video, audio hoặc tài nguyên liên quan.
* `linked_media_id`: liên kết với video hoặc hình ảnh ở cột giữa.
* `trigger_time`: thời điểm xuất hiện nếu component gắn với video.
* `layout_config`: cấu hình layout.
* `interaction_config`: cấu hình tương tác như drag-and-drop, select, match, flip.
* `answer_config`: cấu hình đáp án.
* `feedback_config`: cấu hình phản hồi sau khi trả lời.
* `navigation_config`: cấu hình cho component flow và revert.

Cấu trúc này giúp back-end quản lý component linh hoạt hơn, đồng thời front-end có đủ dữ liệu để render đúng từng loại component.

---

## 7. Kết quả kỳ vọng sau update

Sau khi hoàn thành update, hệ thống lesson của ứng dụng Triết học sẽ đạt được các cải tiến sau:

1. **Lesson linh hoạt hơn**
   Mỗi bài học có thể được xây dựng như một flow gồm nhiều component độc lập.

2. **Video và hình ảnh trở thành trung tâm tương tác**
   Câu hỏi, game và dialogue có thể hiển thị song song với video/hình ảnh.

3. **Giao diện học tập rõ ràng hơn**
   Layout ba cột giúp tách biệt điều hướng, nội dung chính và hoạt động tương tác.

4. **Component dễ mở rộng hơn**
   Các component mới có thể được thêm vào mà không phá vỡ lesson cũ.

5. **Trải nghiệm học tập tốt hơn**
   Người học có thể xem, trả lời, chơi game, hội thoại và review trong cùng một màn hình.

6. **Tăng khả năng cá nhân hóa bài học**
   Component flow và revert giúp người học dễ quay lại nội dung cũ để ôn tập.

7. **Tăng tính trực quan của môn Triết học**
   Việc hỗ trợ hình ảnh trong question, answer, dialogue và game giúp các khái niệm trừu tượng dễ hiểu hơn.

---

## 8. Thứ tự ưu tiên triển khai đề xuất

### Giai đoạn 1: Cấu trúc nền tảng

* Thiết kế lại schema lesson component.
* Chuẩn hóa component flow.
* Hỗ trợ component liên kết với video/hình ảnh.
* Chuẩn hóa media support cho question, dialogue và game.

### Giai đoạn 2: Layout lesson mới

* Chỉnh left sidebar có thể thu gọn dạng icon-only.
* Thiết kế tab Lesson theo bố cục ba cột.
* Tích hợp course content và component flow ở cột trái.
* Hiển thị video/hình ảnh ở cột giữa.
* Hiển thị question/game/dialogue ở cột phải.

### Giai đoạn 3: Fix và nâng cấp component hiện có

* Fix matching column về kích thước ô.
* Cải thiện mũi tên nối có độ thụt hoặc đường cong.
* Xóa phần danh sách đường nối đã chọn.
* Thêm drag-and-drop cho matching column.
* Tách drag-and-drop thành system dùng chung cho toàn bộ game.
* Sửa màu kết quả trong multi-select.

### Giai đoạn 4: Nâng cấp component review

* Nâng cấp mind map review.
* Cho phép mỗi mảnh ghép chứa ảnh.
* Cho phép mặt úp chứa chữ và ảnh.
* Tự động mở mảnh ghép sau 2 giây.
* Hỗ trợ layout dọc, ngang, ma trận A × B và layout từng hàng có số lượng khác nhau.

---

## 9. Kết luận

Bản update lần này sẽ giúp dự án ứng dụng Triết học chuyển từ mô hình lesson tuyến tính sang mô hình lesson tương tác theo flow. Thay vì chỉ hiển thị nội dung và câu hỏi một cách tách rời, hệ thống mới cho phép video, hình ảnh, dialogue, question và game hoạt động song song trong cùng một trải nghiệm học tập.

Về mặt kỹ thuật, update này giúp hệ thống có kiến trúc mở rộng tốt hơn. Về mặt sản phẩm, update này giúp bài học trở nên trực quan, sinh động và dễ tiếp cận hơn. Đây là bước nâng cấp quan trọng để dự án không chỉ là một ứng dụng đọc nội dung Triết học, mà trở thành một nền tảng học Triết học có tính tương tác, cá nhân hóa và hiện đại hơn.
