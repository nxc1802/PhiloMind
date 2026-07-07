import React from "react";
import { parseMarkdownToReact } from "../../components/MarkdownRenderer";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";

export function MarkdownComponent({ component, onComplete }) {
  const isCompleted = component.__isCompleted === true;

  return (
    <ComponentFrame component={component}>
      <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm dark:border-primary-850 dark:bg-[#102733]">
        <article className="prose max-w-none p-5 text-gray-800 prose-headings:text-primary-950 prose-p:leading-8 prose-li:leading-7 dark:text-primary-100 dark:prose-headings:text-primary-100 md:p-6">
          {parseMarkdownToReact(component.config.content || "")}
        </article>
      </div>
      {!isCompleted && <ContinueButton onComplete={onComplete} />}
    </ComponentFrame>
  );
}
