import React, { useState, useMemo, useCallback } from "react";
import { useToast } from "../components/Toast";
import useLocalStorage from "../hooks/useLocalStorage";
import { SceneArt } from "../components/journey/JourneyArt";
import DialogueSequence, { SpeechBubble } from "../components/journey/GuideSpeech";
import {
  INTRO,
  ROUND_COGNITIVE,
  ROUND_SOCIAL,
  ROUND_SUMMARY,
  JOURNEY_FINAL_QUIZ,
  COMPLETION,
} from "../data/journeyContent";
import {
  JOURNEY_STORAGE_KEY,
  JOURNEY_TOTAL_PIECES,
  JOURNEY_FINAL_PASS,
} from "../constants";

// ============================================================================
// BAI HOC TUONG TAC "HANH TRINH KHAI SANG" — Nguon goc cua triet hoc.
//
// Day la bai hoc DUY NHAT, hoan chinh, chuyen the tu kich ban day hoc tren lop
// sang che do CHOI DON: nguoi hoc dong vai nguoi tra loi; he thong (nhan vat
// dan duong Sophia + cac NPC) dat cau hoi va dong cac vai con lai.
//
// Luong: Dan nhap -> Vong Nhan thuc -> Vong Xa hoi -> Hop nhat -> Quiz -> Hoan thanh.
// Tien do duoc luu localStorage de F5/quay lai khong mat (quan trong khi trinh dien).
// ============================================================================

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

const INITIAL_STATE = { stage: "intro", pieces: [], startPoint: null, score: null };

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
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm flex items-start gap-2 j-bubble-in">
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
          <p className="text-sm text-green-900/90 leading-relaxed">{correctFeedback}</p>
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

