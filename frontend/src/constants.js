// Hằng số dùng chung toàn bộ ứng dụng — gom về một nơi để tránh magic numbers/strings (Rule 6)

// --- Ngưỡng đánh giá Quiz ---
export const QUIZ_PASS_THRESHOLD = 3;          // Số câu đúng tối thiểu để qua quiz cuối bài
export const VIDEO_QUIZ_SIZE = 3;              // Số câu trong mini-quiz sau video

// --- Player podcast ---
export const PODCAST_SKIP_SECONDS = 10;        // Bước tua nhanh/lùi của podcast (giây)

// --- Trò chơi lật thẻ ghi nhớ (Shinkei-suijaku) ---
export const MEMORY_MATCH_DELAY_MS = 450;      // Thời gian giữ trước khi loại bỏ 2 thẻ khớp
export const MEMORY_FLIP_BACK_MS = 5000;       // Thời gian giữ trước khi úp lại 2 thẻ không khớp

// --- Cấu hình sidebar dùng chung cho mọi trang ---
// Mỗi item có key để xác định trang đang active
// Mindmap đã được tích hợp thẳng vào trang Lessons nên không còn mục riêng
export const SIDEBAR_NAV_ITEMS = [
  { key: "home",  to: "/",  icon: "home",      label: "Trang chủ"   },
  { key: "lessons",    to: "/lessons",    icon: "menu_book",      label: "Sơ đồ bài học"      },
  { key: "practice",   to: "/practice",   icon: "fitness_center", label: "Khu luyện tập"    },
  { key: "debate",     to: "/debate",     icon: "diversity_3",    label: "Góc tranh luận"      },
  { key: "philosofun", to: "/philosofun", icon: "smart_display",  label: "PhilosoFUN"  },
  { key: "docs",       to: "/docs",       icon: "description",    label: "Tài liệu"    },
];
