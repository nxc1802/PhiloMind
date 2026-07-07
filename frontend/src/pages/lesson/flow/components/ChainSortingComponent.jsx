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
import { ComponentImage, firstImageAsset } from "./ComponentImage";
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

function SortableChainCard({ item, isCompleted }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    // Chuyển động mượt hơn: easing dịu, thời lượng dài hơn mặc định.
    transition: { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        willChange: "transform",
      }}
      {...attributes}
      {...listeners}
      className={[
        "group relative flex w-full touch-none items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left",
        "cursor-grab transition-[border-color,box-shadow,background-color] duration-200 active:cursor-grabbing",
        isDragging
          ? "z-30 scale-[1.02] border-primary-400 bg-white shadow-2xl ring-4 ring-primary-200/50 dark:bg-surface-dark-elevated"
          : isCompleted
            ? "border-green-300 bg-green-50/70 shadow-sm dark:border-green-700/60 dark:bg-green-950/25"
            : "border-slate-200 bg-white shadow-sm hover:border-primary-350 hover:shadow-md dark:border-primary-850/55 dark:bg-surface-dark-elevated dark:hover:border-primary-650",
      ].join(" ")}
    >
      {/* Icon đẩy ra đầu (thay cho số đếm cũ) */}
      <span
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
          isCompleted
            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200"
            : "bg-primary-50 text-primary-600 group-hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-250",
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[26px]">
          {item.icon || "extension"}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-6 text-slate-800 dark:text-primary-100">
          {item.text}
        </p>
        <p
          className={[
            "mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide",
            isCompleted
              ? "text-green-600 dark:text-green-300"
              : "text-slate-500 dark:text-slate-400",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isCompleted ? "check_circle" : "swap_vert"}
          </span>
          {isCompleted ? "Đúng vị trí" : "Kéo thả để sắp xếp"}
        </p>
      </div>
      <ComponentImage
        image={firstImageAsset(
          [item.image, item.imageUrl, item.media],
          item.text,
        )}
        alt={item.text}
        caption={false}
        className="h-16 w-24 shrink-0"
        imageClassName="h-full w-full"
      />
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

        <div className="mb-3 mt-2 flex flex-wrap items-center justify-end gap-2 px-1">
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
                  isCompleted={isCompleted}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {isCompleted && (
          <div className="mt-auto shrink-0 pt-4 flex justify-end">
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
        )}
      </div>
    </ComponentFrame>
  );
}
