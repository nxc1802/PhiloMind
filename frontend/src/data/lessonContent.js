// Dữ liệu nội dung Lesson — tách khỏi component để file JSX gọn nhẹ (Rule 2, Rule 3)
// Khi cần đổi nội dung warmup, quiz, podcast: chỉ sửa file này, không động vào UI

// --- Pool các kiểu warm-up; chọn ngẫu nhiên 1 mục mỗi lần mở bài ---
export const WARMUP_POOL = [
  {
    type: "image-guess",
    title: "Nhìn hình đoán chữ",
    hint: "Bức ảnh này gợi ý đến khái niệm trung tâm của bài học.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop",
    blanks: "V _ T   C H _ T",
    answer: "vật chất",
    reveal:
      "Đây chính là phạm trù trung tâm của bài học: VẬT CHẤT — thực tại khách quan tồn tại độc lập với ý thức.",
  },
  {
    type: "story",
    title: "Câu chuyện dẫn dắt",
    story:
      "Một người mù sờ vào con voi và nói: \"Con voi giống như cái cột nhà.\" Người khác sờ vào tai và bảo: \"Không, nó giống cái quạt.\" Mỗi người đều mô tả đúng một phần, nhưng không ai thấy được toàn thể.",
    question:
      "Câu chuyện này gợi cho bạn liên tưởng tới đặc điểm nào của nhận thức cảm tính?",
    options: [
      "Nhận thức cảm tính phản ánh đầy đủ bản chất sự vật",
      "Nhận thức cảm tính chỉ phản ánh từng mặt riêng lẻ của sự vật",
      "Nhận thức cảm tính luôn sai lầm",
    ],
    correctIndex: 1,
    reveal:
      "Đúng vậy — đây là lý do triết học Mác-Lênin nhấn mạnh phải đi từ cảm tính lên lý tính để nắm bắt bản chất.",
  },
  {
    type: "image-guess",
    title: "Nhìn hình đoán khái niệm",
    hint: "Hình ảnh dòng sông không bao giờ ngừng chảy.",
    image:
      "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?w=900&auto=format&fit=crop",
    blanks: "V _ N   Đ _ N G",
    answer: "vận động",
    reveal:
      "VẬN ĐỘNG là phương thức tồn tại của vật chất — không có vật chất nào không vận động.",
  },
  {
    type: "story",
    title: "Mẩu chuyện triết học",
    story:
      "Heraclitus từng nói: \"Không ai tắm hai lần trên cùng một dòng sông.\" Vì khi bạn bước xuống lần thứ hai, dòng nước đã khác, và chính bạn cũng đã khác.",
    question: "Câu nói này thể hiện quan điểm gì?",
    options: [
      "Mọi sự vật đều bất biến",
      "Vận động và biến đổi là tuyệt đối",
      "Chỉ có ý thức là tồn tại",
    ],
    correctIndex: 1,
    reveal:
      "Chính xác. Đây là tư tưởng tiền đề cho phép biện chứng — mọi sự vật đều luôn vận động, biến đổi và phát triển.",
  },
];

// --- Mini-quiz hiển thị ngay sau khi user xem xong video ---
export const VIDEO_QUIZ_QUESTIONS = [
  {
    question: "Theo định nghĩa của Lênin, vật chất là gì?",
    options: [
      "Là các sự vật cụ thể tồn tại trong tự nhiên",
      "Là một phạm trù triết học chỉ thực tại khách quan",
      "Là sản phẩm của ý thức con người",
    ],
    correctIndex: 1,
  },
  {
    question: "Vật chất tồn tại bằng phương thức nào?",
    options: ["Đứng yên", "Vận động", "Tách rời không gian và thời gian"],
    correctIndex: 1,
  },
  {
    question: "Định nghĩa vật chất của Lênin giải quyết vấn đề nào của triết học?",
    options: [
      "Vấn đề đạo đức",
      "Hai mặt vấn đề cơ bản của triết học",
      "Vấn đề logic hình thức",
    ],
    correctIndex: 1,
  },
];

