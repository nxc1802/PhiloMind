import React, { useState } from "react";
import { VideoScene } from "./components/AdventureCommon";
import { SpeechBubble } from "../components/GuideSpeech";
import GradedQuestion from "../components/GradedQuestion";
import ChainGame from "./components/ChainGame";

export default function SocialStage({ socialData, minigameData, onComplete }) {
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
