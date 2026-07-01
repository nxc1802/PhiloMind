import React, { useState, useEffect } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function FinalSummaryComponent({ component, onComplete }) {
  const {
    message,
    keyTakeaways = [],
    rewards = {},
    quiz = [],
  } = component.config;
  const [quizDone, setQuizDone] = useState(quiz.length === 0);
  const [answers, setAnswers] = useState({});
  const answeredAll =
    quiz.length > 0 && quiz.every((_, index) => answers[index] !== undefined);
  const score =
    quiz.length === 0
      ? 100
      : Math.round(
          (quiz.filter((q, index) => answers[index] === q.correctIndex).length /
            quiz.length) *
            100,
        );

  useEffect(() => {
    if (answeredAll) setQuizDone(true);
  }, [answeredAll]);

  return (
    <ComponentFrame component={component}>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-primary-950/60 border border-amber-200 dark:border-amber-800 rounded-3xl p-5 text-slate-900 dark:text-amber-50">
        <p className="text-lg font-bold text-primary-950 dark:text-amber-50 mb-2">
          {message || "Bạn đã hoàn thành bài học."}
        </p>
        <ul className="space-y-2">
          {keyTakeaways.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-slate-800 dark:text-amber-50"
            >
              <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">
                check_circle
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white dark:bg-[#182d35] px-4 py-2 text-sm font-bold text-amber-800 dark:text-amber-100 border border-amber-200 dark:border-amber-800">
          <span className="material-symbols-outlined text-base">
            military_tech
          </span>
          {rewards.badge || "Hoàn thành"} · {rewards.xp || 100} XP
        </div>
      </div>

      {quiz.length > 0 && (
        <div className="mt-5 space-y-4">
          {quiz.map((question, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 dark:border-primary-850 bg-white dark:bg-[#132d39] p-4"
            >
              <p className="font-semibold text-slate-900 dark:text-primary-100 mb-3">
                {question.question}
              </p>
              <div className="grid gap-2">
                {(question.options || []).map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                    }
                    className={`rounded-3xl border px-4 py-2 text-left ${
                      answers[index] === optionIndex
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/40 text-primary-850 dark:text-primary-100 font-bold shadow-sm"
                        : "border-gray-250 bg-white dark:bg-surface-dark-elevated text-gray-750 dark:text-primary-150 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {quizDone && (
            <p className="text-sm font-bold text-green-700 dark:text-green-300">
              Điểm tổng kết: {score}%
            </p>
          )}
        </div>
      )}

      {quizDone && (
        <ContinueButton
          onComplete={() =>
            onComplete({ score, answer: answers, status: "completed" })
          }
          label="Hoàn thành bài học"
        />
      )}
    </ComponentFrame>
  );
}
