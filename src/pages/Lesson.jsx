import React, { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import LessonMindmap from "../components/LessonMindmap";
import PhilosophyJourney from "./PhilosophyJourney";
import { findLessonBySlug } from "../data/mindmapData";

// ============================================================================
// TRANG BAI HOC
// Cau truc: Muc luc tong (so do tu duy) -> chon 1 bai -> hien noi dung bai.
//
// Hien tai project tap trung vao MOT bai hoc hoan chinh duy nhat:
//   "Nguon goc cua triet hoc" (slug: nguon-goc-triet-hoc) — duoc trien khai
//   thanh bai hoc tuong tac choi don "Hanh trinh Khai Sang" (PhilosophyJourney).
// Cac bai con lai trong so do hien placeholder "dang phat trien".
// ============================================================================

const JOURNEY_SLUG = "nguon-goc-triet-hoc";

// Bai chua co noi dung -> hien thong bao goi gon, huong nguoi hoc ve bai da hoan thien.
function ComingSoon({ title, onBack }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-10 text-center max-w-2xl mx-auto">
      <span className="material-symbols-outlined text-6xl text-red-800/30">construction</span>
      <h2 className="text-xl font-bold text-gray-800 mt-3">{title}</h2>
      <p className="text-gray-500 mt-1 mb-5 max-w-md mx-auto">
        Bài học này đang được phát triển. Hãy bắt đầu với bài học tương tác đã hoàn thiện:
        <strong className="text-red-800"> "Nguồn gốc của triết học"</strong>.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 bg-red-800 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-900 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Quay lại mục lục
      </button>
    </div>
  );
}

const Lesson = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const activeLesson = lessonSlug ? findLessonBySlug(lessonSlug) : null;

  // Ref toi phan noi dung bai hoc de cuon xuong khi chon 1 nhanh tren so do
  const lessonContentRef = useRef(null);

  // Bam 1 bai hoc tren so do -> cap nhat URL va cuon toi noi dung bai hoc
  const handleOpenLesson = (slug) => {
    if (!slug) return;
    setSearchParams({ lesson: slug });
    requestAnimationFrame(() => {
      lessonContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // Quay lai muc luc: xoa tham so lesson khoi URL -> mindmap hien lai
  const handleBackToMindmap = () => setSearchParams({});

  const isJourney = activeLesson?.slug === JOURNEY_SLUG;

  return (
    <PageShell activeKey="lessons">
      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <span>Trang chủ</span>
          <span>›</span>
          <strong className={activeLesson ? "" : "text-red-800"}>Bài học</strong>
          {activeLesson && (
            <>
              <span>›</span>
              <strong className="text-red-800">{activeLesson.title}</strong>
            </>
          )}
        </div>

        {/* MUC LUC TONG — chi hien khi chua chon bai */}
        {!activeLesson && (
          <div className="mb-10">
            <LessonMindmap activeSlug={lessonSlug} onOpenLesson={handleOpenLesson} />
          </div>
        )}

        {/* NOI DUNG BAI HOC */}
        <div ref={lessonContentRef} className="scroll-mt-20">
          {activeLesson ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackToMindmap}
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900 mb-5"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Quay lại mục lục bài học
              </button>

              {isJourney ? (
                <PhilosophyJourney />
              ) : (
                <ComingSoon title={activeLesson.title} onBack={handleBackToMindmap} />
              )}
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-12 pb-16 text-center">
              <span className="material-symbols-outlined text-6xl text-red-800/30">touch_app</span>
              <h2 className="text-xl font-bold text-gray-800 mt-3">Chọn một bài học để bắt đầu</h2>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                Bấm vào bài <strong className="text-red-800">"Nguồn gốc của triết học"</strong> trên sơ đồ
                tư duy phía trên để vào bài học tương tác đã hoàn thiện.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Lesson;
