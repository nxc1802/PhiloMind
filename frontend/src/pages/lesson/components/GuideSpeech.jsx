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
};

const TYPEWRITER_SPEED_MS = 18;
const NPC_REVEAL_DELAY_MS = 550;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useTypewriter(fullText, enabled = true) {
  const [shown, setShown] = useState(enabled ? "" : fullText);
  const [done, setDone] = useState(!enabled);
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!enabled || prefersReducedMotion()) {
      setShown(fullText);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    let index = 0;
    timerRef.current = setInterval(() => {
      index += 1;
      setShown(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(timerRef.current);
        setDone(true);
      }
    }, TYPEWRITER_SPEED_MS);
    return () => clearInterval(timerRef.current);
  }, [fullText, enabled]);

  const finishNow = useCallback(() => {
    clearInterval(timerRef.current);
    setShown(fullText);
    setDone(true);
  }, [fullText]);

  return { shown, done, finishNow };
}

export function SpeechBubble({ who, text, animate, onTypingDone }) {
  const character = CHARACTERS[who] || CHARACTERS.guide;
  const { shown, done, finishNow } = useTypewriter(text, animate);
  const notifiedRef = useRef(false);

  useEffect(() => {
    notifiedRef.current = false;
  }, [text, animate]);

  useEffect(() => {
    if (done && !notifiedRef.current) {
      notifiedRef.current = true;
      onTypingDone?.();
    }
  }, [done, onTypingDone]);

  return (
    <div className="flex items-start gap-2 j-bubble-in text-left">
      <div
        className={`shrink-0 rounded-full bg-gradient-to-br ${character.color} p-[1px] shadow-sm`}
      >
        <Avatar id={character.avatar} size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-xs text-gray-900 dark:text-primary-100">
            {character.name}
          </span>
          <span className="text-[10px] text-gray-400">{character.role}</span>
        </div>
        <div
          className="bg-white dark:bg-[#002b37] border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm text-sm text-gray-800 dark:text-primary-150 leading-snug cursor-pointer"
          onClick={() => !done && finishNow()}
        >
          {shown}
          {!done && (
            <span className="j-caret" aria-hidden>
              ▋
            </span>
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
}) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentTypingDone, setCurrentTypingDone] = useState(false);
  const scrollAnchorRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const linesKey = useMemo(
    () => JSON.stringify(lines.map((line) => [line.who, line.text])),
    [lines],
  );

  const isLastVisible = visibleCount >= lines.length;
  const allDone = isLastVisible && currentTypingDone;

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
    setCurrentTypingDone(false);
  }, [linesKey]);

  useEffect(() => {
    scrollToLatest();
  }, [visibleCount, currentTypingDone, allDone, scrollToLatest]);

  useEffect(() => {
    if (!allDone) return undefined;
    const timer = setTimeout(scrollToLatest, 80);
    return () => clearTimeout(timer);
  }, [allDone, scrollToLatest]);

  const showNextLine = useCallback(() => {
    setCurrentTypingDone(false);
    setVisibleCount((c) => Math.min(c + 1, lines.length));
  }, [lines.length]);

  useEffect(() => {
    clearTimeout(advanceTimerRef.current);
    if (autoPlay && currentTypingDone && !isLastVisible) {
      advanceTimerRef.current = setTimeout(showNextLine, NPC_REVEAL_DELAY_MS);
    }
    return () => clearTimeout(advanceTimerRef.current);
  }, [autoPlay, currentTypingDone, isLastVisible, showNextLine]);

  return (
    <div>
      <div className="space-y-2">
        {lines.slice(0, visibleCount).map((line, index) => {
          const isCurrent = index === visibleCount - 1;
          return (
            <SpeechBubble
              key={index}
              who={line.who}
              text={line.text}
              animate={isCurrent}
              onTypingDone={
                isCurrent ? () => setCurrentTypingDone(true) : undefined
              }
            />
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        {!allDone ? (
          !autoPlay && (
            <button
              type="button"
              onClick={showNextLine}
              disabled={!currentTypingDone || isLastVisible}
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
      <div ref={scrollAnchorRef} />
    </div>
  );
}
