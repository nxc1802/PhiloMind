import React, { useRef, useEffect } from "react";

export function ProgressBar({
  progressItems,
  activeIndex,
  completedIds,
  onSelectComponent,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll the active item to center — but ONLY within this container.
  // Using scrollIntoView would bubble up and scroll every scrollable ancestor
  // (including the window), which shifts the whole page sideways. We compute the
  // target scrollLeft manually so the movement stays inside the progress bar.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeElement = container.querySelector('[data-active="true"]');
    if (!activeElement) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();
    const elementCenter =
      elementRect.left - containerRect.left + container.scrollLeft + elementRect.width / 2;
    const targetScroll = elementCenter - containerRect.width / 2;

    container.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [activeIndex]);

  const getIcon = (type) => {
    switch (type) {
      case "media":
        return "play_circle";
      case "mcq":
      case "true_false":
        return "quiz";
      case "category_sorting":
      case "target_matching":
      case "matching_columns":
      case "chain_sorting":
        return "extension";
      case "mindmap_reveal":
      case "dialogue":
        return "hub";
      case "final_summary":
        return "workspace_premium";
      default:
        return "article";
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-primary-850/50 dark:bg-surface-dark-elevated">
      <div
        ref={scrollRef}
        className="flex h-16 items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-hide snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {progressItems.map(({ component, index }, idx) => {
          const isActive = index === activeIndex;
          const isCompleted = completedIds.includes(component.id);
          const isAccessible = isCompleted || index <= activeIndex;

          return (
            <React.Fragment key={component.id}>
              {idx > 0 && (
                <div 
                  className={[
                    "h-0.5 w-8 shrink-0 transition-colors duration-300",
                    isAccessible ? "bg-primary-500" : "bg-slate-200 dark:bg-slate-700"
                  ].filter(Boolean).join(" ")} 
                />
              )}
              <button
                type="button"
                data-active={isActive}
                disabled={!isAccessible && !isActive}
                onClick={() => isAccessible && onSelectComponent(index)}
                className={[
                  "snap-center group relative flex shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  "h-10 px-4 gap-2 border-2",
                  isActive
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-400 scale-105"
                    : isCompleted
                      ? "border-primary-500 bg-white text-primary-600 dark:bg-surface-dark-elevated dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500 cursor-not-allowed"
                ].filter(Boolean).join(" ")}
                title={component.title}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCompleted && !isActive ? "check_circle" : getIcon(component.type)}
                </span>
                {(isActive || isCompleted) && (
                  <span className="max-w-[120px] truncate text-xs font-semibold">
                    {component.title}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
