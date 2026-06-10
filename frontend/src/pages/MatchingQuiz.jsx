import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { api } from "../services/api";
import { useToast } from "../components/Toast";
import "./MatchingQuiz.css";



export default function MatchingQuiz() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Game States
  const [currentGame, setCurrentGame] = useState(null);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState({}); // { leftId: rightId }
  const [errors, setErrors] = useState({}); // { id: true } to trigger shake
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Load quizzes
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (id) {
        const quiz = await api.quizzes.get(id);
        setCurrentGame(quiz);
        setQuizzes([quiz]);
      } else {
        const res = await api.quizzes.list();
        const matchingQuizzes = (res || []).filter(q => q.type === 'matching');
        setQuizzes(matchingQuizzes);
        if (matchingQuizzes.length > 0) {
          setCurrentGame(matchingQuizzes[0]);
        }
      }
    } catch (err) {
      console.error("Error loading matching quizzes:", err);
      showToast("Không thể tải danh sách trò chơi ghép cặp từ CSDL. Sử dụng dữ liệu dự phòng.", "warning");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Shuffler helper
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startGame = (game = null) => {
    const activeGame = game || currentGame;
    if (!activeGame || !Array.isArray(activeGame.questions) || activeGame.questions.length === 0) {
      showToast("Không có câu hỏi ghép cặp cho trò chơi này.", "warning");
      return;
    }
    const pairs = activeGame.questions;

    // Format pairs for layout
    const formattedLeft = pairs.map((p, i) => ({ id: `left-${i}`, text: p.left, matchIndex: i }));
    const formattedRight = pairs.map((p, i) => ({ id: `right-${i}`, text: p.right, matchIndex: i }));

    setLeftItems(shuffleArray(formattedLeft));
    setRightItems(shuffleArray(formattedRight));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs({});
    setErrors({});
    setScore(0);
    setTimeElapsed(0);
    setIsPlaying(true);
    setIsGameOver(false);
  };

  // Timer Effect
  useEffect(() => {
    let timer;
    if (isPlaying && !isGameOver) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver]);

  // Check matching logic
  const handleSelectLeft = (item) => {
    if (matchedPairs[item.id]) return; // already matched
    setSelectedLeft(item);

    // If right was already selected, check match
    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  const handleSelectRight = (item) => {
    // Check if already matched
    const isMatched = Object.values(matchedPairs).includes(item.id);
    if (isMatched) return;
    setSelectedRight(item);

    // If left was already selected, check match
    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  const checkMatch = (left, right) => {
    if (left.matchIndex === right.matchIndex) {
      // Correct Match!
      const newMatched = { ...matchedPairs, [left.id]: right.id };
      setMatchedPairs(newMatched);
      setScore(prev => prev + 20);
      setSelectedLeft(null);
      setSelectedRight(null);
      showToast("Khớp nối biện chứng chính xác!", "success");

      // Verify victory condition
      const totalPairs = leftItems.length;
      if (Object.keys(newMatched).length === totalPairs) {
        setTimeout(() => {
          setIsGameOver(true);
          showToast("Xuất sắc! Bạn đã kết nối tất cả khái niệm triết học!", "success");
        }, 600);
      }
    } else {
      // Incorrect Match!
      setErrors({ [left.id]: true, [right.id]: true });
      showToast("Định nghĩa chưa tương thích. Hãy thử lại!", "error");
      setScore(prev => Math.max(0, prev - 5));

      setTimeout(() => {
        setErrors({});
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 5000);
    }
  };

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Thử thách Trí tuệ"
        icon="extension"
        title="Thử thách Kết nối Triết học"
        subtitle="Rèn luyện tư duy duy vật biện chứng bằng cách ghép cặp chính xác các khái niệm triết học cốt lõi với định nghĩa chuẩn khoa học học thuật."
      />

      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
            <p className="text-gray-500 mt-4 font-semibold">Đang chuẩn bị đấu trường ghép cặp...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 max-w-xl mx-auto">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">layers_clear</span>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Chưa có Thử thách Ghép cặp nào</h3>
            <p className="text-gray-500 text-sm">
              Hiện tại hệ thống chưa có dữ liệu câu hỏi ghép cặp từ CSDL. Đang chờ cập nhật.
            </p>
          </div>
        ) : !isPlaying ? (
          // GAME START SCREEN
          <div className="bg-slate-900 text-white rounded-2xl p-8 border border-red-800/20 shadow-xl text-center space-y-6 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,28,28,0.1),transparent)] pointer-events-none" />
            <div className="inline-flex items-center justify-center h-16 w-16 bg-red-800/20 rounded-2xl text-red-500 border border-red-850/30 mb-2">
              <span className="material-symbols-outlined text-4xl">grid_view</span>
            </div>
            
            {quizzes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-450 font-bold block">Danh sách Trò chơi trong Hệ thống</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {quizzes.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentGame(q)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        currentGame?.id === q.id 
                          ? 'bg-red-850 text-white border-red-700 shadow-md scale-105' 
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Bản đồ {idx + 1}: {q.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
              TRÒ CHƠI GHÉP CẶP TRIẾT HỌC
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
              Nối các <strong>Khái niệm</strong> ở cột bên trái với <strong>Định nghĩa khoa học</strong> ở cột bên phải. Mỗi cặp nối đúng đem lại 20 điểm. Trả lời sai bị trừ 5 điểm!
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl py-3 px-6 text-amber-300 font-bold inline-block text-sm tracking-wide">
              ✨ Rèn Luyện Tư Duy Hệ Thống ✨
            </div>
            <div>
              <button
                type="button"
                onClick={() => startGame()}
                className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Bắt đầu Kết nối →
              </button>
            </div>
          </div>
        ) : isGameOver ? (
          // GAME OVER/VICTORY SCREEN
          <div className="bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 text-white rounded-2xl p-8 border-2 border-amber-500 shadow-2xl text-center space-y-6 max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent)] pointer-events-none" />
            <div className="animate-bounce inline-block text-6xl">🏆</div>
            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-wider">
              HOÀN THÀNH THỬ THÁCH!
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">
              Đồng chí đã hoàn tất kết nối biện chứng trong thời gian kỷ lục <strong>{timeElapsed} giây</strong>!
            </p>
            
            <div className="bg-slate-950/90 border-2 border-amber-400 rounded-2xl p-6 shadow-inner max-w-sm mx-auto">
              <span className="text-xs uppercase tracking-[0.2em] text-amber-500 font-bold block mb-1">Chứng nhận danh hiệu</span>
              <h4 className="text-xl font-black text-white tracking-wide">BẬC THẦY KẾT NỐI TRIẾT HỌC</h4>
              <div className="flex justify-between items-center mt-4 border-t border-slate-800 pt-3 text-xs text-slate-450 font-semibold font-mono">
                <span>Điểm đạt được: {score}</span>
                <span>Thời gian: {timeElapsed}s</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="border border-amber-500 text-amber-500 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors"
              >
                Trở lại Thư viện
              </button>
              <button
                type="button"
                onClick={() => startGame()}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Chơi lại lần nữa
              </button>
            </div>
          </div>
        ) : (
          // GAMEPLAY SCREEN
          <div className="space-y-6">
            {/* HUD Status Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-wrap justify-between items-center gap-4 text-left">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-red-800">Thử thách ghép cặp</span>
                <h4 className="font-extrabold text-lg text-gray-900">{currentGame?.title || "Triết học Mác - Lênin"}</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="material-symbols-outlined text-base text-red-800">timer</span>
                  <span>Thời gian: <strong>{timeElapsed}s</strong></span>
                </div>
                <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="material-symbols-outlined text-base text-amber-600">stars</span>
                  <span>Điểm: <strong className="text-amber-700 font-extrabold">{score}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlaying(false)}
                  className="text-xs font-bold text-gray-500 hover:text-red-850 underline ml-2"
                >
                  Rút lui
                </button>
              </div>
            </div>

            {/* Matching Grid Gameboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Left Column (Concepts) */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-red-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-800 text-lg">psychology</span>
                  Cột A: Khái niệm Triết học
                </h3>
                <div className="space-y-3">
                  {leftItems.map((item) => {
                    const isSelected = selectedLeft?.id === item.id;
                    const isMatched = !!matchedPairs[item.id];
                    const hasError = !!errors[item.id];

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectLeft(item)}
                        className={`matching-card transition-all relative border-2 ${
                          isMatched 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 pointer-events-none opacity-60' 
                            : hasError 
                              ? 'bg-red-50 border-red-500 text-red-800 animate-shake' 
                              : isSelected 
                                ? 'bg-red-800 text-white border-red-850 shadow-md scale-[1.01]' 
                                : 'bg-white border-gray-200 text-gray-800 hover:border-red-800 hover:-translate-y-0.5 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm md:text-base leading-relaxed select-none">{item.text}</span>
                          {isMatched && (
                            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (Definitions - with custom scrolling) */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-red-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-800 text-lg">menu_book</span>
                  Cột B: Định nghĩa / Ý nghĩa khoa học
                </h3>
                <div className="space-y-3">
                  {rightItems.map((item) => {
                    const isSelected = selectedRight?.id === item.id;
                    const isMatched = Object.values(matchedPairs).includes(item.id);
                    const hasError = !!errors[item.id];

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectRight(item)}
                        // CRITICAL: Max height and overflow-y-auto to guarantee scrolling for long descriptions, resolving out of box!
                        className={`matching-card transition-all border-2 max-h-[140px] overflow-y-auto select-none ${
                          isMatched 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 pointer-events-none opacity-60' 
                            : hasError 
                              ? 'bg-red-50 border-red-500 text-red-800 animate-shake' 
                              : isSelected 
                                ? 'bg-red-800 text-white border-red-850 shadow-md' 
                                : 'bg-white border-gray-200 text-gray-850 hover:border-red-800 hover:-translate-y-0.5 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 text-left">
                          <p className="text-xs leading-relaxed font-semibold pr-4">{item.text}</p>
                          {isMatched && (
                            <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5">check_circle</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
