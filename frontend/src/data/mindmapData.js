// Dữ liệu cấu trúc sơ đồ tư duy: Chương -> Đề mục -> Bài học
// Tách riêng để Mindmap.jsx tập trung vào trình bày (Rule 2, Rule 3)

export const MINDMAP_CHAPTERS = [
  {
    id: "ch1",
    title: "Chương 1",
    subtitle: "Triết học và vai trò của triết học trong đời sống xã hội",
    color: "from-red-700 to-red-900",
    sections: [
      {
        id: "ch1-s1",
        title: "Khái lược về Triết học",
        lessons: [
          { id: "l1-1", title: "Nguồn gốc của triết học",      slug: "nguon-goc-triet-hoc" },
          { id: "l1-2", title: "Khái niệm triết học",          slug: "khai-niem-triet-hoc" },
          { id: "l1-3", title: "Vấn đề cơ bản của triết học",  slug: "van-de-co-ban" },
        ],
      },
      {
        id: "ch1-s2",
        title: "Triết học Mác – Lênin",
        lessons: [
          { id: "l1-4", title: "Sự ra đời và phát triển",       slug: "su-ra-doi" },
          { id: "l1-5", title: "Đối tượng và chức năng",        slug: "doi-tuong-chuc-nang" },
          { id: "l1-6", title: "Vai trò trong đời sống xã hội", slug: "vai-tro-xa-hoi" },
        ],
      },
    ],
  },
  {
    id: "ch2",
    title: "Chương 2",
    subtitle: "Chủ nghĩa duy vật biện chứng",
    color: "from-amber-700 to-amber-900",
    sections: [
      {
        id: "ch2-s1",
        title: "Vật chất và ý thức",
        lessons: [
          { id: "l2-1", title: "Phạm trù vật chất",                 slug: "pham-tru-vat-chat" },
          { id: "l2-2", title: "Phương thức tồn tại của vật chất",  slug: "phuong-thuc-ton-tai" },
          { id: "l2-3", title: "Nguồn gốc và bản chất của ý thức",  slug: "ban-chat-y-thuc" },
          { id: "l2-4", title: "Mối quan hệ vật chất – ý thức",     slug: "quan-he-vc-yt" },
        ],
      },
      {
        id: "ch2-s2",
        title: "Phép biện chứng duy vật",
        lessons: [
          { id: "l2-5", title: "Hai nguyên lý cơ bản", slug: "hai-nguyen-ly" },
          { id: "l2-6", title: "Các cặp phạm trù",     slug: "cap-pham-tru" },
          { id: "l2-7", title: "Ba quy luật cơ bản",   slug: "ba-quy-luat" },
        ],
      },
      {
        id: "ch2-s3",
        title: "Lý luận nhận thức",
        lessons: [
          { id: "l2-8",  title: "Bản chất của nhận thức",            slug: "ban-chat-nhan-thuc" },
          { id: "l2-9",  title: "Thực tiễn và vai trò của thực tiễn", slug: "thuc-tien" },
          { id: "l2-10", title: "Chân lý",                            slug: "chan-ly" },
        ],
      },
    ],
  },
  {
    id: "ch3",
    title: "Chương 3",
    subtitle: "Chủ nghĩa duy vật lịch sử",
    color: "from-emerald-700 to-emerald-900",
    sections: [
      {
        id: "ch3-s1",
        title: "Hình thái kinh tế – xã hội",
        lessons: [
          { id: "l3-1", title: "Sản xuất vật chất",                       slug: "san-xuat-vat-chat" },
          { id: "l3-2", title: "Biện chứng LLSX – QHSX",                  slug: "llsx-qhsx" },
          { id: "l3-3", title: "Cơ sở hạ tầng & kiến trúc thượng tầng",   slug: "ha-tang-thuong-tang" },
        ],
      },
      {
        id: "ch3-s2",
        title: "Giai cấp và đấu tranh giai cấp",
        lessons: [
          { id: "l3-4", title: "Nguồn gốc giai cấp",          slug: "nguon-goc-giai-cap" },
          { id: "l3-5", title: "Đấu tranh giai cấp",          slug: "dau-tranh-giai-cap" },
          { id: "l3-6", title: "Nhà nước và cách mạng xã hội", slug: "nha-nuoc-cach-mang" },
        ],
      },
      {
        id: "ch3-s3",
        title: "Con người và vai trò của quần chúng",
        lessons: [
          { id: "l3-7", title: "Bản chất con người",   slug: "ban-chat-con-nguoi" },
          { id: "l3-8", title: "Quần chúng và lãnh tụ", slug: "quan-chung-lanh-tu" },
        ],
      },
    ],
  },
];

// Helper tính tổng số đề mục và bài học của một chương
export const countSections = (chapter) => chapter.sections.length;
export const countLessons  = (chapter) =>
  chapter.sections.reduce((total, section) => total + section.lessons.length, 0);

// Danh sách phẳng tất cả bài học kèm ngữ cảnh chương/đề mục
// Dùng để tra cứu nhanh tiêu đề bài học từ slug trong trang Lesson
export const ALL_LESSONS = MINDMAP_CHAPTERS.flatMap((chapter) =>
  chapter.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({
      ...lesson,
      chapterTitle: chapter.title,
      chapterSubtitle: chapter.subtitle,
      sectionTitle: section.title,
    }))
  )
);

// Tra cứu 1 bài học theo slug; trả về null nếu không tồn tại
export const findLessonBySlug = (slug) =>
  ALL_LESSONS.find((lesson) => lesson.slug === slug) || null;
