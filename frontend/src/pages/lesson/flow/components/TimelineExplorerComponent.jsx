import React, { useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function TimelineExplorerComponent({ component, onComplete }) {
  const { periods = [], summary, instruction } = component.config || {};
  const [visited, setVisited] = useState([]);
  const [activeId, setActiveId] = useState(periods[0]?.id || null);
  const active = periods.find((period) => period.id === activeId) || periods[0];
  const complete = periods.length > 0 && visited.length === periods.length;

  const openPeriod = (id) => {
    setActiveId(id);
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <ComponentFrame component={component}>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="shrink-0">
          <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-primary-150">
            {instruction || "Chọn từng mốc thời gian để khám phá tiến trình."}
          </p>
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto pb-2">
          {periods.map((period, index) => {
            const isActive = period.id === active?.id;
            const isVisited = visited.includes(period.id);
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => openPeriod(period.id)}
                className={`flex min-w-36 flex-col rounded-2xl border px-3 py-2 text-left transition-all ${
                  isActive
                    ? "border-primary-400 bg-primary-50 text-primary-900 shadow-sm dark:bg-primary-900/35 dark:text-primary-100"
                    : isVisited
                      ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800/40 dark:bg-green-950/20 dark:text-green-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary-300 dark:border-primary-850 dark:bg-[#102733] dark:text-primary-200"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Mốc {index + 1}
                </span>
                <span className="mt-1 text-sm font-extrabold leading-tight">
                  {period.label || period.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-primary-850/50 dark:bg-[#102733]">
          {active ? (
            <>
              <p className="text-xl font-extrabold text-primary-900 dark:text-primary-100">
                {active.title || active.label}
              </p>
              {active.summary && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700 dark:text-primary-150">
                  {active.summary}
                </p>
              )}
              {Array.isArray(active.points) && active.points.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {active.points.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 dark:bg-primary-950/30"
                    >
                      <span className="material-symbols-outlined mt-0.5 text-base text-primary-600 dark:text-primary-300">
                        arrow_right_alt
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-primary-300">
              Chưa có mốc thời gian.
            </p>
          )}
        </div>

        {complete && (
          <div className="shrink-0 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
            <p className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined">task_alt</span>
              Đã khám phá đủ các mốc.
            </p>
            {summary && <p className="mt-1 text-sm leading-6">{summary}</p>}
            <ContinueButton
              onComplete={() =>
                onComplete({
                  score: 100,
                  answer: visited,
                  status: "completed",
                })
              }
              label="Tiếp tục"
            />
          </div>
        )}
      </div>
    </ComponentFrame>
  );
}
