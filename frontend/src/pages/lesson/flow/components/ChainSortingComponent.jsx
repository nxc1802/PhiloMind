import React, { useMemo, useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { LessonHint } from "./LessonHint";

/**
 * ChainSortingComponent — Lắp ráp chuỗi nhân quả.
 *
 * Cơ chế mới (thay cho kéo–thả): người học BẤM chọn từng mắt xích theo đúng
 * thứ tự nhân quả. Kiểm tra trực tiếp ngay khi bấm:
 *  - Bấm đúng thứ tự  → thẻ chuyển XANH, gắn số thứ tự và chờ mắt xích tiếp theo.
 *  - Bấm sai thứ tự   → thẻ chớp ĐỎ kèm lời nhắc lý do sai (không tính điểm mất lượt).
 *  - Chọn đủ đúng thứ tự → hiện thông báo thành công như cũ.
 */
export function ChainSortingComponent({ component, onComplete }) {
  const {
    instruction,
    items = [],
    successFeedback,
    reward,
  } = component.config;

  // Trộn thứ tự hiển thị một lần, giữ nguyên vị trí trong suốt lượt chơi
  // để số thứ tự gắn lên từng thẻ không bị nhảy.
  const shuffledItems = useMemo(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const isSorted = shuffled.every((item, i) => item.order === i);
    if (isSorted && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component.id]);

  // Map itemId -> số thứ tự đã gán (1-based). nextOrder là order (0-based) kỳ vọng kế tiếp.
  const [assigned, setAssigned] = useState({});
  const [nextOrder, setNextOrder] = useState(0);
  const [wrongId, setWrongId] = useState(null);
  const [wrongReason, setWrongReason] = useState("");
  const [mistakes, setMistakes] = useState(0);

  const isCompleted = nextOrder >= shuffledItems.length && shuffledItems.length > 0;

  const buildReason = (item) => {
    // Ưu tiên lời nhắc riêng từ dữ liệu nếu có.
    if (item.reason || item.hint || item.explanation) {
      return item.reason || item.hint || item.explanation;
    }
    const expectedItem = shuffledItems.find((it) => it.order === nextOrder);
    if (item.order > nextOrder) {
      return `Đây là hệ quả xảy ra về sau. Trước nó phải là: “${
        expectedItem?.text || "mắt xích nguyên nhân trước đó"
      }”.`;
    }
    return "Mắt xích này chưa nằm đúng vị trí trong chuỗi nhân quả.";
  };

  const handlePick = (item) => {
    if (isCompleted) return;
    if (assigned[item.id]) return; // đã gán số rồi

    if (item.order === nextOrder) {
      // Đúng thứ tự → gán số, chuyển xanh, chờ mắt xích tiếp theo.
      setAssigned((prev) => ({ ...prev, [item.id]: nextOrder + 1 }));
      setNextOrder((prev) => prev + 1);
      setWrongId(null);
      setWrongReason("");
    } else {
      // Sai thứ tự → chớp đỏ + hiện lý do.
      setWrongId(item.id);
      setWrongReason(buildReason(item));
      setMistakes((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setAssigned({});
    setNextOrder(0);
    setWrongId(null);
    setWrongReason("");
  };

  return (
    <ComponentFrame component={component}>
      <div className="flex flex-col flex-1 h-full min-h-0">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {instruction && <LessonHint steps={[instruction]} />}

          <div className="mt-2 mb-3 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-slate-600 dark:text-primary-200">
              Chọn mắt xích số{" "}
              <span className="text-primary-600 dark:text-primary-300">
                {Math.min(nextOrder + 1, shuffledItems.length)}
              </span>{" "}
              / {shuffledItems.length}
            </p>
            {(nextOrder > 0 || wrongId) && !isCompleted && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-primary-850 dark:bg-surface-dark-elevated dark:text-primary-200"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Làm lại
              </button>
            )}
          </div>

          <div className="space-y-3 px-1">
            {shuffledItems.map((item) => {
              const number = assigned[item.id];
              const isPicked = Boolean(number);
              const isWrong = wrongId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePick(item)}
                  disabled={isPicked || isCompleted}
                  className={`relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                    isPicked
                      ? "border-green-400 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950/40 dark:text-green-100"
                      : isWrong
                        ? "border-red-400 bg-red-50 text-red-900 shadow-sm dark:border-red-700 dark:bg-red-950/40 dark:text-red-100"
                        : "border-slate-200 bg-white text-slate-800 hover:border-primary-400 hover:bg-primary-50 dark:border-primary-800 dark:bg-surface-dark-elevated dark:text-primary-100 dark:hover:bg-primary-900/25"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold transition-all ${
                      isPicked
                        ? "bg-green-500 text-white"
                        : isWrong
                          ? "bg-red-500 text-white"
                          : "bg-slate-100 text-slate-400 dark:bg-primary-900/50 dark:text-primary-300"
                    }`}
                  >
                    {isPicked ? (
                      number
                    ) : isWrong ? (
                      <span className="material-symbols-outlined text-xl">close</span>
                    ) : (
                      <span className="material-symbols-outlined text-xl">
                        radio_button_unchecked
                      </span>
                    )}
                  </span>

                  {item.icon && (
                    <span className="material-symbols-outlined text-2xl opacity-80">
                      {item.icon}
                    </span>
                  )}
                  <p className="min-w-0 font-semibold leading-snug">{item.text}</p>
                </button>
              );
            })}
          </div>

          {/* Lời nhắc lý do sai — hiện trực tiếp khi bấm sai thứ tự */}
          {wrongId && !isCompleted && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950/35 dark:text-red-100">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-red-500">
                error
              </span>
              <div>
                <p className="font-bold">Chưa đúng thứ tự</p>
                <p className="mt-0.5 text-sm leading-relaxed">{wrongReason}</p>
              </div>
            </div>
          )}
        </div>

        {isCompleted && (
          <div className="mt-auto pt-4 shrink-0">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
              <p className="mb-2 flex items-center gap-2 text-lg font-bold">
                <span className="material-symbols-outlined">task_alt</span>
                {successFeedback || "Chính xác! Chuỗi nhân quả đã hoàn thiện."}
              </p>
              {reward && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  <span className="material-symbols-outlined text-lg">star</span>
                  {reward}
                </div>
              )}
              <ContinueButton
                onComplete={() =>
                  onComplete({
                    score: Math.max(100 - mistakes * 10, 50),
                    attempts: mistakes + 1,
                    answer: shuffledItems
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((i) => i.id),
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
