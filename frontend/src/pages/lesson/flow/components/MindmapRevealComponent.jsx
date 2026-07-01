import React, { useState, useEffect } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { FlipCard } from "./FlipCard";
import { MindmapLayout } from "./MindmapLayout";

/**
 * MindmapRevealComponent — component mở dần các node của mindmap (front/back card format).
 * Tự động mở (auto-reveal) từng node tuần tự, cách nhau 2 giây (yêu cầu từ big_update).
 * Tích hợp FlipCard 3D và MindmapLayout linh hoạt.
 */
export function MindmapRevealComponent({ component, onComplete }) {
  const nodes = component.config.nodes || [];
  const layoutStyle = component.config.layout || "grid";
  const layoutColumns = component.config.columns || 2;
  const [revealed, setRevealed] = useState([]);
  
  const complete = nodes.length > 0 && revealed.length === nodes.length;
  const revealedCount = revealed.length;

  // Tự động mở các thẻ tuần tự (2s)
  useEffect(() => {
    if (nodes.length === 0) return;
    
    if (revealed.length < nodes.length) {
      const timer = setTimeout(() => {
        const nextNode = nodes[revealed.length];
        setRevealed(prev => [...prev, nextNode.id]);
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
      <div className="mb-5 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-amber-50 p-5 dark:border-primary-850 dark:from-primary-950/60 dark:via-[#102733] dark:to-amber-950/25">
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
      
      <MindmapLayout layout={layoutStyle} columns={layoutColumns}>
        {nodes.map((node, index) => {
          const open = revealed.includes(node.id);
          const frontText = node.front?.text || "Bấm để mở nội dung";
          const frontImageUrl = node.front?.image;
          const backText = node.back?.text || node.label; // Fallback to legacy label
          const detailText = node.back?.detail || node.detail; // Fallback to legacy detail
          const backImageUrl = node.back?.image;

          // Front Face Element
          const FrontFace = (
            <div className="w-full h-full min-h-[140px] rounded-3xl border-2 border-dashed border-slate-300 bg-white dark:border-primary-850 dark:bg-[#132d39] p-4 flex flex-col justify-center items-center text-center">
              {frontImageUrl ? (
                <img src={frontImageUrl} alt="front cover" className="w-16 h-16 object-cover rounded-full mb-3 shadow-md" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-primary-800 mb-2">lock</span>
              )}
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-primary-300 mb-1">
                Mảnh ghép {index + 1}
              </p>
              <p className="font-bold text-slate-600 dark:text-primary-200">
                {frontText}
              </p>
            </div>
          );

          // Back Face Element
          const BackFace = (
            <div className="w-full h-full min-h-[140px] rounded-3xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/30 p-5 shadow-md flex flex-col justify-center">
              <div className="flex items-start gap-4">
                {backImageUrl ? (
                  <img src={backImageUrl} alt="back illustration" className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0" />
                ) : (
                  <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                    check_circle
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300">
                    Mảnh ghép {index + 1}
                  </p>
                  <p className="mt-1 font-bold text-primary-900 dark:text-primary-100 text-lg">
                    {backText}
                  </p>
                  {detailText && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-primary-200">
                      {detailText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <div key={node.id} className="min-h-[140px]">
              <FlipCard
                flipped={open}
                onClick={() => handleReveal(node.id)}
                front={FrontFace}
                back={BackFace}
              />
            </div>
          );
        })}
      </MindmapLayout>

      {complete && (
        <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
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
