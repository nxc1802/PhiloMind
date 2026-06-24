import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../../components/Toast";
import useLocalStorage from "../../hooks/useLocalStorage";
import { SceneArt } from "./components/JourneyArt";
import DialogueSequence, { SpeechBubble } from "./components/GuideSpeech";
import "./adventure.css";

const STAGES = ["intro", "cognitive", "social", "summary", "quiz", "done"];
const STAGE_LABELS = {
  intro: "Khởi hành",
  cognitive: "Nhận thức",
  social: "Xã hội",
  summary: "Hợp nhất",
  quiz: "Tổng kết",
  done: "Hoàn thành",
};

function getOptionClass({ resolved, isCorrect, isWrongPick }) {
  const base =
    "w-full text-left rounded-3xl border-2 px-4 py-3.5 font-medium transition-all flex items-center gap-3 ";
  if (resolved && isCorrect) return base + "border-green-500 bg-green-50 text-green-900";
  if (isWrongPick) return base + "border-red-500 bg-primary-50 dark:bg-primary-900/35 text-primary-850 dark:text-primary-100";
  if (resolved) return base + "border-gray-200 opacity-60";
  return base + "border-gray-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 bg-white dark:bg-[#002b37]";
}

function GradedQuestion({ prompt, options, correctFeedback, wrongFeedback, onPass, passLabel = "Tiếp tục" }) {
  const [wrongPicks, setWrongPicks] = useState([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setWrongPicks([]);
    setSolved(false);
  }, [prompt]);

  const handlePick = (index) => {
    if (solved) return;
    if (options[index].correct) {
      setSolved(true);
    } else if (!wrongPicks.includes(index)) {
      setWrongPicks((prev) => [...prev, index]);
    }
  };

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 text-left">
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
        <div className="mt-4 bg-primary-50 dark:bg-primary-900/35 border border-primary-200 dark:border-primary-800 text-primary-650 dark:text-primary-300 p-3 rounded-3xl text-base flex items-start gap-2 j-bubble-in">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{wrongFeedback}</span>
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-3xl j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-base text-green-900/90 leading-relaxed">{correctFeedback}</p>
          <button
            type="button"
            onClick={onPass}
            className="mt-4 inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            {passLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

function SceneBanner({ scene, badge, title, subtitle }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-md mb-5 h-24 md:h-32">
      <SceneArt scene={scene} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3.5 md:p-4 text-white text-left">
        {badge && (
          <span className="inline-block bg-white dark:bg-[#002b37]/20 backdrop-blur text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1">
            {badge}
          </span>
        )}
        <h2 className="text-lg md:text-2xl font-bold drop-shadow leading-tight">{title}</h2>
        {subtitle && <p className="text-white/85 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

function VideoScene({ src, badge, title, subtitle, muted = true, autoPlay = true }) {
  const getYoutubeId = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const ytId = getYoutubeId(src);

  return (
    <div className="rounded-3xl overflow-hidden shadow-md mb-5 bg-black">
      <div className="relative w-full aspect-video bg-black">
        {ytId ? (
          <iframe
            title={title}
            width="100%"
            height="100%"
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
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
            className="w-full h-full object-cover"
          />
        )}
        {badge && (
          <span className="absolute top-3 left-3 inline-block bg-black/55 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded pointer-events-none">
            {badge}
          </span>
        )}
      </div>
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 md:px-5 py-2.5 text-white text-left">
        <h2 className="text-base md:text-xl font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-white/80 text-xs md:text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

function PieceReward({ label, onNext }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-center text-white shadow-xl j-unlock">
      <span className="material-symbols-outlined text-5xl">extension</span>
      <p className="text-sm uppercase tracking-wider font-semibold mt-1 opacity-90">
        Mảnh ghép tri thức
      </p>
      <p className="text-2xl font-bold mt-1 mb-4">{label}</p>
      <button
        type="button"
        onClick={onNext}
        className="bg-white dark:bg-[#002b37] text-orange-700 px-6 py-2.5 rounded-3xl font-bold hover:bg-orange-50 transition-colors inline-flex items-center gap-1.5"
      >
        Tiếp tục hành trình
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </div>
  );
}

function IntroStage({ introData, onComplete }) {
  const [phase, setPhase] = useState(0); // 0: hoi thoai, 1: chon diem khoi hanh
  const [chosen, setChosen] = useState(null);

  const introLines = useMemo(() => {
    const lines = introData?.dialogs || [];
    return lines.map((line) => ({
      who: line.who || "guide",
      text: line.text
    }));
  }, [introData]);

  return (
    <div>
      <VideoScene 
        src={introData?.videoUrl || introData?.background || "https://www.youtube.com/watch?v=Mzg-AdRrjGY"} 
        badge={introData?.subtitle} 
        title={introData?.title || "Cỗ Máy Thời Gian"} 
      />
      {phase === 0 && introLines.length > 0 && (
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence
            lines={introLines}
            onComplete={() => setPhase(1)}
            ctaLabel="Chọn điểm khởi hành"
          />
        </div>
      )}

      {phase === 1 && (
        <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 text-left">
          <p className="font-semibold text-lg mb-1 text-gray-900">
            Bạn muốn bắt đầu hành trình từ đâu?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Một lựa chọn nhập vai — mọi nền văn minh đều dẫn tới cùng một bước ngoặt.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {(introData?.startPoints || []).map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setChosen(sp.id)}
                className={`rounded-3xl border-2 p-4 text-center transition-all ${
                  chosen === sp.id
                    ? "border-primary-800 bg-primary-50 dark:bg-primary-900/35 shadow-md"
                    : "border-gray-200 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30/40"
                }`}
              >
                <span className="material-symbols-outlined text-3xl text-primary-650 dark:text-primary-300">
                  {sp.icon}
                </span>
                <p className="font-bold text-gray-900 mt-1">{sp.label}</p>
                <p className="text-xs text-gray-500">{sp.place}</p>
              </button>
            ))}
          </div>

          {chosen && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-4 j-bubble-in">
              <p className="text-sm text-indigo-900 leading-relaxed mb-3">
                {introData?.startConfirm}
              </p>
              <button
                type="button"
                onClick={() => onComplete(chosen)}
                className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-6 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
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

function CognitiveStage({ cognitiveData, onComplete }) {
  const [phase, setPhase] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(1);

  const steps = cognitiveData?.conclusion?.steps || [];
  const allStepsShown = revealedSteps >= steps.length;

  useEffect(() => {
    if (phase !== 4 || allStepsShown) return;
    const t = setTimeout(() => setRevealedSteps((c) => c + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, revealedSteps, allStepsShown, steps.length]);

  return (
    <div>
      <VideoScene 
        src={cognitiveData?.videoUrl || "https://www.youtube.com/watch?v=Mzg-AdRrjGY"} 
        badge={cognitiveData?.badge} 
        title={cognitiveData?.title} 
        subtitle={cognitiveData?.subtitle} 
      />

      {phase === 0 && (
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence 
            lines={cognitiveData?.setup || []} 
            onComplete={() => setPhase(1)} 
            ctaLabel="Trả lời" 
          />
        </div>
      )}

      {phase === 1 && cognitiveData?.myth && (
        <GradedQuestion
          prompt={cognitiveData.myth.prompt}
          options={cognitiveData.myth.options}
          correctFeedback={cognitiveData.myth.correctFeedback}
          wrongFeedback={cognitiveData.myth.wrongFeedback}
          onPass={() => setPhase(2)}
          passLabel="Tiếp tục"
        />
      )}

      {phase === 2 && (
        <div className="bg-gray-50 rounded-3xl border border-gray-200 p-5 md:p-6">
          <DialogueSequence 
            lines={cognitiveData?.twist || []} 
            onComplete={() => setPhase(3)} 
            ctaLabel="Trả lời Lyra" 
          />
        </div>
      )}

      {phase === 3 && cognitiveData?.shift && (
        <GradedQuestion
          prompt={cognitiveData.shift.prompt}
          options={cognitiveData.shift.options}
          correctFeedback={cognitiveData.shift.correctFeedback}
          wrongFeedback={cognitiveData.shift.wrongFeedback}
          onPass={() => setPhase(4)}
          passLabel="Đúc kết kiến thức"
        />
      )}

      {phase === 4 && (
        <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 text-left animate-fadeIn">
          <h3 className="text-xl font-bold text-primary-850 dark:text-primary-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">timeline</span>
            {cognitiveData?.conclusion?.title}
          </h3>
          <div className="space-y-3">
            {steps.slice(0, revealedSteps).map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-gradient-to-r from-primary-50 to-primary-100/10 border border-primary-100 dark:border-primary-850 rounded-3xl p-4 j-card-reveal"
              >
                <div className="h-11 w-11 rounded-3xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-primary-850 dark:text-primary-100">{step.head}</p>
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
              <PieceReward label={cognitiveData?.pieceLabel} onNext={() => onComplete("cognitive")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChainGame({ chain, onSuccess }) {
  const { showToast } = useToast();
  
  const shuffled = useMemo(() => {
    if (!chain?.items) return [];
    const arr = [...chain.items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [chain?.items]);

  const [placed, setPlaced] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const done = placed.length === (chain?.items?.length || 0);

  const handlePick = (item) => {
    if (done || placed.includes(item.id)) return;
    if (item.order === placed.length) {
      const next = [...placed, item.id];
      setPlaced(next);
      setWrongId(null);
      if (next.length === chain.items.length) {
        showToast(chain.successFeedback || "Ghép nối chính xác!", "success");
      }
    } else {
      setWrongId(item.id);
      showToast("Chưa đúng thứ tự — hãy bắt đầu từ nguyên nhân gốc rễ.", "warning");
      setTimeout(() => setWrongId(null), 500);
    }
  };

  const itemById = (id) => chain?.items?.find((it) => it.id === id);

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 text-left animate-fadeIn">
      <h3 className="text-xl font-bold text-primary-850 dark:text-primary-100 mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined">link</span>
        {chain?.title || "Lắp ráp chuỗi nhân quả"}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{chain?.instruction}</p>

      <div className="space-y-2 mb-5">
        {placed.map((id, index) => {
          const item = itemById(id);
          return (
            <div key={id}>
              <div className="flex items-center gap-3 bg-green-50 border-2 border-green-400 rounded-3xl px-4 py-3 j-unlock">
                <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="material-symbols-outlined text-green-700">{item?.icon || "link"}</span>
                <span className="text-sm text-green-900 font-medium">{item?.text}</span>
              </div>
              {index < (chain?.items?.length || 0) - 1 && (
                <div className="flex justify-center text-gray-300">
                  <span className="material-symbols-outlined">arrow_downward</span>
                </div>
              )}
            </div>
          );
        })}
        {done && (
          <p className="text-center text-green-700 font-semibold text-sm mt-2 j-bubble-in">
            {chain?.successFeedback}
          </p>
        )}
      </div>

      {!done && (
        <div className="grid sm:grid-cols-2 gap-3">
          {shuffled
            .filter((it) => !placed.includes(it.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className={`flex items-center gap-3 text-left rounded-3xl border-2 px-4 py-3 transition-all ${
                  wrongId === item.id
                    ? "border-red-500 bg-primary-50 dark:bg-primary-900/35 j-shake"
                    : "border-gray-200 bg-white dark:bg-[#002b37] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                }`}
              >
                <span className="material-symbols-outlined text-primary-650 dark:text-primary-300 shrink-0">{item.icon || "radio_button_unchecked"}</span>
                <span className="text-sm text-gray-800">{item.text}</span>
              </button>
            ))}
        </div>
      )}

      {done && (
        <div className="mt-5">
          <PieceReward label={chain?.reward || "MẢNH GHÉP MỚI"} onNext={onSuccess} />
        </div>
      )}
    </div>
  );
}

function SocialStage({ socialData, minigameData, onComplete }) {
  const [phase, setPhase] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);

  const roles = socialData?.roles || [];
  const role = roles[roleIndex];

  const handleRolePass = () => {
    if (roleIndex < roles.length - 1) {
      setRoleIndex((i) => i + 1);
    } else {
      setPhase(2);
    }
  };

  return (
    <div>
      <VideoScene 
        src={socialData?.videoUrl || "https://www.youtube.com/watch?v=Mzg-AdRrjGY"} 
        badge={socialData?.badge} 
        title={socialData?.title} 
        subtitle={socialData?.subtitle} 
      />

      {phase === 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setPhase(1)}
            className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            Vào vai trải nghiệm
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {phase === 1 && role && (
        <div className="space-y-4 text-left animate-fadeIn">
          <div className="bg-gray-900 text-white rounded-3xl px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-base">theater_comedy</span>
            {role.label}
          </div>
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-5">
            <SpeechBubble who={role.who} text={role.intro} animate={false} />
          </div>
          <GradedQuestion
            key={role.who}
            prompt={role.question}
            options={role.options}
            correctFeedback={role.feedbackCorrect}
            wrongFeedback={role.feedbackWrong}
            onPass={handleRolePass}
            passLabel={roleIndex < roles.length - 1 ? "Sang vai tiếp theo" : "Tới đại hội bộ tộc"}
          />
        </div>
      )}

      {phase === 2 && socialData?.keyQuestion && (
        <div className="space-y-4 animate-fadeIn">
          <GradedQuestion
            prompt={socialData.keyQuestion.prompt}
            options={socialData.keyQuestion.options}
            correctFeedback={socialData.keyQuestion.correctFeedback}
            wrongFeedback={socialData.keyQuestion.wrongFeedback}
            onPass={() => setPhase(3)}
            passLabel="Ghi nhớ điều cốt lõi"
          />
        </div>
      )}

      {phase === 3 && (
        <div className="space-y-4 text-left animate-fadeIn">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 j-bubble-in">
            <p className="text-amber-900 font-bold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">warning</span>
              GHI NHỚ
            </p>
            <ul className="space-y-2">
              {(socialData?.warning || []).map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-900 leading-relaxed">
                  <span className="material-symbols-outlined text-base text-amber-600 mt-0.5 shrink-0">
                    chevron_right
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPhase(4)}
              className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
            >
              Lắp ráp chuỗi nhân quả
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {phase === 4 && minigameData?.config && (
        <ChainGame chain={minigameData.config} onSuccess={() => onComplete("social")} />
      )}
    </div>
  );
}

function SummaryStage({ summaryData, merged, onMerge, onComplete }) {
  if (!merged) {
    return (
      <div className="animate-fadeIn">
        <SceneBanner scene="synthesis" badge="Hợp nhất tri thức" title={summaryData?.title || "Hợp nhất tri thức"} />
        <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 md:p-8 text-center">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white items-center justify-center shadow-lg j-glow">
            <span className="material-symbols-outlined text-4xl">extension</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-primary-850 dark:text-primary-100 mt-4">
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
            className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-7 py-3.5 rounded-3xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined">join_full</span>
            Ghép 2 mảnh tri thức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <SceneBanner scene="synthesis" badge="Đúc kết hoàn chỉnh" title={summaryData?.title || "Hợp nhất tri thức"} />
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100/10 border border-primary-100 dark:border-primary-850 rounded-3xl p-6 md:p-7 shadow-md j-unlock text-left">
        <div className="text-center">
          <div className="inline-block rounded-3xl px-6 py-4 text-white bg-gradient-to-br from-primary-700 to-primary-900 shadow-lg j-glow">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <p className="font-bold text-xl mt-1">{summaryData?.center}</p>
            <p className="text-xs text-white/80 mt-0.5">{summaryData?.centerNote}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          {(summaryData?.branches || []).map((b) => (
            <div
              key={b.id}
              className={`rounded-3xl p-4 text-white bg-gradient-to-br ${b.color} shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">{b.icon}</span>
                <h4 className="font-bold">{b.title}</h4>
              </div>
              <ul className="space-y-1.5 text-sm text-white/90">
                {(b.points || []).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-sm mt-0.5">chevron_right</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white dark:bg-[#002b37] border-l-4 border-primary-600 rounded-r-xl p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-primary-700 dark:text-primary-300 font-bold mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Đúc kết hoàn chỉnh
          </p>
          <p className="text-gray-800 leading-relaxed">{summaryData?.finalStatement}</p>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-primary-600 text-white px-6 py-3 rounded-3xl font-bold hover:bg-primary-700 transition-colors shadow-md active:scale-95"
          >
            Làm bài kiểm tra tổng kết
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FinalQuizStage({ questions = [], onComplete }) {
  const { showToast } = useToast();
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
      const passed = score >= 4; // Min 4/5 questions correct on first try to pass smoothly
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

  if (!q) return null;

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-primary-200 dark:border-primary-800 p-6 md:p-7 text-left animate-fadeIn">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">assignment</span>
        <span className="text-xs uppercase tracking-wider text-primary-650 dark:text-primary-300 font-bold">
          Kiểm tra tổng kết hành trình
        </span>
      </div>
      <h2 className="text-2xl font-bold text-primary-850 dark:text-primary-100 mb-4">Bạn đã hiểu nguồn gốc triết học?</h2>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-500 tabular-nums shrink-0">{index + 1}/{total}</span>
      </div>

      <p className="font-semibold text-lg mb-4 text-gray-900 font-serif">
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
        <div className="mt-4 bg-primary-50 dark:bg-primary-900/35 border border-primary-200 dark:border-primary-800 text-primary-650 dark:text-primary-300 p-3 rounded-3xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          Chưa chính xác — hãy thử một đáp án khác.
        </div>
      )}

      {solved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-3xl j-bubble-in">
          <p className="font-bold text-green-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            Chính xác!
          </p>
          <p className="text-sm text-green-900/90 leading-relaxed font-serif">{q.explanation}</p>
          <button
            type="button"
            onClick={goNext}
            className="mt-4 inline-flex items-center gap-1.5 bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            {index === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CompletionStage({ score, total, completionData, xpReward, badgeReward, onReplay, onBackToMindmap }) {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-[#0A3CA0] via-[#062E81] to-[#041C52] text-white text-center animate-fadeIn">
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-300/15 rounded-full blur-3xl" />

      <div className="relative p-8 md:p-10">
        <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#002b37]/15 border border-white/25 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-6">
          <span className="material-symbols-outlined text-base">verified</span>
          Hoàn thành hành trình
        </div>

        <div className="flex flex-col items-center j-unlock">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-2xl ring-4 ring-white/25">
            <span className="material-symbols-outlined text-5xl text-white">military_tech</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-blue-100 mt-4 font-bold">Huy hiệu đạt được</p>
          <h2 className="text-3xl font-bold mt-1">{completionData?.badge || badgeReward}</h2>
          <p className="text-white/75 text-sm">{completionData?.badgeNote || "Hành trình hoàn thành!"}</p>
        </div>

        <div className="bg-white dark:bg-[#002b37]/12 border border-white/20 backdrop-blur rounded-3xl px-6 py-4 mt-6 inline-block">
          <p className="text-sm text-blue-50/90">Kết quả kiểm tra</p>
          <p className="text-2xl font-bold tabular-nums">{score}/{total} câu đúng ngay lần đầu</p>
        </div>

        <p className="max-w-xl mx-auto text-white/90 leading-relaxed mt-6">{completionData?.message || "Chúc mừng đồng chí đã hoàn thành xuất sắc!"}</p>

        {completionData?.quote && (
          <blockquote className="max-w-lg mx-auto border-l-4 border-amber-300 pl-4 text-left mt-6 italic text-white/90 font-serif">
            "{completionData.quote.text}"
            <footer className="text-sm text-amber-200 not-italic mt-1">— {completionData.quote.author}</footer>
          </blockquote>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-[#002b37]/15 border border-white/30 text-white px-6 py-3 rounded-3xl font-bold hover:bg-white dark:bg-[#002b37]/25 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-base">replay</span>
            Chơi lại hành trình
          </button>

          <button
            type="button"
            onClick={onBackToMindmap}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-orange-400 text-blue-950 px-6 py-3 rounded-3xl font-bold hover:from-amber-400 hover:to-orange-500 transition-colors shadow-lg active:scale-95"
          >
            Hoàn thành & Quay lại sơ đồ
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function JourneyHeader({ stage, pieces, onBack, onReset }) {
  const steps = STAGES.slice(0, 5);
  const activeIndex = STAGES.indexOf(stage);
  const canGoBack = activeIndex > 0;
  const currentLabel = STAGE_LABELS[steps[Math.min(activeIndex, steps.length - 1)]];

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-4 md:p-5 mb-6 text-left">
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          title="Quay lại chặng trước"
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-3xl text-sm font-bold border-2 transition-all ${
            canGoBack
              ? "border-primary-800 text-primary-650 dark:text-primary-300 bg-white dark:bg-[#002b37] hover:bg-primary-600 hover:text-white shadow-sm active:scale-95"
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
          <p className="text-sm md:text-base font-bold text-primary-850 dark:text-primary-100 truncate leading-tight mt-0.5">
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
              {pieces.length}/2
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="Bắt đầu lại từ đầu"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-white hover:bg-primary-600 border border-gray-200 hover:border-primary-600 transition-all active:scale-95"
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
                      ? "bg-primary-600 text-white ring-4 ring-primary-100 shadow-md scale-110"
                      : "bg-white dark:bg-[#002b37] text-gray-400 border-2 border-gray-200"
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
                    active ? "text-primary-650 dark:text-primary-300" : done ? "text-green-600" : "text-gray-400"
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

const INITIAL_STATE = { stage: "intro", pieces: [], startPoint: null, score: null, merged: false };

export default function AdventureLessonPlayer({ 
  nodeDetails, 
  isRevisit, 
  onComplete, 
  onBackToMindmap,
  onStateChange
}) {
  const storageKey = useMemo(() => `philosophy_journey_state_${nodeDetails?.id || "default"}`, [nodeDetails?.id]);
  const [state, setState] = useLocalStorage(storageKey, INITIAL_STATE);

  const { stage, pieces, score, merged } = state;

  const showPanel = stage === "cognitive" || stage === "social" || stage === "summary";
  const activePieceId =
    stage === "cognitive" ? "cognitive" : stage === "social" ? "social" : null;

  const mergePieces = useCallback(() => setState((prev) => ({ ...prev, merged: true })), [setState]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showPanel,
        branches: nodeDetails?.finalSummary?.summary?.branches,
        pieces,
        activePieceId,
        canMerge: stage === "summary" && pieces.length >= 2 && !merged,
        merged,
        onMerge: mergePieces,
      });
    }
    return () => {
      if (onStateChange) onStateChange(null);
    };
  }, [onStateChange, showPanel, nodeDetails?.finalSummary?.summary?.branches, pieces, activePieceId, stage, merged, mergePieces]);

  const introData = useMemo(() => nodeDetails?.storyIntro || {}, [nodeDetails?.storyIntro]);
  const cognitiveData = useMemo(() => {
    const list = nodeDetails?.lessonContents || [];
    return list.find(c => c.id === "cognitive") || list[0] || {};
  }, [nodeDetails?.lessonContents]);
  const socialData = useMemo(() => {
    const list = nodeDetails?.lessonContents || [];
    return list.find(c => c.id === "social") || list[1] || {};
  }, [nodeDetails?.lessonContents]);
  const minigame = useMemo(() => nodeDetails?.minigame || {}, [nodeDetails?.minigame]);
  const summaryData = useMemo(() => nodeDetails?.finalSummary?.summary || {}, [nodeDetails?.finalSummary]);
  const finalQuizQuestions = useMemo(() => nodeDetails?.finalSummary?.quiz || [], [nodeDetails?.finalSummary]);
  const completionData = useMemo(() => nodeDetails?.finalSummary?.completion || {}, [nodeDetails?.finalSummary]);
  const xpReward = useMemo(() => nodeDetails?.finalSummary?.rewards?.xp || 120, [nodeDetails?.finalSummary]);
  const badgeReward = useMemo(() => nodeDetails?.finalSummary?.rewards?.badge || "Nhà Khai Sáng", [nodeDetails?.finalSummary]);

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

  const goBack = useCallback(
    () =>
      setState((prev) => {
        const idx = STAGES.indexOf(prev.stage);
        if (idx <= 0) return prev;
        return { ...prev, stage: STAGES[idx - 1] };
      }),
    [setState]
  );

  const handleFinalQuizComplete = useCallback((finalScore) => {
    setStage({ score: finalScore, stage: "done" });
    if (onComplete) {
      onComplete(); // Save completion status to Database
    }
  }, [setStage, onComplete]);

  const handleReplay = useCallback(() => {
    reset();
  }, [reset]);

  const handleFinish = useCallback(() => {
    reset();
    if (onBackToMindmap) {
      onBackToMindmap();
    }
  }, [reset, onBackToMindmap]);

  return (
    <div className="w-full text-left">
      <div className="mb-5 text-left">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-850 px-3 py-1.5 rounded-full text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-base">explore</span>
          Bài học tương tác
        </div>
        <h1 className="font-bold text-3xl md:text-4xl text-primary-950 leading-tight">
          Hành trình Khai Sáng: {nodeDetails?.title || "Nguồn gốc của Triết học"}
        </h1>
        <p className="text-gray-500 mt-1">
          Học qua trò chơi nhập vai — bạn là người trả lời, hệ thống dẫn dắt và đặt câu hỏi.
        </p>
      </div>

      {stage !== "done" && (
        <JourneyHeader stage={stage} pieces={pieces} onBack={goBack} onReset={reset} />
      )}

      <div className="w-full">
        {stage === "intro" && (
          <IntroStage 
            introData={introData} 
            onComplete={(startPoint) => setStage({ startPoint, stage: "cognitive" })} 
          />
        )}

        {stage === "cognitive" && (
          <CognitiveStage 
            cognitiveData={cognitiveData} 
            onComplete={(piece) => collectPiece(piece, "social")} 
          />
        )}

        {stage === "social" && (
          <SocialStage 
            socialData={socialData} 
            minigameData={minigame} 
            onComplete={(piece) => collectPiece(piece, "summary")} 
          />
        )}

        {stage === "summary" && (
          <SummaryStage
            summaryData={summaryData}
            merged={merged}
            onMerge={mergePieces}
            onComplete={() => setStage({ stage: "quiz" })}
          />
        )}

        {stage === "quiz" && (
          <FinalQuizStage
            questions={finalQuizQuestions}
            onComplete={handleFinalQuizComplete}
          />
        )}

        {stage === "done" && (
          <CompletionStage
            score={score ?? 0}
            total={finalQuizQuestions.length || 5}
            completionData={completionData}
            xpReward={xpReward}
            badgeReward={badgeReward}
            onReplay={handleReplay}
            onBackToMindmap={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
