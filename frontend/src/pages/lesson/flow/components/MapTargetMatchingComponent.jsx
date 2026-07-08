import React, { useState } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ComponentFrame } from "./ComponentFrame";
import {
  ComponentImage,
  firstImageAsset,
  getImageAsset,
} from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";
import { DragItem, DropZone } from "./dnd";

function expectedTargetIds(item) {
  return new Set(
    [
      item.targetId,
      ...(Array.isArray(item.targetIds) ? item.targetIds : []),
      ...(Array.isArray(item.acceptedTargetIds) ? item.acceptedTargetIds : []),
    ].filter(Boolean),
  );
}

function targetAcceptsItem(target, item) {
  const targetItemIds = [
    ...(Array.isArray(target.itemIds) ? target.itemIds : []),
    ...(Array.isArray(target.acceptedItemIds) ? target.acceptedItemIds : []),
  ];
  return (
    expectedTargetIds(item).has(target.id) || targetItemIds.includes(item.id)
  );
}

export function MapTargetMatchingComponent({ component, onComplete }) {
  const {
    targets = [],
    items = [],
    summary,
    instruction,
    mapImage,
  } = component.config || {};
  const isCompleted = component.__isCompleted === true;
  const completedAnswer =
    component.__completedResult?.answer &&
    typeof component.__completedResult.answer === "object"
      ? component.__completedResult.answer
      : {};
  const [placements, setPlacements] = useState(completedAnswer);
  const mapImageAsset = getImageAsset(mapImage, component.title);

  const placedCount = Object.keys(placements).length;
  const complete =
    items.length > 0 &&
    items.every((item) => {
      const target = targets.find((entry) => entry.id === placements[item.id]);
      return target ? targetAcceptsItem(target, item) : false;
    });

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
          {instruction ? (
            <p className="min-w-0 text-sm font-bold text-slate-900 dark:text-primary-100">
              {instruction}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/35 dark:text-primary-200">
            {placedCount}/{items.length}
          </span>
        </div>

        <div className="mb-4 flex min-h-12 shrink-0 flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-primary-850 dark:bg-primary-950/20">
          {items
            .filter((item) => !placements[item.id])
            .map((item) => (
              <DragItem key={item.id} id={item.id}>
                <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-base font-extrabold text-slate-800 shadow-sm transition-colors hover:border-primary-400 dark:border-primary-850 dark:bg-surface-dark-elevated dark:text-primary-100">
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
            <span className="mx-auto self-center text-sm font-medium italic text-slate-400 dark:text-primary-300">
              Tất cả khối tri thức đã được đặt lên bản đồ.
            </span>
          )}
        </div>

        <div className="relative shrink-0 overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-inner dark:border-primary-850/50 dark:bg-[#102733]">
          {mapImage ? (
            <img
              src={mapImageAsset?.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-10"
            />
          ) : (
            <div className="absolute inset-0 opacity-45">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>
          )}

          <div className="relative grid gap-3 p-4 md:grid-cols-3">
            {targets.map((target) => {
              const placedItems = items.filter(
                (item) => placements[item.id] === target.id,
              );
              const hasCorrectPlacement = placedItems.some((item) =>
                targetAcceptsItem(target, item),
              );

              return (
                <DropZone
                  key={target.id}
                  id={target.id}
                  className="flex min-h-64 flex-col rounded-3xl border-2 border-primary-150 bg-white/92 p-4 text-center shadow-sm backdrop-blur transition-all dark:border-primary-850 dark:bg-[#123241]/92"
                >
                  <div className="mb-3 flex items-start justify-between gap-3 text-left">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-2xl text-primary-650 dark:bg-primary-900/35 dark:text-primary-250">
                        {target.icon || "travel_explore"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-extrabold leading-tight text-primary-900 dark:text-primary-100">
                          {target.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ComponentImage
                    image={firstImageAsset(
                      [target.image, target.imageUrl, target.media],
                      target.label,
                    )}
                    alt={target.label}
                    caption={false}
                    className="mb-3 h-28"
                    imageClassName="h-full w-full"
                  />

                  {target.detail && hasCorrectPlacement && (
                    <p className="mb-4 min-h-20 rounded-2xl bg-slate-50 px-3 py-2 text-left text-xs font-medium leading-5 text-slate-600 dark:bg-primary-950/25 dark:text-primary-200">
                      {target.detail}
                    </p>
                  )}

                  <div className="mt-auto flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-200 bg-primary-50/45 p-3 dark:border-primary-800 dark:bg-primary-950/25">
                    {placedItems.length > 0 ? (
                      placedItems.map((item) => (
                        <DragItem key={item.id} id={item.id}>
                          <div
                            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-extrabold shadow-sm ${
                              targetAcceptsItem(target, item)
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
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary-500 dark:text-primary-300">
                        <span className="material-symbols-outlined text-base">
                          add_location_alt
                        </span>
                        Thả thuật ngữ vào đây
                      </span>
                    )}
                  </div>
                </DropZone>
              );
            })}
          </div>
        </div>
      </DndContext>

      {complete && (
        <div className="mt-4 shrink-0 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
          {summary && (
            <p className="text-sm font-semibold leading-6">{summary}</p>
          )}
          {!isCompleted && (
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
          )}
        </div>
      )}
    </ComponentFrame>
  );
}
