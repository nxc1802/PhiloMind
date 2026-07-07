import React from "react";
import { VideoScene } from "../adventure/components/AdventureCommon";
import { loadSettings } from "../../../utils/settings";
import { resolveBackendAssetUrl } from "../../../services/api";

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
  const activeMediaUrl = resolveBackendAssetUrl(activeMedia?.url);

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
                src={activeMediaUrl}
                badge={activeMedia.badge}
                title={activeMedia.title}
                subtitle={activeMedia.subtitle}
                autoPlay={autoplayVideo}
                className="mb-0"
              />
            ) : (
              <figure className="overflow-hidden rounded-2xl border border-slate-200 dark:border-primary-850 bg-white dark:bg-primary-950/30">
                <img
                  src={activeMediaUrl}
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

    </div>
  );
}
