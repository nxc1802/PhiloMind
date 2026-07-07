import React, { useRef, useEffect, useState, useCallback } from "react";

export function ProgressBar({
  progressItems,
  activeIndex,
  completedIds,
  onSelectComponent,
}) {
  const scrollRef = useRef(null);
  const dragStateRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  // Whether the track overflows and can still scroll toward each edge.
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Recompute the two-headed-arrow affordances from the current scroll state.
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  // Auto-scroll the active item to center — but ONLY within this container.
  // Using scrollIntoView would bubble up and scroll every scrollable ancestor
  // (including the window), which shifts the whole page sideways. We compute the
  // target scrollLeft manually so the movement stays inside the progress bar.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeElement = container.querySelector('[data-active="true"]');
    if (!activeElement) {
      updateArrows();
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();
    const elementCenter =
      elementRect.left -
      containerRect.left +
      container.scrollLeft +
      elementRect.width / 2;
    const targetScroll = elementCenter - containerRect.width / 2;

    if (typeof container.scrollTo === "function") {
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    } else {
      container.scrollLeft = targetScroll;
    }
    // Recompute arrow state after the smooth scroll settles.
    const raf = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, updateArrows]);

  // Keep arrow state in sync with scrolling, resizing and content changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, progressItems]);

  const scrollByStep = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.6, 160),
      behavior: "smooth",
    });
  };

  const startDrag = (event) => {
    const el = scrollRef.current;
    if (!el) return;
    if (event.target.closest("[data-progress-component-id]")) return;
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
    };
    el.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    const el = scrollRef.current;
    if (!el || !dragStateRef.current.active) return;
    const distance = event.clientX - dragStateRef.current.startX;
    el.scrollLeft = dragStateRef.current.scrollLeft - distance;
  };

  const endDrag = (event) => {
    const el = scrollRef.current;
    dragStateRef.current.active = false;
    el?.releasePointerCapture?.(event.pointerId);
  };

  const getIcon = (type) => {
    switch (type) {
      case "component_group":
        return "view_agenda";
      case "media":
        return "play_circle";
      case "mcq":
      case "true_false":
        return "quiz";
      case "category_sorting":
      case "target_matching":
      case "matching_columns":
      case "chain_sorting":
      case "map_target_matching":
        return "extension";
      case "progression_spiral":
        return "all_inclusive";
      case "timeline_explorer":
        return "timeline";
      case "hotspot_gallery":
        return "image_search";
      case "knowledge_piece":
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

  // Giới hạn độ dài nhãn để thanh tiến trình gọn gàng, chữ vừa phải; nhãn dài
  // bị cắt bằng dấu … (kết hợp truncate của CSS cho phần hiển thị).
  const MAX_LABEL = 22;
  const getLabel = (component) => {
    const raw =
      component.config?.shortLabel ||
      component.navigation_config?.shortLabel ||
      component.title ||
      "";
    return raw.length > MAX_LABEL ? `${raw.slice(0, MAX_LABEL - 1).trimEnd()}…` : raw;
  };

  return (
    <div className="relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-transparent dark:bg-surface-dark-elevated">
      {/* Left two-headed-arrow affordance — appears only when scrollable left */}
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 rounded-l-3xl bg-gradient-to-r from-white to-transparent dark:from-surface-dark-elevated" />
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            aria-label="Cuộn thanh tiến trình sang trái"
            className="absolute left-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-primary-600 shadow-sm backdrop-blur transition-colors hover:bg-primary-50 dark:border-primary-850/60 dark:bg-surface-dark-elevated/90 dark:text-primary-300 dark:hover:bg-primary-900/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex h-16 touch-pan-x select-none items-center gap-2 overflow-x-auto overscroll-x-contain px-4 py-2 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {progressItems.map(({ component, index }, idx) => {
          const isActive = index === activeIndex;
          const isCompleted = completedIds.includes(component.id);
          const isAccessible = isCompleted || index <= activeIndex;
          const label = getLabel(component);

          return (
            <div
              key={component.id}
              style={{ flex: "0 0 calc((100% - 1.5rem) / 5)" }}
              className="relative flex h-full shrink-0 items-center justify-center px-3"
            >
              <button
                type="button"
                data-active={isActive}
                data-progress-component-id={component.id}
                disabled={!isAccessible && !isActive}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => isAccessible && onSelectComponent(index)}
                className={[
                  "group relative inline-flex h-11 max-w-full items-center justify-center overflow-hidden rounded-full transition-all duration-300",
                  "gap-1.5 border-2 px-3",
                  isActive
                    ? "border-primary-500 bg-primary-50 text-primary-800 shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_14px_30px_rgba(37,99,235,0.22)] ring-2 ring-primary-300 dark:border-primary-300 dark:bg-primary-900/40 dark:text-primary-100 dark:ring-primary-500/50"
                    : isCompleted
                      ? "border-slate-200 bg-white text-primary-600 hover:bg-primary-50 dark:border-slate-700/50 dark:bg-surface-dark-elevated dark:text-slate-300 dark:hover:bg-primary-900/20"
                      : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={component.title}
                aria-label={`Mốc tiến trình: ${component.title}`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70 dark:via-primary-200/10" />
                )}
                <span className="material-symbols-outlined relative z-10 shrink-0 text-[18px]">
                  {isCompleted && !isActive
                    ? "check_circle"
                    : getIcon(component.type)}
                </span>
                <span className="relative z-10 min-w-0 truncate text-[12px] font-bold leading-tight">
                  {label}
                </span>
              </button>

              {idx < progressItems.length - 1 && (
                <span
                  className={[
                    "pointer-events-none absolute right-[-1.15rem] top-1/2 flex w-10 -translate-y-1/2 items-center transition-colors",
                    isCompleted || isActive
                      ? "text-primary-500 dark:text-primary-300"
                      : "text-slate-300 dark:text-slate-600",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <span className="h-[2px] flex-1 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
                  <span className="material-symbols-outlined -ml-1 text-[18px] leading-none">
                    arrow_forward
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Right two-headed-arrow affordance — appears only when scrollable right */}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 rounded-r-3xl bg-gradient-to-l from-white to-transparent dark:from-surface-dark-elevated" />
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            aria-label="Cuộn thanh tiến trình sang phải"
            className="absolute right-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-primary-600 shadow-sm backdrop-blur transition-colors hover:bg-primary-50 dark:border-primary-850/60 dark:bg-surface-dark-elevated/90 dark:text-primary-300 dark:hover:bg-primary-900/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
          </button>
        </>
      )}
    </div>
  );
}
