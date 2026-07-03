import React, { useState } from "react";
import { normalizeQuizQuestions } from "../utils/normalizeOptions";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function QuizSequenceComponent({ component, onComplete }) {
  const questions = normalizeQuizQuestions(component.config.questions || []);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [wrongAnswers, setWrongAnswers] = useState({});
  const activeQuestion = questions[activeQuestionIndex];
  const selectedId = answers[activeQuestionIndex];
  const solved = Boolean(selectedId);
  const isLastQuestion = activeQuestionIndex >= questions.length - 1;
  const score =
    questions.length > 0
      ? Math.round((Object.keys(answers).length / questions.length) * 100)
      : 100;

  const pickOption = (option) => {
    if (solved) return;

    if (option.isCorrect) {
      setAnswers((prev) => ({ ...prev, [activeQuestionIndex]: option.id }));
      return;
    }

    setWrongAnswers((prev) => ({
      ...prev,
      [activeQuestionIndex]: [...(prev[activeQuestionIndex] || []), option.id],
    }));
  };

  if (!questions.length) {
    return (
      <ComponentFrame component={component}>
        <p className="text-sm font-medium text-slate-600 dark:text-primary-150">
          Cụm câu hỏi này chưa có dữ liệu.
        </p>
        <ContinueButton onComplete={onComplete} label="Tiếp tục" />
      </ComponentFrame>
    );
  }

  return (
    <ComponentFrame component={component}>
      <div className="flex flex-col flex-1 h-full min-h-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 dark:border-primary-850 dark:bg-primary-950/35 shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold text-primary-850 dark:text-primary-100">
            <span className="material-symbols-outlined text-lg">quiz</span>
            Câu {activeQuestionIndex + 1}/{questions.length}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white dark:bg-primary-950 sm:w-52">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{
                width: `${((activeQuestionIndex + (solved ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-primary-850 dark:bg-[#132d39] flex flex-col flex-1 overflow-y-auto">
          <p className="text-lg font-bold leading-relaxed text-slate-950 dark:text-primary-100">
            {activeQuestion.question}
          </p>
          <div className="mt-4 grid gap-3">
            {activeQuestion.options.map((option) => {
              const wrong = (wrongAnswers[activeQuestionIndex] || []).includes(
                option.id,
              );
              const correctVisible = solved && option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pickOption(option)}
                  className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all ${
                    correctVisible
                      ? "border-green-500 bg-green-50 text-green-950 dark:bg-green-950/35 dark:text-green-100"
                      : wrong
                        ? "border-red-400 bg-red-50 text-red-950 dark:bg-red-950/35 dark:text-red-100"
                        : "border-slate-200 bg-slate-50 text-slate-750 hover:border-primary-400 hover:bg-primary-50 dark:border-primary-850 dark:bg-[#102733] dark:text-primary-100 dark:hover:bg-primary-900/35"
                  }`}
                >
                  <span className="material-symbols-outlined mt-0.5 text-xl">
                    {correctVisible
                      ? "check_circle"
                      : wrong
                        ? "cancel"
                        : "radio_button_unchecked"}
                  </span>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>

          {(solved || wrongAnswers[activeQuestionIndex]?.length > 0) && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                solved
                  ? "border-green-200 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100"
                  : "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100"
              }`}
            >
              <p className="font-bold">{solved ? "Chính xác" : "Thử lại"}</p>
              <p className="mt-1">
                {solved
                  ? activeQuestion.explanation ||
                    activeQuestion.options.find(
                      (option) => option.id === selectedId,
                    )?.explanation ||
                    "Bạn đã chọn đúng."
                  : "Đáp án này chưa đúng. Hãy đọc kỹ câu hỏi và chọn lại."}
              </p>
            </div>
          )}
        </div>

        {solved && (
          <div className="mt-auto pt-5 flex justify-end shrink-0">
            {isLastQuestion ? (
              <ContinueButton
                onComplete={() =>
                  onComplete({
                    score,
                    answer: answers,
                    status: "completed",
                  })
                }
                label="Hoàn thành cụm câu hỏi"
              />
            ) : (
              <button
                type="button"
                onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 rounded-3xl bg-primary-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-primary-700"
              >
                Câu tiếp theo
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </ComponentFrame>
  );
}
