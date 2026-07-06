import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Avatar } from "./JourneyArt";

export const CHARACTERS = {
  guide: {
    name: "Sophia",
    role: "Người Khai Sáng dẫn đường",
    avatar: "guide",
    color: "from-indigo-500 to-violet-600",
  },
  elder: {
    name: "Già làng Kael",
    role: "Trưởng bộ tộc",
    avatar: "elder",
    color: "from-amber-500 to-orange-600",
  },
  skeptic: {
    name: "Người hoài nghi Lyra",
    role: "Kẻ phản biện trong bộ tộc",
    avatar: "skeptic",
    color: "from-cyan-500 to-blue-600",
  },
  slave: {
    name: "Người lao động Borin",
    role: "Tầng lớp lao động chân tay",
    avatar: "slave",
    color: "from-stone-500 to-stone-700",
  },
  noble: {
    name: "Quý tộc Theon",
    role: "Tầng lớp lao động trí óc",
    avatar: "noble",
    color: "from-fuchsia-500 to-purple-600",
  },
  artisan: {
    name: "Thợ rèn Damos",
    role: "Thợ thủ công thành bang",
    avatar: "artisan",
    color: "from-orange-500 to-red-600",
  },
  merchant: {
    name: "Thương nhân Mira",
    role: "Người buôn bán đường biển",
    avatar: "merchant",
    color: "from-emerald-500 to-teal-700",
  },
  scholar: {
    name: "Học giả Anax",
    role: "Người hệ thống hóa tri thức",
    avatar: "scholar",
    color: "from-blue-500 to-indigo-700",
  },
  child: {
    name: "Cậu bé Ianos",
    role: "Người học việc",
    avatar: "child",
    color: "from-sky-400 to-cyan-600",
  },
  commander: {
    name: "Chỉ huy Dorian",
    role: "Người đại diện quyền lực thành bang",
    avatar: "commander",
    color: "from-rose-500 to-pink-700",
  },
};

