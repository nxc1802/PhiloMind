import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { useToast } from "../components/Toast";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const FlashcardDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [dbFlashcards, setDbFlashcards] = useState([]);
  const [chapterDetails, setChapterDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [round, setRound] = useState(0); 
  const [matchedPairs, setMatchedPairs] = useState([]); // Array of pairIds (flashcardIds)
  const [moves, setMoves] = useState(0);

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDesc, setSelectedDesc] = useState(null);
  const [mismatched, setMismatched] = useState(null); // { termId, descId }

  // Fetch dynamic flashcards and chapter title
  useEffect(() => {
    if (!user) return;
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const courses = await api.courses.list();
        const mainCourse = courses.find(c => c.title.includes("Triết học"));
        let foundChapter = null;
        if (mainCourse) {
          const journey = await api.courses.getJourney(mainCourse.id, user.id);
          foundChapter = journey.find(c => c.id === id);
          setChapterDetails(foundChapter);
        }

        // Fetch all flashcards from backend
        const allCards = await api.flashcards.list();
        // Filter cards that belong to this chapter (node.chapterId === id)
        const chapterCards = allCards.filter(card => card.node && card.node.chapterId === id);
        setDbFlashcards(chapterCards);
      } catch (err) {
        console.error("Error loading flashcard detail data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, [id, user]);

  // Convert dbFlashcards to game pairs
  const pairs = useMemo(() => {
    return dbFlashcards.map((fc, idx) => ({
      id: fc.id || `pair-${idx}`,
      term: fc.question,
      desc: fc.answer
    }));
  }, [dbFlashcards]);

  // Shuffle and set columns on load or restart
  useEffect(() => {
    if (pairs.length > 0) {
      const formattedLeft = pairs.map((p) => ({ id: `left-${p.id}`, pairId: p.id, text: p.term }));
      const formattedRight = pairs.map((p) => ({ id: `right-${p.id}`, pairId: p.id, text: p.desc }));

      const shuffle = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      setLeftItems(shuffle(formattedLeft));
      setRightItems(shuffle(formattedRight));
      setSelectedTerm(null);
      setSelectedDesc(null);
      setMismatched(null);
    }
  }, [pairs, round]);

  const totalPairs = pairs.length;
  const isWon = totalPairs > 0 && matchedPairs.length === totalPairs;

  useEffect(() => {
    if (isWon) {
      showToast(`Hoàn thành! Bạn đã ghép xong với ${moves} lượt.`, "success");
    }
  }, [isWon, moves, showToast]);

  const restartGame = () => {
    setMatchedPairs([]);
    setMoves(0);
    setSelectedTerm(null);
    setSelectedDesc(null);
    setMismatched(null);
    setRound((prev) => prev + 1);
  };

  const handleSelectTerm = (item) => {
    if (matchedPairs.includes(item.pairId) || mismatched) return;
    setSelectedTerm(item);

    if (selectedDesc) {
      const isCorrect = item.pairId === selectedDesc.pairId;
      setMoves((prev) => prev + 1);
      if (isCorrect) {
        setMatchedPairs((prev) => [...prev, item.pairId]);
        setSelectedTerm(null);
        setSelectedDesc(null);
        showToast("Ghép cặp chính xác!", "success");
      } else {
        setMismatched({ termId: item.id, descId: selectedDesc.id });
        showToast("Chưa chính xác, hãy thử lại!", "error");
        setTimeout(() => {
          setMismatched(null);
          setSelectedTerm(null);
          setSelectedDesc(null);
        }, 1000);
      }
    }
  };

  const handleSelectDesc = (item) => {
    if (matchedPairs.includes(item.pairId) || mismatched) return;
    setSelectedDesc(item);

    if (selectedTerm) {
      const isCorrect = item.pairId === selectedTerm.pairId;
      setMoves((prev) => prev + 1);
      if (isCorrect) {
        setMatchedPairs((prev) => [...prev, item.pairId]);
        setSelectedTerm(null);
        setSelectedDesc(null);
        showToast("Ghép cặp chính xác!", "success");
      } else {
        setMismatched({ termId: selectedTerm.id, descId: item.id });
        showToast("Chưa chính xác, hãy thử lại!", "error");
        setTimeout(() => {
          setMismatched(null);
          setSelectedTerm(null);
          setSelectedDesc(null);
        }, 1000);
      }
    }
  };

  if (loading) {
    return (
      <PageShell activeKey="practice">
        <div className="text-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
          <p className="text-gray-500 mt-4 font-semibold">Đang chuẩn bị trò chơi học tập...</p>
        </div>
      </PageShell>
    );
  }

  if (!chapterDetails) {
    return (
      <PageShell activeKey="practice">
        <div className="px-12 py-16 max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-7xl text-gray-300">
            search_off
          </span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Không tìm thấy chương học
          </h1>
          <Link
            to="/practice"
            className="inline-block mt-6 bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </PageShell>
    );
  }

  if (totalPairs === 0) {
    return (
      <PageShell activeKey="practice">
        <PageHero
          eyebrow="Trò chơi ghép cặp ghi nhớ"
          icon="extension"
          title={chapterDetails.title}
          subtitle="Nối các khái niệm ở cột bên trái với định nghĩa tương ứng ở cột bên phải."
        />
        <div className="px-12 py-16 max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              layers_clear
            </span>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Chưa có thẻ ghi nhớ nào</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Chương này hiện chưa có dữ liệu thẻ học thuật để bắt đầu trò chơi ghép cặp.
            </p>
            <Link
              to="/practice"
              className="inline-block mt-6 bg-red-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-900 transition-colors"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Trò chơi ghép cặp ghi nhớ"
        icon="extension"
        title={chapterDetails.title}
        subtitle="Nối các khái niệm triết học ở cột bên trái với định nghĩa khoa học tương ứng ở cột bên phải. Khi ghép đúng, thẻ sẽ đổi màu và giữ nguyên."
      />

      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto text-left">
        {/* Bảng điểm */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Số lượt ghép
              </p>
              <p className="text-2xl font-bold text-red-800">{moves}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Đã khớp
              </p>
              <p className="text-2xl font-bold text-red-800">
                {matchedPairs.length}/{totalPairs}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={restartGame}
            className="inline-flex items-center gap-2 border-2 border-red-800 text-red-800 px-5 py-2.5 rounded-lg font-bold hover:bg-red-800 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Chơi lại / Xáo bài
          </button>
        </div>

        {/* Thông báo thắng */}
        {isWon && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-6 text-center animate-fadeIn">
            <span className="material-symbols-outlined text-5xl text-green-600">
              celebration
            </span>
            <h2 className="text-2xl font-bold text-green-800 mt-2">
              Xuất sắc! Bạn đã ghép xong tất cả các cặp.
            </h2>
            <p className="text-green-700 mt-1">
              Hoàn thành trong {moves} lượt. Bấm "Chơi lại / Xáo bài" để thử thách lại!
            </p>
          </div>
        )}

        {/* Hai cột ghép cặp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cột Trái: Khái niệm */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-red-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-850 text-lg">psychology</span>
              Khái niệm Triết học
            </h3>
            <div className="space-y-3">
              {leftItems.map((item) => {
                const isMatched = matchedPairs.includes(item.pairId);
                const isSelected = selectedTerm?.id === item.id;
                const hasError = mismatched?.termId === item.id;

                let cardClass = "bg-white border-gray-200 text-gray-800 hover:border-red-400 hover:bg-red-50/50 cursor-pointer";
                if (isMatched) {
                  cardClass = "bg-emerald-50 border-emerald-500 text-emerald-800 pointer-events-none opacity-90";
                } else if (hasError) {
                  cardClass = "bg-rose-50 border-rose-500 text-rose-800 animate-shake";
                } else if (isSelected) {
                  cardClass = "bg-red-50 border-red-800 text-red-800 ring-2 ring-red-800 font-bold";
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTerm(item)}
                    disabled={isMatched}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${cardClass}`}
                  >
                    <span className="font-bold text-sm md:text-base">{item.text}</span>
                    {isMatched && (
                      <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột Phải: Định nghĩa */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-red-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-850 text-lg">menu_book</span>
              Định nghĩa / Ý nghĩa khoa học
            </h3>
            <div className="space-y-3">
              {rightItems.map((item) => {
                const isMatched = matchedPairs.includes(item.pairId);
                const isSelected = selectedDesc?.id === item.id;
                const hasError = mismatched?.descId === item.id;

                let cardClass = "bg-white border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50/50 cursor-pointer";
                if (isMatched) {
                  cardClass = "bg-emerald-50 border-emerald-500 text-emerald-800 pointer-events-none opacity-90";
                } else if (hasError) {
                  cardClass = "bg-rose-50 border-rose-500 text-rose-800 animate-shake";
                } else if (isSelected) {
                  cardClass = "bg-red-50 border-red-800 text-red-850 ring-2 ring-red-800 font-bold";
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectDesc(item)}
                    disabled={isMatched}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${cardClass}`}
                  >
                    <span className="text-xs md:text-sm leading-relaxed pr-2">{item.text}</span>
                    {isMatched && (
                      <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="mt-8 text-center">
          <Link
            to="/practice"
            className="text-sm text-gray-500 underline hover:text-red-800 font-semibold"
          >
            ← Quay lại danh sách thực hành
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default FlashcardDetail;
