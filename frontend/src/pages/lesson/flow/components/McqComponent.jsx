import React, { useEffect, useState } from "react";
import { normalizeOptions } from "../utils/normalizeOptions";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function McqComponent({ component, onComplete }) {
  const options = normalizeOptions(component.config.options);
  const isEmbedded = component.__isEmbedded === true;
  const isCompleted = component.__isCompleted === true;
  const completedAnswer = isEmbedded
    ? null
    : component.__completedResult?.answer || null;
  const [selectedId, setSelectedId] = useState(completedAnswer);
  const [wrongIds, setWrongIds] = useState([]);
  const selected = options.find((option) => option.id === selectedId);
  const solved = selected?.isCorrect;
  const canContinue = solved && (!isCompleted || isEmbedded);

  useEffect(() => {
    if (completedAnswer) setSelectedId(completedAnswer);
  }, [completedAnswer]);

  const handlePick = (option) => {
    if (solved) return;
    setSelectedId(option.id);
    if (!option.isCorrect && !wrongIds.includes(option.id)) {
      setWrongIds((prev) => [...prev, option.id]);
    }
  };

  return (
    <ComponentFrame component={component}>
      <p className="font-semibold text-lg mb-4 text-gray-900 dark:text-primary-100">
        {component.config.question}
      </p>
      <div className="space-y-2.5">
        {options.map((option) => {
          const wrong = wrongIds.includes(option.id);
          const correctVisible = solved && option.id === selectedId;
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
              <span className="material-symbols-outlined text-xl shrink-0">
                {correctVisible
                  ? "check_circle"
                  : wrong
                    ? "cancel"
                    : "radio_button_unchecked"}
              </span>
              {option.text}
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
                  attempts: wrongIds.length + 1,
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
