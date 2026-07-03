import React from "react";
import { ComponentFrame, ContinueButton } from "../flow/components";
import * as ComponentRegistry from "../flow/components";

/**
 * RightInteractive — Cột phải trong layout 3 cột.
 * Render nội dung tương tác (component hiện tại) của bài học.
 */
export function RightInteractive({
  flow,
  activeIndex,
  onCompleteComponent,
  onFinishLesson,
}) {
  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), flow.length - 1);
  const activeComponent = flow[safeActiveIndex];

  if (!activeComponent) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-primary-850/50 dark:bg-surface-dark-elevated">
        <p className="text-gray-600">Bài học chưa có nội dung tương tác.</p>
      </div>
    );
  }

  // Component name mapping (e.g., 'mindmap_reveal' -> 'MindmapRevealComponent')
  const componentName =
    activeComponent.type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") + "Component";

  const Renderer = ComponentRegistry[componentName];

  const handleComponentComplete = (result = {}) => {
    onCompleteComponent(activeComponent, safeActiveIndex, result);
    if (safeActiveIndex >= flow.length - 1) {
      onFinishLesson?.();
    }
  };

  return (
    <div className="relative z-20 flex h-full min-h-0 flex-col w-full">
      <div className="w-full h-full flex flex-col min-h-0">
        {/* Component Renderer */}
        {activeComponent.type === "media" ? (
          <ComponentFrame component={activeComponent}>
            <div className="rounded-3xl border border-primary-100 bg-primary-50 p-5 text-slate-800 dark:border-primary-850 dark:bg-primary-950/35 dark:text-primary-100">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white">
                  play_circle
                </span>
                <div>
                  <p className="font-bold text-primary-900 dark:text-primary-100">
                    Video/hình ảnh đang hiển thị ở cột giữa
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-primary-200">
                    Xem nội dung trực quan ở cột giữa, sau đó xác nhận để tiếp
                    tục sang hoạt động liên quan ở cột phải.
                  </p>
                </div>
              </div>
            </div>
            <ContinueButton
              onComplete={() =>
                handleComponentComplete({ score: 100, status: "completed" })
              }
              label="Tôi đã xem xong"
            />
          </ComponentFrame>
        ) : Renderer ? (
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
