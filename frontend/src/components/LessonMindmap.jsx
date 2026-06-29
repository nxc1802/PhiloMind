import React, { useMemo, useState } from "react";

// Helper tính tổng số đề mục và bài học của một chương
const countSections = (chapter) => (chapter.sections || []).length;
const countLessons  = (chapter) =>
  (chapter.sections || []).reduce((total, section) => total + (section.lessons || []).length, 0);

// Lọc dữ liệu mindmap theo từ khoá; giữ đề mục/bài học khớp keyword
function filterChaptersByKeyword(chapters, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return chapters;

  const matchesKeyword = (text) =>
    text.toLowerCase().includes(normalizedKeyword);

  return chapters
    .map((chapter) => ({
      ...chapter,
      sections: (chapter.sections || [])
        .map((section) => ({
          ...section,
          lessons: (section.lessons || []).filter((lesson) =>
            matchesKeyword(lesson.title)
          ),
        }))
        .filter(
          (section) =>
            (section.lessons || []).length > 0 || matchesKeyword(section.title)
        ),
    }))
    .filter((chapter) => (chapter.sections || []).length > 0);
}

// Nhánh nhỏ: 1 đề mục + danh sách bài học bên trong
function Branch({ section, activeSlug, onOpenLesson, progressMap }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center pt-6 shrink-0">
        <div className="h-0.5 w-8 bg-slate-300 dark:bg-primary-850" />
      </div>

      <div className="flex-1 text-left">
        {/* Click đề mục -> mở bài học đầu tiên của đề mục đó */}
        <button
          onClick={() => onOpenLesson((section.lessons || [])[0]?.slug)}
          className="group inline-flex items-center gap-2 bg-white dark:bg-surface-dark-elevated border-2 border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-350 font-bold px-5 py-2.5 rounded-3xl shadow-sm hover:bg-primary-650 dark:hover:bg-primary-400 hover:text-white dark:hover:text-primary-950 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-base">topic</span>
          {section.title}
          <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity">
            arrow_forward
          </span>
        </button>

        <div className="mt-3 ml-8 space-y-2 relative">
          <div className="absolute left-0 top-0 bottom-3 w-0.5 bg-slate-200 dark:bg-primary-850" />
          {(section.lessons || []).map((lesson) => {
            const isActive = lesson.slug === activeSlug;
            const status = progressMap[lesson.title] || 'locked';
            const isLocked = status === 'locked' || status === 'content_locked';
            const isContentLocked = status === 'content_locked';
            const isCompleted = status === 'completed';

            return (
              <div key={lesson.id} className="flex items-center gap-3">
                <div className="h-0.5 w-6 bg-slate-250 dark:bg-primary-850" />
                <button
                  onClick={() => onOpenLesson(lesson.slug)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-3xl border transition-all text-sm font-medium hover:shadow-md ${
                    isLocked
                      ? "bg-slate-100 dark:bg-primary-900/10 text-slate-400 dark:text-primary-500 border-slate-200 dark:border-primary-850 cursor-not-allowed opacity-60"
                      : isActive
                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                        : isCompleted
                          ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800/40 hover:bg-primary-600 dark:hover:bg-primary-450 hover:text-white"
                          : "bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-600 dark:hover:bg-primary-450 hover:text-white text-slate-800 dark:text-slate-200 border-slate-200 dark:border-primary-850 hover:border-primary-600"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm transition-colors ${
                      isLocked
                        ? "text-slate-400"
                        : isActive
                          ? "text-white"
                          : isCompleted
                            ? "text-green-600 dark:text-green-400 group-hover:text-white"
                            : "text-primary-600 dark:text-primary-300 group-hover:text-white"
                    }`}
                  >
                    {isContentLocked ? "lock_clock" : isLocked ? "lock" : isCompleted ? "check_circle" : "menu_book"}
                  </span>
                  {lesson.title}
                  {isContentLocked && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-primary-500">
                      Sắp có
                    </span>
                  )}
                  {!isLocked && (
                    <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Sơ đồ 1 chương: node gốc bên trái, các nhánh bên phải
function ChapterMap({ chapter, activeSlug, onOpenLesson, progressMap }) {
  return (
    <div className="py-6 mb-10 text-left border-b border-slate-205 dark:border-primary-900/20 last:border-0">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 shrink-0">
          <div
            className={`bg-gradient-to-br ${chapter.color} text-white rounded-3xl p-6 shadow-lg lg:sticky lg:top-24 text-left`}
          >
            <span className="inline-block bg-white/20 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3">
              {chapter.title}
            </span>
            <h3 className="font-bold text-xl leading-tight mb-3">
              {chapter.subtitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="material-symbols-outlined text-base">
                account_tree
              </span>
              {countSections(chapter)} đề mục
              <span>·</span>
              {countLessons(chapter)} bài học
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-8 relative">
          <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-primary-850 hidden lg:block" />
          {(chapter.sections || []).map((section) => (
            <Branch
              key={section.id}
              section={section}
              activeSlug={activeSlug}
              onOpenLesson={onOpenLesson}
              progressMap={progressMap}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonMindmap({ chapters = [], activeSlug, onOpenLesson, progressMap = {} }) {
  const [searchKeyword, setSearchKeyword] = useState("");

  const visibleChapters = useMemo(
    () => filterChaptersByKeyword(chapters, searchKeyword),
    [chapters, searchKeyword]
  );

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary-600 dark:text-primary-300">
              account_tree
            </span>
          </div>
          <h2 className="font-bold text-2xl text-slate-900 dark:text-primary-100">
            Sơ đồ tư duy bài học
          </h2>
        </div>

        <div className="relative w-full md:max-w-xs">
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            type="text"
            placeholder="Tìm bài học trong sơ đồ..."
            className="w-full bg-slate-50 dark:bg-[#001F28] dark:bg-primary-900/10 border border-slate-205 dark:border-primary-850 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-primary-350 rounded-full pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none"
          />
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-primary-350 text-xl">
            search
          </span>
        </div>
      </div>

      {visibleChapters.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark-elevated rounded-3xl p-10 text-center border border-dashed border-slate-350 dark:border-primary-800/40 animate-fadeIn">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-primary-650 mb-3">
            search_off
          </span>
          <p className="text-slate-500 dark:text-primary-300 text-sm">
            {searchKeyword ? `Không tìm thấy bài học khớp với "${searchKeyword}"` : "Chưa có bài học nào được cập nhật trong sơ đồ tư duy học tập."}
          </p>
        </div>
      ) : (
        visibleChapters.map((chapter) => (
          <ChapterMap
            key={chapter.id}
            chapter={chapter}
            activeSlug={activeSlug}
            onOpenLesson={onOpenLesson}
            progressMap={progressMap}
          />
        ))
      )}
    </section>
  );
}
