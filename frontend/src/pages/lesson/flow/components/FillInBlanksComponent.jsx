import React, { useState, useMemo } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

// Helper function to shuffle an array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to check correctness (ignore case and surrounding whitespace)
const isCorrectMatch = (input, expected) => {
  if (!input || !expected) return false;
  return input.trim().toLowerCase() === expected.trim().toLowerCase();
};

export function FillInBlanksComponent({ component, onComplete }) {
  const { textWithBlanks, blanks, instruction, successFeedback } =
    component.config;
  const isCompleted = component.__isCompleted === true;

  const [answers, setAnswers] = useState({});

  // Create a map for quick lookup and shuffle options for blanks with distractors
  const blankMap = useMemo(() => {
    const map = {};
    if (blanks) {
      blanks.forEach((b) => {
        let options = null;
        if (b.distractors && b.distractors.length > 0) {
          options = shuffleArray([b.correctAnswer, ...b.distractors]);
        }
        map[b.id] = { ...b, options };
      });
    }
    return map;
  }, [blanks]);

  // Split text by [blank_id]
  const textParts = useMemo(() => {
    if (!textWithBlanks) return [];
    // Split by [something], keeping the separator
    return textWithBlanks.split(/\[(.*?)\]/g);
  }, [textWithBlanks]);

  const handleChange = (id, value) => {
    if (isCompleted) return;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // Dynamically check correctness
  const allCorrect = useMemo(() => {
    if (!blanks || blanks.length === 0) return true;
    return blanks.every((b) => isCorrectMatch(answers[b.id], b.correctAnswer));
  }, [answers, blanks]);

  const canContinue = allCorrect && !isCompleted;

  return (
    <ComponentFrame component={component}>
      {instruction && (
        <p className="font-semibold text-lg mb-4 text-gray-900 dark:text-primary-100">
          {instruction}
        </p>
      )}

      <div className="text-lg leading-loose text-gray-800 dark:text-primary-150 mb-6 bg-white dark:bg-surface-dark-elevated p-6 rounded-3xl border border-gray-200 dark:border-primary-800 shadow-sm">
        {textParts.map((part, index) => {
          // Even indices are text, odd indices are blank IDs
          if (index % 2 === 0) {
            // Use whitespace-pre-wrap to respect newlines in the markdown/text
            return (
              <span key={index} className="whitespace-pre-wrap">
                {part}
              </span>
            );
          }

          const blankId = part;
          const blankInfo = blankMap[blankId];

          if (!blankInfo) {
            // Fallback if blank ID not found in config
            return (
              <span key={index} className="text-red-500 font-mono text-sm">
                [{blankId} missing]
              </span>
            );
          }

          const value = answers[blankId] || "";
          const isCorrect = isCorrectMatch(value, blankInfo.correctAnswer);
          const hasAttempted = value !== "";

          // Styling for the input/select
          const baseClasses =
            "mx-1 px-3 py-1 font-semibold rounded-xl border-2 outline-none focus:border-primary-400 transition-colors bg-gray-50 dark:bg-primary-900/30 text-center min-w-[100px] max-w-full inline-block";

          // Optional visual feedback
          const statusClasses = hasAttempted
            ? isCorrect
              ? "border-green-400 text-green-700 dark:text-green-300"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:border-primary-400";

          if (blankInfo.options) {
            // Render select
            return (
              <select
                key={index}
                value={value}
                onChange={(e) => handleChange(blankId, e.target.value)}
                disabled={isCompleted}
                className={`${baseClasses} ${statusClasses} cursor-pointer appearance-none`}
              >
                <option value="" disabled>
                  -- Chọn --
                </option>
                {blankInfo.options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            );
          } else {
            // Render input
            return (
              <input
                key={index}
                type="text"
                value={value}
                onChange={(e) => handleChange(blankId, e.target.value)}
                disabled={isCompleted}
                placeholder="..."
                className={`${baseClasses} ${statusClasses}`}
                style={{ width: `${Math.max(5, value.length + 2)}ch` }}
              />
            );
          }
        })}
      </div>

      {allCorrect && (
        <div className="mt-auto border p-4 rounded-3xl bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300">
          <p className="font-bold flex items-center gap-2 mb-1 text-green-800 dark:text-green-300">
            <span className="material-symbols-outlined text-base">
              check_circle
            </span>
            Chính xác
          </p>
          {successFeedback && (
            <p className="text-sm leading-relaxed text-gray-800 dark:text-green-100/80 mb-4">
              {successFeedback}
            </p>
          )}
          {canContinue && (
            <ContinueButton
              onComplete={() =>
                onComplete({
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
