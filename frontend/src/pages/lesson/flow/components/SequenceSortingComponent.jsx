import React, { useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";

export function SequenceSortingComponent({ component, onComplete }) {
  const items = component.config.items || [];
  const [placed, setPlaced] = useState([]);
  const [lastWrongId, setLastWrongId] = useState(null);
  const complete = items.length > 0 && placed.length === items.length;

  const pick = (item) => {
    if (placed.includes(item.id)) return;
    if (
      (item.order ?? items.findIndex((it) => it.id === item.id)) ===
      placed.length
    ) {
      setPlaced((prev) => [...prev, item.id]);
      setLastWrongId(null);
    } else {
      setLastWrongId(item.id);
    }
  };

  return (
    <ComponentFrame component={component}>
      <LessonHint
        steps={[
          "Đọc yêu cầu và tìm bước đầu tiên.",
          "Bấm các thẻ theo đúng trình tự.",
          "Thẻ đã chọn đúng sẽ chuyển vào dòng thời gian.",
        ]}
      />
      {component.config.instruction && (
        <p className="text-sm font-medium text-slate-600 dark:text-primary-200 mb-4">
          {component.config.instruction}
        </p>
      )}
      <div className="space-y-2 mb-4">
        {placed.map((id, index) => {
          const item = items.find((it) => it.id === id);
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border-2 border-green-400 dark:border-green-800 bg-green-50 dark:bg-green-950/35 px-4 py-3"
            >
              <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-sm text-green-950 dark:text-green-100 font-medium">
                {item?.text}
              </span>
            </div>
          );
        })}
      </div>
      {!complete && (
        <div className="grid sm:grid-cols-2 gap-3">
          {items
            .filter((item) => !placed.includes(item.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pick(item)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
                  lastWrongId === item.id
                    ? "border-red-400 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
                    : "border-slate-250 bg-white text-slate-800 hover:border-primary-400 hover:bg-primary-50 dark:border-primary-850 dark:bg-[#132d39] dark:text-primary-100 dark:hover:bg-primary-900/35"
                }`}
              >
                {item.text}
              </button>
            ))}
        </div>
      )}
      {lastWrongId && !complete && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
          Chưa đúng thứ tự. Hãy chọn mắt xích logic tiếp theo trong chuỗi.
        </p>
      )}
      {complete && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/35 border border-green-200 dark:border-green-800 rounded-3xl p-4 text-green-950 dark:text-green-100">
          <p className="font-bold">
            {component.config.successFeedback || "Sắp xếp chính xác."}
          </p>
          <ContinueButton
            onComplete={() =>
              onComplete({ score: 100, answer: placed, status: "completed" })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}
