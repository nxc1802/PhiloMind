import React, { useEffect, useRef, useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";
import { parseInlineMarkdown, parseMarkdownToReact } from "../../components/MarkdownRenderer";

function getFinalQuizCorrectIndex(question) {
  if (typeof question?.correctIndex === "number") return question.correctIndex;
  return (question?.options || []).findIndex(
    (option) =>
      typeof option === "object" &&
      (option.isCorrect === true || option.correct === true),
  );
}

export function FinalSummaryComponent({ component, onComplete }) {
  const {
    message,
    keyTakeaways = [],
    rewards = {},
    quiz = [],
  } = component.config;
  const [quizDone, setQuizDone] = useState(quiz.length === 0);
  const [answers, setAnswers] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionStarted, setCompletionStarted] = useState(false);
  const completionTimerRef = useRef(null);
  const completionDeliveredRef = useRef(false);
  const answeredAll =
    quiz.length > 0 && quiz.every((_, index) => answers[index] !== undefined);
  const score =
    quiz.length === 0
      ? 100
      : Math.round(
          (quiz.filter(
            (q, index) => answers[index] === getFinalQuizCorrectIndex(q),
          ).length /
            quiz.length) *
            100,
        );

  useEffect(() => {
    if (answeredAll) setQuizDone(true);
  }, [answeredAll]);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  const finishCompletion = () => {
    if (completionDeliveredRef.current) return;
    completionDeliveredRef.current = true;
    if (completionTimerRef.current) {
      window.clearTimeout(completionTimerRef.current);
    }
    onComplete({ score, answer: answers, status: "completed" });
  };

  const handleComplete = () => {
    if (completionStarted) return;
    setCompletionStarted(true);
    setShowCelebration(true);
    completionTimerRef.current = window.setTimeout(finishCompletion, 6000);
  };

  return (
    <ComponentFrame component={component}>
      {showCelebration && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/20 bg-white p-6 text-center shadow-2xl dark:bg-[#102733]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-primary-600 text-white shadow-lg">
              <span className="material-symbols-outlined text-5xl">
                workspace_premium
              </span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-primary-950 dark:text-primary-100">
              Chúc mừng!
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-primary-200">
              Bạn đã hoàn thành bài học và mở khóa phần thưởng tổng kết.
            </p>
            <button
              type="button"
              onClick={finishCompletion}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-3xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-primary-700"
            >
              Chuyển tới bài học tiếp theo
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-primary-150 bg-white shadow-sm dark:border-primary-800 dark:bg-[#132d39]">
        <div className="bg-gradient-to-br from-primary-700 via-primary-650 to-amber-500 px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/75">
                Tổng kết bài học
              </p>
              <p className="mt-1 break-words text-xl font-extrabold leading-tight">
                {message || "Bạn đã hoàn thành bài học."}
              </p>
            </div>
            <span className="material-symbols-outlined flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              military_tech
            </span>
          </div>
        </div>

        <div className="p-5">
          <ComponentImage
            image={firstImageAsset(
              [component.config.image, component.config.imageUrl],
              component.title,
            )}
            alt={component.title}
            fit="contain"
            className="mb-4 max-h-80"
            imageClassName="max-h-80"
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
            <ul className="space-y-2">
              {keyTakeaways.map((item, index) => (
                <li
                  key={index}
                  className="flex min-w-0 items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-slate-800 dark:bg-primary-950/30 dark:text-primary-100"
                >
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-green-600 dark:text-green-300">
                    check_circle
                  </span>
                  <span className="min-w-0 flex-1 break-words text-sm leading-6">
                    {parseInlineMarkdown(typeof item === "object" ? item.text || item.label : item)}
                  </span>
                  <ComponentImage
                    image={typeof item === "object" ? item.image : null}
                    alt={typeof item === "object" ? item.text || item.label : ""}
                    caption={false}
                    className="h-14 w-20 shrink-0"
                    imageClassName="h-full w-full"
                  />
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  stars
                </span>
                <span>{rewards.badge || "Hoàn thành"}</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold">
                {rewards.xp || 100} XP
              </p>
            </div>
          </div>

          {component.config.referenceUrl && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-primary-850 text-xs md:text-sm font-medium text-slate-600 dark:text-primary-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary-600 dark:text-primary-400">
                menu_book
              </span>
              <span>
                Bài học tham khảo từ{" "}
                <a
                  href={component.config.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary-600 dark:text-primary-350 underline hover:text-primary-700"
                >
                  tài liệu
                </a>
              </span>
            </div>
          )}
        </div>
      </div>

      {quiz.length > 0 && (
        <div className="mt-5 space-y-4">
          {quiz.map((question, index) => {
            const questionText =
              typeof question === "object"
                ? question.question || question.prompt
                : String(question);
            const questionImage =
              typeof question === "object"
                ? firstImageAsset(
                    [
                      question.image,
                      question.imageUrl,
                      question.questionImage,
                      question.promptImage,
                    ],
                    questionText,
                  )
                : null;

            return (
              <div
                key={index}
                className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-primary-850 dark:bg-[#132d39]"
              >
                <p className="mb-3 font-semibold text-slate-900 dark:text-primary-100">
                  {questionText}
                </p>
                <ComponentImage
                  image={questionImage}
                  alt={questionText}
                  fit="contain"
                  className="mb-3 max-h-64"
                  imageClassName="max-h-64"
                />
                <div className="grid gap-2">
                  {(question.options || []).map((option, optionIndex) => {
                    const optionText =
                      typeof option === "object"
                        ? option.text || option.label || ""
                        : option;
                    const optionImage =
                      typeof option === "object"
                        ? firstImageAsset(
                            [option.image, option.imageUrl, option.media],
                            optionText,
                          )
                        : null;
                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [index]: optionIndex,
                          }))
                        }
                        className={`flex items-start gap-3 rounded-3xl border px-4 py-2 text-left ${
                          answers[index] === optionIndex
                            ? "border-primary-600 bg-primary-50 font-bold text-primary-850 shadow-sm dark:bg-primary-900/40 dark:text-primary-100"
                            : "border-gray-250 bg-white text-gray-750 hover:border-primary-400 hover:bg-primary-50 dark:bg-surface-dark-elevated dark:text-primary-150 dark:hover:bg-primary-900/20"
                        }`}
                      >
                        <span className="min-w-0 flex-1">{optionText}</span>
                        <ComponentImage
                          image={optionImage}
                          alt={optionText}
                          caption={false}
                          className="h-14 w-20 shrink-0"
                          imageClassName="h-full w-full"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {quizDone && (
            <p className="text-sm font-bold text-green-700 dark:text-green-300">
              Điểm tổng kết: {score}%
            </p>
          )}
        </div>
      )}

      {quizDone && (
        <ContinueButton
          onComplete={handleComplete}
          label={
            completionStarted ? "Đang hoàn thành..." : "Hoàn thành bài học"
          }
        />
      )}
    </ComponentFrame>
  );
}
