import React, { useState } from "react";

/**
 * LessonHint — Collapsible instruction panel used by interactive game components.
 * Shows first step inline; full instructions in a modal dialog.
 */
export function LessonHint({ title = "Cách chơi", steps = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-650 dark:border-primary-850 dark:bg-primary-950/25 dark:text-primary-150">
        <div className="flex min-w-0 items-start gap-2">
          <span className="material-symbols-outlined mt-0.5 text-base text-primary-600 dark:text-primary-300">
            tips_and_updates
          </span>
          <p className="min-w-0 leading-relaxed">
            {steps[0] || "Hoàn thành tương tác để tiếp tục bài học."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800 bg-white dark:bg-primary-950/50 px-3 py-1.5 text-xs font-bold text-primary-800 dark:text-primary-100 hover:border-primary-500"
        >
          <span className="material-symbols-outlined text-base">help</span>
          Cách chơi
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-lg rounded-3xl border border-slate-100 dark:border-primary-850 bg-white dark:bg-[#102733] p-6 text-slate-800 dark:text-primary-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng hướng dẫn"
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-primary-900/40 dark:hover:text-primary-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="mb-2 flex items-center gap-2 pr-8 text-xl font-bold text-primary-850 dark:text-primary-100">
              <span className="material-symbols-outlined text-primary-600 dark:text-primary-300">
                tips_and_updates
              </span>
              {title}
            </h3>
            <p className="mb-5 text-sm text-slate-500 dark:text-primary-250">
              Làm theo từng bước bên dưới trước khi bắt đầu tương tác.
            </p>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-primary-100 dark:border-primary-850 bg-primary-50 dark:bg-[#15313e] p-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm font-semibold leading-relaxed text-slate-700 dark:text-primary-100">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-3xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-750"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
