import React, { useState, useMemo } from "react";
import { VideoScene } from "./components/AdventureCommon";
import DialogueSequence from "../components/GuideSpeech";

export default function IntroStage({ introData, onComplete }) {
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
