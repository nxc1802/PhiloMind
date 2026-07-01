import React, { useState } from "react";
import { getSlugFromTitle } from "../../../utils/slug";

// Status config cho từng bài học trong course content
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

// Component flow item type icons
const COMPONENT_TYPE_ICONS = {
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
 * LeftPanel — Cột trái trong layout 3 cột của lesson.
 * Gồm 2 phần:
 * 1. Course Content: danh sách bài học trong chương
 * 2. Component Flow: timeline tiến trình component trong bài học hiện tại
 */
export function LeftPanel({
  // Course content props
  flatSyllabusItems,
  progressStats,
  lessonSlug,
  handleSyllabusClick,
  currentNodeDetails,
  // Component flow props
  flow,           // array of normalized flow components
  activeIndex,    // index of currently active component
  completedIds,   // array of completed component IDs
  onSelectComponent, // callback(index) khi click vào component trong flow
}) {
  const [activeTab, setActiveTab] = useState("flow"); // "course" | "flow"
  const documents = currentNodeDetails?.chapter?.course?.documents || [];

  const handlePdfClick = () => {
    if (documents.length === 0) return;
    if (documents.length === 1) {
      window.open(documents[0].fileUrl, "_blank");
    }
  };

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-surface-dark-elevated border-r border-slate-200 dark:border-primary-850/50 overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-slate-200 dark:border-primary-850/50 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("flow")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "flow"
              ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-900/20"
              : "text-slate-500 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-primary-900/10"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            account_tree
          </span>
          Bài học
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("course")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "course"
              ? "border-b-2 border-primary-600 text-primary-600 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-900/20"
              : "text-slate-500 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-primary-900/10"
          }`}
        >
          <span className="material-symbols-outlined text-base">menu_book</span>
          Chương
        </button>
      </div>

      {/* Tab: Component Flow */}
      {activeTab === "flow" && (
        <div className="flex-1 overflow-y-auto">
          {/* Progress header */}
          <div className="p-3 border-b border-slate-100 dark:border-primary-900/20 bg-primary-50 dark:bg-primary-950/30">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary-600 dark:text-primary-300">
                Tiến trình
              </p>
              <p className="text-[10px] font-bold text-primary-700 dark:text-primary-200">
                {completedIds?.length || 0}/{flow?.length || 0}
              </p>
            </div>
            <div className="h-1.5 bg-white dark:bg-primary-950/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{
                  width:
                    flow?.length
                      ? `${((completedIds?.length || 0) / flow.length) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {/* Flow steps */}
          <div className="p-2 space-y-1">
            {(flow || []).map((component, index) => {
              const isActive = index === activeIndex;
              const isDone = completedIds?.includes(component.id);
              const isPast = index < (activeIndex || 0);
              const typeIcon =
                COMPONENT_TYPE_ICONS[component.type] || "widgets";

              return (
                <button
                  key={component.id}
                  type="button"
                  onClick={() => onSelectComponent?.(index)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border text-left transition-all ${
                    isActive
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/40 shadow-sm"
                      : isDone
                        ? "border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/15 hover:bg-green-50 dark:hover:bg-green-950/25 cursor-pointer"
                        : isPast
                          ? "border-slate-200 dark:border-primary-850/50 bg-slate-50 dark:bg-primary-950/20 hover:bg-slate-100 cursor-pointer"
                          : "border-slate-150 dark:border-primary-900/30 bg-white dark:bg-transparent opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Status icon */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : isDone
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-slate-100 dark:bg-primary-900/30 text-slate-400 dark:text-primary-500"
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

                  {/* Label */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold truncate ${
                        isActive
                          ? "text-primary-800 dark:text-primary-100"
                          : isDone
                            ? "text-green-800 dark:text-green-200"
                            : "text-slate-600 dark:text-primary-300"
                      }`}
                    >
                      {component.title || component.type}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-primary-500 uppercase tracking-wide">
                      {String(component.type).replaceAll("_", " ")}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <span className="material-symbols-outlined text-base text-primary-600 dark:text-primary-300 shrink-0">
                      arrow_right
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Course Content */}
      {activeTab === "course" && (
        <div className="flex-1 overflow-y-auto">
          {/* Progress header */}
          <div className="p-3 border-b border-slate-100 dark:border-primary-900/20 bg-primary-600">
            <p className="text-xs font-bold text-white mb-1.5">
              Nội dung khóa học
            </p>
            <div className="h-1.5 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressStats?.percentage || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-white/80 mt-1">
              {progressStats?.completed || 0}/{progressStats?.total || 0} bài ({progressStats?.percentage || 0}%)
            </p>
          </div>

          {/* Lesson list */}
          <div className="p-2 space-y-1">
            {(flatSyllabusItems || []).map((item, index) => {
              const config =
                STATUS_CONFIG[item.status] || STATUS_CONFIG.locked;
              const isActiveLesson =
                getSlugFromTitle(item.title) === lessonSlug;
              return (
                <button
                  key={index}
                  onClick={() => handleSyllabusClick?.(item)}
                  type="button"
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-left text-xs ${config.className} ${
                    isActiveLesson
                      ? "ring-2 ring-primary-600 ring-offset-1 font-bold"
                      : ""
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {config.icon}
                  </span>
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.status === "content_locked" && (
                    <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">
                      Sắp có
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* PDF link */}
          {documents.length > 0 && (
            <div className="p-3 border-t border-slate-100 dark:border-primary-900/20">
              <button
                type="button"
                onClick={handlePdfClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-xs font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-base">
                  picture_as_pdf
                </span>
                Tài liệu PDF
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
