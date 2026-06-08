import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useToast } from "../../components/Toast";
import useLocalStorage from "../../hooks/useLocalStorage";
import { SceneArt } from "./components/JourneyArt";
import DialogueSequence, { SpeechBubble } from "./components/GuideSpeech";
import {
  INTRO,
  ROUND_COGNITIVE,
  ROUND_SOCIAL,
  ROUND_SUMMARY,
  JOURNEY_FINAL_QUIZ,
  COMPLETION,
} from "../../data/journeyContent";

const JOURNEY_STORAGE_KEY = "mln_philosophy_journey_progress";
const JOURNEY_TOTAL_PIECES = 2;
const JOURNEY_FINAL_PASS = 3;

const primitiveSituationVideo = "/video/primitive-situation.mp4";
const introVideo = "/video/Video_mo_dau.mp4";
const socialVideo = "/video/Video_mo_dau_xa_hoi.mp4";

// Thu tu cac chang + nhan hien tren thanh tien do
const STAGES = ["intro", "cognitive", "social", "summary", "quiz", "done"];
const STAGE_LABELS = {
  intro: "Khởi hành",
  cognitive: "Nhận thức",
  social: "Xã hội",
  summary: "Hợp nhất",
  quiz: "Tổng kết",
  done: "Hoàn thành",
};

const INITIAL_STATE = { stage: "intro", pieces: [], startPoint: null, score: null, merged: false };

// --- Tao className cho 1 dap an dua tren trang thai (dung chung moi cau hoi) ---
function getOptionClass({ resolved, picked, isCorrect, isWrongPick }) {
  const base =
    "w-full text-left rounded-xl border-2 px-4 py-3.5 font-medium transition-all flex items-center gap-3 ";
  if (resolved && isCorrect) return base + "border-green-500 bg-green-50 text-green-900";
  if (isWrongPick) return base + "border-red-500 bg-red-50 text-red-900";
  if (resolved) return base + "border-gray-200 opacity-60";
  return base + "border-gray-200 hover:border-red-400 hover:bg-red-50 bg-white";
}

