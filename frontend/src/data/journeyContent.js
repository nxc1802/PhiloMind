// ============================================================================
// NOI DUNG BAI HOC TUONG TAC: "HANH TRINH KHAI SANG"
// Chu de: Nguon goc cua triet hoc (Chuong 1 - Khai luoc ve Triet hoc)
//
// Toan bo loi thoai, cau hoi, dap an, phan giai duoc tach khoi UI (Rule 2, Rule 3).
// Khi can chinh noi dung bai giang -> chi sua file nay, khong dong vao component.
//
// Bam sat noi dung ly thuyet goc: triet hoc ra doi the ky VIII-VI TCN tu HAI nguon goc
//   (1) Nguon goc nhan thuc  (2) Nguon goc xa hoi.
// Co che choi don: nguoi hoc dong vai NGUOI TRA LOI; he thong (nhan vat dan duong + cac
// NPC) dat cau hoi va dong cac vai con lai -> tao cam giac dang hoc cung mot nhom.
// ============================================================================

// --- Cac nhan vat NPC (he thong dong vai) ---
export const CHARACTERS = {
  guide: {
    id: "guide",
    name: "Sophia",
    role: "Người Khai Sáng dẫn đường",
    avatar: "guide", // khoa tra cuu illustration avatar
    color: "from-indigo-500 to-violet-600",
  },
  elder: {
    id: "elder",
    name: "Già làng Kael",
    role: "Trưởng bộ tộc",
    avatar: "elder",
    color: "from-amber-500 to-orange-600",
  },
  skeptic: {
    id: "skeptic",
    name: "Người hoài nghi Lyra",
    role: "Kẻ phản biện trong bộ tộc",
    avatar: "skeptic",
    color: "from-cyan-500 to-blue-600",
  },
  slave: {
    id: "slave",
    name: "Người lao động Borin",
    role: "Tầng lớp lao động chân tay",
    avatar: "slave",
    color: "from-stone-500 to-stone-700",
  },
  noble: {
    id: "noble",
    name: "Quý tộc Theon",
    role: "Tầng lớp lao động trí óc",
    avatar: "noble",
    color: "from-fuchsia-500 to-purple-600",
  },
};

// ============================================================================
// MAN DAN NHAP — VONG 1: CO MAY THOI GIAN & DIEM KHOI DAU
// ============================================================================
export const INTRO = {
  scene: "timeMachine",
  title: "Cỗ Máy Thời Gian",
  subtitle: "Thế kỷ VIII – VI trước Công nguyên",
  // Lời dẫn tuần tự cua nhan vat dan duong
  lines: [
    { who: "guide", text: "Nhiệm vụ của bạn: đi tìm một thứ 'vũ khí tư duy' hoàn toàn mới — có tên là TRIẾT HỌC. Nhưng để tìm thấy nó, ta phải vượt qua 2 thử thách, đại diện cho 2 NGUỒN GỐC khai sinh ra triết học." },
  ],
  // Diem khoi hanh de nguoi hoc chon (mang tinh nhap vai, khong cham diem)
  startPoints: [
    { id: "athens", label: "Quảng trường Athena", place: "Hy Lạp", icon: "account_balance" },
    { id: "ganges", label: "Bên bờ sông Hằng", place: "Ấn Độ", icon: "water" },
    { id: "yellowriver", label: "Lưu vực Hoàng Hà", place: "Trung Hoa", icon: "temple_buddhist" },
  ],
  startConfirm:
    "Tuyệt vời! Dù khởi hành từ đâu, mọi nền văn minh cổ đại đều cùng chạm tới một bước ngoặt tư duy giống nhau. Lên đường thôi!",
};