const NPC_REVEAL_DELAY_MS = 1200;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function SpeechBubble({ who, text, side = "left", characters }) {
  const character = characters?.[who] || CHARACTERS[who] || CHARACTERS.guide;
  const isRight = side === "right";
  const isNarrator = side === "center";
  const directionClass = isNarrator
    ? "j-dialogue-center"
    : isRight
      ? "j-dialogue-right"
      : "j-dialogue-left";

  // Tông màu nền/viền/chữ của bong bóng — dùng chung cho thân và các puff đuôi
  // để đám mây liền một khối trên cả nền sáng lẫn tối.
  const bubbleTone = isNarrator
    ? "border-primary-100 bg-primary-50 text-primary-900 dark:border-primary-850 dark:bg-primary-950/35 dark:text-primary-100"
    : isRight
      ? "border-primary-200 bg-primary-600 text-white dark:border-primary-600"
      : "border-gray-200 bg-white text-gray-800 dark:border-primary-850 dark:bg-[#002b37] dark:text-primary-150";

  return (
    <div
      className={`flex items-start text-left ${directionClass} ${
        isNarrator
          ? "justify-center"
          : isRight
            ? "flex-row-reverse justify-start"
            : "justify-start"
      }`}
    >
      <div
        className={`j-avatar-pop flex h-20 w-20 shrink-0 items-center justify-center overflow-visible rounded-full bg-gradient-to-br ${character.color} p-1 shadow-lg ring-4 ring-white/80 dark:ring-primary-950/70 ${
          isNarrator ? "mr-3" : isRight ? "ml-3" : "mr-3"
        }`}
      >
        <div className="h-full w-full rounded-full bg-white/15 p-0.5 dark:bg-primary-950/15">
          <Avatar
            id={character.avatar}
            size={72}
            className="h-full w-full overflow-visible rounded-full"
          />
        </div>
      </div>
      <div
        className={`min-w-0 ${isNarrator ? "max-w-[92%] flex-1" : "max-w-[74%]"}`}
      >
        <div
          className={`mb-1 flex items-baseline gap-2 ${
            isRight ? "justify-end text-right" : "justify-start"
          }`}
        >
          <span className="font-bold text-xs text-gray-900 dark:text-primary-100">
            {character.name}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-primary-400">
            {character.role}
          </span>
        </div>
        {/* Bong bóng chat kiểu đám mây: thân bo tròn đều + đuôi hai puff tròn
            nhỏ dần hướng về phía avatar (trái/phải). Người dẫn (center) không
            có đuôi. */}
        <div className="relative">
          <div
            className={`j-chat-pop relative rounded-[22px] border px-4 py-3 text-sm leading-6 ${bubbleTone}`}
          >
            {text}
          </div>
          {!isNarrator && (
            <>
              <span
                className={`absolute bottom-2.5 h-3.5 w-3.5 rounded-full border ${
                  isRight ? "-right-1" : "-left-1"
                } ${bubbleTone}`}
                aria-hidden="true"
              />
              <span
                className={`absolute -bottom-1 h-2 w-2 rounded-full border ${
                  isRight ? "-right-2.5" : "-left-2.5"
                } ${bubbleTone}`}
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DialogueSequence({
  lines,
  onComplete,
  ctaLabel = "Tiếp tục",
  autoPlay = true,
  characters,
  compact = false,
  completed = false,
}) {
  const safeLines = useMemo(
    () =>
      Array.isArray(lines)
        ? lines.filter((line) => line && typeof line.text === "string")
        : [],
    [lines],
  );
  const [visibleCount, setVisibleCount] = useState(
    completed ? safeLines.length : Math.min(1, safeLines.length),
  );
  const scrollAnchorRef = useRef(null);
  const linesKey = useMemo(
    () => JSON.stringify(safeLines.map((line) => [line.who, line.text])),
    [safeLines],
  );

  const isLastVisible = visibleCount >= safeLines.length;
  const allDone = isLastVisible;

  const lineSides = useMemo(() => {
    let sideIndex = 0;
    return safeLines.map((line) => {
      if (line.side === "left" || line.side === "right") return line.side;
      const side = sideIndex % 2 === 0 ? "left" : "right";
      sideIndex += 1;
      return side;
    });
  }, [safeLines]);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      if (typeof scrollAnchorRef.current?.scrollIntoView === "function") {
        scrollAnchorRef.current.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "end",
        });
      }
    });
  }, []);

  useEffect(() => {
    setVisibleCount(
      completed ? safeLines.length : Math.min(1, safeLines.length),
    );
  }, [completed, safeLines.length, linesKey]);

  useEffect(() => {
    scrollToLatest();
  }, [visibleCount, allDone, scrollToLatest]);

  useEffect(() => {
    if (!allDone) return undefined;
    const timer = setTimeout(scrollToLatest, 80);
    return () => clearTimeout(timer);
  }, [allDone, scrollToLatest]);

  const showNextLine = useCallback(() => {
    setVisibleCount((c) => Math.min(c + 1, safeLines.length));
  }, [safeLines.length]);

  useEffect(() => {
    if (!autoPlay || visibleCount >= safeLines.length) return undefined;
    const timer = setTimeout(showNextLine, NPC_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoPlay, safeLines.length, showNextLine, visibleCount]);

  return (
    <div className={`flex min-h-0 flex-col ${compact ? "" : "h-full flex-1"}`}>
      <div
        className={`min-h-0 space-y-3 pr-1 ${
          compact ? "max-h-[52vh] overflow-y-auto" : "flex-1 overflow-y-auto"
        }`}
      >
        {safeLines.slice(0, visibleCount).map((line, index) => {
          return (
            <SpeechBubble
              key={index}
              who={line.who}
              text={line.text}
              side={lineSides[index]}
              characters={characters}
            />
          );
        })}
        <div ref={scrollAnchorRef} />
      </div>

      <div className="sticky bottom-0 z-20 mt-auto flex shrink-0 justify-end bg-gradient-to-t from-white via-white/95 to-transparent pt-5 dark:from-[#0f2530] dark:via-[#0f2530]/95">
        {!allDone ? (
          !autoPlay && (
            <button
              type="button"
              onClick={showNextLine}
              disabled={isLastVisible}
              className="inline-flex items-center gap-1.5 bg-gray-800 text-white px-5 py-2.5 rounded-3xl font-semibold hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Tiếp
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </button>
          )
        ) : completed ? null : (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-6 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors j-bubble-in"
          >
            {ctaLabel}
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
