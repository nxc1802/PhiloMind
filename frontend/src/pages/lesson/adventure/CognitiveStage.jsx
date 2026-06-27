import React, { useState, useEffect } from "react";
import { VideoScene, PieceReward } from "./components/AdventureCommon";
import DialogueSequence from "../components/GuideSpeech";
import GradedQuestion from "../components/GradedQuestion";

export default function CognitiveStage({ cognitiveData, onComplete }) {
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
