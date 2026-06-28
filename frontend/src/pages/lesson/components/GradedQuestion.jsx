import React, { useState, useEffect } from "react";

export function getOptionClass({ resolved, isCorrect, isWrongPick }) {
  const base =
    "w-full text-left rounded-3xl border-2 px-4 py-3.5 font-medium transition-all flex items-center gap-3 ";
  if (resolved && isCorrect) return base + "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300 font-semibold";
  if (isWrongPick) return base + "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 font-semibold";
  if (resolved) return base + "border-gray-200 opacity-60";
  return base + "border-gray-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 bg-white dark:bg-surface-dark-elevated text-gray-700 dark:text-primary-100";
}

export default function GradedQuestion({ prompt, options, correctFeedback, wrongFeedback, onPass, passLabel = "Tiếp tục" }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setWrongPicks([]);
    setSolved(false);
  }, [prompt]);

  const handlePick = (index) => {
    if (solved) return;
    if (options[index].correct) {
      setSolved(true);
    } else if (!wrongPicks.includes(index)) {
      setWrongPicks((prev) => [...prev, index]);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-md border border-gray-200 dark:border-primary-850/50 p-6 text-left">
      <p className="font-semibold text-lg mb-4 text-gray-900">{prompt}</p>
      <div className="space-y-2.5">
        {options.map((opt, index) => (
          <button
            key={index}
            type="button"
            disabled={solved}
            onClick={() => handlePick(index)}
            className={getOptionClass({
              resolved: solved,
              isCorrect: opt.correct,
              isWrongPick: wrongPicks.includes(index),
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {solved && opt.correct
                ? "check_circle"
                : wrongPicks.includes(index)
                ? "cancel"
                : "radio_button_unchecked"}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      {!solved && wrongPicks.length > 0 && (
        <div className="mt-4 bg-primary-50 dark:bg-primary-900/35 border border-primary-200 dark:border-primary-800 text-primary-650 dark:text-primary-300 p-3 rounded-3xl text-base flex items-start gap-2 j-bubble-in">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{wrongFeedback}</span>
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-300 p-4 rounded-3xl j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-base leading-relaxed">{correctFeedback}</p>
          <button
            type="button"
            onClick={onPass}
            className="mt-4 inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            {passLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
