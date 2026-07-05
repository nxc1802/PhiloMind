import React from "react";

/**
 * ProgressBar — Thanh tiến trình bài học kiểu "chặng".
 *
 * Giao diện mới: header (Quay lại · CHẶNG x/N + tên chặng · số mảnh ghép + reset)
 * và một stepper gồm các vòng tròn đánh số, nhãn nằm ngay bên dưới, nối bằng
 * đường kẻ. Bảng màu và phong cách thiết kế giữ nguyên như hiện tại (theme
 * primary + surface-dark-elevated).
 */
export function ProgressBar({
  progressItems,
  activeIndex,
  completedIds,
  onSelectComponent,
  onBack,
  onReset,
  isResetting = false,
}) {
  const handleBack = () => {
    if (onBack) onBack();
    else if (typeof window !== "undefined") window.history.back();
  };

  const total = progressItems.length;
  const currentNumber = Math.min(Math.max(activeIndex + 1, 1), Math.max(total, 1));
  const activeItem = progressItems.find(({ index }) => index === activeIndex);
  const activeLabel = activeItem ? getLabel(activeItem.component) : "";

  // Số mảnh ghép tri thức đã thu thập (badge "x/N" ở góc phải).
  const knowledgePieces = progressItems.filter(
    ({ component }) => component.type === "knowledge_piece",
  );
  const collectedPieces = knowledgePieces.filter(({ component }) =>
    completedIds.includes(component.id),
  ).length;

  return (
    <div className="relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-transparent dark:bg-surface-dark-elevated">
      {/* Header: Quay lại · CHẶNG x/N · mảnh ghép + reset */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-650 dark:border-transparent dark:bg-slate-900/55 dark:text-primary-250 dark:hover:bg-primary-900/30"
          aria-label="Quay lại"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
            Chặng {currentNumber}/{total}
          </p>
          <p className="truncate text-base font-extrabold leading-tight text-primary-950 dark:text-primary-100">
            {activeLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {knowledgePieces.length > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
              title="Số mảnh ghép tri thức đã thu thập"
            >
              <span className="material-symbols-outlined text-[18px]">extension</span>
              {collectedPieces}/{knowledgePieces.length}
            </span>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={isResetting}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-650 disabled:cursor-wait disabled:opacity-60 dark:border-transparent dark:bg-slate-900/55 dark:text-primary-250 dark:hover:bg-primary-900/30"
              title="Học lại bài này từ đầu"
              aria-label="Học lại bài này từ đầu"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper: vòng tròn đánh số + nhãn bên dưới + đường nối */}
      <div className="flex items-start overflow-x-auto scrollbar-hide px-5 pb-4 pt-3">
        {progressItems.map(({ component, index }, idx) => {
          const isActive = index === activeIndex;
          const isCompleted = completedIds.includes(component.id);
          const isAccessible = isCompleted || index <= activeIndex;
          const label = getLabel(component);
          // Đường nối tô sáng khi mốc bên trái đã đạt tới.
          const connectorReached = index < activeIndex || isCompleted;

          return (
            <React.Fragment key={component.id}>
              <div className="flex shrink-0 flex-col items-center gap-2">
                <button
                  type="button"
                  data-active={isActive}
                  disabled={!isAccessible && !isActive}
                  onClick={() => isAccessible && onSelectComponent(index)}
                  aria-label={`Chặng ${idx + 1}: ${component.title}`}
                  title={component.title}
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-all duration-300",
                    isActive
                      ? "border-primary-600 bg-primary-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_10px_24px_rgba(37,99,235,0.22)] scale-105 dark:border-primary-400 dark:bg-primary-500"
                      : isCompleted
                        ? "border-primary-500 bg-primary-500 text-white hover:brightness-110 dark:border-primary-400 dark:bg-primary-500"
                        : "cursor-not-allowed border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isCompleted && !isActive ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : (
                    idx + 1
                  )}
                </button>
                <span
                  className={[
                    "w-20 text-center text-[11px] font-bold leading-tight",
                    isActive
                      ? "text-primary-800 dark:text-primary-200"
                      : isCompleted
                        ? "text-primary-600 dark:text-primary-300"
                        : "text-slate-400 dark:text-slate-500",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>

              {idx < progressItems.length - 1 && (
                <span
                  aria-hidden="true"
                  className={[
                    "mt-5 h-[2px] min-w-[1.5rem] flex-1 rounded-full transition-colors duration-300",
                    connectorReached
                      ? "bg-primary-500 dark:bg-primary-400"
                      : "bg-slate-200 dark:bg-slate-700",
                  ].join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function getLabel(component) {
  return (
    component.config?.shortLabel ||
    component.navigation_config?.shortLabel ||
    component.title
  );
}
