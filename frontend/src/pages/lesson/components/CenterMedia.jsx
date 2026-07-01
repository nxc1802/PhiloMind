import React from "react";
import { VideoScene } from "../adventure/components/AdventureCommon";
import { loadSettings } from "../../../utils/settings";

/**
 * CenterMedia — Cột giữa trong layout 3 cột.
 * Hiển thị video hoặc hình ảnh chính của bài học.
 * Khi lesson không có lessonMedia, hiển thị placeholder thông báo.
 */
export function CenterMedia({ lessonMedia, activeMediaId, onSelectMedia }) {
  const { autoplayVideo } = loadSettings();

  // Tìm media item đang active
  const activeMedia =
    lessonMedia?.find((m) => m.id === activeMediaId) ?? lessonMedia?.[0];

  if (!lessonMedia || lessonMedia.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-primary-950/20 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-primary-700 mb-3">
          play_circle
        </span>
        <p className="text-sm font-semibold text-slate-500 dark:text-primary-400">
          Bài học này chưa có video / hình ảnh.
        </p>
        <p className="text-xs text-slate-400 dark:text-primary-500 mt-1">
          Hãy hoàn thành các hoạt động ở cột bên phải.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto bg-slate-50 p-3 dark:bg-[#0a1e28]">
      {/* Main media display */}
      <div className="min-h-0 shrink-0">
        {activeMedia ? (
          <>
            {activeMedia.type === "video" ? (
              <VideoScene
                src={activeMedia.url}
                badge={activeMedia.badge}
                title={activeMedia.title}
                subtitle={activeMedia.subtitle}
                autoPlay={autoplayVideo}
                className="mb-0"
              />
            ) : (
              <figure className="overflow-hidden rounded-2xl border border-slate-200 dark:border-primary-850 bg-white dark:bg-primary-950/30">
                <img
                  src={activeMedia.url}
                  alt={
                    activeMedia.alt || activeMedia.title || "Hình ảnh bài học"
                  }
                  className="w-full max-h-[360px] object-contain"
                />
                {(activeMedia.title || activeMedia.subtitle) && (
                  <figcaption className="border-t border-slate-200 dark:border-primary-850 px-4 py-3 text-sm text-slate-600 dark:text-primary-200">
                    {activeMedia.title && (
                      <p className="font-bold text-slate-900 dark:text-primary-100">
                        {activeMedia.title}
                      </p>
                    )}
                    {activeMedia.subtitle && <p>{activeMedia.subtitle}</p>}
                  </figcaption>
                )}
              </figure>
            )}
          </>
        ) : null}
      </div>

      {activeMedia?.description && (
        <p className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 dark:border-primary-850 dark:bg-primary-950/30 dark:text-primary-200">
          {activeMedia.description}
        </p>
      )}

      {/* Media selector — chỉ hiện nếu có nhiều hơn 1 media */}
      {lessonMedia.length > 1 && (
        <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 dark:border-primary-850 dark:bg-primary-950/25">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-primary-500">
            Nội dung trực quan
          </p>
          <div className="grid gap-1.5 xl:grid-cols-2">
            {lessonMedia.map((media) => {
              const isSelected = media.id === activeMedia?.id;
              return (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => onSelectMedia?.(media.id)}
                  className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                    isSelected
                      ? "border-primary-400 bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-100"
                      : "border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50 dark:border-primary-850 dark:text-primary-300 dark:hover:border-primary-700 dark:hover:bg-primary-950/30"
                  }`}
                >
                  <span className="material-symbols-outlined shrink-0 text-base">
                    {media.type === "video" ? "play_circle" : "image"}
                  </span>
                  <span className="min-w-0 truncate text-xs font-semibold">
                    {media.title ||
                      (media.type === "video" ? "Video" : "Hình ảnh")}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined ml-auto shrink-0 text-sm text-primary-600 dark:text-primary-300">
                      visibility
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
