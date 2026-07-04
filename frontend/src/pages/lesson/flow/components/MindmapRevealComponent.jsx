import React, { useState, useEffect } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

/**
 * MindmapRevealComponent — component mở dần các node của mindmap (front/back card format).
 * Tự động mở (auto-reveal) từng node tuần tự, cách nhau 2 giây (yêu cầu từ big_update).
 * Tích hợp FlipCard 3D và MindmapLayout linh hoạt.
 */
export function MindmapRevealComponent({ component, onComplete }) {
  const nodes = component.config.nodes || [];
  const [revealed, setRevealed] = useState([]);

  const complete = nodes.length > 0 && revealed.length === nodes.length;
  const revealedCount = revealed.length;

  // Mảnh ghép vừa được mở gần nhất (dùng cho lời chúc mừng trung gian).
  const lastRevealedId = revealed[revealed.length - 1];
  const lastRevealedNode = nodes.find((node) => node.id === lastRevealedId);
  const lastRevealedName =
    lastRevealedNode?.back?.text || lastRevealedNode?.label || "";
  // Đã mở ít nhất 1 mảnh nhưng CHƯA hoàn tất → hiện chúc mừng từng bước.
  const partialCelebrate = revealedCount > 0 && !complete;

  // Tự động mở các thẻ tuần tự (2s)
  useEffect(() => {
    if (nodes.length === 0) return;

    if (revealed.length < nodes.length) {
      const timer = setTimeout(() => {
        setRevealed((prev) => {
          const nextNode = nodes.find((node) => !prev.includes(node.id));
          return nextNode ? [...prev, nextNode.id] : prev;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [revealed.length, nodes]);

  // Handle manual click if user wants to reveal faster
  const handleReveal = (nodeId) => {
    if (!revealed.includes(nodeId)) {
      setRevealed((prev) => [...prev, nodeId]);
    }
  };

  return (
    <ComponentFrame component={component}>
      <div className="mb-5 shrink-0 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-amber-50 p-5 dark:border-primary-850 dark:from-primary-950/60 dark:via-[#102733] dark:to-amber-950/25">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary-600 text-3xl text-white shadow-lg">
              hub
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
                Bản đồ tư duy
              </p>
              <h3 className="text-2xl font-extrabold leading-tight text-primary-950 dark:text-primary-100">
                {component.config.center || "Triết học"}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-primary-150">
                Lắng nghe hoặc đọc để hoàn thiện bức tranh khái niệm.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-primary-150 bg-white px-4 py-3 text-left shadow-sm dark:border-primary-800 dark:bg-primary-950/45">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-primary-250">
              Tiến độ mở
            </p>
            <p className="text-2xl font-extrabold text-primary-800 dark:text-primary-100">
              {revealedCount}/{nodes.length}
            </p>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-primary-950">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{
              width: nodes.length
                ? `${(revealedCount / nodes.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col gap-3 pb-1">
        <div className="absolute bottom-4 left-[1.35rem] top-4 hidden w-px bg-primary-150 dark:bg-primary-850 sm:block" />
        {nodes.map((node, index) => {
          const open = revealed.includes(node.id);
          const frontText = node.front?.text || "Bấm để mở nội dung";
          const frontImageUrl = node.front?.image;
          const backText = node.back?.text || node.label; // Fallback to legacy label
          const detailText = node.back?.detail || node.detail; // Fallback to legacy detail
          const backImageUrl = node.back?.image;

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleReveal(node.id)}
              className={`relative flex w-full min-w-0 shrink-0 items-start gap-3 rounded-3xl border p-4 text-left transition-all ${
                open
                  ? "border-primary-250 bg-white shadow-sm dark:border-primary-800 dark:bg-[#132d39]"
                  : "border-dashed border-slate-250 bg-slate-50 hover:border-primary-300 hover:bg-white dark:border-primary-850 dark:bg-primary-950/25 dark:hover:bg-[#132d39]"
              }`}
            >
              <span
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  open
                    ? "bg-primary-600 text-white"
                    : "bg-white text-slate-300 shadow-sm dark:bg-primary-950 dark:text-primary-650"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {open ? "check_circle" : "lock_open"}
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    open
                      ? "text-primary-650 dark:text-primary-300"
                      : "text-slate-400 dark:text-primary-500"
                  }`}
                >
                  Mảnh ghép {index + 1}
                </p>

                {open ? (
                  <div className="mt-2 flex min-w-0 items-start gap-3">
                    {backImageUrl && (
                      <img
                        src={backImageUrl}
                        alt="minh họa mảnh ghép"
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-lg font-extrabold leading-snug text-primary-900 dark:text-primary-100">
                        {backText}
                      </p>
                      {detailText && (
                        <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-slate-650 dark:text-primary-200">
                          {detailText}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex min-w-0 items-center gap-3">
                    {frontImageUrl && (
                      <img
                        src={frontImageUrl}
                        alt="bìa mảnh ghép"
                        className="h-12 w-12 shrink-0 rounded-2xl object-cover shadow-sm"
                      />
                    )}
                    <p className="min-w-0 break-words text-sm font-bold leading-6 text-slate-600 dark:text-primary-200">
                      {frontText}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Chúc mừng trung gian — hiện sau mỗi lần mở mảnh ghép (trừ mảnh cuối) */}
      {partialCelebrate && (
        <div className="mt-6 rounded-3xl border border-primary-200 bg-primary-50 p-4 text-primary-950 dark:border-primary-800 dark:bg-primary-950/35 dark:text-primary-100">
          <p className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-lg text-primary-600 dark:text-primary-300">
              celebration
            </span>
            Chúc mừng! Đã mở khóa Mảnh ghép {revealedCount}
            {lastRevealedName ? `: ${lastRevealedName}` : ""}.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-650 dark:text-primary-200">
            Tiếp tục để hoàn thiện nốt {nodes.length - revealedCount} mảnh ghép còn
            lại của bức tranh khái niệm.
          </p>
        </div>
      )}

      {complete && (
        <div className="mt-6 shrink-0 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
          <p className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-lg">task_alt</span>
            Bản đồ đã hoàn chỉnh.
          </p>
          {component.config.summary && (
            <p className="mt-2 text-sm leading-relaxed">
              {component.config.summary}
            </p>
          )}
          <ContinueButton
            onComplete={() =>
              onComplete({ score: 100, answer: revealed, status: "completed" })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}
