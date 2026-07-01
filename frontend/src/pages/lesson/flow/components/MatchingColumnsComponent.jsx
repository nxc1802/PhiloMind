import React, { useState, useRef, useEffect, useCallback } from "react";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";
import { DragItem, DropZone } from "./dnd";

export function MatchingColumnsComponent({ component, onComplete }) {
  const {
    leftColumn = [],
    rightColumn = [],
    correctPairs = [],
  } = component.config;
  
  const [pairs, setPairs] = useState({});
  const expected = Object.fromEntries(
    correctPairs.map((pair) => [pair.leftId, pair.rightId]),
  );
  
  const rightById = Object.fromEntries(
    rightColumn.map((right) => [right.id, right]),
  );
  const leftById = Object.fromEntries(
    leftColumn.map((left) => [left.id, left]),
  );
  
  const pairedRightIds = new Set(Object.values(pairs));
  const complete =
    leftColumn.length > 0 &&
    leftColumn.every((left) => pairs[left.id] === expected[left.id]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      setPairs((prev) => ({ ...prev, [active.id]: over.id }));
    }
  };

  // SVG Connector logic
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];
    
    Object.entries(pairs).forEach(([leftId, rightId]) => {
      const leftEl = document.getElementById(`left-${leftId}`);
      const rightEl = document.getElementById(`right-${rightId}`);
      
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        
        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
        
        const correct = expected[leftId] === rightId;
        newLines.push({ x1, y1, x2, y2, correct, id: `${leftId}-${rightId}` });
      }
    });
    setLines(newLines);
  }, [pairs, expected]);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [updateLines]);

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Kéo một khái niệm ở cột trái.",
          "Thả vào định nghĩa tương ứng ở cột phải.",
          "Quan sát đường nối màu xanh/đỏ để nhận biết đúng sai. Có thể kéo lại để sửa.",
        ]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-slate-100 dark:bg-[#15313e] text-slate-700 dark:text-primary-100 px-3 py-1">
          Đã nối {Object.keys(pairs).length}/{leftColumn.length}
        </span>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative" ref={containerRef}>
          {/* SVG Overlay for Bezier curves */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {lines.map((line) => {
              // Bezier curve points
              const dx = Math.abs(line.x2 - line.x1) * 0.5;
              const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;
              return (
                <path
                  key={line.id}
                  d={path}
                  fill="none"
                  strokeWidth="3"
                  className={line.correct ? "stroke-green-500" : "stroke-red-400"}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          <div className="grid grid-cols-2 gap-8 md:gap-16 relative z-10">
            {/* Left Column (Drag Items) */}
            <div className="space-y-4">
              {leftColumn.map((left) => {
                const isPaired = pairs[left.id] !== undefined;
                const isCorrect = isPaired && pairs[left.id] === expected[left.id];
                
                return (
                  <DragItem key={left.id} id={left.id}>
                    <div
                      id={`left-${left.id}`}
                      className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-all max-h-32 overflow-hidden bg-white dark:bg-[#132d39] ${
                        isCorrect
                          ? "border-green-500 shadow-sm text-green-900 dark:text-green-100"
                          : isPaired
                            ? "border-red-400 shadow-sm text-red-900 dark:text-red-100"
                            : "border-slate-250 text-slate-800 dark:text-primary-100 hover:border-primary-400"
                      }`}
                    >
                      <div className="flex items-start gap-3 h-full">
                        <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
                          {isCorrect ? "check_circle" : "drag_indicator"}
                        </span>
                        <span className="line-clamp-3">{left.text}</span>
                      </div>
                    </div>
                  </DragItem>
                );
              })}
            </div>

            {/* Right Column (Drop Zones) */}
            <div className="space-y-4">
              {rightColumn.map((right) => {
                const isTargetPaired = pairedRightIds.has(right.id);
                
                return (
                  <DropZone key={right.id} id={right.id} className="w-full h-full">
                    <div
                      id={`right-${right.id}`}
                      className={`w-full h-full min-h-[4rem] rounded-2xl border-2 px-4 py-3 text-left font-medium transition-all max-h-32 overflow-hidden bg-white dark:bg-[#132d39] ${
                        isTargetPaired
                          ? "border-primary-300 text-slate-900 dark:text-primary-50 shadow-sm"
                          : "border-dashed border-slate-300 text-slate-700 dark:text-primary-150 hover:border-primary-400"
                      }`}
                    >
                      <div className="flex items-start gap-3 h-full">
                        <span className="material-symbols-outlined text-lg shrink-0 mt-0.5 opacity-50">
                          {isTargetPaired ? "link" : "trip_origin"}
                        </span>
                        <span className="line-clamp-3">{right.text}</span>
                      </div>
                    </div>
                  </DropZone>
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>

      {complete && (
        <div className="mt-6 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span> Các cặp nối đã chính xác.
          </p>
          <ContinueButton
            onComplete={() =>
              onComplete({ score: 100, answer: pairs, status: "completed" })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}
