import React from "react";
import { getSlugFromTitle } from "../../../utils/slug";

const SYLLABUS_STATUS_CONFIG = {
  completed: {
    icon: "check_circle",
    className: "bg-green-50 text-green-800 border-green-200 cursor-pointer hover:bg-green-100",
  },
  active: {
    icon: "play_circle",
    className: "bg-red-50 text-red-800 border-red-300 font-semibold cursor-pointer hover:bg-red-100",
  },
  locked: {
    icon: "lock",
    className: "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60",
  },
};

export function LessonSidebar({ flatSyllabusItems, progressStats, lessonSlug, handleSyllabusClick }) {
  return (
    <aside className="lg:col-span-1 text-left">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden sticky top-20">
        <div className="bg-red-800 text-white p-5">
          <h3 className="font-bold text-lg mb-3">Nội dung khóa học</h3>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressStats.percentage}%` }}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">
            Đã hoàn thành {progressStats.completed}/{progressStats.total} bài học ({progressStats.percentage}%)
          </p>
        </div>

        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {flatSyllabusItems.map((item, index) => {
            const config = SYLLABUS_STATUS_CONFIG[item.status] || SYLLABUS_STATUS_CONFIG.locked;
            const isActiveLesson = getSlugFromTitle(item.title) === lessonSlug;
            return (
              <button
                key={index}
                onClick={() => handleSyllabusClick(item)}
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm ${config.className} ${
                  isActiveLesson ? "ring-2 ring-red-800 ring-offset-1 font-bold" : ""
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {config.icon}
                </span>
                <span className="flex-1 truncate">{item.title}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="w-full bg-gray-700 text-white py-3 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">
            download
          </span>
          Tài liệu đi kèm (PDF)
        </button>
      </div>
    </aside>
  );
}
