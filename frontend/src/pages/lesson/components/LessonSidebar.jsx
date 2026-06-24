import React, { useState } from "react";
import { getSlugFromTitle } from "../../../utils/slug";

const SYLLABUS_STATUS_CONFIG = {
  completed: {
    icon: "check_circle",
    className: "bg-green-50 text-green-800 border-green-200 cursor-pointer hover:bg-green-100",
  },
  active: {
    icon: "play_circle",
    className: "bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 border-red-300 font-semibold cursor-pointer hover:bg-red-100",
  },
  locked: {
    icon: "lock",
    className: "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60",
  },
};

export function LessonSidebar({ flatSyllabusItems, progressStats, lessonSlug, handleSyllabusClick, currentNodeDetails }) {
  const [showDocsDropdown, setShowDocsDropdown] = useState(false);
  const documents = currentNodeDetails?.chapter?.course?.documents || [];

  const handlePdfClick = () => {
    if (documents.length === 0) return;
    if (documents.length === 1) {
      window.open(documents[0].fileUrl, '_blank');
    } else {
      setShowDocsDropdown(!showDocsDropdown);
    }
  };

  return (
    <aside className="lg:col-span-1 text-left w-full">
      <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 overflow-hidden w-full">
        <div className="bg-primary-600 text-white p-5">
          <h3 className="font-bold text-lg mb-3">Nội dung khóa học</h3>
          <div className="h-2 bg-white dark:bg-[#002b37]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white dark:bg-[#002b37] rounded-full transition-all duration-300"
              style={{ width: `${progressStats.percentage}%` }}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">
            Đã hoàn thành {progressStats.completed}/{progressStats.total} bài học ({progressStats.percentage}%)
          </p>
        </div>

        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
          {flatSyllabusItems.map((item, index) => {
            const config = SYLLABUS_STATUS_CONFIG[item.status] || SYLLABUS_STATUS_CONFIG.locked;
            const isActiveLesson = getSlugFromTitle(item.title) === lessonSlug;
            return (
              <button
                key={index}
                onClick={() => handleSyllabusClick(item)}
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-3xl border text-left text-sm ${config.className} ${
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

        <div className="relative">
          <button
            type="button"
            disabled={documents.length === 0}
            onClick={handlePdfClick}
            className={`w-full py-3 font-semibold transition-colors flex items-center justify-center gap-2 ${
              documents.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              download
            </span>
            Tài liệu đi kèm (PDF) {documents.length > 0 ? `(${documents.length})` : ""}
          </button>
          
          {showDocsDropdown && documents.length > 1 && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-[#002b37] border border-gray-200 rounded-3xl shadow-lg z-50 overflow-hidden divide-y divide-gray-100">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-xs text-gray-700 transition-colors font-medium text-left"
                  onClick={() => setShowDocsDropdown(false)}
                >
                  <span className="material-symbols-outlined text-sm text-primary-650 dark:text-primary-300">picture_as_pdf</span>
                  <span className="truncate flex-1">{doc.fileName}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
