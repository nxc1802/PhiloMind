import React, { useMemo, useState } from "react";
import {
  MINDMAP_CHAPTERS,
  countSections,
  countLessons,
} from "../data/mindmapData";

// Mục lục tổng dạng sơ đồ tư duy, tích hợp ngay trong trang Lesson
// Bấm vào 1 nhánh -> gọi onOpenLesson(slug) để nhảy tới bài học tương ứng
// activeSlug: slug bài học đang mở -> tô đậm nhánh đó trên sơ đồ

// Lọc dữ liệu mindmap theo từ khoá; giữ đề mục/bài học khớp keyword
function filterChaptersByKeyword(chapters, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return chapters;

  const matchesKeyword = (text) =>
    text.toLowerCase().includes(normalizedKeyword);

  return chapters
    .map((chapter) => ({
      ...chapter,
      sections: chapter.sections
        .map((section) => ({
          ...section,
          lessons: section.lessons.filter((lesson) =>
            matchesKeyword(lesson.title)
          ),
        }))
        .filter(
          (section) =>
            section.lessons.length > 0 || matchesKeyword(section.title)
        ),
    }))
    .filter((chapter) => chapter.sections.length > 0);
}

// Nhánh nhỏ: 1 đề mục + danh sách bài học bên trong
function Branch({ section, activeSlug, onOpenLesson }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center pt-6 shrink-0">
        <div className="h-0.5 w-8 bg-gray-400" />
      </div>

      <div className="flex-1">
        {/* Click đề mục -> mở bài học đầu tiên của đề mục đó */}
        <button
          onClick={() => onOpenLesson(section.lessons[0]?.slug)}
          className="group inline-flex items-center gap-2 bg-white border-2 border-red-800 text-red-800 font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-red-800 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-base">topic</span>
          {section.title}
          <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity">
            arrow_forward
          </span>
        </button>

        <div className="mt-3 ml-8 space-y-2 relative">
          <div className="absolute left-0 top-0 bottom-3 w-0.5 bg-gray-300" />
          {section.lessons.map((lesson) => {
            const isActive = lesson.slug === activeSlug;
            return (
              <div key={lesson.id} className="flex items-center gap-3">
                <div className="h-0.5 w-6 bg-gray-300" />
                <button
                  onClick={() => onOpenLesson(lesson.slug)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium hover:shadow-md ${
                    isActive
                      ? "bg-red-800 text-white border-red-800 shadow-md"
                      : "bg-blue-50 hover:bg-red-800 hover:text-white text-gray-800 border-gray-200 hover:border-red-800"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-red-800 group-hover:text-white"
                    }`}
                  >
                    menu_book
                  </span>
                  {lesson.title}
                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
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
function ChapterMap({ chapter, activeSlug, onOpenLesson }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 mb-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 shrink-0">
          <div
            className={`bg-gradient-to-br ${chapter.color} text-white rounded-2xl p-6 shadow-lg lg:sticky lg:top-24`}
          >
            <span className="inline-block bg-white/20 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded mb-3">
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
          <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-gray-300 hidden lg:block" />
          {chapter.sections.map((section) => (
            <Branch
              key={section.id}
              section={section}
              activeSlug={activeSlug}
              onOpenLesson={onOpenLesson}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonMindmap({ activeSlug, onOpenLesson }) {
  const [searchKeyword, setSearchKeyword] = useState("");

  const visibleChapters = useMemo(
    () => filterChaptersByKeyword(MINDMAP_CHAPTERS, searchKeyword),
    [searchKeyword]
  );

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-red-800">
              account_tree
            </span>
            <span className="text-xs uppercase tracking-wider text-red-800 font-bold">
              Mục lục tổng
            </span>
          </div>
          <h2 className="font-bold text-2xl text-gray-900">
            Sơ đồ tư duy bài học
          </h2>
          <p className="text-gray-500 text-sm">
            Cấu trúc <strong>Chương → Đề mục → Bài học</strong>. Bấm vào bất kỳ
            nhánh nào để nhảy tới bài học bên dưới.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs">
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            type="text"
            placeholder="Tìm bài học trong sơ đồ..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-full pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none"
          />
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
        </div>
      </div>

      {visibleChapters.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300">
          <span className="material-symbols-outlined text-5xl text-gray-300">
            search_off
          </span>
          <p className="text-gray-500 mt-2">
            Không tìm thấy bài học khớp với "{searchKeyword}"
          </p>
        </div>
      ) : (
        visibleChapters.map((chapter) => (
          <ChapterMap
            key={chapter.id}
            chapter={chapter}
            activeSlug={activeSlug}
            onOpenLesson={onOpenLesson}
          />
        ))
      )}
    </section>
  );
}
