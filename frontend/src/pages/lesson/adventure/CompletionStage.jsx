import React from "react";

export default function CompletionStage({ score, total, completionData, xpReward, badgeReward, onReplay, onBackToMindmap }) {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-[#0A3CA0] via-[#062E81] to-[#041C52] text-white text-center animate-fadeIn">
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl" />

      <div className="relative p-8 md:p-10">
        <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#002b37]/15 border border-white/25 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-6">
          <span className="material-symbols-outlined text-base">verified</span>
          Hoàn thành hành trình
        </div>

        <div className="flex flex-col items-center j-unlock">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-2xl ring-4 ring-white/25">
            <span className="material-symbols-outlined text-5xl text-white">military_tech</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-blue-100 mt-4 font-bold">Huy hiệu đạt được</p>
          <h2 className="text-3xl font-bold mt-1">{completionData?.badge || badgeReward}</h2>
          <p className="text-white/75 text-sm">{completionData?.badgeNote || "Hành trình hoàn thành!"}</p>
        </div>

        <div className="bg-white dark:bg-[#002b37]/12 border border-white/20 backdrop-blur rounded-3xl px-6 py-4 mt-6 inline-block">
          <p className="text-sm text-blue-50/90">Kết quả kiểm tra</p>
          <p className="text-2xl font-bold tabular-nums">{score}/{total} câu đúng ngay lần đầu</p>
        </div>

        <p className="max-w-xl mx-auto text-white/90 leading-relaxed mt-6">{completionData?.message || "Chúc mừng đồng chí đã hoàn thành xuất sắc!"}</p>

        {completionData?.quote && (
          <blockquote className="max-w-lg mx-auto border-l-4 border-amber-300 pl-4 text-left mt-6 italic text-white/90 font-serif">
            "{completionData.quote.text}"
            <footer className="text-sm text-amber-200 not-italic mt-1">— {completionData.quote.author}</footer>
          </blockquote>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-[#002b37]/15 border border-white/30 text-white px-6 py-3 rounded-3xl font-bold hover:bg-white dark:bg-[#002b37]/25 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-base">replay</span>
            Chơi lại hành trình
          </button>

          <button
            type="button"
            onClick={onBackToMindmap}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-orange-400 text-blue-950 px-6 py-3 rounded-3xl font-bold hover:from-amber-400 hover:to-orange-500 transition-colors shadow-lg active:scale-95"
          >
            Hoàn thành & Quay lại sơ đồ
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