// ============================================================================
// VONG 2 — THU THACH NHAN THUC: "GIAI MA SAM TRUYEN"
// Muc tieu su pham: nguoi hoc trai nghiem tu duy huyen thoai, gap mau thuan,
// roi tu nhan ra nhu cau tu duy ly luan -> NGUON GOC NHAN THUC.
// ============================================================================
export const ROUND_COGNITIVE = {
  id: "cognitive",
  scene: "earthquake",
  badge: "Thử thách 1 / 2",
  title: "Giải mã sấm truyền",
  subtitle: "Nguồn gốc nhận thức",
  pieceLabel: "NGUỒN GỐC NHẬN THỨC",

  // Mo canh — boi canh da duoc the hien qua VIDEO o tren (VideoScene).
  // Phan thoai chi con dan dat nhap vai + dat van de. Nguoi hoc dong vai mot
  // thanh vien bo toc co dai.
  setup: [
    { who: "elder", text: "Tai họa này từ đâu mà ra?! Hỡi người trẻ kia, hãy giải thích cho cả bộ tộc!" },
  ],

  // Cau hoi 1 (cham diem): rut ra tu video — cach nguoi co dai giai thich hien tuong tu nhien.
  // Dap an dung: A (tu duy than thoai / sieu nhien) -> dat nen cho NGUON GOC NHAN THUC.
  myth: {
    prompt:
      "Con người thời cổ đại thường dùng cách nào để giải thích về các hiện tượng tự nhiên lớn (như mưa giông, sấm chớp, động đất)?",
    options: [
      {
        text: "Cho rằng đó là sự giận dữ hoặc ý chí của các vị thần linh siêu nhiên.",
        correct: true,
      },
      {
        text: "Dựa vào các quy luật khoa học và sự vận động của Trái Đất để chứng minh.",
        correct: false,
      },
      {
        text: "Xem đó là những hiện tượng ngẫu nhiên, không có nguyên nhân hay ý nghĩa gì.",
        correct: false,
      },
    ],
    correctFeedback:
      "Chính xác! Khi chưa có tri thức khoa học, con người cổ đại giải thích mọi hiện tượng tự nhiên bằng THẦN THOẠI và TÍN NGƯỠNG — coi đó là ý chí hay cơn thịnh nộ của thần linh. Đây chính là hình thức 'triết lý' sơ khai đầu tiên của loài người.",
    wrongFeedback:
      "Chưa đúng. Hãy nhớ bối cảnh trong video: thời cổ đại CHƯA có khoa học để chứng minh (loại đáp án B), và con người luôn khao khát tìm nguyên nhân chứ không xem mọi việc là ngẫu nhiên vô nghĩa (loại đáp án C). Họ giải thích tự nhiên bằng niềm tin vào thần linh siêu nhiên.",
  },

  // Buoc ngoat: NPC hoai nghi xuat hien tao mau thuan
  twist: [
    { who: "skeptic", text: "Trời ơi, sao số phận chúng ta khổ thế này! Mưa giông, lũ lụt, hạn hán rồi động đất... năm nào cũng ập tới. Chúng ta đã quỳ lạy, đã tế bao nhiêu lễ vật cho thần linh, vậy mà thiên tai VẪN cứ giáng xuống, chẳng gì đổi thay. Lẽ nào chúng ta mãi mãi bất lực, hay có điều gì khác mà chúng ta chưa biết về thiên nhiên, chẳng hề phụ thuộc vào tâm trạng của các vị thần?" },
  ],

  // Cau hoi 2: nguoi hoc tra loi nguoi hoai nghi -> chot duoc su chuyen dich tu duy
  shift: {
    prompt: "Câu hỏi của Lyra hé lộ điều gì đang BẮT ĐẦU thay đổi trong cách con người suy nghĩ?",
    options: [
      {
        text: "Con người bắt đầu đi tìm quy luật, lý lẽ để giải thích thế giới — thay cho thần thánh.",
        correct: true,
      },
      {
        text: "Con người quyết định tế lễ nhiều hơn nữa cho chắc chắn.",
        correct: false,
      },
      {
        text: "Con người từ bỏ hoàn toàn việc tìm hiểu thế giới.",
        correct: false,
      },
    ],
    correctFeedback:
      "Chính xác! Khoảnh khắc con người ngờ vực thần thoại và đi tìm QUY LUẬT bằng lý lẽ — đó là lúc tư duy lý luận, tức TRIẾT HỌC, bắt đầu nảy mầm.",
    wrongFeedback:
      "Chưa đúng. Hãy để ý: Lyra không kêu gọi tế lễ — cô ấy đang đi tìm một 'quy luật tự nhiên'. Đó mới là mầm mống của tư duy mới.",
  },

  // Duc ket: 4 buoc tien hoa cua tu duy -> mo khoa NGUON GOC NHAN THUC
  conclusion: {
    title: "Đúc kết: Nguồn gốc nhận thức của triết học",
    steps: [
      {
        icon: "psychology",
        head: "1. Nhu cầu tự nhiên",
        body: "Nhận thức, hiểu biết thế giới xung quanh là nhu cầu tự nhiên của con người để sinh tồn.",
      },
      {
        icon: "auto_stories",
        head: "2. Tư duy huyền thoại",
        body: "Thần thoại và tín ngưỡng nguyên thủy là loại hình triết lý ĐẦU TIÊN dùng để giải thích thế giới.",
      },
      {
        icon: "hub",
        head: "3. Phát triển tư duy trừu tượng",
        body: "Khi nhận thức lớn lên, con người biết trừu tượng hóa, khái quát hóa các tri thức riêng lẻ thành cái chung.",
      },
      {
        icon: "emoji_objects",
        head: "4. Triết học ra đời",
        body: "Triết học là hình thức tư duy lý luận đầu tiên THAY THẾ tư duy huyền thoại — giải thích thế giới bằng khái niệm, phạm trù, quy luật phổ quát.",
      },
    ],
    reward: "Bạn đã thu thập được mảnh ghép: NGUỒN GỐC NHẬN THỨC!",
  },
};

