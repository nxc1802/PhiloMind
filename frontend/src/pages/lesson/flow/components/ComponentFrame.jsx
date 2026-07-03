import React from "react";

const TYPE_ICONS = {
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

/**
 * Shared wrapper frame for all lesson flow components.
 * Renders the component header (type label, icon, title) and wraps children.
 */
export function ComponentFrame({ component, children, className = "" }) {
  const safeComponent = component || {};
  const typeLabel = String(safeComponent.type || "lesson_flow").replaceAll(
    "_",
    " ",
  );
  const typeIcon = TYPE_ICONS[safeComponent.type] || "widgets";

  return (
    <section className={`bg-white text-slate-900 dark:bg-[#0f2530] dark:text-primary-100 rounded-2xl shadow-md border border-slate-200 dark:border-primary-800 p-3 flex flex-col h-full min-h-0 ${className}`}>
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <span className="material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-650 dark:bg-primary-900/35 dark:text-primary-300 text-lg">
          {typeIcon}
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-primary-650 dark:text-primary-300 font-bold leading-none mb-0.5">
            {typeLabel}
          </p>
          <h2 className="text-base font-bold text-primary-900 dark:text-primary-100 leading-tight">
            {safeComponent.title || "Hoạt động bài học"}
          </h2>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0 pr-2">
        {children}
      </div>
    </section>
  );
}
