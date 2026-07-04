import React from "react";
import { getSlugFromTitle } from "../../../utils/slug";

const STATUS_CONFIG = {
  completed: {
    icon: "check_circle",
    className:
      "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30 cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/30",
  },
  active: {
    icon: "play_circle",
    className:
      "bg-primary-50 dark:bg-primary-900/30 text-primary-750 dark:text-primary-300 border-primary-250 dark:border-primary-800/50 font-semibold cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50",
  },
  locked: {
    icon: "lock",
    className:
      "bg-gray-50 dark:bg-primary-900/10 text-gray-400 dark:text-primary-600 border-gray-200 dark:border-primary-950/30 cursor-not-allowed opacity-60",
  },
  content_locked: {
    icon: "lock_clock",
    className:
      "bg-gray-50 dark:bg-primary-900/10 text-gray-400 dark:text-primary-600 border-gray-200 dark:border-primary-950/30 cursor-not-allowed opacity-60",
  },
};

const COMPONENT_TYPE_ICONS = {
  component_group: "view_agenda",
  media: "play_circle",
  dialogue: "forum",
  markdown: "menu_book",
  mcq: "quiz",
  quiz_sequence: "quiz",
  multi_select: "checklist",
  true_false: "rule",
  matching_columns: "conversion_path",
  category_sorting: "category",
  target_matching: "ads_click",
  mindmap_reveal: "hub",
  sequence_sorting: "format_list_numbered",
  final_summary: "military_tech",
};

function Panel({ icon, title, subtitle, children, className = "" }) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-primary-850/50 dark:bg-surface-dark-elevated ${className}`}
    >
      <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-primary-850/50">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-650 dark:bg-primary-900/35 dark:text-primary-250">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-primary-900 dark:text-primary-100">
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 text-[11px] font-semibold text-slate-400 dark:text-primary-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

export function LeftPanel({
  flatSyllabusItems,
  progressStats,
  lessonSlug,
  handleSyllabusClick,
  currentNodeDetails,
  progressItems,
  activeIndex,
  completedIds,
  onSelectComponent,
}) {
  const completedMilestones = (progressItems || []).filter(({ component }) =>
    completedIds?.includes(component.id),
  ).length;

  return (
    <aside className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1.08fr)] gap-3">
      <Panel
        icon="menu_book"
        title="Nội dung khóa học"
        subtitle={`${progressStats?.completed || 0}/${progressStats?.total || 0} bài - ${progressStats?.percentage || 0}%`}
      >
        <div className="shrink-0 border-b border-slate-100 px-4 pb-3 pt-1 dark:border-primary-850/50">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-primary-950/50">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${progressStats?.percentage || 0}%` }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3 pt-3">
          {(flatSyllabusItems || []).map((item, index) => {
            const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.locked;
            const isActiveLesson = getSlugFromTitle(item.title) === lessonSlug;

            return (
              <button
                key={`${item.id || item.title}-${index}`}
                onClick={() => handleSyllabusClick?.(item)}
                type="button"
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs ${config.className} ${
                  isActiveLesson
                    ? "ring-2 ring-primary-600 ring-offset-1 dark:ring-offset-[#0D1117]"
                    : ""
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {config.icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.status === "content_locked" && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide opacity-70">
                    Sắp có
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        icon="account_tree"
        title="Nội dung bài học"
        subtitle={`${completedMilestones}/${progressItems?.length || 0} mốc chính`}
      >
        <div className="shrink-0 border-b border-slate-100 px-4 pb-3 pt-1 dark:border-primary-850/50">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-primary-950/50">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-500"
              style={{
                width: progressItems?.length
                  ? `${(completedMilestones / progressItems.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3 pt-3">
          {(progressItems || []).map(({ component, index }) => {
            const isActive = index === activeIndex;
            const isDone = completedIds?.includes(component.id);
            const isPast = index < (activeIndex || 0);
            const typeIcon = COMPONENT_TYPE_ICONS[component.type] || "widgets";

            return (
              <button
                key={component.id}
                type="button"
                onClick={() => {
                  if (isDone || isPast || isActive) onSelectComponent?.(index);
                }}
                className={`flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "border-primary-400 bg-primary-50 shadow-sm dark:bg-primary-900/40"
                    : isDone
                      ? "cursor-pointer border-green-200 bg-green-50/50 hover:bg-green-50 dark:border-green-800/40 dark:bg-green-950/15 dark:hover:bg-green-950/25"
                      : isPast
                        ? "cursor-pointer border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-primary-850/50 dark:bg-primary-950/20"
                        : "cursor-not-allowed border-slate-150 bg-white opacity-60 dark:border-primary-900/30 dark:bg-transparent"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : isDone
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-slate-100 text-slate-400 dark:bg-primary-900/30 dark:text-primary-500"
                  }`}
                >
                  {isDone && !isActive ? (
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">
                      {typeIcon}
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs font-bold ${
                      isActive
                        ? "text-primary-800 dark:text-primary-100"
                        : isDone
                          ? "text-green-800 dark:text-green-200"
                          : "text-slate-600 dark:text-primary-300"
                    }`}
                  >
                    {component.title || component.type}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-primary-500">
                    {String(component.type).replaceAll("_", " ")}
                  </p>
                </div>

                {isActive && (
                  <span className="material-symbols-outlined shrink-0 text-base text-primary-600 dark:text-primary-300">
                    arrow_right
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>
    </aside>
  );
}
