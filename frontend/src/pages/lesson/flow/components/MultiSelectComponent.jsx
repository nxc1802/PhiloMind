import React, { useState } from "react";
import { normalizeOptions } from "../utils/normalizeOptions";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";

export function MultiSelectComponent({ component, onComplete }) {
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
  const correctIds = options
    .filter((option) => option.isCorrect)
    .map((option) => option.id)
    .sort();
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const sortedSelected = [...selectedIds].sort();
  const solved =
    submitted &&
    correctIds.length === sortedSelected.length &&
    correctIds.every((id, index) => id === sortedSelected[index]);

  const toggle = (optionId) => {
    if (solved) return;
    setSubmitted(false);
    setSelectedIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  };

  return (
    <ComponentFrame component={component}>
      <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-primary-100">
        {component.config.question}
      </p>
      <ComponentImage
        image={questionImage}
        alt={component.config.question}
        fit="contain"
        className="mb-4 max-h-72"
        imageClassName="max-h-72"
      />
      <div className="grid gap-3">
        {options.map((option) => {
          const checked = selectedIds.includes(option.id);
          const isCorrect = option.isCorrect;
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
          
          let stateClass = "border-slate-250 bg-white text-slate-750 hover:border-primary-400 hover:bg-primary-50 dark:bg-[#132d39] dark:text-primary-150 dark:hover:bg-primary-900/25";
          
          if (submitted) {
            if (checked && isCorrect) {
              // selected + correct = xanh
              stateClass = "border-green-500 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-200";
            } else if (checked && !isCorrect) {
              // selected + wrong = đỏ
              stateClass = "border-red-400 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-200";
            } else if (!checked && isCorrect) {
              // missed (not selected but correct) = cam
              stateClass = "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border-dashed";
            } else {
              // neutral = trung tính (unselected and wrong)
              stateClass = "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-[#0f242e] dark:text-slate-500 opacity-70";
            }
          } else if (checked) {
            stateClass = "border-primary-600 bg-primary-50 text-primary-900 shadow-sm dark:bg-primary-900/40 dark:text-primary-100";
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left font-medium transition-all ${stateClass}`}
            >
              <span className="material-symbols-outlined mt-0.5 text-xl">
                {checked ? "check_box" : "check_box_outline_blank"}
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
      {submitted && (
        <div
          className={`mt-4 rounded-2xl border p-4 ${
            solved
              ? "border-green-200 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100"
              : "border-red-200 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/35 dark:text-red-100"
          }`}
        >
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">{solved ? "task_alt" : "cancel"}</span>
            {solved ? "Chính xác" : "Chưa đủ chính xác"}
          </p>
          {component.config.explanation && (
            <p className="mt-2 text-sm leading-relaxed">
              {component.config.explanation}
            </p>
          )}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        {!solved ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-3xl bg-primary-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kiểm tra
            <span className="material-symbols-outlined text-base">
              done_all
            </span>
          </button>
        ) : (
          <ContinueButton
            onComplete={() =>
              onComplete({
                score: 100,
                answer: selectedIds,
                status: "completed",
              })
            }
            label="Tiếp tục"
          />
        )}
      </div>
    </ComponentFrame>
  );
}
