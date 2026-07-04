import React, { useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";

function normalizeItems(items) {
  return items.map((item, index) => ({
    ...item,
    order: typeof item.order === "number" ? item.order : index,
  }));
}

function getShuffledItems(items) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const expectedIds = items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => item.id);
  const isSorted = shuffled.every(
    (item, index) => item.id === expectedIds[index],
  );

  if (isSorted && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function SortableChainCard({ item, index, correctIndex, isCorrectPosition }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={[
        "group relative flex w-full touch-none items-stretch gap-3 rounded-2xl border-2 bg-white p-3 text-left shadow-sm transition-all",
        "cursor-grab active:cursor-grabbing dark:bg-surface-dark-elevated",
        isDragging
          ? "z-30 scale-[1.015] border-primary-400 shadow-2xl"
          : isCorrectPosition
            ? "border-green-300 dark:border-green-800/70"
            : "border-slate-200 hover:border-primary-350 dark:border-primary-850/55 dark:hover:border-primary-650",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold",
          isCorrectPosition
            ? "bg-green-100 text-green-700 dark:bg-green-950/45 dark:text-green-200"
            : "bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-650 dark:bg-primary-950/35 dark:text-primary-250",
        ].join(" ")}
      >
        {index + 1}
      </span>

      {item.icon && (
        <span className="material-symbols-outlined mt-2 shrink-0 text-2xl text-primary-500 dark:text-primary-250">
          {item.icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-6 text-slate-850 dark:text-primary-100">
          {item.text}
        </p>
        <p
          className={[
            "mt-2 text-[11px] font-bold uppercase tracking-wide",
            isCorrectPosition
              ? "text-green-700 dark:text-green-300"
              : "text-slate-400 dark:text-primary-500",
          ].join(" ")}
        >
          {isCorrectPosition
            ? "Đúng vị trí"
            : `Vị trí đúng: ${correctIndex + 1}`}
        </p>
      </div>

      <span className="material-symbols-outlined mt-2 shrink-0 text-slate-300 transition-colors group-hover:text-primary-500 dark:text-primary-700">
        drag_indicator
      </span>
    </div>
  );
}

export function ChainSortingComponent({ component, onComplete }) {
  const { instruction, items = [], successFeedback, reward } = component.config;

  const normalizedItems = useMemo(() => normalizeItems(items), [items]);
  const expectedItems = useMemo(
    () => normalizedItems.slice().sort((a, b) => a.order - b.order),
    [normalizedItems],
  );
  const expectedIds = useMemo(
    () => expectedItems.map((item) => item.id),
    [expectedItems],
  );
  const correctIndexById = useMemo(
    () =>
      Object.fromEntries(expectedItems.map((item, index) => [item.id, index])),
    [expectedItems],
  );
  const [sortedItems, setSortedItems] = useState(() =>
    getShuffledItems(normalizedItems),
  );
  const [moves, setMoves] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  );

  const sortedIds = sortedItems.map((item) => item.id);
  const isCompleted =
    sortedIds.length > 0 &&
    sortedIds.every((id, index) => id === expectedIds[index]);
  const correctCount = sortedIds.filter(
    (id, index) => correctIndexById[id] === index,
  ).length;

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setSortedItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
    setMoves((value) => value + 1);
  };

  const handleReset = () => {
    setSortedItems(getShuffledItems(normalizedItems));
    setMoves(0);
  };

  if (normalizedItems.length === 0) {
    return (
      <ComponentFrame component={component}>
        <p className="text-sm font-medium text-slate-600 dark:text-primary-150">
          Chuỗi sắp xếp này chưa có dữ liệu.
        </p>
        <ContinueButton onComplete={onComplete} label="Tiếp tục" />
      </ComponentFrame>
    );
  }

  return (
    <ComponentFrame component={component}>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        {instruction && (
          <LessonHint
            steps={[
              instruction,
              "Kéo toàn bộ thẻ lên hoặc xuống để đặt lại thứ tự.",
            ]}
          />
        )}

        <div className="mb-3 mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-sm font-semibold text-slate-600 dark:text-primary-200">
            Đúng vị trí{" "}
            <span className="font-extrabold text-primary-650 dark:text-primary-250">
              {correctCount}/{sortedItems.length}
            </span>
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-transparent dark:bg-slate-900/55 dark:text-primary-200"
          >
            <span className="material-symbols-outlined text-sm">
              restart_alt
            </span>
            Làm lại
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 pb-2 pr-2">
              {sortedItems.map((item, index) => (
                <SortableChainCard
                  key={item.id}
                  item={item}
                  index={index}
                  correctIndex={correctIndexById[item.id]}
                  isCorrectPosition={correctIndexById[item.id] === index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {isCompleted && (
          <div className="mt-auto shrink-0 pt-4">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
              <p className="mb-2 flex items-center gap-2 text-lg font-bold">
                <span className="material-symbols-outlined">task_alt</span>
                {successFeedback || "Chính xác! Chuỗi nhân quả đã hoàn thiện."}
              </p>
              {reward && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  <span className="material-symbols-outlined text-lg">
                    star
                  </span>
                  {reward}
                </div>
              )}
              <ContinueButton
                onComplete={() =>
                  onComplete({
                    score: Math.max(100 - moves * 3, 70),
                    attempts: moves,
                    answer: sortedIds,
                    status: "completed",
                  })
                }
                label="Tiếp tục"
              />
            </div>
          </div>
        )}
      </div>
    </ComponentFrame>
  );
}
