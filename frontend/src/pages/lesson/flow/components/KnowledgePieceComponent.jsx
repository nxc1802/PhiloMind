import React from "react";
import { parseMarkdownToReact } from "../../components/MarkdownRenderer";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

/**
 * KnowledgePieceComponent — "Đúc kết" / mảnh tri thức trọng tâm.
 *
 * Render một thẻ tri thức đúc kết cuối mỗi phần (nguồn gốc nhận thức,
 * nguồn gốc xã hội...). Đọc config linh hoạt vì dữ liệu có thể dùng nhiều
 * tên trường khác nhau giữa các bản seed:
 *   - Nội dung: content | text | body | summary | description
 *   - Ý chính:  points | keyPoints | takeaways | bullets | highlights
 *   - Nguồn:    source | citation
 */
export function KnowledgePieceComponent({ component, onComplete }) {
  const config = component.config || {};

  const heading = config.heading || config.title || component.title;
  const content =
    config.content ||
    config.text ||
    config.body ||
    config.summary ||
    config.description ||
    "";

  const rawPoints =
    config.points ||
    config.keyPoints ||
    config.takeaways ||
    config.bullets ||
    config.highlights ||
    [];
  const points = Array.isArray(rawPoints)
    ? rawPoints.map((p) => (typeof p === "string" ? p : p?.text || "")).filter(Boolean)
    : [];

  const source = config.source || config.citation;

  return (
    <ComponentFrame component={component}>
      <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm dark:border-primary-850 dark:bg-[#102733]">
        <div className="flex items-center gap-3 border-b border-primary-100 bg-gradient-to-r from-primary-50 via-white to-amber-50 px-5 py-4 dark:border-primary-850 dark:from-primary-950/70 dark:via-[#102733] dark:to-amber-950/25">
          <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary-650 shadow-sm dark:bg-primary-900/40 dark:text-primary-200">
            auto_stories
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
              Mảnh tri thức
            </p>
            <p className="truncate text-sm font-semibold text-slate-650 dark:text-primary-150">
              {heading || "Đúc kết nội dung trọng tâm"}
            </p>
          </div>
        </div>

        <div className="p-5">
          {content ? (
            <article className="prose max-w-none text-gray-800 prose-headings:text-primary-950 prose-p:leading-8 prose-li:leading-7 dark:text-primary-100 dark:prose-headings:text-primary-100">
              {parseMarkdownToReact(content)}
            </article>
          ) : points.length === 0 ? (
            <p className="text-slate-600 dark:text-primary-200">
              Ghi nhớ ý chính của phần vừa học trước khi tiếp tục.
            </p>
          ) : null}

          {points.length > 0 && (
            <ul className="mt-4 space-y-2">
              {points.map((point, index) => (
                <li
                  key={index}
                  className="flex min-w-0 items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-slate-800 dark:bg-primary-950/30 dark:text-primary-100"
                >
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-primary-600 dark:text-primary-300">
                    check_circle
                  </span>
                  <span className="break-words text-sm leading-6">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {source && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs italic text-slate-400 dark:border-primary-850 dark:text-primary-300">
              Nguồn: {source}
            </p>
          )}
        </div>
      </div>

      <ContinueButton onComplete={onComplete} label="Đã ghi nhớ, tiếp tục" />
    </ComponentFrame>
  );
}
