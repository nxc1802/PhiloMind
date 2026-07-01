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
  const activeMedia = lessonMedia?.find((m) => m.id === activeMediaId)
    ?? lessonMedia?.[0];

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
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0a1e28] overflow-hidden">
      {/* Main media display */}
      <div className="flex-1 flex flex-col justify-start overflow-y-auto">
        {activeMedia ? (
          <div className="p-3">
            {activeMedia.type === "video" ? (
              <VideoScene
                src={activeMedia.url}
                badge={activeMedia.badge}
                title={activeMedia.title}
                subtitle={activeMedia.subtitle}
                autoPlay={autoplayVideo}
              />
            ) : (
              <figure className="overflow-hidden rounded-2xl border border-slate-200 dark:border-primary-850 bg-white dark:bg-primary-950/30">
                <img
                  src={activeMedia.url}
                  alt={activeMedia.alt || activeMedia.title || "Hình ảnh bài học"}
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

            {activeMedia.description && (
              <p className="mt-3 text-sm text-slate-600 dark:text-primary-200 leading-relaxed px-1">
                {activeMedia.description}
              </p>
            )}
          </div>
        ) : null}

        {/* Media selector — chỉ hiện nếu có nhiều hơn 1 media */}
        {lessonMedia.length > 1 && (
          <div className="p-3 border-t border-slate-200 dark:border-primary-850 mt-auto shrink-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-primary-500 mb-2">
              Nội dung trực quan
            </p>
            <div className="flex flex-col gap-1.5">
              {lessonMedia.map((media) => {
                const isSelected = media.id === (activeMedia?.id);
                return (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => onSelectMedia?.(media.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary-400 bg-primary-50 dark:bg-primary-900/40 text-primary-800 dark:text-primary-100"
                        : "border-slate-200 dark:border-primary-850 hover:border-primary-300 dark:hover:border-primary-700 text-slate-600 dark:text-primary-300 hover:bg-white dark:hover:bg-primary-950/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base shrink-0">
                      {media.type === "video" ? "play_circle" : "image"}
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {media.title || (media.type === "video" ? "Video" : "Hình ảnh")}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-sm text-primary-600 dark:text-primary-300 ml-auto shrink-0">
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
    </div>
  );
}
