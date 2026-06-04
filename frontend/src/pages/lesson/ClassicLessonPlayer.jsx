import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VideoWithReminder } from "./components/VideoWithReminder";
import { WarmupSection } from "./components/WarmupSection";
import { parseMarkdownToReact } from "./components/MarkdownRenderer";
import { PodcastPlayer } from "./components/PodcastPlayer";
import { FinalQuiz } from "./components/FinalQuiz";
import { LessonDiscussion } from "./components/LessonDiscussion";

export default function ClassicLessonPlayer({ 
  nodeDetails, 
  isRevisit, 
  onComplete, 
  onBackToMindmap 
}) {
  const [isVideoWatched, setIsVideoWatched] = useState(isRevisit);
  const [isWarmupDone, setIsWarmupDone] = useState(isRevisit);

  useEffect(() => {
    setIsVideoWatched(isRevisit);
    setIsWarmupDone(isRevisit);
  }, [nodeDetails?.id, isRevisit]);

  const hasWarmups = nodeDetails?.warmups && nodeDetails.warmups.length > 0;

  const handleWarmupComplete = () => {
    setIsWarmupDone(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Video bổ trợ */}
      <VideoWithReminder 
        dbVideoUrl={nodeDetails?.videoUrl} 
        isRevisit={isRevisit}
        onWatched={() => setIsVideoWatched(true)} 
      />

      {/* Gated state: Yêu cầu xem video */}
      {!isVideoWatched && !isRevisit && (
        <div className="bg-slate-900 text-white rounded-2xl p-8 border border-red-800/20 shadow-xl text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-red-800/20 rounded-full text-red-500 border border-red-850/30">
            <span className="material-symbols-outlined text-2xl animate-pulse text-red-500">play_circle</span>
          </div>
          <h4 className="text-lg font-bold">Hãy xem video để bắt đầu bài học</h4>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Vui lòng bấm nút dưới đây sau khi xem xong video nhập môn để tiếp tục phần câu hỏi làm nóng.
          </p>
          <button
            type="button"
            onClick={() => setIsVideoWatched(true)}
            className="bg-red-800 hover:bg-red-900 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md transform hover:scale-105"
          >
            Tôi đã xem xong video
          </button>
        </div>
      )}

      {/* 2. Làm nóng (Warmup) */}
      {isVideoWatched && hasWarmups && !isWarmupDone && !isRevisit && (
        <WarmupSection 
          dbWarmups={nodeDetails.warmups} 
          onDone={handleWarmupComplete} 
        />
      )}

      {/* 3. Nội dung chính học tập (Mở khi warmup xong hoặc khi revisit) */}
      {(isWarmupDone || isRevisit || !hasWarmups) && (
        <>
          {/* Giáo trình */}
          <article className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-6 text-left">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-red-800">menu_book</span>
              <span className="text-xs uppercase tracking-wider text-red-800 font-bold">Giáo trình chính thức</span>
            </div>
            <div className="prose max-w-none text-gray-800">
              {parseMarkdownToReact(nodeDetails?.originalText || "")}
            </div>

            <div className="bg-blue-50 rounded-xl p-6 text-center mt-8">
              <h4 className="font-bold text-gray-900 mb-3">Sơ đồ tư duy minh họa</h4>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2T0oKzFgSs41_uPl7DH2lLOTYb3SxDZB_kd8GpeTjioOwrYtiKCHxMgA988xiG38bbJ6kHsbcaZ6NB5fwVhU-hX_fuk1yMDbzNQlf7hVZ55UPqUd7F8NC9JKADq4NeFoNN0S_dhU3TjhBNdbUIQGm28SveS2d-P7aiKpHJiufcGzd1wxH_9SoofRYAN_LDJsikyZtKm4WUEIn_R8NblvXegmi4LrZflrHd4Uz2wH7Y9W_TOWXBmiRAPWefJZFVQFDn-sJDNu7M6s"
                alt="So do tu duy bài học"
                className="w-full rounded-lg shadow-sm"
              />
            </div>
          </article>

          {/* Tóm tắt */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl shadow-md border border-amber-200 p-8 space-y-5 text-left">
            <div className="flex items-center gap-2 mb-1 border-b border-amber-200/60 pb-3">
              <span className="material-symbols-outlined text-amber-700">summarize</span>
              <h3 className="text-xl font-bold text-red-950">Tóm tắt bài học (Summary & Quick Take)</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm uppercase tracking-wider text-amber-800 font-bold mb-1">Nội dung cốt lõi:</h4>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base text-justify">
                  {nodeDetails?.summary || "Đang tải dữ liệu tóm tắt..."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm mt-2">
                <strong className="text-red-900 block mb-1 text-sm md:text-base flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-lg">lightbulb</span>
                  💡 Quick Take / Ý chính rút ra:
                </strong>
                <p className="text-gray-750 text-sm md:text-base leading-relaxed italic">
                  {nodeDetails?.quickTake || "Đang tải ý chính rút ra..."}
                </p>
              </div>
            </div>
          </div>

          {/* Podcast */}
          <PodcastPlayer dbPodcast={nodeDetails?.podcast} />

          {/* Quiz (Hiển thị badge "Đã hoàn thành" hoặc quiz nếu là Revisit) */}
          {isRevisit ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl shadow-sm text-center space-y-3 mt-8">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-2xl">verified</span>
                Bài kiểm tra đã hoàn thành!
              </h3>
              <p className="text-sm text-green-700 max-w-md mx-auto">
                Đồng chí đã vượt qua phần trắc nghiệm kiểm tra và đạt yêu cầu cho bài học này. Đồng chí vẫn có thể thực hiện lại bài kiểm tra ở dưới nếu muốn ôn tập.
              </p>
              <div className="pt-2">
                <Link
                  to="/debate"
                  className="bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow inline-flex items-center gap-1"
                >
                  Tham gia Phản biện Socratic →
                </Link>
              </div>
              <div className="border-t border-green-200/50 pt-5 mt-4">
                <details className="cursor-pointer group">
                  <summary className="text-xs font-semibold text-green-800 select-none hover:underline">
                    Xem lại bài kiểm tra trắc nghiệm
                  </summary>
                  <div className="mt-4 group-open:block">
                    <FinalQuiz dbFlashcards={nodeDetails?.flashcards} onComplete={onComplete} />
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <FinalQuiz dbFlashcards={nodeDetails?.flashcards} onComplete={onComplete} />
          )}

          {/* Diễn đàn Thảo luận */}
          {nodeDetails?.id && <LessonDiscussion nodeId={nodeDetails.id} />}
        </>
      )}

      {/* Điều hướng */}
      <div className="flex justify-between gap-3 mt-8">
        <button
          type="button"
          onClick={onBackToMindmap}
          className="border-2 border-red-800 text-red-800 px-5 py-3 rounded-lg font-bold hover:bg-red-800 hover:text-white transition-colors"
        >
          ← Sơ đồ tư duy
        </button>
        <Link
          to="/debate"
          className="bg-red-800 text-white px-5 py-3 rounded-lg font-bold hover:bg-red-900 transition-colors flex items-center gap-1"
        >
          Phản biện AI Socratic →
        </Link>
      </div>
    </div>
  );
}
