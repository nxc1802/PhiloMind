import React, { useRef, useState } from "react";
import { ComponentFrame } from "./ComponentFrame";

function Spark({ className = "" }) {
  return (
    <span
      className={`pointer-events-none absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.9)] ${className}`}
    />
  );
}

export function KnowledgePieceComponent({ component, onComplete }) {
  const pieceRef = useRef(null);
  const [flyer, setFlyer] = useState(null);
  const [flying, setFlying] = useState(false);
  const [collected, setCollected] = useState(false);

  const {
    pieceId = component.id,
    label = component.title || "Mảnh ghép tri thức",
    summary,
    takeaways = [],
    icon = "extension",
    color = "from-amber-400 via-orange-500 to-primary-600",
  } = component.config || {};

  const complete = () => {
    setCollected(true);
    onComplete({
      score: 100,
      status: "completed",
      pieceId,
      pieceLabel: label,
    });
  };

  const collectPiece = () => {
    if (collected || flying) return;

    const source = pieceRef.current?.getBoundingClientRect();
    const targetSlot = document.querySelector(
      `[data-piece-target="true"][data-piece-id="${pieceId}"]`,
    );
    const targetElement =
      targetSlot?.querySelector(".piece-target-icon") || targetSlot;
    const target = targetElement?.getBoundingClientRect();

    if (!source || !target) {
      complete();
      return;
    }

    const targetScale = Math.max(
      0.16,
      Math.min(0.32, target.width / source.width),
    );

    setFlyer({
      left: source.left,
      top: source.top,
      width: source.width,
      height: source.height,
      dx: target.left + target.width / 2 - (source.left + source.width / 2),
      dy: target.top + target.height / 2 - (source.top + source.height / 2),
      scale: targetScale,
      icon,
      label,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlying(true));
    });

    window.setTimeout(() => {
      setFlyer(null);
      setFlying(false);
      complete();
    }, 1150);
  };

  return (
    <ComponentFrame component={component}>
      {flyer && (
        <div
          data-knowledge-piece-flyer="true"
          data-piece-id={pieceId}
          className="pointer-events-none fixed z-[120] flex items-center justify-center rounded-[2rem] border border-white/40 bg-white/10 p-2 shadow-2xl backdrop-blur"
          style={{
            left: flyer.left,
            top: flyer.top,
            width: flyer.width,
            height: flyer.height,
            opacity: flying ? 0.82 : 1,
            transform: flying
              ? `translate(${flyer.dx}px, ${flyer.dy}px) scale(${flyer.scale}) rotate(720deg)`
              : "translate(0, 0) scale(1) rotate(0deg)",
            transition:
              "transform 1100ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1100ms ease",
          }}
        >
          <div className="relative flex h-full w-full items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500 text-white shadow-[0_24px_80px_rgba(245,158,11,0.58)]">
            <span className="j-piece-aura-spin absolute inset-2 rounded-[1.5rem] border-2 border-dashed border-white/45" />
            <span className="absolute inset-5 rounded-[1.1rem] bg-white/15 blur-sm" />
            <span className="material-symbols-outlined relative z-10 text-6xl drop-shadow-lg">
              {flyer.icon}
            </span>
          </div>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-primary-50 p-5 text-slate-900 shadow-inner dark:border-amber-800/60 dark:from-amber-950/30 dark:via-[#102733] dark:to-primary-950/50 dark:text-primary-100">
        <Spark className="right-8 top-8 animate-pulse" />
        <Spark className="bottom-16 left-10 h-1.5 w-1.5 animate-ping" />
        <Spark className="right-16 top-28 h-1.5 w-1.5 animate-pulse" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
          <div
            ref={pieceRef}
            className={`j-unlock j-piece-gold-pulse relative flex h-36 w-36 items-center justify-center rounded-[2rem] bg-gradient-to-br ${color} text-white shadow-[0_24px_80px_rgba(245,158,11,0.35)]`}
          >
            <div className="absolute inset-3 rounded-[1.5rem] border border-white/35" />
            <span className="material-symbols-outlined text-7xl">{icon}</span>
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
            Mảnh ghép kiến thức
          </p>
          <h3 className="mt-2 text-2xl font-extrabold leading-tight text-primary-950 dark:text-primary-100">
            {label}
          </h3>
          {summary && (
            <p className="mt-3 max-w-md text-sm font-medium leading-6 text-slate-650 dark:text-primary-200">
              {summary}
            </p>
          )}

          {takeaways.length > 0 && (
            <div className="mt-5 grid w-full gap-2 text-left">
              {takeaways.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-sm leading-6 shadow-sm dark:border-primary-850/60 dark:bg-primary-950/35"
                >
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-amber-600 dark:text-amber-300">
                    auto_awesome
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 mt-5 flex justify-end">
          <button
            type="button"
            onClick={collectPiece}
            disabled={flying || collected}
            className="inline-flex items-center gap-2 rounded-3xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
          >
            {collected
              ? "Đã thu thập"
              : flying
                ? "Đang thu thập..."
                : "Thu thập mảnh ghép"}
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </ComponentFrame>
  );
}
