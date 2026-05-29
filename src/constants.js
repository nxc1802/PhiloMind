// Hằng số dùng chung toàn bộ ứng dụng — gom về một nơi để tránh magic numbers/strings (Rule 6)

// --- Ngưỡng đánh giá Quiz ---
export const QUIZ_PASS_THRESHOLD = 3;          // Số câu đúng tối thiểu để qua quiz cuối bài
export const VIDEO_QUIZ_SIZE = 3;              // Số câu trong mini-quiz sau video

// --- Player podcast ---
export const PODCAST_SKIP_SECONDS = 10;        // Bước tua nhanh/lùi của podcast (giây)

// --- Trò chơi lật thẻ ghi nhớ (Shinkei-suijaku) ---
export const MEMORY_MATCH_DELAY_MS = 450;      // Thời gian giữ trước khi loại bỏ 2 thẻ khớp
export const MEMORY_FLIP_BACK_MS = 1000;       // Thời gian giữ trước khi úp lại 2 thẻ không khớp

// --- Cấu hình sidebar dùng chung cho mọi trang ---
// Mỗi item có key để xác định trang đang active
// Mindmap đã được tích hợp thẳng vào trang Lessons nên không còn mục riêng
export const SIDEBAR_NAV_ITEMS = [
  { key: "flashcards", to: "/flashcards", icon: "cards",        label: "Flashcards"  },
  { key: "debate",     to: "/debate",     icon: "diversity_3",  label: "Debate"      },
  { key: "lessons",    to: "/lessons",    icon: "menu_book",    label: "Lessons"     },
  { key: "quiz",       to: "/quiz",       icon: "quiz",         label: "Quiz System" },
  { key: "docs",       to: "/docs",       icon: "description",  label: "PDF Docs"    },  // route /docs nay co thuc, xem src/pages/Docs.jsx
];
