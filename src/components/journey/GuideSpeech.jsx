import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar } from "./JourneyArt";
import { CHARACTERS } from "../../data/journeyContent";
import { TYPEWRITER_SPEED_MS } from "../../constants";

// ============================================================================
// HE THONG HOI THOAI cho bai hoc tuong tac.
// Co che choi don: he thong dong cac vai (NPC) va lan luot "noi" voi nguoi hoc
// qua cac bong bong thoai -> tao cam giac dang hoc cung mot nhom nguoi.
// ============================================================================

// Kiem tra nguoi dung co bat "giam chuyen dong" khong -> tat hieu ung go chu cho de chiu.
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Hook hieu ung go chu (typewriter). Tra ve { shown, done, finishNow }.
function useTypewriter(fullText, enabled = true) {
  const [shown, setShown] = useState(enabled ? "" : fullText);
  const [done, setDone] = useState(!enabled);
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    // Neu tat hieu ung (reduced-motion) -> hien toan bo ngay
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

// Mot bong bong thoai: avatar + ten vai + noi dung.
function SpeechBubble({ who, text, animate, onTypingDone }) {
  const character = CHARACTERS[who] || CHARACTERS.guide;
  const { shown, done, finishNow } = useTypewriter(text, animate);

  useEffect(() => {
    if (done) onTypingDone?.();
  }, [done, onTypingDone]);

  return (
    <div className="flex items-start gap-3 j-bubble-in">
      <div
        className={`shrink-0 rounded-full bg-gradient-to-br ${character.color} p-0.5 shadow-md`}
      >
        <Avatar id={character.avatar} size={44} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-sm text-gray-900">{character.name}</span>
          <span className="text-[11px] text-gray-400">{character.role}</span>
        </div>
        <div
          className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-gray-800 leading-relaxed"
          onClick={() => !done && finishNow()}
        >
          {shown}
          {!done && <span className="j-caret" aria-hidden>▋</span>}
        </div>
      </div>
    </div>
  );
}

// Chuoi hoi thoai phat lan luot. Nguoi hoc bam "Tiep" de hien dong tiep theo.
// Khi da hien het -> goi onComplete() de cha hien UI buoc ke (cau hoi, nut...).
export default function DialogueSequence({ lines, onComplete, ctaLabel = "Tiếp tục" }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentTypingDone, setCurrentTypingDone] = useState(false);
  const scrollAnchorRef = useRef(null);

  const isLastVisible = visibleCount >= lines.length;
  const allDone = isLastVisible && currentTypingDone;

  // Cuon nhe toi dong moi nhat cho de theo doi
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visibleCount, currentTypingDone]);

  // Reset khi danh sach loi thay doi (chuyen sang doan hoi thoai khac)
  useEffect(() => {
    setVisibleCount(1);
    setCurrentTypingDone(false);
  }, [lines]);

  const handleNext = () => {
    if (!isLastVisible) {
      setCurrentTypingDone(false);
      setVisibleCount((c) => c + 1);
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {lines.slice(0, visibleCount).map((line, index) => {
          const isCurrent = index === visibleCount - 1;
          return (
            <SpeechBubble
              key={index}
              who={line.who}
              text={line.text}
              animate={isCurrent}
              onTypingDone={isCurrent ? () => setCurrentTypingDone(true) : undefined}
            />
          );
        })}
        <div ref={scrollAnchorRef} />
      </div>

      <div className="mt-5 flex justify-end">
        {!allDone ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentTypingDone}
            className="inline-flex items-center gap-1.5 bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Tiếp
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors j-bubble-in"
          >
            {ctaLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Xuat lai SpeechBubble de cac vong dung lai khi can hien 1 cau thoai don le.
export { SpeechBubble };
