import React, { useMemo } from "react";
import { SceneArt } from "../../components/JourneyArt";

export const STAGES = ["intro", "cognitive", "social", "summary", "quiz", "done"];
export const STAGE_LABELS = {
  intro: "Khởi hành",
  cognitive: "Nhận thức",
  social: "Xã hội",
  summary: "Hợp nhất",
  quiz: "Tổng kết",
  done: "Hoàn thành",
};

export function SceneBanner({ scene, badge, title, subtitle }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-md mb-5 h-24 md:h-32">
      <SceneArt scene={scene} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3.5 md:p-4 text-white text-left">
        {badge && (
          <span className="inline-block bg-white dark:bg-[#002b37]/20 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
            {badge}
          </span>
        )}
        <h2 className="text-lg md:text-2xl font-bold drop-shadow leading-tight">{title}</h2>
        {subtitle && <p className="text-white/85 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

export function VideoScene({ src, badge, title, subtitle, muted = true, autoPlay = true }) {
  const getYoutubeId = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const ytId = getYoutubeId(src);

  return (
    <div className="rounded-3xl overflow-hidden shadow-md mb-5 bg-black">
      <div className="relative w-full aspect-video bg-black">
        {ytId ? (
          <iframe
            title={title}
            width="100%"
            height="100%"
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <video
            ref={(el) => {
              if (el) el.muted = muted;
            }}
            src={src}
            controls
            autoPlay={autoPlay}
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        )}
        {badge && (
          <span className="absolute top-3 left-3 inline-block bg-black/55 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
            {badge}
          </span>
        )}
      </div>
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 md:px-5 py-2.5 text-white text-left">
        <h2 className="text-base md:text-xl font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-white/80 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

export function PieceReward({ label, onNext }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-center text-white shadow-xl j-unlock">
      <span className="material-symbols-outlined text-5xl">extension</span>
      <p className="text-sm uppercase tracking-wider font-semibold mt-1 opacity-90">
        Mảnh ghép tri thức
      </p>
      <p className="text-2xl font-bold mt-1 mb-4">{label}</p>
      <button
        type="button"
        onClick={onNext}
        className="bg-white dark:bg-[#002b37] text-orange-700 px-6 py-2.5 rounded-3xl font-bold hover:bg-orange-50 transition-colors inline-flex items-center gap-1.5"
      >
        Tiếp tục hành trình
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
}

export function JourneyHeader({ stage, pieces, onBack, onReset }) {
  const steps = STAGES.slice(0, 5);
  const activeIndex = STAGES.indexOf(stage);
  const canGoBack = activeIndex > 0;
  const currentLabel = STAGE_LABELS[steps[Math.min(activeIndex, steps.length - 1)]];

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-4 md:p-5 mb-6 text-left">
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          title="Quay lại chặng trước"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-3xl text-sm font-bold border-2 transition-all ${
            canGoBack
              ? "border-primary-800 text-primary-650 dark:text-primary-300 bg-white dark:bg-[#002b37] hover:bg-primary-600 hover:text-white shadow-sm active:scale-95"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        <div className="text-center min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">
            Chặng {Math.min(activeIndex + 1, steps.length)}/{steps.length}
          </p>
          <p className="text-sm md:text-base font-bold text-primary-850 dark:text-primary-100 truncate leading-tight mt-0.5">
            {currentLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full"
            title="Mảnh ghép tri thức đã thu thập"
          >
            <span className="material-symbols-outlined text-amber-600 text-base">extension</span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">
              {pieces.length}/2
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="Bắt đầu lại từ đầu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-600 border border-gray-200 hover:border-primary-600 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
      </div>

      <div className="flex items-start">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-14 md:w-16">
                <div
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    done
                      ? "bg-green-500 text-white shadow-sm"
                      : active
                      ? "bg-primary-600 text-white ring-4 ring-primary-100 shadow-md scale-110"
                      : "bg-white dark:bg-[#002b37] text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-lg">check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[11px] md:text-xs font-semibold text-center leading-tight ${
                    active ? "text-primary-650 dark:text-primary-300" : done ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {STAGE_LABELS[s]}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden mt-[15px] md:mt-[17px]">
                  <div
                    className={`h-full rounded-full bg-green-500 transition-all duration-500 ${
                      done ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
