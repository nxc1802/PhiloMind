import React from "react";
import { parseMarkdownToReact } from "../../components/MarkdownRenderer";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function MarkdownComponent({ component, onComplete }) {
  const isCompleted = component.__isCompleted === true;

  return (
    <ComponentFrame component={component}>
      <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm dark:border-primary-850 dark:bg-[#102733]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-100 bg-gradient-to-r from-primary-50 via-white to-amber-50 px-5 py-4 dark:border-primary-850 dark:from-primary-950/70 dark:via-[#102733] dark:to-amber-950/25">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary-650 shadow-sm dark:bg-primary-900/40 dark:text-primary-200">
              menu_book
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-650 dark:text-primary-300">
                Tài liệu đọc
              </p>
              <p className="text-sm font-semibold text-slate-650 dark:text-primary-150">
                Đọc chậm, ghi nhớ các luận điểm chính.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-primary-150 bg-white px-3 py-1 text-xs font-bold text-primary-750 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-150">
            Nội dung trọng tâm
          </span>
        </div>
        <article className="prose max-w-none p-5 text-gray-800 prose-headings:text-primary-950 prose-p:leading-8 prose-li:leading-7 dark:text-primary-100 dark:prose-headings:text-primary-100 md:p-6">
          {parseMarkdownToReact(component.config.content || "")}
        </article>
      </div>
      {!isCompleted && <ContinueButton onComplete={onComplete} />}
    </ComponentFrame>
  );
}