// ============================================================================
// VONG 3 — THU THACH XA HOI: "CUOC HOP DAI HOI BO TOC"
// Muc tieu su pham: nguoi hoc doi goc nhin (no le vs quy toc), tu nhan ra
// chi tang lop lao dong tri oc moi du dieu kien lam triet hoc -> NGUON GOC XA HOI.
// ============================================================================
export const ROUND_SOCIAL = {
  id: "social",
  scene: "society",
  badge: "Thử thách 2 / 2",
  title: "...khi phương thức sản xuất thay đổi...",
  subtitle: "Nguồn gốc xã hội",
  pieceLabel: "NGUỒN GỐC XÃ HỘI",

  // Mo canh — Sophia ke so luoc boi canh (ngan gon) roi moi nguoi hoc nhap vai.
  setup: [
    { who: "guide", text: "Bối cảnh: nhiều thế hệ trôi qua, khi phương thức sản xuất thay đổi — con người biết rèn đồng, rèn sắt, của cải bắt đầu dư thừa — xã hội phân chia thành Chủ nô và Nô lệ." },
    { who: "guide", text: "Để hiểu ai mới đủ điều kiện làm triết học, hãy thử sống MỘT NGÀY trong hai vai khác nhau nhé." },
  ],

  // Trai nghiem 2 vai lan luot — moi vai 1 lua chon nho minh hoa quy thoi gian/dieu kien
  roles: [
    {
      who: "slave",
      label: "Vai 1: Người lao động chân tay",
      intro: "Trời chưa sáng, Borin đã phải ra đồng cày cuốc, vác đá xây tháp tới kiệt sức.",
      question: "Cuối ngày, kiệt quệ vì lo từng bữa ăn — bạn có thời gian và sức lực để ngồi suy ngẫm về nguồn gốc vũ trụ không?",
      options: [
        { text: "Không. Mình chỉ kịp ăn vội rồi ngủ để mai lại lao động.", correct: true },
        { text: "Có. Mình thức trắng đêm để viết một học thuyết triết học.", correct: false },
      ],
      feedbackCorrect:
        "Đúng vậy. Lao động chân tay nặng nhọc và nỗi lo sinh tồn không để lại điều kiện nào cho việc nghiên cứu lý luận.",
      feedbackWrong:
        "Khó lắm! Một người kiệt sức vì lao động chân tay và lo miếng ăn gần như không còn thời gian, sức lực cho tư duy lý luận.",
    },
    {
      who: "noble",
      label: "Vai 2: Tầng lớp quý tộc / trí thức",
      intro: "Theon có của cải dư thừa, không phải lao động chân tay. Chiều đến, ông thong dung ngắm sao trời và đàm đạo cùng bạn hữu.",
      question: "Với điều kiện sống như vậy, Theon có thể làm gì?",
      options: [
        { text: "Dành thời gian quan sát, suy ngẫm và hệ thống hóa tri thức thành học thuyết.", correct: true },
        { text: "Cũng chẳng làm được gì vì quá bận đi cày.", correct: false },
      ],
      feedbackCorrect:
        "Chính xác. Có của cải dư thừa và thời gian rảnh, tầng lớp trí óc mới đủ điều kiện để nghiên cứu và sáng tạo lý luận.",
      feedbackWrong:
        "Không phải. Theon KHÔNG phải lao động chân tay — ông có dư thời gian để suy ngẫm, đó là điểm mấu chốt.",
    },
  ],

  // Cau hoi cot loi cua "dai hoi"
  keyQuestion: {
    prompt:
      "Tại đại hội bộ tộc, câu hỏi lớn được đặt ra: NHÓM NÀO đủ điều kiện, thời gian và nhu cầu để hệ thống hóa tri thức thành học thuyết và trở thành các 'Nhà thông thái'?",
    options: [
      { text: "Tầng lớp lao động trí óc (quý tộc, trí thức).", correct: true },
      { text: "Tầng lớp lao động chân tay (nô lệ).", correct: false },
      { text: "Cả hai nhóm đều như nhau.", correct: false },
    ],
    correctFeedback:
      "Hoàn toàn đúng! Chỉ khi lao động trí óc TÁCH KHỎI lao động chân tay, tầng lớp trí thức mới xuất hiện và có điều kiện hệ thống hóa tri thức thành triết học.",
    wrongFeedback:
      "Hãy nhớ lại trải nghiệm vừa rồi: chỉ tầng lớp có của cải dư thừa và thời gian rảnh (lao động trí óc) mới đủ điều kiện làm việc đó.",
  },

  // Loi canh bao cot loi — tach thanh 3 y nho cho de doc (render duoi dang danh sach)
  warning: [
    "Triết học KHÔNG THỂ ra đời trong một xã hội mông muội, dã man. Nó chỉ ra đời khi xã hội đạt đến một trình độ tương đối cao của sản xuất xã hội, phân công lao động xã hội hình thành, giai cấp phân hóa rõ và mạnh, nhà nước ra đời.",
    "Tầng lớp tri thức xuất hiện đóng vai trò quan trọng trong việc hệ thống hóa toàn bộ tri thức của thời đại để xây dựng nên các học thuyết, lý luận, triết thuyết.",
    "Triết học, ngay từ khi xuất hiện đã mang trong mình tính giai cấp sâu sắc.",
  ],

  // Mini-game: sap xep chuoi nhan qua dung thu tu -> mo khoa NGUON GOC XA HOI
  chain: {
    title: "Lắp ráp chuỗi nhân quả: Vì sao triết học ra đời?",
    instruction: "Chọn các mắt xích theo ĐÚNG thứ tự nhân quả, từ gốc tới ngọn.",
    // order = thu tu dung (0..n)
    items: [
      { id: "c1", order: 0, icon: "agriculture", text: "Sản xuất phát triển, chế độ tư hữu hình thành, của cải dư thừa." },
      { id: "c2", order: 1, icon: "groups", text: "Xã hội phân chia giai cấp (chế độ chiếm hữu nô lệ)." },
      { id: "c3", order: 2, icon: "engineering", text: "Lao động trí óc tách khỏi lao động chân tay." },
      { id: "c4", order: 3, icon: "school", text: "Tầng lớp trí thức xuất hiện và hệ thống hóa tri thức thành triết học." },
    ],
    successFeedback:
      "Chuỗi nhân quả đã sáng lên! Đây chính là NGUỒN GỐC XÃ HỘI của triết học.",
    reward: "Bạn đã thu thập được mảnh ghép: NGUỒN GỐC XÃ HỘI!",
  },
};

