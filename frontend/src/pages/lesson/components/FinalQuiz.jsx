import React, { useState, useMemo } from "react";

const QUIZ_PASS_THRESHOLD = 80;

export function FinalQuiz({ dbFlashcards, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizState, setQuizState] = useState("start"); // "start" | "quiz" | "result"

  const questions = useMemo(() => {
    if (!dbFlashcards || dbFlashcards.length === 0) return [];
    return dbFlashcards.map((fc) => {
      if (!fc.question) return null;
      const lines = fc.question.split("\n");
      const questionText = lines[0];
      const options = lines.slice(1).map(line => line.trim()).filter(Boolean);
      return {
        id: fc.id,
        question: questionText,
        options: options,
        answer: fc.answer ? fc.answer.trim() : ""
      };
    }).filter(Boolean);
  }, [dbFlashcards]);

  const handleStart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setQuizState("quiz");
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption === currentQ.answer;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizState("result");
      const scorePercent = Math.round((correctCount / questions.length) * 100);
      if (scorePercent >= QUIZ_PASS_THRESHOLD && onComplete) {
        onComplete(scorePercent, 100);
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-md border border-gray-200 dark:border-primary-850/50 p-8 text-center space-y-4 mt-8">
        <h3 className="text-2xl font-bold text-primary-850 dark:text-primary-100 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary-650 dark:text-primary-300 text-3xl">task_alt</span>
          Hoàn thành bài học
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Bài học này không có câu hỏi kiểm tra cuối khóa. Đồng chí có thể xác nhận để mở khoá bài tiếp theo.
        </p>
        <button
          onClick={() => onComplete && onComplete(100, 100)}
          className="bg-primary-600 hover:bg-primary-900 text-white font-bold px-8 py-3.5 rounded-3xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined">verified</span>
          Xác nhận Hoàn thành
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= QUIZ_PASS_THRESHOLD;

  if (quizState === "start") {
    return (
      <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-md border border-gray-200 dark:border-primary-850/50 p-8 text-center space-y-5 mt-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-50 dark:bg-primary-900/35 rounded-3xl text-primary-650 dark:text-primary-300 border border-primary-100 dark:border-primary-850 mb-2">
          <span className="material-symbols-outlined text-4xl">assignment</span>
        </div>
        <h3 className="text-2xl font-bold text-primary-850 dark:text-primary-100">Bài kiểm tra Tổng kết</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
          Đồng chí cần hoàn thành bài kiểm tra gồm <strong>{questions.length} câu hỏi</strong> trắc nghiệm để chứng minh độ thấu hiểu kiến thức. Điểm đạt tối thiểu là <strong>{QUIZ_PASS_THRESHOLD}%</strong> để mở khóa bài học tiếp theo.
        </p>
        <button
          onClick={handleStart}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-3xl shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined">play_circle</span>
          Bắt đầu kiểm tra
        </button>
      </div>
    );
  }

  if (quizState === "result") {
    return (
      <div className={`rounded-3xl p-8 border text-center space-y-6 mt-8 shadow-lg transition-all ${
        passed
          ? "bg-gradient-to-br from-emerald-50 to-green-50/30 border-green-200 text-green-950"
          : "bg-gradient-to-br from-rose-50 to-red-50/30 border-primary-200 dark:border-primary-800 text-primary-950"
      }`}>
        <div className="text-5xl animate-bounce">
          {passed ? "🏆" : "❌"}
        </div>
        <h3 className="text-2xl font-extrabold tracking-wide">
          {passed ? "VƯỢT QUA KỲ KIỂM TRA!" : "KẾT QUẢ KHÔNG ĐẠT!"}
        </h3>
        <p className="text-sm max-w-md mx-auto leading-relaxed text-gray-700">
          {passed
            ? "Tuyệt vời! Đồng chí đã xuất sắc vượt qua kỳ kiểm tra tổng kết của bài học này và chính thức mở khóa bài học tiếp theo trên sơ đồ tư duy."
            : `Đồng chí chỉ đạt ${scorePercent}% câu trả lời đúng (yêu cầu tối thiểu ${QUIZ_PASS_THRESHOLD}%). Vui lòng nghiên cứu kỹ lại giáo trình và thử lại.`}
        </p>

        <div className="bg-white dark:bg-surface-dark-elevated/80 backdrop-blur border border-gray-150 dark:border-primary-850/50 rounded-3xl p-5 shadow-inner max-w-xs mx-auto">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-1">Kết quả đạt được</span>
          <h4 className="text-3xl font-black text-slate-800">
            {correctCount} / {questions.length}
          </h4>
          <span className={`text-xs font-bold px-2 py-0.5 rounded mt-2 inline-block ${
            passed ? "bg-green-100 text-green-800" : "bg-red-100 text-primary-650 dark:text-primary-300"
          }`}>
            {scorePercent}% - {passed ? "ĐẠT" : "CHƯA ĐẠT"}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            className="border-2 border-primary-800 text-primary-650 dark:text-primary-300 font-bold px-6 py-3 rounded-3xl hover:bg-primary-800 hover:text-white transition-all shadow"
          >
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  const isCurrentQCorrect = selectedOption === currentQ.answer;

  return (
    <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-md border border-gray-200 dark:border-primary-850/50 p-6 md:p-8 mt-8 space-y-5 text-left relative overflow-hidden">
      {/* Quiz progress */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-700">Bài kiểm tra tổng kết</span>
          <h4 className="font-extrabold text-lg text-slate-800">Câu hỏi trắc nghiệm</h4>
        </div>
        <div className="bg-slate-50 dark:bg-[#001F28] px-3 py-1.5 rounded-3xl border border-gray-150 text-xs font-bold text-slate-600">
          Câu {currentIdx + 1} / {questions.length} (Đúng: {correctCount})
        </div>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div className="bg-slate-50 dark:bg-[#001F28] p-5 rounded-3xl border-l-4 border-primary-800 shadow-inner">
          <p className="text-slate-800 text-base font-semibold leading-relaxed">
            {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            let optionCls = "w-full text-left rounded-3xl border-2 px-4 py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] block bg-white dark:bg-surface-dark-elevated text-gray-700 dark:text-primary-100 ";
            
            if (!isAnswered) {
              if (isSelected) {
                optionCls += "border-primary-800 bg-primary-50 dark:bg-primary-900/35 text-primary-950 dark:text-primary-100 font-bold shadow-sm";
              } else {
                optionCls += "border-gray-205 text-gray-650 hover:border-red-300";
              }
            } else {
              const isCorrectAnswer = option === currentQ.answer;
              if (isCorrectAnswer) {
                optionCls += "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold";
              } else if (isSelected) {
                optionCls += "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 font-semibold";
              } else {
                optionCls += "border-gray-100 opacity-60 text-gray-400";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={optionCls}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        {!isAnswered ? (
          <button
            type="button"
            disabled={selectedOption === null}
            onClick={handleCheckAnswer}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-3xl transition-all shadow flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">fact_check</span>
            Kiểm tra đáp án
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full justify-between">
            <span className={`text-xs font-bold flex items-center gap-1 ${
              isCurrentQCorrect ? "text-green-700" : "text-red-700"
            }`}>
              <span className="material-symbols-outlined text-base">
                {isCurrentQCorrect ? "check_circle" : "cancel"}
              </span>
              {isCurrentQCorrect ? "Chính xác!" : `Sai rồi! Đáp án đúng là: ${currentQ.answer}`}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-3xl transition-all shadow flex items-center gap-1"
            >
              Tiếp tục
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
