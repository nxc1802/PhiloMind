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
        className={`j-avatar-pop flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${character.color} p-[2px] shadow-lg ring-4 ring-white/80 dark:ring-primary-950/70 ${
          isNarrator ? "mr-3" : isRight ? "ml-3" : "mr-3"
        }`}
      >
        <Avatar
          id={character.avatar}
          size={64}
          className="h-full w-full rounded-full"
        />
      </div>
      <div
        className={`min-w-0 ${isNarrator ? "max-w-[92%] flex-1" : "max-w-[78%]"}`}
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
        <div
          className={`j-chat-pop border px-4 py-3 text-sm leading-6 ${
            isNarrator
              ? "rounded-3xl border-primary-100 bg-primary-50 text-primary-900 dark:border-primary-850 dark:bg-primary-950/35 dark:text-primary-100"
              : isRight
                ? "rounded-3xl rounded-tr-sm border-primary-200 bg-primary-600 text-white dark:border-primary-600"
                : "rounded-3xl rounded-tl-sm border-gray-200 bg-white text-gray-800 dark:border-primary-850 dark:bg-[#002b37] dark:text-primary-150"
          }`}
        >
          {text}
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
}) {
  const [visibleCount, setVisibleCount] = useState(1);
  const scrollAnchorRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const linesKey = useMemo(
    () => JSON.stringify(lines.map((line) => [line.who, line.text])),
    [lines],
  );

  const isLastVisible = visibleCount >= lines.length;
  const allDone = isLastVisible;

  const lineSides = useMemo(() => {
    let nonGuideIndex = 0;
    return lines.map((line) => {
      if (line.side) return line.side;
      if (line.who === "guide" || line.who === "narrator") return "center";
      const side = nonGuideIndex % 2 === 0 ? "left" : "right";
      nonGuideIndex += 1;
      return side;
    });
  }, [lines]);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "end",
      });
    });
  }, []);

  useEffect(() => {
    setVisibleCount(1);
  }, [linesKey]);

  useEffect(() => {
    scrollToLatest();
  }, [visibleCount, allDone, scrollToLatest]);

  useEffect(() => {
    if (!allDone) return undefined;
    const timer = setTimeout(scrollToLatest, 80);
    return () => clearTimeout(timer);
  }, [allDone, scrollToLatest]);

  const showNextLine = useCallback(() => {
    setVisibleCount((c) => Math.min(c + 1, lines.length));
  }, [lines.length]);

  useEffect(() => {
    clearTimeout(advanceTimerRef.current);
    if (autoPlay && !isLastVisible) {
      advanceTimerRef.current = setTimeout(showNextLine, NPC_REVEAL_DELAY_MS);
    }
    return () => clearTimeout(advanceTimerRef.current);
  }, [autoPlay, isLastVisible, showNextLine]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="space-y-3 overflow-y-auto pr-1">
        {lines.slice(0, visibleCount).map((line, index) => {
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

      <div className="mt-auto pt-5 flex justify-end shrink-0">
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
        ) : (
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
