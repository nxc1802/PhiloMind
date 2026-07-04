import React from "react";

/**
 * ContinueButton — Shared "next" button used by all lesson flow components.
 * Calls onComplete with score=100 and status="completed" when clicked.
 */
export function ContinueButton({ onComplete, label = "Tiếp tục" }) {
  return (
    <div className="mt-auto pt-5 flex justify-end shrink-0">
      <button
        type="button"
        onClick={() => onComplete({ score: 100, status: "completed" })}
        className="inline-flex items-center gap-1.5 rounded-3xl bg-primary-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-primary-700"
      >
        {label}
        <span className="material-symbols-outlined text-base">
          arrow_forward
        </span>
      </button>
    </div>
  );
}
