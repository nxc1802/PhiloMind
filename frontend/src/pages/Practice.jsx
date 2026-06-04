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

  // Fetch course journey to get real chapters
  const { data: journeyData, isLoading: loadingChapters } = useJourney(user);
  const dbJourney = useMemo(() => journeyData?.journey || [], [journeyData]);

  // Fetch general quizzes
  const { data: generalQuizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: queryKeys.quizzes.list(null),
    queryFn: async () => {
      const res = await api.quizzes.list();
      return (res || []).filter(q => !q.nodeId);
    },
    staleTime: 1000 * 60 * 10, // General quizzes change rarely
  });
  const generalQuizzes = generalQuizzesData || [];

  // Fetch due cards
  const { data: dueCardsData, isLoading: loadingDue } = useQuery({
    queryKey: queryKeys.flashcards.due(user?.id),
    queryFn: () => api.flashcards.getDue(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time for due cards
  });
  const dueCards = dueCardsData || [];

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
        ? `Khái niệm biện chứng: ${allTitles.slice(0, 3).join(", ")}${allTitles.length > 3 ? "..." : ""}`
        : "Nội dung lý luận và phương pháp luận triết học.";

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

  // Mutation for submitting spaced repetition review
  const submitReviewMutation = useSubmitReviewMutation();

  // Handle Spaced Repetition Review Submission
  const handleReviewEase = async (ease) => {
    if (!user || dueCards.length === 0) return;
    const card = dueCards[currentReviewIndex];
    
    submitReviewMutation.mutate(
      { userId: user.id, flashcardId: card.id, ease },
      {
        onSuccess: () => {
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
          }
        },
        onError: (err) => {
          showToast("Gửi đánh giá thất bại: " + err.message, "error");
        }
      }
    );
  };


  // Filter chapters for game
  const visibleChapters = searchKeyword.trim()
    ? dbChapters.filter((ch) =>
        ch.title.toLowerCase().includes(searchKeyword.toLowerCase().trim())
      )
    : dbChapters;

  const activeReviewCard = dueCards[currentReviewIndex];

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Tự luyện kiến thức"
        icon="fitness_center"
        title="Practice Arena"
        subtitle=""
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
              <span className="material-symbols-outlined text-red-800">schedule</span>
              Thẻ nhớ học tập (Spaced Repetition)
            </h2>

            {loadingDue ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-red-800 text-3xl">sync</span>
                <span className="ml-2 text-gray-500 font-semibold">Đang tải thẻ ôn tập...</span>
              </div>
            ) : isReviewMode && activeReviewCard ? (
              <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-lg max-w-2xl mx-auto text-center">
                <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                  <span className="bg-red-50 text-red-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
                    Thẻ đến hạn: {activeReviewCard.tag || "Ôn tập"}
                  </span>
                  <span>
                    Thẻ thứ {currentReviewIndex + 1} / {dueCards.length}
                  </span>
                </div>

                {/* Flipping card */}
                <div className="w-full h-64 relative mb-6" style={{ perspective: "1000px" }}>
                  <div
                    className="w-full h-full duration-500 absolute transition-transform"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-red-800 to-red-950 text-white rounded-2xl p-6 flex flex-col justify-center items-center shadow-md"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="text-xs uppercase opacity-75 tracking-wider mb-3">Câu hỏi / Thuật ngữ</span>
                      <p className="text-xl font-bold leading-relaxed">{activeReviewCard.question}</p>
                    </div>

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
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-600">Đánh giá khả năng ghi nhớ của đồng chí:</p>
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
              <div className="bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-red-800 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <span className="material-symbols-outlined text-3xl">auto_stories</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Thẻ nhớ đến hạn hôm nay!</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Đồng chí có <strong className="text-red-800 font-bold">{dueCards.length} thẻ</strong> đến hạn cần kiểm tra lại để củng cố trí nhớ dài hạn.
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
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
                <h3 className="font-bold text-green-800 mt-2 text-lg">Đồng chí đã ôn tập xong tất cả!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Không còn thẻ nhớ nào đến hạn hôm nay. Hãy lựa chọn các chế độ thực hành khác để tiếp tục.
                </p>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SHINKEI - TRÒ CHƠI GHÉP CẶP CHƯƠNG */}
        {activeTab === "shinkei" && (
          <section className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-800">extension</span>
                  Trò chơi ghép cặp (Shinkei-suijaku)
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">Tìm và ghép các khái niệm triết học với định nghĩa tương ứng theo từng chương học.</p>
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
                        <span className="text-gray-500">{chapter.cardCount} Flashcards</span>
                        <span className="text-red-800">{chapter.progress}% Hoàn thành</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-red-800 h-1.5 rounded-full transition-all"
                          style={{ width: `${chapter.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: QUIZ TỔNG HỢP */}
        {activeTab === "quiz" && (
          <section className="space-y-6 text-left">
            <div>
              <h2 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-800">quiz</span>
                Ngân hàng đề thi & Quiz tổng hợp
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">Hệ thống bài kiểm tra chuyên sâu, đề kiểm tra kết thúc chuyên đề học thuật.</p>
            </div>

            {loadingQuizzes ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-red-800">sync</span>
                <p className="text-gray-500 mt-2 font-semibold">Đang chuẩn bị đề thi...</p>
              </div>
            ) : generalQuizzes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">quiz</span>
                <h3 className="font-bold text-gray-800 text-base mb-1">Chưa có bài thi tổng hợp nào</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Hiện chưa có bộ câu hỏi kiểm tra tổng hợp chung nào được thiết lập trên hệ thống. Đang chờ Ban quản lý cập nhật ngân hàng đề.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generalQuizzes.map((quiz) => {
                  let path = "/quiz/mcq";
                  if (quiz.type === "matching") path = "/quiz/matching";
                  else if (quiz.type === "essay") path = "/quiz/essay";
                  else if (quiz.type === "analysis") path = "/quiz/analysis";
                  else if (quiz.type === "image") path = "/image-quiz"; // Keep route matching App.js

                  return (
                    <div
                      key={quiz.id}
                      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between hover:border-red-800/40 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-extrabold uppercase bg-red-50 text-red-800 px-2.5 py-1 rounded-full tracking-wider">
                            {quiz.type === "mcq" ? "Trắc nghiệm" : quiz.type === "matching" ? "Ghép cặp" : quiz.type === "essay" ? "Tự luận" : "Phân tích"}
                          </span>
                          <span className="text-2xs text-gray-400 font-mono">
                            {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 leading-snug">{quiz.title}</h3>
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                          {quiz.description || "Bài thi trắc nghiệm học thuật độc lập do Ban giảng huấn biên soạn để tự đánh giá kiến thức."}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-2xs text-gray-400 font-bold">
                          Số câu hỏi: {Array.isArray(quiz.questions) ? quiz.questions.length : "Nhiều câu"}
                        </span>
                        <Link
                          to={`${path}/${quiz.id}`}
                          className="bg-red-800 hover:bg-red-950 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all inline-flex items-center gap-1"
                        >
                          Làm bài ngay <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </PageShell>
  );
}
