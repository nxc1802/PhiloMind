import React from "react";

export function MilestoneBar({ flow, completedIds }) {
  // Extract milestones from flow
  const milestones = flow.filter(
    (component) => component.config?.isMilestone === true
  );

  if (milestones.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-primary-850/50 bg-white/50 dark:bg-[#0a1e28]/50 rounded-t-3xl">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-primary-400 flex-shrink-0">
        Mảnh ghép
      </span>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 flex-1 py-3 -my-3 px-2 -mx-2">
        {milestones.map((milestone) => {
          const isCompleted = completedIds.includes(milestone.id);

          return (
            <div
              key={milestone.id}
              className={[
                "relative flex h-9 shrink-0 items-center justify-center rounded-xl border-2 px-3 gap-1.5 transition-all duration-500",
                isCompleted
                  ? "border-amber-400 bg-amber-50 text-amber-700 shadow-[0_0_12px_rgba(251,191,36,0.4)] dark:bg-amber-900/40 dark:text-amber-300 dark:shadow-[0_0_12px_rgba(251,191,36,0.2)] z-10"
                  : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-500"
              ].filter(Boolean).join(" ")}
              title={milestone.title}
            >
              <span 
                className={[
                  "material-symbols-outlined text-[18px] transition-all duration-500",
                  isCompleted ? "text-amber-500 dark:text-amber-400 animate-pulse" : ""
                ].filter(Boolean).join(" ")}
                style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                extension
              </span>
              <span className="text-xs font-bold whitespace-nowrap">
                {milestone.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
