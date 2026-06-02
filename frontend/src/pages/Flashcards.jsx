import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Flashcards = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showHint, setShowHint] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // States for Spaced Repetition Review Deck
  const [dueCards, setDueCards] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [loadingDue, setLoadingDue] = useState(false);

  // States for chapters list loading
  const [dbJourney, setDbJourney] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(true);

  // Fetch course journey to get real chapters
  useEffect(() => {
    if (!user) return;
    const fetchChapters = async () => {
      setLoadingChapters(true);
      try {
        const res = await api.courses.list();
        const mainCourse = res.find(c => c.title.includes('Triết học'));
        if (mainCourse) {
          const journey = await api.courses.getJourney(mainCourse.id, user.id);
          setDbJourney(journey || []);
        }
      } catch (err) {
        console.error("Failed to load course chapters:", err);
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, [user]);

  // Compute actual main chapters from dbJourney
  const dbChapters = useMemo(() => {
    if (!dbJourney || dbJourney.length === 0) return [];
    
    const mainChapters = dbJourney.filter(chap => !chap.parentChapterId);
    const icons = ["menu_book", "psychology", "account_tree", "auto_stories", "explore"];
    
    return mainChapters.map((chap, idx) => {
      // Sum direct nodes and sub-chapters
      let cardCount = 0;
      (chap.nodes || []).forEach(n => {
        cardCount += (n._count && n._count.flashcards) || 0;
      });
      dbJourney.filter(sub => sub.parentChapterId === chap.id).forEach(sub => {
        (sub.nodes || []).forEach(n => {
          cardCount += (n._count && n._count.flashcards) || 0;
        });
      });

      // Calculate progress
      let completedNodes = 0;
      let totalNodes = 0;
      const countNodeProgress = (node) => {
        totalNodes++;
        if (node.progress && node.progress[0]?.status === 'completed') {
          completedNodes++;
        }
      };
      (chap.nodes || []).forEach(countNodeProgress);
      dbJourney.filter(sub => sub.parentChapterId === chap.id).forEach(sub => {
        (sub.nodes || []).forEach(countNodeProgress);
      });
      const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

      // Build node descriptions
      const directNodeTitles = (chap.nodes || []).map(n => n.title);
      const subNodeTitles = dbJourney
        .filter(sub => sub.parentChapterId === chap.id)
        .flatMap(sub => (sub.nodes || []).map(n => n.title));
      const allTitles = [...directNodeTitles, ...subNodeTitles];
      const desc = allTitles.length > 0 
        ? `Nghiên cứu khái niệm: ${allTitles.slice(0, 3).join(", ")}${allTitles.length > 3 ? "..." : ""}`
        : "Tìm hiểu chuyên sâu nội dung kiến thức lý luận học thuật.";

      return {
        id: chap.id,
        icon: icons[idx % icons.length],
        chapter: `CHƯƠNG ${idx + 1}`,
        title: chap.title,
        desc: desc,
        cardCount: cardCount,
        progress: progress
      };
    });
  }, [dbJourney]);

  // Fetch due cards on mount / user change
  const fetchDueCards = useCallback(async () => {
    if (!user) return;
    setLoadingDue(true);
    try {
      const res = await api.flashcards.getDue(user.id);
      setDueCards(res || []);
    } catch (err) {
      console.error("Error fetching due flashcards:", err);
    } finally {
      setLoadingDue(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  // Handle hotkey '2' and 'Escape'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "2") setShowHint(true);
      else if (e.key === "Escape") setShowHint(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter chapters for game
  const visibleChapters = searchKeyword.trim()
    ? dbChapters.filter((ch) =>
        ch.title.toLowerCase().includes(searchKeyword.toLowerCase().trim())
      )
    : dbChapters;

  // Handle Spaced Repetition Review Submission
  const handleReviewEase = async (ease) => {
    if (!user || dueCards.length === 0) return;
    const card = dueCards[currentReviewIndex];
    
    try {
      await api.flashcards.submitReview(user.id, card.id, ease);
      showToast("Đã ghi nhận phản hồi và cập nhật lịch ôn tập!", "success");
      
      setIsFlipped(false);
      // Move to next card
      if (currentReviewIndex < dueCards.length - 1) {
        setCurrentReviewIndex(prev => prev + 1);
      } else {
        // Finished all cards!
        showToast("Tuyệt vời! Bạn đã hoàn thành tất cả các thẻ ôn tập hôm nay.", "success");
        setIsReviewMode(false);
        setCurrentReviewIndex(0);
        // Refresh due list
        fetchDueCards();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast("Gửi đánh giá thất bại: " + err.message, "error");
    }
  };

  const activeReviewCard = dueCards[currentReviewIndex];

  return (
    <PageShell activeKey="flashcards">
      <PageHero
        eyebrow="Thẻ nhớ học thuật"
        icon="cards"
        title="Spaced Repetition & Trò chơi Lật thẻ"
        subtitle="Hệ thống học chủ động: ôn tập thẻ đến hạn (SM-2 Algorithm) lưu trực tiếp vào cơ sở dữ liệu để củng cố chuỗi streak và rèn luyện ghép cặp ghi nhớ."
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
        {/* ============================================================
           SPACED REPETITION REVIEW DECK
           ============================================================ */}
        {user && (
          <section className="mb-12">
            <h2 className="font-bold text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-800">
                schedule
              </span>
              Spaced Repetition Deck
            </h2>

            {loadingDue ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-red-800 text-3xl">sync</span>
                <span className="ml-2 text-gray-500 font-semibold">Đang tải thẻ ghi nhớ đến hạn...</span>
              </div>
            ) : isReviewMode && activeReviewCard ? (
              // ACTIVE REVIEW VIEW
              <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-lg max-w-2xl mx-auto text-center">
                <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                  <span className="bg-red-50 text-red-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
                    Thẻ đến hạn: {activeReviewCard.tag || "Ôn tập"}
                  </span>
                  <span>
                    Thẻ thứ {currentReviewIndex + 1} / {dueCards.length}
                  </span>
                </div>

                {/* 3D Flipping Card */}
                <div className="w-full h-64 relative mb-6" style={{ perspective: "1000px" }}>
                  <div
                    className="w-full h-full duration-500 absolute transition-transform"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    {/* Front: Question */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-red-800 to-red-950 text-white rounded-2xl p-6 flex flex-col justify-center items-center shadow-md"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="text-xs uppercase opacity-75 tracking-wider mb-3">Câu hỏi / Thuật ngữ</span>
                      <p className="text-xl font-bold leading-relaxed">{activeReviewCard.question}</p>
                    </div>

                    {/* Back: Answer */}
                    <div
                      className="absolute inset-0 bg-blue-50 border-2 border-red-800 text-gray-900 rounded-2xl p-6 flex flex-col justify-center items-center shadow-md"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <span className="text-xs uppercase text-red-800 font-bold tracking-wider mb-3">Giải nghĩa / Đáp án</span>
                      <p className="text-lg font-semibold leading-relaxed text-gray-800">{activeReviewCard.answer}</p>
                    </div>
                  </div>
                </div>

                {!isFlipped ? (
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="bg-red-800 hover:bg-red-950 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all inline-flex items-center gap-2 mb-4"
                  >
                    <span className="material-symbols-outlined">flip</span>
                    Lật thẻ xem đáp án
                  </button>
                ) : (
                  // SM-2 Rating buttons
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-600">Mức độ ghi nhớ của bạn thế nào?</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
                      <button
                        onClick={() => handleReviewEase(1)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        🔴 Again (Học lại)
                      </button>
                      <button
                        onClick={() => handleReviewEase(2)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        🟡 Hard (Khó)
                      </button>
                      <button
                        onClick={() => handleReviewEase(3)}
                        className="bg-green-50 hover:bg-green-100 text-green-800 border-2 border-green-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        🟢 Good (Tốt)
                      </button>
                      <button
                        onClick={() => handleReviewEase(4)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-2 border-blue-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        🔵 Easy (Dễ)
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-gray-100 pt-4 text-center">
                  <button
                    onClick={() => {
                      setIsReviewMode(false);
                      setIsFlipped(false);
                    }}
                    className="text-gray-500 hover:text-red-800 text-xs font-semibold underline"
                  >
                    Tạm dừng ôn tập
                  </button>
                </div>
              </div>
            ) : dueCards.length > 0 ? (
              // DECK AVAILABLE PROMPT
              <div className="bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-red-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-3xl">auto_stories</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Thẻ nhớ đến hạn ôn tập hôm nay!</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Đồng chí có <strong className="text-red-800 font-bold">{dueCards.length} thẻ</strong> cần ôn tập lại bằng phương pháp lặp lại ngắt quãng.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsReviewMode(true);
                    setCurrentReviewIndex(0);
                  }}
                  className="bg-red-800 hover:bg-red-950 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all shrink-0 w-full sm:w-auto"
                >
                  Bắt đầu ôn tập →
                </button>
              </div>
            ) : (
              // ALL CLEAR VIEW
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
                <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
                <h3 className="font-bold text-green-800 mt-2 text-lg">Đồng chí đã ôn tập xong tất cả!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Không còn thẻ nhớ nào đến hạn hôm nay. Tiếp tục tham gia học tập sơ đồ hoặc game ghép cặp bên dưới!
                </p>
              </div>
            )}
          </section>
        )}

        {/* ============================================================
           GAME GHÉP CẶP CỔ ĐIỂN
           ============================================================ */}
        <h2 className="font-bold text-3xl text-gray-900 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-800">
            extension
          </span>
          Trò chơi ghép cặp (Shinkei-suijaku)
        </h2>

        {loadingChapters ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-red-800">sync</span>
            <p className="text-gray-500 mt-2 font-semibold">Đang tải chương học...</p>
          </div>
        ) : dbChapters.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 mb-10">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              layers_clear
            </span>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Chưa có dữ liệu trò chơi</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Không tìm thấy chương học hoặc thẻ nhớ nào trong cơ sở dữ liệu thực tế. Ban quản trị đang cập nhật nội dung.
            </p>
          </div>
        ) : visibleChapters.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 mb-10">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              search_off
            </span>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Không tìm thấy kết quả</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Không tìm thấy chương nào khớp với từ khóa "{searchKeyword}".
            </p>
          </div>
        ) : (
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
          </div>
        )}

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

      {/* Modal goi y AI */}
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
