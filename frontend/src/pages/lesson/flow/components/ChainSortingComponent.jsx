import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";

function SortableItem({ id, item, isCorrect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-4 rounded-xl border-2 p-4 mb-3 transition-colors ${
        isDragging
          ? "border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/40 shadow-lg"
          : isCorrect === true
            ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40 text-green-900 dark:text-green-100"
            : isCorrect === false
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 text-red-900 dark:text-red-100"
              : "border-slate-200 bg-white dark:border-primary-800 dark:bg-surface-dark-elevated hover:border-primary-300"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 active:cursor-grabbing dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-800"
      >
        <span className="material-symbols-outlined">drag_indicator</span>
      </div>
      
      {item.icon && (
        <span className="material-symbols-outlined text-2xl opacity-80">
          {item.icon}
        </span>
      )}
      <p className="font-semibold">{item.text}</p>
    </div>
  );
}

export function ChainSortingComponent({ component, onComplete }) {
  const { title, instruction, items = [], successFeedback, reward } = component.config;
  
  // Initialize with shuffled items
  const [currentItems, setCurrentItems] = useState(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    // Ensure it's not already in correct order initially
    let isPerfect = true;
    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i].order !== i) isPerfect = false;
    }
    if (isPerfect && shuffled.length > 1) {
      // Swap first two to make it imperfect
      const temp = shuffled[0];
      shuffled[0] = shuffled[1];
      shuffled[1] = temp;
    }
    return shuffled;
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCurrentItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasSubmitted(false); // Reset check status when they change order
    }
  };

  const checkOrder = () => {
    setHasSubmitted(true);
  };

  const isAllCorrect = currentItems.every((item, index) => item.order === index);

  return (
    <ComponentFrame component={component}>
      {instruction && (
        <LessonHint steps={[instruction]} />
      )}
      
      <div className="mt-4 px-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {currentItems.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                item={item}
                isCorrect={hasSubmitted ? item.order === index : undefined}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {!hasSubmitted ? (
        <div className="mt-auto pt-5 flex justify-end shrink-0">
          <button
            type="button"
            onClick={checkOrder}
            className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            Kiểm tra
            <span className="material-symbols-outlined text-base">check</span>
          </button>
        </div>
      ) : isAllCorrect ? (
        <div className="mt-6 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-5 text-green-950 dark:text-green-100">
          <p className="font-bold flex items-center gap-2 mb-2 text-lg">
            <span className="material-symbols-outlined">task_alt</span> 
            {successFeedback || "Chính xác! Chuỗi nhân quả đã hoàn thiện."}
          </p>
          {reward && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-bold text-sm">
              <span className="material-symbols-outlined text-lg">star</span>
              {reward}
            </div>
          )}
          <ContinueButton
            onComplete={() =>
              onComplete({
                score: 100,
                answer: currentItems.map(i => i.id),
                status: "completed",
              })
            }
            label="Tiếp tục"
          />
        </div>
      ) : (
        <div className="mt-6 bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-800 rounded-3xl p-4 text-red-900 dark:text-red-100">
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span> 
            Chưa chính xác. Các thẻ màu đỏ đang sai vị trí, hãy sắp xếp lại.
          </p>
        </div>
      )}
    </ComponentFrame>
  );
}
