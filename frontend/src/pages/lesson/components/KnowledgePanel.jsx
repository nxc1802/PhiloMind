import React from "react";

function PieceSlot({ branch, index, collected, active }) {
  if (!branch) return null;
  if (collected) {
    return (
      <div className={`rounded-xl p-3.5 text-white bg-gradient-to-br ${branch.color || "from-gray-700 to-gray-900"} shadow-sm j-unlock text-left`}>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <span className="material-symbols-outlined">{branch.icon}</span>
          <h4 className="font-bold text-sm leading-tight">{branch.title}</h4>
          <span className="material-symbols-outlined ml-auto text-white/90">check_circle</span>
        </div>
        <p className="text-xs text-white/90 mt-2 leading-relaxed">{branch.tagline}</p>
      </div>
    );
  }
  return (
    <div
      className={`rounded-xl p-3.5 border-2 border-dashed transition-all text-left ${
        active ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            active ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-400"
          }`}
        >
          {index + 1}
        </span>
        <span className={`material-symbols-outlined ${active ? "text-red-400" : "text-gray-300"}`}>
          {active ? "hourglass_top" : "lock"}
        </span>
        <span className={`text-sm font-semibold ${active ? "text-red-700" : "text-gray-400"}`}>
          {active ? "Đang khám phá…" : "Chưa mở khóa"}
        </span>
      </div>
    </div>
  );
}

export function KnowledgePanel({ branches = [], pieces = [], activePieceId, canMerge, merged, onMerge }) {
  if (!branches || branches.length < 2) return null;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden w-full">
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-3 text-white text-left">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined">extension</span>
          <h3 className="font-bold text-sm">Nguồn Gốc Triết Học</h3>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold tabular-nums">
            {pieces.length}/2
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <PieceSlot
          branch={branches[0]}
          index={0}
          collected={pieces.includes(branches[0].id)}
          active={activePieceId === branches[0].id}
        />

        <div className="flex justify-center">
          <span
            className={`material-symbols-outlined text-xl ${
              merged ? "text-green-500" : canMerge ? "text-red-500 animate-pulse" : "text-gray-300"
            }`}
          >
            {merged ? "link" : "add"}
          </span>
        </div>

        <PieceSlot
          branch={branches[1]}
          index={1}
          collected={pieces.includes(branches[1].id)}
          active={activePieceId === branches[1].id}
        />

        {!merged && (
          <div className="pt-2">
            {canMerge ? (
              <button
                type="button"
                onClick={onMerge}
                className="w-full inline-flex items-center justify-center gap-2 bg-red-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-900 transition-colors shadow-md j-glow active:scale-95"
              >
                <span className="material-symbols-outlined text-base">join_full</span>
                Ghép 2 mảnh
              </button>
            ) : (
              <p className="text-center text-xs text-gray-400 leading-relaxed px-2">
                Hoàn thành cả 2 phần học để mở khóa thao tác ghép.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