// ============================================================================
// VONG 4 — TONG KET: LAP RAP SO DO & THU HOACH
// ============================================================================
export const ROUND_SUMMARY = {
  scene: "synthesis",
  title: "Hợp nhất tri thức",
  // Hai nhanh nguoi hoc da mo khoa
  branches: [
    {
      id: "cognitive",
      title: "Nguồn gốc nhận thức",
      icon: "psychology",
      tagline: "Nhu cầu hiểu biết thế giới → tư duy lý luận thay thế huyền thoại.",
      points: [
        "Nhu cầu tự nhiên: hiểu biết thế giới.",
        "Tư duy huyền thoại → tư duy trừu tượng, khái quát.",
        "Triết học = tư duy lý luận đầu tiên thay thế huyền thoại.",
      ],
      color: "from-cyan-600 to-blue-700",
    },
    {
      id: "social",
      title: "Nguồn gốc xã hội",
      icon: "groups",
      tagline: "Điều kiện xã hội chín muồi → tầng lớp trí thức ra đời.",
      points: [
        "Sản xuất phát triển, tư hữu & giai cấp xuất hiện.",
        "Lao động trí óc tách khỏi lao động chân tay.",
        "Tầng lớp trí thức hệ thống hóa tri thức thành học thuyết.",
      ],
      color: "from-fuchsia-600 to-purple-700",
    },
  ],
  center: "TRIẾT HỌC RA ĐỜI",
  centerNote: "Thế kỷ VIII – VI TCN, ở cả phương Đông và phương Tây",
  // Cau dúc ket hoan chinh — hien khi nguoi hoc ghep 2 manh lai voi nhau
  finalStatement:
    "Triết học ra đời từ sự HỢP NHẤT của hai nguồn gốc: NHU CẦU NHẬN THỨC thế giới của con người và những ĐIỀU KIỆN XÃ HỘI chín muồi — phân công lao động, giai cấp, và sự xuất hiện của tầng lớp trí thức.",
  guideLines: [
    "Chúc mừng nhà du hành! Bạn đã ghép xong bức tranh hoàn chỉnh.",
    "Triết học không từ trên trời rơi xuống. Nó nảy sinh từ chính NHU CẦU HIỂU BIẾT của con người (nguồn gốc nhận thức)...",
    "...và từ những ĐIỀU KIỆN XÃ HỘI chín muồi: phân công lao động, giai cấp, tầng lớp trí thức (nguồn gốc xã hội).",
  ],
};

