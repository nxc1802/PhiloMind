import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

export function buildExpectedMatches(correctPairs = []) {
  const expected = new Map();

  correctPairs.forEach((pair) => {
    const leftIds = Array.isArray(pair.leftIds)
      ? pair.leftIds
      : Array.isArray(pair.leftColumnIds)
        ? pair.leftColumnIds
        : [pair.leftId].filter(Boolean);
    const rightIds = Array.isArray(pair.rightIds)
      ? pair.rightIds
      : Array.isArray(pair.rightColumnIds)
        ? pair.rightColumnIds
        : [pair.rightId].filter(Boolean);

    leftIds.forEach((leftId) => {
      if (!expected.has(leftId)) expected.set(leftId, new Set());
      rightIds.forEach((rightId) => expected.get(leftId).add(rightId));
    });
  });

  return expected;
}

function isExpectedMatch(expected, leftId, rightId) {
  return expected.get(leftId)?.has(rightId) === true;
}

export function isMatchingColumnsComplete(leftColumn, pairs, expected) {
  return (
    leftColumn.length > 0 &&
    leftColumn.every((left) =>
      isExpectedMatch(expected, left.id, pairs[left.id]),
    )
  );
}

function MatchCard({ id, icon, image, alt, children, state = "idle" }) {
  const stateClass =
    state === "correct"
      ? "border-green-400 text-green-900 dark:border-green-700 dark:text-green-100"
      : state === "wrong"
        ? "border-red-400 text-red-900 dark:border-red-700 dark:text-red-100"
        : state === "paired"
          ? "border-primary-300 text-slate-900 dark:border-primary-650 dark:text-primary-50"
          : "border-slate-250 text-slate-800 hover:border-primary-400 dark:border-primary-850 dark:text-primary-100";

  return (
    <div
      id={id}
      className={`flex h-full min-h-[5.75rem] w-full items-start gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left shadow-sm transition-all dark:bg-[#132d39] ${stateClass}`}
    >
      <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg opacity-75">
        {icon}
      </span>
      <span className="min-w-0 flex-1 whitespace-normal break-words text-sm font-semibold leading-6">
        {children}
      </span>
      <ComponentImage
        image={image}
        alt={alt}
        caption={false}
        className="h-16 w-20 shrink-0"
        imageClassName="h-full w-full"
      />
    </div>
  );
}

