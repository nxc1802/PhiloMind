import React, { useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function TrueFalseComponent({ component, onComplete }) {
  const [picked, setPicked] = useState(null);
  const correct = picked === component.config.correctAnswer;
  return (
    <ComponentFrame component={component}>
      <p className="font-semibold text-lg text-gray-900 dark:text-primary-100 mb-4">
        {component.config.statement}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {[true, false].map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setPicked(value)}
            className={`rounded-3xl border-2 px-5 py-4 font-bold transition-colors ${
              picked === value
                ? value === component.config.correctAnswer
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-300"
                  : "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300"
                : "border-slate-205 bg-white dark:bg-surface-dark-elevated text-gray-700 dark:text-primary-100 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
            }`}
          >
            {value ? "Đúng" : "Sai"}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div
          className={`mt-4 rounded-3xl border p-4 ${correct ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300"}`}
        >
          <p
            className={`font-bold ${correct ? "text-green-800" : "text-red-800"}`}
          >
            {correct ? "Chính xác" : "Chưa đúng"}
          </p>
          <p className="text-sm text-slate-800 dark:text-primary-100 leading-relaxed mt-1">
            {component.config.explanation}
          </p>
          {correct && (
            <ContinueButton
              onComplete={() =>
                onComplete({ score: 100, answer: picked, status: "completed" })
              }
              label="Tiếp tục"
            />
          )}
        </div>
      )}
    </ComponentFrame>
  );
}
