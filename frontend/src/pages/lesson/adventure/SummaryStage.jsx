import React from "react";
import { SceneBanner } from "./components/AdventureCommon";

export default function SummaryStage({ summaryData, merged, onMerge, onComplete }) {
  if (!merged) {
    return (
      <div className="animate-fadeIn">
        <SceneBanner scene="synthesis" badge="Hợp nhất tri thức" title={summaryData?.title || "Hợp nhất tri thức"} />
        <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 md:p-8 text-center">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white items-center justify-center shadow-lg j-glow">
            <span className="material-symbols-outlined text-4xl">extension</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-primary-850 dark:text-primary-100 mt-4">
            Bạn đã thu thập đủ 2 mảnh ghép tri thức!
          </h3>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Hãy ghép hai mảnh <strong>Nguồn gốc nhận thức</strong> và{" "}
            <strong>Nguồn gốc xã hội</strong> lại với nhau để hé lộ bức tranh hoàn chỉnh về
            nguồn gốc của Triết học.
          </p>
          <button
            type="button"
            onClick={onMerge}
            className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-3xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined">join_full</span>
            Ghép 2 mảnh tri thức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <SceneBanner scene="synthesis" badge="Đúc kết hoàn chỉnh" title={summaryData?.title || "Hợp nhất tri thức"} />
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100/10 border border-primary-100 dark:border-primary-850 rounded-3xl p-6 md:p-7 shadow-md j-unlock text-left">
        <div className="text-center">
          <div className="inline-block rounded-3xl px-6 py-4 text-white bg-gradient-to-br from-primary-700 to-primary-900 shadow-lg j-glow">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <p className="font-bold text-xl mt-1">{summaryData?.center}</p>
            <p className="text-xs text-white/80 mt-0.5">{summaryData?.centerNote}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          {(summaryData?.branches || []).map((b) => (
            <div
              key={b.id}
              className={`rounded-3xl p-4 text-white bg-gradient-to-br ${b.color} shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">{b.icon}</span>
                <h4 className="font-bold">{b.title}</h4>
              </div>
              <ul className="space-y-1.5 text-sm text-white/90">
                {(b.points || []).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-sm mt-0.5">chevron_right</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white dark:bg-[#002b37] border-l-4 border-primary-600 rounded-r-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-primary-700 dark:text-primary-300 font-bold mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Đúc kết hoàn chỉnh
          </p>
          <p className="text-gray-800 leading-relaxed">{summaryData?.finalStatement}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-6 py-3 rounded-3xl font-bold hover:bg-primary-700 transition-colors shadow-md active:scale-95"
          >
            Làm bài kiểm tra tổng kết
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