export function MatchingColumnsComponent({ component, onComplete }) {
  const {
    leftColumn = [],
    rightColumn = [],
    correctPairs = [],
  } = component.config;

  const [pairs, setPairs] = useState({});
  const boardRef = useRef(null);
  const [lines, setLines] = useState([]);

  const expected = useMemo(
    () => buildExpectedMatches(correctPairs),
    [correctPairs],
  );
  const pairedRightIds = useMemo(() => new Set(Object.values(pairs)), [pairs]);
  const rowCount = Math.max(leftColumn.length, rightColumn.length);
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    left: leftColumn[index],
    right: rightColumn[index],
  }));
  const complete = isMatchingColumnsComplete(leftColumn, pairs, expected);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
  );

  const updateLines = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();

    const nextLines = Object.entries(pairs)
      .map(([leftId, rightId]) => {
        const leftEl = document.getElementById(`left-${leftId}`);
        const rightEl = document.getElementById(`right-${rightId}`);
        if (!leftEl || !rightEl) return null;

        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        const x1 = leftRect.right - boardRect.left + 3;
        const y1 = leftRect.top + leftRect.height / 2 - boardRect.top;
        const x2 = rightRect.left - boardRect.left - 3;
        const y2 = rightRect.top + rightRect.height / 2 - boardRect.top;
        const dx = Math.max(32, Math.abs(x2 - x1) * 0.48);

        return {
          id: `${leftId}-${rightId}`,
          correct: isExpectedMatch(expected, leftId, rightId),
          path: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
        };
      })
      .filter(Boolean);

    setLines(nextLines);
  }, [expected, pairs]);

  useEffect(() => {
    const frame = requestAnimationFrame(updateLines);
    window.addEventListener("resize", updateLines);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateLines)
        : null;
    if (boardRef.current && observer) observer.observe(boardRef.current);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateLines);
      observer?.disconnect();
    };
  }, [updateLines]);

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    setPairs((prev) => ({ ...prev, [active.id]: over.id }));
  };

  return (
    <ComponentFrame component={component}>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <LessonHint
          steps={[
            "Kéo một khái niệm ở cột trái.",
            "Thả vào định nghĩa tương ứng ở cột phải.",
            "Đường nối sẽ đổi màu để bạn biết cặp nào đúng hoặc cần sửa.",
          ]}
        />

        <div className="mb-3 mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-[#15313e] dark:text-primary-100">
            Đã nối {Object.keys(pairs).length}/{leftColumn.length}
          </span>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-2">
            <div ref={boardRef} className="relative min-w-0 pb-1">
              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
                <defs>
                  <marker
                    id="matching-arrow-green"
                    markerHeight="8"
                    markerWidth="8"
                    orient="auto"
                    refX="6"
                    refY="4"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="#22c55e" />
                  </marker>
                  <marker
                    id="matching-arrow-red"
                    markerHeight="8"
                    markerWidth="8"
                    orient="auto"
                    refX="6"
                    refY="4"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="#f87171" />
                  </marker>
                </defs>
                {lines.map((line) => (
                  <path
                    key={line.id}
                    d={line.path}
                    fill="none"
                    markerEnd={`url(#${
                      line.correct
                        ? "matching-arrow-green"
                        : "matching-arrow-red"
                    })`}
                    strokeWidth="3.5"
                    className={
                      line.correct ? "stroke-green-500" : "stroke-red-400"
                    }
                    strokeLinecap="round"
                  />
                ))}
              </svg>

              <div className="relative z-20 grid gap-y-3">
                {rows.map(({ left, right }, index) => {
                  const isLeftPaired = left && pairs[left.id] !== undefined;
                  const isLeftCorrect =
                    left &&
                    isLeftPaired &&
                    isExpectedMatch(expected, left.id, pairs[left.id]);
                  const isTargetPaired = right && pairedRightIds.has(right.id);

                  return (
                    <div
                      key={`${left?.id || "left-empty"}-${right?.id || "right-empty"}-${index}`}
                      className="grid min-h-[5.75rem] grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-stretch gap-3"
                    >
                      <div className="min-w-0">
                        {left && (
                          <DragItem id={left.id}>
                            <MatchCard
                              id={`left-${left.id}`}
                              image={firstImageAsset(
                                [left.image, left.imageUrl, left.media],
                                left.text,
                              )}
                              alt={left.text}
                              icon={
                                isLeftCorrect
                                  ? "check_circle"
                                  : "drag_indicator"
                              }
                              state={
                                isLeftCorrect
                                  ? "correct"
                                  : isLeftPaired
                                    ? "wrong"
                                    : "idle"
                              }
                            >
                              {left.text}
                            </MatchCard>
                          </DragItem>
                        )}
                      </div>

                      <div className="flex items-center justify-center">
                        <span className="h-px w-full rounded-full bg-slate-200 dark:bg-primary-850/60" />
                      </div>

                      <div className="min-w-0">
                        {right && (
                          <DropZone id={right.id} className="h-full w-full">
                            <MatchCard
                              id={`right-${right.id}`}
                              image={firstImageAsset(
                                [right.image, right.imageUrl, right.media],
                                right.text,
                              )}
                              alt={right.text}
                              icon={isTargetPaired ? "link" : "trip_origin"}
                              state={isTargetPaired ? "paired" : "idle"}
                            >
                              {right.text}
                            </MatchCard>
                          </DropZone>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DndContext>

        {complete && (
          <div className="relative z-30 mt-4 shrink-0 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 shadow-sm dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
            <p className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined">task_alt</span>
              Các cặp nối đã chính xác.
            </p>
            <ContinueButton
              onComplete={() =>
                onComplete({ score: 100, answer: pairs, status: "completed" })
              }
              label="Tiếp tục"
            />
          </div>
        )}
      </div>
    </ComponentFrame>
  );
}
