import React, { useState } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";
import { DragItem, DropZone } from "./dnd";

function expectedCategoryIds(card) {
  return new Set(
    [
      card.categoryId,
      ...(Array.isArray(card.categoryIds) ? card.categoryIds : []),
      ...(Array.isArray(card.acceptedCategoryIds)
        ? card.acceptedCategoryIds
        : []),
    ].filter(Boolean),
  );
}

function categoryAcceptsCard(category, card) {
  const categoryCardIds = [
    ...(Array.isArray(category.cardIds) ? category.cardIds : []),
    ...(Array.isArray(category.acceptedCardIds)
      ? category.acceptedCardIds
      : []),
  ];
  return (
    expectedCategoryIds(card).has(category.id) ||
    categoryCardIds.includes(card.id)
  );
}

export function CategorySortingComponent({ component, onComplete }) {
  const { categories = [], cards = [], summary } = component.config;
  const isCompleted = component.__isCompleted === true;
  const completedAnswer =
    component.__completedResult?.answer &&
    typeof component.__completedResult.answer === "object"
      ? component.__completedResult.answer
      : {};
  // Keep track of placements: { [cardId]: categoryId }
  const [placements, setPlacements] = useState(completedAnswer);
  const complete =
    cards.length > 0 &&
    cards.every((card) => {
      const category = categories.find(
        (entry) => entry.id === placements[card.id],
      );
      return category ? categoryAcceptsCard(category, card) : false;
    });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // active.id = cardId, over.id = categoryId
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
          "Kéo một thẻ tình huống/khái niệm từ danh sách.",
          "Thả vào nhóm phù hợp.",
          "Thẻ xanh là đúng, thẻ đỏ là cần chuyển lại. Có thể kéo lại để sửa.",
        ]}
      />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-800 dark:text-primary-100">
            Thẻ cần phân loại
          </p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-650 dark:bg-primary-900/40 dark:text-primary-150">
            Đã đặt {Object.keys(placements).length}/{cards.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 min-h-12 p-3 bg-slate-50 dark:bg-primary-950/20 border border-slate-200 dark:border-primary-850 rounded-2xl">
          {cards
            .filter((card) => !placements[card.id])
            .map((card) => (
              <DragItem key={card.id} id={card.id}>
                <div className="flex items-center gap-2 rounded-3xl border-2 border-slate-205 bg-white px-4 py-2 font-semibold text-gray-750 hover:border-primary-400 dark:bg-surface-dark-elevated dark:text-primary-150">
                  <span>{card.text}</span>
                  <ComponentImage
                    image={firstImageAsset(
                      [card.image, card.imageUrl, card.media],
                      card.text,
                    )}
                    alt={card.text}
                    caption={false}
                    className="h-12 w-16 shrink-0"
                    imageClassName="h-full w-full"
                  />
                </div>
              </DragItem>
            ))}
          {cards.filter((card) => !placements[card.id]).length === 0 && (
            <span className="text-sm text-slate-400 dark:text-primary-300 italic self-center mx-auto">
              Tất cả thẻ đã được phân loại
            </span>
          )}
        </div>

        <p className="mb-3 text-sm font-bold text-slate-800 dark:text-primary-100">
          Vùng nhận thẻ
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map((category) => {
            const placedCards = cards.filter(
              (card) => placements[card.id] === category.id,
            );
            return (
              <DropZone
                key={category.id}
                id={category.id}
                className="min-h-36 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-[#132d39] px-4 py-4 text-left"
              >
                <ComponentImage
                  image={firstImageAsset(
                    [category.image, category.imageUrl, category.media],
                    category.label,
                  )}
                  alt={category.label}
                  fit="cover"
                  caption={false}
                  className="mb-3 h-24"
                  imageClassName="h-full w-full"
                />
                <p className="font-bold text-primary-850 dark:text-primary-100">
                  {category.label}
                </p>
                {category.description && (
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-600 dark:text-primary-250">
                    {category.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {placedCards.length > 0 ? (
                    placedCards.map((card) => (
                      <DragItem key={card.id} id={card.id}>
                        <div
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                            categoryAcceptsCard(category, card)
                              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/35 dark:text-green-200"
                              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/35 dark:text-red-200"
                          }`}
                        >
                          <span>{card.text}</span>
                          <ComponentImage
                            image={firstImageAsset(
                              [card.image, card.imageUrl, card.media],
                              card.text,
                            )}
                            alt={card.text}
                            caption={false}
                            className="h-10 w-12 shrink-0"
                            imageClassName="h-full w-full"
                          />
                        </div>
                      </DragItem>
                    ))
                  ) : (
                    <span className="text-xs font-medium text-slate-500 dark:text-primary-250 opacity-50">
                      Kéo thả thẻ vào đây
                    </span>
                  )}
                </div>
              </DropZone>
            );
          })}
        </div>
      </DndContext>

      {complete && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span> Phân
            loại chính xác.
          </p>
          {summary && <p className="text-sm mt-1">{summary}</p>}
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
