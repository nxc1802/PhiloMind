import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

function getNodeText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.text || value.label || value.detail || "";
  }
  return "";
}

function getNodeDetail(value) {
  if (value && typeof value === "object") {
    return value.detail || value.description || "";
  }
  return "";
}

/**
 * MindmapRevealComponent — "Hợp nhất tri thức" dạng BẢN ĐỒ TƯ DUY TOẢ TIA.
 *
 * Một nút trung tâm (khái niệm đích) với các mảnh tri thức toả ra xung quanh.
 * Mỗi mảnh được mở (tự động sau 2s hoặc bấm) sẽ thắp sáng đường nối (spoke)
 * chạy về tâm. Khi đủ tất cả, cả sơ đồ phát sáng và hiện phần tổng kết.
 *
 * Đường nối được vẽ bằng SVG, toạ độ đo lại theo vị trí thực của nút tâm và
 * từng thẻ nhánh — nên vẫn khớp khi kéo vách chia cột hay đổi kích thước.
 */
export function MindmapRevealComponent({ component, onComplete }) {
  const nodes = component.config.nodes || [];
  const centerLabel = component.config.center || "Triết học";
  const [revealed, setRevealed] = useState([]);

  const revealedCount = revealed.length;
  const complete = nodes.length > 0 && revealedCount === nodes.length;

  // --- Đo toạ độ để vẽ spoke ---
  const canvasRef = useRef(null);
  const hubRef = useRef(null);
  const nodeRefs = useRef([]);
  const [spokes, setSpokes] = useState([]);
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const canvasEl = canvasRef.current;
    const hubEl = hubRef.current;
    if (!canvasEl || !hubEl) return;

    const c = canvasEl.getBoundingClientRect();
    const h = hubEl.getBoundingClientRect();
    const hubX = h.left - c.left + h.width / 2;
    const hubY = h.top - c.top + h.height / 2;

    const next = nodes
      .map((node, i) => {
        const el = nodeRefs.current[i];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        // Neo vào cạnh gần tâm của thẻ nhánh.
        const nodeX = r.left - c.left;
        const nodeY = r.top - c.top + r.height / 2;
        return { id: node.id, x1: hubX, y1: hubY, x2: nodeX, y2: nodeY };
      })
      .filter(Boolean);

    setSpokes(next);
    setCanvas({ w: c.width, h: c.height });
  }, [nodes]);

  useLayoutEffect(() => {
    measure();
    const raf = requestAnimationFrame(measure);
    const canvasEl = canvasRef.current;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;
    if (ro && canvasEl) ro.observe(canvasEl);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, revealedCount]);

  // Tự động mở tuần tự (2s), vẫn cho phép bấm để mở nhanh.
  useEffect(() => {
    if (nodes.length === 0 || revealed.length >= nodes.length) return;
    const timer = setTimeout(() => {
      setRevealed((prev) => {
        const nextNode = nodes.find((node) => !prev.includes(node.id));
        return nextNode ? [...prev, nextNode.id] : prev;
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [revealed.length, nodes]);

  const handleReveal = (nodeId) => {
    if (!revealed.includes(nodeId)) {
      setRevealed((prev) => [...prev, nodeId]);
    }
  };

  const isRevealed = (id) => revealed.includes(id);

  return (
    <ComponentFrame component={component}>
      <style>{`
        @keyframes mmSpokeFlow { to { stroke-dashoffset: -28; } }
        .mm-spoke-active { animation: mmSpokeFlow 1.1s linear infinite; }
      `}</style>

      {/* Header gọn — bỏ khối 'tiến độ' + progress bar trùng lặp, chỉ giữ 1 chip */}
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
            Bản đồ tư duy
          </p>
        </div>
        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-extrabold transition-colors",
            complete
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
              : "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/35 dark:text-primary-200",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[18px]">
            {complete ? "hub" : "linked_services"}
          </span>
          {revealedCount}/{nodes.length}
        </span>
      </div>

      {/* Sơ đồ toả tia: hub (trái) + các nhánh (phải), spoke vẽ SVG ở giữa */}
      <div
        ref={canvasRef}
        className="relative grid min-h-[16rem] shrink-0 grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4 sm:gap-x-10"
      >
        {/* Lớp SVG đường nối */}
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
          width={canvas.w}
          height={canvas.h}
          viewBox={`0 0 ${canvas.w || 1} ${canvas.h || 1}`}
          fill="none"
          aria-hidden="true"
        >
          {spokes.map((s) => {
            const active = isRevealed(s.id);
            const midX = (s.x1 + s.x2) / 2;
            const d = `M ${s.x1} ${s.y1} C ${midX} ${s.y1}, ${midX} ${s.y2}, ${s.x2} ${s.y2}`;
            return (
              <path
                key={s.id}
                d={d}
                stroke="currentColor"
                strokeWidth={active ? 2.5 : 2}
                strokeLinecap="round"
                strokeDasharray={active ? "6 7" : "2 8"}
                className={[
                  active
                    ? "mm-spoke-active text-primary-500 dark:text-primary-400"
                    : "text-slate-300 dark:text-slate-700",
                ].join(" ")}
                style={{
                  filter: active
                    ? "drop-shadow(0 0 5px currentColor)"
                    : "none",
                  transition: "stroke-width 300ms",
                }}
              />
            );
          })}
        </svg>

        {/* Nút trung tâm */}
        <div className="relative z-10 flex justify-center">
          <div
            ref={hubRef}
            className={[
              "flex w-32 flex-col items-center gap-2 rounded-3xl border-2 p-4 text-center transition-all duration-500 sm:w-40",
              complete
                ? "border-amber-300 bg-gradient-to-br from-primary-600 to-amber-500 text-white shadow-[0_0_0_5px_rgba(251,191,36,0.18),0_16px_40px_rgba(37,99,235,0.35)]"
                : "border-primary-200 bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-[0_10px_30px_rgba(37,99,235,0.28)] dark:border-primary-500",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl",
                complete ? "animate-pulse" : "",
              ].join(" ")}
            >
              <span className="material-symbols-outlined text-3xl">
                psychology
              </span>
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Khái niệm đích
              </p>
              <p className="text-base font-extrabold leading-tight">
                {centerLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Các nhánh tri thức */}
        <div className="relative z-10 flex min-w-0 flex-col gap-4">
          {nodes.map((node, index) => {
            const open = isRevealed(node.id);
            const title = getNodeText(node.back) || node.label || "";
            const detail = getNodeDetail(node.back) || node.detail;
            const frontText = getNodeText(node.front);

            return (
              <button
                key={node.id}
                type="button"
                ref={(el) => (nodeRefs.current[index] = el)}
                onClick={() => handleReveal(node.id)}
                aria-label={`Mở mảnh tri thức ${index + 1}`}
                className={[
                  "group relative w-full min-w-0 rounded-2xl border-2 p-3.5 text-left transition-all duration-500",
                  open
                    ? "border-primary-300 bg-white shadow-sm dark:border-primary-700 dark:bg-[#132d39]"
                    : "border-dashed border-slate-250 bg-slate-50 hover:border-primary-300 hover:bg-white dark:border-primary-850 dark:bg-primary-950/25 dark:hover:bg-[#132d39]",
                ].join(" ")}
              >
                {/* Chấm neo ở cạnh trái — điểm spoke cắm vào */}
                <span
                  className={[
                    "absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-500",
                    open
                      ? "border-primary-400 bg-primary-500 shadow-[0_0_10px_rgba(37,99,235,0.7)]"
                      : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800",
                  ].join(" ")}
                  aria-hidden="true"
                />

                <div className="flex min-w-0 items-start gap-2.5 pl-2">
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-500",
                      open
                        ? "bg-primary-600 text-white"
                        : "bg-white text-slate-300 shadow-sm dark:bg-primary-950 dark:text-primary-650",
                    ].join(" ")}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {open ? "check_circle" : "lock_open"}
                    </span>
                  </span>

                  <div className="min-w-0 flex-1">
                    {open ? (
                      <>
                        <p className="break-words text-base font-extrabold leading-snug text-primary-900 dark:text-primary-100">
                          {title}
                        </p>
                        {detail && (
                          <p className="mt-1 max-h-24 overflow-y-auto whitespace-normal break-words pr-1 text-sm leading-6 text-slate-650 dark:text-primary-200">
                            {detail}
                          </p>
                        )}
                      </>
                    ) : (
                      frontText && (
                        <p className="break-words text-sm font-bold leading-6 text-slate-500 dark:text-primary-200">
                          {frontText}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tổng kết — điểm 'done' duy nhất, là đỉnh của quá trình hợp nhất */}
      {complete && (
        <div className="mt-5 shrink-0 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-primary-50 p-5 text-primary-950 dark:border-amber-800 dark:from-amber-950/30 dark:to-primary-950/40 dark:text-primary-100">
          {component.config.summary && (
            <p className="text-sm font-semibold leading-relaxed text-slate-700 dark:text-primary-150">
              {component.config.summary}
            </p>
          )}
          <ContinueButton
            onComplete={() =>
              onComplete({ score: 100, answer: revealed, status: "completed" })
            }
            label="Tiếp tục"
          />
        </div>
      )}
    </ComponentFrame>
  );
}