// --- Quiz tổng kết cuối bài ---
// Mỗi câu có thêm `explanation`: hiển thị khi người học trả lời đúng
export const FINAL_QUIZ_QUESTIONS = [
  {
    question: "Đặc điểm nào KHÔNG phải của vật chất theo quan điểm duy vật biện chứng?",
    options: [
      "Tồn tại khách quan",
      "Phụ thuộc vào ý thức con người",
      "Vận động không ngừng",
      "Có thể nhận thức được",
    ],
    correctIndex: 1,
    explanation:
      "Vật chất tồn tại khách quan, độc lập với ý thức. Nói vật chất phụ thuộc vào ý thức là quan điểm duy tâm, trái với chủ nghĩa duy vật biện chứng.",
  },
  {
    question: "Hình thức vận động nào là cao nhất?",
    options: ["Cơ học", "Vật lý", "Hóa học", "Xã hội"],
    correctIndex: 3,
    explanation:
      "Vận động xã hội là hình thức cao nhất và phức tạp nhất, bao hàm trong nó các hình thức vận động thấp hơn (cơ, lý, hóa, sinh).",
  },
  {
    question: "Không gian và thời gian là gì?",
    options: [
      "Hình thức tồn tại của vật chất",
      "Sản phẩm của tư duy thuần túy",
      "Tồn tại độc lập với vật chất",
    ],
    correctIndex: 0,
    explanation:
      "Không gian và thời gian là những hình thức tồn tại khách quan của vật chất đang vận động, không thể tách rời khỏi vật chất.",
  },
  {
    question: "Câu nào sau đây thể hiện đúng quan điểm duy vật biện chứng?",
    options: [
      "Ý thức quyết định vật chất",
      "Vật chất quyết định ý thức, ý thức tác động trở lại vật chất",
      "Vật chất và ý thức tồn tại song song không liên hệ",
    ],
    correctIndex: 1,
    explanation:
      "Vật chất là cái có trước và quyết định ý thức; đồng thời ý thức có tính độc lập tương đối và tác động trở lại vật chất thông qua hoạt động thực tiễn.",
  },
];

// --- Podcast tập hiện tại + transcript đồng bộ thời gian ---
// transcript[i].t = mốc thời gian (giây) của câu thoại i
export const PODCAST_EPISODE = {
  id: "ep1",
  title: "Vật chất – Hiểu cho đúng theo Lênin",
  host: "ThS. Nguyễn Văn A",
  cover:
    "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=600&auto=format&fit=crop",
  src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e3edee2cd.mp3",
  transcript: [
    { t: 0,  text: "Xin chào các bạn, chào mừng đến với podcast Triết học Mác – Lênin." },
    { t: 4,  text: "Trong tập hôm nay, chúng ta cùng đi sâu vào phạm trù vật chất." },
    { t: 9,  text: "Đây là một trong những phạm trù trung tâm của triết học duy vật biện chứng." },
    { t: 14, text: "V.I. Lênin định nghĩa: \"Vật chất là một phạm trù triết học\"," },
    { t: 19, text: "\"dùng để chỉ thực tại khách quan được đem lại cho con người trong cảm giác\"." },
    { t: 26, text: "Định nghĩa này có ba nội dung cơ bản mà chúng ta cần lưu ý." },
    { t: 31, text: "Thứ nhất, vật chất là cái tồn tại khách quan, độc lập với ý thức." },
    { t: 37, text: "Thứ hai, vật chất là cái mà con người có thể nhận thức được." },
    { t: 43, text: "Thứ ba, vật chất không đồng nhất với bất kỳ dạng cụ thể nào của nó." },
    { t: 50, text: "Định nghĩa của Lênin đã giải quyết triệt để vấn đề cơ bản của triết học." },
    { t: 57, text: "Đồng thời mở đường cho khoa học tiếp tục khám phá các dạng vật chất mới." },
    { t: 64, text: "Cảm ơn các bạn đã lắng nghe. Hẹn gặp lại ở tập sau!" },
  ],
};

// --- Danh sách bài học trong syllabus bên phải ---
export const SYLLABUS_ITEMS = [
  { status: "completed", title: "Bài mở đầu: Nhập môn Triết học" },
  { status: "active",    title: "Bài 1: Vật chất và các hình thức tồn tại" },
  { status: "locked",    title: "Bài 2: Nguồn gốc và bản chất của ý thức" },
  { status: "locked",    title: "Bài 3: Mối quan hệ giữa vật chất và ý thức" },
  { status: "locked",    title: "Bài 4: Hai nguyên lý của phép biện chứng" },
];
