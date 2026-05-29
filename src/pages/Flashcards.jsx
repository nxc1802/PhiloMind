import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageShell, { PageHero, StartDailyLessonButton } from "../components/PageShell";

// Danh sach chuong flashcard — mau bia + thong ke tien do
const FLASHCARD_CHAPTERS = [
  {
    id: 1,
    icon: "menu_book",
    chapter: "CHƯƠNG 1",
    title: "Nhập môn Triết học",
    desc: "Tổng quan về lịch sử, đối tượng và chức năng của triết học.",
    cardCount: 45,
    progress: 80,
  },
  {
    id: 2,
    icon: "psychology",
    chapter: "CHƯƠNG 2",
    title: "Chủ nghĩa Duy vật Biện chứng",
    desc: "Tìm hiểu về vật chất, ý thức và mối quan hệ giữa chúng.",
    cardCount: 62,
    progress: 45,
  },
  {
    id: 3,
    icon: "account_tree",
    chapter: "CHƯƠNG 3",
    title: "Phép Biện chứng Duy vật",
    desc: "Các quy luật và phạm trù cơ bản của phép biện chứng.",
    cardCount: 58,
    progress: 12,
  },
  {
    id: 4,
    icon: "gavel",
    chapter: "CHƯƠNG 4",
    title: "Học thuyết Giá trị Thặng dư",
    desc: "Phân tích bản chất bóc lột của phương thức sản xuất TBCN.",
    cardCount: 40,
    progress: 0,
  },
  {
    id: 5,
    icon: "groups",
    chapter: "CHƯƠNG 5",
    title: "Chủ nghĩa Duy vật Lịch sử",
    desc: "Học thuyết về hình thái kinh tế - xã hội và vai trò quần chúng.",
    cardCount: 72,
    progress: 95,
  },
];

const Flashcards = () => {
  // Modal goi y — phim 2 bat, Escape tat
  const [showHint, setShowHint] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Loc chuong theo tu khoa (case-insensitive)
  const visibleChapters = searchKeyword.trim()
    ? FLASHCARD_CHAPTERS.filter((ch) =>
        ch.title.toLowerCase().includes(searchKeyword.toLowerCase().trim())
      )
    : FLASHCARD_CHAPTERS;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "2") setShowHint(true);
      else if (e.key === "Escape") setShowHint(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PageShell activeKey="flashcards" footer={StartDailyLessonButton}>
      <PageHero
        eyebrow="Bộ thẻ ghi nhớ"
        icon="cards"
        title="Chọn Chương Học – Trò chơi Lật thẻ"
        subtitle="Học qua trò chơi ghép cặp (Shinkei-suijaku): tìm và nối khái niệm với mô tả tương ứng để ghi nhớ chủ động và hiệu quả hơn."
      >
        <div className="relative max-w-xl">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm chương học..."
            className="w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent outline-none backdrop-blur-sm"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
            search
          </span>
        </div>
      </PageHero>

      <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        <h2 className="font-bold text-3xl text-gray-900 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-800">
            auto_stories
          </span>
          Active Chapters
        </h2>

        {visibleChapters.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 mb-10">
            <span className="material-symbols-outlined text-5xl text-gray-300">
              search_off
            </span>
            <p className="text-gray-500 mt-2">
              Không tìm thấy chương nào khớp với "{searchKeyword}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {visibleChapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/flashcards/${chapter.id}`}
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:-translate-y-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-red-50 text-red-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">
                    {chapter.icon}
                  </span>
                </div>
                <span className="text-xs font-bold uppercase text-gray-500">
                  {chapter.chapter}
                </span>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {chapter.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                {chapter.desc}
              </p>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">
                    {chapter.cardCount} Flashcards
                  </span>
                  <span className="text-red-800 font-bold">
                    {chapter.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-800 h-2 rounded-full transition-all"
                    style={{ width: `${chapter.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}

          {/* Create custom set */}
          <button
            type="button"
            className="bg-blue-50 border-2 border-dashed border-blue-200 text-gray-700 p-5 rounded-xl hover:border-red-800 hover:bg-red-50 hover:text-red-800 transition-all flex flex-col items-center justify-center gap-3 min-h-[220px]"
          >
            <span className="material-symbols-outlined text-5xl">add_circle</span>
            <h3 className="font-bold text-lg text-center">
              Tạo Bộ Flashcard Riêng
            </h3>
            <p className="text-sm text-center opacity-80">
              Xây dựng hệ thống ghi nhớ theo phương pháp cá nhân hoá.
            </p>
          </button>
        </div>

        {/* Quote footer */}
        <div className="bg-blue-50 p-8 rounded-xl shadow-md border-l-4 border-red-800 relative">
          <span className="material-symbols-outlined absolute right-6 top-6 text-red-800/10 text-6xl select-none">
            format_quote
          </span>
          <div className="relative">
            <p className="italic text-xl text-gray-900 mb-4 leading-relaxed">
              "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách
              khác nhau, song vấn đề là cải tạo thế giới."
            </p>
            <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
              — Karl Marx, Luận cương về Feuerbach
            </span>
          </div>
        </div>
      </div>

      {/* Modal goi y AI — bat boi phim 2 */}
      {showHint && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHint(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-800 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold">Dialectic AI Assistant</h3>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setShowHint(false)}
                className="text-white/80 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Hãy tưởng tượng "Vật chất" là sân khấu, còn "Cảm giác" là khán
                giả. Dù khán giả có tồn tại hay không, sân khấu vẫn tồn tại
                khách quan.
              </p>
              <div className="bg-red-50 border-l-4 border-red-800 p-4 rounded-r-lg">
                <strong className="text-red-800">Key Mnemonic:</strong>
                <p className="mt-1 text-gray-800">
                  "Khách quan – Độc lập – Phản ánh"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Flashcards;
