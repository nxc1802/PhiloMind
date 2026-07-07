import React, { useMemo, useState } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { DragItem, DropZone } from "./dnd";

const FALLBACK_POSITIONS = [
  { x: 72, y: 36 },
  { x: 58, y: 58 },
  { x: 30, y: 42 },
  { x: 42, y: 68 },
  { x: 82, y: 62 },
];

export function MapTargetMatchingComponent({ component, onComplete }) {
  const { targets = [], items = [], summary, instruction, mapImage } =
    component.config || {};
  const [placements, setPlacements] = useState({});

  const positionedTargets = useMemo(
    () =>
      targets.map((target, index) => ({
        ...target,
        x:
          typeof target.x === "number"
            ? target.x
            : FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length].x,
        y:
          typeof target.y === "number"
            ? target.y
            : FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length].y,
      })),
    [targets],
  );

  const placedCount = Object.keys(placements).length;
  const complete =
    items.length > 0 &&
    items.every((item) => placements[item.id] === item.targetId);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setPlacements((prev) => ({
      ...prev,
      [active.id]: over.id,
    }));
  };

  return (
    <ComponentFrame component={component}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mb-3 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-primary-100">
              {instruction || "Kéo từng khối tri thức vào đúng vùng phát sáng."}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-primary-300">
              Có thể kéo lại để sửa vị trí trước khi hoàn thành.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/35 dark:text-primary-200">
            {placedCount}/{items.length}
          </span>
        </div>

        <div className="mb-4 flex min-h-12 shrink-0 flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-primary-850 dark:bg-primary-950/20">
          {items
            .filter((item) => !placements[item.id])
            .map((item) => (
              <DragItem key={item.id} id={item.id}>
                <div className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-base font-extrabold text-slate-800 shadow-sm transition-colors hover:border-primary-400 dark:border-primary-850 dark:bg-surface-dark-elevated dark:text-primary-100">
                  {item.text}
                </div>
              </DragItem>
            ))}
          {items.filter((item) => !placements[item.id]).length === 0 && (
            <span className="mx-auto self-center text-sm font-medium italic text-slate-400 dark:text-primary-300">
              Tất cả khối tri thức đã được đặt lên bản đồ.
            </span>
          )}
        </div>

        <div className="relative min-h-[21rem] shrink-0 overflow-hidden rounded-3xl border border-primary-100 bg-slate-50 shadow-inner dark:border-primary-850/50 dark:bg-[#102733]">
          {mapImage ? (
            <img
              src={mapImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
          ) : (
            <div className="absolute inset-0 opacity-70">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
              <div className="absolute left-[18%] top-[24%] h-px w-[64%] rotate-6 bg-primary-200 dark:bg-primary-800" />
              <div className="absolute left-[28%] top-[58%] h-px w-[46%] -rotate-12 bg-primary-200 dark:bg-primary-800" />
            </div>
          )}

          {positionedTargets.map((target) => {
            const placedItems = items.filter(
              (item) => placements[item.id] === target.id,
            );

            return (
              <DropZone
                key={target.id}
                id={target.id}
                className="absolute min-h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-primary-300/80 bg-white/88 p-3 text-center shadow-lg backdrop-blur transition-all dark:border-primary-600 dark:bg-[#123241]/88"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                }}
              >
                <span className="material-symbols-outlined text-3xl text-primary-650 dark:text-primary-250">
                  {target.icon || "travel_explore"}
                </span>
                <p className="mt-1 text-sm font-extrabold text-primary-900 dark:text-primary-100">
                  {target.label}
                </p>
                {target.detail && (
                  <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-4 text-slate-500 dark:text-primary-250">
                    {target.detail}
                  </p>
                )}
                <div className="mt-2 flex min-h-7 flex-wrap justify-center gap-1.5">
                  {placedItems.length > 0 ? (
                    placedItems.map((item) => (
                      <DragItem key={item.id} id={item.id}>
                        <div
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                            item.targetId === target.id
                              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/35 dark:text-green-200"
                              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/35 dark:text-red-200"
                          }`}
                        >
                          {item.text}
                        </div>
                      </DragItem>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-primary-400">
                      Thả vào đây
                    </span>
                  )}
                </div>
              </DropZone>
            );
          })}
        </div>
      </DndContext>

      {complete && (
        <div className="mt-4 shrink-0 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
          <p className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined">task_alt</span>
            Bản đồ tri thức đã khớp.
          </p>
          {summary && <p className="mt-1 text-sm leading-6">{summary}</p>}
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