// ============================================================================
// CAU HOI CHAM DIEM — phai chon dung moi qua; chon sai duoc danh dau & cho thu lai.
// ============================================================================
function GradedQuestion({ prompt, options, correctFeedback, wrongFeedback, onPass, passLabel = "Tiếp tục" }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);

  const handlePick = (index) => {
    if (solved) return;
    if (options[index].correct) {
      setSolved(true);
    } else if (!wrongPicks.includes(index)) {
      setWrongPicks((prev) => [...prev, index]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <p className="font-semibold text-lg mb-4 text-gray-900">{prompt}</p>
      <div className="space-y-2.5">
        {options.map((opt, index) => (
          <button
            key={index}
            type="button"
            disabled={solved}
            onClick={() => handlePick(index)}
            className={getOptionClass({
              resolved: solved,
              isCorrect: opt.correct,
              isWrongPick: wrongPicks.includes(index),
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {solved && opt.correct
                ? "check_circle"
                : wrongPicks.includes(index)
                ? "cancel"
                : "radio_button_unchecked"}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      {!solved && wrongPicks.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-base flex items-start gap-2 j-bubble-in">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{wrongFeedback}</span>
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-base text-green-900/90 leading-relaxed">{correctFeedback}</p>
          <button
            type="button"
            onClick={onPass}
            className="mt-4 inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            {passLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

// --- Banner canh hoat hoa + tieu de chang (da thu gon chieu cao cho gon mat) ---
function SceneBanner({ scene, badge, title, subtitle }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md mb-5 h-24 md:h-32">
      <SceneArt scene={scene} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3.5 md:p-4 text-white">
        {badge && (
          <span className="inline-block bg-white/20 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
            {badge}
          </span>
        )}
        <h2 className="text-lg md:text-2xl font-bold drop-shadow leading-tight">{title}</h2>
        {subtitle && <p className="text-white/85 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Banner dang VIDEO: thay cho SceneBanner SVG o nhung chang co clip minh hoa.
function VideoScene({ src, badge, title, subtitle, muted = true, autoPlay = true }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md mb-5 bg-black">
      <div className="relative">
        <video
          ref={(el) => {
            if (el) el.muted = muted;
          }}
          src={src}
          controls
          autoPlay={autoPlay}
          loop
          playsInline
          preload="metadata"
          className="w-full aspect-video bg-black"
        />
        {badge && (
          <span className="absolute top-3 left-3 inline-block bg-black/55 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
            {badge}
          </span>
        )}
      </div>
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 md:px-5 py-2.5 text-white text-left">
        <h2 className="text-base md:text-xl font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-white/80 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Bang "mo khoa manh ghep" ---
function PieceReward({ label, onNext }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-center text-white shadow-xl j-unlock">
      <span className="material-symbols-outlined text-5xl">extension</span>
      <p className="text-sm uppercase tracking-wider font-semibold mt-1 opacity-90">
        Mảnh ghép tri thức
      </p>
      <p className="text-2xl font-bold mt-1 mb-4">{label}</p>
      <button
        type="button"
        onClick={onNext}
        className="bg-white text-orange-700 px-6 py-2.5 rounded-lg font-bold hover:bg-orange-50 transition-colors inline-flex items-center gap-1.5"
      >
        Tiếp tục hành trình
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
}

// ============================================================================
// CHANG 1 — DAN NHAP
// ============================================================================
function IntroStage({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0: hoi thoai, 1: chon diem khoi hanh
  const [chosen, setChosen] = useState(null);

  const introLines = useMemo(
    () => INTRO.lines,
    []
  );

  return (
    <div>
      <VideoScene src={introVideo} badge={INTRO.subtitle} title={INTRO.title} />
      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence
            lines={introLines}
            onComplete={() => setPhase(1)}
            ctaLabel="Chọn điểm khởi hành"
          />
        </div>
      )}

      {phase === 1 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-left">
          <p className="font-semibold text-lg mb-1 text-gray-900">
            Bạn muốn bắt đầu hành trình từ đâu?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Một lựa chọn nhập vai — mọi nền văn minh đều dẫn tới cùng một bước ngoặt.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {INTRO.startPoints.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setChosen(sp.id)}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  chosen === sp.id
                    ? "border-red-800 bg-red-50 shadow-md"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50/40"
                }`}
              >
                <span className="material-symbols-outlined text-3xl text-red-800">
                  {sp.icon}
                </span>
                <p className="font-bold text-gray-900 mt-1">{sp.label}</p>
                <p className="text-xs text-gray-500">{sp.place}</p>
              </button>
            ))}
          </div>

          {chosen && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 j-bubble-in">
              <p className="text-sm text-indigo-900 leading-relaxed mb-3">
                {INTRO.startConfirm}
              </p>
              <button
                type="button"
                onClick={() => onComplete(chosen)}
                className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
              >
                Lên đường
                <span className="material-symbols-outlined text-base">rocket_launch</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 2 — VONG NHAN THUC: "GIAI MA SAM TRUYEN"
// ============================================================================
function CognitiveStage({ onComplete }) {
  const R = ROUND_COGNITIVE;
  const [phase, setPhase] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(1);

  const allStepsShown = revealedSteps >= R.conclusion.steps.length;

  useEffect(() => {
    if (phase !== 4 || allStepsShown) return;
    const t = setTimeout(() => setRevealedSteps((c) => c + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, revealedSteps, allStepsShown]);

  return (
    <div>
      <VideoScene src={primitiveSituationVideo} badge={R.badge} title={R.title} subtitle={R.subtitle} />

      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence lines={R.setup} onComplete={() => setPhase(1)} ctaLabel="Trả lời" />
        </div>
      )}

      {phase === 1 && (
        <GradedQuestion
          prompt={R.myth.prompt}
          options={R.myth.options}
          correctFeedback={R.myth.correctFeedback}
          wrongFeedback={R.myth.wrongFeedback}
          onPass={() => setPhase(2)}
          passLabel="Tiếp tục"
        />
      )}

      {phase === 2 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence lines={R.twist} onComplete={() => setPhase(3)} ctaLabel="Trả lời Lyra" />
        </div>
      )}

      {phase === 3 && (
        <GradedQuestion
          prompt={R.shift.prompt}
          options={R.shift.options}
          correctFeedback={R.shift.correctFeedback}
          wrongFeedback={R.shift.wrongFeedback}
          onPass={() => setPhase(4)}
          passLabel="Đúc kết kiến thức"
        />
      )}

      {phase === 4 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-left">
          <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">timeline</span>
            {R.conclusion.title}
          </h3>
          <div className="space-y-3">
            {R.conclusion.steps.slice(0, revealedSteps).map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-xl p-4 j-card-reveal"
              >
                <div className="h-11 w-11 rounded-lg bg-red-800 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-red-900">{step.head}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {!allStepsShown ? (
            <p className="mt-4 text-sm text-gray-400 inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base animate-pulse">more_horiz</span>
              Đang đúc kết…
            </p>
          ) : (
            <div className="mt-5">
              <PieceReward label={R.pieceLabel} onNext={() => onComplete("cognitive")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 3 — VONG XA HOI: "DAI HOI BO TOC"
// ============================================================================
function ChainGame({ chain, onSuccess }) {
  const { showToast } = useToast();
  const shuffled = useMemo(() => {
    const arr = [...chain.items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [chain.items]);

  const [placed, setPlaced] = useState([]); // mang id theo thu tu da chon dung
  const [wrongId, setWrongId] = useState(null);
  const done = placed.length === chain.items.length;

  const handlePick = (item) => {
    if (done || placed.includes(item.id)) return;
    if (item.order === placed.length) {
      const next = [...placed, item.id];
      setPlaced(next);
      setWrongId(null);
      if (next.length === chain.items.length) {
        showToast(chain.successFeedback, "success");
      }
    } else {
      setWrongId(item.id);
      showToast("Chưa đúng thứ tự — hãy bắt đầu từ nguyên nhân gốc rễ.", "warning");
      setTimeout(() => setWrongId(null), 500);
    }
  };

  const itemById = (id) => chain.items.find((it) => it.id === id);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-left">
      <h3 className="text-xl font-bold text-red-900 mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined">link</span>
        {chain.title}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{chain.instruction}</p>

      {/* Chuoi da lap rap */}
      <div className="space-y-2 mb-5">
        {placed.map((id, index) => {
          const item = itemById(id);
          return (
            <div key={id}>
              <div className="flex items-center gap-3 bg-green-50 border-2 border-green-400 rounded-xl px-4 py-3 j-unlock">
                <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="material-symbols-outlined text-green-700">{item.icon}</span>
                <span className="text-sm text-green-900 font-medium">{item.text}</span>
              </div>
              {index < chain.items.length - 1 && (
                <div className="flex justify-center text-gray-300">
                  <span className="material-symbols-outlined">arrow_downward</span>
                </div>
              )}
            </div>
          );
        })}
        {done && (
          <p className="text-center text-green-700 font-semibold text-sm mt-2 j-bubble-in">
            {chain.successFeedback}
          </p>
        )}
      </div>

      {/* Cac mat xich chua chon */}
      {!done && (
        <div className="grid sm:grid-cols-2 gap-3">
          {shuffled
            .filter((it) => !placed.includes(it.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className={`flex items-center gap-3 text-left rounded-xl border-2 px-4 py-3 transition-all ${
                  wrongId === item.id
                    ? "border-red-500 bg-red-50 j-shake"
                    : "border-gray-200 bg-white hover:border-red-400 hover:bg-red-50"
                }`}
              >
                <span className="material-symbols-outlined text-red-800 shrink-0">{item.icon}</span>
                <span className="text-sm text-gray-800">{item.text}</span>
              </button>
            ))}
        </div>
      )}

      {done && (
        <div className="mt-5">
          <PieceReward label={chain.reward.replace("Bạn đã thu thập được mảnh ghép: ", "")} onNext={onSuccess} />
        </div>
      )}
    </div>
  );
}

function SocialStage({ onComplete }) {
  const R = ROUND_SOCIAL;
  const [phase, setPhase] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);

  const role = R.roles[roleIndex];

  const handleRolePass = () => {
    if (roleIndex < R.roles.length - 1) {
      setRoleIndex((i) => i + 1);
    } else {
      setPhase(2); // sang cau hoi cot loi
    }
  };

  return (
    <div>
      <VideoScene src={socialVideo} badge={R.badge} title={R.title} subtitle={R.subtitle} />

      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6 text-left">
          <DialogueSequence lines={R.setup} onComplete={() => setPhase(1)} ctaLabel="Vào vai trải nghiệm" />
        </div>
      )}

      {phase === 1 && (
        <div className="space-y-4">
          <div className="bg-gray-900 text-white rounded-xl px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-base">theater_comedy</span>
            {role.label}
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <SpeechBubble who={role.who} text={role.intro} animate={false} />
          </div>
          <GradedQuestion
            key={role.who}
            prompt={role.question}
            options={role.options}
            correctFeedback={role.feedbackCorrect}
            wrongFeedback={role.feedbackWrong}
            onPass={handleRolePass}
            passLabel={roleIndex < R.roles.length - 1 ? "Sang vai tiếp theo" : "Tới đại hội bộ tộc"}
          />
        </div>
      )}

      {phase === 2 && (
        <div className="space-y-4">
          <GradedQuestion
            prompt={R.keyQuestion.prompt}
            options={R.keyQuestion.options}
            correctFeedback={R.keyQuestion.correctFeedback}
            wrongFeedback={R.keyQuestion.wrongFeedback}
            onPass={() => setPhase(3)}
            passLabel="Ghi nhớ điều cốt lõi"
          />
        </div>
      )}

      {phase === 3 && (
        <div className="space-y-4 text-left">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 j-bubble-in">
            <p className="text-amber-900 font-bold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">warning</span>
              GHI NHỚ
            </p>
            <ul className="space-y-2">
              {R.warning.map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-900 leading-relaxed">
                  <span className="material-symbols-outlined text-base text-amber-600 mt-0.5 shrink-0">
                    chevron_right
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setPhase(4)}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            Lắp ráp chuỗi nhân quả
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {phase === 4 && <ChainGame chain={R.chain} onSuccess={() => onComplete("social")} />}
    </div>
  );
}

// ============================================================================
// CHANG 4 — HOP NHAT TRI THUC (lap rap so do)
// ============================================================================
function SummaryStage({ merged, onMerge, onComplete }) {
  const R = ROUND_SUMMARY;

  if (!merged) {
    return (
      <div>
        <SceneBanner scene={R.scene} badge="Hợp nhất tri thức" title={R.title} />
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 text-center">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white items-center justify-center shadow-lg j-glow">
            <span className="material-symbols-outlined text-4xl">extension</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-red-900 mt-4">
            Bạn đã thu thập đủ 2 mảnh ghép tri thức!
          </h3>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Hãy ghép hai mảnh <strong>Nguồn gốc nhận thức</strong> và{" "}
            <strong>Nguồn gốc xã hội</strong> lại với nhau để hé lộ bức tranh hoàn chỉnh về
            nguồn gốc của Triết học.
          </p>
          <button
            type="button"
            onClick={onMerge}
            className="mt-6 inline-flex items-center gap-2 bg-red-800 text-white px-7 py-3.5 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined">join_full</span>
            Ghép 2 mảnh tri thức
          </button>
          <p className="hidden lg:block text-xs text-gray-400 mt-4">
            Mẹo: bạn cũng có thể bấm “Ghép” ngay tại Bảng Hợp Nhất bên phải →
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SceneBanner scene={R.scene} badge="Đúc kết hoàn chỉnh" title={R.title} />
      <div className="bg-gradient-to-br from-red-50 via-white to-amber-50 border border-red-100 rounded-2xl p-6 md:p-7 shadow-md j-unlock text-left">
        <div className="text-center">
          <div className="inline-block rounded-2xl px-6 py-4 text-white bg-gradient-to-br from-red-700 to-red-900 shadow-lg j-glow">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <p className="font-bold text-xl mt-1">{R.center}</p>
            <p className="text-xs text-white/80 mt-0.5">{R.centerNote}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          {R.branches.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl p-4 text-white bg-gradient-to-br ${b.color} shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">{b.icon}</span>
                <h4 className="font-bold">{b.title}</h4>
              </div>
              <ul className="space-y-1.5 text-sm text-white/90">
                {b.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-sm mt-0.5">chevron_right</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white border-l-4 border-red-700 rounded-r-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-red-700 font-bold mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Đúc kết hoàn chỉnh
          </p>
          <p className="text-gray-800 leading-relaxed">{R.finalStatement}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition-colors shadow-md active:scale-95"
          >
            Làm bài kiểm tra tổng kết
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BANG HOP NHAT (sidebar ben phai)
// ============================================================================
function PieceSlot({ branch, index, collected, active }) {
  if (collected) {
    return (
      <div className={`rounded-xl p-3.5 text-white bg-gradient-to-br ${branch.color} shadow-sm j-unlock text-left`}>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold shrink-0">
            {index + 1}
          </span>
          <span className="material-symbols-outlined">{branch.icon}</span>
          <h4 className="font-bold text-sm leading-tight">{branch.title}</h4>
          <span className="material-symbols-outlined ml-auto text-white/90">check_circle</span>
        </div>
        <p className="text-xs text-white/90 mt-2 leading-relaxed">{branch.tagline}</p>
      </div>
    );
  }
  return (
    <div
      className={`rounded-xl p-3.5 border-2 border-dashed transition-all text-left ${
        active ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            active ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-400"
          }`}
        >
          {index + 1}
        </span>
        <span className={`material-symbols-outlined ${active ? "text-red-400" : "text-gray-300"}`}>
          {active ? "hourglass_top" : "lock"}
        </span>
        <span className={`text-sm font-semibold ${active ? "text-red-700" : "text-gray-400"}`}>
          {active ? "Đang khám phá…" : "Chưa mở khóa"}
        </span>
      </div>
    </div>
  );
}

function KnowledgePanel({ pieces, activePieceId, canMerge, merged, onMerge }) {
  const branches = ROUND_SUMMARY.branches;
  return (
    <aside className="lg:sticky lg:top-[5.5rem]">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">extension</span>
            <h3 className="font-bold text-sm">Bảng hợp nhất</h3>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold tabular-nums">
              {pieces.length}/{JOURNEY_TOTAL_PIECES}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <PieceSlot
            branch={branches[0]}
            index={0}
            collected={pieces.includes(branches[0].id)}
            active={activePieceId === branches[0].id}
          />

          <div className="flex justify-center">
            <span
              className={`material-symbols-outlined text-2xl ${
                merged ? "text-green-500" : canMerge ? "text-red-500 animate-pulse" : "text-gray-300"
              }`}
            >
              {merged ? "link" : "add"}
            </span>
          </div>

          <PieceSlot
            branch={branches[1]}
            index={1}
            collected={pieces.includes(branches[1].id)}
            active={activePieceId === branches[1].id}
          />

          {!merged && (
            <div className="pt-2">
              {canMerge ? (
                <button
                  type="button"
                  onClick={onMerge}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-800 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors shadow-md j-glow active:scale-95"
                >
                  <span className="material-symbols-outlined">join_full</span>
                  Ghép 2 mảnh
                </button>
              ) : (
                <p className="text-center text-xs text-gray-400 leading-relaxed px-2">
                  Hoàn thành cả 2 phần học để mở khóa thao tác ghép.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// CHANG 5 — QUIZ TONG KET
// ============================================================================
function FinalQuizStage({ onComplete }) {
  const { showToast } = useToast();
  const questions = JOURNEY_FINAL_QUIZ;
  const total = questions.length;

  const [index, setIndex] = useState(0);
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[index];

  const handlePick = (optIndex) => {
    if (solved) return;
    if (optIndex === q.correctIndex) {
      if (wrongPicks.length === 0) setScore((s) => s + 1);
      setSolved(true);
    } else if (!wrongPicks.includes(optIndex)) {
      setWrongPicks((prev) => [...prev, optIndex]);
    }
  };

  const goNext = () => {
    if (index === total - 1) {
      const passed = score >= JOURNEY_FINAL_PASS;
      showToast(
        passed
          ? `Xuất sắc! Bạn đúng ngay ${score}/${total} câu.`
          : `Bạn đúng ngay ${score}/${total} câu — ôn lại nhé.`,
        passed ? "success" : "warning"
      );
      onComplete(score);
      return;
    }
    setIndex((i) => i + 1);
    setWrongPicks([]);
    setSolved(false);
  };

  const progress = Math.round((index / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-red-200 p-6 md:p-7 text-left animate-fadeIn">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-red-800">assignment</span>
        <span className="text-xs uppercase tracking-wider text-red-800 font-bold">
          Kiểm tra tổng kết hành trình
        </span>
      </div>
      <h2 className="text-2xl font-bold text-red-900 mb-4">Bạn đã hiểu nguồn gốc triết học?</h2>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-800 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-500 tabular-nums shrink-0">{index + 1}/{total}</span>
      </div>

      <p className="font-semibold text-lg mb-4 text-gray-900">
        Câu {index + 1}. {q.question}
      </p>
      <div className="space-y-2.5">
        {q.options.map((opt, optIndex) => (
          <button
            key={optIndex}
            type="button"
            disabled={solved}
            onClick={() => handlePick(optIndex)}
            className={getOptionClass({
              resolved: solved,
              isCorrect: optIndex === q.correctIndex,
              isWrongPick: wrongPicks.includes(optIndex),
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {solved && optIndex === q.correctIndex
                ? "check_circle"
                : wrongPicks.includes(optIndex)
                ? "cancel"
                : "radio_button_unchecked"}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {!solved && wrongPicks.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          Chưa chính xác — hãy thử một đáp án khác.
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-sm text-green-900/90 leading-relaxed">{q.explanation}</p>
          <button
            type="button"
            onClick={goNext}
            className="mt-4 inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            {index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANG 6 — HOAN THANH
// ============================================================================
function CompletionStage({ score, onReplay, nextLesson, onNextLesson }) {
  const total = JOURNEY_FINAL_QUIZ.length;
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-[#0A3CA0] via-[#062E81] to-[#041C52] text-white text-center animate-fadeIn">
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl" />

      <div className="relative p-8 md:p-10">
        <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-6">
          <span className="material-symbols-outlined text-base">verified</span>
          Hoàn thành hành trình
        </div>

        <div className="flex flex-col items-center j-unlock">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-50 flex items-center justify-center shadow-2xl ring-4 ring-white/25">
            <span className="material-symbols-outlined text-5xl text-white">military_tech</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-blue-100 mt-4 font-bold">Huy hiệu đạt được</p>
          <h2 className="text-3xl font-bold mt-1">{COMPLETION.badge}</h2>
          <p className="text-white/75 text-sm">{COMPLETION.badgeNote}</p>
        </div>

        <div className="bg-white/12 border border-white/20 backdrop-blur rounded-2xl px-6 py-4 mt-6 inline-block">
          <p className="text-sm text-blue-50/90">Kết quả kiểm tra</p>
          <p className="text-2xl font-bold tabular-nums">{score}/{total} câu đúng ngay lần đầu</p>
        </div>

        <p className="max-w-xl mx-auto text-white/90 leading-relaxed mt-6">{COMPLETION.message}</p>

        <blockquote className="max-w-lg mx-auto border-l-4 border-amber-300 pl-4 text-left mt-6 italic text-white/90">
          "{COMPLETION.quote.text}"
          <footer className="text-sm text-amber-200 not-italic mt-1">— {COMPLETION.quote.author}</footer>
        </blockquote>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/25 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-base">replay</span>
            Chơi lại hành trình
          </button>

          {nextLesson && (
            <button
              type="button"
              onClick={() => onNextLesson?.(nextLesson.slug)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-orange-400 text-blue-950 px-6 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-orange-500 transition-colors shadow-lg active:scale-95"
            >
              Bài học tiếp theo
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// THANH TIEN DO CHANG + MANH GHEP
// ============================================================================
function JourneyHeader({ stage, pieces, onBack, onReset }) {
  const steps = STAGES.slice(0, 5);
  const activeIndex = STAGES.indexOf(stage);
  const canGoBack = activeIndex > 0;
  const currentLabel = STAGE_LABELS[steps[Math.min(activeIndex, steps.length - 1)]];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 md:p-5 mb-6 sticky top-4 z-20">
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          title="Quay lại chặng trước"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
            canGoBack
              ? "border-red-800 text-red-800 bg-white hover:bg-red-800 hover:text-white shadow-sm active:scale-95"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        <div className="text-center min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none">
            Chặng {Math.min(activeIndex + 1, steps.length)}/{steps.length}
          </p>
          <p className="text-sm md:text-base font-bold text-red-900 truncate leading-tight mt-0.5">
            {currentLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full"
            title="Mảnh ghép tri thức đã thu thập"
          >
            <span className="material-symbols-outlined text-amber-600 text-base">extension</span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">
              {pieces.length}/{JOURNEY_TOTAL_PIECES}
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="Bắt đầu lại từ đầu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-red-700 border border-gray-200 hover:border-red-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
      </div>

      <div className="flex items-start">
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5 shrink-0 w-14 md:w-16">
                <div
                  className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    done
                      ? "bg-green-500 text-white shadow-sm"
                      : active
                      ? "bg-red-800 text-white ring-4 ring-red-100 shadow-md scale-110"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-lg">check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[11px] md:text-xs font-semibold text-center leading-tight ${
                    active ? "text-red-800" : done ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {STAGE_LABELS[s]}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden mt-[15px] md:mt-[17px]">
                  <div
                    className={`h-full rounded-full bg-green-500 transition-all duration-500 ${
                      done ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT GOC
// ============================================================================
export default function PhilosophyJourney({ nextLesson = null, onNextLesson, onComplete }) {
  const [state, setState] = useLocalStorage(JOURNEY_STORAGE_KEY, INITIAL_STATE);

  const setStage = useCallback(
    (patch) => setState((prev) => ({ ...prev, ...patch })),
    [setState]
  );

  const collectPiece = useCallback(
    (pieceId, nextStage) =>
      setState((prev) => ({
        ...prev,
        pieces: prev.pieces.includes(pieceId) ? prev.pieces : [...prev.pieces, pieceId],
        stage: nextStage,
      })),
    [setState]
  );

  const reset = useCallback(() => setState(INITIAL_STATE), [setState]);
  const mergePieces = useCallback(() => setStage({ merged: true }), [setStage]);

  const goBack = useCallback(
    () =>
      setState((prev) => {
        const idx = STAGES.indexOf(prev.stage);
        if (idx <= 0) return prev;
        return { ...prev, stage: STAGES[idx - 1] };
      }),
    [setState]
  );

  const { stage, pieces, score, merged } = state;
  const showPanel = stage === "cognitive" || stage === "social" || stage === "summary";
  const activePieceId =
    stage === "cognitive" ? "cognitive" : stage === "social" ? "social" : null;

  return (
    <div className={`${showPanel ? "max-w-6xl" : "max-w-3xl"} mx-auto transition-all`}>
      <div className="mb-5 text-left">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-full text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-base">explore</span>
          Bài học tương tác · Chương 1.1
        </div>
        <h1 className="font-bold text-3xl md:text-4xl text-red-900">
          Hành trình Khai Sáng: Nguồn gốc của Triết học
        </h1>
        <p className="text-gray-500 mt-1">
          Học qua trò chơi nhập vai — bạn là người trả lời, hệ thống dẫn dắt và đặt câu hỏi.
        </p>
      </div>

      {stage !== "done" && (
        <JourneyHeader stage={stage} pieces={pieces} onBack={goBack} onReset={reset} />
      )}

      {showPanel ? (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div className="min-w-0">
            {stage === "cognitive" && (
              <CognitiveStage onComplete={(piece) => collectPiece(piece, "social")} />
            )}
            {stage === "social" && (
              <SocialStage onComplete={(piece) => collectPiece(piece, "summary")} />
            )}
            {stage === "summary" && (
              <SummaryStage
                merged={merged}
                onMerge={mergePieces}
                onComplete={() => setStage({ stage: "quiz" })}
              />
            )}
          </div>

          <KnowledgePanel
            pieces={pieces}
            activePieceId={activePieceId}
            canMerge={stage === "summary" && pieces.length >= JOURNEY_TOTAL_PIECES && !merged}
            merged={merged}
            onMerge={mergePieces}
          />
        </div>
      ) : (
        <>
          {stage === "intro" && (
            <IntroStage onComplete={(startPoint) => setStage({ startPoint, stage: "cognitive" })} />
          )}

          {stage === "quiz" && (
            <FinalQuizStage
              onComplete={(finalScore) => {
                setStage({ score: finalScore, stage: "done" });
                if (onComplete) onComplete();
              }}
            />
          )}

          {stage === "done" && (
            <CompletionStage
              score={score ?? 0}
              onReplay={reset}
              nextLesson={nextLesson}
              onNextLesson={onNextLesson}
            />
          )}
        </>
      )}
    </div>
  );
}
