import React from "react";

export function MilestoneBar({ flow, completedIds, activeIndex }) {
  const knowledgePieces = flow.filter(
    (component) => component.type === "knowledge_piece",
  );
  const milestones =
    knowledgePieces.length > 0
      ? knowledgePieces
      : flow.filter((component) => component.config?.isMilestone === true);

  if (milestones.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-primary-850/50 bg-white/50 dark:bg-[#0a1e28]/50 rounded-t-3xl">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-primary-400 flex-shrink-0">
        Mảnh ghép
      </span>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 flex-1 py-3 -my-3 px-2 -mx-2">
        {milestones.map((milestone) => {
          const isCompleted = completedIds.includes(milestone.id);
          const pieceId = milestone.config?.pieceId || milestone.id;
          const milestoneIndex = flow.findIndex(
            (component) => component.id === milestone.id,
          );
          const isActive = milestoneIndex === activeIndex;

          return (
            <div
              key={milestone.id}
              data-piece-target="true"
              data-piece-id={pieceId}
              className={[
                "relative flex h-9 shrink-0 items-center justify-center rounded-xl border-2 px-3 gap-1.5 transition-all duration-500",
                isActive
                  ? "border-amber-400 bg-amber-50 text-amber-800 shadow-[0_0_0_4px_rgba(251,191,36,0.18),0_0_18px_rgba(251,191,36,0.45)] dark:bg-amber-900/45 dark:text-amber-100"
                  : isCompleted
                    ? "border-amber-400 bg-amber-50 text-amber-700 shadow-[0_0_12px_rgba(251,191,36,0.4)] dark:bg-amber-900/40 dark:text-amber-300 dark:shadow-[0_0_12px_rgba(251,191,36,0.2)] z-10"
                    : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-500",
              ]
                .filter(Boolean)
                .join(" ")}
              title={milestone.title}
            >
              <span
                className={[
                  "piece-target-icon material-symbols-outlined text-[18px] transition-all duration-500",
                  isCompleted || isActive
                    ? "text-amber-500 dark:text-amber-300 animate-pulse"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {milestone.config?.icon || "extension"}
              </span>
              <span className="text-xs font-bold whitespace-nowrap">
                {milestone.config?.shortLabel || milestone.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
