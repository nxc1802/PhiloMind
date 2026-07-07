import React, { useMemo, useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

function getPoint(index, total) {
  const angle = index * 0.82 - 1.2;
  const radius = 18 + index * (34 / Math.max(total - 1, 1));
  return {
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius,
  };
}

export function ProgressionSpiralComponent({ component, onComplete }) {
  const { center, milestones = [], summary, instruction } =
    component.config || {};
  const [visited, setVisited] = useState([]);
  const activeMilestone =
    milestones.find((milestone) => milestone.id === visited.at(-1)) ||
    milestones[0];
  const complete = milestones.length > 0 && visited.length === milestones.length;

  const nodes = useMemo(
    () =>
      milestones.map((milestone, index) => ({
        ...milestone,
        index,
        point: getPoint(index, milestones.length),
      })),
    [milestones],
  );

  const handleVisit = (id) => {
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <ComponentFrame component={component}>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[24rem] overflow-hidden rounded-3xl border border-primary-100 bg-slate-50 p-4 dark:border-primary-850/50 dark:bg-[#102733]">
          <div className="absolute inset-0 opacity-45">
            <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary-300 dark:border-primary-700" />
            <div className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary-300 dark:border-primary-700" />
            <div className="absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary-300 dark:border-primary-700" />
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-650 p-3 text-center text-sm font-extrabold leading-tight text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)]">
            {center || "Tiến trình"}
          </div>

          {nodes.map((node) => {
            const open = visited.includes(node.id);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleVisit(node.id)}
                className={`absolute z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border-2 text-center text-[10px] font-bold leading-tight shadow-sm transition-all ${
                  open
                    ? "border-amber-300 bg-amber-50 text-amber-800 shadow-[0_0_0_5px_rgba(251,191,36,0.18)] dark:border-amber-700 dark:bg-amber-900/35 dark:text-amber-100"
                    : "border-primary-200 bg-white text-primary-750 hover:border-primary-400 hover:bg-primary-50 dark:border-primary-800 dark:bg-[#102733] dark:text-primary-150"
                }`}
                style={{
                  left: `${node.point.left}%`,
                  top: `${node.point.top}%`,
                }}
                aria-label={`Mở mốc ${node.label}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {open ? "check_circle" : node.icon || "radio_button_checked"}
                </span>
                <span className="line-clamp-2 px-1">{node.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-primary-850/50 dark:bg-[#102733]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
                Đường tiến triển
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600 dark:text-primary-200">
                {instruction ||
                  "Mở từng mốc trên đường xoáy ốc để theo dõi sự phát triển của tư tưởng."}
              </p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/35 dark:text-primary-200">
              {visited.length}/{milestones.length}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-primary-950/25">
            {activeMilestone ? (
              <div>
                <p className="text-lg font-extrabold text-primary-900 dark:text-primary-100">
                  {activeMilestone.label}
                </p>
                {activeMilestone.summary && (
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-700 dark:text-primary-150">
                    {activeMilestone.summary}
                  </p>
                )}
                {activeMilestone.detail && (
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-primary-250">
                    {activeMilestone.detail}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-primary-300">
                Chưa có mốc tiến trình.
              </p>
            )}
          </div>

          {complete && (
            <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
              <p className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined">task_alt</span>
                Đường xoáy ốc đã hoàn chỉnh.
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
      </div>
    </ComponentFrame>
  );
}
