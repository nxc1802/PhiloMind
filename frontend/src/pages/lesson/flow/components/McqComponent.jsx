import React, { useEffect, useRef, useState } from "react";
import { normalizeOptions } from "../utils/normalizeOptions";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";

// Thời gian giữ trạng thái "sai" trên màn hình trước khi tự trả về ban đầu.
const WRONG_FLASH_MS = 1400;

export function McqComponent({ component, onComplete }) {
  const options = normalizeOptions(component.config.options);
  const questionImage = firstImageAsset(
    [
      component.config.image,
      component.config.imageUrl,
      component.config.questionImage,
      component.config.promptImage,
      component.media?.questionImage,
    ],
    component.config.question,
  );
  const isEmbedded = component.__isEmbedded === true;
  const isCompleted = component.__isCompleted === true;
  const completedAnswer = isEmbedded
    ? null
    : component.__completedResult?.answer || null;
  const [selectedId, setSelectedId] = useState(completedAnswer);
  // Id đang chớp đỏ tạm thời (chỉ tồn tại trong WRONG_FLASH_MS rồi tự reset),
  // khác với đếm số lần sai (attemptsRef) vốn phải giữ nguyên để tính điểm.
  const [wrongFlashId, setWrongFlashId] = useState(null);
  const attemptsRef = useRef(0);
  const flashTimerRef = useRef(null);
  const selected = options.find((option) => option.id === selectedId);
  const solved = selected?.isCorrect;
  const canContinue = solved && !isCompleted;

  useEffect(() => {
    if (completedAnswer) setSelectedId(completedAnswer);
  }, [completedAnswer]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const handlePick = (option) => {
    if (solved) return;

    if (option.isCorrect) {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      setWrongFlashId(null);
      setSelectedId(option.id);
      return;
    }

    attemptsRef.current += 1;
    setSelectedId(option.id);
    setWrongFlashId(option.id);

    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      setSelectedId(null);
      setWrongFlashId(null);
    }, WRONG_FLASH_MS);
  };

  return (
    <ComponentFrame component={component}>
      <p className="font-semibold text-lg mb-4 text-gray-900 dark:text-primary-100">
        {component.config.question}
      </p>
      <ComponentImage
        image={questionImage}
        alt={component.config.question}
        fit="contain"
        className="mb-4 max-h-72"
        imageClassName="max-h-72"
      />
      <div className="space-y-2.5">
        {options.map((option) => {
          const wrong = option.id === wrongFlashId;
          const correctVisible = solved && option.id === selectedId;
          const optionImage = firstImageAsset(
            [
              option.image,
              option.imageUrl,
              option.media,
              component.media?.answerImages?.[option.id],
              component.media?.optionImages?.[option.id],
            ],
            option.text,
          );
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePick(option)}
              className={`w-full text-left rounded-3xl border-2 px-4 py-3.5 font-medium transition-all flex items-center gap-3 ${
                correctVisible
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold"
                  : wrong
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 font-semibold"
                    : "border-gray-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 bg-white dark:bg-surface-dark-elevated text-gray-700 dark:text-primary-100"
              }`}
            >
              <span
                className="material-symbols-outlined text-xl shrink-0"
                aria-hidden="true"
              >
                {correctVisible
                  ? "check_circle"
                  : wrong
                    ? "cancel"
                    : "radio_button_unchecked"}
              </span>
              <span className="min-w-0 flex-1">{option.text}</span>
              <ComponentImage
                image={optionImage}
                alt={option.text}
                caption={false}
                className="h-16 w-20 shrink-0"
                imageClassName="h-full w-full"
              />
            </button>
          );
        })}
      </div>
      {selected && (
        <div
          className={`mt-auto border p-4 rounded-3xl ${solved ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300" : "bg-primary-50 dark:bg-primary-900/35 border-primary-200 dark:border-primary-800 text-primary-850 dark:text-primary-150"}`}
        >
          <p
            className={`font-bold flex items-center gap-2 mb-1 ${solved ? "text-green-800" : "text-primary-700 dark:text-primary-250"}`}
          >
            <span className="material-symbols-outlined text-base">
              {solved ? "lightbulb" : "error"}
            </span>
            {solved ? "Chính xác" : "Chưa đúng"}
          </p>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-primary-100">
            {selected.explanation ||
              (solved
                ? component.feedback?.correct
                : component.feedback?.incorrect) ||
              component.config.explanation}
          </p>
          {canContinue && (
            <ContinueButton
              onComplete={() =>
                onComplete({
                  score: 100,
                  attempts: attemptsRef.current + 1,
                  answer: selectedId,
                  status: "completed",
                })
              }
              label="Tiếp tục"
            />
          )}
        </div>
      )}
    </ComponentFrame>
  );
}
