import React, { useState, useEffect } from "react";
import { ComponentFrame, ContinueButton } from "../flow/components";
import * as ComponentRegistry from "../flow/components";

/**
 * RightInteractive — Cột phải trong layout 3 cột.
 * Render nội dung tương tác (component hiện tại) của bài học.
 */
export function RightInteractive({
  flow,
  activeIndex,
  completedIds,
  onCompleteComponent,
  onFinishLesson,
}) {
  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), flow.length - 1);
  const activeComponent = flow[safeActiveIndex];
  
  if (!activeComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark-elevated">
        <p className="text-gray-600">Bài học chưa có nội dung tương tác.</p>
      </div>
    );
  }

  // Component name mapping (e.g., 'mindmap_reveal' -> 'MindmapRevealComponent')
  const componentName = activeComponent.type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("") + "Component";

  const Renderer = ComponentRegistry[componentName];
  const completedCount = Math.min(new Set(completedIds).size, flow.length);
  const percentage = Math.round((completedCount / flow.length) * 100);

  const handleComponentComplete = (result = {}) => {
    onCompleteComponent(activeComponent, safeActiveIndex, result);
    if (safeActiveIndex >= flow.length - 1) {
      onFinishLesson?.();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-[#06141b] overflow-y-auto">
      <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto w-full">
        {/* Progress Header */}
        <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl shadow-sm border border-slate-200 dark:border-primary-850/50 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Tiến trình tương tác
              </p>
              <p className="font-bold text-primary-850 dark:text-primary-100">
                Bước {safeActiveIndex + 1}/{flow.length}:{" "}
                {activeComponent.title || activeComponent.type}
              </p>
            </div>
            {/* Optional: Add restart button here if needed */}
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-primary-950/50 overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Component Renderer */}
        {Renderer ? (
          <Renderer
            key={activeComponent.id}
            component={activeComponent}
            onComplete={handleComponentComplete}
          />
        ) : (
          <ComponentFrame component={activeComponent}>
            <p className="text-red-700">
              Component type "{activeComponent.type}" chưa có renderer (
              {componentName}).
            </p>
            <ContinueButton
              onComplete={handleComponentComplete}
              label="Bỏ qua bước này"
            />
          </ComponentFrame>
        )}
      </div>
    </div>
  );
}