// --- Quiz tong ket cuoi hanh trinh (cung co kien thuc) ---
export const JOURNEY_FINAL_QUIZ = [
  {
    question: "Triết học ra đời vào khoảng thời gian nào?",
    options: ["Thế kỷ XV – XVI sau CN", "Thế kỷ VIII – VI trước CN", "Thế kỷ I sau CN", "Thời kỳ đồ đá cũ"],
    correctIndex: 1,
    explanation:
      "Triết học ra đời khoảng thế kỷ VIII – VI trước Công nguyên, ở cả phương Đông và phương Tây, tại các trung tâm văn minh lớn.",
  },
  {
    question: "Triết học có mấy nguồn gốc cơ bản?",
    options: ["Một: nguồn gốc thần thánh", "Hai: nhận thức và xã hội", "Ba: kinh tế, chính trị, văn hóa", "Không có nguồn gốc xác định"],
    correctIndex: 1,
    explanation:
      "Triết học có hai nguồn gốc: nguồn gốc nhận thức (nhu cầu hiểu biết, vượt qua tư duy huyền thoại) và nguồn gốc xã hội (phân công lao động, giai cấp, tầng lớp trí thức).",
  },
  {
    question: "Về nguồn gốc nhận thức, triết học là hình thức tư duy thay thế cho cái gì?",
    options: ["Thay thế khoa học tự nhiên", "Thay thế tư duy huyền thoại và tôn giáo", "Thay thế lao động chân tay", "Thay thế nghệ thuật"],
    correctIndex: 1,
    explanation:
      "Triết học là hình thức tư duy lý luận đầu tiên thay thế cho tư duy huyền thoại và tôn giáo, giải thích thế giới bằng khái niệm, phạm trù, quy luật phổ quát.",
  },
  {
    question: "Điều kiện xã hội nào là tiền đề cho triết học ra đời?",
    options: [
      "Xã hội mông muội, chưa phân hóa",
      "Phân công lao động, giai cấp xuất hiện, lao động trí óc tách khỏi chân tay",
      "Mọi người đều làm nông nghiệp như nhau",
      "Xã hội không có của cải dư thừa",
    ],
    correctIndex: 1,
    explanation:
      "Triết học ra đời khi sản xuất phát triển, tư hữu và giai cấp xuất hiện, lao động trí óc tách khỏi lao động chân tay, hình thành tầng lớp trí thức có điều kiện hệ thống hóa tri thức.",
  },
  {
    question: "Vì sao tầng lớp trí thức (lao động trí óc) lại là người sáng tạo ra triết học?",
    options: [
      "Vì họ khỏe mạnh hơn",
      "Vì họ có của cải dư thừa, thời gian và nhu cầu để nghiên cứu, hệ thống hóa tri thức",
      "Vì họ được thần linh ban cho",
      "Vì họ làm nhiều việc chân tay hơn",
    ],
    correctIndex: 1,
    explanation:
      "Nhờ có của cải dư thừa and không phải lao động chân tay, tầng lớp trí thức có điều kiện và nhu cầu nghiên cứu, đủ năng lực hệ thống hóa các quan niệm thành học thuyết, lý luận.",
  },
];

export const COMPLETION = {
  badge: "Nhà Khai Sáng",
  badgeNote: "Chương 1.1 — Nguồn gốc của triết học",
  message:
    "Bạn đã hoàn thành Hành trình Khai Sáng và nắm được trọn vẹn hai nguồn gốc của triết học. Tri thức là ngọn đuốc — hãy tiếp tục thắp sáng!",
  quote: {
    text: "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới.",
    author: "Karl Marx, Luận cương về Feuerbach",
  },
};
