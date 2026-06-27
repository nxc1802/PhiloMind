import React, { useState } from "react";
import { useToast } from "../../../components/Toast";
import { getOptionClass } from "../components/GradedQuestion";

export default function FinalQuizStage({ questions = [], onComplete }) {
  const { showToast } = useToast();
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[index];

  const handlePick = (optIndex) => {
    if (solved) return;
    if (optIndex === q.correctIndex) {
      if (wrongPicks.length === 0) setScore((s) => s + 1);
      setSolved(true);
    } else if (!wrongPicks.includes(optIndex)) {
      setWrongPicks((prev) => [...prev, optIndex]);
    }
  };

  const goNext = () => {
    if (index === total - 1) {
      const passed = score >= 4; // Min 4/5 questions correct on first try to pass smoothly
      showToast(
        passed
          ? `Xuất sắc! Bạn đúng ngay ${score}/${total} câu.`
          : `Bạn đúng ngay ${score}/${total} câu — ôn lại nhé.`,
        passed ? "success" : "warning"
      );
      onComplete(score);
      return;
    }
    setIndex((i) => i + 1);
    setWrongPicks([]);
    setSolved(false);
  };

  const progress = Math.round((index / total) * 100);

  if (!q) return null;

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-primary-200 dark:border-primary-800 p-6 md:p-7 text-left animate-fadeIn">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">assignment</span>
        <span className="text-xs uppercase tracking-wider text-primary-650 dark:text-primary-300 font-bold">
          Kiểm tra tổng kết hành trình
        </span>
      </div>
      <h2 className="text-2xl font-bold text-primary-850 dark:text-primary-100 mb-4">Bạn đã hiểu nguồn gốc triết học?</h2>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-500 tabular-nums shrink-0">{index + 1}/{total}</span>
      </div>

      <p className="font-semibold text-lg mb-4 text-gray-900 font-serif">
        Câu {index + 1}. {q.question}
      </p>
      <div className="space-y-2.5">
        {q.options.map((opt, optIndex) => (
          <button
            key={optIndex}
            type="button"
            disabled={solved}
            onClick={() => handlePick(optIndex)}
            className={getOptionClass({
              resolved: solved,
              isCorrect: optIndex === q.correctIndex,
              isWrongPick: wrongPicks.includes(optIndex),
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {solved && optIndex === q.correctIndex
                ? "check_circle"
                : wrongPicks.includes(optIndex)
                ? "cancel"
                : "radio_button_unchecked"}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {!solved && wrongPicks.length > 0 && (
        <div className="mt-4 bg-primary-50 dark:bg-primary-900/35 border border-primary-200 dark:border-primary-800 text-primary-650 dark:text-primary-300 p-3 rounded-3xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          Chưa chính xác — hãy thử một đáp án khác.
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-3xl j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-sm text-green-900/90 leading-relaxed font-serif">{q.explanation}</p>
          <button
            type="button"
            onClick={goNext}
            className="mt-4 inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            {index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
