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

  const handleOptionClick = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    const currentQuestion = quiz.questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    setIsAnswered(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
      showToast("Chính xác! Lập luận triết học rất chuẩn xác.", "success");
    } else {
      showToast("Chưa đúng! Hãy suy nghĩ thấu đáo hơn.", "error");
    }
  };

  const handleNextQuestion = () => {
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
  };

  if (loading) {
    return (
      <PageShell activeKey="practice">
        <div className="text-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
          <p className="text-gray-500 mt-4 font-semibold">Đang chuẩn bị đề thi trắc nghiệm...</p>
        </div>
      </PageShell>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <PageShell activeKey="practice">
        <div className="px-12 py-16 max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-7xl text-gray-300">search_off</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Không tìm thấy bài trắc nghiệm</h1>
          <Link to="/practice" className="inline-block mt-6 bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900">
            ← Quay lại trang thực hành
          </Link>
        </div>
      </PageShell>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / quiz.questions.length) * 100);

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Tự luyện trắc nghiệm"
        icon="quiz"
        title={quiz.title}
        subtitle=""
      />

      <div className="px-6 md:px-12 py-10 max-w-3xl mx-auto text-left">
        {!isFinished ? (
          <div className="space-y-6">
            {/* Status bar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold">
                Câu hỏi {currentIndex + 1} / {quiz.questions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Tiến trình:</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-800 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-6">
              <h3 className="font-bold text-xl text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  
                  let optionClass = "border-gray-200 hover:border-red-800 hover:bg-red-50/20";
                  if (isAnswered) {
                    if (isCorrect) {
                      optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                    } else if (isSelected) {
                      optionClass = "border-rose-500 bg-rose-50 text-rose-800";
                    } else {
                      optionClass = "border-gray-200 opacity-60";
                    }
                  } else if (isSelected) {
                    optionClass = "border-red-800 bg-red-50 text-red-800 font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-sm md:text-base ${optionClass}`}
                    >
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAnswered && isCorrect ? "bg-emerald-500 text-white" :
                        isAnswered && isSelected ? "bg-rose-500 text-white" :
                        isSelected ? "bg-red-800 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                {!isAnswered ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOption === null}
                    className="bg-red-800 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-red-950 transition-colors disabled:opacity-50"
                  >
                    Xác nhận đáp án
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-red-800 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-red-950 transition-colors"
                  >
                    {currentIndex < quiz.questions.length - 1 ? "Câu tiếp theo →" : "Xem kết quả"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Finished Victory Screen */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center space-y-6 max-w-xl mx-auto">
            <span className="material-symbols-outlined text-7xl text-amber-500">emoji_events</span>
            <h2 className="text-3xl font-extrabold text-gray-900">Kết quả bài thi</h2>
            <p className="text-gray-500 text-sm">
              Đồng chí đã trả lời chính xác <strong className="text-red-800 text-lg">{score}</strong> trên tổng số <strong className="text-gray-800 text-lg">{quiz.questions.length}</strong> câu hỏi.
            </p>

            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 max-w-sm mx-auto">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Tỷ lệ chính xác</span>
              <h4 className="text-3xl font-black text-red-800">{Math.round((score / quiz.questions.length) * 100)}%</h4>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Link
                to="/practice"
                className="border-2 border-red-800 text-red-800 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors"
              >
                Trở lại Thư viện
              </Link>
              <button
                onClick={restartQuiz}
                className="bg-red-800 hover:bg-red-950 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Làm lại bài
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