// ============================================================================
// CAU HOI MO — moi lua chon deu hop le (dung de nhap vai tu duy huyen thoai).
// ============================================================================
function OpenChoice({ prompt, options, afterText, footer, onContinue, continueLabel = "Tiếp tục" }) {
  const [picked, setPicked] = useState(null);
  const resolved = picked !== null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <p className="font-semibold text-lg mb-4 text-gray-900">{prompt}</p>
      <div className="space-y-2.5">
        {options.map((opt, index) => (
          <button
            key={index}
            type="button"
            disabled={resolved}
            onClick={() => setPicked(index)}
            className={getOptionClass({
              resolved,
              isCorrect: index === picked,
              isWrongPick: false,
            })}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {index === picked ? "trip_origin" : "radio_button_unchecked"}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      {resolved && (
        <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg j-bubble-in">
          <p className="text-sm text-amber-900 font-semibold mb-1">
            <span className="material-symbols-outlined align-middle text-base mr-1">
              psychology_alt
            </span>
            {options[picked].reaction}
          </p>
          <p className="text-sm text-amber-900/90 leading-relaxed">{afterText}</p>
          {footer && (
            <div className="mt-3 bg-white border border-amber-200 rounded-lg p-3 text-sm text-gray-700">
              {footer}
            </div>
          )}
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
          >
            {continueLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

// --- Banner canh hoat hoa + tieu de chang ---
function SceneBanner({ scene, badge, title, subtitle }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6 h-44 md:h-56">
      <SceneArt scene={scene} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 md:p-6 text-white">
        {badge && (
          <span className="inline-block bg-white/20 backdrop-blur text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded mb-2">
            {badge}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-bold drop-shadow">{title}</h2>
        {subtitle && <p className="text-white/85 text-sm md:text-base">{subtitle}</p>}
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
    () => INTRO.lines.map((text) => ({ who: "guide", text })),
    []
  );

  return (
    <div>
      <SceneBanner scene={INTRO.scene} badge={INTRO.subtitle} title={INTRO.title} />
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
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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

  return (
    <div>
      <SceneBanner scene={R.scene} badge={R.badge} title={R.title} subtitle={R.subtitle} />

      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence lines={R.setup} onComplete={() => setPhase(1)} ctaLabel="Tôi sẽ trả lời" />
        </div>
      )}

      {phase === 1 && (
        <OpenChoice
          prompt={R.myth.prompt}
          options={R.myth.options}
          afterText={R.myth.afterAny}
          footer={
            <>
              <strong className="text-red-800">{R.myth.solutionPrompt}</strong> {R.myth.solution}
            </>
          }
          onContinue={() => setPhase(2)}
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
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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
            <button
              type="button"
              onClick={() => setRevealedSteps((c) => c + 1)}
              className="mt-4 inline-flex items-center gap-1.5 bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Mở bước tiếp theo
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>
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
  // Xao tron 1 lan khi mount; nguoi hoc se chon lai dung thu tu nhan qua
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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
      <SceneBanner scene={R.scene} badge={R.badge} title={R.title} subtitle={R.subtitle} />

      {phase === 0 && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
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
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 j-bubble-in">
            <p className="text-amber-900 font-semibold flex items-start gap-2">
              <span className="material-symbols-outlined">warning</span>
              {R.warning}
            </p>
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
function SummaryStage({ onComplete }) {
  const R = ROUND_SUMMARY;
  const [connected, setConnected] = useState([]); // id nhanh da noi vao tam
  const [showGuide, setShowGuide] = useState(false);
  const allConnected = connected.length === R.branches.length;

  const guideLines = useMemo(() => R.guideLines.map((text) => ({ who: "guide", text })), [R.guideLines]);

  const toggle = (id) => {
    setConnected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div>
      <SceneBanner scene={R.scene} badge="Tổng kết hành trình" title={R.title} />

      {!showGuide ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <p className="font-semibold text-gray-900 mb-1">
            Nối hai mảnh ghép tri thức vào trung tâm để hoàn thiện bức tranh.
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Bấm vào từng nhánh nguồn gốc bạn đã mở khóa.
          </p>

          <div className="grid md:grid-cols-3 items-center gap-4">
            {/* Nhanh trai */}
            <BranchCard
              branch={R.branches[0]}
              connected={connected.includes(R.branches[0].id)}
              onClick={() => toggle(R.branches[0].id)}
            />

            {/* Tam */}
            <div className="text-center">
              <div
                className={`mx-auto rounded-2xl p-5 text-white bg-gradient-to-br from-red-700 to-red-900 shadow-lg transition-all ${
                  allConnected ? "j-glow scale-105" : "opacity-80"
                }`}
              >
                <span className="material-symbols-outlined text-4xl">hub</span>
                <p className="font-bold text-lg mt-1">{R.center}</p>
                <p className="text-xs text-white/80 mt-1">{R.centerNote}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">{connected.length}/{R.branches.length} nhánh đã nối</p>
            </div>

            {/* Nhanh phai */}
            <BranchCard
              branch={R.branches[1]}
              connected={connected.includes(R.branches[1].id)}
              onClick={() => toggle(R.branches[1].id)}
            />
          </div>

          {allConnected && (
            <div className="mt-6 text-center j-bubble-in">
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="inline-flex items-center gap-1.5 bg-red-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-900 transition-colors"
              >
                Nghe lời đúc kết
                <span className="material-symbols-outlined text-base">auto_awesome</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence lines={guideLines} onComplete={onComplete} ctaLabel="Làm bài kiểm tra tổng kết" />
        </div>
      )}
    </div>
  );
}

function BranchCard({ branch, connected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-5 text-white bg-gradient-to-br ${branch.color} shadow-md transition-all ${
        connected ? "ring-4 ring-amber-400 j-unlock" : "opacity-90 hover:opacity-100 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined">{branch.icon}</span>
        <h4 className="font-bold">{branch.title}</h4>
        {connected && <span className="material-symbols-outlined ml-auto text-amber-300">check_circle</span>}
      </div>
      <ul className="space-y-1.5 text-sm text-white/90">
        {branch.points.map((p, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-sm mt-0.5">chevron_right</span>
            {p}
          </li>
        ))}
      </ul>
    </button>
  );
}

// ============================================================================
// CHANG 5 — QUIZ TONG KET (tung cau mot, cho lam lai khi sai)
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
    <div className="bg-white rounded-2xl shadow-md border border-red-200 p-6 md:p-7">
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
function CompletionStage({ score, onReplay }) {
  const total = JOURNEY_FINAL_QUIZ.length;
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-2xl shadow-xl p-8 text-white text-center relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-fuchsia-500/20 rounded-full blur-3xl" />
      <div className="relative">
        <div className="inline-flex flex-col items-center j-unlock">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-2xl">
            <span className="material-symbols-outlined text-5xl text-white">military_tech</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-200 mt-3 font-bold">Huy hiệu đạt được</p>
          <h2 className="text-3xl font-bold mt-1">{COMPLETION.badge}</h2>
          <p className="text-white/70 text-sm">{COMPLETION.badgeNote}</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-6 inline-block">
          <p className="text-sm text-white/80">Kết quả kiểm tra</p>
          <p className="text-2xl font-bold tabular-nums">{score}/{total} câu đúng ngay lần đầu</p>
        </div>

        <p className="max-w-xl mx-auto text-white/90 leading-relaxed mt-6">{COMPLETION.message}</p>

        <blockquote className="max-w-lg mx-auto border-l-4 border-amber-300 pl-4 text-left mt-6 italic text-white/90">
          "{COMPLETION.quote.text}"
          <footer className="text-sm text-amber-200 not-italic mt-1">— {COMPLETION.quote.author}</footer>
        </blockquote>

        <button
          type="button"
          onClick={onReplay}
          className="mt-7 inline-flex items-center gap-1.5 bg-white text-purple-900 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors"
        >
          <span className="material-symbols-outlined text-base">replay</span>
          Chơi lại hành trình
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// THANH TIEN DO CHANG + MANH GHEP
// ============================================================================
function JourneyHeader({ stage, pieces, onReset }) {
  const activeIndex = STAGES.indexOf(stage);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-4 z-20">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STAGES.slice(0, 5).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  i < activeIndex
                    ? "bg-green-100 text-green-700"
                    : i === activeIndex
                    ? "bg-red-800 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {i < activeIndex ? "check_circle" : i === activeIndex ? "play_circle" : "radio_button_unchecked"}
                </span>
                {STAGE_LABELS[s]}
              </div>
              {i < 4 && <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-amber-600 text-base">extension</span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">
              {pieces.length}/{JOURNEY_TOTAL_PIECES}
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="Bắt đầu lại từ đầu"
            className="text-gray-400 hover:text-red-800 transition-colors"
          >
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT GOC — dieu phoi toan bo hanh trinh
// ============================================================================
export default function PhilosophyJourney() {
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

  const { stage, pieces, score } = state;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tieu de bai hoc */}
      <div className="mb-5">
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

      {stage !== "done" && <JourneyHeader stage={stage} pieces={pieces} onReset={reset} />}

      {stage === "intro" && (
        <IntroStage onComplete={(startPoint) => setStage({ startPoint, stage: "cognitive" })} />
      )}

      {stage === "cognitive" && (
        <CognitiveStage onComplete={(piece) => collectPiece(piece, "social")} />
      )}

      {stage === "social" && (
        <SocialStage onComplete={(piece) => collectPiece(piece, "summary")} />
      )}

      {stage === "summary" && <SummaryStage onComplete={() => setStage({ stage: "quiz" })} />}

      {stage === "quiz" && (
        <FinalQuizStage onComplete={(finalScore) => setStage({ score: finalScore, stage: "done" })} />
      )}

      {stage === "done" && <CompletionStage score={score ?? 0} onReplay={reset} />}
    </div>
  );
}
