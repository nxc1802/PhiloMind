import React, { useState } from "react";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";
import { DragItem, DropZone } from "./dnd";

export function TargetMatchingComponent({ component, onComplete }) {
  const { targets = [], items = [], summary } = component.config;
  const [placements, setPlacements] = useState({});
  const complete =
    items.length > 0 &&
    items.every((item) => placements[item.id] === item.targetId);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPlacements((prev) => ({
        ...prev,
        [active.id]: over.id,
      }));
    }
  };

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Kéo một mục ở hàng trên.",
          "Đưa mục vào vùng/đích tương ứng.",
          "Có thể kéo lại để sửa vị trí.",
        ]}
      />
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-800 dark:text-primary-100">
            Mục cần ghép
          </p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-650 dark:bg-primary-900/40 dark:text-primary-150">
            Đã đặt {Object.keys(placements).length}/{items.length}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6 min-h-12 p-3 bg-slate-50 dark:bg-primary-950/20 border border-slate-200 dark:border-primary-850 rounded-2xl">
          {items
            .filter((item) => !placements[item.id])
            .map((item) => (
              <DragItem key={item.id} id={item.id}>
                <div className="flex items-center gap-2 rounded-3xl border-2 border-slate-205 bg-white px-4 py-2 text-lg font-bold text-gray-750 hover:border-primary-400 dark:bg-surface-dark-elevated dark:text-primary-150">
                  <span>{item.text}</span>
                  <ComponentImage
                    image={firstImageAsset(
                      [item.image, item.imageUrl, item.media],
                      item.text,
                    )}
                    alt={item.text}
                    caption={false}
                    className="h-12 w-16 shrink-0"
                    imageClassName="h-full w-full"
                  />
                </div>
              </DragItem>
            ))}
          {items.filter((item) => !placements[item.id]).length === 0 && (
            <span className="text-sm text-slate-400 dark:text-primary-300 italic self-center mx-auto">Tất cả mục đã được ghép</span>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {targets.map((target) => {
            const placedItems = items.filter(
              (item) => placements[item.id] === target.id,
            );
            return (
              <DropZone
                key={target.id}
                id={target.id}
                className="min-h-40 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-white dark:from-[#14313f] dark:to-[#102733] px-4 py-5 text-center transition-colors"
              >
                <span className="material-symbols-outlined text-3xl text-primary-650 dark:text-primary-300">
                  {target.icon || "public"}
                </span>
                <p className="font-bold text-primary-900 dark:text-primary-100 mt-2">
                  {target.label}
                </p>
                <ComponentImage
                  image={firstImageAsset(
                    [target.image, target.imageUrl, target.media],
                    target.label,
                  )}
                  alt={target.label}
                  caption={false}
                  className="mx-auto mt-3 h-24 w-full"
                  imageClassName="h-full w-full"
                />
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {placedItems.length > 0 ? (
                    placedItems.map((item) => (
                      <DragItem key={item.id} id={item.id}>
                        <div
                          className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${
                            item.targetId === target.id
                              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/35 dark:text-green-200"
                              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/35 dark:text-red-200"
                          }`}
                        >
                          <span>{item.text}</span>
                          <ComponentImage
                            image={firstImageAsset(
                              [item.image, item.imageUrl, item.media],
                              item.text,
                            )}
                            alt={item.text}
                            caption={false}
                            className="h-10 w-12 shrink-0"
                            imageClassName="h-full w-full"
                          />
                        </div>
                      </DragItem>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-slate-500 dark:text-primary-250 opacity-50 mt-2">
                      Kéo thả vào đây
                    </span>
                  )}
                </div>
              </DropZone>
            );
          })}
        </div>
      </DndContext>

      {complete && (
        <div className="mt-5 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span> Các mục đã được ghép chính xác.
          </p>
          {summary && <p className="text-sm mt-1">{summary}</p>}
          <ContinueButton
            onComplete={() =>
              onComplete({
                score: 100,
                answer: placements,
                status: "completed",
              })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}
