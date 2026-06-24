import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { api } from "../services/api";
import { useToast } from "../components/Toast";

export default function MCQQuiz() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gameplay states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: chosenOptionIndex }

  useEffect(() => {
    if (!id) return;
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await api.quizzes.get(id);
        setQuiz(res);
      } catch (err) {
        console.error("Failed to load quiz detail:", err);
        showToast("Lỗi tải đề trắc nghiệm: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, showToast]);

  const isChapterQuiz = quiz && quiz.nodeId !== null;

  const handleOptionClick = (idx) => {
    if (isChapterQuiz && isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    const currentQuestion = quiz.questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    setIsAnswered(true);
    setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      showToast("Chính xác! Lập luận triết học rất chuẩn xác.", "success");
    } else {
      showToast("Chưa đúng! Hãy suy nghĩ thấu đáo hơn.", "error");
    }
  };

  const handleNextQuestion = () => {
    if (!isChapterQuiz) {
      // Save answer and update score immediately (without showing it to user yet)
      const currentQuestion = quiz.questions[currentIndex];
      if (selectedOption === currentQuestion.correctIndex) {
        setScore(prev => prev + 1);
      }
      setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
    }

    setSelectedOption(null);
    setIsAnswered(false);
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      showToast("Đồng chí đã hoàn thành bài kiểm tra!", "success");
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setUserAnswers({});
  };

  if (loading) {
    return (
      <PageShell activeKey="practice">
        <div className="text-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary-650 dark:text-primary-300">sync</span>
          <p className="text-gray-500 mt-4 font-semibold">Đang chuẩn bị đề thi trắc nghiệm...</p>
        </div>
      </PageShell>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <PageShell activeKey="practice">
        <div className="px-6 md:px-12 py-16 max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-gray-200 shadow-xl max-w-2xl mx-auto animate-fadeIn">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 rounded-3xl flex items-center justify-center shadow-md mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
            </div>
            <h3 className="font-bold text-gray-900 text-2xl mb-2 font-serif">Đang cập nhật</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              Nội dung câu hỏi trắc nghiệm của chương này hiện đang được hoàn thiện. Vui lòng quay lại sau!
            </p>
            <Link
              to="/practice"
              className="inline-block mt-8 bg-primary-600 text-white px-8 py-3 rounded-3xl font-bold hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
            >
              ← Quay lại trang thực hành
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progressPercent = Math.round((currentIndex / quiz.questions.length) * 100);

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow={isChapterQuiz ? "Tự luyện trắc nghiệm chương" : "Đề thi thử học thuật"}
        icon="quiz"
        title={quiz.title}
        subtitle=""
      />

      <div className="px-6 md:px-12 py-10 max-w-4xl mx-auto text-left">
        {!isFinished ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Status bar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold">
                Câu hỏi {currentIndex + 1} / {quiz.questions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Tiến trình:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 space-y-6">
              <h3 className="font-bold text-xl text-gray-900 leading-relaxed font-serif">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  
                  let optionClass = "border-gray-200 hover:border-primary-800 hover:bg-primary-50/20 dark:bg-primary-900/10";
                  if (isChapterQuiz && isAnswered) {
                    if (isCorrect) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                    } else if (isSelected) {
                      optionClass = "border-rose-500 bg-rose-50 text-rose-800";
                    } else {
                      optionClass = "border-gray-200 opacity-60";
                    }
                  } else if (isSelected) {
                    optionClass = "border-primary-800 bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 font-bold ring-2 ring-primary-600";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isChapterQuiz && isAnswered}
                      className={`w-full text-left p-4 rounded-3xl border-2 transition-all flex items-start gap-3 text-sm md:text-base ${optionClass}`}
                    >
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isChapterQuiz && isAnswered && isCorrect ? "bg-emerald-500 text-white" :
                        isChapterQuiz && isAnswered && isSelected ? "bg-rose-500 text-white" :
                        isSelected ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown immediately ONLY in Chapter Quiz mode) */}
              {isChapterQuiz && isAnswered && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 mt-4 animate-fadeIn">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                    Giải thích đáp án:
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed font-serif">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                {isChapterQuiz ? (
                  !isAnswered ? (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={selectedOption === null}
                      className="bg-primary-600 text-white font-bold px-8 py-3 rounded-3xl shadow-md hover:bg-primary-900 transition-colors disabled:opacity-50"
                    >
                      Xác nhận đáp án
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-primary-600 text-white font-bold px-8 py-3 rounded-3xl shadow-md hover:bg-primary-900 transition-colors"
                    >
                      {currentIndex < quiz.questions.length - 1 ? "Câu tiếp theo →" : "Xem kết quả"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null}
                    className="bg-primary-600 text-white font-bold px-8 py-3 rounded-3xl shadow-md hover:bg-primary-900 transition-colors disabled:opacity-50"
                  >
                    {currentIndex < quiz.questions.length - 1 ? "Câu tiếp theo →" : "Xem kết quả"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Victory Score Board */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 text-center space-y-6 max-w-xl mx-auto">
              <span className="material-symbols-outlined text-7xl text-amber-500 animate-bounce">emoji_events</span>
              <h2 className="text-3xl font-extrabold text-gray-900">Kết quả bài làm</h2>
              <p className="text-gray-500 text-sm">
                Đồng chí đã trả lời chính xác <strong className="text-primary-800 dark:text-primary-250 text-lg">{score}</strong> trên tổng số <strong className="text-gray-800 text-lg">{quiz.questions.length}</strong> câu hỏi.
              </p>

              <div className="bg-slate-50 dark:bg-[#001F28] border border-gray-200 rounded-3xl p-5 max-w-xs mx-auto">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Tỷ lệ chính xác</span>
                <h4 className="text-3xl font-black text-primary-800 dark:text-primary-250">{Math.round((score / quiz.questions.length) * 100)}%</h4>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/practice"
                  className="border-2 border-primary-800 text-primary-650 dark:text-primary-300 font-bold px-5 py-2.5 rounded-3xl hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors text-sm"
                >
                  Trở lại Thư viện
                </Link>
                <button
                  onClick={restartQuiz}
                  className="bg-primary-600 hover:bg-primary-900 text-white font-bold px-5 py-2.5 rounded-3xl shadow-md transition-all text-sm"
                >
                  Làm lại bài
                </button>
              </div>
            </div>

            {/* Detailed Questions Review for Mock Exam (Thi thử) */}
            {!isChapterQuiz && (
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-xl text-gray-900 border-l-4 border-primary-800 pl-3 mb-6">
                  Chi tiết bài thi thử & Giải thích học thuật
                </h3>
                <div className="space-y-6">
                  {quiz.questions.map((q, qIdx) => {
                    const chosenIdx = userAnswers[qIdx];
                    const isCorrect = chosenIdx === q.correctIndex;

                    return (
                      <div key={qIdx} className="bg-white dark:bg-[#002b37] rounded-3xl border border-slate-200 dark:border-primary-850 p-6 md:p-8 shadow-sm space-y-4 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800 dark:text-red-300"
                          }`}>
                            {qIdx + 1}
                          </span>
                          <h4 className="font-bold text-lg text-gray-900 font-serif leading-relaxed">
                            {q.question}
                          </h4>
                        </div>

                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelectedOpt = chosenIdx === optIdx;
                            const isCorrectOpt = optIdx === q.correctIndex;

                            let optStyle = "border-gray-100 bg-gray-50/50 text-gray-600 opacity-80";
                            if (isSelectedOpt) {
                              optStyle = isCorrectOpt
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                                : "border-rose-500 bg-rose-50 text-rose-800 font-semibold";
                            } else if (isCorrectOpt) {
                              optStyle = "border-emerald-500 bg-emerald-50/30 text-emerald-900 font-semibold";
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-3.5 rounded-3xl border-2 flex items-start gap-3 text-sm md:text-base ${optStyle}`}
                              >
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelectedOpt && isCorrectOpt ? "bg-emerald-500 text-white" :
                                  isSelectedOpt && !isCorrectOpt ? "bg-rose-500 text-white" :
                                  isCorrectOpt ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="leading-snug">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 mt-2">
                          <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-1 text-sm">
                            <span className="material-symbols-outlined text-base">lightbulb</span>
                            Đọc thêm & Giải thích lý luận:
                          </p>
                          <p className="text-xs md:text-sm text-gray-800 leading-relaxed font-serif">{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
