import React, { useEffect, useMemo, useRef, useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";

function hashString(value) {
  return String(value)
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function stableShuffle(cards, seed, enabled) {
  if (!enabled) return cards;
  return [...cards].sort(
    (a, b) => hashString(`${seed}:${a.id}`) - hashString(`${seed}:${b.id}`),
  );
}

function cardLabel(card, fallback = "Thẻ") {
  return card.text || card.label || card.title || card.name || fallback;
}

function normalizeSideCard(value, fallbackId, fallbackLabel) {
  if (typeof value === "string") {
    return { id: fallbackId, text: value };
  }
  if (value && typeof value === "object") {
    return {
      ...value,
      id: value.id || fallbackId,
      text: cardLabel(value, fallbackLabel),
    };
  }
  return { id: fallbackId, text: fallbackLabel };
}

function normalizePairs(pairs = []) {
  return pairs.map((pair, index) => {
    const pairId = pair.id || `pair-${index + 1}`;
    return {
      id: pairId,
      left: normalizeSideCard(
        pair.left || pair.front || pair.a,
        `${pairId}-left`,
        `Thẻ trái ${index + 1}`,
      ),
      right: normalizeSideCard(
        pair.right || pair.back || pair.b || pair.match,
        `${pairId}-right`,
        `Thẻ phải ${index + 1}`,
      ),
    };
  });
}

function PairCard({
  card,
  side,
  pairId,
  faceUp,
  matched,
  mismatch,
  justMatched,
  disabled,
  onFlip,
}) {
  const label = cardLabel(card, side === "left" ? "Thẻ trái" : "Thẻ phải");
  const image = firstImageAsset(
    [card.image, card.imageUrl, card.media, card.thumbnail],
    label,
  );
  const stateClass = matched
    ? "border-green-300 bg-green-50 shadow-green-100 dark:border-green-700 dark:bg-green-950/35"
    : mismatch
      ? "border-red-300 bg-red-50 shadow-red-100 dark:border-red-700 dark:bg-red-950/35"
      : faceUp
        ? "border-primary-300 bg-white shadow-primary-100 dark:border-primary-650 dark:bg-[#14313f]"
        : "border-slate-200 bg-slate-100 shadow-slate-100 hover:border-primary-350 dark:border-primary-850 dark:bg-[#102733]";

  return (
    <button
      type="button"
      aria-label={`Lật ${label}`}
      aria-pressed={faceUp}
      disabled={disabled || matched}
      onClick={onFlip}
      className={`group min-h-[10rem] w-full rounded-3xl border-2 p-2 text-left shadow-sm transition-all duration-300 ${
        mismatch ? "animate-pulse" : ""
      } ${justMatched ? "scale-[1.02]" : ""} ${stateClass}`}
    >
      <div
        className="relative h-full min-h-[9rem] w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-600 text-white"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="material-symbols-outlined text-4xl">
            {side === "left" ? "filter_1" : "filter_2"}
          </span>
          <span className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] opacity-80">
            {side === "left" ? "Trái" : "Phải"}
          </span>
        </div>

        <div
          className="absolute inset-0 flex flex-col justify-between gap-3 rounded-2xl bg-white p-3 text-slate-900 dark:bg-[#14313f] dark:text-primary-50"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-sm font-extrabold leading-5">{label}</p>
            <span
              className={`material-symbols-outlined text-xl ${
                matched
                  ? "text-green-600"
                  : mismatch
                    ? "text-red-500"
                    : "text-primary-500"
              }`}
            >
              {matched ? "task_alt" : mismatch ? "cancel" : "visibility"}
            </span>
          </div>
          <ComponentImage
            image={image}
            alt={label}
            fit="contain"
            caption={false}
            className="min-h-20 flex-1"
            imageClassName="h-full w-full"
          />
          {card.description && (
            <p className="text-xs font-medium leading-5 text-slate-600 dark:text-primary-200">
              {card.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function ShinkeiMatchingComponent({ component, onComplete }) {
  const {
    pairs = [],
    instruction,
    summary,
    successFeedback,
    shuffle = true,
  } = component.config || {};
  const normalizedPairs = useMemo(() => normalizePairs(pairs), [pairs]);
  const isCompleted = component.__isCompleted === true;
  const initialMatched = useMemo(
    () =>
      new Set(
        isCompleted
          ? normalizedPairs.map((pair) => pair.id)
          : component.__completedResult?.answer?.matchedPairIds || [],
      ),
    [
      component.__completedResult?.answer?.matchedPairIds,
      isCompleted,
      normalizedPairs,
    ],
  );
  const [matchedPairIds, setMatchedPairIds] = useState(initialMatched);
  const [selected, setSelected] = useState(null);
  const [mismatchIds, setMismatchIds] = useState([]);
  const [justMatchedIds, setJustMatchedIds] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const leftCards = useMemo(
    () =>
      stableShuffle(
        normalizedPairs.map((pair) => ({
          ...pair.left,
          id: pair.left.id,
          pairId: pair.id,
          side: "left",
        })),
        `${component.id}:left`,
        shuffle,
      ),
    [component.id, normalizedPairs, shuffle],
  );
  const rightCards = useMemo(
    () =>
      stableShuffle(
        normalizedPairs.map((pair) => ({
          ...pair.right,
          id: pair.right.id,
          pairId: pair.id,
          side: "right",
        })),
        `${component.id}:right`,
        shuffle,
      ),
    [component.id, normalizedPairs, shuffle],
  );

  const complete =
    normalizedPairs.length > 0 &&
    matchedPairIds.size === normalizedPairs.length;

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const flipCard = (card) => {
    if (isResolving || matchedPairIds.has(card.pairId)) return;
    if (selected?.id === card.id) return;
    clearTimer();
    setMismatchIds([]);
    setJustMatchedIds([]);

    if (!selected || selected.side === card.side) {
      setSelected(card);
      return;
    }

    if (selected.pairId === card.pairId) {
      setMatchedPairIds((prev) => new Set(prev).add(card.pairId));
      setJustMatchedIds([selected.id, card.id]);
      setSelected(null);
      timerRef.current = window.setTimeout(() => setJustMatchedIds([]), 900);
      return;
    }

    setIsResolving(true);
    setMismatchIds([selected.id, card.id]);
    timerRef.current = window.setTimeout(() => {
      setSelected(null);
      setMismatchIds([]);
      setIsResolving(false);
      timerRef.current = null;
    }, 950);
  };

  const renderColumn = (cards, sideLabel) => (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary-600 dark:text-primary-250">
        {sideLabel}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const faceUp =
            selected?.id === card.id ||
            mismatchIds.includes(card.id) ||
            matchedPairIds.has(card.pairId);
          return (
            <PairCard
              key={card.id}
              card={card}
              side={card.side}
              pairId={card.pairId}
              faceUp={faceUp}
              matched={matchedPairIds.has(card.pairId)}
              mismatch={mismatchIds.includes(card.id)}
              justMatched={justMatchedIds.includes(card.id)}
              disabled={isResolving}
              onFlip={() => flipCard(card)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <ComponentFrame component={component}>
      <div className="flex min-h-0 flex-1 flex-col">
        <LessonHint
          steps={[
            instruction || "Lật một thẻ ở bên trái và một thẻ ở bên phải.",
            "Nếu hai thẻ hợp lý, chúng sẽ sáng lên và giữ trạng thái mở.",
            "Nếu sai, hai thẻ sẽ báo đỏ rồi úp lại để bạn thử tiếp.",
          ]}
        />

        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700 dark:bg-primary-900/35 dark:text-primary-200">
            Đã mở {matchedPairIds.size}/{normalizedPairs.length} cặp
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderColumn(leftCards, "Cột trái")}
            {renderColumn(rightCards, "Cột phải")}
          </div>
        </div>

        {complete && (
          <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 shadow-sm dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
            <p className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined">task_alt</span>
              {successFeedback || "Tất cả cặp thẻ đã được mở chính xác."}
            </p>
            {summary && <p className="mt-1 text-sm font-medium">{summary}</p>}
            {!isCompleted && (
              <ContinueButton
                onComplete={() =>
                  onComplete({
                    score: 100,
                    answer: {
                      matchedPairIds: Array.from(matchedPairIds),
                    },
                    status: "completed",
                  })
                }
                label="Tiếp tục"
              />
            )}
          </div>
        )}
      </div>
    </ComponentFrame>
  );
}
