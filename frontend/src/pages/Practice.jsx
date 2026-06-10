import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useQuery } from "@tanstack/react-query";
import { useJourney } from "../hooks/useJourney";
import { useSubmitReviewMutation } from "../hooks/useMutations";
import { queryKeys } from "../services/queryKeys";

export default function Practice() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("flashcard"); // 'flashcard' | 'shinkei' | 'quiz'
  const [searchKeyword, setSearchKeyword] = useState("");

  // States for Spaced Repetition Review Deck
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewCards, setReviewCards] = useState([]);
  const [reviewTitle, setReviewTitle] = useState("");

  // Fetch course journey to get real chapters
  const { data: journeyData, isLoading: loadingChapters } = useJourney(user);
  const dbJourney = useMemo(() => journeyData?.journey || [], [journeyData]);

  // Fetch all quizzes
  const { data: allQuizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['quizzes', 'all'],
    queryFn: async () => {
      const res = await api.quizzes.list();
      return res || [];
    },
    staleTime: 1000 * 60 * 10,
  });
  const allQuizzes = useMemo(() => allQuizzesData || [], [allQuizzesData]);

  // Fetch due cards
  const { data: dueCardsData, isLoading: loadingDue } = useQuery({
    queryKey: queryKeys.flashcards.due(user?.id),
    queryFn: () => api.flashcards.getDue(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
  const dueCards = dueCardsData || [];

  // Fetch all flashcards to compute counts per chapter
  const { data: allFlashcardsData, isLoading: loadingAllFlashcards } = useQuery({
    queryKey: ['flashcards', 'all'],
    queryFn: () => api.flashcards.list(),
    staleTime: 1000 * 60 * 5,
  });
  const allFlashcards = useMemo(() => allFlashcardsData || [], [allFlashcardsData]);

  // Compute actual main chapters from dbJourney
  const dbChapters = useMemo(() => {
    if (!dbJourney || dbJourney.length === 0) return [];
    
    const mainChapters = dbJourney.filter(chap => !chap.parentChapterId);
    const icons = ["menu_book", "psychology", "account_tree", "auto_stories", "explore"];
    
    return mainChapters.map((chap, idx) => {
      // Sum direct nodes and sub-chapters
      const nodeIds = (chap.nodes || []).map(n => n.id);
      const subNodeIds = dbJourney
        .filter(sub => sub.parentChapterId === chap.id)
        .flatMap(sub => (sub.nodes || []).map(n => n.id));
      const allNodeIdsInChapter = [...nodeIds, ...subNodeIds];

      const chapterCards = allFlashcards.filter(c => allNodeIdsInChapter.includes(c.nodeId));
      const cardCount = chapterCards.length;

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
        ? `Khái niệm biện chứng: ${allTitles.slice(0, 3).join(", ")}${allTitles.length > 3 ? "..." : ""}`
        : "Nội dung lý luận và phương pháp luận triết học.";

      return {
        id: chap.id,
        icon: icons[idx % icons.length],
        chapter: `CHƯƠNG ${idx + 1}`,
        title: chap.title,
        desc: desc,
        cardCount: cardCount,
        progress: progress,
        nodeIds: allNodeIdsInChapter
      };
    });
  }, [dbJourney, allFlashcards]);

  // Mutation for submitting spaced repetition review
  const submitReviewMutation = useSubmitReviewMutation();

  // Handle Spaced Repetition Review Submission
  const handleReviewEase = async (ease) => {
    if (reviewCards.length === 0) return;
    const card = reviewCards[currentReviewIndex];
    
    const nextCard = () => {
      setIsFlipped(false);
      // Move to next card
      if (currentReviewIndex < reviewCards.length - 1) {
        setCurrentReviewIndex(prev => prev + 1);
      } else {
        // Finished all cards!
        showToast("Tuyệt vời! Bạn đã hoàn thành tất cả các thẻ ôn tập trong phiên này.", "success");
        setIsReviewMode(false);
        setCurrentReviewIndex(0);
      }
    };

    if (!user) {
      showToast("Ghi chú: Đồng chí đang học ở chế độ Khách. Tiến trình sẽ tiếp tục nhưng lịch sử ôn tập không được lưu.", "info");
      nextCard();
      return;
    }

    submitReviewMutation.mutate(
      { userId: user.id, flashcardId: card.id, ease },
      {
        onSuccess: () => {
          showToast("Đã ghi nhận phản hồi và cập nhật lịch ôn tập!", "success");
          nextCard();
        },
        onError: (err) => {
          showToast("Ghi chú: Đã xảy ra lỗi đồng bộ (" + err.message + "), tiến trình học vẫn tiếp tục.", "warning");
          nextCard();
        }
      }
    );
  };

  // Filter chapters for game/reviews
  const visibleChapters = searchKeyword.trim()
    ? dbChapters.filter((ch) =>
        ch.title.toLowerCase().includes(searchKeyword.toLowerCase().trim())
      )
    : dbChapters;

  const startChapterReview = (chapter) => {
    const chapterCards = allFlashcards.filter(c => chapter.nodeIds.includes(c.nodeId));
    if (chapterCards.length === 0) {
      showToast("Chương học đang được cập nhật nội dung học thuật.", "warning");
      return;
    }
    setReviewCards(chapterCards);
    setReviewTitle(`Chương: ${chapter.title}`);
    setCurrentReviewIndex(0);
    setIsFlipped(false);
    setIsReviewMode(true);
  };

  const startGeneralReview = () => {
    if (dueCards.length === 0) {
      showToast("Không có thẻ ôn tập nào đến hạn hôm nay.", "info");
      return;
    }
    setReviewCards(dueCards);
    setReviewTitle("Ôn tập tổng hợp (Thẻ đến hạn)");
    setCurrentReviewIndex(0);
    setIsFlipped(false);
    setIsReviewMode(true);
  };

  const activeReviewCard = reviewCards[currentReviewIndex];

  // Partition quizzes
  const mockExams = useMemo(() => {
    return allQuizzes.filter(q => q.type === 'mcq' && !q.nodeId);
  }, [allQuizzes]);

  const getChapterQuiz = (chapter) => {
    return allQuizzes.find(q => q.type === 'mcq' && q.nodeId && chapter.nodeIds.includes(q.nodeId));
  };

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Tự luyện kiến thức"
        icon="fitness_center"
        title="Practice Arena"
        subtitle="Rèn luyện thấu đáo các khái niệm, quy luật và hệ lý luận Triết học Mác - Lênin."
      />

      <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab("flashcard")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "flashcard" ? "bg-white text-red-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🎴 Flashcard Ôn Tập
            </button>
            <button
              onClick={() => setActiveTab("shinkei")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "shinkei" ? "bg-white text-red-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🧩 Ghép Cặp (Shinkei)
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "quiz" ? "bg-white text-red-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📝 Quiz Tổng Hợp
            </button>
          </div>
        </div>

        {/* TAB 1: FLASHCARD ÔN TẬP */}
        {activeTab === "flashcard" && (
          <section className="space-y-6 text-left">
            <h2 className="font-bold text-2xl text-gray-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-800">auto_stories</span>
              Thẻ nhớ học tập (Spaced Repetition)
            </h2>

            {loadingDue || loadingAllFlashcards ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-red-800 text-3xl">sync</span>
                <span className="ml-2 text-gray-500 font-semibold">Đang tải dữ liệu thẻ...</span>
              </div>
            ) : isReviewMode && activeReviewCard ? (
              <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-2xl max-w-2xl mx-auto text-center animate-fadeIn relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                  <div 
                    className="h-full bg-red-800 transition-all duration-300"
                    style={{ width: `${((currentReviewIndex + 1) / reviewCards.length) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mb-6 text-sm text-gray-500 mt-2">
                  <span className="bg-red-55 text-red-850 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
                    {reviewTitle}
                  </span>
                  <span className="font-bold text-gray-600">
                    Thẻ thứ {currentReviewIndex + 1} / {reviewCards.length}
                  </span>
                </div>

                {/* Flipping card container */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-80 relative mb-6 cursor-pointer select-none group" 
                  style={{ perspective: "1000px" }}
                  title="Click vào thẻ để lật mặt"
                >
                  <div
                    className="w-full h-full duration-500 absolute transition-transform"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-red-800 via-red-900 to-red-950 text-white rounded-2xl p-8 flex flex-col justify-between items-center shadow-xl border border-red-700 transition-opacity duration-300 ${
                        isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                      <div className="w-full flex justify-between items-center opacity-75">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-200">Câu hỏi / Thuật ngữ</span>
                        <span className="material-symbols-outlined text-lg text-red-200">help</span>
                      </div>
                      <div className="w-full overflow-y-auto max-h-[180px] pr-1 my-auto scrollbar-thin flex flex-col justify-center items-center">
                        <p className="text-lg md:text-xl font-bold leading-relaxed font-serif text-center">{activeReviewCard.question}</p>
                      </div>
                      <div className="w-full text-center text-xs text-red-300/80 font-medium">
                        Chạm vào thẻ để lật xem đáp án
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-red-800 text-gray-900 rounded-2xl p-8 flex flex-col justify-between items-center shadow-xl transition-opacity duration-300 ${
                        isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)"
                      }}
                    >
                      <div className="w-full flex justify-between items-center border-b border-red-200/50 pb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-850">Giải nghĩa / Đáp án</span>
                        <span className="material-symbols-outlined text-lg text-red-800">menu_book</span>
                      </div>
                      <div className="w-full overflow-y-auto max-h-[180px] pr-1 my-auto scrollbar-thin text-left">
                        <p className="text-base md:text-lg font-semibold leading-relaxed text-gray-800 font-serif">{activeReviewCard.answer}</p>
                      </div>
                      <div className="w-full text-center text-xs text-red-800/60 font-semibold">
                        Chạm vào thẻ để quay lại mặt trước
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  {isFlipped ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-gray-600">Đánh giá mức độ nhớ của đồng chí:</p>
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewEase(2);
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                        >
                          🟡 Khó (Cần học lại)
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewEase(4);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                        >
                          🟢 Dễ (Đã học được)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 font-semibold py-4 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-base">touch_app</span>
                      Chạm vào thẻ để lật xem đáp án
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-150 pt-4 text-center">
                  <button
                    onClick={() => {
                      setIsReviewMode(false);
                      setIsFlipped(false);
                    }}
                    className="text-gray-500 hover:text-red-800 text-xs font-semibold underline"
                  >
                    Dừng ôn tập và quay ra ngoài
                  </button>
                </div>
              </div>
            ) : (

              <div className="space-y-8">
                {/* Tổng hợp card */}
                <div className="bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-14 w-14 bg-red-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <span className="material-symbols-outlined text-3xl">auto_stories</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Ôn tập tổng hợp</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {dueCards.length > 0 ? (
                          <>Đồng chí có <strong className="text-red-850 font-bold">{dueCards.length} thẻ</strong> đến hạn cần ôn tập hôm nay để củng cố dài hạn.</>
                        ) : (
                          "Không còn thẻ nhớ nào đến hạn hôm nay. Hãy học theo từng chương học bên dưới."
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={startGeneralReview}
                    disabled={dueCards.length === 0}
                    className="bg-red-800 hover:bg-red-950 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all shrink-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Bắt đầu ôn tập tổng hợp →
                  </button>
                </div>

                {/* Chapter list for flashcard review */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">Ôn tập theo Chương học</h3>
                    <div className="relative w-full sm:max-w-xs">
                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Tìm kiếm chương..."
                        className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-red-800 text-sm"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        search
                      </span>
                    </div>
                  </div>

                  {visibleChapters.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                      <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                      <p className="text-gray-500 text-sm">Không tìm thấy chương học nào tương thích.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {visibleChapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          onClick={() => startChapterReview(chapter)}
                          className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:border-red-800/50 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">{chapter.icon}</span>
                              </div>
                              <span className="text-xs font-bold uppercase text-gray-450">{chapter.chapter}</span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{chapter.title}</h3>
                            <p className="text-gray-600 text-xs line-clamp-3 mb-4">{chapter.desc}</p>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-150">
                            <div className="flex justify-between text-xs mb-1.5 font-semibold">
                              {chapter.cardCount > 0 ? (
                                <>
                                  <span className="text-gray-500">{chapter.cardCount} Flashcards</span>
                                  <span className="text-red-850">{chapter.progress}% Hoàn thành</span>
                                </>
                              ) : (
                                <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md">Đang cập nhật</span>
                              )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-red-800 h-1.5 rounded-full transition-all"
                                style={{ width: `${chapter.cardCount > 0 ? chapter.progress : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SHINKEI - TRÒ CHƠI GHÉP CẶP CHƯƠNG */}
        {activeTab === "shinkei" && (
          <section className="space-y-6 text-left animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-800">extension</span>
                  Trò chơi ghép cặp (Socratic Matching)
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">Nối các khái niệm ở cột bên trái với mô tả tương ứng ở cột bên phải theo từng chương học.</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm kiếm chương..."
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-800 text-sm"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
              </div>
            </div>

            {loadingChapters ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-red-800">sync</span>
                <p className="text-gray-500 mt-2 font-semibold">Đang tải chương học...</p>
              </div>
            ) : dbChapters.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">layers_clear</span>
                <p className="text-gray-500 text-sm">Chưa có dữ liệu chương học trên hệ thống.</p>
              </div>
            ) : visibleChapters.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">search_off</span>
                <p className="text-gray-500 text-sm">Không tìm thấy chương nào khớp với "{searchKeyword}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleChapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/practice/shinkei/${chapter.id}`}
                    className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:border-red-800/50 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-red-50 text-red-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">{chapter.icon}</span>
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-450">{chapter.chapter}</span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{chapter.title}</h3>
                      <p className="text-gray-600 text-xs line-clamp-3 mb-4">{chapter.desc}</p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-150">
                      <div className="flex justify-between text-xs mb-1.5 font-semibold">
                        {chapter.cardCount > 0 ? (
                          <>
                            <span className="text-gray-500">{chapter.cardCount} Flashcards</span>
                            <span className="text-red-850">{chapter.progress}% Hoàn thành</span>
                          </>
                        ) : (
                          <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md">Đang cập nhật</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-red-850 h-1.5 rounded-full transition-all"
                          style={{ width: `${chapter.cardCount > 0 ? chapter.progress : 0}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}



        {/* TAB 3: QUIZ TỔNG HỢP & MOCK EXAMS */}
        {activeTab === "quiz" && (
          <section className="space-y-8 text-left animate-fadeIn">
            <div>
              <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-800">quiz</span>
                Ngân hàng đề thi & Quiz trắc nghiệm
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">Làm quiz từng chương để xem kết quả ngay lập tức, hoặc thi thử toàn diện để tự đánh giá.</p>
            </div>

            {loadingQuizzes || loadingChapters ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-red-800">sync</span>
                <p className="text-gray-500 mt-2 font-semibold">Đang tải đề thi...</p>
              </div>
            ) : (
              <>
                {/* 1. Chapter Quizzes */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 border-l-4 border-red-800 pl-3">Trắc nghiệm theo Chương học</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dbChapters.map((chapter) => {
                      const quiz = getChapterQuiz(chapter);
                      return (
                        <div
                          key={chapter.id}
                          className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="h-10 w-10 rounded-lg bg-red-50 text-red-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">{chapter.icon}</span>
                              </div>
                              <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                Chương Quiz
                              </span>
                            </div>
                            <h3 className="font-bold text-base text-gray-900 mb-2 leading-snug">{chapter.title}</h3>
                            <p className="text-gray-500 text-xs line-clamp-3 mb-4">
                              {quiz ? "Luyện tập các câu hỏi trắc nghiệm của chương, nhận kết quả và giải thích ngay lập tức sau mỗi câu trả lời." : "Đề trắc nghiệm của chương học đang được cập nhật."}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-150 flex items-center justify-between">
                            <span className="text-2xs text-gray-400 font-bold font-mono">
                              {quiz ? `Số câu: ${quiz.questions.length}` : "Đang cập nhật"}
                            </span>
                            {quiz ? (
                              <Link
                                to={`/quiz/mcq/${quiz.id}`}
                                className="bg-red-800 hover:bg-red-950 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all inline-flex items-center gap-1"
                              >
                                Làm Quiz →
                              </Link>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-2 rounded-lg cursor-not-allowed"
                              >
                                Sắp ra mắt
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mock Exams */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-lg text-gray-900 border-l-4 border-red-800 pl-3">Đề thi thử học thuật (Mock Exams)</h3>
                  {mockExams.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300 max-w-md">
                      <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">assignment_late</span>
                      <p className="text-gray-500 text-sm">Chưa có đề thi thử tổng hợp nào được thiết lập.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockExams.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between hover:border-red-800/40 transition-all relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,28,28,0.1),transparent)] pointer-events-none" />
                          <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between">
                              <span className="text-2xs font-extrabold uppercase bg-red-850 text-red-200 px-2.5 py-1 rounded-full tracking-wider border border-red-800/35">
                                Thi thử
                              </span>
                              <span className="text-2xs text-slate-450 font-mono">
                                {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-100 leading-snug">{quiz.title}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                              {quiz.description || "Đề thi thử tổng hợp phạm vi toàn bộ chương trình, chấm điểm và giải thích sau khi hoàn thành."}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
                            <span className="text-2xs text-slate-400 font-bold">
                              Số câu hỏi: {Array.isArray(quiz.questions) ? quiz.questions.length : "Nhiều câu"}
                            </span>
                            <Link
                              to={`/quiz/mcq/${quiz.id}`}
                              className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all inline-flex items-center gap-1"
                            >
                              Làm đề thi thử <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </PageShell>
  );
}
