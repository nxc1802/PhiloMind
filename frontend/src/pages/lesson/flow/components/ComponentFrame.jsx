import React from "react";
import { ComponentMediaBlock } from "./ComponentImage";

const TYPE_ICONS = {
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
  chain_sorting: "conversion_path",
  knowledge_piece: "extension",
  map_target_matching: "travel_explore",
  progression_spiral: "all_inclusive",
  timeline_explorer: "timeline",
  hotspot_gallery: "image_search",
  final_summary: "military_tech",
};

/**
 * Shared wrapper frame for all lesson flow components.
 * Renders a compact component header and wraps scrollable component content.
 */
export function ComponentFrame({
  component,
  children,
  className = "",
  embedded = false,
}) {
  const safeComponent = component || {};
  const isEmbedded = embedded || safeComponent.__isEmbedded === true;
  const typeIcon = TYPE_ICONS[safeComponent.type] || "widgets";

  if (isEmbedded) {
    return (
      <div className={`flex min-h-0 flex-col ${className}`}>{children}</div>
    );
  }

  return (
    <section
      className={`flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-md dark:border-transparent dark:bg-[#0f2530] dark:text-primary-100 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <span className="material-symbols-outlined flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-650 dark:bg-primary-900/35 dark:text-primary-300 text-lg">
          {typeIcon}
        </span>
        <div>
          <h2 className="text-base font-bold text-primary-900 dark:text-primary-100 leading-tight">
            {safeComponent.title || "Hoạt động bài học"}
          </h2>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-2">
        <ComponentMediaBlock component={safeComponent} />
        {children}
      </div>
    </section>
  );
}
